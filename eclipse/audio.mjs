const chords = [[45,52,57,60],[43,50,55,62],[41,48,53,57],[40,47,55,59]];
const hz = note => 440 * 2 ** ((note - 69) / 12);

export class Audio {
  constructor() {
    this.muted = false;
    this.active = false;
    this.step = 0;
    this.danger = false;
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
    this.noise = context.createBuffer(1, context.sampleRate * .19, context.sampleRate);
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
      case 'moon':
        [220,329.6,440,587.3].forEach((f,index) => this.note(f,f*.86,now+.03*index,.62,.08,'sine',.025));
        this.note(84,35,now,.4,.23,'triangle');
        break;
      case 'blessing':
        [392,493.9,587.3,784].forEach((f,index) => this.note(f,f,now+.09*index,.66,.07,'triangle',.018));
        break;
    }
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
    }
    if ([0,2,3,5,7].includes(beat)) {
      const pitch = hz(chord[beat % 3 + 1] + (beat === 5 ? 12 : 0));
      this.note(pitch,pitch,this.next,1.27,.038,'triangle',.016);
      this.note(pitch*2.01,pitch*2,this.next,.41,.020,'sine',.013);
    }
    if (this.danger && (beat === 0 || beat === 4)) {
      this.note(76,34,this.next,.41,.15,'triangle');
    }
    this.next += this.danger ? .32 : .45;
  }
}
