import * as T from '../three.min.mjs';

export function roundedBlock(radius=.11,segments=4){
  const geometry=new T.BoxGeometry(1,1,1,segments,segments,segments),p=geometry.attributes.position,n=geometry.attributes.normal;
  const v=new T.Vector3(),center=new T.Vector3(),normal=new T.Vector3(),inner=.5-radius;
  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i);center.copy(v).clampScalar(-inner,inner);normal.copy(v).sub(center).normalize();
    v.copy(center).addScaledVector(normal,radius);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
  }
  return geometry;
}

export function etchedMetal(material){
  const before=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>key+'|lantern-etch-v1';
  material.onBeforeCompile=shader=>{
    before.call(material,shader);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLanternMetalPoint;varying vec3 vLanternMetalNormal;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvLanternMetalPoint=position;vLanternMetalNormal=normal;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLanternMetalPoint;varying vec3 vLanternMetalNormal;')
      .replace('#include <color_fragment>',`#include <color_fragment>
        {
        vec3 lp=vLanternMetalPoint;
        float grain=fract(sin(dot(floor(lp*173.0),vec3(31.7,73.1,19.3)))*14375.53);
        float brushing=sin(lp.y*233.0+lp.x*11.0+sin(lp.z*31.0));
        float wear=pow(abs(dot(normalize(vLanternMetalNormal),normalize(vec3(.31,.81,.49)))),8.0);
        float seam=pow(max(0.0,sin(lp.x*49.0+sin(lp.y*9.0)*.65)),21.0);
        diffuseColor.rgb*=.86+grain*.16+brushing*.025;
        diffuseColor.rgb+=vec3(.13,.11,.08)*wear+vec3(.037,.046,.053)*seam;
        }`);
  };
  return material;
}
