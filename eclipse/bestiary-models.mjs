import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=practice-1';

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
  m014:[0x19253a,0x474d72,0xa2acc8,0xff6228],
  m015:[0x68271d,0xb44b23,0xffd74d,0xfff4c1],
  m008:[0x263834,0x547f55,0xe4dcc4,0xa7ca87],m022:[0x2c2628,0x646169,0xded8cc,0xa9e7ff],
  m150:[0x3e2821,0x806042,0xdfbb78,0xc278d8],m151:[0x1a2212,0x415518,0xd3b644,0xdaef6b],
  m152:[0x142331,0x215b7b,0x46b7bd,0xff9674],m153:[0x14151a,0x252731,0x655c79,0xa99cd4],
  m154:[0x2c2529,0x634a3b,0xcbac86,0xf77744],m155:[0x5c3234,0xc86d54,0xf6cc8a,0xf9aa6e],
  m156:[0x432729,0x936247,0xddb480,0xe6884e],m157:[0x282531,0x963c4b,0xce9e79,0x81dde8],
  m158:[0x332f3b,0x647783,0xd7e3ea,0xec8067],
  m106:[0x182d47,0x354f69,0x8fbad2,0xff773e],
  m124:[0x4a2921,0x83553b,0xe9dcc4,0xffad42],m125:[0x192b24,0x345543,0xdedbd0,0xffbb3d],
  'trial-jing-light':[0x493235,0x777078,0xc9bfba,0xffad83],
  'trial-jing-dark':[0x161217,0x413139,0x7e5252,0xff8064],
  'trial-shang-light':[0x303943,0x778d9f,0xc7dde8,0xa2d9ff],
  'trial-shang-dark':[0x121523,0x222c49,0x54638e,0x739eff],
  'trial-kai-light':[0x253531,0x758b7d,0xb4c8ad,0xbef29c],
  'trial-kai-dark':[0x101915,0x25392d,0x60744d,0x8ed67a],
  m093:[0x4d493b,0x8e8167,0xd3c7a8,0xffdf85],
  m094:[0x181715,0x383229,0x746249,0xe7ba56],
};
const colors=entry=>referencePalettes[entry.id]??palettes[entry.tone];
const trialWeapons={'trial-jing':'halberd','trial-shang':'swords','trial-kai':'bow',m093:'spear',m094:'spear'};
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
  const [dark,body,edge,glow]=colors(entry);
  const ethereal=['priest','shade','serpent','hydra','star'].includes(entry.family);
  const chitin=['turtle','wasp','spider','dragon','beast'].includes(entry.family);
  const metal=['duelist','emperor','captain','rider'].includes(entry.family);
  const surface=(color,metalness,roughness,finish)=>paintedFinish(new T.MeshStandardMaterial({
    color,metalness,roughness,bumpMap:relief(),bumpScale:chitin?.062:.043,emissive:color,emissiveIntensity:.07,
  }),finish);
  const pigment=color=>new T.Color(color).lerp(new T.Color(0x5d5049),.20);
  const trim=new T.Color(edge).lerp(new T.Color(0xb48556),.52);
  return {
    deep:surface(pigment(dark),metal?.31:.07,ethereal?.62:.88,'cloth'),
    body:surface(pigment(body),metal?.48:chitin?.27:.10,chitin?.48:.75,metal?'iron':chitin?'stone':'hide'),
    edge:surface(pigment(edge),metal?.56:.17,.47,metal?'iron':'bone'),
    trim:surface(trim,.45,.43,'bronze'),
    glow:new T.MeshBasicMaterial({color:glow}),
  };
}

function kit(root,materials){
  const lists=new Map();
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
          const geo=shapes[batch.shape];
          return total+(geo.index?.count??geo.attributes.position.count)*batch.parts.length;
        },0);
        const positions=new Float32Array(count*3), normals=new Float32Array(count*3), uv=new Float32Array(count*2);
        let cursor=0;
        for(const batch of batches){
          const geo=shapes[batch.shape];
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
        }
        const geo=new T.BufferGeometry();
        geo.setAttribute('position',new T.BufferAttribute(positions,3));
        geo.setAttribute('normal',new T.BufferAttribute(normals,3));
        geo.setAttribute('uv',new T.BufferAttribute(uv,2));
        part.add(new T.Mesh(geo,materials[finish]));
      }
    }
  }
  return {root,mesh,rod,bone,finish,materials};
}

function face(k,joint,options={}){
  const {mesh,rod}=k;
  const {snout=.36,broad=.39,horns=2,shell=false,reptile=false}=options;
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
    rod(joint,'edge',[side*broad*.48,-.21,.37],[side*broad*.43,-.41,.43],.085,'horn');
    if(horns===2)rod(joint,'edge',[side*broad*.68,.34,-.03],[side*(broad+.17),.73,-.11],.15,'horn');
  }
  if(horns===1)rod(joint,'edge',[.04,.34,.08],[.02,.83,-.08],.21,'horn');
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
  rod(hand,'deep',[.02,-.47,-.23],[-.18,.69,.38],.053);
  if(weapon==='spear'){
    rod(hand,'body',[.04,-.95,-.48],[-.25,.94,.53],.050);
    rod(hand,'edge',[-.20,.78,.43],[-.39,1.50,.88],.135,'horn');
    rod(hand,'glow',[-.20,.84,.48],[-.36,1.44,.84],.024,'horn');
    mesh(hand,'gem','trim',-.22,.88,.52,.13,.20,.12);
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
  }else face(k,head,{broad:court?.28:width*.62,snout:court?.11:.22,horns:entry.crest==='oni'?1:huge?2:0});
  if(court){
    for(const side of [-1,1]){
      mesh(body,'mantle','edge',side*.07,.48,-.14,side*.66,1.7,1.30,-.18,-side*.44,0);
      mesh(head,'pearl','deep',side*.205,.21,.054,.16,.46,.26,0,0,side*.26);
      rod(head,'trim',[side*.18,.26,.19],[side*.36,.63,.17],.035,'horn');
      mesh(body,'mantle','body',side*.39,.64,.13,side*.62,.64,.78,.20,0,-side*.31);
    }
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
    if(side===1||['twins','pair','twin'].includes(entry.crest)){
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
  }
  if(entry.family==='straw'){
    mesh(head,'bar','edge',0,.49,0,.65,.13,.65);
    mesh(head,'horn','body',0,.68,0,.52,.63,.52);
    for(const side of [-1,1])for(let i=0;i<5;i++){
      rod(arms[side===-1?0:1],i%2?'edge':'body',[0,-.39,0],[side*(.09+i*.065),-.89,.09+i*.07],.079,'horn');
    }
  }
  if(entry.id==='m154'||entry.id==='m158'||entry.id==='m022'){
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
  const trial=trialType(entry.id);
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
  }else face(k,head,{broad:turtle?.35:.46,snout:turtle?.39:.47,horns:turtle||entry.crest==='tiger'||entry.crest==='bear'?0:2,shell:turtle});
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
      if(entry.id==='m150'){
        mesh(body,'ring','trim',x,y+.104,z,.245,.24,.42,PI*.43,0,a);
        mesh(body,'gem','glow',x,y+.15,z,.112,.051,.127);
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
  const redPhoenix=entry.id==='m015';
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
  }else face(k,head,{broad:dragon?.41:.28,horns:dragon?2:0,snout:dragon?.50:.28});
  const arms=[];
  for(const side of [-1,1]){
    const limb=bone(body,side*.31,.40,0);
    const stretch=dragon?1.05:insect?.79:.93;
    if(redPhoenix){
      for(let feather=0;feather<9;feather++){
        const x=.30+feather*.192;
        const y=.18+Math.sin(feather*.20)*.77;
        const base=[side*x*.66,y*.50,-.09];
        const middle=[side*(x+.32),y,-.14-feather*.036];
        rod(limb,feather%3===0?'body':'trim',base,middle,.142,'horn');
        rod(limb,'edge',middle,[side*(x+.65),y+.39,-.30-feather*.080],.10,'horn');
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
      else mesh(limb,'gem',i%2?'edge':'glow',x,.02+i*.08,.075,insect?.07:.13,insect?.10:.24,.048,0,0,side*.29);
    }
    if(insect){
      mesh(limb,'wing','glow',side*.18,-.19,-.34,side*.56,.32,.42,0,-side*.30,side*.18);
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
  if(insect)rod(tail,'edge',[0,-.35,-1.02],[0,-.61,-1.47],.13,'horn');
  if(entry.id==='m151')for(let band=0;band<4;band++)mesh(tail,'ring','trim',0,-band*.078,-band*.25-.08,
    .31-band*.034,.24-band*.022,.74);
  return {body,head,arms,tail};
}

function coil(k,entry){
  const {root,bone,mesh}=k;
  const body=bone(root,0,.14,0);
  const legs=[];
  const cloudDragon=entry.id==='m106';
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
  if(rebuilt)serpentTail(body,k.materials,entry);
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

function serpentTail(body,materials,entry){
  const turns=entry.id==='m001'?1.35:1.05;
  const path=new T.CatmullRomCurve3(Array.from({length:20},(_,i)=>{
    const t=i/19,angle=t*TAU*turns;
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

function spider(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,.90,0);
  mesh(body,'pearl','deep',0,.28,-.55,.58,.65,.77);
  const head=bone(body,0,.02,.43);
  face(k,head,{broad:.34,snout:.28,horns:0});
  const legs=[];
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const z=.58-i*.34;
    const limb=bone(root,side*.29,.86,z);
    const foot=[side*(1.39-i*.025),-.80,.20-z*.46];
    rod(limb,'body',[0,0,0],[side*1.14,.43,z*.5],.083);
    rod(limb,'edge',[side*1.14,.43,z*.5],foot,.09,'horn');
    legs.push(limb);
  }
  return {body,head,legs};
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

export function mountBestiary(scene,entry,height){
  if(entry.source==='kuanglu15')entry={...entry,family:'rider'};
  const root=new T.Group(),materials=buildMaterials(entry);
  const k=kit(root,materials);
  let parts;
  if(entry.id==='m124'||entry.id==='m125')parts=serpentGuardian(k,entry.id==='m124');
  else if(entry.id==='m106')parts=coil(k,entry);
  else switch(entry.family){
    case 'turtle':case 'beast':case 'rider':parts=quadruped(k,entry);break;
    case 'dragon':case 'bird':case 'wasp':parts=flyer(k,entry);break;
    case 'serpent':case 'hydra':parts=coil(k,entry);break;
    case 'star':case 'eggs':parts=star(k,entry);break;
    case 'spider':parts=spider(k);break;
    default:parts=humanoid(k,entry);break;
  }
  const crest=ornaments(k,entry,parts);
  k.finish();
  const box=new T.Box3().setFromObject(root);
  scene.add(root);
  const pattern=entry.id==='m106'?'coil':entry.id==='m124'?'duel':poses[entry.family];
  return {root,materials,entry,crest,scale:height*.87/Math.max(1.7,box.max.y),pattern,...parts};
}

export function poseBestiary(model,unit,spec,time,x,z){
  const {root,body,crest,head,arms=[],legs=[],tail,pattern,scale,materials,entry,mount}=model;
  const stage=spec.phase??unit.bossPhase??0;
  const fall=spec.fall??0;
  const wind=unit.attack?1-unit.attack.time/Math.max(.001,unit.attack.windup??unit.spec.time):0;
  const strike=unit.motion?Math.max(0,1-unit.motion.age/.32):0;
  const beat=time*(pattern==='flutter'?24:pattern==='wing'?8:4.2)+unit.phase;
  const airborne=['wing','flutter','hover'].includes(pattern);
  const travel=unit.move??0;
  const float=airborne?.24+Math.sin(beat)*.145+stage*.10:Math.sin(beat)*.05;
  const phaseScale=1+stage*.155;
  root.visible=(spec.fade??1)>.18;
  root.position.set(x,.02+Math.max(0,(spec.bob??0)*.38+float)*(1-fall),z);
  root.rotation.set(-fall*1.43+strike*.10,((unit.attack?.dx??unit.motion?.dx??unit.face)>0?.47:-.47)+Math.sin(beat*.37)*.085,
    (spec.tilt??0)*.62+fall*.24);
  root.scale.set(scale*phaseScale,scale*phaseScale*(1-(spec.compression??0)*.31),scale*phaseScale);
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
      arm.rotation.x=wind*(sign>0?-1.26:-.55)+strike*(pattern==='aim'?.25:1.07)+Math.sin(beat+index*PI)*travel*.24;
      arm.rotation.z=sign*(.10+wind*.33+stage*.10);
    }
  }
  for(const [index,leg] of legs.entries()){
    leg.rotation.x=Math.sin(beat+index*PI*.81)*travel*(pattern==='crawl'?.24:.49);
    if(pattern==='coil')leg.position.y=leg.restHeight+Math.sin(beat+index*.83)*(.09+stage*.03);
  }
  if(tail)tail.rotation.y=Math.sin(beat*.55)*.25+strike*.25;
  if(mount){
    const {knight,hand,mantle,embers,trial}=mount;
    const charge=['lance','pounce'].includes(unit.attack?.pattern??unit.motion?.pattern);
    const lift=Math.max(wind,strike)*.28;
    knight.rotation.x=-wind*.34+strike*(charge?.50:.25)+travel*Math.sin(beat*1.7)*.064;
    knight.rotation.y=(wind-strike)*.31;
    hand.rotation.set(trial==='bow'?-wind*.40+strike*.23:-wind*.83+strike*.79,
      (wind-strike)*(trial==='swords'?.70:.49),wind*(trial==='spear'?.84:.43)-strike*.39);
    mantle.rotation.x=-travel*.30-Math.sin(beat*1.8)*.10-lift;
    embers.position.y=.46+Math.sin(beat*1.6)*.09+lift;
    embers.rotation.z=Math.sin(beat*.7)*.21+strike*.27;
    head.rotation.x-=lift;
    legs[1].rotation.x-=lift;
    legs[3].rotation.x-=lift;
  }
  crest.rotation.z=airborne||pattern==='radial'?time*(.31+stage*.24):Math.sin(beat*.5)*.16;
  crest.scale.setScalar(1+stage*.20+wind*.13);
  const glow=colors(entry)[3];
  materials.glow.color.setHex(glow).lerp(white,Math.min(.84,(spec.flash??0)*.78+wind*.18));
  materials.body.emissiveIntensity=.14+(spec.flash??0)*.19+stage*.08;
  materials.edge.emissiveIntensity=.14+stage*.087+wind*.07;
}

const white=new T.Color(0xfff4e0);
export function removeBestiary(scene,model){
  scene.remove(model.root);
  model.root.traverse(part=>{if(part.isMesh)part.geometry.dispose();});
  for(const material of Object.values(model.materials))material.dispose();
}

export function bestiaryTint(entry){return colors(entry)[3];}
