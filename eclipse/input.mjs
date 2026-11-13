import {TouchCombat} from './touch-combat.mjs?v=sigils-1';

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
    this.touch=new TouchCombat(world,running,(action,direction)=>{
      if(action==='dodge') this.dodgeDirection=direction;
      this.actions.add(action);
    });
    const bindings = new Map([['KeyJ','strike'],['KeyQ','spell'],['Space','dodge'],['KeyE','interact']]);
    addEventListener('keydown', event => {
      const {code,repeat} = event;
      if (!gameplay.has(code) || (!running() && code !== 'Escape')) return;
      event.preventDefault();
      this.keys.add(code);
      if (!repeat && bindings.has(code)) this.actions.add(bindings.get(code));
      if (!repeat && code === 'Escape') dispatch('pause');
      if (!repeat && code === 'KeyL') dispatch('journal');
    });
    addEventListener('keyup', event => this.keys.delete(event.code));
    addEventListener('blur', () => this.reset());
    for (const action of ['strike','spell','dodge']) {
      const button = $(action);
      button.addEventListener('pointerdown',event => {
        if (event.button !== 0 || !running()) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.actions.add(action);
        if (action === 'strike') this.hold.add(event.pointerId);
      });
      for (const name of ['pointerup','pointercancel','lostpointercapture']) {
        button.addEventListener(name,event => this.hold.delete(event.pointerId));
      }
      button.addEventListener('click',event => {
        if (event.detail === 0 && running()) this.actions.add(action);
      });
    }
    world.addEventListener('pointerdown',event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !running()) return;
      event.preventDefault();
      world.setPointerCapture(event.pointerId);
      this.mouseAim = {x:event.clientX,y:event.clientY};
      this.actions.add('strike');
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
      aim:this.mouseAim,
    };
    this.actions.clear();
    this.dodgeDirection=null;
    if (!this.hold.size) this.mouseAim = null;
    return input;
  }

  reset() {
    this.keys.clear();
    this.hold.clear();
    this.actions.clear();
    this.mouseAim = null;
    this.dodgeDirection=null;
    this.touch.reset();
  }
}
