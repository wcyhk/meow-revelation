import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {bossSkin} from './boss-skin.mjs?v=boss-foundry-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const tube=(k,parent,finish,path,mobile,options={})=>k.geometry(parent,finish,sculptVolume(path,{
  sides:mobile?10:15,rings:mobile?13:20,section:2.25,ridge:.21,...options,
}));
const strand=(k,parent,finish,path,steps=10)=>{
  k.sculpt.sweep(parent,finish,path,{sides:6,steps,ridge:.17});
};
const facet=(k,parent,finish,path,depth=.039)=>k.sculpt.plate(parent,finish,path,depth,.014);

export const taotieFinishes={
  m132:{
    oldHide:[0x69251c,.12,.72,'hide'],oldShadow:[0x2c171b,.12,.76,'hide'],oldRind:[0x713225,.47,.51,'iron'],
    oldHorn:[0xbcb3a3,.27,.59,'bone'],oldClaw:[0xb3794e,.17,.58,'bone'],oldEmber:[0xc75026,.22,.59,'stone'],
    oldBurn:[0xe98a44,.22,.50,'stone'],oldSinew:[0x893a26,.07,.77,'hide'],oldAsh:[0xbe7250,.19,.65,'hide'],
  },
  m144:{
    oldHide:[0x332c2c,.11,.78,'hide'],oldShadow:[0x201c23,.07,.82,'hide'],oldRind:[0x3a3335,.51,.53,'iron'],
    oldHorn:[0x776f6a,.32,.61,'bone'],oldClaw:[0xa75648,.13,.67,'hide'],oldEmber:[0x8b3b28,.25,.63,'stone'],
    oldBurn:[0xe38a41,.40,.51,'bronze'],oldSinew:[0x503635,.07,.76,'hide'],oldAsh:[0x736565,.28,.63,'bone'],
  },
};

const forms={
  m132:{
    y:.72,head:[0,.473,.701],fore:[.339,.19,.466],rear:[.338,.126,-.626],stance:.57,
    belly:[[0,-.032,-.849,.224,.232],[0,.024,-.589,.319,.312],[0,.076,-.271,.358,.355],
      [0,.183,.07,.478,.412],[0,.33,.412,.473,.372],[0,.344,.647,.336,.284]],
    neck:[[0,.115,.392,.368,.311],[0,.191,.573,.343,.273],[0,.302,.709,.315,.243],[0,.388,.871,.206,.193]],
    tail:[[0,0,0,.129,.119],[.054,.05,-.35,.133,.113],[.12,.176,-.66,.089,.077],[-.021,.226,-.931,.048,.048],[-.11,.144,-1.17,.007,.004]],
    fin:[.40,.32,.24,.17],reach:.69,spike:.34,mask:.94,
  },
  m144:{
    y:.65,head:[0,.258,.695],fore:[.414,.15,.416],rear:[.356,.111,-.572],stance:.61,
    belly:[[0,-.058,-.897,.251,.236],[0,.01,-.646,.388,.345],[0,.107,-.314,.447,.397],
      [0,.149,.105,.543,.426],[0,.156,.441,.499,.391],[0,.174,.64,.347,.256]],
    neck:[[0,.039,.353,.410,.324],[0,.112,.535,.387,.310],[0,.154,.687,.320,.236],[0,.181,.826,.246,.187]],
    tail:[[0,.02,.048,.158,.111],[-.10,.143,-.310,.132,.121],[-.309,.343,-.57,.089,.080],
      [-.409,.499,-.83,.057,.053],[-.31,.683,-.961,.008,.005]],
    fin:[.77,.51,.43,.25],reach:.99,spike:.61,mask:1.12,
  },
};

function mask(k,head,form,ancient,mobile){
  const {mask:w}=form;
  const z=ancient?.341:.279;
  tube(k,head,'oldShadow',[[0,-.13,-.214,.229,.146],[0,-.079,-.067,.268,.210],
    [0,.004,.093,.369*w,.228],[0,.118,.194,.319*w,.217],[0,.189,z,.254*w,.119]],mobile,{section:2.55});
  tube(k,head,'oldRind',[[0,-.121,.042,.168,.147],[0,-.104,.239,.251*w,.123],
    [0,-.062,z+.051,.214*w,.112],[0,-.052,z+.144,.151*w,.071]],mobile,{section:3.11,ridge:.25});
  const jaw=k.bone(head,0,-.154,.061);
  tube(k,jaw,'oldHide',[[0,-.019,-.03,.225*w,.105],[0,-.064,.14,.271*w,.118],[0,-.06,.319,.230*w,.086],
    [0,-.034,z+.17,.146*w,.049]],mobile,{section:2.52});
  facet(k,head,'oldRind',[[-.09,.176,z],[0,.352,z-.146],[.09,.176,z],[.139,.093,z+.016],
    [.122,.007,z+.049],[0,-.012,z+.073],[-.122,.007,z+.049],[-.139,.093,z+.016]],.062);
  strand(k,head,ancient?'oldBurn':'oldHorn',[[0,.355,z-.121,.007],[.008,.267,z-.036,.039],[0,.121,z+.058,.034],
    [0,.022,z+.094,.008]],12);
  for(const side of sides){
    const r=path=>mirror(side,path);
    const bone=r([[.028,.134,z+.039],[.147,.223,z+.027],[.284*w,.24,z-.071],
      [.401*w,.202,z-.271],[.372*w,.050,z-.283],[.281*w,.026,z-.130],[.153,.055,z+.012],[.044,.078,z+.073]]);
    facet(k,head,'oldRind',bone,.056);
    strand(k,head,ancient?'oldBurn':'oldHorn',bone.slice(1,6)
      .map(([x,y,z],i)=>[x+side*.018,y+.019,z+.019,[.024,.053,.073,.033,.004][i]]),14);
    const socket=r([[.091,.06,z+.056],[.154,.114,z+.049],[.241,.143,z-.015],[.275,.114,z-.075],
      [.193,.063,z-.013],[.116,.048,z+.052]]);
    facet(k,head,'oldShadow',socket,.029);
    strand(k,head,'glow',r([[.119,.071,z+.066,.005],[.156,.086,z+.058,.014],
      [.194,.102,z+.028,.014],[.239,.117,z-.017,.004]]));
    for(let layer=0;layer<3;layer++){
      const x=.251*w+layer*.057,y=.028-layer*.055;
      const angle=ancient?-.100:-.045;
      const shingle=r([[x-.053,y+.067,z+.093+angle],[x+.079,y+.112,z-.006+angle],[x+.148,y+.039,z-.109+angle],
        [x+.119,y-.080,z-.102+angle],[x+.066,y-.114,z-.031+angle],[x-.011,y-.054,z+.065+angle]]);
      facet(k,head,layer===0?'oldRind':'oldHide',shingle,.044);
      strand(k,head,ancient?'oldHorn':'oldEmber',shingle.slice(1,5).map(([x,y,z],i)=>[x+side*.032,y,z-.022,[.019,.025,.015,.004][i]]));
    }
    const great=ancient?
      [[.243,.111,-.093,.107,.103],[.431,.14,-.231,.133,.119],[.628,.194,-.373,.095,.084],
        [.767,.288,-.621,.064,.055],[.716,.423,-.807,.007,.008]]:
      [[.223,.156,-.158,.107,.121],[.461,.244,-.188,.117,.099],[.59,.431,-.342,.097,.080],
        [.606,.716,-.385,.064,.072],[.561,.95,-.301,.007,.005]];
    tube(k,head,ancient?'oldRind':'oldHorn',r(great),mobile,{section:2.68,ridge:.28,rings:18});
    const edging=great.map(([x,y,z,width],i)=>[x+.025,y+.019,z+.032,width*(i===0?.39:.47)]);
    strand(k,head,ancient?'oldHorn':'oldShadow',r(edging),15);
    if(!ancient){
      const browhorn=[[.305,.077,.035,.118,.091],[.465,.054,.081,.111,.106],[.611,.094,.088,.094,.092],
        [.746,.219,.063,.078,.07],[.805,.365,.040,.046,.04],[.802,.518,.041,.005,.006]];
      tube(k,head,'oldHorn',r(browhorn),mobile,{section:2.59,ridge:.31,rings:19});
      strand(k,head,'oldRind',r(browhorn.map(([x,y,z,r])=>[x+.018,y+.025,z+.036,r*.39])),15);
    }
    for(let i=0;i<(mobile?4:6);i++){
      const v=i/(mobile?4:6),h=ancient?.15+v*.257:.326+v*.487;
      const x=ancient?.437+v*.282:.491+Math.sin(v*1.9)*.122;
      const zz=ancient?-.26-v*.44:-.23-v*.147;
      strand(k,head,ancient?'oldBurn':'oldRind',r([[x-.067,h+.016,zz+.068,.012],
        [x+.001,h+.008,zz+.096,.018],[x+.062,h+.023,zz+.045,.019],[x+.069,h+.042,zz-.033,.003]]),8);
    }
    const tusk=r(ancient?[[.174,-.028,z+.049,.073,.063],[.224,-.074,z+.107,.066,.060],
      [.28,-.161,z+.199,.044,.038],[.292,-.274,z+.225,.022,.019],[.285,-.311,z+.199,.004,.003]]:
      [[.164,-.031,z+.025,.068,.061],[.251,-.067,z+.093,.072,.063],[.34,-.172,z+.149,.049,.043],
        [.404,-.184,z+.233,.032,.027],[.397,-.151,z+.283,.004,.003]]);
    tube(k,head,ancient?'oldClaw':'oldHorn',tusk,mobile,{sides:8,ridge:.14});
    for(let fang=0;fang<4;fang++){
      const x=.036+fang*.052;
      strand(k,jaw,fang===3?'oldClaw':'oldHorn',r([[x,-.018,z+.120-fang*.041,.026],
        [x+.009,.048,z+.151-fang*.042,.023],[x+.002,.070+(fang%2)*.021,z+.147-fang*.038,.004]]),8);
    }
  }
  return jaw;
}

function bodyScutes(k,body,form,ancient,mobile){
  const {fin,reach,spike}=form;
  const pieces=[];
  for(const side of sides)for(let i=0;i<(mobile?5:7);i++){
    const t=i/(mobile?4:6),x=.216+Math.sin(t*2.5)*.15,y=.503-.078*t,z=.476-t*1.186;
    const plateHeight=fin[i%fin.length]*(.85+(1-t)*.19);
    const anchor=k.bone(body,side*x,y,z);
    anchor.name='饕餮 · 背甲 '+(i+1);
    const r=path=>mirror(side,path);
    const reachX=(ancient?.345:.252)*(.76+.31*t);
    const trough=ancient?.245:.182;
    tube(k,anchor,'oldRind',r([[.002,.008,.052,.115,.155],[.069,.053,-.034,.138,.144],
      [.126,.133+plateHeight*.17,-.123,.125,.104],[.183+reachX*.35,.116+plateHeight*.59,-.26,.074,.062],
      [reachX,.10+plateHeight*.86,-.316-(ancient?t*.22:0),.043,.072],
      [reachX+.058,plateHeight+.122,-.431-(ancient?t*.31:0),.006,.008]]),mobile,{section:2.77,ridge:.26});
    const shell=r([[.015,.054,.129],[.159,.077,.046],[.255,.104,-.119],
      [reachX+.128,plateHeight*.63,-.295*reach],[reachX+.123,plateHeight*.59,-.467*reach],
      [reachX*.83,.044,-.461*reach],[.055,-trough*.69,-.244],[.054,-trough*.65,.032]]);
    facet(k,anchor,i%3===1?'oldHide':'oldRind',shell,.052);
    strand(k,anchor,'oldBurn',r([[.024,.108,.072,.015],[.106,.127,-.037,.035],[.177,.151+plateHeight*.27,-.13,.026],
      [reachX*.89,plateHeight*.72,-.276,.022],[reachX+.061,plateHeight+.087,-.468,.004]]),14);
    if(ancient){
      const raised=[.025,.093,.06,.026,.004];
      strand(k,anchor,i%2?'oldEmber':'oldRind',shell.slice(1,6).map(([x,y,z],j)=>[x+side*.028,y+.028,z,raised[j]]),12);
    }
    const opening=r([[.068,-.034,.038,.020],[.163,-.064,-.057,.032],[.231,-.105,-.141,.030],
      [reachX+.059,-.121,-.266,.011],[reachX+.077,-.091,-.319,.004]]);
    strand(k,anchor,'oldShadow',opening,12);
    const hot=opening.map(([x,y,z,w])=>[x+side*.019,y+.038,z+.012,w*.50]);
    strand(k,anchor,i%2?'oldEmber':'glow',hot,11);
    pieces.push({anchor,side,t});
  }
  for(let i=0;i<5;i++){
    const z=.374-i*.248,y=.55-i*.021,growth=Math.sin((i+1)*.45)*spike;
    strand(k,body,ancient?'oldRind':'oldHorn',[[0,y-.024,z+.096,.137],[0,y+.055,z,.164],
      [.022,y+.151+growth*.41,z-.081,.074],[.049,y+.209+growth,z-.195,.032],[.035,y+.266+growth,z-.293,.004]],15);
    strand(k,body,'oldBurn',[[0,y+.053,z+.112,.020],[.005,y+.168,z+.016,.035],
      [.031,y+.24+growth*.67,z-.099,.024],[.040,y+.254+growth,z-.279,.004]],10);
  }
  return pieces;
}

function taotieAbdomen(k,body,form,ancient,mobile){
  const core=form.belly.map(([x,y,z,width,depth],i)=>[x,y+.024,z,width*(i<4?.85:1),depth*(i<4?.90:1)]);
  tube(k,body,'oldHide',core,mobile,{rings:mobile?19:25,sides:mobile?15:21,section:2.39,ridge:.23});
  const partitions=[];
  for(const side of sides){
    const r=path=>mirror(side,path);
    const flank=k.bone(body,0,0,0);
    flank.name='饕餮 · 腹斜肌';
    tube(k,flank,'oldSinew',r([[.208,-.143,-.727,.099,.107],[.327,-.095,-.553,.158,.151],
      [.386,-.054,-.297,.138,.143],[.441,.019,-.055,.155,.124],[.439,.117,.24,.139,.118],
      [.344,.171,.430,.089,.094]]),mobile,{section:2.77,rings:17,ridge:.31});
    tube(k,flank,'oldShadow',r([[.090,-.178,-.721,.093,.067],[.197,-.239,-.540,.137,.070],
      [.244,-.281,-.224,.145,.070],[.289,-.281,.037,.128,.083],[.293,-.191,.322,.112,.080]]),
    mobile,{section:2.41,rings:15});
    for(let i=0;i<(mobile?4:5);i++){
      const t=i/(mobile?3:4),z=.288-t*.917;
      const x=.481-Math.sin(t*1.55)*.112,y=.137-.187*t;
      const rib=r([[x-.080,y+.176,z+.055,.063,.052],[x+.017,y+.111,z+.038,.067,.060],
        [x+.039,y+.005,z-.035,.053,.049],[x-.012,y-.151,z-.091,.040,.041],
        [x-.139,y-.214,z-.103,.015,.015],[x-.22,y-.199,z-.099,.006,.004]]);
      tube(k,flank,ancient?(i%2?'oldRind':'oldSinew'):(i<2?'oldRind':'oldSinew'),rib,mobile,
      {rings:9,sides:8,section:2.66,ridge:.30});
      const rim=r([[x+.007,y+.126,z+.089,.023],[x+.062,y+.056,z+.042,.029],
        [x+.062,y-.062,z-.04,.025],[x-.003,y-.156,z-.093,.016],[x-.105,y-.201,z-.096,.004]]);
      strand(k,flank,ancient?(i%2?'oldAsh':'oldHorn'):'oldAsh',rim,10);
    }
    const fascia=r([[.434,.172,.185,.026],[.505,.027,-.019,.045],[.459,-.087,-.238,.057],
      [.419,-.152,-.471,.037],[.303,-.147,-.709,.004]]);
    strand(k,flank,ancient?'oldAsh':'oldEmber',fascia,16);
    partitions.push({flank,side});
  }
  return partitions;
}

function taotieHaunch(k,hip,side,ancient,mobile){
  const r=path=>mirror(side,path);
  const glute=k.bone(hip,0,0,0);
  glute.name='饕餮 · 臀肌與骶骨';
  tube(k,glute,'oldSinew',r([[-.167,.174,-.113,.122,.064],[-.098,.163,-.202,.194,.103],
    [.039,.097,-.241,.169,.132],[.174,-.014,-.187,.135,.108],[.169,-.159,-.09,.080,.079],
    [.112,-.269,.014,.051,.048]]),mobile,{section:2.55,ridge:.30});
  tube(k,glute,'oldShadow',r([[-.051,.089,-.283,.122,.071],[.087,.038,-.303,.143,.095],
    [.147,-.073,-.240,.123,.081],[.164,-.181,-.145,.076,.063],[.134,-.254,-.064,.041,.040]]),
  mobile,{section:2.72,ridge:.27});
  if(ancient){
    for(let i=0;i<3;i++){
      const y=.065-i*.094,z=-.31+i*.035;
      const shield=r([[-.13,y+.104,z+.085],[.010,y+.138,z-.013],[.183,y+.103,z-.015],
        [.249,y+.027,z+.068],[.203,y-.061,z+.046],[.06,y-.096,z-.046],[-.091,y-.036,z-.019]]);
      facet(k,glute,i===0?'oldRind':'oldHide',shield,.063);
      const ridge=shield.slice(1,6).map(([x,y,z],j)=>[x+side*.014,y+.018,z-.030,[.013,.043,.033,.024,.006][j]]);
      strand(k,glute,i===1?'oldBurn':'oldAsh',ridge,12);
    }
  }else{
    for(let i=0;i<(mobile?5:8);i++){
      const t=i/(mobile?4:7),y=.185-t*.36,z=-.249+t*.09,x=-.122+t*.24;
      const tendon=r([[x-.02,y+.032,z+.049,.052,.031],[x+.107,y+.025,z-.066,.057,.041],
        [x+.176,y-.043,z-.146,.041,.033],[x+.220,y-.102,z-.202,.025,.019],[x+.253,y-.148,z-.243,.006,.006]]);
      tube(k,glute,i%3?'oldSinew':'oldRind',tendon,mobile,{rings:8,sides:7,section:2.38,ridge:.33,fur:true});
      if(i%2===0)strand(k,glute,'oldAsh',tendon.map(([x,y,z,w])=>[x,y+.041,z-.019,w*.26]),9);
    }
  }
  return glute;
}

function buildLeg(k,body,side,fore,pivot,ancient,mobile){
  const [x,y,z]=pivot,r=path=>mirror(side,path);
  const hip=k.bone(body,side*x,y,z);
  const knee=k.bone(hip,side*(fore?.100:.145),fore?-.231:-.245,fore?.093:.165);
  const ankle=k.bone(knee,side*(fore?.048:.064),fore?-.258:-.201,fore?.112:-.114);
  hip.name=fore?'饕餮 · 肩骨':'饕餮 · 髖骨';
  ankle.name=fore?'饕餮 · 前腕':'饕餮 · 後踝';
  const glute=fore?null:taotieHaunch(k,hip,side,ancient,mobile);
  const thigh=fore?.206:ancient?.258:.199;
  const elbow=fore?.038:.133;
  tube(k,hip,'oldHide',r([[.005,.109,-.052,thigh*.77,thigh*.83],
    [.09,.014,elbow*.14,thigh,thigh*.91],[.146,-.125,elbow*.58,thigh*.86,thigh*.80],
    [.124,-.241,elbow,thigh*.61,thigh*.65]]),mobile,{section:2.65,ridge:.28});
  tube(k,knee,'oldShadow',r([[.018,.047,.004,thigh*.62,thigh*.67],
    [.062,-.055,fore?.103:-.022,thigh*.61,thigh*.59],[.075,-.136,fore?.119:-.091,thigh*.53,thigh*.53],
    [.044,-.255,fore?.085:-.111,thigh*.43,thigh*.49]]),mobile,{section:2.43});
  for(let row=0;row<3;row++){
    const d=row*.078,y=.082-d,z=elbow*.24;
    const scale=r([[.072,y+.057,z+.14],[.185,y+.063,z+.109],[.264,y+.017,z+.014],
      [.229,y-.057,z-.16],[.146,y-.141,z-.123],[.091,y-.092,z+.056]]);
    facet(k,hip,row===0?'oldRind':'oldShadow',scale,.047);
    strand(k,hip,ancient?'oldHorn':'oldEmber',scale.slice(1,5).map(([x,y,z],i)=>[x+side*.029,y+.018,z-.024,[.015,.042,.019,.004][i]]),10);
    const tendril=r([[.040,y+.008,.068,.022],[.102,y-.049,.130,.030],[.133,y-.098,.164,.019],[.112,y-.128,.185,.006]]);
    if(fore||row<2)strand(k,knee,'oldRind',tendril,8);
  }
  tube(k,ankle,ancient?'oldClaw':'oldHide',r([[0,.052,-.045,.112,.113],[.031,-.019,.003,.143,.138],
    [.047,-.069,.106,.151,.129],[.051,-.101,.183,.119,.086]]),mobile,{section:2.41});
  const toes=[];
  for(let digit=0;digit<4;digit++){
    const localX=(digit-1.4)*.075;
    const pivot=k.bone(ankle,side*localX,-.064,.119);
    const z=ancient?.23:.19;
    tube(k,pivot,ancient?'oldClaw':'oldHide',r([[.018,.017,.021,.047,.046],[.033,-.004,.078,.049,.047],
      [.028,-.014,.138,.042,.038],[.028,-.024,z,.029,.028]]),mobile,{sides:8,rings:8,section:2.3});
    strand(k,pivot,ancient?'oldHorn':'oldClaw',r([[.028,-.007,z-.045,.034],[.032,.009,z+.003,.039],
      [.037,-.014,z+.070,.025],[.043,-.063,z+.104,.004]]),9);
    toes.push(pivot);
  }
  return {hip,knee,ankle,toes,side,fore,glute};
}

function tailRig(k,body,path,ancient,mobile){
  const mount=k.bone(body,0,.142,-.798);
  const links=[];
  let parent=mount;
  for(let i=0;i<path.length-1;i++){
    const [x,y,z,w,d]=path[i],[X,Y,Z,W,D]=path[i+1];
    const [px,py,pz]=i===0?[0,0,0]:path[i-1];
    const link=k.bone(parent,x-px,y-py,z-pz);
    tube(k,link,i%2?'oldRind':'oldHide',[[0,0,.046,w,d],
      [(X-x)*.54,(Y-y)*.54,(Z-z)*.54,(w+W)*.54,(d+D)*.54],[X-x,Y-y,Z-z,W,D]],mobile,{rings:8});
    strand(k,link,ancient?'oldBurn':'oldHorn',[[.007,.036,.012,w*.33],[(X-x)*.83,(Y-y)*.49+.075,(Z-z)*.49,W*.56],
      [X-x,Y-y+.020,Z-z,W*.15]],8);
    links.push(link);parent=link;
  }
  return links;
}

export function sculptTaotie(k,entry,mobile){
  const form=forms[entry.id],ancient=entry.id==='m144';
  const body=k.bone(k.root,0,form.y,0),head=k.bone(body,...form.head);
  body.name='饕餮 · 軀幹';
  const abdomen=taotieAbdomen(k,body,form,ancient,mobile);
  tube(k,body,'oldRind',form.neck,mobile,{rings:mobile?15:20,section:2.61,ridge:.19});
  const jaw=mask(k,head,form,ancient,mobile);
  const scutes=bodyScutes(k,body,form,ancient,mobile),tail=tailRig(k,body,form.tail,ancient,mobile);
  const limbs=sides.flatMap(side=>[buildLeg(k,body,side,true,form.fore,ancient,mobile),
    buildLeg(k,body,side,false,form.rear,ancient,mobile)]);
  const membrane=bossSkin(k,mobile,tools=>{
    const shade=ancient?0x382a2f:0x703328,hem=ancient?0xaf603e:0xd99259;
    for(const side of sides){
      const r=path=>mirror(side,path);
      tools.silk(body,entry.name+' · 頸側皮摺',r([[.291,.45,.63,.064],[.395,.285,.541,.092],
        [.498,.112,.38,.085],[.546,-.041,.247,.041],[.526,-.18,.133,.008]]),
      {tint:shade,trim:hem,phase:side*.83,flex:1.17,style:'membrane',across:[.40,.05,.74]});
      tools.silk(head,entry.name+' · 頜側鬃皮',r([[.319,.022,.166,.055],[.379,-.077,.122,.091],
        [.407,-.184,.038,.091],[.371,-.296,-.065,.038],[.328,-.362,-.169,.009]]),
      {tint:shade,trim:hem,phase:side*.77+.39,flex:1.24,style:'membrane',across:[.59,.04,.74]});
    }
    return true;
  });
  for(const side of sides)for(let row=0;row<(mobile?4:6);row++){
    const z=.339-row*.238,span=side*(.503-Math.max(0,row-1)*.032);
    strand(k,body,row%2?'oldHide':'oldEmber',[[span*.871,.361,z,.038],[span,.164,z,.046],
      [span*.943,-.011,z-.084,.041],[span*.769,-.137,z-.148,.020],[span*.520,-.183,z-.171,.004]],10);
  }
  const hot=k.materials.oldBurn;
  hot.emissive.setHex(ancient?0xfa5b10:0xe45117);
  return {
    body,head,skin:membrane,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,sourceSculpt:true,grounded:true,pattern:'crawl',
    polishEnergy:{tint:ancient?0xffa047:0xff7a51,shape:'embers',anchor:body,span:[1.10,.64,1.28]},
    cataloguePose({beat,headtime,wind,strike,travel,fall,step,stage}){
      const g=Math.min(1,travel),pulse=Math.sin(beat*.62);
      hot.emissiveIntensity=.17+wind*.40+strike*.82+stage*.18;
      head.rotation.set(.046*pulse+wind*.19-strike*.39,.093*Math.sin(headtime*2.7)+strike*.18,fall*.29);
      jaw.rotation.x=.045+wind*.29+strike*.71+stage*.17;
      body.rotation.x=wind*-.145+strike*.26+Math.sin(step*1.89)*g*.05;
      for(const {hip,knee,ankle,toes,side,fore,glute} of limbs){
        const cycle=step+side*Math.PI*.50+(fore?0:Math.PI),move=Math.sin(cycle),lift=Math.max(0,move)*g;
        hip.rotation.x=g*move*(fore?.38:form.stance)+wind*.15-strike*(fore?.43:.19);
        hip.rotation.z=side*(fall*.35+.064*lift+strike*.07);
        knee.rotation.x=-lift*(fore?.51:.75)+wind*.18+fall*.23;
        ankle.rotation.x=Math.max(0,-move)*g*.297+lift*.21-strike*.28;
        for(const [i,toe] of toes.entries())toe.rotation.x=.05*lift+i*.018*lift+strike*.087;
        if(glute){
          glute.rotation.x=lift*.26-strike*.13;
          glute.rotation.y=side*(lift*.16+strike*.11);
          glute.scale.set(1+lift*.08,1-lift*.11,1+strike*.11);
        }
      }
      for(const {flank,side} of abdomen){
        const flex=.039*Math.sin(beat*.62+side)+wind*.064-strike*.054;
        flank.rotation.z=side*flex;
        flank.scale.y=1+wind*.07+strike*.14;
      }
      for(const [i,link] of tail.entries()){
        link.rotation.y=Math.sin(beat*.67-i*.81)*(.10+g*.24)+wind*.15-strike*.23;
        link.rotation.x=.083*Math.cos(beat*.931-i*.82)+strike*.11;
      }
      for(const {anchor,side,t} of scutes){
        anchor.rotation.x=Math.sin(beat*.51-t*3.5)*.045+wind*.18-strike*.18-stage*.095;
        anchor.rotation.z=side*(-.135*stage-.108*strike+g*.034*Math.sin(step+t*3));
      }
    },
  };
}
