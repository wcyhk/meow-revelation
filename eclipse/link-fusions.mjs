import {ultimateProgress} from './ultimate-recipes.mjs?v=nightfall-1';

const recipes=[
  {id:'emberbolt',schools:['fire','thunder'],name:'雷引燃痕',mark:'ϟ',ink:'#ffbf83',tint:0xffae70,
    detail:'雷電帶住火痕逐個敵人傳開，每次跳擊都會引爆落點。'},
  {id:'frostlance',schools:['wind','ward'],name:'霜風封陣',mark:'❋',ink:'#c0f8f3',tint:0x9df3ec,
    detail:'接技首擊冰封附近小怪，頭目只會減速。'},
  {id:'firewhirl',schools:['fire','wind'],name:'焰流回旋',mark:'≋',ink:'#ffcd91',tint:0xff986b,
    detail:'先用火旋風將附近敵人扯入落點，再引爆火痕。'},
  {id:'steam',schools:['fire','ward'],name:'裂霜蒸焰',mark:'♨',ink:'#f7c7ae',tint:0xf7bba9,
    detail:'熱霧使敵人易傷；擊中已減速嘅敵人會引爆碎冰。'},
  {id:'rail',schools:['thunder','wind'],name:'踏雷回刃',mark:'✦',ink:'#bcddff',tint:0xa6e6ff,
    detail:'第一次跳雷會先打較遠嘅目標，再用回刃掃過雷路上嘅敵人。'},
  {id:'counter',schools:['thunder','ward'],name:'霜甲回雷',mark:'◈',ink:'#b6f4d9',tint:0x94e9ff,
    detail:'共鳴護甲擋住一擊時，向攻擊者放出反擊雷，再跳到附近敵人。'},
];

const affinities={flameblade:'emberbolt',stormbow:'rail',qilin:'frostlance',turtle:'counter',
  tiger:'firewhirl',phoenix:'steam',dragon:'emberbolt',windhalberd:'firewhirl',frostlute:'steam',chakra:'rail',
  reaper:'firewhirl',bell:'frostlance',fangs:'rail',cannon:'emberbolt'};

export function fusionChoices(weapon,loadout) {
  const preferred=affinities[weapon.id];
  const choices=recipes.flatMap(recipe=>{
    const [a,b]=recipe.schools.map(school=>loadout[school]);
    if (!a||!b) return [];
    const spear=weapon.id==='qilin'&&recipe.id==='frostlance';
    const rank=Math.min(a,b);
    return [{...recipe,rank,sum:a+b,affinity:recipe.id===preferred,
      name:spear?'霜槍封陣':recipe.name,
      detail:spear?'破盾後嘅額外追刺冰封附近小怪，頭目只會減速。':recipe.detail}];
  }).sort((a,b)=>Number(b.affinity)-Number(a.affinity)||b.rank-a.rank||b.sum-a.sum);
  const progress=ultimateProgress(weapon,loadout);
  if (progress?.ready) choices.unshift(progress.rite);
  return choices;
}

export function pickFusion(choices,pin) {
  return choices.find(fusion=>fusion.id===pin)??choices[0]??null;
}
