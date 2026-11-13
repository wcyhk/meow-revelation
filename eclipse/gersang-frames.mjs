// Container layouts documented by 2sem/gersang-image-extractor and hallazzang/gosang.
export const spriteFileLimit=48*1024*1024;
const decodedLimit=96*1024*1024;
const offsetTable=1216;
const frameTable=2416;
const s32Data=3660;

function requireFormat(valid){
  if(!valid)throw new Error('檔案不完整，或者圖格超出支援範圍。');
}

async function inflate(bytes,length){
  requireFormat(length<=decodedLimit&&typeof DecompressionStream==='function');
  const out=new Uint8Array(length);
  const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
  let offset=0;
  try{
    for(let chunk=await reader.read();!chunk.done;chunk=await reader.read()){
      requireFormat(offset+chunk.value.length<=length);
      out.set(chunk.value,offset);
      offset+=chunk.value.length;
    }
    requireFormat(offset===length);
    return out;
  }catch(error){
    await reader.cancel().catch(()=>{});
    throw error;
  }finally{
    reader.releaseLock();
  }
}

export async function readGersangFrames(buffer){
  requireFormat(buffer.byteLength>=frameTable&&buffer.byteLength<=spriteFileLimit);
  const view=new DataView(buffer);
  const u32=at=>view.getUint32(at,true);
  const u16=at=>view.getUint16(at,true);
  const [signature,width,height,count]=[0,4,8,12].map(u32);
  if(signature!==25&&signature!==35)throw new Error('支援有透明通道嘅 S32 同 AGF 檔案。');
  requireFormat(width>0&&height>0&&width<=2048&&height<=2048&&count>0&&count<=300);
  const trimmed=signature===35;
  let bytes=new Uint8Array(buffer);
  if(trimmed){
    const trailer=frameTable+count*8;
    const payload=trailer+48;
    requireFormat(payload<=bytes.length&&payload+u32(trailer+44)<=bytes.length);
    bytes=await inflate(bytes.subarray(payload,payload+u32(trailer+44)),u32(trailer));
  }else requireFormat(bytes.length>=s32Data);
  const starts=Array.from({length:count},(_,i)=>u32(offsetTable+i*4)+(trimmed?0:s32Data));
  const frames=starts.map((start,i)=>{
    const box=frameTable+i*8;
    const [x,y,w,h]=trimmed?[box,box+2,box+4,box+6].map(u16):[0,0,width,height];
    const end=trimmed?(starts[i+1]??bytes.length):start+u32(frameTable+i*4)*4;
    requireFormat(start<=end&&end<=bytes.length&&(end-start)%4===0&&x+w<=width&&y+h<=height);
    return {start,end,x,y,w,h};
  });
  return {width,height,count,bounds:frames,frame(index){
    const {start,end,x,y,w,h}=frames[index];
    if(!w||!h)return {x,y,w,h,pixels:null};
    const pixels=new Uint8ClampedArray(w*h*4);
    let pixel=0;
    for(let at=start;at<end&&pixel<pixels.length;at+=4){
      const alpha=bytes[at],red=bytes[at+1],green=bytes[at+2],blue=bytes[at+3];
      if(!alpha&&!green&&!blue){
        pixel+=red*4;
      }else{
        pixels[pixel++]=red;
        pixels[pixel++]=green;
        pixels[pixel++]=blue;
        pixels[pixel++]=alpha;
      }
    }
    return {x,y,w,h,pixels};
  }};
}
