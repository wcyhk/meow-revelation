import * as T from '../three.min.mjs';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2,flanks=[-1,1];
const volume=(k,j,m,s,detail=16,section=2.18,ridge=.14,fur=false)=>k.geometry(j,m,
  sculptVolume(s,{rings:detail,sides:Math.max(8,detail-4),section,ridge,fur}));
const sweep=(k,j,m,p,n=12,r=7)=>k.sculpt.sweep(j,m,p,{steps:n,sides:r,ridge:.20});
const plate=(k,j,m,p,depth=.043,bevel=.013)=>k.sculpt.plate(j,m,p,depth,bevel);
const vane=(k,j,m,a,b,c,w,seed)=>k.geometry(j,m,featherVane(a,b,c,w,seed,12));
function rim(k,j,m,r,t,z=0){
  const g=new T.TorusGeometry(r,t,6,28);g.translate(0,0,z);k.geometry(j,m,g);
}

function sourcePose(entry,body,head,extras,pattern){
  return {body,head,crest:new T.Group(),catalogueSculpt:entry.id,cataloguePose:extras,pattern};
}

const metals={
  steel:[0x89a9b4,.65,.41,'iron'],brass:[0xb69857,.58,.45,'bronze'],
  black:[0x272633,.55,.49,'iron'],ivory:[0xaab2a6,.18,.57,'bone'],
  jade:[0x456754,.32,.56,'iron'],dusk:[0x24204c,.12,.62,'cloth'],
  red:[0x91352e,.13,.59,'cloth'],skin:[0x967060,.08,.71,'hide'],
  cobalt:[0x34475f,.44,.48,'iron'],ochre:[0x785747,.30,.62,'bronze'],
  teal:[0x315b60,.16,.65,'hide'],lilac:[0x8c7b98,.11,.68,'cloth'],
  clay:[0x9a3f20,.28,.62,'hide'],moss:[0x465638,.25,.64,'hide'],
};

function humanoid(k,descriptor){
  const {torso,waist,neck,skin='skin',shell='body',skirt='deep',facing=.14,boot='black',width=.34,mask='ivory',
    height=1.17,edge='brass',dress=0,robe=0,teeth=false,hair='black',rear='deep',collar=0}=descriptor;
  const body=k.bone(k.root,0,height,0),head=k.bone(body,0,neck,facing);
  volume(k,body,shell,[
    [0,-.44,-.048,waist*.86,waist*.67],[0,-.23,-.025,waist,.24],[0,.023,.012,torso[0],torso[3]*.92],
    [0,neck*.31,-.012,torso[1],torso[3]],[0,neck*.72,-.056,torso[2],torso[3]*.78],
    [0,neck*.91,-.048,torso[0]*.53,torso[3]*.65],
  ],23,2.32,.19);
  volume(k,head,skin,[[0,-.159,.015,width*.36,.081],[0,-.060,.01,width*.485,.127],
    [0,.09,-.014,width*.545,.149],[0,.189,-.044,width*.478,.126],[0,.235,-.062,width*.36,.09]],19,2.62,.18);
  volume(k,head,hair,[[0,-.102,-.102,width*.43,.096],[0,.056,-.137,width*.58,.103],
    [0,.186,-.094,width*.53,.135],[0,.282,-.065,width*.40,.112]],16,2.25,.27,true);
  const jaw=k.bone(head,0,-.12,.088);
  volume(k,jaw,skin,[[0,-.039,.023,width*.30,.039],[0,.012,.040,width*.36,.051],[0,.049,.023,width*.42,.053]],12,2.84);
  if(teeth)for(let i=-3;i<=3;i++)sweep(k,jaw,mask,[[i*.028,.022,.080,.010],[i*.028,.056,.087,.010],
    [i*.031,.075+.015*(Math.abs(i)/3),.074,.001]],6,5);
  const limbs=[],skirts=[];
  const cloak=k.bone(body,0,neck*.69,-torso[3]*.8);
  if(robe){
    for(let i=-4;i<=4;i++){
      const angle=PI+i*.27,tip=robe*(.82+.19*Math.cos(i*.61));
      const flap=k.bone(cloak,Math.sin(angle)*.29,.01,.033+Math.cos(angle)*.054);
      flap.rotation.y=i*.15;
      plate(k,flap,i%3?rear:skirt,[[-.083,.033,.002],[.106,.07,-.007],
        [.163,-.29,-.124],[.135,-tip*.68,-.30],[.089,-tip,-.314],[.022,-tip*.9,-.326],[-.09,-tip*.98,-.32],
        [-.159,-tip*.74,-.294],[-.146,-.34,-.158]],.045,.010);
      sweep(k,flap,i%2?edge:shell,[[.035,.061,-.02,.019],[.06,-.38,-.189,.012],
        [.057,-tip*.81,-.339,.012],[.038,-tip,-.34,.003]],11,6);
      skirts.push(flap);
    }
  }
  if(dress){
    for(let i=0;i<10;i++){
      const flap=k.bone(body,0,-.14,0);
      flap.rotation.y=TAU*i/10;
      const length=dress*(.86+.14*Math.cos(i*2.32));
      const r=waist+.051;
      plate(k,flap,i%3===1?rear:skirt,[[-.10,.065,r],[.125,.067,r],[.173,-.36,r+.049],
        [.181,-length*.91,r+.135],[.098,-length*.88,r+.139],[.027,-length,r+.155],
        [-.145,-length*.93,r+.131],[-.18,-.48,r+.068]],.055,.010);
      sweep(k,flap,i%2?edge:shell,[[.094,.031,r+.041,.015],[.142,-.312,r+.072,.016],
        [.154,-length*.76,r+.149,.010],[.087,-length*.923,r+.172,.003]],10,6);
      skirts.push(flap);
    }
  }
  for(const side of flanks){
    const f=x=>x*side,y=neck*.65;
    const shoulder=k.bone(body,f(torso[2]*.87),y,-.014);
    const elbow=k.bone(shoulder,f(.145),-.32,.014);
    const wrist=k.bone(elbow,f(.025),-.338,.054);
    const leg=k.bone(body,f(waist*.55),-.31,-.043);
    const knee=k.bone(leg,f(.026),-.394,-.061);
    volume(k,shoulder,shell,[[0,.071,0,.139,.117],[f(.093),-.071,-.016,.168,.147],
      [f(.125),-.211,.004,.132,.110],[f(.153),-.333,.008,.104,.095]],15,2.21,.23);
    volume(k,elbow,shell,[[0,.033,0,.106,.105],[f(.034),-.079,.018,.142,.132],
      [f(.034),-.229,.015,.117,.099],[f(.025),-.334,.054,.071,.071]],15,2.30,.22);
    volume(k,wrist,skin,[[0,.040,0,.061,.065],[0,-.016,.016,.095,.088],
      [f(.014),-.100,.085,.074,.050]],11,2.38,.19);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.037;
      sweep(k,wrist,i===1?skin:edge,[[x,.015,.018,.023],[x,-.046,.092,.026],[x,-.098,.113,.020]],8,6);
    }
    volume(k,leg,skirt,[[0,.07,0,.134,.13],[f(.013),-.106,.019,.153,.139],
      [f(.024),-.297,-.035,.127,.121],[f(.031),-.431,-.063,.100,.119]],14,2.4,.19);
    volume(k,knee,boot,[[0,.052,0,.113,.12],[0,-.16,0,.108,.102],[f(.013),-.28,.07,.116,.111],
      [f(.017),-.306,.192,.135,.064],[f(.013),-.308,.242,.084,.038]],15,2.8,.15);
    for(let i=0;i<3;i++){
      const b=k.bone(elbow,f(.027),-.166-i*.067,.034);
      b.rotation.x=PI/2;
      rim(k,b,i===1?shell:edge,.119-i*.009,.016);
      plate(k,shoulder,i===0?edge:shell,[[f(.028),.142-i*.078,-.108],
        [f(.186+i*.017),.147-i*.075,-.074],[f(.231+i*.016),.017-i*.068,.056],
        [f(.12),-.048-i*.073,.148],[f(.002),-.015-i*.074,.105]],.045,.012);
    }
    sweep(k,head,hair,[[f(.073),.103,.161,.018],[f(.104),.123,.154,.023],
      [f(.158),.125,.083,.016],[f(.165),.098,.049,.005]],11,6);
    k.mesh(head,'gem','deep',f(.091),.051,.144,.050,.038,.028,0,f(.31),-f(.22));
    k.mesh(head,'gem','glow',f(.092),.051,.170,.032,.013,.018,0,f(.31),-f(.22));
    for(let i=0;i<3;i++){
      const arch=collar+i*.022;
      if(collar)sweep(k,body,edge,[[f(.081),neck*.74+i*.020,.186,.021],
        [f(.25),neck*.82+arch*.26,.143,.032],[f(.421),neck*(.77+i*.043)+arch*.36,-.09,.023],
        [f(.426),neck*.74+arch*.16,-.193,.003]],11,6);
    }
    limbs.push({shoulder,elbow,wrist,leg,knee,side});
  }
  return {body,head,jaw,limbs,skirts,cloak};
}

function poseHumanoid(rig,{beat,step,wind,strike,travel},motion={}){
  for(const {side,shoulder,elbow,wrist,leg,knee} of rig.limbs){
    const stride=Math.sin(step+side*PI*.5)*travel;
    shoulder.rotation.x=-.13+stride*.31-wind*(side>0?(motion.gather??.81):.54)+strike*(side>0?(motion.swing??.89):.47);
    shoulder.rotation.z=side*(.08+(motion.spread??.11)+wind*.29-strike*.13);
    elbow.rotation.x=-.43+Math.abs(stride)*.22+wind*.44-strike*.41;
    wrist.rotation.y=side*(.093+wind*.19-strike*.22);
    leg.rotation.x=-.07+stride*.26-wind*.072+strike*.19;
    knee.rotation.x=Math.max(0,-stride)*.45+wind*.07;
  }
  for(const [i,flap] of rig.skirts.entries()){
    flap.rotation.x=Math.sin(beat*.67+i*.54)*(.047+travel*.055)+strike*.32;
    flap.rotation.z=Math.sin(beat*.70+i*.79)*(.066+travel*.06)+wind*.055;
  }
  rig.jaw.rotation.x=.06+wind*.16+strike*.33;
  rig.head.rotation.x=-wind*.14+strike*.29;
  rig.head.rotation.y=Math.sin(beat*.54)*.086-wind*.19+strike*.15;
  rig.cloak.rotation.x=travel*.24+strike*.26;
}

function solidBlade(k,j,h,wide,kind,edge='steel',shaft='black'){
  if(kind==='axe'){
    sweep(k,j,shaft,[[0,-.87,0,.06],[0,-.38,.025,.064],[0,.35,0,.06],[0,h-.19,-.017,.076]],17,8);
    plate(k,j,edge,[[0,h,0],[wide*.72,h+.28,-.06],[wide*1.51,h+.25,.015],[wide*1.59,h-.062,.02],
      [wide*1.32,h-.35,.08],[wide*.93,h-.38,.128],[wide*.64,h-.22,.092],[0,h-.1,.01]],.079,.022);
    plate(k,j,shaft,[[0,h,0],[-wide*.47,h+.01,.065],[-wide*.74,h+.137,.04],[-wide*.88,h-.181,.10],
      [-wide*.307,h-.23,.062],[0,h-.113,.089]],.085,.018);
    for(let i=0;i<4;i++)sweep(k,j,'glow',[[wide*(.4+i*.23),h-.07,.071,.018],
      [wide*(.55+i*.22),h+.103,.074,.015],[wide*(.59+i*.28),h+.18,.071,.003]],8,6);
    return;
  }
  if(kind==='lance'){
    sweep(k,j,shaft,[[0,-1.07,0,.031],[0,-.18,0,.042],[0,.57,.016,.039],[0,h-.15,-.024,.054]],19,8);
    plate(k,j,edge,[[-wide*.82,h-.19,-.026],[-wide,h-.04,-.019],[-wide*.21,h+.22,-.06],
      [.004,h+.36,-.10],[wide*.47,h+.094,-.03],[wide*.85,h-.01,.023],[wide*.37,h-.183,.012]],.076,.018);
    for(const side of flanks)sweep(k,j,'brass',[[0,h-.193,.034,.03],[side*wide*.63,h-.111,.035,.021],
      [side*wide*.91,h+.04,-.001,.004]],9,6);
    return;
  }
  const curved=kind==='sabre',x=curved?wide*.78:0;
  sweep(k,j,shaft,[[0,-.32,0,.046],[0,-.14,0,.057],[0,.05,0,.051],[0,.172,.02,.049]],10,8);
  plate(k,j,edge,[[-wide,.161,.016],[wide*.95,.17,.016],[wide*.91+x*.21,h*.46,-.035],
    [wide*.84+x*.69,h*.79,-.104],[x+wide*.25,h+.156,-.128],[x-wide*.4,h+.066,-.13],
    [-wide+x*.56,h*.68,-.074],[-wide+x*.14,h*.31,-.01]],.075,.018);
  sweep(k,j,'brass',[[-wide*1.77,.147,.018,.036],[-wide*.77,.201,.04,.041],[wide*1.32,.146,.029,.040],
    [wide*1.58,.166,.051,.007]],10,7);
  sweep(k,j,'glow',[[0,.204,.055,.021],[x*.12,h*.36,.049,.019],
    [x*.57,h*.76,-.036,.014],[x+wide*.23,h+.124,-.05,.003]],13,6);
}

function ritualPole(k,j,height,mark,tip='ivory'){
  sweep(k,j,'black',[[0,-.81,0,.040],[0,-.37,0,.047],[0,.37,.026,.043],
    [0,height-.05,.04,.053]],16,8);
  for(let i=0;i<7;i++)k.mesh(j,'ring',i%2?'brass':'ochre',0,.08+i*.105,.019,.052,.051,.6,PI/2);
  rim(k,j,tip,.104,.021,.062);
  mark(k,k.bone(j,0,height,.043),tip);
}

function hiddenHalo(k,body,y,z,r,finish,points,tilt=0){
  const base=k.bone(body,0,y,z),joints=[];
  base.rotation.x=tilt;
  rim(k,base,finish,r,.018);
  for(let i=0;i<points;i++){
    const a=i*TAU/points;
    const part=k.bone(base,Math.cos(a)*r,Math.sin(a)*r,.026);
    part.rotation.z=a+PI*.5;
    k.mesh(part,'gem','glow',0,0,0,.056,.087,.043);
    plate(k,part,finish,[[-.067,-.056,-.002],[.061,-.055,.009],[.085,.056,.005],
      [-.01,.153,-.02],[-.081,.037,-.006]],.036,.009);
    joints.push(part);
  }
  return {base,joints};
}

function ironOni(k,entry){
  const rig=humanoid(k,{torso:[.46,.61,.59,.32],waist:.43,neck:.71,skin:'teal',shell:'teal',
    skirt:'teal',height:1.04,width:.48,edge:'ochre',hair:'ochre',teeth:true});
  const {body,head}=rig;
  sweep(k,head,'ivory',[[0,.176,.136,.09],[-.005,.265,.140,.075],[-.033,.399,.104,.043],
    [-.059,.513,.025,.003]],15,9);
  for(const side of flanks){
    for(let i=0;i<5;i++){
      const x=side*(.054+i*.03);
      sweep(k,head,'ochre',[[x,.159,.091,.039],[x*1.29,.29,-.04,.049],
        [x*1.48,.375+i*.012,-.183,.038],[x*1.24,.301,-.27,.005]],12,7);
    }
    const buckle=k.bone(body,side*.35,.085,.246);
    buckle.rotation.y=side*.45;
    rim(k,buckle,'brass',.126,.038);
    rim(k,buckle,'black',.087,.014,.025);
  }
  for(let i=0;i<13;i++){
    const a=TAU*i/13;const joint=k.bone(body,0,-.082,0);joint.rotation.y=a;
    const r=.433+.037*Math.sin(i*.7);
    plate(k,joint,i%2?'ochre':'brass',[[.09,0,r],[-.101,0,r],[-.113,-.175,r+.034],
      [-.021,-.251,r+.06],[.103,-.188,r+.034]],.047,.014);
    sweep(k,joint,'black',[[.014,-.014,r+.041,.015],[.018,-.109,r+.06,.016],[-.009,-.236,r+.091,.003]],7,6);
  }
  const club=k.bone(rig.limbs[0].wrist,0,-.06,.081);
  volume(k,club,'ochre',[[0,-.15,0,.065,.056],[0,.12,0,.069,.073],[-.026,.31,.01,.123,.118],
    [-.045,.71,-.053,.181,.145],[-.034,.88,-.08,.131,.107]],17,3.02,.31);
  for(let i=0;i<7;i++){
    const a=TAU*i/7;
    sweep(k,club,'brass',[[Math.sin(a)*.11,.47,Math.cos(a)*.11,.041],
      [Math.sin(a)*.18,.62,Math.cos(a)*.19,.048],[Math.sin(a)*.25,.62,Math.cos(a)*.27,.004]],10,7);
  }
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:1.1,swing:.68,spread:.24});
    rig.limbs[0].shoulder.rotation.x=-.19-pose.wind*1.21+pose.strike*1.07;
    club.rotation.x=-.31-pose.wind*.35+pose.strike*.23;
  },'slam');
}

function bandit(k,entry){
  const rig=humanoid(k,{torso:[.28,.315,.39,.21],waist:.27,neck:.89,
    shell:'jade',skirt:'dusk',rear:'ochre',height:1.12,hair:'black',edge:'red',robe:.46,dress:.58});
  const {body,head}=rig;
  const hat=k.bone(head,0,.234,-.038);
  const crown=new T.LatheGeometry([[0,-.01],[.286,-.01],[.31,.015],[.29,.057],[.131,.065],
    [.131,.181],[.096,.225],[0,.231]].map(v=>new T.Vector2(...v)),30);
  k.geometry(hat,'ochre',crown);
  const brim=k.bone(hat,0,.035,0);brim.rotation.x=PI/2;
  rim(k,brim,'black',.287,.014);rim(k,brim,'steel',.128,.016,.051);
  for(const side of flanks){
    const f=x=>x*side;
    sweep(k,head,'black',[[f(.045),-.044,.169,.017],[f(.127),-.065,.164,.027],
      [f(.179),-.096,.087,.021],[f(.172),-.126,.03,.003]],9,6);
    plate(k,body,side===1?'black':'ochre',[[f(.049),.57,.198],[f(.318),.614,.124],
      [f(.328),.229,.191],[f(.187),.093,.253],[f(.07),.251,.265]],.032,.012);
  }
  sweep(k,body,'red',[[-.27,.656,.105,.036],[-.063,.46,.241,.039],[.108,.241,.258,.038],
    [.296,.019,.141,.033]],15,7);
  const blade=k.bone(rig.limbs[1].wrist,.026,-.024,.069);solidBlade(k,blade,1.31,.069,'lance','steel','ochre');
  const ribbon=k.bone(body,-.239,-.022,-.07);
  for(let i=0;i<4;i++)vane(k,ribbon,i%2?'red':'ochre',[-.027,.004,.034],[-.13,-.18,-.06],
    [-.22-i*.041,-.46,-.13+i*.027],.045,12+i);
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:.67,swing:1.1});
    blade.rotation.set(.59+pose.wind*.39-pose.strike*.86,.33,-1.15-pose.wind*.55+pose.strike*.38);
    ribbon.rotation.x=pose.travel*.43+Math.sin(pose.beat*1.19)*.173+pose.strike*.38;
  },'duel');
}

function auspiciousPoleA(k,j,tip){
  rim(k,j,'brass',.229,.027,.039);
  for(let i=0;i<7;i++){
    const f=k.bone(j,0,0,0);f.rotation.z=i*TAU/7;
    plate(k,f,tip,[[0,.058,.064],[-.093,.198,.033],[-.055,.386,.05],[.018,.299,.066],
      [.065,.177,.039]],.036,.009);
  }
  k.mesh(j,'gem','glow',0,0,.029,.099,.123,.084);
}
function auspiciousPoleB(k,j,tip){
  for(const side of flanks)sweep(k,j,tip,[[0,-.062,.019,.052],[side*.136,.019,.042,.055],
    [side*.267,.141,-.064,.047],[side*.278,.289,-.067,.023],[side*.219,.362,-.083,.003]],15,8);
  k.mesh(j,'gem','glow',0,.161,.027,.09,.112,.082);rim(k,j,'brass',.151,.021,.037);
}

function woodSpirit(k,entry){
  const rig=humanoid(k,{torso:[.27,.327,.31,.16],waist:.28,neck:.92,shell:'jade',
    skirt:'dusk',rear:'teal',robe:1.36,dress:.96,hair:'black',collar:.28});
  const {body,head}=rig;
  for(const side of flanks){
    const f=x=>x*side;
    for(let i=0;i<4;i++){
      sweep(k,head,i%2?'brass':'jade',[[f(.07),.153,.041,.043],
        [f(.147+i*.053),.27+i*.048,-.053,.043],[f(.213+i*.070),.38+i*.054,-.21,.019],
        [f(.236+i*.074),.503+i*.058,-.27,.002]],13,7);
      vane(k,head,'jade',[f(.086),.10,-.04],[f(.239+i*.023),.084-i*.15,-.2],
        [f(.43+i*.031),-.264-i*.10,-.39],.077,5+i);
    }
  }
  const root=k.bone(rig.limbs[1].wrist,0,-.055,.049);
  solidBlade(k,root,1.17,.161,'sabre','jade','steel');
  const seal=k.bone(body,0,-.388,0);
  seal.rotation.x=PI/2;seal.scale.set(1,.82,1);
  rim(k,seal,'steel',.67,.035);rim(k,seal,'jade',.713,.018,-.025);
  for(let i=0;i<9;i++)k.mesh(seal,'gem','glow',Math.cos(i*TAU/9)*.655,
    Math.sin(i*TAU/9)*.654,.035,.038,.078,.022,0,0,i*TAU/9);
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:.83,swing:1.32,spread:.24});
    root.rotation.set(.37-pose.wind*.54+pose.strike*.70,.23,-1.13+pose.wind*.63-pose.strike*.31);
    seal.rotation.z=pose.headtime*.63;
    seal.scale.setScalar(.84+pose.wind*.19+pose.strike*.35);
  },'hover');
}

const constellations={
  m010:{torso:[.27,.37,.42,.22],dress:1.14,shell:'jade',skirt:'jade',rear:'black',edge:'brass',
    head:'crown',pose:[.95,.72,1.3],gear:'censer'},
  m011:{torso:[.35,.48,.49,.29],dress:.79,shell:'skin',skirt:'ochre',rear:'red',edge:'brass',
    head:'tie',pose:[1.16,1.34,.83],gear:'axe'},
  m012:{torso:[.26,.34,.38,.21],dress:.95,shell:'cobalt',skirt:'dusk',rear:'cobalt',edge:'steel',
    head:'white',pose:[.61,.77,.67],gear:'arrow'},
  m013:{torso:[.25,.295,.34,.20],dress:1.26,shell:'red',skirt:'ivory',rear:'brass',edge:'brass',
    head:'circlet',pose:[.72,.83,1.04],gear:'halo'},
};
function constellation(k,entry){
  const a=constellations[entry.id];
  const rig=humanoid(k,{...a,waist:a.torso[0],neck:.88,collar:.26,robe:a.dress*.81,hair:a.head==='white'?'ivory':'black'});
  const {body,head}=rig,crown=k.bone(head,0,.18,-.04);
  const hand=k.bone(rig.limbs[1].wrist,.021,-.033,.047);
  let aura=null;
  for(const side of flanks){
    const f=x=>x*side;
    if(a.head==='crown'||a.head==='circlet')for(let i=0;i<3;i++){
      const wide=a.head==='crown'?1:.69;
      sweep(k,crown,'brass',[[f(.05+i*.032),.014,.051,.033],
        [f((.132+i*.025)*wide),.081+i*.058,-.023,.039],
        [f((.135+i*.055)*wide),.193+i*.085,-.111,.004]],13,8);
    }else if(a.head==='tie'){
      for(let i=0;i<5;i++)sweep(k,crown,i%2?'steel':'ivory',[[f(.024+i*.036),.078,.092,.045],
        [f(.045+i*.033),.159,.01,.052],[f(.081+i*.031),.136,-.146,.035],
        [f(.153+i*.029),.08,-.203,.004]],11,7);
    }else for(let i=0;i<5;i++){
      vane(k,crown,'ivory',[f(.05),.083,.04],[f(.21+i*.021),-.133-i*.064,-.109],
        [f(.301+i*.024),-.339-i*.067,-.31],.092,26+i);
    }
    for(let i=0;i<3;i++){
      plate(k,body,i%2?a.edge:a.shell,[[f(.067),.492-i*.091,.257],
        [f(.231),.568-i*.135,.193],[f(.327),.469-i*.138,.113],[f(.235),.331-i*.082,.201],
        [f(.095),.345-i*.086,.27]],.039,.012);
    }
  }
  if(a.gear==='censer'){
    ritualPole(k,hand,1.26,auspiciousPoleB,'ivory');
    aura=hiddenHalo(k,body,-.28,.001,.716,'jade',11,PI/2);
  }else if(a.gear==='axe'){
    solidBlade(k,hand,1.14,.363,'axe','red','black');
    const back=k.bone(body,0,.46,-.18);
    for(let i=-2;i<=2;i++)plate(k,back,'ochre',[[i*.12,-.037,-.112],[i*.11,.092,-.10],
      [i*.12,.351,-.067],[i*.15,.393,-.071],[i*.12,.114,-.153]],.045,.015);
  }else if(a.gear==='arrow'){
    solidBlade(k,hand,1.26,.071,'lance','cobalt');
    const fins=k.bone(body,0,.18,-.22);
    for(const side of flanks)for(let i=0;i<5;i++)vane(k,fins,i%2?'cobalt':'steel',
      [side*.155,.17-i*.14,-.07],[side*.33,.2-i*.19,-.15],
      [side*(.72-i*.049),.294-i*.234,-.38],.058,22+i);
  }else{
    aura=hiddenHalo(k,body,.84,-.26,.681,'brass',9,.07);
    spiralFans(k,hand);
  }
  return sourcePose(entry,body,head,pose=>{
    const [gather,swing,spin]=a.pose;
    poseHumanoid(rig,pose,{gather,swing});
    hand.rotation.z=.24-pose.wind*.63+pose.strike*.97;
    hand.rotation.x=.10+pose.wind*.37-pose.strike*.67;
    if(aura){
      aura.base.rotation.z=pose.headtime*spin;
      for(const [i,j] of aura.joints.entries())j.rotation.y=Math.sin(pose.beat*.49+i*.62)*.22+pose.wind*.49;
    }
  },a.gear==='axe'?'duel':'hover');
}

function spiralFans(k,j){
  for(const side of flanks){
    const f=x=>side*x;
    plate(k,j,'ivory',[[0,.02,.024],[f(.234),.041,.039],[f(.373),.199,.031],[f(.25),.38,-.029],
      [f(.037),.301,.006],[f(.061),.15,.01]],.031,.008);
    for(let i=0;i<6;i++)sweep(k,j,i%2?'brass':'glow',[[0,.027,.062,.01],
      [f(.171+i*.021),.101+i*.029,.073,.013],[f(.294+i*.013),.205+i*.02,.062,.002]],8,6);
  }
}

function firstEmperor(k,entry){
  const rig=humanoid(k,{torso:[.31,.36,.43,.24],waist:.29,neck:.91,skin:'ochre',shell:'black',
    skirt:'red',rear:'black',dress:1.15,robe:1.27,edge:'brass',collar:.33});
  const {body,head}=rig;
  const crown=k.bone(head,0,.227,-.042),staff=k.bone(rig.limbs[1].wrist,.035,-.058,.041);
  plate(k,crown,'black',[[-.27,.08,-.01],[.251,.075,-.028],[.295,.122,-.087],[.175,.195,-.195],
    [-.225,.184,-.201],[-.311,.101,-.13]],.064,.016);
  for(let i=-4;i<=4;i++){
    const x=i*.047;
    sweep(k,crown,'brass',[[x,.093,.071,.012],[x,.009,.074,.011],[x+.008,-.134,.070,.013]],8,6);
    for(let j=0;j<3;j++)k.mesh(crown,'round',j===2?'red':'brass',x,-.028-j*.056,.077,.016,.022,.017);
  }
  solidBlade(k,staff,1.17,.079,'sabre','brass','black');
  const ensign=k.bone(body,-.458,.079,-.228);
  ritualPole(k,ensign,1.39,auspiciousPoleA,'brass');
  const cloth=k.bone(ensign,0,1.279,-.079);
  for(let i=0;i<4;i++)plate(k,cloth,i%3?'red':'brass',[[.029+i*.08,.029,-.037],[.12+i*.07,.038,-.032],
    [.12+i*.09,-.91+i*.071,-.11],[.04+i*.076,-1.0+i*.10,-.134]],.024,.009);
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:.61,swing:.86});
    cloth.rotation.y=Math.sin(pose.headtime*2.17)*.17+pose.wind*.39;
    ensign.rotation.x=Math.sin(pose.headtime*1.38)*.071+pose.strike*.17;
    staff.rotation.z=.43+pose.wind*.37-pose.strike*1.04;
  },'duel');
}

function qinRider(k,entry,mobile){
  const general=entry.id==='m020',tiger=entry.id==='m029',rig=humanoid(k,{torso:general?[.29,.38,.41,.22]:[.25,.31,.35,.19],
    waist:.27,neck:.82,shell:tiger?'steel':general?'cobalt':'jade',skirt:'dusk',rear:tiger?'ochre':general?'cobalt':'jade',
    robe:general?.86:.78,edge:tiger?'brass':'steel',collar:.18,height:1.23});
  const {body,head}=rig;
  const mount=k.bone(k.root,0,.93,-.061);
  body.position.y=.32;body.position.z=-.187;
  mount.add(body);
  const tail=[],legs=[];
  volume(k,mount,tiger?'black':general?'cobalt':'ivory',[[0,.177,-.82,.158,.14],[0,.126,-.59,.291,.25],
    [0,.032,-.20,.353,.319],[0,.05,.31,.316,.327],[0,.083,.63,.224,.239]],22,2.18,.22);
  const neck=k.bone(mount,0,.32,.386);
  volume(k,neck,'cobalt',[[0,-.173,.16,.27,.197],[0,.141,.15,.252,.218],
    [0,.455,.27,.194,.175],[0,.69,.413,.113,.103]],20,2.16,.19);
  const muzzle=k.bone(neck,0,.613,.408);
  if(tiger)neck.visible=false;
  volume(k,muzzle,general?'steel':'ivory',[[0,-.018,-.194,.144,.131],[0,.08,-.052,.152,.153],
    [0,.068,.119,.109,.103],[0,.015,.332,.111,.087],[0,-.022,.442,.099,.072]],15,2.29,.22);
  for(const side of flanks){
    const f=x=>x*side;
    sweep(k,muzzle,'cobalt',[[f(.084),.167,.015,.054],[f(.094),.261,-.042,.051],[f(.118),.329,-.119,.005]],11,7);
    k.mesh(muzzle,'gem','glow',f(.131),.100,.129,.036,.028,.017,0,f(.4));
    for(let i=0;i<7;i++)vane(k,neck,i%2?'steel':'cobalt',[f(.014),.645-i*.081,.294-i*.066],
      [f(.157),.51-i*.073,.142-i*.057],[f(.201+i*.014),.344-i*.064,-.071-i*.055],.081,33+i);
    for(let i=0;i<4;i++)plate(k,mount,i%2?'steel':'cobalt',[[f(.127),.302-i*.08,-.53],
      [f(.327),.332-i*.091,-.414],[f(.395),.224-i*.062,-.012],[f(.31),.113-i*.09,.189],[f(.23),.145-i*.08,.101]],.046,.014);
    for(const front of [false,true]){
      const leg=k.bone(mount,f(.211),-.072,front?.433:-.51);
      const knee=k.bone(leg,f(.047),-.389,front?.102:-.145);
      volume(k,leg,front?'ivory':'cobalt',[[0,.13,0,.137,.151],[f(.014),.012,.009,.157,.123],
        [f(.04),-.204,front?.056:-.107,.107,.098],[f(.049),-.391,front?.1:-.14,.063,.066]],16,2.32);
      volume(k,knee,'steel',[[0,.045,0,.077,.084],[f(.013),-.131,0,.079,.071],[f(.017),-.294,.022,.060,.063],
        [f(.016),-.408,.13,.102,.062],[f(.018),-.412,.207,.08,.042]],15,2.69);
      legs.push({leg,knee,front,side});
    }
    sweep(k,head,'steel',[[f(.103),.133,.025,.047],[f(.214),.219,-.081,.054],
      [f(.26),.319,-.133,.029],[f(.306),.414,-.203,.004]],13,8);
  }
  let t=k.bone(mount,0,.128,-.745);
  for(let i=0;i<5;i++){
    const r=.096-i*.013;
    sweep(k,t,i%2?'steel':'cobalt',[[0,.017,.014,r],[.033,-.018,-.154,r*.95],
      [.021,-.081,-.27,r*.63]],11,7);
    if(i>2)for(const side of flanks)vane(k,t,'ivory',[0,-.01,-.13],[side*.119,.029,-.27],
      [side*.16,-.06,-.42],.059,8+i);
    tail.push(t);t=k.bone(t,.021,-.081,-.257);
  }
  const weapon=k.bone(rig.limbs[1].wrist,0,-.07,.079);
  solidBlade(k,weapon,general?1.09:1.47,general?.187:.085,general?'sabre':'lance','steel','black');
  const emitters=flanks.map(side=>{
    const part=k.bone(mount,side*.60,-.04,side*.201);
    if(!general&&!tiger)for(let i=0;i<(mobile?3:5);i++)sweep(k,part,i%2?'steel':'glow',[
      [side*.018,-.35-i*.021,.235-i*.105,.041],[side*.153,-.11+i*.196,.147,.037],
      [side*.08,.14+i*.198,.021,.002],
    ],10,6);
    return part;
  });
  return sourcePose(entry,mount,head,pose=>{
    const {step,beat,wind,strike,travel}=pose;
    poseHumanoid(rig,pose,{swing:general?1.5:.82,spread:.22});
    body.rotation.x=-wind*.21+strike*.31;
    for(const {leg,knee,side,front} of legs){
      const stride=Math.sin(step+side*PI*.5+Number(front)*2.75);
      leg.rotation.x=stride*(.15+travel*.53)-wind*.18+strike*.44*Number(front);
      knee.rotation.x=Math.max(0,stride)*(.18+travel*.51)+wind*.10;
    }
    for(const [i,link] of tail.entries()){
      link.rotation.y=Math.sin(beat*.71-i*.49)*(.12+travel*.22);
      link.rotation.x=Math.cos(beat*.61-i*.51)*.11+strike*.17;
    }
    neck.rotation.x=wind*.20-strike*.24+Math.sin(beat*.61)*.07;
    muzzle.rotation.x=-neck.rotation.x*.53;
    weapon.rotation.z=.39+wind*.79-strike*.91;
    weapon.rotation.x=general?-.29+wind*.63-strike*.64:-.62-wind*.26+strike*1.17;
    for(const [i,e] of emitters.entries())e.rotation.y=beat*.51+i*PI;
  },'gallop');
}

function ghostHydra(k,entry){
  const rig=humanoid(k,{torso:[.235,.28,.31,.18],waist:.24,neck:.76,shell:'cobalt',
    skin:'ivory',skirt:'dusk',rear:'steel',dress:.85,robe:.79,height:.82,edge:'steel'});
  const {body,head}=rig;
  const cloud=k.bone(body,0,-.22,.01);
  for(let i=0;i<13;i++){
    const a=TAU*i/13;
    volume(k,cloud,i%3?'ivory':'steel',[[Math.cos(a)*.54,-.15,Math.sin(a)*.45,.135,.12],
      [Math.cos(a)*.64,-.04+(i%2)*.05,Math.sin(a)*.48,.203,.18],
      [Math.cos(a)*.61,.11+(i%3)*.031,Math.sin(a)*.53,.123,.109]],9,2.32,.24);
  }
  const coils=k.bone(body,0,.04,0);
  const first=[
    [-.019,-.06,-.78,.171,.133],[-.58,-.13,-.67,.184,.134],[-.86,-.11,-.21,.16,.15],
    [-.83,-.035,.51,.166,.163],[-.18,.089,.75,.185,.14],[.54,.27,.57,.17,.134],[.78,.39,.022,.146,.117],
    [.688,.51,-.50,.141,.123],[.235,.58,-.71,.136,.112],[-.40,.58,-.41,.128,.105],
  ];
  volume(k,coils,'steel',first,39,2.18,.23);
  const neck=k.bone(coils,-.39,.54,-.36),wyrm=k.bone(neck,.16,1.03,.226);
  volume(k,neck,'cobalt',[[0,0,0,.14,.11],[-.24,.27,-.21,.172,.123],
    [-.23,.62,-.24,.152,.132],[.018,.90,.032,.139,.122],[.15,1.029,.235,.131,.105]],24,2.28,.20);
  volume(k,wyrm,'steel',[[0,-.043,-.228,.125,.106],[0,.031,-.127,.171,.146],[0,.023,.026,.161,.105],
    [0,-.04,.223,.109,.064],[0,-.077,.366,.079,.043]],19,2.39,.23);
  for(const side of flanks){
    const f=x=>x*side;
    for(let i=0;i<4;i++)sweep(k,wyrm,i%2?'ivory':'steel',[[f(.103+i*.027),.041,-.055-i*.01,.043],
      [f(.171+i*.04),.126+i*.029,-.175-i*.035,.039],[f(.21+i*.051),.22+i*.04,-.36-i*.05,.003]],12,7);
    k.mesh(wyrm,'gem','glow',f(.101),.025,.149,.032,.018,.016,0,f(.42));
    sweep(k,head,'black',[[f(.037),.182,.112,.018],[f(.132),.226,-.06,.033],
      [f(.13),.362,-.139,.021],[f(.081),.392,-.13,.004]],9,7);
  }
  const curve=new T.CatmullRomCurve3(first.map(([x,y,z])=>new T.Vector3(x,y,z)));
  for(let i=0;i<25;i++){
    const u=(i+.52)/25,p=curve.getPointAt(u),d=curve.getTangentAt(u);
    const spike=k.bone(coils,p.x,p.y+.10,p.z);spike.rotation.y=Math.atan2(d.x,d.z);
    sweep(k,spike,i%2?'steel':'ivory',[[0,-.041,.069,.064],[0,.076,-.024,.052],
      [.013,.147,-.108,.003]],9,6);
  }
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:.62,swing:1.0});
    coils.rotation.y=Math.sin(pose.headtime*1.7)*.13+pose.wind*.37-pose.strike*.26;
    cloud.rotation.y=-pose.headtime*.20;
    neck.rotation.z=Math.sin(pose.headtime*3.7)*.14+pose.wind*.26;
    wyrm.rotation.x=-pose.wind*.48+pose.strike*.55;
  },'hover');
}

function iceGeneral(k,entry){
  const rig=humanoid(k,{torso:[.34,.41,.43,.25],waist:.31,neck:.91,skin:'ochre',shell:'cobalt',
    skirt:'dusk',rear:'ochre',dress:1.03,robe:1.31,edge:'brass',collar:.24});
  const {body,head}=rig,weapon=k.bone(rig.limbs[1].wrist,0,-.059,.081);
  solidBlade(k,weapon,1.41,.146,'lance','steel','black');
  for(const side of flanks){
    const f=x=>x*side;
    for(let i=0;i<4;i++)sweep(k,weapon,i%2?'steel':'ivory',[[f(.024),1.26,.023,.023],
      [f(.088+i*.035),1.32+i*.007,-.027,.021],[f(.171+i*.027),1.38+i*.032,-.104,.003]],9,6);
    for(let i=0;i<5;i++)sweep(k,rig.cloak,'brass',[[f(.031),-.154-i*.19,-.098-i*.044,.015],
      [f(.183+i*.007),-.13-i*.18,-.171-i*.036,.016],[f(.273),-.23-i*.17,-.227-i*.028,.003]],9,6);
    sweep(k,head,'steel',[[f(.163),.081,.059,.047],[f(.192),.187,-.014,.045],
      [f(.159),.33,-.049,.023],[f(.082),.385,-.034,.003]],12,7);
  }
  const topKnot=k.bone(head,0,.239,-.048);
  sweep(k,topKnot,'black',[[0,0,.02,.079],[.022,.113,-.018,.091],[.044,.190,-.115,.069],
    [.03,.183,-.207,.007]],14,8);
  const shades=[];
  for(let i=0;i<7;i++){
    const a=i*TAU/7;
    const ghost=k.bone(body,Math.sin(a)*.44,.636+Math.sin(i*6.2)*.13,Math.cos(a)*.31-.03);
    vane(k,ghost,'cobalt',[0,-.046,.015],[.062,.142,-.05],[.13,.228,-.183],.087,11+i);
    shades.push(ghost);
  }
  return sourcePose(entry,body,head,pose=>{
    const {wind,strike,headtime,travel}=pose;
    poseHumanoid(rig,pose,{gather:1.21,swing:1.36,spread:.31});
    weapon.rotation.set(-.33+wind*.41-strike*.87,.23+wind*.64,
      -.33+wind*1.1-strike*1.51);
    rig.cloak.rotation.y=.11+wind*.27-strike*.38;
    for(const [i,shade] of shades.entries()){
      shade.rotation.z=Math.sin(headtime*3.2+i*.72)*.28+wind*.47;
      shade.rotation.x=travel*.31+strike*.53;
    }
  },'duel');
}

function iceTortoise(k,entry,mobile){
  const body=k.bone(k.root,0,.96,0),head=k.bone(body,0,-.06,.892);
  volume(k,body,'black',[[0,-.355,-.13,.457,.529],[0,-.26,-.035,.658,.707],
    [0,.016,-.018,.68,.724],[0,.286,-.049,.533,.598],[0,.438,-.073,.343,.402],
    [0,.502,-.093,.071,.061]],24,2.45,.19);
  const saddle=k.bone(body,0,-.27,-.007);
  saddle.rotation.x=PI/2;saddle.scale.y=1.04;
  rim(k,saddle,'steel',.636,.079);rim(k,saddle,'ochre',.588,.059,.034);
  for(let t=0;t<3;t++){
    const count=[12,9,5][t];
    for(let i=0;i<count;i++){
      const a=TAU*(i+.23*t)/count, r=.597-t*.17;
      const pad=k.bone(body,Math.cos(a)*r,-.005+t*.159,Math.sin(a)*r*1.04-.037);
      pad.rotation.set(.37,PI*.5-a,.66-t*.32);
      const size=1-t*.27;
      const rock=[[0,-.12,-.019,.074*size,.085*size],[0,-.008,.016,.181*size,.145*size],
        [0,.101,.037,.152*size,.138*size],[0,.135,.045,.102*size,.095*size]];
      volume(k,pad,'black',rock,mobile?9:11,4.1,.19);
      const joint=k.bone(pad,0,.073,.035);
      joint.rotation.x=PI/2;rim(k,joint,i%3?'steel':'ivory',.128*size,.019);
      sweep(k,pad,i%2?'steel':'ivory',[[0,.068,.052,.063*size],[0,.168+t*.017,.051,.061*size],
        [0,.295+t*.034,.018,.039*size],[0,.406+t*.035,-.029,.002]],10,6);
    }
  }
  const neck=k.bone(body,0,-.224,.614);
  volume(k,neck,'ochre',[[0,-.045,-.151,.15,.116],[0,.028,.03,.16,.162],[0,.116,.205,.115,.107],
    [0,.19,.311,.099,.073]],16,2.24,.25);
  neck.add(head);head.position.set(0,.188,.308);
  volume(k,head,'moss',[[0,.099,-.105,.103,.090],[0,.068,-.004,.178,.115],[0,.041,.117,.156,.084],
    [0,.007,.225,.128,.061],[0,-.027,.305,.074,.048]],15,2.64,.22);
  const legs=[];
  for(const side of flanks){
    k.mesh(head,'gem','glow',side*.117,.076,.130,.041,.027,.018,0,side*.32);
    for(let i=0;i<2;i++)sweep(k,head,'ivory',[[side*(.115+i*.033),.103,-.01,.040],
      [side*(.153+i*.033),.177,-.054,.041],[side*(.176+i*.032),.237,-.12,.003]],9,7);
    for(const front of [false,true]){
      const leg=k.bone(body,side*.442,-.255,front?.45:-.463);
      const talon=k.bone(leg,side*.1,-.43,.11);
      volume(k,leg,'ochre',[[0,.064,0,.145,.142],[side*.067,-.08,.047,.19,.144],[side*.094,-.29,.082,.149,.153],
        [side*.097,-.436,.116,.105,.112]],17,2.37,.24);
      for(let i=0;i<3;i++)sweep(k,talon,'ivory',[[.064*(i-1),-.057,.053,.050],[.082*(i-1),-.123,.131,.046],
        [.093*(i-1),-.154,.228,.005]],10,7);
      legs.push({leg,talon,side,front});
    }
  }
  let hook=k.bone(body,0,-.115,-.632);
  const tail=[];
  for(let i=0;i<5;i++){
    const r=.078-i*.007;
    sweep(k,hook,i%2?'ochre':'steel',[[0,0,.025,r],[.017,.14,-.079,r*.91],
      [.017,.262,-.174,r*.90]],11,7);
    tail.push(hook);hook=k.bone(hook,.017,.239,-.162);
  }
  volume(k,hook,'black',[[0,-.085,0,.053,.06],[0,.001,0,.159,.154],
    [0,.107,.012,.140,.128],[0,.201,.005,.046,.05]],14,3.9,.24);
  for(let i=0;i<8;i++){
    const a=TAU*i/8;
    sweep(k,hook,'steel',[[Math.cos(a)*.098,.052,Math.sin(a)*.118,.056],
      [Math.cos(a)*.189,.096,Math.sin(a)*.184,.046],[Math.cos(a)*.254,.16,Math.sin(a)*.256,.003]],9,6);
  }
  return sourcePose(entry,body,head,({headtime,step,wind,strike,travel,stage})=>{
    neck.rotation.x=-wind*.31+strike*.48;
    head.rotation.x=wind*.24-strike*.36;
    for(const {leg,talon,side,front} of legs){
      const cycle=Math.sin(step+side*PI*.5+(front?.37:2.97));
      leg.rotation.x=cycle*travel*.42-wind*.16+strike*.16;
      talon.rotation.x=-leg.rotation.x*.62;
    }
    for(const [i,link] of tail.entries()){
      link.rotation.y=Math.sin(headtime*3.2+i*.47)*(.13+travel*.044)-wind*.29+strike*.43;
      link.rotation.x=wind*.18-i*.022-strike*.17-stage*.03;
    }
  },'crawl');
}

function regionalDragon(k,entry,mobile){
  const poison=entry.id==='m024';
  const body=k.bone(k.root,0,poison?1.33:.92,0),neck=k.bone(body,0,.08,.32);
  const head=k.bone(neck,0,.49,.662),jaw=k.bone(head,0,-.151,.13);
  const deep=poison?'moss':'clay',accent=poison?'ochre':'red';
  volume(k,body,deep,[[0,-.20,-.66,.169,.188],[0,-.118,-.395,.277,.239],[0,-.051,-.061,.348,.299],
    [0,.13,.339,.278,.243],[0,.193,.53,.169,.152]],21,2.25,.17);
  volume(k,neck,deep,[[0,-.019,-.013,.18,.16],[0,.12,.152,.197,.167],[0,.317,.456,.15,.14],
    [0,.489,.652,.131,.111]],21,2.25,.20);
  volume(k,head,deep,[[0,.048,-.236,.13,.096],[0,.042,-.086,.214,.167],[0,.01,.135,.199,.108],
    [0,-.044,.281,.15,.078],[0,-.078,.417,.109,.048]],19,2.8,.22);
  volume(k,jaw,accent,[[0,-.033,-.115,.132,.08],[0,-.041,.068,.149,.053],
    [0,-.013,.218,.119,.033]],12,2.42,.16);
  const wings=[],feet=[];
  for(const side of flanks){
    const f=x=>side*x;
    sweep(k,head,'ivory',[[f(.135),.117,-.063,.053],[f(.219),.233,-.181,.047],
      [f(.271),.359,-.34,.035],[f(.306),.397,-.399,.004]],15,8);
    k.mesh(head,'gem','glow',f(.155),.044,.207,.035,.022,.019,0,f(.37));
    for(let i=0;i<5;i++){
      sweep(k,jaw,'ivory',[[f(.09),.007,.197-i*.056,.018],[f(.098),.057,.196-i*.057,.015],
        [f(.089),.082-i*.004,.186-i*.056,.002]],6,5);
      vane(k,head,i%3?accent:'ivory',[f(.133),.086,-.027-i*.019],
        [f(.215),.096+i*.057,-.133-i*.046],
        [f(.274+i*.019),.081+i*.087,-.256-i*.050],.066,36+i);
    }
    if(poison){
      const shoulder=k.bone(body,f(.245),.13,.126);
      const wing=k.bone(shoulder,f(.925),.301,-.12);
      sweep(k,shoulder,'ivory',[[0,0,0,.120],[f(.291),.194,.078,.106],[f(.537),.316,.017,.069],
        [f(.928),.30,-.12,.072]],18,9);
      for(let i=0;i<5;i++){
        const a=[f(.04),.008,.015],d=[f(.48+i*.193),.024-i*.053,-.36-i*.108];
        const b=[f(.264+i*.104),.117-i*.032,-.16-i*.067];
        vane(k,wing,i%2?'cobalt':'black',a,b,d,.32-i*.038,76+i);
        sweep(k,wing,'brass',[[...a,.037],[...b,.028],[...d,.003]],14,7);
      }
      wings.push({shoulder,wing,side});
    }else for(let i=0;i<8;i++)vane(k,body,i%3?'clay':'brass',[f(.14),.167,.374-i*.134],
      [f(.23),.48,.344-i*.143],[f(.29+i*.016),.599-i*.012,.236-i*.168],.079,45+i);
    for(let i=0;i<2;i++){
      const leg=k.bone(body,f(.27-i*.025),-.107,.198-i*.553);
      const paw=k.bone(leg,f(.043),-.278,.063);
      sweep(k,leg,deep,[[0,.082,-.024,.101],[f(.048),-.093,-.059,.104],[f(.041),-.285,.059,.061]],13,8);
      for(let j=-1;j<2;j++)sweep(k,paw,'ivory',[[f(.043*j),.038,0,.036],
        [f(.056*j),-.023,.105,.034],[f(.058*j),-.041,.171,.004]],8,6);
      feet.push({leg,paw,side,i});
    }
  }
  let tail=k.bone(body,0,-.171,-.639);
  const bones=[];
  for(let i=0;i<(mobile?7:9);i++){
    const a=i/10,r=.165-.137*a;
    const d=poison?.274:.342;
    volume(k,tail,deep,[[0,.02,.031,r,r],[.049,.012,-d*.43,r*.94,r*.87],[.047,-.026,-d,r*.89,r*.80]],12,2.22,.21);
    if(i%2===0)sweep(k,tail,accent,[[0,r*.6,-.02,r*.48],[.009,r*.95,-.13,r*.36],[.029,r*1.53,-.21,.003]],9,6);
    bones.push(tail);tail=k.bone(tail,.047,-.026,-d+.024);
  }
  if(poison)for(let i=0;i<4;i++){
    const a=TAU*i/4;
    sweep(k,tail,'ivory',[[0,.005,.021,.028],[Math.sin(a)*.095,Math.cos(a)*.094,-.092,.033],
      [Math.sin(a)*.154,Math.cos(a)*.153,-.284,.003]],9,6);
  }
  return sourcePose(entry,body,head,({headtime,beat,step,wind,strike,travel,stage})=>{
    body.rotation.x=-wind*.24+strike*.19;
    neck.rotation.z=Math.sin(headtime*2.1)*.12+wind*.14;
    head.rotation.x=-wind*.39+strike*.37;jaw.rotation.x=wind*.22+strike*.62;
    for(const {shoulder,wing,side} of wings){
      shoulder.rotation.z=side*(.29+Math.sin(headtime*6.9)*(.45+travel*.28)+wind*.35-strike*.30);
      wing.rotation.y=side*(.18+Math.sin(headtime*6.9-.5)*.24);
      wing.rotation.z=side*(.12+Math.cos(headtime*6.9-.41)*.31+strike*.20);
    }
    for(const [i,link] of bones.entries()){
      link.rotation.y=(poison?.11:.60)+Math.sin(headtime*2.9-i*.43)*(.17+travel*.138)-wind*.15+strike*.22;
      link.rotation.x=Math.sin(headtime*2.7-i*.46)*.11+stage*.091;
    }
    for(const {leg,paw,side,i} of feet){
      leg.rotation.x=Math.sin((poison?beat:step)+side*PI*.5+i*2.8)*(.09+travel*.42)+wind*.34;
      paw.rotation.x=wind*.39-strike*.41-leg.rotation.x*.49;
    }
  },poison?'wing':'coil');
}

function butcher(k,entry){
  const rig=humanoid(k,{torso:[.38,.558,.61,.292],waist:.385,neck:.69,skin:'ochre',shell:'ochre',
    skirt:'black',dress:.31,height:1.06,boot:'black',width:.457,edge:'brass',hair:'red',teeth:true});
  const {body,head}=rig;
  const knife=k.bone(rig.limbs[1].wrist,.041,-.04,.046);
  plate(k,knife,'steel',[[-.114,.128,-.037],[.205,.137,-.016],[.222,.539,-.063],
    [.29,1.071,-.147],[.062,1.187,-.165],[-.255,1.016,-.07],[-.244,.492,-.012]],.094,.026);
  sweep(k,knife,'black',[[0,-.32,0,.045],[.006,-.094,.023,.071],[0,.148,.022,.057],[0,.273,.043,.051]],13,8);
  for(const side of flanks){
    const f=x=>x*side;
    sweep(k,head,'brass',[[f(.128),.019,.055,.045],[f(.195),.125,.06,.057],
      [f(.238),.252,.028,.044],[f(.208),.372,-.041,.007]],14,8);
    sweep(k,body,'black',[[f(.472),.552,.117,.049],[f(.386),.364,.272,.056],
      [f(.319),.155,.30,.042],[f(.29),-.019,.246,.036]],15,9);
    const ring=k.bone(body,f(.263),.263,.302);rimStroke(k,ring);
  }
  for(let i=0;i<8;i++){
    const a=TAU*i/8;
    const ring=k.bone(body,Math.sin(a)*.413,-.08,Math.cos(a)*.30);ring.rotation.y=a;
    plate(k,ring,'brass',[[-.096,.025,.004],[.069,.05,-.016],[.132,-.039,.04],
      [.09,-.121,.076],[-.099,-.126,.049]],.051,.013);
  }
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:1.15,swing:1.36,spread:.26});
    knife.rotation.x=-.34+pose.wind*.93-pose.strike*1.21;
    knife.rotation.z=.46+pose.wind*.38-pose.strike*.74;
  },'slam');
}
function rimStroke(k,mark){
  rim(k,mark,'steel',.093,.023);rim(k,mark,'black',.066,.013,.023);
  k.mesh(mark,'gem','glow',0,0,.051,.032,.041,.021);
}

function vixen(k,entry,mobile){
  const white=entry.id==='m034',colors=white?['ivory','lilac','brass']:['jade','teal','brass'];
  const [skirt,rear,edge]=colors;
  const rig=humanoid(k,{torso:[.21,.27,.30,.19],waist:.25,neck:.84,shell:white?'lilac':'jade',
    skin:'ivory',skirt,rear,edge,robe:white?1.22:.73,dress:white?1.38:1.03,hair:white?'ivory':'black',collar:.27});
  const {body,head}=rig,tails=[];
  for(let i=0;i<(white?9:6);i++){
    const a=(i-(white?4:2.5))*(white?.216:.310),r=1.34+Math.cos(a)*.48;
    const root=k.bone(body,Math.sin(a)*.24,.27,-.192);
    root.rotation.y=-a*.58;
    const tail=k.bone(root,0,.64,-.44);
    const finish=white?'ivory':'skin';
    volume(k,root,finish,[[0,-.038,-.026,.092,.092],[Math.sin(a)*.23,.255,-.234,.19,.166],
      [Math.sin(a)*.49,.50,-.379,.23,.189],[Math.sin(a)*.68,.64,-.44,.188,.151]],15,2.16,.23,true);
    volume(k,tail,finish,[[Math.sin(a)*.65,-.041,.032,.174,.148],[Math.sin(a)*.91,.215,-.16,.198,.186],
      [Math.sin(a)*r,.478,-.31,.161,.146],[Math.sin(a)*r*1.3,.62,-.43,.117,.111],
      [Math.sin(a)*r*1.42,.622,-.501,.004,.006]],18,2.26,.27,true);
    for(let j=0;j<(mobile?3:5);j++)vane(k,tail,white?'ivory':'brass',
      [Math.sin(a)*.60+(j-2)*.044,.095,-.073],[Math.sin(a)*.981+(j-2)*.054,.359,-.32],
      [Math.sin(a)*r*1.41+(j-2)*.044,.58+(j-1)*.037,-.47],.069,j+i*7);
    tails.push({root,tail,a});
  }
  for(const side of flanks){
    const f=x=>side*x;
    plate(k,head,white?'steel':'brass',[[f(.045),.12,.104],[f(.167),.21,.042],
      [f(.28),.429,-.015],[f(.267),.24,-.101],[f(.121),.131,-.095]],.046,.010);
    plate(k,head,white?'lilac':'ochre',[[f(.13),.156,.059],[f(.24),.338,.003],[f(.242),.244,.029],
      [f(.172),.143,.052]],.023,.008);
    for(let i=0;i<3;i++)vane(k,head,white?'ivory':'black',[f(.093),.046,-.019],
      [f(.191),-.104-i*.058,-.133],[f(.205+i*.043),-.28-i*.16,-.229],.064,21+i);
  }
  const fans=k.bone(rig.limbs[1].wrist,0,-.04,.113);
  spiralFans(k,fans);
  const seal=hiddenHalo(k,body,-.243,.033,white?.62:.54,white?'brass':'steel',9,PI/2);
  const wisps=[];
  if(!white)for(let i=0;i<4;i++){
    const wisp=k.bone(body,0,0,0);
    k.mesh(wisp,'gem','cobalt',0,0,0,.112,.119,.11);
    rim(k,wisp,'steel',.132,.016);rim(k,wisp,'jade',.149,.010,-.012);
    for(let j=0;j<6;j++){
      const a=j*TAU/6;
      sweep(k,wisp,'glow',[[Math.sin(a)*.148,Math.cos(a)*.148,.027,.010],
        [Math.sin(a+.24)*.193,Math.cos(a+.24)*.193,-.026,.011],
        [Math.sin(a+.31)*.221,Math.cos(a+.31)*.19,-.047,.002]],7,6);
    }
    wisps.push(wisp);
  }
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:1.03,swing:white?1.27:.83,spread:.32});
    fans.rotation.z=pose.beat*.25-pose.wind*.79+pose.strike*.92;
    for(const [i,{root,tail,a}] of tails.entries()){
      root.rotation.y=-a*(.55+pose.wind*.40)+Math.sin(pose.headtime*2.3+i*.52)*(.13+pose.travel*.11);
      root.rotation.z=-a*.58+Math.cos(pose.headtime*2.5+i*.71)*.12;
      tail.rotation.x=-pose.wind*.26+pose.strike*.38+Math.sin(pose.headtime*2.8+i*.74)*.14;
    }
    seal.base.rotation.z=-pose.headtime*.83;
    for(const [i,wisp] of wisps.entries()){
      const a=pose.headtime*(1.16+pose.wind*.32)+i*TAU/4;
      wisp.position.set(Math.sin(a)*(.74+pose.strike*.21),.33+Math.cos(a*1.7)*.54,Math.cos(a)*.65);
      wisp.rotation.set(a*.90,a*.43,-a*.88);
    }
  },'hover');
}

function ironCrutch(k,entry,mobile){
  const rider=qinRider(k,entry,mobile);
  const mount=rider.body;
  mount.scale.set(1.18,.88,1.07);
  const head=k.bone(mount,0,.45,.82);
  volume(k,head,'black',[[0,.138,-.181,.172,.155],[0,.09,.009,.23,.198],
    [0,.013,.184,.194,.157],[0,-.068,.32,.151,.094],[0,-.087,.443,.119,.071]],18,2.78,.26,true);
  const claws=[];
  for(const side of flanks){
    const f=x=>x*side;
    plate(k,head,'black',[[f(.08),.14,.071],[f(.15),.295,-.032],
      [f(.221),.359,-.098],[f(.224),.155,-.148],[f(.107),.087,-.123]],.056,.011);
    k.mesh(head,'gem','glow',f(.183),.041,.207,.033,.014,.023,0,f(.4));
    for(let i=0;i<5;i++)sweep(k,head,i%2?'steel':'ivory',[[f(.141+i*.024),.055-i*.018,.178-i*.05,.014],
      [f(.188+i*.022),-.004-i*.013,.203-i*.058,.019],[f(.151+i*.025),-.095-i*.013,.236-i*.059,.003]],9,6);
    for(let i=0;i<9;i++)vane(k,head,i%3?'black':'steel',[f(.137),.182-i*.042,-.083],
      [f(.278),.111-i*.039,-.175],[f(.37+i*.012),-.141-i*.032,-.25-i*.03],.091,67+i);
    const bone=k.bone(mount,f(.557),.12,-.29);
    for(let i=0;i<5;i++)plate(k,bone,'black',[[0,.28-i*.09,-.29],[f(.14),.155-i*.08,-.207],
      [f(.155),-.063-i*.063,-.015],[f(.08),-.118-i*.059,.164],[0,-.064-i*.08,.223]],.046,.010);
    claws.push(bone);
  }
  const oldPose=rider.cataloguePose;
  rider.cataloguePose=pose=>{
    oldPose(pose);
    head.rotation.x=Math.sin(pose.beat*.64)*.11-pose.wind*.34+pose.strike*.45;
    for(const [i,c] of claws.entries())c.rotation.y=(i?1:-1)*(.15+pose.wind*.24-pose.strike*.19);
  };
  return rider;
}

function shadowBat(k,entry,mobile){
  const body=k.bone(k.root,0,1.57,-.019),head=k.bone(body,0,.337,.225),jaw=k.bone(head,0,-.155,.075);
  volume(k,body,'clay',[[0,-.39,-.26,.15,.16],[0,-.124,-.12,.31,.268],[0,.169,-.041,.435,.31],
    [0,.357,.061,.353,.24],[0,.403,.179,.207,.133]],22,2.21,.27,true);
  volume(k,head,'black',[[0,-.104,-.11,.20,.151],[0,-.004,-.058,.25,.215],[0,.129,-.073,.234,.164],
    [0,.215,-.115,.188,.124],[0,.274,-.147,.123,.079]],19,2.43,.29);
  volume(k,jaw,'clay',[[0,-.134,-.03,.12,.09],[0,-.068,.048,.17,.106],
    [0,-.03,.163,.138,.066],[0,.023,.192,.109,.041]],12,2.32,.21);
  const wings=[],feet=[];
  for(const side of flanks){
    const f=x=>side*x;
    sweep(k,head,'red',[[f(.131),.076,.031,.077],[f(.22),.302,-.06,.087],
      [f(.287),.484,-.166,.040],[f(.276),.546,-.206,.004]],14,8);
    k.mesh(head,'gem','glow',f(.144),.047,.169,.048,.022,.027,0,f(.37),f(.22));
    for(let i=0;i<4;i++)sweep(k,jaw,'ivory',[[f(.049+i*.022),.018,.163-i*.033,.022],
      [f(.062+i*.022),.067,.155-i*.03,.020],[f(.058+i*.022),.108,.144-i*.03,.003]],7,6);
    const wing=k.bone(body,f(.348),.139,-.113);
    const wrist=k.bone(wing,f(.642),.41,-.011);
    sweep(k,wing,'clay',[[0,0,0,.13],[f(.269),.141,.06,.161],[f(.485),.323,.039,.11],
      [f(.652),.415,-.007,.072]],15,9);
    for(let i=0;i<5;i++){
      const a=[0,.036,-.04],b=[f(.28+i*.055),.23-i*.104,-.18-i*.113],
        c=[f(.77-i*.083),.37-i*.245,-.37-i*.16];
      vane(k,wrist,i%3?'red':'black',a,b,c,.244,77+i);
      sweep(k,wrist,'clay',[[...a,.044],[...b,.041],[...c,.004]],12,7);
    }
    for(let i=0;i<(mobile?4:7);i++)vane(k,wing,i%2?'clay':'red',[0,0,0],
      [f(.28+i*.065),.1-i*.04,-.16],[f(.63-i*.052),-.13-i*.08,-.385-i*.067],.12,96+i);
    wings.push({wing,wrist,side});
    const leg=k.bone(body,f(.181),-.295,-.171);
    sweep(k,leg,'black',[[0,.067,-.029,.091],[f(.06),-.168,.044,.097],
      [f(.07),-.405,.098,.065]],13,8);
    for(let i=0;i<3;i++)sweep(k,leg,'ivory',[[f(.035*i),-.361,.091,.031],
      [f(.039*i),-.445,.181,.032],[f(.042*i),-.487,.211,.003]],8,6);
    feet.push(leg);
  }
  return sourcePose(entry,body,head,pose=>{
    const {headtime,wind,strike,travel,stage}=pose;
    for(const {wing,wrist,side} of wings){
      const pulse=Math.sin(headtime*(6.7+stage*.61));
      wing.rotation.z=side*(.43+pulse*(.41+travel*.36)+wind*.51-strike*.66);
      wing.rotation.y=side*(-.19+wind*.38+strike*.37);
      wrist.rotation.z=side*(Math.sin(headtime*6.7-.65)*.35+wind*.56);
    }
    for(const [i,leg] of feet.entries())leg.rotation.x=wind*.63-strike*.61+Math.sin(headtime*2.7+i*PI)*.17;
    jaw.rotation.x=wind*.17+strike*.68;
  },'wing');
}

const realmFigures={
  m031:{torso:[.28,.36,.39,.22],colors:['black','red','dusk','brass'],hair:'circlet',length:1.21,gear:'courtBlade',pace:[.69,1.30,.83]},
  m032:{torso:[.22,.28,.31,.18],colors:['cobalt','dusk','cobalt','brass'],hair:'twinBuns',length:1.17,gear:'floralBasket',pace:[.76,.97,.51]},
  m033:{torso:[.22,.27,.29,.18],colors:['red','cobalt','ivory','brass'],hair:'hornMask',length:1.06,gear:'splitSabre',pace:[1.16,1.46,1.32]},
  m039:{torso:[.31,.34,.40,.21],colors:['ochre','red','cobalt','brass'],hair:'sunCrown',length:1.03,gear:'bow',pace:[.72,.46,.68]},
  m040:{torso:[.26,.34,.34,.23],colors:['ochre','jade','cobalt','ivory'],hair:'clothHood',length:.88,gear:'lute',pace:[.52,.43,.73]},
  m041:{torso:[.28,.33,.36,.22],colors:['jade','ochre','black','brass'],hair:'lionMane',length:.92,gear:'glaive',pace:[1.02,1.32,.76]},
  m051:{torso:[.27,.37,.39,.21],colors:['ochre','red','black','brass'],hair:'warHelm',length:.83,gear:'doubleChain',pace:[1.02,1.23,1.2]},
  m056:{torso:[.21,.30,.33,.19],colors:['jade','lilac','black','ivory'],hair:'tornCrown',length:1.39,gear:'thorns',pace:[.67,1.06,1.1]},
  m059:{torso:[.29,.34,.39,.23],colors:['ochre','black','red','brass'],hair:'elder',length:1.03,gear:'armourRoll',pace:[.81,.91,.81]},
};

function instrument(k,j){
  const bowl=k.bone(j,0,.014,0);
  volume(k,bowl,'ochre',[[0,-.303,.017,.12,.061],[0,-.207,.042,.233,.091],[0,.026,.015,.271,.104],
    [0,.18,0,.126,.081],[0,.28,-.034,.073,.054]],20,2.23,.11);
  volume(k,bowl,'brass',[[0,-.28,.101,.095,.018],[0,-.17,.118,.212,.04],[0,.009,.119,.23,.033],
    [0,.129,.097,.17,.019]],14,2.14);
  sweep(k,bowl,'black',[[0,.098,.039,.062],[0,.34,-.014,.065],[0,.67,-.125,.062],[.039,.85,-.19,.074]],14,8);
  for(let i=0;i<7;i++){
    const x=(i-3)*.021;
    sweep(k,bowl,'ivory',[[x,-.15,.136,.004],[x*.8,.192,.107,.004],[x*.53,.653,-.065,.004]],9,5);
    k.mesh(bowl,'gem','brass',x,.60+i*.031,-.123,.035,.019,.024);
  }
  return bowl;
}

function arcBow(k,j){
  const joints=[];
  for(const side of flanks){
    const draw=k.bone(j,0,0,0);
    sweep(k,draw,'brass',[[0,0,0,.048],[.133,side*.221,-.022,.043],
      [.224,side*.56,-.099,.048],[.141,side*.744,-.123,.033],
      [-.019,side*.872,-.127,.005]],17,8);
    sweep(k,draw,'ivory',[[.139,side*.30,.013,.022],[.226,side*.57,-.056,.024],
      [.159,side*.699,-.091,.019],[.035,side*.775,-.128,.002]],11,6);
    sweep(k,draw,'glow',[[0,0,0,.008],[-.01,side*.537,-.10,.006],[-.024,side*.86,-.127,.005]],10,5);
    joints.push(draw);
  }
  return joints;
}

function courtFigure(k,entry,mobile){
  const info=realmFigures[entry.id],[shell,skirt,rear,edge]=info.colors;
  const white=['hornMask','tornCrown','elder'].includes(info.hair);
  const rig=humanoid(k,{torso:info.torso,waist:info.torso[0]+.01,neck:.87,shell,skirt,rear,edge,
    robe:info.length*.92,dress:info.length,hair:white?'ivory':'black',collar:.29});
  const {body,head}=rig;
  const crown=k.bone(head,0,.17,-.059),effects=[],off=k.bone(rig.limbs[0].wrist,-.032,-.044,.079),
    hand=k.bone(rig.limbs[1].wrist,.022,-.05,.07);
  for(const side of flanks){
    const f=x=>side*x;
    switch(info.hair){
      case 'circlet':
      case 'sunCrown':{
        for(let j=0;j<4;j++)sweep(k,crown,'brass',[[f(.028+j*.029),.045,.064,.030],
          [f(.083+j*.036),.192,.018,.030],[f(.11+j*.046),.204+j*.07,-.128,.004]],12,7);
        const jewel=k.bone(crown,f(.132),.15,-.036);rim(k,jewel,'brass',.082,.018,.038);
        k.mesh(jewel,'gem','glow',0,0,.063,.043,.06,.023);
        break;
      }
      case 'twinBuns':{
        volume(k,crown,'cobalt',[[f(.208),.016,-.005,.086,.095],[f(.227),.096,-.014,.11,.099],
          [f(.234),.165,-.042,.073,.065],[f(.23),.207,-.032,.038,.046]],14,2.46,.31,true);
        sweep(k,crown,'brass',[[f(.138),.112,.056,.016],[f(.245),.146,.068,.023],[f(.327),.115,.033,.004]],9,6);
        for(let i=0;i<3;i++)vane(k,crown,'cobalt',[f(.224),.047,-.02],[f(.309+i*.033),-.24,-.134],
          [f(.39+i*.087),-.62-i*.04,-.304],.082,i+12);
        break;
      }
      case 'hornMask':
      case 'tornCrown':{
        for(let i=0;i<5;i++)vane(k,crown,i%2?'ivory':'steel',[f(.045+i*.029),.038,-.018],
          [f(.263+i*.025),-.109-i*.061,-.153],[f(.333+i*.043),-.278-i*.072,-.317],.081,52+i);
        sweep(k,head,info.hair==='hornMask'?'red':'jade',[[f(.128),.025,.102,.055],
          [f(.211),.146,.022,.059],[f(.219),.239,-.037,.041],[f(.171),.294,-.105,.003]],12,7);
        break;
      }
      case 'lionMane':
      case 'elder':
        for(let i=0;i<7;i++)vane(k,head,white?'ivory':i%2?'black':'ochre',[f(.064+i*.016),.18,-.028],
          [f(.225+i*.012),.118-i*.07,-.098],[f(.24+i*.021),-.17-i*.082,-.27],.09,41+i);
        for(let i=0;i<4;i++)sweep(k,head,white?'ivory':'black',[[f(.038+i*.035),-.055,.117,.036],
          [f(.077+i*.03),-.17,.176,.036],[f(.139+i*.034),-.32-i*.037,.133,.008]],10,7);
        break;
      case 'clothHood':
      case 'warHelm':
        plate(k,crown,'ochre',[[f(.005),.14,.043],[f(.098),.245,-.101],[f(.216),.132,-.123],
          [f(.278),.008,-.047],[f(.153),-.059,.089]],.049,.015);
        sweep(k,crown,'ivory',[[f(.053),.16,.016,.033],[f(.145),.216,-.054,.037],
          [f(.248),.061,-.094,.026],[f(.265),-.107,-.058,.004]],12,7);
        break;
    }
    for(let i=0;i<5;i++){
      const trim=k.bone(body,0,.559-i*.097,-info.torso[3]-.015);
      sweep(k,trim,i%2?edge:rear,[[f(.054),.009,-.015,.020],
        [f(.166),.004,-.033,.024],[f(.239),-.037,-.041,.004]],8,6);
    }
  }
  let effect=null;
  switch(info.gear){
    case 'courtBlade': {
      solidBlade(k,hand,1.39,.071,'sabre');
      effect=hiddenHalo(k,body,.67,-.34,.74,'brass',13,.07);
      break;
    }
    case 'floralBasket':{
      const basket=k.bone(hand,0,.21,.12);
      volume(k,basket,'ochre',[[0,-.181,-.049,.123,.1],[0,-.074,-.043,.18,.139],
        [0,.089,-.023,.221,.177],[0,.129,.014,.189,.17]],18,2.6,.19);
      for(let i=0;i<9;i++){
        const a=i*TAU/9,x=Math.sin(a),z=Math.cos(a);
        const bud=k.bone(basket,x*.193,.20+Math.sin(i*3.71)*.09,z*.15);
        sweep(k,basket,'jade',[[x*.061,-.13,z*.047,.026],[x*.149,.059,z*.087,.021],
          [x*.196,.26,z*.15,.015]],11,6);
        for(let p=0;p<5;p++)vane(k,bud,p%2?'lilac':'ivory',[0,.014,0],
          [Math.sin(p*TAU/5)*.092,.055,Math.cos(p*TAU/5)*.082],
          [Math.sin(p*TAU/5)*.17,.061,Math.cos(p*TAU/5)*.12],.044,i*5+p);
        effects.push(bud);
      }
      break;
    }
    case 'splitSabre':
      solidBlade(k,hand,1.29,.13,'sabre','steel');
      solidBlade(k,off,.74,.092,'sabre','cobalt');
      break;
    case 'bow':
      effects.push(...arcBow(k,hand));
      if(entry.id==='m039'){
        const drift=k.bone(body,0,-.943,0);
        for(let i=0;i<10;i++){
          const angle=TAU*i/10,r=.44+Math.sin(i*.71)*.086;
          volume(k,drift,'ivory',[
            [Math.sin(angle)*r,-.146,Math.cos(angle)*r,.091,.081],
            [Math.sin(angle)*r*1.14,-.059,Math.cos(angle)*r*1.09,.153,.128],
            [Math.sin(angle)*r*.93,.056+Math.sin(i*2.13)*.039,Math.cos(angle)*r,.089,.081],
          ],10,2.39,.24);
        }
        for(let i=0;i<8;i++)vane(k,head,i%3?'teal':'cobalt',[(i-3.5)*.043,.194,-.118],
          [(i-3.5)*.092,-.151,-.227],[(i-3.5)*.111,-.582+i*.012,-.413-i*.023],.083,33+i);
        effects.push(drift);
      }
      break;
    case 'lute':
      effects.push(instrument(k,hand));
      effect=hiddenHalo(k,body,-.37,.016,.43,'steel',8,PI/2);
      break;
    case 'glaive':
      solidBlade(k,hand,1.31,.154,'lance','steel');
      break;
    case 'doubleChain':
      for(const [i,w] of [off,hand].entries()){
        const staff=k.bone(w,0,0,0);
        solidBlade(k,staff,.89,.093,'lance','ivory','ochre');
        let link=k.bone(staff,0,.63,-.16);
        for(let j=0;j<5;j++){
          rim(k,link,'black',.081,.019);
          link.rotation.y=j%2?PI/2:0;
          effects.push(link);link=k.bone(link,0,.115,0);
        }
        k.mesh(link,'gem','red',0,.08,.03,.104,.134,.092);
      }
      break;
    case 'thorns':
      for(const side of flanks)for(let i=0;i<4;i++){
        const arm=k.bone(body,side*(.113+i*.05),.514-i*.13,-.229);
        sweep(k,arm,'black',[[0,.03,.006,.036],[side*(.153+i*.02),.085,-.072,.062],
          [side*(.325+i*.07),.193-i*.087,-.32,.047],[side*(.482+i*.055),.338-i*.142,-.411,.004]],16,7);
        k.mesh(arm,'gem',i%3?'jade':'glow',side*(.267+i*.06),.122-i*.051,-.236,.061,.079,.059);
        effects.push(arm);
      }
      ritualPole(k,hand,.76,auspiciousPoleB,'jade');
      break;
    case 'armourRoll':{
      const roll=k.bone(body,-.182,.225,-.288);
      roll.rotation.z=.37;
      volume(k,roll,'red',[[0,-.54,0,.119,.092],[0,-.381,0,.182,.134],[0,.01,-.007,.194,.141],
        [0,.414,.003,.164,.119],[0,.512,-.027,.09,.073]],18,2.51,.23);
      for(let i=0;i<5;i++){
        const strap=k.bone(roll,0,-.37+i*.191,0);strap.rotation.x=PI/2;
        rim(k,strap,'ochre',.168,.025);
      }
      solidBlade(k,hand,.91,.083,'sabre','ochre');
      break;
    }
  }
  return sourcePose(entry,body,head,pose=>{
    const [gather,swing,rate]=info.pace;
    const {beat,wind,strike,headtime}=pose;
    poseHumanoid(rig,pose,{gather,swing,spread:.19});
    hand.rotation.z=.41+wind*.69-strike*.94;
    hand.rotation.x=-.17+wind*.45-strike*.74;
    off.rotation.x=.13-pose.wind*.42+pose.strike*.55;
    if(effect){
      effect.base.rotation.z=headtime*rate;
      effect.base.scale.setScalar(.87+wind*.17+strike*.29);
    }
    for(const [i,joint] of effects.entries()){
      joint.rotation.x=Math.sin(beat*.83+i*.55)*.071+wind*.24-strike*.21;
      joint.rotation.z=Math.cos(headtime*(2.8+rate)+i*.49)*.105+strike*.29;
    }
  },['courtBlade','bow','lute','thorns'].includes(info.gear)?'hover':'duel');
}

function windCavalry(k,entry){
  const body=k.bone(k.root,0,1.03,-.032),mount=k.bone(body,0,-.41,.04);
  const rig=humanoid(k,{torso:[.26,.34,.37,.214],waist:.25,neck:.79,shell:'ochre',
    skirt:'red',rear:'black',height:1.21,robe:.69,collar:.33});
  rig.body.position.set(.14,.071,-.228);body.add(rig.body);
  volume(k,mount,'brass',[[0,-.071,-.61,.184,.171],[0,-.039,-.355,.31,.236],[0,.022,.059,.375,.255],
    [0,.095,.475,.278,.212],[0,.151,.688,.189,.14]],21,2.62,.22);
  const prow=k.bone(mount,0,.143,.63);
  volume(k,prow,'ivory',[[0,-.11,-.09,.14,.106],[0,.068,-.11,.232,.156],[0,.13,.057,.211,.13],
    [0,.067,.188,.151,.085],[0,.025,.313,.114,.073]],18,2.6,.19);
  const flares=[],wheelers=[];
  for(const side of flanks){
    const f=x=>side*x;
    const track=k.bone(mount,f(.33),-.284,.07);
    for(let i=0;i<3;i++){
      const hub=k.bone(track,0,-.096,.31-.34*i);hub.rotation.y=PI/2;
      rim(k,hub,'ivory',.18,.047);rim(k,hub,'brass',.134,.026,.06);
      for(let p=0;p<7;p++){
        const a=p*TAU/7;
        sweep(k,hub,'brass',[[0,0,.04,.026],[Math.sin(a)*.089,Math.cos(a)*.089,.056,.021],
          [Math.sin(a)*.148,Math.cos(a)*.148,.048,.014]],7,6);
      }
      wheelers.push(hub);
    }
    const pennon=k.bone(mount,f(.424),.168,-.19);
    for(let i=0;i<4;i++)vane(k,pennon,i%2?'red':'brass',[0,.064,.022],
      [f(.09+i*.054),.121,-.18],[f(.145+i*.058),-.311-i*.06,-.589],.079,3+i);
    flares.push(pennon);
    sweep(k,prow,'brass',[[f(.096),.102,.129,.036],[f(.23),.158,.104,.043],
      [f(.292),.219,-.058,.030],[f(.321),.251,-.109,.003]],11,7);
    k.mesh(prow,'gem','glow',f(.132),.108,.201,.033,.021,.015,0,f(.39));
  }
  const lance=k.bone(rig.limbs[1].wrist,.024,-.033,.054);solidBlade(k,lance,1.13,.088,'lance','steel','ochre');
  return sourcePose(entry,body,rig.head,pose=>{
    poseHumanoid(rig,pose,{gather:.75,swing:.79});
    lance.rotation.set(.53+pose.wind*.46-pose.strike*.83,.18,-.91-pose.wind*.42+pose.strike*.37);
    for(const [i,w] of wheelers.entries())w.rotation.z=pose.headtime*(1.8+pose.travel*4.8)+i*1.5;
    for(const [i,p] of flares.entries())p.rotation.x=Math.sin(pose.beat*.87+i*.8)*.15+pose.travel*.31+pose.strike*.17;
  },'gallop');
}

const rancourRelics={
  m035:{metal:'clay',arch:'ochre',guard:'axe',orbit:5,span:.603,tempo:1.36},
  m036:{metal:'cobalt',arch:'steel',guard:'sabre',orbit:6,span:.623,tempo:1.08},
  m037:{metal:'moss',arch:'jade',guard:'lance',orbit:4,span:.652,tempo:1.65},
  m038:{metal:'brass',arch:'ochre',guard:'sabre',orbit:7,span:.672,tempo:1.82},
};
function rancour(k,entry){
  const a=rancourRelics[entry.id];
  const rig=humanoid(k,{torso:[.30,.38,.43,.24],waist:.34,neck:.93,skin:'ochre',shell:'black',
    skirt:'black',rear:a.metal,robe:1.22,dress:1.15,edge:'brass',hair:'ivory',collar:.38});
  const {body,head}=rig;
  const weapon=k.bone(rig.limbs[1].wrist,.04,-.03,.07);
  solidBlade(k,weapon,a.guard==='axe'?.98:1.27,a.guard==='axe'?.217:.115,a.guard,a.metal,'black');
  const eye=k.bone(rig.limbs[0].wrist,-.048,-.17,.093);
  volume(k,eye,'lilac',[[0,-.19,-.062,.067,.075],[.018,-.084,-.023,.13,.134],[0,.051,-.03,.161,.151],
    [0,.133,-.01,.115,.098],[.04,.21,.029,.045,.039]],15,3.12,.32);
  for(const side of flanks){
    const f=x=>side*x;
    for(let i=0;i<5;i++){
      vane(k,head,i%3?'ivory':a.arch,[f(.032+i*.029),.174,-.016],[f(.133+i*.021),.079-i*.045,-.091],
        [f(.196+i*.042),-.143-i*.074,-.234],.078,14+i);
      const rib=k.bone(body,0,.649-i*.116,-.194);
      sweep(k,rib,a.metal,[[f(.052),.048,-.076,.039],[f(.227),.099,-.07,.043],
        [f(.373),-.036,-.032,.034],[f(.412),-.114,-.013,.005]],11,7);
    }
    for(let i=0;i<3;i++){
      const claw=k.bone(eye,f(.081),i*.109-.091,.014);
      sweep(k,claw,'black',[[0,.006,.023,.034],[f(.086),.093,-.017,.034],
        [f(.114),.165,-.073,.024],[f(.096),.221,-.129,.004]],11,6);
    }
  }
  const arc=k.bone(body,0,.694,-.327),runes=[];
  for(let i=0;i<a.orbit;i++){
    const angle=TAU*i/a.orbit,rune=k.bone(arc,Math.sin(angle)*a.span,Math.cos(angle)*a.span,.023);
    rune.rotation.z=-angle;
    k.mesh(rune,'gem','glow',0,0,.035,.077,.077,.055);
    rim(k,rune,a.arch,.103,.016);rim(k,rune,a.metal,.127,.011,-.023);
    for(let n=0;n<3;n++){
      const theta=n*TAU/3;
      sweep(k,rune,a.arch,[[Math.sin(theta)*.103,Math.cos(theta)*.11,.01,.022],
        [Math.sin(theta+.31)*.158,Math.cos(theta+.31)*.158,.027,.021],
        [Math.sin(theta+.49)*.19,Math.cos(theta+.49)*.19,.004,.002]],7,6);
    }
    runes.push({rune,angle});
  }
  return sourcePose(entry,body,head,pose=>{
    const {headtime,wind,strike,beat}=pose;
    poseHumanoid(rig,pose,{gather:a.tempo*.69,swing:a.tempo*.81});
    arc.rotation.z=headtime*a.tempo+wind*.4-strike*.6;
    for(const {rune,angle} of runes)rune.rotation.y=Math.sin(headtime*2.4+angle)*.37+wind*.41;
    weapon.rotation.set(-.29+wind*.34-strike*.87,.1,.28+wind*.39-strike*1.34);
    eye.rotation.z=Math.sin(beat*.71)*.19-wind*.31;
    eye.scale.setScalar(.91+wind*.28+strike*.32);
  },'duel');
}

const titans={
  m043:{mask:'brass',armour:'black',ridge:'lilac',type:'hammer',rings:3,finish:'lightning',size:1},
  m044:{mask:'brass',armour:'cobalt',ridge:'lilac',type:'guard',rings:4,finish:'ice',size:1},
  m045:{mask:'brass',armour:'moss',ridge:'lilac',type:'claws',rings:3,finish:'wind',size:1},
  m046:{mask:'brass',armour:'clay',ridge:'lilac',type:'blades',rings:4,finish:'fire',size:1},
  m047:{mask:'ochre',armour:'black',ridge:'brass',type:'hammer',rings:4,finish:'lightning',size:1.19},
  m048:{mask:'steel',armour:'cobalt',ridge:'steel',type:'guard',rings:5,finish:'ice',size:1.16},
  m049:{mask:'jade',armour:'moss',ridge:'jade',type:'claws',rings:4,finish:'wind',size:1.15},
  m050:{mask:'clay',armour:'clay',ridge:'clay',type:'blades',rings:5,finish:'fire',size:1.22},
};

function altarTitan(k,entry,mobile){
  const a=titans[entry.id],levitates=a.size>1;
  const rig=humanoid(k,{torso:[.45,.62,.65,.33],waist:.441,neck:.61,shell:a.armour,skin:'ochre',skirt:'black',
    rear:a.armour,edge:'brass',height:1.03,robe:.59,dress:levitates?.53:.38,hair:'black',width:.47,collar:.23});
  const {body,head}=rig;
  body.scale.x=a.size;
  const limbs=[];
  for(const {side,shoulder,elbow,wrist} of rig.limbs){
    const f=x=>side*x;
    shoulder.scale.set(1.32,1.15,1.22);
    const visor=k.bone(head,f(.121),.104,.145);
    visor.rotation.y=f(.29);
    plate(k,visor,a.mask,[[-.08,-.397,-.09],[.17,-.137,-.017],[.182,-.005,-.04],
      [.283,.128,-.18],[.194,.257,-.222],[.08,.131,-.09],[.022,.097,.036],[-.066,.04,.02]],.063,.016);
    sweep(k,visor,'brass',[[f(.018),-.229,-.032,.019],[f(.122),-.07,.014,.033],
      [f(.169),.076,-.093,.032],[f(.163),.188,-.16,.004]],12,7);
    const crest=k.bone(head,0,.189,-.020);
    const sections=[[f(.074),-.081,.162,.053],[f(.131),.098,.063,.079],[f(.114),.235,-.076,.064],
      [f(.066),.427,-.221,.038],[f(.02),.521,-.233,.004]];
    sweep(k,crest,a.mask,sections,16,8);
    sweep(k,crest,'brass',sections.slice(1).map(([x,y,z,r])=>[x+f(.027),y,z+.037,r*.31]),11,6);
    for(let i=0;i<a.rings;i++){
      const field=k.bone(shoulder,f(.068+i*.037),.047-i*.082,0);
      plate(k,field,i%3===0?'brass':a.armour,[[f(.006),.116,-.208],
        [f(.212),.145,-.183],[f(.274),.028,-.062],[f(.212),-.101,.163],
        [f(.049),-.071,.193],[f(-.022),.032,.036]],.061,.012);
      sweep(k,field,'brass',[[f(.083),.122,-.218,.022],[f(.192),.11,-.214,.029],
        [f(.274),.006,-.053,.026],[f(.19),-.084,.165,.006]],10,7);
    }
    const fist=k.bone(wrist,f(.017),-.051,.045);
    volume(k,fist,a.armour,[[0,.093,-.041,.106,.101],[f(.038),-.027,-.003,.183,.147],
      [f(.08),-.135,.057,.196,.157],[f(.089),-.24,.11,.151,.144]],20,3.1,.24);
    const crown=k.bone(fist,f(.064),-.08,.164);
    rim(k,crown,'brass',.125,.025,.03);
    k.mesh(crown,'gem','glow',0,0,.049,.068,.073,.049);
    const socket=k.bone(elbow,f(.077),-.119,.079);
    volume(k,socket,'black',[[0,.081,-.069,.14,.12],[f(.036),-.082,-.036,.228,.196],
      [f(.063),-.261,-.017,.218,.179],[f(.049),-.347,0,.129,.104]],17,3.08,.21);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.085;
      if(a.type==='hammer')plate(k,fist,'ochre',[[x-.04,-.061,.091],[x+.041,-.084,.093],
        [x+.068,-.225,.20],[x+.032,-.29,.29],[x-.065,-.258,.237]],.054,.013);
      else if(a.type==='guard')plate(k,fist,a.ridge,[[x-.037,-.041,.083],[x+.05,-.055,.09],
        [x+.07,-.26,.282],[x+.034,-.393,.339],[x-.069,-.28,.216]],.053,.014);
      else sweep(k,fist,i%2?'brass':a.ridge,[[x,-.113,.087,.043],[x+f(.029),-.264,.207,.041],
        [x+f(.073),-.385,.251,.035],[x+f(.022),-.484,.304,.003]],12,7);
    }
    const sigil=k.bone(elbow,f(.08),-.14,.225);
    if(a.finish==='lightning'){
      sweep(k,sigil,'glow',[[-.035,-.148,0,.014],[.056,-.015,.036,.019],[-.027,.012,.032,.018],
        [.03,.135,-.028,.006]],10,6);
    }else if(a.finish==='ice'){
      for(let j=0;j<5;j++)sweep(k,sigil,'steel',[[0,.015,0,.029],
        [f(.07*j-.11),.091,-.02,.027],[f(.07*j-.12),.18+Math.cos(j)*.08,-.029,.002]],10,6);
    }else if(a.finish==='wind'){
      for(let j=0;j<3;j++)vane(k,sigil,'jade',[0,-.07,-.04],[f(.12+j*.045),.01,-.022],
        [f(.06+j*.075),.182,-.075],.056,j+53);
    }else for(let j=0;j<5;j++)vane(k,sigil,j%2?'clay':'glow',[0,-.08,.02],[f(.03+j*.025),.132,-.021],
      [f(.07+j*.036),.205+Math.sin(j)*.11,-.09],.044,j+87);
    for(let i=0;i<4;i++){
      const v=k.bone(body,f(.18+i*.083),.43+i*.025,-.277);
      sweep(k,v,levitates?a.ridge:'brass',[[0,0,0,.066],[f(.057),.16,-.045,.075],
        [f(.099),.27+i*.025,-.15,.038],[f(.133),.39+i*.053,-.192,.005]],10,7);
    }
    limbs.push({crown,sigil,fist,side});
  }
  const medallion=k.bone(body,0,-.057,.357);rim(k,medallion,'brass',.166,.038);
  rim(k,medallion,a.ridge,.119,.025,.053);k.mesh(medallion,'gem','glow',0,0,.077,.051,.081,.031);
  const platform=k.bone(body,0,-.471,-.046),mist=[];
  if(levitates){
    const limit=mobile?7:11;
    for(let i=0;i<limit;i++){
      const angle=TAU*i/limit, r=.5+(i%2)*.09;
      const glyph=k.bone(platform,Math.sin(angle)*r,-.21+Math.sin(i*3.2)*.08,Math.cos(angle)*r);
      glyph.rotation.y=angle;
      sweep(k,glyph,i%2?'steel':a.ridge,[[-.095,.127,-.023,.099],[.035,.071,.057,.138],
        [.151,-.009,.083,.111],[.29,-.043,.031,.009]],12,7);
      mist.push(glyph);
    }
  }
  return sourcePose(entry,body,head,pose=>{
    const {headtime,wind,strike}=pose;
    poseHumanoid(rig,pose,{gather:levitates?.8:1.17,swing:a.type==='blades'?1.51:.89,spread:.23});
    head.rotation.z=Math.sin(headtime*2)*.073+wind*.115-strike*.21;
    for(const {crown,sigil,fist,side} of limbs){
      const cadence=side*(.12+wind*.34-strike*.45);
      crown.rotation.z=headtime*(levitates?1.7:1.2)+side*.23;
      sigil.rotation.y=headtime*.68*side+wind*1.2;
      fist.rotation.y=cadence;
    }
    platform.rotation.y=headtime*.46+wind*.73;
    for(const [i,j] of mist.entries())j.rotation.x=Math.sin(headtime*1.6+i*.77)*.21;
  },levitates?'hover':'slam');
}

const tombGuardians={
  m052:{face:'ivory',back:'steel',coat:'cobalt',blade:'ice',size:1.14},
  m053:{face:'black',back:'clay',coat:'ochre',blade:'fire',size:1},
  m054:{face:'ochre',back:'brass',coat:'black',blade:'light',size:.96},
  m057:{face:'steel',back:'cobalt',coat:'ochre',blade:'tide',size:1.09},
  m058:{face:'ivory',back:'jade',coat:'moss',blade:'roots',size:1.05},
};
function tombGuardian(k,entry,mobile){
  const a=tombGuardians[entry.id],crawler=a.blade==='ice';
  const body=k.bone(k.root,0,crawler?.82:.89,0),neck=k.bone(body,0,.124,.455),head=k.bone(neck,0,.161,.316);
  body.scale.x=a.size;
  volume(k,body,a.coat,[[0,.085,-.756,.141,.139],[0,.020,-.569,.277,.243],[0,.073,-.151,.375,.327],
    [0,.078,.262,.382,.291],[0,.09,.492,.235,.162]],24,2.31,.25,crawler);
  volume(k,neck,a.back,[[0,-.098,-.164,.217,.151],[0,-.019,-.01,.233,.186],
    [0,.126,.173,.176,.179],[0,.171,.316,.148,.131]],17,2.39,.23);
  volume(k,head,a.face,[[0,.053,-.205,.157,.142],[0,.036,-.059,.204,.169],
    [0,-.02,.123,.189,.143],[0,-.151,.273,.121,.095],[0,-.182,.39,.082,.061]],20,2.6,.25,crawler);
  const jaw=k.bone(head,0,-.19,.043);
  volume(k,jaw,'black',[[0,-.072,-.091,.101,.08],[0,-.039,.053,.139,.084],
    [0,-.009,.20,.101,.066],[0,.007,.289,.081,.029]],15,2.28,.23);
  const legs=[],blades=[],links=[];
  for(const side of flanks){
    const f=x=>side*x;
    const horns=k.bone(head,f(.155),.076,-.011);
    const height=crawler?.75:a.blade==='fire'?.58:a.blade==='light'?.83:a.blade==='tide'?1.13:1.01;
    const wide=a.blade==='tide'?.55:1;
    sweep(k,horns,'brass',[[0,0,.031,.079],[f(.117),height*.235,.066,.077],
      [f(.233*wide),height*.54,-.039,.059],[f(.169*wide),height*.91,-.129,.044],[f(.187*wide),height,-.181,.004]],16,8);
    sweep(k,horns,'glow',[[f(.064),height*.116,.068,.029],[f(.149),height*.381,.088,.031],
      [f(.20*wide),height*.65,-.026,.024],[f(.17*wide),height*.949,-.121,.003]],14,7);
    k.mesh(head,'gem','glow',f(.129),-.024,.189,.051,.024,.03,0,f(.5),-f(.23));
    for(let i=0;i<4;i++)sweep(k,jaw,'ivory',[[f(.034+i*.022),.02,.235-i*.048,.019],
      [f(.052+i*.021),.078,.222-i*.045,.018],[f(.054+i*.022),.115-i*.012,.2-i*.042,.004]],7,6);
    for(let i=0;i<(mobile?5:8);i++){
      const mount=k.bone(body,f(.28+i*.011),.15-i*.024,.431-i*.136);
      const fall=-.33-i*.049,slope=.18+.04*Math.cos(i*3),x=.208+(7-i)*.012;
      if(a.blade==='ice')vane(k,mount,i%2?'steel':'ivory',[0,-.02,.06],[f(x*.65),slope,-.011],
        [f(x),slope+.142,fall],.093,5+i);
      else plate(k,mount,i%3===1?a.back:'brass',[[0,-.02,.103],[f(x*.52),.26,.088],
        [f(x),slope+.2,-.11],[f(x*.94),slope+.06,fall],[f(x*.54),-.035,fall*.49],[f(.04),-.05,.043]],.057,.016);
      sweep(k,mount,'glow',[[f(.036),-.008,.103,.019],[f(x*.64),slope+.116,.038,.021],
        [f(x*.92),slope+.138,-.116,.016],[f(x*.88),slope+.06,fall,.003]],10,6);
      blades.push({mount,i,side});
    }
    for(const front of [false,true]){
      const leg=k.bone(body,f(front?.262:.241),-.067,front?.379:-.482);
      const knee=k.bone(leg,f(.092),-.318,front?.024:-.157);
      const paw=k.bone(knee,f(.027),-.335,front?.089:.115);
      volume(k,leg,a.back,[[0,.097,-.01,.154,.148],[f(.059),-.066,.014,.181,.153],
        [f(.088),-.239,front?.027:-.11,.124,.107],[f(.092),-.32,front?.026:-.161,.086,.079]],15,2.48,.19);
      volume(k,knee,a.coat,[[0,.042,.017,.091,.094],[f(.047),-.105,.013,.104,.086],
        [f(.039),-.239,front?.011:.082,.082,.081],[f(.029),-.338,front?.08:.12,.077,.057]],14,2.41,.23);
      for(let i=0;i<3;i++)sweep(k,paw,i%2?'brass':'ivory',[[.039*(i-1),0,.035,.043],[.05*(i-1),-.065,.137,.040],
        [.052*(i-1),-.086,.217,.003]],8,7);
      legs.push({leg,knee,paw,front,side});
    }
  }
  let link=k.bone(body,0,.12,-.64);
  for(let i=0;i<7;i++){
    const r=.104-i*.012;
    const rise=(a.blade==='tide'||a.blade==='roots'?(i<4?.137:.03):i<3?.053:-.036);
    sweep(k,link,i%2?a.coat:a.back,[[0,0,.027,r],[.014,rise*.56,-.142,r*.91],
      [.023,rise,-.258,r*.83]],12,7);
    if(i>1)vane(k,link,i%2?'glow':a.back,[0,.024,-.051],[.011,.137,-.173],
      [.041,.272+i*.014,-.207],.066,21+i);
    links.push(link);link=k.bone(link,.023,rise,-.235);
  }
  return sourcePose(entry,body,head,({headtime,step,wind,strike,travel,stage})=>{
    neck.rotation.y=Math.sin(headtime*3.4)*.18+wind*.26-strike*.44;
    head.rotation.x=-wind*.55+strike*.43;
    jaw.rotation.x=wind*.25+strike*.76;
    for(const {leg,knee,paw,side,front} of legs){
      const pace=Math.sin(step+side*PI*.5+(front?0:PI));
      leg.rotation.x=pace*(.11+travel*.66)+wind*.21-strike*.36*Number(front);
      knee.rotation.x=.17-Math.max(0,pace)*travel*.4+wind*.17;
      paw.rotation.x=-leg.rotation.x*.38+strike*.11;
    }
    for(const {mount,i,side} of blades)mount.rotation.z=side*(Math.sin(headtime*4.3+i*.27)*.105+wind*.31+strike*.18+stage*.14);
    for(const [i,t] of links.entries())t.rotation.y=Math.sin(headtime*3.6-i*.41)*(.145+travel*.14)-wind*.14+strike*.19;
  },crawler?'crawl':'gallop');
}

function ancientKnowledge(k,entry,mobile){
  const body=k.bone(k.root,0,1.11,.03),neck=k.bone(body,0,.21,.612);
  const head=k.bone(neck,-.041,.67,.501),jaw=k.bone(head,0,-.159,.17);
  volume(k,body,'jade',[[0,-.097,-.617,.163,.145],[0,.016,-.406,.294,.221],[0,.042,-.057,.341,.316],
    [0,.094,.354,.299,.239],[0,.207,.66,.186,.144]],23,2.20,.25);
  volume(k,neck,'jade',[[0,-.071,-.089,.176,.146],[-.042,.134,.129,.213,.177],
    [-.074,.348,.307,.172,.149],[-.068,.567,.462,.154,.137],[-.045,.672,.498,.139,.115]],22,2.29,.23);
  volume(k,head,'jade',[[0,.084,-.27,.18,.138],[0,.057,-.075,.242,.174],[0,.011,.181,.175,.137],
    [0,-.035,.375,.13,.071],[0,-.053,.482,.113,.052]],21,2.41,.25);
  volume(k,jaw,'ivory',[[0,-.044,-.049,.165,.055],[0,-.066,.121,.156,.069],[0,-.052,.31,.089,.039]],15,2.25,.21);
  const moustaches=[],legs=[],tails=[];
  for(const side of flanks){
    const f=x=>side*x;
    const whisker=k.bone(head,f(.158),-.066,.356);
    sweep(k,whisker,'ivory',[[0,0,0,.029],[f(.185),.095,.232,.026],
      [f(.35),.268,.220,.023],[f(.502),.434,.106,.005],[f(.697),.568,-.053,.001]],19,6);
    moustaches.push(whisker);
    k.mesh(head,'gem','glow',f(.16),.019,.232,.044,.024,.024,0,f(.43));
    for(let i=0;i<6;i++){
      sweep(k,head,i%2?'clay':'brass',[[f(.082+i*.028),.121,-.036-i*.024,.047],
        [f(.158+i*.045),.194+i*.041,-.108-i*.051,.044],
        [f(.233+i*.044),.342+i*.041,-.274-i*.054,.024],
        [f(.261+i*.055),.341+i*.052,-.364-i*.06,.003]],12,7);
      for(const p of [body,neck])vane(k,p,i%2?'jade':'moss',[f(.083+i*.007),.259,.36-i*.14],
        [f(.17),.371,.213-i*.13],[f(.21),.463,.127-i*.14],.062,3+i*2);
    }
    for(let i=0;i<5;i++)sweep(k,neck,'ivory',[[f(.118),.167+i*.082,.236+i*.05,.037],
      [f(.082),.14+i*.083,.32+i*.048,.041],[-f(.01),.118+i*.071,.349+i*.059,.033]],10,6);
    for(const front of [false,true]){
      const leg=k.bone(body,f(.287),-.061,front?.379:-.342);
      const knee=k.bone(leg,f(.081),-.337,front?.026:-.094);
      volume(k,leg,front?'jade':'steel',[[0,.089,0,.139,.129],[f(.048),-.037,.013,.164,.149],
        [f(.089),-.216,-.05,.128,.127],[f(.085),-.341,front?.018:-.098,.081,.079]],16,2.18,.18);
      volume(k,knee,'ivory',[[0,.042,.009,.082,.084],[f(.035),-.121,.046,.093,.082],
        [f(.059),-.321,.122,.066,.073],[f(.044),-.384,.164,.087,.056]],15,2.33,.23);
      for(let p=-1;p<2;p++)sweep(k,knee,'ivory',[[f(.032+p*.046),-.345,.12,.032],
        [f(.044+p*.054),-.40,.217,.029],[f(.04+p*.052),-.406,.304,.003]],8,6);
      legs.push({leg,knee,front,side});
    }
  }
  let tail=k.bone(body,0,.083,-.613);
  for(let i=0;i<(mobile?7:9);i++){
    const r=.141-i*.013;
    sweep(k,tail,'jade',[[0,0,.037,r],[.016,.051,-.131,r*.94],[.023,.073,-.253,r*.91]],12,8);
    sweep(k,tail,'steel',[[0,r*.51,-.035,r*.62],[.011,r+.06,-.106,r*.52],
      [.023,r+.112,-.197,.003]],9,7);
    tails.push(tail);tail=k.bone(tail,.023,.073,-.234);
  }
  return sourcePose(entry,body,head,({headtime,wind,strike,travel,step,stage})=>{
    neck.rotation.y=Math.sin(headtime*2.4)*.21+wind*.36-strike*.43;
    head.rotation.x=-wind*.34+strike*.49;
    jaw.rotation.x=wind*.23+strike*.66;
    for(const [i,w] of moustaches.entries())w.rotation.y=Math.sin(headtime*3.3+i*PI)*.22-wind*.37+strike*.28;
    for(const {leg,knee,front,side} of legs){
      const t=Math.sin(step+side*PI*.5+Number(front)*2.7);
      leg.rotation.x=t*(.11+travel*.46)+wind*.21-strike*.16;
      knee.rotation.x=Math.max(0,t)*travel*.54+wind*.14-strike*.09;
    }
    for(const [i,t] of tails.entries())t.rotation.y=Math.sin(headtime*3.8-i*.43)*(.18+travel*.17)+stage*.08;
  },'gallop');
}

const catalogue={m003:ironOni,m004:qinRider,m006:bandit,m007:regionalDragon,m009:woodSpirit,m010:constellation,m011:constellation,
  m012:constellation,m013:constellation,m018:firstEmperor,m019:ghostHydra,m020:iceGeneral,m022:iceTortoise,m023:butcher,m024:regionalDragon,
  m028:vixen,m029:ironCrutch,m030:shadowBat,m031:courtFigure,m032:courtFigure,m033:courtFigure,m034:vixen,
  m035:rancour,m036:rancour,m037:rancour,m038:rancour,m039:courtFigure,m040:courtFigure,m041:courtFigure,m042:windCavalry,
  m043:altarTitan,m044:altarTitan,m045:altarTitan,m046:altarTitan,m047:altarTitan,m048:altarTitan,m049:altarTitan,m050:altarTitan,
  m051:courtFigure,m052:tombGuardian,m053:tombGuardian,m054:tombGuardian,m055:ancientKnowledge,
  m056:courtFigure,m057:tombGuardian,m058:tombGuardian,m059:courtFigure};
export const finishesA=Object.fromEntries(Object.keys(catalogue).map(id=>[id,metals]));
export function sculptA(k,entry,mobile){
  return catalogue[entry.id]?.(k,entry,mobile)??null;
}
