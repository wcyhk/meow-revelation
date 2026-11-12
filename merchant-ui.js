"use strict";

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
  const tabs=r?'<div class="guild-tabs">'+[["routes","航線"],["market","市集"],["troops","傭兵"],["armory","工坊"],["charter","籍冊"]].map(([id,name])=>
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
    title="四商會舊糧契";
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
    body='<div class="guild-forge"><div class="guild-weapon">'+r.icon+'</div><h3>'+r.gear+'</h3><p>'+r.gearSkill+' · '+r.gearDetail+'</p>'+
      '<div class="village-detail"><span>造價 <b>75 巨幣</b></span><span>'+tradeMaterials[r.material]+' <b>'+t.materials[r.material]+'／2</b></span></div>'+
      '<div class="actions">'+tradeButton("forge",t.role,forged?"已裝備":"打造並裝備",!forged&&t.coins>=75&&t.materials[r.material]>=2)+'</div></div>'+
      '<p class="small">討伐會掉落材料。第一次完成每地委託，可以領另一種專屬材料。</p>';
  }
  panel(kind,title,summaries+tabs+body+'<div class="actions"><button data-act="close">返回潮燈村</button></div>');
  if(scroll)modal.querySelector(".panel").scrollTop=scroll;
}

function tradeResult(won,earned){
  const r=state.run,story=r.story;
  panel(won?"victory":"result",won?story.port+"貨隊抵達":"貨隊折返",
    '<p>'+(won?story.epilogue:"貨隊撤回原來市集。貨物仍然喺你手上，可以再組隊出發。")+'</p>'+
    '<div class="village-detail"><span>潮火 <b>'+earned+'</b></span>'+(won?'<span>護送費 <b>'+r.tradePay+' 巨幣</b></span><span>取得 <b>'+tradeMaterials[story.material]+' ×2</b></span>':'')+'</div>'+
    '<div class="actions"><button data-act="trade-return" class="primary">返回商會</button><button data-act="village">返回村落</button></div>');
  if(won)modal.querySelector(".panel").style.setProperty("--victory-art",'url("./'+story.art+'.webp")');
}
