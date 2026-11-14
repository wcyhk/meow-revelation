import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {sculptPao} from './pao-sculpt.mjs?v=chiaroscuro-1';

const sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...rest])=>[x*s,...rest]);
const volume=(k,node,finish,path,mobile,section=2.35)=>
  k.geometry(node,finish,sculptVolume(path,{rings:mobile?10:16,sides:mobile?9:13,section,ridge:.18}));
const edge=(k,node,finish,path)=>k.sculpt.sweep(node,finish,path,{sides:6,steps:10,ridge:.20});
const bevel=(k,node,finish,path,depth=.028)=>k.sculpt.plate(node,finish,path,depth,depth*.28);
const material=(k,name,fallback)=>k.materials[name]?name:fallback;
const gold=(k)=>material(k,'bTrim','trim');
const steel=(k)=>material(k,'bMetal','edge');
const oxide=(k)=>material(k,'bOxide','deep');
const pin=(k,node,finish,x,y,z,r)=>k.mesh(node,'gem',finish,x,y,z,r,r*.94,r*.58);

function animate(parts,apply){
  const before=parts.finishPose;
  parts.finishPose=pose=>{
    before?.(pose);
    apply(pose);
  };
}

function emboss(k,node,finish,path,r=.009){
  edge(k,node,finish,path.map(([x,y,z],i)=>[x,y,z,i===0||i===path.length-1?r*.31:r]));
}

// Deep sets are cast individually around each head; the raised patterns keep a
// readable outline at combat distance, including when illuminated from behind.
const seals={
  lotus:[[-.82,-.32],[-.49,-.28],[-.64,.28],[-.19,.17],[0,.91],[.18,.18],[.65,.28],[.49,-.28],[.82,-.32],[0,-.62],[-.82,-.32]],
  water:[[-.92,.43],[-.53,.39],[-.20,.05],[.16,-.26],[.44,-.20],[.72,.09],[.78,.37],[.42,.40],[.13,.28]],
  blade:[[-.86,-.73],[-.28,.10],[-.12,.55],[0,.89],[.12,.56],[.22,.10],[.86,-.73],[.18,-.50],[0,-.78],[-.17,-.48],[-.86,-.73]],
  crack:[[-.83,-.63],[-.31,-.20],[-.35,.27],[.19,.44],[.12,.78],[.63,.44],[.42,.08],[.75,-.31],[.47,-.57]],
  bones:[[-.87,.21],[-.47,.46],[-.15,.19],[0,.79],[.15,.19],[.47,.46],[.87,.21],[.53,-.05],[.29,-.57],[0,-.66],[-.29,-.57],[-.53,-.05],[-.87,.21]],
  eye:[[-.88,-.12],[-.47,.22],[0,.42],[.51,.22],[.88,-.12],[.58,-.40],[0,-.55],[-.55,-.37],[-.88,-.12]],
};

// [cap style, width, upper ridge, crest reach, cuirass width, seal, energy tint]
const court={
  m059:['cloth',.190,.39,.43,.34,'lotus',0xf5aa73],
  m060:['veil',.18,.38,.41,.32,'water',0x8de5e8],
  m061:['cloth',.163,.39,.41,.31,'lotus',0xb6d283],
  m062:['mask',.148,.29,.35,.25,'eye',0xf4be70],
  m063:['horn',.187,.36,.60,.38,'bones',0xff7f46],
  m064:['visor',.164,.39,.47,.36,'water',0x8ac7ff],
  m065:['branch',.164,.36,.52,.34,'lotus',0xa6e677],
  m066:['horn',.192,.36,.59,.35,'crack',0xffd66a],
  m067:['imperial',.18,.57,.55,.38,'eye',0xffd28b],
  m068:['imperial',.205,.57,.62,.43,'blade',0xfaaf55],
  m069:['cloth',.17,.32,.40,.33,'lotus',0xb4dda0],
  m070:['mask',.194,.25,.39,.44,'blade',0xff8745],
  m071:['veil',.159,.29,.37,.28,'water',0x92e2fb],
  m072:['cloth',.17,.34,.43,.29,'crack',0xf2cb81],
  m073:['cloth',.19,.42,.43,.33,'crack',0xffbb79],
  m074:['mask',.148,.31,.39,.32,'blade',0xffbc78],
  m075:['horn',.175,.36,.55,.37,'bones',0xf32947],
  m076:['horn',.180,.34,.59,.39,'crack',0xebc863],
  m077:['cloth',.151,.33,.39,.29,'water',0x82d3ee],
  m078:['branch',.182,.36,.52,.46,'lotus',0xc1d877],
  m079:['branch',.164,.32,.55,.33,'eye',0x8be6c9],
  m080:['visor',.183,.35,.48,.37,'water',0x8ab4ff],
  m081:['horn',.192,.40,.62,.41,'crack',0xff8b4a],
  m082:['veil',.184,.37,.48,.38,'bones',0x80d6ff],
  m083:['visor',.171,.32,.43,.35,'blade',0x9ee292],
  m084:['mask',.168,.33,.43,.36,'eye',0xffd58b],
  m089:['horn',.173,.37,.48,.37,'bones',0xf58866],
  m090:['visor',.179,.42,.52,.36,'water',0x86dbff],
  m091:['branch',.179,.40,.54,.38,'lotus',0x9ce5a7],
  m092:['imperial',.189,.39,.52,.41,'crack',0xffd061],
  m093:['visor',.173,.36,.51,.38,'blade',0xffefbe],
  m094:['horn',.185,.38,.55,.40,'bones',0xa6a1ec],
  m097:['horn',.205,.43,.57,.45,'bones',0xb8eefc],
  m099:['horn',.205,.38,.57,.49,'water',0x86e5ff],
  m100:['veil',.172,.39,.54,.34,'water',0xb4dfeb],
  m101:['imperial',.177,.52,.52,.36,'lotus',0xffc991],
  m102:['horn',.206,.37,.61,.54,'bones',0xff9358],
  m104:['mask',.214,.34,.49,.53,'crack',0x9cdcff],
  m105:['imperial',.17,.43,.47,.29,'crack',0xffbf81],
  m109:['imperial',.182,.42,.51,.36,'blade',0xffd88a],
  m110:['horn',.209,.32,.57,.52,'bones',0xfdd889],
  m112:['visor',.184,.42,.49,.38,'blade',0xe1d795],
};

function courtModel(k,parts,entry,mobile,design){
  const {head,body}=parts;
  const torso=head.parent?.isGroup?head.parent:body;
  const [cut,width,cap,reach,neck,seal,tint]=design;
  const ceremonial=cut==='imperial'||cut==='cloth';
  const horn=cut==='horn'||cut==='branch';
  const masked=!ceremonial&&cut!=='veil';
  const frame=material(k,'bMetal','body'),rim=gold(k),shadow=oxide(k);
  const tooth=material(k,'bBone','edge');
  const ridge=seal==='crack'?'glow':rim;
  for(const s of sides){
    const temple=mirror(s,[[width*.47,.195,.151],[width*.79,.253,.09],[width*1.06,.206,-.067],
      [width*1.24,.129,-.175],[width*1.04,-.024,-.218],[width*.83,-.116,-.115],
      [width*.88,-.064,.021],[width*.62,.051,.153]]);
    bevel(k,head,frame,temple,ceremonial?.018:.037);
    emboss(k,head,rim,temple.slice(1,6).map(([x,y,z])=>[x+s*.016,y+.01,z-.009]),.014);
    const relief=mirror(s,[[width*.14,cap+.043,-.126],[width*.67,cap,-.155],
      [width*.83,cap*.66,-.258],[width*.61,cap*.37,-.298],[width*.24,cap*.48,-.312],[0,cap*.72,-.242]]);
    bevel(k,head,shadow,relief,.026);
    emboss(k,head,rim,relief.slice(0,5).map(([x,y,z])=>[x,y+.012,z-.026]),.012);
    for(let i=0;i<(mobile?2:3);i++){
      const h=.035-.062*i,z=-.226+.038*i;
      const nape=mirror(s,[[.006,h+.09,z],[width*.67,h+.106,z-.006],[width*1.24,h+.062,z+.048],
        [width*1.21,h-.019,z+.039],[width*.50,h-.047,z-.035],[.006,h-.034,z-.036]]);
      bevel(k,head,i%2?shadow:frame,nape,.019);
      emboss(k,head,rim,nape.slice(2,6).map(([x,y,z])=>[x,y-.005,z-.022]),.009);
      pin(k,head,rim,s*width*.77,h+.034,z-.018,.012);
    }
    if(horn){
      const curl=mirror(s,[[width*.82,.172,.04,.039,.049],[width*1.22,cap*.72,-.064,.064,.059],
        [width*1.68,cap*.96,-.16,.067,.041],[width*1.82,reach*.92,-.208,.033,.024],
        [width*(cut==='branch'?2.45:1.75),reach,-.307,.002,.002]]);
      volume(k,head,cut==='branch'?frame:tooth,curl,mobile);
      edge(k,head,ridge,curl.map(([x,y,z,r])=>[x-s*.011,y-.018,z+r*.58,r*.25]));
      if(cut==='branch')edge(k,head,tooth,mirror(s,[[width*1.63,cap*.9,-.15,.038],
        [width*1.93,cap*.90,-.055,.031],[width*2.22,cap*1.10,.003,.004]]));
    }
    if(masked){
      const cheek=mirror(s,[[width*.81,.074,.166],[width*1.06,.078,.106],[width*1.18,.010,.048],
        [width*1.06,-.131,.073],[width*.72,-.216,.133],[width*.39,-.199,.210],[width*.64,-.12,.225]]);
      bevel(k,head,shadow,cheek,.027);
      emboss(k,head,ridge,cheek.slice(2).map(([x,y,z])=>[x+s*.009,y,z+.025]),.012);
      if(horn)volume(k,head,tooth,mirror(s,[[width*.91,-.146,.169,.020,.021],
        [width*.79,-.224,.199,.023,.020],[width*.66,-.287,.203,.005,.004]]),mobile,2.04);
    }else{
      // Fine branching cuts and a low, warm edge between the natural cheek and the collar.
      const cheek=mirror(s,[[width*.75,-.054,.16],[width*.60,-.088,.187],
        [width*.62,-.122,.183],[width*.53,-.149,.174]]);
      emboss(k,head,shadow,cheek,.007);
      emboss(k,head,material(k,'bFlesh','edge'),cheek.map(([x,y,z])=>[x+s*.015,y-.012,z+.012]),.014);
    }
  }
  if(ceremonial){
    const brim=[[-width,.65*cap,-.22],[0,.75*cap,-.276],[width,.65*cap,-.22],
      [width*1.22,cap*.82,-.152],[0,cap+.026,-.236],[-width*1.22,cap*.82,-.152]];
    bevel(k,head,frame,brim,.036);
    emboss(k,head,rim,brim.slice(0,3).map(([x,y,z])=>[x,y,z-.031]),.013);
    for(let i=-1;i<=1;i++)pin(k,head,i===0?'glow':rim,width*.42*i,cap*.82,-.266,.019);
  }
  const back=-.315-neck*.30, high=head.position.y*.64;
  const crest=k.bone(torso,0,high,back);
  const scale=neck*.67+.09;
  const spine=[[-scale*.71,.145,.003],[-scale*.36,.274,.012],[0,.314,-.003],
    [scale*.36,.274,.012],[scale*.71,.145,.003],[scale*.63,-.102,-.036],[0,-.224,-.055],[-scale*.63,-.102,-.036]];
  bevel(k,crest,shadow,spine,.052);
  for(const s of sides){
    const ridge=mirror(s,[[.006,.24,-.046],[scale*.31,.26,-.039],[scale*.64,.17,-.032],
      [scale*.52,-.09,-.076],[.012,-.20,-.095]]);
    emboss(k,crest,rim,ridge,.016);
    pin(k,crest,frame,s*scale*.57,.113,-.058,.028);
    const rows=mobile?2:3;
    for(let i=0;i<rows;i++){
      const y=.086-i*.118,w=neck*(1-i*.13),z=-.04+i*.052;
      const tier=mirror(s,[[w*.41,y+.052,z],[w*.85,y+.092,z+.038],[w*1.24,y+.02,z+.149],
        [w*1.1,y-.078,z+.184],[w*.65,y-.103,z+.075],[w*.40,y-.056,z-.008]]);
      bevel(k,crest,i%2?shadow:frame,tier,.034);
      emboss(k,crest,rim,tier.slice(1,5).map(([x,y,z])=>[x+s*.011,y-.012,z-.027]),.011);
    }
  }
  emboss(k,crest,ridge,seals[seal].map(([x,y])=>[x*scale*.51,.028+y*.16,-.092+y*.025]),.012);
  if(!mobile||cut==='imperial')pin(k,crest,'glow',0,.036,-.114,.028);
  animate(parts,({beat,wind,strike,fall})=>{
    crest.rotation.x=Math.sin(beat*.68)*.027+wind*.06-strike*.11+fall*.09;
    crest.rotation.y=(wind-strike)*.06+Math.sin(beat)*.016;
  });
  parts.polishEnergy={tint,anchor:torso,offset:[0,high,back],
    shape:seal==='crack'?'bolts':seal==='water'?'mist':seal==='bones'?'embers':'sigils',
    span:[neck*1.52,.49,.39]};
}

const spiritMasks={
  m063:{fork:[[.037,.159,.224],[.089,.261,.181],[.19,.245,.131],[.131,.383,.038],[.225,.372,-.084]],
    guard:[[.065,-.01,.227],[.18,.048,.151],[.278,.025,.042],[.23,-.107,-.046],[.117,-.217,.19]],
    tint:0xff8045,shape:'embers'},
  m064:{fork:[[.028,.186,.25],[.077,.28,.204],[.182,.332,.1],[.239,.453,-.013],[.249,.498,-.17]],
    guard:[[.062,.10,.22],[.194,.157,.156],[.265,.095,.058],[.219,-.143,-.005],[.082,-.166,.216]],
    tint:0x89ccff,shape:'mist'},
  m065:{fork:[[.064,.153,.213],[.152,.239,.157],[.215,.283,.077],[.337,.244,-.129],[.394,.352,-.181]],
    guard:[[.05,.079,.231],[.198,.15,.133],[.257,.118,.035],[.239,-.086,-.023],[.091,-.214,.189]],
    tint:0x9ace61,shape:'ribbons'},
  m066:{fork:[[.046,.137,.228],[.123,.255,.175],[.18,.211,.131],[.199,.39,.024],[.321,.455,-.137]],
    guard:[[.063,.049,.244],[.211,.117,.144],[.261,.043,.063],[.196,-.173,.087],[.104,-.210,.195]],
    tint:0xf6cd6d,shape:'bolts'},
};

function birdSpirit(k,{head,body},id,mobile){
  const {fork,guard}=spiritMasks[id];
  for(const s of sides){
    bevel(k,head,'bOxide',mirror(s,guard),.033);
    emboss(k,head,'bInlay',mirror(s,guard.map(([x,y,z])=>[x-.002,y,z+.026])),.016);
    const paths=mirror(s,fork.map(([x,y,z],i)=>[x,y,z,[.034,.042,.034,.021,.002][i]]));
    edge(k,head,'bMetal',paths);
    edge(k,head,'bInlay',paths.map(([x,y,z,r])=>[x,y,z+.028,r*.39]));
    const root=[s*.232,.65,-.34];
    const plates=mobile?3:4;
    for(let i=0;i<plates;i++){
      const spread=(1+i*.25)*(id==='m065'?1.18:1);
      const chevron=mirror(s,[[.023,.05-i*.098,.021],[.162*spread,.155-i*.093,-.095],
        [.273*spread,.099-i*.122,-.19],[.219*spread,-.014-i*.109,-.26],[.063,-.011-i*.10,-.106]])
        .map(([x,y,z])=>[x+root[0],y+root[1],z+root[2]]);
      bevel(k,body,i%2?'bMetal':'bOxide',chevron,.035);
      emboss(k,body,i===0?'bInlay':'bTrim',chevron.slice(1).map(([x,y,z])=>[x,y,z-.026]),.015);
    }
  }
}

function tomb(k,parts,entry,mobile){
  const {head,body}=parts,water=entry.id==='m057';
  const plate=water?'cobalt':'jade',light=water?'steel':'ivory';
  const shell=water?'steel':'moss';
  const metal=material(k,plate,'body'),border=material(k,light,'edge'),cover=material(k,shell,'trim');
  const muzzle=k.bone(head,0,-.158,.255);
  const angle=water?.14:-.11;
  for(const s of sides){
    const mask=mirror(s,[[.019,.224,.185],[.116,.227,.127],[.228,.175,.041],[.267,.061,-.037],
      [.249,-.071,.022],[.184,-.123,.226],[.128,-.133,.309],[.071,-.05,.298]]);
    bevel(k,head,metal,mask,.049);
    emboss(k,head,border,mask.map(([x,y,z])=>[x,y,z+.035]),.018);
    const guard=mirror(s,[[.031,.083,.122],[.102,.075,.238],[.148,.027,.237],[.136,-.058,.196],
      [.085,-.101,.114],[.016,-.03,.13]]);
    bevel(k,muzzle,'deep',guard,.034);
    emboss(k,muzzle,cover,guard.slice(1,5).map(([x,y,z])=>[x,y,z+.027]),.012);
    for(let tooth=0;tooth<3;tooth++){
      const x=.057+tooth*.025,z=.21-tooth*.043,y=.017-tooth*.005;
      edge(k,muzzle,border,mirror(s,[[x,y,z,.020],[x+.012,y-.067,z+.016,.014],[x+.008,y-.091,z+.010,.002]]));
    }
    for(let i=0;i<(mobile?3:5);i++){
      const z=.37-i*.217,y=.295-i*.018,x=.13+i*.031;
      const shellPlate=mirror(s,[[.007,y+.09,z+.091],[x,y+.137,z+.086],[x+.153,y+.046,z+.012],
        [x+.166,y-.099,z-.15],[x*1.05,y-.015,z-.211],[.009,y+.019,z-.181]]);
      bevel(k,body,i%2?cover:metal,shellPlate,.045);
      emboss(k,body,border,shellPlate.slice(1,5).map(([x,y,z])=>[x,y+.019,z-.018]),.014);
      pin(k,body,i===0?'glow':border,s*(x+.103),y+.055,z-.031,.026);
    }
  }
  animate(parts,({wind,strike,stage})=>{muzzle.rotation.x=angle+strike*.28-wind*.16+stage*.042;});
  parts.polishEnergy={tint:water?0x86d9ef:0xa4e68d,shape:water?'mist':'ribbons',anchor:body,
    offset:[0,.26,-.22],span:[.61,.32,.82]};
}

function imperialThrone(k,parts,entry,mobile){
  const {head,body}=parts,war=entry.id==='m068';
  const signet=war?'blade':'eye',focal=k.bone(body,0,.46,-.55);
  const finial=war?[[.102,.408,-.142,.048],[.211,.437,-.211,.047],
    [.252,.557,-.263,.032],[.216,.655,-.289,.003]]:
    [[.070,.496,-.114,.028],[.156,.513,-.192,.050],[.226,.520,-.253,.031],[.249,.481,-.291,.003]];
  for(const s of sides){
    volume(k,head,war?'bOxide':'bMetal',mirror(s,finial.map(p=>[...p,p[3]*.63])),mobile);
    emboss(k,head,'bTrim',mirror(s,finial.map(([x,y,z])=>[x,y+.029,z-.026])),.016);
    if(war){
      const eyes=mirror(s,[[.041,.172,.234],[.086,.148,.255],[.159,.171,.182],[.175,.212,.148]]);
      emboss(k,head,'bInlay',eyes,.020);
    }
    for(let i=0;i<(mobile?2:3);i++){
      const y=.056-i*.13,extend=.19+i*.045;
      const sheath=mirror(s,[[.05,y+.172,.023],[extend,y+.205,.071],[extend+.106,y+.109,.005],
        [extend+.139,y-.105,-.02],[extend*.53,y-.073,-.12],[.038,y-.109,-.087]]);
      bevel(k,focal,i%2?'bMetal':'bOxide',sheath,.04);
      emboss(k,focal,'bTrim',sheath.slice(1,6).map(([x,y,z])=>[x,y,z-.029]),.017);
    }
  }
  emboss(k,focal,'glow',seals[signet].map(([x,y])=>[x*.109,y*.159,-.123]),.014);
  animate(parts,({wind,strike,stage})=>{focal.rotation.x=wind*.12-strike*.19+stage*.051;});
  parts.polishEnergy={tint:war?0xfeb655:0xffe3a2,shape:war?'embers':'sigils',anchor:focal,
    offset:[0,.15,-.055],span:[.71,.37,.31]};
}

function emberMask(k,parts,mobile){
  const {head,body}=parts;
  const oldFire=body.children.find(node=>node.position.y===.46&&node.position.z===-.20&&node.position.x===0);
  if(oldFire)oldFire.scale.setScalar(.49);
  const plate=[[-.128,-.012,.202],[-.102,.091,.233],[-.035,.125,.258],
    [0,.195,.208],[.035,.125,.258],[.102,.091,.233],[.128,-.012,.202],
    [.09,-.075,.228],[0,-.178,.274],[-.09,-.075,.228]];
  bevel(k,head,'bOxide',plate,.038);
  for(const s of sides){
    edge(k,head,'bMetal',mirror(s,[[.033,.105,.276,.011],[.081,.106,.264,.028],
      [.119,.056,.256,.028],[.136,-.008,.230,.006]]));
    emboss(k,head,'glow',mirror(s,[[.029,.056,.268],[.066,.071,.282],[.099,.054,.275],[.123,.032,.244]]),.014);
    volume(k,head,'bInlay',mirror(s,[[.048,-.078,.284,.020,.018],[.087,-.102,.288,.034,.021],
      [.13,-.159,.249,.023,.016],[.116,-.209,.201,.006,.004]]),mobile);
    const scar=mirror(s,[[.045,.130,.254],[.081,.174,.213],[.107,.234,.155],[.193,.270,.068]]);
    emboss(k,head,'bInlay',scar,.015);
    pin(k,head,'bBone',s*.079,-.119,.299,.018);
  }
  parts.polishEnergy={tint:0xff8649,shape:'embers',anchor:head,
    offset:[0,.155,-.18],span:[.69,.56,.64]};
}

function nabata(k,parts,entry,mobile){
  const {head,body}=parts;
  const index=Number(entry.id.slice(-1))-5;
  const tint=[0xff7951,0x86dbff,0xffd273,0xa9f6a6][index];
  const crest=[.56,.47,.62,.58][index];
  const reach=[.35,.40,.37,.47][index];
  const design=['bones','water','crack','lotus'][index];
  for(const s of sides){
    const cheek=mirror(s,[[.086,.148,.207],[.137,.218,.139],[.22,.269,.052],[.29,.151,.011],
      [.284,.012,.047],[.219,-.158,.158],[.105,-.197,.237],[.098,-.073,.267]]);
    bevel(k,head,'body',cheek,.031);
    emboss(k,head,'trim',cheek.slice(2).map(([x,y,z])=>[x,y,z+.023]),.015);
    const peak=mirror(s,[[.107,.209,.055,.033],[.194,.274,-.105,.051],[.298,crest*.68,-.208,.061],
      [reach,crest*.90,-.238,.041],[reach*.84,crest,-.287,.003]]);
    volume(k,head,'edge',peak.map(p=>[...p,p[3]*.63]),mobile);
    edge(k,head,'glow',peak.map(([x,y,z,r])=>[x-s*.024,y+.021,z-.022,r*.24]));
    for(let i=0;i<(mobile?2:3);i++){
      const y=.57-i*.13,z=-.29-i*.029;
      const shell=mirror(s,[[.039,y+.13,z],[.301,y+.124,z-.013],[.43,y+.044,z+.105],
        [.35,y-.108,z+.116],[.18,y-.13,z-.06],[.026,y-.088,z-.068]]);
      bevel(k,body,i%2?'body':'edge',shell,.044);
      emboss(k,body,'trim',shell.slice(1,6).map(([x,y,z])=>[x,y,z-.029]),.016);
    }
  }
  emboss(k,body,'glow',seals[design].map(([x,y])=>[x*.116,.45+y*.23,-.432]),.013);
  parts.polishEnergy={tint,shape:['embers','mist','bolts','ribbons'][index],anchor:head,
    offset:[0,.26,-.08],span:[.58,.46,.35]};
}

function pirate(k,parts,_entry,mobile){
  const {head,body}=parts;
  // Thin scarred skin over the existing cheeks. Separate lips, nose and brows
  // keep the front and profile recognizable under oblique stage lighting.
  const flesh='edge',hat='deep',brass='trim',stitch='rind';
  for(const s of sides){
    const cheek=mirror(s,[[.041,-.16,.18,.029,.020],[.068,-.126,.197,.035,.030],
      [.118,-.085,.161,.034,.035],[.13,-.01,.118,.023,.028]]);
    volume(k,head,flesh,cheek,mobile,2.12);
    const eye=mirror(s,[[.035,.028,.177,.008],[.065,.030,.19,.014],[.094,.023,.177,.011],[.113,.014,.162,.004]]);
    edge(k,head,hat,eye);
    pin(k,head,'glow',s*.069,.025,.201,.012);
    emboss(k,head,stitch,mirror(s,[[.026,.066,.196],[.072,.077,.189],
      [.108,.060,.179],[.129,.042,.155]]),.010);
    const brow=mirror(s,[[.021,.068,.196],[.058,.075,.196],[.081,.074,.194],
      [.105,.060,.180],[.133,.073,.15]]);
    emboss(k,head,hat,brow,.012);
    const lash=mirror(s,[[.014,-.098,.204,.013],[.066,-.089,.212,.024],
      [.125,-.123,.199,.017],[.153,-.173,.168,.005]]);
    edge(k,head,stitch,lash);
    const top=mirror(s,[[.084,.268,.213],[.227,.274,.165],[.304,.227,.103],[.292,.170,.072],
      [.191,.155,.172],[.04,.192,.238]]);
    bevel(k,head,hat,top,.037);
    emboss(k,head,brass,top.slice(0,5).map(([x,y,z])=>[x,y+.021,z+.023]),.014);
    const hatback=mirror(s,[[.034,.366,-.067],[.164,.325,-.164],[.239,.247,-.254],[.287,.185,-.205],
      [.196,.149,-.253],[.065,.191,-.306],[0,.282,-.247]]);
    bevel(k,head,hat,hatback,.032);
    emboss(k,head,brass,hatback.slice(0,6).map(([x,y,z])=>[x,y,z-.034]),.015);
    for(let i=0;i<(mobile?3:5);i++){
      const p=.03+i*.032;
      pin(k,head,brass,s*p,.237+i*.003,-.285+i*i*.0021,.014);
    }
    const nape=k.bone(body,s*.294,.66,-.28);
    const button=mirror(s,[[.052,.077,.109],[.131,.102,.021],[.156,.033,-.105],[.089,-.053,-.147],
      [-.051,-.078,-.122],[-.105,.003,-.04],[-.04,.098,.036]]);
    bevel(k,nape,'brocade',button,.041);
    emboss(k,nape,brass,button.map(([x,y,z])=>[x,y+.032,z]),.012);
    pin(k,nape,steel(k),s*.067,.08,-.074,.027);
    for(let i=0;i<3;i++){
      const z=-.165+i*.038,y=.59-i*.147,x=.27+i*.021;
      emboss(k,body,brass,mirror(s,[[.011,y-.045,z-.192],[.11,y,z-.184],
        [x,y+.075,z-.10],[x+.069,y+.095,z+.034]]),.014);
    }
    animate(parts,({beat,wind,strike})=>{nape.rotation.z=s*(Math.sin(beat*.56)*.025+wind*.14-strike*.26);});
  }
  volume(k,head,flesh,[[0,.057,.184,.023,.022],[0,-.008,.209,.029,.028],
    [-.016,-.045,.256,.031,.026],[-.022,-.079,.223,.022,.018]],mobile,2.01);
  emboss(k,head,hat,[[-.099,-.137,.193],[-.051,-.148,.218],[.008,-.145,.226],[.057,-.154,.218],[.096,-.136,.197]],.010);
  emboss(k,head,brass,[[-.14,-.006,.147],[-.10,-.023,.162],[-.065,-.045,.191],[-.065,-.086,.187]],.009);
  parts.polishEnergy={tint:0xffa259,shape:'embers',anchor:body,offset:[-.65,.54,.23],span:[.61,.42,.54]};
}

function evilDragon(k,parts,_entry,mobile){
  const {body}=parts;
  const head=body.userData.dragonHead,neck=head.parent,jaw=k.bone(head,0,-.167,.355);
  const oldHorn=material(k,'oldBone','edge');
  // Replace the read of the old flat snout with a multi-lobed nasal ridge.
  volume(k,head,'body',[[0,.10,.270,.138,.130],[0,.016,.398,.188,.117],[0,-.065,.584,.173,.102],
    [.006,-.113,.737,.140,.089],[.006,-.156,.796,.102,.038]],mobile,2.06);
  volume(k,jaw,'deep',[[0,-.043,-.130,.125,.057],[0,-.080,.033,.148,.07],[0,-.075,.205,.150,.056],
    [.009,-.049,.358,.123,.041],[.015,-.024,.401,.071,.027]],mobile,2.58);
  for(const s of sides){
    const muzzle=mirror(s,[[.021,-.011,.568],[.145,.076,.519],[.212,.014,.443],[.259,-.058,.367],
      [.212,-.181,.504],[.126,-.172,.731],[.070,-.145,.762]]);
    bevel(k,head,'body',muzzle,.031);
    const nostril=mirror(s,[[.033,-.094,.774],[.082,-.075,.790],[.125,-.101,.775],[.102,-.129,.788],[.049,-.136,.792]]);
    bevel(k,head,'deep',nostril,.028);
    emboss(k,head,oldHorn,mirror(s,[[.032,-.069,.774],[.088,-.042,.793],[.135,-.071,.757]]),.016);
    const brow=mirror(s,[[.094,.159,.470,.036],[.218,.205,.475,.064],[.322,.225,.345,.074],
      [.431,.212,.190,.049],[.46,.126,.090,.014]]);
    edge(k,head,'edge',brow);
    emboss(k,head,'trim',mirror(s,[[.134,.138,.473],[.227,.123,.487],[.285,.141,.433],[.339,.163,.367]]),.020);
    const mantle=mirror(s,[[.18,.164,.172],[.334,.268,-.006],[.471,.274,-.166],
      [.443,.058,-.246],[.324,-.088,-.207],[.282,-.141,-.053],[.311,-.085,.109],[.219,.052,.236]]);
    bevel(k,head,'body',mantle,.056);
    emboss(k,head,oldHorn,mantle.slice(1,7).map(([x,y,z])=>[x+s*.025,y+.013,z+.002]),.022);
    for(let i=0;i<(mobile?3:4);i++){
      const p=i*.069,x=.127-p*.38,z=.243+p;
      volume(k,jaw,oldHorn,mirror(s,[[x,-.042,z,.026,.022],[x+.003,.021,z+.022,.019,.017],
        [x*.94,.078,z+.012,.003,.004]]),true,1.95);
    }
    const crest=mirror(s,[[.179,.344,-.068,.063],[.317,.444,-.197,.092],
      [.463,.619,-.315,.087],[.49,.813,-.372,.051],[.466,.966,-.473,.004]]);
    edge(k,head,'body',crest);
    emboss(k,head,'trim',crest.map(([x,y,z])=>[x+s*.072,y+.012,z-.004]),.026);
    for(let i=0;i<(mobile?3:6);i++){
      const y=1.27-i*.197,z=-.093-i*.029;
      const gusset=mirror(s,[[.15,y+.048,z+.049],[.304,y+.138,z-.04],[.391,y+.067,z-.211],
        [.344,y-.054,z-.287],[.203,y-.13,z-.271],[.116,y-.065,z-.145]]);
      bevel(k,neck,i%2?'body':'edge',gusset,.043);
      emboss(k,neck,i%2?'trim':'body',gusset.slice(1,6).map(([x,y,z])=>[x+s*.03,y,z-.029]),.014);
    }
    for(let i=0;i<(mobile?2:4);i++){
      const yaw=.11+i*.089,span=.47+i*.093;
      edge(k,head,i%2?'trim':'edge',mirror(s,[[.247,yaw,-.293,.027],[.353,yaw+.045,-.345,.049],
        [span,yaw+.071,-.477,.042],[span*1.08,yaw-.013,-.628,.006]]));
    }
  }
  for(let i=0;i<5;i++){
    const y=.32+i*.176,z=-.41+i*.019;
    edge(k,neck,i%2?'trim':'edge',[[0,y,z,.052],[.015,y+.19,z-.127,.069],[.003,y+.32,z-.248,.044],
      [.016,y+.389,z-.352,.004]]);
  }
  animate(parts,({wind,strike,stage})=>{jaw.rotation.x=.045+wind*.37+strike*.62+stage*.12;});
  parts.polishEnergy={tint:0x90ddff,shape:'ribbons',anchor:head,offset:[0,-.10,.57],span:[.93,.57,.83]};
}

function hydra(k,parts,_entry,mobile){
  const {body}=parts;
  const heads=body.children.map(node=>node.children.find(child=>child.position.y>.50)).filter(Boolean);
  for(const [i,head] of heads.entries()){
    const p=i%3;
    for(const s of sides){
      const h=.182+p*.018;
      const temple=mirror(s,[[.018,h,.171],[.094,h+.032,.062],[.182,h+.014,-.02],[.217,h-.086,-.108],
        [.162,h-.127,.057],[.094,h-.107,.184],[.056,h-.118,.239]]);
      bevel(k,head,'bOxide',temple,.026);
      emboss(k,head,'bInlay',temple.slice(0,6).map(([x,y,z])=>[x,y,z+.028]),.011);
      const spur=mirror(s,[[.169,.105,-.102,.038],[.216,.172,-.211,.061],
        [.267,.178+p*.045,-.278,.046],[.291,.193+p*.048,-.408,.004]]);
      edge(k,head,'bBone',spur);
      const eye=p===0?'glow':'bInlay',z=.196+.008*(i%2);
      pin(k,head,eye,s*.128,.075,z,.025);
    }
  }
  const rows=mobile?4:7;
  for(let i=0;i<rows;i++){
    const z=.02-i*.173,w=.30-i*.019,y=.58-i*.014;
    const guard=[[-w,y,z+.091],[0,y+.134,z+.091],[w,y,z+.091],[w*.71,y-.024,z-.14],
      [0,y+.021,z-.196],[-w*.73,y-.062,z-.128]];
    bevel(k,body,i%2?'bMetal':'bOxide',guard,.042);
    emboss(k,body,i%3?'bInlay':'bTrim',[guard[0],guard[1],guard[2]].map(([x,y,z])=>[x,y+.034,z+.010]),.022);
  }
  parts.polishEnergy={tint:0xe56f4c,shape:'embers',anchor:body,offset:[0,.91,.46],span:[1.38,.88,.98]};
}

function seaStar(k,parts,entry,mobile){
  const {head}=parts,sun=entry.id==='m096',hub=head.parent;
  const ring=k.bone(head,0,0,.08),count=sun?10:7;
  for(let i=0;i<count;i++){
    const segment=k.bone(ring,0,0,0);
    segment.rotation.z=i*Math.PI*2/count;
    const jaw=[[.019,.165,.022],[.090,.213,.012],[.115,.149,.015],
      [.075,.092,.052],[.019,.055,.064],[-.012,.081,.040]];
    bevel(k,segment,sun?'bMetal':'bOxide',jaw,.038);
    edge(k,segment,sun?'bBone':'bMetal',[[.092,.181,.046,.022],[.067,.123,.063,.027],
      [.028,.085,.075,.021],[.006,.057,.07,.003]]);
    pin(k,segment,'bInlay',.077,.193,.041,.014);
    const back=k.bone(hub,0,0,-.147);
    back.rotation.z=i*Math.PI*2/count;
    const spine=[[-.096,.288,-.019],[.019,.403,-.037],[.122,.312,-.025],
      [.102,.222,-.042],[.022,.154,-.047],[-.083,.200,-.034]];
    bevel(k,back,i%2?'bMetal':'bOxide',spine,.036);
    emboss(k,back,'bTrim',spine.slice(1,5).map(([x,y,z])=>[x,y,z-.020]),.013);
    if(!mobile)pin(k,back,'bInlay',.035,.246,-.079,.018);
  }
  animate(parts,({beat,wind,strike,stage})=>{
    ring.rotation.z=beat*(sun?.13:-.1)+strike*.32;
    ring.scale.setScalar(1+wind*.26+strike*.37+stage*.15);
  });
  parts.polishEnergy={tint:sun?0xffb356:0xd084e5,shape:sun?'embers':'ribbons',anchor:head,
    offset:[0,0,.16],span:[.62,.62,.34]};
}

function frozen(k,parts,_entry,mobile){
  const {pao,head,body}=parts;
  for(const s of sides){
    const crack=mirror(s,[[.071,.205,.262],[.113,.261,.221],[.101,.327,.178],[.163,.36,.141],
      [.183,.448,.056],[.264,.496,-.057],[.246,.561,-.121]]);
    emboss(k,head,'cyan',crack,.017);
    const crystal=mirror(s,[[.152,.219,.067,.035],[.237,.372,-.015,.062],[.272,.594,-.116,.044],
      [.383,.639,-.271,.023],[.40,.713,-.276,.002]]);
    volume(k,head,'oldBone',crystal.map(p=>[...p,p[3]*.75]),mobile,2.33);
    edge(k,head,'cyan',crystal.map(([x,y,z,r])=>[x,y,z+.028,r*.31]));
    const wing=pao.wings[s<0?0:1];
    for(let i=0;i<(mobile?2:4);i++){
      const x=.24+i*.146,h=.32+i*.094,z=-.107-i*.041;
      const root=mirror(s,[[x-.031,h-.076,z+.054],[x+.078,h+.076,z-.016],[x+.163,h+.039,z-.109],
        [x+.133,h-.096,z-.189],[x+.019,h-.163,z-.149],[x-.041,h-.089,z-.024]]);
      bevel(k,wing,i%2?'wingEdge':'body',root,.033);
      emboss(k,wing,'cyan',root.slice(1,5).map(([x,y,z])=>[x,y,z-.021]),.011);
    }
  }
  parts.polishEnergy={tint:0x98eeff,shape:'mist',anchor:body,offset:[0,.59,-.32],span:[1.18,.77,.62]};
}

function beast(k,parts,entry,mobile){
  const {body,head}=parts,tiger=entry.id==='m108';
  for(const s of sides){
    const a=tiger?.99:1.19;
    const cheek=mirror(s,[[.047,.073,.283],[.132,.157,.241],[.25*a,.147,.095],[.308*a,.050,-.019],
      [.286*a,-.099,.02],[.161*a,-.171,.181],[.111,-.119,.250]]);
    bevel(k,head,tiger?'bOxide':'bMetal',cheek,.046);
    emboss(k,head,'bBone',cheek.slice(1,6).map(([x,y,z])=>[x,y,z+.031]),.013);
    const brow=mirror(s,[[.05,.129,.302,.033],[.142,.172,.305,.048],[.236,.172,.22,.058],
      [.304,.124,.107,.031],[.318,.061,.041,.004]]);
    edge(k,head,tiger?'bFur':'bBone',brow);
    for(let i=0;i<(mobile?3:4);i++){
      const y=.56-i*.115,w=.44+i*.023,z=tiger?-.45:-.53;
      const keel=mirror(s,[[.09,y+.126,z+.022],[.331,y+.095,z-.038],[w,y+.014,z+.009],
        [w*1.13,y-.159,z+.109],[.21,y-.095,z-.171],[.059,y-.031,z-.166]]);
      bevel(k,body,i%2?'bMetal':'bOxide',keel,.057);
      emboss(k,body,tiger?'bBone':'bTrim',keel.slice(1,6).map(([x,y,z])=>[x,y,z-.031]),.026);
    }
  }
  parts.polishEnergy={tint:tiger?0x8bdaff:0xf88b6e,shape:tiger?'ribbons':'embers',anchor:head,
    offset:[0,.05,-.18],span:[.72,.48,.55]};
}

const specials={m057:tomb,m058:tomb,m085:nabata,m086:nabata,m087:nabata,m088:nabata,
  m095:seaStar,m096:seaStar,m098:frozen,m103:hydra,m106:evilDragon,m107:pirate,m108:beast,m111:beast};

export function polishBossB(k,parts,entry,mobile){
  const special=specials[entry.id],profile=court[entry.id];
  if(!special&&!profile)return false;
  // Pao's base mesh is already merged with its own sculpt queue.
  const sculpt=k.sculpt??sculptPao(k);
  const work=k.sculpt?k:{...k,sculpt};
  if(special)special(work,parts,entry,mobile);
  else{
    courtModel(work,parts,entry,mobile,profile);
    if(entry.id in spiritMasks){
      birdSpirit(work,parts,entry.id,mobile);
      const {tint,shape}=spiritMasks[entry.id];
      parts.polishEnergy={tint,shape,anchor:parts.head,offset:[0,.21,-.04],span:[.55,.42,.34]};
    }
    if(entry.id==='m067'||entry.id==='m068')imperialThrone(work,parts,entry,mobile);
    if(entry.id==='m081')emberMask(work,parts,mobile);
  }
  if(!k.sculpt)sculpt.finish(k.geometry);
  return true;
}
