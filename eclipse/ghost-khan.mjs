import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(s,p)=>p.map(([x,...rest])=>[x*s,...rest]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:17,sides:mobile?6:8,ridge:.17});
const mass=(k,j,m,p,mobile,seed=0,fur=false,section=2.36)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?12:18,sides:mobile?10:15,section,seed,fur,ridge:.18,
}));
const bead=(k,j,m,x,y,z,n)=>k.mesh(j,'gem',m,x,y,z,n,n*.94,n*.63);
function plate(k,j,m,path,mobile,d=.04,rear=false){
  k.sculpt.plate(j,m,path,d,d*.36);
  sweep(k,j,'ghostBronze',path.slice(0,-1).map(([x,y,z],i)=>[x,y,z+(rear?-d:d)*.53,i%3?.007:.011]),mobile);
}

export const ghostKhanFinishes={
  ghostUnder:[0x223749,.06,.81,'hide'],ghostGuard:[0x284a5d,.055,.78,'hide'],ghostSilver:[0x6d98a9,.09,.74,'hide'],
  ghostPaw:[0x8db6bb,.082,.70,'hide'],ghostNose:[0x252931,.035,.59,'hide'],ghostSkin:[0x797676,.035,.84,'hide'],
  ghostHair:[0x3a3947,.032,.89,'hide'],ghostIron:[0x2c4352,.51,.51,'iron'],ghostBronze:[0x9c8458,.64,.48,'bronze'],
  ghostLinen:[0x28394a,.08,.79,'cloth'],ghostTack:[0x3e4544,.17,.81,'hide'],ghostCap:[0x434963,.090,.81,'cloth'],
  ghostEye:[0x8cced3,.13,.43,'gem'],ghostTeeth:[0xb2c2bc,.13,.64,'bone'],
};

function ruff(k,parent,s,origin,span,mobile,seed){
  const chains=mobile?6:10;
  for(let i=0;i<chains;i++){
    const t=i/chains,x=origin[0]+t*span*.19,y=origin[1]-.048*i,z=origin[2]+t*.19;
    const length=span*(.73+.37*Math.cos(i*.86+seed));
    mass(k,parent,i%4?'ghostGuard':'ghostSilver',mirror(s,[[x-.047,y+.023,z+.066,.068,.065],
      [x+.055+length*.06,y-.013,z-.123,.079,.051],[x+.071+length*.10,y-.049,z-length*.59,.054,.035],
      [x+.086+length*.15,y-.102,z-length*.92,.026,.019],[x+.079+length*.19,y-.156,z-length,.004,.006]]),
      mobile,seed+i*2.23,true,1.79);
  }
}

function wolf(k,body,mobile){
  mass(k,body,'ghostUnder',[[0,.048,-.93,.168,.163],[0,.156,-.65,.297,.263],[.013,.218,-.363,.361,.314],
    [.015,.248,-.016,.333,.350],[0,.284,.306,.322,.320],[0,.326,.58,.236,.238],[0,.349,.708,.166,.188]],mobile,19,true,2.53);
  mass(k,body,'ghostGuard',[[0,.258,-.97,.152,.113],[0,.397,-.62,.261,.133],[0,.438,-.318,.298,.137],
    [0,.459,.049,.264,.138],[0,.519,.35,.237,.169],[0,.562,.606,.147,.144]],mobile,23,true,2.2);
  const neck=k.bone(body,0,.420,.597),head=k.bone(neck,0,.116,.261),jaw=k.bone(head,0,-.113,.124);
  mass(k,neck,'ghostGuard',[[0,-.183,-.237,.179,.161],[0,-.088,-.114,.259,.227],[0,.03,.007,.241,.224],
    [0,.112,.143,.184,.167],[0,.147,.253,.142,.150]],mobile,27,true,2.32);
  mass(k,head,'ghostGuard',[[0,-.087,-.203,.148,.109],[0,.032,-.103,.209,.165],[0,.084,.028,.211,.175],
    [0,.042,.146,.181,.135],[0,-.027,.247,.135,.105],[0,-.043,.381,.107,.079],[0,-.066,.421,.076,.060]],mobile,31,true,2.41);
  mass(k,head,'ghostSilver',[[0,-.067,.113,.156,.088],[0,-.053,.251,.122,.096],[0,-.035,.357,.091,.074],
    [0,-.039,.422,.075,.062]],mobile,48,true,2.1);
  mass(k,head,'ghostNose',[[0,-.094,.412,.063,.044],[0,-.044,.441,.082,.056],[0,.008,.429,.082,.041],
    [0,.034,.41,.049,.029]],mobile,51,false,2.69);
  mass(k,jaw,'ghostNose',[[0,-.071,-.125,.093,.071],[0,-.058,-.016,.142,.071],[0,-.039,.092,.111,.066],
    [0,-.011,.196,.101,.052],[0,.004,.288,.051,.035]],mobile,63,false,2.35);
  mass(k,jaw,'ghostSilver',[[0,-.109,-.101,.089,.049],[0,-.084,-.009,.128,.062],[0,-.067,.102,.102,.049],
    [0,-.041,.237,.077,.038],[0,-.024,.282,.035,.023]],mobile,2,true,2.31);
  const ears=[],bridles=[];
  for(const s of sides){
    const ear=k.bone(head,s*.155,.134,-.101);
    ear.name='食魂獸 · 狼耳 '+s;
    mass(k,ear,'ghostGuard',mirror(s,[[.002,-.049,.016,.074,.070],[.060,.068,-.002,.077,.069],
      [.104,.186,-.059,.059,.043],[.126,.263,-.099,.034,.025],[.143,.294,-.131,.005,.005]]),mobile,9,true,2.0);
    k.sculpt.plate(ear,'ghostUnder',mirror(s,[[.017,.018,.061],[.052,.095,.068],[.107,.218,.017],
      [.133,.255,-.036],[.112,.118,.009],[.093,.034,.046],[.055,.009,.063]]),.018,.005);
    sweep(k,ear,'ghostSilver',mirror(s,[[.022,.058,.059,.012],[.062,.121,.051,.019],[.117,.208,.011,.014],
      [.13,.256,-.046,.002]]),mobile);
    ears.push({ear,s});
    const orbit=mirror(s,[[.106,.072,.217],[.141,.103,.185],[.173,.099,.132],[.208,.090,.081],
      [.197,.052,.120],[.150,.048,.193],[.115,.054,.222]]);
    k.sculpt.plate(head,'ghostNose',orbit,.016,.005);
    k.mesh(head,'gem','ghostEye',s*.162,.074,.189,.029,.012,.017,0,s*.37,-s*.15);
    sweep(k,head,'ghostSilver',mirror(s,[[.093,.117,.238,.016],[.138,.133,.206,.033],[.182,.135,.136,.033],
      [.211,.108,.055,.013]]),mobile);
    for(let i=0;i<3;i++){
      const y=.053-i*.044;
      sweep(k,head,'ghostSilver',mirror(s,[[.148,y,.243,.010],[.190,y+.012,.179,.025],[.239,y-.034,.001,.030],
        [.255,y-.060,-.149,.005]]),mobile);
    }
    for(let i=0;i<4;i++){
      const z=.317-.046*i,x=.077+.013*i;
      sweep(k,head,'ghostTeeth',mirror(s,[[x,-.071,z,.020-i*.002],[x+.006,-.098,z+.011,.019-i*.003],
        [x+.009,-.146+i*.012,z+.015,.002]]),mobile);
      if(i)sweep(k,jaw,'ghostTeeth',mirror(s,[[x*.87,-.019,z-.101,.012],[x*.97,.019,z-.101,.010],
        [x,.043,z-.097,.002]]),mobile);
    }
    ruff(k,head,s,[.177,.057,-.04],.45,mobile,14+s*2.7);
    ruff(k,neck,s,[.205,.146,-.095],.62,mobile,46+s*1.3);
    const bit=k.bone(head,s*.127,-.077,.268);
    bit.name='食魂獸 · 銜環 '+s;
    k.mesh(bit,'ring','ghostBronze',0,0,0,.047,.044,.91,0,Math.PI*.50,0);
    sweep(k,head,'ghostTack',mirror(s,[[.128,-.083,.265,.017],[.174,-.011,.19,.020],[.213,.119,.016,.018],
      [.190,.178,-.094,.012]]),mobile);
    bridles.push(bit);
  }
  return {neck,head,jaw,ears,bridles};
}

function wolfLeg(k,body,s,fore,mobile){
  const hip=k.bone(body,s*(fore?.207:.224),fore?.272:.232,fore?.430:-.581);
  const knee=k.bone(hip,s*.043,-(fore?.237:.207),fore?.061:-.107);
  const hock=k.bone(knee,s*.025,-.235,fore?-.083:.066),paw=k.bone(hock,s*.014,-.225,.049);
  mass(k,hip,'ghostGuard',mirror(s,[[.004,.113,-.047,.117,.103],[.039,.052,-.027,fore?.171:.195,fore?.141:.157],
    [.067,-.095,-.016,fore?.152:.161,.133],[.052,-.231,fore?.064:-.08,.084,.085]]),mobile,24,true);
  mass(k,knee,'ghostUnder',mirror(s,[[.006,.044,.019,.087,.084],[.033,-.048,-.017,.104,.097],
    [.037,-.132,-.044,.096,.085],[.025,-.235,fore?-.053:.054,.064,.060]]),mobile,53,true);
  mass(k,hock,'ghostSilver',mirror(s,[[.002,.048,.009,.067,.063],[.031,-.031,-.014,.080,.068],
    [.027,-.114,-.007,.068,.063],[.023,-.224,.04,.059,.051]]),mobile,73,true);
  mass(k,paw,'ghostPaw',mirror(s,[[.012,-.045,.158,.084,.057],[.021,-.013,.083,.116,.063],
    [.018,.033,.015,.092,.067],[.013,.071,-.018,.051,.046]]),mobile,81,true,2.62);
  const toes=[];
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.048,point=.102-Math.abs(i-1.5)*.012;
    const digit=k.bone(paw,x,-.024,point);
    digit.name='食魂獸 · 狼趾 '+i;
    mass(k,digit,'ghostPaw',[[0,.021,-.027,.036,.038],[0,.006,.015,.042,.035],[x*.11,-.019,.06,.034,.027],
      [x*.17,-.025,.083,.024,.017]],mobile,i,true,2.57);
    sweep(k,digit,'ghostTeeth',[[x*.15,-.016,.068,.018],[x*.21,-.026,.105,.014],[x*.25,-.052,.126,.003]],mobile);
    toes.push(digit);
  }
  ruff(k,hip,s,[.092,.059,-.007],fore?.28:.34,mobile,7+s);
  return {hip,knee,hock,paw,toes,s,fore};
}

function wolfTail(k,body,mobile){
  const joints=[],path=[[0,.207,-.825,.168],[-.085,.287,-1.095,.172],[-.173,.338,-1.369,.148],
    [-.225,.406,-1.616,.107],[-.314,.429,-1.911,.063],[-.419,.388,-2.149,.007]];
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1],before=path[i-1];
    const joint=k.bone(joints.at(-1)??body,...a.slice(0,3).map((v,j)=>v-(before?.[j]??0)));
    const [x,y,z]=b.slice(0,3).map((v,j)=>v-a[j]);
    const r=a[3],next=b[3];
    mass(k,joint,i%3?'ghostGuard':'ghostUnder',[[0,.019,.017,r,r*.77],[x*.48,y*.44,z*.47,(r+next)*.51,(r+next)*.41],
      [x,y,z,next,next*.81]],mobile,74+i,true,2.21);
    for(const s of sides)sweep(k,joint,i>1?'ghostSilver':'ghostGuard',[[s*r*.55,.006,.022,r*.48],
      [x*.61+s*r*.65,y-.053,z*.53,r*.39],[x+s*next*.51,y-.109,z-.12,.004]],mobile);
    joints.push(joint);
  }
  return joints;
}

function riderFace(k,head,mobile){
  const path=[[0,-.135,.019,.079,.083],[0,-.067,.017,.118,.115],[0,.039,-.013,.126,.129],
    [0,.129,-.037,.117,.128],[0,.197,-.052,.089,.095]];
  const geo=sculptVolume(path,{rings:mobile?22:32,sides:mobile?21:30,section:2.28,ridge:.055,seed:61});
  const {position,color}=geo.attributes,g=(x,r)=>Math.exp(-((x/r)**2));
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),a=Math.abs(x),front=Math.min(1,Math.max(0,z)*8.7);
    const nose=g(x,.022)*(g(y+.026,.025)*.9+g(y-.018,.064)*.53);
    const cheek=g(a-.084,.045)*g(y+.033,.043),eye=g(a-.063,.026)*g(y-.051,.026),brow=g(a-.073,.040)*g(y-.087,.021);
    position.setZ(i,z+front*(nose*.059+cheek*.027-eye*.020+brow*.026));
    const tint=1+front*(cheek*.079-eye*.13+brow*.057);
    color.setXYZ(i,color.getX(i)*tint,color.getY(i)*tint,color.getZ(i)*tint);
  }
  geo.computeVertexNormals();
  k.geometry(head,'ghostSkin',geo);
  const chin=k.bone(head,0,-.117,.043);
  mass(k,chin,'ghostSkin',[[0,-.052,.029,.046,.031],[0,-.021,.047,.068,.045],
    [0,.017,.043,.092,.046],[0,.041,.024,.098,.05]],mobile,61);
  sweep(k,chin,'ghostHair',[[-.063,.012,.089,.005],[0,.009,.122,.010],[.060,.01,.089,.003]],mobile);
  mass(k,head,'ghostCap',[[0,.095,-.083,.121,.088],[0,.152,-.075,.154,.129],[.004,.209,-.055,.155,.123],
    [.014,.281,-.067,.107,.096],[.026,.333,-.075,.074,.063],[.044,.405,-.092,.018,.017]],mobile,73,true,2.26);
  const ties=[];
  for(const s of sides){
    const brow=mirror(s,[[.023,.073,.136],[.051,.079,.145],[.086,.07,.127],[.103,.057,.105],
      [.086,.043,.128],[.058,.031,.138]]);
    k.sculpt.plate(head,'ghostHair',brow,.011,.003);
    k.mesh(head,'round','ghostPaw',s*.061,.057,.146,.023,.010,.009,0,s*.21);
    k.mesh(head,'gem','ghostEye',s*.067,.057,.156,.009,.009,.006);
    sweep(k,head,'ghostHair',mirror(s,[[.032,.089,.144,.006],[.061,.104,.142,.016],[.099,.088,.115,.013],
      [.111,.070,.088,.004]]),mobile);
    sweep(k,head,'ghostHair',mirror(s,[[.018,-.066,.173,.004],[.053,-.077,.162,.014],[.084,-.095,.128,.019],
      [.107,-.131,.093,.003]]),mobile);
    for(let i=0;i<4;i++){
      const x=.019+i*.018,z=.118-i*.016;
      mass(k,chin,i%2?'ghostHair':'ghostGuard',mirror(s,[[x,-.005,z,.016,.016],[x+.005,-.041,z+.008,.023,.017],
        [x+.003,-.093,z-.010,.016,.013],[x-.013,-.133,z-.023,.003,.004]]),mobile,97+i,true,1.79);
    }
    const fur=mirror(s,[[.004,.156,.082],[.083,.177,.071],[.155,.141,.014],[.164,.071,-.067],
      [.146,-.079,-.062],[.109,-.043,-.012],[.114,.074,.047],[.077,.13,.108]]);
    k.sculpt.plate(head,'ghostGuard',fur,.020,.007);
    sweep(k,head,'ghostSilver',mirror(s,[[.012,.150,.121,.009],[.086,.173,.092,.026],[.148,.141,.026,.023],
      [.170,.031,-.029,.016],[.149,-.085,-.066,.004]]),mobile);
    const tie=k.bone(head,s*.132,.086,-.101);
    mass(k,tie,'ghostCap',mirror(s,[[.008,.041,-.018,.041,.047],[.044,-.053,-.074,.060,.036],
      [.073,-.17,-.132,.043,.032],[.055,-.254,-.176,.007,.006]]),mobile,1,true,1.95);
    ties.push({tie,s});
  }
  return {chin,ties};
}

function mountedKhan(k,body,mobile){
  const rider=k.bone(body,0,.479,-.229),head=k.bone(rider,0,.875,.152),saddle=k.bone(body,0,.407,-.196);
  const {chin,ties}=riderFace(k,head,mobile);
  mass(k,rider,'ghostLinen',[[0,-.021,-.067,.164,.162],[0,.152,-.039,.209,.174],[0,.353,.024,.209,.184],
    [0,.552,.052,.248,.183],[0,.711,.079,.219,.145],[0,.801,.107,.117,.103]],mobile,53,false,2.56);
  mass(k,saddle,'ghostTack',[[0,.014,-.448,.126,.112],[0,.05,-.288,.252,.152],[0,.054,-.024,.302,.134],
    [0,.091,.201,.268,.127],[0,.12,.313,.143,.103]],mobile,46,false,2.90);
  const arms=[],legs=[];
  for(const s of sides){
    for(let i=0;i<3;i++){
      const y=.496-i*.113,w=.18-i*.016;
      plate(k,rider,i%2?'ghostGuard':'ghostIron',mirror(s,[[.018,y+.058,.216],[w*.57,y+.092,.196],[w,y+.071,.139],
        [w*1.14,y-.043,.116],[w*.73,y-.086,.173],[.022,y-.083,.223]]),mobile,.031);
      const shape=mirror(s,[[.008,y+.078,-.169],[w*.72,y+.098,-.156],[w*1.08,y+.028,-.112],
        [w*.91,y-.072,-.150],[w*.33,y-.08,-.187],[.009,y-.033,-.183]]);
      plate(k,rider,'ghostIron',shape,mobile,.021,true);
    }
    const shoulder=k.bone(rider,s*.205,.669,.118),elbow=k.bone(shoulder,s*.078,-.178,.083);
    const hand=k.bone(elbow,s*.029,-.142,.092);
    mass(k,shoulder,'ghostLinen',mirror(s,[[0,.066,-.026,.094,.093],[.045,-.024,-.012,.120,.104],
      [.070,-.105,.031,.106,.090],[.084,-.185,.071,.061,.064]]),mobile,89);
    mass(k,elbow,'ghostIron',mirror(s,[[.003,.048,.011,.061,.064],[.013,-.027,.034,.076,.073],
      [.014,-.091,.058,.064,.059],[.021,-.151,.094,.045,.047]]),mobile,13);
    plate(k,shoulder,'ghostIron',mirror(s,[[.01,.086,.072],[.097,.124,.061],[.18,.066,-.016],
      [.20,-.048,-.083],[.088,-.104,-.045],[.04,-.062,.081]]),mobile,.036);
    mass(k,hand,'ghostSkin',mirror(s,[[0,.047,.014,.043,.037],[.02,.009,.045,.058,.048],
      [.025,-.029,.070,.048,.041],[.029,-.063,.077,.036,.031]]),mobile,56);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.025;
      sweep(k,hand,'ghostSkin',[[x,.024,.038,.013],[x+s*.008,-.003,.083,.018],[x+s*.016,-.046,.097,.013],
        [x+s*.016,-.066,.081,.004]],mobile);
    }
    arms.push({shoulder,elbow,hand,s});
    const thigh=k.bone(rider,s*.168,.090,-.003),calf=k.bone(thigh,s*.084,-.247,.142);
    mass(k,thigh,'ghostLinen',mirror(s,[[.002,.077,-.015,.091,.098],[.06,-.016,.039,.108,.109],
      [.083,-.155,.081,.092,.090],[.080,-.247,.136,.069,.071]]),mobile,36);
    mass(k,calf,'ghostTack',mirror(s,[[0,.077,-.019,.070,.072],[.030,-.026,.021,.087,.080],
      [.039,-.117,.048,.073,.068],[.025,-.226,.103,.057,.059]]),mobile,93);
    mass(k,calf,'ghostIron',mirror(s,[[.019,-.247,.231,.061,.046],[.025,-.216,.165,.081,.065],
      [.026,-.172,.107,.063,.060]]),mobile,6);
    sweep(k,saddle,'ghostBronze',mirror(s,[[.193,.094,.057,.017],[.307,.049,.084,.034],[.371,-.107,.115,.030],
      [.390,-.261,.247,.026],[.371,-.299,.288,.009]]),mobile);
    legs.push({thigh,calf,s});
  }
  return {head,rider,chin,ties,arms,legs,saddle};
}

function reins(k,body,arms,bridles,mobile){
  const samples=mobile?13:21,across=mobile?4:6,meshes=[];
  const axis=new T.Vector3(),offset=new T.Vector3(),point=new T.Vector3(),start=new T.Vector3(),end=new T.Vector3(),cross=new T.Vector3();
  const reach=new T.Matrix4();
  const refs=arms.map(({hand,s},i)=>{
    const geometry=new T.BufferGeometry(),vertices=new Float32Array((samples+1)*(across+1)*3);
    const normals=new Float32Array(vertices.length),uv=[],indices=[];
    for(let row=0;row<=samples;row++)for(let col=0;col<=across;col++){
      const n=row*(across+1)+col;
      uv.push(col/across,row/samples);
      if(row<samples&&col<across)indices.push(n,n+1,n+across+1,n+1,n+across+2,n+across+1);
    }
    geometry.setAttribute('position',new T.BufferAttribute(vertices,3).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute('normal',new T.BufferAttribute(normals,3).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geometry.setIndex(indices);
    const mesh=new T.Mesh(geometry,k.materials.ghostTack);
    mesh.name='大罕 · 皮韁 '+s;
    mesh.frustumCulled=false;
    body.add(mesh);
    meshes.push(mesh);
    return {hand,s,bit:bridles[i],geometry,vertices,normals};
  });
  const place=(wind,strike)=>{
    body.updateWorldMatrix(true,false);
    reach.copy(body.matrixWorld).invert();
    for(const {geometry,vertices,normals,hand,bit,s} of refs){
      hand.localToWorld(start.set(s*.015,-.028,.088)).applyMatrix4(reach);
      bit.getWorldPosition(end).applyMatrix4(reach);
      axis.subVectors(end,start).normalize();
      offset.set(s,0,0).addScaledVector(axis,-axis.x*s).normalize();
      cross.crossVectors(axis,offset).normalize();
      let to=0;
      for(let row=0;row<=samples;row++){
        const t=row/samples,slack=Math.sin(t*Math.PI)*(.111-wind*.038+strike*.026);
        for(let col=0;col<=across;col++){
          const a=2*Math.PI*col/across,cos=Math.cos(a),sin=Math.sin(a);
          point.copy(start).lerp(end,t).addScaledVector(offset,slack+.014*cos).addScaledVector(cross,.009*sin-slack*.34);
          point.toArray(vertices,to);
          point.copy(offset).multiplyScalar(cos).addScaledVector(cross,sin).toArray(normals,to);
          to+=3;
        }
      }
      geometry.attributes.position.needsUpdate=geometry.attributes.normal.needsUpdate=true;
    }
  };
  place(0,0);
  return {place,meshes};
}

export function carveGhostKhan(k,entry,mobile){
  const body=k.bone(k.root,0,.578,.004),beast=wolf(k,body,mobile);
  const khan=mountedKhan(k,body,mobile),tail=wolfTail(k,body,mobile);
  const legs=sides.flatMap(s=>[wolfLeg(k,body,s,true,mobile),wolfLeg(k,body,s,false,mobile)]);
  const mane=[];
  for(const s of sides){
    const tassel=k.bone(body,s*.216,.456,-.353);
    ruff(k,tassel,s,[.064,-.003,-.047],.62,mobile,11+s*4);
    mane.push({tassel,s});
  }
  const harness=reins(k,body,khan.arms,beast.bridles,mobile);
  return {body,head:beast.head,khanRider:khan.rider,portraitHead:khan.head,inspectionHead:khan.head,
    crest:k.bone(body,0,0,0),pattern:'gallop',grounded:true,sourceSculpt:true,catalogueSculpt:entry.id,
    khanJaw:beast.jaw,khanPaws:legs,khanReins:harness.meshes,
    polishEnergy:{tint:0x9bd8ef,shape:'mist',anchor:body,offset:[0,.335,-.112],span:[.59,.46,.81]},
    sourceDress(tools){
      for(const s of sides){
        tools.silk(khan.rider,'大罕 · 蒼風披衣 '+s,mirror(s,[[.17,.623,-.148,.072],[.231,.418,-.309,.107],
          [.307,.122,-.473,.126],[.366,-.183,-.751,.035]]),{tint:0x244867,trim:0x7aa2af,lining:0x394453,
          phase:s*.8,flex:1.14,across:[.86,.10,s*.49],style:'woven'});
        tools.silk(khan.saddle,'大罕 · 破紋鞍氈 '+s,mirror(s,[[.232,.091,.118,.083],[.339,-.092,.032,.148],
          [.392,-.274,-.12,.159],[.464,-.352,-.297,.105]]),{tint:0x314b56,trim:0x977b4e,lining:0x24394c,
          phase:s*1.04,flex:.71,across:[.15,.01,s*.98],style:'woven'});
      }
      return true;
    },
    finishPose({wind,strike}){harness.place(wind,strike);},
    cataloguePose({beat,headtime:t,wind,strike,travel,step,fall,stage,attackPattern}){
      const lunge=attackPattern==='pounce'?strike:0;
      body.rotation.x=-wind*.14+lunge*.17+Math.sin(step*1.84)*travel*.093+fall*.21;
      beast.neck.rotation.x=-wind*.227+lunge*.20+Math.sin(beat*.65)*.051;
      beast.head.rotation.x=-wind*.13+strike*.12-lunge*.24;
      beast.head.rotation.y=Math.sin(t*2.20)*.059+(strike-lunge)*.12;
      beast.jaw.rotation.x=.059+wind*.25+strike*(lunge>0?.66:.47)+stage*.05;
      for(const {ear,s} of beast.ears)ear.rotation.z=s*(Math.sin(t*3.3+s)*.057+wind*.20-strike*.24);
      for(const {hip,knee,hock,paw,toes,s,fore} of legs){
        const phase=step+s*1.48+(fore?0:2.2),stride=Math.sin(phase),plant=Math.cos(phase);
        hip.rotation.x=stride*travel*.52+wind*.14-lunge*(fore?.50:.21);
        hip.rotation.z=s*(fall*.29+stage*.036);
        knee.rotation.x=-Math.max(0,stride)*travel*.59+wind*.11+fall*.25;
        hock.rotation.x=-knee.rotation.x*.65+Math.min(0,plant)*travel*.15+lunge*.19;
        paw.rotation.x=-Math.min(0,stride)*travel*.30-lunge*.32;
        for(const [i,toe] of toes.entries())toe.rotation.x=.018+Math.min(0,plant)*travel*.18+lunge*(.20+i*.02);
      }
      for(const [i,bone] of tail.entries()){
        bone.rotation.y=Math.sin(beat*.56-i*.64)*(.131+travel*.111)+strike*.084;
        bone.rotation.x=Math.cos(beat*.52-i*.37)*.064-lunge*.12;
      }
      khan.rider.rotation.x=.18+wind*.22-lunge*.41+Math.sin(step*1.65)*travel*.104;
      khan.head.rotation.x=-.15-wind*.131+strike*.181;
      khan.head.rotation.y=Math.sin(beat*.59)*.063+(wind-strike)*.151;
      khan.chin.rotation.x=.021+strike*.082;
      for(const {tie,s} of khan.ties)tie.rotation.z=s*(Math.sin(beat*.74)*.083+lunge*.14);
      for(const {shoulder,elbow,hand,s} of khan.arms){
        shoulder.rotation.set(-.63-wind*.26+strike*.45,s*(.086+wind*.09),s*(.096+strike*.18));
        elbow.rotation.x=-.67+wind*.28-strike*.12;
        hand.rotation.z=s*(.13+wind*.17-strike*.16);
      }
      for(const {thigh,calf,s} of khan.legs){
        thigh.rotation.x=-.44+Math.sin(step+s*.81)*travel*.11;
        thigh.rotation.z=s*.20;
        calf.rotation.x=.43-lunge*.14;
      }
      for(const {tassel,s} of mane){
        tassel.rotation.y=s*(Math.sin(beat*.58)*.066+travel*.131-lunge*.127);
        tassel.rotation.x=Math.sin(beat*.62+s*.50)*.053+strike*.19;
      }
    },
  };
}
