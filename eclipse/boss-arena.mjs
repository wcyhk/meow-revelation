import {arenaTerrain} from './arena-layouts.mjs?v=bestiary-1';
import {withinThreat} from './threats.mjs?v=impact-1';
import {drawBossEncounter} from './arena-draw.mjs?v=shifting-2';
import {BossTactics} from './boss-tactics.mjs?v=shifting-2';
import {BossCounters} from './boss-counters.mjs?v=ledger-1';

const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);

export class BossArena {
  constructor(game,layout,boss,seed,encounter) {
    this.game=game;
    this.layout=layout;
    this.boss=boss;
    this.encounter=encounter??drawBossEncounter(game.stage,layout,seed);
    this.tactics=new BossTactics(this);
    this.counters=new BossCounters(this);
    this.phase=0;
    this.points=[];
  }

  transform(phase) {
    this.phase=phase;
    this.plan=phase===2 ? this.encounter.last : this.encounter.first;
    this.terrain=arenaTerrain(this.plan.style);
    this.pillars=this.plan.pillars??[];
    this.aftershock=phase===2&&this.encounter.aftershock;
    this.hazards=this.plan.hazards;
    // Each later arena needs one clear. The final arena has a second set of mechanisms.
    const reset=phase===1||!!this.layout.last;
    if (reset) {
      const health=this.game.hero.damage*2.05;
      this.points=(this.plan.sites??[]).map(site=>({
        ...site,done:false,charge:0,kind:'arenaAnchor',age:1,hp:health,maxHp:health,
      }));
    }
    this.locked=!!this.plan.mode&&this.points.some(point=>!point.done);
    this.shift=0;
    this.grace=.85;
    this.castReady=1.4;
    this.baitCooldown=0;
    this.shieldCue=0;
    this.floorDamage=0;
    this.tactics.reset();
    this.counters.reset(phase);
    this.game.view.transformBossArena(this);
    this.game.setupMissionPins();
    this.game.objective(this.locked?this.plan.hint:'擊敗 '+this.boss.spec.name);
  }

  get darkness() {
    if (!this.phase) return 0;
    const lights=this.plan.mode==='light' ? this.points.filter(point=>point.done).length/this.points.length : 0;
    const shadow=Math.min(1,(this.plan.dark??this.terrain.shade)+(this.aftershock?.16:0));
    return shadow*(1-lights*.68)*(1-Math.exp(-this.shift*3.9));
  }

  get targets() {
    return this.locked&&this.plan.mode==='break' ? this.points.filter(point=>!point.done) : [];
  }

  nearby(hero) {
    if(!this.locked||this.plan.mode!=='light')return null;
    return this.points.find(point=>!point.done&&distance(point,hero)<1.48)??null;
  }

  label() {
    return '重燃祭燈';
  }

  interact(point) {
    if (point!==this.nearby(this.game.hero)) return;
    this.activate(point);
  }

  hit(point,damage) {
    if (!this.locked||this.plan.mode!=='break'||point.done) return false;
    point.hp=Math.max(0,point.hp-damage);
    const {view}=this.game;
    view.spark(point.x,.81,point.z,this.terrain.ink,8,.67,'stone');
    if (!point.hp) this.activate(point);
    return true;
  }

  rejectHit(origin) {
    if (this.shieldCue>0) return;
    this.game.impact(this.boss,origin,'block',this.terrain.ink);
    this.shieldCue=.46;
  }

  blocks(unit,margin,previous) {
    return this.phase>0&&this.pillars.some(pillar=>{
      const gap=distance(unit,pillar);
      return gap<pillar.radius+margin&&(!previous||gap<=distance(previous,pillar));
    });
  }

  activate(point) {
    if (point.done||!this.locked) return;
    point.done=true;
    const {view,audio}=this.game;
    view.shock(point.x,point.z,this.terrain.ink,1.85,.77);
    view.spark(point.x,.75,point.z,this.terrain.ink,19,1.18,'gold');
    if (this.points.some(site=>!site.done)) {
      audio.play('blessing');
      return;
    }
    this.locked=false;
    this.boss.exposed=3.5;
    this.boss.stun=.63;
    this.boss.recover=Math.max(this.boss.recover,.63);
    view.bolt({x:point.x,y:.62,z:point.z},{x:this.boss.x,y:1.68,z:this.boss.z},this.terrain.ink,2.3);
    view.shock(this.boss.x,this.boss.z,this.terrain.ink,3.1,1.08);
    this.game.impact(this.boss,point,'break',this.terrain.ink);
    this.game.announce(this.boss.spec.name,'護盾破裂','弱點暴露，趁機進攻。',1.5);
    this.game.objective('擊敗 '+this.boss.spec.name);
  }

  resolve(hazard) {
    if (hazard.arena!==this||hazard.arenaPhase!==this.phase||!this.locked) return;
    for (const point of this.points) {
      if (!point.done&&withinThreat(point,hazard)) {
        this.activate(point);
        this.counters.mirror(point);
      }
    }
  }

  tick(dt) {
    if (!this.phase||this.boss.hp<=0) return;
    this.tactics.observe(dt);
    this.shift+=dt;
    this.grace-=dt;
    this.counters.tick(dt);
    this.shieldCue-=dt;
    this.floorDamage-=dt;
    if (this.grace>0) return;
    const {hero,view,audio}=this.game;
    const hazardous=this.hazards.find(zone=>withinThreat(hero,zone));
    if (hazardous&&hero.rolling<=0) {
      if (this.terrain.slow) hero.snared=Math.max(hero.snared,.12);
      if (this.terrain.damage&&this.floorDamage<=0&&this.game.hurt(this.terrain.damage+this.game.stage.chapter*.85,hazardous.x,hazardous.z)) {
        this.floorDamage=.91;
        view.spark(hero.x,.38,hero.z,this.terrain.ink,9,.75,this.boss.spec.effect);
      }
    }
    if (!this.locked) return;
    if (this.plan.mode==='hold') {
      for (const point of this.points) {
        if (point.done) continue;
        if (distance(point,hero)<1.24&&hero.rolling<=0) point.charge+=dt;
        else point.charge=Math.max(0,point.charge-dt*.4);
        if (point.charge>=this.plan.hold) this.activate(point);
      }
    }
    if (this.plan.mode!=='bait') return;
    this.baitCooldown-=dt;
    this.castReady-=dt;
    // Stepping onto a fresh seal draws the boss's attention without waiting for its regular cycle.
    if (this.baitCooldown<=0&&hero.rolling<=0&&this.points.some(point=>!point.done&&distance(point,hero)<1.03)) {
      this.castReady=Math.min(this.castReady,.16);
    }
    if (this.castReady<=0&&!this.boss.attack) {
      this.castReady=4.8;
      this.baitCooldown=1.75;
      const {x,z}=hero;
      const radius=1.76, delay=1.10;
      this.boss.attack={pattern:'arenaBait',time:delay};
      this.game.hazards.push({kind:'circle',x,z,radius,delay,owner:this.boss,damage:this.boss.spec.hurt*.85,
        tint:this.terrain.ink,effect:this.boss.spec.effect,pattern:'burst',arena:this,arenaPhase:this.phase});
      view.warning('circle',x,z,radius,delay,0,0,this.terrain.ink);
      view.fallingShard(x,z,radius,delay,this.terrain.ink);
      audio.play('warning');
      this.game.announce(this.boss.spec.name,this.plan.cast,'紅圈鎖定 · 翻滾閃開',1.12);
    }
  }

  status() {
    if (this.tactics.cueTime>0) return this.tactics.cue;
    const {mode,hold}=this.plan;
    const done=this.points.filter(point=>point.done).length;
    const total=this.points.length;
    if (!mode) return this.plan.hint;
    if (!this.locked) return '護盾已破';
    if (mode==='hold') {
      const point=this.points.find(site=>!site.done&&site.charge>0);
      const charge=point?' · '+Math.min(99,Math.floor(point.charge/hold*100))+'%':'';
      return '蓄滿命印 '+done+'/'+total+charge;
    }
    return {
      light:'祭燈已點燃 '+done+'/'+total,
      bait:'引頭目擊碎封印 '+done+'/'+total,
      break:'已摧毀核心 '+done+'/'+total,
    }[mode];
  }
}
