import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {bossSkin} from './boss-skin.mjs?v=boss-foundry-1';

const sides=[-1,1];
const reflected=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const tube=(k,parent,finish,path,mobile,settings={})=>k.geometry(parent,finish,sculptVolume(path,{
  sides:mobile?9:14,rings:mobile?12:19,section:2.3,ridge:.20,...settings,
}));
const line=(k,parent,finish,path,steps=9)=>k.sculpt.sweep(parent,finish,path,{steps,sides:6,ridge:.18});
const plate=(k,parent,finish,path,d=.046)=>k.sculpt.plate(parent,finish,path,d,.014);

export const hundunFinishes={
  chaosHide:[0x383436,.09,.76,'hide'],chaosDeep:[0x242329,.10,.79,'hide'],chaosPlate:[0x54525a,.46,.54,'iron'],
  chaosHorn:[0x908277,.28,.64,'bone'],chaosGold:[0xb08951,.48,.49,'bronze'],chaosLight:[0xffd28e,.13,.43,'gem'],
  chaosTendon:[0x655956,.09,.74,'hide'],chaosShell:[0x3a424b,.46,.58,'iron'],chaosWorn:[0x7e7c73,.32,.61,'bone'],
};

function sculptFace(k,head,mobile){
  tube(k,head,'chaosDeep',[[0,-.085,-.209,.232,.185],[0,-.054,-.092,.311,.239],[0,-.029,.157,.285,.227],
    [0,-.075,.333,.210,.141],[0,-.119,.482,.119,.081]],mobile,{section:2.90});
  const jaw=k.bone(head,0,-.124,.106);
  tube(k,jaw,'chaosPlate',[[0,-.017,-.051,.153,.121],[0,-.078,.088,.213,.125],[0,-.096,.204,.165,.088],
    [0,-.047,.357,.087,.062],[0,-.011,.412,.056,.038]],mobile);
  for(const side of sides){
    const r=path=>reflected(side,path);
    const cheek=r([[.034,.197,.204],[.163,.199,.226],[.278,.098,.21],[.31,.014,.103],
      [.268,-.107,.132],[.146,-.163,.322],[.053,-.117,.431]]);
    plate(k,head,'chaosPlate',cheek,.056);
    line(k,head,'chaosGold',cheek.slice(1,6).map(([x,y,z],i)=>[x+side*.020,y+.028,z+.019,[.018,.039,.035,.020,.005][i]]),12);
    line(k,head,'glow',r([[.074,.031,.372,.006],[.147,.062,.327,.014],[.201,.077,.249,.013],[.234,.082,.206,.003]]));
    for(let i=0;i<3;i++){
      const x=.045+i*.052,z=.378-i*.058;
      line(k,jaw,i===1?'chaosGold':'chaosHorn',r([[x,-.016,z,.022],[x+.017,.045,z+.036,.021],[x+.011,.064,z+.051,.003]]),8);
    }
    tube(k,head,'chaosHorn',r([[.151,-.027,.169,.067,.058],[.268,-.039,.198,.083,.071],
      [.365,-.053,.339,.068,.052],[.435,-.004,.525,.052,.04],[.433,.067,.647,.019,.016],
      [.376,.105,.708,.004,.005]]),mobile,{rings:17,section:2.51});
    const antler=r([[.192,.104,-.142,.094,.09],[.382,.174,-.243,.100,.094],[.561,.283,-.399,.083,.077],
      [.710,.440,-.558,.044,.034],[.743,.546,-.792,.006,.005]]);
    tube(k,head,'chaosPlate',antler,mobile,{rings:18,section:2.67});
    line(k,head,'chaosHorn',antler.map(([x,y,z,w])=>[x+side*.019,y+.043,z+.019,w*.54]),14);
  }
  const forequills=k.bone(head,0,.22,-.139);
  const count=mobile?9:15;
  for(let i=0;i<count;i++){
    const t=i/(count-1)*2-1,fan=Math.abs(t),s=t<0?-1:1;
    const peak=.097+.062*Math.sin(i*1.8);
    tube(k,forequills,i%3===0?'chaosHorn':'chaosGold',[[t*.204,peak,-.031,.041,.031],[t*.242,peak+.08,.127,.057,.051],
      [t*.287,.10+peak,.277,.049,.039],[t*.29,.044,.476-fan*.086,.030,.031],
      [t*.223+s*.029,-.078+fan*.038,.657-fan*.125,.005,.005]],mobile,{rings:10,sides:7,ridge:.31,fur:true});
    if(i%2===0)line(k,forequills,'chaosLight',[[t*.215,peak+.021,.068,.009],[t*.261,peak+.111,.211,.014],
      [t*.287,peak+.083,.382-fan*.057,.012],[t*.224,-.048,.563-fan*.111,.003]],9);
  }
  return {jaw,forequills};
}

function chaosScapula(k,body,side,mobile){
  const r=path=>reflected(side,path);
  const girdle=k.bone(body,0,.28,.239);
  girdle.name='混沌 · 肩胛';
  tube(k,girdle,'chaosHide',r([[.195,.095,.106,.179,.143],[.357,.126,.078,.200,.194],
    [.493,.06,-.042,.183,.158],[.522,-.131,-.107,.156,.158],[.443,-.215,-.189,.104,.118]]),mobile,{section:2.45,ridge:.30});
  for(let i=0;i<4;i++){
    const z=.221-i*.245,x=.33+i*.049,y=.311-i*.058;
    const blade=r([[x-.097,y+.071,z+.124],[x+.056,y+.084,z+.007],[x+.134,y+.026,z-.101],
      [x+.243,y-.092,z-.28],[x+.122,y-.126,z-.188],[x+.014,y-.141,z-.114],[x-.061,y-.022,z+.038]]);
    plate(k,girdle,i%2?'chaosDeep':'chaosPlate',blade,.063);
    line(k,girdle,'chaosHorn',blade.slice(1,6).map(([x,y,z],j)=>[x+side*.039,y+.018,z-.019,[.016,.031,.032,.017,.006][j]]),12);
    const rib=r([[x-.089,y+.10,z+.094,.049],[x+.000,y+.151,z+.019,.057],[x+.105,y+.22,z-.168,.041],
      [x+.206,y+.287,z-.379,.005]]);
    line(k,girdle,i===1?'chaosGold':'chaosPlate',rib,13);
  }
  return girdle;
}

function chaosAbdomen(k,body,side,mobile){
  const r=path=>reflected(side,path);
  const ventral=k.bone(body,0,-.069,-.129);
  ventral.name='混沌 · 腹底骨膜';
  tube(k,ventral,'chaosTendon',r([[.118,-.133,-.652,.120,.101],[.216,-.151,-.469,.179,.125],
    [.296,-.147,-.234,.176,.138],[.339,-.103,.009,.161,.123],[.364,-.034,.248,.147,.119],
    [.329,.036,.445,.114,.097]]),mobile,{section:2.53,rings:17,ridge:.31});
  for(let i=0;i<(mobile?4:6);i++){
    const t=i/(mobile?3:5),z=.33-t*.899,x=.391-.051*t;
    // Each rib wraps beneath the body and leaves a visible seam at the soft centre.
    const rib=r([[x-.029,.076,z+.084,.064,.072],[x+.039,.006,z+.009,.074,.059],
      [x+.016,-.133,z-.039,.059,.053],[x-.103,-.255,z-.103,.045,.043],
      [x-.225,-.303,z-.152,.023,.026],[x-.318,-.288,z-.136,.007,.008]]);
    tube(k,ventral,i%2?'chaosPlate':'chaosShell',rib,mobile,{sides:8,rings:10,section:3.16,ridge:.31});
    line(k,ventral,'chaosWorn',r([[x+.027,.088,z+.058,.012],[x+.077,-.024,z+.013,.025],
      [x+.022,-.161,z-.032,.026],[x-.094,-.259,z-.077,.015],[x-.211,-.304,z-.134,.005]]),9);
  }
  return {ventral,side};
}

function shoulderToHip(k,upper,side,mobile){
  const r=path=>reflected(side,path);
  const sacrum=k.bone(upper,0,.032,-.057);
  sacrum.name='混沌 · 活動骶甲';
  tube(k,sacrum,'chaosTendon',r([[-.153,.107,-.093,.108,.073],[-.040,.123,-.209,.158,.119],
    [.082,.063,-.263,.168,.131],[.190,-.060,-.203,.141,.096],[.172,-.203,-.130,.075,.068],
    [.119,-.279,-.043,.032,.048]]),mobile,{section:2.73,ridge:.29});
  const flank=r([[-.127,.195,-.076],[.027,.193,-.191],[.193,.126,-.208],[.251,.026,-.339],
    [.221,-.073,-.284],[.112,-.143,-.222],[.001,-.108,-.143],[-.069,-.025,-.053]]);
  plate(k,sacrum,'chaosShell',flank,.071);
  line(k,sacrum,'chaosWorn',flank.slice(1,7).map(([x,y,z],i)=>[x+side*.031,y+.031,z-.028,[.017,.039,.033,.025,.011,.004][i]]),13);
  for(let i=0;i<2;i++){
    const x=.035+i*.051,y=-.035-i*.106,z=-.257+i*.033;
    tube(k,sacrum,i?'chaosTendon':'chaosPlate',r([[x-.079,y+.071,z+.034,.041,.051],[x+.013,y+.043,z-.051,.076,.057],
      [x+.081,y-.014,z-.112,.063,.041],[x+.136,y-.059,z-.162,.045,.036],
      [x+.197,y-.088,z-.216,.005,.006]]),mobile,{sides:8,rings:12,section:2.94});
  }
  return sacrum;
}

function chaosLeg(k,body,side,fore,mobile){
  const r=path=>reflected(side,path);
  const x=fore?.38:.327,z=fore?.40:-.699;
  const upper=k.bone(body,side*x,.118,z);
  const lower=k.bone(upper,side*(fore?.182:.145),fore?-.226:-.241,fore?.017:.019);
  const ankle=k.bone(lower,side*.073,fore?-.218:-.226,fore?.206:.169);
  upper.name=fore?'混沌 · 前肩':'混沌 · 後髖';
  ankle.name=fore?'混沌 · 前腕':'混沌 · 後踝';
  const sacrum=fore?null:shoulderToHip(k,upper,side,mobile);
  const width=fore?.203:.151;
  tube(k,upper,'chaosHide',r([[0,.077,.051,width*.89,width*.85],[.076,.014,.031,width,width*.88],
    [.161,-.151,.052,width*.83,width*.72],[.183,-.253,.02,width*.59,width*.63]]),mobile,{section:2.8,ridge:.26});
  tube(k,lower,'chaosDeep',r([[.011,.034,-.017,width*.63,width*.70],[.038,-.041,.051,width*.67,width*.62],
    [.063,-.109,.119,width*.54,width*.57],[.077,-.227,.193,width*.42,width*.43]]),mobile,{section:2.74});
  for(let i=0;i<3;i++){
    const y=.034-i*.078,x=.091+i*.013,z=i*.027;
    const buckle=r([[x-.061,y+.024,z+.108],[x+.036,y+.031,z+.079],[x+.072,y-.027,z-.025],
      [x+.059,y-.099,z-.048],[x+.044,y-.126,z+.046],[x-.024,y-.091,z+.133]]);
    plate(k,lower,i%2?'chaosHide':'chaosPlate',buckle,.042);
    line(k,lower,'chaosHorn',buckle.slice(1,5).map(([x,y,z],i)=>[x+side*.020,y,z+.024,[.016,.023,.013,.004][i]]));
  }
  tube(k,ankle,'chaosPlate',r([[0,.049,-.028,.091,.094],[.022,.020,.048,.132,.107],
    [.039,-.037,.158,.125,.086],[.030,-.068,.225,.092,.049]]),mobile,{rings:10,section:2.91,ridge:.26});
  const toes=[];
  for(let i=0;i<4;i++){
    const toeset=k.bone(ankle,side*(i-1.33)*.065,-.051,.134);
    const z=.178-Math.abs(i-1.32)*.024;
    line(k,toeset,i%2?'chaosHorn':'chaosPlate',r([[.015,.011,0,.042],[.031,-.006,.085,.049],
      [.045,-.021,z,.036],[.043,-.018,z+.075,.024],[.031,-.046,z+.135,.004]]),10);
    toes.push(toeset);
  }
  return {upper,lower,ankle,toes,fore,side,sacrum};
}

export function sculptPrimordialHundun(k,entry,mobile){
  const body=k.bone(k.root,0,.681,.013),head=k.bone(body,0,.199,.763);
  tube(k,body,'chaosHide',[[0,-.039,-.91,.189,.173],[0,.018,-.638,.343,.283],[0,.069,-.283,.410,.332],
    [0,.124,.155,.523,.433],[0,.145,.462,.482,.432],[0,.174,.671,.361,.301]],mobile,
    {rings:mobile?20:25,sides:mobile?14:21,section:2.71,ridge:.19});
  tube(k,body,'chaosPlate',[[0,.021,.448,.377,.284],[0,.091,.613,.340,.267],
    [0,.126,.828,.251,.206],[0,.173,.943,.177,.128]],mobile,{section:2.77});
  const {jaw,forequills}=sculptFace(k,head,mobile);
  const shoulders=sides.map(side=>({side,scapula:chaosScapula(k,body,side,mobile)}));
  const skin=bossSkin(k,mobile,tools=>{
    for(const {side,scapula} of shoulders){
      const r=path=>reflected(side,path);
      tools.silk(scapula,entry.name+' · 肩側毛鬃',r([[.323,.263,.261,.064],[.449,.182,.139,.089],
        [.571,.083,-.031,.090],[.648,-.024,-.215,.062],[.674,-.138,-.378,.008]]),
      {tint:0x3d3433,trim:0xb08256,phase:side*.82,style:'mane',flex:1.18,across:[.11,.88,.48*side]});
      tools.silk(forequills,entry.name+' · 額鬃線',r([[.14,.096,.067,.038],[.206,.141,.208,.055],
        [.274,.088,.380,.050],[.275,.029,.531,.034],[.238,-.087,.660,.006]]),
      {tint:0xa98556,trim:0xcfc29a,phase:side*.73,style:'mane',flex:1.29,across:[.77,.61,0]});
    }
    return true;
  });
  const legs=sides.flatMap(side=>[chaosLeg(k,body,side,true,mobile),chaosLeg(k,body,side,false,mobile)]);
  const abdominalShell=sides.map(side=>chaosAbdomen(k,body,side,mobile));
  const tail=k.bone(body,0,.037,-.828);
  tube(k,tail,'chaosDeep',[[0,.03,0,.181,.139],[.123,.11,-.274,.131,.128],[.244,.251,-.589,.108,.086],
    [.341,.449,-.831,.075,.061],[.284,.655,-1.010,.008,.008]],mobile,{rings:18});
  for(let i=0;i<3;i++){
    const y=.05+i*.119,z=-.21-i*.237;
    line(k,tail,i===2?'chaosHorn':'chaosPlate',[[.035+i*.075,y,z,.071],[.198+i*.068,y+.137,z-.063,.062],
      [.226+i*.058,y+.210,z-.219,.004]],12);
  }
  const eyes=[];
  for(const [index,[x,y,z]] of [[-.377,.51,.103],[.028,.687,-.131],[.390,.537,-.352]].entries()){
    const eye=k.bone(body,x,y,z); eye.rotation.x=-.81;eye.rotation.y=x*.68;
    const rim=k.bone(eye,0,0,0);
    tube(k,rim,'chaosGold',[[0,0,-.132,.117,.114],[0,0,-.04,.162,.164],[0,0,.023,.149,.151],
      [0,0,.066,.134,.126]],mobile);
    k.mesh(rim,'round','chaosDeep',0,.018,.074,.115,.112,.049);
    k.mesh(rim,'pearl','chaosLight',0,.021,.107,.082,.086,.082);
    k.mesh(rim,'pearl','glow',0,.019,.148,.049,.053,.036);
    for(let claw=0;claw<5;claw++){
      const a=claw*Math.PI*2/5,indexPhase=index*.338;
      const dx=Math.sin(a+indexPhase),dy=Math.cos(a+indexPhase);
      line(k,rim,claw%2?'chaosPlate':'chaosHorn',[[dx*.109,dy*.11,-.015,.030],[dx*.165,dy*.166,.018,.056],
        [dx*.188,dy*.189,.109,.033],[dx*.161,dy*.159,.211,.003]],10);
    }
    eyes.push({eye,restY:eye.rotation.y,index});
  }
  const finish=k.materials.chaosLight;
  finish.emissive.setHex(0xf7bd6d);
  return {
    body,head,tail,skin,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,sourceSculpt:true,grounded:true,pattern:'crawl',
    polishEnergy:{tint:0xffd899,shape:'bolts',anchor:body,span:[.97,.54,1.24],offset:[0,.36,-.13]},
    cataloguePose({beat,headtime,wind,strike,travel,fall,step,stage}){
      head.rotation.set(Math.sin(beat*.55)*.092+wind*.19-strike*.28,Math.sin(headtime*2.13)*.115+strike*.12,fall*.18);
      jaw.rotation.x=wind*.23+strike*.53;
      forequills.rotation.x=-wind*.19+strike*.23+travel*.084*Math.sin(beat*1.1);
      forequills.rotation.z=Math.sin(beat*.55)*.061+strike*.074;
      for(const {side,scapula} of shoulders){
        const stride=Math.sin(step+side*Math.PI*.5);
        scapula.rotation.x=wind*.19-strike*.31+stride*travel*.16;
        scapula.rotation.z=side*(strike*.15+stage*.069+Math.abs(stride)*travel*.12);
      }
      for(const {upper,lower,ankle,fore,side,toes,sacrum} of legs){
        const stride=Math.sin(step+side*Math.PI*.5+(fore?0:Math.PI));
        const lift=travel*Math.max(0,stride);
        upper.rotation.x=travel*stride*(fore?.48:.56)+wind*.19-strike*.33;
        upper.rotation.z=side*(fall*.36+lift*.19);
        lower.rotation.x=-lift*.62+wind*.19+fall*.22;
        ankle.rotation.x=.10+lift*.45-strike*.27;
        for(const [i,toe] of toes.entries())toe.rotation.x=lift*(.07+i*.031)+strike*.11;
        if(sacrum){
          sacrum.rotation.x=lift*.27-strike*.09;
          sacrum.rotation.z=-side*(lift*.19+strike*.10);
        }
      }
      for(const {ventral,side} of abdominalShell){
        ventral.rotation.z=side*(Math.sin(beat*.53+side)*.034+wind*.062);
        ventral.scale.y=1+strike*.11+wind*.12;
      }
      for(const {eye,restY,index} of eyes){
        eye.scale.setScalar(1+stage*.14+wind*.11+strike*.18+Math.sin(beat*.63+index)*.046);
        eye.rotation.y=restY+Math.sin(beat*.64+index)*.12+strike*.14;
      }
      finish.emissiveIntensity=.32+wind*.52+strike*.85+stage*.26;
    },
  };
}
