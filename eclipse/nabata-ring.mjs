import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2;
const designs={
  fire:{color:0xf06414,hot:0xffdb87,radial:[.74,.74],veins:4,flow:2.5,tear:.15,spikes:5},
  water:{color:0x186ee7,hot:0x9eeeef,radial:[.62,.82],veins:5,flow:-1.65,tear:.07,spikes:7},
  thunder:{color:0xe8bd24,hot:0xfff7b5,radial:[.76,.70],veins:3,flow:3.2,tear:.20,spikes:6},
  wind:{color:0x5ac050,hot:0xd8ffa9,radial:[.82,.69],veins:5,flow:-2.2,tear:.10,spikes:8},
};

function arcRibbons(mobile,design){
  const steps=mobile?60:88;
  const mesh=new T.BufferGeometry(),vertices=[],index=[],arcs=[];
  for(let strip=0;strip<design.veins;strip++)for(let i=0;i<=steps;i++){
    const t=i/steps;
    for(const edge of [-1,1]){
      vertices.push(Math.sin(t*TAU)*design.radial[0],Math.cos(t*TAU)*design.radial[1],0);
      arcs.push(t,edge,strip/(design.veins-1));
    }
    if(i<steps){
      const a=(strip*(steps+1)+i)*2;
      index.push(a,a+1,a+2,a+1,a+3,a+2);
    }
  }
  mesh.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  mesh.setAttribute('arc',new T.Float32BufferAttribute(arcs,3));
  mesh.setIndex(index);
  return mesh;
}

function flameRibbon(design){
  return new T.ShaderMaterial({
    uniforms:{
      clock:{value:0},energy:{value:0},stage:{value:0},
      color:{value:new T.Color(design.color)},hot:{value:new T.Color(design.hot)},
      spin:{value:design.flow},tear:{value:design.tear},
    },
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false,
    vertexShader:`
      attribute vec3 arc;
      uniform float clock,energy,stage,spin,tear;
      varying vec3 trail;
      void main(){
        float a=arc.x*6.283185;
        float thread=arc.z;
        float run=clock*spin+a*3.3;
        float flicker=sin(run+thread*6.7);
        float noise=sin(a*21.-run*1.3+thread*26.)*sin(a*32.+clock*spin*.63);
        float drift=sin(a*5.+run*.017+thread*4.)*.075;
        vec2 ray=normalize(position.xy);
        float film=1.-step(.02,thread);
        float spread=mix(.048,.153,film)+.023*energy;
        vec2 xy=position.xy+ray*((thread-.45)*.16+drift+tear*noise*.42+arc.y*spread);
        xy.x*=1.+stage*.08+energy*.10;
        xy.y=xy.y*(1.+stage*.11+energy*.10)+.18;
        float depth=(thread-.5)*.34+flicker*.078+noise*.072;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(xy,depth,1.);
        trail=vec3(arc.y,a*4.+run*1.47+thread*6.,noise+film*4.);
      }
    `,
    fragmentShader:`
      uniform vec3 color,hot;
      uniform float energy;
      varying vec3 trail;
      void main(){
        float film=step(2.,trail.z);
        float noise=trail.z-film*4.;
        float blade=max(0.,1.-abs(trail.x));
        float filament=blade*blade*blade;
        float rhythm=sin(trail.y)*.38+.62;
        float breaking=smoothstep(-.33,.48,noise+energy*.18);
        float a=mix(blade*(.36+energy*.14)*(rhythm+breaking*.54),
          pow(blade,1.8)*(.25+breaking*.20+energy*.19),film);
        gl_FragColor=vec4(mix(color,hot,filament*(.21+rhythm*.44)*(1.-film*.77)),a);
      }
    `,
  });
}

function castKeepers(k,crest,design,element,mobile){
  const hinges=[];
  const flare=element==='fire'||element==='wind';
  for(let i=0;i<design.spikes;i++){
    const angle=(i+.22)*TAU/design.spikes;
    const x=Math.sin(angle),y=Math.cos(angle);
    const keeper=k.bone(crest,x*design.radial[0]*.76,y*design.radial[1]*.76+.23,-.125);
    keeper.rotation.z=-angle;
    keeper.name='納巴塔 · 法環扣 '+(i+1);
    const offset=(flare?1.0:-.29)*(.06+i%3*.034);
    const length=.131+(i%2)*.035+(flare?.051:0);
    k.geometry(keeper,i%2?'body':'trim',sculptVolume([
      [0,-.088,-.011,.049,.057],[.011,-.011,-.039,.075,.065],[.04,.066,.006,.068,.045],
      [offset,length,.036,.043,.033],[offset*1.78,length+.062,-.025,.006,.005],
    ],{rings:mobile?9:14,sides:mobile?8:10,section:2.27,ridge:.23,seed:i*1.72}));
    k.sculpt.sweep(keeper,i%3?'edge':'glow',[[.018,-.062,.042,.010],[.026,.028,.042,.015],
      [offset*.91,length*.72,.075,.013],[offset*1.30,length,.062,.004]],{steps:8,sides:5,ridge:.20});
    hinges.push({joint:keeper,angle,offset});
  }
  return hinges;
}

export function craftNabataRing(k,crest,element,mobile){
  const design=designs[element];
  const geometry=arcRibbons(mobile,design),material=flameRibbon(design);
  const mesh=new T.Mesh(geometry,material);
  mesh.name='納巴塔 · 元素法環';
  mesh.frustumCulled=false;
  crest.add(mesh);
  const hinges=castKeepers(k,crest,design,element,mobile);
  return {
    update({headtime,wind,strike,stage}){
      material.uniforms.clock.value=headtime;
      material.uniforms.stage.value=stage;
      material.uniforms.energy.value=Math.max(wind*.72,strike);
      for(const {joint,angle,offset} of hinges){
        const move=Math.sin(headtime*design.flow*.70+angle*2.0);
        joint.rotation.z=-angle+move*.075+strike*offset;
        joint.rotation.x=move*.089+wind*.18-strike*.30;
      }
    },
    dispose(){material.dispose();},
  };
}
