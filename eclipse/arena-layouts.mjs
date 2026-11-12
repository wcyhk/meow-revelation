const fissure = (x,z,length,width,angle=0) => ({kind:'line',x,z,radius:length,width,angle});
const pool = (x,z,radius) => ({kind:'circle',x,z,radius});
const pillar = (x,z,radius=.76) => ({x,z,radius});
const site = (x,z,symbol) => ({x,z,symbol});

const terrain = {
  gold:{ink:0xf7b05d,stone:0x633822,shade:.28,damage:8},
  wind:{ink:0xf8ab86,stone:0x743d41,shade:.35,damage:9},
  water:{ink:0x78e9e4,stone:0x154552,shade:.35,slow:true},
  ice:{ink:0xa8e9ff,stone:0x294f69,shade:.32,slow:true,damage:8},
  fire:{ink:0xff8051,stone:0x682e27,shade:.41,damage:15},
  web:{ink:0xd6a9ed,stone:0x4e2b54,shade:.51,slow:true},
  blood:{ink:0xff6d72,stone:0x6a283d,shade:.52,damage:14},
  root:{ink:0x87ed9f,stone:0x254c3e,shade:.56,slow:true,damage:10},
  void:{ink:0xd2adff,stone:0x4e315e,shade:.72,damage:16},
};

const arenas = [
  {floor:5,title:'庭磚崩裂',style:'gold',hint:'沿裂縫兩端走，或翻滾越過裂地。',hazards:[fissure(0,2,11,.46)]},
  {floor:10,title:'羽風拔柱',style:'wind',hint:'用升起的石柱擋住飛羽，從側面接近。',pillars:[pillar(-3.5,1),pillar(3.5,1)],hazards:[fissure(0,-1,6,.44,Math.PI/2)]},
  {floor:15,title:'沉船漲潮',style:'water',hint:'積水會拖慢腳步，從中央乾地接近。',hazards:[pool(-5,2,3.1),pool(5,2,3.1)]},
  {floor:20,title:'水葬斷堤',style:'water',hint:'潮水淹沒中央，走兩側高地。',hazards:[pool(0,2,3.4),pool(-5.7,-3,1.9),pool(5.7,-3,1.9)]},
  {floor:25,title:'霜棘穿磚',style:'ice',hint:'霜棘會傷人並拖慢腳步，走冰帶之間。',hazards:[fissure(-3.1,2.7,10,.63,1.23),fissure(3.1,2.7,10,.63,-1.23)]},
  {floor:30,title:'鐘樓塌環',style:'ice',hint:'由外圈繞過冰穴，利用鐘座擋住飛矢。',hazards:[pool(0,.6,2.85)],pillars:[pillar(-5.1,1.6),pillar(5.1,1.6)]},
  {floor:35,title:'爐腹開口',style:'fire',hint:'熔火切開橫路，南北兩道缺口錯開。',hazards:[fissure(-3,.2,10,.67),fissure(3,5.4,10,.67)]},
  {floor:40,title:'熔井反湧',style:'fire',hint:'三處熔井封住直路，從井與井之間穿過。',hazards:[pool(-5.2,1,2.55),pool(5.2,1,2.55),pool(0,5.5,2.28)]},
  {floor:45,title:'墓道熄燈',style:'web',hint:'燈火熄滅。避開黏足的蛛絲，貼墓柱走。',dark:1,hazards:[fissure(0,2,12,.83,.36)],pillars:[pillar(-5,-.4),pillar(4.8,4.8)]},
  {floor:50,title:'骨繭墜地',style:'web',hint:'繭影會黏住腳步，沿中央空隙走。',dark:.82,hazards:[pool(-4.6,-.5,2.8),pool(4.6,-.5,2.8),pool(-4.6,5.6,2.1),pool(4.6,5.6,2.1)]},
  {floor:55,title:'金庫沉閘',style:'gold',hint:'靠近並攻擊兩座鎖柱，打斷金甲護盾。',mode:'break',
    sites:[site(-4,3.3,'Ⅰ'),site(4,3.3,'Ⅱ')],hazards:[fissure(0,4.3,7.5,.49,Math.PI/2)],pillars:[pillar(-6.7,-.1),pillar(6.7,-.1)]},
  {floor:60,title:'銅燈盡滅',style:'gold',hint:'逐盞重燃三座祭燈，照出金黿的弱點。',mode:'light',dark:.95,
    sites:[site(-5.4,3.2,'火'),site(0,6,'火'),site(5.4,3.2,'火')],hazards:[pool(0,.1,2.45),fissure(0,8.5,8,.45)]},
  {floor:65,title:'晷盤碎時',style:'blood',hint:'依 Ⅰ、Ⅱ、Ⅲ 次序啟動石印，截斷咒術。',mode:'order',dark:.43,
    sites:[site(4.9,4.4,'Ⅰ'),site(-4.9,4.4,'Ⅱ'),site(0,-3.9,'Ⅲ')],hazards:[fissure(-3,-.3,8,.58),fissure(3,1.8,8,.58)]},
  {floor:70,title:'蝕日反照',style:'blood',hint:'站到銅鏡引牠落斬，見紅圈就閃開。',mode:'bait',dark:.78,cast:'蝕日墜擊',
    sites:[site(-3.8,3.2,'鏡'),site(3.8,3.2,'鏡')],hazards:[fissure(0,4.8,7,.55,Math.PI/2)]},
  {floor:75,title:'活根鎖徑',style:'root',hint:'走進兩道綠色淨印，留在印內直至充滿。',mode:'hold',dark:.65,hold:1.4,
    sites:[site(-4.5,4.6,'印'),site(4.5,.1,'印')],hazards:[fissure(0,2.8,10,.67,1.25),pool(-4.9,-.6,2)]},
  {floor:80,title:'巨菌汲魂',style:'root',hint:'打碎三座寄生菌核，阻止頭目汲取力量。',mode:'break',dark:.74,
    sites:[site(0,5.7,'核'),site(-5,-.4,'核'),site(5,-.4,'核')],hazards:[pool(-4.1,4.9,2.5),pool(4.1,4.9,2.5)]},
  {floor:85,title:'彩窗黯滅',style:'void',hint:'沿兩側裂窗重燃祭燈，驅散守門者的護影。',mode:'light',dark:1,
    sites:[site(-5.1,1.9,'火'),site(5.1,1.9,'火')],hazards:[fissure(0,2.7,12,.65,Math.PI/2)],pillars:[pillar(-6,5.7),pillar(6,5.7)]},
  {floor:90,title:'百眼窺月',style:'void',hint:'踏進月印並留到充滿，熄滅蛾冠兩側的眼。',mode:'hold',dark:1,hold:1.8,
    sites:[site(-4.9,2,'眼'),site(4.9,2,'眼')],hazards:[pool(0,2,2.6),pool(-4.8,6.8,1.8),pool(4.8,6.8,1.8)]},
  {floor:95,title:'血刑落碑',style:'blood',hint:'引行刑官擊碎兩座刑碑。紅圈鎖定後立刻翻滾。',mode:'bait',dark:.8,cast:'斷首落碑',
    sites:[site(-4.5,.4,'碑'),site(4.5,5.4,'碑')],hazards:[fissure(0,2.7,12,.66,-.45)],pillars:[pillar(-6.7,5.9),pillar(6.7,-.5)]},
  {floor:100,title:'血月斷王座',style:'blood',hint:'依 Ⅰ、Ⅱ、Ⅲ 次序解開王座血印。',mode:'order',dark:.9,
    sites:[site(-5,4.7,'Ⅰ'),site(5,4.7,'Ⅱ'),site(0,-4.6,'Ⅲ')],hazards:[fissure(-4,1.6,7.2,.62),fissure(4,1.6,7.2,.62),pool(0,4,1.85)],
    last:{title:'黑月吞殿',style:'void',hint:'王座塌陷。踏進最後兩道命印並留到充滿。',mode:'hold',dark:1,hold:1.65,
      sites:[site(-4.7,2.7,'命'),site(4.7,2.7,'命')],hazards:[fissure(0,3,13,.73,Math.PI/2),pool(-5.6,-3.4,2.15),pool(5.6,-3.4,2.15)]}},
];

export const bossArenas = new Map(arenas.map(arena=>[arena.floor,arena]));
export const arenaTerrain = style => terrain[style];
