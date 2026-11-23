import {enemySpec,stages} from './expedition.mjs?v=world-3d-1';
import {insideArena,onArenaHazard} from './arena-draw.mjs?v=shifting-2';
import {modeStage} from './nightfall.mjs?v=clock-1';

export const wardenSummonPattern='wardenSummon';
const bossFloors=[30,50,80,90];
const summonInterval=8.5;
const portalTint=0xc4a4fa;
const rewardTint=0x9cf2dd;
const pads=[[-7,2.5],[7,2.5],[-6,-1.6],[6,-1.6],[-4,7],[4,7],[7,7],[-7,7],[0,8],[-2,-2.7],[2,-2.7]]
  .map(([x,z])=>({x,z}));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export function wardenReinforcementSpecs(difficulty){
  return bossFloors.map(floor=>{
    const source=stages[floor-1];
    const spec=enemySpec(difficulty?modeStage(source,difficulty):source,'boss');
    return {...spec,sourceFloor:floor,name:'殘影 · '+spec.name,hp:spec.hp/3,hurt:spec.hurt/3,mass:spec.mass/3,
      phases:[],attacks:spec.attacks.filter(pattern=>pattern!=='summon'),secondary:true,bodyScale:1,
      reinforcement:true};
  });
}

export function isWardenSummoner(game,owner){
  const arena=game.bossArena;
  return !!owner?.spec?.finalWarden&&owner.hp>0&&!owner.phaseChange&&owner.bossPhase===2
    &&arena?.boss===owner&&arena.phase===2;
}

export function wardenSummonReady(game,owner){
  return isWardenSummoner(game,owner)&&game.t>=(owner.nextWardenSummon??0);
}

function portalPosition(game){
  const {hero,bossArena:arena}=game;
  const points=pads.filter(point=>insideArena(point,.70)&&!game.isBlocked(point,.63)
    &&arena.points.every(seal=>distance(seal,point)>1.7));
  const open=points.filter(point=>!arena.hazards.some(zone=>onArenaHazard(point,zone,.15)));
  const candidates=open.length?open:points;
  let best,score=-Infinity;
  for(const point of candidates){
    let spacing=Math.min(6,distance(hero,point));
    for(const unit of game.enemies)if(unit.hp>0)spacing=Math.min(spacing,distance(unit,point));
    const rating=spacing+Math.min(7,distance(hero,point))*.25;
    if(rating>score){score=rating;best=point;}
  }
  return best??game.stage.positions[0]??game.stage.spawn;
}

export function queueWardenSummon(game,owner,delay){
  if(!isWardenSummoner(game,owner))return;
  const windup=owner.attack;
  const point=portalPosition(game);
  owner.nextWardenSummon=game.t+summonInterval;
  windup.wardenPortal=point;
  const active=()=>owner.attack===windup&&!windup.interrupted&&isWardenSummoner(game,owner);
  const elapsed=()=>delay-windup.time;
  game.view.warning('aura',point.x,point.z,1.27,delay,0,0,portalTint,active,elapsed);
  game.view.sealFx(point.x,point.z,portalTint,1.23,delay,active,elapsed);
}

export function resolveWardenSummon(game,owner,attack){
  if(!attack.wardenPortal||attack.interrupted||!isWardenSummoner(game,owner))return;
  const {x,z}=attack.wardenPortal;
  const deck=game.wardenSummonDeck??=wardenReinforcementSpecs(game.stage.difficulty);
  const index=((game.routeSeed??0)>>>0)+(owner.reinforcementsCalled??0);
  const spec=deck[index%deck.length];
  owner.reinforcementsCalled=(owner.reinforcementsCalled??0)+1;
  const copy=game.spawn('boss',x,z,null,spec);
  copy.summoner=owner;
  copy.recover=.70;
  copy.cool=1.04;
  game.view.spellAccent(copy,{action:'summon',element:'void',tint:portalTint,radius:1.55,power:.82,seed:index%65521});
  game.view.spark(copy.x,.40,copy.z,portalTint,12,.82,'void');
}

export function wardenBoon(hero,time){
  return hero.wardenBoonUntil>time?hero.wardenBoonStacks:0;
}

export function rewardWardenReinforcement(game){
  const {hero,t,view}=game;
  hero.hp=Math.min(hero.maxHp,hero.hp+hero.maxHp*.12);
  hero.wardenBoonStacks=Math.min(3,wardenBoon(hero,t)+1);
  hero.wardenBoonUntil=t+12;
  view.spark(hero.x,.63,hero.z,rewardTint,11,.77,'light');
  if(t-(game.wardenRewardSound??-1)>.24){
    game.wardenRewardSound=t;
    game.audio.play('blessing');
  }
}

export function dismissWardenReinforcements(game,owner){
  game.enemies=game.enemies.filter(unit=>{
    if(unit.summoner!==owner||unit.hp<=0)return true;
    unit.hp=0;
    unit.dismissed=true;
    game.view.spark(unit.x,.52,unit.z,portalTint,4,.60,'void');
    game.view.removeActor(unit.visual);
    return false;
  });
  game.hazards=game.hazards.filter(hazard=>{
    if(!hazard.owner?.dismissed)return true;
    if(hazard.visual)game.view.removeProjectile(hazard.visual);
    return false;
  });
}
