import * as T from '../three.min.mjs';
import {lanternRadius} from './lantern-route.mjs?v=nightfall-1';

const stone=new T.MeshStandardMaterial({color:0x51414b,roughness:.88,metalness:.16});
const bevel=new T.MeshStandardMaterial({color:0xa88269,roughness:.69,metalness:.26});
const bark=new T.MeshStandardMaterial({color:0x594030,roughness:.92});
const plank=new T.MeshStandardMaterial({color:0x7d513d,roughness:.88});
const ember=new T.MeshBasicMaterial({color:0xffc67b,toneMapped:false});
const gateOpen=new T.MeshBasicMaterial({color:0xf6c997,transparent:true,opacity:.66,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
const gateShut=new T.MeshBasicMaterial({color:0x2a1b26});
const box=new T.BoxGeometry(1,1,1);
const diamond=new T.OctahedronGeometry(1);
const urn=new T.LatheGeometry([[.20,0],[.36,.14],[.37,.40],[.23,.56],[.22,.68],[.31,.71]].map(([x,y])=>new T.Vector2(x,y)),9);
const arch=new T.TorusGeometry(.98,.16,6,16,Math.PI);
const archInlay=new T.TorusGeometry(.99,.032,5,20,Math.PI);
const mark=new T.RingGeometry(.62,.71,18).rotateX(-Math.PI/2);

function part(parent,geometry,material,x,y,z,sx=1,sy=1,sz=1,turn=0) {
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=turn;parent.add(mesh);
  return mesh;
}

function floorTexture() {
  const paper=document.createElement('canvas');paper.width=paper.height=256;
  const ctx=paper.getContext('2d');
  ctx.fillStyle='#251c20';ctx.fillRect(0,0,256,256);
  for(let row=0;row<4;row++)for(let col=-1;col<5;col++){
    const x=col*64+(row%2)*32,y=row*64;
    const r=((row*53+col*17)%26+26)%26;
    const shade=ctx.createLinearGradient(x,y,x+64,y+64);
    shade.addColorStop(0,'rgb('+(67+r)+','+(56+r)+','+(59+r)+')');
    shade.addColorStop(1,'rgb('+(37+r)+','+(32+r)+','+(36+r)+')');
    ctx.fillStyle=shade;ctx.fillRect(x+2,y+2,60,60);
    ctx.strokeStyle='#2e2428';ctx.beginPath();ctx.moveTo(x+11,y+4);ctx.lineTo(x+16,y+25);ctx.lineTo(x+32,y+36);ctx.lineTo(x+55,y+40);ctx.stroke();
  }
  const data=ctx.getImageData(0,0,256,256);let seed=37483;
  for(let i=0;i<data.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=(seed>>>28)-7;for(let c=0;c<3;c++)data.data[i+c]+=n;}
  ctx.putImageData(data,0,0);
  const tex=new T.CanvasTexture(paper);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(12,12);return tex;
}

let finished=false;
function carveMaterials() {
  if(finished)return;
  finished=true;
  for(const [materials,wood] of [[[stone,bevel],false],[[bark,plank],true]]){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
    const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(128,128);
    let seed=wood?82397:18331;
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const grain=wood?Math.sin(x*.71+Math.sin(y*.10)*1.7)*15+Math.sin(x*.22+y*.021)*18
        :Math.sin(x*.24+y*.30)*9+Math.sin(x*.13-y*.16)*14;
      const seam=wood&&x%31<2?23:!wood&&y%44<2?17:0;
      const light=Math.max(60,Math.min(250,203+grain+(seed>>>27)-seam));
      const i=(y*128+x)*4;
      pixels.data[i]=light;pixels.data[i+1]=light*.95;pixels.data[i+2]=light*(wood?.87:.94);pixels.data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    for(const material of materials){material.map=texture;material.bumpMap=texture;material.bumpScale=wood?.045:.055;material.needsUpdate=true;}
  }
}

export class LanternArt {
  constructor(view) {
    this.view=view;
    carveMaterials();
    this.mask=document.getElementById('lantern-dark');
    this.floor=new T.Mesh(new T.PlaneGeometry(59,59).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:floorTexture(),depthTest:false,depthWrite:false}));
    this.floor.position.y=-.12;this.floor.renderOrder=-54;
    this.root=new T.Group();
    this.lamp=new T.Group();this.lamp.visible=false;
    part(this.lamp,box,bark,0,0,0,.19,.25,.20);
    this.flame=part(this.lamp,diamond,ember.clone(),0,.026,.10,.087,.125,.055);
    part(this.lamp,box,bevel,0,-.13,0,.25,.044,.23);
    part(this.lamp,box,bevel,0,.132,0,.23,.047,.22);
    const glow=new T.Sprite(new T.SpriteMaterial({map:view.halo,color:0xffa253,transparent:true,opacity:.72,depthWrite:false,blending:T.AdditiveBlending}));
    glow.scale.set(.95,.95,1);glow.position.y=.01;this.lamp.add(glow);
    this.light=new T.PointLight(0xffa65f,19,7.2,1.8);
    this.light.position.set(0,.42,.12);this.lamp.add(this.light);
    this.glow=glow;
    view.scene.add(this.floor,this.root,this.lamp);
  }

  set(route) {
    this.root.clear();
    this.route=route;
    this.broken=new Map();
    if(!route)return;
    for(const object of route.barricades){
      const model=new T.Group();
      model.position.set(object.x,0,object.z);
      if(object.style==='fence'){
        part(model,box,bark,0,.53,0,1.65,.85,.18);
        for(let i=0;i<3;i++)part(model,box,plank,(i-1)*.50,.61,.04,.12,1.12,.25,(i-1)*.13);
      }else if(object.style==='urn'){
        part(model,urn,stone,0,0,0,1.2,1.3,1.2);
        part(model,box,bevel,.08,.49,.39,.085,.51,.024,.38);
      }else{
        part(model,box,bark,0,.48,0,1.02,.96,.86);
        part(model,box,plank,0,.48,.445,1.02,.14,.04,.64);
        part(model,box,plank,0,.48,.445,1.02,.14,.04,-.64);
      }
      this.root.add(model);this.broken.set(object,model);
    }
    const gate=new T.Group();
    gate.position.set(route.x,0,route.z);
    for(const side of [-1,1]){
      part(gate,box,stone,side*1.02,.65,0,.36,1.32,.58);
      part(gate,box,bevel,side*1.02,.18,0,.52,.17,.75);
      part(gate,box,bevel,side*1.02,1.17,0,.43,.16,.60);
      part(gate,box,bevel,side*1.01,.73,.306,.065,.74,.04);
    }
    part(gate,arch,stone,0,1.20,0,1.04,1,1.6);
    part(gate,archInlay,bevel,0,1.19,.27,1.04,1,1.2);
    part(gate,diamond,bevel,0,2.15,.11,.23,.29,.16);
    this.door=part(gate,box,gateShut,0,.86,-.11,1.70,1.77,.07);
    this.threshold=part(gate,mark,gateOpen,0,.065,.28,1.3,1,1.05);
    this.gate=gate;this.root.add(gate);
  }

  smash(object) {
    const model=this.broken.get(object);
    if(model)this.root.remove(model);
    this.broken.delete(object);
  }

  tick(hero,time,stage) {
    if(!hero)return;
    if(this.skin!==hero.lanternStyle){
      this.skin=hero.lanternStyle;
      const crimson=this.skin==='crimson';
      this.flame.material.color.setHex(crimson?0xff7976:0xffc67b);
      this.light.color.setHex(crimson?0xff736a:0xffa65f);
      this.glow.material.color.setHex(crimson?0xff625b:0xffa253);
      this.mask.style.setProperty('--lamp-wash',crimson?'#ff686319':'#ffb86d10');
    }
    const fall=hero.reaction?.kind==='fall';
    const beam=lanternRadius(stage)*(fall?.83:1);
    const sx=this.view.height/(this.view.camera.top-this.view.camera.bottom);
    const screen=this.view.project(hero.x,.50,hero.z);
    const flicker=Math.sin(time*10.7)*.018+Math.sin(time*16.4)*.012;
    this.mask.hidden=false;
    const style=this.mask.style;
    style.setProperty('--light-x',Math.round(screen.x)+'px');style.setProperty('--light-y',Math.round(screen.y)+'px');
    style.setProperty('--light-w',Math.round(beam*sx*(1+flicker))+'px');
    style.setProperty('--light-h',Math.round(beam*sx*.67*(1+flicker))+'px');
    this.lamp.visible=true;
    this.lamp.position.set(hero.x-(hero.face??1)*.40,.69+Math.sin(time*7)*.054,hero.z+.22);
    this.lamp.rotation.z=Math.sin(time*7)*.13;
    this.light.intensity=19+flicker*70;
    this.glow.material.opacity=.72+flicker*5;
    if(this.route){
      const open=this.route.ready&&this.route.barricades.every(item=>!item.gate||item.hp<=0);
      this.door.visible=!open;
      this.threshold.visible=open&&this.route.found;
      if(this.threshold.visible)this.threshold.rotation.y=time*.25;
      for(const [object,model] of this.broken){
        model.rotation.z=(1-object.hp/object.maxHp)*.16*Math.sin(time*15+object.x);
      }
    }
  }
}
