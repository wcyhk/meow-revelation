import * as T from '../three.min.mjs';

function mist(parent,count,onBlade){
  const quad=new T.PlaneGeometry(1,1);
  const geometry=new T.InstancedBufferGeometry();
  geometry.index=quad.index;
  geometry.setAttribute('position',quad.attributes.position);
  geometry.setAttribute('uv',quad.attributes.uv);
  const seeds=new Float32Array(count*3);
  for(let i=0;i<count;i++)seeds.set([i*2.39996,(i*.61803398875)%1,(i*.41421356)%1],i*3);
  geometry.setAttribute('seeds',new T.InstancedBufferAttribute(seeds,3));
  geometry.instanceCount=count;
  const uniforms={clock:{value:0},force:{value:0},phase:{value:0},blade:{value:onBlade?1:0}};
  const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
    blending:onBlade?T.AdditiveBlending:T.NormalBlending,toneMapped:false,
    vertexShader:`
      attribute vec3 seeds;
      uniform float clock,force,phase,blade;
      varying vec2 shape;
      varying float alpha,detail;
      void main(){
        float age=fract(seeds.y+clock*(.23+seeds.z*.19));
        float orbit=seeds.x+clock*.49+age*1.1;
        float radius=.14+age*.54+seeds.z*.22;
        vec3 point=vec3(cos(orbit)*radius,-.20+age*.34+sin(orbit*2.)*.11,sin(orbit)*radius);
        vec3 along=vec3(sin(orbit)*(.052+age*.09),.43+seeds.y*1.74,cos(orbit)*(.047+age*.12));
        vec4 eye=modelViewMatrix*vec4(mix(point,along,blade),1.);
        float size=mix(.46+age*.80,.12+age*.31,blade)*(1.+force*.32);
        float spin=orbit+seeds.z*2.;
        vec2 corner=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*position.xy;
        eye.xy+=corner*size*length(modelViewMatrix[0].xyz);
        gl_Position=projectionMatrix*eye;
        alpha=smoothstep(0.,.2,age)*(1.-smoothstep(.55,1.,age))*mix(.72+force*.14,(.09+force*.61+phase*.07),blade);
        shape=uv*2.-1.;
        detail=seeds.x+clock*.75;
      }`,
    fragmentShader:`
      uniform float force,blade,phase;
      varying vec2 shape;
      varying float alpha,detail;
      void main(){
        float r=length(shape);
        float grains=sin(shape.x*7.+shape.y*4.+detail)*sin(shape.y*9.-detail*.91)*.12
          +sin(shape.x*17.-shape.y*13.+detail*.53)*.045;
        float feather=1.-smoothstep(.13,.97,r+grains);
        float wisp=pow(max(0.,.5+.5*sin(shape.y*9.5+shape.x*7.+grains*12.+detail)),3.);
        vec3 fog=mix(vec3(.08,.13,.18),vec3(.61,.71,.73),clamp(feather*.66+wisp*.19,0.,1.));
        vec3 arc=mix(vec3(.01,.30,.40),vec3(.70,.99,.87),wisp);
        gl_FragColor=vec4(mix(fog,arc,blade),alpha*feather*mix(.75+wisp*.25,wisp,blade));
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new T.Mesh(geometry,material);
  mesh.name=onBlade?'佳真 · 劍刃青焰':'佳真 · 雲霧';
  mesh.frustumCulled=false;
  mesh.renderOrder=onBlade?4:1;
  parent.add(mesh);
  return {
    pose(time,force,phase){
      mesh.visible=!onBlade||force>.045||phase>0;
      uniforms.clock.value=time;uniforms.force.value=force;uniforms.phase.value=phase;
    },
    dispose(){material.dispose();},
  };
}

export function jadeEffects(clouds,sword,mobile){
  const cloud=mist(clouds,mobile?15:24,false);
  const blade=mist(sword,mobile?6:11,true);
  return {
    pose(time,wind,strike,phase){
      cloud.pose(time,wind*.45+strike*.74,phase);
      blade.pose(time,Math.max(wind*.62,strike),phase);
    },
    dispose(){cloud.dispose();blade.dispose();},
  };
}
