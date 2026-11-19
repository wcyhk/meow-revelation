import {formatTime} from './progression.mjs?v=story-repair-1';
const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
const button=(text,action,cls='secondary')=>{const el=node('button',cls,text);el.type='button';el.addEventListener('click',action);return el;};
const names={vigil:'巡燈',blood:'血月',abyss:'無月'};
const statuses={active:'進行中',failed:'挑戰結束',completed:'通關',abandoned:'已離場'};
const syncNames={pending:'待同步',synced:'已同步',guest:'訪客紀錄',rejected:'未通過檢查'};
const stamp=value=>new Date(value).toLocaleString('zh-HK',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});

export class PlayerUI {
  constructor(game,client){
    this.game=game;this.client=client;
    client.addEventListener('change',()=>this.status());
    this.status();
  }
  status(){
    const {client}=this;
    const name=client.user?(client.name||'守燈者-'+client.user.id.slice(0,6)):'訪客';
    const summary=document.getElementById('player-summary');
    if(summary)summary.textContent=name+' · '+(client.storageError?'紀錄儲存暫不可用':client.syncing?'正在同步':client.pending?'待同步 '+client.pending+' 局':client.user?'個人紀錄已保留':'可離線遊玩');
    const login=document.querySelector('#player-account .menu-label');
    if(login)login.textContent=client.user?'玩家帳號':'玩家登入';
    if(this.accountStatus?.isConnected)this.accountStatus.textContent=client.message||(client.user?'已登入 · '+name:'訪客成績先保存在呢個瀏覽器，登入後會合併到帳號。');
  }
  openAccount(){
    if(this.game.state!=='cover')return;
    this.game.state='account';
    const root=node('div','player-panel');
    const client=this.client;
    this.accountStatus=node('p','player-status');this.accountStatus.setAttribute('role','status');root.append(this.accountStatus);
    const message=node('p','player-message');message.setAttribute('role','status');
    const run=async(action,success)=>{try{message.textContent='處理中⋯⋯';await action();message.textContent=success??'';}catch(error){message.textContent=error.message;}};
    if(!client.configured){root.append(node('p','player-note','登入同全服排行榜暫未開放。訪客紀錄會繼續保存，之後可以合併到帳號。'));}
    else if(client.user){
      const label=node('label','player-field','排行榜暱稱');
      const input=node('input');input.id='player-nickname';input.maxLength=24;input.value=client.name||'';input.autocomplete='nickname';label.append(input);
      root.append(label,button('儲存暱稱',()=>run(()=>client.setName(input.value),'暱稱已更新。'),'primary'),
        button('立即同步',()=>run(()=>client.sync(),'已檢查待同步紀錄。')),
        button('登出此裝置',()=>run(async()=>{await client.signOut();this.game.showCover();},'')));
    }else{
      const form=node('form','player-login');
      const label=node('label','player-field','電郵');
      const email=node('input');email.id='player-email';email.type='email';email.required=true;email.autocomplete='email';email.inputMode='email';label.append(email);
      const send=node('button','primary','寄出登入郵件');send.type='submit';
      form.append(label,send);form.addEventListener('submit',event=>{event.preventDefault();run(()=>client.signIn(email.value),'已寄出登入郵件，請開啟信內連結；如信內有驗證碼，亦可喺下面輸入。');});
      const otpLabel=node('label','player-field','電郵驗證碼（如有）');
      const otp=node('input');otp.id='player-otp';otp.autocomplete='one-time-code';otp.inputMode='numeric';otp.maxLength=10;otpLabel.append(otp);
      root.append(form,otpLabel,button('驗證並登入',()=>run(()=>client.verify(email.value,otp.value.trim()),'登入完成。'),'primary'));
      if(client.config.google)root.append(button('使用 Google 登入',()=>run(()=>client.google())));
      root.append(node('p','player-note','登入後會合併呢個裝置未綁定嘅訪客挑戰。帳號已有更好成績時會保留更好嗰局。'));
      const signed=()=>{
        if(!root.isConnected||this.game.state!=='account'||this.game.ui.modal.hidden){client.removeEventListener('change',signed);return;}
        if(client.user){client.removeEventListener('change',signed);this.game.showCover();}
      };
      client.addEventListener('change',signed);
    }
    root.append(message,node('p','player-note','排行榜只公開暱稱及成績，登入電郵唔會公開。'));
    this.game.openModal({kind:'account',mark:'☾',kicker:'守燈者名冊',title:'玩家帳號',content:root,
      buttons:[button('返回入口',()=>this.game.showCover(),'primary')]});
    this.status();
  }
  openLeaderboard(){
    if(this.game.state!=='cover')return;
    this.game.state='leaderboard';
    const root=node('div','ranking-panel'),tabs=node('div','ranking-tabs'),info=node('p','player-status'),body=node('div','ranking-body');
    tabs.setAttribute('role','group');tabs.setAttribute('aria-label','排行榜難度');
    info.setAttribute('role','status');let generation=0;
    const load=async mode=>{
      const turn=++generation;
      for(const el of tabs.children)el.setAttribute('aria-pressed',String(el.dataset.mode===mode));
      info.textContent='正在讀取排行⋯⋯';body.replaceChildren();
      try{
        const result=await this.client.leaderboard(mode);
        if(turn!==generation||!root.isConnected)return;
        info.textContent=result.unavailable?(this.client.configured?'暫時未能連線，連網後可以再試。':'全服排行榜暫未開放。'):
          (result.cached?'離線快照 · ':'已更新 · ')+stamp(result.updated_at);
        if(!result.rows.length){body.append(node('p','player-note','暫時未有已完成樓層嘅成績。'));return;}
        const table=node('table','ranking-table'),head=node('thead'),header=node('tr');
        for(const label of ['名次','守燈者','完成層數','用時'])header.append(node('th',null,label));head.append(header);
        const tbody=node('tbody');
        for(const row of result.rows){
          const tr=node('tr');if(row.player_id===this.client.user?.id)tr.className='ranking-self';
          for(const value of [row.rank,row.display_name,row.highest_floor,formatTime(row.cleared_ms/1000)])tr.append(node('td',null,String(value)));
          if(row.offline)tr.children[1].append(node('small','offline-result','離線提交'));
          tbody.append(tr);
        }
        table.append(head,tbody);body.append(table);
        if(result.personal)body.prepend(node('p','ranking-personal',`你嘅最佳 · 第 ${result.personal.rank} 名 · ${result.personal.highest_floor} 層 · ${formatTime(result.personal.cleared_ms/1000)}`));
      }catch{if(turn===generation)info.textContent='暫時未能讀取排行榜。';}
    };
    for(const [mode,name] of Object.entries(names)){const el=button(name,()=>load(mode));el.dataset.mode=mode;tabs.append(el);}
    root.append(tabs,info,body,node('p','player-note','每個難度、每個帳號只顯示最佳一局。層數優先，同層比較完成該層用時。無敵模式同練習場不入榜。'));
    this.game.openModal({kind:'leaderboard',mark:'♛',kicker:'守燈者遠征',title:'遠征排行',content:root,
      buttons:[button('重新整理',()=>load([...tabs.children].find(el=>el.getAttribute('aria-pressed')==='true')?.dataset.mode??'vigil')),
        button('返回入口',()=>this.game.showCover(),'primary')]});
    load('vigil');
  }
  historyPanel(){
    const root=node('section','challenge-history'),heading=node('h3',null,'歷次挑戰'),summary=node('p','player-status'),list=node('div');
    const more=button('讀取更早紀錄',async()=>{try{more.disabled=true;await this.client.moreHistory();await load(false);}catch(error){summary.textContent=error.message;}finally{more.disabled=false;}});
    more.hidden=true;
    const load=async(refresh=true)=>{
      summary.textContent='正在讀取紀錄⋯⋯';
      try{
        const rows=await this.client.history(refresh);
        if(!root.isConnected)return;
        list.replaceChildren();
        summary.textContent=this.client.user?'本機及帳號歷史；每次先讀取最近 100 局，可再讀取更早紀錄。':'訪客紀錄只保存在此瀏覽器，登入後可以合併。';
        more.hidden=!this.client.historyMore||!navigator.onLine;
        if(!rows.length)list.append(node('p','player-note','完成一次普通挑戰後，紀錄會出現喺呢度。'));
        for(const row of rows){
          const card=node('article','history-card');card.dataset.run=row.id;
          card.append(node('strong',null,`${names[row.difficulty]} · 已完成 ${row.highest_floor} 層 · 總用時 ${formatTime(row.elapsed_ms/1000)}`),
            node('span',null,`${stamp(row.started_at)} · ${statuses[row.result_status]} · ${syncNames[row.sync_state]??'已同步'}`));
          if(row.highest_floor>0)card.append(node('span',null,'完成該層用時 · '+formatTime(row.cleared_ms/1000)));
          list.append(card);
        }
      }catch{summary.textContent='暫時未能讀取歷史紀錄。';}
    };
    root.append(heading,summary,button('同步紀錄',async()=>{await this.client.sync();await load();}),list,more);
    let actor=this.client.actor;
    const changed=()=>{
      if(!root.isConnected){this.client.removeEventListener('change',changed);return;}
      if(actor!==this.client.actor){actor=this.client.actor;load();}
    };
    this.client.addEventListener('change',changed);
    setTimeout(load,0);return root;
  }
}
