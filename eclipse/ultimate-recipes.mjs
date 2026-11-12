export const ultimateRank=3;

const flare=['fire','thunder','wind'];
const forge=['fire','thunder','ward'];
const ash=['fire','wind','ward'];
const storm=['thunder','wind','ward'];

function rite(weapon,schools,name,mark,tint,accent,skin,detail) {
  return {id:'ultimate-'+weapon,weapon,schools,name,mark,tint,accent,skin,detail,ultimate:true,rank:ultimateRank,
    ink:'#'+accent.toString(16).padStart(6,'0')};
}

export const ultimateRites={
  flameblade:rite('flameblade',flare,'雷火逐魂','ϟ',0xff591e,0xffd498,0,'重劈嘅火痕化成雷火龍捲，追住敵人轉向；到時限就引爆風眼。'),
  tiger:rite('tiger',ash,'白虎踏焰','✦',0xffb376,0xffe8bf,1,'白虎殘影逐個敵人踏斬，最後回到第一個落點，交叉斬開火路。'),
  dragon:rite('dragon',forge,'蒼龍雷獄','ϟ',0x587afa,0xbdd8ff,2,'三座雷柱結成三角雷獄，電弧沿三邊游走，再向中心合擊。'),
  phoenix:rite('phoenix',ash,'不死朱雀','❂',0xf64f55,0xffbc88,3,'雙翼火浪橫掠，再飛回你身邊。回程命中會回復生命。'),
  turtle:rite('turtle',storm,'玄武天甲','◇',0x4bd5c1,0xd0ffed,4,'披上冰甲，寒潮會跟住你移動，最後裂開並冰封附近小怪。'),
  qilin:rite('qilin',storm,'麒麟碎岳','◈',0xf6ac41,0xffe7b1,5,'三道神槍從唔同方向貫入落點，最後一槍會撕開護盾。'),
  stormbow:rite('stormbow',flare,'九霄星矢','✷',0x519fff,0xdcf5ff,6,'滿弦接技會射出三道分岔雷箭，箭路盡頭落下星雷。'),
  windhalberd:rite('windhalberd',flare,'風龍回天','≋',0x8bdf83,0xd9ffb1,7,'第一道風龍橫掠聚敵，第二道由交叉方向衝返嚟，將敵人震開。'),
  frostlute:rite('frostlute',ash,'冰弦絕響','❋',0x5cd5ff,0xc5faff,8,'三層冰音從落點擴散，最後一下擊碎冰層，凍結範圍內小怪。'),
  chakra:rite('chakra',forge,'天輪日蝕','◎',0xe78745,0xffe9a9,9,'雙輪一正一反繞住戰場切割，收返中心時引爆日蝕。'),
};

export function ultimateProgress(weapon,loadout) {
  const rite=ultimateRites[weapon.id];
  if (!rite) return null;
  const ranks=rite.schools.map(school=>loadout[school]??0);
  return {rite,ranks,known:ranks.filter(rank=>rank>0).length>=2,
    ready:ranks.every(rank=>rank>=ultimateRank)};
}
