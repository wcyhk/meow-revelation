const databaseName='meow-revelation-music';
const storageKey=new URL('../',import.meta.url).pathname;

function storedTrack(mode,track) {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(databaseName,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('tracks');
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Music storage is busy'));
    request.onsuccess=()=>{
      const database=request.result;
      try{
        const transaction=database.transaction('tracks',mode);
        const store=transaction.objectStore('tracks');
        const operation=mode==='readwrite'?store.put(track,storageKey):store.get(storageKey);
        transaction.oncomplete=()=>{database.close();resolve(operation.result);};
        transaction.onabort=transaction.onerror=()=>{
          database.close();
          reject(transaction.error||new Error('Could not store music'));
        };
      }catch(error){database.close();reject(error);}
    };
  });
}

function discard(media) {
  if(!media)return;
  media.pause();
  const address=media.src;
  media.removeAttribute('src');
  media.load();
  URL.revokeObjectURL(address);
}

async function loadTrack(blob) {
  const media=new window.Audio();
  media.preload='auto';
  media.loop=true;
  media.src=URL.createObjectURL(blob);
  try{
    await new Promise((resolve,reject)=>{
      const done=error=>{
        clearTimeout(timeout);
        media.removeEventListener('loadeddata',loaded);
        media.removeEventListener('error',failed);
        if(error)reject(error);
        else resolve();
      };
      const loaded=()=>done();
      const failed=()=>done(new Error('Unsupported or damaged music file'));
      const timeout=setTimeout(failed,20000);
      media.addEventListener('loadeddata',loaded,{once:true});
      media.addEventListener('error',failed,{once:true});
      media.load();
    });
    return media;
  }catch(error){discard(media);throw error;}
}

export class Soundtrack {
  constructor(audio) {
    this.audio=audio;
    this.input=document.getElementById('soundtrack-file');
    this.busy=true;
    this.message='正在讀取已儲存配樂⋯⋯';
    this.input.addEventListener('change',()=>{
      const file=this.input.files[0];
      this.input.value='';
      if(file)this.importTrack(file);
    });
    document.addEventListener('visibilitychange',()=>this.sync());
    this.ready=this.restore();
  }

  get available() {return !!this.media&&!this.blocked;}

  bind(button) {
    const status=document.createElement('small');
    status.className='soundtrack-status';
    status.setAttribute('role','status');
    button.after(status);
    button.addEventListener('click',()=>{
      if(this.blocked){
        this.blocked=false;
        this.message='已儲存離線配樂 · '+this.name;
        this.paint();
        this.audio.start().catch(()=>{});
        this.audio.update();
      }else this.input.click();
    });
    this.updateButton(button);
    status.textContent=this.message;
  }

  updateButton(button) {
    button.disabled=this.busy;
    button.textContent=this.blocked?'重試背景音樂'
      :this.media?'更換背景音樂':'匯入《Infinite Requiem》';
  }

  paint() {
    for(const button of document.querySelectorAll('.soundtrack-toggle'))this.updateButton(button);
    for(const status of document.querySelectorAll('.soundtrack-status'))status.textContent=this.message;
  }

  async restore() {
    try{
      const track=await storedTrack('readonly');
      if(track?.blob){
        const media=await loadTrack(track.blob);
        this.replace(media,track.name);
      }else this.message='匯入音訊一次，戰鬥時自動循環並保存離線播放。';
    }catch{
      this.message='請匯入音訊，戰鬥時會自動循環播放。';
    }finally{
      this.busy=false;
      this.paint();
      this.audio.update();
    }
  }

  async importTrack(file) {
    if(this.busy)return;
    this.busy=true;
    this.message='正在保存背景音樂⋯⋯';
    this.paint();
    let candidate;
    try{
      candidate=await loadTrack(file);
      await storedTrack('readwrite',{blob:file,name:file.name});
      this.replace(candidate,file.name);
    }catch{
      discard(candidate);
      this.message='未能匯入，請檢查音訊格式及裝置儲存空間後重試。';
    }finally{
      this.busy=false;
      this.paint();
      this.audio.update();
    }
  }

  replace(media,name) {
    this.source?.disconnect();
    this.gain?.disconnect();
    this.source=this.gain=null;
    discard(this.media);
    this.media=media;
    this.name=name;
    this.blocked=false;
    this.pending=null;
    this.message='已儲存離線配樂 · '+name;
    media.addEventListener('error',()=>{
      if(this.media===media)this.failed();
    });
  }

  failed() {
    this.blocked=true;
    this.media?.pause();
    this.message='配樂播放中斷，請按「重試背景音樂」。';
    this.paint();
    this.audio.update();
  }

  sync(unlock=false) {
    const context=this.audio.context;
    const media=this.media;
    if(!media)return;
    if(!this.available||!context){media.pause();return;}
    const active=this.available&&this.audio.active&&!this.audio.muted
      &&!document.hidden&&context?.state==='running';
    if(!active&&!unlock&&!this.source){media.pause();return;}
    if(!this.source){
      this.source=context.createMediaElementSource(media);
      this.gain=context.createGain();
      this.gain.gain.value=0;
      this.audible=false;
      this.source.connect(this.gain).connect(this.audio.master);
    }
    if(this.audible!==active){
      this.audible=active;
      this.gain.gain.setTargetAtTime(active?.78:0,context.currentTime,.02);
    }
    if(!active&&(!unlock||document.hidden)){
      if(!this.pending)media.pause();
      return;
    }
    if(!media.paused||this.pending)return;
    const playing=media.play().catch(error=>{
      if(this.media===media&&error.name!=='AbortError')this.failed();
    }).finally(()=>{
      if(this.pending===playing){
        this.pending=null;
        this.sync();
      }
    });
    this.pending=playing;
  }
}
