// Detached, fully authored rigs stay private to their renderer. An active rig
// is never in the reserve, so twins cannot share bones, uniforms or hit flashes.
export class ModelReserve {
  constructor(scene,build,destroy,mobile){
    this.scene=scene;this.build=build;this.destroy=destroy;
    this.limit=(mobile?16:32)*1024*1024;
    this.maxCount=mobile?12:20;
    this.idle=new Map();this.owned=new WeakMap();this.bytes=0;
    this.hits=0;this.misses=0;this.evictions=0;
  }

  key(entry,spec){return JSON.stringify([entry,spec.relicWeapon?.id,spec.effect]);}

  has(entry,spec){const key=this.key(entry,spec);return [...this.idle.values()].some(meta=>meta.key===key);}

  take(entry,height,mobile,spec){
    const key=this.key(entry,spec);
    let rig;
    for(const [candidate,meta] of this.idle)if(meta.key===key){
      rig=candidate;this.idle.delete(rig);this.bytes-=meta.bytes;this.hits++;
      for(const {node,position,quaternion,scale,visible} of meta.pose){
        node.position.copy(position);node.quaternion.copy(quaternion);
        node.scale.copy(scale);node.visible=visible;
      }
      rig.heading=undefined;rig.weaponFlash=null;
      for(const weapon of rig.weapons??[])weapon.posed=false;
      rig.hitFlash&&(rig.hitFlash.value=0);
      rig.skin?.reset();rig.aura?.reset();
      rig.scale=meta.heightScale*height;
      this.scene.add(rig.root);
      return rig;
    }
    this.misses++;
    rig=this.build(this.scene,entry,height,mobile,spec);
    const geometries=new Set(),pose=[];
    let bytes=0;
    rig.root.traverse(node=>{
      pose.push({node,position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone(),visible:node.visible});
      if(node.geometry)geometries.add(node.geometry);
      if(node.isInstancedMesh)bytes+=node.instanceMatrix.array.byteLength+(node.instanceColor?.array.byteLength??0);
    });
    for(const geometry of geometries){
      for(const attribute of Object.values(geometry.attributes))bytes+=(attribute.array??attribute.data?.array)?.byteLength??0;
      bytes+=geometry.index?.array.byteLength??0;
    }
    // Include a conservative allowance for retained bones, transforms and uniforms.
    bytes+=pose.length*768;
    this.owned.set(rig,{key,bytes,pose,heightScale:rig.scale/height});
    return rig;
  }

  release(rig){
    if(this.idle.has(rig))return;
    this.scene.remove(rig.root);
    const meta=this.owned.get(rig);
    if(!meta||meta.bytes>this.limit){this.destroy(this.scene,rig);return;}
    // Drop references to finished attack/motion objects as soon as combat ends.
    rig.aura?.reset();rig.skin?.reset();rig.weaponFlash=null;
    if(rig.hitFlash)rig.hitFlash.value=0;
    this.idle.set(rig,meta);this.bytes+=meta.bytes;
    while(this.bytes>this.limit||this.idle.size>this.maxCount){
      const [old,entry]=this.idle.entries().next().value;
      this.idle.delete(old);this.bytes-=entry.bytes;this.owned.delete(old);
      this.destroy(this.scene,old);this.evictions++;
    }
  }

  clear(){
    for(const rig of this.idle.keys()){this.destroy(this.scene,rig);this.owned.delete(rig);}
    this.idle.clear();this.bytes=0;
  }

  get stats(){return {count:this.idle.size,bytes:this.bytes,limit:this.limit,hits:this.hits,misses:this.misses,evictions:this.evictions};}
}
