export const summonGap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export function summonEnemy(game,unit){
  return !!unit&&unit.hp>0&&unit.age>=.23&&!(unit.turnedUntil>game.t)&&!(unit.phaseGuard>0)
    &&!unit.phaseChange&&!(game.bossArena?.locked&&game.bossArena.boss===unit);
}

export function strongestSummonTarget(game,origin,range,canReach){
  let chosen,chosenTier=-1,chosenHp=0,chosenHurt=0,chosenGap=range;
  for(const foe of game.enemies){
    if(!summonEnemy(game,foe))continue;
    const distance=summonGap(origin,foe);
    if(distance>range)continue;
    const tier=foe.kind==='boss'?2:foe.omen?1:0;
    const hp=foe.spec?.hp??foe.hp,hurt=foe.spec?.hurt??0;
    const better=tier>chosenTier||tier===chosenTier&&(hp>chosenHp||hp===chosenHp&&
      (hurt>chosenHurt||hurt===chosenHurt&&distance<chosenGap));
    if(!better||(canReach&&!canReach(foe)))continue;
    chosen=foe;chosenTier=tier;chosenHp=hp;chosenHurt=hurt;chosenGap=distance;
  }
  return chosen;
}

export function focusSummon(game,tracker,origin,range=Infinity){
  if(game.t>=(tracker.searchAt??0)||tracker.target&&
    (!summonEnemy(game,tracker.target)||summonGap(origin,tracker.target)>range)){
    tracker.target=strongestSummonTarget(game,origin,range);
    tracker.searchAt=game.t+(tracker.target?.kind==='boss'?.23:.18);
  }
  return tracker.target;
}

export function clearSummonShot(game,from,to){
  const dx=to.x-from.x,dz=to.z-from.z;
  const steps=Math.ceil(Math.hypot(dx,dz)/.46);
  const point={x:from.x,z:from.z};
  for(let i=1;i<steps;i++){
    point.x=from.x+dx*i/steps;
    point.z=from.z+dz*i/steps;
    if(game.isBlocked(point,.05))return false;
  }
  return true;
}

export function chaseSummon(game,unit,target,step,margin){
  const dx=target.x-unit.x,dz=target.z-unit.z;
  const distance=Math.hypot(dx,dz);
  const travel=Math.min(step,distance);
  if(travel<.001)return 0;
  const x=dx/distance*travel,z=dz/distance*travel;
  let moved=game.moveUnit(unit,x,z,margin);
  if(moved>travel*.42)return moved;
  const side=unit.summonSide??1;
  for(const sign of [side,-side]){
    const distanceMoved=game.moveUnit(unit,x*.25-z*sign,z*.25+x*sign,margin);
    moved+=distanceMoved;
    if(distanceMoved>travel*.32){unit.summonSide=sign;break;}
  }
  return moved;
}
