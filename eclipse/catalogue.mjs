import {blessings,schools} from './blessings.mjs?v=ledger-1';
import {branches,techniques} from './progression.mjs?v=last-bell-1';
import {seals} from './relic-gifts.mjs?v=ledger-1';
import {blessingIcon} from './relic-interface.mjs?v=codex-1';

function element(tag,style,content){
  const item=document.createElement(tag);
  if(style)item.className=style;
  if(content)item.textContent=content;
  return item;
}

export function catalogue(tabs,close,practice){
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
  const actions=element('div','catalogue-actions');
  const training=element('button','primary catalogue-practice','配搭及練習');
  training.type='button';
  training.addEventListener('click',practice);
  actions.append(training);
  root.append(nav,actions,body);
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

export function blessingCatalogue(weapons,add){
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
      if(add){
        const button=element('button','secondary catalogue-add','加入練習配搭');
        button.type='button';
        button.addEventListener('click',()=>add(item,button));
        detail.append(button);
      }
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

export function practiceLoadout(draft,{weapons,heads,icons,preview,describe,chooseWeapon,chooseBoss}){
  const root=element('div','practice-loadout');
  const setup=element('div','practice-options');
  const formSelect=(label,items,value,change)=>{
    const wrap=element('label');
    wrap.append(element('span',null,label));
    const select=element('select');
    for(const [id,name] of items){
      const option=element('option',null,name);
      option.value=id;
      select.append(option);
    }
    select.value=value;
    select.addEventListener('change',()=>change(select.value));
    wrap.append(select);
    setup.append(wrap);
    return select;
  };
  const head=formSelect('頭目',heads.map(entry=>[entry.id,entry.name]),draft.boss.id,id=>{
    chooseBoss(heads.find(entry=>entry.id===id));
    drawStart();
  });
  head.dataset.practice='boss';
  const arm=formSelect('神器',weapons.map(weapon=>[weapon.id,weapon.name]),draft.weapon.id,id=>{
    chooseWeapon(weapons.find(weapon=>weapon.id===id));
    draw();
  });
  arm.dataset.practice='weapon';
  const phase=formSelect('起始階段',[],String(draft.phase),value=>{draft.phase=Number(value);});
  phase.dataset.practice='phase';
  const drawStart=()=>{
    const {spec}=describe(draft.boss);
    phase.replaceChildren(...['起手','二段變身','三段變身'].slice(0,spec.phases.length+1).map((name,index)=>{
      const choice=element('option',null,name);
      choice.value=index;
      return choice;
    }));
    draft.phase=Math.min(draft.phase,spec.phases.length);
    phase.value=String(draft.phase);
  };
  const shown=element('div','practice-arm');
  const icon=element('img');
  icon.alt='';
  const details=element('p');
  const inspect=element('button','secondary','3D 預覽');
  inspect.type='button';
  inspect.addEventListener('click',()=>preview(draft.weapon));
  shown.append(icon,details,inspect);
  const count=element('p','practice-summary');
  count.setAttribute('aria-live','polite');
  const summary=element('p','practice-build');
  const fusion=element('p','practice-fusion');
  const board=element('div','practice-boons');
  const query=element('input');
  query.type='search';
  query.placeholder='搜尋祝福或流派';
  query.setAttribute('aria-label',query.placeholder);
  const reset=element('button','secondary','清空祝福');
  reset.type='button';
  reset.addEventListener('click',()=>{draft.ranks.clear();draw();});
  const filter=element('button','secondary','只睇已揀');
  filter.type='button';
  let picked=false;
  filter.setAttribute('aria-pressed','false');
  filter.addEventListener('click',()=>{picked=!picked;filter.setAttribute('aria-pressed',String(picked));draw();});
  const toolbar=element('div','practice-filter');
  toolbar.append(query,filter,reset);
  const draw=()=>{
    const {weapon,ranks}=draft;
    icon.src=icons.get(weapon.id);
    details.textContent=weapon.name+' · '+weapon.skill;
    const items=weapon.blessing?[weapon.blessing,...blessings]:blessings;
    const text=query.value.trim().toLowerCase();
    const totals=Object.keys(schools).map(key=>blessings.filter(item=>item.school===key)
      .reduce((sum,item)=>sum+(ranks.get(item.id)??0),0));
    count.textContent='已揀 '+items.reduce((total,item)=>total+(ranks.get(item.id)??0),0)+' 層祝福';
    summary.textContent=Object.values(schools).map((school,index)=>school.name+' '+totals[index]).join(' · ');
    const unlocked=Object.entries(schools).filter(([key])=>blessings.filter(item=>item.school===key&&ranks.has(item.id)).length>=3)
      .map(([,school])=>school.skill);
    fusion.textContent=unlocked.length?'已啟用自動技能 · '+unlocked.join('、'):'';
    fusion.hidden=!unlocked.length;
    reset.disabled=ranks.size===0;
    board.replaceChildren(...items.filter(item=>(!picked||ranks.has(item.id))&&[item.name,item.detail,schools[item.school]?.name].join(' ').toLowerCase().includes(text)).map(item=>{
      const rank=ranks.get(item.id)??0;
      const row=element('article','practice-boon');
      row.dataset.practiceBoon=item.id;
      const info=element('div');
      info.append(element('strong',null,item.name),element('small',null,item.detail));
      const stepper=element('div','practice-stepper');
      const cap=item.weaponId?3:6;
      for(const [symbol,delta,label] of [['−',-1,'減少'],['＋',1,'增加']]){
        const button=element('button','secondary',symbol);
        button.type='button';button.dataset.rank=String(delta);
        button.setAttribute('aria-label',label+item.name);
        button.disabled=rank+delta<0||rank+delta>cap;
        button.addEventListener('click',()=>{
          const next=rank+delta;
          if(next)ranks.set(item.id,next);
          else ranks.delete(item.id);
          draw();
          const updated=board.querySelector(`[data-practice-boon="${item.id}"]`);
          const nextButton=updated?.querySelector(`[data-rank="${delta}"]:not(:disabled)`)
            ??updated?.querySelector('button:not(:disabled)')??filter;
          nextButton.focus({preventScroll:true});
        });
        if(delta>0)stepper.append(element('b',null,String(rank)));
        stepper.append(button);
      }
      row.classList.toggle('selected',rank>0);
      row.append(blessingIcon(item),info,stepper);
      return row;
    }));
    if(!board.children.length)board.append(element('p','practice-empty','搵唔到符合嘅祝福。'));
  };
  query.addEventListener('input',draw);
  root.append(setup,shown,count,summary,fusion,toolbar,board);
  drawStart();
  draw();
  return root;
}
