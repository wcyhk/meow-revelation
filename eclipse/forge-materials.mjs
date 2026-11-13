import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=practice-1';

const surfaces={};
const palettes={
  tiger:'1c2f3a 5f9ba7 c9e0d8 293f4c 70c6d8', dragon:'291a20 8d5b21 f6c470 53492e ffb941',
  phoenix:'512818 b08132 f8d180 47393e f07b32', turtle:'183b48 488e9a e6f7fc 25465a 89ebff',
  qilin:'192d27 8a7544 e1cb91 315b4d 92d4aa', flameblade:'35181c ab3f24 fcf3cd 512725 ff6d30',
  stormbow:'27293b b3944c f8e8b5 46647b 70c5ff', windhalberd:'253033 8b8567 edeee0 374d42 82cd8e',
  frostlute:'312128 b58941 f7dda2 294f57 73d3ef', chakra:'362225 ac7731 ffe193 756123 f7bc40',
  reaper:'232534 6a654b e9e0ce 50425e b68af0', bell:'27221e 986138 d5b174 264747 7cddc6',
  fangs:'35202a 85616c f2d1ad 662936 ff4568', cannon:'222531 836149 f0cb8e 45323a ff823b',
  'sam-in':'343241 707791 e2f3ff 552f45 b3baff', 'true-seven':'25262b 75564c d8e2d5 424548 e85b43',
  'fox-doll':'412323 b54526 efd29e 247358 ffd479', 'thunder-pearl':'183245 438b93 caffff 246172 91faff',
  'snow-doll':'2c253e 4b648f e2fbfc 303e72 a6e9ff', 'han-spear':'242834 63707d e0e4e4 303947 92bdd4',
  'kunoichi-claw':'242c37 707387 e7f8ff 432d3d ee4d55', 'sky-halberd':'292933 a45c35 f4ead2 254d54 ff7933',
  'glacier-sword':'192634 415f81 dbf9fb 204d79 79ecff', 'snow-axe':'403226 8f7344 f5f3de 3c5264 a8f7ff',
  'sky-dragon-staff':'1e2a33 4e8198 cdf3f3 315570 74c5e4', 'treasure-staff':'492829 9c6340 f8d27a 303e45 eaae5b',
  'red-corporal':'2b3039 9c352a f1e4cc 6d292b f46942', 'blue-corporal':'263035 407282 e3f8fd 296478 6ad7ef',
  'blood-axe':'302026 975e59 f2d1bc 632630 ff5065', 'wave-wheel':'173133 439c9a bffaff 315e60 72ebeb',
  'thunder-sword':'34342c 948454 f9f7cf 596953 fce4a6', 'oni-bow':'282728 7e6548 d6b99a 3e4742 d87463',
  'moon-kukri':'23252d 9a7135 e2e9ee 552d2e f1ce88', 'dragon-kukri':'372221 9e502d f3af61 732329 f56837',
  'kali-wheel':'392e2f b67b38 f1e7d6 5d4c59 eca955', 'turtle-bow':'342828 ab783a f2dbad 50604d 98b78b',
  'venom-cane':'3a2626 9c5f2c b7d180 385635 aced63', 'yama-cane':'332525 9d854f ead4a5 452f56 c085e6',
  'bat-cane':'262337 6a456e c6bad1 462542 e94ba5', 'skanda-kukri':'2a303d 906842 d8e7fb 344e7f e29045',
  'ice-orb':'193f46 3d9fa1 bcf5fa 357e89 78e8ed', 'fire-orb':'4f251c ab532c ffce81 983426 ff8036',
  'spark-orb':'1b3546 46748c e1ffff 3c577f a1efff', 'earth-beads':'39201d 856035 eac18e 702e26 ef8960',
  'lotus-beads':'342835 935575 f4dced 725477 f1a6e5', 'shiva-trident':'4d2726 bc8b37 ffe8a3 8a4025 ffd95e',
  'dragon-fish':'3c2a21 a67136 eac689 66502d ffb85d', 'lotus-fish':'4b3043 946886 f7dedf 78617a f9bedc',
  goumang:'283b2d 677849 dbeac4 3e6535 a3d163', xuanming:'242c39 52647b d7f3ff 294d6e 76c5fa',
  'red-bow':'3b2728 a56e44 f0c49d 71432c f49a65', 'blood-sword':'39222d 9c4b38 ffdf9f 8c232d ff6947',
  'cursed-cane':'2e2630 8c494b e8b777 502938 f37654', 'golden-orb':'552829 aa7137 ffe3a0 8f4429 ffd562',
  'ice-talisman':'562c29 a16a44 f1bd89 992f29 ff6648', 'rushou-cane':'263731 7c7a4b e1d6a5 356754 aae19c',
  'zhurong-axe':'3f2821 987145 ecba67 652f24 ff963b', 'vritra-spear':'262c43 867654 e3e9f3 3a5380 8fbaff',
  snake:'332b21 856743 d0bd81 5c4b34 e6be74', 'emperor-rod':'422722 a7772c f3c86e 6e3a2a ed6951',
  'western-rifle':'38241f 876050 d7cec0 533022 b7a7df', 'seven-blade':'2a282f 733739 f1e4df 414754 db3e42',
  'sniper-crossbow':'363237 8e6d50 e1e5dd 3a474a c3c8e0', 'lion-crossbow':'3d2c21 a97a2e fde19a 7e4a23 ffbd60',
  airavata:'3c2c28 a67532 fdeac8 625053 f3ba60', hundun:'322822 8a5237 e9be7e 5e3226 ff9857',
  qiongqi:'243339 807748 fceac9 986b30 fff1ab', taotie:'333029 95613f e2b483 4d5340 ff8947',
  taowu:'2c2736 746c87 e5ffff 534467 95ddeb', 'nether-box':'26283b 8e6c54 e8dfd7 444b7e 9fa9ff',
  'nether-bow':'342b2b 9d784c e9e4bf 365b67 84e4ed', 'nether-sword':'38252c 936447 f0c69b 79283d ff4c53',
  'nether-halberd':'26312a 868044 e4efd6 486935 bde958',
};

function surface(kind) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d');
  const grain=ctx.createImageData(128,128);
  let seed=(kind.length*8319+2317)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const waves=Math.sin(x*.14+Math.sin(y*.11)*2)*10+Math.cos(x*.28+y*.18)*6;
    const texture=kind==='wood'?Math.sin(x*.42+Math.sin(y*.07)*1.5)*23:
      kind==='cloth'?((x%4<2)=== (y%5<2)?12:-16):
      kind==='bone'?Math.sin(x*.16+y*.22)*15:
      kind==='metal'?Math.sin(y*.92+x*.018)*6:Math.sin(x*.53+y*.29)*10;
    const value=216+waves+texture+(random()-.5)*(kind==='crystal'?12:28);
    const i=(y*128+x)*4;
    grain.data[i]=value;grain.data[i+1]=value*.98;grain.data[i+2]=value*.96;grain.data[i+3]=255;
  }
  ctx.putImageData(grain,0,0);
  ctx.lineCap='round';
  for(let i=0;i<49;i++){
    const x=random()*128,y=random()*128;
    ctx.strokeStyle=i%2?'#271f2950':'#fff3cf64';
    ctx.lineWidth=.38+random()*.7;
    ctx.beginPath();ctx.moveTo(x,y);
    ctx.lineTo(x+(kind==='metal'?11:4)*random(),y+(kind==='wood'?28:5)*random());ctx.stroke();
  }
  const map=new T.CanvasTexture(canvas);
  map.colorSpace=T.SRGBColorSpace;
  return map;
}

const bone=new Set(['phoenix','qilin','snow-axe','oni-bow','yama-cane','lotus-fish','snake','airavata','hundun','qiongqi','taotie','taowu','reaper','fangs']);
const crystal=new Set(['dragon','turtle','ice-orb','spark-orb','thunder-pearl','glacier-sword','red-corporal','blue-corporal','xuanming','nether-box','stormbow','thunder-sword']);
const cloth=new Set(['fox-doll','snow-doll','ice-talisman']);
const lacquer=new Set(['frostlute','treasure-staff','red-bow','venom-cane','bat-cane','cursed-cane','emperor-rod','western-rifle','dragon-fish','earth-beads']);

export function forgedMaterials(weapon) {
  const {id}=weapon;
  const [dark,trim,edge,body,core]=palettes[id].split(' ').map(hex=>Number.parseInt(hex,16));
  function material(color,kind,metalness,roughness,emissiveIntensity=0){
    const map=surfaces[kind]??=surface(kind);
    const paint={wood:'hide',cloth:'cloth',metal:'iron',bone:'bone',stone:'stone',crystal:'gem'};
    const finish=kind==='metal'&&color===trim?'bronze':paint[kind];
    return paintedFinish(new T.MeshStandardMaterial({color,map,bumpMap:map,bumpScale:kind==='wood'?.037:.024,metalness,roughness,
      emissive:color,emissiveIntensity}),finish);
  }
  return {
    dark:material(dark,cloth.has(id)?'cloth':'wood',.12,.79),
    trim:material(trim,'metal',.48,.43,.035),
    edge:material(edge,bone.has(id)?'bone':'metal',bone.has(id)?.16:.50,bone.has(id)?.60:.36,.035),
    body:material(body,crystal.has(id)?'crystal':cloth.has(id)?'cloth':lacquer.has(id)?'wood':'metal',
      crystal.has(id)?.25:.34,lacquer.has(id)?.38:.59,.075),
    core:material(core,crystal.has(id)?'crystal':'stone',.15,.38,crystal.has(id)?.48:.25),
  };
}
