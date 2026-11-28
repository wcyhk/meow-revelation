import * as T from '../three.min.mjs';
import {aimTracer,createRobot,createRocket,createTracer,muzzlePosition,poseRobot,rocketPose} from './robot-art.mjs?v=skill-depth-1';
import {chaseSummon,clearSummonShot,focusSummon,summonEnemy,summonGap as gap} from './summon-combat.mjs';

const models=[
  {id:'rocket',paint:0x9d342e,tint:0xff805c,scale:1.15,lift:.17,side:0,back:2.10,range:9.8,windup:.27,shots:1,interval:1.70,speed:17,power:.44},
  {id:'smg',paint:0x296698,tint:0x7ad8ff,scale:.91,lift:.03,side:-1.40,back:1.20,range:4.6,windup:.075,shots:4,interval:.59,rate:.07,power:.073},
  {id:'minigun',paint:0x477b42,tint:0xafff80,scale:1.05,lift:.09,side:1.40,back:1.23,range:6.9,windup:.17,shots:7,interval:.98,rate:.065,power:.057},
];
const turn=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));

export class RobotSquad {
  constructor(view) {
    this.view=view;
    this.root=new T.Group();
    this.root.name='機械人小隊';
    view.scene.add(this.root);
    this.bots=models.map((config,i)=>{
      const art=createRobot(view,config);
      this.root.add(art.root);
      return {config,art,phase:i*2.1,x:0,z:0,yaw:0,tilt:0,anchor:{x:0,z:0},cool:0,recoil:0,flash:0,shots:0,wait:0,target:null};
    });
    this.bullets=Array.from({length:10},()=>({mesh:createTracer(),life:0}));
    for(const bullet of this.bullets) this.root.add(bullet.mesh);
    this.rocket={mesh:createRocket(models[0].tint),trail:createTracer(),from:new T.Vector3(),to:new T.Vector3(),age:0,duration:0,smoke:0};
    this.rocket.trail.material.color.setHex(0xffa077);
    this.root.add(this.rocket.mesh,this.rocket.trail);
    this.from=new T.Vector3();
    this.to=new T.Vector3();
    this.tail=new T.Vector3();
    this.hide();
  }

  hide() {
    this.root.visible=false;
    this.clearFire();
  }

  clearFire() {
    this.rocket.duration=0;
    this.rocket.mesh.visible=this.rocket.trail.visible=false;
    for(const bullet of this.bullets) {
      bullet.life=0;
      bullet.mesh.visible=false;
    }
    for(const bot of this.bots) {
      bot.target=null;
      bot.searchAt=0;
      bot.shots=0;
      bot.flash=bot.recoil=0;
      bot.art.flash.visible=false;
    }
  }

  enter(game) {
    this.clearFire();
    this.heading=Math.atan2(game.hero.dx,game.hero.dz);
    this.root.visible=true;
    for(const bot of this.bots) {
      this.follow(game,bot,0);
      bot.yaw=this.heading;
      bot.cool=.28+bot.phase*.07;
      poseRobot(bot,game.t,0);
    }
  }

  follow(game,bot,dt) {
    const {hero}=game;
    const dx=Math.sin(this.heading),dz=Math.cos(this.heading);
    const {back,side}=bot.config;
    const anchor=bot.anchor;
    anchor.x=hero.x-dx*back+dz*side;
    anchor.z=hero.z-dz*back-dx*side;
    game.bound(anchor);
    if(game.isBlocked(anchor,.32)) {
      anchor.x=(anchor.x+hero.x)*.5;
      anchor.z=(anchor.z+hero.z)*.5;
    }
    const ease=dt===0?1:1-Math.exp(-7.8*dt);
    bot.tilt=Math.max(-.16,Math.min(.16,(anchor.x-bot.x)*.075));
    bot.x+=(anchor.x-bot.x)*ease;
    bot.z+=(anchor.z-bot.z)*ease;
  }

  update(game,dt) {
    const active=!game.discovery;
    if(active) this.flyRocket(game,dt);
    for(const bullet of this.bullets) {
      if(bullet.life<=0) continue;
      bullet.life-=dt;
      bullet.mesh.material.opacity=Math.max(0,bullet.life*9);
      bullet.mesh.visible=bullet.life>0;
    }
    const {hero}=game;
    const look=Math.atan2(hero.rolling>0?hero.rollX:hero.dx,hero.rolling>0?hero.rollZ:hero.dz);
    this.heading+=turn(this.heading,look)*(1-Math.exp(-9*dt));
    for(const bot of this.bots) {
      const target=active?focusSummon(game,bot,hero):null;
      const inRange=target&&gap(bot,target)<=bot.config.range;
      const clear=inRange&&clearSummonShot(game,bot,target);
      if(!target)this.follow(game,bot,dt);
      else if(!clear)chaseSummon(game,bot,target,dt*(bot.config.id==='smg'?10:8.2),.27);
      bot.flash=Math.max(0,bot.flash-dt);
      bot.recoil*=Math.exp(-12*dt);
      bot.cool-=dt;
      if(clear)this.attack(game,bot,dt);
      const yaw=target?Math.atan2(target.x-bot.x,target.z-bot.z):this.heading;
      bot.yaw+=turn(bot.yaw,yaw)*(1-Math.exp(-24*dt));
      poseRobot(bot,game.t,dt);
    }
  }

  attack(game,bot,dt) {
    const {config}=bot;
    if(!bot.shots) {
      if(bot.cool>0||config.id==='rocket'&&this.rocket.duration)return;
      bot.shots=config.shots;
      bot.wait=config.windup;
      return;
    }
    bot.wait-=dt;
    if(bot.wait>0) return;
    bot.yaw=Math.atan2(bot.target.x-bot.x,bot.target.z-bot.z);
    poseRobot(bot,game.t,0);
    const origin=muzzlePosition(bot,this.from);
    const target=bot.target;
    this.to.set(target.x,target.spec.height*.48,target.z);
    bot.flash=config.id==='rocket'?.18:.09;
    bot.recoil=config.id==='rocket'?1:config.id==='smg'?.65:.38;
    game.audio.play('robot-'+config.id);
    game.view.spark(origin.x,origin.y,origin.z,config.tint,config.id==='rocket'?8:3,.67,'flare');
    game.view.elementBurst(origin.x,origin.y,origin.z,config.tint,config.id==='rocket'?'fire':'lightning',
      config.id==='rocket'?7:3,.72,Math.atan2(this.to.z-origin.z,this.to.x-origin.x));
    if(config.id==='rocket') this.launchRocket(origin,this.to);
    else {
      this.trace(origin,this.to,config);
      game.hit(target,game.hero.damage*config.power,bot,.045,config.tint,'light',undefined,'support');
    }
    bot.shots--;
    bot.wait=config.rate??0;
    if(!bot.shots) bot.cool=config.interval;
  }

  trace(from,to,config) {
    const bullet=this.bullets.find(item=>item.life<=0);
    if(!bullet) return;
    const {mesh}=bullet;
    bullet.life=config.id==='smg'?.11:.075;
    mesh.visible=true;
    mesh.material.color.setHex(config.tint);
    mesh.material.opacity=.9;
    aimTracer(mesh,from,to,config.id==='smg'?.034:.025);
  }

  launchRocket(from,to) {
    const rocket=this.rocket;
    rocket.from.copy(from);
    rocket.to.copy(to);
    rocket.duration=Math.max(.16,from.distanceTo(to)/models[0].speed);
    rocket.age=rocket.smoke=0;
    rocket.mesh.visible=true;
    rocketPose(rocket.mesh,from,to,0);
  }

  flyRocket(game,dt) {
    const rocket=this.rocket;
    if(!rocket.duration) return;
    rocket.age+=dt;
    const progress=Math.min(1,rocket.age/rocket.duration);
    rocketPose(rocket.mesh,rocket.from,rocket.to,progress);
    const point=rocket.mesh.position;
    this.tail.copy(rocket.from).lerp(rocket.to,Math.max(0,progress-.19));
    aimTracer(rocket.trail,this.tail,point,.065);
    rocket.trail.visible=true;
    rocket.trail.material.opacity=.58+.12*Math.sin(Math.PI*progress);
    rocket.smoke-=dt;
    if(rocket.smoke<=0) {
      game.view.spark(this.tail.x,this.tail.y,this.tail.z,0xff824b,3,.45,'fire');
      rocket.smoke=.065;
    }
    if(progress<1&&!game.isBlocked(point,.06)) return;
    rocket.duration=0;
    rocket.mesh.visible=rocket.trail.visible=false;
    const {x,z}=point;
    const config=models[0];
    game.view.spellAccent(point,{action:'spikes',element:'fire',tint:config.tint,radius:1.83,seed:71,power:.89});
    game.view.shock(x,z,config.tint,1.62,.72);
    game.view.elementBurst(x,.24,z,0xff9162,'fire',15,1.10);
    game.audio.play('robot-impact');
    for(const enemy of game.enemies) {
      if(summonEnemy(game,enemy)&&gap(enemy,point)<1.62+(enemy.spec.radius??0)*.28&&clearSummonShot(game,point,enemy)) {
        game.hit(enemy,game.hero.damage*config.power,rocket.from,.34,config.tint,'light',undefined,'support');
      }
    }
  }
}
