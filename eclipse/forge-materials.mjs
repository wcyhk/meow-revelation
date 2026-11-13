import * as T from '../three.min.mjs';

let finishes;

function surface(kind) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d');
  const grain=ctx.createImageData(128,128);
  let seed=kind*7919+2317;
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const mottle=Math.sin(x*.14+Math.sin(y*.13)*1.8)*11+Math.cos(x*.36+y*.19)*7;
    const scratch=kind===1?(y%16<2?-35:Math.sin(y*.48+x*.036)*11):Math.sin(x*.89+y*.135)*5;
    const value=205+mottle+scratch+((seed>>>27)-15)*1.1;
    const i=(y*128+x)*4;
    grain.data[i]=value;grain.data[i+1]=value*(kind===1?.93:.97);grain.data[i+2]=value*.92;grain.data[i+3]=255;
  }
  ctx.putImageData(grain,0,0);
  ctx.lineCap='round';
  for(let i=0;i<64;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const x=seed&127,y=seed>>>9&127;
    ctx.strokeStyle=i%2?'#2d222a53':'#ffe8b551';
    ctx.lineWidth=i%7===0?1.4:.6;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+(seed>>>24&7),y+1+(seed>>>21&7));ctx.stroke();
  }
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  return map;
}

export function forgedMaterials(weapon) {
  finishes??=[surface(0),surface(1),surface(2)];
  const [metal,leather,carved]=finishes;
  const tint=new T.Color(weapon.tone);
  const mineral=tint.clone().lerp(new T.Color(0x605254),.38);
  return {
    brass:new T.MeshStandardMaterial({color:0x937353,map:metal,bumpMap:metal,bumpScale:.017,metalness:.52,roughness:.56}),
    dark:new T.MeshStandardMaterial({color:0x38272b,map:leather,bumpMap:leather,bumpScale:.012,metalness:.16,roughness:.81}),
    stone:new T.MeshStandardMaterial({color:mineral,map:carved,bumpMap:carved,bumpScale:.013,metalness:.24,roughness:.47,emissive:tint,emissiveIntensity:.09}),
    ivory:new T.MeshStandardMaterial({color:0xc1b29e,map:metal,bumpMap:metal,bumpScale:.014,metalness:.31,roughness:.62}),
  };
}
