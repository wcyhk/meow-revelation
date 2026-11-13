import {blessings,schools} from './blessings.mjs?v=heirlooms-1';
import {branches,techniques} from './progression.mjs?v=last-bell-1';
import {seals} from './relic-gifts.mjs?v=nightfall-1';
import {blessingIcon} from './relic-interface.mjs?v=codex-1';

function element(tag,style,content){
  const item=document.createElement(tag);
  if(style)item.className=style;
  if(content)item.textContent=content;
  return item;
}

export function catalogue(tabs,close){
  const root=element('div','catalogue');
  const nav=element('nav','catalogue-nav');
  nav.setAttribute('aria-label','圖鑑分類');
  const body=element('div','catalogue-page');
  const pages=new Map();
  const buttons=tabs.map(([name,build],index)=>{
    const button=element('button','secondary',name);
    button.type='button';
    button.addEventListener('click',()=>{
      for(const [i,tab] of buttons.entries())tab.setAttribute('aria-pressed',String(index===i));
      if(!pages.has(name))pages.set(name,build());
      body.replaceChildren(pages.get(name));
      root.closest('.panel')?.scrollTo(0,0);
    });
    nav.append(button);
    return button;
  });
  const back=element('button','secondary catalogue-back','返回入口');
  back.type='button';
  back.addEventListener('click',close);
  nav.append(back);
  root.append(nav,body);
  buttons[0].click();
  return root;
}

export function techniqueCatalogue(){
  const root=element('div','catalogue-skills');
  for(const [name,items] of [['戰技',techniques],...branches.map(branch=>[branch.name,branch.skills])]){
    const group=element('section','catalogue-skill-group');
    group.append(element('h3',null,name));
    for(const item of items){
      const row=element('article','catalogue-entry');
      row.append(element('strong',null,item.name),element('p',null,item.detail));
      group.append(row);
    }
    root.append(group);
  }
  return root;
}

export function blessingCatalogue(weapons){
  const root=element('div','catalogue-boons');
  const weaponBoons=weapons.filter(weapon=>weapon.blessing).map(weapon=>({...weapon.blessing,weapon:weapon.name}));
  const rows=[...blessings,...weaponBoons];
  const names=new Map(rows.map(item=>[item.id,item.name]));
  const query=element('input');
  query.type='search';
  query.placeholder='搜尋祝福、流派或神器';
  query.setAttribute('aria-label',query.placeholder);
  const filters=element('div','bestiary-filters');
  const list=element('div','catalogue-boon-list');
  const status=element('p','bestiary-count');
  status.setAttribute('aria-live','polite');
  let active='all';
  const controls=[];
  const draw=()=>{
    const text=query.value.trim().toLowerCase();
    const matches=rows.filter(item=>(active==='all'||(active==='weapon'?!!item.weapon:item.school===active))
      &&[item.name,schools[item.school]?.name,item.weapon,item.detail].join(' ').toLowerCase().includes(text));
    const school=schools[active];
    status.textContent=matches.length?matches.length+' 款祝福':'找不到祝福';
    list.replaceChildren(...matches.map(item=>{
      const card=element('article','catalogue-entry catalogue-boon');
      card.dataset.boon=item.id;
      const detail=element('div');
      detail.append(element('small',null,item.weapon??schools[item.school]?.name),element('strong',null,item.name),
        element('p',null,item.detail));
      card.append(blessingIcon(item),detail);
      return card;
    }));
    if(school)list.prepend(element('p','catalogue-school-note',`集齊 3 款不同${school.name}祝福，解鎖「${school.skill}」。${school.detail}`));
    if(active==='all'&&!text)for(const seal of seals){
      const card=element('article','catalogue-entry catalogue-boon');
      card.append(element('small',null,'祝福合印 · '+seal.needs.map(id=>names.get(id)).join(' ＋ ')),
        element('strong',null,seal.name),element('p',null,seal.detail));
      list.append(card);
    }
    for(const button of controls)button.setAttribute('aria-pressed',String(button.dataset.school===active));
  };
  for(const [id,name] of [['all','全部'],...Object.entries(schools).map(([key,school])=>[key,school.name]),['weapon','神器專屬']]){
    const button=element('button','secondary',name);
    button.type='button';
    button.dataset.school=id;
    button.addEventListener('click',()=>{active=id;draw();});
    controls.push(button);
    filters.append(button);
  }
  query.addEventListener('input',draw);
  root.append(query,filters,status,list);
  draw();
  return root;
}
