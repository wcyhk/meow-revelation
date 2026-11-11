
"use strict";

const CatAudio=(()=>{
  let ctx,mix,music,fx,noise,next=0,step=0,mode="village",muted=false;
  const palette=[ [62,0,69,65,0,64,0,60], [58,0,65,62,0,60,0,57], [55,0,62,65,0,67,0,64], [57,0,64,61,0,64,67,0] ];
  const roots=[38,34,31,33];
  const hz=n=>440*2**((n-69)/12);
  function unlock(){
    if(!ctx){
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      ctx=new Audio();
      mix=ctx.createGain();music=ctx.createGain();fx=ctx.createGain();
      music.gain.value=.48;fx.gain.value=.78;
      music.connect(mix);fx.connect(mix);
      const limit=ctx.createDynamicsCompressor();mix.connect(limit).connect(ctx.destination);
      noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
      const data=noise.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      next=ctx.currentTime+.04;
      setInterval(schedule,53);
    }
    volume();
    if(ctx.state!=="running")ctx.resume().catch(()=>{});
  }
  function volume(){
    if(ctx)mix.gain.setTargetAtTime(muted||document.hidden?0:.64,ctx.currentTime,.05);
  }
  function note(bus,t,f,end,duration,amp,wave="sine",attack=.008){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=wave;o.frequency.setValueAtTime(f,t);
    o.frequency.exponentialRampToValueAtTime(end,t+duration);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(amp,t+attack);
    g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g).connect(bus);o.start(t);o.stop(t+duration+.016);
  }
  function brush(bus,t,f,duration,amp,sweep=.4,q=1){
    const n=ctx.createBufferSource(),g=ctx.createGain(),b=ctx.createBiquadFilter();
    n.buffer=noise;b.type="bandpass";b.Q.value=q;
    b.frequency.setValueAtTime(f,t);b.frequency.exponentialRampToValueAtTime(f*sweep,t+duration);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(amp,t+.009);
    g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    n.connect(b).connect(g).connect(bus);n.start(t,Math.random()*.5,duration);
  }
  function schedule(){
    if(ctx.state!=="running"||document.hidden||muted)return;
    const now=ctx.currentTime;
    if(next<now)next=now+.03;
    while(next<now+.16){
      const beat=step%8,measure=Math.floor(step/8)%4,root=roots[measure],combat=mode!=="village";
      const melody=palette[measure][beat];
      if(melody){
        const f=hz(melody);
        note(music,next,f,f*.997,.52,combat?.083:.117,"triangle");
        note(music,next+.018,f*2.001,f*2,.25,.045);
        note(music,next+.137,f,f,.39,.022);
      }
      if(beat===0){
        const f=hz(root);note(music,next,f,f,2.18,.108,"triangle",.16);
        note(music,next,f*1.498,f*1.5,2.04,.034,"sine",.30);
      }
      if(combat&&(beat===0||beat===4||mode==="boss"&&beat===6)){
        note(music,next,112,43,.22,.27);brush(music,next,410,.18,.18);
      }
      if(combat&&(beat===2||beat===5||beat===7))brush(music,next,mode==="fen"?3400:2100,.088,beat===2?.16:.084,.68,1.8);
      if(mode==="fen"&&beat===3)note(music,next,hz(root+36),hz(root+36)*.996,.82,.058,"sine",.09);
      if(mode==="reef"&&beat===5)note(music,next,hz(root+7),hz(root+7),.35,.11,"triangle",.022);
      if(mode==="boss"&&beat%2===1)note(music,next,hz(root+12),hz(root+12),.15,.095,"triangle");
      next+=mode==="village"?.335:.262;step++;
    }
  }
  const sounds={
    swipe:[2700,.12,.26,.36,1.1,288,96,.11,.085],
    hit:[1850,.17,.46,.45,1.3,162,49,.20,.40],
    heavy:[1120,.245,.57,.32,1.0,143,35,.30,.62],
    dash:[860,.19,.31,.45,.88,115,50,.16,.11],
    cast:[3550,.28,.28,.57,3.3,720,210,.29,.22],
    hurt:[660,.23,.49,.33,1.0,187,43,.26,.44],
    warn:[640,.23,.10,1.33,6,184,205,.28,.19],
    slam:[410,.31,.57,.29,1.0,121,34,.33,.54],
  };
  function play(id){
    if(!ctx||ctx.state!=="running"||muted||document.hidden)return;
    const t=ctx.currentTime+.008,s=sounds[id];
    if(s){brush(fx,t,...s.slice(0,5));note(fx,t,...s.slice(5),"triangle");return;}
    const pitches=id==="reward"?[62,65,69,74]:[38,45,50];
    pitches.forEach((n,i)=>note(fx,t+i*.065,hz(n),hz(n),.52,.16,"triangle"));
  }
  document.addEventListener("visibilitychange",volume);
  return {unlock,play,scene:name=>mode=name,toggle(){muted=!muted;volume();return !muted;},get muted(){return muted;}};
})();
