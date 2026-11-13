import * as T from '../three.min.mjs';
import {paoVisage} from './pao-relief.mjs?v=pao-detail-1';

export const paoForms=new Set(['m025','m026']);

// Wing coordinates are shared by the webbing and the raised metal-blue finger bones.
const wingBase=[0,.03,.02];
const elbow=[.51,.69,-.13];
const knuckle=[.71,1.29,-.16];
const fingerJoint=[1.18,1.18,-.19];
const tips=[[1.26,1.17,-.22],[2.13,-.32,-.36],[1.69,-.53,-.26],[1.24,-.60,-.18],[.49,-.45,-.01]];
const bays=[[1.72,.74,-.22],[1.87,-.01,-.23],[1.44,-.28,-.19],[.91,-.28,-.12]];
const hook=[[.60,1.51,-.17],[.39,1.58,-.17],[.26,1.46,-.10]];

function membrane(wing,material,side,reach){
  const scaled=point=>[side*point[0]*reach,point[1],point[2]];
  const path=points=>new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...scaled(point))));
  const front=path([wingBase,elbow,knuckle,fingerJoint,tips[0]]);
  const outline=path(tips.flatMap((tip,index)=>index<bays.length?[tip,bays[index]]:[tip]));
  const vertices=[],pigments=[],uvs=[];
  const dark=new T.Color(0x291b21),russet=new T.Color(0x785344),silk=new T.Color(0xb98160);
  const hem=path([tips.at(-1),[.21,-.33,0],wingBase]);
  const ragged=outline.getPoints(48).slice(0,-1);
  for(const [index,point] of ragged.entries()){
    point.y+=Math.sin(index*2.83)*.033*Math.sin(index*Math.PI/ragged.length);
    point.z+=Math.cos(index*4.12)*.015;
  }
  const edge=[...front.getPoints(16).slice(0,-1),...ragged,...hem.getPoints(8).slice(0,-1)];
  const points=edge.map(point=>new T.Vector2(point.x,point.y));
  const triangles=T.ShapeUtils.triangulateShape(points,[]);
  function push(point){
    const u=point.x*side/2.16,v=(point.y+.65)/2.3;
    const stretch=Math.sin(v*Math.PI);
    const fold=Math.sin(u*29+v*11.8);
    const shade=dark.clone().lerp(russet,.47+stretch*.39+fold*.09);
    const thread=Math.max(0,fold)**6*.18*stretch;
    shade.lerp(silk,thread);
    vertices.push(point.x,point.y,point.z+fold*stretch*.036);
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
    patch(edge[a],edge[normal>0?b:c],edge[normal>0?c:b],2);
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

function buildWing(k,hinge,side,awakened){
  const {mesh,rod,materials}=k;
  const reach=awakened?1.07:1;
  const project=membrane(hinge,materials.webbing,side,reach);
  const rib=(finish,from,to,width,shape)=>rod(hinge,finish,project(from),project(to),width,shape);
  const leading=[wingBase,elbow,knuckle,fingerJoint,tips[0],bays[0],tips[1]];
  const tube=(points,size,segments,finish)=>{
    const line=new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...project(point))));
    const geometry=new T.TubeGeometry(line,segments,size,7,false);
    hinge.add(new T.Mesh(geometry,materials[finish]));
  };
  tube(leading,.075,24,'body');
  tube(leading.map(([x,y,z])=>[x,y+.04,z+.056]),.025,24,'wingEdge');
  tube([knuckle,...hook],.068,12,'body');
  rib('deep',hook[1],hook[2],.084,'horn');
  mesh(hinge,'gem','body',...project(knuckle),.13,.18,.105);
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
    rib('deep',tips[index-1],bays[index-1],.032);
    rib('deep',bays[index-1],tip,.033,'horn');
    rib('body',tip,[tip[0]+.036,tip[1]-.17,tip[2]+.068],.072,'horn');
  }
}

function ring(k,hand,awakened){
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
    haze.add(new T.Mesh(new T.TubeGeometry(curve,16,.017,5),k.materials.mist));
  }
  for(let shard=0;shard<9;shard++){
    const a=shard*Math.PI*2/9;
    const points=Array.from({length:7},(_,index)=>{
      const angle=a+index*.053;
      const radius=.424+(shard%3)*.035+Math.sin(index*.7)*.014;
      return new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,.022+Math.sin(shard+index)*.017);
    });
    wheel.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),7,.014,4),k.materials.glow));
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
  const light=new T.PointLight(0x71d9c6,0,1.43,2);
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

export function buildPao(k,entry){
  const {root,bone,mesh,rod}=k;
  const awakened=entry.id==='m026';
  const body=bone(root,0,1.26,0);
  mesh(body,'pearl','deep',0,.30,-.04,.48,.66,.26);
  mesh(body,'pearl','body',0,.55,0,.48,.40,.28);
  mesh(body,'scale','body',0,.47,.22,.77,.84,.57,.13,0,Math.PI);
  mesh(body,'scale','trim',0,.43,.28,.63,.63,.42,.13,0,Math.PI);
  mesh(body,'scale','deep',0,.43,.345,.51,.53,.70,.13,0,Math.PI);
  mesh(body,'gem','cyan',0,.65,.393,.112,.13,.067);
  mesh(body,'scale','trim',0,.15,-.309,.53,.63,.49,0,Math.PI);
  mesh(body,'scale','deep',0,.15,-.362,.44,.52,.39,0,Math.PI);
  mesh(body,'gem','edge',0,-.032,-.401,.14,.16,.044);
  const skirt=bone(body,0,-.09,.06);
  const boots=[],arms=[],wings=[],wheels=[],mantles=[];
  for(const side of [-1,1]){
    const mantle=bone(skirt,side*.12,.04,-.15);
    mantles.push(mantle);
    mesh(mantle,'mantle','deep',side*.18,.09,-.06,side*.68,1.34,1.48,.15,-side*.36,0);
    mesh(mantle,'mantle','body',side*.24,.02,-.07,side*.48,1.29,.68,.12,-side*.25,0);
    mesh(mantle,'mantle','deep',side*.12,.05,.15,side*.42,1.09,.92,-.11,-side*.23,0);
    for(let strip=0;strip<4;strip++){
      const x=side*(.09+strip*.089),y=-.28-strip*.17,z=.09-strip*.045;
      mesh(mantle,'mantle',strip%3?'deep':'ivoryShade',x,y,z,side*(.20+strip*.029),
        .57-strip*.041,.55,-.21+strip*.09,-side*.44,side*.10);
    }
    rod(mantle,'trim',[side*.12,.07,.20],[side*.37,-.92,.27],.023,'horn');
    mesh(body,'scale','edge',side*.29,.22,.23,.49,.68,.66,.14,-side*.27,side*.37);
    mesh(body,'scale','body',side*.30,.20,.30,.39,.59,.53,.14,-side*.27,side*.37);
    for(let shard=0;shard<2;shard++)rod(body,'trim',
      [side*(.17+shard*.18),.42-shard*.059,.35],[side*(.38+shard*.12),.12-shard*.068,.41],.025,'horn');
    rod(body,'trim',[side*.09,.26,.29],[side*.38,.35,.29],.036);
    for(let rib=0;rib<4;rib++){
      const y=.76-rib*.114;
      const x=.19+rib*.052;
      rod(body,'edge',[side*.12,y+.021,.29],[side*(x+.11),y-.057,.319],.027);
      mesh(body,'gem','bronzeShade',side*(x+.115),y-.046,.317,.043,.034,.025);
    }
    const seam=[[side*.05,.43,.415],[side*.34,.51,.40],[side*.46,.76,.29]];
    rod(body,'cyan',seam[0],seam[1],.021);
    rod(body,'wingEdge',seam[1],seam[2],.030);
    const leg=bone(body,side*.20,-.24,.02);
    mesh(leg,'pearl','deep',0,-.42,-.03,.17,.59,.19,.06);
    mesh(leg,'scale','body',0,-.50,.13,.29,.54,.49,-.13);
    rod(leg,'body',[0,-.60,.052],[side*.075,-.94,.35],.105);
    for(let toe=0;toe<3;toe++){
      const x=side*.079+(toe-1)*.080;
      mesh(leg,'pearl','body',x,-.96,.315,.072,.063,.136,-.14);
      tapered(k,leg,'bronzeShade',[[x,-.966,.335],[x*1.04,-1.009,.44],[x*1.10,-1.059,.50]],.048,.92);
    }
    boots.push(leg);
    const hinge=bone(body,side*.32,.71,-.26);
    buildWing(k,hinge,side,awakened);
    wings.push(hinge);
    const arm=bone(body,side*.46,.67,.03);
    mesh(arm,'scale','trim',side*.046,0,.015,.43,.42,.69,.34,-side*.47,side*.76);
    mesh(arm,'scale','body',side*.048,.05,.065,.34,.35,.68,.34,-side*.47,side*.77);
    rod(arm,'edge',[side*.033,.12,.095],[side*.33,.17,.11],.079,'horn');
    rod(arm,'wingEdge',[side*.04,.085,.19],[side*.245,-.113,.207],.028);
    for(let stud=0;stud<3;stud++)mesh(arm,'gem','trim',side*(.08+stud*.057),.068-stud*.089,.215,.032,.036,.025);
    const elbow=bone(arm,side*.17,-.42,.035);
    rod(arm,'deep',[0,-.02,0],elbow.position.toArray(),.117);
    rod(elbow,'body',[0,0,0],[side*.074,-.26,.15],.101);
    mesh(elbow,'scale','edge',side*.083,-.13,.145,.26,.39,.59,.35,-side*.16,side*.23);
    mesh(elbow,'scale','body',side*.085,-.14,.19,.20,.31,.46,.35,-side*.16,side*.23);
    rod(elbow,'trim',[side*.083,-.046,.195],[side*.164,-.281,.275],.038,'horn');
    const palm=bone(elbow,side*.088,-.25,.16);
    mesh(palm,'pearl','body',0,-.025,.05,.109,.12,.082);
    mesh(palm,'scale','cyan',0,.01,.126,.103,.126,.28,.27);
    for(let finger=0;finger<4;finger++){
      const x=(finger-1.5)*.055;
      rod(palm,'body',[x,-.044,.047],[x*1.18,-.134,.111-finger*.012],.027);
      tapered(k,palm,'bronzeShade',[[x*1.18,-.133,.111-finger*.012],
        [x*1.16,-.161,.131-finger*.011],[x*1.09,-.209+finger*.007,.116-finger*.012]],.024,.89);
    }
    const wheel=ring(k,palm,awakened);
    if(side===-1&&!awakened)wheel.scale.setScalar(.65);
    arms.push({shoulder:arm,elbow});
    wheels.push(wheel);
  }
  const head=bone(body,0,.92,.064);
  mesh(head,'pearl','deep',0,.098,.04,.243,.30,.208,-.16);
  mesh(head,'scale','body',0,.16,.215,.31,.49,.78,-.16);
  mesh(head,'scale','ivoryShade',0,.25,.282,.27,.32,.52,-.11);
  for(let point=-2;point<=2;point++){
    const x=point*.049;
    tapered(k,head,point%2?'ivoryShade':'edge',[[x,.19,.315],[x*1.55,.37,.293],[x*2.15,.51-Math.abs(point)*.038,.202]],.046);
  }
  mesh(head,'scale','deep',0,.038,.322,.36,.21,.54,.12,0,Math.PI);
  mesh(head,'gem','cyan',0,.19,.414,.031,.095,.023);
  rod(head,'deep',[0,.098,.37],[0,-.082,.431],.066,'horn');
  const beard=bone(head,0,-.080,.437);
  mesh(beard,'scale','ivoryShade',0,-.32,.027,.28,.70,.55,0,0,Math.PI);
  tapered(k,beard,'edge',[[0,.022,.051],[-.024,-.26,.097],[.016,-.61,.096],[-.021,-.965,.116]],.061);
  for(const side of [-1,1]){
    const brow=[[side*.018,.18,.402],[side*.17,.24,.371],[side*.31,.51,.19]];
    rod(head,'edge',brow[0],brow[1],.064);
    rod(head,'edge',brow[1],brow[2],.091,'horn');
    rod(head,'trim',[side*.21,.04,.113],[side*.37,.36,.009],.099,'horn');
    rod(head,'deep',[side*.225,.17,-.003],[side*.57,.51,-.135],.078,'horn');
    mesh(head,'gem','deep',side*.10,.105,.402,.079,.046,.030,0,0,-side*.34);
    mesh(head,'gem','eye',side*.100,.102,.438,.050,.024,.018,0,0,-side*.33);
    rod(head,'edge',[side*.18,.144,.319],[side*.158,-.10,.412],.041);
    rod(head,'edge',[side*.16,-.082,.411],[side*.11,-.255,.439],.043,'horn');
    for(let collar=0;collar<3;collar++){
      rod(head,'trim',[side*.25,.094-collar*.077,.068],[side*.32,.098-collar*.079,.21],.038);
    }
    const tusk=[[side*.20,.005,.111],[side*.36,.18,-.011],[side*.51,.35,-.056],[side*.62,.55,-.176],[side*.62,.68,-.224]];
    const crownHook=[[side*.21,.03,.104],[side*.38,.17,-.01],[side*.56,.40,-.084],[side*.66,.63,-.17],[side*.60,.85,-.21],[side*.52,.88,-.20]];
    tapered(k,head,'body',crownHook,.11,1.04);
    for(let i=1;i<tusk.length;i++){
      const [x,y,z]=tusk[i];
      if(i<4)mesh(head,'pearl','bronzeShade',x,y,z+.023,.102-i*.011,.071,.102,.18,0,-side*.48);
      if(i<4)mesh(head,'gem','trim',x-side*.020,y+.027,z+.081,.049,.027,.032,0,0,-side*.40);
    }
    for(let strand=0;strand<6;strand++){
      const x=side*(.027+strand*.027),length=.92-strand*.069;
      tapered(k,beard,strand%3?'edge':'ivoryShade',
        [[x,.024,-strand*.009],[x*1.04,-.23,.062+strand*.004],[x*.77,-length*.74,.105-strand*.015],
          [x*.18+side*.067,-length,.119-strand*.019]],.038-strand*.003);
    }
  }
  const crest=bone(body,0,0,0);
  paoVisage(k,head,beard,body,arms);
  return {body,head,crest,pao:{awakened,beard,skirt,boots,arms,wings,wheels,mantles}};
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
  const {awakened,beard,skirt,boots,arms,wings,wheels,mantles}=model.pao;
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
  beard.scale.y=.84+.29*settled;
  model.head.rotation.y=Math.sin(beat*.52)*.09*(1-cast)+(impact?.dx??0)*recoil*.29;
  model.materials.cyan.emissiveIntensity=.74+cast*2.25+landing*.87+flash*.45+entrance*.76;
  model.materials.mist.opacity=(.14+cast*.29+landing*.19)*(1-fall*.91);
  model.materials.corona.uniforms.clock.value=time;
  model.materials.corona.uniforms.power.value=(.66+cast*.89+landing*.32)*(1-fall*.95);
  model.materials.eye.color.setHex(0xfda64b).multiplyScalar(1+cast*.64+flash*.41);
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
    mantles[i].rotation.set(-travel*.12+Math.sin(beat+i*.9)*.13,side*(.10+travel*.17+landing*.21),side*(Math.sin(beat+i)*.13+recoil*.20));
  }
}
