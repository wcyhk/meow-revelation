import * as T from '../three.min.mjs';

const cutMoves=new Set(['cleave','sweep','lance','jaws','cinders','toll']);
const ember=new T.Color(0xff542a),emberCore=new T.Color(0xffd5a0);
const violet=new T.Color(0x9559ff),violetCore=new T.Color(0xe9d4ff);
const vertexShader=`
  attribute float birth;
  uniform float clock,lifetime;
  varying vec2 wake;
  void main(){
    wake=vec2(uv.x,clamp((clock-birth)/lifetime,0.,1.));
    // Samples stay in the world when the bearer turns or steps away.
    gl_Position=projectionMatrix*viewMatrix*vec4(position,1.);
  }`;
const fragmentShader=`
  uniform float strength;
  uniform vec3 outer,core;
  varying vec2 wake;
  void main(){
    float edge=wake.x, age=wake.y;
    float fade=1.-smoothstep(.08,1.,age);
    float rim=pow(edge,12.);
    float grain=.5+.5*sin(edge*24.+age*27.);
    float shear=smoothstep(.03,.18,edge)*pow(edge,1.9);
    float alpha=(shear*(.22+grain*.18)+rim*.62)*fade*fade*strength;
    gl_FragColor=vec4(mix(outer,core,rim*.88),alpha);
  }`;

export function createWardenBladeWake(parent,mobile){
  const capacity=mobile?13:19;
  const points=new Float32Array(capacity*6),births=new Float32Array(capacity*2);
  const uv=new Float32Array(capacity*4),indices=[];
  for(let i=0;i<capacity;i++){
    uv.set([0,0,1,0],i*4);
    if(i>0){
      const a=i*2-2;
      indices.push(a,a+1,a+2,a+1,a+3,a+2);
    }
  }
  const position=new T.BufferAttribute(points,3).setUsage(T.DynamicDrawUsage);
  const birth=new T.BufferAttribute(births,1).setUsage(T.DynamicDrawUsage);
  const geometry=new T.BufferGeometry().setIndex(indices)
    .setAttribute('position',position).setAttribute('birth',birth)
    .setAttribute('uv',new T.BufferAttribute(uv,2));
  const uniforms={clock:{value:0},lifetime:{value:.26},strength:{value:0},
    outer:{value:ember.clone()},core:{value:emberCore.clone()}};
  const material=new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,
    depthWrite:false,side:T.DoubleSide,forceSinglePass:true,toneMapped:false,blending:T.AdditiveBlending});
  const mesh=new T.Mesh(geometry,material);
  mesh.name='王冠守夜者 · 劍尖殘光';
  mesh.frustumCulled=false;
  mesh.renderOrder=31;
  geometry.setDrawRange(0,0);
  parent.add(mesh);
  const heel=new T.Vector3(),tip=new T.Vector3(),latest=new T.Vector3();
  let samples=0,stroke,emitted=false,lastTime=-Infinity;

  function append(weapon,edge,time,narrow){
    const anchor=edge?.node??weapon.node;
    anchor.updateWorldMatrix(true,false);
    const matrix=anchor.matrixWorld;
    tip.copy(edge?.tip??weapon.end).applyMatrix4(matrix);
    heel.copy(edge?.heel??weapon.base).lerp(edge?.tip??weapon.end,narrow?.77:.34).applyMatrix4(matrix);
    if(samples){
      const span=latest.distanceToSquared(tip);
      if(span<.0016)return;
      if(span>36)samples=0;
    }
    if(samples===capacity){
      points.copyWithin(0,6);
      births.copyWithin(0,2);
      samples--;
    }
    const vertex=samples*2;
    heel.toArray(points,vertex*3);
    tip.toArray(points,vertex*3+3);
    births[vertex]=births[vertex+1]=time;
    latest.copy(tip);
    samples++;
    position.needsUpdate=true;
    birth.needsUpdate=true;
  }

  return {
    pose(weapon,edge,{attack,release,wind,time,stage,fall,subdued,transition}){
      const pattern=(attack??release)?.pattern;
      if(transition||fall>.25||stage===0||time<lastTime||(pattern&&pattern!==stroke)||(attack&&emitted)){
        samples=0;
        emitted=false;
      }
      stroke=pattern;
      lastTime=time;
      if(!transition&&fall<=.25&&stage>0&&cutMoves.has(pattern)){
        if((attack&&wind>.63)||(release&&release.age<.16)){
          append(weapon,edge,time,pattern==='lance');
        }
        if(release)emitted=true;
      }
      const lifetime=subdued?.15:.26;
      const age=samples?time-births[samples*2-1]:Infinity;
      const visible=emitted&&samples>1&&age<lifetime;
      geometry.setDrawRange(0,visible?(samples-1)*6:0);
      if(!visible){
        if(emitted&&age>=lifetime){samples=0;emitted=false;}
        return;
      }
      uniforms.clock.value=time;
      uniforms.lifetime.value=lifetime;
      uniforms.strength.value=subdued?.34:.84;
      uniforms.outer.value.copy(stage===2?violet:ember);
      uniforms.core.value.copy(stage===2?violetCore:emberCore);
    },
    dispose(){material.dispose();},
  };
}
