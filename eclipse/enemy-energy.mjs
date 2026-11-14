import * as T from '../three.min.mjs';

const energyStyles={
  fire:[0,1.02,.99],ember:[0,1.02,.99],ice:[1,.62,.86],frost:[1,.62,.86],
  water:[2,.91,.77],teal:[2,.91,.77],void:[3,1.17,.66],violet:[3,1.17,.66],
  blood:[4,.77,.57],stone:[5,.47,.49],bone:[5,.47,.49],
  lightning:[6,1.42,.87],amber:[6,1.42,.87],gold:[7,.88,.70],
  root:[8,.66,.63],moss:[8,.66,.63],venom:[8,.66,.63],web:[8,.55,.73],
  wind:[9,1.13,.80],jade:[9,1.13,.80],feather:[9,1.13,.80],
};

export function enemyEnergy(root,bounds,entry,tint,mobile){
  const field=!!entry.field;
  const [form,rate,weight]=energyStyles[entry.effect??entry.tone]??energyStyles.stone;
  const seed=Array.from(entry.id).reduce((a,b)=>(a*31+b.charCodeAt(0))%65521,0);
  const count=field?(mobile?7:12):(mobile?21:36);
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const salt=(seed+i*113)%131/131;
    positions.set([i*2.399+seed*.002,((i+1)*.718+salt*.1)%1,salt],i*3);
  }
  const geometry=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3));
  const uniforms={
    clock:{value:0},energy:{value:0},charge:{value:0},phase:{value:0},
    style:{value:form},rate:{value:rate},tint:{value:new T.Color(tint)},
    shade:{value:new T.Color(tint).lerp(new T.Color(form===0?0xff5430:form===4?0x8f1930:0x687cdc),.57)},
    mid:{value:bounds.getCenter(new T.Vector3())},span:{value:bounds.getSize(new T.Vector3())},
    grain:{value:field?.71:1},
  };
  const material=new T.ShaderMaterial({uniforms,transparent:true,blending:T.AdditiveBlending,
    depthWrite:false,toneMapped:false,
    vertexShader:`
      uniform float clock,energy,charge,rate,style,grain,phase;
      uniform vec3 mid,span;
      varying float heat,salt,angle;
      void main(){
        salt=position.z;
        float age=fract(position.y+clock*(.27+salt*.21)*rate);
        angle=position.x+clock*(.72+phase*.38)*rate+(age-.5)*1.3;
        float orbit=.29+age*.30+charge*.13;
        float wobble=sin(age*6.28+position.x)*.11;
        vec3 loc=mid+vec3(cos(angle)*(orbit+wobble)*span.x,
          (age-.50)*span.y,sin(angle)*(orbit-wobble)*span.z);
        if(style>3.5&&style<5.5)loc.y=mid.y+(age*age-.51)*span.y*.84;
        vec4 eye=modelViewMatrix*vec4(loc,1.);
        gl_Position=projectionMatrix*eye;
        heat=smoothstep(0.,.14,age)*(1.-smoothstep(.72,1.,age))*(.39+.61*salt);
        gl_PointSize=clamp(grain*(1.5+energy*3.7+charge*5.4+salt*2.3),1.,13.);
      }`,
    fragmentShader:`
      uniform float style,energy;
      uniform vec3 tint,shade;
      varying float heat,salt,angle;
      void main(){
        vec2 p=gl_PointCoord*2.-1.;
        float a=style<.5?0.:salt*7.3+angle*.34;
        p=mat2(cos(a),-sin(a),sin(a),cos(a))*p;
        float d=length(p);
        if(style<.5)d=length(vec2(p.x*(1.25+.54*max(0.,-p.y)),p.y*.65));
        else if(style<1.5)d=abs(p.x+p.y*.28)*1.12+abs(p.y)*.65;
        else if(style<2.5)d=length(vec2(p.x,p.y*1.36))-.29;
        else if(style<3.5)d=abs(length(p)-.33)*1.35;
        else if(style<4.5)d=length(vec2(p.x*1.24,p.y*.91));
        else if(style<5.5)d=length(p*vec2(1.33,.88));
        else if(style<6.5)d=abs(p.x-(abs(p.y+.3)-abs(p.y-.24))*.57)*2.5+abs(p.y)*.38;
        else if(style<7.5)d=abs(p.x)+abs(p.y)*.76;
        else if(style<8.5)d=length(vec2((p.x+p.y)*.78,(p.x-p.y)*1.55));
        else d=length(vec2(p.x*.94,(p.y+p.x*p.x*.48)*2.8));
        float core=exp(-abs(d)*7.);
        float halo=(1.-smoothstep(.06,.77,abs(d)))*(1.-smoothstep(.62,1.02,length(p)));
        gl_FragColor=vec4(mix(shade,tint,.41+core*.52)+core*.27,
          (core*.70+halo*.42)*heat*energy);
        #include <colorspace_fragment>
      }`,
  });
  const particles=new T.Points(geometry,material);
  particles.frustumCulled=false;
  root.add(particles);
  return {
    update(time,stage,wind,strike,fall,stagger){
      uniforms.clock.value=time;
      uniforms.phase.value=stage;
      uniforms.charge.value=wind*.76+strike*.79;
      uniforms.energy.value=weight*(field?.30:.58)*(1-fall)*
        (1+wind*.53+strike*.58+stage*.37+stagger*.13);
    },
    dispose(){geometry.dispose();material.dispose();},
  };
}
