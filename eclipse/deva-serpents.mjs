import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const sides=[-1,1];
const tau=Math.PI*2;
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const gold=[0xbb8d48,.72,.43,'bronze'];
const belly=[0xc5b1a0,.27,.59,'bone'];
const fang=[0xe0ceab,.25,.57,'bone'];
const finishes={
  devaGold:gold,devaBelly:belly,devaFang:fang,devaBrass:[0x776344,.73,.56,'bronze'],
  devaSilver:[0xa7acad,.82,.42,'iron'],devaSteel:[0x283440,.66,.53,'iron'],
};

export const devaSerpentFinishes={
  m124:{...finishes,devaHide:[0x754538,.11,.72,'hide'],devaShade:[0x402c2a,.12,.74,'hide'],
    devaFace:[0xae8660,.08,.71,'hide'],devaHair:[0x292123,.1,.81,'hide']},
  m125:{...finishes,devaHide:[0x374b3d,.12,.68,'hide'],devaShade:[0x26372d,.13,.77,'hide'],
    devaFace:[0x796043,.13,.69,'hide'],devaHair:[0x343339,.21,.72,'hide']},
};

function tools(k,mobile){
  return {
    carve:(parent,material,path,seed=0)=>k.geometry(parent,material,sculptVolume(path,{
      sides:mobile?10:15,rings:mobile?13:20,section:2.32,ridge:.18,seed,
    })),
    sweep:(parent,material,path,steps=10)=>k.sculpt.sweep(parent,material,path,{steps,sides:7,ridge:.19}),
    plate:(parent,material,path,depth=.045)=>k.sculpt.plate(parent,material,path,depth,.014),
  };
}

function buildTorso(k,g,body,tiamat){
  const {carve,sweep,plate}=g;
  carve(body,'devaHide',[[0,-.15,-.075,.425,.29],[0,.12,.077,.433,.334],[0,.477,.168,.341,.257],
    [0,.857,.124,.362,.207],[0,1.083,.039,.453,.227],[0,1.315,.004,.471,.244],
    [.006,1.436,.028,.236,.174],[.007,1.535,.05,.143,.122]],8);
  for(let i=0;i<9;i++){
    const y=.024+i*.128,z=.389+Math.sin(i*.359)*.058;
    const w=.367-i*.010;
    plate(body,'devaBelly',[[0,y-.082,z+.067],[-w*.61,y-.044,z+.021],[-w,y+.073,z-.091],
      [-w*.81,y+.103,z-.106],[-w*.27,y+.047,z+.036],[0,y+.004,z+.093],
      [w*.27,y+.047,z+.036],[w*.81,y+.103,z-.106],[w,y+.073,z-.091],[w*.61,y-.044,z+.021]],.038);
    sweep(body,'devaFang',[[-w*.79,y+.074,z-.081,.008],[-w*.44,y-.016,z+.028,.015],
      [0,y-.056,z+.081,.017],[w*.44,y-.016,z+.028,.014],[w*.80,y+.073,z-.080,.007]],12);
    for(const side of sides){
      const x=side*w;
      sweep(body,'devaShade',[[x*.72,y+.071,-.087,.048],[x*1.015,y+.008,-.052,.061],
        [x*.99,y-.015,.102,.053],[x*.89,y-.022,.249,.008]],10);
    }
  }
  for(const side of sides){
    sweep(body,'devaGold',mirror(side,[[.032,1.392,.156,.033],[.191,1.325,.244,.045],
      [.333,1.217,.237,.063],[.452,1.230,.133,.055],[.528,1.334,-.019,.035],[.459,1.415,-.165,.006]]),14);
    sweep(body,'devaShade',mirror(side,[[.084,1.367,-.232,.048],[.213,1.177,-.263,.097],
      [.286,.995,-.228,.076],[.318,.836,-.191,.054],[.275,.583,-.185,.007]]),13);
    if(!tiamat)sweep(body,'devaGold',mirror(side,[[.081,1.230,.249,.027],[.177,1.120,.280,.041],
      [.268,1.076,.241,.050],[.349,1.192,.153,.033],[.405,1.333,.080,.004]]));
  }
}

function buildHead(k,g,body,tiamat){
  const {carve,sweep,plate}=g;
  const head=k.bone(body,0,1.601,.042),crown=k.bone(head,0,.064,-.063);
  head.name=tiamat?'腐墨室・背函拾骨 · 王母面容':'腐墨室・裂紗纏行 · 蛟王面容';
  const hair=k.bone(head,0,.031,-.096);
  carve(head,'devaFace',[[0,-.153,.080,.089,.069],[0,-.092,.075,.147,.105],
    [0,.02,.048,.175,.135],[0,.104,.022,.184,.146],[0,.19,-.039,.167,.133],[0,.259,-.069,.108,.089]],17);
  carve(hair,'devaHair',[[0,-.195,-.041,.137,.096],[0,-.077,-.047,.217,.151],
    [0,.108,-.059,.216,.157],[0,.227,-.044,.194,.143],[0,.287,-.039,.122,.095]],11);
  carve(head,'devaFace',[[0,-.061,.171,.036,.031],[0,-.021,.194,.045,.040],
    [0,.029,.187,.031,.028],[0,.067,.169,.024,.019]],4);
  sweep(head,'devaShade',[[-.072,-.091,.153,.008],[0,-.083,.181,.011],[.071,-.091,.154,.007]],10);
  for(const side of sides){
    const p=path=>mirror(side,path);
    sweep(head,'devaHair',p([[.033,.060,.18,.009],[.074,.078,.179,.017],[.125,.075,.152,.019],
      [.158,.046,.119,.004]]));
    k.mesh(head,'gem','glow',side*.079,.049,.181,.038,.012,.009,0,side*.3);
    plate(head,'devaGold',p([[.113,.131,.113],[.181,.174,.044],[.229,.142,-.036],[.224,.082,-.067],
      [.200,-.061,.023],[.160,-.072,.101],[.146,.013,.124]]),.025);
    for(let i=0;i<3;i++)sweep(hair,'devaHair',p([[.132+i*.026,.112,-.066,.045],
      [.161+i*.049,-.076,-.135,.054],[.144+i*.051,-.302,-.185-.035*i,.044],
      [.169+i*.059,-.448-i*.037,-.249-.038*i,.008]]),12);
  }
  if(tiamat){
    carve(crown,'devaSteel',[[0,.069,.00,.231,.198],[0,.188,-.007,.218,.191],[0,.307,-.024,.174,.146],
      [0,.372,-.031,.115,.106],[0,.408,-.042,.072,.070]],6);
    sweep(crown,'devaGold',[[-.227,.098,.070,.031],[-.169,.153,.144,.038],[0,.173,.173,.037],
      [.169,.153,.144,.038],[.227,.098,.071,.031]],16);
    sweep(crown,'devaGold',[[0,.317,.021,.061],[.011,.409,-.015,.053],[.022,.501,-.053,.029],[.018,.545,-.077,.005]]);
    k.mesh(crown,'gem','glow',0,.237,.159,.060,.091,.034);
    return {head,hair,halo:null};
  }
  const halo=k.bone(crown,0,.071,-.160);
  halo.name='腐墨室・裂紗纏行 · 分段銀冕';
  for(let i=0;i<18;i++){
    const angle=i*tau/18;
    const y=Math.cos(angle),x=Math.sin(angle);
    const spoke=k.bone(halo,x*.256,y*.273,0);
    spoke.rotation.z=-angle;
    sweep(spoke,'devaSilver',[[0,-.069,.020,.033],[.009,.018,.001,.043],
      [.017,.111,-.036,.030],[.031,.235-(i%3)*.024,-.102,.005]],10);
    k.mesh(spoke,'gem','devaGold',.012,.041,.045,.029,.043,.021);
  }
  k.mesh(halo,'ring','devaSilver',0,0,-.002,.30,.319,.42);
  k.mesh(halo,'ring','devaGold',0,0,.027,.229,.246,.32);
  sweep(crown,'devaGold',[[-.182,.094,.125,.015],[-.113,.164,.132,.029],[0,.192,.123,.036],
    [.113,.164,.132,.029],[.182,.094,.125,.015]]);
  return {head,hair,halo};
}

function buildTail(k,g,body,tiamat){
  const {carve,plate,sweep}=g,links=[];
  let link=k.bone(body,0,.069,-.175);
  for(let i=0;i<9;i++){
    const t=i/9,r=.39*(1-t)**1.21+.017;
    const x=Math.sin((t+.071)*2.5)*(.29+t*.04),y=.009-t*.033,z=-.365+t*.075;
    link.name=(tiamat?'腐墨室・背函拾骨 · 棘尾 ':'腐墨室・裂紗纏行 · 銅鱗 ') + (i+1);
    carve(link,'devaHide',[[0,0,.106,r*1.05,r*.84],[x*.46,y+.021,z*.42,r,r*.80],
      [x,y,z,r*.84,r*.67],[x*1.14,y,z-.05,r*.76,r*.61]],1+i);
    for(const side of sides){
      for(let row=0;row<3;row++){
        const dz=.041-row*.087,dx=side*r*.3+row*x*.27;
        plate(link,row%2?'devaShade':'devaHide',[[dx,r*.91,dz+.052],
          [dx+side*r*.6,r*.54,dz+.018],[dx+side*r*.55,r*.17,dz-.062],[dx,r*.40,dz-.113]],.024);
      }
      if(tiamat)sweep(link,'devaFang',mirror(side,[[r*.15,r*.56,-.028,r*.23],[r*.34,r*.86,-.13,r*.27],
        [r*.55,r*1.44,-.19,r*.16],[r*.77,r*1.81,-.26,.004]]),8);
    }
    links.push(link);
    link=k.bone(link,x,y,z);
  }
  for(const side of sides)plate(link,tiamat?'devaHide':'devaSilver',
    mirror(side,[[0,.022,.064],[.084,.062,-.029],[.206,.104,-.119],[.235,.017,-.213],
      [.119,-.041,-.29],[.027,-.024,-.22]]),.028);
  return links;
}

function armGroup(k,g,body,side,raised,tiamat){
  const {carve,sweep,plate}=g,p=path=>mirror(side,path);
  const arm=k.bone(body,side*(raised?.406:.391),raised?1.290:1.106,raised?-.216:.131);
  const elbow=k.bone(arm,side*(raised?.42:.264),raised?.175:-.257,raised?-.062:.112);
  const hand=k.bone(elbow,side*(raised?.31:.14),raised?.202:-.272,raised?.061:.173);
  arm.name=raised?'上手臂 · 肩關節':'下手臂 · 肩關節';
  for(const [joint,end,material,i] of [[arm,elbow.position,'devaFace',4],[elbow,hand.position,'devaHide',6]]){
    const {[0]:x,[1]:y,[2]:z}=end.toArray();
    carve(joint,material,[[0,0,0,.139,.136],[x*.38,y*.38,z*.49,.156,.159],
      [x*.78,y*.79,z*.89,.113,.126],[x,y,z,.093,.102]],i);
    plate(joint,'devaGold',p([[.081,-.094,.091],[.173,-.042,.132],[.261,.059,.116],
      [.225,.147,.091],[.104,.159,.093],[.048,.053,.137]]),.035);
    sweep(joint,'devaBrass',p([[.055,-.065,.124,.017],[.132,-.029,.171,.028],[.202,.026,.164,.026],
      [.230,.108,.122,.006]]));
  }
  carve(hand,'devaFace',[[0,.015,.004,.090,.087],[side*.032,.003,.071,.105,.091],
    [side*.081,-.030,.128,.089,.066],[side*.103,-.055,.163,.068,.047]],8);
  if(tiamat||side<0){
    for(let i=0;i<4;i++){
      const y=.049-i*.042;
      sweep(hand,'devaFang',p([[.070,y,.093,.023],[.142,y-.028,.152,.032],[.215+i*.009,y-.067,.189,.019],
        [.225+i*.016,y-.129,.224,.004]]),10);
    }
  }else{
    const haft=k.bone(hand,.052,-.059,.147);
    haft.rotation.x=.41;haft.rotation.z=-.22;
    haft.name='腐墨室・裂紗纏行 · 三叉槍';
    markEnemyWeapon(haft,[0,1.57,.06],{width:.205});
    sweep(haft,'devaSteel',[[.002,-1.14,-.002,.024],[0,-.89,0,.047],[0,.38,0,.041],[0,.96,.006,.054]],26);
    for(let i=0;i<9;i++)sweep(haft,'devaGold',[[.044,-.89+i*.170,0,.009],[0,-.84+i*.170,.046,.017],
      [-.044,-.79+i*.170,0,.013],[0,-.737+i*.170,-.043,.007]],9);
    for(const s of [-1,0,1]){
      const inset=s===0;
      const edge=[[s*.011,.914,.007],[s*.151,1.068,.01],[s*.185,1.215,.023],
        [s*.223,inset?1.58:1.417,.034],[s*.248,1.211,.063],[s*.228,1.051,.050],[s*.12,.979,.036]];
      if(inset){edge[1][0]=-.052;edge[2][0]=-.064;edge[4][0]=.068;edge[5][0]=.056;edge[6][0]=.027;}
      plate(haft,inset?'devaSilver':'devaSteel',edge,.038);
      sweep(haft,'devaSilver',edge.slice(1,5).map(([x,y,z],i)=>[x,y,z+.033,[.016,.022,.010,.004][i]]),11);
    }
  }
  return {arm,elbow,hand,side,raised};
}

export function sculptDevaSerpent(k,entry,mobile){
  if(!devaSerpentFinishes[entry.id])return null;
  const tiamat=entry.id==='m124',g=tools(k,mobile);
  const body=k.bone(k.root,0,.267,0);
  buildTorso(k,g,body,tiamat);
  const {head,hair,halo}=buildHead(k,g,body,tiamat),links=buildTail(k,g,body,tiamat);
  const limbs=sides.map(side=>armGroup(k,g,body,side,false,tiamat));
  if(tiamat)limbs.push(...sides.map(side=>armGroup(k,g,body,side,true,true)));
  return {
    body,head,arms:limbs.map(limb=>limb.arm),crest:k.bone(k.root,0,0,0),grounded:true,
    devaCarved:true,sourceSculpt:true,catalogueSculpt:entry.id,pattern:'coil',inspectionHead:head,
    polishEnergy:{tint:tiamat?0xf5a75b:0xe4b977,shape:tiamat?'ribbons':'bolts',
      anchor:body,offset:[0,.86,.095],span:[.99,.88,.78]},
    sourceDress(skin){
      if(!tiamat)return false;
      for(const side of sides)for(let i=0;i<3;i++)skin.silk(body,'腐墨室・背函拾骨 · 背披',mirror(side,[
        [.233+i*.067,1.246-i*.084,-.190,.064],[.387+i*.079,1.085-i*.12,-.323,.103],
        [.519+i*.076,.936-i*.17,-.574,.092],[.812+i*.047,.802-i*.17,-.791+i*.068,.025],
      ]),{style:'woven',tint:i===1?0x473c3c:0x795048,trim:0xae7849,lining:0x392c27,
        phase:side*.71+i*.83,flex:1.25,across:[.35,.74,.12]});
      return true;
    },
    cataloguePose({beat,wind,strike,travel,fall,stage,attackPattern}){
      const spiral=attackPattern==='spiral',cast=attackPattern==='summon';
      for(const {arm,elbow,hand,side,raised} of limbs){
        const ripple=Math.sin(beat*.71+side*.63+(raised?1.18:0));
        const boost=spiral?.87:cast?.63:.94;
        arm.rotation.set(ripple*.074+travel*.19+wind*(raised?-.61:-.50)+strike*boost,
          side*(.07+wind*.14-strike*.17),side*(ripple*.044+wind*.22+(raised?.091:.026)));
        elbow.rotation.x=wind*.31-strike*.48+ripple*.095;
        elbow.rotation.z=side*(.033+wind*.46-strike*(raised?.21:.24)+fall*.31);
        hand.rotation.x=ripple*.12+wind*.33-strike*.42;
      }
      for(const [i,link] of links.entries()){
        const ripple=Math.sin(beat*.57-i*.50);
        link.rotation.set(ripple*(.031+travel*.031)+wind*.009, ripple*(.10+travel*.06)+strike*.045*(1-i/9),
          -.024*stage+ripple*.028);
      }
      hair.rotation.x=Math.sin(beat*.48)*.089+wind*.15-strike*.19;
      if(halo)halo.rotation.z=Math.sin(beat*.38)*.069+wind*.36+strike*.29;
    },
  };
}
