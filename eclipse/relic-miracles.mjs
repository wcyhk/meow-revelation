import {awakeningFx} from './relic-awakening-fx.mjs';
import {strongestSummonTarget,summonEnemy,summonGap as distance} from './summon-combat.mjs';

const PI=Math.PI;
const angle=(a,b)=>Math.atan2(b.z-a.z,b.x-a.x);
const position=p=>({x:p.x,z:p.z});
const lift=(p,y)=>({...position(p),y});
const lineSize={
  'ice-stair':1.3,ricochet:2.64,'claw-return':2.1,'paired-portals':1.55,
  'barbed-pins':.81,'forked-bolt':2.53,'bell-crusher':2.1,'wind-banks':2.8,
};
const selfSize={stitches:3.35,'blood-hem':2.5,'sun-counter':2.6,rewind:2.45,rekindle:4.05,'pyre-trail':2.35};
const aimSize={
  'fire-nails':2.4,'suspended-hail':2.8,'electric-spokes':3.38,'lunar-crescents':3.45,
  'cinder-cross':3.55,'bat-flock':3.6,'paused-shots':3.25,'solar-rays':3.75,'standing-stones':2.78,
  'glass-lattice':2.6,'fire-letter':2.48,'folded-screen':2.7,'thunder-fence':2.96,
  'swallow-shots':3.1,'enemy-rewind':3.5,'shelter-lamp':2.55,'lightning-tether':3.05,
};

export function miracleFootprint(weapon,hero,range,{dx,dz},center){
  const {kind,aim}=weapon.awakening;
  if(aim==='line')return {lane:{x:hero.x+dx*range/2,z:hero.z+dz*range/2,dx,dz,length:range,width:lineSize[kind]}};
  const point=aim==='self'?hero:center;
  return {area:{x:point.x,z:point.z,radius:selfSize[kind]??aimSize[kind]}};
}

export function castMiracle(game,{origin,center,bearing,range,strike,burst,schedule}){
  const {hero,view,weapon}=game;
  const {kind}=weapon.awakening,tint=weapon.tone;
  const at=(p,a,d)=>({x:p.x+Math.cos(a)*d,z:p.z+Math.sin(a)*d});
  const inside=(p,a,d)=>{const q=at(p,a,d);game.bound(q);return q;};
  const ring=(p,count,r,start=bearing)=>Array.from({length:count},(_,i)=>inside(p,start+2*PI*i/count,r));
  const circle=(p,size,power,force=.86)=>burst(p,size,power,0,false,force);
  const fx=(shape,p,options,color=tint)=>awakeningFx(view,shape,p,color,options);
  const trace=(shape,a,b,life,size=.65,y=.66)=>fx(shape,a,{y,size,life,angle:-angle(a,b)+PI/2,dx:b.x-a.x,dz:b.z-a.z});
  const ray=(a,b,size=.68,y=.46,life=.27)=>fx('thread',a,{y,size,life,angle:PI/2-angle(a,b),stretchZ:distance(a,b)/size});
  const foes=(p,r)=>game.enemies.filter(foe=>summonEnemy(game,foe)&&distance(p,foe)<=r);
  const targets=()=>[...game.enemies,...game.breakables(),...(game.bossArena?.targets??[])];
  const line=(a,b,width,power,force=.8,contact)=>{
    const dx=b.x-a.x,dz=b.z-a.z,span=dx*dx+dz*dz;
    for(const unit of targets()){
      if(unit.hp<=0||unit.turnedUntil>game.t)continue;
      const x=unit.x-a.x,z=unit.z-a.z;
      const i=Math.max(0,Math.min(1,(x*dx+z*dz)/(span||1)));
      if(Math.hypot(x-dx*i,z-dz*i)>width+(unit.kind==='boss'?.46*(unit.bodyScale??1):0))continue;
      const multiplier=kind==='bell-crusher'&&unit.kind==='breakable'?2.4:1;
      if(strike(unit,a,power*multiplier,force))contact?.(unit);
    }
  };
  const wall=(p,r,life)=>game.relicWalls.push({...p,radius:r,until:game.t+life});
  const placeHero=p=>{
    if(game.isBlocked(p,.38))return false;
    hero.x=p.x;hero.z=p.z;hero.vx=hero.vz=0;
    hero.invulnerable=Math.max(hero.invulnerable,.32);
    return true;
  };
  const pulse=(p,r,power,force)=>{view.shock(p.x,p.z,tint,r,.88);circle(p,r,power,force);};

  switch(kind){
    case 'stitches': {
      [0,.30,.60].forEach((time,i)=>schedule(time,()=>{
        const knot=inside(hero,bearing+(i-1)*1.25,1.2);
        fx('needle',knot,{y:.86,size:.82,life:.75});
        schedule(.60,()=>{
          const end=position(hero);
          ray(knot,end,1.35,.73);view.bolt(lift(knot,1.1),lift(end,1.0),tint,1.25);
          line(knot,end,.68,1.52,.74);
        });
      }));
      break;
    }
    case 'blood-hem': {
      hero.relicHaste={until:game.t+1.55,speed:1.45};
      const path=[position(hero)];
      for(let i=1;i<=5;i++)schedule(i*.24,()=>{
        const from=path.at(-1),node=position(hero);
        if(distance(from,node)<.18)node.z+=i%2?.68:-.68;
        path.push(node);ray(from,node,.95,.13,.92);
        fx('needle',node,{y:.5,size:.46,life:.60});
      });
      schedule(1.26,()=>{
        hero.rollCool=0;
        for(let i=1;i<path.length;i++){
          const a=path[i-1],b=path[i];
          trace('blade',a,b,.20,.7);line(a,b,.67,.73);
        }
        view.slash(hero.x,hero.z,hero.dx,hero.dz,tint,2.48,true);
        circle(hero,1.42,1.26,1.2);
      });
      break;
    }
    case 'fire-nails': {
      const nails=ring(center,4,2.4);
      nails.forEach((p,i)=>schedule(i*.13,()=>{
        fx('needle',p,{size:.8,y:4.1,lift:-3.6,life:.24});
        schedule(.22,()=>{ray(p,center,1.95,.18);circle(p,.95,1.18);line(p,center,.50,.68);});
      }));
      schedule(.83,()=>{fx('sun',center,{size:1.13,y:.35,lift:1.4,life:.53});pulse(center,1.77,1.80,1.12);});
      break;
    }
    case 'ice-stair': {
      const stairs=Array.from({length:5},(_,i)=>inside(origin,bearing,range*(i+1)/6));
      stairs.forEach((p,i)=>schedule(i*.095,()=>{
        const life=.69+(4-i)*.15-i*.095;
        wall(p,.63,life);fx('glass',p,{size:.98+i*.14,angle:-bearing,y:.20,lift:.14+i*.15,life});
      }));
      stairs.reverse().forEach((p,i)=>schedule(.69+i*.15,()=>{
        fx('ice',p,{size:1.2,y:.75,lift:.85,life:.43});pulse(p,1.38,1.22,1.04);
      }));
      break;
    }
    case 'ricochet': {
      for(const side of [-1,1]){
        const edge=inside(inside(origin,bearing,range*.80),bearing+side*PI/2,2.15);
        const back=inside(origin,bearing-side*.68,1.65);
        trace('notch',origin,edge,.44,1.12);
        schedule(.36,()=>line(origin,edge,.86,.88,.45));
        schedule(.49,()=>{
          fx('glass',edge,{life:.42,y:.7,size:1.2});
          trace('wheel',edge,back,.33,.96);
          schedule(.20,()=>line(edge,back,1.05,1.61,1.1,u=>{u.chill=Math.max(u.chill??0,1.7);}));
        });
      }
      break;
    }
    case 'sun-counter': {
      hero.ward=Math.max(hero.ward,3);
      view.relicAura(weapon,hero,3);
      fx('sun',hero,{size:1.15,y:.18,lift:1.25,life:.68});
      hero.relicCounter={weapon,fire:attacker=>{
        const from=position(hero),end=attacker?inside(from,angle(from,attacker),Math.max(3.4,distance(from,attacker)+.7))
          :inside(from,bearing,4.6);
        ray(from,end,3.6,1.04,.39);
        view.bolt(lift(from,1.08),lift(end,1.08),tint,2.8);
        line(from,end,1.25,3.25,1.2);
      }};
      break;
    }
    case 'rewind': {
      const anchor=position(hero),hp=hero.hp;
      fx('hourglass',anchor,{size:1.4,y:.37,life:2.26,spin:2});
      fx('trap',anchor,{size:1.8,life:2.25,spin:-.6});
      schedule(1.97,()=>{
        const from=position(hero);
        if(placeHero(anchor))hero.hp=Math.min(hero.maxHp,hero.hp+Math.max(0,hp-hero.hp)*.5);
        trace('glass',from,anchor,.25,1.1,1);
        pulse(anchor,2.45,2.24,1.46);
      });
      break;
    }
    case 'suspended-hail': {
      let fired=false;
      const seeds=ring(center,6,2.18);
      seeds.forEach(p=>fx('ice',p,{size:.7,y:2.13,life:2.6,spin:1.3}));
      fx('frost',center,{size:2.76,life:2.55,spin:.22});
      for(let i=0;i<10;i++)schedule(.12+i*.22,()=>{
        if(fired||!foes(center,2.8).length)return;
        fired=true;
        seeds.forEach((p,j)=>schedule(j*.105,()=>{
          fx('needle',p,{size:1.2,y:2.4,lift:-2.2,life:.2});
          schedule(.17,()=>pulse(p,1.28,1.31,.64));
        }));
      });
      break;
    }
    case 'claw-return': {
      const claws=[-.25,0,.25].map(a=>inside(origin,bearing+a,range*.91));
      claws.forEach((end,i)=>{
        trace('fang',origin,end,.36,.96,.82);
        schedule(.27,()=>line(origin,end,.66,.72,.24));
        schedule(.49+i*.075,()=>{
          trace('fang',end,hero,.23,1.24,1.05);ray(end,hero,1.7,.28);
          line(hero,end,.85,1.27,-1.55);
        });
      });
      break;
    }
    case 'electric-spokes': {
      fx('rift',center,{size:3.35,life:1.65,spin:.70});
      for(let beat=0;beat<8;beat++)schedule(beat*.17,()=>{
        for(const tip of ring(center,3,3.38,bearing+beat*.37)){
          ray(center,tip,1.45,.32,.18);
          line(center,tip,.55,.43,.34);
        }
      });
      break;
    }
    case 'lunar-crescents':
      for(let i=0;i<3;i++)schedule(i*.23,()=>{
        const start=inside(center,bearing+2*PI*i/3,3.45);
        trace('notch',start,center,.36,1.62,.72);
        schedule(.30,()=>{view.slash(center.x,center.z,Math.cos(angle(start,center)),Math.sin(angle(start,center)),tint,2.15,true);
          line(start,center,1.18,1.30,.58);});
      });
      break;
    case 'cinder-cross': {
      const arms=ring(center,4,3.55,bearing+PI/4);
      arms.forEach((end,i)=>schedule(.10+i*.095,()=>{
        trace('sun',center,end,.30,.59,.38);line(center,end,.65,.65,.60);
      }));
      schedule(.78,()=>{
        for(const end of arms){ray(center,end,2.95,.24,.47);line(center,end,1.04,1.49,1.15);}
        fx('sun',center,{size:.84,y:.22,lift:1.8,life:.41});
      });
      break;
    }
    case 'bat-flock':
      ring(center,3,3.6).forEach((start,i)=>schedule(i*.17,()=>{
        view.relicBats(start,tint,1.38,i);
        trace('feather',start,center,.32,.74,1.43);
        line(center,start,1.02,.97,-1.34);
      }));
      schedule(.66,()=>{fx('vortex',center,{size:2.61,y:.3,life:.46,spin:-5});pulse(center,2.56,1.68,.50);});
      break;
    case 'paused-shots':
      fx('hourglass',center,{y:.22,size:2.26,life:1.57,spin:1.18});
      fx('frost',center,{size:3.25,life:1.55});
      for(const delay of [0,.24,.48])schedule(delay,()=>{
        for(const shot of game.hazards??[]){
          if(shot.kind==='projectile'&&distance(shot,center)<=3.25)shot.frozenUntil=Math.max(shot.frozenUntil??0,game.t+.85);
        }
      });
      schedule(.68,()=>pulse(center,2.38,1.98,1.1));
      break;
    case 'solar-rays':
      fx('sun',center,{size:1.75,y:1.38,life:1.08,spin:1.7},0xffedb1);
      ring(center,4,3.75,bearing+PI/4).forEach((end,i)=>schedule(.18+i*.16,()=>{
        trace('sun',center,end,.28,.82,1.37);
        ray(center,end,2.05,1.22);
        line(center,end,.91,1.46,1.24);
      }));
      break;
    case 'standing-stones': {
      const points=ring(center,4,2.78,bearing+PI/4);
      points.forEach(p=>{wall(p,.67,1.85);fx('pillar',p,{size:1.32,y:.28,lift:.55,life:1.84});});
      for(let i=0;i<2;i++)schedule(.36+i*.35,()=>{
        const a=points[i],b=points[i+2];
        trace('stone',a,b,.35,1.32,.39);
        line(a,b,1.36,1.76,1.02);circle(center,1.35,.64);
      });
      break;
    }
    case 'glass-lattice': {
      const glass=ring(center,4,2.6,bearing+PI/4);
      glass.forEach(p=>fx('glass',p,{size:1.2,y:1.21,life:1.42,spin:.35}));
      glass.forEach((p,i)=>schedule(i*.10,()=>{
        const next=glass[(i+1)%4];
        ray(p,next,1.45,.86);line(p,next,.68,.77,.44);
      }));
      schedule(.61,()=>{
        for(let i=0;i<2;i++){ray(glass[i],glass[i+2],2.65,.90,.34);line(glass[i],glass[i+2],.90,1.43,1.04);}
      });
      break;
    }
    case 'fire-letter':
      trace('book',origin,center,.36,.93,1.13);
      schedule(.36,()=>{
        pulse(center,1.89,1.74,.96);
        fx('trap',center,{size:1.67,life:.90,angle:.7});
        schedule(.84,()=>{fx('sun',center,{size:1.14,y:.33,lift:1.9,life:.52});pulse(center,2.48,1.93,1.41);});
      });
      break;
    case 'rekindle':
      hero.lanternOut=0;
      fx('sun',hero,{size:.93,y:.93,lift:1.12,life:.77},0xffebac);
      for(let i=0;i<3;i++)schedule(i*.20,()=>pulse(hero,1.6+i*1.20,.87,i===2?1.75:1.03));
      break;
    case 'folded-screen': {
      for(const side of [-1,1]){
        for(let i=0;i<4;i++){
          const p=inside(center,bearing+side*(PI*.5+.26),i*.72);
          wall(p,.48,.90);fx('glass',p,{size:.90,y:.74,angle:-bearing,life:.93});
        }
      }
      schedule(.89,()=>{
        const end=inside(center,bearing,4.6);
        trace('ice',center,end,.27,1.20,.72);
        view.wave(center.x,center.z,Math.cos(bearing),Math.sin(bearing),4.6,tint,true,'ice');
        line(center,end,1.43,2.68,1.20);
      });
      break;
    }
    case 'thunder-fence': {
      const stakes=ring(center,4,2.96,bearing+PI/4);
      stakes.forEach((p,i)=>schedule(i*.105,()=>{
        fx('needle',p,{size:1.28,y:1.27,life:1.10});
        const q=stakes[(i+1)%4];
        ray(p,q,2.05,.43);view.bolt(lift(p,.49),lift(q,.49),tint,1.35);line(p,q,.68,.98,.64);
      }));
      schedule(.65,()=>{
        for(const side of [-1,1]){
          const p=inside(center,bearing+PI*.5,side*.79),a=inside(p,bearing,2.27),b=inside(p,bearing,-2.27);
          ray(a,b,2.75,1.15);line(a,b,.86,1.41,1.13);
        }
      });
      break;
    }
    case 'paired-portals': {
      let exit=inside(origin,bearing,range*.86);
      if(game.isBlocked(exit,.38))exit=inside(origin,bearing,range*.58);
      fx('door',origin,{size:1.38,y:1.15,angle:PI/2-bearing,life:.92});
      fx('door',exit,{size:1.50,y:1.17,angle:PI/2-bearing,life:.93});
      schedule(.18,()=>placeHero(exit));
      schedule(.57,()=>{
        trace('blade',exit,origin,.28,1.54,1.12);ray(exit,origin,2.85,.54);
        line(exit,origin,1.27,2.20,1.16);circle(origin,1.53,1.24);
      });
      break;
    }
    case 'barbed-pins': {
      const end=inside(origin,bearing,range),marks=[];
      trace('needle',origin,end,.23,.71,1.03);
      schedule(.16,()=>line(origin,end,.68,1.14,.48,unit=>{
        if(marks.length<7)marks.push(position(unit));
        unit.chill=Math.max(unit.chill??0,.75);
        fx('needle',unit,{y:1.08,size:.62,life:.38});
      }));
      schedule(.42,()=>{
        trace('relay',origin,end,.25,.76,.95);
        line(origin,end,.80,.83,.74);
        marks.forEach(p=>pulse(p,1.19,.90,1.22));
      });
      break;
    }
    case 'forked-bolt': {
      const pivot=inside(origin,bearing,range*.54);
      trace('relay',origin,pivot,.24,1.04,1.02);
      schedule(.22,()=>{
        line(origin,pivot,.75,1.54,1.0);
        fx('relay',pivot,{y:1.33,size:1.02,life:.30});
        for(const side of [-1,1]){
          const end=inside(pivot,bearing+side*.53,range*.59);
          ray(pivot,end,2.35,1.04);
          view.bolt(lift(pivot,1.11),lift(end,.59),tint,1.55);
          line(pivot,end,.83,1.55,1.22);
        }
      });
      break;
    }
    case 'bell-crusher':
      for(let stage=0;stage<3;stage++)schedule(stage*.20,()=>{
        const middle=inside(origin,bearing,range*(stage+1)*.30);
        const left=inside(middle,bearing+PI*.5,1.64+stage*.20),right=inside(middle,bearing-PI*.5,1.64+stage*.20);
        fx('notch',middle,{size:1.63+stage*.19,life:.44,angle:-bearing});
        ray(left,right,2.51,.18,.36);
        line(left,right,.95,1.56,1.59);
      });
      break;
    case 'swallow-shots': {
      let eaten=0;
      fx('door',center,{size:2.44,y:.89,life:1.04,spin:2.5});
      for(const delay of [0,.22,.44,.66])schedule(delay,()=>{
        game.hazards=(game.hazards??[]).filter(shot=>{
          if(shot.kind!=='projectile'||distance(shot,center)>3.10)return true;
          if(shot.visual)view.removeProjectile(shot.visual);
          if(eaten<8)trace('relay',shot,center,.21,.42,.75);
          eaten++;return false;
        });
        circle(center,3.1,.35,-1.48);
      });
      schedule(.98,()=>pulse(center,2.58+Math.min(8,eaten)*.12,1.88+Math.min(8,eaten)*.19,1.48));
      break;
    }
    case 'wind-banks':
      for(let i=0;i<6;i++)schedule(i*.11,()=>{
        const side=i%2?1:-1,arc=(i%3)*.52+1.46;
        const bend=inside(inside(origin,bearing,range*.59),bearing+PI/2,side*arc);
        const end=inside(origin,bearing+side*.13,range);
        trace('feather',origin,bend,.28,.80,1.30);
        schedule(.26,()=>{
          trace('feather',bend,end,.20,.91,.62);
          line(origin,bend,.46,.61,.42);line(bend,end,.61,.79,.64);
        });
      });
      break;
    case 'enemy-rewind': {
      const reflections=foes(center,3.5).slice(0,8).map(unit=>({unit,anchor:position(unit)}));
      reflections.forEach(({anchor})=>fx('glass',anchor,{size:1.23,y:.92,life:1.15}));
      fx('frost',center,{size:3.5,life:1.2,spin:-.8});
      schedule(1.03,()=>{
        for(const {unit,anchor} of reflections){
          if(!summonEnemy(game,unit))continue;
          ray(unit,anchor,1.36,.60);
          if(unit.kind!=='boss'&&!game.isBlocked(anchor,.35)){unit.x=anchor.x;unit.z=anchor.z;unit.kx=unit.kz=0;}
          pulse(anchor,1.00,1.49,1.08);
        }
        circle(center,2.32,.72,.68);
      });
      break;
    }
    case 'shelter-lamp':
      fx('sun',center,{size:.76,y:.90,life:3.20},0xffecb1);
      fx('crown',center,{size:1.21,y:.69,life:3.20,spin:.43});
      fx('rift',center,{size:2.55,life:3.20,spin:.18});
      for(let i=0;i<7;i++)schedule(i*.44,()=>{
        if(distance(hero,center)<=2.55)hero.ward=Math.max(hero.ward,.62);
        if(i%2===0)pulse(center,2.55,.68,1.19);
      });
      break;
    case 'lightning-tether': {
      const target=strongestSummonTarget(game,center,3.05);
      fx('relay',center,{size:.92,y:.88,life:1.30,spin:5});
      for(let i=0;i<5;i++)schedule(i*.22,()=>{
        if(target&&!summonEnemy(game,target))return;
        const end=target??inside(center,bearing,2.5);
        ray(hero,end,1.54,.80);
        view.bolt(lift(hero,.94),lift(end,.92),tint,1.55);
        line(hero,end,.54,.85,.40);
      });
      break;
    }
    case 'pyre-trail':
      hero.ward=Math.max(hero.ward,2.45);
      view.relicAura(weapon,hero,2.45);
      for(let i=0;i<5;i++)schedule(i*.36,()=>{
        const p=position(hero);
        fx('sun',p,{size:.64,y:.16,lift:.75,life:.66});
        schedule(.32,()=>circle(p,1.36,.67,.62));
      });
      hero.relicCounter={weapon,fire:()=>{
        fx('rift',hero,{size:2.35,y:.33,life:.42,spin:3});
        pulse(hero,2.85,2.35,1.78);
      }};
      break;
  }
}
