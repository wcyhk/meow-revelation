import * as T from '../three.min.mjs';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const signs=[-1,1],TAU=Math.PI*2;
const mirror=(s,path)=>path.map(([x,...rest])=>[s*x,...rest]);
const stroke=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:16,sides:mobile?6:9,ridge:.21});
const form=(k,j,m,p,mobile,seed=1,section=2.27)=>k.geometry(j,m,
  sculptVolume(p,{rings:mobile?11:18,sides:mobile?8:13,section,ridge:.17,seed}));
const pin=(k,j,m,x,y,z,a,b=a,c=a)=>k.mesh(j,'gem',m,x,y,z,a,b,c);

function paint(k,palette){
  for(const [name,color,metalness,roughness,finish] of palette){
    k.materials[name]=paintedFinish(new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
      envMap:k.materials.edge.envMap,envMapIntensity:metalness>.3?.57:.18}),finish,true,true);
  }
}

function plate(k,j,m,rim,points,mobile,d=.041,face=1){
  k.sculpt.plate(j,m,points,d,d*.30);
  stroke(k,j,rim,points.slice(0,-1).map(([x,y,z],i)=>[x,y+.007,z+face*d*.51,i===0?.004:.013]),mobile);
}

function ring(k,j,m,r,t,mobile,z=0){
  const geo=new T.TorusGeometry(r,t,mobile?6:9,mobile?32:48);
  geo.translate(0,0,z);k.geometry(j,m,geo);
}

function clothes(tools,parent,id,parts){
  for(const {name,path,tint,trim,lining,phase,flex,across=[1,0,0]} of parts){
    tools.silk(parent,id+' · '+name,path,{across,tint,trim,lining,phase,flex,style:'woven'});
  }
  return true;
}

function lowerBody(k,model,mobile,look){
  for(const s of signs){
    const h=model.body.position.y,hip=k.bone(k.root,s*look.gap,h-.235,.034),knee=k.bone(hip,s*.028,-look.shin,.044);
    const w=look.width;
    form(k,hip,look.inner,mirror(s,[[0,.10,-.029,.15*w,.126*w],[.028,-.07,-.012,.165*w,.138*w],
      [.034,-.222,.012,.121*w,.104*w],[.038,-look.shin-.018,.03,.088*w,.094*w]]),mobile,56);
    form(k,knee,look.inner,mirror(s,[[0,.05,.019,.101*w,.103*w],[.022,-.115,-.014,.112*w,.099*w],
      [.043,-.27,.039,.087*w,.075*w],[.025,-.326,.103,.103*w,.073*w],[.028,-.339,.177,.078*w,.051*w]]),mobile,59);
    plate(k,knee,look.metal,look.trim,mirror(s,[[.023,.152,.096],[.114*w,.092,.073],[.13*w,-.076,.084],
      [.07*w,-.244,.117],[.011,-.295,.161],[-.049*w,-.174,.137],[-.057*w,-.028,.109]]),mobile,.04);
    for(let i=0;i<3;i++)stroke(k,knee,look.trim,mirror(s,[[.086*w,-.034-i*.071,-.013,.008],
      [.09*w,-.048-i*.071,-.054,.012],[.023,-.057-i*.071,-.081,.014],[-.055*w,-.060-i*.071,-.022,.004]]),mobile);
    model.legs.push(hip);
    model.campaign.flaps.push({joint:knee,axis:'x',amp:look.flex,bias:-.034,seed:s*1.15,stride:true});
  }
}

function claw(k,grip,s,mobile){
  const gauntlet=k.bone(grip,s*.016,-.085,.105);
  markEnemyWeapon(gauntlet,[s*.087,.63,.105],{from:[0,.073,.065],width:.139});
  plate(k,gauntlet,'frontInk','frontSilver',[[-.101,-.109,.021],[-.062,-.159,.061],[.049,-.141,.079],
    [.112,-.049,.065],[.084,.114,.071],[-.053,.149,.086]],mobile,.056);
  for(let i=0;i<3;i++){
    const x=(i-1)*.091,reach=.49+Math.cos(i-1)*.15;
    const profile=[[x-.039,.063,.079],[x-.049,.169,.113],[x-.014,.357,.099],[x+s*.082,reach,.129],
      [x+.061,.355,.08],[x+.049,.186,.096],[x+.042,.072,.115]];
    plate(k,gauntlet,'frontSilver','edge',profile,mobile,.032);
    stroke(k,gauntlet,'glow',[[x,.112,.133,.006],[x+.006,.221,.137,.010],[x+s*.039,.373,.119,.014],
      [x+s*.082,reach,.141,.003]],mobile);
  }
  ring(k,gauntlet,'frontCrimson',.092,.016,mobile,.106);
  pin(k,gauntlet,'glow',0,.001,.129,.049,.051,.024);
}

function shadowNinja(k,weapon,mobile){
  paint(k,[['frontSkin',0xb59788,.014,.84,'hide'],['frontInk',0x2e293c,.08,.79,'cloth'],
    ['frontSteel',0x485463,.64,.49,'iron'],['frontSilver',0xb0bbc3,.68,.40,'iron'],
    ['frontCrimson',0x733441,.12,.73,'cloth'],['frontHair',0x2f283a,.09,.77,'hide']]);
  const body=k.bone(k.root,0,1.068,0),head=k.bone(body,0,.864,.077),arms=[],legs=[],flaps=[],joints=[];
  form(k,body,'frontInk',[[0,-.155,-.01,.189,.139],[0,.033,-.031,.207,.176],[0,.364,-.022,.239,.193],
    [0,.576,-.049,.288,.174],[0,.723,-.052,.220,.151],[0,.791,-.024,.129,.113]],mobile,12);
  const portrait=carvedFace(k,head,{style:'noble',finish:'frontSkin',brow:'frontHair',eye:'glow',dark:'frontInk',width:.329});
  form(k,head,'frontHair',[[0,-.041,-.098,.12,.102],[.011,.092,-.068,.147,.153],
    [.011,.175,-.044,.163,.149],[.032,.242,-.078,.123,.102],[.079,.287,-.174,.027,.038]],mobile,27);
  for(const s of signs){
    plate(k,head,'frontInk','frontCrimson',mirror(s,[[.012,-.023,.164],[.072,-.011,.169],
      [.166,-.036,.108],[.177,-.103,.049],[.111,-.145,.141],[.018,-.173,.151]]),mobile,.029);
    for(let i=0;i<3;i++)stroke(k,head,'frontHair',mirror(s,[[.045+i*.028,.202,.105,.021],
      [.114+i*.017,.163,.098,.031],[.171+i*.014,.087,-.012,.035],[.194+i*.017,-.058,-.154,.004]]),mobile);
    const arm=k.bone(body,s*.227,.548,-.015),elbow=k.bone(arm,s*.054,-.318,.027),grip=k.bone(elbow,s*.021,-.298,.097);
    form(k,arm,'frontInk',mirror(s,[[.006,.07,-.033,.094,.088],[.041,-.068,-.014,.109,.105],
      [.061,-.194,.013,.088,.075],[.049,-.315,.025,.07,.069]]),mobile,51);
    form(k,elbow,'frontSkin',mirror(s,[[0,.05,.008,.076,.075],[.023,-.079,.025,.085,.083],
      [.028,-.195,.062,.069,.068],[.022,-.292,.097,.053,.055]]),mobile,16);
    form(k,grip,'frontInk',[[0,.049,.003,.047,.046],[s*.018,-.021,.042,.074,.064],
      [s*.029,-.083,.086,.061,.045]],mobile,31);
    const guard=mirror(s,[[.012,.134,.097],[.139,.149,.075],[.21,.059,-.07],
      [.158,-.093,-.043],[.066,-.129,.084],[.013,-.053,.132]]);
    plate(k,arm,s>0?'frontSteel':'frontInk','frontCrimson',guard,mobile,.045);
    for(let i=0;i<3;i++)stroke(k,elbow,'frontCrimson',mirror(s,[[.079,-.06-i*.072,.078,.011],
      [.066,-.059-i*.073,.139,.013],[.004,-.076-i*.074,.162,.015],[-.041,-.071-i*.073,.137,.004]]),mobile);
    claw(k,grip,s,mobile);
    arms.push(arm);joints.push({joint:elbow,side:s});
  }
  const braids=k.bone(head,-.019,.141,-.176);
  for(let i=0;i<4;i++)stroke(k,braids,i%2?'frontHair':'frontInk',[[.036*i,.029,.01,.03],[.075+i*.021,-.071,-.093,.043],
    [.118+i*.03,-.204,-.247,.040],[.190+i*.03,-.479,-.342,.005]],mobile);
  flaps.push({joint:braids,axis:'x',bias:.02,amp:.13,seed:1.78});
  for(const s of signs)stroke(k,body,'frontCrimson',mirror(s,[[.021,.669,.198,.018],[.141,.517,.247,.029],
    [.176,.348,.243,.028],[.139,.147,.225,.024],[.138,.041,.204,.012]]),mobile);
  const model={body,head,arms,legs,crest:braids,pattern:'duel',
    campaign:{joints,flaps,jaw:portrait.jaw,lean:.13,neck:head},polishEnergy:{tint:0xe485a6,
      shape:'ribbons',anchor:body,offset:[0,.26,-.194],span:[.56,.66,.55]}};
  lowerBody(k,model,mobile,{gap:.154,shin:.395,width:.74,inner:'frontInk',metal:'frontSteel',trim:'frontCrimson',flex:.27});
  model.relicDress=tools=>clothes(tools,body,weapon.guardian.name,signs.flatMap(s=>[
    {name:'緋腰巾 '+s,path:mirror(s,[[.099,.129,.201,.056],[.171,-.165,.282,.092],
      [.222,-.369,.295,.101],[.279,-.667,.331,.023]]),tint:0x5c3047,trim:0xad7c89,lining:0x2e2840,phase:s*.81,flex:.94},
    {name:'幕布雙尾 '+s,path:mirror(s,[[.122,.57,-.165,.068],[.246,.291,-.343,.092],
      [.414,-.161,-.507,.13],[.51,-.63,-.721,.022]]),tint:0x623147,trim:0xba788b,lining:0x31283b,phase:s*1.23,flex:1.43},
  ]));
  return model;
}

function boneAxe(k,grip,mobile){
  const blade=k.bone(grip,.016,-.084,.118);
  markEnemyWeapon(blade,[-.40,1.5,.075],{from:[0,.08,.02],width:.34});
  stroke(k,blade,'frontAxeWood',[[0,-.68,.019,.056],[.018,-.19,.026,.065],[.014,.37,.009,.061],
    [.015,1.3,-.044,.045]],mobile);
  const edge=[[.025,1.355,.032],[-.197,1.509,.028],[-.421,1.518,-.037],[-.524,1.293,-.003],
    [-.505,1.003,.039],[-.383,.829,.079],[-.182,.758,.108],[-.041,.816,.095],[.102,1.038,.024]];
  plate(k,blade,'frontAxeSteel','frontIvory',edge,mobile,.095);
  stroke(k,blade,'frontGore',[[-.139,1.408,.094,.014],[-.321,1.451,.051,.035],[-.455,1.247,.06,.036],
    [-.448,1.091,.094,.026],[-.333,.927,.125,.021],[-.128,.832,.149,.006]],mobile);
  for(let i=0;i<4;i++){
    const y=.882+i*.141;
    form(k,blade,'frontIvory',[[.006,y,.031,.071,.068],[.103,y+.053,-.009,.074,.048],
      [.182,y+.123,-.043,.055,.037],[.214,y+.159,-.069,.005,.005]],mobile,19+i,2.94);
  }
  for(let i=0;i<8;i++){
    const wrap=k.bone(blade,.022,-.499+i*.109,.024);
    wrap.rotation.x=Math.PI*.49;
    ring(k,wrap,i%4===2?'frontIvory':'frontGore',.062,.012,mobile);
  }
}

function executioner(k,weapon,mobile,fighter){
  paint(k,[['frontAxeWood',0x35262c,.12,.76,'hide'],['frontAxeSteel',0x4a3638,.72,.48,'iron'],
    ['frontSoot',0x26262b,.43,.69,'iron'],['frontGore',0x79323a,.09,.61,'hide'],
    ['frontIvory',0xc0a889,.18,.57,'bone'],['frontAxeEye',0xdd8e6d,.09,.59,'gem']]);
  const model=fighter(k,{broad:.494,ground:1.07,neck:.634,armLength:.81,style:'ritual',finish:'frontAxeWood',legs:false,mobile,
    portrait(k,head){
      form(k,head,'frontGore',[[0,-.173,.009,.134,.107],[0,-.036,.019,.199,.156],
        [.014,.113,-.004,.213,.164],[.019,.238,-.031,.172,.143],[.012,.306,-.092,.066,.069]],mobile,9,2.42);
      const mouth=k.bone(head,.013,-.138,.132);
      form(k,mouth,'frontAxeWood',[[0,-.146,.052,.068,.056],[0,-.078,.073,.129,.073],
        [-.012,.032,.06,.143,.097],[.022,.074,.035,.102,.072]],mobile,31);
      for(const s of signs){
        const mask=mirror(s,[[.018,.175,.171],[.139,.224,.095],[.232,.132,-.05],[.210,-.089,-.087],
          [.126,-.143,.098],[.082,-.088,.179],[.029,-.014,.228]]);
        plate(k,head,'frontSoot','frontAxeSteel',mask,mobile,.065);
        stroke(k,head,'glow',mirror(s,[[.016,.055,.239,.004],[.080,.060,.240,.017],
          [.136,.087,.195,.014],[.172,.088,.161,.005]]),mobile);
        for(let i=0;i<3;i++)form(k,mouth,'frontIvory',mirror(s,[[.039+i*.028,.014,.087,.016,.016],
          [.044+i*.031,.06,.116,.017,.013],[.053+i*.028,.09,.133,.004,.004]]),mobile,58+i);
      }
      return mouth;
    },
    weapon(k,body,back,head,grips,flaps){
      boneAxe(k,grips[1],mobile);
      for(const s of signs){
        const arm=grips[s<0?0:1].parent.parent;
        for(let i=0;i<3;i++)plate(k,arm,s>0?'frontSoot':'frontAxeSteel','frontIvory',mirror(s,[[.034,.137-i*.09,.087],
          [.166,.179-i*.09,.024],[.302,.098-i*.09,-.097],[.24,-.07-i*.09,-.131],
          [.132,-.108-i*.09,.001],[.049,-.042-i*.09,.141]]),mobile,.075);
        for(let i=0;i<4;i++)stroke(k,body,i%2?'frontIvory':'frontAxeSteel',mirror(s,[[.06,.511-i*.119,.323,.012],
          [.184,.514-i*.117,.334,.032],[.316,.461-i*.110,.244,.033],[.38,.392-i*.109,.167,.005]]),mobile);
      }
      const spine=k.bone(back,-.077,.364,-.032);
      spine.rotation.z=.21;
      for(let i=0;i<6;i++){
        const y=.237-i*.112,x=Math.sin(i*.61)*.083;
        plate(k,spine,i%2?'frontAxeSteel':'frontSoot','frontIvory',[[x-.046,y+.085,-.12],[x+.086,y+.049,-.114],
          [x+.109,y-.034,-.098],[x+.014,y-.101,-.175],[x-.105,y-.041,-.128],[x-.097,y+.047,-.106]],mobile,.08,-1);
      }
      flaps.push({joint:spine,axis:'x',bias:.11,amp:.13,seed:3.1});
    },
  });
  lowerBody(k,model,mobile,{gap:.273,shin:.386,width:1.14,inner:'frontAxeWood',metal:'frontAxeSteel',trim:'frontIvory',flex:.11});
  model.pattern='slam';
  model.polishEnergy={tint:0xff7881,shape:'embers',anchor:model.body,offset:[0,.52,-.232],span:[.80,.82,.62]};
  model.relicDress=tools=>clothes(tools,model.body,weapon.guardian.name,signs.map(s=>({
    name:'染紅裂裙 '+s,path:mirror(s,[[.112,.091,.324,.136],[.183,-.163,.396,.162],
      [.197,-.443,.451,.174],[.238,-.836,.481,.047]]),tint:0x5b2f34,trim:0xa57c68,lining:0x392c36,phase:s*.77,flex:1.12,
  })));
  return model;
}

function turtleBow(k,grip,mobile){
  const bow=k.bone(grip,0,-.077,.109);
  markEnemyWeapon(bow,[-.51,.051,.075],{from:[.34,.051,.075],width:.26,kind:'bow'});
  for(const s of signs){
    const limb=[[0,0,.035,.058],[.123,s*.278,.067,.064],[.267,s*.489,.04,.059],
      [.249,s*.729,-.071,.052],[.347,s*.916,-.126,.019]];
    form(k,bow,'navalBrass',limb.map(([x,y,z,r])=>[x,y,z,r,r*.69]),mobile,29);
    stroke(k,bow,'navalIvory',limb.map(([x,y,z,r])=>[x-.019,y,z+.049,r*.43]),mobile);
    for(let i=1;i<3;i++)pin(k,bow,'navalCopper',.07+i*.071,s*(.134+i*.172),.105,.031,.05,.023);
  }
  const string=k.bone(bow,.346,0,-.125);
  stroke(k,string,'navalIvory',[[0,-.921,.015,.010],[-.046,0,.023,.011],[0,.921,.012,.01]],mobile);
  bow.userData.cord=string;
}

function keel(k,mobile){
  const chassis=k.bone(k.root,0,.49,-.082),prow=k.bone(chassis,0,.081,.753),drums=[];
  form(k,chassis,'navalWood',[[0,-.337,-.033,.456,.691],[0,-.215,-.049,.647,.854],[0,.032,-.012,.725,.932],
    [0,.242,-.036,.588,.812],[0,.353,-.064,.436,.606]],mobile,8,3.47);
  for(const s of signs){
    for(let row=0;row<5;row++){
      const z=.592-row*.291,y=.122+Math.cos(row*.72)*.09;
      const scale=[[.112,y+.134,z+.104],[.366,y+.151,z+.174],[.556,y+.085,z+.16],
        [.676,y-.05,z+.009],[.577,y-.16,z-.160],[.288,y-.123,z-.178],[.133,y-.038,z-.099]];
      plate(k,chassis,row%3===1?'navalCopper':'navalJade','navalBrass',mirror(s,scale),mobile,.078);
      stroke(k,chassis,'navalBrass',mirror(s,[[.173,y+.108,z+.14,.011],[.352,y+.138,z+.199,.023],
        [.491,y+.099,z+.174,.026],[.634,y-.027,z+.052,.013]]),mobile);
      pin(k,chassis,'navalIvory',s*.369,y+.129,z+.19,.026);
    }
    const roller=k.bone(chassis,s*.556,-.222,-.33);
    roller.rotation.y=s*Math.PI*.5;
    form(k,roller,'navalCopper',[[0,.041,-.018,.166,.179],[0,.13,-.027,.188,.199],
      [0,.176,-.018,.159,.157]],mobile,8,3.14);
    ring(k,roller,'navalBrass',.181,.024,mobile,.053);
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      pin(k,roller,'navalIvory',Math.cos(a)*.128,Math.sin(a)*.128,.071,.028);
    }
    drums.push(roller);
  }
  form(k,prow,'navalJade',[[0,-.11,.062,.205,.123],[0,-.027,.164,.253,.153],[0,.069,.214,.227,.157],
    [0,.166,.212,.141,.102],[0,.229,.158,.085,.079]],mobile,11,2.62);
  for(const s of signs){
    const petal=mirror(s,[[.005,.142,.169],[.129,.188,.192],[.221,.087,.171],[.245,-.043,.222],
      [.142,-.119,.294],[.021,-.08,.291]]);
    plate(k,prow,'navalCopper','navalIvory',petal,mobile,.055);
    const cannon=k.bone(prow,s*.133,.014,.254);
    ring(k,cannon,'navalBrass',.079,.023,mobile,.069);
    pin(k,cannon,'glow',0,0,.093,.053,.045,.03);
  }
  return {chassis,prow,drums};
}

function navalAdmiral(k,weapon,mobile,fighter){
  paint(k,[['navalWood',0x4c3d31,.14,.77,'hide'],['navalJade',0x3f5755,.30,.62,'iron'],
    ['navalCopper',0x6e5340,.53,.52,'bronze'],['navalBrass',0xb58f51,.66,.42,'bronze'],
    ['navalIvory',0xc9bea3,.31,.54,'bone'],['navalInk',0x303946,.09,.77,'cloth'],['navalSkin',0xa4876b,.03,.83,'hide']]);
  const {chassis,prow,drums}=keel(k,mobile);
  const model=fighter(k,{broad:.36,ground:1.24,neck:.68,armLength:.64,style:'ritual',finish:'navalInk',legs:false,mobile,
    portrait(k,head){
      const face=carvedFace(k,head,{style:'elder',finish:'navalSkin',dark:'navalInk',brow:'navalWood',eye:'glow',width:.353});
      form(k,head,'navalInk',[[0,.057,-.059,.171,.11],[0,.127,-.042,.195,.133],
        [0,.247,-.047,.155,.147],[.009,.308,-.083,.129,.112],[.022,.356,-.087,.042,.053]],mobile,12,3.06);
      for(const s of signs){
        plate(k,head,'navalJade','navalBrass',mirror(s,[[.017,.123,.157],[.128,.142,.116],
          [.249,.134,-.026],[.211,.066,-.087],[.081,.068,-.073],[.037,.079,.098]]),mobile,.047);
        stroke(k,face.jaw,'navalWood',mirror(s,[[.018,.03,.064,.015],[.056,.014,.079,.034],
          [.06,-.074,.081,.043],[.031,-.173,.065,.007]]),mobile);
      }
      return face.jaw;
    },
    weapon(k,body,back,head,grips){
      turtleBow(k,grips[0],mobile);
      for(const s of signs){
        for(let i=0;i<4;i++){
          const y=.51-i*.115;
          plate(k,body,i%2?'navalJade':'navalInk','navalBrass',mirror(s,[[.021,y+.06,.251],[.153,y+.08,.214],
            [.303,y+.036,.111],[.306,y-.083,.142],[.172,y-.121,.245],[.021,y-.085,.276]]),mobile,.046);
        }
        const shoulder=grips[s<0?0:1].parent.parent;
        plate(k,shoulder,'navalCopper','navalIvory',mirror(s,[[.022,.131,.071],[.154,.178,.057],
          [.256,.086,-.12],[.211,-.021,-.145],[.106,-.101,.038],[.031,-.044,.124]]),mobile,.054);
      }
    },
  });
  const seat=k.bone(chassis,0,.307,-.111);
  form(k,seat,'navalInk',[[0,-.04,-.032,.174,.144],[0,.021,-.019,.229,.187],
    [.005,.078,-.067,.213,.179],[.024,.146,-.146,.153,.11]],mobile,12,3.16);
  for(const s of signs)stroke(k,seat,'navalBrass',mirror(s,[[.094,.108,.099,.022],[.218,.11,.019,.024],
    [.233,.164,-.083,.024],[.137,.213,-.178,.003]]),mobile);
  chassis.attach(model.body);
  const back=k.bone(chassis,0,.537,-.64);
  for(let i=-2;i<=2;i++){
    const rail=k.bone(back,i*.156,.026-i*i*.013,-.091-i*i*.006);
    stroke(k,rail,'navalCopper',[[0,-.207,.115,.042],[0,-.043,.055,.045],
      [.016,.084,-.019,.035],[.026,.173,-.048,.014]],mobile);
  }
  model.pattern='aim';
  model.vaultMechanism=({beat,wind,strike,travel})=>{
    chassis.rotation.x=.036*Math.sin(beat*.61)+wind*.083-strike*.13;
    chassis.rotation.z=Math.sin(beat*.52)*(.025+travel*.039);
    prow.rotation.x=-wind*.105+strike*.17;
    for(const [i,roller] of drums.entries())roller.rotation.z=(i?1:-1)*(beat*.6+travel*.72);
  };
  model.polishEnergy={tint:0xb4cfaa,shape:'mist',anchor:chassis,offset:[0,.23,-.16],span:[.82,.7,.73]};
  model.relicDress=tools=>clothes(tools,model.body,weapon.guardian.name,signs.map(s=>({name:'水師指揮幟 '+s,
    path:mirror(s,[[.164,.479,-.142,.085],[.211,.232,-.292,.123],[.316,-.331,-.508,.15],[.429,-.644,-.66,.039]]),
    tint:0x354c54,trim:0xab995c,lining:0x2c333d,phase:s*.87,flex:1.25,
  })));
  return model;
}

const hunters={'kunoichi-claw':shadowNinja,'blood-axe':executioner,'turtle-bow':navalAdmiral};

export function sculptFrontlineHunter(k,weapon,mobile,fighter){
  const sculpt=hunters[weapon.id];
  if(!sculpt)return null;
  const model=sculpt(k,weapon,mobile,fighter);
  model.frontlineHunter=weapon.id;
  return model;
}
