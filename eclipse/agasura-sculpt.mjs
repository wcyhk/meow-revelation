import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const mirror=(s,track)=>track.map(([x,...rest])=>[s*x,...rest]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:16,sides:mobile?6:8,ridge:.18});
const shell=(k,j,m,p,mobile,seed=0,section=2.39)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?13:19,sides:mobile?11:15,section,seed,ridge:.20,
}));

export const agasuraFinishes={
  asuraScale:[0x453a3e,.22,.68,'hide'],asuraCopper:[0x794b3b,.41,.61,'bronze'],asuraBelly:[0x888d88,.18,.66,'bone'],
  asuraDark:[0x29252d,.26,.64,'iron'],asuraBone:[0xbfb099,.18,.60,'bone'],asuraJaw:[0x4b312d,.061,.85,'hide'],
  asuraEye:[0xc98345,.13,.48,'gem'],
};

const rest=[[-.405,-.111,-2.058,.016,.014],[-.670,-.094,-1.684,.059,.056],[-.757,-.066,-1.248,.095,.083],
  [-.683,-.020,-.884,.128,.112],[-.437,.004,-.511,.162,.145],[-.126,.045,-.279,.200,.177],
  [.122,.202,-.156,.244,.201],[.162,.479,-.045,.242,.203],[.157,.775,.048,.234,.201],
  [.114,1.070,.123,.202,.189],[.067,1.330,.202,.165,.160],[.030,1.533,.280,.128,.122]];

function spine(k,body,mobile){
  const curve=new T.CatmullRomCurve3(rest.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.45);
  const sizes=new T.CatmullRomCurve3(rest.map(([, , ,a,b])=>new T.Vector3(a,b,0)),false,'catmullrom',.38);
  const bones=[],stations=mobile?12:17;
  for(let i=0;i<stations;i++){
    const bone=new T.Bone(),point=curve.getPointAt(i/(stations-1));
    bone.name='阿迦修羅 · 脊骨 '+(i+1);
    if(i){
      bones[i-1].add(bone);
      point.sub(curve.getPointAt((i-1)/(stations-1)));
    }else body.add(bone);
    bone.position.copy(point);
    bones.push(bone);
  }
  const row=mobile?65:112,span=mobile?22:34,stride=span+1;
  const position=[],color=[],uv=[],skinIndex=[],skinWeight=[],outer=[],belly=[];
  const right=new T.Vector3(),dorsal=new T.Vector3(),vertex=new T.Vector3();
  for(let i=0;i<=row;i++){
    const life=i/row,point=curve.getPointAt(life),tangent=curve.getTangentAt(life);
    right.set(1,0,0).addScaledVector(tangent,-tangent.x).normalize();
    dorsal.crossVectors(tangent,right).normalize();
    const size=sizes.getPoint(curve.getUtoTmapping(life));
    const station=life*(stations-1),first=Math.min(stations-2,Math.floor(station)),mix=station-first;
    for(let j=0;j<=span;j++){
      const angle=j/span*tau,s=Math.sin(angle),c=Math.cos(angle),ventral=s<-.61;
      const rib=(.5+.5*Math.cos(life*177+.34*Math.max(0,-s)**2))**3;
      const overlapping=.69+.31*Math.cos(angle*9+life*66+Math.cos(life*45)*.7);
      const groove=ventral?1+rib*.08:1+.089*overlapping+.022*Math.cos(life*173-angle*7);
      const y=ventral?-(Math.abs(s)**.79):Math.sign(s)*Math.abs(s)**.86;
      vertex.copy(point).addScaledVector(right,Math.sign(c)*Math.abs(c)**.90*size.x*groove)
        .addScaledVector(dorsal,y*size.y*groove);
      position.push(...vertex.toArray());
      uv.push(j/span,life);
      const value=ventral?.74+rib*.20+Math.abs(c)*.10:.63+overlapping*.16+.10*Math.max(0,s);
      const red=ventral?0:.10*Math.max(0,1-Math.abs(s+.32)*2.6);
      color.push(value+red,value-red*.37,value-red*.49);
      skinIndex.push(first,first+1,0,0);
      skinWeight.push(1-mix,mix,0,0);
      if(i===row||j===span)continue;
      const from=i*stride+j,to=from+stride;
      const indices=Math.sin((j+.5)/span*tau)<-.61?belly:outer;
      indices.push(from,from+1,to,to,from+1,to+1);
    }
  }
  const geometry=new T.BufferGeometry().setIndex(outer.concat(belly));
  geometry.addGroup(0,outer.length,0);
  geometry.addGroup(outer.length,belly.length,1);
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndex,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(skinWeight,4));
  geometry.computeVertexNormals();
  const normal=geometry.attributes.normal,a=new T.Vector3(),b=new T.Vector3();
  for(let i=0;i<=row;i++){
    const j=i*stride,h=j+span;
    a.fromBufferAttribute(normal,j).add(b.fromBufferAttribute(normal,h)).normalize();
    normal.setXYZ(j,a.x,a.y,a.z);normal.setXYZ(h,a.x,a.y,a.z);
  }
  const mesh=new T.SkinnedMesh(geometry,[k.materials.asuraScale,k.materials.asuraBelly]);
  mesh.name='阿迦修羅 · 連續蛇軀';
  mesh.frustumCulled=false;
  body.add(mesh);
  body.updateWorldMatrix(true,true);
  mesh.bind(new T.Skeleton(bones));
  for(let i=2;i<bones.length-1;i++){
    const life=i/(stations-1),bone=bones[i],point=curve.getPointAt(life);
    const tangent=curve.getTangentAt(life);
    right.set(1,0,0).addScaledVector(tangent,-tangent.x).normalize();
    dorsal.crossVectors(tangent,right).normalize();
    const size=sizes.getPoint(curve.getUtoTmapping(life));
    for(const s of sides)for(let j=0;j<(mobile?2:3);j++){
      const u=(j-1)*.050,w=size.x*(.67+.078*j);
      const scale=(side,back,along)=>right.clone().multiplyScalar(side).addScaledVector(dorsal,back).addScaledVector(tangent,along)
        .toArray();
      const path=[...scale(s*w,size.y*.55,.076+u),...scale(s*w*1.38,size.y*.47,-.026+u),
        ...scale(s*w*1.40,size.y*.32,-.134+u)];
      sweep(k,bone,j===1?'asuraCopper':'asuraDark',[[...path.slice(0,3),size.x*.18],[...path.slice(3,6),size.x*.22],
        [...path.slice(6,9),.004]],mobile);
    }
    const ridge=k.bone(bone,...dorsal.clone().multiplyScalar(size.y*.88).toArray());
    const curveTip=dorsal.clone().multiplyScalar(size.y*.30).addScaledVector(tangent,-.108);
    const front=dorsal.clone().multiplyScalar(size.y*.43).addScaledVector(tangent,.044);
    sweep(k,ridge,i%3?'asuraDark':'asuraCopper',[[...front.toArray(),size.x*.22],[...curveTip.toArray(),size.x*.32],
      [...curveTip.addScaledVector(tangent,-.09).multiplyScalar(1.05).toArray(),.005]],mobile);
  }
  return {mesh,bones};
}

function skull(k,head,mobile){
  const jaw=k.bone(head,0,-.073,.069), horns=[];
  shell(k,head,'asuraScale',[[0,-.05,-.192,.091,.098],[0,.071,-.105,.159,.153],[0,.083,-.015,.187,.167],
    [0,.047,.119,.160,.140],[0,-.019,.229,.122,.088],[0,-.052,.329,.088,.071],[0,-.081,.363,.043,.050]],mobile,30,2.52);
  shell(k,jaw,'asuraJaw',[[0,-.068,-.057,.066,.052],[0,-.06,.023,.132,.073],[0,-.035,.142,.098,.067],
    [0,-.007,.245,.089,.059],[0,.005,.271,.045,.032]],mobile,56,2.57);
  sweep(k,jaw,'asuraBelly',[[-.078,-.038,.095,.015],[-.054,-.035,.197,.020],[0,-.026,.259,.023],
    [.053,-.035,.201,.019],[.082,-.04,.08,.008]],mobile);
  for(const s of sides){
    const prow=mirror(s,[[.027,.109,.231],[.079,.157,.182],[.137,.168,.078],[.201,.153,-.049],
      [.211,.031,-.099],[.173,-.035,-.052],[.150,-.018,.090],[.101,.05,.199]]);
    k.sculpt.plate(head,'asuraDark',prow,.037,.013);
    sweep(k,head,'asuraCopper',mirror(s,[[.082,.092,.202,.015],[.128,.112,.139,.027],[.182,.125,.044,.027],
      [.204,.086,-.045,.012]]),mobile);
    k.mesh(head,'gem','asuraEye',s*.140,.093,.157,.034,.021,.015,0,s*.41);
    k.mesh(head,'round','asuraBone',s*.149,.097,.167,.010,.013,.008);
    sweep(k,head,'asuraDark',mirror(s,[[.088,-.026,.310,.009],[.098,-.025,.335,.021],[.085,-.045,.36,.009]]),mobile);
    for(let i=0;i<3;i++){
      const y=.030-i*.041,z=.037-i*.035;
      sweep(k,head,i%2?'asuraDark':'asuraCopper',mirror(s,[[.126,y+.043,.102+z,.019],[.186,y+.046,.007+z,.033],
        [.214,y-.031,-.127+z,.024],[.193,y-.067,-.183+z,.004]]),mobile);
    }
    for(let i=0;i<4;i++){
      const n=.241-i*.056,w=.06+i*.017,long=i===0?.083:.047-i*.005;
      sweep(k,head,'asuraBone',mirror(s,[[w,-.064,n,.024-i*.003],[w+.011,-.099,n+.02,.019-i*.003],
        [w+.021,-.099-long,n+.03,.003]]),mobile);
      if(i)sweep(k,jaw,'asuraBone',mirror(s,[[w*.95,-.018,n-.049,.014],[w,.012,n-.038,.012],[w+.012,.040,n-.033,.002]]),mobile);
    }
    const horn=k.bone(head,s*.146,.149,-.093);
    sweep(k,horn,'asuraDark',mirror(s,[[.004,-.028,.067,.055],[.079,.076,-.036,.068],[.117,.157,-.190,.047],
      [.148,.239,-.313,.026],[.171,.28,-.392,.004]]),mobile);
    sweep(k,horn,'asuraCopper',mirror(s,[[.018,.011,.067,.016],[.094,.092,-.007,.022],[.137,.167,-.156,.019],
      [.152,.233,-.302,.010],[.173,.28,-.391,.002]]),mobile);
    horns.push({horn,s});
  }
  for(let i=0;i<3;i++)sweep(k,head,i%2?'asuraScale':'asuraDark',[[0,.127+i*.027,.193-i*.077,.081],
    [0,.188+i*.021,.12-i*.084,.105],[.008,.187+i*.042,.043-i*.096,.073],
    [.015,.158+i*.060,-.071-i*.108,.005]],mobile);
  return {jaw,horns};
}

export function carveAgasura(k,entry,mobile){
  const body=k.bone(k.root,0,.205,.025),{bones,mesh}=spine(k,body,mobile);
  const head=k.bone(bones.at(-1),0,.013,.036);
  const {jaw,horns}=skull(k,head,mobile);
  return {body,head,inspectionHead:head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,
    pattern:'coil',sourceSculpt:true,agasuraBones:bones,agasuraJaw:jaw,agasuraSkin:mesh,
    polishEnergy:{tint:0xdc7a5f,shape:'ribbons',anchor:body,offset:[.06,.7,.10],span:[.53,.73,.78]},
    disposeRig(){mesh.skeleton.dispose();},
    cataloguePose({beat,wind,strike,travel,fall,stage,attackPattern}){
      const force=(attackPattern==='lance'||attackPattern==='pounce'?1.09:.78)*(1+stage*.18);
      for(const [i,joint] of bones.entries()){
        const t=i/(bones.length-1),upper=Math.max(0,(t-.53)/.47),tail=1-upper;
        const sway=Math.sin(beat*.61-i*.49),lean=Math.cos(beat*.53-i*.53);
        joint.rotation.y=sway*(.049+.088*tail*travel)+strike*(.026-.064*upper);
        joint.rotation.x=lean*.027+upper*(wind*.127-strike*.21*force)+fall*upper*.14;
        joint.rotation.z=sway*(.025+upper*.020)+wind*.028*upper;
      }
      head.rotation.x=-wind*.13+strike*.31;
      head.rotation.y=Math.sin(beat*.36)*.062+(wind-strike)*.071;
      jaw.rotation.x=.027+wind*.18+strike*.79*force+stage*.083;
      for(const {horn,s} of horns){
        horn.rotation.y=s*(stage*.12+wind*.07-strike*.098);
        horn.scale.setScalar(1+stage*.15);
      }
    },
  };
}
