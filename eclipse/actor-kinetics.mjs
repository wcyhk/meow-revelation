const TAU=Math.PI*2;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

const grounded={stride:1.56,bounce:.115,swing:.074,lift:.066,swingRate:1,skew:.7};
const armored={stride:1.86,bounce:.078,swing:.057,lift:.040,swingRate:.7,skew:.8};
const creeper={stride:1.02,bounce:.048,swing:.096,lift:.044,swingRate:1.35,skew:1.05};
const runner={stride:1.48,bounce:.149,swing:.109,lift:.085,swingRate:1.12,skew:.88};
const floating={stride:1.9,bounce:.095,swing:.017,lift:.018,swingRate:1.25,skew:1.2};
const keeper={stride:1.35,bounce:.101,swing:.081,lift:.075,swingRate:1,skew:.75};
const frames={3:runner,18:runner,22:creeper,23:creeper,24:creeper,27:creeper};

export function actorMotion(unit,dt,time,isHero=false){
  const spec=unit.spec;
  const profile=isHero?keeper:spec.float?floating:frames[spec.frame]??(unit.kind==='boss'||spec.guard?armored:grounded);
  const motion=unit.visualMotion??={x:unit.x,z:unit.z,phase:unit.phase??0,speed:0,turn:0,face:unit.face,lean:0};
  const dx=unit.x-motion.x,dz=unit.z-motion.z,distance=Math.hypot(dx,dz);
  motion.x=unit.x;motion.z=unit.z;
  const stopped=unit.frozen>0||unit.rolling>0||unit.reaction?.kind==='fall';
  const valid=dt>0&&distance<.80&&!stopped;
  const running=valid?clamp(distance/dt/((spec?.speed??5)*.83),0,1):0;
  motion.speed+=(running-motion.speed)*(1-Math.exp(-dt*(running>motion.speed?15:11)));
  if(valid) motion.phase=(motion.phase+distance/profile.stride*TAU)%TAU;
  if(valid&&distance>.008)motion.heading=Math.atan2(dx,dz);
  if(unit.face!==motion.face)motion.turn=1;
  motion.face=unit.face;
  motion.turn*=Math.exp(-dt*14);
  const lean=valid&&distance>.005?dx/distance*running:0;
  motion.lean+=(lean-motion.lean)*(1-Math.exp(-dt*12));
  const weight=stopped?0:motion.speed;
  const step=Math.sin(motion.phase);
  const plant=Math.max(0,Math.cos(motion.phase*2));
  const flinch=unit.reaction?Math.exp(-unit.reaction.age*10)*Math.sin(unit.reaction.age*33):0;
  const idle=Math.sin(time*3.1+(unit.phase??0));
  return {
    step,weight,phase:motion.phase,heading:motion.heading,foot:Math.floor(motion.phase/Math.PI),
    swing:step*profile.swing*weight,footLift:Math.cos(motion.phase)*profile.lift*weight,
    lag:Math.sin(motion.phase-.9)*weight*.042*profile.swingRate+idle*.009+flinch*.025,
    bob:profile.bounce*weight*(1-plant*.82)+(spec?.float??0)*(1.35+idle*.48),
    sway:step*weight*.022+motion.lean*.017*profile.skew+flinch*.036,
    compression:weight*plant*.043,
    tilt:motion.lean*.105+step*weight*.034,
    width:1-motion.turn*.17,
  };
}
