import * as T from '../three.min.mjs';

const impactProfiles={
  light:{flash:.64,shake:.044,kick:.16,rumble:0},
  heavy:{flash:.97,shake:.153,kick:.235,rumble:.44},
  block:{flash:.35,shake:.055,kick:.16,rumble:0},
  break:{flash:1,shake:.226,kick:.28,rumble:.75},
  fall:{flash:.85,shake:.127,kick:.24,rumble:.35},
};
const washes={
  fire:['#ff9d48','#ffd4a1',.67],
  water:['#49b3ee','#b5f3fb',.76],
  ice:['#78b9f6','#f2f8ff',.58],
  lightning:['#897dff','#d6d0ff',.54],
  blood:['#c73a50','#ff9d89',.60],
  void:['#9650da','#e3b4ff',.72],
  light:['#f4b94a','#fff1bd',.53],
};
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const flashTime=.20;
const steps=6;
const kickSamples=[1,-.56,.47,-.31,.18,-.08,0];
const sideSamples=[-.37,.61,-.52,.29,-.31,.14,0];

export function addHitSurface(material,uniform){
  if(!material||material.isShaderMaterial)return;
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>key+'|hit-surface';
  material.onBeforeCompile=shader=>{
    compile.call(material,shader);
    shader.uniforms.contactFlash=uniform;
    shader.fragmentShader='uniform float contactFlash;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>',`
      outgoingLight=mix(outgoingLight* (1.0+contactFlash*.42),
        vec3(3.0,2.96,2.86),contactFlash*.91);
      gl_FragColor.rgb=outgoingLight;
      #include <tonemapping_fragment>
    `);
  };
  material.needsUpdate=true;
}

export class CombatFeedback {
  constructor(view,overlay=null){
    this.view=view;
    this.overlay=overlay;
    this.flares=new Map();
    this.offset=new T.Vector2();
    this.kickAge=0;
    this.strength=0;
    this.duration=0;
    this.washAge=1;
    this.washDuration=0;
    this.nextRumble=0;
    this.nextWash=0;
    this.clock=0;
    this.reduced=()=>motionPreference.matches;
    if(overlay){
      try{
        const override=localStorage.getItem('meow-eclipse-reduced-effects');
        if(override!==null)this.override=override==='true';
      }catch{}
    }
  }

  get subdued(){return this.override??this.reduced();}

  setSubdued(on){
    this.override=on;
    try{localStorage.setItem('meow-eclipse-reduced-effects',String(on));}catch{}
    if(on)this.clear();
  }

  clear(){
    for(const flash of this.flares.keys())flash.value=0;
    this.flares.clear();
    this.strength=0;
    this.offset.set(0,0);
    this.washDuration=0;
    this.nextWash=this.clock;
    if(this.overlay)this.overlay.style.opacity=0;
  }

  forget(visual){
    this.flares.delete(visual.hitFlash);
  }

  impact(visual,kind,angle,shake=true){
    const hit=impactProfiles[kind];
    if(!hit||this.subdued)return;
    if(visual?.hitFlash){
      const uniform=visual.hitFlash;
      if(uniform.value<=hit.flash){
        uniform.value=hit.flash;
        this.flares.set(uniform,{born:this.clock,peak:hit.flash});
      }
    }
    if(!shake||!this.overlay)return;
    this.kick(hit.shake,hit.kick,angle);
    if(hit.rumble)this.haptic(hit.rumble);
  }

  kick(strength,length,angle=0){
    if(this.subdued||!this.overlay)return;
    const residual=this.strength*(1-Math.min(1,this.kickAge/(this.duration||1)));
    if(strength<residual*.75)return;
    this.strength=strength;
    this.duration=length;
    this.kickAge=0;
    this.angle=angle;
    this.sign=Math.random()<.5?-1:1;
  }

  haptic(strength){
    if(this.clock<this.nextRumble||document.visibilityState!=='visible')return;
    this.nextRumble=this.clock+.16;
    const duration=Math.round(21+strength*44);
    let controller=false;
    for(const pad of navigator.getGamepads?.()??[]){
      if(!pad?.vibrationActuator?.effects?.includes('dual-rumble'))continue;
      controller=true;
      pad.vibrationActuator.playEffect('dual-rumble',{startDelay:0,duration,
        strongMagnitude:strength,weakMagnitude:strength*.45}).catch(()=>{});
    }
    if(!controller&&this.view.mobile&&navigator.userActivation?.hasBeenActive)navigator.vibrate?.(duration);
  }

  surge(element,point,power=1){
    const wash=washes[element];
    if(!this.overlay||!wash||this.subdued||this.clock<this.nextWash)return;
    this.nextWash=this.clock+.47;
    const [tone,shine,duration]=wash;
    this.washAge=0;
    this.washDuration=duration;
    this.washPower=Math.min(1,power)*(this.view.mobile?.83:1);
    const screen=this.view.project(point.x,.26,point.z);
    const anchor=T.MathUtils.clamp(screen.x/Math.max(1,this.view.width),.16,.84);
    const style=this.overlay.style;
    style.setProperty('--surge-color',tone);
    style.setProperty('--surge-fringe',shine);
    style.setProperty('--surge-origin',anchor*100+'%');
    this.overlay.dataset.element=element;
    this.view.surgeParticles(point,element);
    this.kick(.11+.08*power,.245,Math.PI*.55);
  }

  update(dt){
    this.clock+=dt;
    if(this.subdued){
      if(this.flares.size||this.strength||this.washDuration)this.clear();
      return;
    }
    for(const [uniform,{born,peak}] of this.flares){
      const life=(this.clock-born)/flashTime;
      uniform.value=peak*Math.max(0,1-life)**1.7;
      if(life>=1)this.flares.delete(uniform);
    }
    this.offset.set(0,0);
    if(this.strength){
      const frame=this.kickAge/this.duration*steps;
      if(frame<steps){
        const sample=Math.floor(frame),mix=frame-sample;
        const forward=T.MathUtils.lerp(kickSamples[sample],kickSamples[sample+1],mix);
        const lateral=T.MathUtils.lerp(sideSamples[sample],sideSamples[sample+1],mix)*this.sign;
        const ground=Math.sin(this.angle)*.72,horizontal=Math.cos(this.angle);
        const strength=this.strength*(this.view.mobile?.65:1);
        this.offset.set((forward*horizontal-lateral*ground)*strength,
          (forward*ground+lateral*horizontal)*strength);
        this.kickAge+=dt;
      }else this.strength=0;
    }
    if(this.washDuration){
      const t=Math.min(1,this.washAge/this.washDuration);
      const rise=1-(1-t)**2.35;
      const sweep=(1-t)**1.65 * T.MathUtils.smoothstep(t,0,.15);
      const pulse=Math.max(0,1-this.washAge/.115)*.12;
      const style=this.overlay.style;
      style.setProperty('--surge-rise',rise*70+'%');
      style.setProperty('--surge-pulse',String(pulse*this.washPower));
      style.opacity=String((sweep*.49+pulse)*this.washPower);
      this.washAge+=dt;
      if(t===1)this.washDuration=0;
    }
  }
}
