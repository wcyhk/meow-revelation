import * as T from '../three.min.mjs';

const source=new URL('./art/pao-reference.webp',import.meta.url).href;
let atlas;
const waiting=new Set();

// Regions use the supplied front view. The curved meshes supply the depth and parallax.
function material(k,region){
  if(!atlas){
    atlas=new T.TextureLoader().load(source,()=>{
      for(const finish of waiting)finish.visible=true;
      waiting.clear();
    },undefined,()=>waiting.clear());
    atlas.colorSpace=T.SRGBColorSpace;
    atlas.anisotropy=4;
  }
  const finish=new T.MeshStandardMaterial({
    map:atlas,roughness:region==='armor'?.51:.68,metalness:region==='armor'?.42:.08,
    emissive:region==='armor'?0x151718:0x685747,emissiveIntensity:region==='armor'?.035:.09,
    envMap:k.materials.body.envMap,envMapIntensity:.43,
  });
  finish.visible=Boolean(atlas.image);
  if(!finish.visible){
    waiting.add(finish);
    finish.addEventListener('dispose',()=>waiting.delete(finish));
  }
  finish.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      diffuseColor.rgb*=1.19;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.025,.035,.043),.12);
    `);
  };
  k.materials[region+'Relief']=finish;
  return finish;
}

function relief(parent,finish,spec){
  const {w,h,cx,cy,z,curve,outline,rect}=spec;
  const segmentsX=20,segmentsY=26;
  const points=[],uvs=[],triangles=[];
  for(let row=0;row<=segmentsY;row++){
    const v=row/segmentsY;
    const size=outline(v);
    for(let column=0;column<=segmentsX;column++){
      const u=column/segmentsX,x=(u*2-1)*size;
      points.push(cx+x*w*.5,cy+(v-.5)*h,z+curve(u,v));
      uvs.push((rect[0]+rect[2]*(.5+x*.5))/1774,(887-rect[1]-rect[3]*(1-v))/887);
      if(row===segmentsY||column===segmentsX)continue;
      const i=row*(segmentsX+1)+column,next=i+segmentsX+1;
      triangles.push(i,i+1,next,i+1,next+1,next);
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(points,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geo.setIndex(triangles);
  geo.computeVertexNormals();
  parent.add(new T.Mesh(geo,finish));
}

export function paoVisage(k,head,beard,body,arms){
  relief(head,material(k,'face'),{
    w:.337,h:.301,cx:0,cy:.063,z:.383,rect:[1299,194,82,85],
    outline:v=>.57+Math.sin(Math.PI*v)*.37+v*.05,
    curve:(u,v)=>{
      const middle=Math.sin(u*Math.PI);
      return middle*.065+middle**7*Math.exp(-((v-.53)**2)*33)*.051;
    },
  });
  relief(beard,material(k,'beard'),{
    w:.281,h:.93,cx:0,cy:-.442,z:.062,rect:[1300,278,73,369],
    outline:v=>T.MathUtils.smoothstep(v,.0,.91)**.74*(1-T.MathUtils.smoothstep(v,.83,1)*.31)+.085,
    curve:(u,v)=>Math.sin(u*Math.PI)**1.7*(.066+.045*Math.sin(v*Math.PI)),
  });
  const armor=material(k,'armor');
  for(const [index,arm] of arms.entries()){
    const side=index===0?-1:1;
    relief(arm.shoulder,armor,{
      w:.35,h:.39,cx:side*.049,cy:.015,z:.155,rect:side<0?[1217,279,80,92]:[1374,277,80,91],
      outline:v=>.28+.62*Math.sin(Math.PI*v)**.60,
      curve:(u,v)=>.122*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),
    });
    relief(body,armor,{
      w:.385,h:.42,cx:side*.265,cy:.28,z:.335,rect:side<0?[1213,385,110,113]:[1357,385,110,113],
      outline:v=>.38+.54*Math.sin(Math.PI*v)**.7,
      curve:(u,v)=>.103*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)-side*(u-.5)*.09,
    });
  }
}
