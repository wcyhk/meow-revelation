import {sculptPao} from './pao-sculpt.mjs?v=chiaroscuro-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...rest])=>[x*side,...rest]);
const seam=(k,parent,finish,path,steps=10)=>k.sculpt.sweep(parent,finish,path,{sides:6,steps,ridge:.16});
const plate=(k,parent,finish,path,thickness=.025)=>k.sculpt.plate(parent,finish,path,thickness,thickness*.37);
const gem=(k,parent,finish,x,y,z,r=.028)=>k.mesh(parent,'gem',finish,x,y,z,r,r*.89,r*.69);

// Dimensions follow the original chest, waist and helm. Each cut has a
// different line of motion, weight and hem, drawn in the rider's own space.
const outfits={
  m059:{cut:'stole',crown:'elder',chest:.37,hem:.87,ink:0x7c3229,trim:0xd9af6a,emblem:'lozenge'},
  m060:{cut:'blindfold',crown:'veil',chest:.34,hem:.95,ink:0x28475b,trim:0x88d7d9,emblem:'ripple'},
  m061:{cut:'prayer',crown:'sage',chest:.31,hem:.79,ink:0x525543,trim:0xb7c487,emblem:'seal'},
  m062:{cut:'kerchief',crown:'pin',chest:.26,hem:.48,ink:0x6b4433,trim:0xb99561,emblem:'chevron'},
  m063:{cut:'standards',crown:'fang',chest:.40,hem:1.05,ink:0x8a342a,trim:0xdc924a,emblem:'ember'},
  m064:{cut:'splitcoat',crown:'ice',chest:.38,hem:1.12,ink:0x2c477c,trim:0xacc9e0,emblem:'snowflake'},
  m065:{cut:'stole',crown:'branches',chest:.34,hem:1.15,ink:0x435f2c,trim:0x9cbd57,emblem:'leaf'},
  m066:{cut:'standards',crown:'thunder',chest:.35,hem:1.07,ink:0x6e5833,trim:0xe4bc72,emblem:'bolt'},
  m067:{cut:'court',crown:'court',chest:.40,hem:1.20,ink:0x872c28,trim:0xe5b665,emblem:'seal',large:true},
  m068:{cut:'royal',crown:'royal',chest:.49,hem:1.30,ink:0x443957,trim:0xe9bc57,emblem:'sun',large:true},
  m069:{cut:'prayer',crown:'sage',chest:.34,hem:.90,ink:0x33543c,trim:0xc7ad7a,emblem:'leaf'},
  m070:{cut:'warwrap',crown:'pin',chest:.49,hem:.74,ink:0x8e3d2e,trim:0xd8a367,emblem:'embers'},
  m071:{cut:'stole',crown:'veil',chest:.26,hem:.86,ink:0x3e578a,trim:0xb5d9db,emblem:'ripple'},
  m072:{cut:'court',crown:'thunder',chest:.28,hem:1.09,ink:0x94604a,trim:0xe6c886,emblem:'bolt'},
  m073:{cut:'prayer',crown:'elder',chest:.36,hem:.88,ink:0x863c32,trim:0xdcb46f,emblem:'sun'},
  m074:{cut:'saddle',crown:'pin',chest:.29,hem:.63,ink:0x943b32,trim:0xe0a05d,emblem:'fang'},
  m075:{cut:'shroud',crown:'fang',chest:.42,hem:1.29,ink:0x672d37,trim:0xac9fae,emblem:'scars'},
  m076:{cut:'royal',crown:'thunder',chest:.45,hem:1.20,ink:0x52422c,trim:0xd7b45f,emblem:'bolt'},
  m077:{cut:'stole',crown:'pin',chest:.27,hem:1.13,ink:0x658897,trim:0xe0e3c7,emblem:'ripple'},
  m078:{cut:'warwrap',crown:'branches',chest:.54,hem:.72,ink:0x556744,trim:0xadba62,emblem:'leaf'},
  m079:{cut:'shroud',crown:'branches',chest:.32,hem:1.25,ink:0x215b60,trim:0x78c9b5,emblem:'leaf'},
  m080:{cut:'court',crown:'relic',chest:.42,hem:1.19,ink:0x304970,trim:0x8faacf,emblem:'ripple'},
  m081:{cut:'splitcoat',crown:'fang',chest:.38,hem:.94,ink:0x943725,trim:0xe9ab63,emblem:'ember',large:true},
  m082:{cut:'shroud',crown:'veil',chest:.46,hem:.92,ink:0x334f73,trim:0x86c4d6,emblem:'snowflake'},
  m083:{cut:'ribbon',crown:'ice',chest:.34,hem:.56,ink:0x2c5037,trim:0x92bc87,emblem:'chevron'},
  m084:{cut:'splitcoat',crown:'fang',chest:.35,hem:.69,ink:0x64512d,trim:0xcfaa61,emblem:'arrow'},
  m085:{cut:'cinder',crown:'nabata',chest:.43,hem:.91,ink:0x993e27,trim:0xec9d4d,emblem:'ember'},
  m086:{cut:'cascade',crown:'nabata',chest:.36,hem:1.02,ink:0x385f8c,trim:0x9ed3ed,emblem:'ripple'},
  m087:{cut:'zigzag',crown:'nabata',chest:.43,hem:.85,ink:0x7f642d,trim:0xe7cb59,emblem:'bolt'},
  m088:{cut:'ribbon',crown:'nabata',chest:.37,hem:1.03,ink:0x416039,trim:0xafdc74,emblem:'leaf'},
  m089:{cut:'saddle',crown:'fang',chest:.40,hem:.62,ink:0x84352b,trim:0xe3a266,emblem:'ember'},
  m090:{cut:'saddle',crown:'ice',chest:.40,hem:.65,ink:0x35548e,trim:0xa7c6e9,emblem:'ripple'},
  m091:{cut:'saddle',crown:'branches',chest:.39,hem:.72,ink:0x386845,trim:0xa2cd91,emblem:'leaf'},
  m092:{cut:'saddle',crown:'royal',chest:.43,hem:.66,ink:0x705229,trim:0xe6bb55,emblem:'bolt'},
  m093:{cut:'saddle',crown:'relic',chest:.42,hem:.68,ink:0x858382,trim:0xdfd7b8,emblem:'sun'},
  m094:{cut:'saddle',crown:'fang',chest:.44,hem:.71,ink:0x403949,trim:0xb49a63,emblem:'scars'},
  m097:{cut:'splitcoat',crown:'relic',chest:.39,hem:1.13,ink:0x315067,trim:0x98c4cf,emblem:'snowflake',large:true},
  m099:{cut:'warwrap',crown:'ice',chest:.65,hem:.89,ink:0x65482f,trim:0x93cdd3,emblem:'snowflake',large:true},
  m100:{cut:'shroud',crown:'relic',chest:.30,hem:1.11,ink:0x39465c,trim:0x93bbcb,emblem:'snowflake'},
  m101:{cut:'prayer',crown:'elder',chest:.42,hem:1.16,ink:0x814430,trim:0xd9aa68,emblem:'seal',large:true},
  m102:{cut:'warwrap',crown:'fang',chest:.61,hem:.63,ink:0x8b3225,trim:0xdf9c59,emblem:'fang'},
  m104:{cut:'warwrap',crown:'monolith',chest:.70,hem:.56,ink:0x645246,trim:0xcdb664,emblem:'bolt'},
  m105:{cut:'court',crown:'court',chest:.28,hem:1.18,ink:0x883e35,trim:0xe0b578,emblem:'bolt'},
  m107:{cut:'splitcoat',crown:'captain',chest:.40,hem:1.05,ink:0x7d3527,trim:0xcfaa73,emblem:'anchor',large:true},
  m109:{cut:'standards',crown:'royal',chest:.34,hem:1.11,ink:0x9a593b,trim:0xe7bc72,emblem:'sun',large:true},
  m110:{cut:'warwrap',crown:'fang',chest:.53,hem:.64,ink:0x775635,trim:0xdca762,emblem:'fang'},
  m112:{cut:'royal',crown:'royal',chest:.38,hem:1.04,ink:0x5f5b39,trim:0xd6aa68,emblem:'lozenge'},
};

function fabric(parent,tools,name,path,design,more){
  tools.silk(parent,name,path,{tint:design.ink,trim:design.trim,...more});
}

function makeCloth(station,head,entry,tools,design){
  const {cut,chest,hem}=design,w=chest,depth=w*.4;
  const tag=(suffix)=>entry.name+' · '+suffix;
  if(cut==='blindfold'||cut==='kerchief'){
    for(const side of sides){
      fabric(head,tools,tag(side<0?'冠帶':'繫帶'),mirror(side,[
        [.156,.11,-.071,.029],[.188,.056,-.151,.038],[.227,-.043,-.272,.041],[.291,-.11,-.393,.012],
      ]),design,{flex:1.16,phase:side*.91});
    }
  }
  if(cut==='stole'||cut==='prayer'||cut==='court'||cut==='royal'){
    const paired=cut!=='court', long=cut==='royal', central=cut==='court';
    for(const side of central?[1]:sides){
      const x=paired?w*.42:0,z=cut==='stole'?.36:.33;
      fabric(station,tools,tag(side<0?'左襟':'法衣前襟'),mirror(side,[
        [x,.29,z,.056],[x*1.39,.044,z+.139,.071],[x*1.62,-hem*.35,z+.184,.070],
        [x*1.8-.016,-hem*(long?.84:.71),z+.26,long?.042:.027],
      ]),design,{flex:cut==='prayer'?.78:1.12,phase:side*.8});
    }
  }
  for(const side of sides){
    let path,flex,across;
    if(cut==='standards'||cut==='saddle'){
      const mounted=cut==='saddle',setback=mounted?.56:.60;
      path=[[w*.65,.55,-.19-depth,w*.20],[w*.99,.19,-.41-depth,w*.34],
        [w*1.27,-hem*.19,-setback,w*.38],[w*1.41,-hem*.60,-setback-.16,w*.21]];
      flex=mounted?.78:.83;across=[1,.06,-.2];
    }else if(cut==='warwrap'){
      path=[[w*.57,.09,-.15-depth,.072],[w*.77,-.14,-.24-depth,.082],[w*.94,-hem*.46,-.36-depth,.099],
        [w*1.04,-hem*.68,-.39-depth,.053]];
      flex=.75;across=[.74,0,-.58];
    }else if(cut==='shroud'){
      path=[[w*.45,.58,-.26-depth,.064],[w*.96,.29,-.52-depth,.115],[w*1.22,-hem*.20,-.64-depth,.169],
        [w*1.57,-hem*.60,-.71-depth,.010]];
      flex=1.25;across=[.92,.13,-.42];
    }else if(cut==='ribbon'||cut==='zigzag'){
      const zig=cut==='zigzag';
      path=[[w*.60,.50,-.25-depth,.046],[w*(zig?1.34:1.01),.19,-.41-depth,.072],
        [w*(zig?.89:1.5),-hem*.24,-.59-depth,.053],[w*1.72,-hem*.55,-.71-depth,.022]];
      flex=1.43;across=[.86,0,-.40];
    }else if(cut==='cascade'||cut==='cinder'){
      const cascade=cut==='cascade';
      path=[[w*.44,.35,-.35,.059],[w*.93,.043,-.62,.102],[w*1.27,-hem*.32,-.70,.116],
        [w*1.65,-hem*.67,-.77,cascade?.065:.017]];
      flex=cascade?1.32:1.06;across=[.91,0,-.40];
    }else{
      const split=cut==='splitcoat',burly=cut==='royal';
      path=[[w*.46,.58,-.24-depth,w*.21],[w*.73,.20,-.40-depth,w*.34],
        [w*(split?1.02:.89),-hem*.29,-.53-depth,w*(burly?.43:.34)],
        [w*(split?1.4:1.12),-hem*(burly?.81:.63),-.57-depth,w*(split?.26:.20)]];
      flex=burly?.72:1.03;across=[1,0,-.30];
    }
    fabric(station,tools,tag(side<0?'左側背披':'右側背披'),mirror(side,path),design,
      {flex,phase:side*1.11,across:[across[0],across[1],across[2]*side]});
  }
}

const helmetProfiles={
  elder:[.147,.101,.14,.226,-.19,.026],
  veil:[.174,.144,.054,.221,-.158,.017],
  sage:[.148,.151,.087,.212,-.153,.024],
  pin:[.134,.151,.073,.189,-.141,.016],
  fang:[.185,.164,.079,.286,-.222,.030],
  ice:[.173,.170,.059,.254,-.183,.029],
  branches:[.155,.158,.065,.271,-.204,.026],
  thunder:[.171,.175,.104,.253,-.185,.030],
  court:[.152,.182,.076,.212,-.182,.021],
  royal:[.185,.191,.079,.267,-.211,.031],
  relic:[.185,.132,.063,.276,-.219,.027],
  monolith:[.222,.146,.105,.285,-.212,.045],
  nabata:[.211,.205,.060,.245,-.207,.030],
  captain:[.197,.205,.087,.304,-.192,.019],
};

function helmet(k,head,design,mobile){
  let [w,height,chin,tip,depth,thickness]=helmetProfiles[design.crown];
  if(design.large){w*=1.12;tip*=1.10;}
  const organic=['elder','sage','captain','pin','court'].includes(design.crown);
  const a=k.materials.bMetal?'bMetal':k.materials.rind?'rind':'edge';
  const b=k.materials.bOxide?'bOxide':'body';
  const trim=k.materials.bTrim?'bTrim':'trim';
  for(const side of sides){
    const guard=mirror(side,[[w*.68,height,.107],[w*.91,height*.97,-.026],[tip,height*.43,-.087],
      [tip*.89,-chin*.55,depth*.70],[w*.91,-chin*1.26,-.018],[w*.74,-chin*.44,.154]]);
    plate(k,head,a,guard,thickness);
    seam(k,head,trim,guard.map(([x,y,z],i)=>[x+side*.014,y,z+.012,[.010,.013,.015,.012,.008,.003][i]]),9);
    if(!organic){
      for(let i=0;i<(mobile?2:3);i++){
        const y=-chin*.51-i*.051,z=-.021+i*.009;
        const layer=mirror(side,[[w*.76,y+.031,z+.078],[tip*.91,y+.057,z-.048],[tip,y+.012,depth*.70],
          [tip*.89,y-.042,depth*.82],[w*.80,y-.075,z+.025]]);
        plate(k,head,i%2?a:b,layer,thickness*.79);
        gem(k,head,trim,side*tip*.92,y-.018,z-.05,.016);
      }
    }else{
      const ear=mirror(side,[[w*.97,.047,.065,.015],[tip*.92,.065,.031,.023],[tip*.98,.016,.003,.021],
        [w*.95,-.041,.039,.008]]);
      seam(k,head,k.materials.bFlesh?'bFlesh':'body',ear,9);
    }
    seam(k,head,organic?trim:a,mirror(side,[[w*.39,height*.95,.113,.009],
      [w*.78,height*1.19,-.014,.029],[w*.85,height*1.08,depth*.70,.034],[w*.61,height*.71,depth*1.14,.014]]),11);
    if(design.crown==='fang'||design.crown==='relic')
      seam(k,head,k.materials.bBone?'bBone':'edge',mirror(side,[[w*.61,-chin*.88,.169,.013],
        [w*.64,-chin*1.35,.191,.015],[w*.74,-chin*1.82,.143,.007],[w*.82,-chin*1.86,.099,.002]]),7);
  }
}

const signs={
  lozenge:[[-.50,0],[0,.82],[.50,0],[0,-.82],[-.50,0]],
  ripple:[[-.80,.21],[-.47,.42],[-.13,.24],[.21,-.07],[.56,-.18],[.79,.08]],
  seal:[[-.63,-.53],[-.63,.53],[.57,.53],[.57,-.41],[-.23,-.41],[-.23,.19],[.18,.19],[.18,-.13]],
  chevron:[[-.79,.26],[-.42,.14],[0,-.49],[.43,.14],[.79,.26]],
  ember:[[-.57,-.42],[-.73,.01],[-.25,.50],[.01,.87],[-.01,.17],[.36,.36],[.58,-.03],[.45,-.43]],
  snowflake:[[-.73,-.28],[0,-.53],[0,.85],[.14,.07],[.71,-.29],[0,-.05],[-.67,.34]],
  leaf:[[-.67,-.52],[.12,-.37],[.77,.60],[.01,.59],[-.34,.32],[-.67,-.52]],
  bolt:[[-.60,-.52],[.04,.03],[-.31,.06],[.49,.76],[.17,.18],[.73,.22],[.06,-.66]],
  sun:[[-.76,-.08],[-.48,.58],[.24,.71],[.68,.27],[.60,-.42],[-.15,-.72],[-.71,-.43],[-.76,-.08]],
  embers:[[-.80,-.45],[-.37,.18],[-.21,-.06],[.19,.54],[.37,.16],[.71,.56]],
  fang:[[-.67,.42],[-.46,.08],[-.25,-.72],[-.12,-.27],[.25,.42],[.37,-.16],[.57,-.59],[.70,.39]],
  scars:[[-.73,-.36],[-.13,.57],[-.23,-.36],[.42,.59],[.35,-.39],[.76,.28]],
  arrow:[[-.75,.29],[0,.57],[.72,.12],[0,.51],[0,-.70]],
  anchor:[[-.72,-.13],[-.62,-.54],[-.02,-.68],[.59,-.53],[.72,-.14],[0,-.64],[0,.71]],
};

function cuirass(k,station,head,parts,tools,design,mobile){
  const w=design.chest,large=design.large,h=head.position.y*.77;
  const backZ=-.355-w*.24;
  const base=k.materials.bMetal?'bMetal':'body';
  const accent=k.materials.bTrim?'bTrim':'trim';
  const dark=k.materials.bOxide?'bOxide':'deep';
  const ridge=(large?.309:.247)*(.72+w*.71);
  const stone=k.bone(station,0,h*.57,backZ);
  const profile=[[0,ridge,-.01],[ridge*.49,ridge*.62,.016],[ridge*.69,-ridge*.07,-.009],
    [ridge*.41,-ridge*.76,-.022],[0,-ridge,-.025],[-ridge*.41,-ridge*.76,-.022],
    [-ridge*.65,-ridge*.07,-.009],[-ridge*.48,ridge*.62,.016]];
  plate(k,stone,dark,profile,.031);
  seam(k,stone,accent,[...profile,profile[0]].map(([x,y,z])=>[x*.89,y*.86,z-.03,.012]),13);
  seam(k,stone,k.materials.bInlay?'bInlay':'glow',signs[design.emblem].map(([x,y],i)=>[x*ridge*.56,
    y*ridge*.74,-.053,(i===0||i===signs[design.emblem].length-1)?.006:.012]),16);
  const limbs=parts.arms??[];
  for(const side of sides){
    const matches=limbs.filter(arm=>arm.parent===station&&arm.position.x*side>.05);
    if(!matches.length){
      const shoulder=station.children.find(child=>child.isGroup&&child.position.x*side>w*.55&&
        Math.abs(child.position.y-h*.75)<.24&&Math.abs(child.position.z)<.13);
      if(shoulder)matches.push(shoulder);
    }
    const wing=k.bone(station,side*w*.80,h*.98,-.111);
    tools.hinge(wing,{side,axis:'z',wind:.11,strike:-.16,phase:.09,travel:.049,follow:matches[0],ratio:.38});
    const scale=.67+w*.72;
    for(let i=0;i<(large&&!mobile?3:2);i++){
      const y=.085-i*.103,size=scale*(1+i*.15);
      const shell=[[.012,y+.011,.101],[.13*size,y+.093,.028],[.25*size,y+.039,-.058],
        [.239*size,y-.08,-.200],[.151*size,y-.181,-.242],[.029,y-.13,-.178]];
      plate(k,wing,i%2?dark:base,mirror(side,shell),.039);
      seam(k,wing,accent,mirror(side,shell.slice(1,6).map(([x,y,z],n)=>[x+.021,y-.014,z-.007,n===4?.006:.013])),10);
      gem(k,wing,accent,side*.157*size,y-.101,-.216,.022);
    }
    seam(k,station,dark,mirror(side,[[w*.50,h*1.03,-.22,.014],[w*.59,h*.83,backZ+.090,.035],
      [w*.46,h*.61,backZ+.019,.034],[.022,h*.44,backZ+.007,.027]]));
    seam(k,station,accent,mirror(side,[[w*.58,h*1.03,-.24,.009],[w*.67,h*.83,backZ+.061,.013],
      [w*.52,h*.61,backZ-.011,.016],[.033,h*.44,backZ-.023,.011]]));
    const sash=mirror(side,[[.032,h*.54,backZ+.057],[w*.49,h*.44,backZ+.034],[w*.76,h*.32,backZ+.078],
      [w*.83,h*.15,-.24],[w*.68,h*.10,-.22],[w*.47,h*.31,backZ+.075]]);
    plate(k,station,dark,sash,.036);
    gem(k,station,accent,side*w*.48,h*.41,backZ+.005,.027);
  }
}

function dressedBoss(k,parts,entry,mobile,tools,design){
  const {head,body}=parts;
  const station=design.cut==='saddle'?head.parent:body;
  helmet(k,head,design,mobile);
  cuirass(k,station,head,parts,tools,design,mobile);
  makeCloth(station,head,entry,tools,design);
  dressFeatures[entry.id]?.(k,parts,station,mobile,tools);
}

function imperialCrown(k,{head},station,mobile,tools){
  for(const side of sides){
    for(let i=0;i<(mobile?3:4);i++){
      const x=side*(.052+i*.032);
      const chain=k.bone(head,x,.585,-.032);
      const length=.23-.014*i;
      tools.hinge(chain,{side,axis:'x',wind:.24,strike:-.26,travel:.13,phase:.085});
      seam(k,chain,'bTrim',[[0,0,0,.007],[0,-length*.38,-.019,.006],
        [side*.017,-length*.79,-.038,.006],[side*.017,-length,-.038,.005]]);
      for(let bead=1;bead<=3;bead++)
        gem(k,chain,bead%2?'bBone':'bInlay',side*.006*bead,-length*bead/3,-.015*bead,.013);
    }
    const cap=mirror(side,[[.017,.61,-.022],[.209,.611,-.056],[.236,.570,-.131],
      [.192,.541,-.176],[.048,.560,-.14],[.014,.591,-.094]]);
    plate(k,head,'bMetal',cap,.023);
    seam(k,head,'bTrim',cap.slice(0,5).map(([x,y,z])=>[x+.004*side,y+.018,z-.01,.012]));
    const tabard=mirror(side,[[.201,.56,-.412],[.29,.63,-.409],[.36,.501,-.378],
      [.347,.443,-.424],[.237,.368,-.475],[.167,.396,-.487]]);
    plate(k,station,'bOxide',tabard,.032);
    seam(k,station,'bTrim',tabard.slice(1,5).map(([x,y,z])=>[x,y,z-.027,.016]));
  }
}

function fireDemon(k,{head},station,mobile,tools){
  for(const side of sides){
    const x=side*.13,jaw=k.bone(head,x,-.113,.115);
    tools.hinge(jaw,{side,axis:'z',wind:.06,strike:-.12,phase:.06});
    const face=mirror(side,[[.004,.029,.105],[.053,.107,.057],[.105,.060,-.015],
      [.099,-.037,-.026],[.043,-.092,.055],[0,-.082,.084]]);
    plate(k,jaw,'bOxide',face,.033);
    seam(k,jaw,'bInlay',face.slice(0,5).map(([x,y,z],i)=>[x+.007*side,y,z+.027,i===2?.014:.008]));
    seam(k,jaw,'bBone',mirror(side,[[.033,.007,.127,.024],[.043,-.061,.144,.018],[.053,-.119,.128,.003]]));
    const fire=k.bone(station,side*.37,.45,-.24);
    for(let i=0;i<(mobile?2:3);i++){
      const z=-.076*i,y=-.05*i;
      seam(k,fire,'bOxide',mirror(side,[[0,y,z,.053],[.145,y-.05,z-.112,.069],
        [.253,y+.075,z-.167,.056],[.203,y+.203,z-.226,.006]]),11);
      seam(k,fire,'bInlay',mirror(side,[[.013,y-.021,z+.022,.010],[.138,y-.012,z-.049,.017],
        [.233,y+.093,z-.115,.026],[.202,y+.17,z-.172,.003]]),9);
    }
    tools.hinge(fire,{side,axis:'z',wind:.18,strike:-.28,phase:.12,travel:.06});
  }
}

function pirateHat(k,{head},station,_mobile,tools){
  const medallion=k.bone(head,0,.222,-.243);
  const crest=[[-.05,.012,0],[0,.082,-.014],[.061,.014,-.004],[.048,-.062,-.017],
    [0,-.091,-.019],[-.061,-.060,-.016]];
  plate(k,medallion,'rind',crest,.025);
  gem(k,medallion,'edge',0,.003,-.037,.035);
  for(const side of sides){
    seam(k,head,'rind',mirror(side,[[.063,.16,-.178,.013],[.151,.187,-.224,.031],
      [.225,.198,-.239,.034],[.274,.148,-.217,.003]]));
    const buckle=k.bone(station,side*.245,.525,-.283);
    tools.hinge(buckle,{side,axis:'x',wind:.12,strike:-.19,phase:.068});
    const strap=mirror(side,[[.033,.095,-.043],[-.043,.081,-.060],[-.053,-.056,-.094],
      [.04,-.078,-.062],[.051,-.004,-.042]]);
    plate(k,buckle,'rind',strap,.03);
    seam(k,buckle,'trim',[...strap,strap[0]].map(([x,y,z])=>[x*.84,y*.85,z-.024,.009]));
    gem(k,buckle,'trim',0,.031,-.113,.020);
  }
}

function mountedTack(k,{body},station,_mobile,tools){
  const width=Math.abs(station.position.z)*.15+.40,back=station.position.z-.48;
  for(const side of sides){
    const flank=k.bone(body,side*width,.142,back);
    tools.hinge(flank,{side,axis:'z',wind:.19,strike:-.18,travel:.11,phase:.062});
    const octagon=mirror(side,[[.01,.12,.06],[.099,.08,-.01],[.101,-.092,-.065],
      [.043,-.209,-.093],[-.043,-.166,-.113],[-.061,-.014,-.016]]);
    plate(k,flank,'bOxide',octagon,.04);
    seam(k,flank,'bTrim',octagon.slice(1,6).map(([x,y,z])=>[x+side*.027,y,z,.016]));
    gem(k,flank,'bInlay',side*.046,-.061,-.108,.037);
  }
}

const dressFeatures={m067:imperialCrown,m068:imperialCrown,m081:fireDemon,m107:pirateHat,
  m074:mountedTack,m089:mountedTack,m090:mountedTack,m091:mountedTack,m092:mountedTack,m093:mountedTack,m094:mountedTack};

function tombBeast(k,{body,head},entry,mobile,tools){
  const tide=entry.id==='m057';
  for(const side of sides){
    const y=tide?.148:.129,offset=tide?.018:.049;
    const brow=mirror(side,[[.043,.059,.294],[.105,.100,.242],[.177,.132,.167],[.229,.087,.101],
      [.223,.054,.210],[.123,.025,.283],[.058,.022,.342]]);
    plate(k,head,tide?'steel':'ivory',brow,.027);
    seam(k,head,'ironRim',brow.slice(1,5).map(([x,y,z],i)=>[x+side*.009,y+.012,z+.015,.006+i*.002]));
    tools.silk(head,entry.name+' · 面側流蘇',mirror(side,[
      [.204,.017,.135,.030],[.248,-.068,.039,.053],[.337,-.182,-.096,.049],
      [tide?.417:.516,-.257,-.21,.012],
    ]),{tint:tide?0x406783:0x51683a,trim:tide?0x74cce8:0xbad273,style:'mane',phase:side*.85,
      across:[.35,1,.20*side],flex:tide?.86:1.10});
    for(let row=0;row<(mobile?3:4);row++){
      const z=.24-row*.215;
      const cuirass=k.bone(body,side*(.345-row*.009),y-row*.025,z);
      tools.hinge(cuirass,{side,axis:'z',wind:.23,strike:-.17,phase:.14,travel:.083});
      const rim=mirror(side,[[.008,.063,.077],[.092,.088,.018],[.125,-.022,-.067],
        [.095,-.139,-.092],[.011,-.199,-.048],[-.012,-.072,.087]]);
      plate(k,cuirass,row%2?'ochre':tide?'cobalt':'jade',rim,.041);
      seam(k,cuirass,tide?'steel':'ivory',rim.slice(1,5).map(([x,y,z])=>[x+side*offset,y,z,.010]));
      gem(k,cuirass,row%2?'glow':'brass',side*.107,-.058,-.037,.025);
    }
  }
  const tail=tide?[[.02,.19,-.62,.12],[.05,.29,-.89,.139],[.16,.371,-1.14,.127],[.23,.512,-1.41,.02]]:
    [[.02,.202,-.64,.08],[-.047,.32,-.85,.114],[-.18,.44,-1.08,.107],[-.33,.72,-1.25,.014]];
  tools.silk(body,entry.name+(tide?' · 尾鰭':' · 尾鬃'),tail,{tint:tide?0x425e87:0x425537,trim:tide?0x80bfd2:0xa9c16e,
    across:[.55,.85,0],style:tide?'membrane':'mane',phase:tide?1.59:2.34,flex:1.13});
}

function seaStar(k,{head},entry,mobile,tools){
  const gold=entry.id==='m096',hub=head.parent,tips=hub.children.filter(child=>child!==head);
  for(const [i,arm] of tips.entries()){
    const angle=i*Math.PI*2/tips.length,reach=i%2===0?.69:.518,middle=arm.children[0];
    if(!middle)continue;
    const stride=i%2?-1:1;
    const color=gold?0xa56126:0x69457b,trim=gold?0xe7b46a:0xd28bc0;
    tools.silk(middle,entry.name+' · '+(i+1)+'號管足',[
      [stride*.019,.032,-.09,.066],[stride*.089,.164,-.138,.071],
      [stride*.181,reach*.51,-.179,.060],[stride*.225,reach*.84,-.121,.008],
    ],{tint:color,trim,style:'membrane',across:[1,0,.12],phase:angle,flex:gold?.71:1.18});
    const shell=k.bone(arm,0,.085,-.103);
    tools.hinge(shell,{side:stride,axis:'x',wind:.17,strike:-.27,phase:.16,travel:.07,follow:middle,ratio:.22});
    const plateCount=mobile?2:3;
    for(let row=0;row<plateCount;row++){
      const y=row*.128,z=-.016-row*.017,w=.10-row*.011;
      plate(k,shell,row%2?'bOxide':'bMetal',[[-w,y-.024,z],[-w*.73,y+.083,z+.008],[.026,y+.11,z-.034],
        [w,y+.053,z],[w*.72,y-.024,z+.007],[0,y-.065,z-.031]],.025);
      gem(k,shell,gold&&row===0?'glow':'bInlay',0,y+.038,z-.048,.023);
    }
    seam(k,middle,gold?'bBone':'bTrim',[[0,.013,.148,.022],[stride*.040,.133,.144,.026],
      [stride*.011,.254,.197,.014],[stride*.095,reach*.61,.219,.003]]);
  }
}

function frozenPao(k,{body,head,pao},entry,mobile,tools){
  for(const [i,wing] of pao.wings.entries()){
    const side=sides[i];
    const strip=mirror(side,[[.18,.312,-.083,.071],[.44,.596,-.123,.111],[.64,.532,-.346,.143],[.82,.192,-.466,.022]]);
    tools.silk(wing,entry.name+' · 霧綃裂翼',strip,{style:'membrane',tint:0x405060,trim:0x91c0d1,
      phase:side*.91,across:[.66,.61,side*-.37],flex:.81});
    const joint=k.bone(body,side*.285,.54,-.344);
    tools.hinge(joint,{side,axis:'y',wind:.17,strike:-.20,phase:.12,follow:wing,ratio:.37});
    for(let row=0;row<(mobile?3:4);row++){
      const h=.077-row*.114;
      const frost=mirror(side,[[.008,h+.087,0],[.128,h+.093,-.041],[.233,h+.088,-.090],
        [.214,h-.071,-.078],[.114,h-.136,-.056],[.008,h-.084,.010]]);
      plate(k,joint,row%2?'body':'wingEdge',frost,.034);
      seam(k,joint,'cyan',frost.slice(1,5).map(([x,y,z],n)=>[x,y,z-.024,n===2?.010:.005]));
    }
    tools.silk(head,entry.name+' · 冰霜白鬚',mirror(side,[
      [.11,-.217,.336,.041],[.134,-.423,.349,.048],[.172,-.617,.371,.041],[.199,-.829,.428,.007],
    ]),{style:'mane',tint:0xa9bdc4,trim:0xd7f3f6,phase:side*.98,flex:.68});
  }
}

function eightSerpents(k,{body},entry,mobile,tools){
  const heads=body.children.map(node=>node.children.find(child=>child.position.y>.50)).filter(Boolean);
  for(const [i,head] of heads.entries()){
    const side=i%2?1:-1,tip=.213+(i%3)*.032;
    const outer=mirror(side,[[.093,.16,-.06,.050],[.178,.28,-.148,.037],[tip,.38,-.207,.026],[tip+.121,.47,-.324,.002]]);
    seam(k,head,'bBone',outer);
    tools.silk(head,entry.name+' · 第'+(i+1)+'首鬚鰭',mirror(side,[
      [.125,.048,.158,.062],[.209,.057,.043,.090],[.278,-.013,-.123,.104],[.319,-.20,-.331,.008],
    ]),{style:'membrane',tint:0x6d3028,trim:i%2?0xe09a59:0xb9613c,phase:i*.51,flex:1.18,across:[0,1,.18]});
    const y=.139;
    const crest=mirror(side,[[.026,y+.036,.041],[.147,y+.080,-.034],
      [.188,y+.035,-.147],[.136,y-.079,-.151],[.042,y-.047,-.06]]);
    plate(k,head,'bOxide',crest,.027);
    gem(k,head,'bInlay',side*.155,y-.001,-.146,.019);
  }
  for(let row=0;row<(mobile?3:5);row++){
    const z=.08-row*.242,w=.42+row*.025,y=.64-row*.056;
    for(const side of sides){
      const keel=mirror(side,[[.012,y+.073,z+.091],[w*.56,y+.047,z+.070],[w,y-.037,z-.012],
        [w*.82,y-.081,z-.133],[w*.31,y+.017,z-.186],[.018,y+.029,z-.139]]);
      plate(k,body,row%2?'bMetal':'bOxide',keel,.031);
      seam(k,body,'bTrim',keel.slice(1,5).map(([x,y,z])=>[x,y+.017,z-.018,.012]));
    }
  }
}

function cloudDragon(k,{body},entry,mobile,tools){
  const head=body.userData.dragonHead;
  const neck=head.parent;
  for(const side of sides){
    const plateCount=mobile?3:4;
    for(let i=0;i<plateCount;i++){
      const y=1.15-i*.238;
      const shell=k.bone(neck,side*.225,y,-.088);
      tools.hinge(shell,{side,axis:'y',wind:.30,strike:-.31,phase:.14,travel:.08,follow:head,ratio:.18});
      const plateShape=mirror(side,[[.020,.082,.034],[.174,.120,-.023],[.285,.107,-.132],
        [.247,-.056,-.239],[.098,-.102,-.197],[.005,-.074,-.029]]);
      plate(k,shell,i%2?'body':'edge',plateShape,.033);
      seam(k,shell,'trim',plateShape.slice(1,5).map(([x,y,z])=>[x+side*.013,y+.009,z,.012]));
    }
    tools.silk(head,entry.name+' · 龍鬚',mirror(side,[
      [.219,-.112,.522,.029],[.418,-.046,.677,.025],[.676,.100,.784,.031],[.988,.241,.655,.004],
    ]),{tint:0xc2c9c7,trim:0xe3be77,style:'mane',phase:side*.94,across:[.04,.78,.69*side],flex:1.36});
    tools.silk(head,entry.name+' · 耳鰭',mirror(side,[
      [.239,.094,-.024,.100],[.47,.127,-.264,.159],[.67,.071,-.483,.180],[.80,-.156,-.607,.009],
    ]),{tint:0x42576e,trim:0x8eb5c9,style:'membrane',phase:side*1.68,across:[.14,1,0],flex:.92});
    seam(k,head,'edge',mirror(side,[[.13,.058,.483,.021],[.244,.079,.390,.032],
      [.365,.036,.157,.035],[.381,-.028,-.017,.002]]));
  }
}

function oniBeast(k,{body,head},entry,mobile,tools){
  const tiger=entry.id==='m108',color=tiger?0x8a969d:0x582929,trim=tiger?0xc8e0df:0xae8b7f;
  for(const side of sides){
    const shoulder=k.bone(body,side*(tiger?.48:.52),tiger?.53:.45,-.234);
    tools.hinge(shoulder,{side,axis:'z',wind:.15,strike:-.22,travel:.067,phase:.12});
    for(let i=0;i<(mobile?3:4);i++){
      const y=.075-i*.091,width=(tiger?.19:.22)*(1-i*.08);
      const bones=mirror(side,[[0,y+.113,-.034],[width*.58,y+.061,-.012],[width,y-.027,-.104],
        [width*.89,y-.136,-.189],[width*.30,y-.141,-.242],[-width*.13,y-.051,-.118]]);
      plate(k,shoulder,i%2?'bOxide':'bMetal',bones,.043);
      gem(k,shoulder,i===0?'bInlay':'bTrim',width*.7*side,y-.022,-.143,.026);
    }
    tools.silk(head,entry.name+(tiger?' · 虎頰長鬚':' · 頸後鬃'),mirror(side,tiger?[
      [.182,.06,.199,.058],[.286,-.048,.188,.104],[.42,-.154,.116,.124],[.51,-.269,-.039,.008],
    ]:[
      [.166,.139,-.103,.073],[.293,.039,-.199,.12],[.382,-.106,-.305,.137],[.373,-.331,-.442,.018],
    ]),{tint:color,trim,style:'mane',phase:side*.87,flex:tiger?1.02:.73,across:[.19,.86,-.47*side]});
    seam(k,head,tiger?'bInlay':'bBone',mirror(side,[[.037,.04,.232,.008],[.129,.11,.207,.023],
      [.214,.128,.118,.035],[.275,.093,-.018,.006]]));
  }
  tools.silk(body,entry.name+' · 獸毛背脊',[
    [.013,.34,-.474,.090],[-.016,.184,-.623,.146],[.045,-.017,-.742,.123],[.127,-.265,-.801,.017],
  ],{tint:color,trim,style:'mane',phase:1.91,flex:.84});
}

const creatures={
  m057:tombBeast,m058:tombBeast,m095:seaStar,m096:seaStar,m098:frozenPao,
  m103:eightSerpents,m106:cloudDragon,m108:oniBeast,m111:oniBeast,
};

export function refineBossB(k,parts,entry,mobile,tools){
  const design=outfits[entry.id],build=creatures[entry.id];
  if(!design&&!build)return false;
  if(design)dressedBoss(k,parts,entry,mobile,tools,design);
  else if(k.sculpt)build(k,parts,entry,mobile,tools);
  else{
    const sculpt=sculptPao(k);
    build({...k,sculpt},parts,entry,mobile,tools);
    sculpt.finish(k.geometry);
  }
  return true;
}
