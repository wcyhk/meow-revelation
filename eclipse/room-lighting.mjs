import * as T from '../three.min.mjs';

const leafPlane=new T.PlaneGeometry(1,1);
const ground=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const colors={
  grove:[0x91b9ff,0xffb678,0x5d81bd,.54,1.9],
  canal:[0x85efda,0xffbe82,0x54bec6,.77,2.1],
  lotus:[0x9ee7d8,0xffac9d,0x83c3d8,.67,1.85],
  frost:[0x9ecbff,0xcdedff,0x9ab3fa,.81,2.52],
  forge:[0x83acd2,0xffa271,0xb45d3e,.69,2.20],
  grave:[0xbdb3ff,0xffc6ac,0x777bb9,.62,1.95],
  vault:[0xbdcee6,0xffd092,0xc08b69,.71,2.26],
  dunes:[0xde9f8e,0xffc681,0x955e67,.49,2.42],
  fungus:[0x78cad3,0xcc9afb,0x4c9fa6,.80,1.9],
  cathedral:[0xa8bfff,0xc2a0ff,0x7779c3,.91,2.34],
  desecrated:[0xbc98f4,0xff9ea4,0x985b91,.78,2.18],
  throne:[0x8cbbff,0xfb89a8,0x655bab,.75,2.2],
  crimson:[0xcc90e1,0xff735d,0xad3655,.79,2.1],
};

function shaft(view,group,from,to,width,color,index){
  const axis=new T.Vector3().fromArray(to).sub(new T.Vector3().fromArray(from));
  const material=new T.ShaderMaterial({
    uniforms:{color:{value:new T.Color(color)},density:{value:.13},clock:{value:0},seed:{value:index+1}},
    transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,blending:T.AdditiveBlending,
    vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`
      varying vec2 v;
      uniform vec3 color;
      uniform float density,clock,seed;
      void main(){
        float x=v.x*2.-1.;
        float spread=mix(.25,1.,v.y);
        float fade=smoothstep(0.,.12,v.y)*(1.-smoothstep(.70,1.,v.y));
        float veil=exp(-pow(x/spread*2.65,2.));
        float bars=pow(.5+.5*sin(x*15./spread+v.y*2.5+seed),3.);
        float dust=.91+sin(v.y*46.+x*13.+clock*.83+seed*4.)*.087;
        gl_FragColor=vec4(color,veil*fade*(.46+bars*.35)*density*dust);
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new T.Mesh(leafPlane,material);
  mesh.position.fromArray(from).addScaledVector(axis,.50);
  const up=axis.clone().normalize();
  const eye=new T.Vector3(0,0,1).applyQuaternion(view.camera.quaternion);
  const across=new T.Vector3().crossVectors(up,eye).normalize();
  const normal=new T.Vector3().crossVectors(across,up).normalize();
  mesh.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(across,up,normal));
  mesh.scale.set(width,axis.length(),1);
  mesh.renderOrder=5;
  group.add(mesh);
  return material;
}

function radiance(root,slots,accent,hot){
  const material=new T.ShaderMaterial({
    uniforms:{accent:{value:new T.Color(accent)},hot:{value:new T.Color(hot)},strength:{value:1},clock:{value:0}},
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`
      varying vec2 v;varying float layer;
      attribute float warm;
      void main(){
        v=uv*2.-1.;layer=warm;
        gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);
      }`,
    fragmentShader:`
      varying vec2 v;varying float layer;
      uniform vec3 accent,hot;uniform float strength,clock;
      void main(){
        float d=dot(v,v);
        float edge=(1.-smoothstep(.35,1.,d))*exp(-3.8*d);
        float flicker=.90+sin(clock*7.5+layer*9.)*.07+sin(clock*14.)*.028;
        gl_FragColor=vec4(mix(accent,hot,layer),edge*strength*mix(.14,.29,layer)*flicker);
        #include <colorspace_fragment>
      }`,
  });
  const geo=ground.clone().setAttribute('warm',new T.InstancedBufferAttribute(new Float32Array(slots.map(a=>a[4])),1));
  const pile=new T.InstancedMesh(geo,material,slots.length);
  const base=new T.Object3D();
  slots.forEach(([x,z,scale,width],i)=>{
    base.position.set(x,.038+(i%3)*.003,z);
    base.rotation.y=i*.33;
    base.scale.set(scale,1,width);
    base.updateMatrix();
    pile.setMatrixAt(i,base.matrix);
  });
  pile.renderOrder=5;root.add(pile);
  return material;
}

function motes(group,mobile,color,wind){
  const n=mobile?56:125;
  const positions=new Float32Array(n*3);
  const seeds=new Float32Array(n);
  for(let i=0;i<n;i++){
    positions[i*3]=Math.sin(i*3.187)*17;
    positions[i*3+1]=.5+6.2*(Math.sin(i*9.85)*.5+.5);
    positions[i*3+2]=-14+(i%19)*1.66;
    seeds[i]=(i*1.619)%1;
  }
  const geometry=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(positions,3))
    .setAttribute('seed',new T.BufferAttribute(seeds,1));
  const material=new T.ShaderMaterial({
    uniforms:{ink:{value:new T.Color(color)},clock:{value:0},gain:{value:1},wind:{value:wind}},
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`
      uniform float clock,wind;attribute float seed;varying float twinkle;
      void main(){
        vec3 p=position;p.x+=sin(clock*.23+seed*19.)*.95+wind*sin(clock*.31+p.z*.23);
        p.y=.30+mod(p.y+clock*(.19+seed*.25),6.8);
        p.z+=cos(clock*.55+seed*7.)*.80;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        twinkle=pow(.5+.5*sin(seed*84.+clock*1.7),2.)*smoothstep(.3,1.,p.y);
        gl_PointSize=mix(1.9,4.7,seed);
      }`,
    fragmentShader:`
      uniform vec3 ink;uniform float gain;varying float twinkle;
      void main(){
        float d=length(gl_PointCoord-.5)*2.;
        float glow=(1.-smoothstep(.14,1.,d))*(.43+exp(-d*d*8.)*.57);
        gl_FragColor=vec4(ink,glow*gain*twinkle*.41);
        #include <colorspace_fragment>
      }`,
  });
  group.add(new T.Points(geometry,material));
  return material;
}

export class RoomLighting {
  constructor(view){
    this.view=view;
    this.key=new T.DirectionalLight(0xadbaff,0);
    this.fill=new T.DirectionalLight(0xffce9c,0);
    this.fill.position.set(9,6,8);
    this.volume=new T.Group();
    view.scene.add(this.key,this.fill,this.volume);
    // Only the main battlefield casts a cached shadow map. Multiple previews can
    // open on the same GPU, so each one keeps its cheaper floor contact shadows.
    if(view.lanternArt){
      const renderer=view.renderer;
      renderer.shadowMap.enabled=true;
      renderer.shadowMap.autoUpdate=false;
      renderer.shadowMap.type=T.PCFShadowMap;
      this.key.castShadow=true;
      this.key.shadow.mapSize.setScalar(view.mobile?1024:1536);
      const camera=this.key.shadow.camera;
      Object.assign(camera,{left:-23,right:23,top:26,bottom:-23,near:.5,far:75});
      camera.updateProjectionMatrix();
      this.key.shadow.normalBias=.049;
      this.key.shadow.bias=-.00038;
      this.key.shadow.intensity=.72;
    }
  }

  clear(){
    this.volume.traverse(part=>{
      if(part.material)part.material.dispose();
      if(part.isInstancedMesh)part.dispose();
      if(part.geometry&&part.geometry!==leafPlane&&part.geometry!==ground)part.geometry.dispose();
    });
    this.volume.clear();
  }

  set(type,stage,lamps){
    this.clear();
    const [key,accent,air,density,intensity]=colors[type];
    this.level=intensity;
    this.density=density;
    this.glass=['cathedral','desecrated','throne','crimson'].includes(type);
    this.key.color.setHex(key);
    this.fill.color.setHex(accent);
    const direction=stage.room%3===2?-1:1;
    this.key.position.set(-direction*12,15,-9.5);
    this.key.target.position.set(direction*2,0,3);
    this.view.scene.add(this.key.target);
    if(this.key.castShadow)this.view.renderer.shadowMap.needsUpdate=true;
    this.beams=[];
    for(let index=0;index<(this.view.mobile?3:5);index++){
      const x=(index-(this.view.mobile?1:2))*5.1+direction*1.5;
      const z=-5.4+(index%3)*2.7;
      const hue=index%3===2?accent:key;
      this.beams.push(shaft(this.view,this.volume,
        [x-direction*(3.2+index*.43),8.7+index*.44,z-9.3],[x,.35,z+3.1],5.2,hue,index));
    }
    const slots=lamps.map(({x,z})=>[x,z,3.25,3.09,1]);
    slots.push([-5.1,-3.3,9.0,11.2,0],[5.2,-2.8,10.7,11.9,0],[0,6.3,8.8,9.5,0]);
    this.pools=radiance(this.volume,slots,key,accent);
    this.embers=motes(this.volume,this.view.mobile,air,['dunes','forge'].includes(type)?2.1:.3);
  }

  light(darkness){
    this.key.intensity=this.level*(1-.74*darkness);
    this.fill.intensity=.72*(1-.63*darkness);
    const strength=this.glass?.47:.39;
    for(const beam of this.beams)beam.uniforms.density.value=this.density*(1-darkness*.89)*strength;
    this.pools.uniforms.strength.value=1-darkness*.83;
    this.embers.uniforms.gain.value=1-darkness*.58;
  }

  tick(time){
    const clock=time%720;
    for(const beam of this.beams)beam.uniforms.clock.value=clock;
    this.pools.uniforms.clock.value=clock;
    this.embers.uniforms.clock.value=clock;
  }
}
