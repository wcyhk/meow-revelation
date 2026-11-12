import {bossWeaknesses} from './boss-weaknesses.mjs?v=counter-1';
import {withinThreat} from './threats.mjs?v=counter-1';

const INK=0x9ff4e4;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const pointAt=(a,dx,dz,length)=>({x:a.x+dx*length,z:a.z+dz*length});

function contact(start,dx,dz,length,target,radius) {
  const x=target.x-start.x,z=target.z-start.z;
  const center=x*dx+z*dz;
  const side=x*dz-z*dx;
  if (center<0||Math.abs(side)>radius) return Infinity;
  const entry=Math.max(0,center-Math.sqrt(radius*radius-side*side));
  return entry<=length?entry:Infinity;
}

export class BossCounters {
  constructor(arena) {
    this.arena=arena;
    this.game=arena.game;
    this.boss=arena.boss;
    this.profile=bossWeaknesses[this.game.stage.floor];
    this.active=false;
  }

  reset(phase) {
    this.weakness=phase===2&&this.profile.last?this.profile.last:this.profile;
    this.charge=null;
    this.ready=2.45;
    this.cooldown=0;
    this.chargeHint=0;
    this.stagger=0;
    this.dwell=0;
    this.inside=null;
    this.rifts=new WeakMap();
    this.active=true;
  }

  get hint() {
    if (!this.active) return '';
    if (this.stagger>0) return this.weakness.name+(this.arena.locked?' · 頭目暈眩':' · 弱點暴露');
    if (this.chargeHint>0) return '直衝鎖定 · 離開紅線';
    return '弱點 · '+this.weakness.hint;
  }

  get canCounter() {
    return this.active&&this.arena.grace<=0&&this.cooldown<=0&&this.boss.phaseGuard<=0
      &&this.boss.hp>0&&this.game.state==='play';
  }

  get rocks() {
    return this.arena.tactics.cover;
  }

  trigger(source) {
    if (!this.canCounter) return false;
    const {boss,arena,game,weakness}=this;
    const phase=arena.phase;
    const {view,audio}=game;
    this.cooldown=weakness.stun+4.4;
    this.chargeHint=0;
    boss.attack=null;
    boss.kx=boss.kz=0;
    this.charge=null;
    if (distance(source,boss)>.50) {
      view.bolt({...source,y:.80},{x:boss.x,z:boss.z,y:1.58},INK,1.8);
    }
    view.shock(source.x,source.z,INK,2.0,.93);
    view.spark(boss.x,boss.spec.height*.53,boss.z,INK,26,1.18,'stone');
    view.shake=Math.max(view.shake,.26);
    audio.play('heavy');
    if (!arena.locked) game.hit(boss,boss.spec.hp*weakness.damage,source,0,INK);
    if (boss.hp>0&&arena.phase===phase) {
      this.stagger=weakness.stun;
      boss.exposed=Math.max(boss.exposed,weakness.stun+.75);
      boss.cool=Math.max(boss.cool,weakness.stun+.35);
    }
    return true;
  }

  activeSite(position,radius=this.weakness.radius) {
    return this.arena.points.find(point=>point.done&&distance(point,position)<=radius);
  }

  terrainAt(position) {
    return this.arena.hazards.find(zone=>zone.kind===this.weakness.shape&&withinThreat(position,zone));
  }

  tick(dt) {
    if (!this.active) return;
    this.cooldown-=dt;
    this.stagger-=dt;
    this.ready-=dt;
    this.chargeHint-=dt;
    if (!this.canCounter) return;
    const {boss,weakness}=this;
    if (weakness.type==='site'&&!weakness.landing&&!weakness.after) {
      const site=this.activeSite(boss);
      if (site&&site!==this.inside) this.trigger(site);
      this.inside=site;
    }
    if (weakness.type==='terrain'&&weakness.dwell&&!this.arena.locked) {
      const zone=this.terrainAt(boss);
      if (zone!==this.inside) this.dwell=0;
      this.dwell+=dt;
      if (zone&&this.dwell>=weakness.dwell) {
        if (this.trigger(zone)) this.dwell=0;
      }
      this.inside=zone;
    }
  }

  tryCharge(gap) {
    if (!this.active||this.weakness.type!=='charge'||this.arena.grace>0||this.ready>0||gap<2.8||gap>9.7) return false;
    const {boss,game,arena}=this;
    const dx=(game.hero.x-boss.x)/gap,dz=(game.hero.z-boss.z)/gap;
    const length=Math.min(10.7,gap+1.6), delay=1.06;
    const center=pointAt(boss,dx,dz,length*.5);
    const phase=arena.phase;
    const attack={pattern:'counterCharge',time:delay,windup:delay,dx,dz,length};
    boss.attack=attack;
    this.ready=7.3;
    this.chargeHint=delay;
    game.view.warning('line',center.x,center.z,length,delay,-Math.atan2(dz,dx),.77,boss.spec.tint,
      ()=>arena.phase===phase&&boss.hp>0&&boss.attack===attack);
    game.audio.play('warning');
    return true;
  }

  resolveAttack(attack) {
    if (!this.active) return;
    const {boss,weakness}=this;
    if (attack.pattern==='counterCharge') {
      this.charge={dx:attack.dx,dz:attack.dz,left:attack.length,hitHero:false};
      return;
    }
    if (!this.canCounter) return;
    if (weakness.type==='terrain'&&[weakness.pattern,weakness.after,weakness.landing].includes(attack.pattern)) {
      if (weakness.landing&&!attack.landing) return;
      const zone=this.terrainAt(boss);
      if (zone) this.trigger(boss);
    }
    if (weakness.type==='site'&&(attack.pattern===weakness.after||(attack.landing&&attack.pattern===weakness.landing))) {
      const site=this.activeSite(boss);
      if (site) this.trigger(site);
    }
  }

  moveCharge(dt) {
    const charge=this.charge;
    if (!charge) return false;
    const {boss,game,arena,weakness}=this;
    const {dx,dz}=charge;
    const start={x:boss.x,z:boss.z};
    const step=Math.min(charge.left,19.8*dt);
    let stop=step, rock;
    for (const item of this.rocks) {
      const entry=contact(start,dx,dz,step,item,item.radius+.42);
      if (entry<stop) {stop=entry;rock=item;}
    }
    let anchor;
    if (weakness.target==='anchor'&&arena.locked) {
      for (const site of arena.points) {
        if (site.done) continue;
        const entry=contact(start,dx,dz,stop,site,.84);
        if (entry<stop) {stop=entry;anchor=site;rock=null;}
      }
    }
    const endpoint=pointAt(start,dx,dz,stop);
    game.bound(endpoint);
    const traveled=distance(start,endpoint);
    boss.x=endpoint.x;boss.z=endpoint.z;
    boss.move=1;
    charge.left-=traveled;
    const heroDistance=contact(start,dx,dz,traveled,game.hero,.76);
    if (!charge.hitHero&&heroDistance<=traveled) {
      charge.hitHero=game.hurt(boss.spec.hurt*.88,start.x,start.z,boss,'counterCharge');
    }
    if (game.state!=='play'||this.charge!==charge||boss.hp<=0) return true;
    if (anchor) {
      anchor.hp=0;
      arena.activate(anchor);
      this.trigger(anchor);
    } else if (rock&&weakness.target==='pillar') {
      this.trigger(rock);
    } else if (weakness.target==='pool'&&arena.hazards.some(zone=>zone.kind==='circle'&&withinThreat(boss,zone))) {
      this.trigger(boss);
    }
    if (anchor||rock||charge.left<=.03||traveled+.015<step) {
      this.charge=null;
      boss.recover=Math.max(boss.recover,.56);
    }
    return true;
  }

  owns(hazard) {
    return this.active&&hazard.owner===this.boss&&(hazard.bossPhase??hazard.arenaPhase)===this.arena.phase;
  }

  projectileBlocked(hazard) {
    if (!this.canCounter||!this.owns(hazard)||this.weakness.type!=='projectile'||hazard.pattern!==this.weakness.pattern) return;
    const rock=this.rocks.find(rock=>distance(rock,hazard)<rock.radius+.18&&distance(rock,this.boss)>1.35);
    if (rock) this.trigger(rock);
  }

  impact(hazard) {
    if (!this.canCounter||!this.owns(hazard)) return;
    const {boss,weakness}=this;
    if (hazard.pattern!==weakness.pattern) return;
    if (weakness.type==='selfCast'&&withinThreat(boss,hazard)) {
      const lamp=weakness.lit?this.activeSite(boss,2.75):null;
      if (!weakness.lit||lamp) this.trigger(lamp??hazard);
    }
    if (weakness.type==='conduit'&&hazard.kind==='line'&&hazard.source&&hazard.aim) {
      const {source,aim}=hazard;
      const length=distance(source,aim);
      if (length<2) return;
      const dx=(aim.x-source.x)/length,dz=(aim.z-source.z)/length;
      const candidates=weakness.target==='pillar'?this.rocks:this.arena.points.filter(point=>point.done);
      const point=candidates.find(point=>distance(source,point)>1.12&&withinThreat(point,hazard)
        &&contact(source,dx,dz,length-.32,point,point.radius??.86)<Infinity);
      if (point&&this.trigger(point)&&weakness.target==='pillar') {
        const {hero}=this.game;
        return (hero.x-point.x)*dx+(hero.z-point.z)*dz>.20;
      }
    }
  }

  watchRift(hazard) {
    if (!this.owns(hazard)||this.weakness.type!=='rift'||hazard.shape!=='line'||hazard.residue!=='embers'
      || (this.weakness.sealOnly&&hazard.tactic!=='seal')) return;
    this.rifts.set(hazard,withinThreat(this.boss,{...hazard,kind:'line'}));
  }

  riftStep(hazard) {
    if (!this.rifts?.has(hazard)||!this.owns(hazard)) return;
    const inside=withinThreat(this.boss,{...hazard,kind:'line'});
    const entered=inside&&!this.rifts.get(hazard);
    this.rifts.set(hazard,inside);
    if (entered&&!this.arena.locked) this.trigger(hazard);
  }

  mirror(point) {
    if (this.weakness.type==='mirror'&&distance(this.boss,point)<this.weakness.range) this.trigger(point);
  }
}
