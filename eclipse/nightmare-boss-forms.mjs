import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {bossSkin} from './boss-skin.mjs?v=boss-foundry-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=forgeburst-1';

const TAU=Math.PI*2, sides=[-1,1];
const sym=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const bodyShape=(k,parent,material,path,mobile,options={})=>k.geometry(parent,material,sculptVolume(path,{
  sides:mobile?10:15,rings:mobile?12:19,section:2.31,ridge:.19,...options,
}));
const seam=(k,parent,material,path,steps=10)=>k.sculpt.sweep(parent,material,path,{steps,sides:6,ridge:.20});
const panel=(k,parent,material,path,depth=.038)=>k.sculpt.plate(parent,material,path,depth,.012);

export const nightmareFinishes={
  m142:{
    dreamMain:[0x504a2f,.13,.79,'hide'],dreamDark:[0x27271f,.07,.82,'hide'],
    dreamShell:[0x726347,.19,.74,'stone'],dreamPale:[0xa0793e,.15,.69,'hide'],
    dreamHot:[0xc2682a,.21,.56,'stone'],
  },
  m143:{
    dreamMain:[0x806452,.035,.82,'hide'],dreamDark:[0x4e3934,.06,.84,'hide'],
    dreamShell:[0x644f37,.45,.57,'iron'],dreamPale:[0xc2bbb0,.11,.76,'hide'],
    dreamGold:[0xd2a45d,.48,.48,'bronze'],dreamCloth:[0x355645,.095,.72,'cloth'],
    dreamHot:[0xf6ba6f,.32,.43,'gem'],dreamMembrane:[0x7e5c46,.075,.79,'hide'],
    dreamIron:[0x8a6b4e,.59,.52,'iron'],dreamTendon:[0x6d4b42,.085,.77,'hide'],
  },
  m146:{
    dreamMain:[0x666486,.09,.70,'hide'],dreamDark:[0x2a324f,.17,.75,'hide'],
    dreamShell:[0x3d5b91,.46,.47,'iron'],dreamPale:[0xbfc2c8,.20,.55,'bone'],
    dreamCloth:[0x973e62,.055,.76,'cloth'],dreamTide:[0x3457a0,.13,.69,'hide'],
    dreamHot:[0xaadbf4,.12,.41,'gem'],
  },
  m147:{
    dreamMain:[0x77786e,.11,.77,'hide'],dreamDark:[0x303737,.10,.77,'cloth'],
    dreamShell:[0x53524a,.69,.42,'iron'],dreamPale:[0xbbb88f,.43,.49,'iron'],
    dreamGold:[0xa8854b,.69,.44,'bronze'],dreamCloth:[0x444b3a,.09,.78,'cloth'],
    dreamHot:[0xbaca9e,.13,.48,'bone'],dreamHorseHide:[0x353539,.05,.79,'hide'],
    dreamHorseMane:[0x292730,.03,.89,'hide'],dreamGuardHairs:[0x635d55,.05,.79,'hide'],
  },
};

function furnaceRoot(k,entry,mobile){
  const body=k.bone(k.root,0,.303,0),head=k.bone(body,0,1.593,.091);
  bodyShape(k,body,'dreamDark',[[0,-.074,.01,.23,.23],[-.081,.125,-.027,.486,.419],[-.034,.352,-.047,.531,.404],
    [.035,.67,-.004,.39,.278],[-.022,1.009,-.085,.266,.25],[.038,1.316,-.041,.25,.204],
    [0,1.528,.014,.187,.177]],mobile,{sides:mobile?14:21,rings:mobile?18:24,section:2.52,ridge:.31});
  bodyShape(k,head,'dreamDark',[[0,-.254,-.024,.164,.156],[0,-.153,.027,.226,.235],[.025,-.024,-.015,.241,.208],
    [.003,.120,-.048,.192,.185],[-.066,.267,-.082,.143,.122],[-.085,.344,-.102,.075,.062]],mobile,
  {section:2.69,ridge:.28});
  const rootGate=[],shoulders=[];
  for(const side of sides){
    const r=path=>sym(side,path);
    const brow=r([[.026,.124,.19],[.105,.188,.187],[.215,.172,.066],[.253,.069,.065],[.188,-.008,.145],
      [.084,.029,.235],[.025,.026,.229]]);
    panel(k,head,'dreamShell',brow,.05);
    seam(k,head,'dreamHot',r([[.044,.008,.246,.006],[.093,.022,.252,.014],
      [.145,.035,.222,.016],[.183,.056,.182,.004]]));
    const cut=r([[.039,-.081,.255],[.146,-.077,.206],[.222,-.030,.147],[.258,-.153,.096],[.147,-.249,.189],
      [.071,-.189,.267]]);
    panel(k,head,'dreamMain',cut,.056);
    seam(k,head,'dreamPale',cut.slice(1,6).map(([x,y,z],i)=>[x+side*.022,y,z+.025,[.018,.027,.023,.015,.003][i]]),11);
    seam(k,head,'dreamShell',r([[.106,.186,.087,.073],[.178,.294,.016,.076],[.273,.392,-.091,.043],
      [.401,.408,-.152,.011]]),13);
    const arm=k.bone(body,side*.224,1.215,.029);
    const elbow=k.bone(arm,side*.245,-.191,.098);
    bodyShape(k,arm,'dreamMain',r([[.003,.11,.011,.128,.107],[.116,.018,.066,.141,.125],
      [.207,-.111,.13,.116,.091],[.235,-.237,.131,.074,.068]]),mobile,{section:2.69,ridge:.33});
    bodyShape(k,elbow,'dreamDark',r([[0,.044,-.051,.072,.079],[.048,-.08,.081,.091,.074],
      [.124,-.183,.173,.071,.062],[.222,-.20,.238,.038,.037]]),mobile,{section:2.6,ridge:.34});
    for(let finger=0;finger<4;finger++){
      const v=finger*.046;
      seam(k,elbow,finger%2?'dreamShell':'dreamPale',r([[.128+v,-.16,.168,.029],[.182+v,-.19,.234,.041],
        [.214+v,-.209,.296+v*.13,.032],[.239+v,-.155,.339+v*.32,.005]]),9);
    }
    shoulders.push({arm,elbow,side});
    for(let j=0;j<5;j++){
      const y=1.47-j*.183,x=.209+j*.022,z=-.139-j*.025;
      const area=r([[x-.104,y+.14,z-.039],[x+.047,y+.156,z-.117],[x+.157,y+.09,z-.195],
        [x+.268,y-.072,z-.251],[x+.097,y-.163,z-.180],[x-.029,y-.119,z-.173]]);
      panel(k,body,j%2?'dreamDark':'dreamShell',area,.052);
      seam(k,body,'dreamPale',area.slice(1,6).map(([x,y,z],i)=>[x+side*.014,y+.009,z-.018,[.012,.028,.021,.011,.003][i]]),10);
    }
    const chest=r([[.07,1.432,.157,.045],[.192,1.232,.253,.084],[.264,.978,.264,.081],
      [.237,.751,.307,.071],[.208,.473,.362,.049],[.216,.28,.386,.011]]);
    bodyShape(k,body,'dreamMain',chest.map(([x,y,z,w])=>[x,y,z,w,w*.76]),mobile,{section:2.62,ridge:.30});
    seam(k,body,'dreamPale',chest.map(([x,y,z,w])=>[x+side*.035,y+.019,z+.038,w*.38]),12);
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?3:5),x=.083+t*.19;
      const wood=r([[x,1.320-t*.12,-.208,.032,.021],[x+.045,1.097-t*.12,-.254,.066,.043],
        [x+.052,.849-t*.123,-.347,.054,.038],[x+.099,.576-t*.073,-.434,.039,.030],
        [x+.196,.328-t*.024,-.477-t*.082,.008,.008]]);
      bodyShape(k,body,i%2?'dreamMain':'dreamDark',wood,mobile,{section:2.71,ridge:.42,rings:14,sides:8,fur:true});
      if(i%2===0)seam(k,body,'dreamPale',wood.map(([x,y,z,w],j)=>[x+side*.016,y+.014,z-.022,w*(j===2?.46:.30)]),11);
      const shiver=r([[x,1.330-t*.159,.14,.019],[x+.028,1.129-t*.084,.25,.036],
        [x+.057,.892-t*.054,.307,.028],[x+.105,.642-t*.038,.365,.024],[x+.168,.346,.432,.009]]);
      seam(k,body,'dreamShell',shiver,14);
    }
  }
  const rootCount=mobile?17:23;
  for(let i=0;i<rootCount;i++){
    const a=i*TAU/rootCount,reach=(i%2?.69:1.03)+.14*Math.sin(i*3.3);
    const start=mobile?i%3*.071:i%3*.079;
    const base=k.bone(body,Math.sin(a)*.24,.073+start,Math.cos(a)*.22);
    base.rotation.y=a;
    const bend=.13*Math.sin(i*3.50);
    bodyShape(k,base,i%3?'dreamMain':'dreamShell',[[0,.016,.018,.131,.123],[bend*.26,-.059,.219,.132,.094],
      [bend*.61,-.14,reach*.56,.109,.075],[bend*.92,-.099,reach*.82,.071,.054],
      [bend*.83,.018,reach*.92,.042,.036],[bend*.47,.141+(i%3)*.055,reach*.98,.004,.005]],
    mobile,{rings:11,sides:8,section:2.53,ridge:.33,seed:i});
    seam(k,base,i%3===0?'dreamHot':'dreamPale',[[.044,.018,.092,.024],[bend*.45+.038,-.078,reach*.42,.037],
      [bend*.75+.031,-.103,reach*.67,.035],[bend*.76+.020,-.023,reach*.87,.018],[bend*.51+.013,.129+start,reach*.99,.004]],11);
    if(i%2===0)seam(k,base,'dreamDark',[[0,-.037,.17,.041],[bend-.063,-.128,reach*.49,.038],
      [bend-.143,-.157,reach*.73,.035],[bend-.203,-.06,reach*.91,.003]],10);
    const knot=[[.032,-.034,.228,.074,.064],[bend+.096,-.072,reach*.42,.073,.061],
      [bend+.147,-.128,reach*.64,.060,.048],[bend+.181,-.086,reach*.811,.031,.028],
      [bend+.231,.027,reach*.909,.004,.004]];
    bodyShape(k,base,i%2?'dreamDark':'dreamMain',knot,mobile,{rings:9,sides:7,section:2.4,ridge:.36,fur:true});
    seam(k,base,'dreamHot',[[bend+.075,-.026,reach*.47,.012],[bend+.130,-.081,reach*.64,.026],
      [bend+.162,-.053,reach*.82,.024],[bend+.214,.016,reach*.904,.004]],9);
    rootGate.push({base,a,i});
  }
  const skin=bossSkin(k,mobile,tools=>{
    for(let i=0;i<8;i++){
      const a=(i+.5)*TAU/8,c=Math.cos(a),s=Math.sin(a);
      tools.silk(body,entry.name+' · 垂根',[[s*.111,1.18,c*.102,.018],[s*.235,.93,c*.233,.047],
        [s*.328,.65,c*.290,.086],[s*.457,.347,c*.363,.078],[s*.663,.044,c*.467,.007]],
      {tint:0x4e4130,trim:0x956f3f,phase:a,flex:1.17,style:'mane',across:[c,.14,-s]});
    }
    return true;
  });
  const fire=k.materials.dreamHot;
  fire.emissive.setHex(0xf26921);
  return {body,head,skin,crest:k.bone(body,0,0,0),sourceSculpt:true,catalogueSculpt:entry.id,grounded:true,pattern:'crawl',
    polishEnergy:{tint:0xf69653,shape:'embers',anchor:body,offset:[0,.71,0],span:[1.29,.69,1.19]},
    cataloguePose({beat,wind,strike,travel,stage,fall}){
      body.rotation.x=wind*-.17+strike*.325; head.rotation.x=.087*Math.sin(beat*.61)+wind*.17-strike*.35;
      for(const {base,a,i} of rootGate){
        base.rotation.x=Math.sin(beat*.85-i*.40)*.098+wind*.33-strike*(.29+.10*Math.cos(a))+fall*.14;
        base.rotation.y=a+Math.cos(beat*.38+i*.85)*.058+strike*.12;
        base.scale.z=1+travel*.08+strike*.20+stage*.13;
      }
      for(const {arm,elbow,side} of shoulders){
        arm.rotation.x=wind*.40-strike*.71;arm.rotation.z=side*(wind*.49-strike*.27);
        elbow.rotation.x=.26+wind*.331-strike*.53;
      }
      fire.emissiveIntensity=.20+wind*.66+strike*.90+stage*.17;
    },
  };
}

function drumHardware(k,drum,mobile){
  const foot=k.bone(drum,0,-.313,.026);
  foot.name='噩夢鬼 · 雷鼓底面';
  bodyShape(k,foot,'dreamIron',[[0,-.082,-.004,.136,.138],[0,-.054,-.004,.174,.179],
    [0,-.017,.007,.193,.192],[0,.024,.011,.188,.190],[0,.058,.011,.170,.177]],mobile,
  {sides:mobile?12:18,rings:11,section:2.64,ridge:.20});
  bodyShape(k,foot,'dreamDark',[[0,-.105,-.007,.129,.131],[0,-.089,-.006,.152,.152],
    [0,-.071,-.002,.147,.149]],mobile,{rings:7,section:2.21,ridge:.14});
  bodyShape(k,foot,'dreamMembrane',[[0,-.114,-.009,.060,.059],[0,-.106,-.006,.117,.117],
    [0,-.094,-.001,.142,.146],[0,-.087,.002,.132,.139]],mobile,{rings:8,section:2.3,ridge:.29});
  const band=Array.from({length:17},(_,i)=>{
    const a=TAU*i/16,warp=Math.sin(a*3)*.01;
    return [Math.sin(a)*(.174+warp),-.075,Math.cos(a)*(.179+warp),.018+warp*.13];
  });
  seam(k,foot,'dreamGold',band,21);
  const count=mobile?7:10;
  for(let i=0;i<count;i++){
    const a=TAU*(i+.3)/count,x=Math.sin(a),z=Math.cos(a);
    seam(k,foot,i%2?'dreamGold':'dreamIron',[[x*.124,-.109,z*.124,.012],[x*.149,-.110,z*.151,.018],
      [x*.179,-.075,z*.176,.016],[x*.193,-.021,z*.183,.012],[x*.184,.024,z*.175,.004]],9);
    if(i%2===0)k.mesh(foot,'gem','dreamPale',x*.181,-.034,z*.187,.022,.034,.024,0,-a,i*.073);
  }
  seam(k,foot,'dreamTendon',[[-.107,-.105,-.065,.003],[-.039,-.117,-.041,.009],
    [.011,-.117,.049,.010],[.086,-.104,.082,.003]],10);
}

function thunderFighter(k,entry,mobile){
  const body=k.bone(k.root,0,.925,-.031),head=k.bone(body,0,1.174,.077);
  bodyShape(k,body,'dreamMain',[[0,-.22,-.043,.236,.186],[0,.035,-.041,.273,.228],[0,.304,-.024,.337,.253],
    [0,.629,.008,.461,.299],[0,.81,-.003,.434,.294],[0,.968,-.041,.286,.212],[0,1.07,-.028,.175,.163]],mobile,
  {sides:mobile?13:18,rings:mobile?18:22,section:2.44,ridge:.29});
  bodyShape(k,head,'dreamMain',[[0,-.153,.041,.112,.102],[0,-.064,.037,.162,.133],[0,.061,-.019,.178,.149],
    [0,.185,-.033,.169,.150],[0,.25,-.046,.122,.116]],mobile,{rings:17,section:2.53});
  bodyShape(k,head,'dreamMain',[[0,-.057,.157,.042,.032],[0,-.038,.194,.050,.056],[.006,.008,.201,.037,.043],
    [0,.058,.175,.032,.035],[0,.117,.153,.028,.023]],mobile,{sides:9,rings:11,section:2.62});
  seam(k,head,'dreamDark',[[-.044,-.093,.173,.005],[-.017,-.101,.183,.009],[.021,-.102,.193,.010],
    [.062,-.091,.171,.003]],10);
  bodyShape(k,head,'dreamMain',[[0,-.162,.127,.061,.039],[0,-.143,.155,.087,.045],
    [0,-.118,.149,.083,.039],[0,-.11,.145,.053,.025]],mobile,{sides:9,rings:9,section:2.7});
  const crown=k.bone(head,0,.153,-.087);
  bodyShape(k,crown,'dreamPale',[[0,-.023,-.004,.161,.157],[0,.062,-.041,.180,.158],
    [0,.132,-.066,.167,.147],[0,.176,-.169,.119,.096]],mobile,{rings:14,ridge:.29,fur:true});
  for(let i=0;i<(mobile?12:18);i++){
    const a=(i+.7)*TAU/(mobile?12:18),x=Math.sin(a)*.133,z=Math.cos(a)*.139;
    const back=1-Math.cos(a)*.51;
    bodyShape(k,crown,i%3?'dreamPale':'dreamGold',[[x,.029,z,.043,.030],[x*1.29,.126,z*.51-.043,.060,.041],
      [x*1.45,.206*back,z*.30-.115,.038,.031],[x*1.38,.262*back,z*.13-.244,.005,.005]],
    mobile,{sides:7,rings:9,section:2.26,fur:true,ridge:.29});
  }
  const arms=[],legs=[],drums=[];
  for(const side of sides){
    const r=path=>sym(side,path);
    const eyebrow=r([[.022,.108,.151,.013],[.078,.128,.155,.028],[.130,.103,.137,.024],[.153,.079,.101,.004]]);
    seam(k,head,'dreamPale',eyebrow);
    seam(k,head,'glow',r([[.039,.082,.158,.004],[.080,.086,.164,.010],[.119,.080,.143,.011],[.131,.075,.134,.004]]),8);
    bodyShape(k,head,'dreamDark',r([[.056,-.048,.131,.023,.021],[.105,-.023,.133,.034,.023],
      [.142,.02,.099,.029,.023],[.153,.068,.055,.005,.004]]),mobile,{sides:8,rings:9,section:2.25});
    bodyShape(k,head,'dreamMain',r([[.049,.000,.144,.031,.022],[.089,.017,.153,.044,.030],
      [.126,.032,.122,.043,.026],[.152,.040,.075,.034,.020],[.172,.039,.035,.006,.008]]),
    mobile,{sides:9,rings:9,section:2.57});
    seam(k,head,'dreamDark',r([[.043,-.059,.166,.013],[.091,-.062,.155,.018],[.143,-.084,.119,.017],
      [.164,-.071,.082,.004]]),9);
    seam(k,head,'dreamPale',r([[.039,-.075,.181,.009],[.079,-.073,.174,.016],
      [.111,-.095,.151,.014],[.140,-.118,.138,.003]]),10);
    seam(k,head,'dreamDark',r([[.033,.088,.167,.008],[.076,.096,.174,.017],
      [.123,.088,.152,.013],[.147,.065,.121,.004]]),10);
    seam(k,head,'dreamGold',r([[.030,-.089,.160,.010],[.077,-.077,.155,.017],[.131,-.088,.131,.013],[.156,-.109,.113,.004]]));
    const pectoral=r([[.089,.568,.236,.159,.081],[.188,.662,.263,.143,.111],[.322,.663,.229,.134,.102],
      [.441,.775,.15,.081,.081],[.459,.810,.061,.019,.026]]);
    bodyShape(k,body,'dreamMain',pectoral,mobile,{section:2.61,ridge:.26});
    seam(k,body,'dreamDark',r([[.111,.535,.275,.027],[.225,.521,.312,.037],[.338,.548,.271,.029],[.422,.687,.167,.004]]));
    const yoke=r([[.054,.931,.143,.025],[.214,.888,.251,.042],[.377,.709,.295,.048],
      [.341,.464,.311,.048],[.204,.257,.268,.055],[.09,.193,.277,.019]]);
    seam(k,body,'dreamShell',yoke,18);
    seam(k,body,'dreamGold',yoke.map(([x,y,z,w])=>[x,y+.018,z+.030,w*.62]),15);
    const rear=r([[.051,.92,-.179,.024],[.242,.867,-.242,.052],[.371,.743,-.344,.051],
      [.311,.483,-.301,.046],[.193,.269,-.259,.042],[.081,.181,-.259,.013]]);
    seam(k,body,'dreamShell',rear,17); seam(k,body,'dreamGold',rear.map(([x,y,z,w])=>[x,y-.018,z-.033,w*.52]),13);
    const scapula=r([[.081,.899,-.183,.051,.040],[.198,.827,-.246,.109,.071],[.311,.767,-.277,.126,.085],
      [.365,.654,-.264,.089,.069],[.279,.498,-.270,.060,.055],[.188,.458,-.274,.012,.018]]);
    bodyShape(k,body,'dreamMain',scapula,mobile,{sides:9,rings:13,section:2.84,ridge:.29});
    seam(k,body,'dreamDark',r([[.049,.809,-.243,.013],[.122,.683,-.307,.027],
      [.197,.579,-.322,.034],[.273,.573,-.334,.020],[.327,.657,-.291,.004]]),12);
    for(let row=0;row<3;row++){
      const y=.44-row*.104,x=.104+row*.031;
      bodyShape(k,body,row===1?'dreamMain':'dreamDark',r([[x,y,.264,.046,.039],[x+.107,y+.024,.289,.053,.040],
        [x+.209,y+.084,.237,.049,.035],[x+.239,y+.162,.180,.006,.006]]),mobile,{sides:8,rings:8,section:2.68});
    }
    const upper=k.bone(body,side*.376,.84,-.011);
    const lower=k.bone(upper,side*.137,-.324,.114);
    const fist=k.bone(lower,side*.031,-.297,.097);
    bodyShape(k,upper,'dreamMain',r([[0,.092,-.031,.130,.150],[.126,.009,.001,.193,.177],
      [.177,-.152,.075,.157,.141],[.137,-.322,.102,.101,.105]]),mobile,{section:2.64,ridge:.26});
    bodyShape(k,lower,'dreamMain',r([[0,.023,-.026,.111,.105],[.084,-.099,.006,.147,.128],
      [.083,-.216,.055,.126,.110],[.038,-.308,.087,.096,.071]]),mobile,{section:2.71});
    const shoulderCap=r([[-.069,.059,-.116,.070,.059],[.003,.114,-.046,.117,.100],
      [.108,.067,.009,.141,.113],[.187,-.053,.054,.139,.093],[.160,-.169,.109,.090,.078],
      [.120,-.207,.134,.017,.019]]);
    bodyShape(k,upper,'dreamMain',shoulderCap,mobile,{sides:10,rings:16,section:2.7,ridge:.28});
    const elbowRidge=r([[.073,-.210,.089,.063,.043],[.092,-.269,.120,.071,.060],
      [.124,-.308,.127,.075,.058],[.163,-.320,.101,.055,.047],[.165,-.331,.069,.022,.027]]);
    bodyShape(k,upper,'dreamTendon',elbowRidge,mobile,{sides:9,rings:10,section:2.32,ridge:.34});
    const innerArm=r([[-.027,.037,.086,.026,.023],[.039,-.028,.123,.056,.042],[.103,-.093,.143,.054,.039],
      [.118,-.167,.133,.038,.031],[.105,-.228,.11,.018,.016]]);
    bodyShape(k,lower,'dreamTendon',innerArm,mobile,{sides:9,rings:12,section:2.63,ridge:.28});
    seam(k,upper,'dreamDark',r([[.144,-.058,.144,.021],[.205,-.141,.134,.027],
      [.198,-.220,.148,.031],[.155,-.301,.150,.005]]),11);
    seam(k,lower,'dreamDark',r([[.047,.004,.117,.011],[.108,-.056,.141,.022],
      [.143,-.144,.113,.014],[.105,-.219,.131,.005]]),11);
    for(let row=0;row<3;row++){
      const y=-.158-row*.06;
      bodyShape(k,lower,row===1?'dreamGold':'dreamShell',r([[.040,y+.026,.035,.113,.115],
        [.041,y-.013,.049,.141,.140],[.040,y-.040,.058,.122,.130]]),mobile,{sides:11,rings:6,section:2.3});
    }
    bodyShape(k,fist,'dreamMain',r([[0,.044,-.021,.074,.079],[.017,-.027,.036,.111,.097],
      [.023,-.109,.067,.106,.080],[.028,-.159,.074,.077,.050]]),mobile,{rings:10,section:2.91});
    for(let finger=0;finger<3;finger++){
      const x=(finger-1)*.058;
      seam(k,fist,'dreamDark',r([[x,-.040,.124,.012],[x,-.104,.135,.017],[x+.017,-.145,.105,.003]]),7);
    }
    arms.push({upper,lower,fist,side});
    const thigh=k.bone(body,side*.217,-.157,.033),shin=k.bone(thigh,side*.026,-.301,.073);
    const boot=k.bone(shin,0,-.365,.088);
    bodyShape(k,thigh,'dreamCloth',r([[0,.041,-.031,.147,.158],[.026,-.097,.016,.175,.168],
      [.018,-.210,.049,.143,.153],[.015,-.321,.076,.118,.129]]),mobile,{section:2.62});
    bodyShape(k,shin,'dreamShell',r([[0,.042,-.01,.133,.119],[.031,-.054,.027,.143,.129],
      [.039,-.188,.056,.120,.098],[.019,-.365,.086,.100,.083]]),mobile,{section:2.59});
    const knee=r([[-.049,.073,.141],[.053,.104,.124],[.133,.037,.106],[.122,-.076,.128],[.054,-.125,.153],[-.044,-.08,.131]]);
    panel(k,shin,'dreamGold',knee,.046);
    seam(k,shin,'dreamGold',r([[.025,-.081,.158,.020],[.085,-.172,.169,.029],[.059,-.269,.159,.027],[.031,-.348,.136,.003]]));
    bodyShape(k,boot,'dreamGold',r([[0,.043,-.035,.093,.071],[.023,-.028,.067,.133,.092],
      [.029,-.063,.167,.119,.071],[.017,-.082,.219,.080,.048]]),mobile,{rings:10,section:2.83});
    legs.push({thigh,shin,boot,side});
    const talisman=k.bone(body,side*.657,1.063,-.249-side*.075);
    talisman.name='噩夢鬼 · 懸浮雷鼓';
    bodyShape(k,talisman,'dreamShell',[[0,-.315,-.046,.143,.156],[0,-.26,-.032,.185,.191],
      [0,-.119,-.002,.162,.17],[0,.092,.035,.173,.185],[0,.275,.051,.195,.201],[0,.327,.061,.134,.151]],mobile,
    {rings:15,section:2.56});
    drumHardware(k,talisman,mobile);
    const capY=.225;
    bodyShape(k,talisman,'dreamGold',[[0,capY-.064,.015,.167,.173],[0,capY,.023,.207,.207],
      [0,capY+.06,.037,.184,.190]],mobile,{rings:7,section:2.61});
    k.mesh(talisman,'round','dreamHot',0,capY+.020,.053,.170,.071,.164);
    for(let i=0;i<4;i++){
      const a=i*TAU/4,x=Math.sin(a),z=Math.cos(a);
      seam(k,talisman,'dreamGold',[[x*.186,-.244,z*.184,.018],[x*.153,-.067,z*.176,.028],
        [x*.148,.112,z*.192+.020,.024],[x*.190,.224,z*.181+.049,.012]],10);
    }
    drums.push({talisman,side});
    seam(k,body,'dreamShell',r([[.056,.486,-.357,.040],[.23,.54,-.386,.062],[.411,.69,-.388,.061],
      [.503,.847,-.376,.052],[.572,1.06,-.326,.021]]),15);
    seam(k,body,'dreamGold',r([[.057,.510,-.411,.015],[.23,.551,-.449,.033],[.415,.711,-.442,.031],
      [.513,.879,-.461,.030],[.565,1.03,-.434,.009]]),15);
  }
  const clasp=k.bone(body,0,.114,.242);
  k.mesh(clasp,'ring','dreamGold',0,0,.038,.132,.114,.57);
  k.mesh(clasp,'gem','dreamShell',0,0,.052,.083,.078,.041);
  k.mesh(clasp,'gem','dreamHot',0,0,.094,.038,.053,.021);
  const skin=bossSkin(k,mobile,tools=>{
    tools.silk(body,entry.name+' · 金扣後幅',[[0,.152,-.237,.10],[0,.035,-.286,.148],[0,-.138,-.306,.146],
      [-.063,-.341,-.357,.107],[-.118,-.523,-.441,.012]],{tint:0x793729,trim:0xbc9953,style:'woven',flex:.90});
    return true;
  });
  const copper=k.materials.dreamHot;
  copper.emissive.setHex(0xfcc474);
  return {body,head,skin,sourceSculpt:true,grounded:true,catalogueSculpt:entry.id,crest:k.bone(body,0,0,0),
    polishEnergy:{tint:0xf6c477,shape:'bolts',anchor:body,offset:[0,.71,0],span:[.85,.96,.51]},
    cataloguePose({beat,wind,strike,stage,travel,fall,step}){
      head.rotation.x=.06*Math.sin(beat*.71)+wind*.22-strike*.29;
      for(const {upper,lower,fist,side} of arms){
        upper.rotation.x=-wind*.64+strike*(side<0?.67:.93)+travel*.28*Math.sin(step+side*1.7);
        upper.rotation.z=side*(.16+wind*.56-strike*.33);
        lower.rotation.x=-.12+wind*.75-strike*.65;
        fist.rotation.y=side*(.07+wind*.41-strike*.25);
      }
      for(const {thigh,shin,boot,side} of legs){
        const stride=Math.sin(step+side*Math.PI*.5);
        thigh.rotation.x=travel*stride*.48+strike*.137*side;shin.rotation.x=travel*Math.max(0,stride)*.52+fall*.31;
        boot.rotation.x=-travel*Math.max(0,stride)*.34;
      }
      for(const {talisman,side} of drums){
        talisman.position.x=side*(.63+wind*.278+strike*.24);
        talisman.position.y=1.180+Math.sin(beat*.52+side*.9)*.13+wind*.30+stage*.18;
        talisman.rotation.set(Math.sin(beat*.46+side)*.29+strike*.33,side*beat*.25,side*(.44+wind*.35-strike*.28));
      }
      copper.emissiveIntensity=.22+wind*.57+strike*.77+stage*.31;
    },
  };
}

function waterBow(k,bow,mobile){
  markEnemyWeapon(bow,[0,.035,.76],{from:[0,.035,-.252],width:.198,kind:'bow'});
  bow.name='凶夢鬼 · 珊瑚弓';
  for(const side of sides){
    const extent=side>0?.604:.473;
    const spine=[[0,.011,.038,.048,.057],[.030,side*.137,.137,.049,.048],
      [.053,side*.316,.183,.041,.044],[.092,side*(extent*.84),.076,.035,.029],
      [.132,side*extent,-.124,.026,.026],[.158,side*(extent+.065),-.113,.005,.005]];
    bodyShape(k,bow,'dreamCloth',spine,mobile,{rings:17,sides:8,section:2.51});
    seam(k,bow,'dreamPale',spine.map(([x,y,z,w])=>[x+.026,y,z+.021,w*.56]),14);
    for(let i=0;i<3;i++){
      const d=i*.082;
      seam(k,bow,'dreamShell',[[.04,side*(.178+d),.182,.027],[.11,side*(.211+d),.239,.031],
        [.186+i*.033,side*(.256+d),.230,.020],[.227+i*.04,side*(.3+d),.199,.004]],10);
    }
  }
  const string=k.bone(bow,0,0,0);
  seam(k,string,'dreamHot',[[.132,-.466,-.138,.007],[.059,-.213,-.215,.009],
    [0,.035,-.252,.011],[.061,.338,-.190,.009],[.134,.590,-.132,.007]],14);
  seam(k,bow,'dreamHot',[[0,.035,-.252,.009],[0,.035,.266,.014],[0,.035,.55,.017],[0,.035,.76,.006]],14);
  return string;
}

function bindTide(k,body,joints,shell,mobile){
  const curve=new T.CatmullRomCurve3(shell.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.43);
  const geo=sculptVolume(shell,{sides:mobile?13:19,rings:mobile?64:93,section:2.42,ridge:.19,seed:2.43});
  const {uv,color}=geo.attributes,indices=[],weights=[];
  for(let i=0;i<uv.count;i++){
    const v=uv.getY(i),u=uv.getX(i),point=curve.getUtoTmapping(v)*(joints.length-1);
    const segment=Math.min(joints.length-2,Math.floor(point));
    const mix=T.MathUtils.smoothstep(point-segment,0,1);
    indices.push(segment,segment+1,0,0);weights.push(1-mix,mix,0,0);
    const grain=Math.cos(TAU*u*6-v*83)*Math.sin(v*29+TAU*u*4);
    const rim=.88+grain*.075+Math.pow(Math.max(0,Math.cos(TAU*u+v*.17)),3)*.20;
    const gray=color.getX(i);
    color.setXYZ(i,gray*rim*.80,gray*rim*.91,gray*rim*1.04);
  }
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const mesh=new T.SkinnedMesh(geo,k.materials.dreamTide);
  mesh.name='凶夢鬼 · 連續水尾皮';
  mesh.frustumCulled=false;
  body.add(mesh);body.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(joints);
  mesh.bind(skeleton,mesh.matrixWorld);
  return skeleton;
}

function coiledTide(k,body,mobile){
  const shell=[
    [0,.156,-.248,.147,.139],[-.313,-.032,-.406,.183,.149],[-.615,-.247,-.20,.188,.162],
    [-.695,-.485,.171,.166,.143],[-.394,-.582,.417,.157,.131],[.030,-.626,.511,.141,.117],
    [.468,-.590,.341,.126,.092],[.646,-.563,.045,.100,.075],[.594,-.708,-.335,.080,.059],
    [.398,-.859,-.587,.065,.043],[.111,-.881,-.788,.005,.005],
  ];
  const joints=[];
  let parent=body;
  for(const [i,[x,y,z,w]] of shell.entries()){
    const previous=i?shell[i-1]:[0,0,0];
    const j=new T.Bone();
    j.position.set(x-previous[0],y-previous[1],z-previous[2]);
    parent.add(j);
    j.name='凶夢鬼 · 水尾 '+(i+1);
    joints.push(j);parent=j;
    if(i===shell.length-1)break;
    const [X,Y,Z,W]=shell[i+1];
    const p=[X-x,Y-y,Z-z];
    seam(k,j,'dreamPale',[[0,w*.59,.019,.021],[p[0]*.52,p[1]*.53+w*.70,p[2]*.42,.030],
      [p[0],p[1]+W*.55,p[2],.006]],10);
    const side=i%2===0?-1:1;
    const fin=[
      [-.013,.053,.019],[p[0]*.37,p[1]*.26+.119,p[2]*.29],[p[0]*.82,p[1]*.58+.181,p[2]*.59],
      [p[0]*1.06,p[1]*.71+.176,p[2]+.203*side],[p[0]*.84,p[1]*.70+.053,p[2]*.90],[p[0]*.56,p[1]*.65-.004,p[2]*.62],
    ];
    if(i<9)panel(k,j,i%2?'dreamTide':'dreamShell',fin,.023);
    seam(k,j,i%2?'dreamHot':'dreamShell',fin.slice(1,5).map(([x,y,z],k)=>[x,y+.012,z,[.017,.025,.019,.003][k]]));
    for(const side of sides){
      const kick=side*(w*.60)*Math.sign(p[2]||1);
      const rail=[[kick*.51,-w*.154,.029,.035],[p[0]*.31+kick,-w*.23+p[1]*.21,p[2]*.26,.049],
        [p[0]*.69+kick,-w*.26+p[1]*.55,p[2]*.70,.040],[p[0]*.95+kick*.28,p[1]*.89,p[2]+.015,.021],
        [p[0],p[1],p[2],.004]];
      seam(k,j,side===1?'dreamShell':'dreamTide',rail,11);
      if(i<8)seam(k,j,'dreamPale',rail.slice(0,4).map(([x,y,z,r])=>[x+kick*.21,y-.019,z,r*.24]),9);
    }
  }
  return {joints,skeleton:bindTide(k,body,joints,shell,mobile)};
}

function drownedArcher(k,entry,mobile){
  const body=k.bone(k.root,0,1.048,0),head=k.bone(body,0,1.019,.071);
  bodyShape(k,body,'dreamCloth',[[0,-.104,-.123,.117,.086],[0,.044,-.062,.235,.166],
    [0,.254,-.055,.294,.175],[0,.458,.019,.181,.141],[0,.651,.041,.197,.171],[0,.833,.013,.235,.139],
    [0,.947,-.011,.123,.100]],mobile,{sides:mobile?14:19,rings:mobile?18:25,section:2.63,ridge:.21});
  bodyShape(k,head,'dreamDark',[[0,-.203,.027,.112,.106],[0,-.105,-.02,.183,.154],[0,.086,-.028,.202,.154],
    [0,.220,-.073,.159,.124],[0,.298,-.119,.096,.087]],mobile,{section:2.59,ridge:.24});
  const arms=[],crownParts=[];
  const {joints:tide,skeleton}=coiledTide(k,body,mobile);
  const bowLimbs=[];
  for(const side of sides){
    const r=path=>sym(side,path);
    const face=r([[.012,.12,.175],[.099,.190,.133],[.176,.109,.123],[.182,-.019,.136],
      [.128,-.132,.164],[.063,-.195,.161],[.022,-.142,.201]]);
    panel(k,head,'dreamPale',face,.046);
    bodyShape(k,head,'dreamShell',r([[.08,-.087,.176,.024,.016],[.138,-.067,.171,.039,.027],
      [.183,-.009,.136,.042,.029],[.201,.060,.095,.026,.018],[.175,.127,.106,.005,.004]]),mobile,
    {sides:8,rings:10,section:2.63});
    seam(k,head,'dreamPale',r([[.07,-.141,.188,.008],[.122,-.109,.200,.017],[.161,-.060,.183,.021],
      [.186,.007,.150,.015],[.172,.068,.146,.003]]),11);
    seam(k,head,'dreamShell',r([[.025,.069,.197,.010],[.075,.096,.196,.023],[.125,.067,.181,.018],[.154,.041,.157,.003]]));
    seam(k,head,'dreamHot',r([[.034,.037,.208,.005],[.084,.053,.214,.013],[.126,.041,.195,.010],[.151,.025,.178,.003]]));
    const crest=k.bone(head,side*.067,.126,-.018);
    const branch=r([[.022,.031,.051,.051,.049],[.116,.149,.028,.068,.052],[.235,.204,-.081,.050,.042],
      [.422,.22,-.177,.035,.029],[.628,.189,-.262,.016,.012],[.721,.251,-.324,.004,.003]]);
    bodyShape(k,crest,'dreamPale',branch,mobile,{section:2.72,rings:20});
    seam(k,crest,'dreamPale',r([[.118,.162,.004,.041],[.191,.243,-.045,.040],[.293,.334,-.137,.023],
      [.376,.427,-.251,.004]]),12);
    seam(k,crest,'dreamCloth',r([[.031,.071,-.052,.036],[.090,.251,-.083,.048],[.117,.425,-.176,.031],
      [.229,.611,-.286,.006]]),13);
    seam(k,crest,'dreamCloth',r([[.138,.188,-.093,.032],[.231,.329,-.143,.041],
      [.345,.384,-.225,.019],[.421,.512,-.296,.004]]),11);
    crownParts.push({crest,side});
    const armour=r([[.021,.812,.176],[.124,.876,.141],[.246,.824,.084],[.232,.599,.146],
      [.146,.419,.224],[.076,.389,.226],[.014,.55,.221]]);
    panel(k,body,'dreamShell',armour,.054);
    seam(k,body,'dreamPale',armour.slice(1,7).map(([x,y,z],i)=>[x+side*.015,y,z+.031,[.021,.033,.025,.024,.014,.003][i]]),10);
    for(let i=0;i<3;i++){
      const y=.278-i*.093,x=.13+i*.028;
      bodyShape(k,body,i%2?'dreamDark':'dreamCloth',r([[x-.022,y+.103,-.189,.068,.052],
        [x+.071,y+.046,-.232,.082,.060],[x+.142,y-.028,-.235,.074,.054],[x+.214,y-.143,-.22,.005,.004]]),
      mobile,{rings:8,sides:8,ridge:.25});
    }
    seam(k,body,'dreamPale',r([[.066,.768,-.179,.022],[.159,.609,-.208,.026],[.144,.425,-.226,.021],
      [.093,.277,-.273,.008]]),13);
    const arm=k.bone(body,side*.193,.792,.04),elbow=k.bone(arm,side*.145,-.243,.115);
    const grip=k.bone(elbow,side*.078,-.218,.135);
    bodyShape(k,arm,'dreamMain',r([[0,.038,-.021,.087,.084],[.08,-.031,.006,.121,.096],
      [.144,-.172,.073,.083,.075],[.146,-.26,.122,.055,.065]]),mobile,{section:2.6});
    bodyShape(k,elbow,'dreamShell',r([[0,.069,-.028,.065,.067],[.043,-.046,.050,.086,.080],
      [.074,-.141,.079,.076,.057],[.069,-.222,.117,.054,.046]]),mobile,{section:2.76});
    seam(k,elbow,'dreamPale',r([[.031,.07,.056,.018],[.095,-.008,.117,.027],[.104,-.112,.137,.026],
      [.089,-.201,.145,.004]]),10);
    bodyShape(k,grip,'dreamMain',r([[0,.025,-.025,.044,.047],[.024,-.018,.041,.059,.061],
      [.017,-.065,.073,.047,.042]]),mobile,{rings:8});
    if(side>0){
      const bow=k.bone(grip,.022,-.036,.055),string=waterBow(k,bow,mobile);
      bowLimbs.push({bow,string});
    }
    arms.push({arm,elbow,grip,side});
  }
  const skin=bossSkin(k,mobile,tools=>{
    for(const side of sides){
      const r=path=>sym(side,path);
      tools.silk(body,entry.name+' · 拖裳',r([[.071,.825,-.163,.066],[.163,.651,-.219,.112],
        [.224,.359,-.225,.126],[.263,.092,-.28,.116],[.352,-.166,-.341,.014]]),
      {tint:0x302850,trim:0xe78eab,lining:0x59233f,phase:side*.93,style:'woven',flex:1.43});
      tools.silk(head,entry.name+' · 水鬚',r([[.091,.165,-.04,.023],[.246,.078,-.18,.058],
        [.305,-.12,-.27,.055],[.387,-.338,-.36,.034],[.473,-.528,-.452,.007]]),
      {tint:0x405897,trim:0xc6cce0,phase:side*.81,style:'mane',flex:1.47,across:[.91,.11,.36]});
    }
    return true;
  });
  const azure=k.materials.dreamHot;
  azure.emissive.setHex(0x92bdee);
  return {body,head,skin,sourceSculpt:true,catalogueSculpt:entry.id,crest:k.bone(body,0,0,0),pattern:'hover',
    disposeRig:()=>skeleton.dispose(),
    polishEnergy:{tint:0x8baff1,shape:'ribbons',anchor:body,span:[.8,.76,.67],offset:[0,.3,.02]},
    cataloguePose({beat,wind,strike,travel,fall,stage}){
      head.rotation.set(Math.sin(beat*.75)*.08+wind*.19-strike*.29,Math.sin(beat*.52)*.15+strike*.16,fall*.23);
      for(const {crest,side} of crownParts)crest.rotation.z=side*(Math.sin(beat*.68+side)*.095+stage*.12+strike*.16);
      for(const {arm,elbow,grip,side} of arms){
        arm.rotation.x=-wind*(side>0?.71:.46)+strike*.42;
        arm.rotation.z=side*(.22+wind*.47-strike*.23);
        elbow.rotation.x=-.22+wind*.70-strike*.54;
        grip.rotation.y=-wind*.29*side+strike*.43*side;
      }
      for(const {bow,string} of bowLimbs){
        bow.rotation.y=-wind*.16+strike*.17;
        string.scale.z=1+wind*.38-strike*.18;
      }
      for(const [i,joint] of tide.entries()){
        const blend=i/tide.length;
        joint.rotation.x=(.034+.065*blend)*Math.sin(beat*.7-i*.52)+wind*.032-strike*.043;
        joint.rotation.y=(.048+.040*blend)*Math.cos(beat*.59-i*.43)+travel*.034+strike*.042;
      }
      azure.emissiveIntensity=.23+wind*.51+strike*.8+stage*.14;
    },
  };
}

function mountedSpear(k,pike,mobile){
  pike.name='噩夢守衛 · 錯金槍';
  markEnemyWeapon(pike,[0,-.102,1.54],{from:[0,.011,-.698],width:.14});
  seam(k,pike,'dreamDark',[[0,.041,-.802,.040],[0,.027,-.38,.045],[0,.01,.13,.047],
    [0,-.032,.62,.042],[0,-.073,1.09,.035]],16);
  seam(k,pike,'dreamGold',[[0,.042,-.879,.007],[0,.044,-.794,.059],[0,.031,-.65,.053],[0,.024,-.43,.028]],12);
  bodyShape(k,pike,'dreamGold',[[0,-.049,.703,.060,.060],[0,-.056,.795,.074,.071],
    [0,-.062,.893,.063,.060],[0,-.074,.977,.043,.041]],mobile,{rings:10,section:2.94});
  const blade=[[0,-.072,.83],[-.113,-.056,.937],[-.111,-.046,1.07],
    [-.063,-.053,1.218],[0,-.102,1.54],[.054,-.148,1.261],[.129,-.144,1.072],[.095,-.09,.923]];
  panel(k,pike,'dreamPale',blade,.047);
  seam(k,pike,'dreamGold',[[0,-.040,.845,.025],[-.016,-.052,1.003,.025],[.016,-.093,1.193,.023],[0,-.088,1.50,.004]],13);
  for(const side of sides)seam(k,pike,'dreamGold',sym(side,[[.031,-.035,.83,.024],[.121,-.041,.90,.030],
    [.176,-.020,.986,.024],[.172,-.013,1.074,.009]]),9);
}

function horseMane(k,horseHead,mobile){
  const crest=k.bone(horseHead,0,.140,-.175);
  crest.name='噩夢守衛 · 頸鬃';
  bodyShape(k,crest,'dreamHorseMane',[[0,.118,.133,.083,.111],[.033,.164,.030,.120,.123],
    [.041,.095,-.183,.141,.116],[.118,-.046,-.366,.132,.093],[.161,-.192,-.512,.086,.071],
    [.186,-.350,-.605,.016,.014]],mobile,{sides:mobile?10:15,rings:18,section:2.62,ridge:.29,fur:true});
  const count=mobile?10:15;
  for(let i=0;i<count;i++){
    const u=i/(count-1),x=(u-.42)*.165,reach=.58+Math.sin(i*2.96)*.105;
    const t=.070*Math.sin(i*2.321);
    const strands=[[x,.119,.073-i*.012,.028,.032],[x+.015,.127,.005-i*.016,.046,.039],
      [x+.074,.041,-.261-u*.079,.047,.038],[x+.13,-.098-u*.09,-.43+t,.031,.031],
      [x+.168,-.306-u*.099,-reach,.005,.008]];
    bodyShape(k,crest,i%4?'dreamHorseMane':'dreamGuardHairs',strands,mobile,{sides:7,rings:11,section:2.42,ridge:.32,fur:true});
    if(i%2===0)seam(k,crest,'dreamGuardHairs',strands.map(([x,y,z,w],j)=>[x+.009,y+.019,z-.006,w*(j===2?.55:.28)]),11);
  }
  return crest;
}

function horseTail(k,body,mobile){
  const tail=k.bone(body,0,.146,-1.009);
  tail.name='噩夢守衛 · 多束馬尾';
  bodyShape(k,tail,'dreamHorseMane',[[0,.078,.043,.103,.073],[.034,-.042,-.151,.149,.104],
    [.089,-.262,-.287,.145,.099],[.155,-.406,-.457,.124,.081],[.164,-.619,-.595,.050,.055]],mobile,
  {rings:17,section:2.69,ridge:.31,fur:true});
  const count=mobile?12:17;
  for(let i=0;i<count;i++){
    const u=i/(count-1),x=(u-.5)*.217,arch=.043*Math.sin(i*2.21);
    const end=.688+Math.sin(i*3.31)*.132;
    const lock=[[x*.51,.021,-.064,.031,.028],[x*.78+.070,-.161,-.217+arch,.045,.039],
      [x*1.06+.134,-.333-u*.038,-.366+arch,.051,.040],[x*1.29+.191,-.507-u*.065,-.523+arch,.040,.032],
      [x*1.39+.181,-end,-.643-u*.058,.004,.004]];
    bodyShape(k,tail,i%4?'dreamHorseMane':'dreamGuardHairs',lock,mobile,{sides:7,rings:12,section:2.39,ridge:.34,fur:true});
    if(i%3===0)seam(k,tail,'dreamGuardHairs',lock.map(([x,y,z,w])=>[x+.021,y+.018,z-.023,w*.27]),13);
  }
  return tail;
}

function windRider(k,entry,mobile){
  const body=k.bone(k.root,0,1.035,0),horseHead=k.bone(body,0,.493,.834);
  bodyShape(k,body,'dreamHorseHide',[[0,-.035,-1.108,.207,.216],[0,.064,-.779,.433,.347],[0,.12,-.377,.388,.390],
    [0,.172,.022,.398,.368],[0,.199,.548,.308,.298],[0,.301,.734,.209,.234]],mobile,
  {sides:mobile?14:20,rings:mobile?18:25,section:2.44,ridge:.24,fur:true});
  bodyShape(k,body,'dreamHorseHide',[[0,.024,.437,.295,.263],[0,.182,.557,.323,.292],[0,.415,.653,.266,.244],
    [0,.528,.811,.215,.208],[0,.588,.973,.158,.173]],mobile,{section:2.47,ridge:.22,fur:true});
  bodyShape(k,horseHead,'dreamHorseHide',[[0,.049,-.17,.192,.193],[0,.095,.02,.205,.213],
    [0,-.019,.241,.149,.194],[0,-.150,.418,.122,.115],[0,-.218,.521,.105,.073]],mobile,{section:2.76,ridge:.26,fur:true});
  const mane=horseMane(k,horseHead,mobile),tail=horseTail(k,body,mobile);
  const rider=k.bone(body,0,.462,-.211),head=k.bone(rider,0,.878,.059);
  bodyShape(k,rider,'dreamShell',[[0,.047,-.028,.214,.158],[0,.209,-.033,.257,.187],[0,.395,-.02,.294,.201],
    [0,.625,-.004,.284,.169],[0,.750,.01,.166,.129]],mobile,{section:2.88});
  bodyShape(k,head,'dreamDark',[[0,-.111,.037,.089,.071],[0,-.041,.034,.122,.109],
    [0,.059,.004,.137,.112],[0,.177,-.038,.120,.096],[0,.255,-.052,.082,.076]],mobile,{section:2.59,ridge:.23});
  const face=[[0,.288,-.020],[.072,.178,.119],[.132,.094,.123],[.135,-.046,.073],[.025,-.093,.137],
    [-.059,-.063,.131],[-.128,.012,.106],[-.123,.109,.132],[-.048,.172,.131]];
  panel(k,head,'dreamShell',face,.041);
  seam(k,head,'dreamGold',[[0,.259,.011],[.032,.176,.141,.027],[.027,.093,.172,.026],
    [.032,-.021,.166,.024],[.024,-.081,.154,.005]].map(([x,y,z,w=.006])=>[x,y,z,w]),12);
  const legs=[],fittings=[],riderArms=[],siegePikes=[];
  for(const side of sides){
    const r=path=>sym(side,path);
    seam(k,head,'glow',r([[.043,.085,.155,.004],[.077,.083,.147,.010],[.108,.075,.133,.009],[.119,.06,.124,.003]]),8);
    for(let i=0;i<3;i++){
      const y=.032-i*.055,rear=r([[.117,y+.061,-.015],[.134,y+.051,-.092],[.094,y+.034,-.174],
        [.021,y+.031,-.191],[.014,y-.041,-.194],[.081,y-.051,-.174],[.143,y-.045,-.095]]);
      panel(k,head,i%2?'dreamDark':'dreamShell',rear,.027);
      seam(k,head,'dreamGold',rear.slice(1,6).map(([x,y,z],n)=>[x,y,z-.025,[.009,.013,.012,.009,.003][n]]));
    }
    const ears=r([[.096,.195,-.031,.045],[.141,.257,-.058,.052],[.188,.382,-.106,.031],
      [.204,.445,-.139,.004]]);
    seam(k,horseHead,'dreamDark',ears,11);
    const plateFace=r([[.019,.191,.161],[.161,.149,.191],[.178,.023,.249],[.129,-.176,.465],
      [.058,-.261,.568],[.018,-.196,.512]]);
    panel(k,horseHead,'dreamShell',plateFace,.052);
    seam(k,horseHead,'dreamGold',plateFace.slice(1,5).map(([x,y,z],j)=>[x+side*.017,y+.016,z+.029,[.025,.031,.023,.004][j]]),12);
    seam(k,horseHead,'dreamGold',r([[.091,-.149,.451,.020],[.171,-.098,.371,.025],[.228,.041,.105,.019],
      [.246,.081,-.004,.004]]));
    seam(k,horseHead,'glow',r([[.118,.038,.275,.005],[.171,.082,.217,.013],[.184,.096,.142,.005]]));
    bodyShape(k,horseHead,'dreamHorseHide',r([[.087,-.156,.277,.044,.042],[.138,-.113,.203,.074,.067],
      [.175,-.051,.111,.092,.069],[.184,.05,-.018,.071,.056],[.146,.121,-.119,.026,.028]]),
    mobile,{sides:9,rings:12,section:2.67,ridge:.27,fur:true});
    seam(k,horseHead,'dreamGuardHairs',r([[.123,-.123,.354,.011],[.176,-.108,.253,.025],
      [.211,-.062,.137,.020],[.206,.042,.025,.018],[.173,.106,-.063,.004]]),12);
    bodyShape(k,body,'dreamHorseHide',r([[.168,.473,.812,.081,.074],[.274,.398,.658,.139,.117],
      [.336,.255,.555,.143,.109],[.357,.079,.432,.122,.094],[.309,-.042,.354,.048,.046]]),
    mobile,{sides:9,rings:14,section:2.81,ridge:.24,fur:true});
    seam(k,body,'dreamGuardHairs',r([[.208,.431,.808,.012],[.326,.362,.654,.025],
      [.391,.196,.517,.024],[.395,.039,.402,.019],[.343,-.045,.348,.004]]),13);
    for(let row=0;row<4;row++){
      const y=.427-row*.084,z=.579+row*.095,x=.281-row*.019;
      const field=r([[.012,y+.113,z+.162],[x*.69,y+.075,z+.100],[x+ .055,y-.019,z-.032],
        [x+.079,y-.141,z-.141],[x*.67,y-.166,z-.091],[.045,y-.119,z+.087]]);
      panel(k,body,row%2?'dreamCloth':'dreamShell',field,.055);
      seam(k,body,'dreamGold',field.slice(1,5).map(([x,y,z],n)=>[x+side*.024,y,z+.019,[.013,.028,.025,.003][n]]));
    }
    const flank=k.bone(body,0,.282,-.071);
    const saddle=r([[.198,.231,.446],[.351,.203,.345],[.488,.118,.184],[.502,-.040,-.044],[.482,-.232,-.394],
      [.339,-.321,-.478],[.261,-.222,-.379],[.232,-.023,-.156],[.189,.118,.137]]);
    panel(k,flank,'dreamCloth',saddle,.078);
    seam(k,flank,'dreamGold',saddle.slice(1,8).map(([x,y,z],i)=>[x+side*.044,y-.019,z,[.022,.038,.027,.021,.018,.012,.005][i]]),16);
    for(let row=0;row<(mobile?3:4);row++){
      const y=.119-row*.083,z=.200-row*.072,x=.417+row*.021;
      const lamella=r([[x-.093,y+.056,z+.090],[x+.049,y+.061,z+.021],[x+.098,y+.003,z-.091],
        [x+.074,y-.065,z-.187],[x-.009,y-.113,z-.157],[x-.070,y-.067,z+.053]]);
      panel(k,flank,row%2?'dreamShell':'dreamDark',lamella,.037);
      seam(k,flank,'dreamGold',lamella.slice(1,5).map(([x,y,z],i)=>[x+side*.022,y+.010,z-.013,[.012,.020,.014,.003][i]]),9);
    }
    fittings.push({panel:flank,side});
    const cuisse=k.bone(rider,side*.151,.087,.057);
    bodyShape(k,cuisse,'dreamCloth',r([[0,.098,-.053,.108,.099],[.107,.048,.032,.153,.127],
      [.193,-.090,.104,.136,.112],[.238,-.244,.154,.104,.078],[.222,-.371,.173,.065,.071]]),mobile,
    {section:2.88,ridge:.22});
    for(let row=0;row<4;row++){
      const y=.061-row*.088,x=.129+row*.027;
      const skirt=r([[x-.07,y+.052,.194],[x+.021,y+.035,.215],[x+.114,y-.041,.141],
        [x+.097,y-.108,.144],[x+.021,y-.105,.212],[x-.077,y-.076,.211]]);
      panel(k,cuisse,row%2?'dreamShell':'dreamGold',skirt,.031);
      seam(k,cuisse,'dreamPale',skirt.slice(1,5).map(([x,y,z],j)=>[x,y,z+.018,[.014,.024,.018,.003][j]]));
    }
    const shoulder=k.bone(rider,side*.228,.634,.053);
    const elbow=k.bone(shoulder,side*.162,-.235,.071);
    const hand=k.bone(elbow,side*.088,-.232,.077);
    bodyShape(k,shoulder,'dreamMain',r([[0,.049,0,.123,.103],[.09,-.031,.032,.148,.126],
      [.159,-.148,.080,.094,.087],[.176,-.247,.095,.070,.068]]),mobile,{section:2.83});
    bodyShape(k,elbow,'dreamShell',r([[.003,.048,-.01,.088,.093],[.057,-.053,.006,.115,.102],
      [.068,-.146,.046,.104,.086],[.078,-.243,.069,.065,.072]]),mobile,{section:3.04});
    bodyShape(k,hand,'dreamMain',r([[0,.037,-.021,.053,.061],[.012,-.018,.03,.071,.074],
      [.017,-.08,.067,.058,.061]]),mobile,{rings:8});
    const plates=side>0?4:3;
    for(let row=0;row<plates;row++){
      const y=.093-row*.107,t=row*.019,cap=r([[.019,y+.082,.13],[.138,y+.122,.055],[.245+t,y+.070,-.039],
        [.254+t,y-.044,-.179],[.198,y-.131,-.224],[.084,y-.105,-.134],[.031,y-.041,.089]]);
      panel(k,shoulder,row%2?'dreamShell':'dreamGold',cap,.052);
      seam(k,shoulder,'dreamPale',cap.slice(1,6).map(([x,y,z],i)=>[x+side*.020,y+.011,z-.020,[.021,.035,.024,.019,.003][i]]));
    }
    if(side>0){
      const weapon=k.bone(hand,.009,-.026,.067);
      mountedSpear(k,weapon,mobile);
      weapon.rotation.set(.168,-.441,.05);
      siegePikes.push(weapon);
    }
    riderArms.push({shoulder,elbow,hand,side});
    const pad=k.bone(body,0,.293,-.652);
    const outer=r([[.277,.110,.261],[.453,.096,.198],[.525,.050,-.03],[.537,-.123,-.221],
      [.446,-.288,-.241],[.294,-.291,-.233],[.233,-.148,-.021]]);
    panel(k,pad,'dreamDark',outer,.098);
    seam(k,pad,'dreamGold',outer.slice(0,6).map(([x,y,z],i)=>[x+side*.037,y+.018,z-.038,[.016,.035,.028,.022,.016,.006][i]]),14);
    for(let i=0;i<3;i++){
      const x=.343+i*.067,y=.022-i*.04,z=-.105-i*.018;
      const latch=r([[x-.034,y+.033,z-.132],[x+ .060,y+.050,z-.12],[x+.072,y-.101,z-.098],
        [x+.047,y-.187,z-.082],[x-.023,y-.164,z-.12],[x-.046,y-.077,z-.137]]);
      panel(k,pad,i%2?'dreamShell':'dreamGold',latch,.035);
    }
    fittings.push({panel:pad,side});
    for(const fore of [false,true]){
      const z=fore?.589:-.696,x=fore?.286:.342;
      const upper=k.bone(body,side*x,.045,z);
      const lower=k.bone(upper,side*.062,-.337,fore?.109:-.146);
      const foot=k.bone(lower,side*.017,-.46,fore?.17:.164);
      const swing=fore?.14:.18;
      bodyShape(k,upper,'dreamDark',r([[0,.105,-.063,swing,swing],[.047,-.061,-.018,swing*1.16,swing],
        [.056,-.221,fore?.073:-.071,swing*.73,swing*.77],[.065,-.346,fore?.118:-.148,swing*.54,swing*.65]]),mobile,
      {section:2.71,ridge:.27,fur:true});
      bodyShape(k,lower,'dreamHorseHide',r([[0,.055,-.016,.096,.101],[.019,-.116,-.052,.087,.084],
        [.041,-.252,.074,.069,.063],[.007,-.440,.152,.069,.072]]),mobile,{section:2.69,ridge:.32,fur:true});
      const muscle=fore?
        [[.013,.047,.005,.063,.049],[.091,-.060,.029,.091,.064],[.115,-.161,.051,.081,.062],
          [.100,-.244,.068,.040,.033],[.073,-.311,.076,.008,.008]]:
        [[-.061,.076,-.109,.099,.061],[.029,.058,-.164,.145,.094],[.109,-.064,-.192,.128,.096],
          [.136,-.182,-.145,.080,.064],[.089,-.288,-.070,.024,.023]];
      bodyShape(k,upper,'dreamHorseHide',r(muscle),mobile,{sides:9,rings:13,section:2.62,ridge:.22,fur:true});
      bodyShape(k,foot,'dreamShell',r([[0,.015,-.036,.065,.069],[.010,-.055,.059,.107,.096],
        [.024,-.115,.142,.110,.072],[.023,-.127,.217,.089,.049]]),mobile,{rings:10,section:3.07});
      const shin=r([[-.065,.065,.029],[.064,.091,.045],[.132,-.031,.039],[.103,-.174,.135],[.027,-.263,.163],[-.038,-.186,.141]]);
      panel(k,lower,'dreamShell',shin,.045);
      seam(k,lower,'dreamGold',shin.slice(1,5).map(([x,y,z],i)=>[x,y,z+.034,[.012,.028,.022,.003][i]]));
      legs.push({upper,lower,foot,side,fore});
    }
  }
  const skin=bossSkin(k,mobile,tools=>{
    for(const side of sides){
      const r=path=>sym(side,path);
      tools.silk(rider,entry.name+' · 墜披',r([[.108,.631,-.154,.079],[.177,.462,-.307,.106],
        [.216,.196,-.398,.148],[.261,-.036,-.532,.122],[.345,-.211,-.645,.009]]),
      {style:'woven',tint:0x33382e,trim:0xb4945b,phase:side*.95,flex:.99});
      tools.silk(mane,entry.name+' · 頸鬃髮梢',r([[.062,.167,.077,.027],[.116,.135,-.097,.042],
        [.184,.018,-.218,.054],[.211,-.164,-.359,.038],[.253,-.308,-.524,.007]]),
      {style:'mane',tint:0x2b2931,trim:0x736d65,phase:side*.94,flex:1.32,across:[.78,.41,-side*.27]});
      tools.silk(tail,entry.name+' · 飄散尾鬃',r([[.052,.034,-.033,.027],[.123,-.148,-.231,.054],
        [.168,-.336,-.375,.074],[.244,-.542,-.492,.053],[.290,-.762,-.637,.009]]),
      {style:'mane',tint:0x302c33,trim:0x6c6864,phase:side*.71,flex:1.36,across:[.79,.50,.12]});
    }
    return true;
  });
  return {body,head,portraitHead:head,skin,grounded:true,sourceSculpt:true,catalogueSculpt:entry.id,
    pattern:'gallop',crest:k.bone(body,0,0,0),arms:riderArms.map(a=>a.shoulder),
    polishEnergy:{tint:0xd5bf89,shape:'ribbons',anchor:body,span:[.79,1.09,1.08],offset:[0,.51,0]},
    cataloguePose({beat,wind,strike,travel,fall,step,stage}){
      horseHead.rotation.x=-wind*.32+strike*.35+Math.sin(beat*.78)*.09;
      mane.rotation.x=travel*.127+Math.sin(beat*.61)*.044-strike*.27;
      mane.rotation.z=travel*.089*Math.sin(step*1.2)+wind*.12-strike*.14;
      rider.rotation.x=wind*.18+strike*.53+travel*.073*Math.sin(step*1.7);
      rider.rotation.y=wind*.20-strike*.29;
      head.rotation.x=wind*.13-strike*.29;
      for(const {shoulder,elbow,hand,side} of riderArms){
        shoulder.rotation.x=-.17-wind*.59+strike*.73;
        shoulder.rotation.z=side*(.024+wind*.29-strike*.12);
        elbow.rotation.x=-.24+wind*.44-strike*.51;
        hand.rotation.y=side*(wind*.34-strike*.14);
      }
      for(const weapon of siegePikes)weapon.rotation.set(.168-wind*.43+strike*.62,-.441+strike*.46,wind*.26);
      for(const {upper,lower,foot,side,fore} of legs){
        const swing=Math.sin(step+side*Math.PI*.58+(fore?0:Math.PI)),lift=Math.max(0,swing)*travel;
        upper.rotation.x=swing*travel*.50+wind*.20-strike*.35;
        lower.rotation.x=lift*(fore?-.51:.61)+fall*.37;
        foot.rotation.x=lift*(fore?.49:-.45)+strike*.20;
      }
      for(const {panel,side} of fittings)panel.rotation.z=side*(Math.sin(beat*.81)*travel*.090+strike*.13+stage*.069);
      tail.rotation.x=-travel*.22+strike*.24;tail.rotation.y=.24*Math.sin(beat*.59)+strike*.28;
    },
  };
}

export const nightmareSculpts={m142:furnaceRoot,m143:thunderFighter,m146:drownedArcher,m147:windRider};
