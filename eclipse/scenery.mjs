import * as T from '../three.min.mjs';
import {armLighting, arms, disposeForge, forge} from './armory.mjs';

const PI = Math.PI;
const color = new T.Color();
const unit = new T.Vector3(0, 0, 0);
const plane = new T.PlaneGeometry(1, 1);
const sceneAngle = new T.Vector3(0, 16, 19.6).normalize();
const ART_SIZE = 29;
const atlasBoxes = [
  [60, 55, 329, 371], [431, 77, 782, 343], [865, 84, 1210, 383],
  [37, 451, 387, 767], [456, 426, 770, 770], [855, 408, 1235, 780],
  [18, 782, 389, 1224], [395, 819, 863, 1206], [865, 810, 1214, 1198],
];

function texture(canvas) {
  const result = new T.CanvasTexture(canvas);
  result.colorSpace = T.SRGBColorSpace;
  result.anisotropy = 2;
  return result;
}

function radialTexture(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
  for (const [at, tone] of stops) gradient.addColorStop(at, tone);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return texture(canvas);
}

async function loadCast() {
  const image = new Image();
  image.src = './cast.png';
  const hero = new Image();
  hero.src = './unarmed.png';
  await Promise.all([image.decode(),hero.decode()]);
  return atlasBoxes.map(([left, top, right, bottom],index) => {
    const source = index < 3 ? hero : image;
    const canvas = document.createElement('canvas');
    const scale = source.width / 1254;
    canvas.width = Math.round((right - left) * 0.76);
    canvas.height = Math.round((bottom - top) * 0.76);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, left * scale, top * scale, (right - left) * scale, (bottom - top) * scale, 0, 0, canvas.width, canvas.height);
    return texture(canvas);
  });
}

function circle(radius, width, fraction = Math.PI * 2) {
  const geometry = new T.RingGeometry(radius - width, radius, 54, 1, 0, fraction);
  geometry.rotateX(-PI / 2);
  return geometry;
}

function swingGeometry() {
  const vertices = [], indices = [];
  const slices = 34;
  for (let index = 0; index <= slices; index++) {
    const f = index / slices;
    const theta = -1.11 + f * 2.22;
    const width = Math.pow(Math.sin(f * PI), 1.15) * .43 + .025;
    const outer = 1.22 + f * .07;
    for (const radius of [outer - width, outer]) {
      vertices.push(Math.cos(theta) * radius, Math.sin(theta) * .29, Math.sin(theta) * radius);
    }
    if (index < slices) {
      const a = index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  return geometry;
}

const pictureSettings = [
  {src:'grove.jpg', hue:0xffb377, glows:[[.278,.283],[.397,.267],[.659,.267],[.849,.323],[.113,.399]]},
  {src:'fen.jpg', hue:0x9fe6d4, glows:[[.21,.315],[.36,.333],[.64,.333],[.80,.315]]},
  {src:'throne.jpg', hue:0xff7342, glows:[[.273,.305],[.386,.305],[.620,.305],[.724,.305]]},
];

export class Scenery {
  constructor(canvas) {
    this.canvas = canvas;
    this.mobile = matchMedia('(pointer:coarse)').matches;
    this.renderer = new T.WebGLRenderer({canvas, antialias:!this.mobile, alpha:false, powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.35 : 1.65));
    this.renderer.setClearColor(0x151912);
    this.scene = new T.Scene();
    armLighting(this.scene);
    this.camera = new T.OrthographicCamera(-10, 10, 8, -8, .1, 100);
    this.camera.position.copy(sceneAngle).multiplyScalar(28);
    this.camera.lookAt(unit);
    this.focus = new T.Vector3(0, 0, 1);
    this.cameraUp = new T.Vector3(0, sceneAngle.z, -sceneAngle.y);
    this.halo = radialTexture([[0,'#ffffe7ff'],[.19,'#fff4ceb0'],[.44,'#ffd89e47'],[1,'#ffe1bd00']]);
    this.smoke = radialTexture([[0,'#fffffff0'],[.3,'#ffffff80'],[.65,'#ffffff24'],[1,'#ffffff00']]);
    this.shadow = radialTexture([[0,'#12120ce8'],[.47,'#12110ca2'],[.72,'#15120b4b'],[1,'#00000000']]);
    this.back = new T.Mesh(plane, new T.MeshBasicMaterial({color:0xffffff,depthWrite:false}));
    this.back.quaternion.copy(this.camera.quaternion);
    this.back.position.copy(sceneAngle).multiplyScalar(-16);
    this.back.scale.set(ART_SIZE, ART_SIZE, 1);
    this.back.renderOrder = -50;
    this.scene.add(this.back);
    this.candles = Array.from({length:6}, (_, index) => this.makeAirGlow(index));
    this.mist = Array.from({length:5}, (_, index) => this.makeMist(index));
    this.arc = swingGeometry();
    this.lance = new T.BufferGeometry();
    this.lance.setAttribute('position',new T.Float32BufferAttribute([0,0,0,.42,.06,-.11,1.0,0,0,.42,.06,.11],3));
    this.lance.setIndex([0,1,2,0,2,3]);
    this.ring = circle(1, .038);
    this.disc = new T.CircleGeometry(1, 48).rotateX(-PI / 2);
    this.motes = this.createParticleSystem(this.mobile ? 150 : 270);
    this.leaves = this.createLeaves(this.mobile ? 15 : 28);
    this.effects = [];
    this.portal = this.makePortal();
    this.clue = this.makeClue();
    this.ward = this.makeWard();
    this.shake = 0;
    this.time = 0;
    this.lastStamp = 0;
    this.resize();
  }

  async load() {
    const loader = new T.TextureLoader();
    const [atlas, images] = await Promise.all([loadCast(), Promise.all(pictureSettings.map(({src}) => loader.loadAsync(src)))]);
    this.atlas = atlas;
    for (const image of images) {
      image.colorSpace = T.SRGBColorSpace;
      image.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
      this.renderer.initTexture(image);
    }
    this.pictures = images;
    for (const image of this.atlas) this.renderer.initTexture(image);
    this.armIcons = this.previewArms();
    this.setStage(0);
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    if (!this.width || !this.height) return;
    const aspect = this.width / this.height;
    const view = aspect < .8 ? Math.min(25, 12.5 / aspect) : Math.min(17.7, 28.9 / aspect);
    this.camera.top = view / 2;
    this.camera.bottom = -view / 2;
    this.camera.left = -view * aspect / 2;
    this.camera.right = view * aspect / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  setStage(index) {
    this.stage = index;
    this.back.material.map = this.pictures[index];
    this.back.material.needsUpdate = true;
    const {hue, glows} = pictureSettings[index];
    this.accent = hue;
    for (const [i, lamp] of this.candles.entries()) {
      lamp.visible = i < glows.length;
      if (!lamp.visible) continue;
      const [x, y] = glows[i];
      lamp.position.copy(sceneAngle).multiplyScalar(-15.6)
        .addScaledVector(this.cameraUp, (.5 - y) * ART_SIZE);
      lamp.position.x = (x - .5) * ART_SIZE;
      lamp.material.color.setHex(hue);
    }
    for (const cloud of this.mist) cloud.material.color.setHex(index === 1 ? 0x80b4a9 : 0xeac098);
    this.leaves.mesh.material.color.setHex(index === 1 ? 0x82aaa0 : index === 2 ? 0xd36a3f : 0xbd7250);
    this.portal.visible = false;
    this.clue.visible = false;
    this.ward.visible = false;
    for (const fx of this.effects) this.release(fx);
    this.effects.length = 0;
    for (const mote of this.motes.items) mote.life = 0;
  }

  makeAirGlow(index) {
    const material = new T.SpriteMaterial({map:this.halo,color:0xffc999,transparent:true,opacity:.38,depthWrite:false,blending:T.AdditiveBlending});
    const glow = new T.Sprite(material);
    glow.scale.set(1.8, 1.8, 1);
    glow.renderOrder = -38 + index;
    this.scene.add(glow);
    return glow;
  }

  makeMist(index) {
    const material = new T.SpriteMaterial({map:this.smoke,transparent:true,opacity:.06,depthWrite:false,blending:T.AdditiveBlending});
    const cloud = new T.Sprite(material);
    cloud.position.set((index - 2) * 4.5, .4, -8 - index * .4);
    cloud.scale.set(10, 2.9, 1);
    cloud.renderOrder = -15;
    this.scene.add(cloud);
    return cloud;
  }

  ground(map, tint, opacity, sizeX, sizeZ) {
    const mat = new T.MeshBasicMaterial({map,color:tint,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
    const mesh = new T.Mesh(plane, mat);
    mesh.rotation.x = -PI / 2;
    mesh.scale.set(sizeX, sizeZ, 1);
    mesh.renderOrder = -8;
    return mesh;
  }

  createActor(frame, height) {
    const spriteMaterial = new T.ShaderMaterial({
      uniforms:{picture:{value:this.atlas[frame]},flash:{value:0},fade:{value:1},warm:{value:0}},
      vertexShader:`
        varying vec2 artUV;
        void main() { artUV=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
      `,
      fragmentShader:`
        uniform sampler2D picture;
        uniform float flash;
        uniform float fade;
        uniform float warm;
        varying vec2 artUV;
        void main() {
          vec4 art=texture2D(picture,artUV);
          if(art.a < .09) discard;
          vec3 paint=art.rgb*1.22 + vec3(.014,.010,.009);
          paint=mix(paint,vec3(1.,.35,.10),warm*.24);
          paint=mix(paint,vec3(1.,.78,.53),flash);
          gl_FragColor=vec4(paint,art.a*fade);
          #include <colorspace_fragment>
        }
      `,
      transparent:true,depthWrite:false,side:T.DoubleSide,
    });
    const art = new T.Mesh(plane, spriteMaterial);
    const shade = this.ground(this.shadow, 0xffffff, .82, height * 1.1, height * .66);
    const rim = this.ground(this.halo, 0xff8d52, .19, height * 1.6, height * 1.06);
    rim.material.blending = T.AdditiveBlending;
    this.scene.add(art, shade, rim);
    return {art, shade, rim, height};
  }

  previewArms() {
    const size = 152;
    const scene = new T.Scene();
    armLighting(scene);
    const target = new T.WebGLRenderTarget(size,size,{colorSpace:T.SRGBColorSpace});
    const camera = new T.OrthographicCamera(-1.10,1.10,1.10,-1.10,.1,20);
    camera.position.set(.54,.31,5.2);
    camera.lookAt(0,0,0);
    const pixels = new Uint8Array(size*size*4);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const frame = ctx.createImageData(size,size);
    const result = new Map();
    this.renderer.setClearColor(0x151912,0);
    this.renderer.setRenderTarget(target);
    for (const arm of arms) {
      const item = forge(arm);
      item.rotation.set(-.12,.32,-.38);
      item.scale.setScalar(arm.id==='tiger'||arm.id==='dragon'?1.42:1);
      scene.add(item);
      this.renderer.render(scene,camera);
      this.renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
      for (let y=0;y<size;y++) frame.data.set(pixels.subarray(y*size*4,(y+1)*size*4),(size-y-1)*size*4);
      ctx.putImageData(frame,0,0);
      result.set(arm.id,canvas.toDataURL());
      scene.remove(item);
      disposeForge(item);
    }
    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(0x151912,1);
    target.dispose();
    return result;
  }

  equip(actor, weapon) {
    const model = forge(weapon);
    const glow = new T.Sprite(new T.SpriteMaterial({map:this.halo,color:weapon.tone,opacity:.32,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
    glow.scale.set(1.55,1.55,1);
    model.add(glow);
    this.scene.add(model);
    actor.weapon = {model,glow,id:weapon.id};
  }

  actor(visual, unit, spec) {
    const {art, shade, rim, height} = visual;
    const atlas = this.atlas[spec.frame];
    const aspect = atlas.image.width / atlas.image.height;
    const figureHeight = height * (spec.poseSize ?? 1);
    const breath = spec.bob || 0;
    const direction = spec.face || 1;
    art.material.uniforms.picture.value = atlas;
    art.material.uniforms.flash.value = spec.flash || 0;
    art.material.uniforms.fade.value = spec.fade ?? 1;
    art.material.uniforms.warm.value = spec.warm || 0;
    art.position.set(unit.x, .02, unit.z);
    const roll = spec.roll || 0;
    const displayedHeight = figureHeight * (spec.squash || 1);
    art.position.addScaledVector(this.cameraUp, displayedHeight * .45 + breath);
    art.quaternion.copy(this.camera.quaternion);
    art.rotateZ((spec.tilt || 0) + roll);
    art.scale.set(displayedHeight * aspect * direction * (spec.stretch || 1), displayedHeight, 1);
    art.renderOrder = 50 + unit.z;
    shade.position.set(unit.x, .022, unit.z + .03);
    shade.material.opacity = .73 * (spec.fade ?? 1);
    rim.position.set(unit.x, .027, unit.z);
    rim.material.color.setHex(spec.rim || 0xc48747);
    rim.material.opacity = (spec.aura ?? .12) * (spec.fade ?? 1);
    if (visual.weapon) {
      const {model,glow,id} = visual.weapon;
      const pose = spec.frame;
      const reach = pose===2 ? .38 : pose===1 ? .36 : .23;
      const lift = pose===2 ? .29 : pose===1 ? -.15 : -.185;
      const theta=(spec.tilt || 0)+roll;
      const x=direction*reach*displayedHeight*Math.min(1.21,aspect), y=lift*displayedHeight;
      model.position.copy(art.position)
        .addScaledVector(this.cameraUp,x*Math.sin(theta)+y*Math.cos(theta))
        .addScaledVector(sceneAngle,.24);
      model.position.x += x*Math.cos(theta)-y*Math.sin(theta);
      model.rotation.set(-.30, direction*(.38+Math.sin(this.time*3.2)*.15), direction*(pose===2?-.7:pose===1?-1.23:-.39)+roll*.5);
      if (id==='dragon') {
        model.rotation.y=this.time*2.1;
        model.position.y+=.085*Math.sin(this.time*5);
      }
      model.scale.setScalar((id==='tiger'||id==='dragon'?.83:.95)*(roll?.77:1));
      model.renderOrder=art.renderOrder+1;
      glow.renderOrder=art.renderOrder+2;
    }
  }

  removeActor({art, shade, rim}) {
    this.scene.remove(art, shade, rim);
    art.material.dispose();
    shade.material.dispose();
    rim.material.dispose();
  }

  removeEquippedActor(actor) {
    if (actor.weapon) {
      this.scene.remove(actor.weapon.model);
      disposeForge(actor.weapon.model);
      actor.weapon.glow.material.dispose();
    }
    this.removeActor(actor);
  }

  makePortal() {
    const portal = new T.Group();
    const gold = new T.MeshBasicMaterial({color:0xffcf8c,transparent:true,opacity:.86,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
    const lower = new T.Mesh(circle(1.34,.034), gold);
    lower.position.y = .04;
    const inner = new T.Mesh(circle(1.06,.022), gold.clone());
    inner.position.y = .05;
    const key = new T.Mesh(new T.OctahedronGeometry(.26), new T.MeshBasicMaterial({color:0xffd298}));
    const light = new T.Sprite(new T.SpriteMaterial({map:this.halo,color:0xffa64b,depthWrite:false,blending:T.AdditiveBlending,transparent:true,opacity:.72}));
    light.scale.set(2.5, 2.5, 1);
    portal.add(lower,inner,key,light);
    for (let i = 0; i < 8; i++) {
      const rune = new T.Mesh(new T.BoxGeometry(.065,.05,.15), gold);
      rune.position.set(Math.sin(i * PI / 4) * 1.2,.06,Math.cos(i * PI / 4) * 1.2);
      rune.rotation.y = i * PI / 4 + PI / 4;
      portal.add(rune);
    }
    portal.position.set(0, 0, -6.75);
    portal.visible = false;
    portal.userData = {key, light};
    this.scene.add(portal);
    return portal;
  }

  makeClue() {
    const root = new T.Group();
    const brass = new T.MeshStandardMaterial({color:0xa57345,metalness:.45,roughness:.43});
    const wax = new T.MeshBasicMaterial({color:0xffd188});
    const base = new T.Mesh(new T.CylinderGeometry(.30,.41,.11,8),brass);
    const frame = new T.Mesh(new T.CylinderGeometry(.22,.33,.53,6,1,true),new T.MeshBasicMaterial({color:0xcb7c40,wireframe:true,transparent:true,opacity:.85}));
    const cap = new T.Mesh(new T.ConeGeometry(.34,.19,6),brass);
    const flame = new T.Mesh(new T.OctahedronGeometry(.18),wax);
    frame.position.y=.31;
    cap.position.y=.64;
    flame.position.y=.35;
    flame.scale.set(.78,1.37,.78);
    const halo = new T.Sprite(new T.SpriteMaterial({map:this.halo,color:0xffad64,opacity:.77,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
    halo.position.y=.37;
    halo.scale.set(2.08,2.08,1);
    const marker = new T.Mesh(circle(.85,.026),new T.MeshBasicMaterial({color:0xffca85,transparent:true,opacity:.83,blending:T.AdditiveBlending,depthWrite:false}));
    marker.position.y=.026;
    root.add(base,frame,cap,flame,marker,halo);
    root.userData={flame,halo,marker};
    root.visible=false;
    this.scene.add(root);
    return root;
  }

  placeClue(point) {
    this.clue.visible=!!point;
    if (point) this.clue.position.set(point.x,0,point.z);
  }

  makeWard() {
    const group = new T.Group();
    const shell = new T.Mesh(new T.IcosahedronGeometry(1.55,1),
      new T.MeshBasicMaterial({color:0x9cf3d9,wireframe:true,transparent:true,opacity:.25,depthWrite:false,blending:T.AdditiveBlending}));
    shell.position.y=.83;
    const seal = new T.Mesh(circle(1.53,.039),
      new T.MeshBasicMaterial({color:0x9cf3d9,transparent:true,opacity:.82,depthWrite:false,blending:T.AdditiveBlending}));
    seal.position.y=.032;
    group.add(shell,seal);
    this.scene.add(group);
    group.visible=false;
    group.userData.shell=shell;
    return group;
  }

  setWard(hero) {
    this.ward.visible=hero.ward>0;
    if (!this.ward.visible) return;
    this.ward.position.set(hero.x,0,hero.z);
    this.ward.userData.shell.rotation.y=this.time*.48;
    this.ward.userData.shell.material.opacity=.12+Math.min(.24,hero.ward*.1);
  }

  createParticleSystem(capacity) {
    const positions = new Float32Array(capacity * 3);
    const colors = new Float32Array(capacity * 3);
    const radius = new Float32Array(capacity);
    const alpha = new Float32Array(capacity);
    const geometry = new T.BufferGeometry();
    for (const [key, data, size] of [['position',positions,3],['tint',colors,3],['radius',radius,1],['alpha',alpha,1]]) {
      geometry.setAttribute(key,new T.BufferAttribute(data,size).setUsage(T.DynamicDrawUsage));
    }
    const material = new T.ShaderMaterial({
      transparent:true, depthWrite:false, blending:T.AdditiveBlending,
      vertexShader:`
        attribute vec3 tint; attribute float radius; attribute float alpha;
        varying vec4 ink;
        void main(){ink=vec4(tint,alpha);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=radius;}
      `,
      fragmentShader:`
        varying vec4 ink;
        void main(){vec2 p=gl_PointCoord-.5;float fall=1.-smoothstep(.045,.50,length(p));
        if (ink.a<.01) discard;gl_FragColor=vec4(ink.rgb,fall*fall*ink.a);}
      `,
    });
    const particles = new T.Points(geometry, material);
    particles.frustumCulled = false;
    particles.renderOrder = 100;
    this.scene.add(particles);
    return {geometry, positions, colors, radius, alpha, cursor:0, items:Array.from({length:capacity}, () => ({life:0}))};
  }

  createLeaves(count) {
    const leaf = new T.Shape();
    leaf.moveTo(0,-1);
    leaf.lineTo(-.32,-.44); leaf.lineTo(-.75,-.15); leaf.lineTo(-.36,-.03);
    leaf.lineTo(-.49,.49); leaf.lineTo(-.14,.28); leaf.lineTo(0,1.02);
    leaf.lineTo(.16,.31); leaf.lineTo(.47,.5); leaf.lineTo(.35,-.02);
    leaf.lineTo(.71,-.15); leaf.lineTo(.29,-.47); leaf.closePath();
    const geometry = new T.ShapeGeometry(leaf);
    const material = new T.MeshBasicMaterial({side:T.DoubleSide,transparent:true,opacity:.72,depthWrite:false});
    const mesh = new T.InstancedMesh(geometry,material,count);
    mesh.frustumCulled=false;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    mesh.renderOrder=75;
    this.scene.add(mesh);
    const items=Array.from({length:count},(_,i)=>({
      x:Math.random()*31,y:Math.random()*4,z:Math.random()*24-11,spin:Math.random()*PI*2,
      size:.036+Math.random()*.066,speed:.29+Math.random()*.4,layer:i%4===0?1.1:0,
    }));
    const tints=[0xf6c69a,0xdc926c,0xa05c53,0xd6a871,0x9c7b6b];
    for (let i=0;i<count;i++) mesh.setColorAt(i,color.setHex(tints[i%tints.length]));
    return {mesh,items,helper:new T.Object3D()};
  }

  renderLeaves(time) {
    const {mesh,items,helper}=this.leaves;
    for (const [index,leaf] of items.entries()) {
      const phase=time*leaf.speed+leaf.spin;
      helper.position.set(((leaf.x+time*(.69+leaf.speed*.26))%32)-16,
        leaf.layer+((leaf.y+time*.22)%4.3),leaf.z+Math.cos(phase)*.84);
      helper.rotation.set(Math.sin(phase)*2,phase,phase*.7);
      helper.scale.setScalar(leaf.size*(.81+leaf.layer*.5));
      helper.updateMatrix();
      mesh.setMatrixAt(index,helper.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
  }

  spark(x, y, z, tint, count, force = 1) {
    const {items} = this.motes;
    color.setHex(tint);
    for (let index=0;index<count;index++) {
      const point = items[this.motes.cursor++ % items.length];
      const theta = Math.random() * PI * 2;
      const speed = (.8 + Math.random() * 2.4) * force;
      const life = .30 + Math.random() * .53;
      Object.assign(point,{x,y,z,dx:Math.cos(theta)*speed,dz:Math.sin(theta)*speed,dy:Math.random()*2.8+.25,life,ttl:life,
        r:color.r,g:color.g,b:color.b,size:2.8+Math.random()*8,gravity:3.5});
    }
  }

  addEffect(geometry, position, tint, duration, settings = {}) {
    const {opacity=1, scale=1, growth=0, angle=0, blend=true, owned=false, map=null} = settings;
    const mat = new T.MeshBasicMaterial({color:tint,map,transparent:true,opacity,depthWrite:false,side:T.DoubleSide,
      blending:blend ? T.AdditiveBlending : T.NormalBlending});
    const mesh = new T.Mesh(geometry,mat);
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = angle;
    if (map) mesh.rotateX(-PI/2);
    mesh.scale.setScalar(scale);
    mesh.renderOrder = settings.order ?? 30;
    this.scene.add(mesh);
    const fx = {mesh,ttl:duration,age:0,scale,growth,opacity,owned};
    this.effects.push(fx);
    return fx;
  }

  slash(x, z, dx, dz, tint, radius, finisher) {
    const a = -Math.atan2(dz, dx);
    const pos = {x:x+dx*.30,y:.58,z:z+dz*.30};
    const wide = radius / 1.56;
    this.addEffect(this.arc,pos,tint,.24,{scale:wide,growth:.29,angle:a,opacity:.78,order:90});
    this.addEffect(this.arc,{...pos,y:pos.y+.11},0xffe3a3,.14,{scale:wide*.96,growth:.21,angle:a,opacity:.91,order:91});
    if (finisher) this.addEffect(this.ring,{x,y:.045,z},tint,.30,{scale:.3,growth:radius*1.25,opacity:.59});
    this.spark(x+dx*.96,.54,z+dz*.96,tint,finisher?24:12,1.12);
  }

  shock(x,z,tint,radius,power = 1) {
    this.addEffect(this.ring,{x,y:.04,z},tint,.55,{scale:.25,growth:radius,opacity:.95});
    this.addEffect(this.ring,{x,y:.15,z},0xffdca5,.36,{scale:.16,growth:radius*.76,opacity:.86});
    this.addEffect(this.disc,{x,y:.06,z},tint,.36,{scale:.30,growth:radius,opacity:.16});
    this.spark(x,.65,z,tint,Math.floor(34 * power),power);
  }

  bolt(from,to,tint,intensity=1) {
    const a = new T.Vector3(from.x,from.y,from.z), b = new T.Vector3(to.x,to.y,to.z);
    const path = [a];
    for (let index=1;index<8;index++) {
      const point=a.clone().lerp(b,index/8);
      point.x+=(Math.random()-.5)*.41;
      point.y+=(Math.random()-.5)*.28;
      point.z+=(Math.random()-.5)*.38;
      path.push(point);
    }
    path.push(b);
    const route = new T.CurvePath();
    for (let i=1;i<path.length;i++) route.add(new T.LineCurve3(path[i-1],path[i]));
    const geometry=new T.TubeGeometry(route,14,.033*intensity,4,false);
    this.addEffect(geometry,{x:0,y:0,z:0},tint,.23,{owned:true,opacity:.94,order:93});
    this.spark(to.x,to.y,to.z,tint,intensity>1?13:5,.72);
  }

  wave(x,z,dx,dz,reach,tint,strong=false) {
    const angle = -Math.atan2(dz,dx);
    const width = strong ? 2.18 : 1.40;
    const pos={x:x+dx*reach*.46,y:.66,z:z+dz*reach*.46};
    const size = strong ? 2.0 : 1.22;
    const effect = this.addEffect(this.arc,pos,tint,strong?.39:.23,{scale:size,growth:.31,angle,opacity:.76,order:94});
    effect.stretchZ=width;
    effect.travel={x:dx*(strong?9:6),z:dz*(strong?9:6)};
    this.spark(pos.x,.50,pos.z,tint,strong?19:7,strong?1.28:.77);
  }

  thrust(x,z,dx,dz,reach,tint,heavy) {
    const angle=-Math.atan2(dz,dx);
    const origin={x,y:.55,z};
    this.addEffect(this.lance,origin,tint,.23,{scale:reach,angle,growth:.13,opacity:.85,order:94});
    this.addEffect(this.lance,{...origin,y:.67},0xffeed0,.15,{scale:reach*.98,angle,opacity:.82,order:95});
    if (heavy) this.shock(x+dx*reach*.70,z+dz*reach*.70,tint,1.68,.70);
    this.spark(x+dx*reach*.78,.58,z+dz*reach*.78,tint,heavy?16:7,1.05);
  }

  vortex(x,z,radius,tint) {
    for (const [part,angle] of [[.95,0],[.82,2.1],[.66,4.2]]) {
      const arc = circle(radius*part,.045,PI*1.38);
      const fx=this.addEffect(arc,{x,y:.13+part*.11,z},tint,.62,{owned:true,angle,opacity:.92,scale:.83,growth:.24});
      fx.spin=4.2;
    }
    this.addEffect(plane,{x,y:.045,z},tint,.56,{map:this.halo,scale:radius*2,growth:.7,opacity:.38});
    this.spark(x,.46,z,tint,18,1.22);
  }

  warning(kind,x,z,radius,time,angle = 0) {
    if (kind === 'line') {
      const mesh = new T.PlaneGeometry(radius, 1.45);
      mesh.rotateX(-PI / 2);
      return this.addEffect(mesh,{x,y:.049,z},0xf84e31,time,{owned:true,angle,opacity:.39,blend:false,order:3});
    }
    this.addEffect(this.disc,{x,y:.036,z},0x9b2017,time,{scale:radius,opacity:.39,blend:false,order:2});
    return this.addEffect(this.ring,{x,y:.048,z},0xff7448,time,{scale:radius,opacity:.72,order:3});
  }

  release(fx) {
    this.scene.remove(fx.mesh);
    fx.mesh.material.dispose();
    if (fx.owned) fx.mesh.geometry.dispose();
  }

  project(x,y,z) {
    const point = new T.Vector3(x,y,z).project(this.camera);
    return {x:(point.x + 1) * .5 * this.width, y:(1 - point.y) * .5 * this.height};
  }

  render(dt, hero, paused = false) {
    if (!paused) this.time += dt;
    const time = this.time;
    if (hero) {
      const aspect = this.width / this.height;
      const follow = 1 - Math.exp(-dt * 5);
      const maxSide = Math.max(0, ART_SIZE * .5 + this.camera.left - .1);
      const targetX = T.MathUtils.clamp(hero.x * (aspect < .9 ? .78 : .38), -maxSide, maxSide);
      const targetZ = aspect < .85 ? .4 + (hero.z - 1) * .15 : -1.5 + (hero.z - 1) * .18;
      this.focus.x += (targetX - this.focus.x) * follow;
      this.focus.z += (targetZ - this.focus.z) * follow;
      this.shake *= Math.exp(-dt * 12);
      this.camera.position.copy(sceneAngle).multiplyScalar(28).add(this.focus);
      this.camera.position.x += Math.sin(time * 116) * this.shake;
      this.camera.position.y += Math.cos(time * 98) * this.shake * .38;
      this.camera.updateMatrixWorld();
    }
    for (const [index, lamp] of this.candles.entries()) {
      lamp.material.opacity = .43 + .13 * Math.sin(time * 7.4 + index * 2.7) + .07 * Math.sin(time * 21.7 + index);
    }
    for (const [index, cloud] of this.mist.entries()) {
      cloud.position.x = (index-2)*5.4 + Math.sin(time*.27+index*2.4)*2.3;
      cloud.material.opacity = .064 + Math.sin(time*.63+index)*.025;
    }
    if (this.portal.visible) {
      const {key,light} = this.portal.userData;
      key.position.y = 1.01 + .15*Math.sin(time*2.4);
      key.rotation.y = time;
      light.position.y = key.position.y;
      if (!paused && Math.random() < dt * 11) this.spark(0,.26,-6.75,0xffcb7c,2,.36);
    }
    if (this.clue.visible) {
      const {flame,halo,marker}=this.clue.userData;
      flame.position.y=.35+Math.sin(time*7.6)*.035;
      flame.rotation.y=time*.61;
      halo.material.opacity=.68+.16*Math.sin(time*6.7);
      marker.material.opacity=.69+.20*Math.sin(time*2.8);
      if (!paused && Math.random()<dt*9) this.spark(this.clue.position.x,.52,this.clue.position.z,0xffc586,2,.24);
    }
    for (let i=this.effects.length-1;i>=0;i--) {
      const fx = this.effects[i];
      if (!paused) fx.age += dt;
      const age = fx.age / fx.ttl;
      if (age >= 1) {
        this.release(fx);
        this.effects.splice(i,1);
      } else {
        fx.mesh.scale.setScalar(fx.scale + fx.growth * (1 - (1 - age) ** 2));
        if (fx.stretchZ) fx.mesh.scale.z *= fx.stretchZ;
        fx.mesh.material.opacity = fx.opacity * (fx.growth > 0 ? (1-age)**1.2 : .7+.3*Math.sin(age*PI*5));
        if (!paused && fx.spin) fx.mesh.rotation.y+=fx.spin*dt;
        if (!paused && fx.travel) {
          fx.mesh.position.x+=fx.travel.x*dt;
          fx.mesh.position.z+=fx.travel.z*dt;
        }
      }
    }
    this.renderParticles(paused ? 0 : dt);
    this.renderLeaves(time);
    this.renderer.render(this.scene,this.camera);
  }

  renderParticles(dt) {
    const {items,geometry,positions,colors,radius,alpha} = this.motes;
    if (Math.random() < dt * 15) {
      const x = (Math.random() - .5) * 28;
      const z = (Math.random() - .5) * 24;
      const point = items[this.motes.cursor++ % items.length];
      color.setHex(this.accent);
      Object.assign(point,{x,y:Math.random()*2+.2,z,dx:-.45,dz:.14,dy:.3+Math.random()*.23,life:4,ttl:4,
        r:color.r,g:color.g,b:color.b,size:2.5+Math.random()*5,gravity:0});
    }
    for (let i=0;i<items.length;i++) {
      const p = items[i];
      if (p.life <= 0) {
        alpha[i] = 0;
        radius[i] = 0;
        continue;
      }
      p.life -= dt;
      p.x += p.dx*dt;
      p.z += p.dz*dt;
      p.y += p.dy*dt;
      p.dy -= p.gravity*dt;
      positions.set([p.x,p.y,p.z],i*3);
      colors.set([p.r,p.g,p.b],i*3);
      alpha[i] = Math.max(0, p.life/p.ttl) * (p.gravity ? 1 : .63);
      radius[i] = p.size * this.renderer.getPixelRatio();
    }
    for (const attribute of Object.values(geometry.attributes)) attribute.needsUpdate = true;
  }
}
