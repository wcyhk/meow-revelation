const beatSeconds=60/135;
const loopSeconds=beatSeconds*64;
const beatWindow=.095;
const stems=['requiem-grove','requiem-pressure'].map(name=>new URL('./audio/'+name+'.mp3',import.meta.url));

export function readBeat(seconds) {
  if(seconds<0)return null;
  const beats=seconds/beatSeconds;
  const phase=beats-Math.floor(beats);
  return {phase,beat:Math.floor(beats)%4,onBeat:Math.min(phase,1-phase)*beatSeconds<=beatWindow};
}

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
    this.epoch=context.currentTime+.07;
    for(const [buffer,target] of [[grove,this.bus],[pressure,this.combat]]){
      const source=context.createBufferSource();
      source.buffer=buffer;
      source.loop=true;
      source.loopEnd=Math.min(buffer.duration,loopSeconds);
      source.connect(target);
      source.start(this.epoch);
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

  beatAt(stamp=performance.now()) {
    const context=this.context;
    if(!this.active||context?.state!=='running')return null;
    if(stamp>performance.timeOrigin)stamp-=performance.timeOrigin;
    const output=context.getOutputTimestamp?.();
    const time=output?.performanceTime>0
      ?output.contextTime+(stamp-output.performanceTime)/1000
      :context.currentTime-(context.baseLatency||0)-(context.outputLatency||0)+(stamp-performance.now())/1000;
    return readBeat(time-this.epoch);
  }
}
