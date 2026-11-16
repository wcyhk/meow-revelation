import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

export const jadeDragonFinishes={
  jadeDragonScale:[0x497f78,.33,.52,'iron'],jadeDragonEdge:[0x9cb5a2,.24,.56,'stone'],
  jadeDragonIvory:[0xc6baa0,.19,.58,'bone'],jadeDragonGold:[0x9e7445,.67,.48,'bronze'],
};

const sides=[-1,1],TAU=Math.PI*2;
const mirror=(side,outline)=>outline.map(([x,...rest])=>[x*side,...rest]);

function dorsalMosaic(k,neck,spine,mobile){
  const quantity=mobile?15:22,meridians=mobile?8:11;
  const frames=spine.computeFrenetFrames(quantity,false);
  for(let row=0;row<quantity;row++){
    const u=(row+.4)/quantity;
    const node=spine.getPointAt(u),along=spine.getTangentAt(u);
    const normal=frames.normals[row],binormal=frames.binormals[row];
    for(let cell=0;cell<meridians;cell++){
      const theta=(cell+row*.43)*TAU/meridians;
      const radial=normal.clone().multiplyScalar(Math.cos(theta)).addScaledVector(binormal,Math.sin(theta));
      const toSide=radial.clone().cross(along).normalize();
      if(radial.z>.68)continue;
      const wide=(.064+(1-u)*.026)*(1+.16*Math.sin(row*1.14+cell*2.32));
      const long=(.078+(1-u)*.014)*(1+.15*Math.cos(cell*2.12+row*1.78));
      const r=.194+.064*(1-u);
      const tile=(x,y,z)=>node.clone().addScaledVector(toSide,x*wide)
        .addScaledVector(along,y*long).addScaledVector(radial,r+z).toArray();
      const leaf=[tile(-.75,-.63,.002),tile(.05,-1,.012),tile(.75,-.60,.002),tile(.96,.16,-.016),
        tile(.54,.66,-.022),tile(-.03,.79,-.037),tile(-.61,.58,-.019),tile(-.93,.13,-.013)];
      k.sculpt.plate(neck,(cell+row)%5===0?'jadeDragonEdge':'jadeDragonScale',leaf,.027,.010);
      if(cell%3===1)k.sculpt.sweep(neck,'rind',[
        [...tile(-.40,-.49,.023),.008],[...tile(-.04,-.12,.046),.012],[...tile(.11,.56,-.007),.003],
      ],{sides:5,steps:5,ridge:.19});
    }
  }
}

export function jadeDragonAtelier(k,{neck,head,jaw,spine},mobile){
  const {bone,sculpt,geometry,mesh}=k;
  const talons=[],horns=[];
  const cast=(joint,name,path,seed)=>geometry(joint,name,sculptVolume(path,{
    sides:mobile?9:14,rings:mobile?12:18,section:2.23,seed,ridge:.21,
  }));
  const seam=(joint,name,path)=>sculpt.sweep(joint,name,path,{sides:6,steps:11,ridge:.20});
  dorsalMosaic(k,neck,spine,mobile);
  const orb=bone(neck,.275,1.025,.66);
  orb.name='神獸青龍 · 潮珠';
  mesh(orb,'pearl','jadeDragonScale',0,0,0,.174,.173,.174);
  mesh(orb,'gem','glow',.021,.027,.12,.077,.093,.072,0,.26,.19);
  for(let i=0;i<3;i++){
    const band=bone(orb,0,0,0);
    band.rotation.set(.83*i,.40+i*.53,.70*i);
    mesh(band,'ring',i===1?'jadeDragonGold':'glow',0,0,0,.184+i*.020,.184+i*.020,.41);
  }
  for(const side of sides){
    const f=path=>mirror(side,path);
    cast(head,'jadeDragonIvory',f([[.058,-.097,.356,.026,.014],[.154,-.041,.276,.061,.037],
      [.225,.069,.189,.073,.055],[.269,.174,.093,.059,.041],[.285,.212,-.072,.035,.026],
      [.249,.275,-.192,.005,.004]]),2.28+side);
    cast(head,'jadeDragonGold',f([[.128,.100,-.010,.046,.043],[.236,.245,-.146,.071,.051],
      [.300,.400,-.233,.057,.038],[.363,.552,-.318,.033,.026],[.484,.632,-.361,.005,.005]]),4.19+side);
    for(let i=0;i<5;i++){
      const y=.12-i*.055,z=-.06-i*.054;
      const filament=bone(head,side*(.20+i*.012),y,z);
      filament.name='青龍 · 白鬣 '+(i+1);
      cast(filament,i%3===1?'jadeDragonEdge':'jadeDragonIvory',f([[.01,.053,.094,.055,.031],
        [.119,.106,.008,.062,.039],[.221,.101,-.136,.051,.034],[.310,.049,-.247,.027,.019],
        [.347,-.071,-.385,.006,.005]]),i*.86+side);
      horns.push({filament,side,i});
    }
    const base=bone(neck,side*.173+.36,1.222,.36);
    base.name='青龍 · 前爪';
    const elbow=bone(base,side*.169,-.242,.145),hand=bone(elbow,side*.014,-.164,.184);
    cast(base,'rind',f([[.024,.062,.009,.098,.089],[.103,-.046,.021,.134,.116],[.182,-.174,.100,.104,.099],
      [.167,-.259,.158,.074,.058]]),6.43+side);
    cast(elbow,'jadeDragonScale',f([[.006,.045,.005,.080,.067],[.039,-.047,.070,.093,.071],
      [.041,-.132,.134,.086,.058],[.012,-.201,.177,.061,.052]]),3.9+side);
    cast(hand,'jadeDragonEdge',f([[.002,.041,.011,.073,.064],[.025,-.005,.054,.104,.078],
      [.020,-.045,.103,.082,.071],[.004,-.072,.143,.053,.037]]),3.2+side);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.047,z=.101+i*.011;
      cast(hand,i===0?'jadeDragonGold':'jadeDragonIvory',[[x,-.06,z,.028,.027],[x*.94,-.095,z+.056,.036,.035],
        [x*.72,-.097,z+.103,.028,.021],[x*.50,-.063,z+.147,.004,.004]],i*1.16+side);
    }
    seam(jaw,'jadeDragonIvory',f([[.108,-.072,.17,.018],[.157,-.088,.295,.036],[.123,-.097,.423,.023],
      [.067,-.119,.505,.004]]));
    talons.push({base,elbow,hand,side});
  }
  return function animate({headtime,beat,wind,strike,stage,travel}){
    orb.position.y=1.026+Math.sin(beat*.51)*.049+wind*.118-strike*.092;
    orb.rotation.set(headtime*.36,headtime*.78+strike*.49,Math.sin(beat*.52)*.41);
    for(const {base,elbow,hand,side} of talons){
      base.rotation.x=Math.sin(beat*.7+side)*.085+wind*.42-strike*.59+travel*.10;
      base.rotation.z=side*(.18+wind*.19-strike*.32+stage*.05);
      elbow.rotation.x=-.19+wind*.36-strike*.31;
      hand.rotation.y=side*(.19+wind*.45-strike*.46);
    }
    for(const {filament,side,i} of horns){
      const lag=beat*.56-i*.77;
      filament.rotation.x=Math.sin(lag)*.092+travel*.142-wind*.21+strike*.24;
      filament.rotation.y=side*(Math.cos(lag*.81)*.083+wind*.18-strike*.16);
    }
  };
}
