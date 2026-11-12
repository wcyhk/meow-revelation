import * as T from '../three.min.mjs';

const PI=Math.PI;
const TAU=PI*2;

function ribbon(sections,sample) {
  const positions=[],uvs=[],indices=[];
  for (let i=0;i<=sections;i++) {
    const u=i/sections;
    for (const v of [0,1]) {
      positions.push(...sample(u,v));
      uvs.push(u,v);
    }
    if (i<sections) {
      const a=i*2;
      indices.push(a,a+1,a+2,a+2,a+1,a+3);
    }
  }
  return new T.BufferGeometry().setIndex(indices)
    .setAttribute('position',new T.Float32BufferAttribute(positions,3))
    .setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
}

function slashRibbon() {
  return ribbon(38,(u,v)=>{
    const angle=(u-.49)*PI*1.37;
    const taper=Math.pow(Math.sin(u*PI),.62);
    const radius=1.43+v*.53*taper;
    return [Math.cos(angle)*radius,.11*Math.sin(u*TAU)+v*.09*taper,Math.sin(angle)*radius];
  });
}

function spiralRibbon() {
  return ribbon(34,(u,v)=>{
    const angle=u*TAU*.91;
    const radius=.95-u*.37+(v-.45)*.19*Math.sin(u*PI);
    return [Math.cos(angle)*radius,u*.72+v*.09,Math.sin(angle)*radius];
  });
}

function jetRibbon() {
  return ribbon(18,(u,v)=>{
    const width=.018+.17*Math.sin(PI*u)**1.7;
    return [u,(v-.5)*.034*Math.sin(PI*u),(v-.5)*width];
  });
}

function fallingBladeRibbon() {
  return ribbon(32,(u,v)=>{
    const sweep=u*1.88-.26;
    const radius=.80+.23*v*Math.sin(u*PI);
    return [.22+Math.sin(sweep)*radius,Math.cos(sweep)*radius,
      (v-.5)*.23*Math.sin(u*PI)];
  });
}

function arrowHead() {
  return new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([
    .22,0,0, -.13,0,-.084, -.07,0,0, .22,0,0, -.07,0,0, -.13,0,.084,
  ],3));
}

function cleaveRibbon(halfAngle) {
  return ribbon(34,(u,v)=>{
    const angle=(u*2-1)*halfAngle;
    const blade=Math.sin(u*PI)**.64;
    const radius=.82+v*.18*blade;
    return [Math.cos(angle)*radius,.14*Math.sin(PI*u)+v*.048,Math.sin(angle)*radius];
  });
}

function shieldFragments() {
  const vertices=[];
  for (let index=0;index<12;index++) {
    const angle=index*TAU/12,reach=.32+(index%4)*.09;
    const x=Math.cos(angle)*reach,y=Math.sin(angle)*reach;
    const skew=.047+(index%3)*.021;
    vertices.push(x,y,0,x+Math.cos(angle+.61)*skew,y+Math.sin(angle+.61)*skew,.011,
      x+Math.cos(angle)*skew*2.7,y+Math.sin(angle)*skew*2.7,.024);
  }
  return new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));
}

function boltRibbon(path,width,positions,uvs,indices) {
  const start=positions.length/3;
  const camera=new T.Vector3(0,.63,.77);
  for (let i=0;i<path.length;i++) {
    const u=i/(path.length-1);
    const direction=path[Math.min(path.length-1,i+1)].clone().sub(path[Math.max(0,i-1)]);
    const side=new T.Vector3().crossVectors(direction,camera).normalize().multiplyScalar(width*(1-.34*u));
    for (const v of [0,1]) {
      const point=path[i].clone().addScaledVector(side,v*2-1);
      positions.push(point.x,point.y,point.z);
      uvs.push(u,v);
    }
    if (i+1<path.length) {
      const a=start+i*2;
      indices.push(a,a+1,a+2,a+2,a+1,a+3);
    }
  }
}

function lightning(from,to,intensity,mobile) {
  const start=new T.Vector3(from.x,from.y,from.z);
  const end=new T.Vector3(to.x,to.y,to.z);
  const distance=start.distanceTo(end);
  const count=mobile?9:13;
  const path=[start];
  const seed=(from.x*6.7+from.y*4.1+from.z*3.8+to.z*7.2);
  for (let i=1;i<count;i++) {
    const u=i/count,jitter=Math.min(.36,distance*.15)*Math.sin(PI*u)**.56;
    const p=start.clone().lerp(end,u);
    p.x+=Math.sin(i*9.31+seed)*jitter;
    p.y+=Math.cos(i*7.3-seed)*jitter*.64;
    p.z+=Math.sin(i*4.19+seed)*jitter;
    path.push(p);
  }
  path.push(end);
  const positions=[],uvs=[],indices=[];
  boltRibbon(path,.056+intensity*.060,positions,uvs,indices);
  const branches=intensity>1.18?(mobile?2:4):1;
  for (let branch=0;branch<branches;branch++) {
    const i=2+Math.floor(branch*(count-3)/branches);
    const origin=path[i],target=path[i+2];
    const drift=new T.Vector3(Math.sin(seed+branch*5.4),.15+Math.sin(branch*8+seed)*.25,Math.cos(seed+branch*4.1))
      .multiplyScalar(Math.min(.86,distance*.19));
    boltRibbon([origin,origin.clone().lerp(target,.38).addScaledVector(drift,.32),
      origin.clone().lerp(target,.66).addScaledVector(drift,.72),target.clone().add(drift)],
      .032+intensity*.012,positions,uvs,indices);
  }
  return new T.BufferGeometry().setIndex(indices)
    .setAttribute('position',new T.Float32BufferAttribute(positions,3))
    .setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
}

const vertex=`varying vec2 tex; void main(){tex=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`
  varying vec2 tex; uniform vec3 ink,edge; uniform float life,opacity,kind;
  void main(){
    float u=tex.x,v=tex.y;
    float tip=smoothstep(0.,.14,u)*(1.-smoothstep(.89,1.,u));
    float sweep=smoothstep(u-.20,u+.018,life*3.9+.22);
    float ribbon=pow(max(0.,sin(v*3.14159)),1.5);
    float crease=exp(-abs(v-.79)*31.);
    float fibers=pow(.5+.5*sin(u*17.+v*33.-life*5.),8.)*.24;
    float split=.67+.33*sin(u*16.+life*4.);
    float alpha=tip*sweep*(ribbon*.65+crease*.59+fibers*ribbon)*opacity;
    vec3 tone=mix(ink*.77,edge,crease*.86+fibers*.23);
    if(kind>.5&&kind<1.5){
      float beam=abs(v-.5);
      float halo=exp(-beam*5.1)*(1.-smoothstep(.31,.50,beam));
      float core=exp(-beam*17.);
      alpha=(halo*.51+core*.87)*mix(.66,1.,tip)*opacity;
      tone=mix(ink,edge,core*.89)*split;
    }
    if(kind>1.5){
      alpha=tip*(ribbon*.61+crease*.43)*opacity;
      tone=mix(ink*.64,edge,crease*.74+fibers);
    }
    gl_FragColor=vec4(tone,alpha);
    #include <colorspace_fragment>
  }`;

function shardGeometry() {
  const path=new T.Shape();
  path.moveTo(0,-1.25);path.lineTo(.21,-.73);path.lineTo(.135,.54);
  path.lineTo(.30,.62);path.lineTo(.26,.74);path.lineTo(.065,.70);
  path.lineTo(.057,1.05);path.lineTo(-.062,1.05);path.lineTo(-.064,.70);
  path.lineTo(-.26,.74);path.lineTo(-.30,.62);path.lineTo(-.135,.54);path.lineTo(-.21,-.73);
  path.closePath();
  return new T.ShapeGeometry(path);
}

function flashGeometry() {
  const shape=new T.Shape();
  for (let index=0;index<16;index++) {
    const angle=index*TAU/16;
    const length=index%4===0?(index%8===0?1:.62):index%2===0?.34:.12;
    const x=Math.cos(angle)*length,y=Math.sin(angle)*length;
    if (index===0) shape.moveTo(x,y);
    else shape.lineTo(x,y);
  }
  shape.closePath();
  return new T.ShapeGeometry(shape);
}

function flameGeometry() {
  const shape=new T.Shape();
  shape.moveTo(-.29,-.40);
  shape.bezierCurveTo(-.68,-.22,-.49,.24,-.38,.39);
  shape.bezierCurveTo(-.32,.13,-.23,.06,-.16,.15);
  shape.bezierCurveTo(.01,.29,-.05,.75,.29,.99);
  shape.bezierCurveTo(.14,.61,.67,.23,.47,-.18);
  shape.bezierCurveTo(.33,-.48,-.05,-.50,-.29,-.40);
  return new T.ShapeGeometry(shape,12);
}

function serratedDisk() {
  const shape=new T.Shape();
  for (let i=0;i<64;i++) {
    const angle=i*TAU/64, r=i%4===0?.57:i%4===1?.565:.47;
    const x=Math.cos(angle)*r,y=Math.sin(angle)*r;
    if (i===0) shape.moveTo(x,y);
    else shape.lineTo(x,y);
  }
  const cut=new T.Path();
  cut.absarc(0,0,.386,0,TAU,true);
  shape.holes.push(cut);
  shape.closePath();
  return new T.ShapeGeometry(shape).rotateX(-PI/2);
}

export class MotionArt {
  constructor(view) {
    this.view=view;
    this.cut=slashRibbon();
    this.spiral=spiralRibbon();
    this.jet=jetRibbon();
    this.downstroke=fallingBladeRibbon();
    this.arrowhead=arrowHead();
    this.blade=shardGeometry();
    this.disk=serratedDisk();
    this.star=flashGeometry();
    this.flame=flameGeometry();
    this.shards=shieldFragments();
    this.cleaves=new Map();
    this.lastEnemyTrail=new WeakMap();
    this.lastTrail=-1;
    this.budget=0;
  }

  accent() {
    const cap=this.view.mobile?28:48;
    return this.view.effects.length<cap&&this.budget++<(this.view.mobile?14:25);
  }

  ribbon(geometry,point,tint,duration,{kind=0,owned=false,...settings}={}) {
    const ink=new T.Color(tint);
    const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
      blending:T.AdditiveBlending,uniforms:{ink:{value:ink},edge:{value:ink.clone().lerp(new T.Color(0xfff4de),.76)},
        opacity:{value:settings.opacity??.85},life:{value:0},kind:{value:kind}},vertexShader:vertex,fragmentShader:fragment});
    return this.view.addEffect(geometry,point,tint,duration,{...settings,owned,material,fade:true});
  }

  slash(x,z,dx,dz,tint,reach,finisher,direction=1,lift=.61) {
    const angle=-Math.atan2(dz,dx);
    const p={x:x+dx*.23,y:lift,z:z+dz*.23};
    const scale=reach*.46;
    const hit=this.ribbon(this.cut,p,tint,finisher?.35:.24,{scale,angle,growth:.25,opacity:1.02,order:90});
    hit.spin=(finisher?-3.2:-2.55)*direction;
    if (this.accent()) {
      const echo=this.ribbon(this.cut,{...p,y:lift+.22},tint,finisher?.31:.21,
        {scale:scale*.92,angle:angle+.46*direction,growth:.14,opacity:.54,order:89});
      echo.spin=(finisher?3.1:1.1)*direction;
    }
  }

  wave(point,dx,dz,tint,strong,style) {
    const scale=strong?1.73:1.06;
    const angle=-Math.atan2(dz,dx);
    const main=this.ribbon(this.cut,point,tint,strong?.47:.31,{kind:2,scale,angle,growth:.43,opacity:.86,order:91});
    main.travel={x:dx*(strong?8.6:6.3),z:dz*(strong?8.6:6.3)};
    main.stretchZ=strong?1.74:1.29;
    if (strong&&this.accent()) {
      const wings=this.ribbon(this.cut,{...point,y:.96},style==='fire'?0xffb375:tint,.37,
        {scale:scale*.88,angle:angle+.24,growth:.38,opacity:.53,order:90});
      wings.travel=main.travel;
      wings.stretchZ=style==='fire'?2.05:1.45;
    }
  }

  thrust(point,dx,dz,reach,tint,heavy) {
    const angle=-Math.atan2(dz,dx);
    this.ribbon(this.jet,point,tint,heavy?.28:.19,{kind:1,scale:reach,angle,opacity:.94,order:94});
    if (heavy&&this.accent()) this.ribbon(this.jet,{...point,y:.88},tint,.24,
      {scale:reach*.92,angle:angle+.064,growth:.19,opacity:.59,order:93});
  }

  overhead(origin,dx,dz,reach,tint) {
    const angle=-Math.atan2(dz,dx);
    this.ribbon(this.downstroke,{x:origin.x,y:.66,z:origin.z},tint,.37,
      {scale:reach*.98,angle,opacity:1.12,order:93});
    if (this.accent()) this.ribbon(this.downstroke,{x:origin.x,y:.47,z:origin.z},0xffb873,.29,
      {scale:reach*.83,angle:angle+.13,growth:.24,opacity:.69,order:91});
  }

  arrow(origin,dx,dz,range,tint,duration,heavy) {
    const angle=-Math.atan2(dz,dx);
    const point={x:origin.x+dx*.19,y:.92,z:origin.z+dz*.19};
    const travel={x:dx*range/duration,z:dz*range/duration};
    const head=this.view.addEffect(this.arrowhead,point,tint,duration+.02,
      {scale:heavy?1.95:1.18,angle,opacity:1.04,order:94});
    head.travel=travel;
    head.combatClock=true;
    const trail=this.ribbon(this.jet,{x:point.x-dx*.84,y:.91,z:point.z-dz*.84},tint,duration+.02,
      {kind:1,scale:heavy?1.65:1.07,angle,opacity:.98,order:93});
    trail.travel=travel;
    trail.combatClock=true;
    if (heavy&&this.accent()) this.flash(point,0xc6edff,.73);
  }

  bolt(from,to,tint,intensity) {
    if (Math.hypot(to.x-from.x,to.y-from.y,to.z-from.z)<.03) return;
    const geometry=lightning(from,to,intensity,this.view.mobile);
    this.ribbon(geometry,{x:0,y:0,z:0},tint,intensity>1.2?.27:.20,{kind:1,owned:true,opacity:1.0,order:93});
    if (intensity>1.65&&this.accent()) this.flash(to,tint,.50+intensity*.08);
  }

  flash(point,tint,scale) {
    const light=this.view.addEffect(this.star,point,tint,.18,{scale:scale*.63,growth:scale*.69,opacity:.90,fade:true,order:97});
    light.mesh.quaternion.copy(this.view.camera.quaternion);
    light.mesh.rotateZ(.39);
  }

  impact(point,angle,tint,kind) {
    if (kind==='break') {
      const burst=this.view.addEffect(this.shards,point,tint,.48,{scale:.46,growth:1.82,opacity:.93,fade:true,order:98});
      burst.mesh.quaternion.copy(this.view.camera.quaternion);
      burst.mesh.rotateZ(angle+.51);
      this.flash(point,0xe4fcff,1.11);
    } else if (kind==='heavy'||kind==='fall') {
      this.flash(point,tint,kind==='fall'?.86:.76);
      const strike=this.ribbon(this.cut,{...point,y:point.y*.83},tint,.25,
        {kind:2,scale:.42,angle:-angle,growth:.17,opacity:.65,order:93});
      strike.stretchZ=.59;
    } else if (kind==='block') {
      const flash=this.view.addEffect(this.shards,point,tint,.21,{scale:.50,growth:.25,opacity:.57,fade:true,order:97});
      flash.mesh.quaternion.copy(this.view.camera.quaternion);
    }
  }

  enemyCleave(hazard) {
    const {x,z,radius,width,angle,tint}=hazard;
    const key=Math.round(width*100)/100;
    if (!this.cleaves.has(key)) this.cleaves.set(key,cleaveRibbon(key));
    const geometry=this.cleaves.get(key);
    this.ribbon(geometry,{x,y:.42,z},tint,.31,{scale:radius,angle:-angle,opacity:1.07,order:83});
    if (this.accent()) {
      this.ribbon(geometry,{x,y:.31,z},tint,.24,{scale:radius*.87,angle:-angle+.12,opacity:.47,order:82});
    }
  }

  enemyTrail(from,unit) {
    if (this.view.time-(this.lastEnemyTrail.get(unit)??-1)<.061
      ||Math.hypot(unit.x-from.x,unit.z-from.z)<.11||!this.accent()) return;
    this.lastEnemyTrail.set(unit,this.view.time);
    const angle=Math.atan2(unit.z-from.z,unit.x-from.x);
    const size=Math.min(1.15,unit.spec.height*.42);
    const fx=this.ribbon(this.cut,{x:from.x,y:.32,z:from.z},unit.spec.tint,.23,
      {kind:2,scale:size,angle:-angle+PI,opacity:.57,order:45});
    fx.stretchZ=.68;
    this.view.spark(from.x,.14,from.z,0xbaa086,this.view.mobile?3:5,.45,'stone',angle+PI);
  }

  vortex(x,z,radius,tint) {
    for (const [index,angle] of [0,2.35].entries()) {
      const fx=this.ribbon(this.spiral,{x,y:.09+index*.19,z},tint,.64-index*.08,
        {kind:2,scale:radius*(.96-index*.13),angle,opacity:.89-index*.16,growth:.22,order:71+index});
      fx.spin=index===0?6.1:-4.8;
    }
  }

  spinningDisk(x,z,dx,dz,range,tint,curve=0,heavy=false) {
    const point={x,y:.68,z};
    const travel={x:dx*range/.38,z:dz*range/.38};
    const rim=this.view.addEffect(this.disk,point,tint,.38,{scale:heavy?1.72:1.32,growth:.14,opacity:.94,order:85});
    rim.spin=29;
    rim.travel=travel;
    const filigree=this.view.addEffect(this.view.ring,{...point,y:.75},0xffe2a1,.37,
      {scale:heavy?.72:.52,growth:.10,opacity:.87,order:86});
    filigree.travel=travel;
    if (curve) for (const fx of [rim,filigree]) fx.drift={x:-dz*curve,z:dx*curve,last:0};
  }

  bladefall(x,z,tint,wait,index) {
    const fx=this.view.addEffect(this.blade,{x,y:5.3,z},tint,wait+.075,
      {angle:index*2.4+.6,scale:1.11,opacity:.91,order:89,fade:true});
    fx.drop=5.0;
    fx.spin=1.6;
    fx.combatClock=true;
  }

  rush(from,to,tint) {
    if (this.view.time-this.lastTrail<.045||Math.hypot(to.x-from.x,to.z-from.z)<.025||!this.accent()) return;
    this.lastTrail=this.view.time;
    const angle=-Math.atan2(to.z-from.z,to.x-from.x);
    const fx=this.ribbon(this.cut,{x:from.x,y:.62,z:from.z},tint,.22,{kind:2,scale:.93,angle,opacity:.66,order:81});
    fx.spin=-4.6;
  }
}
