import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const flanks=[-1,1],TAU=Math.PI*2;
const LAYERS=[.0,.28,.57,.82,1];
const point=p=>new T.Vector3(...p);
function sweep(k,joint,finish,samples,detail=10){
  k.sculpt.sweep(joint,finish,samples,{steps:detail,sides:6,ridge:.24});
}
function bodyProfile(k,joint,finish,rows,mobile,section){
  k.geometry(joint,finish,sculptVolume(rows,{rings:mobile?17:24,sides:mobile?14:20,section,ridge:.24}));
}
function stoneSlab(k,joint,finish,outline,normal,options={}){
  const {mobile,raise=.105,depth=.054,shear=.8,seed=0}=options;
  const corners=outline.map(point);
  const center=corners.reduce((acc,p)=>acc.add(p),new T.Vector3()).multiplyScalar(1/corners.length);
  const out=point(normal).normalize(),vertices=[],colors=[],tex=[],triangles=[];
  const divisions=mobile?2:3,sectors=corners.length*divisions,samples=LAYERS.length*sectors;
  const next=point(outline[1]).sub(point(outline[0]));
  const after=point(outline[2]).sub(point(outline[0]));
  const forward=next.cross(after).dot(out)>0;
  const temp=new T.Vector3(),originX=center.x,originY=center.y;
  for(const side of flanks)for(const [row,radius] of LAYERS.entries()){
    for(let i=0;i<sectors;i++){
      const u=i/sectors;
      const c=Math.floor(i/divisions),step=i%divisions;
      const before=corners[(c+corners.length-1)%corners.length],after=corners[(c+1)%corners.length];
      const chip=(c+seed)%5===0?.20:.095;
      if(step===0)temp.copy(corners[c]).lerp(before,chip);
      else if(step===1)temp.copy(corners[c]).lerp(after,chip*.83);
      else temp.copy(corners[c]).lerp(after,.46+Math.sin(c*1.84+seed)*.13);
      temp.lerp(center,1-radius);
      const terrace=Math.cos(temp.y*26+temp.x*15-temp.z*9+seed)*.62+
        Math.cos(temp.x*43-temp.y*11+temp.z*29-seed)*.38;
      const running=((temp.x-originX)*.80+(temp.y-originY)*1.13)/Math.max(.055,raise);
      const channel=Math.exp(-(((running-terrace*.27-.071)/.15)**2))*shear*.014*Math.sin(radius*Math.PI);
      const incline=side>0?raise*([.86,.74,.56,.31,.12][row]):depth*-(1-radius)*.72;
      temp.addScaledVector(out,incline+side*depth*.44 + (terrace*.024-channel)*(radius>.01?.50+radius*.38:0));
      vertices.push(...temp.toArray());tex.push(u,radius);
      const tint=(side>0?.76:.54)+terrace*.125+((row===3?.17:0)-channel*2.2)*Number(side>0);
      colors.push(tint*.982,tint,tint*1.003);
    }
  }
  for(const side of flanks){
    const offset=side===1?samples:0;
    const correct=forward===(side===1);
    for(let row=0;row<LAYERS.length-1;row++)for(let i=0;i<sectors;i++){
      const a=offset+row*sectors+i,b=offset+row*sectors+(i+1)%sectors,c=a+sectors,d=b+sectors;
      if(correct)triangles.push(a,c,b,b,c,d);else triangles.push(a,b,c,b,d,c);
    }
  }
  for(let i=0;i<sectors;i++){
    const a=samples-sectors+i,b=samples-sectors+(i+1)%sectors;
    if(forward)triangles.push(a,a+samples,b,b,a+samples,b+samples);
    else triangles.push(a,b,a+samples,b,b+samples,a+samples);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(tex,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setIndex(triangles);geometry.computeVertexNormals();k.geometry(joint,finish,geometry);
}

function fissure(k,joint,points,mobile,wide=.018){
  sweep(k,joint,'bOxide',points.map(([x,y,z],i)=>[x,y,z,(i===0||i===points.length-1?.48:1.0)*wide*1.65]),8);
  sweep(k,joint,'bInlay',points.map(([x,y,z],i)=>[x,y,z+.004,wide*(i===0||i===points.length-1?.24:.90)]),8);
  if(!mobile&&points.length>3)sweep(k,joint,'bSparks',
    points.slice(1,-1).map(([x,y,z],i)=>[x,y,z+.013,wide*(i%3===0?.52:.25)]),7);
}

function armourBelt(k,joint,mobile){
  const height=[-.122,-.015];
  for(let i=0;i<(mobile?7:10);i++){
    const count=mobile?7:10,a=i*TAU/count,path=[];
    const link=k.bone(joint,Math.sin(a)*.368,-.045,Math.cos(a)*.264-.008);
    link.rotation.y=a;link.name='Floating waist clasp';
    const h=i%2?.79:1;
    path.push([-.091,height[1]*h,.014],[0,.062*h,.029],[.104,.015*h,.009],[.092,-.089*h,.016],
      [.047,height[0]*h,.031],[-.058,-.103*h,.022]);
    stoneSlab(k,link,i%2?'bOxide':'bMetal',path,[0,0,1],{mobile,raise:.049,depth:.031,seed:i});
    if(i%2===0)sweep(k,link,'bTrim',[[-.063,-.055,.055],[0,-.029,.083],[.066,-.050,.054]].map(p=>[...p,.011]),7);
  }
}

const bodyCore=[
  [0,-.16,-.04,.25,.208],[0,.015,-.05,.358,.261],
  [.003,.18,-.056,.344,.272],[-.009,.338,-.063,.41,.287],
  [-.008,.506,-.075,.51,.323],[.013,.659,-.077,.553,.348],
  [.006,.806,-.065,.45,.294],[.009,.926,-.026,.235,.189],[0,1.044,-.011,.137,.131],
];
const chestSlabs=[
  [[.043,.747,.328],[.159,.886,.263],[.362,.853,.208],[.518,.767,.151],[.536,.675,.152],
    [.415,.554,.295],[.236,.510,.409],[.038,.575,.440]],
  [[.059,.475,.363],[.174,.552,.322],[.367,.526,.254],[.475,.433,.191],[.374,.338,.205],
    [.184,.311,.360],[.055,.365,.399]],
];
const rearSlabs=[
  [[.075,.829,-.339],[.228,.853,-.345],[.441,.782,-.244],[.515,.648,-.188],[.413,.553,-.344],
    [.236,.538,-.410],[.075,.598,-.449]],
  [[.072,.452,-.378],[.244,.551,-.357],[.427,.469,-.232],[.406,.345,-.254],[.242,.241,-.352],
    [.086,.255,-.405]],
];
const ribsSlabs=[
  [[.410,.617,.117],[.540,.659,.037],[.560,.602,-.130],[.504,.524,-.255],[.422,.453,-.144],[.411,.500,.078]],
  [[.366,.454,.163],[.469,.476,.077],[.496,.426,-.055],[.455,.330,-.226],[.379,.271,-.126],[.370,.310,.103]],
  [[.315,.288,.143],[.392,.300,.093],[.425,.239,-.069],[.398,.185,-.194],[.323,.103,-.143],[.304,.149,.062]],
];

function thorax(k,body,mobile){
  const spine=k.bone(body,0,.385,-.029);spine.name='Thorax and spinal mass';
  const trackedChest=[],trackedBack=[],trackedRibs=[];
  bodyProfile(k,body,'bStoneDark',bodyCore,mobile,2.58);
  const adjusted=(side,pts,left=false)=>pts.map(([x,y,z],i)=>[
    x*side*(left?1.035:.978)+Math.sin(i*2.23+side)*.008,y-.385+(left?-.006:.010)+Math.cos(i+side)*.009,z+.029,
  ]);
  for(const side of flanks){
    const left=side<0;
    for(const [i,outline] of chestSlabs.entries()){
      const joint=k.bone(spine,side*.106,.10-.05*i,0);joint.name=i?'Lower costal plate':'Pectoral boulder';
      const local=adjusted(side,outline,left).map(([x,y,z])=>[x-side*.106,y-.10+i*.05,z]);
      stoneSlab(k,joint,left?'bStonePale':'bMetal',local,[side*.31,.05,1],{mobile,raise:i?.076:.14,depth:.074,seed:i+side});
      const trace=i===0?[[.056,.748,.401],[.149,.703,.502],[.224,.739,.495],[.274,.725,.516],[.405,.752,.397]]:
        [[.079,.429,.423],[.162,.419,.468],[.215,.384,.458],[.31,.397,.363],[.388,.434,.293]];
      const charge=adjusted(side,trace,left).map(([x,y,z])=>[x-side*.106,y-.10+i*.05,z+.024]);
      fissure(k,joint,charge,mobile,i===0?.017:.011);
      if(i===0){
        const branch=adjusted(side,[[.221,.739,.495],[.239,.779,.486],[.214,.828,.405]],left)
          .map(([x,y,z])=>[x-side*.106,y-.10,z+.018]);
        fissure(k,joint,branch,mobile,.008);
      }
      if(i===0)sweep(k,joint,'bStonePale',adjusted(side,[[.087,.851,.310],[.185,.891,.287],[.358,.869,.238],
        [.494,.788,.188]],left).map(([x,y,z],j)=>[x-side*.106,y-.10,z+.024,[.008,.022,.030,.005][j]]),11);
      trackedChest.push({joint,side,i});
    }
    for(const [i,outline] of rearSlabs.entries()){
      const joint=k.bone(spine,side*.08,-i*.064,-.026);joint.name=i?'Latissimus basalt plate':'Scapular basalt slab';
      const local=adjusted(side,outline,!left).map(([x,y,z])=>[x-side*.08,y+i*.064,z+.026]);
      stoneSlab(k,joint,i?'bMetal':'bStonePale',local,[side*.22,.04,-1],{mobile,raise:.104-i*.028,depth:.072,seed:i*3+side});
      const trace=adjusted(side,[[.083,.79-i*.295,-.425],[.154,.761-i*.295,-.475],[.211,.701-i*.295,-.484],
        [.335,.746-i*.295,-.413],[.43,.705-i*.295,-.341]],!left)
        .map(([x,y,z])=>[x-side*.08,y+i*.064,z+.026]);
      fissure(k,joint,trace,mobile,.010);
      trackedBack.push({joint,side});
    }
    for(const [i,outline] of ribsSlabs.entries()){
      const joint=k.bone(spine,side*.327,-.059-i*.119,0);joint.name='Side abdominal rib plate';
      const local=adjusted(side,outline,left).map(([x,y,z])=>[x-side*.327,y+.059+i*.119,z]);
      stoneSlab(k,joint,i===1?'bStonePale':'bMetal',local,[side,.1,.13],{mobile,raise:.071,depth:.059,seed:i*2+side});
      trackedRibs.push({joint,side,i});
    }
    const neck=k.bone(spine,side*.04,.44,-.02);
    const anchor=adjusted(side,[[.041,.952,.035],[.119,.990,-.059],[.276,.900,-.106],[.371,.807,-.037],
      [.294,.779,.168],[.170,.837,.255],[.086,.878,.203]],left).map(([x,y,z])=>[x-side*.04,y-.44,z+.02]);
    stoneSlab(k,neck,'bStoneDark',anchor,[side*.37,1,.28],{mobile,raise:.078,depth:.062,seed:25+side});
    const ligament=adjusted(side,[[.079,.918,.261],[.183,.886,.233],[.276,.853,.175],[.379,.81,.108],
      [.448,.759,.065]],left).map(([x,y,z],i)=>[x-side*.04,y-.44,z+.02,[.021,.049,.058,.035,.008][i]]);
    sweep(k,neck,'bMetal',ligament,10);
  }
  const abdominals=[];
  for(let i=0;i<3;i++){
    const y=.285-i*.147,z=.377-i*.024,w=.229-i*.041;
    const joint=k.bone(body,0,y,.018);joint.name='Overlapping stomach scute';
    const shell=[[-w,.055,z-.086],[-w*.38,.109,z-.009],[w*.30,.093,z+.006],
      [w,.046,z-.073],[w*.80,-.062,z-.019],[w*.18,-.107,z+.044],[-w*.5,-.091,z+.036],[-w*.89,-.036,z-.026]];
    stoneSlab(k,joint,i%2?'bStonePale':'bMetal',shell,[0,.09,1],{mobile,raise:.065,depth:.043,seed:15+i});
    if(i<2)fissure(k,joint,[[-w*.59,.039,z+.037],[-w*.313,.009,z+.079],[w*.18,-.009,z+.105],
      [w*.24,-.046,z+.097],[w*.67,-.043,z+.053]],mobile,.010);
    abdominals.push({joint,i});
  }
  const vertebrae=[];
  for(let i=0;i<6;i++){
    const y=.833-i*.153,z=-.358-.047*Math.sin(i*.62),w=.165-i*.018;
    const joint=k.bone(body,0,y,z);joint.name='Articulated spine scute';
    const slate=[[-w*.76,.067,.021],[0,.10,-.028],[w*.71,.071,.025],[w,.006,.017],[w*.42,-.085,-.042],
      [0,-.121,-.031],[-w*.42,-.09,-.031],[-w,-.014,.016]];
    stoneSlab(k,joint,i%2?'bMetal':'bStonePale',slate,[0,.07,-1],{mobile,raise:.068-i*.004,depth:.043,seed:i*4});
    sweep(k,joint,'bTrim',[[-w*.52,.041,-.037,.008],[0,.059,-.121,.016],[w*.51,.045,-.037,.006]],7);
    vertebrae.push({joint,i});
  }
  armourBelt(k,body,mobile);
  return {spine,trackedChest,trackedBack,trackedRibs,abdominals,vertebrae};
}

function shoulder(k,mobile,limb){
  const side=limb.side,m=p=>p.map(([x,y,z])=>[x*side,y,z]);
  const armature=limb.root;
  armature.name='Stone upper arm anchor';
  bodyProfile(k,armature,'bStoneDark',[
    [-side*.018,.113,-.034,.131,.131],[side*.051,.032,-.019,.239,.197],
    [side*.123,-.124,.009,.235,.176],[side*.116,-.247,.031,.167,.143],
    [side*.096,-.398,.052,.147,.124],
  ],mobile,2.71);
  bodyProfile(k,limb.elbow,'bStoneDark',[
    [0,.065,.025,.121,.102],[side*.023,-.051,.046,.19,.15],
    [side*.043,-.169,.092,.163,.124],[side*.028,-.309,.119,.117,.106],
  ],mobile,2.60);
  const muscle=m([[-.093,.071,.129],[.071,.114,.143],[.172,-.073,.161],[.198,-.191,.139],
    [.15,-.301,.147],[.036,-.344,.148],[-.032,-.172,.214]]);
  stoneSlab(k,armature,'bMetal',muscle,[side*.29,.06,1],{mobile,raise:.069,depth:.045,seed:side+10});
  sweep(k,armature,'bOxide',m([[.142,-.04,.208],[.143,-.12,.225],[.13,-.209,.212],
    [.101,-.288,.199]]).map((p,i)=>[...p,[.005,.018,.016,.003][i]]),9);
  for(let i=0;i<3;i++){
    const y=.104-i*.126,offset=.016+i*.041;
    const cap=m([[-.066,y+.102,.186],[.119,y+.202,.161],[.265+offset,y+.137,.071],[.312+offset,y+.029,-.109],
      [.275+offset,y-.084,-.238],[.115,y-.045,-.259],[.02,y+.049,-.166]]);
    stoneSlab(k,limb.root,i%2?'bMetal':'bStonePale',cap,[side*.92,.44,0],{mobile,
      raise:.095-i*.010,depth:.063,seed:side*7+i});
    fissure(k,limb.root,m([[.143,y+.173,.142],[.230+offset,y+.152,.128],[.240+offset,y+.096,.046],
      [.287+offset,y+.064,-.109]]),mobile,.01);
  }
  const guard=m([[-.105,-.017,.177],[.090,.095,.179],[.220,.016,.111],[.285,-.189,.089],
    [.192,-.289,.165],[.011,-.246,.218],[-.094,-.105,.215]]);
  stoneSlab(k,limb.elbow,'bMetal',guard,[side*.41,.15,1],{mobile,raise:.103,depth:.051,seed:19+side});
  sweep(k,limb.elbow,'bTrim',m([[-.071,-.163,.235],[.044,-.203,.298],[.16,-.203,.279],[.267,-.156,.167]])
    .map((p,i)=>[...p,[.007,.024,.021,.002][i]]),11);
  const inner=m([[.003,-.042,-.086],[.136,.066,-.103],[.207,-.017,-.12],
    [.218,-.211,-.081],[.14,-.278,-.115],[.022,-.204,-.106]]);
  stoneSlab(k,limb.elbow,'bStonePale',inner,[side*.51,.034,-1],{mobile,raise:.084,depth:.062,seed:22+side});
  const fist=limb.hand;fist.name='Basalt fist';
  bodyProfile(k,fist,'bOxide',[[0,.087,-.022,.088,.081],[side*.021,.026,.037,.121,.096],
    [side*.023,-.082,.081,.120,.079],[side*.015,-.126,.101,.078,.045]],mobile,3.14);
  for(let i=0;i<4;i++){
    const x=(i-1.45)*.047,y=-.016-i*.009;
    const mark=[[x-.021,y+.009,.115],[x+.018,y+.029,.129],[x+.035,y-.002,.147],
      [x+.015,y-.066,.152],[x-.022,y-.05,.144],[x-.027,y-.02,.129]];
    stoneSlab(k,fist,i===2?'bStonePale':'bMetal',mark,[side*.05,0,1],{mobile,raise:.043,depth:.032,seed:i});
  }
  const thumb=m([[.052,.011,.012],[.105,.050,.031],[.143,-.021,.067],
    [.107,-.096,.148],[.074,-.055,.139]]);
  stoneSlab(k,fist,'bStonePale',thumb,[side*.83,.14,.61],{mobile,raise:.043,depth:.042,seed:225});
}

function crown(k,head,mobile){
  const mass=k.bone(head,0,.18,-.042);
  mass.name='Carved stone scalp';
  bodyProfile(k,mass,'bStoneDark',[[0,-.038,-.047,.181,.135],[0,.052,-.022,.181,.154],
    [.009,.154,-.045,.166,.153],[.022,.253,-.047,.088,.093]],mobile,2.71);
  const crowns=[
    [[.019,.021,.114],[.057,.046,.122],[.105,.17,.072],[.068,.25,.054],[.008,.20,.110]],
    [[.071,.018,.111],[.119,.056,.084],[.163,.16,.031],[.12,.23,-.01],[.082,.153,.063]],
    [[.113,.018,.034],[.158,.028,.018],[.183,.117,-.033],[.156,.190,-.109],[.101,.128,-.062]],
    [[.034,.023,-.133],[.087,.029,-.163],[.169,.097,-.12],[.137,.166,-.123],[.082,.210,-.12],[.044,.143,-.151]],
  ];
  for(const side of flanks)for(const [i,outline] of crowns.entries()){
    const strata=outline.map(([x,y,z],j)=>[side*x*(1+.045*side),y+.01*Math.sin(i+j+side),z-.01*Math.sin(i+j+side)]);
    stoneSlab(k,mass,i%2?'bStonePale':'bMetal',strata,[side*.30,.69,i===3?-.74:.74],{
      mobile,raise:i===0?.071:.061,depth:.040,seed:side+i*5,
    });
    if(i===1)fissure(k,mass,strata.slice(1,4).map(([x,y,z])=>[x,y+.021,z+.017]),mobile,.009);
  }
}

function fracturedStone(material){
  const existing=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>key+'|volcanic-lamination';
  material.onBeforeCompile=function(shader,renderer){
    existing.call(this,shader,renderer);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 strataPoint=vPaintPoint;
      float strataErosion=sin(strataPoint.x*25.1-strataPoint.z*13.3+sin(strataPoint.y*21.9)*1.8);
      float strataBedding=strataPoint.y*79.4+strataPoint.x*26.5-strataPoint.z*51.1+strataErosion*2.07;
      float strataSeam=sin(strataBedding);
      float strataFault=sin(strataPoint.x*83.6-strataPoint.z*88.9+strataPoint.y*33.1+3.2*strataErosion);
      float strataFine=1.-smoothstep(.27,1.34,fwidth(strataBedding));
      float strataCarve=smoothstep(.68,.97,strataSeam)*(1.-smoothstep(.36,.91,strataFault));
      float strataSulfide=smoothstep(.74,.94,cos(strataBedding*.28+strataErosion))*smoothstep(.47,.92,strataFault);
      diffuseColor.rgb*=.84+.17*strataFine*strataSeam-.27*strataCarve*strataFine;
      diffuseColor.rgb+=vec3(.22,.135,.032)*strataSulfide*strataFine*.55;
    `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      vec3 strataX=dFdx(-vViewPosition),strataY=dFdy(-vViewPosition);
      vec3 strataU=cross(strataY,normal),strataV=cross(normal,strataX);
      float strataDet=dot(strataX,strataU);
      float strataHeight=.0017*strataFine*(strataSeam*.24-strataCarve*.91+strataSulfide*.78);
      normal=normalize(max(abs(strataDet),1e-9)*normal -
        sign(strataDet)*(strataU*dFdx(strataHeight)+strataV*dFdy(strataHeight)));
    `);
  };
}

export function carveThunderColossus(k,body,head,mobile){
  for(const key of ['bMetal','bStoneDark','bStonePale'])fracturedStone(k.materials[key]);
  const core=thorax(k,body,mobile);
  crown(k,head,mobile);
  return {
    armor(limbs){for(const limb of limbs)shoulder(k,mobile,limb);},
    pose({beat,wind,strike,travel,stage}){
      const {spine,trackedChest,trackedBack,trackedRibs,abdominals,vertebrae}=core;
      const pulse=Math.sin(beat*.93)*.014+wind*.020;
      spine.rotation.set(-wind*.14+strike*.24,Math.sin(beat*.42)*.046+(wind-strike)*.12,strike*.046);
      for(const {joint,side,i} of trackedChest){
        joint.rotation.set(wind*-.089+strike*.09,side*(pulse+wind*.078+i*.005),side*(wind*.051-pulse));
        joint.position.z=wind*.024+stage*.016;
      }
      for(const {side,joint} of trackedBack){
        joint.rotation.y=side*(pulse+wind*.12-strike*.066);
        joint.position.z=-.026-wind*.023-stage*.013;
      }
      for(const {joint,side,i} of trackedRibs){
        joint.rotation.z=side*(wind*.049+Math.sin(beat*.77+i*.61)*.031-strike*.053);
        joint.rotation.y=side*(strike*.042+travel*.035);
      }
      for(const {joint,i} of abdominals){
        joint.rotation.x=(wind*.19-strike*.15)*(1-i*.23);
        joint.position.z=.018+wind*.016+strike*.037*(i+1)/3;
      }
      for(const {joint,i} of vertebrae)joint.rotation.z=Math.sin(beat*.58-i*.45)*(.032+travel*.017)+wind*.032;
    },
  };
}
