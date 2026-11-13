import * as T from '../three.min.mjs';
import {EnemyMarkers} from './tech-support.mjs?v=eye-aura-1';

const eyeRange=6;
const eyeRangeSquared=eyeRange*eyeRange;

export class BlackGoatEye {
  constructor(view) {
    this.view=view;
    this.markers=new EnemyMarkers('eye-marks');
    this.wave=new T.Mesh(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2),new T.ShaderMaterial({
      transparent:true,depthWrite:false,depthTest:false,side:T.DoubleSide,
      uniforms:{time:{value:0}},
      vertexShader:`
        varying vec2 arena;
        void main(){
          arena=uv*2.-1.;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        }
      `,
      fragmentShader:`
        uniform float time;
        varying vec2 arena;
        void main(){
          float r=length(arena);
          float angle=atan(arena.y,arena.x);
          float ripple=(sin(angle*12.+time*24.)+sin(angle*27.-time*17.))*.008;
          float d=mod(r-time*.57+ripple+.19,.38)-.19;
          float outer=1.-smoothstep(.004,.022,abs(d));
          float veins=1.-smoothstep(.002,.009,abs(d+.035+sin(angle*10.+time*13.)*.018));
          float bruise=(1.-smoothstep(.042,.145,abs(d+.045)))*.80;
          float pulse=.76+.24*sin(angle*21.+time*12.);
          float coverage=smoothstep(.035,.16,r)*(1.-smoothstep(.85,1.,r));
          float edge=(1.-smoothstep(.006,.022,abs(r-.974)))*.24;
          float alpha=max(bruise*.62,max(outer*.79,veins*.56*pulse))*coverage+edge;
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
    this.wave.visible=false;
    this.markers.hide();
  }

  contains(hero,foe) {
    const dx=foe.x-hero.x,dz=foe.z-hero.z;
    return dx*dx+dz*dz<=eyeRangeSquared;
  }

  update(game) {
    const {hero,t}=game;
    this.wave.position.set(hero.x,.087,hero.z);
    this.wave.material.uniforms.time.value=t%600;
    this.wave.visible=true;
  }

  render(game) {
    if(game.state!=='play') {
      this.markers.hide();
      return;
    }
    this.markers.render(this.view,game.enemies,foe=>this.contains(game.hero,foe),foe=>foe.spec.height*1.05+.15);
  }
}
