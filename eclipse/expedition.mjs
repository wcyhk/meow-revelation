import {stages as originalStory} from './campaign.mjs';
import {planObjective} from './objectives.mjs?v=battle-1';
import {chapterAttacks, enemies, regionalEnemies, wardens} from './bestiary.mjs?v=nightfall-1';

const districts = [
  {
    name:'緋石庭', picture:'grove.jpg', color:0xffb377, style:'leaves', hazard:'marked', boss:'赤楓鴞衛', frame:6,
    route:'糧倉外門｜碎印石徑｜楓井｜暮鼓道｜空籮坡｜紅紙祭場｜枯藤拱廊｜斷糧橋｜收簿台｜守簿之庭',
    signature:'赤羽落印',
    clue:originalStory[0].clue,
  },
  {
    name:'銀霧迴廊', picture:'fen.jpg', alternate:'lotus.jpg', color:0x8adbc8, style:'mist', hazard:'ring', boss:'沉蓮王妃', frame:9,
    route:'洗名水道｜苔瓶池｜落燈亭｜半浸碑林｜白花汀｜沉鐘橋｜浮藻階｜回音井｜潮牆｜沉蓮宮',
    signature:'回潮雙環',
    clue:originalStory[1].clue,
  },
  {
    name:'霜鐘嶺', picture:'frost.jpg', color:0xa6d4ff, style:'snow', hazard:'cross', boss:'霜鐘狐僧', frame:10,
    route:'霜駝道｜懸鈴棧｜白石藥房｜垂冰窟｜默雪中庭｜藍鐘坡｜巡寒台｜冰裂長廊｜斷索吊門｜雪鐘殿',
    signature:'裂冰十字',
    clue:{title:'守關人的回條',text:['冬糧已送到山下，商會仍把封印留在每一袋糧上。','回條說，名字落到霜鐘上便會結冰。只有收糧的人能打碎它。'],record:'封印留在每袋糧上，收糧時才生效。'},
  },
  {
    name:'熔星爐', picture:'forge.jpg', color:0xff7f49, style:'embers', hazard:'sweep', boss:'獄爐豬王', frame:11,
    route:'炭袋棚｜紅硫坡｜捶印道｜火星堆｜鐵門工房｜赤渣井｜銅模室｜裂焰堤｜重錘架｜獄爐心',
    signature:'熔鐵三擊',
    clue:{title:'商會的印模',text:['印模上刻的，是用來區分糧倉的印記。翻到背面，每個倉印之下都有一張陌生的臉。','工匠在地磚留下刻痕：送進爐裏的是名字，熔出來的是給王座的金屬。'],record:'商會把典當的名字鑄成供奉王座的金屬。'},
  },
  {
    name:'無聲塚', picture:'grave.jpg', color:0xcb9bec, style:'wisps', hazard:'prison', boss:'織碑夫人', frame:12,
    route:'紙傘墓道｜白蠟坳｜空碑台｜斷弦祠｜候名小院｜荊墓｜蝶燈崗｜石蛛梯｜裂紗門｜織碑室',
    signature:'葬紗四角',
    clue:{title:'一塊寫不完的碑',text:['墓上留了一行很淺的字：「她還活着，只是我想不起她的名字。」','旁邊有人放了兩雙碗筷。碗底畫着一盞小燈。'],record:'有人仍記得失名者的習慣，即使再也喊不出牠們的名字。'},
  },
  {
    name:'商會金庫', picture:'vault-gold.jpg', color:0xf4c17d, style:'dust', hazard:'barrage', boss:'鎖庫金黿', frame:13,
    route:'空秤廳｜帳房階｜雙匙廊｜封銀池｜換糧櫃｜鎖櫃巷｜欠據庫｜金漆棧｜重鑰橋｜黿背金庫',
    signature:'千鑰飛錢',
    clue:{title:'一袋無人領走的糧',text:['帳簿上的總數從未減少。饑荒結束後，商會把多餘的糧鎖在這裏，仍按月向村民收名字。','最後一欄寫着「王座維護」。每逢月蝕，數目就多一倍。'],record:'饑荒早已結束。商會延續契約，讓王座繼續吃進名字。'},
  },
  {
    name:'銅砂望臺', picture:'dunes.jpg', color:0xff9d6b, style:'sand', hazard:'pounce', boss:'銅砂蝕日者', frame:14,
    route:'風蝕街｜赤銅影壁｜沙漏台｜長影弧門｜午刻回階｜碎軌觀星室｜風砂堤｜斜月塔｜合蝕門｜蝕日儀頂',
    signature:'日輪合蝕',
    clue:{title:'倒行的星盤',text:['第一道月蝕本是天象。星盤卻記下七次人為改動，每次改動都把黑夜拉長一刻。','刻線的終點指向王座下方一口鐘。最後一位修鐘人被抹去名字。'],record:'商會令月蝕延長，歸名鐘的位置藏在星盤上。'},
  },
  {
    name:'夜菌林', picture:'fungus.jpg', color:0x7de7d9, style:'spores', hazard:'spiral', boss:'森眼菌鹿', frame:15,
    route:'幽根坡｜藍傘徑｜萎燈圃｜孢子湖｜青石根橋｜鏡菌畦｜露盞台｜暗林眼｜岔角碑｜菌鹿之巢',
    signature:'孢潮迴旋',
    clue:{title:'根下的童謠',text:['菌絲把一段聲音保存下來：「當有人叫返我個名，我就知邊度係屋企。」','你終於記起，家裏那盞總是歪着的燈，是妹妹小燈親手畫的。'],record:'小燈仍在等候。林裏留下了她曾說過的話。'},
  },
  {
    name:'黑月教堂', picture:'cathedral.jpg', alternate:'desecrated-cathedral.jpg', color:0xc2a6ff, style:'stars', hazard:'eclipse', boss:'黑月蛾冠', frame:16,
    route:'墜彩玻璃廊｜缺翼樓梯｜塵星步道｜鎖詠亭｜熄燭祭室｜翅粉穹門｜星縫｜黑玻璃台｜蛾燈階｜無月聖所',
    signature:'黑翼蔽月',
    clue:{title:'戴冠人的證詞',text:['「我當時只求救活孩子。他們說，只要有人戴上王冠保管名字，糧便會送到。」','證詞上的簽名被刮掉。筆尖卻在最後一頁壓出一道深深的鐘形。'],record:'守夜人起初是受困的代價，並非契約的主人。'},
  },
  {
    name:'落日王座', picture:'throne.jpg', alternate:'crimson-throne.jpg', color:0xff8060, style:'cinders', hazard:'sweep', boss:'王冠守夜者', frame:17,
    route:'祭火前階｜借名廳｜火照長路｜無人席｜封蠟走廊｜紅鐘壁｜暮禱天井｜萬名檔案｜最後一盞燈｜歸名王座',
    signature:'萬名之蝕',
    clue:originalStory[2].clue,
  },
];

export const pictures = [...new Set(districts.flatMap(({picture,alternate})=>alternate?[picture,alternate]:[picture]))];

const formations = [
  [[-3,-1],[3,-1],[0,-3],[-5,1],[5,1],[0,2]],
  [[-6,-2],[-2,-2],[2,-2],[6,-2],[-4,2],[4,2]],
  [[0,-5],[-3.8,-3],[3.8,-3],[-6,0],[6,0],[0,1]],
  [[-6,2],[-3,-1],[0,-4],[3,-1],[6,2],[0,1]],
  [[-5,-4],[5,-4],[0,-.5],[-5,1],[5,1],[0,-4]],
];
const structures = [
  [[-5.6,-2.7]],
  [[-3.3,-2],[3.2,-2]],
  [[0,-1.4],[-5.4,2.2],[5.7,-3.4]],
  [[-2.9,2.6],[2.8,-.1],[-2.6,-3.4]],
  [[-6.2,-1.5],[-6.3,2.6]],
  [[-4.9,-3.3],[4.3,-3],[0,2.2]],
  [[3.9,-3.2],[4.4,1.2]],
  [[-5.6,-3.6],[5.4,-3.8],[.4,-4.8]],
  [[-3.8,.5],[3.8,.7],[0,-3]],
];

function rng(seed) {
  return () => {
    seed = (Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  };
}

function makeRoom(zone, chapter, room, name) {
  const floor = chapter*10+room+1;
  const chapterBoss = room===9;
  const boss = chapterBoss || room===4;
  const guardian = boss ? (chapterBoss
    ? {...chapterAttacks[chapter],name:zone.boss,frame:zone.frame,signature:zone.signature,tint:zone.color}
    : wardens[chapter]) : null;
  const objective = planObjective(chapter,room);
  const draw = rng(floor*204731+7);
  const spawn = {x:room===0||boss?0:(draw()-.5)*4.8,z:7.05+(draw()-.5)*1.2};
  const patternIndex = (chapter*3+room)%zone.pattern.length;
  const hazard = boss ? null : room%3===0 ? zone.hazard : zone.pattern[(patternIndex+room)%zone.pattern.length];
  const props = [];
  if (!chapterBoss) {
    const layout=structures[room===0?0:1+(room-1+chapter*3)%8];
    const side=chapter%2===0?1:-1;
    for (const [index,[x,z]] of layout.entries()) {
      props.push({
        x:side*x+(draw()-.5)*1.35,z:z+(draw()-.5)*1.45,
        radius:.56+draw()*.34, style:(room+index+chapter)%4, angle:draw()*Math.PI*2,
      });
    }
  }
  const positions = formations[(room+chapter*2)%formations.length].map(([x,z])=>({
    x:x*(.86+draw()*.30)+(draw()-.5)*1.05,
    z:z+(draw()-.5)*1.48,
  }));
  const waves = [];
  if (boss) {
    if (!chapterBoss&&chapter>=2) waves.push([zone.foes[0],zone.foes[2]]);
    waves.push(chapter<2?['boss']:['boss',zone.foes[room%zone.foes.length],zone.foes[(room+2)%zone.foes.length]]);
  } else if (!objective) {
    const waveCount = room===5||room===8||(chapter>5&&room===3) ? 2 : 1;
    for (let wave=0;wave<waveCount;wave++) {
      const count=Math.min(6,3+(room+wave+chapter)%3+Number(chapter>=6));
      const foes = Array.from({length:count},(_,index)=>zone.foes[(index*3+room+wave*2+Math.floor(draw()*3))%zone.foes.length]);
      foes[0]=zone.foes[(room+chapter+wave)%zone.foes.length];
      if (floor===1) foes.splice(0,foes.length,'imp','imp','cultist');
      waves.push(foes);
    }
  }
  const clue = room===0 ? {
    x:chapter===0?.4:(chapter%2===0?1.5:-1.5),z:chapter===0?1.45:.7,
    action:'調查祭燈',...zone.clue,
  } : null;
  return {
    floor, chapter, room, name, zone, boss, chapterBoss, guardian, spawn, props:objective?.props??props, positions, waves, clue, objective,
    picture:zone.alternate&&(chapter>=8?room>=4:room%2!==0) ? zone.alternate : zone.picture,
    hazard:hazard==='summon'?'marked':hazard,
    enemyPattern:zone.pattern[patternIndex],
    bearing:draw()*Math.PI*2,
    lightShift:(draw()-.5)*.064,
    dread:Math.pow(floor/100,.92),
    pressure:1+(floor-1)*.021+(room%3)*.035,
    pace:1+(floor-1)*.0024+(room%4)*.024,
    damage:1+(floor-1)*.013,
  };
}

export const stages = districts.flatMap((district,chapter)=>{
  const zone={...district,foes:regionalEnemies[chapter],pattern:chapterAttacks[chapter].attacks,effect:chapterAttacks[chapter].effect};
  return zone.route.split('｜').map((name,room)=>makeRoom(zone,chapter,room,name));
});

export const patterns = {
  burst:'震地衝擊', pounce:'直線突襲', marked:'追身咒印', cross:'交叉封鎖',
  ring:'內外雙環', barrage:'扇面飛矢', sweep:'三路橫掃', prison:'四角圍陣',
  spiral:'迴旋彈幕', eclipse:'月蝕連環', summon:'守衛增援',
  cleave:'弧面連斬', icicles:'落冰連陣', cinders:'流火裂痕', web:'縛足蛛網',
  rally:'戰鼓鼓舞', feathers:'飛羽箭陣', roots:'盤根地棘', coins:'旋刃銅錢',
  blink:'移影伏擊', gravity:'潮汐牽引', lance:'貫穿長刺',
  jaws:'索魂雙顎',toll:'倒鐘內環',gravefan:'墓扇回剪',
};

export function enemySpec(stage, kind) {
  if (kind==='boss') {
    const {chapter,chapterBoss,guardian}=stage;
    const mode=stage.difficulty;
    return {
      ...guardian, height:chapterBoss?(chapter===9?5.9:4.6+chapter*.10):3.7+chapter*.12,
      hp:Math.round((chapterBoss?540+chapter*210:320+chapter*142)*(mode?.hp??1)), speed:(2.43+chapter*.13)*Math.sqrt(mode?.pace??1), reach:6+chapter*.18,
      radius:(chapterBoss?2.85:2.42)+chapter*.12, time:(1.08-chapter*.022)/Math.sqrt(mode?.pace??1), hurt:((chapterBoss?23:18)+chapter*3.2)*(mode?.damage??1),
      mass:4.7+chapter*.28, phases:chapterBoss&&chapter>=2?[.58,.25]:[.54],
    };
  }
  const type = enemies[kind];
  return {
    ...type, hp:Math.round(type.hp*stage.pressure), speed:type.speed*Math.sqrt(stage.pace),
    time:type.time/stage.pace, hurt:Math.round(type.hurt*stage.damage), radius:type.radius*(1+stage.room*.025),
  };
}
