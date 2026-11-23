import * as T from '../three.min.mjs';

export class AdditiveEffectBatch {
  constructor(scene,shape,order,map=null){
    this.capacity=128;
    const geometry=shape.clone();
    this.opacity=new T.InstancedBufferAttribute(new Float32Array(this.capacity),1).setUsage(T.DynamicDrawUsage);
    geometry.setAttribute('effectOpacity',this.opacity);
    const material=new T.MeshBasicMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
      map,forceSinglePass:true,blending:T.AdditiveBlending});
    material.onBeforeCompile=shader=>{
      shader.vertexShader='attribute float effectOpacity; varying float vEffectOpacity;\n'+shader.vertexShader
        .replace('#include <begin_vertex>','#include <begin_vertex>\n vEffectOpacity=effectOpacity;');
      shader.fragmentShader='varying float vEffectOpacity;\n'+shader.fragmentShader
        .replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.a*=vEffectOpacity;');
    };
    // Allocate the color stream before the renderer chooses its shader.
    this.mesh=new T.InstancedMesh(geometry,material,this.capacity);
    this.mesh.setColorAt(0,new T.Color(0xffffff));
    this.mesh.instanceColor.setUsage(T.DynamicDrawUsage);
    this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    this.mesh.frustumCulled=false;
    this.mesh.renderOrder=order;
    this.reset();
    scene.add(this.mesh);
  }

  reset(){
    this.mesh.count=0;
    this.mesh.visible=false;
  }

  push(part){
    const index=this.mesh.count;
    // Excess instances keep their normal draw path.
    if(index===this.capacity){
      part.layers.enable(0);
      return;
    }
    part.updateMatrix();
    this.mesh.setMatrixAt(index,part.matrix);
    this.mesh.setColorAt(index,part.material.color);
    this.opacity.setX(index,part.material.opacity);
    this.mesh.count++;
    part.layers.disable(0);
  }

  upload(){
    const {mesh,opacity}=this;
    if(!mesh.count)return;
    mesh.visible=true;
    for(const attribute of [mesh.instanceMatrix,mesh.instanceColor,opacity]){
      attribute.clearUpdateRanges();
      attribute.addUpdateRange(0,mesh.count*attribute.itemSize);
      attribute.needsUpdate=true;
    }
  }
}
