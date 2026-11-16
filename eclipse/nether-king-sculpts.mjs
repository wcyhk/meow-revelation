import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const sidePath=(side,path)=>path.map(([x,...tail])=>[x*side,...tail]);
const cord=(k,j,m,path,steps=11)=>k.sculpt.sweep(j,m,path,{sides:7,steps,ridge:.24});
const armor=(k,j,m,path,depth=.046)=>k.sculpt.plate(j,m,path,depth,depth*.33);
const volume=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,
  {sides:mobile?9:14,rings:mobile?12:18,section:2.32,ridge:.19,seed,fur:m==='kingHair'||m==='kingHairTrim'}));
const gem=(k,j,m,xyz,size)=>k.mesh(j,'gem',m,...xyz,...size);
const hoop=(k,j,finish,radius,tube,arc=2*Math.PI)=>{
  const geometry=new T.TorusGeometry(radius,tube,7,28,arc);
  k.geometry(j,finish,geometry);
};

const kings={
  'nether-box':{kind:'box',body:[.48,.86,.82,.72],face:[.166,.087,.16,.184],hair:[0x8d9ba8,0xf1e1ce,1.39],
    steel:0x394f6c,bright:0xb2946b,shadow:0x222a43,cloth:0x315b78,skin:0xc89a82,light:0x91e5ff,
    layers:4,coat:1.17,energy:'mist',crown:[.123,.272,.105,.201]},
  'nether-bow':{kind:'bow',body:[.41,1.06,.88,.78],face:[.155,.085,.158,.188],hair:[0x443232,0x826145,1.09],
    steel:0x516861,bright:0xdabc83,shadow:0x292c33,cloth:0x243a46,skin:0xb78970,light:0xa1fbf4,
    layers:3,coat:.99,energy:'bolts',crown:[.123,.392,.176,.257]},
  'nether-sword':{kind:'sword',body:[.32,1.05,.86,.75],face:[.147,.077,.143,.174],hair:[0x28252e,0x53404a,1.61],
    steel:0x753840,bright:0xd29158,shadow:0x251822,cloth:0x552130,skin:0xdba98f,light:0xff6857,
    layers:3,coat:1.34,energy:'embers',crown:[.109,.226,.102,.184]},
  'nether-halberd':{kind:'halberd',body:[.36,1.09,.83,.78],face:[.150,.074,.154,.179],hair:[0x9e8d67,0xe8cb94,1.21],
    steel:0x4f5a44,bright:0xb2a35f,shadow:0x242c29,cloth:0x465a39,skin:0xd2a788,light:0xc3ee8f,
    layers:4,coat:1.12,energy:'ribbons',crown:[.134,.331,.154,.238]},
};

function finishes(k,design){
  const [hair,trim]=design.hair;
  for(const [name,color,metalness,roughness,kind] of [
    ['kingSteel',design.steel,.58,.44,'iron'],['kingTrim',design.bright,.64,.42,'bronze'],
    ['kingShadow',design.shadow,.34,.66,'iron'],['kingCloth',design.cloth,.07,.79,'cloth'],
    ['kingFace',design.skin,.025,.72,'hide'],['kingHair',hair,.035,.79,'hide'],
    ['kingHairTrim',trim,.045,.70,'hide'],['kingLip',0x67433c,.035,.69,'hide'],
  ]){
    const material=new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:metalness>.35?.62:.21});
    k.materials[name]=paintedFinish(material,kind,true,true);
  }
  k.materials.kingSpark=new T.MeshBasicMaterial({color:design.light});
}

function portrait(k,head,design,mobile){
  const [w,chin,cheek,top]=design.face;
  const jaw=k.bone(head,0,-.126,.103);
  volume(k,head,'kingFace',[[0,-.158,.044,chin,.080],[0,-.078,.022,w*.83,.113],
    [0,.03,-.003,w,.132],[0,.122,-.008,w*.95,.133],[0,top,-.030,w*.81,.119]],mobile,3);
  volume(k,jaw,'kingFace',[[0,-.074,.011,chin*.64,.047],[0,-.052,.034,chin*.91,.051],
    [0,-.014,.027,chin*1.10,.052],[0,.028,-.038,w*.71,.077]],mobile,8);
  volume(k,head,'kingHair',[[0,-.074,-.074,w*.96,.094],[0,.044,-.063,w*1.09,.139],
    [0,.133,-.040,w*1.13,.165],[0,.207,-.065,w*.83,.145],[0,.254,-.083,w*.40,.093]],mobile,11);
  cord(k,head,'kingFace',[[0,.08,.128,.017],[.003,.027,.151,.021],[0,-.031,.185,.021],
    [0,-.051,.177,.007]]);
  cord(k,jaw,'kingLip',[[-.043,.015,.063,.004],[-.017,.013,.073,.006],[0,.015,.076,.007],
    [.019,.014,.072,.006],[.043,.017,.059,.004]]);
  for(const side of sides){
    const p=path=>sidePath(side,path);
    cord(k,head,'kingLip',p([[.033,.038,.130,.006],[.061,.043,.146,.011],
      [.102,.047,.123,.010],[.121,.052,.110,.003]]));
    k.mesh(head,'gem','kingSpark',side*.068,.041,.148,.018,.006,.008,0,side*.23,-side*.14);
    k.mesh(head,'gem','deep',side*.065,.041,.155,.004,.008,.003);
    cord(k,head,'kingHair',p([[.027,.065,.132,.005],[.054,.079,.145,.009],
      [.092,.079,.137,.009],[.122,.070,.105,.003]]));
    volume(k,head,'kingFace',p([[.046,-.025,.130,.015,.018],[.092,-.019,.119,.036,.026],
      [cheek*.83,.011,.073,.031,.025],[w*.95,.047,.040,.006,.006]]),mobile,side);
    volume(k,head,'kingFace',p([[w*.84,-.028,-.063,.029,.023],[w*1.06,.003,-.039,.025,.020],
      [w*1.11,.041,-.048,.009,.009]]),mobile,21);
    const [x,h,skew,pitch]=design.crown;
    const crown=p([[.008,.116,.157],[.056,.178,.163],[x,.208,.117],[x+skew*.53,h,.044],
      [x+skew*.80,h*.87,-pitch*.42],[x+.047,.135,-.105],[x*.48,.134,.045]]);
    armor(k,head,'kingSteel',crown,.030);
    cord(k,head,'kingTrim',crown.slice(1,6).map(([x,y,z])=>[x,y+.016,z+.015,.010]),12);
    for(let row=0;row<4;row++){
      const x=w*(.76+row*.09),y=.212-row*.046,z=.068-row*.053,spread=design.hair[2];
      volume(k,head,row%2?'kingHairTrim':'kingHair',p([[x*.70,y,z,.040,.037],[x,y-.075,z-.042,.066,.042],
        [x*1.13,y-.186,z-.065,.058,.045],[x*1.24,y-.328*spread,z-.121,.034,.034],
        [x*1.29,y-.449*spread,z-.173,.004,.005]]),mobile,row+93);
    }
  }
  gem(k,head,'kingSpark',[0,.160,.171],[.031,.048,.019]);
  return jaw;
}

function lamellar(k,body,back,grips,design,mobile,flaps){
  const [wide]=design.body;
  const flare=design.kind==='box'?.32:design.kind==='bow'?.22:design.kind==='sword'?.43:.34;
  for(const [index,side] of sides.entries()){
    const p=path=>sidePath(side,path),shoulder=grips[index].parent.parent,elbow=grips[index].parent;
    for(let i=0;i<design.layers;i++){
      const t=i/design.layers,y=.47-i*.126,w=wide*(1.02-t*.21),z=wide*.65;
      const scales=p([[.018,y+.092,z+.047],[w*.51,y+.149,z+.011],[w*.94,y+.093,z-.078],
        [w*1.12,y-.050,z-.221],[w*.91,y-.143,z-.177],[w*.46,y-.114,z+.031],[.077,y-.084,z+.099]]);
      armor(k,body,i%2?'kingShadow':'kingSteel',scales,.052);
      cord(k,body,'kingTrim',scales.slice(1,6).map(([x,y,z])=>[x,y+.013,z+.014,.014]));
      const backplate=scales.map(([x,y,z])=>[x*.97,y-.025,-z*.90+.038]);
      armor(k,body,i%2?'kingSteel':'kingShadow',backplate,.055);
      cord(k,body,'kingTrim',backplate.slice(0,6).map(([x,y,z])=>[x,y+.015,z-.011,.011]));
      if(i===0||i===2)gem(k,body,'kingSpark',[w*.66*side,y+.031,z-.04],[.041,.023,.020]);
    }
    for(let i=0;i<3;i++){
      const y=.14-i*.101,w=flare*(1-i*.15),z=.083-i*.029;
      const paldrons=p([[-.07,y+.028,z+.082],[w*.42,y+.117,z+.094],[w*.88,y+.187-i*.048,z-.057],
        [w*1.07,y+.018,z-.195],[w*.84,y-.116,z-.189],[w*.34,y-.086,z-.109],[.034,y-.059,z+.12]]);
      armor(k,shoulder,i%2?'kingShadow':'kingSteel',paldrons,.054);
      cord(k,shoulder,'kingTrim',paldrons.slice(1,6).map(([x,y,z])=>[x,y+.019,z-.016,.015]),13);
      const bracer=p([[.003,y-.154,.115],[.095,y-.142,.121],[.147,y-.176,.071],
        [.133,y-.243,-.051],[.061,y-.264,-.069],[.026,y-.238,.063]]);
      armor(k,elbow,i%2?'kingShadow':'kingSteel',bracer,.037);
      cord(k,elbow,'kingTrim',bracer.slice(0,5).map(([x,y,z])=>[x,y+.007,z+.017,.009]));
    }
    const spine=k.bone(back,side*wide*.43,.286,-.116);
    const type=design.kind;
    if(type==='box'){
      const ring=k.bone(spine,side*.214,.248,-.152);
      ring.rotation.z=side*.74;
      hoop(k,ring,'kingSteel',.37,.039,Math.PI*1.24);
      hoop(k,ring,'kingTrim',.37,.021,Math.PI*1.1);
      for(let i=0;i<4;i++){
        const a=(i-1.2)*.64;
        gem(k,ring,'kingSpark',[Math.cos(a)*.369,Math.sin(a)*.369,-.024],[.031,.038,.028]);
      }
    }else{
      const sweep=type==='sword'?.66:type==='halberd'?.79:.58;
      const skirt=type==='sword'?.68:type==='halberd'?.49:.85;
      const panels=type==='bow'?2:type==='halberd'?3:mobile?4:5;
      for(let i=0;i<panels;i++){
        const t=i/4,w=sweep*(.73+t*.34),h=skirt*(.67+t*.44);
        const depth=type==='bow'?.62:1;
        const crest=p([[.031,.44-i*.17,.022],[w*.49,.33-i*.16,-.128],[w,.47-i*.211,-.273*depth],
          [w*1.23,h-i*.24,-.445*depth],[w*.83,.012-i*.163,-.50*depth],[.126,-.062-i*.141,-.201]]);
        armor(k,spine,i%2?'kingShadow':'kingSteel',crest,.044);
        cord(k,spine,i%3===0?'kingSpark':'kingTrim',crest.slice(1,5).map(([x,y,z])=>[x,y,z-.029,.012]));
        if(type==='halberd')k.geometry(spine,'kingCloth',featherVane(...p([[.031,.36-i*.168,.033],
          [w*.63,.221-i*.192,-.198],[w*1.12,.14-i*.233,-.47]]),.12,i+80,mobile?9:13));
      }
    }
    flaps.push({joint:spine,axis:'z',amp:.102,bias:side*.12,seed:side*.99});
  }
}

function armoredBoots(k,model,design,mobile){
  const [,ground]=design.body;
  for(const [index,hip] of model.legs.entries()){
    const side=sides[index],p=path=>sidePath(side,path);
    const joint=model.campaign.flaps.find(flap=>flap.joint.parent===hip).joint;
    const broad=design.kind==='box'?1.14:design.kind==='sword'?.91:1;
    volume(k,joint,'kingShadow',p([[.020,-ground*.359,.046,.090*broad,.082],
      [.027,-ground*.429,.131,.136*broad,.084],[.020,-ground*.468,.251,.168*broad,.063],
      [.011,-ground*.494,.362,.117*broad,.046]]),mobile,106+index);
    const toe=p([[-.123*broad,-ground*.437,.217],[.016,-ground*.414,.239],[.136*broad,-ground*.438,.235],
      [.124*broad,-ground*.502,.370],[.027,-ground*.520,.404],[-.111*broad,-ground*.501,.354]]);
    armor(k,joint,'kingSteel',toe,.042);
    cord(k,joint,'kingTrim',toe.slice(1,6).map(([x,y,z])=>[x,y+.017,z,.011]));
    for(let i=0;i<3;i++){
      const y=.04-i*.109;
      const scute=p([[-.073,y+.036,.095],[.041,y+.063,.091],[.119*broad,y+.017,.045],
        [.099*broad,y-.086,.111],[.029,y-.114,.168],[-.085*broad,y-.074,.152]]);
      armor(k,joint,i%2?'kingShadow':'kingSteel',scute,.043);
      cord(k,joint,'kingTrim',scute.slice(1,5).map(([x,y,z])=>[x,y+.017,z+.029,.012]));
    }
    gem(k,joint,'kingSpark',[side*.022,-.042,.155],[.027,.042,.020]);
  }
}

function crestwork(k,body,back,design,mobile,flaps){
  if(design.kind==='box'){
    const seal=k.bone(body,0,-.018,.338);
    hoop(k,seal,'kingTrim',.107,.019);
    gem(k,seal,'kingSpark',[0,0,.019],[.055,.074,.038]);
    for(const side of sides)cord(k,seal,'kingSteel',sidePath(side,[[.023,.051,.029,.012],
      [.138,.046,.015,.036],[.227,-.032,-.022,.038],[.279,-.101,-.125,.007]]));
  }else if(design.kind==='bow'){
    const quiver=k.bone(back,-.267,.071,-.422);
    quiver.rotation.z=-.53;
    volume(k,quiver,'kingShadow',[[0,-.433,0,.052,.044],[0,-.273,.009,.106,.072],
      [0,.115,.024,.113,.080],[0,.423,.027,.137,.095]],mobile,209);
    for(let i=0;i<4;i++){
      const y=-.341+i*.216,w=.063+i*.025;
      const belt=[[0,y-.015,-.09],[-w*.83,y-.013,-.06],[-w,y,.013],[-w*.57,y+.007,.087],
        [w*.57,y+.01,.09],[w,y,.011],[w*.83,y-.009,-.061],[0,y-.011,-.091]];
      cord(k,quiver,'kingTrim',belt.map(point=>[...point,.012]),14);
    }
    for(let i=0;i<(mobile?3:5);i++){
      const x=(i-(mobile?1:2))*.048,z=.017+i*.011,y=.61+(i%2)*.10;
      cord(k,quiver,'kingSteel',[[x,.305,z,.011],[x,y,z-.043,.008],[x,y+.104,z-.060,.003]],9);
      k.geometry(quiver,i%2?'kingSpark':'kingTrim',featherVane([x,y-.14,z-.04],
        [x+.055,y-.061,z-.05],[x+.019,y+.087,z-.065],.029,85+i,9));
    }
    flaps.push({joint:quiver,axis:'x',amp:.12,bias:.14,seed:2.11});
  }else if(design.kind==='sword'){
    const banner=k.bone(back,0,.168,-.267);
    for(const side of sides){
      const p=path=>sidePath(side,path);
      const flame=p([[.05,-.236,-.026],[.101,.095,-.077],[.281,.431,-.119],
        [.292,.617,-.156],[.338,.825,-.234],[.453,.551,-.281],[.501,.271,-.247],
        [.386,.155,-.201],[.22,-.059,-.067]]);
      armor(k,banner,'kingSteel',flame,.049);
      cord(k,banner,'kingTrim',flame.slice(1,8).map(([x,y,z])=>[x,y,z-.028,.021]),16);
      cord(k,banner,'kingSpark',p([[.076,-.128,-.062,.009],[.222,.169,-.153,.017],
        [.333,.348,-.236,.014],[.383,.576,-.269,.008],[.350,.785,-.257,.002]]),15);
    }
    flaps.push({joint:banner,axis:'x',amp:.08,bias:-.11,seed:4.12});
  }else{
    const wheel=k.bone(back,0,.431,-.565);
    hoop(k,wheel,'kingShadow',.448,.044);
    hoop(k,wheel,'kingTrim',.492,.028);
    hoop(k,wheel,'kingSteel',.368,.026);
    for(let i=0;i<(mobile?6:8);i++){
      const spoke=k.bone(wheel,0,0,0);
      spoke.rotation.z=i/(mobile?6:8)*Math.PI*2;
      cord(k,spoke,'kingTrim',[[0,.118,-.017,.015],[.055,.268,-.027,.019],
        [.056,.419,-.020,.018],[.028,.522,-.043,.008]]);
      gem(k,spoke,'kingSpark',[.028,.494,-.045],[.021,.048,.022]);
    }
    flaps.push({joint:wheel,axis:'z',amp:.63,bias:.17,seed:2.7});
  }
}

function prisonBox(k,grip,flaps,mobile){
  const unit=k.bone(grip,0,-.04,.167);
  unit.rotation.z=.41;
  const core=k.bone(unit,0,.059,.015);
  k.mesh(core,'gem','kingSpark',0,0,0,.158,.149,.169,Math.PI*.24,.14,Math.PI*.23);
  for(const axis of ['y','z']){
    const ring=k.bone(core,0,0,0);
    if(axis==='y')ring.rotation.x=Math.PI/2;
    hoop(k,ring,'kingSteel',.232,.035);
    hoop(k,ring,'kingTrim',.238,.019);
    flaps.push({joint:ring,axis,amp:.59,bias:.08,seed:axis==='y'?2:6});
  }
  for(const side of sides){
    const door=k.bone(unit,side*.102,0,.092);
    const p=path=>sidePath(side,path);
    const outline=p([[-.091,.212,.067],[.134,.281,.015],[.236,.150,-.074],[.216,-.155,-.076],
      [.099,-.248,.013],[-.102,-.168,.075]]);
    armor(k,door,'kingSteel',outline,.061);
    cord(k,door,'kingTrim',[...outline,outline[0]].map(([x,y,z])=>[x,y,z+.027,.024]),17);
    cord(k,door,'kingSpark',p([[-.033,-.131,.107,.008],[.045,-.078,.124,.014],
      [.092,.092,.093,.011],[.042,.183,.083,.003]]));
    if(!mobile)gem(k,door,'kingTrim',[side*.107,-.028,.109],[.043,.048,.027]);
    flaps.push({joint:door,axis:'y',amp:.31,bias:side*.41,seed:side*4.9});
  }
}

function thunderBow(k,grip,flaps,mobile){
  const bow=k.bone(grip,0,-.015,.122);
  const mount=markEnemyWeapon(bow,[0,.034,.774],{from:[0,.034,-.23],width:.175,kind:'bow'});
  const curve=side=>[[0,.056*side,.039,.054],[.018,.291*side,-.148,.072],
    [.028,.531*side,-.106,.062],[.044,.717*side,.121,.045],[.007,.911*side,.308,.018],[-.009,.965*side,.270,.005]];
  for(const side of sides){
    const limb=k.bone(mount,0,0,0);
    const tip=curve(side);
    volume(k,limb,'kingSteel',tip.map(([x,y,z,r])=>[x,y,z,r,r*.63]),mobile,side+35);
    for(const sign of [-1,1])cord(k,limb,'kingTrim',tip.map(([x,y,z,r])=>[x+sign*r*.68,y+.009,z+.015,
      Math.max(.003,r*.26)]),18);
    cord(k,limb,'kingSpark',[[0,0,.403,.006],[.003,side*.43,.333,.004],[tip.at(-1)[0],tip.at(-1)[1],tip.at(-1)[2],.005]]);
    flaps.push({joint:limb,axis:'x',amp:side*.082,bias:side*.037,seed:side*2.8});
  }
  cord(k,mount,'kingSpark',[[0,0,.191,.012],[0,0,.439,.014],[0,0,.574,.010],[0,0,.771,.003]],12);
  gem(k,mount,'kingSpark',[0,0,.067],[.084,.093,.037]);
}

function burningSword(k,grip){
  const sword=k.bone(grip,.009,-.041,.109);
  markEnemyWeapon(sword,[.46,1.32,.256],{from:[0,-.166,.07],width:.191});
  const blade=[[-.042,.035,.068],[-.124,.433,.078],[-.079,.768,.107],
    [.080,1.044,.164],[.464,1.337,.250],[.281,1.063,.206],[.226,.724,.139],
    [.097,.396,.098],[.092,.037,.047]];
  armor(k,sword,'kingSteel',blade,.093);
  cord(k,sword,'kingTrim',[...blade,blade[0]].map(([x,y,z])=>[x,y,z+.053,.021]),26);
  cord(k,sword,'kingSpark',[[.012,.092,.115,.011],[-.020,.382,.143,.019],[.035,.635,.166,.022],
    [.106,.889,.194,.019],[.251,1.084,.245,.013],[.459,1.333,.295,.003]],20);
  for(const side of sides)cord(k,sword,'kingTrim',sidePath(side,[[.01,.089,.079,.057],[.153,.071,.100,.056],
    [.253,.183,.189,.037],[.276,.341,.267,.004]]),13);
  cord(k,sword,'kingShadow',[[0,-.286,.043,.053],[0,-.129,.055,.053],[0,.059,.087,.041]],13);
}

function galeHalberd(k,grip){
  const spear=k.bone(grip,0,-.076,.101);
  markEnemyWeapon(spear,[.009,1.54,.233],{from:[0,-.521,.032],width:.24});
  cord(k,spear,'kingShadow',[[0,-.681,.010,.043],[0,-.354,.019,.050],[0,.231,.083,.053],
    [0,.769,.151,.049],[.011,1.318,.215,.021]],18);
  const tip=[[0,.731,.118],[.164,.898,.174],[.108,1.139,.207],[.005,1.536,.234],
    [-.108,1.158,.203],[-.160,.926,.179]];
  armor(k,spear,'kingSteel',tip,.054);
  cord(k,spear,'kingTrim',[...tip,tip[0]].map(([x,y,z])=>[x,y,z+.03,.017]),16);
  for(const side of sides){
    const crescent=sidePath(side,[[.073,.851,.130],[.265,.967,.218],[.408,1.166,.231],[.429,.899,.204],
      [.314,.749,.189],[.163,.686,.155],[.047,.709,.139]]);
    armor(k,spear,'kingSteel',crescent,.048);
    cord(k,spear,'kingTrim',crescent.slice(1,6).map(([x,y,z])=>[x,y,z+.029,.020]),15);
    cord(k,spear,'kingSpark',sidePath(side,[[.031,.747,.189,.015],[.190,.842,.236,.018],
      [.321,1.004,.285,.013],[.402,1.162,.248,.003]]),12);
  }
}

export function sculptNetherKing(k,weapon,mobile,fighter){
  const design=kings[weapon.id];
  if(!design)return null;
  finishes(k,design);
  const [broad,ground,neck,armLength]=design.body;
  const model=fighter(k,{broad,ground,neck,armLength,style:'ritual',finish:'kingCloth',mobile,
    portrait(k,head){return portrait(k,head,design,mobile);},
    weapon(k,body,back,head,grips,flaps){
      lamellar(k,body,back,grips,design,mobile,flaps);
      crestwork(k,body,back,design,mobile,flaps);
      if(design.kind==='box')prisonBox(k,grips[0],flaps,mobile);
      else if(design.kind==='bow')thunderBow(k,grips[1],flaps,mobile);
      else if(design.kind==='sword')burningSword(k,grips[1]);
      else galeHalberd(k,grips[1]);
    },
  });
  armoredBoots(k,model,design,mobile);
  model.netherKing=design.kind;
  model.polishEnergy={tint:design.light,shape:design.energy,anchor:model.body,
    offset:[0,.45,-.20],span:[broad+.57,neck*.83,.72]};
  model.relicDress=tools=>{
    for(const side of sides){
      const [hair,highlight,length]=design.hair;
      for(let row=0;row<2;row++){
        const x=.074+row*.103,w=.094-row*.013;
        tools.silk(model.head,weapon.guardian.name+' · 長髮 '+side+' '+row,sidePath(side,[
          [x,.143,-.120,w*.51],[x+.069,-.072,-.168,w],
          [x+.105,-length*.34,-.242,w*.86],[x+.143,-length*.58,-.304,w*.66],
          [x+.181,-length*.70,-.433,.009],
        ]),{tint:hair,trim:highlight,lining:design.shadow,style:'mane',
          phase:side*.79+row*.62,flex:1.09+row*.24});
      }
      for(let row=0;row<2;row++){
        const wide=.104-row*.011,depth=row?.222:-.217;
        tools.silk(model.body,weapon.guardian.name+' · 戰襟 '+side+' '+row,sidePath(side,[
          [.089+row*.073,.121,depth,wide*.62],[.176+row*.082,-.082,depth-.039,wide],
          [.232+row*.085,-design.coat*.34,depth-.091,wide*.93],
          [.282+row*.081,-design.coat*.64,depth-.219,wide*.78],
          [.342+row*.051,-design.coat*.85,depth-.382,.013],
        ]),{tint:design.cloth,trim:design.bright,lining:design.shadow,style:'woven',
          phase:row*.88+side*.62,flex:1.11+row*.31});
      }
    }
    return true;
  };
  return model;
}
