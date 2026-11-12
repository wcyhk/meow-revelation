const curve = (count,limit) => limit*count/(count+5);

export const blessings = [
  {id:'thorn',school:'fire',mark:'✦',name:'荊棘之力',detail:'提高普通攻擊傷害。'},
  {id:'moon',school:'thunder',mark:'☽',name:'銀月印',detail:'縮短神器技能冷卻，增加射程或範圍。'},
  {id:'flower',school:'ward',mark:'❋',name:'白花',detail:'提高最大生命，並立即回復生命。'},
  {id:'step',school:'wind',mark:'»',name:'疾風步',detail:'縮短翻滾冷卻，落地擊傷附近敵人。'},
  {id:'star',school:'thunder',mark:'✷',name:'流星露',detail:'提高神器傷害，擊倒敵人時回復生命。'},
  {id:'reach',school:'wind',mark:'◈',name:'長夜',detail:'增加普通攻擊距離與第三擊傷害。'},
  {id:'shell',school:'ward',mark:'◇',name:'琥珀甲',detail:'減少承受的傷害。'},
  {id:'wind',school:'wind',mark:'≋',name:'踏風',detail:'提高移動速度與普通攻擊速度。'},
  {id:'spring',school:'ward',mark:'✧',name:'引泉',detail:'即時回復額外生命，並增加之後的通關回復。'},
  {id:'lantern',school:'fire',mark:'☼',name:'續燈',detail:'提高最大生命與神器傷害。'},
  {id:'kindling',school:'fire',mark:'♨',name:'添薪',detail:'提高神器傷害，強化焰印追擊。'},
  {id:'conductor',school:'thunder',mark:'ϟ',name:'引雷紋',detail:'減少神器冷卻，強化自動雷擊。'},
];

export const schools={
  wind:{name:'疾風',mark:'≋',ink:'#dcf1d4',skill:'雙刃追風',detail:'第三次普通攻擊命中時，自動追加兩道貫穿風刃。',cooldown:2.8},
  thunder:{name:'奔雷',mark:'ϟ',ink:'#abdfff',skill:'巡雷',detail:'附近有敵人時，定時自動落雷，跳擊另一個目標。',cooldown:5.2},
  fire:{name:'燼火',mark:'♨',ink:'#ffb288',skill:'焰印',detail:'施放神器技能後，自動在敵人腳下引爆火陣。',cooldown:4.6},
  ward:{name:'霜守',mark:'❋',ink:'#aef1db',skill:'霜衣反震',detail:'受傷時自動披上短暫冰甲，震退並減速附近敵人。',cooldown:7.0},
};

export function schoolProgress(ranks,school) {
  const branch=blessings.filter(boon=>boon.school===school);
  return {
    distinct:branch.filter(boon=>ranks.has(boon.id)).length,
    total:branch.reduce((sum,boon)=>sum+(ranks.get(boon.id)??0),0),
  };
}

export function buildStats(hero,weapon,floor,relics) {
  const ranks=new Map();
  for (const relic of relics) ranks.set(relic.id,(ranks.get(relic.id)||0)+1);
  const rank=id=>ranks.get(id)||0;
  const depth=floor-1;
  hero.maxHp=100+Math.floor(depth*.96)+rank('flower')*6+rank('lantern')*3;
  hero.damage=weapon.damage*(1+depth*.018+curve(rank('thorn'),1.33));
  hero.reach=weapon.reach+curve(rank('reach'),1.55);
  hero.finisher=1.46+curve(rank('reach'),.76);
  hero.spellTime=weapon.cooldown*(1-curve(rank('moon')+rank('conductor')*.52,.44));
  hero.spellRadius=weapon.range+curve(rank('moon'),1.84);
  hero.spellDamage=weapon.power*(1+depth*.022+curve(rank('star')+rank('lantern')*.4+rank('kindling')*.58,1.55));
  hero.ember=rank('step') ? 16+depth*.21+curve(rank('step'),19) : 0;
  hero.rollTime=.96*(1-curve(rank('step'),.35));
  hero.leech=curve(rank('star'),8.4);
  hero.armor=curve(rank('shell'),.44);
  hero.moveSpeed=5.7*(1+curve(rank('wind'),.28));
  hero.attackPeriod=weapon.period*(1-curve(rank('wind'),.27));
  hero.recovery=curve(rank('spring'),.18);
  return ranks;
}
