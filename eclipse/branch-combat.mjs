import {branches} from './progression.mjs?v=squad-1';
import {RobotSquad} from './robot-squad.mjs?v=squad-1';
import {EnemyRadar,Medics} from './tech-support.mjs?v=squad-1';
import {CthunHand} from './cthun-hand.mjs?v=squad-1';

const spirit=0xbbabff,hex=0xe597ff;
const range=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const targetable=(game,enemy)=>enemy.hp>0&&enemy.age>=.23&&enemy.phaseGuard<=0
  &&!(game.bossArena?.locked&&game.bossArena.boss===enemy);

export class BranchCombat {
  constructor(view) {
    this.view=view;
    this.skills=new Set();
    this.radar=new EnemyRadar();
    this.squad=null;
    this.tendrils=null;
    this.medics=null;
    this.ready={};
  }

  start(profile) {
    this.end();
    const branch=branches.find(entry=>entry.id===profile.branch);
    this.skills=new Set(branch?.skills.filter(skill=>profile.branchSkills.includes(skill.id)).map(skill=>skill.id));
    if(this.skills.has('robot-squad')) this.squad??=new RobotSquad(this.view);
    if(this.skills.has('cthun-hand')) this.tendrils??=new CthunHand(this.view);
    this.reviveReady=this.skills.has('medic');
    if(this.reviveReady) this.medics??=new Medics(this.view);
  }

  enter(game) {
    this.radar.hide();
    this.medics?.hide();
    if(this.skills.has('robot-squad')) this.squad.enter(game);
    if(this.skills.has('cthun-hand')) this.tendrils.enter(game);
  }

  end() {
    this.squad?.hide();
    this.tendrils?.hide();
    this.medics?.hide();
    this.radar.hide();
    this.ready={veil:0,seal:0};
    this.reviveReady=false;
    this.skills.clear();
  }

  render(game) {
    if(this.skills.has('radar')&&game.state==='play') this.radar.render(this.view,game.enemies);
    else this.radar.hide();
  }

  update(game,dt) {
    if(this.skills.has('robot-squad')) this.squad.update(game,dt);
    if(this.skills.has('cthun-hand')) this.tendrils.update(game,dt);
    this.medics?.update(game);
  }

  targets(game,point,radius) {
    return game.enemies.filter(enemy=>targetable(game,enemy)&&range(point,enemy)<radius)
      .sort((a,b)=>range(a,point)-range(b,point));
  }

  hit(game,enemy,point,multiplier,tint) {
    return game.hit(enemy,game.hero.damage*multiplier,point,.12,tint,'light',undefined,'support');
  }

  rollEnd(game) {
    if(!this.skills.has('veil')||this.ready.veil>game.t) return;
    this.ready.veil=game.t+8;
    game.hero.veilUntil=game.t+2;
    game.view.sealFx(game.hero.x,game.hero.z,spirit,1.07,.58);
    game.audio.play('branch-spirit');
  }

  revive(game) {
    if(!this.reviveReady) return false;
    this.reviveReady=false;
    const h=game.hero;
    h.hp=h.maxHp;
    h.invulnerable=2.4;
    h.reaction=h.motion=h.slash=null;
    h.rolling=h.move=h.snared=h.vx=h.vz=0;
    game.interruptLink();
    game.damageFlash=0;
    this.medics.launch(game);
    game.view.shock(h.x,h.z,0x98ffce,2.3,.83);
    game.view.sealFx(h.x,h.z,0xc3ffeb,1.2,1.15);
    game.audio.play('branch-revive');
    game.announce('科技','急救小隊抵達','生命已回滿 · 本局復活機會已用',2.1);
    return true;
  }

  defeat(game,enemy) {
    if(!this.skills.has('funeral-seal')||this.ready.seal>game.t) return;
    this.ready.seal=game.t+5;
    const {x,z}=enemy;
    const point={x,z};
    game.view.sealFx(x,z,hex,1.56,.66);
    game.schedule(.36,()=>this.burst(game,point,2.08,.69,hex));
  }

  burst(game,point,radius,multiplier,tint) {
    game.view.shock(point.x,point.z,tint,radius,.8);
    game.audio.play('branch-spirit');
    for(const target of this.targets(game,point,radius)) this.hit(game,target,point,multiplier,tint);
  }
}
