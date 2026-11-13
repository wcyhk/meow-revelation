import * as T from '../three.min.mjs';

const PI=Math.PI,TAU=PI*2;
const shapes={
  pearl:new T.IcosahedronGeometry(1,1), round:new T.SphereGeometry(1,13,9),
  horn:new T.ConeGeometry(1,1,9), metal:new T.BoxGeometry(1,1,1),
  bar:new T.CylinderGeometry(1,1,1,8), gem:new T.OctahedronGeometry(1),
  ring:new T.TorusGeometry(1,.075,6,28), chain:new T.TorusGeometry(1,.15,6,12),
};
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
  const [dark,body,edge,glow]=palettes[entry.tone];
  const ethereal=['priest','shade','serpent','hydra','star'].includes(entry.family);
  const chitin=['turtle','wasp','spider','dragon','beast'].includes(entry.family);
  const metal=['duelist','emperor','captain','rider'].includes(entry.family);
  const surface=(color,metalness,roughness)=>new T.MeshStandardMaterial({
    color,metalness,roughness,bumpMap:relief(),bumpScale:chitin?.055:.029,emissive:color,emissiveIntensity:.09,
  });
  return {
    deep:surface(dark,metal?.35:.10,ethereal?.56:.86),
    body:surface(body,metal?.53:chitin?.29:.09,chitin?.41:.71),
    edge:surface(edge,metal?.63:.18,.39),
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
  return {root,mesh,rod,bone,finish};
}

function face(k,joint,options={}){
  const {mesh,rod}=k;
  const {snout=.36,broad=.39,horns=2,shell=false}=options;
  mesh(joint,'pearl','body',0,.052,0,broad,.47,.43);
  mesh(joint,'pearl','edge',0,-.16,.25,broad*.75,.30,snout);
  mesh(joint,'pearl','deep',0,-.2,.37,broad*.63,.13,snout*.75);
  for(const side of [-1,1]){
    mesh(joint,'gem','glow',side*broad*.61,.10,.36,.078,.081,.063,0,0,side*.12);
    mesh(joint,'pearl',shell?'edge':'body',side*broad*.65,.02,.21,.123,.21,.19,0,0,side*.26);
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

function humanoid(k,entry){
  const {root,bone,mesh,rod}=k;
  const huge=['ogre','straw'].includes(entry.family);
  const royal=entry.family==='emperor';
  const mage=entry.family==='priest'||entry.family==='shade';
  const width=huge?.63:royal?.53:.44;
  const body=bone(root,0,1.05,0);
  mesh(body,'pearl','deep',0,.04,0,width*.84,.54,.35);
  mesh(body,'pearl','body',0,.48,0,width,.66,.38);
  mesh(body,'gem','edge',0,.50,.34,width*.64,.43,.16);
  mesh(body,'gem','glow',0,.55,.46,.13,.21,.068);
  const head=bone(body,0,1.08,.03);
  face(k,head,{broad:width*.62,snout:.22,horns:entry.crest==='oni'?1:huge?2:0});
  if(mage||royal||entry.crest==='mask'){
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
    mesh(arm,'pearl','body',side*.07,-.32,.03,.23,.40,.23);
    mesh(arm,'gem','edge',side*.08,-.51,.13,.26,.22,.17);
    mesh(arm,'pearl','deep',side*.09,-.77,.04,.18,.22,.20);
    if(side===1||['twins','pair','twin'].includes(entry.crest)){
      const hand=bone(arm,side*.08,-.73,.16);
      blade(k,hand,entry.crest,huge||royal);
    }
    arms.push(arm);
  }
  if(royal||mage||entry.family==='shade'){
    for(const side of [-1,1]){
      const cape=bone(body,side*.41,.49,-.23);
      mesh(cape,'wing',entry.family==='shade'?'deep':'body',0,0,0,side*.77,1.07,.95,0,0,-PI*.60);
      mesh(cape,'wing','edge',.07,-.02,-.06,side*.78,.99,.77,0,0,-PI*.60);
      legs.push(cape);
    }
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
  return {body,arms,legs,head};
}

function quadruped(k,entry){
  const {root,bone,mesh,rod}=k;
  const turtle=entry.family==='turtle',rider=entry.family==='rider';
  const body=bone(root,0,turtle?.85:1.11,0);
  mesh(body,'pearl','body',0,.14,-.21,turtle?.84:.50,.54,1.05);
  mesh(body,'pearl','deep',0,-.16,-.2,turtle?.71:.44,.36,.85);
  const head=bone(body,0,.23,turtle?.94:1.0);
  face(k,head,{broad:turtle?.35:.46,snout:turtle?.39:.47,horns:entry.crest==='tiger'||entry.crest==='bear'?0:2,shell:turtle});
  if(turtle){
    mesh(body,'pearl','edge',0,.32,-.29,1.01,.61,1.23);
    for(let i=0;i<11;i++){
      const a=i*2.399;
      const r=i<3?.38:.77;
      const x=Math.sin(a)*r,z=Math.cos(a)*r-.23,y=.32+Math.sqrt(1-r*r)*.55;
      mesh(body,'pearl','body',x,y,z,.23,.17,.26);
      rod(body,'edge',[x,y,z],[x*1.06,y+.31+(i%3)*.15,z],.133,'horn');
    }
  }else {
    for(let i=0;i<5;i++){
      const z=.74-i*.37;
      const boost=['kirin','devour','spike'].includes(entry.crest)?1.4:1;
      rod(body,'edge',[0,.43,z],[.055,.43+boost*(.28+.15*Math.cos(i)),z-.19],.16,'horn');
    }
    if(entry.crest==='tiger'||entry.crest==='fox')for(const side of [-1,1]){
      for(let i=0;i<4;i++)mesh(body,'gem','deep',side*.44,.08+i%2*.23,.54-i*.42,.08,.34,.14,0,0,side*-.25);
    }
  }
  const legs=[];
  for(const side of [-1,1])for(const z of [-.78,.69]){
    const limb=bone(root,side*(turtle?.67:.43),turtle?.8:1.11,z);
    mesh(limb,'pearl','body',0,-.26,0,.22,.39,.26);
    mesh(limb,'pearl','body',0,-.59,.11,.18,.30,.19);
    mesh(limb,'pearl','edge',0,turtle?-.67:-.94,.28,.228,.14,.32);
    for(let i=-1;i<=1;i++)rod(limb,'edge',[i*.086,turtle?-.67:-.94,.33],[i*.092,turtle?-.72:-.96,.51],.054,'horn');
    legs.push(limb);
  }
  const tail=bone(body,0,.09,-1.18);
  rod(tail,'body',[0,0,.09],[0,.21,-.53],.135,'horn');
  rod(tail,'edge',[0,.13,-.40],[.17,.48,-.89],.10,'horn');
  if(rider){
    const knight=bone(body,0,.6,-.27);
    mesh(knight,'pearl','body',0,.42,0,.29,.45,.23);
    const helm=bone(knight,0,.99,0);face(k,helm,{broad:.25,horns:0,snout:.18});
    const hand=bone(knight,.43,.34,.17);blade(k,hand,entry.crest,true);
    mesh(knight,'gem','edge',-.34,.41,.25,.20,.37,.15);
  }
  return {body,head,legs,tail};
}
function flyer(k,entry){
  const {root,bone,mesh,rod}=k;
  const dragon=entry.family==='dragon', insect=entry.family==='wasp';
  const body=bone(root,0,1.12,0);
  mesh(body,'pearl','body',0,.21,0,dragon?.53:.37,dragon?.56:.42,dragon?.83:.59);
  mesh(body,'pearl','edge',0,.18,.32,insect?.24:.38,.27,.40);
  const head=bone(body,0,.42,.84);
  face(k,head,{broad:dragon?.41:.28,horns:dragon?2:0,snout:dragon?.50:.28});
  const arms=[];
  for(const side of [-1,1]){
    const limb=bone(body,side*.31,.40,0);
    const stretch=dragon?1.05:insect?.79:.93;
    mesh(limb,'wing',insect?'edge':'body',0,0,0,side*stretch,insect?.43:.82,insect?.43:.8,0,0,side*.08);
    rod(limb,'edge',[0,0,0],[2.05*side*stretch,.69,0],insect?.055:.092);
    for(let i=0;i<5;i++){
      const x=side*(.45+i*.27)*stretch;
      if(dragon)rod(limb,'deep',[x,.43,0],[x*1.17,-.13+i*.07,.07],.057);
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
  for(let i=0;i<5;i++){
    const width=(insect?.31:.38)*(1-i*.15);
    mesh(tail,'pearl',i%2?'deep':'body',0,-i*.081,-i*.25,width,width*.81,.25);
  }
  if(insect)rod(tail,'edge',[0,-.35,-1.02],[0,-.61,-1.47],.13,'horn');
  return {body,head,arms,tail};
}

function coil(k,entry){
  const {root,bone,mesh}=k;
  const body=bone(root,0,.14,0);
  const legs=[];
  const count=entry.family==='hydra'?15:12;
  for(let first=0;first<count;first+=3){
    const a=first*.49,radius=1.19-first*.047,x=Math.sin(a)*radius,z=Math.cos(a)*radius;
    const joint=bone(body,x,.26+first*.032,z);
    joint.restHeight=joint.position.y;
    for(let i=first;i<Math.min(first+3,count);i++){
      const az=i*.49,r=1.19-i*.047;
      const px=Math.sin(az)*r-x,pz=Math.cos(az)*r-z,py=(i-first)*.032;
      mesh(joint,'pearl',i%2?'body':'deep',px,py,pz,.33-i*.009,.25,.44,0,-az);
      mesh(joint,'gem','edge',px,py+.165,pz,.17,.12,.28,0,-az);
      if(i%2===0)mesh(joint,'gem','glow',px,py+.26,pz,.076,.063,.14,0,-az);
    }
    legs.push(joint);
  }
  const arms=[];
  const necks=entry.family==='hydra'?5:1;
  for(let index=0;index<necks;index++){
    const offset=index-(necks-1)/2;
    const neck=bone(body,offset*.45,.50,.33+Math.abs(offset)*.03);
    mesh(neck,'pearl','body',0,.60,0,.32,1.03,.35,-.16,0,offset*-.12);
    if(['cobra','greed'].includes(entry.crest)){
      mesh(neck,'pearl','edge',0,1.06,.005,.80,.49,.29);
      mesh(neck,'pearl','body',0,1.19,-.06,.45,.46,.30);
    }
    const head=bone(neck,0,1.38,.18);
    face(k,head,{broad:entry.crest==='greed'?.55:.40,snout:.52,horns:entry.crest==='cobra'?0:2});
    arms.push(neck);
  }
  return {body,arms,legs};
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
    mesh(mark,'ring','edge',0,.44,-.25,.97,.97,.91,0,.10,.35);
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
  const root=new T.Group(),materials=buildMaterials(entry);
  const k=kit(root,materials);
  let parts;
  switch(entry.family){
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
  return {root,materials,entry,crest,scale:height*.87/Math.max(1.7,box.max.y),pattern:poses[entry.family],...parts};
}

export function poseBestiary(model,unit,spec,time,x,z){
  const {root,body,crest,head,arms=[],legs=[],tail,pattern,scale,materials,entry}=model;
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
  crest.rotation.z=airborne||pattern==='radial'?time*(.31+stage*.24):Math.sin(beat*.5)*.16;
  crest.scale.setScalar(1+stage*.20+wind*.13);
  const glow=palettes[entry.tone][3];
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

export function bestiaryTint(tone){return palettes[tone][3];}
