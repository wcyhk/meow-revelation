import * as T from '../three.min.mjs';

export function markEnemyWeapon(node,tip,{from=[0,0,0],width=.14,aim=true,kind='edge'}={}){
  node.userData.enemyWeapon={from,tip,width,aim,kind};
  return node;
}

const partBox=new T.Box3(),physicalBox=new T.Box3(),intersectionBounds=new T.Box3();
const transform=new T.Matrix4(),inverse=new T.Matrix4(),basis=new T.Matrix3(),localTransform=new T.Matrix4();
const vertex=new T.Vector3(),relative=new T.Vector3(),weaponVertex=new T.Vector3();

function physicalMesh(mesh){
  return mesh.isMesh&&!mesh.isSkinnedMesh&&!mesh.material?.transparent&&!!mesh.geometry?.attributes.position;
}

function jointBounds(joint){
  const bounds=new T.Box3();
  for(const mesh of joint.children){
    if(!physicalMesh(mesh)||mesh.userData.enemyWeapon)continue;
    mesh.geometry.computeBoundingBox();
    mesh.updateMatrix();
    bounds.union(partBox.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrix));
  }
  if(bounds.isEmpty())return null;
  // Keep the protective volume inside the outer edge of bevels and drapery.
  const min=bounds.min.clone().lerp(bounds.max,.065);
  bounds.max.lerp(bounds.min,.065);
  bounds.min.copy(min);
  return {joint,bounds};
}

function buildGrip(node,root,rig){
  const path=[];
  for(let joint=node;joint&&joint!==root&&joint!==rig.body;joint=joint.parent)path.push(joint);
  const shoulder=path.find(joint=>rig.arms?.includes(joint))??
    path.findLast(joint=>joint!==node&&Math.abs(joint.position.x)>.135&&joint.position.y>.26);
  const index=path.indexOf(shoulder);
  const elbow=index>1?path[index-1]:null;
  const hand=index>2&&node.position.length()<.24?node.parent:node;
  const side=Math.sign(shoulder?.position.x??path.at(-1)?.position.x??1)||1;
  return {shoulder,elbow,hand,side,carrier:shoulder?.parent};
}

function weaponSections(node,base,end){
  const count=6;
  const sectionsByJoint=new Map();
  const mounted=new Set(Object.values(node.userData).filter(part=>part?.isObject3D&&!part.isLight));
  const axis=end.clone().sub(base);
  const length=axis.lengthSq()||1;
  node.updateWorldMatrix(true,true);
  inverse.copy(node.matrixWorld).invert();
  node.traverse(mesh=>{
    if(!physicalMesh(mesh))return;
    let joint=mesh;
    while(joint!==node&&!mounted.has(joint))joint=joint.parent;
    if(!sectionsByJoint.has(joint))sectionsByJoint.set(joint,Array.from({length:count},()=>new T.Box3()));
    const sections=sectionsByJoint.get(joint);
    transform.multiplyMatrices(inverse,mesh.matrixWorld);
    localTransform.copy(joint.matrixWorld).invert().multiply(mesh.matrixWorld);
    const positions=mesh.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      vertex.fromBufferAttribute(positions,i);
      weaponVertex.copy(vertex).applyMatrix4(transform);
      const progress=relative.copy(weaponVertex).sub(base).dot(axis)/length;
      vertex.applyMatrix4(localTransform);
      const first=T.MathUtils.clamp(Math.floor(progress*count-.26),0,count-1);
      const last=T.MathUtils.clamp(Math.floor(progress*count+.26),0,count-1);
      for(let section=first;section<=last;section++)sections[section].expandByPoint(vertex);
    }
  });
  return Array.from(sectionsByJoint,([joint,sections])=>({joint,sections:sections.filter(section=>!section.isEmpty())}));
}

export function enemyWeapons(root,rig){
  const items=[];
  const volumes=new Map();
  root.traverse(node=>{
    const mark=node.userData.enemyWeapon;
    if(!mark)return;
    const base=new T.Vector3(...mark.from),end=new T.Vector3(...mark.tip);
    const grip=buildGrip(node,root,rig);
    const colliders=[];
    const joints=new Set([rig.body,grip.carrier,...(rig.heads??[rig.head])]);
    for(const joint of joints){
      if(!joint||joint===root||joint===node)continue;
      if(!volumes.has(joint))volumes.set(joint,jointBounds(joint));
      if(volumes.get(joint))colliders.push(volumes.get(joint));
    }
    const pose=[...new Set([node,grip.hand,grip.shoulder,grip.elbow].filter(Boolean))].map(joint=>({joint,
      position:joint.position.clone(),rotation:joint.quaternion.clone()}));
    const sections=weaponSections(node,base,end);
    items.push({node,base,end,axis:end.clone().sub(base).normalize(),width:mark.width,aim:mark.aim,
      kind:mark.kind??'edge',grip,pose,sections,colliders,posed:false});
  });
  return items;
}

export function restoreWeaponPose(weapons){
  for(const weapon of weapons){
    if(!weapon.posed)continue;
    for(const {joint,position,rotation} of weapon.pose){
      joint.position.copy(position);
      joint.quaternion.copy(rotation);
    }
  }
}

const local=new T.Vector3(),current=new T.Vector3(),aimDirection=new T.Vector3();
const offset=new T.Vector3(),goal=new T.Vector3(),socket=new T.Vector3(),pivot=new T.Vector3();
const alignment=new T.Quaternion(),identity=new T.Quaternion(),guard=new T.Quaternion();

function pointWeapon({node,axis},direction,amount){
  node.parent.updateWorldMatrix(true,false);
  local.copy(direction).transformDirection(inverse.copy(node.parent.matrixWorld).invert());
  current.copy(axis).applyQuaternion(node.quaternion);
  alignment.setFromUnitVectors(current,local).slerp(identity,1-amount);
  node.quaternion.premultiply(alignment);
}

function clearance(weapon,collider){
  const {joint,bounds}=collider;
  weapon.node.updateWorldMatrix(true,false);
  joint.updateWorldMatrix(true,false);
  inverse.copy(joint.matrixWorld).invert();
  intersectionBounds.makeEmpty();
  for(const group of weapon.sections){
    if(group.joint!==weapon.node)group.joint.updateWorldMatrix(true,false);
    transform.multiplyMatrices(inverse,group.joint.matrixWorld);
    for(const section of group.sections){
      physicalBox.copy(section).applyMatrix4(transform);
      if(physicalBox.intersectsBox(bounds))intersectionBounds.union(physicalBox);
    }
  }
  if(intersectionBounds.isEmpty())return false;
  const side=weapon.grip.side;
  const outward=side>0?bounds.max.x-intersectionBounds.min.x:intersectionBounds.max.x-bounds.min.x;
  const ahead=bounds.max.z-intersectionBounds.min.z;
  offset.set(0,0,0);
  if(outward<ahead*1.20)offset.x=side*(outward+.028);
  else offset.z=ahead+.028;
  offset.applyMatrix3(basis.setFromMatrix4(joint.matrixWorld));
  return true;
}

function rollClearOfArmor(weapon,collider){
  const {node,axis,grip,kind}=weapon;
  guard.copy(node.quaternion);
  const reach=kind==='bow'?.31:.70;
  let bestRoll=0,bestDistance=offset.lengthSq();
  for(const roll of [grip.side*reach,-grip.side*reach]){
    node.quaternion.copy(guard);
    node.rotateOnAxis(axis,roll);
    const distance=clearance(weapon,collider)?offset.lengthSq()+.002:0;
    if(distance<bestDistance){
      bestDistance=distance;
      bestRoll=roll;
    }
    if(bestDistance===0)break;
  }
  node.quaternion.copy(guard);
  node.rotateOnAxis(axis,bestRoll);
  return clearance(weapon,collider);
}

function steerArm(weapon,delta){
  const {shoulder,elbow}=weapon.grip;
  if(!shoulder)return;
  weapon.node.getWorldPosition(goal).add(delta);
  for(const joint of [shoulder,elbow]){
    if(!joint)continue;
    joint.parent.updateWorldMatrix(true,false);
    inverse.copy(joint.parent.matrixWorld).invert();
    weapon.node.getWorldPosition(socket).applyMatrix4(inverse);
    pivot.copy(joint.position);
    current.copy(socket).sub(pivot);
    local.copy(goal).applyMatrix4(inverse).sub(pivot);
    if(current.lengthSq()<.005||local.lengthSq()<.005)continue;
    alignment.setFromUnitVectors(current.normalize(),local.normalize()).slerp(identity,joint===shoulder?.32:.14);
    joint.quaternion.premultiply(alignment);
  }
}

function separateGrip(weapon){
  const {hand}=weapon.grip;
  hand.parent.updateWorldMatrix(true,false);
  offset.applyMatrix3(basis.setFromMatrix4(inverse.copy(hand.parent.matrixWorld).invert()));
  hand.position.add(offset);
}

export function aimEnemyWeapons(weapons,attack,wind,strike,{thrust,sweep,crush,travel,heading,fall,frame}){
  if(weapons.length)frame?.updateWorldMatrix(true,false);
  for(const weapon of weapons){
    for(const {joint,position,rotation} of weapon.pose){
      position.copy(joint.position);
      rotation.copy(joint.quaternion);
    }
    weapon.posed=true;
    const side=weapon.grip.side;
    const yaw=sweep?side*(strike?strike*.83-.38:.42):side*(attack?.pattern?.startsWith('lance')?.035:.16);
    const c=Math.cos(yaw),s=Math.sin(yaw);
    const lift=weapon.kind==='bow'?.02:attack?(thrust?.075:sweep?.11:crush?(strike?-.21:1.05):.45):.58+wind*.30-travel*.22;
    const dx=attack?.dx??Math.sin(heading),dz=attack?.dz??Math.cos(heading);
    aimDirection.set(dx*c+dz*s,lift,dz*c-dx*s).normalize();
    if(frame)aimDirection.transformDirection(frame.matrixWorld);
    const directed=weapon.aim&&fall<.65;
    const amount=(attack?.pattern?.startsWith('lance')||strike>.30)?.99:.91;
    if(directed)pointWeapon(weapon,aimDirection,amount);
    for(const collider of weapon.colliders){
      if(!clearance(weapon,collider))continue;
      if(directed&&!rollClearOfArmor(weapon,collider))continue;
      steerArm(weapon,offset);
      if(directed)pointWeapon(weapon,aimDirection,1);
    }
    // The elbow takes the movement first. The wrist supplies any residual clearance.
    for(let pass=0;pass<3;pass++){
      let touched=false;
      for(const collider of weapon.colliders){
        if(!clearance(weapon,collider))continue;
        separateGrip(weapon);
        touched=true;
      }
      if(!touched)break;
    }
  }
}
