import * as T from "../three.min.mjs";

const PI=Math.PI,TAU=PI*2;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const material=(color,roughness=.83,metalness=.06)=>new T.MeshStandardMaterial({color,roughness,metalness});
const stone=material(0x536477),darkStone=material(0x283645),bronze=material(0x806448,.47,.72);
const wax=material(0xbb8751,.82,0),flameMaterial=new T.MeshBasicMaterial({color:0xffcb74});
for(const surface of [stone,darkStone,bronze]){
  surface.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader
      .replace("#include <common>","#include <common>\nvarying vec3 hallWorld;")
      .replace("#include <begin_vertex>","#include <begin_vertex>\nhallWorld=(modelMatrix*vec4(position,1.)).xyz;");
    shader.fragmentShader=shader.fragmentShader.replace("#include <common>",`
      #include <common>
      varying vec3 hallWorld;
      float hallHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float hallNoise(vec3 p){
        vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        float a=mix(mix(hallHash(i),hallHash(i+vec3(1,0,0)),f.x),mix(hallHash(i+vec3(0,1,0)),hallHash(i+vec3(1,1,0)),f.x),f.y);
        float b=mix(mix(hallHash(i+vec3(0,0,1)),hallHash(i+vec3(1,0,1)),f.x),mix(hallHash(i+vec3(0,1,1)),hallHash(i+vec3(1,1,1)),f.x),f.y);
        return mix(a,b,f.z);
      }
    `).replace("#include <color_fragment>",`
      #include <color_fragment>
      float cloud=hallNoise(hallWorld*vec3(2.,.85,2.));
      float grit=hallNoise(hallWorld*29.);
      float seam=smoothstep(.467,.493,abs(fract(hallWorld.y*1.77+cloud*.025)-.5));
      float stain=smoothstep(.59,.87,hallNoise(hallWorld*vec3(5.,.48,5.)));
      diffuseColor.rgb*=(.66+cloud*.49+grit*.25)*(1.-seam*.36-stain*.34);
    `).replace("#include <roughnessmap_fragment>","#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+cloud*.18-.09,0.,1.);");
  };
}
const layoutRandom=()=>{
  let seed=92641;
  return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
};

function radialTexture(){
  const size=32,rgba=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const r=Math.hypot((x+.5)/size*2-1,(y+.5)/size*2-1);
    rgba.set([255,255,255,Math.round(255*Math.max(0,1-r)**2.6)],i);
  }
  const texture=new T.DataTexture(rgba,size,size);
  texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
  return texture;
}

function moonTexture(){
  const canvas=document.createElement("canvas");
  canvas.width=canvas.height=256;
  const ctx=canvas.getContext("2d"),random=layoutRandom();
  const glow=ctx.createRadialGradient(92,72,10,128,128,133);
  glow.addColorStop(0,"#f9f5d7");glow.addColorStop(.68,"#c2d6cd");glow.addColorStop(1,"#83a7af");
  ctx.fillStyle=glow;ctx.fillRect(0,0,256,256);
  for(let i=0;i<92;i++){
    const x=random()*256,y=random()*256,r=7+random()*38;
    const dust=ctx.createRadialGradient(x,y,0,x,y,r);
    dust.addColorStop(0,i%3?"#61777839":"#f0edd06a");dust.addColorStop(1,"#77859100");
    ctx.fillStyle=dust;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  const tex=new T.CanvasTexture(canvas);
  tex.colorSpace=T.SRGBColorSpace;
  return tex;
}

const floorVertex=`
  varying vec3 world;
  varying vec4 reflection;
  uniform mat4 reflectionMatrix;
  void main(){
    vec4 p=modelMatrix*vec4(position,1.);
    world=p.xyz;
    reflection=reflectionMatrix*p;
    gl_Position=projectionMatrix*viewMatrix*p;
  }
`;
const floorFragment=`
  uniform sampler2D mirror;
  uniform float time;
  varying vec3 world;
  varying vec4 reflection;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
  }
  void main(){
    vec2 p=world.xz,uv=reflection.xy/reflection.w;
    float n=noise(p*1.9);
    vec2 ripple=vec2(sin(p.y*5.+time*.72+p.x*3.+n),cos(p.x*4.+p.y*2.-time*.63+n))*.00135;
    vec3 reflect=texture2D(mirror,uv+ripple).rgb;
    vec2 tiles=p*vec2(.52,.65);
    vec2 seam=abs(fract(tiles)-.5);
    float bevel=smoothstep(.46,.495,max(seam.x,seam.y));
    float grain=noise(p*9.)*.09+noise(p*3.)*.12;
    float moon=exp(-length((p-vec2(0.,-13.))*vec2(.21,.076)));
    float gold=exp(-abs(abs(p.x)-4.9)*1.3) * (.45+.55*noise(vec2(p.y*2.,3.)));
    vec2 altar=p-vec2(0.,-5.35);
    float r=length(altar);
    float engraved=min(abs(r-4.95),abs(r-4.77));
    float ring=(1.-smoothstep(.018,.048,engraved))*(.55+grain);
    float angle=atan(altar.y,altar.x);
    float mosaic=(1.-smoothstep(.025,.057,abs(r-(4.51+.15*cos(angle*12.)))))*.67;
    vec3 base=vec3(.019,.026,.033)*(1.+grain)*(1.-bevel*.58)+vec3(.033,.065,.088)*moon*.34+vec3(.20,.078,.024)*gold*.25;
    base+=vec3(.22,.117,.049)*(ring+mosaic)*.49;
    float fresnel=1.-clamp(normalize(cameraPosition-world).y,0.,1.);
    vec3 surface=base+reflect*(.29+fresnel*.49)*(.69+n*.30)*(1.-bevel*.51);
    gl_FragColor=vec4(surface,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const mistVertex=`
  varying vec2 sampleUV;
  void main(){sampleUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
const mistFragment=`
  uniform float time;
  uniform float density;
  varying vec2 sampleUV;
  void main(){
    vec2 p=sampleUV;
    float veil=sin(p.x*12.+sin(p.y*7.-time*.16)*2.+time*.12)*.13+.87;
    float fade=pow(max(0.,1.-length((p-.5)*2.)),1.65);
    gl_FragColor=vec4(.31,.53,.65,veil*fade*density);
  }
`;

export class LanternHall {
  constructor(host){
    this.host=host;
    this.scene=new T.Scene();
    this.scene.background=new T.Color(0x0a111b);
    this.scene.fog=new T.FogExp2(0x101a2a,.023);
    this.renderer=new T.WebGLRenderer({antialias:false,powerPreference:"high-performance"});
    this.renderer.outputColorSpace=T.SRGBColorSpace;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.17;
    this.camera=new T.PerspectiveCamera(42,1,.12,95);
    this.mirrorCamera=new T.PerspectiveCamera();
    this.mirror=new T.WebGLRenderTarget(256,256,{depthBuffer:true});
    this.reflectionMatrix=new T.Matrix4();
    this.bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
    this.mirrorLook=V();
    this.focus=V(0,1.8,-6);
    this.camera.position.set(-5.9,2.25,8.8);
    this.camera.lookAt(this.focus);
    this.glow=radialTexture();
    this.shadows=[];
    this.makeRoom();
    this.makeCombatEffects();
    host.append(this.renderer.domElement);
    this.resize();
  }
  mesh(geometry,mat,x,y,z,parent=this.scene){
    const mesh=new T.Mesh(geometry,mat);
    mesh.position.set(x,y,z);parent.add(mesh);
    return mesh;
  }
  makeRoom(){
    this.scene.add(new T.HemisphereLight(0xa8c9e8,0x473026,1.22));
    this.point(0xa4d6ff,125,0,7,-13,32);
    this.point(0xffae58,62,0,2,-8,17);
    this.point(0xffad63,47,-5,1.8,4,14);
    this.point(0xffa864,37,5,1.2,6,14);
    const key=new T.DirectionalLight(0x9bd0ee,1.7);
    key.position.set(0,7,-13);this.scene.add(key);
    const floor=new T.PlaneGeometry(43,66);
    floor.rotateX(-PI/2);
    this.floor=this.mesh(floor,new T.ShaderMaterial({
      uniforms:{time:{value:0},mirror:{value:this.mirror.texture},reflectionMatrix:{value:this.reflectionMatrix}},
      vertexShader:floorVertex,fragmentShader:floorFragment,
    }),0,-.008,-4);

    const column=new T.CylinderGeometry(.35,.45,6.6,10);
    const foot=new T.CylinderGeometry(.69,.83,.24,10);
    const ring=new T.CylinderGeometry(.51,.51,.16,10);
    const wall=new T.BoxGeometry(1,1,1);
    for(const side of [-1,1]){
      const x=side*7.4;
      const cladding=this.mesh(wall,darkStone,side*9.9,2.1,-4);
      cladding.scale.set(1.8,4.2,31.5);
      for(let i=0;i<6;i++){
        const z=10.5-i*5.5;
        this.mesh(foot,darkStone,x,.12,z);
        this.mesh(foot,stone,x,.38,z).scale.setScalar(.79);
        this.mesh(column,stone,x,3.81,z);
        this.mesh(ring,bronze,x,1.0,z);
        this.mesh(ring,bronze,x,6.94,z);
        this.mesh(foot,stone,x,7.05,z).scale.setScalar(.8);
        if(i>0)this.arch(x,7.03,z+2.75,2.73,2.52,.13,PI*.5,stone);
      }
      const back=this.mesh(wall,darkStone,side*7.9,4.5,-17.3);
      back.scale.set(5.1,9,1.1);
      const organ=new T.CylinderGeometry(.125,.15,1,9);
      for(let i=0;i<9;i++){
        const h=2.4+i*.38;
        this.mesh(organ,i%2?bronze:stone,side*(2.65+i*.42),h*.5+.49,-15.9+Math.abs(i-4)*.17).scale.y=h;
      }
    }
    for(const z of [5,-6,-11.5,-17]){
      this.arch(0,7,z,7.42,5.24,.25,0,darkStone);
      this.arch(0,7,z+.14,7.19,5.04,.076,0,stone);
    }
    this.arch(0,4.2,-16.9,4.45,7,.26,0,stone);
    this.arch(0,4.2,-16.62,4.22,6.77,.11,0,bronze);
    this.makeRoseWindow();
    const stair=new T.BoxGeometry(1,1,1);
    for(let i=0;i<3;i++)this.mesh(stair,stone,0,.10+i*.10,-12.5-i*.31).scale.set(4.6-i*.24,.20,1.12);
    const altar=this.mesh(stair,darkStone,0,.53,-13.78);
    altar.scale.set(3.2,.98,1.08);
    this.mesh(stair,bronze,0,1.06,-13.78).scale.set(3.45,.11,1.23);
    this.makeCandles();
    this.makeAir();
  }
  point(color,intensity,x,y,z,distance){
    const light=new T.PointLight(color,intensity,distance,2);
    light.position.set(x,y,z);this.scene.add(light);
  }
  arch(x,y,z,r,height,thickness,turn,mat){
    const left=new T.QuadraticBezierCurve3(V(-r),V(-r,height*.56),V(0,height));
    const right=new T.QuadraticBezierCurve3(V(0,height),V(r,height*.56),V(r));
    const path=new T.CurvePath();path.add(left);path.add(right);
    const arch=this.mesh(new T.TubeGeometry(path,26,thickness,6,false),mat,x,y,z);
    arch.rotation.y=turn;
  }
  makeRoseWindow(){
    const x=0,y=7.35,z=-17.7;
    const moon=new T.MeshBasicMaterial({map:moonTexture(),color:0xd0e4e4,fog:false});
    this.mesh(new T.CircleGeometry(2.52,64),moon,x,y,z);
    const glow=new T.Sprite(new T.SpriteMaterial({map:this.glow,color:0x85c9f0,transparent:true,opacity:.47,depthWrite:false,blending:T.AdditiveBlending}));
    glow.position.set(x,y,z-.04);glow.scale.set(11,11,1);this.scene.add(glow);
    const iron=material(0x263847,.66,.65);
    for(const [r,w] of [[2.52,.14],[2.31,.058],[1.62,.062],[.53,.075]]){
      this.mesh(new T.TorusGeometry(r,w,8,56),iron,x,y,z+.21);
    }
    const tracery=new T.TorusGeometry(.57,.042,6,24);
    const spoke=new T.BoxGeometry(.043,2.0,.067);
    for(let i=0;i<10;i++){
      const theta=i*TAU/10;
      this.mesh(tracery,iron,x+Math.sin(theta)*1.21,y+Math.cos(theta)*1.21,z+.24);
      this.mesh(spoke,iron,x+Math.sin(theta)*1.39,y+Math.cos(theta)*1.39,z+.26).rotation.z=-theta;
    }
  }
  makeCandles(){
    const random=layoutRandom();
    const placements=[];
    for(let i=0;i<108;i++){
      const side=i%2?1:-1;
      const x=side*(2.65+random()*4.25),z=10.4-random()*25;
      placements.push({x,z,h:.08+random()*.19,phase:random()*TAU});
    }
    for(let i=0;i<22;i++)placements.push({x:(random()-.5)*6.6,z:-10.3-random()*2,h:.1+random()*.16,phase:random()*TAU});
    this.candles=placements;
    const waxes=new T.InstancedMesh(new T.CylinderGeometry(.045,.056,1,6),wax,placements.length);
    this.flames=new T.InstancedMesh(new T.SphereGeometry(.055,5,5),flameMaterial,placements.length);
    this.flames.frustumCulled=false;
    this.stand=new T.Object3D();
    this.scene.add(waxes,this.flames);
    const lightPositions=new Float32Array(placements.length*3);
    for(const [i,c] of placements.entries()){
      this.stand.position.set(c.x,c.h*.5,c.z);
      this.stand.scale.set(1,c.h,1);this.stand.updateMatrix();waxes.setMatrixAt(i,this.stand.matrix);
      lightPositions.set([c.x,c.h+.048,c.z],i*3);
    }
    const lightGeometry=new T.BufferGeometry();
    lightGeometry.setAttribute("position",new T.BufferAttribute(lightPositions,3));
    this.scene.add(new T.Points(lightGeometry,new T.PointsMaterial({
      map:this.glow,color:0xf4a44e,opacity:.67,size:.71,transparent:true,blending:T.AdditiveBlending,depthWrite:false,
    })));
    this.updateCandles(0);
  }
  makeAir(){
    const random=layoutRandom(),data=new Float32Array(3*92);
    for(let i=0;i<data.length;i+=3){
      data[i]=(random()-.5)*17;
      data[i+1]=.4+random()*8;
      data[i+2]=12-random()*35;
    }
    const points=new T.BufferGeometry();
    points.setAttribute("position",new T.BufferAttribute(data,3));
    this.ash=new T.Points(points,new T.PointsMaterial({
      color:0xaad0e0,map:this.glow,transparent:true,opacity:.61,size:.062,depthWrite:false,blending:T.AdditiveBlending,
    }));
    this.scene.add(this.ash);
    this.veils=Array.from({length:3},(_,i)=>{
      const veil=this.mesh(new T.PlaneGeometry(20,3.1),new T.ShaderMaterial({
        uniforms:{time:{value:0},density:{value:.25+i*.048}},vertexShader:mistVertex,fragmentShader:mistFragment,
        transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
      }),0,.7,-2-i*5.2);
      return veil;
    });
  }
  async addActors(){
    const loader=new T.TextureLoader();
    const [cat,enemy]=await Promise.all([loader.loadAsync("../cast.png"),loader.loadAsync("../tide-cast.png")]);
    cat.colorSpace=enemy.colorSpace=T.SRGBColorSpace;
    this.hero=this.actor(cat,4,3,1.61,0);
    this.boss=this.actor(enemy,3,2,4.15,2);
    this.hero.mesh.position.set(0,0,4.4);
    this.boss.mesh.position.set(0,0,-6.65);
  }
  actor(atlas,columns,rows,size,frame){
    const geometry=new T.PlaneGeometry(1,1).translate(0,.385,0);
    const mat=new T.MeshBasicMaterial({map:atlas,side:T.DoubleSide,transparent:true,alphaTest:.09,forceSinglePass:true});
    const mesh=this.mesh(geometry,mat,0,0,0);
    mesh.scale.set(size,size,1);
    const shadow=this.mesh(new T.PlaneGeometry(size*.86,size*.62),new T.MeshBasicMaterial({map:this.glow,color:0x030508,transparent:true,opacity:.92,depthWrite:false}),0,.012,0);
    shadow.rotation.x=-PI/2;
    const actor={mesh,atlas,shadow,columns,rows,size,frame:-1};
    this.frame(actor,frame);
    return actor;
  }
  frame(actor,frame){
    if(actor.frame===frame)return;
    actor.frame=frame;
    const {atlas,columns,rows}=actor;
    const inset=.55/256;
    atlas.repeat.set((1-inset*2)/columns,(1-inset*2)/rows);
    atlas.offset.set((frame%columns+inset)/columns,1-(Math.floor(frame/columns)+1-inset)/rows);
  }
  pose(actor,position,face,frame,scaleX,scaleY,tilt,bob,flash){
    this.frame(actor,frame);
    const {mesh,shadow,size}=actor;
    mesh.position.set(position.x,bob,position.z);
    mesh.rotation.set(0,Math.atan2(this.camera.position.x-position.x,this.camera.position.z-position.z),0);
    mesh.rotateZ(tilt);
    mesh.scale.set(size*scaleX*face,size*scaleY,1);
    mesh.material.color.setHex(flash?0xffa077:0xffffff);
    shadow.position.set(position.x,.013,position.z);
  }
  makeCombatEffects(){
    const flatRing=(inner,outer,arc=TAU)=>{
      const geometry=new T.RingGeometry(inner,outer,48,1,-arc*.5,arc);
      geometry.rotateX(-PI/2);
      return geometry;
    };
    const effect=(geometry,color)=>this.mesh(geometry,new T.MeshBasicMaterial({
      color,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,blending:T.AdditiveBlending,
    }),0,.025,0);
    this.warning=effect(flatRing(.93,1),0xffa649);
    this.warningFill=effect(flatRing(0,1),0xfb512b);
    const lane=new T.PlaneGeometry(1,1).rotateX(-PI/2);
    this.lane=effect(lane,0xff7a42);
    this.arc=effect(flatRing(.72,1,1.90),0xfec888);
    this.pulse=effect(flatRing(.87,1),0x8cf6e8);
    this.hit=effect(flatRing(.77,1),0xffab70);
  }
  warningAt(w,time){
    for(const mesh of [this.warning,this.warningFill,this.lane])mesh.visible=Boolean(w);
    if(!w)return;
    const progress=clamp(1-w.left/w.total,0,1);
    const alpha=.27+progress*.37+Math.sin(time*27)*.09;
    const lane=w.type==="line";
    this.warning.visible=this.warningFill.visible=!lane;
    this.lane.visible=lane;
    if(lane){
      this.lane.position.set(w.x+w.dx*w.length*.5,.019,w.z+w.dz*w.length*.5);
      this.lane.scale.set(w.length,1,w.radius*(1.6+progress*.4));
      this.lane.rotation.y=-Math.atan2(w.dz,w.dx);
      this.lane.material.opacity=alpha*.57;
      return;
    }
    this.warning.position.set(w.x,.024,w.z);
    this.warningFill.position.set(w.x,.02,w.z);
    this.warning.scale.set(w.radius,1,w.radius);
    const inner=w.radius*(.16+progress*.84);
    this.warningFill.scale.set(inner,1,inner);
    this.warning.material.opacity=alpha;
    this.warningFill.material.opacity=alpha*.32;
  }
  effectAt(mesh,e){
    mesh.visible=Boolean(e);
    if(!e)return;
    const p=clamp(e.left/e.total,0,1);
    mesh.position.set(e.x,e.lift??.055,e.z);
    const scale=e.radius*(.71+(1-p)*.46);
    mesh.scale.set(scale,1,scale);
    mesh.rotation.y=-(e.angle||0);
    mesh.material.opacity=p*.93;
  }
  updateCandles(time){
    for(const [i,c] of this.candles.entries()){
      const f=.83+Math.sin(time*7+c.phase)*.15+Math.sin(time*13+c.phase*3)*.09;
      this.stand.position.set(c.x+.009*Math.sin(time*4+c.phase),c.h+.045,c.z);
      this.stand.scale.set(.47,f,.47);this.stand.updateMatrix();this.flames.setMatrixAt(i,this.stand.matrix);
    }
    this.flames.instanceMatrix.needsUpdate=true;
  }
  resize(){
    const w=this.host.clientWidth,h=this.host.clientHeight;
    if(!w||!h)return;
    this.phone=w<720;
    this.width=w;this.height=h;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.phone?1.2:1.5,Math.sqrt(1500000/(w*h))));
    this.renderer.setSize(w,h,false);
    this.camera.aspect=w/h;
    this.camera.fov=this.phone?58:44;
    this.camera.updateProjectionMatrix();
    const reflectionScale=this.phone?.53:.56;
    this.mirror.setSize(Math.min(670,Math.max(136,Math.round(w*reflectionScale))),Math.min(440,Math.max(130,Math.round(h*reflectionScale))));
    this.mirrorCamera.copy(this.camera);
    this.reflectAt=-1;
  }
  reflect(){
    const cam=this.mirrorCamera,real=this.camera;
    cam.position.copy(real.position);cam.position.y*=-1;
    this.mirrorLook.copy(this.focus);this.mirrorLook.y*=-1;
    cam.up.set(0,-1,0);cam.lookAt(this.mirrorLook);
    cam.updateMatrixWorld();
    this.reflectionMatrix.copy(this.bias).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
    this.floor.visible=false;
    this.renderer.setRenderTarget(this.mirror);
    this.renderer.render(this.scene,cam);
    this.renderer.setRenderTarget(null);
    this.floor.visible=true;
  }
  draw(time,still){
    if(this.width!==this.host.clientWidth||this.height!==this.host.clientHeight)this.resize();
    if(!this.width)return;
    const motion=still?0:time;
    this.floor.material.uniforms.time.value=motion;
    this.ash.position.set(Math.sin(motion*.12)*.53,Math.sin(motion*.19)*.23,0);
    for(const [i,v] of this.veils.entries()){
      v.position.x=Math.sin(motion*.19+i)*2.2;
      v.material.uniforms.time.value=motion+i*2;
    }
    if(!still)this.updateCandles(motion);
    if(time-this.reflectAt>=1/(this.phone?23:31)){
      this.reflect();this.reflectAt=time;
    }
    this.renderer.render(this.scene,this.camera);
  }
}
