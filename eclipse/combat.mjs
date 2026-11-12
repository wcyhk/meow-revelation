const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const active = game => {
  const foes=game.enemies.filter(foe=>foe.hp>0 && foe.age>=.23);
  const anchors=game.bossArena?.targets;
  return anchors?.length ? [...anchors,...foes] : foes;
};

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
  } else if (arm.id==='stormbow') {
    const touched=new Set();
    for (const offset of finish?[-.16,0,.16]:[0]) {
      const x=dx*Math.cos(offset)-dz*Math.sin(offset), z=dx*Math.sin(offset)+dz*Math.cos(offset);
      view.thrust(h.x,h.z,x,z,reach,arm.tone,false);
      for (const enemy of lineTargets(targets,h,x,z,reach,.44)) {
        if (!touched.has(enemy)&&game.hit(enemy,power,h,.48)) hits++;
        touched.add(enemy);
      }
    }
  } else if (arm.id==='frostlute') {
    view.wave(h.x,h.z,dx,dz,reach,arm.tone,finish);
    for (const enemy of lineTargets(targets,h,dx,dz,reach,finish?1.08:.68)) {
      enemy.chill=Math.max(enemy.chill,finish?2.5:1.7);
      if (game.hit(enemy,power,h,.55)) hits++;
    }
  } else if (arm.id==='chakra') {
    const source={x:h.x,z:h.z};
    view.spinningDisk(source.x,source.z,dx,dz,reach,arm.tone);
    for (const enemy of lineTargets(targets,source,dx,dz,reach,.7)) {
      if (game.hit(enemy,power,source,.38)) hits++;
    }
    game.schedule(.38,()=>{
      const end={x:source.x+dx*reach,z:source.z+dz*reach};
      view.spinningDisk(end.x,end.z,-dx,-dz,reach,arm.tone);
      for (const enemy of lineTargets(active(game),end,-dx,-dz,reach,.73)) game.hit(enemy,power*.72,end,.44);
    });
  } else {
    view.slash(h.x,h.z,dx,dz,arm.tone,reach,finish);
    const wide=arm.id==='windhalberd';
    if ((arm.id==='tiger'||wide)&&finish) view.shock(h.x,h.z,arm.tone,reach,.54);
    for (const foe of targets) {
      const x=foe.x-h.x, z=foe.z-h.z;
      const d=Math.hypot(x,z);
      const facing=(dx*x+dz*z)/Math.max(.03,d);
      const margin=foe.kind==='boss'?.73:.22;
      const sweepsAll=(arm.id==='tiger'||wide)&&finish;
      if (d>reach+margin || (!sweepsAll && d>1.02 && facing<(wide?-.17:finish?-.16:.12))) continue;
      if (arm.id==='turtle') foe.chill=Math.max(foe.chill,finish?2.2:1.55);
      if (game.hit(foe,power,h,finish?(wide?2.75:1.6):.88)) {
        hits++;
        if (finish&&arm.id==='flameblade') {
          const center={x:foe.x,z:foe.z};
          game.schedule(.18,()=>{
            view.threatImpact({...center,kind:'circle',radius:1.45,tint:arm.tone,effect:'fire',pattern:'burst'});
            for (const enemy of active(game)) if (distance(enemy,center)<1.57) game.hit(enemy,power*.35,center,.53);
          });
        }
      }
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
    case 'flameblade': {
      const center=targetCenter(game,dx,dz,range);
      game.bound(center);
      for (let pulse=0;pulse<3;pulse++) {
        const angle=pulse*Math.PI*2/3;
        const point={x:center.x+Math.cos(angle)*.8,z:center.z+Math.sin(angle)*.8};
        game.schedule(.12+pulse*.24,()=>{
          view.threatImpact({...point,kind:'circle',radius:2.52,tint:arm.tone,effect:'fire',pattern:'burst'});
          for (const enemy of active(game)) if (distance(enemy,point)<2.69) game.hit(enemy,power,point,.87);
        });
      }
      break;
    }
    case 'stormbow':
      view.thrust(origin.x,origin.z,dx,dz,range,arm.tone,true);
      for (const enemy of lineTargets(active(game),origin,dx,dz,range,1.03)) game.hit(enemy,power*.84,origin,.42);
      for (let pulse=1;pulse<=4;pulse++) {
        const spot={x:origin.x+dx*range*pulse*.22,z:origin.z+dz*range*pulse*.22};
        game.schedule(pulse*.13,()=>{
          view.bolt(point(spot,6.7),point(spot,.22),arm.tone,1.95);
          view.shock(spot.x,spot.z,arm.tone,1.84,.61);
          for (const enemy of active(game)) if (distance(spot,enemy)<2.05) game.hit(enemy,power,spot,.43);
        });
      }
      break;
    case 'windhalberd':
      for (let pulse=0;pulse<3;pulse++) game.schedule(.07+pulse*.24,()=>{
        view.vortex(h.x,h.z,range,arm.tone);
        for (const enemy of active(game)) {
          if (distance(h,enemy)<range+.26) game.hit(enemy,power,h,pulse===2?2.54:.95);
        }
      });
      break;
    case 'frostlute': {
      const center=targetCenter(game,dx,dz,range);
      game.bound(center);
      for (let pulse=0;pulse<3;pulse++) game.schedule(.12+pulse*.42,()=>{
        view.threatImpact({...center,kind:'circle',radius:2.76+pulse*.23,tint:arm.tone,effect:'ice',pattern:'icicles'});
        for (const enemy of active(game)) {
          if (distance(center,enemy)>2.95+pulse*.23) continue;
          enemy.chill=Math.max(enemy.chill,3.2);
          game.hit(enemy,power,center,.44);
        }
      });
      break;
    }
    case 'chakra':
      for (let pulse=0;pulse<3;pulse++) game.schedule(.08+pulse*.27,()=>{
        const radius=range*(1-pulse*.25);
        view.threatImpact({...origin,kind:'ring',radius,width:radius*.38,tint:arm.tone,effect:'gold',pattern:'ring'});
        for (const enemy of active(game)) {
          const gap=distance(origin,enemy);
          if (gap<radius+.34 && (pulse===2||gap>radius*.62)) game.hit(enemy,power,origin,-1.05);
        }
      });
      break;
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
