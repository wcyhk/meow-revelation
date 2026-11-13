import * as T from '../three.min.mjs';
import {forge,disposeForge} from './armory.mjs?v=forgelight-4';

const box=new T.BoxGeometry(1,1,1);
const sphere=new T.SphereGeometry(1,10,8);
const cone=new T.ConeGeometry(1,1,7);
const tube=new T.CylinderGeometry(1,1,1,10);
const curve=new T.TorusGeometry(1,.23,7,20,Math.PI*1.45);
const rootGeometry=new T.BufferGeometry();

function material(tint,opacity=1){
  return new T.MeshStandardMaterial({color:tint,emissive:tint,emissiveIntensity:.26,
    roughness:.69,transparent:true,opacity});
}

function piece(group,geometry,surface,x,y,z,sx,sy,sz){
  const mesh=new T.Mesh(geometry,surface);
  mesh.position.set(x,y,z);
  mesh.scale.set(sx,sy,sz);
  group.add(mesh);
  return mesh;
}

export function summonModel(view,weapon,point,duration){
  const body=view.addEffect(rootGeometry,{...point,y:.03},weapon.tone,duration,
    {opacity:1,order:70});
  body.combatClock=true;
  const root=body.mesh;
  const ink=material(weapon.tone,.93), edge=material(0xe6dcbe,.95), shadow=material(0x42384e,.94);
  const colors=[ink,edge,shadow];
  let rifle;
  const p=(geo,surface,x,y,z,sx,sy,sz)=>piece(root,geo,surface,x,y,z,sx,sy,sz);
  if(weapon.id==='western-rifle'){
    p(cone,shadow,0,.54,0,.35,.89,.32);
    p(sphere,ink,.055,1.10,0,.19,.24,.20);
    p(tube,shadow,.018,1.27,0,.33,.075,.34);
    p(tube,shadow,-.005,1.38,0,.205,.23,.22);
    p(tube,ink,-.005,1.31,0,.215,.045,.225);
    for(const side of [-1,1]){
      p(box,ink,-.07,.19,side*.12,.16,.34,.15);
      p(sphere,edge,.212,1.105,side*.073,.023,.024,.018);
      p(sphere,shadow,.14,.83,side*.18,.22,.12,.11);
    }
    rifle=forge(weapon);
    rifle.position.set(.16,.88,.16);
    rifle.rotation.set(0,Math.PI,-Math.PI/2,'ZYX');
    rifle.scale.setScalar(.72);
    root.add(rifle);
  }else if(weapon.id==='turtle-bow'){
    p(box,shadow,0,.36,0,1.48,.34,1.03);
    p(sphere,ink,0,.48,0,.73,.54,.53);
    p(sphere,edge,.64,.48,0,.23,.21,.25);
    for(const x of [-.43,.43])for(const z of [-.47,.47]){
      p(tube,shadow,x,.23,z,.27,.18,.27).rotation.x=Math.PI/2;
      p(tube,edge,x,.23,z*1.22,.09,.045,.09).rotation.x=Math.PI/2;
    }
    p(tube,edge,.47,.92,0,.12,.86,.12).rotation.z=-Math.PI/2;
  }else if(weapon.id==='oni-bow'){
    p(sphere,shadow,0,.52,0,.54,.59,.44);
    p(sphere,ink,.27,1.05,0,.33,.36,.34);
    p(cone,edge,.39,1.47,0,.11,.55,.13).rotation.z=-.42;
    for(const z of [-.46,.46]){
      p(sphere,ink,.18,.56,z,.40,.18,.17);
      p(sphere,edge,.53,1.07,z*.44,.036,.031,.038);
      p(cone,edge,.49,.76,z*.42,.072,.25,.072).rotation.z=-.25;
    }
  }else{
    const snakes=weapon.id==='snake'?3:1;
    for(let index=0;index<snakes;index++){
      const z=(index-(snakes-1)/2)*.47;
      const length=snakes===1?1.16:.77;
      p(curve,ink,-.12,.21,z,length,.65,length*.53).rotation.x=-Math.PI/2;
      p(sphere,ink,.28,.49,z,.19,.41,.15);
      p(sphere,shadow,.48,.69,z,.25,.16,.17);
      for(const side of [-1,1]){
        p(sphere,edge,.60,.73,z+side*.093,.036,.030,.027);
        p(cone,edge,.61,.55,z+side*.085,.031,.17,.030).rotation.z=Math.PI;
      }
    }
  }
  const parts=root.children.filter(part=>part!==rifle);
  body.animate=age=>{
    const fade=Math.min(1,body.age*8,(1-age)*5);
    for(const surface of colors)surface.opacity=fade*.93;
    for(const part of parts)part.rotation.y=Math.sin(body.age*8+part.position.x*2)*.07;
    if(rifle){
      const recoil=Math.max(0,1-(body.age-(body.fired??-10))*9);
      rifle.position.x=.16-recoil*.13;
      rifle.rotation.z=-Math.PI/2+recoil*.21;
    }
  };
  body.cleanup=()=>{
    colors.forEach(surface=>surface.dispose());
    if(rifle)disposeForge(rifle);
  };
  body.rifle=rifle;
  return body;
}

const muzzle=new T.Vector3();
export function summonMuzzle(summon,point,angle,target){
  summon.mesh.position.set(point.x,.03,point.z);
  const distance=Math.hypot(target.x-point.x,target.z-point.z);
  if(distance>.19)angle-=Math.asin(.16/distance);
  summon.mesh.rotation.y=-angle;
  summon.rifle.position.x=.16;
  summon.rifle.rotation.z=-Math.PI/2;
  summon.rifle.localToWorld(muzzle.set(...summon.rifle.userData.launch.tip));
  summon.fired=summon.age;
  return {x:muzzle.x,y:muzzle.y,z:muzzle.z,dx:Math.cos(angle),dz:Math.sin(angle)};
}
