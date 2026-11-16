import * as T from '../three.min.mjs';

export function markEnemyWeapon(node,tip,{from=[0,0,0],width=.14,aim=true,kind='edge'}={}){
  node.userData.enemyWeapon={from,tip,width,aim,kind};
  return node;
}

export function enemyWeapons(root){
  const items=[];
  root.traverse(node=>{
    const mark=node.userData.enemyWeapon;
    if(!mark)return;
    const base=new T.Vector3(...mark.from),end=new T.Vector3(...mark.tip);
    items.push({node,base,end,axis:end.clone().sub(base).normalize(),width:mark.width,aim:mark.aim,kind:mark.kind??'edge',previous:null});
  });
  return items;
}

export function restoreWeaponPose(weapons){
  for(const weapon of weapons){
    if(weapon.previous)weapon.node.quaternion.copy(weapon.previous);
  }
}

const local=new T.Vector3(),current=new T.Vector3();
const inverse=new T.Matrix4(),alignment=new T.Quaternion(),identity=new T.Quaternion();

export function aimEnemyWeapons(weapons,attack,wind,strike,{thrust,sweep,crush,travel,heading}){
  for(const weapon of weapons){
    const {node,axis,aim}=weapon;
    weapon.previous??=new T.Quaternion();
    weapon.previous.copy(node.quaternion);
    if(!aim||!attack&&travel<.18)continue;
    let amount=attack?(strike?T.MathUtils.smoothstep(strike,0,.72):
      T.MathUtils.smoothstep(wind,.18,1)*(thrust?.76:.40)):travel*.61;
    const yaw=sweep?(strike?.65-strike*1.22:.52):0;
    const c=Math.cos(yaw),s=Math.sin(yaw);
    const lift=attack?(thrust?.07:sweep?.14:crush?(strike?-.25:.78):.34):.87;
    const dx=attack?.dx??Math.sin(heading),dz=attack?.dz??Math.cos(heading);
    local.set(dx*c+dz*s,lift,dz*c-dx*s);
    if(local.lengthSq()<.001)continue;
    node.parent.updateWorldMatrix(true,false);
    inverse.copy(node.parent.matrixWorld).invert();
    local.transformDirection(inverse);
    current.copy(axis).applyQuaternion(node.quaternion);
    if(!attack)amount*=T.MathUtils.smoothstep(-current.dot(local),-.18,.53);
    alignment.setFromUnitVectors(current,local);
    alignment.slerp(identity,1-amount);
    node.quaternion.premultiply(alignment);
  }
}
