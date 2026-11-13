const motifs={
  rain:'M33 24 L25 47 M49 15 L40 42 M68 22 L58 48 M76 39 L66 61',
  spikes:'M16 68 L29 32 L38 59 L50 19 L60 56 L70 36 L84 68 Z',
  morph:'M21 37 L20 20 L39 32 Q50 25 61 32 L80 20 L79 37 Q81 61 50 79 Q19 61 21 37 M35 51 L42 54 M65 51 L58 54',
  buff:'M19 67 L41 45 L20 45 L49 23 L79 45 L58 45 L79 67',
  return:'M22 58 Q25 19 69 25 L59 16 M69 25 L62 36 M78 45 Q74 82 29 77 L39 87 M29 77 L36 66',
  guard:'M50 20 L77 31 L74 53 Q70 72 50 81 Q30 72 26 53 L23 31 Z M42 50 L48 57 L60 43',
  ring:'M74 50 A24 24 0 1 0 26 50 A24 24 0 1 0 74 50 M81 50 H89 M11 50 H19 M50 11 V19 M50 81 V89',
  storm:'M77 34 Q59 14 34 31 Q15 44 29 65 Q50 85 68 62 Q77 45 54 41 Q37 39 40 53 Q44 64 55 56',
  minion:'M24 38 L37 25 L50 40 L63 25 L76 38 L78 60 L50 75 L22 60 Z M37 50 L41 54 M63 50 L59 54',
  beam:'M17 64 L55 28 M29 75 L68 37 M41 82 L80 44 M51 27 L62 21 L61 34 M76 45 L87 40 L84 53',
  volley:'M20 72 L62 30 M48 28 L65 27 L64 44 M38 78 L78 48 M65 47 L80 46 L79 61',
  drain:'M50 17 C46 33 24 48 24 65 C24 88 76 88 76 65 C76 48 54 33 50 17 Z M41 61 Q49 74 61 61',
  wall:'M19 77 V46 L27 28 L36 46 V77 M36 77 V36 L50 17 L64 36 V77 M64 77 V46 L73 28 L81 46 V77',
  blink:'M27 24 L13 50 L27 76 M73 24 L87 50 L73 76 M37 50 H64 M56 41 L65 50 L56 59',
  wave:'M15 40 Q30 21 45 40 T75 40 L83 34 M15 60 Q30 41 45 60 T75 60 L83 54',
  chain:'M31 35 L21 45 Q13 56 24 66 Q34 76 45 65 L55 56 M69 65 L79 55 Q87 44 76 34 Q66 24 55 35 L45 44 M41 59 L59 41',
};
const marks={
  light:'M50 7 L53 14 L60 17 L53 20 L50 27 L47 20 L40 17 L47 14 Z',
  lightning:'M53 6 L43 18 L51 17 L47 28 L60 13 L52 14 Z',
  earth:'M42 19 L50 8 L59 19 L50 25 Z',ice:'M50 5 V25 M42 10 L58 21 M58 10 L42 21',
  void:'M57 7 Q41 10 45 21 Q50 29 61 21 Q48 22 57 7 Z',
  fire:'M44 23 Q40 18 49 7 Q46 18 54 15 Q58 20 54 25 Z',
  blood:'M50 6 Q53 13 58 19 Q58 26 50 26 Q42 26 42 19 Z',
  poison:'M44 11 L50 7 L56 11 L56 20 L50 25 L44 20 Z M50 13 V21',
  wind:'M41 13 Q50 8 59 13 M43 19 Q51 15 59 19 M45 24 Q51 20 55 24',
};
const weaponMarks={
  sword:'M-4 8 L7 -10 M-5 1 L2 5',seven:'M0 9 V-9 M-6 0 L0 -4 L6 0 M-5 5 L0 1 L5 5',
  doll:'M-7 5 Q-8 -5 0 -5 Q8 -5 7 5 Z M-7 -3 L-7 -8 L-2 -5 M7 -3 L7 -8 L2 -5',
  orb:'M6 0 A6 6 0 1 0 -6 0 A6 6 0 1 0 6 0',spear:'M-5 8 L5 -8 L7 -2 L2 0',
  claw:'M-5 6 L-2 -7 M0 7 L3 -8 M5 8 L8 -5',halberd:'M-5 8 L6 -8 M-1 1 Q-8 -2 -5 -8 L3 -5',
  axe:'M-5 8 L5 -8 M-1 2 Q-8 3 -8 -5 L4 -6',staff:'M-4 8 L4 -8 M-4 5 L1 8',
  ring:'M7 0 A7 7 0 1 0 -7 0 A7 7 0 1 0 7 0 M3 0 A3 3 0 1 0 -3 0 A3 3 0 1 0 3 0',
  bow:'M-6 -8 Q8 0 -6 8 L-3 0 Z M-7 0 H9',curve:'M-5 8 Q7 3 7 -8 Q-2 -6 -5 1',
  cane:'M-2 8 L-2 -3 Q-2 -9 4 -7 Q9 -4 5 -1',beads:'M-7 -2 Q0 9 7 -2 M-7 -3 V-2 M0 4 V6 M7 -3 V-2',
  trident:'M0 9 V-9 M-6 -7 V-3 Q-6 1 0 0 Q6 1 6 -3 V-7',
  bell:'M-7 5 Q-4 1 -4 -4 Q0 -9 4 -4 Q4 1 7 5 Z M-2 7 Q0 10 2 7',
  talisman:'M-5 -8 H5 V8 H-5 Z M-2 -4 H2 M-2 0 H2 M-2 4 H2',
  snake:'M-4 8 Q7 6 1 2 Q-7 -2 1 -4 L6 -7',gun:'M-7 6 L-2 -2 L7 -7 L9 -4 L3 1 L-2 2 L-3 8 Z',
  crossbow:'M-8 -3 L0 2 L8 -3 M0 -8 V8',horn:'M-6 5 Q-7 -6 8 -8 Q0 0 0 8 Z',
  feather:'M-6 7 L5 -7 M-3 4 Q-7 -5 7 -8 Q7 3 -3 4',fang:'M-6 -7 Q8 -4 3 8 Q0 1 -6 -1 Z',
  box:'M-7 -5 H7 V6 H-7 Z M-7 -1 H7 M-2 2 H2',
};

export function drawRelicEmblem(ctx,weapon){
  ctx.save();
  ctx.translate(50,50);
  ctx.rotate((weapon.sigil%5-2)*.095);
  ctx.scale(.84,.84);
  ctx.translate(-50,-50);
  ctx.stroke(new Path2D(motifs[weapon.spell.action]));
  ctx.restore();
  ctx.lineWidth=2.5;
  ctx.strokeStyle=weapon.ink;
  ctx.stroke(new Path2D(marks[weapon.element]));
  ctx.save();
  ctx.translate(78,20);
  ctx.lineWidth=2.1;
  ctx.stroke(new Path2D(weaponMarks[weapon.form]));
  ctx.restore();
  for(let bit=0;bit<6;bit++){
    const x=25+bit*10;
    ctx.beginPath();
    if((weapon.sigil+1)&(1<<bit)){
      ctx.moveTo(x-3,83);ctx.lineTo(x,78);ctx.lineTo(x+3,83);ctx.lineTo(x,88);ctx.closePath();
    }else{
      ctx.moveTo(x-2,85);ctx.lineTo(x+2,85);
    }
    ctx.stroke();
  }
}
