import {language,t} from './locale.mjs';

const position={'zh-Hant':0,'zh-Hans':1,en:2,ja:3}[language];
export const local=(...text)=>text[position];

const themes={
  light:['光','光','Light','光','#ffe4ab'],
  lightning:['雷','雷','Lightning','雷','#c2eeff'],
  earth:['岩','岩','Stone','岩','#efc9a4'],
  ice:['霜','霜','Frost','氷','#c1fff5'],
  void:['幽影','幽影','Shadow','影','#e4c6ff'],
  fire:['火','火','Fire','炎','#ffb997'],
  blood:['血契','血契','Blood','血','#ffafc3'],
  poison:['毒','毒','Venom','毒','#e1f3a2'],
  wind:['風','风','Wind','風','#ccfbe1'],
  water:['水','水','Water','水','#b6ebe8'],
};
const core={tiger:'wind',dragon:'lightning',phoenix:'fire',turtle:'ice',qilin:'wind',
  flameblade:'fire',stormbow:'lightning',windhalberd:'wind',frostlute:'ice',chakra:'light'};
const themeOf=weapon=>themes[weapon.element??core[weapon.id]??({root:'poison',stone:'earth'}[weapon.effect]??weapon.effect)]??themes.light;
export const weaponTheme=weapon=>themeOf(weapon)[position];
export const weaponThemeInk=weapon=>themeOf(weapon)[4];
export const colorExplanation=()=>local('名字顏色代表神器嘅能量色系。','名称颜色代表神器的能量色系。',
  'Name colors show each relic’s energy theme.','名前の色は神器の属性を表します。');

const localized=rows=>Object.fromEntries(Object.entries(rows).map(([key,copy])=>[key,local(...copy)]));
const attacks=localized({
  bow:['用弓遠距射擊','用弓远程射击','Shoot distant enemies with a bow','弓で離れた敵を射る'],
  crossbow:['用弩遠距射擊','用弩远程射击','Shoot distant enemies with a crossbow','弩で離れた敵を射る'],
  gun:['射擊遠處敵人','射击远处敌人','Fire at distant enemies','銃で離れた敵を撃つ'],
  sword:['用劍斬附近敵人','用剑斩击附近敌人','Slash nearby enemies with a sword','近くの敵を剣で斬る'],
  curve:['用彎刀斬附近敵人','用弯刀斩击附近敌人','Slash nearby enemies with a curved blade','近くの敵を曲刀で斬る'],
  seven:['用分岔刀刃斬擊','用分叉刀刃斩击','Strike with a forked blade','分かれた刃で斬る'],
  spear:['用長槍刺向前方','用长枪刺向前方','Thrust forward with a spear','槍で少し離れた敵を突く'],
  halberd:['揮動長戟橫掃','挥动长戟横扫','Sweep with a halberd','長柄の刃で敵をなぎ払う'],
  trident:['用三叉戟刺擊','用三叉戟刺击','Thrust with a trident','三叉槍で敵を突く'],
  claw:['用爪近身連斬','用爪近身连斩','Rake nearby enemies with claws','近くの敵を爪で引っかく'],
  fang:['用獠刃近身斬擊','用獠刃近身斩击','Slash nearby enemies with a fang blade','近くの敵を牙の刃で斬る'],
  axe:['用斧頭近身劈擊','用斧头近身劈击','Chop nearby enemies with an axe','斧で近くの敵をたたく'],
  staff:['用長棍橫掃','用长棍横扫','Sweep enemies with a staff','棒で敵をなぎ払う'],
  horn:['用尖角近身刺擊','用尖角近身刺击','Stab nearby enemies with a horn','角で近くの敵を突く'],
  ring:['擲出迴旋圓環','掷出回旋圆环','Throw a spinning ring','輪を投げて攻撃する'],
  feather:['射出羽刃','射出羽刃','Launch feather blades','羽根の刃を飛ばす'],
  orb:['射出遠距光彈','射出远程光弹','Fire a ranged bolt','光弾で遠くの敵を攻撃する'],
  doll:['用符偶發射符光','用符偶发射符光','Fire charms from a doll','人形から符の光を放つ'],
  cane:['用杖放出咒波','用杖放出咒波','Send out a cursed wave from the cane','杖から呪いの波を放つ'],
  beads:['擲出念珠','掷出念珠','Throw prayer beads','念珠を飛ばす'],
  bell:['用鐘聲攻擊敵人','用钟声攻击敌人','Strike enemies with a bell chime','鐘の音で敵を攻撃する'],
  talisman:['擲出符紙','掷出符纸','Hurl paper charms','符を飛ばして攻撃する'],
  snake:['伸出蛇身咬敵人','伸出蛇身咬敌人','Lash out with a snake bite','蛇を伸ばしてかみつく'],
  box:['從匣中射出光束','从匣中射出光束','Fire light from the relic box','箱から光を放って攻撃する'],
});
const casts=localized({
  rain:['連續轟擊瞄準位置','连续轰击瞄准位置','Strike the target area repeatedly','狙った場所に連続攻撃'],
  spikes:['沿前方逐段引爆','沿前方逐段引爆','Set off blasts in a line ahead','正面を順に攻撃'],
  morph:['震擊附近敵人並強化自己','震击附近敌人并强化自身','Hit nearby enemies and empower yourself','周囲を攻撃し、自分を強化'],
  buff:['震擊四周，加快移動同普攻','震击四周，加快移动和普攻','Hit nearby enemies and speed up movement and attacks','周囲を攻撃し、移動と通常攻撃を加速'],
  return:['擲出武器，來回都會命中','掷出武器，往返都能命中','Throw a weapon that hits on both passes','往復する武器を投げる'],
  guard:['披上護甲，挨打會反擊','披上护甲，受击时反击','Gain armor and counter when hit','防御を固め、被弾時に反撃'],
  ring:['用收向中心嘅圓環攻擊','用向内收缩的圆环攻击','Hit enemies with a shrinking ring','外から内へ縮む輪で攻撃'],
  storm:['留低風暴，持續傷敵','留下风暴，持续伤敌','Leave a storm that deals repeated damage','その場に残る嵐で連続攻撃'],
  minion:['召喚盟友連續追打最強敵人','召唤盟友连续追打最强敌人','Summon an ally to hound the strongest enemy','味方を召喚し、最も強い敵を連続攻撃'],
  beam:['射出可貫穿敵人嘅光束','射出可贯穿敌人的光束','Fire piercing beams','複数の直線を貫く'],
  volley:['連射會爆炸嘅彈丸','连射会爆炸的弹丸','Fire a volley of explosive shots','爆発する弾を連射'],
  drain:['傷害附近敵人並回血','伤害附近敌人并回血','Damage nearby enemies and heal','周囲を攻撃して回復'],
  wall:['立起冰牆擋彈兼減速','立起冰墙挡弹并减速','Raise an ice wall to block shots and slow enemies','氷壁で弾を止め、敵を遅くする'],
  blink:['穿影回血，殘影攻擊原位','穿影回血，残影攻击原位','Blink, heal, and strike from your old position','移動して回復し、元の場所を攻撃'],
  wave:['向前方放出擴散波','向前方放出扩散波','Send a widening wave forward','正面へ広がる波で攻撃'],
  chain:['攻擊會跳去附近敵人','攻击会跳向附近敌人','Chain hits between nearby enemies','近くの敵に次々と攻撃が伝わる'],
});
const uniqueAttacks=localized({
  stormbow:['先射快箭同雙箭，再拉滿弦射貫穿箭','先射快箭和双箭，再拉满弦射穿透箭','Fire quick and twin shots, then draw a piercing arrow','弓で速射と二連射を放ち、最後に貫通する矢を撃つ'],
  dragon:['遠距離連鎖傷敵','远程连锁伤敌','Chain attacks at range','離れた敵に連鎖攻撃'],
  phoenix:['隔住一段距離攻擊','从中距离攻击','Attack from midrange','中距離から敵を攻撃'],
  turtle:['用護拳打近身敵人','用护拳打击近身敌人','Punch nearby enemies','近くの敵を拳で攻撃'],
  frostlute:['隔住一段距離打出冰浪','从中距离打出冰浪','Hit enemies with ice from midrange','中距離から氷で攻撃'],
  cannon:['用重炮打遠處敵人','用重炮打击远处敌人','Fire a cannon at distant enemies','砲で離れた敵を撃つ'],
  reaper:['用鐮刀橫掃附近敵人','用镰刀横扫附近敌人','Sweep nearby enemies with a scythe','鎌で周囲を斬る'],
});
const uniqueSkills=localized({
  tiger:['化成風刃突進，沿途閃避攻擊','化为风刃突进，沿途闪避攻击','Dash through enemies as a wind blade and evade attacks','回避しながら前方へ斬り込む'],
  dragon:['追住敵人落三道雷','追踪敌人落下三道雷','Call three lightning strikes on enemies','狙った敵に雷を3回落とす'],
  phoenix:['向前連發三擊，令敵人易傷','向前连发三击，使敌人易伤','Fire three shots and make enemies take more damage','前方へ3連射し、敵を弱らせる'],
  turtle:['披上冰甲，挨打會反擊','披上冰甲，受击时反击','Gain ice armor that retaliates when hit','氷の鎧で守り、被弾時に反撃'],
  qilin:['用漩渦聚敵，加強重刺','用漩涡聚敌，强化重刺','Pull enemies into a vortex and strengthen your thrust','渦で敵を引き寄せ、突きを強化'],
  flameblade:['喺敵人附近落三把火劍','在敌人附近落下三把火剑','Drop three flaming swords around the target','敵の周囲に火の剣を3本落とす'],
  stormbow:['沿前方放四道貫穿雷擊','沿前方放出四道贯穿雷击','Call four piercing strikes along your aim','前方に貫通する雷を4回落とす'],
  windhalberd:['郁住橫掃四周三次','移动时连续横扫周围三次','Sweep around you three times while moving','移動しながら周囲を3回斬る'],
  frostlute:['放三道冰浪，減慢敵人','放出三道冰浪，减慢敌人','Send three ice waves that slow enemies','氷の波を3回起こし、敵を遅くする'],
  chakra:['用三層收窄嘅電環傷敵','用三层收缩的电环伤敌','Hit enemies with three shrinking rings','外から内へ3つの輪で攻撃'],
  fangs:['穿過敵群，再斬返原路','穿过敌群，再沿原路斩回','Dash through enemies, then slash back along the path','敵をすり抜け、通った道を斬り返す'],
  cannon:['向瞄準位置落三發榴彈','向瞄准位置落下三发榴弹','Drop three grenades at the aimed spot','狙った場所に榴弾を3発落とす'],
  bell:['喺瞄準位置連敲三下，範圍逐下擴大','在瞄准位置连续敲三下，范围逐次扩大','Ring the bell three times in widening bursts','狙った場所に3回、範囲が広がる音波を放つ'],
  reaper:['拉近敵人，重創生命低嘅目標','拉近敌人，重创生命较低的目标','Pull enemies in and hit harder when their HP is low','敵を引き寄せ、HPの減った敵に強い一撃'],
  'western-rifle':['召喚紙槍手追住最強敵人連射','召唤纸枪手追着最强敌人连射','Summon a paper gunner to fire repeatedly at the strongest foe','紙の銃兵を呼び、最も強い敵を追って連射させる'],
  'oni-bow':['召喚影弓手，雙箭交擊最強敵人並吸血','召唤影弓手，双箭交击最强敌人并吸血','Summon a shadow archer whose twin arrows converge on the strongest foe and drain life','影の弓兵を呼び、最も強い敵に交差する2本の矢を放ってHPを吸う'],
  'turtle-bow':['召喚鐘匣車追撞最強敵人，撞擊會掃開附近敵人','召唤钟匣车追撞最强敌人，撞击扫开附近敌人','Summon a bell cart that rams the strongest foe and sweeps nearby enemies aside','鐘の車を呼び、最も強い敵に突進して周囲も押しのける'],
  'zhurong-axe':['召喚吐燼管，連續向最強敵人噴出穿透火流','召唤吐烬管，连续向最强敌人喷出穿透火流','Summon a furnace that spits piercing jets at the strongest enemy','火炉を呼び、最も強い敵に貫通する炎を絶え間なく放つ'],
  snake:['召喚腐墨造物，三段毒牙交替咬住最強敵人','召唤腐墨造物，三段毒牙交替咬住最强敌人','Summon an ink familiar that turns three venomous fangs on the strongest foe','墨の使い魔を呼び、毒牙3本で最も強い敵を交互にかみつく'],
});
export function weaponSummary(weapon){
  return {attack:uniqueAttacks[weapon.id]??attacks[weapon.form]??t(weapon.role),
    effect:weapon.awakening?t(weapon.detail):uniqueSkills[weapon.id]??casts[weapon.spell?.action]??t(weapon.detail)};
}

const links=localized({
  tiger:['穿過敵人斬擊，落地時再斬一次。','穿过敌人斩击，落地时再斩一次。','Dash through enemies, then slash again on landing.','敵を斬り抜け、着地でもう一度斬ります。'],
  dragon:['三道雷集中打中最後命中嗰個敵人。','三道雷集中攻击最后命中的敌人。','All three bolts focus on the last enemy hit.','雷を3回、最後に当てた敵へ集中させます。'],
  phoenix:['三道火浪喺命中點交會，令敵人更易受傷。','三道火浪在命中点汇合，让敌人受到更多伤害。','Three fire waves converge on the hit and make enemies take more damage.','命中地点に3方向から炎が集まり、敵が受けるダメージを増やします。'],
  turtle:['冰甲維持更耐，反擊嘅冰刺亦更強。','冰甲持续更久，反击的冰刺也更强。','Ice armor lasts longer and its counterattack hits harder.','氷の鎧が長持ちし、反撃の氷のとげも強くなります。'],
  qilin:['踏前追刺，再捲出小漩渦。破盾後追刺更強。','踏步追刺，再卷出小漩涡。破盾后追刺更强。','Lunge again and create a small vortex. The thrust is stronger after breaking a shield.','踏み込んで追い突きし、小さな渦を起こします。盾を壊したときは威力が上がります。'],
  flameblade:['引爆重劈留下嘅火痕，波及附近敵人。','引爆重劈留下的火痕，波及附近敌人。','Detonate the heavy slash’s flame mark to hit nearby enemies.','重い斬撃で残した炎を爆発させ、近くの敵ごと攻撃します。'],
  stormbow:['雷電由中箭敵人跳去附近目標。','雷电从中箭的敌人跳到附近目标。','Lightning jumps from the enemy hit by the arrow to nearby enemies.','矢が当たった敵から近くの敵へ、雷が伝わります。'],
  windhalberd:['先拉近敵人，再用風掃開。','先拉近敌人，再用风扫开。','Pull enemies in, then sweep them away with wind.','敵を引き寄せてから、風でなぎ払います。'],
  frostlute:['冰浪追加兩次回音，令敵人減速更耐。','冰浪追加两次回音，让敌人减速更久。','Two echoes follow the ice wave and extend the slow.','氷の波に続けて反響を2回起こし、敵が遅くなる時間を延ばします。'],
  chakra:['召回圓盤，斬過沿途敵人，最後放出電環。','召回圆盘，斩过沿途敌人，最后放出电环。','Recall the disc through enemies and finish with a ring of electricity.','円盤を手元に戻しながら敵を斬り、最後に電気の輪を放ちます。'],
  fangs:['影刃由兩邊夾擊命中嘅敵人。','影刃从两侧夹击命中的敌人。','Shadow blades strike the enemy from both sides.','命中した敵を両側から、影の刃で斬ります。'],
  cannon:['向重砲命中點投下榴彈，分兩次爆炸。','向重炮命中点投下榴弹，分两次爆炸。','Drop a shell on the cannon’s impact point for two explosions.','重砲が当たった場所に榴弾を落とし、2回爆発させます。'],
  bell:['鐘聲喺命中點擴散三次，中心一擊最強。','钟声在命中点扩散三次，中心一击最强。','Three chimes spread from the impact. The innermost hit is strongest.','命中した場所で鐘の音が3重に広がります。中心の一撃が最も強力です。'],
  reaper:['拉近再斬擊最後命中嘅敵人。對方生命愈低，傷害愈高。','拉近并斩击最后命中的敌人。对方生命越低，伤害越高。','Pull in and slash the last enemy you hit. The lower its health, the greater the damage.','最後に当てた敵を引き寄せて斬ります。HPが減った敵ほど大きなダメージを受けます。'],
});

const augments=localized({
  echo:['技能結束後追加一次爆發','技能结束后追加一次爆发','Add one burst after the skill ends','スキルの後に追加で1回爆発する'],
  burn:['技能結束後追加兩次爆發','技能结束后追加两次爆发','Add two bursts after the skill ends','スキルの後に追加で2回爆発する'],
  stun:['技能命中會打暈普通敵人','技能命中会击晕普通敌人','Skill hits stun regular enemies','スキルが当たったザコ敵をひるませる'],
  chain:['技能命中會連帶打中附近敵人','技能命中会连带击中附近敌人','A skill hit chains to nearby enemies','スキルが当たると近くの敵にも連鎖する'],
  chill:['技能命中會令敵人減速','技能命中会让敌人减速','Skill hits slow enemies','スキルが当たった敵の動きを遅くする'],
  pull:['技能命中會將敵人拉向攻擊中心','技能命中会将敌人拉向攻击中心','Skill hits pull enemies toward the attack','スキルが当たった敵を攻撃の中心に引き寄せる'],
  wide:['擴大技能所用嘅爆發範圍','扩大技能的爆发范围','Increase the radius of the skill’s bursts','スキルの爆発範囲が広がる'],
  haste:['延長技能加速時間','延长技能的加速时间','Keep the skill’s speed boost active longer','スキルの加速が長持ちする'],
  riposte:['護甲反擊傷害提高','护甲反击伤害提高','Armor counters hit harder','防御からの反撃が強くなる'],
  guard:['延長技能嘅護甲或屏障時間','延长技能的护甲或屏障时间','Keep the skill’s armor or barrier active longer','スキルの鎧や障壁が長持ちする'],
  expose:['命中嘅敵人短時間內會受到更多傷害','命中的敌人短时间内会受到更多伤害','Enemies hit take more damage for a short time','スキルが当たった敵は一時的に受けるダメージが増える'],
  drain:['技能命中會回復生命','技能命中会恢复生命','Skill hits restore health','スキルが当たるとHPが回復する'],
});

export function weaponDetailRows(weapon){
  const {attack,effect}=weaponSummary(weapon);
  const seconds=weapon.cooldown;
  const follow=weapon.awakening?local('以連段命中位置輔助瞄準，並提高技能傷害。',
    '以连段命中位置辅助瞄准，并提高技能伤害。','The combo hit helps aim the skill and increases its damage.',
    '連撃の命中地点を照準に使い、スキルの威力が上がります。'):links[weapon.id]??local('鎖定最後命中嘅敵人，提高技能傷害同範圍。',
    '锁定最后命中的敌人，提高技能伤害和范围。','Aim at the last enemy hit with increased damage and area.',
    'その敵を狙って発動し、威力と攻撃範囲が上がります。');
  return [
    [local('普攻','普攻','Basic attack','通常攻撃'),attack+local('。普攻有三段。','。普攻有三段。','. Three stages per combo.','。連続攻撃は3段です。')],
    [t(weapon.skill),effect+local(`。基礎冷卻 ${seconds} 秒。`,`。基础冷却 ${seconds} 秒。`,
      `. Base cooldown: ${seconds}s.`,`。再使用まで${seconds}秒。`)],
    [local('接技','连招','Follow-up','連携技'),local('第三段普攻命中後立即用神器技能。','第三段普攻命中后立即使用神器技能。',
      'Use the relic skill just after landing the third stage of the basic combo. ','3撃目が当たった直後に神器スキルを使います。')+follow],
    ...(weapon.blessing?[[t(weapon.blessing.name),blessingSummary(weapon.blessing)]]:[]),
  ];
}

const blessings=localized({
  thorn:['提高普攻傷害','提高普攻伤害','Basic attacks deal more damage','通常攻撃のダメージが上がる'],
  moon:['神器技能冷卻縮短，射程或範圍增加','神器技能冷却缩短，射程或范围增加','Relic skills recharge faster and reach farther','神器スキルの待ち時間が短くなり、届く範囲が広がる'],
  flower:['增加生命上限，即時回血','增加生命上限，立即回血','Increase max health and heal immediately','最大HPが上がり、HPが回復する'],
  step:['翻滾冷卻縮短，落地會傷到附近敵人','翻滚冷却缩短，落地会伤到附近敌人','Roll sooner and damage nearby enemies where you land','回避の待ち時間が短くなり、着地で敵を攻撃する'],
  star:['神器技能傷害提高，擊倒敵人會回血','神器技能伤害提高，击倒敌人会回血','Relic skills hit harder and defeating enemies restores health','神器スキルが強くなり、敵を倒すと回復する'],
  reach:['普攻打得更遠，第三段傷害提高','普攻打得更远，第三段伤害提高','Basic attacks reach farther and the third stage hits harder','通常攻撃が遠くに届き、3撃目が強くなる'],
  shell:['減少受到嘅傷害','减少受到的伤害','Take less damage','受けるダメージが減る'],
  wind:['移動同普攻更快','移动和普攻更快','Move and use basic attacks faster','移動と通常攻撃が速くなる'],
  spring:['即時回血，之後每次過關都回多啲血','立即回血，之后每次过关都回复更多生命','Heal now and recover more health after clearing each floor','HPが回復し、以降の階層クリア時の回復量も増える'],
  lantern:['增加生命上限同神器技能傷害','增加生命上限和神器技能伤害','Increase max health and relic skill damage','最大HPと神器スキルのダメージが上がる'],
  kindling:['神器技能同焰印追加攻擊更強','神器技能和焰印追加攻击更强','Relic skills and the Flame Mark bonus attack hit harder','神器スキルと炎の追撃が強くなる'],
  conductor:['神器技能冷卻縮短，自動落雷更強','神器技能冷却缩短，自动落雷更强','Relic skills recharge faster and automatic lightning hits harder','神器スキルの待ち時間が短くなり、自動落雷が強くなる'],
  ashbrand:['普攻第三段命中後短暫延遲再爆炸','普攻第三段命中后短暂延迟再爆炸','The third stage of your basic combo triggers a delayed blast','通常攻撃の3撃目が当たると、少し遅れて爆発する'],
  gravefire:['擊倒敵人時喺原地引發火爆','击倒敌人时在原地引发火焰爆炸','Defeated enemies erupt in flame','敵を倒すと、その場で炎がはじける'],
  bloodoil:['神器技能變強，接技會消耗少量生命','神器技能变强，连招会消耗少量生命','Relic skills hit harder and follow-ups cost a little health','神器スキルが強くなるが、連携技でHPを消費する'],
  static:['接技會引來落雷，雷電可跳去附近敵人','连招会引来落雷，雷电可跳到附近敌人','Follow-ups call lightning that can jump to a nearby enemy','連携技で落雷し、近くの敵にも伝わる'],
  sunder:['普攻第三段打破護盾時引來落雷','普攻第三段打破护盾时引来落雷','Breaking a shield on the third combo stage calls down lightning','通常攻撃の3撃目で盾を壊すと、雷が落ちる'],
  aftertone:['接技成功會縮短神器技能剩餘冷卻','连招成功会缩短神器技能剩余冷却','A successful follow-up reduces the remaining relic cooldown','連携技が決まると、スキルの待ち時間が短くなる'],
  afterstep:['翻滾夠遠會喺沿途留下刀風傷敵','翻滚足够远会在沿途留下刀风伤敌','A long roll leaves a trail of cutting wind','長く回避すると、通り道に敵を斬る風を残す'],
  reflex:['普攻第三段命中會縮短翻滾剩餘冷卻','普攻第三段命中会缩短翻滚剩余冷却','A hit on the third combo stage reduces the remaining roll cooldown','通常攻撃の3撃目が当たると、回避の待ち時間が短くなる'],
  swiftcut:['普攻更快，第三段傷害提高','普攻更快，第三段伤害提高','Basic attacks are faster and the third stage hits harder','通常攻撃が速くなり、3撃目が強くなる'],
  suture:['受擊至低生命時會回血並披上冰甲','受击至低生命值时会回血并披上冰甲','Taking damage at low health heals you and grants ice armor','被弾でHPが少なくなると、回復して氷の鎧をまとう'],
  iceheart:['接技護甲擋下一擊時放出冰刺，減慢附近敵人','连招护甲挡下一击时放出冰刺，减慢附近敌人','Follow-up armor releases slowing ice spikes when it blocks a hit','連携技の鎧で攻撃を防ぐと、氷のとげで近くの敵を遅くする'],
  votive:['護甲擋下一擊時回血','护甲挡下一击时回血','Armor restores health when it blocks a hit','鎧で攻撃を防ぐとHPが回復する'],
});
export const blessingSummary=blessing=>blessings[blessing.id]??(blessing.awakened?t(blessing.detail):augments[blessing.augment]??t(blessing.detail));

const blessingConditions=localized({
  ashbrand:['每次連段只喺第三段首次命中時觸發。','每次连段只在第三段首次命中时触发。','Triggers on the first hit of the third stage in each combo.','各連撃で3撃目が最初に当たったときに発動します。'],
  gravefire:['火爆有獨立冷卻。','火焰爆炸有独立冷却。','The burst has its own cooldown.','炎がはじける効果には、独立した待ち時間があります。'],
  bloodoil:['接技消耗生命時，至少會留低 1 點。','连招消耗生命时，至少会保留 1 点。','Follow-ups leave you with at least 1 health.','HPが1未満になることはありません。'],
  suture:['受擊後生命少於 25% 時觸發，每層一次。','受击后生命低于 25% 时触发，每层一次。','Triggers when a hit leaves you below 25% health, once per floor.','ダメージを受けてHPが25％未満になったとき、1階につき1回発動します。'],
  votive:['回血有獨立冷卻。','回血有独立冷却。','The heal has its own cooldown.','回復には独立した待ち時間があります。'],
});
export const blessingDetails=blessing=>blessingConditions[blessing.id]??'';

export function effectDetails(...blocks){
  const details=document.createElement('details');
  details.className='effect-details';
  const summary=document.createElement('summary');
  summary.textContent=local('詳細效果','详细效果','Detailed effects','詳しい効果');
  details.append(summary,...blocks);
  return details;
}

const breakTargets=localized({
  55:['鎖柱','锁柱','locking pillars','錠柱'],
  80:['菌核','菌核','fungal cores','菌核'],
});
const baitTargets=localized({
  70:['銅鏡','铜镜','mirrors','銅鏡'],
  95:['刑碑','刑碑','execution stones','処刑碑'],
});
const actions={
  break:(n,seconds,floor)=>{
    const target=breakTargets[floor]??local('封印','封印','seals','封印');
    return local(`打碎 ${n} 個${target}。可用普攻，亦可借場地反制。`,`击碎 ${n} 个${target}。可用普攻，或借助场地反制。`,
      `Break ${n} ${target} with basic attacks or an arena counter.`,`${target}を${n}つ壊す。通常攻撃と地形を使った反撃が有効です。`);
  },
  light:n=>local(`行近 ${n} 盞祭燈，逐盞按 E 或手機互動掣點亮。`,`走近 ${n} 盏祭灯，逐盏按 E 或手机互动键点亮。`,`Approach each of the ${n} ritual lamps and press E or tap Interact to light it.`,`祭灯に近づき、Eキーか画面の操作ボタンで${n}基すべてに火を灯す。`),
  hold:(n,seconds,floor)=>{
    const green=floor===75;
    return local(`踏入 ${n} 道${green?'綠色':''}地面封印，各企定 ${seconds} 秒。翻滾時唔會充能。`,
      `踏入 ${n} 道${green?'绿色':''}地面封印，各站定 ${seconds} 秒。翻滚时不会充能。`,
      `Stand in each of the ${n} ${green?'green ':''}floor seals for ${seconds} seconds. Rolling pauses the charge.`,
      `床の${green?'緑色の':''}封印${n}か所に入り、それぞれ${seconds}秒とどまる。回避中はたまりません。`);
  },
  bait:(n,seconds,floor)=>{
    const target=baitTargets[floor]??local('機關','机关','traps','仕掛け');
    return local(`逐一企到 ${n} 個${target}上引招。紅圈鎖定後閃開，等頭目打中。`,
      `逐一站上 ${n} 个${target}引诱首领出招。红圈锁定后闪开，让首领击中它们。`,
      `Bait a strike from each of the ${n} ${target}. Dodge once the red circle locks so the boss hits it.`,
      `${target}${n}か所に順に立ち、赤い円が止まったら回避してボスに壊させる。`);
  },
};

const terrain=localized({
  5:['地面會裂開。繞過裂縫兩端，或者翻滾越過。','地面会裂开。绕过裂缝两端，或翻滚越过。','The ground cracks open. Go around the ends of the cracks or roll across.','床に亀裂が入る。端を回るか、回避で飛び越える。'],
  10:['躲喺石柱後面擋住飛羽。','躲在石柱后面挡住飞羽。','Take cover behind the pillars to block flying feathers.','石柱の陰に入り、飛んでくる羽根を防ぐ。'],
  15:['浸水會減速。行中間乾爽嘅地面。','涉水会减速。走中间干燥的地面。','Water slows you down. Cross through the dry center.','水の中では足が遅くなる。中央の乾いた床を通る。'],
  20:['中央會水浸。行兩邊較高嘅地面。','中央会被水淹。走两边较高的地面。','The center floods. Use the raised ground on either side.','中央は水につかる。左右の高い床を通る。'],
  25:['避開冰刺，行冰帶之間嘅空位。','避开冰刺，走冰带之间的空隙。','Avoid the ice spikes and move through the gaps between the icy strips.','氷のとげに触れないよう、氷の帯の間を通る。'],
  30:['繞過冰窟，借鐘座擋飛行攻擊。','绕过冰窟，借钟座挡住飞行攻击。','Circle around the ice pits and use the bell bases for cover.','氷の穴を外側から回り、鐘の台座で飛び道具を防ぐ。'],
  35:['避開熔岩裂縫，由火焰斷開嘅地方穿過。','避开熔岩裂缝，从火焰断开的地方穿过。','Stay off the lava cracks and cross through gaps in the flames.','溶岩の割れ目に入らず、炎が切れている場所を通る。'],
  40:['喺三個熔岩池之間嘅空位走。','沿三个熔岩池之间的空隙移动。','Move through the gaps between the three lava pools.','3つの溶岩だまりの間を通る。'],
  45:['熄燈後用墓柱認路，避開會纏住腳嘅絲線。','熄灯后用墓柱辨认路线，避开会缠脚的丝线。','Use the grave pillars as landmarks once the lights go out. Avoid the snaring threads.','灯りが消えたら墓柱を目印にし、足を取られる糸を避ける。'],
  50:['靠近繭會減速。沿中央嘅空位走。','靠近茧会减速。沿中央的空处移动。','Cocoon shadows slow you down. Keep to the open center.','繭の影では足が遅くなる。中央の空いた道を通る。'],
});

export function mechanismHint(phase){
  const action=actions[phase.mode];
  return action?action(phase.sites.length,phase.hold,phase.floor):terrain[phase.floor]??t(phase.hint);
}

const arenaCounterCopy=localized({
  75:[
    '蓄滿綠色淨印後，引頭目踏入已充滿嘅印。',
    '蓄满绿色净印后，引首领踏入已充满的印。',
    'Charge a green seal, then lure the boss onto it.',
    '緑色の封印を充填してから、ボスをその上に誘い込む。',
  ],
  100:[
    '引守夜者喺已解開嘅血印上斬擊。最後階段蓄滿命印後，再引佢踏入自己劈出嘅裂縫。',
    '引守夜者在已解开的血印上斩击。最终阶段蓄满命印后，再引它踏入自己劈出的裂缝。',
    'Lure the boss into using a cleave on an opened blood seal. In the final phase, charge the Life Seals, then lure the boss into a rift left by its own attack.',
    '解除済みの血の封印の上で、ボスに斬撃を出させよう。最終形態では命の封印を充填し、ボス自身が作った亀裂に誘い込もう。',
  ],
});

export function briefingLines(arena){
  const lines=[];
  for(const [index,phase] of [arena,arena?.last].entries()){
    if(!phase)continue;
    const name=index?local('第三階段','第三阶段','Phase 3','第3形態'):local('變身後','变身后','After transformation','変身後');
    lines.push([name,mechanismHint(phase)]);
  }
  if(!lines.length)lines.push([local('走位','走位','Movement','立ち回り'),
    local('睇準地面預警，離開紅色範圍。','看准地面预警，离开红色范围。','Watch the floor and leave red danger zones.','床の赤い予兆から離れる。')]);
  lines.push([local('場地反制','场地反制','Arena counter','地形で反撃'),
    arenaCounterCopy[arena?.floor]??local('企喺石柱後引衝撞，或者踏入銅鏡光圈反射。見紅線鎖定就向側邊閃。',
      '站在石柱后引首领撞柱，或踏进铜镜光圈反射。红线锁定后向侧面闪避。',
      'Bait a charge from behind a pillar or inside a mirror ring. Dodge sideways when the red line locks.',
      '石柱の後ろか銅鏡の光の中で攻撃を誘い、赤い線が止まったら横へ回避する。')]);
  return lines;
}

const progressLabels=localized({
  hold:['封印充能','封印充能','Seals charged','封印の解除'],
  light:['祭燈點亮','祭灯点亮','Lamps lit','点灯した祭灯'],
  bait:['已引招擊碎','已引招击碎','Traps broken','ボスに壊させた仕掛け'],
  break:['已摧毀封印','已摧毁封印','Seals broken','壊した封印'],
});
export const mechanismProgress=(mode,done,total,charge='')=>`${progressLabels[mode]} ${done}/${total}${charge}`;
