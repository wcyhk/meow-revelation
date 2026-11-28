import {awakenings,awakenedBoon} from './relic-awakening-data.mjs';

// Independently authored lantern-world concepts. Stable keys preserve existing local records.
export const lanternThemes={"light": ["照誓", 15913371, 2107954, 8161169, 15124107], "lightning": ["鳴隙", 8054015, 1517878, 6521485, 11586006], "earth": ["沉鐘", 13741943, 2370345, 6777948, 13677450], "ice": ["霜函", 12121082, 2371903, 8427177, 15199460], "void": ["夜紗", 14260205, 2368056, 6904185, 12821969], "fire": ["薪火", 16753508, 2893873, 7754310, 14594437], "blood": ["紅線", 16743576, 3154733, 8672095, 13870240], "poison": ["腐墨", 11917175, 2306348, 6125674, 11978652], "wind": ["織風", 11003857, 2437173, 7310213, 13819082]};
const rows=`tiger|裂風折刃|折影疾行|wind|curve
dragon|鳴隙提燈|巡燈雷印|lightning|orb
phoenix|燼語銅哨|三疊熾音|fire|horn
turtle|霜函護拳|留寒護衣|ice|claw
qilin|沉鐘長針|逆時引潮|earth|spear
flameblade|薪火裁決|焚契三印|fire|sword
stormbow|斷弦巡夜弓|巡夜雷徑|lightning|bow
windhalberd|迴廊剪風|繞燈三舞|wind|halberd
frostlute|霜玻璃豎琴|碎鏡寒潮|ice|lute
chakra|照誓星盤|回收光環|light|ring
reaper|歸途收契鐮|還願收割|void|scythe
bell|啞鐘司燈杖|逆響三疊|water|bell
fangs|縫影雙爪|紅線迴身|blood|claw
cannon|爐膛巡夜炮|熾芯連爆|fire|gun
sam-in|夜航尺劍|落燈星雨|light|sword
true-seven|根脈折扇刃|開函地針|earth|seven
fox-doll|雷線縫偶|十二針巡遊|lightning|doll
thunder-pearl|拘雷玻璃匣|三枚放電印|lightning|orb
snow-doll|未眠紙偶|黑焰繭床|void|doll
han-spear|埋名長針|七針封路|earth|spear
kunoichi-claw|紅線裁縫爪|縫傷疾步|blood|claw
sky-halberd|焚契燈剪|四焰釘陣|fire|halberd
glacier-sword|冰函直尺|寒函破封|ice|sword
snow-axe|霜齒開匣斧|雙輪回函|ice|axe
sky-dragon-staff|照誓量燈棍|承光反震|light|staff
treasure-staff|銅心校時棒|沉心護持|earth|staff
red-corporal|紅封留寒針|六封冰雨|ice|spear
blue-corporal|藍封長夜針|八封霜井|ice|spear
blood-axe|赤契開罐斧|三刃回收|blood|axe
wave-wheel|鳴隙回線環|三層電網|lightning|ring
thunder-sword|裂隙導電尺|五次回鳴|lightning|sword
oni-bow|寄影空弦弓|喚出噬契影|void|bow
moon-kukri|夜航鉤月刀|留光迴圈|light|curve
dragon-kukri|餘燼挑燈鉤|薪火迴圈|fire|curve
kali-wheel|雙芯測電輪|平行放電|lightning|ring
turtle-bow|送終鐘軌弓|召來鐘匣車|earth|bow
venom-cane|腐墨蘆管杖|滲墨毒幕|poison|cane
yama-cane|熄燈墨瓶杖|黯墨漩渦|void|cane
bat-cane|夜紗風鈴杖|夜紗群舞|void|cane
skanda-kukri|蝕紙裂齒鉤|腐紙旋流|poison|curve
ice-orb|封霜沙漏|四點留寒|ice|orb
fire-orb|燃芯沙漏|四點引火|fire|orb
spark-orb|引雷沙漏|四點放電|lightning|orb
earth-beads|埋願刻度鏈|四座沉印|earth|beads
lotus-beads|照名玻璃鏈|四座照印|light|beads
shiva-trident|鳴隙分流叉|三線斷電|lightning|trident
dragon-fish|沉鐘印槌|三座銅函|earth|bell
lotus-fish|白封印槌|三座霜函|light|bell
goumang|喚根契尺|五重根印|earth|sword
xuanming|留寒門閂|冷封風暴|ice|halberd
red-bow|焚信空弦弓|五封火信|fire|bow
blood-sword|赤墨割紙刀|回收血印|blood|sword
cursed-cane|無頁書脊杖|留墨颶風|void|cane
golden-orb|末燈提芯|三枚照名彈|light|orb
ice-talisman|霜封書籤|留寒紙牆|ice|talisman
rushou-cane|三葉測風杖|三庭風眼|wind|cane
zhurong-axe|噴燼剪薪斧|喚出吐燼管|fire|axe
vritra-spear|追鳴導線針|四針雷場|lightning|spear
snake|蜿蜒墨管|三段腐墨咬|poison|snake
emperor-rod|永夜校時杖|斷頁回響|void|staff
western-rifle|紙衛排槍|召喚紙衛|earth|gun
seven-blade|壓頁重裁刀|墜函鎮地|earth|sword
sniper-crossbow|夜航瞄燈弩|連釘封路|earth|crossbow
lion-crossbow|鳴隙張線弩|穿線雷矢|lightning|crossbow
airavata|晨鐘碎鎖鑿|重鎖轟鳴|light|horn
hundun|無頁吞聲匣|噤聲引潮|void|box
qiongqi|裂帆夜航翎|穿幕疾風|wind|feather
taotie|回願吞墨鉗|回收殘願|blood|fang
taowu|逆時留寒齒|倒影寒徑|ice|fang
nether-box|未寄出的燈匣|閉函護持|ice|box
nether-bow|夜巡斷電弓|追燈雷線|lightning|bow
nether-sword|燼封誓約刀|焚契護衣|fire|sword
nether-halberd|逆風回函戟|回收風眼|wind|halberd`;
lanternThemes.water=['潮痕',0x7bdfdb,0x21313b,0x587b80,0xc2c8b9];
export const originalRelics=new Map(rows.split('\n').map((row,index)=>{const [id,name,skill,theme,form]=row.split('|');return [id,{id,name,skill,theme,form,index}];}));
export function designHash(text){let seed=2166136261;for(const char of text)seed=Math.imul(seed^char.charCodeAt(0),16777619);return seed>>>0;}
export function lanternDesign(weapon){const design=originalRelics.get(weapon.id);if(!design)throw new Error('Unregistered lantern relic '+weapon.id);return {...design,palette:lanternThemes[design.theme],seed:designHash(weapon.id)};}
const elements={light:['light','ward'],lightning:['lightning','thunder'],earth:['stone','ward'],ice:['ice','ward'],void:['void','thunder'],fire:['fire','fire'],blood:['blood','fire'],poison:['root','fire'],wind:['wind','wind'],water:['water','ward']};
const castCopy={rain:'印記依次墜落，在落點附近爆開',spikes:'沿面向逐段開啟地面封印',morph:'縫偶借光附身，移動時接連放出脈衝',buff:'短暫提高移速及攻擊速度',return:'擲出回旋刃，去程同回程都會命中',guard:'展開護衣，擋擊時回震附近敵人',ring:'封印由外向內收攏',storm:'在瞄準位置維持一片元素漩渦',minion:'喚出契紙造物，自動追擊敵人',beam:'沿面向發出多道穿透光束',volley:'接連發射會在落點爆開嘅彈丸',drain:'撕開近身封印，命中時回復生命',wall:'立起霜封紙牆，阻擋並減慢附近敵人',blink:'穿影前行，殘影回擊原處',wave:'發出逐段擴散嘅元素波',chain:'印記由第一個目標跳往附近敵人'};
export function stampRelic(weapon){
  const d=lanternDesign(weapon),[effect,school]=elements[d.theme],tone=d.palette[1];
  const result={...weapon,name:d.name,skill:d.skill,form:weapon.form??d.form,element:d.theme,effect,tone,ink:'#'+tone.toString(16).padStart(6,'0'),originalDesign:d.index};
  if(weapon.spell){
    result.spell={...weapon.spell,look:undefined};
    result.detail=castCopy[weapon.spell.action]+'；共 '+weapon.spell.hits+' 段，以'+d.palette[0]+'能量命中。';
    if(weapon.id==='western-rifle')result.detail='召來持排槍嘅紙衛，連續向附近敵人開火。';
  }
  if(weapon.blessing)result.blessing={...weapon.blessing,name:d.name+'・餘響',school,detail:weapon.blessing.detail.replace(/狐雷|冥雷|龍輪|鬼角|蓮光|聖光|黑火|活力/g,'契印')};
  const awakening=awakenings[weapon.id];
  if(awakening){
    Object.assign(result,{awakening,skill:awakening.name??result.skill,detail:awakening.detail,
      cooldown:awakening.cooldown??result.cooldown});
    Object.assign(result.blessing,{detail:awakenedBoon[0],awakened:true});
  }
  if(weapon.guardian)result.guardian={...weapon.guardian,name:'追契者・'+d.name,cry:'嗰件'+d.name+'仲留住我嘅名字，交返畀我！'};
  return result;
}
