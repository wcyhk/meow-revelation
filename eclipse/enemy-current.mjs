import * as T from '../three.min.mjs';

const flavors={fire:0,ember:0,embers:0,ice:1,frost:1,water:1,teal:1,mist:1,lightning:2,bolts:2,
  void:3,blood:3,violet:3,root:3,poison:3,venom:3,wind:4,feather:4,light:4,gold:4,sigils:4};
const pathSamples=6;

function currentsGeometry(field,mobile,weaponCount){
  const geometry=new T.InstancedBufferGeometry();
  const plane=new T.PlaneGeometry(1,2,mobile?16:24,1);
  plane.translate(.5,0,0);
  geometry.index=plane.index;
  geometry.setAttribute('position',plane.attributes.position);
  const strands=[];
  for(let i=0;i<(field?2:mobile?4:6);i++)strands.push(0,i*2.399,(i%3)*.29);
  for(let i=0;i<weaponCount;i++)for(let j=0;j<(mobile?2:3);j++)strands.push(1+i,j*2.66,(j+1)*.23);
  for(let i=0;i<(field||mobile?2:3);i++)strands.push(3,i*2.39,i*.32);
  for(let i=0;i<(field?1:mobile?2:4);i++)strands.push(12,i*2.39,(i*.618)%1);
  if(!field)for(let i=0;i<weaponCount;i++){
    for(let j=0;j<(mobile?2:3);j++)strands.push(4+i,j*2.39,j%2);
    for(let j=0;j<(mobile?5:8);j++)strands.push(6+i,j*2.39,(j*.618)%1);
    strands.push(8+i,0,0);
    for(let j=0;j<(mobile?3:5);j++)strands.push(10+i,j*2.39,(j*.618)%1);
    for(let j=0;j<(mobile?2:4);j++)strands.push(13+i,j*2.39,(j*.618)%1);
  }
  geometry.setAttribute('strand',new T.InstancedBufferAttribute(new Float32Array(strands),3));
  geometry.instanceCount=strands.length/3;
  return geometry;
}

const vertex=`
  attribute vec3 strand;
  uniform float clock,force,stage,style,strength,scaleUnit,weaponPower,ringSpin,releaseAge;
  uniform vec3 center,span,surfaceOrigin,surfaceSpan;
  uniform mat3 surfaceAxes;
  uniform vec4 grip[2],tip[2];
  uniform vec4 burstPoint[2];
  uniform vec3 burstHeading[2],weaponPlane[2];
  uniform float weaponKind[2],idleAge[2],idlePulse[2];
  uniform vec4 wake[6];
  varying vec2 ribbon;
  varying float opacity,seed,kind;
  vec3 normalTo(vec3 axis){
    return normalize(cross(axis,abs(axis.y)>.82?vec3(1.,0.,0.):vec3(0.,1.,0.)));
  }
  void hideStrand(){
    gl_Position=vec4(2.,2.,2.,1.);
    ribbon=vec2(0.);
    opacity=seed=kind=0.;
  }
  void main(){
    float u=position.x,v=position.y;
    float mode=strand.x;
    float pace=style<.5?2.8:(style>1.5&&style<2.5?4.1:1.95);
    float t=clock*(pace+stage*.32)+strand.y;
    float bandwidth=scaleUnit*(.075+force*.046);
    vec3 p,orthogonal;
    float edge=smoothstep(.0,.16,u)*(1.-smoothstep(.77,1.,u));
    if(mode<.5){
      float angle=t+(u-.50)*(2.40+force*.74);
      float surge=.87+.11*sin(u*7.+t*.73)+force*.06;
      float y=(strand.z-.28)*.60+(u-.46)*.44+sin(angle*1.14)*.14;
      if(style<.5)y+=u*u*.23+.13*pow(max(0.,sin(angle*3.1-t)),3.);
      p=center+vec3(cos(angle)*span.x*surge,y*span.y,sin(angle)*span.z*surge);
      orthogonal=normalize(vec3(cos(angle)*.45,1.,sin(angle)*.45));
      bandwidth*=1.43;
    }else if(mode<2.5){
      int i=int(mode)-1;
      vec3 a=grip[i].xyz,b=tip[i].xyz;
      vec3 axis=normalize(b-a+vec3(.00001));
      vec3 tangent=normalTo(axis),binormal=cross(axis,tangent);
      float angle=u*(style>1.5&&style<2.5?9.42:11.8)-t*1.43;
      vec3 radial=tangent*cos(angle)+binormal*sin(angle);
      p=mix(a,b,.08+u*.93)+radial*grip[i].w*(.77+.28*sin(u*3.14159)+force*.16);
      orthogonal=radial;
      bandwidth*=.78;
    }else if(mode<3.5){
      float point=u*4.999;
      int i=int(point);
      vec4 a=wake[i],b=wake[i+1];
      vec3 forward=normalize(b.xyz-a.xyz+vec3(.00001));
      vec3 side=normalTo(forward);
      float f=fract(point);
      float envelope=(1.-u)*mix(a.w,b.w,f);
      p=mix(a.xyz,b.xyz,f)+side*(strand.z-.30)*scaleUnit*(1.+u*.40);
      p.y+=scaleUnit*(sin(t+u*13.)*.068+.23*u);
      orthogonal=normalize(cross(forward,cameraPosition-p)+vec3(.00001));
      edge=envelope*smoothstep(0.,.075,u);
      bandwidth*=1.46+u*.69;
    }else if(mode<5.5){
      int i=int(mode)-4;
      float circular=step(1.5,weaponKind[i]);
      vec3 a=grip[i].xyz,b=tip[i].xyz;
      vec3 axis=normalize(b-a+vec3(.00001));
      vec3 tx=normalTo(axis),ty=cross(axis,tx);
      if(circular>.5){
        axis=weaponPlane[i];
        tx=normalTo(axis);ty=cross(axis,tx);
      }
      float hand=strand.z>.5?-1.:1.;
      float angle=hand*ringSpin+strand.y+u*(3.72+weaponPower*.62);
      float radius=grip[i].w*(mix(.93,1.19,circular)+weaponPower*.52+idlePulse[i]*.17);
      vec3 radial=tx*cos(angle)+ty*sin(angle);
      p=mix(a,b,mix(.88,.5,circular))+radial*radius;
      p+=axis*sin(angle)*radius*.18*hand;
      orthogonal=radial;
      bandwidth*=.88+weaponPower*.19;
      edge*=.65+weaponPower*.69+stage*.07+idlePulse[i]*.32;
    }else if(mode<7.5){
      int i=int(mode)-6;
      vec4 burst=burstPoint[i];
      if(releaseAge>=1.||burst.w<=0.){hideStrand();return;}
      vec3 axis=burstHeading[i];
      vec3 tx=normalTo(axis),ty=cross(axis,tx);
      vec3 fan=tx*cos(strand.y)+ty*sin(strand.y);
      float disperse=.31+.71*strand.z;
      vec3 jet=normalize(axis*(.84+strand.z*.52)+fan*disperse);
      float reach=burst.w*(.54+1.03*strand.z);
      float age=releaseAge;
      p=burst.xyz+jet*reach*(.12+age*2.1+u*(.20+age*.38));
      p.y-=burst.w*age*age*.39;
      orthogonal=normalize(cross(jet,cameraPosition-p)+vec3(.00001));
      bandwidth=burst.w*(.038+.029*strand.z)*(1.-age*.58);
      edge*=smoothstep(0.,.09,age)*(1.-smoothstep(.20,1.,age))*(1.09+strand.z*.35);
    }else if(mode<9.5){
      int i=int(mode)-8;
      float circular=step(1.5,weaponKind[i]);
      vec3 anchor=mix(grip[i].xyz,tip[i].xyz,mix(.84,.5,circular));
      float radius=min(scaleUnit*.73,grip[i].w*(1.85+idlePulse[i]*.52+weaponPower*.38));
      vec3 viewRight=vec3(viewMatrix[0].x,viewMatrix[1].x,viewMatrix[2].x);
      vec3 viewUp=vec3(viewMatrix[0].y,viewMatrix[1].y,viewMatrix[2].y);
      p=anchor+(viewRight*(u*2.-1.)+viewUp*v)*radius;
      orthogonal=viewUp;
      bandwidth=0.;
      edge=.35+idlePulse[i]*.28+weaponPower*.27;
    }else if(mode<11.5){
      int i=int(mode)-10;
      if(idlePulse[i]<=0.){hideStrand();return;}
      float age=idleAge[i];
      float circular=step(1.5,weaponKind[i]);
      vec3 anchor=mix(grip[i].xyz,tip[i].xyz,mix(.94,.5,circular));
      vec3 axis=normalize(tip[i].xyz-grip[i].xyz+vec3(.00001));
      if(circular>.5)axis=weaponPlane[i];
      vec3 tx=normalTo(axis),ty=cross(axis,tx);
      float angle=ringSpin*.8+strand.y;
      vec3 radial=tx*cos(angle)+ty*sin(angle);
      float radius=grip[i].w;
      p=anchor+radial*radius*(.48+age*(1.1+strand.z*.94)+u*(.25+age*.61));
      p+=axis*radius*(age*(strand.z-.35)*.92+u*.19);
      orthogonal=normalize(cross(radial,cameraPosition-p)+vec3(.00001));
      bandwidth=radius*(.125+.053*strand.z)*(1.-age*.60);
      edge*=idlePulse[i]*(1.0+strand.z*.33);
    }else if(mode<12.5){
      float angle=t*.63+u*(3.45+force*1.2);
      float radius=.90+.12*sin(u*9.+t)+force*.13;
      float y=(strand.z-.50)*.77+(u-.33)*.38+sin(angle*1.53)*.24;
      vec3 radial=vec3(cos(angle),0.,sin(angle));
      p=surfaceOrigin+surfaceAxes*((radial*radius+vec3(0.,y,0.))*surfaceSpan);
      orthogonal=normalize(surfaceAxes*(vec3(0.,1.,0.)+radial*.42));
      bandwidth*=.62;
      edge*=.68+force*.41;
    }else{
      int i=int(mode)-13;
      vec3 a=grip[i].xyz,b=tip[i].xyz;
      vec3 axis=normalize(b-a+vec3(.00001));
      float circular=step(1.5,weaponKind[i]);
      if(circular>.5)axis=weaponPlane[i];
      vec3 tx=normalTo(axis),ty=cross(axis,tx);
      float phase=ringSpin*(strand.z>.42?-1.38:1.51)+strand.y;
      float angle=phase+u*(3.8+strand.z*2.1);
      float crest=sin(u*3.14159);
      float radius=grip[i].w*(1.04+crest*(.47+weaponPower*.44)+idlePulse[i]*.27);
      vec3 radial=tx*cos(angle)+ty*sin(angle);
      vec3 filament=tx*sin(angle*2.+t)+ty*cos(angle*2.+t);
      p=mix(a,b,mix(.23+u*.78,.5,circular))+radial*radius;
      p+=filament*radius*.15*crest+axis*radius*.26*sin(angle);
      orthogonal=normalize(cross(radial,cameraPosition-p)+vec3(.00001));
      bandwidth*=.62;
      edge*=crest*(.62+weaponPower*.68+idlePulse[i]*.46);
    }
    p+=orthogonal*v*bandwidth;
    gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
    opacity=edge*strength*(.72+force*.54+stage*.105);
    ribbon=vec2(u,v);
    seed=strand.y;
    kind=mode;
  }
`;

const fragment=`
  uniform float style,clock,force;
  uniform vec3 tint,heart;
  varying vec2 ribbon;
  varying float opacity,seed,kind;
  void main(){
    float u=ribbon.x,v=ribbon.y;
    if(kind>7.5&&kind<9.5){
      vec2 center=vec2(u*2.-1.,v);
      float d=dot(center,center);
      float edge=(1.-smoothstep(.22,1.,d))*exp(-4.6*d);
      float hot=exp(-24.*d)*.30;
      gl_FragColor=vec4(mix(tint,heart,hot),edge*opacity);
      #include <colorspace_fragment>
      return;
    }
    float t=clock*(5.6+force*2.0)+seed;
    float vein=sin(u*22.-t)*.18+sin(u*43.+t*.62)*.093;
    if(style>1.5&&style<2.5)vein=(abs(fract(u*7.+seed*.143-clock*.83)*2.-1.)-.5)*.86;
    if(style<.5)vein+=sin(u*58.-t*1.4)*.21;
    float d=abs(v-vein);
    float mask=1.-smoothstep(.62,.99,abs(v));
    float core=exp(-d*(style>1.5&&style<2.5?10.8:7.3));
    float packet=.57+.43*pow(.5+.5*cos(u*25.-t),5.);
    float tendril=exp(-abs(v-vein-.34*sin(u*24.+t))*15.)*pow(.5+.5*sin(u*15.-t),3.);
    float veil=exp(-d*(style<.5?2.9:4.6))*.38;
    float sparkle=exp(-d*18.)*pow(.5+.5*sin(u*60.-t*1.62+seed),13.);
    vec3 glow=mix(tint,heart,clamp(core*packet*.75+sparkle*.35,0.,1.));
    float energy=(core*packet*.76+veil+tendril*.26+sparkle*.43)*mask*opacity;
    if((kind>5.5&&kind<7.5)||(kind>9.5&&kind<11.5)){
      glow=mix(tint,heart,.55+core*.45);
      energy=(core*.98+veil*.51)*mask*opacity;
    }
    if(kind>11.5){
      float split=smoothstep(.20,.53,u)*(1.-smoothstep(.74,1.,u));
      float branch=exp(-abs(v-vein-sin(u*9.+seed)*.48*split)*18.)*split;
      float knot=pow(.5+.5*cos(u*31.-t*1.35),9.)*core;
      glow=mix(tint,heart,min(1.,core*(.48+packet*.34)+knot*.49));
      energy=(core*packet*.94+branch*.54+veil*.58+knot*.57)*mask*opacity;
    }
    gl_FragColor=vec4(glow,energy*(kind>2.5&&kind<3.5?1.27:1.));
    #include <colorspace_fragment>
  }
`;

const bodyPoint=new T.Vector3(),weaponPoint=new T.Vector3(),strandTip=new T.Vector3();
const axes=new T.Vector3(),origin=new T.Vector3();

export function enemyCurrent(root,bounds,{tint,effect,shape,field,pao,mobile,weapons,profile,body}){
  const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
  center.x=T.MathUtils.clamp(center.x,-.25,.25);
  center.z=T.MathUtils.clamp(center.z,-.30,.30);
  const radiusX=Math.min(size.x*.44,size.y*(field?.53:.62));
  const radiusZ=Math.min(size.z*.49,size.y*.50);
  const surface=profile?.anchor??body??root;
  const surfaceOffset=profile?.offset?new T.Vector3(...profile.offset):surface.worldToLocal(root.localToWorld(center.clone()));
  const surfaceSpan=profile?.span?new T.Vector3(...profile.span):new T.Vector3(radiusX*.64,size.y*.54,radiusZ*.72);
  const hues=new T.Color(tint);
  const links=weapons.slice(0,2);
  const trail=Array.from({length:pathSamples},()=>new T.Vector4(0,0,0,0));
  const sampled=trail.map(()=>new T.Vector4(0,0,0,-Infinity));
  let lastSample=-Infinity;
  let lastRelease=null;
  let lastPose;
  let idleClock=(tint%811)/811;
  const idlePeriod=2.35+(tint%31)*.022;
  const uniforms={
    clock:{value:0},force:{value:0},stage:{value:0},style:{value:flavors[shape]??flavors[effect]??4},
    strength:{value:0},scaleUnit:{value:1},center:{value:new T.Vector3()},span:{value:new T.Vector3()},
    surfaceOrigin:{value:new T.Vector3()},surfaceSpan:{value:surfaceSpan},surfaceAxes:{value:new T.Matrix3()},
    grip:{value:[new T.Vector4(),new T.Vector4()]},tip:{value:[new T.Vector4(),new T.Vector4()]},
    wake:{value:trail},tint:{value:hues},heart:{value:hues.clone().lerp(new T.Color(0xfff1dc),.76)},
    weaponPower:{value:0},ringSpin:{value:0},releaseAge:{value:1},
    idleAge:{value:[1,1]},idlePulse:{value:[0,0]},
    weaponKind:{value:Array.from({length:2},(_,i)=>links[i]?.kind==='ring'?2:links[i]?.kind==='bow'?1:0)},
    burstPoint:{value:[new T.Vector4(),new T.Vector4()]},
    burstHeading:{value:[new T.Vector3(0,0,1),new T.Vector3(0,0,1)]},
    weaponPlane:{value:[new T.Vector3(0,0,1),new T.Vector3(0,0,1)]},
  };
  const geometry=currentsGeometry(field,mobile,links.length);
  const shader=new T.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,
    transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,blending:T.AdditiveBlending});
  const mesh=new T.Mesh(geometry,shader);
  mesh.name='敵人 · 能量纏繞及殘跡';
  mesh.frustumCulled=false;
  mesh.renderOrder=34;
  root.add(mesh);

  return {
    mesh,
    update(time,stage,wind,strike,fall,stagger,travel=0,subdued=false,motion=null){
      const charge=Math.max(wind,strike,stagger*.45);
      mesh.visible=fall<.98&&(root.visible||!field);
      if(!mesh.visible)return null;
      root.updateWorldMatrix(true,false);
      const amount=axes.setFromMatrixScale(root.matrixWorld).y;
      bodyPoint.copy(center).applyMatrix4(root.matrixWorld);
      surface.updateWorldMatrix(true,false);
      uniforms.surfaceOrigin.value.copy(surfaceOffset).applyMatrix4(surface.matrixWorld);
      uniforms.surfaceAxes.value.setFromMatrix4(surface.matrixWorld);
      origin.setFromMatrixPosition(root.matrixWorld);
      const anchor=sampled[0];
      const gap=Math.hypot(origin.x-anchor.x,origin.z-anchor.z);
      if(!Number.isFinite(anchor.w)||gap>1.7||time<lastSample){
        for(const point of sampled)point.set(origin.x,bodyPoint.y,origin.z,-Infinity);
        anchor.w=lastSample=time;
      }else if(gap>.105&&time-lastSample>.063){
        for(let i=pathSamples-1;i>0;i--)sampled[i].copy(sampled[i-1]);
        anchor.set(origin.x,bodyPoint.y,origin.z,time);
        lastSample=time;
      }
      for(let i=0;i<pathSamples;i++){
        const sample=sampled[i];
        const age=time-(i===0?sampled[1].w:sample.w);
        const weight=subdued?0:Math.max(0,1-age/.53);
        trail[i].set(i===0?origin.x:sample.x,i===0?bodyPoint.y:sample.y,i===0?origin.z:sample.z,weight);
      }
      const newRelease=!field&&motion&&motion!==lastRelease&&links.length>0&&motion.age<.18;
      let flash=null;
      for(const [index,{node,base,end,width,kind}] of links.entries()){
        node.updateWorldMatrix(true,false);
        weaponPoint.copy(base).applyMatrix4(node.matrixWorld);
        strandTip.copy(end).applyMatrix4(node.matrixWorld);
        const widthInWorld=width*axes.setFromMatrixScale(node.matrixWorld).y;
        uniforms.grip.value[index].set(...weaponPoint,Math.max(.045,widthInWorld));
        uniforms.tip.value[index].set(...strandTip,0);
        if(kind==='ring')uniforms.weaponPlane.value[index].set(0,0,1).transformDirection(node.matrixWorld);
        if(newRelease){
          const at=kind==='ring'?strandTip.lerp(weaponPoint,.5):strandTip;
          const radius=amount*(subdued?.46:kind==='ring'?.89:.78);
          uniforms.burstPoint.value[index].set(...at,radius);
          uniforms.burstHeading.value[index].set(motion.dx??0,kind==='ring'?.38:.12,motion.dz??1).normalize();
          flash??={x:at.x,y:at.y,z:at.z,tint};
        }
      }
      if(newRelease)lastRelease=motion;
      uniforms.weaponPower.value=(wind>.01?T.MathUtils.smoothstep(wind,.12,1):strike*.62)*(subdued?.55:1);
      const elapsed=T.MathUtils.clamp(time-(lastPose??time),0,.055);
      const speed=(2.4+uniforms.weaponPower.value*6.5)*(subdued?.52:1);
      uniforms.ringSpin.value=(uniforms.ringSpin.value+elapsed*speed)%(Math.PI*2);
      idleClock=(idleClock+elapsed)%idlePeriod;
      for(let i=0;i<links.length;i++){
        const age=Math.min(1,((idleClock+i*idlePeriod*.41)%idlePeriod)/.52);
        uniforms.idleAge.value[i]=age;
        uniforms.idlePulse.value[i]=subdued||field?0:T.MathUtils.smoothstep(age,0,.12)*
          (1-T.MathUtils.smoothstep(age,.31,1))*(1-uniforms.weaponPower.value*.72);
      }
      lastPose=time;
      uniforms.releaseAge.value=motion&&motion===lastRelease?T.MathUtils.clamp(motion.age/.48,0,1):1;
      uniforms.clock.value=subdued?time*.45:time;
      uniforms.stage.value=Math.min(2,stage);
      uniforms.force.value=charge;
      uniforms.scaleUnit.value=amount;
      uniforms.center.value.copy(bodyPoint);
      uniforms.span.value.set(radiusX,size.y*.73,radiusZ).multiplyScalar(amount);
      uniforms.strength.value=(1-fall)*(field?.40+travel*.10+charge*.24:pao?.52:1.12)*(subdued?.59:1);
      return flash;
    },
    dispose(){mesh.removeFromParent();geometry.dispose();shader.dispose();},
  };
}
