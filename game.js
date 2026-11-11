
"use strict";

const $=id=>document.getElementById(id);
const stage=$("stage"),modal=$("modal");
const attackButton=document.querySelector('[data-input="attack"]');
const dashButton=document.querySelector('[data-input="dash"]');
const castButton=document.querySelector('[data-input="cast"]');
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)");
const keyboard=new Set();
const movement={w:[0,-1],a:[-1,0],s:[0,1],d:[1,0],arrowup:[0,-1],arrowleft:[-1,0],arrowdown:[0,1],arrowright:[1,0]};
const stations={
  forge:{title:"黑鬚鐵匠",x:.25,y:.49},
  gate:{title:"潮汐門",x:.50,y:.30},
  lamp:{title:"守燈人",x:.75,y:.49},
};
let currentScene,state,press=null,heldAttack=null,destination=null,toastTimer,dialogKind="",uiTimer=0;
let started=false;
const village=readVillage();
const worldHeight=720;
const worldWidth=()=>Math.max(330,Math.round(worldHeight*stage.clientWidth/Math.max(1,stage.clientHeight)));
const viewportWidth=()=>Math.min(2300,worldWidth());

function toast(message,duration=3){
  const el=$("toast");
  clearTimeout(toastTimer);
  el.textContent=message;el.hidden=!message;
  if(message)toastTimer=setTimeout(()=>el.hidden=true,duration*1000);
}
function dismiss(){
  modal.hidden=true;modal.innerHTML="";dialogKind="";
  clearInput();
}
function panel(kind,title,html){
  dialogKind=kind;clearInput();
  modal.innerHTML='<section class="panel" role="dialog" aria-modal="true" aria-label="'+title+'"><h2>'+title+'</h2>'+html+'</section>';
  modal.hidden=false;
  modal.querySelector("button:not(:disabled)")?.focus({preventScroll:true});
}
function choice(attr,id,icon,title,copy){
  return '<button class="choice" '+attr+'="'+id+'" type="button"><i aria-hidden="true">'+icon+'</i><b>'+title+'</b><span>'+copy+'</span></button>';
}
function hud(){
  const p=state.player,r=state.run;
  const hp=Math.max(0,p.hp);
  const hearts=$("hearts");
  if(hearts.dataset.value!==hp+"/"+p.maxHp){
    hearts.dataset.value=hp+"/"+p.maxHp;
    hearts.setAttribute("aria-label","生命 "+hp+"／"+p.maxHp);
    hearts.innerHTML=Array.from({length:p.maxHp},(_,i)=>'<span aria-hidden="true" class="'+(i<hp?"alive":"")+'">♥</span>').join("");
  }
  const description=names[state.location]+(state.location==="village"?"":"　"+(r?.depth||1)+"／3");
  if($("room-name").textContent!==description)$("room-name").textContent=description;
  const balance="◈ "+(state.location==="village"?village.embers:r?.embers||0);
  if($("counter").textContent!==balance)$("counter").textContent=balance;
  if(state.phase==="fight"){
    dashButton.style.setProperty("--cooldown",(p.dashCd/r.dashWait*100).toFixed(0)+"%");
    castButton.style.setProperty("--cooldown",(p.castCd/r.castWait*100).toFixed(0)+"%");
  }
  const boss=state.enemies.find(e=>e.kind==="boss");
  $("boss-meter").hidden=!boss;
  if(boss)$("boss-fill").style.transform="scaleX("+boss.hp/boss.maxHp+")";
}
function showArrival(name){
  const el=$("arrival");el.textContent=name;el.classList.remove("show");
  void el.offsetWidth;el.classList.add("show");
}
function room(location){
  $("game").dataset.location=location;
  dismiss();toast("");destination=null;
  $("stations").hidden=true;
  $("controls").hidden=false;
  currentScene.placeBackdrop(location);
  showArrival(names[location]);hud();CatAudio.scene(location==="boss"?"boss":"fight");
  if(location==="entry")toast(innerWidth<690?"拖動行走 · 輕點出鐮刀 · 翻滾避開紅圈":"WASD 移動 · 按住左鍵連擊 · 空白鍵翻滾 · Q 潮刃",5);
}
function showVillage(first=false){
  $("game").dataset.location="village";
  dismiss();clearInput();
  state=new TideRun(currentScene.scale.width,worldHeight,village,callbacks);
  $("title").hidden=true;$("hud").hidden=false;$("controls").hidden=true;
  $("stations").hidden=false;
  $("stations").innerHTML=Object.entries(stations).map(([id,s])=>{
    const tip=id==="gate"?"出征地城":id==="forge"?"強化鐮刀":"修復潮燈";
    return '<button type="button" class="station" data-station="'+id+'" style="--x:'+(s.x*100)+'%;--y:'+(s.y*100)+'%"><b>'+s.title+'</b><small>'+tip+'</small></button>';
  }).join("");
  currentScene.placeBackdrop("village");
  showArrival("潮燈村");hud();CatAudio.scene("village");
  toast(first?"守燈人：「門下嘅沉鐘響咗。帶盞燈返嚟。」":"潮燈 "+village.lamp+"／2 · 已救回 "+village.rescued+" 隻貓",4);
}
function forgeOrLamp(id){
  const isLamp=id==="lamp",level=village[id],max=isLamp?2:3,cost=(isLamp?4:5)+level*3;
  const guide=isLamp?"每修一盞潮燈，下次出征多一格生命。":"每次鍛造永久提高鐮刀傷害 17%。";
  const line=isLamp?"守燈人":"黑鬚鐵匠";
  const label=level>=max?"已達最高等級":(isLamp?"修復":"鍛造")+" · "+cost+" 潮火";
  panel(id,line,'<p>'+guide+'</p><p class="small">等級 '+level+'／'+max+'　持有 '+village.embers+' 潮火</p><div class="actions"><button class="primary" data-upgrade="'+id+'" '+(level>=max||village.embers<cost?"disabled":"")+'>'+label+'</button><button data-act="close">返回</button></div>');
}
function chooseStation(id){
  if(!started||state.phase!=="village"||!modal.hidden)return;
  if(id==="gate"){state.depart();return;}
  forgeOrLamp(id);
}
function upgrade(id){
  if(state.phase!=="village"||!["lamp","forge"].includes(id))return;
  const isLamp=id==="lamp",level=village[id],max=isLamp?2:3,cost=(isLamp?4:5)+level*3;
  if(level>=max||village.embers<cost)return;
  village.embers-=cost;village[id]++;
  if(isLamp){state.player.maxHp=4+village.lamp;state.player.hp=state.player.maxHp;}
  writeVillage(village);hud();CatAudio.play("reward");forgeOrLamp(id);
}
function reward(){
  const saved=state.run.depth===2?"你喺塌牆後救出一隻提燈小貓。打贏食燈者，就可以帶佢返村。":"沉鐘裂開，露出三枚月印。";
  panel("reward","揀一枚月印",'<p>'+saved+'</p><div class="choices">'+state.offered.map(id=>{
    const g=gifts[id];return choice("data-gift",id,g.icon,g.name,g.detail);
  }).join("")+'</div>');
}
function route(){
  panel("route","潮水分開兩道門",'<div class="choices" style="--columns:2">'+choice("data-route","reef","⌁","碎礁墓道","貼身甲蟹較多")+choice("data-route","fen","✧","白潮祭壇","要避開遠程潮彈")+'</div>');
}
function result(won,earned){
  $("controls").hidden=true;CatAudio.scene("village");toast("");
  panel("result",won?"潮燈再次亮起":"被潮水捲走",
    '<p>'+(won?"食燈者沉入深海。你帶住提燈小貓走出潮汐門。":"你醒返時已經喺岸邊。今趟帶返一半潮火。")+'</p>'+
    '<p class="small">帶返 '+earned+' 潮火 · 村落現有 '+village.embers+' 潮火</p><div class="actions"><button data-act="village" class="primary">返回潮燈村</button></div>');
}
const callbacks={room,hud,reward,route,result,toast};
function pause(){
  if(!started||!modal.hidden)return;
  panel("pause","暫停",'<p>電腦用 WASD 或方向鍵移動、左鍵或 F 攻擊、空白鍵翻滾、Q 潮刃。</p><p>手機拖動移動，點戰場或按住鐮刀掣攻擊。</p><div class="actions"><button data-act="close" class="primary">繼續</button><button data-act="audio" aria-pressed="'+!CatAudio.muted+'">'+(CatAudio.muted?"開啟聲音":"關閉聲音")+'</button>'+(state.phase==="fight"?'<button data-act="retreat">撤回村落</button>':"")+'</div>');
}
function clearInput(){
  keyboard.clear();press=null;heldAttack=null;destination=null;
  $("stick").hidden=true;
}
function begin(){
  if(started||!currentScene)return;
  CatAudio.unlock();started=true;
  showVillage(village.wins===0);
}
$("start").addEventListener("click",begin);
$("pause").addEventListener("click",pause);
$("stations").addEventListener("click",e=>{
  const id=e.target.closest("[data-station]")?.dataset.station;
  if(id)chooseStation(id);
});
modal.addEventListener("click",e=>{
  const b=e.target.closest("button");
  if(!b||b.disabled)return;
  const d=b.dataset;
  if(d.gift){state.choose(d.gift);return;}
  if(d.route&&state.phase==="route"&&["reef","fen"].includes(d.route)){state.openRoom(d.route);return;}
  if(d.upgrade){upgrade(d.upgrade);return;}
  if(d.act==="close")dismiss();
  if(d.act==="village")showVillage();
  if(d.act==="retreat"&&state.phase==="fight")state.finish(false);
  if(d.act==="audio"){
    const enabled=CatAudio.toggle();
    b.textContent=enabled?"關閉聲音":"開啟聲音";
    b.setAttribute("aria-pressed",String(enabled));
  }
});
window.addEventListener("keydown",e=>{
  if(!started||e.altKey||e.metaKey||e.ctrlKey)return;
  const key=e.key.toLowerCase();
  if(key==="escape"){if(dialogKind==="pause"||dialogKind==="forge"||dialogKind==="lamp")dismiss();else pause();return;}
  if(!modal.hidden)return;
  if(movement[key]){
    e.preventDefault();keyboard.add(key);return;
  }
  if(state.phase==="village"&&key==="e"&&!e.repeat){
    const closest=Object.entries(stations).sort(([,a],[,b])=>dist(state.player,{x:a.x*state.width,y:a.y*worldHeight})-dist(state.player,{x:b.x*state.width,y:b.y*worldHeight}))[0];
    chooseStation(closest[0]);return;
  }
  const action={f:"attack"," ":"dash",q:"cast"}[key];
  if(action){e.preventDefault();keyboard.add(key);if(!e.repeat)state.input(action);}
});
window.addEventListener("keyup",e=>keyboard.delete(e.key.toLowerCase()));
window.addEventListener("blur",clearInput);
document.addEventListener("visibilitychange",clearInput);
for(const type of ["selectstart","dblclick","contextmenu"]){
  $("game").addEventListener(type,e=>e.preventDefault());
}
for(const type of ["gesturestart","gesturechange"]){
  $("game").addEventListener(type,e=>{if(modal.hidden)e.preventDefault();},{passive:false});
}
stage.addEventListener("pointerdown",e=>{
  if(!started||!modal.hidden||e.button!==0||press)return;
  e.target.setPointerCapture?.(e.pointerId);
  if(e.pointerType==="mouse"&&state.phase==="fight"){
    heldAttack=e.pointerId;state.input("attack");return;
  }
  press={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,moved:false,mouse:e.pointerType==="mouse"};
  destination=null;
});
stage.addEventListener("pointermove",e=>{
  if(press?.id!==e.pointerId||press.mouse)return;
  const x=e.clientX-press.x,y=e.clientY-press.y,length=Math.hypot(x,y);
  press.moved ||= length>6;
  if(!press.moved)return;
  const amount=clamp((length-5)/23,0,1);
  const direction=unit(x,y);
  press.dx=direction.x*amount;press.dy=direction.y*amount;
  const stick=$("stick");
  stick.style.left=press.x+"px";stick.style.top=press.y+"px";
  stick.firstElementChild.style.transform="translate("+press.dx*25+"px,"+press.dy*25+"px)";
  stick.hidden=false;
});
function release(e){
  if(heldAttack===e.pointerId)heldAttack=null;
  if(press?.id!==e.pointerId)return;
  if(e.type==="pointerup"&&!press.moved&&modal.hidden){
    if(state.phase==="fight")state.input("attack");
    else if(state.phase==="village"){
      const r=currentScene.game.canvas.getBoundingClientRect();
      destination={x:(e.clientX-r.left)/r.width*state.width,y:clamp((e.clientY-r.top)/r.height*worldHeight,worldHeight*.28,worldHeight*.87)};
    }
  }
  press=null;$("stick").hidden=true;
}
window.addEventListener("pointerup",release);
window.addEventListener("pointercancel",release);
for(const button of $("controls").querySelectorAll("button")){
  button.addEventListener("pointerdown",e=>{
    if(!modal.hidden||e.button!==0)return;
    e.preventDefault();
    if(button===attackButton){button.setPointerCapture(e.pointerId);heldAttack=e.pointerId;}
    state.input(button.dataset.input);
  });
  button.addEventListener("click",e=>{if(e.detail===0&&modal.hidden)state.input(button.dataset.input);});
  button.addEventListener("lostpointercapture",release);
}
function intent(){
  let x=0,y=0;
  for(const key of keyboard){
    if(movement[key]){x+=movement[key][0];y+=movement[key][1];}
  }
  if(x||y){destination=null;return unit(x,y);}
  if(press?.moved)return {x:press.dx,y:press.dy};
  if(destination&&state.phase==="village"){
    if(dist(state.player,destination)>8)return unit(destination.x-state.player.x,destination.y-state.player.y);
    destination=null;
  }
  return {x:0,y:0};
}

class ShoreScene extends Phaser.Scene{
  constructor(){super("shore");}
  preload(){
    for(const id of ["village","crypt","reef","boss"])this.load.image(id,"./"+id+".webp");
    this.load.spritesheet("cast","./cast.png",{frameWidth:256,frameHeight:256});
    this.load.on("loaderror",file=>{
      $("boot-status").textContent="資源載入失敗。請重新整理頁面。";
      console.error("Asset load failed",file.key);
    });
  }
  create(){
    currentScene=this;
    this.background=this.add.image(0,0,"village").setDepth(-2);
    this.ground=this.add.graphics().setDepth(0);
    this.front=this.add.graphics().setDepth(50);
    this.playerSprite=this.add.sprite(0,0,"cast",0).setOrigin(.5,.88);
    this.actorSprites=[];
    this.placeBackdrop("village");
    const ready=["village","crypt","reef","boss","cast"].every(id=>this.textures.exists(id));
    if(!ready)return;
    $("start").disabled=false;
    $("boot-status").textContent=innerWidth<690?"單手觸控可玩 · 點一下開始":"鍵盤與滑鼠 · 亦支援手機觸控";
    this.scale.on("resize",size=>{
      if(state)state.resize(size.width);
      this.placeBackdrop(state?.location||"village");
    });
  }
  placeBackdrop(place){
    const id=place==="village"?"village":place==="reef"?"reef":place==="boss"?"boss":"crypt";
    this.background.setTexture(id);
    const frame=this.background.frame;
    const w=this.scale.width,h=this.scale.height;
    const scale=Math.max(w/frame.width,h/frame.height)*1.034;
    this.background.setScale(scale).setPosition(w/2,h/2);
    this.background.setTint(place==="fen"?0xb0e3d5:0xffffff);
  }
  update(_,delta){
    if(!started||!state)return;
    const dt=Math.min(.066,delta/1000);
    if(modal.hidden){
      state.intent=intent();
      this.timeLeft=Math.min(.09,(this.timeLeft||0)+dt);
      while(this.timeLeft>=1/60){
        const previous=state;
        state.tick(1/60,heldAttack!==null||keyboard.has("f"));
        this.timeLeft-=1/60;
        if(state!==previous||!modal.hidden)break;
      }
    }else this.timeLeft=0;
    uiTimer-=dt;
    if(uiTimer<=0){uiTimer=.065;hud();}
    this.paint();
  }
  sprite(index){
    if(!this.actorSprites[index])this.actorSprites[index]=this.add.sprite(0,0,"cast",0).setOrigin(.5,.88);
    return this.actorSprites[index];
  }
  shadow(x,y,size){
    const g=this.ground;
    g.fillStyle(0x141526,.49).fillEllipse(x+4,y+5,size*.63,size*.21);
    g.fillStyle(0x100f1a,.68).fillEllipse(x,y+2,size*.39,size*.105);
  }
  paintSprite(sprite,actor,frame,size,hero=false){
    const b=state;
    const face=Math.cos(actor.angle??0)<-.14;
    const factor=.92+actor.y/b.height*.15;
    const pulse=actor.walking?Math.sin(b.clock*23)*.045:Math.sin(b.clock*4.6+actor.x*.1)*.022;
    const jump=actor.walking&&!hero?Math.sin(b.clock*20+actor.x*.05)*3:0;
    const hit=actor.hit>0;
    const tilt=actor.warning?-.11*(1-actor.warning.left/actor.warning.total):actor.recoil>0?.11:0;
    this.shadow(actor.x,actor.y,size*factor);
    sprite.setVisible(true).setFrame(frame).setPosition(actor.x,actor.y+jump).setDepth(10+actor.y*.02);
    sprite.setDisplaySize(size*factor*(hit?1.08:1),size*factor*(1+pulse)*(hit?.95:1));
    sprite.setFlipX(face).setRotation(tilt);
    if(hit)sprite.setTintFill(0xfff3df);else sprite.clearTint();
    sprite.setAlpha(hero&&actor.invulnerable>.30&&Math.floor(b.clock*22)%2===1?.51:1);
  }
  paint(){
    const b=state,p=b.player,g=this.ground,front=this.front,t=b.clock;
    g.clear();front.clear();
    const shake=reducedMotion.matches?0:b.shake;
    this.cameras.main.setScroll(Math.sin(performance.now()*.066)*shake,Math.cos(performance.now()*.071)*shake*.65);
    for(let i=0;i<18;i++){
      const age=(t*(.105+i%5*.018)+i*.113)%1;
      const x=b.width*(.05+(i*.193)% .90)+Math.sin(t*.62+i*1.6)*13;
      const y=b.height*(.29+(i%4)*.145)-age*(18+(i%5)*11);
      const color=b.location==="village"?0xf9d589:0x99ecde;
      g.fillStyle(color,Math.sin(age*Math.PI)*(i%4===0?.54:.24)).fillCircle(x,y,1+i%3*.66);
    }
    if(b.location==="village"){
      const glow=.16+Math.sin(t*5)*.045+village.lamp*.085;
      for(let i=0;i<4;i++)g.fillStyle(0x6dd8c8,glow*(1-i/4)*.28).fillEllipse(b.width*.5,b.height*.28,36+i*29,13+i*8);
    }
    for(const e of b.enemies)if(e.hp>0&&e.warning)this.paintWarning(e.warning);
    let count=0;
    for(const e of b.enemies){
      if(e.hp<=0)continue;
      const data=enemies[e.kind];
      this.paintSprite(this.sprite(count++),e,e.kind==="boss"&&(e.warning||e.recoil>0)?9:data.frame,data.size);
      if(e.kind!=="boss"&&e.hp<e.maxHp){
        front.fillStyle(0x171320,.85).fillRect(e.x-15,e.y-data.size*.89,30,4);
        front.fillStyle(0xf58195,.95).fillRect(e.x-15,e.y-data.size*.89,30*e.hp/e.maxHp,4);
      }
    }
    if(b.phase==="village"){
      this.paintSprite(this.sprite(count++),{x:b.width*.25,y:b.height*.45},10,72);
      this.paintSprite(this.sprite(count++),{x:b.width*.75,y:b.height*.45,angle:Math.PI},7,69);
      for(let i=0;i<Math.min(village.rescued,4);i++){
        const x=b.width*(.32+(i%2)*.36),y=b.height*(.61+Math.floor(i/2)*.13);
        this.paintSprite(this.sprite(count++),{x,y,angle:i%2?Math.PI:0},7,59);
      }
    }
    for(let i=count;i<this.actorSprites.length;i++)this.actorSprites[i].setVisible(false);
    const frame=p.dash?11:p.attack?.fired?3:p.walking?1+Math.floor(t*11)%2:0;
    this.paintSprite(this.playerSprite,p,frame,90,true);
    front.fillStyle(0xc3f7dd,.80).fillTriangle(p.x,p.y+13,p.x+4,p.y+17,p.x-4,p.y+17);
    for(const bolt of b.bolts){
      const a=bolt.angle,x=bolt.x,y=bolt.y-17;
      const reach=bolt.friendly?24:14;
      front.lineStyle(bolt.friendly?8:6,bolt.friendly?0x75eddf:0xc392e7,.89);
      front.lineBetween(x-Math.cos(a)*reach,y-Math.sin(a)*reach,x,y);
      front.fillStyle(0xfff0db,.96).fillCircle(x,y,bolt.friendly?5:3.7);
    }
    for(const particle of b.particles){
      const alpha=clamp(particle.left/particle.life,0,1);
      if(particle.dust)front.fillStyle(particle.color,alpha*.32).fillEllipse(particle.x,particle.y,particle.size*1.8,particle.size*.8);
      else{
        front.lineStyle(Math.max(.5,particle.size*alpha),particle.color,alpha);
        front.lineBetween(particle.x,particle.y,particle.x-particle.vx*.035,particle.y-particle.vy*.035);
      }
    }
    for(const effect of b.effects)this.paintEffect(effect);
  }
  paintWarning(w){
    const g=this.ground,progress=clamp(1-w.left/w.total,0,1);
    if(w.shot){
      const x=w.x-Math.cos(w.angle)*180,y=w.y-Math.sin(w.angle)*180;
      g.lineStyle(4,0xe79bdd,.27+progress*.45).lineBetween(x,y,w.x,w.y);return;
    }
    if(w.lane){
      const x=w.x+Math.cos(w.angle)*w.length,y=w.y+Math.sin(w.angle)*w.length;
      g.lineStyle(w.size*2,0xd43657,.24+progress*.14).lineBetween(w.x,w.y,x,y);
      g.lineStyle(3,0xffb090,.9).lineBetween(w.x,w.y,x,y);return;
    }
    g.fillStyle(0xc42f54,.26).fillCircle(w.x,w.y,w.size);
    g.fillStyle(0xf77966,.18+progress*.19).fillCircle(w.x,w.y,w.size*progress);
    g.lineStyle(4,0x44243a,.94).strokeCircle(w.x,w.y,w.size+2);
    g.lineStyle(2,0xffa28c,.93).strokeCircle(w.x,w.y,w.size);
  }
  paintEffect(e){
    const g=this.front,a=clamp(e.left/e.life,0,1),p=1-a;
    if(e.kind==="slash"){
      const heading=e.angle-1.27+p*.82,arc=2.25-p*.68,r=e.size*(.85+p*.20);
      g.fillStyle(e.color,a*.93).lineStyle(3,0x392335,a);
      g.beginPath();g.arc(e.x,e.y,r,heading,heading+arc);
      g.arc(e.x,e.y,r*.53,heading+arc,heading,true);
      g.closePath();g.fillPath();g.strokePath();
      g.lineStyle(2,0xfff6e1,a).beginPath();
      g.arc(e.x,e.y,r-2,heading+.08,heading+arc-.08);g.strokePath();
    }else if(e.kind==="spark"){
      const r=e.size*(.46+p*.61);
      g.fillStyle(e.color,a);
      for(let i=0;i<6;i++){
        const angle=i*TAU/6+.2;
        g.fillTriangle(e.x+Math.cos(angle-.22)*r*.22,e.y+Math.sin(angle-.22)*r*.22,
          e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r,e.x+Math.cos(angle+.22)*r*.24,e.y+Math.sin(angle+.22)*r*.24);
      }
    }else if(e.kind==="lane"){
      const x=e.x+Math.cos(e.angle)*e.length,y=e.y+Math.sin(e.angle)*e.length;
      g.lineStyle(Math.max(2,31*a),e.color,a).lineBetween(e.x,e.y,x,y);
      g.lineStyle(Math.max(1,8*a),0xffdfad,a).lineBetween(e.x,e.y,x,y);
    }else{
      g.lineStyle(1+5*a,e.color,a*.9).strokeEllipse(e.x,e.y,e.size*(.7+p*1.48),e.size*(.5+p*1.07));
    }
  }
}
const engine=new Phaser.Game({
  type:Phaser.AUTO,parent:"stage",width:viewportWidth(),height:worldHeight,
  backgroundColor:"#171b2b",transparent:false,
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{antialias:true,powerPreference:"high-performance"},
  input:{mouse:false,touch:false,keyboard:false},
  scene:[ShoreScene],
});
window.addEventListener("resize",()=>engine.scale.setGameSize(viewportWidth(),worldHeight));
