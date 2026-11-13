import {monsterCatalogue} from './monster-catalogue.mjs?v=bestiary-1';
import {bestiaryTint} from './bestiary-models.mjs?v=practice-1';

const patterns={
  serpent:['lance','roots','gravity','sweep'],hydra:['jaws','prison','summon','cross'],
  ogre:['cleave','burst','pounce','toll'],rider:['pounce','lance','barrage','sweep'],
  beast:['pounce','jaws','cleave','roots'],duelist:['cleave','lance','sweep','blink'],
  dragon:['lance','feathers','spiral','pounce'],bird:['feathers','pounce','sweep','marked'],
  priest:['marked','prison','summon','eclipse'],emperor:['sweep','lance','prison','cleave'],
  turtle:['ring','burst','sweep','roots'],star:['spiral','ring','cross','gravity'],
  captain:['barrage','lance','coins','burst'],spider:['web','roots','pounce','prison'],
  wasp:['feathers','pounce','barrage','web'],shade:['blink','gravity','eclipse','gravefan'],
  eggs:['summon','burst','marked','ring'],straw:['roots','gravity','cross','sweep'],
};
const toneEffect={
  amber:'lightning',gold:'gold',ember:'fire',blood:'blood',jade:'wind',moss:'root',
  teal:'water',frost:'ice',bone:'stone',violet:'void',void:'void',venom:'root',
};
const giantAttacks={
  '皇帝烏龜':['ring','sweep','burst','cinders'],
  '大王馬蜂':['feathers','pounce','web','barrage'],
  '貪':['lance','cross','gravity','spiral'],
  '黑影':['blink','gravity','eclipse','gravefan'],
  '牛鬼':['lance','spiral','pounce','cleave'],
  '雞蛋怪':['summon','burst','ring','sweep'],
  '稻草怪':['gravity','cross','roots','sweep'],
  '山魈':['burst','cinders','cleave','pounce'],
  '古代雪人':['icicles','spiral','burst','ring'],
};
const finishers={fire:'cinders',blood:'jaws',wind:'spiral',root:'roots',water:'gravity',
  ice:'icicles',stone:'burst',gold:'coins',lightning:'cross',void:'eclipse'};
export const bossMoveNames={
  lance:'貫穿長刺',roots:'地刺',gravity:'牽引',sweep:'橫掃',jaws:'雙顎撕咬',prison:'四角圍陣',summon:'召喚援兵',
  cross:'交叉封鎖',cleave:'重斬',burst:'震地衝擊',pounce:'直線突襲',toll:'震波',barrage:'扇面彈幕',blink:'移影伏擊',
  feathers:'飛羽箭陣',spiral:'迴旋彈幕',marked:'追身咒印',eclipse:'月蝕爆裂',ring:'環形震擊',coins:'迴旋飛刃',
  web:'縛足蛛網',gravefan:'墓扇回剪',icicles:'落冰',cinders:'流火裂痕',
};

export const giantBosses=monsterCatalogue.filter(entry=>entry.source==='big');
const roster=monsterCatalogue.filter(entry=>entry.source!=='big');
const featured=[
  'gaoshoudong','qinglongtan','wuningwang','shenxian','guiyidong','deva','zhaoze','orochi','wudou','haian',
];
const fieldBosses=[
  ...giantBosses,
  ...featured.map(source=>roster.find(entry=>entry.source===source)).filter(Boolean),
];
const campaignBosses=[...new Map([...fieldBosses,...roster].map(entry=>[entry.id,entry])).values()];

export {monsterCatalogue};

export function visitorFor(stage,seed){
  if(stage.floor<3||stage.boss||stage.objective||((stage.floor-3)%4))return null;
  const interval=Math.floor((stage.floor-3)/4);
  const offset=seed>>>0;
  return campaignBosses[(offset+interval*37)%campaignBosses.length];
}

export function monsterBattle(entry,floor,mode={}){
  const effect=toneEffect[entry.tone];
  const bag=patterns[entry.family];
  const stagger=(entry.name.length+entry.crest.length)%bag.length;
  const familyAttacks=[...bag.slice(stagger),...bag.slice(0,stagger)];
  const attacks=[...(giantAttacks[entry.name]??new Set([...entry.attacks,...familyAttacks]))].slice(0,4);
  const finishing=entry.source==='big'?(giantAttacks[entry.name]?.[2]??finishers[effect]):finishers[effect];
  if(!attacks.includes(finishing))attacks.push(finishing);
  const brute=['turtle','ogre','emperor'].includes(entry.family);
  const quick=['wasp','bird','duelist','spider'].includes(entry.family);
  const ranged=['priest','captain','wasp','star'].includes(entry.family);
  return {name:entry.name,frame:6,bestiary:entry,secondary:true,tint:bestiaryTint(entry.tone),effect,
    form:'邪相現形',signature:attacks.map(attack=>bossMoveNames[attack]).slice(0,3).join(' · '),
    attacks,finishing,
    hp:Math.round((285+floor*17)*(mode.hp??1)*(brute?1.13:.96)),
    height:brute?4.1:entry.family==='eggs'?3.22:quick?3.66:3.9,
    speed:(brute?1.67:quick?2.80:2.29)*Math.sqrt(mode.pace??1),
    ranged:ranged?4.1:undefined,reach:ranged?9.4:6.3,radius:brute?2.75:2.2,
    time:(quick?.92:1.16)/Math.sqrt(mode.pace??1),hurt:(12+floor*.28)*(mode.damage??1),
    mass:brute?5.3:3.7,phases:entry.name==='黑影'?[.66,.30]:[.5]};
}

export function fightCatalogue(document,entries,select,describe){
  const root=document.createElement('div');
  root.className='bestiary-list';
  const query=document.createElement('input');
  query.type='search';
  query.placeholder='搜尋頭目';
  query.setAttribute('aria-label','搜尋頭目');
  const list=document.createElement('div');
  list.className='bestiary-results';
  const status=document.createElement('p');
  status.className='bestiary-count';
  status.setAttribute('aria-live','polite');
  const modes=[['全部',null],['主線',new Set(['story'])],['巨型',new Set(['big'])],['討伐',new Set(['tobel'])]];
  let selected=modes[0];
  const filters=document.createElement('div');filters.className='bestiary-filters';
  const paint=()=>{
    const name=query.value.trim().toLocaleLowerCase();
    const matches=entries.filter(monster=>(!selected[1]||selected[1].has(monster.source))
      &&monster.name.toLocaleLowerCase().includes(name));
    list.replaceChildren(...matches.map(monster=>{
      const card=document.createElement('button');
      card.type='button';card.className='bestiary-fight';
      card.dataset.monster=monster.id;
      const heading=document.createElement('strong');
      heading.textContent=monster.name;
      const label=document.createElement('small');
      const {spec,weakness}=describe(monster);
      label.textContent=(monster.floor?'第 '+monster.floor+' 關 · ':'')+weakness.name;
      card.style.setProperty('--bestiary-ink','#'+spec.tint.toString(16).padStart(6,'0'));
      const action=document.createElement('span');
      action.className='bestiary-preview-label';
      action.textContent='招式及反制';
      card.setAttribute('aria-label',monster.name+'，招式及反制');
      card.append(heading,label,action);
      card.addEventListener('click',()=>select(monster));
      return card;
    }));
    status.textContent=matches.length?matches.length+' 名頭目':'找不到頭目';
    for(const [index,control] of [...filters.children].entries())control.setAttribute('aria-pressed',String(modes[index]===selected));
  };
  for(const mode of modes){
    const control=document.createElement('button');
    control.type='button';control.className='secondary';control.textContent=mode[0];
    control.addEventListener('click',()=>{selected=mode;paint();});
    filters.append(control);
  }
  query.addEventListener('input',paint);
  paint();
  root.append(query,filters,status,list);
  return root;
}
