import * as T from "./three.min.mjs";
import { profileFor } from "./world-set.mjs?v=guild";
import { planeVertex, haloFragment, shaftFragment } from "./world-light.mjs?v=inkbound";

const TAU=Math.PI*2,PI=Math.PI;
const uniform=value=>({value});
const color=value=>new T.Color(value);
const randomFor=name=>{
  let state=2166136261;
  for(const character of name)state=Math.imul(state^character.charCodeAt(0),16777619);
  return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
};
const looks={
  harbor:{structure:"timber",ground:0,sky:0x172337},
  coast:{structure:"rock",ground:2,sky:0x182138},
  crystal:{structure:"crystal",ground:2,sky:0x1d233e},
  sanctum:{structure:"arch",ground:1,sky:0x171c31},
  vault:{structure:"vault",ground:1,sky:0x231b29},
  ruin:{structure:"arch",ground:1,sky:0x172339},
  grove:{structure:"tree",ground:2,sky:0x1c2331},
};
const groundVertex=`
  varying vec3 ground;
  varying vec4 mirrored;
  uniform mat4 mirrorMatrix;
  void main(){
    vec4 world=modelMatrix*vec4(position,1.);
    ground=world.xyz;mirrored=mirrorMatrix*world;
    gl_Position=projectionMatrix*viewMatrix*world;
  }
`;
const groundFragment=`
  uniform sampler2D mirror;
  uniform float time;
  uniform float wet;
  uniform float tileKind;
  uniform float quality;
  uniform float flash;
  uniform vec3 base;
  uniform vec3 cool;
  uniform vec3 warm;
  uniform vec3 impact;
  uniform vec2 hero;
  uniform vec2 limits;
  uniform float rear;
  varying vec3 ground;
  varying vec4 mirrored;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
  }
  void main(){
    vec2 p=ground.xz;
    float n=noise(p*.018),grain=noise(p*.095);
    vec2 tiles=p/(tileKind<.5?vec2(42.,142.):vec2(107.,82.));
    tiles.x+=floor(tiles.y)*.5;
    tiles+=(n-.5)*(tileKind>1.5?.27:.10);
    vec2 edge=abs(fract(tiles)-.5);
    float bevel=smoothstep(.458,.494,max(edge.x,edge.y));
    float groundPattern=(.64+hash(floor(tiles))*.31+n*.23+grain*.15)*(1.-bevel*(tileKind>1.5?.26:.53));
    vec2 uv=mirrored.xy/max(.001,mirrored.w);
    vec2 ripple=vec2(sin(p.y*.075+time*.82+p.x*.033+n),cos(p.x*.063+p.y*.029-time*.67+n))*.0015;
    vec2 mask=smoothstep(vec2(.0),vec2(.025),uv)*(1.-smoothstep(vec2(.975),vec2(1.),uv));
    vec3 reflected=texture2D(mirror,uv+ripple).rgb*mask.x*mask.y;
    float fresnel=1.-clamp(normalize(cameraPosition-ground).y,0.,1.);
    float puddle=(.24+smoothstep(.23,.75,n)*.58)*wet;
    float lamplight=exp(-abs(abs(p.x)-limits.x-29.)/69.)*(.32+.68*noise(vec2(p.y*.023,1.)));
    float backlight=exp(-length((p-vec2(0.,rear))*vec2(.0029,.0017)));
    float nearHero=exp(-length((p-hero)*vec2(.010,.009)));
    float border=1.-smoothstep(0.,1.5,abs(abs(p.x)-limits.x));
    vec3 c=base*groundPattern*.14+cool*backlight*.051+warm*lamplight*.072;
    c+=reflected*(.22+fresnel*.66)*puddle*(1.-bevel*.43)*quality;
    c+=mix(cool,warm,.28)*(puddle*.024+border*.024)+impact*nearHero*flash*.17;
    float rim=exp(-length((p-hero)*.008));
    c+=cool*rim*.024;
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const backgroundFragment=`
  varying vec2 panel;
  uniform sampler2D art;
  uniform vec3 sky;
  uniform vec3 cool;
  void main(){
    vec2 uv=vec2(panel.x,.59+panel.y*.40);
    vec3 picture=texture2D(art,uv).rgb;
    float mask=smoothstep(.02,.33,panel.y)*smoothstep(.00,.16,panel.x)*smoothstep(.0,.16,1.-panel.x);
    gl_FragColor=vec4(mix(sky,picture*.46+cool*.025,mask),1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function stoneSurface(tint,roughness,metalness=0){
  const material=new T.MeshStandardMaterial({color:tint,roughness,metalness});
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 inkPoint;")
      .replace("#include <begin_vertex>",`
        #include <begin_vertex>
        vec4 gritPoint=vec4(position,1.);
        #ifdef USE_INSTANCING
          gritPoint=instanceMatrix*gritPoint;
        #endif
        inkPoint=(modelMatrix*gritPoint).xyz;
      `);
    shader.fragmentShader=shader.fragmentShader.replace("#include <common>",`
      #include <common>
      varying vec3 inkPoint;
      float grainHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    `).replace("#include <color_fragment>",`
      #include <color_fragment>
      float grain=grainHash(floor(inkPoint*.44));
      float broad=grainHash(floor(inkPoint*.026));
      float band=smoothstep(.455,.492,abs(fract(inkPoint.y*.049+grain*.025)-.5));
      diffuseColor.rgb*=(.72+broad*.31+grain*.19)*(1.-band*.28);
    `);
  };
  return material;
}

function radialTexture(){
  const size=32,rgba=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const r=Math.hypot((x+.5)*2/size-1,(y+.5)*2/size-1);
    rgba.set([255,255,255,Math.round(255*Math.max(0,1-r)**2.2)],(y*size+x)*4);
  }
  const tex=new T.DataTexture(rgba,size,size);
  tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearFilter;tex.needsUpdate=true;
  return tex;
}

export class CourtStage{
  constructor(scene,renderer){
    Object.assign(this,{scene,renderer});
    this.scenery=new T.Group();scene.add(this.scenery);
    this.stone=stoneSurface(0x4e5165,.86);
    this.trim=stoneSurface(0x8f705e,.53,.39);
    this.dark=stoneSurface(0x303b4a,.94);
    this.glass=new T.MeshStandardMaterial({roughness:.38,metalness:.18,emissiveIntensity:.24});
    this.flame=new T.MeshBasicMaterial({color:0xffd99a});
    this.window=new T.MeshBasicMaterial({color:0xa9d4df});
    this.lead=new T.MeshBasicMaterial({color:0x192536});
    this.wax=stoneSurface(0xd4945b,.78);
    this.glow=radialTexture();
    this.parts={
      cube:new T.BoxGeometry(1,1,1),
      drum:new T.CylinderGeometry(.5,.5,1,10),
      column:new T.CylinderGeometry(.4,.51,1,10),
      stone:new T.DodecahedronGeometry(.61,0),
      crystal:new T.OctahedronGeometry(.63,0),
      flame:new T.SphereGeometry(.5,5,5),
      rim:new T.TorusGeometry(.5,.042,7,40),
      disk:new T.CircleGeometry(.5,48),
    };
    const curve=new T.CurvePath();
    curve.add(new T.QuadraticBezierCurve3(new T.Vector3(-.5,0,0),new T.Vector3(-.5,.32,0),new T.Vector3(0,.5,0)));
    curve.add(new T.QuadraticBezierCurve3(new T.Vector3(0,.5,0),new T.Vector3(.5,.32,0),new T.Vector3(.5,0,0)));
    this.parts.arch=new T.TubeGeometry(curve,25,.017,6,false);
    this.form=new T.Object3D();
    this.target=new T.WebGLRenderTarget(200,160,{depthBuffer:true});
    this.reflectionMatrix=new T.Matrix4();
    this.bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
    this.mirrorCamera=new T.PerspectiveCamera();
    this.mirrorLook=new T.Vector3();
    const floor=new T.PlaneGeometry(1,1).rotateX(-PI/2);
    this.groundUniforms={
      mirror:uniform(this.target.texture),mirrorMatrix:uniform(this.reflectionMatrix),time:uniform(0),wet:uniform(.6),tileKind:uniform(1),
      quality:uniform(1),flash:uniform(0),base:uniform(color(0x4e5165)),cool:uniform(color(0x87d2ed)),warm:uniform(color(0xffad72)),
      impact:uniform(color(0xffffff)),hero:uniform(new T.Vector2()),limits:uniform(new T.Vector2()),rear:uniform(0),
    };
    this.floor=new T.Mesh(floor,new T.ShaderMaterial({uniforms:this.groundUniforms,vertexShader:groundVertex,fragmentShader:groundFragment}));
    this.floor.position.y=-1.5;
    scene.add(this.floor);
    this.skyUniforms={art:uniform(null),sky:uniform(color(0x101a2a)),cool:uniform(color(0x8ed4ee))};
    this.back=new T.Mesh(new T.PlaneGeometry(1,1),new T.ShaderMaterial({
      uniforms:this.skyUniforms,vertexShader:planeVertex,fragmentShader:backgroundFragment,
    }));
    scene.add(this.back);
    this.sun=new T.DirectionalLight(0x8ccbdc,2.1);
    this.sun.position.set(-170,290,-450);
    this.sky=new T.HemisphereLight(0x91b6d2,0x453139,1.45);
    scene.add(this.sun,this.sky);
    this.lamps=[new T.PointLight(0xffb46f,15500,470,2),new T.PointLight(0xffb46f,15500,470,2)];
    scene.add(...this.lamps);
    this.flicker=new T.PointLight(0xfac38e,0,300,2);
    scene.add(this.flicker);
    this.halos=[];
    for(let i=0;i<3;i++){
      const shader=new T.ShaderMaterial({
        uniforms:{tint:uniform(color(0x93c6ee)),strength:uniform(.45),time:uniform(0)},
        vertexShader:planeVertex,fragmentShader:i===0?haloFragment:shaftFragment,
        transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,forceSinglePass:true,
      });
      const mesh=new T.Mesh(new T.PlaneGeometry(1,1),shader);
      scene.add(mesh);this.halos.push(mesh);
    }
    this.glows=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({
      map:this.glow,color:0xffa459,transparent:true,opacity:.65,size:40,depthWrite:false,blending:T.AdditiveBlending,
    }));
    scene.add(this.glows);
  }
  put(part,mat,x,y,z,sx,sy,sz,ry=0,rz=0){
    const key=part+":"+mat.id;
    if(!this.pending.has(key))this.pending.set(key,{part,mat,matrix:[]});
    this.form.position.set(x,y,z);this.form.scale.set(sx,sy,sz);this.form.rotation.set(0,ry,rz);this.form.updateMatrix();
    this.pending.get(key).matrix.push(this.form.matrix.clone());
  }
  column(x,z,h,wood=false){
    const foot=wood?"cube":"drum";
    this.put(foot,this.dark,x,9,z,72,19,66);
    this.put(foot,this.stone,x,22,z,61,12,55);
    this.put(wood?"cube":"column",this.stone,x,h*.52,z,35,h*.86,35);
    for(const y of [41,h*.86,h*.96])this.put(foot,this.trim,x,y,z,44,7,44);
    this.put(foot,this.stone,x,h,z,62,19,57);
  }
  candle(x,z,h){
    this.put("drum",this.trim,x,2,z,14,4,14);
    this.put("drum",this.wax,x,3+h*.5,z,7,h,7);
    this.put("flame",this.flame,x,h+9,z,6,15,6);
    this.flarePositions.push(x,h+9,z);
  }
  decorate(id,width,near,far,palette,art){
    const profile=profileFor(id),look=looks[profile.set];
    const random=randomFor(id);
    for(const mesh of [...this.scenery.children]){this.scenery.remove(mesh);mesh.dispose();}
    this.pending=new Map();this.flarePositions=[];
    this.stone.color.setHex(profile.stone).multiplyScalar(1.16);
    this.dark.color.setHex(profile.stone).multiplyScalar(.48);
    this.trim.color.setHex(profile.steel);
    this.glass.color.setHex(palette.cool).multiplyScalar(.73);
    this.glass.emissive.setHex(palette.cool);
    this.window.color.setHex(palette.cool).lerp(color(0xffecd2),.33).multiplyScalar(.73);
    this.lead.color.setHex(look.sky).multiplyScalar(.78);
    this.glows.material.color.setHex(palette.warm);
    this.sun.color.setHex(palette.cool);
    this.sky.color.setHex(palette.air);this.sky.groundColor.setHex(palette.warm).multiplyScalar(.23);
    for(const lamp of this.lamps)lamp.color.setHex(palette.warm);
    this.fog=new T.FogExp2(look.sky,.00107);this.scene.fog=this.fog;
    this.scene.background=this.fog.color;
    const u=this.groundUniforms;
    u.base.value.setHex(profile.stone);u.cool.value.setHex(palette.cool);u.warm.value.setHex(palette.warm);
    u.wet.value=.34+profile.wet*.66;u.tileKind.value=look.ground;u.limits.value.set(width*.5,near);u.rear.value=far;
    this.floor.scale.set(Math.max(width*4,2350),1,2700);this.floor.position.z=(near+far)*.5;
    this.skyUniforms.art.value=art;this.skyUniforms.sky.value.copy(this.fog.color);this.skyUniforms.cool.value.setHex(palette.cool);
    this.back.position.set(0,422,far-470);this.back.scale.set(Math.max(2200,width*3),990,1);
    const boundary=width*.5+65,depth=near-far;
    const type=id==="sea-reef"?"rock":id==="sea-hall"?"timber":look.structure;
    const h=profile.set==="sanctum"?249:profile.set==="ruin"?191:172;
    for(const side of [-1,1]){
      for(let i=0;i<5;i++){
        const z=far-40+i*(depth+135)/4;
        const x=side*(boundary+(i%2)*24);
        if(type==="arch"||type==="vault"||type==="timber"){
          this.column(x,z,h-(i%3)*11,type==="timber");
          if(i>0){
            const span=(depth+135)/4;
            if(type==="arch")this.put("arch",this.stone,x,h-13,z-span*.5,span,Math.min(184,span*.72),52,PI*.5);
            else this.put("cube",this.trim,x,h-4,z-span*.5,21,16,span+20);
            if(type==="vault")for(let shelf=0;shelf<3;shelf++){
              this.put("cube",this.dark,x+side*15,35+shelf*31,z-span*.49,60,6,span*.76);
              for(let j=0;j<4;j++)this.put("cube",this.trim,x+side*9,46+shelf*31,z-span*.79+j*21,23,18,10+random()*7);
            }
          }
          if(type==="timber")this.put("cube",this.dark,x+side*35,34,z,82,63,55,side*.17);
        }else{
          const tree=type==="tree",ice=type==="crystal";
          this.put("stone",this.dark,x,16,z,125,46,81,random()*TAU);
          for(let j=0;j<4;j++){
            const height=42+random()*(tree?188:ice?124:93);
            const px=x+side*(j*22+13),pz=z+(j-1.5)*30;
            const shape=tree?"column":ice?"crystal":"stone";
            this.put(shape,ice&&j%3!==0?this.glass:this.stone,px,height*.42,pz,25+random()*26,height,21+random()*20,random()*TAU,side*(.04+j*.13));
            if(tree){
              this.put("column",this.trim,px+side*20,height*.66,pz,11,height*.51,11,0,-side*.68);
              this.put("stone",this.dark,px+side*24,height*.89,pz,80,37,72);
            }
          }
        }
      }
      const count=22;
      for(let i=0;i<count;i++){
        const z=far-48+(i+random())*(depth+127)/count;
        const x=side*(width*.5-10+random()*49);
        this.candle(x,z,6+random()*16);
      }
    }
    if(type==="arch"||type==="vault"||type==="timber"){
      for(const z of [far-65,far-205]){
        if(type==="arch")this.put("arch",this.stone,0,h-7,z,boundary*2,Math.min(355,boundary*1.1),79);
        else this.put("cube",this.trim,0,h-9,z,boundary*2+100,20,29);
      }
      const distance=far-249;
      for(const side of [-1,1]){
        const columnX=side*Math.min(boundary*.48,154);
        this.column(columnX,distance,166,type==="timber");
        this.put("cube",this.dark,side*(Math.abs(columnX)+boundary*.65),112,distance-15,boundary*1.18,225,37);
        this.put("cube",this.trim,side*(Math.abs(columnX)+boundary*.65),57,distance+5,boundary*1.18,7,14);
        if(type==="arch")for(let i=0;i<4;i++){
          const x=columnX+side*(38+i*38);
          this.put("column",i%2?this.dark:this.trim,x,107+i*8,distance+8,14,181+i*11,13);
        }
      }
      if(type==="arch"){
        const span=Math.min(boundary*.98,313);
        this.put("arch",this.stone,0,158,distance,span,157,68);
        this.put("arch",this.trim,0,160,distance+6,span-12,146,34);
      }
    }
    if(type==="arch"&&profile.set==="sanctum"){
      const center=281,z=far-240;
      this.put("disk",this.window,0,center,z,219,219,1);
      this.put("rim",this.lead,0,center,z+3,220,220,37);
      this.put("rim",this.lead,0,center,z+4,145,145,24);
      for(let i=0;i<10;i++){
        const angle=i*TAU/10;
        this.put("rim",this.lead,Math.sin(angle)*59,center+Math.cos(angle)*59,z+5,53,53,16);
        this.put("cube",this.lead,Math.sin(angle)*47,center+Math.cos(angle)*47,z+6,3.8,99,2,0,-angle);
      }
    }
    const outside=type==="rock"||type==="tree"||type==="crystal";
    if(outside){
      for(let i=0;i<8;i++){
        const height=65+random()*111;
        this.put(type==="crystal"?"crystal":"stone",i%3===0?this.glass:this.stone,(i-3.5)*width*.17,height*.34,far-125-random()*51,
          72+random()*40,height,69,random()*TAU,(i-3.5)*.08);
      }
    }else{
      this.put("cube",this.dark,0,8,far-70,Math.min(230,width*.69),16,102);
      this.put("cube",this.trim,0,21,far-91,Math.min(169,width*.48),12,79);
      this.put("rim",this.trim,0,120,far-111,114,117,89);
      this.put("crystal",this.glass,0,120,far-110,42,68,36,.17,-.11);
      this.flarePositions.push(0,120,far-108);
    }
    for(let i=0;i<9;i++)this.candle((i-4)*23,far-30-random()*33,9+random()*20);
    for(const {part,mat,matrix} of this.pending.values()){
      const mesh=new T.InstancedMesh(this.parts[part],mat,matrix.length);
      matrix.forEach((m,i)=>mesh.setMatrixAt(i,m));
      this.scenery.add(mesh);
    }
    this.pending=null;
    this.glows.geometry.dispose();
    this.glows.geometry=new T.BufferGeometry().setAttribute("position",new T.Float32BufferAttribute(this.flarePositions,3));
    for(const [i,lamp] of this.lamps.entries())lamp.position.set((i?1:-1)*(width*.5-20),99,far+depth*(i?.68:.25));
    this.halos[0].position.set(0,outside?83:125,far-110);
    this.halos[0].scale.set(235,242,1);
    this.halos[0].material.uniforms.tint.value.setHex(palette.cool);
    for(let i=1;i<=2;i++){
      const side=i===1?-1:1,mesh=this.halos[i];
      mesh.position.set(side*boundary*.51,168,far-78-i*49);
      mesh.scale.set(248,355,1);
      mesh.rotation.z=side*.27;
      mesh.material.uniforms.tint.value.setHex(i===1?palette.cool:palette.warm);
    }
  }
  resize(w,h,phone,economy){
    const f=economy?.27:phone?.40:.52;
    this.target.setSize(Math.min(540,Math.max(122,Math.round(w*f))),Math.min(352,Math.max(116,Math.round(h*f))));
    this.groundUniforms.quality.value=economy?.62:1;
    this.reflectedAt=-Infinity;
  }
  update(time,position,flash,impact,still,economy){
    const motion=still?0:time;
    const u=this.groundUniforms;
    u.time.value=motion;u.hero.value.set(position.x,position.z);
    u.impact.value.setHex(impact);u.flash.value=flash;
    this.glows.material.opacity=.64+Math.sin(motion*6)*.052;
    for(const [i,lamp] of this.lamps.entries())lamp.intensity=23400+Math.sin(motion*4+i*2)*2700;
    this.flicker.position.set(position.x,60,position.z);
    this.flicker.color.copy(u.impact.value);this.flicker.intensity=flash*16500;
    for(const [i,mesh] of this.halos.entries()){
      mesh.visible=i!==2||!economy;
      mesh.material.uniforms.time.value=motion+i*3;
      mesh.material.uniforms.strength.value=(i?.46:.59)+Math.sin(motion*2.8+i)*.055;
    }
  }
  reflect(camera,focus,time,frequency){
    if(time-this.reflectedAt<1/frequency)return;
    const mirror=this.mirrorCamera;
    mirror.projectionMatrix.copy(camera.projectionMatrix);
    mirror.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    mirror.position.copy(camera.position);mirror.position.y*=-1;
    this.mirrorLook.copy(focus);this.mirrorLook.y*=-1;
    mirror.up.set(0,-1,0);mirror.lookAt(this.mirrorLook);mirror.updateMatrixWorld();
    this.reflectionMatrix.copy(this.bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
    this.floor.visible=this.back.visible=false;
    this.renderer.setRenderTarget(this.target);
    try{
      this.renderer.render(this.scene,mirror);
    }finally{
      this.renderer.setRenderTarget(null);
      this.floor.visible=this.back.visible=true;
    }
    this.reflectedAt=time;
  }
}
