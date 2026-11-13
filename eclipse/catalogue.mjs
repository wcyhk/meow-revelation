import {blessings,schools} from './blessings.mjs?v=ledger-1';
import {blessingIcon} from './relic-interface.mjs?v=codex-1';
import {seals} from './relic-gifts.mjs?v=ledger-1';

function element(tag,style,content){
  const item=document.createElement(tag);
  if(style)item.className=style;
  if(content)item.textContent=content;
  return item;
}

export function practiceLoadout(draft,{weapons,heads,icons,previewWeapon,previewBoss,describe,chooseWeapon,chooseBoss}){
  const root=element('div','practice-loadout');
  const setup=element('div','practice-options');
  const formSelect=(parent,label,items,value,change)=>{
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
    parent.append(wrap);
    return select;
  };
  const enemyCard=element('section','practice-pick');
  const weaponCard=element('section','practice-pick');
  setup.append(enemyCard,weaponCard);
  const head=formSelect(enemyCard,'敵人',heads.map(entry=>[entry.id,entry.name]),draft.boss.id,id=>{
    chooseBoss(heads.find(entry=>entry.id===id));
    drawStart();
  });
  head.dataset.practice='boss';
  const quickFind=(card,select,items,placeholder)=>{
    const find=element('input');
    find.type='search';
    find.placeholder=placeholder;
    find.setAttribute('aria-label',placeholder);
    const original=[...select.options];
    const options=(search)=>original.filter((option,index)=>option.value===select.value||
      (option.textContent+' '+items[index]).toLowerCase().includes(search));
    find.addEventListener('input',()=>{
      const value=select.value;
      select.replaceChildren(...options(find.value.trim().toLowerCase()));
      select.value=value;
    });
    card.prepend(find);
  };
  quickFind(enemyCard,head,heads.map(entry=>entry.floor?'主線 第 '+entry.floor+' 關':entry.source),'搜尋敵人');
  const arm=formSelect(weaponCard,'神器',weapons.map(weapon=>[weapon.id,weapon.name]),draft.weapon.id,id=>{
    chooseWeapon(weapons.find(weapon=>weapon.id===id));
    draw();
  });
  arm.dataset.practice='weapon';
  quickFind(weaponCard,arm,weapons.map(weapon=>weapon.skill+' '+weapon.role),'搜尋神器或技能');
  const enemyDetails=element('div','practice-pick-detail');
  const weakness=element('p');
  const bossInspect=element('button','secondary','預覽頭目');
  bossInspect.type='button';
  bossInspect.dataset.preview='boss';
  bossInspect.addEventListener('click',()=>previewBoss(draft.boss));
  enemyDetails.append(weakness,bossInspect);
  enemyCard.append(enemyDetails);
  const phase=formSelect(root,'起始階段',[],String(draft.phase),value=>{draft.phase=Number(value);});
  phase.parentElement.className='practice-phase';
  phase.dataset.practice='phase';
  const drawStart=()=>{
    const dossier=describe(draft.boss);
    const {spec}=dossier;
    weakness.textContent='弱點 · '+dossier.weakness.name;
    phase.replaceChildren(...['起手','二段變身','三段變身'].slice(0,spec.phases.length+1).map((name,index)=>{
      const choice=element('option',null,name);
      choice.value=index;
      return choice;
    }));
    draft.phase=Math.min(draft.phase,spec.phases.length);
    phase.value=String(draft.phase);
  };
  const shown=element('div','practice-pick-detail');
  const icon=element('img');
  icon.alt='';
  const details=element('p');
  const inspect=element('button','secondary','預覽神器');
  inspect.type='button';
  inspect.dataset.preview='weapon';
  inspect.addEventListener('click',()=>previewWeapon(draft.weapon));
  shown.append(icon,details,inspect);
  weaponCard.append(shown);
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
  const boonHeading=element('div','practice-boon-heading');
  boonHeading.append(element('h3',null,'祝福'),count);
  const draw=()=>{
    const {weapon,ranks}=draft;
    icon.src=icons.get(weapon.id);
    details.textContent=weapon.skill;
    const items=weapon.blessing?[weapon.blessing,...blessings]:blessings;
    const text=query.value.trim().toLowerCase();
    const totals=Object.keys(schools).map(key=>blessings.filter(item=>item.school===key)
      .reduce((sum,item)=>sum+(ranks.get(item.id)??0),0));
    count.textContent='已揀 '+items.reduce((total,item)=>total+(ranks.get(item.id)??0),0)+' 層祝福';
    summary.textContent=Object.values(schools).map((school,index)=>school.name+' '+totals[index]).join(' · ');
    const unlocked=Object.entries(schools).filter(([key])=>blessings.filter(item=>item.school===key&&ranks.has(item.id)).length>=3)
      .map(([,school])=>school.skill);
    const activeSeals=seals.filter(seal=>seal.needs.every(id=>ranks.has(id))).map(seal=>seal.name);
    fusion.textContent=[unlocked.length?'自動技能 · '+unlocked.join('、'):'',
      activeSeals.length?'合印 · '+activeSeals.join('、'):''].filter(Boolean).join(' ／ ');
    fusion.hidden=!fusion.textContent;
    reset.disabled=!items.some(item=>ranks.has(item.id));
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
  root.prepend(setup);
  root.append(boonHeading,summary,fusion,toolbar,board);
  drawStart();
  draw();
  return root;
}
