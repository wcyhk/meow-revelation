import {readGersangFrames,spriteFileLimit} from './gersang-frames.mjs?v=dojo-1';

function node(tag,content){
  const element=document.createElement(tag);
  if(content)element.textContent=content;
  return element;
}

export function spriteReferenceView(){
  const root=node('section');
  root.className='sprite-reference';
  const canvas=node('canvas');
  canvas.setAttribute('aria-label','韓版原始圖格');
  const picture=node('img');
  picture.alt='巨商參考圖';
  picture.referrerPolicy='no-referrer';
  const caption=node('small');
  const viewport=node('div');
  viewport.className='sprite-viewport';
  const scratch=document.createElement('canvas');
  viewport.append(picture,canvas,caption);

  const file=node('input');
  file.type='file';
  file.accept='.s32,.agf,.S32,.AGF,application/octet-stream';
  file.setAttribute('aria-label','載入本機 S32 或 AGF');
  const pick=node('label','載入原始圖格');
  pick.className='secondary sprite-import';
  pick.append(file);
  const note=node('small');
  note.className='sprite-note';
  note.setAttribute('role','status');
  const guide=node('small');
  guide.className='sprite-guide';

  const controls=node('div');
  controls.className='sprite-controls';
  const seek=node('input');
  seek.type='range';
  seek.min='1';
  seek.step='1';
  seek.setAttribute('aria-label','原圖圖格');
  const readout=node('output');
  const direction=node('select');
  direction.setAttribute('aria-label','原圖方向');
  const play=node('button','播放');
  play.type='button';
  play.className='secondary';
  controls.append(seek,readout,direction,play);
  root.append(node('h3','巨商參考圖'),viewport,controls,pick,guide,note);

  let sequence=null,reference=null,hint=null,timer=null,request=0;
  let region;
  const stop=()=>{
    if(timer!==null)clearInterval(timer);
    timer=null;
    play.textContent='播放';
  };
  const setReference=(data,clientGuide=null)=>{
    request++;
    sequence=null;
    reference=data;
    hint=clientGuide;
    file.value='';
    stop();
    controls.hidden=canvas.hidden=true;
    picture.hidden=!data;
    caption.textContent=data?.caption??'暫無公開對照圖';
    guide.hidden=!hint;
    guide.textContent=hint?.filename+(hint?.frame?' · 第 '+hint.frame+' 格':hint?.note?' · '+hint.note:'');
    note.textContent='S32／AGF 只喺本機讀取';
    if(data)picture.src=data.url;
    else picture.removeAttribute('src');
  };
  picture.addEventListener('error',()=>{
    if(!reference||sequence)return;
    picture.hidden=true;
    caption.textContent='參考圖暫時載入唔到';
  });

  const drawFrame=()=>{
    const index=Number(seek.value);
    const frame=sequence.frame(index-1);
    const context=canvas.getContext('2d');
    context.clearRect(0,0,canvas.width,canvas.height);
    if(frame.pixels){
      scratch.width=frame.w;
      scratch.height=frame.h;
      scratch.getContext('2d').putImageData(new ImageData(frame.pixels,frame.w,frame.h),0,0);
      const scale=Math.min(210/region.w,155/region.h);
      const x=(canvas.width-region.w*scale)/2+(frame.x-region.x)*scale;
      const y=(canvas.height-region.h*scale)/2+(frame.y-region.y)*scale;
      context.imageSmoothingEnabled=false;
      context.drawImage(scratch,Math.round(x),Math.round(y),Math.round(frame.w*scale),Math.round(frame.h*scale));
    }
    readout.value=index+' / '+sequence.count;
  };
  seek.addEventListener('input',()=>{
    stop();
    drawFrame();
  });
  play.addEventListener('click',()=>{
    if(timer!==null){stop();return;}
    timer=setInterval(()=>{
      const index=Number(seek.value);
      seek.value=index===Number(seek.max)?seek.min:String(index+1);
      drawFrame();
    },125);
    play.textContent='暫停';
  });
  const setDirection=()=>{
    stop();
    const group=Number(direction.value);
    const size=group?sequence.count/5:sequence.count;
    seek.min=String((group?group-1:0)*size+1);
    seek.max=String(Number(seek.min)+size-1);
    const bounds=sequence.bounds.slice(Number(seek.min)-1,Number(seek.max)).filter(frame=>frame.w&&frame.h);
    if(bounds.length){
      const x=Math.min(...bounds.map(frame=>frame.x));
      const y=Math.min(...bounds.map(frame=>frame.y));
      region={x,y,w:Math.max(...bounds.map(frame=>frame.x+frame.w))-x,h:Math.max(...bounds.map(frame=>frame.y+frame.h))-y};
    }else region={x:0,y:0,w:sequence.width,h:sequence.height};
    seek.value=seek.min;
    drawFrame();
  };
  direction.addEventListener('change',setDirection);
  file.addEventListener('change',async()=>{
    const source=file.files[0];
    if(!source)return;
    const token=++request;
    stop();
    note.textContent='讀取緊原始圖格⋯⋯';
    try{
      if(source.size>spriteFileLimit)throw new Error('檔案上限為 48 MB。');
      const decoded=await readGersangFrames(await source.arrayBuffer());
      if(token!==request)return;
      sequence=decoded;
      canvas.width=220;
      canvas.height=164;
      const filename=source.name.toLowerCase();
      const action=hint?.prefix&&filename.startsWith(hint.prefix+'_')?filename.slice(hint.prefix.length+1,-4):null;
      const actionName={n:'待機',m:'移動',a:'攻擊',a2:'第二招',d:'倒地'}[action];
      const grouped=actionName&&action!=='d'&&sequence.count%5===0;
      direction.replaceChildren(...(grouped?['全部方向','方向 1','方向 2','方向 3','方向 4','方向 5']:[]).map((label,index)=>{
        const option=node('option',label);
        option.value=String(index);
        return option;
      }));
      direction.hidden=!grouped;
      setDirection();
      const suggested=hint?.filename.toLowerCase()===source.name.toLowerCase()?hint.frame:1;
      seek.value=String(Math.min(sequence.count,suggested??1));
      play.disabled=sequence.count<2;
      drawFrame();
      caption.textContent=actionName?source.name+' · '+actionName:source.name;
      picture.hidden=true;
      canvas.hidden=controls.hidden=false;
      note.textContent='滑動睇逐格。圖格次序依檔案原有排列。';
    }catch(error){
      if(token===request)note.textContent=error.message||'讀取原始圖格失敗。';
    }
  });
  return {root,setReference};
}
