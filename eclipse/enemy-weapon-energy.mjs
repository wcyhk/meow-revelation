import * as T from '../three.min.mjs';

const point=new T.Vector3(),relative=new T.Vector3();
const transform=new T.Matrix4(),inverse=new T.Matrix4();

function energyCoordinates(mesh,weapon){
  const {node,base,end,axis,kind,width}=weapon;
  mesh.updateWorldMatrix(true,false);
  transform.multiplyMatrices(inverse.copy(node.matrixWorld).invert(),mesh.matrixWorld);
  const {position}=mesh.geometry.attributes;
  const values=new Float32Array(position.count);
  const length=base.distanceTo(end);
  const radial=kind==='bow'||kind==='ring';
  const anchor=radial?base.clone().lerp(end,kind==='ring'?.5:.15):base;
  for(let i=0;i<position.count;i++){
    relative.copy(point.fromBufferAttribute(position,i).applyMatrix4(transform)).sub(anchor);
    values[i]=radial?relative.length()/Math.max(.15,kind==='bow'?width*2.6:length*.50):relative.dot(axis)/length;
  }
  mesh.geometry.setAttribute('weaponDistance',new T.BufferAttribute(values,1));
}

function glowingFinish(original,uniforms){
  const material=original.clone();
  const compile=original.onBeforeCompile;
  const shaderKey=original.customProgramCacheKey();
  material.customProgramCacheKey=()=>shaderKey+'|weapon-emission';
  material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);
    Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      attribute float weaponDistance;
      varying float vWeaponDistance;`).replace('#include <begin_vertex>',`#include <begin_vertex>
      vWeaponDistance=weaponDistance;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying float vWeaponDistance;
      uniform vec3 weaponTint,weaponHeart;
      uniform float weaponClock,weaponCharge,weaponRelease,weaponStage;`)
      .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        float energized=smoothstep(.12,.67,vWeaponDistance);
        float rimGlow=pow(clamp(1.-abs(dot(normal,normalize(vViewPosition))),0.,1.),2.5);
        float flow=pow(.5+.5*cos(vWeaponDistance*15.-weaponClock*2.),5.);
        float mantle=(.08+.18*weaponCharge+rimGlow*(.32+.41*weaponCharge))*energized;
        float vein=energized*flow*(.14+.52*weaponCharge);
        totalEmissiveRadiance+=weaponTint*(mantle+vein*.65)*(1.+weaponStage*.19);
        totalEmissiveRadiance+=weaponHeart*(vein*.40+weaponRelease*energized*(.27+.58*rimGlow));`);
  };
  return material;
}

export function armWeaponEmission(weapons,materials,tint){
  if(!weapons.length)return null;
  const dye=new T.Color(tint);
  const uniforms={
    weaponClock:{value:0},weaponCharge:{value:0},weaponRelease:{value:0},weaponStage:{value:0},
    weaponTint:{value:dye},weaponHeart:{value:dye.clone().lerp(new T.Color(0xfff6e5),.66)},
  };
  const finishes=new Map();
  const processed=new Set();
  for(const weapon of weapons)weapon.node.traverse(mesh=>{
    const source=mesh.material;
    if(!mesh.isMesh||mesh.isSkinnedMesh||mesh.isInstancedMesh||!source?.isMeshStandardMaterial||source.transparent||processed.has(mesh))return;
    processed.add(mesh);
    energyCoordinates(mesh,weapon);
    if(!finishes.has(source)){
      const finish=glowingFinish(source,uniforms);
      finishes.set(source,finish);
      materials['weaponEmission'+finishes.size]=finish;
    }
    mesh.material=finishes.get(source);
  });
  return processed.size?uniforms:null;
}
