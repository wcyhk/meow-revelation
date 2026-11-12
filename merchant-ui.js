"use strict";

const weaponPreviews=new Map();
function weaponPreview(id,forged){
  const key="weapon-"+id+(forged?"-forged":"");
  if(!weaponPreviews.has(key)){
    weaponPreviews.set(key,currentScene.textures.get(key).getSourceImage().toDataURL());
  }
  return '<img class="weapon-preview" src="'+weaponPreviews.get(key)+'" alt="">';
}

function mercenaryPortrait(mercenary){
  const frame=mercenary.frame;
  return '<i class="mercenary-portrait" aria-hidden="true" style="background-position:'+(frame%3*50)+'% '+(Math.floor(frame/3)*100)+'%"></i>';
}

function weaponDescription(id,t){
  if(weapons[id])return weaponArts[id].detail;
  const role=tradeRoles[id];
  return t.forged[id]?role.gearDetail:"用 "+forgePrice+" 巨幣打造"+role.gear+"，可獲得「"+role.gearSkill+"」。";
}

function originPanel(){
  const t=village.trade;
  if(t.role){
    const role=tradeRoles[t.role],nation=charters[role.nation];
    const recruits=Object.entries(tradeMercenaries).filter(([,m])=>m.nation===role.nation);
    panel("origin","揀一位起始傭兵",'<p class="chapter-brief">'+role.person+' · '+role.name+' · '+nation.port+'</p>'+
      '<div class="kit-grid two">'+recruits.map(([id,m])=>'<button class="kit-option" data-origin-ally="'+id+'">'+mercenaryPortrait(m)+'<strong>'+m.name+'</strong><span>'+m.skill+' · '+m.detail+'</span></button>').join("")+'</div>');
    return;
  }
  panel("origin","揀國籍同職業",'<p class="chapter-brief">你帶住屋企糧店嘅舊印出發。從一轉職業開始，再揀一位同鄉傭兵。</p>'+
    '<div class="origin-grid">'+Object.entries(charters).map(([id,c])=>'<section class="origin-card" style="--guild-accent:'+c.color+
      ';--guild-art:url(./'+c.art+'.webp)"><header><h3>'+(id==="china"?"中國":c.name)+'</h3><small>'+c.port+' · '+c.npc+'</small></header>'+
      c.roles.map(id=>{const r=tradeRoles[id];return '<button data-origin-role="'+id+'"><b>'+r.name+' <small>'+r.sex+' · '+r.person+
        '</small></b><strong>'+r.skill+'</strong><span>'+r.detail+'</span></button>';}).join("")+'</section>').join("")+'</div>');
}

function expeditionKit(plan,loadout){
  const t=village.trade,role=tradeRoles[plan.role];
  const option=(key,id,art,title,description,tag="")=>
    '<button class="kit-option" data-kit="'+key+'" data-item="'+id+'" aria-pressed="'+(loadout[key]===id)+'">'+art+
    '<strong>'+title+'</strong><span>'+description+'</span>'+(tag?'<em>'+tag+'</em>':'')+'</button>';
  const gear=plan.weapon.map(id=>{
    const item=weaponOf(id),forged=id===plan.role&&t.forged[id];
    const skill=weapons[id]?weaponArts[id].name:forged?role.gearSkill:"";
    return option("weapon",id,weaponPreview(id,forged),forged?role.gear:item.name,skill?(forged&&role.passive?"被動 · ":"E · ")+skill:"專屬武器",id===plan.role?"自備":"本次借用");
  }).join("");
  const allies=plan.roster.map(id=>{
    const m=tradeMercenaries[id],promoted=t.troops[id]===2;
    return option("ally",id,mercenaryPortrait(m),promoted?m.promoted:m.name,promoted?(m.promotedSkill||m.skill):m.skill,id===plan.loan?"本次同行":charters[m.nation].name);
  }).join("");
  const port=charters[t.port];
  return '<div class="expedition-identity"><span>'+port.port+'出發 · '+role.name+'</span><b>Q · '+role.skill+'</b></div>'+
    '<div class="kit-label">武器</div><div class="kit-grid">'+gear+'</div><p id="kit-weapon-detail" class="kit-detail">'+weaponDescription(loadout.weapon,t)+'</p>'+
    '<div class="kit-label">自動出招嘅傭兵</div><div class="kit-grid">'+allies+
    option("ally","","<i>◌</i>","獨自上路","空出傭兵位置")+'</div>'+
    '<div class="expedition-identity"><span>貨艙 '+tradeCargo(t)+'／10 · '+t.coins+' 巨幣</span><button data-act="expedition-market">出發前買賣</button></div>';
}

function convoyPanel(){
  const r=state.run,t=village.trade,port=charters[t.port];
  panel("convoy","護送商隊",'<p class="chapter-brief">'+chapterClues[r.chapter]+'</p><div class="path-origin"><span></span>'+port.port+'出發<span></span></div>'+
    '<div class="path-fork convoy-fork">'+r.plan.options.map(({region,area,incident})=>{
      const c=charters[region],cargo=Object.entries(t.cargo).filter(([,n])=>n>0);
      const value=cargo.reduce((sum,[id,n])=>sum+n*tradePrice(t,id,true,region),0);
      return '<button class="path-card" data-convoy="'+region+'"><img src="./'+c.art+'.webp" alt=""><span><b>'+c.port+' · '+areas[area].name+
        '</b><small>'+c.npc+' · '+incident.name+'／'+incident.detail+'</small>'+
        (value?'<small>貨物可售 '+value+' 巨幣</small>':'')+'</span></button>';
    }).join("")+'</div><div class="path-finish">'+areas[r.story.boss].name+'</div>');
}

function tradeButton(action,id,text,enabled=true,selected=false){
  return '<button type="button" data-trade-action="'+action+'" data-trade-id="'+id+'" '+(enabled?'':'disabled')+
    (selected?' class="chosen"':'')+'>'+text+'</button>';
}

function tradePanel(page="routes"){
  const t=village.trade,r=tradeRoles[t.role];
  const kind="trade-"+page;
  const scroll=dialogKind===kind?modal.querySelector(".panel")?.scrollTop||0:0;
  const port=charters[t.port];
  const summaries=r?'<div class="guild-balance"><span>'+charters[r.nation].name+' · '+r.name+'</span><span>'+port.port+'市集</span><span>'+t.coins+' 巨幣</span><span>信用 '+t.credit+'</span></div>':'';
  const tabs=r&&!returnToExpedition?'<div class="guild-tabs">'+[["routes","航線"],["market","市集"],["troops","傭兵"],["armory","工坊"],["charter","籍冊"]].map(([id,name])=>
    '<button data-trade-page="'+id+'" aria-pressed="'+(id===page)+'">'+name+'</button>').join("")+'</div>':'';
  let title="潮燈商會",body="";
  if(!r||page==="charter"){
    title=r?"商會籍冊":"簽立商籍";
    body='<p class="chapter-brief">'+(r?'招募同轉職以當前國籍為準。跨國換籍消耗一張入籍契約，已招募嘅同伴照樣可以出戰。':'你攞住屋企糧店嘅舊印入商會。揀一個出身，先由一轉職業開始。')+'</p>'+
    '<div class="guild-roles">'+Object.entries(charters).map(([nation,c])=>
      '<section style="--guild-accent:'+c.color+'"><h3>'+c.name+'</h3>'+c.roles.map(id=>{
        const role=tradeRoles[id],same=r?.nation===nation;
        return tradeButton("role",id,'<b>'+role.name+' <small>'+role.sex+' · '+role.person+'</small></b><small>'+role.skill+' · '+role.weapon+'</small>',
          !r||same||t.contracts>0,t.role===id);
      }).join("")+'</section>').join("")+'</div>';
    if(r)body+='<div class="actions">'+tradeButton("contract","","入籍契約 "+t.contracts+" 張 · 買入 110",t.coins>=110&&t.contracts<9)+'</div>';
  }else if(page==="routes"){
    title="三地討伐委託";
    const all=Object.values(t.claims).every(Boolean);
    body='<p class="chapter-brief">'+(all?'三地證據都齊。第四個商印原來係你屋企糧店嘅舊印。母親曾經借過糧，亦將一份帳藏喺潮燈下面，留畀你追到今日。':'母親留下嘅糧契有四個商印。問三地嘅引路人，追查賣糧同收走村民年歲嘅帳。')+'</p>'+
      '<div class="guild-routes">'+Object.entries(charters).map(([id,c])=>
        '<article class="guild-route" style="--guild-accent:'+c.color+';--guild-art:url(./'+c.art+'.webp)"><header><small>'+c.name+' · '+c.port+' · '+c.npc+'</small><h3>'+c.title+'</h3></header>'+
        '<div><p>'+c.brief+'</p><small>委託 · '+c.quest+'／'+c.goal+'</small>'+
        '<div class="actions"><button class="primary" data-trade-route="'+id+'">'+(t.port===id?'出征':'護送貨隊')+'</button>'+
        (t.claims[id]?'<span class="guild-done">已交付</span>':tradeButton("claim",id,"交付委託",t.clears[id]>0))+'</div></div></article>').join("")+'</div>';
  }else if(page==="market"){
    title=port.port+"市集";
    body='<p class="chapter-brief">護送貨隊通關後抵達目的地。貨物可以帶去其他市集賣，最多載 '+tradeCargo(t)+'／10 件。</p>'+
      '<div class="guild-table">'+Object.entries(tradeGoods).map(([id,name])=>{
        const guide=Object.entries(charters).map(([key,c])=>c.port+' '+c.rates[id]).join(" · ");
        return '<div><span><b>'+name+' <small>持有 '+t.cargo[id]+'</small></b><small>各地買入價 · '+guide+'</small></span>'+
          tradeButton("buy",id,"買 "+tradePrice(t,id),tradeCargo(t)<10&&t.coins>=tradePrice(t,id))+
          tradeButton("sell",id,"賣 "+tradePrice(t,id,true),t.cargo[id]>0)+'</div>';
      }).join("")+'</div>';
  }else if(page==="troops"){
    title="傭兵名冊";
    body='<p class="chapter-brief">揀一位同伴跟隊。佢會自己移動同出招。信用達 2 可以用 115 巨幣轉職。</p>'+
      '<div class="guild-table guild-troops">'+Object.entries(tradeMercenaries).map(([id,m])=>{
        const rank=t.troops[id],local=r.nation===m.nation;
        const actions=rank?tradeButton("active",id,t.active===id?"已出戰":"編入隊伍",t.active!==id,t.active===id)+
          (rank===1?tradeButton("promote",id,"轉職",local&&t.credit>=2&&t.coins>=115):''):
          tradeButton("hire",id,local?"招募 "+m.cost:"限"+charters[m.nation].name,local&&t.coins>=m.cost);
        return '<div><span><b>'+(rank===2?m.promoted:m.name)+' <small>'+charters[m.nation].name+'</small></b><small>'+m.detail+'</small></span>'+actions+'</div>';
      }).join("")+'</div>';
    if(t.active)body+='<div class="actions">'+tradeButton("active","","單獨出戰")+'</div>';
  }else if(page==="armory"){
    title="專屬武器工坊";
    const forged=t.forged[t.role];
    body='<div class="guild-forge"><div class="guild-weapon">'+weaponPreview(t.role,true)+'</div><h3>'+r.gear+'</h3><p>'+r.gearSkill+' · '+r.gearDetail+'</p>'+
      '<div class="village-detail"><span>造價 <b>'+forgePrice+' 巨幣</b></span></div>'+
      '<div class="actions">'+tradeButton("forge",t.role,forged?"已裝備":"打造並裝備",!forged&&t.coins>=forgePrice)+'</div></div>';
  }
  panel(kind,title,summaries+tabs+body+'<div class="actions">'+(returnToExpedition?'<button class="primary" data-act="expedition-return">返回出征準備</button>':'<button data-act="close">返回潮燈村</button>')+'</div>');
  if(scroll)modal.querySelector(".panel").scrollTop=scroll;
}

function tradeResult(won,earned){
  const r=state.run,story=r.story;
  panel(won?"victory":"result",won?story.port+"貨隊抵達":"貨隊折返",
    '<p>'+(won?story.epilogue:"貨隊撤回原來市集。貨物仍然喺你手上，可以再組隊出發。")+'</p>'+
    '<div class="village-detail"><span>潮火 <b>'+earned+'</b></span>'+(won?'<span>護送費 <b>'+r.tradePay+' 巨幣</b></span>':'')+'</div>'+
    '<div class="actions"><button data-act="trade-return" class="primary">返回商會</button><button data-act="village">返回村落</button></div>');
  if(won)modal.querySelector(".panel").style.setProperty("--victory-art",'url("./'+story.art+'.webp")');
}
