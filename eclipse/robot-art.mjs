import * as T from '../three.min.mjs';

const box=new T.BoxGeometry(1,1,1);
const bevel=new T.DodecahedronGeometry(1);
const barrel=new T.CylinderGeometry(1,1,1,8).rotateX(Math.PI/2);
const cone=new T.ConeGeometry(1,1,8).rotateX(Math.PI/2);
const collar=new T.TorusGeometry(1,.16,4,10);
const trailShape=new T.CylinderGeometry(1,1,1,5);
const metal=new T.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.4});
const light=new T.MeshBasicMaterial({vertexColors:true,toneMapped:false});
const yAxis=new T.Vector3(0,1,0);
const shadowShape=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const round=new T.Vector3(),direction=new T.Vector3();

function baked(parts,material) {
  const vertex=[],normal=[],color=[];
  for(const [shape,tint,x,y,z,w,h,d,tilt=0] of parts) {
    const data=shape.index?shape.toNonIndexed():shape.clone();
    data.scale(w,h,d).rotateZ(tilt).translate(x,y,z);
    const positions=data.getAttribute('position');
    const rgb=new T.Color(tint);
    for(let i=0;i<positions.count;i++) color.push(rgb.r,rgb.g,rgb.b);
    for(const v of positions.array) vertex.push(v);
    for(const v of data.getAttribute('normal').array) normal.push(v);
    data.dispose();
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertex,3));
  geometry.setAttribute('normal',new T.Float32BufferAttribute(normal,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  return new T.Mesh(geometry,material);
}

export function createRobot(view,config) {
  const {id,paint,tint,scale}=config;
  const root=new T.Group();
  root.name='robot-'+id;
  const frame=new T.Group(),turret=new T.Group(),gun=new T.Group();
  root.add(frame);frame.add(turret);turret.add(gun);
  frame.scale.setScalar(scale);
  const iron=0x27303c,silver=0x9aa1aa;
  frame.add(baked([
    [bevel,iron,0,0,0,.42,.29,.36],
    [bevel,paint,0,.13,0,.43,.23,.35],
    [box,silver,0,-.165,.19,.45,.065,.15],
    [box,iron,0,-.125,-.23,.42,.20,.18],
    [box,silver,-.11,.32,-.13,.045,.32,.044,.22],
    [bevel,iron,0,.224,-.10,.328,.062,.199],
    [bevel,0x4f606d,0,-.15,-.267,.313,.112,.145],
    ...[-1,1].flatMap(side=>[
      [bevel,iron,side*.34,-.02,-.07,.19,.23,.25],
      [bevel,paint,side*.39,.055,-.07,.17,.15,.23],
      [box,silver,side*.39,-.13,.04,.20,.04,.20],
      [bevel,silver,side*.455,-.035,.063,.104,.087,.193],
      [barrel,iron,side*.276,-.018,-.317,.121,.093,.113],
      [barrel,silver,side*.276,-.016,-.372,.098,.068,.070],
      ...[-1,0,1].map(row=>[box,0x162631,side*.37,row*.048+.028,-.284,.064,.029,.17,side*.31]),
    ]),
  ],metal));
  frame.add(baked([
    [box,tint,0,.13,.326,.36,.075,.045],
    [box,0xfff1d3,0,.135,.354,.118,.034,.014],
    [bevel,tint,-.144,.48,-.13,.044,.048,.044],
    [bevel,tint,-.39,-.21,-.07,.11,.10,.12],
    [bevel,tint,.39,-.21,-.07,.11,.10,.12],
    [bevel,tint,-.287,-.011,-.405,.045,.051,.030],
    [bevel,tint,.287,-.011,-.405,.045,.051,.030],
    [box,tint,0,-.102,-.369,.18,.031,.041],
  ],light));
  const length=id==='rocket'?.79:id==='minigun'?.71:.58;
  gun.position.set(.32,-.075,.18);
  if(id==='medic') {
    gun.visible=false;
    frame.add(baked([
      [box,0xe4fff2,0,-.08,.335,.22,.055,.04],
      [box,0xe4fff2,0,-.08,.335,.055,.20,.04],
    ],light));
  } else if(id==='rocket') {
    gun.add(baked([
      [barrel,paint,0,.03,.27,.17,.17,.77],
      [barrel,iron,0,.03,.70,.205,.205,.14],
      [barrel,silver,0,.03,.51,.186,.186,.084],
      [barrel,0x100e17,0,.03,.777,.136,.136,.025],
      [box,silver,0,.225,.23,.20,.055,.30],
    [collar,0xf0d7b7,0,.03,.792,.151,.151,.072],
    [barrel,iron,0,.03,.431,.187,.187,.051],
    ],metal));
  } else if(id==='smg') {
    gun.add(baked([
      [box,paint,0,0,.21,.235,.175,.48],
      [box,iron,0,-.16,.30,.145,.29,.16,-.20],
      [box,silver,0,.092,.24,.13,.037,.32],
      [barrel,silver,0,.014,.48,.074,.074,.22],
      [barrel,iron,0,.014,.58,.092,.092,.075],
    [collar,silver,0,.013,.623,.066,.066,.055],
    [box,0xa6bbc6,0,.047,.405,.101,.035,.12],
    ],metal));
  } else {
    gun.add(baked([
      [bevel,paint,0,0,.13,.225,.225,.26],
      [barrel,iron,0,0,.34,.18,.18,.34],
      [box,silver,0,-.22,.25,.19,.13,.36],
    ],metal));
  }
  const spinner=new T.Group();
  gun.add(spinner);
  if(id==='minigun') spinner.add(baked([
    [barrel,silver,0,0,.62,.17,.17,.12],
    ...Array.from({length:4},(_,i)=>[
      barrel,iron,Math.cos(i*Math.PI/2)*.098,Math.sin(i*Math.PI/2)*.098,.51,.046,.046,.45,
    ]),
    ...Array.from({length:4},(_,i)=>[
      collar,silver,Math.cos(i*Math.PI/2)*.098,Math.sin(i*Math.PI/2)*.098,.741,.042,.042,.056,
    ]),
  ],metal));
  const muzzle=new T.Object3D();
  muzzle.position.set(0,0,length);
  gun.add(muzzle);
  const flash=new T.Mesh(cone,new T.MeshBasicMaterial({color:tint,transparent:true,opacity:0,depthWrite:false,
    blending:T.AdditiveBlending,toneMapped:false}));
  flash.position.z=length+.19;
  flash.scale.set(.15,.15,.48);
  flash.visible=false;
  gun.add(flash);
  const shadow=new T.Mesh(shadowShape,new T.MeshBasicMaterial({map:view.shadow,transparent:true,opacity:.7,depthWrite:false}));
  shadow.scale.set(1.38,1,1.23);
  shadow.position.y=.032;
  root.add(shadow);
  return {root,frame,turret,gun,spinner,muzzle,flash};
}

export function createTracer() {
  const tracer=new T.Mesh(trailShape,new T.MeshBasicMaterial({
    color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
  }));
  tracer.visible=false;
  return tracer;
}

export function aimTracer(tracer,from,to,width) {
  direction.subVectors(to,from);
  const length=Math.max(.01,direction.length());
  tracer.position.copy(from).addScaledVector(direction,.5);
  tracer.quaternion.setFromUnitVectors(yAxis,direction.divideScalar(length));
  tracer.scale.set(width,length,width);
}

export function createRocket(tint) {
  const root=new T.Group();
  root.add(baked([
    [cone,0xc96536,0,0,.195,.111,.111,.212],[barrel,0x332b30,0,0,-.011,.097,.097,.296],
    [collar,0xe9b376,0,0,.073,.106,.106,.071],[collar,0xcd865f,0,0,-.150,.098,.098,.065],
    [barrel,0x16151e,0,0,-.195,.086,.086,.092],
    [box,0xab7351,0,0,-.156,.278,.042,.156],[box,0xab7351,0,0,-.156,.042,.278,.156],
  ],metal));
  root.add(baked([
    [barrel,tint,0,0,-.209,.056,.056,.05],[cone,0xff9362,0,0,-.34,.058,.058,.25],
    [collar,0xffd6a3,0,0,-.25,.039,.039,.058],
  ],light));
  root.visible=false;
  return root;
}

export function poseRobot(bot,time,dt) {
  const {art,config}=bot;
  art.root.position.set(bot.x,0,bot.z);
  art.frame.position.y=.83+Math.sin(time*4.1+bot.phase)*.091+config.lift;
  art.frame.rotation.z=Math.sin(time*5+bot.phase)*.055+bot.tilt;
  art.frame.rotation.x=-Math.min(.26,bot.recoil*.34);
  art.turret.rotation.y=bot.yaw;
  art.gun.position.z=.18-bot.recoil*.24;
  art.flash.visible=bot.flash>0;
  art.flash.material.opacity=Math.min(.91,bot.flash*15);
  art.spinner.rotation.z+=dt*(bot.shots>0?29:bot.flash>0?18:2);
}

export function muzzlePosition(bot,out) {
  bot.art.root.updateMatrixWorld(true);
  return bot.art.muzzle.getWorldPosition(out);
}

export function rocketPose(rocket,from,to,fraction) {
  rocket.position.copy(from).lerp(to,fraction);
  rocket.rotation.y=Math.atan2(to.x-from.x,to.z-from.z);
  round.subVectors(to,from);
  rocket.rotation.x=-Math.atan2(round.y,Math.hypot(round.x,round.z));
}
