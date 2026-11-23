import {t as textForLocale} from './locale.mjs';
// Event-driven interface feedback. No render-loop work and no gameplay input ownership.
export class InterfaceMotion {
  constructor({subdued=()=>false}={}) {
    this.subdued=subdued;
    this.preference=matchMedia('(prefers-reduced-motion: reduce)');
    this.presses=new Map();
    this.animations=new Set();
    this.effects=new Set();
    this.entrances=new WeakMap();
    this.springs=new WeakMap();
    this.signal=new AbortController();
    this.layer=document.createElement('div');
    this.layer.id='interface-fx';
    this.layer.setAttribute('aria-hidden','true');
    this.toast=document.createElement('div');
    this.toast.id='interface-reward';
    this.toast.setAttribute('role','status');
    this.toast.setAttribute('aria-live','polite');
    this.toast.hidden=true;
    document.body.append(this.layer,this.toast);
    const listen=(target,event,handler,options={})=>target.addEventListener(event,handler,{...options,signal:this.signal.signal});
    listen(document,'pointerdown',event=>this.down(event),{capture:true,passive:true});
    listen(document,'pointermove',event=>this.move(event),{capture:true,passive:true});
    listen(document,'pointerup',event=>this.up(event),{capture:true,passive:true});
    listen(document,'pointercancel',event=>this.up(event,true),{capture:true,passive:true});
    listen(document,'click',event=>{
      const button=this.button(event);
      if(!button)return;
      if(event.detail===0&&!this.recentPointer?.has(button))this.pulse(button);
    },{capture:true,passive:true});
    listen(window,'blur',()=>this.clear());
    listen(window,'resize',()=>{if(!this.toast.hidden)this.placeToast();},{passive:true});
    listen(document,'visibilitychange',()=>{if(document.hidden)this.clear();});
    listen(this.preference,'change',()=>this.clear());
    this.observer=new MutationObserver(records=>{
      for(const {target,attributeName} of records){
        if(attributeName==='open'&&target.open)this.enter(target);
        else if(attributeName==='class'&&this.reduced)this.clear();
      }
    });
    for(const dialog of document.querySelectorAll('dialog'))this.observer.observe(dialog,{attributes:true,attributeFilter:['open']});
    const game=document.getElementById('game');
    if(game)this.observer.observe(game,{attributes:true,attributeFilter:['class']});
    this.recentPointer=new WeakSet();
  }

  get reduced(){return this.preference.matches||this.subdued();}

  button(event){
    const button=event.target instanceof Element?event.target.closest('button'):null;
    return button&&!button.disabled&&button.getAttribute('aria-disabled')!=='true'&&!button.closest('[inert]')?button:null;
  }

  animate(node,frames,options={}){
    while(this.animations.size>=64){
      const oldest=this.animations.values().next().value;
      oldest.cancel();
      this.animations.delete(oldest);
    }
    const animation=node.animate(frames,{duration:220,easing:'cubic-bezier(.2,.8,.2,1)',...options});
    this.animations.add(animation);
    animation.finished.then(()=>this.animations.delete(animation),()=>this.animations.delete(animation));
    return animation;
  }

  down(event){
    if(event.button!==0)return;
    const button=this.button(event);
    if(!button)return;
    this.up(event,true);
    const press={button,x:event.clientX,y:event.clientY,moved:false};
    this.presses.set(event.pointerId,press);
    this.recentPointer.add(button);
    // Capture the original icon before the selection replaces its card.
    const card=button.closest('[data-blessing]');
    const icon=card?.querySelector('.blessing-emblem');
    if(icon)this.selection={id:card.dataset.blessing,src:icon.src,rect:icon.getBoundingClientRect(),time:performance.now()};
    if(this.reduced)return;
    this.springs.get(button)?.cancel();
    press.animation=this.animate(button,[{scale:'1'},{scale:'.97'}],{duration:85,fill:'forwards'});
    this.springs.set(button,press.animation);
    if(getComputedStyle(button).position==='static')button.classList.add('interface-anchor');
    const rect=button.getBoundingClientRect();
    const ripple=document.createElement('i');
    ripple.className='interface-ripple';
    ripple.setAttribute('aria-hidden','true');
    const size=Math.min(210,Math.max(rect.width,rect.height)*1.5);
    Object.assign(ripple.style,{width:size+'px',height:size+'px',left:(event.clientX-rect.left-size/2)+'px',top:(event.clientY-rect.top-size/2)+'px'});
    button.append(ripple);
    this.effect(ripple,[{transform:'scale(.05)',opacity:.75},{transform:'scale(1)',opacity:0}],{duration:420});
  }

  move(event){
    const press=this.presses.get(event.pointerId);
    if(press&&!press.moved&&Math.hypot(event.clientX-press.x,event.clientY-press.y)>10){
      press.moved=true;
      press.animation?.cancel();
      if(this.selection?.id===press.button.dataset.blessing)this.selection=null;
    }
  }

  up(event,cancel=false){
    const press=this.presses.get(event.pointerId);
    if(!press)return;
    this.presses.delete(event.pointerId);
    press.animation?.cancel();
    if(cancel){this.selection=null;return;}
    if(!press.moved&&press.button.isConnected&&!this.reduced)this.pulse(press.button);
    // Touch-generated clicks can have detail 0. Never add a second spring.
    setTimeout(()=>this.recentPointer.delete(press.button),600);
  }

  pulse(button){
    if(this.reduced)return;
    this.springs.get(button)?.cancel();
    this.springs.set(button,this.animate(button,[{scale:'.97'},{scale:'1.025',offset:.55},{scale:'1'}],{duration:230}));
  }

  enter(container){
    if(this.reduced)return;
    const panel=container.querySelector('.panel')??container;
    const mobile=matchMedia('(max-width: 640px)').matches;
    this.entrances.get(panel)?.cancel();
    this.entrances.set(panel,this.animate(panel,[{opacity:0,translate:mobile?'0 18px':'0 9px'},{opacity:1,translate:'0 0'}],{duration:240}));
    const cards=[...container.querySelectorAll('.arm-card,.relic,.training-row,.practice-section')].slice(0,12);
    let index=0;
    for(const card of cards){
      const rect=card.getBoundingClientRect();
      if(rect.top>innerHeight||rect.bottom<0)continue;
      this.animate(card,[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:270,delay:Math.min(index++*35,120),fill:'backwards'});
    }
  }

  effect(node,frames,options){
    // Bounded even when a player repeatedly taps with all blessings enabled.
    while(this.effects.size>=28)this.remove(this.effects.values().next().value);
    this.effects.add(node);
    this.animate(node,frames,options).finished.then(()=>this.remove(node),()=>this.remove(node));
  }

  remove(node){
    if(!this.effects.delete(node))return;
    for(const animation of node.getAnimations())animation.cancel();
    node.remove();
  }

  placeToast(){
    const headers=[...document.querySelectorAll('#hud .health-hud,#hud .route-hud,#hud .utility,#boss-hud')]
      .map(node=>node.getBoundingClientRect()).filter(rect=>rect.width>0);
    let top=Math.max(16,...headers.map(rect=>rect.bottom+8));
    const announcement=document.getElementById('announce')?.getBoundingClientRect();
    const height=this.toast.offsetHeight;
    // Account for safe areas and short screens once per reward, never per frame.
    if(announcement?.width&&top+height+6>announcement.top&&top<announcement.bottom+6)top=announcement.bottom+8;
    this.toast.style.setProperty('--reward-top',Math.min(top,Math.max(16,innerHeight-height-90))+'px');
  }

  reward({id,name,rank,ink,icon}){
    const selected=this.selection?.id===id&&performance.now()-this.selection.time<900?this.selection:null;
    this.selection=null;
    this.toast.replaceChildren();
    const emblem=icon.cloneNode(true);
    const label=document.createElement('span');
    const title=document.createElement('strong');
    title.textContent=textForLocale(name+' · '+rank+' 階');
    const note=document.createElement('small');
    note.textContent=textForLocale('祝福已融入提燈');
    label.append(title,note);
    this.toast.append(emblem,label);
    this.toast.style.setProperty('--reward-ink',ink);
    const schoolNotice=document.getElementById('school-toast');
    this.toast.hidden=!!schoolNotice&&!schoolNotice.hidden;
    clearTimeout(this.toastTimer);
    this.toastTimer=setTimeout(()=>{this.toast.hidden=true;},1800);
    if(!this.toast.hidden)this.placeToast();
    if(this.reduced)return;
    if(!this.toast.hidden)this.animate(this.toast,[{opacity:0,scale:'.96'},{opacity:1,scale:'1'}],{duration:280});
    const target=document.getElementById('relic-icons');
    const end=target?.getBoundingClientRect();
    const start=selected?.rect;
    if(start?.width&&end?.width&&!target.closest('[hidden]')){
      const flight=icon.cloneNode(true);
      flight.className='interface-flight';
      Object.assign(flight.style,{left:start.x+'px',top:start.y+'px',width:start.width+'px',height:start.height+'px','--reward-ink':ink});
      this.layer.append(flight);
      const x=end.x+end.width/2-start.x-start.width/2,y=end.y+end.height/2-start.y-start.height/2;
      this.effect(flight,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${x*.45}px,${y*.45-30}px) scale(.9)`,opacity:1,offset:.45},{transform:`translate(${x}px,${y}px) scale(.25)`,opacity:0}],{duration:560});
    }
    const rect=selected?.rect??end;
    if(rect?.width){
      const count=matchMedia('(pointer: coarse)').matches?8:12;
      for(let i=0;i<count;i++){
        const mote=document.createElement('i');
        mote.className='interface-mote';
        const angle=i/count*Math.PI*2;
        Object.assign(mote.style,{left:(rect.x+rect.width/2)+'px',top:(rect.y+rect.height/2)+'px',background:ink});
        this.layer.append(mote);
        const reach=24+Math.random()*42;
        this.effect(mote,[{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${Math.cos(angle)*reach}px,${Math.sin(angle)*reach+18}px) rotate(120deg)`,opacity:0}],{duration:480+Math.random()*220});
      }
    }
  }

  clear(){
    for(const press of this.presses.values())press.animation?.cancel();
    for(const animation of this.animations)animation.cancel();
    this.animations.clear();
    this.presses.clear();
    this.recentPointer=new WeakSet();
    this.selection=null;
    for(const node of [...this.effects])this.remove(node);
    clearTimeout(this.toastTimer);
    this.toast.hidden=true;
  }

  dispose(){
    this.clear();
    this.signal.abort();
    this.observer.disconnect();
    this.layer.remove();
    this.toast.remove();
  }
}
