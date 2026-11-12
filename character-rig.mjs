import * as T from "./three.min.mjs";
import { figureMaterial, JOINT_LIMIT } from "./character-mesh.mjs?v=inkbound";
import { buildFigure } from "./character-design.mjs?v=guild";

const TAU = Math.PI * 2;
const clamp = (n,low,high) => Math.max(low,Math.min(high,n));
const damp = (value,goal,rate,dt) => value+(goal-value)*(1-Math.exp(-rate*dt));
const mix = (a,b,t) => a+(b-a)*t;
const ease = t => {t=clamp(t,0,1);return t*t*(3-2*t);};
const gear = {scythe:1,fang:2,anchor:3,spear:4,lantern:5,martial:6,oracle:7,samurai:8,maiden:9,hunter:10,merchant:11};
const scaleByKind = {rat:.90,crab:.91,witch:.95,sentinel:.91,boss:1.03,weigher:1,abbess:1,undertow:1.04};

function angleToward(from,to,rate,dt) {
  const delta = Math.atan2(Math.sin(to-from),Math.cos(to-from));
  return from+delta*(1-Math.exp(-rate*dt));
}

class ActorModel {
  constructor(kind,model,stage,cool,warm) {
    this.kind = kind;
    this.style = model.style;
    this.pivot = new T.Group();
    this.root = new T.Group();
    this.root.name = "figure:"+kind;
    this.root.add(this.pivot);
    this.skeleton = new T.Group();
    this.joints = {};
    this.bones = Array.from({length:JOINT_LIMIT},()=>new T.Matrix4());
    model.joints.forEach(({name,parent,position},i)=>{
      const joint = new T.Group();
      (parent===null?this.skeleton:this.joints[model.joints[parent].name]).add(joint);
      joint.position.set(...position);
      this.joints[name]=joint;
      this.bones[i]=joint.matrixWorld;
    });
    this.skin = new T.Mesh(model.geometry,figureMaterial(this.bones,cool,warm,false));
    this.line = new T.Mesh(model.geometry,figureMaterial(this.bones,cool,warm,true));
    for(const mesh of [this.skin,this.line]){
      mesh.position.y = -.56;
      mesh.frustumCulled = false;
      this.pivot.add(mesh);
    }
    stage.add(this.root);
    this.reset();
  }
  reset() {
    this.yaw = null;
    this.motion = 0;
    this.gait = 0;
    this.stagger = 0;
    this.fall = 0;
    this.action = "idle";
    this.root.visible = true;
  }
  rotate(name,x=0,y=0,z=0) {
    this.joints[name]?.rotation.set(x,y,z);
  }
  pose(actor,dt,time,depth,size,weapon,still) {
    const aim = actor.angle??Math.PI*.5;
    const heading = Math.atan2(Math.cos(aim)*depth,Math.sin(aim));
    this.yaw = this.yaw===null||still?heading:angleToward(this.yaw,heading,actor.attack||actor.dash?32:18,dt);
    this.root.rotation.y = this.yaw;
    const biped = this.style==="cat"||this.style==="biped"||this.style==="guardian";
    const guardian = this.style==="guardian";
    const moving = actor.walking&&!actor.dash&&!actor.warning;
    const walk = this.motion = damp(this.motion,moving?1:0,moving?21:16,dt);
    this.gait += dt * (biped?14:17) * (.32+walk*.68);
    const stride = Math.sin(this.gait)*walk;
    const bounce = Math.abs(Math.sin(this.gait))*walk;
    const breath = still?0:Math.sin(time*3.25);
    const float = this.style==="float";
    const warning = actor.warning ? 1-clamp(actor.warning.left/actor.warning.total,0,1) : 0;
    const recoil = clamp((actor.recoil||0)/.22,0,1);
    const attack = actor.attack;
    const cast = clamp((actor.castPose||0)/.29,0,1);
    const hurt = clamp((actor.hit||0)/(this.kind==="hero"?.23:.115),0,1);
    const impact = this.stagger = damp(this.stagger,hurt,hurt>this.stagger?43:15,dt);
    const dodge = actor.dash ? 1-clamp(actor.dash.left/(actor.dash.total||.20),0,1) : 0;
    const falling = actor.hp===0;
    if(falling)this.fall = Math.min(1,this.fall+dt/(guardian?.47:.26));
    const fall = ease(this.fall);
    this.action = falling?"fall":actor.dash?"roll":attack?"strike":cast>0?"cast":impact>.085?"hurt":actor.warning?"charge":recoil>0?"release":moving?"walk":"idle";

    let lean = stride*.023 + breath*.018 - impact*.19 - warning*.13 + recoil*.19;
    let turn = stride*.06;
    let armL = stride*.44, armR = -stride*.44;
    let twistL = -.14, twistR = .14;
    let wristL = -.15, wristR = -.20;
    let lift = bounce*.041 + (float?.050+breath*.054:breath*.013);
    let roll = 0;
    if(this.action==="strike"){
      const progress = 1-clamp(attack.left/attack.total,0,1);
      const contact = 1-attack.impact/attack.total;
      const lead = ease(progress/Math.max(.01,contact));
      const recover = ease((progress-contact)/(1-contact));
      const sweep = mix(-.96,1.20,lead)*(1-recover);
      const reach = Math.sin(progress*Math.PI);
      turn += sweep*(attack.heavy?.94:.74);
      lean += reach*(weapon==="spear"||weapon==="fang"?.28:.17);
      armR += (weapon==="anchor"?-1.58:-1.28)*reach;
      twistR += sweep*.94;
      wristR += (weapon==="spear"?-.54:-.36)*reach;
      armL -= reach*.46;
      lift += reach*(attack.heavy?.11:.047);
    }else if(this.action==="charge"||this.action==="release"){
      const pull = ease(warning);
      armR -= pull*(guardian?1.77:1.23);
      armL -= pull*(guardian?1.23:.88);
      twistR += pull*.69;
      twistL -= pull*.63;
      turn -= pull*.24;
      lean += recoil*.30;
      armR -= recoil*.84;
      armL -= recoil*.62;
    }else if(this.action==="cast"){
      const opening = Math.sin(cast*Math.PI);
      armL -= opening*1.27;
      twistL -= opening*.54;
      wristL -= opening*.65;
      lift += opening*.041;
    }
    if(this.action==="roll"){
      roll = Math.PI*2*ease(dodge);
      lift += Math.sin(dodge*Math.PI)*.18;
      armL = armR = -1.21;
      wristL = wristR = -.58;
    }
    const crouch = actor.dash?Math.sin(dodge*Math.PI):0;
    const scale = size*(scaleByKind[this.kind]||1);
    const spread = 1+impact*.086-crouch*.09;
    this.root.scale.set(scale*spread,scale*(1-impact*.10-crouch*.16)*(1-fall*.98),scale*spread);
    this.pivot.position.y = .56+lift-fall*.23;
    this.pivot.rotation.set(roll+lean+fall*.74,0,impact*.15+fall*.66);
    this.rotate("core",0,turn,stride*.018);
    this.rotate("torso",lean*.47,turn*.44,-stride*.055);
    this.rotate("head",impact*.19-lean*.51,turn*-.26,stride*.033);
    this.rotate("tail",breath*.14+impact*.35,Math.sin(this.gait*.53)*(.15+walk*.39),stride*.093);
    this.rotate("tailTip",breath*.17,Math.cos(this.gait*.61)*.35,-stride*.12);
    this.rotate("cloth",-.13-walk*.27-crouch*.38+breath*.10,turn*.34,-stride*.18);
    this.rotate("clothTip",-.13+Math.sin(time*8)*.18*walk,-turn*.32,breath*.11);
    this.rotate("halo",breath*.12-recoil*.22,Math.sin(time*(actor.enraged?4.7:2.1))*.22,breath*.07);
    this.rotate("panL",recoil*.15,-breath*.12,breath*.20);
    this.rotate("panR",-recoil*.14,breath*.12,breath*-.21);
    this.rotate("grip",-.18+turn*.18,crouch*.41,-turn*.42);
    this.rotate("armL",armL,twistL,-.10-warning*.37+impact*.27);
    this.rotate("armR",armR,twistR,.10+warning*.38-impact*.22);
    this.rotate("elbowL",wristL-stride*.11,0,0);
    this.rotate("elbowR",wristR+stride*.11,0,0);
    this.rotate("hipL",-stride*.64-crouch*.83,0,.055);
    this.rotate("hipR",stride*.64-crouch*.83,0,-.055);
    this.rotate("kneeL",Math.max(0,stride)*.75+crouch*1.39);
    this.rotate("kneeR",Math.max(0,-stride)*.75+crouch*1.39);
    this.rotate("earL",breath*.046+impact*.15,0,-stride*.063);
    this.rotate("earR",breath*-.039+impact*.15,0,-stride*.047);
    for(let i=0;i<7;i++){
      this.rotate("ribbon"+i,Math.sin(time*5+i)*.20+warning*.44,0,Math.cos(time*4+i)*.21);
    }
    if(this.style==="crab"){
      for(let i=0;i<3;i++){
        const r=Math.sin(this.gait+i*1.46)*walk;
        this.rotate("legL"+i,r*.36,r*.31,-r*.26);
        this.rotate("legR"+i,-r*.36,-r*.31,-r*.26);
      }
    }
    if(this.joints.eye){
      const blink = (time+this.kind.length*.42)%4.3;
      const closure = blink<.13?Math.sin(blink/.13*Math.PI):0;
      this.joints.eye.scale.y = Math.max(.11,1-closure*.93-impact*.41);
    }
    this.skeleton.updateMatrixWorld(true);
    const ward = this.kind==="hero" ? Math.max(cast*.79,crouch*.58,(actor.invulnerable||0)*.39) : guardian&&actor.enraged?.52:0;
    for(const mesh of [this.skin,this.line]){
      const {uniforms}=mesh.material;
      uniforms.weapon.value = gear[weapon] || 1;
      uniforms.hit.value = impact;
      uniforms.ward.value = ward;
    }
  }
}

export class CharacterStage {
  constructor(stage,plane,shadowMaterial,cool,warm,depth) {
    Object.assign(this,{stage,plane,shadowMaterial,cool,warm,depth});
    this.figures = new Map();
    this.cache = new Map();
    this.pool = new Map();
    this.frame = 0;
  }
  begin(dt,time,still,compact) {
    this.dt=dt;
    this.time=time;
    this.still=still;
    this.compact=compact;
    this.frame++;
  }
  create(kind) {
    if(!this.cache.has(kind))this.cache.set(kind,buildFigure(kind));
    const item = new ActorModel(kind,this.cache.get(kind),this.stage,this.cool,this.warm);
    item.shadow = new T.Mesh(this.plane,this.shadowMaterial);
    item.shadow.rotation.x = -Math.PI/2;
    item.shadow.renderOrder = 1;
    this.stage.add(item.shadow);
    return item;
  }
  draw(key,kind,actor,position,size,weapon) {
    let item = this.figures.get(key);
    if(!item){
      if(actor.hp===0)return;
      const available = this.pool.get(kind);
      item = available?.pop() || this.create(kind);
      item.reset();
      this.figures.set(key,item);
    }
    if(item.fall>=1)return;
    item.frame=this.frame;
    item.root.position.copy(position);
    item.pose(actor,this.dt,this.time,this.depth,size,weapon,this.still);
    item.line.visible = !this.compact||kind==="hero"||item.style==="guardian";
    item.skin.material.uniforms.edge.value = item.line.visible?0:1;
    item.shadow.visible = true;
    item.shadow.position.set(position.x,1.7,position.z+3);
    const width=size*(.85-item.fall*.53);
    item.shadow.scale.set(width,width*.76,1);
  }
  end() {
    for(const [key,item] of this.figures){
      if(item.frame===this.frame)continue;
      item.root.visible=item.shadow.visible=false;
      this.figures.delete(key);
      if(!this.pool.has(item.kind))this.pool.set(item.kind,[]);
      this.pool.get(item.kind).push(item);
    }
  }
}
