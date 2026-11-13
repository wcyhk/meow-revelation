import * as T from '../three.min.mjs';
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
  const metal=(color,metalness,roughness,patina)=>weather(new T.MeshPhysicalMaterial({
    color,metalness,roughness,clearcoat:.07,clearcoatRoughness:.53,
    envMap:env,envMapIntensity:.82,bumpMap:bump,bumpScale:.016,emissive:color,emissiveIntensity:.032,
  }),patina,1);
  const textile=(color,roughness,patina)=>weather(new T.MeshStandardMaterial({
    color,roughness,bumpMap:bump,bumpScale:.039,emissive:color,emissiveIntensity:.055,
  }),patina,0);
  const webbing=new T.MeshStandardMaterial({
    vertexColors:true,side:T.DoubleSide,metalness:.09,roughness:.76,bumpMap:bump,bumpScale:.073,
    emissive:0x6b2f24,emissiveIntensity:.039,
  });
  webbing.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 weave=vBumpMapUv;
      vec2 p=weave+vec2(sin(weave.y*23.0)*.033,cos(weave.x*34.0)*.031);
      float grain=sin(p.y*207.0+p.x*37.0)*cos(p.x*134.0-p.y*69.0);
      float stain=sin(p.x*15.0-p.y*11.0)*sin(p.y*32.0+p.x*13.0);
      float vein=pow(.5+.5*sin(p.x*84.0+p.y*29.0+sin(p.y*68.0)*1.7),15.0);
      diffuseColor.rgb*=.71+grain*.11+stain*.22;
      if(gl_FrontFacing) diffuseColor.rgb*=1.0-vein*.26;
      else diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.017,.027,.043),.62)*(1.0-vein*.27);
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float sideRim=pow(1.0-abs(normalize(vViewPosition).z),2.0);
      totalEmissiveRadiance+=vec3(.054,.017,.006)*sideRim*(.22+.78*max(0.0,stain));
    `);
  };
  return {
    deep:textile(0x221d23,.95,0x333036),
    clothSeam:textile(0x40373b,.90,0x554745),
    body:metal(awakened?0x3f4d69:0x48566b,.76,.45,0x1c283c),
    trim:metal(0xa4844e,.80,.43,0x42442d),
    edge:textile(0xcfc8b6,.65,0x675b50),
    oldBone:textile(0xd7ceba,.66,0x827467),
    ivoryShade:textile(0x7e6957,.81,0x4b3630),
    bronzeShade:metal(0x724c3d,.63,.55,0x322421),
    wingEdge:metal(0x515f81,.72,.45,0x26324a),
    webbing,
    cyan:new T.MeshStandardMaterial({
      color:0x164953,emissive:0x0d706c,emissiveIntensity:.75,metalness:.47,roughness:.38,envMap:env,envMapIntensity:.72,
    }),
    glow:new T.MeshBasicMaterial({color:new T.Color(palette[3]).multiplyScalar(.58)}),
    eye:new T.MeshBasicMaterial({color:0xfda64b,toneMapped:false}),
    eyeCore:new T.MeshBasicMaterial({color:0xffe4a5,toneMapped:false}),
    mist:new T.MeshBasicMaterial({
      color:0x2df4db,transparent:true,opacity:.20,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
    }),
    corona:new T.ShaderMaterial({
      uniforms:{clock:{value:0},power:{value:.6}},
      transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,
      vertexShader:`varying vec2 rays;void main(){rays=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 rays;uniform float clock,power;
        void main(){
          float angle=atan(rays.y,rays.x);
          float distanceFromCenter=length(rays);
          float surge=sin(angle*5.+clock*2.3)*sin(angle*9.-clock*1.6);
          float filament=exp(-abs(distanceFromCenter-.57-surge*.065)*17.);
          float haze=exp(-abs(distanceFromCenter-.60-surge*.11)*7.0);
          float wisps=pow(.5+.5*sin(angle*7.+distanceFromCenter*13.+clock*2.1),2.2);
          float falloff=smoothstep(.20,.49,distanceFromCenter)*(1.-smoothstep(.74,1.,distanceFromCenter));
          float opacity=(filament*.19+wisps*haze*.38)*falloff*power;
          gl_FragColor=vec4(.19,.82,.70,opacity);
          #include <colorspace_fragment>
        }`,
    }),
  };
}

function weather(material,patina,metal){
  material.onBeforeCompile=shader=>{
    shader.uniforms.patinaColor={value:new T.Color(patina)};
    shader.uniforms.ironWear={value:metal};
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      varying vec3 paoSurface;
    `).replace('#include <begin_vertex>',`#include <begin_vertex>
      paoSurface=position;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 paoSurface;
      uniform vec3 patinaColor;
      uniform float ironWear;
      float grainHash(vec3 v){return fract(sin(dot(v,vec3(127.1,311.7,74.7)))*43758.5453);}
      float stoneNoise(vec3 p){
        vec3 i=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(mix(grainHash(i),grainHash(i+vec3(1,0,0)),f.x),
                       mix(grainHash(i+vec3(0,1,0)),grainHash(i+vec3(1,1,0)),f.x),f.y),
                   mix(mix(grainHash(i+vec3(0,0,1)),grainHash(i+vec3(1,0,1)),f.x),
                       mix(grainHash(i+vec3(0,1,1)),grainHash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }
    `).replace('#include <color_fragment>',`#include <color_fragment>
      vec3 p=paoSurface;
      float wear=stoneNoise(p*13.0)*.62+stoneNoise(p*39.0)*.38;
      float scoring=stoneNoise(p*vec3(10.0,106.0,55.0));
      float exposed=smoothstep(.49,.77,wear);
      float pitting=smoothstep(.48,.83,scoring);
      diffuseColor.rgb=mix(diffuseColor.rgb*(.72+wear*.42),patinaColor,
        (1.0-exposed)*(.29+ironWear*.24));
      diffuseColor.rgb+=pitting*exposed*mix(vec3(.029,.028,.024),vec3(.105,.098,.083),ironWear);
    `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+.22*(1.0-exposed)-pitting*ironWear*.17,.26,.96);
    `);
  };
  return material;
}

export function lightPaoDisplay(scene){
  const key=new T.DirectionalLight(0xffe1c2,2.62);
  const fill=new T.DirectionalLight(0xa7c2cd,.52);
  const rim=new T.DirectionalLight(0x7197ca,3.2);
  const back=new T.DirectionalLight(0xa5bfca,1.62);
  key.position.set(-3.5,3.6,4.1);
  fill.position.set(3.8,.25,4.3);
  rim.position.set(2.6,1.9,-4.3);
  back.position.set(-3.1,2.1,-3.9);
  scene.add(new T.HemisphereLight(0x9babb4,0x51433c,.62),key,fill,rim,back);
}
