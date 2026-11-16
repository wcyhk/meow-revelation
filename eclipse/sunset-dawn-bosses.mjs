import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);
export const valleyFinishes={
  m073:{
    vesperSilk:[0x712f38,.07,.83,'cloth'],vesperBurgundy:[0x461f2b,.05,.89,'cloth'],
    vesperGold:[0xb68b4d,.71,.52,'bronze'],vesperBlack:[0x27272d,.20,.76,'hide'],
    vesperSlate:[0x37405d,.53,.54,'iron'],vesperEnamel:[0x723c4f,.38,.63,'gem'],
  },
  m074:{
    riderSilk:[0x9d6746,.12,.82,'cloth'],riderLinen:[0xd8b584,.09,.82,'cloth'],
    riderBlack:[0x24252b,.13,.82,'hide'],riderStrap:[0x63343a,.22,.72,'hide'],
    riderWand:[0x763438,.28,.68,'hide'],riderSteel:[0x809391,.67,.55,'iron'],
    tigerFurMount:[0xb97139,.02,.89,'hide'],tigerCreamMount:[0xbda087,.02,.94,'hide'],
    tigerSootMount:[0x382b28,.022,.94,'hide'],
  },
  m077:{
    dawnSilk:[0xa6a8a1,.045,.91,'cloth'],dawnBrocade:[0x3d536c,.11,.84,'cloth'],
    dawnAzure:[0x58788b,.18,.78,'cloth'],dawnWood:[0x443c4c,.18,.73,'hide'],
    dawnBronze:[0x8c7355,.57,.62,'bronze'],dawnThread:[0xaabdc0,.11,.79,'cloth'],
    dawnRose:[0x753f48,.08,.80,'cloth'],dawnHair:[0x1c2532,.11,.76,'hide'],
  },
  m082:{
    biwaWood:[0x243348,.38,.61,'hide'],biwaFrame:[0x405c77,.72,.49,'iron'],
    biwaSilver:[0x7f9dac,.65,.56,'iron'],biwaDark:[0x151c2b,.10,.86,'cloth'],
    biwaGilt:[0x425a78,.57,.58,'bronze'],biwaLight:[0x346886,.51,.57,'gem'],
  },
};

function kit(k,mobile){
  const joint=(parent,name,x,y,z)=>{
    const a=k.bone(parent,x,y,z);
    a.name=name;
    return a;
  };
  const mass=(j,m,p,seed,section=2.44)=>k.geometry(j,m,
    sculptVolume(p,{rings:mobile?10:16,sides:mobile?9:13,seed,ridge:.19,section}));
  const plate=(j,m,p,d=.035)=>k.sculpt.plate(j,m,p,d,d*.33);
  const wire=(j,m,p)=>k.sculpt.sweep(j,m,p,{steps:mobile?8:13,sides:mobile?5:7,ridge:.15});
  const tuft=(j,m,p,w,seed)=>k.geometry(j,m,featherVane(...p,w,seed,mobile?7:11));
  return {joint,mass,plate,wire,tuft};
}

function cloth(silks,parent,name,path,tint,trim,phase,across,flex=.85,lining=0x353344){
  silks.push({parent,name,path,tint,trim,phase,across,flex,lining});
}

function fist(t,joint,skin,side){
  t.mass(joint,skin,[[0,.036,.012,.039,.041],[.016,-.004,.044,.059,.051],[.02,-.048,.085,.052,.038]],7.81+side);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.031;
    t.wire(joint,skin,[[x,.013,.054,.016],[x+.008,-.038,.092,.017],[x+.016,-.072,.109,.006]]);
  }
  t.wire(joint,skin,mirror(side,[[-.045,.007,.025,.016],[-.058,-.027,.064,.019],[-.033,-.054,.092,.006]]));
}

function biwaPlayer(k,t,body,head,mobile){
  const {joint,mass,plate,wire,tuft}=t;
  const veil=joint(head,'Biwa spirit overlapping nape hood',0,.151,-.087);
  mass(veil,'biwaDark',[[0,-.275,-.121,.103,.064],[0,-.181,-.100,.141,.095],[0,-.068,-.078,.178,.116],
    [0,.062,-.069,.163,.128],[0,.165,-.108,.111,.113],[0,.202,-.177,.041,.075]],22.87);
  const cuffs=[];
  const setTarget=new T.Vector3(),from=new T.Vector3(),to=new T.Vector3(),tip=new T.Vector3();
  const turn=new T.Quaternion(),rest=new T.Quaternion();
  for(const side of sides){
    const f=p=>mirror(side,p);
    const rim=f([[.011,.137,.055],[.097,.127,.078],[.173,.057,.073],[.195,-.024,.032],
      [.179,-.133,-.038],[.139,-.246,-.122],[.101,-.282,-.166]]);
    wire(veil,'biwaFrame',rim.map(([x,y,z],i)=>[x,y,z,[.006,.014,.022,.024,.019,.012,.003][i]]));
    wire(veil,'biwaSilver',rim.slice(1,6).map(([x,y,z],i)=>[x+side*.009,y+.013,z-.012,[.004,.009,.010,.007,.003][i]]));
    for(let i=0;i<(mobile?4:6);i++){
      const u=i*.045;
      const path=f([[.056+u,.027-u*.11,-.1],[.114+u,-.127-u*.23,-.196],[.149+u,-.296-u*.21,-.238-u*.35]]);
      tuft(veil,i%2?'biwaDark':'biwaFrame',path,.044,34.4+i);
    }
  }
  function fitArms(arms){
    for(const {root,elbow,hand,side} of arms){
      const f=p=>mirror(side,p);
      mass(root,'biwaDark',f([[0,.048,-.018,.073,.085],[.064,-.022,-.029,.139,.120],
        [.079,-.147,.019,.111,.091],[.091,-.276,.055,.073,.071]]),12.25+side);
      const spring=joint(elbow,'Biwa musician articulation '+side,side*.017,-.061,.064);
      mass(spring,'biwaDark',f([[0,.061,-.028,.056,.061],[.031,-.06,.023,.098,.081],
        [.038,-.142,.061,.081,.076],[.019,-.224,.088,.052,.058]]),11.8+side);
      for(let i=0;i<3;i++){
        const y=.01-i*.069;
        const part=f([[-.066,y-.012,.077],[.029,y+.045,.099],[.092,y+.023,.082],[.09,y-.048,.112],
          [.06,y-.079,.145],[-.048,y-.061,.104]]);
        plate(spring,i%2?'biwaGilt':'biwaFrame',part,.03);
        wire(spring,'biwaSilver',part.slice(1,5).map(([x,y,z],r)=>[x,y+.009,z+.018,[.003,.010,.009,.003][r]]));
      }
      fist(t,hand,'bBone',side);
      cuffs.push({spring,side});
    }
  }
  function weapons(arms){
    const grip=joint(arms[1].hand,'Ghost court herald biwa',0,-.038,.139);
    const play=joint(arms[0].hand,'Biwa fan-shaped plectrum',-.008,-.043,.108);
    const soundbox=[[0,-.94,.004,.038,.043],[0,-.85,.007,.182,.096],[0,-.70,.024,.258,.130],
      [0,-.535,.019,.225,.098],[0,-.357,.001,.153,.072],[0,-.191,-.024,.083,.056],[0,-.081,-.019,.046,.048]];
    mass(grip,'biwaWood',soundbox,22.4,2.1);
    mass(grip,'biwaFrame',[[0,-.275,-.001,.049,.052],[0,-.078,.012,.051,.047],[0,.157,.011,.043,.03],
      [0,.338,-.009,.036,.026],[0,.522,-.063,.049,.042],[0,.609,-.119,.028,.036]],17.5,2.81);
    const shoulder=[[0,-.157,.038],[.089,-.3,.073],[.202,-.482,.103],[.268,-.679,.153],
      [.176,-.843,.133],[.061,-.910,.071],[0,-.94,.071]];
    for(const side of sides){
      const f=p=>mirror(side,p),outline=f(shoulder);
      wire(grip,'biwaSilver',outline.map(([x,y,z],i)=>[x,y,z,[.006,.012,.016,.017,.015,.010,.004][i]]));
      wire(grip,'biwaLight',outline.map(([x,y,z],i)=>[x*.88,y-.006,z+.012,[.003,.008,.011,.012,.009,.006,.003][i]]));
      const channel=f([[.041,-.37,.079],[.081,-.46,.122],[.148,-.523,.146],[.18,-.603,.159],
        [.158,-.662,.163],[.107,-.69,.154],[.062,-.646,.144],[.103,-.585,.158],[.094,-.526,.144]]);
      plate(grip,'biwaGilt',channel,.019);
      wire(grip,'biwaLight',channel.slice(0,7).map(([x,y,z],i)=>[x,y,z+.015,[.003,.009,.011,.009,.008,.006,.003][i]]));
      for(let peg=0;peg<3;peg++){
        const y=.351+peg*.066;
        wire(grip,'biwaSilver',f([[.026,y,.023,.007],[.051,y+.008,.023,.012],[.075,y+.006,.014,.016],[.104,y-.002,.006,.008]]));
      }
    }
    for(let bridge=0;bridge<4;bridge++){
      const y=-.72+bridge*.224,span=.20-bridge*.042;
      wire(grip,bridge===0?'biwaSilver':'biwaFrame',[[-span*.58,y-.021,.102],[0,y+.004,.149,.015],[span*.58,y-.02,.096,.007]]
        .map(([x,y,z,r=.006])=>[x,y,z,r]));
    }
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.023;
      wire(grip,i%2?'biwaSilver':'biwaLight',[[x*1.22,-.817,.149,.004],[x,-.55,.167,.005],
        [x*.71,-.112,.091,.004],[x*.53,.416,.061,.003]]);
    }
    plate(play,'biwaSilver',[[-.051,-.026,.022],[.004,.023,.044],[.044,.004,.061],[.092,-.087,.078],
      [.061,-.155,.073],[-.011,-.139,.041]],.038);
    const tuning=joint(grip,'Biwa silver peg bracket',0,.344,-.009);
    plate(tuning,'biwaFrame',[[-.035,-.027,.029],[.037,-.024,.031],[.048,.107,.018],[.021,.177,-.012],
      [-.033,.153,.004]],.028);
    markEnemyWeapon(tuning,[0,.18,-.009],{from:[0,-.028,.031],width:.083,aim:false,kind:'focus'});
    return [play,grip];
  }
  return {fitArms,weapons,energy:[0x76cbff,'ribbons',[0,.47,-.21],[.73,.56,.46]],
    poseArms({beat,body,wind,strike,arms,left,right}){
      const [pluck,hold]=arms;
      hold.root.rotation.set(-.55-wind*.147+strike*.14,.23+wind*.10,.19+wind*.063);
      hold.elbow.rotation.set(-1.11-wind*.24+strike*.33,-.13+wind*.2,.18);
      right.rotation.set(1.61+wind*.19-strike*.25,.06+wind*.17,-1.39+wind*.28-strike*.16);
      body.localToWorld(setTarget.set(-.18+wind*.025,.256+wind*.04,.43+strike*.07));
      from.set(0,-.61,.174).normalize();
      right.worldToLocal(to.copy(setTarget)).normalize();
      turn.setFromUnitVectors(from,to).slerp(rest,.11);
      right.quaternion.multiply(turn);
      pluck.root.rotation.set(-.58-wind*.34+strike*.26,-.07,.34+wind*.19);
      pluck.elbow.rotation.set(-.98-wind*.45+strike*.83,.36+wind*.278-strike*.41,-.13);
      left.rotation.set(Math.sin(beat*.59)*.11+wind*.28-strike*.53,.22,-.21);
      const request=setTarget.set(.031-strike*.091,-.61+wind*.06-strike*.078,.174+wind*.12);
      right.localToWorld(request);
      for(let pass=0;pass<2;pass++)for(const pivot of [pluck.elbow,pluck.root]){
        left.localToWorld(tip.set(.067,-.113,.081));
        pivot.worldToLocal(from.copy(tip)).normalize();
        pivot.worldToLocal(to.copy(request)).normalize();
        turn.setFromUnitVectors(from,to);
        turn.slerp(rest,pivot===pluck.elbow?.36:.54);
        pivot.quaternion.multiply(turn);
      }
      for(const {spring,side} of cuffs)spring.rotation.z=side*(wind*.11-strike*.13);
    }};
}

function shadeCanopy(k,j,mobile){
  const ribs=mobile?40:64,steps=mobile?8:12,vertices=[],colors=[],uv=[],tri=[];
  for(let ring=0;ring<=steps;ring++){
    const t=ring/steps,y=.134*(1-t**2.20)-.108*t,zSag=.008+.602*t;
    for(let i=0;i<=ribs;i++){
      const a=i/ribs*Math.PI*2,b=Math.cos(a*8),wave=Math.sin(a*3+1.7);
      const radius=zSag*(1+.043*b*t),seam=.022*(b*.5+.5)*t+.021*wave*t;
      vertices.push(Math.sin(a)*radius,y-seam,Math.cos(a)*radius);
      const leaf=Math.max(0,Math.sin(a*4+t*16.3))**6*Math.max(0,Math.sin(t*24-a*3))**4;
      const tint=.81+.115*b+leaf*.12-t*.14;
      colors.push(tint*.90,tint*.98,tint);
      uv.push(i/ribs,t);
      if(ring<steps&&i<ribs){
        const a=ring*(ribs+1)+i,b=a+ribs+1;
        tri.push(a,b,b+1,a,b+1,a+1);
      }
    }
  }
  const count=vertices.length/3,outer=tri.length;
  for(let i=0;i<count;i++){
    vertices.push(vertices[i*3],vertices[i*3+1]-.01,vertices[i*3+2]);
    colors.push(colors[i*3]*.79,colors[i*3+1]*.81,colors[i*3+2]*.86);
    uv.push(uv[i*2],uv[i*2+1]);
  }
  for(let i=0;i<outer;i+=3)tri.push(count+tri[i+2],count+tri[i+1],count+tri[i]);
  const geo=new T.BufferGeometry().setIndex(tri);
  geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  k.geometry(j,'dawnBrocade',geo);
}

function dawnRobe(k,t,body,head,mobile){
  const {joint,mass,plate,wire,tuft}=t,silks=[],wraps=[];
  mass(body,'dawnSilk',[[0,-.25,-.039,.229,.187],[0,.024,-.02,.231,.205],
    [0,.293,-.025,.279,.206],[0,.527,-.044,.282,.191],[0,.71,-.035,.19,.13],[0,.777,-.006,.11,.101]],9.62);
  const hair=joint(head,'Dawn Taoist folded blue kerchief',0,.106,-.052);
  mass(hair,'dawnHair',[[0,-.147,-.104,.105,.088],[.008,-.043,-.078,.139,.115],
    [.01,.091,-.049,.151,.133],[.013,.158,-.037,.119,.103],[.024,.199,-.084,.071,.084]],19.8);
  plate(hair,'dawnAzure',[[-.134,.037,.079],[-.068,.097,.107],[.057,.103,.118],[.122,.033,.092],
    [.11,-.009,.116],[.007,.049,.146],[-.108,-.014,.106]],.025);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const wrist=f([[.012,.642,.147],[.113,.59,.189],[.189,.47,.204],[.246,.373,.153],
      [.192,.266,.182],[.102,.337,.238],[.046,.493,.219]]);
    plate(body,side<0?'dawnBrocade':'dawnAzure',wrist,.043);
    wire(body,'dawnThread',wrist.slice(1,6).map(([x,y,z],i)=>[x,y+.008,z+.031,[.004,.014,.017,.011,.003][i]]));
    const back=f([[.032,.649,-.132],[.119,.622,-.191],[.216,.546,-.197],[.246,.453,-.166],
      [.179,.381,-.236],[.08,.423,-.229],[.027,.498,-.168]]);
    plate(body,'dawnBrocade',back,.036);
    wire(body,'dawnBronze',back.slice(1,6).map(([x,y,z],i)=>[x,y-.011,z-.020,[.004,.012,.012,.009,.003][i]]));
    for(let i=0;i<3;i++){
      const u=i*.037;
      const path=f([[.099+u,.11-.039*i,-.022],[.154+u,.033-.058*i,-.086],[.181+u,-.153-.083*i,-.166]]);
      tuft(hair,i%2?'dawnAzure':'dawnHair',path,.038+i*.011,23+i);
    }
    cloth(silks,body,'道士如 · 織雪外衣 '+side,f([[.113,.179,.193,.107],[.169,-.196,.243,.178],
      [.226,-.587,.316,.196],[.256,-1.026+side*.062,.337,.142]]),0xb3b0a5,0x516d85,side*.64,[.96,0,side*.16],.77,0x465269);
    cloth(silks,body,'道士如 · 藍雲背幅 '+side,f([[.131,.541,-.179,.115],[.186,.219,-.237,.160],
      [.216,-.295,-.320,.195],[.245,-.982,-.392,.171]]),0x405c76,0xa8abb0,side*.82,[.98,0,side*.14],.98);
    cloth(silks,body,'道士如 · 飄雪交帶 '+side,f([[.056,.182,.223,.058],[.107,-.091,.27,.083],
      [.122,-.427,.34,.094],[.129,-.766+side*.034,.402,.066]]),0x6f8192,0xc1c4b9,side*.96,[.94,0,side*.23],1.13);
  }
  function fitArms(arms){
    for(const {root,elbow,hand,side} of arms){
      const f=p=>mirror(side,p);
      mass(root,'dawnBrocade',f([[0,.049,-.018,.078,.081],[.059,-.041,-.038,.139,.119],
        [.073,-.162,-.026,.122,.102],[.095,-.267,.023,.074,.078]]),21.9+side);
      const sleeve=joint(elbow,'Dawn flowing sleeve articulation '+side,side*.014,-.043,.037);
      mass(sleeve,'dawnSilk',f([[0,.066,0,.062,.057],[.037,-.042,.036,.121,.092],[.059,-.145,.042,.148,.129],
        [.044,-.256,.076,.141,.121]]),14.6+side);
      const edge=f([[-.086,-.14,.093],[-.038,-.238,.170],[.053,-.268,.192],[.141,-.23,.141],
        [.176,-.159,.044],[.067,-.18,-.015],[-.067,-.164,.026]]);
      plate(sleeve,'dawnBrocade',edge,.031);
      wire(sleeve,'dawnThread',edge.slice(0,5).map(([x,y,z],i)=>[x,y-.006,z+.021,[.003,.013,.018,.014,.004][i]]));
      fist(t,hand,'bFlesh',side);
      wraps.push({sleeve,side});
    }
  }
  function weapons(arms){
    const free=joint(arms[0].hand,'Dawn open casting hand',0,-.032,.091);
    const shade=joint(arms[1].hand,'Open silk water parasol',.005,-.049,.093);
    const staff=joint(shade,'Dawn umbrella grip and shaft',0,0,0);
    mass(staff,'dawnWood',[[0,-.365,0,.018,.019],[0,-.208,0,.028,.031],[0,.016,.013,.024,.027],
      [0,.461,.019,.022,.021],[.017,.901,.011,.018,.018],[.022,1.183,-.011,.02,.022]],51.55);
    wire(staff,'dawnBronze',[[-.009,-.126,.029,.004],[.022,-.038,.023,.009],
      [.027,.039,.029,.011],[.014,.096,.021,.004]]);
    const cap=joint(shade,'Dawn lacquered umbrella canopy',.022,1.181,-.011);
    shade.userData.canopy=cap;
    shadeCanopy(k,cap,mobile);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4,x=Math.sin(a),z=Math.cos(a);
      wire(cap,i%2?'dawnBronze':'dawnAzure',[[x*.035,.114,z*.035,.009],[x*.188,.095,z*.188,.015],
        [x*.374,.024,z*.374,.014],[x*.531,-.074,z*.531,.012],[x*.638,-.174,z*.638,.004]]);
      wire(cap,'dawnThread',[[x*.032,.13,z*.032,.004],[x*.216,.091,z*.216,.009],
        [x*.409,.043,z*.409,.007],[x*.616,-.093,z*.616,.004]]);
      const end=joint(cap,'Dawn shade braided tip '+i,x*.615,-.155,z*.615);
      wire(end,i%3?'dawnRose':'dawnBronze',[[0,.02,0,.009],[x*.014,-.061,z*.01,.019],
        [x*.025,-.129,z*.03,.014],[x*.033,-.161,z*.052,.003]]);
    }
    k.mesh(cap,'gem','dawnRose',0,.17,0,.04,.054,.04);
    markEnemyWeapon(staff,[.022,1.183,-.011],{from:[0,-.34,0],width:.083,aim:false,kind:'focus'});
    return [free,shade];
  }
  return {silks,fitArms,weapons,energy:[0x91cef4,'mist',[0,.23,-.32],[.61,.65,.39]],
    poseArms({beat,wind,strike,travel,arms,right}){
      const [open,carry]=arms;
      carry.root.rotation.set(-.49-wind*.4+strike*.36,.35+wind*.13,.31+wind*.21);
      carry.elbow.rotation.set(-1.02-wind*.22+strike*.45,-.16,.19);
      right.rotation.set(1.21+wind*.251-strike*.56,.22-wind*.33+strike*.45,-.24+wind*.32+strike*.54);
      right.userData.canopy.rotation.y=Math.sin(beat*.53)*.131+wind*.73+strike*1.29;
      open.root.rotation.x=-.51-wind*.72-strike*.5;
      open.elbow.rotation.x=-.64-wind*.34+strike*.55;
      hair.rotation.x=Math.sin(beat*.53)*.048-travel*.11+strike*.17;
      for(const {sleeve,side} of wraps)sleeve.rotation.z=side*(wind*.095+strike*.27);
    }};
}

function vesperTaoist(k,t,body,head,mobile){
  const {joint,mass,plate,wire,tuft}=t,silks=[],loops=[];
  const cap=joint(head,'Sunset tiered Taoist headdress',0,.131,-.079);
  mass(cap,'vesperBlack',[[0,-.062,-.023,.126,.119],[0,.032,-.027,.169,.144],
    [-.009,.091,-.044,.152,.14],[0,.151,-.063,.128,.124],[.016,.226,-.122,.093,.092],
    [.019,.27,-.173,.045,.057]],22.41);
  mass(body,'vesperSilk',[[0,-.213,-.04,.232,.197],[0,-.028,-.031,.257,.233],
    [0,.263,-.039,.318,.242],[0,.489,-.049,.341,.256],[0,.644,-.048,.284,.192],[0,.781,-.031,.141,.136]],12.98);
  const collar=joint(body,'Sunset upright silk collar',0,.473,-.065);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const curl=f([[.013,.221,-.013],[.109,.248,-.075],[.163,.202,-.16],
      [.156,.137,-.18],[.084,.179,-.093],[.015,.168,-.036]]);
    plate(cap,'vesperGold',curl,.036);
    wire(cap,'vesperBurgundy',curl.slice(0,4).map(([x,y,z],i)=>[x,y+.015,z+.014,[.004,.012,.014,.004][i]]));
    for(let row=0;row<4;row++){
      const y=.037+row*.038,w=.145-row*.011;
      wire(cap,row%2?'vesperSlate':'vesperGold',f([[.002,y+.018,.126,.004],[w*.57,y+.047,.094,.012],
        [w,y+.036,.024,.013],[w*1.05,y+.013,-.119,.011],[w*.64,y-.023,-.207,.003]]));
    }
    const ties=joint(cap,'Sunset carmine hat ties '+side,side*.137,.118,-.122);
    for(let a=0;a<(mobile?3:5);a++){
      const t=a/(mobile?2:4),path=f([[.01+t*.04,.028,-.008],[.065+t*.066,-.125,.02-t*.093],
        [.093+t*.092,-.353+t*.063,-.116-t*.129]]);
      tuft(ties,a%3?'vesperBurgundy':'vesperGold',path,.051-a*.005,91.75+a);
    }
    loops.push({ties,side});
    const collarCut=f([[.011,.104,.173],[.102,.198,.143],[.215,.221,.079],[.271,.15,-.012],
      [.294,.062,-.146],[.218,-.039,-.184],[.105,.007,-.126],[.021,.059,-.036]]);
    plate(collar,'vesperBurgundy',collarCut,.037);
    wire(collar,'vesperGold',collarCut.slice(0,7).map(([x,y,z],i)=>[x,y+.012,z+.02,[.005,.014,.016,.019,.016,.01,.004][i]]));
    const lapel=f([[.057,.606,.213],[.154,.607,.204],[.255,.492,.208],[.237,.348,.235],
      [.181,.162,.286],[.074,.124,.296],[.096,.31,.289]]);
    plate(body,'vesperBurgundy',lapel,.048);
    wire(body,'vesperGold',lapel.slice(1,6).map(([x,y,z],i)=>[x,y-.01,z+.028,[.007,.019,.021,.018,.004][i]]));
    for(let i=0;i<3;i++){
      const y=.42-i*.143,w=.251-i*.014;
      const tail=f([[.011,y+.048,-.222],[w*.43,y+.061,-.246],[w*.91,y+.02,-.227],[w*1.26,y-.054,-.171],
        [w*.7,y-.106,-.223],[.022,y-.048,-.253]]);
      plate(body,i%2?'vesperBlack':'vesperBurgundy',tail,.04);
      wire(body,'vesperGold',tail.slice(1,5).map(([x,h,z],i)=>[x,h-.008,z-.021,[.005,.014,.010,.004][i]]));
    }
    cloth(silks,body,'道士聖 · 金緣朱裳 '+side,f([[.091,.082,.244,.106],[.137,-.159,.285,.163],
      [.183,-.444,.336,.181],[.214,-.846+side*.061,.344,.136]]),0x73313a,0xb8965c,side*.71,[.96,0,side*.19],.82,0x462531);
    cloth(silks,body,'道士聖 · 紫領後幅 '+side,f([[.139,.532,-.17,.112],[.196,.203,-.262,.169],
      [.225,-.311,-.325,.202],[.264,-.821-side*.045,-.37,.148]]),0x4b2535,0x977348,side*.97,[.97,0,side*.18],.88);
  }
  function fitArms(arms){
    for(const {root,elbow,hand,side} of arms){
      const f=p=>mirror(side,p);
      mass(root,'vesperBurgundy',f([[0,.058,.007,.089,.09],[.039,-.017,.012,.132,.128],
        [.074,-.133,.017,.131,.120],[.081,-.266,.034,.10,.096]]),15.29+side);
      mass(elbow,'vesperSilk',f([[0,.035,.019,.077,.086],[.033,-.048,.045,.127,.113],
        [.06,-.149,.068,.146,.137],[.047,-.273,.085,.152,.128]]),5.6+side);
      const cuff=f([[-.081,-.169,.07],[-.039,-.238,.193],[.081,-.248,.202],[.157,-.202,.124],
        [.169,-.161,.059],[.087,-.179,.013],[-.069,-.189,.021]]);
      plate(elbow,'vesperBurgundy',cuff,.039);
      wire(elbow,'vesperGold',cuff.slice(1,6).map(([x,y,z],i)=>[x,y-.016,z+.018,[.006,.013,.018,.011,.004][i]]));
      for(let i=0;i<3;i++){
        const dx=i*.044;
        wire(elbow,i%2?'vesperGold':'vesperEnamel',f([[-.044+dx,-.118,.107,.005],[-.043+dx,-.149,.144,.007],
          [-.02+dx,-.188,.171,.009],[.005+dx,-.214,.165,.003]]));
      }
      fist(t,hand,'bFlesh',side);
    }
  }
  function weapons(arms){
    const focus=joint(arms[0].hand,'Sunset enamel conjuration reliquary',-.014,-.04,.118);
    const empty=joint(arms[1].hand,'Sunset free ritual hand',0,-.02,.106);
    mass(focus,'vesperSlate',[[0,-.29,.015,.052,.037],[0,-.23,.018,.133,.045],[0,-.048,.027,.157,.046],
      [0,.125,.033,.142,.052],[0,.27,.057,.091,.039],[0,.33,.031,.022,.019]],9.25,2.7);
    for(const side of sides){
      const f=p=>mirror(side,p);
      const edge=f([[.006,-.29,.055],[.108,-.225,.075],[.162,-.074,.092],[.166,.095,.103],
        [.117,.233,.101],[.032,.315,.071]]);
      wire(focus,'vesperGold',edge.map(([x,y,z],i)=>[x,y,z,[.004,.015,.017,.018,.013,.005][i]]));
      for(let bar=0;bar<4;bar++){
        const y=-.172+.109*bar,z=.080+bar*.009;
        wire(focus,bar%2?'vesperEnamel':'vesperGold',f([[.024,y-.014,z,.006],[.061,y,.004+z,.011],
          [.104,y+.013,.013+z,.012],[.127,y+.034,.023+z,.004]]));
      }
    }
    k.mesh(focus,'gem','vesperEnamel',0,-.007,.114,.048,.068,.031);
    markEnemyWeapon(focus,[0,.326,.051],{from:[0,-.28,.047],width:.119,aim:false,kind:'focus'});
    return [focus,empty];
  }
  return {silks,fitArms,weapons,energy:[0xff8d5f,'embers',[0,.28,-.345],[.67,.59,.41]],
    poseArms({beat,wind,strike,arms,left}){
      const [hold,cast]=arms;
      hold.root.rotation.set(-.41-wind*.41+strike*.33,-.28-wind*.11,-.33-wind*.22);
      hold.elbow.rotation.set(-.91-wind*.29+strike*.39,.43+wind*.23+strike*.31,-.09);
      left.rotation.set(.77+wind*.21-strike*.24,-.22+wind*.20,.61-wind*.43+strike*.64);
      cast.root.rotation.x=-.37-wind*.79-strike*.55;
      cast.elbow.rotation.set(-.59-wind*.47+strike*.82,-.20-wind*.49,.10+strike*.22);
      collar.rotation.x=wind*.14-strike*.19;
      for(const {ties,side} of loops)ties.rotation.z=side*(Math.sin(beat*.88+side)*.066+wind*.18-strike*.22);
    }};
}

function tigerRider(k,t,body,head,mobile){
  const {joint,mass,plate,wire,tuft}=t,silks=[],shoulders=[];
  mass(body,'riderBlack',[[0,-.171,-.034,.161,.143],[0,.024,-.034,.182,.167],[.015,.251,-.028,.24,.18],
    [.016,.467,-.029,.263,.182],[0,.618,-.061,.223,.169],[0,.78,-.026,.099,.10]],15.41);
  const hair=joint(head,'Lightning rider black swept topknot',.021,.142,-.08);
  mass(hair,'riderBlack',[[0,-.116,-.074,.098,.102],[0,-.009,-.031,.125,.132],[.013,.094,-.02,.132,.145],
    [.011,.158,-.084,.108,.106],[.051,.206,-.137,.069,.069],[.067,.215,-.176,.032,.045]],9.2);
  const tassel=joint(hair,'Lightning rider knotted ribbon',.064,.164,-.146);
  for(let i=0;i<4;i++){
    const path=[[.008+i*.01,-.005,.021],[.08+i*.013,-.054,-.062],[.124+i*.026,-.124-i*.015,-.141]];
    tuft(tassel,i%2?'riderStrap':'riderBlack',path,.039+i*.004,9+i);
  }
  wire(hair,'riderStrap',[[-.109,.034,.084,.006],[-.04,.083,.107,.015],[.047,.112,.092,.016],
    [.092,.104,.035,.014],[.113,.085,-.045,.004]]);
  for(const side of sides){
    const f=p=>mirror(side,p);
    for(let i=0;i<3;i++){
      const u=i*.026,path=f([[.067+u,.121-u*.71,.108],[.133+u,.069-u,.061],
        [.15+u,-.053-u*.62,-.024-i*.016]]);
      tuft(hair,'riderBlack',path,.028+i*.005,12+i);
    }
    const backing=f([[.037,.557,-.173],[.137,.615,-.164],[.243,.553,-.125],
      [.25,.401,-.162],[.145,.323,-.217],[.029,.401,-.215]]);
    plate(body,side<0?'riderBlack':'riderSilk',backing,.043);
    wire(body,'riderStrap',backing.slice(1,6).map(([x,y,z],i)=>[x,y-.011,z-.022,[.004,.015,.016,.011,.003][i]]));
    const cross=f([[.022,.575,.182],[.104,.522,.211],[.178,.378,.237],[.187,.261,.263],
      [.126,.298,.253],[.058,.47,.206]]);
    plate(body,side<0?'riderBlack':'riderLinen',cross,.036);
    wire(body,'riderStrap',cross.slice(1,5).map(([x,y,z],i)=>[x,y-.015,z+.021,[.005,.016,.014,.004][i]]));
    cloth(silks,body,'道士抵 · 乘虎衣襬 '+side,f([[.103,.063,.183,.072],[.151,-.192,.221,.096],
      [.245,-.364,.253,.114],[.327,-.533+side*.031,.243,.072]]),side<0?0x49313e:0xb38662,0x9c744b,side*.91,[.81,0,side*.54],.77);
    cloth(silks,body,'道士抵 · 方巾後尾 '+side,f([[.126,.322,-.196,.052],[.192,.071,-.241,.071],
      [.249,-.202,-.314,.092],[.336,-.393,-.414,.056]]),0x4a3442,0x916454,side*.83,[.96,0,side*.29],1.05);
  }
  function fitArms(arms){
    for(const {root,elbow,hand,side} of arms){
      const f=p=>mirror(side,p);
      const cap=joint(root,'Rider flower embroidered shoulder '+side,side*.018,.03,-.015);
      mass(cap,side<0?'riderBlack':'riderLinen',f([[0,.062,-.022,.086,.088],[.058,-.026,.005,.14,.129],
        [.073,-.152,.014,.124,.116],[.082,-.235,.039,.086,.087]]),7.41+side);
      mass(elbow,'riderBlack',f([[0,.036,.021,.066,.063],[.027,-.065,.059,.085,.078],
        [.036,-.158,.081,.082,.072],[.016,-.269,.102,.044,.049]]),9.88+side);
      const wrist=f([[-.048,-.082,.074],[.045,-.06,.112],[.102,-.137,.095],[.1,-.21,.121],
        [.049,-.245,.15],[-.063,-.20,.129]]);
      plate(elbow,'riderStrap',wrist,.035);
      wire(elbow,'riderLinen',wrist.slice(1,5).map(([x,y,z],i)=>[x,y+.007,z+.019,[.004,.012,.014,.003][i]]));
      if(side>0)for(let petal=0;petal<9;petal++){
        const a=petal*Math.PI*.710,y=-.063+Math.sin(a)*.085,x=.066+Math.cos(a)*.069;
        const outline=f([[x-.006,y-.018,.12],[x+.014,y-.008,.124],[x+.022,y+.018,.11],
          [x+.011,y+.026,.108],[x-.004,y+.009,.121]]);
        plate(cap,petal%3?'riderSilk':'riderStrap',outline,.015);
      }
      fist(t,hand,'bFlesh',side);
      shoulders.push({cap,side});
    }
  }
  function weapons(arms){
    const wand=joint(arms[0].hand,'Rider forged forked red wand',-.009,-.03,.132);
    const free=joint(arms[1].hand,'Rider rein hand',0,-.041,.092);
    mass(wand,'riderWand',[[0,-.538,-.017,.018,.022],[.01,-.29,.008,.032,.034],
      [0,.006,.009,.029,.028],[.029,.321,-.016,.024,.027],[.055,.656,.007,.029,.03],[.09,.909,.049,.024,.026]],8.9);
    for(let i=0;i<6;i++){
      const y=-.392+i*.134,x=i*.011;
      wire(wand,i%2?'riderStrap':'riderLinen',[[x-.032,y,.012,.003],[x-.013,y+.022,.053,.007],
        [x+.03,y+.039,.041,.008],[x+.04,y+.049,.013,.003]]);
    }
    for(const side of sides){
      const f=p=>mirror(side,p);
      const top=f([[.036,.736,.047],[.145,.809,.059],[.242,.955,.054],
        [.219,1.111,.059],[.144,1.166,.02],[.091,1.219,-.012]]);
      wire(wand,'riderWand',top.map(([x,y,z],i)=>[x+.041,y,z,[.012,.032,.044,.043,.026,.005][i]]));
      wire(wand,'riderSteel',top.slice(-3).map(([x,y,z],i)=>[x+.049,y+.01,z+.016,[.02,.026,.004][i]]));
    }
    const spur=[[.074,.827,.062],[.08,1.025,.101],[.116,1.177,.081],[.098,1.296,.015],
      [.042,1.204,.05],[.019,1.043,.075],[.04,.884,.051]];
    plate(wand,'riderStrap',spur,.036);
    wire(wand,'riderLinen',spur.slice(1,5).map(([x,y,z],i)=>[x,y,z+.025,[.006,.013,.01,.004][i]]));
    markEnemyWeapon(wand,[.098,1.3,.015],{from:[0,-.513,-.017],width:.121,aim:false,kind:'focus'});
    return [wand,free];
  }
  return {silks,fitArms,weapons,energy:[0xffb776,'bolts',[0,.36,-.248],[.66,.51,.31]],
    poseArms({beat,wind,strike,travel,arms,left}){
      const [hold,rein]=arms;
      hold.root.rotation.set(-.66-wind*.33+strike*.16,-.35-wind*.19,-.29-wind*.31);
      hold.elbow.rotation.set(-.91-wind*.32+strike*.65,-.09+wind*.16,-.14);
      left.rotation.set(1.18+wind*.36-strike*.28,.17+wind*.51-strike*.24,.83+wind*.21-strike*.41);
      rein.root.rotation.x=-.45-wind*.28-strike*.31;
      rein.elbow.rotation.x=-.69-wind*.13+strike*.31;
      tassel.rotation.set(Math.sin(beat*.61)*.06+strike*.24-travel*.18,.08+wind*.23,-.11+strike*.31);
      for(const {cap,side} of shoulders)cap.rotation.x=wind*.15-strike*.124+side*Math.sin(beat*.44)*.035;
    }};
}

export function stripeTigerHead(k,head,mobile){
  const t=kit(k,mobile),{joint,mass,plate,wire,tuft}=t;
  const jaw=joint(head,'Rider tiger hinged lower jaw',0,-.132,.111);
  const scalp=sculptVolume([[0,-.162,.077,.099,.103],[0,-.103,.058,.137,.154],[0,-.044,.028,.175,.171],
    [0,.064,-.018,.219,.189],[0,.147,-.057,.201,.164],[0,.224,-.114,.126,.134],[0,.269,-.15,.063,.089]],
  {sides:mobile?14:20,rings:mobile?15:24,seed:9.85,section:2.48,ridge:.13,fur:true});
  const p=scalp.attributes.position,a=scalp.attributes.color;
  for(let i=0;i<p.count;i++){
    const x=Math.abs(p.getX(i)),y=p.getY(i),z=p.getZ(i);
    const stripe=Math.pow(Math.max(0,Math.cos(y*54+x*21+z*13)),7)*Math.min(1,Math.max(0,(x-.08)*14));
    const c=a.getX(i)*(1-stripe*.79);a.setXYZ(i,c,c*(1-stripe*.14),c*(1-stripe*.22));
  }
  k.geometry(head,'tigerFurMount',scalp);
  mass(jaw,'tigerCreamMount',[[0,-.075,-.021,.056,.079],[0,-.065,.052,.076,.095],
    [0,-.051,.125,.048,.072],[0,-.032,.166,.021,.054]],11.8,2.46);
  mass(head,'tigerFurMount',[[0,.105,.108,.055,.059],[0,.036,.168,.086,.049],[0,-.044,.225,.086,.046],
    [0,-.077,.27,.071,.031]],13.9);
  plate(head,'tigerSootMount',[[-.064,-.06,.278],[-.04,-.043,.3],[.045,-.046,.3],[.071,-.067,.279],
    [.049,-.094,.301],[0,-.108,.321],[-.051,-.094,.297]],.029);
  for(const side of sides){
    const f=q=>mirror(side,q);
    const ear=joint(head,'Mount tiger rounded ear '+side,side*.143,.129,-.097);
    const contour=f([[.003,.017,.034],[.028,.087,.048],[.07,.12,.012],[.103,.112,-.028],[.127,.066,-.061],
      [.091,-.019,-.044],[.037,-.038,.02]]);
    plate(ear,'tigerFurMount',contour,.04);
    plate(ear,'tigerSootMount',contour.map(([x,y,z])=>[x*.74+side*.014,y*.75,z+.027]),.024);
    wire(ear,'tigerCreamMount',contour.slice(0,5).map(([x,y,z],i)=>[x,y+.011,z+.019,[.003,.009,.015,.011,.003][i]]));
    mass(head,'tigerCreamMount',f([[.032,-.091,.252,.020,.021],[.069,-.097,.269,.035,.033],
      [.114,-.109,.227,.049,.042],[.16,-.074,.137,.045,.038],[.175,-.058,.071,.011,.017]]),7.8);
    mass(head,'tigerFurMount',f([[.037,.021,.183,.013,.017],[.082,.057,.173,.037,.032],
      [.118,.071,.139,.043,.041],[.166,.082,.086,.029,.026],[.19,.059,.029,.006,.009]]),21.9);
    const eye=f([[.042,.032,.193],[.075,.051,.190],[.109,.059,.161],[.149,.063,.124],
      [.15,.046,.125],[.105,.016,.169],[.066,.016,.198]]);
    plate(head,'tigerSootMount',eye,.014);
    k.mesh(head,'round','bInlay',side*.093,.035,.184,.020,.012,.012,0,side*.34,side*.21);
    k.mesh(head,'round','tigerSootMount',side*.095,.036,.195,.004,.011,.006);
    wire(head,'tigerCreamMount',eye.slice(4).map(([x,y,z],i)=>[x,y-.011,z+.013,[.004,.011,.003][i]]));
    for(let i=0;i<3;i++){
      const u=i*.032;
      tuft(head,i%2?'tigerCreamMount':'tigerFurMount',f([[.119+u,-.038-u*.61,.152],[.188+u,-.058-u*.76,.105],
        [.222+u,-.107-u*.77,.023-i*.034]]),.039,33+i);
    }
  }
  return jaw;
}

export function stripeTigerTorso(k,body,path,mobile){
  const fur=sculptVolume(path,{rings:mobile?27:38,sides:mobile?19:27,seed:23.12,section:2.31,ridge:.14,fur:true});
  const p=fur.attributes.position,c=fur.attributes.color;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const stripeAngle=z*27+Math.cos(x*4.8)*2.68+y*3.3+Math.sin(z*8)*.55;
    const stripe=Math.pow(Math.max(0,Math.cos(stripeAngle)),8)*Math.min(1,Math.max(0,(y+.16)*8));
    const belly=Math.min(1,Math.max(0,(-y+.011)*2.26));
    const shade=c.getX(i)*(1-stripe*.78);
    c.setXYZ(i,shade*(1-belly*.07),shade*(.90+belly*.12-stripe*.06),shade*(.87+belly*.32-stripe*.12));
  }
  k.geometry(body,'tigerFurMount',fur);
}

const valleySculptors={m073:vesperTaoist,m074:tigerRider,m077:dawnRobe,m082:biwaPlayer};
export function sculptValleyFigure(k,id,body,head,mobile){
  return valleySculptors[id]?.(k,kit(k,mobile),body,head,mobile)??null;
}
