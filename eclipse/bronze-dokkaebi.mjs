import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const sides=[-1,1];
const tau=Math.PI*2;
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

export const bronzeDokkaebiFinishes={
  dokkaebiSkin:[0xa55c50,.014,.95,'hide'],dokkaebiShade:[0x79463f,.020,.94,'hide'],
  dokkaebiInk:[0x643c39,.029,.92,'hide'],dokkaebiRed:[0x9b3f37,.52,.54,'bronze'],
  dokkaebiCopper:[0xba8c56,.69,.45,'bronze'],dokkaebiSmelt:[0x4c565f,.72,.51,'iron'],
  dokkaebiHair:[0x3d3539,.12,.81,'hide'],dokkaebiScar:[0xafa5a0,.22,.68,'hide'],
  dokkaebiTooth:[0xd5c3aa,.21,.57,'bone'],dokkaebiDusk:[0x38374a,.2,.80,'cloth'],
  dokkaebiWood:[0x675041,.019,.94,'hide'],dokkaebiEndgrain:[0x5d493d,.015,.92,'hide'],
  dokkaebiStone:[0x555254,.105,.89,'stone'],
};

function tools(k,mobile){
  return {
    carve:(parent,finish,path,seed=0)=>k.geometry(parent,finish,sculptVolume(path,{
      sides:mobile?11:16,rings:mobile?14:20,section:2.36,ridge:.20,seed,
    })),
    sweep:(parent,finish,path,steps=11)=>k.sculpt.sweep(parent,finish,path,{steps,sides:7,ridge:.20}),
    plate:(parent,finish,path,thickness=.045)=>k.sculpt.plate(parent,finish,path,thickness,.017),
  };
}

function face(k,g,body,mobile){
  const {carve,plate,sweep}=g,head=k.bone(body,0,.976,.131);
  const jaw=k.bone(head,0,-.099,.066),hair=k.bone(head,0,.112,-.084);
  head.name='山魈 · 朱面';
  carve(head,'dokkaebiSkin',[[0,-.164,.115,.148,.104],[0,-.078,.065,.211,.141],
    [0,.019,.023,.269,.169],[0,.121,-.013,.261,.168],[0,.218,-.064,.226,.144],
    [0,.278,-.078,.133,.094]],6.8);
  carve(jaw,'dokkaebiShade',[[0,-.184,.036,.166,.067],[0,-.136,.100,.218,.098],
    [0,-.064,.138,.214,.091],[0,.018,.116,.187,.058]],8.4);
  carve(head,'dokkaebiSkin',[[0,-.066,.173,.073,.039],[0,-.029,.211,.095,.050],
    [0,.024,.188,.061,.063],[0,.122,.138,.034,.037]],9.9);
  carve(hair,'dokkaebiHair',[[0,-.152,-.053,.215,.115],[0,.01,-.035,.262,.164],
    [0,.143,-.044,.258,.151],[0,.279,-.123,.225,.138],[0,.339,-.133,.112,.102]],6.5);
  for(const side of sides){
    const p=path=>mirror(side,path);
    sweep(head,'dokkaebiInk',p([[.038,.039,.191,.015],[.092,.028,.212,.035],
      [.16,.063,.190,.037],[.213,.109,.114,.006]]));
    sweep(head,'dokkaebiSkin',p([[.058,.084,.219,.022],[.128,.106,.219,.046],
      [.206,.169,.154,.033],[.244,.208,.063,.004]]));
    k.mesh(head,'gem','glow',side*.130,.044,.211,.056,.012,.019,0,side*.45,side*.27);
    plate(head,'dokkaebiSkin',p([[.179,.083,.071],[.261,.145,.020],[.340,.225,-.042],[.331,.118,-.073],
      [.278,-.050,-.030],[.223,-.079,.047]]),.033);
    sweep(head,'dokkaebiInk',p([[.159,.037,.191,.011],[.186,-.045,.186,.033],
      [.192,-.111,.150,.024],[.168,-.149,.129,.004]]));
    sweep(jaw,'dokkaebiTooth',p([[.132,-.113,.192,.033],[.154,-.080,.223,.039],
      [.145,-.013,.221,.022],[.120,.024,.197,.003]]));
    for(let i=0;i<3;i++)sweep(head,'dokkaebiTooth',p([[.036+i*.036,-.093,.215,.019],
      [.037+i*.035,-.127,.229,.019],[.039+i*.034,-.146,.225,.004]]),7);
    for(let i=0;i<(mobile?6:9);i++){
      const x=.027+i*.025,u=1-i*.044;
      const lock=[[x,.037,-.137,.053],[x*1.48,.160*u,-.177-i*.012,.065],
        [x*1.53,.264*u,-.237-i*.011,.055],[x*1.7,.376*u,-.338-i*.012,.030],
        [x*1.68,.418*u,-.426+i*.011,.006]];
      sweep(hair,i%3?'dokkaebiHair':'dokkaebiScar',p(lock),13);
    }
  }
  return {head,jaw,hair};
}

function muscleSurface(mobile){
  const rings=mobile?28:38,segments=mobile?28:37;
  const geometry=sculptVolume([[0,-.435,-.074,.258,.195],[0,-.224,-.032,.308,.219],
    [0,.027,-.004,.357,.222],[0,.256,.028,.392,.230],[0,.496,.047,.519,.292],
    [0,.694,.037,.533,.303],[0,.834,.029,.410,.265],[0,.927,.077,.176,.128]],{
    sides:segments,rings,section:2.18,ridge:.045,seed:9.3,
  });
  const {position,color,uv}=geometry.attributes;
  const lobe=(x,y,centerX,centerY,width,height)=>Math.exp(-(((x-centerX)/width)**2+((y-centerY)/height)**2));
  for(let i=0;i<(rings+1)*(segments+1);i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),u=uv.getY(i);
    const side=Math.abs(x),front=Math.max(0,(z-.055)/.25),back=Math.max(0,(.035-z)/.28);
    const chest=lobe(side,y,.232,.566,.182,.147);
    const sternum=lobe(side,y,.029,.551,.039,.22);
    const ribs=lobe(side,y,.321,.349,.134,.167);
    const abs=lobe(side,y,.095,.225,.065,.25)*(.53+.47*Math.cos((y-.077)*27.3));
    const scapula=lobe(side,y+side*.35,.249,.691,.137,.151);
    const trapezius=lobe(side,y-side*.25,.128,.757,.117,.143);
    const lat=lobe(side,y-side*.47,.275,.238,.128,.16);
    const spine=lobe(side,y,.020,.38,.046,.49);
    const rise=front*(chest*.113+abs*.053+ribs*.028-sternum*.045);
    const dorsal=back*(scapula*.081+trapezius*.046+lat*.052-spine*.032);
    const flex=Math.sin(Math.PI*u)**.48;
    position.setZ(i,z+(rise-dorsal)*flex);
    position.setX(i,x+Math.sign(x)*flex*lat*.004);
    const weather=(Math.sin(x*68+y*87+z*13)+Math.cos(x*96-y*52+z*31))*.023;
    const texture=.80+weather+front*(.13*chest-.15*sternum)+back*(.09*scapula-.12*spine);
    const fade=lobe(side,y,.21,.37,.26,.49);
    color.setXYZ(i,texture*(.99-fade*.040),texture*(.89+fade*.14),texture*(.82+fade*.15));
  }
  geometry.computeVertexNormals();
  const normals=geometry.attributes.normal;
  const normal=new T.Vector3(),across=new T.Vector3();
  for(let row=0;row<=rings;row++){
    const first=row*(segments+1),last=first+segments;
    normal.fromBufferAttribute(normals,first).add(across.fromBufferAttribute(normals,last)).normalize();
    normals.setXYZ(first,normal.x,normal.y,normal.z);
    normals.setXYZ(last,normal.x,normal.y,normal.z);
  }
  return geometry;
}

function torso(k,g,body,mobile){
  const {plate,sweep}=g;
  k.geometry(body,'dokkaebiSkin',muscleSurface(mobile));
  for(const side of sides){
    const p=path=>mirror(side,path);
    for(let i=0;i<5;i++){
      const bind=k.bone(body,side*(.072+i*.088),.661+Math.sin(i*.34)*.175,.36-i*.036);
      k.mesh(bind,'round','dokkaebiSmelt',0,0,0,.051,.057,.046,.2,side*.33,.035);
      k.mesh(bind,'gem','dokkaebiCopper',.008,.010,.046,.022,.024,.007);
    }
    plate(body,'dokkaebiRed',p([[.033,-.139,.239],[.159,-.093,.211],[.345,-.154,.186],[.419,-.284,.115],
      [.343,-.402,.161],[.141,-.458,.241],[.052,-.348,.273]]),.076);
    sweep(body,'dokkaebiCopper',p([[.086,-.152,.267,.026],[.230,-.142,.240,.038],
      [.385,-.221,.170,.038],[.405,-.275,.14,.019],[.330,-.378,.178,.008]]),14);
  }
}

function makeClub(k,g,hand){
  const {carve,sweep,plate}=g;
  const holder=k.bone(hand,.011,-.092,.119);
  holder.name='山魈 · 銅釘木棒';
  holder.rotation.set(.21,.07,-.55);
  markEnemyWeapon(holder,[.026,1.77,.018],{width:.23});
  carve(holder,'dokkaebiWood',[[0,-.72,0,.066,.067],[0,-.398,0,.071,.074],[0,.181,0,.085,.078],
    [0,.358,.011,.143,.120],[.021,.602,.010,.180,.134],[.031,1.09,.009,.201,.147],
    [.036,1.312,.010,.187,.138],[.026,1.468,.006,.164,.122]],21.1);
  k.geometry(holder,'dokkaebiStone',sculptVolume([[.026,1.282,.006,.165,.123],
    [.028,1.349,.008,.201,.148],[.020,1.494,.010,.213,.161],
    [.044,1.656,-.006,.167,.141],[.028,1.736,-.016,.123,.109],
    [.016,1.743,-.019,.095,.079]],{sides:10,rings:14,section:2.32,ridge:.133,seed:44.2}));
  const collars=[[.406,.153,.124],[.688,.190,.142],[1.046,.217,.161],[1.311,.201,.151]];
  for(const [ring,[y,rx,rz]] of collars.entries()){
    const band=[];
    for(let face=0;face<=12;face++){
      const a=face*tau/12+.22;
      band.push([.022+Math.sin(a)*rx,y+Math.sin(a)*.017,Math.cos(a)*rz,.023]);
    }
    sweep(holder,ring%2?'dokkaebiSmelt':'dokkaebiCopper',band,17);
    for(let side=0;side<6;side++){
      const a=side*tau/6+ring*.57,cosine=Math.cos(a),sine=Math.sin(a);
      const point=(u,v,w)=>[.022+sine*(rx+w)+cosine*u,y+v,cosine*(rz+w)-sine*u];
      const stud=[point(-.041,-.044,.002),point(.039,-.052,.012),point(.054,.038,.027),
        point(.005,.061,.037),point(-.044,.049,.016)];
      plate(holder,ring%2?'dokkaebiSmelt':'dokkaebiCopper',stud,.026);
      if(ring>0&&side%2===0){
        sweep(holder,'dokkaebiCopper',[[...point(0,.006,.013),.037],[...point(.008,.036,.064),.039],
          [...point(.018,.066,.117),.024],[...point(.028,.093,.134),.003]],8);
      }
    }
  }
  for(let i=0;i<8;i++){
    const a=i*tau/8+.34;
    const grain=[[.48,.157,.112],[.641,.183,.135],[.862,.205,.151],[1.07,.216,.158],[1.29,.204,.152]];
    sweep(holder,'dokkaebiEndgrain',grain.map(([y,rx,rz],row)=>{
      const theta=a+Math.sin(i*3.7+row*1.24)*.069;
      return [.029+rx*Math.sin(theta),y,rz*Math.cos(theta),row===0||row===4?.003:.008];
    }),11);
  }
  for(let i=0;i<9;i++)sweep(holder,i%4?'dokkaebiSmelt':'dokkaebiCopper',[[.064,-.66+i*.091,0,.012],
    [0,-.63+i*.091,.071,.017],[-.071,-.61+i*.091,0,.011],[0,-.57+i*.091,-.072,.008]],9);
}

function limbs(k,g,body,side){
  const {carve,sweep,plate}=g,p=path=>mirror(side,path);
  const arm=k.bone(body,side*.465,.655,.048),elbow=k.bone(arm,side*.172,-.367,.115);
  const hand=k.bone(elbow,side*.081,-.328,.167),thigh=k.bone(body,side*.196,-.315,-.009);
  const boot=k.bone(thigh,side*.073,-.381,.032);
  carve(arm,'dokkaebiSkin',p([[.005,.039,.001,.156,.169],[.079,-.087,.011,.191,.203],
    [.154,-.206,.048,.177,.165],[.176,-.371,.115,.107,.105]]),7.7);
  carve(elbow,'dokkaebiSkin',p([[.004,-.029,.037,.116,.119],[.052,-.114,.074,.151,.143],
    [.066,-.237,.121,.124,.136],[.082,-.328,.170,.090,.089]]),8.6);
  for(let i=0;i<3;i++){
    const y=.06-i*.119,z=.167+i*.015;
    sweep(arm,'dokkaebiInk',p([[.104,y+.064,z,.013],[.157,y+.037,z+.047,.022],[.192,y-.021,z+.041,.017],
      [.151,y-.062,z+.037,.015],[.121,y-.041,z+.067,.003]]),14);
    const shape=p([[.051,-.073-i*.066,.187],[.140,-.063-i*.066,.184],[.201,-.092-i*.066,.108],
      [.161,-.151-i*.066,.148],[.043,-.157-i*.066,.192],[-.039,-.137-i*.066,.158]]);
    plate(elbow,'dokkaebiRed',shape,.039);
    sweep(elbow,'dokkaebiCopper',shape.slice(0,5).map(([x,h,z],i)=>[x,h-.006,z+.013,[.013,.023,.025,.019,.004][i]]));
  }
  carve(hand,'dokkaebiSkin',p([[.013,.015,.009,.079,.073],[.052,-.041,.064,.087,.083],
    [.071,-.111,.138,.102,.084],[.061,-.154,.167,.073,.061]]),5.1);
  for(let i=0;i<4;i++)sweep(hand,'dokkaebiShade',p([[.022+i*.026,-.051,.127,.018],
    [.015+i*.028,-.116,.173,.021],[.011+i*.029,-.174,.160,.012]]),8);
  if(side>0)makeClub(k,g,hand);
  carve(thigh,'dokkaebiDusk',p([[.022,-.001,-.015,.189,.151],[.043,-.173,.003,.213,.169],
    [.076,-.309,.044,.178,.132],[.077,-.387,.049,.112,.097]]),13);
  carve(boot,'dokkaebiSmelt',p([[.009,-.304,.195,.151,.095],[.016,-.252,.094,.187,.144],
    [.019,-.171,.011,.138,.131],[.019,-.025,-.002,.116,.107]]),9.9);
  for(let i=0;i<3;i++)sweep(boot,i%2?'dokkaebiCopper':'dokkaebiDusk',p([[.001,-.087-i*.051,.128,.024],
    [.080,-.092-i*.051,.113,.029],[.127,-.118-i*.051,.045,.017],
    [.108,-.124-i*.051,-.061,.005]]),9);
  return {arm,elbow,hand,thigh,boot,side};
}

export function sculptBronzeDokkaebi(k,entry,mobile){
  const g=tools(k,mobile),body=k.bone(k.root,0,1.025,0);
  torso(k,g,body,mobile);
  const {head,jaw,hair}=face(k,g,body,mobile);
  const joints=sides.map(side=>limbs(k,g,body,side));
  return {
    body,head,arms:joints.map(limb=>limb.arm),legs:joints.map(limb=>limb.thigh),
    catalogueSculpt:entry.id,sourceSculpt:true,pattern:'slam',inspectionHead:head,crest:k.bone(body,0,0,0),
    polishEnergy:{shape:'bolts',tint:0x78e3ef,anchor:body,offset:[0,.39,.052],span:[.97,.93,.88],
      weaponWidth:.58,emissionScale:.31},
    sourceDress(skin){
      for(const side of sides)for(let i=0;i<4;i++){
        const x=.092+i*.104,front=i<2?1:-1;
        const color=i%2?0x4c485b:0x803d37;
        skin.silk(body,'山魈 · 鎧下布襬',mirror(side,[[x,-.241,front*.230,.073],
          [x+.029,-.449,front*.258,.126],[x+.016,-.664,front*.316,.120],
          [x-.027,-.871,front*.367,.077],[x-.038,-.965,front*.304,.018]]),
        {style:'woven',tint:color,trim:0xa77a52,lining:0x473333,phase:side*.64+i*.95,flex:1.31});
      }
      return true;
    },
    cataloguePose({beat,wind,strike,travel,fall,step,stage,attackPattern}){
      const smash=attackPattern==='cleave'||attackPattern==='burst';
      const load=wind*(smash?1.23:.77),release=strike*(smash?1.24:.84);
      body.rotation.y=-load*.27+release*.31;
      head.rotation.y=Math.sin(beat*.52)*.10+load*.19-release*.13;
      jaw.rotation.x=.086+load*.19+release*.36+stage*.08;
      hair.rotation.x=Math.sin(beat*.63)*.063-load*.16+release*.21;
      for(const {arm,elbow,hand,thigh,boot,side} of joints){
        const pace=Math.cos(step+side*Math.PI*.5)*travel;
        arm.rotation.set(.07+pace*.38-load*(side>0?.98:.60)+release*.96,
          side*(.14+load*.36-release*.22),side*(.117+load*.36+fall*.21));
        elbow.rotation.x=.087+load*.56-release*.79;
        elbow.rotation.z=side*(.08+load*.23-release*.19);
        hand.rotation.x=load*.22-release*.23;
        thigh.rotation.x=pace*.67-release*.10;
        boot.rotation.x=-pace*.38+fall*.05;
      }
    },
  };
}
