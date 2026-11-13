export const nightBlessings=[
  {id:'ashbrand',school:'fire',mark:'♨',name:'焦骨印',detail:'第三擊首次命中後，火印延遲爆開。'},
  {id:'gravefire',school:'fire',mark:'☄',name:'送葬火',detail:'擊倒敵人會留下短促火爆，有獨立冷卻。'},
  {id:'bloodoil',school:'fire',mark:'◆',name:'血油',detail:'提高神器技能傷害；每次接技消耗少量生命，最低留 1 點。'},
  {id:'static',school:'thunder',mark:'ϟ',name:'雷線',detail:'接技會向命中點放電，附近有另一個敵人時會跳過去。'},
  {id:'sunder',school:'thunder',mark:'◇',name:'裂鎧雷',detail:'第三擊真係破盾時，再落一道雷。'},
  {id:'aftertone',school:'thunder',mark:'✧',name:'返響',detail:'成功接技會退回部分技能冷卻。'},
  {id:'afterstep',school:'wind',mark:'»',name:'刃影步',detail:'翻滾走夠距離，會喺路線留下傷敵刀風。'},
  {id:'reflex',school:'wind',mark:'≋',name:'獵風',detail:'第三擊命中時，退回部分翻滾冷卻。'},
  {id:'swiftcut',school:'wind',mark:'✦',name:'薄刃',detail:'提高普攻出手速度及第三擊傷害。'},
  {id:'suture',school:'ward',mark:'❖',name:'續命縫',detail:'每關一次，受擊後血量不足四分之一會回一口血並獲得短暫冰甲。'},
  {id:'iceheart',school:'ward',mark:'❋',name:'寒心',detail:'接技護甲擋住攻擊時，向四周釋放冰刺，減慢附近敵人。'},
  {id:'votive',school:'ward',mark:'✚',name:'祈骨',detail:'護甲成功擋下一擊時回復生命，有獨立冷卻。'},
];

export const seals=[
  {id:'fireline',needs:['ashbrand','static'],name:'焚血雷印',ink:'#ffc08d',detail:'接技電弧喺第二個目標腳下引爆。'},
  {id:'burialwind',needs:['gravefire','afterstep'],name:'墓風送火',ink:'#fac09e',detail:'翻滾刀風附帶落點火爆。'},
  {id:'shatter',needs:['sunder','iceheart'],name:'凝雷碎甲',ink:'#c4f4ff',detail:'第三擊破盾嘅雷電會冰封附近小怪。'},
  {id:'pilgrim',needs:['reflex','votive'],name:'白幕逆步',ink:'#c5efd2',detail:'接技即回少量生命，並重置翻滾冷卻。'},
];

export const hasSeal=(hero,id)=>hero.seals?.has(id);
const get=(game,id)=>game.ranks?.get(id)??0;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const point=({x,z},y)=>({x,y,z});
const valid=(game,unit)=>unit.hp>0&&unit.age>=.23&&unit.phaseGuard<=0&&!(game.bossArena?.boss===unit&&game.bossArena.locked);
const curve=n=>1+Math.min(.75,(n-1)*.14);

function area(game,center,radius,hit) {
  for (const foe of game.enemies) if (valid(game,foe)&&distance(foe,center)<radius+(foe.kind==='boss'?.49:0)) hit(foe);
}

function closest(game,center,range,except) {
  let next;
  area(game,center,range,foe=>{
    if (foe===except) return;
    const gap=distance(foe,center);
    if (gap<range) {range=gap;next=foe;}
  });
  return next;
}

function burst(game,at,radius,tint,effect,damage,force=.62,after) {
  game.view.threatImpact({...at,kind:'circle',radius,tint,effect,pattern:effect==='ice'?'icicles':'burst'});
  area(game,at,radius,foe=>{if(game.hit(foe,damage,at,force,tint,'light',undefined,'blessing')) after?.(foe);});
}

function freeze(foe,time) {
  if(foe.hp<=0||foe.phaseGuard>0)return;
  foe.chill=Math.max(foe.chill,1.95);
  if(foe.kind==='boss')return;
  foe.frozen=Math.max(foe.frozen??0,time);
  if(foe.attack)foe.attack.interrupted=true;
  foe.attack=foe.motion=null;
}

export function giftFinisher(game,strike,unit,kind) {
  const h=game.hero;
  const p={x:unit.x,z:unit.z};
  if(!strike.giftHit){
    strike.giftHit=true;
    const fire=get(game,'ashbrand'),wind=get(game,'reflex');
    if(wind)h.rollCool=Math.max(0,h.rollCool-(.24+.035*Math.min(5,wind-1)));
    if(fire){
      game.view.sealFx(p.x,p.z,0xff8b59,1.05,.35);
      game.schedule(.26,()=>burst(game,p,1.64,0xff8b59,'fire',h.damage*.52*curve(fire)));
    }
  }
  const thunder=get(game,'sunder');
  if(kind!=='break'||!thunder||strike.giftBreak)return;
  strike.giftBreak=true;
  game.schedule(.14,()=>{
    game.view.bolt(point(p,4.8),point(p,.43),0xafdbff,1.67);
    if(valid(game,unit)&&distance(unit,p)<2.8)game.hit(unit,h.damage*.74*curve(thunder),p,.67,0xafdbff,'light',undefined,'blessing');
    if(hasSeal(h,'shatter'))burst(game,p,2.12,0xc4f8ff,'ice',h.damage*.34,.40,foe=>freeze(foe,.72));
  });
}

export function giftCast(game,link) {
  const h=game.hero;
  const blood=get(game,'bloodoil'),refund=get(game,'aftertone'),spark=get(game,'static');
  if(blood)h.hp=Math.max(1,h.hp-h.maxHp*(.023+Math.min(5,blood-1)*.003));
  if(refund)h.spellCool=Math.max(h.spellTime*.64,h.spellCool-(.66+Math.min(5,refund-1)*.15));
  if(hasSeal(h,'pilgrim')){h.hp=Math.min(h.maxHp,h.hp+h.maxHp*.045);h.rollCool=0;}
  if(!spark)return;
  const mark=link.contacts[0],p={x:mark.x,z:mark.z};
  game.schedule(.19,()=>{
    const unit=valid(game,mark.unit)&&distance(mark.unit,p)<2.2?mark.unit:closest(game,p,1.9);
    const origin=unit?{x:unit.x,z:unit.z}:p;
    game.view.bolt(point(origin,5.5),point(origin,.51),0xb0e5ff,1.75);
    if(unit)game.hit(unit,h.spellDamage*.38*curve(spark),p,.42,0xb0e5ff,'light',undefined,'blessing');
    const next=closest(game,origin,3.45,unit);
    if(!next)return;
    game.view.bolt(point(origin,.71),point(next,.56),0x9bd8ff,1.40);
    game.hit(next,h.spellDamage*.35*curve(spark),origin,.42,0xb0e5ff,'light',undefined,'blessing');
    if(hasSeal(h,'fireline'))burst(game,{x:next.x,z:next.z},1.72,0xffa05e,'fire',h.spellDamage*.49);
  });
}

export function giftRoll(game,from) {
  const h=game.hero,n=get(game,'afterstep');
  const gap=distance(from,h);
  if(!n||gap<1.80)return;
  const dx=(h.x-from.x)/gap,dz=(h.z-from.z)/gap;
  game.view.motion.rush(from,h,0xc9e6b6);
  game.view.wave(from.x,from.z,dx,dz,gap,0xc9e6b6,true);
  for(const unit of game.enemies){
    if(!valid(game,unit))continue;
    const x=unit.x-from.x,z=unit.z-from.z,p=x*dx+z*dz;
    if(p>=0&&p<=gap+.36&&Math.abs(-x*dz+z*dx)<.77)game.hit(unit,h.damage*.62*curve(n),from,.61,0xc9e6b6,'light',undefined,'blessing');
  }
  if(hasSeal(h,'burialwind'))burst(game,{x:h.x,z:h.z},2.15,0xff8d64,'fire',h.damage*.60);
}

export function giftKill(game,unit) {
  const h=game.hero,n=get(game,'gravefire');
  if(!n||game.t<(h.gravefireAt??0))return;
  h.gravefireAt=game.t+1.68;
  const p={x:unit.x,z:unit.z};
  game.schedule(.22,()=>burst(game,p,1.78,0xd76a72,'fire',h.damage*.61*curve(n)));
}

export function giftHurt(game,guarded,barrier) {
  const h=game.hero,n=get(game,'suture'),heal=get(game,'votive'),cold=get(game,'iceheart');
  if(h.hp<=0)return;
  if(n&&!h.sutureUsed&&h.hp<h.maxHp*.25){
    h.sutureUsed=true;
    h.hp=Math.min(h.maxHp,h.hp+h.maxHp*(.12+Math.min(5,n-1)*.013));
    h.ward=Math.max(h.ward,1.15);
    game.view.sealFx(h.x,h.z,0xffcca9,1.55,.51);
  }
  if(heal&&(guarded||barrier)&&game.t>=(h.votiveAt??0)){
    h.votiveAt=game.t+3.1;
    h.hp=Math.min(h.maxHp,h.hp+h.maxHp*.045*curve(heal));
  }
  if(cold&&barrier)burst(game,{x:h.x,z:h.z},2.16,0xa8f7f0,'ice',h.damage*.53*curve(cold),.73,foe=>{foe.chill=Math.max(foe.chill,2.15);});
}
