export const modes=['vigil','blood','abyss'];
export const ruleset='forest-1';
export const eligible=run=>!run.test_mode&&!run.practice&&modes.includes(run.difficulty);
export const better=(a,b)=>!b||a.highest_floor>b.highest_floor||
  a.highest_floor===b.highest_floor&&a.cleared_ms<b.cleared_ms;
const request=op=>new Promise((resolve,reject)=>{op.onsuccess=()=>resolve(op.result);op.onerror=()=>reject(op.error);});
const complete=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error??new Error('Record storage failed'));});

export class ActiveRunClock {
  constructor(){this.reset();}
  reset(){this.milliseconds=0;this.last=null;this.active=false;}
  tick(now,active){
    if(this.last!==null&&this.active&&active)this.milliseconds+=Math.max(0,now-this.last);
    this.last=now;this.active=active;
    return this.milliseconds;
  }
  pause(){this.active=false;this.last=null;}
}

export class RunStore {
  constructor({indexedDB=globalThis.indexedDB,name='meow-revelation.runs.v1'}={}){
    this.ready=new Promise((resolve,reject)=>{
      if(!indexedDB){reject(new Error('Offline record storage unavailable'));return;}
      const open=indexedDB.open(name,2);
      open.onupgradeneeded=()=>{
        const db=open.result;
        const runs=db.objectStoreNames.contains('runs')?open.transaction.objectStore('runs'):db.createObjectStore('runs',{keyPath:'id'});
        if(!runs.indexNames.contains('actor'))runs.createIndex('actor','actor_id');
        if(!runs.indexNames.contains('pending'))runs.createIndex('pending',['actor_id','sync_state']);
        if(!db.objectStoreNames.contains('meta'))db.createObjectStore('meta');
      };
      open.onsuccess=()=>{this.db=open.result;this.db.onversionchange=()=>this.db.close();resolve(this);};
      open.onerror=()=>reject(open.error);
      open.onblocked=()=>reject(new Error('Close other game tabs to update record storage'));
    });
  }
  async meta(key,value){
    await this.ready;
    const tx=this.db.transaction('meta',arguments.length>1?'readwrite':'readonly'),done=complete(tx);
    const result=await request(arguments.length>1?tx.objectStore('meta').put(value,key):tx.objectStore('meta').get(key));
    await done;return result;
  }
  async guest(){
    await this.ready;
    const tx=this.db.transaction('meta','readwrite'),done=complete(tx),meta=tx.objectStore('meta');
    let id;const get=meta.get('guest');
    get.onsuccess=()=>{id=get.result??'guest:'+crypto.randomUUID();if(!get.result)meta.put(id,'guest');};
    await done;
    return id;
  }
  async newGuest(){const id='guest:'+crypto.randomUUID();await this.meta('guest',id);return id;}
  async mutate(id,change){
    await this.ready;
    const tx=this.db.transaction('runs','readwrite'),done=complete(tx),store=tx.objectStore('runs');
    let result;
    const get=store.get(id);
    get.onsuccess=()=>{try{result=change(get.result);if(result)store.put(result);}catch(error){tx.abort();}};
    await done;return result;
  }
  async begin({id=crypto.randomUUID(),actor_id,...run}){
    if(!eligible(run))return null;
    if(actor_id.startsWith('guest:')){const owner=await this.meta('claim:'+actor_id);if(owner)actor_id='user:'+owner;}
    return this.mutate(id,old=>old??{id,actor_id,ruleset,highest_floor:0,cleared_ms:0,elapsed_ms:0,kills:0,
      result_status:'active',started_at:new Date().toISOString(),offline:false,revision:1,sync_state:actor_id.startsWith('user:')?'pending':'guest',...run});
  }
  async checkpoint(id,{floor,elapsed_ms,kills,weapon_id,branch,status='active',offline=false}){
    if(!id)return null;
    return this.mutate(id,run=>{
      if(!run||!eligible(run)||run.result_status!=='active')return run;
      const elapsed=Math.max(run.elapsed_ms,Math.round(elapsed_ms));
      if(!Number.isSafeInteger(elapsed)||elapsed>604800000)return run;
      const higher=Number.isInteger(floor)&&floor>run.highest_floor&&floor<=100;
      return {...run,highest_floor:higher?floor:run.highest_floor,cleared_ms:higher?elapsed:run.cleared_ms,
        elapsed_ms:elapsed,kills:Math.max(run.kills,Math.floor(kills??0)),
        weapon_id:higher||run.highest_floor===0?weapon_id??run.weapon_id:run.weapon_id,branch:branch??run.branch,
        result_status:status,offline:run.offline||offline,revision:run.revision+1,
        sync_state:run.actor_id.startsWith('user:')?'pending':'guest'};
    });
  }
  async all(actor){
    await this.ready;
    const tx=this.db.transaction('runs','readonly'),done=complete(tx);
    const store=tx.objectStore('runs');
    const rows=await request(actor?store.index('actor').getAll(actor):store.getAll());await done;
    return rows.sort((a,b)=>b.started_at.localeCompare(a.started_at));
  }
  async pending(actor,count=false){
    await this.ready;
    const tx=this.db.transaction('runs','readonly'),done=complete(tx),index=tx.objectStore('runs').index('pending');
    const result=await request(count?index.count([actor,'pending']):index.getAll([actor,'pending']));
    await done;return result;
  }
  async claim(guest,uid){
    await this.ready;
    const tx=this.db.transaction('meta','readwrite'),done=complete(tx),meta=tx.objectStore('meta');
    let owner;const get=meta.get('claim:'+guest);
    get.onsuccess=()=>{owner=get.result??uid;if(!get.result)meta.put(owner,'claim:'+guest);};
    await done;if(owner!==uid)return;
    const actor='user:'+uid;
    for(const row of await this.all(guest))await this.mutate(row.id,run=>run?.actor_id===guest?{...run,actor_id:actor,sync_state:'pending'}:run);
  }
  async acknowledge(id,revision){
    return this.mutate(id,run=>run&&run.revision<=revision?{...run,sync_state:'synced',sync_error:null}:run);
  }
  async recover(tabId){
    // A cold launch cannot resume a battle. Preserve its last completed floor.
    for(const row of await this.all())if(row.result_status==='active'&&row.tab_id===tabId)await this.mutate(row.id,run=>({...run,
      result_status:'abandoned',revision:run.revision+1,sync_state:run.actor_id.startsWith('user:')?'pending':'guest'}));
  }
  close(){this.db?.close();}
}
