import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const sides=[-1,1];
const mirror=(s,p)=>p.map(([x,...tail])=>[x*s,...tail]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?8:13,sides:mobile?6:8,ridge:.16});
const volume=(k,j,m,p,mobile,seed=0,section=2.4)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?11:18,sides:mobile?9:14,ridge:.128,section,seed,
}));
const gem=(k,j,m,x,y,z,r)=>k.mesh(j,'gem',m,x,y,z,r,r*.9,r*.77);

function panel(k,j,m,path,mobile,{back=false,depth=.040,rim='discipleGold'}={}){
  k.sculpt.plate(j,m,path,depth,depth*.34);
  sweep(k,j,rim,path.slice(0,-1).map(([x,y,z],i)=>[x,y,z+(back?-1:1)*depth*.47,i%3?.009:.014]),mobile);
}

export const templeDiscipleFinishes={
  m118:{discipleSkin:[0x405154,.038,.85,'hide'],discipleUnder:[0x6f7166,.032,.84,'hide'],discipleDark:[0x202934,.16,.70,'hide'],
    discipleHair:[0x27282c,.039,.87,'hide'],discipleBlue:[0x203a60,.38,.59,'iron'],discipleGold:[0xb08b46,.65,.49,'bronze'],
    discipleSilk:[0x287165,.07,.81,'cloth'],discipleLinen:[0xaab7a2,.07,.82,'cloth'],discipleInset:[0x4ea99e,.25,.56,'gem'],
    discipleWood:[0x36292a,.12,.81,'hide'],discipleBone:[0xc1b696,.14,.66,'bone']},
  m119:{discipleSkin:[0x7d7567,.025,.83,'hide'],discipleUnder:[0x625756,.04,.80,'hide'],discipleDark:[0x27262a,.53,.55,'iron'],
    discipleHair:[0x261e25,.048,.88,'hide'],discipleBlue:[0x242b3b,.34,.61,'iron'],discipleGold:[0xa1804f,.66,.50,'bronze'],
    discipleSilk:[0x604555,.075,.81,'cloth'],discipleLinen:[0xb6aaa0,.08,.82,'cloth'],discipleInset:[0x99573d,.44,.51,'bronze'],
    discipleWood:[0x443235,.19,.75,'hide'],discipleBone:[0xc6b6a1,.14,.63,'bone']},
};

function simianFace(k,head,mobile){
  volume(k,head,'discipleSkin',[[0,-.142,.018,.091,.086],[0,-.067,.008,.15,.126],[0,.056,-.025,.172,.151],
    [0,.153,-.059,.155,.138],[0,.228,-.079,.099,.112]],mobile,33,2.29);
  const jaw=k.bone(head,0,-.110,.099);
  volume(k,jaw,'discipleUnder',[[0,-.115,.024,.065,.055],[0,-.069,.067,.128,.073],[0,-.012,.079,.132,.094],
    [0,.058,.055,.108,.091]],mobile,56,2.66);
  volume(k,head,'discipleUnder',[[0,-.081,.122,.097,.077],[0,-.036,.151,.108,.086],[0,.019,.125,.102,.078],
    [0,.063,.093,.065,.057]],mobile,11,2.69);
  volume(k,head,'discipleHair',[[0,-.035,.211,.060,.036],[0,.005,.211,.082,.042],[0,.043,.171,.061,.043]],mobile,9,2.9);
  sweep(k,jaw,'discipleHair',[[-.091,.015,.151,.006],[-.047,.005,.163,.012],[0,-.011,.173,.009],
    [.046,.006,.163,.011],[.087,.015,.149,.005]],mobile);
  for(const s of sides){
    volume(k,head,'discipleSkin',mirror(s,[[.146,-.047,-.043,.038,.035],[.169,-.003,-.035,.048,.043],
      [.172,.073,-.06,.044,.040],[.151,.107,-.082,.020,.023]]),mobile,72,2.19);
    sweep(k,head,'discipleUnder',mirror(s,[[.154,-.029,-.018,.006],[.178,.011,.011,.012],[.181,.056,-.006,.012],
      [.159,.084,-.019,.006]]),mobile);
    const orbit=mirror(s,[[.037,.083,.152],[.076,.109,.168],[.113,.106,.141],[.132,.083,.104],
      [.107,.053,.144],[.061,.055,.161]]);
    panel(k,head,'discipleDark',orbit,mobile,{depth:.014,rim:'discipleUnder'});
    k.mesh(head,'gem','glow',s*.079,.080,.178,.029,.012,.015);
    k.mesh(head,'round','discipleHair',s*.081,.081,.192,.008,.009,.006);
    for(let i=0;i<5;i++){
      const y=.044-i*.033;
      sweep(k,head,i%3?'discipleHair':'discipleUnder',mirror(s,[[.127,y,.056,.017],[.162,y-.026,.075,.024],
        [.169,y-.072,.060,.021],[.152,y-.120,.033,.004]]),mobile);
    }
    const temple=mirror(s,[[.027,.173,.149],[.113,.182,.114],[.164,.144,.058],[.193,.065,-.031],
      [.175,-.046,-.07],[.153,-.119,-.048],[.148,-.042,.051],[.109,.099,.123]]);
    panel(k,head,'discipleGold',temple,mobile,{depth:.033,rim:'discipleBlue'});
    sweep(k,jaw,'discipleBone',mirror(s,[[.081,-.043,.126,.019],[.087,-.016,.143,.016],[.092,.005,.147,.003]]),mobile);
  }
  volume(k,head,'discipleBlue',[[0,.153,-.034,.169,.144],[0,.205,-.038,.180,.162],
    [0,.272,-.042,.159,.146],[0,.329,-.054,.124,.093],[0,.355,-.050,.061,.060]],mobile,67,2.30);
  for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9,x=Math.sin(a),z=Math.cos(a);
    sweep(k,head,i%3?'discipleDark':'discipleGold',[[x*.17,.202,-.026+z*.149,.010],[x*.15,.273,-.034+z*.147,.013],
      [x*.11,.323,-.039+z*.097,.011],[x*.055,.352,-.046+z*.057,.006]],mobile);
  }
  volume(k,head,'discipleGold',[[0,.334,-.048,.074,.071],[0,.364,-.052,.086,.076],
    [0,.392,-.053,.053,.052],[0,.423,-.056,.031,.03],[0,.446,-.056,.005,.005]],mobile,6);
  return jaw;
}

function asceticFace(k,head,mobile){
  const profile=[[0,-.155,.04,.103,.088],[0,-.087,.029,.155,.137],[0,.041,-.004,.163,.153],
    [0,.143,-.037,.151,.146],[0,.241,-.055,.106,.108]];
  const geo=sculptVolume(profile,{rings:mobile?23:36,sides:mobile?24:35,section:2.45,ridge:.068,seed:52});
  const g=(x,r)=>Math.exp(-((x/r)**2)),{position,color}=geo.attributes;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),front=Math.min(1,Math.max(0,z)*7.4),a=Math.abs(x);
    const cheek=g(a-.114,.048)*g(y+.032,.052),nose=g(x,.030)*(g(y+.036,.028)*.83+g(y-.031,.092)*.51);
    const orbit=g(a-.080,.042)*g(y-.064,.032),eyeRidge=g(a-.090,.053)*g(y-.100,.017);
    position.setZ(i,z+front*(.032*cheek+.066*nose-.024*orbit+.032*eyeRidge));
    const shade=1+front*(cheek*.112-orbit*.16);
    color.setXYZ(i,color.getX(i)*shade,color.getY(i)*shade,color.getZ(i)*shade);
  }
  geo.computeVertexNormals();
  k.geometry(head,'discipleSkin',geo);
  const jaw=k.bone(head,0,-.143,.048),locks=[];
  volume(k,jaw,'discipleSkin',[[0,-.077,.037,.056,.040],[0,-.051,.056,.097,.048],
    [0,.007,.063,.121,.050],[0,.043,.040,.131,.053]],mobile,32,2.36);
  sweep(k,jaw,'discipleHair',[[-.080,.019,.107,.004],[-.039,.024,.130,.008],[0,.015,.138,.008],
    [.041,.021,.129,.008],[.083,.017,.106,.004]],mobile);
  volume(k,jaw,'discipleHair',[[0,-.122,.115,.023,.019],[0,-.078,.128,.059,.030],
    [0,-.036,.114,.074,.031],[0,.003,.088,.085,.031]],mobile,8,2.2);
  for(const s of sides){
    const lid=mirror(s,[[.037,.053,.167],[.062,.073,.171],[.105,.080,.153],[.131,.064,.128],
      [.102,.044,.154],[.060,.034,.167]]);
    panel(k,head,'discipleHair',lid,mobile,{depth:.014,rim:'discipleUnder'});
    k.mesh(head,'round','discipleBone',s*.078,.056,.178,.028,.010,.014);
    k.mesh(head,'gem','glow',s*.081,.056,.191,.011,.009,.006);
    sweep(k,head,'discipleHair',mirror(s,[[.032,.107,.172,.012],[.068,.119,.170,.022],[.108,.117,.147,.019],
      [.132,.094,.127,.007]]),mobile);
    for(let i=0;i<3;i++)sweep(k,head,'discipleUnder',mirror(s,[[.069,.039-i*.021,.169,.003],
      [.121,.018-i*.023,.154,.006],[.143,-.005-i*.022,.130,.004]]),mobile);
    sweep(k,head,'discipleHair',mirror(s,[[.019,-.087,.199,.004],[.055,-.103,.178,.014],
      [.092,-.116,.153,.018],[.121,-.142,.123,.003]]),mobile);
    const lock=k.bone(head,s*.132,.122,-.091);
    locks.push({lock,s});
    for(let i=0;i<(mobile?5:8);i++){
      const x=.018+i*.019,y=.05-i*.024,z=-.019-i*.047;
      volume(k,lock,i%3?'discipleHair':'discipleDark',mirror(s,[[x,y,z,.042,.047],[x+.054,y-.157,z-.059,.058,.045],
        [x+.071,y-.342,z-.098,.039,.031],[x+.033,y-.516,z-.128,.007,.006]]),mobile,73+i,2.0);
    }
    gem(k,head,'discipleGold',s*.151,.02,-.025,.037);
  }
  volume(k,head,'discipleBlue',[[0,.128,-.042,.152,.124],[0,.209,-.061,.187,.159],[0,.272,-.076,.164,.143],
    [0,.316,-.093,.12,.092]],mobile,6,2.55);
  sweep(k,head,'discipleGold',[[-.185,.213,-.042,.015],[-.118,.232,.092,.021],[0,.191,.129,.023],
    [.119,.232,.091,.021],[.186,.213,-.042,.015]],mobile);
  for(let i=0;i<3;i++)sweep(k,head,'discipleBone',[[-.048,.155-i*.016,.147,.004],[-.014,.16-i*.017,.154,.006],
    [.024,.159-i*.016,.152,.006],[.05,.153-i*.016,.147,.005]],mobile);
  return {jaw,locks};
}

function templeBody(k,body,monkey,mobile){
  const w=monkey?.244:.30,d=monkey?.196:.234,waist=monkey?.175:.212;
  const profile=[[0,.58,-.022,waist*.89,d*.69],[0,.803,-.026,waist*1.09,d*.78],[0,1.046,.017,w*.79,d*.95],
    [0,1.298,.019,w,d],[0,1.498,.012,w*.82,d*.89],[0,1.658,.015,w*.39,d*.63],[0,1.729,.020,w*.32,d*.51]];
  const torso=sculptVolume(profile,{rings:mobile?18:33,sides:mobile?17:30,section:2.35,ridge:.091,seed:81});
  if(!monkey){
    const pos=torso.attributes.position;
    const bump=(x,r)=>Math.exp(-((x/r)**2));
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),a=Math.abs(x),front=Math.max(0,z)*4.5;
      const pec=bump(a-.112,.106)*bump(y-1.41+a*.19,.098),abs=bump(a-.072,.108)*bump(y-1.154,.133);
      const bone=bump(a-.15,.137)*bump(y-1.493-a*.17,.045),rib=bump(a-.193,.128)*bump(y-1.329+a*.27,.037);
      pos.setZ(i,z+front*(pec*.061+abs*.039+bone*.036-rib*.034-bump(x,.039)*bump(y-1.319,.188)*.030));
    }
    torso.computeVertexNormals();
  }
  k.geometry(body,monkey?'discipleBlue':'discipleSkin',torso);
  const fittings=[];
  if(monkey){
    for(const s of sides){
      const trim=mirror(s,[[.05,1.611,.105],[.163,1.536,.145],[.257,1.411,.122],
        [.214,1.263,.185],[.144,1.206,.259],[.045,1.255,.271]]);
      panel(k,body,'discipleGold',trim,mobile,{depth:.044,rim:'discipleSilk'});
      for(let i=0;i<4;i++){
        const t=i/3,x=.078+t*.138,y=1.242+t*.185,z=.278-t*.091;
        panel(k,body,'discipleBlue',mirror(s,[[x-.018,y+.05,z],[x+.016,y+.061,z-.011],
          [x+.044,y+.018,z-.028],[x+.021,y-.028,z],[x-.012,y-.027,z+.010]]),mobile,{depth:.019});
        gem(k,body,'discipleInset',s*(x+.014),y+.013,z+.032,.021);
      }
      const spine=k.bone(body,s*.128,1.32,-.211);
      panel(k,spine,'discipleSilk',mirror(s,[[.002,.11,-.031],[.141,.184,-.035],[.205,.119,-.105],
        [.198,-.104,-.142],[.096,-.203,-.152],[-.036,-.116,-.11]]),mobile,{back:true,depth:.051});
      sweep(k,spine,'discipleGold',mirror(s,[[.025,.085,-.079,.016],[.128,.092,-.147,.027],
        [.164,-.066,-.16,.018],[.091,-.147,-.170,.004]]),mobile);
      fittings.push({joint:spine,s});
    }
  }else{
    for(const s of sides){
      sweep(k,body,'discipleGold',mirror(s,[[.058,1.657,.083,.019],[.153,1.512,.189,.029],
        [.172,1.359,.239,.025],[.100,1.249,.267,.033],[.023,1.206,.265,.016]]),mobile);
      for(let i=0;i<6;i++){
        const t=i/5,x=.16*(1-t)+.022,y=1.467-.248*t,z=.249+t*.027;
        gem(k,body,i%2?'discipleGold':'discipleBone',x*s,y,z,.024);
      }
      const stay=k.bone(body,s*.128,1.355,-.183);
      panel(k,stay,'discipleDark',mirror(s,[[.018,.172,-.008],[.163,.18,-.037],[.225,.061,-.100],
        [.167,-.109,-.164],[.072,-.123,-.128],[-.012,-.006,-.063]]),mobile,{back:true,depth:.048});
      sweep(k,stay,'discipleGold',mirror(s,[[.041,.087,-.109,.009],[.115,.044,-.156,.015],
        [.146,-.057,-.167,.017],[.07,-.132,-.173,.006]]),mobile);
      fittings.push({joint:stay,s});
    }
  }
  const buckle=k.bone(body,0,.840,.211);
  volume(k,buckle,'discipleGold',[[0,-.064,.018,.079,.040],[0,-.022,.049,.154,.071],
    [0,.048,.04,.128,.059],[0,.083,.012,.074,.028]],mobile,21,2.62);
  gem(k,buckle,monkey?'discipleInset':'discipleBone',0,.009,.112,.043);
  for(const s of sides)sweep(k,body,monkey?'discipleGold':'discipleSilk',mirror(s,[[0,.844,.225,.026],
    [waist*.74,.862,.205,.033],[waist*1.11,.819,.135,.031],[waist*1.07,.825,-.143,.027],
    [waist*.48,.805,-.194,.018]]),mobile);
  return fittings;
}

function limbs(k,body,monkey,mobile){
  const stance=monkey?.239:.276;
  const arms=[],legs=[];
  for(const s of sides){
    const shoulder=k.bone(body,s*stance,1.494,.026),elbow=k.bone(shoulder,s*.081,-(monkey?.264:.32),.049);
    const hand=k.bone(elbow,s*.022,-.28,.066),guard=k.bone(shoulder,s*.053,.021,-.025);
    const r=monkey?.108:.130;
    volume(k,shoulder,'discipleSkin',mirror(s,[[.001,.067,-.019,r*.85,r*.84],[.059,-.056,-.020,r*1.13,r*1.12],
      [.079,-.18,.013,r*.91,r*.88],[.072,-(monkey?.265:.325),.045,r*.68,r*.70]]),mobile,38);
    volume(k,elbow,'discipleSkin',mirror(s,[[.01,.057,.009,r*.70,r*.67],[.036,-.072,.050,r*.91,r*.83],
      [.036,-.18,.097,r*.78,r*.74],[.024,-.28,.099,r*.50,r*.49]]),mobile,21);
    const cap=monkey?[[.019,.059,.093],[.11,.122,.065],[.217,.103,-.036],[.241,-.022,-.151],
      [.168,-.143,-.115],[.027,-.136,.047],[-.037,-.067,.126]]:
      [[.012,.048,.13],[.128,.104,.121],[.220,.056,.039],[.230,-.045,-.106],
        [.153,-.133,-.147],[.049,-.124,-.012],[-.026,-.054,.141]];
    panel(k,guard,monkey?'discipleBlue':'discipleLinen',mirror(s,cap),mobile,{depth:monkey?.060:.047});
    for(let i=0;i<3;i++){
      const y=-.075-i*.073,z=.100+i*.015;
      panel(k,elbow,i===1?'discipleDark':monkey?'discipleGold':'discipleLinen',mirror(s,[[.012,y+.057,z],
        [.10,y+.068,z-.034],[.137,y-.014,z-.128],[.074,y-.071,z-.123],[.008,y-.069,z+.021],
        [-.041,y-.024,z+.022]]),mobile,{depth:.031,rim:monkey?'discipleBlue':'discipleGold'});
    }
    volume(k,hand,'discipleSkin',mirror(s,[[.002,.061,.012,.053,.049],[.023,.014,.051,.079,.062],
      [.029,-.047,.096,.074,.052],[.033,-.089,.099,.052,.036]]),mobile,26);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.032;
      sweep(k,hand,'discipleUnder',[[x,.023,.073,.014],[x+s*.016,-.005,.111,.018],[x+s*.029,-.061,.133,.016],
        [x+s*.037,-.085,.1,.003]],mobile);
    }
    arms.push({shoulder,elbow,hand,guard,s});
    const hip=k.bone(body,s*(monkey?.13:.152),.70,-.03),knee=k.bone(hip,s*.046,-.304,.01),foot=k.bone(knee,s*.008,-.305,.041);
    volume(k,hip,'discipleLinen',mirror(s,[[.012,.10,-.037,.119,.108],[.050,-.035,-.024,.139,.128],
      [.061,-.188,.007,.104,.103],[.048,-.296,.033,.087,.083]]),mobile,72);
    volume(k,knee,'discipleSilk',mirror(s,[[.001,.06,.010,.077,.073],[.032,-.07,-.017,.099,.097],
      [.019,-.166,-.008,.081,.075],[.018,-.298,.025,.054,.056]]),mobile,37);
    volume(k,foot,monkey?'discipleDark':'discipleSkin',mirror(s,[[.011,-.052,.181,.083,.047],[.02,-.01,.101,.097,.073],
      [.024,.048,.024,.075,.066],[.023,.079,-.015,.057,.055]]),mobile,92,2.66);
    for(let i=0;i<3;i++)sweep(k,knee,i===1?'discipleGold':monkey?'discipleInset':'discipleDark',mirror(s,[[.008,-.068-i*.066,.118,.012],
      [.092,-.068-i*.066,.061,.017],[.104,-.092-i*.067,-.039,.019],[.036,-.108-i*.062,-.106,.004]]),mobile);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.037;
      sweep(k,foot,monkey?'discipleGold':'discipleBone',[[x,-.027,.14,.016],[x+s*.01,-.04,.207,.019],
        [x+s*.018,-.067,.238,.003]],mobile);
    }
    legs.push({hip,knee,foot,s});
  }
  return {arms,legs};
}

function amberMace(k,j,mobile){
  markEnemyWeapon(j,[0,1.124,.041],{from:[0,-.09,.044],width:.15,aim:false});
  sweep(k,j,'discipleWood',[[0,-1.12,.042,.037],[0,-.68,.047,.040],[0,-.071,.05,.045],[0,.438,.047,.038],
    [.006,.647,.047,.032],[.02,.895,.051,.034]],mobile);
  const bulb=k.bone(j,.019,.915,.05);
  volume(k,bulb,'discipleGold',[[0,-.20,.01,.053,.044],[0,-.124,.01,.094,.084],[-.01,-.036,0,.123,.11],
    [-.02,.06,-.015,.106,.087],[-.03,.165,-.009,.044,.040],[-.04,.193,-.007,.004,.006]],mobile,75,2.38);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,x=Math.sin(a),z=Math.cos(a);
    sweep(k,bulb,'discipleDark',[[x*.058,-.151,z*.053,.009],[x*.118,-.041,z*.104,.016],
      [x*.089,.081,z*.078,.014],[x*.039,.162,z*.044,.005]],mobile);
  }
  for(const y of [-1.10,-.843,-.235,.092,.528,.664])sweep(k,j,'discipleGold',[[0,y-.032,.041,.045],
    [0,y,.041,.053],[0,y+.034,.042,.044]],mobile);
  gem(k,j,'discipleInset',.018,.889,.164,.034);
}

function forgeTrident(k,j,mobile){
  markEnemyWeapon(j,[.001,1.397,.048],{from:[0,-.048,.04],width:.22});
  sweep(k,j,'discipleWood',[[0,-.812,.039,.033],[0,-.48,.042,.043],[0,-.035,.05,.047],[0,.53,.047,.036],
    [.004,.814,.049,.037],[0,.953,.047,.037]],mobile);
  for(const y of [-.76,-.432,.25,.478,.707,.825])sweep(k,j,'discipleGold',[[0,y-.024,.045,.041],
    [0,y,.045,.051],[0,y+.031,.046,.041]],mobile);
  panel(k,j,'discipleDark',[[0,.833,.05],[-.074,.974,.05],[-.057,1.161,.051],[.003,1.387,.045],
    [.061,1.171,.046],[.071,.996,.042],[.045,.902,.05]],mobile,{depth:.045,rim:'discipleGold'});
  for(const s of sides){
    sweep(k,j,'discipleDark',mirror(s,[[.017,.858,.042,.051],[.148,.903,.042,.047],[.239,1.018,.069,.041],
      [.222,1.173,.053,.031],[.184,1.288,.061,.004]]),mobile);
    sweep(k,j,'discipleInset',mirror(s,[[.08,.868,.076,.013],[.184,.947,.097,.019],
      [.223,1.083,.091,.021],[.188,1.269,.077,.004]]),mobile);
    gem(k,j,'discipleInset',s*.107,.909,.09,.029);
  }
  sweep(k,j,'discipleInset',[[0,.888,.093,.012],[.01,1.022,.092,.023],[.003,1.162,.08,.020],
    [.001,1.344,.066,.004]],mobile);
}

function garments(body,monkey){
  const cloth=[];
  for(const s of sides){
    const phase=s*.87;
    const add=(name,path,tint,trim,lining,flex,across)=>cloth.push({parent:body,name:name+' '+s,path:mirror(s,path),
      tint,trim,lining,phase,flex,across});
    add(monkey?'哈努曼 · 繡邊白袴':'濕婆 · 白布圍裳',monkey?
      [[.084,.807,.198,.077],[.115,.616,.26,.116],[.173,.386,.294,.144],[.195,.199,.27,.132]]:
      [[.116,.811,.209,.097],[.135,.611,.298,.162],[.191,.357,.338,.18],[.258,.175,.303,.147]],
    monkey?0x82988d:0xb0a69b,monkey?0x2c7e72:0x654454,0x4a4948,monkey?.72:.60,[.98,0,s*.18]);
    if(monkey){
      add('哈努曼 · 藍雲帛',[[.204,1.437,-.13,.083],[.353,1.13,-.261,.117],[.545,.823,-.485,.147],
        [.654,.541,-.694,.122],[.857,.324,-.823,.033]],0x2c686e,0x83b9a4,0x394656,1.33,[.84,.08,s*-.5]);
      add('哈努曼 · 孔雀紋前襟',[[.064,.827,.22,.04],[.082,.697,.286,.067],[.10,.519,.337,.075],
        [.08,.374,.333,.043]],0x1d776f,0xdbad54,0x31444b,.54,[.88,0,s*.42]);
    }else{
      add('濕婆 · 墨紅披掛',[[.258,1.439,-.16,.094],[.315,1.07,-.319,.16],[.393,.622,-.463,.218],
        [.437,.103+s*.103,-.572,.157]],0x63343a,0x9b695f,0x322a36,1.05,[.79,.07,s*-.60]);
      add('濕婆 · 紫穗腰帶',[[.161,.831,.23,.046],[.229,.705,.29,.067],[.269,.518,.325,.056],
        [.322,.302,.265,.022]],0x614156,0xc39766,0x3b263a,.79,[.76,0,s*-.59]);
    }
  }
  if(!monkey)cloth.push({parent:body,name:'濕婆 · 錯襟披綢',path:[[-.124,1.52,-.179,.074],[-.05,1.231,-.29,.137],
    [.109,.713,-.42,.182],[.21,.303,-.601,.104]],across:[.98,.07,.05],tint:0x55343c,trim:0xa07866,
    lining:0x392e38,phase:1.91,flex:1.20});
  return cloth;
}

export function carveTempleDisciple(k,entry,mobile){
  const {id}=entry;
  const monkey=id==='m118',body=k.bone(k.root,0,monkey?.117:.011,0);
  const head=k.bone(body,0,monkey?1.795:1.852,.051);
  const {jaw,locks}=monkey?{jaw:simianFace(k,head,mobile),locks:[]}:asceticFace(k,head,mobile);
  const fittings=templeBody(k,body,monkey,mobile),{arms,legs}=limbs(k,body,monkey,mobile);
  const held=arms[monkey?0:1],weapon=k.bone(held.hand,0,-.023,.062);
  weapon.name=monkey?'鎏金黑檀杖':'濕婆三叉矛';
  if(monkey)amberMace(k,weapon,mobile);
  else forgeTrident(k,weapon,mobile);
  const cloth=garments(body,monkey),dress=tools=>{
    for(const {parent,name,path,...options} of cloth)tools.silk(parent,name,path,{...options,style:'woven'});
    return true;
  };
  return {body,head,arms:arms.map(a=>a.shoulder),legs:monkey?[]:legs.map(l=>l.hip),crest:k.bone(body,0,0,0),
    pattern:monkey?'hover':'duel',grounded:!monkey,sourceSculpt:true,sourceDress:dress,templeDisciple:true,catalogueSculpt:id,
    polishEnergy:{tint:monkey?0x86d8cc:0xe9a473,shape:monkey?'ribbons':'bolts',anchor:body,
      offset:[0,.87,-.23],span:monkey?[.72,.64,.57]:[.69,.53,.44],weaponWidth:monkey?.56:.55,emissionScale:.51},
    cataloguePose({beat,headtime,wind,strike,travel,step,fall}){
      body.rotation.x=-wind*(monkey?.103:.25)+strike*(monkey?.19:.28)+fall*.27;
      head.rotation.y=Math.sin(headtime*2.11)*.057+(wind-strike)*.134;
      head.rotation.x=-wind*.11+strike*.151;
      jaw.rotation.x=.043+wind*.092+strike*(monkey?.34:.17);
      for(const {s,shoulder,elbow,hand,guard} of arms){
        const pace=Math.cos(step+s*Math.PI*.5)*travel;
        shoulder.rotation.set(pace*.28-wind*(monkey?.55:1.09)+strike*(s===held.s?.85:.52),
          s*(wind*.25-strike*.24),s*(.196+wind*.22-strike*.104));
        elbow.rotation.set(-.29-wind*.45+strike*.42+fall*.31,s*(wind*.14-strike*.18),0);
        hand.rotation.z=s*(wind*.21-strike*.27);
        guard.rotation.x=pace*.091+wind*.142-strike*.193;
      }
      for(const {s,hip,knee,foot} of legs){
        const pace=Math.sin(step+s*Math.PI*.5)*travel;
        hip.rotation.x=monkey?-.17+wind*.21+pace*.18:pace*.59+wind*.12-strike*.083;
        knee.rotation.x=-Math.max(0,pace)*.48-wind*.14+fall*.21;
        foot.rotation.x=-Math.min(0,pace)*.32+strike*.11;
      }
      for(const {joint,s} of fittings){
        joint.rotation.x=Math.sin(beat*.61+s*.25)*.041+wind*.15-strike*.14;
        joint.rotation.y=s*(wind*.13-strike*.12);
      }
      for(const {lock,s} of locks)lock.rotation.set(travel*.14+wind*.16-strike*.24,s*(wind*.15-strike*.11),
        s*(Math.sin(beat*.63)*.041+wind*.049));
      weapon.rotation.x=monkey?.30+wind*.54-strike*.71:wind*.24-strike*.27;
      weapon.rotation.z=monkey?-.14-wind*.20+strike*.26:.16+wind*.22-strike*.42;
    },
  };
}
