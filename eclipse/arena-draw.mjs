import {withinThreat} from './threats.mjs?v=shifting-2';

const spacing=.52;
const roomWidth=41, roomDepth=34;
const lanternSpots=[{x:-6.4,z:-4.4},{x:6.4,z:-4.4},{x:0,z:8.5}];
const extraCover=[{x:-7.2,z:1.1,radius:.76},{x:7.2,z:3.6,radius:.76}];
const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const round=value=>Math.round(value*100)/100;

function seeded(seed) {
  return () => {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/0x100000000;
  };
}

export function insideArena(point,margin=0) {
  const side=point.z<-3.9?10.35:11.45;
  return Math.abs(point.x)<=side-margin&&point.z>=-7.55+margin&&point.z<=11.15-margin;
}

export function onArenaHazard(point,zone,margin=0) {
  if (!margin) return withinThreat(point,zone);
  if (zone.kind==='line') {
    const dx=point.x-zone.x,dz=point.z-zone.z;
    const c=Math.cos(zone.angle),s=Math.sin(zone.angle);
    return Math.abs(dx*c+dz*s)<zone.radius*.5+margin&&Math.abs(-dx*s+dz*c)<zone.width+.13+margin;
  }
  return gap(point,zone)<zone.radius+.12+margin;
}

function isSafe(point,obstacles,hazards,margin=.42) {
  return insideArena(point,margin)
    && !obstacles.some(rock=>gap(point,rock)<rock.radius+margin)
    && !hazards.some(zone=>onArenaHazard(point,zone,margin));
}

function walkable(stage,obstacles,hazards) {
  const map=new Uint8Array(roomWidth*roomDepth);
  const cells=[];
  let start=-1, closest=.97;
  for (let row=0;row<roomDepth;row++) {
    for (let column=0;column<roomWidth;column++) {
      const point={x:(column-20)*spacing,z:row*spacing-7.1};
      const index=row*roomWidth+column;
      cells.push(point);
      if (!isSafe(point,obstacles,hazards)) continue;
      map[index]=1;
      const distance=gap(point,stage.spawn);
      if (distance<closest) {
        start=index;
        closest=distance;
      }
    }
  }
  if (start===-1) return [];
  const visited=[start];
  map[start]=2;
  for (let cursor=0;cursor<visited.length;cursor++) {
    const index=visited[cursor];
    const column=index%roomWidth;
    for (const neighbor of [column>0?index-1:-1,column<roomWidth-1?index+1:-1,index-roomWidth,index+roomWidth]) {
      if (map[neighbor]!==1) continue;
      const a=cells[index],b=cells[neighbor];
      if (!isSafe({x:(a.x+b.x)*.5,z:(a.z+b.z)*.5},obstacles,hazards)) continue;
      map[neighbor]=2;
      visited.push(neighbor);
    }
  }
  return visited.map(index=>cells[index]);
}

function placeSites(template,anchors,reachable,obstacles,hazards,draw,previous) {
  const sites=[];
  for (const [index,anchor] of anchors.entries()) {
    const room=template.mode==='hold'?1.18:template.mode==='bait'?1.04:.68;
    const separation=template.mode==='bait'?3.85:2.75;
    const valid=point=>isSafe(point,obstacles,hazards,room)
      && reachable.some(cell=>gap(point,cell)<.61)&&sites.every(site=>gap(point,site)>=separation);
    const saved=previous?.[index];
    if (saved) {
      // The earlier phase is complete. Keep its fixtures in place as the floor around them shifts.
      const keepClear=template.mode==='light'?hazards:[];
      if (!isSafe(saved,obstacles,keepClear,.44)) return null;
      sites.push(saved);
      continue;
    }
    let picked=null;
    for (let count=0;count<26&&!picked;count++) {
      const point={x:round(clamp(anchor.x+(draw()-.5)*3.6,-8.5,8.5)),
        z:round(clamp(anchor.z+(draw()-.5)*3.6,-5.8,8.3)),symbol:anchor.symbol};
      if (valid(point)) picked=point;
    }
    if (!picked&&valid(anchor)) picked=anchor;
    if (!picked) return null;
    sites.push(picked);
  }
  return sites;
}

function placePillars(stage,anchors,draw) {
  const pillars=[];
  for (const anchor of anchors) {
    let chosen=null;
    for (let attempt=0;attempt<20&&!chosen;attempt++) {
      const position={...anchor,x:round(clamp(anchor.x+(draw()-.5)*4.6,-9.1,9.1)),
        z:round(clamp(anchor.z+(draw()-.5)*3.8,-5.5,8.8))};
      if (!isSafe(position,[...stage.props,...pillars],[],anchor.radius+.36)) continue;
      if (gap(position,stage.spawn)<anchor.radius+1.10||gap(position,{x:0,z:-3.2})<anchor.radius+1.2) continue;
      chosen=position;
    }
    if (!chosen) return null;
    pillars.push(chosen);
  }
  return pillars;
}

function drawPhase(stage,template,mirror,draw,aftershock,previous) {
  const lean=(draw()-.5)*2.6;
  const flip=point=>({...point,x:round(point.x*mirror)});
  for (let attempt=0;attempt<36;attempt++) {
    const easing=attempt<12?1:attempt<24?.82:.66;
    const hazards=template.hazards.map((source,index)=>{
      const zone=flip(source);
      const side=(index%2===0?1:-1);
      zone.x=round(zone.x+lean+(draw()-.5)*2.25);
      zone.z=round((aftershock?4-zone.z:zone.z)+(draw()-.5)*2.5);
      if (zone.kind==='line') {
        const angle=aftershock?-.86*source.angle+.27:source.angle;
        zone.angle=round(angle*mirror+(draw()-.5)*.40+side*lean*.057);
        zone.width=round(source.width*(.9+draw()*.19)*easing);
      }
      zone.radius=round(source.radius*(.84+draw()*.27)*easing);
      return zone;
    });
    const basePillars=template.pillars??(stage.props.length?[]:extraCover);
    const pillars=placePillars(stage,basePillars.map(flip),draw);
    if (!pillars) continue;
    const obstacles=[...stage.props,...pillars];
    if (!isSafe(stage.spawn,obstacles,hazards)) continue;
    const reachable=walkable(stage,obstacles,hazards);
    if (reachable.length<420||!reachable.some(point=>point.z<-4.25)
      || !reachable.some(point=>gap(point,{x:0,z:-3.2})<2.45)) continue;
    const sites=placeSites(template,(template.sites??[]).map(flip),reachable,obstacles,hazards,draw,previous);
    if (sites) return {...template,hazards,pillars,sites};
  }
  return null;
}

export function drawBossEncounter(stage,layout,seed) {
  const draw=seeded(seed);
  const mirror=draw()<.5?-1:1;
  const laterPhase=stage.chapterBoss&&stage.chapter>=2;
  // If an aftershock covers a mechanism, draw the pair again before starting the fight.
  for (let attempt=0;attempt<8;attempt++) {
    const first=drawPhase(stage,layout,mirror,draw,false);
    if (!first) continue;
    const aftershock=laterPhase&&!layout.last;
    const last=laterPhase?drawPhase(stage,layout.last??layout,mirror,draw,aftershock,aftershock?first.sites:null):null;
    if (laterPhase&&!last) continue;
    const lamps=first.mode==='light'?first.sites:lanternSpots.map(spot=>({
      x:round(spot.x*mirror+(draw()-.5)*2.8),z:round(spot.z+(draw()-.5)*1.9),
    }));
    return {first,last,lamps,aftershock};
  }
  // Retain the hand-authored encounter if the generated candidates do not fit.
  const aftershock=laterPhase&&!layout.last;
  const last=laterPhase ? layout.last??{...layout,hazards:layout.hazards.map(zone=>({
    ...zone,z:4-zone.z,angle:zone.kind==='line'?-.86*zone.angle+.27:0,
  }))} : null;
  return {first:layout,last,lamps:layout.mode==='light'?layout.sites:lanternSpots,aftershock};
}
