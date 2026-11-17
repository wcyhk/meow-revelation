import {TouchCombat} from './touch-combat.mjs?v=requiem-1';

const $ = id => document.getElementById(id);
const gameplay = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyQ','Space','KeyE','KeyL','Escape']);

export class Input {
  constructor(world, dispatch, running) {
    this.keys = new Set();
    this.hold = new Set();
    this.actions = new Set();
    this.dodgeDirection=null;
    const hud=$('hud');
    const touchLayout=active=>{
      this.touchMode=active;
      hud.classList.toggle('touch-controls',active);
    };
    touchLayout(matchMedia('(pointer:coarse)').matches);
    addEventListener('pointerdown',event=>{
      if(event.pointerType==='touch'&&!this.touchMode) touchLayout(true);
    },{capture:true,passive:true});
    this.touch=new TouchCombat(world,running,(action,direction,stamp)=>{
      if(action==='dodge') this.dodgeDirection=direction;
      this.enqueue(action,stamp);
    });
    this.spellButton=$('spell');
    const canCast=()=>running()&&this.spellButton.getAttribute('aria-disabled')==='false';
    this.spellButton.addEventListener('pointerdown',event=>{
      if(event.button!==0||this.spellGesture||!canCast())return;
      event.preventDefault();
      this.spellButton.setPointerCapture(event.pointerId);
      this.spellGesture={id:event.pointerId,x:event.clientX,y:event.clientY,drag:null,dragged:false};
    });
    this.spellButton.addEventListener('pointermove',event=>this.aimSpell(event));
    this.spellButton.addEventListener('pointerup',event=>{
      const gesture=this.aimSpell(event);
      if(!gesture)return;
      if(canCast()&&(!gesture.dragged||gesture.drag)){
        this.spellRelease={drag:gesture.drag};
        this.actions.add('spell');
      }
      this.cancelSpell();
    });
    for(const type of ['pointercancel','lostpointercapture']){
      this.spellButton.addEventListener(type,event=>{
        if(this.spellGesture?.id===event.pointerId)this.cancelSpell();
      });
    }
    this.spellButton.addEventListener('click',event=>{
      if(event.detail===0&&canCast()){
        this.spellRelease={drag:null};
        this.actions.add('spell');
      }
    });
    const bindings = new Map([['KeyJ','strike'],['KeyQ','spell'],['Space','dodge'],['KeyE','interact']]);
    addEventListener('keydown', event => {
      const {code,repeat} = event;
      if (event.target.closest?.('dialog[open]')||!gameplay.has(code)||(!running()&&code!=='Escape')) return;
      event.preventDefault();
      this.keys.add(code);
      if (!repeat && bindings.has(code)) this.enqueue(bindings.get(code),event.timeStamp);
      if (!repeat && code === 'Escape') dispatch('pause');
      if (!repeat && code === 'KeyL') dispatch('journal');
    });
    addEventListener('keyup', event => this.keys.delete(event.code));
    addEventListener('blur', () => this.reset());
    for (const action of ['strike','dodge']) {
      const button = $(action);
      button.addEventListener('pointerdown',event => {
        if (event.button !== 0 || !running()) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.enqueue(action,event.timeStamp);
        if (action === 'strike') this.hold.add(event.pointerId);
      });
      for (const name of ['pointerup','pointercancel','lostpointercapture']) {
        button.addEventListener(name,event => this.hold.delete(event.pointerId));
      }
      button.addEventListener('click',event => {
        if (event.detail === 0 && running()) this.enqueue(action,event.timeStamp);
      });
    }
    world.addEventListener('pointerdown',event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !running()) return;
      event.preventDefault();
      world.setPointerCapture(event.pointerId);
      this.mouseAim = {x:event.clientX,y:event.clientY};
      this.enqueue('strike',event.timeStamp);
      this.hold.add(event.pointerId);
    });
    world.addEventListener('pointermove',event => {
      if(this.hold.has(event.pointerId) && event.pointerType==='mouse') this.mouseAim={x:event.clientX,y:event.clientY};
    });
    for (const name of ['pointerup','pointercancel','lostpointercapture']) {
      world.addEventListener(name,event => {this.hold.delete(event.pointerId); if(!this.actions.has('strike')) this.mouseAim=null;});
    }
    document.addEventListener('contextmenu',event => event.preventDefault());
  }

  enqueue(action,stamp) {
    if(action==='strike')this.strikeAt=stamp;
    this.actions.add(action);
  }

  aimSpell(event) {
    const gesture=this.spellGesture;
    if(gesture?.id!==event.pointerId)return;
    const x=event.clientX-gesture.x,y=event.clientY-gesture.y;
    const distance=Math.hypot(x,y);
    const travel=y>0?Math.max(24,Math.min(80,innerHeight-gesture.y-8)):80;
    gesture.drag=distance>=10?{x,y,strength:Math.min(1,distance/travel)}:null;
    gesture.dragged ||= !!gesture.drag;
    this.spellButton.toggleAttribute('data-aiming',!!gesture.drag);
    return gesture;
  }

  cancelSpell() {
    const id=this.spellGesture?.id;
    this.spellGesture=null;
    this.spellButton.removeAttribute('data-aiming');
    if(id!==undefined&&this.spellButton.hasPointerCapture(id))this.spellButton.releasePointerCapture(id);
  }

  read() {
    const k = this.keys;
    let x = Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft'))+this.touch.x;
    let z = Number(k.has('KeyS')||k.has('ArrowDown'))-Number(k.has('KeyW')||k.has('ArrowUp'))+this.touch.z;
    const length = Math.max(1,Math.hypot(x,z));
    x /= length;
    z /= length;
    const input = {
      x,z, dodge:this.actions.has('dodge'), dodgeDirection:this.dodgeDirection, spell:this.actions.has('spell'), interact:this.actions.has('interact'),
      strike:this.actions.has('strike')||k.has('KeyJ')||this.hold.size>0,
      strikeAt:this.strikeAt,
      aim:this.mouseAim,
      spellAim:this.spellRelease,
    };
    this.actions.clear();
    this.strikeAt=null;
    this.dodgeDirection=null;
    this.spellRelease=null;
    if (!this.hold.size) this.mouseAim = null;
    return input;
  }

  reset() {
    this.keys.clear();
    this.hold.clear();
    this.actions.clear();
    this.strikeAt=null;
    this.mouseAim = null;
    this.dodgeDirection=null;
    this.spellRelease=null;
    this.cancelSpell();
    this.touch.reset();
  }
}
