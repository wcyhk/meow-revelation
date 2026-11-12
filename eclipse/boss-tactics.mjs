import {insideArena, onArenaHazard} from './arena-draw.mjs?v=shifting-2';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const TAU=Math.PI*2;
const directions=Array.from({length:12},(_,i)=>[Math.cos(i*TAU/12),Math.sin(i*TAU/12)]);
const step=(point,dx,dz,amount)=>({x:point.x+dx*amount,z:point.z+dz*amount});

function coveringPillar(cover,boss,hero) {
  const dx=hero.x-boss.x,dz=hero.z-boss.z;
  const length2=dx*dx+dz*dz;
  if (length2<4) return null;
  return cover.find(rock=>{
    if (distance(rock,hero)>rock.radius+1.95) return false;
    const along=((rock.x-boss.x)*dx+(rock.z-boss.z)*dz)/length2;
    return along>.10&&along<.94&&distance(rock,step(boss,dx,dz,along))<rock.radius*.87;
  })??null;
}

export class BossTactics {
  constructor(arena) {
    this.arena=arena;
    this.game=arena.game;
    this.boss=arena.boss;
  }

  reset() {
    this.last={x:this.game.hero.x,z:this.game.hero.z};
    this.cover=[...this.game.stage.props,...this.arena.pillars];
    this.coverTime=0;
    this.shelter=null;
    this.vx=this.vz=0;
    this.ready=2.35-this.game.stage.chapter*.07;
    this.cueTime=0;
    this.cue='';
  }

  observe(dt) {
    const {hero}=this.game;
    const dx=(hero.x-this.last.x)/dt,dz=(hero.z-this.last.z)/dt;
    this.last.x=hero.x;
    this.last.z=hero.z;
    const pace=Math.hypot(dx,dz);
    const track=hero.rolling<=0&&pace<hero.moveSpeed+2;
    const blend=1-Math.exp(-dt*8);
    this.vx+=((track?dx:0)-this.vx)*blend;
    this.vz+=((track?dz:0)-this.vz)*blend;
    const rock=hero.rolling<=0&&pace<2.4?coveringPillar(this.cover,this.boss,hero):null;
    this.coverTime=rock&&rock===this.shelter?this.coverTime+dt:0;
    this.shelter=rock;
    this.ready-=dt;
    this.cueTime-=dt;
  }

  nearMechanism(zone,margin) {
    return this.arena.locked&&this.arena.points.some(point=>!point.done&&onArenaHazard(point,zone,margin));
  }

  hasExits(hero,zone) {
    let first=null;
    for (const [dx,dz] of directions) {
      let open=true;
      for (const length of [.65,1.30,1.95,2.60,3.25]) {
        const point=step(hero,dx,dz,length);
        if (!insideArena(point,.43)||this.game.isBlocked(point,.42)
          || this.arena.hazards.some(hazard=>onArenaHazard(point,hazard,.17))
          || ((zone.kind==='line'||length===3.25)&&onArenaHazard(point,zone,.33))) {
          open=false;
          break;
        }
      }
      if (!open) continue;
      if (first&&first[0]*dx+first[1]*dz<.56) return true;
      first??=[dx,dz];
    }
    return false;
  }

  coverAttack(hero,chapter) {
    if (this.coverTime<1.25-chapter*.04) return null;
    const zone={kind:'circle',x:hero.x,z:hero.z,radius:1.70+chapter*.044};
    if (this.nearMechanism(zone,.88)||!this.hasExits(hero,zone)) return null;
    return {...zone,tactic:'flush',delay:1.18,pattern:'marked'};
  }

  routeAttack(hero,chapter) {
    const pace=Math.hypot(this.vx,this.vz);
    if (pace<1.8) return null;
    const dx=this.vx/pace,dz=this.vz/pace;
    for (const lead of [Math.min(2.95,1.65+pace*.19),1.85]) {
      const center=step(hero,dx,dz,lead);
      const radius=4.15+chapter*.205,width=.45+chapter*.022;
      const zone={kind:'line',...center,radius,width,angle:Math.atan2(dz,dx)+Math.PI*.5};
      if (!insideArena(step(center,-dz,dx,radius*.5),.48)||!insideArena(step(center,dz,-dx,radius*.5),.48)
        || this.nearMechanism(zone,1.04)||!this.hasExits(hero,zone)) continue;
      return {...zone,tactic:'seal',delay:1.12,pattern:'cinders',residue:'embers'};
    }
    return null;
  }

  tryAttack() {
    const {arena,boss,game}=this;
    if (!arena.phase||arena.grace>0||this.ready>0||boss.phaseGuard>0
      || (arena.locked&&arena.plan.mode==='bait')) return false;
    const {hero,view,audio,stage}=game;
    if (hero.rolling>0||arena.hazards.some(zone=>onArenaHazard(hero,zone,.08))) return false;
    const attack=this.coverAttack(hero,stage.chapter)??this.routeAttack(hero,stage.chapter);
    if (!attack) {
      this.ready=.22;
      return false;
    }
    this.ready=8.4-stage.chapter*.19;
    this.coverTime=0;
    this.cue=attack.tactic==='flush'?'掩體受襲 · 離開紅圈':'裂地封路 · 改道或翻滾';
    this.cueTime=attack.delay+.42;
    boss.attack={pattern:attack.tactic,time:attack.delay};
    const tint=0xff7957;
    const phase=arena.phase;
    const active=()=>boss.hp>0&&arena.phase===phase;
    game.hazards.push({...attack,owner:boss,encounter:arena,arenaPhase:phase,tint,
      effect:boss.spec.effect,damage:boss.spec.hurt*(attack.tactic==='flush'?.84:.64)});
    view.warning(attack.kind,attack.x,attack.z,attack.radius,attack.delay,-(attack.angle??0),attack.width??0,tint,active);
    if (attack.tactic==='flush') view.fallingShard(attack.x,attack.z,attack.radius,attack.delay,tint,active);
    audio.play('warning');
    return true;
  }
}
