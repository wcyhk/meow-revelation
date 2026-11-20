import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],TAU=Math.PI*2;
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const volume=(k,j,finish,path,mobile,options={})=>k.geometry(j,finish,sculptVolume(path,{
  sides:mobile?10:14,rings:mobile?12:18,section:2.39,ridge:.22,...options,
}));
const sweep=(k,j,finish,path,steps=10)=>k.sculpt.sweep(j,finish,path,{steps,sides:7,ridge:.20});
const plate=(k,j,finish,path,depth=.038)=>k.sculpt.plate(j,finish,path,depth,.012);

export const qiongFaceFinishes={
  qiongPelt:[0x495365,.08,.79,'hide'],qiongPale:[0x8996ab,.14,.68,'hide'],
  qiongMuzzle:[0x6d7d86,.18,.65,'bone'],qiongHorn:[0x99644f,.32,.59,'bone'],
  qiongClaw:[0xa9664e,.30,.54,'bone'],qiongRuff:[0x687b8d,.09,.74,'hide'],
};

export function qiongqiMask(k,head,mobile){
  volume(k,head,'qiongPelt',[[0,-.095,-.219,.172,.166],[0,-.034,-.085,.253,.204],[0,.049,.067,.253,.176],
    [0,.029,.191,.210,.158],[0,-.014,.311,.168,.107],[0,-.118,.401,.116,.079]],mobile,
  {section:2.65,ridge:.25,fur:true});
  volume(k,head,'qiongMuzzle',[[0,-.106,.216,.134,.082],[0,-.115,.324,.155,.098],
    [0,-.121,.416,.146,.081],[0,-.15,.455,.099,.052]],mobile,{section:2.85});
  const bridge=[[0,.186,.207],[.081,.145,.230],[.126,.059,.302],[.089,-.012,.388],
    [0,-.041,.428],[-.089,-.012,.388],[-.126,.059,.302],[-.081,.145,.230]];
  plate(k,head,'rind',bridge,.046);
  sweep(k,head,'qiongPale',[[0,.203,.192,.010],[0,.167,.258,.026],[0,.084,.356,.023],[0,.013,.422,.005]],13);
  volume(k,head,'deep',[[0,-.119,.322,.081,.041],[0,-.132,.407,.099,.052],[0,-.139,.449,.078,.034]],mobile,
  {sides:10,rings:9,section:2.54});
  const jaw=k.bone(head,0,-.171,.053);
  jaw.name='窮奇 · 角骨下顎';
  volume(k,jaw,'qiongPelt',[[0,-.056,-.052,.141,.101],[0,-.084,.103,.153,.113],
    [0,-.076,.242,.121,.091],[0,-.044,.353,.087,.045]],mobile,{section:2.72,fur:true,ridge:.29});
  const crown=k.bone(head,0,.172,-.075);
  crown.name='窮奇 · 赤骨冠';
  volume(k,crown,'qiongHorn',[[0,-.014,.149,.066,.054],[.018,.067,.056,.079,.059],[.039,.177,.002,.070,.055],
    [.021,.300,-.063,.042,.036],[.010,.465,-.127,.003,.005]],mobile,{section:2.66,ridge:.30});
  sweep(k,crown,'qiongPale',[[.009,.038,.171,.012],[.033,.141,.075,.031],[.035,.279,-.032,.020],[.015,.444,-.105,.004]],13);
  for(const side of sides){
    const r=path=>mirror(side,path);
    const brow=r([[.035,.114,.299],[.116,.167,.268],[.223,.191,.151],[.270,.151,.039],
      [.244,.088,.117],[.178,.065,.182],[.102,.077,.285],[.061,.040,.333]]);
    plate(k,head,'qiongPale',brow,.046);
    sweep(k,head,'qiongRuff',brow.slice(0,7).map(([x,y,z],i)=>[x+side*.019,y+.018,z+.011,[.012,.039,.043,.024,.019,.013,.004][i]]),
    13);
    const socket=r([[.068,.047,.313],[.142,.101,.285],[.218,.110,.203],[.243,.049,.151],
      [.209,.024,.190],[.153,.020,.277],[.100,.005,.311]]);
    plate(k,head,'deep',socket,.031);
    sweep(k,head,'ember',r([[.100,.050,.331,.005],[.144,.066,.311,.014],
      [.185,.072,.278,.015],[.212,.072,.239,.004]]),10);
    const cheek=r([[.080,-.079,.383],[.171,-.005,.310],[.262,.063,.116],[.293,.013,-.019],
      [.268,-.107,-.009],[.217,-.171,.164],[.149,-.183,.283],[.102,-.13,.382]]);
    plate(k,head,'qiongRuff',cheek,.054);
    sweep(k,head,'qiongPale',r([[.101,-.061,.391,.013],[.172,-.033,.352,.038],
      [.221,.014,.249,.052],[.250,.018,.102,.028],[.263,-.026,-.032,.004]]),14);
    volume(k,head,'qiongMuzzle',r([[.053,-.110,.385,.045,.035],[.114,-.134,.406,.063,.043],
      [.161,-.150,.374,.059,.044],[.193,-.158,.291,.042,.036],[.219,-.168,.188,.010,.008]]),
    mobile,{section:2.51,rings:13});
    volume(k,head,'qiongPale',r([[.112,-.121,.334,.040,.040],[.127,-.193,.387,.045,.042],
      [.139,-.249,.420,.031,.030],[.137,-.297,.415,.013,.014],[.112,-.318,.393,.004,.004]]),mobile,
    {section:2.44,sides:8,rings:10});
    for(let j=0;j<4;j++){
      const x=.056+j*.018,z=.358-j*.059;
      sweep(k,jaw,'qiongIce',r([[x,-.019,z,.021],[x+.017,.032,z+.029,.018],[x+.014,.064,z+.025,.004]]),8);
    }
    for(let i=0;i<(mobile?5:8);i++){
      const t=i/(mobile?4:7),shift=.059*t;
      volume(k,head,i%2?'qiongPelt':'qiongRuff',r([[.159+shift,.131-t*.29,-.025,.048,.044],
        [.254+shift,.075-t*.31,-.077,.059,.045],[.325+shift,.007-t*.31,-.223,.049,.040],
        [.332+shift,-.056-t*.32,-.367,.024,.023],[.285+shift,-.118-t*.32,-.464,.005,.006]]),
      mobile,{rings:9,sides:7,section:2.39,ridge:.33,fur:true,seed:i+41});
    }
    const ear=r([[.161,.205,-.091,.045,.045],[.245,.274,-.155,.052,.042],
      [.334,.319,-.238,.038,.031],[.383,.297,-.327,.004,.005]]);
    volume(k,head,'qiongHorn',ear,mobile,{sides:8,rings:11,ridge:.31});
    sweep(k,head,'qiongPale',ear.map(([x,y,z,w])=>[x+side*.016,y+.034,z+.011,w*.36]),10);
  }
  return {jaw,crown};
}

export function qiongqiFoot(k,heel,side,fore,mobile){
  const r=path=>mirror(side,path);
  volume(k,heel,'qiongPelt',r([[.011,.071,-.021,.058,.063],[.023,.018,.044,.072,.075],
    [.039,-.021,.127,.081,.057],[.032,-.035,.173,.057,.041]]),mobile,
  {sides:8,rings:9,section:2.68,ridge:.27});
  for(let i=0;i<3;i++){
    const x=(i-1)*.047,z=.129-Math.abs(i-1)*.020;
    volume(k,heel,fore?'qiongClaw':'qiongMuzzle',r([[x,-.004,z,.025,.025],[x+.014,-.021,z+.061,.030,.028],
      [x+.028,-.012,z+(fore?.131:.101),.023,.018],[x+.018,-.045,z+(fore?.171:.139),.016,.014],
      [x+.004,-.082,z+(fore?.192:.151),.003,.004]]),mobile,{sides:7,rings:9,section:2.45});
    if(fore&&i!==1)sweep(k,heel,'qiongHorn',r([[x+.006,.013,z+.019,.010],
      [x+.031,.011,z+.083,.015],[x+.033,.002,z+.128,.011],[x+.009,-.046,z+.169,.004]]),9);
  }
}

export const hornetRefitFinishes={
  waspCoal:[0x252719,.23,.60,'iron'],waspBronze:[0x8f8c32,.43,.52,'bronze'],waspOchre:[0xc1ad46,.35,.55,'bone'],
  waspAcid:[0x859837,.40,.49,'iron'],waspRed:[0x934e42,.39,.50,'bone'],waspEye:[0xaf4835,.29,.43,'gem'],
  waspWing:[0x829286,.03,.78,'hide'],waspVein:[0x6f7e4f,.21,.69,'hide'],
};

function hornetWing(k,root,side,rear,mobile){
  const length=rear?1.064:1.54,girth=rear?.243:.303;
  const point=(t,u)=>{
    const breadth=girth*Math.sin(Math.PI*t)**.91;
    return [side*(length*t-.037*Math.sin(t*Math.PI)),.231*t+.107*Math.sin(t*Math.PI)+.071*u*breadth,
      -.138*t-(rear?.26:.13)*t*t+u*breadth];
  };
  const rows=mobile?16:24,strips=mobile?8:11,points=[],colors=[],uv=[],faces=[];
  for(let row=0;row<=rows;row++)for(let strip=0;strip<=strips;strip++){
    const t=row/rows,u=strip/strips*2-1;
    points.push(...point(t,u));uv.push(strip/strips,t);
    const iridescence=.63+.29*Math.sin(Math.PI*t)+.11*Math.cos(u*13+t*8),
      tip=Math.pow(t,4)*.13;
    colors.push(iridescence+tip*.14,iridescence+tip*.33,iridescence+tip*.18);
    if(row===rows||strip===strips)continue;
    const a=row*(strips+1)+strip,b=a+strips+1;
    faces.push(a,b,a+1,a+1,b,b+1);
  }
  const membrane=new T.BufferGeometry().setIndex(faces);
  membrane.setAttribute('position',new T.Float32BufferAttribute(points,3));
  membrane.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  membrane.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  membrane.computeVertexNormals();
  k.geometry(root,'waspWing',membrane);
  const rail=Array.from({length:8},(_,i)=>{
    const t=i/7,p=point(t,-.73);
    return [...p,.016*(1-t)+.002];
  });
  sweep(k,root,'waspVein',rail,14);
  for(let i=0;i<(mobile?4:6);i++){
    const t=.15+i*.109;
    sweep(k,root,'waspVein',[point(t,-.69),point(t+.065,-.13),point(t+.135,.45),
      point(t+.211,.87)].map(([x,y,z],idx)=>[x,y+.005,z,[.009,.008,.006,.002][idx]]),8);
  }
  sweep(k,root,'waspVein',[point(.08,-.50),point(.37,-.16),point(.66,.11),point(.87,.40),point(.994,.32)]
    .map(([x,y,z],i)=>[x,y+.007,z,[.009,.012,.010,.006,.002][i]]),12);
}

function waspAbdomen(k,body,mobile){
  const joints=[];
  const profile=[
    [0,.009,-.087,.068,.071],[0,-.141,-.148,.112,.105],[0,-.201,-.246,.181,.153],
    [.015,-.415,-.289,.231,.192],[.016,-.652,-.237,.216,.199],[.012,-.810,-.077,.133,.136],
    [.011,-.875,.090,.069,.064],
  ];
  let parent=body;
  for(let i=0;i<profile.length-1;i++){
    const [x,y,z,r,d]=profile[i],[X,Y,Z,R,D]=profile[i+1],prior=i?profile[i-1]:[0,0,0];
    const j=k.bone(parent,x-prior[0],y-prior[1],z-prior[2]);
    j.name='未寄郵庭・倒頁書吏 · 腹節 '+(i+1);
    const dx=X-x,dy=Y-y,dz=Z-z;
    volume(k,j,'waspCoal',[[0,.032,-.008,r,r*.75],[dx*.4,dy*.34,dz*.51,r*.98,d],
      [dx,dy,dz,R,D]],mobile,{rings:10,sides:11,section:2.76,ridge:.19});
    if(i>0){
      const bandScale=i%2?.97:1.07;
      volume(k,j,i===1?'waspBronze':'waspAcid',[[0,-.013,-.015,r*bandScale,d*bandScale],
        [dx*.38,dy*.35,dz*.39,(r+R)*.56,(d+D)*.55],[dx*.63,dy*.58,dz*.64,(r+R)*.55,(d+D)*.53],
        [dx*.82,dy*.80,dz*.82,R*.99,D*.96]],mobile,{rings:10,sides:13,section:2.8,ridge:.26});
      for(const side of sides){
        sweep(k,j,'waspBronze',mirror(side,[[r*.74,-.022,.012,.012],[r*.98,dy*.33,dz*.36,.018],
          [R*.91,dy*.62,dz*.72,.014],[R*.78,dy*.80,dz*.91,.003]]),10);
      }
    }
    joints.push(j);parent=j;
  }
  const tip=k.bone(parent,.011-profile[5][0],-.875-profile[5][1],.090-profile[5][2]);
  tip.name='未寄郵庭・倒頁書吏 · 赤螫';
  volume(k,tip,'waspCoal',[[0,.055,-.074,.063,.061],[.002,-.035,.031,.056,.053],[.004,-.079,.141,.047,.039],
    [.009,-.106,.233,.023,.019],[.015,-.074,.309,.005,.005]],mobile,{rings:19,sides:11,section:2.54});
  sweep(k,tip,'waspRed',[[0,-.050,.061,.023],[.012,-.091,.159,.034],[.024,-.076,.252,.025],[.031,-.003,.320,.003]],14);
  sweep(k,tip,'waspOchre',[[.018,-.04,.075,.005],[.031,-.078,.173,.012],
    [.033,-.065,.248,.010],[.032,-.015,.302,.003]],11);
  return {joints,tip};
}

export function sculptKingHornet(k,entry,mobile){
  const body=k.bone(k.root,0,1.18,-.019),head=k.bone(body,0,.265,.267);
  volume(k,body,'waspCoal',[[0,-.261,-.163,.099,.105],[0,-.145,-.093,.189,.186],[0,.055,-.019,.259,.215],
    [0,.239,.017,.212,.193],[0,.31,.037,.134,.123]],mobile,{sides:mobile?12:17,rings:mobile?17:23,section:2.89,ridge:.23});
  volume(k,body,'waspBronze',[[0,-.141,.058,.092,.107],[0,-.058,.143,.155,.109],[0,.132,.155,.160,.128],
    [0,.277,.105,.126,.131]],mobile,{section:2.75,ridge:.21});
  volume(k,head,'waspOchre',[[0,-.161,-.048,.119,.113],[0,-.102,.023,.174,.145],[0,.038,.048,.200,.159],
    [0,.133,.014,.158,.123],[0,.197,-.058,.098,.107]],mobile,{section:2.78,ridge:.27});
  volume(k,head,'waspCoal',[[0,-.175,.085,.083,.080],[0,-.113,.104,.131,.084],[0,-.054,.109,.157,.117],
    [0,-.009,.155,.094,.074]],mobile,{rings:11,section:2.69});
  const {joints,tip}=waspAbdomen(k,body,mobile);
  const antennae=[],mandibles=[],wings=[],legs=[];
  for(const side of sides){
    const r=path=>mirror(side,path);
    const eye=k.bone(head,side*.142,.055,.112);
    eye.rotation.y=side*.51;
    volume(k,eye,'waspCoal',[[0,-.092,.014,.055,.055],[0,-.036,.062,.092,.071],
      [0,.059,.067,.104,.072],[0,.091,.016,.071,.05]],mobile,{rings:9,section:2.77});
    volume(k,eye,'waspEye',[[0,-.062,.059,.044,.029],[0,-.019,.101,.073,.053],[0,.037,.114,.068,.052],
      [0,.071,.090,.051,.032]],mobile,{rings:11,section:2.49});
    k.mesh(eye,'gem','glow',0,.023,.155,.027,.024,.014);
    sweep(k,eye,'waspOchre',[[-.030,.052,.128,.006],[.011,.075,.106,.009],[.044,.068,.094,.003]],8);
    const mandible=k.bone(head,side*.118,-.13,.068);
    volume(k,mandible,'waspBronze',r([[.026,-.004,.065,.056,.063],[.056,-.053,.136,.071,.058],
      [.052,-.137,.197,.054,.049],[.013,-.208,.245,.030,.025],[-.032,-.202,.276,.004,.005]]),
    mobile,{rings:14,section:2.85,ridge:.28});
    sweep(k,mandible,'waspOchre',r([[.034,.023,.073,.010],[.104,-.063,.149,.027],
      [.081,-.146,.223,.019],[-.012,-.193,.267,.004]]),11);
    const antenna=k.bone(head,side*.087,.124,.092);
    const feeler=r([[.004,.004,.016,.034],[.057,.126,.068,.039],[.116,.201,.170,.033],
      [.140,.156,.230,.033],[.167,.067,.310,.026],[.187,.024,.364,.005]]);
    sweep(k,antenna,'waspCoal',feeler,15);
    for(let i=0;i<4;i++){
      const [x,y,z,w]=feeler[i+1],next=feeler[i+2];
      const p=next.slice(0,3).map((v,j)=>v*[.40,.33,.49][j]+[x,y,z][j]*[.60,.67,.51][j]);
      sweep(k,antenna,'waspOchre',[[x,y,z,w*.91],[...p,w*.91]],6);
    }
    antennae.push({antenna,side});
    mandibles.push({mandible,side});
    for(let i=0;i<3;i++){
      const forward=i===0,hip=k.bone(body,side*(.138+i*.027),.09-i*.101,.156-i*.126);
      const elbow=k.bone(hip,side*(.20+i*.052),-.054-i*.052,.089-i*.036);
      const prong=k.bone(elbow,side*.103,-.184,.088);
      volume(k,hip,forward?'waspBronze':'waspCoal',r([[.034,.061,.004,.081,.069],[.129,-.018,.051,.088,.079],
        [.210+i*.037,-.037-i*.04,.080,.058,.046]]),mobile,{section:2.75});
      volume(k,elbow,'waspCoal',r([[.007,.016,.012,.059,.059],[.068,-.044,.043,.067,.053],
        [.113,-.144,.076,.057,.042],[.097,-.214,.098,.031,.030]]),mobile,{section:2.95,ridge:.28});
      sweep(k,elbow,'waspOchre',r([[.026,.033,.034,.022],[.101,-.028,.070,.027],[.151,-.119,.102,.017],
        [.122,-.194,.146,.005]]),10);
      sweep(k,prong,forward?'waspAcid':'waspBronze',r([[.015,.017,-.010,.029],[.054,-.071,.053,.035],
        [.063,-.103,.121,.024],[.020,-.119,.180,.004]]),11);
      if(forward)plate(k,elbow,'waspBronze',r([[.025,.010,.064],[.133,-.029,.089],[.169,-.112,.121],
        [.130,-.202,.139],[.063,-.156,.137],[.037,-.061,.105]]),.041);
      legs.push({hip,elbow,prong,side,i});
    }
    for(const rear of [false,true]){
      const socket=k.bone(body,side*(rear?.155:.194),rear?.208:.284,rear?-.112:-.019);
      socket.name='未寄郵庭・倒頁書吏 · '+(rear?'後翅':'前翅');
      hornetWing(k,socket,side,rear,mobile);
      wings.push({socket,side,rear});
    }
    const shoulder=r([[.05,.312,.036],[.153,.315,.053],[.267,.236,-.008],[.291,.114,-.076],
      [.217,.041,-.148],[.122,.112,-.170],[.066,.204,-.119]]);
    plate(k,body,'waspBronze',shoulder,.062);
    sweep(k,body,'waspOchre',shoulder.slice(1,6).map(([x,y,z],i)=>[x+side*.018,y+.014,z+.018,[.018,.031,.024,.013,.004][i]]),13);
  }
  const membrane=k.materials.waspWing;
  Object.assign(membrane,{transparent:true,opacity:.52,side:T.DoubleSide,depthWrite:false,forceSinglePass:true});
  const eyeFinish=k.materials.waspEye;eyeFinish.emissive.setHex(0xc14e2d);
  return {body,head,pattern:'flutter',crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,sourceSculpt:true,
    polishEnergy:{tint:0xdfd36c,shape:'embers',anchor:body,offset:[0,-.29,-.07],span:[.64,.62,.53]},
    cataloguePose({headtime,beat,wind,strike,stage,travel,fall}){
      head.rotation.x=Math.sin(beat*.40)*.095+wind*.32-strike*.36;
      for(const [i,joint] of joints.entries()){
        joint.rotation.x=.055*Math.cos(headtime*5-i*.57)+wind*.09-strike*.15;
        joint.rotation.z=(.024+i*.009)*Math.sin(beat*.20-i*.78);
      }
      tip.rotation.x=wind*.49-strike*.82;tip.rotation.y=.10*Math.sin(beat*.27)+strike*.19;
      for(const {antenna,side} of antennae)antenna.rotation.x=Math.sin(beat*.31+side)*.16+wind*.33-strike*.29;
      for(const {mandible,side} of mandibles)mandible.rotation.y=side*(.16+wind*.62-strike*.55);
      for(const {socket,side,rear} of wings){
        const t=headtime*(18.5+stage*2.1)-(rear?.69:0);
        socket.rotation.z=side*(.37+Math.sin(t)*(.49+travel*.24)-fall*.51);
        socket.rotation.y=side*(.12+Math.sin(t+.62)*.24+wind*.21);
        socket.rotation.x=rear?.14+.088*Math.sin(t-.38):.051*Math.sin(t);
      }
      for(const {hip,elbow,prong,side,i} of legs){
        hip.rotation.x=.18*Math.sin(beat*.37-i*.53)+wind*.35-strike*.41;
        elbow.rotation.z=side*(.12+wind*.39+strike*.52+.085*Math.cos(beat*.31-i*.41));
        prong.rotation.x=.12*Math.sin(beat*.34-i*.41)+strike*.49;
      }
      eyeFinish.emissiveIntensity=.19+wind*.43+strike*.75+stage*.14;
    }};
}
