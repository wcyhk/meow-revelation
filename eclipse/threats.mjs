import {roomBounds} from './lantern-route.mjs?v=nightfall-1';

const TAU = Math.PI*2;
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);

function direction(origin,target) {
  const length=distance(origin,target);
  return length>.03 ? [(target.x-origin.x)/length,(target.z-origin.z)/length] : [0,1];
}

export function telegraph(game,pattern,origin,target,{delay,damage,radius,owner=null,phase=0}) {
  const stage=game.stage;
  const tint=owner?.spec.tint??stage.zone.color;
  const effect=owner?.spec.effect??stage.zone.effect;
  const [dx,dz]=direction(origin,target);
  const bearing=Math.atan2(dz,dx);
  const stageBearing=stage.bearing+phase*.36;
  const boss=owner?.kind==='boss';
  const source={x:origin.x,z:origin.z};
  const aim={x:target.x,z:target.z};
  const bossPhase=boss?phase:undefined;
  const windup=owner?.attack;
  const active=windup?()=>!windup.interrupted&&owner.hp>0:undefined;
  const zone=(kind,center,size,wait=delay,width=0,angle=0,residue=null)=>{
    const hazard={kind,...center,radius:size,width,angle,delay:wait,damage,owner,tint,pattern,effect,residue,source,aim,bossPhase,windup};
    game.hazards.push(hazard);
    game.view.warning(kind,center.x,center.z,size,wait,-angle,width,tint,active);
    if (pattern==='icicles') game.view.fallingShard(center.x,center.z,size,wait,tint,active);
  };
  const ring=(center,outer,band,wait)=>zone('ring',center,outer,wait,band);
  const line=(center,length,width,angle,wait)=>zone('line',center,length,wait,width,angle);
  const circle=(center,size,wait)=>zone('circle',center,size,wait);
  const rays=(center,angles,speed,wait,returning=false)=>{
    game.hazards.push({kind:'release',...center,angles,speed,delay:wait,damage,owner,tint,pattern,effect,returning,bossPhase,windup});
  };
  const around=(center,angle,length)=>({x:center.x+Math.cos(angle)*length,z:center.z+Math.sin(angle)*length});
  switch (pattern) {
    case 'burst':
      circle(around(source,bearing,boss?.66:.48),radius,delay);
      break;
    case 'pounce': {
      const span=boss?8.6:5.1;
      line(around(source,bearing,span*.43),span,boss?1.12:.71,bearing,delay);
      break;
    }
    case 'marked':
      circle(aim,radius,delay);
      if (boss||stage.room>=6) circle(around(aim,stageBearing,2.8),radius*.82,delay+.21);
      break;
    case 'cross': {
      const turn=boss ? bearing : stageBearing;
      line(aim,boss?16.4:11.4,boss?1.05:.79,turn,delay);
      line(aim,boss?16.4:11.4,boss?1.05:.79,turn+Math.PI/2,delay+.19);
      break;
    }
    case 'ring':
      ring(aim,boss?4.55:3.35,boss?1.36:1.0,delay);
      if (boss) ring(aim,6.4,1.31,delay+.48);
      break;
    case 'barrage': {
      const count=boss?7:3;
      const angles=Array.from({length:count},(_,i)=>bearing+(i-(count-1)/2)*.21);
      circle(source,.85,delay);
      line(around(source,bearing,3.0),6.0,.54,bearing,delay);
      rays(source,angles,boss?7.2:5.65,delay);
      break;
    }
    case 'sweep': {
      const spin=bearing+Math.PI/2;
      for (let i=-1;i<=1;i++) {
        const center=around(aim,bearing,i*2.9);
        line(center,boss?16:12,boss?.91:.69,spin,delay+(i+1)*.30);
      }
      break;
    }
    case 'prison':
      for (let i=0;i<4;i++) circle(around(aim,stageBearing+i*TAU/4,boss?2.65:2.33),boss?2.00:1.25,delay+i*.14);
      break;
    case 'spiral': {
      const arms=boss?7:5;
      circle(source,1.15,delay);
      for (let wave=0;wave<(boss?3:2);wave++) {
        const angles=Array.from({length:arms},(_,i)=>stageBearing+i*TAU/arms+wave*.35);
        rays(source,angles,4.4+wave*.68,delay+wave*.34);
      }
      break;
    }
    case 'eclipse':
      ring(aim,4.8,1.85,delay);
      circle(aim,2.04,delay+.57);
      if (boss) line(aim,17,1.09,stageBearing,delay+.84);
      break;
    case 'summon':
      circle(source,1.40,delay);
      if (owner?.summons<2) game.hazards.push({kind:'summon',...source,delay,owner,tint,windup});
      break;
    case 'cleave':
      zone('cone',source,boss?5.6:3.6,delay,boss?1.00:.73,bearing);
      if (boss) zone('cone',source,6.3,delay+.43,.69,bearing+(phase%2?-.91:.91));
      break;
    case 'icicles': {
      const count=boss?5:2;
      for (let index=0;index<count;index++) {
        const offset=index===0?0:1.75+(index%2)*.65;
        const center=around(aim,stageBearing+index*1.64,offset);
        circle(center,(boss?1.6:1.19)+index*.06,delay+index*.20);
      }
      break;
    }
    case 'cinders': {
      const span=boss?12.5:6.3;
      zone('line',around(source,bearing,span*.43),span,delay,boss?1.12:.74,bearing,'embers');
      if (boss) zone('line',aim,10.4,delay+.52,.91,bearing+1.12,'embers');
      break;
    }
    case 'web':
      zone('circle',aim,boss?2.66:1.93,delay,0,0,'snare');
      if (boss) zone('circle',around(aim,stageBearing,3.38),2.20,delay+.44,0,0,'snare');
      break;
    case 'rally':
      game.hazards.push({kind:'rally',...source,delay,owner,tint,effect,radius:boss?6.1:4.0,windup});
      game.view.warning('aura',source.x,source.z,boss?6.1:4.0,delay,0,0,tint,active);
      if (boss) circle(aim,1.55,delay+.35);
      break;
    case 'feathers': {
      const count=boss?9:3;
      const angles=Array.from({length:count},(_,index)=>bearing+(index-(count-1)/2)*.19);
      line(around(source,bearing,3.2),6.4,.66,bearing,delay);
      rays(source,angles,boss?8.4:7.3,delay);
      if (boss) rays(source,angles.filter((_,index)=>index%2===0).map(angle=>angle+.11),8.9,delay+.34);
      break;
    }
    case 'roots':
      for (let i=0;i<(boss?5:3);i++) {
        const center=around(aim,bearing+(i%2?Math.PI/2:-Math.PI/2),i*.98);
        zone('circle',center,boss?1.6:1.09,delay+i*.16,0,0,'snare');
      }
      break;
    case 'coins': {
      const count=boss?8:4;
      const angles=Array.from({length:count},(_,index)=>bearing+(index-(count-1)/2)*.23);
      circle(source,1.2,delay);
      rays(source,angles,boss?6.8:5.4,delay,true);
      if (boss) rays(source,angles.map(angle=>angle+Math.PI),6.1,delay+.23,true);
      break;
    }
    case 'blink': {
      const destination=around(aim,bearing+(boss?.75:1.22),boss?2.45:1.92);
      game.bound(destination);
      const landing=game.isBlocked(destination,.45)?source:destination;
      circle(landing,boss?2.35:1.56,delay);
      if (boss) circle(aim,1.48,delay+.40);
      return landing;
    }
    case 'gravity':
      zone('circle',aim,boss?3.55:2.39,delay,0,0,'pull');
      if (boss) ring(aim,5.05,.99,delay+.58);
      break;
    case 'lance': {
      const length=boss?14.2:8.4;
      line(around(source,bearing,length*.44),length,boss?.88:.63,bearing,delay);
      if (boss) {
        line(around(source,bearing+.36,length*.43),length,.74,bearing+.36,delay+.23);
        line(around(source,bearing-.36,length*.43),length,.74,bearing-.36,delay+.44);
      }
      break;
    }
    case 'jaws': {
      const gap=boss?2.57:1.95, length=boss?13.4:7.6;
      for(const side of [-1,1]) line(around(aim,bearing+side*Math.PI/2,gap),length,boss?.84:.66,bearing,delay);
      line(aim,length,boss?1.20:.79,bearing,delay+(boss?.36:.31));
      break;
    }
    case 'toll':
      ring(aim,boss?5.12:3.72,boss?1.11:.82,delay);
      ring(aim,boss?3.43:2.40,boss?1.03:.71,delay+.32);
      circle(aim,boss?1.87:1.32,delay+.67);
      break;
    case 'gravefan':
      zone('cone',source,boss?8.14:6.18,delay,boss?.72:.60,bearing-.47);
      zone('cone',source,boss?8.14:6.18,delay+.31,boss?.73:.60,bearing+.47);
      if(boss) rays(source,[bearing-.14,bearing,bearing+.14],7.8,delay+.62);
      break;
  }
}

export function withinThreat(point,hazard) {
  if (hazard.kind==='line') {
    const x=point.x-hazard.x,z=point.z-hazard.z;
    const sin=Math.sin(hazard.angle),cos=Math.cos(hazard.angle);
    return Math.abs(x*cos+z*sin)<hazard.radius*.5 && Math.abs(-x*sin+z*cos)<hazard.width+.13;
  }
  const d=distance(point,hazard);
  if (hazard.kind==='cone') {
    if (d>hazard.radius+.13) return false;
    if (d<.24) return true;
    const dot=((point.x-hazard.x)*Math.cos(hazard.angle)+(point.z-hazard.z)*Math.sin(hazard.angle))/d;
    return dot>Math.cos(hazard.width+.05);
  }
  if (hazard.kind==='ring') return d<hazard.radius+.12 && d>hazard.radius-hazard.width-.12;
  return d<hazard.radius+.12;
}

export function advanceThreats(game,dt) {
  const queued=game.hazards;
  game.hazards=[];
  const {view,hero}=game;
  const lantern=game.lanternTarget();
  const counters=game.bossArena?.counters;
  for (const hazard of queued) {
    hazard.delay-=dt;
    if (hazard.tactic&&(hazard.owner.hp<=0||hazard.encounter.phase!==hazard.arenaPhase)) continue;
    if (hazard.windup?.interrupted&&hazard.kind!=='projectile'&&hazard.kind!=='residue') continue;
    if (hazard.kind==='projectile') {
      if (hazard.returning && !hazard.reversed && hazard.delay<1.65) {
        hazard.reversed=true;
        hazard.dx*=-1;
        hazard.dz*=-1;
      }
      hazard.x+=hazard.dx*hazard.speed*dt;
      hazard.z+=hazard.dz*hazard.speed*dt;
      view.moveProjectile(hazard.visual,hazard.x,hazard.z,Math.atan2(hazard.dz,hazard.dx));
      const blocked=game.isBlocked(hazard,.17)||game.relicWalls?.some(wall=>wall.until>game.t&&distance(wall,hazard)<wall.radius);
      if (blocked&&hazard.delay>0) counters?.projectileBlocked(hazard);
      if (hazard.delay<=0 || hazard.x<roomBounds.minX-.55 || hazard.x>roomBounds.maxX+.55 || hazard.z<roomBounds.minZ-.55 || hazard.z>roomBounds.maxZ+.55 || blocked
        || (distance(hero,hazard)<.64 && game.hurt(hazard.damage,hazard.x,hazard.z,hazard.owner,hazard.pattern))
        || (lantern && hazard.owner?.raider && distance(lantern,hazard)<.74 && game.mission.hurtLantern(hazard.damage))) {
        view.removeProjectile(hazard.visual);
      } else game.hazards.push(hazard);
      continue;
    }
    if (hazard.kind==='residue') {
      if (hazard.delay>0) {
        if (withinThreat(hero,{...hazard,kind:hazard.shape}) && hero.rolling<=0) {
          if (hazard.residue==='embers') game.hurt(hazard.damage*.46,hazard.x,hazard.z,hazard.owner);
          if (hazard.residue==='snare') hero.snared=.19;
          if (hazard.residue==='pull') {
            const [x,z]=direction(hero,hazard);
            if (distance(hero,hazard)>.35) game.moveUnit(hero,x*dt*3.35,z*dt*3.35,.38);
          }
        }
        counters?.riftStep(hazard);
        game.hazards.push(hazard);
      }
      continue;
    }
    if (hazard.owner?.hp<=0) continue;
    if (hazard.delay>0) {
      game.hazards.push(hazard);
      continue;
    }
    if (hazard.kind==='release') {
      for (const angle of hazard.angles) {
        const dx=Math.cos(angle),dz=Math.sin(angle);
        const x=hazard.x+dx*.6,z=hazard.z+dz*.6;
        game.hazards.push({...hazard,kind:'projectile',x,z,dx,dz,delay:2.9,
          visual:view.makeProjectile(x,z,hazard.tint,hazard.effect,hazard.pattern)});
      }
      view.spark(hazard.x,.7,hazard.z,hazard.tint,13,1.1);
      continue;
    }
    if (hazard.kind==='rally') {
      for (const ally of game.enemies) if (ally.hp>0 && distance(ally,hazard)<hazard.radius) ally.morale=3.5;
      view.vortex(hazard.x,hazard.z,hazard.radius,hazard.tint);
      continue;
    }
    if (hazard.kind==='summon') {
      if (hazard.owner.summons<2 && game.enemies.length<5) {
        hazard.owner.summons++;
        const stage=game.stage;
        const location=stage.positions[hazard.owner.summons+2];
        game.spawn(stage.zone.foes[(hazard.owner.summons+stage.chapter)%stage.zone.foes.length],location.x,location.z);
      }
      continue;
    }
    view.threatImpact(hazard);
    if(hazard.relicWeapon)view.relicPulse(hazard.relicWeapon,hazard,hazard.radius,hazard.relicPulse);
    if (hazard.arena) hazard.arena.resolve(hazard);
    const caughtByPillar=counters?.impact(hazard);
    if (!caughtByPillar&&withinThreat(hero,hazard)) {
      const struck=game.hurt(hazard.damage,hazard.x,hazard.z,hazard.owner,hazard.pattern);
      if (struck && hazard.pattern==='icicles') hero.snared=1.08;
    }
    if (lantern && hazard.owner?.raider && withinThreat(lantern,hazard)) game.mission.hurtLantern(hazard.damage);
    if (hazard.residue) {
      const duration=hazard.residue==='embers'?2.1:2.7;
      const residue={...hazard,shape:hazard.kind,kind:'residue',delay:hazard.tactic==='seal'?2.75:duration};
      game.hazards.push(residue);
      const counterable=counters?.watchRift(residue);
      if (hazard.tactic==='seal'||counterable) view.openBossFissure(residue);
      else view.lingeringThreat(hazard,duration);
    }
  }
}
