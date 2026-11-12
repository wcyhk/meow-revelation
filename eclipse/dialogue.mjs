const characters={
  narrator:'旁白',
  hero:'守燈貓',
  little:'小燈',
  keeper:'司刻',
  warden:'王冠守夜者',
};

function element(tag,className,text) {
  const node=document.createElement(tag);
  node.className=className;
  if(text) node.textContent=text;
  return node;
}

function button(className,text) {
  const node=element('button',className,text);
  node.type='button';
  return node;
}

export function dialoguePanel({title,location,scene,finishLabel,onFinish,summary}) {
  const root=element('div','vn');
  const portraits=element('div','vn-cast');
  portraits.setAttribute('aria-hidden','true');
  const cast=['hero','little','keeper','warden'].map(id=>{
    const portrait=element('div','vn-portrait');
    portrait.dataset.character=id;
    portraits.append(portrait);
    return portrait;
  });
  const header=element('header','vn-header');
  const sceneName=element('div','vn-scene');
  sceneName.append(element('small','vn-location',location),element('p','vn-title',title));
  const historyButton=button('vn-tool','對話記錄');
  historyButton.setAttribute('aria-expanded','false');
  header.append(sceneName,historyButton);

  const dock=element('div','vn-dock');
  const options=element('div','vn-options');
  options.setAttribute('role','group');
  options.setAttribute('aria-label','選擇回應');
  const box=element('div','vn-box');
  const speaker=element('span','vn-speaker');
  const speech=element('div','vn-speech');
  speech.setAttribute('aria-live','polite');
  speech.setAttribute('aria-atomic','true');
  const text=element('p','vn-line');
  speech.append(speaker,text);
  const controls=element('div','vn-controls');
  const skip=button('vn-tool vn-skip','快進');
  const next=button('vn-next','繼續');
  controls.append(skip,next);
  box.append(speech,controls);
  if(summary) dock.append(summary);
  dock.append(options,box);

  const history=element('section','vn-history');
  history.id='vn-history';
  history.hidden=true;
  history.setAttribute('aria-label','對話記錄');
  historyButton.setAttribute('aria-controls',history.id);
  const logHeader=element('header','vn-history-head');
  const hideHistory=button('vn-tool','返回對話');
  logHeader.append(element('strong','vn-history-title','對話記錄'),hideHistory);
  const log=element('ol','vn-log');
  history.append(logHeader,log);
  root.append(portraits,header,dock,history);

  let lines=scene.intro;
  let index=0;
  let selected=null;
  let visible=scene.cast[0];
  let finished=false;
  const transcript=[];

  function atChoice() {
    return !selected&&scene.options?.length&&index===lines.length-1;
  }

  function render() {
    const entry=lines[index];
    const actors=entry.cast??scene.cast;
    visible=actors.includes(entry.speaker)?entry.speaker:actors.includes(visible)?visible:actors[0];
    root.dataset.cast=actors.length;
    root.dataset.speaker=entry.speaker;
    let slot=0;
    for(const portrait of cast) {
      const id=portrait.dataset.character;
      portrait.hidden=!actors.includes(id);
      if(!portrait.hidden) portrait.dataset.slot=++slot;
      portrait.dataset.active=String(id===visible);
    }
    speaker.textContent=characters[entry.speaker];
    text.textContent=entry.text;
    transcript.push({name:characters[entry.speaker],text:entry.text});
    const choices=atChoice();
    options.hidden=!choices;
    next.hidden=Boolean(choices);
    skip.hidden=index===lines.length-1;
    next.textContent=index===lines.length-1?finishLabel:'繼續  ▾';
    if(choices) options.firstElementChild.focus({preventScroll:true});
  }

  function choose(option) {
    if(!atChoice()) return;
    selected=option;
    transcript.push({name:'你的選擇',text:option.label});
    lines=[...option.reply,...(scene.outro??[])];
    index=0;
    render();
    next.focus({preventScroll:true});
  }

  for(const [i,option] of (scene.options??[]).entries()) {
    const pick=button('vn-choice');
    pick.dataset.choice=option.id;
    pick.append(element('span','vn-choice-key',String(i+1)),element('span','vn-choice-label',option.label));
    pick.firstChild.setAttribute('aria-hidden','true');
    pick.addEventListener('click',()=>choose(option));
    options.append(pick);
  }
  next.addEventListener('click',()=>{
    if(finished||atChoice()) return;
    if(index===lines.length-1) {
      finished=true;
      onFinish(selected);
      return;
    }
    index++;
    render();
  });
  skip.addEventListener('click',()=>{
    for(const entry of lines.slice(index+1,-1)) transcript.push({name:characters[entry.speaker],text:entry.text});
    index=lines.length-1;
    render();
    if(!atChoice()) next.focus({preventScroll:true});
  });

  function showHistory(open) {
    if(open) {
      log.replaceChildren(...transcript.map(entry=>{
        const row=element('li','vn-log-entry');
        row.append(element('strong','vn-log-name',entry.name),element('span','vn-log-line',entry.text));
        return row;
      }));
    }
    history.hidden=!open;
    dock.inert=open;
    header.inert=open;
    historyButton.setAttribute('aria-expanded',String(open));
    if(open) {
      log.scrollTop=log.scrollHeight;
      hideHistory.focus({preventScroll:true});
    } else {
      historyButton.focus({preventScroll:true});
    }
  }
  historyButton.addEventListener('click',()=>showHistory(true));
  hideHistory.addEventListener('click',()=>showHistory(false));
  root.addEventListener('keydown',event=>{
    if(event.repeat) return;
    if(event.key==='Escape'&&!history.hidden) {
      event.preventDefault();
      showHistory(false);
    }
    if(atChoice()&&history.hidden&&/^[1-9]$/.test(event.key)) {
      const pick=options.children[Number(event.key)-1];
      if(pick) {
        event.preventDefault();
        pick.click();
      }
    }
  });
  render();
  return root;
}
