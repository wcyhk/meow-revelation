import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,path)=>path.map(([x,y,z,...extra])=>[side*x,y,z,...extra]);
const shaft=(k,parent,finish,path,rings=11)=>k.sculpt.sweep(parent,finish,path,{steps:rings,sides:6,ridge:.24});
const field=(k,parent,finish,path,options={})=>k.geometry(parent,finish,sculptVolume(path,{sides:12,rings:16,section:2.43,ridge:.24,fur:true,...options}));

export const vermilionFinishes={
  hide:[0x682a2c,.16,.66,'hide'],rind:[0x33263f,.23,.58,'hide'],edge:[0xe2bc8a,.21,.46,'bone'],
  scarletRachis:[0xd68b43,.34,.43,'bone'],scarletFlame:[0xdb7538,.19,.51,'hide'],
  scarletRust:[0x9e442e,.18,.63,'hide'],scarletChest:[0xb56a37,.18,.60,'hide'],
  scarletPale:[0xeec695,.19,.50,'hide'],scarletViolet:[0x534280,.22,.54,'hide'],
  scarletIndigo:[0x34365a,.25,.55,'hide'],scarletVioletTip:[0x8e74ba,.28,.46,'hide'],
};

function engravedVane(k,parent,finish,positions,width,seed,sections,cool=false){
  const geometry=featherVane(...positions,width,seed,sections);
  const {position,uv,color}=geometry.attributes;
  const axis=new T.CatmullRomCurve3(positions.map(point=>new T.Vector3(...point)));
  const centers=Array.from({length:sections+1},(_,i)=>axis.getPoint(i/sections));
  const p=new T.Vector3();
  for(let i=0;i<uv.count;i++){
    const t=uv.getY(i),side=uv.getX(i)*2-1,edge=Math.abs(side),n=Math.sin(t*sections*Math.PI+seed*1.04+side*.8);
    const sheath=Math.sin(t*Math.PI)**.67,section=centers[Math.round(t*sections)];
    p.fromBufferAttribute(position,i).sub(section).multiplyScalar(1-Math.max(0,n)*edge**3*.25*sheath).add(section);
    p.z+=Math.cos(t*sections*2.33+edge*4.41+seed)*.010*sheath*Math.sin(Math.PI*edge);
    position.setXYZ(i,p.x,p.y,p.z);
    const layers=.09*Math.cos(t*sections*2.34+edge*4.41+seed)*edge;
    const base=color.getX(i),tip=Math.max(0,t-.36)**1.2,root=.25*Math.sin(Math.PI*t)*(.41+edge);
    if(cool)color.setXYZ(i,base*(.83+tip*.64+layers),base*(.79+tip*.53+layers),base*(1.03+tip*.71+layers));
    else color.setXYZ(i,base*(.83+root+tip*.56+layers),base*(.53+root+tip*1.22+layers),base*(.45+root*.85+tip*.97+layers));
  }
  geometry.computeVertexNormals();
  k.geometry(parent,finish,geometry);
}

function shapeSkull(k,head,mobile){
  field(k,head,'scarletRust',[[0,-.086,-.14,.091,.085],[0,.011,-.079,.111,.103],
    [0,.072,.030,.111,.100],[0,.037,.107,.088,.064],[0,-.012,.168,.045,.046]],{rings:mobile?14:19,sides:mobile?12:16});
  field(k,head,'scarletRachis',[[0,.022,.106,.069,.057],[0,.001,.205,.057,.045],
    [0,-.064,.276,.032,.034],[0,-.128,.298,.005,.006]],{rings:15,sides:11,section:2.73});
  const jaw=k.bone(head,0,-.051,.103);
  jaw.name='朱雀 · 鉤喙';
  field(k,jaw,'rind',[[0,-.008,-.026,.046,.039],[0,-.025,.071,.046,.032],
    [0,-.040,.157,.033,.020],[0,-.077,.183,.004,.005]],{rings:11,sides:9});
  const crown=k.bone(head,0,.068,-.034);
  crown.name='朱雀 · 紫電羽冠';
  for(const side of sides){
    const p=path=>reflect(side,path);
    shaft(k,head,'scarletPale',p([[.023,.032,.148,.012],[.058,.071,.128,.021],[.101,.087,.038,.017],
      [.115,.043,-.071,.009],[.111,.018,-.140,.002]]));
    k.mesh(head,'gem','glow',side*.087,.042,.110,.016,.009,.018,0,side*.79,-side*.12);
    for(let i=0;i<4;i++){
      const t=i/3,x=.028+t*.043;
      engravedVane(k,crown,i%2?'scarletVioletTip':'scarletViolet',p([[x,-.02,-t*.020],
        [x+.042,.147-t*.059,-.073-t*.045],[x+.09,.336-t*.095,-.22-t*.092]]),.050-t*.014,i+55,mobile?8:12,true);
    }
    for(let i=0;i<3;i++){
      const t=i/2,front=.116-t*.073;
      engravedVane(k,head,i%2?'scarletChest':'scarletPale',p([[.073+t*.030,.035-t*.025,front],
        [.111+t*.031,-.003-t*.051,front-.107],[.133+t*.066,-.044-t*.089,front-.257]]),.057-t*.010,21+i,8);
    }
  }
  return {jaw,crown};
}

function shapeWing(k,body,side,mobile){
  const p=path=>reflect(side,path),x=v=>v*side;
  const wing=k.bone(body,x(.177),.258,.110),arm=k.bone(wing,x(.554),.160,-.027),hand=k.bone(arm,x(.562),.181,-.089);
  wing.name='朱雀 · 翼肩';arm.name='朱雀 · 翼肘';hand.name='朱雀 · 火翎掌';
  field(k,wing,'scarletRust',p([[-.082,.026,.032,.121,.099],[.141,.066,.023,.147,.111],
    [.377,.145,.010,.145,.112],[.566,.169,-.023,.083,.081]]));
  field(k,arm,'scarletRust',p([[0,0,.004,.093,.075],[.261,.108,-.002,.113,.071],
    [.457,.179,-.049,.083,.064],[.586,.180,-.083,.047,.051]]));
  shaft(k,hand,'scarletRachis',p([[0,.025,.017,.053],[.203,.094,-.044,.049],
    [.438,.159,-.092,.039],[.625,.218,-.143,.005]]),15);
  for(const [i,[part,count,start,length]] of [[wing,mobile?5:7,.085,.598],[arm,mobile?6:8,.046,.756],[hand,mobile?7:10,.016,1.068]].entries()){
    for(let j=0;j<count;j++){
      const t=j/(count-1),base=start+t*(i===0?.444:i===1?.473:.41),reach=length*(.65+.42*t),y=t*.161;
      const pts=p([[base,y*.80,.019-t*.084],[base+reach*.40,y-.053+.25*t,-.236-reach*.22],
        [base+reach*(.59+.14*t),y-.223+t*.55+i*.025,-.374-reach*.48]]);
      engravedVane(k,part,j%4===0?'scarletPale':j%3?'scarletFlame':'scarletRust',pts,
        .127-.028*t+i*.007,j+i*34,mobile?11:15);
      if(j%2===0)shaft(k,part,'scarletRachis',pts.map(([x,y,z],idx)=>[x,y+.020,z+.019,[.015,.014,.002][idx]]),10);
    }
    for(let j=0;j<(mobile?4:6);j++){
      const t=j/(mobile?3:5),base=start+t*.40,y=t*.174;
      engravedVane(k,part,j%3===0?'scarletPale':'scarletChest',p([[base,y+.043,.045],
        [base+.188,y+.103,-.106],[base+.303,y-.055,-.317]]),.078+t*.013,12+j+i*35,mobile?8:12);
    }
  }
  return {wing,arm,hand,side};
}

function tailFork(k,body,side,mobile){
  const x=v=>v*side,p=path=>reflect(side,path),root=k.bone(body,x(.122),.139,-.443),fan=k.bone(root,x(.221),.099,-.449);
  fan.name='朱雀 · 藍紫分尾';
  for(let i=0;i<(mobile?4:6);i++){
    const t=i/(mobile?3:5),x=.119+t*.285;
    engravedVane(k,root,i%2?'scarletIndigo':'scarletViolet',p([[.026+t*.068,.017+t*.062,.085],
      [x*.55,.137+t*.005,-.349],[x,.258-t*.292,-.825-t*.114]]),.087-t*.019,97+i,mobile?11:15,true);
    engravedVane(k,fan,i%2?'scarletVioletTip':'scarletViolet',p([[.011+t*.072,.019-t*.033,.002],
      [x*.68,.209-t*.085,-.523],[x+.207,.389-t*.333,-.991+t*.145]]),.094-t*.020,110+i,mobile?12:17,true);
  }
  return {root,fan,side};
}

export function carveVermilionBird(k,entry,mobile){
  const body=k.bone(k.root,0,.92,-.097),neck=k.bone(body,0,.344,.463),head=k.bone(neck,0,.347,.309);
  field(k,body,'hide',[[0,.075,-.590,.171,.135],[0,.135,-.336,.244,.192],[0,.170,-.008,.284,.250],
    [0,.248,.272,.242,.212],[0,.359,.485,.146,.143],[0,.431,.574,.115,.108]],{rings:21,sides:mobile?15:19});
  field(k,neck,'scarletRust',[[0,-.036,-.064,.151,.126],[0,.111,.036,.139,.105],
    [0,.222,.185,.109,.084],[0,.355,.303,.088,.082]],{rings:18,sides:mobile?13:15});
  const controls=shapeSkull(k,head,mobile);
  for(const side of sides){
    const p=path=>reflect(side,path),x=v=>v*side;
    for(let i=0;i<7;i++){
      const t=i/6,z=.516-t*.785,y=.226-t*.240;
      engravedVane(k,body,i%3===0?'scarletPale':'scarletChest',p([[.024+t*.014,y+.103,z+.008],
        [.141+t*.077,y+.015,z+.027],[.210+t*.077,y-.038,z-.239]]),.095-t*.014,41+i,mobile?8:11);
      engravedVane(k,body,i%3?'scarletRust':'scarletRachis',p([[.041+t*.029,y+.366,z+.092],
        [.132+t*.076,y+.294,z-.075],[.164+t*.087,y+.173,z-.253]]),.095-t*.017,137+i,mobile?8:11);
    }
    for(let i=0;i<4;i++){
      const t=i/3,y=.10+t*.263;
      engravedVane(k,neck,i%2?'scarletFlame':'scarletPale',p([[.024,y+.018,.156+t*.137],
        [.114,y-.054,.135+t*.149],[.139,y-.156,.079+t*.139]]),.062-t*.010,88+i,8);
    }
    const limb=k.bone(body,x(.145),-.021,.082);
    shaft(k,limb,'scarletRachis',p([[0,.02,-.052,.049],[.031,-.088,-.082,.046],
      [.049,-.233,-.050,.039],[.074,-.308,.039,.027]]),14);
    for(let i=0;i<4;i++){
      const t=(i-1.5)*.043;
      shaft(k,limb,'scarletPale',p([[.072+t*.35,-.293,.015,.026],[.078+t,-.358,.092+t*.21,.025],
        [.086+t*1.46,-.389,.177+t*.55,.019],[.078+t*1.49,-.411,.214+t*.51,.003]]),12);
    }
  }
  const wings=sides.map(side=>shapeWing(k,body,side,mobile)),tails=sides.map(side=>tailFork(k,body,side,mobile));
  const glow=k.materials.scarletPale;
  glow.emissive.setHex(0xc18248);
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,sourceSculpt:true,pattern:'wing',
    sourceDress(tools){
      for(const {fan,side} of tails)for(let i=0;i<3;i++){
        tools.silk(fan,entry.name+' · 藍焰尾翎',reflect(side,[[.072+i*.051,.026,-.005,.037],
          [.178+i*.077,.109,-.391,.051],[.314+i*.083,.151-i*.035,-.695,.040],
          [.447+i*.071,.223-i*.125,-1.001+i*.085,.004]]),
        {tint:i===1?0x354868:0x554b80,trim:i===1?0x9d9de7:0xb6a5df,style:'mane',phase:side*.62+i*.51,flex:1.02,across:[.91,.30,.16]});
      }
      return true;
    },
    polishEnergy:{tint:0xf4b270,shape:'embers',anchor:body,offset:[0,.23,.17],span:[1.62,.65,.99]},
    cataloguePose({beat,wind,strike,travel,headtime,stage,fall}){
      const cycle=headtime*(5.1+stage*.59),lift=Math.sin(cycle);
      body.rotation.x=.091-wind*.18+strike*.25+Math.sin(beat*.63)*.078;
      neck.rotation.x=-wind*.31+strike*.48+Math.sin(cycle*.72)*.065;
      head.rotation.x=.09+wind*.17-strike*.23;
      controls.crown.rotation.x=lift*.096-wind*.12+strike*.24;
      controls.jaw.rotation.x=.028+wind*.168+strike*.50;
      glow.emissiveIntensity=.24+wind*.21+strike*.46+stage*.11;
      for(const {wing,arm,hand,side} of wings){
        wing.rotation.z=side*(.33+lift*(.45+travel*.16)+wind*.47-strike*.62-fall*.56);
        wing.rotation.x=.16*Math.cos(cycle)+wind*.13-strike*.32;
        arm.rotation.z=side*(Math.sin(cycle-.57)*.29+wind*.18-strike*.25-fall*.20);
        arm.rotation.y=side*(.089+wind*.34-strike*.18);
        hand.rotation.z=side*(Math.sin(cycle-.94)*.18+wind*.13-strike*.14);
        hand.rotation.y=side*(-.08-wind*.12+strike*.21);
      }
      for(const {root,fan,side} of tails){
        root.rotation.x=.16+Math.sin(cycle-.69)*.23+wind*.31-strike*.16;
        root.rotation.y=side*(.081+Math.sin(cycle*.56)*.082+strike*.25);
        fan.rotation.x=Math.sin(cycle-1.12)*.19+wind*.19-strike*.23;
        fan.rotation.z=side*(.037+Math.sin(cycle*.58-1)*.073);
      }
    }};
}
