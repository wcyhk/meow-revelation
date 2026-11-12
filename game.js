
"use strict";

const $=id=>document.getElementById(id);
const stage=$("stage"),modal=$("modal");
const attackButton=document.querySelector('[data-input="attack"]');
const dashButton=document.querySelector('[data-input="dash"]');
const castButton=document.querySelector('[data-input="cast"]');
const equipmentButton=document.querySelector('[data-input="equipment"]');
const flaskButton=document.querySelector('[data-input="flask"]');
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)");
const keyboard=new Set();
const surveyButton=$("survey");
const movement={w:[0,-1],a:[-1,0],s:[0,1],d:[1,0],arrowup:[0,-1],arrowleft:[-1,0],arrowdown:[0,1],arrowright:[1,0]};
const stations={
  forge:{title:"黑鬚鐵匠",icon:"✦",x:.23,y:.49},
  gate:{title:"潮汐門",icon:"☾",x:.50,y:.30},
  lamp:{title:"守燈人",icon:"◈",x:.77,y:.49},
  garden:{title:"村落膳堂",icon:"❧",x:.24,y:.73},
  guild:{title:"潮燈商會",icon:"印",x:.50,y:.87},
  shrine:{title:"集會祭壇",icon:"✧",x:.76,y:.73},
};
let currentScene,state,press=null,heldAttack=null,destination=null,toastTimer,dialogKind="",uiTimer=0;
let started=false;
let surveyMode=false,viewDrag=null;
let threeEnabled=true;
try{threeEnabled=localStorage.getItem("nine-tides-light")!=="low";}catch{}
let storyPage=0,selectedPlan,trialMode=false,returnToExpedition=false;
const loadout={weapon:"",ally:""};
const village=readVillage();
const worldHeight=720;
const worldWidth=()=>Math.max(330,Math.round(worldHeight*stage.clientWidth/Math.max(1,stage.clientHeight)));
const viewportWidth=()=>Math.min(2300,worldWidth());

function toast(message,duration=3){
  const el=$("toast");
  clearTimeout(toastTimer);
  el.textContent=message;el.hidden=!message;
  if(message)toastTimer=setTimeout(()=>el.hidden=true,duration*1000);
}
function dismiss(){
  modal.hidden=true;modal.innerHTML="";dialogKind="";
  clearInput();
}
function panel(kind,title,html){
  dialogKind=kind;clearInput();
  modal.dataset.kind=kind;
  modal.innerHTML='<section class="panel" role="dialog" aria-modal="true" aria-label="'+title+'"><h2>'+title+'</h2>'+html+'</section>';
  modal.hidden=false;
  modal.querySelector("button:not(:disabled)")?.focus({preventScroll:true});
}
function hud(){
  const p=state.player,r=state.run;
  const hp=Math.max(0,p.hp);
  const hearts=$("hearts");
  if(hearts.dataset.value!==hp+"/"+p.maxHp){
    hearts.dataset.value=hp+"/"+p.maxHp;
    hearts.setAttribute("aria-label","生命 "+hp+"／"+p.maxHp);
    hearts.innerHTML=Array.from({length:p.maxHp},(_,i)=>'<span aria-hidden="true" class="'+(i<hp?"alive":"")+'">♥</span>').join("");
  }
  const inVillage=state.location==="village";
  surveyButton.hidden=!inVillage||!currentScene.world3d?.active;
  const villageHud=$("village-stats");
  villageHud.hidden=!inVillage;
  if(inVillage){
    const summary=[
      ["第 "+village.day+" 日","☾"],["居民 "+(1+village.rescued),"♙"],
      ["糧食 "+village.food,"❧"],["飢餓 "+village.hunger+"%","◔"],["信仰 "+village.faith+"%","✧"],
    ];
    const markup=summary.map(([label,icon])=>'<span><i aria-hidden="true">'+icon+'</i>'+label+'</span>').join("");
    if(villageHud.innerHTML!==markup)villageHud.innerHTML=markup;
  }
  const fervor=$("fervor");
  fervor.hidden=inVillage;
  if(!inVillage){
    const level=Math.floor(p.fervor||0);
    if(fervor.dataset.value!==String(level)){
      fervor.dataset.value=String(level);fervor.setAttribute("aria-label","潮力 "+level+"／5");
      fervor.innerHTML=Array.from({length:5},(_,i)=>'<i class="'+(i<level?'full':'')+'"></i>').join("");
    }
  }
  const description=areas[state.location].name+(inVillage?"":"　"+r.depth+"／"+r.rooms);
  if($("room-name").textContent!==description)$("room-name").textContent=description;
  const balance="◈ "+(state.location==="village"?village.embers:r?.embers||0);
  if($("counter").textContent!==balance)$("counter").textContent=balance;
  if(state.phase==="fight"){
    dashButton.style.setProperty("--cooldown",(p.dashCd/r.dashWait*100).toFixed(0)+"%");
    castButton.style.setProperty("--cooldown",(p.castCd/r.castWait*100).toFixed(0)+"%");
    castButton.classList.toggle("empty",p.fervor<1);
    if(r.weaponSkill)equipmentButton.style.setProperty("--cooldown",(p.gearCd/r.weaponSkill.cd*100).toFixed(0)+"%");
    if($("flask-count").textContent!==String(village.flasks))$("flask-count").textContent=village.flasks;
    flaskButton.classList.toggle("empty",!village.flasks);
    flaskButton.setAttribute("aria-label","藥湯 "+village.flasks+" 瓶");
  }
  const boss=state.phase!=="result"&&state.enemies.find(isBoss);
  $("boss-meter").hidden=!boss;
  if(boss){
    $("boss-name").textContent=enemies[boss.kind].name;
    $("boss-fill").style.transform="scaleX("+boss.hp/boss.maxHp+")";
    $("boss-meter").dataset.phase=boss.enraged?"2":"1";
  }
}
function showArrival(name){
  const el=$("arrival");el.textContent=name;el.classList.remove("show");
  void el.offsetWidth;el.classList.add("show");
}
function room(location){
  setSurvey(false);
  $("game").dataset.location=location;
  dismiss();toast("");destination=null;
  $("stations").hidden=true;
  $("controls").hidden=false;
  const r=state.run,role=tradeRoles[r.profile.role],item=weaponOf(r.weapon);
  const weapon={...item,name:r.profile.forged?role.gear:item.name};
  const spell={name:role.skill,icon:role.icon};
  equipmentButton.hidden=!r.weaponSkill;
  if(!equipmentButton.hidden){
    equipmentButton.querySelector("span").textContent=r.weaponSkill.name;
    equipmentButton.setAttribute("aria-label",r.weaponSkill.name);
  }
  for(const [button,item] of [[attackButton,weapon],[castButton,spell]]){
    button.querySelector("i").textContent=item.icon;button.querySelector("span").textContent=item.name;
    button.setAttribute("aria-label",item.name);
  }
  currentScene.placeBackdrop(location);
  showArrival(areas[location].name);hud();
  CatAudio.scene(location==="entry"?"fight":location);
  if(r.convoy?.incident.leader&&r.depth===3)toast(charters[r.convoy.region].intro,4.5);
  else if(areas[location].guardian)toast(state.run.story.intro,4.5);
  else if(r.depth===1)toast(role.name+" · "+role.skill+(r.profile.ally?"　"+tradeMercenaries[r.profile.ally].name+"隨行":"")+(location==="entry"?(innerWidth<690?" · 拖動行走":" · WASD 移動"):""),5);
  else if(r.convoy&&r.depth===3)toast(r.convoy.incident.name+" · "+charters[r.convoy.region].npc+"喺路尾接應。",4);
}
function showVillage(first=false){
  returnToExpedition=false;
  setSurvey(false);
  $("game").dataset.location="village";
  dismiss();clearInput();
  state=new TideRun(currentScene.scale.width,worldHeight,village,callbacks);
  $("title").hidden=true;$("hud").hidden=false;$("controls").hidden=true;
  $("stations").hidden=false;
  $("stations").innerHTML=Object.entries(stations).map(([id,s])=>{
    const tip={gate:"準備出征",forge:"武器鍛造",lamp:"修復潮燈",garden:"煮食 · 農圃",shrine:"布道 · 祭儀",guild:"跑商 · 招募 · 委託"}[id];
    return '<button type="button" class="station" data-station="'+id+'" style="--x:'+(s.x*100)+'%;--y:'+(s.y*100)+'%"><i aria-hidden="true">'+s.icon+'</i><span><b>'+s.title+'</b><small>'+tip+'</small></span></button>';
  }).join("");
  currentScene.placeBackdrop("village");
  showArrival("潮燈村");hud();CatAudio.scene("village");
  toast(first?"守燈人：「門下嘅沉鐘響咗。帶盞燈返嚟。」":"潮燈 "+village.lamp+"／2 · 已救回 "+village.rescued+" 隻貓",4);
}
function forgeOrLamp(id){
  const isLamp=id==="lamp",level=village[id],max=isLamp?2:3,cost=(isLamp?4:5)+level*3;
  const guide=isLamp?"每修一盞潮燈，下次出征多一格生命。":"每次鍛造永久提高武器傷害 17%。";
  const line=isLamp?"守燈人":"黑鬚鐵匠";
  const label=level>=max?"已達最高等級":(isLamp?"修復":"鍛造")+" · "+cost+" 潮火";
  panel(id,line,'<p>'+guide+'</p><p class="small">等級 '+level+'／'+max+'　持有 '+village.embers+' 潮火</p><div class="actions"><button class="primary" data-upgrade="'+id+'" '+(level>=max||village.embers<cost?"disabled":"")+'>'+label+'</button>'+
    (!isLamp?'<button data-act="chapter-forge">專屬武器工坊</button>':'')+'<button data-act="close">返回</button></div>');
}
function loadoutPanel(){
  const story=chapters[selectedPlan.chapter];
  panel("loadout",story.title,'<p class="chapter-brief">'+story.brief+'</p>'+expeditionKit(selectedPlan,loadout)+
    (village.ending?'<button class="oath" data-act="trial" aria-pressed="'+trialMode+'">☾ '+(trialMode?"黑潮誓約已啟用":"啟用黑潮誓約")+'<small>敵人生命 +35% · 出招加快</small></button>':'')+
    '<div class="actions"><button class="primary" data-act="depart">啟程</button><button data-act="map">返航圖</button></div>');
}
function chapterMap(){
  const pending=village.cleared===chapters.length&&!village.ending;
  panel("map","潮汐航圖",'<div class="chapter-map">'+chapters.map((story,i)=>{
    const open=i<=village.cleared,done=i<village.cleared,trial=village.trials&trialBit(i);
    const badge=trial?"黑潮誓約完成":done?"已得"+story.seal:open?"可出征":"尚未解鎖";
    return '<button class="chapter-card" data-chapter="'+i+'" '+(open?'':'disabled')+' style="--chapter-art:url(./'+areaArt(story.entry)+'.webp)">'+
      '<span><small>'+story.label+'</small><b>'+story.title+'</b><em>'+badge+'</em></span></button>';
  }).join("")+'</div><div class="actions">'+(pending?'<button class="primary" data-act="verdict">返回潮爐</button>':'')+
  '<button data-act="chapter-forge">武器工坊</button><button data-act="journal">旅程紀錄</button><button data-act="villagers">村民委託</button><button data-act="close">返村</button></div>');
}
function storyIntro(){
  const beat=prologue[storyPage];
  panel("story",beat.title,'<img class="story-art" src="./'+beat.art+'.webp" alt=""><p class="story-text">'+beat.text+'</p>'+
    '<div class="actions"><button class="primary" data-act="story-next">'+(storyPage===prologue.length-1?"進入潮燈村":"繼續")+'</button><button data-act="story-skip">返村</button></div>');
}
function journal(){
  panel("journal","旅程紀錄",'<ol class="ledger">'+chapters.map((story,i)=>
    '<li><b>'+story.label+' · '+story.title+'</b><span>'+(i<village.cleared?story.epilogue:i===village.cleared?story.brief:"未探索")+'</span></li>'
  ).join("")+'</ol><div class="actions"><button data-act="prologue">重看序章</button><button data-act="villagers">村民委託</button>'+
  (village.ending?'<button data-act="ending">重看結局</button>':'')+'<button data-act="map">返航圖</button></div>');
}
function villagerPanel(index){
  const resident=villagers[index];
  if(resident&&index<village.cleared){
    const complete=Boolean(village.favors&trialBit(index));
    panel("villager",resident.name+' · '+resident.role,'<p class="story-text">'+(complete?resident.thanks:resident.line)+'</p>'+
      (complete?'':'<p class="story-text">'+resident.task+'</p><p class="ending-note">回禮 '+resident.reward+'</p>')+
      '<div class="actions">'+(complete?'':'<button class="primary" data-favor="'+index+'" '+(resident.ready(village)?'':'disabled')+'>交付委託</button>')+
      '<button data-act="villagers">返回村民</button></div>');
    return;
  }
  const entries=villagers.slice(0,village.cleared);
  panel("villagers","村民委託",entries.length?
    '<div class="resident-list">'+entries.map((item,i)=>'<button data-resident="'+i+'"><i>'+item.icon+'</i><span><b>'+item.name+'</b><small>'+item.role+'</small></span><em>'+(village.favors&trialBit(i)?"已完成":item.ready(village)?"可交付":"進行中")+'</em></button>').join("")+'</div>'+
      '<div class="actions"><button data-act="journal">返回紀錄</button><button data-act="close">返村</button></div>':
    '<p>救到村民返嚟之後，可以喺呢度同佢哋傾偈。</p><div class="actions"><button data-act="journal">返回紀錄</button></div>');
}
function verdict(){
  panel("verdict","最後一爐潮火",'<img class="story-art" src="./temple.webp" alt=""><p class="story-text">'+chapters.at(-1).epilogue+'</p><div class="ending-choices">'+
    '<button data-ending="burn"><b>燒毀糧契</b><small>歸還所有被扣起嘅名字，熄滅最後一盞燈。</small></button>'+
    '<button data-ending="return"><b>贖回母親</b><small>用餘下嘅潮火，贖回母親尚未走完嘅日子。</small></button></div>');
}
function showEnding(){
  const end=endings[village.ending];
  panel("ending",end.title,'<img class="story-art" src="./'+end.art+'.webp" alt=""><p class="story-text">'+end.text+'</p>'+
    '<p class="ending-note">全章通關 · 潮汐航圖已開放黑潮誓約</p><div class="actions"><button class="primary" data-act="village">返回潮燈村</button></div>');
  CatAudio.scene("village");CatAudio.play("reward");
}
function villagePanel(id){
  const v=village;
  const button=(action,label,allowed,main=false)=>'<button '+(main?'class="primary" ':'')+'data-care="'+action+'" '+(allowed?'':'disabled')+'>'+label+'</button>';
  if(id==="garden"){
    const need=Math.min(4,1+Math.floor(v.rescued/3));
    const cost=4+v.garden*4;
    panel("garden","村落膳堂",
      '<div class="village-detail"><span>糧食 <b>'+v.food+'</b></span><span>飢餓 <b>'+v.hunger+'%</b></span><span>農圃 <b>'+v.garden+'／2</b></span><span>藥湯 <b>'+v.flasks+'／3</b></span></div>'+
      '<p>煮一餐可以減低飢餓、提升信仰。建好農圃後，每趟回村都會多收成。</p>'+
      '<div class="actions">'+button("feed","煮一餐 · "+need+" 糧食",v.food>=need&&v.hunger>0,true)+
      button("garden",v.garden>=2?"農圃已完成":(v.garden?"擴建農圃":"建造農圃")+" · "+cost+" 潮火",v.garden<2&&v.embers>=cost)+
      button("brew","煮藥湯 · 2 糧食",v.flasks<3&&v.food>=2)+'<button data-act="close">返回</button></div>');
  }else{
    panel("shrine","集會祭壇",
      '<div class="village-detail"><span>信仰 <b>'+v.faith+'%</b></span><span>供奉 <b>'+v.devotion+'</b></span></div>'+
      '<p>每日布道提升信仰。建好祭壇後，回村時會收到供奉，可用嚟為下一次出征加一格生命。</p>'+
      '<div class="actions">'+button("sermon",v.sermonDay===v.day?"今日已布道":"今日布道",v.sermonDay!==v.day,true)+
      (v.shrine?button("ritual",v.blessing?"下一趟已受祝福":"潮燈祭儀 · 4 供奉",v.devotion>=4&&!v.blessing):button("shrine","建造祭壇 · 6 潮火",v.embers>=6))+
      '<button data-act="close">返回</button></div>');
  }
}
function careVillage(action){
  if(state.phase!=="village")return;
  const v=village;
  if(action==="feed"){
    const need=Math.min(4,1+Math.floor(v.rescued/3));
    if(v.food<need||v.hunger<=0)return;
    v.food-=need;v.hunger=Math.max(0,v.hunger-34);v.faith=Math.min(100,v.faith+12);
  }else if(action==="brew"){
    if(v.flasks>=3||v.food<2)return;
    v.food-=2;v.flasks++;
  }else if(action==="garden"){
    const cost=4+v.garden*4;
    if(v.garden>=2||v.embers<cost)return;
    v.embers-=cost;v.garden++;v.food=Math.min(99,v.food+2);
  }else if(action==="sermon"){
    if(v.sermonDay===v.day)return;
    v.sermonDay=v.day;v.faith=Math.min(100,v.faith+13);v.devotion=Math.min(99,v.devotion+1);
  }else if(action==="shrine"){
    if(v.shrine||v.embers<6)return;
    v.embers-=6;v.shrine=1;v.devotion=Math.min(99,v.devotion+2);
  }else if(action==="ritual"){
    if(!v.shrine||v.blessing||v.devotion<4)return;
    v.devotion-=4;v.blessing=1;v.faith=Math.min(100,v.faith+7);
  }else return;
  writeVillage(v);hud();CatAudio.play("reward");
  villagePanel(["feed","garden","brew"].includes(action)?"garden":"shrine");
}
function chooseStation(id){
  if(!started||state.phase!=="village"||!modal.hidden)return;
  if(id==="gate"){chapterMap();return;}
  if(id==="guild"){tradePanel();return;}
  if(id==="garden"||id==="shrine"){villagePanel(id);return;}
  forgeOrLamp(id);
}
function upgrade(id){
  if(state.phase!=="village"||!["lamp","forge"].includes(id))return;
  const isLamp=id==="lamp",level=village[id],max=isLamp?2:3,cost=(isLamp?4:5)+level*3;
  if(level>=max||village.embers<cost)return;
  village.embers-=cost;village[id]++;
  if(isLamp){state.player.maxHp=4+village.lamp;state.player.hp=state.player.maxHp;}
  writeVillage(village);hud();CatAudio.play("reward");forgeOrLamp(id);
}
function reward(){
  const r=state.run;
  const line=r.depth===2&&(r.rescued||r.trade)?r.story.rescue:"潮水退去，地面留下三枚月印。";
  panel("reward","揀一枚月印",'<p>'+line+'</p><div class="choices moon-cards">'+state.offered.map(id=>{
    const g=gifts[id];
    return '<button class="moon-card" data-gift="'+id+'"><img alt="" src="./moon-'+id+'.webp"><span><b>'+g.name+'</b><small>'+g.detail+'</small></span></button>';
  }).join("")+'</div>');
}
function route(){
  const story=state.run.story;
  panel("route","揀下一道潮門",
    '<div class="path-origin"><span></span>'+areas[story.entry].name+'<span></span></div>'+
    '<div class="path-fork">'+story.paths.map(id=>
      '<button class="path-card" data-route="'+id+'"><img src="./'+areaArt(id)+'.webp" alt=""><span><b>'+areas[id].name+'</b><small>'+areas[id].hint+'</small></span></button>'
    ).join("")+'</div><div class="path-finish">'+(state.run.plan?'接應商隊':areas[story.boss].name)+'</div>');
}
function market(){
  const missing=state.player.maxHp-state.player.hp;
  const convoy=state.run.convoy;
  panel("market","潮市燈商",'<p>「三枚潮火換一口熱湯。過咗呢道門就到'+areas[state.run.story.boss].name+'。」</p>'+
    (convoy?'<p class="chapter-brief">'+charters[convoy.region].npc+'已經收起糧契。擊退頭目，商隊就可以入'+charters[convoy.region].port+'市集。</p>':'')+
    '<div class="village-detail"><span>潮火 <b>'+state.run.embers+'</b></span><span>生命 <b>'+state.player.hp+'／'+state.player.maxHp+'</b></span></div>'+
    '<div class="actions"><button data-act="market-heal" class="primary" '+(missing>0&&state.run.embers>=3?"":"disabled")+'>'+(!missing?"生命已滿":"飲湯 · 回復 2 格")+'</button>'+
    '<button data-act="market-next">進入巢穴</button></div>');
}
function result(won,earned){
  $("controls").hidden=true;CatAudio.scene("village");toast("");
  const r=state.run,last=r.chapter===chapters.length-1;
  if(r.trade){tradeResult(won,earned);return;}
  const seal=r.trial?"完成黑潮誓約":r.firstClear?"取得"+r.story.seal:"再次擊退"+enemies[areas[r.story.boss].guardian].name;
  const next=won&&r.firstClear&&!last?'<span>解鎖 <b>'+chapters[r.chapter+1].title+'</b></span>':'';
  panel(won?"victory":"result",won?seal:"被潮水捲走",
    '<p>'+(won?r.story.epilogue:"你醒返時已經喺岸邊。今趟帶返一半潮火。")+'</p>'+
    '<div class="village-detail"><span>帶回潮火 <b>'+earned+'</b></span><span>村民 <b>'+(1+village.rescued)+'</b></span>'+next+
    (won&&r.convoy?'<span>護送費 <b>'+r.tradePay+' 巨幣</b></span><span>抵達 <b>'+charters[r.convoy.region].port+'</b></span>':'')+'</div>'+
    '<div class="actions">'+(won&&last?'<button data-act="verdict" class="primary">走到潮爐前</button>':'')+
    (won&&r.convoy?'<button data-act="sell-cargo">前往市集</button>':'')+
    '<button data-act="village" '+(won&&last?'':'class="primary"')+'>返回潮燈村</button></div>');
  if(won)modal.querySelector(".panel").style.setProperty("--victory-art",'url("./'+(last?"temple":"home")+'.webp")');
}
const callbacks={room,hud,reward,route,convoy:convoyPanel,market,result,toast};
function pause(){
  if(!started||!modal.hidden)return;
  setSurvey(false);
  const available=currentScene.world3d&&!currentScene.world3d.lost;
  const graphics=available?'<button data-act="graphics" aria-pressed="'+threeEnabled+'">'+(threeEnabled?"切換省電畫面":"開啟立體畫面")+'</button>':'';
  panel("pause","暫停",'<p>電腦用 WASD 或方向鍵移動、左鍵或 F 攻擊、空白鍵翻滾、Q 職業技、E 武器技、R 藥湯。</p><p>手機拖動移動，點戰場或按住武器掣攻擊。</p><div class="actions"><button data-act="close" class="primary">繼續</button><button data-act="audio" aria-pressed="'+!CatAudio.muted+'">'+(CatAudio.muted?"開啟聲音":"關閉聲音")+'</button>'+graphics+(state.phase==="fight"?'<button data-act="retreat">撤回村落</button>':"")+'</div>');
}
function setSurvey(on){
  if(on&&(!currentScene?.world3d?.active||state?.phase!=="village"||!modal.hidden))return;
  if(surveyMode===on)return;
  surveyMode=on;
  clearInput();
  if(!on)currentScene.world3d?.resetOrbit();
  $("game").classList.toggle("surveying",on);
  $("survey-guide").hidden=!on;
  surveyButton.setAttribute("aria-pressed",String(on));
}
function applyGraphics(){
  const world=currentScene?.world3d;
  if(!world)return;
  world.setActive(threeEnabled);
  if(!world.active)setSurvey(false);
  if(started&&state)hud();
}
function clearInput(){
  keyboard.clear();press=null;heldAttack=null;destination=null;viewDrag=null;
  $("stick").hidden=true;
}
function begin(){
  if(started||!currentScene)return;
  CatAudio.unlock();started=true;
  showVillage(village.wins===0);
  continueOpening();
}
function continueOpening(){
  if(!village.trade.role||!village.trade.starter)originPanel();
  else if(!village.prologue)storyIntro();
  else if(village.cleared===chapters.length&&!village.ending)verdict();
  else dismiss();
}
$("start").addEventListener("click",begin);
$("pause").addEventListener("click",pause);
surveyButton.addEventListener("click",()=>setSurvey(!surveyMode));
$("stations").addEventListener("click",e=>{
  const id=e.target.closest("[data-station]")?.dataset.station;
  if(id)chooseStation(id);
});
modal.addEventListener("click",e=>{
  const b=e.target.closest("button");
  if(!b||b.disabled)return;
  const d=b.dataset;
  if(dialogKind==="origin"){
    if(d.originRole&&!village.trade.role&&applyTradeAction(village.trade,"role",d.originRole)){
      writeVillage(village);originPanel();
    }else if(d.originAlly&&enlistStarter(village.trade,d.originAlly)){
      writeVillage(village);continueOpening();
    }
    return;
  }
  if(d.act==="expedition-market"&&dialogKind==="loadout"){returnToExpedition=true;tradePanel("market");return;}
  if(d.act==="expedition-return"&&returnToExpedition){returnToExpedition=false;loadoutPanel();return;}
  if(d.act==="chapter-forge"&&["map","forge"].includes(dialogKind)){tradePanel("armory");return;}
  if(d.act==="sell-cargo"&&state.phase==="result"){showVillage();tradePanel("market");return;}
  if(d.tradePage&&state.phase==="village"&&dialogKind.startsWith("trade-")&&["routes","market","troops","armory","charter"].includes(d.tradePage)){
    tradePanel(d.tradePage);return;
  }
  if(d.tradeAction&&state.phase==="village"&&dialogKind.startsWith("trade-")){
    const hadRole=Boolean(village.trade.role);
    if(applyTradeAction(village.trade,d.tradeAction,d.tradeId)){
      writeVillage(village);CatAudio.play("door");tradePanel(hadRole?dialogKind.slice(6):"routes");
    }
    return;
  }
  if(d.tradeRoute&&dialogKind==="trade-routes"){state.departTrade(d.tradeRoute);return;}
  if(d.act==="trade-return"&&state.phase==="result"){showVillage();tradePanel();return;}
  if(d.gift){state.choose(d.gift);return;}
  if(d.route){state.takePath(d.route);return;}
  if(d.convoy){state.takeConvoy(d.convoy);return;}
  if(d.upgrade){upgrade(d.upgrade);return;}
  if(d.care){careVillage(d.care);return;}
  if(d.chapter!==undefined&&dialogKind==="map"){
    selectedPlan=expeditionPlan(village,Number(d.chapter));
    if(!selectedPlan){originPanel();return;}
    loadout.weapon=selectedPlan.role;loadout.ally=selectedPlan.roster[0]||"";
    trialMode=false;loadoutPanel();return;
  }
  if(d.resident!==undefined&&dialogKind==="villagers"){villagerPanel(Number(d.resident));return;}
  if(d.favor!==undefined&&dialogKind==="villager"){
    const i=Number(d.favor),resident=villagers[i],bit=trialBit(i);
    if(resident&&i<village.cleared&&!(village.favors&bit)&&resident.ready(village)){
      resident.claim(village);village.favors|=bit;writeVillage(village);hud();CatAudio.play("reward");
      villagerPanel(i);
    }
    return;
  }
  if(d.ending&&dialogKind==="verdict"&&Object.hasOwn(endings,d.ending)){
    village.ending=d.ending;writeVillage(village);showEnding();return;
  }
  if(d.kit&&dialogKind==="loadout"){
    if(d.kit==="weapon"&&selectedPlan.weapon.includes(d.item)||d.kit==="ally"&&(!d.item||selectedPlan.roster.includes(d.item))){
      loadout[d.kit]=d.item;
      for(const option of modal.querySelectorAll("[data-kit]"))option.setAttribute("aria-pressed",String(loadout[option.dataset.kit]===option.dataset.item));
      if(d.kit==="weapon")$("kit-weapon-detail").textContent=weaponDescription(d.item,village.trade);
      CatAudio.play("door");
    }
    return;
  }
  if(d.act==="depart"&&dialogKind==="loadout"){state.depart(selectedPlan,loadout.weapon,loadout.ally,trialMode);return;}
  if(d.act==="trial"&&dialogKind==="loadout"&&village.ending){trialMode=!trialMode;loadoutPanel();return;}
  if(d.act==="map"&&state.phase==="village"){chapterMap();return;}
  if(d.act==="journal"&&state.phase==="village"){journal();return;}
  if(d.act==="villagers"&&state.phase==="village"){villagerPanel();return;}
  if(d.act==="prologue"&&dialogKind==="journal"){storyPage=0;storyIntro();return;}
  if(d.act==="verdict"&&village.cleared===chapters.length){verdict();return;}
  if(d.act==="ending"&&village.ending){showEnding();return;}
  if(dialogKind==="story"&&(d.act==="story-next"||d.act==="story-skip")){
    if(d.act==="story-next"&&storyPage+1<prologue.length){storyPage++;storyIntro();return;}
    village.prologue=true;writeVillage(village);dismiss();return;
  }
  if(d.act==="market-heal"){state.leaveMarket(true);return;}
  if(d.act==="market-next"){state.leaveMarket(false);return;}
  if(d.act==="close")dismiss();
  if(d.act==="village")showVillage();
  if(d.act==="retreat"&&state.phase==="fight")state.finish(false);
  if(d.act==="graphics"&&dialogKind==="pause"){
    threeEnabled=!threeEnabled;
    try{localStorage.setItem("nine-tides-light",threeEnabled?"3d":"low");}catch{}
    applyGraphics();
    b.textContent=threeEnabled?"切換省電畫面":"開啟立體畫面";
    b.setAttribute("aria-pressed",String(threeEnabled));
    return;
  }
  if(d.act==="audio"){
    const enabled=CatAudio.toggle();
    b.textContent=enabled?"關閉聲音":"開啟聲音";
    b.setAttribute("aria-pressed",String(enabled));
  }
});
window.addEventListener("keydown",e=>{
  if(!started||e.altKey||e.metaKey||e.ctrlKey)return;
  const key=e.key.toLowerCase();
  if(surveyMode){
    if(key==="escape"||key==="c"){e.preventDefault();if(!e.repeat)setSurvey(false);}
    else if(movement[key]){e.preventDefault();keyboard.add(key);}
    return;
  }
  if(key==="escape"){
    if(returnToExpedition){returnToExpedition=false;loadoutPanel();}
    else if(dialogKind.startsWith("trade-")||["pause","forge","lamp","garden","shrine","loadout","map","journal","villagers","villager"].includes(dialogKind))dismiss();
    else pause();
    return;
  }
  if(!modal.hidden)return;
  if(key==="c"&&!e.repeat&&state.phase==="village"){setSurvey(true);return;}
  if(movement[key]){
    e.preventDefault();keyboard.add(key);return;
  }
  if(state.phase==="village"&&key==="e"&&!e.repeat){
    const closest=Object.entries(stations).sort(([,a],[,b])=>dist(state.player,{x:a.x*state.width,y:a.y*worldHeight})-dist(state.player,{x:b.x*state.width,y:b.y*worldHeight}))[0];
    chooseStation(closest[0]);return;
  }
  const action={f:"attack"," ":"dash",q:"cast",r:"flask",e:"equipment"}[key];
  if(action){e.preventDefault();keyboard.add(key);if(!e.repeat)state.input(action);}
});
window.addEventListener("keyup",e=>keyboard.delete(e.key.toLowerCase()));
window.addEventListener("blur",clearInput);
document.addEventListener("visibilitychange",clearInput);
for(const type of ["selectstart","dblclick","contextmenu"]){
  $("game").addEventListener(type,e=>e.preventDefault());
}
for(const type of ["gesturestart","gesturechange"]){
  $("game").addEventListener(type,e=>{if(modal.hidden)e.preventDefault();},{passive:false});
}
stage.addEventListener("pointerdown",e=>{
  if(!started||!modal.hidden||e.button!==0||press)return;
  if(surveyMode){
    if(!viewDrag){
      e.target.setPointerCapture?.(e.pointerId);
      viewDrag={id:e.pointerId,x:e.clientX,y:e.clientY};
    }
    return;
  }
  e.target.setPointerCapture?.(e.pointerId);
  if(e.pointerType==="mouse"&&state.phase==="fight"){
    heldAttack=e.pointerId;state.input("attack");return;
  }
  press={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,moved:false,mouse:e.pointerType==="mouse"};
  destination=null;
});
stage.addEventListener("pointermove",e=>{
  if(viewDrag?.id===e.pointerId){
    currentScene.world3d.orbit(e.clientX-viewDrag.x,e.clientY-viewDrag.y);
    viewDrag.x=e.clientX;viewDrag.y=e.clientY;
    return;
  }
  if(press?.id!==e.pointerId||press.mouse)return;
  const x=e.clientX-press.x,y=e.clientY-press.y,length=Math.hypot(x,y);
  press.moved ||= length>6;
  if(!press.moved)return;
  const amount=clamp((length-5)/23,0,1);
  const direction=unit(x,y);
  press.dx=direction.x*amount;press.dy=direction.y*amount;
  const stick=$("stick");
  stick.style.left=press.x+"px";stick.style.top=press.y+"px";
  stick.firstElementChild.style.transform="translate("+press.dx*25+"px,"+press.dy*25+"px)";
  stick.hidden=false;
});
function release(e){
  if(viewDrag?.id===e.pointerId){viewDrag=null;return;}
  if(heldAttack===e.pointerId)heldAttack=null;
  if(press?.id!==e.pointerId)return;
  if(e.type==="pointerup"&&!press.moved&&modal.hidden){
    if(state.phase==="fight")state.input("attack");
    else if(state.phase==="village"){
      const r=currentScene.game.canvas.getBoundingClientRect();
      destination={x:(e.clientX-r.left)/r.width*state.width,y:clamp((e.clientY-r.top)/r.height*worldHeight,worldHeight*.28,worldHeight*.87)};
    }
  }
  press=null;$("stick").hidden=true;
}
window.addEventListener("pointerup",release);
window.addEventListener("pointercancel",release);
for(const button of $("controls").querySelectorAll("button")){
  button.addEventListener("pointerdown",e=>{
    if(!modal.hidden||e.button!==0)return;
    e.preventDefault();
    if(button===attackButton){button.setPointerCapture(e.pointerId);heldAttack=e.pointerId;}
    state.input(button.dataset.input);
  });
  button.addEventListener("click",e=>{if(e.detail===0&&modal.hidden)state.input(button.dataset.input);});
  button.addEventListener("lostpointercapture",release);
}
function intent(){
  let x=0,y=0;
  for(const key of keyboard){
    if(movement[key]){x+=movement[key][0];y+=movement[key][1];}
  }
  if(x||y){destination=null;return unit(x,y);}
  if(press?.moved)return {x:press.dx,y:press.dy};
  if(destination&&state.phase==="village"){
    if(dist(state.player,destination)>8)return unit(destination.x-state.player.x,destination.y-state.player.y);
    destination=null;
  }
  return {x:0,y:0};
}

class ShoreScene extends Phaser.Scene{
  constructor(){super("shore");}
  preload(){
    for(const id of new Set(Object.keys(areas).map(areaArt)))this.load.image(id,"./"+id+".webp");
    this.load.spritesheet("cast","./cast.png",{frameWidth:256,frameHeight:256});
    this.load.spritesheet("tide-cast","./tide-cast.png",{frameWidth:256,frameHeight:256});
    this.load.spritesheet("regional-cast","./regional-cast.webp",{frameWidth:256,frameHeight:256});
    this.load.spritesheet("merc-cast","./merc-cast.webp",{frameWidth:256,frameHeight:256});
    this.load.spritesheet("village-props","./village-props.png",{frameWidth:232,frameHeight:232});
    this.load.on("loaderror",file=>{
      $("boot-status").textContent="資源載入失敗。請重新整理頁面。";
      console.error("Asset load failed",file.key);
    });
  }
  create(){
    currentScene=this;
    this.background=this.add.image(0,0,"village").setDepth(-2);
    this.ground=this.add.graphics().setDepth(0);
    this.front=this.add.graphics().setDepth(50);
    this.playerSprite=this.add.sprite(0,0,"cast",0).setOrigin(.5,.88);
    this.handSprite=this.add.image(0,0,"cast",0).setVisible(false);
    this.actorSprites=[];
    this.cinema=new ShoreCinema(this);
    this.placeBackdrop("village");
    const ready=[...Object.keys(areas).map(areaArt),"cast","tide-cast","regional-cast","merc-cast","village-props"].every(id=>this.textures.exists(id));
    if(!ready)return;
    installWeaponArt(this.textures);
    $("start").disabled=false;
    if(village.prologue)$("start").firstChild.nodeValue="繼續旅程 ";
    $("boot-status").textContent=innerWidth<690?"單手觸控可玩 · 點一下開始":"鍵盤與滑鼠 · 亦支援手機觸控";
    this.scale.on("resize",size=>{
      if(state)state.resize(size.width);
      if(this.world3d)this.world3d.width=0;
      this.placeBackdrop(state?.location||"village");
    });
    this.loadWorld();
  }
  async loadWorld(){
    try{
      const {MoonlightWorld}=await import("./world3d.mjs?v=caravan");
      this.world3d=MoonlightWorld.create(stage,this.game.canvas,
        key=>this.textures.get(key).getSourceImage(),shoreLights,applyGraphics);
      applyGraphics();
    }catch(error){
      console.warn("立體畫面載入失敗",error);
    }
  }
  placeBackdrop(place){
    const id=areaArt(place);
    this.background.setTexture(id);
    const frame=this.background.frame;
    const w=this.scale.width,h=this.scale.height;
    const scale=Math.max(w/frame.width,h/frame.height)*1.034;
    this.background.setScale(scale).setPosition(w/2,h/2);
    this.background.clearTint();
  }
  update(_,delta){
    if(!started||!state)return;
    const now=performance.now();
    const elapsed=this.frameAt===undefined?delta:now-this.frameAt;
    this.frameAt=now;
    const dt=Math.min(.10,elapsed/1000);
    this.visualTime=(this.visualTime||0)+dt;
    if(surveyMode){
      const {x,y}=intent();
      this.world3d.orbit(x*dt*143,y*dt*143);
    }
    if(modal.hidden&&!surveyMode){
      state.intent=intent();
      this.timeLeft=Math.min(.10,(this.timeLeft||0)+dt);
      while(this.timeLeft>=1/60){
        const previous=state;
        state.tick(1/60,heldAttack!==null||keyboard.has("f"));
        this.timeLeft-=1/60;
        if(state!==previous||!modal.hidden)break;
      }
    }else this.timeLeft=0;
    uiTimer-=dt;
    if(uiTimer<=0){uiTimer=.065;hud();}
    try{
      this.paint(dt);
    }catch(error){
      if(!this.world3d?.active)throw error;
      console.warn("立體畫面已切換至省電模式",error);
      this.world3d.setActive(false);
      setSurvey(false);hud();
      this.paint(dt);
    }
  }
  sprite(index){
    if(!this.actorSprites[index])this.actorSprites[index]=this.add.sprite(0,0,"cast",0).setOrigin(.5,.88);
    return this.actorSprites[index];
  }
  shadow(x,y,size){
    const g=this.ground;
    g.fillStyle(0x141526,.49).fillEllipse(x+4,y+5,size*.63,size*.21);
    g.fillStyle(0x100f1a,.68).fillEllipse(x,y+2,size*.39,size*.105);
  }
  paintSprite(sprite,actor,frame,pose,sheet,weapon){
    this.shadow(actor.x,actor.y,pose.width);
    if(sprite.texture.key!==sheet)sprite.setTexture(sheet,frame??undefined);
    else if(frame!==null)sprite.setFrame(frame);
    sprite.setVisible(true).setPosition(actor.x,actor.y-pose.lift).setDepth(10+actor.y*.02);
    sprite.setDisplaySize(pose.width,pose.height);
    sprite.setFlipX(pose.side<0).setRotation(pose.tilt);
    if(pose.hit)sprite.setTint(0xffd5ac).setTintMode(Phaser.TintModes.FILL);else sprite.clearTint();
    sprite.setAlpha(pose.alpha);
    if(weapon){
      const hand=this.handSprite;
      if(hand.texture.key!==weapon.key)hand.setTexture(weapon.key);
      hand.setVisible(true).setPosition(actor.x+weapon.x,actor.y-pose.lift+weapon.y).setDepth(sprite.depth+.001)
        .setDisplaySize(weapon.size,weapon.size).setFlipX(pose.side<0).setRotation(weapon.angle).setAlpha(pose.alpha);
    }
  }
  paint(dt){
    const b=state,p=b.player,g=this.ground,front=this.front,t=b.clock;
    const world=this.world3d?.active?this.world3d:null;
    this.background.setVisible(!world);
    g.clear();front.clear();
    const shake=reducedMotion.matches?0:b.shake;
    const sx=Math.sin(performance.now()*.066)*shake,sy=Math.cos(performance.now()*.071)*shake*.65;
    this.cameras.main.setScroll(sx,sy);
    this.cinema.prepare(b,this.visualTime||0,Boolean(world));
    if(world){
      world.begin(b,areaArt(b.location),this.visualTime,sx,sy,reducedMotion.matches,surveyMode,dt,b.enemies.find(e=>e.hp>0&&isBoss(e)));
      for(const sprite of this.cinema.villageArt){
        if(sprite.visible)world.prop(sprite.x,sprite.y+sprite.displayHeight*.10,Number(sprite.frame.name),sprite.displayWidth,sprite.displayHeight);
      }
    }
    for(let i=0;i<(world?0:30);i++){
      const age=(t*(.105+i%5*.018)+i*.113)%1;
      const x=b.width*(.05+(i*.193)% .90)+Math.sin(t*.62+i*1.6)*13;
      const y=b.height*(.29+(i%6)*.104)-age*(18+(i%5)*11);
      const color=b.location==="village"?0xf9d589:0x99ecde;
      g.fillStyle(color,Math.sin(age*Math.PI)*(i%4===0?.54:.24)).fillCircle(x,y,1+i%3*.66);
    }
    if(b.location==="village"&&!world){
      const glow=.16+Math.sin(t*5)*.045+village.lamp*.085;
      for(let i=0;i<4;i++)g.fillStyle(0x6dd8c8,glow*(1-i/4)*.28).fillEllipse(b.width*.5,b.height*.28,36+i*29,13+i*8);
    }
    for(const e of b.enemies)if(e.hp>0&&e.warning)this.paintWarning(e.warning);
    let count=0;
    const draw=(actor,kind,frame,size,sheet="cast")=>{
      const hero=kind==="hero";
      const pose=actorPose(actor,frame,size*(.93+actor.y/b.height*.13),this.visualTime,reducedMotion.matches,hero);
      const weapon=hero?heldWeapon(b.run?.weapon||village.trade.role,b.run?.profile.forged??village.trade.forged[village.trade.role],pose,actor):null;
      const texture=weapon?"hero-pose-"+frame:sheet,cell=weapon?null:frame;
      if(world)world.figure(actor,texture,cell,pose,weapon);
      else{
        const sprite=hero?this.playerSprite:this.sprite(count++);
        this.paintSprite(sprite,actor,cell,pose,texture,weapon);
      }
    };
    for(const e of b.enemies){
      const data=enemies[e.kind];
      if(e.hp<=0)continue;
      draw(e,e.kind,e.kind==="boss"&&(e.warning||e.recoil>0)?9:data.frame,data.size,data.sheet);
      if(!isBoss(e)&&e.hp<e.maxHp){
        front.fillStyle(0x171320,.85).fillRect(e.x-15,e.y-data.size*.89,30,4);
        front.fillStyle(0xf58195,.95).fillRect(e.x-15,e.y-data.size*.89,30*e.hp/e.maxHp,4);
      }
    }
    if(b.phase==="village"){
      draw({x:b.width*.25,y:b.height*.45,angle:1.16},"smith",10,72);
      draw({x:b.width*.75,y:b.height*.45,angle:1.98},"keeper",7,69);
      for(let i=0;i<Math.min(village.rescued,4);i++){
        const walk=t*.73+i*1.7;
        const x=b.width*(.32+(i%2)*.36)+Math.sin(walk)*17,y=b.height*(.60+Math.floor(i/2)*.13)+Math.cos(walk)*7;
        draw({x,y,angle:Math.cos(walk)<0?2.2:.91,walking:!reducedMotion.matches},"resident",7,59);
      }
    }
    if(b.companion){
      const merc=tradeMercenaries[b.companion.key];
      draw(b.companion,"mercenary",merc.frame,75,"merc-cast");
    }
    if(b.dragon)draw(b.dragon,"blackDragon",4,72,"tide-cast");
    for(let i=count;i<this.actorSprites.length;i++)this.actorSprites[i].setVisible(false);
    const frame=p.dash?11:p.attack?.fired?3:p.walking?1+Math.floor(t*11)%2:0;
    this.playerSprite.setVisible(!world);
    this.handSprite.setVisible(false);
    draw(p,"hero",frame,90,"cast");
    if(!surveyMode)front.fillStyle(0xc3f7dd,.80).fillTriangle(p.x,p.y+13,p.x+4,p.y+17,p.x-4,p.y+17);
    for(const bolt of b.bolts)this.cinema.bolt(front,bolt,t);
    for(const particle of world?[]:b.particles){
      const alpha=clamp(particle.left/particle.life,0,1);
      if(particle.dust)front.fillStyle(particle.color,alpha*.32).fillEllipse(particle.x,particle.y,particle.size*1.8,particle.size*.8);
      else{
        front.lineStyle(Math.max(.5,particle.size*alpha),particle.color,alpha);
        front.lineBetween(particle.x,particle.y,particle.x-particle.vx*.035,particle.y-particle.vy*.035);
      }
    }
    for(const effect of b.effects){
      if(world&&(effect.kind==="slash"||effect.kind==="echo"))continue;
      if(!this.cinema.effect(front,effect))this.paintEffect(effect);
    }
    this.cinema.finish(b);
    if(world)world.end();
  }
  paintWarning(w){
    const g=this.ground,progress=clamp(1-w.left/w.total,0,1);
    if(w.shots){
      for(const offset of w.shots){
        const a=w.angle+offset,reach=w.shots.length===10?95:245;
        g.lineStyle(3,0xe79bdd,.27+progress*.45).lineBetween(w.x,w.y,w.x+Math.cos(a)*reach,w.y+Math.sin(a)*reach);
      }
      return;
    }
    if(w.lane||w.cross){
      this.paintBeams(g,w,w.size*2,0xd43657,.24+progress*.14);
      this.paintBeams(g,w,3,0xffb090,.90);
      return;
    }
    g.fillStyle(0xc42f54,.26).fillCircle(w.x,w.y,w.size);
    g.fillStyle(0xf77966,.18+progress*.19).fillCircle(w.x,w.y,w.size*progress);
    g.lineStyle(4,0x44243a,.94).strokeCircle(w.x,w.y,w.size+2);
    g.lineStyle(2,0xffa28c,.93).strokeCircle(w.x,w.y,w.size);
  }
  paintBeams(g,w,width,color,alpha){
    g.lineStyle(width,color,alpha);
    for(const angle of w.cross?[w.angle,w.angle+Math.PI/2]:[w.angle]){
      const x=Math.cos(angle)*w.length,y=Math.sin(angle)*w.length;
      g.lineBetween(w.x-(w.cross?x:0),w.y-(w.cross?y:0),w.x+x,w.y+y);
    }
  }
  paintEffect(e){
    const g=this.front,a=clamp(e.left/e.life,0,1),p=1-a;
    if(e.kind==="slash"){
      const narrow=e.fx==="thrust",ink=e.fx==="ink",wide=e.fx==="whirl";
      const heading=e.angle-(wide?Math.PI:narrow?.24:ink?1.55:1.27)+p*.62;
      const arc=wide?TAU-.08:narrow?.54:ink?2.92:2.25-p*.68,r=e.size*(.85+p*.20);
      this.cinema.slash(g,e,heading,arc,r,a);
    }else if(e.kind==="spark"){
      const r=e.size*(.46+p*.61);
      g.fillStyle(e.color,a);
      for(let i=0;i<6;i++){
        const angle=i*TAU/6+.2;
        g.fillTriangle(e.x+Math.cos(angle-.22)*r*.22,e.y+Math.sin(angle-.22)*r*.22,
          e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r,e.x+Math.cos(angle+.22)*r*.24,e.y+Math.sin(angle+.22)*r*.24);
      }
    }else if(e.kind==="lane"){
      this.paintBeams(g,e,Math.max(2,31*a),e.color,a*.8);
      this.paintBeams(g,e,Math.max(1,8*a),0xffdfad,a);
    }else{
      g.lineStyle(1+5*a,e.color,a*.9).strokeEllipse(e.x,e.y,e.size*(.7+p*1.48),e.size*(.5+p*1.07));
    }
  }
}
const engine=new Phaser.Game({
  type:Phaser.AUTO,parent:"stage",width:viewportWidth(),height:worldHeight,
  transparent:true,
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{antialias:true,powerPreference:"high-performance"},
  input:{mouse:false,touch:false,keyboard:false},
  scene:[ShoreScene],
});
window.addEventListener("resize",()=>engine.scale.setGameSize(viewportWidth(),worldHeight));
