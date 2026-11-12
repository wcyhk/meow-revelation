import {Scenery} from './scenery.mjs';
import {Audio} from './audio.mjs';
import {Input} from './input.mjs';

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = (x, low, high) => Math.max(low,Math.min(x,high));
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const blend = (speed,dt) => 1-Math.exp(-speed*dt);
const fixed = value => Math.max(0, Math.ceil(value));
const random = (low,high) => low + Math.random() * (high-low);
const actionIds = ['dodge','spell','strike'];

const stages = [
  {name:'緋石庭', roman:'I', line:'林下的石門，仍有人為亡者留燈。', waves:[['imp','imp','imp'],['imp','imp','cultist','cultist']]},
  {name:'銀霧迴廊', roman:'II', line:'水底的亡魂，記得每一個被抹去的名字。', waves:[['knight','cultist','imp'],['knight','knight','imp','cultist','imp']]},
  {name:'落日王座', roman:'III', line:'月蝕深處，守夜者用名字為自己加冕。', waves:[['boss']]},
];

const kinds = {
  imp:     {frame:3, height:1.71, hp:34, speed:3.30, reach:1.60, radius:1.55, time:.52, hurt:10, mass:.70},
  cultist: {frame:4, height:2.02, hp:42, speed:2.10, reach:6.8, radius:1.55, time:.92, hurt:11, mass:.95},
  knight:  {frame:5, height:2.58, hp:68, speed:2.05, reach:2.12, radius:2.05, time:.77, hurt:16, mass:1.65},
  boss:    {frame:6, height:5.05, hp:500, speed:2.66, reach:3.45, radius:3.7, time:.92, hurt:22, mass:4.1},
};

const relics = [
  {id:'thorn', mark:'✦',name:'荊棘刃',detail:'斬擊傷害提高 35%。', apply:h=>h.damage*=1.35},
  {id:'moon', mark:'☽',name:'銀月輪',detail:'月輪範圍更廣，冷卻縮至 4.2 秒。',apply:h=>{h.spellTime=4.2;h.spellRadius+=1.05;}},
  {id:'flower',mark:'❋',name:'白花',detail:'最大生命增加 25，立即回滿。',apply:h=>{h.maxHp+=25;h.hp=h.maxHp;}},
  {id:'step',mark:'»',name:'餘燼步',detail:'翻滾更快，落地會灼傷附近敵人。',apply:h=>{h.ember=true;h.rollTime=.7;}},
  {id:'star',mark:'✷',name:'流星露',detail:'每次擊倒敵人回復 5 點生命，月輪傷害增加。',apply:h=>{h.leech=5;h.spellDamage+=14;}},
  {id:'reach',mark:'◈',name:'長夜刃',detail:'斬擊距離增加，第三斬傷害再提高。',apply:h=>{h.reach+=.62;h.finisher+=.28;}},
];

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
    invulnerable:0,flash:0,atk:0,attackAge:1,slash:null,combo:0,comboLeft:0,
    rolling:0,rollCool:0,rollTime:.96,rollX:0,rollZ:-1,spellCool:0,spellTime:6,
    damage:23,reach:2.48,finisher:1.49,spellRadius:4.5,spellDamage:42,ember:false,leech:0,
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
    this.level = 0;
    this.wave = 0;
    this.enemies = [];
    this.fallen = [];
    this.hazards = [];
    this.pickups = [];
    this.relics = [];
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
      'relic-icons','route-name','route-dots','damage-vignette','announce','announce-kicker','announce-title','announce-line',
      'modal-kicker','modal-title','modal-copy','modal-mark','modal-content','modal-actions',...actionIds].map(id=>[id,$(id)]));
    this.meter = this.ui['hp-fill'].parentElement;
    this.input = new Input(view.canvas,()=>this.togglePause(),()=>this.state==='play');
    this.ui.begin.addEventListener('click',()=>this.start());
    this.ui.pause.addEventListener('click',()=>this.togglePause());
    this.ui.mute.addEventListener('click',()=>this.ui.mute.setAttribute('aria-pressed',String(audio.toggle())));
    addEventListener('resize',()=>this.view.resize());
    document.addEventListener('visibilitychange',() => {if(document.hidden && this.state==='play') this.togglePause();});
    this.loop = this.loop.bind(this);
  }

  start() {
    this.audio.start().catch(() => {});
    if (this.heroVisual) this.view.removeActor(this.heroVisual);
    this.hero = makeHero();
    this.heroVisual = this.view.createActor(0,2.68);
    this.relics = [];
    this.elapsed = 0;
    this.kills = 0;
    this.hitstop = 0;
    this.damageFlash = 0;
    this.buffered = {dodge:0,spell:0,strike:0};
    this.level = 0;
    this.wave = 0;
    this.state = 'play';
    this.audio.active = true;
    this.ui.cover.hidden = true;
    this.ui.hud.hidden = false;
    this.closeModal();
    this.enter(0);
    this.view.canvas.focus();
  }

  enter(level) {
    for (const unit of [...this.enemies,...this.fallen,...this.pickups]) this.view.removeActor(unit.visual);
    this.enemies.length = this.fallen.length = this.hazards.length = this.pickups.length = 0;
    this.level = level;
    this.wave = 0;
    this.clearDelay = 0;
    const stage = stages[level];
    const h = this.hero;
    h.x = 0; h.z = 7.45; h.vx = h.vz = 0;
    h.invulnerable = 1;
    h.rolling = h.atk = h.rollCool = h.spellCool = 0;
    h.slash = null;
    h.dx = 0; h.dz = -1;
    this.view.focus.set(0,0,-.65);
    this.view.setStage(level);
    this.audio.danger = level === 2;
    this.ui['boss-hud'].hidden = true;
    this.ui['route-name'].textContent = stage.name;
    this.ui['route-dots'].replaceChildren(...stages.map((_,index) => {
      const gem = document.createElement('i');
      gem.className = 'route-gem '+(index===level?'current':index<level?'done':'');
      return gem;
    }));
    this.objective(level===0 ? '留意紅色預警 · 翻滾可避開攻擊' : '穿越月蝕留下的封印');
    this.announce('緋月之森  /  '+stage.roman,stage.name,stage.line,2.5);
    this.startDelay = level === 2 ? 1.35 : 1.48;
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

  spawn(kind,x,z) {
    const spec = kinds[kind];
    const unit = {
      kind,spec,x,z,hp:spec.hp,face:x>0?-1:1,phase:random(0,TAU),attack:null,cool:random(.55,1.22),
      kx:0,kz:0,stun:0,flash:0,age:0,step:0,recover:0,move:0,
      visual:this.view.createActor(spec.frame,spec.height),
    };
    this.enemies.push(unit);
    this.view.spark(x,.27,z,this.level===1?0x7ce3cc:0xe49461,12,.68);
    return unit;
  }

  startWave() {
    const waves = stages[this.level].waves;
    const units = shuffle(waves[this.wave]);
    const count = units.length;
    const patterns = shuffle([[0,-1],[-3.7,1],[3.7,1],[-5.4,-3],[5.4,-3]]);
    for (let i=0;i<count;i++) {
      const [x,z] = units[i]==='boss'?[0,-2.8]:patterns[i];
      this.spawn(units[i],x+random(-.46,.46),z+random(-.46,.46));
    }
    this.startDelay = Infinity;
    this.wave++;
    this.objective(this.level===2 ? '斬斷王冠的封印' : '清除敵人  ·  '+this.wave+' / '+waves.length);
    if (this.level===2) {
      this.ui['boss-hud'].hidden = false;
      this.view.shock(0,-2.8,0xe47048,3.3);
      this.audio.play('heavy');
      this.announce('最後的封印','王冠守夜者','「我替牠們記住了一切。」',2.35);
    }
  }

  aim(input) {
    const h = this.hero;
    if (input.aim) {
      const center = this.view.project(h.x,.8,h.z);
      const x = input.aim.x-center.x, z = (input.aim.y-center.y)*1.55;
      const length = Math.hypot(x,z);
      if (length>7) return [x/length,z/length];
    }
    let nearest = null;
    let shortest = h.reach+.86;
    for (const foe of this.enemies) {
      const d = distance(h,foe);
      if (d < shortest + (foe.kind==='boss' ? .65 : 0)) {
        nearest = foe;
        shortest = d;
      }
    }
    if (nearest && shortest > .03) return [(nearest.x-h.x)/shortest,(nearest.z-h.z)/shortest];
    return [h.dx,h.dz];
  }

  updateHero(dt,input) {
    const h = this.hero;
    h.atk -= dt;
    h.comboLeft -= dt;
    h.attackAge += dt;
    h.rollCool -= dt;
    h.spellCool -= dt;
    h.invulnerable -= dt;
    h.flash = Math.max(0,h.flash-dt*4.3);
    const movement = Math.hypot(input.x,input.z);
    if (movement>.07 && h.rolling<=0 && !h.slash) {
      h.dx = input.x/movement; h.dz = input.z/movement;
      if (Math.abs(h.dx)>.14) h.face = Math.sign(h.dx);
    }
    if (this.buffered.dodge>0 && h.rollCool<=0 && h.rolling<=0) {
      this.buffered.dodge=0;
      h.rolling = .30;
      h.rollCool = h.rollTime;
      h.invulnerable = Math.max(h.invulnerable,.35);
      h.rollX = movement>.07 ? input.x/movement : h.dx;
      h.rollZ = movement>.07 ? input.z/movement : h.dz;
      h.slash = null;
      h.attackAge = 1;
      this.audio.play('roll');
      this.view.spark(h.x,.2,h.z,0xe5b17b,13,.6);
    }
    if (h.rolling>0) {
      h.x += h.rollX*13.6*dt;
      h.z += h.rollZ*13.6*dt;
      h.rolling -= dt;
      h.vx = h.rollX * 4; h.vz = h.rollZ * 4;
      if (h.rolling<=0 && h.ember) {
        this.view.shock(h.x,h.z,0xff783c,2.05,.64);
        for (const foe of this.enemies) if (distance(h,foe)<2.1) this.hit(foe,16,h,.6);
      }
    } else {
      const speed = h.attackAge<.18 ? 3.55 : 5.7;
      const drag = blend(movement>.07?18:22,dt);
      h.vx += (input.x*speed-h.vx)*drag;
      h.vz += (input.z*speed-h.vz)*drag;
      h.x += h.vx*dt; h.z += h.vz*dt;
      if (this.buffered.spell>0 && h.spellCool<=0) {
        this.buffered.spell=0;
        this.cast();
      }
      if (this.buffered.strike>0 && h.atk<=0) {
        this.buffered.strike=0;
        this.attack(input);
      }
      if (h.slash) {
        h.slash.delay -= dt;
        if (h.slash.delay<=0) this.landSlash();
      }
    }
    this.bound(h);
    h.move += (Math.min(1,Math.hypot(h.vx,h.vz)/5)-h.move)*blend(14,dt);
    if (this.view.portal.visible && this.nearPortal() && (input.interact || h.z < -6.05)) {
      this.view.portal.visible = false;
      this.enter(this.level+1);
    }
  }

  bound(unit) {
    unit.z = clamp(unit.z,-7.55,11.15);
    const edge = unit.z < -3.9 ? 10.35 : 11.45;
    unit.x = clamp(unit.x,-edge,edge);
  }

  nearPortal() {return Math.hypot(this.hero.x,this.hero.z+6.75)<1.65;}

  attack(input) {
    const h = this.hero;
    const [dx,dz] = this.aim(input);
    h.dx = dx; h.dz = dz;
    if (Math.abs(dx)>.12) h.face = Math.sign(dx);
    h.combo = h.comboLeft>0 ? h.combo%3+1 : 1;
    h.comboLeft = .86;
    h.atk = h.combo===3 ? .42 : .28;
    h.attackAge = 0;
    h.slash = {dx,dz,delay:.057};
    h.x += dx*.18;
    h.z += dz*.18;
  }

  landSlash() {
    const h = this.hero, {dx,dz} = h.slash;
    h.slash = null;
    const final = h.combo===3;
    const reach = h.reach + (final?.40:0);
    this.view.slash(h.x,h.z,dx,dz,final?0xff7947:0xffc486,reach,final);
    this.audio.play('swing');
    let hits = 0;
    for (const foe of this.enemies) {
      const deltaX=foe.x-h.x, deltaZ=foe.z-h.z;
      const d=Math.hypot(deltaX,deltaZ);
      const facing = (dx*deltaX + dz*deltaZ) / Math.max(.03,d);
      const margin = foe.kind==='boss' ? .72 : .21;
      if (d > reach+margin || (d>1.02 && facing<(final ? -.25 : .20))) continue;
      const power = final ? h.finisher : h.combo===2?1.12:1;
      if (this.hit(foe,h.damage*power,h,final?1.8:.97)) hits++;
    }
    if (hits) {
      this.hitstop = final ? .067 : .034;
      this.view.shake = final ? .195 : .089;
      this.audio.play(final?'heavy':'hit');
    }
  }

  cast() {
    const h = this.hero;
    h.spellCool = h.spellTime;
    h.invulnerable = Math.max(h.invulnerable,.18);
    this.view.moon(h.x,h.z,h.spellRadius);
    for (const unit of this.enemies) if (distance(unit,h)<h.spellRadius+.25) this.hit(unit,h.spellDamage,h,1.62);
    this.hazards = this.hazards.filter(hazard=>{
      if (hazard.kind!=='spark' || distance(hazard,h)>h.spellRadius) return true;
      this.view.spark(hazard.x,.26,hazard.z,0xffdc8c,9,.65);
      return false;
    });
    this.hitstop = .065;
    this.view.shake = .19;
    this.audio.play('moon');
  }

  hit(unit,amount,origin,knock) {
    if (unit.hp<=0 || unit.age<.23) return false;
    unit.hp -= amount;
    unit.flash = .78;
    unit.stun = unit.kind==='boss' ? .033 : .14;
    const len = Math.max(.05,distance(unit,origin));
    unit.kx += (unit.x-origin.x)/len*knock*4.4/unit.spec.mass;
    unit.kz += (unit.z-origin.z)/len*knock*4.4/unit.spec.mass;
    this.view.spark(unit.x,unit.spec.height*.47,unit.z,0xff9d62,unit.hp<=0?24:10,1.15);
    if (unit.kind==='boss' && unit.hp>0 && unit.hp<unit.spec.hp*.53 && !unit.phaseTwo) {
      unit.phaseTwo=true;
      unit.step=2;
      unit.cool=Math.min(unit.cool,.36);
      this.view.spark(unit.x,2.6,unit.z,0xffa259,34,1.43);
      this.announce('王冠守夜者','王冠碎裂','森林開始吐出失落的名字。',1.65);
      this.audio.play('heavy');
    }
    if (unit.hp<=0) {
      this.kills++;
      const h = this.hero;
      h.hp = Math.min(h.maxHp,h.hp+h.leech);
      unit.death = 0;
      this.fallen.push(unit);
      if (unit.kind!=='boss' && (this.kills%4===0 || Math.random()<.10)) this.drop(unit);
    }
    return true;
  }

  drop(unit) {
    const pickup = {x:unit.x,z:unit.z,life:13,visual:this.view.createActor(8,.91)};
    this.pickups.push(pickup);
    this.view.spark(unit.x,.38,unit.z,0xffdfa5,12,.74);
  }

  hurt(amount,x,z) {
    const h = this.hero;
    if (h.invulnerable>0 || this.state!=='play') return false;
    h.hp = Math.max(0,h.hp-amount);
    h.invulnerable = .64;
    h.flash = .9;
    const len = Math.max(.15,Math.hypot(h.x-x,h.z-z));
    h.x += (h.x-x)/len*.48;
    h.z += (h.z-z)/len*.48;
    h.slash = null;
    this.bound(h);
    this.damageFlash = .78;
    this.view.shake = .26;
    this.hitstop = .067;
    this.audio.play('hurt');
    if (h.hp===0) this.finish(false);
    return true;
  }

  beginEnemyAttack(unit) {
    const h=this.hero, spec=unit.spec;
    const d=Math.max(.05,distance(unit,h));
    const dx=(h.x-unit.x)/d, dz=(h.z-unit.z)/d;
    if (Math.abs(dx)>.1) unit.face=Math.sign(dx);
    const attack={kind:'circle',time:spec.time,radius:spec.radius,x:unit.x+dx*.5,z:unit.z+dz*.5,damage:spec.hurt,dx,dz};
    if (unit.kind==='cultist') {
      attack.x=h.x; attack.z=h.z;
    }
    if (unit.kind==='boss') {
      const phase = unit.hp < unit.spec.hp*.53 ? 2 : 1;
      const pattern = unit.step++ % 3;
      attack.time *= phase===2?.78:1;
      attack.damage += phase===2?3:0;
      if (pattern===1) {
        attack.kind='line';
        attack.radius=7.7;
        attack.x=unit.x+dx*attack.radius*.48;
        attack.z=unit.z+dz*attack.radius*.48;
      } else if (pattern===2) {
        attack.kind='sigils';
        attack.radius=2.12;
        attack.x=h.x; attack.z=h.z;
      }
    }
    unit.attack = attack;
    this.view.warning(attack.kind==='line'?'line':'circle',attack.x,attack.z,attack.radius,attack.time,-Math.atan2(dz,dx));
    if (attack.kind==='sigils') {
      const start = random(0,TAU);
      for (let i=0;i<4;i++) {
        const angle=start+i*TAU/4;
        const x=clamp(attack.x+Math.cos(angle)*4.3,-10.8,10.8);
        const z=clamp(attack.z+Math.sin(angle)*4.3,-7.2,10.5);
        this.hazards.push({kind:'seal',x,z,radius:1.60,delay:attack.time+.26+i*.085,damage:14});
        this.view.warning('circle',x,z,1.60,attack.time+.26+i*.085);
      }
    }
    this.audio.play('warning');
  }

  resolveEnemyAttack(unit) {
    const a=unit.attack, h=this.hero;
    unit.attack=null;
    unit.recover = unit.kind==='boss' ? .67 : .29;
    unit.cool = (unit.kind==='boss' ? (unit.hp < unit.spec.hp*.53 ? .83 : 1.16) : 1.16) + random(.11,.52);
    if (a.kind==='line') {
      const along = (h.x-a.x)*a.dx+(h.z-a.z)*a.dz;
      const across = (h.x-a.x)*-a.dz+(h.z-a.z)*a.dx;
      for (let n=1;n<=4;n++) this.view.shock(unit.x+a.dx*n*1.54,unit.z+a.dz*n*1.54,0xff6239,1.0,.34);
      if (Math.abs(along)<a.radius*.54 && Math.abs(across)<1.04) this.hurt(a.damage,a.x,a.z);
      unit.kx = a.dx*5; unit.kz = a.dz*5;
    } else {
      this.view.shock(a.x,a.z,unit.kind==='cultist'?0xffad56:0xe65334,a.radius,unit.kind==='boss'?1:.38);
      if (distance(h,a)<a.radius+.16) this.hurt(a.damage,a.x,a.z);
    }
    if (unit.kind==='boss') {
      this.view.shake=Math.max(this.view.shake,.15);
      this.audio.play('heavy');
      if (unit.hp<unit.spec.hp*.53 && a.kind==='circle') this.bossSparks(unit);
    }
  }

  bossSparks(unit) {
    const start = random(0,TAU);
    for (let i=0;i<9;i++) {
      const angle=start+i*TAU/9;
      const dx=Math.cos(angle), dz=Math.sin(angle);
      this.hazards.push({kind:'spark',x:unit.x+dx*.6,z:unit.z+dz*.6,dx,dz,delay:2.25,damage:13});
    }
  }

  updateEnemies(dt) {
    const h=this.hero;
    for (const unit of this.enemies) {
      if (unit.hp<=0) continue;
      const spec=unit.spec;
      unit.age+=dt;
      unit.flash=Math.max(0,unit.flash-dt*5);
      unit.stun-=dt;
      unit.recover-=dt;
      unit.cool-=dt;
      unit.x+=unit.kx*dt; unit.z+=unit.kz*dt;
      unit.kx*=Math.exp(-dt*10); unit.kz*=Math.exp(-dt*10);
      unit.move*=Math.exp(-dt*13);
      if (unit.attack) {
        unit.attack.time-=dt;
        if (unit.attack.time<=0) this.resolveEnemyAttack(unit);
        continue;
      }
      if (unit.age<.38 || unit.stun>0 || unit.recover>0) continue;
      const dist = Math.max(.045,distance(h,unit));
      const dx=(h.x-unit.x)/dist, dz=(h.z-unit.z)/dist;
      if (Math.abs(dx)>.14) unit.face=Math.sign(dx);
      if (dist<spec.reach && unit.cool<0) {
        this.beginEnemyAttack(unit);
        continue;
      }
      const target = unit.kind==='cultist'?4.4:spec.reach*.77;
      const direction = dist>target ? 1 : unit.kind==='cultist'&&dist<2.7 ? -.82 : 0;
      let sx=0,sz=0;
      for (const other of this.enemies) {
        if (unit===other || other.hp<=0) continue;
        const between=distance(unit,other);
        if (between>.02 && between<1.30) {
          sx+=(unit.x-other.x)/between*(1.30-between)*2.3;
          sz+=(unit.z-other.z)/between*(1.30-between)*2.3;
        }
      }
      const aggression = unit.kind==='boss'&&unit.hp<spec.hp*.53 ? 1.28 : 1;
      unit.x += (dx*direction*spec.speed*aggression+sx)*dt;
      unit.z += (dz*direction*spec.speed*aggression+sz)*dt;
      unit.move=Math.min(1,unit.move+Math.abs(direction)*dt*9);
      this.bound(unit);
    }
    this.enemies = this.enemies.filter(unit=>unit.hp>0);
  }

  updateHazards(dt) {
    this.hazards = this.hazards.filter(hazard=>{
      hazard.delay-=dt;
      if (hazard.kind==='spark') {
        hazard.x+=hazard.dx*4.7*dt;
        hazard.z+=hazard.dz*4.7*dt;
        this.view.spark(hazard.x,.36,hazard.z,0xff7248,1,.18);
        if (distance(this.hero,hazard)<.65 && this.hurt(hazard.damage,hazard.x,hazard.z)) return false;
        return hazard.delay>0;
      }
      if (hazard.delay>0) return true;
      this.view.shock(hazard.x,hazard.z,0xff6944,hazard.radius,.47);
      if (distance(this.hero,hazard)<hazard.radius) this.hurt(hazard.damage,hazard.x,hazard.z);
      return false;
    });
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
    if (this.startDelay !== Infinity) {
      this.startDelay-=dt;
      if (this.startDelay<=0) this.startWave();
      return;
    }
    if (this.enemies.length || this.view.portal.visible) return;
    this.clearDelay+=dt;
    if (this.clearDelay<.89) return;
    this.clearDelay=0;
    this.hazards.length=0;
    if (this.wave<stages[this.level].waves.length) {
      this.announce('結界再起','下一波','月蝕正在召喚更多的影子。',1.2);
      this.startDelay=1.18;
    } else if (this.level===2) {
      this.finish(true);
    } else {
      this.blessing();
    }
  }

  animateActors(dt) {
    const h=this.hero, t=this.t;
    const isRoll=h.rolling>0;
    const pose=isRoll?1:h.attackAge<.23?2:h.move>.34&&Math.sin(t*20)>-.35?1:0;
    const stride=h.move*Math.sin(t*20);
    const windup=h.attackAge<.07;
    this.view.actor(this.heroVisual,h,{
      frame:pose,poseSize:pose===1?.83:pose===2?1.08:1,face:h.face,
      bob:isRoll? .14 : .055+Math.abs(stride)*.15+Math.sin(t*4.1)*.036,
      tilt:isRoll?0:(h.attackAge<.23?(windup?.20:-.20)*h.face:stride*.073),
      squash:isRoll?.74:1+Math.sin(t*(h.move>.25?20:4.2))*(.03+h.move*.027),
      stretch:isRoll?1.08:1,
      roll:isRoll?-h.face*(1-h.rolling/.3)*TAU:0,
      flash:h.flash,fade:h.invulnerable>0 && !isRoll && Math.sin(t*33)<-.35 ? .74 : 1,
      aura:.24,rim:0xfbb56b,
    });
    for (const unit of this.enemies) {
      const boss=unit.kind==='boss';
      const wind=unit.attack ? 1-clamp(unit.attack.time/unit.spec.time,0,1) : 0;
      const oscillation=Math.sin(t* (boss?7:13)+unit.phase);
      const fierce=boss&&unit.hp<unit.spec.hp*.53;
      this.view.actor(unit.visual,unit,{
        frame:boss&&(wind>.42 || unit.recover>.37)?7:unit.spec.frame,face:unit.face,flash:unit.flash,
        poseSize:boss&&(wind>.42||unit.recover>.37)?.84:1,
        bob:Math.abs(oscillation)*unit.move*.14+(boss?.035:0),fade:Math.min(1,unit.age*4.5),
        squash:1+oscillation*(.028+unit.move*.032)-wind*.095,
        tilt:oscillation*.046*unit.move+unit.face*(wind*.12-(unit.recover>0?.11:0)),
        warm:wind*.55+(fierce?.42:0),aura:unit.attack?.25:(boss?.25:.09),rim:unit.attack||fierce?0xfb5a33:0xb0764d,
      });
    }
    this.fallen=this.fallen.filter(unit=>{
      unit.death+=dt;
      const fade=1-unit.death/.52;
      if (fade<=0) {
        this.view.removeActor(unit.visual);
        return false;
      }
      this.view.actor(unit.visual,unit,{frame:unit.spec.frame,face:unit.face,flash:fade*.6,
        fade,squash:.3+fade*.7,tilt:.43*(1-fade)*unit.face,aura:.03});
      return true;
    });
    for (const item of this.pickups) this.view.actor(item.visual,item,{frame:8,bob:.34+Math.sin(t*4.4)*.15,aura:.55,rim:0xffbf78});
  }

  step(dt,input) {
    this.buffered.dodge = input.dodge ? .21 : this.buffered.dodge-dt;
    this.buffered.spell = input.spell ? .35 : this.buffered.spell-dt;
    this.buffered.strike = input.strike ? .23 : this.buffered.strike-dt;
    if (this.hitstop>0) {
      this.hitstop-=dt;
      return;
    }
    this.elapsed+=dt;
    this.t+=dt;
    this.updateHero(dt,input);
    this.updateEnemies(dt);
    this.updateHazards(dt);
    this.updatePickups(dt);
    if (this.state==='play') this.updateFlow(dt);
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
    if (this.level===2) this.ui['boss-fill'].style.transform='scaleX('+(boss?clamp(boss.hp/boss.spec.hp,0,1):0)+')';
    const cooldowns=[h.rollCool/h.rollTime,h.spellCool/h.spellTime,h.atk/.42];
    actionIds.forEach((id,index)=>this.ui[id].style.setProperty('--cool',Math.round(Math.max(0,cooldowns[index])*360)+'deg'));
    this.ui['damage-vignette'].style.opacity=String(this.damageFlash);
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    const dt=clamp((now-this.previousTime)/1000,0,.045);
    this.previousTime=now;
    if (!this.hero || document.hidden) return;
    if (this.state==='play') {
      this.step(dt,this.input.read());
      this.damageFlash=Math.max(0,this.damageFlash-dt*1.74);
      this.announceLeft-=dt;
      if (this.announceLeft<=0) this.ui.announce.classList.remove('visible');
      this.renderUI();
      this.audio.update();
    }
    this.view.render(dt,this.hero,this.state!=='play');
  }

  openModal({mark,kicker,title,copy,content,buttons}) {
    this.input.reset();
    this.buffered = {dodge:0,spell:0,strike:0};
    this.ui['modal-mark'].textContent=mark;
    this.ui['modal-kicker'].textContent=kicker;
    this.ui['modal-title'].textContent=title;
    this.ui['modal-copy'].textContent=copy;
    this.ui['modal-content'].replaceChildren(...(content?[content]:[]));
    this.ui['modal-actions'].replaceChildren(...(buttons||[]));
    this.ui.modal.hidden=false;
    this.ui.hud.inert=true;
    this.ui.modal.querySelector('button')?.focus({preventScroll:true});
  }

  closeModal() {
    this.ui.modal.hidden=true;
    this.ui.hud.inert=false;
    this.input.reset();
  }

  blessing() {
    this.state='blessing';
    this.audio.play('blessing');
    this.hero.hp=Math.min(this.hero.maxHp,this.hero.hp+16);
    const grid=document.createElement('div');
    grid.className='relic-grid';
    const options=shuffle(relics.filter(relic=>!this.relics.includes(relic))).slice(0,3);
    for (const relic of options) {
      const button=makeButton('',()=>this.choose(relic),'relic');
      const mark=document.createElement('strong'), name=document.createElement('b'), detail=document.createElement('span');
      mark.textContent=relic.mark; name.textContent=relic.name; detail.textContent=relic.detail;
      button.append(mark,name,detail);
      grid.append(button);
    }
    this.openModal({mark:'✧',kicker:'林火不熄',title:'亡者的祝福',
      copy:'亡魂為你回復了 16 點生命。帶走一個祝福，繼續你的旅程。',content:grid});
  }

  choose(relic) {
    if (this.state!=='blessing') return;
    this.relics.push(relic);
    relic.apply(this.hero);
    const mark=document.createElement('span');
    mark.textContent=relic.mark;
    mark.title=relic.name;
    this.ui['relic-icons'].append(mark);
    this.audio.play('blessing');
    this.view.portal.visible=true;
    this.view.shock(0,-6.75,0xffc480,1.85,.84);
    this.objective('走入北面的金色月印');
    this.state='play';
    this.closeModal();
  }

  togglePause() {
    if (this.state==='pause') {
      this.state='play';
      this.audio.active=true;
      this.closeModal();
      return;
    }
    if (this.state!=='play') return;
    this.state='pause';
    this.audio.active=false;
    this.openModal({mark:'☾',kicker:'月蝕之夜',title:'稍作休息',
      copy:'鍵盤用 WASD 移動、J 斬擊、空白鍵翻滾、Q 放月輪。觸屏用左下搖桿與右下按鈕。',
      buttons:[makeButton('繼續旅程',()=>this.togglePause(),'primary'),makeButton('重新開始',()=>this.restart())]});
  }

  restart() {
    this.ui['relic-icons'].replaceChildren();
    this.start();
  }

  finish(won) {
    this.state=won?'won':'lost';
    this.audio.active=false;
    if (won) this.audio.play('blessing');
    const seconds=Math.floor(this.elapsed), time=Math.floor(seconds/60)+'分 '+seconds%60+'秒';
    const results=document.createElement('div');
    results.className='results';
    for (const line of ['擊倒 '+this.kills,'用時 '+time,'祝福 '+this.relics.length]) {
      const item=document.createElement('span');
      item.textContent=line;
      results.append(item);
    }
    const buttons=[makeButton(won?'再闖森林':'再試一次',()=>this.restart(),'primary'),makeButton('返回主畫面',()=>this.showCover())];
    this.openModal(won ? {mark:'✷',kicker:'緋月之森 · 完成',title:'星火歸家',
      copy:'王冠破碎，亡者的名字回到了燭火裏。天亮之前，森林第一次記起你。',content:results,buttons} :
      {mark:'☽',kicker:stages[this.level].name,title:'燈火熄滅',
        copy:'風把你的名字帶回了起點。下一次，記得在紅印亮起時翻滾。',content:results,buttons});
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
