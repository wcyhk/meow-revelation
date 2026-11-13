import {createMaw,poseMaw} from './tsathoggua-art.mjs?v=maw-1';
import {mawSkill} from './progression.mjs?v=maw-1';

const life=1.04,swallowed=.86;
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};

function victimPose(victim,age) {
  const pull=ease((age-.30)/.53);
  return {x:victim.x*pull,z:victim.z*pull,pull};
}

export class TsathogguaMouth {
  constructor(view) {
    this.view=view;
    this.slots=[];
    this.expiries=[];
  }

  clearVisuals() {
    for(const slot of this.slots) {
      slot.art.root.visible=false;
      slot.victim=null;
    }
  }

  reset() {
    this.clearVisuals();
    this.expiries.length=0;
  }

  expire(time) {
    while(this.expiries.length&&this.expiries[0]<=time) this.expiries.shift();
  }

  get stacks() { return this.expiries.length; }
  get damage() { return 1+this.stacks*mawSkill.damage/100; }
  get speed() { return 1+this.stacks*mawSkill.speed/100; }
  remaining(time) { return Math.max(0,(this.expiries[0]??time)-time); }

  defeat(game,enemy) {
    this.expire(game.t);
    if(this.stacks===mawSkill.limit) this.expiries.shift();
    this.expiries.push(game.t+mawSkill.duration);
    const scale=enemy.kind==='boss'?1.53:1;
    const victim=enemy.maw={x:0,z:.90*scale,scale,at:game.t};
    let slot=this.slots.find(entry=>!entry.victim);
    if(!slot&&this.slots.length<(this.view.mobile?8:12)) {
      slot={art:createMaw(this.view),victim:null};
      this.slots.push(slot);
    }
    slot??=this.slots.reduce((oldest,entry)=>entry.victim.at<oldest.victim.at?entry:oldest);
    slot.victim=victim;
    slot.art.root.position.set(enemy.x,0,enemy.z+victim.z);
    slot.art.root.scale.setScalar(scale);
    slot.art.root.visible=true;
    poseMaw(slot.art,0,0,-victim.z/scale);
    this.view.spark(enemy.x,.12,enemy.z,0xa62042,7,.69,'void');
    game.audio.play('maw-open');
  }

  update(time) {
    for(const slot of this.slots) {
      const victim=slot.victim;
      if(!victim) continue;
      const age=time-victim.at;
      if(age>=life) {
        slot.art.root.visible=false;
        slot.victim=null;
        continue;
      }
      const pose=victimPose(victim,age);
      poseMaw(slot.art,age,(pose.x-victim.x)/victim.scale,(pose.z-victim.z)/victim.scale);
    }
  }

  poseVictim(enemy,time) {
    const age=time-enemy.maw.at;
    if(age>=swallowed) return false;
    const {x,z,pull}=victimPose(enemy.maw,age);
    const size=1-ease((pull-.18)/.82)*.82;
    this.view.actor(enemy.visual,enemy,{
      frame:enemy.spec.frame,face:enemy.face,offsetX:x,offsetZ:z,
      fade:1-ease((pull-.64)/.36),fall:ease(age/.39)*.76,tilt:enemy.face*(.16+pull*.55),
      squash:size,stretch:enemy.visual.effigy?size:1+pull*.1,bob:.19*Math.sin(pull*Math.PI),ink:0xffa8af,
    });
    return true;
  }
}
