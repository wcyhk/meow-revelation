import * as T from '../three.min.mjs';
import {lanternRadius} from './lantern-route.mjs?v=world-3d-1';
import {RoomExit} from './room-exit.mjs?v=chiaroscuro-1';

const stone=new T.MeshStandardMaterial({color:0x51414b,roughness:.88,metalness:.16});
const bevel=new T.MeshStandardMaterial({color:0xa88269,roughness:.69,metalness:.26});
const bark=new T.MeshStandardMaterial({color:0x594030,roughness:.92});
const plank=new T.MeshStandardMaterial({color:0x7d513d,roughness:.88});
const ember=new T.MeshBasicMaterial({color:0xffc67b,toneMapped:false});
const box=new T.BoxGeometry(1,1,1);
const diamond=new T.OctahedronGeometry(1);
const urn=new T.LatheGeometry([[.20,0],[.36,.14],[.37,.40],[.23,.56],[.22,.68],[.31,.71]].map(([x,y])=>new T.Vector2(x,y)),9);
const washPlane=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
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
  const barricade=bark.clone();
  barricade.color.setHex(frame.stone).lerp(new T.Color(0x4b342b),.43);
  const brace=plank.clone();
  brace.color.setHex(frame.trim).lerp(new T.Color(0x73553f),.37);
  const theme={barricade,brace};
  gateThemes.set(frame,theme);
  return theme;
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
    this.root=new T.Group();
    this.exit=new RoomExit(view);
    this.threshold=new T.Mesh(washPlane,new T.MeshBasicMaterial({map:view.halo,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));
    this.threshold.renderOrder=-5;
    this.threshold.visible=false;
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
    view.scene.add(this.root,this.lamp,this.light,this.threshold);
  }

  set(route) {
    this.root.clear();
    this.route=route;
    this.broken=new Map();
    this.threshold.visible=false;
    this.exit.set(route,this.view.stage?.picture);
    if(!route)return;
    this.threshold.position.set(route.x,.035,route.z-.22);
    this.threshold.scale.set(4.7,1,3.1);
    this.threshold.material.color.setHex(route.frame.light);
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
    this.view.cutaway.cover(this.root);
  }

  smash(object) {
    const model=this.broken.get(object);
    if(model)this.root.remove(model);
    this.broken.delete(object);
  }

  tick(hero,time,stage,dt) {
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
      this.threshold.visible=open&&this.route.found;
      this.exit.tick(open,time,dt);
      if(this.threshold.visible)this.threshold.material.opacity=.29+Math.sin(time*2.3)*.045;
      for(const [object,model] of this.broken){
        model.rotation.z=(1-object.hp/object.maxHp)*.16*Math.sin(time*15+object.x);
      }
    }
  }
}
