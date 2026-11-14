import * as T from '../three.min.mjs';
import {spellVolume,spellVolumeGeometry} from './spell-volume.mjs?v=golden-veil-1';

const TAU=Math.PI*2;
const elements={
  fire:0,ice:1,wind:2,lightning:3,light:4,void:5,blood:6,water:7,gold:8,
  stone:9,earth:9,root:10,web:11,poison:12,feather:13,
};
const scripts={
  slash:'sweep',wave:'sweep',spikes:'rise',rain:'rise',storm:'spiral',morph:'spiral',buff:'spiral',
  guard:'ward',wall:'ward',ring:'ward',return:'sweep',beam:'line',volley:'line',minion:'gate',drain:'spiral',
  blink:'gate',chain:'line',line:'line',cone:'sweep',circle:'rise',entrance:'gate',phase:'spiral',defeat:'rise',
};

// The same animated surfaces work in the room and in the practice viewer.
// Rails bend along the attack path. Vertical forks all grow from the floor.
function veil(layout) {
  const position=[],uv=[],faces=[];
  const arcs=layout==='line'?3:layout==='rise'?7:layout==='gate'?4:3;
  const length=layout==='line'?24:layout==='rise'?12:38;
  for(let arc=0;arc<arcs;arc++){
    const start=position.length/3;
    for(let column=0;column<=length;column++){
      const u=column/length;
      for(const v of [0,1]){
        let x,y,z;
        if(layout==='line'){
          const w=Math.sin(Math.PI*u);
          x=u*1.10-.08;y=.22+w*(arc-1)*.32+(v-.5)*(.02+w*.20);z=(arc-1)*w*.14+(v-.5)*w*.08;
        }else if(layout==='rise'){
          const angle=arc*2.399+u*.47+(v-.5)*.25*(1-u);
          const r=.25+(arc%3)*.17+u*.32;
          x=Math.cos(angle)*r;y=u*(.26+(arc%4)*.14);z=Math.sin(angle)*r;
        }else{
          const angle=layout==='sweep'?(u-.5)*2.28-.10+arc*.10:
            (u*(layout==='spiral'?.86:1)+arc/arcs)*TAU;
          const radius=layout==='spiral'?.38+u*.47+arc*.074:layout==='sweep'?.52+arc*.15:.63+arc*.10;
          const w=Math.sin(Math.PI*u);
          const shell=radius+(v-.5)*(layout==='gate'?.040:.055+w*.17);
          x=Math.cos(angle)*shell;z=Math.sin(angle)*shell;
          y=layout==='ward'?.035+arc*.09+v*.11:
            layout==='gate'?.012+(v*.51+.09)*w*(.65+arc*.17):
            layout==='sweep'?.16+u*.25+arc*.061+(v-.5)*w*.29:
            .05+u*.25+arc*.12+(v-.5)*w*.26;
        }
        position.push(x,y,z);
        uv.push(u,v);
        if(v===1&&column<length){
          const a=start+column*2;
          faces.push(a,a+1,a+2,a+1,a+3,a+2);
        }
      }
    }
  }
  return new T.BufferGeometry().setIndex(faces)
    .setAttribute('position',new T.Float32BufferAttribute(position,3))
    .setAttribute('uv',new T.Float32BufferAttribute(uv,2));
}

const surfaces=Object.fromEntries([...new Set(Object.values(scripts))].map(layout=>[layout,veil(layout)]));
export const spellGeometry=new Set([...Object.values(surfaces),...spellVolumeGeometry]);

const vertex=`
  varying vec2 coords; uniform float life, flavor;
  void main(){
    coords=uv;
    vec3 p=position;
    float bend=sin(uv.x*3.14159)*sin(uv.x*17.+life*9.);
    p.y+=bend*(.018+.021*step(2.5,flavor));
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  }
`;
const fragment=`
  varying vec2 coords; uniform vec3 tint, heart; uniform float life, opacity, flavor, salt;
  float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    float u=coords.x,v=coords.y;
    float t=life*8.+salt;
    float pulse=sin(u*22.-t), lace=sin(v*31.+u*19.+t*.43);
    float sides=sin(v*3.14159);
    float gate=smoothstep(.0,.12,u)*(1.-smoothstep(.83,1.,u));
    float reveal=smoothstep(u-.25,u+.02,life*3.8+.22);
    float thread=.48, drift=.5+.5*pulse, cloud=sides;
    if(flavor<.5){
      thread=.48+sin(u*44.-t*1.2)*.12+sin(u*81.-t*.72)*.10;
      cloud=pow(sides,1.6)*(.48+.52*abs(lace));
    }else if(flavor<1.5){
      drift=step(.54,fract(u*13.+v*.80))*step(.23,fract(u*19.-v*.40));
      thread=.54+(fract(u*16.)-.5)*.39;cloud*=.65+.35*drift;
    }else if(flavor<2.5){
      thread=.48+.17*sin(u*12.-t*.61);cloud=pow(sides,2.3);
    }else if(flavor<3.5){
      thread=.52+(abs(fract(u*17.-t*.27)-.5)-.25)*1.36;cloud*=.45+.55*abs(pulse);
    }else if(flavor<4.5){
      thread=.50+.19*pulse;drift=pow(.5+.5*lace,14.);
    }else if(flavor<5.5){
      thread=.68+.18*sin(u*29.+t);cloud=pow(sides,.80)*(.45+.55*abs(lace));
    }else if(flavor<6.5){
      thread=.31+pow(.5+.5*sin(u*21.+t*.45),3.)*.30;
      drift=step(.70,noise(floor(vec2(u*30.,v*12.))));cloud*=.68+.32*drift;
    }else if(flavor<7.5){
      thread=.51+.20*sin(u*29.-t*.86);drift=pow(.5+.5*lace,3.);cloud=pow(sides,1.8);
    }else if(flavor<8.5){
      drift=step(.61,fract(u*12.))*step(.22,fract(v*3.));thread=.55+.10*pulse;
    }else if(flavor<9.5){
      thread=.49+floor(noise(vec2(floor(u*18.),1.))*5.)*.07-.13;drift=step(.67,noise(floor(vec2(u*32.,v*10.))));
    }else if(flavor<10.5){
      thread=.41+.22*sin(u*29.+v*2.-t*.72);cloud*=.45+.55*abs(lace);
    }else if(flavor<11.5){
      thread=.5+.14*pulse;
      drift=pow(abs(sin(u*43.+v*9.)*sin(u*49.-v*11.)),.36);cloud*=1.-drift*.58;
    }else if(flavor<12.5){
      thread=.45+.26*sin(u*27.+t*.42)*sin(u*19.2-t*.38);cloud=pow(sides,.86)*(.38+.62*abs(lace));
    }else{
      thread=.52+.17*pulse;drift=pow(.5+.5*sin(u*52.+v*15.-t),4.);cloud=pow(sides,1.6);
    }
    float shine=exp(-abs(v-thread)*(flavor==3.?23.:13.));
    float echo=exp(-abs(v-(1.-thread))*17.)*.35;
    float glow=cloud*(.38+drift*.37)+shine*.58+echo;
    vec3 color=mix(tint*(.65+drift*.40),heart,clamp(shine*.76+echo*.27,0.,1.));
    gl_FragColor=vec4(color,glow*gate*reveal*opacity*.87);
    #include <colorspace_fragment>
  }
`;

export function ornamentSpell(view,point,spec) {
  const {action,element,tint,radius,angle=0,seed=0,power=1}=spec;
  const layout=scripts[action]??'spiral';
  if(!view.motion.accent())return;
  const color=new T.Color(tint);
  const fade=layout==='gate'?.66:layout==='ward'?.68:layout==='spiral'?.53:layout==='line'?.29:.42;
  const extended=layout==='line'||layout==='sweep';
  const span=T.MathUtils.clamp(radius,.45,extended?9:4.7);
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,blending:T.AdditiveBlending,
    uniforms:{
      tint:{value:color},heart:{value:color.clone().lerp(new T.Color(0xfff1d7),.59)},
      life:{value:0},opacity:{value:power},flavor:{value:elements[element]??5},salt:{value:(seed%91)*.23},
    },
    vertexShader:vertex,fragmentShader:fragment,
  });
  const fx=view.addEffect(surfaces[layout],{x:point.x,y:point.y??.075,z:point.z},tint,fade,{
    material,fade:true,opacity:power,scale:span*(layout==='ward'?.94:.80),growth:span*(extended?.11:.26),
    angle:extended?-angle:(seed%23)*.273,order:71,
  });
  fx.stretchY=extended?Math.min(1,1.9/span):Math.min(1,2.1/span);
  if(layout==='line')fx.stretchZ=Math.min(1,1.8/span);
  if(layout==='spiral'||layout==='gate')fx.spin=(seed%2?1:-1)*1.17;
  if(power>=.55)spellVolume(view,point,spec,layout);
  return fx;
}
