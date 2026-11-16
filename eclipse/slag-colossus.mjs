import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const tau=Math.PI*2;

export const slagColossusFinishes={
  slagBasalt:[0x494145,.26,.75,'stone'],slagPumice:[0x624d43,.21,.76,'stone'],
  slagObsidian:[0x332c34,.40,.52,'stone'],slagAsh:[0x271c22,.17,.81,'stone'],
  slagMagma:[0xdd5721,.23,.45,'stone'],slagCrack:[0xff9c34,.14,.52,'stone'],
  slagIron:[0x523d32,.69,.56,'iron'],
};

function tooling(k,mobile){
  return {
    cast:(joint,mat,path,seed=0)=>k.geometry(joint,mat,sculptVolume(path,{
      sides:mobile?8:13,rings:mobile?12:18,section:2.78,ridge:.42,seed,
    })),
    slab:(joint,mat,path,thickness=.082)=>k.sculpt.plate(joint,mat,path,thickness,.025),
    vein:(joint,mat,path,steps=11)=>k.sculpt.sweep(joint,mat,path,{steps,sides:6,ridge:.24}),
  };
}

function shaleCrest(k,g,body){
  const {cast,slab,vein}=g;
  const head=k.bone(body,0,1.589,.214),jaw=k.bone(head,0,-.10,.119);
  head.name='燃燒的火焰怪 · 黑曜石面';
  cast(head,'slagAsh',[[0,-.147,.129,.134,.081],[0,-.061,.074,.242,.132],
    [0,.072,.022,.295,.185],[0,.195,-.034,.248,.167],[.02,.287,-.071,.156,.094]],5.8);
  cast(jaw,'slagObsidian',[[0,-.191,.041,.132,.067],[0,-.117,.099,.186,.103],
    [0,-.041,.135,.189,.102],[0,.035,.071,.160,.100]],7.4);
  for(const side of sides){
    const p=points=>mirror(side,points);
    slab(head,'slagPumice',p([[.024,.150,.188],[.101,.207,.171],[.213,.221,.150],[.306,.262,-.021],
      [.278,.118,-.061],[.218,.087,.123],[.164,.104,.208],[.097,.113,.222]]),.052);
    slab(head,'slagBasalt',p([[.103,.018,.230],[.186,.014,.216],[.260,.078,.099],[.281,-.082,.021],
      [.221,-.154,.131],[.109,-.107,.219]]),.061);
    k.mesh(head,'gem','slagCrack',side*.121,.069,.252,.066,.030,.029,0,side*.44,-side*.21);
    vein(jaw,'slagCrack',p([[.009,-.025,.230,.012],[.083,.007,.207,.021],[.155,-.016,.170,.018],
      [.216,-.052,.08,.003]]),8);
    for(let i=0;i<3;i++){
      const x=.138+i*.066,z=-.151+.043*i;
      cast(head,i%2?'slagPumice':'slagObsidian',p([[x*.71,.088,z,.105,.109],[x,.226,z-.033,.114,.101],
        [x*1.13,.338-i*.044,z-.121,.073,.068],[x*1.29,.430-i*.036,z-.209,.007,.008]]),3.8+i);
      vein(head,'slagMagma',p([[x*.72,.087,z+.096,.013],[x,.211,z+.061,.022],
        [x*1.11,.308-i*.048,z-.069,.017],[x*1.23,.388-i*.032,z-.154,.004]]),10);
    }
  }
  slab(head,'slagObsidian',[[-.112,.214,.146],[-.066,.301,.089],[.019,.317,.107],
    [.117,.241,.165],[.077,.148,.242],[.008,.101,.259],[-.054,.164,.211]],.044);
  vein(head,'slagCrack',[[.023,.298,.139],[-.022,.234,.188],[.033,.207,.202],[.001,.147,.251]]
    .map(([x,y,z],i)=>[x,y,z,[.006,.019,.014,.005][i]]));
  return {head,jaw};
}

function tectonicCoat(k,g,body,mobile){
  const {cast,slab,vein}=g;
  cast(body,'slagBasalt',[[0,-.049,-.052,.244,.232],[0,.215,-.061,.392,.314],[0,.453,-.047,.459,.346],
    [0,.698,-.001,.505,.366],[0,.966,-.001,.617,.385],[0,1.208,.015,.604,.348],
    [0,1.397,.021,.381,.274],[0,1.527,.068,.241,.181]],13);
  const molten=[];
  for(let row=0;row<6;row++){
    const y=row*.214+.214,w=.348+Math.sin(row*.41)*.235;
    for(const side of sides){
      const tilt=Math.sin(row*2.20+side*.84)*.082;
      const p=points=>mirror(side,points.map(([x,h,z,...rest])=>[x,h+x*tilt*2,z,...rest]));
      const x=w*.71,roof=.194+Math.sin(row*.33)*.049,z=.284+Math.sin(row*.51)*.066;
      slab(body,(row+side+1)%3?'slagBasalt':'slagPumice',p([[.026,y+roof,z+.045],[x,y+roof+.016,z+.009],
        [w+.07,y+.067,z-.183],[w,y-.111,z-.159],[x*.71,y-.145,z+.082],
        [.117,y-.088+tilt*.35,z+.108],[.054,y-.104+tilt*.21,z+.109]]),.066);
      const shear=Math.sin(row*1.92+side*.51)*.061;
      vein(body,row%3?'slagMagma':'slagCrack',p([[.037,y-.102+tilt*.22,z+.121,.006],
        [x*.39,y-.097+shear,z+.148,.018],[x*.65,y-.106-tilt*.23,z+.130,.016],
        [x*.79,y-.049+shear,z+.108,.013],[w,y-.041+tilt*.39,z-.112,.004]]),12);
      vein(body,'slagObsidian',p([[.070,y+.131,z+.082,.009],[x*.52,y+.06+tilt*.35,z+.127,.022],
        [x*.83,y-.001+shear,z+.107,.020],[w,y+.039,z-.061,.005]]),11);
      const back=k.bone(body,side*(.172+Math.sin(row*.34)*.091),y-.082,-.296);
      back.rotation.y=side*.19;
      cast(back,row%2?'slagObsidian':'slagBasalt',p([[.020,-.124,-.004,.147,.092],
        [.090,.00,-.102,.176,.109],[.139,.118,-.169,.136,.093],[.20,.203,-.273,.010,.011]]),8+row*.9);
      vein(back,row%2?'slagMagma':'slagCrack',p([[.040,-.129,-.118,.008],[.082,.011,-.220,.02],
        [.167,.113,-.256,.018],[.203,.166,-.274,.004]]));
    }
    vein(body,'slagCrack',[[.017,y-.084,.398,.010],[-.033,y-.012,.401,.018],
      [.041,y+.070,.414,.023],[.005,y+.143,.401,.007]],10);
  }
  for(let i=0;i<(mobile?8:12);i++){
    const angle=i*tau/(mobile?8:12);
    const ember=k.bone(body,Math.sin(angle)*.331,.05,Math.cos(angle)*.304);
    ember.rotation.y=angle;
    cast(ember,i%3?'slagMagma':'slagCrack',[[0,.283,.027,.147,.126],[.027,.140,.079,.166,.128],
      [.058,-.071,.131,.146,.107],[.031,-.278,.164,.098,.066],[.057,-.426,.211,.015,.017]],21+i);
    slab(ember,'slagObsidian',[[-.136,.196,.104],[.076,.215,.149],[.169,.048,.227],[.123,-.114,.257],
      [.035,-.207,.231],[-.114,-.088,.199],[-.147,.019,.171]],.069);
    molten.push({ember,angle});
  }
  return molten;
}

function bludgeon(k,g,wrists){
  const {cast,slab,vein}=g;
  const club=k.bone(wrists,.123,-.155,.213);
  club.name='燃燒的火焰怪 · 熔岩大棒';
  club.rotation.x=.47;club.rotation.z=-.35;
  club.scale.setScalar(.93);
  markEnemyWeapon(club,[0,1.13,.083],{width:.34});
  cast(club,'slagIron',[[0,-.517,0,.058,.057],[0,-.34,-.008,.090,.085],
    [0,.02,.006,.093,.086],[0,.383,.015,.102,.103],[0,.517,.016,.064,.067]],8);
  cast(club,'slagMagma',[[0,.358,-.067,.146,.161],[.012,.55,-.045,.243,.214],
    [.018,.733,.008,.276,.254],[.033,.952,.076,.252,.247],[.048,1.117,.103,.161,.145]],22);
  for(let i=0;i<8;i++){
    const a=i*tau/8;
    const chunk=k.bone(club,Math.sin(a)*.202,.692,Math.cos(a)*.171);
    chunk.rotation.y=a;
    slab(chunk,i%3?'slagBasalt':'slagPumice',[[-.12,-.284,-.073],[.064,-.273,-.044],
      [.132,-.076,.103],[.116,.178,.170],[.043,.319,.127],[-.112,.256,.141],[-.163,.015,.143]],.081);
    vein(chunk,i%2?'slagMagma':'slagCrack',[[-.09,-.221,.013,.006],[-.056,-.063,.144,.018],
      [.017,.019,.193,.020],[-.038,.142,.202,.012],[.001,.272,.169,.005]],14);
  }
}

function shoulder(k,g,body,side){
  const {cast,slab,vein}=g,p=path=>mirror(side,path);
  const arm=k.bone(body,side*.555,1.167,-.032);
  const elbow=k.bone(arm,side*.413,-.286,.138),wrist=k.bone(elbow,side*.178,-.359,.211);
  cast(arm,'slagBasalt',p([[0,-.088,-.013,.257,.235],[.218,-.063,.014,.304,.250],
    [.356,-.192,.047,.277,.225],[.414,-.286,.138,.193,.170]]),9);
  cast(elbow,'slagObsidian',p([[0,.052,-.03,.191,.171],[.093,-.078,.05,.25,.232],
    [.168,-.239,.112,.223,.217],[.18,-.366,.218,.13,.130]]),11);
  for(let i=0;i<3;i++){
    const x=i*.107,z=.07-i*.076;
    cast(arm,'slagObsidian',p([[x,-.022,z,.201,.172],[x+.108,.117,z-.04,.171,.142],
      [x+.19,.284,z-.135,.119,.112],[x+.218,.447-i*.079,z-.236,.007,.011]]),3+i);
    vein(arm,'slagMagma',p([[x+.03,-.109,z+.208,.006],[x+.119,.012,z+.132,.025],
      [x+.173,.190,z-.023,.028],[x+.196,.337-i*.052,z-.138,.004]]),9);
    slab(elbow,'slagPumice',p([[.007,-.12-i*.069,.215],[.125,-.12-i*.069,.277],
      [.251,-.028-i*.091,.248],[.260,-.184-i*.069,.187],[.164,-.24-i*.045,.28],
      [.067,-.22-i*.061,.276]]),.042);
  }
  cast(wrist,'slagMagma',p([[0,.044,.025,.137,.134],[.044,-.019,.078,.171,.151],
    [.082,-.099,.138,.181,.142],[.107,-.198,.194,.140,.104]]),10);
  for(let i=0;i<4;i++)cast(wrist,i%3?'slagPumice':'slagObsidian',p([[.014+i*.051,-.047,.151,.064,.056],
    [.032+i*.054,-.111,.208,.062,.055],[.046+i*.052,-.201,.228,.053,.048],
    [.050+i*.049,-.258,.17,.017,.02]]),15+i);
  if(side>0)bludgeon(k,g,wrist);
  return {arm,elbow,wrist,side};
}

export function carveSlagColossus(k,entry,mobile){
  const g=tooling(k,mobile),body=k.bone(k.root,0,.47,0);
  const {head,jaw}=shaleCrest(k,g,body),molten=tectonicCoat(k,g,body,mobile);
  const arms=sides.map(side=>shoulder(k,g,body,side));
  for(const [name,tint] of [['slagMagma',0xfa4c16],['slagCrack',0xff8d27]]){
    k.materials[name].emissive.setHex(tint);
    k.materials[name].emissiveIntensity=.85;
  }
  return {
    body,head,arms:arms.map(limb=>limb.arm),inspectionHead:head,crest:k.bone(body,0,0,0),
    catalogueSculpt:entry.id,sourceSculpt:true,pattern:'hover',
    polishEnergy:{tint:0xf97635,shape:'embers',anchor:body,offset:[0,.57,.11],span:[.95,.97,.86],
      weaponWidth:.80,emissionScale:.79},
    cataloguePose({beat,wind,strike,travel,fall,stage,attackPattern}){
      const slam=attackPattern==='cleave'||attackPattern==='sweep';
      const charge=wind*(slam?1.26:.67),impact=strike*(slam?1.27:.82);
      body.rotation.y=-charge*.30+impact*.36;
      head.rotation.y=Math.sin(beat*.44)*.088+charge*.14;
      jaw.rotation.x=Math.sin(beat*.61)*.042+charge*.37+impact*.27;
      for(const {arm,elbow,wrist,side} of arms){
        const phase=Math.sin(beat*.81+side);
        arm.rotation.set(.08+travel*.21*phase-charge*(side>0?1.03:.62)+impact*.92,
          side*(.08-travel*.090+charge*.46-impact*.32),side*(.17+charge*.22+impact*.13));
        elbow.rotation.x=.16+charge*.53-impact*.86;
        elbow.rotation.z=side*(.17+charge*.25-impact*.19);
        wrist.rotation.x=phase*.07+charge*.15-impact*.22;
      }
      for(const {ember,angle} of molten){
        const drift=Math.cos(beat*.92+angle*2);
        ember.rotation.x=drift*.16+charge*.19-impact*.36+fall*.19;
        ember.position.y=.05+drift*(.026+travel*.058)+strike*.133;
        ember.scale.y=1+drift*.09+strike*.29+stage*.16;
      }
      const pulse=.72+Math.sin(beat*.53)*.14+wind*.43+strike*.54+stage*.15;
      k.materials.slagMagma.emissiveIntensity=pulse;
      k.materials.slagCrack.emissiveIntensity=pulse*1.13;
    },
  };
}
