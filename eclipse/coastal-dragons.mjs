import * as T from '../three.min.mjs';
import {featherVane,sculptVolume,wingWeb} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const sides=[-1,1];
const mirror=(s,p)=>p.map(([x,...rest])=>[s*x,...rest]);
const mass=(k,j,m,p,mobile,seed=0,section=2.28)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?13:20,sides:mobile?10:15,ridge:.15,section,seed,
}));
const line=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:16,sides:mobile?6:8,ridge:.19});
const plate=(k,j,m,p,d)=>k.sculpt.plate(j,m,p,d,d*.36);
const stone=(k,j,m,x,y,z,r)=>k.mesh(j,'gem',m,x,y,z,r,r*.82,r*.79);

export const coastalFinishes={
  m127:{coastHide:[0x753c2f,.11,.79,'hide'],coastShell:[0x442e2b,.46,.55,'iron'],coastRim:[0x674844,.46,.63,'iron'],
    coastBone:[0xba9471,.19,.62,'bone'],coastWeb:[0x672820,.045,.86,'hide'],coastRoot:[0x392e2c,.17,.76,'hide'],
    coastVein:[0x854a31,.17,.71,'hide'],coastBlade:[0x848487,.82,.39,'iron'],coastTrim:[0x9f7850,.59,.51,'bronze']},
  m128:{coastHide:[0x222e2d,.14,.81,'hide'],coastShell:[0x302a27,.41,.59,'iron'],coastRim:[0x534334,.51,.53,'bronze'],
    coastBone:[0xad8d5d,.15,.67,'bone'],coastWeb:[0x8d551e,.08,.79,'hide'],coastRoot:[0x242526,.16,.76,'hide'],
    coastVein:[0x9e612b,.19,.66,'bronze'],coastBlade:[0x35404a,.32,.65,'iron'],coastTrim:[0x7d4c24,.55,.52,'bronze']},
  m131:{coastHide:[0x2b679b,.16,.74,'hide'],coastShell:[0x295878,.48,.54,'iron'],coastRim:[0x3c81a6,.34,.50,'iron'],
    coastBone:[0xb4c3bd,.15,.59,'bone'],coastWeb:[0x8da9ad,.054,.69,'hide'],coastRoot:[0x214663,.43,.66,'iron'],
    coastVein:[0x446fa2,.26,.55,'iron'],coastBlade:[0x595c64,.40,.49,'iron'],coastTrim:[0x5f8eab,.44,.52,'iron']},
};

const wingShapes={
  m127:{origin:[.267,1.35,-.18],
    tines:[[[.53,.60,-.085],[.92,.98,-.17],[1.63,1.05,-.20],[1.93,.96,-.290]],
      [[.54,.58,-.10],[1.04,.38,-.48],[1.63,.05,-.705],[1.80,-.270,-.82]],
      [[.53,.57,-.11],[.94,.15,-.625],[1.15,-.23,-.86],[1.17,-.50,-.92]],
      [[.52,.55,-.12],[.76,-.03,-.49],[.69,-.33,-.64],[.65,-.55,-.59]],
      [[.51,.52,-.132],[.49,-.07,-.42],[.38,-.37,-.52],[.13,-.48,-.29]]]},
  m128:{origin:[.322,.87,-.02],
    tines:[[[.56,.38,-.048],[1.26,.67,-.13],[2.02,.63,-.284],[2.26,.52,-.47]],
      [[.55,.37,-.063],[1.07,.41,-.43],[1.81,.06,-.84],[2.07,-.23,-1.05]],
      [[.54,.36,-.069],[.98,.28,-.52],[1.48,-.125,-1.12],[1.64,-.388,-1.37]],
      [[.53,.35,-.081],[.84,.05,-.59],[1.09,-.24,-1.19],[1.05,-.44,-1.49]],
      [[.51,.34,-.09],[.66,-.03,-.55],[.66,-.27,-1.02],[.45,-.44,-1.28]],
      [[.49,.32,-.092],[.44,-.025,-.38],[.26,-.222,-.68],[.075,-.267,-.91]]]},
  m131:{origin:[.279,.87,.213],
    tines:[[[.47,.12,-.029],[.91,.35,-.14],[1.56,.51,-.25],[2.05,.67,-.48]],
      [[.46,.115,-.037],[.89,.172,-.37],[1.42,.117,-.59],[1.87,.175,-.77]],
      [[.45,.108,-.043],[.799,.076,-.42],[1.31,-.035,-.698],[1.60,-.136,-.901]],
      [[.44,.101,-.051],[.722,-.026,-.43],[.98,-.131,-.742],[1.14,-.274,-1.12]],
      [[.43,.096,-.059],[.62,-.077,-.40],[.69,-.19,-.65],[.66,-.39,-.97]],
      [[.42,.091,-.063],[.48,-.071,-.27],[.43,-.17,-.47],[.28,-.22,-.54]]]},
};

function wing(k,body,s,id,mobile){
  const p=wingShapes[id],aquatic=id==='m131',upright=id==='m127';
  const [x,y,z]=p.origin;
  const shoulder=k.bone(body,s*x,y,z),fan=k.bone(shoulder,0,0,0);
  const first=p.tines[0];
  mass(k,shoulder,'coastRoot',mirror(s,[[.003,-.020,.035,.127,.114],[.192,.175,-.013,.151,.14],
    [.366,first[0][1]*.64,-.033,.110,.094],[...first[0],.075,.084]]),mobile,71);
  line(k,shoulder,'coastShell',mirror(s,[[.021,.027,.067,.079],[.236,.203,-.020,.092],
    [.382,first[0][1]*.67,-.037,.065],[...first[0],.034]]),mobile);
  k.geometry(fan,'coastWeb',wingWeb(p.tines,s,aquatic?10:upright?25:37));
  for(const [i,tine] of p.tines.entries()){
    const r=i===0?.072:aquatic?.034:.044;
    line(k,fan,i%2?'coastRoot':'coastRim',mirror(s,tine.map(([x,y,z],j)=>[x,y,z,r*[1,.83,.61,.08][j]])),mobile);
    line(k,fan,'coastVein',mirror(s,tine.map(([x,y,z],j)=>[x+.012,y+.021,z+.025,r*[.39,.42,.58,.05][j]])),mobile);
    if(i>0)for(let n=0;n<(mobile?1:2);n++){
      const at=tine[1],along=tine[2],next=p.tines[i-1][2],a=.26+n*.21;
      const end=along.map((v,j)=>v+(next[j]-v)*a);
      line(k,fan,'coastVein',mirror(s,[[...at,.007],[...along.map((v,j)=>v*.54+at[j]*.46),.013],[...end,.003]]),mobile);
    }
  }
  for(let i=0;i<(mobile?4:7);i++){
    const t=i/(mobile?4:7),p0=first[0],p1=first[1];
    const find=(i,e)=>p0[i]+(p1[i]-p0[i])*t+e;
    const x=find(0,.017),y=find(1,.016),z=find(2,.039);
    mass(k,fan,aquatic?'coastRim':'coastShell',mirror(s,[[x-.08,y+.014,z,.063,.037],[x,y+.048,z,.078,.045],
      [x+.11,y+.031,z-.055,.057,.040],[x+.164,y-.018,z-.081,.004,.005]]),mobile,82+i);
  }
  const claw=first[0];
  line(k,fan,aquatic?'coastRim':'coastBone',mirror(s,[[...claw,.047],[claw[0]+.049,claw[1]+.10,claw[2]-.017,.044],
    [claw[0]+.093,claw[1]+.174,claw[2]+.018,.030],[claw[0]+.16,claw[1]+.215,claw[2]+.053,.004]]),mobile);
  return {shoulder,fan,s};
}

function jawRig(k,head,id,mobile){
  const warrior=id==='m127',aquatic=id==='m131';
  const jaw=k.bone(head,0,-.079,.101);
  const w=warrior?.196:aquatic?.219:.272, long=warrior?.300:aquatic?.457:.563;
  const muzzle=[[0,-.044,-.258,w*.68,.129],[0,.079,-.13,w,.166],[0,.113,-.03,w,.199],
    [0,.046,.107,w*.93,.189],[0,-.021,long*.60,w*.62,.111],[0,-.033,long*.94,w*.56,.083],[0,-.065,long,w*.35,.053]];
  mass(k,head,'coastHide',muzzle,mobile,96,warrior?2.31:2.79);
  mass(k,jaw,'coastRoot',[[0,-.061,-.106,w*.52,.061],[0,-.075,.015,w*.86,.09],
    [0,-.054,long*.47,w*.70,.065],[0,-.029,long*.82,w*.56,.053],[0,-.013,long*.91,w*.34,.038]],mobile,51);
  mass(k,jaw,'coastHide',[[0,-.103,-.087,w*.46,.045],[0,-.106,.029,w*.77,.072],
    [0,-.073,long*.57,w*.65,.061],[0,-.049,long*.855,w*.44,.032]],mobile,14);
  const whiskers=[];
  for(const s of sides){
    const x=w*(warrior?.78:.90),z=warrior?.133:aquatic?.199:.249;
    const eye=k.bone(head,s*x,.103,z);
    mass(k,eye,'coastRoot',mirror(s,[[.005,-.062,.024,.033,.030],[.018,-.015,.023,.069,.047],
      [.017,.027,.009,.056,.035],[.018,.053,-.017,.021,.022]]),mobile,5);
    stone(k,eye,'glow',s*.046,.001,.061,warrior?.024:.032);
    k.mesh(eye,'gem','coastRoot',s*.045,0,.083,.005,.012,.005);
    line(k,head,'coastShell',mirror(s,[[w*.21,.158,.217,.036],[w*.51,.180,.169,.056],
      [w*.90,.177,.115,.061],[w*1.17,.125,.041,.048],[w*1.23,.071,-.064,.007]]),mobile);
    const cheek=mirror(s,[[w*.70,.121,.119],[w*1.13,.158,.057],[w*1.38,.085,-.153],[w*1.25,-.079,-.207],
      [w*.91,-.137,-.150],[w*.77,-.10,.045],[w*.65,-.03,.208]]);
    plate(k,head,aquatic?'coastRim':'coastShell',cheek,.042);
    line(k,head,'coastRim',mirror(s,[[w*.69,.117,.172,.013],[w*1.19,.099,.048,.021],
      [w*1.25,.027,-.107,.022],[w*1.13,-.079,-.163,.006]]),mobile);
    const nostril=k.bone(head,s*w*.39,-.01,long*.93);
    stone(k,nostril,'coastRoot',s*.008,.009,.020,.024);
    line(k,nostril,'coastShell',mirror(s,[[0,.032,.01,.009],[.029,.034,.012,.022],[.052,.004,-.016,.009]]),mobile);
    const teal=aquatic?1:.777;
    line(k,head,'coastBone',mirror(s,[[w*.90,.144,-.087,.051],[w*1.21,.276,-.205,.064],
      [w*(aquatic?1.47:1.28),.375*teal,-.34,.047],[w*(aquatic?1.73:1.49),.447*teal,-.542,.006]]),mobile);
    if(!warrior){
      const delta=aquatic?.04:.08;
      const profile=mirror(s,[[w*.18,.128,long*.91],[w*.41,.172,long*.74],[w*.74,.209,long*.47],
        [w*1.01,.178+delta,long*.27],[w*1.13,.158-delta,long*.49],[w*.80,.106,long*.65],
        [w*.63,.074,long*.83],[w*.25,.049,long*.99]]);
      plate(k,head,aquatic?'coastRim':'coastBlade',profile,.037);
      line(k,head,aquatic?'coastBone':'coastRim',profile.slice(0,5).map(([x,y,z],i)=>[x,y+.021,z+.011,i%2?.018:.009]),mobile);
      const horn=mirror(s,[[w*.55,.190,.018,.044],[w*.71,.292,.002,.057],
        [w*.92,.409+delta,-.151,.046],[w*1.16,.535+delta,-.305,.025],[w*1.29,.569+delta,-.421,.003]]);
      line(k,head,'coastBone',horn,mobile);
      line(k,head,aquatic?'coastRim':'coastTrim',horn.map(([x,y,z,r])=>[x+s*.027,y-.009,z+.027,r*.38]),mobile);
    }
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?4:6), z=long*(.81-t*.74),x=w*(.51+t*.36),size=.027-t*.012;
      line(k,head,'coastBone',mirror(s,[[x,-.081,z,size],[x+.013,-.122-t*.016,z+.014,size*.75],
        [x+.021,-.166-t*.035,z+.023,.003]]),mobile);
      if(i>0)line(k,jaw,'coastBone',mirror(s,[[x*.92,-.026,z-.089,size*.87],[x*1.02,.014,z-.066,size*.69],
        [x*1.04,.051,z-.051,.003]]),mobile);
    }
    if(aquatic){
      const fore=k.bone(head,s*w*.49,-.05,long*.79),rear=k.bone(head,s*w*.91,-.037,-.135);
      line(k,fore,'coastBone',mirror(s,[[.003,.008,0,.019],[.181,-.039,.098,.023],[.329,-.147,.22,.017],
        [.522,-.263,.212,.011],[.644,-.398,.029,.003]]),mobile);
      for(let i=0;i<4;i++){
        const d=i*.064,z=-i*.12;
        const [a,b,c]=mirror(s,[[.061,.07-d,z],[.18,.164-d,z-.16],[.38,.278-d*.6,z-.30]]);
        k.geometry(rear,i%2?'coastWeb':'coastRim',featherVane(a,b,c,.065,i*.89,mobile?7:12));
      }
      whiskers.push({fore,rear,s});
    }
  }
  for(let i=0;i<4;i++)mass(k,head,i%2?'coastShell':'coastRim',[[0,.163+i*.025,-.021-i*.076,.076,.046],
    [0,.207+i*.028,-.079-i*.087,.086,.048],[.017,.224+i*.033,-.143-i*.096,.052,.027],
    [.012,.231+i*.034,-.198-i*.108,.005,.006]],mobile,12+i);
  return {jaw,whiskers};
}

const profiles={
  m127:{center:.39,head:[0,1.74,.416],hip:[.179,.568,-.11],
    body:[[0,.449,-.21,.165,.158],[0,.656,-.167,.224,.211],[0,.924,-.096,.263,.233],[0,1.21,-.02,.271,.224],
      [0,1.43,.11,.244,.183],[0,1.64,.204,.173,.161],[0,1.77,.336,.13,.135]],
    tail:[[0,.603,-.18,.165,.151],[.033,.455,-.485,.15,.13],[.117,.359,-.855,.121,.102],
      [.22,.366,-1.271,.086,.071],[.282,.44,-1.657,.045,.038],[.42,.582,-1.91,.009,.01]]},
  m128:{center:.45,head:[0,1.028,.825],hip:[.239,.549,-.506],front:[.269,.783,.245],
    body:[[0,.39,-.82,.192,.174],[0,.524,-.54,.329,.269],[0,.673,-.275,.445,.309],[0,.763,.081,.418,.304],
      [0,.809,.409,.291,.257],[0,.893,.613,.222,.223],[0,1.031,.771,.178,.171]],
    tail:[[0,.502,-.76,.240,.186],[.085,.536,-1.063,.216,.167],[.222,.616,-1.472,.171,.127],
      [.261,.718,-1.977,.107,.093],[.19,.835,-2.452,.049,.043],[.108,.922,-2.742,.014,.014]]},
  m131:{center:.42,head:[0,1.031,.721],hip:[.204,.555,-.433],front:[.232,.806,.238],
    body:[[0,.435,-.84,.179,.174],[0,.509,-.534,.298,.196],[0,.619,-.219,.371,.279],[0,.743,.147,.349,.293],
      [0,.882,.44,.28,.231],[0,.936,.584,.213,.188],[0,1.009,.685,.142,.127]],
    tail:[[0,.478,-.754,.190,.179],[-.013,.513,-1.037,.181,.147],[-.055,.588,-1.438,.123,.117],
      [-.119,.650,-1.826,.087,.082],[-.179,.699,-2.113,.060,.061],[-.179,.716,-2.251,.031,.035]]},
};

function dragonShell(k,body,p,id,mobile){
  const warrior=id==='m127',fish=id==='m131';
  mass(k,body,'coastHide',p.body,mobile,91,warrior?2.52:2.34);
  if(warrior){
    for(let i=0;i<7;i++){
      const y=.787+i*.108,w=.123-(Math.abs(i-3))*.009,z=.182+i*.064;
      const belly=[[-w,y+.042,z-.006],[-w*.53,y+.089,z+.025],[0,y+.096,z+.036],
        [w*.77,y+.048,z+.008],[w*.87,y-.030,z+.005],[0,y-.068,z+.058],[-w*.89,y-.047,z+.018]];
      plate(k,body,i%2?'coastRim':'coastBone',belly,.026);
      line(k,body,'coastBone',belly.slice(3).map(([x,y,z],j)=>[x,y,z+.019,j===1?.012:.006]),mobile);
    }
    for(const s of sides){
      const cap=mirror(s,[[.034,1.515,.331],[.148,1.56,.247],[.261,1.497,.136],[.291,1.371,-.031],
        [.262,1.259,.078],[.169,1.215,.244],[.064,1.273,.299]]);
      plate(k,body,'coastShell',cap,.056);
      line(k,body,'coastRim',cap.slice(0,6).map(([x,y,z],i)=>[x,y,z+.034,i%2?.012:.019]),mobile);
      for(let i=0;i<4;i++){
        const y=1.272-i*.135,z=-.286-i*.008;
        mass(k,body,i%2?'coastRim':'coastShell',mirror(s,[[.049,y+.128,z,.058,.048],
          [.139,y+.107,z-.026,.085,.049],[.228,y-.006,z-.042,.066,.046],[.218,y-.095,z-.103,.006,.008]]),mobile,42+i);
      }
    }
  }else{
    for(const s of sides)for(let i=0;i<(mobile?5:7);i++){
      const t=i/(mobile?5:7),z=.432-t*1.114,y=.718-.205*t;
      mass(k,body,i%3?'coastShell':fish?'coastRim':'coastBlade',mirror(s,[[.174,y+.104,z+.07,.056,.044],
        [.302,y+.129,z+.013,.083,.045],[.377,y+.034,z-.094,.058,.044],[.363,y-.099,z-.135,.010,.01]]),mobile,32+i);
      if(fish){
        const track=mirror(s,[[.189,y+.053,z+.048,.012],[.308,y+.07,z-.011,.025],[.386,y+.015,z-.105,.008]]);
        line(k,body,'coastRim',track,mobile);
      }
    }
    for(let i=0;i<(mobile?5:8);i++){
      const t=i/(mobile?5:8),z=.496-t*1.143,y=.925-.213*t;
      mass(k,body,i%2?'coastRim':'coastShell',[[0,y-.078,z+.09,.104,.08],[.011,y+.073,z,.109,.061],
        [.013,y+(fish?.232:.187),z-.106,.061,.038],[.033,y+(fish?.35:.265),z-.229,.004,.005]],mobile,i+82);
    }
  }
}

function buildTail(k,body,profile,id,mobile){
  const chain=[];
  for(let i=0;i<profile.length-1;i++){
    const a=profile[i],b=profile[i+1],prev=profile[i-1];
    const joint=prev?k.bone(chain.at(-1),a[0]-prev[0],a[1]-prev[1],a[2]-prev[2]):k.bone(body,a[0],a[1],a[2]);
    const tip=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];
    mass(k,joint,'coastHide',[[0,.002,.018,a[3],a[4]],[tip[0]*.39,tip[1]*.37,tip[2]*.39,(a[3]+b[3])*.50,(a[4]+b[4])*.54],
      [tip[0],tip[1],tip[2],b[3]*1.03,b[4]*1.04]],mobile,12+i);
    for(let n=0;n<(mobile?1:2);n++){
      const x=tip[0]*(.25+n*.34),y=tip[1]*(.25+n*.34),z=tip[2]*(.25+n*.34);
      line(k,joint,id==='m131'?'coastRim':'coastShell',[[x,y+a[4]*.73,z+.05,a[3]*.35],
        [x,y+a[4]*1.22,z-.067,a[3]*.41],[x+.02,y+a[4]*1.63,z-.145,.004]],mobile);
    }
    chain.push(joint);
    if(i!==profile.length-2)continue;
    if(id==='m131'){
      for(const s of sides){
        const start=[tip[0],tip[1],tip[2]],span=s===1?.42:.32;
        const arch=[tip[0]+s*.09,tip[1]+s*span*.77,tip[2]-.218],end=[tip[0]+s*.18,tip[1]+s*span,tip[2]-.615];
        k.geometry(joint,'coastWeb',featherVane(start,arch,end,.145,41*s,mobile?10:16));
        line(k,joint,'coastRim',[[...start,.039],[...arch,.028],[...end,.004]],mobile);
      }
    }else if(id==='m128'){
      const barb=[tip[0],tip[1]+.062,tip[2]-.052];
      mass(k,joint,'coastRim',[[0,.052,.048,.039,.04],[tip[0]*.58,tip[1]*.52,tip[2]*.61,.075,.043],
        [...barb,.060,.039],[tip[0]+.025,tip[1]+.143,tip[2]-.226,.004,.004]],mobile,34);
    }
  }
  return chain;
}

function feet(k,body,s,position,id,mobile,fore=false){
  const warrior=id==='m127',fish=id==='m131';
  const hip=k.bone(body,s*position[0],position[1],position[2]);
  const knee=k.bone(hip,s*(warrior?.121:.163),warrior?-.21:-.193,fore?.114:-.103);
  const hock=k.bone(knee,s*.033,warrior?-.22:-.18,fore?.073:.13);
  mass(k,hip,'coastHide',mirror(s,[[.003,.091,.018,.108,.109],[.053,.019,-.02,.166,.145],
    [.104,-.095,-.052,.151,.139],[.143,-.196,fore?.092:-.109,.099,.101]]),mobile,43);
  mass(k,knee,'coastRoot',mirror(s,[[0,.071,-.024,.084,.089],[.033,-.073,.022,.105,.102],
    [.041,-.166,.045,.086,.088],[.034,-.23,.122,.070,.066]]),mobile,61);
  mass(k,hock,'coastHide',mirror(s,[[.015,-.045,.20,.071,.054],[.036,-.01,.104,.113,.066],
    [.038,.061,.036,.096,.066],[.026,.098,-.043,.061,.067]]),mobile,57);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.051,depth=.153+(.055-Math.abs(i-1.5)*.026);
    line(k,hock,'coastRoot',[[x,-.032,depth-.054,.034],[x+s*.023,-.032,depth+.034,.036],
      [x+s*.035,-.078,depth+.100,.020]],mobile);
    line(k,hock,'coastBone',[[x+s*.026,-.035,depth+.028,.026],[x+s*.040,-.056,depth+.107,.020],
      [x+s*.048,-.104,depth+.144,.003]],mobile);
  }
  if(warrior)plate(k,knee,'coastShell',mirror(s,[[.013,.072,.106],[.106,.063,.076],[.149,-.05,.05],
    [.099,-.15,.111],[.038,-.198,.134],[-.041,-.072,.127]]),.038);
  if(fish)for(let i=0;i<3;i++){
    const y=-i*.056;
    const [a,b,c]=mirror(s,[[.062,y,-.064],[.149,y+.055,-.153],[.249,y+.109,-.284]]);
    k.geometry(knee,'coastWeb',featherVane(a,b,c,.050,i+.6*s,mobile?7:12));
  }
  return {hip,knee,hock,s,fore};
}

function sword(k,hand,s,mobile){
  const blade=k.bone(hand,0,-.006,.043);
  blade.name=s>0?'海岸寺院・長劍':'海岸寺院・短劍';
  const l=s>0?1.28:1.02;
  markEnemyWeapon(blade,[.026,l+.16,.041],{from:[0,-.095,.046],width:.13});
  line(k,blade,'coastRoot',[[0,-.252,.046,.035],[0,-.135,.051,.042],[.004,.063,.05,.043],[.009,.2,.045,.033]],mobile);
  const edge=[[-.080,.19,.049],[-.113,l*.52,.042],[-.089,l*.88,.037],[-.044,l+.087,.039],
    [.026,l+.16,.041],[.076,l*.876,.041],[.097,l*.47,.041],[.058,.21,.043]];
  plate(k,blade,'coastBlade',edge,.044);
  for(const face of sides){
    const z=.047+face*.032;
    line(k,blade,'coastShell',[[.019,.22,z,.013],[.013,l*.45,z,.018],[.004,l*.88,z,.012],[.026,l+.13,z,.002]],mobile);
    line(k,blade,'coastRim',[[-.021,.239,z,.009],[-.065,l*.61,z,.012],[-.054,l*.93,z,.007],[.026,l+.138,z,.002]],mobile);
  }
  line(k,blade,'coastTrim',[[-.181,.232,.064,.017],[-.105,.138,.060,.047],[-.031,.121,.066,.040],
    [.061,.141,.059,.043],[.151,.217,.051,.027],[.178,.25,.057,.003]],mobile);
  stone(k,blade,'coastTrim',0,-.237,.061,.048);
  return blade;
}

function duelingArm(k,body,s,mobile){
  const shoulder=k.bone(body,s*.239,1.342,.147),elbow=k.bone(shoulder,s*.12,-.251,.04);
  const hand=k.bone(elbow,s*.035,-.285,.06);
  mass(k,shoulder,'coastHide',mirror(s,[[0,.083,.017,.091,.083],[.053,-.018,.022,.138,.127],
    [.114,-.114,.022,.135,.111],[.135,-.251,.035,.087,.082]]),mobile,35);
  mass(k,elbow,'coastRoot',mirror(s,[[0,.055,-.03,.091,.088],[.057,-.067,.022,.107,.10],
    [.073,-.21,.073,.086,.082],[.034,-.284,.063,.059,.059]]),mobile,18);
  plate(k,shoulder,'coastShell',mirror(s,[[0,.076,.132],[.108,.141,.112],[.234,.133,.034],[.267,.044,-.035],
    [.210,-.103,-.053],[.107,-.153,.089],[.014,-.075,.158]]),.046);
  line(k,elbow,'coastRim',mirror(s,[[.018,.054,.062,.039],[.134,-.012,.081,.051],[.157,-.133,.088,.037],
    [.112,-.238,.079,.007]]),mobile);
  mass(k,hand,'coastHide',[[0,.073,-.008,.043,.053],[0,.013,.034,.090,.076],[s*.023,-.031,.069,.080,.052],
    [s*.05,-.093,.065,.038,.035]],mobile,36);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.036;
    line(k,hand,'coastHide',[[x,.014,.027,.017],[x,-.017,.090,.024],[x+s*.012,-.061,.113,.020],
      [x+s*.026,-.093,.081,.007]],mobile);
  }
  return {shoulder,elbow,hand,blade:sword(k,hand,s,mobile),s};
}

export function sculptCoastalDragon(k,entry,mobile){
  const {id}=entry,p=profiles[id];
  if(!p)return null;
  const warrior=id==='m127',fish=id==='m131';
  k.materials.coastWeb.side=T.DoubleSide;
  const body=k.bone(k.root,0,p.center,0),head=k.bone(body,...p.head);
  dragonShell(k,body,p,id,mobile);
  const {jaw,whiskers}=jawRig(k,head,id,mobile);
  const tail=buildTail(k,body,p.tail,id,mobile);
  const wings=sides.map(s=>wing(k,body,s,id,mobile));
  const legs=sides.flatMap(s=>[feet(k,body,s,p.hip,id,mobile),...(p.front?[feet(k,body,s,p.front,id,mobile,true)]:[])]);
  const arms=warrior?sides.map(s=>duelingArm(k,body,s,mobile)):[];
  return {body,head,tail:tail[0],arms:arms.map(a=>a.shoulder),crest:k.bone(body,0,0,0),pattern:'wing',
    coastalDragon:true,catalogueSculpt:id,polishEnergy:{tint:fish?0x9beaff:warrior?0xee8163:0xf39a4c,
      shape:fish?'mist':warrior?'ribbons':'embers',anchor:body,offset:[0,warrior?1.18:.74,-.21],
      span:warrior?[.58,.67,.63]:[.80,.62,.91],weaponWidth:.53,emissionScale:.52},
    cataloguePose({beat,headtime,wind,strike,travel,fall,stage,step}){
      const beatScale=warrior?.54:fish?.65:.47;
      body.rotation.x=-wind*(warrior?.18:.25)+strike*(warrior?.21:.38)+Math.sin(headtime*2.45)*.046+fall*.41;
      head.rotation.y=Math.sin(headtime*2.29)*.082+strike*.18;
      head.rotation.x=-wind*.21+strike*.26;
      jaw.rotation.x=.044+wind*.14+strike*(warrior?.53:.71)+stage*.08;
      for(const {shoulder,fan,s} of wings){
        const pulse=Math.sin(beat*beatScale-.35+s*.06);
        shoulder.rotation.z=s*(pulse*(warrior?.274:fish?.30:.39)+wind*.23-strike*.31-fall*.19);
        shoulder.rotation.y=s*(Math.sin(beat*.42-.52)*.092+wind*.14-strike*.26);
        fan.rotation.z=s*(Math.sin(beat*beatScale-.92)*.101-wind*.033+strike*.066);
        fan.rotation.x=travel*.14-strike*.09+fall*.39;
      }
      for(const {hip,knee,hock,s,fore} of legs){
        const gait=Math.sin(step*.58+s*1.57+(fore?1.57:0))*travel;
        hip.rotation.x=gait*.30-wind*.19+strike*.38;
        hip.rotation.z=s*(wind*.13-strike*.16);
        knee.rotation.x=-gait*.21+wind*.13-strike*.29+fall*.24;
        hock.rotation.x=Math.cos(headtime*3.6+s)*.061+strike*.20;
      }
      for(const {shoulder,elbow,hand,blade,s} of arms){
        shoulder.rotation.set(-.21-wind*(s===1?1.03:.78)+strike*(s===1?.89:.51),s*(wind*.20-strike*.113),
          s*(.25+wind*.23-strike*.12));
        elbow.rotation.x=-.42-wind*.27+strike*.45;
        hand.rotation.z=s*(.07+wind*.22-strike*.39);
        blade.rotation.z=s*(-.40+wind*.21+strike*.12);
      }
      for(const {fore,rear,s} of whiskers){
        fore.rotation.y=s*(Math.sin(headtime*3.8-s)*.11+strike*.36);
        fore.rotation.x=-wind*.16+strike*.29;
        rear.rotation.z=s*(Math.cos(headtime*3.7)*.09+wind*.21-strike*.20);
      }
      for(const [i,joint] of tail.entries()){
        joint.rotation.y=Math.sin(beat*.35-i*.68)*(.101+.072*travel)-strike*.089;
        joint.rotation.x=Math.cos(beat*.37-i*.74)*(fish?.086:.069)+wind*.058-strike*.082;
      }
    },
  };
}
