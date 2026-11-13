import {huntById} from './relic-arsenal.mjs?v=heirlooms-1';
import {drawRelicEmblem} from './relic-emblems.mjs?v=heirlooms-1';

const glyphs={
  tiger:'M12 47 Q30 13 66 15 Q50 20 40 34 Q65 15 84 25 Q61 30 49 47 Q69 34 88 39 Q68 49 57 65 Q45 84 24 84 M18 67 Q36 62 41 51',
  dragon:'M21 64 C21 86 64 89 70 62 C75 41 35 51 37 30 Q39 18 57 17 L67 9 L65 21 L81 27 L66 33 L55 28 M37 67 Q53 62 56 73 M75 43 L88 40 L82 50',
  phoenix:'M48 84 Q64 71 55 53 Q45 66 36 52 Q30 42 32 29 Q39 42 48 37 Q41 21 58 11 Q51 30 66 41 Q86 57 67 75 M22 58 Q14 35 25 20 M75 17 Q91 32 86 48',
  turtle:'M50 12 L76 26 L84 54 L70 76 L50 86 L30 76 L16 54 L24 26 Z M50 12 L50 86 M24 26 L76 26 M16 54 L84 54 M30 76 L70 76 M24 26 L70 76 M76 26 L30 76',
  qilin:'M50 87 L30 61 Q18 45 34 28 Q27 43 43 53 L50 12 L57 53 Q73 43 66 28 Q82 45 70 61 Z M38 60 L50 73 L62 60 M14 52 L17 68 L32 79 M86 52 L83 68 L68 79',
  flameblade:'M32 76 L71 20 L74 43 L42 81 M24 68 L52 88 M31 79 L24 89 M47 59 Q15 54 29 30 Q31 44 40 45 Q33 28 49 12 Q47 28 55 35 M61 67 Q81 61 81 49',
  stormbow:'M24 16 Q60 18 76 50 Q59 83 24 84 L37 50 Z M18 50 L86 50 M69 38 L86 50 L69 62 M43 27 L51 14 L53 24 L63 12 M44 73 L51 86 L54 76 L63 88',
  windhalberd:'M27 87 L68 21 L83 14 L80 31 L63 39 M47 55 Q72 65 85 43 Q85 67 59 72 M15 40 Q25 23 47 24 M12 56 Q23 43 38 44 M30 77 Q44 85 66 79',
  frostlute:'M28 78 C5 59 29 42 40 57 L66 19 L77 24 L52 64 C59 82 37 90 28 78 Z M32 69 L69 25 M44 71 L72 27 M22 37 L31 19 M17 24 L35 31 M70 73 L86 69 M76 64 L81 79',
  chakra:'M50 10 L58 23 L74 20 L77 36 L91 43 L82 57 L87 73 L71 76 L63 90 L50 83 L37 90 L29 76 L13 73 L18 57 L9 43 L23 36 L26 20 L42 23 Z M73 50 A23 23 0 1 0 27 50 A23 23 0 1 0 73 50 M43 58 L54 42 L52 53 L60 49',
  reaper:'M26 86 L66 32 L79 24 M26 47 Q35 14 80 18 L90 27 Q50 24 26 47 Z M33 69 Q48 83 73 65 Q58 92 36 83 M19 58 L14 69',
  bell:'M25 67 Q36 52 36 34 Q36 23 50 21 Q64 23 64 34 Q64 52 75 67 Z M45 21 L50 11 L55 21 M44 72 Q50 87 56 72 M24 33 Q13 45 19 56 M76 33 Q87 45 81 56 M35 89 Q50 95 65 89',
  fangs:'M21 17 Q49 22 62 55 L56 72 L50 58 Q40 37 21 17 Z M79 17 Q51 22 38 55 L44 72 L50 58 Q60 37 79 17 Z M34 60 L47 72 M66 60 L53 72 M44 78 L50 88 L56 78',
  cannon:'M17 73 L43 37 L67 53 L40 88 Z M40 39 L47 27 L76 45 L67 55 Z M60 38 L65 20 L72 27 L80 12 L81 28 L94 24 L88 38 M26 65 L49 79 M32 56 L55 70',
};

const cache=new Map();

export function skillSigil(id) {
  if(cache.has(id)) return cache.get(id);
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  ctx.translate(128,128);
  ctx.strokeStyle='#f3ddff';
  ctx.lineJoin='round';
  ctx.lineCap='round';
  for(const [radius,width,opacity] of [[109,2,.52],[102,3,.96],[89,2,.46]]){
    ctx.lineWidth=width;
    ctx.globalAlpha=opacity;
    ctx.beginPath();
    ctx.arc(0,0,radius,0,Math.PI*2);
    ctx.stroke();
  }
  ctx.globalAlpha=.85;
  for(let i=0;i<12;i++){
    ctx.rotate(Math.PI/6);
    ctx.lineWidth=i%3===0?2.8:1.7;
    ctx.beginPath();
    ctx.moveTo(0,-113);
    ctx.lineTo(4,-106);
    ctx.lineTo(0,-96);
    ctx.lineTo(-4,-106);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha=1;
  ctx.scale(1.57,1.57);
  ctx.translate(-50,-50);
  ctx.lineWidth=3.6;
  ctx.strokeStyle='#fff8e4';
  const relic=huntById.get(id);
  if(relic)drawRelicEmblem(ctx,relic);
  else ctx.stroke(new Path2D(glyphs[id]??glyphs.tiger));
  const result={canvas,url:'url("'+canvas.toDataURL('image/png')+'")'};
  cache.set(id,result);
  return result;
}
