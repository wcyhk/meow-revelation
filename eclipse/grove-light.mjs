import * as T from '../three.min.mjs';

export const paintedRooms={
  'grove.jpg':'art/moon-courtyard.webp',
  'fen.jpg':'art/drowned-cloister.webp',
  'frost.jpg':'art/winter-abbey.webp',
  'forge.jpg':'art/basalt-forge.webp',
  'throne.jpg':'art/red-throne.webp',
  'crimson-throne.jpg':'art/red-throne.webp',
};

const archLights={
  'grove.jpg':[[.20,.28],[.37,.24],[.64,.23],[.80,.28]],
  'fen.jpg':[[.265,.105],[.46,.089],[.72,.095]],
  'frost.jpg':[[.19,.18],[.42,.16],[.60,.18],[.92,.22]],
  'forge.jpg':[[.105,.16],[.53,.15],[.75,.16],[.94,.19]],
  'throne.jpg':[[.16,.28],[.36,.23],[.65,.23],[.85,.28]],
  'crimson-throne.jpg':[[.16,.28],[.36,.23],[.65,.23],[.85,.28]],
};

export function roomLights(picture,fallback) {
  return archLights[picture]??fallback;
}

export class GroveLight {
  constructor(scene) {
    const geometry=new T.PlaneGeometry(59,59).rotateX(-Math.PI/2);
    this.material=new T.ShaderMaterial({
      transparent:true,depthWrite:false,depthTest:false,
      uniforms:{
        bearer:{value:new T.Vector2()},time:{value:0},glow:{value:new T.Color()},
        zone:{value:new T.Color()},radius:{value:8},on:{value:0},
      },
      vertexShader:`
        varying vec2 ground;
        void main(){
          ground=position.xz;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        }
      `,
      fragmentShader:`
        varying vec2 ground;
        uniform vec2 bearer;
        uniform vec3 glow,zone;
        uniform float time,radius,on;
        void main(){
          vec2 p=ground-bearer;
          float d=length(p);
          float angle=atan(p.y,p.x);
          float falloff=1.-smoothstep(0.,radius,d);
          float grain=sin(dot(ground,vec2(4.5,7.6)))*sin(dot(ground,vec2(-6.1,9.)));
          float glints=pow(max(0.,grain),5.)*(.73+.27*sin(angle*7.+time*2.+d));
          float sweep=sin(angle*11.+time*.8)*.5+.5;
          float haze=falloff*(.65+.35*sweep)*.084;
          float bloom=exp(-d*d*.49)*.14;
          vec3 tone=mix(glow,zone,.17+.18*sweep);
          gl_FragColor=vec4(mix(tone,vec3(1.,.88,.67),glints*.33),on*(haze+bloom+glints*falloff*.10));
          #include <colorspace_fragment>
        }
      `,
      blending:T.AdditiveBlending,
    });
    const mesh=new T.Mesh(geometry,this.material);
    mesh.position.y=.012;
    mesh.renderOrder=-47;
    scene.add(mesh);
  }

  update(hero,lantern,accent,time) {
    const {uniforms}=this.material;
    uniforms.bearer.value.set(hero.x,hero.z);
    uniforms.glow.value.copy(lantern.light.color);
    uniforms.zone.value.setHex(accent);
    uniforms.time.value=time%360;
    uniforms.radius.value=lantern.light.distance*.8;
    uniforms.on.value=hero.lanternOut>0?0:1;
  }
}
