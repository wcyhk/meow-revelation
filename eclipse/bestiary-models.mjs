import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=penumbra-1';
import {KoreanBossArt} from './korean-art.mjs?v=pao-1';
import {buildPao,paoForms,posePao} from './pao-model.mjs?v=chiaroscuro-1';
import {paoMaterials,forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {creatureFace,detailCreature,poseCreatureDetail} from './creature-detail.mjs?v=sculpted-1';
import {enemyEnergy} from './enemy-energy.mjs?v=turnaround-1';
import {carveEggGhost,carveImperialTurtle,carveJadeEmperor,carveRoyalPair,carveVaruna} from './giant-boss-sculpt.mjs?v=jade-rig-1';
import {sculptPao} from './pao-sculpt.mjs?v=chiaroscuro-1';
import {sculptDestroyer,sculptPhoenix,sculptWhiteBear,poseSignatureBeast} from './signature-beasts.mjs?v=sculpted-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {articulatedWing} from './wing-sculpt.mjs?v=sculpted-1';
import {poseKirin,sculptKirin} from './kirin-sculpt.mjs?v=lantern-nave-1';
import {catalogueFinishes,catalogueSculpt} from './catalogue-sculpt.mjs?v=maskwork-1';
import {finishesA,sculptA} from './catalogue-volume-a.mjs?v=turnaround-1';
import {finishesB,sculptB} from './catalogue-volume-b.mjs?v=maskwork-1';
import {finishesC,sculptC} from './catalogue-volume-c.mjs?v=jointwork-1';
import {buildCampaignSculpt,poseCampaignSculpt} from './campaign-sculpt.mjs?v=turnaround-2';
import {finishSpecialBoss} from './special-boss-finish.mjs?v=turnaround-2';
import {bossSkin} from './boss-skin.mjs?v=jointwork-1';
import {refineBossA} from './boss-refinements-a.mjs?v=jointwork-1';
import {refineBossB} from './boss-refinements-b.mjs?v=jointwork-1';
import {refineBossC} from './boss-refinements-c.mjs?v=jointwork-1';
import {refineGuardian} from './guardian-refinements.mjs?v=jointwork-1';
import {refineCreature} from './creature-refinements.mjs?v=jointwork-1';

const PI=Math.PI,TAU=PI*2;
const authoredFinishes={...catalogueFinishes,...finishesA,...finishesB,...finishesC};
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
  m133:[0x181c27,0x604023,0xe0b770,0x77e8e5],
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
  function surface(color,metalness,roughness,finish){
    const conduct=metalness>.23;
    const scan=scannedSurface(conduct?'hammered':'leather',conduct?.55:.40);
    const bump=scan.normalMap?{}:{bumpMap:relief(),bumpScale:chitin?.062:.043};
    return paintedFinish(new T.MeshStandardMaterial({
      color,metalness,roughness,...bump,...scan,vertexColors:true,emissive:color,emissiveIntensity:.03,
      envMap:conduct?forgeEnvironment():null,envMapIntensity:metal?.81:.48,
    }),finish,true);
  }
  const pigment=color=>new T.Color(color).lerp(new T.Color(0x5d5049),.20);
  const trim=new T.Color(edge).lerp(new T.Color(0xb48556),.52);
  const finishes={
    deep:surface(pigment(dark),metal?.31:.07,ethereal?.62:.88,'cloth'),
    body:surface(pigment(body),metal?.52:chitin?.27:.10,metal?.43:chitin?.48:.75,finish??(metal?'iron':chitin?'stone':'hide')),
    edge:surface(pigment(edge),metal?.56:.17,.47,metal?'iron':'bone'),
    trim:surface(trim,.45,.43,'bronze'),
    glow:new T.MeshBasicMaterial({color:glow}),
  };
  if(['dragon','bird','wasp'].includes(entry.family)||entry.id==='m024'){
    const skin=new T.Color(body).lerp(new T.Color(entry.id==='m024'?0x7c8390:dark),.47);
    finishes.wingSkin=surface(skin,.065,.90,'hide');
    finishes.wingSkin.side=T.DoubleSide;
  }
  if(['m005','m015','m027'].includes(entry.id)){
    const bear=entry.id==='m005';
    finishes.deep.color.setHex(bear?0x2b2a29:0x2c1b20);
    finishes.body.color.setHex(bear?0x625b51:0x773021);
    finishes.edge.color.setHex(bear?0x999b98:0xd39e60);
    if(bear)finishes.edge.roughness=.87;
    finishes.glow.color.setHex(bear?0xbbf7f1:0xffc455);
    Object.assign(finishes,{
      rust:surface(bear?0xab2b15:0xa93417,bear?.34:.08,.68,bear?'iron':'hide'),
      ember:surface(bear?0xcc4a22:0xec881e,bear?.29:.12,.52,bear?'iron':'hide'),
      coal:surface(bear?0x381b17:0x4a211e,.25,.72,'stone'),
      ivory:surface(bear?0xd0b587:0xf2d190,.10,.65,'bone'),
      ash:surface(0x6e6860,.06,.83,'cloth'),
    });
    if(entry.id==='m027'){
      finishes.rust.color.setHex(0x7f291c);
      finishes.coal.color.setHex(0x242026);
      finishes.coal.metalness=.54;
      finishes.trim.color.setHex(0x9c7957);
      finishes.ember.color.setHex(0xb04725);
      finishes.ivory.color.setHex(0xa99171);
    }
  }
  if(entry.id==='m014'){
    finishes.body=surface(0x3d496b,.62,.46,'iron');
    finishes.edge=surface(0x9cabc2,.66,.44,'iron');
    finishes.trim=surface(0x817183,.51,.54,'bronze');
    finishes.coal=surface(0x222a40,.30,.73,'stone');
    finishes.ivory=surface(0x9aadb5,.38,.58,'bone');
    finishes.rust=surface(0x68190e,.19,.61,'stone');
    finishes.ember=surface(0xbd3c13,.29,.45,'iron');
    finishes.ember.emissive.setHex(0xff3707);
    finishes.ember.emissiveIntensity=.48;
  }
  if(entry.family==='turtle'){
    finishes.shell=surface(new T.Color(body).lerp(new T.Color(0x23334d),.61),.54,.62,'iron');
    finishes.rim=surface(new T.Color(edge).lerp(new T.Color(0x414c66),.71),.67,.51,'bronze');
    if(entry.id==='m022'){
      finishes.body.color.setHex(0x314258);
      finishes.edge.color.setHex(0xa3acb4);
      finishes.trim.color.setHex(0x826b43);
    }
  }
  if(entry.id==='m024'){
    finishes.wingSkin.color.setHex(0x626978);
    finishes.trim.color.setHex(0x9d844c);
    finishes.edge.color.setHex(0xa5a77a);
    finishes.body.color.setHex(0x465137);
  }
  if(entry.id==='m150'){
    finishes.copper=surface(0x74472a,.73,.44,'bronze');
    finishes.burntShell=surface(0x35292b,.22,.68,'bone');
    finishes.royalShell=surface(0xb89762,.57,.48,'bronze');
    finishes.glow.color.setHex(0xc583e3);
  }
  if(entry.id==='m133'){
    finishes.royal=surface(0xa26e30,.82,.44,'bronze');
    finishes.goldWear=surface(0xd4ab5a,.79,.36,'bronze');
    finishes.redEnamel=surface(0xa82e24,.50,.45,'iron');
    finishes.blueSteel=surface(0x303d50,.64,.47,'iron');
    finishes.polished=surface(0xc2cdca,.81,.30,'iron');
    finishes.jadeMask=surface(0x40484e,.62,.48,'iron');
    finishes.darkBraid=surface(0x25282b,.05,.85,'cloth');
    finishes.silverHair=surface(0x7d7971,.07,.80,'cloth');
    finishes.jadeSilk=surface(0xa96c61,.04,.88,'cloth');
    finishes.jadeSilk.side=T.DoubleSide;
  }
  if(entry.id==='m155'){
    finishes.shellIvory=surface(0xc19463,.10,.65,'bone');
    finishes.shellScar=surface(0x8c694b,.05,.83,'bone');
    finishes.redBinding=surface(0x9d332f,.39,.55,'bronze');
  }
  if(entry.id==='m122'){
    finishes.varunaSkin=surface(0xc18d73,.08,.67,'bone');
    finishes.varunaRed=surface(0x843936,.30,.57,'iron');
    finishes.varunaBlue=surface(0x25586d,.56,.43,'bronze');
    finishes.trim.color.setHex(0x9e753e);
  }
  if(['m114','m115'].includes(entry.id)){
    finishes.royalCrimson=surface(0x6b2926,.37,.58,'iron');
    finishes.royalPale=surface(0xb8b2a7,.10,.68,'bone');
    finishes.royalIvory=surface(0xc8b08a,.07,.77,'cloth');
    finishes.royalCyan=surface(0x28576a,.49,.55,'bronze');
    finishes.bronzeRib=surface(0x805429,.68,.46,'bronze');
    finishes.trim.color.setHex(0xa88043);
  }
  if(entry.id==='m154')finishes.iron=surface(0x4c4745,.66,.41,'iron');
  if(entry.id==='m106')finishes.mist=new T.MeshStandardMaterial({
    color:0xa2c5de,emissive:0x526b85,
    emissiveIntensity:.36,roughness:1,transparent:true,opacity:.54,depthWrite:false,
  });
  for(const [name,parameters] of Object.entries(authoredFinishes[entry.id]??{})){
    finishes[name]=surface(...parameters);
  }
  if(finishes.silk)Object.assign(finishes.silk,{
    side:T.DoubleSide,transparent:true,opacity:.72,depthWrite:false,forceSinglePass:true,
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
        const pigment=materials[finish].vertexColors?new Float32Array(count*3):null;
        let cursor=0;
        for(const batch of batches){
          const geo=batch.geo??shapes[batch.shape];
          const {position,normal:direction,uv:tex,color}=geo.attributes;
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
              if(pigment){
                const shade=color?1:.96+.04*Math.sin(position.getX(source)*3.3+position.getY(source)*1.78);
                pigment[cursor*3]=color?color.getX(source):shade;
                pigment[cursor*3+1]=color?color.getY(source):shade;
                pigment[cursor*3+2]=color?color.getZ(source):shade;
              }
              cursor++;
            }
          }
          batch.geo?.dispose();
        }
        const geo=new T.BufferGeometry();
        geo.setAttribute('position',new T.BufferAttribute(positions,3));
        geo.setAttribute('normal',new T.BufferAttribute(normals,3));
        geo.setAttribute('uv',new T.BufferAttribute(uv,2));
        if(pigment)geo.setAttribute('color',new T.BufferAttribute(pigment,3));
        part.add(new T.Mesh(geo,materials[finish]));
      }
    }
  }
  return {root,mesh,rod,bone,finish,geometry,materials};
}

function face(k,joint,options={}){
  const {mesh,rod}=k;
  const {snout=.36,broad=.39,horns=2,shell=false,reptile=false}=options;
  k.geometry(joint,'body',sculptVolume([[0,-.257,.04,broad*.59,.215],[0,-.06,.01,broad*.98,.402],
    [0,.145,-.012,broad,.402],[0,reptile?.29:.377,-.083,broad*.81,.340],
    [0,reptile?.35:.468,-.122,broad*.38,.194],[0,reptile?.37:.492,-.124,.017,.022]],
  {sides:15,rings:15,section:2.60,ridge:.105}));
  if(reptile){
    mesh(joint,'scale','body',0,-.101,.35,broad*1.56,.285,snout*3.0,-.40);
    mesh(joint,'pearl','deep',0,-.143,.41,broad*.71,.043,snout*.87);
    mesh(joint,'pearl','edge',0,-.199,.38,broad*.60,.095,snout*.75);
    mesh(joint,'scale','trim',0,.227,.393,broad*.58,.15,.46,-.38);
  }else{
    k.geometry(joint,'edge',sculptVolume([[0,-.340,.22,broad*.35,snout*.54],[0,-.252,.315,broad*.69,snout*.80],
      [0,-.115,.324,broad*.74,snout*.68],[0,.034,.262,broad*.55,snout*.47],[0,.142,.235,broad*.30,snout*.30]],
    {sides:12,rings:13,section:2.61,ridge:.12}));
    mesh(joint,'scale','deep',0,-.211,.37,broad*.71,.094,snout*.75,.24);
  }
  for(const side of [-1,1]){
    const eye=reptile?.505:.399;
    mesh(joint,'round','deep',side*broad*.61,.085,eye-.052,.106,.092,.072,0,0,side*.21);
    mesh(joint,'gem','glow',side*broad*.61,.10,eye,.067,.043,.027,0,0,side*.19);
    rod(joint,'trim',[side*broad*.38,.148,eye+.008],[side*broad*.88,.159,eye-.02],.023);
    mesh(joint,reptile?'scale':'pearl',shell?'edge':'body',side*broad*.79,.025,.218,.17,.25,.45,0,side*.54,side*.34);
    rod(joint,'edge',[side*broad*.48,-.21,.37],[side*broad*.43,-.41,.43],.068,'horn');
  }
  if(horns===1)k.sculpt.sweep(joint,'edge',[[.04,.31,.075,.153],[.008,.46,.09,.125],[-.002,.62,.047,.084],
    [.043,.81,-.095,.039],[.105,.85,-.194,.004]],{sides:9,steps:14,ridge:.21});
  creatureFace(k,joint,{snout,broad,reptile,horns});
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
  k.geometry(body,'deep',sculptVolume([[0,-.48,-.047,width*.52,.20],[0,-.26,-.023,width*.82,.33],
    [0,.028,.013,width*.86,.348],[0,.27,.005,width*.83,.335],[0,.45,-.014,width*.61,.26]],
  {sides:13,rings:13,section:2.37,ridge:.11}));
  k.geometry(body,'body',sculptVolume([[0,-.12,.025,width*.65,.257],[0,.17,.014,width*.76,.321],
    [0,.41,.018,width*.99,.353],[0,.641,-.008,width*1.14,.399],
    [0,.80,-.026,width*.98,.309],[0,.97,-.003,width*.44,.203]],
  {sides:16,rings:18,section:huge?2.25:2.64,ridge:.12}));
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
  }else face(k,head,{broad:court?.28:width*.62,snout:court?.11:.22,horns:entry.crest==='oni'?1:huge?2:0});
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
  const legs=[],arms=[],limbs=[];
  for(const side of [-1,1]){
    const leg=bone(root,side*width*.56,1.12,.04);
    mesh(leg,'pearl','deep',0,-.25,0,.20,.40,.23);
    mesh(leg,'gem','body',0,-.57,.04,.22,.34,.239);
    mesh(leg,'pearl','edge',0,-.94,.13,.25,.15,.33);
    legs.push(leg);
    const arm=bone(body,side*width*.97,.62,.03);
    k.geometry(arm,'edge',sculptVolume([[side*.15,-.195,.008,.117,.143],[side*.071,-.050,.03,.267,.282],
      [side*.045,.119,.017,.24,.263],[side*.017,.231,-.018,.153,.184],[0,.286,-.055,.045,.066]],
    {sides:13,rings:13,section:2.6,ridge:.10}));
    for(let pin=0;pin<3;pin++)mesh(arm,'gem','trim',side*(.08+pin*.06),.029+pin*.034,.273,.044,.045,.034);
    const elaborate=['m016','m017','m081','m101','m107','m109','m119','m117'].includes(entry.id)||
      (entry.palette&&['lantern','drum','bell','coffin','coin','orb','wax','eyes','greatblade','bloodblade'].includes(entry.crest));
    const forearm=elaborate?arm:bone(arm,side*.062,-.425,.029);
    const offset=elaborate?0:.425;
    const lateral=elaborate?side*.07:side*.008;
    k.geometry(arm,'body',sculptVolume([[side*.054,-.464,.025,.173,.174],[side*.071,-.31,.015,.21,.204],
      [side*.072,-.163,-.007,.231,.210],[side*.043,.026,.019,.186,.18]],
    {sides:13,rings:13,section:2.26,ridge:.12}));
    k.geometry(forearm,'deep',sculptVolume([[lateral,-.844+offset,.11,.104,.129],
      [lateral*1.13,-.738+offset,.06,.164,.189],[lateral,-.528+offset,.070,.206,.167],
      [lateral*.87,-.409+offset,.037,.141,.140]],{sides:12,rings:12,section:2.48,ridge:.13}));
    k.geometry(forearm,'edge',sculptVolume([[lateral,-.729+offset,.016,.13,.114],
      [lateral*1.12,-.634+offset,.045,.166,.189],[lateral*1.25,-.535+offset,.042,.221,.201],
      [lateral,-.440+offset,.014,.167,.157]],{sides:12,rings:12,section:2.85,ridge:.115}));
    if(!elaborate)limbs.push({forearm,side});
    if(side===1&&entry.id==='m101'){
      for(let bead=0;bead<10;bead++){
        const a=bead*TAU/10;
        mesh(arm,'round',bead%4===0?'glow':'body',Math.cos(a)*.20,-.64+Math.sin(a)*.38,.31,.096,.093,.096);
      }
    }else if(!['m005','m016','m017','m081','m107','m109','m119'].includes(entry.id)&&(side===1||['twins','pair','twin'].includes(entry.crest))&&
      !(entry.palette&&['lantern','drum','bell','coffin','coin','orb','wax','eyes','greatblade','bloodblade'].includes(entry.crest))){
      const hand=bone(forearm,elaborate?side*.08:side*.018,-.73+offset,elaborate?.16:.131);
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
  if(entry.id==='m016'){
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
  return {body,arms,legs,head,limbs};
}

function quadruped(k,entry){
  const {root,bone,mesh,rod}=k;
  const turtle=entry.family==='turtle',rider=entry.family==='rider';
  const trial=trialType(entry.id),windBeast=entry.id==='m149';
  const gate=entry.id.startsWith('trial-')?entry.id.split('-')[1]:null;
  const body=bone(root,0,turtle?.85:1.11,0);
  const corpus=turtle?.81:.51;
  k.geometry(body,turtle?'shell':'body',sculptVolume([[0,.018,-1.20,corpus*.34,.13],[0,.12,-.97,corpus*.70,.36],
    [0,.15,-.49,corpus,.47],[0,.15,.08,corpus*.94,.42],[0,.20,.58,corpus*.69,.35],
    [0,.29,.74,corpus*.53,.25]],{sides:18,rings:20,section:turtle?2.90:2.37,ridge:.15}));
  k.geometry(body,'deep',sculptVolume([[0,-.23,-1.13,corpus*.34,.16],[0,-.21,-.64,corpus*.70,.329],
    [0,-.18,-.18,corpus*.78,.36],[0,-.12,.34,corpus*.70,.31],[0,-.061,.52,corpus*.42,.18]],
  {sides:14,rings:15,section:2.6,ridge:.11}));
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
    k.geometry(body,'shell',sculptVolume([[0,.037,-.31,.66,.825],[0,.18,-.31,1.01,1.14],
      [0,.35,-.32,1.08,1.21],[0,.56,-.35,.96,1.15],[0,.73,-.36,.70,.91],
      [0,.80,-.35,.40,.61],[0,.828,-.35,.12,.27]],{sides:28,rings:24,section:2.67,ridge:.12}));
    const spines=[];
    for(let i=0;i<10;i++){
      const a=i*TAU/10,r=i%2?.60:.81;
      spines.push([Math.sin(a)*r,.39+Math.sqrt(1-r*r)*.43,Math.cos(a)*r*1.18-.31,a]);
    }
    spines.push([0,.83,-.30,.23],[.26,.79,-.68,.77],[-.24,.78,.077,2.9]);
    for(const [i,[x,y,z,a]] of spines.entries()){
      const lean=Math.min(.77,.29+Math.hypot(x,z+.31)*.39);
      mesh(body,'ring','rim',x,y+.08,z,.224,.202,.83,PI*.5-lean*Math.cos(a),0,a*.54);
      mesh(body,'pearl','deep',x,y+.026,z,.180,.11,.175,0,a);
      const height=.28+(i%3)*.107;
      k.geometry(body,i%3===0?'trim':'edge',sculptVolume([
        [x,y-.025,z,.146,.144],[x*1.035,y+.116,z-.016,.148,.105],
        [x*1.12,y+height*.72,z-.08,.080,.062],[x*1.16,y+height,z-.136,.008,.005],
      ],{sides:10,rings:13,section:1.66,ridge:.18,seed:i}));
    }
    for(const side of [-1,1])for(let i=0;i<8;i++){
      const a=(i+.5)*PI/8,x=side*Math.sin(a)*1.045,z=Math.cos(a)*1.22-.31;
      k.sculpt.sweep(body,'rim',[[x*.84,.47,z*.90,.089],[x,.33,z,.109],
        [x*.96,.21,z+.031,.079],[x*.86,.118,z+.082,.009]],{sides:8,steps:10,ridge:.18});
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
      if(gate)sculptGateTack(k,{body,head,helm,knight,mantle,tail,gate,dark});
      return {body,head,legs,tail,mount:{knight,helm,hand,mantle,embers,trial}};
    }else{
      face(k,helm,{broad:.25,horns:0,snout:.18});
      blade(k,hand,entry.crest,true);
    }
    mesh(knight,'gem','edge',-.34,.41,.25,.20,.37,.15);
  }
  return {body,head,legs,tail};
}

function sculptGateTack(k,{body,head,helm,knight,mantle,tail,gate,dark}){
  const {mesh,rod,geometry,sculpt}=k;
  const jing=gate==='jing',shang=gate==='shang';
  const metal=dark?'deep':'edge',scoring=dark?'edge':'trim';
  const curve=(parent,finish,pts)=>sculpt.sweep(parent,finish,pts,{steps:12,sides:7,ridge:.20});
  for(const side of [-1,1]){
    const z=-.61;
    // Saddlebags and buckles sit below the seat on both sides, including the far side.
    geometry(body,metal,sculptVolume([[side*.42,.36,z,.14,.23],[side*.57,.29,z,.183,.26],
      [side*.67,.13,z+.025,.151,.235],[side*.62,-.03,z+.035,.106,.207],
      [side*.50,-.16,z+.065,.065,.148]],{sides:11,rings:14,section:2.61,ridge:.21}));
    for(let i=0;i<4;i++){
      const travel=i*.118;
      curve(body,scoring,[[side*.528,.373,z-.178+travel,.027],
        [side*.668,.215,z-.162+travel,.036],[side*.704,.093,z-.141+travel,.023],
        [side*.617,-.083,z-.095+travel,.009]]);
      mesh(body,'gem',i===1?'glow':metal,side*.672,.118,z-.16+travel,.029,.054,.039,0,side*.48);
    }
    curve(head,scoring,[[side*.13,.251,.44,.022],[side*.234,.142,.51,.032],
      [side*.279,-.009,.501,.031],[side*.245,-.204,.398,.018]]);
    curve(head,metal,[[side*.253,.254,.104,.057],[side*.322,.133,.260,.061],
      [side*.318,-.112,.406,.039],[side*.259,-.210,.378,.012]]);
    curve(body,'trim',[[side*.44,.59,.26,.029],[side*.52,.54,.51,.034],
      [side*.47,.432,.74,.028],[side*.27,.393,.96,.010]]);
    // Rolled cloth at the back of the saddle carries its own clasps and seals.
    geometry(mantle,dark?'body':'deep',sculptVolume([[side*.21,.132,-.153,.123,.14],
      [side*.29,-.083,-.247,.132,.159],[side*.35,-.30,-.38,.113,.12],
      [side*.405,-.48,-.493,.052,.056]],{sides:11,rings:14,section:1.9,ridge:.21}));
    for(let i=0;i<4;i++){
      const f=i*.108;
      rod(mantle,i===2?'glow':scoring,[side*(.22+f*.18),.15-f*1.08,-.311-f*.27],
        [side*(.341+f*.25),.12-f*1.04,-.293-f*.20],.021);
    }
    const top=jing?.94:shang?.72:1.11;
    const spread=jing?.35:shang?.51:.27;
    curve(helm,metal,[[side*.153,.347,-.176,.076],[side*.251,.485,-.281,.086],
      [side*spread,top*.77,-.296,.045],[side*(spread+.09),top,-.35,.006]]);
    for(let i=0;i<(shang?5:4);i++){
      const kx=i*.072;
      const reach=jing?.29:shang?.45:.27;
      curve(knight,i%2?metal:scoring,[[side*(.13+kx*.55),.46+kx,-.218,.042],
        [side*(.28+kx),.42+kx+reach*.15,-.30-kx*.41,.054],
        [side*(.31+kx*.98),.29+kx-reach*.04,-.35-kx*.32,.009]]);
    }
    if(gate==='kai'){
      for(let i=0;i<4;i++){
        const lift=i*.124;
        curve(helm,i%3===0?'glow':scoring,[[side*.11,.33+lift*.47,-.10,.050],
          [side*(.30+lift*.48),.43+lift,-.17,.047],
          [side*(.39+lift*.80),.64+lift,-.29,.006]]);
      }
    }else if(shang){
      for(let i=0;i<4;i++){
        const height=.38+i*.083;
        mesh(helm,'gem',i===2?'glow':metal,side*(.19+i*.027),height,-.21-i*.03,.050,.17,.08,.44,side*.3,side*.25);
      }
    }
  }
  const back=dark?'body':'trim';
  for(let j=0;j<5;j++){
    const y=.47-j*.10;
    const span=jing?.105+j*.018:.157-j*.013;
    mesh(knight,'scale',back,0,y,-.278,span,.18,.28,.23,PI,0);
  }
  const plait=jing?[[0,.13,-.10,.094],[-.13,.33,-.37,.091],[-.13,.55,-.65,.056],[.05,.58,-.97,.008]]:
    shang?[[0,.13,-.10,.101],[.08,.29,-.32,.11],[.23,.41,-.68,.075],[.14,.61,-1.03,.006]]:
      [[0,.13,-.10,.108],[.04,.39,-.30,.073],[-.19,.64,-.47,.056],[-.43,.75,-.72,.007]];
  curve(tail,metal,plait);
  curve(tail,scoring,plait.map(([x,y,z,r])=>[x+.034,y+.063,z-.006,r*.43]));
}
function flyer(k,entry){
  const {root,bone,mesh,rod}=k;
  const dragon=entry.family==='dragon', insect=entry.family==='wasp';
  const poison=entry.id==='m024',darkFeathers=entry.id==='m148';
  const body=bone(root,0,1.12,0);
  k.geometry(body,'body',sculptVolume([[0,-.19,-.03,.13,.25],[0,-.115,-.083,dragon?.38:.27,.42],
    [0,.089,-.014,dragon?.48:.34,dragon?.64:.49],[0,.31,.055,dragon?.445:.30,dragon?.71:.53],
    [0,.475,.12,.24,.49],[0,.548,.14,.102,.228]],{sides:16,rings:19,section:2.20,ridge:.11}));
  mesh(body,'pearl','edge',0,.18,.32,insect?.24:.38,.27,.40);
  const head=bone(body,0,.42,.84);
  if(entry.id==='m151'){
    mesh(head,'gem','trim',0,.01,0,.37,.36,.37,0,PI*.25);
    for(const side of [-1,1])mesh(head,'pearl','edge',side*.23,.05,.162,.185,.16,.19);
  }else face(k,head,{broad:poison?.30:dragon?.41:.28,horns:dragon?2:0,snout:poison?.52:dragon?.46:.28,reptile:dragon});
  const arms=[],flight=[];
  const seed=Array.from(entry.id).reduce((sum,char)=>sum*19+char.charCodeAt(0),0)%107;
  for(const side of [-1,1]){
    const wing=articulatedWing(k,body,side,{winged:!dragon,membranous:dragon||insect||entry.crest==='bat',
      insect,poison,dark:darkFeathers,seed});
    flight.push(wing);
    if(poison){
      for(let spine=0;spine<6;spine++){
        rod(head,'trim',[side*.15,.14+spine*.054,-spine*.154],
          [side*(.43+spine*.025),.43+spine*.052,-.26-spine*.135],.053,'horn');
      }
      rod(body,'trim',[side*.28,.01,.36],[side*.42,-.43,.59],.078);
      rod(body,'edge',[side*.42,-.41,.58],[side*.36,-.61,.80],.054,'horn');
    }
    if(insect){
      for(let leg=0;leg<3;leg++)rod(body,'edge',[side*.21,-.01,.34-leg*.30],
        [side*(.66-leg*.065),-.46,.58-leg*.45],.053,'horn');
      rod(head,'glow',[side*.14,.33,.18],[side*.35,.75,.37],.055,'horn');
    }
    arms.push(wing.root);
  }
  const tail=bone(body,0,0,-.65);
  k.geometry(tail,'deep',sculptVolume([[0,.038,.11,.33,.24],[0,-.012,-.011,.34,.31],
    [0,-.092,-.32,.274,.234],[poison?.11:.045,-.241,-.672,.179,.17],
    [poison?.19:.066,-.321,-.96,.101,.083],[poison?.26:.046,-.23,-1.27,.012,.012]],{sides:12,rings:17,section:2.1}));
  if(poison){
    rod(tail,'body',[0,-.31,-.87],[.19,-.19,-1.45],.106);
    rod(tail,'trim',[.19,-.19,-1.43],[.34,.07,-1.93],.073,'horn');
    mesh(tail,'gem','glow',.35,.075,-1.88,.061,.068,.055);
  }
  if(insect)rod(tail,'edge',[0,-.35,-1.02],[0,-.61,-1.47],.13,'horn');
  if(entry.id==='m151')for(let band=0;band<4;band++)mesh(tail,'ring','trim',0,-band*.078,-band*.25-.08,
    .31-band*.034,.24-band*.022,.74);
  return {body,head,arms,tail,flight};
}

function coil(k,entry){
  const {root,bone,mesh}=k;
  const body=bone(root,0,.14,0);
  const cloudDragon=entry.id==='m106'||entry.id==='m019';
  if(cloudDragon){
    body.position.y=.48;
    const bank=bone(body,0,-.12,-.14);
    for(let i=0;i<12;i++){
      const a=i*2.399;
      const r=.39+(i%4)*.19;
      mesh(bank,'pearl',i%3===0?'deep':'mist',Math.sin(a)*r,-.02+(i%3)*.12,Math.cos(a)*r,.55,.21,.49);
    }
    body.userData.cloudBank=bank;
  }
  serpentTail(body,k,entry);
  const arms=[];
  const necks=entry.family==='hydra'?5:1;
  for(let index=0;index<necks;index++){
    const offset=index-(necks-1)/2;
    const neck=bone(body,offset*.45,.50,.33+Math.abs(offset)*.03);
    if(entry.id==='m001')neck.scale.set(.94,.64,1.05);
    k.geometry(neck,'body',sculptVolume([[0,-.06,-.16,.333,.31],[offset*.043,.22,-.079,.31,.35],
      [offset*.093,.59,-.073,.28,.304],[offset*.091,.92,-.065,.25,.29],[offset*.027,1.19,.041,.196,.225],
      [0,1.43,.14,.163,.20]],{sides:13,rings:16,section:2.38,ridge:.16,seed:index}));
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
      for(const side of [-1,1]){
        k.sculpt.sweep(head,'edge',[[side*.22,.20,.14,.135],[side*.31,.37,.02,.14],
          [side*.42,.57,-.13,.108],[side*.51,.73,-.36,.061],[side*.47,.94,-.49,.008]],
        {steps:15,sides:9,ridge:.31});
        k.sculpt.sweep(head,'trim',[[side*.16,-.075,.47,.050],[side*.34,-.056,.54,.045],
          [side*.51,.13,.62,.038],[side*.65,.42,.60,.020],[side*.85,.52,.49,.005]],
        {steps:15,sides:7,ridge:.22});
        for(let i=0;i<5;i++){
          const y=.17+i*.23;
          k.sculpt.plate(neck,i%2?'body':'edge',
            [[side*.13,y+.13,-.27],[side*.32,y+.11,-.32],[side*.30,y-.10,-.39],
              [side*.11,y-.20,-.37],[side*.05,y-.04,-.32]],.039,.014);
        }
      }
      for(let spine=0;spine<5;spine++){
        const y=.31+spine*.20;
        k.sculpt.sweep(neck,spine%2?'trim':'edge',[[0,y,-.31,.092],[0,y+.17,-.45,.067],
          [0,y+.34,-.60,.035],[.027,y+.39,-.68,.006]],{steps:9,sides:7,ridge:.26});
      }
      body.userData.dragonHead=head;
    }
    if(entry.id==='m002')for(let spike=0;spike<5;spike++)mesh(head,'horn','glow',-.30+.15*spike,.35+.038*spike,-.18,.095,.36,.081,-.26,0,.22);
    arms.push(neck);
  }
  return {body,arms,catalogueSculpt:cloudDragon?entry.id:undefined,cataloguePose:cloudDragon?
    ({beat,wind,strike,travel})=>{
      const {cloudBank,dragonHead}=body.userData;
      cloudBank.rotation.y=beat*.11;cloudBank.scale.setScalar(1+Math.sin(beat*.66)*.085+wind*.12);
      dragonHead.rotation.x=wind*.19-strike*.39;
      dragonHead.rotation.z=Math.sin(beat*.72)*(.07+travel*.10);
    }:undefined};
}

function serpentTail(body,k,entry){
  const {mesh,rod}=k;
  const turns=entry.id==='m001'?1.35:1.05;
  const path=new T.CatmullRomCurve3(Array.from({length:20},(_,i)=>{
    const t=i/19,angle=t*TAU*turns;
    if(['m001','m002','m106','m019'].includes(entry.id))return new T.Vector3(Math.sin(t*11)*.46,.31-t*.18,-3.28*t+.28);
    const radius=.35+Math.sin(t*2.45)*1.39;
    return new T.Vector3(Math.sin(angle)*radius,.36-.216*t+.085*Math.sin(t*18),Math.cos(angle)*radius-.098);
  }));
  const sections=path.getSpacedPoints(26).map((point,i)=>{
    const width=.039+(1-(i/26)**1.67)*.96;
    return [...point.toArray(),.266*width,.235*width];
  });
  k.geometry(body,'body',sculptVolume(sections,{sides:14,rings:64,section:2.36,ridge:.12}));
  for(const side of [-1,1]){
    const ridge=new T.CatmullRomCurve3(Array.from({length:34},(_,i)=>{
      const t=i/33,point=path.getPointAt(t),forward=path.getTangentAt(t);
      const width=1-t**1.67;
      point.x+=forward.z*side*.173*width;
      point.z-=forward.x*side*.173*width;
      point.y+=.198*width;
      return point;
    }));
    k.geometry(body,'edge',new T.TubeGeometry(ridge,57,.033,5,false));
  }
  if(entry.id==='m106')for(let i=1;i<=16;i++){
    const t=i/18,p=path.getPointAt(t),direction=path.getTangentAt(t),size=1.05-t*.84;
    for(const side of [-1,1]){
      mesh(body,'scale',i%3?'body':'edge',p.x+side*.14*size,p.y+.17*size,p.z,
        size*.18,size*.20,size*.33,-.65,Math.atan2(direction.x,direction.z),side*.26);
    }
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
  k.geometry(body,'body',sculptVolume([[0,-.48,-.05,.21,.26],[0,-.29,-.03,.49,.41],
    [0,.04,.005,.64,.51],[0,.29,.027,.63,.53],[0,.59,-.029,.58,.42],[0,.85,-.11,.37,.34]],
  {sides:18,rings:23,section:2.20,ridge:.18}));
  mesh(body,'gem','glow',0,.34,.49,.22,.24,.099);
  if(clutch){
    for(let i=0;i<4;i++){
      const a=i*TAU/4+.30;
      const egg=bone(body,Math.sin(a)*.90,.04,Math.cos(a)*.48);
      k.geometry(egg,'edge',sculptVolume([[0,-.505,0,.19,.172],[0,-.351,-.017,.35,.333],[0,-.03,-.009,.38,.37],
        [0,.21,-.012,.324,.32],[0,.41,-.037,.212,.216],[0,.55,-.076,.043,.052]],
      {sides:15,rings:16,section:2.15,ridge:.12,seed:i}));
      k.sculpt.sweep(egg,'trim',[[0,-.32,.31,.035],[.19,-.29,.27,.030],
        [.276,-.148,.26,.027],[.23,.091,.27,.018],[.28,.248,.199,.006]],{sides:6,steps:13});
      mesh(egg,'gem','glow',0,.08,.36,.12,.14,.079);
      arms.push(egg);
    }
  }else for(let i=0;i<5;i++){
    const a=i*TAU/5;
    const fin=bone(body,Math.sin(a)*.37,Math.cos(a)*.39,0);
    fin.rotation.z=-a;
    k.geometry(fin,'edge',sculptVolume([[0,-.03,-.05,.22,.20],[.05,.26,-.026,.26,.22],[.13,.53,.041,.221,.21],
      [.21,.84,.083,.15,.14],[.25,1.09,.14,.079,.069],[.18,1.32,.26,.008,.008]],
    {sides:12,rings:16,section:1.66,ridge:.21,seed:i}));
    mesh(fin,'gem','glow',.13,.70,.17,.09,.14,.095);
    arms.push(fin);
  }
  return {body,arms};
}

function spider(k,queen=false){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.90,0);
  const breadth=queen?.74:.57;
  k.geometry(body,queen?'body':'deep',sculptVolume([[0,.04,-1.36,breadth*.28,.16],[0,.17,-1.06,breadth*.80,.47],
    [0,.295,-.72,breadth,.62],[0,.301,-.37,breadth*.94,.61],[0,.21,-.119,breadth*.67,.43],
    [0,.111,.089,breadth*.47,.24]],{sides:19,rings:24,section:2.40,ridge:.13}));
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
  const legs=[],joints=[];
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const z=.58-i*.34;
    const limb=bone(root,side*.29,.86,z);
    const foot=[side*(1.39-i*.025),-.80,.20-z*.46];
    const knee=[side*1.14,queen?.57:.43,z*.5];
    const t=queen?.126:.079;
    const shin=bone(limb,...knee);
    const [fx,fy,fz]=foot.map((value,index)=>value-knee[index]);
    k.geometry(limb,'body',sculptVolume([[0,0,0,t*.79,t*.80],[side*.24,.15,z*.10,t*1.19,t*.94],
      [side*.76,.46,z*.33,t*.94,t*.91],[...knee,t*.69,t*.75]],{axis:'x',sides:8,rings:11,section:2.6,ridge:.12}));
    k.geometry(shin,'edge',sculptVolume([[0,.016,0,t,t],[fx*.49,fy*.24,fz*.23,t*.89,t*.98],
      [fx*.84,fy*.69,fz*.71,t*.51,t*.66],[fx,fy,fz,.006,.007]],
    {sides:8,rings:13,section:1.78,ridge:.15}));
    if(queen){
      mesh(limb,'gem','trim',knee[0],knee[1],knee[2],.17,.15,.17);
      rod(shin,'deep',[side*.052,-.15,-z*.11],[fx,fy,fz],.065,'horn');
    }
    legs.push(limb);
    joints.push({shin,side,index:i});
  }
  return {body,head,legs,joints};
}

function bullOni(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.89,0);
  k.geometry(body,'deep',sculptVolume([[0,.054,-1.22,.303,.232],[0,.145,-.91,.55,.370],
    [0,.186,-.46,.678,.429],[0,.137,.013,.707,.439],[0,.06,.436,.605,.395],[0,-.025,.81,.322,.285]],
    {rings:28,sides:20,section:2.83,ridge:.19}));
  for(let ridge=0;ridge<6;ridge++){
    const z=.59-ridge*.275;
    const width=.69-ridge*.059;
    const height=.50+ridge*.086;
    for(const side of [-1,1]){
      const path=[[.003,height+.18,z+.13],[width*.58,height+.062,z+.093],
        [width,height-.19,z+.043],[width*.91,height-.17,z-.161],
        [width*.53,height+.025,z-.27],[.006,height+.261,z-.31]].map(([x,y,Z])=>[x*side,y,Z]);
      k.sculpt.plate(body,ridge%2?'iron':'body',path,.061,.02);
      k.sculpt.sweep(body,'trim',path.slice(1,6).map(([x,y,Z])=>[x,y+.021,Z-.019,.023]),
        {sides:7,steps:12,ridge:.24});
    }
    k.sculpt.sweep(body,'edge',[[0,height+.19,z+.068,.030],[0,height+.271,z-.094,.039],
      [0,height+.348,z-.30,.004]],{sides:7,steps:9});
  }
  const head=bone(body,0,-.10,.75);
  mesh(head,'pearl','deep',0,.02,.10,.39,.32,.48);
  mesh(head,'scale','iron',0,.02,.44,.73,.58,.69,-.17);
  rod(head,'trim',[0,.26,.39],[0,-.19,.65],.054,'horn');
  mesh(head,'pearl','body',0,-.22,.53,.23,.12,.20);
  for(const side of [-1,1]){
    const horn=[[side*.168,.185,.23,.085],[side*.266,.237,.241,.102],[side*.412,.324,.242,.090],
      [side*.561,.383,.361,.067],[side*.672,.474,.45,.038],[side*.697,.531,.59,.005]];
    k.sculpt.sweep(head,'edge',horn,{sides:11,steps:20,ridge:.27});
    k.sculpt.sweep(head,'iron',horn.slice(0,5).map(([x,y,z,r])=>[x,y+.012,z-.031,r*.61]),{sides:8,steps:16});
    mesh(head,'gem','glow',side*.12,.02,.556,.094,.039,.046,0,0,-side*.19);
    rod(head,'edge',[side*.21,-.11,.56],[side*.17,-.33,.61],.043,'horn');
  }
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const shield=bone(body,side*.56,.10,.43);
    const mir=path=>path.map(([x,...row])=>[side*x,...row]);
    const claw=mir([[.03,.19,.07],[.232,.39,.161],[.653,.345,.298],[.897,.09,.60],[1.068,-.187,.94],
      [.687,-.238,.792],[.479,-.174,.55],[.297,-.132,.29],[.067,-.08,.17]]);
    k.sculpt.plate(shield,'iron',claw,.084,.026);
    k.sculpt.sweep(shield,'trim',claw.slice(0,7).map(([x,y,z])=>[x,y+.016,z+.022,.023]),{sides:8,steps:21,ridge:.24});
    for(let i=0;i<3;i++){
      const x=.13+i*.12,z=.22+i*.13;
      k.sculpt.sweep(shield,i%2?'iron':'edge',mir([[x,.248,z,.036],[x+.171,.302,z+.16,.064],
        [x+.421,.173,z+.29,.042],[x+.60,-.032,z+.53,.005]]),{sides:8,steps:12,ridge:.25});
    }
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
const nabataArmor={
  fire:[.251,.376,1.04,0x8a3924],
  water:[.186,.479,.79,0x36637c],
  thunder:[.225,.414,1.03,0x796024],
  wind:[.176,.510,.89,0x426149],
};

function nabataMage(k,element){
  const {root,bone,mesh,rod}=k;
  const [brow,sweep,torso,lining]=nabataArmor[element];
  k.materials.deep.color.setHex(0x19222b).lerp(new T.Color(lining),.17);
  k.materials.body.color.setHex(0x2c3440).lerp(new T.Color(lining),.29);
  k.materials.edge.color.setHex(0xc9a86b);
  const body=bone(root,0,.92,0);
  k.geometry(body,'deep',sculptVolume([[0,-.30,-.05,.226,.211],[0,-.075,-.067,.32,.24],
    [0,.25,-.015,.34,.298],[0,.53,-.039,.416*torso,.27],[0,.717,-.024,.34,.217],[0,.855,.01,.16,.14]],
    {sides:17,rings:21,section:2.54,ridge:.10}));
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const y=.64-i*.122,z=.32+i*.013;
    const plate=[[.021,y+.103,z+.026],[.14,y+.155,z],[.355*torso,y+.127,z-.041],
      [.373*torso,y+.023,z-.084],[.292*torso,y-.116,z-.116],[.11,y-.11,z+.008],[.028,y-.051,z+.046]];
    k.sculpt.plate(body,i===0?'edge':'body',plate.map(([x,Y,Z])=>[side*x,Y,Z]),.048,.019);
    k.sculpt.sweep(body,i===3?'glow':'trim',plate.slice(1,5).map(([x,Y,Z])=>[side*x,Y,Z+.024,.018]),
      {sides:6,steps:10,ridge:.20});
  }
  const head=bone(body,0,1.08,.12);
  k.geometry(head,'deep',sculptVolume([[0,-.206,.018,.14,.10],[0,-.11,-.014,.204,.151],[0,.057,-.079,.226,.163],
    [0,.193,-.082,.208,.180],[0,.313,-.119,.143,.134],[0,.402,-.11,.048,.076]],
    {sides:17,rings:21,section:2.06,ridge:.16}));
  for(const side of [-1,1]){
    const mirrored=points=>points.map(([x,...point])=>[side*x,...point]);
    const guard=[[.012,.183,.102],[.134,.225,.052],[brow,.158,-.074],[.242,.034,-.033],
      [.210,-.083,.097],[.138,-.221,.144],[.041,-.184,.191],[.082,.013,.219]];
    k.sculpt.plate(head,'edge',mirrored(guard),.041,.014);
    k.sculpt.sweep(head,'trim',mirrored([[.09,.151,.158,.028],[.165,.204,.098,.052],
      [brow,.191,-.066,.051],[.282,sweep,-.172,.038],[.205,sweep+.126,-.207,.004]]),{sides:9,steps:17});
    k.sculpt.sweep(head,'glow',mirrored([[.033,.064,.226,.010],[.105,.064,.235,.017],[.174,.092,.166,.005]]),
      {sides:7,steps:8});
    for(let i=0;i<4;i++){
      const y=.12-i*.071;
      k.sculpt.sweep(head,i%2?'trim':'edge',mirrored([[.17,y,.017,.015],[.208,y-.031,.128,.022],
        [.158,y-.057,.238,.020],[.107,y-.099,.245,.004]]),{sides:6,steps:9,ridge:.20});
    }
  }
  k.sculpt.sweep(head,'edge',[[0,.22,.181,.042],[0,.133,.229,.057],[0,.024,.251,.039],[0,-.152,.243,.015]],
    {sides:8,steps:11,ridge:.16});
  const crest=bone(body,0,1.01,-.28);
  mesh(crest,'ring','glow',0,.17,0,.66,.78,.29);
  mesh(crest,'ring','body',0,.17,-.04,.75,.88,.46);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=bone(body,side*.42,.63,.06);
    k.geometry(arm,'body',sculptVolume([[0,.18,-.032,.12,.14],[side*.105,.04,.012,.17,.18],
      [side*.108,-.24,.112,.143,.142],[side*.083,-.48,.179,.09,.088]],{sides:11,rings:14,section:2.44,ridge:.18}));
    for(let i=0;i<3;i++){
      const y=.239-i*.119;
      k.sculpt.plate(arm,i%2?'body':'trim',[[0,y+.06,-.112],[side*.187,y+.095,-.116],[side*.303,y-.041,-.07],
        [side*.28,y-.168,.065],[side*.117,y-.107,.139],[0,y-.045,.12]],.045,.016);
    }
    arms.push(arm);
    const skirt=bone(body,side*.26,.30,-.14);
    mesh(skirt,'mantle','deep',0,.11,0,side*.66,1.36,.93,.12,-side*.47,0);
    mesh(skirt,'mantle','body',side*.03,.06,.15,side*.33,1.32,.79,.18,-side*.29,0);
    rod(skirt,'trim',[side*.28,-.06,.08],[side*.60,-1.13,.12],.037);
    legs.push(skirt);
  }
  const staff=bone(arms[1],.08,-.35,.26);
  rod(staff,'edge',[0,-1.03,0],[0,1.38,0],.047);
  if(element==='fire'||element==='water'){
    const fire=element==='fire',w=fire?.48:.297;
    for(const side of fire?[-1,1]:[1]){
      const blade=[[0,1.34,.052],[side*w*.40,1.48,.053],[side*w*.81,1.679,.047],
        [side*w*.95,1.957,.017],[side*w*1.26,1.80,0],[side*w*1.28,1.496,.016],
        [side*w*.98,1.221,.03],[side*w*.61,1.118,.053],[side*w*.42,1.196,.055]];
      k.sculpt.plate(staff,'edge',blade,.053,.021);
      k.sculpt.sweep(staff,'glow',blade.slice(1,6).map(([x,y,z])=>[x*.96,y,z+.064,.023]),
        {sides:7,steps:17,ridge:.19});
      if(!fire)k.sculpt.sweep(staff,'glow',[[0,1.41,.058],[-.092,1.28,.08],[-.10,1.14,.06]]
        .map(p=>[...p,.020]),{sides:7,steps:8});
    }
    mesh(staff,'gem','glow',0,1.426,.061,.075,.113,.040);
  }else if(element==='thunder'){
    k.sculpt.sweep(staff,'edge',[[0,1.10,.012,.076],[-.05,1.38,.02,.119],
      [-.294,1.54,.011,.109],[-.48,1.429,-.02,.056],[-.53,1.30,-.01,.018]],{sides:12,steps:21,ridge:.22});
    k.sculpt.sweep(staff,'glow',[[0,1.31,.111,.029],[-.19,1.47,.103,.052],
      [-.381,1.522,.063,.040],[-.505,1.381,.034,.014]],{sides:6,steps:16,ridge:.21});
    mesh(staff,'gem','glow',-.095,1.475,.111,.075,.079,.046);
  }else{
    const blade=[[0,2.22,0],[.187,1.857,.024],[.177,1.64,.042],[.104,1.56,.035],
      [.075,1.212,.042],[0,1.128,.062],[-.075,1.212,.042],[-.104,1.56,.035],
      [-.177,1.64,.042],[-.187,1.857,.024]];
    k.sculpt.plate(staff,'edge',blade,.064,.024);
    k.sculpt.sweep(staff,'glow',[[0,1.19,.081,.029],[.007,1.57,.083,.043],
      [.012,1.88,.063,.032],[0,2.17,.021,.006]],{sides:8,steps:16,ridge:.20});
    for(const side of [-1,1]){
      k.sculpt.sweep(staff,'trim',[[0,1.48,0,.053],[side*.197,1.43,.021,.043],
        [side*.263,1.59,-.036,.036],[side*.237,1.716,-.071,.004]],{sides:7,steps:14});
    }
  }
  const reredos=bone(body,0,.56,-.35);
  const idol=bone(crest,0,.17,-.21);
  const curves={
    fire:[[.08,.42,-.093,.069],[.17,.64,-.13,.071],[.14,.85,-.18,.040],[.28,1.09,-.19,.006]],
    water:[[.08,.38,-.12,.058],[.23,.47,-.20,.075],[.38,.61,-.31,.047],[.28,.79,-.41,.006]],
    thunder:[[.07,.34,-.09,.068],[.32,.58,-.17,.055],[.22,.72,-.23,.047],[.48,.90,-.27,.007]],
    wind:[[.07,.34,-.06,.059],[.22,.50,-.17,.069],[.44,.69,-.29,.048],[.58,.68,-.42,.006]],
  };
  const spirit=curves[element];
  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      const shift=.11*i;
      k.sculpt.sweep(head,i===1?'trim':'body',
        spirit.map(([x,y,z,r])=>[side*(x+shift*.83),y-.27-shift*.34,z-shift,r*(1-i*.18)]),
        {sides:8,steps:10,ridge:.18});
    }
    for(let row=0;row<5;row++){
      const y=.38-row*.20,w=.11+row*.081;
      k.sculpt.plate(reredos,row%2?'body':'edge',[
        [0,y+.09,-.09],[side*w,y+.17,-.081],[side*(w+.10),y-.094,-.15],
        [side*(w*.64),y-.23,-.189],[0,y-.17,-.137],
      ],.035,.013);
      rod(reredos,'trim',[side*w*.42,y-.064,-.165],[side*(w+.055),y+.08,-.143],.018);
    }
    for(let index=0;index<4;index++){
      const z=-.02-index*.079;
      k.sculpt.sweep(body,index%2?'body':'trim',
        [[side*.29,.67,z,.035],[side*.43,.49,z-.08,.042],[side*.44,.28,z-.14,.032],
          [side*.32,.09,z-.18,.006]],{sides:7,steps:8,ridge:.21});
    }
  }
  for(let i=0;i<7;i++){
    const a=i*TAU/7;
    const radial=element==='thunder'?.53:element==='wind'?.47:.41;
    mesh(idol,element==='water'?'pearl':element==='fire'?'horn':'gem',i%3?'trim':'glow',
      Math.cos(a)*radial,Math.sin(a)*radial,-.10,.061,element==='water'?.085:.139,.071,0,.19,a);
  }
  return {body,head,arms,legs,sourceCrest:crest,catalogueSculpt:'nabata-'+element,
    cataloguePose:({beat,headtime,wind,strike,stage})=>{
      const speed={water:-.55,fire:.89,thunder:1.62,wind:-1.12}[element];
      idol.rotation.z=headtime*speed+stage*.25+strike*.73;
      reredos.rotation.y=Math.sin(beat*.72+speed)*(.13+wind*.21);
      reredos.rotation.x=-wind*.25+strike*.42;
      staff.rotation.z=wind*.39-strike*.57;
    }};
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

export function mountBestiary(scene,entry,height,mobile=false,spec={}){
  if(entry.source==='kuanglu15')entry={...entry,family:'rider'};
  const root=new T.Group(),materials=buildMaterials(entry);
  const k=kit(root,materials);
  if(!paoForms.has(entry.id))k.sculpt=sculptPao(k);
  const authored=buildCampaignSculpt(k,entry,mobile,spec.relicWeapon)??catalogueSculpt(k,entry,mobile)
    ??sculptA(k,entry,mobile)??sculptB(k,entry,mobile)??sculptC(k,entry,mobile);
  let parts;
  if(authored)parts=authored;
  else if(paoForms.has(entry.id))parts=buildPao(k,entry,mobile);
  else if(nabataElements[entry.id])parts=nabataMage(k,nabataElements[entry.id]);
  else if(entry.id==='m114'||entry.id==='m115')parts=carveRoyalPair(k,mobile,entry.id==='m115');
  else if(entry.id==='m117')parts=asuraDisciple(k,entry);
  else if(entry.id==='m122')parts=carveVaruna(k,mobile);
  else if(entry.id==='m133')parts=carveJadeEmperor(k,mobile);
  else if(entry.id==='m150')parts=carveImperialTurtle(k,mobile);
  else if(entry.id==='m154')parts=bullOni(k);
  else if(entry.id==='m155')parts=carveEggGhost(k,mobile);
  else if(entry.crest==='scarab')parts=scarab(k);
  else if(entry.id==='m124'||entry.id==='m125')parts=serpentGuardian(k,entry.id==='m124');
  else if(entry.id==='m106')parts=coil(k,entry);
  else if(entry.id==='m005')parts=sculptWhiteBear(k);
  else if(entry.id==='m014')parts=sculptKirin(k,mobile);
  else if(entry.id==='m015')parts=sculptPhoenix(k);
  else if(entry.id==='m027')parts=sculptDestroyer(k);
  else if(['m090','m091','m092'].includes(entry.id))parts=quadruped(k,{...entry,family:'rider'});
  else switch(entry.family){
    case 'turtle':case 'beast':case 'rider':parts=quadruped(k,entry);break;
    case 'dragon':case 'bird':case 'wasp':parts=flyer(k,entry);break;
    case 'serpent':case 'hydra':parts=coil(k,entry);break;
    case 'star':case 'eggs':parts=star(k,entry);break;
    case 'spider':parts=spider(k,entry.id==='m121');break;
    default:parts=humanoid(k,entry);break;
  }
  finishSpecialBoss(k,parts,entry.id,mobile);
  const dedicatedSilhouette=['m114','m115','m122','m133','m150','m154'].includes(entry.id);
  const crest=parts.crest??parts.sourceCrest??(dedicatedSilhouette?k.bone(root,0,0,0):
    entry.palette?forestDetails(k,entry,parts):ornaments(k,entry,parts));
  const detail=parts.pao||parts.catalogueSculpt||parts.campaign?null:detailCreature(k,entry,parts,mobile);
  const skin=bossSkin(k,mobile,tools=>entry.field?refineCreature(k,parts,entry,mobile,tools):
    refineBossA(k,parts,entry,mobile,tools)||refineBossB(k,parts,entry,mobile,tools)
    ||refineBossC(k,parts,entry,mobile,tools)||refineGuardian(k,parts,entry,mobile,tools)
    ||refineCreature(k,parts,entry,mobile,tools));
  k.sculpt?.finish(k.geometry);
  k.finish();
  const box=new T.Box3().setFromObject(root);
  const aura=entry.field||parts.pao||parts.signature?.lume?null:enemyEnergy(root,box,
    {...entry,effect:spec.effect},colors(entry)[3],mobile);
  const reference=KoreanBossArt[entry.id];
  const ratio=reference?.[2];
  const width=ratio?T.MathUtils.clamp(Math.sqrt(ratio/.91),.80,1.20):1;
  const dimensions=entry.proportions??(parts.pao?[1,1,1]:[width,1,1+(width-1)*.36]);
  scene.add(root);
  const pattern=parts.pao?'hover':parts.mount?'gallop':entry.id==='m005'?'slam':entry.crest==='scarab'||entry.id==='m154'?'crawl':
    entry.id==='m106'?'coil':entry.id==='m124'?'duel':['m114','m115','m133','m155'].includes(entry.id)?'hover':poses[entry.family];
  return {root,materials,entry,crest,dimensions,palette:colors(entry),bounce:reference?Math.min(.39,reference[3])*.13:0,
    scale:height*.87/Math.max(1.7,box.max.y*dimensions[1]),pattern,detail,aura,skin,...parts};
}

export function poseBestiary(model,unit,spec,time,x,z){
  const {root,body,crest,head,arms=[],legs=[],tail,pattern,scale,dimensions,materials,mount}=model;
  const stage=spec.phase??unit.bossPhase??0;
  const fall=spec.fall??0;
  const wind=unit.attack?T.MathUtils.clamp(1-unit.attack.time/Math.max(.001,unit.attack.windup??unit.spec.time),0,1):0;
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
  const patternAtContact=attack?.pattern;
  const thrust=['lance','cross','barrage','feathers','coins','marked'].includes(patternAtContact);
  const sweep=['sweep','cleave','gravefan','jaws'].includes(patternAtContact);
  const crush=['burst','pounce','cinders','toll','counterCharge'].includes(patternAtContact);
  const stagger=unit.reaction&&unit.reaction.kind!=='fall'?Math.exp(-unit.reaction.age*9):0;
  const animationSpeed=1-Math.exp(-Math.max(.001,spec.dt??1/60)*17);
  const facing=attack&&Number.isFinite(attack.dz)?Math.atan2(attack.dx,attack.dz):
    travel>.07&&Number.isFinite(spec.heading)?spec.heading:model.heading??(unit.face>0?.47:-.47);
  const change=facing-(model.heading??facing);
  model.heading=(model.heading??facing)+Math.atan2(Math.sin(change),Math.cos(change))*animationSpeed;
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
  for(const {shin,side,index} of model.joints??[]){
    const pace=Math.sin(step+index*PI+side*PI*.48);
    shin.rotation.z=side*(travel*.35*Math.max(0,pace)-wind*.23+strike*.22);
    shin.rotation.x=travel*.18*pace+fall*.14;
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
  if(model.signature?.type==='kirin')poseKirin(model,time,step,{wind,strike,travel,fall,stage});
  else if(model.signature)poseSignatureBeast(model,time,beat,{wind,strike,travel,fall});
  model.cataloguePose?.({beat,headtime:time,wind,strike,travel,fall,step,stage});
  for(const {root:wing,elbow,hand,side,membranous} of model.flight??[]){
    const pulse=Math.sin(beat-.59);
    wing.rotation.y=side*(.035+wind*.22-strike*.34);
    elbow.rotation.z=side*(.07+pulse*(membranous?.29:.44)+wind*.17-strike*.22);
    elbow.rotation.y=side*(.09+wind*.35-strike*.24);
    hand.rotation.z=side*(-.10+Math.sin(beat-1.16)*.30-wind*.31+strike*.44);
    hand.rotation.y=side*(.08+pulse*.13+wind*.11+fall*.31);
  }
  for(const {forearm,side} of model.limbs??[]){
    forearm.rotation.x=-.13+wind*(side===1?.58:.33)-strike*(pattern==='aim'?.24:.66)-
      travel*.20*Math.cos(step+side*.9)+fall*.48;
    forearm.rotation.y=side*(wind*.18-strike*.17);
  }
  if(model.campaign)poseCampaignSculpt(model,time,{stage,wind,strike,travel,fall,step,beat});
  else if(model.detail&&!model.catalogueSculpt)poseCreatureDetail(model.detail,model,time,beat,wind,strike,travel);
  if(!model.pao&&!model.entry.field){
    body.rotation.x+=wind*(crush?-.17:thrust?.095:0)+strike*(crush?.28:thrust?.13:0)-stagger*.10;
    body.rotation.y=sweep?wind*-.21+strike*.31:thrust?wind*-.09+strike*.12:0;
    if(head){
      head.rotation.x+=wind*(thrust?-.071:.071)+strike*(crush?.20:-.105)-stagger*.15;
      head.rotation.z=stagger*(spec.tilt??0)*.68;
    }
    if(thrust&&['duel','aim','slam','hover'].includes(pattern)&&arms.length===2&&!model.mount){
      arms[1].rotation.x-=strike*.48;
      arms[0].rotation.x+=wind*.17;
    }
  }
  model.finishPose?.({beat,wind,strike,stage,stagger,thrust,sweep,crush,fall});
  model.aura?.update(time,stage,wind,strike,fall,stagger);
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
  model.skin?.pose({beat,wind,strike,stage,stagger,travel,fall});
  crest.rotation.z=airborne||pattern==='radial'?time*(.31+stage*.24):Math.sin(beat*.5)*.16;
  crest.scale.setScalar(1+stage*.20+wind*.13);
  const glow=model.palette[3];
  materials.glow.color.setHex(model.signature?.type==='bear'?0xbbf7f1:glow)
    .lerp(white,Math.min(.84,(spec.flash??0)*.78+wind*.18));
  materials.body.emissiveIntensity=.14+(spec.flash??0)*.19+stage*.08;
  materials.edge.emissiveIntensity=.14+stage*.087+wind*.07;
}

const white=new T.Color(0xfff4e0);
export function removeBestiary(scene,model){
  scene.remove(model.root);
  model.pao?.energy.dispose();
  model.aura?.dispose();
  model.skin?.dispose();
  model.disposeRig?.();
  model.signature?.lume?.dispose();
  model.root.traverse(part=>{if(part.isMesh)part.geometry.dispose();});
  for(const material of Object.values(model.materials))material.dispose();
}

export function bestiaryTint(entry){return colors(entry)[3];}
