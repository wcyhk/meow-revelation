import {relicPower} from './relic-arsenal.mjs?v=weapon-audit-1';

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
  const {action,hits,radius:baseRadius,interval,look}=weapon.spell;
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

  const castSource=linked?'link':'skill';
  function strike(target,source,scale,force=.65,react=true,credit=castSource){
    const landed=game.hit(target,damage*scale,source,force,weapon.tone,force>1?'heavy':'light',undefined,credit);
    if(!landed||!react||!target.spec)return landed;
    onHit?.(target,source);
    if(weapon.element==='ice'||boon==='chill'||look==='thunder-orbs'){
      target.chill=Math.max(target.chill,1.24+(boon==='chill'?.69*rank:0));
    }
    if(weapon.element==='poison'||boon==='expose'||weapon.id==='western-rifle'||weapon.id==='sniper-crossbow'||weapon.id==='lion-crossbow'){
      target.exposed=Math.max(target.exposed,1.75+(boon==='expose'?.67*rank:0));
    }
    if((boon==='stun'||weapon.id==='shiva-trident'||weapon.form==='bell'||weapon.id==='seven-blade'||look==='hand')&&target.kind!=='boss'){
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
        strike(next,last,.38,.27,false,'blessing');
        visited.add(next);
        last=next;
      }
    }
    return landed;
  }

  function burst(point,size,scale=1,index=0,accent=true,force=.72,credit=castSource){
    if(accent)view.relicPulse(weapon,point,size,index);
    for(const unit of [...game.enemies,...game.breakables(),...(game.bossArena?.targets??[])]){
      if(unit.hp>0&&gap(unit,point)<=size+(unit.kind==='boss'?.58:.12))strike(unit,point,scale,force,true,credit);
    }
  }

  function ray(point,angle,length,width,index,scale=1,returning=false){
    const tx=Math.cos(angle),tz=Math.sin(angle);
    if(action==='return')view.spinningDisk(point.x,point.z,tx,tz,length,weapon.tone,.18+pulse*.28,returning);
    else if(weapon.element==='lightning')view.bolt(height(point,.87),height(offset(point,angle,length),.56),weapon.tone,1.35);
    else view.wave(point.x,point.z,tx,tz,length,weapon.tone,index%2===0,weapon.effect);
    if(weapon.id!=='zhurong-axe')view.relicPulse(weapon,offset(point,angle,length*.72),width+.55,index);
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
        schedule(i*interval+.18,()=>{
          burst(landing,radius,1,i);
          if(weapon.id==='vritra-spear'){
            view.relicStorm(weapon,landing,radius,.68);
            schedule(.34,()=>burst(landing,radius,.37,i,false,.31));
          }
        });
      }
      break;
    case 'spikes':
    case 'wave':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=position(origin,bearing,1+range*(i+1)/(hits+1));
        const size=radius*(action==='wave'?1+i*.18:1);
        if(action==='spikes')view.relicRise(weapon,point,bearing,size);
        else view.wave(point.x-dx*size*.5,point.z-dz*size*.5,dx,dz,size*1.75,weapon.tone,true,'stone');
        schedule(action==='spikes'?.13:.06,()=>burst(point,size,1,i,true,1.10));
      });
      break;
    case 'storm':
      if(look!=='snowfall'&&look!=='three-vortices')view.relicStorm(weapon,center,radius,hits*interval+.24);
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const scattered=look==='snowfall'||look==='three-vortices';
        const point=scattered?position(center,bearing+i*2.399,radius*(look==='three-vortices'?.83:.57)):center;
        if(look==='three-vortices')view.relicStorm(weapon,point,radius,.90);
        if(look==='snowfall')view.relicFall(weapon,point,radius,i);
        if(weapon.id==='bat-cane')view.relicBats(point,weapon.tone,radius,i);
        if(look==='snowfall')schedule(.18,()=>burst(point,radius,.89,i));
        else burst(point,radius,.89,i);
        if(look==='three-vortices')schedule(.44,()=>burst(point,radius,.36,i,false,.30));
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
      hero.relicCounter={weapon,power:damage*(boon==='riposte'?1+rank*.28:.74),rank,linked};
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
        if(look==='overhead'){
          const point=i===0?center:position(center,bearing+i*2.399,radius*.54);
          view.relicColumn(weapon,point,radius);
          schedule(.075,()=>burst(point,radius,.93,i));
        }else if(look==='electric-wheel'){
          const angle=bearing+(i===0?-.16:.16), tx=Math.cos(angle), tz=Math.sin(angle);
          view.spinningDisk(origin.x,origin.z,tx,tz,range,weapon.tone,0,true);
          const seen=new Set();
          for(let section=1;section<=4;section++)schedule(section*.095,()=>{
            const point=offset(origin,angle,section*range/4);
            view.elementBurst(point.x,.51,point.z,weapon.tone,'lightning',4,.69,angle);
            for(const unit of game.enemies){
              if(!live(unit)||seen.has(unit)||gap(unit,point)>radius+range/8)continue;
              seen.add(unit);
              strike(unit,point,.93,1.06);
            }
          });
        }else{
          const angle=bearing+(i-(hits-1)/2)*(pulse===0?.13:.065);
          ray(origin,angle,range,radius*.64,i,.93);
        }
      });
      break;
    case 'volley':
      for(let i=0;i<hits;i++)schedule(i*interval,()=>{
        const point=position(center,bearing+i*2.399,i===0?0:radius*.6);
        const target=closest(game,point,radius+1.15)??point;
        const physical=weapon.form==='bow'||weapon.form==='crossbow';
        const angle=aim(origin,target);
        const shot=physical?game.aimedWeaponShot(target):
          {origin:{...origin,y:.92},dx:Math.cos(angle),dz:Math.sin(angle),reach:Math.max(.08,gap(origin,target))};
        const travel=Math.max(.08,shot.reach/26);
        if(weapon.form==='crossbow')view.motion.rifle(shot.origin,shot.dx,shot.dz,shot.reach,weapon.tone,travel,i===hits-1);
        else if(weapon.form==='orb')view.relicOrbShot(shot,travel,weapon.tone);
        else if(weapon.form==='feather')view.relicFeatherShot(shot,travel,weapon.tone);
        else view.comboArrow(shot.origin,shot.dx,shot.dz,shot.reach,weapon.tone,travel,i===hits-1);
        const impact={x:shot.origin.x+shot.dx*shot.reach,z:shot.origin.z+shot.dz*shot.reach};
        schedule(travel,()=>{
          if(weapon.id==='red-bow'||weapon.id==='lion-crossbow')
            view.threatImpact({...impact,kind:'circle',radius,tint:weapon.tone,effect:weapon.effect});
          burst(impact,radius,1,i);
        });
      });
      break;
    case 'minion': {
      const gunslinger=weapon.id==='western-rifle';
      const firesnake=weapon.id==='zhurong-axe';
      const spawn=gunslinger||firesnake?position(origin,bearing+Math.PI*.67,1.08):center;
      const summon=view.relicCompanion(weapon,spawn,.50+hits*interval);
      let point={...spawn};
      for(let i=0;i<hits;i++)schedule(.13+i*interval,()=>{
        const target=closest(game,point,gunslinger?10.5:8.7);
        const direction=aim(point,target??offset(point,bearing,range*.65));
        if(gunslinger){
          if(!target)return;
          const impact={x:target.x,z:target.z};
          const shot=view.relicShot(summon,point,direction,impact,weapon.tone);
          game.audio.ghostRifle();
          let landed=false;
          const sections=4;
          for(let section=1;section<=sections;section++)schedule(shot.duration*section/sections,()=>{
            if(landed)return;
            let contact;
            let nearest=Infinity;
            for(const foe of game.enemies){
              if(!live(foe))continue;
              const x=foe.x-shot.origin.x,z=foe.z-shot.origin.z;
              const along=x*shot.dx+z*shot.dz;
              const size=foe.kind==='boss'?.85:.42;
              if(along<-size||along>shot.reach*section/sections+size||along>=nearest
                ||along<shot.reach*(section-1)/sections-size||Math.abs(x*shot.dz-z*shot.dx)>size)continue;
              nearest=along;contact=foe;
            }
            if(contact){
              landed=true;
              view.elementBurst(contact.x,.65,contact.z,weapon.tone,'void',6,.79,direction);
              strike(contact,spawn,1.02,.53);
            }
          });
        }else if(firesnake){
          summon.mesh.rotation.y=-direction;
          const mouth=offset(point,direction,.67);
          ray(mouth,direction,Math.min(6.3,range),radius*.44,i);
        }else if(target){
          const start=point;
          const travel=Math.min(weapon.id==='turtle-bow'?3.6:2.85,gap(start,target));
          point=position(start,direction,travel);
          const landing=point;
          view.relicLunge(summon,start,landing,direction);
          schedule(.16,()=>{
            if(weapon.id==='turtle-bow'){
              view.slash(landing.x,landing.z,Math.cos(direction),Math.sin(direction),weapon.tone,radius,true);
            }
            burst(landing,radius,1,i,true,weapon.id==='turtle-bow'?1.45:.76);
          });
        }
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
      ()=>burst(action==='blink'?origin:center,radius*.84,.48+rank*.075,hits+i,true,.40,'blessing'));
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
    if(game.hit(unit,power,game.hero,1.24,weapon.tone,'heavy',undefined,counter.linked?'link':'skill')&&weapon.element==='ice')unit.chill=Math.max(unit.chill,1.3+rank*.4);
  }
}
