import * as T from '../three.min.mjs';

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
  const dark=new T.Color(0x21121c),russet=new T.Color(0x975c46),silk=new T.Color(0xd2a47e);
  const hem=path([tips.at(-1),[.21,-.33,0],wingBase]);
  const edge=[...front.getPoints(16).slice(0,-1),...outline.getPoints(40).slice(0,-1),...hem.getPoints(8).slice(0,-1)];
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
  mesh(wheel,'ring','glow',0,0,0,.41,.41,.61);
  mesh(wheel,'ring','cyan',0,0,-.06,.507,.507,.43);
  mesh(wheel,'ring','trim',0,0,-.09,.352,.352,.48);
  const haze=bone(wheel,0,0,.02);
  mesh(haze,'ring','mist',0,0,0,.436,.436,1.44);
  mesh(haze,'ring','mist',0,0,0,.497,.497,1.44);
  for(let thread=0;thread<3;thread++){
    const start=thread*Math.PI*2/3;
    const arc=Array.from({length:11},(_,index)=>{
      const t=index/10,angle=start+t*1.51;
      const radius=.485+Math.sin(t*Math.PI)*(.09+.029*Math.cos(index*2.3+thread));
      return new T.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,.061+Math.sin(index*.46)*.049);
    });
    const curve=new T.CatmullRomCurve3(arc);
    haze.add(new T.Mesh(new T.TubeGeometry(curve,16,.012,5),k.materials.mist));
  }
  wheel.userData.haze=haze;
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4,x=Math.sin(angle),y=Math.cos(angle);
    rod(wheel,'cyan',[x*.39,y*.39,.031],[x*(awakened?.557:.50),y*(awakened?.557:.50),.049],.021,'horn');
    if(i%2===0)mesh(wheel,'gem','glow',x*.46,y*.46,.034,.040,.049,.035,0,0,-angle);
  }
  return wheel;
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
  const boots=[],arms=[],wings=[],wheels=[];
  for(const side of [-1,1]){
    const mantle=bone(skirt,side*.12,.04,-.15);
    mesh(mantle,'mantle','deep',side*.18,.09,-.06,side*.68,1.34,1.48,.15,-side*.36,0);
    mesh(mantle,'mantle','body',side*.24,.02,-.07,side*.48,1.29,.68,.12,-side*.25,0);
    mesh(mantle,'mantle','deep',side*.12,.05,.15,side*.42,1.09,.92,-.11,-side*.23,0);
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
    }
    const leg=bone(body,side*.20,-.24,.02);
    mesh(leg,'pearl','deep',0,-.42,-.03,.17,.59,.19,.06);
    mesh(leg,'scale','body',0,-.50,.13,.29,.54,.49,-.13);
    rod(leg,'deep',[0,-.59,.03],[side*.08,-.98,.37],.088);
    for(let toe=0;toe<3;toe++)rod(leg,'edge',
      [side*.079+(toe-1)*.054,-.98,.28],[side*.10+(toe-1)*.079,-1.07,.46],.036,'horn');
    boots.push(leg);
    const hinge=bone(body,side*.32,.71,-.26);
    buildWing(k,hinge,side,awakened);
    wings.push(hinge);
    const arm=bone(body,side*.46,.67,.03);
    mesh(arm,'scale','trim',side*.046,0,.015,.43,.42,.69,.34,-side*.47,side*.76);
    mesh(arm,'scale','body',side*.048,.05,.065,.34,.35,.68,.34,-side*.47,side*.77);
    rod(arm,'edge',[side*.033,.12,.095],[side*.33,.17,.11],.079,'horn');
    rod(arm,'wingEdge',[side*.04,.085,.19],[side*.245,-.113,.207],.028);
    const elbow=bone(arm,side*.17,-.42,.035);
    rod(arm,'deep',[0,-.02,0],elbow.position.toArray(),.117);
    rod(elbow,'body',[0,0,0],[side*.074,-.26,.15],.101);
    mesh(elbow,'scale','edge',side*.083,-.13,.145,.26,.39,.59,.35,-side*.16,side*.23);
    mesh(elbow,'scale','body',side*.085,-.14,.19,.20,.31,.46,.35,-side*.16,side*.23);
    rod(elbow,'trim',[side*.083,-.046,.195],[side*.164,-.281,.275],.038,'horn');
    const palm=bone(elbow,side*.088,-.25,.16);
    mesh(palm,'pearl','edge',0,-.025,.05,.090,.12,.077);
    for(let finger=0;finger<4;finger++){
      const x=(finger-1.5)*.055;
      rod(palm,'edge',[x,-.044,.047],[x*1.20,-.16,.13-finger*.014],.024,'horn');
    }
    const wheel=ring(k,palm,awakened);
    if(side===-1&&!awakened)wheel.scale.setScalar(.65);
    arms.push({shoulder:arm,elbow});
    wheels.push(wheel);
  }
  const head=bone(body,0,.92,.064);
  mesh(head,'pearl','deep',0,.098,.04,.243,.30,.208,-.16);
  mesh(head,'scale','body',0,.16,.215,.31,.49,.78,-.16);
  mesh(head,'scale','edge',0,.26,.282,.26,.31,.52,-.11);
  mesh(head,'scale','deep',0,.038,.322,.36,.21,.54,.12,0,Math.PI);
  mesh(head,'gem','cyan',0,.19,.414,.031,.095,.023);
  rod(head,'deep',[0,.098,.37],[0,-.082,.431],.066,'horn');
  const beard=bone(head,0,-.080,.437);
  mesh(beard,'scale','ivoryShade',0,-.32,.027,.28,.70,.55,0,0,Math.PI);
  rod(beard,'edge',[0,.022,.068],[0,-.965,.098],.051,'horn');
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
    for(let i=1;i<tusk.length;i++){
      rod(head,i===4?'deep':'bronzeShade',tusk[i-1],tusk[i],.105-i*.016,i===4?'horn':'bar');
      if(i<4)mesh(head,'gem','body',...tusk[i],.105,.091,.065,0,0,-side*.48);
    }
    for(let strand=0;strand<4;strand++){
      const x=side*(.032+strand*.045),length=.94-strand*.091;
      rod(beard,strand%3?'edge':'ivoryShade',[x,.034,0],[x*.95,-.31,.092],.062-strand*.007);
      rod(beard,strand%3?'edge':'ivoryShade',[x*.95,-.31,.092],[x*.23+side*.073,-length,.12-strand*.027],
        .053-strand*.006,'horn');
    }
  }
  const crest=bone(body,0,0,0);
  return {body,head,crest,pao:{awakened,beard,skirt,boots,arms,wings,wheels}};
}

export function posePao(model,unit,time,{stage,wind,strike,travel,fall}){
  const {awakened,beard,skirt,boots,arms,wings,wheels}=model.pao;
  const trueForm=awakened||stage>0;
  const transform=model.pao;
  if(transform.awakening===undefined)transform.awakening=trueForm?1:0;
  if(trueForm&&transform.awakening<1){
    transform.awakening=Math.min(1,transform.awakening+Math.max(0,time-transform.lastPose)/.52);
  }
  transform.lastPose=time;
  const settled=T.MathUtils.smoothstep(transform.awakening,0,1);
  const beat=time*(trueForm?3.15:4.55)+(unit.phase??0);
  const pattern=unit.attack?.pattern??unit.motion?.pattern;
  const beam=pattern==='lance';
  const cast=Math.max(wind,strike);
  model.body.rotation.x=Math.sin(beat)*.056+travel*.19+wind*.21-strike*.25;
  model.body.rotation.z=Math.sin(beat*.72)*.037;
  model.body.position.y=1.59-.52*settled+(.14-.105*settled)*Math.sin(beat)+wind*.15;
  model.root.position.y=T.MathUtils.lerp(model.root.position.y+.12,.045+(model.root.position.y-.045)*.22,settled);
  skirt.rotation.x=-travel*.24+Math.sin(beat+.6)*.09-strike*.20;
  skirt.scale.y=.62+.42*settled;
  beard.rotation.x=Math.sin(beat-.57)*.082+travel*.24+wind*.09-strike*.26;
  beard.scale.y=.84+.29*settled;
  for(const [i,wing] of wings.entries()){
    const side=i===0?-1:1;
    const flap=Math.sin(beat+i*.18);
    wing.rotation.set(-.17+flap*.17+wind*.37+fall*.17,
      side*(-.13+flap*.18-wind*.49+strike*.44),
      side*((trueForm?-.01:.13)+flap*.26+wind*.34-strike*.41-fall*.31));
    wing.scale.set(1+Number(stage>0&&!awakened)*.075,1+Number(trueForm)*.07,1);
    const {shoulder,elbow}=arms[i];
    shoulder.rotation.x=-.21+Math.sin(beat*.6+i)*.055-wind*.64+strike*(beam?-1.05:-.70);
    shoulder.rotation.z=side*(.30+wind*.31-strike*.22);
    elbow.rotation.x=-.17-wind*.58+strike*.37;
    elbow.rotation.z=side*(.04+(wind-strike)*.37);
    wheels[i].rotation.z=time*(i?1.25:-.95)+side*(wind-strike)*.42;
    wheels[i].rotation.x=.11+wind*.46-strike*.12;
    wheels[i].rotation.y=side*(.37+.29*settled)*(1-cast*.70);
    const haze=wheels[i].userData.haze;
    haze.rotation.z=time*side*2.4;
    haze.scale.setScalar(1+Math.sin(beat*2+i)*.08+cast*.18);
    const wheelSize=(i===0&&!trueForm?.66:1.0)*(1+cast*.31);
    wheels[i].scale.setScalar(wheelSize);
    boots[i].visible=settled>.10;
    boots[i].scale.y=.64+.36*settled;
    boots[i].rotation.x=.13+Math.sin(beat*.7+i)*.11-travel*.17;
  }
}
