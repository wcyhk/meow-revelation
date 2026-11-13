import * as T from '../three.min.mjs';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';
import {roomSurface} from './room-surfaces.mjs?v=penumbra-1';

const box=new T.BoxGeometry(1,1,1);
const pole=new T.CylinderGeometry(.89,1,1,9);
const wedge=new T.OctahedronGeometry(1);
const voidFace=new T.PlaneGeometry(2.39,3.50);
const rings=new T.TorusGeometry(.70,.022,4,42);
const hallway=new T.CylinderGeometry(1,1,1,11);
const brokenStone=new T.DodecahedronGeometry(1);
const crystal=new T.IcosahedronGeometry(1,0);

function arch(radius,height,rise,depth) {
  const shape=new T.Shape();
  shape.moveTo(-radius,0);
  shape.lineTo(-radius,height);
  shape.bezierCurveTo(-radius,height+rise*.7,-radius*.46,height+rise*.87,0,height+rise);
  shape.bezierCurveTo(radius*.46,height+rise*.87,radius,height+rise*.7,radius,height);
  shape.lineTo(radius,0);shape.closePath();
  const opening=new T.Path();
  opening.moveTo(-radius+.255,.038);
  opening.lineTo(-radius+.255,height);
  opening.bezierCurveTo(-radius+.255,height+rise*.55,-radius*.42,height+rise*.68,0,height+rise-.29);
  opening.bezierCurveTo(radius*.42,height+rise*.68,radius-.255,height+rise*.55,radius-.255,height);
  opening.lineTo(radius-.255,.038);opening.closePath();
  shape.holes.push(opening);
  return new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.033,bevelSize:.037,bevelSegments:2,curveSegments:7});
}

const lintel=arch(1.48,1.89,1.15,.32);
const border=arch(1.19,1.81,1.03,.19);

function mesh(root,shape,material,x,y,z,sx=1,sy=sx,sz=sx){
  const item=new T.Mesh(shape,material);
  item.position.set(x,y,z);item.scale.set(sx,sy,sz);root.add(item);
  return item;
}

function batchMasonry(root){
  const batches=new Map();
  for(const part of root.children){
    if(!part.isMesh)continue;
    if(!batches.has(part.geometry))batches.set(part.geometry,new Map());
    const byFinish=batches.get(part.geometry);
    if(!byFinish.has(part.material))byFinish.set(part.material,[]);
    byFinish.get(part.material).push(part);
  }
  for(const [geometry,byFinish] of batches)for(const [material,parts] of byFinish){
    if(parts.length===1){
      parts[0].receiveShadow=true;
      parts[0].castShadow=true;
      continue;
    }
    const masonry=new T.InstancedMesh(geometry,material,parts.length);
    parts.forEach((part,index)=>{
      part.updateMatrix();
      masonry.setMatrixAt(index,part.matrix);
      part.removeFromParent();
    });
    masonry.castShadow=masonry.receiveShadow=true;
    root.add(masonry);
  }
}

export class RoomExit{
  constructor(view){
    this.root=new T.Group();
    this.root.visible=false;
    view.scene.add(this.root);
    this.view=view;
    this.open=0;
  }

  set(route,picture) {
    const mats=new Set();
    this.root.traverse(node=>{
      if(node.material)mats.add(node.material);
      if(node.isInstancedMesh)node.dispose();
    });
    for(const mat of mats)mat.dispose();
    this.root.clear();this.root.visible=!!route;
    if(!route)return;
    const {frame}=route;
    this.open=0;
    this.root.position.set(route.x,0,route.z);
    this.root.rotation.y=frame.yaw??0;
    const env=forgeEnvironment();
    const wild=['grove.jpg','grave.jpg','dunes.jpg','fungus.jpg'].includes(picture);
    const crystalline=['lotus.jpg','frost.jpg','fungus.jpg','fen.jpg'].includes(picture);
    const dark=new T.MeshStandardMaterial({color:new T.Color(frame.stone).multiplyScalar(1.28),roughness:.72,metalness:.14,
      ...roomSurface(wild?'rock':'limestone',1,.66)});
    const trim=new T.MeshStandardMaterial({color:frame.trim,roughness:.58,metalness:.37,
      envMap:env,envMapIntensity:.68,...scannedSurface('hammered',.36)});
    const iron=new T.MeshStandardMaterial({color:0x28272d,roughness:.67,metalness:.53,
      envMap:env,envMapIntensity:.44,...scannedSurface('hammered',.28)});
    const brass=new T.MeshStandardMaterial({color:0x927957,roughness:.53,metalness:.66,
      envMap:env,envMapIntensity:.72,...scannedSurface('hammered',.30)});
    mesh(this.root,lintel,dark,0,.08,-.28);
    mesh(this.root,border,trim,0,.11,.02);
    for(let i=0;i<3;i++){
      mesh(this.root,box,dark,0,.044+i*.038,-.07+i*.22,3.45-i*.22,.086,2.48-i*.37);
      mesh(this.root,box,trim,0,.085+i*.038,1.18+i*.020,3.12-i*.20,.021,.076);
    }
    this.shutters=[];
    for(const side of [-1,1]){
      const x=side*1.40;
      mesh(this.root,box,dark,x,.18,-.21,.76,.25,.88);
      mesh(this.root,hallway,trim,x,.43,-.27,.39,.17,.39);
      mesh(this.root,pole,dark,x,1.22,-.29,.28,1.70,.29);
      mesh(this.root,hallway,trim,x,2.08,-.31,.34,.14,.34);
      for(let i=0;i<3;i++){
        mesh(this.root,box,trim,x+side*.09,.75+i*.42,.023,.39,.105,.16);
        mesh(this.root,wedge,brass,x+side*.07,.88+i*.42,.15,.077,.12,.045);
      }
      for(let i=0;i<6;i++){
        const y=.17+i*.365;
        if(wild){
          const rubble=mesh(this.root,brokenStone,i%3===0?trim:dark,x+side*(.27+Math.cos(i*.7)*.14),y,-.45+i%2*.21,.44,.32,.43);
          rubble.rotation.set(i*.7,i*2.4,i*.31);
        }else if(i%2===0){
          mesh(this.root,box,dark,x+side*.26,y,-.43,.57,.30,.56).rotation.y=side*.105;
          mesh(this.root,box,brass,x+side*.48,y+.065,-.11,.051,.10,.032);
        }
      }
      if(crystalline)for(let i=0;i<3;i++){
        const facet=mesh(this.root,crystal,trim,x+side*(.47+i*.18),.45+i*.22,.04-i*.27,.15,.58-i*.12,.21);
        facet.rotation.set(.12,i*1.9,side*(.28-i*.07));
      }
      const hinge=new T.Group();
      hinge.position.set(side*1.01,.09,.071);
      mesh(hinge,box,iron,-side*.49,1.02,0,1.01,2.01,.136);
      for(let i=0;i<4;i++)mesh(hinge,box,trim,-side*(.20+i*.17),1.073,.082,.042,1.99,.057);
      for(const y of [.35,1.09,1.72]){
        mesh(hinge,box,brass,-side*.49,y,.11,1,.062,.048);
        mesh(hinge,wedge,brass,-side*.879,y+.09,.16,.039,.08,.021);
      }
      batchMasonry(hinge);
      for(const part of hinge.children)part.castShadow=false;
      this.root.add(hinge);
      this.shutters.push({hinge,side});
    }
    batchMasonry(this.root);
    const material=new T.ShaderMaterial({
      transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,
      uniforms:{time:{value:0},light:{value:new T.Color(frame.light)},open:{value:0}},
      vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec2 u;uniform float time,open;uniform vec3 light;
        void main(){
          vec2 p=u*2.-1.;
          float arch=smoothstep(1.,.89,max(abs(p.x),max(-p.y,length(vec2(p.x,max(0.,p.y)*1.34)))));
          float depth=length(vec2(p.x,p.y*.84));
          float curl=sin(atan(p.y,p.x)*6.+depth*21.-time*1.53)*sin(depth*19.+time*2.1);
          float corona=exp(-pow((depth-.64-curl*.032)*8.,2.))*.32;
          float lightness=arch*open*(corona+exp(-depth*2.4)*.58);
          gl_FragColor=vec4(mix(vec3(.035,.025,.063),light,lightness),arch*(.89+curl*.046));
          #include <colorspace_fragment>
        }`,
    });
    this.membrane=mesh(this.root,voidFace,material,0,1.63,-.29);
    this.membrane.renderOrder=10;
    this.halo=mesh(this.root,rings,new T.MeshBasicMaterial({color:frame.light,transparent:true,opacity:0,
      depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}),0,1.35,-.16);
    this.halo.rotation.y=.19;
    this.emission=mesh(this.root,wedge,new T.MeshStandardMaterial({
      color:frame.light,emissive:frame.light,emissiveIntensity:.42,roughness:.53,
    }),0,2.96,.27,.19,.31,.13);
    this.view.cutaway.cover(this.root);
  }

  tick(open,time,dt){
    this.open+=(Number(open)-this.open)*(1-Math.exp(-dt*7.3));
    for(const {hinge,side} of this.shutters)hinge.rotation.y=side*this.open*1.33;
    this.membrane.material.uniforms.open.value=this.open;
    this.membrane.material.uniforms.time.value=time%720;
    this.halo.rotation.z=time*.57;
    this.halo.material.opacity=this.open*(.34+Math.sin(time*2.8)*.081);
    this.emission.material.emissiveIntensity=.38+this.open*.53+Math.sin(time*3.2)*.072;
  }
}
