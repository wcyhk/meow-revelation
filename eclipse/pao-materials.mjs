import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=practice-1';

let maps;
const bands=[
  {azimuth:1.7,height:.67,spread:15,tint:[1.36,1.78,2.48]},
  {azimuth:4.12,height:.42,spread:26,tint:[1.65,.99,.52]},
  {azimuth:5.44,height:.26,spread:14,tint:[.25,1.18,1.34]},
];

function textures(){
  if(maps)return maps;
  const width=128,height=64;
  const reflections=new Uint16Array(width*height*4);
  const grain=new Uint8Array(height*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const azimuth=(x+.5)/width*Math.PI*2,elevation=(1-(y+.5)/height)*Math.PI;
    const sky=Math.sin(elevation/2)**4;
    const rgb=[.029+sky*.12,.035+sky*.15,.052+sky*.22];
    for(const {azimuth:center,height:up,spread,tint} of bands){
      const intensity=Math.exp((Math.cos(azimuth-center)-1)*spread-((elevation/Math.PI-up)*8)**2);
      for(let channel=0;channel<3;channel++)rgb[channel]+=tint[channel]*intensity;
    }
    const index=(y*width+x)*4;
    for(let channel=0;channel<3;channel++)reflections[index+channel]=T.DataUtils.toHalfFloat(rgb[channel]);
    reflections[index+3]=T.DataUtils.toHalfFloat(1);
  }
  for(let y=0;y<height;y++)for(let x=0;x<height;x++){
    const scored=Math.sin(y*1.7+x*.06)*8+Math.cos(x*.31+y*.24)*9;
    const value=118+scored+((x*29+y*41+x*y*13)%43);
    const index=(y*height+x)*4;
    grain.fill(value,index,index+3);
    grain[index+3]=255;
  }
  const env=new T.DataTexture(reflections,width,height,T.RGBAFormat,T.HalfFloatType);
  env.mapping=T.EquirectangularReflectionMapping;
  env.flipY=true;
  env.colorSpace=T.LinearSRGBColorSpace;
  env.needsUpdate=true;
  const bump=new T.DataTexture(grain,height,height);
  bump.wrapS=bump.wrapT=T.RepeatWrapping;
  bump.minFilter=bump.magFilter=T.LinearFilter;
  bump.needsUpdate=true;
  maps={env,bump};
  return maps;
}

export function paoMaterials(awakened,palette){
  const {env,bump}=textures();
  const metal=(color,metalness,roughness,coat,finish)=>paintedFinish(new T.MeshPhysicalMaterial({
    color,metalness,roughness,clearcoat:coat,clearcoatRoughness:.29,
    envMap:env,envMapIntensity:1.17,bumpMap:bump,bumpScale:.034,emissive:color,emissiveIntensity:.072,
  }),finish);
  const textile=(color,roughness,finish)=>paintedFinish(new T.MeshStandardMaterial({
    color,roughness,bumpMap:bump,bumpScale:.056,emissive:color,emissiveIntensity:.12,
  }),finish);
  const webbing=new T.MeshStandardMaterial({
    vertexColors:true,side:T.DoubleSide,metalness:.09,roughness:.76,bumpMap:bump,bumpScale:.073,
    emissive:0x9a594b,emissiveIntensity:.061,
  });
  webbing.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 weave=vBumpMapUv;
      float tear=sin(weave.x*86.0+weave.y*28.0+sin(weave.y*62.0));
      float grain=sin(weave.y*209.0+weave.x*36.0)*cos(weave.x*97.0-weave.y*60.0);
      float capillary=pow(max(0.0,tear),14.0);
      diffuseColor.rgb*=.75+grain*.10+tear*.08;
      if(gl_FrontFacing){
        diffuseColor.rgb+=vec3(.077,.021,.013)*capillary;
      }else{
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.014,.030,.082),.85)+vec3(.016,.041,.080)*capillary;
      }
    `);
  };
  return {
    deep:textile(0x29232c,.91,'cloth'),
    body:metal(awakened?0x283b58:0x314861,.67,.38,.24,'iron'),
    trim:metal(0xb58b42,.77,.34,.19,'bronze'),
    edge:metal(0xdccfbc,.22,.49,.08,'bone'),
    ivoryShade:textile(0x8e7b70,.76,'bone'),
    bronzeShade:metal(0x73493f,.59,.53,.06,'bronze'),
    wingEdge:metal(0x50668d,.63,.34,.27,'iron'),
    webbing,
    cyan:new T.MeshStandardMaterial({
      color:0x237d91,emissive:0x1abfc7,emissiveIntensity:1.0,metalness:.29,roughness:.31,envMap:env,envMapIntensity:.84,
    }),
    glow:new T.MeshBasicMaterial({color:palette[3],toneMapped:false}),
    eye:new T.MeshBasicMaterial({color:0xfda64b,toneMapped:false}),
    mist:new T.MeshBasicMaterial({
      color:0x2df4db,transparent:true,opacity:.20,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
    }),
  };
}

export function lightPaoDisplay(scene){
  const key=new T.DirectionalLight(0xffd4a2,2.6);
  const fill=new T.DirectionalLight(0xa1cfff,1.15);
  const rim=new T.DirectionalLight(0x7fb8ff,2.95);
  key.position.set(-3.5,4,4.1);
  fill.position.set(3.8,.65,4.3);
  rim.position.set(2.3,2.1,-3.3);
  scene.add(new T.HemisphereLight(0xd2dbef,0x68506d,.99),key,fill,rim);
}
