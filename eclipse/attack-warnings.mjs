import {createWarningIndicator} from './vendor/00gamedevs/spell-indicator.mjs';

const shapes={circle:'circle',cone:'sector',line:'rectangle'};
const freeLimit=12;
const fits=value=>value>=.25&&value<=20;

export class AttackWarnings {
  constructor(scene) {
    this.scene=scene;
    this.active=[];
    this.free={circle:[],sector:[],rectangle:[]};
  }

  show(kind,x,z,radius,duration,angle,width,ink,active,elapsed,subdued) {
    const shape=shapes[kind];
    const angleDeg=width*360/Math.PI;
    if(!shape||!fits(radius)||(kind==='line'&&!fits(width*2))||
      (kind==='cone'&&(angleDeg<5||angleDeg>360)))return false;

    const indicator=this.free[shape].pop()??createWarningIndicator(shape);
    const color=`#${(ink??0xff303e).toString(16).padStart(6,'0')}`;
    indicator.reset();
    indicator.setOptions({color,size:radius,length:radius,width:width*2,angleDeg,
      fillMode:'center-out',detail:subdued?.25:1});
    // The imported surface adds .01 units above its group.
    indicator.group.position.set(x,.039,z);
    indicator.group.rotation.y=angle;
    indicator.group.children[0].renderOrder=37;
    this.scene.add(indicator.group);
    this.active.push({shape,indicator,duration,active,elapsed,age:0,subdued});
    return true;
  }

  update(dt,paused,freeze) {
    const step=paused||freeze?0:dt;
    for(let index=this.active.length-1;index>=0;index--){
      const warning=this.active[index];
      const {indicator,active,elapsed,duration,subdued}=warning;
      warning.age=elapsed?elapsed():warning.age+step;
      if(warning.age>=duration||(active&&!active())){
        this.recycle(warning);
        this.active.splice(index,1);
        continue;
      }
      indicator.setProgress(warning.age/duration);
      if(step&&!subdued)indicator.update(step);
    }
  }

  moveTo(group) {
    for(const {indicator} of this.active)group.add(indicator.group);
  }

  clear() {
    for(const warning of this.active)this.recycle(warning);
    this.active.length=0;
  }

  recycle({shape,indicator}) {
    indicator.group.removeFromParent();
    const reserve=this.free[shape];
    if(reserve.length<freeLimit)reserve.push(indicator);
    else indicator.dispose();
  }
}
