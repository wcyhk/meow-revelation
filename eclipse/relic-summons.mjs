import * as T from '../three.min.mjs';
import {forge,disposeForge} from './armory.mjs?v=emberlight-1';

const rootGeometry=new T.BufferGeometry(),box=new T.BoxGeometry(1,1,1),
  jointGeometry=new T.SphereGeometry(1,10,7),tube=new T.CylinderGeometry(1,1,1,10),
  ring=new T.TorusGeometry(1,.065,5,24),gem=new T.OctahedronGeometry(1);
const muzzle=new T.Vector3();
export function summonModel(view,weapon,point,duration){
  const effect=view.addEffect(rootGeometry,{...point,y:.03},weapon.tone,duration,{opacity:0,order:70});
  effect.combatClock=true;const root=effect.mesh;root.name='契紙造物 · '+weapon.name;
  const make=(color,glow=0)=>new T.MeshStandardMaterial({color,roughness:.48,metalness:.47,emissive:weapon.tone,
    emissiveIntensity:glow,transparent:true,opacity:.93});
  const surfaces=[make(0xd9c8a8),make(0x46505c),make(0xa99770),make(weapon.tone,.95)];
  const joints=[];
  const p=(parent,geo,index,x,y,z,sx,sy=sx,sz=sx)=>{const m=new T.Mesh(geo,surfaces[index]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;};
  const bone=(parent,x,y,z)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);joints.push(g);return g;};
  let rifle;
  if(weapon.id==='western-rifle'||weapon.id==='oni-bow'){
    const body=bone(root,0,.75,0);
    p(body,box,0,0,0,0,.28,.46,.30);p(body,box,1,-.03,0,0,.32,.40,.24);
    for(let i=0;i<3;i++)p(body,box,i%2?2:0,.15,.10-i*.12,0,.035,.08,.31);
    p(body,gem,3,.18,.01,0,.042,.08,.06);
    const head=bone(body,0,.40,0);p(head,box,0,0,0,0,.28,.27,.29);p(head,box,3,.147,.02,0,.027,.035,.19);
    for(const side of [-1,1]){
      const leg=bone(body,0,-.26,side*.12);p(leg,box,1,0,-.20,0,.12,.37,.11);p(leg,box,2,.07,-.38,0,.24,.08,.14);
      const arm=bone(body,.02,.16,side*.22);p(arm,box,0,.12,-.13,0,.13,.33,.13);p(arm,jointGeometry,2,.21,-.22,0,.08);
      const coat=p(body,box,0,-.14,-.20,side*.16,.025,.44,.17);coat.rotation.x=side*.18;
    }
    if(weapon.id==='western-rifle'){
      rifle=forge(weapon);rifle.position.set(.10,.83,.12);rifle.rotation.z=-Math.PI/2;rifle.scale.setScalar(.60);root.add(rifle);
    }else for(const side of [-1,1])p(body,gem,3,.28,-.02,side*.26,.23,.035,.055);
  }else if(weapon.id==='turtle-bow'){
    p(root,box,1,0,.43,0,.86,.40,.64);p(root,box,0,0,.65,0,.74,.13,.67);
    for(const side of [-1,1]){
      p(root,box,2,.12,.84,side*.21,.41,.32,.10);p(root,gem,3,.12,.86,side*.22,.11,.14,.08);
      for(const x of [-.30,.30]){const wheel=bone(root,x,.24,side*.37);p(wheel,tube,2,0,0,0,.20,.10,.20).rotation.x=Math.PI/2;p(wheel,ring,3,0,0,side*.055,.14);}
    }
    p(root,box,2,.57,.48,0,.40,.07,.47);
  }else{
    // Segmented ink conduits and copper furnaces replace animal/deity summons.
    const count=weapon.id==='snake'?3:1;
    for(let j=0;j<count;j++){
      const duct=bone(root,0,0,(j-(count-1)/2)*.42);
      for(let i=0;i<6;i++){
        const x=-.43+i*.16,y=.23+Math.sin(i*.52)*.21;
        p(duct,box,i%2?1:2,x,y,0,.20,.19,.19).rotation.z=i*.08;
        p(duct,gem,3,x,y+.13,.015,.025,.034,.025);
      }
      p(duct,tube,2,.58,.42,0,.18,.30,.18).rotation.z=Math.PI/2;
      p(duct,ring,3,.74,.42,0,.13).rotation.y=Math.PI/2;
      p(duct,gem,3,.71,.42,0,.12,.09,.09);
    }
  }
  effect.animate=age=>{
    const fade=Math.min(1,effect.age*8,(1-age)*5);
    for(const surface of surfaces)surface.opacity=fade*.93;
    for(const [i,joint] of joints.entries())joint.rotation.y=Math.sin(effect.age*5+i)*.055;
    if(rifle){const recoil=Math.max(0,1-(effect.age-(effect.fired??-10))*9);rifle.position.x=.10-recoil*.11;rifle.rotation.z=-Math.PI/2+recoil*.12;}
  };
  effect.cleanup=()=>{surfaces.forEach(m=>m.dispose());if(rifle)disposeForge(rifle);};
  effect.rifle=rifle;return effect;
}
export function summonMuzzle(summon,point,angle,target){
  summon.mesh.position.set(point.x,.03,point.z);
  const distance=Math.hypot(target.x-point.x,target.z-point.z);
  if(distance>.19)angle-=Math.asin(.12/distance);
  summon.mesh.rotation.y=-angle;summon.rifle.position.x=.10;summon.rifle.rotation.z=-Math.PI/2;
  summon.rifle.localToWorld(muzzle.set(...summon.rifle.userData.launch.tip));summon.fired=summon.age;
  return {x:muzzle.x,y:muzzle.y,z:muzzle.z,dx:Math.cos(angle),dz:Math.sin(angle)};
}
