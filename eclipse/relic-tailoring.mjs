import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirrored=(s,path)=>path.map(([x,...v])=>[s*x,...v]);
const panel=(k,j,m,p,d=.039)=>k.sculpt.plate(j,m,p,d,d*.28);
const braid=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:15,sides:mobile?6:8,ridge:.24});
const solid=(k,j,m,p,mobile,ridge=.18)=>k.geometry(j,m,sculptVolume(p,{rings:mobile?12:18,
  sides:mobile?9:13,section:2.62,ridge}));

export const relicFinishes={
  relicSoot:[0x383036,.71,.56,'iron'],relicSootEdge:[0x84604e,.66,.53,'iron'],
  relicCinnabar:[0x813632,.24,.61,'hide'],relicJade:[0x42645e,.42,.45,'iron'],
  relicRoseGold:[0xaa7951,.62,.46,'bronze'],
};

function relief(k,j,m,rim,p,d,mobile,sign=1){
  panel(k,j,m,p,d);
  braid(k,j,rim,p.slice(0,-1).map(([x,y,z],i)=>[x,y+.008,z+sign*.018,i===0?.006:.013]),mobile);
}

function strap(k,j,m,at,r,width,mobile){
  const [x,y,z]=at,p=[];
  for(let i=0;i<=8;i++){
    const a=i*Math.PI/4;
    p.push([x+Math.sin(a)*r,y+.015*Math.cos(a*2),z+Math.cos(a)*r,width]);
  }
  braid(k,j,m,p,mobile);
}

function rivet(k,g,m,x,y,z,r){
  k.mesh(g,'gem','deep',x,y,z,r*1.23,r*1.23,r*.68);
  k.mesh(g,'gem',m,x,y,z+Math.sign(z)*.011,r,r,r*.73);
}

function atelier(k,body,arms,legs,mantle,mobile,garments){
  const ledger=k.bone(body,0,.44,-.207);
  const lengths=[.49,.39,.30,.185];
  ledger.name='魔奧 · 槌痕脊甲';
  for(const s of sides){
    const shoulder=arms[s>0?1:0].shoulder;
    const spike=s<0?.21:.12;
    for(let i=0;i<(s<0?4:3);i++){
      const y=-i*.089;
      relief(k,shoulder,i%2?'relicSoot':'rind','relicSootEdge',mirrored(s,[[.018,y+.068,.102],
        [.125,y+.168,.075],[.244+spike,y+.195,-.073],[.290+spike,y+.082,-.154],
        [.191,y-.030,-.172],[.129,y-.098,-.079],[.060,y-.052,.18]]),.053,mobile);
    }
    for(const [i,w] of lengths.entries()){
      const y=.14-i*.137,z=-.093-i*.02;
      const back=mirrored(s,[[.033,y+.055,z+.051],[w*.52,y+.106,z],[w*.81,y+.067,z+.037],
        [w*.91,y-.016,z+.111],[w*.60,y-.083,z+.018],[.091,y-.114,z-.043],[.002,y-.052,z-.026]]);
      relief(k,ledger,i%2?'relicSoot':'rind','relicSootEdge',back,.057,mobile,-1);
      braid(k,ledger,'trim',mirrored(s,[[.031,y+.002,z-.057,.006],[w*.37,y+.015,z-.033,.018],
        [w*.58,y-.014,z-.004,.015],[w*.79,y-.035,z+.037,.003]]),mobile);
      rivet(k,ledger,'trim',s*w*.39,y+.041,z-.018,.020);
    }
    const truss=mirrored(s,[[.028,.202,.239],[.121,.241,.209],[.233,.228,.113],[.305,.116,.094],
      [.253,.007,.174],[.199,-.14,.229],[.049,-.20,.226],[.039,-.037,.255]]);
    relief(k,body,'relicSoot','relicSootEdge',truss,.056,mobile);
    for(const n of [0,1,2])braid(k,body,n===1?'rind':'trim',mirrored(s,[[.036,.124-n*.084,.274,.006],
      [.106,.113-n*.08,.289,.017],[.165,.141-n*.082,.253,.014],[.212,.217-n*.082,.212,.004]]),mobile);
    garments.push({parent:mantle,name:'魔奧 · 左右分披 '+s,
      path:mirrored(s,[[.104,.005,-.03,.127],[.178,-.28,-.134,.146],[.243,-.61,-.282,.156],[.233,-.94,-.443,.041]]),
      tint:0x3f3338,trim:0x8d7360,lining:0x2b252e,phase:s*.72,flex:.86});
  }
  const hook=k.bone(arms[1].elbow,.032,-.122,.029);
  const lock=[[.02,.156,.051],[.087,.081,.094],[.127,-.015,.085],[.120,-.133,.11],
    [.044,-.238,.123],[-.096,-.163,.133],[-.111,.047,.123],[-.049,.133,.095]];
  relief(k,hook,'relicSoot','rind',lock,.068,mobile);
  for(let i=0;i<3;i++)rivet(k,hook,'trim',.036,.081-i*.1,.166+i*.017,.022);
  for(const {thigh,side} of legs){
    const tab=k.bone(thigh,side*.109,-.096,-.104);
    tab.rotation.y=side*.46;
    relief(k,tab,'relicSoot','relicSootEdge',mirrored(side,[[-.063,.04,-.055],[.061,.126,-.048],
      [.145,.036,-.067],[.131,-.11,-.109],[.077,-.236,-.084],[-.006,-.202,-.091],[-.056,-.086,-.076]]),.057,mobile,-1);
  }
  return ({wind,strike,beat})=>{ledger.rotation.x=Math.sin(beat*.75)*.035+wind*.06-strike*.14;};
}

function festival(k,body,arms,legs,mantle,mobile,garments){
  const rear=k.bone(body,-.034,.448,-.217);
  rear.rotation.z=.19;
  const jaw=[[-.14,.16,-.061],[0,.251,-.043],[.199,.148,-.036],[.215,.017,-.072],
    [.108,-.159,-.11],[-.021,-.216,-.12],[-.162,-.10,-.082],[-.19,.026,-.068]];
  relief(k,rear,'relicJade','relicRoseGold',jaw,.076,mobile,-1);
  solid(k,rear,'relicCinnabar',[[0,-.131,-.08,.064,.032],[-.019,-.021,-.106,.112,.049],
    [.010,.071,-.109,.126,.061],[.033,.166,-.083,.076,.038]],mobile,.28);
  const harness=k.bone(body,0,.204,.145);
  harness.rotation.z=-.11;
  for(const s of sides){
    const shoulder=arms[s>0?1:0].shoulder;
    for(let i=0;i<3;i++){
      const y=-i*.089;
      const lobe=mirrored(s,[[.046,y+.091,-.17],[.158,y+.154,-.142],[.332,y+.066,-.054],
        [.314,y-.033,.131],[.159,y-.105,.203],[.035,y-.030,.172]]);
      relief(k,shoulder,i%2?'relicJade':'relicCinnabar','relicRoseGold',lobe,.057,mobile);
      rivet(k,shoulder,'relicRoseGold',s*.237,y+.035,.083,.026);
    }
    const armor=mirrored(s,[[.071,.125,.101],[.19,.158,.083],[.29,.12,-.009],[.316,-.043,-.043],
      [.218,-.212,.089],[.117,-.228,.137],[.037,-.082,.119]]);
    relief(k,harness,'relicCinnabar','relicRoseGold',armor,.056,mobile);
    for(let i=0;i<3;i++)braid(k,harness,i===1?'relicRoseGold':'relicJade',mirrored(s,[[.067,.099-i*.092,.144,.008],
      [.139,.114-i*.092,.146,.023],[.215,.072-i*.092,.12,.028],[.249,.003-i*.078,.062,.005]]),mobile);
    const elbow=arms[s>0?1:0].elbow;
    for(let i=0;i<3;i++)strap(k,elbow,i%2?'relicJade':'relicRoseGold',[s*.023,-.089-i*.087,.033+i*.012],
      .124-i*.012,.019+i*.001,mobile);
    const thigh=legs[s>0?1:0].thigh;
    const fin=mirrored(s,[[.061,.03,-.133],[.156,.016,-.098],[.221,-.076,-.135],
      [.208,-.208,-.192],[.108,-.28,-.159],[.032,-.13,-.129]]);
    relief(k,thigh,'relicJade','relicRoseGold',fin,.048,mobile,-1);
    const length=s===1?1.183:.844;
    garments.push({parent:mantle,name:'蓐收 · 斜掛幡 '+s,
      path:mirrored(s,[[.206,.056,-.007,.092],[.267,-.31,-.142,.131],[.431,-.578,-.358,.136],[.53,-length,-.501,.054]]),
      tint:s>0?0x774740:0x425150,trim:0xc19564,lining:0x372d3b,phase:s*.92,flex:1.23});
    garments.push({parent:body,name:'蓐收 · 朱袱腰帶 '+s,
      path:mirrored(s,[[.084,-.012,.268,.092],[.169,-.173,.337,.097],[.164,-.362,.346,.069],[.219,-.671,.376,.022]]),
      tint:0x753a3d,trim:0xbba178,lining:0x3d2c3a,phase:s*.53,flex:1.08});
  }
  const lock=new T.TorusGeometry(.085,.015,8,25);
  lock.translate(0,.018,-.171);k.geometry(rear,'relicRoseGold',lock);
  k.mesh(rear,'gem','glow',0,.018,-.184,.031,.052,.026);
  return ({wind,strike,beat})=>{rear.rotation.z=.19+Math.sin(beat*.7)*.031+wind*.063-strike*.092;};
}

export function relicTailoring(k,body,arms,legs,mantle,yaksha,mobile){
  const garments=[];
  const motion=(yaksha?festival:atelier)(k,body,arms,legs,mantle,mobile,garments);
  return {garments,motion};
}
