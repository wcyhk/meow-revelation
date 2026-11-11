"use strict";

const areas={
  village:{name:"潮燈村"},
  entry:{name:"沉鐘之門",art:"crypt",waves:[["rat","rat","witch"],["rat","witch","rat"],["witch","rat","rat"]]},
  reef:{name:"碎礁墓道",hint:"甲蟹伏擊 · 額外 2 潮火",reward:{embers:2},waves:[["crab","rat","crab","rat"],["rat","crab","witch","crab"]]},
  fen:{name:"白潮祭壇",hint:"遠程咒彈 · 回復 1 格",reward:{heal:1},waves:[["witch","witch","rat","crab"],["witch","rat","witch","witch"]]},
  boss:{name:"食燈者巢穴",guardian:"boss"},
  exchange:{name:"雨港糧市",waves:[["bailiff","rat","witch"],["bailiff","bailiff","rat"]]},
  cistern:{name:"封潮水庫",hint:"重甲守衛 · 帶回 2 糧食",reward:{food:2},waves:[["bailiff","bailiff","witch","rat"],["crab","bailiff","bailiff"]]},
  archive:{name:"命簿檔案室",hint:"咒術伏擊 · 額外 4 潮火",reward:{embers:4},waves:[["witch","witch","bailiff","witch"],["rat","witch","witch","bailiff","rat"]]},
  vault:{name:"無底糧倉",guardian:"weigher"},
  flats:{name:"白骨潮岸",waves:[["wisp","crab","wisp","rat"],["bailiff","wisp","wisp","witch"]]},
  wreck:{name:"沉船斷樁",hint:"近身包圍 · 帶回 3 糧食",reward:{food:3},waves:[["wisp","wisp","crab","bailiff"],["crab","wisp","wisp","crab"]]},
  salt:{name:"鹽晶深窟",hint:"交錯咒彈 · 回復 2 格",reward:{heal:2},waves:[["witch","wisp","witch","wisp"],["wisp","wisp","witch","witch","rat"]]},
  abbey:{name:"沉潮修院",guardian:"abbess"},
  cliff:{name:"血月斷崖",waves:[["sentinel","wisp","bailiff","sentinel"],["sentinel","sentinel","wisp","witch"]],reinforcements:["wisp","sentinel"]},
  garden:{name:"不謝花園",hint:"追蹤射線 · 回復 2 格",reward:{heal:2},waves:[["wisp","sentinel","wisp","sentinel","witch"],["sentinel","wisp","bailiff","sentinel"]]},
  bridge:{name:"黑潮索橋",hint:"重甲陣線 · 額外 6 潮火",reward:{embers:6},waves:[["bailiff","sentinel","crab","bailiff","wisp"],["bailiff","bailiff","sentinel","sentinel"]]},
  temple:{name:"無月神殿",guardian:"undertow"},
};

const chapters=[
  {
    title:"沉鐘之下",label:"第一章",entry:"entry",paths:["reef","fen"],boss:"boss",
    brief:"潮燈熄滅嗰晚，鐘下傳來失蹤小貓嘅聲音。",
    rescue:"你喺塌牆後救出提燈小貓。佢話，有人用一張寫住自己名字嘅紙，換走咗佢嘅影。",
    epilogue:"食燈者沉入海床。獲救嘅阿穗交畀你半張糧契，上面蓋住雨港商會嘅印。",
    seal:"沉鐘印",intro:"阿穗：「門後面有嘢識得用我把聲。你聽到，都唔好應佢。」",
  },
  {
    title:"無名糧契",label:"第二章",entry:"exchange",paths:["cistern","archive"],boss:"vault",
    brief:"七年前商會以壽命換糧。饑荒已過，雨港糧市嘅磅仍然喺度運作。",
    rescue:"抄簿人阿墨藏喺糧袋後面。佢抄低咗每一筆買賣，包括你屋企糧店嗰筆。",
    epilogue:"秤契官嘅磅裂開。你認得契紙上母親嘅筆跡。佢用自己餘下嘅日子，換咗全村過冬嘅糧。",
    seal:"糧契印",intro:"糧倉入口掛住一塊牌。當年用嚟記糧重嘅一欄，而家改成咗「餘年」。",
  },
  {
    title:"白骨潮岸",label:"第三章",entry:"flats",paths:["wreck","salt"],boss:"abbey",
    brief:"阿墨指住帳簿最後一頁。每個被抽走嘅名字，都送到白骨潮岸。",
    rescue:"藥師灰尾從鹽霧行出嚟。佢認得你母親嘅燈，亦知道邊個可以解開糧契。",
    epilogue:"拾骨修女解開一袋縫死嘅名字。你母親嘅名仲暖。只要神殿嘅爐未熄，就仲有得揀。",
    seal:"拾骨印",intro:"灰尾：「唔好踏住啲名。有啲仲有人記得。」",
  },
  {
    title:"最後一盞潮燈",label:"終章",entry:"cliff",paths:["garden","bridge"],boss:"temple",
    brief:"三枚印打開無月神殿。最後一盞潮燈，可以燒毀契約，亦可以換返一條命。",
    rescue:"最後一位倖存者沿住你留低嘅燈返回村落。前面只剩低持契者同最後一爐潮火。",
    epilogue:"黑月沉落。潮火裏面浮出所有借糧人嘅名，連同你母親寫到一半嘅家書。",
    seal:"黑月印",intro:"黑月：「你搵咗我咁耐。到你喇，你想用咩嚟換？」",
  },
];

const prologue=[
  {title:"第一場黑潮",art:"village",text:"七年前，大地連落三季鹹雨。種子喺泥底爛晒，潮燈村用盡最後一袋糧。四間商會帶來新米，話有人喺海底肯借。"},
  {title:"糧袋裏面嘅年歲",art:"exchange",text:"饑荒過後，商會話契約已經完結。你屋企嘅小糧店照常開門，直到母親死嗰晚，糧袋空咗，供貨人亦從此消失。"},
  {title:"最後一盞潮燈",art:"crypt",text:"失蹤村民開始喺海床下面敲鐘。有人話，畀邪神收走嘅命仲可以贖返。你攞起母親留低嘅燈，同埋門邊嗰把潮鐮。"},
];

const endings={
  burn:{title:"冇欠債嘅天光",text:"你將糧契掟入爐。借糧人嘅名字逐個走出黑月，帳簿終於冇得再加一筆。阿穗喺村口等你。你將母親嗰盞燈掛起，等村裏面嘅人都睇得見。",art:"ending-dawn"},
  return:{title:"有人為你留門",text:"你將母親嘅名字放返入盞燈。門打開時，佢企喺門檻後面，手仲沾住米粉。你將餘下嘅空契鎖進村裏嘅石盒，叫阿墨記低今晚每一個人嘅名。",art:"ending-doorway"},
};

const villagers=[
  {
    name:"阿穗",icon:"✧",role:"提燈小貓",
    line:"「我成晚都聽到自己把聲喺鐘入面叫。返到村先知，原來我仲可以叫人開飯。」",
    task:"喺膳堂煮飯，將全村飢餓降到 20% 或以下。",
    thanks:"「我留起兩份飯。你下次落海之前記得帶埋。」",
    reward:"2 糧食 · 1 供奉",ready:v=>v.hunger<=20,
    claim:v=>{v.food=Math.min(99,v.food+2);v.devotion=Math.min(99,v.devotion+1);},
  },
  {
    name:"阿墨",icon:"✒",role:"雨港抄簿人",
    line:"「我以前幫商會抄契。啲人交唔出糧嗰陣，我就將佢哋嘅年歲填落下一欄。」",
    task:"請黑鬚鐵匠將武器鍛造至第 2 級。",
    thanks:"「商會畀過我一袋潮火。我一直留住，今日終於知道可以點用。」",
    reward:"8 潮火",ready:v=>v.forge>=2,
    claim:v=>{v.embers=Math.min(99999,v.embers+8);},
  },
  {
    name:"灰尾",icon:"❧",role:"鹽岸藥師",
    line:"「我喺鹽洞識過幾個人，佢哋捱到而家都未返到屋企。可以留一瓶藥畀佢哋嗎？」",
    task:"交畀灰尾 1 瓶藥湯。",
    thanks:"「我帶藥去渡口。祭壇上留咗幾盞燈，替佢哋謝你。」",
    reward:"6 供奉",ready:v=>v.flasks>0,
    claim:v=>{v.flasks--;v.devotion=Math.min(99,v.devotion+6);},
  },
];

const areaArt=id=>areas[id].art||id;
const trialBit=index=>1<<index;
