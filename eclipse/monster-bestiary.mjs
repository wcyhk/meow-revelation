import {monsterCatalogue} from './monster-catalogue.mjs?v=boss-foundry-1';
import {bestiaryTint} from './lantern-creatures.mjs';

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
const effects={amber:'stone',gold:'light',ember:'fire',blood:'blood',jade:'wind',moss:'root',teal:'water',frost:'ice',bone:'light',violet:'void',void:'void',venom:'root'};
const finishers={fire:'cinders',blood:'jaws',wind:'spiral',root:'roots',water:'gravity',ice:'icicles',stone:'burst',light:'coins',lightning:'cross',void:'eclipse'};
export const bossMoveNames={lance:'穿契長刺',roots:'根印封路',gravity:'倒時牽引',sweep:'橫掃契刃',jaws:'噬願雙印',prison:'四封鎖函',summon:'喚出紙衛',
  cross:'交叉斷線',cleave:'重裁',burst:'銅印震地',pounce:'直線追燈',toll:'破鐘震波',barrage:'扇面封信',blink:'移影伏擊',
  feathers:'裁紙箭陣',spiral:'繞燈彈幕',marked:'追名咒印',eclipse:'熄燈爆裂',ring:'環封震擊',coins:'迴旋刻度',web:'縫線羅網',gravefan:'契扇回剪',icicles:'霜函墜落',cinders:'燼封裂痕'};
export const giantBosses=monsterCatalogue.filter(entry=>entry.elite);
export {monsterCatalogue};
export function visitorFor(stage,seed){
  if(stage.floor<3||stage.boss||stage.objective||((stage.floor-3)%4))return null;
  return monsterCatalogue[((seed>>>0)+Math.floor((stage.floor-3)/4)*37)%monsterCatalogue.length];
}
export function monsterBattle(entry,floor,mode={}){
  const effect=effects[entry.tone]??'void',bag=patterns[entry.family]??patterns.duelist;
  const attacks=[...new Set([...entry.attacks,...bag])].slice(0,4),finishing=finishers[effect];
  if(finishing&&!attacks.includes(finishing))attacks.push(finishing);
  const brute=['turtle','ogre','emperor'].includes(entry.family),quick=['wasp','bird','duelist','spider'].includes(entry.family),ranged=['priest','captain','wasp','star'].includes(entry.family);
  return {name:entry.name,frame:6,bestiary:entry,secondary:true,tint:bestiaryTint(entry),effect,
    form:'第二幕・裂誓之身',signature:attacks.slice(0,3).map(a=>bossMoveNames[a]).join(' · '),
    attacks,finishing,hp:Math.round((285+floor*17)*(mode.hp??1)*(brute?1.13:.96)),height:brute?4.1:quick?3.66:3.9,
    speed:(brute?1.67:quick?2.80:2.29)*Math.sqrt(mode.pace??1),ranged:ranged?4.1:undefined,
    reach:ranged?9.4:6.3,radius:brute?2.75:2.2,time:(quick?.92:1.16)/Math.sqrt(mode.pace??1),
    hurt:(12+floor*.28)*(mode.damage??1),mass:brute?5.3:3.7,phases:entry.elite?[.66,.30]:[.5]};
}
