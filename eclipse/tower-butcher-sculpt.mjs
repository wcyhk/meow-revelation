import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

export const butcherFinishes={
  butcherSkin:[0xa58a68,.08,.72,'hide'],
  butcherScar:[0x795647,.09,.75,'hide'],
  butcherLip:[0x694136,.09,.72,'hide'],
  butcherLeather:[0x443126,.14,.82,'hide'],
  butcherBronze:[0x9d7449,.62,.46,'bronze'],
  butcherSteel:[0x7f8780,.69,.48,'iron'],
};

const sides=[-1,1];
const reflect=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

export function carveTowerButcher(k,entry,mobile){
  const {root,bone,mesh,sculpt}=k;
  const body=bone(root,0,1.11,0),head=bone(body,.04,.80,.12);
  const jaw=bone(head,0,-.039,.046);
  const vest=bone(body,0,-.105,.015);
  const arms=[],legs=[],limbs=[],knees=[],hem=[];
  const skin=(joint,finish,path,seed=0)=>k.geometry(joint,finish,sculptVolume(path,{
    sides:mobile?13:19,rings:mobile?17:23,section:2.40,ridge:.13,seed,
  }));
  const cord=(joint,finish,path)=>sculpt.sweep(joint,finish,path,{steps:15,sides:7,ridge:.19});
  skin(body,'butcherSkin',[[0,-.35,-.057,.31,.209],[0,-.21,-.041,.49,.335],[0,-.037,.012,.584,.42],
    [0,.187,.035,.626,.469],[.022,.424,-.024,.588,.383],[.021,.593,-.018,.491,.315],[.024,.738,.012,.244,.203]]);
  skin(head,'butcherSkin',[[0,-.22,.103,.181,.147],[0,-.108,.13,.248,.215],[0,.079,.104,.287,.234],
    [0,.258,.026,.243,.214],[.035,.355,-.028,.149,.142]]);
  skin(jaw,'butcherLip',[[0,-.190,.073,.115,.092],[0,-.137,.153,.198,.133],
    [0,-.048,.154,.214,.167],[0,.032,.142,.154,.137]]);
  skin(head,'butcherScar',[[0,-.015,.328,.104,.064],[0,.064,.35,.125,.099],[0,.143,.298,.075,.079],[0,.206,.217,.054,.053]]);
  cord(body,'butcherBronze',[[-.52,.516,.159,.059],[-.33,.392,.383,.071],[-.122,.245,.490,.067],
    [.139,.102,.507,.065],[.389,-.077,.431,.061],[.494,-.193,.254,.052]]);
  cord(body,'butcherLeather',[[-.498,.519,-.091,.069],[-.35,.455,-.322,.066],[-.105,.289,-.409,.069],
    [.139,.094,-.451,.070],[.387,-.093,-.35,.064],[.494,-.193,-.159,.053]]);
  for(const side of sides){
    const out=path=>reflect(side,path);
    skin(body,'butcherSkin',out([[.192,.415,-.288,.121,.10],[.332,.432,-.314,.192,.123],
      [.434,.507,-.260,.17,.122],[.52,.62,-.155,.094,.075]]),2+side);
    skin(body,'butcherScar',out([[.31,-.075,-.308,.089,.033],[.385,.067,-.356,.095,.052],
      [.481,.227,-.319,.093,.058],[.545,.331,-.212,.038,.042]]),side);
    skin(head,'butcherScar',out([[.209,-.091,.256,.084,.067],[.275,-.023,.205,.106,.092],
      [.302,.096,.152,.072,.056],[.31,.195,.047,.027,.024]]),3+side);
    const ear=bone(head,side*.252,.039,-.005);
    skin(ear,'butcherSkin',out([[.006,-.113,.004,.056,.065],[.102,-.044,.012,.077,.070],
      [.109,.091,.014,.096,.068],[.146,.198,-.018,.031,.024],[.138,.231,-.038,.006,.005]]),19+side);
    mesh(head,'round','deep',side*.142,.111,.302,.095,.041,.041,.09,side*.37,-side*.21);
    mesh(head,'gem','glow',side*.145,.101,.340,.048,.018,.019,.08,side*.36,-side*.20);
    cord(head,'butcherSkin',out([[.062,.138,.351,.047],[.147,.170,.351,.058],[.230,.162,.285,.055],[.278,.101,.207,.023]]));
    cord(jaw,'ivory',out([[.154,-.086,.21,.042],[.188,-.012,.256,.034],[.168,.062,.269,.023],[.137,.106,.241,.005]]));
    const shoulder=bone(body,side*.554,.49,.042);
    const forearm=bone(shoulder,side*.133,-.437,.091);
    const wrist=bone(forearm,side*.049,-.42,.089);
    arms.push(shoulder);
    limbs.push({forearm,side});
    skin(shoulder,'butcherSkin',out([[.119,-.461,.085,.164,.15],[.166,-.318,.071,.223,.209],
      [.114,-.078,.017,.254,.239],[.033,.099,-.046,.203,.194]]),3*side);
    skin(forearm,'butcherSkin',out([[.046,-.437,.111,.116,.137],[.073,-.306,.086,.173,.171],
      [.078,-.142,.068,.196,.209],[.012,.051,-.006,.144,.153]]),4*side);
    skin(wrist,'butcherSkin',[[0,-.126,.06,.105,.13],[0,-.025,.067,.155,.131],[0,.083,.017,.123,.104]]);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.065;
      cord(wrist,'butcherScar',[[x,-.052,.113,.038],[x,-.124,.137,.044],[x,-.163,.094,.039],[x,-.141,.057,.026]]);
      const depth=.15-i*.091;
      sculpt.plate(forearm,'butcherBronze',out([[.069,-.098,depth],[.188,-.133,depth-.026],
        [.242,-.251,depth-.025],[.145,-.313,depth-.006],[.073,-.287,depth+.024]]),.044,.012);
    }
    const leg=bone(root,side*.31,.888,-.003),knee=bone(leg,side*.053,-.439,.038);
    legs.push(leg);
    knees.push({knee,side});
    skin(leg,'butcherSkin',out([[.045,-.48,.033,.145,.153],[.038,-.254,.002,.237,.203],
      [.008,-.071,-.019,.252,.217],[-.047,.081,-.014,.194,.161]]),7+side);
    skin(knee,'butcherSkin',out([[.034,-.371,.024,.123,.122],[.035,-.206,-.028,.157,.153],
      [.024,-.091,-.005,.191,.171],[0,.042,.061,.150,.145]]),12+side);
    skin(knee,'butcherLeather',[[0,-.428,.078,.136,.235],[0,-.383,.088,.156,.256],
      [0,-.303,.066,.141,.213],[0,-.258,.027,.101,.135]]);
    for(let rivet=0;rivet<4;rivet++){
      const x=(rivet-1.5)*.063;
      mesh(knee,'round','butcherBronze',x,-.36,.307,.027,.022,.024);
    }
    for(let i=0;i<3;i++){
      const offset=side*(.115+i*.155),rear=i===2;
      const flap=bone(vest,offset,-.106,rear?-.32:.352-i*.044);
      flap.rotation.y=side*(rear?2.46:i*.45);
      const length=.38+(side===1?.16:.07)+i*.065;
      sculpt.plate(flap,'butcherLeather',[[-.101,.045,0],[.114,.021,-.026],[.116,-length*.57,.044],
        [.084,-length,.084],[.031,-length*.85,.101],[-.057,-length*.94,.105],[-.104,-length*.45,.07]],.046,.016);
      cord(flap,'butcherBronze',[[-.093,.023,.027],[-.089,-.127,.021],[-.069,-length*.54,.079],
        [-.055,-length*.84,.112]].map(([x,y,z])=>[x,y,z,.014]));
      hem.push({flap,side,i,rear});
    }
    if(side===1){
      const cleaver=bone(wrist,.019,-.035,.06);
      cleaver.name='屠翼 · 缺口斬骨刀';
      markEnemyWeapon(cleaver,[.058,1.15,-.13],{width:.24});
      cord(cleaver,'butcherLeather',[[0,-.29,0,.061],[0,-.089,0,.073],[0,.147,.023,.066],[0,.243,.032,.057]]);
      sculpt.plate(cleaver,'butcherSteel',[[-.104,.155,.001],[.215,.134,.016],[.244,.473,-.016],[.182,.556,-.04],
        [.265,.63,-.052],[.304,1.02,-.093],[.057,1.15,-.13],[-.262,1.014,-.105],[-.226,.421,-.009]],.091,.028);
      cord(cleaver,'butcherBronze',[[-.127,.33,.05,.022],[-.172,.59,.044,.025],[-.173,.87,-.035,.026],[-.137,.989,-.067,.012]]);
      for(let h=0;h<3;h++)mesh(cleaver,'round','butcherLeather',-.131,.77+h*.063,-.023-h*.015,.052,.032,.029);
    }
  }
  for(let i=0;i<9;i++){
    const a=(i-4)*.39, x=Math.sin(a)*.46, z=Math.cos(a)*.365;
    const buckle=bone(vest,x,-.129,z);buckle.rotation.y=a;
    sculpt.plate(buckle,'butcherBronze',[[-.083,.038,.024],[.09,.041,.016],[.093,-.075,.023],
      [0,-.105,.049],[-.081,-.075,.03]],.054,.018);
  }
  return {body,head,arms,legs,limbs,crest:bone(root,0,0,0),pattern:'slam',
    catalogueSculpt:entry.id,sourceSculpt:true,polishEnergy:{tint:0x99ad6e,shape:'ribbons',anchor:body,span:[.84,.66,.57]},
    cataloguePose({beat,step,wind,strike,travel,fall}){
      jaw.rotation.x=.028+wind*.17+strike*.33;
      vest.rotation.y=Math.sin(step)*travel*.11+wind*.12-strike*.17;
      for(const {knee,side} of knees){
        const stride=Math.sin(step+side*Math.PI*.5)*travel;
        knee.rotation.x=-.08+Math.max(0,stride)*.46+strike*.21+fall*.24;
      }
      for(const {flap,side,i,rear} of hem){
        flap.rotation.x=Math.sin(beat*.94+i*.87)*(.024+travel*.13)+strike*(rear?-.21:.33);
        flap.rotation.z=side*(Math.sin(beat*.62+i)*.04+wind*.11-strike*.16);
      }
    },
  };
}
