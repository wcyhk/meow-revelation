import * as T from "./three.min.mjs";
import { CharacterStage } from "./character-rig.mjs?v=moonwake";
import { CourtStage } from "./world-stage.mjs?v=moonwake";
import { DEPTH } from "./world-set.mjs?v=guild";
import { haloFragment, planeVertex, ribbonFragment, sparksFragment, sparksVertex } from "./world-light.mjs?v=inkbound";

const TAU=Math.PI*2,STEPS=26,MAX_POINTS=240;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const U=value=>({value});
const motion=(rate,dt)=>1-Math.exp(-rate*dt);
const shader=(fragment,tint,alpha,additive)=>new T.ShaderMaterial({
  uniforms:{tint:U(new T.Color(tint)),strength:U(alpha),time:U(0)},
  vertexShader:planeVertex,fragmentShader:fragment,
  transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,
  blending:additive?T.AdditiveBlending:T.NormalBlending,
});

class GroundEffects{
  constructor(scene){
    this.scene=scene;
    this.items=[];
    this.forms={
      ring:new T.RingGeometry(.941,1,40).rotateX(-Math.PI/2),
      fill:new T.CircleGeometry(1,40).rotateX(-Math.PI/2),
      lane:new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),
    };
  }
  begin(){this.used=0;}
  take(form,color,alpha){
    let mesh=this.items[this.used++];
    if(!mesh){
      mesh=new T.Mesh(this.forms[form],new T.MeshBasicMaterial({
        color,transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,
      }));
      mesh.renderOrder=3;
      this.items.push(mesh);this.scene.add(mesh);
    }
    mesh.geometry=this.forms[form];
    mesh.material.color.setHex(color);mesh.material.opacity=alpha;mesh.visible=true;
    return mesh;
  }
  end(){for(let i=this.used;i<this.items.length;i++)this.items[i].visible=false;}
}

export class MoonlightWorld{
  static create(host,reference,getImage,palettes,contextChanged){
    const canvas=document.createElement("canvas");
    const options={alpha:false,antialias:false,powerPreference:"high-performance",depth:true};
    const context=canvas.getContext("webgl2",options);
    return context?new MoonlightWorld(canvas,context,options,host,reference,getImage,palettes,contextChanged):null;
  }
  constructor(canvas,context,options,host,reference,getImage,palettes,contextChanged){
    Object.assign(this,{canvas,host,reference,getImage,palettes});
    this.renderer=new T.WebGLRenderer({canvas,context,...options});
    this.renderer.outputColorSpace=T.SRGBColorSpace;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.18;
    this.scene=new T.Scene();
    this.camera=new T.PerspectiveCamera(49,1,8,3900);
    this.stage=new CourtStage(this.scene,this.renderer);
    this.cool=new T.Color(0xa7fae9);this.warm=new T.Color(0xffb180);this.pointColor=new T.Color();
    this.focus=new T.Vector3();this.desired=new T.Vector3();this.gaze=new T.Vector3();this.hero=new T.Vector3();
    this.position=new T.Vector3();this.projected=new T.Vector3();this.ray=new T.Vector3();this.screenResult={};
    this.textures=new Map();this.ribbons=[];this.ground=new GroundEffects(this.scene);
    this.characters=new CharacterStage(this.scene,new T.PlaneGeometry(1,1),shader(haloFragment,0x060913,.84,false),this.cool,this.warm,DEPTH);
    this.sparks=this.makeSparks();
    this.quality=1;this.smooth=false;this.active=false;this.lost=false;
    this.yaw=0;this.pitch=0;this.width=0;this.location="";
    canvas.className="moonlight-canvas";canvas.hidden=true;canvas.setAttribute("aria-hidden","true");
    host.prepend(canvas);
    canvas.addEventListener("webglcontextlost",event=>{
      event.preventDefault();this.lost=true;this.setActive(false);contextChanged();
    });
    canvas.addEventListener("webglcontextrestored",()=>{
      this.lost=false;this.width=0;contextChanged();
    });
  }
  setActive(on){
    this.active=on&&!this.lost;
    this.canvas.hidden=!this.active;
    this.host.classList.toggle("moonlight-live",this.active);
    this.host.closest("#game")?.classList.toggle("moonlight-live",this.active);
  }
  setQuality(smooth){
    if(this.smooth===smooth)return;
    this.smooth=smooth;this.quality=1;this.slowFrames=0;
    if(this.width)this.renderSize();
  }
  image(id){
    if(this.textures.has(id))return this.textures.get(id);
    const tex=new T.Texture(this.getImage(id));
    tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;
    this.textures.set(id,tex);
    return tex;
  }
  resize(width,height){
    const reference=this.reference.getBoundingClientRect(),outer=this.host.getBoundingClientRect();
    if(width===this.width&&height===this.height&&reference.width===this.cssWidth&&reference.height===this.cssHeight)return false;
    this.width=width;this.height=height;
    this.cssWidth=reference.width||outer.width;this.cssHeight=reference.height||outer.height;
    if(!this.cssWidth||!this.cssHeight)return false;
    this.phone=this.cssWidth<690;
    this.xScale=Math.min(1,865/width);
    this.characters.depth=DEPTH*this.xScale;
    Object.assign(this.canvas.style,{left:(reference.left-outer.left)+"px",top:(reference.top-outer.top)+"px",width:this.cssWidth+"px",height:this.cssHeight+"px"});
    this.camera.aspect=this.cssWidth/this.cssHeight;
    this.camera.fov=this.phone?63:49;
    this.camera.updateProjectionMatrix();
    this.renderSize();
    return true;
  }
  renderSize(){
    const {cssWidth:w,cssHeight:h}=this;
    const cap=this.smooth?1:this.phone?1.16:1.42;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,cap,Math.sqrt(1450000/(w*h)))*this.quality);
    this.renderer.setSize(w,h,false);
    this.stage.resize(w,h,this.phone,this.smooth||this.quality<.84);
    this.sparks.material.uniforms.pixelScale.value=this.renderer.getPixelRatio()*h/this.height;
  }
  worldPoint(x,y,lift=0,target=this.position){
    return target.set((x-this.width*.5)*this.xScale,lift,(y-this.height*.5)/DEPTH);
  }
  screenPoint(x,y,lift=0){
    const projected=this.worldPoint(x,y,lift,this.projected).project(this.camera);
    const point=this.screenResult;
    point.x=(projected.x*.5+.5)*this.width;
    point.y=(.5-projected.y*.5)*this.height;
    point.visible=projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<1.08&&Math.abs(projected.y)<1.07;
    point.behind=projected.z>1;
    return point;
  }
  groundPoint(clientX,clientY){
    if(!this.ready)return null;
    const rect=this.reference.getBoundingClientRect();
    const ray=this.ray.set((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2,.5).unproject(this.camera);
    const origin=this.camera.position;
    if(ray.y>=origin.y)return null;
    const at=origin.y/(origin.y-ray.y);
    return {x:(origin.x+(ray.x-origin.x)*at)/this.xScale+this.width*.5,y:(origin.z+(ray.z-origin.z)*at)*DEPTH+this.height*.5};
  }
  input(x,y){
    if(!this.ready||(!x&&!y))return {x,y};
    const e=this.camera.matrixWorld.elements;
    const wx=(x*e[0]+y*e[8])/this.xScale,wz=(x*e[2]+y*e[10])*DEPTH;
    const scale=Math.hypot(x,y)/(Math.hypot(wx,wz)||1);
    return {x:wx*scale,y:wz*scale};
  }
  resetOrbit(){this.yaw=0;this.pitch=0;}
  orbit(dx,dy){
    this.yaw=clamp(this.yaw-dx*.006,-.82,.82);
    this.pitch=clamp(this.pitch+dy*.48,-55,132);
  }
  begin(b,art,time,shakeX,shakeY,still,survey,dt,guardian){
    const resized=this.resize(b.width,b.height);
    if(!this.width||!this.cssWidth)return;
    const changed=this.location!==b.location;
    this.time=time;this.state=b;this.still=still;
    this.worldPoint(b.player.x,b.player.y,0,this.hero);
    if(changed||resized){
      this.location=b.location;
      const colors=this.palettes[b.location];
      this.cool.setHex(colors.cool);this.warm.setHex(colors.warm);
      this.stage.decorate(b.location,b.width*this.xScale,(b.height*.90-b.height*.5)/DEPTH,(b.height*b.floor-b.height*.5)/DEPTH,colors,this.image(art));
      this.stage.reflectedAt=-Infinity;
    }
    this.positionCamera(b,dt,guardian,survey,still,changed||!this.ready,shakeX,shakeY);
    this.ready=true;
    this.characters.begin(dt,time,still,this.phone||this.smooth);
    const flash=b.effects.find(e=>e.kind==="sigil"||e.kind==="slash");
    this.stage.update(time,this.hero,flash?clamp(flash.left/flash.life,0,1):0,flash?.color||0x9bf0e5,still,this.phone||this.smooth||this.quality<.84);
    this.ground.begin();
    for(const e of b.enemies)if(e.hp>0&&e.warning)this.warning(e.warning);
    this.placeMagic(b);
    this.ground.end();
    this.slowFrames=dt>1/43?Math.min(70,(this.slowFrames||0)+1):Math.max(0,(this.slowFrames||0)-2);
    if(this.slowFrames>26&&this.quality>.71){
      this.slowFrames=0;this.quality=Math.max(.70,this.quality*.86);this.renderSize();
    }
  }
  positionCamera(b,dt,guardian,survey,still,snap,shakeX,shakeY){
    const p=b.player,h=this.hero;
    let closest=guardian,nearest=guardian?0:Infinity;
    let behind=0;
    for(const e of b.enemies){
      if(e.hp<=0)continue;
      const d=Math.hypot(p.x-e.x,p.y-e.y);
      if(d<nearest){closest=e;nearest=d;}
      if(e.y>p.y+25)behind=Math.max(behind,(1-clamp(d/235,0,1))*clamp((e.y-p.y)/118,0,1));
    }
    const lead=closest?clamp((closest.x-p.x)*this.xScale,-245,245):0;
    const yaw=survey?this.yaw:clamp(-lead*.00075,-.20,.20);
    const length=(this.phone?393:345)+behind*56+(guardian?(this.phone?68:103):0);
    this.desired.set(h.x+Math.sin(yaw)*length,(this.phone?226:197)+behind*72+(survey?this.pitch:0),h.z+Math.cos(yaw)*length);
    const along=survey?42:(this.phone?94:127)-behind*68;
    this.gaze.set(h.x+lead*.27-Math.sin(yaw)*along,guardian?(this.phone?93:108):47,h.z-Math.cos(yaw)*along);
    if(b.location==="village"){this.gaze.y=56;this.gaze.z-=30;}
    if(!still&&!survey&&b.intro>0){
      this.desired.y+=b.intro*47;
      this.desired.z+=b.intro*38;
    }
    if(!still){this.desired.x+=shakeX*.46;this.gaze.y+=shakeY*.35;}
    const blend=snap?1:motion(still?18:7.8,dt);
    this.camera.position.lerp(this.desired,blend);this.focus.lerp(this.gaze,blend);
    this.camera.lookAt(this.focus);this.camera.updateMatrixWorld();
  }
  ring(x,y,radius,color,alpha,filled=false,lift=2){
    const mesh=this.ground.take(filled?"fill":"ring",color,alpha);
    mesh.matrixAutoUpdate=true;
    this.worldPoint(x,y,lift,mesh.position);
    mesh.rotation.y=0;mesh.scale.set(radius*this.xScale,1,radius/DEPTH);
  }
  lane(x,y,angle,length,halfWidth,color,alpha,cross=false){
    const dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;
    const geometry=this.ground.take("lane",color,alpha);
    const center=this.worldPoint(x+(cross?0:dx*.5),y+(cross?0:dy*.5),2.1);
    const width=halfWidth*2,span=cross?2:1;
    geometry.matrixAutoUpdate=false;
    geometry.matrix.set(dx*this.xScale*span,0,-Math.sin(angle)*width*this.xScale,center.x,
      0,1,0,center.y,dy/DEPTH*span,0,Math.cos(angle)*width/DEPTH,center.z,0,0,0,1);
    geometry.matrixWorldNeedsUpdate=true;
  }
  warning(w){
    const progress=clamp(1-w.left/w.total,0,1);
    if(w.shots){
      for(const a of w.shots)this.lane(w.x,w.y,w.angle+a,w.shots.length===10?95:245,1.8,0xea9fe3,.39+progress*.47);
    }else if(w.lane||w.cross){
      const angles=w.cross?[w.angle,w.angle+Math.PI/2]:[w.angle];
      for(const angle of angles){
        this.lane(w.x,w.y,angle,w.length,w.size,0xe14452,.28+progress*.20,w.cross);
        this.lane(w.x,w.y,angle,w.length,2.1,0xffbd85,.84,w.cross);
      }
    }else{
      this.ring(w.x,w.y,w.size,0xf46353,.24,true);
      this.ring(w.x,w.y,w.size*(.12+progress*.88),0xff7958,.36,true,2.4);
      this.ring(w.x,w.y,w.size,0xffbd8e,.91,false,2.7);
    }
  }
  makeRibbon(){
    const geometry=new T.BufferGeometry(),indices=[];
    const positions=new Float32Array((STEPS+1)*6),uv=new Float32Array((STEPS+1)*4);
    for(let i=0;i<=STEPS;i++){
      uv.set([i/STEPS,0,i/STEPS,1],i*4);
      if(i<STEPS){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    geometry.setAttribute("position",new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
    geometry.setAttribute("uv",new T.BufferAttribute(uv,2));geometry.setIndex(indices);
    const mesh=new T.Mesh(geometry,shader(ribbonFragment,0xffdeb0,.8,true));
    mesh.frustumCulled=false;
    this.scene.add(mesh);this.ribbons.push(mesh);return mesh;
  }
  placeMagic(b){
    let cuts=0;
    for(const e of b.effects){
      const fade=clamp(e.left/e.life,0,1),phase=1-fade;
      if(e.kind==="slash"&&cuts<4){
        const ribbon=this.ribbons[cuts++]||this.makeRibbon();
        const narrow=e.fx==="thrust",wide=e.fx==="whirl",ink=e.fx==="ink";
        const arc=wide?TAU-.06:narrow?.49:ink?2.78:2.22;
        const start=e.angle-arc*.55+phase*.55;
        const radius=e.size*(.73+phase*.31);
        const verts=ribbon.geometry.attributes.position;
        for(let i=0;i<=STEPS;i++){
          const f=i/STEPS,a=start+f*arc,taper=Math.sin(f*Math.PI)**.67;
          for(let j=0;j<2;j++){
            const r=radius*(j?1:.56-taper*.13);
            const point=this.worldPoint(e.x+Math.cos(a)*r,e.y+16+Math.sin(a)*r,30+taper*26+j*8);
            verts.setXYZ(i*2+j,point.x,point.y,point.z);
          }
        }
        verts.needsUpdate=true;ribbon.visible=true;
        ribbon.material.uniforms.tint.value.setHex(e.color);
        ribbon.material.uniforms.strength.value=fade*.91;
        ribbon.material.uniforms.time.value=this.time;
      }else if(e.kind==="lane"){
        for(const angle of e.cross?[e.angle,e.angle+Math.PI/2]:[e.angle])
          this.lane(e.x,e.y,angle,e.length,3+15*fade,e.color,fade*.79,e.cross);
      }else if(e.kind==="sigil"||e.kind==="ring"){
        const radius=e.size*(.66+phase*.63);
        this.ring(e.x,e.y,radius,e.color,fade*.8,false,4.2);
        if(e.kind==="sigil")this.ring(e.x,e.y,radius*.83,e.color,fade*.18,true,3);
      }
    }
    for(let i=cuts;i<this.ribbons.length;i++)this.ribbons[i].visible=false;
  }
  makeSparks(){
    const geometry=new T.BufferGeometry();
    for(const [attribute,width] of [["position",3],["tint",3],["radius",1],["alpha",1]]){
      geometry.setAttribute(attribute,new T.BufferAttribute(new Float32Array(MAX_POINTS*width),width).setUsage(T.DynamicDrawUsage));
    }
    geometry.setDrawRange(0,0);
    const sparks=new T.Points(geometry,new T.ShaderMaterial({
      uniforms:{pixelScale:U(1)},vertexShader:sparksVertex,fragmentShader:sparksFragment,
      transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    }));
    sparks.frustumCulled=false;this.scene.add(sparks);
    return sparks;
  }
  writeSparks(){
    const b=this.state,a=this.sparks.geometry.attributes,t=this.still?0:this.time;
    let index=0;
    const put=(x,y,lift,color,radius,alpha)=>{
      if(index>=MAX_POINTS)return;
      const p=this.worldPoint(x,y,lift);
      a.position.setXYZ(index,p.x,p.y,p.z);a.tint.setXYZ(index,color.r,color.g,color.b);
      a.radius.setX(index,radius);a.alpha.setX(index,alpha);index++;
    };
    const count=this.phone||this.smooth?36:71;
    for(let i=0;i<count;i++){
      const age=(i*.157+t*(.035+i%4*.004))%1;
      put(b.width*(.07+(i*.189)% .86)+Math.sin(t*.43+i)*19,b.height*(.24+(i*.137)% .67),18+age*167,i%3?this.cool:this.warm,2+i%5*1.4,Math.sin(age*Math.PI)*.44);
    }
    for(const p of b.particles){
      const alpha=clamp(p.left/p.life,0,1);
      put(p.x,p.y,16+(1-alpha)*35,this.pointColor.setHex(p.color),p.size*(p.dust?3.2:3.9)+4,alpha*(p.dust?.32:.83));
    }
    for(const p of b.bolts)put(p.x,p.y,21,this.pointColor.setHex(p.friendly?(p.color||0xa5ffe0):0xeaa4ff),26,.77);
    this.sparks.geometry.setDrawRange(0,index);
    for(const attribute of Object.values(a))attribute.needsUpdate=true;
  }
  figure(key,kind,actor,size,weapon,forged){
    this.characters.draw(key,kind,actor,this.worldPoint(actor.x,actor.y),size*(kind==="hero"?(this.phone?.79:.85):.88),weapon,forged);
  }
  end(){
    this.characters.end();this.writeSparks();
    const reflections=this.phone||this.smooth?14:this.quality<.84?17:26;
    this.stage.reflect(this.camera,this.focus,this.time,reflections);
    this.renderer.render(this.scene,this.camera);
  }
}
