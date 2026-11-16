import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(s,points)=>points.map(([x,...rest])=>[s*x,...rest]);
const solid=(k,j,m,track,mobile,seed=0,section=2.52)=>
  k.geometry(j,m,sculptVolume(track,{rings:mobile?10:16,sides:mobile?9:13,section,seed,ridge:.16}));
const plate=(k,j,m,track,depth=.035)=>k.sculpt.plate(j,m,track,depth,depth*.28);
const line=(k,j,m,track,mobile)=>k.sculpt.sweep(j,m,track,{steps:mobile?8:12,sides:mobile?5:7,ridge:.19});
function hinge(k,p,name,x,y,z){
  const result=k.bone(p,x,y,z);result.name=name;
  return result;
}
function tint(k,swatches){
  for(const [key,value] of Object.entries(swatches)){
    const mat=k.materials[key];
    mat.color.setHex(value);
    mat.emissive?.setHex(value);
  }
}

function phial(k,parent,name,location,width,height,mobile){
  const jar=hinge(k,parent,name,...location);
  solid(k,jar,'trim',[[0,-height*.53,0,width*.52,width*.51],[0,-height*.40,0,width,width*.95],
    [0,.02,0,width*.98,width*.80],[0,height*.39,0,width*.51,width*.45],[0,height*.59,0,width*.38,width*.36]],mobile,15.2);
  const gauge=hinge(k,jar,'Poison vent meniscus',0,0,-width*.65);
  solid(k,gauge,'glow',[[0,-height*.36,0,width*.31,width*.51],[0,-height*.22,-.013,width*.47,width*.67],
    [0,-height*.02,-.007,width*.38,width*.55],[0,height*.19,0,width*.19,width*.34]],mobile,8.28,2.02);
  for(const side of sides){
    line(k,jar,'edge',mirror(side,[[width*.24,height*.51,-width*.27,.013],[width*.66,height*.241,-width*.58,.018],
      [width*.72,-height*.18,-width*.73,.021],[width*.34,-height*.39,-width*.42,.009]]),mobile);
  }
  const cap=new T.TorusGeometry(width*.420,width*.104,6,12);
  cap.rotateX(Math.PI*.5);cap.translate(0,height*.532,0);k.geometry(jar,'deep',cap);
  return {jar,gauge};
}

function physician(k,entry,mobile){
  tint(k,{deep:0x212924,body:0x455044,edge:0xc7c5a1,trim:0x766341,glow:0xb2ef64});
  const body=hinge(k,k.root,'Physician hunched vertebrae',0,1.09,-.089);
  const head=hinge(k,body,'Physician herb respirator',0,.752,.261);
  const arms=[],robes=[],legs=[],canisters=[];
  solid(k,body,'body',[[0,-.306,-.09,.179,.187],[.02,-.106,-.102,.234,.217],[.012,.297,-.048,.318,.263],
    [0,.581,-.06,.313,.229],[0,.764,.093,.141,.129]],mobile,3.31,2.68);
  solid(k,head,'deep',[[0,-.188,-.062,.064,.102],[0,-.095,-.036,.103,.131],[.019,.06,-.05,.152,.141],
    [0,.194,-.081,.144,.137],[0,.289,-.12,.084,.089]],mobile,17.2);
  solid(k,head,'edge',[[0,.039,.116,.079,.143],[.009,.01,.244,.075,.115],[0,-.044,.327,.052,.087],
    [-.014,-.076,.428,.023,.051],[-.015,-.115,.451,.012,.014]],mobile,8.2,3.14);
  const hat=hinge(k,head,'Physician curved reed cap',0,.115,-.10);
  solid(k,hat,'body',[[0,-.041,-.038,.155,.176],[.009,.066,-.073,.226,.220],[.025,.149,-.099,.176,.187],
    [.064,.258,-.159,.111,.118],[.091,.345,-.262,.044,.054],[.069,.342,-.316,.004,.005]],mobile,13.13,2.65);
  for(const s of sides){
    const f=p=>mirror(s,p);
    const lens=f([[.061,.087,.158],[.134,.122,.123],[.178,.074,.088],[.154,.008,.124],[.091,-.015,.181],[.043,.026,.198]]);
    plate(k,head,'trim',lens,.045);
    k.mesh(head,'gem','deep',s*.108,.054,.186,.058,.046,.022,0,s*.47);
    k.mesh(head,'gem','glow',s*.116,.056,.207,.022,.019,.012,0,s*.47);
    line(k,head,'deep',f([[.083,-.026,.198,.009],[.041,-.061,.248,.014],[.059,-.076,.308,.011],
      [.032,-.123,.408,.004]]),mobile);
    const ruff=f([[.029,.656,.265],[.173,.689,.203],[.329,.671,-.024],[.374,.518,-.174],
      [.267,.448,-.119],[.149,.474,.123],[.044,.513,.303]]);
    plate(k,body,'deep',ruff,.052);
    line(k,body,'trim',ruff.slice(0,5).map(([x,y,z],i)=>[x,y+.019,z+.023,[.008,.021,.025,.017,.004][i]]),mobile);
    const shoulder=hinge(k,body,'Physician long bandage shoulder '+s,s*.238,.523,.061);
    const elbow=hinge(k,shoulder,'Physician bent sleeve elbow '+s,s*.075,-.294,.089);
    const hand=hinge(k,elbow,'Physician gloved hand '+s,s*.028,-.299,.10);
    solid(k,shoulder,'body',f([[0,.088,-.038,.083,.077],[.059,-.021,-.018,.128,.105],
      [.088,-.157,.035,.113,.094],[.08,-.281,.089,.083,.087]]),mobile,6.13);
    solid(k,elbow,'deep',f([[0,.052,-.031,.078,.072],[.027,-.058,.028,.097,.088],
      [.043,-.187,.076,.086,.072],[.03,-.29,.11,.061,.054]]),mobile,21.34);
    solid(k,hand,'trim',f([[0,.05,-.002,.045,.044],[.023,-.011,.045,.066,.058],[.034,-.087,.11,.033,.038]]),mobile,11.7);
    for(let latch=0;latch<3;latch++){
      const y=-.083-latch*.067;
      line(k,elbow,'edge',f([[-.052,y,.091,.009],[.024,y-.009,.124,.017],[.085,y-.014,.104,.010]]),mobile);
    }
    const hip=hinge(k,body,'Physician irregular step '+s,s*.106,-.262,-.09);
    solid(k,hip,'deep',f([[0,.039,-.043,.097,.097],[.022,-.267,-.073,.091,.092],
      [.021,-.62,.027,.072,.096],[.008,-.741,.123,.051,.074]]),mobile,16.4);
    for(let i=0;i<3;i++){
      const flap=hinge(k,body,'Physician oilskin coat pleat '+s+' '+i,s*(.134+i*.048),-.055,.15-i*.255);
      const coat=f([[-.086,.092,.007],[.082,.07,.012],[.138,-.301,.011],[.147,-.716+i*.03,-.061],
        [.068,-.924+i*.091,-.084],[-.076,-.842+i*.085,-.051],[-.092,-.398,.016]]);
      plate(k,flap,i%2?'deep':'body',coat,.039);
      line(k,flap,'trim',coat.slice(2,6).map(([x,y,z],n)=>[x,y,z+.027,[.004,.013,.016,.003][n]]),mobile);
      robes.push({flap,s,i});
    }
    const rack=hinge(k,body,'Physician triangular bottle rack '+s,s*.215,.378,-.421);
    plate(k,rack,'trim',f([[-.09,.296,.012],[.179,.252,-.057],[.207,.073,-.118],
      [.113,-.365,-.116],[-.088,-.282,-.087],[-.117,.019,-.005]]),.059);
    line(k,rack,'edge',f([[-.098,-.023,-.16,.011],[.073,.128,-.144,.026],[.171,.237,-.109,.010]]),mobile);
    canisters.push({...phial(k,rack,'Physician dorsal poison bottle '+s,[s*.055,.016,-.187],.10,.397,mobile),s});
    arms.push({shoulder,elbow,hand,s});
    legs.push({hip,s});
  }
  const cane=hinge(k,arms[1].hand,'Physician glass-crook cane',.035,-.035,.143);
  const hook=[[0,-.583,0,.036,.036],[.029,-.225,.005,.049,.046],[.039,.312,-.011,.049,.046],
    [.021,.664,-.022,.053,.043],[.122,.894,-.029,.06,.052],[.291,.867,-.034,.047,.043],[.340,.718,.026,.025,.017]];
  solid(k,cane,'trim',hook,mobile,13.4,2.81);
  line(k,cane,'edge',hook.slice(3).map(([x,y,z,r])=>[x,y+.022,z+.022,r*.32]),mobile);
  const toxin=phial(k,cane,'Physician swing tincture',[.267,.617,.028],.072,.272,mobile);
  markEnemyWeapon(cane,[.293,.895,.037],{width:.18});
  return {body,head,grounded:true,pattern:'duel',
    polishEnergy:{tint:entry.palette[3],shape:'mist',anchor:body,offset:[0,.335,-.515],span:[.73,.54,.56]},
    cataloguePose({step,beat,wind,strike,stage,travel,fall}){
      body.rotation.x=.24+travel*.102+wind*.13-strike*.36+fall*.42;
      head.rotation.set(-.15+Math.sin(beat*.57)*.048+strike*.251,Math.sin(beat*.38)*.212-strike*.30,wind*.08);
      for(const {shoulder,elbow,s} of arms){
        shoulder.rotation.set(-.12-wind*(s>0?1.18:.51)+strike*(s>0?1.54:.75),s*(.09+wind*.4-strike*.23),s*(.126+wind*.36));
        elbow.rotation.x=-.23-wind*.43+strike*.37;
      }
      for(const {hip,s} of legs)hip.rotation.x=Math.sin(step+s*Math.PI*.5)*travel*.41;
      for(const {flap,s,i} of robes)flap.rotation.x=Math.sin(beat*.56+i+s)*.095+travel*.13+strike*.29;
      for(const {jar,gauge,s} of canisters){
        jar.rotation.z=s*(Math.sin(beat*.77)*.131+strike*.31);
        gauge.scale.y=.63+wind*.29+stage*.28+strike*.53;
      }
      cane.rotation.set(-.15+wind*.42-strike*.19,wind*.37,-.28+strike*.77);
      toxin.jar.rotation.z=Math.sin(beat*.91)*.15+wind*.26-strike*.72;
      toxin.gauge.scale.y=.77+wind*.31+strike*.59;
    },
  };
}

function hatchlingNest(k,entry,mobile){
  tint(k,{deep:0x182923,body:0x3b6048,edge:0xaaad6c,trim:0x586b45,glow:0xb2fb80});
  const body=hinge(k,k.root,'Hatchery lower coil',0,.26,0);
  const neck=hinge(k,body,'Hatchery striking cervical joint',-.056,.232,.15);
  const head=hinge(k,neck,'Hatchery serpent head',.118,1.011,.354);
  const jaw=hinge(k,head,'Hatchery venom jaw',0,-.064,.094);
  const hood=[],eggs=[],tailJoints=[];
  const turns=mobile?22:30;
  const coil=[];
  for(let i=0;i<=turns;i++){
    const t=i/turns,a=t*Math.PI*3.71-.64;
    const r=.741-.401*t;
    coil.push([Math.sin(a)*r,.023+.197*t,-.021+Math.cos(a)*r,.172-.036*t,.195-.049*t]);
  }
  k.geometry(body,'body',sculptVolume(coil,{rings:mobile?34:47,sides:mobile?10:15,section:2.71,seed:3.42,ridge:.127}));
  for(let i=3;i<turns;i+=2){
    const [x,y,z]=coil[i],a=Math.atan2(x,z),next=coil[i+1];
    const ridge=hinge(k,body,'Hatchery imbricated coil',x,y+.149,z);ridge.rotation.y=a;
    plate(k,ridge,i%4===1?'deep':'trim',[[0,.044,.083],[.14,.016,.029],[.104,-.045,-.095],
      [0,-.061,-.137],[-.13,-.022,-.061],[-.143,.018,.011]],.034);
    if(next)line(k,body,'edge',[[x,y+.184,z,.008],[(x+next[0])*.517,(y+next[1])*.5+.181,(z+next[2])*.51,.021],
      [next[0],next[1]+.169,next[2],.004]],mobile);
  }
  solid(k,neck,'body',[[0,-.131,-.103,.125,.135],[.091,.02,-.106,.143,.142],
    [.157,.323,-.168,.125,.131],[.219,.635,-.031,.138,.124],[.143,.864,.205,.139,.118],[.119,1.006,.35,.113,.113]],
  mobile,16.4,2.58);
  solid(k,head,'body',[[0,.079,-.104,.101,.156],[0,.073,.003,.123,.161],
    [.015,.046,.168,.115,.147],[.02,-.019,.303,.066,.102],[-.007,-.045,.407,.029,.073]],
  mobile,5.17,3.13);
  solid(k,jaw,'edge',[[0,-.06,-.071,.057,.124],[.012,-.086,.012,.059,.131],
    [.012,-.067,.137,.047,.104],[0,-.039,.265,.017,.061]],mobile,13.77,2.66);
  for(const s of sides){
    const f=p=>mirror(s,p);
    const eye=f([[.057,.118,.204],[.121,.154,.128],[.168,.112,.055],[.144,.04,.107],[.09,.026,.192]]);
    plate(k,head,'deep',eye,.039);k.mesh(head,'gem','glow',s*.107,.09,.19,.032,.015,.034,0,s*.54);
    for(let fang=0;fang<4;fang++){
      const x=.109-fang*.014,z=.15+fang*.049;
      solid(k,head,'edge',f([[x,-.029,z,.018,.018],[x+.014,-.105+(fang%2)*.018,z+.016,.022,.017],
        [x,-.158+(fang%2)*.04,z+.051,.003,.005]]),true,14.1+fang);
    }
    for(let n=0;n<4;n++){
      const fin=hinge(k,neck,'Hatchery hood lamella '+s+' '+n,.091+s*.084,.882-n*.131,.197-n*.042);
      const w=.397-n*.057,h=.19+(.033*(n%2));
      const outline=f([[.011,h*.58,.123],[w*.48,h,.006],[w*.89,h*.72,-.151],[w*1.12,-.047,-.201],
        [w*.65,-.149,-.135],[w*.081,-.118,.073]]);
      plate(k,fin,n%2?'deep':'body',outline,.035);
      const edge=outline.slice(1,5).map(([x,y,z],i)=>[x,y,z+.034,[.006,.02,.017,.004][i]]);
      line(k,fin,'edge',edge,mobile);
      k.mesh(fin,'gem','trim',s*w*.66,-.016,-.099,.039,.041,.027);
      hood.push({fin,s,n});
    }
    for(let i=0;i<3;i++){
      const egg=hinge(k,body,'Hatchery split egg '+s+' '+i,s*(.31+i*.145),.131+i*.029,-.227-i*.131);
      solid(k,egg,'edge',[[0,-.105,0,.06,.071],[0,-.04,.004,.107,.094],[0,.071,-.025,.087,.088],
        [0,.157,-.046,.047,.056],[0,.189,-.049,.011,.017]],mobile,i+7.2,2.29);
      line(k,egg,'deep',f([[-.069,.087,.039,.005],[.021,.091,.067,.013],[.012,.022,.093,.015],
        [.054,.044,.078,.011],[.067,-.029,.065,.004]]),mobile);
      eggs.push({egg,s,i});
    }
  }
  for(let i=0;i<3;i++){
    const parent=i===0?body:tailJoints[i-1];
    const tail=hinge(k,parent,'Hatchery ridged tail hinge '+i,i===0?.41:.11,i===0?.093:.061,i===0?-.45:-.323);
    const r=.13-i*.026;
    solid(k,tail,'body',[[0,-.017,.091,r,r],[.048,.022,-.083,r,r*.94],
      [.089,.049,-.223,r*.82,r*.76],[.112,.063,-.323,i===2?.006:r*.81,i===2?.007:r*.83]],mobile,3.3+i);
    tailJoints.push(tail);
  }
  return {body,head,pattern:'coil',grounded:true,
    polishEnergy:{tint:entry.palette[3],shape:'ribbons',anchor:head,offset:[0,-.092,.462],span:[.67,.35,.58]},
    cataloguePose({beat,wind,strike,travel,headtime,stage,fall}){
      body.rotation.x=.055+wind*.098-strike*.29+fall*.52;
      neck.rotation.set(wind*.25-strike*.61,Math.sin(headtime*2)*.226+wind*.19-strike*.32,
        Math.sin(beat*.43)*.13+travel*.21);
      head.rotation.x=-wind*.17+strike*.38;
      jaw.rotation.x=.066+wind*.49+strike*.67;
      for(const {fin,s,n} of hood)fin.rotation.set(strike*.25,s*(.085+wind*.42-strike*.27),s*(stage*.069+wind*.22-n*.045));
      for(const {egg,s,i} of eggs)egg.rotation.z=s*(Math.sin(beat*.56+i)*.09+strike*.30+stage*.09);
      for(const [i,j] of tailJoints.entries())j.rotation.y=Math.sin(beat*.52+i*.59)*(.22+travel*.09)+wind*.22-strike*.30;
    },
  };
}

function skanda(k,entry,mobile){
  tint(k,{deep:0x202b2c,body:0x355c53,edge:0xc0b478,trim:0x806747,glow:0xd0ee6f});
  const body=hinge(k,k.root,'Skanda deep temple cuirass',0,1.09,.021);
  const head=hinge(k,body,'Skanda sculpted war crest',0,.826,.091);
  const arms=[],legs=[],plumes=[];
  solid(k,body,'deep',[[0,-.246,-.065,.204,.234],[0,.018,-.041,.309,.234],[0,.309,-.013,.384,.291],
    [0,.526,-.049,.411,.278],[.018,.692,-.016,.325,.202],[.009,.779,-.015,.166,.187]],mobile,11.35,2.94);
  solid(k,head,'trim',[[0,-.19,-.024,.077,.107],[0,-.103,.013,.113,.145],[.013,.046,-.049,.154,.152],
    [0,.188,-.064,.151,.134],[0,.269,-.094,.099,.105]],mobile,18.46,3.04);
  const crown=hinge(k,head,'Skanda plated pagoda crest',0,.187,-.101);
  solid(k,crown,'body',[[0,-.035,.041,.153,.146],[0,.054,.022,.193,.174],[0,.184,-.043,.155,.142],
    [.006,.259,-.083,.117,.119],[.011,.39,-.11,.081,.085],[.013,.487,-.177,.029,.044]],mobile,7.2,3.11);
  for(let row=0;row<4;row++){
    const y=.089+row*.096,w=.169-row*.031;
    plate(k,crown,row%2?'edge':'trim',[[-w,y-.027,.134],[0,y+.038,.167],[w,y-.017,.134],
      [w*.69,y-.058,.142],[0,y-.061,.178],[-w*.63,y-.059,.145]],.027);
  }
  k.mesh(crown,'gem','glow',0,.229,.189,.047,.074,.035,0,0,.19);
  for(const s of sides){
    const f=p=>mirror(s,p);
    const cheek=f([[.036,.139,.165],[.147,.156,.118],[.187,.071,.061],[.153,-.047,.128],
      [.096,-.164,.203],[.048,-.201,.183],[.039,-.097,.249]]);
    plate(k,head,'edge',cheek,.049);
    line(k,head,'trim',cheek.slice(1,6).map(([x,y,z],i)=>[x,y,z+.038,[.02,.025,.019,.012,.004][i]]),mobile);
    plate(k,head,'deep',f([[.043,.074,.231],[.127,.107,.187],[.145,.058,.184],[.114,-.009,.223],[.064,.012,.253]]),.022);
    k.mesh(head,'gem','glow',s*.103,.046,.242,.027,.013,.017,0,s*.41,s*.39);
    const pec=f([[.042,.659,.304],[.243,.682,.238],[.451,.592,.06],[.408,.381,.149],
      [.315,.267,.236],[.101,.286,.343],[.023,.383,.364]]);
    plate(k,body,'body',pec,.083);
    line(k,body,'trim',pec.map(([x,y,z],i)=>[x,y+.022,z+.036,[.012,.026,.033,.023,.013,.009,.005][i]]),mobile);
    for(let row=0;row<4;row++){
      const y=.292-row*.126,z=.299+row*.017,w=.10+Math.sin(row*.74)*.11;
      const armor=f([[.038,y+.046,z+.027],[w*.91,y+.072,z+.012],[w*1.46,y+.034,z-.028],
        [w*1.38,y-.051,z-.006],[w*.47,y-.094,z+.068],[.025,y-.07,z+.075]]);
      plate(k,body,row%2?'body':'trim',armor,.039);
      k.mesh(body,'gem','edge',s*w*.64,y-.012,z+.06,.024,.028,.017);
    }
    const shoulder=hinge(k,body,'Skanda peacock pauldron '+s,s*.384,.503,.047);
    const elbow=hinge(k,shoulder,'Skanda gauntlet turn '+s,s*.092,-.298,.074);
    const hand=hinge(k,elbow,'Skanda armored kukri grip '+s,s*.042,-.319,.071);
    solid(k,shoulder,'deep',f([[0,.111,-.052,.082,.088],[.064,.012,-.028,.134,.144],
      [.103,-.126,.011,.132,.116],[.091,-.297,.059,.092,.094]]),mobile,22.2);
    const shoulderLoop=f([[-.042,.124,.13],[.121,.239,.159],[.268,.213,.079],[.336,.31,-.042],
      [.327,.029,-.168],[.247,-.119,-.091],[.112,-.172,.094],[.021,-.087,.177]]);
    plate(k,shoulder,s<0?'body':'trim',shoulderLoop,.071);
    line(k,shoulder,'edge',shoulderLoop.slice(0,6).map(([x,y,z],i)=>[x,y+.024,z+.046,[.006,.020,.027,.03,.015,.004][i]]),mobile);
    solid(k,elbow,'body',f([[0,.048,.005,.091,.077],[.062,-.05,.046,.116,.096],
      [.063,-.19,.101,.117,.103],[.045,-.303,.128,.064,.069]]),mobile,7.5,2.81);
    const knuckles=f([[-.061,-.042,.121],[.043,-.002,.172],[.132,-.053,.185],[.139,-.162,.166],
      [.045,-.243,.197],[-.056,-.218,.183]]);
    plate(k,elbow,'edge',knuckles,.047);
    solid(k,hand,'trim',f([[0,.072,.01,.074,.059],[.006,.019,.055,.091,.071],[.034,-.063,.102,.058,.049],
      [.026,-.098,.11,.042,.042]]),mobile,14.4);
    const hip=hinge(k,body,'Skanda hip tread '+s,s*.185,-.264,-.018);
    const knee=hinge(k,hip,'Skanda plated shin '+s,s*.013,-.351,-.042);
    solid(k,hip,'deep',f([[0,.083,-.052,.128,.119],[.012,-.077,.002,.145,.139],
      [.038,-.203,-.039,.112,.117],[.021,-.35,-.048,.096,.101]]),mobile,7.33,2.62);
    solid(k,knee,'body',f([[0,.061,.006,.106,.100],[.022,-.168,.024,.121,.116],
      [.036,-.342,.085,.133,.112],[.029,-.373,.213,.144,.061]]),mobile,10.26,2.97);
    const kneeShield=f([[-.103,.064,.098],[.078,.091,.101],[.147,-.04,.062],[.091,-.226,.131],
      [.007,-.288,.163],[-.092,-.222,.141]]);
    plate(k,knee,'trim',kneeShield,.05);
    const knife=hinge(k,hand,'Skanda reversed kukri '+s,s*.035,-.055,.164);
    solid(k,knife,'deep',[[0,-.258,0,.033,.038],[0,-.027,.013,.039,.041],[s*.034,.163,.027,.035,.038]],mobile,6.4);
    const blade=f([[-.049,.14,.025],[.073,.15,.006],[.106,.314,.026],[.325,.426,.058],
      [.452,.31,.087],[.514,.137,.103],[.372,.201,.087],[.213,.246,.069],[.104,.226,.042],[-.032,.184,.042]]);
    plate(k,knife,'body',blade,.074);
    plate(k,knife,'edge',blade.slice(2,9).map(([x,y,z],i)=>[x*.961,y-.021,z+.044+Math.sin(i*.88)*.01]),.033);
    line(k,knife,'glow',f([[.093,.233,.073,.009],[.205,.318,.103,.013],[.332,.367,.122,.018],
      [.408,.289,.129,.012],[.477,.171,.131,.004]]),mobile);
    markEnemyWeapon(knife,[s*.502,.148,.107],{width:.16,aim:s>0});
    arms.push({shoulder,elbow,hand,knife,s});
    legs.push({hip,knee,s});
    for(let i=0;i<4;i++){
      const j=hinge(k,body,'Skanda hinged peacock tasset '+s+' '+i,s*(.146+i*.078),.584-i*.104,-.372-i*.052);
      const start=[0,.014,.02],mid=[s*(.272+i*.047),.303-i*.085,-.155],end=[s*(.496+i*.083),.608-i*.119,-.491-i*.034];
      k.geometry(j,i%2?'trim':'body',featherVane(start,mid,end,.126+i*.01,17.2+i*.63,mobile?8:12));
      line(k,j,'edge',[[0,.028,-.006,.009],[mid[0],mid[1],mid[2]-.028,.026],
        [end[0]*.88,end[1]*.87,end[2]-.029,.012],[end[0],end[1],end[2]-.024,.004]],mobile);
      k.mesh(j,'gem','deep',mid[0]*1.16,mid[1]*1.20,mid[2]-.131,.067,.105,.027,0,s*.48,s*.32);
      k.mesh(j,'gem','glow',mid[0]*1.16,mid[1]*1.20,mid[2]-.155,.032,.058,.011,0,s*.48,s*.32);
      plumes.push({j,s,i});
    }
  }
  return {body,head,pattern:'duel',grounded:true,
    polishEnergy:{tint:entry.palette[3],shape:'sigils',anchor:body,offset:[0,.63,-.431],span:[.83,.73,.38]},
    cataloguePose({beat,wind,strike,stage,travel,step,fall}){
      body.rotation.set(wind*.097-strike*.30+fall*.512,stage*.085+wind*.14-strike*.36,travel*Math.sin(step)*.065);
      head.rotation.y=Math.sin(beat*.47)*.133-wind*.23+strike*.30;
      for(const {shoulder,elbow,hand,knife,s} of arms){
        shoulder.rotation.set(-.11+Math.sin(step+s*Math.PI*.5)*travel*.36-wind*(s>0?.96:.43)+strike*(s>0?1.21:.78),
          s*(.14+wind*.48-strike*.36),s*(.26+wind*.41-strike*.22));
        elbow.rotation.x=-.28-wind*.71+strike*.67;
        hand.rotation.z=s*(.11+wind*.26-strike*.66);
        knife.rotation.y=s*(.15+wind*.31-strike*.59);
      }
      for(const {hip,knee,s} of legs){
        const stride=Math.sin(step+s*Math.PI*.5)*travel;
        hip.rotation.x=stride*.55+wind*.12-strike*.18;
        knee.rotation.x=-Math.max(0,stride)*.62+strike*.09;
      }
      for(const {j,s,i} of plumes)j.rotation.set(Math.sin(beat*.51+i*.49)*.11+strike*.39,
        s*(.10+wind*.41-strike*.67),s*(stage*.197+wind*.35-strike*.14));
    },
  };
}

const hunters={
  'venom-cane':physician,
  snake:hatchlingNest,
  'skanda-kukri':skanda,
};

export function venomRelicHunter(k,entry,weapon,mobile){
  const build=hunters[weapon?.id];
  if(!build)return null;
  const parts=build(k,entry,mobile);
  return {...parts,crest:k.bone(parts.body,0,0,0),venomHunter:true,catalogueSculpt:entry.id};
}
