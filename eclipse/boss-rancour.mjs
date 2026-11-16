import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const TAU=Math.PI*2;
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const plate=(k,g,m,p,d=.045)=>k.sculpt.plate(g,m,p,d,d*.27);
const wire=(k,g,m,p,mobile)=>k.sculpt.sweep(g,m,p,{steps:mobile?8:14,sides:mobile?5:7,ridge:.19});
const shape=(k,g,m,p,mobile,seed=0)=>k.geometry(g,m,sculptVolume(p,{rings:mobile?10:17,
  sides:mobile?8:13,section:2.36,ridge:.16,seed}));

export const rancourShapes={
  m035:{torso:[.375,.505,.488,.305],waist:.365,neck:.845,width:.36,skin:'ochre',shell:'clay',hair:'black'},
  m036:{torso:[.253,.310,.345,.214],waist:.272,neck:1.04,width:.317,skin:'ivory',shell:'cobalt',hair:'steel'},
  m037:{torso:[.267,.335,.375,.244],waist:.313,neck:.94,width:.330,skin:'skin',shell:'moss',hair:'black'},
  m038:{torso:[.344,.435,.455,.267],waist:.359,neck:.99,width:.375,skin:'ochre',shell:'black',hair:'ivory'},
};

const metalwork={
  m035:['black','clay','ochre','red'],m036:['cobalt','steel','ivory','dusk'],
  m037:['moss','jade','brass','teal'],m038:['black','brass','ochre','dusk'],
};

function edge(k,j,m,points,mobile,width=.014){
  wire(k,j,m,points.map(([x,y,z],i)=>[x,y,z,(i===0||i===points.length-1)?.004:width]),mobile);
}

function rivet(k,j,m,x,y,z,r=.022){
  k.mesh(j,'gem','black',x,y,z,r*1.26,r*1.23,r*.62);
  k.mesh(j,'gem',m,x,y,z+Math.sign(z)*r*.43,r,r,.66*r);
}

function facePlate(k,j,m,rim,p,d,mobile){
  plate(k,j,m,p,d);
  edge(k,j,rim,p.slice(0,p.length-1).map(([x,y,z])=>[x,y+.009,z+.009]),mobile,d*.23);
}

function coil(k,j,m,r,width,z,mobile,start=0,arc=TAU){
  const positions=[];
  for(let i=0;i<=14;i++){
    const a=start+arc*i/14;
    positions.push([Math.sin(a)*r,Math.cos(a)*r,z+.011*Math.sin(a*5),width]);
  }
  k.sculpt.sweep(j,m,positions,{steps:mobile?19:29,sides:mobile?6:9,ridge:.18});
}

function articulate(k,rig,id,mobile){
  const [base,steel,edgeFinish,fabric]=metalwork[id];
  const u=id==='m035'?1.23:id==='m036'?.73:id==='m037'?.81:1.03;
  for(const {shoulder,elbow,wrist,leg,knee,side} of rig.limbs){
    const f=x=>x*side;
    shape(k,shoulder,base,mirror(side,[[0,.067,-.02,.119*u,.11*u],[.071,-.082,-.018,.151*u,.133*u],
      [.112,-.211,.008,.129*u,.111*u],[.145,-.333,.01,.091*u,.088*u]]),mobile,3);
    shape(k,elbow,base,mirror(side,[[0,.042,.002,.10*u,.104*u],[.026,-.074,.018,.132*u,.118*u],
      [.034,-.224,.032,.108*u,.091*u],[.027,-.33,.053,.075*u,.074*u]]),mobile,9);
    shape(k,wrist,rancourShapes[id].skin,mirror(side,[[0,.035,.007,.056*u,.063*u],
      [.01,-.017,.023,.086*u,.077*u],[.017,-.092,.055,.065*u,.05*u]]),mobile,15);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.034*u;
      wire(k,wrist,i===1?edgeFinish:base,[[x,.004,.034,.019*u],[x,-.053,.089,.023*u],
        [x+f(.004),-.105,.108,.011*u]],mobile);
    }
    shape(k,leg,fabric,mirror(side,[[.003,.072,0,.14*u,.14*u],[.018,-.105,.003,.151*u,.127*u],
      [.03,-.273,-.028,.125*u,.108*u],[.028,-.432,-.062,.096*u,.109*u]]),mobile,4);
    shape(k,knee,id==='m037'?'moss':base,mirror(side,[[0,.05,0,.101*u,.110*u],[.016,-.128,-.011,.096*u,.093*u],
      [.023,-.27,.027,.087*u,.088*u],[.025,-.307,.137,.132*u,.059*u],[.022,-.313,.236,.081*u,.043*u]]),mobile,7);
    const apex=id==='m036'?.191:id==='m037'?.035:.110;
    facePlate(k,knee,steel,edgeFinish,mirror(side,[[.005,apex,.116],[.10*u,.017,.092],[.118*u,-.084,.105],
      [.071*u,-.247,.133],[.031,-.288,.164],[-.052*u,-.198,.124],[-.07*u,-.037,.125]]),.042,mobile);
    for(let i=0;i<3;i++)rivet(k,knee,edgeFinish,f(.059*u),.014-i*.072,.116+i*.018,.012);
  }
}

function furnace(k,rig,mobile,cloth,parts){
  const {body,head,limbs}=rig;
  const kiln=k.bone(limbs[0].shoulder,-.09,.15,-.019);
  kiln.rotation.z=-.26;
  const shell=[[0,-.19,-.02,.20,.165],[.02,-.049,0,.244,.181],[.025,.122,0,.203,.168],[.032,.29,-.06,.147,.134]];
  shape(k,kiln,'black',shell,mobile,33);
  for(let i=0;i<7;i++){
    const a=i*TAU/7,s=Math.sin(a),z=Math.cos(a);
    const flue=k.bone(kiln,.171*s,.27,.142*z-.032);
    flue.rotation.y=a;
    facePlate(k,flue,'clay','ochre',[[-.059,-.17,.002],[.051,-.174,.006],[.086,.024,.026],
      [.072,.16,.017],[.011,.198,-.033],[-.056,.136,-.009]],.068,mobile);
    wire(k,flue,'glow',[[-.008,-.104,.031,.004],[.017,-.014,.035,.011],
      [.014,.099,.042,.009],[.030,.141,.024,.003]],mobile);
  }
  const ironTail=k.bone(body,0,.633,-.284);
  for(let i=0;i<5;i++){
    const y=-i*.18;
    facePlate(k,ironTail,i%2?'clay':'black','ochre',[[.05,y,.033],[.222,y+.024,-.043],
      [.238,y-.118,-.069],[.13,y-.187,-.089],[-.093,y-.189,-.074],[-.191,y-.083,-.058],[-.182,y+.009,-.028]],.072,mobile);
    for(const sign of [-1,1])wire(k,ironTail,'glow',[[sign*.164,y-.003,-.085,.003],
      [sign*.122,y-.083,-.113,.016],[sign*.023,y-.163,-.121,.003]],mobile);
  }
  for(const {elbow,side} of limbs){
    const cuff=k.bone(elbow,side*.033,-.099,.027);
    cuff.rotation.y=side*.77;
    const height=side===1?.26:.204;
    for(let i=0;i<4;i++)facePlate(k,cuff,i%2?'clay':'black','ochre',mirror(side,[[.007,.101-i*.065,.111],
      [.137,.092-i*.071,.109],[.169,.047-i*.077,.061],[.118,-height*.20-i*.067,.129],
      [.033,-height*.38-i*.06,.147],[-.059,-height*.20-i*.065,.086]]),.054,mobile);
  }
  for(const s of [-1,1]){
    facePlate(k,body,'black','ochre',mirror(s,[[.027,.59,.23],[.279,.63,.155],[.382,.478,.182],
      [.321,.289,.262],[.16,.201,.317],[.039,.341,.335]]),.066,mobile);
    wire(k,body,'glow',mirror(s,[[.04,.36,.365,.004],[.131,.412,.342,.018],
      [.184,.338,.348,.017],[.293,.307,.311,.012],[.333,.402,.263,.003]]),mobile);
    cloth(body,'焦皮護裙',mirror(s,[[.134,-.04,.295,.157],[.234,-.28,.367,.168],
      [.242,-.58,.432,.161],[.174,-1.01,.483,.10]]),0x623127,0xac6b43,s,.89);
    cloth(body,'熔爐後片',mirror(s,[[.142,.50,-.258,.099],[.219,.17,-.361,.154],
      [.29,-.24,-.453,.135],[.372,-.796,-.548,.075]]),0x302727,0x89523d,s*.72,.79);
    wire(k,head,'clay',mirror(s,[[.048,.161,.129,.021],[.126,.214,.058,.043],
      [.208,.26,-.066,.061],[.246,.192,-.203,.032],[.281,.13,-.23,.003]]),mobile);
    facePlate(k,head,'black','ochre',mirror(s,[[.021,.104,.165],[.121,.129,.119],[.184,.07,.079],
      [.188,-.044,.076],[.105,-.101,.14],[.093,.021,.174]]),.033,mobile);
    wire(k,head,'glow',mirror(s,[[.098,.098,.167,.010],[.133,.078,.154,.019],
      [.162,.09,.127,.013],[.174,.051,.116,.003]]),mobile);
  }
  parts.push({j:kiln,x:-.06,axis:'x',m:.19},{j:ironTail,x:.03,axis:'x',m:.08});
}

function glacier(k,rig,mobile,cloth,parts){
  const {body,head,limbs}=rig;
  for(const {shoulder,elbow,side:s} of limbs){
    const shell=k.bone(shoulder,0,.045,-.024);
    for(let i=0;i<5;i++){
      const u=i*.058;
      facePlate(k,shell,i%2?'cobalt':'steel','ivory',mirror(s,[[.01,.102-u,.098],
        [.071,.233-u,.019],[.236-u*.14,.285-u,-.085],[.248-u*.21,.139-u,-.145],
        [.153,.032-u,.013],[.09,-.062-u,.132],[.025,-.018-u,.156]]),.039,mobile);
    }
    facePlate(k,elbow,'cobalt','steel',mirror(s,[[.037,.142,.121],[.144,.061,.082],[.124,-.11,.131],
      [.121,-.312,.157],[.030,-.354,.145],[-.025,-.141,.117],[-.044,.003,.111]]),.054,mobile);
    wire(k,elbow,'ivory',mirror(s,[[.041,.105,.15,.003],[.094,-.023,.156,.019],
      [.083,-.177,.167,.016],[.059,-.320,.174,.002]]),mobile);
    const gills=k.bone(body,s*.121,.716,-.14);
    gills.rotation.y=s*.30;
    for(let i=0;i<4;i++){
      const w=i*.052;
      facePlate(k,gills,i===0?'ivory':'steel','cobalt',mirror(s,[[.004-w*.3,.075,-.057],
        [.094+w,.159,-.113],[.181+w,.072,-.191],[.177+w,-.26-w,-.382],
        [.116+w,-.624-w*.75,-.455],[.07+w*.72,-.33,-.244],[.034,-.117,-.138]]),.04,mobile);
    }
    for(let i=0;i<3;i++){
      const u=i*.091;
      facePlate(k,body,i===1?'ivory':'cobalt','steel',mirror(s,[[.019,.45-u,.258],
        [.105,.52-u,.231],[.267,.61-u,.138],[.342,.554-u,.100],[.281,.423-u,.179],
        [.108,.362-u,.251],[.05,.295-u,.294]]),.047,mobile);
    }
    cloth(body,'冰蛟中裙',mirror(s,[[.103,-.035,.203,.105],[.144,-.31,.259,.109],
      [.135,-.72,.313,.110],[.164,-1.245,.326,.053]]),0x415a76,0xa2b8bb,s,.76);
    cloth(body,'冰裂背罩',mirror(s,[[.142,.65,-.19,.085],[.248,.24,-.376,.148],
      [.333,-.27,-.53,.175],[.401,-.92,-.702,.076]]),0x526f88,0xacc8cb,s*.75,1.15);
    edge(k,head,'steel',mirror(s,[[.077,.134,.112],[.145,.219,.07],[.188,.234,-.043],
      [.197,.295,-.177],[.254,.321,-.266]]),mobile,.019);
    facePlate(k,head,'steel','ivory',mirror(s,[[.068,.038,.156],[.134,.095,.121],[.174,.055,.078],
      [.169,-.077,.078],[.087,-.225,.154],[.073,-.119,.159],[.114,-.03,.129]]),.038,mobile);
    rivet(k,head,'glow',s*.114,.035,.171,.015);
    parts.push({j:shell,x:0,axis:'x',m:.13},{j:gills,x:s*.30,axis:'y',m:s*.23});
  }
}

function gale(k,rig,mobile,cloth,parts){
  const {body,head,limbs}=rig;
  const sail=k.bone(limbs[0].shoulder,-.082,.069,-.045);
  sail.rotation.y=-.17;
  for(let i=0;i<5;i++){
    const w=i*.074;
    const leaf=[[-.013,.086-w*.42,.087],[-.158,.123-w*.19,.051],[-.269-w*.30,.239-w*.47,-.093],
      [-.410-w*.42,.244-w*.78,-.432],[-.311-w*.34,.069-w*.65,-.291],[-.128,-.037-w*.61,.059]];
    facePlate(k,sail,i%2?'moss':'jade','brass',leaf,.039,mobile);
    wire(k,sail,'teal',[[-.062,.02-w*.37,.11,.004],[-.193,.107-w*.41,-.012,.019],
      [-.292-w*.33,.161-w*.6,-.171,.018],[-.402-w*.41,.22-w*.77,-.411,.003]],mobile);
  }
  for(const {elbow,side:s} of limbs){
    const twist=k.bone(elbow,s*.038,-.112,.026);
    const bands=[];
    for(let i=0;i<16;i++){
      const t=i/15,a=t*TAU*(s<0?1.12:1.71);
      bands.push([Math.sin(a)*.114,-.15+t*.304,Math.cos(a)*.105,.027+.004*Math.sin(a)]);
    }
    wire(k,twist,s<0?'jade':'brass',bands,mobile);
    facePlate(k,elbow,'moss','brass',mirror(s,[[.024,.036,.09],[.153,.056,.038],[.101,-.135,.127],
      [.036,-.295,.164],[-.026,-.077,.129]]),.039,mobile);
  }
  const stem=k.bone(body,-.036,.629,-.211);
  for(let i=0;i<3;i++)wire(k,stem,i===1?'brass':'jade',[[.035,.129,-.011,.035],[-.088-i*.058,.024,-.061,.032],
    [.039-i*.106,-.235,-.12-i*.024,.029],[.162-i*.134,-.35,-.21-i*.033,.021],
    [.154-i*.176,-.48-i*.034,-.23-i*.054,.004]],mobile);
  cloth(body,'左肩風幟',[[-.243,.49,-.144,.085],[-.421,.263,-.283,.132],[-.534,-.135,-.514,.156],
    [-.733,-.45,-.881,.041]],0x566d59,0xc0a76f,-.94,1.44);
  for(const s of [-1,1]){
    const tail=s===1?.87:1.01;
    for(let i=0;i<3;i++){
      const y=.11+i*.13;
      wire(k,body,i===1?'brass':'jade',mirror(s,[[.055,y-.10,.257,.011],[.132,y-.061,.281,.033],
        [.233,y+.023,.253,.039],[.335,y+.18,.156,.038],[.376,y+.274,.063,.005]]),mobile);
      rivet(k,body,'ochre',s*(.085+i*.01),y-.083,.287,.017);
    }
    cloth(body,'開衩披裳',mirror(s,[[.205,-.034,.23,.102],[.274,-.246,.287,.144],
      [.309,-.48,.343,.149],[.396,-tail,.382,.028]]),0x4d6043,0xb0a06d,s,1.38);
    wire(k,head,'jade',mirror(s,[[.066,.174,.129,.02],[.157,.219,.044,.03],
      [.258,.232,-.021,.031],[.361,.198,-.153,.011],[.421,.292,-.21,.003]]),mobile);
    wire(k,head,'brass',mirror(s,[[.037,.101,.144,.014],[.124,.12,.128,.025],
      [.164,.173,.06,.036],[.179,.206,-.027,.030],[.225,.269,-.12,.003]]),mobile);
    facePlate(k,head,'jade','moss',mirror(s,[[.083,.014,.155],[.159,.055,.105],[.187,.006,.089],
      [.157,-.063,.126],[.107,-.122,.155],[.125,-.061,.175]]),.03,mobile);
  }
  parts.push({j:sail,x:-.17,axis:'y',m:-.27},{j:stem,x:0,axis:'x',m:.14});
}

function thunder(k,rig,mobile,cloth,parts){
  const {body,head,limbs}=rig;
  const breast=k.bone(body,0,.419,.225);
  const yoke=[[-.214,.151,-.008],[-.098,.226,.035],[.096,.226,.035],[.214,.151,-.008],
    [.148,-.101,.064],[.017,-.177,.113],[-.148,-.101,.064]];
  facePlate(k,breast,'black','brass',yoke,.075,mobile);
  coil(k,breast,'brass',.114,.021,.078,mobile,.37,TAU-.74);
  coil(k,breast,'ochre',.072,.017,.098,mobile,-.12,TAU-.13);
  k.mesh(breast,'gem','glow',0,.004,.126,.034,.064,.03,0,0,-.31);
  const dynamo=k.bone(body,0,.456,-.29);
  dynamo.rotation.x=-.14;
  for(const [r,d,z] of [[.376,.047,0],[.285,.027,-.062],[.233,.035,-.103]]){
    coil(k,dynamo,'black',r,d,z,mobile);
    coil(k,dynamo,'brass',r,d*.46,z-.027,mobile,.16,TAU-.32);
  }
  for(let i=0;i<8;i++){
    const a=i*TAU/8,s=Math.sin(a),y=Math.cos(a);
    const arm=k.bone(dynamo,s*.28,y*.28,-.08);
    arm.rotation.z=-a;
    facePlate(k,arm,'ochre','brass',[[-.06,-.077,.014],[.061,-.077,.014],[.082,.079,-.019],
      [.047,.16,-.039],[-.044,.154,-.033],[-.075,.051,-.009]],.065,mobile);
    rivet(k,arm,'glow',0,.09,-.064,.025);
  }
  for(const {shoulder,elbow,leg,side:s} of limbs){
    const insulated=k.bone(shoulder,s*.094,.08,-.003);
    const bell=mirror(s,[[0,.035,-.036,.083,.087],[.028,.006,-.028,.153,.161],
      [.082,-.09,.002,.174,.158],[.097,-.214,.067,.189,.175]]);
    shape(k,insulated,'black',bell,mobile,44);
    for(let i=0;i<3;i++){
      const neck=k.bone(insulated,s*(.031+i*.034),-.029-i*.094,.026+i*.026);
      neck.rotation.x=Math.PI*.48;
      coil(k,neck,i===2?'ochre':'brass',.141+i*.015,.018+i*.007,.009,mobile,0,TAU);
    }
    const yoke=[[-.047,.084,.112],[.121,.103,.116],[.163,-.015,.077],[.153,-.227,.105],
      [.068,-.317,.154],[-.032,-.25,.133],[-.065,-.016,.131]];
    facePlate(k,elbow,'black','ochre',mirror(s,yoke),.05,mobile);
    edge(k,elbow,'glow',mirror(s,[[.012,.069,.149],[.110,.028,.166],[.053,-.067,.172],
      [.131,-.113,.169],[.066,-.264,.171]]),mobile,.013);
    const tassets=k.bone(leg,s*.034,-.071,.079);
    for(let i=0;i<3;i++){
      const p=i*.086;
      facePlate(k,tassets,i%2?'ochre':'black','brass',mirror(s,[[.004,-p,.077],[.122,.033-p,.062],
        [.16,-.031-p,.013],[.12,-.079-p,.078],[.030,-.103-p,.102],[-.073,-.058-p,.087]]),.04,mobile);
    }
    const hose=k.bone(body,s*.17,.64,-.1);
    wire(k,hose,'brass',mirror(s,[[.02,.025,.058,.018],[.251,.101,.021,.036],[.339,.10,-.211,.043],
      [.253,-.11,-.296,.037],[.133,-.221,-.192,.021]]),mobile);
    cloth(body,'雷銅後綬',mirror(s,[[.165,.17,-.238,.102],[.225,-.13,-.334,.136],
      [.271,-.53,-.449,.117],[.355,-.96,-.494,.068]]),0x443a52,0xba8b56,s,.92);
    parts.push({j:insulated,x:0,axis:'z',m:s*.16},{j:tassets,x:0,axis:'x',m:.12});
  }
  cloth(body,'雷誓前片',[[0,-.069,.239,.15],[.049,-.29,.269,.12],[.05,-.64,.309,.128],
    [.021,-1.09,.401,.071]],0x57413a,0xcd9c52,0,.82);
  const band=k.bone(head,0,.157,-.021);
  band.rotation.x=Math.PI*.44;
  coil(k,band,'brass',.234,.026,0,mobile,.24,TAU-.48);
  coil(k,band,'ochre',.162,.011,-.013,mobile);
  rivet(k,head,'glow',0,.146,.156,.044);
  for(const s of [-1,1]){
    const temple=k.bone(head,s*.137,.050,-.025);
    temple.rotation.y=s*.79;
    coil(k,temple,'brass',.086,.02,.031,mobile);
    rivet(k,temple,'glow',0,0,.055,.029);
    wire(k,head,'ochre',mirror(s,[[.127,.078,.079,.021],[.182,.064,-.036,.032],
      [.176,-.041,-.124,.024],[.086,-.114,-.139,.021],[.015,-.124,-.154,.005]]),mobile);
  }
  parts.push({j:dynamo,x:-.14,axis:'x',m:.15});
}

const sculpt={m035:furnace,m036:glacier,m037:gale,m038:thunder};

export function rancourGeometry(k,rig,id,mobile){
  const garments=[],parts=[];
  articulate(k,rig,id,mobile);
  const cloth=(parent,name,path,tint,trim,phase,flex)=>{
    garments.push({parent,name:name+' '+phase,path,tint,trim,phase,flex});
  };
  sculpt[id](k,rig,mobile,cloth,parts);
  const [shell,metal,rim]=metalwork[id];
  return {garments,focus(eye){
    const profile=id==='m035'?[[0,-.13,0,.069,.07],[0,-.02,.015,.109,.103],[.025,.093,.073,.089,.082],[.04,.22,.12,.009,.012]]:
      id==='m036'?[[0,-.17,0,.04,.042],[.017,-.06,.024,.099,.074],[.013,.077,.038,.111,.087],
        [-.034,.238,.019,.008,.01]]:
      id==='m037'?[[0,-.12,0,.062,.06],[0,-.04,.008,.122,.102],[.018,.09,.008,.118,.093],[.066,.16,-.04,.03,.04]]:
      [[0,-.12,-.075,.070,.07],[.01,-.022,.011,.151,.125],[.015,.105,.072,.139,.106],[.034,.209,.062,.071,.064]];
    shape(k,eye,metal,profile,mobile,31);
    const seal=k.bone(eye,0,.016,.095);
    coil(k,seal,shell,.106,.021,-.014,mobile);
    coil(k,seal,rim,.084,.014,.031,mobile,.20,TAU-.40);
    k.mesh(seal,'gem','glow',0,0,.064,.049,.057,.035);
  },pose({beat,wind,strike,travel}){
    for(const {j,x,axis,m} of parts){
      j.rotation[axis]=x+m*(Math.sin(beat*.83)*(.13+travel*.28)+wind*.49-strike*.71);
    }
  }};
}
