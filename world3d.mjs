import * as T from "./three.min.mjs";
import { CharacterStage } from "./character-rig.mjs?v=inkbound";
import { DEPTH, PITCH, lanternX, profileFor, TideSet } from "./world-set.mjs?v=inkbound";
import {
  propFragment, floorFragment, floorVertex, haloFragment, matteFragment, mistFragment,
  planeVertex, ribbonFragment, shaftFragment, sigilFragment, sparksFragment, sparksVertex,
} from "./world-light.mjs?v=inkbound";

const SECOND = Math.PI * 2;
const MAX_POINTS = 420;
const RIBBON_STEPS = 36;
const lean = Math.cos(PITCH);
const bound = (n,min,max) => Math.max(min,Math.min(max,n));
const uniform = value => ({value});

function colorMaterial(fragment, tint, strength, additive = false) {
  return new T.ShaderMaterial({
    uniforms:{tint:uniform(new T.Color(tint)),strength:uniform(strength),time:uniform(0)},
    vertexShader:planeVertex,fragmentShader:fragment,transparent:true,depthWrite:false,
    blending:additive?T.AdditiveBlending:T.NormalBlending,
  });
}

function seedMotes() {
  let seed = 17882300;
  const rand = () => ((seed = (Math.imul(seed,1664525)+1013904223) >>> 0) / 4294967296);
  return Array.from({length:128}, () => ({
    x:rand(),y:rand(),phase:rand()*SECOND,speed:.18+rand()*.72,
    radius:3+rand()*13,warm:rand()<.33,
  }));
}

export class MoonlightWorld {
  static create(host, reference, getImage, palettes, contextChanged) {
    const canvas = document.createElement("canvas");
    const options = {alpha:false,antialias:false,powerPreference:"high-performance",depth:true};
    const context = canvas.getContext("webgl2",options);
    if(!context)return null;
    return new MoonlightWorld(canvas,context,options,host,reference,getImage,palettes,contextChanged);
  }
  constructor(canvas,context,options,host,reference,getImage,palettes,contextChanged) {
    this.canvas = canvas;
    this.host = host;
    this.reference = reference;
    this.getImage = getImage;
    this.palettes = palettes;
    this.textures = new Map();
    this.drawn = 0;
    this.yaw = this.pitch = this.toYaw = this.toPitch = 0;
    this.active = false;
    this.lost = false;
    this.scaleFactor = 1;
    this.location = "";
    this.props = [];
    this.ribbons = [];
    this.glyphs = [];
    this.motes = seedMotes();
    this.warmPoint = new T.Color(0xffb180);
    this.coolPoint = new T.Color(0xa7fae9);
    this.impactPoint = new T.Color();
    this.particleColor = new T.Color();
    this.position = new T.Vector3();
    this.anchor = new T.Vector3();
    this.target = new T.Vector3();
    this.canvas.className = "moonlight-canvas";
    this.canvas.hidden = true;
    this.canvas.setAttribute("aria-hidden","true");
    this.renderer = new T.WebGLRenderer({canvas,context,...options});
    this.renderer.autoClear = false;
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.setClearColor(0x121627,1);
    this.stage = new T.Scene();
    this.matte = new T.Scene();
    this.flatCamera = new T.OrthographicCamera(-1,1,1,-1,.05,4);
    this.flatCamera.position.z = 1;
    this.camera = new T.OrthographicCamera(-1,1,1,-1,1,2600);
    this.makeScene();
    host.prepend(canvas);
    canvas.addEventListener("webglcontextlost",event=>{
      event.preventDefault();
      this.lost = true;
      this.setActive(false);
      contextChanged();
    });
    canvas.addEventListener("webglcontextrestored",()=>{
      this.lost = false;
      this.width = 0;
      contextChanged();
    });
  }
  image(key) {
    if(this.textures.has(key))return this.textures.get(key);
    const source = this.getImage(key);
    const map = new T.Texture(source);
    map.colorSpace = T.SRGBColorSpace;
    if(key==="village-props"){
      map.generateMipmaps = false;
      map.minFilter = T.LinearFilter;
    }else{
      map.anisotropy = Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
    }
    map.needsUpdate = true;
    this.textures.set(key,map);
    return map;
  }
  makeScene() {
    this.plane = new T.PlaneGeometry(1,1);
    this.spriteGeometry = this.plane.clone().translate(0,.38,0);
    this.common = {
      matte:uniform(null),crop:uniform(new T.Vector2(1,1)),drift:uniform(new T.Vector2()),
      cool:uniform(this.coolPoint),warm:uniform(this.warmPoint),time:uniform(0),kind:uniform(0),
    };
    this.matte.add(new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({
      uniforms:this.common,vertexShader:planeVertex,fragmentShader:matteFragment,depthTest:false,depthWrite:false,
    })));
    this.floorUniforms = {
      ...this.common,size:uniform(new T.Vector2(1,1)),hero:uniform(new T.Vector2()),
      keyLight:uniform(new T.Vector2(0,-220)),floorStart:uniform(.35),wet:uniform(.8),
      flash:uniform(0),flashColor:uniform(this.impactPoint),orbit:uniform(0),economy:uniform(0),
    };
    this.floor = new T.Mesh(this.plane,new T.ShaderMaterial({
      uniforms:this.floorUniforms,vertexShader:floorVertex,fragmentShader:floorFragment,
      transparent:true,depthWrite:false,
    }));
    this.floor.rotation.x = -Math.PI/2;
    this.floor.renderOrder = -8;
    this.stage.add(this.floor);

    this.sky = new T.HemisphereLight(0xe2f4fb,0x6b638b,1.65);
    this.key = new T.DirectionalLight(0xffca9a,2.3);
    this.key.position.set(-260,425,-135);
    this.rim = new T.DirectionalLight(0x9ff9ed,1.35);
    this.rim.position.set(220,165,360);
    this.lanternLights = [new T.PointLight(0xffb180,4600,160,1.4),new T.PointLight(0xb5fff1,4200,165,1.4)];
    this.stage.add(this.sky,this.key,this.rim,...this.lanternLights);
    this.set = new TideSet(this.stage);

    this.mists = Array.from({length:4},(_,i)=>this.panel(mistFragment,0x9fb4cd,i===3?.35:.22,7+i));
    this.shafts = Array.from({length:3},()=>this.panel(shaftFragment,0xa6efe4,.44,0,true));
    this.flares = Array.from({length:3},()=>this.panel(haloFragment,0xc9fff4,.88,10,true));
    this.seal = this.panel(sigilFragment,0xa6efe4,.8,2,true);
    this.seal.rotation.x = -Math.PI/2;
    this.seal.scale.set(240,208,1);
    this.seal.visible = false;
    this.shadow = colorMaterial(haloFragment,0x050716,.86);
    this.characters = new CharacterStage(this.stage,this.plane,this.shadow,this.coolPoint,this.warmPoint,DEPTH);

    const geo = new T.BufferGeometry();
    for(const [name,n] of [["position",3],["tint",3],["radius",1],["alpha",1]]){
      geo.setAttribute(name,new T.BufferAttribute(new Float32Array(MAX_POINTS*n),n).setUsage(T.DynamicDrawUsage));
    }
    this.sparks = new T.Points(geo,new T.ShaderMaterial({
      uniforms:{pixelScale:uniform(1)},vertexShader:sparksVertex,fragmentShader:sparksFragment,
      transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    }));
    this.sparks.frustumCulled = false;
    this.sparks.renderOrder = 14;
    this.stage.add(this.sparks);
  }
  panel(fragment,color,strength,order,additive=false) {
    const mesh = new T.Mesh(this.plane,colorMaterial(fragment,color,strength,additive));
    mesh.renderOrder = order;
    mesh.frustumCulled = false;
    this.stage.add(mesh);
    return mesh;
  }
  setActive(active) {
    this.active = Boolean(active&&!this.lost);
    this.canvas.hidden = !this.active;
    this.host.classList.toggle("moonlight-live",this.active);
    if(!this.active)this.resetOrbit();
  }
  resize(width,height) {
    if(width===this.width&&height===this.height)return;
    this.width = width;
    this.height = height;
    const outer = this.host.getBoundingClientRect();
    const reference = this.reference.getBoundingClientRect();
    const fit = Math.min(outer.width/width,outer.height/height);
    const pixelsWide = reference.width || width*fit;
    const pixelsHigh = reference.height || height*fit;
    const left = reference.width ? reference.left-outer.left : (outer.width-pixelsWide)/2;
    const top = reference.height ? reference.top-outer.top : (outer.height-pixelsHigh)/2;
    Object.assign(this.canvas.style,{left:left+"px",top:top+"px",width:pixelsWide+"px",height:pixelsHigh+"px"});
    this.viewport = {width:pixelsWide,height:pixelsHigh};
    this.camera.left = -width/2;
    this.camera.right = width/2;
    this.camera.top = height/2;
    this.camera.bottom = -height/2;
    this.camera.updateProjectionMatrix();
    this.floor.scale.set(width*1.7,height*2.3,1);
    this.floorUniforms.size.value.set(width,height);
    this.set.layout(width);
    this.updateCrop();
    this.renderSize();
  }
  renderSize() {
    const {width,height} = this.viewport;
    const phone = width<650;
    const base = Math.min(devicePixelRatio||1,phone?1.20:1.55,Math.sqrt(1450000/(width*height)));
    this.renderer.setPixelRatio(base*this.scaleFactor);
    this.renderer.setSize(width,height,false);
    this.sparks.material.uniforms.pixelScale.value = this.renderer.getPixelRatio()*height/this.height;
  }
  updateCrop() {
    if(!this.width||!this.common.matte.value)return;
    const img = this.common.matte.value.image;
    const ratio = this.width / this.height;
    const art = img.width / img.height;
    const over = 1.065;
    this.common.crop.value.set(Math.min(1,ratio/art)/over,Math.min(1,art/ratio)/over);
  }
  dress(location, artKey) {
    this.location = location;
    const palette = this.palettes[location];
    const design = profileFor(location);
    this.common.matte.value = this.image(artKey);
    this.warmPoint.setHex(palette.warm);
    this.coolPoint.setHex(palette.cool);
    this.key.color.copy(this.warmPoint);
    this.rim.color.copy(this.coolPoint);
    this.lanternLights[0].color.copy(this.warmPoint);
    this.lanternLights[1].color.copy(this.coolPoint);
    this.floorUniforms.floorStart.value = design.floor;
    this.floorUniforms.wet.value = design.wet;
    this.floorUniforms.kind.value = location==="village"||location==="garden"?.07:design.set==="coast"?.48:.86;
    this.set.dress(location,palette);
    this.set.layout(this.width);
    this.mists.forEach((mesh,i)=>{
      const tint = mesh.material.uniforms.tint.value.setHex(palette.air);
      tint.multiplyScalar(i===3?.50:.70);
    });
    this.shafts.forEach((mesh,i)=>mesh.material.uniforms.tint.value.copy(i===0?this.warmPoint:this.coolPoint));
    this.flares.forEach((mesh,i)=>mesh.material.uniforms.tint.value.copy(i===0?this.warmPoint:this.coolPoint));
    this.updateCrop();
  }
  worldPoint(x,y,height=0,target=this.position) {
    return target.set(x-this.width*.5,height,(y-this.height*.5+height*lean)/DEPTH);
  }
  orbit(dx,dy) {
    this.toYaw = bound(this.toYaw-dx*.0058,-.47,.47);
    this.toPitch = bound(this.toPitch+dy*.0044,-.21,.21);
  }
  resetOrbit() {
    this.yaw = this.pitch = this.toYaw = this.toPitch = 0;
  }
  begin(b,art,visualTime,shakeX,shakeY,reduced,survey,dt,guardian) {
    this.resize(b.width,b.height);
    if(this.location!==b.location)this.dress(b.location,art);
    this.drawn = 0;
    const crowd=b.enemies.length>4||b.location==="village"&&b.village.rescued>1;
    this.characters.begin(dt,visualTime,reduced,b.width<650&&crowd);
    this.time = visualTime;
    this.state = b;
    this.still = reduced;
    const time = reduced?0:visualTime;
    this.common.time.value = time;
    const response = 1-Math.exp(-dt*14);
    this.yaw += (this.toYaw-this.yaw)*response;
    this.pitch += (this.toPitch-this.pitch)*response;
    const pitch = PITCH + this.pitch;
    this.target.set(shakeX,-shakeY*lean,shakeY*DEPTH);
    this.camera.position.set(Math.sin(this.yaw)*Math.cos(pitch)*1050,Math.sin(pitch)*1050,Math.cos(this.yaw)*Math.cos(pitch)*1050).add(this.target);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
    this.common.drift.value.set((reduced?0:(b.player.x/b.width-.5)*.015)+this.yaw*.044,this.pitch*.031);
    const anchor = this.worldPoint(b.player.x,b.player.y);
    this.floorUniforms.hero.value.set(anchor.x,anchor.z);
    const flare = b.effects.find(e=>e.kind==="sigil"||e.kind==="slash");
    const flash = flare ? bound(flare.left/flare.life,0,1)*.81 : b.phase==="victory"?.64:0;
    this.floorUniforms.flash.value = flash*(reduced?.46:1);
    this.floorUniforms.orbit.value = Math.abs(this.yaw)+Math.abs(this.pitch);
    this.impactPoint.setHex(flare?.color||0x83e7e0);
    this.set.update(visualTime,reduced);
    this.placeAir(b,time,flash,guardian);
    this.placeMagic(b,time);
    if(!survey&&dt>.027)this.slow=(this.slow||0)+1;
    else this.slow=Math.max(0,(this.slow||0)-1);
    if(this.slow>=12&&this.scaleFactor>.65){
      this.scaleFactor=Math.max(.65,this.scaleFactor*.84);
      this.slow=0;
      this.renderSize();
      if(this.scaleFactor<=.72){
        this.floorUniforms.economy.value=1;
        this.mists[1].visible=false;
        this.shafts[2].visible=false;
      }
    }
  }
  billboard(mesh,x,y,width,height,lift=0) {
    this.worldPoint(x,y,lift,mesh.position);
    mesh.quaternion.copy(this.camera.quaternion);
    mesh.scale.set(width,height,1);
  }
  placeAir(b,time,flash,boss) {
    const {width:w,height:h,location}=b;
    const temple = location==="temple";
    const sanctuary = profileFor(location).set==="sanctum";
    for(const [i,light] of this.lanternLights.entries()){
      this.worldPoint(w*lanternX(location,i===1),h*(profileFor(location).floor+.10),0,light.position);
      light.position.y = 53;
      light.intensity = 4500 + 750*Math.sin(time*3.3+i) + flash*850;
    }
    for(const [i,mist] of this.mists.entries()){
      const sway = Math.sin(time*.32+i*2.2)*.10;
      const x = (i===3?.51:.25+(i%2)*.49)+sway;
      const y = [.39,.53,.65,.88][i];
      this.billboard(mist,w*x,h*y,w*(i===3?1.58:1.06),i===3?168:116,18+i*11);
      mist.material.uniforms.time.value = time+i*4.4;
    }
    for(const [i,shaft] of this.shafts.entries()){
      const x = (i===2?.51:lanternX(location,i===1)+(i===0?.054:-.054))+Math.sin(time*.49+i)*.012;
      const y = [.32,.37,.25][i];
      this.billboard(shaft,w*x,h*y,Math.min(w*.8,232+i*32),330+i*30,15);
      shaft.rotateZ(i===0?-.29:i===1?.29:.075);
      shaft.material.uniforms.time.value = time+i*1.38;
      shaft.material.uniforms.strength.value = (i===2&&!sanctuary?.25:.44)+flash*.1;
    }
    for(const [i,flare] of this.flares.entries()){
      const x = i===2?.50:lanternX(location,i===1);
      const y = i===2?(temple?.372:.24):profileFor(location).floor+.055;
      const size = i===2?(temple?180:144):134;
      this.billboard(flare,w*x,h*y,size,size,28);
      flare.material.uniforms.strength.value = (i===2&&location!=="village"&&!temple?.35:.89)+Math.sin(time*2.7+i)*.09+flash*.17;
    }
    this.seal.visible = Boolean(boss);
    if(boss){
      this.worldPoint(boss.x,boss.y,2,this.seal.position);
      this.seal.material.uniforms.tint.value.setHex(boss.enraged?0xffa3aa:0xaaffed);
      this.seal.material.uniforms.time.value = time;
      this.seal.material.uniforms.strength.value = boss.enraged?.70:.45;
    }
  }
  createRibbon() {
    const geometry = new T.BufferGeometry();
    const vertices = new Float32Array((RIBBON_STEPS+1)*6);
    const uv = new Float32Array((RIBBON_STEPS+1)*4);
    const triangles = [];
    for(let i=0;i<=RIBBON_STEPS;i++){
      uv.set([i/RIBBON_STEPS,0,i/RIBBON_STEPS,1],i*4);
      if(i<RIBBON_STEPS){
        const a=i*2;
        triangles.push(a,a+1,a+2,a+1,a+3,a+2);
      }
    }
    geometry.setAttribute("position",new T.BufferAttribute(vertices,3).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute("uv",new T.BufferAttribute(uv,2));
    geometry.setIndex(triangles);
    const material = colorMaterial(ribbonFragment,0xe8ffda,.9,true);
    material.side = T.DoubleSide;
    const ribbon = new T.Mesh(geometry,material);
    ribbon.frustumCulled = false;
    ribbon.renderOrder = 13;
    this.stage.add(ribbon);
    this.ribbons.push(ribbon);
    return ribbon;
  }
  placeMagic(b,time) {
    let cuts = 0, seals = 0;
    for(const e of b.effects){
      if(e.kind==="slash"&&cuts<5){
        const ribbon = this.ribbons[cuts] || this.createRibbon();
        cuts++;
        ribbon.visible = true;
        const p = 1-bound(e.left/e.life,0,1);
        const heading = e.angle-1.28+p*.63;
        const arc = 2.22-p*.38;
        const radius = e.size*(.78+p*.25);
        const verts = ribbon.geometry.attributes.position;
        for(let i=0;i<=RIBBON_STEPS;i++){
          const f = i/RIBBON_STEPS;
          const taper = Math.pow(Math.sin(f*Math.PI),.67);
          const a = heading+arc*f;
          const outer = radius*(.87+.14*taper);
          const inner = outer-radius*(.15+.29*taper);
          for(let j=0;j<2;j++){
            const r = j?outer:inner;
            const h = 18 + taper*22 + j*(7+f*10);
            const v = this.worldPoint(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,h);
            verts.setXYZ(i*2+j,v.x,v.y,v.z);
          }
        }
        verts.needsUpdate = true;
        const uniforms = ribbon.material.uniforms;
        uniforms.tint.value.setHex(e.color);
        uniforms.strength.value = Math.pow(1-p,.69)*.92;
        uniforms.time.value = time;
      }else if(e.kind==="sigil"&&seals<4){
        let glyph = this.glyphs[seals++];
        if(!glyph){
          glyph = this.panel(sigilFragment,0xc0e8ff,1,2,true);
          glyph.rotation.x = -Math.PI/2;
          this.glyphs.push(glyph);
        }
        const p = 1-bound(e.left/e.life,0,1);
        glyph.visible = true;
        this.worldPoint(e.x,e.y,2.6,glyph.position);
        glyph.scale.setScalar(e.size*(.97+1.67*p));
        glyph.material.uniforms.tint.value.setHex(e.color);
        glyph.material.uniforms.time.value = time+p*3;
        glyph.material.uniforms.strength.value = (1-p)*.84;
      }
    }
    for(let i=cuts;i<this.ribbons.length;i++)this.ribbons[i].visible=false;
    for(let i=seals;i<this.glyphs.length;i++)this.glyphs[i].visible=false;
  }
  figure(key,kind,actor,size,weapon) {
    const scale = size*(.93+actor.y/this.height*.13);
    this.characters.draw(key,kind,actor,this.worldPoint(actor.x,actor.y),scale,weapon);
  }
  prop(x,y,frame,w,h) {
    const index = this.drawn++;
    const mesh = this.props[index] || this.newProp();
    const map = this.image("village-props");
    const frameSize = 232;
    const columns = map.image.width/frameSize, rows = map.image.height/frameSize;
    mesh.visible = true;
    this.billboard(mesh,x,y,w,h);
    const u = mesh.material.uniforms;
    const inset = .6/frameSize;
    u.atlas.value = map;
    u.cell.value.set((frame%columns+inset)/columns,1-(Math.floor(frame/columns)+1-inset)/rows,(1-2*inset)/columns,(1-2*inset)/rows);
  }
  newProp() {
    const material = new T.ShaderMaterial({
      uniforms:{
        atlas:uniform(null),cell:uniform(new T.Vector4()),tint:uniform(this.coolPoint),
      },
      vertexShader:planeVertex,fragmentShader:propFragment,transparent:true,depthWrite:false,
    });
    const mesh = new T.Mesh(this.spriteGeometry,material);
    mesh.renderOrder = 4;
    this.stage.add(mesh);
    this.props.push(mesh);
    return mesh;
  }
  writeSparks() {
    const b = this.state, time = this.still?0:this.time;
    const attributes = this.sparks.geometry.attributes;
    let count = 0;
    const put = (x,y,h,r,color,alpha)=>{
      const p = this.worldPoint(x,y,h);
      attributes.position.setXYZ(count,p.x,p.y,p.z);
      attributes.tint.setXYZ(count,color.r,color.g,color.b);
      attributes.radius.setX(count,r);
      attributes.alpha.setX(count,alpha);
      count++;
    };
    const maxMotes = this.width<620?79:this.motes.length;
    for(let i=0;i<maxMotes;i++){
      const m = this.motes[i];
      const age = (m.y + time*.051*m.speed)%1;
      const x = b.width*m.x+Math.sin(time*.86*m.speed+m.phase)*31;
      const y = b.height*(.93-age*.73);
      const hue = m.warm?this.warmPoint:this.coolPoint;
      const alpha = Math.sin(age*Math.PI)*(.24+Math.sin(time*2.1+m.phase)*.12);
      put(x,y,14+m.y*100,m.radius,hue,alpha);
    }
    for(const s of b.particles){
      if(count>=MAX_POINTS)break;
      const a = bound(s.left/s.life,0,1);
      this.particleColor.setHex(s.color);
      put(s.x,s.y,11+(1-a)*39,6+s.size*(s.dust?2.9:3.8),this.particleColor,a*(s.dust?.38:.91));
    }
    for(const bolt of b.bolts){
      if(count>=MAX_POINTS)break;
      this.particleColor.setHex(bolt.friendly?0x7bffcd:0xee87fc);
      put(bolt.x,bolt.y-17,24,bolt.friendly?34:26,this.particleColor,.69);
    }
    if(this.state.player.dash){
      const p = this.state.player;
      for(let i=0;i<8&&count<MAX_POINTS;i++){
        put(p.x-p.dash.x*i*9,p.y-p.dash.y*i*9-18,17+i*.55,26-i*2,this.coolPoint,(1-i/8)*.42);
      }
    }
    this.sparks.geometry.setDrawRange(0,count);
    for(const attribute of Object.values(attributes))attribute.needsUpdate=true;
  }
  end() {
    for(let i=this.drawn;i<this.props.length;i++)this.props[i].visible = false;
    this.characters.end();
    this.writeSparks();
    this.renderer.clear();
    this.renderer.render(this.matte,this.flatCamera);
    this.renderer.clearDepth();
    this.renderer.render(this.stage,this.camera);
  }
}
