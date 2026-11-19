import {createClient} from './vendor/supabase.mjs';
import {onlineConfig} from './online-config.mjs';
import {RunStore,eligible} from './challenge-records.mjs';

export class OnlinePlayer extends EventTarget {
  constructor({config=onlineConfig,store=new RunStore(),client}={}){
    super();this.config=config;this.store=store;this.user=null;this.name='';this.pending=0;this.message='';
    this.configured=!!(config.url&&config.publishableKey);
    this.authKey=this.configured?'meow.auth.'+new URL(config.url).hostname:'';
    this.client=client??(this.configured?createClient(config.url,config.publishableKey,{auth:{flowType:'pkce',
      storageKey:this.authKey,detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}}):null);
    try{this.tabId=sessionStorage.getItem('meow.run.tab')??crypto.randomUUID();sessionStorage.setItem('meow.run.tab',this.tabId);}catch{this.tabId=crypto.randomUUID();}
    this.writes=Promise.resolve();
    this.ready=this.initialize().catch(error=>{this.storageError=true;this.message='呢個瀏覽器暫時未能保存挑戰紀錄。';this.changed();});
    this.client?.auth.onAuthStateChange((event,session)=>{
      // Supabase invokes this under its auth lock. Defer requests until released.
      setTimeout(()=>this.session(session).catch(()=>this.changed()),0);
    });
    addEventListener('online',()=>this.sync());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.sync();});
    this.retry=setInterval(()=>{if(!document.hidden&&this.pending)this.sync();},30000);
  }
  changed(){this.dispatchEvent(new Event('change'));}
  async initialize(){
    await this.store.ready;this.guestId=await this.store.guest();await this.store.recover(this.tabId);
    if(this.client){
      // Restore the local owner immediately. Expired credentials must not delay
      // saving a new offline challenge while the SDK tries to refresh online.
      let cached=null;try{cached=JSON.parse(localStorage.getItem(this.authKey));}catch{}
      if(cached?.user)await this.session(cached);
      this.client.auth.getSession().then(({data})=>this.session(data.session)).catch(()=>{});
    }
    await this.count();this.changed();
  }
  async session(session){
    const turn=this.sessionTurn=(this.sessionTurn??0)+1;
    if(!this.guestId)await this.store.ready.then(async()=>{this.guestId=await this.store.guest();});
    const previous=this.user?.id;
    this.accessToken=session?.access_token??null;
    this.user=session?.user??null;
    if(this.user?.is_anonymous)this.user=null;
    if(this.user){
      const uid=this.user.id;
      await this.store.claim(this.guestId,uid);
      if(turn!==this.sessionTurn)return;
      if(previous!==this.user.id){this.remoteHistory=[];this.historyOffset=0;this.historyMore=false;this.name='';}
      if(navigator.onLine){
        const version=this.nameVersion??0;
        this.client.from('meow_profiles').select('display_name').eq('player_id',uid).maybeSingle()
          .abortSignal(AbortSignal.timeout(15000)).then(({data})=>{
            if(data&&turn===this.sessionTurn&&version===(this.nameVersion??0)){this.name=data.display_name;this.changed();}
          }).catch(()=>{});
      }
      this.sync();
    }else if(previous){this.remoteHistory=[];this.historyOffset=0;this.historyMore=false;this.name='';this.guestId=await this.store.newGuest();}
    await this.count();this.changed();
  }
  get actor(){return this.user?'user:'+this.user.id:this.guestId;}
  async count(){
    this.pending=await this.store.pending(this.actor,true);
  }
  write(task){
    this.writes=this.writes.catch(()=>{}).then(async()=>{await this.ready;if(this.storageError)return;await task();await this.count();this.changed();this.sync();})
      .catch(()=>{this.message='未能保存最新紀錄，請檢查瀏覽器儲存空間。';this.changed();});
    return this.writes;
  }
  begin(id,run){
    if(!eligible(run))return Promise.resolve();
    const actor=this.actor;
    return this.write(()=>this.store.begin({...run,id,actor_id:actor??this.actor,tab_id:this.tabId,offline:!navigator.onLine}));
  }
  checkpoint(id,patch){return this.write(()=>this.store.checkpoint(id,{...patch,offline:!navigator.onLine}));}
  async sync(){
    if(!this.client||!this.user||!navigator.onLine||this.syncing||this.storageError||!this.guestId)return;
    const uid=this.user.id;
    const token=this.accessToken;
    this.syncing=true;this.changed();
    try{
      const pending=await this.store.pending('user:'+uid);
      for(const run of pending){
        if(this.user?.id!==uid||!navigator.onLine)break;
        const {actor_id,sync_state,sync_error,tab_id,...payload}=run;
        const {data,error}=await this.client.rpc('meow_submit_run',{p_run:payload}).setHeader('Authorization','Bearer '+token).abortSignal(AbortSignal.timeout(15000));
        if(error){
          if(['22023','23514','23502','22P02'].includes(error.code)){
            await this.store.mutate(run.id,current=>current?.revision===run.revision?{...current,sync_state:'rejected'}:current);
            this.message='部分紀錄未通過檢查，已保留喺個人歷史。';continue;
          }
          this.message='暫時未能同步，挑戰紀錄已保留，稍後會再試。';break;
        }
        await this.store.acknowledge(run.id,data.revision);
      }
    }catch{this.message='暫時未能同步，挑戰紀錄已保留，稍後會再試。';}
    finally{this.syncing=false;await this.count();this.changed();}
  }
  async signIn(email){
    if(!this.client||!navigator.onLine)throw new Error('請連網後再登入；訪客遊玩同紀錄不受影響。');
    const {error}=await this.client.auth.signInWithOtp({email,options:{emailRedirectTo:new URL('../',import.meta.url).href}});
    if(error)throw new Error('暫時未能寄出登入郵件，請稍後再試。');
  }
  async verify(email,token){
    const {error}=await this.client.auth.verifyOtp({email,token,type:'email'});
    if(error)throw new Error('驗證碼無效或已過期，請重新確認。');
  }
  async google(){
    if(!navigator.onLine)throw new Error('請連網後再登入。');
    await this.writes;
    const {error}=await this.client.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('../',import.meta.url).href}});
    if(error)throw new Error('暫時未能開啟 Google 登入。');
  }
  async signOut(){
    const {error}=await this.client.auth.signOut({scope:'local'});
    if(error)throw new Error('暫時未能登出，請連網後再試。');
    await this.session(null);
  }
  async setName(name){
    const {data,error}=await this.client.rpc('meow_set_name',{p_name:name});
    if(error)throw new Error('未能儲存暱稱，請使用 1 至 24 個字並稍後再試。');
    this.nameVersion=(this.nameVersion??0)+1;this.name=data;this.changed();
  }
  async history(refresh=false){
    await this.ready;await this.writes;
    const uid=this.user?.id;
    const actor=this.actor;
    if(refresh&&uid&&navigator.onLine&&this.client){
      const {data,error}=await this.client.from('meow_runs').select('*').eq('player_id',uid).order('started_at',{ascending:false}).order('id',{ascending:false}).range(0,99);
      if(!error&&this.user?.id===uid){this.remoteHistory=data;this.historyOffset=data.length;this.historyMore=data.length===100;await this.store.meta('history:'+uid,data);}
    }
    if(this.user?.id!==uid||this.actor!==actor)return this.history(false);
    const local=await this.store.all(actor);
    const remote=uid?(this.remoteHistory??await this.store.meta('history:'+uid)??[]):[];
    const rows=new Map(remote.map(run=>[run.id,{...run,sync_state:'synced'}]));
    for(const row of local)if(!rows.has(row.id)||rows.get(row.id).revision<=row.revision)rows.set(row.id,row);
    if(this.user?.id!==uid||this.actor!==actor)return this.history(false);
    return [...rows.values()].sort((a,b)=>b.started_at.localeCompare(a.started_at));
  }
  async leaderboard(mode){
    await this.ready;
    const key='board:'+this.config.url+':'+mode;
    const cached=await this.store.meta(key);
    if(!this.client||!navigator.onLine)return cached?{...cached,cached:true}:{rows:[],cached:true,unavailable:true};
    const uid=this.user?.id;
    try{
      const {data,error}=await this.client.rpc('meow_leaderboard',{p_difficulty:mode,p_limit:100}).abortSignal(AbortSignal.timeout(15000));
      if(error)throw error;
      // The shared offline snapshot must never cache another account's private rank.
      const publicBoard={...data,personal:null};
      await this.store.meta(key,publicBoard);
      return {...data,personal:this.user?.id===uid?data.personal:null,cached:false};
    }catch{return cached?{...cached,cached:true}:{rows:[],cached:true,unavailable:true};}
  }
  async moreHistory(){
    const uid=this.user?.id;
    if(!uid||!this.client||!navigator.onLine||!this.historyMore)return;
    const offset=this.historyOffset??0;
    const {data,error}=await this.client.from('meow_runs').select('*').eq('player_id',uid)
      .order('started_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+99);
    if(error)throw new Error('暫時未能讀取更早紀錄。');
    if(this.user?.id!==uid)return;
    this.remoteHistory=[...new Map([...(this.remoteHistory??[]),...data].map(row=>[row.id,row])).values()];
    this.historyOffset=offset+data.length;this.historyMore=data.length===100;
    await this.store.meta('history:'+uid,this.remoteHistory);
  }
}
