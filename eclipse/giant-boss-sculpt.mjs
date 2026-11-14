import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2, sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...point])=>[x*s,...point]);
const plate=(k,j,m,path,d=.042)=>k.sculpt.plate(j,m,path,d,d*.42);
const sweep=(k,j,m,path,sides=8,steps=11)=>k.sculpt.sweep(j,m,path,{sides,steps,ridge:.20});
const carve=(k,j,m,path,n=16,w=12,section=2.34)=>k.geometry(j,m,sculptVolume(path,{rings:n,sides:w,section,ridge:.17}));
const rivet=(k,j,m,x,y,z,w=.036)=>k.mesh(j,'gem',m,x,y,z,w,w,.72*w);

function ridgePanel(k,j,m,path,depth,crease='trim'){
  plate(k,j,m,path,depth);
  const border=path.map(([x,y,z])=>[x*.96,y,z+.023,.017]);
  sweep(k,j,crease,[...border,border[0]],6,17);
}

function beastMask(k,head,{width:w=.32,length:l=.42,height:h=.41,skin='edge',armor='deep',bite='trim',diadem=false}={}){
  const f=l*.88;
  carve(k,head,skin,[[0,.22*h,-l*.64,w*.72,l*.27],[0,.49*h,-l*.13,w*.99,l*.41],
    [0,.28*h,l*.22,w,l*.52],[0,-.03*h,f*.77,w*.69,l*.35],
    [0,-.33*h,f,w*.49,l*.19],[0,-.56*h,f*.92,w*.27,l*.18]],18,15);
  const jaw=k.bone(head,0,-h*.39,.019);
  carve(k,jaw,skin,[[0,-h*.36,f*.87,w*.29,l*.18],[0,-h*.26,f*.72,w*.48,l*.24],
    [0,-h*.19,f*.40,w*.59,l*.27],[0,.015,f*.01,w*.57,l*.22]],14,12);
  k.mesh(head,'pearl','deep',0,-h*.34,f*.78,w*.51,h*.20,l*.32);
  for(const s of sides){
    const p=path=>mirror(s,path);
    const face=p([[.03,h*.75,.07],[w*.73,h*.87,-.04],[w*1.13,h*.27,-l*.21],
      [w*1.04,-h*.26,f*.45],[w*.58,-h*.42,f*.61],[w*.43,-h*.06,f*.85]]);
    ridgePanel(k,head,armor,face,.053,bite);
    const eye=p([[w*.20,.088,f],[w*.53,.135,f-.024],[w*.84,.147,f-.106],
      [w*.70,.034,f-.071],[w*.37,.005,f+.011]]);
    plate(k,head,'deep',eye,.025);
    k.mesh(head,'gem','glow',s*w*.47,.066,f+.022,w*.23,.031,.030,0,0,s*.21);
    sweep(k,head,skin,p([[w*.16,.126,f+.008,.024],[w*.48,.207,f-.019,.064],
      [w*.82,.233,f-.105,.048],[w*1.03,.129,f-.18,.007]]));
    for(let i=0;i<3;i++){
      const x=w*(.35+i*.108),z=f+.025-i*.083;
      sweep(k,jaw,bite,p([[x,-.079,z,.018],[x*1.06,-.011,z+.016,.017],[x*1.13,.060-i*.01,z+.024,.004]]),6,7);
    }
    if(diadem){
      sweep(k,head,bite,p([[w*.50,h*.63,-l*.05,.078],[w*.85,h*.99,-l*.46,.071],
        [w*1.30,h*1.33,-l*.70,.043],[w*1.56,h*1.37,-l*.81,.007]]));
    }
  }
  return jaw;
}

function footClaws(k,part,x,y,z,size,side){
  for(let i=0;i<4;i++){
    const S=size*(1-i*.093),X=x+side*i*size*.54,Z=z-Math.abs(i-1)*size*.19;
    sweep(k,part,'edge',[[X,y+S*.13,Z,S*.29],[X+side*S*.07,y,Z+S*.47,S*.24],
      [X+side*S*.11,y-S*.21,Z+S*.89,.005]],6,8);
  }
}

function royalBlade(k,hand){
  const rings=[-.47,-.31,-.14,.045];
  sweep(k,hand,'deep',[[0,-.62,0,.053],[0,.09,0,.064],[0,.21,0,.067]],9,14);
  for(const y of rings)k.mesh(hand,'ring','trim',0,y,0,.066,.066,.71,Math.PI*.5);
  for(const s of sides){
    sweep(k,hand,'trim',mirror(s,[[0,.14,0,.081],[.204,.135,.023,.087],[.386,.25,-.016,.056],[.431,.35,-.02,.006]]));
    const blade=mirror(s,[[0,.17,.071],[.16,.28,.016],[.194,.89,.009],[.155,1.41,.006],
      [.158,1.86,.004],[.220,2.28,0],[0,2.16,.046]]);
    plate(k,hand,'polished',blade,.029);
    sweep(k,hand,'blueSteel',[[s*.032,.26,.086,.014],[s*.034,.91,.091,.019],
      [s*.05,1.61,.077,.013],[s*.15,2.16,.053,.003]],5,13);
  }
  k.mesh(hand,'gem','glow',0,.228,.093,.092,.137,.051);
}

function cloud(k,parent){
  const group=k.bone(parent,0,-.58,0),curls=[];
  for(let ring=0;ring<2;ring++)for(let i=0;i<6;i++){
    const a=i*tau/6+ring*.51,x=Math.sin(a),z=Math.cos(a);
    const curl=k.bone(group,x*(.46+ring*.13),-.16+ring*.19,z*(.38+ring*.11));
    curl.rotation.y=a;
    sweep(k,curl,ring?'cloudRim':'cloudShade',[[0,-.123,0,.123,.15],[.17,-.08,.19,.16,.12],
      [.40,.03,.14,.17,.13],[.44,.18,-.036,.15,.11],[.264,.31,-.185,.083,.078],
      [.13,.285,-.19,.019,.028]],11,21);
    sweep(k,curl,'cloudRim',[[.04,-.07,.144,.025],[.266,.003,.267,.034],
      [.439,.13,.19,.023],[.447,.21,.05,.008]],6,13);
    curls.push(curl);
  }
  return {group,curls};
}

export function carveJadeEmperor(k,mobile){
  const body=k.bone(k.root,0,1.13,0);
  const head=k.bone(body,0,1.09,.015);
  const {group:clouds,curls}=cloud(k,body);
  carve(k,body,'deep',[[0,-.47,-.111,.31,.28],[0,-.20,-.074,.39,.30],[0,.12,-.035,.43,.34],
    [0,.45,-.017,.48,.34],[0,.69,-.029,.49,.30],[0,.89,-.097,.35,.23],[0,1.03,-.104,.19,.14]],23,16);
  carve(k,head,'deep',[[0,-.24,.115,.12,.103],[0,-.17,.041,.168,.15],
    [0,-.005,.005,.20,.163],[0,.17,-.046,.201,.15],[0,.295,-.12,.134,.17],
    [0,.473,-.18,.039,.069]],20,16);
  const skull=[[-.19,.036,.18],[-.202,.194,.14],[-.132,.306,.109],[0,.382,.10],
    [.132,.306,.109],[.202,.194,.14],[.19,.036,.18],[.116,.087,.222],[0,.147,.248],[-.116,.087,.222]];
  ridgePanel(k,head,'royal',skull,.069,'trim');
  for(const s of sides){
    const p=path=>mirror(s,path);
    for(let i=0;i<3;i++){
      const y=.135-i*.083;
      ridgePanel(k,head,i===0?'royal':'blueSteel',p([[.118,y+.063,.20],[.215,y+.102,.091],
        [.250,y+.059,-.087],[.224,y-.098,-.165],[.129,y-.134,-.105],[.127,y-.065,.143]]),.043,'trim');
    }
    plate(k,head,'deep',p([[.029,.116,.25],[.154,.129,.24],[.186,.067,.199],
      [.130,.026,.241],[.039,.044,.259]]),.022);
    sweep(k,head,'glow',p([[.037,.077,.272,.007],[.106,.078,.273,.015],[.153,.096,.246,.005]]),6,7);
    sweep(k,head,'royal',p([[.133,.251,-.068,.063],[.224,.271,-.164,.076],
      [.340,.210,-.23,.068],[.408,.083,-.263,.047],[.364,-.075,-.296,.009]]));
    sweep(k,head,'redEnamel',p([[.107,-.13,.211,.025],[.161,-.151,.181,.034],
      [.208,-.244,.108,.023],[.20,-.369,.078,.006]]));
  }
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.047;
    sweep(k,head,i%2?'darkBraid':'deep',[[x,-.120,.217,.030],[x*1.28,-.215,.225,.041],
      [x*1.52,-.369,.248,.028],[x*.88,-.473,.223,.003]]);
  }
  const arms=[],limbs=[],skirts=[];
  for(const s of sides){
    const p=path=>mirror(s,path);
    const shell=p([[.026,.792,.326],[.230,.866,.279],[.472,.695,.213],[.456,.388,.246],
      [.320,.185,.347],[.119,.089,.397],[.024,.235,.407]]);
    ridgePanel(k,body,'blueSteel',shell,.064,'trim');
    for(let i=0;i<4;i++){
      const y=.677-i*.092;
      sweep(k,body,i%3?'royal':'glow',p([[.064,y+.059,.351,.016],[.213,y+.013,.355,.025],
        [.347,y-.032,.300,.023],[.427,y-.064,.262,.004]]),6,9);
    }
    const arm=k.bone(body,s*.46,.68,.012);
    const elbow=k.bone(arm,s*.082,-.284,.021);
    arms.push(arm);limbs.push({forearm:elbow,side:s});
    carve(k,arm,'deep',p([[.02,.189,-.069,.118,.13],[.053,.089,-.053,.205,.171],
      [.076,-.065,.015,.192,.166],[.082,-.284,.029,.104,.106]]),13,12);
    const mask=k.bone(arm,s*.20,.205,.133);mask.rotation.y=s*.62;mask.rotation.z=s*-.21;mask.scale.setScalar(.72);
    beastMask(k,mask,{width:.27,length:.26,height:.35,skin:'royal',armor:'royal',bite:'trim',diadem:true});
    for(let i=0;i<3;i++){
      const y=.16-i*.126;
      ridgePanel(k,arm,i%2?'blueSteel':'royal',p([[.034,y+.024,-.126],[.251,y+.076,-.184],
        [.383,y-.014,-.143],[.339,y-.159,-.072],[.228,y-.196,.026],[.036,y-.112,.017]]),.039);
      rivet(k,arm,'polished',s*.271,y-.091,-.175,.038);
    }
    carve(k,elbow,'blueSteel',p([[0,.069,.006,.106,.111],[.012,-.043,.043,.166,.144],
      [.036,-.206,.067,.157,.132],[.042,-.330,.117,.098,.097]]),13,12);
    ridgePanel(k,elbow,'royal',p([[.02,-.017,.169],[.175,-.04,.148],[.223,-.17,.111],
      [.140,-.331,.179],[-.027,-.271,.206],[-.038,-.117,.194]]),.053);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.048;
      sweep(k,elbow,'darkBraid',p([[x,-.269,.13,.035],[x,-.341,.232,.039],[x-.014,-.417,.249,.026],[x-.043,-.429,.199,.013]]),6,8);
    }
    if(s===1){
      const hand=k.bone(elbow,.018,-.357,.205);hand.rotation.set(.64,.18,-.83);
      royalBlade(k,hand);
    }else{
      const bracelet=k.bone(elbow,-.025,-.28,.199);
      k.mesh(bracelet,'ring','royal',0,0,.007,.22,.22,.50,.78,.31);
      k.mesh(bracelet,'ring','glow',0,0,.006,.17,.17,.23,.78,.31);
    }
    const hip=k.bone(body,s*.234,.13,.05);
    const back=k.bone(body,s*.194,.092,-.28);
    skirts.push({hip,back,s});
    for(let i=0;i<3;i++){
      const offset=i*.117;
      const front=p([[-.069,.153-offset,.245],[.132,.193-offset,.248],[.471,.037-offset,.158],
        [.538,-.174-offset,.138],[.284,-.581-offset,.238],[.107,-.56-offset,.300],[-.075,-.308-offset,.279]]);
      ridgePanel(k,hip,i%2?'blueSteel':'royal',front,.059);
      sweep(k,hip,'redEnamel',p([[.015,.117-offset,.289,.029],[.224,.008-offset,.248,.038],
        [.371,-.168-offset,.211,.041],[.292,-.399-offset,.262,.026]]),7,11);
      const rear=p([[-.104,.158-offset,-.044],[.15,.218-offset,-.078],[.416,.091-offset,-.115],
        [.476,-.128-offset,-.139],[.362,-.408-offset,-.228],[.110,-.574-offset,-.257],[-.116,-.47-offset,-.207]]);
      plate(k,back,i%2?'blueSteel':'deep',rear,.061);
      sweep(k,back,'royal',rear.map(([x,y,z])=>[x,y,z-.046,.025]),7,16);
      rivet(k,back,'trim',s*.265,.044-offset,-.164,.036);
    }
    for(let i=0;i<(mobile?3:5);i++){
      const y=.621-i*.127;
      const backArmor=p([[.007,y+.106,-.336],[.209,y+.145,-.386],
        [.47,y+.087,-.235],[.472,y-.088,-.247],[.274,y-.151,-.361],[.026,y-.106,-.401]]);
      plate(k,body,i%2?'blueSteel':'deep',backArmor,.052);
      sweep(k,body,i%2?'trim':'royal',backArmor.slice(1,5).map(([x,y,z])=>[x,y,z-.032,.023]),6,9);
    }
  }
  const crown=k.bone(body,0,.52,-.432);
  const shape=[[0,.397,-.02],[.26,.27,-.031],[.31,-.027,-.09],[.19,-.264,-.103],
    [0,-.393,-.155],[-.19,-.264,-.103],[-.31,-.027,-.09],[-.26,.27,-.031]];
  plate(k,crown,'royal',shape,.07);
  plate(k,crown,'redEnamel',shape.map(([x,y,z])=>[x*.79,y*.77,z-.060]),.041);
  k.mesh(crown,'ring','trim',0,.029,-.126,.162,.169,.50);
  k.mesh(crown,'gem','glow',0,.029,-.143,.071,.100,.036);
  const cataloguePose=({beat,wind,strike,stage,fall})=>{
    for(const {hip,back,s} of skirts){
      hip.rotation.y=s*(.067*Math.sin(beat*.62)+wind*.12-strike*.16);
      hip.rotation.x=-wind*.14+strike*.24;
      back.rotation.x=.06*Math.cos(beat*.89+s)+strike*.21+stage*.14;
    }
    clouds.rotation.y=beat*.17;
    for(const [i,curl] of curls.entries())curl.scale.setScalar(1+Math.sin(beat*.59+i*.8)*.08+wind*.14);
    crown.rotation.x=-Math.sin(beat*.62)*.07+fall*.10;
  };
  return {body,head,arms,limbs,clouds,cataloguePose,catalogueSculpt:'jade-emperor',pattern:'hover'};
}

export function carveImperialTurtle(k,mobile){
  const {bone,root}=k;
  const body=bone(root,0,.69,0);
  carve(k,body,'deep',[[0,.03,-1.29,.39,.22],[0,.058,-.94,.76,.37],[0,.08,-.28,.93,.442],
    [0,.08,.43,.87,.433],[0,.12,.90,.66,.30],[0,.109,1.10,.37,.20]],23,18,2.6);
  carve(k,body,'copper',[[0,.28,-1.26,.34,.18],[0,.37,-.98,.74,.35],[0,.47,-.48,.90,.49],
    [0,.49,.15,.92,.47],[0,.40,.67,.78,.34],[0,.27,1.02,.53,.24]],23,17,2.83);
  const rows=mobile?5:7;
  for(let i=0;i<rows;i++){
    const z=-1.02+i*2.01/(rows-1),y=.88-((z+.12)**2)*.27;
    const w=.53-Math.abs(z)*.23;
    const path=[[0,y+.13,z+.164],[w*.68,y+.032,z+.113],[w,y-.11,z+.018],
      [w*.72,y-.049,z-.195],[0,y+.168,z-.260],[-w*.72,y-.049,z-.195],[-w,y-.11,z+.018],[-w*.68,y+.032,z+.113]];
    plate(k,body,i%2?'copper':'burntShell',path,.071);
    sweep(k,body,'royalShell',path.slice(0,5).map(([x,Y,Z])=>[x,Y+.021,Z,.026]),7,11);
    sweep(k,body,'copper',[[0,y+.150,z-.044,.088],[.014,y+.317,z-.101,.071],
      [.022,y+.43+(i%3)*.041,z-.233,.043],[.034,y+.50,z-.329,.004]],8,10);
    for(const s of sides){
      const x=.62+w*.32,Y=y-.206;
      const flange=mirror(s,[[x-.208,Y+.135,z+.167],[x+.045,Y+.062,z+.153],
        [x+.211,Y-.137,z+.12],[x+.177,Y-.27,z-.05],[x-.058,Y-.127,z-.185],[x-.21,Y-.013,z-.119]]);
      plate(k,body,i%3?'burntShell':'body',flange,.055);
      sweep(k,body,'royalShell',flange.slice(1,5).map(([X,h,Z])=>[X+s*.041,h-.014,Z,.027]),7,9);
      sweep(k,body,'edge',mirror(s,[[x+.075,Y-.112,z-.002,.058],[x+.23,Y-.090,z-.039,.053],
        [x+.34,Y-.020,z-.131,.033],[x+.39,Y+.079,z-.209,.004]]));
    }
  }
  const neck=bone(body,0,-.074,.77);
  carve(k,neck,'body',[[0,-.122,-.051,.29,.253],[0,-.105,.236,.32,.257],
    [0,-.042,.47,.263,.226],[0,.043,.71,.223,.176]],19,14);
  const head=bone(neck,0,.037,.67),jaws=beastMask(k,head,{width:.323,length:.46,height:.38,skin:'edge',armor:'burntShell',bite:'royalShell'});
  for(const s of sides)for(let i=0;i<3;i++){
    const z=i*.169+.056;
    plate(k,neck,i%2?'copper':'burntShell',mirror(s,[[.015,.224,z-.04],[.222,.155,z-.083],
      [.298,-.025,z-.055],[.255,-.14,z+.083],[.078,-.097,z+.173],[.034,.105,z+.151]]),.045);
  }
  const legs=[],joints=[];
  for(const s of sides)for(const [index,z] of [-.82,.59].entries()){
    const leg=bone(body,s*.59,-.075,z),shin=bone(leg,s*.248,-.209,.02);
    carve(k,leg,'body',mirror(s,[[0,.088,0,.16,.16],[.15,-.031,.046,.204,.191],
      [.21,-.153,.055,.162,.18],[.25,-.230,.021,.136,.123]]),13,12);
    carve(k,shin,'burntShell',mirror(s,[[0,.072,.01,.133,.135],[.099,-.14,.028,.17,.14],
      [.189,-.27,.145,.17,.132],[.19,-.345,.213,.121,.105]]),14,12);
    for(let slab=0;slab<3;slab++){
      const h=-.031-slab*.090;
      plate(k,shin,'copper',mirror(s,[[.015,h+.052,.081],[.224,h+.020,.103],[.278,h-.082,.147],
        [.118,h-.122,.181],[.007,h-.072,.16]]),.034);
    }
    footClaws(k,shin,s*.038,-.323,.242,.158,s);
    legs.push(leg);joints.push({shin,side:s,index});
  }
  const tail=bone(body,0,-.089,-1.13);
  carve(k,tail,'body',[[0,0,.049,.173,.155],[.06,.114,-.134,.171,.154],[.192,.213,-.336,.123,.123],
    [.246,.321,-.51,.072,.072],[.193,.438,-.67,.008,.007]]);
  for(let i=0;i<4;i++){
    const t=i/4;
    sweep(k,tail,'copper',[[t*.21,.129+t*.24,-t*.51,.068],[t*.26,.207+t*.27,-.091-t*.51,.059],
      [t*.26,.25+t*.31,-.147-t*.51,.010]],7,8);
  }
  return {body,head,neck,jaws,legs,joints,tail,catalogueSculpt:'imperial-turtle',pattern:'bulwark'};
}

export function carveEggGhost(k,mobile){
  const {bone,root}=k;
  const body=bone(root,0,1.10,0);
  const head=bone(body,0,.146,.026);
  carve(k,body,'shellIvory',[[0,-.80,-.047,.258,.28],[0,-.59,-.062,.583,.55],
    [0,-.27,-.105,.745,.705],[0,.069,-.091,.716,.697],[0,.444,-.123,.568,.538],
    [0,.741,-.139,.382,.366],[0,.94,-.151,.133,.123],[0,.965,-.16,.015,.019]],31,23,2.25);
  const hole=[[-.416,-.18,.522],[-.291,-.04,.556],[-.091,-.13,.642],[-.135,-.32,.659],
    [.026,-.516,.643],[-.122,-.478,.658],[-.255,-.551,.566],[-.354,-.363,.543],[-.481,-.37,.447]];
  plate(k,body,'deep',hole,.018);
  const shellFlaps=[];
  for(const s of sides){
    for(let i=0;i<3;i++){
      const x=(s<0?-.29:.29)+i*s*.076,y=-.11-i*.201,z=.62-i*.022;
      const flap=bone(body,x,y,z);
      const p=mirror(s,[[0,.098,-.015],[.116,.041,-.006],[.121,-.169,.018],[.046,-.116,.035],[-.017,-.062,.015]]);
      plate(k,flap,i===1?'shellScar':'shellIvory',p,.038);
      sweep(k,flap,'edge',p.slice(1,4).map(q=>[q[0],q[1],q[2]+.018,.013]),5,7);
      shellFlaps.push({flap,s,i});
    }
    for(let i=0;i<5;i++){
      const a=i*.76+.49,x=s*Math.sin(a)*.667,z=Math.cos(a)*.605-.093,y=.02+Math.sin(i*.68)*.19;
      sweep(k,body,'shellScar',[[x*.94,y-.18,z,.006],[x,y-.079,z+.035,.011],[x*.96,y+.052,z-.029,.009],
        [x*1.03,y+.169,z-.019,.003]],5,8);
    }
  }
  const band=bone(body,0,.458,-.101);
  const charms=[];
  for(let i=0;i<(mobile?11:16);i++){
    const a=i*tau/(mobile?11:16),x=Math.sin(a),z=Math.cos(a),w=.548+Math.sin(i*.88)*.024;
    rivet(k,band,i%4===0?'glow':'redBinding',x*w,.045*Math.sin(a*2),z*w,.102-i%3*.005);
    const next=a+.41;
    sweep(k,band,'redBinding',[[x*w,-.025,z*w,.046],[Math.sin(a+.23)*w,-.048,Math.cos(a+.23)*w,.043],
      [Math.sin(next)*w,-.035,Math.cos(next)*w,.040]],6,8);
    if(i%3===1){
      const slip=bone(band,x*(w+.02),-.07,z*(w+.02));slip.rotation.y=a;
      const p=[[-.073,.017,.001],[.076,.018,.012],[.070,-.17,.028],[.093,-.40,.13],
        [-.028,-.46,.147],[-.062,-.317,.061]];
      plate(k,slip,'edge',p,.019);
      for(let line=0;line<4;line++){
        const y=-.06-line*.066;
        sweep(k,slip,'deep',[[-.034,y,.036+line*.018,.006],[.037,y-.017,.045+line*.018,.009],
          [.013,y-.043,.049+line*.022,.005]],5,6);
      }
      charms.push(slip);
    }
  }
  const hood=bone(body,0,-.764,-.063);
  for(let i=0;i<8;i++){
    const a=i*tau*.125,x=Math.sin(a),z=Math.cos(a);
    sweep(k,hood,i%2?'deep':'body',[[x*.20,.026,z*.16,.118],[x*.382,-.067,z*.27,.126],
      [x*.559,-.158,z*.36,.115],[x*.68,-.175,z*.41,.061],[x*.74,-.079,z*.46,.006]],8,12);
  }
  const eyes=bone(head,-.104,-.366,.603);
  for(const s of sides){
    rivet(k,eyes,'glow',s*.095,.016,.021,.029);
    sweep(k,eyes,'deep',mirror(s,[[.027,.028,.007,.018],[.096,.067,.036,.025],[.164,.051,-.010,.008]]),6,8);
  }
  const cataloguePose=({beat,wind,strike,stage})=>{
    band.rotation.x=Math.sin(beat*.55)*.073-wind*.15;
    for(const [i,slip] of charms.entries())slip.rotation.x=Math.sin(beat*.94+i)*.13-wind*.13+strike*.32;
    for(const {flap,s,i} of shellFlaps){
      flap.rotation.y=s*(stage*.25+wind*.15+strike*.37+Math.sin(beat*.8+i)*.032);
      flap.rotation.x=stage*.15+strike*.31;
    }
    hood.rotation.y=beat*.106;
  };
  return {body,head,catalogueSculpt:'egg-ghost',cataloguePose,pattern:'hover'};
}

export function carveVaruna(k,mobile){
  const body=k.bone(k.root,0,.72,0);
  const rider=k.bone(body,0,.292,-.356);
  const head=k.bone(rider,0,1.15,.052);
  const tail=k.bone(body,0,-.036,-.735);
  carve(k,tail,'deep',[[0,-.015,.138,.25,.20],[-.11,-.05,-.19,.233,.184],
    [-.46,-.12,-.45,.206,.161],[-.76,-.11,-.63,.151,.123],[-.95,.016,-.55,.105,.079],
    [-1.08,.211,-.34,.061,.049],[-1.065,.43,-.235,.008,.007]],29,15);
  for(let i=0;i<(mobile?6:10);i++){
    const u=i/(mobile?6:10),x=-Math.sin(u*1.61)*1.011,z=.08-Math.sin(u*2)*.69,y=-.02+u*u*.32;
    plate(k,tail,i%2?'trim':'body',[[x-.095,y+.09,z-.07],[x+.012,y+.16,z-.116],[x+.16,y+.104,z-.044],
      [x+.14,y+.07,z+.09],[x-.086,y+.04,z+.095]],.024);
  }
  const boat=k.bone(body,0,-.058,0);
  carve(k,boat,'deep',[[0,.027,-.941,.15,.141],[0,-.038,-.69,.41,.25],
    [0,-.112,-.091,.55,.274],[0,-.080,.40,.53,.261],[0,.091,.985,.31,.16],
    [0,.203,1.151,.068,.069]],22,16,4.1);
  for(const s of sides){
    const p=path=>mirror(s,path);
    ridgePanel(k,boat,'trim',p([[.08,.244,-.991],[.457,.181,-.705],[.568,.118,-.223],
      [.569,.215,.373],[.41,.356,.790],[.01,.462,1.184],[.23,.077,.910],[.36,-.23,.27],
      [.28,-.31,-.47],[.087,-.088,-.910]]),.084,'edge');
    sweep(k,boat,'edge',p([[.13,.241,-1.02,.042],[.466,.196,-.71,.041],[.581,.196,-.22,.041],
      [.569,.262,.37,.046],[.425,.382,.81,.046],[.02,.468,1.184,.028]]),7,22);
    for(let i=0;i<(mobile?6:9);i++){
      const z=-.714+i*.169,y=.09+Math.abs(z)*.10,x=.54-Math.abs(z)*.067;
      sweep(k,boat,i%2?'body':'deep',p([[x,y+.081,z,.029],[x*1.03,y-.041,z+.025,.040],
        [x*.75,y-.232,z+.101,.033],[x*.45,y-.272,z+.139,.013]]),6,9);
    }
  }
  const serpents=[];
  for(let i=-2;i<=2;i++){
    const s=Math.sign(i)||1,d=Math.abs(i),x=i*.224;
    const neck=k.bone(boat,x,.226,.742-d*.097),top=.76-d*.097;
    neck.rotation.y=i*.19;
    carve(k,neck,'body',[[0,0,0,.096,.107],[i*.017,.155,.192,.121,.118],
      [i*.029,.329,.288,.133,.124],[i*.044,top*.79,.233,.128,.114],
      [i*.066,top,.279,.109,.099]],16,11);
    const serpent=k.bone(neck,i*.053,top,.261);
    const mask=beastMask(k,serpent,{width:.133,length:.24,height:.24,skin:'body',armor:'deep',bite:'trim'});
    for(let n=0;n<5;n++){
      const Y=.14+n*(top-.13)/5,Z=.23+Math.sin(n*.77)*.062;
      plate(k,neck,n%2?'edge':'trim',[[-.106,Y+.039,Z+.137],[0,Y+.071,Z+.177],
        [.106,Y+.039,Z+.137],[.069,Y-.053,Z+.140],[0,Y-.072,Z+.146],[-.07,Y-.047,Z+.135]],.026);
    }
    sweep(k,serpent,'edge',[[0,.11,-.01,.04],[s*.027,.23,-.058,.035],[s*.045,.32,-.12,.004]],6,8);
    serpents.push({neck,serpent,jaw:mask,i});
  }
  carve(k,rider,'deep',[[0,-.30,-.022,.171,.126],[0,.074,-.089,.228,.156],[0,.362,-.029,.211,.153],
    [0,.681,-.035,.24,.146],[0,.878,-.034,.278,.126],[0,1.03,-.014,.12,.105]],19,14);
  carve(k,head,'varunaSkin',[[0,-.207,.069,.092,.076],[0,-.134,.062,.127,.090],
    [0,-.013,.035,.155,.105],[0,.113,.012,.141,.105],[0,.241,-.025,.107,.08]],19,14);
  for(const s of sides){
    const p=path=>mirror(s,path);
    sweep(k,head,'deep',p([[.023,.061,.133,.010],[.067,.071,.145,.019],[.121,.051,.117,.011]]),6,8);
    rivet(k,head,'glow',s*.069,.050,.152,.013);
    sweep(k,head,'body',p([[.109,.19,.029,.026],[.141,.078,-.034,.047],
      [.129,-.17,-.072,.029],[.109,-.259,-.03,.005]]),7);
    const cap=p([[.019,.209,.076],[.128,.277,.009],[.169,.197,-.115],[.144,.019,-.134],
      [.078,.091,-.106],[.046,.161,.078]]);
    ridgePanel(k,head,'varunaRed',cap,.031);
    sweep(k,head,'edge',p([[.085,.211,-.031,.037],[.153,.373,-.095,.032],
      [.225,.460,-.184,.017],[.265,.37,-.21,.005]]));
    const yoke=p([[.026,.941,.08],[.187,.975,.163],[.278,.841,.095],[.235,.703,.149],
      [.097,.55,.172],[.016,.663,.163]]);
    ridgePanel(k,rider,'varunaBlue',yoke,.042);
    const skirt=k.bone(rider,s*.112,.485,.012);
    const panels=p([[0,.066,.173],[.176,.076,.147],[.275,-.218,.144],
      [.194,-.562,.168],[.046,-.368,.204],[.010,-.22,.19]]);
    ridgePanel(k,skirt,'edge',panels,.035);
    for(let i=0;i<3;i++){
      const y=.82-i*.129,x=.152+i*.019;
      plate(k,rider,i%2?'varunaBlue':'body',p([[.009,y+.072,-.109],[x,y+.098,-.151],
        [x+.084,y-.031,-.115],[x+.021,y-.111,-.164],[.009,y-.099,-.178]]),.034);
      rivet(k,rider,'trim',s*(x+.015),y-.041,-.179,.025);
    }
  }
  sweep(k,head,'varunaSkin',[[0,.068,.13,.014],[0,-.045,.193,.027],[0,-.069,.176,.009]],6,9);
  sweep(k,head,'deep',[[-.055,-.117,.123,.008],[0,-.128,.172,.010],[.055,-.117,.123,.008]],6,9);
  const arms=[],limbs=[];
  for(const s of sides){
    const arm=k.bone(rider,s*.229,.846,.002),forearm=k.bone(arm,s*.052,-.260,.044);
    arms.push(arm);limbs.push({forearm,side:s});
    carve(k,arm,'body',mirror(s,[[0,.129,.013,.089,.086],[.042,.044,.016,.119,.11],
      [.058,-.09,.029,.104,.099],[.046,-.25,.029,.067,.080]]),12,11);
    carve(k,forearm,'varunaBlue',mirror(s,[[0,.028,.02,.078,.077],[.031,-.079,.04,.083,.079],
      [.028,-.23,.09,.068,.064],[.037,-.28,.13,.050,.051]]),12,10);
    if(s===1){
      const staff=k.bone(forearm,.033,-.231,.15);
      sweep(k,staff,'trim',[[0,-.51,0,.026],[0,.32,0,.030],[0,.78,0,.037]],7,12);
      for(const sign of sides)sweep(k,staff,'edge',mirror(sign,[[0,.64,0,.043],[.127,.737,0,.046],
        [.161,.943,-.021,.018],[.115,1.040,-.04,.004]]));
      rivet(k,staff,'glow',0,.826,0,.071);
    }
  }
  const cataloguePose=({beat,wind,strike,stage})=>{
    rider.rotation.x=-wind*.12+strike*.22+Math.sin(beat*.37)*.03;
    boat.rotation.z=Math.sin(beat*.14)*.07+strike*.055;
    for(const {neck,serpent,jaw,i} of serpents){
      neck.rotation.x=Math.sin(beat*.73+i*.58)*.075-wind*.29+strike*.34;
      neck.rotation.y=i*(.18+stage*.13+strike*.10);
      serpent.rotation.y=Math.sin(beat*.41+i)*.15;
      jaw.rotation.x=wind*.21+strike*.40+stage*.11;
    }
  };
  return {body,head,tail,arms,limbs,cataloguePose,catalogueSculpt:'varuna',pattern:'hover'};
}

export function carveRoyalPair(k,mobile,awakened){
  const body=k.bone(k.root,0,awakened?1.07:.815,0);
  const heads=[],dancers=[];
  for(const side of sides){
    const emperor=side===-1;
    const actor=k.bone(body,side*(awakened?.483:.409),emperor?0:.094,emperor?.064:-.092);
    const turn=path=>mirror(side,path);
    const width=emperor?.277:.226;
    const silk=emperor?'royalCrimson':'royalIvory';
    const ribs=emperor?'bronzeRib':'royalCyan';
    const head=k.bone(actor,0,.833,.095);
    heads.push(head);
    carve(k,actor,'deep',[[0,-.321,-.058,width*.64,.137],[0,-.116,-.079,width*.87,.203],
      [0,.192,-.047,width*.94,.214],[0,.435,-.025,width,.201],[0,.599,-.043,width*.94,.165],
      [0,.765,-.028,width*.41,.08]],19,15,2.54);
    const faceSkin=emperor?'royalPale':'royalIvory';
    const jaw=awakened?beastMask(k,head,{width:emperor?.189:.159,length:.224,height:.265,
      skin:faceSkin,armor:'deep',bite:'trim'}):null;
    if(!awakened){
      carve(k,head,faceSkin,[[0,-.185,.064,.066,.054],[0,-.119,.064,.105,.076],
        [0,-.043,.04,.145,.119],[0,.106,.009,.151,.111],[0,.189,-.029,.14,.11]],17,14);
      for(const s of sides){
        const brow=mirror(s,[[.028,.081,.153,.007],[.061,.106,.149,.024],
          [.111,.091,.131,.018],[.132,.059,.083,.006]]);
        sweep(k,head,'deep',brow,6,8);
        rivet(k,head,'glow',s*.065,.075,.172,.016);
        sweep(k,head,emperor?'deep':silk,mirror(s,[[.11,.131,.082,.035],[.151,.016,.049,.038],
          [.13,-.123,.096,.022],[.079,-.197,.134,.004]]),7,11);
      }
      sweep(k,head,faceSkin,[[0,.091,.144,.019],[0,-.043,.197,.024],[0,-.076,.179,.008]],6,9);
      sweep(k,head,'deep',[[-.058,-.107,.146,.008],[0,-.127,.162,.014],[.057,-.112,.147,.004]],6,9);
      if(emperor)for(let i=0;i<4;i++){
        const x=(i-1.5)*.035;
        sweep(k,head,'deep',[[x,-.099,.142,.025],[x*1.5,-.152,.173,.022],
          [x*1.32,-.243,.181,.013],[x*.53,-.291,.14,.004]],6,9);
      }
    }
    const tiara=k.bone(head,0,.124,-.021);
    for(let i=0;i<(awakened?9:7);i++){
      const count=awakened?9:7,a=i*tau/count;
      const x=Math.sin(a)*.159,z=Math.cos(a)*.123;
      sweep(k,tiara,i%3?'trim':'bronzeRib',[[x,.013,z,.040],[x*1.21,.095,z*.99,.037],
        [x*1.11,.204+(emperor?.046:.014),z*.45,.026],
        [x*(awakened?1.61:.66),.259+(i%3)*.051,z*.19-.038,.005]],7,10);
      if(i%2===0)rivet(k,tiara,awakened?'royalCrimson':'royalCyan',x*1.24,.072,z*1.13,.026);
    }
    const arms=[],forearms=[];
    for(const s of sides){
      const p=path=>mirror(s,path);
      const shoulder=k.bone(actor,s*width*.92,.564,.06);
      const elbow=k.bone(shoulder,s*.089,-.25,.031);
      arms.push(shoulder);forearms.push(elbow);
      carve(k,shoulder,emperor?'royalCrimson':'royalPale',p([[.017,.119,-.052,.098,.10],
        [.065,.011,-.017,.126,.123],[.102,-.132,.052,.119,.086],[.089,-.252,.044,.062,.069]]),13,11);
      ridgePanel(k,shoulder,'trim',p([[.015,.112,.021],[.133,.158,-.06],[.253,.048,-.102],[.254,-.075,-.037],
        [.162,-.143,.091],[.097,-.078,.102],[.012,-.055,.091]]),.045,'bronzeRib');
      carve(k,elbow,'deep',p([[0,.038,.025,.069,.079],[.023,-.09,.042,.086,.078],
        [.051,-.229,.131,.068,.062],[.050,-.276,.181,.049,.048]]),13,10);
      plate(k,elbow,'bronzeRib',p([[-.034,-.051,.108],[.095,-.048,.10],[.147,-.192,.133],[.103,-.237,.193],
        [.016,-.225,.199],[-.034,-.151,.151]]),.040);
      if(s===side){
        const weapon=k.bone(elbow,s*.039,-.233,.158);
        weapon.rotation.set(.48,-s*.21,s*.67);
        sweep(k,weapon,'trim',[[0,-.31,0,.029],[0,.139,.004,.036],[0,.472,.013,.039],[0,.717,.079,.026]],8,16);
        for(const q of sides)sweep(k,weapon,'bronzeRib',mirror(q,[[0,.52,0,.035],[.122,.639,.025,.043],
          [.163,.781,.079,.026],[.061,.867,.132,.004]]),7,12);
        rivet(k,weapon,'glow',0,.728,.088,.078);
      }
      const front=p([[.009,.60,.234],[width*.70,.66,.194],[width*1.08,.52,.136],
        [width*.89,.284,.229],[width*.57,.16,.271],[.015,.23,.25]]);
      plate(k,actor,emperor?'royalCrimson':awakened?'royalPale':'deep',front,.052);
      for(let i=0;i<4;i++){
        const Y=.49-i*.09;
        sweep(k,actor,ribs,p([[.021,Y+.037,.266,.020],[.158,Y+.017,.261,.022],
          [width*.93,Y-.041,.21,.014],[width*1.03,Y-.063,.173,.005]]),6,9);
      }
      const skirt=k.bone(actor,s*width*.60,.15,.02);
      for(let tier=0;tier<3;tier++){
        const y=.10-tier*.158,w=width*(1+tier*.19);
        const scales=p([[-.044,y+.098,.18],[.107,y+.087,.196],[w,y-.022,.15],[w*.95,y-.176,.147],
          [w*.42,y-.264,.206],[.0,y-.152,.219]]);
        ridgePanel(k,skirt,tier%2?'deep':silk,scales,.035,'trim');
      }
      const train=k.bone(actor,s*.15,.364,-.179);
      carve(k,train,silk,p([[0,.051,.018,.106,.042],[.09,-.131,-.075,.184,.049],
        [.126,-.469,-.159,.171,.057],[.118,-.811,-.158,.154,.044],[.076,-1.013,-.169,.015,.009]]),20,11,3.7);
      for(let stripe=0;stripe<4;stripe++){
        const x=.045*stripe;
        sweep(k,train,stripe%2?ribs:'trim',p([[x,-.128,-.113,.013],[x+.064,-.424,-.221,.019],
          [x+.059,-.78,-.207,.014],[x+.041,-.975,-.188,.004]]),6,13);
      }
      const wing=k.bone(actor,s*.17,.493,-.207);
      if(awakened){
        for(let i=0;i<(mobile?6:10);i++){
          const t=i/(mobile?5:9),x=.337+t*.659,y=.31+(1-t)*.52;
          const base=[s*.041,.04-i*.022,-.004],pivot=[s*x*.57,y*.52,-.136-t*.12],tip=[s*x,y,-.19-t*.23];
          k.geometry(wing,i%3?'trim':'bronzeRib',featherVane(base,pivot,tip,.14-t*.054,i+side,mobile?8:11));
          sweep(k,wing,'trim',[[...base,.021],[...pivot,.019],[...tip,.003]],6,9);
        }
      }else{
        sweep(k,wing,'royalIvory',p([[0,0,0,.037],[.232,.231,-.112,.058],[.357,.546,-.259,.049],
          [.243,.693,-.356,.038],[.055,.679,-.451,.014]]),9,17);
      }
      dancers.push({side:s,actor,arm:shoulder,elbow,wing,train,jaw,emperor});
    }
  }
  const cataloguePose=({beat,wind,strike,stage,fall})=>{
    for(const {side,actor,arm,elbow,wing,train,jaw,emperor} of dancers){
      actor.rotation.y=(emperor?-1:1)*(.08+wind*.20-strike*.18);
      actor.rotation.x=-wind*.13+strike*.22+Math.sin(beat*.49)*.027;
      arm.rotation.x=-wind*(side>0?.94:.45)+strike*(side>0?1.19:.58);
      elbow.rotation.z=side*(.14+strike*.48-wind*.12);
      wing.rotation.z=side*(Math.sin(beat*.91)*.14+stage*.17+wind*.19);
      wing.rotation.x=Math.sin(beat*.8-.61)*.12+strike*.15+fall*.35;
      train.rotation.x=Math.sin(beat*.68+side)*.057+strike*.16;
      if(jaw)jaw.rotation.x=wind*.22+strike*.34;
    }
  };
  return {body,heads,head:heads[0],cataloguePose,catalogueSculpt:awakened?'yama-twins':'shah-royal-pair',pattern:awakened?'hover':'duel'};
}
