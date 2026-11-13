import {skillSigil} from './skill-sigils.mjs?v=weapon-audit-1';
import {schools,buildStats} from './blessings.mjs?v=heirlooms-1';
import {relicPower} from './relic-arsenal.mjs?v=weapon-audit-1';

const motifs={
  thorn:'M20 75 L72 22 M32 61 L18 49 L28 42 L45 48 M52 46 L44 27 L54 22 L62 33 M42 54 L56 69 L66 61 L56 49',
  moon:'M67 20 Q37 24 34 49 Q31 76 67 78 Q22 84 19 50 Q23 22 67 20 Z M72 34 V53 M63 43 H81',
  flower:'M50 50 C24 39 30 22 43 25 Q52 26 50 50 C52 25 72 27 73 40 Q73 50 50 50 C72 47 83 64 69 74 Q58 80 50 50 C41 78 21 69 25 57 Q30 48 50 50 Z',
  step:'M16 57 H42 L54 43 L43 22 M42 60 L56 68 H81 M44 39 L55 23 L65 37 L76 35 M22 75 H38',
  star:'M50 17 L58 40 L82 42 L64 57 L71 80 L50 66 L29 80 L36 57 L18 42 L42 40 Z',
  reach:'M23 72 L72 23 M48 25 L72 23 L70 47 M27 45 L23 72 L50 69 M48 48 L53 53',
  shell:'M50 20 L78 30 L75 58 Q69 73 50 81 Q31 73 25 58 L22 30 Z M50 36 L62 49 L50 65 L38 49 Z',
  wind:'M17 40 H65 Q84 40 76 25 Q70 16 61 23 M20 51 H76 Q84 51 84 57 M22 65 H53 Q69 66 64 78',
  spring:'M50 17 Q38 41 38 51 Q38 63 50 63 Q62 63 62 51 Q62 41 50 17 Z M20 62 Q50 86 80 62 M28 72 Q50 92 72 72',
  lantern:'M37 29 L50 19 L63 29 M32 32 H68 L62 72 H38 Z M32 74 H68 M49 65 Q38 60 49 43 Q47 54 55 51 Q61 60 49 65',
  kindling:'M38 75 Q20 62 37 46 Q45 38 46 22 Q53 36 49 49 Q62 43 64 34 Q82 57 67 72 M27 79 H73',
  conductor:'M54 19 L29 55 H48 L43 82 L72 45 H51 Z M25 30 H35 M69 66 H79',
  ashbrand:'M47 75 L27 59 L29 33 L51 21 L72 34 L73 59 L56 74 M39 43 H44 M56 43 H61 M42 59 L50 53 L58 59',
  gravefire:'M23 73 L51 22 Q69 28 74 48 L28 77 M43 59 Q52 37 64 38 Q63 52 43 59 M24 55 L32 44',
  bloodoil:'M50 19 Q28 45 28 60 Q28 79 50 81 Q72 79 72 60 Q72 45 50 19 Z M38 60 Q42 69 49 70',
  static:'M15 63 L36 40 L41 58 L58 33 L63 48 L83 28 M70 28 H83 V42',
  sunder:'M27 23 L73 23 L70 66 L50 80 L30 66 Z M59 24 L44 44 L55 49 L43 70',
  aftertone:'M24 42 Q50 20 76 42 M19 55 Q50 34 81 55 M31 70 Q50 58 69 70 M48 78 H52',
  afterstep:'M19 66 L50 30 L77 27 L51 62 L81 59 M28 74 L46 54',
  reflex:'M50 20 L70 42 L50 37 L30 42 Z M50 42 L70 64 L50 59 L30 64 Z M50 61 L70 83 L50 78 L30 83 Z',
  swiftcut:'M28 74 L65 25 L77 20 L71 35 L38 80 M23 54 L47 77 M20 44 L43 22',
  suture:'M21 51 Q35 24 50 41 Q65 24 79 51 Q76 66 50 80 Q24 66 21 51 Z M34 55 L42 55 L46 47 L52 62 L57 52 L66 52',
  iceheart:'M50 20 V80 M23 35 L77 65 M77 35 L23 65 M42 24 L50 32 L58 24 M42 76 L50 68 L58 76',
  votive:'M25 70 H75 M32 69 V40 L50 24 L68 40 V69 M42 58 H58 M50 49 V65 M44 18 L50 13 L56 18',
};
const cachedIcons=new Map();
const boonMotifs={
  echo:'M24 51 Q50 29 76 51 M30 68 Q50 50 70 68',
  stun:'M49 21 V61 M49 75 V79 M27 32 L34 40 M73 32 L66 40',
  chain:'M27 65 L44 48 L38 38 L64 24 M44 48 L60 52 L78 39',
  chill:'M50 22 V79 M27 36 L73 65 M73 36 L27 65',
  pull:'M23 33 L43 48 L24 61 M77 33 L57 48 L76 61 M48 49 H52',
  wide:'M42 33 L24 50 L42 67 M58 33 L76 50 L58 67',
  haste:'M27 69 L48 44 H31 L51 25 M51 69 L72 44 H55 L75 25',
  burn:'M37 72 Q23 60 39 44 Q48 35 47 20 Q65 42 56 52 Q71 43 70 57 Q75 69 62 76',
  riposte:'M25 58 Q50 84 75 58 M51 69 V22 M39 34 L51 22 L63 34',
  guard:'M50 23 L74 32 L70 62 L50 77 L30 62 L26 32 Z',
  expose:'M22 51 Q50 23 78 51 Q50 79 22 51 Z M50 42 V60',
  drain:'M50 23 Q28 45 30 59 Q34 75 50 75 Q66 75 70 59 Q72 45 50 23 Z',
};
const el=(tag,text,kind)=>{
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  if(kind)node.className=kind;
  return node;
};

function blessingImage(relic){
  if(cachedIcons.has(relic.id))return cachedIcons.get(relic.id);
  const canvas=el('canvas');
  canvas.width=canvas.height=96;
  const ctx=canvas.getContext('2d');
  ctx.scale(.96,.96);
  ctx.fillStyle='#191721';
  ctx.strokeStyle=schools[relic.school].ink;
  ctx.lineWidth=2.3;
  ctx.beginPath();
  ctx.moveTo(50,4);ctx.lineTo(91,25);ctx.lineTo(91,75);ctx.lineTo(50,96);ctx.lineTo(9,75);ctx.lineTo(9,25);ctx.closePath();
  ctx.fill();ctx.stroke();
  ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=4;
  if(relic.weaponId){
    ctx.globalAlpha=.52;
    ctx.drawImage(skillSigil(relic.weaponId).canvas,9,9,82,82);
    ctx.globalAlpha=1;
    ctx.stroke(new Path2D(boonMotifs[relic.augment]));
  }else ctx.stroke(new Path2D(motifs[relic.id]));
  const url=canvas.toDataURL();
  cachedIcons.set(relic.id,url);
  return url;
}

export function blessingIcon(relic){
  const icon=el('img','','blessing-emblem');
  icon.alt='';
  icon.src=blessingImage(relic);
  return icon;
}

function tally(relics){
  const inventory=new Map();
  for(const relic of relics){
    const entry=inventory.get(relic.id)??{relic,rank:0};
    entry.rank++;
    inventory.set(relic.id,entry);
  }
  return inventory;
}

export function bonusPercent(value){
  const rounded=Math.round(value*1000)/10;
  return (rounded>0?'+':'')+rounded+'%';
}

export function paintBlessingHud(control,relics){
  const unique=[...tally([...relics].reverse()).values()].slice(0,3);
  control.setAttribute('aria-label','已獲祝福 '+relics.length+' 份。打開查看加成');
  control.title='查看祝福同加成';
  control.replaceChildren(...unique.map(({relic,rank})=>{
    const item=el('span','','blessing-mini');
    item.append(blessingIcon(relic));
    if(rank>1)item.append(el('small',String(rank)));
    return item;
  }),el('span','✦ '+relics.length));
  control.hidden=!relics.length;
}

export function blessingLedger(relics,weapon,hero,training,floor){
  const body=el('div','','blessing-ledger');
  const base={technique:hero.technique};
  buildStats(base,weapon,floor,[],training);
  const percent=bonusPercent;
  const format=(now,before,digits=0)=>{
    const value=Number((now-before).toFixed(digits));
    return (value>=0?'+':'')+value;
  };
  const specialRank=relics.filter(relic=>relic.weaponId===weapon.id).length;
  const totals=el('div','','blessing-totals');
  const metrics=[
    ['最大生命',format(hero.maxHp,base.maxHp)],['普攻傷害',percent(hero.damage/base.damage-1)],
    ['技能傷害',percent(hero.spellDamage*relicPower(specialRank)/base.spellDamage-1)],
    ['技能冷卻',format(hero.spellTime,base.spellTime,2)+' 秒'],['承傷減免',percent(hero.armor)],
    ['移速',percent(hero.moveSpeed/base.moveSpeed-1)],['普攻速度',percent(base.attackPeriod/hero.attackPeriod-1)],
    ['普攻距離',format(hero.reach,base.reach,2)+' 格'],['技能距離',format(hero.spellRadius,base.spellRadius,2)+' 格'],
    ['第三擊倍率',format(hero.finisher,base.finisher,2)+' 倍'],['翻滾冷卻',format(hero.rollTime,base.rollTime,2)+' 秒'],
    ['擊倒回血',format(hero.leech,base.leech,1)],['過關回復',percent(hero.recovery)],
  ];
  for(const [label,value] of metrics.filter(([,value])=>parseFloat(value)!==0)){
    const item=el('div');
    item.append(el('span',label),el('strong',value));
    totals.append(item);
  }
  body.append(totals);
  const inventory=tally(relics);
  const list=el('div','','blessing-items');
  for(const {relic,rank} of [...inventory.values()].reverse()){
    const item=el('article');
    const text=el('div');
    const weaponStatus=relic.weaponId?(relic.weaponId===weapon.id?' · 已生效':' · 裝備對應神器時生效'):'';
    const buff=relic.weaponId?'技能傷害 '+bonusPercent(relicPower(rank)-1)+' · ':'';
    text.append(el('strong',relic.name+' ×'+rank+weaponStatus),el('p',buff+relic.detail));
    item.append(blessingIcon(relic),text);
    list.append(item);
  }
  body.append(list);
  return body;
}

export function weaponPicker(weapons,icons,select){
  const root=el('details','','heirloom-picker');
  root.append(el('summary','自選神器 · '+weapons.length+' 件'));
  root.addEventListener('toggle',()=>{
    if(!root.open||root.dataset.ready)return;
    root.dataset.ready='true';
    const input=el('input');
    input.type='search';input.placeholder='搜尋武器、技能或頭目';
    input.setAttribute('aria-label',input.placeholder);
    const list=el('div','','heirloom-list');
    for(const weapon of weapons){
      const item=el('button','','heirloom-choice');
      item.type='button';
      item.dataset.armChoice=weapon.id;
      item.dataset.search=[weapon.name,weapon.skill,weapon.guardian?.name,weapon.blessing?.name].join(' ');
      item.style.setProperty('--weapon-tone',weapon.ink);
      const icon=el('img');
      icon.alt='';icon.loading='lazy';
      icon.src=icons.get(weapon.id);
      const text=el('div');
      text.append(el('b',weapon.name),el('span',weapon.skill+' · '+weapon.detail));
      if(weapon.guardian)text.append(el('small','守護頭目 · '+weapon.guardian.name));
      item.append(icon,text);
      item.addEventListener('click',()=>select(weapon));
      list.append(item);
    }
    input.addEventListener('input',()=>{
      for(const item of list.children)item.hidden=!item.dataset.search.includes(input.value.trim());
    });
    root.append(input,list);
  });
  return root;
}
