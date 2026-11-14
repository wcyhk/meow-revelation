const chords = [[45,52,57,60],[43,50,55,62],[41,48,53,57],[40,47,55,59]];
import {huntById} from './relic-arsenal.mjs?v=weapon-audit-1';

const hz = note => 440 * 2 ** ((note - 69) / 12);
const attackVoices={
  tiger:{noise:2160,pitch:219,shape:'triangle'},
  dragon:{noise:3010,pitch:291,shape:'sawtooth'},
  phoenix:{noise:1330,pitch:430,shape:'triangle'},
  turtle:{noise:760,pitch:177,shape:'triangle'},
  qilin:{noise:2530,pitch:162,shape:'triangle'},
  flameblade:{noise:1590,pitch:198,shape:'sawtooth'},
  stormbow:{noise:3320,pitch:495,shape:'triangle'},
  windhalberd:{noise:1880,pitch:142,shape:'triangle'},
  frostlute:{noise:1070,pitch:392,shape:'sine'},
  chakra:{noise:2790,pitch:570,shape:'triangle'},
  reaper:{noise:1770,pitch:123,shape:'triangle'},bell:{noise:910,pitch:313,shape:'sine'},
  fangs:{noise:2680,pitch:240,shape:'triangle'},cannon:{noise:620,pitch:105,shape:'sawtooth'},
};

export class Audio {
  constructor() {
    this.muted = false;
    this.active = false;
    this.step = 0;
    this.danger = false;
    this.dread = 0;
    this.lastImpact = Object.create(null);
  }

  async start() {
    if (this.context) {
      if (this.context.state === 'suspended') await this.context.resume();
      return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = this.context = new Context();
    const master = this.master = context.createGain();
    const limiter = context.createDynamicsCompressor();
    master.gain.value = this.muted ? 0 : .43;
    master.connect(limiter).connect(context.destination);
    this.noise = context.createBuffer(1, Math.ceil(context.sampleRate * .32), context.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let index=0; index<data.length; index++) data[index] = Math.random() * 2 - 1;
    await context.resume();
    this.next = context.currentTime;
  }

  toggle() {
    this.muted = !this.muted;
    if (this.context) this.master.gain.setTargetAtTime(this.muted ? 0 : .43,this.context.currentTime,.04);
    return this.muted;
  }

  note(freq, endFreq, when, duration, volume, shape = 'sine', attack = .012) {
    if (!this.context || this.muted) return;
    const osc = this.context.createOscillator();
    const envelope = this.context.createGain();
    osc.type = shape;
    osc.frequency.setValueAtTime(freq,when);
    osc.frequency.exponentialRampToValueAtTime(endFreq,when+duration);
    envelope.gain.setValueAtTime(.0001,when);
    envelope.gain.exponentialRampToValueAtTime(volume,when+attack);
    envelope.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(envelope).connect(this.master);
    osc.start(when);
    osc.stop(when+duration);
  }

  rasp(when,duration,volume,frequency) {
    if (!this.context || this.muted) return;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const env = this.context.createGain();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency,when);
    filter.frequency.exponentialRampToValueAtTime(frequency*.32,when+duration);
    filter.Q.value = .8;
    env.gain.setValueAtTime(volume,when);
    env.gain.exponentialRampToValueAtTime(.0001,when+duration);
    source.buffer = this.noise;
    source.connect(filter).connect(env).connect(this.master);
    source.start(when);
    source.stop(when+duration);
  }

  play(kind) {
    if (!this.context) return;
    const now = this.context.currentTime;
    switch(kind) {
      case 'swing':
        this.rasp(now,.12,.19,2000);
        this.note(145,66,now,.1,.068,'triangle');
        break;
      case 'hit':
        this.rasp(now,.115,.28,800);
        this.note(96,44,now,.15,.21,'triangle');
        break;
      case 'heavy':
        this.rasp(now,.17,.29,530);
        this.note(88,31,now,.30,.38,'triangle');
        break;
      case 'roll':
        this.rasp(now,.09,.14,750);
        break;
      case 'hurt':
        this.note(185,62,now,.26,.20,'triangle');
        this.rasp(now,.14,.25,650);
        break;
      case 'warning':
        this.note(166,115,now,.24,.05,'triangle');
        break;
      case 'robot-rocket':
        this.rasp(now,.18,.14,980);
        this.note(212,73,now,.27,.11,'sawtooth',.006);
        break;
      case 'robot-smg':
        this.rasp(now,.035,.060,2590);
        break;
      case 'robot-minigun':
        this.rasp(now,.045,.074,1470);
        break;
      case 'robot-impact':
        this.rasp(now,.15,.13,530);
        this.note(99,42,now,.26,.16,'triangle');
        break;
      case 'maw-open':
        if(now-(this.lastImpact.maw??-1)<.11) break;
        this.lastImpact.maw=now;
        this.rasp(now,.29,.16,420);
        this.note(72,38,now,.35,.15,'sine',.021);
        this.rasp(now+.35,.22,.14,1040);
        this.note(126,49,now+.48,.23,.12,'triangle',.009);
        break;
      case 'tentacle-sweep':
        this.rasp(now,.17,.15,780);
        this.note(116,51,now,.18,.095,'triangle');
        break;
      case 'tentacle-pierce':
        this.rasp(now,.067,.16,1930);
        this.note(274,83,now,.13,.11,'triangle',.004);
        break;
      case 'tentacle-erupt':
        this.rasp(now,.22,.16,465);
        this.note(132,38,now,.36,.16,'sine');
        this.note(481,154,now+.037,.28,.075,'triangle');
        break;
      case 'branch-revive':
        [294,392,494,659].forEach((f,i)=>this.note(f,f,now+.10*i,.40,.12,'triangle'));
        break;
      case 'snuff':
        this.rasp(now,.22,.11,1180);
        this.note(145,57,now,.27,.077,'triangle');
        break;
      case 'fracture':
        this.rasp(now,.32,.32,3150);
        this.note(740,117,now,.55,.16,'triangle',.009);
        this.note(112,39,now+.13,.69,.22,'sine',.032);
        break;
      case 'blessing':
        [392,493.9,587.3,784].forEach((f,index) => this.note(f,f,now+.09*index,.66,.07,'triangle',.018));
        break;
    }
  }

  impact(kind,material='hide') {
    if (!this.context||this.muted) return;
    const now=this.context.currentTime;
    const quiet=kind==='light'?.059:kind==='fall'?.076:.11;
    if (now-(this.lastImpact[kind]??-1)<quiet) return;
    this.lastImpact[kind]=now;
    const plated=material==='armor';
    const stone=material==='stone';
    if (kind==='light') {
      this.rasp(now,.062,.19,plated?1890:stone?1090:750);
      this.note(plated?302:118,plated?139:64,now,.095,.15,'triangle',.004);
    } else if (kind==='heavy') {
      this.note(76,25,now,.29,.19,'sine',.008);
      this.note(105,31,now,.255,.31,'triangle',.007);
      this.rasp(now,.122,.25,plated?1430:565);
      this.rasp(now+.031,.158,.13,410);
    } else if (kind==='block') {
      this.note(622,257,now,.145,.15,'triangle',.004);
      this.note(1105,516,now+.014,.107,.083,'sine',.004);
      this.rasp(now,.043,.15,2530);
    } else if (kind==='break') {
      this.rasp(now,.13,.26,2870);
      for (const [offset,high,low] of [[0,1190,492],[.036,1905,652],[.073,765,223]]) {
        this.note(high,low,now+offset,.24,.124,'triangle',.005);
      }
      this.note(94,33,now+.045,.24,.24,'sine',.008);
    } else if (kind==='fall') {
      this.note(91,35,now,.16,.18,'triangle',.007);
      this.rasp(now+.19,.20,.17,stone||plated?720:400);
      this.note(stone||plated?93:72,24,now+.30,.28,.30,'triangle',.008);
    }
  }

  release(pattern,boss,identity) {
    if (!this.context||this.muted) return;
    const now=this.context.currentTime;
    if(identity==='m025'||identity==='m026'){
      const voice={
        lance:[440,92,2650],marked:[920,221,1830],prison:[392,199,1490],
        ring:[525,370,1280],gravity:[217,54,980],cinders:[149,49,1540],
      }[pattern];
      if(voice){
        const [start,end,filter]=voice;
        this.note(start,end,now,.32,.16,'triangle',.011);
        this.note(start*1.51,end*1.22,now+.035,.20,.064,'sine',.012);
        this.rasp(now+.024,.16,pattern==='lance'?.24:.13,filter);
        if(pattern==='gravity'||pattern==='lance')this.note(84,34,now+.054,.31,.13,'sine',.009);
        return;
      }
    }
    const level=boss?1:.58;
    if (['cleave','sweep','lance','pounce','counterCharge'].includes(pattern)) {
      this.rasp(now,.11,.18*level,pattern==='pounce'?950:1750);
      if (boss) this.note(153,60,now,.115,.14,'triangle',.008);
    } else if (['burst','roots','cinders','seal','arenaBait'].includes(pattern)) {
      this.note(106,37,now,.20,.20*level,'triangle',.007);
      this.rasp(now,.14,.14*level,660);
    } else if (boss) this.note(233,97,now,.16,.092,'triangle',.012);
  }

  attack(weapon,step,phase,pulse=0) {
    if (!this.context||this.muted) return;
    const {noise,pitch,shape}=attackVoices[weapon]??attackVoices[huntById.get(weapon)?.combo]??attackVoices.tiger;
    const now=this.context.currentTime;
    if (phase==='wind') {
      if (weapon==='stormbow') {
        this.note(step===3?181:271,step===3?590:371,now,step===3?.27:.10,.067,'triangle',.021);
        this.rasp(now,.074,.062,1120+step*95);
      } else if (step===3) {
        this.note(pitch*.58,pitch*.92,now,weapon==='flameblade'?.22:.14,.083,shape,.037);
      }
      return;
    }
    const heavy=step===3;
    const pitchShift=step===2?1.13:heavy?.91:1;
    if (weapon==='frostlute') {
      this.note(pitch*pitchShift*(pulse?1.25:1),pitch*pitchShift*.985,now,heavy?.34:.19,.145,'sine',.005);
      this.note(pitch*pitchShift*(heavy?1.5:2),pitch*pitchShift,now+.015,.16,.073,'triangle',.007);
    } else {
      this.rasp(now,heavy?.17:.080,pulse?.14:heavy?.24:.16,noise*pitchShift);
      this.note(pitch*pitchShift,pitch*(heavy?.32:.53),now,heavy?.22:.115,.12,shape,.006);
    }
    if (heavy&&weapon!=='frostlute') this.note(98,34,now+.020,.23,.18,'triangle',.009);
  }

  link(id,cast) {
    if (!this.context||this.muted) return;
    const now=this.context.currentTime;
    const {noise,pitch,shape}=attackVoices[id]??attackVoices[huntById.get(id)?.combo]??attackVoices.tiger;
    if (!cast) {
      this.note(pitch*1.8,pitch*2.32,now,.095,.075,'sine',.008);
      return;
    }
    this.note(pitch*1.12,pitch*1.64,now,.13,.084,'triangle',.012);
    this.rasp(now+.075,.13,.20,noise*1.13);
    this.note(pitch*.88,pitch*.33,now+.085,.22,.14,shape,.009);
    if (id==='flameblade'||id==='qilin') this.note(100,42,now+.10,.27,.15,'triangle',.008);
    if (id==='stormbow') [1,1.36,1.62].forEach((factor,i)=>this.note(415*factor,170*factor,now+.10+i*.09,.12,.086,'triangle',.007));
    if (id==='frostlute') this.note(622,610,now+.34,.33,.11,'sine',.01);
  }

  weave(id,pulse=0) {
    if (!this.context||this.muted) return;
    const now=this.context.currentTime;
    if (id==='emberbolt'||id==='counter'||id==='rail') {
      const pitch= id==='emberbolt'?375+pulse*85: id==='counter'?448:590;
      this.note(pitch,pitch*.32,now,.16,.10,'triangle',.004);
      this.rasp(now,.085,.12,id==='emberbolt'?1550:2300);
    } else if (id==='frostlance') {
      [587,783,1175].forEach((pitch,index)=>this.note(pitch,pitch*.98,now+index*.025,.29,.087,'sine',.007));
      this.rasp(now,.12,.07,1650);
    } else {
      this.note(id==='firewhirl'?220:328,72,now,.21,.11,'triangle',.009);
      this.rasp(now,.17,.12,1060);
    }
  }

  ultimate(skin,pulse=0) {
    if (!this.context||this.muted) return;
    const now=this.context.currentTime;
    const root=[128,168,221,196,260,112,281,151,392,175,104,277,233,91][skin];
    const noise=[1310,2170,2740,1560,960,1490,3150,1040,2080,1740,1330,1070,2650,660][skin];
    const ice=skin===4||skin===8||skin===11;
    this.rasp(now,.16,pulse===0?.19:.13,noise);
    this.note(root*(1+pulse*.27),root*(ice?.98:.36),now,ice?.38:.26,.155,ice?'sine':'triangle',.007);
    this.note(root*(ice?2.39:1.51),root*(ice?1.96:.87),now+.047,.24,.09,'triangle',.012);
    if (pulse===0) this.note(88,34,now+.027,.33,.136,'sine',.015);
  }

  ghostRifle() {
    if(!this.context||this.muted)return;
    const now=this.context.currentTime;
    this.rasp(now,.069,.21,2360);
    this.note(154,59,now,.14,.075,'triangle',.003);
    this.note(541,277,now+.023,.16,.046,'sine',.005);
  }

  arm(id) {
    if (!this.context) return;
    const now=this.context.currentTime;
    const relic=huntById.get(id);
    if(relic){
      const voice=attackVoices[relic.combo];
      const count=Math.min(4,relic.spell.hits+1);
      for(let i=0;i<count;i++){
        const pitch=voice.pitch*(1+(relic.sigil%7)*.033+i*.12);
        this.note(pitch,pitch*(relic.element==='light'?.95:.42),now+i*.078,.24,.095,voice.shape,.012);
      }
      this.rasp(now,.12,.13,voice.noise);
      return;
    }
    if (['reaper','bell','fangs','cannon'].includes(id)) {
      const {pitch,noise,shape}=attackVoices[id];
      for(let i=0;i<(id==='bell'?3:2);i++) this.note(pitch*(1+i*.37),pitch*(id==='bell'?.97:.33),now+i*.16,.28,.145,shape,.008);
      this.rasp(now,.21,.20,noise);
    } else if (id==='tiger') {
      this.rasp(now,.18,.25,1570);
      this.note(375,98,now,.26,.13,'triangle');
    } else if (id==='dragon') {
      for (let i=0;i<3;i++) {
        this.rasp(now+i*.24,.12,.23,2350);
        this.note(156,65,now+i*.24,.17,.14,'sawtooth');
      }
    } else if (id==='phoenix') {
      for (let i=0;i<3;i++) this.note(390-i*34,80,now+i*.19,.24,.15,'triangle');
      this.rasp(now,.17,.18,1100);
    } else if (id==='turtle') {
      [293,463,587].forEach((pitch,index)=>this.note(pitch,pitch*.96,now+index*.07,.52,.12,'sine',.03));
    } else if (id==='flameblade') {
      for (let i=0;i<3;i++) this.rasp(now+i*.22,.17,.17,1070+i*160);
      this.note(103,41,now,.48,.19,'triangle',.028);
    } else if (id==='stormbow') {
      for (let i=0;i<4;i++) this.note(290-i*31,65,now+i*.13,.13,.095,'sawtooth');
    } else if (id==='windhalberd') {
      for (let i=0;i<3;i++) this.rasp(now+i*.23,.16,.17,1400+i*340);
    } else if (id==='frostlute') {
      [330,392,523,659].forEach((pitch,i)=>this.note(pitch,pitch*.994,now+i*.05,.63,.11,'sine',.014));
    } else if (id==='chakra') {
      this.note(540,110,now,.52,.11,'triangle',.022);
      this.note(680,360,now+.18,.39,.068,'sine',.021);
    } else {
      this.note(92,32,now,1.08,.20,'triangle',.065);
      this.rasp(now,.19,.16,610);
    }
  }

  relicRoar(weapon){
    if(!this.context||this.muted)return;
    const now=this.context.currentTime;
    const pitch=64+(weapon.sigil%17)*3;
    this.rasp(now,.54,.31,185+weapon.sigil*8);
    this.note(pitch*.72,pitch*1.47,now,.43,.21,'sawtooth',.05);
    this.note(pitch*2.11,pitch*.66,now+.24,.51,.17,'triangle',.06);
  }

  boss(effect,phase=false) {
    if (!this.context) return;
    const now=this.context.currentTime;
    const pitch={water:53,ice:64,fire:44,root:46,feather:69,web:51,gold:55,void:41,blood:37}[effect]??48;
    this.note(pitch*1.49,pitch,now,phase?.73:1.29,.28,'triangle',.06);
    this.note(pitch*1.61,pitch*1.05,now+.10,phase?.64:1.07,.11,'sawtooth',.11);
    this.rasp(now+.11,.17,.26,phase?430:290);
    if (phase) this.note(pitch*4.4,pitch*1.8,now+.27,.52,.073,'sine',.038);
  }

  update() {
    if (!this.active || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    if (this.next < now - .15) this.next = now;
    if (this.next > now + .12) return;
    const step = this.step++;
    const chord = chords[Math.floor(step / 8) % chords.length];
    const beat = step % 8;
    if (beat === 0) {
      this.note(hz(chord[0]-12),hz(chord[0]-12),this.next,3.2,.085,'sine',.44);
      this.note(hz(chord[1]),hz(chord[1]),this.next+.12,2.8,.042,'sine',.50);
      if (this.dread>.2) {
        const dissonance=hz(chord[0]-6);
        this.note(dissonance*1.012,dissonance,this.next+.11,2.75,.058*this.dread,'triangle',.46);
      }
    }
    if ([0,2,3,5,7].includes(beat)) {
      const pitch = hz(chord[beat % 3 + 1] + (beat === 5 ? 12 : 0));
      this.note(pitch,pitch,this.next,1.27,.038,'triangle',.016);
      this.note(pitch*2.01,pitch*2,this.next,.41,.020,'sine',.013);
    }
    if (this.danger && (beat === 0 || beat === 4)) {
      this.note(76,34,this.next,.41,.15,'triangle');
    }
    if(this.dread>.54&&(beat===1||beat===6)){
      this.note(62+beat*2,31,this.next,.64,.042*Math.min(1.3,this.dread),'triangle',.10);
      if(beat===6)this.rasp(this.next+.09,.39,.032,410);
    }
    this.next += this.danger ? .32-this.dread*.039 : .45-this.dread*.028;
  }
}
