import {Scenery} from './scenery.mjs?v=combos-1';
import {Audio} from './audio.mjs?v=links-1';
import {Input} from './input.mjs?v=armory-1';
import {arms} from './armory.mjs?v=combos-1';
import {ending} from './campaign.mjs';
import {enemySpec, patterns, stages} from './expedition.mjs?v=battle-1';
import {blessings, buildStats, schoolProgress, schools} from './blessings.mjs?v=battle-1';
import {advanceThreats, telegraph} from './threats.mjs?v=impact-1';
import {finishLinkedRush, invokeArm, invokeLinkedArm, reflectHit, rushHit, strikeTravel, strikeWith} from './combat.mjs?v=links-1';
import {RoomObjective} from './objectives.mjs?v=battle-1';
import {invokeSchool} from './schools.mjs';
import {BossArena} from './boss-arena.mjs?v=impact-1';
import {bossArenas} from './arena-layouts.mjs?v=arena-1';
import {advanceReaction, blendPose, enemyPose, heroAction, heroPose, reactionPose, reactionTime, recoil} from './combat-motion.mjs?v=links-1';
import {comboMove, comboNames, comboTiming, linkWindow, skillLinks} from './weapon-combos.mjs?v=links-1';

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (x, low, high) => Math.max(low,Math.min(x,high));
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const blend = (speed,dt) => 1-Math.exp(-speed*dt);
const fixed = value => Math.max(0, Math.ceil(value));
const random = (low,high) => low + Math.random() * (high-low);
const actionIds = ['dodge','spell','strike'];

function shuffle(list) {
  const mixed = [...list];
  for (let i = mixed.length-1; i > 0; i--) {
    const index = Math.floor(Math.random()*(i+1));
    [mixed[i],mixed[index]] = [mixed[index],mixed[i]];
  }
  return mixed;
}

function makeHero() {
  return {
    x:0,z:7.7,hp:100,maxHp:100,face:1,dx:0,dz:-1,vx:0,vz:0,move:0,
    invulnerable:0,flash:0,atk:0,atkTotal:1,attackAge:1,slash:null,combo:0,comboLeft:0,
    rolling:0,rollCool:0,rollX:0,rollZ:-1,rollDuration:.30,rollSpeed:13.6,spellCool:0,
    ward:0,surge:0,rush:null,snared:0,reaction:null,motion:null,
    link:null,linkFlash:0,linkWard:false,rushLink:false,
  };
}

function makeButton(label, callback, style='secondary') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = style;
  button.textContent = label;
  button.addEventListener('click',callback);
  return button;
}

export class Game {
  constructor(view, audio) {
    this.view = view;
    this.audio = audio;
    this.state = 'cover';
    this.arenaSeed=Math.floor(Math.random()*0x100000000);
    this.level = 0;
    this.wave = 0;
    this.enemies = [];
    this.fallen = [];
    this.hazards = [];
    this.pickups = [];
    this.relics = [];
    this.journal = [];
    this.rituals = [];
    this.discovery = null;
    this.elapsed = 0;
    this.t = 0;
    this.hitstop = 0;
    this.announceLeft = 0;
    this.damageFlash = 0;
    this.startDelay = Infinity;
    this.clearDelay = 0;
    this.kills = 0;
    this.buffered = {dodge:0,spell:0,strike:0};
    this.previousTime = performance.now();
    this.ui = Object.fromEntries(['cover','hud','modal','begin','pause','mute','objective','boss-hud','boss-fill','hp-fill','hp-number',
      'relic-icons','route-name','route-floor','route-dots','boss-name','damage-vignette','announce','announce-kicker','announce-title','announce-line',
      'mission-status','mission-title','mission-text','mission-track','mission-fill','mission-pins','school-toast','boss-arena-hint','boss-weakness','skill-link',
      'modal-kicker','modal-title','modal-copy','modal-mark','modal-content','modal-actions','journal','inspect','equipped',...actionIds].map(id=>[id,$(id)]));
    this.meter = this.ui['hp-fill'].parentElement;
    this.input = new Input(view.canvas,action=>action==='journal'?this.showJournal():this.togglePause(),()=>this.state==='play');
    this.ui.begin.addEventListener('click',()=>this.prepare());
    this.ui.pause.addEventListener('click',()=>this.togglePause());
    this.ui.mute.addEventListener('click',()=>this.ui.mute.setAttribute('aria-pressed',String(audio.toggle())));
    this.ui.inspect.addEventListener('click',()=>this.interact());
    this.ui.journal.addEventListener('click',()=>this.showJournal());
    addEventListener('resize',()=>this.view.resize());
    document.addEventListener('visibilitychange',() => {if(document.hidden && this.state==='play') this.togglePause();});
    this.loop = this.loop.bind(this);
  }

  prepare(milestone=false) {
    this.audio.start().catch(() => {});
    this.state='armory';
    this.audio.active=false;
    const grid=document.createElement('div');
    grid.className='armory-grid';
    const pool=milestone?arms.filter(arm=>arm!==this.weapon):arms;
    for (const weapon of shuffle(pool).slice(0,3)) {
      const choice=makeButton('',()=>milestone?this.swapWeapon(weapon):this.start(weapon),'arm-card');
      choice.dataset.arm=weapon.id;
      choice.style.setProperty('--arm-ink',weapon.ink);
      const image=document.createElement('img');
      image.src=this.view.armIcons.get(weapon.id);
      image.alt='';
      const text=document.createElement('div');
      text.className='arm-text';
      const role=document.createElement('small'), name=document.createElement('b');
      const basic=document.createElement('span'), moves=document.createElement('span');
      const skill=document.createElement('strong'), detail=document.createElement('span'), link=document.createElement('span');
      role.textContent=weapon.role; name.textContent=weapon.name; basic.textContent=weapon.basic;
      moves.className='arm-combo';
      moves.textContent=comboNames(weapon).join(' → ');
      skill.textContent=weapon.skill; detail.textContent=weapon.detail;
      link.className='arm-link';
      const follow=skillLinks[weapon.id];
      link.textContent='接技 · '+follow.name+'：'+follow.detail;
      text.append(role,name,moves,basic,skill,detail,link);
      choice.append(image,text);
      grid.append(choice);
    }
    this.openModal({kind:'armory',mark:'◇',
      kicker:milestone?'第 '+this.stage.floor+' 關 · '+this.stage.zone.name:'神獸遺物',
      title:milestone?'領取頭目遺物':'向林火借一件神器',
      copy:milestone?'你已擊敗'+this.stage.guardian.name+'。揀一件新神器帶走，祝福同流派技能會繼續生效。'
        :'三件神器回應了你。選擇一件，踏上百關尋名之路。',content:grid,
      buttons:milestone?[]:[makeButton('返回主畫面',()=>this.showCover())]});
  }

  start(weapon) {
    if (this.heroVisual) this.view.removeEquippedActor(this.heroVisual);
    this.hero = makeHero();
    this.heroVisual = this.view.createActor(0,2.68);
    this.relics = [];
    this.journal = [];
    this.learned=new Set();
    this.autoReady=new Map();
    this.schoolToast=0;
    this.ui['school-toast'].hidden=true;
    this.ui['relic-icons'].replaceChildren();
    this.elapsed = 0;
    this.kills = 0;
    this.hitstop = 0;
    this.damageFlash = 0;
    this.buffered = {dodge:0,spell:0,strike:0};
    this.level = 0;
    this.wave = 0;
    this.equip(weapon);
    this.state = 'play';
    this.audio.active = true;
    this.ui.cover.hidden = true;
    this.ui.hud.hidden = false;
    this.closeModal();
    this.enter(0);
    this.view.canvas.focus();
  }

  equip(weapon) {
    this.weapon=weapon;
    this.view.equip(this.heroVisual,weapon);
    this.ranks=buildStats(this.hero,weapon,this.level+1,this.relics);
    this.ui.equipped.textContent=weapon.name;
    this.ui.equipped.style.color=weapon.ink;
    this.action('strike',weapon.attack,'✦',weapon.ink);
    this.ui.strike.title=comboNames(weapon).join(' → ');
    this.action('spell',weapon.skill,weapon.mark,weapon.ink);
    this.ui.spell.title=weapon.skill+' · 第三擊命中後接技：'+skillLinks[weapon.id].name;
    this.hero.link=null;
  }

  swapWeapon(weapon) {
    if (this.state!=='armory') return;
    this.equip(weapon);
    this.state='play';
    this.audio.active=true;
    this.audio.play('blessing');
    this.closeModal();
    this.advanceAfterReward();
  }

  action(id,label,mark,tone) {
    const control=this.ui[id];
    control.setAttribute('aria-label',label);
    control.title=label;
    control.querySelector('em').textContent=label;
    control.querySelector('span').textContent=mark;
    control.style.setProperty('--action-ink',tone);
  }

  clearActors() {
    const actors = new Set([...this.enemies,...this.fallen,...this.pickups]);
    for (const unit of actors) this.view.removeActor(unit.visual);
    this.enemies.length = this.fallen.length = this.pickups.length = 0;
  }

  enter(level) {
    this.clearActors();
    this.clearThreats();
    this.rituals.length=0;
    this.level = level;
    this.wave = 0;
    this.clearDelay = 0;
    const stage = this.stage = stages[level];
    this.bossArena=null;
    this.mission=stage.objective ? new RoomObjective(this,stage.objective) : null;
    this.ui.hud.dataset.mission=this.mission?.plan.type??'';
    const h = this.hero;
    const oldMax=h.maxHp;
    this.ranks=buildStats(h,this.weapon,stage.floor,this.relics);
    h.hp=Math.min(h.maxHp,h.hp+Math.max(0,h.maxHp-oldMax));
    this.entryHp=h.hp;
    this.entryKills=this.kills;
    h.x = stage.spawn.x; h.z = stage.spawn.z; h.vx = h.vz = 0;
    h.invulnerable = 1;
    h.rolling = h.atk = h.rollCool = h.spellCool = h.ward = h.surge = h.combo = h.comboLeft = h.snared = 0;
    h.slash = h.rush = null;
    h.link=null;
    h.linkFlash=0;
    h.linkWard=h.rushLink=false;
    h.reaction=h.motion=null;
    h.attackAge=1;
    h.dx = 0; h.dz = -1;
    this.ambientClock=4.1+(stage.room%4)*.47;
    this.view.focus.set(0,0,-.65);
    this.view.setStage(stage);
    this.view.setMission(this.mission);
    this.view.setBossArena(null);
    this.setupMissionPins();
    this.audio.danger = stage.boss;
    this.audio.dread=stage.dread;
    this.ui['boss-hud'].hidden = true;
    this.ui['route-name'].textContent = stage.name;
    this.ui['route-floor'].textContent='第 '+stage.floor+' / 100 關';
    this.ui['route-dots'].replaceChildren(...Array.from({length:10},(_,index) => {
      const gem = document.createElement('i');
      gem.className = 'route-gem '+(index===stage.chapter?'current':index<stage.chapter?'done':'');
      return gem;
    }));
    const clue=this.journal.some(entry=>!entry.hiddenClue&&entry.chapter===stage.zone.name)?null:stage.clue;
    this.placeStory(clue);
    if (!clue) this.objective(this.mission?.plan.hint??(stage.boss?'迎戰 '+stage.guardian.name:patterns[stage.hazard]+' · 留意地面預警'));
    const arrival=clue?'循祭燈調查線索':this.mission?.plan.title??(stage.boss?stage.guardian.name:patterns[stage.hazard]);
    this.announce(stage.zone.name+'  /  第 '+stage.floor+' 關',stage.name,arrival,2.15);
    this.startDelay = clue ? Infinity : 1.05;
    this.renderUI();
  }

  announce(kicker,title,line,duration=2) {
    this.ui['announce-kicker'].textContent = kicker;
    this.ui['announce-title'].textContent = title;
    this.ui['announce-line'].textContent = line;
    this.ui.announce.classList.add('visible');
    this.announceLeft = duration;
  }

  objective(line) {
    if (line !== this.ui.objective.textContent) this.ui.objective.textContent = line;
  }

  placeStory(clue) {
    this.discovery=clue;
    this.view.placeClue(clue);
    this.ui.inspect.hidden=true;
    if (clue) this.objective('沿燈火尋找 · '+clue.title);
  }

  closeToClue() {
    return this.discovery && distance(this.hero,this.discovery)<1.82;
  }

  interact() {
    if (this.state!=='play') return;
    if (this.discovery) {
      this.readClue();
      return;
    }
    const arenaPoint=this.bossArena?.nearby(this.hero);
    if (arenaPoint) {
      this.bossArena.interact(arenaPoint);
      return;
    }
    const index=this.mission?.nearby()??-1;
    if (index>=0) this.mission.interact(index);
  }

  readClue() {
    if (this.state!=='play' || !this.closeToClue()) return false;
    const clue=this.discovery;
    this.placeStory(null);
    this.state='story';
    this.audio.play('blessing');
    const prose=document.createElement('div');
    prose.className='story-prose';
    for (const line of clue.text) {
      const paragraph=document.createElement('p');
      paragraph.textContent=line;
      prose.append(paragraph);
    }
    if (clue.record) this.journal.push({title:clue.title,record:clue.record,chapter:this.stage.zone.name});
    const final=clue===ending;
    const proceed=makeButton(final?'望向山下':'收起線索',()=>{
      this.closeModal();
      if (final) {
        this.finish(true);
        return;
      }
      this.state='play';
      this.objective(this.level===0?'敵影將至 · 紅印亮起時可翻滾':'前方的封印正在鬆動');
      this.startDelay=1.07;
    },'primary');
    this.openModal({kind:'story',mark:final?'✶':'✦',kicker:final?'尾聲':stages[this.level].name,title:clue.title,
      copy:'',content:prose,buttons:[proceed]});
    return true;
  }

  showHiddenClue(point,complete) {
    const chapter=this.stage.zone.name;
    if (!this.journal.some(entry=>entry.hiddenClue&&entry.title===point.title)) {
      this.journal.push({title:point.title,record:point.record,chapter,hiddenClue:true});
    }
    this.state='story';
    this.ui.inspect.hidden=true;
    this.audio.play('blessing');
    const prose=document.createElement('div');
    prose.className='story-prose';
    const paragraph=document.createElement('p');
    paragraph.textContent=point.record;
    prose.append(paragraph);
    this.openModal({kind:'story',mark:'✧',kicker:'隱藏線索 · '+chapter,title:point.title,copy:'',content:prose,
      buttons:[makeButton(complete?'收起最後一份線索':'收起線索',()=>{
        this.state='play';
        this.closeModal();
        if (complete) this.completeRoom('已搵齊隱藏線索');
      },'primary')]});
  }

  showJournal() {
    if (this.state!=='play') return;
    this.state='journal';
    const journal=document.createElement('div');
    journal.className='journal-entries';
    for (const clue of this.journal) {
      const entry=document.createElement('article');
      const heading=document.createElement('b'), record=document.createElement('p');
      heading.textContent=clue.chapter+' · '+clue.title;
      record.textContent=clue.record;
      entry.append(heading,record);
      journal.append(entry);
    }
    this.openModal({kind:'story',mark:'◇',kicker:'尋名記',title:'探索手記',
      copy:this.journal.length?'':'沿着祭燈調查，線索會記在這裏。',content:journal,
      buttons:[makeButton('收起手記',()=>this.togglePause(),'primary')]});
  }

  spawn(kind,x,z) {
    const spec = enemySpec(this.stage,kind);
    const unit = {
      kind,spec,x,z,hp:spec.hp,face:x>0?-1:1,phase:random(0,TAU),attack:null,cool:random(.55,1.22),
      kx:0,kz:0,stun:0,flash:0,age:0,step:0,recover:0,move:0,chill:0,exposed:0,bossPhase:0,phaseGuard:0,summons:0,morale:0,
      guardOpen:0,reaction:null,motion:null,
      visual:this.view.createActor(spec.frame,spec.height),
    };
    if (kind==='boss') this.view.prepareBoss(unit.visual,spec);
    this.bound(unit);
    if (this.isBlocked(unit,.45)) {
      const angle=this.stage.bearing;
      for (let index=0;index<8;index++) {
        const turn=angle+index*TAU/8;
        unit.x=x+Math.cos(turn)*2.05;
        unit.z=z+Math.sin(turn)*2.05;
        this.bound(unit);
        if (!this.isBlocked(unit,.45)) break;
      }
    }
    this.enemies.push(unit);
    this.view.spark(unit.x,.27,unit.z,spec.tint,12,.68,spec.effect);
    return unit;
  }

  startWave() {
    const {waves,positions,guardian}=this.stage;
    const units = shuffle(waves[this.wave]);
    let head;
    const count = units.length;
    for (let i=0;i<count;i++) {
      const {x,z} = units[i]==='boss'?{x:0,z:-3.2}:positions[i];
      const unit=this.spawn(units[i],x+random(-.46,.46),z+random(-.46,.46));
      if (unit.kind==='boss') head=unit;
    }
    this.startDelay = Infinity;
    this.wave++;
    const boss=!!head;
    this.objective(boss ? '擊敗 '+guardian.name : '清除敵人 · '+this.wave+' / '+waves.length+
      (guardian?' · 頭目尚未現身':' · '+patterns[this.stage.hazard]));
    if (boss) {
      this.arenaSeed=(this.arenaSeed+0x9e3779b9)>>>0;
      this.bossArena=new BossArena(this,bossArenas.get(this.stage.floor),head,this.arenaSeed);
      this.view.setBossArena(this.bossArena);
      head.phaseGuard=1.17;
      head.recover=1.04;
      this.ui['boss-name'].textContent=guardian.name;
      this.ui['boss-hud'].hidden = false;
      this.view.bossCue(head,'entrance');
      this.audio.boss(guardian.effect);
      this.announce('第 '+this.stage.floor+' 關 · 頭目',guardian.name,guardian.signature,2.35);
    }
  }

  aim(input, range=this.hero.reach+.86) {
    const h = this.hero;
    if (input.aim) {
      const center = this.view.project(h.x,.8,h.z);
      const x = input.aim.x-center.x, z = (input.aim.y-center.y)*1.55;
      const length = Math.hypot(x,z);
      if (length>7) return [x/length,z/length];
    }
    let nearest = null;
    let shortest = Infinity;
    const anchors=this.bossArena?.targets;
    for (const foe of anchors?.length?[...anchors,...this.enemies]:this.enemies) {
      const d = distance(h,foe);
      const priority=foe.kind==='arenaAnchor'?.50:1;
      if (foe.hp>0 && d*priority<shortest && d<range+(foe.kind==='boss'?.65:0)) {
        nearest = foe;
        shortest = d*priority;
      }
    }
    if (nearest) {
      const gap=distance(h,nearest);
      if (gap>.03) return [(nearest.x-h.x)/gap,(nearest.z-h.z)/gap];
    }
    return [h.dx,h.dz];
  }

  updateHero(dt,input) {
    const h = this.hero;
    h.atk -= dt;
    h.comboLeft -= dt;
    h.attackAge += dt;
    h.rollCool -= dt;
    h.spellCool -= dt;
    h.linkFlash -= dt;
    if (h.link?.until>0 && h.link.until<=this.t) h.link=null;
    h.invulnerable -= dt;
    h.ward -= dt;
    h.surge -= dt;
    h.snared-=dt;
    h.flash = Math.max(0,h.flash-dt*4.3);
    const movement = Math.hypot(input.x,input.z);
    if (movement>.07 && h.rolling<=0 && !h.slash) {
      h.dx = input.x/movement; h.dz = input.z/movement;
      if (Math.abs(h.dx)>.14) h.face = Math.sign(h.dx);
    }
    if (this.buffered.dodge>0 && h.rollCool<=0 && h.rolling<=0) {
      this.buffered.dodge=0;
      h.rolling = h.rollDuration = .30;
      h.rollSpeed=13.6;
      h.rollCool = h.rollTime;
      h.invulnerable = Math.max(h.invulnerable,.35);
      h.rollX = movement>.07 ? input.x/movement : h.dx;
      h.rollZ = movement>.07 ? input.z/movement : h.dz;
      if (h.slash) h.atk=Math.min(h.atk,.20);
      this.interruptLink();
      h.slash = null;
      h.attackAge = 1;
      h.motion=null;
      this.audio.play('roll');
      this.view.spark(h.x,.2,h.z,0xe5b17b,13,.6);
    }
    if (h.rolling>0) {
      const previous=h.rush?{x:h.x,z:h.z}:null;
      this.moveUnit(h,h.rollX*h.rollSpeed*dt,h.rollZ*h.rollSpeed*dt,.38);
      if (previous) rushHit(this,previous);
      h.rolling -= dt;
      h.vx = h.rollX * 4; h.vz = h.rollZ * 4;
      if (h.rolling<=0) {
        if (h.rushLink) finishLinkedRush(this);
        h.rush=null;
        h.rushLink=false;
      }
      if (h.rolling<=0 && h.ember) {
        this.view.shock(h.x,h.z,0xff783c,2.05,.64);
        for (const foe of this.enemies) if (distance(h,foe)<2.1) this.hit(foe,h.ember,h,.6);
      }
    } else {
      const charging=h.slash?.move&&h.combo===3&&h.attackAge<h.slash.timing.hits[0].at;
      const speed = h.moveSpeed*(charging?.55:h.attackAge<.18?.65:1)*(h.snared>0?.57:1);
      const drag = blend(movement>.07?18:22,dt);
      h.vx += (input.x*speed-h.vx)*drag;
      h.vz += (input.z*speed-h.vz)*drag;
      this.moveUnit(h,h.vx*dt,h.vz*dt,.38);
      const canFight=!this.discovery&&!this.mission?.plan.points;
      while (h.slash?.timing&&h.attackAge>=h.slash.timing.hits[h.slash.next].at) this.landSlash();
      const ready=this.readyLink();
      const waitForHit=h.link?.pending&&!h.link.contacts.length;
      const queuesFinisher=!ready&&h.combo===2&&h.comboLeft>0&&h.atk<=.12&&this.buffered.strike>0;
      const cast=canFight&&!h.slash&&this.buffered.spell>0&&h.spellCool<=0&&!waitForHit&&!queuesFinisher;
      if (cast) {
        this.buffered.spell=0;
        this.cast(input,ready);
      } else if (canFight && !h.slash && this.buffered.strike>0 && h.atk<=0
          && !(waitForHit&&this.buffered.spell>0&&h.spellCool<=0)) {
        this.buffered.strike=0;
        this.attack(input);
      }
    }
    this.bound(h);
    h.move += (Math.min(1,Math.hypot(h.vx,h.vz)/5)-h.move)*blend(14,dt);
    if (this.discovery) {
      const near=this.closeToClue();
      this.ui.inspect.hidden=!near;
      if (near) {
        this.ui.inspect.querySelector('span').textContent=this.discovery.action;
        if (input.interact) this.interact();
      }
      return;
    }
    const arenaPoint=this.bossArena?.nearby(h);
    if (arenaPoint) {
      this.ui.inspect.hidden=false;
      this.ui.inspect.querySelector('span').textContent=this.bossArena.label(arenaPoint);
      if (input.interact) this.interact();
      return;
    }
    const point=this.mission?.nearby()??-1;
    this.ui.inspect.hidden=point<0;
    if (point>=0) {
      const plan=this.mission.plan;
      this.ui.inspect.querySelector('span').textContent=plan.type==='circuit'?'點亮 '+plan.points[point].symbol:'調查發光殘頁';
      if (input.interact) this.interact();
    }
  }

  bound(unit) {
    unit.z = clamp(unit.z,-7.55,11.15);
    const edge = unit.z < -3.9 ? 10.35 : 11.45;
    unit.x = clamp(unit.x,-edge,edge);
  }

  isBlocked(unit,margin,previous) {
    const gate=this.mission?.plan.gate;
    if (gate && !this.mission.gateOpen
      && Math.abs(unit.x-gate.x)<gate.width/2+margin && Math.abs(unit.z-gate.z)<gate.depth/2+margin) return true;
    return this.stage.props.some(prop=>distance(unit,prop)<prop.radius+margin)
      || !!this.bossArena?.blocks(unit,margin,previous);
  }

  moveUnit(unit,dx,dz,margin) {
    const oldX=unit.x, oldZ=unit.z;
    unit.x+=dx;
    this.bound(unit);
    if (this.isBlocked(unit,margin,{x:oldX,z:oldZ})) unit.x=oldX;
    const nextX=unit.x;
    unit.z+=dz;
    this.bound(unit);
    if (this.isBlocked(unit,margin,{x:nextX,z:oldZ})) unit.z=oldZ;
    return Math.hypot(unit.x-oldX,unit.z-oldZ);
  }

  attack(input) {
    const h = this.hero;
    const [dx,dz] = this.aim(input);
    h.dx = dx; h.dz = dz;
    if (Math.abs(dx)>.12) h.face = Math.sign(dx);
    h.combo = h.comboLeft>0 ? h.combo%3+1 : 1;
    const move=comboMove(this.weapon,h.combo);
    const timing=comboTiming(this.weapon,move,h.attackPeriod);
    h.comboLeft=timing.cycle+.57;
    h.atk=h.atkTotal=timing.cycle;
    h.attackAge = 0;
    h.slash={dx,dz,move,timing,next:0,step:h.combo,confirmed:false};
    if (h.combo===3) {
      h.link={pending:true,until:0,contacts:[],dx,dz};
      h.slash.link=h.link;
    }
    heroAction(h,'strike',move,timing);
    this.audio.attack(this.weapon.id,h.combo,'wind');
  }

  landSlash() {
    const h=this.hero, strike=h.slash;
    const {dx,dz}=strike;
    const move=strike.move??comboMove(this.weapon,h.combo);
    const step=strike.step??h.combo;
    const index=strike.next??0;
    const pulse=strike.timing?.hits[index];
    if (!strike.timing||++strike.next>=strike.timing.hits.length) h.slash=null;
    if (index===0&&move.step) this.moveUnit(h,dx*move.step,dz*move.step,.38);
    const final=step===3;
    const link=strike.link;
    const confirm=hits=>{
      if (!hits||this.state!=='play') return;
      this.hitstop = Math.max(this.hitstop,final?.061:.026);
      this.view.shake = Math.max(this.view.shake,final?.177:.074);
      if (final&&!strike.confirmed) invokeSchool(this,'wind');
      strike.confirmed=true;
    };
    this.audio.attack(this.weapon.id,step,'release',index);
    confirm(strikeWith(this,dx,dz,move,pulse?.power??1,confirm,link?(unit,kind)=>this.confirmLink(link,unit,kind):undefined));
    if (link) {
      const travel=strikeTravel(move,h.reach*move.reach,true);
      const settle=()=>{
        link.pending=false;
        if (h.link===link&&!link.contacts.length) h.link=null;
      };
      if (travel) this.schedule(travel+.001,settle);
      else settle();
    }
  }

  confirmLink(link,unit,kind) {
    const h=this.hero;
    if (h.link!==link||h.spellCool>linkWindow||link.contacts.some(mark=>mark.unit===unit)) return;
    const first=link.contacts.length===0;
    if (link.contacts.length===6&&kind==='break'&&!link.contacts.some(mark=>mark.kind==='break')) link.contacts.pop();
    if (link.contacts.length<6) link.contacts.push({unit,kind,x:unit.x,z:unit.z});
    if (first) {
      link.until=this.t+linkWindow;
      if (h.spellCool<=0) this.audio.link(this.weapon.id,false);
    }
    if (this.weapon.id==='flameblade'&&link.contacts.length<=3) this.view.sealFx(unit.x,unit.z,this.weapon.tone,.72,.92);
    if (this.weapon.id==='stormbow'&&first) this.view.spark(unit.x,1.04,unit.z,this.weapon.tone,9,.79);
  }

  readyLink() {
    const h=this.hero;
    return h.spellCool<=0&&h.link?.until>this.t?h.link:null;
  }

  interruptLink() {
    if (this.hero.link?.pending&&!this.hero.link.contacts.length) {
      this.hero.link=null;
      this.buffered.spell=0;
    }
  }

  cast(input,link=this.readyLink()) {
    const h = this.hero;
    h.spellCool = h.spellTime;
    h.link=null;
    if (link) {
      const profile=skillLinks[this.weapon.id];
      const wind=profile.wind;
      invokeLinkedArm(this,link,wind);
      if (!h.rush) heroAction(h,'link',profile,{cycle:wind+.22,hits:[{at:wind}]});
      h.atk=h.rush?.size===0 ? .26 : wind+.22;
      h.atkTotal=h.atk;
      h.combo=h.comboLeft=0;
      h.linkFlash=.77;
      this.audio.link(this.weapon.id,true);
    } else {
      invokeArm(this,input);
      if (!h.rush) heroAction(h,'cast');
      h.atk=Math.max(h.atk,.16);
      this.audio.arm(this.weapon.id);
    }
    invokeSchool(this,'fire');
    this.view.shake = Math.max(this.view.shake,.12);
  }

  schedule(delay, fire) {
    this.rituals.push({delay,fire});
  }

  updateRituals(dt) {
    const pending=this.rituals;
    this.rituals=[];
    for (const event of pending) {
      event.delay-=dt;
      if (event.delay>0) this.rituals.push(event);
      else event.fire();
    }
  }

  impact(unit,origin,kind,tint) {
    if (kind==='break'&&unit.attack) {
      unit.attack.interrupted=true;
      unit.attack=null;
      unit.motion=null;
    }
    recoil(unit,origin,kind);
    this.view.impact(unit,origin,kind,tint);
    const material=unit.spec?.guard?'armor':unit.spec?.effect==='stone'?'stone':'hide';
    this.audio.impact(kind,material);
    const shake=kind==='break'?.19:kind==='heavy'?.13:kind==='fall'?.12:0;
    this.view.shake=Math.max(this.view.shake,shake);
    if (kind==='break') this.hitstop=Math.max(this.hitstop,.066);
  }

  hit(unit,amount,origin,knock,tint=this.weapon.tone,weight,report) {
    if (unit.kind==='arenaAnchor') return this.bossArena?.hit(unit,amount)??false;
    if (unit.hp<=0 || unit.age<.23 || unit.phaseGuard>0) return false;
    const boss=unit.kind==='boss';
    if (boss&&this.bossArena?.locked) {
      this.bossArena.rejectHit(origin);
      return false;
    }
    const phaseBoundary=boss ? unit.spec.phases[unit.bossPhase]??0 : 0;
    const nextPhaseHp=phaseBoundary*unit.spec.hp;
    const shield=unit.spec.guard&&unit.guardOpen<=0&&unit.attack&&unit.attack.time>unit.spec.time*.34;
    const heavy=weight==='heavy'||(!weight&&(Math.abs(knock)>=1.21||amount>=this.hero.damage*1.44));
    unit.hp -= amount*(unit.exposed>0?1.24:1)*(shield?.73:1);
    if (phaseBoundary) unit.hp=Math.max(nextPhaseHp,unit.hp);
    const kind=unit.hp<=0?'fall':shield?(heavy?'break':'block'):heavy?'heavy':'light';
    if (kind==='break') {
      unit.guardOpen=1.48;
      unit.exposed=Math.max(unit.exposed,1.48);
    }
    this.impact(unit,origin,kind,tint);
    unit.stun = unit.kind==='boss'?.033:kind==='break'?.31:.14;
    if (unit.raider && distance(this.hero,unit)<4.8) unit.lured=1.45;
    const len = Math.max(.05,distance(unit,origin));
    unit.kx += (unit.x-origin.x)/len*knock*4.4/unit.spec.mass;
    unit.kz += (unit.z-origin.z)/len*knock*4.4/unit.spec.mass;
    if (phaseBoundary && unit.hp<=nextPhaseHp) {
      unit.bossPhase++;
      unit.phaseGuard=.91;
      unit.step=Math.max(unit.step,unit.bossPhase);
      this.bossArena?.transform(unit.bossPhase);
      this.beginEnemyAttack(unit,unit.spec.attacks[0]);
      this.view.bossCue(unit,'phase');
      this.view.spark(unit.x,2.6,unit.z,unit.spec.tint,34,1.43,unit.spec.effect);
      const terrain=this.bossArena?.plan;
      const form=unit.bossPhase===2?'最後攻勢':unit.spec.form;
      const title=this.bossArena?.aftershock?'場地再變':terrain?.title;
      this.announce(unit.spec.name,form+(title?' · '+title:''),terrain?.hint??unit.spec.signature,2.0);
      this.audio.boss(unit.spec.effect,true);
    }
    if (unit.hp<=0) {
      this.kills++;
      const h = this.hero;
      h.hp = Math.min(h.maxHp,h.hp+h.leech);
      this.fallen.push(unit);
      if (boss) this.view.bossCue(unit,'defeat');
      if (unit.kind!=='boss' && (this.kills%4===0 || Math.random()<.10)) this.drop(unit);
    }
    report?.(unit,kind);
    return true;
  }

  drop(unit) {
    const pickup = {x:unit.x,z:unit.z,life:13,visual:this.view.createActor(8,.91)};
    this.pickups.push(pickup);
    this.view.spark(unit.x,.38,unit.z,0xffdfa5,12,.74);
  }

  hurt(amount,x,z,attacker,pattern) {
    const h = this.hero;
    if (h.invulnerable>0 || this.state!=='play') return false;
    const guarded=h.ward>0;
    h.hp = Math.max(0,h.hp-amount*(1-h.armor)*(guarded?.24:1));
    h.invulnerable = .64;
    const heavy=['cleave','pounce','lance','burst','counterCharge','sweep','arenaBait'].includes(pattern)
      || amount>=h.maxHp*.15;
    const origin=Math.hypot(h.x-x,h.z-z)<.18&&attacker ? attacker : {x,z};
    const kind=h.hp===0?'fall':guarded?'block':heavy?'heavy':'light';
    this.impact(h,origin,kind,guarded?0x91eee0:0xffad7d);
    const len = Math.max(.15,Math.hypot(h.x-x,h.z-z));
    this.moveUnit(h,(h.x-x)/len*.48,(h.z-z)/len*.48,.38);
    this.interruptLink();
    h.slash = null;
    h.motion=null;
    this.bound(h);
    this.damageFlash = guarded?.24:heavy?.70:.42;
    this.hitstop = Math.max(this.hitstop,heavy?.061:.032);
    if (guarded&&this.weapon.id==='turtle') reflectHit(this,attacker);
    if (h.hp>0) invokeSchool(this,'ward',attacker);
    if (h.hp===0) {
      h.rolling=0;
      h.ward=0;
      h.move=0;
      this.state='falling';
      this.audio.active=false;
      this.input.reset();
      this.ui.inspect.hidden=true;
    }
    return true;
  }

  lanternTarget() {
    return this.mission?.started && !this.mission.finished && this.mission.light>0 ? this.mission.plan.altar : null;
  }

  enemyTarget(unit) {
    return unit.raider && !(unit.lured>0) ? this.lanternTarget()??this.hero : this.hero;
  }

  beginEnemyAttack(unit,forcedPattern) {
    const h=this.enemyTarget(unit), spec=unit.spec;
    const d=Math.max(.05,distance(unit,h));
    const dx=(h.x-unit.x)/d, dz=(h.z-unit.z)/d;
    if (Math.abs(dx)>.1) unit.face=Math.sign(dx);
    const boss=unit.kind==='boss';
    const phase=unit.bossPhase;
    let index=unit.step++;
    if (!boss) index+=this.stage.room+this.wave;
    let pattern=forcedPattern??spec.attacks[index%spec.attacks.length];
    if (unit.kind==='oracle'&&this.stage.room>=6&&unit.step%4===0) {
      pattern=this.stage.enemyPattern==='summon'?'marked':this.stage.enemyPattern;
    }
    if (pattern==='summon'&&unit.summons>=2) pattern='prison';
    const time=spec.time*(1-phase*.12);
    unit.attack={pattern,time,windup:time,dx,dz};
    unit.attack.landing=telegraph(this,pattern,unit,h,{delay:time,damage:spec.hurt+phase*5,radius:spec.radius,owner:unit,phase});
    if (boss && phase>=1 && index%3===2) {
      const echo=spec.attacks[(index+1)%spec.attacks.length];
      telegraph(this,['summon','blink','rally'].includes(echo)?'marked':echo,unit,h,
        {delay:time+.52,damage:spec.hurt*.72,radius:spec.radius*.72,owner:unit,phase});
    }
    this.audio.play('warning');
  }

  resolveEnemyAttack(unit) {
    const attack=unit.attack;
    const boss=unit.kind==='boss';
    unit.attack=null;
    unit.motion={pattern:attack.pattern,dx:attack.dx,dz:attack.dz,age:0};
    unit.recover=boss?.56-unit.bossPhase*.08:.29;
    unit.cool=(boss?1.16-unit.bossPhase*.19:1.21/this.stage.pace)+random(.12,.45);
    if (attack.pattern==='pounce') {
      const impulse=boss?19:15;
      unit.kx=attack.dx*impulse;
      unit.kz=attack.dz*impulse;
    }
    if (attack.landing) {
      const {x,z}=attack.landing;
      this.view.bolt({x:unit.x,y:.72,z:unit.z},{x,y:.61,z},unit.spec.tint,1.65);
      unit.x=x;
      unit.z=z;
      this.view.spark(x,.58,z,unit.spec.tint,18,.86,'void');
    }
    this.audio.release(attack.pattern,boss);
    if (boss) {
      this.bossArena?.counters.resolveAttack(attack);
      this.view.shake=Math.max(this.view.shake,.13);
    }
  }

  updateEnemies(dt) {
    for (const unit of this.enemies) {
      if (unit.hp<=0) continue;
      const spec=unit.spec;
      unit.age+=dt;
      if (unit.motion) unit.motion.age+=dt;
      unit.guardOpen-=dt;
      unit.flash=Math.max(0,unit.flash-dt*5);
      unit.stun-=dt;
      unit.recover-=dt;
      unit.cool-=dt;
      unit.chill-=dt;
      unit.exposed-=dt;
      unit.phaseGuard-=dt;
      unit.morale-=dt;
      if (unit.lured>0) unit.lured-=dt;
      const arena=this.bossArena?.boss===unit?this.bossArena:null;
      if (arena?.counters.stagger>0||arena?.counters.moveCharge(dt)) continue;
      const lunging=unit.motion?.pattern==='pounce'&&unit.motion.age<.31;
      const old=lunging?{x:unit.x,z:unit.z}:null;
      this.moveUnit(unit,unit.kx*dt,unit.kz*dt,.35);
      if (old) this.view.motion.enemyTrail(old,unit);
      unit.kx*=Math.exp(-dt*10); unit.kz*=Math.exp(-dt*10);
      unit.move*=Math.exp(-dt*13);
      if (unit.attack) {
        unit.attack.time-=dt;
        if (unit.attack.time<=0) this.resolveEnemyAttack(unit);
        continue;
      }
      if (unit.age<.38 || unit.stun>0 || unit.recover>0) continue;
      const h=this.enemyTarget(unit);
      const dist = Math.max(.045,distance(h,unit));
      const dx=(h.x-unit.x)/dist, dz=(h.z-unit.z)/dist;
      if (Math.abs(dx)>.14) unit.face=Math.sign(dx);
      const attackRange=h===this.hero ? spec.reach : Math.min(spec.reach,spec.ranged??1.85);
      if (unit.cool<=0&&arena) {
        if (arena.counters.tryCharge(dist)) continue;
        if (dist<attackRange+3.2&&arena.tactics.tryAttack()) continue;
      }
      if (dist<attackRange && unit.cool<0) {
        this.beginEnemyAttack(unit);
        continue;
      }
      const target = h!==this.hero ? attackRange*.64 : spec.ranged??(unit.kind==='boss'?2.8:spec.reach*.67);
      const direction = dist>target ? 1 : spec.ranged&&dist<target*.63 ? -.82 : 0;
      let sx=0,sz=0;
      for (const other of this.enemies) {
        if (unit===other || other.hp<=0) continue;
        const between=distance(unit,other);
        if (between>.02 && between<1.30) {
          sx+=(unit.x-other.x)/between*(1.30-between)*2.3;
          sz+=(unit.z-other.z)/between*(1.30-between)*2.3;
        }
      }
      const aggression = (1+unit.bossPhase*.17)*(unit.chill>0?(unit.kind==='boss'?.81:.57):1)*(unit.morale>0?1.31:1);
      const advance=direction*spec.speed*aggression*dt;
      const traveled=this.moveUnit(unit,dx*advance+sx*dt,dz*advance+sz*dt,.35);
      if (direction && traveled<Math.abs(advance)*.38) {
        const side=unit.phase>Math.PI?-1:1;
        const sidestep=Math.abs(advance)*side;
        if (this.moveUnit(unit,-dz*sidestep,dx*sidestep,.35)<Math.abs(sidestep)*.35) {
          this.moveUnit(unit,dz*sidestep,-dx*sidestep,.35);
        }
      }
      unit.move=Math.min(1,unit.move+Math.abs(direction)*dt*9);
    }
    this.enemies = this.enemies.filter(unit=>unit.hp>0);
  }

  updateHazards(dt) {
    if (this.stage.hazard && this.enemies.length) {
      this.ambientClock-=dt;
      if (this.ambientClock<=0) {
        const {zone,room,bearing,damage,hazard}=this.stage;
        const origin={x:Math.cos(bearing)*4.9,z:-3.8+Math.sin(bearing)*1.8};
        telegraph(this,hazard,origin,this.hero,{delay:1.05+(room%4)*.11,damage:(7+zone.frame*.39)*damage,radius:1.34+room*.08});
        this.ambientClock=Math.max(4.2,7.1-room*.19-this.stage.chapter*.13);
      }
    }
    advanceThreats(this,dt);
  }

  clearThreats() {
    for (const hazard of this.hazards) {
      if (hazard.visual) this.view.removeProjectile(hazard.visual);
    }
    this.hazards.length=0;
  }

  updatePickups(dt) {
    this.pickups = this.pickups.filter(item=>{
      item.life-=dt;
      const h=this.hero;
      const d=distance(h,item);
      if (d<.78 || item.life<=0) {
        if (d<.78) {
          h.hp=Math.min(h.maxHp,h.hp+11);
          this.audio.play('blessing');
          this.view.spark(item.x,.56,item.z,0xffdd9a,12,.65);
        }
        this.view.removeActor(item.visual);
        return false;
      }
      if (d<2.2) {
        item.x+=(h.x-item.x)*dt*3.4;
        item.z+=(h.z-item.z)*dt*3.4;
      }
      return true;
    });
  }

  updateFlow(dt) {
    if (this.discovery) return;
    if (this.startDelay !== Infinity) {
      this.startDelay-=dt;
      if (this.startDelay<=0) {
        if (this.mission) {
          this.startDelay=Infinity;
          this.mission.start();
        } else this.startWave();
      }
      return;
    }
    if (this.mission?.started) {
      this.mission.tick(dt);
      return;
    }
    if (this.enemies.length) return;
    this.clearDelay+=dt;
    if (this.clearDelay<.89) return;
    this.clearDelay=0;
    this.clearThreats();
    this.rituals.length=0;
    if (this.wave<this.stage.waves.length) {
      this.announce('結界再起','下一波','月蝕正在召喚更多的影子。',1.2);
      this.startDelay=1.18;
    } else {
      this.completeRoom();
    }
  }

  completeRoom(message,retreat=false) {
    if (this.state!=='play') return;
    if (this.mission) this.mission.finished=true;
    this.ui.inspect.hidden=true;
    this.ui['mission-status'].hidden=true;
    this.ui['boss-hud'].hidden=true;
    this.clearThreats();
    this.rituals.length=0;
    if (retreat) {
      for (const enemy of this.enemies) this.view.spark(enemy.x,.55,enemy.z,this.stage.zone.color,10,.48);
      this.clearActors();
    }
    this.blessing(message);
  }

  setupMissionPins() {
    const arena=this.bossArena?.phase>0;
    const points=arena ? this.bossArena.points : this.mission?.plan.points??[];
    this.pins=points.map(point=>{
      const element=document.createElement('i');
      element.textContent=point.symbol??'✧';
      element.hidden=true;
      if (arena) element.classList.add('arena-pin');
      return {point,element};
    });
    this.ui['mission-pins'].replaceChildren(...this.pins.map(pin=>pin.element));
  }

  updateMissionPins() {
    if (this.bossArena?.phase>0) {
      const {width,height}=this.view;
      const arena=this.bossArena;
      for (const {point,element} of this.pins) {
        element.hidden=!arena.locked||point.done||arena.boss.hp<=0;
        if (element.hidden) continue;
        const screen=this.view.project(point.x,arena.plan.mode==='hold'?.52:1.35,point.z);
        const x=clamp(screen.x,24,width-24);
        const y=clamp(screen.y,Math.min(136,height*.32),Math.max(height-150,height*.72));
        element.classList.toggle('edge',x!==screen.x||y!==screen.y);
        element.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px) translate(-50%,-50%)';
      }
      return;
    }
    const mission=this.mission;
    for (const [index,{point,element}] of this.pins.entries()) {
      const taken=mission.found.has(index);
      const revealed=mission.plan.type==='circuit'||distance(point,this.hero)<4.25;
      const screen=this.view.project(point.x,.86,point.z);
      element.hidden=!revealed||mission.finished||(mission.plan.type==='search'&&taken)
        ||screen.x<0||screen.x>this.view.width||screen.y<70||screen.y>this.view.height-95;
      if (!element.hidden) {
        element.classList.toggle('lit',taken);
        element.style.transform='translate('+Math.round(screen.x)+'px,'+Math.round(screen.y)+'px) translate(-50%,-50%)';
      }
    }
  }

  animateActors(dt) {
    const h=this.hero, t=this.t;
    advanceReaction(h,dt);
    const isRoll=h.rolling>0;
    const action=heroPose(h);
    const knockedDown=h.reaction?.kind==='fall';
    if (knockedDown) this.playLanding(h);
    const pose=knockedDown?0:isRoll?1:action?2:h.move>.34&&Math.sin(t*20)>-.35?1:0;
    const stride=h.move*Math.sin(t*20);
    const heroFrame={
      frame:pose,poseSize:pose===1?.83:pose===2?1.08:1,face:action?.face??h.face,
      bob:isRoll? .14 : .055+Math.abs(stride)*.15+Math.sin(t*4.1)*.036,
      tilt:isRoll?0:stride*.073,
      squash:isRoll?.74:1+Math.sin(t*(h.move>.25?20:4.2))*(.03+h.move*.027),
      stretch:isRoll?1.08:1,
      roll:isRoll&&!h.rush?-h.face*(1-h.rolling/h.rollDuration)*TAU:0,
      flash:h.flash,fade:h.invulnerable>0 && !isRoll && Math.sin(t*33)<-.35 ? .74 : 1,
      aura:h.ward>0||h.surge>0?.55:.24,rim:this.weapon.tone,
    };
    this.view.actor(this.heroVisual,h,blendPose(blendPose(heroFrame,action),reactionPose(h)));
    this.view.setWard(h);
    for (const unit of this.enemies) {
      if (unit.hp<=0) continue;
      advanceReaction(unit,dt);
      const boss=unit.kind==='boss';
      const shielded=boss&&this.bossArena?.locked;
      const staggered=boss&&this.bossArena?.counters.stagger>0;
      const wind=unit.attack ? 1-clamp(unit.attack.time/unit.spec.time,0,1) : 0;
      const oscillation=Math.sin(t* (boss?7:13)+unit.phase);
      const fierce=unit.bossPhase>0;
      const owlDive=unit.spec.frame===6&&(wind>.42||unit.recover>.37);
      const frame={
        frame:owlDive?7:unit.spec.frame,face:unit.face,flash:unit.flash,ink:unit.spec.ink,
        poseSize:owlDive?.84:1,
        bob:Math.abs(oscillation)*unit.move*.14+(unit.spec.float??0)*(1.7+oscillation)+(boss?.035:0),fade:Math.min(1,unit.age*4.5),
        squash:1+oscillation*(.028+unit.move*.032),
        tilt:staggered?unit.face*-.25+oscillation*.052:oscillation*.046*unit.move,
        warm:fierce?.42:0,
        aura:staggered?.82:unit.phaseGuard>0||shielded?.65:unit.chill>0||unit.exposed>0?.38:unit.attack||boss?.25:.09,
        rim:staggered?0x9ff4e4:shielded?this.bossArena.terrain.ink:unit.chill>0?0x8de2de:unit.morale>0?0xffd48b:unit.exposed>0?0xff8255:unit.spec.tint,
        phase:unit.bossPhase,
      };
      this.view.actor(unit.visual,unit,blendPose(blendPose(frame,staggered?null:enemyPose(unit)),reactionPose(unit,boss)));
    }
    this.fallen=this.fallen.filter(unit=>{
      advanceReaction(unit,dt);
      this.playLanding(unit);
      if (unit.reaction.age>=reactionTime.fall) {
        this.view.removeActor(unit.visual);
        return false;
      }
      this.view.actor(unit.visual,unit,blendPose({frame:unit.spec.frame,face:unit.face,flash:0,
        fade:1,squash:1,tilt:0,bob:0,aura:.03,phase:unit.bossPhase},reactionPose(unit)));
      return true;
    });
    for (const item of this.pickups) this.view.actor(item.visual,item,{frame:8,bob:.34+Math.sin(t*4.4)*.15,aura:.55,rim:0xffbf78});
  }

  playLanding(unit) {
    const reaction=unit.reaction;
    if (reaction.age<.32||reaction.landed) return;
    reaction.landed=true;
    this.view.fallDust(unit);
  }

  step(dt,input) {
    if (this.state==='falling') {
      this.animateActors(dt);
      if (this.hero.reaction.age>=reactionTime.fall) this.finish(false);
      return;
    }
    this.buffered.dodge = input.dodge ? .39 : this.buffered.dodge-dt;
    const h=this.hero;
    const finishing=h.link?.pending||(h.combo===2&&h.comboLeft>0&&h.atk<.14&&(input.strike||this.buffered.strike>0));
    this.buffered.spell = input.spell ? (finishing?.96:.35) : this.buffered.spell-(this.hitstop>0?0:dt);
    this.buffered.strike = input.strike ? Math.max(.23,this.hero.atk+.09) : this.buffered.strike-dt;
    if (this.hitstop>0) {
      this.hitstop-=dt;
      return;
    }
    this.elapsed+=dt;
    this.t+=dt;
    this.updateHero(dt,input);
    if (this.state!=='play') return;
    this.updateRituals(dt);
    this.updateEnemies(dt);
    this.bossArena?.tick(dt);
    this.updateHazards(dt);
    if (this.state==='play'&&!this.discovery&&this.enemies.length) invokeSchool(this,'thunder');
    if (this.state==='play') {
      this.updatePickups(dt);
      this.updateFlow(dt);
    }
    this.animateActors(dt);
  }

  renderUI() {
    const h=this.hero;
    const hp=fixed(h.hp);
    const label=hp+' / '+h.maxHp;
    if (this.ui['hp-number'].textContent!==label) {
      this.ui['hp-number'].textContent=label;
      this.ui['hp-fill'].style.transform='scaleX('+h.hp/h.maxHp+')';
      this.meter.setAttribute('aria-valuemax',h.maxHp);
      this.meter.setAttribute('aria-valuenow',hp);
    }
    const boss=this.enemies.find(unit=>unit.kind==='boss');
    if (this.stage.boss) this.ui['boss-fill'].style.transform='scaleX('+(boss?clamp(boss.hp/boss.spec.hp,0,1):0)+')';
    const arena=this.bossArena;
    const arenaHint=this.ui['boss-arena-hint'];
    arenaHint.hidden=!boss||!arena?.phase;
    arenaHint.classList.toggle('tactic',!!boss&&arena?.tactics.cueTime>0);
    this.ui['boss-hud'].classList.toggle('shielded',!!boss&&!!arena?.locked);
    if (!arenaHint.hidden) {
      const line=arena.status();
      if (arenaHint.textContent!==line) arenaHint.textContent=line;
    }
    const weakness=this.ui['boss-weakness'];
    weakness.hidden=arenaHint.hidden;
    if (!weakness.hidden) {
      const counter=arena.counters;
      const hint=counter.hint;
      weakness.classList.toggle('open',counter.stagger>0);
      weakness.classList.toggle('windup',counter.chargeHint>0);
      if (weakness.textContent!==hint) weakness.textContent=hint;
    }
    const cooldowns=[h.rollCool/h.rollTime,h.spellCool/h.spellTime,h.atk/h.atkTotal];
    const combo=String(h.comboLeft>0?h.combo:0);
    if (this.ui.strike.dataset.combo!==combo) this.ui.strike.dataset.combo=combo;
    const ready=this.readyLink();
    const queued=h.link?.pending&&!ready&&this.buffered.spell>0&&h.spellCool<=0;
    const linkState=ready?'ready':queued?'queued':h.linkFlash>0?'cast':'';
    const spell=this.ui.spell, hint=this.ui['skill-link'];
    if (spell.dataset.link!==linkState) {
      spell.dataset.link=linkState;
      hint.hidden=!linkState;
      const name=skillLinks[this.weapon.id].name;
      spell.setAttribute('aria-label',ready?'接技：'+name:this.weapon.skill);
      if (linkState) hint.textContent=linkState==='queued'?'等候命中':ready?'接技 · '+name:name+'！';
    }
    if (ready) spell.style.setProperty('--link-left',Math.round((ready.until-this.t)/linkWindow*360)+'deg');
    actionIds.forEach((id,index)=>this.ui[id].style.setProperty('--cool',Math.round(Math.max(0,cooldowns[index])*360)+'deg'));
    this.ui['damage-vignette'].style.opacity=String(this.damageFlash);
    const mission=this.mission;
    this.ui['mission-status'].hidden=!mission?.started||!!mission.finished;
    if (mission?.started&&!mission.finished) {
      const {text,fill}=mission.status();
      this.ui['mission-status'].dataset.mode=mission.plan.type;
      if (this.ui['mission-title'].textContent!==mission.plan.title) this.ui['mission-title'].textContent=mission.plan.title;
      if (this.ui['mission-text'].textContent!==text) this.ui['mission-text'].textContent=text;
      this.ui['mission-track'].hidden=fill===null;
      if (fill!==null) this.ui['mission-fill'].style.transform='scaleX('+fill+')';
    }
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    const dt=clamp((now-this.previousTime)/1000,0,.045);
    this.previousTime=now;
    if (!this.hero || document.hidden) return;
    const freezeWarnings=this.hitstop>0;
    if (this.state==='play'||this.state==='falling') {
      this.step(dt,this.state==='play'?this.input.read():null);
      this.damageFlash=Math.max(0,this.damageFlash-dt*1.74);
      this.announceLeft-=dt;
      if (this.announceLeft<=0) this.ui.announce.classList.remove('visible');
      if (this.schoolToast>0) {
        this.schoolToast-=dt;
        if (this.schoolToast<=0) this.ui['school-toast'].hidden=true;
      }
      this.renderUI();
      this.audio.update();
    }
    this.view.render(dt,this.hero,this.state!=='play'&&this.state!=='falling',freezeWarnings&&this.state==='play');
    this.updateMissionPins();
  }

  openModal({mark,kicker,title,copy,content,buttons,kind=''}) {
    this.input.reset();
    this.buffered = {dodge:0,spell:0,strike:0};
    this.ui['modal-mark'].textContent=mark;
    this.ui['modal-kicker'].textContent=kicker;
    this.ui['modal-title'].textContent=title;
    this.ui['modal-copy'].textContent=copy;
    this.ui['modal-copy'].hidden=!copy;
    this.ui.modal.dataset.kind=kind;
    this.ui['modal-content'].replaceChildren(...(content?[content]:[]));
    this.ui['modal-actions'].replaceChildren(...(buttons||[]));
    this.ui.modal.hidden=false;
    this.ui.hud.inert=true;
    this.ui.cover.inert=true;
    this.ui.modal.querySelector('button')?.focus({preventScroll:true});
  }

  closeModal() {
    this.ui.modal.hidden=true;
    this.ui.hud.inert=false;
    this.ui.cover.inert=false;
    this.input.reset();
  }

  blessing(message) {
    this.state='blessing';
    this.audio.play('blessing');
    const h=this.hero;
    const heal=Math.round(h.maxHp*((this.stage.boss?.36:.14)+h.recovery));
    h.hp=Math.min(h.maxHp,h.hp+heal);
    const grid=document.createElement('div');
    grid.className='relic-grid';
    const shuffled=shuffle(blessings);
    const suggested=shuffled.find(boon=>!this.ranks.has(boon.id)&&schoolProgress(this.ranks,boon.school).distinct>0);
    const options=suggested?shuffle([suggested,...shuffled.filter(boon=>boon!==suggested).slice(0,2)]):shuffled.slice(0,3);
    for (const relic of options) {
      const button=makeButton('',()=>this.choose(relic),'relic');
      const mark=document.createElement('strong'), name=document.createElement('b'), detail=document.createElement('span');
      const branch=document.createElement('small');
      const rank=this.ranks.get(relic.id)||0;
      const school=schools[relic.school];
      const count=schoolProgress(this.ranks,relic.school).distinct;
      branch.className='relic-school';
      branch.style.color=school.ink;
      const next=Math.min(3,count+Number(rank===0));
      branch.textContent=school.name+' '+next+'/3'+(next===3?' · '+school.skill:'');
      branch.title=school.detail;
      mark.textContent=relic.mark;
      name.textContent=relic.name+(rank?' · '+rank+' → '+(rank+1):'');
      detail.textContent=next===3&&count<3?school.detail:relic.detail;
      button.append(mark,name,detail,branch);
      grid.append(button);
    }
    this.openModal({mark:'✧',kicker:'第 '+this.stage.floor+' 關 · '+(message??'已完成'),title:'亡者的祝福',
      copy:'回復 '+heal+' 點生命。集齊同一流派嘅三款祝福，就會解鎖自動招式。',content:grid});
  }

  choose(relic) {
    if (this.state!=='blessing') return;
    this.relics.push(relic);
    const h=this.hero;
    const oldMax=h.maxHp;
    this.ranks=buildStats(h,this.weapon,this.stage.floor,this.relics);
    const extra=relic.id==='spring'?h.maxHp*.31:relic.id==='flower'?h.maxHp*.19:0;
    h.hp=Math.min(h.maxHp,h.hp+(h.maxHp-oldMax)+extra);
    const branch=relic.school;
    if (!this.learned.has(branch)&&schoolProgress(this.ranks,branch).distinct===3) {
      this.learned.add(branch);
      const note=this.ui['school-toast'];
      note.textContent='解鎖 '+schools[branch].skill+' · '+schools[branch].detail;
      note.hidden=false;
      this.schoolToast=3.2;
    }
    this.ui['relic-icons'].textContent='✦ '+this.relics.length+' '+[...this.learned].map(id=>schools[id].mark).join('');
    this.ui['relic-icons'].title=blessings.filter(item=>this.ranks.has(item.id))
      .map(item=>item.name+' ×'+this.ranks.get(item.id)).join('、');
    this.audio.play('blessing');
    if (this.stage.boss) {
      this.prepare(true);
      return;
    }
    this.state='play';
    this.closeModal();
    this.advanceAfterReward();
  }

  advanceAfterReward() {
    if (this.stage.floor<stages.length) {
      this.enter(this.level+1);
      return;
    }
    this.placeStory(ending);
    this.announce('名字重見天日',ending.title,'往王座走，讓牠們聽見鐘聲。',2.0);
  }

  togglePause() {
    if (this.state==='pause'||this.state==='journal') {
      this.state='play';
      this.audio.active=true;
      this.closeModal();
      return;
    }
    if (this.state!=='play') return;
    this.state='pause';
    this.audio.active=false;
    this.openModal({mark:'☾',kicker:'月蝕之夜',title:'稍作休息',
      copy:'WASD 移動，J 普通攻擊，空白鍵翻滾，Q 放神器技能，E 調查。手機用搖桿和畫面按鈕。',
      buttons:[makeButton('繼續旅程',()=>this.togglePause(),'primary'),makeButton('重新開始',()=>this.restart())]});
  }

  restart() {
    this.prepare();
  }

  retryFloor() {
    if (this.state!=='lost') return;
    this.kills=this.entryKills;
    this.hero.hp=Math.max(this.entryHp,this.hero.maxHp*.60);
    this.hitstop=this.damageFlash=0;
    this.state='play';
    this.audio.active=true;
    this.closeModal();
    this.enter(this.level);
  }

  finish(won,reason) {
    this.state=won?'won':'lost';
    this.audio.active=false;
    if (won) this.audio.play('blessing');
    const seconds=Math.floor(this.elapsed), time=Math.floor(seconds/60)+'分 '+seconds%60+'秒';
    const results=document.createElement('div');
    results.className='results';
    const storyClues=this.journal.filter(entry=>!entry.hiddenClue).length;
    const hiddenClues=this.journal.length-storyClues;
    for (const line of [this.weapon.name,'擊倒 '+this.kills,'用時 '+time,'主線 '+storyClues+'/10','隱藏 '+hiddenClues+'/10']) {
      const item=document.createElement('span');
      item.textContent=line;
      results.append(item);
    }
    const buttons=won
      ? [makeButton('再闖森林',()=>this.restart(),'primary')]
      : [makeButton('重試第 '+this.stage.floor+' 關',()=>this.retryFloor(),'primary'),makeButton('重新開始',()=>this.restart())];
    buttons.push(makeButton('返回主畫面',()=>this.showCover()));
    this.openModal(won ? {mark:'✷',kicker:'緋月之森 · 完成',title:'星火歸家',
      copy:'天亮之前，你和小燈一起回家。',content:results,buttons} :
      {mark:'☽',kicker:'第 '+this.stage.floor+' 關 · '+this.stage.name,title:reason==='lantern'?'祭燈被摧毀':'燈火熄滅',
        copy:reason==='lantern'?'守住祭燈直到倒數完結。重試會保留神器同祝福。':'重試此關會保留你的神器與祝福。',
        content:results,buttons});
  }

  showCover() {
    this.state='cover';
    this.closeModal();
    this.ui.hud.hidden=true;
    this.ui.cover.hidden=false;
    this.ui['relic-icons'].replaceChildren();
    this.ui.begin.focus();
  }
}

export let game;
try {
  const world=new Scenery($('world'));
  await world.load();
  game=new Game(world,new Audio());
  $('load-note').textContent='';
  $('begin').disabled=false;
  requestAnimationFrame(game.loop);
} catch (error) {
  console.error('Could not initialize the Eclipse Grove',error);
  $('load-note').textContent='森林載入失敗。請重新整理，並確認瀏覽器已啟用 WebGL。';
}
