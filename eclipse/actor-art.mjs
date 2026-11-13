import * as T from '../three.min.mjs';

export const heroFrames={idle:0,run:1,attack:2,recoil:40};
const enemyFrames=[3,4,5,6,18,19,20,21,22,23,24,25,26,27,28,29];

async function tiles(path,columns,rows,limit,padding,removeMatte=false) {
  const sheet=new Image();
  sheet.src=path;
  await sheet.decode();
  const cellWidth=sheet.naturalWidth/columns,cellHeight=sheet.naturalHeight/rows;
  const frames=[];
  for(let i=0;i<columns*rows;i++) {
    const source=document.createElement('canvas');
    source.width=Math.round(cellWidth);source.height=Math.round(cellHeight);
    const ctx=source.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(sheet,(i%columns)*cellWidth,Math.floor(i/columns)*cellHeight,cellWidth,cellHeight,0,0,source.width,source.height);
    const {width,height}=source;
    const tile=ctx.getImageData(0,0,width,height);
    const {data}=tile;
    if(removeMatte) {
      for(let a=3;a<data.length;a+=4) {
        data[a]=Math.round(Math.max(0,Math.min(1,(data[a]-104)/123))*255);
      }
      ctx.putImageData(tile,0,0);
    }
    let minX=width,minY=height,maxX=-1,maxY=-1;
    for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
      if(data[(y*width+x)*4+3]<70) continue;
      minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
    }
    if(maxX<minX||maxY<minY) throw Error('Empty art tile '+i+' in '+path);
    const w=maxX-minX+1,h=maxY-minY+1;
    const scale=limit/Math.max(w,h);
    const canvas=document.createElement('canvas');
    canvas.width=Math.ceil(w*scale)+padding*2;
    canvas.height=Math.ceil(h*scale)+padding*2;
    const paint=canvas.getContext('2d');
    paint.imageSmoothingQuality='high';
    paint.drawImage(source,minX,minY,w,h,padding,padding,w*scale,h*scale);
    const art=new T.CanvasTexture(canvas);
    art.colorSpace=T.SRGBColorSpace;
    art.anisotropy=2;
    frames.push(art);
  }
  return frames;
}

export async function loadPaintedActors() {
  const [hero,enemy,bosses]=await Promise.all([
    tiles('./art/lantern-keeper.webp',4,1,336,12),
    tiles('./art/forest-enemies.webp',4,4,300,12,true),
    tiles('./art/chapter-bosses.webp',3,3,416,14,true),
  ]);
  return new Map([
    ...Object.values(heroFrames).map((frame,index)=>[frame,hero[index]]),
    ...enemyFrames.map((frame,index)=>[frame,enemy[index]]),
    ...bosses.map((art,index)=>[9+index,art]),
    [7,enemy[3]],
  ]);
}
