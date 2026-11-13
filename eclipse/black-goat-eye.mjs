import * as T from '../three.min.mjs';
import {EnemyMarkers} from './tech-support.mjs?v=squad-2';

const eyeRange=6;
const sweepTime=.79;
const markDuration=3;

export class BlackGoatEye {
  constructor(view) {
    this.view=view;
    this.markers=new EnemyMarkers('eye-marks');
    this.wave=new T.Mesh(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2),new T.ShaderMaterial({
      transparent:true,depthWrite:false,depthTest:false,side:T.DoubleSide,
      uniforms:{progress:{value:0},time:{value:0}},
      vertexShader:`
        varying vec2 arena;
        void main(){
          arena=uv*2.-1.;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        }
      `,
      fragmentShader:`
        uniform float progress,time;
        varying vec2 arena;
        void main(){
          float r=length(arena);
          float angle=atan(arena.y,arena.x);
          float ripple=(sin(angle*12.+time*24.)+sin(angle*27.-time*17.))*.008;
          float d=r-progress+ripple;
          float outer=1.-smoothstep(.004,.022,abs(d));
          float veins=1.-smoothstep(.002,.009,abs(d+.035+sin(angle*10.+time*13.)*.018));
          float bruise=(1.-smoothstep(.042,.145,abs(d+.045)))*.80;
          float pulse=.76+.24*sin(angle*21.+time*12.);
          float alpha=max(bruise,max(outer*.91,veins*.62*pulse))*(1.-smoothstep(.95,1.02,r))*(1.-progress*.28);
          vec3 hue=mix(vec3(.085,.012,.13),vec3(.61,.25,.88),max(outer,veins*.72));
          gl_FragColor=vec4(hue,alpha);
        }
      `,
    }));
    this.wave.scale.set(eyeRange,1,eyeRange);
    this.wave.renderOrder=28;
    this.wave.frustumCulled=false;
    view.scene.add(this.wave);
    this.reset();
  }

  reset() {
    this.started=null;
    this.ready=0;
    this.swept=new Set();
    this.wave.visible=false;
    this.markers.hide();
  }

  update(game) {
    const {hero,t}=game;
    if(game.discovery) return;
    if(this.started===null) {
      if(t<this.ready||!game.enemies.some(foe=>foe.hp>0&&foe.age>=.23&&Math.hypot(foe.x-hero.x,foe.z-hero.z)<=eyeRange)) return;
      this.started=t;
      this.ready=t+5;
      this.swept.clear();
      game.audio.play('goat-eye');
      this.view.spark(hero.x,.42,hero.z,0xb46ce9,8,.85,'void');
    }
    const progress=Math.min(1,(t-this.started)/sweepTime);
    this.wave.position.set(hero.x,.087,hero.z);
    this.wave.material.uniforms.progress.value=progress;
    this.wave.material.uniforms.time.value=t;
    this.wave.visible=true;
    for(const foe of game.enemies) {
      if(foe.hp<=0||foe.age<.23||this.swept.has(foe)
        ||Math.hypot(foe.x-hero.x,foe.z-hero.z)>eyeRange*progress) continue;
      this.swept.add(foe);
      foe.goatEyeUntil=t+markDuration;
      this.view.spark(foe.x,foe.spec.height*.92,foe.z,0xd886ff,5,.45,'void');
    }
    if(progress===1) {
      this.started=null;
      this.wave.visible=false;
    }
  }

  render(game) {
    if(game.state!=='play') {
      this.markers.hide();
      return;
    }
    this.markers.render(this.view,game.enemies,foe=>foe.goatEyeUntil>game.t,foe=>foe.spec.height*1.05+.15);
  }
}
