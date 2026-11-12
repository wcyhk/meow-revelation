import {formatTime,lanterns,lanternUnlocked,milestones,moonlessLantern,moonlessTitle,techniques,training} from './progression.mjs?v=moonless-1';

function element(tag,className,content) {
  const node=document.createElement(tag);
  if (className) node.className=className;
  if (content) node.textContent=content;
  return node;
}

export function trainingPanel(profile,updateBalance) {
  const root=element('div','training-ledger');
  const balance=element('p','training-gold');
  balance.setAttribute('aria-live','polite');
  root.append(balance);
  const updates=[];
  const refresh=()=>{
    balance.textContent='金幣 '+profile.data.gold.toLocaleString('zh-HK');
    for (const update of updates) update(profile.data);
    updateBalance();
  };
  const section=label=>{
    const group=element('section','training-section');
    group.append(element('h3',null,label));
    root.append(group);
    return group;
  };
  const row=(group,item,action,update)=>{
    const entry=element('div','training-row');
    const body=element('div');
    const name=element('strong',null,item.name);
    body.append(name,element('small',null,item.detail));
    const button=element('button','secondary training-action');
    button.type='button';
    button.dataset.training=item.id;
    button.addEventListener('click',()=>{action();refresh();});
    entry.append(body,button);
    group.append(entry);
    updates.push(data=>update(data,name,button));
  };

  const stats=section('基礎訓練');
  for (const item of training) {
    row(stats,item,()=>profile.train(item.id),(data,name,button)=>{
      const level=data.training[item.id];
      const cost=item.costs[level];
      name.textContent=item.mark+' '+item.name+' · '+level+'/'+item.costs.length;
      button.textContent=cost===undefined?'已滿級':'升級 · '+cost+' 金幣';
      button.disabled=cost===undefined||data.gold<cost;
    });
  }
  const moves=section('戰技 · 可裝備一種');
  for (const item of techniques) {
    row(moves,item,()=>profile.equipTechnique(item.id),(data,name,button)=>{
      const owned=data.techniques.includes(item.id);
      const equipped=data.technique===item.id;
      name.textContent=item.mark+' '+item.name+(equipped?' · 已裝備':'');
      button.textContent=owned?(equipped?'卸下':'裝備'):'學習 · '+item.cost+' 金幣';
      button.disabled=!owned&&data.gold<item.cost;
      button.setAttribute('aria-pressed',String(equipped));
    });
  }
  const skins=section('燈籠外觀');
  for (const item of lanterns) {
    row(skins,item,()=>profile.equipLantern(item.id),(data,name,button)=>{
      const locked=!lanternUnlocked(data,item.id);
      const equipped=data.lantern===item.id;
      name.style.color=item.tint;
      button.textContent=locked?'未解鎖':equipped?'使用中':'換上';
      button.disabled=locked||equipped;
      button.setAttribute('aria-pressed',String(equipped));
    });
  }
  const titles=section('稱號');
  row(titles,{...moonlessTitle,id:'moonless-title',detail:moonlessLantern.detail},()=>profile.toggleTitle(),(data,name,button)=>{
    const locked=data.records.abyss.fastest===null;
    const equipped=data.title===moonlessTitle.id;
    name.style.color=moonlessTitle.tint;
    button.textContent=locked?'未解鎖':equipped?'卸下':'裝備';
    button.disabled=locked;
    button.setAttribute('aria-pressed',String(equipped));
  });
  refresh();
  return root;
}

export function recordsPanel(profile,modes) {
  const root=element('div','records-ledger');
  if (profile.data.title===moonlessTitle.id) {
    const title=element('p','record-title');
    title.append(element('span',null,'目前稱號'),element('strong',null,moonlessTitle.name));
    root.append(title);
  }
  for (const mode of modes) {
    const record=profile.data.records[mode.id];
    const card=element('article','record-card');
    card.dataset.record=mode.id;
    card.append(element('h3',null,mode.mark+' '+mode.name));
    const fields=element('dl','record-fields');
    for (const [label,value] of [
      ['最深抵達',record.reached?'第 '+record.reached+' 關':'—'],
      ['最高通過',record.cleared?'第 '+record.cleared+' 關':'—'],
      ['最快通關',record.fastest?formatTime(record.fastest/1000):'—'],
    ]) {
      const pair=element('div');
      pair.append(element('dt',null,label),element('dd',null,value));
      fields.append(pair);
    }
    card.append(fields);
    for (const reward of milestones[mode.id]) {
      const earned=reward.id==='moonless'?record.fastest!==null:record.cleared>=reward.floor;
      card.append(element('p','record-milestone',`第 ${reward.floor} 關 · ${reward.name}${earned?' ✓':''}`));
    }
    root.append(card);
  }
  return root;
}

export function setFracture(overlay,time) {
  for (const piece of overlay.querySelectorAll('b')) piece.textContent=time;
  overlay.hidden=false;
}
