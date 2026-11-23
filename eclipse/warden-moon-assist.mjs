import {insideArena,onArenaHazard} from './arena-draw.mjs?v=shifting-2';

export const moonPincerPreview='moonPincer';
const warningInk=0xaee5ff;
const angles=Array.from({length:16},(_,i)=>i*Math.PI/8);
const steps=[.45,.90,1.35,1.8,2.25,2.70];
const footprints=new Set(['line','circle','ring','cone']);
const offset=(point,angle,span)=>({x:point.x+Math.cos(angle)*span,z:point.z+Math.sin(angle)*span});
const circle=(point,radius)=>({kind:'circle',...point,radius,width:0,angle:0});
const lane=(point,radius,width,angle)=>({kind:'line',...point,radius,width,angle});

export function moonAssistZones(pattern,center,bearing){
  // Keep the signature silhouettes compact so one echo can join a full-sized Warden slash.
  switch(pattern){
    case 'cross':
      return [lane(center,5.3,.44,bearing),lane(center,5.3,.44,bearing+Math.PI/2)];
    case 'prison':
      return Array.from({length:4},(_,index)=>circle(offset(center,bearing+index*Math.PI/2,1.33),.86));
    case 'spiral':
      return Array.from({length:3},(_,index)=>circle(offset(center,bearing+index*.90,.55+index*.74),.91));
    case 'eclipse':
      return [{kind:'ring',...center,radius:2.56,width:.78,angle:0}];
    default:
      return [];
  }
}

function padded(zone){
  const width=zone.kind==='cone'?.055:zone.kind==='ring'?.34:.15;
  return {...zone,radius:zone.radius+.17,width:(zone.width??0)+width};
}

export function moonEscape(game,zones){
  const {hero,bossArena}=game;
  const damage=zones.map(padded);
  const terrain=bossArena.hazards.map(padded);
  const overlaps=(marks,point)=>marks.some(mark=>onArenaHazard(point,mark));
  const entered=terrain.filter(mark=>!onArenaHazard(hero,mark));
  for(const angle of angles){
    // The hero may start in a warning. The last stretch must be clear when both attacks land.
    if(steps.every((span,index)=>{
      const point=offset(hero,angle,span);
      if(!insideArena(point,.42)||game.isBlocked(point,.42)||overlaps(entered,point))return false;
      if(index>=steps.length-2&&(overlaps(damage,point)||overlaps(terrain,point)))return false;
      return true;
    }))return {from:{x:hero.x,z:hero.z},angle,length:steps.at(-1)};
  }
  return null;
}

function selectedZones(game,slash,pattern,threats){
  const {hero}=game;
  const extras=threats.filter(mark=>(!mark.owner||mark.owner.hp>0)&&!mark.windup?.interrupted&&!mark.moonSlash
    &&mark.delay<=slash.delay+.23&&(footprints.has(mark.kind)||mark.kind==='residue'))
    .map(mark=>mark.kind==='residue'?{...mark,kind:mark.shape}:mark);
  const bearing=slash.angle+Math.PI/2;
  for(const shift of [1.4,-1.4,2.3,-2.3,3.1,-3.1]){
    const center=offset(hero,bearing,shift);
    if(!insideArena(center,.65))continue;
    const zones=moonAssistZones(pattern,center,bearing);
    if(!zones.length)continue;
    const route=moonEscape(game,[slash,...extras,...zones]);
    if(route)return {zones,route,center};
  }
  return null;
}

export function startMoonAssist(game,slash,threats){
  if(threats.some(mark=>['projectile','release'].includes(mark.kind)&&!mark.windup?.interrupted&&!mark.owner?.dismissed))return;
  const allies=game.enemies.filter(unit=>unit.summoner===slash.owner&&unit.hp>0&&unit.age>=.38
    &&!unit.attack&&!(unit.stun>0)&&!(unit.frozen>0));
  if(!allies.length)return;
  const arena=slash.moonSlash.arena;
  const cursor=arena.moonAssistCursor??0;
  const attempted=new Set();
  for(let i=0;i<allies.length;i++){
    const index=(cursor+i)%allies.length,owner=allies[index];
    const pattern=owner.spec.reinforcementMove;
    if(!pattern||attempted.has(pattern))continue;
    attempted.add(pattern);
    const plan=selectedZones(game,slash,pattern,threats);
    if(!plan)continue;
    arena.moonAssistCursor=index+1;
    const {center,zones,route}=plan;
    const duration=slash.windup.windup;
    const length=Math.max(.05,Math.hypot(center.x-owner.x,center.z-owner.z));
    const attack=owner.attack={pattern,moonAssist:true,windup:duration,time:duration,
      dx:(center.x-owner.x)/length,dz:(center.z-owner.z)/length};
    const assist=slash.assist={owner,attack,zones,route,center};
    const active=()=>assistActive(slash)&&slash.owner.attack===slash.windup;
    const elapsed=()=>duration-slash.windup.time;
    for(const zone of zones)game.view.warning(zone.kind,zone.x,zone.z,zone.radius+(zone.kind==='line'?0:.12),duration,
      -zone.angle,zone.width+(zone.kind==='ring'?.24:.13),warningInk,active,elapsed,warningInk);
    game.view.warning('aura',owner.x,owner.z,1.1,duration,0,0,0xf9cd85,active,elapsed);
    game.view.moonEscapeGuide(route,duration,active,elapsed);
    return assist;
  }
}

function assistActive(slash){
  const {owner,attack}=slash.assist;
  return owner.hp>0&&!owner.dismissed&&!(owner.frozen>0)&&owner.attack===attack&&!attack.interrupted
    &&!slash.windup.interrupted;
}

export function cancelMoonAssist(slash){
  const assist=slash.assist;
  if(assist&&assist.owner.attack===assist.attack)assist.owner.attack=null;
}

export function stepMoonAssist(game,slash,pending){
  const assist=slash.assist;
  if(!assist)return;
  if(!assistActive(slash)){
    cancelMoonAssist(slash);
    return;
  }
  const {owner,attack,zones}=assist;
  attack.time=slash.windup.time;
  if(attack.time>0)return;
  game.resolveEnemyAttack(owner);
  for(const zone of zones)pending.push({...zone,owner,windup:attack,pattern:attack.pattern,
    damage:owner.spec.hurt,tint:owner.spec.tint,effect:owner.spec.effect,delay:0,moonAssist:true});
}
