import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const mirror=(side,p)=>p.map(([x,...rest])=>[side*x,...rest]);
const spine=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:14,sides:mobile?6:9,ridge:.20});
const carve=(k,j,m,p,mobile,seed=0,section=2.51)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?12:19,sides:mobile?10:16,section,ridge:.19,seed,
}));

export const whiteTortoiseFinishes={
  tortoiseCoal:[0x383b3a,.14,.68,'hide'],tortoisePlate:[0x666b6b,.22,.55,'iron'],
  tortoiseChalk:[0xb6b6a6,.13,.64,'bone'],tortoiseHide:[0xb3a38b,.047,.76,'hide'],
  tortoisePatches:[0x995f4c,.075,.73,'hide'],tortoiseClaw:[0xded7a2,.18,.56,'bone'],
  tortoiseMace:[0x666d63,.38,.63,'iron'],tortoiseEye:[0xa1cfa5,.088,.48,'gem'],
};

function shellKnob(k,body,azimuth,row,mobile){
  const edge=row===0,radius=edge?.73:row===1?.49:row===2?.23:0;
  const point=[Math.sin(azimuth)*radius,edge?.095:row===1?.382:row===2?.530:.581,Math.cos(azimuth)*radius*1.19-.075];
  const cell=k.bone(body,...point),normal=new T.Vector3(point[0],edge?.63:.99,point[2]-.015).normalize();
  cell.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);
  const width=edge?.205:row===1?.202:.174,peak=edge?.145:row===1?.260:.278;
  carve(k,cell,'tortoiseCoal',[[0,-.077,0,width*.97,width],[0,-.021,0,width*1.06,width],
    [0,.036,0,width*.87,width*.84],[0,.101,0,width*.45,width*.53]],mobile,row+azimuth,3.8);
  carve(k,cell,'tortoisePlate',[[0,.018,0,width*.84,width*.82],[.008,.082,-.004,width*.73,width*.70],
    [.001,.135,-.012,width*.53,width*.47],[.015,.151,-.009,width*.17,width*.20]],mobile,azimuth,3.45);
  for(let i=0;i<6;i++){
    const a=i*tau/6+.15*Math.cos(azimuth),x=Math.sin(a),z=Math.cos(a);
    spine(k,cell,i%3?'tortoisePlate':'tortoiseChalk',[[x*width*.92,.028,z*width*.87,.013],
      [x*width*.76,.065,z*width*.73,.016],[x*width*.50,.109,z*width*.43,.012],
      [x*width*.30,.133,z*width*.24,.003]],mobile);
  }
  spine(k,cell,'tortoiseChalk',[[.003,.096,-.011,width*.41],[.012,.159,-.028,width*.33],
    [.019,peak-.013,-.041,width*.14],[.032,peak+.039,-.063,.005]],mobile);
}

function carapace(k,body,mobile){
  carve(k,body,'tortoiseCoal',[[0,-.383,-.103,.502,.589],[0,-.237,-.075,.699,.839],[0,.02,-.075,.753,.866],
    [0,.233,-.075,.674,.799],[0,.405,-.075,.489,.574],[0,.523,-.11,.207,.255],[0,.552,-.125,.052,.065]],mobile,11,2.62);
  for(const [row,count] of [[0,12],[1,9],[2,5]])for(let i=0;i<count;i++)shellKnob(k,body,(i+row*.43)*tau/count,row,mobile);
  shellKnob(k,body,0,3,mobile);
  for(const s of sides)for(let i=0;i<8;i++){
    const theta=(i+.5)*Math.PI/8,z=Math.cos(theta)*.78-.075,x=Math.sin(theta)*.671;
    k.sculpt.plate(body,i%2?'tortoisePlate':'tortoiseChalk',mirror(s,[[x,-.202,z+.068],[x+.019,-.112,z+.086],
      [x+.023,-.061,z-.075],[x-.023,-.175,z-.102],[x-.042,-.252,z-.044]]),.032,.009);
  }
}

function skull(k,body,mobile){
  const neck=k.bone(body,0,-.183,.618),head=k.bone(neck,0,.304,.354),jaw=k.bone(head,0,-.112,.016);
  carve(k,neck,'tortoiseHide',[[0,-.063,-.123,.184,.153],[0,.043,.045,.184,.149],[0,.156,.237,.146,.128],
    [0,.295,.390,.135,.107]],mobile,23);
  carve(k,head,'tortoiseCoal',[[0,.039,-.164,.138,.107],[0,.084,-.083,.195,.141],[0,.049,.068,.206,.149],
    [0,.013,.203,.150,.103],[0,-.022,.331,.108,.071],[0,-.049,.376,.058,.038]],mobile,7);
  carve(k,jaw,'tortoiseHide',[[0,-.072,-.046,.115,.085],[0,-.057,.104,.171,.101],[0,-.033,.222,.112,.069],
    [0,-.010,.333,.071,.045]],mobile,16);
  spine(k,head,'tortoiseClaw',[[0,.075,.131,.077],[0,.053,.248,.097],[0,-.013,.367,.056],[0,-.124,.395,.007]],mobile);
  for(const s of sides){
    const t=p=>mirror(s,p);
    k.sculpt.plate(head,'tortoiseChalk',t([[.044,.117,.235],[.126,.154,.137],[.185,.129,.019],[.227,.116,-.092],
      [.216,.065,-.146],[.159,.073,-.015],[.102,.067,.159]]),.041,.014);
    k.sculpt.plate(head,'tortoisePatches',t([[.073,-.028,.284],[.121,.016,.222],[.18,.038,.153],[.214,.013,.043],
      [.203,-.094,.038],[.141,-.076,.208]]),.032,.010);
    k.mesh(head,'gem','tortoiseEye',s*.158,.083,.168,.042,.024,.025,0,s*.41);
    spine(k,head,'tortoiseChalk',t([[.145,.129,-.023,.041],[.186,.223,-.084,.040],
      [.193,.269,-.173,.025],[.231,.270,-.226,.004]]),mobile);
    for(let i=0;i<4;i++){
      const r=.048+i*.044;
      spine(k,neck,i%2?'tortoisePatches':'tortoiseChalk',t([[.155,.022+i*.072,.015+r,.045],
        [.158,.061+i*.077,.037+r,.046],[.097,.081+i*.067,.061+r,.012]]),mobile);
      spine(k,jaw,'tortoiseClaw',t([[.11+i*.013,-.018,.236-i*.043,.019],[.124+i*.012,.041,.241-i*.043,.003]]),mobile);
    }
  }
  return {neck,head,jaw};
}

function feet(k,body,mobile){
  const joints=[];
  for(const s of sides)for(const front of [false,true]){
    const t=p=>mirror(s,p),hip=k.bone(body,s*.431,-.274,front?.437:-.513);
    const knee=k.bone(hip,s*.134,-.296,front?.069:-.020);
    const paw=k.bone(knee,s*.031,-.197,.066),toes=[];
    carve(k,hip,'tortoiseHide',t([[.003,.075,-.042,.153,.133],[.059,-.043,.005,.190,.148],
      [.127,-.175,.043,.166,.143],[.144,-.318,.069,.108,.111]]),mobile,31);
    carve(k,knee,'tortoiseHide',t([[0,.069,-.018,.122,.117],[.012,-.064,.022,.135,.128],
      [.033,-.212,.071,.107,.118]]),mobile,54);
    carve(k,paw,'tortoiseChalk',t([[0,-.026,-.084,.105,.074],[.005,-.041,.032,.127,.078],
      [.021,-.065,.125,.110,.047]]),mobile,79,2.63);
    for(let i=0;i<5;i++)spine(k,hip,i%2?'tortoisePatches':'tortoiseChalk',t([[.013,-i*.056,.118,.022],
      [.110,-.021-i*.054,.145,.028],[.223,-.076-i*.050,.110,.020],[.265,-.098-i*.046,.034,.004]]),mobile);
    for(let i=-1;i<=1;i++){
      const toe=k.bone(paw,i*.073,-.059,.088); toes.push(toe);
      spine(k,toe,'tortoiseClaw',[[0,0,0,.037],[i*.013,-.019,.115,.034],[i*.022,-.057,.179,.005]],mobile);
    }
    joints.push({hip,knee,paw,toes,s,front});
  }
  return joints;
}

function mace(k,body,mobile){
  const positions=[[0,-.229,-.730],[.025,-.135,-.974],[.069,.084,-1.198],[.10,.368,-1.363],
    [.139,.685,-1.398],[.113,.953,-1.290],[.082,1.143,-1.118],[.066,1.313,-1.044]];
  const curve=new T.CatmullRomCurve3(positions.map(p=>new T.Vector3(...p)),false,'catmullrom',.43);
  const links=[],last=positions.length-1;
  for(let i=0;i<=last;i++){
    const link=new T.Bone();
    (links.at(-1)??body).add(link);
    link.position.copy(curve.getPointAt(i/last));
    if(i)link.position.sub(curve.getPointAt((i-1)/last));
    links.push(link);
  }
  const wrap=sculptVolume(positions.map(([x,y,z],i)=>[x,y,z,.127-i*.009,.114-i*.008]),{
    rings:mobile?40:66,sides:mobile?10:16,section:2.29,ridge:.24,seed:22,
  });
  const {uv,color}=wrap.attributes,index=[],weight=[];
  for(let v=0;v<uv.count;v++){
    const u=uv.getX(v),t=uv.getY(v),station=t*last,lo=Math.min(last-1,Math.floor(station)),mix=station-lo;
    const highlight=color.getX(v),coat=Math.max(0,Math.cos(u*tau+.74))**4;
    const mottling=.88+.14*Math.sin(t*57+u*3.1);
    color.setXYZ(v,highlight*mottling,highlight*mottling*(1-coat*.32),highlight*(1-coat*.43));
    index.push(lo,lo+1,0,0); weight.push(1-mix,mix,0,0);
  }
  wrap.setAttribute('skinIndex',new T.Uint16BufferAttribute(index,4));
  wrap.setAttribute('skinWeight',new T.Float32BufferAttribute(weight,4));
  const skin=new T.SkinnedMesh(wrap,k.materials.tortoiseHide);
  skin.name='狂魔邪武 · 尾鞭';
  skin.frustumCulled=false;
  body.add(skin);
  body.updateWorldMatrix(true,true);
  skin.bind(new T.Skeleton(links));
  const tip=links.at(-1);
  carve(k,tip,'tortoiseMace',[[0,-.119,0,.043,.052],[0,-.090,0,.124,.126],[0,.020,0,.155,.148],
    [0,.121,0,.102,.105],[0,.163,0,.032,.047]],mobile,21,3.14);
  for(let i=0;i<7;i++){
    const a=i*tau/7,x=Math.cos(a),z=Math.sin(a);
    spine(k,tip,i%2?'tortoiseMace':'tortoiseChalk',[[x*.103,.019,z*.095,.070],[x*.183,.052,z*.178,.042],
      [x*.290,.095+(i%2)*.028,z*.297,.004]],mobile);
  }
  spine(k,tip,'tortoiseChalk',[[0,.079,0,.057],[.026,.205,-.028,.033],[.048,.280,-.055,.003]],mobile);
  return {links:links.slice(0,-1),tip,skin};
}

export function forgeWhiteTortoise(k,entry,mobile){
  const body=k.bone(k.root,0,.881,0);
  carapace(k,body,mobile);
  const {neck,head,jaw}=skull(k,body,mobile),legs=feet(k,body,mobile),tail=mace(k,body,mobile);
  tail.tip.name='狂魔邪武 · 尾錘';
  return {body,head,inspectionHead:head,crest:k.bone(body,0,0,0),grounded:true,sourceSculpt:true,
    catalogueSculpt:entry.id,pattern:'crawl',tortoiseMace:tail.tip,tortoiseLinks:tail.links,tortoisePaws:legs,tortoiseJaw:jaw,
    disposeRig(){tail.skin.skeleton.dispose();},
    polishEnergy:{tint:0x9edbef,shape:'mist',anchor:body,offset:[0,-.29,.00],span:[.96,.26,1.04]},
    cataloguePose({headtime,step,wind,strike,travel,stage,attackPattern}){
      body.rotation.x=-wind*.113+strike*.12;
      neck.rotation.x=-(wind*.23)+strike*.28;
      head.rotation.x=wind*.092-strike*.23;
      jaw.rotation.x=.046+wind*.30+strike*.46;
      const sweep=attackPattern==='sweep'?1:0;
      for(const [i,link] of tail.links.entries()){
        link.rotation.y=Math.sin(headtime*2.54-i*.68)*(.016+travel*.04)+sweep*(wind*.089-strike*.13);
        link.rotation.x=-wind*(.036+i*.006)+strike*(.047+i*.01)+stage*.016;
        link.rotation.z=Math.sin(headtime*2.78-i*.24)*.018+sweep*(wind*.050-strike*.077);
      }
      tail.tip.rotation.y=Math.sin(headtime*2.22)*.13+strike*.23;
      for(const {hip,knee,paw,toes,s,front} of legs){
        const cycle=Math.sin(step+s*1.53+(front?0:2.73));
        hip.rotation.x=cycle*travel*.47-wind*.11+strike*.15;
        hip.rotation.z=s*(.034+wind*.099-strike*.052);
        knee.rotation.x=-Math.max(0,cycle)*travel*.34-wind*.20+strike*.19;
        paw.rotation.x=-knee.rotation.x*.41;
        for(const [i,toe] of toes.entries())toe.rotation.x=wind*.086-strike*(.105+i*.027);
      }
    },
  };
}
