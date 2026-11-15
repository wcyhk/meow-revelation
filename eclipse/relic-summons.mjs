import * as T from '../three.min.mjs';
import {forge,disposeForge} from './armory.mjs?v=emberlight-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const box=new T.BoxGeometry(1,1,1);
const sphere=new T.SphereGeometry(1,10,8);
const cone=new T.ConeGeometry(1,1,7);
const tube=new T.CylinderGeometry(1,1,1,10);
const rim=new T.TorusGeometry(1,.18,5,12);
const ingot=new T.IcosahedronGeometry(1,0);
const rootGeometry=new T.BufferGeometry();

function material(tint,opacity=1){
  return new T.MeshStandardMaterial({color:tint,emissive:tint,emissiveIntensity:.26,
    roughness:.53,metalness:.18,transparent:true,opacity});
}

function piece(group,geometry,surface,x,y,z,sx,sy,sz){
  const mesh=new T.Mesh(geometry,surface);
  mesh.position.set(x,y,z);
  mesh.scale.set(sx,sy,sz);
  group.add(mesh);
  return mesh;
}

function batch(parent,palette,owned){
  const vertex=new T.Vector3(),normal=new T.Vector3(),matrix=new T.Matrix3();
  for(const material of palette){
    const parts=parent.children.filter(part=>part.isMesh&&part.material===material);
    if(parts.length<2)continue;
    const position=[],normals=[];
    for(const part of parts){
      part.updateMatrix();
      matrix.getNormalMatrix(part.matrix);
      const geo=part.geometry;
      const vertices=geo.attributes.position,directions=geo.attributes.normal;
      for(let i=0;i<(geo.index?.count??vertices.count);i++){
        const index=geo.index?geo.index.getX(i):i;
        vertex.fromBufferAttribute(vertices,index).applyMatrix4(part.matrix);
        normal.fromBufferAttribute(directions,index).applyNormalMatrix(matrix);
        position.push(vertex.x,vertex.y,vertex.z);
        normals.push(normal.x,normal.y,normal.z);
      }
      part.removeFromParent();
      if(owned.includes(geo)){owned.splice(owned.indexOf(geo),1);geo.dispose();}
    }
    const geometry=new T.BufferGeometry()
      .setAttribute('position',new T.Float32BufferAttribute(position,3))
      .setAttribute('normal',new T.Float32BufferAttribute(normals,3));
    owned.push(geometry);
    parent.add(new T.Mesh(geometry,material));
  }
}

export function summonModel(view,weapon,point,duration){
  const body=view.addEffect(rootGeometry,{...point,y:.03},weapon.tone,duration,
    {opacity:1,order:70});
  body.combatClock=true;
  const root=body.mesh;
  root.name='神器召喚 · '+weapon.id;
  const ink=material(weapon.tone,.93), edge=material(0xe6dcbe,.95), shadow=material(0x42384e,.94);
  const metal=new T.MeshStandardMaterial({color:0xad9f88,metalness:.68,roughness:.33,emissive:0x3a3a38,
    emissiveIntensity:.38,transparent:true});
  const flame=material(weapon.tone);
  flame.emissiveIntensity=1.05;
  const colors=[ink,edge,shadow,metal,flame],unique=[],joints=[];
  let rifle;
  const p=(geo,surface,x,y,z,sx,sy,sz)=>piece(root,geo,surface,x,y,z,sx,sy,sz);
  const group=(x,y,z)=>{
    const joint=new T.Group();
    joint.position.set(x,y,z);
    root.add(joint);
    joints.push(joint);
    return joint;
  };
  const form=(parent,surface,path,section=2.3)=>{
    const shape=sculptVolume(path,{sides:view.mobile?9:13,rings:view.mobile?11:17,section,ridge:.19});
    unique.push(shape);
    return piece(parent,shape,surface,0,0,0,1,1,1);
  };
  if(weapon.id==='western-rifle'){
    const coat=group(0,.76,-.02),head=group(.060,1.10,0);
    form(coat,shadow,[[.01,-.63,0,.35,.34],[-.02,-.50,-.023,.41,.37],[-.04,-.20,-.018,.34,.31],
      [.01,.072,0,.212,.19],[.029,.21,0,.14,.15]]);
    form(head,ink,[[0,-.187,0,.133,.153],[.023,-.116,0,.163,.157],[.02,.022,0,.181,.167],[-.013,.142,0,.154,.16]]);
    form(head,shadow,[[.010,.166,0,.330,.323],[.006,.210,0,.337,.332],[-.020,.247,0,.185,.175],
      [-.051,.408,0,.139,.147],[-.043,.442,0,.10,.10]]);
    piece(head,tube,metal,-.027,.251,0,.197,.044,.188);
    piece(head,ingot,edge,.185,-.11,0,.098,.063,.085);
    for(const side of [-1,1]){
      p(box,ink,-.07,.19,side*.12,.16,.34,.15);
      p(ingot,metal,.017,.085,side*.128,.172,.12,.14);
      piece(head,ingot,flame,.192,-.009,side*.086,.032,.019,.031);
      const arm=group(.109,.844,side*.213);
      form(arm,ink,[[.186,-.16,side*.009,.073,.079],[.087,-.108,side*.088,.116,.090],
        [-.012,-.019,side*.071,.129,.123],[-.103,.038,0,.109,.105]]);
      piece(arm,ingot,edge,.170,-.15,0,.064,.058,.062);
      piece(arm,rim,metal,.135,-.136,0,.060,.060,.12).rotation.y=Math.PI/2;
      for(let i=0;i<4;i++){
        const z=side*(.171+i*.043),y=-.061-i*.129,x=-.21+i*.011;
        piece(coat,box,i%2?metal:ink,x,y,z,.024,.122,.073).rotation.x=side*.14;
      }
    }
    rifle=forge(weapon);
    rifle.position.set(.16,.88,.16);
    rifle.rotation.set(0,Math.PI,-Math.PI/2,'ZYX');
    rifle.scale.setScalar(.72);
    root.add(rifle);
  }else if(weapon.id==='turtle-bow'){
    form(root,shadow,[[0,.21,0,.52,.48],[0,.39,0,.70,.52],[0,.56,0,.67,.52],[0,.67,0,.48,.40]],3.7);
    form(root,ink,[[0,.39,0,.58,.51],[0,.57,0,.62,.47],[.020,.81,0,.47,.35],
      [.054,.98,0,.22,.22],[.08,1.032,0,.067,.074]],2.9);
    p(sphere,edge,.65,.49,0,.242,.148,.207);
    for(const side of [-1,1]){
      p(box,shadow,0,.219,side*.51,1.18,.24,.21);
      p(ingot,flame,.775,.555,side*.120,.045,.025,.034);
      for(const x of [-.43,0,.43]){
        p(tube,metal,x,.23,side*.517,.194,.215,.198).rotation.x=Math.PI/2;
        p(rim,edge,x,.23,side*.638,.130,.133,.108);
        p(ingot,flame,x,.23,side*.649,.038,.041,.026);
      }
    }
    for(let i=0;i<(view.mobile?5:7);i++){
      const a=i*6.283/(view.mobile?5:7),x=.41*Math.cos(a),z=.39*Math.sin(a);
      p(ingot,metal,x,.71,z,.225,.067,.19).rotation.set(z*.69,a,-x);
      p(ingot,flame,x,.768,z,.043,.021,.035);
    }
    const turret=group(.23,.863,0);
    piece(turret,tube,metal,.28,.09,0,.102,.70,.106).rotation.z=-Math.PI/2;
    piece(turret,tube,edge,.65,.09,0,.147,.135,.141).rotation.z=-Math.PI/2;
    piece(turret,rim,flame,.721,.09,0,.10,.10,.108).rotation.y=Math.PI/2;
  }else if(weapon.id==='oni-bow'){
    form(root,shadow,[[0,.06,0,.25,.29],[-.013,.28,0,.42,.39],[.026,.48,0,.38,.36],
      [.065,.738,0,.44,.45],[.103,.94,0,.218,.221]]);
    const head=group(.264,1.11,0);
    form(head,ink,[[-.035,-.27,0,.207,.25],[.003,-.149,0,.298,.31],[.052,-.022,0,.34,.324],
      [0,.143,0,.21,.205],[-.037,.219,0,.108,.13]]);
    form(head,edge,[[.044,.083,0,.113,.109],[.064,.252,0,.102,.088],[.144,.399,0,.063,.057],
      [.189,.519,0,.022,.026],[.211,.548,0,.004,.005]]);
    piece(head,sphere,shadow,.304,-.178,0,.061,.075,.241);
    for(const side of [-1,1]){
      const arm=group(.102,.718,side*.347);
      form(arm,ink,[[0,.095,0,.14,.151],[.101,.026,side*.063,.221,.151],
        [.25,-.149,side*.166,.157,.104],[.373,-.270,side*.127,.092,.095]]);
      piece(arm,ingot,metal,.083,.084,side*.057,.19,.129,.152);
      for(let i=0;i<3;i++)piece(arm,cone,edge,.467,-.246-i*.042,side*(.053+i*.057),
        .032,.126,.032).rotation.z=-Math.PI*.49;
      const z=side*.189;
      piece(head,ingot,metal,.176,.069,z,.151,.091,.121);
      piece(head,ingot,flame,.313,.005,z,.056,.029,.027);
      piece(head,cone,edge,.326,-.196,z*.75,.052,.173,.057).rotation.z=.26;
    }
  }else{
    const snakes=weapon.id==='snake'?3:1;
    for(let index=0;index<snakes;index++){
      const z=(index-(snakes-1)/2)*.53,s=snakes===1?1.19:.81;
      const coil=group(0,0,z);
      form(coil,ink,[[.258,.14,0,.085,.083],[-.12,.098,.186,.103,.109],[-.48,.097,.148,.114,.111],
        [-.54,.104,-.201,.14,.136],[-.28,.151,-.38,.137,.151],[.209,.236,-.195,.146,.128],
        [.311,.478,-.048,.152,.125],[.487,.685,.03,.159,.131]].map(p=>p.map(v=>v*s)),2.60);
      form(coil,shadow,[[.40,.68,.03,.148,.125],[.493,.68,.04,.173,.137],[.583,.649,.03,.128,.107],
        [.676,.615,.033,.060,.075]].map(p=>p.map(v=>v*s)),2.31);
      for(let i=0;i<(view.mobile?4:6);i++){
        const t=i/(view.mobile?4:6),x=(-.42+.61*t)*s,y=(.225+.18*t*t)*s;
        piece(coil,ingot,i%2?ink:metal,x,y,-.20*Math.sin(t*Math.PI),.093,.073,.095).rotation.z=.24+t*.62;
      }
      for(const side of [-1,1]){
        const f=snakes===1?flame:metal;
        form(coil,f,[[.45,.65,side*.08,.035,.042],[.35,.75,side*.16,.059,.051],
          [.25,.897,side*.24,.05,.046],[.162,.978,side*.32,.004,.007]].map(p=>p.map(v=>v*s)));
        piece(coil,ingot,flame,.605*s,.695*s,side*.109*s,.039,.023,.033);
        piece(coil,cone,edge,.649*s,.553*s,side*.091*s,.031,.135,.030).rotation.z=Math.PI;
      }
    }
  }
  for(const part of [root,...joints])batch(part,colors,unique);
  body.animate=age=>{
    const fade=Math.min(1,body.age*8,(1-age)*5);
    for(const surface of colors)surface.opacity=fade*.93;
    for(const [i,joint] of joints.entries())joint.rotation.y=Math.sin(body.age*7+i*1.02)*.10;
    if(rifle){
      const recoil=Math.max(0,1-(body.age-(body.fired??-10))*9);
      rifle.position.x=.16-recoil*.13;
      rifle.rotation.z=-Math.PI/2+recoil*.21;
      rifle.visible=fade>.18;
    }
  };
  body.cleanup=()=>{
    colors.forEach(surface=>surface.dispose());
    unique.forEach(geometry=>geometry.dispose());
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
