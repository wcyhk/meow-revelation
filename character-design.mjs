import { FigureBuilder } from "./character-mesh.mjs?v=moonwake";

const I = 0x1d1827;
const BONE = 0xffdfaf;
const BRASS = 0xc48c4f;
const ROSE = 0xd5425c;
const SEA = 0x8ff6d9;
const DARK_STEEL = 0x425167;
const CLOAK = [[-.34,.31],[-.34,.03,-.52,-.37],[-.34,-.28,-.28,-.40],[-.11,-.31,0,-.39],[.16,-.28,.29,-.36],[.35,-.28,.45,-.33],[.44,-.08,.31,.31]];
const SICKLE = [[-.25,-.09],[-.13,.10,.11,.32,.43,.21],[.54,.15,.58,.04],[.30,.15,.08,.05,-.06,-.12],[-.17,-.16],[-.25,-.09]];
const CRESCENT = [[-.03,-.42],[-.52,-.34,-.58,.38,-.01,.44],[-.27,.32,-.39,.04,-.27,-.18],[-.17,-.34,.01,-.40]];
const EAR = [[-.125,-.08],[-.106,.108,-.064,.28],[-.049,.321,-.012,.28],[.065,.16,.134,-.066],[.026,-.145,-.125,-.08]];
const HORN = [[-.066,-.05],[-.14,.19,-.23,.30,-.17,.46],[-.135,.48,-.117,.411],[-.04,.29,.17,.23,.084,-.035],[.03,-.11,-.066,-.05]];

function symmetrical(fn){for(const side of [-1,1])fn(side,side<0?"L":"R");}

function face(b,head,y=.005,z=.245,eyes=0xffe6ad,pupil=I,slit=false){
  const eye = b.joint("eye",head,[0,y,0]);
  symmetrical(side=>{
    const turn=[-.08,side*.18,side*-.07];
    b.shape(eye,"orb",[side*.126,.021,z-.006],[.101,.103,.044],I,turn);
    b.shape(eye,"orb",[side*.123,.019,z+.020],[.083,.081,.032],eyes,turn,.12);
    b.shape(eye,"orb",[side*.127,.013,z+.048],[slit?.022:.046,.057,.015],pupil,turn);
    b.shape(eye,"orb",[side*.127-.019,.040,z+.057],[.020,.021,.009],0xfff5e5,turn,.45);
    b.shape(eye,"orb",[side*.129+.017,-.010,z+.057],[.009,.010,.006],0xeefaf1,turn,.29);
  });
  return eye;
}

function biped(b,style,body,trim,paw,scale=1) {
  const torso = b.joint("torso",0,[0,.54,0]);
  b.shape(torso,"orb",[0,.010,0],[.27*scale,.28,.204*scale],body);
  b.shape(torso,"barrel",[0,-.144,0],[.243*scale,.223,.172*scale],body);
  b.shape(torso,"orb",[0,.027,.150*scale],[.170*scale,.173,.071],trim);
  symmetrical((s,n)=>{
    const arm = b.joint("arm"+n,torso,[s*.247*scale,.088,0]);
    const elbow = b.joint("elbow"+n,arm,[0,-.168,.012]);
    b.shape(arm,"orb",[s*.021,-.068,.002],[.099*scale,.141,.105*scale],body,[0,0,s*.10]);
    b.shape(elbow,"orb",[0,-.034,.013],[.076*scale,.106,.085*scale],trim);
    b.shape(elbow,"orb",[0,-.124,.041],[.086*scale,.087,.101*scale],paw);
    const hip = b.joint("hip"+n,0,[s*.123*scale,.282,0]);
    const knee = b.joint("knee"+n,hip,[0,-.137,.005]);
    b.shape(hip,"orb",[0,-.06,0],[.092*scale,.124,.091*scale],body);
    b.shape(knee,"orb",[0,-.067,0],[.076*scale,.104,.080*scale],trim);
    b.shape(knee,"orb",[0,-.088,.057],[.091*scale,.072,.135*scale],paw);
  });
  const head=b.joint("head",0,[0,.904,.014]);
  return {head,torso,style};
}

function tail(b,color,tipColor=color){
  const root=b.joint("tail",0,[0,.343,-.182]);
  const tip=b.joint("tailTip",root,[0,.094,-.292]);
  b.line(root,[[0,0,0],[.014,-.033,-.11],[.044,.008,-.21],[0,.094,-.292]],.058,color);
  b.line(tip,[[0,0,0],[-.044,.105,-.055],[-.091,.195,-.024],[-.133,.202,.050]],.047,color);
  b.shape(tip,"orb",[-.129,.194,.038],[.057,.061,.075],tipColor);
}

function lantern(b,j,pos,scale,color,gear=0){
  const [x,y,z]=pos;
  b.shape(j,"orb",[x,y,z],[.094*scale,.138*scale,.089*scale],color,[0,0,0],.72,gear);
  for(const d of [-1,1]){
    b.shape(j,"barrel",[x,y+d*.130*scale,z],[.127*scale,.063*scale,.120*scale],BRASS,[0,0,0],0,gear);
  }
  for(let i=0;i<4;i++){
    const a=i*Math.PI*.5+.60;
    b.shape(j,"box",[x+Math.cos(a)*.104*scale,y,z+Math.sin(a)*.090*scale],[.025*scale,.238*scale,.025*scale],I,[0,0,0],0,gear);
  }
  b.shape(j,"hoop",[x,y+.179*scale,z],[.050*scale,.050*scale,.073*scale],BRASS,[0,0,0],0,gear);
}

function weapons(b,j){
  b.shape(j,"barrel",[0,.215,.017],[.027,.965,.027],0x6c4950,[.18,0,-.26],0,1);
  b.shape(j,"barrel",[.083,.498,.090],[.039,.244,.041],BRASS,[.18,0,-.26],0,1);
  b.volume(j,SICKLE,[.114,.571,.099],[.81,1.02,.075],0xb2d4d5,[.12,.10,-.23],0,1);
  b.line(j,[[.118,.557,.143],[.263,.702,.143],[.455,.738,.142],[.548,.701,.136]],.014,0xf3debb,1,.22);
  b.shape(j,"gem",[.111,.556,.156],[.046,.071,.029],ROSE,[0,0,-.21],.18,1);

  b.shape(j,"barrel",[0,.02,0],[.038,.23,.038],0x583745,[.21,0,-.17],0,2);
  b.shape(j,"box",[0,.114,.025],[.174,.035,.076],BRASS,[.16,0,0],0,2);
  b.volume(j,[[0,-.055],[-.080,.005],[-.062,.258],[.042,.48],[.089,.246],[.043,.035]],[0,.13,.035],[.87,.81,.051],0xafdbe2,[.18,0,-.17],.10,2);
  b.shape(j,"gem",[.001,.177,.074],[.029,.065,.018],SEA,[0,0,0],.42,2);

  b.shape(j,"barrel",[0,.10,.04],[.038,.71,.038],0x5b414e,[.18,0,.14],0,3);
  b.shape(j,"hoop",[-.039,.446,.098],[.083,.083,.093],BRASS,[0,0,0],0,3);
  b.volume(j,[[0,-.21],[-.31,-.16,-.32,.16],[-.19,.053],[-.13,.106],[-.13,-.033,-.048,-.079],[-.037,.28],[.043,.28],[.048,-.079],[.13,-.042,.13,.105],[.19,.052],[.32,.16],[.31,-.16,0,-.21]],[-.032,.245,.065],[1,1,.089],DARK_STEEL,[.16,0,.16],0,3);
  b.shape(j,"gem",[-.042,.257,.123],[.064,.079,.040],0xe9af6e,[0,0,0],.31,3);

  b.shape(j,"barrel",[.044,.234,.029],[.024,1.21,.024],0x6b474e,[.11,0,-.16],0,4);
  b.shape(j,"barrel",[.138,.753,.084],[.047,.14,.039],BRASS,[.10,0,-.16],0,4);
  b.volume(j,[[0,-.056],[-.085,.078],[.028,.354],[.099,.112],[.035,-.061]],[.15,.767,.089],[1,1,.070],0xe3d6bf,[.11,0,-.16],.16,4);
  b.volume(j,[[0,.034],[.23,0],[.137,-.09],[.218,-.146],[0,-.112]],[.113,.608,.073],[1,1,.026],ROSE,[.10,0,-.16],0,4);

  b.shape(j,"barrel",[0,.152,0],[.034,.65,.034],0x544059,[.15,0,-.11],0,5);
  b.shape(j,"hoop",[.023,.459,.066],[.080,.080,.085],BRASS,[0,0,0],0,5);
  lantern(b,j,[.080,.298,.147],1.13,SEA,5);

  for(const slot of [6,7,9,11]){
    const tint=slot===6?0x7b483d:slot===11?0x54697c:0x957051;
    b.shape(j,"barrel",[.03,.31,.05],[.032,.91,.032],tint,[.16,0,-.20],0,slot);
    for(const y of [.01,.19,.69])b.shape(j,"barrel",[.02+(y-.20)*.19,y,.02+y*.13],[.049,.061,.049],BRASS,[.16,0,-.20],0,slot);
  }
  b.shape(j,"gem",[.117,.780,.14],[.109,.157,.108],0xb9a8ff,[0,0,-.15],.52,7);
  b.shape(j,"orb",[.118,.735,.14],[.129,.069,.110],BRASS,[0,0,-.15],0,7);
  b.shape(j,"barrel",[.034,.21,.04],[.043,.28,.037],0x9c3d56,[.12,0,-.18],0,8);
  b.shape(j,"barrel",[.068,.363,.06],[.101,.035,.080],BRASS,[.12,0,-.18],0,8);
  b.volume(j,[[0,-.064],[.001,.284,.098,.57],[.147,.601],[.111,.282,.059,-.063]],[.074,.409,.06],[.95,1,.061],0xcce3e0,[.12,0,-.18],.10,8);
  b.shape(j,"orb",[.110,.755,.10],[.114,.103,.108],BRASS,[0,0,-.14],0,9);
  b.shape(j,"barrel",[.111,.714,.10],[.128,.042,.113],0xf1b666,[0,0,-.15],0,9);
  b.shape(j,"orb",[.115,.685,.10],[.041,.043,.038],0xffd497,[0,0,0],.30,9);
  b.line(j,[[.078,-.305,.030],[.260,-.117,.027],[.296,.205,.021],[.241,.47,.035],[.085,.71,.058]],.031,0xba8252,10);
  b.line(j,[[.078,-.305,.030],[.085,.71,.058]],.010,BONE,10);
  b.shape(j,"gem",[.103,.771,.14],[.085,.139,.078],0xece3cc,[0,0,-.16],0,11);

  b.shape(j,"gem",[.143,.795,.136],[.106,.207,.098],0xffd289,[.16,0,-.20],.30,-6);
  b.shape(j,"hoop",[.116,.792,.14],[.202,.214,.063],0x9c7ad3,[.12,.22,0],.19,-7);
  b.volume(j,[[0,-.04],[.019,.19,.13,.37],[.19,.47],[.12,.12,.051,-.037]],
    [.155,.829,.073],[.79,.78,.037],0xf49da6,[.12,0,-.18],.25,-8);
  b.shape(j,"gem",[.113,.867,.099],[.054,.095,.054],0x9ce8ff,[0,0,-.15],.37,-9);
  b.line(j,[[.084,.71,.058],[.02,.79,.073],[-.027,.94,.078]],.024,0xa9dfa2,-10,.28);
  b.line(j,[[.081,-.30,.031],[.024,-.39,.036],[-.022,-.48,.052]],.023,0xa9dfa2,-10,.28);
  b.shape(j,"orb",[.114,.791,.148],[.109,.089,.091],0x6bdfb4,[0,0,-.16],.37,-11);
}

function cat(kind){
  const b=new FigureBuilder();
  const palettes={
    hero:[0x353144,0x272537,0x262133,0xee9aaa],
    smith:[0xbb6942,0x654953,0x7b4651,0xffad83],
    keeper:[0xe6cfab,0x4e7380,0x354d61,0xe69f91],
    kit:[0xf2ceb4,0x745b87,0x4d4869,0xf09d93],
    ink:[0x8e809b,0x516c7c,0x43475f,0xf3a5ac],
    gray:[0x968fa9,0x647654,0x3b4c53,0xd697a8],
    ghostCat:[0x9dcdd9,0x5e5c9d,0x6576a5,0xa2e6f4],
    snowDemon:[0xe0eef3,0x7189b8,0xa1c2dc,0x7cb4df],
    tao:[0xe4d6be,0x8e4b4b,0x564150,0xe49b98],
    blade:[0xc88951,0x647585,0x3d4757,0xe1a188],
    gun:[0x8a899d,0x465c7a,0x924e54,0xb586a0],
    yin:[0x9290a4,0xe4ceb3,0x795870,0xcd8f94],
    medic:[0xe7b771,0x839a79,0x67866e,0xe2a097],
    arrow:[0xab7658,0x537c87,0x824e4b,0xd49381],
  };
  const [fur,coat,boot,inner]=palettes[kind]||palettes.kit;
  const hero=kind==="hero";
  const rig=biped(b,"cat",coat,boot,fur);
  const {head,torso}=rig;
  b.shape(head,"round",[0,.014,0],[.314,.274,.258],fur);
  b.shape(head,"orb",[0,-.088,.081],[.265,.194,.209],fur);
  symmetrical((s,n)=>{
    const ear=b.joint("ear"+n,head,[s*.207,.143,-.038]);
    b.volume(ear,EAR,[0,0,0],[.98,1.08,.083],fur,[0,s*.12,s*-.27]);
    b.volume(ear,EAR,[s*.004,.033,.049],[.63,.69,.035],inner,[0,s*.11,s*-.25]);
    b.volume(head,[[0,-.09],[.12,-.084,.24,.041],[.093,.031,0,.078]],[s*.208,-.079,-.008],[s*.68,.66,.083],fur);
    b.shape(head,"orb",[s*.060,-.092,.259],[.087,.049,.051],hero?0x544151:0xffe5c1);
    b.shape(head,"orb",[s*.182,-.082,.206],[.045,.024,.010],hero?0x9d546a:0xda8682,[0,s*.33,0]);
    for(let i=0;i<3;i++)b.shape(head,"orb",[s*(.147+i*.025),-.086-i%2*.017,.244-i*.010],[.009,.007,.005],I);
  });
  face(b,head,.008,.225,hero?0xffe5a6:0xc6eed6,I,hero);
  b.shape(head,"gem",[0,-.084,.304],[.037,.026,.024],hero?0xe48b91:0xab575e,[0,0,Math.PI*.25]);
  b.line(head,[[-.033,-.128,.295],[0,-.137,.300],[.033,-.126,.294]],.008,I);
  b.volume(head,[[0,-.049],[.06,.041],[.046,-.088],[0,-.119],[-.046,-.088],[-.06,.041]],[0,.141,.223],[.61,.64,.018],hero?0x76566f:0xc08e75);
  tail(b,fur,kind==="hero"?0x705367:boot);
  const r = b.joints.findIndex(x=>x.name==="elbowR");
  const grip=b.joint("grip",r,[0,-.136,.084]);
  if(hero){
    b.shape(torso,"orb",[0,.208,.024],[.241,.094,.212],ROSE);
    b.shape(torso,"orb",[.169,.183,.168],[.078,.071,.070],0xef5b6a);
    b.volume(torso,[[-.161,.055],[.156,.074],[.125,-.064],[-.068,-.109,-.145,-.045]],[0,.147,.181],[1,1,.046],ROSE,[0,0,-.16]);
    b.shape(torso,"barrel",[0,-.119,0],[.259,.058,.187],0x544051);
    b.shape(torso,"gem",[0,-.118,.200],[.049,.050,.025],BRASS);
    b.shape(torso,"orb",[0,-.108,.223],[.022,.023,.012],SEA,[0,0,0],.31);
    const cloth=b.joint("cloth",torso,[.105,.209,-.153]);
    const end=b.joint("clothTip",cloth,[.002,-.030,-.241]);
    const banner=[[-.080,0],[-.087,.111],[-.073,.323],[-.016,.294],[.043,.366],[.064,.231],[.088,0]];
    b.volume(cloth,banner,[0,0,0],[1,.76,.038],ROSE,[-Math.PI/2-.43,0,-.23]);
    b.volume(end,banner,[0,-.085,0],[.75,.66,.029],0xba395b,[-Math.PI/2-.49,0,-.15]);
    weapons(b,grip);
  }else if(kind==="smith"){
    b.shape(head,"orb",[0,.183,-.020],[.286,.118,.250],0x855463);
    b.shape(head,"barrel",[0,.201,.104],[.280,.038,.207],0xc39c72);
    b.shape(torso,"box",[0,-.082,.182],[.287,.309,.035],0xab7359);
    b.shape(grip,"barrel",[0,.128,0],[.031,.429,.028],0x875b4f,[0,0,-.24]);
    b.shape(grip,"box",[.049,.310,0],[.243,.146,.112],0x7e8a9d,[0,0,.17]);
  }else{
    b.shape(torso,"orb",[0,.145,0],[.235,.08,.190],0xaac8a7);
    b.shape(torso,"gem",[0,.111,.204],[.036,.058,.020],BRASS);
    if(kind==="keeper")lantern(b,grip,[0,-.071,.032],.88,SEA);
    if(kind==="kit")b.shape(head,"gem",[.153,.211,.192],[.058,.038,.024],ROSE,[0,0,.27]);
    if(kind==="ink")b.shape(grip,"box",[0,.022,.013],[.163,.218,.046],0xa0759a,[.2,0,.14]);
    if(kind==="gray")b.shape(grip,"orb",[0,-.037,.058],[.080,.101,.066],0x81b592,[0,0,0],.13);
    if(kind==="tao"||kind==="yin"){
      b.shape(head,"barrel",[0,.285,-.025],[.266,.102,.192],coat);
      b.shape(grip,"box",[0,-.038,.061],[.104,.189,.029],kind==="tao"?0xc6e4a5:0xf4d9af,[.06,0,.23],.21);
      b.shape(grip,"gem",[.011,-.036,.086],[.044,.072,.02],0x987157);
    }
    if(kind==="blade"){
      symmetrical(s=>b.shape(torso,"box",[s*.252,.127,.028],[.107,.145,.231],0xa98e77,[0,0,-s*.33]));
      b.volume(grip,SICKLE,[.082,.292,.068],[.78,1.37,.077],0xb7c4cd,[0,0,.98]);
    }
    if(kind==="gun"){
      b.shape(head,"barrel",[0,.282,-.018],[.284,.073,.225],0x6d5449);
      b.shape(grip,"barrel",[.049,.172,.044],[.045,.64,.045],DARK_STEEL,[.29,0,-.32]);
      b.shape(grip,"box",[0,.026,.056],[.077,.29,.072],0x815845,[.29,0,-.32]);
    }
    if(kind==="medic")lantern(b,grip,[0,-.077,.063],.67,0xd9e29c);
    if(kind==="arrow"){
      b.line(grip,[[.056,-.25,.02],[.188,-.04,.028],[.172,.24,.031],[.032,.43,.038]],.026,0xc89355);
      b.line(grip,[[.056,-.25,.02],[.032,.43,.038]],.009,BONE);
    }
  }
  return b.finish(rig.style);
}

function rat(){
  const b=new FigureBuilder(),fur=0x566371,moss=0x477b72;
  const torso=b.joint("torso",0,[0,.32,-.16]);
  const head=b.joint("head",0,[0,.423,.143]);
  b.shape(torso,"orb",[0,.016,0],[.323,.270,.430],fur);
  b.shape(torso,"orb",[0,-.045,.109],[.220,.185,.240],0x848f89);
  b.shape(head,"orb",[0,0,0],[.268,.224,.276],fur);
  b.shape(head,"orb",[0,-.061,.200],[.156,.100,.183],0x92918e);
  b.shape(head,"gem",[0,-.033,.339],[.058,.047,.042],0xc08092);
  b.shape(head,"box",[0,-.153,.268],[.050,.065,.040],BONE);
  symmetrical((s,n)=>{
    b.shape(head,"orb",[s*.194,.157,-.034],[.127,.144,.067],fur,[0,0,-s*.21]);
    b.shape(head,"orb",[s*.198,.161,.020],[.082,.105,.032],0xad7d88,[0,0,-s*.21]);
    const leg=b.joint("hip"+n,0,[s*.208,.168,.125]);
    const rear=b.joint("arm"+n,torso,[s*.213,-.161,-.183]);
    for(const j of [leg,rear])b.shape(j,"orb",[0,-.09,.036],[.109,.089,.148],0x8e7384);
    b.shape(torso,"pebble",[s*.142,.209,-.17],[.170,.093,.232],moss);
    b.shape(torso,"gem",[s*.215,.273,-.148],[.026,.067,.026],0x90c6a5,[0,0,s*.31],.27);
  });
  face(b,head,.012,.208,0xb1f8cd,I,true);
  const t=b.joint("tail",torso,[0,-.02,-.333]);
  b.line(t,[[0,0,0],[.02,-.12,-.17],[.15,-.14,-.30],[.25,-.051,-.38]],.046,0x927080);
  return b.finish("beast");
}

function witch(){
  const b=new FigureBuilder(),veil=0x74518c,pink=0xb98cbf;
  const head=b.joint("head",0,[0,.701,0]);
  b.shape(head,"orb",[0,-.052,.004],[.326,.279,.288],veil);
  b.shape(head,"orb",[0,.061,-.034],[.389,.237,.332],pink);
  b.shape(head,"orb",[0,-.064,.041],[.366,.075,.309],0xdca5cb);
  b.shape(head,"gem",[0,.116,.254],[.069,.093,.045],0x9cffee,[0,0,0],.6);
  face(b,head,-.144,.239,0xffd2e7,I);
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7;
    const j=b.joint("ribbon"+i,head,[Math.cos(a)*.265,-.112,Math.sin(a)*.216]);
    const len=.24+.13*(i%3);
    b.line(j,[[0,0,0],[.025,-.085,.022],[-.036,-len*.69,.011],[.025,-len,.056]],.035,i%2?0x8f62a6:0x59bcbf);
    b.shape(j,"gem",[.025,-len,.056],[.037,.068,.033],i%2?0xffbede:SEA,[0,0,0],.42);
  }
  return b.finish("float");
}

function crab(){
  const b=new FigureBuilder(),shell=0xba4f55,light=0xef8567;
  const torso=b.joint("torso",0,[0,.411,0]);
  b.shape(torso,"orb",[0,-.055,.025],[.397,.247,.316],shell);
  b.shape(torso,"orb",[0,.074,-.045],[.397,.212,.323],light);
  b.shape(torso,"orb",[0,-.104,.242],[.239,.099,.132],0x6e354c);
  b.shape(torso,"gem",[0,.192,-.113],[.095,.151,.094],BONE,[.26,0,0]);
  symmetrical((s,n)=>{
    const arm=b.joint("arm"+n,torso,[s*.277,-.045,.174]);
    const claw=b.joint("elbow"+n,arm,[s*.216,-.062,.093]);
    b.shape(arm,"orb",[s*.101,-.016,.021],[.168,.087,.091],shell,[0,.12,-s*.25]);
    b.shape(claw,"orb",[0,0,.053],[.164,.120,.151],light);
    b.volume(claw,[[0,-.08],[.18,-.02,.145,.14],[.034,.069],[.019,.126],[-.05,.15],[-.109,.004]],[-s*.058,.028,.151],[s,.84,.086],shell,[0,0,-s*.06]);
    for(let i=0;i<3;i++){
      const leg=b.joint("leg"+n+i,torso,[s*.253,-.058,.101-i*.164]);
      b.line(leg,[[0,0,0],[s*.136,-.02,0],[s*.224,-.189,.033],[s*.267,-.274,.067]],.037,i%2?light:shell);
    }
    b.shape(torso,"gem",[s*.231,.174,-.129],[.065,.094,.052],0xf4b48b,[0,0,s*.32]);
  });
  face(b,torso,-.040,.300,0xf7c795,0x3b2534);
  return b.finish("crab");
}

function bailiff(clay=false){
  const b=new FigureBuilder(),cloth=clay?0xb36e4b:0xa17355,boots=clay?0x75513f:0x554252;
  const {head,torso}=biped(b,"biped",cloth,boots,0x756050,1.08);
  b.shape(head,"orb",[0,.006,0],[.301,.272,.244],clay?0xc18965:0xcd9c65);
  b.shape(head,"barrel",[0,.235,-.025],[.109,.149,.096],cloth,[.18,0,.12]);
  b.shape(head,"orb",[0,.213,-.026],[.143,.039,.129],I);
  face(b,head,.012,.221,0xffbe72,I,true);
  b.line(head,[[-.160,-.141,.179],[-.062,-.117,.225],[.062,-.127,.226],[.149,-.105,.186]],.014,0x644155);
  for(let i=0;i<5;i++)b.shape(head,"box",[(i-2)*.057,-.121,.230],[.014,.061,.022],0xe4b480,[0,0,.24]);
  b.shape(torso,"box",[0,-.12,.195],[.325,.211,.065],0x704855);
  b.shape(torso,"gem",[.059,-.091,.248],[.057,.066,.023],0xcb6855);
  const r=b.joints.findIndex(x=>x.name==="elbowR");
  b.shape(r,"barrel",[.065,.048,.097],[.044,.571,.046],0x624552,[.16,0,-.26]);
  b.shape(r,"barrel",[.135,.303,.142],[.131,.258,.137],0x888e9a,[0,0,1.18]);
  if(clay){
    for(let row=0;row<3;row++)for(let col=0;col<4;col++)
      b.shape(torso,"box",[(col-1.5)*.092,.107-row*.085,.207-Math.abs(col-1.5)*.018],[.074,.065,.044],row===0?0xaf805d:0xa76d50,[0,0,.06]);
    b.shape(head,"barrel",[0,.198,.035],[.310,.071,.266],0x725644);
  }
  return b.finish("biped");
}

function wisp(){
  const b=new FigureBuilder(),fur=0xa99ed1,sea=0x85dcca;
  const torso=b.joint("torso",0,[0,.338,-.122]);
  const head=b.joint("head",0,[0,.535,.185]);
  b.shape(torso,"orb",[0,0,0],[.271,.243,.421],fur);
  b.shape(head,"orb",[0,.006,0],[.277,.241,.233],0xe9dce4);
  b.shape(head,"orb",[0,-.047,.173],[.159,.093,.139],0xeee9df);
  b.shape(head,"gem",[0,-.039,.292],[.045,.029,.023],0x7b557a);
  face(b,head,.019,.201,SEA,0x473956,true);
  symmetrical((s,n)=>{
    b.volume(head,EAR,[s*.169,.159,-.002],[1,1.22,.081],fur,[0,0,s*-.22]);
    b.volume(head,EAR,[s*.169,.173,.050],[.61,.88,.028],sea,[0,0,s*-.22]);
    const front=b.joint("hip"+n,0,[s*.177,.232,.205]);
    const rear=b.joint("arm"+n,torso,[s*.184,-.101,-.218]);
    for(const j of [front,rear])b.shape(j,"orb",[0,-.106,.039],[.079,.152,.085],0xe4d9df,[.17,0,0]);
    b.volume(torso,HORN,[s*.141,.073,-.198],[s*.66,.75,.068],sea,[1.35,0,s*.47],.13);
  });
  const j=b.joint("tail",torso,[0,.055,-.363]);
  b.line(j,[[0,0,0],[0,.13,-.14],[.05,.31,-.24],[.019,.39,-.38]],.080,sea);
  b.shape(j,"pebble",[.010,.384,-.322],[.087,.131,.144],0xa7eef0,[0,0,0],.20);
  return b.finish("beast");
}

function sentinel(){
  const b=new FigureBuilder(),rock=0x443b55,copper=0xba624f;
  const head=b.joint("head",0,[0,.547,0]);
  b.shape(head,"pebble",[0,.014,0],[.317,.322,.259],rock);
  b.shape(head,"orb",[0,.007,.181],[.253,.228,.119],I);
  b.shape(head,"orb",[0,.010,.275],[.150,.113,.043],0x9e4559,[0,0,0],.38);
  b.shape(head,"orb",[.006,.032,.297],[.076,.083,.032],0xffa381,[0,0,0],.65);
  b.shape(head,"orb",[.017,.045,.319],[.039,.065,.017],I);
  b.shape(head,"orb",[-.014,.067,.327],[.026,.018,.011],0xfff1c3,[0,0,0],.7);
  symmetrical(s=>{
    b.volume(head,HORN,[s*.208,.158,-.034],[s*.83,.79,.102],copper,[.15,0,-s*.40]);
    b.shape(head,"gem",[s*.286,.021,.094],[.059,.069,.045],BRASS);
  });
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3-.5;
    const j=b.joint("ribbon"+i,0,[Math.cos(a)*.22,.354,Math.sin(a)*.16]);
    b.volume(j,HORN,[0,-.09,0],[.57,.60,.097],rock,[0,0,Math.PI+a*.12]);
    b.shape(j,"gem",[0,-.21,.009],[.049,.100,.038],copper);
  }
  return b.finish("float");
}

function mantle(b,torso,color,lining,wide=1){
  const cloth=b.joint("cloth",torso,[0,.075,-.157]);
  b.volume(cloth,CLOAK,[0,-.042,-.013],[wide,1.1,.117],color,[.16,0,0]);
  b.volume(cloth,CLOAK,[0,-.067,.058],[wide*.91,1.0,.059],lining,[.15,0,0]);
  symmetrical(s=>{
    b.shape(torso,"orb",[s*.252*wide,.092,-.010],[.163*wide,.118,.149],color,[.15,0,s*.31]);
    b.shape(torso,"gem",[s*.263*wide,.121,.081],[.074,.106,.053],lining,[0,0,-s*.19]);
  });
  return cloth;
}

function skull(b,head,ivory,light,width=1){
  b.shape(head,"round",[0,.024,.014],[.309*width,.262,.255],ivory);
  b.shape(head,"orb",[0,-.083,.105],[.246*width,.176,.205],ivory);
  face(b,head,-.005,.250,light,I,true);
  symmetrical(s=>{
    b.shape(head,"orb",[s*.213*width,-.092,.187],[.085,.062,.076],ivory,[0,s*.30,0]);
    b.shape(head,"gem",[s*.086,-.147,.272],[.030,.067,.034],ivory,[0,0,s*.17]);
    b.line(head,[[s*.063,.069,.295],[s*.139,.096,.299],[s*.201,.109,.269]],.016,0x6d545a);
  });
  b.shape(head,"gem",[0,-.073,.304],[.045,.044,.025],I,[0,0,Math.PI*.25]);
  b.line(head,[[-.105,-.125,.255],[0,-.141,.282],[.105,-.125,.255]],.012,0x554050);
  for(let i=0;i<3;i++)b.shape(head,"box",[(i-1)*.046,-.155,.282],[.017,.043,.026],ivory);
}

function angler(royal=false){
  const b=new FigureBuilder();
  const {head,torso}=biped(b,"guardian",0x294b61,0x416577,0x9eaba9,1.24);
  const cloth=mantle(b,torso,0x33566b,0x48868d,1.32);
  b.shape(torso,"orb",[0,.006,.171],[.236,.232,.111],0x527f85);
  for(let i=0;i<4;i++){
    b.shape(torso,"gem",[0,.144-i*.076,.265],[.073-i*.011,.029,.027],0xa3aeb1,[0,0,.10*i]);
  }
  b.shape(head,"orb",[0,.015,-.037],[.416,.317,.309],0x336275);
  skull(b,head,0xc5ccbd,SEA,1.03);
  symmetrical((s,n)=>{
    b.volume(head,EAR,[s*.251,.135,-.021],[1.01,1.08,.090],0x385e73,[0,0,-s*.39]);
    b.volume(head,HORN,[s*.30,-.019,-.043],[s*.73,.61,.070],0x68a49f,[.11,0,-s*1.08]);
    b.volume(cloth,HORN,[s*.392,-.118,-.035],[s*.91,.69,.084],0x467583,[1.02,0,-s*.95]);
    const arm=b.joints.findIndex(j=>j.name==="elbow"+n);
    for(let i=0;i<3;i++)b.shape(arm,"spike",[(i-1)*.057,-.169,.108],[.027,.096,.025],0xd6d4bf,[0,0,Math.PI+(i-1)*.18]);
  });
  if(royal){
    b.shape(head,"barrel",[0,.235,-.010],[.313,.108,.268],BRASS);
    for(let i=0;i<5;i++){
      b.shape(head,"spike",[(i-2)*.099,.326,.079],[.058,.18-i%2*.05,.046],i%2?0x93dec8:0xd3ae61,[0,0,(i-2)*-.11]);
    }
    const arm=b.joints.findIndex(j=>j.name==="elbowR");
    b.shape(arm,"barrel",[.09,.221,.11],[.041,.94,.039],0x948967,[0,0,-.14]);
    for(const i of [-1,0,1])b.shape(arm,"spike",[.142+i*.095,.744+(.07*(1-Math.abs(i))),.11],[.037,.229,.042],0xabe8d7,[0,0,-.14-i*.17],.19);
    return b.finish("guardian");
  }
  const lure=b.joint("halo",head,[0,.235,-.104]);
  b.line(lure,[[0,0,0],[.026,.27,-.026],[.128,.424,.078],[.214,.403,.188],[.222,.283,.235]],.027,0x5f8693);
  lantern(b,lure,[.224,.208,.244],.61,0x94ffee);
  return b.finish("guardian");
}

function weigher(imperial=false){
  const b=new FigureBuilder();
  const {head,torso}=biped(b,"guardian",0xa36f51,0x76546a,0xc2956e,1.32);
  const cloth=mantle(b,torso,0xbd8957,0x72475e,1.18);
  b.shape(head,"orb",[0,.034,-.067],[.363,.318,.294],0xb4815c);
  skull(b,head,0xf4ce96,0xffa165,1.02);
  symmetrical(s=>{
    b.shape(head,"orb",[s*.26,.211,-.034],[.104,.136,.064],0xc99a70,[0,0,-s*.40]);
    b.shape(head,"orb",[s*.265,.211,.006],[.066,.090,.032],0xb07579,[0,0,-s*.40]);
    const leaf=[[0,-.110],[.295,-.083,.406,.168],[.294,.178,.219,.129],[.124,.185,0,.113]];
    for(let i=0;i<3;i++)b.volume(cloth,leaf,[s*.154,.078-i*.072,-.057],[s*(1+i*.11),.94,.053],i%2?0xe1ad69:0xad7654,[.24+i*.18,0,s*.30]);
    for(let i=0;i<3;i++)b.shape(torso,"gem",[s*(.128+i*.061),.12-i*.078,.195],[.024,.068,.024],0xe5ba79,[0,0,s*.39]);
  });
  b.shape(torso,"barrel",[0,.334,-.249],[.042,.92,.039],BRASS);
  if(imperial){
    b.shape(head,"box",[0,.309,0],[.637,.072,.348],0x423d47);
    b.shape(head,"box",[0,.353,0],[.665,.033,.358],BRASS);
    for(let i=0;i<6;i++){
      const x=(i-2.5)*.096;
      b.shape(head,"barrel",[x,.239,.171],[.013,.219,.012],BRASS);
      b.shape(head,"gem",[x,.145,.177],[.024,.044,.020],0x71aa8d);
    }
    const arm=b.joints.findIndex(j=>j.name==="elbowR");
    b.shape(arm,"barrel",[0,.20,.105],[.045,.31,.044],0x674b43,[0,0,-.26]);
    b.volume(arm,[[0,-.1],[.062,.446],[.02,.671],[-.087,.493],[-.078,-.10]],[.071,.379,.105],[1,1,.097],0x81b8a2,[0,0,-.22]);
    return b.finish("guardian");
  }
  const scales=b.joint("halo",head,[0,.46,-.185]);
  b.line(scales,[[-.491,.057,0],[-.278,.106,0],[0,.031,0],[.278,.106,0],[.491,.057,0]],.029,BRASS);
  b.shape(scales,"gem",[0,.106,0],[.068,.089,.062],0xffc17b,[0,0,0],.13);
  symmetrical((s,n)=>{
    const pan=b.joint("pan"+n,scales,[s*.432,.056,0]);
    b.line(pan,[[0,.008,0],[-.113,-.181,.023],[-.116,-.220,.022]],.010,0xf2bd81);
    b.line(pan,[[0,.008,0],[.112,-.182,-.021],[.112,-.218,-.024]],.010,0xf2bd81);
    b.shape(pan,"barrel",[0,-.235,0],[.146,.050,.130],BRASS);
    b.shape(pan,"orb",[0,-.214,0],[.107,.027,.096],0xffbd82,[0,0,0],.15);
  });
  const right=b.joints.findIndex(j=>j.name==="elbowR");
  b.shape(right,"box",[.041,-.061,.123],[.215,.261,.079],0x6f4555,[.44,0,-.18]);
  b.shape(right,"box",[.047,-.055,.155],[.180,.228,.033],0xffdaa8,[.44,0,-.18]);
  b.shape(right,"gem",[.047,-.058,.180],[.044,.056,.022],ROSE,[0,0,-.24]);
  return b.finish("guardian");
}

function abbess(){
  const b=new FigureBuilder();
  const {head,torso}=biped(b,"guardian",0x625079,0x7773a5,0xd1c0df,1.12);
  const cloth=mantle(b,torso,0x55476e,0x8f7caf,1.25);
  b.shape(torso,"barrel",[0,-.171,0],[.336,.464,.226],0x534468);
  b.shape(torso,"gem",[0,.064,.237],[.090,.121,.037],0x9ddff8,[0,0,0],.45);
  b.shape(head,"orb",[0,.024,-.062],[.366,.321,.297],0x6d5d96);
  skull(b,head,0xe5d4e5,0xb8e4ff,.99);
  symmetrical(s=>{
    b.volume(head,HORN,[s*.246,.135,-.053],[s*.70,.71,.095],0x695888,[.21,0,-s*1.79]);
    b.volume(cloth,CLOAK,[s*.174,-.105,.049],[.59,.94,.055],0x8a7aac,[.12,0,s*.14]);
    b.shape(head,"gem",[s*.266,.126,.157],[.047,.116,.043],0xc0b1d4,[0,0,-s*.51]);
  });
  const halo=b.joint("halo",head,[0,.312,-.203]);
  b.shape(halo,"hoop",[0,.034,0],[.323,.323,.071],0x8c7fc2,[0,0,0],.18);
  b.volume(halo,CRESCENT,[.083,.11,.032],[.74,.68,.047],0xb3ddff,[0,0,-.66],.45);
  for(let i=0;i<5;i++){
    const a=i*Math.PI/5+.16;
    b.shape(halo,"gem",[Math.cos(a)*.306,Math.sin(a)*.320+.025,.027],[.025,.049,.022],0xccecff,[0,0,a],.40);
  }
  return b.finish("guardian");
}

function undertow(){
  const b=new FigureBuilder();
  const {head,torso}=biped(b,"guardian",0x503747,0x603a55,0x9e8387,1.24);
  const cloth=mantle(b,torso,0x922c50,0xc15862,1.42);
  b.shape(head,"orb",[0,.043,-.072],[.363,.311,.312],0x443446);
  skull(b,head,0xd9c3b2,0x9dffe5,1.08);
  symmetrical((s,n)=>{
    b.volume(head,EAR,[s*.217,.146,-.023],[.98,1.13,.109],0x443b53,[0,s*.08,-s*.28]);
    b.volume(head,HORN,[s*.236,.202,-.074],[s*1.30,1.02,.106],0x6a4058,[0,0,-s*.40]);
    b.volume(head,HORN,[s*.257,.092,-.129],[s*.96,.74,.086],0x87506a,[.23,0,-s*.93]);
    b.shape(head,"gem",[s*.299,.095,.095],[.051,.094,.040],0xad615f,[0,0,-s*.48]);
    b.volume(cloth,HORN,[s*.328,-.106,-.027],[s*.82,.83,.083],0x9b3a55,[1.10,0,-s*.70]);
    const arm=b.joints.findIndex(j=>j.name==="elbow"+n);
    b.shape(arm,"gem",[s*.021,-.065,.091],[.069,.116,.042],0x947382,[0,0,-s*.19]);
  });
  const halo=b.joint("halo",head,[0,.31,-.231]);
  b.shape(halo,"hoop",[0,.052,0],[.402,.402,.088],0xee6a70,[0,0,0],.65);
  b.shape(halo,"hoop",[0,.052,-.029],[.438,.438,.049],0x8f3d64,[0,0,0],.32);
  b.shape(halo,"gem",[0,.498,-.002],[.039,.068,.037],0xff8e8a,[0,0,0],.58);
  b.shape(head,"gem",[0,.132,.242],[.059,.086,.026],0x67d6ce,[0,0,0],.51);
  b.shape(torso,"gem",[0,.046,.261],[.105,.129,.035],0x51888d,[0,0,0],.33);
  b.shape(torso,"gem",[0,.054,.288],[.042,.076,.018],0xadffee,[0,0,0],.65);
  for(let i=0;i<3;i++)b.shape(torso,"gem",[0,-.058-i*.060,.248-i*.015],[.106-i*.017,.020,.029],0xcc997b,[0,0,0]);
  return b.finish("guardian");
}

function snowElephant(){
  const b=new FigureBuilder(),ice=0xa0bedc,blue=0x626f9e;
  const {head,torso}=biped(b,"guardian",ice,blue,0xd8e7f3,1.40);
  b.shape(head,"round",[0,.018,.010],[.375,.287,.284],ice);
  face(b,head,.003,.239,0xd7eff9,I);
  symmetrical(s=>{
    b.shape(head,"orb",[s*.324,.005,-.063],[.231,.258,.071],ice,[0,s*.25,-s*.21]);
    b.shape(head,"orb",[s*.340,.004,-.010],[.168,.198,.044],0xb2add2,[0,s*.25,-s*.21]);
    b.volume(head,HORN,[s*.187,-.195,.198],[s*.68,.61,.081],BONE,[.31,0,s*2.0]);
  });
  const trunk=b.joint("tail",head,[0,-.099,.23]);
  b.line(trunk,[[0,0,0],[0,-.174,.104],[.034,-.281,.174],[.080,-.283,.254],[.100,-.242,.294]],.076,ice);
  for(let i=0;i<4;i++)b.shape(torso,"gem",[(i-1.5)*.112,.098,.252],[.047,.092,.032],0xb7dcff,[0,0,(i-1.5)*.18],.24);
  const crest=b.joint("halo",head,[0,.25,-.029]);
  for(const i of [-1,0,1])b.shape(crest,"gem",[i*.127,.047,.008],[.071,.17-Math.abs(i)*.050,.069],0x9bddff,[.17,0,i*.29],.33);
  return b.finish("guardian");
}

function seaCreature(kind){
  const b=new FigureBuilder(),shell=kind==="turtle",dragon=kind==="blackDragon";
  const base=dragon?0x4f4b78:shell?0x6fa188:0x62aaa8,trim=dragon?0xab8fe1:0xa5d59f;
  const torso=b.joint("torso",0,[0,.314,-.085]);
  const head=b.joint("head",0,[0,shell?.35:.64,.163]);
  b.shape(torso,"orb",[0,.040,0],shell?[.341,.248,.364]:[.214,.226,.228],base);
  b.shape(head,"orb",[0,0,0],shell?[.195,.159,.193]:[.227,.184,.241],trim);
  b.shape(head,"orb",[0,-.057,.178],[.109,.076,.140],base);
  face(b,head,.012,.175,SEA,I,true);
  const tail=b.joint("tail",torso,[0,-.03,-.18]);
  b.line(tail,[[0,0,0],[.017,-.075,-.111],[.072,-.137,-.194],[.123,-.04,-.255]],shell?.044:.067,base);
  symmetrical((s,n)=>{
    const arm=b.joint("arm"+n,torso,[s*.142,-.055,.092]);
    b.shape(arm,"orb",[s*.124,-.055,.029],[.171,.056,.098],trim,[0,0,s*-.23]);
    if(shell){
      b.shape(torso,"gem",[s*.150,.169,-.023],[.122,.086,.153],0x89ac6a,[0,0,s*.47]);
      b.shape(torso,"orb",[s*.185,-.058,-.187],[.125,.065,.094],base);
    }else{
      b.volume(head,HORN,[s*.139,.093,-.051],[s*.62,.53,.074],trim,[.13,0,s*-.54],.11);
      if(dragon)b.volume(arm,EAR,[s*.134,.045,-.038],[s*1.32,1.09,.090],trim,[.70,0,-s*.72]);
    }
  });
  return b.finish(shell?"beast":"float");
}

const designs={rat,witch,crab,bailiff,wisp,sentinel,boss:angler,weigher,abbess,undertow,
  clay:()=>bailiff(true),spirit:witch,qinSoul:()=>weigher(true),snowElephant,seaKing:()=>angler(true),
  turtle:()=>seaCreature("turtle"),seaHorse:()=>seaCreature("seaHorse"),blackDragon:()=>seaCreature("blackDragon")};
export function buildFigure(kind){
  return Object.hasOwn(designs,kind)?designs[kind]():cat(kind);
}
