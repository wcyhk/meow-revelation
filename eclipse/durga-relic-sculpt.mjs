import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],TAU=Math.PI*2;
const mirror=(s,p)=>p.map(([x,...v])=>[s*x,...v]);
const tendon=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:17,sides:mobile?6:8,ridge:.18});
const solid=(k,j,m,p,mobile,seed=1,section=2.4)=>k.geometry(j,m,sculptVolume(p,{rings:mobile?12:19,sides:mobile?9:14,section,ridge:.16,seed}));
const gem=(k,j,m,x,y,z,w,h=w,d=w)=>k.mesh(j,'gem',m,x,y,z,w,h,d);

export const durgaFinishes={durgaBronze:[0xb28553,.62,.48,'bronze'],durgaSilver:[0xa9aa9e,.58,.51,'iron'],
  durgaWhite:[0xc6c0ac,.15,.62,'bone'],durgaWrap:[0xa5814d,.08,.79,'cloth'],
  durgaLining:[0x454248,.11,.78,'cloth'],durgaIron:[0x51575c,.58,.51,'iron'],durgaCape:[0x9e5c43,.07,.81,'cloth']};

function chased(k,j,finish,border,points,mobile,depth=.045){
  k.sculpt.plate(j,finish,points,depth,depth*.28);
  tendon(k,j,border,points.slice(0,-1).map(([x,y,z],i)=>[x,y+.008,z+depth*.52,i===0?.003:.012]),mobile);
}

function ring(k,j,m,r,t,mobile,z=0){
  const g=new T.TorusGeometry(r,t,mobile?6:9,mobile?31:45);
  g.translate(0,0,z);k.geometry(j,m,g);
}

function helm(k,head,mobile){
  const helmet=k.bone(head,0,.034,-.010);
  solid(k,helmet,'durgaSilver',[[0,-.207,.002,.131,.11],[0,-.136,.008,.155,.132],
    [.009,.055,-.015,.166,.143],[.004,.264,-.063,.146,.125],[.005,.375,-.099,.094,.083],
    [.005,.399,-.101,.068,.056]],mobile,12,2.13);
  for(const s of sides){
    const visor=mirror(s,[[.011,.189,.131],[.093,.146,.124],[.171,.054,.076],
      [.168,-.075,.066],[.092,-.129,.127],[.027,-.101,.155]]);
    chased(k,helmet,'durgaSilver','durgaIron',visor,mobile,.034);
    tendon(k,helmet,'durgaLining',mirror(s,[[.022,-.024,.175,.007],[.073,-.035,.171,.014],
      [.128,-.013,.133,.013],[.151,.018,.1,.004]]),mobile);
    gem(k,helmet,'glow',s*.069,-.026,.181,.021,.009,.01);
    for(let i=0;i<3;i++)tendon(k,helmet,i===1?'durgaBronze':'durgaWhite',mirror(s,[[.026+i*.031,.252,.108-i*.011,.006],
      [.061+i*.035,.306,.074-i*.01,.011],[.074+i*.029,.357,.002-i*.019,.009],[.061+i*.011,.386,-.06,.002]]),mobile);
    const nape=mirror(s,[[.034,.157,-.132],[.144,.207,-.141],[.164,.073,-.167],[.135,-.111,-.152],
      [.079,-.202,-.136],[.018,-.122,-.147]]);
    chased(k,helmet,'durgaIron','durgaBronze',nape,mobile,.038);
  }
  const circlet=k.bone(helmet,0,-.142,.009);
  circlet.rotation.x=Math.PI*.5;
  ring(k,circlet,'durgaBronze',.156,.016,mobile);
  const jaw=k.bone(head,0,-.141,.08);
  chased(k,jaw,'durgaWhite','durgaSilver',[[-.068,.017,.068],[.064,.023,.071],
    [.061,-.082,.083],[.006,-.102,.087],[-.063,-.079,.083]],mobile,.029);
  return jaw;
}

function makeArm(k,body,s,row,mobile){
  const x=.264+row*.032,y=.536+row*.066,z=.109-row*.115;
  const shoulder=k.bone(body,s*x,y,z),elbow=k.bone(shoulder,s*.096,-.259,.057),hand=k.bone(elbow,s*.024,-.213,.074);
  shoulder.name='灰燼庭・破帆夜舟 · 第'+(row+1)+'對臂';
  formArm(k,shoulder,elbow,hand,s,row,mobile);
  return {shoulder,elbow,hand,s,row};
}

function formArm(k,shoulder,elbow,hand,s,row,mobile){
  solid(k,shoulder,row?'durgaSilver':'durgaWhite',mirror(s,[[.006,.079,-.011,.066,.063],
    [.045,-.016,.017,.087,.079],[.078,-.197,.046,.061,.064],[.096,-.263,.061,.050,.048]]),mobile,32+row);
  solid(k,elbow,'durgaWhite',mirror(s,[[.003,.046,.011,.058,.05],[.036,-.06,.029,.073,.062],
    [.028,-.144,.045,.071,.060],[.025,-.216,.066,.048,.041]]),mobile,45+row);
  for(let i=0;i<3;i++)tendon(k,elbow,i===1?'durgaBronze':'durgaIron',mirror(s,[[.068,-.026-i*.057,.067,.009],
    [.055,-.031-i*.061,.093,.015],[.003,-.034-i*.06,.116,.017],[-.038,-.031-i*.06,.096,.008]]),mobile);
  for(let i=0;i<4;i++){
    const x=.029*(i-1.5);
    tendon(k,hand,i===0?'durgaSilver':'durgaWhite',[[x,.029,.021,.017],[x+s*.006,-.026,.042,.021],
      [x+s*.011,-.069,.082,.019],[x+s*.015,-.082,.108,.009]],mobile);
  }
  gem(k,shoulder,'durgaBronze',s*.048,.033,.077,.062,.068,.039);
}

function solarDisc(k,hand,mobile){
  const disc=k.bone(hand,.037,-.066,.088);
  disc.rotation.set(.62,.37,-.27);
  markEnemyWeapon(disc,[0,.382,.027],{from:[0,-.371,.027],width:.34,kind:'ring',aim:false});
  ring(k,disc,'durgaBronze',.303,.043,mobile,.019);
  ring(k,disc,'durgaIron',.242,.026,mobile,.027);
  ring(k,disc,'durgaWhite',.203,.018,mobile,.052);
  solid(k,disc,'durgaWrap',[[0,-.188,.018,.070,.051],[0,-.082,.032,.173,.091],
    [0,.067,.03,.185,.083],[0,.166,.038,.090,.049]],mobile,42);
  gem(k,disc,'glow',0,.008,.118,.102,.113,.055);
  for(let i=0;i<12;i++){
    const a=i*TAU/12,sun=k.bone(disc,0,0,.025);
    sun.rotation.z=a;
    chased(k,sun,i%2?'durgaBronze':'durgaSilver','durgaWhite',[[-.042,.263,.013],[.049,.278,-.001],
      [.071,.346,.021],[.036,.432-(i%2)*.036,.017],[-.049,.407,.005],[-.063,.326,.001]],mobile,.036);
  }
  return disc;
}

export function forgeDurga(k,entry,mobile){
  const body=k.bone(k.root,0,1.041,0),head=k.bone(body,0,.77,.032),jaw=helm(k,head,mobile);
  solid(k,body,'durgaLining',[[0,-.177,-.023,.218,.166],[0,.031,-.023,.251,.19],
    [0,.296,-.036,.284,.202],[0,.486,-.055,.313,.199],[0,.62,-.037,.271,.161],
    [0,.733,-.036,.1,.111]],mobile,32);
  const arms=[],legs=[],cloak=k.bone(body,0,.638,-.141);
  for(const s of sides){
    for(let row=0;row<3;row++)arms.push(makeArm(k,body,s,row,mobile));
    for(let i=0;i<4;i++){
      const y=.487-i*.111;
      chased(k,body,i%2?'durgaIron':'durgaSilver','durgaBronze',mirror(s,[[.021,y+.071,.235],[.137,y+.091,.202],
        [.285,y+.068,.133],[.279,y-.088,.168],[.172,y-.133,.223],[.021,y-.067,.28]]),mobile,.049);
      const rib=.051+i*.033;
      tendon(k,body,'durgaWhite',mirror(s,[[.031,y-.022,-.235,.012],[rib,y+.011,-.273,.027],
        [.185,y+.016,-.259,.024],[.287,y-.038,-.193,.008]]),mobile);
    }
    const hip=k.bone(body,s*.149,-.204,.019),shin=k.bone(hip,s*.028,-.383,.059),heel=k.bone(shin,.021*s,-.34,.084);
    solid(k,hip,'durgaWrap',mirror(s,[[.003,.083,-.036,.147,.129],[.033,-.086,-.012,.165,.144],
      [.051,-.24,.031,.141,.114],[.046,-.392,.043,.088,.097]]),mobile,66);
    for(let i=0;i<4;i++)tendon(k,hip,i%2?'durgaCape':'durgaBronze',mirror(s,[[.043+i*.035,.057,.073,.015],
      [.049+i*.042,-.064,.143,.020],[.050+i*.025,-.241,.117,.012],[.031+i*.017,-.342,.063,.005]]),mobile);
    solid(k,shin,'durgaLining',mirror(s,[[.005,.052,-.013,.089,.094],[.018,-.087,.011,.107,.088],
      [.025,-.223,.039,.094,.078],[.028,-.349,.082,.075,.070]]),mobile,17);
    chased(k,shin,'durgaIron','durgaBronze',mirror(s,[[.008,.103,.119],[.085,.094,.099],[.114,-.011,.092],
      [.097,-.163,.111],[.048,-.291,.166],[-.032,-.241,.139],[-.059,-.086,.124]]),mobile,.044);
    solid(k,heel,'durgaIron',[[0,-.055,.186,.074,.066],[.007*s,-.044,.094,.111,.102],
      [.019*s,.029,.017,.084,.069]],mobile,25,2.95);
    legs.push({hip,shin,heel,s});
  }
  const grip=arms.find(arm=>arm.s===1&&arm.row===0).hand;
  const disc=solarDisc(k,grip,mobile);
  const garment=sides.flatMap(s=>[
    {parent:cloak,name:'灰燼庭・破帆夜舟 橙錦披風 '+s,path:mirror(s,[[.099,.04,-.051,.162],[.171,-.263,-.162,.248],
      [.214,-.651,-.291,.286],[.249,-1.01,-.435,.258],[.218,-1.185,-.454,.155]]),
    tint:0xb9684b,trim:0xcf9d6f,lining:0x6a4747,phase:s*.77,flex:1.13},
    {parent:body,name:'灰燼庭・破帆夜舟 腰前幅 '+s,path:mirror(s,[[.058,.081,.184,.068],[.105,-.239,.281,.106],
      [.132,-.522,.347,.12],[.157,-.877,.365,.039]]),tint:0xa68458,trim:0xd4ae7f,lining:0x534748,phase:s*.63,flex:.95},
  ]);
  return {body,head,crest:cloak,legs:legs.map(leg=>leg.hip),arms:arms.map(arm=>arm.shoulder),
    catalogueSculpt:entry.id,pattern:'duel',commanderGarments:garment,
    cataloguePose({beat,step,travel,wind,strike}){
      for(const {shoulder,elbow,hand,s,row} of arms){
        shoulder.rotation.z=s*(.40+row*.59+wind*.21-strike*.089);
        shoulder.rotation.x=-.06-row*.15+Math.sin(beat+row*.92+s)*.062-wind*(.52+row*.12)+strike*(.50-row*.1);
        elbow.rotation.x=-.49+wind*.18+strike*.28+Math.sin(beat*.56+row)*.047;
        elbow.rotation.y=s*(.13+row*.096+wind*.14-strike*.17);
        hand.rotation.z=s*(.11+row*.25+wind*.19-strike*.14);
      }
      for(const {hip,shin,heel,s} of legs){
        const move=Math.sin(step+s*Math.PI*.53)*travel;
        hip.rotation.x=.16+move*.58-wind*.10+strike*.17;
        shin.rotation.x=-.30+Math.abs(move)*.43+wind*.16-strike*.095;
        heel.rotation.x=-shin.rotation.x*.58;
      }
      cloak.rotation.x=travel*.16+wind*.095+strike*.32;
      cloak.rotation.z=Math.sin(beat*.70)*.06+strike*.09;
      disc.rotation.set(.61+wind*.23-strike*.32,.37+wind*.32,.27+strike*.16+Math.sin(beat*.59)*.08);
      jaw.rotation.x=wind*.09+strike*.16;
    }};
}
