import {insideArena,onArenaHazard} from './arena-draw.mjs?v=shifting-2';

export const moonSlashPattern='moonSlash';
const notice=[1.24,1.18,1.32];
const recovery=.42;
const readyLead=.34;
const sealClearance=.62;
const lanes=Array.from({length:12},(_,i)=>[Math.cos(i*Math.PI/6),Math.sin(i*Math.PI/6)]);
const steps=[.52,1.04,1.56,2.08,2.60];
export const moonSlashDuration=notice.reduce((total,span)=>total+span,0)+2*recovery;

const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const step=(point,angle,amount)=>({x:point.x+Math.cos(angle)*amount,z:point.z+Math.sin(angle)*amount});

function active(game,owner,chain){
  return owner.hp>0&&!owner.phaseChange&&owner.bossPhase===2&&game.bossArena===chain.arena
    &&chain.arena.phase===2&&!(chain.arena.counters.stagger>0);
}

function line(origin,angle,length,width){
  // Leave the seal itself usable. The lane starts just beyond its centre.
  return {kind:'line',...step(origin,angle,sealClearance+length*.5),radius:length,width,angle};
}

function hasEscape(game,zone){
  const {hero,bossArena}=game;
  if(!onArenaHazard(hero,zone))return true;
  const floor=bossArena.hazards;
  const nearby=floor.filter(mark=>!onArenaHazard(hero,mark,.12));
  return lanes.some(([dx,dz])=>steps.every((span,index)=>{
    const point={x:hero.x+dx*span,z:hero.z+dz*span};
    if(!insideArena(point,.40)||game.isBlocked(point,.42))return false;
    if(nearby.some(mark=>onArenaHazard(point,mark,.12)))return false;
    return index<steps.length-1||!onArenaHazard(point,zone)&&!floor.some(mark=>onArenaHazard(point,mark,.12));
  }));
}

function strikeZone(game,owner,chain){
  const {index,seals}=chain;
  const seal=seals[index];
  const origin=seal??owner;
  const {hero}=game;
  const gap=distance(origin,hero);
  const angle=gap>.05?Math.atan2(hero.z-origin.z,hero.x-origin.x):Math.atan2(hero.z-owner.z,hero.x-owner.x);
  const length=Math.min(11.6,Math.max(5.2,gap+1.22));
  const width=index===0?.66:.73;
  const zone=seal?line(origin,angle,length,width):{kind:'cone',x:origin.x,z:origin.z,radius:6.05,width:.70,angle};
  if(hasEscape(game,zone))return zone;
  // If the player is boxed in by terrain, turn the cut away instead of sealing their only exit.
  return line(origin,angle+Math.PI,Math.min(length,5.4),.56);
}

export function queueMoonSlash(game,owner,chain){
  if(!chain){
    const arena=game.bossArena;
    if(!owner.spec.finalWarden||arena?.boss!==owner||arena?.points.length!==2)return false;
    const [first,second]=arena.points;
    const seals=distance(first,game.hero)<=distance(second,game.hero)?[first,second]:[second,first];
    chain={arena,seals,index:0};
  }
  if(!active(game,owner,chain))return false;
  const {index,seals}=chain;
  const zone=strikeZone(game,owner,chain);
  const aim=step(zone,zone.angle,1);
  const aimDistance=Math.max(.045,distance(owner,aim));
  const windup=notice[index];
  const attack=owner.attack={
    pattern:moonSlashPattern,moonSlash:chain,windup,time:windup,readyLead,
    dx:(aim.x-owner.x)/aimDistance,dz:(aim.z-owner.z)/aimDistance,
  };
  const hazard={...zone,delay:windup,damage:owner.spec.hurt*(index===2?1.02:.80),
    owner,windup:attack,bossPhase:2,pattern:moonSlashPattern,effect:'void',tint:0xb098ff,moonSlash:chain};
  game.hazards.push(hazard);
  const visible=()=>owner.attack===attack&&!attack.interrupted&&active(game,owner,chain);
  const elapsed=()=>windup-attack.time;
  const cone=zone.kind==='cone';
  game.view.warning(zone.kind,zone.x,zone.z,zone.radius+(cone?.13:0),windup,-zone.angle,
    zone.width+(cone?.05:.13),hazard.tint,visible,elapsed);
  const seal=seals[index];
  if(seal)game.view.warning('aura',seal.x,seal.z,1.08,windup,0,0,0xf2d9ff,visible,elapsed);
  game.warnEnemyAttack(owner);
  return true;
}

export function stepMoonSlash(game,hazard,dt){
  const {owner,moonSlash:chain,windup}=hazard;
  if(!active(game,owner,chain)){
    if(windup&&owner.attack===windup)owner.attack=null;
    return false;
  }
  if(hazard.kind==='moon-followup'){
    hazard.delay-=dt;
    if(hazard.delay>0)game.hazards.push(hazard);
    else queueMoonSlash(game,owner,chain);
    return false;
  }
  if(owner.attack!==windup||windup.interrupted)return false;
  game.stepEnemyAttack(owner,dt);
  hazard.delay=windup.time;
  if(hazard.delay<=0){
    const next=chain.index+1;
    const last=next===notice.length;
    owner.recover=last?.92:recovery+.09;
    owner.cool=Math.max(owner.cool,owner.recover+.23);
    if(!last)game.hazards.push({kind:'moon-followup',owner,delay:recovery,moonSlash:{...chain,index:next}});
  }
  return true;
}
