import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(s,p)=>p.map(([x,...rest])=>[x*s,...rest]);
const palette=(color,metal,roughness,texture)=>[color,metal,roughness,texture];
export const templeFinishes={
  m060:{priRobe:palette(0x203342,.08,.84,'cloth'),priThread:palette(0x507484,.25,.74,'cloth'),
    priAccent:palette(0x6e3d4b,.14,.77,'cloth'),priBone:palette(0xa7b7b6,.14,.68,'bone'),priMetal:palette(0x5d808a,.64,.58,'iron'),
    priLight:palette(0x68bccb,.35,.51,'gem')},
  m061:{priRobe:palette(0x3d3d36,.07,.85,'cloth'),priThread:palette(0xa0936f,.14,.80,'cloth'),
    priAccent:palette(0x905f2a,.22,.73,'hide'),priBone:palette(0xbab4a5,.09,.74,'bone'),priMetal:palette(0x9c7536,.68,.54,'bronze'),
    priLight:palette(0x729850,.34,.56,'gem')},
  m062:{priRobe:palette(0x392c27,.10,.82,'hide'),priThread:palette(0xa18b6b,.15,.76,'cloth'),
    priAccent:palette(0x6a492f,.24,.69,'hide'),priBone:palette(0x9e8b6b,.09,.78,'cloth'),priMetal:palette(0x838b84,.72,.53,'iron'),
    priLight:palette(0xac8343,.51,.60,'bronze')},
};

function tools(k,mobile){
  const joint=(parent,name,x,y,z)=>{
    const n=k.bone(parent,x,y,z);
    n.name=name;
    return n;
  };
  const mass=(parent,material,path,seed=0,section=2.46)=>k.geometry(parent,material,
    sculptVolume(path,{rings:mobile?10:16,sides:mobile?9:13,section,seed,ridge:.17}));
  const plate=(parent,material,path,depth=.039)=>k.sculpt.plate(parent,material,path,depth,depth*.34);
  const rib=(parent,material,path)=>k.sculpt.sweep(parent,material,path,{steps:mobile?8:12,sides:mobile?5:7,ridge:.16});
  const vane=(parent,material,path,w,seed)=>k.geometry(parent,material,featherVane(...path,w,seed,mobile?7:11));
  return {joint,mass,plate,rib,vane};
}

function addCloth(silks,parent,name,path,tint,trim,phase,across,flex=.83){
  silks.push({parent,name,path,tint,trim,lining:0x292c33,phase,flex,across});
}

function hand(k,t,part,skin='bFlesh'){
  const {hand:palm,side}=part,{joint,mass,rib}=t;
  mass(palm,skin,[[0,.052,.009,.041,.048],[.014,-.012,.062,.066,.053],[.021,-.065,.113,.049,.036]],8.3+side);
  const curl=joint(palm,'Temple opening fingers '+side,0,-.04,.089);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.027, reach=.108-Math.abs(i-1.3)*.015;
    rib(curl,skin,[[x,0,0,.013],[x-.004,-.029,reach*.57,.017],[x+.002,-.073,reach,.013],[x+.007,-.079,reach+.019,.004]]);
  }
  rib(palm,skin,mirror(side,[[-.037,-.011,.034,.015],[-.061,-.049,.071,.023],[-.039,-.075,.114,.008]]));
  return curl;
}

function basicLegs(t,legs,{color='priRobe',leather='priAccent',trim='priThread',compact=false}={}){
  const {mass,plate,rib}=t;
  for(const {hip,knee,boot,side} of legs){
    const f=p=>mirror(side,p),h=Math.abs(knee.position.y),l=Math.abs(boot.position.y),u=compact?.81:1;
    mass(hip,color,f([[0,.045,0,.104*u,.102*u],[.027,-h*.29,-.027,.127*u,.106*u],
      [.035,-h*.66,.017,.095*u,.087*u],[.017,-h,.055,.07*u,.071*u]]),4.31+side);
    mass(knee,color,f([[0,.045,.014,.067*u,.078*u],[.026,-l*.23,.019,.087*u,.081*u],
      [.019,-l*.69,.05,.077*u,.06*u],[.008,-l,.053,.045*u,.056*u]]),3.1+side);
    for(let row=0;row<(compact?4:3);row++){
      const y=-l*(.30+row*.16);
      rib(knee,row%2?trim:leather,f([[-.064,y+.03,.045,.006],[.011,y+.019,.103,.010],
        [.07,y-.005,.077,.013],[.080,y-.031,.012,.003]]));
    }
    mass(boot,leather,[[0,.053,-.012,.042,.049],[.012,.017,.041,.062,.06],[.016,-.033,.143,.043,.071],
      [.024,-.051,.22,.016,.043]],13.7+side);
    plate(boot,color,f([[-.052,-.028,.04],[.05,-.018,.06],[.079,-.041,.139],[.051,-.05,.221],[-.062,-.055,.204]]),.024);
  }
}

function wavePriest(k,t,body,head,mobile){
  const {joint,mass,plate,rib,vane}=t,silks=[],sleeves=[],sorcery=[];
  const cap=joint(head,'Zhenwu ice lacquer cap',0,.151,-.066);
  mass(body,'priRobe',[[0,-.62,-.05,.269,.20],[0,-.287,-.054,.282,.225],[0,.091,-.02,.257,.197],
    [0,.387,-.03,.328,.221],[0,.608,-.029,.314,.20],[0,.799,-.012,.155,.106]],9.47);
  mass(cap,'priRobe',[[0,-.042,-.016,.148,.133],[0,.042,-.008,.18,.145],[0,.126,-.043,.139,.129],
    [0,.261,-.082,.074,.071],[0,.361,-.126,.031,.041]],30.6);
  for(const side of sides){
    const f=p=>mirror(side,p);
    plate(cap,'priMetal',f([[.02,.018,.139],[.096,.043,.114],[.166,.098,.008],[.128,.179,-.047],
      [.051,.298,-.088],[.014,.192,.004]]),.04);
    rib(cap,'priLight',f([[.021,.035,.158,.004],[.095,.083,.113,.011],[.127,.149,.032,.009],[.067,.253,-.062,.003]]));
    for(let g=0;g<(mobile?4:7);g++){
      const u=g*.024,path=f([[.078+u,.115-u*.45,-.121],[.126+u,.018-u*.35,-.175],[.134+u,-.271-u*.55,-.263]]);
      vane(head,g%3?'priBone':'priThread',path,.036+.005*g,18.7+g);
    }
    const lapel=f([[.039,.759,.107],[.125,.734,.174],[.221,.623,.198],[.196,.408,.234],
      [.078,.209,.271],[.041,.312,.232],[.091,.601,.197]]);
    plate(body,'priRobe',lapel,.047);
    rib(body,side<0?'priAccent':'priThread',lapel.slice(1,5).map(([x,y,z],i)=>[x,y-.013,z+.026,[.009,.018,.021,.005][i]]));
    for(let i=0;i<4;i++){
      const y=.63-i*.118,w=.245-i*.014;
      rib(body,'priThread',f([[.025,y-.071,-.237,.005],[.117,y-.038,-.268,.014],[w*.9,y+.019,-.228,.016],[w,y+.051,-.145,.004]]));
    }
    addCloth(silks,body,'真武 · 冰河底裾 '+side,f([[.114,.049,.16,.141],[.157,-.291,.225,.185],
      [.223,-.684,.289,.245],[.242,-1.008,.271,.205]]),0x253f56,0x6a9ba7,side*.75,[.94,0,side*.18]);
    addCloth(silks,body,'真武 · 遮風後袍 '+side,f([[.117,.618,-.175,.11],[.169,.269,-.238,.141],
      [.193,-.366,-.298,.227],[.255,-.932,-.366,.214]]),0x202b3d,0x527887,side*.93,[.96,0,side*.19]);
  }
  function fitArms(arms){
    for(const unit of arms){
      const {root,elbow,side}=unit,f=p=>mirror(side,p);
      const cuff=joint(elbow,'Zhenwu bell sleeve '+side,side*.013,-.085,.039);
      mass(root,'priRobe',f([[0,.069,.012,.091,.096],[.055,-.046,-.023,.121,.112],
        [.075,-.158,-.005,.123,.117],[.103,-.258,.029,.09,.094]]),6.13+side);
      mass(cuff,'priRobe',f([[0,.104,-.015,.091,.084],[.043,.021,.012,.126,.104],
        [.044,-.121,.041,.153,.127],[.021,-.254,.076,.155,.139]]),10.11+side);
      rib(cuff,'priAccent',f([[-.108,-.221,.122,.009],[-.062,-.256,.199,.018],
        [.045,-.255,.213,.018],[.147,-.239,.164,.005]]));
      for(let i=0;i<3;i++){
        const x=(i-1)*.065;
        rib(cuff,'priThread',f([[x,.016,.068,.004],[x+.017,-.111,.116+i*.006,.012],[x+.017,-.21,.162+i*.008,.003]]));
      }
      sleeves.push({cuff,side,curl:hand(k,t,unit,'priBone')});
    }
  }
  function weapons(arms){
    const mounts=arms.map(({hand:palm,side})=>joint(palm,'Zhenwu open palm channel '+side,0,.015,.125));
    for(let i=0;i<4;i++){
      const fan=joint(mounts[1],'Zhenwu flat ice shard '+i,0,0,0);
      const gap=.058*i,tip=[[0,.036,.016],[.078+gap,.192+i*.026,-.011],[.124+gap,.434+i*.04,.019],
        [.056+gap,.389+i*.03,.043],[-.014,.121,.052]];
      plate(fan,i%2?'priLight':'priMetal',tip,.033);
      rib(fan,'priBone',tip.slice(1,4).map(([x,y,z],j)=>[x,y,z+.014,[.008,.012,.002][j]]));
      sorcery.push({fan,i});
    }
    return mounts;
  }
  return {silks,fitArms,weapons,energy:[0x9adcfc,'mist',[0,.32,-.31],[.67,.62,.35]],
    poseArms({beat,wind,strike,arms}){
      const [lead,focus]=arms;
      lead.root.rotation.x=-.59-wind*.67-strike*.41;
      lead.elbow.rotation.x=-.57-wind*.39+strike*.53;
      focus.root.rotation.x=-.17-wind*.46-strike*.63;
      for(const {cuff,side,curl} of sleeves){
        cuff.rotation.z=side*(Math.sin(beat*.67)*.053+wind*.15+strike*.17);
        curl.rotation.x=.31+wind*.46-strike*.66;
      }
      for(const {fan,i} of sorcery){
        fan.rotation.set(.17+wind*.39-strike*.58,-.73+i*.45+wind*.18,-.49+i*.28+wobble(beat,i)*.043);
        fan.scale.setScalar(.74+wind*.27+strike*.36);
      }
    }};
}

function wobble(beat,i){return Math.sin(beat*.81+i*.69);}

function poisonPriest(k,t,body,head,mobile){
  const {joint,mass,plate,rib,vane}=t,silks=[],plates=[];
  const wrap=joint(head,'Xudu swept cloth knot',0,.16,-.041);
  mass(wrap,'priBone',[[0,-.243,-.177,.073,.043],[0,-.146,-.171,.112,.082],[0,-.026,-.133,.137,.097],
    [0,.031,-.084,.136,.133],[0,.085,-.083,.121,.146],[0,.127,-.123,.078,.117],[0,.153,-.198,.037,.067]],16.88);
  mass(body,'priRobe',[[0,-.201,-.032,.201,.173],[0,-.015,-.02,.246,.187],[0,.278,-.026,.285,.218],
    [.002,.509,-.055,.306,.226],[.009,.647,-.05,.271,.191],[0,.739,-.03,.155,.105]],11.2);
  for(const side of sides){
    const f=p=>mirror(side,p);
    for(let i=0;i<4;i++){
      const y=-.013+i*.025,wide=.121-i*.011;
      rib(wrap,i%2?'priThread':'priBone',f([[.011,y+.016,.159-i*.018,.005],[wide*.71,y+.022,.136-i*.011,.014],
        [wide,y+.016,.08-i*.017,.013],[wide*.87,y+.033,-.054,.004]]));
    }
    for(let i=0;i<5;i++){
      const y=.062-i*.054,w=.112-i*.008;
      rib(wrap,i%2?'priThread':'priBone',f([[.011,y-.018,-.236,.004],[w*.59,y-.011,-.239,.012],
        [w*.89,y+.023,-.212,.011],[w*.97,y+.049,-.155,.008],[w*.89,y+.067,-.101,.003]]));
    }
    for(let i=0;i<(mobile?3:5);i++){
      const path=f([[.091,.103-i*.038,-.091],[.14,.028-i*.042,-.16],[.124,-.188-i*.066,-.249]]);
      vane(head,i%2?'priThread':'priBone',path,.042+i*.004,18.7+i);
    }
    const collar=f([[.031,.697,.117],[.111,.653,.169],[.227,.554,.218],[.265,.463,.167],
      [.196,.411,.21],[.069,.52,.23],[.015,.621,.185]]);
    plate(body,'priBone',collar,.042);
    rib(body,'priThread',collar.slice(0,5).map(([x,y,z],i)=>[x,y-.01,z+.027,[.008,.014,.021,.016,.005][i]]));
    const shoulderCap=f([[.12,.589,-.117],[.225,.557,-.143],[.269,.443,-.181],
      [.216,.363,-.23],[.137,.396,-.259],[.105,.498,-.221]]);
    plate(body,'priThread',shoulderCap,.043);
    rib(body,'priAccent',shoulderCap.slice(1,5).map(([x,y,z],i)=>[x,y-.016,z-.022,[.006,.017,.015,.003][i]]));
    const cross=f([[.247,.431,.167],[.158,.346,.226],[.056,.255,.263],[-.087,.163,.238],
      [-.176,.061,.208],[-.221,-.057,.126]]);
    rib(body,'priAccent',cross.map(([x,y,z],i)=>[x,y,z,[.008,.026,.031,.027,.022,.005][i]]));
    addCloth(silks,body,'虛毒 · 灰布肩領 '+side,f([[.14,.513,-.187,.08],[.199,.313,-.236,.129],
      [.229,.04,-.282,.121],[.287,-.379,-.277,.062]]),0x53504a,0x9a8760,side*.61,[.92,0,side*.23]);
    addCloth(silks,body,'虛毒 · 舊錦結襟 '+side,f([[.117,-.032,.173,.091],[.142,-.287,.216,.136],
      [.18,-.557,.247,.154],[.222,-.694+side*.045,.243,.089]]),0x424138,0x7b6745,side*.71,[.96,0,side*.18]);
    addCloth(silks,body,'虛毒 · 藥囊垂帶 '+side,f([[.182,.085,-.053,.057],[.211,-.108,-.092,.078],
      [.269,-.286,-.13,.08],[.319,-.53,-.124,.042]]),0x65614c,0xa38656,side*.97,[.65,0,side*.62]);
  }
  function fitArms(arms){
    for(const unit of arms){
      const {root,elbow,side}=unit,f=p=>mirror(side,p);
      const neck=joint(root,'Xudu folded shoulder wrap '+side,side*.059,-.032,-.02);
      mass(root,'priRobe',f([[0,.055,0,.076,.079],[.053,-.034,-.027,.115,.113],
        [.085,-.134,.01,.104,.095],[.089,-.26,.038,.071,.067]]),3.87+side);
      mass(elbow,'priRobe',f([[0,.057,.022,.061,.063],[.028,-.062,.065,.092,.081],
        [.043,-.16,.069,.087,.073],[.028,-.267,.09,.051,.061]]),6.5+side);
      for(let i=0;i<3;i++){
        const y=.023-i*.068;
        const binding=f([[-.055,y+.043,.106],[.057,y+.041,.103],[.124,y+.005,.041],
          [.101,y-.041,-.044],[.015,y-.057,-.091],[-.047,y-.015,-.056]]);
        plate(neck,i%2?'priAccent':'priThread',binding,.038);
        rib(neck,'priMetal',binding.slice(1,5).map(([x,h,z],j)=>[x,h+.006,z+.019,[.006,.014,.009,.003][j]]));
      }
      for(let row=0;row<4;row++){
        const y=-.031-row*.049;
        rib(elbow,row%2?'priBone':'priThread',f([[-.055,y+.013,.071,.005],[-.01,y,.121,.011],
          [.052,y-.005,.116,.013],[.105,y-.028,.064,.003]]));
      }
      plates.push({neck,side,curl:hand(k,t,unit)});
    }
  }
  function weapons(arms){
    const left=joint(arms[0].hand,'Xudu casting palm',0,-.016,.108);
    const staff=joint(arms[1].hand,'Xudu lacquered poison crook',0,-.038,.145);
    mass(staff,'priAccent',[[.018,-.77,.012,.022,.027],[0,-.43,.017,.033,.043],[0,.029,.004,.038,.04],
      [.043,.511,-.027,.033,.036],[.121,.917,.013,.038,.034],[.187,1.203,.036,.024,.025]],12.31);
    for(let i=0;i<7;i++){
      const y=-.541+i*.194,x=.025*Math.sin(y*1.6)+Math.max(0,y)*.094;
      rib(staff,i%2?'priRobe':'priMetal',[[x-.037,y,.013,.005],[x-.012,y+.043,.052,.009],
        [x+.031,y+.047,.058,.012],[x+.052,y+.021,.019,.004]]);
    }
    const tip=[[.086,.81,.025],[.135,1.079,.009],[.227,1.391,-.011],[.287,1.411,.04],
      [.417,1.268,.056],[.414,1.106,.044],[.321,1.002,.037],[.255,1.025,.038],[.292,1.093,.05],
      [.349,1.123,.051],[.352,1.225,.047],[.28,1.329,.035],[.176,1.135,.043],[.149,.912,.053]];
    plate(staff,'priMetal',tip,.05);
    for(const face of sides)rib(staff,'priLight',tip.slice(1,9).map(([x,y,z],i)=>[x,y,z+face*.023,[.004,.008,.012,.009,.012,.009,.007,.003][i]]));
    k.mesh(staff,'gem','priLight',.194,1.203,.055,.034,.079,.025,0,0,-.33);
    markEnemyWeapon(staff,[.239,1.374,.014],{from:[.018,-.75,.01],width:.119,aim:false,kind:'focus'});
    return [left,staff];
  }
  return {silks,fitArms,weapons,fitLegs:legs=>basicLegs(t,legs),energy:[0x92bb5f,'mist',[0,.20,-.28],[.62,.43,.44]],
    poseArms({beat,body,wind,strike,travel,arms,right,legs}){
      const [lead,focus]=arms;
      body.rotation.x+=.11+wind*.13-strike*.133;
      lead.root.rotation.x=-.49-wind*.94+strike*.66;
      lead.elbow.rotation.x=-.87-wind*.42+strike*.79;
      focus.root.rotation.x=-.37-wind*.31+strike*.36;
      focus.elbow.rotation.x=-.58+wind*.27-strike*.44;
      right.rotation.set(1.02+wind*.38+strike*.11,.11+strike*.38,-.26+wind*.17-strike*.22);
      for(const {hip,knee} of legs){hip.rotation.x-=.16+wind*.26;knee.rotation.x+=.13+travel*.09;}
      for(const {neck,side,curl} of plates){
        neck.rotation.x=wobble(beat,side)*.032+wind*.122-strike*.14;
        curl.rotation.x=side===1?.88:.31+wind*.44-strike*.79;
      }
    }};
}

function daggerScout(k,t,body,head,mobile){
  const {joint,mass,plate,rib,vane}=t,silks=[],fingers=[];
  const knot=joint(head,'Duoling tied hair and ribbon',.023,.182,-.117);
  mass(head,'bHair',[[0,-.063,-.116,.079,.075],[0,.051,-.125,.123,.103],
    [.011,.163,-.068,.132,.126],[.015,.238,-.034,.117,.127],[.017,.296,-.075,.054,.078]],16.2);
  mass(knot,'bHair',[[0,-.026,.016,.056,.062],[.042,.043,-.037,.076,.082],
    [.075,.076,-.104,.063,.065],[.093,.057,-.174,.031,.04]],17.35);
  for(let i=0;i<(mobile?4:6);i++){
    const w=.035+i*.01,path=[[.056+i*.014,.042-i*.01,-.059],[.092+i*.026,.003-i*.029,-.125],
      [.123+i*.022,-.165-i*.031,-.178-i*.022]];
    vane(knot,i%3?'bHair':'priAccent',path,w,31+i);
  }
  for(let i=0;i<(mobile?4:7);i++){
    const u=i*.037;
    const path=[[-.097+u,.241+u*.21,.024+u*.03],[-.108+u*.81,.203+u*.13,.135+u*.08],
      [-.129+u*.86,.089+u*.42,.113+u*.23]];
    vane(head,'bHair',path,.044+i*.002,14.07+i);
  }
  for(let strip=0;strip<3;strip++){
    const u=strip*.032;
    rib(head,'priRobe',[[-.092+u,.239+.022*strip,.116,.006],[.014+u,.262-u*.07,.077,.010],
      [.09+u*.25,.257-u*.17,-.016,.012],[.045,.213-u*.14,-.133,.003]]);
  }
  mass(body,'priRobe',[[0,-.158,-.014,.154,.142],[.005,-.026,-.025,.166,.147],
    [.01,.237,-.02,.232,.172],[.004,.457,-.035,.267,.183],[0,.642,-.039,.217,.157],[0,.753,-.019,.110,.093]],5.49);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const collar=f([[.048,.694,.109],[.157,.596,.158],[.253,.471,.115],[.219,.329,.187],
      [.096,.177,.236],[.028,.208,.213],[.132,.451,.194]]);
    plate(body,side<0?'priAccent':'priRobe',collar,.039);
    rib(body,'priThread',collar.slice(0,6).map(([x,y,z],i)=>[x,y-.01,z+.026,[.004,.009,.011,.018,.015,.004][i]]));
    for(let i=0;i<3;i++){
      const y=.582-i*.112;
      const panel=f([[.046,y+.027,-.168],[.126,y+.044,-.213],[.208,y+.017,-.186],
        [.209,y-.067,-.126],[.128,y-.091,-.178],[.073,y-.054,-.201]]);
      plate(body,i%2?'priAccent':'priRobe',panel,.038);
      rib(body,'priAccent',panel.slice(1,5).map(([x,h,z],n)=>[x,h+.009,z-.02,[.003,.016,.011,.004][n]]));
    }
    addCloth(silks,body,'多玲 · 手染腰巾 '+side,f([[.068,-.056,.163,.069],[.126,-.217,.205,.102],
      [.173,-.387,.236,.099],[.198,-.581+side*.049,.215,.055]]),
      side<0?0x9a8a67:0xb5a180,0x937047,side*.66,[.95,0,side*.27],.7);
    addCloth(silks,body,'多玲 · 背飄結帶 '+side,f([[.109,.064,-.157,.052],[.156,-.133,-.229,.061],
      [.247,-.303,-.319,.078],[.295,-.542+side*.031,-.374,.036]]),
      0x674c36,0x9d7850,side*.79,[.71,0,side*.62],.95);
  }
  const sash=joint(body,'Duoling wrapped linen knot',.124,.002,.18);
  for(let row=0;row<3;row++){
    const y=-.007-row*.049;
    rib(body,row%2?'priThread':'priBone',[[.164,y,.065,.013],[.112,y-.026,.156,.024],[-.025,y-.031,.181,.029],
      [-.156,y-.004,.105,.024],[-.182,y+.018,-.027,.006]]);
  }
  mass(sash,'priBone',[[.037,.058,-.01,.026,.031],[.006,.027,.031,.045,.039],
    [-.012,-.023,.037,.056,.034],[-.029,-.064,.021,.028,.024]],7.19);
  function fitArms(arms){
    for(const unit of arms){
      const {root,elbow,side}=unit,f=p=>mirror(side,p);
      mass(root,'priAccent',f([[0,.06,-.015,.072,.077],[.038,-.034,-.007,.097,.085],
        [.071,-.153,.016,.082,.072],[.086,-.249,.043,.057,.059]]),4.6+side);
      mass(elbow,'bFlesh',f([[0,.045,.023,.044,.048],[.029,-.057,.047,.067,.062],
        [.031,-.158,.069,.057,.058],[.021,-.274,.089,.041,.046]]),13.4+side);
      const sleeve=f([[-.056,.062,.051],[.062,.054,.091],[.128,-.011,.077],[.134,-.083,.055],
        [.064,-.103,.108],[-.055,-.079,.095]]);
      plate(root,'priRobe',sleeve,.036);
      rib(root,'priLight',sleeve.slice(1,5).map(([x,y,z],i)=>[x,y-.011,z+.02,[.004,.013,.009,.004][i]]));
      for(let row=0;row<3;row++){
        const y=-.129-row*.042;
        rib(elbow,row%2?'priThread':'priBone',f([[-.043,y+.016,.072,.004],[-.012,y+.029,.11,.011],
          [.061,y-.012,.109,.011],[.079,y-.024,.074,.003]]));
      }
      fingers.push({curl:hand(k,t,unit),side});
    }
  }
  function weapons(arms){
    const blade=joint(arms[0].hand,'Duoling tapered fist dagger',-.013,-.051,.118);
    const right=joint(arms[1].hand,'Duoling empty parry hand',.004,-.02,.092);
    mass(blade,'priAccent',[[0,-.197,0,.019,.024],[0,-.128,.007,.025,.027],
      [.005,-.018,.006,.026,.028],[.008,.074,.017,.026,.027]],8.7);
    plate(blade,'priLight',[[-.071,.05,.029],[.066,.055,.031],[.08,.097,.02],[.017,.116,.023],
      [-.053,.098,.024]],.037);
    plate(blade,'priMetal',[[.003,.101,.014],[.064,.158,.012],[.075,.277,.02],[.038,.426,-.019],
      [-.009,.375,.022],[-.051,.24,.018],[-.04,.13,.021]],.035);
    rib(blade,'priBone',[[.055,.163,.028,.005],[.061,.258,.036,.009],[.052,.335,.018,.007],[.038,.426,-.012,.002]]);
    markEnemyWeapon(blade,[.038,.426,-.019],{from:[0,-.17,0],width:.078});
    return [blade,right];
  }
  return {silks,fitArms,weapons,fitLegs:legs=>basicLegs(t,legs,{compact:true}),energy:[0xd8ae79,'bolts',[0,.24,-.209],[.46,.44,.31]],
    poseArms({beat,body,wind,strike,travel,arms,left,legs}){
      const [lead,guard]=arms;
      body.rotation.x+=.052+travel*.087-wind*.10+strike*.164;
      body.rotation.y=wind*.31-strike*.48;
      lead.root.rotation.x=-.37+wind*.36-strike*1.04;
      lead.elbow.rotation.x=-.68-wind*.63+strike*.48;
      guard.root.rotation.x=-.34-wind*.28-strike*.41;
      guard.elbow.rotation.x=-.62-wind*.17+strike*.26;
      left.rotation.x=.69+wind*.38-strike*.45;
      for(const {hip} of legs)hip.rotation.x-=travel*.091+wind*.12;
      for(const {curl,side} of fingers)curl.rotation.x=side===-1?.83:.29+wind*.44-strike*.64;
      knot.rotation.x=wobble(beat,1)*.074+wind*.05-strike*.28;
      knot.rotation.z=wobble(beat,0)*.057+wind*.08-strike*.12;
      sash.rotation.z=wind*.09-strike*.18;
    }};
}

const sculptors={m060:wavePriest,m061:poisonPriest,m062:daggerScout};
export function sculptTempleFigure(k,id,body,head,mobile){
  return sculptors[id]?.(k,tools(k,mobile),body,head,mobile)??null;
}
