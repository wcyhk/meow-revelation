import * as T from '../three.min.mjs';

const tau=2*Math.PI;
const noise=(index,salt)=>((index+1)*salt)%1;
export const revealCurve=(p,from,to)=>T.MathUtils.smoothstep(p,from,to);

const shotOffset=new T.Vector3(),shotForward=new T.Vector3();

export function wardenShotMix(boss,subdued){
  const change=boss?.phaseChange;
  if(!change||subdued)return 0;
  return revealCurve(change.progress,0,.16)*(1-revealCurve(change.progress,.70,.98));
}

export function frameWardenShot(camera,boss,wideZoom,mix){
  const tight=revealCurve(boss.phaseChange.progress,.32,.68);
  const {height}=boss.spec;
  const {lerp}=T.MathUtils;
  const target=shotOffset.set(boss.x,height*lerp(.60,.74,tight),boss.z+.12);
  target.sub(camera.position);
  shotForward.set(0,0,-1).applyQuaternion(camera.quaternion);
  // Translate in the view plane so the fixed battle angle and depth are preserved.
  camera.position.addScaledVector(target,mix).addScaledVector(shotForward,-target.dot(shotForward)*mix);
  const zoom=Math.min(
    (camera.right-camera.left)/(height*lerp(.79,.51,tight)),
    (camera.top-camera.bottom)/(height*lerp(.88,.54,tight)),
  );
  return lerp(wideZoom,Math.max(wideZoom,zoom),mix);
}

export function wardenDissolve(materials,armoured){
  const amount={value:0},space={value:new T.Matrix4()};
  for(const material of materials){
    const compile=material.onBeforeCompile;
    const key=material.customProgramCacheKey();
    material.customProgramCacheKey=()=>key+'|warden-dissolve-'+Number(armoured);
    material.onBeforeCompile=function(shader){
      compile.call(this,shader);
      shader.uniforms.wardenAmount=amount;
      shader.uniforms.wardenSpace=space;
      shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
        uniform mat4 wardenSpace;
        uniform float wardenAmount;
        varying vec3 wardenPoint;`)
        .replace('#include <project_vertex>',`#include <project_vertex>
          wardenPoint=wardenAmount>.001?(wardenSpace*(modelMatrix*vec4(transformed,1.))).xyz:vec3(0.);`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        uniform float wardenAmount;
        varying vec3 wardenPoint;
        float wardenGrain(vec3 p){
          p=fract(p*.1031);
          p+=dot(p,p.yzx+19.19);
          return fract((p.x+p.y)*p.z);
        }`).replace('#include <color_fragment>',`#include <color_fragment>
        if(wardenAmount>.001){
          vec3 p=wardenPoint;
          float coarse=sin(p.x*11.+p.y*8.7+p.z*6.9)*cos(p.z*8.-p.y*8.5);
          float grain=wardenGrain(floor(p*54.));
          float cut=clamp(.12+p.y*.19+coarse*.13+grain*.18,0.,.99);
          cut=${armoured?'1.-cut':'cut'};
          float edge=cut-wardenAmount;
          if(edge<0.)discard;
          diffuseColor.rgb=mix(diffuseColor.rgb,${armoured?'vec3(1.,.10,.043)':'vec3(1.,1.16,1.45)'},(1.-smoothstep(.005,.062,edge))*.72);
        }`);
    };
  }
  return {amount,space};
}

function haloFragments(parent,mobile){
  const count=mobile?22:34;
  const position=[],centers=[],random=[],colors=[],slices=[];
  // Each fragment contains both silver bands. Geometry is uploaded once with the rig.
  for(let i=0;i<count;i++){
    const angle=tau*i/count,span=tau/count;
    const pivot=[Math.cos(angle)*1.01,Math.sin(angle)*1.01];
    const seed=noise(i,.6180339);
    for(const [radius,half] of [[1.034,.032],[.963,.016]]){
      const vertex=(u,v)=>{
        const a=angle+(u-.5)*span*.982+(v-.5)*span*(seed-.5)*.21;
        const r=radius+(v-.5)*half*2;
        position.push(Math.cos(a)*r-pivot[0],Math.sin(a)*r-pivot[1],(v-.5)*.035);
        centers.push(...pivot);
        random.push(seed);
        slices.push(angle);
        colors.push(v);
      };
      for(const [u,v] of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]])vertex(u,v);
    }
  }
  const geometry=new T.BufferGeometry()
    .setAttribute('position',new T.Float32BufferAttribute(position,3))
    .setAttribute('pivot',new T.Float32BufferAttribute(centers,2))
    .setAttribute('seed',new T.Float32BufferAttribute(random,1))
    .setAttribute('angle',new T.Float32BufferAttribute(slices,1))
    .setAttribute('rim',new T.Float32BufferAttribute(colors,1));
  const material=new T.ShaderMaterial({
    uniforms:{progress:{value:0}},side:T.DoubleSide,forceSinglePass:true,transparent:true,depthWrite:false,
    vertexShader:`
      attribute vec2 pivot;attribute float angle,seed,rim;
      uniform float progress;
      varying float life,edge,flare;
      void main(){
        float cue=.13+.237*angle/6.28318+.115*seed;
        float t=max(0.,progress-cue);
        float spin=t*(7.+19.*seed);
        vec2 twist=vec2(cos(spin),sin(spin));
        vec3 p=position;
        p.xz=mat2(twist.x,-twist.y,twist.y,twist.x)*p.xz;
        p.xy=mat2(cos(spin*.5),-sin(spin*.5),sin(spin*.5),cos(spin*.5))*p.xy;
        vec2 dir=normalize(pivot);
        p.xy+=pivot+dir*t*(.76+seed*2.38);
        p.y+=t*(1.10+seed*.35)-t*t*(2.25+seed);
        p.z+=t*(seed-.43)*1.64;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        life=step(.12,progress)*(1.-smoothstep(.34,.61,t))*(1.-smoothstep(.91,1.,progress));
        edge=rim;
        flare=exp(-t*11.)*(.45+.55*abs(cos(spin)));
      }`,
    fragmentShader:`
      varying float life,edge,flare;
      void main(){
        if(life<.005)discard;
        vec3 tone=mix(vec3(.13,.27,.48),vec3(.94,.98,1.),.58+flare*.33);
        tone*=.81+.18*abs(edge-.5)*2.;
        gl_FragColor=vec4(tone,life*(.69+.30*flare));
      }`,
  });
  const mesh=new T.Mesh(geometry,material);
  mesh.name='晏燈 · 銀輪碎片';
  mesh.renderOrder=31;mesh.frustumCulled=false;
  parent.add(mesh);
  return mesh;
}

function coatAsh(parent,mobile){
  const count=mobile?88:160,position=[],seeds=[];
  for(let i=0;i<count;i++){
    const angle=noise(i,.7548777)*tau,seed=noise(i,.5698403),height=noise(i,.438579);
    const width=.25+(1-height)*.34+.11*seed;
    position.push(Math.cos(angle)*width,.18+height*2.28,Math.sin(angle)*width*.73);
    seeds.push(seed);
  }
  const geometry=new T.BufferGeometry()
    .setAttribute('position',new T.Float32BufferAttribute(position,3))
    .setAttribute('seed',new T.Float32BufferAttribute(seeds,1));
  const material=new T.ShaderMaterial({
    uniforms:{progress:{value:0},pixel:{value:mobile?1.38:1.72}},
    transparent:true,depthWrite:false,
    vertexShader:`
      attribute float seed;uniform float progress,pixel;
      varying float life,heat,spin;
      void main(){
        float t=progress-(.22+position.y*.122+seed*.15);
        float drift=max(0.,t);
        vec3 p=position;
        float swing=seed*26.+drift*9.;
        p.x+=cos(swing)*drift*(1.6+seed*1.8);
        p.y+=drift*(1.3+seed*2.1);
        p.z+=sin(swing)*drift*(1.7+seed);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        life=smoothstep(.0,.065,t)*(1.-smoothstep(.23,.58,t))*(1.-smoothstep(.84,1.,progress));
        gl_PointSize=pixel*(2.+seed*5.)*(1.+drift*.8);
        spin=swing*1.6;
        heat=(1.-smoothstep(.10,.48,drift))*(.3+seed*.7);
      }`,
    fragmentShader:`
      varying float life,heat,spin;
      void main(){
        if(life<.01)discard;
        vec2 p=gl_PointCoord*2.-1.;
        p=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*p;
        float edge=1.-smoothstep(.24,1.,abs(p.x)*1.77+abs(p.y)*.74);
        vec3 tint=mix(vec3(.18,.19,.24),vec3(.95,.83,.81),heat);
        gl_FragColor=vec4(tint,edge*life);
      }`,
  });
  const ash=new T.Points(geometry,material);
  ash.name='晏燈 · 銀袍灰燼';
  ash.renderOrder=33;ash.frustumCulled=false;
  parent.add(ash);
  return ash;
}

export function wardenFragments(form,parent,mobile){
  const shards=haloFragments(parent,mobile);
  const ash=coatAsh(form,mobile);
  return {update(progress){
    shards.visible=progress>=.12&&progress<1;
    ash.visible=progress>=.23&&progress<1;
    shards.material.uniforms.progress.value=progress;
    ash.material.uniforms.progress.value=progress;
  },dispose(){
    shards.material.dispose();
    ash.geometry.dispose();
    ash.material.dispose();
  }};
}
