import * as T from '../three.min.mjs';
import {lanternDesign} from './lantern-designs.mjs';
import {roundedBlock} from './lantern-geometry.mjs';

// All outlines below are authored for the lantern world: folded contracts,
// calibration marks, caged lamp cores and open-backed copper mechanisms.
const PI=Math.PI,TAU=PI*2,up=new T.Vector3(0,1,0);
export function buildWeapon(weapon,finishes){
  const root=new T.Group(),d=lanternDesign(weapon),variant=d.seed%7,form=d.form;
  root.name=d.name;root.userData.finishes=finishes;root.userData.originalSignature=d.id+':'+variant+':'+form;
  const box=roundedBlock(.10,3),orb=new T.SphereGeometry(1,12,8),cylinder=new T.CylinderGeometry(1,1,1,10),diamond=new T.OctahedronGeometry(1),ring=new T.TorusGeometry(1,.07,5,28);
  const put=(geo,mat,x,y,z,sx=1,sy=sx,sz=sx,parent=root)=>{
    const mesh=new T.Mesh(geo,finishes[mat]);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;
  };
  const block=(mat,x,y,z,sx,sy,sz,parent=root)=>put(box,mat,x,y,z,sx,sy,sz,parent);
  const rod=(mat,a,b,r=.025,parent=root)=>{
    const start=new T.Vector3(...a),end=new T.Vector3(...b),axis=end.clone().sub(start);
    const m=put(cylinder,mat,...start.clone().lerp(end,.5),r,axis.length(),r,parent);
    m.quaternion.setFromUnitVectors(up,axis.normalize());return m;
  };
  const loop=(mat,x,y,z,r,turn=0,parent=root)=>{const m=put(ring,mat,x,y,z,r,r,r,parent);m.rotation.y=turn;return m;};
  const plate=(points,mat,depth=.055,z=0,parent=root)=>{
    const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.012,bevelSize:.013,bevelSegments:2,curveSegments:4});g.translate(0,0,-depth/2);
    return put(g,mat,0,0,z,1,1,1,parent);
  };
  const core=(x,y,z=.01,r=.10,parent=root)=>{
    put(diamond,'core',x,y,z,r,r*1.45,r,parent);
    for(const side of [-1,1]){rod('trim',[x+side*r*1.34,y-r*1.3,z],[x+side*r*1.34,y+r*1.3,z],.012,parent);}
    loop('trim',x,y,z,r*1.52,0,parent);
  };
  const handle=(low=-.73,high=.42,r=.048)=>{
    rod('dark',[0,low,0],[0,high,0],r);
    for(let i=0;i<7;i++){const y=low+.07+i*.056;const m=put(ring,i%3?'patina':'trim',0,y,0,r*1.10,r*.85,r*1.1);m.rotation.x=PI/2;}
    put(diamond,'trim',0,low-.025,0,r*1.44,r*1.8,r*1.44);
  };
  const teeth=(left,right,y,z=.05,count=7)=>{
    for(let i=0;i<count;i++){const x=T.MathUtils.lerp(left,right,i/(count-1));block(i%3?'trim':'core',x,y+(i%3)*.012,z,.014,.048,.012);}
  };
  const cage=(x,y,r=.20,h=.43,parent=root)=>{
    for(const s of [-1,1]){block('trim',x,y+s*h/2,0,r*1.9,.031,r*.72,parent);}
    for(const sx of [-1,1])for(const sz of [-1,1])rod('body',[x+sx*r*.78,y-h/2,sz*r*.32],[x+sx*r*.78,y+h/2,sz*r*.32],.019,parent);
    core(x,y,0,r*.55,parent);
  };

  if(['sword','curve','seven','scythe'].includes(form)){
    handle(form==='scythe'?-.94:-.73,.28);
    block('trim',0,-.02,.015,.53,.065,.14).rotation.z=(variant-3)*.035;
    if(form==='seven'){
      for(let i=0;i<5;i++){
        const panel=plate([[-.06,.12],[-.08,.70],[0,.93],[.07,.67],[.06,.16]],i%2?'hardened':'edge',.041,.025);
        panel.rotation.z=(i-2)*(.17+variant*.013);panel.position.y=-.06;
      }
    }else if(form==='curve'||form==='scythe'){
      const scythe=form==='scythe';
      plate([[0,.15],[-.10,.48],[-.03,.78],[.18,.89],[.49,.71],[.69,.35],[.31,.55],[.19,.56],[.12,.29]],'edge',.07);
      plate([[.02,.27],[.03,.67],[.18,.77],[.44,.64],[.20,.67],[.13,.46]],'body',.076,.02);
      if(scythe){root.scale.x=1.18;rod('trim',[0,-.03,0],[-.14,.69,0],.026);}
    }else{
      const span=.13+variant*.012;
      plate([[-span,.10],[-span*.78,.69],[.03,.98],[span,.66],[span,.12],[.05,.18]],'edge',.078);
      plate([[-.075,.18],[-.06,.66],[.015,.85],[.065,.63],[.045,.22]],'body',.084,.015);
      for(let i=0;i<5;i++)block('trim',.015,.23+i*.082,.065,.047,.012,.016).rotation.z=-.35;
    }
    core(0,.10,.075,.071);teeth(-.20,.20,-.018,.09,5);
  }else if(['spear','halberd','trident','staff','cane','bell'].includes(form)){
    handle(-1.0,.43,.043);rod('body',[0,-.52,0],[0,.73,0],.052);
    for(const y of [-.53,.23,.43]){const m=put(ring,'trim',0,y,0,.071,.071,.071);m.rotation.x=PI/2;}
    if(form==='spear'||form==='trident'){
      plate([[-.12,.40],[-.075,.77],[0,1.10],[.075,.77],[.12,.40],[0,.49]],'edge',.065);
      if(form==='trident')for(const side of [-1,1]){
        const p=plate([[-.045,.45],[-.055,.82],[.045,.94],[.032,.57],[.11,.42]],'body',.055);p.position.x=side*.19;p.scale.x=side;
      }
      cage(0,.44,.10,.27);
    }else if(form==='halberd'){
      plate([[-.05,.40],[-.40,.66],[-.25,.97],[-.12,.74],[.06,.85],[.26,.96],[.41,.65],[.16,.55],[.08,.36]],'edge',.072);
      cage(0,.57,.15,.31);rod('trim',[-.25,.71,.04],[.25,.71,.04],.017);
    }else{
      const radius=form==='bell'?.30:.23;
      cage(0,.60,radius,.47);loop('edge',0,.62,.015,radius*1.32);
      if(form==='staff')for(const s of [-1,1])rod('trim',[s*.10,.29,0],[s*.26,.82,0],.032);
      if(form==='cane')rod('edge',[.10,.40,0],[.29,.91,0],.022);
      if(form==='bell'){
        for(let i=0;i<5;i++){const a=i*TAU/5;rod('trim',[Math.cos(a)*.22,.77,Math.sin(a)*.14],[Math.cos(a)*.32,.38,Math.sin(a)*.20],.022);}
        teeth(-.23,.23,.37,.10,7);
      }
    }
  }else if(form==='bow'){
    handle(-.16,.16,.050);
    const limbs=[];
    for(const side of [-1,1]){
      const limb=new T.Group();root.add(limb);limbs.push(limb);
      const p=plate([[0,0],[.22,side*.22],[.28,side*.54],[-.08,side*.86],[-.025,side*.54],[.04,side*.23],[-.06,0]],'body',.07,0,limb);
      p.rotation.z=(variant-3)*.016;
      rod('edge',[.05,side*.13,.055],[.13,side*.47,.055],.018,limb);
      core(.13,side*.29,.065,.055,limb);
      for(let i=0;i<3;i++)block('trim',.14,side*(.41+i*.09),.054,.05,.018,.022,limb);
    }
    const stringGeometry=new T.BufferGeometry().setFromPoints([new T.Vector3(-.06,.82,0),new T.Vector3(-.03,0,.02),new T.Vector3(-.06,-.82,0)]);
    const string=new T.Line(stringGeometry,new T.LineBasicMaterial({color:d.palette[1]}));root.add(string);
    const arrow=new T.Group();root.add(arrow);rod('edge',[-.75,0,.035],[.19,0,.035],.012,arrow);put(diamond,'core',-.78,0,.035,.09,.032,.032,arrow);
    root.userData.bow={limbs,string,arrow};root.userData.launch={bow:true,tip:[-.78,0,.035]};
  }else if(['gun','crossbow'].includes(form)){
    handle(-.63,.30,.055);
    block('dark',0,-.18,-.05,.24,.68,.17);block('body',0,.19,.025,.24,.54,.23);
    for(const side of [-1,1])rod('edge',[side*.067,.25,.025],[side*.067,.90,.025],.032);
    block('trim',0,.91,.025,.25,.051,.27);core(0,.27,.17,.077);
    teeth(-.08,.08,.49,.16,5);
    if(form==='crossbow')for(const side of [-1,1]){
      plate([[0,.28],[side*.48,.34],[side*.64,.56],[side*.42,.49],[0,.43]],'edge',.041);
      rod('core',[0,.18,.045],[side*.58,.53,.045],.009);
    }
    else for(let i=0;i<4;i++)block('patina',0,.34+i*.105,-.105,.31,.035,.035);
    root.userData.launch={flat:true,tip:[0,.94,.025]};
  }else if(['ring','beads'].includes(form)){
    const r=form==='ring'?.48:.42;
    for(let i=0;i<8;i++){
      const a=i*TAU/8,part=put(form==='beads'?orb:box,i%3?'body':'trim',Math.cos(a)*r,Math.sin(a)*r,0,form==='beads'?.077:.15,form==='beads'?.087:.044,.075);
      part.rotation.z=a+PI/2;
      if(i%2===0)core(Math.cos(a)*r,Math.sin(a)*r,.065,.042);
    }
    loop('edge',0,0,0,r);loop('body',0,0,-.055,r*.84);
    rod('dark',[-.40,-.08,.02],[-.40,.18,.02],.039);teeth(-.18,.18,.41,.08,6);
  }else if(form==='lute'){
    handle(-.70,-.24,.06);
    plate([[-.34,-.34],[-.29,.49],[.08,.87],[.36,.45],[.29,-.36]],'body',.115);
    plate([[-.21,-.24],[-.20,.41],[.08,.68],[.23,.40],[.19,-.26]],'dark',.02,.075);
    for(let i=0;i<7;i++){const x=-.17+i*.054;rod('edge',[x,-.26,.105],[x,.47-Math.abs(x)*.25,.105],.005);}
    cage(0,-.36,.14,.14);teeth(-.24,.24,-.31,.09,7);
  }else if(['claw','fang','horn','feather','snake'].includes(form)){
    handle(-.55,.08,.060);cage(0,.17,.19,.30);
    const count=form==='feather'?5:form==='horn'?1:3;
    for(let i=0;i<count;i++){
      const x=(i-(count-1)/2)*.13,y=.28+Math.sin(i*1.7+variant)*.07;
      const spike=plate([[x-.047,y],[x-.045,y+.25],[x+.055,y+.61],[x+.095,y+.19],[x+.045,y]],i%2?'body':'edge',.055);
      spike.rotation.z=(i-(count-1)/2)*-.12;
      rod('trim',[x,y,.044],[x+.025,y+.24,.044],.012);
    }
    if(form==='snake')for(let i=0;i<7;i++){const a=i*.65;put(orb,i%2?'patina':'body',Math.sin(a)*.17,.20+i*.085,.04,.09,.10,.065);}
  }else if(form==='axe'){
    handle(-.85,.57,.056);
    plate([[-.07,.37],[-.49,.42],[-.58,.75],[-.29,.93],[-.23,.66],[.06,.70],[.34,.89],[.40,.54],[.09,.40]],'edge',.10);
    cage(0,.54,.12,.27);teeth(-.47,-.18,.54,.075,5);
  }else{
    handle(-.58,-.17,.053);cage(0,.18,.27,.64);
    for(const side of [-1,1]){
      plate([[side*.07,-.04],[side*.36,.13],[side*.31,.47],[side*.10,.58],[side*.16,.28]],'body',.057,0);
      rod('trim',[side*.11,.49,.055],[side*.23,.15,.055],.014);
    }
    if(form==='doll'){put(orb,'edge',0,.66,.005,.13,.15,.11);block('core',0,.67,.107,.14,.023,.025);}
    if(form==='talisman')plate([[-.21,-.42],[-.27,.38],[.24,.48],[.21,-.35],[.04,-.24]],'edge',.018,-.08);
  }
  // Distinct maker's stamp on the front and back of every relic.
  for(const z of [-.083,.083])for(let i=0;i<3+variant%3;i++){
    const rivet=put(diamond,i%2?'trim':'core',-.07+i*.034,-.18,z,.014,.024,.012);rivet.rotation.z=(variant+i)*.31;
  }
  root.userData.ownedGeometry=new Set();root.traverse(n=>{if(n.geometry)root.userData.ownedGeometry.add(n.geometry);});
  return root;
}

export function shapeBow(root,pull,nocked){
  const bow=root.userData.bow;if(!bow)return;
  bow.limbs.forEach((limb,i)=>{limb.rotation.z=(i?-1:1)*pull*.15;});
  bow.string.geometry.attributes.position.setXYZ(1,.15*pull,0,.02);bow.string.geometry.attributes.position.needsUpdate=true;
  bow.arrow.position.x=pull*.16;bow.arrow.visible=!!nocked;
}

export function disposeWeapon(root){
  const geometries=new Set(),materials=new Set(Object.values(root.userData.finishes??{}));
  root.traverse(node=>{if(node.geometry)geometries.add(node.geometry);if(node.isLine)materials.add(node.material);});
  for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
}
