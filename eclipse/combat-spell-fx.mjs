import {loaders} from './vendor/00gamedevs/loaders.mjs';

// Existing gameplay events remain authoritative. These entries replace visuals
// of matching fields, shields and confirmed impacts only.
export const fieldEffects={
  'blue-corporal':'frost-field',xuanming:'frost-field',
  'venom-cane':'venom-pool','skanda-kukri':'venom-pool','dragon-kukri':'fire-vortex',
};
export const guardEffects={'sky-dragon-staff':'prism-guard','nether-box':'magic-barrier'};
const weaponEffects={...fieldEffects,...guardEffects,'red-bow':'fire-explosion',flameblade:'lightning-fire-tornado'};

export class CombatSpellFx {
  constructor(scene,mobile) {
    this.scene=scene;
    this.mobile=mobile;
    this.active=[];
    this.modules=new Map();
    this.requests=new Map();
  }

  prepare(weaponId) {
    const id=weaponEffects[weaponId];
    if(!id||this.requests.has(id))return;
    const request=loaders[id]().then(module=>this.modules.set(id,module.default))
      .catch(()=>this.requests.delete(id));
    this.requests.set(id,request);
  }

  play(id,point,radius,duration,tint,follow,subdued=false) {
    if(!id||subdued||this.active.length>=(this.mobile?3:6))return false;
    const create=this.modules.get(id);
    if(!create)return false;
    const color=tint===undefined?undefined:`#${tint.toString(16).padStart(6,'0')}`;
    const size=Math.max(.25,Math.min(2,radius/2.25));
    let effect;
    try{
      effect=create({color,size,speed:id==='lightning-fire-tornado'?2:1,density:this.mobile?.25:.5});
      if(effect.render){effect.dispose();return false;}
      effect.group.position.set(point.x,.045,point.z);
      this.scene.add(effect.group);
      this.active.push({effect,follow,remaining:duration});
      return true;
    }catch{
      effect?.dispose();
      this.modules.delete(id);
      return false;
    }
  }

  update(dt) {
    if(dt<=0)return;
    for(let index=this.active.length-1;index>=0;index--){
      const entry=this.active[index];
      const {effect,follow}=entry;
      entry.remaining-=dt;
      if(entry.remaining<=0||effect.finished){
        effect.dispose();
        effect.group.removeFromParent();
        this.active.splice(index,1);
        continue;
      }
      if(follow){effect.group.position.x=follow.x;effect.group.position.z=follow.z;}
      effect.update(dt);
    }
  }

  clear() {
    for(const {effect} of this.active){effect.dispose();effect.group.removeFromParent();}
    this.active.length=0;
  }
}
