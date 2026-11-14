const relics=[
  ['一張分糧票','一戶兩人簽收，名冊上只留一個名字。有人把另一個寫喺票背，摺埋收好。','石柱下的畫','小燈畫咗兩個人提燈返屋企。第二個人嘅面俾水化開，手上盞燈仲睇得見。'],
  ['浮標上的刻痕','洗名人用水位做記號。水退到第三格，漂走嘅名字會重新靠岸。','濕透的告示','告示教人向井裏喊名字。有回音嘅，就仲有人喺山下等佢。'],
  ['半封送糧信','運糧人話霜鐘每響一次，就會忘記一處停靠過嘅村落。','霜下的腳印','有一行腳印喺鐘前停低，轉身返去。留低嘅雪杖刻住三個孩子嘅身高。'],
  ['裂開的印模','印模入面有一條細裂痕。工匠特登留低佢，等一啲名字可以喺入爐之前漏走。','煤灰中的字','有人用炭喺牆上寫低：「火熔得掉印記，熔唔走熟人嘅聲。」'],
  ['墓邊的雙碗','墓碑下放住兩隻碗。一隻已經裂開，另一隻每日都有人洗乾淨再擺返原位。','摺成花的名紙','紙花上嘅字幾乎甩晒，仲睇得見一句：「我答應過，要同你食下一餐飯。」'],
  ['鎖庫副匙','匙柄背面刻住倉吏嘅一句話：「今冬有餘糧，記得開門。」旁邊有商會封蠟。','藏在秤底的欠據','欠據寫住村民欠商會一冬嘅糧。秤盤下面嘅暗格塞滿咗從來冇發出去嘅糧票。'],
  ['燒焦的星圖','星圖記咗一次本應完結嘅月蝕。墨線被人續落去，畫到第七次，筆尖斷咗。','修鐘人的手套','手套指尖磨到穿。縫入去嘅布寫住一句話：「聽到鐘聲，記得答應。」'],
  ['藏在根下的木片','樹根將一塊歪歪嘅木牌托返上嚟。小燈曾喺上面記低每日返屋企嘅路。','兩隻細腳印','一大一細兩行腳印疊住行。去到林邊，細嗰行停低等咗一陣。'],
  ['玻璃背面的刻字','彩玻璃背面刻住一串名字。每個名字隔住一道縫，月光照落去先讀得齊。','無人簽名的證詞','證詞末尾寫住：「我願意守住呢批名字，等佢哋有一日返屋企。」'],
  ['封蠟裏的指印','王座旁嘅封蠟疊咗七層。最底嗰層嘅指印細到一個孩子都可以摁出嚟。','鐘繩的結','繩上每個結都代表一戶人。最下面嗰個打成歪歪嘅燈形，小燈當年教過你點打。'],
];

function monument(x,z,radius,style,angle=0) {
  return {x,z,radius,style,angle};
}

export const fieldNotes=chapter=>relics[chapter];

export function planObjective(chapter,room) {
  const early=chapter%3===1?3:2;
  const late=chapter%3===2?6:7;
  if(room!==early&&!(chapter%2===1&&room===late))return null;
  const variant=(chapter+room+(room===late?1:0))%3;
  const side=(chapter+room)%2===0?-1:1;
  const x=variant===2?side*2.4:0;
  const z=variant===1?3.4:1.5;
  const layouts=[
    [[-2.5,-.75,1.12,2],[2.6,-.75,1.12,2],[-5,2,.83,1],[5.2,2,.83,1]],
    [[-4,-.4,1.05,2],[4,-.4,1.05,1],[-1.5,-3.7,.91,3],[1.5,-3.7,.91,3]],
    [[-4.4,3.1,.85,3],[4.7,-1.05,.93,1],[-1.3,-3.9,1.14,3],[1.6,4.8,.88,2]],
  ];
  const hints=[
    '守住斷柱中間嘅缺口。打近身嘅敵人可以將佢哋從祭燈引開。',
    '敵人會由兩翼夾擊。繞柱走位，截斷遠程射線。',
    '祭燈偏離中央。沿河岸截住兩批敵人，再返去守燈。',
  ];
  const entrances=variant===1
    ?[{x:-9.4,z:4.8},{x:9.4,z:4.8},{x:-7.3,z:-5.3},{x:7.3,z:-5.3}]
    :[{x:-7.8*side,z:-5.6},{x:7.8*side,z:-5.0},{x:-9.4*side,z:3.8},{x:9.4*side,z:4.7}];
  return {type:'defend',title:'守護祭燈',hint:hints[variant],variant,altar:{x,z},entrances,
    props:layouts[variant].map(([px,pz,radius,style])=>monument(px*side+x*.48,pz+z*.29,radius,style,side*.21)),
    duration:15+chapter*.85+variant*1.7,maxLight:88+chapter*13,interval:4.61+variant*.40};
}

export class RoomObjective {
  constructor(game,plan) {
    this.game=game;
    this.plan=plan;
    this.remaining=plan.duration??0;
    this.light=plan.maxLight??0;
    this.started=false;
    this.nextRaid=0;
    this.raid=0;
  }

  start() {
    this.started=true;
    this.game.objective(this.plan.hint);
    this.spawnRaid();
  }

  tick(dt) {
    this.remaining=Math.max(0,this.remaining-dt);
    if (this.remaining<=0) {
      this.game.completeRoom('祭燈已守住',true);
      return;
    }
    this.nextRaid-=dt;
    if (this.nextRaid<=0) this.spawnRaid();
  }

  spawnRaid() {
    const game=this.game;
    const {entrances,interval,variant}=this.plan;
    const {chapter,room,zone}=game.stage;
    const count=Math.max(0,Math.min(7-game.enemies.length,2+Number(this.raid===0||chapter>=5)));
    for (let i=0;i<count;i++) {
      const point=entrances[(this.raid+i*(variant===2?3:1))%entrances.length];
      const kind=zone.foes[(room+this.raid+i*2)%zone.foes.length];
      const unit=game.spawn(kind,point.x,point.z);
      unit.raider=i===0||i===2||this.raid%3===1;
    }
    this.raid++;
    this.nextRaid=interval;
  }

  hurtLantern(amount) {
    if (this.game.testRun||!this.started||this.light<=0||this.game.state!=='play') return false;
    this.light=Math.max(0,this.light-amount*.69);
    const {x,z}=this.plan.altar;
    this.game.view.spark(x,.64,z,0xff8b60,12,.73);
    this.game.audio.play('warning');
    if (this.light===0) this.game.finish(false,'lantern');
    return true;
  }

  status() {
    const {maxLight}=this.plan;
    return {text:'祭燈 '+Math.ceil(this.light)+' / '+maxLight+' · '+Math.ceil(this.remaining)+' 秒',fill:this.light/maxLight};
  }
}
