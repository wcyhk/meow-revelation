import * as T from '../three.min.mjs';

const disc=new T.PlaneGeometry(2.6,2.6).rotateX(-Math.PI/2);
const bone=new T.ConeGeometry(1,1,6);
const joint=new T.SphereGeometry(1,7,5);
const tendon=new T.CylinderGeometry(.72,1,1,6);
const ivory=new T.MeshStandardMaterial({color:0xf4d9bc,roughness:.39,emissive:0x60212c,emissiveIntensity:.48});
const flesh=new T.MeshStandardMaterial({color:0x7e1928,roughness:.41,emissive:0x511021,emissiveIntensity:.66});
const claw=new T.MeshStandardMaterial({color:0xf1bba5,roughness:.36,emissive:0x451426,emissiveIntensity:.38});
const dummy=new T.Object3D(),up=new T.Vector3(0,1,0);
const start=new T.Vector3(),end=new T.Vector3(),direction=new T.Vector3();
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};

function batch(parent,shape,material,count) {
  const mesh=new T.InstancedMesh(shape,material,count);
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  mesh.frustumCulled=false;
  parent.add(mesh);
  return mesh;
}

function segment(mesh,index,from,to,width) {
  direction.subVectors(to,from);
  const length=Math.max(.001,direction.length());
  dummy.position.copy(from).addScaledVector(direction,.5);
  dummy.quaternion.setFromUnitVectors(up,direction.divideScalar(length));
  dummy.scale.set(width,length,width);
  dummy.updateMatrix();
  mesh.setMatrixAt(index,dummy.matrix);
}

const vertex=`
  varying vec2 p;
  void main(){p=(uv-.5)*2.6;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;
const fragment=`
  uniform float opening,clock;
  varying vec2 p;
  void main(){
    vec2 uv=p/vec2(1.,.79);
    float a=atan(uv.y,uv.x),r=length(uv);
    float jag=sin(a*11.+clock*9.)*.032+sin(a*23.)*.021;
    float lip=.87*opening+jag;
    float edge=r-lip;
    float folds=sin(a*17.+r*28.+sin(a*5.)*2.+clock*6.)*.5+.5;
    float wet=exp(-abs(edge)*37.)*(.36+.64*folds);
    float crack=(1.-smoothstep(.014,.055,abs(sin(a*8.+sin(r*28.)*.28))))*
      smoothstep(lip*.69,lip+.06,r)*(1.-smoothstep(.94,1.26,r))*opening;
    float inside=1.-smoothstep(-.018,.022,edge);
    float groove=(edge+.045)*10.;
    float gum=exp(-groove*groove)*(.48+.52*folds);
    vec3 ink=mix(vec3(.022,.004,.027),vec3(.49,.037,.11),max(gum,crack*.7));
    ink+=vec3(.59,.13,.18)*wet;
    float alpha=max(inside*.99,max(gum*.84,crack*.82))*smoothstep(.0,.17,opening);
    gl_FragColor=vec4(ink,alpha);
  }
`;

export function createMaw(view) {
  const root=new T.Group();
  root.name='撒托古亞之口';
  root.visible=false;
  const hole=new T.Mesh(disc,new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,
    transparent:true,depthWrite:false,uniforms:{opening:{value:0},clock:{value:0}}}));
  hole.position.y=.076;
  hole.renderOrder=27;
  root.add(hole);
  const teeth=batch(root,bone,ivory,18);
  const arms=batch(root,tendon,flesh,4);
  const palms=batch(root,joint,flesh,2);
  const nails=batch(root,bone,claw,8);
  view.scene.add(root);
  return {root,hole,teeth,arms,palms,nails};
}

export function poseMaw(art,age,corpseX,corpseZ) {
  const {hole,teeth,arms,palms,nails}=art;
  const open=ease(age/.22)*(1-ease((age-.78)/.24));
  const grab=ease((age-.12)/.26)*(1-ease((age-.76)/.21));
  hole.material.uniforms.opening.value=open;
  hole.material.uniforms.clock.value=age;
  for(let i=0;i<18;i++) {
    const angle=i*Math.PI/9;
    const x=Math.cos(angle),z=Math.sin(angle);
    start.set(x*.93*open,.075,z*.73*open);
    end.set(x*.66*open,.115+(.11+Math.abs(z)*.24)*open,z*.52*open);
    segment(teeth,i,start,end,(.055+.026*(i%3))*open);
  }
  for(let i=0;i<2;i++) {
    const side=i===0?-1:1;
    const x=corpseX*.85+side*.24,z=corpseZ*.85;
    const height=(.26+.44*Math.sin(Math.PI*grab*.65))*grab;
    start.set(side*.35*open,.03,-.18);
    end.set(x*.65,.08+height*.61,z-.28*grab);
    segment(arms,i*2,start,end,.13*grab);
    start.copy(end);
    end.set(x,.065+height,z);
    segment(arms,i*2+1,start,end,.10*grab);
    dummy.position.copy(end);
    dummy.quaternion.identity();
    dummy.scale.set(.18*grab,.12*grab,.24*grab);
    dummy.updateMatrix();
    palms.setMatrixAt(i,dummy.matrix);
    for(let j=0;j<4;j++) {
      const finger=(j-1.5)*.083;
      start.set(x+finger*grab,.075+height,z+.12*grab);
      end.set(x+finger*1.52*grab,.065+height-.19*grab,z+(.35-Math.abs(finger)*.38)*grab);
      segment(nails,i*4+j,start,end,.049*grab);
    }
  }
  for(const mesh of [teeth,arms,palms,nails]) mesh.instanceMatrix.needsUpdate=true;
}
