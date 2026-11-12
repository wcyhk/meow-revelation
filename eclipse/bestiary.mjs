export const enemies = {
  imp: {name:'裂石妖',frame:3,height:1.71,hp:34,speed:3.3,reach:1.65,radius:1.48,time:.58,hurt:10,mass:.70,attacks:['burst','pounce'],effect:'stone',tint:0xffbb82},
  cultist: {name:'提燈祭徒',frame:4,height:2.02,hp:42,speed:2.1,reach:6.5,radius:1.42,time:1.02,hurt:11,mass:.95,attacks:['marked','barrage'],ranged:4.3,effect:'fire',tint:0xffb267},
  knight: {name:'荊甲衛',frame:5,height:2.58,hp:70,speed:2.05,reach:2.75,radius:2.05,time:.85,hurt:16,mass:1.65,attacks:['burst','cleave'],guard:true,effect:'stone',tint:0xd2c099},
  stalker: {name:'赤爪影',frame:18,height:1.82,hp:44,speed:4.0,reach:4.3,radius:1.38,time:.69,hurt:13,mass:.83,attacks:['pounce','cleave'],effect:'blood',tint:0xff7659},
  wisp: {name:'洗名遊魂',frame:19,height:1.89,hp:38,speed:2.96,reach:5.3,radius:1.49,time:.91,hurt:10,mass:.68,attacks:['barrage','gravity'],ranged:3.4,float:.21,effect:'water',tint:0x8df1e0},
  sentinel: {name:'斬印衛',frame:20,height:2.47,hp:77,speed:2.39,reach:5.35,radius:1.9,time:.96,hurt:17,mass:1.78,attacks:['lance','cross'],guard:true,effect:'ice',tint:0x85cfff},
  oracle: {name:'裂月巫',frame:21,height:2.25,hp:59,speed:2.29,reach:6.7,radius:1.6,time:1.09,hurt:15,mass:1.09,attacks:['marked','blink','prison'],ranged:4.15,effect:'void',tint:0xd0a2ff},
  scarab: {name:'冰棘甲蟲',frame:22,height:1.58,hp:54,speed:3.12,reach:4.9,radius:1.24,time:.84,hurt:12,mass:1.15,attacks:['icicles','burst'],effect:'ice',tint:0xb1e9ff},
  salamander: {name:'餘火螈',frame:23,height:1.83,hp:48,speed:3.33,reach:5.1,radius:1.49,time:.82,hurt:14,mass:1.08,attacks:['cinders','pounce'],effect:'fire',tint:0xff9953},
  weaver: {name:'縫墓蛛',frame:24,height:1.69,hp:47,speed:2.75,reach:6,radius:1.63,time:.96,hurt:11,mass:.81,attacks:['web','prison'],ranged:4.05,effect:'web',tint:0xe0abf2},
  drummer: {name:'催糧鼓手',frame:25,height:2.1,hp:49,speed:2.5,reach:4.8,radius:1.66,time:.88,hurt:11,mass:1.16,attacks:['rally','burst'],effect:'gold',tint:0xffd889},
  crane: {name:'紙羽刃鶴',frame:26,height:2.04,hp:40,speed:3.13,reach:7.15,radius:1.47,time:.88,hurt:12,mass:.80,attacks:['feathers','lance'],ranged:4.6,float:.12,effect:'feather',tint:0xf8e0b2},
  spriggan: {name:'菌根童',frame:27,height:2.15,hp:52,speed:2.72,reach:5.6,radius:1.54,time:.97,hurt:13,mass:1.23,attacks:['roots','spiral'],effect:'root',tint:0x88f8bf},
  coin: {name:'銅面秤鬼',frame:28,height:1.95,hp:64,speed:2.5,reach:6.0,radius:1.42,time:.88,hurt:15,mass:1.4,attacks:['coins','cleave'],guard:true,effect:'gold',tint:0xffc565},
  kite: {name:'蝕羽夜魘',frame:29,height:2.12,hp:58,speed:3.26,reach:6.7,radius:1.51,time:.87,hurt:14,mass:.93,attacks:['blink','feathers','gravity'],ranged:4.4,float:.23,effect:'void',tint:0xc3a2ff},
};

export const regionalEnemies = [
  ['imp','cultist','drummer','stalker','knight','crane'],
  ['wisp','crane','cultist','coin','stalker','imp'],
  ['scarab','sentinel','knight','wisp','crane','stalker'],
  ['salamander','drummer','sentinel','stalker','knight','scarab'],
  ['weaver','oracle','wisp','crane','stalker','knight'],
  ['coin','drummer','sentinel','oracle','salamander','knight'],
  ['crane','kite','sentinel','coin','stalker','oracle'],
  ['spriggan','weaver','kite','wisp','drummer','cultist'],
  ['kite','oracle','crane','weaver','sentinel','coin'],
  ['oracle','salamander','coin','spriggan','kite','sentinel'],
];

export const wardens = [
  {name:'糧簿山羊',frame:30,signature:'封道重斬',form:'索名獄角',effect:'gold',tint:0xffcc7e,attacks:['cleave','rally','pounce','coins']},
  {name:'白鱗渡守',frame:31,signature:'斷槳迴潮',form:'沉河露骨',effect:'water',tint:0x80e8d8,attacks:['gravity','ring','lance','cross']},
  {name:'鳴霜角將',frame:32,signature:'霜鐘落棘',form:'冰骨開冠',effect:'ice',tint:0xa5dfff,attacks:['icicles','lance','burst','ring']},
  {name:'鑄火螈將',frame:33,signature:'流炭裂地',form:'裂爐暴骨',effect:'fire',tint:0xff9152,attacks:['cinders','cleave','burst','sweep']},
  {name:'紙墓送靈者',frame:34,signature:'引魂飛頁',form:'送葬骨翅',effect:'feather',tint:0xead5ff,attacks:['feathers','blink','web','prison']},
  {name:'庫門重鎧',frame:35,signature:'回旋刀錢',form:'熔金長齒',effect:'gold',tint:0xffd36e,attacks:['coins','lance','pounce','rally']},
  {name:'銅晷刃衛',frame:36,signature:'斬時三線',form:'晷針穿影',effect:'blood',tint:0xff9b63,attacks:['lance','cleave','blink','sweep']},
  {name:'青根蜿龍',frame:37,signature:'群根合圍',form:'蠕根寄生',effect:'root',tint:0xa1f0a7,attacks:['roots','gravity','spiral','pounce']},
  {name:'碎彩窗守門者',frame:38,signature:'碎彩飛翎',form:'殘窗鬼翼',effect:'void',tint:0xd3b4ff,attacks:['feathers','cross','icicles','eclipse']},
  {name:'緋刃行刑官',frame:39,signature:'緋刃三刑',form:'血刃無面',effect:'blood',tint:0xff7959,attacks:['cleave','blink','lance','cinders','cross']},
];

export const chapterAttacks = [
  {effect:'feather',form:'赤羽吞月',attacks:['feathers','pounce','marked','cross']},
  {effect:'water',form:'溺骨出水',attacks:['ring','gravity','barrage','cross']},
  {effect:'ice',form:'鐘聲無面',attacks:['icicles','cross','lance','ring']},
  {effect:'fire',form:'熔骨火魔',attacks:['cinders','sweep','burst','summon']},
  {effect:'web',form:'白面千絲',attacks:['web','prison','summon','spiral']},
  {effect:'gold',form:'空甲噬骨',attacks:['coins','ring','summon','sweep']},
  {effect:'blood',form:'吞日空殼',attacks:['pounce','lance','gravity','eclipse']},
  {effect:'root',form:'枯骨蔓生',attacks:['roots','spiral','gravity','summon']},
  {effect:'void',form:'百眼展翼',attacks:['eclipse','blink','feathers','prison']},
  {effect:'blood',form:'血冠裂面',attacks:['eclipse','cleave','spiral','summon','sweep','lance']},
];
