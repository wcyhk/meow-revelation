const TAU = Math.PI*2;
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);

function direction(origin,target) {
  const length=distance(origin,target);
  return length>.03 ? [(target.x-origin.x)/length,(target.z-origin.z)/length] : [0,1];
}

export function telegraph(game,pattern,origin,target,{delay,damage,radius,owner=null,phase=0}) {
  const stage=game.stage;
  const tint=stage.zone.color;
  const [dx,dz]=direction(origin,target);
  const bearing=Math.atan2(dz,dx);
  const stageBearing=stage.bearing+phase*.36;
  const boss=owner?.kind==='boss';
  const source={x:origin.x,z:origin.z};
  const aim={x:target.x,z:target.z};
  const zone=(kind,center,size,wait=delay,width=0,angle=0)=>{
    const effect={kind,...center,radius:size,width,angle,delay:wait,damage,owner,tint,pattern};
    game.hazards.push(effect);
    game.view.warning(kind,center.x,center.z,size,wait,-angle,width);
  };
  const ring=(center,outer,band,wait)=>zone('ring',center,outer,wait,band);
  const line=(center,length,width,angle,wait)=>zone('line',center,length,wait,width,angle);
  const circle=(center,size,wait)=>zone('circle',center,size,wait);
  const rays=(center,angles,speed,wait)=>{
    game.hazards.push({kind:'release',...center,angles,speed,delay:wait,damage,owner,tint,pattern});
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
      if (owner?.summons<2) game.hazards.push({kind:'summon',...source,delay,owner,tint});
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
  if (hazard.kind==='ring') return d<hazard.radius+.12 && d>hazard.radius-hazard.width-.12;
  return d<hazard.radius+.12;
}

export function advanceThreats(game,dt) {
  const queued=game.hazards;
  game.hazards=[];
  const {view,hero}=game;
  const lantern=game.lanternTarget();
  for (const hazard of queued) {
    hazard.delay-=dt;
    if (hazard.kind==='projectile') {
      hazard.x+=hazard.dx*hazard.speed*dt;
      hazard.z+=hazard.dz*hazard.speed*dt;
      view.moveProjectile(hazard.visual,hazard.x,hazard.z);
      if (hazard.delay<=0 || Math.abs(hazard.x)>12 || hazard.z<-8.5 || hazard.z>12 || game.isBlocked(hazard,.17)
        || (distance(hero,hazard)<.64 && game.hurt(hazard.damage,hazard.x,hazard.z,hazard.owner))
        || (lantern && hazard.owner?.raider && distance(lantern,hazard)<.74 && game.mission.hurtLantern(hazard.damage))) {
        view.removeProjectile(hazard.visual);
      } else game.hazards.push(hazard);
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
        game.hazards.push({...hazard,kind:'projectile',x,z,dx,dz,delay:2.9,visual:view.makeProjectile(x,z,hazard.tint)});
      }
      view.spark(hazard.x,.7,hazard.z,hazard.tint,13,1.1);
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
    if (withinThreat(hero,hazard)) game.hurt(hazard.damage,hazard.x,hazard.z,hazard.owner);
    if (lantern && hazard.owner?.raider && withinThreat(lantern,hazard)) game.mission.hurtLantern(hazard.damage);
  }
}
