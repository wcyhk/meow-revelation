const modes=['defend','survive','circuit','search','defend','survive','circuit'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
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

export function planObjective(chapter,room) {
  if (room===0||room===5||room===9) return null;
  const slot=room<5?room-1:room-2;
  const type=modes[(slot+chapter*2)%modes.length];
  const side=(chapter+room)%2===0?-1:1;
  const variant=(chapter+room)%3;
  const xShift=variant===2?side*1.35:0;
  const zShift=variant===1?.7:0;
  const props=(points)=>points.map(([x,z,radius,style])=>monument(x*side+xShift,z+zShift,radius,style,side*.21));

  if (type==='defend') {
    const altar={x:xShift,z:1.5+zShift};
    const entrances=[
      {x:-7.8*side,z:-5.6},{x:7.8*side,z:-5.0},{x:-9.4*side,z:3.8},{x:9.4*side,z:4.7},
    ];
    const walls=variant===1
      ? [[-4.0,-.4,1.05,2],[4.0,-.4,1.02,1],[-1.4,-3.6,.90,3],[1.4,-3.6,.92,3]]
      : [[-2.5,-.75,1.16,2],[2.5,-.75,1.16,2],[-4.9,2.05,.87,1],[4.8,2.10,.87,1]];
    return {
      type,title:'守護祭燈',hint:variant===1?'堵住兩側通道，截住撲向祭燈嘅敵人。':'利用斷柱擋住飛彈，守住祭燈前嘅缺口。',
      altar,entrances,props:props(walls),duration:16+chapter*.85+variant*2,
      maxLight:83+chapter*13,interval:4.75+variant*.42,
    };
  }
  if (type==='survive') {
    const cover=variant===1
      ? [[-3,-2,1.13,3],[-2.7,2.0,1.09,3],[4.6,-3,1.2,1],[4.8,2.5,1.13,1]]
      : [[-4.1,2.7,1.13,2],[4.3,-1.8,1.18,3],[.1,-4.25,1.21,1]];
    return {
      type,title:'限時生存',hint:'時間到就會過關。繞柱走位，借石柱擋飛彈。',
      entrances:[{x:-8.9,z:-5.1},{x:8.9,z:-5.1},{x:9.4,z:3.5},{x:-9.4,z:4.5},{x:0,z:-5.9}],
      props:props(cover),duration:17+chapter*.9+variant*2,interval:4.9-variant*.28,
    };
  }
  if (type==='circuit') {
    const symbols=[['☽','◇','✦'],['♧','☉','△'],['✷','◉','♢']][variant];
    const turn=(chapter+room)%2===0?1:-1;
    return {
      type,title:'解開石閘',hint:'依照上方符號點亮符石。前兩枚正確，石閘就會打開。',
      gate:{x:0,z:-2.4+zShift,width:23.2,depth:.40},
      points:[
        {x:-5.7*turn,z:2.65+zShift,symbol:symbols[0]},
        {x:5.85*turn,z:1.36+zShift,symbol:symbols[1]},
        {x:1.4*side,z:-5.35+zShift,symbol:symbols[2]},
      ],
      props:props([[-2.2,1.2,.81,2],[2.6,3.05,.87,3],[-6.2,-.6,.92,1],[5.7,-4.2,.86,1]]),
    };
  }
  const [title1,record1,title2,record2]=relics[chapter];
  return {
    type,title:'尋找隱藏線索',
    hint:side===1?'先睇左邊斷柱後面，再去右上角。靠近時會見到殘頁發光。'
      :'先睇右邊斷柱後面，再去左上角。靠近時會見到殘頁發光。',
    points:[
      {x:-7.6*side,z:2.45+zShift,title:title1,record:record1},
      {x:7.1*side,z:-4.9+zShift,title:title2,record:record2},
    ],
    props:props([[-5.3,2.2,1.17,2],[4.65,-3.7,1.22,3],[.1,-1.6,.89,1]]),
  };
}

export class RoomObjective {
  constructor(game,plan) {
    this.game=game;
    this.plan=plan;
    this.remaining=plan.duration??0;
    this.light=plan.maxLight??0;
    this.progress=0;
    this.found=new Set();
    this.gateOpen=false;
    this.started=false;
    this.nextRaid=0;
    this.raid=0;
    this.notice='';
    this.noticeTime=0;
  }

  start() {
    this.started=true;
    this.game.objective(this.plan.hint);
    if (this.plan.entrances) this.spawnRaid();
  }

  tick(dt) {
    this.noticeTime=Math.max(0,this.noticeTime-dt);
    if (!this.plan.entrances) return;
    this.remaining=Math.max(0,this.remaining-dt);
    if (this.remaining<=0) {
      this.game.completeRoom(this.plan.type==='defend'?'祭燈已守住':'撐過了襲擊',true);
      return;
    }
    this.nextRaid-=dt;
    if (this.nextRaid<=0) this.spawnRaid();
  }

  spawnRaid() {
    const game=this.game;
    const {entrances,interval,type}=this.plan;
    const {chapter,room,zone}=game.stage;
    const count=Math.max(0,Math.min(7-game.enemies.length,2+Number(this.raid===0||chapter>=5)));
    for (let i=0;i<count;i++) {
      const point=entrances[(this.raid+i*(type==='defend'?1:2))%entrances.length];
      const kind=zone.foes[(room+this.raid+i*2)%zone.foes.length];
      const unit=game.spawn(kind,point.x,point.z);
      unit.raider=type==='defend' && (i===0||i===2||this.raid%3===1);
    }
    this.raid++;
    this.nextRaid=interval;
  }

  nearby() {
    if (!this.started||!this.plan.points) return -1;
    return this.plan.points.findIndex((point,index)=>!this.found.has(index)&&distance(this.game.hero,point)<1.66);
  }

  interact(index) {
    const {game,plan}=this;
    const point=plan.points[index];
    if (plan.type==='search') {
      this.found.add(index);
      this.progress=this.found.size;
      game.view.shock(point.x,point.z,0xffcc82,1.30,.42);
      game.showHiddenClue(point,this.progress===plan.points.length);
      return;
    }
    if (index!==this.progress) {
      this.progress=0;
      this.found.clear();
      this.gateOpen=false;
      this.notice='次序錯咗，符石已重置';
      this.noticeTime=2;
      game.audio.play('warning');
      return;
    }
    this.found.add(index);
    this.progress++;
    if (this.progress>=2) this.gateOpen=true;
    game.view.shock(point.x,point.z,0xb5ffdd,1.45,.46);
    game.audio.play('blessing');
    if (this.progress===plan.points.length) game.completeRoom('符石已全部點亮');
  }

  hurtLantern(amount) {
    if (!this.started||this.light<=0||this.game.state!=='play') return false;
    this.light=Math.max(0,this.light-amount*.69);
    const {x,z}=this.plan.altar;
    this.game.view.spark(x,.64,z,0xff8b60,12,.73);
    this.game.audio.play('warning');
    if (this.light===0) this.game.finish(false,'lantern');
    return true;
  }

  status() {
    const {plan}=this;
    if (plan.type==='defend') {
      return {text:'祭燈 '+Math.ceil(this.light)+' / '+plan.maxLight+' · '+Math.ceil(this.remaining)+' 秒',fill:this.light/plan.maxLight};
    }
    if (plan.type==='survive') return {text:'剩餘 '+Math.ceil(this.remaining)+' 秒',fill:this.remaining/plan.duration};
    if (plan.type==='circuit') {
      const symbols=plan.points.map((point,index)=>index<this.progress?'✓':point.symbol).join('  →  ');
      return {text:this.noticeTime>0?this.notice:symbols,fill:null};
    }
    const nearest=Math.min(...plan.points.filter((_,index)=>!this.found.has(index)).map(point=>distance(point,this.game.hero)));
    const hint=nearest<1.66?'可以調查':nearest<4.5?'附近有微光':'沿斷柱搵殘頁';
    return {text:'線索 '+this.progress+' / '+plan.points.length+' · '+hint,fill:null};
  }
}
