import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2;
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const panel=(k,j,finish,path,depth=.044)=>k.sculpt.plate(j,finish,path,depth,depth*.32);
const wire=(k,j,finish,path,steps=12)=>k.sculpt.sweep(j,finish,path,{steps,sides:7,ridge:.19});
const cast=(k,j,finish,path,mobile)=>k.geometry(j,finish,sculptVolume(path,
  {sides:mobile?10:16,rings:mobile?12:18,section:2.48,ridge:.17}));

function finishes(k){
  if(k.materials.vaultIron)return;
  for(const [name,color,metalness,roughness,finish] of [
    ['vaultIron',0x282f33,.72,.51,'iron'],['vaultBrass',0x927151,.71,.43,'bronze'],
    ['vaultOxide',0x435c57,.56,.63,'bronze'],['vaultSeal',0x9b4a31,.47,.54,'iron'],
  ]){
    const material=new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:.63});
    k.materials[name]=paintedFinish(material,finish,true,true);
  }
}

function gear(k,j,radius,depth,teeth){
  const outline=[];
  for(let i=0;i<teeth*4;i++){
    const ang=i*tau/(teeth*4),r=radius*(i%4===0||i%4===3?.80:1);
    outline.push(new T.Vector2(Math.sin(ang)*r,Math.cos(ang)*r));
  }
  const shape=new T.Shape(outline),hole=new T.Path();
  hole.absarc(0,0,radius*.445,0,tau,false);
  shape.holes.push(hole);
  const solid=new T.ExtrudeGeometry(shape,{depth,bevelThickness:.009,bevelSize:.009,bevelSegments:1,curveSegments:16});
  solid.translate(0,0,-depth*.50);
  k.geometry(j,'vaultBrass',solid);
  for(let i=0;i<teeth;i++){
    const a=i*tau/teeth;
    k.mesh(j,'gem',i%3?'vaultIron':'vaultSeal',Math.sin(a)*radius*.61,Math.cos(a)*radius*.61,depth*.51,
      radius*.11,radius*.10,.013,0,0,a);
  }
}

function hinge(k,parent,side,offset,radius,motions,mobile){
  const mount=k.bone(parent,...offset);
  mount.rotation.y=side*Math.PI*.5;
  k.mesh(mount,'ring','vaultIron',0,0,0,radius*1.07,radius*1.07,.83);
  const pinion=k.bone(mount,0,0,.023);
  pinion.name='庫門重鎧 · 傳動棘齒';
  gear(k,pinion,radius,.047,mobile?8:11);
  k.mesh(mount,'gem','glow',0,0,.046,radius*.27,radius*.27,.029);
  motions.push({joint:pinion,side,radius});
}

export function vaultArm(k,{arm,elbow,grip,side,length},mobile,motions){
  finishes(k);
  const path=points=>mirror(side,points);
  cast(k,arm,'vaultIron',path([[0,.166,-.017,.111,.108],[.042,.027,-.015,.176,.165],
    [.063,-length*.27,.021,.154,.163],[.055,-length*.53,.043,.116,.129]]),mobile);
  cast(k,elbow,'vaultIron',path([[-.017,.071,.012,.103,.113],[.038,-.071,.055,.159,.153],
    [.037,-length*.34,.096,.137,.124],[.017,-length*.43,.125,.083,.093]]),mobile);
  for(let i=0;i<3;i++){
    const y=.157-i*.098;
    const shield=path([[-.058,y+.045,-.146],[.10,y+.113,-.128],[.28,y+.052,-.056],
      [.309,y-.047,.056],[.195,y-.132,.147],[.027,y-.104,.194],[-.053,y-.041,.116]]);
    panel(k,arm,i===0?'vaultOxide':'vaultIron',shield,.050);
    wire(k,arm,'vaultBrass',shield.slice(1,6).map(([x,h,z])=>[x+side*.016,h+.020,z,.019]));
    k.mesh(arm,'gem','vaultSeal',side*(.11+i*.038),y-.032,.17-i*.024,.033,.052,.021,0,side*.4,side*.22);
  }
  const brace=path([[-.079,-.047,.129],[.097,-.028,.155],[.19,-.135,.147],[.174,-.303,.184],
    [.073,-.366,.188],[-.029,-.313,.170],[-.08,-.147,.132]]);
  panel(k,elbow,'vaultOxide',brace,.055);
  wire(k,elbow,'vaultBrass',brace.map(([x,y,z])=>[x,y,z+.029,.017]));
  wire(k,elbow,'glow',path([[.044,-.081,.20,.016],[.072,-.146,.202,.014],[.133,-.186,.206,.019],
    [.089,-.244,.231,.009],[.098,-.313,.211,.004]]));
  hinge(k,elbow,side,[side*.143,.009,.017],.134,motions,mobile);
  for(const face of [-1,1])wire(k,elbow,'vaultBrass',path([[.111,.030,face*.097,.033],[.144,-.124,face*.116,.036],
    [.128,-.256,face*.094+.054,.017],[.083,-.316,face*.081+.094,.013]]));
  cast(k,grip,'vaultIron',path([[.009,.073,.019,.089,.102],[.015,-.015,.054,.112,.109],
    [.043,-.132,.116,.111,.086],[.035,-.16,.145,.071,.055]]),mobile);
  for(let digit=0;digit<4;digit++){
    const x=-.061+digit*.068,reach=.111-digit*.009;
    const knuckle=path([[x,-.027,.088,.037,.033],[x+.012,-.094,.151,.043,.039],
      [x+.010,-.160,.151+reach,.033,.031],[x+.005,-.236,.127+reach,.014,.017]]);
    cast(k,grip,digit===0?'vaultBrass':'vaultOxide',knuckle,true);
  }
}

export function vaultLeg(k,{hip,knee,side,ground},mobile,motions){
  finishes(k);
  const path=points=>mirror(side,points);
  cast(k,hip,'vaultIron',path([[0,.112,-.017,.166,.141],[.037,-.065,-.003,.186,.170],
    [.047,-.276,.035,.145,.142],[.027,-ground*.41,.031,.116,.119]]),mobile);
  cast(k,knee,'vaultIron',path([[0,.10,-.015,.138,.142],[.023,-.092,-.006,.162,.139],
    [.042,-.30,.024,.135,.126],[.039,-ground*.49,.099,.110,.122]]),mobile);
  hinge(k,knee,side,[side*.142,-.036,.016],.129,motions,mobile);
  for(const [joint,y,z,spread] of [[hip,-.109,.147,.182],[knee,-.239,.126,.157]]){
    const shield=path([[-.092,y+.113,z],[.016,y+.185,z+.032],[spread,y+.124,z-.018],
      [spread+.023,y-.037,z-.069],[.076,y-.171,z+.035],[-.081,y-.115,z+.048]]);
    panel(k,joint,'vaultOxide',shield,.071);
    wire(k,joint,'vaultBrass',shield.map(([x,h,d])=>[x,h,d+.033,.018]));
    const back=path([[.073,y+.162,-.143],[.156,y+.038,-.179],[.135,y-.097,-.198],[.029,y-.038,-.178]]);
    panel(k,joint,'vaultBrass',back,.055);
    wire(k,joint,'glow',path([[.052,y+.033,z+.091,.012],[.110,y-.011,z+.089,.014],[.059,y-.101,z+.089,.004]]));
  }
  const footY=-ground*.49;
  cast(k,knee,'vaultIron',path([[.018,footY+.051,-.087,.159,.065],[.031,footY+.034,.045,.182,.097],
    [.042,footY+.026,.204,.197,.091],[.043,footY+.003,.32,.155,.055],[.045,footY-.036,.353,.085,.041]]),mobile);
  for(let toe=0;toe<4;toe++){
    const x=-.121+toe*.096,z=.21+Math.sin(toe*.9)*.044;
    const lid=path([[x-.033,footY+.07,z],[x+.036,footY+.07,z-.016],[x+.059,footY+.051,z+.108],
      [x+.046,footY-.018,z+.164],[x-.024,footY-.020,z+.15],[x-.033,footY+.026,z+.076]]);
    panel(k,knee,toe%2?'vaultBrass':'vaultOxide',lid,.041);
  }
}

export function vaultDrive(motions,time,{wind,strike,stage,step,travel}){
  for(const {joint,side,radius} of motions){
    const walk=Math.sin(step*1.52)*travel*.54;
    joint.rotation.z=side*(time*(.24+stage*.45)+walk+wind*.45+strike*.96)*(.15/radius);
  }
}
