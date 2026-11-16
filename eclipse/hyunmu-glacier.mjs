import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const bevel=(k,parent,finish,points,depth)=>k.sculpt.plate(parent,finish,points,depth,depth*.28);
const vein=(k,parent,finish,points,steps=9)=>k.sculpt.sweep(parent,finish,points,{steps,sides:6,ridge:.23});
const field=(k,parent,finish,profile,options={})=>k.geometry(parent,finish,sculptVolume(profile,{sides:12,rings:15,section:2.4,ridge:.21,...options}));

export const hyunmuFinishes={
  hide:[0x24383a,.24,.66,'hide'],rind:[0x365457,.41,.55,'iron'],edge:[0xa1cac4,.18,.47,'bone'],
  iceFacet:[0x529da4,.34,.40,'stone'],iceMelt:[0x77c8c5,.28,.35,'iron'],
  iceRidge:[0xb0d9d0,.26,.36,'bone'],iceScute:[0x2c4042,.35,.60,'stone'],
  iceScale:[0x48645e,.25,.64,'hide'],iceCrown:[0x4f9696,.24,.45,'stone'],
  iceCut:[0x234854,.54,.45,'stone'],iceFang:[0xb9aa81,.18,.51,'bone'],
  snakeBelly:[0x957353,.39,.51,'bronze'],snakeCopper:[0xbf8a66,.48,.49,'bone'],
  iceStream:[0x8c9fda,.24,.43,'bone'],iceIndigo:[0x3a5386,.36,.53,'iron'],
};

function shellSurface(u,a){
  const shell=Math.sqrt(Math.max(.02,1-u*u*.83));
  return new T.Vector3(Math.cos(a)*.84*shell,.10+Math.sin(a)*.573*shell,u*.97-.046);
}

export function inscribeShell(k,body,mobile){
  body.name='玄武 · 冰蝕龜甲';
  const scutes=[[-.63,1.5708,.235,.43],[-.16,1.5708,.239,.45],[.34,1.5708,.255,.47],[.70,1.5708,.20,.39]];
  for(const side of sides)for(let row=0;row<3;row++)for(let col=0;col<2;col++){
    const u=-.67+row*.51+col*.125;
    const a=.37+col*.62;
    scutes.push([u,side>0?a:Math.PI-a,.27-col*.015,.45-col*.025]);
  }
  for(const [i,[u,a,span,arc]] of scutes.entries()){
    const center=shellSurface(u,a),normal=new T.Vector3(center.x*.82,Math.max(.22,center.y+.20)*1.5,center.z*.32).normalize();
    const borders=[[.02,-.98],[.82,-.61],[1,.32],[.15,1],[-.82,.74],[-.96,-.39]];
    const p=borders.map(([x,y],j)=>shellSurface(u+span*x,a+arc*y).addScaledVector(normal,.075+.020*Math.sin(i*1.6+j*2.1)));
    const apex=center.clone().addScaledVector(normal,.156+.022*Math.cos(i*3.9));
    const dip=center.clone().addScaledVector(normal,.092);
    for(let j=0;j<p.length;j++){
      const next=(j+1)%p.length;
      const ledge=p[j].clone().lerp(apex,.24),ledgeNext=p[next].clone().lerp(apex,.24);
      bevel(k,body,(i+j)%5===1?'iceCut':'iceCrown',[p[j],p[next],ledgeNext,ledge,dip].map(v=>v.toArray()),.042);
      bevel(k,body,(i+j)%4===0?'iceFacet':'iceScute',[ledge,ledgeNext,apex].map(v=>v.toArray()),.040);
      if((i+j)%3!==0)vein(k,body,(i+j)%5===0?'iceRidge':'iceMelt',
        [[...p[j].clone().addScaledVector(normal,.008).toArray(),.012],
         [...p[j].clone().lerp(p[next],.42).addScaledVector(normal,.031).toArray(),.016],
         [...p[next].clone().lerp(apex,.2).toArray(),.003]],8);
    }
    for(let j=0;j<(mobile?2:3);j++){
      const start=p[(j*2+i)%6].clone().lerp(apex,.18).addScaledVector(normal,.029);
      const end=p[(j*2+i+2)%6].clone().lerp(apex,.73).addScaledVector(normal,.026);
      const fracture=start.clone().lerp(end,.49).addScaledVector(normal,.029);
      vein(k,body,(i+j)%4?'iceCut':'iceMelt',[[...start.toArray(),.006],[...fracture.toArray(),.009],[...end.toArray(),.002]],7);
    }
  }
  for(const side of sides)for(let i=0;i<3;i++){
    const x=.057+i*.147,z=-.976+i*.043,y=.049+i*.051;
    const band=reflect(side,[[x-.075,y+.08,z+.012],[x+.018,y+.113,z-.006],[x+.113,y+.071,z-.012],
      [x+.143,y-.019,z+.006],[x+.080,y-.098,z+.004],[x-.015,y-.104,z-.052],[x-.085,y-.026,z-.024]]);
    bevel(k,body,i%2?'iceScute':'iceCrown',band,.057);
    bevel(k,body,i%2?'iceCrown':'iceCut',band.map(([x,y,z],j)=>[x*.76+side*(.025+i*.042),y*.65+.028,z-.041-j*.001]),.034);
    vein(k,body,'iceMelt',band.slice(0,5).map(([x,y,z],j)=>[x,y+.012,z-.020,[.004,.013,.018,.013,.003][j]]));
    vein(k,body,'iceRidge',reflect(side,[[x-.048,y-.034,z-.060,.005],[x+.008,y+.012,z-.081,.013],
      [x+.081,y+.034,z-.074,.009],[x+.101,y+.017,z-.060,.002]]));
  }
}

export function hyunmuSkull(k,head,mobile){
  const stride={sides:mobile?11:16,rings:mobile?14:21,section:2.71,ridge:.25};
  field(k,head,'iceScale',[[0,.037,-.214,.174,.149],[0,.109,-.041,.182,.155],[0,.075,.146,.154,.124],
    [0,.027,.278,.139,.090],[0,-.040,.335,.125,.063],[0,-.068,.376,.096,.042]],stride);
  field(k,head,'iceCut',[[0,-.086,.169,.118,.041],[0,-.081,.251,.144,.068],[0,-.090,.357,.121,.055],
    [0,-.111,.392,.086,.022]],stride);
  const jaw=k.bone(head,0,-.105,-.009);
  jaw.name='玄武 · 裂冰龍顎';
  field(k,jaw,'iceScale',[[0,-.023,-.119,.118,.085],[0,-.067,.087,.136,.082],[0,-.061,.271,.122,.062],
    [0,-.055,.374,.091,.038]],stride);
  field(k,jaw,'snakeBelly',[[0,-.066,.101,.110,.058],[0,-.091,.236,.117,.039],[0,-.079,.358,.087,.044]],stride);
  for(const side of sides){
    const p=points=>reflect(side,points);
    const eyeSocket=p([[.072,.084,.261],[.097,.134,.211],[.150,.140,.162],[.181,.103,.116],
      [.174,.049,.154],[.116,.051,.239]]);
    bevel(k,head,'iceCut',eyeSocket,.032);
    vein(k,head,'iceMelt',eyeSocket.slice(1,4).map(([x,y,z],i)=>[x+side*.009,y+.022,z+.011,[.013,.030,.007][i]]));
    k.mesh(head,'gem','glow',side*.144,.092,.210,.013,.011,.024,0,side*.71,-side*.18);
    for(let i=0;i<5;i++){
      const t=i/4,x=.098+.032*Math.sin(t*2.2),z=.316-t*.183;
      vein(k,head,'iceFang',p([[x,-.064,z,.011],[x+.008,-.104,z+.015,.014],
        [x+.006,-.135-t*.023,z+.030,.002]]));
      if(i<3)vein(k,jaw,'iceFang',p([[x,-.035,z-.034,.012],[x+.008,-.011,z-.012,.012],
        [x+.010,.023,z+.006,.002]]));
    }
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/(mobile?4:6),x=.127-Math.abs(t-.40)*.065,z=.101+t*.242,y=-.064+Math.sin(t*2.65)*.014;
      const scale=p([[x-.013,y+.019,z-.031],[x+.006,y+.030,z-.012],[x+.023,y+.014,z+.017],
        [x+.024,y-.018,z+.031],[x+.008,y-.047,z+.018],[x-.012,y-.038,z-.002]]);
      bevel(k,jaw,i%2?'iceScale':'iceCrown',scale,.014);
      if(i%2===0)vein(k,jaw,'iceRidge',scale.slice(1,5).map(([x,y,z],j)=>[x+side*.008,y+.006,z,[.004,.009,.007,.002][j]]),6);
    }
    for(let i=0;i<4;i++){
      const f=i/3,x=.047+f*.031,z=.144+f*.044;
      vein(k,jaw,i%2?'snakeCopper':'iceFang',p([[x,-.095,z-.038,.004],[x+.028,-.124,z,.010],
        [x+.050,-.109,z+.031,.007],[x+.061,-.093,z+.049,.002]]),7);
    }
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/(mobile?4:6),x=.136+t*.033,y=.129-t*.206,z=.044-t*.120;
      vein(k,head,i%2?'iceStream':'iceIndigo',p([[x,y,z,.031],[x+.08,y+.104,z-.065,.028],
        [x+.148,y+.148-t*.083,z-.18,.004]]),12);
    }
    vein(k,jaw,'iceRidge',p([[.109,-.073,.141,.019],[.141,-.126,.183,.020],[.146,-.242,.151,.011],
      [.131,-.328,.072,.002]]),14);
    vein(k,head,'iceRidge',p([[.118,-.029,.359,.013],[.175,-.099,.356,.017],[.240,-.161,.247,.010],
      [.271,-.189,.108,.002]]),14);
  }
  return jaw;
}

function flexCoil(k,anchor,path,bones,mobile){
  const centerline=new T.CatmullRomCurve3(path.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.43);
  const geometry=sculptVolume(path,{sides:mobile?11:15,rings:mobile?41:55,section:2.22,ridge:.19,seed:12});
  const {uv,color}=geometry.attributes,indices=[],weights=[];
  for(let i=0;i<uv.count;i++){
    const t=uv.getY(i),f=centerline.getUtoTmapping(t)*(bones.length-1);
    const pair=Math.min(bones.length-2,Math.floor(f)),weight=T.MathUtils.smoothstep(f-pair,0,1);
    indices.push(pair,pair+1,0,0);weights.push(1-weight,weight,0,0);
    const blot=.70+.31*Math.cos(uv.getX(i)*Math.PI*2)**2+.12*Math.sin(t*21);
    color.setXYZ(i,color.getX(i)*blot,color.getY(i)*blot,color.getZ(i)*blot);
  }
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const skin=new T.SkinnedMesh(geometry,k.materials.snakeBelly);
  skin.name='玄武 · 活動蛇身';
  skin.frustumCulled=false;anchor.add(skin);anchor.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(bones);skin.bind(skeleton);
  return skeleton;
}

export function sculptCoil(k,body,mobile){
  const anchor=k.bone(body,.169,-.027,-.754);
  const path=[[0,0,0,.127,.095],[.31,-.014,-.26,.116,.099],[.58,.173,-.17,.100,.092],
    [.67,.454,-.04,.087,.081],[.59,.788,-.11,.075,.070],[.45,1.04,-.22,.068,.060],
    [.36,1.10,-.093,.059,.056],[.43,1.095,.069,.059,.052]];
  const bones=[];
  let parent=anchor;
  for(const [i,[x,y,z,r]] of path.entries()){
    const bone=new T.Bone(),prior=path[i-1]??[0,0,0];
    bone.position.set(x-prior[0],y-prior[1],z-prior[2]);parent.add(bone);parent=bone;bones.push(bone);
    if(i===path.length-1)break;
    const [X,Y,Z,R]=path[i+1];
    for(let j=0;j<3;j++){
      const t=(j+.27)/3,rad=T.MathUtils.lerp(r,R,t);
      const px=(X-x)*t,py=(Y-y)*t,pz=(Z-z)*t;
      bevel(k,bone,(i+j)%3?'snakeCopper':'iceFang',[[px-rad*.4,py-.027,pz+rad*.71],
        [px+rad*.45,py-.027,pz+rad*.68],[px+rad*.51,py+.016,pz+rad*.73],
        [px,py+.033,pz+rad*.88],[px-rad*.61,py+.014,pz+rad*.71]],.018);
      bevel(k,bone,'iceScale',[[px-rad*.50,py-.041,pz-rad*.61],[px+rad*.27,py-.039,pz-rad*.81],
        [px+rad*.42,py+.019,pz-rad*.77],[px,py+.044,pz-rad*.91],[px-rad*.56,py+.010,pz-rad*.62]],.021);
    }
  }
  const skeleton=flexCoil(k,anchor,path,bones,mobile);
  const head=k.bone(bones.at(-1),.016,-.003,.021);
  head.name='玄武 · 赤環蛇首';
  field(k,head,'iceScale',[[0,.006,-.065,.084,.055],[0,.019,.044,.108,.069],[0,-.009,.117,.090,.051],
    [0,-.025,.187,.048,.022]],{sides:mobile?9:12,rings:mobile?11:16});
  const jaw=k.bone(head,0,-.026,.012);
  field(k,jaw,'snakeCopper',[[0,-.011,-.021,.074,.043],[0,-.028,.065,.077,.032],[0,-.042,.153,.041,.018]]);
  for(const side of sides){
    const p=points=>reflect(side,points);
    k.mesh(head,'gem','glow',side*.070,.029,.092,.012,.010,.015,0,side*.68,0);
    vein(k,head,'iceFang',p([[.048,-.011,.141,.013],[.054,-.059,.156,.010],[.043,-.092,.164,.002]]));
    vein(k,head,'iceRidge',p([[.034,.064,.078,.013],[.061,.060,.031,.019],[.104,.057,-.037,.003]]));
  }
  return {bones,head,jaw,skeleton};
}

export function designStreamers(k,body){
  return sides.map(side=>{
    const x=v=>side*v;
    const root=k.bone(body,x(.201),.178,-.803);
    root.name='玄武 · 流冰鰭';
    const paths=[
      [[.00,.013,.03,.051],[.14,.058,-.26,.069],[.36,.225,-.59,.069],[.55,.465,-1.02,.039],[.63,.725,-1.31,.003]],
      [[.024,-.027,-.024,.043],[.17,-.037,-.29,.056],[.44,.026,-.65,.061],[.66,.19,-1.01,.038],[.83,.361,-1.25,.003]],
      [[.045,-.069,-.012,.036],[.28,-.113,-.36,.053],[.55,-.103,-.68,.042],[.76,-.043,-1.04,.028],[.92,.015,-1.23,.002]],
    ];
    for(const [i,points] of paths.entries()){
      vein(k,root,i===0?'iceMelt':'iceIndigo',reflect(side,points.map(([x,y,z,w])=>[x,y,z,w*.41])),17);
    }
    return {root,side,paths:paths.map(path=>reflect(side,path))};
  });
}
