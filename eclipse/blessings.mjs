const curve = (count,limit) => limit*count/(count+5);

export const blessings = [
  {id:'thorn',mark:'✦',name:'荊棘之力',detail:'提高普通攻擊傷害。'},
  {id:'moon',mark:'☽',name:'銀月印',detail:'縮短神器技能冷卻，增加射程或範圍。'},
  {id:'flower',mark:'❋',name:'白花',detail:'提高最大生命，並立即回復生命。'},
  {id:'step',mark:'»',name:'餘燼步',detail:'縮短翻滾冷卻，落地會灼傷附近敵人。'},
  {id:'star',mark:'✷',name:'流星露',detail:'提高神器傷害，擊倒敵人時回復生命。'},
  {id:'reach',mark:'◈',name:'長夜',detail:'增加普通攻擊距離與第三擊傷害。'},
  {id:'shell',mark:'◇',name:'琥珀甲',detail:'減少承受的傷害。'},
  {id:'wind',mark:'≋',name:'踏風',detail:'提高移動速度與普通攻擊速度。'},
  {id:'spring',mark:'✧',name:'引泉',detail:'即時回復額外生命，並增加之後的通關回復。'},
  {id:'lantern',mark:'☼',name:'續燈',detail:'提高最大生命與神器傷害。'},
];

export function buildStats(hero,weapon,floor,relics) {
  const ranks=new Map();
  for (const relic of relics) ranks.set(relic.id,(ranks.get(relic.id)||0)+1);
  const rank=id=>ranks.get(id)||0;
  const depth=floor-1;
  hero.maxHp=100+Math.floor(depth*.96)+rank('flower')*6+rank('lantern')*3;
  hero.damage=weapon.damage*(1+depth*.018+curve(rank('thorn'),1.33));
  hero.reach=weapon.reach+curve(rank('reach'),1.55);
  hero.finisher=1.46+curve(rank('reach'),.76);
  hero.spellTime=weapon.cooldown*(1-curve(rank('moon'),.44));
  hero.spellRadius=weapon.range+curve(rank('moon'),1.84);
  hero.spellDamage=weapon.power*(1+depth*.022+curve(rank('star')+rank('lantern')*.4,1.55));
  hero.ember=rank('step') ? 16+depth*.21+curve(rank('step'),19) : 0;
  hero.rollTime=.96*(1-curve(rank('step'),.35));
  hero.leech=curve(rank('star'),8.4);
  hero.armor=curve(rank('shell'),.44);
  hero.moveSpeed=5.7*(1+curve(rank('wind'),.28));
  hero.attackPeriod=weapon.period*(1-curve(rank('wind'),.27));
  hero.recovery=curve(rank('spring'),.18);
  return ranks;
}
