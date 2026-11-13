const frames={light:38,lightning:31,earth:30,ice:32,void:34,fire:33,blood:39,poison:37,wind:36};
const effigies={'fox-doll':'fox','snow-doll':'wax','oni-bow':'hound','turtle-bow':'coffin',
  'western-rifle':'veil','bat-cane':'veil','snake':'hound',airavata:'elephant',hundun:'eyes',
  qiongqi:'hound',taotie:'maw',taowu:'hound','nether-box':'coffin','nether-bow':'toller','nether-sword':'veil','nether-halberd':'toller'};
const secondary={
  rain:'icicles',spikes:'roots',morph:'spiral',buff:'pounce',return:'coins',guard:'ring',ring:'eclipse',
  storm:'sweep',minion:'summon',beam:'cross',volley:'barrage',drain:'jaws',wall:'prison',blink:'blink',wave:'lance',chain:'marked',
};

export class RelicHunt {
  constructor(game,weapon){
    this.game=game;
    this.weapon=weapon;
    this.floor=game.level+1+Math.floor(Math.random()*3);
    this.remaining=3.6+Math.random()*5.8;
    this.state='waiting';
  }

  activeRoom(){
    const {game}=this;
    return this.state==='waiting'&&game.stage.floor>=this.floor&&!game.stage.boss
      &&!game.stage.objective&&!game.discovery&&game.wave>0&&!game.escape.ready;
  }

  tick(dt){
    if(this.state==='arriving'){
      this.arrive(dt);
      return;
    }
    if(!this.activeRoom())return;
    const {game}=this;
    const empty=!game.enemies.some(unit=>unit.hp>0);
    if(empty&&game.stage.floor>=this.floor+2)this.remaining=Math.min(this.remaining,.32);
    this.remaining-=dt*(empty?2.65:1);
    if(this.remaining<=0)this.spawn();
  }

  spawn(){
    const {game,weapon}=this;
    const {hero,stage}=game;
    const mark=weapon.guardian;
    const roll=weapon.sigil;
    const side=hero.x>0?-1:1;
    const depth=hero.z<-7?1:-1;
    const origin={x:hero.x+side*(3.8+roll%3*.47),z:hero.z+depth*(5.5+roll%4*.54)};
    game.bound(origin);
    const mode=game.difficulty;
    const special=['airavata','hundun','qiongqi','taotie','taowu','nether-box','nether-bow','nether-sword','nether-halberd'].includes(weapon.id);
    const attacks=[...new Set([...mark.attacks,secondary[weapon.spell.action],roll%2?'toll':'gravefan'])];
    const spec={
      name:mark.name,frame:frames[weapon.element],effigy:effigies[weapon.id],relicWeapon:weapon,
      hp:Math.round((280+stage.floor*6.3+(special?74:0))*mode.hp),
      height:2.74+(roll%5)*.13,speed:2.5+(roll%4)*.20,reach:5.9+(roll%3)*.51,
      radius:1.90+(roll%4)*.16,time:(1.02+(roll%3)*.065)/Math.sqrt(mode.pace),
      hurt:(13.4+stage.floor*.14+(special?2:0))*mode.damage,mass:3.4,
      tint:weapon.tone,effect:weapon.effect,attacks,phases:[.52],
      signature:mark.cry,form:'破契・'+weapon.skill,
    };
    const boss=game.spawn('boss',origin.x,origin.z,null,spec);
    game.huntedWeapons.add(weapon.id);
    boss.hunt=this;
    boss.age=.31;
    boss.phaseGuard=.93;
    boss.recover=1.08;
    boss.cool=1.14;
    game.ui['boss-name'].textContent=spec.name;
    game.ui['boss-hud'].hidden=false;
    game.audio.danger=true;
    game.audio.boss(spec.effect);
    game.audio.relicRoar(weapon);
    game.announce('神器守護者闖入',spec.name,mark.cry,3.3);
    game.objective('守住手上神器 · 擊退 '+spec.name);
    this.state='arriving';
    this.unit=boss;
    this.intro=.70;
    const distance=Math.max(.1,Math.hypot(hero.x-boss.x,hero.z-boss.z));
    this.chargeX=(hero.x-boss.x)/distance*8.1;
    this.chargeZ=(hero.z-boss.z)/distance*8.1;
    game.view.bossCue(boss,'entrance');
  }

  arrive(dt){
    const boss=this.unit;
    this.intro-=dt;
    if(this.intro<=0){this.state='fight';return;}
    this.game.moveUnit(boss,this.chargeX*dt,this.chargeZ*dt,.35);
    boss.move=.83;
  }

  defeat(){
    if(this.state==='defeated')return;
    const {game,weapon}=this;
    this.state='defeated';
    if((game.ranks.get(weapon.blessing.id)??0)<3)game.applyBlessing(weapon.blessing);
    game.audio.danger=game.stage.boss;
    game.announce('守護者已擊退',weapon.blessing.name,weapon.blessing.detail,2.8);
    if(game.enemies.some(unit=>unit.hp>0))game.objective('清除剩餘敵人');
  }

  signature(attack,force=false){
    const {game,unit,weapon}=this;
    if(!force&&unit.step%3!==0)return;
    const {radius,hits,interval,action}=weapon.spell;
    const aim={x:game.hero.x,z:game.hero.z};
    const bearing=Math.atan2(attack.dz,attack.dx);
    const count=Math.min(unit.bossPhase?5:3,hits+1);
    const fan=['return','beam','wave','volley'].includes(action);
    const winds=['ring','storm','guard','morph','buff'].includes(action);
    for(let index=0;index<count;index++){
      const angle=fan?bearing+(index-(count-1)/2)*.34:bearing+index*2.399;
      const distance=index===0?0:1.35+radius*.40;
      const point={x:aim.x+Math.cos(angle)*distance,z:aim.z+Math.sin(angle)*distance};
      game.bound(point);
      const kind=fan?'line':winds&&index===0?'ring':'circle';
      const size=kind==='line'?5.25+radius*.74:kind==='ring'?Math.max(2,radius):Math.min(2.9,radius*.74);
      const width=kind==='ring'?.86:kind==='line'?.46+radius*.12:0;
      const delay=attack.windup+.19+index*Math.max(.14,interval);
      const hazard={...point,kind,radius:size,width,angle,delay,damage:unit.spec.hurt*.78,owner:unit,
        tint:weapon.tone,pattern:'relic-signature',effect:weapon.effect,windup:attack,relicWeapon:weapon,relicPulse:index};
      game.hazards.push(hazard);
      game.view.warning(kind,point.x,point.z,size,delay,-angle,width,weapon.tone,()=>unit.hp>0&&!attack.interrupted);
    }
  }
}
