const relics=[
  [
    "一張分糧票",
    "糧票明寫「代領」，印底卻藏住小燈嘅抵押指印。你一家當年以為只係領糧簽收。",
    "石柱下的畫",
    "石柱夾縫留住一張歪柄燈畫，筆觸同你守燈內嘅畫相同。小燈被帶走時曾從此經過。"
  ],
  [
    "浮標上的刻痕",
    "運送隊用水位記號對應囚名庫編號。記號喺實物燈牌上，能讓守燈照出被遮住嘅筆跡。",
    "濕透的告示",
    "告示指示運送隊保存失名者留言，以確認封印穩定。水道中重播嘅說話都係留聲。"
  ],
  [
    "半封送糧信",
    "運糧人寫住，冬糧已足夠，徵名隊仍然照舊入村。兩份命令蓋住同一套商印。",
    "霜下的腳印",
    "一行守衛腳印喺主印前停低，再沿運糧路返回。封印令佢每次都走同一段巡路。"
  ],
  [
    "裂開的印模",
    "圖紙注明，金屬只拓取控制紋；失名者嘅原名另送王座。裂開控制紋可以暫時鬆開守衛。",
    "煤灰中的字",
    "工匠寫住，空印可送去入口重鑄。未解除嘅咒紋要先磨平，先可以裝入器械。"
  ],
  [
    "墓邊的雙碗",
    "碗底刻住「等佢活着出庫」。隔壁墓列則擺住往生者生前用過嘅器皿，分別等候相認同送別。",
    "摺成花的名紙",
    "紙花上只餘一句「願你有名可葬」。守墓人把認出嘅面孔描喺碑冊，等歸名時核對。"
  ],
  [
    "鎖庫副匙",
    "匙柄寫住「收成已足，請開倉」。商會卻把副匙封入金庫，將存糧留待高價轉售。",
    "藏在秤底的欠據",
    "真正領糧單已結清，徵名隊手上嘅係後加嘅新欠據。四商會各持一份分帳副本。"
  ],
  [
    "燒焦的星圖",
    "星盤圈住嘅回退範圍止於林門。商會透過重結契印，讓守衛同運送路喺每輪恢復。",
    "修鐘人的手套",
    "手套刻住入口接線圖。司刻被釘喺主印嗰端，能拉回守燈，卻離唔開帳房去王座。"
  ],
  [
    "藏在根下的木片",
    "木片記住小燈嘅運送編號，同水道燈牌一致。童謠由沿途菌絲保存，真人仍未離開囚名庫。",
    "兩道巡邏爪痕",
    "兩種巨爪輪流護送名燈。無月封印下，原本一名守衛嘅出口會再加派一名。"
  ],
  [
    "玻璃背面的刻字",
    "晶石外殼刻住「宣誓留聲」。影像只重播七年前嗰段，不能聽到你嘅問題。",
    "無人簽名的證詞",
    "續約頁疊在原約上，只有四商會嘅印。守夜者同領糧人都冇喺續約頁簽署。"
  ],
  [
    "封蠟裏的指印",
    "封蠟底層有「晏燈」兩字，上層係七年來加入嘅續約商印。小燈嘅指印屬另一頁徵名單。",
    "鐘繩的結",
    "每個結對應名庫一戶人。鐘先解除主契，先前另簽嘅借力契印會在其後結算。"
  ]
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
