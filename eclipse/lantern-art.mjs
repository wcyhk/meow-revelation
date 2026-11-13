import * as T from '../three.min.mjs';
import {lanternRadius} from './lantern-route.mjs?v=sigils-1';

const stone=new T.MeshStandardMaterial({color:0x51414b,roughness:.88,metalness:.16});
const bevel=new T.MeshStandardMaterial({color:0xa88269,roughness:.69,metalness:.26});
const bark=new T.MeshStandardMaterial({color:0x594030,roughness:.92});
const plank=new T.MeshStandardMaterial({color:0x7d513d,roughness:.88});
const ember=new T.MeshBasicMaterial({color:0xffc67b,toneMapped:false});
const box=new T.BoxGeometry(1,1,1);
const diamond=new T.OctahedronGeometry(1);
const urn=new T.LatheGeometry([[.20,0],[.36,.14],[.37,.40],[.23,.56],[.22,.68],[.31,.71]].map(([x,y])=>new T.Vector2(x,y)),9);
const arch=new T.TorusGeometry(.98,.16,6,16,Math.PI);
const archInlay=new T.TorusGeometry(.99,.032,5,20,Math.PI);
const mark=new T.RingGeometry(.62,.71,18).rotateX(-Math.PI/2);
const doorShape=new T.Shape();
doorShape.moveTo(-.83,0);doorShape.lineTo(.83,0);doorShape.lineTo(.83,1.12);
doorShape.quadraticCurveTo(.83,1.98,0,2.05);doorShape.quadraticCurveTo(-.83,1.98,-.83,1.12);
doorShape.lineTo(-.83,0);
const pointedDoor=new T.Shape();
pointedDoor.moveTo(-.83,0);pointedDoor.lineTo(.83,0);pointedDoor.lineTo(.83,1.04);
pointedDoor.quadraticCurveTo(.83,1.65,0,2.25);pointedDoor.quadraticCurveTo(-.83,1.65,-.83,1.04);
pointedDoor.lineTo(-.83,0);
const doorFace=new T.ShapeGeometry(doorShape,10);
const pointFace=new T.ShapeGeometry(pointedDoor,10);
const ribs=new T.TubeGeometry(new T.CatmullRomCurve3([
  new T.Vector3(.96,.03,0),new T.Vector3(.97,.96,0),new T.Vector3(.78,1.49,0),
  new T.Vector3(.42,1.91,0),new T.Vector3(0,2.26,0),
]),14,.096,6,false);
const gateThemes=new WeakMap();
const lanternPalette={
  original:{flame:0xffc67b,light:0xffa65f,glow:0xffa253,wash:'#ffb86d14'},
  crimson:{flame:0xff7976,light:0xff736a,glow:0xff625b,wash:'#ff686319'},
  moonless:{flame:0xd0f3ff,light:0xa6c9ff,glow:0x9cbbff,wash:'#9bc5ff19'},
};

function part(parent,geometry,material,x,y,z,sx=1,sy=1,sz=1,turn=0) {
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=turn;parent.add(mesh);
  return mesh;
}

function gateTheme(frame) {
  if(gateThemes.has(frame))return gateThemes.get(frame);
  const stonework=stone.clone(),edging=bevel.clone();
  stonework.color.setHex(frame.stone);stonework.emissive.setHex(frame.stone);stonework.emissiveIntensity=.20;
  edging.color.setHex(frame.trim);edging.emissive.setHex(frame.trim);edging.emissiveIntensity=.12;
  const shadow=new T.MeshBasicMaterial({color:new T.Color(frame.stone).multiplyScalar(.25),side:T.DoubleSide});
  const glow=new T.MeshBasicMaterial({color:frame.light,transparent:true,opacity:.62,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
  const barricade=bark.clone();
  barricade.color.setHex(frame.stone).lerp(new T.Color(0x4b342b),.43);
  const brace=plank.clone();
  brace.color.setHex(frame.trim).lerp(new T.Color(0x73553f),.37);
  const theme={stonework,edging,shadow,glow,barricade,brace};
  gateThemes.set(frame,theme);
  return theme;
}

function makeGate(route,halo) {
  const gate=new T.Group();
  const {frame}=route;
  gate.position.set(route.x,0,route.z-(frame.setback??.26));
  gate.rotation.y=frame.yaw??0;
  const {stonework,edging,shadow,glow}=gateTheme(frame);
  const pointed=frame.shape==='point'||frame.shape==='root';
  for(let step=0;step<3;step++) {
    part(gate,box,stonework,0,.034+step*.041,.47-step*.23,2.52-step*.22,.064,.32);
    part(gate,box,edging,0,.069+step*.041,.608-step*.23,2.36-step*.22,.011,.025);
  }
  for(const side of [-1,1]){
    part(gate,box,stonework,side*1.01,.58,0,.33,1.18,.54);
    part(gate,box,edging,side*1.01,.21,.01,.48,.13,.72);
    part(gate,box,edging,side*1.01,1.10,.005,.40,.14,.57);
    part(gate,box,edging,side*1.01,.66,.275,.068,.72,.035);
    if(pointed)part(gate,ribs,edging,0,0,.04,side,1,1);
    if(frame.shape==='root') {
      part(gate,box,stonework,side*1.23,.43,.14,.13,.91,.28,side*.29);
      part(gate,urn,edging,side*1.43,.08,.29,.50,.72,.50,side*.15);
    }
    if(frame.shape==='forge')part(gate,box,edging,side*.78,.83,-.031,.12,1.40,.15,side*.20);
  }
  if(!pointed){
    part(gate,arch,stonework,0,1.09,0,1.05,.96,1.35);
    part(gate,archInlay,edging,0,1.09,.21,1.04,.95,1.1);
  }
  const opening=pointed?pointFace:doorFace;
  const depth=part(gate,opening,shadow,0,.14,-.185);
  depth.scale.set(1.04,.94,1);
  const door=new T.Group();
  part(door,opening,stonework,0,.15,-.092,.97,.93,1);
  part(door,box,edging,0,.91,-.075,.022,1.51,.03);
  for(const side of [-1,1]){
    part(door,diamond,edging,side*.18,.94,-.058,.063,.087,.027);
    if(frame.shape==='vault')part(door,box,edging,side*.50,.95,-.059,.045,1.58,.034);
  }
  gate.add(door);
  const threshold=part(gate,mark,glow,0,.049,.39+(frame.setback??.26)*.85,1.25,1,1.03);
  const gleam=new T.Sprite(new T.SpriteMaterial({map:halo,color:frame.light,opacity:.38,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
  gleam.position.set(0,.92,-.12);gleam.scale.set(2.24,2.60,1);
  gleam.visible=false;threshold.visible=false;gate.add(gleam);
  return {gate,door,threshold,gleam};
}

function makeMoonlessLantern(parent) {
  const lantern=new T.Group();
  const silver=new T.MeshStandardMaterial({color:0x9fbbdb,roughness:.34,metalness:.55,emissive:0x334864,emissiveIntensity:.48});
  const crescent=new T.Shape();
  crescent.moveTo(.025,.113);
  crescent.bezierCurveTo(-.165,.142,-.171,-.121,.026,-.112);
  crescent.bezierCurveTo(-.065,-.068,-.069,.062,.025,.113);
  part(lantern,new T.ExtrudeGeometry(crescent,{depth:.027,bevelEnabled:false,curveSegments:8}),silver,-.01,.123,.084);
  for (const side of [-1,1]) {
    part(lantern,box,silver,side*.091,-.023,.02,.027,.207,.072,side*.26);
  }
  part(lantern,diamond,silver,0,-.148,.015,.092,.068,.088);
  const flame=part(lantern,diamond,ember.clone(),0,-.018,.076,.086,.133,.073);
  parent.add(lantern);
  return {lantern,flame};
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
    this.standardLamp=new T.Group();this.lamp.add(this.standardLamp);
    part(this.standardLamp,box,bark,0,0,0,.19,.25,.20);
    this.flame=part(this.standardLamp,diamond,ember.clone(),0,.026,.10,.087,.125,.055);
    part(this.standardLamp,box,bevel,0,-.13,0,.25,.044,.23);
    part(this.standardLamp,box,bevel,0,.132,0,.23,.047,.22);
    this.moonless=makeMoonlessLantern(this.lamp);
    this.moonless.flame.material.color.setHex(lanternPalette.moonless.flame);
    this.moonless.lantern.visible=false;
    const glow=new T.Sprite(new T.SpriteMaterial({map:view.halo,color:0xffa253,transparent:true,opacity:.72,depthWrite:false,blending:T.AdditiveBlending}));
    glow.scale.set(.95,.95,1);glow.position.y=.01;this.lamp.add(glow);
    this.light=new T.PointLight(0xffa65f,0,10,1.8);
    this.glow=glow;
    view.scene.add(this.floor,this.root,this.lamp,this.light);
  }

  set(route) {
    this.gleam?.material.dispose();
    this.gleam=null;
    this.root.clear();
    this.route=route;
    this.broken=new Map();
    if(!route)return;
    const {barricade,brace}=gateTheme(route.frame);
    for(const object of route.barricades){
      const model=new T.Group();
      model.position.set(object.x,0,object.z);
      model.rotation.y=object.yaw??0;
      if(object.style==='fence'){
        for(let i=0;i<3;i++) {
          part(model,box,barricade,(i-1)*.45,.39+(i%2)*.06,0,.37,.74,.14,(i-1)*.12);
          part(model,box,brace,(i-1)*.45,.70+(i%2)*.06,.005,.38,.055,.152,(i-1)*.12);
        }
        part(model,box,brace,0,.38,.078,1.36,.12,.11,.29);
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
    const {gate,door,threshold,gleam}=makeGate(route,this.view.halo);
    Object.assign(this,{gate,door,threshold,gleam});
    this.root.add(gate);
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
      const palette=lanternPalette[this.skin]??lanternPalette.original;
      this.standardLamp.visible=this.skin!=='moonless';
      this.moonless.lantern.visible=this.skin==='moonless';
      this.flame.material.color.setHex(palette.flame);
      this.light.color.setHex(palette.light);
      this.glow.material.color.setHex(palette.glow);
      this.mask.style.setProperty('--lamp-wash',palette.wash);
    }
    const fall=hero.reaction?.kind==='fall';
    const beam=lanternRadius(stage)*(fall?.83:1);
    const sx=this.view.height/(this.view.camera.top-this.view.camera.bottom);
    const screen=this.view.project(hero.x,.32,hero.z);
    const flicker=Math.sin(time*10.7)*.010+Math.sin(time*16.4)*.007;
    const extinguished=hero.lanternOut>0;
    this.mask.hidden=false;
    this.mask.classList.toggle('extinguished',extinguished);
    const style=this.mask.style;
    style.setProperty('--light-x',Math.round(screen.x)+'px');style.setProperty('--light-y',Math.round(screen.y)+'px');
    style.setProperty('--light-w',Math.round(beam*sx*(1+flicker))+'px');
    style.setProperty('--light-h',Math.round(beam*sx*.72*(1+flicker))+'px');
    this.lamp.visible=!extinguished;
    this.lamp.position.set(hero.x-(hero.face??1)*.40,.69+Math.sin(time*7)*.054,hero.z+.22);
    this.lamp.rotation.z=Math.sin(time*7)*.13;
    this.light.position.set(hero.x,1.22,hero.z);
    this.light.distance=beam*1.25;
    this.light.intensity=extinguished?0:24+flicker*70;
    this.glow.material.opacity=.72+flicker*5;
    if(this.route){
      const open=this.route.ready&&this.route.barricades.every(item=>!item.gate||item.hp<=0);
      this.door.visible=!open;
      this.threshold.visible=open&&this.route.found;
      this.gleam.visible=this.threshold.visible;
      if(this.threshold.visible){
        this.threshold.rotation.y=time*.25;
        this.gleam.material.opacity=.26+Math.sin(time*3.2)*.08;
      }
      for(const [object,model] of this.broken){
        model.rotation.z=(1-object.hp/object.maxHp)*.16*Math.sin(time*15+object.x);
      }
    }
  }
}
