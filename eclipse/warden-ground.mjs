import * as T from '../three.min.mjs';

const tau=2*Math.PI;
const looks=[
  {light:'wardenSilver',spark:'ice',tint:0xb9dcff,duration:.86,power:.87},
  {light:'wardenCrimson',spark:'fire',tint:0xff713c,duration:1.06,power:1.08},
  {light:'wardenMoon',spark:'void',tint:0xb098ff,duration:1.16,power:.95},
];
const shapes={circle:0,ring:1,line:2,cone:3};
export const wardenStrikeLook=phase=>looks[phase]??looks[0];

const vertexShader=`
  varying vec2 ground;
  void main(){
    ground=(uv*2.-1.)*vec2(1.,-1.);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  }`;

const fragmentShader=`
  uniform float progress,phase,shape,edgeWidth,grain,layerMotion;
  varying vec2 ground;
  const float tau=6.2831853;
  float band(float p,float center,float width){
    return 1.-smoothstep(width*.35,width,abs(p-center));
  }
  float hash(vec2 p){
    vec3 q=fract(p.xyx*.1031);
    q+=dot(q,q.yzx+33.33);
    return fract((q.x+q.y)*q.z);
  }
  void main(){
    vec2 p=ground;
    float r=length(p),a=atan(p.y,p.x+.0001);
    bool lane=shape==2.;
    float boundary=1.-r;
    if(shape==1.)boundary=min(boundary,r-edgeWidth);
    if(lane)boundary=1.-max(abs(p.x),abs(p.y));
    if(shape==3.)boundary=min(boundary,(edgeWidth-abs(a))*.65);
    if(boundary<=0.)discard;
    float edge=smoothstep(0.,.09,boundary);
    float fade=smoothstep(0.,.07,progress)*(1.-smoothstep(.21,1.,progress));
    float flow=mix(.33,progress,layerMotion);
    vec2 chart=lane?vec2(p.x*.5+.5,p.y):vec2(a/tau+.5,r);
    float dust=hash(floor(p*55.)+grain);
    float across=lane?abs(p.y):mix(r,clamp((r-edgeWidth)/(1.-edgeWidth),0.,1.),float(shape==1.));
    float travel=lane?chart.x:r;
    float front=band(travel,mix(.18,.98,flow),.15);
    vec3 colour;
    float alpha;
    if(phase<.5){
      float radial=lane?abs(p.y):across;
      float filigree=band(radial,.21,.028)+band(radial,.76,.019)+band(radial,.84,.022);
      float ticks=pow(max(0.,cos(chart.x*(lane?82.:tau*18.))),12.);
      float seals=band(radial,.58+.11*cos(chart.x*(lane?27.:tau*6.)),.027);
      float bright=clamp(filigree*.66+ticks*band(radial,.69,.11)*.75+seals*.69+front*.35,0.,1.);
      colour=mix(vec3(.24,.44,.73),vec3(.83,.95,1.),bright);
      alpha=(.12+bright*.78)*(.76+.24*front);
    }else if(phase<1.5){
      float run=chart.x*(lane?26.:24.);
      float split=.097*sin(run+grain)+.060*sin(run*2.69)+.047*sin(run*4.82+2.);
      float main=lane?p.y-split:across-.49-split;
      float branch=abs(main)-(.18+.22*abs(sin(run*1.42+grain)));
      float joints=smoothstep(.24,.81,.5+.5*sin(run*.83));
      float seam=band(main,0.,.053)+band(branch,0.,.028)*joints;
      float magma=clamp(seam*(.72+.28*front)+(1.-smoothstep(0.,.21,abs(main)))*.44,0.,1.);
      colour=mix(vec3(.13,.017,.012),mix(vec3(.93,.20,.062),vec3(1.,.72,.30),smoothstep(.53,1.,magma)),magma);
      alpha=.29+dust*.105+magma*.62;
    }else{
      float drift=a+(lane?0.:r*3.2)-flow*2.;
      float crescent=lane?abs(p.y+.21*cos(chart.x*13.))-.36:
        across-(.54+.16*cos(drift*2.)+.08*sin(drift*3.));
      float rim=band(crescent,0.,.052)*(.62+.38*sin(drift*4.+grain));
      float ripples=band(across,.79+.06*sin(drift*7.),.051)*.64;
      float sparks=pow(dust,13.)*band(across,.57,.45)*.76;
      float light=clamp(rim+ripples+sparks+front*.16,0.,1.);
      colour=mix(vec3(.087,.055,.18),vec3(.64,.52,1.),light);
      alpha=.34+light*.59;
    }
    gl_FragColor=vec4(colour,alpha*edge*fade);
  }`;

export class WardenGround {
  constructor(scene,mobile){
    this.geometry=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
    this.slots=Array.from({length:mobile?4:6},(_,index)=>{
      const mesh=this.makeMesh();
      mesh.visible=false;
      mesh.renderOrder=25+index*.01;
      scene.add(mesh);
      return {mesh,age:0,duration:0};
    });
  }

  makeMesh(){
    const uniforms={progress:{value:0},phase:{value:0},shape:{value:0},edgeWidth:{value:0},
      grain:{value:0},layerMotion:{value:1}};
    const mesh=new T.Mesh(this.geometry,new T.ShaderMaterial({
      uniforms,vertexShader,fragmentShader,transparent:true,depthWrite:false,toneMapped:false,
    }));
    mesh.name='王冠守夜者 · 出招地紋';
    return mesh;
  }

  warmup(group){
    group.add(new T.Mesh(this.geometry,this.slots[0].mesh.material));
  }

  impact(hazard,phase,subdued){
    const {kind,x,z,radius,width=0,angle=0}=hazard,shape=shapes[kind];
    if(shape===undefined)return false;
    const slot=this.slots.find(candidate=>!candidate.duration)??this.slots.reduce((oldest,other)=>
      other.age/other.duration>oldest.age/oldest.duration?other:oldest);
    const outer=radius+(kind==='cone'?.13:.12),line=kind==='line';
    const {mesh}=slot;
    mesh.position.set(x,.082,z);
    mesh.rotation.y=line||kind==='cone'?-angle:0;
    mesh.scale.set(line?radius:2*outer,1,line?2*(width+.13):2*outer);
    const uniforms=mesh.material.uniforms;
    uniforms.progress.value=0;
    uniforms.phase.value=phase;
    uniforms.shape.value=shape;
    uniforms.edgeWidth.value=kind==='cone'?width+.05:kind==='ring'?Math.max(0,radius-width-.12)/outer:0;
    uniforms.grain.value=(x*.517+z*.793)%tau;
    uniforms.layerMotion.value=subdued?0:1;
    mesh.visible=true;
    slot.age=0;
    slot.duration=wardenStrikeLook(phase).duration;
    return true;
  }

  tick(dt){
    for(const slot of this.slots){
      if(!slot.duration)continue;
      slot.age+=dt;
      if(slot.age>=slot.duration)this.release(slot);
      else slot.mesh.material.uniforms.progress.value=slot.age/slot.duration;
    }
  }

  release(slot){
    slot.duration=0;
    slot.mesh.visible=false;
  }

  reset(){
    for(const slot of this.slots)this.release(slot);
  }
}
