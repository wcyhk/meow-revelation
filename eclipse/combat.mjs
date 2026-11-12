const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const active = game => game.enemies.filter(foe=>foe.hp>0 && foe.age>=.23);

function point(unit,y) {return {x:unit.x,y,z:unit.z};}

function closest(units,from,limit) {
  let found;
  for (const target of units) {
    const d=distance(from,target);
    if (d<=limit) {
      found=target;
      limit=d;
    }
  }
  return found;
}

function lineTargets(units,origin,dx,dz,range,width) {
  return units.filter(unit=>{
    const x=unit.x-origin.x, z=unit.z-origin.z;
    const margin=unit.kind==='boss'?.69:.22;
    const along=x*dx+z*dz;
    return along>=-.29 && along<=range+margin && Math.abs(-x*dz+z*dx)<width+margin;
  });
}

export function strikeWith(game,dx,dz) {
  const {hero:h,view,weapon:arm}=game;
  const finish=h.combo===3;
  const targets=active(game);
  const reach=h.reach+(finish?.4:0);
  const power=h.damage*(finish?h.finisher:h.combo===2?1.12:1)*(h.surge>0?1.3:1);
  let hits=0;
  if (arm.id==='dragon') {
    const aimPoint={x:h.x+dx*reach*.72,z:h.z+dz*reach*.72};
    const candidates=lineTargets(targets,h,dx,dz,reach,1.1);
    const first=closest(candidates,aimPoint,reach) || closest(targets,h,Math.min(1.8,reach));
    const end=first?point(first,.84):{x:h.x+dx*reach,y:.73,z:h.z+dz*reach};
    view.bolt(point(h,.78),end,arm.tone,finish?1.6:1);
    if (!first) return 0;
    if (game.hit(first,power,h,.28)) hits++;
    const second=closest(targets.filter(foe=>foe!==first),first,3.45);
    if (second) {
      view.bolt(end,point(second,.65),arm.tone);
      if (game.hit(second,power*.56,first,.21)) hits++;
    }
  } else if (arm.id==='phoenix') {
    view.wave(h.x,h.z,dx,dz,reach,arm.tone);
    for (const foe of lineTargets(targets,h,dx,dz,reach,.80)) {
      if (game.hit(foe,power,h,finish?1.15:.42)) hits++;
    }
  } else if (arm.id==='qilin') {
    view.thrust(h.x,h.z,dx,dz,reach,arm.tone,finish);
    for (const foe of lineTargets(targets,h,dx,dz,reach,finish?.99:.61)) {
      if (game.hit(foe,power,h,finish?2.65:.93)) hits++;
    }
  } else {
    view.slash(h.x,h.z,dx,dz,arm.tone,reach,finish);
    if (arm.id==='tiger' && finish) view.shock(h.x,h.z,arm.tone,reach,.54);
    for (const foe of targets) {
      const x=foe.x-h.x, z=foe.z-h.z;
      const d=Math.hypot(x,z);
      const facing=(dx*x+dz*z)/Math.max(.03,d);
      const margin=foe.kind==='boss'?.73:.22;
      const sweepsAll=arm.id==='tiger' && finish;
      if (d>reach+margin || (!sweepsAll && d>1.02 && facing<(finish?-.16:.12))) continue;
      if (arm.id==='turtle') foe.chill=Math.max(foe.chill,finish?2.2:1.55);
      if (game.hit(foe,power,h,finish?1.6:.88)) hits++;
    }
  }
  return hits;
}

function targetCenter(game,dx,dz,range) {
  const h=game.hero;
  const end={x:h.x+dx*range,z:h.z+dz*range};
  const target=closest(lineTargets(active(game),h,dx,dz,range,1.45),end,range);
  return target ? {x:target.x,z:target.z} : end;
}

export function invokeArm(game,input) {
  const {hero:h,view,weapon:arm}=game;
  const [dx,dz]=game.aim(input,Math.max(h.reach+.8,h.spellRadius+.55));
  const origin={x:h.x,z:h.z};
  const range=h.spellRadius, power=h.spellDamage;
  h.dx=dx; h.dz=dz;
  if (Math.abs(dx)>.12) h.face=Math.sign(dx);
  h.attackAge=0;
  switch (arm.id) {
    case 'tiger':
      h.rolling=.35;
      h.rollDuration=.35;
      h.rollX=dx; h.rollZ=dz;
      h.rollSpeed=range/.35;
      h.invulnerable=Math.max(h.invulnerable,.42);
      h.attackAge=1; h.slash=null;
      h.rush=new Set();
      view.shock(h.x,h.z,arm.tone,1.67,.78);
      break;
    case 'dragon': {
      const aim=targetCenter(game,dx,dz,range);
      const struck=new Set();
      for (let pulse=0;pulse<3;pulse++) {
        game.schedule(.09+pulse*.27,()=>{
          const enemies=active(game);
          const focus=closest(enemies.filter(foe=>!struck.has(foe)),aim,range*.68)
            || closest(enemies,aim,range*.68) || aim;
          struck.add(focus);
          view.bolt(point(focus,7.0),point(focus,.28),arm.tone,2.45);
          view.shock(focus.x,focus.z,arm.tone,range*.31,.84);
          for (const foe of enemies) {
            if (distance(foe,focus)<range*.31+.25) game.hit(foe,power,focus,.71);
          }
        });
      }
      break;
    }
    case 'phoenix':
      for (let pulse=0;pulse<3;pulse++) {
        game.schedule(.02+pulse*.19,()=>{
          view.wave(origin.x,origin.z,dx,dz,range,arm.tone,true);
          for (const foe of lineTargets(active(game),origin,dx,dz,range,1.17)) {
            game.hit(foe,power,origin,.65);
            foe.exposed=3.3;
          }
        });
      }
      break;
    case 'turtle':
      h.ward=3;
      view.shock(h.x,h.z,arm.tone,range,.76);
      for (const foe of active(game)) {
        if (distance(h,foe)<range+.22) {
          game.hit(foe,power*.72,h,.97);
          foe.chill=2.6;
        }
      }
      break;
    case 'qilin': {
      const center=targetCenter(game,dx,dz,range);
      game.bound(center);
      h.surge=2.6;
      for (let pulse=0;pulse<5;pulse++) {
        game.schedule(.05+pulse*.47,()=>{
          const radius=range*.76;
          view.vortex(center.x,center.z,radius,arm.tone);
          for (const foe of active(game)) {
            const d=distance(foe,center);
            if (d>radius+.23) continue;
            game.hit(foe,power,center,-2.25);
            foe.chill=Math.max(foe.chill,.55);
          }
        });
      }
      break;
    }
  }
}

export function rushHit(game,start) {
  const {hero:h,view,weapon:arm}=game;
  const step=distance(h,start);
  for (const foe of lineTargets(active(game),start,h.rollX,h.rollZ,step+.27,.86)) {
    if (h.rush.has(foe)) continue;
    h.rush.add(foe);
    game.hit(foe,h.spellDamage,start,1.28);
  }
  if (Math.random()<.65) view.spark(h.x,.36,h.z,arm.tone,4,.78);
}

export function reflectHit(game,attacker) {
  const {hero:h,view,weapon:arm}=game;
  const range=h.spellRadius;
  view.shock(h.x,h.z,arm.tone,range,.85);
  const target=attacker?.hp>0 ? attacker : closest(active(game),h,range+.8);
  if (!target) return;
  view.bolt(point(h,.61),point(target,.77),arm.tone,1.68);
  game.hit(target,h.spellDamage*1.15,h,1.22);
  target.chill=2.4;
}
