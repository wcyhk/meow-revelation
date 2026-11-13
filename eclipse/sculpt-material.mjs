import * as T from '../three.min.mjs';

let loading;
const surfaces={};
// CC0 source scans: polyhaven.com/a/metal_plate_02 and ambientcg.com/view?id=Leather006.

export function loadSculptMaterials(){
  if(!loading){
    const loader=new T.TextureLoader();
    loading=Promise.allSettled(['hammered','leather'].flatMap(kind=>['normal','rough'].map(async type=>{
      const source=new URL('./art/material/'+kind+'-'+type+'.webp',import.meta.url);
      const map=await loader.loadAsync(source.href);
      map.wrapS=map.wrapT=T.RepeatWrapping;
      map.anisotropy=4;
      (surfaces[kind]??={})[type]=map;
    })));
  }
  return loading;
}

export function scannedSurface(kind,strength){
  const scan=surfaces[kind];
  if(!scan?.normal||!scan.rough)return {};
  return {normalMap:scan.normal,normalScale:new T.Vector2(strength,strength),roughnessMap:scan.rough};
}
