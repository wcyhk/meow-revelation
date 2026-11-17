const loopSeconds=64*60/135;
const stems=['requiem-grove','requiem-pressure'].map(name=>new URL('./audio/'+name+'.mp3',import.meta.url));

export class PulseScore {
  preload() {
    this.loading??=Promise.all(stems.map(async url=>{
      const response=await fetch(url);
      if(!response.ok)throw new Error('Could not load '+url.pathname);
      return response.arrayBuffer();
    })).catch(()=>{this.loading=null;return null;});
    return this.loading;
  }

  async connect(context,destination) {
    if(this.context)return;
    this.connecting??=this.begin(context,destination).finally(()=>{this.connecting=null;});
    return this.connecting;
  }

  async begin(context,destination) {
    const files=await this.preload();
    if(!files)return;
    const [grove,pressure]=await Promise.all(files.map(file=>context.decodeAudioData(file.slice(0))));
    this.loading=null;
    this.bus=context.createGain();
    this.combat=context.createGain();
    this.bus.gain.value=0;
    this.combat.gain.value=0;
    this.bus.connect(destination);
    this.combat.connect(this.bus);
    const startTime=context.currentTime+.07;
    for(const [buffer,target] of [[grove,this.bus],[pressure,this.combat]]){
      const source=context.createBufferSource();
      source.buffer=buffer;
      source.loop=true;
      source.loopEnd=Math.min(buffer.duration,loopSeconds);
      source.connect(target);
      source.start(startTime);
    }
    this.context=context;
  }

  mix(active,danger) {
    if(!this.context||(active===this.active&&danger===this.danger))return;
    const now=this.context.currentTime;
    if(active!==this.active){
      this.active=active;
      this.bus.gain.setTargetAtTime(active?.72:0,now,.055);
    }
    if(danger!==this.danger){
      this.danger=danger;
      this.combat.gain.setTargetAtTime(danger?.64:.06,now,.13);
    }
  }
}
