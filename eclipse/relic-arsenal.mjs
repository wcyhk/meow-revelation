import {stampRelic} from './lantern-designs.mjs';
// Lantern-world relic rules; authored designs are defined in lantern-designs.mjs.
const catalogue = `
sam-in|夜航尺劍|落燈星雨|sword|light|rain|5 2.1 .35|夜航尺劍・餘響|照誓追契者|嗰件夜航尺劍仲留住我嘅名字，交返畀我！|prison cross|echo|星雨會令命中嘅敵人短暫硬直
true-seven|根脈折扇刃|開函地針|seven|earth|spikes|7 1.25 .13|根脈折扇刃・餘響|沉鐘追契者|嗰件根脈折扇刃仲留住我嘅名字，交返畀我！|roots lance|stun|地刺會短暫定住敵人
fox-doll|雷線縫偶|十二針巡遊|doll|lightning|morph|12 3.1 .11|雷線縫偶・餘響|鳴隙追契者|嗰件雷線縫偶仲留住我嘅名字，交返畀我！|blink spiral|chain|狐雷命中後會再跳電
thunder-pearl|拘雷玻璃匣|三枚放電印|orb|lightning|rain|3 2.45 .28|拘雷玻璃匣・餘響|鳴隙追契者|嗰件拘雷玻璃匣仲留住我嘅名字，交返畀我！|marked cross|chill|落珠會減速
snow-doll|未眠紙偶|黑焰繭床|doll|void|storm|5 2.85 .27|未眠紙偶・餘響|夜紗追契者|嗰件未眠紙偶仲留住我嘅名字，交返畀我！|cinders eclipse|pull|黑火風暴會吸入敵人
han-spear|埋名長針|七針封路|spear|earth|rain|7 1.42 .14|埋名長針・餘響|沉鐘追契者|嗰件埋名長針仲留住我嘅名字，交返畀我！|barrage lance|wide|投槍落點嘅波及範圍增大
kunoichi-claw|紅線裁縫爪|縫傷疾步|claw|blood|buff|3 1.75 .18|紅線裁縫爪・餘響|紅線追契者|嗰件紅線裁縫爪仲留住我嘅名字，交返畀我！|blink pounce|haste|活力持續時間增加
sky-halberd|焚契燈剪|四焰釘陣|halberd|fire|rain|4 1.94 .23|焚契燈剪・餘響|薪火追契者|嗰件焚契燈剪仲留住我嘅名字，交返畀我！|cinders cleave|burn|落戟會留下兩次餘焰
glacier-sword|冰函直尺|寒函破封|sword|ice|spikes|5 1.72 .16|冰函直尺・餘響|霜函追契者|嗰件冰函直尺仲留住我嘅名字，交返畀我！|icicles cross|echo|末段冰柱碎裂後會再爆
snow-axe|霜齒開匣斧|雙輪回函|axe|ice|return|2 .90 .29|霜齒開匣斧・餘響|霜函追契者|嗰件霜齒開匣斧仲留住我嘅名字，交返畀我！|lance icicles|chill|回程斧刃延長減速
sky-dragon-staff|照誓量燈棍|承光反震|staff|light|guard|2 2.65 .25|照誓量燈棍・餘響|照誓追契者|嗰件照誓量燈棍仲留住我嘅名字，交返畀我！|burst cleave|riposte|擋擊時嘅反震更強
treasure-staff|銅心校時棒|沉心護持|staff|earth|guard|3 2.12 .16|銅心校時棒・餘響|沉鐘追契者|嗰件銅心校時棒仲留住我嘅名字，交返畀我！|toll ring|guard|格擋持續時間增加
red-corporal|紅封留寒針|六封冰雨|spear|ice|rain|6 1.72 .19|紅封留寒針・餘響|霜函追契者|嗰件紅封留寒針仲留住我嘅名字，交返畀我！|icicles barrage|expose|冰雨削弱敵人防禦
blue-corporal|藍封長夜針|八封霜井|spear|ice|storm|8 2.12 .18|藍封長夜針・餘響|霜函追契者|嗰件藍封長夜針仲留住我嘅名字，交返畀我！|ring icicles|chill|冰雨令敵人減速更耐
blood-axe|赤契開罐斧|三刃回收|axe|blood|return|3 1.20 .21|赤契開罐斧・餘響|紅線追契者|嗰件赤契開罐斧仲留住我嘅名字，交返畀我！|cleave jaws|drain|回刃命中會回血
wave-wheel|鳴隙回線環|三層電網|ring|lightning|ring|3 3.75 .27|鳴隙回線環・餘響|鳴隙追契者|嗰件鳴隙回線環仲留住我嘅名字，交返畀我！|ring coins|pull|外圈會扯敵人入內圈
thunder-sword|裂隙導電尺|五次回鳴|sword|lightning|rain|5 1.82 .17|裂隙導電尺・餘響|鳴隙追契者|嗰件裂隙導電尺仲留住我嘅名字，交返畀我！|cross marked|chain|雲雷會從落點跳去附近敵人
oni-bow|寄影空弦弓|喚出噬契影|bow|void|minion|4 1.58 .46|寄影空弦弓・餘響|夜紗追契者|嗰件寄影空弦弓仲留住我嘅名字，交返畀我！|summon pounce|drain|鬼角擊中敵人時回復生命
moon-kukri|夜航鉤月刀|留光迴圈|curve|light|storm|5 2.15 .22|夜航鉤月刀・餘響|照誓追契者|嗰件夜航鉤月刀仲留住我嘅名字，交返畀我！|sweep eclipse|wide|月輪擴大
dragon-kukri|餘燼挑燈鉤|薪火迴圈|curve|fire|storm|4 2.48 .26|餘燼挑燈鉤・餘響|薪火追契者|嗰件餘燼挑燈鉤仲留住我嘅名字，交返畀我！|cleave cinders|burn|龍輪經過嘅位置會再燒
kali-wheel|雙芯測電輪|平行放電|ring|lightning|beam|2 .83 .19|雙芯測電輪・餘響|鳴隙追契者|嗰件雙芯測電輪仲留住我嘅名字，交返畀我！|cross coins|echo|雙輪交會會再炸一次
turtle-bow|送終鐘軌弓|召來鐘匣車|bow|earth|minion|5 1.83 .43|送終鐘軌弓・餘響|沉鐘追契者|嗰件送終鐘軌弓仲留住我嘅名字，交返畀我！|barrage burst|stun|龜甲車會撞暈敵人
venom-cane|腐墨蘆管杖|滲墨毒幕|cane|poison|storm|5 2.23 .29|腐墨蘆管杖・餘響|腐墨追契者|嗰件腐墨蘆管杖仲留住我嘅名字，交返畀我！|web gravity|burn|黑暴散去後毒液仲會傷人
yama-cane|熄燈墨瓶杖|黯墨漩渦|cane|void|storm|6 2.20 .24|熄燈墨瓶杖・餘響|夜紗追契者|嗰件熄燈墨瓶杖仲留住我嘅名字，交返畀我！|gravity toll|pull|判風將敵人拉向中心
bat-cane|夜紗風鈴杖|夜紗群舞|cane|blood|storm|7 1.81 .18|夜紗風鈴杖・餘響|夜紗追契者|嗰件夜紗風鈴杖仲留住我嘅名字，交返畀我！|feathers gravefan|drain|蝠群每次命中都吸少量生命
skanda-kukri|蝕紙裂齒鉤|腐紙旋流|curve|poison|storm|8 1.94 .20|蝕紙裂齒鉤・餘響|腐墨追契者|嗰件蝕紙裂齒鉤仲留住我嘅名字，交返畀我！|spiral roots|expose|腐紙旋流令敵人易傷
ice-orb|封霜沙漏|四點留寒|orb|ice|beam|4 1.42 .19|封霜沙漏・餘響|霜函追契者|嗰件封霜沙漏仲留住我嘅名字，交返畀我！|icicles lance|chill|冰光加長減速
fire-orb|燃芯沙漏|四點引火|orb|fire|beam|4 1.52 .21|燃芯沙漏・餘響|薪火追契者|嗰件燃芯沙漏仲留住我嘅名字，交返畀我！|cinders cross|burn|火光在落點留焰
spark-orb|引雷沙漏|四點放電|orb|lightning|beam|4 1.08 .14|引雷沙漏・餘響|鳴隙追契者|嗰件引雷沙漏仲留住我嘅名字，交返畀我！|cross barrage|chain|雷光可連到旁邊敵人
earth-beads|埋願刻度鏈|四座沉印|beads|earth|beam|4 1.74 .24|埋願刻度鏈・餘響|沉鐘追契者|嗰件埋願刻度鏈仲留住我嘅名字，交返畀我！|roots prison|stun|震光會定住地面敵人
lotus-beads|照名玻璃鏈|四座照印|beads|light|beam|4 1.62 .20|照名玻璃鏈・餘響|照誓追契者|嗰件照名玻璃鏈仲留住我嘅名字，交返畀我！|marked ring|echo|末段蓮光再照一次
shiva-trident|鳴隙分流叉|三線斷電|trident|lightning|beam|3 1.17 .19|鳴隙分流叉・餘響|鳴隙追契者|嗰件鳴隙分流叉仲留住我嘅名字，交返畀我！|lance cross|stun|電流會眩暈
dragon-fish|沉鐘印槌|三座銅函|bell|earth|rain|3 2.20 .34|沉鐘印槌・餘響|沉鐘追契者|嗰件沉鐘印槌仲留住我嘅名字，交返畀我！|toll roots|stun|石塔撞擊會暈住敵人
lotus-fish|白封印槌|三座霜函|bell|light|rain|3 2.55 .30|白封印槌・餘響|照誓追契者|嗰件白封印槌仲留住我嘅名字，交返畀我！|toll ring|echo|最後一座石塔會碎裂再震
goumang|喚根契尺|五重根印|curve|earth|spikes|5 2.27 .18|喚根契尺・餘響|沉鐘追契者|嗰件喚根契尺仲留住我嘅名字，交返畀我！|roots gravefan|stun|地手會按住敵人
xuanming|留寒門閂|冷封風暴|spear|ice|storm|7 2.34 .21|留寒門閂・餘響|霜函追契者|嗰件留寒門閂仲留住我嘅名字，交返畀我！|icicles sweep|chill|暴風同普攻第三擊都可長時間減速
red-bow|焚信空弦弓|五封火信|bow|fire|volley|5 1.15 .15|焚信空弦弓・餘響|薪火追契者|嗰件焚信空弦弓仲留住我嘅名字，交返畀我！|barrage cinders|wide|火箭嘅爆風擴大
blood-sword|赤墨割紙刀|回收血印|sword|blood|drain|1 4.12 .20|赤墨割紙刀・餘響|紅線追契者|嗰件赤墨割紙刀仲留住我嘅名字，交返畀我！|jaws eclipse|drain|血爆每次命中回復更多生命
cursed-cane|無頁書脊杖|留墨颶風|cane|void|storm|5 2.67 .23|無頁書脊杖・餘響|夜紗追契者|嗰件無頁書脊杖仲留住我嘅名字，交返畀我！|gravity prison|pull|黑鏈會扯敵人去高傷害中心
golden-orb|末燈提芯|三枚照名彈|orb|light|volley|3 1.60 .21|末燈提芯・餘響|照誓追契者|嗰件末燈提芯仲留住我嘅名字，交返畀我！|marked barrage|echo|最後一發分裂為第二次爆炸
ice-talisman|霜封書籤|留寒紙牆|talisman|ice|wall|5 1.18 .16|霜封書籤・餘響|霜函追契者|嗰件霜封書籤仲留住我嘅名字，交返畀我！|prison icicles|guard|冰牆存在更耐
rushou-cane|三葉測風杖|三庭風眼|cane|wind|storm|3 2.18 .19|三葉測風杖・餘響|織風追契者|嗰件三葉測風杖仲留住我嘅名字，交返畀我！|spiral sweep|echo|旋風消散時會再捲起一次
zhurong-axe|噴燼剪薪斧|喚出吐燼管|axe|fire|minion|3 2.40 .48|噴燼剪薪斧・餘響|薪火追契者|嗰件噴燼剪薪斧仲留住我嘅名字，交返畀我！|cinders summon|burn|火蛇離場會引爆最後落點
vritra-spear|追鳴導線針|四針雷場|trident|lightning|rain|4 2.65 .32|追鳴導線針・餘響|鳴隙追契者|嗰件追鳴導線針仲留住我嘅名字，交返畀我！|cross icicles|pull|磁場吸入外圍敵人
snake|蜿蜒墨管|三段腐墨咬|snake|poison|minion|7 1.30 .24|蜿蜒墨管・餘響|腐墨追契者|嗰件蜿蜒墨管仲留住我嘅名字，交返畀我！|roots web|expose|蛇毒加深後續傷害
emperor-rod|永夜校時杖|斷頁回響|staff|void|blink|2 1.95 .22|永夜校時杖・餘響|夜紗追契者|嗰件永夜校時杖仲留住我嘅名字，交返畀我！|blink eclipse|echo|原地殘影會再爆一次
western-rifle|紙衛排槍|召喚紙衛隊|gun|void|minion|4 1.13 .43|紙衛排槍・餘響|沉鐘追契者|嗰件紙衛排槍仲留住我嘅名字，交返畀我！|barrage lance|expose|鬼魂彈加強易傷標記
seven-blade|壓頁重裁刀|墜函鎮地|seven|earth|rain|6 1.86 .20|壓頁重裁刀・餘響|沉鐘追契者|嗰件壓頁重裁刀仲留住我嘅名字，交返畀我！|roots toll|stun|崩石震暈敵人
sniper-crossbow|夜航瞄燈弩|連釘封路|crossbow|void|volley|2 1.14 .30|夜航瞄燈弩・餘響|沉鐘追契者|嗰件夜航瞄燈弩仲留住我嘅名字，交返畀我！|lance blink|expose|鬼魂彈令目標易傷更耐
lion-crossbow|鳴隙張線弩|穿線雷矢|crossbow|earth|volley|3 1.70 .26|鳴隙張線弩・餘響|鳴隙追契者|嗰件鳴隙張線弩仲留住我嘅名字，交返畀我！|barrage jaws|stun|獅吼震暈附近敵人
airavata|晨鐘碎鎖鑿|重鎖轟鳴|horn|earth|wave|3 1.76 .21|晨鐘碎鎖鑿・餘響|照誓追契者|嗰件晨鐘碎鎖鑿仲留住我嘅名字，交返畀我！|pounce toll|wide|波動加寬同延伸
hundun|無頁吞聲匣|噤聲引潮|claw|earth|morph|5 1.65 .16|無頁吞聲匣・餘響|夜紗追契者|嗰件無頁吞聲匣仲留住我嘅名字，交返畀我！|pounce spiral|haste|狂氣時移動更快
qiongqi|裂帆夜航翎|穿幕疾風|feather|wind|volley|6 .88 .10|裂帆夜航翎・餘響|織風追契者|嗰件裂帆夜航翎仲留住我嘅名字，交返畀我！|feathers blink|expose|逆羽標記令敵人易傷
taotie|回願吞墨鉗|回收殘願|horn|fire|drain|3 2.70 .24|回願吞墨鉗・餘響|紅線追契者|嗰件回願吞墨鉗仲留住我嘅名字，交返畀我！|jaws cinders|burn|火顎撕裂後點燃地面
taowu|逆時留寒齒|倒影寒徑|fang|ice|guard|3 2.37 .21|逆時留寒齒・餘響|霜函追契者|嗰件逆時留寒齒仲留住我嘅名字，交返畀我！|pounce icicles|riposte|擋擊時冰牙反震更強
nether-box|未寄出的燈匣|閉函護持|box|ice|guard|4 2.62 .27|未寄出的燈匣・餘響|霜函追契者|嗰件未寄出的燈匣仲留住我嘅名字，交返畀我！|prison gravity|chill|加護波會凍住附近敵人
nether-bow|夜巡斷電弓|追燈雷線|bow|lightning|chain|5 2.72 .14|夜巡斷電弓・餘響|鳴隙追契者|嗰件夜巡斷電弓仲留住我嘅名字，交返畀我！|cross barrage|chain|冥雷可再跳多兩個目標
nether-sword|燼封誓約刀|焚契護衣|sword|fire|guard|3 2.73 .30|燼封誓約刀・餘響|薪火追契者|嗰件燼封誓約刀仲留住我嘅名字，交返畀我！|cinders cleave|burn|火膜震波會引燃敵人
nether-halberd|逆風回函戟|回收風眼|halberd|wind|storm|6 2.62 .22|逆風回函戟・餘響|織風追契者|嗰件逆風回函戟仲留住我嘅名字，交返畀我！|sweep gravity|pull|逆流將周圍敵人扯返入風眼
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

const skillLooks={};

const skillDetails={};

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
}).map(stampRelic);

export const huntById=new Map(huntArms.map(weapon=>[weapon.id,weapon]));
export const relicPower=rank=>1+Math.min(3,rank)*.095;
