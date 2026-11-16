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
  geometry.setAttribute('strand',new T.InstancedBufferAttribute(new Float32Array(strands),3));
  geometry.instanceCount=strands.length/3;
  return geometry;
}

const vertex=`
  attribute vec3 strand;
  uniform float clock,force,stage,style,strength,scaleUnit;
  uniform vec3 center,span;
  uniform vec4 grip[2],tip[2];
  uniform vec4 wake[6];
  varying vec2 ribbon;
  varying float opacity,seed,kind;
  vec3 normalTo(vec3 axis){
    return normalize(cross(axis,abs(axis.y)>.82?vec3(1.,0.,0.):vec3(0.,1.,0.)));
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
    }else{
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
    gl_FragColor=vec4(glow,energy*(kind>2.5?1.27:1.));
    #include <colorspace_fragment>
  }
`;

const bodyPoint=new T.Vector3(),weaponPoint=new T.Vector3(),strandTip=new T.Vector3();
const axes=new T.Vector3(),origin=new T.Vector3();

export function enemyCurrent(root,bounds,{tint,effect,shape,field,pao,mobile,weapons}){
  const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
  center.x=T.MathUtils.clamp(center.x,-.25,.25);
  center.z=T.MathUtils.clamp(center.z,-.30,.30);
  const radiusX=Math.min(size.x*.44,size.y*(field?.53:.62));
  const radiusZ=Math.min(size.z*.49,size.y*.50);
  const hues=new T.Color(tint);
  const links=weapons.slice(0,2);
  const trail=Array.from({length:pathSamples},()=>new T.Vector4(0,0,0,0));
  const sampled=trail.map(()=>new T.Vector4(0,0,0,-Infinity));
  let lastSample=-Infinity;
  const uniforms={
    clock:{value:0},force:{value:0},stage:{value:0},style:{value:flavors[shape]??flavors[effect]??4},
    strength:{value:0},scaleUnit:{value:1},center:{value:new T.Vector3()},span:{value:new T.Vector3()},
    grip:{value:[new T.Vector4(),new T.Vector4()]},tip:{value:[new T.Vector4(),new T.Vector4()]},
    wake:{value:trail},tint:{value:hues},heart:{value:hues.clone().lerp(new T.Color(0xfff1dc),.76)},
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
    update(time,stage,wind,strike,fall,stagger,travel=0,subdued=false){
      const charge=Math.max(wind,strike,stagger*.45);
      mesh.visible=fall<.98&&(root.visible||!field);
      if(!mesh.visible)return;
      root.updateWorldMatrix(true,false);
      const amount=axes.setFromMatrixScale(root.matrixWorld).y;
      bodyPoint.copy(center).applyMatrix4(root.matrixWorld);
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
      for(const [index,{node,base,end,width}] of links.entries()){
        node.updateWorldMatrix(true,false);
        weaponPoint.copy(base).applyMatrix4(node.matrixWorld);
        strandTip.copy(end).applyMatrix4(node.matrixWorld);
        uniforms.grip.value[index].set(...weaponPoint,Math.max(.045,width*amount));
        uniforms.tip.value[index].set(...strandTip,0);
      }
      uniforms.clock.value=subdued?time*.45:time;
      uniforms.stage.value=Math.min(2,stage);
      uniforms.force.value=charge;
      uniforms.scaleUnit.value=amount;
      uniforms.center.value.copy(bodyPoint);
      uniforms.span.value.set(radiusX,size.y*.73,radiusZ).multiplyScalar(amount);
      uniforms.strength.value=(1-fall)*(field?.40+travel*.10+charge*.24:pao?.52:1.12)*(subdued?.59:1);
    },
    dispose(){mesh.removeFromParent();geometry.dispose();shader.dispose();},
  };
}
