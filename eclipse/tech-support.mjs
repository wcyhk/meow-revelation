import * as T from '../three.min.mjs';
import {createRobot,poseRobot} from './robot-art.mjs?v=squad-1';

export class EnemyMarkers {
  constructor(id) {
    this.root=document.getElementById(id);
    this.markers=[];
  }

  render(view,enemies,include,height) {
    this.root.hidden=false;
    let index=0;
    for(const enemy of enemies) {
      if(enemy.hp<=0||enemy.age<.23||!include(enemy)) continue;
      const point=view.project(enemy.x,height(enemy),enemy.z);
      if(point.x<0||point.y<0||point.x>view.width||point.y>view.height) continue;
      if(!this.markers[index]) {
        const marker=document.createElement('i');
        this.root.append(marker);
        this.markers.push(marker);
      }
      const marker=this.markers[index++];
      marker.classList.toggle('boss-mark',enemy.kind==='boss');
      marker.style.transform=`translate(${Math.round(point.x)}px,${Math.round(point.y)}px) translate(-50%,-50%)`;
      marker.hidden=false;
    }
    for(let i=index;i<this.markers.length;i++) this.markers[i].hidden=true;
  }

  hide() { this.root.hidden=true; }
}

export class Medics {
  constructor(view) {
    this.root=new T.Group();
    this.root.name='急救小隊';
    this.root.visible=false;
    view.scene.add(this.root);
    this.units=[-1,1].map(side=>{
      const config={id:'medic',paint:0x6bc9a5,tint:0xcaffec,scale:.79,lift:.19};
      const art=createRobot(view,config);
      this.root.add(art.root);
      return {side,art,config,phase:side,x:0,z:0,tilt:0,yaw:0,recoil:0,flash:0,shots:0};
    });
  }

  launch(game) {
    this.startTime=game.t;
    this.point={x:game.hero.x,z:game.hero.z};
    this.root.visible=true;
    this.update(game);
  }

  update(game) {
    if(!this.root.visible) return;
    const elapsed=game.t-this.startTime;
    if(elapsed>=2.2) {
      this.hide();
      return;
    }
    const distance=1.08+Math.max(0,.52-elapsed)*3+Math.max(0,elapsed-1.36)*2.4;
    const {x,z}=this.point;
    for(const bot of this.units) {
      bot.x=x+bot.side*distance;
      bot.z=z+.48;
      bot.yaw=Math.atan2(x-bot.x,z-bot.z);
      poseRobot(bot,game.t,0);
    }
  }

  hide() { this.root.visible=false; }
}
