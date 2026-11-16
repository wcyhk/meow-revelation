import * as T from '../three.min.mjs';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],TAU=Math.PI*2;
const mirror=(s,path)=>path.map(([x,...point])=>[s*x,...point]);
const line=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:16,sides:mobile?6:8,ridge:.21});
const volume=(k,j,m,p,mobile,seed=1,section=2.35)=>k.geometry(j,m,
  sculptVolume(p,{rings:mobile?12:19,sides:mobile?9:14,section,ridge:.17,seed}));
const facet=(k,j,m,x,y,z,w,h=w,d=w)=>k.mesh(j,'gem',m,x,y,z,w,h,d);

export const crutchFinishes={
  tigerCharcoal:[0x46444b,.019,.93,'hide'],tigerSmoke:[0x8b8781,.026,.86,'hide'],
  tigerFang:[0xc1b69e,.13,.65,'bone'],tigerLeather:[0x6f3d32,.16,.78,'hide'],
  crutchCopper:[0xb28a51,.56,.47,'bronze'],crutchIron:[0x565453,.70,.48,'iron'],
  crutchGourd:[0xc47b3b,.028,.66,'hide'],crutchGourdShade:[0x825231,.07,.76,'hide'],
  crutchFace:[0x9e7b67,.014,.84,'hide'],crutchHair:[0xc0bfac,.06,.79,'hide'],
  crutchLinen:[0xe4d5b4,.03,.85,'cloth'],crutchBlue:[0x487382,.17,.68,'cloth'],
};

function leatherPanel(k,j,mat,trim,path,mobile,d=.042){
  k.sculpt.plate(j,mat,path,d,d*.25);
  line(k,j,trim,path.slice(0,-1).map(([x,y,z],i)=>[x,y+.007,z+d*.48,i===0?.004:.013]),mobile);
}

function hoop(k,j,mat,r,w,mobile,z=0){
  const g=new T.TorusGeometry(r,w,mobile?6:8,mobile?27:42);
  g.translate(0,0,z);k.geometry(j,mat,g);
}

function pelt(k,j,path,mobile,axis='z',seed=7){
  const g=sculptVolume(path,{axis,rings:mobile?32:45,sides:mobile?24:32,section:2.27,ridge:.103,fur:true,seed});
  const {position,color}=g.attributes;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
    const phase=z*15.6+y*4.4+Math.cos(x*4.7)*1.48+Math.sin(z*5.13+y*3.9)*.87;
    const stripe=Math.pow(Math.max(0,Math.sin(phase)),.51);
    const shade=(1.05-.61*stripe)*(.89+Math.sin(24*y+z*34+x*39)*.062);
    color.setXYZ(i,color.getX(i)*shade,color.getY(i)*shade*.99,color.getZ(i)*shade*.97);
  }
  k.geometry(j,'tigerSmoke',g);
}

function gourd(k,parent,mobile){
  const jar=k.bone(parent,-.278,.439,-.221);
  jar.rotation.z=-.49;jar.rotation.x=-.39;
  volume(k,jar,'crutchGourd',[[0,-.337,-.057,.105,.095],[.027,-.273,-.027,.201,.185],[.017,-.143,0,.251,.215],
    [0,-.028,.012,.162,.151],[.031,.049,.017,.093,.092],[.043,.132,.008,.156,.131],
    [.040,.245,-.009,.122,.107],[.037,.329,-.018,.058,.069]],mobile,57,2.06);
  volume(k,jar,'crutchGourdShade',[[.036,.311,-.019,.052,.053],[.053,.363,-.024,.052,.053],
    [.064,.404,-.027,.039,.041]],mobile,12,2.84);
  for(let n=0;n<(mobile?6:9);n++){
    const a=n*TAU/(mobile?6:9),x=Math.sin(a),z=Math.cos(a);
    line(k,jar,'crutchGourdShade',[[x*.099,-.313,z*.095,.004],[x*.212+.02,-.174,z*.197,.008],
      [x*.16,-.035,z*.138,.008],[x*.093+.023,.049,z*.091,.006],[x*.144+.024,.14,z*.121,.006],
      [x*.058+.026,.308,z*.061,.003]],mobile);
  }
  const binding=k.bone(jar,.027,.049,.016);
  binding.rotation.x=Math.PI*.5;
  hoop(k,binding,'crutchCopper',.108,.017,mobile);
  hoop(k,binding,'tigerLeather',.12,.012,mobile,.034);
  return jar;
}

function crutch(k,hand,mobile){
  const shaft=k.bone(hand,.023,-.037,.108);
  markEnemyWeapon(shaft,[-.019,1.39,-.026],{from:[0,.057,.026],width:.176});
  line(k,shaft,'crutchIron',[[.021,-.752,.037,.045],[-.011,-.37,.008,.052],[.006,.463,.024,.062],
    [-.012,.973,-.012,.069],[-.019,1.354,-.026,.059]],mobile);
  for(const s of sides)line(k,shaft,'crutchCopper',mirror(s,[[.013,1.116,.044,.031],[.129,1.184,.052,.036],
    [.219,1.301,.016,.033],[.262,1.394,-.087,.006]]),mobile);
  for(let n=0;n<5;n++){
    const band=k.bone(shaft,.01,-.23+n*.122,.027);
    band.rotation.x=Math.PI*.5;
    hoop(k,band,n%2?'tigerLeather':'crutchCopper',.065,.012,mobile);
  }
  return shaft;
}

export function forgeIronCrutch(k,entry,mobile){
  const body=k.bone(k.root,0,.873,0),rider=k.bone(body,.005,.497,-.163),head=k.bone(rider,-.025,.565,.062);
  pelt(k,body,[[0,.094,-.93,.226,.205],[0,.043,-.72,.382,.323],[0,.01,-.257,.41,.308],
    [0,.036,.242,.413,.318],[0,.087,.673,.343,.295],[0,.164,.814,.236,.215]],mobile);
  const neck=k.bone(body,0,.249,.614),tiger=k.bone(neck,0,.047,.151);
  pelt(k,tiger,[[0,.058,-.19,.223,.184],[0,.071,-.021,.266,.219],[0,.027,.201,.236,.194],
    [0,-.067,.345,.168,.111],[.003,-.078,.463,.131,.088]],mobile,'z',29);
  const jaw=k.bone(tiger,0,-.111,.127);
  volume(k,jaw,'tigerCharcoal',[[0,-.022,.014,.154,.07],[0,-.063,.089,.183,.092],[0,-.061,.213,.137,.067],
    [0,-.032,.312,.100,.043]],mobile,32,2.31);
  facet(k,tiger,'tigerCharcoal',0,-.065,.472,.089,.054,.039);
  const legs=[],arms=[],maneflares=[];
  for(const s of sides){
    const f=x=>x*s;
    const ear=k.bone(tiger,f(.156),.205,-.022);
    volume(k,ear,'tigerCharcoal',mirror(s,[[.004,-.026,.012,.065,.043],[.031,.043,.009,.106,.061],
      [.05,.115,-.018,.082,.048],[.045,.145,-.04,.037,.03]]),mobile,12);
    leatherPanel(k,ear,'tigerLeather','tigerCharcoal',mirror(s,[[.011,.014,.047],[.052,.027,.068],[.106,.055,.071],
      [.104,.104,.049],[.054,.120,.041],[.024,.091,.055]]),mobile,.025);
    facet(k,tiger,'glow',f(.157),.048,.305,.045,.022,.028);
    line(k,tiger,'tigerCharcoal',mirror(s,[[.068,.123,.278,.022],[.132,.125,.24,.035],
      [.202,.095,.206,.038],[.228,.051,.168,.004]]),mobile);
    volume(k,tiger,'tigerSmoke',mirror(s,[[.056,-.071,.322,.065,.048],[.083,-.1,.376,.088,.064],
      [.074,-.138,.424,.082,.045],[.046,-.156,.45,.052,.02]]),mobile,11);
    for(let i=0;i<3;i++)line(k,jaw,'tigerFang',mirror(s,[[.084+i*.027,-.029,.198-i*.047,.017],
      [.091+i*.026,.019,.232-i*.046,.022],[.108+i*.019,.077-i*.025,.24-i*.047,.003]]),mobile);
    for(let i=0;i<4;i++)line(k,tiger,'tigerFang',mirror(s,[[.108,-.121-i*.017,.391-i*.017,.005],
      [.211,-.127-i*.026,.418-i*.022,.008],[.318,-.09-i*.033,.38-i*.051,.007],[.393,-.083-i*.028,.263-i*.042,.002]]),mobile);
    const tuft=k.bone(neck,f(.179),.078,-.087);
    for(let i=0;i<6;i++){
      const y=.142-i*.065;
      volume(k,tuft,i%3?'tigerCharcoal':'tigerSmoke',mirror(s,[[.018,y,.088,.061,.039],
        [.089,y-.018,-.022,.092,.041],[.156,y-.083,-.116,.062,.036],
        [.188,y-.174,-.232,.006,.005]]),mobile,40+i);
    }
    maneflares.push({tuft,s});
    for(const front of [true,false]){
      const hip=k.bone(body,f(front?.281:.296),-.071,front?.478:-.655);
      const hock=k.bone(hip,f(.043),-.372,front?.115:-.121);
      const paw=k.bone(hock,f(.018),-.332,.09);
      pelt(k,hip,mirror(s,[[.002,.143,-.025,.147,.161],[.044,-.034,.008,.182,.159],
        [.058,-.203,front?.069:-.061,.132,.122],[.052,-.381,front?.122:-.13,.087,.086]]),mobile,'y',1);
      volume(k,hock,'tigerCharcoal',mirror(s,[[0,.037,.016,.093,.093],[.019,-.149,.038,.104,.098],
        [.023,-.332,.09,.092,.082]]),mobile,29);
      volume(k,paw,'tigerSmoke',[[0,-.071,.135,.082,.065],[s*.015,-.046,.069,.117,.097],
        [s*.025,.006,.026,.098,.082]],mobile,41,2.22);
      for(let claw=0;claw<3;claw++)line(k,paw,'tigerFang',[[s*(claw-1)*.068,-.051,.119,.016],
        [s*(claw-1)*.071,-.067,.166,.025],[s*(claw-1)*.075,-.079,.206,.004]],mobile);
      legs.push({hip,hock,paw,s,front});
    }
    const saddle=mirror(s,[[.048,.43,.118],[.214,.471,.015],[.393,.353,-.065],
      [.431,.111,-.187],[.293,.052,-.287],[.094,.143,-.342]]);
    leatherPanel(k,body,'tigerLeather','crutchCopper',saddle,mobile,.059);
    line(k,body,'tigerLeather',mirror(s,[[.096,.363,.49,.031],[.284,.29,.597,.043],
      [.395,.144,.592,.047],[.411,-.042,.435,.022]]),mobile);
    const saddleClip=k.bone(body,f(.374),.178,-.349);
    saddleClip.rotation.y=f(.87);
    hoop(k,saddleClip,'crutchCopper',.091,.017,mobile,.057);
    const thigh=k.bone(rider,f(.139),.017,.017);
    volume(k,thigh,'crutchLinen',mirror(s,[[0,.064,-.01,.094,.103],[.086,-.095,.034,.117,.103],
      [.139,-.25,.123,.092,.092],[.149,-.346,.143,.056,.058]]),mobile,31);
    volume(k,thigh,'tigerLeather',mirror(s,[[.147,-.284,.128,.064,.069],[.159,-.386,.141,.061,.062],
      [.161,-.411,.235,.066,.038]]),mobile,10);
  }
  const links=[];
  let tail=k.bone(body,0,.233,-.931);
  for(let i=0;i<7;i++){
    const s=.086-i*.009;
    line(k,tail,i%2?'tigerSmoke':'tigerCharcoal',[[0,.03,.038,s],[.045,.062,-.081,s*1.02],
      [.038,.091,-.205,s*.81]],mobile);
    links.push(tail);
    tail=k.bone(tail,.038,.09,-.19);
  }
  volume(k,rider,'crutchLinen',[[0,-.081,-.018,.137,.138],[0,.047,-.014,.207,.155],
    [-.019,.142,-.036,.229,.171],[-.021,.329,-.027,.242,.164],[-.032,.481,-.043,.181,.127]],mobile,37);
  const portrait=carvedFace(k,head,{style:'elder',finish:'crutchFace',brow:'crutchHair',eye:'glow',dark:'black',width:.344});
  volume(k,head,'crutchHair',[[0,-.063,-.121,.109,.079],[0,.029,-.112,.149,.105],[0,.142,-.091,.150,.126],
    [.015,.206,-.112,.125,.077],[.029,.228,-.145,.056,.045]],mobile,38);
  for(const s of sides){
    for(let i=0;i<3;i++){
      const x=.025+i*.029;
      line(k,head,'crutchHair',mirror(s,[[x,-.065,.158,.011],[x+.017,-.077,.165,.016],
        [x+.048,-.099,.146,.012],[x+.053,-.157,.11,.003]]),mobile);
      volume(k,portrait.jaw,'crutchHair',mirror(s,[[x*.56,.006,.092,.027,.021],[x*.81,-.046,.099,.039,.027],
        [x*.85,-.137,.088,.026,.027],[x*.47,-.244+ i*.027,.036,.005,.005]]),mobile,53+i);
    }
    const arm=k.bone(rider,s*.197,.367,.017),elbow=k.bone(arm,s*.105,-.235,.045),hand=k.bone(elbow,s*.033,-.196,.076);
    volume(k,arm,'crutchBlue',mirror(s,[[0,.075,-.024,.099,.088],[.041,-.056,-.006,.138,.109],
      [.076,-.198,.038,.110,.097],[.101,-.253,.049,.068,.059]]),mobile,43);
    volume(k,elbow,'crutchLinen',mirror(s,[[0,.039,.013,.061,.059],[.02,-.063,.031,.075,.072],
      [.028,-.178,.057,.061,.058],[.04,-.21,.074,.051,.049]]),mobile,16);
    volume(k,hand,'crutchFace',mirror(s,[[0,.03,.027,.04,.045],[.012,-.033,.066,.067,.062],
      [.017,-.084,.106,.053,.043]]),mobile,32);
    for(let i=0;i<4;i++)line(k,hand,'crutchFace',[[.029*(i-1.5),-.025,.066,.024],
      [.031*(i-1.5),-.069,.103,.024],[.033*(i-1.5),-.085,.115,.012]],mobile);
    arms.push({arm,elbow,hand,s});
    line(k,rider,'tigerLeather',mirror(s,[[.105,.444,.094,.022],[.138,.352,.166,.038],
      [.108,.174,.201,.036],[.04,.037,.168,.022]]),mobile);
  }
  const jar=gourd(k,rider,mobile),staff=crutch(k,arms[1].hand,mobile);
  const garments=sides.map(s=>({parent:rider,name:'鐵拐李 短棉披 '+s,
    path:mirror(s,[[.113,.346,-.138,.083],[.185,.192,-.205,.128],[.211,-.116,-.334,.108],[.249,-.459,-.526,.035]]),
    tint:0x77928c,trim:0xcdb38b,lining:0x4b5358,phase:s*.92,flex:1.12}));
  return {body,head,inspectHead:head,crest:neck,catalogueSculpt:entry.id,pattern:'gallop',
    commanderGarments:garments,arms:arms.map(a=>a.arm),
    cataloguePose({beat,step,wind,strike,travel,stage}){
      body.rotation.x=wind*.10-strike*.16;
      neck.rotation.x=-wind*.21+strike*.34+Math.sin(beat*.67)*.045;
      tiger.rotation.y=Math.sin(beat*.54)*.063+wind*.14-strike*.15;
      jaw.rotation.x=wind*.22+strike*.42;
      head.rotation.y=Math.sin(beat*.71)*.084-wind*.11+strike*.23;
      rider.rotation.x=.09-wind*.14+strike*.23+travel*.12;
      for(const {hip,hock,paw,s,front} of legs){
        const gait=Math.sin(step+s*Math.PI*.52+(front?2.49:0));
        hip.rotation.x=gait*(.06+travel*.65)-wind*.14+strike*(front?.33:-.24);
        hock.rotation.x=Math.max(0,gait)*travel*.42+wind*.13-strike*.21;
        paw.rotation.x=-hock.rotation.x*.69;
      }
      for(const {tuft,s} of maneflares)tuft.rotation.z=s*(.06+travel*.14+wind*.091-strike*.19);
      for(const [i,link] of links.entries()){
        link.rotation.y=Math.sin(beat*.91-i*.44)*(.10+travel*.11)+wind*.05+stage*.08;
        link.rotation.x=i*.039+Math.cos(beat*.53-i*.21)*.081+strike*.074;
      }
      for(const {arm,elbow,s} of arms){
        arm.rotation.x=-.064-wind*(s>0?.70:.25)+strike*(s>0?.89:.35);
        arm.rotation.z=s*(.17+wind*.24-strike*.15);
        elbow.rotation.x=-.43+wind*.36-strike*.16;
      }
      staff.rotation.z=-.28-wind*.51+strike*1.01;
      jar.rotation.x=-.39+Math.sin(beat*.67)*.045+travel*.09+strike*.19;
      portrait.jaw.rotation.x=wind*.08+strike*.13;
    }};
}
