// Reference: 52 巨商's 高級武器, 神獸武器, 凶獸武器 and 冥王 weapon lists.
// Each row describes an independently equippable weapon and its guardian.
const catalogue = `
sam-in|三寅劍|銀河水|sword|light|rain|5 2.1 .35|星雨織河|星曆監正|落星試劍，交還三寅劍！|prison cross|echo|星雨會令命中嘅敵人短暫硬直
true-seven|真七支刀|七枝地刺|seven|earth|spikes|7 1.25 .13|根脈開刃|七枝石王|七枝只認我，還刀！|roots lance|stun|地刺會短暫定住敵人
fox-doll|狐仙的娃娃|狐仙憑依・爆雷|doll|lightning|morph|12 3.1 .11|十二尾雷契|白面狐仙|邊個敢用我嘅身體？還返個娃娃！|blink spiral|chain|狐雷命中後會再跳電
thunder-pearl|雷電珠|三珠光彈|orb|lightning|rain|3 2.45 .28|拘雷銅環|三珠刑官|雷珠係我嘅刑具！|marked cross|chill|落珠會減速
snow-doll|冰雪神娃娃|暗黑火焰暴風|doll|void|storm|5 2.85 .27|霜心黑火|熄冬雪神|還返我嘅雪身，我要凍熄你盞燈！|cinders eclipse|pull|黑火風暴會吸入敵人
han-spear|漢式之槍|飛刀術|spear|earth|rain|7 1.42 .14|萬槍密陣|漢營槍督|我軍令在此，還槍！|barrage lance|wide|投槍落點嘅波及範圍增大
kunoichi-claw|女忍者的爪刀|活力|claw|blood|buff|3 1.75 .18|無息疾步|緋幕女忍|嗰對爪刀，係我上次留喺你背脊嘅！|blink pounce|haste|活力持續時間增加
sky-halberd|方天火戟|飛戟墜陣|halberd|fire|rain|4 1.94 .23|餘燼飛戟|墜星戟將|望上面！我嚟取戟！|cinders cleave|burn|落戟會留下兩次餘焰
glacier-sword|寒冰劍|冰爆|sword|ice|spikes|5 1.72 .16|寒脈分枝|冰柱劍君|呢度每條冰柱都係我柄劍嘅一截！|icicles cross|echo|末段冰柱碎裂後會再爆
snow-axe|冰雪神斧頭|雙斧滾雪|axe|ice|return|2 .90 .29|雪輪返刃|白山伐神|一把斧都拎唔穩，你仲想拎兩把？|lance icicles|chill|回程斧刃延長減速
sky-dragon-staff|天龍棍|天龍格擋|staff|light|guard|2 2.65 .25|龍鱗護手|盤棍龍僧|企穩，先擋得住我一棍！|burst cleave|riposte|擋擊時嘅反震更強
treasure-staff|天王寶心棍|寶心格擋|staff|earth|guard|3 2.12 .16|金心藏勁|寶塔戒律使|寶心離塔，天下唔會太平！|toll ring|guard|格擋持續時間增加
red-corporal|赤軍曹之槍|赤軍八寒雨|spear|ice|rain|6 1.72 .19|赤營碎甲|赤旗軍曹|赤營唔會退！還返支槍！|icicles barrage|expose|冰雨削弱敵人防禦
blue-corporal|藍軍曹之槍|藍軍八寒雨|spear|ice|storm|8 2.12 .18|藍營長冬|藍旗軍曹|藍營未收兵，邊個畀你帶走軍槍？|ring icicles|chill|冰雨令敵人減速更耐
blood-axe|血斧|旋轉血斧|axe|blood|return|3 1.20 .21|血輪回飲|赤首劊子手|柄斧飲開我嘅血，你喂唔飽佢！|cleave jaws|drain|回刃命中會回血
wave-wheel|波輪|波輪電擊鉤|ring|lightning|ring|3 3.75 .27|離心電弧|逆輪匠|個輪返嚟喇，你企咗喺佢條路上！|ring coins|pull|外圈會扯敵人入內圈
thunder-sword|雷劍|雲雷|sword|lightning|rain|5 1.82 .17|雲罅放電|截雲劍師|我借你見識吓，乜嘢叫成片天落雷！|cross marked|chain|雲雷會從落點跳去附近敵人
oni-bow|獨角鬼弓|召喚獨角鬼|bow|void|minion|4 1.58 .46|獨角血食|斷角鬼王|嗰張弓入面困住我個仔！|summon pounce|drain|鬼角擊中敵人時回復生命
moon-kukri|月牙庫爾喀彎刀|月牙劍輪|curve|light|storm|5 2.15 .22|月牙留軌|彎月行者|見唔見到呢道月牙？佢跟緊你！|sweep eclipse|wide|月輪擴大
dragon-kukri|龍頭庫爾喀彎刀|龍首劍輪|curve|fire|storm|4 2.48 .26|龍頭吞焰|赤面龍刀客|放開龍頭，佢唔係用嚟斬柴嘅！|cleave cinders|burn|龍輪經過嘅位置會再燒
kali-wheel|卡里的輪刃|雙電擊輪|ring|lightning|beam|2 .83 .19|雙輪交界|黑壇卡里|兩個輪都落地嗰陣，你就走唔到！|cross coins|echo|雙輪交會會再炸一次
turtle-bow|忠武公弓箭|召喚龜甲車|bow|earth|minion|5 1.83 .43|鐵龜撞陣|龜甲水師都督|開炮！嗰張弓係水師嘅！|barrage burst|stun|龜甲車會撞暈敵人
venom-cane|邪毒拐杖|邪毒黑暴|cane|poison|storm|5 2.23 .29|留毒潮|邪毒療師|行前一步，就試到我支杖嘅毒。|web gravity|burn|黑暴散去後毒液仲會傷人
yama-cane|雅瑪的拐杖|雅瑪暗黑暴風|cane|void|storm|6 2.20 .24|判風倒卷|雅瑪判官|支杖記住你個名，我都記住咗。|gravity toll|pull|判風將敵人拉向中心
bat-cane|蝙蝠拐杖|蝠群暗風|cane|blood|storm|7 1.81 .18|嗜血回巢|倒吊蝠侯|我嘅蝠群聞到你手上有我支杖！|feathers gravefan|drain|蝠群每次命中都吸少量生命
skanda-kukri|斯堪達的庫爾喀彎刀|毒旋風|curve|poison|storm|8 1.94 .20|八重毒眼|青毒戰神|入得旋風，就將彎刀留低。|spiral roots|expose|毒旋風令敵人易傷
ice-orb|冰珠|霜珠震光|orb|ice|beam|4 1.42 .19|凝霜珠心|白髮霜珠師|捧住粒珠，凍唔凍手？|icicles lance|chill|冰光加長減速
fire-orb|火焰珠|焰珠震光|orb|fire|beam|4 1.52 .21|二燃珠心|燼腹火珠師|燒埋你隻手，粒珠就返嚟。|cinders cross|burn|火光在落點留焰
spark-orb|雷珠|雷珠震光|orb|lightning|beam|4 1.08 .14|走電珠心|鳴骨珠師|劈中你嗰下，粒珠就知道邊個係主人。|cross barrage|chain|雷光可連到旁邊敵人
earth-beads|地神念珠|地珠震光|beads|earth|beam|4 1.74 .24|地母沉印|地壇掌珠者|念完地契先好郁，否則地底見。|roots prison|stun|震光會定住地面敵人
lotus-beads|白蓮念珠|白蓮震光|beads|light|beam|4 1.62 .20|白蓮餘照|白蓮藏經僧|每粒念珠有一個名，你嘅都喺度。|marked ring|echo|末段蓮光再照一次
shiva-trident|濕婆的三叉矛|雷電激流|trident|lightning|beam|3 1.17 .19|三叉餘電|三叉舞主|用三叉矛企得咁近，你係想同我共舞？|lance cross|stun|電流會眩暈
dragon-fish|黃龍木魚|黃龍石塔|bell|earth|rain|3 2.20 .34|龍塔鎮地|黃龍塔僧|第三聲木魚響，你就埋喺塔下面。|toll roots|stun|石塔撞擊會暈住敵人
lotus-fish|白蓮木魚|白蓮石塔|bell|light|rain|3 2.55 .30|蓮塔回聲|白蓮塔主|聽到三聲，就將木魚還我。|toll ring|echo|最後一座石塔會碎裂再震
goumang|句芒刀|大地之手|curve|earth|spikes|5 2.27 .18|裂壤掌紋|春神句芒|泥土識我，你踩住嗰塊都係。|roots gravefan|stun|地手會按住敵人
xuanming|玄冥槍|冷氣暴風|spear|ice|storm|7 2.34 .21|玄冥冰結|玄冥冰將|槍尖嘅霜係我嘅呼吸，還我！|icicles sweep|chill|暴風同普攻第三擊都可長時間減速
red-bow|赤弓|爆炸火箭|bow|fire|volley|5 1.15 .15|赤羽爆芯|赤羽火弓手|數到五，你腳邊啲箭會一齊爆。|barrage cinders|wide|火箭嘅爆風擴大
blood-sword|血劍|血爆|sword|blood|drain|1 4.12 .20|一劍飲紅|血池劍鬼|你嘅血會養返我柄劍！|jaws eclipse|drain|血爆每次命中回復更多生命
cursed-cane|被詛咒的拐杖|暗黑旋風|cane|void|storm|5 2.67 .23|黑鏈勒心|鎖杖咒師|聽到鐵鏈聲未？你已經畀佢綁住。|gravity prison|pull|黑鏈會扯敵人去高傷害中心
golden-orb|黃金祝福之玉|神聖彈|orb|light|volley|3 1.60 .21|金玉分光|金玉審判使|你只係代我捧住粒玉，夠鐘還喇。|marked barrage|echo|最後一發分裂為第二次爆炸
ice-talisman|如意陀羅尼符|冰釋術・冰牆|talisman|ice|wall|5 1.18 .16|霜牆重疊|雪符結界師|邊個准你將我張符揭落嚟？|prison icicles|guard|冰牆存在更耐
rushou-cane|蓐收的拐杖|三重颶風|cane|wind|storm|3 2.18 .19|三風聚首|秋神蓐收|三道風到齊嗰陣，將支杖放低。|spiral sweep|echo|旋風消散時會再捲起一次
zhurong-axe|祝融斧|召喚毒蛇・火龍波|axe|fire|minion|3 2.40 .48|祝融三焰|南火祝融|火蛇返嚟，咬住個拎斧嘅！|cinders summon|burn|火蛇離場會引爆最後落點
vritra-spear|弗栗多之槍矛|落雷矛磁場|trident|lightning|rain|4 2.65 .32|四矛磁暴|旱雷弗栗多|每支矛都釘住一片天，還返畀我！|cross icicles|pull|磁場吸入外圍敵人
snake|飼養的蛇|召喚蛇群|snake|poison|minion|7 1.30 .24|蛇群蛻皮|蛇窟育主|喊咩？嗰啲蛇先認得我把聲。|roots web|expose|蛇毒加深後續傷害
emperor-rod|天皇棒|影子移動|staff|void|blink|2 1.95 .22|御影返身|無影天皇|你走得過啲影，走唔過我。|blink eclipse|echo|原地殘影會再爆一次
western-rifle|西洋槍手的狙擊槍|召喚西洋槍手|gun|void|minion|4 1.13 .43|亡槍點名|西洋無頭槍手|咪郁，我想睇清楚你手上支槍。|barrage lance|expose|鬼魂彈加強易傷標記
seven-blade|七支刀|山崩|seven|earth|rain|6 1.86 .20|崩山地脈|崩山刀靈|我把刀倒轉，你成間房都會冧。|roots toll|stun|崩石震暈敵人
sniper-crossbow|狙擊手石弓|鬼魂彈・伏擊|crossbow|void|volley|2 1.14 .30|瞄魂缺口|伏牆狙擊手|我喺度等咗好耐，你拎咗我張弓。|lance blink|expose|鬼魂彈令目標易傷更耐
lion-crossbow|獅子石弓|鬼魂彈・獅吼|crossbow|earth|volley|3 1.70 .26|獅咬迴響|斷鬃弩將|你會先聽到獅吼，先至見到我。|barrage jaws|stun|獅吼震暈附近敵人
airavata|埃拉瓦塔的象牙|象牙波動|horn|earth|wave|3 1.76 .21|白象踏地|埃拉瓦塔|邊個喺我瞓着嗰陣攞走我隻牙？|pounce toll|wide|波動加寬同延伸
hundun|混沌的刺|混沌狂氣|claw|earth|morph|5 1.65 .16|無面狂心|無面混沌|嗰條刺上面，仲有我嘅心跳！|pounce spiral|haste|狂氣時移動更快
qiongqi|窮奇的羽毛|窮奇狡猾|feather|wind|volley|6 .88 .10|逆羽追獵|逆翅窮奇|我少咗條羽毛，但仲飛得快過你！|feathers blink|expose|逆羽標記令敵人易傷
taotie|饕餮的角|饕餮破壞|horn|fire|drain|3 2.70 .24|饕口吞焰|饕餮火顎|交返隻角，我可以先食第二個。|jaws cinders|burn|火顎撕裂後點燃地面
taowu|檮杌的獠牙|檮杌韌勁|fang|ice|guard|3 2.37 .21|寒獠不折|不折檮杌|你以為拔走我隻牙，我就咬唔到？|pounce icicles|riposte|擋擊時冰牙反震更強
nether-box|冥王匣|冥界的加護|box|ice|guard|4 2.62 .27|夜叉鎖匣|金剛夜叉冥王|冥匣一開，先收你盞燈。|prison gravity|chill|加護波會凍住附近敵人
nether-bow|冥王弓|冥界的雷鳴|bow|lightning|chain|5 2.72 .14|雷鳴天束|軍茶利冥王|今日冥雷要追返佢張弓！|cross barrage|chain|冥雷可再跳多兩個目標
nether-sword|冥王劍|冥界的保護膜|sword|fire|guard|3 2.73 .30|天開火衣|降三世冥王|我件火衣著喺你身上，燒得盡未？|cinders cleave|burn|火膜震波會引燃敵人
nether-halberd|冥王戟|冥界颶風|halberd|wind|storm|6 2.62 .22|大威德逆流|大威德冥王|我要你親手用陣風送返支戟！|sweep gravity|pull|逆流將周圍敵人扯返入風眼
`;

export const elements={
  light:{tone:0xf4d38a,ink:'#ffe4ab',effect:'light',school:'ward'},
  lightning:{tone:0x86d7ff,ink:'#c2eeff',effect:'lightning',school:'thunder'},
  earth:{tone:0xd6a076,ink:'#efc9a4',effect:'stone',school:'ward'},
  ice:{tone:0x91eadf,ink:'#c1fff5',effect:'ice',school:'ward'},
  void:{tone:0xb795f1,ink:'#e4c6ff',effect:'void',school:'thunder'},
  fire:{tone:0xff7956,ink:'#ffb997',effect:'fire',school:'fire'},
  blood:{tone:0xf56e88,ink:'#ffafc3',effect:'blood',school:'fire'},
  poison:{tone:0xa9d76e,ink:'#e1f3a2',effect:'root',school:'fire'},
  wind:{tone:0xa3e7b5,ink:'#ccfbe1',effect:'wind',school:'wind'},
};

const forms={
  sword:['弧斬','近戰',27,2.92,.33,'flameblade'],seven:['分枝斬','中距',24,4.4,.39,'phoenix'],
  doll:['符光','中距',19,4.45,.34,'dragon'],orb:['珠光','遠程',20,5.55,.35,'dragon'],
  spear:['槍刺','中距',27,3.37,.38,'qilin'],claw:['爪斬','近戰',19,2.37,.25,'fangs'],
  halberd:['挑戟','中距',25,3.35,.36,'windhalberd'],axe:['甩斧','近戰',29,2.75,.42,'flameblade'],
  staff:['橫棍','近戰',25,2.94,.35,'windhalberd'],ring:['拋輪','中距',20,5.4,.36,'chakra'],
  bow:['射箭','遠程',18,6.85,.34,'stormbow'],curve:['弧刃','近戰',25,2.82,.30,'tiger'],
  cane:['咒波','中距',20,5.15,.38,'bell'],beads:['念珠','中距',20,5.30,.36,'bell'],
  trident:['叉刺','中距',27,3.48,.40,'qilin'],bell:['敲響','中距',21,5.25,.37,'bell'],
  talisman:['紙符','中距',20,4.95,.32,'phoenix'],snake:['蛇咬','中距',21,3.80,.29,'qilin'],
  gun:['鬼彈','遠程',23,6.95,.39,'cannon'],crossbow:['弩箭','遠程',23,6.55,.37,'stormbow'],
  horn:['角擊','近戰',28,3.03,.39,'turtle'],feather:['羽刃','中距',20,5.35,.31,'chakra'],
  fang:['獠牙斬','近戰',28,2.68,.34,'turtle'],box:['匣光','中距',23,4.86,.38,'bell'],
};

const skillLooks={
  'sam-in':'stars','han-spear':'fallen-arm','sky-halberd':'fallen-arm','vritra-spear':'fallen-arm',
  'thunder-pearl':'thunder-orbs','thunder-sword':'thunderfall','seven-blade':'boulder',
  'dragon-fish':'pagoda','lotus-fish':'pagoda',goumang:'hand',
  'ice-orb':'overhead','fire-orb':'overhead','spark-orb':'overhead','earth-beads':'overhead','lotus-beads':'overhead',
  'kali-wheel':'electric-wheel','moon-kukri':'blade-wheel','dragon-kukri':'blade-wheel',
  'blue-corporal':'snowfall','rushou-cane':'three-vortices',
};

const skillDetails={
  'sam-in':'五枚星光喺目標附近墜落，落地爆開。',
  'true-seven':'七段石刺沿面向依次破土。',
  'fox-doll':'狐面附身，移動時接連喺身邊引發十二道雷爆，並短暫加快移動。',
  'thunder-pearl':'三粒雷珠先後墜地，落點附近敵人受傷同減速。',
  'snow-doll':'目標位置捲起暗色火焰，短時間連續灼傷敵人。',
  'han-spear':'七支飛槍先後落喺目標附近，刺中落點附近敵人。',
  'sky-halberd':'四支帶火嘅長戟墜地，擊中落點附近敵人。',
  'glacier-sword':'五段冰柱沿面向破地而出，碎裂時減慢敵人。',
  'snow-axe':'兩把冰斧旋向前方再飛返起點，來回都可傷敵同減速。',
  'red-corporal':'目標附近落下六陣冰雨，命中會減速。',
  'blue-corporal':'目標位置維持八陣落冰，敵人每次中冰都會減速。',
  'blood-axe':'投出三道血斧，來回都可斬中敵人。',
  'wave-wheel':'三道電環由外向內收縮，敵人觸到電環時受傷。',
  'thunder-sword':'目標附近接連落下五道天雷。',
  'oni-bow':'召來獨角鬼追咬四次，命中時回復少量生命。',
  'moon-kukri':'留下一道迴轉月刃，連續斬傷附近敵人。',
  'dragon-kukri':'留下一道燃燒龍首刃，連續斬傷附近敵人。',
  'kali-wheel':'向前擲出兩道電擊輪，電輪一路傷及路上敵人。',
  'turtle-bow':'召來龜甲車追撞附近敵人，再以旋轉攻擊震退敵人。',
  'venom-cane':'在目標附近留下毒霧風暴，敵人被毒中後會更易受傷。',
  'yama-cane':'喺目標位置掀起黑紫風暴，持續侵蝕入面嘅敵人。',
  'bat-cane':'喚出蝠群暗風，喺目標附近反覆掠過敵人。',
  'skanda-kukri':'捲起毒旋風，連續八次傷害並令敵人易傷。',
  'ice-orb':'四枚霜珠從上方射落寒光，照中嘅敵人會減速。',
  'fire-orb':'四枚焰珠從上方射落灼光，燒傷光柱下嘅敵人。',
  'spark-orb':'四枚雷珠從上方射落電光。',
  'earth-beads':'四枚地珠喺目標上方依次落光，照中敵人會受傷。',
  'lotus-beads':'四枚白蓮珠依次從上方照落蓮光，傷及落點附近敵人。',
  'shiva-trident':'向前放出三道電流，非頭目敵人被電中會短暫硬直。',
  'dragon-fish':'三座黃龍石塔墜地，震暈落點附近嘅敵人。',
  'lotus-fish':'三座白蓮石塔墜地，震暈落點附近嘅敵人。',
  goumang:'向前喚起五隻破土巨手，擊中時震暈非頭目敵人。',
  xuanming:'喺目標附近捲起冷氣風暴，連續凍傷同減速。',
  'red-bow':'從弓弦連射五支火箭，逐支喺落點爆炸。',
  'blood-sword':'放出一次近範圍血爆，命中敵人時回復生命。',
  'cursed-cane':'喺目標附近留下暗黑旋風，持續傷害入面嘅敵人。',
  'golden-orb':'連發三枚聖光彈，落地時擴散。',
  'rushou-cane':'喺目標附近掀起三道分開嘅颶風，每道持續旋轉並傷害附近敵人。',
  'zhurong-axe':'召出火蛇，由蛇口連吐三道直線火龍波。',
  'vritra-spear':'四把雷矛先後墜地，落點會產生短暫電磁場。',
  snake:'放出三條毒蛇連環撲咬，命中會令敵人易傷。',
  'western-rifle':'喚出一名持槍嘅西洋鬼魂，瞄準附近敵人逐發開火。鬼彈命中會令目標易傷。',
  'seven-blade':'六波崩石喺目標附近墜下，震暈非頭目敵人。',
  'sniper-crossbow':'從石弓射出兩發鬼魂彈，落點附近敵人會易傷。',
  'lion-crossbow':'從石弓射出三發鬼魂彈，落點爆出震波並令敵人易傷。',
  airavata:'朝面向打出三段逐漸擴闊嘅象牙震波。',
  hundun:'短暫進入狂氣狀態，加快移動並釋出五次近身衝擊。',
  qiongqi:'向目標附近連發六枚追獵羽刃。',
  'nether-box':'展開短暫護甲，發出四道減速衝擊，被打中時可反震。',
  'nether-halberd':'在目標附近留低持續六次傷害嘅冥界颶風。',
};

const descriptions={
  rain:'喺目標附近連續落下攻擊',spikes:'沿前方逐段爆開',morph:'爆發一圈攻擊並短暫強化行動',
  buff:'放出近身衝擊，短暫加快移動同普攻',return:'投出迴旋武器，去程同回程都可命中',
  guard:'披上短暫護甲，震擊附近敵人，受擊時觸發反震',ring:'由外向內收縮嘅傷害環',
  storm:'留低一股持續傷害嘅風暴',minion:'喚出短暫盟友，持續追擊敵人',
  beam:'放出多道直線攻擊',volley:'連續發射飛彈，命中後爆開',
  drain:'撕裂範圍內嘅敵人並吸取生命',wall:'立起冰牆，攔截投射物並減速附近敵人',
  blink:'向前穿影並回復生命，殘影攻擊原處',wave:'向前發出逐段擴散嘅波動',
  chain:'從第一個目標開始，向附近敵人跳擊',
};

export const huntArms=catalogue.trim().split('\n').map((row,index)=>{
  const [id,name,skill,form,element,action,values,blessing,guardian,cry,patterns,augment,boonDetail]=row.split('|');
  const [hits,radius,interval]=values.split(' ').map(Number);
  const [attack,role,damage,reach,period,combo]=forms[form];
  const {tone,ink,effect,school}=elements[element];
  return {
    id,name,skill,attack,role,damage,reach,period,combo,form,element,effect,tone,ink,mark:'◈',
    sigil:index, cooldown:5.5+hits*.28+(action==='guard'?1.1:0), range:Math.max(3.6,reach+1.2),
    power:Math.round((82+radius*7)/Math.pow(hits,.71)),
    basic:role==='近戰'?'第三擊較重，可破盾後接技。':'第三擊延伸打擊範圍，可命中後接技。',
    detail:skillDetails[id]??descriptions[action]+'。', spell:{action,hits,radius,interval,look:skillLooks[id]},
    blessing:{id:'heirloom-'+id,name:blessing,school,mark:'◈',detail:boonDetail+'。',weaponId:id,augment},
    guardian:{name:guardian,cry,attacks:patterns.split(' ')},
  };
});

export const huntById=new Map(huntArms.map(weapon=>[weapon.id,weapon]));
export const relicPower=rank=>1+Math.min(3,rank)*.095;
