import * as T from '../three.min.mjs';
import {sculptPao} from './pao-sculpt.mjs?v=chiaroscuro-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const TAU=Math.PI*2;
const sides=[-1,1];

const types={
  m095:{
    cut:[1.14,1.00,1.26,.94,1.12],twist:[.31,-.27,.32,-.34,.25],skin:'reefViolet',tissue:'reefVein',cap:'reefCalcite',
    dorsal:'reefAmethyst',tendril:'reefGill',tip:'reefCalcite',angle:-.47,tint:0x89dad8,shape:'ribbons',
  },
  m096:{
    cut:[1.23,1.07,1.13,1.02,1.17],twist:[-.19,.24,-.12,.27,-.24],skin:'reefBrass',tissue:'reefCarmine',cap:'reefPearl',
    dorsal:'reefGold',tendril:'reefVein',tip:'reefPearl',angle:-.30,tint:0xffb050,shape:'embers',
  },
};

const materialParameters={
  reefViolet:[0x77317d,.13,.71,'hide'],reefAmethyst:[0x9a51a4,.31,.55,'stone'],
  reefVein:[0xa74e43,.05,.74,'hide'],reefGill:[0x322a4b,.09,.81,'hide'],
  reefCalcite:[0x8fc3c2,.22,.55,'bone'],reefBrass:[0xb97628,.58,.45,'bronze'],
  reefGold:[0xe5af57,.63,.45,'bronze'],reefCarmine:[0x962c24,.11,.66,'hide'],
  reefPearl:[0xe4c89e,.19,.56,'bone'],reefAqua:[0x8fd5d4,.13,.43,'gem'],
  reefBlack:[0x211824,.04,.83,'hide'],reefCrest:[0x643a44,.11,.66,'stone'],
};

export function seaStarFinishes(id){
  const type=types[id];
  if(!type)return {};
  const names=new Set([type.skin,type.tissue,type.cap,type.dorsal,type.tendril,type.tip,'reefAqua','reefBlack','reefCrest']);
  return Object.fromEntries(Array.from(names,name=>[name,materialParameters[name]]));
}

const tube=(k,parent,finish,path,mobile,section=2.19)=>k.geometry(parent,finish,
  sculptVolume(path,{sides:mobile?9:14,rings:mobile?9:15,section,ridge:.19}));
const seam=(k,parent,finish,path,steps=9)=>k.sculpt.sweep(parent,finish,path,{steps,sides:6,ridge:.20});
const plate=(k,parent,finish,path,depth=.031)=>k.sculpt.plate(parent,finish,path,depth,.012);
const mirrored=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);

function sculptHub(k,hub,type,gold,mobile){
  tube(k,hub,type.skin,[[0,0,-.369,.11,.115],[0,0,-.276,.305,.329],[0,0,-.181,.433,.429],
    [0,0,-.045,.465,.458],[0,0,.119,.389,.391],[0,0,.202,.273,.264]],mobile,2.12);
  tube(k,hub,'reefCrest',[[0,0,-.438,.08,.086],[0,0,-.387,.208,.204],[0,0,-.305,.302,.298]],mobile,2.4);
  const ventral=[],dorsal=[];
  for(let i=0;i<5;i++){
    const a=i*TAU/5;
    const hinge=k.bone(hub,Math.sin(a)*.124,Math.cos(a)*.124,.223);
    hinge.rotation.z=-a;
    const shape=[[-.093,.035,-.026],[-.102,.181,-.049],[.003,.260,-.071],
      [.108,.140,-.018],[.084,.031,.007],[.015,-.036,.045],[-.039,-.034,.035]];
    plate(k,hinge,type.tissue,shape,.039);
    seam(k,hinge,type.cap,[[.090,.143,.002,.020],[.083,.083,.041,.031],[.041,.024,.077,.026],[.006,-.028,.102,.003]]);
    seam(k,hinge,type.cap,[[-.079,.120,-.008,.019],[-.066,.067,.033,.027],[-.031,.008,.058,.023],
      [-.019,-.017,.089,.003]]);
    ventral.push(hinge);
    const star=k.bone(hub,0,0,-.296);
    star.rotation.z=-a;
    const arm=[[.025,.082,-.060],[-.098,.169,-.073],[-.16,.306,-.029],[-.121,.373,.039],
      [-.009,.452,.077],[.093,.345,.019],[.124,.232,-.042],[.082,.14,-.085]];
    plate(k,star,type.dorsal,arm,.059);
    seam(k,star,type.tissue,[[0,.084,-.106,.027],[-.047,.197,-.114,.030],
      [-.039,.291,-.088,.021],[.011,.407,.019,.006]],10);
    for(const side of sides){
      const finger=mirrored(side,[[.042,.166,-.094,.011],[.078,.233,-.113,.023],[.127,.295,-.057,.022],
        [.147,.329,-.014,.004]]);
      seam(k,star,type.cap,finger,7);
    }
    dorsal.push(star);
  }
  const mouth=k.bone(hub,0,0,.248);
  tube(k,mouth,'reefBlack',[[0,0,-.084,.098,.103],[0,0,-.021,.135,.122],[0,0,.018,.118,.111]],mobile);
  tube(k,mouth,type.tissue,[[0,0,-.024,.072,.048],[0,.024,.009,.060,.044],[.014,.01,.055,.045,.032],
    [0,-.017,.069,.024,.017]],mobile);
  const pore=k.bone(hub,0,0,-.428);
  for(let i=0;i<(mobile?6:9);i++){
    const a=i*TAU/(mobile?6:9),x=Math.sin(a)*.126,y=Math.cos(a)*.126;
    k.mesh(pore,'gem',i%3===0?'reefAqua':type.cap,x,y,-.012,.041,.074,.025,0,0,-a);
  }
  k.mesh(pore,'pearl','reefBlack',0,0,-.032,.097,.100,.066);
  k.mesh(pore,'pearl',gold?'reefAqua':type.tissue,.021,-.019,-.066,.031,.035,.024);
  return {mouth,ventral,dorsal,pore};
}

function profile(type,index,gold){
  const slender=!!(index%2),digit=Math.floor(index/2);
  const length=type.cut[digit]*(slender?(gold?.79:.84):1.10);
  const bend=type.twist[digit]*(slender?-1.36:1);
  const width=slender?(gold?.066:.087):(gold?.174:.196);
  const swept=slender?(gold?.13:.09):(gold?.20:.12);
  return {
    slender,length,bend,width,
    sections:[
      [0,-.084,0,width*.64,width*.56],[bend*.08,length*.12,.032,width,width*.71],
      [bend*.33,length*.40,-.052,width*.92,width*.57],[bend*.92,length*.66,-.069,width*.69,width*.49],
      [bend*.98,length*.91,swept,width*.40,width*.40],[bend*.43,length,slender?swept+.15:swept+.074,width*.29,width*.37],
      [bend*.26,length*(slender?.93:.995),slender?swept+.22:swept+.102,width*.17,width*.20],
    ],
  };
}

function buildArm(k,hub,bones,skinData,type,{index,form,gold,mobile}){
  const {sections,slender,bend,width}=form;
  const a=index*TAU/10;
  const stance=k.bone(hub,Math.sin(a)*(slender?.264:.263),Math.cos(a)*(slender?.264:.263),slender?-.056:.020);
  stance.name='海星 · '+(index+1)+'號腕';
  stance.rotation.z=-a;
  stance.updateMatrix();
  const curve=new T.CatmullRomCurve3(sections.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.43);
  const anchor=[0,.34,.67,1].map(t=>curve.getPoint(t));
  const first=bones.length;
  const arm=[];
  let parent=stance;
  for(const [i,p] of anchor.entries()){
    const joint=new T.Bone();
    joint.position.copy(p);
    if(i)joint.position.sub(anchor[i-1]);
    joint.name='海星 · '+(index+1)+'號腕骨 '+(i+1);
    parent.add(joint);
    bones.push(joint);arm.push(joint);parent=joint;
  }
  const rows=slender?(mobile?12:21):(mobile?18:27),around=slender?(mobile?8:10):(mobile?12:16);
  const radius=new T.CatmullRomCurve3(sections.map(([, , ,x,z])=>new T.Vector3(x,z,0)),false,'catmullrom',.44);
  const tangent=new T.Vector3(),across=new T.Vector3(),radial=new T.Vector3(),v=new T.Vector3();
  const starts=skinData.positions.length/3;
  for(let row=0;row<=rows;row++){
    const t=row/rows,local=t*(anchor.length-1),joint=Math.min(anchor.length-2,Math.floor(local));
    const blend=T.MathUtils.smoothstep(local-joint,0,1);
    const p=curve.getPoint(t),size=radius.getPoint(t);
    curve.getTangent(t,tangent);
    across.set(1,0,0).addScaledVector(tangent,-tangent.x).normalize();
    radial.crossVectors(across,tangent).normalize();
    for(let j=0;j<=around;j++){
      const angle=j*TAU/around,cos=Math.cos(angle),sin=Math.sin(angle);
      const spine=Math.cos(t*43+j*1.2+index*.61)*.15+Math.sin(t*28+j*.76)*.10;
      const ridge=.16*Math.cos(t*41+index*.8)*cos*cos+.13*Math.cos(angle*6-t*2.3);
      v.copy(p).addScaledVector(across,cos*Math.max(.006,size.x)*(1+ridge));
      v.addScaledVector(radial,sin*Math.max(.005,size.y)*(1+ridge)+.023*Math.pow(Math.abs(sin),6)*sin);
      v.applyMatrix4(stance.matrix);
      skinData.positions.push(...v.toArray());
      skinData.uv.push(j/around,t);
      const shade=(sin>0?.86:.58)+ridge*.78+spine+(sin>0?.09:.013)*Math.cos(t*28+j*.76);
      skinData.colors.push(shade,shade*(gold?1.01:.947),shade*(gold?.91:1.03));
      skinData.joints.push(first+joint,first+joint+1,0,0);
      skinData.weights.push(1-blend,blend,0,0);
      if(row>0&&j>0){
        const q=starts+row*(around+1)+j,w=q-around-1;
        skinData.indices.push(w-1,q-1,w,w,q-1,q);
      }
    }
  }

  for(const [n,joint] of arm.entries()){
    if(n===3)continue;
    const length=anchor[n+1].y-anchor[n].y,offset=anchor[n+1].x-anchor[n].x;
    const thick=width*(1-.18*n);
    const y=length*.36;
    const ridge=slender?type.cap:type.dorsal;
    for(const side of sides){
      const scale=mirrored(side,[[.023,.034,.066],[thick*.74,.052,.050],[thick*.98,y*.91,.031],
        [thick*.58,y*2.11,.038],[thick*.18+side*offset*.34,y*2.34,.076],[.023,y*1.03,.116]]);
      if(!slender)plate(k,joint,ridge,scale,.027);
      const vein=mirrored(side,[[thick*.37,.025,.067,.015],[thick*.42,y,.079,.021],
        [thick*.22+side*offset*.31,y*2.16,.064,.013],[thick*.15+side*offset*.59,length*.91,.046,.004]]);
      seam(k,joint,type.tissue,vein,8);
      if(!gold&&!slender)seam(k,joint,'reefCalcite',mirrored(side,[
        [thick*.81,.033,.061,.011],[thick*1.07,y*.89,.037,.022],
        [thick*.66+side*offset*.30,y*2.02,.037,.017],[thick*.28+side*offset*.51,length*.94,.059,.003],
      ]),9);
      for(let pip=0;pip<(mobile?2:3);pip++){
        const st=(pip+1)/(mobile?3:4),sx=side*thick*(.35+.14*pip)+offset*st;
        const yy=length*st,z=-thick*(.48-.07*n);
        const prong=[[sx,yy-.03,z+.017,.024],[sx+side*.031,yy,z-.057,.026],
          [sx+side*.052,yy+.052,z-.077,.013],[sx+side*.067,yy+.078,z-.062,.004]];
        seam(k,joint,slender?type.tissue:type.cap,prong,6);
      }
    }
    if(!slender){
      const keel=[[.012,.023,-.061],[-thick*.56,.06,-.076],[-thick*.67,y*.89,-.099],
        [offset*.24,y*2.36,-.101],[thick*.63+offset*.26,y*1.69,-.083],[thick*.53,.051,-.075]];
      plate(k,joint,type.tendril,keel,.034);
      seam(k,joint,type.cap,[[0,.016,-.113,.010],[offset*.20,y*.99,-.129,.025],[offset*.35,y*2.35,-.107,.004]],9);
    }
  }
  const tip=arm.at(-1);
  if(slender){
    tube(k,tip,type.tissue,[[0,-.024,-.02,.027,.031],[.009,.021,.018,.031,.028],
      [.035,.043,.046,.021,.019],[.054,.043,.065,.005,.005]],mobile);
  }else{
    tube(k,tip,type.tip,[[0,0,-.039,.043,.043],[0,0,.002,.079,.096],
      [0,.001,.039,.101,.103],[0,0,.077,.088,.086]],mobile);
    k.mesh(tip,'pearl','reefBlack',0,0,.071,.067,.072,.036);
    k.mesh(tip,'pearl','reefAqua',0,0,.113,.047,.051,.022);
    seam(k,tip,type.tissue,[[0,-.058,.107,.007],[.033,-.021,.125,.010],[.031,.025,.124,.011],[0,.05,.11,.005]],9);
  }
  return {stance,arm,index,a,slender,bend};
}

const newSkinData=()=>({positions:[],uv:[],colors:[],joints:[],weights:[],indices:[]});

function boundMesh(hub,skeleton,skinData,material,name){
  const geo=new T.BufferGeometry();
  geo.setIndex(skinData.indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(skinData.positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(skinData.uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(skinData.colors,3));
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinData.joints,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(skinData.weights,4));
  if(skinData.normals)geo.setAttribute('normal',new T.Float32BufferAttribute(skinData.normals,3));
  else geo.computeVertexNormals();
  const mesh=new T.SkinnedMesh(geo,material);
  mesh.name=name;
  mesh.frustumCulled=false;
  hub.add(mesh);
  mesh.updateWorldMatrix(true,false);
  mesh.bind(skeleton,mesh.matrixWorld);
}

function armDetailBatch(k){
  const pieces=[];
  const kit={
    bone:k.bone,sculpt:sculptPao(k),
    geometry(part,finish,geometry){pieces.push({part,finish,geometry});},
    mesh(part,_shape,finish,x,y,z,sx,sy,sz){
      const geometry=new T.IcosahedronGeometry(1,1);
      geometry.scale(sx,sy,sz).translate(x,y,z);
      kit.geometry(part,finish,geometry);
    },
  };
  return {
    kit,
    bind(hub,skeleton){
      kit.sculpt.finish(kit.geometry);
      const inverse=hub.matrixWorld.clone().invert(),byFinish=new Map();
      const joints=new Map(skeleton.bones.map((bone,index)=>[bone,index]));
      const transform=new T.Matrix4();
      for(const {part,finish,geometry} of pieces){
        geometry.applyMatrix4(transform.multiplyMatrices(inverse,part.matrixWorld));
        if(!byFinish.has(finish))byFinish.set(finish,{...newSkinData(),normals:[]});
        const data=byFinish.get(finish),base=data.positions.length/3;
        const {position,normal,uv,color}=geometry.attributes;
        if(geometry.index){
          for(const index of geometry.index.array)data.indices.push(base+index);
        }else{
          for(let index=0;index<position.count;index++)data.indices.push(base+index);
        }
        for(let vertex=0;vertex<position.count;vertex++){
          data.positions.push(position.getX(vertex),position.getY(vertex),position.getZ(vertex));
          data.normals.push(normal.getX(vertex),normal.getY(vertex),normal.getZ(vertex));
          data.uv.push(uv?.getX(vertex)??0,uv?.getY(vertex)??0);
          data.colors.push(color?.getX(vertex)??.93,color?.getY(vertex)??.93,color?.getZ(vertex)??.93);
          data.joints.push(joints.get(part),0,0,0);
          data.weights.push(1,0,0,0);
        }
        geometry.dispose();
      }
      for(const [finish,data] of byFinish)boundMesh(hub,skeleton,data,k.materials[finish],'海星 · 腕足附骨');
    },
  };
}

export function sculptSeaStar(k,entry,mobile){
  const gold=entry.id==='m096',type=types[entry.id];
  const body=k.bone(k.root,0,1.02,.015),hub=k.bone(body,0,0,0);
  hub.name='海星 · 中央盤';
  const {mouth,ventral,dorsal,pore}=sculptHub(k,hub,type,gold,mobile);
  const bones=[],skinData=newSkinData(),details=armDetailBatch(k);
  const arms=Array.from({length:10},(_,index)=>buildArm(details.kit,hub,bones,skinData,type,{
    index,form:profile(type,index,gold),gold,mobile,
  }));
  hub.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(bones);
  boundMesh(hub,skeleton,skinData,k.materials[type.skin],'海星 · 連續曲面腕足');
  details.bind(hub,skeleton);
  const tipLight=k.materials.reefAqua;
  tipLight.emissive.setHex(gold?0x68c2b9:0x67d7d2);
  tipLight.emissiveIntensity=.24;
  return {
    body,head:mouth,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,sourceSculpt:true,
    disposeRig:()=>skeleton.dispose(),
    polishEnergy:{tint:type.tint,shape:type.shape,anchor:hub,span:[1.23,1.39,.42]},
    cataloguePose({headtime,beat,wind,strike,travel,stage,fall}){
      const spin=headtime*(gold?.23:.31);
      tipLight.emissiveIntensity=.23+wind*.37+strike*.68+stage*.13;
      hub.rotation.set(type.angle-wind*.48+strike*.83-fall*.31,Math.sin(headtime*1.13)*.29,spin+strike*.38);
      for(const {stance,arm,index,a,slender,bend} of arms){
        const pulse=Math.cos(beat*.47-index*.62);
        stance.rotation.set(.145*pulse+wind*.36-strike*.50+travel*.24*Math.sin(beat+index),
          Math.sin(beat*.32-index*.47)*.15,-a+.23*Math.sin(beat*.36+index*.84)+stage*.08*bend);
        for(let j=0;j<arm.length;j++){
          const phase=beat*.42-index*.63-j*.81;
          const flex=slender?1.28:.87;
          arm[j].rotation.set(flex*(Math.sin(phase)*(.11+j*.10)+wind*(.15+j*.10)-strike*(.19+j*.074)),
            Math.cos(phase*.86)*(.12+j*.04)+strike*flex*.13,Math.sin(phase*.71)*(.11+j*.064)+wind*bend*.37);
        }
      }
      mouth.scale.setScalar(1+wind*.24+strike*.37+stage*.093);
      pore.rotation.z=spin*.26;
      for(const [i,gill] of ventral.entries())gill.rotation.x=(Math.sin(beat*.51+i)*.12+wind*.39-strike*.66);
      for(const [i,plate] of dorsal.entries())plate.rotation.x=Math.cos(beat*.38+i*.93)*.06+wind*.13-strike*.11;
    },
  };
}
