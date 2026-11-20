import {monsterCatalogue} from './monster-catalogue.mjs?v=boss-foundry-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const realBeasts={qiongqi:'m148',taotie:'m144',taowu:'m149',hundun:'m145'};
const skins=Object.fromEntries(Object.entries(realBeasts).map(([weapon,id])=>
  [weapon,monsterCatalogue.find(item=>item.id===id)]));
const sides=[-1,1],tau=Math.PI*2;
const weld=(k,j,m,curve,rings=12)=>k.sculpt.sweep(j,m,curve,{steps:rings,sides:7,ridge:.21});
const plate=(k,j,m,p,depth)=>k.sculpt.plate(j,m,p,depth,.018);
const cast=(k,j,m,path,mobile,seed)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?9:14,rings:mobile?12:18,section:2.41,ridge:.19,seed
}));
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);

export function relicBeastSource(weapon){
  return skins[weapon?.id]??null;
}

function backShard(k,body,[x,y,z],side,length,launch,mobile){
  const mount=k.bone(body,x,y,z);
  mount.name='織風追契者 · 逆鳴翼楔';
  const path=mirror(side,[[0,.012,.061,.043,.050],[.125,length*.28,-.101,.094,.048],
    [.264,length*.71,-.217,.072,.045],[.374,length*.94,-.39,.031,.020],
    [.402,length,-.492,.004,.005]]);
  cast(k,mount,'edge',path,mobile,length);
  weld(k,mount,'glow',path.map(([x,y,z,r])=>[x,y+.038,z+.026,r*.28]));
  launch.push({joint:mount,side,axis:'z',phase:length*1.72});
}

function reversedQuills(k,parts,mobile,launch){
  for(const side of sides){
    for(let i=0;i<4;i++){
      const x=side*(.094+i*.105),z=-.115+i*.11,y=.30+i*.045;
      backShard(k,parts.body,[x,y,z],side,.34+i*.082,launch,mobile);
    }
    const grip=k.bone(parts.body,side*.304,.092,-.099);
    const feather=mirror(side,[[.027,.041,.084],[.078,.12,.006],[.171,.134,-.125],
      [.173,-.065,-.291],[.099,-.139,-.211],[.036,-.053,-.093]]);
    plate(k,grip,'trim',feather,.034);
    weld(k,grip,'glow',feather.slice(1,5).map(([x,y,z],i)=>[x,y+.02,z+.011,[.008,.015,.008,.004][i]]));
  }
}

function sealWhiskers(k,parts,mobile,launch){
  const collar=k.bone(parts.body,0,.24,.16);
  collar.name='霜函追契者 · 縛角封環';
  collar.rotation.x=-.465;
  for(const side of sides){
    const bridge=mirror(side,[[.063,-.214,.11,.040],[.31,-.150,.12,.066],[.38,.034,.067,.079],
      [.302,.223,-.117,.073],[.121,.318,-.253,.060],[.023,.279,-.286,.034]]);
    cast(k,collar,'trim',bridge.map(([x,y,z,r])=>[x,y,z,r,r*.61]),mobile,side*8.1);
    weld(k,collar,'glow',bridge.map(([x,y,z,r])=>[x,y+.016,z+.044,r*.21]));
    const clasp=k.bone(collar,side*.302,.049,.084);
    clasp.rotation.y=side*1.16;
    k.mesh(clasp,'gem','edge',0,0,.026,.061,.108,.054);
    const fetter=k.bone(parts.head,side*.191,-.054,.028);
    const blade=mirror(side,[[.026,.046,.074,.037,.043],[.120,.056,.182,.069,.049],
      [.142,-.036,.318,.066,.033],[.077,-.136,.428,.026,.021],[.041,-.151,.473,.004,.005]]);
    cast(k,fetter,'edge',blade,mobile,side*.91);
    weld(k,fetter,'trim',blade.map(([x,y,z,r])=>[x,y+.024,z+.029,r*.35]));
    launch.push({joint:fetter,side,axis:'y',phase:1.71+side*.4});
  }
}

function furnaceJaws(k,parts,mobile,launch){
  for(const side of sides){
    const fitting=k.bone(parts.head,side*.228,-.061,.078);
    fitting.name='紅線追契者 · 鍛爐頰甲';
    const frame=mirror(side,[[.025,.111,.05],[.164,.105,.093],[.239,.015,.188],
      [.181,-.165,.235],[.086,-.187,.223],[.03,-.094,.164]]);
    plate(k,fitting,'trim',frame,.054);
    for(let i=0;i<4;i++){
      const t=i*.044;
      weld(k,fitting,i%2?'edge':'glow',mirror(side,[[.083,.073-t,.103+t*.48,.015],[.166,.054-t,.145+t*.55,.021],
        [.197,.021-t,.191+t*.51,.017],[.186,-.051-t,.222+t*.48,.005]]));
    }
    const horn=mirror(side,[[.061,-.083,.166,.040,.030],[.164,-.108,.233,.064,.045],
      [.187,-.025,.382,.055,.034],[.139,.071,.478,.031,.023],[.113,.158,.514,.005,.006]]);
    cast(k,fitting,'edge',horn,mobile,side*9);
    weld(k,fitting,'glow',horn.map(([x,y,z,r])=>[x,y-.025,z+.016,r*.43]));
    launch.push({joint:fitting,side,axis:'z',phase:side*.7});
    const shell=k.bone(parts.body,side*.36,.285,-.233);
    const vent=mirror(side,[[.020,.021,-.071,.071,.081],[.144,.197,-.153,.113,.068],
      [.233,.335,-.288,.091,.064],[.279,.361,-.403,.034,.023],[.312,.37,-.443,.008,.008]]);
    cast(k,shell,'body',vent,mobile,side*.88);
    for(let i=0;i<3;i++){
      const p=vent[i+1];
      k.mesh(shell,'ring','trim',p[0],p[1],p[2],p[3]*.91,p[3]*.83,.71,Math.PI*.23,side*.44);
    }
    k.mesh(shell,'gem','glow',side*.301,.369,-.431,.051,.063,.046);
  }
}

function hollowFace(k,parts,mobile,launch){
  const mask=k.bone(parts.head,0,.044,.298);
  mask.name='夜紗追契者 · 無孔面殼';
  cast(k,mask,'deep',[[0,-.193,.091,.097,.062],[0,-.087,.162,.197,.099],
    [0,.057,.17,.235,.104],[0,.181,.102,.207,.087],[.032,.244,.024,.081,.054]],mobile,7.35);
  const eye=k.bone(mask,0,-.027,.247);
  k.mesh(eye,'ring','glow',0,0,.016,.094,.132,.49);
  k.mesh(eye,'gem','deep',0,0,-.007,.079,.1,.048);
  launch.push({joint:eye,side:1,axis:'y',phase:2.1});
  for(const side of sides){
    const path=mirror(side,[[.015,.196,.102,.015],[.161,.194,.132,.049],[.233,.095,.129,.061],
      [.241,-.073,.109,.050],[.124,-.219,.087,.019],[.037,-.224,.112,.004]]);
    weld(k,mask,'trim',path,16);
    const bar=k.bone(parts.body,side*.28,.109,-.087);
    for(let i=0;i<4;i++){
      const y=.28-i*.117;
      const body=mirror(side,[[.081,y+.071,.109],[.196,y+.106,.008],[.325,y+.046,-.166],
        [.306,y-.072,-.264],[.162,y-.12,-.186],[.083,y-.077,-.024]]);
      plate(k,bar,i%2?'body':'edge',body,.046);
      weld(k,bar,'trim',body.slice(1,6).map(([x,h,z],i)=>[x,h+.013,z-.028,[.012,.022,.017,.012,.003][i]]));
    }
    launch.push({joint:bar,side,axis:'y',phase:.61*side});
  }
}

const variants={
  qiongqi:{form:reversedQuills,shape:'bolts'},taowu:{form:sealWhiskers,shape:'ribbons'},
  taotie:{form:furnaceJaws,shape:'embers'},hundun:{form:hollowFace,shape:'sigils'},
};

export function sculptBeastRelic(k,parts,weapon,mobile){
  const {form,shape}=variants[weapon.id],joints=[];
  form(k,parts,mobile,joints);
  const base=parts.cataloguePose;
  parts.polishEnergy={tint:weapon.tone,shape,anchor:parts.body,offset:[0,.38,-.11],span:[.88,.68,1.02]};
  parts.cataloguePose=pose=>{
    base?.(pose);
    for(const {joint,side,axis,phase} of joints){
      const sway=Math.sin(pose.beat*.74+phase)*(.12+pose.travel*.08);
      joint.rotation[axis]=side*(sway+pose.wind*.11-pose.strike*.64+pose.stage*.20);
    }
  };
}
