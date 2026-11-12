"use strict";

const tradeGoods={ginseng:"人參",saddle:"木製馬鞍",porcelain:"白瓷"};
const forgePrice=75;
const charters={
  china:{name:"中原",port:"松溪",npc:"老君",roles:["martial","oracle"],rates:{ginseng:16,saddle:13,porcelain:6},color:"#e2a676",art:"trade-qin",
    title:"秦陵泥軍",entry:"qin-entry",paths:["qin-terrace","qin-seal"],boss:"qin-throne",
    brief:"糧契第一個商印喺松溪出現。老君見過一隊泥土士兵，將寫住村民名字嘅木牌抬入秦陵。",
    rescue:"泥俑手中嘅木牌有潮燈村嘅名字。老君用一張舊地圖指出主墓位置。",
    intro:"秦始皇之魂：「朕嘅軍隊，只會守住契約上寫過嘅名字。」",
    epilogue:"老君查對泥軍木牌。每逢商會運走一袋糧，秦陵就多一塊刻名嘅木牌。",
    quest:"秦陵舊印",goal:"擊退秦始皇之魂"},
  japan:{name:"日本",port:"三戶",npc:"Saraku",roles:["samurai","maiden"],rates:{ginseng:20,saddle:6,porcelain:15},color:"#e795a4",art:"trade-snow",
    title:"雪湯無聲",entry:"snow-entry",paths:["snow-shrine","snow-valley"],boss:"snow-castle",
    brief:"三戶嘅 Saraku 話，八幡平近排有鬼貓在溫泉邊叫賣。佢每叫一個名，雪地就少一行足印。",
    rescue:"鬼貓遺下嘅鈴上刻有第二個商印。Saraku 話，運糧人最後一次經過大雪山冰谷。",
    intro:"雪象拖住沉重嘅糧車，由冰城門後踏出嚟。",
    epilogue:"Saraku 拆開冰封嘅糧袋。內袋有商會轉手賣糧嘅證據，收貨人簽名連墨都未乾。",
    quest:"八幡平失蹤貨隊",goal:"擊退大雪山冰城嘅雪象"},
  korea:{name:"朝鮮",port:"浦項",npc:"世五女",roles:["hunter","merchant"],rates:{ginseng:6,saddle:17,porcelain:20},color:"#7cdac9",art:"trade-sea",
    title:"巨濟沉帳",entry:"sea-entry",paths:["sea-reef","sea-hall"],boss:"sea-throne",
    brief:"世五女喺浦項收到一截濕透嘅糧契。海底王封住巨濟舊航道，最後一頁帳簿沉咗落海。",
    rescue:"你喺海馬守住嘅石箱搵到浦項船籍。最後一艘船嘅船員全部俾人改成咗同一個名。",
    intro:"海底王：「你哋向海借糧。潮退咗，總要有人埋單。」",
    epilogue:"巨濟水退。世五女抄低帳簿最後一頁，商會一直用其他人嘅壽命補自己嘅欠帳。",
    quest:"巨濟沉沒帳簿",goal:"擊退巨濟海底洞嘅海底王"},
};

const tradeRoles={
  martial:{name:"武術家",person:"唐浩葉",nation:"china",sex:"男",skill:"震殼",detail:"震退附近敵人，貼身敵人受重擊。",weapon:"武術家棒",gear:"天剛棒",gearSkill:"格擋",gearDetail:"啟動短暫格擋，吸收下一次受擊。",icon:"◆",range:1.18,power:1.11},
  oracle:{name:"神女",person:"盧秀蓮",nation:"china",sex:"女",skill:"再生",detail:"回復一格生命，短暫抵擋傷害。",weapon:"神女杖",gear:"水晶短杖",gearSkill:"召喚黑龍",gearDetail:"召出黑龍追擊敵人，持續八秒。",icon:"✧",range:1.06,power:.96},
  samurai:{name:"武士",person:"島田亮",nation:"japan",sex:"男",skill:"發刀術",detail:"向瞄準方向斬出穿透刀氣。",weapon:"武士劍",gear:"一角劍",gearSkill:"銳刀",gearDetail:"持續提高發刀術傷害。",icon:"☾",range:1.15,power:1.05,passive:true},
  maiden:{name:"巫女",person:"權野花姬",nation:"japan",sex:"女",skill:"冰龍出射",detail:"冰龍穿過敵人，命中後減速。",weapon:"巫女鈴鐺",gear:"慧鈴",gearSkill:"魔力保護膜",gearDetail:"啟動護膜，以潮力吸收下一次受擊。",icon:"✺",range:.92,power:1.02},
  hunter:{name:"獵人",person:"曹鐵熙",nation:"korea",sex:"男",skill:"陷阱",detail:"在最近敵人腳下設陷阱，爆發後定住小怪。",weapon:"獵人弓箭",gear:"青鹿角弓",gearSkill:"連射",gearDetail:"普攻自動射出三支箭。",icon:"➶",range:1.09,power:.96,passive:true},
  merchant:{name:"大商人",person:"李明花",nation:"korea",sex:"女",skill:"瞬移",detail:"朝移動方向瞬移，起點與落點都會震傷敵人。",weapon:"大商人毛筆",gear:"青絲筆",gearSkill:"八門禁鎖",gearDetail:"陣法反覆傷害並減慢附近敵人。",icon:"✎",range:1.10,power:1.03},
};

const tradeMercenaries={
  tao:{name:"道術師",promoted:"舜飛燕",nation:"china",skill:"補給術",detail:"自動補充主角潮力。",mode:"mana",frame:0,cost:60},
  blade:{name:"大刀武士",promoted:"祖承訓",nation:"china",skill:"近身斬擊",promotedSkill:"爆雷擊",detail:"近身傷害，轉職後改為範圍雷擊。",mode:"blade",frame:1,cost:90},
  gun:{name:"鐵砲浪人",promoted:"協阪安治",nation:"japan",skill:"一擊必殺",promotedSkill:"連發",detail:"自動射擊，轉職後同時射出兩發。",mode:"shot",frame:2,cost:60},
  yin:{name:"陰陽師",promoted:"安倍晴明",nation:"japan",skill:"主拍清音",detail:"用符陣削弱附近敵人嘅法術抵抗。",mode:"hex",frame:3,cost:90},
  medic:{name:"醫術師",promoted:"許浚",nation:"korea",skill:"治療",promotedSkill:"治療 · 滿天花雨",detail:"危急時自動回復一格；轉職後兼有針雨。",mode:"heal",frame:4,cost:60},
  arrow:{name:"弓箭手",promoted:"李舜臣",nation:"korea",skill:"弓箭",detail:"自動向遠處敵人射箭。",mode:"shot",frame:5,cost:90},
};

const newTradeAreas={
  "qin-entry":{name:"萬里長城 · 秦陵道",art:"trade-qin",waves:[["clay","spirit","clay"],["clay","clay","spirit"]]},
  "qin-terrace":{name:"秦陵俑坑",art:"trade-qin",hint:"泥土士兵 · 額外潮火",reward:{embers:3},waves:[["clay","clay","spirit","clay"]]},
  "qin-seal":{name:"秦陵封門",art:"trade-qin",hint:"怨靈 · 回復一格生命",reward:{heal:1},waves:[["spirit","clay","spirit","spirit"]]},
  "qin-throne":{name:"秦始皇陵主墓",art:"trade-qin",guardian:"qinSoul"},
  "snow-entry":{name:"八幡平溫泉",art:"trade-snow",waves:[["ghostCat","snowDemon","ghostCat"]]},
  "snow-shrine":{name:"八幡平雪社",art:"trade-snow",hint:"鬼貓 · 額外潮火",reward:{embers:3},waves:[["ghostCat","ghostCat","snowDemon","ghostCat"]]},
  "snow-valley":{name:"大雪山冰谷",art:"trade-snow",hint:"雪怪 · 回復一格生命",reward:{heal:1},waves:[["snowDemon","ghostCat","snowDemon","snowDemon"]]},
  "snow-castle":{name:"大雪山冰城",art:"trade-snow",guardian:"snowElephant"},
  "sea-entry":{name:"巨濟海底洞",art:"trade-sea",waves:[["seaHorse","turtle","seaHorse"]]},
  "sea-reef":{name:"巨濟暗礁",art:"trade-sea",hint:"海龜 · 額外潮火",reward:{embers:3},waves:[["turtle","seaHorse","turtle","turtle"]]},
  "sea-hall":{name:"巨濟沉船廊",art:"trade-sea",hint:"海馬 · 回復一格生命",reward:{heal:1},waves:[["seaHorse","turtle","seaHorse","seaHorse"]]},
  "sea-throne":{name:"巨濟海底王座",art:"trade-sea",guardian:"seaKing"},
};
Object.assign(areas,newTradeAreas);

function readTrade(data){
  const read=(n,max,fallback=0)=>Number.isInteger(n)?Math.max(0,Math.min(max,n)):fallback;
  const role=Object.hasOwn(tradeRoles,data?.role)?data.role:"";
  const port=Object.hasOwn(charters,data?.port)?data.port:(role?tradeRoles[role].nation:"china");
  const collection=(source,keys,max)=>Object.fromEntries(Object.keys(keys).map(key=>[key,read(source?.[key],max)]));
  const troops=collection(data?.troops,tradeMercenaries,2);
  return {role,port,coins:read(data?.coins,99999,180),credit:read(data?.credit,9999),contracts:read(data?.contracts,9,1),
    starter:data?.starter===true||Object.values(troops).some(Boolean),
    cargo:collection(data?.cargo,tradeGoods,10),
    clears:collection(data?.clears,charters,999),claims:collection(data?.claims,charters,1),
    forged:collection(data?.forged,tradeRoles,1),troops,active:troops[data?.active]>0?data.active:""};
}

const tradeCargo=t=>Object.values(t.cargo).reduce((a,b)=>a+b,0);
function tradePrice(t,good,sell=false,port=t.port){
  const base=charters[port].rates[good];
  return sell?base-(t.role==="merchant"?1:2):base;
}

function enlistStarter(t,id){
  if(t.starter||!tradeRoles[t.role]||!Object.hasOwn(tradeMercenaries,id)||tradeMercenaries[id].nation!==tradeRoles[t.role].nation)return false;
  t.troops[id]=1;t.active=id;t.starter=true;return true;
}

const convoyIncidents=[
  {name:"夜路伏擊",detail:"多一隻敵人，護送費 +24",extra:1,pay:24},
  {name:"商隊藥箱",detail:"抵達時回復一格生命",heal:1,pay:0},
  {name:"失物賞金",detail:"交還商隊遺貨，護送費 +16",pay:16},
  {name:"首領截道",detail:"擊退地區首領，護送費 +46",leader:true,heal:1,pay:46},
];
const chapterClues=[
  "阿穗認得糧契上嘅外地商印。跟貨隊查出第一個轉運口。",
  "秤契官嘅帳有兩本。貨隊會喺半途換一張封條，跟住佢搵副本。",
  "海岸失蹤嘅名字出現喺出貨名冊。截住貨隊，問最後一批糧運去邊。",
  "三地副本都指向無月神殿。護送最後一份證詞，趕喺潮爐開啟前到達。",
];

function expeditionPlan(v,chapter,seed=crypto.getRandomValues(new Uint32Array(1))[0]){
  const random=seedRandom(seed);
  const draw=(items,n)=>{
    const pool=[...items];
    return Array.from({length:Math.min(pool.length,n)},()=>pool.splice(Math.floor(random()*pool.length),1)[0]);
  };
  const t=v.trade,role=tradeRoles[t.role];
  if(!role)return null;
  const options=draw(Object.keys(charters),2).map(region=>{
    const c=charters[region],route=Math.floor(random()*c.paths.length);
    const count=chapter>0?convoyIncidents.length:convoyIncidents.length-1;
    const incident=convoyIncidents[Math.floor(random()*count)];
    return {region,area:incident.leader?c.boss:c.paths[route],incident};
  });
  const local=Object.keys(tradeMercenaries).filter(id=>tradeMercenaries[id].nation===role.nation);
  const loan=draw(local.filter(id=>!t.troops[id]),1)[0]||"";
  const roster=[...new Set([t.active,...Object.keys(t.troops).filter(id=>t.troops[id]>0),loan].filter(Boolean))];
  return {seed,chapter,role:t.role,weapon:[t.role,...draw(Object.keys(weapons).filter(id=>gearUnlocked(weapons[id],v)),2)],roster,loan,options};
}

function applyTradeAction(t,action,id){
  const current=tradeRoles[t.role],nation=current?.nation;
  if(action==="role"&&Object.hasOwn(tradeRoles,id)){
    const r=tradeRoles[id];
    if(!current)t.port=r.nation;
    else if(nation!==r.nation){if(!t.contracts)return false;t.contracts--;}
    t.role=id;
  }else if(!current)return false;
  else if(action==="contract"&&t.coins>=110&&t.contracts<9){t.coins-=110;t.contracts++;}
  else if((action==="buy"||action==="sell")&&Object.hasOwn(tradeGoods,id)){
    const price=tradePrice(t,id,action==="sell");
    if(action==="buy"){if(t.coins<price||tradeCargo(t)>=10)return false;t.cargo[id]++;t.coins-=price;}
    else{if(!t.cargo[id])return false;t.cargo[id]--;t.coins=Math.min(99999,t.coins+price);}
  }else if(action==="claim"&&Object.hasOwn(charters,id)&&t.clears[id]&&!t.claims[id]){
    t.claims[id]=1;t.coins=Math.min(99999,t.coins+85);t.credit=Math.min(9999,t.credit+2);
  }else if(action==="forge"&&id===t.role&&!t.forged[id]&&t.coins>=forgePrice){
    t.forged[id]=1;t.coins-=forgePrice;
  }else if(action==="active"&&(id===""||t.troops[id]>0))t.active=id;
  else if((action==="hire"||action==="promote")&&Object.hasOwn(tradeMercenaries,id)){
    const m=tradeMercenaries[id];
    if(m.nation!==nation)return false;
    if(action==="hire"){if(t.troops[id]||t.coins<m.cost)return false;t.troops[id]=1;t.coins-=m.cost;if(!t.active)t.active=id;}
    else{if(t.troops[id]!==1||t.coins<115||t.credit<2)return false;t.troops[id]=2;t.coins-=115;}
  }else return false;
  return true;
}
