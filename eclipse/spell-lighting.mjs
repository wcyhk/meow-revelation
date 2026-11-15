import * as T from '../three.min.mjs';

const clamp=T.MathUtils.clamp;
// Emission hue, peak intensity, decay time, emitter height, halo strength.
const emission={
  fire:[0xff7540,32,.55,.80,.40],
  ice:[0x75cffe,22,.50,.57,.30],
  lightning:[0xc2cdff,38,.34,1.02,.44],
  light:[0xffcc74,29,.51,.80,.34],
  gold:[0xffcc74,29,.51,.80,.34],
  void:[0xa361ff,25,.62,.80,.33],
  blood:[0xdc3353,19,.55,.48,.27],
  water:[0x63f2de,22,.53,.58,.30],
  root:[0x98b36b,15,.53,.43,.19],
  wind:[0x9bdcc8,15,.31,.75,.22],
  stone:[0xf2a873,15,.32,.46,.18],
  poison:[0xb9db62,19,.56,.49,.23],
};
const neutral=[0xd7e2ff,18,.43,.73,.26];
const major=new Set(['phase','entrance','defeat']);

// Keep the number of lights fixed so WebGL can reuse the same material programs.
export class SpellLighting {
  constructor(view){
    this.view=view;
    this.slots=Array.from({length:view.mobile?2:3},()=>{
      const light=new T.PointLight(0xffffff,0,1,2);
      light.name='技能光源';
      const halo=new T.Sprite(new T.SpriteMaterial({map:view.halo,depthWrite:false,transparent:true,
        blending:T.AdditiveBlending,toneMapped:false}));
      halo.name='技能光暈';
      halo.renderOrder=19;
      halo.visible=false;
      view.scene.add(light,halo);
      return {light,halo,age:0,duration:0,rank:0};
    });
  }

  emit(point,{action,element,tint,radius=1.5,power=1}){
    if(power<.48)return;
    const important=major.has(action);
    const rank=important?3:action==='impact'?1:2;
    const [hue,intensity,decay,height,glow]=emission[element]??neutral;
    const {x,z}=point;
    const size=clamp(radius,1,5.4);
    // Continuous and overlapping spells can share one pool slot.
    const near=this.slots.find(slot=>slot.duration&&slot.element===element&&slot.rank===rank&&slot.age<.11&&
      (slot.light.position.x-x)**2+(slot.light.position.z-z)**2<.95**2);
    let slot=near??this.slots.find(slot=>!slot.duration);
    if(!slot){
      slot=this.slots.reduce((weakest,other)=>{
        const score=pulse=>pulse.rank*(1-pulse.age/pulse.duration);
        return score(other)<score(weakest)?other:weakest;
      });
      if(rank<slot.rank&&slot.age<slot.duration*.62)return;
    }
    if(near)return;
    const {light,halo}=slot;
    const weight=clamp(power,.48,1.22)*(important?1.18:1);
    const range=3.0+size*.86;
    const lift=clamp(point.y??height,height,height+.6)+(important?.40:0);
    light.position.set(x,lift,z);
    light.distance=range;
    light.color.setHex(tint??hue).lerp(halo.material.color.setHex(hue),.36);
    halo.material.color.copy(light.color);
    halo.position.set(x,lift*.88,z);
    halo.scale.setScalar(1.6+size*.68);
    Object.assign(slot,{age:0,duration:decay*(important?1.38:1),rank,element,
      peak:intensity*weight,glow:glow*weight});
    this.animate(slot);
  }

  animate(slot){
    const {light,halo,age,duration}=slot;
    const remaining=1-age/duration;
    const attack=T.MathUtils.smoothstep(age,0,slot.element==='lightning'?.018:.058);
    const pulse=(.22+.78*attack)*remaining**1.65;
    const subdued=this.view.feedback.subdued;
    light.intensity=pulse*slot.peak*(subdued?.34:1);
    halo.visible=!subdued;
    halo.material.opacity=pulse*slot.glow;
  }

  tick(dt){
    for(const slot of this.slots){
      if(!slot.duration)continue;
      slot.age+=dt;
      if(slot.age>=slot.duration)this.release(slot);
      else this.animate(slot);
    }
  }

  // Painted actor sprites bypass scene lights. Sample the same lamps for their fill.
  fill(x,y,z,out){
    out.setRGB(0,0,0);
    for(const {light} of this.slots){
      if(!light.intensity)continue;
      const p=light.position;
      const distanceSquared=(p.x-x)**2+(p.y-y)**2+(p.z-z)**2;
      const fade=Math.max(0,1-distanceSquared/light.distance**2);
      const energy=light.intensity*fade**2/(4+distanceSquared)*.115;
      out.r+=light.color.r*energy;
      out.g+=light.color.g*energy;
      out.b+=light.color.b*energy;
    }
  }

  release(slot){
    slot.duration=slot.light.intensity=0;
    slot.halo.visible=false;
  }

  reset(){
    for(const slot of this.slots)this.release(slot);
  }
}
