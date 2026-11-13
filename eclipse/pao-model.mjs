import * as T from '../three.min.mjs';
import {beardLocks,bracer,cuirass,rivenCloth,sculptPao,skull,wingJoint} from './pao-sculpt.mjs?v=chiaroscuro-1';
import {paoEnergy} from './pao-energy.mjs?v=chiaroscuro-1';

export const paoForms=new Set(['m025','m026','m098']);

// Wing coordinates are shared by the webbing and the raised metal-blue finger bones.
const wingBase=[0,.03,.02];
const elbow=[.51,.69,-.13];
const knuckle=[.71,1.29,-.16];
const fingerJoint=[1.18,1.18,-.19];
const tips=[[1.26,1.17,-.22],[2.13,-.32,-.36],[1.69,-.53,-.26],[1.24,-.60,-.18],[.49,-.45,-.01]];
const bays=[[1.72,.74,-.22],[1.87,-.01,-.23],[1.44,-.28,-.19],[.91,-.28,-.12]];

function membrane(wing,material,side,reach,frozen){
  const scaled=point=>[side*point[0]*reach,point[1],point[2]];
  const path=points=>new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...scaled(point))));
  const front=path([wingBase,elbow,knuckle,fingerJoint,tips[0]]);
  const outline=path(tips.flatMap((tip,index)=>index<bays.length?[tip,bays[index]]:[tip]));
  const vertices=[],pigments=[],uvs=[];
  const dark=new T.Color(frozen?0x121d29:0x35252b),russet=new T.Color(frozen?0x3b5262:0x7c5146);
  const silk=new T.Color(frozen?0xb5d1da:0xbc927b);
  const hem=path([tips.at(-1),[.21,-.33,0],wingBase]);
  const ragged=outline.getPoints(48).slice(0,-1);
  for(const [index,point] of ragged.entries()){
    const notch=Math.max(0,Math.cos(index*1.7+Math.sin(index*.6)))**5;
    point.y+=Math.sin(index*2.83)*.026+notch*.12*Math.sin(index*Math.PI/ragged.length);
    point.z+=Math.cos(index*4.12)*.015;
  }
  const edge=[...front.getPoints(16).slice(0,-1),...ragged,...hem.getPoints(8).slice(0,-1)];
  const points=edge.map(point=>new T.Vector2(point.x,point.y));
  const triangles=T.ShapeUtils.triangulateShape(points,[]);
  function push(point){
    const u=point.x*side/2.16,v=(point.y+.65)/2.3;
    const stretch=Math.sin(v*Math.PI);
    const fold=Math.sin(u*21+v*12.5+Math.sin(v*13)*.72);
    const shade=dark.clone().lerp(russet,.47+stretch*.39+fold*.09);
    const thread=Math.max(0,fold)**6*.18*stretch;
    const distanceFromTear=ragged.reduce((best,p)=>Math.min(best,(p.x-point.x)**2+(p.y-point.y)**2),1);
    const fray=Math.exp(-distanceFromTear*128)*(.44+.20*Math.sin(u*77+v*57));
    shade.lerp(silk,thread+fray);
    const camber=Math.sin(u*Math.PI*.9)*stretch*.105;
    vertices.push(point.x,point.y,point.z+fold*stretch*.026-camber);
    pigments.push(shade.r,shade.g,shade.b);
    uvs.push(u,v);
  }
  function patch(a,b,c,depth){
    if(depth===0){push(a);push(b);push(c);return;}
    const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
    patch(a,ab,ca,depth-1);patch(ab,b,bc,depth-1);
    patch(ca,bc,c,depth-1);patch(ab,bc,ca,depth-1);
  }
  for(const [a,b,c] of triangles){
    const normal=(edge[b].x-edge[a].x)*(edge[c].y-edge[a].y)-(edge[b].y-edge[a].y)*(edge[c].x-edge[a].x);
    patch(edge[a],edge[normal>0?b:c],edge[normal>0?c:b],1);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(pigments,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geometry.computeVertexNormals();
  const normals=geometry.attributes.normal;
  const joints=new Map();
  const keys=[];
  const normal=new T.Vector3();
  for(let i=0;i<normals.count;i++){
    const key=vertices.slice(i*3,i*3+3).map(value=>Math.round(value*100000)).join(',');
    if(!joints.has(key))joints.set(key,new T.Vector3());
    joints.get(key).add(normal.fromBufferAttribute(normals,i));
    keys.push(key);
  }
  for(const joint of joints.values())joint.normalize();
  for(const [index,key] of keys.entries()){
    const joint=joints.get(key);
    normals.setXYZ(index,joint.x,joint.y,joint.z);
  }
  wing.add(new T.Mesh(geometry,material));
  return scaled;
}

function buildWing(k,sculpt,hinge,side,awakened,frozen){
  const {rod,materials}=k;
  const reach=awakened?1.07:1;
  const project=membrane(hinge,materials.webbing,side,reach,frozen);
  const rib=(finish,from,to,width,shape)=>rod(hinge,finish,project(from),project(to),width,shape);
  const leading=[knuckle,fingerJoint,tips[0],bays[0],tips[1]];
  const tube=(points,size,segments,finish)=>{
    const line=new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...project(point))));
    const geometry=new T.TubeGeometry(line,segments,size,7,false);
    hinge.add(new T.Mesh(geometry,materials[finish]));
  };
  tube(leading,.062,21,'body');
  const layered=[...leading].map(([x,y,z])=>[x,y+.046,z+.047,.020]);
  sculpt.sweep(hinge,'wingEdge',layered.map(([x,y,z,r])=>[...project([x,y,z]),r,r*.63]),{sides:7,steps:21});
  for(const [index,tip] of tips.entries()){
    if(index===0)continue;
    const start=index<3?fingerJoint:knuckle;
    const bend=[start[0]*.39+tip[0]*.61,(start[1]+tip[1])*.5-.10,(start[2]+tip[2])*.5-.25];
    rib('deep',start,bend,.072-index*.006);
    rib('body',bend,tip,.060-index*.003,'horn');
    const ridge=[bend[0],bend[1]+.015,bend[2]+.245];
    const end=[tip[0],tip[1]+.025,tip[2]+.06];
    tube([[start[0],start[1],start[2]+.07],ridge,end],.043-index*.004,11,'body');
    rib('wingEdge',ridge,[end[0],end[1]+.009,end[2]+.028],.016,'horn');
    const rear=[[start[0]-.031,start[1]+.019,start[2]-.039,.013],
      [bend[0]+.03,bend[1]-.013,bend[2]-.082,.027],[tip[0]+.01,tip[1]+.046,tip[2]-.05,.004]];
    sculpt.sweep(hinge,'wingEdge',rear.map(([x,y,z,r])=>[...project([x,y,z]),r,r*.68]),{sides:6,steps:10});
    rib('deep',tips[index-1],bays[index-1],.032);
    rib('deep',bays[index-1],tip,.033,'horn');
    const talon=[[tip[0]-.053,tip[1]+.14,tip[2]+.023,.044],[...tip,.057],
      [tip[0]+.034,tip[1]-.11,tip[2]+.027,.040],[tip[0]+.006,tip[1]-.23,tip[2]+.077,.001]];
    sculpt.sweep(hinge,index%2?'deep':'body',talon.map(([x,y,z,r])=>[...project([x,y,z]),r,r*.79]),
      {sides:8,steps:14,ridge:.16});
  }
  if(frozen){
    for(let i=0;i<6;i++){
      const t=i*.129,tip=[.46+t*1.59,.81-t*1.11,-.15-t*.19];
      const size=.082+Math.sin(i*2.95)**2*.059;
      sculpt.sweep(hinge,i%3?'wingEdge':'oldBone',[
        [...project(tip),size],[...project([tip[0]+.041,tip[1]-.115,tip[2]+.047]),size*.72],
        [...project([tip[0]+.063,tip[1]-.246-i*.018,tip[2]+.036]),.004]
      ],{sides:6,steps:7,ridge:.11});
      if(i%2===0)sculpt.sweep(hinge,'cyan',[
        [...project([tip[0]-.056,tip[1]+.075,tip[2]-.028]),.014],[...project(tip),.023],
        [...project([tip[0]+.054,tip[1]-.226,tip[2]+.082]),.004]
      ],{sides:5,steps:7});
    }
  }
  return wingJoint(k,sculpt,hinge,project);
}

function ring(k,hand,awakened,frozen,mobile){
  const {bone,mesh,rod}=k;
  const wheel=bone(hand,.04,-.04,.25);
  mesh(wheel,'ring','cyan',0,0,0,.465,.465,.32);
  mesh(wheel,'ring','trim',0,0,-.06,.442,.442,.47);
  const haze=bone(wheel,0,0,.02);
  mesh(haze,'ring','mist',0,0,0,.502,.502,.74);
  for(let thread=0;thread<3;thread++){
    const start=thread*Math.PI*2/3;
    const arc=Array.from({length:11},(_,index)=>{
      const t=index/10,angle=start+t*1.51;
      const radius=.485+Math.sin(t*Math.PI)*(.09+.029*Math.cos(index*2.3+thread));
      return new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,.061+Math.sin(index*.46)*.049);
    });
    const curve=new T.CatmullRomCurve3(arc);
    haze.add(new T.Mesh(new T.TubeGeometry(curve,frozen?(mobile?8:11):16,.017,frozen?4:5),k.materials.mist));
  }
  const shards=frozen?(mobile?5:7):9;
  for(let shard=0;shard<shards;shard++){
    const a=shard*Math.PI*2/shards;
    const points=Array.from({length:7},(_,index)=>{
      const angle=a+index*.053;
      const radius=.424+(shard%3)*.035+Math.sin(index*.7)*.014;
      return new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,.022+Math.sin(shard+index)*.017);
    });
    wheel.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),frozen?5:7,.014,frozen?3:4),k.materials.glow));
  }
  wheel.userData.haze=haze;
  const trace=new T.Mesh(new T.PlaneGeometry(1.66,1.66),k.materials.corona);
  trace.position.z=.086;
  trace.renderOrder=14;
  haze.add(trace);
  const sparks=bone(wheel,0,0,.045);
  for(let point=0;point<6;point++){
    const angle=point*Math.PI/3, radius=.60+point%2*.07;
    mesh(sparks,'gem',point%2?'cyan':'glow',Math.cos(angle)*radius,Math.sin(angle)*radius,.08,
      .018,.041,.014,0,0,angle);
  }
  wheel.userData.sparks=sparks;
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4,x=Math.sin(angle),y=Math.cos(angle);
    rod(wheel,'cyan',[x*.39,y*.39,.031],[x*(awakened?.557:.50),y*(awakened?.557:.50),.049],.021,'horn');
    if(i%2===0)mesh(wheel,'gem','glow',x*.46,y*.46,.034,.040,.049,.035,0,0,-angle);
  }
  const light=new T.PointLight(frozen?0xa8ddef:0x71d9c6,0,1.43,2);
  light.position.set(0,0,.16);
  wheel.add(light);
  wheel.userData.light=light;
  return wheel;
}

function tapered(k,joint,finish,points,width,aspect=.69){
  const curve=new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...point)));
  const slices=12,sides=6;
  const geometry=new T.TubeGeometry(curve,slices,width,sides,false);
  const vertex=geometry.attributes.position;
  const point=new T.Vector3();
  for(let slice=0;slice<=slices;slice++){
    const t=slice/slices;
    const center=curve.getPointAt(t);
    const scale=.055+.945*Math.pow(1-t,.66);
    for(let side=0;side<=sides;side++){
      const index=slice*(sides+1)+side;
      point.fromBufferAttribute(vertex,index).sub(center).multiplyScalar(scale);
      point.z*=aspect;
      point.add(center);
      vertex.setXYZ(index,point.x,point.y,point.z);
    }
  }
  geometry.computeVertexNormals();
  joint.add(new T.Mesh(geometry,k.materials[finish]));
}

export function buildPao(k,entry,mobile){
  const {root,bone,mesh,rod}=k;
  const awakened=entry.id==='m026';
  const frozen=entry.id==='m098';
  if(frozen){
    k.materials.deep.color.setHex(0x141d26);
    k.materials.body.color.setHex(0x425864);
    k.materials.wingEdge.color.setHex(0x495b65);
    k.materials.eye.color.setHex(0xc8e8f5);
    k.materials.trim.color.setHex(0x7b6958);
    k.materials.trim.roughness=.54;
    k.materials.cyan.color.setHex(0x49839c);
    k.materials.cyan.emissive.setHex(0x208da9);
    k.materials.mist.color.setHex(0x6cc3d6);
    k.materials.glow.color.setHex(0xa6e8f7);
    k.materials.webbing.emissive.setHex(0x283941);
  }
  const body=bone(root,0,1.26,0);
  const sculpt=sculptPao(k);
  const back=cuirass(k,sculpt,body,awakened);
  mesh(body,'gem','cyan',0,.625,.298,.051,.074,.047);
  const skirt=bone(body,0,-.09,.06);
  const mantles=rivenCloth(k,sculpt,skirt,frozen?(mobile?7:8):10);
  const boots=[],arms=[],wings=[],wheels=[],wingEnergy=[];
  for(const side of [-1,1]){
    const leg=bone(body,side*.20,-.24,.02);
    mesh(leg,'pearl','deep',0,-.42,-.03,.17,.59,.19,.06);
    for(let row=0;row<4;row++){
      const y=-.41-row*.129;
      mesh(leg,'scale',row===0?'body':'deep',0,y,.148+row*.027,.25-row*.021,.21,.51,-.25,0,side*.07);
    }
    rod(leg,'deep',[0,-.60,.052],[side*.075,-.94,.35],.105);
    for(let toe=0;toe<3;toe++){
      const x=side*.079+(toe-1)*.080;
      mesh(leg,'pearl','body',x,-.96,.315,.072,.063,.136,-.14);
      tapered(k,leg,'bronzeShade',[[x,-.966,.335],[x*1.04,-1.009,.44],[x*1.10,-1.059,.50]],.048,.92);
    }
    boots.push(leg);
    const hinge=bone(body,side*.32,.71,-.26);
    wingEnergy.push(buildWing(k,sculpt,hinge,side,awakened,frozen));
    wings.push(hinge);
    const arm=bone(body,side*.46,.67,.03);
    const elbow=bone(arm,side*.17,-.42,.035);
    rod(arm,'deep',[0,-.02,0],elbow.position.toArray(),.117);
    const palm=bone(elbow,side*.088,-.25,.16);
    mesh(palm,'pearl','body',0,-.025,.05,.102,.105,.072);
    bracer(k,sculpt,arm,elbow,palm,side);
    const wheel=ring(k,palm,awakened,frozen,mobile);
    if(side===-1&&!awakened)wheel.scale.setScalar(.65);
    arms.push({shoulder:arm,elbow});
    wheels.push(wheel);
  }
  const head=bone(body,0,.92,.064);
  const jaw=skull(k,sculpt,head);
  const {beard,locks}=beardLocks(k,sculpt,head,frozen?(mobile?3:4):5);
  const frost=[];
  if(frozen){
    for(const side of [-1,1]){
      const rim=bone(body,side*.43,.52,-.103);
      for(let i=0;i<(mobile?3:4);i++){
        const x=side*(.021+i*.057),y=-i*.032,z=-.061-i*.024;
        const shard=bone(rim,x,y,z);
        sculpt.sweep(shard,i%2?'oldBone':'body',[[0,-.062,.012,.086],[side*.044,.144,-.026,.069],
          [side*.059,.242+i*.018,-.091,.044],[side*.122,.427-i*.025,-.196,.002]],{sides:5,steps:8,ridge:.19});
        sculpt.sweep(shard,'cyan',[[0,-.038,.067,.025],[side*.061,.134,.019,.025],
          [side*.084,.294-i*.017,-.093,.002]],{sides:4,steps:6});
      }
      frost.push(rim);
    }
  }
  sculpt.finish();
  const crest=bone(body,0,0,0);
  const energy=paoEnergy(root,[...wheels,...wingEnergy],mobile,frozen);
  return {body,head,crest,pao:{awakened,frozen,frost,beard,locks,jaw,back,energy,skirt,boots,arms,wings,wheels,mantles}};
}

// Wind-up and release weight separate body, wing, shoulder and elbow movement.
const casting={
  lance:{lean:.36,wing:.26,lift:[.31,1.24],spread:-.31,elbow:.26,thrust:-1.26},
  marked:{lean:.11,wing:.09,lift:[1.20,.21],spread:.34,elbow:-.79,thrust:-.55},
  prison:{lean:.05,wing:.48,lift:[1.06,1.06],spread:.55,elbow:-.53,thrust:-.67},
  ring:{lean:.19,wing:.39,lift:[.52,.52],spread:.57,elbow:.36,thrust:.34},
  gravity:{lean:-.22,wing:-.26,lift:[.94,.94],spread:-.69,elbow:-1.02,thrust:-.63},
  cinders:{lean:.41,wing:.36,lift:[.25,1.35],spread:.31,elbow:-.39,thrust:1.08},
};

export function posePao(model,unit,time,{stage,wind,strike,travel,fall,step,flash}){
  const {awakened,frozen,frost,beard,locks,jaw,back,skirt,boots,arms,wings,wheels,mantles}=model.pao;
  const trueForm=awakened||stage>0;
  const transform=model.pao;
  if(transform.awakening===undefined)transform.awakening=trueForm?1:0;
  const dt=Math.min(.05,Math.max(0,time-(transform.lastPose??time)));
  if(trueForm&&transform.awakening<1)transform.awakening=Math.min(1,transform.awakening+dt/.78);
  transform.lastPose=time;
  const settled=T.MathUtils.smoothstep(transform.awakening,0,1);
  const beat=time*(trueForm?2.75:4)+(unit.phase??0);
  const pattern=unit.attack?.pattern??unit.motion?.pattern;
  const move=casting[pattern]??casting.ring;
  const charge=T.MathUtils.smoothstep(wind,.08,.93);
  const extension=strike**.48;
  const cast=Math.max(charge,extension);
  const impact=unit.reaction;
  const recoil=impact&&impact.kind!=='fall'?(1-T.MathUtils.smoothstep(impact.age,0,impact.kind==='break'?.53:.35)):0;
  const heavy=impact?.kind==='heavy'||impact?.kind==='break';
  const landing=awakened?0:Math.sin(settled*Math.PI);
  const plant=awakened?0:T.MathUtils.smoothstep(settled,.64,.85)*(1-T.MathUtils.smoothstep(settled,.85,1));
  const entrance=transform.entranceAt===undefined?0:1-T.MathUtils.smoothstep(time-transform.entranceAt,0,1.03);
  const gait=travel*settled;
  model.body.rotation.x=Math.sin(beat)*.031+travel*.27+charge*move.lean-extension*.34+recoil*(heavy?-.51:-.19)+fall*.26+plant*.19;
  model.body.rotation.z=Math.sin(beat*.72)*.038+gait*Math.sin(step)*.101+(impact?.dx??0)*recoil*.25;
  model.body.position.y=1.59-.52*settled+(.108-.086*settled)*Math.sin(beat)+charge*.13-extension*.042
    +gait*Math.abs(Math.sin(step))*.078+landing*.39+entrance*(awakened?.28:1.04)-plant*.13;
  model.root.position.y=T.MathUtils.lerp(model.root.position.y+.12,.045+(model.root.position.y-.045)*.22,settled);
  skirt.rotation.x=-travel*.24+Math.sin(beat+.6)*.09-strike*.20+landing*.23;
  skirt.scale.y=.62+.42*settled;
  beard.rotation.x=Math.sin(beat-.57)*.082+travel*.24+charge*.09-strike*.26+recoil*.30;
  beard.scale.y=.86+.26*settled;
  for(const [index,lock] of locks.entries()){
    const lag=index*.54;
    lock.rotation.x=Math.sin(beat-lag)*(.042+travel*.075)+extension*.14-recoil*.11;
    lock.rotation.z=Math.sin(beat*.73+lag)*(.048+travel*.035)+(index%2?1:-1)*cast*.071;
  }
  jaw.rotation.x=charge*.13+extension*.27+fall*.33;
  back.rotation.x=-travel*.06+landing*.07;
  model.head.rotation.y=Math.sin(beat*.52)*.09*(1-cast)+(impact?.dx??0)*recoil*.29;
  model.materials.cyan.emissiveIntensity=.74+cast*2.25+landing*.87+flash*.45+entrance*.76;
  model.materials.mist.opacity=(.14+cast*.29+landing*.19)*(1-fall*.91);
  model.materials.corona.uniforms.clock.value=time;
  model.materials.corona.uniforms.power.value=(.66+cast*.89+landing*.32)*(1-fall*.95);
  model.materials.eye.color.setHex(frozen?0xc9eef6:0xfda64b).multiplyScalar(1+cast*.64+flash*.41);
  for(const [i,rim] of frost.entries())rim.rotation.y=(i?1:-1)*(.075+charge*.41-strike*.31+settled*.18);
  for(const [i,wing] of wings.entries()){
    const side=i===0?-1:1;
    const downstroke=Math.sin(beat+i*.30-.27);
    const flap=downstroke*(1-settled*.62+travel*.48);
    wing.rotation.set(-.20+flap*.24+charge*move.wing+fall*.47,
      side*(-.15+flap*.27-charge*.49+extension*.52-landing*.73-fall*.69-entrance*.97),
      side*((trueForm?-.08:.11)+flap*.32+charge*move.wing-extension*.51-fall*.62+landing*.37+recoil*.22-entrance*.59));
    wing.scale.set(1+Number(stage>0&&!awakened)*.075,1+Number(trueForm)*.07,1);
    const {shoulder,elbow}=arms[i];
    shoulder.rotation.x=-.09+Math.sin(beat*.6+i)*.055-charge*move.lift[i]+extension*move.thrust+recoil*.41+fall*.54;
    shoulder.rotation.z=side*(.30+charge*move.spread-strike*.22+landing*.33);
    elbow.rotation.x=-.17+charge*move.elbow+strike*.37+recoil*.51;
    elbow.rotation.z=side*(.04+(charge-strike)*.37);
    wheels[i].rotation.z=time*(i?.83:-.71)+side*(charge-extension)*1.82;
    wheels[i].rotation.x=.11+charge*.46-strike*.12;
    wheels[i].rotation.y=side*(.37+.29*settled)*(1-cast*.70);
    const haze=wheels[i].userData.haze;
    haze.rotation.z=time*side*2.4;
    haze.scale.setScalar(1+Math.sin(beat*2+i)*.08+cast*.18);
    const sparks=wheels[i].userData.sparks;
    sparks.rotation.z=-time*side*3.7+charge*1.22;
    sparks.scale.setScalar(.86+cast*.42+landing*.29);
    sparks.visible=fall<.82;
    const wheelSize=(i===0?.66+.34*settled:1)*(1+cast*.31)*Math.max(.08,1-fall*.96);
    wheels[i].scale.setScalar(wheelSize);
    wheels[i].userData.light.intensity=(.18+cast*.82+landing*.30)*(i===0?.61+.39*settled:1)*(1-fall);
    boots[i].visible=settled>.10;
    boots[i].scale.y=.64+.36*settled;
    const stride=step+i*Math.PI;
    boots[i].rotation.x=.10+Math.sin(stride)*gait*.65+plant*.19;
    boots[i].position.y=-.24+Math.max(0,Math.cos(stride))*gait*.21;
    boots[i].position.z=.02+Math.sin(stride)*gait*.22;
  }
  for(const [index,cloth] of mantles.entries()){
    const angle=(index+.55)*Math.PI*2/mantles.length;
    cloth.rotation.set(Math.sin(beat+index*.71)*.117-travel*.21+Math.cos(angle)*landing*.19,angle,
      Math.cos(beat*.91+index*.93)*.11+Math.sin(angle)*recoil*.24);
  }
  transform.energy.update(time,cast,travel,fall,landing);
}
