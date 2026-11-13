import * as T from '../three.min.mjs';

const TAU=Math.PI*2;
const aqua=0x43e8de,white=0xcafbf2,antique=0xdcb66d;
const wheel=new T.RingGeometry(.92,1,48).rotateX(-Math.PI/2);
const fissureCore=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const etched=new T.BufferGeometry();
const edges=[];
function chord(angle,radius,next,end){
  edges.push(Math.cos(angle)*radius,0,Math.sin(angle)*radius,Math.cos(next)*end,0,Math.sin(next)*end);
}
for(let spoke=0;spoke<8;spoke++){
  const a=spoke*TAU/8;
  for(const [from,to] of [[a-.048,a],[a,a+.048]])chord(from,.90,to,from===a?1.0:.98);
  chord(a,.67,a+TAU/8,.67);
  chord(a,.76,a,.89);
}
const blade=[];
for(let edge=0;edge<edges.length;edge+=6){
  const [x,,z,x2,,z2]=edges.slice(edge,edge+6);
  const a=[x,.007,z],b=[x2,.007,z2];
  const span=Math.hypot(x2-x,z2-z)*50;
  const dx=(z2-z)/span,dz=(x-x2)/span;
  blade.push(...a,x+dx,.007,z+dz,...b,...b,x+dx,.007,z+dz,x2+dx,.007,z2+dz);
}
etched.setAttribute('position',new T.Float32BufferAttribute(blade,3));
export const paoSharedGeometry=[wheel,etched,fissureCore];

function seal(view,x,z,size,duration,ringColor=antique){
  const point={x,y:.091,z};
  view.addEffect(wheel,point,ringColor,duration,{scale:size,growth:.20,fade:true,opacity:.76,order:31});
  const marks=view.addEffect(etched,{...point,y:.105},aqua,duration,{scale:size*.89,growth:.25,fade:true,opacity:.96,order:32});
  marks.spin=.73;
  return marks;
}

function helix(view,x,y,z,radius,rise,turns,color,duration,reverse=false){
  const samples=view.mobile?36:60;
  const path=[];
  for(let index=0;index<=samples;index++){
    const t=index/samples,a=t*turns*TAU*(reverse?-1:1);
    const width=radius*(.56+.40*Math.sin(t*Math.PI*.82));
    path.push(new T.Vector3(Math.cos(a)*width,t*rise,Math.sin(a)*width));
  }
  const tube=new T.TubeGeometry(new T.CatmullRomCurve3(path),samples,view.mobile?.023:.027,4);
  const trail=view.addEffect(tube,{x,y,z},color,duration,{owned:true,fade:true,opacity:.93,growth:.18,order:45});
  trail.spin=reverse?-5.3:6.1;
  trail.animate=age=>{trail.mesh.scale.y*=.65+.35*Math.sin(age*Math.PI/2);};
}

function beam(view,hazard){
  const {x,z,angle,radius,width}=hazard;
  const dx=Math.cos(angle),dz=Math.sin(angle);
  const corePoint={x,y:.42,z};
  const layers=[
    {radius:width*.52,color:0x157e95,life:.43,opacity:.31,height:.41},
    {radius:width*.27,color:aqua,life:.30,opacity:.70,height:.48},
    {radius:Math.max(.045,width*.104),color:white,life:.22,opacity:.98,height:.49},
  ];
  for(const layer of layers){
    const cylinder=new T.CylinderGeometry(layer.radius*.58,layer.radius,radius,view.mobile?8:12,1,true).rotateZ(-Math.PI/2);
    const glow=view.addEffect(cylinder,{...corePoint,y:layer.height},layer.color,layer.life,
      {owned:true,angle:-angle,fade:true,opacity:layer.opacity,order:58});
    glow.animate=age=>{glow.mesh.scale.y=glow.mesh.scale.z=(1-.66*age)*(.90+.10*Math.sin(age*18));};
  }
  const start={x:x-dx*radius*.49,y:.51,z:z-dz*radius*.49};
  const end={x:x+dx*radius*.48,y:.42,z:z+dz*radius*.48};
  view.motion.bolt(start,end,aqua,1.6);
  for(const offset of [-.38,0,.39]){
    const point={x:x+dx*radius*offset,z:z+dz*radius*offset};
    view.spark(point.x,.39,point.z,aqua,view.mobile?3:6,.82,'flare',angle);
  }
}

export function paoStrike(view,hazard){
  const {x,z,radius,pattern}=hazard;
  switch(pattern){
    case 'lance':
      beam(view,hazard);
      return true;
    case 'marked':
      seal(view,x,z,radius*.95,.63);
      view.motion.flash({x,y:.45,z},white,1.07);
      view.motion.bolt({x,y:2.38,z},{x,y:.145,z},aqua,1.13);
      break;
    case 'prison':
      seal(view,x,z,radius*.98,.82);
      helix(view,x,.13,z,radius*.86,1.56,1.38,aqua,.69);
      break;
    case 'ring':{
      seal(view,x,z,radius,.60);
      const crest=view.addEffect(wheel,{x,y:.27,z},aqua,.49,{scale:radius*.95,growth:.54,opacity:.88,fade:true,order:39});
      crest.vertical={from:.27,to:1.08,duration:.49};
      break;
    }
    case 'gravity':
      seal(view,x,z,radius,.96,0x6ca4a9);
      helix(view,x,.15,z,radius*.81,2.50,2.45,aqua,.99,true);
      if(!view.mobile)helix(view,x,.24,z,radius*.70,2.22,1.8,white,.70);
      break;
    case 'cinders':{
      const {angle,width}=hazard;
      const crack=view.addEffect(fissureCore,{x,y:.071,z},0xf68b50,.57,{
        angle:-angle,fade:true,opacity:.74,order:42,
      });
      crack.animate=age=>{
        crack.mesh.scale.set(radius,1,width*.16*(1.65-age));
      };
      crack.mesh.scale.set(radius,1,width*.24);
      for(const t of [-.39,-.21,0,.23,.41]){
        const px=x+Math.cos(angle)*radius*t,pz=z+Math.sin(angle)*radius*t;
        view.spark(px,.22,pz,0xffa54e,view.mobile?3:6,1.10,'fire',angle);
        view.spark(px,.19,pz,aqua,view.mobile?1:3,.68,'flare',angle);
      }
      return true;
    }
    default:
      return false;
  }
  view.spark(x,.31,z,white,view.mobile?5:9,.83,'flare');
  return true;
}

export function paoArrival(view,unit,event){
  const {x,z}=unit;
  const change=event==='phase',fall=event==='defeat';
  const size=change?3.2:fall?2.65:2.95;
  seal(view,x,z,size,change?1.02:.86);
  helix(view,x,.12,z,size,fall?1.8:3.55,2.10,aqua,change?1.03:.89,change);
  if(!view.mobile)helix(view,x,.37,z,size*.78,fall?1.37:2.90,1.8,white,.80,!change);
  view.motion.flash({x,y:change?.65:1.40,z},white,change?1.66:1.27);
  view.spark(x,.49,z,aqua,view.mobile?12:21,change?1.38:.91,'flare');
}

export function paoCastWindup(view,unit){
  const model=unit.visual.bestiary;
  const attack=unit.attack;
  const wheels=model.pao.wheels;
  const position=new T.Vector3();
  for(const [index,hand] of wheels.entries()){
    const point=hand.getWorldPosition(position).clone();
    const color=index?white:aqua;
    const aura=view.addEffect(wheel,point,color,attack.windup,{scale:.48,growth:.35,fade:false,opacity:.67,order:49});
    aura.mesh.rotation.x=Math.PI/2;
    aura.active=()=>unit.attack===attack&&!attack.interrupted&&unit.hp>0;
    aura.combatClock=true;
    aura.animate=age=>{
      hand.getWorldPosition(aura.mesh.position);
      const orientation=aura.mesh.quaternion;
      hand.getWorldQuaternion(orientation);
      aura.mesh.rotateX(Math.PI/2);
      aura.mesh.rotateY(age*1.75*(index?1:-1));
    };
  }
}
