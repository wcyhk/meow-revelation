import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=nightforge-1';
import {KoreanBossArt} from './korean-art.mjs?v=pao-1';
import {buildPao,paoForms,posePao} from './pao-model.mjs?v=pao-geometry-1';
import {paoMaterials,forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {creatureFace,detailCreature,poseCreatureDetail,creatureAura} from './creature-detail.mjs?v=nightforge-1';
import {sculptPao} from './pao-sculpt.mjs?v=nightforge-1';

const PI=Math.PI,TAU=PI*2;
const shapes={
  pearl:new T.IcosahedronGeometry(1,1), round:new T.SphereGeometry(1,13,9),
  horn:new T.ConeGeometry(1,1,9), metal:new T.BoxGeometry(1,1,1),
  bar:new T.CylinderGeometry(1,1,1,8), gem:new T.OctahedronGeometry(1),
  ring:new T.TorusGeometry(1,.075,6,28), chain:new T.TorusGeometry(1,.15,6,12),
};
const mantle=new T.Shape().moveTo(-.12,.15).bezierCurveTo(.13,.22,.57,.14,.84,.03)
  .quadraticCurveTo(.98,-.37,.92,-.71).lineTo(.70,-1.02).lineTo(.55,-.92).lineTo(.34,-1.10)
  .lineTo(.23,-1.00).lineTo(.03,-1.08).quadraticCurveTo(-.13,-.53,-.12,.15);
shapes.mantle=new T.ExtrudeGeometry(mantle,{depth:.058,bevelEnabled:true,bevelSize:.022,bevelThickness:.024,bevelSegments:1,curveSegments:5});
const scalePlate=new T.Shape().moveTo(0,.48).quadraticCurveTo(.43,.47,.56,.18)
  .quadraticCurveTo(.52,-.21,0,-.57).quadraticCurveTo(-.52,-.21,-.56,.18).quadraticCurveTo(-.43,.47,0,.48);
shapes.scale=new T.ExtrudeGeometry(scalePlate,{depth:.067,bevelEnabled:true,bevelThickness:.095,bevelSize:.080,bevelSegments:1,curveSegments:4});
const wing=new T.Shape().moveTo(0,0).lineTo(.28,.63).lineTo(.86,1.04).lineTo(1.34,.82)
  .lineTo(2.22,.93).lineTo(1.95,.48).lineTo(1.65,.34).lineTo(1.49,-.04).lineTo(1.1,.17)
  .lineTo(.88,-.16).lineTo(.48,.03).lineTo(.25,-.25).lineTo(0,0);
shapes.wing=new T.ExtrudeGeometry(wing,{depth:.07,bevelSize:.035,bevelThickness:.025,bevelSegments:1,steps:1});
const up=new T.Vector3(0,1,0);
const palettes={
  amber:[0x3b2826,0x975d36,0xdec49a,0xffc270], gold:[0x423628,0xaf833a,0xffd383,0xffedac],
  ember:[0x321c28,0xac4733,0xe7a166,0xff6c36], blood:[0x39232d,0x823144,0xc98b83,0xff5f80],
  jade:[0x1f3435,0x4f7862,0xcee0a8,0xb0e78b], moss:[0x303228,0x6b7950,0xcac294,0xaad185],
  teal:[0x1c303d,0x3a7b85,0xa6d9d7,0x74f7db], frost:[0x233953,0x527ba6,0xe4f4ff,0xa4d9ff],
  bone:[0x37343d,0x847b8a,0xe8dccd,0xefe3b9], violet:[0x332b49,0x766395,0xd4b9eb,0xe2aefa],
  void:[0x24202e,0x534565,0xbe9cc3,0xec9dff], venom:[0x242e25,0x5b7940,0xc7d778,0xc2f26a],
};
const poses={serpent:'coil',hydra:'coil',dragon:'wing',bird:'wing',wasp:'flutter',beast:'gallop',turtle:'bulwark',
  star:'radial',eggs:'radial',spider:'crawl',shade:'hover',priest:'hover',straw:'sway',ogre:'slam',duelist:'duel',
  rider:'gallop',emperor:'duel',captain:'aim'};
const referencePalettes={
  m001:[0x322326,0x725351,0xe4c5ad,0xff9f42],m002:[0x241827,0x28592c,0xe5c6a0,0xeb61ce],
  m004:[0x193236,0x46675c,0xb9cdc5,0x8ff1ee],
  m005:[0x312a2d,0x716966,0xddd8ce,0xf04f24],
  m014:[0x19253a,0x474d72,0xa2acc8,0xff6228],
  m015:[0x68271d,0xb44b23,0xffd74d,0xfff4c1],
  m008:[0x3b362c,0x416647,0xe7d6ab,0xa3d49a],m022:[0x2c2628,0x646169,0xded8cc,0xa9e7ff],
  m024:[0x282e29,0x5a5d60,0xb8a465,0xb7d85b],
  m025:[0x141823,0x273752,0xe0d9cc,0x8af3e7],m026:[0x10141c,0x233547,0xf0e4cc,0x66ffee],
  m021:[0x312b29,0x9f3220,0xf0dcbd,0x78d4c9],m027:[0x2b2224,0x684433,0xad7e60,0xf46847],
  m016:[0x3d322e,0x9b7143,0xe4d3ac,0xffa35a],m017:[0x332a23,0x8c826e,0xe4b85f,0xffcf69],
  m019:[0x224756,0x6cabad,0xe0ecea,0x9eeaff],
  m081:[0x231b24,0x583934,0xe58a55,0xff6d27],m107:[0x231e28,0x903127,0xcc9b63,0xf88d45],
  m121:[0x352b2d,0x684739,0xceae87,0xffb859],
  m150:[0x3e2118,0xa6633d,0xf3d6a9,0xff793e],m151:[0x1b2210,0x556427,0xc1ba53,0xd7f277],
  m152:[0x142331,0x215b7b,0x46b7bd,0xff9674],m153:[0x14151a,0x252731,0x655c79,0xa99cd4],
  m154:[0x231e23,0x46362c,0xae8c6b,0xf77744],m155:[0x2a191d,0xc28646,0xf3cd8b,0xff653c],
  m156:[0x432729,0x936247,0xddb480,0xe6884e],m157:[0x282531,0x963c4b,0xce9e79,0x81dde8],
  m158:[0x332f3b,0x647783,0xd7e3ea,0xec8067],
  m101:[0x211b25,0x793e26,0xeac396,0xff8e36],m106:[0x182d47,0x354f69,0x8fbad2,0xff773e],
  m124:[0x4a2921,0x83553b,0xe9dcc4,0xffad42],m125:[0x192b24,0x345543,0xdedbd0,0xffbb3d],
  m091:[0x1c332b,0x187c58,0xd2b368,0x66ff82],m092:[0x392922,0x94642d,0xffce63,0xffdf4c],
  m085:[0x211a1c,0x6f3b2a,0xdcaa6e,0xff6e2a],m086:[0x1c252f,0x405771,0xbcaa76,0x55caff],
  m087:[0x26251b,0x6f662e,0xe3c96e,0xffe07b],m088:[0x18241c,0x455939,0xc2a772,0x92ff58],
  m090:[0x202e43,0x386ab4,0xc4af76,0x4ab8ff],
  m117:[0x272330,0x8d3c27,0xf7e6d4,0x88d7ff],
  m114:[0x2a2b28,0x917145,0xfce5b2,0xffd977],m119:[0x263039,0x6c5e4a,0xeadbc8,0xff975e],
  m122:[0x24292d,0x516568,0xeac277,0x75d4cf],m149:[0x25353a,0x596468,0xb7cacf,0x72dcfe],
  m109:[0x38252b,0x996141,0xf5d8a0,0xffb34c],m148:[0x162033,0x3d536e,0x93adc3,0x58cfff],
  m115:[0x39291d,0xa27434,0xf5d27a,0xffbf49],
  m133:[0x26272d,0x9c4d32,0xe4bc71,0xffcd6f],
  'trial-jing-light':[0x493235,0x777078,0xc9bfba,0xffad83],
  'trial-jing-dark':[0x161217,0x413139,0x7e5252,0xff8064],
  'trial-shang-light':[0x303943,0x778d9f,0xc7dde8,0xa2d9ff],
  'trial-shang-dark':[0x121523,0x222c49,0x54638e,0x739eff],
  'trial-kai-light':[0x253531,0x758b7d,0xb4c8ad,0xbef29c],
  'trial-kai-dark':[0x101915,0x25392d,0x60744d,0x8ed67a],
  m093:[0x4d493b,0x8e8167,0xd3c7a8,0xffdf85],
  m094:[0x181715,0x383229,0x746249,0xe7ba56],
};
const computedPalettes=new WeakMap();
const colors=entry=>{
  if(entry.palette)return entry.palette;
  if(computedPalettes.has(entry))return computedPalettes.get(entry);
  const raw=KoreanBossArt[entry.id]?.[1];
  const painted=referencePalettes[entry.id];
  if(!raw)return painted??palettes[entry.tone];
  const result=painted?raw.map((color,index)=>index===3?painted[index]:
    new T.Color(painted[index]).lerp(new T.Color(color),.37).getHex()):[...raw.slice(0,3),palettes[entry.tone][3]];
  computedPalettes.set(entry,result);
  return result;
};
const trialWeapons={'trial-jing':'halberd','trial-shang':'swords','trial-kai':'bow',
  m004:'pennant',m090:'swords',m091:'windmace',m092:'spear',m093:'spear',m094:'spear'};
const trialType=id=>trialWeapons[id]??trialWeapons[id.replace(/-(light|dark)$/,'')];
let surface;

function relief(){
  if(surface)return surface;
  const size=64, values=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const grain=15*Math.sin(x*.81+Math.cos(y*.24)*2)+8*Math.cos(y*.88+x*.19)+((x*127+y*83)%17);
    values[i]=values[i+1]=values[i+2]=128+grain;
    values[i+3]=255;
  }
  surface=new T.DataTexture(values,size,size);
  surface.wrapS=surface.wrapT=T.RepeatWrapping;
  surface.magFilter=T.LinearFilter;surface.minFilter=T.LinearFilter;
  surface.needsUpdate=true;
  return surface;
}

function buildMaterials(entry){
  if(paoForms.has(entry.id))return paoMaterials(entry.id==='m026',colors(entry));
  const [dark,body,edge,glow]=colors(entry);
  const ethereal=['priest','shade','serpent','hydra','star'].includes(entry.family);
  const chitin=['turtle','wasp','spider','dragon','beast'].includes(entry.family);
  const metal=['iron','bronze'].includes(entry.finish)||['duelist','emperor','captain','rider'].includes(entry.family);
  const finish=entry.finish==='wood'?'hide':entry.finish;
  const surface=(color,metalness,roughness,finish)=>paintedFinish(new T.MeshStandardMaterial({
    color,metalness,roughness,bumpMap:relief(),bumpScale:chitin?.062:.043,emissive:color,emissiveIntensity:.07,
    envMap:metalness>.24?forgeEnvironment():null,envMapIntensity:metal?.74:.38,
  }),finish);
  const pigment=color=>new T.Color(color).lerp(new T.Color(0x5d5049),.20);
  const trim=new T.Color(edge).lerp(new T.Color(0xb48556),.52);
  const finishes={
    deep:surface(pigment(dark),metal?.31:.07,ethereal?.62:.88,'cloth'),
    body:surface(pigment(body),metal?.52:chitin?.27:.10,metal?.43:chitin?.48:.75,finish??(metal?'iron':chitin?'stone':'hide')),
    edge:surface(pigment(edge),metal?.56:.17,.47,metal?'iron':'bone'),
    trim:surface(trim,.45,.43,'bronze'),
    glow:new T.MeshBasicMaterial({color:glow}),
  };
  if(entry.id==='m151')finishes.membrane=new T.MeshStandardMaterial({
    color:0xaaa764,roughness:.72,transparent:true,opacity:.68,depthWrite:false,side:T.DoubleSide,
  });
  if(entry.id==='m150')finishes.copper=surface(0xb7693d,.52,.39,'bronze');
  if(entry.id==='m154')finishes.iron=surface(0x4c4745,.66,.41,'iron');
  if(entry.id==='m133')finishes.mist=new T.MeshStandardMaterial({
    color:0xc5bdbc,emissive:0x726d6a,emissiveIntensity:.36,roughness:1,transparent:true,opacity:.54,depthWrite:false,
  });
  return finishes;
}

function kit(root,materials){
  const lists=new Map();
  const identity=new T.Matrix4();
  function geometry(part,finish,geo){
    if(!lists.has(part))lists.set(part,new Map());
    lists.get(part).set(geo,{geo,finish,parts:[identity]});
  }
  function mesh(part,shape,finish,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
    const item=new T.Object3D();
    item.position.set(x,y,z);
    item.rotation.set(rx,ry,rz);
    item.scale.set(sx,sy,sz);
    item.updateMatrix();
    const key=shape+'/'+finish;
    if(!lists.has(part))lists.set(part,new Map());
    const groups=lists.get(part);
    if(!groups.has(key))groups.set(key,{shape,finish,parts:[]});
    groups.get(key).parts.push(item.matrix);
  }
  function rod(part,finish,a,b,r,shape='bar'){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),axis=end.clone().sub(start);
    const item=new T.Object3D();
    item.position.copy(start).lerp(end,.5);
    item.quaternion.setFromUnitVectors(up,axis.clone().normalize());
    item.scale.set(r,axis.length(),r);
    item.updateMatrix();
    const key=shape+'/'+finish;
    if(!lists.has(part))lists.set(part,new Map());
    const groups=lists.get(part);
    if(!groups.has(key))groups.set(key,{shape,finish,parts:[]});
    groups.get(key).parts.push(item.matrix);
  }
  function bone(parent,x,y,z){
    const limb=new T.Group();
    limb.position.set(x,y,z);
    parent.add(limb);
    return limb;
  }
  const vertex=new T.Vector3(),normal=new T.Vector3(),normalMatrix=new T.Matrix3();
  function finish(){
    for(const [part,groups] of lists){
      const finishes=new Map();
      for(const batch of groups.values()){
        if(!finishes.has(batch.finish))finishes.set(batch.finish,[]);
        finishes.get(batch.finish).push(batch);
      }
      for(const [finish,batches] of finishes){
        const count=batches.reduce((total,batch)=>{
          const geo=batch.geo??shapes[batch.shape];
          return total+(geo.index?.count??geo.attributes.position.count)*batch.parts.length;
        },0);
        const positions=new Float32Array(count*3), normals=new Float32Array(count*3), uv=new Float32Array(count*2);
        let cursor=0;
        for(const batch of batches){
          const geo=batch.geo??shapes[batch.shape];
          const {position,normal:direction,uv:tex}=geo.attributes;
          for(const transform of batch.parts){
            normalMatrix.getNormalMatrix(transform);
            const flipped=transform.determinant()<0;
            const vertices=geo.index?.count??position.count;
            for(let index=0;index<vertices;index++){
              const winding=flipped?(index%3===1?index+1:index%3===2?index-1:index):index;
              const source=geo.index?geo.index.getX(winding):winding;
              vertex.fromBufferAttribute(position,source).applyMatrix4(transform).toArray(positions,cursor*3);
              normal.fromBufferAttribute(direction,source).applyNormalMatrix(normalMatrix).toArray(normals,cursor*3);
              uv[cursor*2]=tex.getX(source);uv[cursor*2+1]=tex.getY(source);
              cursor++;
            }
          }
          batch.geo?.dispose();
        }
        const geo=new T.BufferGeometry();
        geo.setAttribute('position',new T.BufferAttribute(positions,3));
        geo.setAttribute('normal',new T.BufferAttribute(normals,3));
        geo.setAttribute('uv',new T.BufferAttribute(uv,2));
        part.add(new T.Mesh(geo,materials[finish]));
      }
    }
  }
  return {root,mesh,rod,bone,finish,geometry,materials};
}

function face(k,joint,options={}){
  const {mesh,rod}=k;
  const {snout=.36,broad=.39,horns=2,shell=false,reptile=false,bear=false}=options;
  mesh(joint,'pearl','body',0,.052,0,broad,reptile?.33:.47,.43);
  if(reptile){
    mesh(joint,'scale','body',0,-.101,.35,broad*1.56,.285,snout*3.0,-.40);
    mesh(joint,'pearl','deep',0,-.143,.41,broad*.71,.043,snout*.87);
    mesh(joint,'pearl','edge',0,-.199,.38,broad*.60,.095,snout*.75);
    mesh(joint,'scale','trim',0,.227,.393,broad*.58,.15,.46,-.38);
  }else{
    mesh(joint,'pearl','edge',0,-.16,.25,broad*.75,.30,snout);
    mesh(joint,'pearl','deep',0,-.2,.37,broad*.63,.13,snout*.75);
  }
  for(const side of [-1,1]){
    const eye=reptile?.505:.399;
    mesh(joint,'round','deep',side*broad*.61,.085,eye-.052,.106,.092,.072,0,0,side*.21);
    mesh(joint,'gem','glow',side*broad*.61,.10,eye,.067,.043,.027,0,0,side*.19);
    rod(joint,'trim',[side*broad*.38,.148,eye+.008],[side*broad*.88,.159,eye-.02],.023);
    mesh(joint,reptile?'scale':'pearl',shell?'edge':'body',side*broad*.79,.025,.218,.17,.25,.45,0,side*.54,side*.34);
    if(!bear)rod(joint,'edge',[side*broad*.48,-.21,.37],[side*broad*.43,-.41,.43],.068,'horn');
  }
  if(horns===1)k.sculpt.sweep(joint,'edge',[[.04,.31,.075,.153],[.008,.46,.09,.125],[-.002,.62,.047,.084],
    [.043,.81,-.095,.039],[.105,.85,-.194,.004]],{sides:9,steps:14,ridge:.21});
  creatureFace(k,joint,{snout,broad,reptile,horns,bear});
}

function blade(k,hand,crest,huge=false){
  const {mesh,rod}=k;
  const length=huge?1.54:1.03;
  rod(hand,'deep',[0,-.08,-.20],[0,-.08,.37],.067);
  mesh(hand,'gem','glow',0,-.08,.26,.10,.12,.10);
  if(['axe','cleaver','cannon','magma'].includes(crest)){
    mesh(hand,crest==='cannon'?'bar':'gem','edge',0,-.15,.56,crest==='cannon'?.18:.28,.47,.34,crest==='cannon'?PI/2:0,0,.35);
  }else if(['spear','lancer','trident','staff','banner'].includes(crest)){
    rod(hand,'body',[0,-length*.64,-.48],[0,length*.62,.46],.067);
    for(const side of crest==='trident'?[-1,0,1]:[0]){
      rod(hand,'edge',[side*.17,length*.35,.41],[side*.21,length*.81,.65],.125,'horn');
    }
    if(crest==='banner')mesh(hand,'wing','body',0,.53,.44,.35,.36,.17,0,0,-.24);
  }else{
    mesh(hand,'gem','edge',0,-.17,.74,.12,.17,length*.54,0,.08,.14);
    mesh(hand,'gem','body',0,-.12,.66,.063,.098,length*.50);
    mesh(hand,'bar','edge',0,-.09,.31,.071,.40,.07,0,0,PI/2);
  }
}

function trialWeapon(k,hand,weapon){
  const {mesh,rod}=k;
  if(weapon==='swords'){
    for(const side of [-1,1]){
      rod(hand,'deep',[side*.29,-.14,-.08],[side*.31,.04,.32],.046);
      mesh(hand,'metal','trim',side*.31,.04,.31,.24,.056,.08);
      rod(hand,'edge',[side*.31,.04,.32],[side*.88,.30,1.49],.095,'horn');
      rod(hand,'glow',[side*.32,.06,.42],[side*.79,.28,1.36],.016,'horn');
    }
    return;
  }
  if(weapon==='bow'){
    const limb=[[.20,-.79,0],[-.23,-.52,.09],[-.32,-.26,.13],[-.20,0,.14],[-.32,.26,.13],[-.23,.52,.09],[.20,.79,0]];
    for(let i=1;i<limb.length;i++)rod(hand,i%2?'body':'edge',limb[i-1],limb[i],.042);
    rod(hand,'trim',limb[0],limb.at(-1),.014);
    return;
  }
  if(weapon==='windmace'){
    rod(hand,'trim',[.09,-.70,-.10],[-.16,1.16,.43],.058);
    mesh(hand,'chain','edge',-.16,1.16,.43,.19,.20,.23);
    mesh(hand,'gem','glow',-.16,1.20,.49,.13,.17,.13);
    for(const side of [-1,1])rod(hand,'edge',[side*.04-.16,1.02,.45],[side*.20-.16,1.38,.45],.039,'horn');
    return;
  }
  rod(hand,'deep',[.02,-.47,-.23],[-.18,.69,.38],.053);
  if(weapon==='spear'||weapon==='pennant'){
    rod(hand,'body',[.04,-.95,-.48],[-.25,.94,.53],.050);
    rod(hand,'edge',[-.20,.78,.43],[-.39,1.50,.88],.135,'horn');
    rod(hand,'glow',[-.20,.84,.48],[-.36,1.44,.84],.024,'horn');
    mesh(hand,'gem','trim',-.22,.88,.52,.13,.20,.12);
    if(weapon==='pennant')mesh(hand,'mantle','glow',-.30,.96,.49,.27,.29,.44,.23,.37,-.92);
    return;
  }
  mesh(hand,'mantle','body',-.25,.81,.41,.22,.51,1.3,.27,-.27,-1.31);
  rod(hand,'edge',[-.08,.76,.40],[-.60,1.11,.49],.098,'horn');
}

function humanoid(k,entry){
  const {root,bone,mesh,rod}=k;
  const huge=['ogre','straw'].includes(entry.family);
  const royal=entry.family==='emperor';
  const mage=entry.family==='priest'||entry.family==='shade';
  const width=huge?.63:royal?.53:.44;
  const body=bone(root,0,1.05,0);
  mesh(body,'pearl','deep',0,.04,0,width*.84,.54,.35);
  mesh(body,'pearl','body',0,.48,0,width,.66,.38);
  mesh(body,'gem','trim',0,.57,.41,width*.57,.38,.114);
  mesh(body,'gem','deep',0,.57,.47,width*.49,.31,.079);
  mesh(body,'gem','glow',0,.59,.54,.084,.135,.035);
  mesh(body,'bar','deep',0,.17,.018,width*.94,.15,.374);
  mesh(body,'gem','trim',0,.18,.38,.092,.105,.056);
  const head=bone(body,0,1.08,.03);
  const occult=entry.id==='m153', court=entry.id==='m008';
  if(occult){
    mesh(head,'pearl','deep',0,.13,0,.52,.62,.51);
    mesh(head,'mantle','body',-.14,.54,.20,.66,.82,.58,.39,0,-.24);
    mesh(head,'scale','deep',0,-.02,.41,.53,.41,.76);
    for(const side of [-1,1])mesh(head,'gem','glow',side*.16,.04,.49,.035,.023,.028);
  }else face(k,head,{broad:court?.28:width*.62,snout:court?.11:.22,horns:entry.crest==='oni'?1:huge&&entry.id!=='m005'?2:0,bear:entry.id==='m005'});
  if(court){
    const train=bone(body,0,.28,-.14);
    mesh(head,'scale','trim',0,.45,.06,.50,.45,1.08,0,0,.06);
    mesh(head,'round','body',0,.47,-.07,.43,.18,.34);
    for(const side of [-1,1]){
      mesh(body,'mantle','edge',side*.07,.48,-.14,side*.63,1.33,1.30,-.18,-side*.44,0);
      mesh(train,'mantle','body',side*.09,0,.06,side*.83,1.14,1.43,.24,-side*.44,0);
      mesh(train,'mantle','trim',side*.11,-.04,.35,side*.32,1.18,.79,-.21,-side*.25,0);
      rod(train,'edge',[side*.37,-.16,.30],[side*.64,-1.03,.21],.039);
      mesh(head,'pearl','deep',side*.205,.21,.054,.16,.46,.26,0,0,side*.26);
      for(let pin=0;pin<3;pin++){
        rod(head,'trim',[side*.16,.49,.05],[side*(.29+.13*pin),.74-.084*pin,-.03-.063*pin],.031,'horn');
      }
      mesh(body,'mantle','body',side*.39,.64,.13,side*.62,.64,.78,.20,0,-side*.31);
    }
    body.userData.train=train;
  }else if(entry.id==='m101'){
    mesh(head,'round','deep',0,.18,-.08,.37,.53,.38,-.25);
    mesh(head,'scale','edge',0,-.03,.32,.32,.40,.87,0,0,PI);
    mesh(body,'mantle','body',0,.57,-.28,1.12,1.29,1.22,.15,1.76);
    mesh(body,'ring','trim',0,.69,.03,.62,.62,.82,PI*.48,0,.18);
  }else if(entry.id==='m021'){
    mesh(head,'ring','trim',0,.42,-.18,.59,.61,.55);
    const train=bone(body,0,.86,-.08);
    for(const side of [-1,1]){
      mesh(train,'mantle','edge',0,.45,-.16,side*.68,1.27,.73,.16,-side*.24,0);
      for(let strand=0;strand<4;strand++){
        rod(train,'edge',[side*strand*.059,.35,-.18],[side*(.46-strand*.05),-.68+strand*.03,-.34],.086,'horn');
      }
      rod(head,'body',[side*.28,.22,.03],[side*.63,1.02,-.13],.094,'horn');
      mesh(body,'mantle','body',side*.19,.45,0,side*.66,1.39,.94,0,-side*.54,0);
    }
    body.userData.train=train;
  }else if(!occult&&(mage||royal||entry.crest==='mask')){
    mesh(head,'pearl','deep',0,.16,-.12,.51,.54,.45);
    mesh(head,'gem','edge',0,.43,.20,.33,.46,.19);
    const ornaments=entry.crest==='topknot'?1:royal?5:3;
    for(let i=0;i<ornaments;i++){
      const a=(i-(ornaments-1)/2)*.47;
      rod(head,'edge',[a*.35,.34,.1],[a*.55,.73+Math.cos(a)*.14,.12],.106,'horn');
    }
  }
  const legs=[],arms=[];
  for(const side of [-1,1]){
    const leg=bone(root,side*width*.56,1.12,.04);
    mesh(leg,'pearl','deep',0,-.25,0,.20,.40,.23);
    mesh(leg,'gem','body',0,-.57,.04,.22,.34,.239);
    mesh(leg,'pearl','edge',0,-.94,.13,.25,.15,.33);
    legs.push(leg);
    const arm=bone(body,side*width*.97,.62,.03);
    mesh(arm,'pearl','edge',0,0,0,.30,.25,.33,0,0,side*.23);
    mesh(arm,'pearl','body',side*.045,.042,.03,.249,.199,.285,0,0,side*.28);
    for(let pin=0;pin<3;pin++)mesh(arm,'gem','trim',side*(.08+pin*.06),.029+pin*.034,.273,.044,.045,.034);
    mesh(arm,'pearl','body',side*.07,-.32,.03,.23,.40,.23);
    mesh(arm,'gem','edge',side*.08,-.51,.13,.26,.22,.17);
    mesh(arm,'pearl','deep',side*.09,-.77,.04,.18,.22,.20);
    if(side===1&&entry.id==='m101'){
      for(let bead=0;bead<10;bead++){
        const a=bead*TAU/10;
        mesh(arm,'round',bead%4===0?'glow':'body',Math.cos(a)*.20,-.64+Math.sin(a)*.38,.31,.096,.093,.096);
      }
    }else if(!['m005','m016','m017','m081','m107','m109','m119'].includes(entry.id)&&(side===1||['twins','pair','twin'].includes(entry.crest))&&
      !(entry.palette&&['lantern','drum','bell','coffin','coin','orb','wax','eyes','greatblade','bloodblade'].includes(entry.crest))){
      const hand=bone(arm,side*.08,-.73,.16);
      blade(k,hand,entry.crest,huge||royal);
    }
    arms.push(arm);
  }
  if(royal||mage||huge||['duelist','captain'].includes(entry.family)){
    const cloth=bone(body,0,.47,-.27);
    for(const side of [-1,1]){
      mesh(cloth,'mantle','deep',0,-.04,0,side*(mage?.71:.59),.98,.70,.15,-side*.15,0);
      rod(cloth,'trim',[side*.39,-.31,-.057],[side*.47,-.86,-.125],.031);
      rod(body,'trim',[side*.12,.63,.32],[side*.36,.40,.295],.023);
    }
    legs.push(cloth);
  }
  if(entry.family==='captain'){
    mesh(head,'metal','deep',0,.39,-.02,1.09,.14,.73,0,0,-.10);
    mesh(head,'gem','edge',.05,.47,.29,.32,.17,.09);
    if(entry.id==='m107'){
      const carriage=bone(body,.56,-.22,.35);
      mesh(carriage,'pearl','deep',0,.16,.37,.27,.26,.61);
      mesh(carriage,'ring','edge',0,.16,.97,.24,.23,1.2);
      mesh(carriage,'bar','deep',0,.18,.92,.18,.08,.18,PI/2);
      for(const side of [-1,1]){
        mesh(carriage,'ring','trim',side*.32,-.05,.42,.24,.24,.91,0,PI/2);
        rod(carriage,'body',[side*.32,-.04,-.33],[side*.32,-.08,.83],.044);
      }
      const parrot=bone(body,-.56,1.82,-.14);
      mesh(parrot,'pearl','body',0,0,0,.10,.112,.28);
      mesh(parrot,'gem','trim',0,.047,.29,.069,.060,.095);
      for(const side of [-1,1])mesh(parrot,'wing','body',0,.02,.11,side*.32,.23,.49,PI*.43,0,side*.21);
      body.userData.parrot=parrot;
      body.userData.cannon=carriage;
    }
  }
  if(entry.id==='m081')for(const [index,arm] of arms.entries()){
    const side=index?1:-1;
    const blade=bone(arm,side*.07,-.41,.17);
    mesh(blade,'wing','body',0,0,0,side*.37,.77,.94,0,0,side*.79);
    const arc=[[0,0,0],[side*.41,.10,.03],[side*.68,.61,.02],[side*.79,1.27,-.04]];
    for(let link=1;link<arc.length;link++)rod(blade,'glow',arc[link-1],arc[link],.065-link*.011);
    rod(blade,'trim',[side*.39,.22,.10],[side*.64,.77,.07],.044,'horn');
  }
  if(entry.id==='m119'){
    const trident=bone(arms[1],.082,-.66,.095);
    rod(trident,'deep',[0,0,-.58],[0,.04,.86],.036);
    rod(trident,'trim',[0,.04,.80],[0,.06,1.16],.044);
    for(let tine=-1;tine<=1;tine++){
      const x=tine*.125;
      rod(trident,'edge',[0,.06,1.03],[x,.076,1.19],.037);
      rod(trident,'glow',[x,.075,1.18],[x*.54,.09,1.64-Math.abs(tine)*.15],.044,'horn');
    }
    for(const side of [-1,1]){
      const drum=bone(body,side*.32,.66,-.31);
      mesh(drum,'bar','body',0,.117,-.012,.19,.30,.19,.42,0,side*.32);
      mesh(drum,'ring','edge',0,.27,-.023,.19,.19,.36,PI/2);
      for(let lace=0;lace<4;lace++){
        const a=lace*TAU/4,x=.18*Math.cos(a),z=.18*Math.sin(a);
        rod(drum,'trim',[x,-.03,z],[x*.91,.29,z*.89],.022);
      }
    }
    mesh(head,'chain','trim',0,.41,.11,.27,.11,.22,.61);
    mesh(head,'mantle','deep',-.15,.22,-.27,.85,.96,.87,.39,.27,0);
  }
  if(entry.id==='m005'){
    mesh(body,'pearl','edge',0,.41,.29,.55,.64,.28);
    mesh(head,'pearl','edge',0,-.13,.32,.29,.21,.25);
    for(const side of [-1,1]){
      const arm=arms[side===1?1:0];
      mesh(arm,'pearl','edge',0,-.55,.085,.26,.30,.22);
      for(let claw=0;claw<3;claw++)rod(arm,'edge',[side*(.078+claw*.073),-.74,.17],
        [side*(.081+claw*.091),-.92,.32],.041,'horn');
      for(let tuft=0;tuft<5;tuft++){
        rod(body,tuft%3?'trim':'glow',[side*.34,.75-tuft*.11,-.08],[side*(.66-tuft*.052),.96-tuft*.13,-.34],.075,'horn');
      }
    }
  }else if(entry.id==='m016'){
    mesh(head,'bar','edge',0,.40,.01,.26,.48,.24);
    const sun=bone(arms[1],.12,-.73,.21);
    mesh(sun,'ring','glow',0,0,0,.28,.29,.45);
    mesh(sun,'gem','trim',0,0,0,.26,.28,.099);
    const train=bone(body,0,.72,-.26);
    for(const side of [-1,1]){
      mesh(train,'mantle','body',0,0,0,side*.70,1.26,.91,.18,side*.29,0);
      for(let strip=0;strip<4;strip++){
        rod(train,'trim',[side*(.16+strip*.06),-.01,.01],[side*(.35+strip*.055),-1.16,.22],.018);
      }
      rod(body,'edge',[side*.32,.65,-.12],[side*.89,.86,.14],.082);
      rod(body,'edge',[side*.85,.85,.14],[side*1.06,1.15,.20],.069);
    }
    body.userData.train=train;
  }else if(entry.id==='m017'||entry.id==='m109'){
    const staff=bone(arms[1],.084,-.66,.16);
    rod(staff,'deep',[0,-.50,-.19],[0,.78,.33],.052);
    mesh(staff,'pearl',entry.id==='m109'?'body':'deep',0,.67,.33,.29,.30,.24,.25);
    for(let tooth=0;tooth<7;tooth++){
      const angle=tooth*TAU/7,x=Math.cos(angle),y=Math.sin(angle);
      rod(staff,entry.id==='m109'?'body':'trim',[x*.15,.67+y*.16,.38],[x*.39,.67+y*.37,.40],.059,'horn');
    }
    mesh(body,'bar','trim',0,.29,.025,.42,.16,.36);
    mesh(head,'scale','edge',0,.40,0,.39,.45,.65,-.31);
    if(entry.id==='m109')for(let plume=-2;plume<=2;plume++){
      rod(head,'edge',[plume*.081,.26,0],[plume*.21,.72,plume*.035-.24],.057,'horn');
    }
  }
  if(entry.id==='m027'){
    const tail=bone(body,0,-.42,-.28);
    mesh(body,'scale','trim',0,.10,.48,.75,1.01,.69,0,0,PI);
    for(const side of [-1,1]){
      rod(head,'trim',[side*.20,.17,.07],[side*.51,.53,-.13],.12,'horn');
      rod(head,'deep',[side*.48,.48,-.10],[side*.50,.77,-.31],.085,'horn');
      for(let spike=0;spike<3;spike++)rod(body,'trim',[side*.37,.59-spike*.10,-.08],[side*(.80-spike*.03),.94-spike*.18,-.13],.077,'horn');
    }
    for(let segment=0;segment<6;segment++){
      const point=i=>[i*.13,Math.sin(i*.49)*.35,-i*.19];
      rod(tail,segment%2?'body':'deep',point(segment),point(segment+1),.13-segment*.014);
    }
    return {body,arms,legs,head,tail};
  }
  if(entry.family==='straw'){
    mesh(head,'bar','edge',0,.49,0,.65,.13,.65);
    mesh(head,'horn','body',0,.68,0,.52,.63,.52);
    for(const side of [-1,1])for(let i=0;i<5;i++){
      rod(arms[side===-1?0:1],i%2?'edge':'body',[0,-.39,0],[side*(.09+i*.065),-.89,.09+i*.07],.079,'horn');
    }
  }
  if(entry.id==='m158'){
    for(const side of [-1,1])for(let i=0;i<5;i++){
      const y=.43+i*.203;
      mesh(body,'scale',i%2?'edge':'body',side*(.46-i*.02),y,-.24-i*.038,
        .32,.35,.43,-.56,side*.64,side*.45);
      rod(body,i%2?'trim':'edge',[side*.42,y,-.35],[side*(.55+i*.032),y+.31,-.62],.082,'horn');
    }
  }
  if(entry.id==='m156')for(let i=0;i<4;i++)for(let strip=0;strip<10;strip++){
    const a=strip*TAU/10;
    const y=.85-i*.28, width=.49+i*.101;
    const x=Math.cos(a)*width,z=Math.sin(a)*width*.82;
    rod(body,strip%3?'trim':'edge',[x,y,z],[x*1.23,y-.41,z*1.29],.084,'horn');
  }
  return {body,arms,legs,head};
}

function quadruped(k,entry){
  const {root,bone,mesh,rod}=k;
  const turtle=entry.family==='turtle',rider=entry.family==='rider',fireKirin=entry.id==='m014';
  const trial=trialType(entry.id),windBeast=entry.id==='m149';
  const body=bone(root,0,turtle?.85:1.11,0);
  mesh(body,'pearl','body',0,.14,-.21,turtle?.84:.50,.54,1.05);
  mesh(body,'pearl','deep',0,-.16,-.2,turtle?.71:.44,.36,.85);
  const head=bone(body,0,.23,turtle?.94:1.0);
  if(trial){
    mesh(body,'round','body',0,.33,.61,.37,.61,.44,-.57);
    mesh(body,'scale','deep',0,.35,.88,.52,.80,1.01,-.56);
    mesh(head,'round','body',0,.052,.03,.27,.43,.50,-.31);
    mesh(head,'round','deep',0,-.19,.42,.26,.23,.36,-.42);
    mesh(head,'scale','edge',0,.15,.42,.46,.59,.78,-.59);
    for(const side of [-1,1]){
      mesh(head,'gem','glow',side*.21,.11,.45,.055,.035,.096,0,side*.23);
      rod(head,'edge',[side*.19,.30,-.17],[side*.24,.65,-.28],.066,'horn');
      rod(head,'trim',[side*.19,.11,.36],[side*.20,-.22,.63],.023);
    }
  }else face(k,head,{broad:windBeast?.50:turtle?.35:.46,snout:turtle?.39:.47,
    horns:turtle||windBeast||entry.crest==='tiger'||entry.crest==='bear'?0:2,shell:turtle});
  if(turtle){
    mesh(body,'pearl','edge',0,.32,-.29,1.01,.61,1.23);
    for(let i=0;i<11;i++){
      const a=i*2.399;
      const r=i<3?.38:.77;
      const x=Math.sin(a)*r,z=Math.cos(a)*r-.23,y=.32+Math.sqrt(1-r*r)*.55;
      mesh(body,'pearl','body',x,y,z,.23,.17,.26);
      rod(body,'edge',[x,y,z],[x*1.06,y+.31+(i%3)*.15,z],entry.id==='m022'?.16:.133,'horn');
      if(entry.id==='m022'){
        mesh(body,'ring','deep',x,y+.045,z,.25,.25,.54,PI*.47,0,a);
        mesh(body,'scale','trim',x,y+.12,z,.25,.20,.64,-.7,0,a);
      }
    }
  }else if(windBeast){
    for(const side of [-1,1]){
      mesh(body,'mantle','edge',side*.33,.64,-.21,side*.73,.87,1.19,.07,side*.76,side*.43);
      rod(head,'glow',[side*.13,.25,.24],[side*.38,.40,.49],.028,'horn');
      rod(head,'body',[side*.16,.31,-.06],[side*.42,.66,-.10],.065);
      rod(head,'glow',[side*.41,.65,-.08],[side*.68,.72,-.24],.025,'horn');
      for(let whisker=0;whisker<3;whisker++){
        const shift=whisker*.106;
        rod(head,'trim',[side*.26,.05+shift,.40],[side*(.61+shift),-.23+shift,.33],.039,'horn');
      }
    }
  }else if(fireKirin){
    mesh(body,'scale','edge',0,.33,.27,.57,.69,1.28,-.64);
    mesh(body,'round','body',0,.29,.53,.40,.70,.50,-.52);
    for(const side of [-1,1]){
      rod(head,'edge',[side*.25,.27,.13],[side*.47,.57,.14],.11,'horn');
      rod(head,'edge',[side*.45,.54,.14],[side*.37,.92,-.05],.077,'horn');
      rod(head,'edge',[side*.36,.79,-.02],[side*.57,.86,-.26],.050,'horn');
      for(let spike=0;spike<6;spike++){
        const z=.60-spike*.29,y=.40+Math.sin(spike*.57)*.13;
        mesh(body,'scale','edge',side*.29,y,z,.34,.40,.55,.32,side*.14,side*-.52);
        rod(body,'edge',[side*.32,y+.12,z],[side*.63,y+.42,z-.29],.12,'horn');
      }
    }
  }else {
    for(let i=0;i<5;i++){
      const z=.74-i*.37;
      const boost=['kirin','devour','spike'].includes(entry.crest)?1.4:1;
      rod(body,'edge',[0,.43,z],[.055,.43+boost*(.28+.15*Math.cos(i)),z-.19],.16,'horn');
    }
    for(const side of [-1,1])for(let i=0;i<3;i++){
      mesh(body,'gem','trim',side*.42,.24-i*.03,.57-i*.35,.066,.14,.12,0,side*.26,side*.31);
    }
    if(entry.crest==='tiger'||entry.crest==='fox')for(const side of [-1,1]){
      for(let i=0;i<4;i++)mesh(body,'gem','deep',side*.44,.08+i%2*.23,.54-i*.42,.08,.34,.14,0,0,side*-.25);
    }
  }
  const legs=[];
  for(const side of [-1,1])for(const z of [-.78,.69]){
    const limb=bone(root,side*(turtle?.67:.43),turtle?.8:1.11,z);
    if(trial){
      const knee=[0,-.51,z<0?-.18:.12];
      const hoof=[0,-.96,z<0?.03:.18];
      mesh(limb,'round','body',0,-.19,0,.20,.32,.24,.27);
      rod(limb,'deep',knee,hoof,.101);
      mesh(limb,'scale','edge',0,-.50,knee[2]+.09,.20,.26,.76,.20);
      mesh(limb,'metal','deep',0,hoof[1],hoof[2],.21,.13,.23,.09);
      mesh(limb,'metal','trim',0,hoof[1]+.06,hoof[2]+.062,.224,.025,.204,.09);
    }else{
      mesh(limb,'pearl','body',0,-.26,0,.22,.39,.26);
      mesh(limb,'pearl','body',0,-.59,.11,.18,.30,.19);
      mesh(limb,'pearl','edge',0,turtle?-.67:-.94,.28,.228,.14,.32);
      for(let i=-1;i<=1;i++)rod(limb,'edge',[i*.086,turtle?-.67:-.94,.33],[i*.092,turtle?-.72:-.96,.51],.054,'horn');
    }
    if(fireKirin){
      for(let flame=0;flame<4;flame++){
        rod(limb,flame%2?'glow':'trim',[side*(.03+flame*.04),-.93,-.12],
          [side*(.22+flame*.045),-.50-flame*.08,-.25-flame*.08],.10,'horn');
      }
    }
    legs.push(limb);
  }
  const tail=bone(body,0,.09,-1.18);
  if(entry.id==='m022'){
    const curve=[[0,0,.09],[0,.10,-.42],[.10,.41,-.82],[.25,.82,-1.05],[.30,1.28,-.83]];
    for(let i=1;i<curve.length;i++)rod(tail,i%2?'trim':'body',curve[i-1],curve[i],.12-i*.012);
    const [x,y,z]=curve.at(-1);
    mesh(tail,'gem','deep',x,y,z,.31,.30,.25);
    for(let spike=0;spike<6;spike++){
      const a=spike*TAU/6;
      rod(tail,'edge',[x+Math.sin(a)*.16,y+Math.cos(a)*.16,z],[x+Math.sin(a)*.41,y+Math.cos(a)*.41,z-.10],.091,'horn');
    }
  }else if(windBeast){
    const sweep=[[0,0,0],[.32,.25,-.22],[.57,.66,-.37],[.27,1.04,-.41],[-.24,1.23,-.25]];
    for(let i=1;i<sweep.length;i++)rod(tail,i%2?'body':'deep',sweep[i-1],sweep[i],.16-i*.018);
    mesh(tail,'mantle','edge',.07,1.22,-.14,.68,.61,.66,.73,-.82,1.48);
  }else{
    rod(tail,'body',[0,0,.09],[0,.21,-.53],.135,'horn');
    rod(tail,'edge',[0,.13,-.40],[.17,.48,-.89],.10,'horn');
  }
  if(fireKirin){
    for(let plume=0;plume<9;plume++){
      const side=plume%2?1:-1;
      rod(tail,plume%3?'glow':'trim',[side*.048,.26+plume*.019,-.50-plume*.027],
        [side*(.13+plume*.031),.65-plume*.038,-1.00-plume*.075],.12,'horn');
    }
  }
  if(rider){
    const knight=bone(body,0,.6,-.27);
    mesh(knight,'pearl','body',0,.42,0,.29,.45,.23);
    const helm=bone(knight,0,.99,0);
    const hand=bone(knight,.43,.34,.17);
    if(trial){
      const dark=entry.id.endsWith('-dark')||entry.id==='m094';
      trialWeapon(k,hand,trial);
      const mantle=bone(knight,0,.57,-.22);
      const embers=bone(knight,0,.46,-.20);
      mesh(helm,'round','deep',0,.048,0,.263,.33,.278);
      mesh(helm,'scale','edge',0,.01,.24,.46,.51,.71,0,0,PI);
      mesh(helm,'metal','deep',0,.16,.292,.36,.074,.082);
      mesh(helm,'metal','glow',0,.157,.338,.27,.024,.018);
      mesh(helm,'scale','trim',0,.35,-.046,.31,.48,.61,-.32);
      mesh(knight,'scale','trim',0,.44,.27,.57,.45,.67,.15);
      mesh(knight,'gem','glow',0,.46,.33,.075,.129,.036);
      mesh(head,'scale','trim',0,.25,.37,.49,.43,.85,-.56);
      for(const side of [-1,1]){
        mesh(knight,'scale','edge',side*.33,.65,.09,.32,.35,1.16,-.02,side*.43,side*.29);
        mesh(body,'mantle','deep',side*.46,.40,-.05,side*.35,.59,1.04,.17,-side*.79,0);
        mesh(head,'scale','edge',side*.29,.10,.27,.20,.43,1.25,.27,side*.68,side*.15);
        rod(helm,'body',[side*.15,.27,.12],[side*.34,.58,-.11],.081,'horn');
        rod(helm,'glow',[side*.10,.34,.15],[side*.18,trial==='spear'?.83:.62,.04],.031,'horn');
        mesh(mantle,'mantle',dark?'deep':'body',side*.12,0,-.05,side*.63,.81,1.2,.84,-side*.30,0);
        for(let plate=0;plate<3;plate++){
          const z=-.66+plate*.40;
          mesh(body,'scale','edge',side*.47,.09,z,.32,.45,.46,.06,side*1.2,side*.14);
          rod(body,'trim',[side*.55,.27,z+.08],[side*.57,-.01,z-.17],.023);
        }
        for(let mote=0;mote<4;mote++){
          mesh(embers,'gem',mote%2?'glow':'edge',side*(.46+mote*.16),.20+mote*.26,
            -.38-mote*.18,.046,.14,.037,-.5,side*.3,side*.22);
        }
      }
      return {body,head,legs,tail,mount:{knight,hand,mantle,embers,trial}};
    }else{
      face(k,helm,{broad:.25,horns:0,snout:.18});
      blade(k,hand,entry.crest,true);
    }
    mesh(knight,'gem','edge',-.34,.41,.25,.20,.37,.15);
  }
  return {body,head,legs,tail};
}
function flyer(k,entry){
  const {root,bone,mesh,rod}=k;
  const dragon=entry.family==='dragon', insect=entry.family==='wasp';
  const redPhoenix=entry.id==='m015',poison=entry.id==='m024',darkFeathers=entry.id==='m148';
  const body=bone(root,0,1.12,0);
  mesh(body,'pearl','body',0,.21,0,dragon?.53:.37,dragon?.56:.42,dragon?.83:.59);
  mesh(body,'pearl','edge',0,.18,.32,insect?.24:.38,.27,.40);
  const head=bone(body,0,.42,.84);
  if(entry.id==='m151'){
    mesh(head,'gem','trim',0,.01,0,.37,.36,.37,0,PI*.25);
    for(const side of [-1,1])mesh(head,'pearl','edge',side*.23,.05,.162,.185,.16,.19);
  }else if(redPhoenix){
    mesh(head,'pearl','body',0,.08,.08,.24,.40,.25,-.52);
    rod(head,'trim',[0,-.03,.11],[0,-.22,.64],.114,'horn');
    for(let feather=0;feather<6;feather++){
      rod(head,feather%2?'glow':'edge',[0,.19,.12],[(feather-2.5)*.10,.61+feather*.037,-.27-feather*.055],.066,'horn');
    }
    for(const side of [-1,1])mesh(head,'gem','glow',side*.13,.09,.29,.042,.038,.043);
  }else face(k,head,{broad:poison?.30:dragon?.41:.28,horns:dragon?2:0,snout:poison?.59:dragon?.50:.28,reptile:poison});
  const arms=[];
  for(const side of [-1,1]){
    const limb=bone(body,side*.31,.40,0);
    const stretch=poison?1.31:dragon?1.05:insect?.79:.93;
    if(entry.id==='m151'){
      mesh(limb,'wing','membrane',0,0,-.11,side*1.14,.30,.58,-.35,0,side*.19);
      rod(limb,'trim',[0,0,0],[side*1.77,.24,-.15],.034);
      for(let vein=0;vein<3;vein++)rod(limb,'edge',[side*(.48+vein*.29),.16,-.12],
        [side*(.67+vein*.38),-.11,-.21],.020);
    }else if(redPhoenix||darkFeathers){
      for(let feather=0;feather<9;feather++){
        const x=.30+feather*.192;
        const y=.18+Math.sin(feather*.20)*.77;
        const base=[side*x*.66,y*.50,-.09];
        const middle=[side*(x+.32),y,-.14-feather*.036];
        rod(limb,darkFeathers?'deep':feather%3===0?'body':'trim',base,middle,.142,'horn');
        rod(limb,darkFeathers?'body':'edge',middle,[side*(x+.65),y+.39,-.30-feather*.080],.10,'horn');
        rod(limb,'glow',[side*(x+.53),y+.22,-.28-feather*.065],[side*(x+.77),y+.57,-.37-feather*.090],.073,'horn');
      }
    }else{
      mesh(limb,'wing',insect?'edge':'body',0,0,0,side*stretch,insect?.43:.82,insect?.43:.8,0,0,side*.08);
      rod(limb,'edge',[0,0,0],[2.05*side*stretch,.69,0],insect?.055:.092);
    }
    for(let i=0;i<5;i++){
      const x=side*(.45+i*.27)*stretch;
      if(dragon){
        rod(limb,'deep',[x,.43,0],[x*1.17,-.13+i*.07,.07],.057);
        rod(limb,'trim',[x,.43,.052],[x*1.17,-.13+i*.07,.11],.020);
      }
      else if(entry.id!=='m151')mesh(limb,'gem',i%2?'edge':'glow',x,.02+i*.08,.075,insect?.07:.13,insect?.10:.24,.048,0,0,side*.29);
    }
    if(poison){
      for(let spine=0;spine<6;spine++){
        rod(head,'trim',[side*.15,.14+spine*.054,-spine*.154],
          [side*(.43+spine*.025),.43+spine*.052,-.26-spine*.135],.053,'horn');
      }
      rod(body,'trim',[side*.28,.01,.36],[side*.42,-.43,.59],.078);
      rod(body,'edge',[side*.42,-.41,.58],[side*.36,-.61,.80],.054,'horn');
    }
    if(insect){
      if(entry.id!=='m151')mesh(limb,'wing','glow',side*.18,-.19,-.34,side*.56,.32,.42,0,-side*.30,side*.18);
      for(let leg=0;leg<3;leg++)rod(body,'edge',[side*.21,-.01,.34-leg*.30],
        [side*(.66-leg*.065),-.46,.58-leg*.45],.053,'horn');
      rod(head,'glow',[side*.14,.33,.18],[side*.35,.75,.37],.055,'horn');
    }
    arms.push(limb);
  }
  const tail=bone(body,0,0,-.65);
  if(redPhoenix){
    for(let plume=-4;plume<=4;plume++){
      const tip=[plume*.19,.19+Math.abs(plume)*.06,-1.93+Math.abs(plume)*.18];
      rod(tail,plume%2?'edge':'body',[plume*.046,0,0],tip,.115,'horn');
      rod(tail,'glow',[tip[0]*.76,tip[1]*.8,tip[2]+.40],[tip[0]*1.12,tip[1]+.11,tip[2]-.21],.062,'horn');
    }
    return {body,head,arms,tail};
  }
  for(let i=0;i<5;i++){
    const width=(insect?.31:.38)*(1-i*.15);
    mesh(tail,'pearl',i%2?'deep':'body',0,-i*.081,-i*.25,width,width*.81,.25);
  }
  if(poison){
    rod(tail,'body',[0,-.31,-.87],[.19,-.19,-1.45],.106);
    rod(tail,'trim',[.19,-.19,-1.43],[.34,.07,-1.93],.073,'horn');
    mesh(tail,'gem','glow',.35,.075,-1.88,.061,.068,.055);
  }
  if(insect)rod(tail,'edge',[0,-.35,-1.02],[0,-.61,-1.47],.13,'horn');
  if(entry.id==='m151')for(let band=0;band<4;band++)mesh(tail,'ring','trim',0,-band*.078,-band*.25-.08,
    .31-band*.034,.24-band*.022,.74);
  return {body,head,arms,tail};
}

function coil(k,entry){
  const {root,bone,mesh}=k;
  const body=bone(root,0,.14,0);
  const legs=[];
  const cloudDragon=entry.id==='m106'||entry.id==='m019';
  if(cloudDragon){
    body.position.y=.48;
    const bank=bone(body,0,-.12,-.14);
    for(let i=0;i<12;i++){
      const a=i*2.399;
      const r=.39+(i%4)*.19;
      mesh(bank,'pearl',i%3===0?'body':'edge',Math.sin(a)*r,-.02+(i%3)*.12,Math.cos(a)*r,.55,.21,.49);
    }
  }
  const rebuilt=['m001','m002','m152'].includes(entry.id);
  const count=entry.family==='hydra'?15:12;
  if(rebuilt)serpentTail(body,k,entry);
  for(let first=0;!rebuilt&&first<count;first+=3){
    const a=first*.49,radius=1.19-first*.047,x=Math.sin(a)*radius,z=Math.cos(a)*radius;
    const joint=bone(body,x,.26+first*.032,z);
    joint.restHeight=joint.position.y;
    for(let i=first;i<Math.min(first+3,count);i++){
      const az=i*.49,r=1.19-i*.047;
      const px=Math.sin(az)*r-x,pz=Math.cos(az)*r-z,py=(i-first)*.032;
      mesh(joint,'pearl',i%2?'body':'deep',px,py,pz,.33-i*.009,.25,.44,0,-az);
      mesh(joint,'gem','edge',px,py+.165,pz,.17,.12,.28,0,-az);
      if(cloudDragon)mesh(joint,'horn','edge',px,py+.22,pz-.04,.14,.31,.17,.26,-az);
      for(const side of [-1,1])mesh(joint,'gem','trim',px+side*.21,py+.11,pz,.068,.055,.20,0,-az,side*.39);
      if(i%2===0)mesh(joint,'gem','glow',px,py+.26,pz,.076,.063,.14,0,-az);
    }
    legs.push(joint);
  }
  const arms=[];
  const necks=entry.family==='hydra'?5:1;
  for(let index=0;index<necks;index++){
    const offset=index-(necks-1)/2;
    const neck=bone(body,offset*.45,.50,.33+Math.abs(offset)*.03);
    if(entry.id==='m001')neck.scale.set(.94,.64,1.05);
    mesh(neck,'pearl','body',0,.60,0,.32,1.03,.35,-.16,0,offset*-.12);
    for(let i=0;i<6;i++){
      const y=.22+i*.176;
      mesh(neck,'scale',i%3===0?'trim':'edge',0,y,.323-i*.024,.31-i*.013,.17,.73,-.076,0,.03);
      for(const side of [-1,1])mesh(neck,'scale','body',side*.21,y+.053,.178-i*.019,.20,.18,.61,-.09,side*.58,side*.30);
    }
    if(['cobra','greed'].includes(entry.crest)){
      mesh(neck,'pearl','edge',0,1.06,.005,.80,.49,.29);
      mesh(neck,'pearl','body',0,1.19,-.06,.45,.46,.30);
    }
    const head=bone(neck,0,1.38,.18);
    face(k,head,{broad:entry.crest==='greed'?.55:.40,snout:.42,horns:entry.crest==='cobra'||entry.id==='m001'?0:2,reptile:true});
    if(cloudDragon){
      for(const side of [-1,1])k.rod(head,'edge',[side*.23,.27,.19],[side*.48,.83,-.08],.105,'horn');
      for(let spine=0;spine<4;spine++)mesh(neck,'horn','edge',0,.48+spine*.22,-.33,.13,.40,.13,-.57);
    }
    if(entry.id==='m002')for(let spike=0;spike<5;spike++)mesh(head,'horn','glow',-.30+.15*spike,.35+.038*spike,-.18,.095,.36,.081,-.26,0,.22);
    arms.push(neck);
  }
  return {body,arms,legs};
}

function serpentTail(body,k,entry){
  const {materials,mesh,rod}=k;
  const turns=entry.id==='m001'?1.35:1.05;
  const path=new T.CatmullRomCurve3(Array.from({length:20},(_,i)=>{
    const t=i/19,angle=t*TAU*turns;
    if(entry.id==='m001'||entry.id==='m002')return new T.Vector3(Math.sin(t*11)*.46,.31-t*.18,-3.28*t+.28);
    const radius=.35+Math.sin(t*2.45)*1.39;
    return new T.Vector3(Math.sin(angle)*radius,.36-.216*t+.085*Math.sin(t*18),Math.cos(angle)*radius);
  }));
  const segments=60,sides=10;
  const tube=new T.TubeGeometry(path,segments,.26,sides,false);
  const vertices=tube.attributes.position;
  const point=new T.Vector3();
  for(let ring=0;ring<=segments;ring++){
    const t=ring/segments,center=path.getPointAt(t);
    const width=.039+(1-t**1.67)*.96;
    for(let side=0;side<=sides;side++){
      const index=ring*(sides+1)+side;
      point.fromBufferAttribute(vertices,index).lerp(center,1-width);
      vertices.setXYZ(index,point.x,point.y,point.z);
    }
  }
  tube.computeVertexNormals();
  body.add(new T.Mesh(tube,materials.body));
  for(const side of [-1,1]){
    const ridge=new T.CatmullRomCurve3(Array.from({length:34},(_,i)=>{
      const t=i/33,point=path.getPointAt(t),forward=path.getTangentAt(t);
      const width=1-t**1.67;
      point.x+=forward.z*side*.173*width;
      point.z-=forward.x*side*.173*width;
      point.y+=.198*width;
      return point;
    }));
    body.add(new T.Mesh(new T.TubeGeometry(ridge,57,.033,5,false),materials.edge));
  }
  if(entry.id==='m001'||entry.id==='m002'){
    for(let spine=0;spine<4;spine++){
      const tip=path.getPointAt(.88+spine*.032);
      rod(body,'edge',[tip.x,tip.y,tip.z],[tip.x+.055,tip.y+.22+spine*.025,tip.z-.10],.053,'horn');
    }
    mesh(body,'round','glow',.57,1.14,.95,.13,.133,.13);
  }
}

function serpentGuardian(k,tiamat){
  const {root,mesh,bone,rod}=k;
  const body=bone(root,0,.17,0);
  const tail=bone(body,0,0,-.27);
  const path=[[0,.60,.30],[.17,.36,-.42],[.66,.20,-.91],[1.25,.13,-1.13],[1.92,.08,-.91],[2.34,.11,-.51]];
  for(let i=1;i<path.length;i++){
    const before=path[i-1],after=path[i];
    rod(tail,'body',before,after,.39-i*.045);
    mesh(tail,'pearl','body',...after,.38-i*.052,.35-i*.049,.36-i*.048);
    rod(tail,tiamat?'edge':'deep',[before[0],before[1]+.22,before[2]],[after[0],after[1]+.19,after[2]],.12,'horn');
    if(tiamat)rod(tail,'edge',[after[0],after[1]+.17,after[2]],[after[0]+.05,after[1]+.42,after[2]-.16],.083,'horn');
  }
  mesh(tail,'scale','edge',2.36,.13,-.49,.24,.37,.49,PI*.44,-.28,-1.05);
  mesh(body,'pearl','body',0,.73,.21,.51,.85,.48,-.22);
  for(let band=0;band<7;band++){
    mesh(body,'scale',band%3===0?'trim':'edge',0,.34+band*.17,.61-band*.011,
      .43-band*.015,.26,.38,-.1,0,Math.sin(band)*.04);
  }
  const head=bone(body,0,1.67,.18);
  mesh(head,'pearl','deep',0,.05,0,.33,.42,.35);
  mesh(head,'scale','trim',0,-.02,.285,.42,.54,.87,0,0,PI);
  if(tiamat){
    mesh(head,'metal','deep',0,.43,-.045,.38,.23,.40);
    mesh(head,'scale','trim',0,.48,.17,.28,.51,.85);
    rod(head,'trim',[0,.34,0],[0,.89,-.10],.21,'horn');
  }else{
    mesh(head,'ring','edge',0,.19,-.14,.61,.70,.88);
    mesh(head,'ring','glow',0,.18,-.11,.49,.59,.36);
  }
  for(let ray=0;!tiamat&&ray<14;ray++){
    const angle=ray*TAU/14;
    const x=Math.sin(angle),y=Math.cos(angle);
    rod(head,'edge',[x*.54,.19+y*.60,-.12],[x*(.72+ray%2*.08),.19+y*.96,-.14],.045,'horn');
  }
  for(const side of [-1,1])mesh(head,'gem','glow',side*.108,.041,.339,.049,.035,.035);
  const arms=[];
  for(const side of [-1,1]){
    if(tiamat){
      for(const upper of [false,true]){
        const arm=bone(body,side*(upper?.46:.38),upper?1.49:1.09,upper?-.13:.27);
        const elbow=[side*.55,upper?.33:-.27,.07],palm=[side*.92,upper?.57:-.50,.29];
        mesh(arm,'scale','trim',0,0,0,.40,.62,.87,0,side*.31,side*.57);
        rod(arm,'body',[0,0,0],elbow,.147);
        rod(arm,'trim',elbow,palm,.096);
        for(let claw=0;claw<3;claw++){
          const offset=(claw-1)*.11;
          rod(arm,'edge',[palm[0],palm[1]+offset,palm[2]],[palm[0]+side*.32,palm[1]+offset-.23,palm[2]+.14],.045,'horn');
        }
        arms.push(arm);
      }
      continue;
    }
    const arm=bone(body,side*.51,1.25,.15);
    mesh(arm,'scale','trim',0,0,0,.40,.67,.96,0,side*.32,side*.81);
    mesh(arm,'ring','glow',0,.06,.11,.31,.25,1.36,.52,0,side*.42);
    rod(arm,'body',[0,-.12,0],[side*.22,-.54,.20],.14);
    mesh(arm,'scale','edge',side*.225,-.50,.19,.24,.33,.91,.34,0,side*.22);
    const hand=bone(arm,side*.23,-.71,.23);
    if(side>0){
      hand.rotation.z=-.68;
      rod(hand,'body',[0,-1.29,0],[0,1.37,0],.048);
      for(let wrap=0;wrap<8;wrap++)mesh(hand,'ring','trim',0,-1.14+wrap*.28,0,.052,.056,.8,PI*.49,0,.31);
      for(const tine of [-1,0,1]){
        rod(hand,'trim',[0,1.03,0],[tine*.17,1.39,.02],.048);
        mesh(hand,'scale','edge',tine*.20,1.49,.01,.13,.47+(tine===0?.16:0),.62,0,0,-tine*.23);
      }
    }else{
      rod(hand,'edge',[0,0,.02],[side*.43,.31,.38],.11,'horn');
      rod(hand,'glow',[0,0,.02],[side*.30,.21,.28],.025,'horn');
    }
    arms.push(arm);
  }
  return {body,head,arms,tail};
}

function star(k,entry) {
  const {root,bone,mesh,rod}=k;
  const clutch=entry.family==='eggs';
  const body=bone(root,0,.86,0),arms=[];
  mesh(body,'pearl','body',0,.18,0,.64,.74,.55);
  mesh(body,'gem','glow',0,.34,.49,.22,.24,.099);
  if(clutch){
    for(let i=0;i<4;i++){
      const a=i*TAU/4+.30;
      const egg=bone(body,Math.sin(a)*.90,.04,Math.cos(a)*.48);
      mesh(egg,'round','edge',0,0,0,.38,.58,.37);
      mesh(egg,'pearl','body',0,-.39,0,.39,.21,.37);
      mesh(egg,'gem','glow',0,.08,.36,.12,.14,.079);
      arms.push(egg);
    }
  }else for(let i=0;i<5;i++){
    const a=i*TAU/5;
    const fin=bone(body,Math.sin(a)*.37,Math.cos(a)*.39,0);
    fin.rotation.z=-a;
    rod(fin,'edge',[0,0,0],[.22,1.26,.06],.26,'horn');
    mesh(fin,'pearl','body',.10,.46,0,.24,.51,.25,0,0,-.14);
    mesh(fin,'gem','glow',.13,.70,.17,.09,.14,.095);
    arms.push(fin);
  }
  return {body,arms};
}

function eggGhost(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,1.30,0);
  mesh(body,'round','body',0,.08,0,.86,1.12,.75);
  mesh(body,'round','edge',0,.56,-.035,.67,.69,.69);
  mesh(body,'wing','deep',-.83,.25,.63,.70,.44,.78,.03,.12,-.29);
  mesh(body,'wing','deep',.83,.25,.63,-.70,.44,.78,.03,-.12,.29);
  for(const side of [-1,1]){
    mesh(body,'round','deep',side*.29,.24,.704,.207,.167,.092);
    mesh(body,'round','glow',side*.28,.21,.783,.108,.114,.044);
    mesh(body,'gem','deep',side*.28,.208,.823,.046,.067,.025);
    rod(body,'deep',[side*.39,.46,.634],[side*.49,.70,.578],.028);
    rod(body,'deep',[side*.49,.70,.578],[side*.61,.72,.47],.028);
  }
  const tassels=bone(body,0,.84,0);
  for(let i=0;i<12;i++){
    const a=i*TAU/12,x=Math.cos(a),z=Math.sin(a);
    mesh(tassels,'round','trim',x*.64,.01,z*.57,.13,.108,.13);
    if(i%2===0){
      mesh(tassels,'metal','edge',x*.83,.08,z*.69,.19,.52,.055,x*.46,-a,z*.42);
      for(let stripe=0;stripe<3;stripe++)mesh(tassels,'metal','deep',x*(.88+stripe*.019),.10+stripe*.075,z*.73,.092,.024,.059,0,-a);
    }
  }
  const arms=[-1,1].map(side=>{
    const arm=bone(body,side*.72,.03,.13);
    const elbow=[side*.42,-.22,.13],hand=[side*.79,.12,.30];
    rod(arm,'edge',[0,0,0],elbow,.132);
    rod(arm,'edge',elbow,hand,.102);
    mesh(arm,'round','edge',...hand,.12,.14,.12);
    for(let claw=0;claw<3;claw++)rod(arm,'glow',[hand[0],hand[1]+claw*.066,hand[2]],
      [hand[0]+side*.16,hand[1]+.09+claw*.066,hand[2]+.09],.046,'horn');
    return arm;
  });
  return {body,arms};
}

function spider(k,queen=false){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.90,0);
  mesh(body,'pearl',queen?'body':'deep',0,.28,-.55,queen?.75:.58,queen?.72:.65,queen?.92:.77);
  const head=bone(body,0,.02,.43);
  face(k,head,{broad:.34,snout:.28,horns:0});
  if(queen){
    for(let spine=0;spine<12;spine++){
      const angle=spine*2.399;
      const x=Math.cos(angle)*.46,z=-.53+Math.sin(angle)*.60;
      rod(body,'deep',[x,.73,z],[x*1.39,.92+spine%3*.075,z-.12],.064,'horn');
    }
    for(let fringe=-3;fringe<=3;fringe++){
      rod(head,'trim',[fringe*.071,.36,-.16],[fringe*.11,.02,.16+Math.cos(fringe)*.16],.095,'horn');
    }
    rod(body,'trim',[0,.04,-1.31],[0,-.04,-1.59],.10,'horn');
  }
  const legs=[];
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const z=.58-i*.34;
    const limb=bone(root,side*.29,.86,z);
    const foot=[side*(1.39-i*.025),-.80,.20-z*.46];
    const knee=[side*1.14,queen?.57:.43,z*.5];
    rod(limb,'body',[0,0,0],knee,queen?.15:.083);
    rod(limb,'edge',knee,foot,queen?.145:.09,'horn');
    if(queen){
      mesh(limb,'gem','trim',knee[0],knee[1],knee[2],.17,.15,.17);
      rod(limb,'deep',[side*1.20,.29,z*.39],foot,.082,'horn');
    }
    legs.push(limb);
  }
  return {body,head,legs};
}

function imperialTurtle(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.66,0);
  mesh(body,'pearl','deep',0,.06,-.18,.97,.49,1.27);
  mesh(body,'pearl','body',0,.31,-.18,.94,.56,1.22);
  const neck=bone(body,0,.01,.77);
  mesh(neck,'pearl','edge',0,0,.40,.25,.23,.47);
  for(let band=0;band<3;band++){
    mesh(neck,'scale','copper',0,.198,.03+band*.19,.33,.23,.53,-1.37);
  }
  const head=bone(neck,0,.009,.69);
  const jaws=bone(head,0,-.14,.10);
  mesh(head,'pearl','edge',0,.018,.033,.31,.23,.39);
  mesh(head,'pearl','deep',0,-.12,.23,.25,.095,.25);
  mesh(jaws,'pearl','edge',0,-.027,.14,.25,.09,.29);
  for(const side of [-1,1]){
    mesh(head,'scale','copper',side*.14,.18,.15,.19,.27,.65,-.72,0,side*.29);
    mesh(head,'gem','glow',side*.155,.065,.31,.055,.035,.053);
    rod(head,'edge',[side*.20,-.06,.31],[side*.17,-.31,.47],.073,'horn');
    rod(head,'copper',[side*.23,.15,.02],[side*.31,.41,-.12],.075,'horn');
  }
  for(let row=0;row<4;row++){
    const z=.75-row*.54;
    const height=.79-Math.abs(z+.09)*.25;
    mesh(body,'scale','copper',0,height,z,.58,.48,.69,-1.37);
    mesh(body,'scale','deep',0,height+.097,z,.43,.35,.43,-1.37);
    rod(body,'copper',[0,height+.112,z+.06],[0,height+.40+row*.042,z-.19],.100,'horn');
    for(const side of [-1,1]){
      const x=side*(row===0||row===3?.49:.61);
      mesh(body,'scale','copper',x,height-.165,z-.055,.59,.47,.64,-1.47,0,side*-.65);
      mesh(body,'scale','deep',x,height-.063,z-.047,.42,.35,.41,-1.47,0,side*-.65);
      rod(body,'copper',[x,height-.06,z],[x*1.58,height+.19,z-.23],.104,'horn');
      if(row%2===0)mesh(body,'gem','glow',x*.98,height-.023,z+.08,.098,.035,.067);
    }
  }
  const legs=[];
  for(const side of [-1,1])for(const z of [-.84,.61]){
    const leg=bone(body,side*.66,-.041,z);
    const ankle=[side*.43,-.39,.16];
    rod(leg,'copper',[0,0,0],ankle,.18);
    mesh(leg,'scale','body',side*.23,-.105,.17,.39,.27,.50,-.64,0,side*.5);
    mesh(leg,'pearl','edge',...ankle,.24,.11,.18);
    for(let nail=0;nail<3;nail++)rod(leg,'edge',
      [side*(.33+nail*.082),-.39,.24],[side*(.35+nail*.112),-.45,.40+Math.sin(nail*1.39)*.085],.056,'horn');
    legs.push(leg);
  }
  const tail=bone(body,0,.055,-1.20);
  rod(tail,'copper',[0,0,0],[0,.16,-.45],.12,'horn');
  rod(tail,'edge',[0,.10,-.25],[.03,.24,-.70],.104,'horn');
  return {body,head,neck,jaws,legs,tail};
}

function bullOni(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.89,0);
  mesh(body,'pearl','deep',0,.06,-.20,.78,.44,1.07);
  mesh(body,'pearl','body',0,.27,-.24,.67,.48,.99);
  for(let ridge=0;ridge<6;ridge++){
    const z=.59-ridge*.275;
    const width=.69-ridge*.059;
    const height=.50+ridge*.061;
    mesh(body,'scale','trim',0,height,z,width,.52,.73,-1.30);
    mesh(body,'scale','iron',0,height+.101,z-.03,width*.75,.38,.49,-1.30);
    rod(body,'edge',[0,height+.13,z+.17],[0,height+.32,z-.185],.056,'horn');
  }
  const head=bone(body,0,-.10,.75);
  mesh(head,'pearl','deep',0,.02,.10,.39,.32,.48);
  mesh(head,'scale','iron',0,.02,.44,.73,.58,.69,-.17);
  rod(head,'trim',[0,.26,.39],[0,-.19,.65],.054,'horn');
  mesh(head,'pearl','body',0,-.22,.53,.23,.12,.20);
  for(const side of [-1,1]){
    rod(head,'edge',[side*.18,.20,.24],[side*.42,.37,.52],.131,'horn');
    mesh(head,'gem','glow',side*.12,.02,.556,.094,.039,.046,0,0,-side*.19);
    rod(head,'edge',[side*.21,-.11,.56],[side*.17,-.33,.61],.043,'horn');
  }
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const shield=bone(body,side*.56,.10,.43);
    mesh(shield,'wing','body',side*.01,.04,.45,side*.49,.53,.80,-1.32,-side*.24,side*.28);
    mesh(shield,'scale','iron',side*.43,.06,.45,.59,.91,.67,-1.26,0,-side*.78);
    rod(shield,'trim',[side*.11,.24,.29],[side*.84,-.07,.96],.046,'horn');
    arms.push(shield);
    for(const [index,z] of [-.72,-.13,.39].entries()){
      const leg=bone(body,side*.48,-.02,z);
      const knee=[side*(.39+index*.11),-.12,-.21+index*.19];
      const toe=[side*(.69+index*.085),-.77,-.36+index*.32];
      rod(leg,'body',[0,0,0],knee,.155);
      rod(leg,'trim',knee,toe,.149,'horn');
      mesh(leg,'scale','iron',knee[0],knee[1],knee[2],.37,.37,.39,-.91,0,side*.33);
      legs.push(leg);
    }
  }
  return {body,head,arms,legs};
}

const nabataElements={m085:'fire',m086:'water',m087:'thunder',m088:'wind'};

function nabataMage(k,element){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.92,0);
  mesh(body,'pearl','deep',0,.43,0,.41,.65,.34);
  mesh(body,'scale','trim',0,.47,.32,.71,.97,.60,-.23);
  const head=bone(body,0,1.08,.12);
  mesh(head,'round','deep',0,.065,0,.24,.31,.25);
  mesh(head,'scale','edge',0,.08,.20,.37,.48,.73);
  mesh(head,'gem','glow',0,.075,.312,.113,.048,.036);
  mesh(head,'horn','deep',0,.35,-.035,.30,.48,.31,.2);
  const crest=bone(body,0,1.01,-.28);
  mesh(crest,'ring','glow',0,.17,0,.66,.78,.29);
  mesh(crest,'ring','body',0,.17,-.04,.75,.88,.46);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=bone(body,side*.42,.63,.06);
    mesh(arm,'scale','trim',side*.12,.16,.07,.47,.57,.77,.09,0,-side*.57);
    mesh(arm,'pearl','body',side*.10,-.25,.15,.16,.37,.15);
    arms.push(arm);
    const skirt=bone(body,side*.26,.30,-.14);
    mesh(skirt,'mantle','deep',0,.11,0,side*.66,1.36,.93,.12,-side*.47,0);
    mesh(skirt,'mantle','body',side*.03,.06,.15,side*.33,1.32,.79,.18,-side*.29,0);
    rod(skirt,'trim',[side*.28,-.06,.08],[side*.60,-1.13,.12],.037);
    legs.push(skirt);
  }
  const staff=bone(arms[1],.08,-.35,.26);
  rod(staff,'edge',[0,-1.03,0],[0,1.38,0],.047);
  if(element==='fire'){
    mesh(staff,'ring','glow',-.20,1.48,0,.37,.40,.63,0,.21,-.27);
    mesh(staff,'gem','trim',-.19,1.49,0,.24,.25,.090);
    for(let ray=0;ray<5;ray++){
      const angle=ray*TAU/5;
      rod(staff,'glow',[-.20,1.49,0],[-.20+Math.sin(angle)*.35,1.49+Math.cos(angle)*.37,0],.031,'horn');
    }
  }else if(element==='water'){
    mesh(staff,'ring','glow',0,1.46,0,.23,.42,.45,-.09,0,-.18);
    mesh(staff,'gem','glow',0,1.36,0,.12,.19,.085);
  }else if(element==='thunder'){
    mesh(staff,'gem','glow',0,1.38,0,.13,.14,.096);
    for(const side of [-1,1]){
      rod(staff,'edge',[0,1.39,0],[side*.32,1.56,.035],.069);
      rod(staff,'glow',[side*.26,1.54,.032],[side*.48,1.28,.03],.042,'horn');
    }
  }else{
    const a=[-.24,1.42,0],b=[0,1.76,0],c=[.24,1.42,0],d=[0,1.08,0];
    for(const [from,to] of [[a,b],[b,c],[c,d],[d,a]])rod(staff,'glow',from,to,.035);
    mesh(staff,'gem','glow',0,1.42,0,.123,.21,.11);
  }
  return {body,head,arms,legs,sourceCrest:crest};
}

function yamaTwins(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,1.21,0);
  const arms=[];
  for(const side of [-1,1]){
    const twin=bone(body,side*.39,side*.37,side*.31);
    mesh(twin,'scale','deep',0,-.34,.04,.63,.91,.70);
    mesh(twin,'scale','trim',0,.04,.18,.54,.72,.62);
    const head=bone(twin,0,.46,.10);
    const crown=side===-1?'edge':'trim';
    mesh(head,'round','body',0,0,0,.18,.19,.18);
    mesh(head,'scale',crown,0,.12,.09,.37,.32,.46);
    mesh(head,'gem','glow',0,-.028,.17,.10,.042,.04);
    for(let feather=0;feather<6;feather++){
      const a=feather*.155;
      rod(twin,feather%3?crown:'trim',[side*.13,-.34+a,-.20],
        [side*(.38+a*.57),.27+a*.68,-.48-a*.57],.088,'horn');
      rod(twin,'trim',[side*.16,-.59+a*.44,0],[side*(.34+a*.48),-.81+a*.39,.21],.055,'horn');
    }
    const arm=bone(twin,side*.27,.07,.11);
    rod(arm,'trim',[0,0,0],[side*.48,-.16,.29],.081);
    rod(arm,'body',[side*.44,-.12,.16],[side*.68,.28,.4],.045);
    mesh(arm,'gem','glow',side*.69,.32,.42,.116,.13,.115);
    arms.push(arm);
  }
  return {body,arms};
}

function shahRoyalPair(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.96,0);
  const wings=[],arms=[];
  for(const side of [-1,1]){
    const court=bone(body,side*.41,side*.13,side*.14);
    mesh(court,'bar',side>0?'edge':'body',0,-.25,.04,.34,.73,.31);
    mesh(court,'scale','trim',0,.28,.13,.54,.63,.56,.22);
    mesh(court,'round','edge',0,.64,0,.16,.21,.16);
    mesh(court,'bar','trim',0,.82,0,.21,.092,.20);
    rod(court,'trim',[0,.81,0],[0,1.03,-.02],.109,'horn');
    mesh(court,'mantle','edge',-.09,.26,-.16,.56,.94,.78,.26,.96,.14);
    const sceptre=bone(court,side*.26,.29,.16);
    rod(sceptre,'edge',[0,-.29,-.24],[side*.27,.32,.37],.051);
    mesh(sceptre,'gem','glow',side*.29,.35,.41,.119,.11,.10);
    arms.push(sceptre);
    const silk=bone(court,side*.17,.64,-.12);
    const curve=[[0,-.05,0],[side*.26,.29,-.16],[side*.38,.55,-.23],[side*.18,.67,-.41],[side*.01,.74,-.45]];
    for(let i=1;i<curve.length;i++)rod(silk,i===curve.length-1?'glow':'edge',curve[i-1],curve[i],.05-i*.006);
    wings.push(silk);
  }
  body.userData.silks=wings;
  return {body,arms};
}

function varunaChariot(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.72,0);
  const tail=bone(body,0,-.18,-.52);
  for(let segment=0;segment<12;segment++){
    const point=i=>[Math.sin(i*.57)*.28,-.05-Math.sin(i*.27)*.24,-i*.15];
    rod(tail,segment%3?'body':'edge',point(segment),point(segment+1),.17-segment*.010);
  }
  mesh(body,'metal','trim',0,.03,.0,.84,.19,1.04);
  const crown=bone(body,0,.33,.66);
  for(let hood=-2;hood<=2;hood++){
    const x=hood*.217,y=.57-Math.abs(hood)*.085;
    mesh(crown,'scale','body',x,y,0,.40,.65,.44,.16,hood*.18,-hood*.34);
    mesh(crown,'scale','trim',x,y-.075,.115,.18,.40,.36,.28,0,-hood*.34);
    mesh(crown,'gem','glow',x,y+.132,.126,.053,.080,.049);
  }
  for(const side of [-1,1]){
    for(let rail=0;rail<6;rail++)rod(body,'trim',[side*.39,.06,rail*.14-.39],[side*.42,.31,rail*.14-.36],.026);
    rod(body,'edge',[side*.43,.32,-.51],[side*.43,.32,.47],.046);
  }
  const rider=bone(body,0,.30,-.12);
  mesh(rider,'pearl','body',0,.34,0,.26,.46,.23);
  mesh(rider,'scale','trim',0,.32,.16,.44,.50,.79);
  const head=bone(rider,0,.72,.03);
  mesh(head,'round','edge',0,0,0,.163,.22,.14);
  rod(head,'trim',[0,.14,0],[0,.44,-.035],.073,'horn');
  const arms=[];
  for(const side of [-1,1]){
    const arm=bone(rider,side*.206,.45,.02);
    rod(arm,'edge',[0,0,0],[side*.27,-.19,.20],.071);
    if(side===1){
      rod(arm,'trim',[side*.26,-.19,.19],[.41,-.14,.56],.042);
      rod(arm,'glow',[.41,-.14,.52],[.47,.16,.89],.028,'horn');
    }
    arms.push(arm);
  }
  return {body,head,tail,arms,spellHood:crown};
}

function asuraDisciple(k,entry){
  const {mesh,bone,rod}=k;
  const parts=humanoid(k,{...entry,crest:'sunwheel'});
  const {body,head,arms}=parts;
  mesh(head,'pearl','edge',0,.31,-.01,.34,.28,.29);
  const crest=bone(body,0,1.2,-.26);
  mesh(crest,'ring','trim',0,.16,0,.75,.73,.70);
  for(let ray=0;ray<12;ray++){
    const angle=ray*TAU/12;
    const x=Math.cos(angle),y=Math.sin(angle);
    rod(crest,'trim',[x*.65,y*.65+.16,0],[x*.87,y*.87+.16,0],.066,'horn');
  }
  for(const side of [-1,1]){
    const arm=bone(body,side*.24,.79,-.17);
    mesh(arm,'bar','body',side*.34,.18,0,.128,.68,.16,0,0,side*-1.20);
    mesh(arm,'bar','body',side*.70,.46,.05,.116,.43,.15,.42,0,side*.37);
    mesh(arm,'gem','trim',side*.73,.65,.075,.109,.135,.10);
    mesh(arm,'scale','edge',side*.79,.73,.15,.46,.20,.37,.83,0,side*1.18);
    arms.push(arm);
    const sash=bone(body,side*.24,.53,-.19);
    mesh(sash,'mantle','glow',0,.06,0,side*.37,.88,.67,-.32,-side*.66,0);
    if(side===1)body.userData.train=sash;
  }
  return {...parts,sourceCrest:crest};
}

function jadeEmperor(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,1.12,0);
  const clouds=bone(body,0,-.61,0);
  for(let i=0;i<10;i++){
    const a=i*2.399;
    mesh(clouds,'round','mist',Math.sin(a)*.66,i%3*.11,Math.cos(a)*.61,.44,.28,.45);
  }
  mesh(body,'pearl','deep',0,.34,0,.42,.76,.35);
  mesh(body,'scale','body',0,.25,.33,.88,1.61,.66,.11);
  mesh(body,'scale','trim',0,.19,.40,.36,1.37,.47,.12);
  const head=bone(body,0,1.11,.03);
  mesh(head,'pearl','edge',0,.06,.072,.24,.297,.23);
  mesh(head,'metal','deep',0,.30,-.05,.64,.06,.44,.12,0,-.05);
  mesh(head,'bar','deep',0,.40,-.11,.26,.29,.19,.08);
  mesh(head,'scale','deep',0,-.09,.28,.18,.37,.33);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=bone(body,side*.45,.72,.075);
    mesh(arm,'scale','trim',side*.16,.03,.15,.47,.43,.78,.12,side*.42,side*.28);
    mesh(arm,'bar','body',side*.082,-.31,.10,.17,.48,.19,-.33,0,-side*.12);
    mesh(arm,'gem','edge',side*.095,-.54,.27,.111,.15,.12);
    arms.push(arm);
    mesh(body,'mantle','body',side*.22,.44,-.26,side*.59,1.22,.93,.23,-side*.35,0);
    for(let rib=0;rib<4;rib++){
      rod(body,'trim',[side*.23,.85-rib*.16,-.10],[side*(.64+rib*.08),1.10-rib*.19,-.49],.044,'horn');
      rod(body,'edge',[side*.12,.47-rib*.24,.41],[side*.33,.36-rib*.24,.37],.026);
    }
    for(let bead=0;bead<5;bead++){
      mesh(head,'gem','trim',side*(.050+bead*.044),.236-bead*.014,.235,.021,.031,.028);
    }
  }
  const hand=bone(arms[1],.095,-.52,.27);
  rod(hand,'trim',[0,0,-.40],[0,.045,1.08],.039);
  rod(hand,'edge',[0,.045,.94],[0,.06,1.48],.082,'horn');
  rod(hand,'glow',[0,.064,.92],[0,.09,1.34],.023,'horn');
  return {body,head,arms,legs,clouds};
}

function scarab(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.59,0);
  mesh(body,'round','deep',0,0,-.04,.44,.28,.71);
  const head=bone(body,0,.01,.56);
  mesh(head,'round','body',0,.03,.08,.25,.19,.26);
  const legs=[],arms=[];
  for(const side of [-1,1]){
    const shell=bone(body,side*.19,.19,-.10);
    mesh(shell,'round','body',side*.12,.06,-.12,.30,.33,.71,0,.11,side*.21);
    for(let ridge=0;ridge<5;ridge++){
      const z=.29-ridge*.20;
      rod(shell,'edge',[side*.07,.24,z],[side*.25,.43,z-.12],.067,'horn');
    }
    const claw=bone(head,side*.10,0,.15);
    rod(claw,'edge',[0,0,0],[side*.20,-.06,.31],.077,'horn');
    mesh(head,'gem','glow',side*.13,.08,.23,.066,.045,.045);
    arms.push(claw);
    for(let leg=0;leg<3;leg++){
      const joint=bone(body,side*.31,-.12,.38-leg*.39);
      const knee=[side*.32,-.03,.11-leg*.09];
      rod(joint,'body',[0,0,0],knee,.064);
      rod(joint,'edge',knee,[side*.50,-.34,leg*.06],.056,'horn');
      legs.push(joint);
    }
  }
  return {body,head,legs,arms};
}

function ornaments(k,entry,joints){
  const {root,mesh,rod,bone}=k;
  const mark=bone(root,0,1.28,-.05);
  const {crest,family}=entry;
  const body=joints.body;
  const appearance=[...entry.id].reduce((total,character)=>Math.imul(total,41)+character.charCodeAt(0),821)>>>0;
  const angle=appearance%31*.2;
  const constellation=crest==='halo'||crest==='orb'||crest==='orbs'||crest==='ring'||crest==='tendril';
  const ornament=family==='priest'||family==='emperor'||family==='shade';
  if(constellation){
    mesh(mark,'ring','trim',0,.44,-.25,.97,.97,.91,0,.10,.35);
    mesh(mark,'ring','deep',0,.44,-.28,1.04,1.04,.65,0,.10,.35);
    for(let i=0;i<(crest==='orbs'?6:4);i++){
      const a=i*TAU/(crest==='orbs'?6:4)+angle;
      mesh(mark,'gem','glow',Math.sin(a)*1.07,.44+Math.cos(a)*1.07,-.18,.15,.20,.15);
    }
  }
  if(['titan','spikes','guardian','magma','giant','ape','mandrill'].includes(crest))for(const side of [-1,1]){
    mesh(body,'gem','edge',side*.51,.63,-.15,.43,.69,.44,.13,0,side*.32);
    for(let i=0;i<3;i++)rod(body,'glow',[side*.47,.8-i*.16,.1],
      [side*(.85+i*.11),.99-i*.16,.08],.07,'horn');
  }
  if(crest==='pair'){
    const companion=bone(body,-.78,-.15,.03);
    mesh(companion,'pearl','edge',0,-.17,-.07,.30,.72,.24);
    const head=bone(companion,0,.50,.01);
    face(k,head,{snout:.14,broad:.23,horns:0});
    mesh(companion,'wing','body',-.12,.08,-.07,-.40,.63,.61,0,0,-1.13);
  }else if(crest==='crown'||crest==='broken'||crest==='spike'||crest==='antler'){
    const crown=joints.head??body;
    for(const side of [-1,1])for(let i=0;i<2;i++){
      rod(crown,'edge',[side*.17,.36,-.11],[side*(.33+i*.26),.86-i*.17,.13-i*.26],.11,'horn');
    }
  }else if(crest==='fox'){
    for(let i=-4;i<=4;i++){
      rod(body,'edge',[i*.057,.18,-.57],[i*.23,.95-Math.abs(i)*.105,-1.04],.13,'horn');
    }
  }
  for(let i=0;i<(ornament?3:2);i++){
    const a=i*2.399+angle;
    mesh(mark,'gem',i===0?'glow':'edge',Math.sin(a)*(ornament?.76:.53),
      (ornament?.91:.56)+Math.cos(a)*.39,.31+(appearance%5)*.05,.075+i*.021,.17-i*.022,.076,0,a,-a);
  }
  return mark;
}

function forestDetails(k,entry,parts){
  const {bone,mesh,rod}=k;
  const {body,head=body,arms=[]}=parts;
  const mark=bone(body,0,0,0);
  const shape=entry.crest;
  if(['greatblade','bloodblade','oar'].includes(shape)){
    const hand=arms.at(-1)??body;
    const pole=bone(hand,.10,-.59,.15);
    const oar=shape==='oar';
    rod(pole,'trim',[0,-.42,-.13],[0,.36,.50],.065);
    mesh(pole,'scale','edge',0,.51,.73,oar?.31:.18,oar?.57:.77,.77,-.48,0,.27);
    rod(pole,'glow',[0,.45,.83],[0,.76,1.21],.029,'horn');
  }
  if(['lantern','drum','bell','coffin','coin'].includes(shape)){
    const item=bone(body,0,.26,shape==='coffin'?-.51:.46);
    if(shape==='coffin'){
      mesh(item,'scale','deep',0,.46,-.04,.89,1.67,1.98);
      mesh(item,'scale','trim',0,.46,-.25,.76,1.46,.91);
      mesh(item,'ring','edge',0,.54,-.34,.30,.39,.57);
    }else if(shape==='lantern'||shape==='bell'){
      const bell=shape==='bell';
      mesh(item,'bar','trim',0,.28,.14,.29,.12,.29);
      mesh(item,bell?'horn':'metal','edge',0,.02,.14,.38,.59,.38,0,0,bell?0:.18);
      mesh(item,'round','glow',0,-.21,.28,.13,.17,.13);
      if(!bell)for(const side of [-1,1])rod(item,'deep',[side*.23,.27,.36],[side*.23,-.22,.37],.038);
    }else{
      mesh(item,'bar','trim',0,.06,0,.52,.28,.52,PI/2);
      mesh(item,'ring','edge',0,.06,.17,.53,.53,.67);
      mesh(item,shape==='coin'?'gem':'round','body',0,.06,.19,.43,.42,.09);
      mesh(item,'gem','glow',0,.063,.31,.108,.19,.035);
    }
  }
  if(['bramble','roots','antler','masonry','scarab','salamander','bones','claws'].includes(shape)){
    for(const side of [-1,1])for(let index=0;index<3;index++){
      const y=.37+index*.14,z=.40-index*.28,x=side*(.37+index*.06);
      mesh(body,'scale','edge',x,y,z,.26,.34,.66,-.27,side*.29,side*.43);
      rod(body,index===1?'glow':'trim',[x,y,z],[x+side*.23,y+.25,z-.18],.076,'horn');
    }
  }
  if(['antler','goat','boar','fox','crown'].includes(shape)){
    for(const side of [-1,1]){
      rod(head,'edge',[side*.19,.20,.08],[side*.49,.68,-.04],.122,'horn');
      rod(head,'trim',[side*.39,.54,-.05],[side*.67,.74,-.27],.063,'horn');
    }
  }
  if(['owl','paper','moth','glass'].includes(shape)){
    for(const [index,arm] of arms.entries()){
      const side=index%2===0?-1:1;
      for(let vane=0;vane<4;vane++){
        const x=side*(.61+vane*.24);
        mesh(arm,'scale',vane%2?'edge':'body',x,.21,-.17,.20,.36,.70,-.20,0,side*(.42+vane*.17));
      }
    }
  }
  if(['eyes','veils','orb','wax','eclipse'].includes(shape)){
    const count=shape==='eyes'?7:3;
    for(let index=0;index<count;index++){
      const angle=index*TAU/count;
      const x=Math.cos(angle)*.59,y=.49+Math.sin(angle)*.40;
      mesh(body,'round','deep',x,y,.50,.16,.15,.083);
      mesh(body,'gem','glow',x,y,.57,.079,.113,.046);
    }
  }
  if(['silk','lotus','eclipse','glass','bloodblade'].includes(shape)){
    mesh(mark,'ring','trim',0,.71,-.39,1.09,1.06,.67);
    for(let index=0;index<5;index++){
      const angle=index*TAU/5;
      mesh(mark,'gem','glow',Math.sin(angle)*1.09,.71+Math.cos(angle)*1.06,-.38,.073,.19,.076,0,.26,-angle);
    }
  }
  return mark;
}

export function mountBestiary(scene,entry,height,mobile=false){
  if(entry.source==='kuanglu15')entry={...entry,family:'rider'};
  const root=new T.Group(),materials=buildMaterials(entry);
  const k=kit(root,materials);
  if(!paoForms.has(entry.id))k.sculpt=sculptPao(k);
  let parts;
  if(paoForms.has(entry.id))parts=buildPao(k,entry,mobile);
  else if(nabataElements[entry.id])parts=nabataMage(k,nabataElements[entry.id]);
  else if(entry.id==='m114')parts=shahRoyalPair(k);
  else if(entry.id==='m115')parts=yamaTwins(k);
  else if(entry.id==='m117')parts=asuraDisciple(k,entry);
  else if(entry.id==='m122')parts=varunaChariot(k);
  else if(entry.id==='m133')parts=jadeEmperor(k);
  else if(entry.id==='m150')parts=imperialTurtle(k);
  else if(entry.id==='m154')parts=bullOni(k);
  else if(entry.id==='m155')parts=eggGhost(k);
  else if(entry.crest==='scarab')parts=scarab(k);
  else if(entry.id==='m124'||entry.id==='m125')parts=serpentGuardian(k,entry.id==='m124');
  else if(entry.id==='m106')parts=coil(k,entry);
  else if(entry.id==='m005')parts=humanoid(k,{...entry,family:'ogre',crest:'bear'});
  else if(['m090','m091','m092'].includes(entry.id))parts=quadruped(k,{...entry,family:'rider'});
  else switch(entry.family){
    case 'turtle':case 'beast':case 'rider':parts=quadruped(k,entry);break;
    case 'dragon':case 'bird':case 'wasp':parts=flyer(k,entry);break;
    case 'serpent':case 'hydra':parts=coil(k,entry);break;
    case 'star':case 'eggs':parts=star(k,entry);break;
    case 'spider':parts=spider(k,entry.id==='m121');break;
    default:parts=humanoid(k,entry);break;
  }
  const sculptEntry=entry.id==='m005'?{...entry,family:'ogre'}:entry;
  const dedicatedSilhouette=['m114','m115','m122','m133','m150','m154'].includes(entry.id);
  const crest=parts.crest??parts.sourceCrest??(dedicatedSilhouette?k.bone(root,0,0,0):
    entry.palette?forestDetails(k,entry,parts):ornaments(k,entry,parts));
  const detail=parts.pao?null:detailCreature(k,sculptEntry,parts,mobile);
  k.sculpt?.finish(k.geometry);
  k.finish();
  const box=new T.Box3().setFromObject(root);
  const aura=detail&&!entry.field?creatureAura(root,box,colors(entry)[3],detail):null;
  const reference=KoreanBossArt[entry.id];
  const ratio=reference?.[2];
  const width=ratio?T.MathUtils.clamp(Math.sqrt(ratio/.91),.80,1.20):1;
  const dimensions=entry.proportions??(parts.pao?[1,1,1]:[width,1,1+(width-1)*.36]);
  scene.add(root);
  const pattern=parts.pao?'hover':parts.mount?'gallop':entry.id==='m005'?'slam':entry.crest==='scarab'||entry.id==='m154'?'crawl':
    entry.id==='m106'?'coil':entry.id==='m124'?'duel':['m114','m115','m133','m155'].includes(entry.id)?'hover':poses[entry.family];
  return {root,materials,entry,crest,dimensions,palette:colors(entry),bounce:reference?Math.min(.39,reference[3])*.13:0,
    scale:height*.87/Math.max(1.7,box.max.y*dimensions[1]),pattern,detail,aura,...parts};
}

export function poseBestiary(model,unit,spec,time,x,z){
  const {root,body,crest,head,arms=[],legs=[],tail,pattern,scale,dimensions,materials,mount}=model;
  const stage=spec.phase??unit.bossPhase??0;
  const fall=spec.fall??0;
  const wind=unit.attack?1-unit.attack.time/Math.max(.001,unit.attack.windup??unit.spec.time):0;
  const strike=unit.motion?Math.max(0,1-unit.motion.age/.32):0;
  const beat=time*(pattern==='flutter'?24:pattern==='wing'?8:4.2)+(unit.phase??0);
  const airborne=['wing','flutter','hover'].includes(pattern);
  const travel=spec.stepWeight??unit.move??0;
  const step=spec.gaitPhase??beat;
  const float=airborne?.24+Math.sin(beat)*(.145+model.bounce)+stage*.10:Math.sin(beat)*(.05+model.bounce*travel);
  const phaseScale=1+stage*(model.pao?.047:.155);
  root.visible=(spec.fade??1)>.18;
  root.position.set(x,.02+Math.max(0,(spec.bob??0)*.38+float)*(1-fall),z);
  const attack=unit.attack??unit.motion;
  const facing=attack&&Number.isFinite(attack.dz)?Math.atan2(attack.dx,attack.dz):
    travel>.07&&Number.isFinite(spec.heading)?spec.heading:model.heading??(unit.face>0?.47:-.47);
  const change=facing-(model.heading??facing);
  model.heading=(model.heading??facing)+Math.atan2(Math.sin(change),Math.cos(change))*.23;
  root.rotation.set(-fall*1.43+strike*.10,model.heading+Math.sin(beat*.37)*.035,(spec.tilt??0)*.62+fall*.24);
  const [width,height,depth]=dimensions;
  root.scale.set(scale*phaseScale*width,scale*phaseScale*height*(1-(spec.compression??0)*.31),scale*phaseScale*depth);
  body.rotation.x=-(wind*.22)+strike*(pattern==='slam'?.56:.26)+Math.sin(beat)*.025;
  body.rotation.z=(spec.bend??0)*.33+Math.sin(beat)*.046*(travel+.25);
  if(head)head.rotation.x=Math.sin(beat*.76)*.055+wind*.17-strike*.16;
  for(const [index,arm] of arms.entries()){
    const sign=index%2===0?-1:1;
    if(pattern==='wing'||pattern==='flutter'){
      arm.rotation.z=sign*(.09+Math.sin(beat)*.39+wind*.30-strike*.48);
    }else if(pattern==='coil'){
      arm.rotation.x=-wind*.32+strike*.63;
      arm.rotation.z=Math.sin(beat*.7+index)*.13;
    }else if(pattern==='radial'){
      arm.scale.setScalar(1+wind*.25+Math.sin(beat+index)*.11);
    }else{
      arm.rotation.x=wind*(sign>0?-1.26:-.55)+strike*(pattern==='aim'?.25:1.07)+Math.sin(step+index*PI)*travel*.24;
      arm.rotation.z=sign*(.10+wind*.33+stage*.10);
    }
  }
  for(const [index,leg] of legs.entries()){
    leg.rotation.x=Math.sin(step+index*PI*.81)*travel*(pattern==='crawl'?.24:.49);
    if(pattern==='coil')leg.position.y=leg.restHeight+Math.sin(beat+index*.83)*(.09+stage*.03);
  }
  if(tail)tail.rotation.y=Math.sin(beat*.55)*.25+strike*.25;
  if(model.neck){
    model.neck.position.z=.77-wind*.43+strike*.65;
    model.neck.rotation.x=wind*.30-strike*.38;
    model.jaws.rotation.x=strike*.47;
  }
  if(model.clouds){
    model.clouds.rotation.y=beat*.24;
    model.clouds.position.z=-strike*.37;
    model.clouds.scale.set(1+strike*.27,1+Math.sin(beat)*.17,1+wind*.26);
  }
  if(body.userData.parrot){
    const {parrot,cannon}=body.userData;
    parrot.position.set(Math.cos(time*2.1)*.62,1.78+Math.sin(time*9.4)*.14,Math.sin(time*2.1)*.62);
    parrot.rotation.set(Math.sin(time*9.4)*.39,time*2.1,Math.cos(time*9.4)*.15);
    cannon.position.z=.35-strike*.27;
    cannon.rotation.x=-wind*.13+strike*.15;
  }
  if(body.userData.silks)for(const [i,silk] of body.userData.silks.entries()){
    silk.rotation.z=Math.sin(beat*.81+i)*.19+(wind-strike)*.32;
  }
  if(model.spellHood){
    model.spellHood.scale.set(1+wind*.21,1+strike*.17,1+wind*.08);
    model.spellHood.rotation.x=wind*.23-strike*.29;
  }
  if(model.pao)posePao(model,unit,time,{stage,wind,strike,travel,fall,step,flash:spec.flash??0});
  if(model.detail)poseCreatureDetail(model.detail,model,time,beat,wind,strike,travel);
  model.aura?.pose(time,stage,wind,fall);
  if(model.entry.id==='m154'){
    body.rotation.x=-wind*.20+strike*.23;
    for(const [index,shield] of arms.entries()){
      const side=index?1:-1;
      shield.rotation.set(wind*.44-strike*.57,side*(wind*.33-strike*.59),side*(wind*.45-strike*.21));
    }
  }
  const train=body.userData.train;
  if(train){
    train.rotation.x=-travel*.16+Math.sin(beat*1.6)*.061;
    train.rotation.z=(wind-strike)*.14+Math.sin(beat*.70)*.068;
  }
  if(mount){
    const {knight,hand,mantle,embers,trial}=mount;
    const charge=['lance','pounce'].includes(unit.attack?.pattern??unit.motion?.pattern);
    const lift=Math.max(wind,strike)*.28;
    knight.rotation.x=-wind*.34+strike*(charge?.50:.25)+travel*Math.sin(beat*1.7)*.064;
    knight.rotation.y=(wind-strike)*.31;
    hand.rotation.set(trial==='bow'?-wind*.40+strike*.23:-wind*.83+strike*.79,
      (wind-strike)*(trial==='swords'?.70:.49),wind*(['spear','pennant'].includes(trial)?.84:.43)-strike*.39);
    mantle.rotation.x=-travel*.30-Math.sin(beat*1.8)*.10-lift;
    embers.position.y=.46+Math.sin(beat*1.6)*.09+lift;
    embers.rotation.z=Math.sin(beat*.7)*.21+strike*.27;
    head.rotation.x-=lift;
    legs[1].rotation.x-=lift;
    legs[3].rotation.x-=lift;
  }
  crest.rotation.z=airborne||pattern==='radial'?time*(.31+stage*.24):Math.sin(beat*.5)*.16;
  crest.scale.setScalar(1+stage*.20+wind*.13);
  const glow=model.palette[3];
  materials.glow.color.setHex(glow).lerp(white,Math.min(.84,(spec.flash??0)*.78+wind*.18));
  materials.body.emissiveIntensity=.14+(spec.flash??0)*.19+stage*.08;
  materials.edge.emissiveIntensity=.14+stage*.087+wind*.07;
}

const white=new T.Color(0xfff4e0);
export function removeBestiary(scene,model){
  scene.remove(model.root);
  model.pao?.energy.dispose();
  model.aura?.dispose();
  model.root.traverse(part=>{if(part.isMesh)part.geometry.dispose();});
  for(const material of Object.values(model.materials))material.dispose();
}

export function bestiaryTint(entry){return colors(entry)[3];}
