import * as T from '../three.min.mjs';

const palette={bone:0xe9cabb,porcelain:0xf0ddd0,iron:0x453b43,brass:0x92714e,dusk:0x2f263a,blood:0x8f263d,wax:0xc99068,ice:0x4c8a8a};
const models=new Map();
const shapes={box:new T.BoxGeometry(1,1,1),egg:new T.IcosahedronGeometry(1,1),orb:new T.SphereGeometry(1,10,7),
  cone:new T.ConeGeometry(1,1,6),tube:new T.CylinderGeometry(1,1,1,7),spike:new T.OctahedronGeometry(1)};
const body=new T.MeshStandardMaterial({vertexColors:true,roughness:.73,metalness:.16,side:T.DoubleSide});
const glimmer=new T.MeshBasicMaterial({vertexColors:true,toneMapped:false});
function flexibleMaterial(base,pose) {
  const material=base.clone();
  material.onBeforeCompile=shader=>{
    shader.uniforms.effigyPose={value:pose};
    shader.vertexShader='uniform vec4 effigyPose;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`
      #include <begin_vertex>
      float feet=1.-smoothstep(.18,.96,position.y);
      float side=smoothstep(-.26,.26,position.x)*2.-1.;
      float upper=smoothstep(.78,1.86,position.y);
      transformed.z+=effigyPose.x*side*feet;
      transformed.y+=max(0.,effigyPose.y*side)*feet;
      transformed.x+=upper*effigyPose.z+effigyPose.w*sin(position.y*1.94);
    `);
  };
  return material;
}

function pack(parts) {
  const positions=[],normals=[],colors=[];
  const vec=new T.Vector3(),mat=new T.Matrix4(),rot=new T.Quaternion(),normal=new T.Matrix3(),tint=new T.Color();
  for(const [shape,shade,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0] of parts){
    const g=shapes[shape];
    const pos=g.attributes.position,norm=g.attributes.normal,idx=g.index;
    rot.setFromEuler(new T.Euler(rx,ry,rz));
    mat.compose(new T.Vector3(x,y,z),rot,new T.Vector3(sx,sy,sz));
    normal.getNormalMatrix(mat);
    tint.setHex(palette[shade]??shade);
    for(let j=0;j<(idx?idx.count:pos.count);j++){
      const i=idx?idx.getX(j):j;
      vec.fromBufferAttribute(pos,i).applyMatrix4(mat);positions.push(vec.x,vec.y,vec.z);
      vec.fromBufferAttribute(norm,i).applyMatrix3(normal).normalize();normals.push(vec.x,vec.y,vec.z);
      colors.push(tint.r,tint.g,tint.b);
    }
  }
  return new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3))
    .setAttribute('normal',new T.Float32BufferAttribute(normals,3)).setAttribute('color',new T.Float32BufferAttribute(colors,3));
}

function craft(kind) {
  const stone=[],light=[];
  const p=(...args)=>stone.push(args),g=(...args)=>light.push(args);
  switch(kind){
    case 'veil':
      p('cone','dusk',0,.79,0,.71,1.48,.50,0,0,.04);
      p('egg','blood',0,1.25,-.11,.60,.70,.37);
      for(const side of [-1,1]){
        p('cone','dusk',side*.43,.85,.11,.31,1.43,.26,.13,0,side*.20);
        p('spike','iron',side*.55,.60,-.13,.22,.63,.15,0,0,side*.26);
      }
      p('orb','porcelain',0,1.62,.28,.33,.45,.13,.06,.0,-.10);
      p('box','blood',0,1.46,.406,.052,.30,.025,0,0,.11);
      g('box',0xfcb6ec,0,1.67,.417,.028,.24,.023,0,0,-.08);
      break;
    case 'coffin':
      p('box','iron',0,1.06,.06,.88,1.54,.58,0,0,.02);
      p('box','dusk',0,1.08,.38,.68,1.30,.13);
      p('box','brass',0,1.07,.46,.051,1.28,.03,0,0,.37);
      p('box','brass',0,1.07,.46,.050,1.28,.03,0,0,-.37);
      p('egg','bone',0,1.77,.15,.29,.31,.26);
      for(const side of [-1,1]){
        p('spike','bone',side*.57,1.52,.03,.31,.36,.32,0,0,side*.27);
        p('tube','iron',side*.57,.92,.01,.18,.72,.17,0,0,side*.13);
        p('box','bone',side*.31,.35,.20,.32,.56,.32);
        g('box',0xff987e,side*.10,1.82,.399,.115,.027,.038,0,0,side*.20);
      }
      g('spike',0xffae8a,0,1.09,.49,.086,.15,.055);
      break;
    case 'wax':
      p('egg','wax',0,.75,.01,.62,.54,.50);
      p('egg','bone',0,1.29,.16,.35,.43,.34);
      p('orb','blood',0,.72,.40,.30,.28,.18);
      for(const side of [-1,1]){
        p('tube','wax',side*.52,.74,.02,.14,.67,.13,0,0,side*.56);
        p('cone','bone',side*.31,1.30,-.15,.15,.64,.16,0,0,-side*.28);
        p('box','dusk',side*.125,1.32,.465,.12,.10,.05,0,0,side*.22);
        g('spike',0xffd8a4,side*.13,1.32,.495,.046,.046,.018);
      }
      g('spike',0xff9c60,0,.72,.57,.12,.16,.072);
      p('cone','blood',0,.43,.36,.27,.45,.15,Math.PI,0,0);
      break;
    case 'toller':
      p('cone','dusk',0,.79,0,.68,1.49,.54,0,0,.04);
      p('tube','brass',0,1.54,0,.47,.48,.38,0,0,.12);
      p('tube','iron',0,1.32,.01,.57,.17,.46,0,0,.12);
      p('egg','bone',0,1.60,.28,.25,.27,.17);
      p('cone','ice',0,1.98,-.06,.21,.59,.22,0,0,-.22);
      for(const side of [-1,1]){
        p('cone','ice',side*.56,.99,0,.19,1.07,.19,0,0,-side*.49);
        g('box',0x8df7dd,side*.095,1.62,.445,.107,.025,.04,0,0,side*.25);
      }
      g('spike',0x9cfff0,0,1.23,.27,.12,.19,.08);
      break;
    case 'eyes':
      p('orb','blood',0,1.05,0,.63,.81,.43);
      for(const side of [-1,1])for(let i=0;i<3;i++){
        p('spike','iron',side*(.55+i*.053),.52+i*.30,.05,.26,.60,.18,.14,0,side*(.56+i*.11));
        const x=side*(.19+i*.075),y=.85+i*.22,z=.37-i*.04;
        p('orb','bone',x,y,z,.149,.108,.088,0,0,side*.21);
        g('egg',0xff6584,x,y,z+.074,.038,.081,.027);
      }
      p('orb','porcelain',0,1.25,.42,.23,.18,.105);
      g('orb',0xff7257,0,1.25,.526,.071,.133,.027);
      break;
    case 'hound':
      p('egg','dusk',0,.91,-.14,.58,.36,.72,.27,0,.03);
      p('egg','bone',0,1.15,.40,.39,.40,.43,.26);
      p('box','bone',0,.88,.73,.48,.24,.34,.30);
      p('box','blood',0,.91,.915,.35,.079,.051);
      for(const side of [-1,1]){
        p('cone','bone',side*.23,1.62,.26,.17,.59,.18,0,0,-side*.38);
        p('tube','iron',side*.39,.52,.37,.12,.73,.14,.23,0,side*.28);
        p('tube','bone',side*.43,.51,-.42,.13,.68,.14,-.41,0,-side*.25);
        p('cone','porcelain',side*.12,.87,.93,.065,.18,.06,Math.PI);
        g('box',0xff674f,side*.14,1.26,.746,.146,.039,.038,0,0,side*.25);
      }
      break;
  }
  return [pack(stone),pack(light)];
}

export function mountEffigy(scene,visual,kind) {
  if(!models.has(kind))models.set(kind,craft(kind));
  const [figure,eyes]=models.get(kind);
  const root=new T.Group();
  root.userData.pose=new T.Vector4();
  for(const [geometry,material] of [[figure,body],[eyes,glimmer]]){
    root.add(new T.Mesh(geometry,flexibleMaterial(material,root.userData.pose)));
  }
  root.rotation.y=0;
  root.userData.kind=kind;
  visual.art.visible=false;
  visual.effigy=root;
  scene.add(root);
}

export function poseEffigy(visual,spec,time,x,z) {
  const root=visual.effigy;
  if(!root)return;
  const f=spec.fall??0;
  const motion=spec.squash??1;
  const size=visual.height*.51;
  root.position.set(x,.02+Math.max(0,spec.bob??0)*(1-f),z);
  const sway=spec.sway??0,compression=spec.compression??0;
  root.userData.pose.set((spec.stride??0)*1.76,(spec.footLift??0)*1.52,(spec.bend??0)*.26,(spec.lag??0)*.70);
  root.rotation.set(f*1.53+.065*Math.sin(time*9+z)*(1-motion)+compression*.88,
    .36*(spec.face||1)+(spec.bend??0)*.51+sway*3.1,(spec.tilt??0)*1.10+sway);
  root.scale.set(size*((spec.stretch??1)+compression*.35),size*motion,size*(1+compression*.50));
  root.visible=(spec.fade??1)>.13;
}

const quad=new T.PlaneGeometry(1,1);
const vertex='varying vec2 p;void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const shade=`varying vec2 p;uniform float dread,time;
void main(){
  vec2 d=p-vec2(.50,.40);
  float halo=exp(-6.0*dot(d*vec2(1.25,1.0),d*vec2(1.25,1.0)));
  float edges=smoothstep(.19,.67,length(d*vec2(1.08,.92)));
  float mist=sin(p.x*28.0+p.y*19.0+time*.26)+sin(p.x*49.0-p.y*34.0-time*.44);
  float fringe=smoothstep(.25,.82,p.y)*(.10+.10*mist);
  float strands=smoothstep(.88,.995,cos(p.x*95.0+sin(p.y*10.0)*1.10))*smoothstep(.51,1.0,p.y);
  vec3 ink=mix(vec3(.027,.012,.025),vec3(.137,.028,.047),clamp((mist*.17+.36)*dread,0.0,.8));
  float alpha=clamp(.060+dread*(.15+.43*edges+fringe*.35+strands*.10)-halo*.04,0.0,.72);
  gl_FragColor=vec4(ink,alpha);
}`;

export function makeShade(view) {
  const material=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:shade,transparent:true,depthWrite:false,
    uniforms:{dread:{value:0},time:{value:0}}});
  const mesh=new T.Mesh(quad,material);
  mesh.quaternion.copy(view.back.quaternion);
  mesh.position.copy(view.back.position).multiplyScalar(.983);
  mesh.scale.copy(view.back.scale);
  mesh.renderOrder=-49;
  view.scene.add(mesh);
  return mesh;
}
