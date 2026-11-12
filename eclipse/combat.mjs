import {comboMove} from './weapon-combos.mjs?v=links-1';

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

function lineTargets(units,origin,dx,dz,range,width,start=0) {
  return units.filter(unit=>{
    const x=unit.x-origin.x, z=unit.z-origin.z;
    const margin=unit.kind==='boss'?.69:.22;
    const along=x*dx+z*dz;
    return along>=Math.max(-.29,start-margin)&&along<=range+margin&&Math.abs(-x*dz+z*dx)<width+margin;
  });
}

function arcTargets(units,origin,dx,dz,reach,halfAngle,all=false) {
  const edge=Math.cos(halfAngle);
  return units.filter(unit=>{
    const x=unit.x-origin.x,z=unit.z-origin.z;
    const gap=Math.hypot(x,z);
    return gap<=reach+(unit.kind==='boss'?.73:.22)
      && (all||gap<.89||(x*dx+z*dz)/Math.max(.03,gap)>=edge);
  });
}

function turned(dx,dz,angle) {
  return [dx*Math.cos(angle)-dz*Math.sin(angle),dx*Math.sin(angle)+dz*Math.cos(angle)];
}

export function strikeTravel(move,reach,heavy) {
  if (move.shape==='arrow') return reach/(heavy?58:47);
  if (move.shape==='disk') return .38;
  if (move.shape==='cleave') return .12;
  return 0;
}

function bowShot(game,origin,dx,dz,reach,move,tint,heavy,land,confirm) {
  const touched=new Set();
  const duration=strikeTravel(move,reach,heavy);
  const rays=(move.angles??[0]).map(angle=>turned(dx,dz,angle));
  for (const [x,z] of rays) game.view.comboArrow(origin,x,z,reach,tint,duration,heavy);
  const sections=4;
  for (let index=1;index<=sections;index++) {
    game.schedule(duration*index/sections,()=>{
      let hits=0;
      for (const [x,z] of rays) {
        for (const foe of lineTargets(active(game),origin,x,z,reach*index/sections,move.width,reach*(index-1)/sections)) {
          if (touched.has(foe)) continue;
          touched.add(foe);
          if (land(foe,1,origin)) hits++;
        }
      }
      if (hits) confirm?.(hits);
    });
  }
}

export function strikeWith(game,dx,dz,move=comboMove(game.weapon,game.hero.combo),powerScale=1,confirm,onContact) {
  const {hero:h,view,weapon:arm}=game;
  const finish=h.combo===3;
  const targets=active(game);
  const reach=h.reach*move.reach;
  const power=h.damage*(finish?h.finisher:h.combo===2?1.12:1)*(h.surge>0?1.3:1)*powerScale;
  const source={x:h.x,z:h.z};
  const weight=finish?'heavy':'light';
  const land=(unit,scale=1,origin=source,force=move.force)=>game.hit(unit,power*scale,origin,force,arm.tone,weight,onContact);
  let hits=0;
  if (move.shape==='arrow') {
    bowShot(game,source,dx,dz,reach,move,arm.tone,finish,land,confirm);
    return 0;
  }
  if (move.shape==='chain') {
    const aimPoint={x:source.x+dx*reach*.72,z:source.z+dz*reach*.72};
    const candidates=lineTargets(targets,source,dx,dz,reach,move.width);
    const first=closest(candidates,aimPoint,reach)||closest(targets,source,Math.min(1.8,reach));
    const end=first?point(first,.84):{x:source.x+dx*reach,y:.73,z:source.z+dz*reach};
    view.bolt(point(source,.91),end,arm.tone,finish?2.15:1.08);
    if (!first) return 0;
    const struck=new Set([first]);
    if (land(first)) hits++;
    let last=first;
    for (let index=0;index<(move.hops??0);index++) {
      const next=closest(targets.filter(foe=>!struck.has(foe)),last,3.45);
      if (!next) break;
      view.bolt(point(last,.81),point(next,.66),arm.tone,finish?1.43:1.01);
      struck.add(next);
      if (land(next,index===0?.64:.43,last,move.force*.47)) hits++;
      last=next;
    }
    if (move.burst) {
      view.shock(first.x,first.z,arm.tone,move.burst,.61);
      for (const foe of targets) {
        if (!struck.has(foe)&&distance(foe,first)<move.burst&&land(foe,.44,first)) hits++;
      }
    }
    return hits;
  }
  if (move.shape==='disk') {
    const curve=move.curve??0;
    view.spinningDisk(source.x,source.z,dx,dz,reach,arm.tone,curve,finish);
    const path={x:source.x-dz*curve*.52,z:source.z+dx*curve*.52};
    for (const foe of lineTargets(targets,path,dx,dz,reach,move.width)) if (land(foe)) hits++;
    game.schedule(.38,()=>{
      const end={x:source.x+dx*reach,z:source.z+dz*reach};
      view.spinningDisk(end.x,end.z,-dx,-dz,reach,arm.tone,curve,finish);
      const returning={x:end.x+dz*curve*.48,z:end.z-dx*curve*.48};
      let contacts=0;
      for (const foe of lineTargets(active(game),returning,-dx,-dz,reach,move.width+.03)) {
        if (land(foe,finish?.78:.69,end,move.force*.62)) contacts++;
      }
      if (contacts) confirm?.(contacts);
    });
    return hits;
  }

  view.comboTrail(source,dx,dz,reach,arm.tone,move,finish,arm.id);
  let affected;
  if (move.shape==='fan') {
    const lanes=new Set();
    for (const angle of [-.245,0,.245]) {
      const [x,z]=turned(dx,dz,angle);
      for (const foe of lineTargets(targets,source,x,z,reach,move.width)) lanes.add(foe);
    }
    affected=lanes;
  } else if (move.shape==='line'||move.shape==='wave') {
    affected=lineTargets(targets,source,dx,dz,reach,move.width);
  } else {
    affected=arcTargets(targets,source,dx,dz,reach,move.width,move.shape==='circle');
  }
  let impact;
  for (const foe of affected) {
    if (move.chill) foe.chill=Math.max(foe.chill,move.chill);
    if (!land(foe)) continue;
    hits++;
    if (!impact||distance(source,foe)<distance(source,impact)) impact={x:foe.x,z:foe.z};
  }
  if (move.shape==='cleave') {
    const center=impact??{x:source.x+dx*reach*.73,z:source.z+dz*reach*.73};
    game.bound(center);
    game.schedule(.12,()=>{
      view.threatImpact({...center,kind:'circle',radius:move.burst,tint:arm.tone,effect:'fire',pattern:'burst'});
      let contacts=0;
      for (const enemy of active(game)) {
        if (distance(enemy,center)<move.burst+.10&&land(enemy,.34,center,.53)) contacts++;
      }
      if (contacts) confirm?.(contacts);
    });
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
      view.sealFx(h.x,h.z,arm.tone,1.24,.38);
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
          view.sealFx(focus.x,focus.z,arm.tone,range*.28,.56);
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
          view.wave(origin.x,origin.z,dx,dz,range,arm.tone,true,'fire');
          for (const foe of lineTargets(active(game),origin,dx,dz,range,1.17)) {
            game.hit(foe,power,origin,.65);
            foe.exposed=3.3;
          }
        });
      }
      break;
    case 'turtle':
      h.ward=3;
      h.linkWard=false;
      view.shock(h.x,h.z,arm.tone,range,.76);
      view.sealFx(h.x,h.z,arm.tone,range*.92,.67);
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
        view.motion.bladefall(point.x,point.z,arm.tone,.12+pulse*.24,pulse);
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
          if (pulse===4) view.sealFx(spot.x,spot.z,arm.tone,2.02,.55);
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
        view.sealFx(center.x,center.z,arm.tone,2.12+pulse*.24,.52);
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
        view.sealFx(origin.x,origin.z,arm.tone,radius*.76,.49);
        view.threatImpact({...origin,kind:'ring',radius,width:radius*.38,tint:arm.tone,effect:'gold',pattern:'ring'});
        for (const enemy of active(game)) {
          const gap=distance(origin,enemy);
          if (gap<radius+.34 && (pulse===2||gap>radius*.62)) game.hit(enemy,power,origin,-1.05);
        }
      });
      break;
  }
}

export function invokeLinkedArm(game,link,wind) {
  const {hero:h,view,weapon:arm}=game;
  const {tone}=arm;
  const marks=link.contacts;
  const origin={x:h.x,z:h.z};
  const live=unit=>unit.hp>0&&unit.phaseGuard<=0&&game.enemies.includes(unit);
  const primary=marks.find(mark=>mark.kind==='break'&&live(mark.unit))
    ??marks.find(mark=>live(mark.unit))??marks[0];
  const focus=()=>live(primary.unit)&&distance(primary.unit,primary)<3.6?primary.unit:primary;
  const toward=(from,to)=>{
    const d=distance(from,to);
    return d>.09?[(to.x-from.x)/d,(to.z-from.z)/d]:[link.dx,link.dz];
  };
  const [dx,dz]=toward(origin,focus());
  h.dx=dx; h.dz=dz;
  if (Math.abs(dx)>.12) h.face=Math.sign(dx);
  h.attackAge=0;
  const power=h.spellDamage, range=h.spellRadius;
  const hit=(unit,scale,source,force)=>game.hit(unit,power*scale,source,force,tone);
  const release=(callback,after=0)=>game.schedule(wind+after,callback);
  const impact=(center,radius,effect,pattern)=>view.threatImpact({x:center.x,z:center.z,kind:'circle',radius,tint:tone,effect,pattern});
  const area=(center,radius,callback)=>{
    for (const foe of active(game)) if (distance(foe,center)<=radius+(foe.kind==='boss'?.42:.15)) callback(foe);
  };
  switch (arm.id) {
    case 'tiger':
      h.rolling=h.rollDuration=.32;
      h.rollX=dx; h.rollZ=dz;
      h.rollSpeed=Math.min(range,Math.max(3.7,distance(origin,focus())+1.8))/.32;
      h.invulnerable=Math.max(h.invulnerable,.40);
      h.attackAge=1;
      h.rush=new Set();
      h.rushLink=true;
      view.shock(h.x,h.z,tone,1.55,.76);
      break;
    case 'dragon':
      for (let pulse=0;pulse<3;pulse++) release(()=>{
        const center=focus();
        view.bolt(point(center,7),point(center,.28),tone,2.42);
        view.shock(center.x,center.z,tone,1.93,.82);
        area(center,1.95,foe=>hit(foe,foe===primary.unit?1.12:.64,center,.69));
      },pulse*.19);
      break;
    case 'phoenix': {
      const center={x:focus().x,z:focus().z};
      for (let pulse=0;pulse<3;pulse++) release(()=>{
        const [fx,fz]=turned(dx,dz,(pulse-1)*.45);
        const from={x:center.x-fx*2.2,z:center.z-fz*2.2};
        view.wave(from.x,from.z,fx,fz,4.4,tone,true,'fire');
        if (pulse===2) view.shock(center.x,center.z,tone,1.8,.75);
        for (const foe of lineTargets(active(game),from,fx,fz,4.4,.95)) {
          if (hit(foe,1.08,from,.57)) foe.exposed=Math.max(foe.exposed,3.8);
        }
      },pulse*.15);
      break;
    }
    case 'turtle':
      h.ward=4.3;
      h.linkWard=true;
      release(()=>{
        const center={x:h.x,z:h.z};
        impact(center,range+.45,'ice','icicles');
        view.sealFx(center.x,center.z,tone,range,.73);
        area(center,range+.45,foe=>{
          if (hit(foe,1.08,center,.94)) foe.chill=Math.max(foe.chill,3.45);
        });
      });
      break;
    case 'qilin': {
      h.surge=2.6;
      release(()=>{
        const center=focus();
        const [fx,fz]=toward(h,center);
        const gap=distance(h,center);
        const step=h.rolling>0?0:Math.min(1.56,Math.max(0,gap-1.23));
        for (let i=0;i<4&&step>0;i++) {
          if (game.moveUnit(h,fx*step/4,fz*step/4,.38)<.03) break;
        }
        const from={x:h.x,z:h.z};
        const reach=Math.min(range+1.55,Math.max(2.25,distance(from,center)+.5));
        view.comboTrail(from,fx,fz,reach,tone,{shape:'line',width:.62,pose:'lunge'},true,arm.id);
        for (const foe of lineTargets(active(game),from,fx,fz,reach,.61)) {
          const broken=foe===primary.unit&&primary.kind==='break';
          if (hit(foe,broken?1.70:1.12,from,1.28)&&broken) {
            foe.guardOpen=Math.max(foe.guardOpen,1.62);
            foe.exposed=Math.max(foe.exposed,1.62);
            foe.stun=Math.max(foe.stun,.40);
          }
        }
        const swirl={x:center.x,z:center.z};
        for (const delay of [.06,.33]) game.schedule(delay,()=>{
          view.vortex(swirl.x,swirl.z,2.20,tone);
          area(swirl,2.2,foe=>hit(foe,.56,swirl,-1.18));
        });
      });
      break;
    }
    case 'flameblade': {
      const fires=[];
      for (const mark of marks) {
        if (!fires.some(fire=>distance(fire,mark)<1.15)) fires.push(mark);
        if (fires.length>=3) break;
      }
      const touched=new Set();
      fires.forEach((center,index)=>release(()=>{
        const radius=index===0?2.79:2.27;
        view.motion.bladefall(center.x,center.z,tone,.06,index);
        impact(center,radius,'fire','burst');
        area(center,radius,foe=>{
          if (touched.has(foe)) return;
          if (hit(foe,foe===center.unit?1.58:1.18,center,1.18)) touched.add(foe);
        });
      },index*.08));
      release(()=>{
        impact(primary,2.04,'fire','cinders');
        area(primary,2.10,foe=>hit(foe,.75,primary,.65));
      },.33);
      break;
    }
    case 'stormbow':
      release(()=>{
        const seen=new Set([primary.unit]);
        const chain=(from,foe,hop)=>{
          const end=foe??from;
          if (hop===0) view.bolt(point(end,6.5),point(end,.7),tone,2.53);
          else view.bolt(point(from,.82),point(end,.72),tone,1.69-hop*.15);
          view.shock(end.x,end.z,tone,hop===0?1.32:.77,.59);
          if (foe) hit(foe,Math.max(.53,1.53-hop*.29),from,hop===0?1.07:.48);
          if (hop>=3) return;
          const spot={x:end.x,z:end.z};
          game.schedule(.09,()=>{
            const next=closest(active(game).filter(unit=>!seen.has(unit)&&unit.phaseGuard<=0),spot,3.48);
            if (!next) return;
            seen.add(next);
            chain(spot,next,hop+1);
          });
        };
        chain(focus(),live(primary.unit)?primary.unit:null,0);
      });
      break;
    case 'windhalberd':
      release(()=>{
        const center={x:h.x,z:h.z};
        view.vortex(center.x,center.z,range+1.25,tone);
        area(center,range+1.34,foe=>hit(foe,.87,center,-2.52));
      });
      release(()=>{
        const center={x:h.x,z:h.z};
        view.comboTrail(center,dx,dz,range+.71,tone,{shape:'circle',pose:'whirl'},true,arm.id);
        view.shock(center.x,center.z,tone,range+.71,.83);
        area(center,range+.71,foe=>hit(foe,1.46,center,2.38));
      },.29);
      break;
    case 'frostlute': {
      const center={x:focus().x,z:focus().z};
      for (let pulse=0;pulse<2;pulse++) release(()=>{
        const radius=2.18+pulse*.65;
        view.sealFx(center.x,center.z,tone,radius*.88,.55);
        impact(center,radius,'ice','icicles');
        area(center,radius,foe=>{
          if (hit(foe,foe.chill>0?1.36:.77,center,.54)) foe.chill=Math.max(foe.chill,4.3);
        });
      },pulse*.25);
      break;
    }
    case 'chakra':
      release(()=>{
        const center=focus(), end={x:h.x,z:h.z};
        const [fx,fz]=toward(center,end);
        const length=Math.max(.65,distance(center,end));
        view.spinningDisk(center.x,center.z,fx,fz,length,tone,-.42,true);
        for (const foe of lineTargets(active(game),center,fx,fz,length,1.05)) hit(foe,1.28,end,1.26);
        game.schedule(.30,()=>{
          view.shock(end.x,end.z,tone,2.71,.85);
          view.sealFx(end.x,end.z,tone,2.4,.49);
          area(end,2.72,foe=>hit(foe,1.11,end,-.83));
        });
      });
      break;
  }
}

export function rushHit(game,start) {
  const {hero:h,view,weapon:arm}=game;
  const step=distance(h,start);
  view.motion.rush(start,h,arm.tone);
  for (const foe of lineTargets(active(game),start,h.rollX,h.rollZ,step+.27,.86)) {
    if (h.rush.has(foe)) continue;
    h.rush.add(foe);
    game.hit(foe,h.spellDamage,start,1.28);
  }
  if (Math.random()<.65) view.spark(h.x,.36,h.z,arm.tone,4,.78);
}

export function finishLinkedRush(game) {
  const {hero:h,view,weapon:arm}=game;
  const center={x:h.x,z:h.z};
  view.comboTrail(center,-h.rollX,-h.rollZ,2.65,arm.tone,{shape:'arc',width:1.45,pose:'return'},true,arm.id);
  view.shock(center.x,center.z,arm.tone,2.05,.65);
  for (const foe of arcTargets(active(game),center,-h.rollX,-h.rollZ,2.65,1.45)) {
    game.hit(foe,h.spellDamage*.78,center,1.18);
  }
}

export function reflectHit(game,attacker) {
  const {hero:h,view,weapon:arm}=game;
  const range=h.spellRadius;
  view.shock(h.x,h.z,arm.tone,range,.85);
  const target=attacker?.hp>0 ? attacker : closest(active(game),h,range+.8);
  if (!target) return;
  view.bolt(point(h,.61),point(target,.77),arm.tone,1.68);
  game.hit(target,h.spellDamage*(h.linkWard?1.60:1.15),h,1.22);
  target.chill=h.linkWard?3.45:2.4;
}
