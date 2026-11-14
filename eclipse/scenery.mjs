import {mountBestiary,poseBestiary,removeBestiary} from './bestiary-models.mjs?v=turnaround-1';
import * as T from '../three.min.mjs';
import {CombatFeedback,addHitSurface} from './combat-feedback.mjs?v=afterglow-1';
import {armLighting, arms, disposeForge, forge, shapeBow} from './armory.mjs?v=relic-sculpts-1';
import {stages} from './expedition.mjs?v=world-3d-1';
import {battleTextures, disposeForm, nightmareForm, particleShapes} from './battle-effects.mjs?v=practice-1';
import {ArenaArt} from './arena-art.mjs?v=forge-1';
import {lantern, lightLantern, monument} from './map-art.mjs?v=forge-1';
import {MotionArt} from './motion-art.mjs?v=nightforge-1';
import {mountEffigy,poseEffigy} from './nightfall-art.mjs?v=practice-1';
import {LanternArt} from './lantern-art.mjs?v=afterglow-1';
import {RoomCutaway} from './room-cutaway.mjs?v=world-3d-1';
import {RoomLandscape} from './room-landscapes.mjs?v=afterglow-1';
import {loadRoomSurfaces} from './room-surfaces.mjs?v=penumbra-1';
import {loadPaintedActors} from './actor-art.mjs?v=gilded-1';
import {GroveLight} from './grove-light.mjs?v=afterglow-1';
import {skillSigil} from './skill-sigils.mjs?v=weapon-audit-1';
import {summonModel,summonMuzzle} from './relic-summons.mjs?v=relic-sculpts-1';
import {relicGrip} from './relic-models.mjs?v=armory-art-1';
import {huntById} from './relic-arsenal.mjs?v=weapon-audit-1';
import {pawPositions,weaponGrips} from './weapon-grips.mjs?v=armory-art-1';
import {elementStyle,particleContours,weaponElements} from './elemental-fx.mjs?v=nightforge-1';
import {paoArrival,paoCastWindup,paoSharedGeometry,paoStrike} from './pao-effects.mjs?v=pao-detail-1';
import {ornamentSpell,spellGeometry} from './spell-layers.mjs?v=nightforge-1';
import {loadSculptMaterials} from './sculpt-material.mjs?v=sculpted-1';

const PI = Math.PI;
const baseCastLooks={
  tiger:'line',dragon:'rain',phoenix:'wave',turtle:'guard',qilin:'storm',flameblade:'rain',
  stormbow:'line',windhalberd:'cone',frostlute:'wave',chakra:'ring',reaper:'drain',
  bell:'ring',fangs:'cone',cannon:'volley',
};
const spellIndex=(id='')=>Array.from(id).reduce((hash,char)=>(hash*31+char.charCodeAt(0))%65521,0);
const projectileProfiles={
  ice:{shape:new T.IcosahedronGeometry(.18,0),stretch:2.08,width:.61,glow:.64},
  fire:{shape:new T.IcosahedronGeometry(.18,1),stretch:1.14,width:.88,glow:.96},
  lightning:{shape:new T.OctahedronGeometry(.17),stretch:1.58,width:.56,glow:.83},
  feather:{shape:new T.ConeGeometry(.14,.64,6).rotateZ(-PI/2),stretch:1.05,width:.72,glow:.65},
  water:{shape:new T.IcosahedronGeometry(.19,1),stretch:1.36,width:.82,glow:.68},
  void:{shape:new T.DodecahedronGeometry(.17,0),stretch:1.29,width:.86,glow:.77},
  blood:{shape:new T.IcosahedronGeometry(.20,0),stretch:1.41,width:.78,glow:.66},
};
const regionalProjectiles=new Set(Object.values(projectileProfiles).map(profile=>profile.shape));
const color = new T.Color();
const unit = new T.Vector3(0, 0, 0);
const weaponUp = new T.Vector3(0,1,0);
const weaponPoint = new T.Vector3();
const shotRotation = new T.Quaternion();
const upright = new T.Vector3(0,1,0);
const bowForward = new T.Vector3(-1,0,0);
const muzzlePoint = new T.Vector3();

function launchMount(model) {
  const mount=model.userData.launch;
  if(!mount)return null;
  return {...mount,axis:mount.bow?bowForward:weaponUp};
}

function aimMount(model,mount,dx,dz) {
  if(mount.axis===bowForward){
    model.rotation.set(0,Math.atan2(dz,-dx),0);
  }else{
    shotRotation.setFromAxisAngle(upright,-Math.atan2(dz,dx));
    model.rotation.set(0,0,-PI/2);
    model.quaternion.premultiply(shotRotation);
    model.rotateY(mount.flat?-PI/2:PI);
  }
}
const weaponOffset = new T.Vector3();
const handPoint = new T.Vector3();
const previousGrip = new T.Quaternion();
const plane = new T.PlaneGeometry(1, 1);
const actorPlane = new T.PlaneGeometry(1,1,12,16);
const relicShard=new T.OctahedronGeometry(1);
const relicWallShape=new T.CylinderGeometry(.13,.68,1.72,5);
const guardianCrest=new T.TorusGeometry(.66,.021,5,32);
const morphMasks={
  'fox-doll':new T.ConeGeometry(.29,.75,4),
  hundun:new T.IcosahedronGeometry(.65,0),
};
const fallingRock=new T.DodecahedronGeometry(1,0);
const fallingTower=[.73,.53,.32].map((width,index)=>new T.CylinderGeometry(width*.66,width,.43-index*.045,4));
const featherBlade=new T.OctahedronGeometry(1).scale(.24,.10,.08);
const batWing=new T.ConeGeometry(.31,.62,3).rotateZ(Math.PI/2);
const fallingStar=new T.TorusKnotGeometry(.34,.087,28,5,2,3);
const beamColumn=new T.CylinderGeometry(.08,.24,1,8);
const handPalm=new T.SphereGeometry(.58,8,6);
const handFinger=new T.CapsuleGeometry(.13,.39,3,5);
const floorPose = new T.Quaternion().setFromEuler(new T.Euler(-PI/2,0,0));
const sceneAngle = new T.Vector3(0, 13.65, 23.5).normalize();
const wristMask=(value)=>1-T.MathUtils.smoothstep(value,.07,.25);

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

function isolateBoss(ctx,width,height) {
  const frame=ctx.getImageData(0,0,width,height);
  const {data}=frame;
  const labels=new Uint32Array(width*height);
  const queue=new Uint32Array(labels.length);
  let id=0, largest=0, largestSize=0;
  for (let pixel=0;pixel<labels.length;pixel++) {
    if (labels[pixel] || data[pixel*4+3]<38) continue;
    labels[pixel]=++id;
    queue[0]=pixel;
    let length=1;
    for (let head=0;head<length;head++) {
      const point=queue[head];
      const x=point%width,y=Math.floor(point/width);
      for (let dy=-1;dy<=1;dy++) {
        if (y+dy<0 || y+dy>=height) continue;
        for (let dx=-1;dx<=1;dx++) {
          if (x+dx<0 || x+dx>=width) continue;
          const neighbor=point+dy*width+dx;
          if (labels[neighbor] || data[neighbor*4+3]<38) continue;
          labels[neighbor]=id;
          queue[length++]=neighbor;
        }
      }
    }
    if (length>largestSize) {
      largest=id;
      largestSize=length;
    }
  }
  for (let pixel=0;pixel<labels.length;pixel++) {
    if (labels[pixel]!==largest) data[pixel*4+3]=0;
  }
  ctx.putImageData(frame,0,0);
}

async function loadCast() {
  const image = new Image();
  image.src = new URL('./art/coin-pickup.webp',import.meta.url).href;
  const artwork=loadPaintedActors();
  const wardens=new Image();
  wardens.src='./wardens.webp';
  const [painted]=await Promise.all([artwork,image.decode(),wardens.decode()]);
  const frames=Array.from({length:41},(_,index)=>painted.get(index));
  frames[8]=new T.Texture(image);
  frames[8].colorSpace=T.SRGBColorSpace;
  frames[8].needsUpdate=true;
  const tile=wardens.width/5;
  for (let index=0;index<10;index++) {
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=284;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingQuality='high';
    ctx.drawImage(wardens,index%5*tile,Math.floor(index/5)*tile,tile,tile,0,0,284,284);
    isolateBoss(ctx,284,284);
    frames[30+index]=texture(canvas);
  }
  return frames;
}

function circle(radius, width, fraction = Math.PI * 2) {
  const geometry = new T.RingGeometry(radius - width, radius, 54, 1, 0, fraction);
  geometry.rotateX(-PI / 2);
  return geometry;
}

function laneEdges(length,width) {
  const vertices=[];
  for (const sign of [-1,1]) {
    const z=width*sign, inner=(width-.045)*sign;
    const a=[-length*.5,0,z],b=[length*.5,0,z],c=[length*.5,0,inner],d=[-length*.5,0,inner];
    vertices.push(...a,...b,...c,...a,...c,...d);
  }
  return new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));
}

function warningMaterial() {
  return new T.ShaderMaterial({side:T.DoubleSide,transparent:true,depthWrite:false,forceSinglePass:true,
    uniforms:{life:{value:0},opacity:{value:.41}},
    vertexShader:`varying vec2 tex; void main(){tex=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`
      varying vec2 tex; uniform float life,opacity;
      void main(){
        float threads=pow(.5+.5*sin((tex.x+tex.y*.43)*68.-life*9.),4.);
        float grid=pow(.5+.5*sin(tex.x*32.-life*12.)*sin(tex.y*41.+life*6.),8.);
        float sparks=pow(.5+.5*sin(tex.x*51.+tex.y*71.-life*19.),15.)*grid;
        float urgency=smoothstep(.52,.99,life);
        gl_FragColor=vec4(.46+threads*.22+sparks*.29,.025+threads*.04+sparks*.05,.014,
          opacity*(.55+urgency*.20+threads*.27+grid*.12));
        #include <colorspace_fragment>
      }
    `});
}

const weather = {
  leaves:{dx:-.54,dy:.42,mist:.055,scale:1},
  mist:{dx:.42,dy:.22,mist:.12,scale:1.08},
  snow:{dx:-.69,dy:-.75,mist:.065,scale:.95},
  embers:{dx:.3,dy:1.35,mist:.075,scale:1.4},
  wisps:{dx:.21,dy:.47,mist:.107,scale:1.29},
  dust:{dx:.38,dy:.28,mist:.05,scale:.85},
  sand:{dx:-2.25,dy:.13,mist:.13,scale:.80},
  spores:{dx:.31,dy:.60,mist:.105,scale:1.41},
  stars:{dx:-.19,dy:.13,mist:.065,scale:1.12},
  cinders:{dx:1.08,dy:1.1,mist:.09,scale:1.36},
};

export class Scenery {
  constructor(canvas) {
    this.canvas = canvas;
    this.shroudElement=document.getElementById('boss-shroud');
    this.mobile = matchMedia('(pointer:coarse)').matches;
    this.renderer = new T.WebGLRenderer({canvas, antialias:!this.mobile, alpha:false, powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.35 : 1.65));
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.14;
    this.renderer.setClearColor(0x100f17);
    this.scene = new T.Scene();
    armLighting(this.scene,true);
    this.camera = new T.OrthographicCamera(-10, 10, 8, -8, .1, 100);
    this.camera.position.copy(sceneAngle).multiplyScalar(28);
    this.camera.lookAt(unit);
    this.focus = new T.Vector3(0, 0, 1);
    this.cameraUp = new T.Vector3(0, sceneAngle.z, -sceneAngle.y);
    this.feedback=new CombatFeedback(this,document.getElementById('elemental-surge'));
    this.halo = radialTexture([[0,'#ffffe7ff'],[.19,'#fff4ceb0'],[.44,'#ffd89e47'],[1,'#ffe1bd00']]);
    this.smoke = radialTexture([[0,'#fffffff0'],[.3,'#ffffff80'],[.65,'#ffffff24'],[1,'#ffffff00']]);
    this.shadow = radialTexture([[0,'#12120ce8'],[.47,'#12110ca2'],[.72,'#15120b4b'],[1,'#00000000']]);
    this.battleTextures=battleTextures();
    for (const map of Object.values(this.battleTextures)) map.colorSpace=T.SRGBColorSpace;
    this.cutaway=new RoomCutaway();
    this.lanternArt=new LanternArt(this);
    this.landscape=new RoomLandscape(this,this.cutaway);
    this.sigilTextures=new Map();
    this.makeSkillSeals();
    this.groveLight=new GroveLight(this.scene,this.landscape.lanternShadows);
    this.mist = Array.from({length:5}, (_, index) => this.makeMist(index));
    this.ring = circle(1, .038);
    this.disc = new T.CircleGeometry(1, 48).rotateX(-PI / 2);
    this.motes = this.createParticleSystem(this.mobile ? 215 : 385);
    this.elementSeed=857302;
    this.elementBudget=0;
    this.leaves = this.createLeaves(this.mobile ? 15 : 28);
    this.effects = [];
    this.motion = new MotionArt(this);
    this.clue = this.makeClue();
    this.ward = this.makeWard();
    this.fixtures = new T.Group();
    this.scene.add(this.fixtures);
    this.missionObjects=new T.Group();
    this.scene.add(this.missionObjects);
    this.arenaArt=new ArenaArt(this);
    this.projectileShape = new T.OctahedronGeometry(.19);
    this.coinShape=new T.TorusGeometry(.21,.038,5,12);
    this.shardShape=new T.ConeGeometry(.24,1.38,5);
    this.shake = 0;
    this.time = 0;
    this.lastStamp = 0;
    this.resize();
  }

  makeSkillSeals() {
    const sigilMaterial=new T.MeshBasicMaterial({opacity:0,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    this.sigilPreview=new T.Mesh(plane,sigilMaterial);
    this.sigilBurst=new T.Mesh(plane,sigilMaterial.clone());
    for(const sigil of [this.sigilPreview,this.sigilBurst]){
      sigil.rotation.x=-PI/2;
      sigil.renderOrder=24;
      sigil.visible=false;
      this.scene.add(sigil);
    }
    this.sigilTime=0;
  }

  sharedPreviewGeometry(geometry) {
    return geometry===plane||geometry===actorPlane||geometry===this.ring||geometry===this.disc||
      geometry===this.projectileShape||geometry===this.coinShape||geometry===this.shardShape||
      paoSharedGeometry.includes(geometry)||spellGeometry.has(geometry)||regionalProjectiles.has(geometry);
  }

  async load() {
    const [atlas]=await Promise.all([loadCast(),loadSculptMaterials(),loadRoomSurfaces()]);
    this.atlas=atlas;
    for (const image of new Set(this.atlas)) this.renderer.initTexture(image);
    this.armIcons = new Map(arms.map(arm=>[arm.id,new URL('./art/weapons/'+arm.id+'.webp?v=relic-sculpts-1',import.meta.url).href]));
    this.setStage(stages[0]);
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    if (!this.width || !this.height) return;
    const aspect = this.width / this.height;
    const view = aspect < .8 ? Math.min(25, 12.5 / aspect) : Math.min(20.4, 33 / aspect);
    this.camera.top = view / 2;
    this.camera.bottom = -view / 2;
    this.camera.left = -view * aspect / 2;
    this.camera.right = view * aspect / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  setStage(stage) {
    this.stage = stage;
    this.feedback.clear();
    this.sigilPreview.visible=this.sigilBurst.visible=false;
    this.sigilPreview.material.opacity=0;
    this.sigilTime=0;
    this.landscape.set(stage);
    const dread=stage.dread;
    const hue=new T.Color(stage.zone.color).offsetHSL(stage.lightShift,0,0).getHex();
    this.air={...weather[stage.zone.style],mist:weather[stage.zone.style].mist+dread*.027};
    this.accent = hue;
    for (const cloud of this.mist) cloud.material.color.setHex(hue);
    this.leaves.mesh.material.color.setHex(hue);
    this.leaves.mesh.visible=stage.zone.style==='leaves'||stage.zone.style==='cinders';
    this.replaceFixtures(stage);
    this.shroud=0;
    this.shroudElement.style.setProperty('--dread',String(.14+dread*.39));
    this.shroudElement.style.setProperty('--omen','0');
    this.shroudElement.style.setProperty('--arena-shadow','0');
    this.arenaDarkness=0;
    this.clue.visible = false;
    this.ward.visible = false;
    for (const fx of this.effects) this.release(fx);
    this.effects.length = 0;
    for (const mote of this.motes.items) mote.life = 0;
  }

  setBossArena(arena) {
    this.arenaArt.set(arena);
    this.cutaway.cover(this.arenaArt.root);
  }

  transformBossArena(arena) {
    this.arenaArt.transform(arena);
    this.cutaway.cover(this.arenaArt.phaseRoot);
  }

  openBossFissure(hazard) {
    this.arenaArt.openFissure(hazard);
  }

  replaceFixtures(stage) {
    const materials=new Set();
    this.fixtures.traverse(piece=>{
      if (!piece.isMesh) return;
      if (piece.geometry!==plane) piece.geometry.dispose();
      materials.add(piece.material);
    });
    for (const material of materials) material.dispose();
    this.fixtures.clear();
    const tone=stage.zone.color;
    const place=(parent,geometry,material,y)=>{
      const mesh=new T.Mesh(geometry,material);
      mesh.position.y=y;
      parent.add(mesh);
      return mesh;
    };
    for (const prop of stage.props) this.fixtures.add(monument(this,prop,tone));
    const glyph=new T.Group();
    const radius=(stage.boss?3.75:1.8+stage.room*.10);
    glyph.position.set((stage.room%3-1)*.72,.016,stage.boss?-2.1:-2.65);
    glyph.rotation.y=stage.bearing;
    const glow=new T.MeshBasicMaterial({color:tone,transparent:true,opacity:stage.boss?.39:.20,blending:T.AdditiveBlending,depthWrite:false});
    place(glyph,circle(radius,.035),glow,0);
    place(glyph,circle(radius*.79,.023),glow,.005);
    const points=4+(stage.chapter+stage.room)%6;
    for (let i=0;i<points;i++) {
      const angle=i*PI*2/points;
      const rune=place(glyph,new T.BoxGeometry(.072,.013,.32+(stage.room%4)*.10),glow,.009);
      rune.position.x=Math.sin(angle)*radius*.9;
      rune.position.z=Math.cos(angle)*radius*.9;
      rune.rotation.y=angle;
    }
    this.fixtures.add(glyph);
    this.cutaway.cover(this.fixtures);
    if (stage.dread>.055) {
      const count=Math.floor(1+stage.dread*8);
      for (let index=0;index<count;index++) {
        const angle=stage.bearing+index*2.39;
        const reach=2.6+index*.81+(stage.room%3)*.38;
        const size=1.8+stage.dread*3.1+(index%3)*.44;
        const stain=this.ground(this.battleTextures.stain,0xffffff,.20+stage.dread*.52,size,size*.81);
        stain.position.set(Math.cos(angle)*reach,.014,Math.sin(angle)*reach*.86);
        stain.rotateZ(angle+stage.dread);
        stain.renderOrder=-12;
        this.fixtures.add(stain);
      }
      if (stage.boss||stage.dread>.68) {
        const seal=this.ground(this.battleTextures.glyph,stage.dread>.62?0xa8454b:stage.guardian?.tint??tone,
          .19+stage.dread*.28,stage.boss?8.4:5.4,stage.boss?8.4:5.4);
        seal.position.set(0,.021,stage.boss?-2.2:-1.6);
        seal.material.blending=T.AdditiveBlending;
        seal.rotateZ(stage.bearing);
        this.fixtures.add(seal);
      }
    }
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
    mesh.userData.sharedGeometry=true;
    mesh.rotation.x = -PI / 2;
    mesh.scale.set(sizeX, sizeZ, 1);
    mesh.renderOrder = -8;
    return mesh;
  }

  createActor(frame, height) {
    const hitFlash={value:0};
    const spriteMaterial = new T.ShaderMaterial({
      uniforms:{picture:{value:this.atlas[frame]},flash:{value:0},hitFlash,fade:{value:1},warm:{value:0},bend:{value:0},sway:{value:0},compression:{value:0},
        stride:{value:0},footLift:{value:0},lag:{value:0},paw:{value:new T.Vector2()},wrist:{value:new T.Vector2()},
        guard:{value:0},ink:{value:new T.Color(0xffffff)},rim:{value:new T.Color()},texel:{value:new T.Vector2()},
        rimLight:{value:0}},
      vertexShader:`
        varying vec2 artUV;
        uniform float bend,sway,compression,stride,footLift,lag;
        uniform vec2 paw,wrist;
        void main() {
          artUV=uv;
          vec3 body=position;
          float upper=smoothstep(.12,.94,uv.y);
          float torso=sin(uv.y*3.14159);
          float leg=1.-smoothstep(.09,.37,uv.y);
          float side=smoothstep(.38,.62,uv.x)*2.-1.;
          float loose=(1.-smoothstep(.19,.54,uv.x))*smoothstep(.14,.42,uv.y)*(1.-smoothstep(.58,.84,uv.y));
          float hand=1.-smoothstep(.07,.25,length(position.xy-paw));
          body.x+=bend*upper*upper+sway*torso*torso;
          body.y-=torso*(abs(bend)*.055+compression);
          body.x+=side*stride*leg+loose*lag+hand*wrist.x;
          body.y+=max(0.,side*footLift)*leg+loose*abs(lag)*.37+hand*wrist.y;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(body,1.);
        }
      `,
      fragmentShader:`
        uniform sampler2D picture;
        uniform float flash,hitFlash;
        uniform float fade;
        uniform float warm;
        uniform float guard;
        uniform float rimLight;
        uniform vec3 ink;
        uniform vec3 rim;
        uniform vec2 texel;
        varying vec2 artUV;
        void main() {
          vec4 art=texture2D(picture,artUV);
          vec2 stepUV=texel*1.65;
          float outer=max(max(texture2D(picture,artUV+vec2(stepUV.x,0.)).a,
            texture2D(picture,artUV-vec2(stepUV.x,0.)).a),texture2D(picture,artUV+vec2(0.,stepUV.y)).a);
          float outline=max(0.,outer-art.a)*rimLight;
          if(max(art.a,outline) < .06) discard;
          vec3 paint=(art.rgb*1.22 + vec3(.014,.010,.009))*mix(vec3(1.),ink,.43);
          paint=mix(paint,vec3(1.,.35,.10),warm*.24);
          paint=mix(paint,mix(vec3(1.,.78,.53),vec3(.71,.97,1.),guard),flash);
          paint=mix(paint,rim*.75+vec3(.085),outline);
          paint=mix(paint*(1.+hitFlash*.38),vec3(1.65,1.57,1.48),hitFlash*.89);
          gl_FragColor=vec4(paint,max(art.a,outline*.58)*fade);
          #include <colorspace_fragment>
        }
      `,
      transparent:true,depthWrite:false,side:T.DoubleSide,
    });
    const art = new T.Mesh(actorPlane, spriteMaterial);
    const shade = this.ground(this.shadow, 0xffffff, .82, height * 1.1, height * .66);
    const rim = this.ground(this.halo, 0xff8d52, .19, height * 1.6, height * 1.06);
    rim.material.blending = T.AdditiveBlending;
    this.scene.add(art, shade, rim);
    return {art,shade,rim,height,hitFlash,footPhase:null};
  }

  prepareBoss(visual,spec) {
    const model=spec.bestiary??spec.model;
    if(model){
      visual.bestiary=mountBestiary(this.scene,model,spec.height,this.mobile,spec);
      for(const material of Object.values(visual.bestiary.materials))addHitSurface(material,visual.hitFlash);
      visual.art.visible=false;
    }else{
      visual.form=nightmareForm(spec);
      this.scene.add(visual.form);
    }
    if(spec.relicWeapon){
      const weapon=spec.relicWeapon;
      const crest=new T.Mesh(plane,new T.MeshBasicMaterial({map:this.relicTexture(weapon.id),color:weapon.tone,
        transparent:true,opacity:.61,depthWrite:false,blending:T.AdditiveBlending}));
      const crown=new T.Mesh(guardianCrest,new T.MeshBasicMaterial({color:weapon.tone,transparent:true,opacity:.49,
        depthWrite:false,blending:T.AdditiveBlending}));
      visual.relicCrest=crest;
      visual.relicCrown=crown;
      this.scene.add(crest,crown);
    }
  }

  previewArms() {
    const size=288;
    const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
    renderer.setSize(size,size,false);
    renderer.setClearColor(0,0);
    renderer.toneMapping=T.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.21;
    const scene=new T.Scene();
    armLighting(scene);
    const camera=new T.OrthographicCamera(-1.10,1.10,1.10,-1.10,.1,20);
    camera.position.set(.27,.25,5.2);
    camera.lookAt(0,0,0);
    const result=new Map();
    for(const arm of arms){
      const item=forge(arm);
      const gun=arm.form==='gun'||arm.id==='cannon';
      const pole=['spear','halberd','trident','staff','cane'].includes(arm.form)||arm.id==='windhalberd'||arm.id==='reaper';
      const round=['ring','orb','beads','talisman'].includes(arm.form)||['dragon','tiger','chakra','han-spear'].includes(arm.id);
      item.rotation.set(arm.id==='turtle'?-.80:-.11,gun?-.26:-.32,gun?-.92:pole?-.69:round?-.19:-.57);
      item.updateMatrixWorld(true);
      const bounds=new T.Box3();
      item.traverseVisible(part=>{
        if(!part.isMesh)return;
        part.geometry.computeBoundingBox();
        bounds.union(part.geometry.boundingBox.clone().applyMatrix4(part.matrixWorld));
      });
      const extent=bounds.getSize(new T.Vector3());
      const fit=1.93/Math.max(extent.x,extent.y,extent.z);
      item.position.copy(bounds.getCenter(new T.Vector3())).multiplyScalar(-fit);
      item.scale.setScalar(fit);
      scene.add(item);
      renderer.render(scene,camera);
      result.set(arm.id,renderer.domElement.toDataURL('image/webp',.92));
      scene.remove(item);
      disposeForge(item);
    }
    renderer.dispose();
    renderer.forceContextLoss();
    return result;
  }

  equip(actor, weapon) {
    this.unequip(actor);
    const model = forge(weapon);
    const glow = new T.Sprite(new T.SpriteMaterial({map:this.halo,color:weapon.tone,opacity:.08,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
    glow.scale.set(.90,.90,1);
    model.add(glow);
    this.scene.add(model);
    const profile=weapon.spell?relicGrip(weapon):weaponGrips[weapon.id];
    glow.position.y=profile.glow??.48;
    actor.weapon = {model,glow,id:weapon.id,profile,mount:launchMount(model),anchor:new T.Vector3(...profile.anchor),
      blades:weapon.id==='fangs'?model.children.slice(0,2):null};
    this.sigilPreview.material.map=this.relicTexture(weapon.id);
    this.sigilPreview.material.needsUpdate=true;
    this.sigilPreview.material.color.setHex(weapon.tone);
  }

  weaponOrigin(actor,dx,dz,target) {
    const {model,mount,anchor}=actor.weapon;
    if(!mount||!actor.weapon.posed)return null;
    handPoint.copy(anchor).multiply(model.scale).applyQuaternion(model.quaternion).add(model.position);
    aimMount(model,mount,dx,dz);
    if(target){
      const x=target.x-handPoint.x, z=target.z-handPoint.z;
      const distance=Math.hypot(x,z);
      const ahead=x*dx+z*dz;
      muzzlePoint.set(...mount.tip).sub(anchor).multiply(model.scale).applyQuaternion(model.quaternion);
      const side=-muzzlePoint.x*dz+muzzlePoint.z*dx;
      if(ahead>.13&&distance>Math.abs(side)+.03){
        const angle=Math.atan2(z,x)-Math.asin(side/distance);
        dx=Math.cos(angle);dz=Math.sin(angle);
        aimMount(model,mount,dx,dz);
      }
    }
    model.position.copy(handPoint).sub(weaponOffset.copy(anchor).multiply(model.scale).applyQuaternion(model.quaternion));
    model.localToWorld(muzzlePoint.set(...mount.tip));
    return {x:muzzlePoint.x,y:muzzlePoint.y,z:muzzlePoint.z,dx,dz};
  }

  relicTexture(id) {
    if(!this.sigilTextures.has(id))this.sigilTextures.set(id,texture(skillSigil(id).canvas));
    return this.sigilTextures.get(id);
  }

  relicPulse(weapon,point,radius,index=0) {
    this.elementBurst(point.x,.35,point.z,weapon.tone,weapon.effect,index===0?12:7,.91+radius*.08);
    if(index===0)this.spellAccent(point,{action:weapon.spell.action==='storm'?'storm':'circle',
      element:weapon.element,tint:weapon.tone,radius,seed:weapon.sigil,power:.72});
    if(index===0||index%3===2){
      const crest=this.addEffect(plane,{...point,y:.091},weapon.tone,.51,
        {map:this.relicTexture(weapon.id),scale:radius*1.46,growth:.54,opacity:.67,fade:true,order:36});
      crest.spin=(weapon.sigil%2?1:-1)*(.36+weapon.sigil%7*.18);
    }
    if(index%2===0){
      const size=.19+radius*.20;
      const shard=this.addEffect(relicShard,{...point,y:.63},weapon.tone,.29,
        {scale:size,growth:size*.48,opacity:.66,angle:index*.82+weapon.sigil*.23,fade:true,order:68});
      shard.mesh.rotation.z=.46+weapon.sigil%6*.17;
    }
  }

  relicFall(weapon,point,radius,index) {
    const {look}=weapon.spell;
    const landing={...point,y:.11};
    const fall=(shape,x,z,scale,y=0,tint=weapon.tone)=>{
      const fx=this.addEffect(shape,{x,y:4+y,z},tint,.25,
        {scale,opacity:.96,angle:Math.PI/4+index*.7,blend:false,order:65});
      fx.vertical={from:4+y,to:.28+y,duration:.18};
      fx.combatClock=true;
      return fx;
    };
    if(look==='thunderfall'){
      this.bolt({...point,y:5.4},landing,weapon.tone,2.0);
    }else if(look==='pagoda'){
      fallingTower.forEach((tier,i)=>fall(tier,point.x,point.z,.86+radius*.18,.34+i*.30,
        i%2?0xffedc3:weapon.tone));
    }else if(look==='fallen-arm'){
      const blade=forge(weapon);
      const fx=this.addEffect(relicShard,{...point,y:4},weapon.tone,.27,{opacity:0,order:69});
      blade.rotation.z=Math.PI;
      blade.scale.setScalar(.82);
      fx.mesh.add(blade);
      fx.vertical={from:4,to:.72,duration:.18};
      fx.cleanup=()=>disposeForge(blade);
      fx.combatClock=true;
      if(weapon.element==='lightning')this.bolt({...point,y:4.7},landing,weapon.tone,1.22);
    }else if(look==='boulder'){
      for(let i=0;i<3;i++){
        const angle=i*2.399+index*.9;
        const rock=fall(fallingRock,point.x+Math.cos(angle)*.67,point.z+Math.sin(angle)*.67,.28+(i===0?.31:.07),i*.39);
        rock.spin=5+i;
      }
    }else{
      const shape=look==='stars'?fallingStar:look==='thunder-orbs'?handPalm:relicShard;
      const fx=fall(shape,point.x,point.z,.32+radius*.21);
      fx.spin=7.4;
      if(look==='thunder-orbs')this.sealFx(point.x,point.z,weapon.tone,radius,.82);
    }
  }

  relicOrbShot(shot,duration,tint) {
    const {origin,dx,dz,reach}=shot;
    const orb=this.addEffect(handPalm,origin,tint,duration,{scale:.26,opacity:.94,order:94});
    orb.travel={x:dx*reach/duration,z:dz*reach/duration};
    orb.spin=12;
    orb.combatClock=true;
    this.motion.flash(origin,tint,.82);
  }

  relicFeatherShot(shot,duration,tint) {
    const {origin,dx,dz,reach}=shot;
    const feather=this.addEffect(featherBlade,origin,tint,duration,
      {scale:2.0,opacity:.94,angle:-Math.atan2(dz,dx),order:94});
    feather.travel={x:dx*reach/duration,z:dz*reach/duration};
    feather.combatClock=true;
    this.spark(origin.x,origin.y,origin.z,tint,4,.54,'gold',Math.atan2(dz,dx));
  }

  relicBats(point,tint,radius,index) {
    const angle=index*2.399;
    for(let i=0;i<(this.mobile?2:3);i++){
      const a=angle+i*2.09;
      for(const side of [-1,1]){
        const wing=this.addEffect(batWing,{x:point.x+Math.cos(a)*radius*.42,
          y:.64+i*.16,z:point.z+Math.sin(a)*radius*.42+side*.22},tint,.36,
          {scale:.65,opacity:.86,angle:-a+side*.62,order:81,fade:true});
        wing.travel={x:Math.cos(a+1.9)*2.9,z:Math.sin(a+1.9)*2.9};
        wing.animate=()=>wing.mesh.rotation.x=Math.sin(wing.age*32)*side*.62;
      }
    }
  }

  relicColumn(weapon,point,radius) {
    const top={...point,y:3.2};
    const jewel=this.addEffect(handPalm,top,weapon.tone,.37,{scale:.37,growth:.25,opacity:.98,order:75,fade:true});
    jewel.spin=6.2;
    const beam=this.addEffect(beamColumn,{...point,y:1.65},weapon.tone,.28,
      {scale:radius*.70,opacity:.65,order:73,fade:true});
    beam.stretchY=3.25/(radius*.70);
    const core=this.addEffect(beamColumn,{...point,y:1.63},0xfff6e2,.23,
      {scale:.31,opacity:.88,order:74,fade:true});
    core.stretchY=10.15;
    this.motion.flash(top,weapon.tone,1.24);
  }

  relicRise(weapon,point,bearing,radius) {
    const hand=weapon.spell.look==='hand';
    const reach=(hand?.78:1.0)+radius*.16;
    for(let i=0;i<(hand?6:4);i++){
      const angle=bearing+i*2.399;
      const gap=(i?(.25+.11*(i%3))*radius:0);
      const fx=this.addEffect(hand?(i?handFinger:handPalm):weapon.element==='ice'?relicShard:fallingRock,
        {x:point.x+Math.cos(angle)*gap,y:.08,z:point.z+Math.sin(angle)*gap},i%2?weapon.tone:0xe4d4bc,.43,
        {scale:i===0?.74:.43,opacity:.9,blend:false,angle,order:69,fade:true});
      fx.vertical={from:-.23,to:(i?reach*.62:reach)*(.72+(i%3)*.19),duration:.13};
      fx.mesh.rotation.z=i===0?-.16:Math.sin(angle)*.45;
      fx.stretchY=weapon.element==='ice'?2.5:hand?1.8:1.57;
    }
  }

  relicStorm(weapon,point,radius,duration) {
    const {look}=weapon.spell;
    if(look==='blade-wheel'){
      this.motion.spinningDisk(point.x,point.z,1,0,0,weapon.tone,0,true,duration,radius*.82);
    }else{
      this.motion.vortex(point.x,point.z,radius,weapon.tone,duration);
    }
    this.elementBurst(point.x,.34,point.z,weapon.tone,weapon.effect,this.mobile?6:11,1.11);
  }

  relicAura(weapon,unit,duration,morph=false) {
    const seal=this.addEffect(plane,{x:unit.x,y:.095,z:unit.z},weapon.tone,duration,
      {map:this.relicTexture(weapon.id),scale:3.4,growth:.36,opacity:.49,fade:true,order:31});
    seal.follow=unit;
    seal.spin=1.34;
    if(morph){
      for(const side of [-1,1]){
        const mask=this.addEffect(morphMasks[weapon.id]??relicShard,{x:unit.x,y:1.2,z:unit.z},weapon.tone,duration,
          {scale:.61,growth:.23,opacity:.76,angle:side*.65,fade:true,order:75});
        mask.follow=unit;
        mask.orbit=side*(.60+weapon.sigil%4*.055);
        mask.mesh.rotation.z=side*.43;
      }
    }
  }

  relicWall(weapon,point,bearing,duration) {
    const wall=this.addEffect(relicWallShape,{...point,y:.92},weapon.tone,duration,
      {scale:.85,growth:.13,opacity:.65,angle:-bearing,fade:true,order:65});
    wall.mesh.rotation.z=.19;
  }

  relicCompanion(weapon,point,duration) {
    this.spellAccent(point,{action:'minion',element:weapon.element,tint:weapon.tone,radius:1.78,seed:weapon.sigil,power:.87});
    this.elementBurst(point.x,.14,point.z,weapon.tone,weapon.effect,this.mobile?7:12,1.14);
    return summonModel(this,weapon,point,duration);
  }

  relicShot(summon,point,angle,target,tint) {
    const origin=summonMuzzle(summon,point,angle,target);
    const {dx,dz}=origin;
    const reach=Math.max(.04,(target.x-origin.x)*dx+(target.z-origin.z)*dz);
    const duration=Math.max(.065,reach/27);
    this.motion.rifle(origin,dx,dz,reach,tint,duration,true);
    return {origin,dx,dz,reach,duration};
  }

  relicLunge(familiar,from,target,angle) {
    familiar.mesh.position.set(from.x,.03,from.z);
    familiar.mesh.rotation.y=-angle;
    familiar.drift={x:target.x-from.x,z:target.z-from.z,last:0};
    familiar.lungeAge=familiar.age;
  }

  previewSkill(hero,preview,dt) {
    const sigil=this.sigilPreview;
    const target=preview===2?.95:preview===1?.51:0;
    sigil.material.opacity+= (target-sigil.material.opacity)*(1-Math.exp(-dt*23));
    sigil.visible=sigil.material.opacity>.025;
    sigil.position.set(hero.x,.085,hero.z);
    sigil.scale.setScalar(3.65+Math.sin(this.time*4)*.10+(preview===2?.32:0));
    if(this.sigilTime>0){
      this.sigilTime=Math.max(0,this.sigilTime-dt);
      const progress=1-this.sigilTime/.48;
      this.sigilBurst.scale.setScalar(3.7+2.0*progress);
      this.sigilBurst.material.opacity=.94*(1-progress)**1.45;
      this.sigilBurst.visible=this.sigilTime>0;
    }
  }

  releaseSigil(hero) {
    this.sigilBurst.material.map=this.sigilPreview.material.map;
    this.sigilBurst.material.color.copy(this.sigilPreview.material.color);
    this.sigilBurst.material.needsUpdate=true;
    this.sigilBurst.position.set(hero.x,.091,hero.z);
    this.sigilTime=.48;
    this.sigilPreview.material.opacity=0;
  }

  actor(visual, unit, spec) {
    const {art, shade, rim, height} = visual;
    const atlas = this.atlas[spec.frame];
    const aspect = atlas.image.width / atlas.image.height;
    const figureHeight = height * (spec.poseSize ?? 1);
    const breath = spec.bob || 0;
    const direction = spec.face || 1;
    art.material.uniforms.picture.value = atlas;
    const flash=this.feedback.subdued?0:spec.flash??0;
    art.material.uniforms.flash.value=flash;
    art.material.uniforms.fade.value = spec.fade ?? 1;
    art.material.uniforms.warm.value = spec.warm || 0;
    art.material.uniforms.bend.value = (spec.bend??0)*direction;
    art.material.uniforms.sway.value = spec.sway??0;
    art.material.uniforms.compression.value = spec.compression??0;
    const {stride,footLift,lag,paw,wrist}=art.material.uniforms;
    stride.value=spec.stride??0;
    footLift.value=spec.footLift??0;
    lag.value=spec.lag??0;
    if(visual.weapon){
      const paws=pawPositions[spec.frame]??pawPositions[0];
      paw.value.set(...paws[visual.weapon.profile.hand??0]);
    }
    wrist.value.set(spec.armReach??0,spec.armLift??0);
    art.material.uniforms.guard.value=spec.guardFlash?1:0;
    art.material.uniforms.rim.value.setHex(spec.rim??0xc78f71);
    art.material.uniforms.texel.value.set(1/atlas.image.width,1/atlas.image.height);
    art.material.uniforms.rimLight.value=.41+(spec.aura??.1)*.5;
    art.material.uniforms.ink.value.setHex(spec.ink??0xffffff);
    const x=unit.x+(spec.offsetX??0), z=unit.z+(spec.offsetZ??0);
    poseEffigy(visual,spec,this.time,x,z);
    if(visual.bestiary)poseBestiary(visual.bestiary,unit,flash===spec.flash?spec:{...spec,flash},this.time,x,z);
    const foot=spec.feet??null;
    if(foot!==null&&visual.footPhase!==null&&foot!==visual.footPhase&&!unit.spec?.float){
      const hue=unit.spec?.tint??0xc6a88f;
      this.elementBurst(x+direction*(foot===0?-.22:.22),.08,z,hue,unit.spec?.effect??'wind',unit.kind==='boss'?4:2,.63);
    }
    visual.footPhase=foot;
    const fall=spec.fall??0;
    art.position.set(x,.02+fall*.055,z);
    const roll = spec.roll || 0;
    const displayedHeight = figureHeight * (spec.squash || 1);
    art.position.addScaledVector(this.cameraUp,(displayedHeight*.45+breath)*(1-fall));
    art.quaternion.copy(this.camera.quaternion);
    if (fall>0) art.quaternion.slerp(floorPose,fall);
    art.rotateZ((spec.tilt || 0) + roll);
    art.scale.set(displayedHeight * aspect * direction * (spec.stretch || 1), displayedHeight, 1);
    art.renderOrder = 50 + unit.z;
    if (visual.form) {
      const {form}=visual;
      form.visible=(spec.phase??0)>0&&fall<.68;
      if (form.visible) {
        const corruption=.66+(this.stage.dread??0)*.22+spec.phase*.09;
        const bloom=1+Math.sin(this.time*4.8+unit.z)*.055;
        form.position.copy(art.position).addScaledVector(sceneAngle,-.29);
        form.quaternion.copy(art.quaternion);
        form.scale.set(displayedHeight*.55*corruption*bloom,displayedHeight*.63*corruption,1);
        for (const part of form.children) part.renderOrder=art.renderOrder-1;
      }
    }
    if(visual.relicCrest){
      const {relicCrest,relicCrown}=visual;
      relicCrest.visible=relicCrown.visible=fall<.63;
      relicCrest.quaternion.copy(art.quaternion);
      relicCrest.material.opacity=spec.phase?.88:.73;
      relicCrest.position.copy(art.position).addScaledVector(sceneAngle,.24);
      relicCrest.position.y+=displayedHeight*.65;
      relicCrest.scale.setScalar((spec.phase?1.24:1.02)+Math.sin(this.time*3)*.08);
      relicCrest.renderOrder=art.renderOrder+1;
      relicCrown.position.set(x,.071,z);
      relicCrown.rotation.set(-PI/2,0,this.time*.38);
      relicCrown.scale.setScalar(spec.phase?2.83:2.22);
    }
    shade.position.set(x,.022,z+.03);
    shade.material.opacity=(.73+fall*.14)*Math.max(.52,1-breath*.35)*(spec.fade??1);
    rim.position.set(x,.027,z);
    rim.material.color.setHex(spec.rim || 0xc48747);
    rim.material.opacity = (spec.aura ?? .12) * (spec.fade ?? 1);
    if (visual.weapon) {
      const {model,glow,id,profile,anchor,blades,mount} = visual.weapon;
      const paws=pawPositions[spec.frame]??pawPositions[0];
      this.pawPosition(art,paws[profile.hand??0],handPoint);
      previousGrip.copy(model.quaternion);
      model.rotation.set(profile.pitch, direction*(.32+Math.sin(this.time*3.2)*.08),
        direction*(profile.turn+(spec.frame===1?-.32:0)+(spec.sway??0)*1.3-(spec.lag??0)*2.2)+roll*.75);
      const grip=spec.grip;
      const shot=spec.shot??(grip?.projectile?grip:null);
      if(mount&&shot&&!fall){
        aimMount(model,mount,shot.dx,shot.dz);
      }else if (grip) {
        const sweep=grip.contact&&grip.pointed?0:grip.sweep;
        const dx=grip.dx*Math.cos(sweep)-grip.dz*Math.sin(sweep);
        const dz=grip.dx*Math.sin(sweep)+grip.dz*Math.cos(sweep);
        if (grip.pointed) {
          const slant=Math.sin(grip.pitch);
          weaponPoint.set(dx*slant,Math.cos(grip.pitch),dz*slant).normalize();
          model.quaternion.setFromUnitVectors(weaponUp,weaponPoint);
          model.rotateY(grip.roll);
        } else {
          const yaw=id==='stormbow'?Math.atan2(dz,-dx)+(1-Math.abs(dx))*direction*.38:-Math.atan2(dz,dx)+PI*.5;
          model.rotation.set(-.21-grip.pitch*.31,yaw,
            direction*(grip.roll+profile.turn*.22));
        }
      }
      if (fall>0) {
        handPoint.y=Math.max(.10,handPoint.y);
        model.rotation.x-=fall*.93;
      }
      if (id==='dragon') model.rotation.y+=this.time*(grip?4.2:2.1);
      if(!grip&&!shot&&!roll&&spec.dt&&visual.weapon.posed&&id!=='dragon'){
        model.quaternion.slerp(previousGrip,Math.exp(-spec.dt*22));
      }
      visual.weapon.posed=true;
      if (mount?.axis===bowForward) shapeBow(model,grip?.draw??0,grip?.nocked??false);
      const charge=grip?.charge??0;
      const core=model.userData.finishes.core;
      core.emissiveIntensity=core.userData.restGlow+charge*.53+(grip?.contact ? .20 : 0);
      glow.material.opacity=.072+charge*.30;
      glow.scale.set(.88+charge*.53,.88+charge*.53,1);
      model.scale.setScalar(profile.scale*(roll?.85:1)*(1-fall*.16));
      model.position.copy(handPoint).sub(weaponOffset.copy(anchor).multiply(model.scale).applyQuaternion(model.quaternion));
      if(blades) {
        for(const [index,blade] of blades.entries()){
          blade.rotation.z=(index?1:-1)*direction*(.34+charge*.29);
          this.pawPosition(art,paws[index],handPoint);
          model.worldToLocal(handPoint);
          blade.position.copy(handPoint).sub(weaponOffset.copy(anchor).applyQuaternion(blade.quaternion));
        }
      }
      model.visible=(spec.fade??1)>.19;
      model.renderOrder=art.renderOrder+1;
      glow.renderOrder=art.renderOrder+2;
    }
  }

  pawPosition(art,[x,y],target) {
    const uv=y+.5;
    const upper=T.MathUtils.smoothstep(uv,.12,.94);
    const torso=Math.sin(uv*PI);
    const {bend,sway,compression,stride,footLift,lag,paw,wrist}=art.material.uniforms;
    const leg=1-T.MathUtils.smoothstep(uv,.09,.37);
    const side=T.MathUtils.smoothstep(x+.5,.38,.62)*2-1;
    const loose=(1-T.MathUtils.smoothstep(x+.5,.19,.54))*T.MathUtils.smoothstep(uv,.14,.42)
      *(1-T.MathUtils.smoothstep(uv,.58,.84));
    const hand=wristMask(Math.hypot(x-paw.value.x,y-paw.value.y));
    target.set(x+bend.value*upper*upper+sway.value*torso*torso,
      y-torso*(Math.abs(bend.value)*.055+compression.value),0);
    target.x+=side*stride.value*leg+loose*lag.value+hand*wrist.value.x;
    target.y+=Math.max(0,side*footLift.value)*leg+loose*Math.abs(lag.value)*.37+hand*wrist.value.y;
    target.multiply(art.scale).applyQuaternion(art.quaternion).add(art.position).addScaledVector(sceneAngle,.094);
  }

  prepareEffigy(visual,kind) {
    mountEffigy(this.scene,visual,kind);
    for(const mesh of visual.effigy.children)addHitSurface(mesh.material,visual.hitFlash);
  }

  removeActor(visual) {
    const {art,shade,rim,form,effigy,relicCrest,relicCrown,bestiary}=visual;
    this.feedback.forget(visual);
    this.scene.remove(art, shade, rim);
    if(relicCrest){
      this.scene.remove(relicCrest,relicCrown);
      relicCrest.material.dispose();
      relicCrown.material.dispose();
    }
    if(bestiary)removeBestiary(this.scene,bestiary);
    if(effigy){
      this.scene.remove(effigy);
      for(const mesh of effigy.children)mesh.material.dispose();
    }
    art.material.dispose();
    shade.material.dispose();
    rim.material.dispose();
    if (form) {
      this.scene.remove(form);
      disposeForm(form);
    }
  }

  unequip(actor) {
    if (actor.weapon) {
      this.scene.remove(actor.weapon.model);
      disposeForge(actor.weapon.model);
      actor.weapon.glow.material.dispose();
      actor.weapon=null;
    }
  }

  removeEquippedActor(actor) {
    this.unequip(actor);
    this.removeActor(actor);
  }

  makeClue(parent=this.scene) {
    const root=lantern(this);
    root.visible=false;
    parent.add(root);
    return root;
  }

  placeClue(point) {
    this.clue.visible=!!point;
    if (point) this.clue.position.set(point.x,0,point.z);
  }

  setMission(mission) {
    const materials=new Set();
    this.missionObjects.traverse(piece=>{
      if (piece.isMesh&&piece.geometry!==plane) piece.geometry.dispose();
      if (piece.material) materials.add(piece.material);
    });
    for (const material of materials) material.dispose();
    this.missionObjects.clear();
    this.mission=mission;
    this.missionLight=null;
    if(!mission)return;
    this.missionLight=this.makeClue(this.missionObjects);
    this.missionLight.scale.setScalar(1.74);
    this.missionLight.position.set(mission.plan.altar.x,0,mission.plan.altar.z);
    this.missionLight.visible=true;
  }

  renderMission() {
    if(!this.missionLight)return;
    const {flame}=this.missionLight.userData;
    const fraction=this.mission.light/this.mission.plan.maxLight;
    lightLantern(this.missionLight,fraction>0,this.time,fraction);
    flame.material.color.setHex(fraction<.38?0xff6e45:0xffd58d);
  }

  makeWard() {
    const group = new T.Group();
    const shell = new T.Mesh(new T.SphereGeometry(1.57,32,18),
      new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
        uniforms:{opacity:{value:.34},time:{value:0}},
        vertexShader:`
          varying vec3 eyeNormal; varying vec2 tex;
          void main(){tex=uv; eyeNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
        `,
        fragmentShader:`
          varying vec3 eyeNormal; varying vec2 tex; uniform float opacity,time;
          void main(){
            float rim=pow(1.-max(0.,normalize(eyeNormal).z),2.1);
            float lattice=abs(sin(tex.x*69.+sin(tex.y*29.)*1.2)*sin(tex.y*57.));
            float lines=1.-smoothstep(.016,.14,lattice);
            float pulse=pow(.5+.5*sin(tex.y*24.-time*5.),16.);
            float lower=smoothstep(.04,.23,tex.y);
            vec3 light=mix(vec3(.16,.62,.58),vec3(.78,1.,.92),rim*.84+pulse*.12);
            gl_FragColor=vec4(light,lower*opacity*(.13+rim*.86+lines*.34+pulse*.22));
            #include <colorspace_fragment>
          }
        `}));
    shell.position.y=.98;
    shell.scale.y=.82;
    const seal = new T.Mesh(circle(1.53,.039),
      new T.MeshBasicMaterial({color:0x9cf3d9,transparent:true,opacity:.82,depthWrite:false,blending:T.AdditiveBlending}));
    seal.position.y=.032;
    const crest=this.ground(this.battleTextures.glyph,0x8cdecf,.46,3.22,3.22);
    crest.position.y=.046;
    crest.material.blending=T.AdditiveBlending;
    group.add(shell,seal,crest);
    this.scene.add(group);
    group.visible=false;
    group.userData.shell=shell;
    return group;
  }

  setWard(hero) {
    this.ward.visible=hero.ward>0||!!hero.linkGuard;
    if (!this.ward.visible) return;
    this.ward.position.set(hero.x,0,hero.z);
    const shell=this.ward.userData.shell;
    shell.rotation.y=this.time*.48;
    shell.material.uniforms.time.value=this.time;
    shell.material.uniforms.opacity.value=.14+Math.min(.42,Math.max(hero.ward,hero.linkGuard?hero.linkGuard.left*.7:0)*.18);
  }

  createParticleSystem(capacity) {
    const positions = new Float32Array(capacity * 3);
    const colors = new Float32Array(capacity * 3);
    const radius = new Float32Array(capacity);
    const alpha = new Float32Array(capacity);
    const shape = new Float32Array(capacity);
    const geometry = new T.BufferGeometry();
    for (const [key, data, size] of [['position',positions,3],['tint',colors,3],['radius',radius,1],['alpha',alpha,1],['shape',shape,1]]) {
      geometry.setAttribute(key,new T.BufferAttribute(data,size).setUsage(T.DynamicDrawUsage));
    }
    const material = new T.ShaderMaterial({
      transparent:true, depthWrite:false, blending:T.AdditiveBlending,
      vertexShader:`
        attribute vec3 tint; attribute float radius; attribute float alpha; attribute float shape;
        varying vec4 ink; varying float motif;
        void main(){ink=vec4(tint,alpha);motif=shape;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=radius;}
      `,
      fragmentShader:`
        varying vec4 ink; varying float motif;
        void main(){vec2 p=gl_PointCoord-.5;float contour=length(p);
        if(motif>0.5&&motif<1.5) contour=abs(p.x)*.88+abs(p.y);
        if(motif>1.5&&motif<2.5) contour=length(vec2((p.x+p.y)*1.7,(p.x-p.y)*.75));
        if(motif>2.5&&motif<3.5) contour=max(abs(p.x),abs(p.y))*.88+abs(p.x*p.y)*1.2;
        if(motif>3.5&&motif<4.5) contour=min(max(abs(p.x)*2.8,abs(p.y)),max(abs(p.y)*2.8,abs(p.x)));
        ${particleContours}
        float fall=1.-smoothstep(.045,.50,contour);
        float shine=pow(1.-smoothstep(.01,.22,contour),2.);
        float hot=motif>9.5?.12:motif>7.5?.65:.49;
        if (ink.a<.01) discard;gl_FragColor=vec4(mix(ink.rgb,vec3(1.,.95,.78),shine*hot),fall*fall*ink.a);}
      `,
    });
    const particles = new T.Points(geometry, material);
    particles.frustumCulled = false;
    particles.renderOrder = 100;
    this.scene.add(particles);
    return {geometry, positions, colors, radius, alpha, shape, cursor:0, items:Array.from({length:capacity}, () => ({life:0}))};
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

  spark(x, y, z, tint, count, force=1, effect, bearing) {
    const {items} = this.motes;
    color.setHex(tint);
    for (let index=0;index<count;index++) {
      const point = items[this.motes.cursor++ % items.length];
      const theta = bearing===undefined?Math.random()*PI*2:bearing+(Math.random()-.5)*2.2;
      const speed = (.8 + Math.random() * 2.4) * force;
      const life = .30 + Math.random() * .53;
      Object.assign(point,{x,y,z,dx:Math.cos(theta)*speed,dz:Math.sin(theta)*speed,dy:Math.random()*2.8+.25,life,ttl:life,
        r:color.r,g:color.g,b:color.b,size:2.8+Math.random()*8,gravity:3.5,shape:effect==='flare'?4:particleShapes[effect]??0});
    }
  }

  surgeParticles({x,z},element){
    const style=elementStyle(element);
    const watercolor=element==='water'||element==='ice';
    const count=this.mobile?17:31;
    for(let i=0;i<count;i++){
      const spread=(Math.random()-.5)*8.4;
      const tint=i%3===0?(watercolor?0xe5fdff:0xffdc9e):
        watercolor?0x70c7ee:element==='fire'?0xff8c50:this.accent;
      const lifetime=.61+Math.random()*.51;
      const point=this.motes.items[this.motes.cursor++%this.motes.items.length];
      color.setHex(tint);
      Object.assign(point,{x:x+spread,y:.06+Math.random()*.43,z:z+2+Math.random()*4,
        dx:spread*.12,dz:-.49-Math.random(),dy:2.1+Math.random()*3.7,
        life:lifetime,ttl:lifetime,r:color.r,g:color.g,b:color.b,
        size:4+Math.random()*8,gravity:watercolor?5.1:1.3,shape:style.shape});
    }
  }

  elementBurst(x,y,z,tint,element,count,power=1,bearing) {
    const limit=this.mobile?22:42;
    const remaining=Math.min(limit-this.elementBudget,this.mobile?Math.ceil(count*.68):count);
    if(remaining<=0)return;
    this.elementBudget+=remaining;
    const style=elementStyle(element);
    color.setHex(tint);
    for(let i=0;i<remaining;i++){
      this.elementSeed=(Math.imul(this.elementSeed,1664525)+1013904223)>>>0;
      const salt=this.elementSeed/4294967296;
      const angle=bearing===undefined?i*2.399+salt:bearing+(salt-.5)*1.85;
      const speed=style.speed*(.38+salt*.88)*power;
      const life=style.life*(.67+salt*.63);
      const point=this.motes.items[this.motes.cursor++%this.motes.items.length];
      Object.assign(point,{x:x+Math.cos(angle)*.18,y:y+salt*.28,z:z+Math.sin(angle)*.18,
        dx:Math.cos(angle)*speed,dz:Math.sin(angle)*speed,dy:style.lift*(.45+salt),life,ttl:life,
        r:color.r,g:color.g,b:color.b,size:style.size*(.55+salt*.75)*power,gravity:style.gravity,shape:style.shape});
    }
  }

  spellAccent(point,spec) {
    return ornamentSpell(this,point,spec);
  }

  castElements(hero,weapon,[dx,dz]) {
    const element=weapon.element??weaponElements[weapon.id]??weapon.effect;
    const angle=Math.atan2(dz,dx);
    this.elementBurst(hero.x,.20,hero.z,weapon.tone,element,18,1.18);
    this.spellAccent(hero,{action:weapon.spell?.action??baseCastLooks[weapon.id],element,tint:weapon.tone,
      radius:weapon.spell?.action==='minion'?1.64:2.06,angle,seed:weapon.sigil??spellIndex(weapon.id),power:.67});
    if(element==='water'||element==='fire')this.feedback.surge(element,hero,.64);
  }

  addEffect(geometry, position, tint, duration, settings = {}) {
    const {opacity=1, scale=1, growth=0, angle=0, blend=true, owned=false, map=null, fade=false, material} = settings;
    const mat = material??new T.MeshBasicMaterial({color:tint,map,transparent:true,opacity,depthWrite:false,side:T.DoubleSide,
      blending:blend ? T.AdditiveBlending : T.NormalBlending});
    const mesh = new T.Mesh(geometry,mat);
    mesh.position.set(position.x, position.y, position.z);
    if (map) mesh.rotation.set(-PI/2,angle,0,'YXZ');
    else mesh.rotation.y=angle;
    mesh.scale.setScalar(scale);
    mesh.renderOrder = settings.order ?? 30;
    this.scene.add(mesh);
    const fx = {mesh,ttl:duration,age:0,scale,growth,opacity,owned,fade};
    this.effects.push(fx);
    return fx;
  }

  slash(x, z, dx, dz, tint, radius, finisher,direction=1,lift=.61) {
    this.motion.slash(x,z,dx,dz,tint,radius,finisher,direction,lift);
    if (finisher) this.addEffect(this.ring,{x,y:.045,z},tint,.30,{scale:.3,growth:radius*1.25,opacity:.59});
    this.spark(x+dx*.96,.54,z+dz*.96,tint,finisher?24:12,1.12,'flare',Math.atan2(dz,dx));
  }

  shock(x,z,tint,radius,power=1) {
    this.addEffect(this.ring,{x,y:.042,z},tint,.55,{scale:.25,growth:radius,opacity:.95,order:27});
    this.addEffect(this.ring,{x,y:.15,z},0xffebcd,.36,{scale:.16,growth:radius*.76,opacity:.78,order:28});
    if (this.motion.accent()) this.addEffect(plane,{x,y:.057,z},tint,.48,
      {map:this.halo,scale:radius*.74,growth:radius*1.68,opacity:.30,order:20});
    this.spark(x,.65,z,tint,Math.floor(34*power),power);
  }

  bolt(from,to,tint,intensity=1) {
    this.motion.bolt(from,to,tint,intensity);
    this.spark(to.x,to.y,to.z,tint,intensity>1?13:5,.72,'flare');
  }

  wave(x,z,dx,dz,reach,tint,strong=false,style) {
    const point={x:x+dx*reach*.46,y:.66,z:z+dz*reach*.46};
    this.motion.wave(point,dx,dz,tint,strong,style);
    this.spark(point.x,.50,point.z,tint,strong?19:7,strong?1.28:.77,style??'feather',Math.atan2(dz,dx));
  }

  thrust(x,z,dx,dz,reach,tint,heavy) {
    const origin={x,y:.55,z};
    this.motion.thrust(origin,dx,dz,reach,tint,heavy);
    if (heavy) this.shock(x+dx*reach*.70,z+dz*reach*.70,tint,1.68,.70);
    this.spark(x+dx*reach*.78,.58,z+dz*reach*.78,tint,heavy?16:7,1.05,'flare',Math.atan2(dz,dx));
  }

  vortex(x,z,radius,tint) {
    this.motion.vortex(x,z,radius,tint);
    if (this.motion.accent()) this.sealFx(x,z,tint,radius,.57);
    this.spark(x,.46,z,tint,18,1.22);
  }

  spinningDisk(x,z,dx,dz,range,tint,curve,heavy) {
    this.motion.spinningDisk(x,z,dx,dz,range,tint,curve,heavy);
    this.spark(x,.66,z,tint,7,.64,'gold');
  }

  comboArrow(origin,dx,dz,range,tint,duration,heavy) {
    this.motion.arrow(origin,dx,dz,range,tint,duration,heavy);
    this.spark(origin.x,origin.y??.95,origin.z,tint,heavy?11:4,heavy?1.17:.67,'flare',Math.atan2(dz,dx));
  }

  comboTrail(origin,dx,dz,reach,tint,move,heavy,weapon) {
    const {x,z}=origin;
    const relic=huntById.get(weapon);
    const element=relic?.element??weaponElements[weapon];
    if(heavy)this.spellAccent(origin,{action:move.shape==='line'?'line':move.shape==='circle'?'ring':'cone',
      element,tint,radius:reach,angle:Math.atan2(dz,dx),power:.73,seed:relic?.sigil??spellIndex(weapon)});
    this.elementBurst(x+dx*Math.min(reach*.58,2),.42,z+dz*Math.min(reach*.58,2),tint,
      element,heavy?13:6,heavy?1.18:.78,Math.atan2(dz,dx));
    if (move.shape==='cleave') {
      this.motion.overhead(origin,dx,dz,reach,tint);
      this.spark(x+dx*reach*.78,.28,z+dz*reach*.78,tint,18,1.31,'fire',Math.atan2(dz,dx));
      return;
    }
    if (move.shape==='line') {
      this.thrust(x,z,dx,dz,reach,tint,heavy);
      return;
    }
    if (move.shape==='wave'||move.shape==='fan') {
      const style=weapon==='frostlute'?'ice':'fire';
      this.wave(x,z,dx,dz,reach,tint,heavy||move.pose==='wings',style);
      if (move.shape==='fan'&&this.motion.accent()) {
        for (const side of [-1,1]) {
          const angle=side*.30;
          this.wave(x-dz*side*.27,z+dx*side*.27,dx*Math.cos(angle)-dz*Math.sin(angle),
            dx*Math.sin(angle)+dz*Math.cos(angle),reach*.82,tint,false,style);
        }
      }
      return;
    }
    if (move.pose==='shell') {
      this.threatImpact({kind:'circle',x,z,radius:reach,tint,pattern:'burst',effect:'ice'});
      return;
    }
    const reverse=['return','brace','hook','backfire'].includes(move.pose)?-1:1;
    const lift=move.pose==='lift'||move.pose==='ember'?.82:.61;
    this.slash(x,z,dx,dz,tint,reach,heavy,reverse,lift);
    if (move.shape==='circle'&&this.motion.accent()) {
      this.motion.slash(x,z,-dx,-dz,tint,reach,true,reverse,.46);
    }
  }

  sealFx(x,z,tint,radius,duration=.50) {
    const seal=this.addEffect(plane,{x,y:.083,z},tint,duration,
      {map:this.battleTextures.glyph,scale:radius*1.82,growth:radius*.37,opacity:.51,order:22});
    seal.spin=-1.24;
  }

  chargeBoss(unit) {
    if(unit.visual?.bestiary?.pao)paoCastWindup(this,unit);
  }

  impact(unit,origin,kind,tint,visual=unit.visual) {
    const {x,z}=unit;
    const angle=Math.atan2(z-origin.z,x-origin.x);
    const height=(unit.spec?.height??2.68)*.48;
    const heavy=kind==='heavy';
    const shield=kind==='block'||kind==='break';
    const pao=unit.visual?.bestiary?.pao;
    this.feedback.impact(visual,kind,angle);
    const impactColor=shield?0xa7edff:tint;
    if(kind==='break'||kind==='fall')this.spellAccent(unit,{
      action:kind==='break'?'spikes':'ring',element:shield?'ice':'stone',tint:impactColor,
      radius:unit.spec?.height*.47||1.25,angle,power:.67,seed:10,
    });
    const count=kind==='break'?22:kind==='fall'?18:heavy?14:kind==='block'?6:8;
    this.spark(x,height,z,impactColor,this.mobile?Math.ceil(count*.73):count,
      kind==='break'?1.29:heavy?1.40:.89,shield?'ice':'flare',angle);
    this.elementBurst(x,height*.78,z,shield?impactColor:pao?0x7ce7e5:0xa72b45,shield||pao?'ice':'blood',
      shield||heavy||kind==='fall'?9:3,heavy?1.14:.82,angle);
    if(pao&&heavy)this.spark(x,height*1.03,z,0xe7c381,this.mobile?4:8,.95,'gold',angle);
    if (this.motion.accent()) this.motion.impact({x,y:height,z},angle,impactColor,kind);
  }

  fallDust(unit) {
    if (!this.motion.accent()) return;
    const {x,z}=unit;
    const {dx,dz}=unit.reaction;
    const size=unit.kind==='boss'?2.3:1.42;
    this.addEffect(plane,{x:x+dx*.43,y:.075,z:z+dz*.43},0xaa8c76,.43,
      {map:this.smoke,scale:size*.54,growth:size,opacity:.26,order:27,blend:false,fade:true});
    this.spark(x+dx*.37,.12,z+dz*.37,0xb79c86,this.mobile?6:10,.51,'stone');
  }

  fallingShard(x,z,radius,delay,tint,active) {
    const fx=this.addEffect(this.shardShape,{x,y:6.7,z},tint,delay,{scale:radius*.66,opacity:.47,order:34});
    fx.drop=6.7;
    fx.combatClock=true;
    fx.active=active;
  }

  bossCue(unit,phase) {
    const {x,z,spec}=unit;
    this.feedback.kick(phase==='phase'?.26:.15,.28,Math.PI*.63);
    if(phase==='phase')this.feedback.surge(spec.effect,unit,1);
    const pao=unit.visual?.bestiary?.pao;
    if(pao){
      if(phase==='entrance')pao.entranceAt=this.time;
      paoArrival(this,unit,phase);
      this.shake=Math.max(this.shake,phase==='phase'?.30:.17);
      return;
    }
    const size=phase==='defeat'?7.6:5.9+(this.stage.dread??0)*2.8;
    this.spellAccent(unit,{action:phase,element:spec.effect,tint:spec.tint,radius:size*.46,
      seed:spellIndex(spec.bestiary?.id??spec.name??phase),power:1.12});
    this.shroud=phase==='entrance'?.72:phase==='defeat'?.36:.61;
    const haze=this.addEffect(plane,{x,y:.063,z},0xffffff,phase==='entrance'?1.3:.86,
      {map:this.battleTextures.dark,blend:false,scale:size,growth:1.6,opacity:.94,order:12});
    haze.spin=-.40;
    this.addEffect(plane,{x,y:.075,z},spec.tint,1.06,{map:this.battleTextures.glyph,scale:size*.83,growth:1.34,
      opacity:.77,order:15});
    this.spark(x,.44,z,spec.tint,phase==='defeat'?38:30,1.43,spec.effect);
    if(spec.relicWeapon)this.relicPulse(spec.relicWeapon,unit,2.7,0);
    if(spec.bestiary){
      const color=spec.tint, radius=spec.height*.48;
      if(spec.effect==='lightning')this.bolt({x,y:spec.height+2,z},{x,y:.2,z},color,2.12);
      if(spec.effect==='ice'||spec.effect==='stone'){
        for(let i=0;i<4;i++){
          const a=i*PI*.5+.37;
          this.fallingShard(x+Math.cos(a)*radius,z+Math.sin(a)*radius,radius*.60,.35+i*.07,color);
        }
      }else if(spec.effect==='fire'||spec.effect==='blood'){
        this.motion.vortex(x,z,radius*1.18,color,.94);
      }else if(spec.effect==='water'||spec.effect==='wind'){
        for(let i=0;i<4;i++)this.wave(x,z,Math.cos(i*PI/2),Math.sin(i*PI/2),radius*1.5,color,true,spec.effect);
      }
      this.elementBurst(x,.48,z,color,spec.effect,phase==='phase'?24:15,1.28);
    }
    if (this.motion.accent()) {
      this.sealFx(x,z,spec.tint,size*.49,.96);
      this.motion.vortex(x,z,phase==='entrance'?2.55:3.15,spec.tint);
    }
    this.shake=Math.max(this.shake,phase==='entrance'?.21:.32);
  }

  warning(kind,x,z,radius,time,angle=0,width=0,tint=0xffb780,active) {
    const point={x,y:.049,z};
    const paint=(geometry,location,tint,settings)=>{
      const effect=this.addEffect(geometry,location,tint,time,settings);
      effect.combatClock=true;
      effect.active=active;
    };
    const shade=(geometry,settings)=>paint(geometry,point,0xde442f,
      {...settings,material:warningMaterial(),opacity:.47,order:35});
    const edge=(geometry,settings)=>paint(geometry,{...point,y:.055},0xff8c60,
      {...settings,opacity:.92,order:37});
    if (kind === 'line') {
      const fill=new T.PlaneGeometry(radius,width*2).rotateX(-PI/2);
      shade(fill,{owned:true,angle});
      edge(laneEdges(radius,width),{owned:true,angle});
      return;
    }
    if (kind==='ring') {
      shade(circle(radius,width),{owned:true});
      edge(circle(radius,.061),{owned:true});
      edge(circle(radius-width,.052),{owned:true});
      return;
    }
    if (kind==='cone') {
      const fan=new T.CircleGeometry(radius,34,-width,width*2).rotateX(-PI/2);
      shade(fan,{owned:true,angle});
      edge(new T.RingGeometry(radius-.065,radius,36,1,-width,width*2).rotateX(-PI/2),{owned:true,angle});
      return;
    }
    if (kind==='aura') {
      paint(this.ring,point,tint,{scale:radius,opacity:.73,order:37});
      return;
    }
    shade(this.disc,{scale:radius});
    edge(this.ring,{scale:radius});
  }

  threatImpact(hazard) {
    const {kind,x,z,radius,tint,width,angle,pattern,effect,owner}=hazard;
    if((kind==='circle'||kind==='ring')&&radius>=2.45&&['fire','water','ice'].includes(effect)&&
       Math.hypot(x-this.focus?.x,z-this.focus?.z)<radius+3.8){
      this.feedback.surge(effect,hazard,Math.min(.93,radius*.18));
    }
    if(owner?.visual?.bestiary?.pao&&paoStrike(this,hazard))return;
    const line=kind==='line',bearing=angle??0;
    const mark=line?{x:x-Math.cos(bearing)*radius*.5,z:z-Math.sin(bearing)*radius*.5}:{x,z};
    this.spellAccent(mark,{action:pattern==='prison'||pattern==='eclipse'?'storm':kind,element:effect,tint,
      radius,angle:bearing,seed:spellIndex(pattern??kind),power:.76});
    this.elementBurst(x,.24,z,tint,effect,kind==='cone'?13:9,Math.min(1.2,.74+radius*.08),angle);
    const point={x,y:.08,z};
    if (kind==='cone') {
      this.motion.enemyCleave(hazard);
      const count=this.mobile?3:5;
      for (let index=0;index<count;index++) {
        const sweep=angle+(index/(count-1)-.5)*width*1.64;
        this.spark(x+Math.cos(sweep)*radius*.81,.37,z+Math.sin(sweep)*radius*.81,
          tint,3,.77,effect,sweep);
      }
    } else if (kind==='line') {
      if (['lance','pounce','sweep','feathers','barrage','jaws'].includes(pattern)) {
        const dx=Math.cos(angle),dz=Math.sin(angle);
        this.motion.thrust({x:x-dx*radius*.5,y:pattern==='pounce'?.30:.55,z:z-dz*radius*.5},
          dx,dz,radius,tint,pattern==='lance'||pattern==='sweep');
      } else {
        const strip=new T.PlaneGeometry(radius,width*1.42).rotateX(-PI/2);
        this.addEffect(strip,point,tint,.25,{owned:true,angle:-angle,opacity:.32,growth:.07});
      }
      for (let i=-2;i<=2;i++) {
        const offset=i*radius*.17;
        this.spark(x+Math.cos(angle)*offset,.48,z+Math.sin(angle)*offset,tint,5,1.1,effect);
      }
    } else if (kind==='ring') {
      const band=circle(radius,width*.61);
      this.addEffect(band,point,tint,.48,{owned:true,opacity:.85,growth:.16});
      this.addEffect(circle(radius,.10),{...point,y:.18},0xffe3bf,.30,{owned:true,opacity:.85,growth:.13});
      for (let i=0;i<8;i++) {
        const theta=i*PI/4;
        this.spark(x+Math.sin(theta)*radius,.30,z+Math.cos(theta)*radius,tint,3,.63,effect);
      }
    } else if (pattern==='prison'||pattern==='eclipse') {
      this.vortex(x,z,radius,tint);
    } else {
      this.shock(x,z,tint,radius,pattern==='burst'?.92:.63);
    }
    if(pattern==='toll'&&this.motion.accent()) {
      this.sealFx(x,z,tint,radius*.82,.54);
      this.spark(x,.78,z,0xe4f5e6,this.mobile?7:12,.86,'ice');
    }
    if (effect==='ice'||effect==='root'||effect==='fire') {
      const count=kind==='line'?3:this.mobile?4:6;
      for (let index=0;index<count;index++) {
        const theta=index*PI*2/count;
        const offset=kind==='line'?(index-1)*radius*.30:radius*.54;
        const cx=x+Math.cos(kind==='line'?angle:theta)*offset;
        const cz=z+Math.sin(kind==='line'?angle:theta)*offset;
        const plume=effect==='fire'?this.motion.flame:this.shardShape;
        const spike=this.addEffect(plume,{x:cx,y:.43+(index%3)*.19,z:cz},tint,.38+index*.024,
          {scale:.44+radius*.115,growth:.31,opacity:.75,angle:theta,fade:true,order:70});
        spike.mesh.rotation.z=Math.sin(theta)*.27;
      }
    } else if (effect==='void'||effect==='web'||effect==='gold') {
      this.addEffect(plane,{...point,y:.092},tint,.56,{map:this.battleTextures.glyph,scale:Math.min(radius,4.5)*1.73,growth:.53,opacity:.61});
    }
  }

  lingeringThreat(hazard,duration) {
    const {x,z,tint,kind,width,angle,radius,residue}=hazard;
    if (kind==='line') {
      const ash=new T.PlaneGeometry(radius,width*1.64).rotateX(-PI/2);
      this.addEffect(ash,{x,y:.055,z},tint,duration,{angle:-angle,opacity:.27,owned:true});
      return;
    }
    const map=residue==='snare'?this.battleTextures.glyph:this.battleTextures.dark;
    const fx=this.addEffect(plane,{x,y:.061,z},tint,duration,
      {map,scale:radius*2.05,opacity:residue==='pull'?.78:.58,blend:residue!=='pull'});
    fx.spin=residue==='pull'?2.6:.15;
  }

  makeProjectile(x,z,tint,effect,pattern) {
    const disc=pattern==='coins';
    const profile=disc?null:projectileProfiles[pattern==='feathers'?'feather':effect];
    const geometry=disc?this.coinShape:profile?.shape??this.projectileShape;
    const dart=new T.Mesh(geometry,new T.MeshStandardMaterial({
      color:tint,emissive:tint,emissiveIntensity:disc?.39:.56,metalness:disc?.57:.16,roughness:disc?.33:.44,
    }));
    dart.userData={disc,tail:Boolean(profile)};
    if(profile)dart.scale.set(profile.stretch,profile.width,profile.width);
    const glow=new T.Sprite(new T.SpriteMaterial({map:this.halo,color:tint,opacity:.83,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
    glow.scale.setScalar(profile?.glow??.89);
    dart.add(glow);
    if (dart.userData.tail) {
      const trail=new T.Mesh(this.motion.jet,new T.MeshBasicMaterial({color:tint,side:T.DoubleSide,
        transparent:true,depthWrite:false,opacity:.42,blending:T.AdditiveBlending}));
      trail.position.set(-.54,.03,0);
      trail.scale.set(.61,.65,1.11);
      dart.add(trail);
    }
    this.scene.add(dart);
    this.moveProjectile(dart,x,z);
    return dart;
  }

  moveProjectile(dart,x,z,direction=0) {
    dart.position.set(x,.57,z);
    dart.rotation.y=dart.userData.tail?-direction:this.time*(dart.userData.disc?14:7.4);
    if(dart.userData.tail)dart.rotation.x=Math.sin(this.time*8+x*.81)*.22;
  }

  removeProjectile(dart) {
    this.scene.remove(dart);
    dart.material.dispose();
    for (const child of dart.children) child.material.dispose();
  }

  release(fx) {
    this.scene.remove(fx.mesh);
    fx.mesh.material.dispose();
    if(fx.cleanup)fx.cleanup();
    else for(const child of fx.mesh.children)child.material.dispose();
    if (fx.owned) fx.mesh.geometry.dispose();
  }

  project(x,y,z) {
    const point = new T.Vector3(x,y,z).project(this.camera);
    return {x:(point.x + 1) * .5 * this.width, y:(1 - point.y) * .5 * this.height};
  }

  render(dt, hero, paused=false, freezeWarnings=false) {
    if (!paused) this.time += dt;
    this.feedback.update(dt);
    const time = this.time;
    const darkness=this.arenaArt.arena?.darkness??0;
    if (Math.abs(darkness-this.arenaDarkness)>.006) {
      this.arenaDarkness=darkness;
      this.landscape.light(darkness);
      this.shroudElement.style.setProperty('--arena-shadow',String(darkness*.46));
    }
    if (this.shroud>0) {
      this.shroud=Math.max(0,this.shroud-dt*.72);
      this.shroudElement.style.setProperty('--omen',String(this.shroud));
    }
    if (hero) {
      this.focus.set(hero.x,1.04,hero.z);
      this.shake *= Math.exp(-dt * 12);
      const zoom=this.feedback.subdued?1:1+this.shake*.055;
      if(Math.abs(zoom-this.camera.zoom)>.0004||zoom===1&&this.camera.zoom!==1){
        this.camera.zoom=zoom;
        this.camera.updateProjectionMatrix();
      }
      this.camera.position.copy(sceneAngle).multiplyScalar(28).add(this.focus);
      const {x,y}=this.feedback.offset;
      this.camera.position.x+=x;
      this.camera.position.addScaledVector(this.cameraUp,y);
      this.camera.updateMatrixWorld();
      this.cutaway.place(hero.x,hero.z,sceneAngle);
      this.landscape.tick(time,hero,darkness,paused?0:dt);
      this.lanternArt.tick(hero,time,this.stage,dt);
      this.landscape.lanternShadows.update(this.lanternArt.light,this.arenaArt.arena?.pillars,
        this.lanternArt.route?.barricades);
      this.groveLight.update(hero,this.lanternArt,this.accent,time);
    }
    for (const [index, cloud] of this.mist.entries()) {
      cloud.position.x = (index-2)*5.4 + Math.sin(time*.27+index*2.4)*2.3;
      cloud.material.opacity = this.air.mist + darkness*.035 + Math.sin(time*.63+index)*.024;
    }
    if (this.clue.visible) {
      const {marker}=this.clue.userData;
      lightLantern(this.clue,true,time);
      marker.material.opacity=.69+.20*Math.sin(time*2.8);
      if (!paused && Math.random()<dt*9) this.spark(this.clue.position.x,.52,this.clue.position.z,0xffc586,2,.24);
    }
    this.updateEffects(dt,paused,freezeWarnings);
    this.renderParticles(paused?0:dt,!this.feedback.subdued);
    if(this.leaves.mesh.visible)this.renderLeaves(this.feedback.subdued?0:time);
    this.renderMission();
    this.arenaArt.render(time);
    this.renderer.render(this.scene,this.camera);
    this.motion.budget=0;
    this.elementBudget=0;
  }

  updateEffects(dt,paused=false,freezeWarnings=false) {
    for (let i=this.effects.length-1;i>=0;i--) {
      const fx = this.effects[i];
      const running=!paused&&!(fx.combatClock&&freezeWarnings);
      if (running) fx.age += dt;
      const age = fx.age / fx.ttl;
      if (age >= 1 || (fx.active && !fx.active())) {
        this.release(fx);
        this.effects.splice(i,1);
      } else {
        fx.mesh.scale.setScalar(fx.scale + fx.growth * (1 - (1 - age) ** 2));
        if (fx.stretchZ) fx.mesh.scale.z *= fx.stretchZ;
        if (fx.stretchY) fx.mesh.scale.y *= fx.stretchY;
        if (fx.vertical){
          const {from,to,duration}=fx.vertical;
          fx.mesh.position.y=T.MathUtils.lerp(from,to,Math.min(1,fx.age/duration));
        }
        if(running)fx.animate?.(age);
        const opacity=fx.opacity*(fx.fade?(1-age)**.83:fx.growth>0?(1-age)**1.2:.7+.3*Math.sin(age*PI*5));
        const {material}=fx.mesh;
        if (material.uniforms?.life) {
          material.uniforms.life.value=age;
          material.uniforms.opacity.value=opacity;
        } else material.opacity=opacity;
        if (fx.drop) fx.mesh.position.y=.4+fx.drop*(1-age)**1.65;
        if (running && fx.spin) fx.mesh.rotation.y+=fx.spin*dt;
        if(fx.follow){
          const orbit=fx.orbit??0;
          fx.mesh.position.x=fx.follow.x+Math.cos(this.time*3)*orbit;
          fx.mesh.position.z=fx.follow.z+Math.sin(this.time*3)*orbit;
        }
        if (running && fx.travel) {
          fx.mesh.position.x+=fx.travel.x*dt;
          fx.mesh.position.z+=fx.travel.z*dt;
        }
        if (running&&fx.drift) {
          const offset=fx.lungeAge===undefined?Math.sin(age*PI):Math.min(1,(fx.age-fx.lungeAge)*6.5);
          const change=offset-fx.drift.last;
          fx.mesh.position.x+=fx.drift.x*change;
          fx.mesh.position.z+=fx.drift.z*change;
          fx.drift.last=offset;
        }
      }
    }
  }

  renderParticles(dt,ambient=true) {
    const {items,geometry,positions,colors,radius,alpha,shape} = this.motes;
    if (ambient&&Math.random() < dt * 15) {
      const x = (Math.random() - .5) * 28;
      const z = (Math.random() - .5) * 24;
      const point = items[this.motes.cursor++ % items.length];
      const air=this.air;
      const close=Math.random()<.33;
      color.setHex(close?0xffb076:this.accent);
      Object.assign(point,{x,y:Math.random()*4+.35,z,dx:air.dx*(close?1.37:1),dz:.14,
        dy:air.dy+Math.random()*.30,life:4,ttl:4,r:color.r,g:color.g,b:color.b,
        size:(close?3.8+Math.random()*3.4:1.9+Math.random()*2.7)*air.scale,gravity:0,shape:0});
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
      const j=i*3;
      positions[j]=p.x;positions[j+1]=p.y;positions[j+2]=p.z;
      colors[j]=p.r;colors[j+1]=p.g;colors[j+2]=p.b;
      alpha[i] = Math.max(0, p.life/p.ttl) * (p.gravity ? 1 : .63);
      radius[i] = p.size * this.renderer.getPixelRatio();
      shape[i] = p.shape;
    }
    for (const attribute of Object.values(geometry.attributes)) attribute.needsUpdate = true;
  }
}
