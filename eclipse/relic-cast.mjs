import {relicPower} from './relic-arsenal.mjs?v=heirlooms-1';

const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const TAU=Math.PI*2;
const offset=(point,angle,reach)=>({x:point.x+Math.cos(angle)*reach,z:point.z+Math.sin(angle)*reach});
const height=(point,y=.64)=>({x:point.x,y,z:point.z});
const live=unit=>unit.hp>0&&unit.age>=.23;

function closest(game,point,range,visited=new Set()){
  let target;
  for(const unit of game.enemies){
    if(!live(unit)||visited.has(unit))continue;
    const distance=gap(unit,point);
    if(distance<range){target=unit;range=distance;}
  }
  return target;
}

export function castRelic(game,origin,dx,dz,center,power,range,linked=false,onHit){
  const {hero,weapon,view}=game;
  const {action,hits,radius:baseRadius,interval}=weapon.spell;
  const rank=Math.min(3,game.ranks.get(weapon.blessing.id)??0);
  const boon=rank?weapon.blessing.augment:null;
  const bearing=Math.atan2(dz,dx);
  const radius=baseRadius*(boon==='wide'?1+rank*.14:1)*(linked?1.12:1);
  const damage=power*relicPower(rank)*(linked?1.23:1);
  const pulse=weapon.sigil%3;
  const position=(point,angle,dist)=>{const next=offset(point,angle,dist);game.bound(next);return next;};
  const schedule=(time,callback)=>game.schedule(time,callback);
  const aim=(from,to)=>gap(from,to)>.12?Math.atan2(to.z-from.z,to.x-from.x):bearing;
  let healed=0, chained=false;

  function strike(target,source,scale,force=.65,react=true){
    const landed=game.hit(target,damage*scale,source,force,weapon.tone,force>1?'heavy':'light');
    if(!landed||!react||!target.spec)return landed;
    onHit?.(target,source);
    if(weapon.element==='ice'||boon==='chill'){
      target.chill=Math.max(target.chill,1.24+(boon==='chill'?.69*rank:0));
    }
    if(weapon.element==='poison'||boon==='expose'||weapon.id==='western-rifle'||weapon.id==='sniper-crossbow'||weapon.id==='lion-crossbow'){
      target.exposed=Math.max(target.exposed,1.75+(boon==='expose'?.67*rank:0));
    }
    if((boon==='stun'||weapon.id==='shiva-trident'||weapon.form==='bell'||weapon.id==='seven-blade')&&target.kind!=='boss'){
      target.stun=Math.max(target.stun,.44+(boon==='stun'?.20*rank:0));
    }
    if(boon==='pull'&&target.hp>0){
      const len=Math.max(.25,gap(source,target));
      target.kx+=(source.x-target.x)*3.1/len;
      target.kz+=(source.z-target.z)*3.1/len;
    }
    if(action==='drain'||boon==='drain'||weapon.id==='oni-bow'){
      const gain=Math.min(Math.max(0,hero.maxHp*(.15+rank*.028)-healed),damage*scale*(.12+(boon==='drain'?rank*.045:0)));
      hero.hp=Math.min(hero.maxHp,hero.hp+gain);
      healed+=gain;
    }
    if(boon==='chain'&&!chained){
      chained=true;
      const visited=new Set([target]);
      let last=target;
      for(let i=0;i<(weapon.id==='nether-bow'?2:Math.min(rank,2));i++){
        const next=closest(game,last,3.6,visited);
        if(!next)break;
        view.bolt(height(last),height(next),weapon.tone,1.15);
        strike(next,last,.38,.27,false);
        visited.add(next);
        last=next;
      }
    }
    return landed;
  }

  function burst(point,size,scale=1,index=0,accent=true,force=.72){
    if(accent)view.relicPulse(weapon,point,size,index);
    for(const unit of [...game.enemies,...game.breakables(),...(game.bossArena?.targets??[])]){
      if(unit.hp>0&&gap(unit,point)<=size+(unit.kind==='boss'?.58:.12))strike(unit,point,scale,force);
    }
  }

  function ray(point,angle,length,width,index,scale=1,returning=false){
    const tx=Math.cos(angle),tz=Math.sin(angle);
    if(action==='return')view.spinningDisk(point.x,point.z,tx,tz,length,weapon.tone,.18+pulse*.28,returning);
    else if(weapon.element==='lightning')view.bolt(height(point,.87),height(offset(point,angle,length),.56),weapon.tone,1.35);
    else view.wave(point.x,point.z,tx,tz,length,weapon.tone,index%2===0,weapon.effect);
    view.relicPulse(weapon,offset(point,angle,length*.72),width+.55,index);
    for(const unit of [...game.enemies,...game.breakables(),...(game.bossArena?.targets??[])]){
      const x=unit.x-point.x,z=unit.z-point.z,along=x*tx+z*tz;
      if(along>=-.35&&along<=length+.32&&Math.abs(x*tz-z*tx)<width+(unit.kind==='boss'?.6:.2)){
        strike(unit,point,scale,returning?-.55:1.12);
      }
    }
  }

  switch(action){
    case 'rain':
      for(let i=0;i<hits;i++){
        const landing=i===0?center:position(center,bearing+i*2.399,radius*(.28+.16*(i%3)));
        schedule(i*interval,()=>view.relicFall(weapon,landing,radius,i));
        schedule(i*interval+.18,()=>burst(landing,radius,1,i));
      }
      break;
    case 'spikes':
    case 'wave':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=position(origin,bearing,1+range*(i+1)/(hits+1));
        burst(point,radius*(action==='wave'?1+i*.18:1),1,i,true,1.10);
      });
      break;
    case 'storm':
      view.vortex(center.x,center.z,radius,weapon.tone);
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=position(center,bearing+i*(pulse===0?TAU/hits:2.399),pulse===1?0:radius*.57);
        burst(point,radius,.89,i);
      });
      break;
    case 'morph':
    case 'buff':
      hero.relicHaste={until:game.t+3.8+(boon==='haste'?rank*.68:0),speed:action==='buff'?1.32:1.18};
      hero.surge=Math.max(hero.surge,2.6+(boon==='haste'?rank*.36:0));
      view.relicAura(weapon,hero,action==='morph'?4.0:3.2,action==='morph');
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=position(hero,bearing+i*TAU/hits,radius*.61);
        if(weapon.element==='lightning')view.bolt(height(hero,1.05),height(point,.55),weapon.tone,1.4);
        burst(point,radius*.59,1,i);
      });
      break;
    case 'guard':
      hero.ward=Math.max(hero.ward,2.2+(boon==='guard'?rank*.60:0));
      hero.relicCounter={weapon,power:damage*(boon==='riposte'?1+rank*.28:.74),rank};
      view.relicAura(weapon,hero,2.25);
      for(let i=0;i<hits;i++)schedule(i*interval,()=>burst({x:hero.x,z:hero.z},radius,.71,i));
      break;
    case 'ring':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const outer=radius*(1-i*.22);
        view.threatImpact({...center,kind:'ring',width:.77,radius:outer,tint:weapon.tone,effect:weapon.effect});
        view.relicPulse(weapon,center,outer,i);
        for(const foe of game.enemies)if(live(foe)&&Math.abs(gap(foe,center)-outer)<.92)strike(foe,center,1);
      });
      break;
    case 'return':
      for(let i=0;i<hits;i++){
        const angle=bearing+(i-(hits-1)/2)*.17;
        schedule(i*interval,()=>ray(origin,angle,range,radius,i));
        schedule(i*interval+.39,()=>ray(offset(origin,angle,range),angle+Math.PI,range,radius,i+hits,.69,true));
      }
      break;
    case 'beam':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const angle=bearing+(i-(hits-1)/2)*(pulse===0?.13:.065);
        ray(origin,angle,range,radius*.64,i,.93);
      });
      break;
    case 'volley':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=position(center,bearing+i*2.399,i===0?0:radius*.6);
        const target=closest(game,point,radius+1.15)??point;
        const angle=aim(origin,target), travel=Math.max(.08,gap(origin,target)/26);
        view.comboArrow(origin,Math.cos(angle),Math.sin(angle),gap(origin,target),weapon.tone,travel,i===hits-1);
        const impact={x:target.x,z:target.z};
        schedule(travel,()=>burst(impact,radius,1,i));
      });
      break;
    case 'minion': {
      const summon=view.relicCompanion(weapon,center,.45+hits*interval);
      let point={...center};
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const target=closest(game,point,8.7)??point;
        const direction=aim(point,target);
        view.relicLunge(summon,point,target,direction);
        point={x:target.x,z:target.z};
        if(weapon.id==='western-rifle')view.bolt(height(hero,.86),height(point),weapon.tone,.9);
        burst(point,radius,1,i,true,weapon.id==='turtle-bow'?1.45:.76);
      });
      break;
    }
    case 'drain':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=i===0?center:position(center,bearing+i*.85,radius*.45);
        view.slash(point.x,point.z,dx,dz,weapon.tone,radius,true);
        burst(point,radius,1,i,true,1.15);
      });
      break;
    case 'wall':
      for(let i=0;i<hits;i++){
        const point=position(center,bearing+Math.PI/2,(i-(hits-1)/2)*.92);
        const duration=3.6+(boon==='guard'?rank*.56:0);
        game.relicWalls.push({...point,radius:.59,until:game.t+duration});
        view.relicWall(weapon,point,bearing,duration);
        schedule(i*interval,()=>burst(point,radius,.83,i));
      }
      break;
    case 'blink': {
      view.relicAura(weapon,hero,.48);
      for(let i=0;i<15;i++)if(game.moveUnit(hero,dx*range/15,dz*range/15,.38)<.04)break;
      hero.invulnerable=Math.max(hero.invulnerable,.42);
      hero.hp=Math.min(hero.maxHp,hero.hp+hero.maxHp*.072);
      burst(origin,radius,1,0);
      const end={x:hero.x,z:hero.z};
      schedule(interval,()=>burst(end,radius,.88,1));
      break;
    }
    case 'chain': {
      const visited=new Set();
      let from=origin;
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const target=closest(game,i===0?center:from,i===0?range:radius+1,visited);
        if(!target){
          if(i===0)burst(center,radius,.82,0);
          return;
        }
        visited.add(target);
        view.bolt(height(from,1),height(target),weapon.tone,1.6);
        view.relicPulse(weapon,target,radius*.72,i);
        strike(target,from,1-i*.065,1.12);
        from={x:target.x,z:target.z};
      });
      break;
    }
  }
  if(boon==='echo'||boon==='burn'){
    const count=boon==='burn'?2:1;
    for(let i=0;i<count;i++)schedule(hits*interval+.31+i*.34,
      ()=>burst(action==='blink'?origin:center,radius*.84,.48+rank*.075,hits+i,true,.40));
  }
}

export function relicCounter(game,attacker){
  const counter=game.hero.relicCounter;
  if(!counter)return;
  game.hero.relicCounter=null;
  const {weapon,power,rank}=counter;
  const point=attacker??game.hero;
  game.view.relicPulse(weapon,point,1.8,1);
  for(const unit of game.enemies)if(live(unit)&&gap(unit,point)<1.88){
    if(game.hit(unit,power,game.hero,1.24,weapon.tone,'heavy')&&weapon.element==='ice')unit.chill=Math.max(unit.chill,1.3+rank*.4);
  }
}
