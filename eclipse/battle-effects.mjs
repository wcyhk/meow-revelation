import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=nightforge-1';

const PI=Math.PI;

export const particleShapes={stone:1,ice:1,gold:1,feather:2,blood:2,fire:2,root:2,water:3,web:3,void:3};

function painted(size,draw) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const context=canvas.getContext('2d');
  draw(context,size);
  return new T.CanvasTexture(canvas);
}

function randomStream(seed) {
  return ()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  };
}

export function battleTextures() {
  const stone=painted(160,(ctx,size)=>{
    ctx.fillStyle='#888582';
    ctx.fillRect(0,0,size,size);
    const random=randomStream(170173);
    for (let index=0;index<420;index++) {
      const x=random()*size,y=random()*size;
      const tone=Math.floor(35+random()*145);
      ctx.fillStyle='rgba('+tone+','+tone+','+tone+','+(.06+random()*.31)+')';
      ctx.fillRect(x,y,1+random()*17,1+random()*7);
    }
    ctx.lineWidth=1.1;
    for (let index=0;index<17;index++) {
      const x=random()*size,y=random()*size;
      ctx.strokeStyle=index%2?'#3f3b3899':'#bcb4a670';
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+2+random()*18,y+3+random()*7);
      ctx.lineTo(x+11+random()*11,y+3+random()*14);
      ctx.stroke();
    }
  });
  const stain=painted(224,(ctx,size)=>{
    const random=randomStream(89713);
    ctx.translate(size*.53,size*.51);
    const gradient=ctx.createRadialGradient(0,0,6,0,0,100);
    gradient.addColorStop(0,'#3c0707e6');
    gradient.addColorStop(.46,'#56120e9c');
    gradient.addColorStop(1,'#25090700');
    ctx.fillStyle=gradient;
    ctx.beginPath();ctx.ellipse(0,0,100,44,-.27,0,PI*2);ctx.fill();
    for (let index=0;index<92;index++) {
      const angle=random()*PI*2;
      const spread=random()*91;
      ctx.fillStyle=index%3===0?'#2508079a':'#5f160b9b';
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle)*spread,Math.sin(angle)*spread*.49,.6+random()*8,.3+random()*3,angle,0,PI*2);
      ctx.fill();
    }
    ctx.lineCap='round';
    for (let stroke=0;stroke<8;stroke++) {
      ctx.strokeStyle=stroke%2?'#6d180d56':'#25080765';
      ctx.lineWidth=.6+random()*4;
      const y=-18+stroke*5;
      ctx.beginPath();
      ctx.moveTo(-91,y+random()*10);
      ctx.bezierCurveTo(-30,y-12,12,y+4,70+random()*22,y-13);
      ctx.stroke();
    }
  });
  const glyph=painted(192,(ctx,size)=>{
    ctx.translate(size/2,size/2);
    ctx.strokeStyle='#ffffff';
    ctx.lineWidth=1.6;
    for (const radius of [62,74,86]) {
      ctx.beginPath();ctx.arc(0,0,radius,0,PI*2);ctx.stroke();
    }
    for (let index=0;index<12;index++) {
      ctx.rotate(PI/6);
      ctx.beginPath();
      ctx.moveTo(-8,71);ctx.lineTo(0,57);ctx.lineTo(8,71);ctx.lineTo(0,89);ctx.closePath();ctx.stroke();
    }
    ctx.beginPath();ctx.moveTo(0,-56);ctx.lineTo(39,31);ctx.lineTo(-39,31);ctx.closePath();ctx.stroke();
  });
  const dark=painted(128,(ctx,size)=>{
    const mid=size/2;
    const gradient=ctx.createRadialGradient(mid,mid,6,mid,mid,mid-1);
    gradient.addColorStop(0,'#0b0409ed');
    gradient.addColorStop(.43,'#11070de0');
    gradient.addColorStop(1,'#11070d00');
    ctx.fillStyle=gradient;
    ctx.fillRect(0,0,size,size);
  });
  return {stone,stain,glyph,dark};
}

function plate(points,depth=.05) {
  const shape=new T.Shape();
  points.forEach(([x,y],index)=>index?shape.lineTo(x,y):shape.moveTo(x,y));
  shape.closePath();
  return new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:1});
}

export function nightmareForm(spec) {
  const group=new T.Group();
  const body=new T.Color(spec.tint).lerp(new T.Color(0x241926),.84);
  const dark=paintedFinish(new T.MeshStandardMaterial({color:body,roughness:.86,side:T.DoubleSide,
    transparent:true,opacity:.91,depthWrite:false,emissive:body,emissiveIntensity:.14}),'hide');
  const trim=paintedFinish(new T.MeshStandardMaterial({color:0xa17a57,roughness:.47,metalness:.33,
    transparent:true,opacity:.92,depthWrite:false}),'bronze');
  const glow=new T.MeshBasicMaterial({color:spec.tint,transparent:true,opacity:.71,blending:T.AdditiveBlending,depthWrite:false});
  const wing=spec.effect==='feather'||spec.effect==='void';
  const spikes=spec.effect==='ice'||spec.effect==='root'||spec.effect==='web';
  for (const side of [-1,1]) {
    const silhouette=wing
      ? [[.13,-.46],[.43,.42],[1.56,.72],[1.11,.05],[1.40,-.23],[.94,-.38],[1.12,-.72],[.58,-.67],[.28,-.88]]
      : spikes
        ? [[.25,-.7],[.5,.08],[.44,.63],[.86,.96],[.69,.34],[1.17,.60],[.92,.12],[1.40,.15],[1.05,-.27],[.67,-.52]]
        : [[.22,-.58],[.35,.08],[.57,.63],[.97,1.03],[.92,.49],[1.31,.70],[1.03,.25],[.66,-.44]];
    const shadow=new T.Mesh(plate(silhouette),dark);
    shadow.scale.x=side;
    group.add(shadow);
    for(let rivet=0;rivet<3;rivet++){
      const fastening=new T.Mesh(new T.OctahedronGeometry(.047,0),trim);
      fastening.position.set(side*(.37+rivet*.105),.13+rivet*.15,.078);
      fastening.scale.set(.60,1.26,.38);
      group.add(fastening);
    }
    for (let index=0;index<3;index++) {
      const flare=new T.Mesh(plate([[.39+index*.14,-.24+index*.13],[.97+index*.13,.24+index*.18],
        [.79+index*.13,.04+index*.16],[.45+index*.13,-.30+index*.13]]),glow);
      flare.scale.x=side;
      flare.position.z=.09;
      group.add(flare);
    }
  }
  const crown=new T.Mesh(new T.TorusGeometry(.59,.022,5,34,PI*1.59),glow);
  crown.position.y=.75;
  crown.rotation.z=-PI*.31;
  group.add(crown);
  const backing=new T.Mesh(new T.TorusGeometry(.614,.028,5,30,PI*1.59),trim);
  backing.position.copy(crown.position);
  backing.rotation.copy(crown.rotation);
  group.add(backing);
  group.visible=false;
  return group;
}

export function disposeForm(group) {
  const materials=new Set();
  group.traverse(child=>{
    if (!child.isMesh) return;
    child.geometry.dispose();
    materials.add(child.material);
  });
  for (const material of materials) material.dispose();
}
