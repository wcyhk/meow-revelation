import * as T from "../three.min.mjs";
import {LanternHall} from "./hall-scene.mjs?v=1";

const $=id=>document.getElementById(id);
const game=$("game"),view=$("view");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const ease=t=>t*t*(3-2*t);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const vector=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const buttons=Object.fromEntries([...$("controls").querySelectorAll("button")].map(button=>[button.dataset.action,button]));
const held=new Set();
const scenes=[
  {p:vector(-4.65,.64,5.7),f:vector(-2.1,.3,1.4)},
  {p:vector(-4.3,2.25,6.1),f:vector(0,3.9,-10.7)},
  {p:vector(-1.14,2.74,8.25),f:vector(0,1.8,-6.5)},
  {p:vector(0,2.53,9.20),f:vector(0,.95,-3.6)},
];
const patterns=["line","circle","rush","circle"];
const sceneState={phase:"menu",time:0,elapsed:0,locked:true,orbit:0,camYaw:0,stopped:false};
let hall,player,boss,warning,attackFx,pulseFx,impactFx,drag,look,holdId,cueLeft=0,lastTime,frameDebt=0;

class HallSound {
  constructor(){this.on=true;}
  async unlock(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{
      if(!this.context){
        const ctx=this.context=new Audio();
        this.master=ctx.createGain();
        this.master.gain.value=this.on?.29:0;
        this.master.connect(ctx.destination);
      }
      await this.context.resume();
    }catch{}
  }
  tone(hz,end,seconds,amount,kind="sine"){
    const ctx=this.context;
    if(!this.on||ctx?.state!=="running")return;
    const a=ctx.currentTime,note=ctx.createOscillator(),env=ctx.createGain();
    note.type=kind;note.frequency.setValueAtTime(hz,a);
    note.frequency.exponentialRampToValueAtTime(Math.max(14,end),a+seconds);
    env.gain.setValueAtTime(.0001,a);
    env.gain.exponentialRampToValueAtTime(amount,a+.018);
    env.gain.exponentialRampToValueAtTime(.0001,a+seconds);
    note.connect(env).connect(this.master);note.start();note.stop(a+seconds+.025);
  }
  play(name){
    switch(name){
      case "door":this.tone(73.4,73.4,2.7,.20,"triangle");this.tone(110,110,3.3,.13);break;
      case "swipe":this.tone(204,57,.17,.13,"triangle");break;
      case "bell":this.tone(587,581,1.08,.18);this.tone(831,832,.83,.12);break;
      case "warn":this.tone(104,76,.39,.20,"triangle");break;
      case "hit":this.tone(114,32,.22,.35,"triangle");this.tone(166,55,.11,.12,"sawtooth");break;
      case "roll":this.tone(152,58,.20,.12);break;
      case "heal":this.tone(220,440,.35,.14);break;
    }
  }
  toggle(){
    this.on=!this.on;
    if(this.master)this.master.gain.setTargetAtTime(this.on?.29:0,this.context.currentTime,.05);
  }
}
const sound=new HallSound();

function phase(name){
  sceneState.phase=name;sceneState.elapsed=0;game.dataset.phase=name;
  const live=name==="fight"||name==="paused";
  $("cover").hidden=name!=="menu";
  $("skip").hidden=name!=="intro";
  $("hud").hidden=!live;
  $("message").hidden=!["paused","won","lost"].includes(name);
  if(!$("message").hidden){
    $("message-title").textContent={paused:"暫停",won:"黑月退潮",lost:"潮燈熄滅"}[name];
    $("resume").hidden=name!=="paused";
    $(name==="paused"?"resume":"retry").focus({preventScroll:true});
  }
  held.clear();drag=null;look=null;holdId=null;$("stick").hidden=true;
}
function reset(){
  player={x:0,z:4.35,hp:6,flasks:3,fervor:100,dirX:0,dirZ:-1,face:1,attack:0,attackCd:0,roll:0,rollCd:0,immune:0,hit:0,walk:false,step:0,combo:0};
  boss={x:0,z:-6.65,hp:130,maxHp:130,wait:1.5,hit:0,stun:0,step:0,pattern:0,face:1};
  warning=attackFx=pulseFx=impactFx=null;cueLeft=0;sceneState.locked=true;sceneState.orbit=sceneState.camYaw=0;
  $("lock").setAttribute("aria-pressed","true");
  $("cue").hidden=true;
  updateHud();
}
function start(){
  if(!hall?.hero)return;
  void sound.unlock().then(()=>sound.play("door"));
  reset();phase(reduced.matches?"fight":"intro");
  if(reduced.matches)fightCamera(1);
}
function enterFight(){
  phase("fight");fightCamera(1);
  cue(matchMedia("(pointer: coarse)").matches?"拖動移動 · 留意地面預警":"留意地面預警",2.8);
}
function cue(message,time=1.5){
  $("cue").textContent=message;$("cue").hidden=false;cueLeft=time;
}
function bar(id,value,max){
  const fill=$(id);
  fill.style.transform="scaleX("+clamp(value/max,0,1)+")";
  fill.parentElement.setAttribute("aria-valuenow",String(Math.round(id==="boss-life"?value/max*100:value)));
}
function updateHud(){
  bar("life",player.hp,6);bar("boss-life",boss.hp,boss.maxHp);bar("fervor",player.fervor,100);
  $("flasks").textContent=player.flasks;
  buttons.roll.dataset.cooling=String(player.rollCd>0);
  buttons.pulse.dataset.cooling=String(player.fervor<65);
  buttons.heal.dataset.cooling=String(!player.flasks||player.hp===6);
}
function toggleLock(){
  if(sceneState.locked)sceneState.orbit=sceneState.camYaw;
  sceneState.locked=!sceneState.locked;
  $("lock").setAttribute("aria-pressed",String(sceneState.locked));
}
function movement(){
  const dx=(held.has("d")||held.has("arrowright")?1:0)-(held.has("a")||held.has("arrowleft")?1:0)+(drag?.x||0);
  const dz=(held.has("s")||held.has("arrowdown")?1:0)-(held.has("w")||held.has("arrowup")?1:0)+(drag?.z||0);
  const theta=sceneState.camYaw;
  const length=Math.max(1,Math.hypot(dx,dz));
  return {x:(Math.cos(theta)*dx+Math.sin(theta)*dz)/length,z:(-Math.sin(theta)*dx+Math.cos(theta)*dz)/length};
}
function move(actor,x,z){
  actor.x=clamp(actor.x+x,-6.35,6.35);
  actor.z=clamp(actor.z+z,-11.9,8.8);
}
function direction(from,to){
  const length=distance(from,to)||1;
  return {x:(to.x-from.x)/length,z:(to.z-from.z)/length};
}
function damageBoss(amount){
  boss.hp=Math.max(0,boss.hp-amount);boss.hit=.24;
  player.fervor=Math.min(100,player.fervor+12);
  impactFx={x:boss.x,z:boss.z,lift:.31,radius:1.8,left:.34,total:.34};
  sound.play("hit");
  if(boss.hp===0){
    warning=null;phase("won");sound.play("bell");
  }
}
function hurt(){
  if(player.immune>0||player.roll>0)return;
  player.hp=Math.max(0,player.hp-1);
  player.immune=.84;player.hit=.35;
  impactFx={x:player.x,z:player.z,lift:.23,radius:1.42,left:.31,total:.31};
  sound.play("hit");
  if(player.hp===0)phase("lost");
}
function action(name){
  if(sceneState.phase!=="fight")return;
  const p=player,d=direction(p,boss);
  if(name==="heal"){
    if(p.flasks===0||p.hp===6)return;
    p.flasks--;p.hp=Math.min(6,p.hp+2);sound.play("heal");
  }else if(name==="roll"){
    if(p.rollCd>0)return;
    const drift=movement();
    const way=Math.hypot(drift.x,drift.z)>.1?drift:{x:-d.x,z:-d.z};
    p.roll=.37;p.rollCd=.69;p.attack=0;p.rollX=way.x;p.rollZ=way.z;sound.play("roll");
  }else if(name==="pulse"){
    if(p.fervor<65||p.roll>0)return;
    p.fervor-=65;
    p.attackCd=Math.max(p.attackCd,.28);
    pulseFx={x:p.x,z:p.z,radius:4.0,left:.58,total:.58};
    if(distance(p,boss)<4.35){
      if(warning){warning=null;boss.wait=1.22;}
      boss.stun=.48;damageBoss(24);
    }
    sound.play("bell");
  }else if(name==="attack"&&p.attackCd<=0&&p.roll<=0){
    p.attack=.33;p.attackCd=.44;p.swing=d;p.combo=(p.combo+1)%3;sound.play("swipe");
  }
  updateHud();
}
function swing(){
  const p=player,d=p.swing;
  attackFx={x:p.x,z:p.z,lift:.52,radius:2.38,angle:Math.atan2(d.z,d.x),left:.25,total:.25};
  if(distance(p,boss)<2.73)damageBoss(p.combo===0?17:12);
}
function charge(){
  const speed=boss.hp<=boss.maxHp*.45?.77:1;
  const type=patterns[boss.pattern++%patterns.length],d=direction(boss,player);
  if(type==="line"){
    warning={type,x:boss.x,z:boss.z,dx:d.x,dz:d.z,length:14,radius:1.05,left:1.07*speed,total:1.07*speed};
    cue("直斬 · 向側面閃避");
  }else{
    const rush=type==="rush",r=rush?2.45:3.2;
    const time=(rush?1.14:1.18)*speed;
    warning={type,x:rush?player.x:boss.x,z:rush?player.z:boss.z,radius:r,left:time,total:time};
    cue(rush?"落印 · 離開紅圈":"迴斬 · 拉開距離");
  }
  sound.play("warn");
}
function resolve(w){
  if(w.type==="line"){
    const x=player.x-w.x,z=player.z-w.z,along=x*w.dx+z*w.dz;
    if(along>=-.25&&along<w.length&&Math.abs(x*w.dz-z*w.dx)<w.radius)hurt();
  }else{
    if(w.type==="rush"){
      boss.x=w.x;boss.z=w.z;
    }
    if(distance(player,w)<w.radius)hurt();
  }
  impactFx={x:w.type==="line"?w.x+w.dx*1.7:w.x,z:w.type==="line"?w.z+w.dz*1.7:w.z,radius:w.type==="line"?2.4:w.radius,left:.43,total:.43};
  sound.play("hit");
}
function tick(dt){
  const p=player,dir=movement();
  for(const timer of ["rollCd","immune","hit","attackCd"])p[timer]=Math.max(0,p[timer]-dt);
  p.walk=false;
  if(p.roll>0){
    p.roll=Math.max(0,p.roll-dt);
    move(p,p.rollX*7.6*dt,p.rollZ*7.6*dt);
    p.face=p.rollX<-.12?-1:p.rollX>.12?1:p.face;
  }else{
    const speed=p.attack>0?1.82:3.65;
    move(p,dir.x*speed*dt,dir.z*speed*dt);
    p.walk=Math.hypot(dir.x,dir.z)>.1;
    if(p.walk){p.step+=dt;p.face=dir.x<-.12?-1:dir.x>.12?1:p.face;}
    if(p.attack>0){
      const past=p.attack;p.attack=Math.max(0,p.attack-dt);
      if(past>.18&&p.attack<=.18)swing();
    }
  }
  const gap=distance(p,boss);
  if(gap>0&&gap<1.1){
    const away=direction(boss,p);move(p,away.x*(1.1-gap),away.z*(1.1-gap));
  }
  if(sceneState.phase!=="fight")return;
  if(held.has("f")||holdId!==null&&holdId!==undefined)action("attack");
  p.fervor=Math.min(100,p.fervor+dt*4.8);
  boss.hit=Math.max(0,boss.hit-dt);
  boss.stun=Math.max(0,boss.stun-dt);
  if(boss.stun===0){
    if(warning){
      warning.left-=dt;
      if(warning.left<=0){
        const w=warning;warning=null;boss.wait=boss.hp<boss.maxHp*.45?.84:1.18;resolve(w);
      }
    }else{
      boss.wait-=dt;
      const d=distance(boss,p),towards=direction(boss,p);
      boss.face=towards.x<-.14?-1:towards.x>.14?1:boss.face;
      if(d>2.55){
        const speed=boss.hp<boss.maxHp*.45?2.05:1.64;
        move(boss,towards.x*speed*dt,towards.z*speed*dt);boss.step+=dt;
      }
      if(d<8.8&&boss.wait<=0)charge();
    }
  }
  if(attackFx&&(attackFx.left-=dt)<=0)attackFx=null;
  if(pulseFx&&(pulseFx.left-=dt)<=0)pulseFx=null;
  if(impactFx&&(impactFx.left-=dt)<=0)impactFx=null;
  if(cueLeft>0&&(cueLeft-=dt)<=0)$("cue").hidden=true;
}
const desired=vector(),focus=vector(),reticle=vector();
function fightCamera(blend){
  const p=player,locked=sceneState.locked;
  const angle=locked?Math.atan2(p.x-boss.x,p.z-boss.z):sceneState.orbit;
  const delta=angle-sceneState.camYaw;
  sceneState.camYaw+=Math.atan2(Math.sin(delta),Math.cos(delta))*blend;
  const swing=Math.sin(sceneState.camYaw),depth=Math.cos(sceneState.camYaw);
  const distance=hall.phone?4.3:4.85;
  desired.set(clamp(p.x+swing*distance,-7,7),hall.phone?2.65:2.53,clamp(p.z+depth*distance,-15.4,13.1));
  if(locked){
    const d=direction(p,boss),reach=clamp(Math.hypot(p.x-boss.x,p.z-boss.z)*.66,2.2,8);
    focus.set(p.x+d.x*reach,.95,p.z+d.z*reach);
  }else focus.set(p.x-swing*4.5,.95,p.z-depth*4.5);
  hall.camera.position.lerp(desired,blend);
  hall.focus.lerp(focus,blend);
  hall.camera.lookAt(hall.focus);
  hall.camera.updateMatrixWorld();
}
function cinematic(){
  const t=sceneState.elapsed;
  if(t>=5.1){enterFight();return;}
  const elapsed=t/1.7,index=Math.min(2,Math.floor(elapsed)),mix=ease(elapsed-index);
  hall.camera.position.lerpVectors(scenes[index].p,scenes[index+1].p,mix);
  hall.focus.lerpVectors(scenes[index].f,scenes[index+1].f,mix);
  hall.camera.lookAt(hall.focus);
}
function drawActors(t){
  const p=player,b=boss,soft=reduced.matches;
  const dash=p.roll>0,walking=p.walk&&!soft;
  const frame=dash?11:p.attack>0&&p.attack<.25?3:walking?1+Math.floor(p.step*11)%2:0;
  const tilt=dash?-(1-p.roll/.37)*Math.PI*2*p.face:p.attack>0?-.21*Math.sin(p.attack/.33*Math.PI)*p.face:p.hit>0?.13*p.face:0;
  const bounce=walking?Math.abs(Math.sin(p.step*16))*.078:0;
  hall.pose(hall.hero,p,p.face,frame,1,1+(soft?0:Math.sin(t*3.3)*.018),tilt,bounce,p.hit>0);
  const y=soft?0:Math.sin(t*1.7)*.15+Math.abs(Math.sin(b.step*6.2))*.052;
  const rage=b.hp<b.maxHp*.45;
  const windup=warning?1-warning.left/warning.total:0;
  hall.pose(hall.boss,b,b.face,2,1+(rage?.055:0)+windup*.16,1+windup*.079,windup*.10,y,b.hit>0);
  hall.boss.mesh.visible=b.hp>0;
  hall.boss.shadow.visible=b.hp>0;
  hall.hero.mesh.visible=sceneState.phase!=="menu";
  hall.hero.shadow.visible=hall.hero.mesh.visible;
  hall.warningAt(warning,t);
  hall.effectAt(hall.arc,attackFx);
  hall.effectAt(hall.pulse,pulseFx);
  hall.effectAt(hall.hit,impactFx);
  if(sceneState.phase==="fight"){
    reticle.set(b.x,2.08,b.z).project(hall.camera);
    const marker=$("reticle");
    marker.hidden=!sceneState.locked||reticle.z>1||Math.abs(reticle.x)>1||Math.abs(reticle.y)>1;
    marker.style.left=((reticle.x*.5+.5)*100)+"%";
    marker.style.top=((.5-reticle.y*.5)*100)+"%";
  }
}
function frame(now){
  if(sceneState.stopped)return;
  const dt=Math.min(.12,(now-(lastTime??now))/1000);
  lastTime=now;
  sceneState.time+=dt;sceneState.elapsed+=dt;
  if(sceneState.phase==="intro")cinematic();
  if(sceneState.phase==="fight"){
    frameDebt=Math.min(.16,frameDebt+dt);
    while(frameDebt>=1/60&&sceneState.phase==="fight"){tick(1/60);frameDebt-=1/60;}
    fightCamera(1-Math.exp(-dt*6.8));updateHud();
  }else frameDebt=0;
  if(sceneState.phase==="menu"&&!reduced.matches){
    hall.camera.position.set(-5.9+Math.sin(sceneState.time*.16)*.85,2.32,8.8);
    hall.focus.set(.24,2.35,-8.3);hall.camera.lookAt(hall.focus);
  }
  drawActors(sceneState.time);
  hall.draw(sceneState.time,reduced.matches);
  requestAnimationFrame(frame);
}

$("begin").addEventListener("click",start);
$("skip").addEventListener("click",enterFight);
$("audio").addEventListener("click",()=>{
  sound.toggle();$("audio").setAttribute("aria-pressed",String(sound.on));$("audio").textContent=sound.on?"聲音開啟":"聲音關閉";
});
$("pause").addEventListener("click",()=>phase("paused"));
$("resume").addEventListener("click",()=>phase("fight"));
$("retry").addEventListener("click",()=>{reset();phase("fight");fightCamera(1);});
$("lock").addEventListener("click",toggleLock);
window.addEventListener("keydown",e=>{
  if(e.altKey||e.ctrlKey||e.metaKey)return;
  const key=e.key.toLowerCase();
  if(sceneState.phase==="intro"&&key==="enter"){e.preventDefault();enterFight();return;}
  if(key==="escape"){
    if(sceneState.phase==="fight")phase("paused");
    else if(sceneState.phase==="paused")phase("fight");
    return;
  }
  if(sceneState.phase!=="fight")return;
  if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","f"," ","e","q","r"].includes(key))e.preventDefault();
  held.add(key);
  if(!e.repeat){
    if(key==="f")action("attack");
    if(key===" ")action("roll");
    if(key==="e")action("pulse");
    if(key==="r")action("heal");
    if(key==="q")toggleLock();
  }
});
window.addEventListener("keyup",e=>held.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>{if(sceneState.phase==="fight")phase("paused");});
for(const type of ["contextmenu","selectstart","dblclick"])game.addEventListener(type,e=>e.preventDefault());
view.addEventListener("pointerdown",e=>{
  if(sceneState.phase!=="fight")return;
  e.preventDefault();
  if(e.pointerType==="mouse"){
    if(e.button===0)action("attack");
    if(e.button===2&&!sceneState.locked){look={id:e.pointerId,x:e.clientX};view.setPointerCapture(e.pointerId);}
    return;
  }
  if(drag)return;
  drag={id:e.pointerId,clientX:e.clientX,clientY:e.clientY,x:0,z:0};
  view.setPointerCapture(e.pointerId);
  const stick=$("stick");
  stick.style.left=e.clientX+"px";stick.style.top=e.clientY+"px";stick.firstElementChild.style.transform="";stick.hidden=false;
});
view.addEventListener("pointermove",e=>{
  if(look?.id===e.pointerId){
    sceneState.orbit-=(e.clientX-look.x)*.006;
    look.x=e.clientX;return;
  }
  if(drag?.id!==e.pointerId)return;
  const x=e.clientX-drag.clientX,y=e.clientY-drag.clientY,length=Math.max(35,Math.hypot(x,y));
  drag.x=x/length;drag.z=y/length;
  $("stick").firstElementChild.style.transform="translate("+drag.x*21+"px,"+drag.z*21+"px)";
});
function release(e){
  if(drag?.id===e.pointerId){drag=null;$("stick").hidden=true;}
  if(look?.id===e.pointerId)look=null;
  if(holdId===e.pointerId)holdId=null;
}
for(const event of ["pointerup","pointercancel","lostpointercapture"]){
  view.addEventListener(event,release);$("controls").addEventListener(event,release);
}
for(const [name,button] of Object.entries(buttons)){
  button.addEventListener("pointerdown",e=>{
    if(e.button!==0)return;
    e.preventDefault();
    if(name==="attack"){holdId=e.pointerId;button.setPointerCapture(e.pointerId);}
    action(name);
  });
  button.addEventListener("click",e=>{if(e.detail===0)action(name);});
}

try{
  hall=new LanternHall(view);
  hall.renderer.domElement.addEventListener("webglcontextlost",()=>{
    sceneState.stopped=true;$("loading").hidden=false;$("loading").textContent="立體畫面中斷，請重新整理頁面。";
    if(sceneState.phase==="fight")phase("paused");
  });
  await hall.addActors();
  reset();$("begin").disabled=false;$("loading").hidden=true;
  requestAnimationFrame(frame);
}catch(error){
  $("loading").textContent="未能開啟立體畫面。你可以返回主線。";
  console.error("Lantern Hall load failed",error);
}
