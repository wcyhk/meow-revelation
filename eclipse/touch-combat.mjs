import {skillSigil} from './skill-sigils.mjs?v=heirlooms-1';

const moveThreshold=11;
const moveRadius=38;
const holdDelay=300;
const flickDuration=175;
const flickDistance=33;
const iconRadius=34;

export class TouchCombat {
  constructor(world,running,enqueue) {
    this.world=world;
    this.running=running;
    this.enqueue=enqueue;
    this.stick=document.getElementById('stick');
    this.prompt=document.getElementById('touch-cast');
    this.caption=this.prompt.querySelector('b');
    this.x=this.z=0;
    this.gesture=null;
    this.timer=0;

    world.addEventListener('pointerdown',event=>this.begin(event));
    world.addEventListener('pointermove',event=>this.move(event));
    world.addEventListener('pointerup',event=>this.end(event));
    for(const type of ['pointercancel','lostpointercapture']) {
      world.addEventListener(type,event=>{
        if(this.gesture?.id===event.pointerId) this.reset();
      });
    }
  }

  begin(event) {
    if(event.pointerType!=='touch'||!this.running()||this.gesture) return;
    event.preventDefault();
    const {pointerId:id,clientX:x,clientY:y,timeStamp:start}=event;
    this.gesture={id,x,y,start,mode:'press',drift:0};
    this.world.setPointerCapture(id);
    this.stick.style.left=x+'px';
    this.stick.style.top=y+'px';
    this.stick.dataset.mode='press';
    this.stick.hidden=false;
    const bounds=this.world.getBoundingClientRect();
    const above=y-bounds.top>=98;
    const tx=Math.max(bounds.left+37,Math.min(bounds.right-37,x));
    const ty=y+(above?-68:68);
    Object.assign(this.gesture,{tx,ty,above,selected:false});
    this.prompt.style.left=tx+'px';
    this.prompt.style.top=ty+'px';
    this.timer=setTimeout(()=>this.arm(),holdDelay);
  }

  arm() {
    if(!this.running()||this.gesture?.mode!=='press') return;
    this.gesture.mode='skill';
    this.stick.dataset.mode='skill';
    this.prompt.dataset.selected='false';
    this.caption.textContent=this.gesture.above?'向上拖到紋章':'向下拖到紋章';
    this.prompt.hidden=false;
  }

  setWeapon(weapon) {
    const icon=skillSigil(weapon.id);
    document.getElementById('hud').style.setProperty('--skill-icon',icon.url);
    document.getElementById('hud').style.setProperty('--skill-color',weapon.ink);
  }

  get preview() {
    if(this.gesture?.mode!=='skill') return 0;
    return this.gesture.selected?2:1;
  }

  skillSelected(g,event) {
    return Math.hypot(event.clientX-g.tx,event.clientY-g.ty)<=iconRadius;
  }

  move(event) {
    const g=this.gesture;
    if(g?.id!==event.pointerId) return;
    event.preventDefault();
    const dx=event.clientX-g.x,dy=event.clientY-g.y;
    const distance=Math.hypot(dx,dy);
    const elapsed=event.timeStamp-g.start;
    if(g.mode==='press'&&elapsed>=holdDelay) this.arm();
    if(g.mode==='skill'&&elapsed<holdDelay) {
      g.mode='press';
      this.stick.dataset.mode='press';
      this.prompt.hidden=true;
      this.timer=setTimeout(()=>this.arm(),holdDelay-elapsed);
    }
    g.drift=Math.max(g.drift,distance);
    if(g.mode==='press'&&distance>=moveThreshold) {
      clearTimeout(this.timer);
      g.mode='move';
      this.stick.dataset.mode='move';
    }
    const scale=Math.max(moveRadius,distance);
    this.stick.style.setProperty('--joy-x',dx/scale*25+'px');
    this.stick.style.setProperty('--joy-y',dy/scale*25+'px');
    if(g.mode==='move') {
      const strength=Math.max(0,Math.min(1,(distance-6)/(moveRadius-6)));
      this.x=distance?dx/distance*strength:0;
      this.z=distance?dy/distance*strength:0;
    } else if(g.mode==='skill') {
      const selected=this.skillSelected(g,event);
      g.selected=selected;
      this.prompt.dataset.selected=String(selected);
      this.caption.textContent=selected?'放手施放':g.above?'向上拖到紋章':'向下拖到紋章';
    }
  }

  end(event) {
    const g=this.gesture;
    if(g?.id!==event.pointerId) return;
    event.preventDefault();
    const dx=event.clientX-g.x,dy=event.clientY-g.y;
    const distance=Math.hypot(dx,dy);
    const elapsed=event.timeStamp-g.start;
    if(this.running()) {
      if(g.mode!=='move'&&elapsed>=holdDelay) {
        if(this.skillSelected(g,event)) this.enqueue('spell');
      } else if(elapsed<=flickDuration&&distance>=flickDistance) {
        this.enqueue('dodge',[dx/distance,dy/distance]);
      } else if(g.mode!=='move'&&Math.max(g.drift,distance)<moveThreshold) {
        this.enqueue('strike');
      }
    }
    this.reset();
  }

  reset() {
    clearTimeout(this.timer);
    const id=this.gesture?.id;
    this.gesture=null;
    if(id!==undefined&&this.world.hasPointerCapture(id)) this.world.releasePointerCapture(id);
    this.x=this.z=0;
    this.stick.hidden=true;
    this.prompt.hidden=true;
    this.stick.style.removeProperty('--joy-x');
    this.stick.style.removeProperty('--joy-y');
  }
}
