import {miracleDesigns} from './relic-miracle-data.mjs';

// Aim shape, baseline cooldown, and the four in-game locales for each awakening.
const entries = {
  'sam-in':['clones','self',11,['燈影分身','灯影分身','Lantern Doubles','灯影分身'],['喚出兩個雙倍體型嘅分身維持 5 秒，圍住最強敵人連斬。','召唤两个双倍体型的分身持续 5 秒，围住最强敌人连斩。','Two double-size copies hound the strongest foe for 5 seconds, striking repeatedly.','倍の大きさの分身を2体呼び、5秒間最も強い敵を追って連斬する。']],
  'lotus-fish':['prism','point',8,['三鏡照刑','三镜照刑','Mirror Tribunal','三鏡の裁き'],['三面浮鏡鎖定三角區域，交錯照射後向中心爆開。','三面浮镜锁定三角区域，交错照射后向中心爆开。','Three floating mirrors trace a triangle and converge in a blast at its center.','浮遊鏡が三角を描いて照射し、中央で光が炸裂する。']],
  'thunder-pearl':['capacitor','point',8,['拘雷接力','拘雷接力','Charged Relay','拘雷リレー'],['放出接力電球，沿不同敵人跳躍，每次換目標都會增傷。','放出接力电球，沿不同敌人跳跃，每次换目标都会增伤。','A charge jumps between distinct foes and grows stronger with each hop.','電撃球が別々の敵に跳び移り、跳ぶたびに威力が増す。']],
  'thunder-sword':['rail','line',7,['刻線回斬','刻线回斩','Aftershock Rail','刻線の返し'],['劃出一條導電線。短暫延遲後由遠端向你逐段爆返嚟。','划出一条导电线。短暂延迟后由远端向你逐段炸回来。','Etch a straight rail. Its shocks travel back toward you after a short delay.','導電線を刻む。短い間の後、先端から手前に向けて順に炸裂する。']],
  'han-spear':['tripwire','line',9,['埋針絆線','埋针绊线','Buried Tripwire','埋針の罠'],['喺前方埋下三道絆線，4 秒內有敵人踩過就會彈出針刃。','在前方埋下三道绊线，4 秒内被敌人踩中就弹出针刃。','Lay three tripwires ahead. Each springs once when an enemy crosses it within 4 seconds.','前方に罠を3本張る。4秒以内に敵が踏むと一度だけ針が飛び出す。']],
  'dragon-fish':['giant','self',13,['借鐘巨身','借钟巨身','Borrowed Giant','鐘の巨身'],['身體放大 2 倍維持 5 秒，普攻射程同傷害上升，變大時震退附近敵人。','身体放大 2 倍维持 5 秒，普攻射程和伤害提高，变大时震退附近敌人。','Double your size for 5 seconds, extend and strengthen basic attacks, and knock nearby foes back as you grow.','5秒間、体が倍になり通常攻撃の射程と威力が上がる。巨大化の瞬間に敵を吹き飛ばす。']],
  'seven-blade':['sweep','self',8,['圓函斷界','圆函断界','Full Circle Cleave','円函の全周斬'],['以自身為中心連斬四個象限，完整掃過 360 度並擊退敵人。','以自身为中心连斩四个象限，完整扫过 360 度并击退敌人。','Sweep all four quadrants in order for a full 360-degree cleave with knockback.','自分を中心に四方向を順に薙ぎ、全周の敵を吹き飛ばす。']],
  'true-seven':['fan','line',7,['七鋒開扇','七锋开扇','Sevenfold Fan','七鋒の扇'],['同時打開七道扇形地刃，同一敵人被多道重疊命中時只計一次。','同时展开七道扇形地刃，同一敌人被多道重叠命中时只算一次。','Open seven ground blades in a wide fan. Overlapping blades only hit a foe once.','地刃が7本同時に扇状に開く。複数の刃が重なっても一体につき一度だけ命中。']],
  goumang:['boss','point',14,['根契借將','根契借将','Call the Root Warden','根契の将を呼ぶ'],['召喚雙倍體型嘅糧簿山羊殘影，追住最強敵人連續衝撞。','召唤双倍体型的粮簿山羊残影，追着最强敌人连续冲撞。','Summon a double-size Ledger Goat echo that repeatedly charges the strongest foe.','倍の大きさの帳簿山羊の残影を召喚し、最も強い敵に繰り返し突進させる。']],
  'snow-doll':['possession','point',11,['未眠憑身','未眠凭身','Sleepless Possession','眠らぬ憑依'],['憑依瞄準範圍內一隻普通敵人，跟住佢移動一瞬，離體時向外震散。','凭依瞄准范围内一只普通敌人，跟着它移动片刻，离体时向外震散。','Possess an aimed regular foe, move with it briefly, then burst outward as you leave.','狙った通常敵に短時間憑依して一緒に移動し、離れる時に周囲を吹き飛ばす。']],
  'yama-cane':['charm','point',12,['墨契倒戈','墨契倒戈','Inkbound Defector','墨契の寝返り'],['令一隻普通敵人倒戈 5 秒，追住場上最強嘅敵人連打。','令一只普通敌人倒戈 5 秒，追着场上最强的敌人连打。','Turn one regular foe for 5 seconds, sending it after the strongest enemy.','通常敵を一体、5秒間寝返らせて最も強い敵を連続で攻撃させる。']],
  'cursed-cane':['rift','self',13,['翻頁歧途','翻页歧途','Page-Turn Detour','頁めくりの迷路'],['每個非頭目樓層可用一次，隨機前進或後退一層。頭目戰、練習場或已跳過嘅樓層會改放裂隙。跳關後繼續計排行榜。','每个非首领楼层可用一次，随机前进或后退一层。首领战、练习场或已跳过的楼层改为释放裂隙。跳关后继续计入排行榜。','Once per non-boss floor, jump one floor forward or back at random. Casts a rift in boss fights, in practice, or after this floor’s jump has been used. Runs stay eligible for the leaderboard.','ボス階以外では各階一度、ランダムに前後どちらかの階へ移動。ボス戦・練習・移動済みの階では裂け目を放つ。移動後もランキングの集計は続く。']],
  'blue-corporal':['freeze','point',10,['八封瞬凝','八封瞬凝','Flash Freeze Seal','八封の瞬間凍結'],['一聲碎冰凍結範圍內普通敵人，頭目只會減速。','一声碎冰冻结范围内普通敌人，首领只会减速。','A single flash freezes regular foes in the area and slows bosses.','一瞬で範囲内の通常敵を凍らせ、ボスの動きを遅くする。']],
  xuanming:['dam','line',9,['留寒截流','留寒截流','Glacial Dam','留寒の堰'],['喺瞄準點橫起冰牆擋飛彈，冰牆隨即向前推出一道碎冰波。','在瞄准点横起冰墙挡飞弹，冰墙随即向前推出一道碎冰波。','Block projectiles with a crosswise ice wall, then send a wave of ice forward.','狙った位置に氷壁を横向きに立てて飛び道具を防ぎ、前方へ氷片の波を放つ。']],
  'venom-cane':['infection','point',8,['追墨感染','追墨感染','Walking Blight','追い墨の感染'],['標記一隻敵人，毒墨會跟住佢走。目標倒地時，剩餘毒效傳到附近敵人。','标记一只敌人，毒墨跟着它移动。目标倒地时，剩余毒效传给附近敌人。','A poison mark follows a foe and transfers its remaining ticks nearby when the host falls.','毒の印が敵に付いて移動する。宿主が倒れると残りの毒が近くの敵へ移る。']],
  'skanda-kukri':['orbit','self',8,['蝕紙迴刃','蚀纸回刃','Corrosion Orbits','蝕紙の回刃'],['毒刃沿住你身邊轉兩圈，最後向瞄準方向飛出。轉圈時可以移動。','毒刃绕身两圈，最后向瞄准方向飞出。旋转时可以移动。','Poison blades circle you twice as you move, then fly in the aimed direction.','毒刃が移動する自分の周りを二周し、最後に狙った方向へ飛ぶ。']],
  'rushou-cane':['haste','self',10,['三葉乘風','三叶乘风','Threeleaf Tailwind','三葉の追い風'],['短暫加快移速同普攻，沿走過嘅路留下三枚延遲爆開嘅風印。','短暂加快移速和普攻，沿经过的路径留下三枚延迟炸开的风印。','Move and attack faster, leaving three delayed wind marks along your path.','移動と通常攻撃が速くなり、通った道に遅れて弾ける風印を3つ残す。']],
  'nether-halberd':['cyclone','line',9,['逆風提流','逆风提流','Updraft Hook','逆風の引き上げ'],['放出會向前走嘅旋風，沿路拖近敵人，末段將佢哋掃開。','放出向前行进的旋风，沿路拉近敌人，末段将其扫开。','Send a moving cyclone that draws foes in along its path and knocks them away at the end.','前進する竜巻が途中の敵を引き寄せ、終点で吹き飛ばす。']],
  'kali-wheel':['wheels','line',8,['雙輪夾擊','双轮夹击','Converging Wheels','双輪の挟撃'],['兩個實體電輪由兩側滾向同一落點，交會時重擊。','两个实体电轮从两侧滚向同一点，汇合时重击。','Two solid lightning wheels roll in from opposite sides and hit hard where they meet.','実体を持つ雷の輪が左右から転がり、交差地点で強打する。']],
  'spark-orb':['seekers','point',8,['四芯追電','四芯追电','Four Seeking Sparks','四芯の追雷'],['四枚雷珠先繞住你，再各自追向附近敵人並爆開。','四枚雷珠先绕身，再分别追向附近敌人并爆开。','Four sparks orbit you before seeking separate nearby foes and bursting on contact.','雷珠が4つ周りを旋回し、別々の近くの敵を追って爆ぜる。']],
  'shiva-trident':['cage','point',9,['三叉雷牢','三叉雷牢','Three-Prong Cage','三叉の雷牢'],['三根雷柱畫出三角牢，最後一道電流暈住牢內嘅普通敵人。','三根雷柱画出三角牢，最后一道电流击晕牢内的普通敌人。','Three lightning posts form a triangle. Its final discharge stuns regular foes inside.','雷柱3本が三角の牢を作り、最後の放電で内側の通常敵を気絶させる。']],
  'blood-sword':['siphon','point',9,['赤墨牽脈','赤墨牵脉','Red Ink Lifeline','赤墨の命綱'],['以血線扣住一隻敵人，維持距離就會逐次吸血，離得太遠血線會斷。','用血线拴住一只敌人，保持距离就会逐次吸血，离得太远血线会断。','Tether one foe and drain health over time. The tether breaks if you move too far away.','敵一体を血の糸でつなぎ、少しずつ体力を吸う。離れすぎると糸が切れる。']],
  taotie:['form','self',14,['吞契頭目化','吞契首领化','Devourer Form','契約喰らいの姿'],['變成頭目形態 4 秒，期間踏出三次全方位震擊，命中時回少量生命。','变成首领形态 4 秒，期间踏出三次全方位震击，命中时恢复少量生命。','Take on a boss form for 4 seconds. Three omnidirectional stomps restore some health on hit.','4秒間ボスの姿になり、全方向の踏みつけを3回繰り出す。命中で少量回復。']],
};

export const awakenings=Object.fromEntries([
  ...Object.entries(entries).map(([id,[kind,aim,cooldown,names,descriptions]])=>
    [id,{kind,aim,cooldown,name:names[0],detail:descriptions[0]}]),
  ...Object.entries(miracleDesigns).map(([id,[kind,aim,descriptions]])=>[id,{kind,aim,detail:descriptions[0],miracle:true}]),
]);
export const awakeningTranslations=Object.fromEntries([
  ...Object.values(entries).flatMap(([, , ,names,descriptions])=>[names,descriptions]),
  ...Object.values(miracleDesigns).map(([, ,descriptions])=>descriptions),
].map(([zh,...translations])=>[zh,translations]));

export const awakenedBoon=['共鳴時提升呢招嘅傷害。','共鸣时提高这招的伤害。','Resonance increases this skill’s damage.','共鳴するとこの技のダメージが上がる。'];
