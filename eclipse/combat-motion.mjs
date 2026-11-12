const clamp=(value)=>Math.max(0,Math.min(1,value));
const ease=(value)=>{const t=clamp(value);return t*t*(3-2*t);};
const fade=(value)=>1-ease(value);
const PI=Math.PI;

export const reactionTime={light:.19,heavy:.38,block:.23,break:.53,fall:.78};
const severity={light:1,block:1,heavy:2,break:3,fall:4};
const weaponStyle={
  tiger:'slash',dragon:'focus',phoenix:'focus',turtle:'slash',qilin:'thrust',
  flameblade:'slash',stormbow:'bow',windhalberd:'slash',frostlute:'focus',chakra:'throw',
};
const enemyStyle={
  pounce:'charge',counterCharge:'charge',cleave:'sweep',lance:'thrust',
  sweep:'sweep',cross:'thrust',cinders:'slam',burst:'slam',roots:'slam',
  barrage:'shoot',feathers:'shoot',coins:'shoot',spiral:'shoot',
  arenaBait:'slam',seal:'slam',
};

export function recoil(unit,origin,kind) {
  const previous=unit.reaction;
  if (previous&&previous.age<reactionTime[previous.kind]*.53&&severity[previous.kind]>severity[kind]) return;
  let dx=unit.x-origin.x,dz=unit.z-origin.z;
  const length=Math.hypot(dx,dz);
  if (length>.02) {
    dx/=length;dz/=length;
  } else {
    dx=-(unit.dx??unit.face??1);
    dz=-(unit.dz??0);
  }
  unit.reaction={kind,age:0,dx,dz};
}

export function advanceReaction(unit,dt) {
  const reaction=unit.reaction;
  if (!reaction) return;
  reaction.age+=dt;
  if (reaction.kind!=='fall'&&reaction.age>=reactionTime[reaction.kind]) unit.reaction=null;
}

export function heroAction(hero,weapon,kind) {
  hero.motion={
    style:kind==='cast'?'cast':weaponStyle[weapon.id]??'slash',
    dx:hero.dx,dz:hero.dz,face:hero.face,wind:kind==='cast'?.105:weapon.delay,
    combo:hero.combo,heavy:kind==='cast'||hero.combo===3,
  };
}

function directionX(x,z,face) {
  return Math.abs(x)>.1?x:(face||1)*Math.max(.31,Math.abs(z)*.39);
}

export function heroPose(hero) {
  const action=hero.motion;
  if (!action||hero.rolling>0) return null;
  const {style,dx,dz,face,wind,heavy,combo}=action;
  const age=hero.attackAge;
  const swing=style==='slash'||style==='throw';
  const release=heavy?.142:.10;
  const length=wind+release+(heavy?.18:.12);
  if (age>=length) return null;
  const load=ease(age/wind);
  const pass=ease((age-wind)/release);
  const settling=fade((age-wind-release)/(length-wind-release));
  const strength=heavy?1.24:1;
  const weight=(load*(1-pass)*-.47+pass*.79)*settling*strength;
  const side=directionX(dx,dz,face);
  const reverse=combo===2?-1:1;
  const rise=style==='cast'||style==='bow'?Math.sin(clamp(age/length)*PI)*.34:0;
  return {
    face,
    bend:weight*side*.24,
    offsetX:dx*weight*.30,offsetZ:dz*weight*.30,
    tilt:-side*weight*.32,
    squash:1-(load*(1-pass)*.10)+pass*settling*.045+rise*.19,
    stretch:1+Math.abs(weight)*.11,
    bob:rise+pass*settling*(swing?.08:.03),
    grip:{dx,dz,weight,reach:(swing?.60:style==='thrust'?.88:.44)*pass*settling,
      raise:rise+load*(1-pass)*(style==='cast'?.35:.22),
      sweep:swing?reverse*((pass*2-1)*load*1.05)*settling:0,style,pass},
  };
}

export function enemyPose(unit) {
  const attack=unit.attack;
  const release=unit.motion;
  if (!attack&&!release) return null;
  const style=enemyStyle[(attack??release).pattern]??'cast';
  const {dx=unit.face,dz=0}=attack??release;
  const side=directionX(dx,dz,unit.face);
  if (attack) {
    const time=attack.windup??unit.spec.time*(1-unit.bossPhase*.12);
    const load=ease(1-attack.time/time);
    const gather=style==='slam'||style==='cast'||style==='shoot';
    return {bend:-side*load*(style==='charge'?.27:.19),
      offsetX:-dx*load*.22,offsetZ:-dz*load*.22,tilt:side*load*.22,
      squash:1-load*(gather?.03:.22),stretch:1+load*(style==='charge'?.18:.055),
      bob:gather?load*(style==='slam'?.52:.29):0,warm:load*.55};
  }
  const t=release.age/(style==='charge'?.42:.32);
  if (t>=1) return null;
  const power=fade(t);
  const air=style==='charge'?Math.sin(clamp(t)*PI)*.58:0;
  const slam=style==='slam'?power*.19:0;
  return {bend:side*power*(style==='shoot'?.09:.26),
    offsetX:dx*power*(style==='thrust'?.59:.33),offsetZ:dz*power*(style==='thrust'?.59:.33),
    tilt:-side*power*(style==='sweep'?.39:.24),squash:1-slam+air*.19,
    stretch:1+power*.16,bob:air,warm:power*.48};
}

export function reactionPose(unit,boss=false) {
  const reaction=unit.reaction;
  if (!reaction) return null;
  const {kind,age,dx,dz}=reaction;
  const t=clamp(age/reactionTime[kind]);
  const side=directionX(dx,dz,unit.face);
  if (kind==='fall') {
    const fall=ease((t-.09)/.54);
    return {fall,offsetX:dx*(.19+fall*.53),offsetZ:dz*(.19+fall*.53),
      tilt:-side*(.18+fall*.77),bend:side*fade(fall)*.14,
      squash:1-fall*.29,stretch:1+fall*.18,bob:Math.sin(fall*PI)*.27,
      fade:fade((t-.66)/.34),flash:fade(t*4)*.73};
  }
  const tail=fade(t);
  const scale=boss?.60:1;
  const heavy=kind==='heavy';
  const broken=kind==='break';
  const block=kind==='block';
  const snap=heavy?tail*(1+.22*Math.sin(t*PI*2)):broken?tail*(.85+.29*Math.sin(t*PI*4)):tail;
  const displacement=(heavy?.49:broken?.35:block?.13:.19)*scale*snap;
  return {offsetX:dx*displacement,offsetZ:dz*displacement,
    bend:side*snap*(heavy?.33:broken?.30:block?.11:.21)*scale,
    tilt:-side*snap*(heavy?.47:broken?.41:block?.16:.25)*scale,
    squash:1-snap*(heavy?.18:broken?.27:block?.11:.095),
    stretch:1+snap*(heavy?.16:broken?.12:.045),bob:heavy?Math.sin(t*PI)*.24*scale:0,
    flash:tail*(broken?.68:block?.27:.61),guardFlash:broken||block};
}

export function blendPose(base,motion) {
  if (!motion) return base;
  base.bend=(base.bend??0)+motion.bend;
  base.offsetX=(base.offsetX??0)+motion.offsetX;
  base.offsetZ=(base.offsetZ??0)+motion.offsetZ;
  base.tilt+=motion.tilt;
  base.squash*=motion.squash;
  base.stretch=(base.stretch??1)*motion.stretch;
  base.bob+=motion.bob;
  base.flash=Math.max(base.flash??0,motion.flash??0);
  if (motion.warm) base.warm=Math.max(base.warm??0,motion.warm);
  if (motion.grip) base.grip=motion.grip;
  if (motion.fall!==undefined) base.fall=motion.fall;
  if (motion.fade!==undefined) base.fade*=motion.fade;
  if (motion.guardFlash) base.guardFlash=true;
  return base;
}
