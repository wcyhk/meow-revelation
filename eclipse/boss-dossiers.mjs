import {monsterBattle,monsterCatalogue} from './monster-bestiary.mjs?v=ascendant-1';
import {bossArenas} from './arena-layouts.mjs?v=bestiary-1';
import {bossWeaknesses} from './boss-weaknesses.mjs?v=counter-1';
import {enemySpec,stages} from './expedition.mjs?v=world-3d-1';
import {modeStage} from './nightfall.mjs?v=clock-1';

const storyBosses=stages.filter(stage=>stage.boss).map(stage=>({
  id:'floor-'+stage.floor,name:stage.guardian.name,source:'story',floor:stage.floor,
}));
const charges=new Set(['serpent','ogre','rider','beast','emperor','turtle','duelist']);
const terrainByTone={amber:'gold',gold:'gold',ember:'fire',blood:'blood',jade:'wind',moss:'root',
  teal:'water',frost:'ice',bone:'gold',violet:'void',void:'void',venom:'root'};
const line=(x,z,radius,angle)=>({kind:'line',x,z,radius,width:.62,angle});
const pillar=(x,z)=>({x,z,radius:.77});

export const bossDossiers=[...monsterCatalogue,...storyBosses];

export function bossDossier(entry,difficulty){
  if(entry.floor){
    const stage=modeStage(stages[entry.floor-1],difficulty);
    const spec=enemySpec(stage,'boss');
    return {entry,stage,spec,layout:bossArenas.get(entry.floor),weakness:bossWeaknesses[entry.floor]};
  }
  const style=terrainByTone[entry.tone];
  const charge=charges.has(entry.family);
  const weakness=charge?{
    ...bossWeaknesses[5],name:'崩柱破勢',hint:'企喺石柱另一邊引頭目直衝。紅線鎖定後，打橫走或者翻滾避開。',
  }:{
    ...bossWeaknesses[35],name:'裂火反噬',hint:'誘佢劈出火痕，引佢離開裂縫，再繞返對面引佢踩入去。',
  };
  const base=monsterBattle(entry,12,difficulty);
  const spec={...base,secondary:false,attacks:charge||base.attacks.includes('cinders')?base.attacks:[...base.attacks,'cinders']};
  const stage=modeStage({...stages[10],name:'頭目試戰',boss:true,chapter:2,chapterBoss:spec.phases.length>1,
    guardian:null,clue:null,objective:null,hazard:null,props:[],dread:.44,spawn:{x:0,z:5.9}},difficulty);
  const layout={style,weakness,dark:.97,title:'裂地熄燈',hint:weakness.hint,
    pillars:[pillar(-3.4,1.1),pillar(3.4,1.1)],hazards:[line(-4.45,-.3,8,.25),line(5.15,5.3,6,-.66)]};
  return {entry,stage,spec,layout,weakness};
}

export function drillEncounter(dossier){
  if(dossier.entry.floor) return null;
  const {layout}=dossier;
  const pillars=layout.weakness.type==='charge'?[pillar(0,1),pillar(-5.4,3.2)]:[pillar(-7.8,2),pillar(7.8,4.3)];
  const first={...layout,pillars,sites:[]};
  return {first,last:first,lamps:[{x:-6.6,z:4.25},{x:6.6,z:4.25},{x:0,z:-6.1}],aftershock:false};
}
