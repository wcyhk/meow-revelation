import {branches,mawSkill} from './progression.mjs?v=maw-1';
import {RobotSquad} from './robot-squad.mjs?v=squad-1';
import {EnemyMarkers,Medics} from './tech-support.mjs?v=eye-aura-1';
import {CthunHand} from './cthun-hand.mjs?v=squad-1';
import {BlackGoatEye} from './black-goat-eye.mjs?v=eye-aura-1';
import {TsathogguaMouth} from './tsathoggua.mjs?v=maw-1';

const radarRange=13;
const range=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export class BranchCombat {
  constructor(view) {
    this.view=view;
    this.skills=new Set();
    this.radar=new EnemyMarkers('enemy-radar');
    this.squad=null;
    this.tendrils=null;
    this.eye=null;
    this.medics=null;
    this.maw=null;
    this.activeMaw=null;
  }

  start(profile) {
    this.end();
    const branch=branches.find(entry=>entry.id===profile.branch);
    this.skills=new Set(branch?.skills.filter(skill=>profile.branchSkills.includes(skill.id)).map(skill=>skill.id));
    if(this.skills.has('robot-squad')) this.squad??=new RobotSquad(this.view);
    if(this.skills.has('cthun-hand')) this.tendrils??=new CthunHand(this.view);
    if(this.skills.has('black-goat-eye')) this.eye??=new BlackGoatEye(this.view);
    if(this.skills.has(mawSkill.id)) this.activeMaw=this.maw??=new TsathogguaMouth(this.view);
    this.reviveReady=this.skills.has('medic');
    if(this.reviveReady) this.medics??=new Medics(this.view);
  }

  enter(game) {
    this.radar.hide();
    if(this.skills.has('black-goat-eye')) this.eye.update(game);
    this.medics?.hide();
    if(this.skills.has('robot-squad')) this.squad.enter(game);
    if(this.skills.has('cthun-hand')) this.tendrils.enter(game);
  }

  end() {
    this.squad?.hide();
    this.tendrils?.hide();
    this.eye?.reset();
    this.medics?.hide();
    this.radar.hide();
    this.maw?.reset();
    this.activeMaw=null;
    this.reviveReady=false;
    this.skills.clear();
  }

  render(game) {
    if(this.skills.has('radar')&&game.state==='play') {
      this.radar.render(this.view,game.enemies,foe=>foe.age>=.23&&range(foe,game.hero)<=radarRange,()=>.045);
    }
    else this.radar.hide();
    if(this.skills.has('black-goat-eye')) this.eye.render(game);
  }

  update(game,dt) {
    if(this.skills.has('robot-squad')) this.squad.update(game,dt);
    if(this.skills.has('cthun-hand')) this.tendrils.update(game,dt);
    if(this.skills.has('black-goat-eye')) this.eye.update(game);
    this.medics?.update(game);
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
}
