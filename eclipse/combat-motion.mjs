const clamp=(value)=>Math.max(0,Math.min(1,value));
const ease=(value)=>{const t=clamp(value);return t*t*(3-2*t);};
const fade=(value)=>1-ease(value);
const PI=Math.PI;

export const reactionTime={light:.19,heavy:.38,block:.23,break:.53,fall:.78};
const severity={light:1,block:1,heavy:2,break:3,fall:4};
const enemyStyle={
  pounce:'charge',counterCharge:'charge',cleave:'sweep',lance:'thrust',
  sweep:'sweep',cross:'thrust',cinders:'slam',burst:'slam',roots:'slam',
  barrage:'shoot',feathers:'shoot',coins:'shoot',spiral:'shoot',
  arenaBait:'slam',seal:'slam',
  jaws:'sweep',toll:'slam',gravefan:'sweep',
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

// Pose components are hand reach, lift, horizontal sweep, tip pitch, grip roll, and body weight.
const hold=[.12,.04,0,.25,0,0];
const gestures={
  rake:       [[-.20,.14,-1.08,.89,.29,-.44],[.64,.12,1.08,1.29,-.58,.68]],
  return:     [[-.22,.29,1.17,.84,-.30,-.39],[.67,-.04,-1.20,1.43,.51,.73]],
  spin:       [[-.31,.02,-2.11,.97,.41,-.61],[.76,.18,2.30,1.36,-.76,.91]],
  spark:      [[.10,.18,-.18,.27,.11,-.16],[.47,.27,.10,.64,-.18,.39]],
  relay:      [[-.08,.23,.52,.43,-.26,-.28],[.55,.41,-.42,.81,.28,.57]],
  thunder:    [[-.03,.81,.18,.11,-.22,-.55],[.74,.35,0,1.11,-.38,.86]],
  peck:       [[-.14,.12,-.18,.51,.16,-.28],[.63,.27,.18,1.24,-.36,.57]],
  wings:      [[-.27,.39,-.98,.55,.23,-.37],[.69,.19,.95,1.12,-.39,.70]],
  phoenix:    [[-.24,.83,-1.30,.22,.24,-.61],[.75,.37,1.02,1.28,-.57,.91]],
  lift:       [[-.20,-.27,-.43,1.73,.28,-.34],[.54,.54,.50,.32,-.42,.61]],
  brace:      [[-.08,.30,.93,.49,-.20,-.43],[.59,-.01,-1.17,1.39,.32,.71]],
  shell:      [[-.22,.88,-.14,.20,.17,-.60],[.55,-.21,.21,2.03,-.28,.92]],
  jab:        [[-.31,.10,-.11,1.17,.02,-.43],[.89,.13,.03,1.49,-.16,.78]],
  double:     [[-.31,.13,.15,1.17,.16,-.46],[.93,.19,-.08,1.44,-.11,.77]],
  lunge:      [[-.48,.15,-.13,1.32,.04,-.70],[1.20,.15,.02,1.58,-.14,1.12]],
  ember:      [[-.28,-.20,-.77,1.61,.18,-.39],[.72,.42,.67,.70,-.40,.64]],
  backfire:   [[-.20,.35,1.12,.91,-.29,-.53],[.74,.22,-1.27,1.40,.43,.82]],
  overhead:   [[-.43,1.17,-.61,-.40,.21,-.71],[.77,-.15,.09,2.06,-.39,1.04]],
  draw:       [[.29,.30,-.09,.17,.07,-.20],[.71,.30,0,.24,-.10,.38]],
  splitdraw:  [[.22,.39,.28,.24,-.13,-.32],[.76,.25,-.10,.31,-.22,.48]],
  fulldraw:   [[.22,.46,.04,.12,.02,-.66],[.83,.32,.01,.24,-.07,.78]],
  spear:      [[-.28,.08,-.29,1.11,.12,-.40],[.87,.28,.19,1.23,-.26,.71]],
  hook:       [[.53,.42,.92,1.10,-.27,-.24],[-.17,.09,-1.28,1.31,.58,.73]],
  whirl:      [[-.35,.27,-2.24,.87,.27,-.62],[.82,.20,2.25,1.56,-.62,.95]],
  pluck:      [[.02,.15,-.40,.36,.27,-.18],[.43,.22,.47,.41,-.42,.36]],
  chord:      [[-.10,.22,.52,.28,-.39,-.28],[.49,.39,-.44,.42,.33,.47]],
  frost:      [[-.09,.75,-.59,.19,.37,-.53],[.56,.48,.59,.58,-.53,.79]],
  toss:       [[-.25,.23,-1.13,.61,.38,-.31],[.72,.23,.36,1.15,-.42,.58]],
  bank:       [[-.28,.38,.85,.69,-.33,-.45],[.79,.11,-.67,1.27,.46,.72]],
  moon:       [[-.29,.78,-1.50,.42,.51,-.64],[.95,.34,1.20,1.26,-.64,.88]],
  followLunge:[[-.38,.23,.35,1.43,.28,-.37],[1.28,.31,-.04,1.42,-.36,1.22]],
  ignite:     [[-.11,.03,1.08,1.73,.32,-.33],[.64,.58,-.66,.48,-.43,.72]],
  looseThunder:[[.36,.48,-.12,.34,.12,-.27],[.88,.53,.26,.28,-.38,.69]],
  harvest:    [[-.35,.58,1.82,.53,-.35,-.55],[.91,.04,-1.70,1.77,.51,.99]],
  bellTap:    [[-.04,.92,-.17,.32,.24,-.36],[.55,.31,.16,1.23,-.37,.68]],
  fangPounce: [[-.49,.13,-.41,1.19,.32,-.56],[1.19,.24,.22,1.61,-.48,1.08]],
  firelock:   [[.22,.29,.04,.91,.09,-.27],[.79,.29,.02,1.56,-.02,.45]],
  firelockHeavy:[[.01,.51,-.21,.82,.31,-.64],[1.05,.37,.02,1.59,-.18,.82]],
  cast:       [[-.13,.59,-.48,.29,.29,-.38],[.56,.48,.31,.77,-.33,.62]],
};
const pointed=new Set(['lift','shell','jab','double','lunge','ember','backfire','overhead','spear','hook','whirl','followLunge','ignite','harvest','bellTap','fangPounce','firelock','firelockHeavy']);
const bowDraw={draw:.46,splitdraw:.72,fulldraw:1};
const sweepMoves=new Set(['spin','whirl']);
const chargedMoves=new Set(['spin','thunder','phoenix','shell','lunge','overhead','fulldraw','whirl','frost','moon','fangPounce','firelockHeavy']);

export function heroAction(hero,kind,move,timing) {
  const casting=kind==='cast';
  hero.motion={
    name:casting?'cast':move.pose,dx:hero.dx,dz:hero.dz,face:hero.face,
    timing:casting?{cycle:.32,hits:[{at:.105}]}:timing,
  };
}

function directionX(x,z,face) {
  return Math.abs(x)>.1?x:(face||1)*Math.max(.31,Math.abs(z)*.39);
}

function poseBetween(from,to,portion) {
  const amount=ease(portion);
  return from.map((value,index)=>value+(to[index]-value)*amount);
}

export function heroPose(hero) {
  const action=hero.motion;
  if (!action||hero.rolling>0) return null;
  const {name,dx,dz,face,timing}=action;
  const age=hero.attackAge;
  if (age>=timing.cycle) return null;
  const [ready,contact]=gestures[name];
  const first=timing.hits[0].at;
  const last=timing.hits.at(-1).at;
  const backswing=first*(name==='fulldraw'?.91:.72);
  let hand;
  if (age<backswing) {
    hand=poseBetween(hold,ready,age/backswing);
  } else if (age<first) {
    hand=poseBetween(ready,contact,(age-backswing)/(first-backswing));
  } else if (age<last) {
    const pulse=(age-first)/(last-first);
    hand=pulse<.62?poseBetween(contact,ready,pulse/.62):poseBetween(ready,contact,(pulse-.62)/.38);
  } else {
    hand=poseBetween(contact,hold,(age-last)/(timing.cycle-last));
  }
  const [reach,raise,sweep,pitch,roll,weight]=hand;
  const side=directionX(dx,dz,face);
  const turn=sweepMoves.has(name)?sweep*.19:sweep*.10;
  const draw=bowDraw[name]??0;
  return {
    face,
    bend:weight*side*.25+turn*.28,
    offsetX:dx*weight*.34,offsetZ:dz*weight*.34,
    tilt:-side*weight*.30+turn,
    squash:1+Math.min(0,weight)*.13+Math.max(0,raise)*.09,
    stretch:1+Math.max(0,weight)*.13,
    bob:Math.max(0,raise)*.21+Math.max(0,weight)*.054,
    grip:{dx,dz,reach,raise,sweep,pitch,roll,pointed:pointed.has(name),
      draw:age<first?draw*ease(age/Math.max(.001,backswing)):0,
      charge:age<first&&chargedMoves.has(name)?ease(age/first):0,
      nocked:draw>0&&age<first},
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
      bob:gather?load*(style==='slam'?.52:.29):0,warm:load*.55,
      lag:side*load*.048,compression:load*(gather?.022:.054)};
  }
  const t=release.age/(style==='charge'?.42:.32);
  if (t>=1) return null;
  const power=fade(t);
  const air=style==='charge'?Math.sin(clamp(t)*PI)*.58:0;
  const slam=style==='slam'?power*.19:0;
  const settle=Math.sin(t*PI*2)*power;
  return {bend:side*power*(style==='shoot'?.09:.26),
    offsetX:dx*power*(style==='thrust'?.59:.33),offsetZ:dz*power*(style==='thrust'?.59:.33),
    tilt:-side*power*(style==='sweep'?.39:.24),squash:1-slam+air*.19,
    stretch:1+power*.16,bob:air,warm:power*.48,
    lag:-side*settle*(style==='sweep'?.14:.080),
    compression:Math.max(0,settle)*(style==='slam'?.11:.046)};
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
      lag:side*Math.sin(fall*PI)*.092,compression:Math.sin(fall*PI)*.065,
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
    lag:side*Math.sin(t*PI*(broken?3:2))*tail*(heavy||broken?.14:.064)*scale,
    compression:Math.sin(t*PI)*tail*(broken?.12:heavy?.086:.035)*scale,
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
  base.lag=(base.lag??0)+(motion.lag??0);
  base.compression=(base.compression??0)+(motion.compression??0);
  base.flash=Math.max(base.flash??0,motion.flash??0);
  if (motion.warm) base.warm=Math.max(base.warm??0,motion.warm);
  if (motion.grip) base.grip=motion.grip;
  if (motion.fall!==undefined) base.fall=motion.fall;
  if (motion.fade!==undefined) base.fade*=motion.fade;
  if (motion.guardFlash) base.guardFlash=true;
  return base;
}
