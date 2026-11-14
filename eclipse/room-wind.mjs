import * as T from '../three.min.mjs';

const grassShape=grassGeometry();
const bannerShape=new T.PlaneGeometry(1,2.04,9,14).translate(0,-1.02,0);

function grassGeometry(){
  const positions=[],pins=[],indices=[];
  for(let i=0;i<9;i++){
    const angle=i*2.399, x=Math.cos(angle)*(.06+i*.013), z=Math.sin(angle)*(.06+i*.013);
    const height=.31+(i%4)*.11, width=.023+i%3*.012;
    const offset=positions.length/3;
    for(let j=0;j<4;j++){
      const t=j/3, lean=t*t*(.045+i*.009);
      for(const side of [-1,1]){
        const w=width*(1-t*.99)*side;
        positions.push(x+Math.cos(angle)*lean+Math.sin(angle)*w,height*t,z+Math.sin(angle)*lean-Math.cos(angle)*w);
        pins.push(t*t);
      }
      if(j){
        const k=offset+(j-1)*2;
        indices.push(k,k+1,k+2,k+1,k+3,k+2);
      }
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('pin',new T.Float32BufferAttribute(pins,1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function material(wind,ink,banner){
  const mat=new T.MeshStandardMaterial({color:ink,roughness:.93,side:T.DoubleSide});
  mat.customProgramCacheKey=()=>banner?'cloth-in-wind':'grass-in-wind';
  mat.onBeforeCompile=shader=>{
    shader.uniforms.windTime=wind;
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      uniform float windTime;
      varying float windPin;
      ${banner?'':'attribute float pin;'}`
    ).replace('#include <begin_vertex>',`#include <begin_vertex>
      vec3 anchor=instanceMatrix[3].xyz;
      float phase=windTime*1.65+dot(anchor.xz,vec2(.63,.37));
      float gust=sin(phase)+.39*sin(phase*1.93+anchor.z*.39);
      windPin=${banner?'pow(clamp(-position.y*.49,0.,1.),1.45)':'pin'};
      ${banner?
        'transformed.z+=windPin*(gust*.18+sin(position.x*8.-phase*1.9)*.13); transformed.x+=windPin*gust*.09;':
        'transformed.x+=windPin*(.10+.13*gust); transformed.z+=windPin*sin(phase+.83)*.11;'}
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying float windPin;`
    ).replace('#include <color_fragment>',`#include <color_fragment>
      diffuseColor.rgb*=mix(${banner?'.91,1.20':'.39,1.37'},windPin);
    ${banner?`
      vec2 clothUv=vUv;
      float piping=1.-smoothstep(.011,.020,abs(abs(clothUv.x-.5)-.427));
      float sewing=1.-smoothstep(.004,.009,abs(clothUv.y-.088));
      float crest=1.-smoothstep(.032,.050,abs(length((clothUv-vec2(.5,.62))*vec2(1.,1.75))-.18));
      float lozenge=1.-smoothstep(.015,.030,abs(abs(clothUv.x-.5)+abs(clothUv.y-.62)*1.65-.11));
      float thread=.91+.09*sin(clothUv.x*431.)*sin(clothUv.y*397.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.47,.26,.115),max(max(piping,sewing),max(crest,lozenge))*.79)*thread;
      if(clothUv.y<.062*sin(clothUv.x*22.)+.032)discard;
    `:''}
    `);
  };
  if(banner)mat.defines={USE_UV:''};
  return mat;
}

export function windInRoom(root,mobile,type,accent,draw){
  const clock={value:0};
  const grass= ['grove','canal','lotus','grave','fungus','dunes','frost'].includes(type);
  const size=grass?(mobile?38:74):(mobile?4:6);
  const geometry=grass?grassShape:bannerShape;
  const base=new T.Color(grass?(['canal','lotus','fungus'].includes(type)?0x627e62:0x777253):0x542f40);
  const mesh=new T.InstancedMesh(geometry,material(clock,base.lerp(new T.Color(accent),.20),!grass),size);
  const pose=new T.Object3D();
  for(let i=0;i<size;i++){
    const side=i%2?1:-1;
    const z=grass?-9.2+draw()*17.7:-7.85+Math.floor(i/2)*5.1;
    const x=grass?side*(7.8+draw()*4.9):side*(8.73+Math.floor(i/2)*.16);
    pose.position.set(x,grass?-.057:3.76,z);
    pose.rotation.y=grass?draw()*Math.PI*2:side*.35;
    pose.scale.setScalar(grass?.63+draw()*.90:.64+(i%3)*.09);
    pose.updateMatrix();
    mesh.setMatrixAt(i,pose.matrix);
  }
  mesh.frustumCulled=false;
  root.add(mesh);
  return {clock,material:mesh.material};
}

export const windGeometries=[grassShape,bannerShape];
