
"use strict";

const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(n,b));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const unit=(x,y)=>{const l=Math.hypot(x,y)||1;return {x:x/l,y:y/l};};
const weapons={
  scythe:{name:"潮鐮",icon:"☾",detail:"均衡橫掃，第三擊重斬",range:1,power:1,speed:1,arc:.32,tint:0xffe9d2},
  fang:{name:"幽牙",icon:"✦",detail:"出手最快，貼近敵人連刺",range:.76,power:.75,speed:.72,arc:.48,tint:0xb0e8ed},
  anchor:{name:"沉錨",icon:"⬥",detail:"揮擊較慢，範圍同威力更大",range:1.27,power:1.36,speed:1.38,arc:.13,tint:0xffc589},
};
const spells={
  wave:{name:"潮刃",icon:"✧",detail:"發出穿過敵人嘅月刃"},
  brand:{name:"霧印",icon:"◉",detail:"喺敵人腳下引爆一圈潮火"},
};
const names={village:"潮燈村",entry:"沉鐘之門",reef:"碎礁墓道",fen:"白潮祭壇",boss:"食燈者巢穴"};
const gifts={
  claw:{name:"赤月爪",icon:"☾",detail:"武器傷害提高 32%",apply:r=>r.power*=1.32},
  mist:{name:"薄霧步",icon:"≋",detail:"翻滾冷卻縮短 35%",apply:r=>r.dashWait*=.65},
  shell:{name:"蛻殼",icon:"◈",detail:"增加一格生命上限並回滿",apply:(r,p)=>{p.maxHp++;p.hp=p.maxHp;}},
  tide:{name:"雙生潮",icon:"✧",detail:"咒術傷害提高，冷卻縮短",apply:r=>{r.spell*=1.65;r.castWait*=.73;}},
  bell:{name:"收魂鈴",icon:"♢",detail:"之後每次清場回復一格生命",apply:r=>r.healOnClear=true},
  hook:{name:"捕月鉤",icon:"⌁",detail:"武器範圍擴大 35%",apply:r=>r.range*=1.35},
};
const enemies={
  rat:{hp:39,speed:116,reach:61,charge:.49,rest:.62,frame:4,size:64,color:0x9dc3cc},
  witch:{hp:51,speed:71,reach:275,charge:.73,rest:1.05,frame:5,size:74,color:0xcc9ddd},
  crab:{hp:92,speed:86,reach:92,charge:.62,rest:.84,frame:6,size:83,color:0xf2a17d},
  boss:{hp:495,speed:63,reach:350,charge:.83,rest:.89,frame:8,size:144,color:0x7bd4ca},
};
function seedRandom(seed){
  return ()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  };
}
function readVillage(){
  let data;
  try{data=JSON.parse(localStorage.getItem("nine-tides-v1"));}catch{}
  const int=(key,max,start=0)=>Number.isInteger(data?.[key])?clamp(data[key],0,max):start;
  return {
    version:2,embers:int("embers",99999),rescued:int("rescued",99),lamp:int("lamp",2),
    forge:int("forge",3),wins:int("wins",999),day:Math.max(1,int("day",9999,1)),
    food:int("food",99,3),hunger:int("hunger",100,15),faith:int("faith",100,64),
    devotion:int("devotion",99,2),garden:int("garden",2),shrine:int("shrine",1),
    blessing:int("blessing",1),sermonDay:int("sermonDay",9999),
  };
}
function villageDay(v,win){
  v.day=Math.min(9999,v.day+1);
  v.food=Math.min(99,v.food+1+v.garden*2);
  v.hunger=Math.min(100,v.hunger+18+Math.min(14,v.rescued*2));
  v.faith=clamp(v.faith+(win?11:-5)-(v.hunger>=66?12:0),0,100);
  if(v.shrine)v.devotion=Math.min(99,v.devotion+1+Math.floor(v.faith/25)+Math.min(4,v.rescued));
}
function writeVillage(village){
  try{localStorage.setItem("nine-tides-v1",JSON.stringify(village));}catch{}
}

class TideRun{
  constructor(width,height,village,callbacks){
    Object.assign(this,{width,height,village,callbacks});
    this.phase="village";
    this.location="village";
    this.player={x:width*.50,y:height*.70,angle:-Math.PI/2,hp:4+village.lamp,maxHp:4+village.lamp,attackCd:0,castCd:0,dashCd:0,invulnerable:0};
    this.enemies=[];this.bolts=[];this.particles=[];this.effects=[];
    this.clock=0;this.freeze=0;this.shake=0;this.intent={x:0,y:0};this.combo=0;this.comboUntil=0;
  }
  resize(width){
    const ratio=width/this.width;
    for(const item of [this.player,...this.enemies,...this.bolts,...this.particles,...this.effects]){
      item.x*=ratio;
      if(item.warning)item.warning.x*=ratio;
    }
    this.width=width;
  }
  depart(weapon="scythe",spell="wave"){
    if(this.phase!=="village"||!weapons[weapon]||!spells[spell])return;
    const seed=Date.now()>>>0;
    this.random=seedRandom(seed);
    this.run={seed,depth:0,embers:0,rescued:0,weapon,invocation:spell,power:1+this.village.forge*.17,spell:1,range:1,dashWait:.78,castWait:1.65,chosen:[],healOnClear:false};
    this.player.maxHp=4+this.village.lamp+this.village.blessing;
    this.player.hp=this.player.maxHp;
    this.player.fervor=3;
    this.village.blessing=0;
    writeVillage(this.village);
    this.openRoom("entry");
  }
  openRoom(location){
    this.location=location;this.phase="fight";this.run.depth++;
    this.bolts=[];this.particles=[];this.effects=[];
    this.freeze=0;this.shake=0;this.comboUntil=0;this.roomTime=0;
    this.intro=location==="boss"?.76:.21;
    this.bufferDash=this.bufferCast=this.bufferAttack=0;
    const p=this.player;
    p.x=this.width*.5;p.y=this.height*.75;p.angle=-Math.PI/2;
    p.attackCd=0;p.castCd=0;p.dashCd=0;p.attack=null;p.dash=null;p.invulnerable=.28;
    p.fervor=Math.max(2,p.fervor||0);
    const rooms={
      entry:[["rat","rat","witch"],["rat","witch","rat"],["witch","rat","rat"]],
      reef:[["crab","rat","crab","rat"],["rat","crab","witch","crab"]],
      fen:[["witch","witch","rat","crab"],["witch","rat","witch","witch"]],
      boss:[["boss"]],
    };
    const waves=rooms[location];
    const lineup=waves[Math.floor(this.random()*waves.length)];
    this.enemies=lineup.map((kind,i)=>this.makeEnemy(kind,this.width*(lineup.length===1?.5:.21+i*.58/(lineup.length-1)),this.height*(kind==="boss"?.34:.32+this.random()*.09),.72+i*.18));
    this.callbacks.room(location);
    CatAudio.play("door");
  }
  makeEnemy(kind,x,y,wait){
    const maxHp=enemies[kind].hp;
    return {kind,x,y,maxHp,hp:maxHp,wait,angle:Math.PI*.5,hit:0,recoil:0,warning:null,knockX:0,knockY:0,strikes:0};
  }
  move(p,x,y){
    p.x=clamp(x,26,this.width-26);
    p.y=clamp(y,this.height*.27,this.height*.88);
  }
  target(range){
    const p=this.player;
    return this.enemies.filter(e=>e.hp>0&&dist(p,e)<=range).sort((a,b)=>dist(p,a)-dist(p,b))[0];
  }
  input(name){
    if(this.phase!=="fight")return;
    if(this.intro>0){
      if(name==="cast")this.bufferCast=this.clock+.22;
      if(name==="attack")this.bufferAttack=this.clock+.22;
      return;
    }
    const p=this.player,r=this.run;
    if(name==="dash"){
      if(p.dashCd>0){if(p.dashCd<.15)this.bufferDash=this.clock+.16;return;}
      const d=this.intent.x||this.intent.y?unit(this.intent.x,this.intent.y):{x:Math.cos(p.angle),y:Math.sin(p.angle)};
      p.angle=Math.atan2(d.y,d.x);
      p.dash={...d,left:.20};p.invulnerable=.27;p.dashCd=r.dashWait;p.attack=null;
      this.burst(p.x,p.y,0xa9b6c0,14,112,true);
      this.effect("ring",p.x,p.y,0x97d8d8,.27,45);
      CatAudio.play("dash");
      return;
    }
    if(p.dash){
      if(name==="cast")this.bufferCast=this.clock+.24;
      else this.bufferAttack=this.clock+.24;
      return;
    }
    if(name==="cast"){
      if(p.castCd>0){if(p.castCd<.16)this.bufferCast=this.clock+.17;return;}
      if(p.fervor<1){this.callbacks.toast("潮力不足。用武器命中敵人可以補充。",1.5);return;}
      const e=this.target(420);
      if(e)p.angle=Math.atan2(e.y-p.y,e.x-p.x);
      const angle=p.angle;
      p.fervor-=1;p.castCd=r.castWait;
      this.effect("spark",p.x,p.y-18,0x86f7df,.26,28);
      if(r.invocation==="brand"){
        const x=e?.x??clamp(p.x+Math.cos(angle)*145,30,this.width-30);
        const y=e?.y??clamp(p.y+Math.sin(angle)*145,this.height*.26,this.height*.88);
        this.effect("sigil",x,y,0xbd99fb,.59,100,angle);
        let hits=0;
        for(const enemy of this.enemies){
          if(enemy.hp>0&&dist(enemy,{x,y})<=100){
            this.damage(enemy,32*r.spell,Math.atan2(enemy.y-y,enemy.x-x),true,hits===0,true);
            hits++;
          }
        }
      }else{
        this.bolts.push({x:p.x+Math.cos(angle)*17,y:p.y+Math.sin(angle)*17,angle,speed:645,time:.69,friendly:true,damage:40*r.spell,seen:new Set(),size:15});
      }
      CatAudio.play("cast");
      return;
    }
    if(p.attackCd>0){if(p.attackCd<.15)this.bufferAttack=this.clock+.16;return;}
    const weapon=weapons[r.weapon];
    const e=this.target(165*r.range*weapon.range);
    if(e)p.angle=Math.atan2(e.y-p.y,e.x-p.x);
    this.combo=this.clock<this.comboUntil?(this.combo+1)%3:0;
    this.comboUntil=this.clock+.66;
    const heavy=this.combo===2;
    p.attack={left:(heavy?.31:.22)*weapon.speed,impact:(heavy?.21:.15)*weapon.speed,angle:p.angle,fired:false,heavy};
    p.attackCd=(heavy?.35:.237)*weapon.speed;
    CatAudio.play("swipe");
  }
  strike(attack){
    const p=this.player,r=this.run;
    const dx=Math.cos(attack.angle),dy=Math.sin(attack.angle);
    const weapon=weapons[r.weapon];
    const range=(attack.heavy?129:103)*r.range*weapon.range;
    this.move(p,p.x+dx*(attack.heavy?22:11),p.y+dy*(attack.heavy?22:11));
    this.effect("slash",p.x,p.y-16,attack.heavy?0xffb88a:weapon.tint,.24,range*.91,attack.angle);
    let landed=false;
    for(const e of this.enemies){
      const x=e.x-p.x,y=e.y-p.y,d=Math.hypot(x,y);
      if(e.hp>0&&d<=range&&(d<24||(x*dx+y*dy)/d>weapon.arc)){
        this.damage(e,(attack.heavy?37:23)*r.power*weapon.power,attack.angle,attack.heavy,!landed);
        landed=true;
      }
    }
  }
  damage(e,amount,angle,heavy,loud=true,magic=false){
    const dealt=Math.min(e.hp,amount);
    e.hp=Math.max(0,e.hp-amount);e.hit=.115;
    if(!magic)this.player.fervor=Math.min(5,this.player.fervor+.30);
    this.effects.push({kind:"number",x:e.x,y:e.y-(e.kind==="boss"?94:53),text:String(Math.ceil(dealt)),color:heavy?0xffcc8e:0xfff0d8,left:.57,life:.57});
    if(e.kind!=="boss"){
      e.knockX=Math.cos(angle)*(heavy?315:180);e.knockY=Math.sin(angle)*(heavy?315:180);
      if(e.warning){e.warning=null;e.wait=.3;}
    }
    const color=enemies[e.kind].color;
    this.effect("spark",e.x,e.y-(e.kind==="boss"?48:23),heavy?0xffdb91:0xf7e4c5,.17,heavy?33:20);
    this.burst(e.x,e.y-(e.kind==="boss"?43:19),color,heavy?18:9,heavy?230:152);
    if(loud){
      this.freeze=Math.max(this.freeze,heavy?.055:.027);this.shake=Math.max(this.shake,heavy?7:3.2);
      CatAudio.play(heavy?"heavy":"hit");
    }
    if(e.hp===0){
      this.burst(e.x,e.y-15,color,e.kind==="boss"?35:14,175,true);
      this.effect("ring",e.x,e.y,color,.38,e.kind==="boss"?132:40);
      this.run.embers+=e.kind==="boss"?10:e.kind==="crab"?2:1;
      this.player.fervor=Math.min(5,this.player.fervor+.78);
      this.callbacks.hud();
    }
  }
  hurt(){
    const p=this.player;
    if(p.invulnerable>0)return;
    p.hp--;p.invulnerable=.68;p.attack=null;this.hurtFlash=.38;
    this.shake=8;this.freeze=.052;
    this.burst(p.x,p.y-18,0xf792a3,16,175);
    this.effect("ring",p.x,p.y,0xfa657f,.28,49);
    CatAudio.play("hurt");
    this.callbacks.hud();
    if(p.hp<=0)this.finish(false);
  }
  effect(kind,x,y,color,life,size,angle=0){
    this.effects.push({kind,x,y,color,left:life,life,size,angle});
  }
  burst(x,y,color,count,speed,dust=false){
    for(let i=0;i<count;i++){
      const angle=Math.random()*TAU,length=speed*(.35+Math.random()*.65),life=(dust?.38:.24)*(.62+Math.random()*.72);
      this.particles.push({x,y,vx:Math.cos(angle)*length,vy:Math.sin(angle)*length,color,left:life,life,size:2+Math.random()*(dust?6:3),dust});
    }
    if(this.particles.length>140)this.particles.splice(0,this.particles.length-140);
  }
  warning(e,p){
    const boss=e.kind==="boss";
    const witch=e.kind==="witch";
    const lane=boss&&e.enraged&&e.strikes%2===0;
    e.angle=Math.atan2(p.y-e.y,p.x-e.x);
    e.warning={
      x:lane?e.x:p.x,y:lane?e.y:p.y,angle:e.angle,lane,shot:witch,
      size:boss?(lane?41:e.enraged?104:89):e.kind==="crab"?70:47,
      length:lane?Math.min(540,dist(p,e)+125):0,
      left:enemies[e.kind].charge,total:enemies[e.kind].charge,
    };
    if(boss)CatAudio.play("warn");
  }
  threatened(w,p){
    if(!w.lane)return dist(w,p)<w.size;
    const dx=Math.cos(w.angle),dy=Math.sin(w.angle);
    const t=clamp((p.x-w.x)*dx+(p.y-w.y)*dy,0,w.length);
    return Math.hypot(p.x-w.x-t*dx,p.y-w.y-t*dy)<w.size;
  }
  tickEnemy(e,dt){
    if(e.hp<=0)return;
    const p=this.player,s=enemies[e.kind];
    e.hit=Math.max(0,e.hit-dt);
    e.recoil=Math.max(0,e.recoil-dt);
    e.walking=false;
    this.move(e,e.x+e.knockX*dt,e.y+e.knockY*dt);
    e.knockX*=.83;e.knockY*=.83;
    if(e.kind==="boss"&&!e.enraged&&e.hp<e.maxHp*.53){
      e.enraged=true;e.wait=.46;
      this.enemies.push(this.makeEnemy("rat",this.width*.18,this.height*.37,1.0),this.makeEnemy("rat",this.width*.82,this.height*.37,1.1));
      this.effect("ring",e.x,e.y,0xff957e,.52,152);
      this.shake=8;
      this.callbacks.toast("食燈者喚醒了溺鼠。避開紅色直線。",2.7);
      CatAudio.play("heavy");
    }
    if(e.warning){
      const w=e.warning;w.left-=dt;
      if(w.left>0)return;
      e.warning=null;e.wait=s.rest;e.recoil=.22;
      if(w.shot){
        this.bolts.push({x:e.x,y:e.y,angle:w.angle,speed:270,time:1.5,friendly:false,size:9});
        CatAudio.play("cast");
      }else{
        if(this.threatened(w,p))this.hurt();
        if(w.lane){
          this.effects.push({kind:"lane",...w,color:0xf18073,left:.28,life:.28});
        }else this.effect("ring",w.x,w.y,0xfd9d86,.34,w.size+17);
        this.burst(w.x,w.y,0xd88476,12,145,true);
        if(e.kind==="boss"){this.shake=Math.max(7,this.shake);CatAudio.play("slam");}
      }
      return;
    }
    const d=dist(e,p);
    e.wait-=dt;
    if(d>Math.min(s.reach,e.kind==="boss"?165:s.reach*.92)&&d>1){
      const v=unit(p.x-e.x,p.y-e.y);
      e.angle=Math.atan2(v.y,v.x);
      e.walking=true;
      this.move(e,e.x+v.x*s.speed*dt,e.y+v.y*s.speed*dt);
    }
    if(d<=s.reach&&e.wait<=0){e.strikes++;this.warning(e,p);}
  }
  tick(dt,held){
    if(this.phase==="victory"){
      this.clock+=dt;
      this.victory-=dt;
      this.shake=Math.max(0,this.shake-dt*17);
      this.ageEffects(dt);
      if(this.victory<=0)this.finish(true);
      return;
    }
    if(this.phase!=="fight"&&this.phase!=="village")return;
    if(this.intro>0){this.intro-=dt;return;}
    if(this.freeze>0){this.freeze-=dt;return;}
    this.clock+=dt;
    this.shake=Math.max(0,this.shake-dt*34);
    this.hurtFlash=Math.max(0,(this.hurtFlash||0)-dt);
    const p=this.player;
    p.walking=false;
    if(this.phase==="village"){
      const {x,y}=this.intent;
      if(x||y){p.angle=Math.atan2(y,x);p.walking=true;this.move(p,p.x+x*235*dt,p.y+y*235*dt);}
      return;
    }
    this.roomTime+=dt;
    for(const key of ["attackCd","dashCd","castCd","invulnerable"])p[key]=Math.max(0,p[key]-dt);
    if(this.bufferDash>this.clock&&p.dashCd===0){this.bufferDash=0;this.input("dash");}
    if(this.bufferCast>this.clock&&p.castCd===0){this.bufferCast=0;this.input("cast");}
    if((held||this.bufferAttack>this.clock)&&p.attackCd===0){this.bufferAttack=0;this.input("attack");}
    if(p.dash){
      if((p.dash.echo||0)<=0){
        this.effect("echo",p.x,p.y,0xa7e2e4,.23,82,p.angle);
        p.dash.echo=.047;
      }
      p.dash.echo-=dt;
      this.move(p,p.x+p.dash.x*615*dt,p.y+p.dash.y*615*dt);
      p.dash.left-=dt;
      if(p.dash.left<=0)p.dash=null;
    }else{
      const {x,y}=this.intent;
      if(x||y){
        if(!p.attack)p.angle=Math.atan2(y,x);
        p.walking=true;
        const speed=p.attack?161:233;
        this.move(p,p.x+x*speed*dt,p.y+y*speed*dt);
      }
    }
    if(p.attack){
      const a=p.attack;a.left-=dt;
      if(!a.fired&&a.left<=a.impact){a.fired=true;this.strike(a);}
      if(a.left<=0)p.attack=null;
    }
    for(const e of this.enemies){
      this.tickEnemy(e,dt);
      if(this.phase!=="fight")return;
    }
    for(const b of this.bolts){
      b.time-=dt;
      b.x+=Math.cos(b.angle)*b.speed*dt;b.y+=Math.sin(b.angle)*b.speed*dt;
      if(b.friendly){
        for(const e of this.enemies){
          if(e.hp>0&&!b.seen.has(e)&&dist(e,b)<(e.kind==="boss"?43:27)){
            this.damage(e,b.damage,b.angle,true,b.seen.size===0,true);
            b.seen.add(e);
          }
        }
      }else if(dist(p,b)<23){this.hurt();b.time=0;}
      if(this.phase!=="fight")return;
    }
    this.bolts=this.bolts.filter(b=>b.time>0&&b.x>-30&&b.x<this.width+30&&b.y>-30&&b.y<this.height+30);
    this.ageEffects(dt);
    if(this.enemies.every(e=>e.hp===0))this.clear();
  }
  ageEffects(dt){
    for(const particle of this.particles){
      particle.left-=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;
      particle.vx*=.96;particle.vy*=.96;
    }
    this.particles=this.particles.filter(p=>p.left>0);
    for(const effect of this.effects)effect.left-=dt;
    this.effects=this.effects.filter(e=>e.left>0);
  }
  clear(){
    if(this.run.healOnClear)this.player.hp=Math.min(this.player.maxHp,this.player.hp+1);
    if(this.location==="boss"){
      const e=this.enemies[0];
      this.phase="victory";this.victory=.78;this.shake=12;this.bolts=[];
      this.effect("sigil",e.x,e.y,0xffd5a8,.78,166);
      this.burst(e.x,e.y-25,0x93f4df,56,265);
      CatAudio.play("heavy");
      return;
    }
    this.phase="reward";
    if(this.run.depth===2)this.run.rescued=1;
    const remaining=Object.keys(gifts).filter(id=>!this.run.chosen.includes(id));
    this.offered=[];
    while(this.offered.length<3)this.offered.push(remaining.splice(Math.floor(this.random()*remaining.length),1)[0]);
    CatAudio.play("reward");
    this.callbacks.hud();
    this.callbacks.reward();
  }
  choose(id){
    if(this.phase!=="reward"||!this.offered.includes(id))return;
    this.run.chosen.push(id);
    gifts[id].apply(this.run,this.player);
    this.callbacks.hud();
    if(this.run.depth===1){this.phase="route";this.callbacks.route();}
    else{this.phase="market";this.callbacks.market();}
  }
  leaveMarket(heal){
    if(this.phase!=="market")return;
    if(heal){
      if(this.run.embers<3||this.player.hp>=this.player.maxHp)return;
      this.run.embers-=3;this.player.hp=Math.min(this.player.maxHp,this.player.hp+2);
      CatAudio.play("reward");
    }
    this.openRoom("boss");
  }
  finish(win){
    this.phase="result";
    const earned=win?this.run.embers:Math.floor(this.run.embers*.5);
    this.village.embers=Math.min(99999,this.village.embers+earned);
    if(win){
      this.village.wins=Math.min(999,this.village.wins+1);
      this.village.rescued=Math.min(99,this.village.rescued+this.run.rescued);
    }
    villageDay(this.village,win);
    writeVillage(this.village);
    CatAudio.play(win?"reward":"hurt");
    this.callbacks.result(win,earned);
  }
}
