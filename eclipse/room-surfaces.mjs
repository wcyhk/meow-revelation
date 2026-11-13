import * as T from '../three.min.mjs';

const resources=new Map();
const scans={
  lichen:'PavingStones149',
  'rough-paving':'PavingStones141',
  limestone:'PavingStones132',
  rock:'Rock063',
  metal:'Metal032',
  ice:'Ice003',
  wood:'Wood049',
  sand:'Ground054',
};
let loading;

export function loadRoomSurfaces(){
  if(loading)return loading;
  const loader=new T.TextureLoader();
  loading=Promise.allSettled(Object.keys(scans).flatMap(kind=>['color','normal','rough'].map(async channel=>{
    const url=new URL('./art/rooms/'+kind+'-'+channel+'.webp',import.meta.url);
    const texture=await loader.loadAsync(url.href);
    if(channel==='color')texture.colorSpace=T.SRGBColorSpace;
    texture.wrapS=texture.wrapT=T.RepeatWrapping;
    texture.anisotropy=4;
    if(!resources.has(kind))resources.set(kind,{});
    resources.get(kind)[channel]=texture;
  })));
  return loading;
}

const options=new Map();

export function roomSurface(kind,repeat=1,strength=.62){
  const key=kind+':'+repeat;
  if(!options.has(key)){
    const channels=resources.get(kind);
    if(!channels?.color)return {};
    const bind=map=>{
      if(!map||repeat===1)return map;
      const result=map.clone();
      result.repeat.setScalar(repeat);
      result.needsUpdate=true;
      return result;
    };
    options.set(key,{map:bind(channels.color),normalMap:bind(channels.normal),roughnessMap:bind(channels.rough)});
  }
  return {...options.get(key),normalScale:new T.Vector2(strength,strength)};
}

const roomFinishes={
  grove:['lichen','rock','wood',10,0xb29e86,.09,.81],
  canal:['limestone','lichen','rock',6,0x6c9091,.26,.56],
  lotus:['rough-paving','limestone','rock',6,0x869b93,.29,.58],
  frost:['ice','rock','ice',8,0x9bacd0,.32,.52],
  forge:['rough-paving','rock','metal',9,0x6c6266,.20,.73],
  grave:['lichen','rock','wood',9,0x777184,.11,.81],
  vault:['limestone','limestone','metal',6,0x83715f,.35,.62],
  dunes:['sand','rock','wood',15,0xb89776,.07,.91],
  fungus:['lichen','rock','wood',8,0x799686,.22,.65],
  cathedral:['limestone','limestone','rock',6,0x8792ad,.32,.54],
  desecrated:['limestone','lichen','rock',6,0x77697e,.28,.59],
  throne:['limestone','limestone','metal',6,0xa095a7,.36,.52],
  crimson:['limestone','rock','metal',6,0x967583,.32,.55],
};

export function finishForRoom(type){
  const [floor,masonry,ornament,repeat,tint,metalness,roughness]=roomFinishes[type];
  return {floor,masonry,ornament,repeat,tint,metalness,roughness};
}

export function weatherMasonry(material,kind){
  const metal=kind==='metal', ice=kind==='ice', wood=kind==='wood';
  material.customProgramCacheKey=()=>`patina:${kind}`;
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`
      #include <common>
      varying vec3 roomStone;
    `).replace('#include <begin_vertex>',`
      #include <begin_vertex>
      vec4 weatheredPosition=vec4(position,1.);
      #ifdef USE_INSTANCING
        weatheredPosition=instanceMatrix*weatheredPosition;
      #endif
      roomStone=(modelMatrix*weatheredPosition).xyz;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`
      #include <common>
      varying vec3 roomStone;
    `).replace('#include <color_fragment>',`
      #include <color_fragment>
      vec3 grainCoordinates=roomStone;
      float deposit=sin(grainCoordinates.x*2.39+grainCoordinates.y*.85+grainCoordinates.z*1.7)
        *cos(grainCoordinates.z*3.68-grainCoordinates.y*2.89);
      float scores=pow(.5+.5*sin(dot(grainCoordinates,vec3(47.1,7.1,81.4))+deposit*2.5),14.);
      float footing=1.-smoothstep(.10,1.6,grainCoordinates.y);
      float stain=.5+deposit*.5;
      diffuseColor.rgb*=.87+.26*stain-footing*.13;
      ${metal ? 'diffuseColor.rgb*=mix(vec3(.66,.76,.80),vec3(1.14,.97,.81),smoothstep(.32,.73,stain)); diffuseColor.rgb+=scores*vec3(.10,.073,.039);' : ''}
      ${ice ? 'diffuseColor.rgb+=scores*stain*vec3(.04,.065,.11);' : ''}
      ${wood ? 'diffuseColor.rgb*=.85+.27*pow(.5+.5*sin(grainCoordinates.x*32.+grainCoordinates.z*29.+deposit),3.);' : ''}
    `).replace('#include <roughnessmap_fragment>',`
      #include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+stain*.14+footing*.09-scores*${metal ? '.26' : '.09'},.17,1.);
    `);
  };
  return material;
}

// Layer wet seams, soot and mineral veins over the scanned floor in world coordinates.
export function weatherFloor(material,type){
  const kind=Object.keys(roomFinishes).indexOf(type);
  material.customProgramCacheKey=()=> 'room-floor-'+kind;
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>',
      '#include <common>\nvarying vec2 groundWorld;').replace('#include <begin_vertex>',
      '#include <begin_vertex>\n groundWorld=(modelMatrix*vec4(position,1.0)).xz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`
      #include <common>
      varying vec2 groundWorld;
      float cell(vec2 p){
        p=fract(p*vec2(.1031,.1137));
        p+=dot(p,p.yx+19.19);
        return fract(p.x*p.y);
      }
      float worn(vec2 p){
        vec2 i=floor(p),u=fract(p);
        u=u*u*(3.-2.*u);
        return mix(mix(cell(i),cell(i+vec2(1,0)),u.x),mix(cell(i+vec2(0,1)),cell(i+1.),u.x),u.y);
      }`).replace('#include <color_fragment>',`
      #include <color_fragment>
      vec2 seam=groundWorld;
      float stain=worn(seam*.31)*.66+worn(seam*1.43)*.34;
      float chips=worn(seam*vec2(9.3,14.9));
      float wornEdge=smoothstep(7.,15.,abs(seam.x));
      diffuseColor.rgb*=.78+stain*.53+chips*.13-wornEdge*.21;
      ${type==='forge'||type==='crimson'? 'diffuseColor.rgb=mix(diffuseColor.rgb, diffuseColor.rgb*vec3(.64,.31,.28),smoothstep(.44,.76,stain)*.55);':''}
      ${type==='grove'||type==='fungus'? 'diffuseColor.rgb=mix(diffuseColor.rgb, diffuseColor.rgb*vec3(.57,.87,.35),smoothstep(.53,.84,stain)*.48);':''}
      ${type==='frost'? 'diffuseColor.rgb+=smoothstep(.70,.95,stain)*.042;':''}
    `).replace('#include <roughnessmap_fragment>',`
      #include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+.15*stain-.12*chips,.24,.99);
    `);
  };
  return material;
}
