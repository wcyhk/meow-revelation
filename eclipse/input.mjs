const $ = id => document.getElementById(id);
const gameplay = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyQ','Space','KeyE','Escape']);

export class Input {
  constructor(world, dispatch, running) {
    this.keys = new Set();
    this.joyX = this.joyZ = 0;
    this.pointer = null;
    this.stick = $('stick');
    this.stickZone = $('stick-zone');
    this.hold = new Set();
    this.actions = new Set();
    const bindings = new Map([['KeyJ','strike'],['KeyQ','spell'],['Space','dodge'],['KeyE','interact']]);
    addEventListener('keydown', event => {
      const {code,repeat} = event;
      if (!gameplay.has(code) || (!running() && code !== 'Escape')) return;
      event.preventDefault();
      this.keys.add(code);
      if (!repeat && bindings.has(code)) this.actions.add(bindings.get(code));
      if (!repeat && code === 'Escape') dispatch('pause');
    });
    addEventListener('keyup', event => this.keys.delete(event.code));
    addEventListener('blur', () => this.reset());
    this.stickZone.addEventListener('pointerdown', event => {
      if (this.pointer !== null) return;
      event.preventDefault();
      this.pointer = event.pointerId;
      this.originX = event.clientX;
      this.originY = event.clientY;
      this.stickZone.setPointerCapture(event.pointerId);
      this.stick.style.setProperty('--stick-x',event.clientX+'px');
      this.stick.style.setProperty('--stick-y',(event.clientY-this.stickZone.getBoundingClientRect().top)+'px');
      this.stick.classList.add('active');
    });
    this.stickZone.addEventListener('pointermove', event => {
      if (event.pointerId !== this.pointer) return;
      const dx = event.clientX-this.originX, dy = event.clientY-this.originY;
      const length = Math.hypot(dx,dy);
      const factor = 1/Math.max(32,length);
      this.joyX = length > 5 ? dx*factor : 0;
      this.joyZ = length > 5 ? dy*factor : 0;
      this.stick.style.setProperty('--joy-x',(this.joyX * 24)+'px');
      this.stick.style.setProperty('--joy-y',(this.joyZ * 24)+'px');
    });
    for (const name of ['pointerup','pointercancel','lostpointercapture']) {
      this.stickZone.addEventListener(name,event => {if(event.pointerId === this.pointer) this.releaseStick();});
    }
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
    let x = Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft'))+this.joyX;
    let z = Number(k.has('KeyS')||k.has('ArrowDown'))-Number(k.has('KeyW')||k.has('ArrowUp'))+this.joyZ;
    const length = Math.max(1,Math.hypot(x,z));
    x /= length;
    z /= length;
    const input = {
      x,z, dodge:this.actions.has('dodge'), spell:this.actions.has('spell'), interact:this.actions.has('interact'),
      strike:this.actions.has('strike')||k.has('KeyJ')||this.hold.size>0,
      aim:this.mouseAim,
    };
    this.actions.clear();
    if (!this.hold.size) this.mouseAim = null;
    return input;
  }

  releaseStick() {
    this.pointer = null;
    this.joyX = this.joyZ = 0;
    this.stick.classList.remove('active');
    this.stick.style.removeProperty('--joy-x');
    this.stick.style.removeProperty('--joy-y');
  }

  reset() {
    this.keys.clear();
    this.hold.clear();
    this.actions.clear();
    this.mouseAim = null;
    this.releaseStick();
  }
}
