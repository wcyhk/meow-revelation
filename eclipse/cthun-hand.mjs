import * as T from '../three.min.mjs';
import {createTendril,shapeTendril} from './tentacle-art.mjs?v=squad-1';

const configs=[
  {id:'sweep',skin:0x100b18,flesh:0x79486b,tint:0x9a6488,side:-1.93,rise:2.54,range:2.8,radius:.26,wait:.38,cool:1.8,damage:.40},
  {id:'pierce',skin:0x59101c,flesh:0xff645d,tint:0xff505c,side:1.98,rise:2.65,range:4.5,radius:.22,wait:.46,cool:2.5,damage:.59},
  {id:'erupt',skin:0x2f154f,flesh:0xe19dff,tint:0xca7bff,side:.47,rise:3.54,range:6.35,radius:.235,wait:.68,cool:3.25,damage:.48},
];
const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const eligible=(game,foe)=>foe.hp>0&&foe.age>=.23&&foe.phaseGuard<=0
  &&!(game.bossArena?.locked&&game.bossArena.boss===foe);
const clamp=value=>Math.max(0,Math.min(1,value));
const between=(a,b,t)=>a+(b-a)*t;

export class CthunHand {
  constructor(view) {
    this.view=view;
    this.root=new T.Group();
    this.root.name='克蘇恩之手';
    view.scene.add(this.root);
    this.tendrils=configs.map((config,i)=>{
      const art=createTendril(config);
      this.root.add(art.root);
      return {config,art,phase:i*2.1,ready:0,attack:null};
    });
    this.hide();
  }

  hide() {
    this.root.visible=false;
    for(const part of this.tendrils) part.attack=null;
  }

  enter(game) {
    this.root.visible=true;
    this.heading=Math.atan2(game.hero.dx,game.hero.dz);
    for(const part of this.tendrils) {
      part.attack=null;
      part.ready=game.t+.45+part.phase*.10;
      this.pose(game,part);
    }
  }

  update(game,dt) {
    const {hero,t}=game;
    const look=Math.atan2(hero.rolling>0?hero.rollX:hero.dx,hero.rolling>0?hero.rollZ:hero.dz);
    const delta=look-this.heading;
    this.heading+=Math.atan2(Math.sin(delta),Math.cos(delta))*(1-Math.exp(-12*dt));
    for(const part of this.tendrils) {
      const attack=part.attack;
      if(attack&&t>=attack.end) part.attack=null;
      else if(attack&&!attack.hit&&t>=attack.strike) {
        attack.hit=true;
        if(!game.discovery) this.strike(game,part);
      }
      if(!part.attack&&!game.discovery&&t>=part.ready) this.windup(game,part);
      this.pose(game,part);
    }
  }

  windup(game,part) {
    const {config}=part;
    const {hero,t}=game;
    let target=null,reach=config.range;
    for(const foe of game.enemies) {
      const distance=gap(hero,foe);
      if(distance<reach&&eligible(game,foe)) {
        target=foe;
        reach=distance;
      }
    }
    if(!target) {
      part.ready=t+.14;
      return;
    }
    const angle=reach>.05?Math.atan2(target.x-hero.x,target.z-hero.z):this.heading;
    const point={x:target.x,z:target.z};
    part.attack={angle,point,start:t,strike:t+config.wait,end:t+config.wait+.37,hit:false};
    part.ready=t+config.wait+config.cool;
    if(config.id==='erupt') this.view.sealFx(point.x,point.z,config.tint,1.35,config.wait+.14);
    this.view.spark(hero.x,1.38,hero.z,config.tint,6,.55,'void');
  }

  strike(game,part) {
    const {config,attack}=part;
    const {hero}=game;
    const dx=Math.sin(attack.angle),dz=Math.cos(attack.angle);
    const origin=config.id==='erupt'?attack.point:hero;
    const reach=config.id==='erupt'?0:config.range*.57;
    this.view.spellAccent(origin,{action:config.id==='erupt'?'spikes':config.id==='pierce'?'line':'cone',
      element:config.id==='pierce'?'blood':'void',tint:config.tint,radius:config.id==='erupt'?1.75:config.range,
      angle:Math.atan2(dz,dx),seed:16,power:.76});
    this.view.elementBurst(origin.x+dx*reach,.52,origin.z+dz*reach,config.tint,
      config.id==='pierce'?'blood':'void',12,1.12,Math.atan2(dz,dx));
    if(config.id==='sweep') {
      this.view.slash(hero.x,hero.z,dx,dz,config.tint,config.range,false,-1,.72);
      this.view.spark(hero.x+dx*1.63,.7,hero.z+dz*1.63,0xd03b5a,12,.95,'void');
    } else if(config.id==='pierce') {
      this.view.thrust(hero.x,hero.z,dx,dz,config.range,config.tint,false);
      this.view.spark(hero.x+dx*2.5,.8,hero.z+dz*2.5,0xff404e,15,1.20,'flare');
    } else {
      this.view.shock(origin.x,origin.z,config.tint,1.75,.73);
      this.view.spark(origin.x,.16,origin.z,0xc06bff,18,1.46,'void');
    }
    game.audio.play('tentacle-'+config.id);
    for(const foe of game.enemies) {
      if(!eligible(game,foe)) continue;
      const x=foe.x-origin.x,z=foe.z-origin.z;
      const forward=x*dx+z*dz,side=Math.abs(x*dz-z*dx);
      const target=config.id==='sweep'?gap(foe,hero)<config.range&&forward>-.59
        :config.id==='pierce'?forward>-.12&&forward<config.range&&side<.64
          :Math.hypot(x,z)<1.72;
      if(target) game.hit(foe,hero.damage*config.damage,origin,.18,config.tint,'light',undefined,'support');
    }
  }

  pose(game,part) {
    const {config,art,attack,phase}=part;
    const {hero,t}=game;
    const dx=Math.sin(this.heading),dz=Math.cos(this.heading);
    const sway=Math.sin(t*4.7+phase);
    const {v0,v1,v2,v3}=art.curve;
    const back=.38,side=config.side;
    v0.set(hero.x-dx*back+dz*side*.10,1.55,hero.z-dz*back-dx*side*.10);
    v1.set(v0.x-dx*.37+dz*side*.41,1.28,v0.z-dz*.37-dx*side*.41);
    v2.set(v0.x-dx*.64+dz*side*1.37,config.rise-.58+sway*.18,v0.z-dz*.64-dx*side*1.37);
    v3.set(v0.x-dx*(.83+sway*.19)+dz*side,config.rise+sway*.24,v0.z-dz*(.83+sway*.19)-dx*side);
    if(attack) {
      const charge=clamp((t-attack.start)/(attack.strike-attack.start));
      const recoil=clamp((attack.end-t)/(attack.end-attack.strike));
      const lash=t<attack.strike?Math.pow(charge,3):recoil;
      const angle=attack.angle+(config.id==='sweep'?between(-1.20,1.06,clamp((t-attack.start)/(attack.strike-attack.start+.15))):0);
      let x=hero.x+Math.sin(angle)*config.range,z=hero.z+Math.cos(angle)*config.range;
      let y=config.id==='sweep'?.73:.88;
      if(config.id==='erupt') {
        x=attack.point.x;z=attack.point.z;y=t<attack.strike?.12:1.85;
        v2.y=between(v2.y,.14,lash);
      } else v2.y=between(v2.y,y+.21,lash);
      v1.y+=Math.sin(charge*Math.PI)*.32;
      v2.x=between(v2.x,between(v0.x,x,.62),lash);
      v2.z=between(v2.z,between(v0.z,z,.62),lash);
      v3.set(between(v3.x,x,lash),between(v3.y,y,lash),between(v3.z,z,lash));
    }
    shapeTendril(art,config.radius);
  }
}
