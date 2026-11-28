import {awakeningFx} from './relic-awakening-fx.mjs';

const TAU=Math.PI*2;
const point=(o,a,d)=>({x:o.x+Math.cos(a)*d,z:o.z+Math.sin(a)*d});
const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const angle=(a,b)=>Math.atan2(b.z-a.z,b.x-a.x);
const height=(p,y=.65)=>({x:p.x,y,z:p.z});
const eligible=(u,t)=>u.hp>0&&u.age>=.23&&!(u.turnedUntil>t);

function nearest(game,from,radius,exclude=new Set(),regular=false){
  let result;
  for(const unit of game.enemies){
    if(!eligible(unit,game.t)||exclude.has(unit)||(regular&&unit.kind==='boss'))continue;
    const d=gap(unit,from);
    if(d<radius){result=unit;radius=d;}
  }
  return result;
}

function segmentDistance(p,a,b){
  const dx=b.x-a.x,dz=b.z-a.z;
  const along=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));
  return Math.hypot(p.x-a.x-along*dx,p.z-a.z-along*dz);
}

function oppositeSide(a,b,c,p){
  const side=(v)=>(b.x-a.x)*(v.z-a.z)-(b.z-a.z)*(v.x-a.x);
  return side(p)*side(c)<-1e-5;
}

function withinTriangle(p,[a,b,c]){
  return !oppositeSide(a,b,c,p)&&!oppositeSide(b,c,a,p)&&!oppositeSide(c,a,b,p);
}

function figure(game,at,life,{spec,scale=1,fade=.95,weapon}={}){
  const {view}=game;
  const unit={...at,dx:1,dz:0,face:1,kind:spec?.bestiary?'boss':'imp',spec,
    age:1,hp:100,bodyScale:scale,bossPhase:0};
  const visual=view.createActor(spec?.frame??0,(spec?.height??2.68)*scale);
  if(spec?.model||spec?.bestiary)view.prepareBoss(visual,{...spec,height:spec.height*scale});
  else if(weapon)view.equip(visual,weapon);
  const entry={unit,visual,fade,start:game.t,until:game.t+life,weapon:!!weapon};
  (game.awakenedFigures??=[]).push(entry);
  return entry;
}

function removeFigure(view,entry){
  if(entry.weapon)view.removeEquippedActor(entry.visual);
  else view.removeActor(entry.visual);
}

export function clearAwakenings(game){
  for(const entry of game.awakenedFigures??[])removeFigure(game.view,entry);
  game.awakenedFigures=[];
  if(game.hero)game.hero.awakeningForm=null;
}

export function updateAwakenings(game,dt){
  const {hero,view,t}=game;
  const form=hero.awakeningForm;
  if(form&&form.until<=t)hero.awakeningForm=null;
  if(form?.host&&form.until>t&&form.host.hp>0){
    game.moveUnit(hero,form.host.x-hero.x,form.host.z-hero.z,.38);
  }
  for(let i=(game.awakenedFigures?.length??0)-1;i>=0;i--){
    const entry=game.awakenedFigures[i];
    if(entry.until<=t){removeFigure(view,entry);game.awakenedFigures.splice(i,1);continue;}
    const {unit}=entry;
    entry.update?.(unit,dt);
    view.actor(entry.visual,unit,{frame:entry.strikeUntil>t?2:entry.follow?1:unit.spec?.frame??0,
      face:unit.face,modelScale:entry.weapon?unit.bodyScale:1,bob:.08+Math.sin((t-entry.start)*9)*.065,
      fade:Math.min(entry.fade,(entry.until-t)*5),
      aura:.68,rim:entry.tint??0xcdeec8,heading:Math.atan2(unit.dx,unit.dz),stepWeight:entry.follow?.68:0,dt});
  }
}

export function updateTurnedEnemy(game,unit,dt){
  if(!(unit.turnedUntil>game.t))return false;
  const target=nearest(game,unit,8,new Set([unit]));
  if(!target){unit.move=0;return true;}
  const d=gap(unit,target),a=angle(unit,target);
  unit.face=Math.cos(a)>=0?1:-1;
  unit.turnedTarget=target;
  if(d>1.42){game.moveUnit(unit,Math.cos(a)*dt*5,Math.sin(a)*dt*5,.33);unit.move=.78;}
  else if(unit.turnedAttack<=game.t){
    unit.turnedAttack=game.t+.49;
    game.view.slash(unit.x,unit.z,Math.cos(a),Math.sin(a),unit.turnedWeapon.tone,1.75,true);
    game.hit(target,unit.turnedPower,unit,.58,unit.turnedWeapon.tone,'light',undefined,unit.turnedCredit);
  }
  return true;
}

export function awakeningFootprint(weapon,hero,range,direction,center,rank){
  const {aim,kind}=weapon.awakening;
  const r=weapon.spell.radius;
  const area=(o,radius)=>({area:{x:o.x,z:o.z,radius}});
  const lane=(o,width,length=range)=>({lane:{x:o.x+direction.dx*length/2,z:o.z+direction.dz*length/2,...direction,width,length}});
  if(kind==='dam')return {lane:{...center,dx:-direction.dz,dz:direction.dx,length:5.0,width:1.0}};
  if(kind==='tripwire')return lane(hero,1.6,4.67);
  if(kind==='rail')return lane(hero,1.45,Math.min(range,8.7));
  if(aim==='self')return area(hero,{clones:4.5,giant:3.15,sweep:3.95,orbit:3.02,haste:2.09,rift:2.46,form:3.59}[kind]??r);
  if(aim==='line')return lane(hero,kind==='fan'?range*Math.sin(.705):kind==='wheels'?2.5:Math.max(.8,r*.7));
  const targetRadius={freeze:Math.max(2.8,r*1.25),cage:2.67,prism:r*1.08,boss:4.5,seekers:4.6}[kind]??r+1.2;
  return area(center,targetRadius*(1+Math.min(rank,3)*.025));
}

export function castAwakening(game,context){
  const {hero,view,weapon}=game;
  const {origin,center,bearing,range,radius,damage,credit,strike,schedule}=context;
  const {kind}=weapon.awakening;
  const tint=weapon.tone;
  const ahead=(p,a,d)=>{const q=point(p,a,d);game.bound(q);return q;};
  const fx=(shape,p,options={})=>awakeningFx(view,shape,p,tint,options);
  const burst=(p,r,power=1,force=.8)=>context.burst(p,r,power,0,false,force);
  const line=(a,b,width,scale,force,visited=new Set())=>{
    for(const foe of [...game.enemies,...game.breakables(),...(game.bossArena?.targets??[])]){
      if(foe.hp<=0||foe.turnedUntil>game.t||visited.has(foe)||segmentDistance(foe,a,b)>width+(foe.kind==='boss'?.55:0))continue;
      visited.add(foe);strike(foe,a,scale,force);
    }
  };
  const trace=(a,b,shape='blade',life=.36,size=.64,y=.5)=>fx(shape,a,{life,size,y,angle:-angle(a,b),dx:b.x-a.x,dz:b.z-a.z,spin:shape==='wheel'?20:0});
  const tri=(r,shape)=>[0,1,2].map(i=>{
    const p=ahead(center,bearing+i*TAU/3,r);
    fx(shape,p,{size:.56,y:1.15,lift:.45,life:1.16,spin:5});return p;
  });

  switch(kind){
    case 'clones': {
      for(const side of [-1,1]){
        const ghost=figure(game,ahead(hero,bearing+side*1.92,1.9),5,{weapon,scale:2,fade:.63});
        ghost.follow=true;ghost.tint=tint;
        ghost.update=(unit,dt)=>{
          const a=Math.atan2(hero.dz,hero.dx)+side*1.92;
          const to=ahead(hero,a,1.95);
          const blend=1-Math.exp(-dt*(ghost.strikeUntil>game.t?3:11));
          unit.x+=(to.x-unit.x)*blend;unit.z+=(to.z-unit.z)*blend;
          if(!(ghost.strikeUntil>game.t)){unit.dx=hero.dx;unit.dz=hero.dz;unit.face=hero.face;}
        };
        for(let i=0;i<4;i++)schedule(.38+i*1.06+(side>0?.40:0),()=>{
          const from=ghost.unit,target=nearest(game,from,4.5);
          if(!target)return;
          ghost.strikeUntil=game.t+.25;
          const a=angle(from,target);
          from.dx=Math.cos(a);from.dz=Math.sin(a);
          const start={x:from.x,z:from.z};
          Object.assign(from,ahead(from,a,Math.min(2.3,gap(from,target))),{face:Math.cos(a)>0?1:-1});
          view.motion.rush(start,from,tint);
          view.slash(from.x,from.z,Math.cos(a),Math.sin(a),tint,1.65,true);
          line(start,ahead(from,a,1.1),1.05,.72,.82);
        });
      }
      break;
    }
    case 'prism': {
      const nodes=tri(radius*.85,'mirror');
      fx('prism',center,{size:radius*.92,life:1,angle:-bearing,spin:.35});
      for(let i=0;i<3;i++)schedule(.16+i*.16,()=>{
        const a=nodes[i],b=nodes[(i+1)%3];
        view.thrust(a.x,a.z,Math.cos(angle(a,b)),Math.sin(angle(a,b)),gap(a,b),tint,true);line(a,b,.78,.49,.52);
      });
      schedule(.84,()=>{view.relicColumn(weapon,center,radius*1.02);burst(center,radius*1.08,1.92,1.2);});
      break;
    }
    case 'capacitor': {
      const used=new Set();let current=origin;
      for(let i=0;i<5;i++)schedule(.11+i*.20,()=>{
        const next=nearest(game,i?current:center,i?4.2:radius+1.2,used);
        if(!next){if(i===0){trace(origin,center,'relay');burst(center,1.35,.81);}return;}
        used.add(next);trace(current,next,'relay',.17,.47+i*.10);
        view.bolt(height(current),height(next,1.1),tint,1.85);strike(next,current,1.05+i*.29,.77);
        current={x:next.x,z:next.z};
      });
      break;
    }
    case 'rail': {
      const rail=Math.min(range,8.7),end=ahead(origin,bearing,rail);
      fx('wire',point(origin,bearing,rail*.5),{size:rail*.5,angle:Math.PI/2-bearing,life:1.1});
      for(let i=0;i<5;i++)schedule(.40+i*.15,()=>{
        const p=ahead(origin,bearing,rail*(1-i*.20));
        view.bolt(height(p,3.75),height(p,.1),tint,2.12);burst(p,1.45,1.18,1.05);
      });
      trace(origin,end,'relay',.26,.55);
      break;
    }
    case 'tripwire': {
      const traps=Array.from({length:3},(_,i)=>{
        const p=ahead(origin,bearing,1.45+i*1.61);
        const ends=[point(p,bearing+Math.PI/2,1.6),point(p,bearing-Math.PI/2,1.6)];
        fx('wire',p,{size:1.60,angle:-bearing,life:4.0});fx('trap',p,{size:.53,life:4.0});
        return {p,ends,sprung:false};
      });
      for(let i=0;i<20;i++)schedule(.09+i*.20,()=>{
        for(const trap of traps){
          if(trap.sprung||!game.enemies.some(u=>eligible(u,game.t)&&segmentDistance(u,...trap.ends)<.76))continue;
          trap.sprung=true;
          for(let j=-2;j<=2;j++)fx('fang',point(trap.p,bearing+Math.PI/2,j*.59),{size:.81,y:.48,lift:.44,life:.42});
          burst(trap.p,1.95,1.65,1.28);
        }
      });
      break;
    }
    case 'giant':
      hero.relicGiantUntil=game.t+5;
      fx('crown',hero,{size:1.8,life:.85,y:3.75,lift:.92,spin:3});
      for(let i=0;i<8;i++)fx('stone',point(hero,i*TAU/8,1.16),{size:.47,y:.46,lift:.80,life:.65,spin:3});
      view.shock(hero.x,hero.z,tint,3.42,1.18);burst(hero,3.15,1.65,2.35);
      break;
    case 'sweep': {
      const seen=new Set();
      for(let i=0;i<4;i++)schedule(.04+i*.115,()=>{
        const a=bearing+i*Math.PI/2;
        view.slash(hero.x,hero.z,Math.cos(a),Math.sin(a),tint,4,true,i%2?1:-1,1.03);
        for(const u of [...game.enemies,...game.breakables(),...(game.bossArena?.targets??[])]){
          if(u.hp<=0||seen.has(u)||gap(hero,u)>3.95+(u.kind==='boss'?.70:0))continue;
          const turn=angle(hero,u)-a;
          if(Math.abs(Math.atan2(Math.sin(turn),Math.cos(turn)))<=Math.PI/4+.02){seen.add(u);strike(u,hero,2.18,1.82);}
        }
      });
      break;
    }
    case 'fan': {
      const seen=new Set();
      for(let i=-3;i<=3;i++){
        const a=bearing+i*.235,end=ahead(origin,a,range);
        trace(point(origin,a,.55),end,'blade',.43,.8,.45);
        schedule(.13,()=>line(origin,end,.61,2.36,1.04,seen));
      }
      break;
    }
    case 'boss': {
      const ghost=figure(game,center,3.85,{spec:game.awakeningBossSpec('goat'),scale:2});
      ghost.tint=tint;
      fx('crown',center,{size:2.16,y:.32,life:1.0,lift:2});
      for(let i=0;i<3;i++)schedule(.37+i*1.06,()=>{
        const u=ghost.unit;const dest=nearest(game,u,8)??ahead(u,bearing,3.35);
        const from={x:u.x,z:u.z},a=angle(from,dest);
        const land=ahead(from,a,Math.min(5.4,Math.max(1.5,gap(from,dest)+.45)));
        u.dx=Math.cos(a);u.dz=Math.sin(a);u.face=u.dx>=0?1:-1;
        u.motion={pattern:'pounce',age:0,dx:u.dx,dz:u.dz};
        const start=game.t;
        ghost.update=()=>{const step=Math.min(1,(game.t-start)/.32);u.motion.age=game.t-start;
          u.x=from.x+(land.x-from.x)*step;u.z=from.z+(land.z-from.z)*step;};
        trace(from,land,'stone',.31,.7,.30);
        schedule(.32,()=>{line(from,land,1.5,1.71,1.65);view.shock(land.x,land.z,tint,2.2,.91);});
      });
      break;
    }
    case 'possession': {
      const host=nearest(game,center,radius+1.45,new Set(),true);
      if(!host){fx('rift',center,{size:2.2,life:.8});burst(center,2.2,1.22,1.04);break;}
      const start={x:hero.x,z:hero.z};
      trace(start,host,'toxin',.26,1.2);
      const d=gap(hero,host),a=angle(hero,host);
      for(let i=0;i<Math.ceil(d/.50);i++)game.moveUnit(hero,Math.cos(a)*.49,Math.sin(a)*.49,.38);
      if(gap(hero,host)>1.35){burst(host,1.93,1.30,.95);break;}
      hero.invulnerable=Math.max(hero.invulnerable,1.3);
      hero.awakeningForm={host,until:game.t+1.15};
      fx('crown',host,{size:.9,y:1.65,life:1.15,spin:3});
      schedule(1.13,()=>{const p={x:hero.x,z:hero.z};fx('rift',p,{size:2.65,life:.63});burst(p,2.95,2.16,2);});
      break;
    }
    case 'charm': {
      const unit=nearest(game,center,radius+1.50,new Set(),true);
      const p=unit??center;
      view.bolt(height(hero,1.1),height(p,1.35),tint,1.72);
      if(!unit){fx('trap',p,{size:2.1,life:.7});burst(p,2.08,1.12);break;}
      game.releaseEnemyForAwakening(unit);
      Object.assign(unit,{turnedUntil:game.t+5,turnedPower:damage*.88,turnedWeapon:weapon,turnedCredit:credit,turnedAttack:game.t+.08});
      for(let i=0;i<5;i++)schedule(i,()=>{if(unit.hp>0)fx('crown',unit,{size:.72,y:1.82,life:.80,spin:3});});
      break;
    }
    case 'rift': {
      fx('rift',hero,{size:2.65,life:.95,spin:2.6});
      fx('rift',center,{size:1.43,y:1.2,life:.8,lift:.85,spin:-2});
      if(game.queueRelicDetour())break;
      schedule(.42,()=>{view.vortex(center.x,center.z,2.46,tint,.57);burst(center,2.46,1.9,-1.65);});
      break;
    }
    case 'freeze':
      fx('frost',center,{size:radius*1.45,life:1.36});
      for(let i=0;i<6;i++)fx('ice',point(center,i*TAU/6,radius),{size:1.12,y:.66,lift:.34,life:.8});
      view.shock(center.x,center.z,tint,3.1,.8);burst(center,Math.max(2.8,radius*1.25),2.1,.60);
      for(const u of game.enemies)if(eligible(u,game.t)&&gap(u,center)<Math.max(2.8,radius*1.25)){
        u.chill=Math.max(u.chill,3.3);if(u.kind!=='boss')u.frozen=Math.max(u.frozen??0,2.1);
      }
      break;
    case 'dam': {
      for(let i=-2;i<=2;i++){
        const p=ahead(center,bearing+Math.PI/2,i*.94),duration=3.2;
        game.relicWalls.push({...p,radius:.61,until:game.t+duration});
        view.relicWall(weapon,p,bearing,duration);
        fx('ice',p,{size:1.35,y:.84,life:duration});
      }
      schedule(.27,()=>{
        const end=ahead(center,bearing,3.2);
        view.wave(center.x,center.z,Math.cos(bearing),Math.sin(bearing),5.1,tint,true,'ice');line(center,end,2.55,2.12,1.65);
      });
      break;
    }
    case 'infection': {
      let victim=nearest(game,center,radius+1.2);
      let seed={...center};const seen=new Set();
      for(let i=0;i<7;i++)schedule(.12+i*.34,()=>{
        if(!victim||!eligible(victim,game.t)){
          if(victim)seen.add(victim);
          const next=nearest(game,seed,3.35,seen);
          if(next&&victim)trace(seed,next,'toxin',.23,.76);
          victim=next;
        }
        if(victim)seed={x:victim.x,z:victim.z};
        fx('toxin',seed,{size:i===0?1.3:.71,y:.84,life:.40,lift:.72,spin:4});
        view.elementBurst(seed.x,.58,seed.z,tint,'root',7,1.1);
        burst(seed,i===0?1.62:1.12,.66,.28);
      });
      break;
    }
    case 'orbit': {
      const r=2.32;
      let seen=new Set();
      for(let i=0;i<20;i++)schedule(i*.076,()=>{
        if(i===10)seen=new Set();
        const a=bearing+i*TAU/10,from=point(hero,a,r),end=point(hero,a+TAU/10,r);
        trace(from,end,'blade',.12,.84,.78);line(from,end,.70,.94,.86,seen);
      });
      schedule(1.56,()=>{
        const a=point(hero,bearing,.38),b=ahead(hero,bearing,range);
        trace(a,b,'blade',.33,1.68,1.0);line(a,b,1.13,2.04,1.41);
      });
      break;
    }
    case 'haste':
      hero.relicHaste={until:game.t+4.1,speed:1.38};
      view.motion.rush(origin,ahead(origin,bearing,2.2),tint);
      for(let i=0;i<3;i++)schedule(.22+i*.81,()=>{
        const p={x:hero.x,z:hero.z};
        fx('trap',p,{size:1.24,angle:i*.72,life:.79,spin:1.8});
        schedule(.70,()=>{view.shock(p.x,p.z,tint,2.1,.88);burst(p,2.09,1.18,1.13);});
      });
      break;
    case 'cyclone':
      for(let i=0;i<7;i++)schedule(i*.12,()=>{
        const p=ahead(origin,bearing,.82+range*i/6);
        fx('vortex',p,{size:1.3+i*.09,y:.36,lift:.91,life:.40,spin:4.2});
        view.vortex(p.x,p.z,1.28+i*.10,tint,.28);
        burst(p,i===6?2.84:1.57,i===6?1.54:.66,i===6?2.1:-1.28);
      });
      break;
    case 'wheels': {
      const end=ahead(origin,bearing,Math.min(5.9,range));
      for(const side of [-1,1]){
        const from=ahead(origin,bearing+side*Math.PI/2,2.28);
        trace(from,end,'wheel',.57,1.44,.71);
        schedule(.29,()=>line(from,point(from,angle(from,end),gap(from,end)*.62),.74,.79,.95));
      }
      schedule(.57,()=>{view.bolt(height(end,5.9),height(end,.1),tint,2.22);burst(end,2.8,2.41,1.56);});
      break;
    }
    case 'seekers': {
      const used=new Set();
      for(let i=0;i<4;i++){
        let bead;
        for(let j=0;j<4;j++)schedule(j*.095,()=>{
          bead=point(hero,bearing+i*TAU/4+j*.79,1.43);
          fx('relay',bead,{size:.52,y:1.22,life:.15,spin:6});
        });
        schedule(.40+i*.12,()=>{
          const target=nearest(game,center,4.6,used)??nearest(game,center,4.6)??center;
          used.add(target);
          const arrival={x:target.x,z:target.z};
          trace(bead??hero,arrival,'relay',.29,.66,1.17);
          schedule(.29,()=>{fx('frost',arrival,{size:1.2,life:.28});burst(arrival,1.33,1.0,.81);});
        });
      }
      break;
    }
    case 'cage': {
      const nodes=tri(2.67,'fang');
      fx('prism',center,{size:2.67,life:1.10,angle:-bearing});
      for(let i=0;i<3;i++)schedule(.10+i*.17,()=>view.bolt(height(nodes[i],4.3),height(nodes[i],.12),tint,1.96));
      schedule(.65,()=>{
        for(let i=0;i<3;i++)view.bolt(height(nodes[i],1.35),height(nodes[(i+1)%3],1.35),tint,2.01);
        for(const u of game.enemies)if(eligible(u,game.t)&&withinTriangle(u,nodes)){
          strike(u,center,2.66,1.00);if(u.kind!=='boss')u.stun=Math.max(u.stun,1.85);
        }
      });
      break;
    }
    case 'siphon': {
      const victim=nearest(game,center,radius+1.20);
      if(!victim){fx('fang',center,{size:1.4,y:.9,life:.52});break;}
      let connected=true;
      for(let i=0;i<5;i++)schedule(.08+i*.37,()=>{
        connected=connected&&eligible(victim,game.t)&&gap(hero,victim)<range+.9;
        if(!connected)return;
        const a=angle(victim,hero);
        trace(victim,point(victim,a,gap(hero,victim)),'toxin',.28,.56,1.18);
        view.bolt(height(victim,.83),height(hero,1.12),tint,.92);strike(victim,hero,1.60,.12);
      });
      break;
    }
    case 'form': {
      const ghost=figure(game,hero,4,{spec:game.awakeningBossSpec('devourer'),scale:1.60});
      ghost.tint=tint;ghost.follow=true;
      ghost.update=(u,dt)=>{
        Object.assign(u,{x:hero.x,z:hero.z,dx:hero.dx,dz:hero.dz,face:hero.face});
        if(u.motion)u.motion.age+=dt;
      };
      hero.awakeningForm={figure:ghost,until:game.t+4};
      fx('crown',hero,{size:1.62,y:2.5,lift:1.4,life:.67,spin:3});
      for(let i=0;i<3;i++)schedule(.44+i*1.14,()=>{
        const here={x:hero.x,z:hero.z};
        ghost.unit.motion={pattern:'burst',age:0,dx:hero.dx,dz:hero.dz};
        for(let j=0;j<8;j++)fx('fang',point(here,j*TAU/8,1.75+i*.39),{size:.96,y:.53,lift:.64,life:.56});
        view.shock(here.x,here.z,tint,2.67+i*.46,1.16);burst(here,2.67+i*.46,1.62,1.36);
      });
      break;
    }
  }
}
