const site='https://www.52jushang.com/';
const weaponPages={
  'shenshou': 'tiger dragon phoenix turtle qilin airavata',
  'wang': 'flameblade stormbow windhalberd frostlute',
  'chakram': 'chakra wave-wheel kali-wheel',
  'mao': 'reaper sky-halberd red-corporal blue-corporal shiva-trident xuanming vritra-spear',
  'muyu': 'bell dragon-fish lotus-fish',
  'zhua': 'fangs kunoichi-claw',
  'pao': 'cannon',
  'dao': 'sam-in true-seven glacier-sword thunder-sword goumang blood-sword seven-blade',
  'wawa': 'fox-doll snow-doll',
  'gusl': 'thunder-pearl ice-orb fire-orb spark-orb',
  'feibiao': 'han-spear',
  'futou': 'snow-axe blood-axe zhurong-axe',
  'bang': 'sky-dragon-staff treasure-staff emperor-rod',
  'gongjian': 'oni-bow red-bow',
  'kukri': 'moon-kukri dragon-kukri skanda-kukri',
  '3jiang': 'turtle-bow',
  'jipangyi': 'venom-cane yama-cane bat-cane cursed-cane rushou-cane',
  'fozhu': 'earth-beads lotus-beads',
  'qita': 'golden-orb',
  'hufu': 'ice-talisman',
  'she': 'snake',
  'huoqiang': 'western-rifle',
  'shigong': 'sniper-crossbow lion-crossbow',
  'xiong': 'hundun qiongqi taotie taowu',
  'ming': 'nether-box nether-bow nether-sword nether-halberd',
};
const armReference=new Map(Object.entries(weaponPages).flatMap(([page,ids])=>
  ids.split(' ').map(id=>[id,page])));

export function jushangReference(weapon,entry){
  const page=weapon?armReference.get(weapon.id):entry?.source;
  if(!page||page==='story')return null;
  return new URL((weapon?'item/':'monster/')+page+'.asp',site).href;
}
