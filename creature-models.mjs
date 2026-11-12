import * as T from "./three.min.mjs";
import { GLTFLoader } from "./vendor/GLTFLoader.mjs";
import { clone } from "./vendor/SkeletonUtils.mjs";

const models={
  rat:{file:"rat.glb",tint:0xc1c1cf,hit:0xf5af8c,height:1.09,emission:.25},
};

export async function loadCreatureModels(){
  const loader=new GLTFLoader();
  const assets=new Map();
  await Promise.allSettled(Object.entries(models).map(async ([kind,look])=>{
    const model=await loader.loadAsync(new URL("./models/"+look.file,import.meta.url).href);
    const bounds=new T.Box3().setFromObject(model.scene,true);
    const span=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
    const size=Math.max(span.x,span.y,span.z);
    const clips=Object.fromEntries(model.animations.map(clip=>[clip.name.toLowerCase(),clip]));
    if(!Number.isFinite(size)||size<1e-5||!clips.idle||!clips.attack||!clips.walk)return;
    assets.set(kind,{look,scene:model.scene,clips,bounds,size,center});
  }));
  return assets;
}

export class CreatureModel{
  constructor(kind,asset,scene){
    this.kind=kind;
    this.root=new T.Group();
    this.root.name="figure:"+kind;
    this.pivot=new T.Group();
    const model=clone(asset.scene);
    const scale=asset.look.height/asset.size;
    const offset=new T.Group();
    offset.position.set(-asset.center.x*scale,-asset.bounds.min.y*scale,-asset.center.z*scale);
    offset.scale.setScalar(scale);
    offset.add(model);this.pivot.add(offset);this.root.add(this.pivot);
    this.colors=[];
    model.traverse(object=>{
      if(!object.isMesh)return;
      object.frustumCulled=false;
      const materials=Array.isArray(object.material)?object.material:[object.material];
      const tinted=materials.map(source=>{
        const material=source.clone();
        const base=material.color.clone().multiply(new T.Color(asset.look.tint));
        material.color.copy(base);material.roughness=.81;
        if(material.emissive){
          material.emissiveMap=material.map;
          material.emissive.setHex(material.map?0xffffff:asset.look.tint);
          material.emissiveIntensity=asset.look.emission;
        }
        this.colors.push({material,base});
        return material;
      });
      object.material=Array.isArray(object.material)?tinted:tinted[0];
    });
    this.flash=new T.Color(asset.look.hit);
    this.mixer=new T.AnimationMixer(model);
    this.actions=Object.fromEntries(Object.entries(asset.clips).map(([name,clip])=>[name,this.mixer.clipAction(clip)]));
    for(const name of ["attack","dead"]){
      this.actions[name]?.setLoop(T.LoopOnce,1);
      if(this.actions[name])this.actions[name].clampWhenFinished=true;
    }
    scene.add(this.root);
    this.reset();
  }
  reset(){
    this.mixer.stopAllAction();
    this.clip="";this.yaw=null;this.fall=0;
    this.root.visible=true;
  }
  setClip(name){
    if(name===this.clip)return;
    if(this.actions[this.clip])this.actions[this.clip].fadeOut(.09);
    this.actions[name]?.reset().fadeIn(.10).play();
    this.clip=name;
  }
  pose(actor,dt,time,depth,size,weapon,forged,still){
    const angle=actor.angle??Math.PI*.5;
    const heading=Math.atan2(Math.cos(angle)*depth,Math.sin(angle));
    if(this.yaw===null||still)this.yaw=heading;
    else{
      const delta=heading-this.yaw;
      this.yaw+=Math.atan2(Math.sin(delta),Math.cos(delta))*(1-Math.exp(-dt*15));
    }
    this.root.rotation.y=this.yaw;
    const dead=actor.hp===0;
    if(dead)this.fall=Math.min(1,this.fall+dt/.49);
    const attack=Boolean(actor.warning||actor.recoil>0);
    const name=dead&&this.actions.dead?"dead":attack?"attack":actor.walking?"walk":"idle";
    this.setClip(name);
    const current=this.actions[name];
    if(actor.warning&&current){
      const progress=1-Math.max(0,actor.warning.left/actor.warning.total);
      current.time=current.getClip().duration*progress*.72;
    }
    this.mixer.update(still&&name==="idle"?0:dt);
    const hit=Math.min(.82,(actor.hit||0)*5);
    for(const {material,base} of this.colors)material.color.copy(base).lerp(this.flash,hit);
    this.root.scale.setScalar(size);
    this.pivot.rotation.x=(dead&&!this.actions.dead?this.fall*.8:0)-hit*.13;
    this.pivot.scale.y=1-this.fall*.85;
  }
}
