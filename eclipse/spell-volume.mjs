import * as T from '../three.min.mjs';

const profiles={
  fire:[0,0xf77a2e,0xffd69c,.66,1.18],
  ice:[1,0x3f8de4,0xd5fbff,.58,1.14],
  wind:[2,0x3bba85,0xdcffe4,.54,1.22],
  lightning:[3,0x5f75ef,0xe7faff,.39,1.31],
  light:[4,0xe9a752,0xffefc7,.63,.92],
  void:[5,0x6c36ad,0xebb2ff,.69,1.08],
  blood:[6,0xb93152,0xff9a98,.59,.91],
  water:[7,0x247eba,0xbbfbfb,.57,1.06],
  gold:[4,0xdf8d32,0xffdf8a,.68,.91],
  stone:[8,0x7a5543,0xf9bd86,.59,.84],
  root:[9,0x547b39,0xc8e6a5,.68,1.13],
  web:[9,0x8473b4,0xf3d8ff,.58,.84],
  poison:[5,0x548f2d,0xb7fa6c,.69,1.19],
  feather:[2,0x9980aa,0xffead5,.51,.70],
};
profiles.earth=profiles.stone;

const directional=new Set(['line','sweep']);
const rings=new Set(['ward','spiral','gate']);
const pale=new T.Color();
const core=new T.Color();

function fragmentGeometry(solid,count) {
  // Faceted fragments catch light from more than one side. Curved flames and arcs
  // use two crossed ribbons so their silhouette holds up even from overhead.
  const plane=()=>new T.PlaneGeometry(1,1,1,7).toNonIndexed();
  const source=solid?new T.IcosahedronGeometry(.5,0):plane();
  const geometry=new T.InstancedBufferGeometry();
  const cross=solid?null:plane().rotateY(Math.PI/2);
  for(const key of ['position','uv','normal']){
    const attribute=source.attributes[key];
    if(!cross){geometry.setAttribute(key,attribute);continue;}
    const joined=new Float32Array(attribute.array.length*2);
    joined.set(attribute.array);
    joined.set(cross.attributes[key].array,attribute.array.length);
    geometry.setAttribute(key,new T.BufferAttribute(joined,attribute.itemSize));
  }
  const seed=new Float32Array(count*3);
  for(let i=0;i<count;i++)seed.set([(i*.6180339)%1,((i+1)*.7548777)%1,((i+1)*.5698403)%1],i*3);
  geometry.setAttribute('seed',new T.InstancedBufferAttribute(seed,3));
  geometry.instanceCount=count;
  return geometry;
}

const fragments={
  solid:[fragmentGeometry(true,10),fragmentGeometry(true,19)],
  soft:[fragmentGeometry(false,12),fragmentGeometry(false,22)],
};
const crest=new T.PlaneGeometry(2,2).rotateX(-Math.PI/2);
export const spellVolumeGeometry=new Set([crest,...fragments.solid,...fragments.soft]);

const fragmentVertex=`
  attribute vec3 seed;
  uniform float life,style,spread,height,form,salt;
  varying vec2 tex;
  varying float energy,shade,speck;
  mat2 spin(float a){return mat2(cos(a),sin(a),-sin(a),cos(a));}
  void main(){
    tex=uv;
    float t=clamp((life-seed.y*.23)/(.52+seed.z*.45),0.,1.);
    float emit=smoothstep(.0,.11,t)*(1.-smoothstep(.49,1.,t));
    float spinAngle=seed.x*6.2831853+salt;
    float r=spread*(.16+.59*seed.y)*(.25+t*.96);
    float rise=height*(.36+.64*seed.z)*sin((t*.76+.12)*3.14159);
    float solid=1.-min(1.,min(abs(style-1.),min(abs(style-6.),abs(style-8.))));
    rise=mix(rise, max(0.,height*(.4+.7*seed.z)*(t*2.8-t*t*2.83)),solid*.8);
    vec3 p=vec3(cos(spinAngle)*r,rise,sin(spinAngle)*r);
    if(form>.5&&form<1.5){
      p.x=spread*(.03+seed.x*.80)*min(1.,.27+t*2.2);
      p.z=(seed.y-.5)*spread*.33*(.36+t*.64);
    }
    if(form>1.5){
      float a=spinAngle+t*.87;
      r=spread*(.58+seed.y*.30+t*.20);
      p=vec3(cos(a)*r,rise*.62,sin(a)*r);
    }
    vec3 piece=position;
    piece.x+=sin((uv.y+seed.x)*7.+t*4.)*uv.y*.20*(1.-solid);
    piece*=vec3(.15,.57,.19)*height*(.53+seed.z*.82)*(.57+emit*.55);
    piece.yz=spin(seed.x*3.+t*2.6)*piece.yz;
    piece.xz=spin(spinAngle+t*(seed.y-.5)*3.)*piece.xz;
    shade=.43+.43*max(0., dot(normalize(normal),normalize(vec3(.47,.8,.45))))+.19*seed.z;
    energy=emit;
    speck=seed.z;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p+piece,1.);
  }
`;
const fragmentInk=`
  uniform vec3 tint,heart;
  uniform float opacity,life,style;
  varying vec2 tex;
  varying float energy,shade,speck;
  void main(){
    vec2 uv=tex;
    float d=abs(uv.x-.5);
    float belly=sin(uv.y*3.141593);
    float detail=sin(uv.y*25.-life*12.+speck*8.);
    float mask=pow(max(0.,belly),.6)*(1.-smoothstep(.19,.5,d));
    float white=exp(-d*13.)*belly;
    if(style<.5){
      d=abs(uv.x-.5-.16*sin(uv.y*7.+life*7.)*uv.y);
      mask=(1.-smoothstep(.12,.46,d/max(.36,1.-uv.y*.72)))*belly;
      white=exp(-d*9.)*pow(1.-uv.y,1.6);
    }else if(style<1.5||abs(style-6.)<.5||abs(style-8.)<.5){
      float edge=pow(abs(sin(uv.x*10.+uv.y*7.)),13.);
      mask=.80;
      white=(edge*.39+shade*.32)*(style<1.5?1.:.59);
    }else if(style<3.5){
      float filament=style<2.5?sin(uv.y*9.+life*7.)*.20
        :(abs(fract(uv.y*5.+speck)*2.-1.)-.53)*.48;
      d=abs(uv.x-.5-filament);
      mask=exp(-d*(style<2.5?12.:15.))*belly;
      white=exp(-d*31.)*(.58+detail*.28);
    }else if(style<4.5){
      mask*=pow(abs(detail),5.);
      white=max(white,pow(belly,12.)*max(0.,1.-d*2.));
    }else if(style<5.5){
      mask*=.42+.58*abs(detail);
      white*=.62;
    }else if(style<7.5){
      float ripple=sin(uv.y*17.-life*9.+uv.x*2.);
      mask*=.71+.29*ripple;
      white=max(white,pow(.5+.5*ripple,7.)*belly);
    }else{
      mask*=max(0.,1.-d*3.5)*(.6+.4*abs(detail));
    }
    vec3 color=mix(tint*shade,heart,clamp(white,0.,.89));
    gl_FragColor=vec4(color,opacity*energy*mask);
    #include <colorspace_fragment>
  }
`;
const crestVertex=`
  varying vec2 coords;
  void main(){coords=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
const crestInk=`
  varying vec2 coords;
  uniform float opacity,life,salt,style,spokes;
  uniform vec3 tint,heart;
  float rim(float r,float center,float width){return exp(-abs(r-center)*width);}
  void main(){
    float r=length(coords),a=atan(coords.y,coords.x);
    float spin=a+life*(style>4.5?-1.:1.);
    float angle=spin*spokes+salt;
    float edge=.80+.019*sin(angle*2.);
    float round=rim(r,edge,98.)+rim(r,.60,84.)*.68+rim(r,.70,39.)*.29;
    float ticks=pow(abs(cos(angle)),17.)*smoothstep(.62,.72,r)*(1.-smoothstep(.79,.85,r));
    float diamond=pow(abs(cos(angle*.5)),18.)*rim(r,.49+.045*cos(angle),36.);
    float joins=pow(abs(sin(angle*.5)),8.)*rim(r,.53,38.);
    float spread=smoothstep(.0,.13,life)+(1.-smoothstep(.0,.18,life))*.19;
    float gloss=.47+.53*pow(.5+.5*cos(a*2.-life*9.),3.);
    vec3 color=mix(tint,heart,clamp(round*.68+ticks*.71,0.,1.));
    float veil=(1.-smoothstep(.62,.93,r))*smoothstep(.07,.54,r)*.095;
    gl_FragColor=vec4(color,(round*.56+ticks*.46+diamond*.43+joins*.22+veil)*opacity*spread*gloss);
    #include <colorspace_fragment>
  }
`;

function lightMaterial(color,highlight,extras,vertexShader,fragmentShader,solid=false){
  return new T.ShaderMaterial({
    uniforms:{life:{value:0},opacity:{value:1},tint:{value:color.clone()},heart:{value:highlight.clone()},...extras},
    vertexShader,fragmentShader,transparent:true,depthWrite:false,
    side:T.DoubleSide,forceSinglePass:true,
    blending:solid?T.NormalBlending:T.AdditiveBlending,
  });
}

export function spellVolume(view,point,spec,layout){
  const {element,tint,radius,angle=0,seed=0,power=1}=spec;
  if(!view.motion.accent())return;
  const [style,surface,highlight,length,height]=profiles[element]??profiles.void;
  const line=directional.has(layout);
  const radial=rings.has(layout);
  const spread=T.MathUtils.clamp(radius,.7,line?7.2:4.7);
  const solid=[1,6,8].includes(style);
  const mobile=view.mobile||view.feedback?.subdued;
  const mesh=fragments[solid?'solid':'soft'][mobile?0:1];
  const lit=pale.setHex(surface).lerp(core.setHex(tint),.60);
  const bright=core.setHex(highlight);
  const material=lightMaterial(lit,bright,{
    style:{value:style},spread:{value:spread},height:{value:height*(.61+Math.min(spread,4)*.22)},
    form:{value:line?1:radial?2:0},salt:{value:(seed%37)*.17},
  },fragmentVertex,fragmentInk,solid);
  const strength=Math.min(1,power)*(view.feedback?.subdued ? .63 : 1);
  const fx=view.addEffect(mesh,{x:point.x,y:Math.max(.10,point.y??.13),z:point.z},tint,length,{
    material,opacity:strength,angle:-angle,fade:true,order:73,
  });
  fx.mesh.name='技能 · 元素碎片';
  fx.mesh.frustumCulled=false;
  fx.combatClock=true;
  if(radial&&power>=.72&&view.motion.accent()){
    const circle=lightMaterial(lit,bright,{style:{value:style},salt:{value:seed*.11},spokes:{value:9+seed%7}},
      crestVertex,crestInk);
    const seal=view.addEffect(crest,{x:point.x,y:.096,z:point.z},tint,length+.13,{
      material:circle,opacity:strength*.93,angle:-angle,scale:spread*.89,growth:spread*.16,fade:true,order:39,
    });
    seal.mesh.name='技能 · 法陣';
    seal.combatClock=true;
  }
}
