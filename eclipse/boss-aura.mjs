import * as T from '../three.min.mjs';

const forms={ribbons:0,bolts:1,embers:2,sigils:3,mist:4};

export function shapeAura(root,{tint,shape,anchor=root,offset=[0,1,0],span=[1,1,1]},mobile){
  const form=forms[shape]??forms.ribbons;
  const count=mobile?9:15;
  const geometry=new T.InstancedBufferGeometry();
  const plane=new T.PlaneGeometry(1,1,10,1);
  geometry.index=plane.index;
  geometry.setAttribute('position',plane.attributes.position);
  const seeds=new Float32Array(count*3);
  for(let i=0;i<count;i++)seeds.set([i*2.39996,(i*.61803399)%1,(i*.41421356)%1],i*3);
  geometry.setAttribute('seed',new T.InstancedBufferAttribute(seeds,3));
  geometry.instanceCount=count;
  const uniforms={
    clock:{value:0},force:{value:0},phase:{value:0},visibility:{value:1},form:{value:form},
    dye:{value:new T.Color(tint)},span:{value:new T.Vector3(...span)},center:{value:new T.Vector3(...offset)},
  };
  const material=new T.ShaderMaterial({
    uniforms,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide,
    vertexShader:`
      attribute vec3 seed;
      uniform float clock,force,phase,visibility,form;
      uniform vec3 center,span;
      varying vec2 path;
      varying float fuel,grain;
      void main(){
        float age=fract(seed.y+clock*(.12+seed.z*.23+force*.08));
        float orbit=seed.x+clock*(.54+phase*.34)+(age-.55)*.9;
        float u=position.x+.5;
        float r=.58+seed.z*.20+age*.12+force*.24;
        float angle=orbit+(u-.5)*mix(.39,1.15,force);
        float curl=sin(angle*2.4+seed.x)*.10+sin(u*12.7+seed.x+clock*6.)*.032;
        vec3 at=vec3(cos(angle)*r,(age-.46)*.88+curl,sin(angle)*r)*span;
        if(form>1.5&&form<2.5)at.y+=span.y*(age*age-.2);
        if(form>2.5&&form<3.5)at.y=span.y*(.17+sin(seed.x*1.8)*.19+curl);
        vec3 crossAxis=vec3(cos(angle)*.13,1.,sin(angle)*.13);
        float breadth=mix(.16,.30,force)*(.6+seed.z*.6);
        if(form>3.5)breadth*=1.9;
        if(form>1.5&&form<2.5)breadth*=.58;
        at+=crossAxis*(position.y*breadth);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(at+center,1.);
        path=vec2(u,position.y*2.);
        fuel=smoothstep(0.,.20,age)*(1.-smoothstep(.56,1.,age))*visibility
          *(.16+.38*force+.105*phase)*(.46+.54*seed.z);
        grain=seed.x;
      }
    `,
    fragmentShader:`
      uniform float clock,force,form;
      uniform vec3 dye;
      varying vec2 path;
      varying float fuel,grain;
      void main(){
        float u=path.x;
        float seam=sin(u*10.+grain+clock*3.)*.18+sin(u*22.+grain*.8-clock*4.)*.07;
        if(form>.5&&form<1.5)seam=(abs(fract(u*4.+grain*.31)*2.-1.)-.5)*.67;
        float distance=abs(path.y-seam);
        float tail=smoothstep(0.,.27,u)*(1.-smoothstep(.63,1.,u));
        float core=exp(-distance*(form>3.5?7.:14.));
        float bloom=exp(-distance*(form>3.5?2.:5.7))*.69;
        if(form>1.5&&form<2.5)tail*=pow(.5+.5*sin(u*27.+grain),3.);
        if(form>2.5&&form<3.5){
          float rune=abs(fract(u*12.+grain*.09)*2.-1.);
          core=max(core*.7,exp(-rune*14.)*exp(-abs(path.y)*2.8));
        }
        float edge=1.-smoothstep(.63,1.,abs(path.y));
        vec3 glow=mix(dye,vec3(1.,.95,.85),core*.62);
        gl_FragColor=vec4(glow,(core*.95+bloom)*tail*edge*fuel);
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh=new T.Mesh(geometry,material);
  mesh.name='盤旋能量';
  mesh.frustumCulled=false;
  mesh.renderOrder=8;
  anchor.add(mesh);
  return {
    mesh,
    update(time,stage,wind,strike,fall,stagger){
      uniforms.clock.value=time;
      uniforms.force.value=Math.max(wind*.83,strike,stagger*.34);
      uniforms.phase.value=Math.min(2,stage);
      uniforms.visibility.value=1-fall;
    },
    dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();},
  };
}
