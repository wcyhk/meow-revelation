import * as T from '../three.min.mjs';

const samples=128;
const reach=20;
const tau=Math.PI*2;
const fragmentCode=`
  uniform sampler2D lanternOcclusion;
  uniform vec3 lanternSource;
  varying vec3 lanternShadowPoint;
  float lanternVisibility(vec3 point){
    vec2 ray=point.xz-lanternSource.xz;
    float distanceToLight=length(ray);
    float direction=atan(ray.y,ray.x)/6.2831853;
    vec2 blocker=texture2D(lanternOcclusion,vec2(fract(direction+.5),.5)).rg*20.;
    float crossing=mix(lanternSource.y,point.y,blocker.x/max(.01,distanceToLight));
    float behind=smoothstep(blocker.x+.08,blocker.x+.57,distanceToLight);
    return 1.-behind*smoothstep(crossing-.11,crossing+.255,blocker.y)*.96;
  }
`;

export class LanternShadow {
  constructor(){
    this.pixels=new Uint8Array(samples*4);
    for(let i=0;i<samples;i++)this.pixels.set([255,0,0,255],i*4);
    this.depths=new Float32Array(samples);
    this.rays=Array.from({length:samples},(_,i)=>{
      const a=((i+.5)/samples-.5)*tau;
      return [Math.cos(a),Math.sin(a)];
    });
    this.texture=new T.DataTexture(this.pixels,samples,1);
    this.texture.wrapS=T.RepeatWrapping;
    this.texture.minFilter=this.texture.magFilter=T.LinearFilter;
    this.texture.needsUpdate=true;
    this.uniforms={lanternOcclusion:{value:this.texture},lanternSource:{value:new T.Vector3()}};
    this.last=new T.Vector2(Infinity,0);
  }

  setObstacles(permanent,props){
    const monuments=props.map(prop=>({...prop,height:.94+(prop.style??2)*.23}));
    this.obstacles=[...permanent,...monuments];
    this.last.set(Infinity,0);
  }

  update(light,pillars,breakables){
    const {x,z}=light.position;
    this.uniforms.lanternSource.value.copy(light.position);
    const alive=breakables?.reduce((count,prop)=>count+(prop.hp>0),0)??0;
    if((x-this.last.x)**2+(z-this.last.y)**2<.052**2&&this.pillars===pillars&&this.alive===alive)return;
    this.last.set(x,z);
    this.pillars=pillars;
    this.alive=alive;
    this.depths.fill(reach);
    for(let i=0;i<samples;i++){
      this.pixels[i*4]=255;
      this.pixels[i*4+1]=0;
    }
    for(const group of [this.obstacles,pillars,breakables]){
      if(!group)continue;
      for(const prop of group){
        if(prop.hp<=0||!prop.radius)continue;
        const dx=prop.x-x,dz=prop.z-z,radius=prop.radius*.81;
        const distanceSquared=dx*dx+dz*dz;
        if(distanceSquared>(light.distance+radius)**2||distanceSquared<radius*radius)continue;
        const height=prop.height??prop.h??(prop.style==='urn'?.92:2.8);
        for(let i=0;i<samples;i++){
          const [rx,rz]=this.rays[i];
          const line=dx*rx+dz*rz;
          const intercept=line*line-distanceSquared+radius*radius;
          if(intercept<=0||line<=0)continue;
          const entry=line-Math.sqrt(intercept);
          if(entry>=this.depths[i])continue;
          this.depths[i]=entry;
          this.pixels[i*4]=Math.round(entry/reach*255);
          this.pixels[i*4+1]=Math.round(Math.min(reach,height)/reach*255);
        }
      }
    }
    this.texture.needsUpdate=true;
  }

  apply(material){
    const previous=material.onBeforeCompile,key=material.customProgramCacheKey();
    material.customProgramCacheKey=()=>key+'|lantern-occlusion';
    material.onBeforeCompile=shader=>{
      previous.call(material,shader);
      Object.assign(shader.uniforms,this.uniforms);
      shader.vertexShader='varying vec3 lanternShadowPoint;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
        vec4 lanternWorld=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          lanternWorld=instanceMatrix*lanternWorld;
        #endif
        lanternShadowPoint=(modelMatrix*lanternWorld).xyz;
        #include <project_vertex>
      `);
      shader.fragmentShader=fragmentCode+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',
        T.ShaderChunk.lights_fragment_begin.replace(
          'getPointLightInfo( pointLight, geometryPosition, directLight );',
          `getPointLightInfo( pointLight, geometryPosition, directLight );
           if(distance(pointLight.position,(viewMatrix*vec4(lanternSource,1.)).xyz)<.025)
             directLight.color*=lanternVisibility(lanternShadowPoint);`
        ));
    };
    material.needsUpdate=true;
  }

  ground(){
    return fragmentCode.replace('  varying vec3 lanternShadowPoint;','');
  }
}
