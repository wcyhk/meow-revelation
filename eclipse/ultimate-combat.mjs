import {trackUltimate, ultimateBody, ultimateSeal} from './ultimate-art.mjs?v=ultimates-1';

const tau=Math.PI*2;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const position=({x,z})=>({x,z});
const lift=(p,y)=>({x:p.x,y,z:p.z});
const along=(p,dx,dz,d)=>({x:p.x+dx*d,z:p.z+dz*d});

function bearing(a,b,fallback=[0,-1]) {
  const length=distance(a,b);
  return length>.06?[(b.x-a.x)/length,(b.z-a.z)/length]:fallback;
}

function valid(game,unit) {
  return unit.hp>0&&unit.age>=.23&&unit.phaseGuard<=0&&!(game.bossArena?.boss===unit&&game.bossArena.locked);
}

function nearby(game,from,limit,seen) {
  let next;
  for (const unit of game.enemies) {
    if (seen?.has(unit)||!valid(game,unit)) continue;
    const gap=distance(from,unit);
    if (gap>limit) continue;
    next=unit;
    limit=gap;
  }
  return next;
}

function lockIce(unit,duration) {
  if (unit.hp<=0||unit.phaseGuard>0) return;
  unit.chill=Math.max(unit.chill,2.35);
  if (unit.kind==='boss') return;
  unit.frozen=Math.max(unit.frozen??0,duration);
  unit.kx=unit.kz=0;
  if (unit.attack) unit.attack.interrupted=true;
  unit.attack=unit.motion=null;
}

function field(game,center,life,advance,finish) {
  const effect={...center,age:0,life,advance,finish,alive:true,art:[],pulse:0,trail:0};
  game.ultimateFields.push(effect);
  return effect;
}

export function updateUltimates(game,dt) {
  for (const effect of game.ultimateFields) {
    effect.age+=dt;
    effect.advance(effect,dt);
    for (const fx of effect.art) {
      fx.mesh.position.x=effect.x;
      fx.mesh.position.z=effect.z;
    }
    if (effect.age>=effect.life) {
      effect.alive=false;
      effect.finish?.(effect);
    }
  }
  if (game.ultimateFields.some(effect=>!effect.alive)) game.ultimateFields=game.ultimateFields.filter(effect=>effect.alive);
}

export function clearUltimates(game) {
  for (const effect of game.ultimateFields) effect.alive=false;
  game.ultimateFields.length=0;
}

export function launchUltimate(game,link,wind,rite) {
  const {view,hero:h}=game;
  const mark=link.contacts.find(m=>m.kind==='break'&&valid(game,m.unit))??link.contacts.find(m=>valid(game,m.unit))??link.contacts[0];
  const here=position(h);
  const [dx,dz]=bearing(here,mark,[link.dx,link.dz]);
  const angle=Math.atan2(dz,dx);
  h.dx=dx;h.dz=dz;h.attackAge=0;
  if (Math.abs(dx)>.12) h.face=Math.sign(dx);
  const {tint,accent}=rite;
  const power=h.spellDamage;
  const release=(fn,delay=0)=>game.schedule(wind+delay,fn);
  const hit=(unit,scale,from,force=1,weight)=>game.hit(unit,power*scale,from,force,tint,weight);
  const disk=(center,radius,fn,low=0)=>{
    for (const unit of game.enemies) {
      if (!valid(game,unit)) continue;
      const gap=distance(center,unit);
      if (gap<=radius+(unit.kind==='boss'?.52:.18)&&gap>=low) fn(unit);
    }
  };
  const beam=(from,to,width,fn,start=-.22)=>{
    const reach=distance(from,to);
    const [nx,nz]=bearing(from,to);
    for (const unit of game.enemies) {
      if (!valid(game,unit)) continue;
      const x=unit.x-from.x,z=unit.z-from.z,margin=unit.kind==='boss'?.61:.18;
      const on=x*nx+z*nz;
      if (on>=start-margin&&on<=reach+margin&&Math.abs(z*nx-x*nz)<width+margin) fn(unit);
    }
  };
  const seal=(p,r,life)=>ultimateSeal(view,rite,p,r,life);
  const bloom=(p,r,effect)=>view.threatImpact({x:p.x,z:p.z,kind:'circle',radius:r,tint,effect,pattern:effect==='ice'?'icicles':'burst'});
  const sound=(index=0)=>game.audio.ultimate(rite.skin,index);
  const focus=()=>valid(game,mark.unit)&&distance(mark,mark.unit)<4?position(mark.unit):position(mark);

  switch (rite.weapon) {
    case 'flameblade':
      release(()=>{
        // Fire starts at the cut, so a target killed by the finisher still leaves a live ember.
        const seed=position(mark), life=2.48;
        let target=valid(game,mark.unit)?mark.unit:null;
        let vx=dx*2.9,vz=dz*2.9;
        const cyclone=field(game,seed,life,(f,dt)=>{
          if (!target||!valid(game,target)||distance(f,target)>10.5) target=nearby(game,f,10.5);
          const gap=target?distance(f,target):0;
          const [tx,tz]=target?bearing(f,target,[0,0]):[0,0];
          const speed=Math.min(7.3,gap*4.1);
          const curve=1-Math.exp(-dt*8.3);
          vx+=(tx*speed-vx)*curve;vz+=(tz*speed-vz)*curve;
          f.x+=vx*dt;f.z+=vz*dt;game.bound(f);
          if (f.age>=f.trail) {
            f.trail+=.10;
            view.spark(f.x,.86,f.z,tint,view.mobile?5:9,1.05,'fire');
          }
          if (f.age>=f.pulse) {
            f.pulse+=.32;
            const origin=position(f);
            view.bolt(lift(origin,3.76),lift(origin,.33),f.age% .64<.32?0x9ed7ff:accent,1.45);
            disk(origin,1.82,foe=>hit(foe,.30,origin,-.59,'light'));
          }
        },f=>{
          const center=position(f);
          bloom(center,2.65,'fire');
          view.bolt(lift(center,5.0),lift(center,.32),accent,2.15);
          disk(center,2.72,foe=>hit(foe,1.25,center,1.66,'heavy'));
          sound(2);
        });
        trackUltimate(cyclone,seal(seed,2.0,life+.10),ultimateBody(view,rite,seed,1.78,life+.10,true));
        sound();
      });
      break;

    case 'tiger':
      release(()=>{
        const first=focus();
        const visited=new Set();
        const leap=(from,index)=>{
          const foe=index===0&&valid(game,mark.unit)?mark.unit:nearby(game,from,4.7,visited);
          if (!foe&&index>0) return;
          if (foe) visited.add(foe);
          const to=foe?position(foe):first;
          const [nx,nz]=bearing(from,to,[dx,dz]);
          const trail=along(to,-nx,-nz,1.42);
          view.motion.rush(trail,to,accent);
          view.slash(to.x,to.z,nx,nz,tint,3.09,true,index%2?1:-1,.66);
          view.spark(to.x,.68,to.z,accent,12,1.08,'fire');
          seal(to,1.58,.43);
          disk(to,1.60,unit=>hit(unit,.76,to,.71));
          if (index<2) game.schedule(.17,()=>leap(to,index+1));
        };
        leap(here,0);
        game.schedule(.59,()=>{
          for (const [nx,nz] of [[dx,dz],[-dz,dx]]) view.slash(first.x,first.z,nx,nz,accent,3.62,true,-1,.91);
          disk(first,2.35,unit=>hit(unit,1.44,first,1.54,'heavy'));
          sound(2);
        });
        sound();
      });
      break;

    case 'dragon': {
      const center=focus();
      const vertices=Array.from({length:3},(_,i)=>{
        const a=angle+i*tau/3;
        const node=along(center,Math.cos(a),Math.sin(a),2.60);
        game.bound(node);
        return node;
      });
      vertices.forEach((p,i)=>release(()=>{
        const q=vertices[(i+1)%3];
        seal(p,1.18,.78);ultimateBody(view,rite,p,.83,.73,true);
        view.bolt(lift(p,6),lift(p,.44),accent,2.1);
        view.bolt(lift(p,.63),lift(q,.63),tint,1.75);
        beam(p,q,.79,unit=>hit(unit,.78,p,.43));
        disk(p,1.03,unit=>hit(unit,.38,p,.22));
        sound(i);
      },i*.19));
      release(()=>{
        for (const p of vertices) view.bolt(lift(p,.83),lift(center,.69),accent,1.82);
        bloom(center,2.75,'water');
        disk(center,3.05,unit=>hit(unit,1.56,center,-.85,'heavy'));
      },.66);
      break;
    }

    case 'phoenix': {
      const center=focus();
      release(()=>{
        seal(center,3.02,.76);ultimateBody(view,rite,center,1.48,.56,true);
        const struck=new Set();
        for (const sign of [-1,1]) {
          const a=angle+sign*.48;
          const nx=Math.cos(a),nz=Math.sin(a);
          const from=along(center,-nx,-nz,2.64),end=along(center,nx,nz,3.19);
          view.wave(from.x,from.z,nx,nz,5.83,sign<0?tint:accent,true,'fire');
          beam(from,end,1.22,unit=>{
            if (struck.has(unit)) return;
            struck.add(unit);
            if (hit(unit,1.32,from,.75)) unit.exposed=Math.max(unit.exposed,2.25);
          });
        }
        sound();
      });
      release(()=>{
        const home=position(h),[nx,nz]=bearing(center,home);
        const turn=along(center,-nx,-nz,1.65),reach=distance(turn,home);
        let healed=false;
        view.wave(turn.x,turn.z,nx,nz,reach+1.2,accent,true,'fire');
        beam(turn,home,1.40,unit=>{healed=hit(unit,1.19,turn,.83)||healed;});
        if (healed) h.hp=Math.min(h.maxHp,h.hp+h.maxHp*.10);
        seal(home,1.36,.43);
        sound(2);
      },.49);
      break;
    }

    case 'turtle':
      release(()=>{
        const life=1.91;
        h.ward=Math.max(h.ward,5.6);
        h.linkWard=true;
        const frost=field(game,h,life,(f)=>{
          f.x=h.x;f.z=h.z;
          if (f.age>=f.pulse) {
            f.pulse+=.43;
            const origin=position(f);
            view.spark(f.x,.58,f.z,accent,view.mobile?6:11,.77,'ice');
            disk(origin,2.46,unit=>{if (hit(unit,.31,origin,.42,'light')) unit.chill=Math.max(unit.chill,1.45);});
          }
        },f=>{
          const origin=position(f);
          bloom(origin,3.13,'ice');
          disk(origin,3.1,unit=>{if (hit(unit,1.30,origin,1.15,'heavy')) lockIce(unit,.87);});
          sound(2);
        });
        trackUltimate(frost,seal(h,2.65,life+.12),ultimateBody(view,rite,h,1.65,life+.12));
        sound();
      });
      break;

    case 'qilin': {
      let center;
      for (const [i,offset] of [-.71,.71,0].entries()) release(()=>{
        center??=focus();
        const nx=Math.cos(angle+offset),nz=Math.sin(angle+offset);
        const from=along(center,-nx,-nz,3.85),end=along(center,nx,nz,1.85);
        view.comboTrail(from,nx,nz,5.70,i===2?accent:tint,{shape:'line',width:.71,pose:'lunge'},i===2,'qilin');
        if (i===2) {seal(center,2.65,.55);bloom(center,1.9,'gold');}
        beam(from,end,i===2?.96:.72,unit=>{
          if (hit(unit,i===2?1.72:.64,from,i===2?1.7:.18,i===2?'heavy':'light')&&i===2&&unit===mark.unit&&mark.kind==='break') {
            unit.exposed=Math.max(unit.exposed,2.65);
            unit.guardOpen=Math.max(unit.guardOpen,2.65);
          }
        });
        sound(i);
      },i*.19);
      break;
    }

    case 'stormbow': {
      const reach=Math.min(10.8,h.spellRadius+1.15);
      for (const [index,spread] of [-.22,0,.22].entries()) {
        const nx=Math.cos(angle+spread),nz=Math.sin(angle+spread);
        const end=along(here,nx,nz,reach);
        game.bound(end);
        const [fx,fz]=bearing(here,end,[nx,nz]);
        const length=distance(here,end), travel=length/49;
        release(()=>{
          view.comboArrow(here,fx,fz,length,index===1?accent:tint,travel,true);
          sound(index);
          const pierced=new Set();
          for (let segment=1;segment<=3;segment++) game.schedule(travel*segment/3,()=>{
            beam(here,along(here,fx,fz,length*segment/3),.62,unit=>{
              if (!pierced.has(unit)&&hit(unit,.93,here,.44)) pierced.add(unit);
            },(segment-1)*length/3);
          });
          game.schedule(travel+.14,()=>{
            const star=nearby(game,end,2.1),p=star?position(star):end;
            seal(p,1.90,.52);
            view.bolt(lift(p,6.4),lift(p,.42),accent,2.2);
            disk(p,1.72,unit=>hit(unit,.94,p,.83));
          });
        },index*.075);
      }
      break;
    }

    case 'windhalberd': {
      const center=focus();
      const pass=(nx,nz,last)=>{
        const from=along(center,-nx,-nz,4.1),to=along(center,nx,nz,4.1);
        seal(center,last?3.35:2.92,.54);
        view.wave(from.x,from.z,nx,nz,8.2,last?accent:tint,true,'feather');
        if (!last) view.vortex(center.x,center.z,2.48,tint);
        else view.slash(center.x,center.z,nx,nz,accent,4.42,true,1,.74);
        beam(from,to,last?1.51:1.65,unit=>hit(unit,last?1.70:.92,center,last?2.48:-2.65,last?'heavy':'light'));
        sound(last?2:0);
      };
      release(()=>pass(dx,dz,false));
      release(()=>pass(-dz,dx,true),.39);
      break;
    }

    case 'frostlute': {
      const center=focus();
      for (let i=0;i<3;i++) release(()=>{
        const radius=1.66+i*1.13;
        seal(center,radius,.68);
        if (i===2) bloom(center,radius,'ice');
        else view.shock(center.x,center.z,tint,radius,.64);
        disk(center,radius,unit=>{
          const chilled=unit.chill>0;
          if (!hit(unit,i===2?(chilled?1.42:1.06):.52,center,.55,i===2?'heavy':'light')) return;
          if (i===2) lockIce(unit,.92);
          else unit.chill=Math.max(unit.chill,2.0);
        },i===1?.85:0);
        sound(i);
      },i*.23);
      break;
    }

    case 'chakra':
      release(()=>{
        const center=focus(),life=1.58;
        seal(center,3.68,life+.12);
        const lastHit=new Map();
        for (const [index,side] of [-1,1].entries()) {
          const orbit=field(game,center,life,(f)=>{
            const a=angle+index*Math.PI+f.age*side*5.6;
            const radius=Math.sin(Math.PI*Math.min(1,f.age/f.life))*.67+2.24;
            f.x=center.x+Math.cos(a)*radius;f.z=center.z+Math.sin(a)*radius;game.bound(f);
            if (f.age>=f.pulse) {
              f.pulse+=.10;
              const p=position(f);
              view.spark(p.x,.6,p.z,index?tint:accent,view.mobile?3:5,.7,'gold');
              disk(p,1.2,unit=>{
                if (game.t-(lastHit.get(unit)??-1)<.31) return;
                if (hit(unit,.52,p,.49,'light')) lastHit.set(unit,game.t);
              });
            }
          },()=>{
            if (index!==1) return;
            view.shock(center.x,center.z,accent,3.65,.85);
            ultimateBody(view,rite,center,2.22,.50);
            disk(center,3.48,unit=>hit(unit,1.53,center,-.71,'heavy'));
            sound(2);
          });
          const rim=view.addEffect(view.motion.disk,{x:center.x,y:.57,z:center.z},index?accent:tint,life+.12,
            {scale:1.67,opacity:.99,order:84});
          rim.spin=side*22;rim.combatClock=true;
          trackUltimate(orbit,rim,seal(center,1.11,life+.12));
        }
        sound();
      });
      break;

    case 'reaper': {
      const center=focus();
      for(let i=0;i<3;i++) release(()=>{
        const a=angle+i*tau/3;
        const p=along(center,Math.cos(a),Math.sin(a),2.06);
        seal(p,1.74,.42);
        view.slash(p.x,p.z,-Math.cos(a),-Math.sin(a),tint,3.04,true,i%2?1:-1,.72);
        disk(center,3.33,unit=>hit(unit,.34,center,-1.58,'light'));
        if(!i)sound();
      },i*.145);
      release(()=>{
        ultimateBody(view,rite,center,2.34,.61);
        bloom(center,3.25,'void');
        disk(center,3.34,unit=>hit(unit,unit.hp<unit.spec.hp*.35?2.22:1.36,center,1.23,'heavy'));
        sound(2);
      },.57);
      break;
    }

    case 'bell': {
      const center=focus();
      for(let i=0;i<3;i++) release(()=>{
        const radius=4.72-i*1.21;
        seal(center,radius,.51);
        ultimateBody(view,rite,center,1.27+i*.31,.54);
        if(i===2) bloom(center,radius,'ice');
        else view.shock(center.x,center.z,tint,radius,.59);
        disk(center,radius,unit=>{
          if(!hit(unit,i===2?1.43:.52,center,i===2?1.23:-.77,i===2?'heavy':'light'))return;
          if(i===2)lockIce(unit,.93);else unit.chill=Math.max(unit.chill,1.67);
        });
        sound(i);
      },i*.24);
      break;
    }

    case 'fangs': {
      const center=focus();
      for(const [i,side] of [-1,1].entries()) release(()=>{
        const a=angle+side*.84,nx=Math.cos(a),nz=Math.sin(a);
        const from=along(center,-nx,-nz,3.45),to=along(center,nx,nz,3.45);
        view.motion.rush(from,to,tint);
        view.wave(from.x,from.z,nx,nz,6.90,i?accent:tint,true,'blood');
        beam(from,to,1.0,unit=>hit(unit,1.02,center,.32));
        sound(i);
      },i*.15);
      release(()=>{
        seal(center,3.11,.51);
        const struck=new Set();
        for(let i=0;i<4;i++){
          const a=angle+i*tau/4,nx=Math.cos(a),nz=Math.sin(a);
          view.slash(center.x,center.z,nx,nz,tint,3.57,true,i%2?1:-1,.63);
          beam(center,along(center,nx,nz,3.36),.74,unit=>{if(!struck.has(unit)){struck.add(unit);hit(unit,1.31,center,1.17,'heavy');}});
        }
        sound(2);
      },.38);
      break;
    }

    case 'cannon': {
      const center=focus(), length=Math.max(.16,distance(here,center)),flight=Math.max(.08,length/28);
      release(()=>{
        view.motion.shell(here,dx,dz,length,tint,flight,true);
        sound();
        game.schedule(flight,()=>{
          ultimateBody(view,rite,center,1.96,.61);
          seal(center,3.38,.65);
          view.vortex(center.x,center.z,3.15,tint);
          disk(center,3.28,unit=>hit(unit,.85,center,-1.91));
          game.schedule(.36,()=>{
            bloom(center,2.52,'fire');
            const struck=new Set();
            for(let i=0;i<5;i++){
              const a=angle+i*tau/5,nx=Math.cos(a),nz=Math.sin(a);
              view.wave(center.x,center.z,nx,nz,4.65,i%2?accent:tint,true,'fire');
              beam(center,along(center,nx,nz,4.45),.88,unit=>{if(!struck.has(unit)){struck.add(unit);hit(unit,1.56,center,1.40,'heavy');}});
            }
            sound(2);
          });
        });
      });
      break;
    }
  }
}
