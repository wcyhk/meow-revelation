import * as T from '../three.min.mjs';
import {RoomCutaway} from './room-cutaway.mjs?v=world-3d-1';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2;
const floorUp=new T.Vector3(0,1,0);
const groundPlane=new T.Plane(floorUp,0);

function polar(radius,angle){return [Math.cos(angle)*radius,Math.sin(angle)*radius];}

function stoneFloor(){
  const texture=document.createElement('canvas');
  texture.width=texture.height=768;
  const c=texture.getContext('2d');
  const n=768,mid=n/2,k=n/24;
  c.fillStyle='#141924';c.fillRect(0,0,n,n);
  let seed=72634;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(let y=0;y<n;y+=36)for(let x=0;x<n;x+=61){
    const b=24+rand()*12;
    c.fillStyle=`rgb(${b*.62} ${b*.81} ${b*1.16})`;
    c.fillRect(x+(y/36%2)*30-30,y,60,35);
  }
  for(let i=0;i<11200;i++){
    const x=rand()*n,y=rand()*n;
    c.fillStyle=i%2?'#9b958311':'#06070c25';
    c.fillRect(x,y,rand()*5+.4,rand()*2+.35);
  }
  c.translate(mid,mid);
  const ring=(r,w,color)=>{
    c.beginPath();c.arc(0,0,r*k,0,TAU);c.lineWidth=w;c.strokeStyle=color;c.stroke();
  };
  for(const [r,w,col] of [[2.03,2,'#946a40'],[2.22,1,'#705939'],[2.71,2,'#8a6a40'],
    [4.31,2.3,'#ab8451'],[4.43,.9,'#765935'],[4.87,2,'#a58756'],[5.20,1.5,'#695833'],[6.50,2,'#a17b4f'],
    [6.61,.8,'#53492f'],[7.71,1.6,'#735337'],[9.04,2.85,'#a58154'],[9.16,.98,'#64472d'],[9.76,2,'#ad8551'],
    [10.53,1.6,'#705b42'],[10.72,1,'#4b4c46'],[11.30,2,'#6a5a3d']])ring(r,w,col);
  for(let i=0;i<72;i++){
    c.save();c.rotate(i*TAU/72);
    c.strokeStyle=i%6===0?'#a98a58':'#786141';c.lineWidth=i%6===0?1.5:.67;
    const x=(i%6===0?4.90:5.04)*k;
    c.beginPath();c.moveTo(x,0);c.lineTo(5.20*k,0);c.stroke();
    if(i%2===0){
      c.translate(9.44*k,0);
      c.beginPath();c.moveTo(-4.6,0);c.lineTo(0,-6.4);c.lineTo(4.6,0);c.lineTo(0,6.4);c.closePath();c.stroke();
    }
    c.restore();
  }
  for(let i=0;i<26;i++){
    c.save();c.rotate(i*TAU/26);
    for(const [r,j] of [[5.78,0],[8.24,1]]){
      c.save();c.translate(r*k,0);c.rotate(PI/2);
      c.lineWidth=1.16;c.strokeStyle=j?'#685c48':'#a88a54';c.beginPath();
      c.moveTo(-5,7);c.lineTo(-2,-7);c.lineTo(4,-4);c.lineTo(2,8);
      if(i%3===0){c.moveTo(-4,-2);c.lineTo(7,2);}
      if(i%2===0){c.moveTo(-7,3);c.lineTo(1,-6);}
      c.stroke();
      c.restore();
    }
    c.restore();
  }
  for(let i=0;i<12;i++){
    const a=i*TAU/12,b=a+PI/6;
    const [x,y]=polar(4.30*k,a),[tx,ty]=polar(4.30*k,b),[mx,my]=polar(2.75*k,a+PI/12);
    c.beginPath();c.moveTo(x,y);c.lineTo(mx,my);c.lineTo(tx,ty);
    c.strokeStyle='#7f73526e';c.lineWidth=1;c.stroke();
  }
  const map=new T.CanvasTexture(texture);
  map.colorSpace=T.SRGBColorSpace;
  map.anisotropy=4;
  return map;
}

function glassFace(){
  const c=document.createElement('canvas');
  c.width=384;c.height=640;
  const g=c.getContext('2d'),w=c.width,h=c.height;
  g.clearRect(0,0,w,h);
  const clip=new Path2D('M 23 616 L 23 202 Q 34 98 192 16 Q 350 98 361 202 L 361 616 Z');
  g.save();g.clip(clip);
  g.fillStyle='#1c2b67';g.fillRect(0,0,w,h);
  const tones=['#344d98','#565cb1','#7b58a1','#418bc6','#96d5f0','#253c79','#d68469','#e1a66a','#b85672','#ecce8d'];
  for(let row=-1;row<10;row++)for(let col=-1;col<7;col++){
    const x=col*61+(row%2)*29,y=row*65;
    const tiles=[[[x,y],[x+61,y],[x+33,y+65]],[[x+61,y],[x+92,y+65],[x+33,y+65]]];
    for(const [index,points] of tiles.entries()){
      const mod=(Math.abs(row*19+col*13+index*5)%tones.length);
      g.beginPath();points.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();
      g.fillStyle=tones[mod];g.fill();g.lineWidth=2.6;g.strokeStyle='#172039';g.stroke();
    }
  }
  g.fillStyle='#111d32e8';g.beginPath();g.ellipse(192,280,118,136,0,0,TAU);g.fill();
  for(const [radius,color,weight] of [[112,'#caad6e',5],[94,'#a79989',2],[74,'#c9af84',1.7]]){
    g.beginPath();g.arc(192,280,radius,0,TAU);g.strokeStyle=color;g.lineWidth=weight;g.stroke();
  }
  g.translate(192,280);
  for(let i=0;i<12;i++){
    g.rotate(TAU/12);
    g.beginPath();g.moveTo(17,0);g.quadraticCurveTo(52,-43,88,0);g.quadraticCurveTo(47,34,17,0);
    g.fillStyle=tones[i%3===0?9:i%2===0?4:2];g.fill();g.strokeStyle='#263050';g.lineWidth=3;g.stroke();
  }
  g.beginPath();g.moveTo(-21,-25);g.lineTo(-11,-14);g.quadraticCurveTo(0,-20,11,-14);g.lineTo(22,-25);
  g.lineTo(24,6);g.quadraticCurveTo(20,24,0,27);g.quadraticCurveTo(-20,24,-24,6);g.closePath();
  g.fillStyle='#f9e1ac';g.fill();g.strokeStyle='#432e61';g.lineWidth=2;g.stroke();
  g.fillStyle='#4b3475';g.fillRect(-10,0,5,4);g.fillRect(5,0,5,4);
  g.restore();
  g.strokeStyle='#9b7966';g.lineWidth=6;g.stroke(clip);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  return map;
}

const beamGeo=new T.PlaneGeometry(1,1).rotateX(-PI/2);
const glowGeo=new T.PlaneGeometry(2,2).rotateX(-PI/2);
const sigilGeo=new T.PlaneGeometry(1,1).rotateX(-PI/2);
const glowBall=new T.IcosahedronGeometry(.115);

function halo(parent,x,y,z,r,color,amount,elliptic=1){
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{tint:{value:new T.Color(color)},power:{value:amount}},
    vertexShader:'varying vec2 p;void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 p;uniform vec3 tint;uniform float power;
      void main(){float r=length(p);float f=exp(-r*r*5.)*smoothstep(1.,.55,r);
        gl_FragColor=vec4(tint,power*f);
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new T.Mesh(glowGeo,material);
  mesh.scale.set(r,1,r*elliptic);mesh.position.set(x,y,z);mesh.renderOrder=2;
  parent.add(mesh);return mesh;
}

function beam(parent,from,to,width,tint,index){
  const begin=new T.Vector3(...from),end=new T.Vector3(...to),span=end.clone().sub(begin);
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,
    blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color(tint)},time:{value:index}},
    vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 v;uniform vec3 tint;uniform float time;
      void main(){float u=v.x*2.-1.,y=v.y;
        float core=exp(-u*u*3.2);float rays=pow(.5+.5*sin(v.x*34.+y*3.+time*.25),4.);
        float fade=smoothstep(0.,.18,y)*(1.-smoothstep(.77,1.,y));
        gl_FragColor=vec4(tint,(core*.06+rays*.025)*fade);
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new T.Mesh(beamGeo,material);
  mesh.position.copy(begin).lerp(end,.5);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),span.clone().normalize());
  mesh.scale.set(width,1,span.length());
  mesh.renderOrder=9;parent.add(mesh);
  return material;
}

function coloredCaustic(parent,map,x,y,z,width,length,angle,power){
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{glass:{value:map},power:{value:power},clock:{value:0}},
    vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 v;uniform sampler2D glass;uniform float power,clock;
      void main(){
        vec2 skew=vec2(v.x+(v.y-.54)*.19,v.y);
        vec4 col=texture2D(glass,skew);
        float distanceFromEdge=max(abs(v.x-.5)*1.85,abs(v.y-.5)*1.95);
        float mask=(1.-smoothstep(.49,.99,distanceFromEdge))*
          (1.-smoothstep(.22,.5,abs(skew.x-.5)));
        float shimmer=.85+.13*sin(v.y*10.+clock*.71)*cos(v.x*17.-clock*.43);
        gl_FragColor=vec4(pow(col.rgb,vec3(1.28)),mask*col.a*power*shimmer);
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new T.Mesh(sigilGeo,material);
  mesh.position.set(x,y,z);mesh.scale.set(width,1,length);mesh.rotation.y=angle;
  mesh.renderOrder=3;
  parent.add(mesh);
  return material;
}

function materialSet(){
  const env=forgeEnvironment();
  const metal=new T.MeshStandardMaterial({color:0x9f6d3b,metalness:.60,roughness:.57,
    envMap:env,envMapIntensity:.86,...scannedSurface('hammered',.33)});
  const basalt=new T.MeshStandardMaterial({color:0x27313d,roughness:.85,metalness:.17,...scannedSurface('leather',.29)});
  const stone=new T.MeshStandardMaterial({color:0x4f4a50,roughness:.83,metalness:.12,...scannedSurface('leather',.31)});
  const recess=new T.MeshStandardMaterial({color:0x110f1d,roughness:.70,metalness:.27,envMap:env,envMapIntensity:.20});
  return {metal,basalt,stone,recess};
}

function meshes(parent){
  const list=new Map();
  const pose=new T.Object3D();
  function put(geometry,material,x,y,z,sx=1,sy=sx,sz=sx,ry=0,rx=0,rz=0){
    pose.position.set(x,y,z);pose.scale.set(sx,sy,sz);pose.rotation.set(rx,ry,rz);pose.updateMatrix();
    if(!list.has(geometry))list.set(geometry,new Map());
    const modes=list.get(geometry);
    if(!modes.has(material))modes.set(material,[]);
    modes.get(material).push(pose.matrix.clone());
  }
  function finish(){
    for(const [geometry,modes] of list)for(const [mat,items] of modes){
      const mesh=new T.InstancedMesh(geometry,mat,items.length);
      for(const [i,matrix] of items.entries())mesh.setMatrixAt(i,matrix);
      mesh.instanceMatrix.needsUpdate=true;
      parent.add(mesh);
    }
  }
  return {put,finish};
}

function crystal(){
  const geometry=new T.IcosahedronGeometry(1,1);
  const p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const y=p.getY(i),width=(1-.27*Math.abs(y))*(1+.12*Math.sin(Math.atan2(p.getZ(i),p.getX(i))*3+y));
    p.setXYZ(i,p.getX(i)*width,y*(1+.19*y),p.getZ(i)*width);
  }
  geometry.computeVertexNormals();
  const material=new T.ShaderMaterial({
    uniforms:{time:{value:0},cool:{value:new T.Color(0x515dde)},warm:{value:new T.Color(0xa48dff)}},
    vertexShader:`varying vec3 surface,viewNormal,viewAngle;void main(){surface=position;
      vec4 eye=modelViewMatrix*vec4(position,1.);viewAngle=-eye.xyz;viewNormal=normalMatrix*normal;
      gl_Position=projectionMatrix*eye;}`,
    fragmentShader:`uniform vec3 cool,warm;uniform float time;varying vec3 surface,viewNormal,viewAngle;
      void main(){vec3 n=normalize(viewNormal),v=normalize(viewAngle);
        float rim=pow(1.-abs(dot(n,v)),2.8);
        float a=sin(surface.y*18.+sin(surface.x*7.+time)*2.2+surface.z*13.);
        float b=sin(surface.y*31.-surface.x*27.+sin(surface.z*16.)*2.+time*1.2);
        float seam=pow(.5+.5*a*b,9.);
        float pulse=.63+.28*sin(surface.y*9.-time*1.7);
        float shade=.25+.23*dot(n,normalize(vec3(-.5,.74,.55)));
        gl_FragColor=vec4(mix(cool,warm,shade+pulse*.33)*(1.18+rim*.68)+vec3(.37,.53,.92)*(seam*.79+rim*.66),1.);
        #include <colorspace_fragment>
      }`,
  });
  return new T.Mesh(geometry,material);
}

function lantern(parent,x,z,i){
  const flame=new T.Mesh(glowBall,new T.MeshBasicMaterial({color:i%3?0xffc77a:0xa3d1ff}));
  flame.position.set(x,.825,z);
  flame.scale.set(.66,1.83,.66);parent.add(flame);
  const haze=halo(parent,x,.074,z,1.20,i%3?0xffa149:0x7375ff,.64);
  const air=halo(parent,x,.84,z,.39,i%3?0xfaad6c:0x888dff,.79);
  air.rotation.x=PI/2;
  return {flame,haze};
}

function motes(parent,mobile){
  const count=mobile?54:108,positions=new Float32Array(count*3),phases=new Float32Array(count);
  for(let i=0;i<count;i++){
    const t=i*2.399957,a=.83+((i*131)%83)*.109;
    positions.set([Math.cos(t)*a,.22+((i*66)%113)*.047,Math.sin(t)*a],i*3);
    phases[i]=(i*197%199)/199;
  }
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{time:{value:0},pixel:{value:mobile?1.3:1.65}},
    vertexShader:`uniform float time,pixel;attribute float phase;varying float f,kind;void main(){
      vec3 p=position;float t=time*(.24+phase*.27);
      p.x+=sin(t*2.+phase*17.)*.38;p.z+=cos(t*3.+phase*9.)*.45;p.y=mod(p.y+t,6.);
      f=.2+pow(.5+.5*sin(t*4.+phase*67.),2.)*.73;
      kind=phase;vec4 eye=modelViewMatrix*vec4(p,1.);
      gl_PointSize=clamp(99.*pixel/max(1.,-eye.z),1.,7.)*(.62+phase*.46);
      gl_Position=projectionMatrix*eye;
    }`,
    fragmentShader:`varying float f,kind;void main(){
      float d=length(gl_PointCoord-.5);float bright=1.-smoothstep(.015,.49,d);
      vec3 tint=mix(vec3(.41,.53,1.),vec3(.99,.59,.24),step(.7,kind));
      gl_FragColor=vec4(tint,bright*bright*f*.8);
    }`,
  });
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(positions,3));
  geometry.setAttribute('phase',new T.BufferAttribute(phases,1));
  parent.add(new T.Points(geometry,material));
  return material;
}

function lanternCat(scene,view){
  const shadow=halo(scene,3.3,.051,2.29,.69,0x1f1d32,.28,.74);
  const footlight=halo(scene,3.3,.055,2.29,.83,0xffa86b,.33,.79);
  const height=1.86;
  const sprite=new T.Sprite(new T.SpriteMaterial({
    map:view.atlas[0],transparent:true,depthWrite:false,depthTest:false,color:0xf5e7fc,
  }));
  const ratio=view.atlas[0].image.width/view.atlas[0].image.height;
  sprite.position.set(3.3,height*.51,2.29);sprite.scale.set(height*ratio,height,1);
  shadow.renderOrder=1;
  sprite.renderOrder=12;
  scene.add(sprite);
  return {sprite,shadow,footlight,height,target:new T.Vector2(3.3,2.29),frames:view.atlas};
}

function arches(parent,put,materials,plane,glassMap){
  const {stone,basalt,metal,recess}=materials;
  const back=new T.Group();
  const glass=new T.MeshBasicMaterial({map:glassMap,transparent:true,alphaTest:.05,side:T.DoubleSide,color:0xe1e1f9,toneMapped:false});
  back.position.z=-9.7;parent.add(back);
  const tile=new T.PlaneGeometry(2.64,4.96);
  const hollow=new T.BoxGeometry(1,1,1);
  const from=(a,b,cut=.09)=>{
    const u=new T.Vector3(...a),v=new T.Vector3(...b);
    const delta=v.clone().sub(u);
    const beam=new T.Mesh(hollow,stone);
    beam.scale.set(cut,delta.length(),cut*1.73);
    beam.position.copy(u).lerp(v,.5);beam.quaternion.setFromUnitVectors(floorUp,delta.normalize());back.add(beam);
  };
  for(const [index,x] of [-7.5,-3.73,.04,3.81,7.58].entries()){
    const beam=new T.Mesh(tile,glass);
    beam.position.set(x,4.36,.045);back.add(beam);
    const inset=new T.Mesh(hollow,recess);
    inset.position.set(x,4.18,-.148);
    inset.scale.set(2.98,5.15,.29);back.add(inset);
    for(const s of [-1,1]){
      const path=[[x+s*1.24,1.92,.13],[x+s*1.24,4.99,.13],[x+s*1.08,5.68,.13],
        [x+s*.64,6.28,.13],[x,6.91,.13]];
      for(let i=0;i<path.length-1;i++)from(path[i],path[i+1],.104);
      const mullion=new T.Mesh(hollow,metal);
      mullion.position.set(x+s*.55,3.04,.102);mullion.scale.set(.032,2.12,.05);back.add(mullion);
    }
    put(plane,basalt,x,1.02,-9.76,3.78,2.02,.59);
    put(plane,basalt,x,7.44,-9.78,3.79,.98,.69);
    put(plane,stone,x,1.91,-9.52,3.26,.22,.84);
    put(plane,metal,x,1.805,-9.50,3.20,.042,.84);
  }
}

function buildHall(view){
  const scene=new T.Scene();
  scene.background=new T.Color(0x080915);
  scene.fog=new T.FogExp2(0x10172b,.033);
  const materials=materialSet();
  const {put,finish}=meshes(scene);
  const ring=new T.CylinderGeometry(1,1,1,64),stoneRing=new T.CylinderGeometry(1,1,1,12);
  const rib=new T.CylinderGeometry(.89,1,1,8),box=new T.BoxGeometry(1,1,1),ball=new T.IcosahedronGeometry(1,0);
  const {metal,basalt,stone,recess}=materials;
  const glassMap=glassFace();
  scene.add(new T.HemisphereLight(0xa9bdef,0x201120,1.05));
  const key=new T.DirectionalLight(0xa4b5f1,1.18);key.position.set(-4,8,-7);scene.add(key);
  const warm=new T.DirectionalLight(0xe5a272,1.01);warm.position.set(8,4,5);scene.add(warm);
  const light=new T.PointLight(0x969cff,44,13,1.8);light.position.set(1.1,2.15,.24);scene.add(light);
  const floor=new T.Mesh(new T.PlaneGeometry(24,24).rotateX(-PI/2),new T.MeshStandardMaterial({
    map:stoneFloor(),roughness:.53,metalness:.34,envMap:forgeEnvironment(),envMapIntensity:.63,
  }));
  scene.add(floor);
  put(box,recess,0,-.12,0,29,.21,28);
  const altarX=1.10,altarZ=.24;
  for(const [r,y,h,finish] of [[2.06,.13,.26,basalt],[1.89,.267,.116,stone],[1.85,.329,.038,metal],
    [1.68,.395,.115,basalt],[1.52,.472,.061,stone],[1.43,.521,.032,metal],[1.17,.583,.112,basalt],[.93,.662,.051,stone]]){
    put(ring,finish,altarX,y,altarZ,r,h,r);
  }
  const haloRim=new T.TorusGeometry(1,.015,4,84).rotateX(-PI/2);
  const geodeRim=new T.MeshBasicMaterial({color:0xb9adff,toneMapped:false});
  put(haloRim,geodeRim,altarX,.699,altarZ,.845);
  put(haloRim,geodeRim,altarX,.694,altarZ,.717);
  const glow=halo(scene,altarX,.703,altarZ,1.80,0x8f82ff,1.22);
  const spill=halo(scene,altarX,.033,altarZ,3.43,0x8b9dff,.62);
  const spark=crystal();spark.position.set(altarX,2.23,altarZ);spark.scale.set(.55,1.27,.57);scene.add(spark);
  const wisps=[];
  for(let i=0;i<8;i++){
    const flake=new T.Mesh(ball,new T.MeshBasicMaterial({color:i%3===0?0x86bafa:0xb495ed,transparent:true,opacity:.68}));
    flake.scale.set(.039,.11,.039);scene.add(flake);wisps.push(flake);
  }
  const altarAir=halo(scene,altarX,2.06,altarZ,2.14,0x9a8dff,.37);
  altarAir.renderOrder=8;
  const rings=new T.Group();
  const ringColors=[0x8e7fff,0xd5b6ff,0x8eacff];
  const orbitGeo=new T.TorusGeometry(1,.013,5,72,TAU*.82);
  for(let i=0;i<3;i++){
    const arc=new T.Mesh(orbitGeo,new T.MeshBasicMaterial({color:ringColors[i],transparent:true,opacity:.44-i*.057,
      blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));
    arc.rotation.set(.55+i*.49,.4+i*.73,i*.48);
    arc.scale.setScalar(.72+i*.19);rings.add(arc);
  }
  rings.position.copy(spark.position);scene.add(rings);
  const positions=[[-8.5,-6.1],[-4.28,-5.8],[4.28,-5.8],[8.5,-6.1],[-9.06,-.52],[8.97,-.52],[-8.51,5.55],[8.46,5.65],
    [-11.35,-8.72],[-7.53,-8.72],[-3.76,-8.72],[.01,-8.72],[3.78,-8.72],[7.55,-8.72],[11.3,-8.72]];
  for(const [i,[x,z]] of positions.entries()){
    const h=i>7?7.63:6.04;
    put(box,recess,x,.115,z,1.43,.23,1.43,PI/4);
    put(stoneRing,stone,x,.302,z,.86,.193,.86);
    put(stoneRing,metal,x,.406,z,.77,.043,.77);
    put(stoneRing,basalt,x,.527,z,.68,.232,.68);
    put(rib,basalt,x,h*.46,z,.552,h*.79,.552);
    put(stoneRing,stone,x,h*.86,z,.71,.177,.71);
    put(stoneRing,metal,x,h*.88,z,.64,.036,.64);
    put(box,basalt,x,h*.93,z,1.16,.36,1.16,PI/4);
    for(let n=0;n<8;n++){
      const a=TAU*n/8;const [dx,dz]=polar(.49,a);
      put(rib,n%2?basalt:stone,x+dx,h*.48,z+dz,.087,h*.71,.087);
      if(n%2===0)put(ball,metal,x+dx*1.10,.618,z+dz*1.10,.073,.086,.073);
    }
    for(let band=0;band<6;band++)put(stoneRing,band===1||band===5?stone:recess,
      x,.87+band*h*.118,z,.567-band*.019,.036,.567-band*.019);
  }
  arches(scene,put,materials,box,glassMap);
  for(const side of [-1,1]){
    put(box,recess,side*11.78,3.79,-2.27,.65,7.6,14.5);
    put(box,basalt,side*11.46,.48,-2.14,.79,.95,14.4);
    for(let i=0;i<6;i++){
      const z=-8.15+i*2.21;
      put(box,stone,side*11.37,3.61,z,.68,6.7,.27);
      put(box,metal,side*11.04,1.00,z,.18,.075,1.73);
    }
  }
  const candles=[];
  for(let i=0;i<14;i++){
    if(i===3||i===4)continue;
    const a=i*TAU/14+.082,[x,z]=polar(6.52,a);
    put(stoneRing,basalt,x,.123,z,.372,.246,.372);
    put(rib,metal,x,.46,z,.137,.57,.137);
    put(stoneRing,stone,x,.678,z,.26,.145,.26);
    put(stoneRing,metal,x,.765,z,.267,.046,.267);
    for(let j=0;j<3;j++){
      const [ox,oz]=polar(.155,j*TAU/3);
      put(rib,metal,x+ox,.825,z+oz,.025,.17,.025);
    }
    candles.push(lantern(scene,x,z,i));
  }
  for(const side of [-1,1])for(let i=0;i<5;i++){
    const x=side*(6.02+i*.62),z=1.75+i*.49;
    halo(scene,x,.041,z,.51,i%2?0xca69aa:0x7979ff,.21,1.85);
  }
  const rayColors=[0x8268ff,0x82aaff,0xec70a7,0x8a78ff,0xfbd09b,0x6d88ee];
  const rays=[],projections=[];
  for(let i=0;i<9;i++){
    const x=-7.50+i*1.87,z=-9.42,y=4.85+Math.cos(i*1.59)*.72;
    const tint=rayColors[i%rayColors.length];
    rays.push(beam(scene,[x,y,z],[x+2.8,.072,-2.2+i*.27],1.06+(i%3)*.28,tint,i));
    const wash=halo(scene,x+2.80,.058,-2.2+i*.27,1.14,tint,.51,2.16);
    wash.rotation.y=-.37;
  }
  for(let i=0;i<4;i++){
    const x=-3.8+i*3.41,z=-3.43+i*.54;
    projections.push(coloredCaustic(scene,glassMap,x,.035,z,2.63,5.73,-.24,.72));
  }
  projections.push(coloredCaustic(scene,glassMap,6.71,.036,3.55,2.01,3.52,-.49,.48));
  const cat=lanternCat(scene,view);
  finish();
  return {scene,motes:motes(scene,view.mobile),glow,spill,spark,candles,wisps,rays,light,cat,altarAir,rings,projections};
}

export class LanternNave {
  constructor(view,canvas){
    this.canvas=canvas;
    this.mobile=view.mobile;
    this.ambience=matchMedia('(prefers-reduced-motion: reduce)');
    this.renderer=new T.WebGLRenderer({canvas,antialias:!view.mobile,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,view.mobile?1.25:1.5));
    this.renderer.toneMapping=T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.10;
    this.camera=new T.PerspectiveCamera(43,1,.12,70);
    Object.assign(this,buildHall(view));
    this.cutaway=new RoomCutaway();
    this.cutaway.cover(this.scene);
    const yaw=.96,pitch=.62;
    this.sight=new T.Vector3(Math.cos(yaw)*Math.cos(pitch),Math.sin(pitch),Math.sin(yaw)*Math.cos(pitch));
    this.t=0;this.nextFrame=0;
    this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.ground=new T.Vector3();
    this.focus=new T.Vector3();this.resize();
    new ResizeObserver(()=>this.resize()).observe(canvas);
    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0};
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove',event=>{
      if(this.drag?.id!==event.pointerId)return;
      const dx=event.clientX-this.drag.x,dy=event.clientY-this.drag.y;
      this.drag.distance+=Math.hypot(dx,dy);
      this.drag.x=event.clientX;this.drag.y=event.clientY;
    });
    canvas.addEventListener('pointerup',event=>{
      if(this.drag?.id===event.pointerId&&this.drag.distance<6)this.moveCat(event.clientX,event.clientY);
      this.drag=null;
    });
    for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>this.drag=null);
  }

  resize(){
    const width=this.canvas.clientWidth,height=this.canvas.clientHeight;
    if(!width||!height)return;
    this.camera.aspect=width/height;
    this.camera.fov=this.camera.aspect<.90?55:43;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width,height,false);
    this.dirty=true;
  }

  moveCat(x,y){
    const rect=this.canvas.getBoundingClientRect();
    this.pointer.set((x-rect.left)*2/rect.width-1,1-(y-rect.top)*2/rect.height);
    this.ray.setFromCamera(this.pointer,this.camera);
    if(this.ray.ray.intersectPlane(groundPlane,this.ground)){
      const {x,z}=this.ground;
      const dist=Math.hypot(x-1.1,z-.24);
      if(dist>2.34&&dist<5.95){
        this.cat.target.set(x,z);
        this.dirty=true;
      }
    }
  }

  stepCat(dt,t){
    const {sprite,target,frames,height,shadow,footlight}=this.cat;
    const pos=sprite.position;
    const dx=target.x-pos.x,dz=target.y-pos.z,distance=Math.hypot(dx,dz);
    const walking=distance>.06;
    if(walking){
      const walk=Math.min(1,dt*4.4/distance);
      const x=pos.x+dx*walk,z=pos.z+dz*walk;
      if(Math.hypot(x-1.1,z-.24)<2.27){
        const angle=Math.atan2(pos.z-.24,pos.x-1.1);
        const goal=Math.atan2(target.y-.24,target.x-1.1);
        const side=Math.sign(Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)))||1;
        const toward=angle+side*dt*1.48;
        pos.x=1.1+Math.cos(toward)*2.31;pos.z=.24+Math.sin(toward)*2.31;
      }else{
        pos.x=x;pos.z=z;
      }
    }
    sprite.material.map=frames[walking?1:0];
    pos.y=height*.51+(walking?.084*Math.abs(Math.sin(t*14)):.025*Math.sin(t*1.9));
    shadow.position.set(pos.x,.051,pos.z);
    footlight.position.set(pos.x+.19,.055,pos.z+.13);
  }

  render(now,dt){
    if(now<this.nextFrame)return;
    const elapsed=this.lastFrame===undefined?dt:Math.min(.10,(now-this.lastFrame)*.001);
    this.lastFrame=now;
    this.nextFrame=now+(this.mobile?29:19);
    const still=this.ambience.matches;
    const pos=this.cat.sprite.position;
    if(still&&!this.dirty&&Math.hypot(this.cat.target.x-pos.x,this.cat.target.y-pos.z)<.06)return;
    this.dirty=false;
    this.t+=still?0:elapsed;
    const t=this.t;
    this.stepCat(elapsed,t);
    const wide=this.camera.aspect>1.03;
    this.focus.set(pos.x,1.04,pos.z);
    this.camera.position.copy(this.sight).multiplyScalar(wide?18.5:16.3).add(this.focus);
    this.camera.lookAt(this.focus);
    this.cutaway.place(pos.x,pos.z,this.sight);
    this.camera.clearViewOffset();
    if(wide){
      const size=this.canvas;
      this.camera.setViewOffset(size.clientWidth,size.clientHeight,-size.clientWidth*.13,0,size.clientWidth,size.clientHeight);
    }else{
      const size=this.canvas;
      this.camera.setViewOffset(size.clientWidth,size.clientHeight,0,size.clientHeight*.105,size.clientWidth,size.clientHeight);
    }
    this.spark.rotation.y=t*.56;
    this.spark.position.y=2.14+Math.sin(t*1.69)*.19;
    this.spark.material.uniforms.time.value=t;
    this.altarAir.quaternion.copy(this.camera.quaternion);
    this.altarAir.rotateX(PI*.5);
    this.altarAir.position.y=this.spark.position.y;
    this.altarAir.material.uniforms.power.value=.28+Math.sin(t*2.8)*.037;
    this.rings.position.copy(this.spark.position);
    this.rings.rotation.set(t*.13,t*.36,.18);
    this.glow.material.uniforms.power.value=1.13+Math.sin(t*2.8)*.115;
    this.spill.material.uniforms.power.value=.54+Math.sin(t*1.61)*.074;
    this.light.intensity=44+Math.sin(t*2.15)*4.2;
    this.motes.uniforms.time.value=t;
    for(const [i,flake] of this.wisps.entries()){
      const phase=i*TAU/this.wisps.length+t*.80,a=.72+Math.sin(phase*2+t*.75)*.12;
      flake.position.set(this.spark.position.x+Math.sin(phase)*a,1.54+(i%4)*.49+Math.cos(phase)*.22,
        this.spark.position.z+Math.cos(phase)*a);
      flake.rotation.set(t*.9+i,t*.64,.32);
    }
    for(const [i,{flame,haze}] of this.candles.entries()){
      const flicker=Math.sin(t*9.8+i*2.4)*.17+Math.sin(t*14.3+i*5)*.096;
      flame.scale.y=1.73+flicker;
      flame.rotation.z=flicker*.29;haze.material.uniforms.power.value=.60+flicker*.32;
    }
    for(const [i,ray] of this.rays.entries())ray.uniforms.time.value=t+i;
    for(const material of this.projections)material.uniforms.clock.value=t;
    this.renderer.render(this.scene,this.camera);
  }
}
