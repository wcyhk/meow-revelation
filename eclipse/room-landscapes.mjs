import * as T from '../three.min.mjs';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';
import {finishForRoom,roomSurface,weatherFloor,weatherMasonry} from './room-surfaces.mjs?v=penumbra-1';
import {RoomLighting} from './room-lighting.mjs?v=afterglow-1';
import {depthGeometry,sculptRoomDepth} from './room-depth.mjs?v=penumbra-1';
import {LanternShadow} from './lantern-shadow.mjs?v=afterglow-1';
import {windGeometries,windInRoom} from './room-wind.mjs?v=afterglow-1';

const PI=Math.PI,TAU=PI*2;
const groundPlane=new T.PlaneGeometry(64,61).rotateX(-PI/2);
const poolShape=new T.CircleGeometry(1,40).rotateX(-PI/2);
const box=new T.BoxGeometry(1,1,1);
const rock=new T.IcosahedronGeometry(1,0);
const stone=new T.DodecahedronGeometry(1,0);
const bead=new T.IcosahedronGeometry(1,1);
const canopy=new T.IcosahedronGeometry(1,2);
const canopyPoints=canopy.getAttribute('position');
for(let i=0;i<canopyPoints.count;i++){
  const x=canopyPoints.getX(i),y=canopyPoints.getY(i),z=canopyPoints.getZ(i);
  const ripple=1+Math.sin(x*13+y*7)*Math.sin(z*14-y*11)*.15+Math.cos(y*12+z*4)*.08;
  canopyPoints.setXYZ(i,x*ripple,y*ripple,z*ripple);
}
canopy.computeVertexNormals();
const column=new T.CylinderGeometry(.86,1,1,12);
const cylinder=new T.CylinderGeometry(1,1,1,24);
const rib=new T.CylinderGeometry(.64,1,1,7);
const post=new T.CylinderGeometry(.71,1,1,8);
const shard=new T.OctahedronGeometry(1);
const sheet=new T.PlaneGeometry(1,1).rotateX(-PI/2);
const vertical=new T.PlaneGeometry(1,1);
const arcade=new T.TorusGeometry(1,.042,6,34,PI);
const chiseled=new T.LatheGeometry([[0,-.57],[.55,-.53],[.76,-.31],[.67,.12],[.42,.23],[.53,.47],[.31,.65],[0,.92]]
  .map(([x,y])=>new T.Vector2(x,y)),8);
const beveledBase=new T.CylinderGeometry(.82,1,1,8,1,false);
const torus=new T.TorusGeometry(1,.024,4,50).rotateX(-PI/2);
const strand=new T.CylinderGeometry(.38,1,1,7);
const stems=new T.LatheGeometry([[0,-.22],[.43,-.23],[.76,-.11],[1,0],[.91,.20],[.66,.37],[.33,.47],[0,.49]]
  .map(([x,y])=>new T.Vector2(x,y)),18);
const sharedGeometry=new Set([groundPlane,poolShape,box,rock,stone,bead,canopy,column,cylinder,rib,post,shard,sheet,vertical,arcade,chiseled,beveledBase,torus,strand,stems,...depthGeometry,...windGeometries]);

const palettes={
  'grove.jpg':['grove',0x141b24,0x36373b,0x626557,0x98764e,0x3b282b,0x964d47,0x8b75ae,0xec9362],
  'fen.jpg':['canal',0x0c2230,0x243d41,0x53706e,0xa58554,0x112f3f,0x294b46,0x61cbbc,0xffba7c],
  'lotus.jpg':['lotus',0x172435,0x3b4a54,0x6f786b,0xb49760,0x153d43,0x784f74,0x86d4c6,0xffbf81],
  'frost.jpg':['frost',0x151b32,0x455678,0x9dabc2,0x8a98ac,0x293952,0x9baebc,0x88cfff,0xffae79],
  'forge.jpg':['forge',0x1d1019,0x39333b,0x70606a,0xaa6f43,0x4e2229,0x451d1f,0xe57955,0xff9f51],
  'grave.jpg':['grave',0x211c31,0x434555,0x8e8596,0x968485,0x292336,0x5e4b72,0xc6a7ed,0xffbc83],
  'vault-gold.jpg':['vault',0x19141f,0x39323f,0x66605d,0xa8844d,0x312726,0x754d46,0xd7a263,0xffc985],
  'dunes.jpg':['dunes',0x251a27,0x63504d,0x9b785e,0xa86946,0x4a312d,0x76534b,0xea8672,0xffcc87],
  'fungus.jpg':['fungus',0x10252d,0x254043,0x53727a,0x857456,0x162a38,0x465992,0x72e6d7,0xf5b5a3],
  'cathedral.jpg':['cathedral',0x11152b,0x303854,0x676381,0x967951,0x202b47,0x6c456d,0x9a91ff,0xffc78b],
  'desecrated-cathedral.jpg':['desecrated',0x160e24,0x3e354c,0x735c70,0x80634c,0x32192e,0x85314c,0xd67ac6,0xffa26b],
  'throne.jpg':['throne',0x181421,0x44323e,0x726164,0x9f6c49,0x431d26,0x873448,0xe48692,0xffa56e],
  'crimson-throne.jpg':['crimson',0x1e0e1b,0x4c303e,0x805c64,0xb47d55,0x571f24,0xaa354e,0xf46f79,0xff9e6b],
};
export const landscapePictures=Object.keys(palettes);

const inlaid=new Set(['vault','cathedral','desecrated','throne','crimson']);
const glassy=new Set(['cathedral','desecrated','throne','crimson']);
const ancient=new Set(['grove','grave','frost','dunes','fungus']);
const wet=new Set(['canal','lotus','fungus']);
const tiles=new Map();
let glass;

function rng(seed){
  return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
}

function tint(value,light=0){
  return new T.Color(value).offsetHSL(0,.02,light).getStyle();
}

function pavement(type,shade){
  if(tiles.has(type))return tiles.get(type);
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=768;
  const p=canvas.getContext('2d'),n=768,random=rng(type.length*7311+54);
  const fitted=inlaid.has(type);
  p.fillStyle=tint(shade,-.079);p.fillRect(0,0,n,n);
  const rows=fitted?5:6,cols=5;
  const w=n/cols,h=n/rows;
  for(let row=0;row<rows;row++)for(let col=-1;col<cols+1;col++){
    const x=w*(col+(row%2)*.50),y=h*row;
    const warmth=(random()-.45)*.073;
    const finish=p.createLinearGradient(x,y,x+w,y+h);
    finish.addColorStop(0,tint(shade,.022+warmth));
    finish.addColorStop(.52,tint(shade,warmth));
    finish.addColorStop(1,tint(shade,-.048+warmth));
    const margin=fitted?3:5;
    p.fillStyle=finish;
    p.beginPath();
    p.moveTo(x+margin,y+13);
    p.lineTo(x+11,y+margin);
    p.lineTo(x+w-13,y+margin);
    p.lineTo(x+w-margin,y+13);
    p.lineTo(x+w-margin,y+h-12);
    p.lineTo(x+w-13,y+h-margin);
    p.lineTo(x+11,y+h-margin);
    p.lineTo(x+margin,y+h-12);p.closePath();p.fill();
    p.strokeStyle=fitted?'#b99e6746':'#a6aba12c';
    p.lineWidth=1.38;p.stroke();
    for(let i=0;i<3+(row+col)%3;i++){
      const sx=x+random()*w,sy=y+random()*h;
      p.beginPath();p.moveTo(x+w*.5,y+h-7);
      p.lineTo((x+w*.5+sx)*.5,sy+8);p.lineTo(sx,sy);p.lineTo(sx-9,sy-20);
      p.strokeStyle=fitted?'#29233148':'#1115225e';p.lineWidth=1+random()*1.2;p.stroke();
    }
    if(fitted){
      p.strokeStyle='#c6a66a5b';p.lineWidth=.85;
      p.strokeRect(x+14,y+14,w-28,h-28);
      p.fillStyle='#b9915849';
      for(const xx of [x+15,x+w-15])for(const yy of [y+15,y+h-15]){
        p.beginPath();p.ellipse(xx,yy,2.7,2.7,0,0,TAU);p.fill();
      }
    }
  }
  for(let i=0;i<20300;i++){
    p.fillStyle=i%3?'#06101826':'#fbe2b327';
    p.fillRect(random()*n,random()*n,.7+random()*4,.46+random()*3);
  }
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  map.wrapS=map.wrapT=T.RepeatWrapping;
  map.repeat.set(5,5);
  map.anisotropy=4;
  tiles.set(type,map);
  return map;
}

function stainedGlass(){
  if(glass)return glass;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=384;
  const g=canvas.getContext('2d');
  const outline=new Path2D('M22 369 L22 145 Q44 66 128 14 Q212 66 234 145 L234 369 Z');
  g.save();g.clip(outline);g.fillStyle='#2e2661';g.fillRect(0,0,256,384);
  const colors=['#757aff','#5e94eb','#91d8ef','#deb3fa','#b24885','#c47a72','#f0b18a','#946ed1','#6864c7'];
  for(let row=0;row<12;row++)for(let col=-1;col<7;col++){
    const x=col*43+(row%2)*23,y=row*35;
    for(const [j,series] of [[[x,y],[x+43,y],[x+24,y+35]],[[x+43,y],[x+66,y+35],[x+24,y+35]]].entries()){
      g.beginPath();series.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();
      g.fillStyle=colors[((row*17+col*7+j*5)%colors.length+colors.length)%colors.length];g.fill();
      g.strokeStyle='#211b39';g.lineWidth=1.8;g.stroke();
    }
  }
  g.translate(128,170);
  g.fillStyle='#252046';g.beginPath();g.arc(0,0,76,0,TAU);g.fill();
  g.strokeStyle='#b0976c';g.lineWidth=2;g.stroke();
  for(let i=0;i<12;i++){
    g.rotate(TAU/12);
    g.beginPath();g.moveTo(13,0);g.quadraticCurveTo(43,-27,70,0);g.quadraticCurveTo(41,24,13,0);g.fillStyle=colors[i%9];g.fill();g.stroke();
  }
  g.fillStyle='#f2d4af';g.beginPath();g.ellipse(0,0,13,19,-.2,0,TAU);g.fill();
  g.restore();g.lineWidth=4;g.strokeStyle='#b09170';g.stroke(outline);
  glass=new T.CanvasTexture(canvas);glass.colorSpace=T.SRGBColorSpace;glass.anisotropy=4;
  return glass;
}

function inkMaterial(color,accent,opacity=.48){
  const material=new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,
    blending:accent?T.AdditiveBlending:T.NormalBlending,toneMapped:false});
  return material;
}

function waterMaterial(color,fire){
  return new T.ShaderMaterial({
    transparent:true,depthWrite:false,uniforms:{clock:{value:0},ink:{value:new T.Color(color)},heat:{value:Number(fire)}},
    vertexShader:`
      varying vec2 u;
      void main(){
        u=uv;
        vec4 p=vec4(position,1.);
        #ifdef USE_INSTANCING
          p=instanceMatrix*p;
        #endif
        gl_Position=projectionMatrix*modelViewMatrix*p;
      }`,
    fragmentShader:`
      varying vec2 u;uniform float clock,heat;uniform vec3 ink;
      void main(){
        vec2 p=(u-.5)*2.;
        float rim=1.-smoothstep(.70,1.,length(p));
        float wave=sin(p.x*17.+sin(p.y*10.+clock*.68)*1.83+clock)*cos(p.y*25.-p.x*13.-clock*.71);
        float details=sin(p.x*93.+p.y*31.+wave*4.+clock*2.2)*sin(p.y*42.-p.x*32.+clock*.7);
        float foam=pow(.5+.5*wave,6.)*.48+pow(.5+.5*details,5.)*.19;
        vec3 color=ink*(.53+foam*1.0)+mix(vec3(.10,.22,.30),vec3(.68,.19,.049),heat)*foam;
        gl_FragColor=vec4(color,rim*(.37+foam*.39));
        #include <colorspace_fragment>
      }`,
  });
}

function soilType(type){
  if(type==='dunes')return 'sand';
  if(type==='frost')return 'ice';
  if(type==='forge'||type==='crimson')return 'slag';
  return 'slate';
}

function setMaterials(view,type,base,edge,trim,body,accent,glimmer,warm,cutaway){
  const env=forgeEnvironment();
  const finish=finishForRoom(type);
  const standard=(color,metalness,roughness,kind,useEnv)=>weatherMasonry(new T.MeshStandardMaterial({
    color,metalness,roughness,...roomSurface(kind,1,kind==='metal'?.51:.72),envMap:useEnv?env:null,
    envMapIntensity:useEnv?.68:0,
    emissive:color,emissiveIntensity:.033,
  }),kind);
  const material={
    basal:standard(new T.Color(base).multiplyScalar(1.7),.12,.86,finish.masonry,false),
    ridge:standard(new T.Color(edge).multiplyScalar(1.28),.23,.68,finish.masonry,true),
    gilt:standard(trim,.64,.55,'metal',true),bone:standard(body,.12,.83,finish.ornament,false),
    leaf:standard(new T.Color(accent).multiplyScalar(1.45),.04,.90,type==='fungus'?'wood':'rock',false),
    crystal:standard(glimmer,.31,.39,'ice',true),
    emission:inkMaterial(glimmer,true,.74),lantern:inkMaterial(warm,true,.94),
    glass:new T.MeshBasicMaterial({map:stainedGlass(),transparent:true,alphaTest:.07,side:T.DoubleSide,toneMapped:false}),
    water:waterMaterial(glimmer,type==='forge'||type==='crimson'),
    shadow:new T.MeshBasicMaterial({map:view.shadow,color:0x0c090f,opacity:.74,transparent:true,depthWrite:false}),
    goldDust:inkMaterial(trim,true,.29),
    soft:new T.MeshBasicMaterial({map:view.halo,color:glimmer,opacity:.28,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),
    ember:new T.MeshBasicMaterial({map:view.halo,color:warm,opacity:.49,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),
  };
  material.crystal.emissive.setHex(glimmer);
  material.crystal.emissiveIntensity=.32;
  material.gilt.envMapIntensity=.95;
  // Shared batches all use the same screen-space corridor around the player.
  for(const [name,mat] of Object.entries(material)){
    if(!['water','shadow','goldDust','soft','ember'].includes(name))cutaway.material(mat);
  }
  return material;
}

function batch(root,mobile){
  const lists=new Map(),pose=new T.Object3D();
  function put(geo,mat,x,y,z,sx=1,sy=sx,sz=sx,yaw=0,pitch=0,roll=0) {
    pose.position.set(x,y,z);pose.scale.set(sx,sy,sz);pose.rotation.set(pitch,yaw,roll);
    pose.updateMatrix();
    if(!lists.has(geo))lists.set(geo,new Map());
    const byMaterial=lists.get(geo);
    if(!byMaterial.has(mat))byMaterial.set(mat,[]);
    byMaterial.get(mat).push(pose.matrix.clone());
  }
  function rod(geo,mat,r,from,to,taper=1){
    const a=new T.Vector3(...from),b=new T.Vector3(...to),delta=b.clone().sub(a);
    pose.position.copy(a).lerp(b,.5);
    pose.scale.set(r,delta.length(),r*taper);
    pose.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
    pose.updateMatrix();
    if(!lists.has(geo))lists.set(geo,new Map());
    const byMaterial=lists.get(geo);
    if(!byMaterial.has(mat))byMaterial.set(mat,[]);
    byMaterial.get(mat).push(pose.matrix.clone());
  }
  function finish(){
    for(const [geo,byMaterial] of lists)for(const [mat,transforms] of byMaterial){
      const group=new T.InstancedMesh(geo,mat,transforms.length);
      for(const [i,transform] of transforms.entries())group.setMatrixAt(i,transform);
      group.instanceMatrix.needsUpdate=true;
      if(mat.transparent)group.renderOrder=mat.blending===T.AdditiveBlending?7:3;
      else{
        group.receiveShadow=true;
        group.castShadow=geo!==sheet&&geo!==shard&&geo!==bead&&(!mobile||geo!==canopy);
      }
      root.add(group);
    }
  }
  return {put,rod,finish,mobile};
}

function architecture(ctx,x,z,h,type,angle=0){
  const {put,rod,m}=ctx;
  put(sheet,m.shadow,x+.24,.008,z+.32,3.91,1,3.18);
  put(beveledBase,m.basal,x,.14,z,1.02,.28,1.02,angle);
  put(column,m.ridge,x,.32,z,1.13,.15,1.13,angle);
  put(column,m.gilt,x,.45,z,.92,.08,.92,angle);
  put(column,m.basal,x,.56,z,.84,.20,.84,angle);
  put(column,m.basal,x,h*.5+.43,z,.69,h,.69,angle);
  for(let j=0;j<6;j++){
    const a=j*TAU/6+angle;
    put(rib,j%2?m.ridge:m.basal,x+Math.cos(a)*.593,h*.50+.37,z+Math.sin(a)*.593,.139,h*.92,.144,a);
    if(!ctx.mobile)put(rib,m.gilt,x+Math.cos(a)*.681,h*.49+.37,z+Math.sin(a)*.681,.020,h*.64,.024,a);
  }
  put(column,m.ridge,x,h+.43,z,.88,.22,.88,angle);
  put(column,m.gilt,x,h+.57,z,.91,.052,.91,angle);
  put(beveledBase,m.ridge,x,h+.72,z,.91,.27,.91,angle);
  put(beveledBase,m.basal,x,h+.87,z,1.02,.18,1.02,angle);
  if(['vault','throne','crimson','cathedral','desecrated'].includes(type)){
    const hx=x+Math.sin(angle)*.73,hz=z+Math.cos(angle)*.73;
    rod(rib,m.gilt,.043,[hx,.91,hz],[hx,h*.56,hz]);
    for(let i=0;i<3;i++){
      put(shard,i===1?m.crystal:m.gilt,hx,1.27+i*.36,hz,.12,.20,.12,angle);
    }
  }
  return {x,z,y:h+.56};
}

const glassTones={cathedral:0xbccbff,desecrated:0xe28bbc,throne:0x91a3d6,crimson:0xff8a80};

function sunlight(root,map,x,z,angle,sprawl,type){
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{image:{value:map},energy:{value:.77},tint:{value:new T.Color(glassTones[type])}},
    vertexShader:'varying vec2 phase;void main(){phase=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 phase;uniform sampler2D image;uniform vec3 tint;uniform float energy;
      void main(){
        vec2 v=phase;
        v.x=(v.x-.5)*(1.+v.y*.27)+.5+(v.y-.5)*.23;
        const float stepSize=.013;
        vec4 center=texture2D(image,v);
        vec4 surround=(texture2D(image,v+vec2(stepSize,0.))+texture2D(image,v-vec2(stepSize,0.))+
          texture2D(image,v+vec2(0.,stepSize))+texture2D(image,v-vec2(0.,stepSize)))*.25;
        vec4 s=mix(center,surround,.53);
        float edge=smoothstep(.04,.28,phase.y)*(1.-smoothstep(.64,.99,phase.y))*
          smoothstep(.04,.23,phase.x)*(1.-smoothstep(.70,.96,phase.x));
        float flare=exp(-dot(v-vec2(.49,.49),v-vec2(.49,.49))*7.);
        gl_FragColor=vec4(s.rgb*tint,s.a*edge*energy*(.59+flare*.41));
        #include <colorspace_fragment>
      }`,
  });
  const patch=new T.Mesh(sheet,material);
  patch.position.set(x,.014,z);patch.scale.set(3.76*sprawl,1,8.1*sprawl);
  patch.rotation.y=angle;patch.renderOrder=5;root.add(patch);
  return material;
}

function architecturalEdge(ctx,stage,type){
  const {put,rod,m,draw}=ctx;
  const columns=[];
  const rise=glassy.has(type)?6.30:type==='vault'||type==='forge'?5.30:type==='frost'?4.62:3.7;
  for(let i=-3;i<=3;i++){
    const x=i*4.65+(i===0?0:(draw()-.5)*.22);
    const z=-18.44-(i%3===0?.40:0);
    const h=rise*(.90+draw()*.15);
    columns.push(architecture(ctx,x,z,h,type));
    put(box,m.basal,x,.28,z-.55,4.49,.51,1.18);
    if(glassy.has(type)||type==='vault'||type==='forge')put(box,m.basal,x,h*.37,z-1.29,4.59,h*.76,.44);
  }
  for(let i=1;i<columns.length;i++){
    const from=columns[i-1],to=columns[i],gap=to.x-from.x;
    if(glassy.has(type)||type==='vault'||type==='forge'){
      const high=Math.min(from.y,to.y)+.95;
      const left=[from.x+.53,from.y,from.z+.09],right=[to.x-.53,to.y,to.z+.09];
      const peak=[(from.x+to.x)*.5,high+1.13,(from.z+to.z)*.5+.12];
      for(const [u,v] of [[left,peak],[right,peak]]){
        rod(box,m.ridge,.21,u,v,2.4);
        rod(box,m.gilt,.038,[u[0],u[1],u[2]+.31],[v[0],v[1],v[2]+.31]);
      }
      if(glassy.has(type)){
        put(vertical,m.glass,peak[0],3.32,peak[2]-.47,gap*.74,6.50,1);
        put(vertical,m.glass,peak[0],3.51,peak[2]-1.72,gap*.66,6.13,1);
      }
      if(type==='vault'){
        put(box,m.gilt,peak[0],2.33,peak[2]-.54,2.89,3.43,.085);
        put(box,m.basal,peak[0],2.33,peak[2]-.38,2.52,3.12,.18);
        for(let p=0;p<5;p++)put(box,m.gilt,peak[0]-.96+p*.48,2.31,peak[2]-.23,.065,3.00,.20);
      }
    }else if(i%2){
      put(box,m.ridge,(from.x+to.x)*.5,rise*.90,(from.z+to.z)*.5,4.43,.22,.80);
      put(box,m.basal,(from.x+to.x)*.5,.55,(from.z+to.z)*.5+.1,4.62,.29,1.03);
    }
  }
  for(const side of [-1,1]){
    for(let i=0;i<5;i++){
      const z=-11.90+i*5.73;
      const x=side*(16.16+(i%2)*.65);
    if(glassy.has(type)||['vault','forge','frost','canal'].includes(type)){
        architecture(ctx,x,z,rise*(.79+draw()*.15),type,side*.30);
        put(box,m.basal,x,.23,z+2.11,1.37,.46,5.2);
      }else{
        put(stone,m.basal,x,.74,z,1.76,1.42,2.0,draw()*TAU,.19,side*.27);
        put(rock,m.ridge,x+side*.32,1.02,z+1.67,1.19,1.02,1.21,draw()*TAU);
      }
    }
    put(box,m.basal,side*16.38,.29,1.08,2.05,.55,34);
    put(box,m.gilt,side*15.62,.57,1.08,.059,.065,33);
  }
  if(type==='throne'||type==='crimson'){
    for(let j=0;j<5;j++){
      put(box,m.basal,0,.09+j*.17,-16.25-j*.35,7-j*.37,.18,1.31);
      put(box,m.gilt,0,.182+j*.17,-15.67-j*.35,7-j*.37,.035,.13);
    }
    put(stone,m.bone,0,1.36,-17.67,2.14,.65,1.17);
    put(box,m.bone,0,2.81,-18.29,2.16,2.68,.39);
    for(const side of [-1,1])for(let j=0;j<4;j++){
      rod(rib,m.gilt,.13,[side*(.45+j*.23),1.79,-17.95],[side*(.49+j*.33),3.80+j*.25,-18.38]);
    }
    put(shard,m.crystal,0,4.43,-18,.65,1.1,.45,.22);
  }
}

function lanterns(ctx,stage){
  const {put,m,draw}=ctx;
  const lights=[];
  const span=stage.boss?9.50:11.45;
  for(let i=0;i<12;i++){
    const a=(i+.14)*TAU/12;
    const x=Math.cos(a)*span,z=Math.sin(a)*(span+.75)-2;
    if(Math.abs(x)<6&&z>6)continue;
    const tall=.80+draw()*.34;
    put(post,m.basal,x,.099,z,.38,.19,.36);
    put(cylinder,m.gilt,x,tall*.39,z,.087,tall*.70,.087);
    put(post,m.ridge,x,tall*.72,z,.24,.16,.24);
    put(post,m.gilt,x,tall*.82,z,.25,.082,.25);
    for(let j=0;j<3;j++){
      const b=j*TAU/3+a;
      put(rib,m.gilt,x+.19*Math.cos(b),tall*.94,z+.19*Math.sin(b),.052,.25,.06,b,0,.20);
    }
    lights.push({x,z,y:tall*.95,phase:a});
    put(sheet,m.ember,x,.015,z,2.65,1,2.11);
  }
  return lights;
}

function cliff(ctx,x,z,yaw,reach){
  const {put,draw,m}=ctx;
  for(let i=0;i<7;i++){
    const y=.42+i*.28;
    const over=1.14-i*.132;
    put(i%2===0?stone:rock,i%3===0?m.ridge:m.basal,x+Math.sin(yaw)*i*.08,y,z+Math.cos(yaw)*i*.091,
      reach*over,.49,reach*(.66+draw()*.17),yaw+draw()*.8,.17,.24);
  }
}

function deadTree(ctx,x,z,tall,twist,crown){
  const {rod,put,draw,m,mobile}=ctx;
  put(sheet,m.shadow,x+.52,.012,z+.75,5.26,1,3.65);
  const d=(a,b,c)=>[x+a,tall*b,z+c];
  const trunk=[d(0,-.04,0),d(.12,.30,-.12),d(-.23,.58,-.32),d(-.07,.78,-.25),d(.25,1,-.44)];
  for(let i=1;i<trunk.length;i++)rod(strand,i%2?m.bone:m.basal,.53-i*.094,trunk[i-1],trunk[i],.86);
  for(let i=0;i<5;i++){
    const a=i*TAU/5+twist;
    rod(rib,m.basal,.19,d(0,.07,0),d(Math.cos(a)*1.36,-.01,Math.sin(a)*1.04));
    const length=.75+draw()*1.28,sub=.52+draw()*.25,rise=.20+draw()*.12;
    const b=d(Math.cos(a)*length,sub+rise,Math.sin(a)*length);
    rod(strand,m.bone,.15,d(-.12,sub,-.18),b);
    const fork=d(Math.cos(a+.45)*length*1.44,sub+rise+.07,Math.sin(a+.45)*length*1.4);
    rod(strand,m.bone,.081,b,fork);
    if(crown){
      for(let j=0;j<(mobile?2:4);j++){
        const q=a+j*2.4,s=.48+draw()*.25;
        put(canopy,j===3?m.bone:m.leaf,b[0]+Math.cos(q)*.68,b[1]+.16+j*.13,b[2]+Math.sin(q)*.62,
          s*1.65,s*.69,s*1.29,q,.11,.27);
      }
    }
  }
}

function mushroom(ctx,x,z,height,angle){
  const {put,rod,m,draw}=ctx;
  const radius=.37+height*.36;
  put(sheet,m.shadow,x+.44,.008,z+.81,radius*4.2,1,radius*3.0);
  rod(rib,m.bone,.135+height*.064,[x,.02,z],[x+Math.sin(angle)*.32,height,z+Math.cos(angle)*.32]);
  const xx=x+Math.sin(angle)*.32,zz=z+Math.cos(angle)*.32;
  put(stems,m.leaf,xx,height,zz,radius,radius*.74,radius,angle,.14,.15);
  put(stems,m.crystal,xx,height-.15,zz,radius*.76,.10,radius*.77,angle);
  for(let i=0;i<5;i++){
    const a=i*TAU/5;
    put(bead,m.emission,xx+Math.cos(a)*radius*.66,height+.11+draw()*.10,zz+Math.sin(a)*radius*.66,.056,.034,.063,a);
  }
  put(sheet,m.soft,x,.015,z,3.4,1,3.5);
}

function placeBorder(ctx,stage,type){
  const {put,rod,m,draw}=ctx;
  const room=stage.room??0;
  const count=ctx.mobile?16:23;
  for(let i=0;i<count;i++){
    const side=i%2===0?-1:1,t=Math.floor(i/2);
    const z=-16.4+t*(30/Math.ceil(count/2))+draw()*1.85;
    const x=side*(16.30+draw()*4.70);
    if(type==='grove')deadTree(ctx,x,z,3.55+draw()*3.30,draw()*TAU,i%3!==0);
    else if(type==='grave'){
      if(i%4===0)deadTree(ctx,x,z,2.74+draw()*1.95,draw()*TAU,false);
      const yaw=draw()*.85-.39;
      put(stone,m.basal,x,.14,z,.81,.19,.54,yaw);
      put(box,m.ridge,x,.83,z,.75,1.47,.24,yaw,.11,-.20);
      put(stone,m.bone,x,1.55,z,.41,.30,.17,yaw,.09,-.20);
      put(shard,m.crystal,x+.15,1.31,z+.14,.108,.19,.08,yaw);
    }else if(type==='fungus'){
      mushroom(ctx,x,z,1.55+draw()*3.01,draw()*TAU);
      mushroom(ctx,x-side*.68,z+.78,.8+draw()*1.31,draw()*TAU);
      if(i%3===0)deadTree(ctx,x+side*1.8,z-.9,4.1,draw()*TAU,false);
    }else if(type==='frost'){
      put(stone,m.basal,x,.28,z,1.37,.52,1.24,draw()*TAU);
      for(let p=0;p<3+(i%3);p++){
        const ox=(draw()-.5)*1.4,oz=(draw()-.5)*1.8,h=1.24+draw()*2.74;
        put(shard,p%3?m.crystal:m.ridge,x+ox,h*.48,z+oz,.37+draw()*.22,h,.42,draw()*TAU,.34,.29);
      }
      put(sheet,m.soft,x,.011,z,2.93,1,2.93);
    }else if(type==='dunes'){
      cliff(ctx,x,z,draw()*TAU,1.37+draw()*2.23);
      put(shard,m.gilt,x,2.96,z,1.56,.105,1.18,draw()*TAU);
    }else if(['forge','vault'].includes(type)){
      const high=.43+(i%4)*.27;
      put(box,m.basal,x,high,z,1.52,high*1.78,1.54,draw()*.45);
      put(box,m.ridge,x,high*2,z,1.70,.14,1.63);
      put(box,m.gilt,x,high*1.91,z,1.66,.04,1.62);
      if(type==='forge'){
        rod(rib,m.ridge,.19,[x,high*2,z],[x,3.56,z]);
        rod(rib,m.gilt,.16,[x,3.56,z],[x-side*1.33,3.56,z]);
        put(sheet,m.ember,x,.015,z,3.64,1,2.82);
      }else{
        put(box,m.gilt,x,high+.25,z+.79,.26,.39,.11);
        put(shard,m.crystal,x,high+.26,z+.89,.08,.12,.07);
      }
    }else if(wet.has(type)){
      put(poolShape,m.water,x,.013,z,2.7+draw(),1,2.1);
      put(rock,m.bone,x,.63,z,.82,.75,1.03,draw()*TAU);
      if(type==='lotus'){
        for(let p=0;p<6;p++){
          const a=p*TAU/6;
          put(shard,p%2?m.leaf:m.crystal,x+.51*Math.sin(a),.31+(p%2)*.18,z+.51*Math.cos(a),.34,.17,.70,a,.31);
        }
      }
    }else if(glassy.has(type)){
      const ornament=(i+room)%3;
      put(stone,m.basal,x,.39,z,1.31,.74,1.38,PI/4);
      put(box,m.gilt,x,.79,z,1.63,.09,1.61,PI/4);
      if(ornament===0){
        put(rib,m.ridge,x,1.67,z,.62,1.69,.58);
        put(shard,m.crystal,x,2.83,z,.32,.61,.25,draw()*TAU,.13);
      }
    }
  }
}

function insignia(root,type,stage,m){
  const n=stage.room??0;
  if(!inlaid.has(type)&&!stage.boss)return;
  const major=stage.chapterBoss?5.65:stage.boss?4.50:3.12+n*.105;
  const seals=[major,major*.87,major*.67,major*.61];
  for(const [i,radius] of seals.entries()){
    const ring=new T.Mesh(torus,i===1?m.goldDust:m.gilt);
    ring.scale.set(radius,.51,radius);
    ring.position.set((n%3-1)*.65,.029,-2.25);
    ring.renderOrder=4;
    root.add(ring);
  }
  const mat=inkMaterial(type==='forge'||type==='crimson'?0xd87c54:0xd8a868,true,.33);
  const rune=new T.InstancedMesh(box,mat,36);
  const temp=new T.Object3D();
  for(let i=0;i<36;i++){
    const theta=TAU*i/36+(stage.bearing??0);
    const radius=major*1.06;
    temp.position.set((n%3-1)*.65+Math.cos(theta)*radius,.027,-2.25+Math.sin(theta)*radius);
    temp.scale.set(.050,.018,i%3===0?.34:.115);
    temp.rotation.y=-theta+PI*.39;
    temp.updateMatrix();rune.setMatrixAt(i,temp.matrix);
  }
  rune.renderOrder=5;root.add(rune);
}

function landmarks(ctx,stage,type){
  const {put,rod,m,draw,solid}=ctx;
  const room=stage.room??0;
  for(const side of [-1,1]){
    const x=side*(8.9+(room%3)*.56);
    const z=-7.5+(side===1?1.5:-1.7)+(room%4)*.48;
    if(type==='grove'||type==='grave'){
      deadTree(ctx,x,z,4.65+draw()*.92,draw()*TAU,type==='grove');
      solid.push({x,z,radius:.48,height:4.6});
      for(let i=0;i<5;i++){
        const a=i*TAU/5;
        put(stone,i%2?m.basal:m.ridge,x+Math.sin(a)*1.12,.18,z+Math.cos(a)*1.14,.39,.42+draw()*.31,.29,a);
      }
    }else if(type==='canal'||type==='lotus'){
      put(poolShape,m.water,x,.025,z,2.66,1,2.03,.18);
      for(let i=0;i<12;i++){
        const a=i*TAU/12;
        put(stone,m.basal,x+Math.cos(a)*2.38,.13,z+Math.sin(a)*1.91,.57,.28,.33,-a);
        if(type==='lotus'){
          const q=a+.39;
          put(shard,i%3===0?m.crystal:m.leaf,x+Math.cos(q)*.87,.24,z+Math.sin(q)*.85,.34,.25,.59,-q,.32);
        }
      }
      put(shard,m.crystal,x,.56,z,.25,.86,.26,.42);
      put(sheet,m.soft,x,.038,z,5,1,4.1);
    }else if(type==='fungus'){
      mushroom(ctx,x,z,2.48+draw(),draw()*TAU);
      mushroom(ctx,x+side*1.35,z+1.30,1.27,draw()*TAU);
      solid.push({x,z,radius:.47,height:2.4});
    }else if(type==='frost'){
      solid.push({x,z,radius:.68,height:2.2});
      for(let i=0;i<7;i++){
        const a=i*TAU/7;
        const h=1.05+Math.pow(draw(),.78)*2.7;
        put(shard,i%3?m.crystal:m.ridge,x+Math.cos(a)*.72,h*.44,z+Math.sin(a)*.78,.41,h*.60,.49,a,.19,.29);
      }
      put(sheet,m.soft,x,.016,z,4.41,1,4.19);
    }else if(type==='dunes'){
      cliff(ctx,x,z,draw()*TAU,1.96);
      solid.push({x,z,radius:1.03,height:1.96});
      put(box,m.gilt,x,.93,z+.65,.11,.68,.03,.37,.08,.24);
    }else if(type==='forge'){
      const columnZ=z-.85;
      architecture(ctx,x,columnZ,3.12,type,.22*side);
      solid.push({x,z:columnZ,radius:.73,height:3.12});
      put(poolShape,m.water,x,.031,z+1.34,1.79,1,1.29);
      for(let i=0;i<4;i++){
        const y=.88+i*.37;
        rod(rib,i%2?m.ridge:m.gilt,.11,[x+side*.63,y,columnZ],[x+side*1.34,y+.55,z+.18]);
      }
      put(sheet,m.ember,x,.049,z+1.34,5.40,1,4.32);
    }else{
      const rear=architecture(ctx,x,z,3.66+draw()*.78,type,side*.18);
      const far=architecture(ctx,x+side*2.33,z-.62,3.99,type,side*.31);
      solid.push({x,z,radius:.73,height:rear.y},{x:far.x,z:far.z,radius:.73,height:far.y});
      rod(box,m.ridge,.22,[rear.x,rear.y,z],[far.x,far.y,z-.62],1.44);
      for(let i=0;i<3;i++){
        const q=(i+1)/4;
        put(shard,i===1?m.crystal:m.gilt,T.MathUtils.lerp(rear.x,far.x,q),2.05+(i%2)*.30,
          T.MathUtils.lerp(z,z-.62,q),.14,.43,.13,.45);
      }
      put(sheet,m.soft,x,.024,z,3.92,1,3.59);
    }
  }
}

function chambers(ctx,stage,type){
  const {put,m,draw}=ctx,room=stage.room??0;
  const terrain=soilType(type);
  for(const side of [-1,1]){
    const x=side*(12.59+draw()*.60);
    for(let i=0;i<7;i++){
      const z=-15.8+i*4.72;
      const length=2.46+draw()*1.22;
      if(wet.has(type)||terrain==='slag'){
        put(poolShape,m.water,x,.013,z,1.77,1,length,.19*side);
        put(box,m.basal,x+side*1.17,.055,z,.092,.079,length*1.72,.04);
      }else if(!ancient.has(type)){
        for(const border of [-1,1])put(box,m.ridge,x+border*.47,.016,z,.22,.051,length);
        put(box,m.gilt,x-side*.60,.034,z,.034,.018,length*.96);
      }
      if((room+i)%3===0)put(rock,m.ridge,x+side*.76,.19,z+.49,.51,.30,.47,draw()*TAU,.15);
    }
  }
  for(let i=0;i<20;i++){
    const x=(draw()-.5)*26,z=(draw()-.5)*27;
    put(shard,m.basal,x,.019,z,.071+draw()*.29,.008+draw()*.027,.11+draw()*.30,draw()*TAU);
  }
}

function roomCenter(ctx,stage,type){
  const {put,rod,m,solid}=ctx;
  const room=stage.room??0;
  const z=-4.0+(room%3)*.43;
  if(glassy.has(type)||type==='vault'||type==='forge'){
    for(const side of [-1,1]){
      const x=side*5.45;
      const y=2.88+(room%2)*.34;
      architecture(ctx,x,z,y,type,side*.28);
      solid.push({x,z,radius:.80,height:y});
      for(let j=0;j<3;j++){
        const postZ=z-.82-j*.21;
        const cap=3.11+y*.42-j*.29;
        rod(rib,j===1?m.gilt:m.ridge,.049,[x,.63,postZ],[x+side*(.19+j*.23),cap,postZ-.18]);
      }
    }
    const spring=3.28+(room%2)*.34;
    if(type==='forge'){
      for(const side of [-1,1]){
        rod(cylinder,m.bone,.118,[side*5.50,spring,z],[side*2.20,spring,z-1.65]);
        rod(rib,m.gilt,.086,[side*4.78,spring+.19,z],[side*1.66,spring+.19,z-1.65]);
      }
    }else{
      put(arcade,m.ridge,0,spring,z-.15,5.50,2.18,3.2);
      put(arcade,m.gilt,0,spring-.12,z+.02,5.48,2.11,1.30);
      put(arcade,m.basal,0,spring+.11,z-.33,5.56,2.28,3.1);
    }
  }

  if(glassy.has(type)||['canal','frost','lotus','fungus'].includes(type)){
    for(const side of [-1,1]){
      const x=side*(glassy.has(type)?4.45:4.92),mz=z+side*.66;
      put(sheet,m.shadow,x,.006,mz,2.6,1,2.58);
      put(beveledBase,m.basal,x,.115,mz,.73,.22,.73,PI/4);
      put(beveledBase,m.gilt,x,.235,mz,.68,.037,.68,PI/4);
      put(beveledBase,m.ridge,x,.338,mz,.48,.18,.48,PI/4);
      put(chiseled,m.crystal,x,1.14,mz,.42,.70,.42,side*.63,side*.19);
      put(shard,m.emission,x,1.17,mz,.24,.32,.24);
      for(let i=0;i<3;i++){
        const a=i*TAU/3+side*.43;
        const dx=Math.cos(a),dz=Math.sin(a);
        rod(rib,m.gilt,.042,[x+dx*.54,.38,mz+dz*.54],[x+dx*.33,1.02,mz+dz*.33]);
        put(shard,m.gilt,x+dx*.26,1.03,mz+dz*.26,.063,.18,.064,a);
      }
      put(sheet,m.soft,x,.023,mz,4.23,1,3.9);
      solid.push({x,z:mz,radius:.55,height:1.66});
    }
  }

  for(const side of [-1,1]){
    const x=side*(glassy.has(type)?3.2:3.75);
    for(let i=0;i<6;i++){
      const q=z+i*2.42;
      const trim=glassy.has(type)||type==='vault'?m.gilt:m.ridge;
      put(box,trim,x,.014,q,.033,.028,1.63);
      put(shard,trim,x,.020,q-.91,.114,.022,.056,PI/3);
      put(shard,trim,x,.020,q+.91,.095,.021,.046,-PI/3);
    }
  }
}

export class RoomLandscape {
  constructor(view,cutaway){
    this.view=view;
    this.cutaway=cutaway;
    this.root=new T.Group();
    this.lanternShadows=view.lanternArt?new LanternShadow():null;
    this.heroWarm=view.lanternArt?null:new T.PointLight(0xffc079,0,12,2);
    this.roomLighting=new RoomLighting(view);
    view.scene.add(this.root);
    if(this.heroWarm)view.scene.add(this.heroWarm);
  }

  clear(){
    this.roomLighting.clear();
    const materials=new Set();
    this.root.traverse(node=>{
      if(node.material)materials.add(node.material);
      if(node.isInstancedMesh)node.dispose();
      if(node.geometry&&!sharedGeometry.has(node.geometry))node.geometry.dispose();
    });
    for(const mat of materials)mat.dispose();
    this.root.clear();
  }

  set(stage){
    this.clear();
    const [type,sky,base,edge,trim,body,accent,glimmer,warm]=palettes[stage.picture]??palettes['grove.jpg'];
    const m=setMaterials(this.view,type,base,edge,trim,body,accent,glimmer,warm,this.cutaway);
    this.m=m;
    this.picture=stage.picture;
    this.type=type;
    this.root.name='3D: '+type;
    this.view.scene.background=new T.Color(sky);
    this.view.scene.fog=new T.FogExp2(sky,inlaid.has(type)?.017:.023);
    this.skyBase=new T.Color(sky);
    this.skyDusk=this.skyBase.clone().lerp(new T.Color(0x493041),.28);
    this.skyNight=this.skyBase.clone().lerp(new T.Color(0x0a1533),.36);
    this.floorProgress=0;
    const draw=rng((stage.floor??1)*48109+type.length*91311);
    const finish=finishForRoom(type);
    const scan=roomSurface(finish.floor,finish.repeat,type==='frost'?.61:.83);
    const floor=weatherFloor(new T.MeshStandardMaterial({
      color:scan.map?finish.tint:0xdde1e6,
      ...(scan.map?scan:{map:pavement(type,base),...scannedSurface(inlaid.has(type)?'hammered':'leather',.25)}),
      envMap:forgeEnvironment(),envMapIntensity:inlaid.has(type)?.98:.46,
      metalness:finish.metalness,roughness:finish.roughness,
    }),type);
    this.lanternShadows?.apply(floor);
    for(const material of Object.values(m)){
      if(material.isMeshStandardMaterial)this.lanternShadows?.apply(material);
    }
    const mesh=new T.Mesh(groundPlane,floor);
    mesh.position.set(0,-.071,-.91);
    mesh.receiveShadow=true;
    this.root.add(mesh);
    const chunks=batch(this.root,this.view.mobile);
    this.solid=[];
    const ctx={...chunks,m,draw,solid:this.solid};
    architecturalEdge(ctx,stage,type);
    placeBorder(ctx,stage,type);
    landmarks(ctx,stage,type);
    chambers(ctx,stage,type);
    roomCenter(ctx,stage,type);
    sculptRoomDepth(ctx,stage,type);
    this.wind=windInRoom(this.root,this.view.mobile,type,accent,draw);
    this.lanternShadows?.apply(this.wind.material);
    this.lanternShadows?.setObstacles(this.solid,stage.props);
    insignia(this.root,type,stage,m);
    this.lamps=lanterns(ctx,stage);
    this.roomLighting.set(type,stage,this.lamps);
    this.projections=[];
    if(glassy.has(type))for(let i=0;i<5;i++){
      const x=(i-2)*5.5+(stage.room??0)%3*.82;
      this.projections.push(sunlight(this.root,stainedGlass(),x,-5.4+i*.35,-.27+i*.073,.80+(i%3)*.17,type));
    }
    this.flames=new T.InstancedMesh(shard,m.lantern,this.lamps.length);
    this.orbs=new T.InstancedMesh(vertical,m.ember,this.lamps.length);
    this.flames.renderOrder=8;this.orbs.renderOrder=9;
    this.flames.frustumCulled=this.orbs.frustumCulled=false;
    this.root.add(this.flames,this.orbs);
    this.pose=new T.Object3D();
    chunks.finish();
    // Themes without liquid/glass have no draw call for those unused materials.
    for(const mat of Object.values(m)){
      let found=false;
      this.root.traverse(node=>{if(node.material===mat)found=true;});
      if(!found)mat.dispose();
    }
    this.light(0);
  }

  light(darkness){
    this.roomLighting.light(darkness);
    this.m.ember.opacity=.68*(1-darkness*.87);
    this.m.soft.opacity=.50*(1-darkness*.77);
    this.m.lantern.opacity=.95*(1-darkness*.88);
    for(const mat of this.projections)mat.uniforms.energy.value=.88*(1-darkness*.86);
  }

  tick(time,hero,darkness,dt=0) {
    const still=this.view.feedback?.subdued;
    this.floorProgress+=dt;
    const shift=still?0:Math.min(1,this.floorProgress/105);
    const dusk=T.MathUtils.smoothstep(shift,0,.46);
    const night=T.MathUtils.smoothstep(shift,.33,1);
    const sky=this.view.scene.background;
    sky.copy(this.skyBase).lerp(this.skyDusk,dusk).lerp(this.skyNight,night);
    this.view.scene.fog.color.copy(sky);
    this.roomLighting.tick(time,dusk,night);
    this.wind.clock.value=still?0:time;
    this.m.water.uniforms.clock.value=time%3600;
    if(this.heroWarm){
      this.heroWarm.position.set(hero.x,1.55,hero.z);
      this.heroWarm.intensity=hero.lanternOut>0?0:8.3*(1-darkness*.23);
    }
    const p=this.pose;
    for(const [i,{x,y,z,phase}] of this.lamps.entries()){
      const glow=Math.sin(time*9.6+phase*13)*.17+Math.sin(time*13+phase)*.10;
      p.position.set(x,y+.14,z);
      p.rotation.set(0,time*.75+phase,glow*.32);
      p.scale.set(.071,.179+glow*.11,.066);
      p.updateMatrix();this.flames.setMatrixAt(i,p.matrix);
      p.position.set(x,y+.21,z);
      p.quaternion.copy(this.view.camera.quaternion);
      p.scale.set(.76+glow*.25,.82+glow*.18,1);
      p.updateMatrix();this.orbs.setMatrixAt(i,p.matrix);
    }
    this.flames.instanceMatrix.needsUpdate=true;
    this.orbs.instanceMatrix.needsUpdate=true;
  }
}
