import * as T from '../three.min.mjs';

const {lerp,smoothstep}=T.MathUtils;
const blood=new T.Color(0xee714d),moon=new T.Color(0xbc98ff);
const hotHeart=new T.Color(0xfff1dc),coldHeart=new T.Color(0xebdeff);

// The shoulders and off hand telegraph the attack before the weapon follows through.
const sweep={
  brace:{body:[-.18,-.39,-.12],lantern:[-.15,.27,-.20],blade:[-.58,-.36,.81],aim:[.83,.23]},
  follow:{body:[.14,.51,.07],lantern:[-.50,-.28,-.38],blade:[-.88,.46,.24],aim:[-.67,.12]},
};
const thrust={
  brace:{body:[-.15,-.29,.105],lantern:[-.27,.11,-.30],blade:[-.39,-.23,.45],aim:[.195,.18]},
  follow:{body:[.34,.15,-.075],lantern:[-.65,.23,-.40],blade:[-1.43,.03,.28],aim:[.012,-.025]},
};
const slam={
  brace:{body:[-.30,-.14,-.105],lantern:[-.47,.10,-.44],blade:[-2.00,-.13,.33],aim:[.23,1.48]},
  follow:{body:[.43,.11,.14],lantern:[-.93,.10,-.41],blade:[-1.25,.25,.32],aim:[.12,-.94]},
};
const ritual={
  brace:{body:[-.16,.09,.038],lantern:[-1.90,-.13,-.49],blade:[-.54,.25,.47],aim:[.51,.08]},
  follow:{body:[.13,-.06,-.08],lantern:[-1.18,.18,-.27],blade:[-.40,.13,.35],aim:[.28,.12]},
};
const moonCuts=[sweep,{
  brace:{body:[-.16,.53,.11],lantern:[-.66,-.20,-.33],blade:[-.94,.54,.29],aim:[-.77,.32]},
  follow:{body:[.16,-.48,-.10],lantern:[-.38,.29,-.24],blade:[-.77,-.38,.66],aim:[.72,.12]},
},{
  brace:{body:[-.36,-.25,-.13],lantern:[-1.48,.32,-.36],blade:[-1.75,-.29,.40],aim:[.52,1.46]},
  follow:{body:[.40,.44,.14],lantern:[-1.04,-.25,-.39],blade:[-1.37,.39,.25],aim:[-.71,-.70]},
}];
const attacks={cleave:sweep,sweep,jaws:sweep,lance:thrust,cinders:slam,toll:slam,
  eclipse:ritual,spiral:ritual,summon:ritual,prison:ritual};

function poseJoint(joint,brace,follow,swing,influence){
  const angle=joint.rotation;
  angle.set(lerp(angle.x,lerp(brace[0],follow[0],swing),influence),
    lerp(angle.y,lerp(brace[1],follow[1],swing),influence),
    lerp(angle.z,lerp(brace[2],follow[2],swing),influence));
}

export function poseWardenStrike(model,pattern,wind,release,aim,moonStroke){
  const attack=pattern==='moonSlash'?moonCuts[moonStroke]:attacks[pattern];
  if(!attack||aim.fall>.25)return;
  const swing=release?smoothstep(release.age,0,.103):0;
  const ready=release?1-smoothstep(release.age,.12,.34):smoothstep(wind,0,.65);
  const {brace,follow}=attack;
  const [lantern,blade]=model.arms;
  poseJoint(model.body,brace.body,follow.body,swing,ready);
  poseJoint(lantern,brace.lantern,follow.lantern,swing,ready);
  poseJoint(blade,brace.blade,follow.blade,swing,ready);
  const elbow=model.weapons[0]?.grip.elbow;
  if(elbow)elbow.rotation.x=lerp(elbow.rotation.x,lerp(-.54,-.15,swing),ready);
  aim.yaw=lerp(aim.sweep?.42:.16,lerp(brace.aim[0],follow.aim[0],swing),ready);
  aim.lift=lerp(.45,lerp(brace.aim[1],follow.aim[1],swing),ready);
}

export function tintWardenEnergy(model,stage,transition){
  const phase=stage===2?(transition?smoothstep(transition.progress,.27,.88):1):0;
  const energy=model.aura.mesh.material.uniforms;
  energy.tint.value.copy(blood).lerp(moon,phase);
  energy.heart.value.copy(energy.tint.value).lerp(hotHeart,.76).lerp(coldHeart,phase*.82);
  const emission=model.weaponEmission;
  if(emission){
    emission.weaponTint.value.copy(energy.tint.value);
    emission.weaponHeart.value.copy(energy.heart.value);
  }
  return phase;
}

export const wardenMoonGlow=moon;
