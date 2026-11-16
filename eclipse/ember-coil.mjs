import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const mirror=(side,curve)=>curve.map(([x,...rest])=>[side*x,...rest]);
export const emberCoilFinishes={
  coalScale:[0x9b4229,.13,.78,'hide'],coalBelly:[0xc47b40,.21,.67,'bone'],
  coalShade:[0x612a27,.17,.81,'hide'],coalHorn:[0xcabcb2,.42,.55,'bone'],
  coalCrest:[0x794d40,.39,.59,'iron'],coalPupil:[0x2b1b24,.10,.64,'hide'],
};

const rest=[
  [-.12,.717,-.92,.015,.016],[.41,.632,-1.079,.041,.047],[.867,.526,-.967,.075,.085],
  [1.104,.473,-.630,.112,.123],[1.058,.35,-.138,.155,.160],[.709,.261,.309,.171,.182],
  [.229,.216,.497,.191,.193],[-.289,.242,.542,.198,.201],[-.755,.300,.433,.194,.196],
  [-1.025,.461,.078,.186,.187],[-.969,.579,-.345,.178,.172],[-.649,.681,-.528,.165,.170],
  [-.194,.807,-.363,.159,.164],[.102,1.073,-.128,.153,.156],[.214,1.369,.045,.146,.149],
  [.207,1.679,.159,.130,.130],
];

function axes(curve,u,front,right,dorsal){
  curve.getTangentAt(u,front);
  right.set(front.z,0,-front.x).normalize();
  dorsal.crossVectors(front,right).normalize();
}

function crownScales(k,joint,frame,wide,index,mobile){
  const {forward,right,dorsal}=frame;
  const p=new T.Vector3();
  const local=([x,y,z])=>p.copy(right).multiplyScalar(x).addScaledVector(dorsal,y)
    .addScaledVector(forward,z).toArray();
  for(const side of sides){
    const q=x=>wide*x*side;
    const crest=[[q(.17),wide*.86,.102],[q(.54),wide*.91,.063],[q(.89),wide*.58,.019],
      [q(.99),wide*.39,-.057],[q(.64),wide*.59,-.139],[q(.21),wide*.83,-.094]];
    k.sculpt.plate(joint,index%4?'coalScale':'coalCrest',crest.map(local),.024,.010);
    const crestEdge=crest.slice(1,5).map(([x,y,z],i)=>[...local([x,y+.009,z]),[.006,.011,.012,.003][i]]);
    k.sculpt.sweep(joint,index%3?'coalShade':'coalBelly',crestEdge,{steps:8,sides:6,ridge:.17});
  }
  if(mobile&&index%2)return;
  const keel=[[0,wide*.93,.071],[wide*.27,wide*1.01,.029],[wide*.28,wide*1.15,-.046],
    [0,wide*1.27,-.154],[-wide*.28,wide*1.15,-.046],[-wide*.27,wide*1.02,.029]];
  k.sculpt.plate(joint,'coalCrest',keel.map(local),.023,.012);
}

function spine(k,body,mobile){
  const curve=new T.CatmullRomCurve3(rest.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.59);
  const width=new T.CatmullRomCurve3(rest.map(([, , ,a,b])=>new T.Vector3(a,b,0)),false,'catmullrom',.48);
  const bones=[],dorsalAt=[],count=mobile?15:19;
  const forward=new T.Vector3(),right=new T.Vector3(),dorsal=new T.Vector3();
  for(let i=0;i<count;i++){
    const u=i/(count-1),joint=new T.Bone(),center=curve.getPointAt(u);
    axes(curve,u,forward,right,dorsal);
    const height=width.getPoint(curve.getUtoTmapping(u)).y;
    dorsalAt.push(dorsal.clone().multiplyScalar(height+.051));
    joint.name='燃燒的火龍 · 脊骨 '+(i+1);
    if(i){bones[i-1].add(joint);center.sub(curve.getPointAt((i-1)/(count-1)));}
    else body.add(joint);
    joint.position.copy(center);
    bones.push(joint);
    if(i>2&&i<count-1)crownScales(k,joint,{forward,right,dorsal},height,i,mobile);
  }
  const row=mobile?72:112,span=mobile?18:26,stride=span+1;
  const coords=[],color=[],uv=[],skin=[],weights=[],shell=[],belly=[];
  const vertex=new T.Vector3();
  for(let i=0;i<=row;i++){
    const u=i/row,point=curve.getPointAt(u),radius=width.getPoint(curve.getUtoTmapping(u));
    axes(curve,u,forward,right,dorsal);
    const step=u*(count-1),first=Math.min(count-2,Math.floor(step)),mixed=step-first;
    for(let j=0;j<=span;j++){
      const angle=j*tau/span,s=Math.sin(angle),c=Math.cos(angle);
      const scales=.5+.5*Math.cos(u*172+Math.cos(angle*6)*.82);
      const accented=s>=-.56?scales**4:scales;
      const contour=1+.070*accented+.021*Math.cos(u*219+angle*8);
      vertex.copy(point).addScaledVector(right,c*radius.x*contour).addScaledVector(dorsal,s*radius.y*contour);
      coords.push(...vertex.toArray());
      const shade=.72+accented*.16+Math.max(0,s)*.12;
      color.push(shade*1.09,shade*.97,shade*.91);
      uv.push(j/span,u);
      skin.push(first,first+1,0,0);
      weights.push(1-mixed,mixed,0,0);
      if(i===row||j===span)continue;
      const b=i*stride+j,a=b+stride;
      const indices=Math.sin((j+.5)*tau/span)<-.56?belly:shell;
      indices.push(b,b+1,a,a,b+1,a+1);
    }
  }
  const geometry=new T.BufferGeometry().setIndex(shell.concat(belly));
  geometry.addGroup(0,shell.length,0);
  geometry.addGroup(shell.length,belly.length,1);
  geometry.setAttribute('position',new T.Float32BufferAttribute(coords,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(skin,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  geometry.computeVertexNormals();
  const mesh=new T.SkinnedMesh(geometry,[k.materials.coalScale,k.materials.coalBelly]);
  mesh.name='燃燒的火龍 · 連續盤身';
  mesh.frustumCulled=false;
  body.add(mesh);
  body.updateWorldMatrix(true,true);
  mesh.bind(new T.Skeleton(bones));
  return {bones,dorsalAt};
}

function dragonHead(k,bone,mobile){
  const head=k.bone(bone,.0,.064,.084);
  const jaw=k.bone(head,0,-.078,.11);
  const shape=(joint,mat,points,seed)=>k.geometry(joint,mat,sculptVolume(points,{
    rings:mobile?12:19,sides:mobile?10:14,section:2.39,ridge:.20,seed,
  }));
  const edge=(joint,mat,points)=>k.sculpt.sweep(joint,mat,points,{steps:14,sides:7,ridge:.19});
  shape(head,'coalScale',[[0,.102,-.16,.161,.124],[0,.127,-.017,.232,.179],[0,.043,.11,.24,.155],
    [.003,-.033,.251,.173,.104],[.01,-.042,.403,.154,.071]],7.1);
  shape(jaw,'coalShade',[[0,-.051,-.07,.111,.071],[0,-.092,.057,.167,.092],
    [0,-.061,.196,.139,.070],[0,-.037,.28,.103,.046]],5.6);
  for(const side of sides){
    const p=points=>mirror(side,points);
    edge(head,'coalShade',p([[.041,.118,.227,.014],[.113,.138,.190,.029],[.173,.139,.105,.035],
      [.211,.110,.063,.006]]));
    k.mesh(head,'gem','glow',side*.129,.111,.211,.040,.016,.021,0,side*.47);
    k.mesh(head,'round','coalPupil',side*.133,.112,.227,.007,.018,.005,0,side*.47);
    edge(head,'coalHorn',p([[.114,.149,-.064,.068],[.171,.269,-.128,.073],[.226,.389,-.246,.058],
      [.228,.464,-.401,.035],[.326,.499,-.542,.005]]));
    edge(head,'coalHorn',p([[.161,.174,-.048,.048],[.216,.220,-.153,.053],[.307,.222,-.309,.031],
      [.406,.249,-.442,.005]]));
    edge(head,'coalCrest',p([[.112,.020,.07,.055],[.188,-.008,.097,.065],
      [.255,-.093,-.027,.044],[.335,-.127,-.151,.005]]));
    edge(head,'coalHorn',p([[.147,-.057,.290,.030],[.151,-.097,.324,.032],[.132,-.174,.344,.004]]));
    edge(jaw,'coalHorn',p([[.121,-.011,.153,.026],[.122,.058,.179,.022],[.109,.082,.174,.004]]));
    edge(head,'coalCrest',p([[.018,-.019,.407,.009],[.057,-.006,.429,.014],
      [.116,-.010,.402,.015],[.165,-.043,.341,.005]]));
    const ear=p([[.178,.046,.083],[.241,.077,.033],[.338,.112,-.063],
      [.400,.070,-.142],[.341,-.048,-.098],[.265,-.099,-.027]]);
    k.sculpt.plate(head,'coalShade',ear,.034,.017);
    edge(head,'coalHorn',ear.slice(1,5).map(([x,y,z],i)=>[x,y+.012,z+.024,[.008,.021,.019,.004][i]]));
  }
  return {head,jaw};
}

function trailingFire(k,body,bones,dorsalAt){
  const uniforms={clock:{value:0},surge:{value:0}};
  const geometry=new T.PlaneGeometry(1,1);
  const phases=bones.slice(1).flatMap((_,i)=>[Math.sin(i*5.829)*.5+.5,Math.sin(i*8.71+.82)*.5+.5]);
  geometry.setAttribute('emberPhase',new T.InstancedBufferAttribute(new Float32Array(phases),1));
  const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:T.DoubleSide,
    blending:T.AdditiveBlending,forceSinglePass:true,
    vertexShader:`
      attribute float emberPhase;
      varying vec2 flame;
      varying float phase;
      void main(){
        flame=uv;
        phase=emberPhase;
        gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);
      }`,
    fragmentShader:`
      uniform float clock,surge;
      varying vec2 flame;
      varying float phase;
      void main(){
        float y=flame.y;
        float x=flame.x-.5+sin(y*8.+clock*5.+phase*6.2)*.15*y;
        float fork=sin(y*19.-clock*7.+phase*9.1)*cos(x*18.+clock*2.);
        float width=.49*pow(1.-y,.75)*(.91+.09*fork);
        float cut=clamp(1.-abs(x)/max(.03,width),0.,1.);
        float heat=1.-y*.73+cut*.18;
        vec3 dye=mix(vec3(.99,.13,.014),vec3(1.,.69,.27),smoothstep(.63,1.,heat));
        float alpha=cut*smoothstep(.03,.22,y)*(1.-smoothstep(.63,1.,y))*.69;
        gl_FragColor=vec4(dye,alpha*(.83+surge*.70));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  k.materials.emberCoilVeil=material;
  const fire=new T.InstancedMesh(geometry,material,phases.length),aim=new T.Object3D();
  const world=new T.Matrix4(),pos=new T.Vector3();
  fire.name='燃燒的火龍 · 隨脊骨擺動的火舌';
  fire.frustumCulled=false;
  fire.renderOrder=32;
  body.add(fire);
  return function animate(time,charge){
    body.updateWorldMatrix(true,true);
    world.copy(body.matrixWorld).invert();
    for(let i=1;i<bones.length;i++){
      pos.copy(dorsalAt[i]).applyMatrix4(bones[i].matrixWorld).applyMatrix4(world);
      const flicker=.45+.26*Math.sin(time*5.4+i*.76)+.18*Math.cos(time*4.8-i*.68);
      const height=.30+flicker*.37+charge*.27;
      for(let plane=0;plane<2;plane++){
        aim.position.copy(pos).y+=height*(plane?.36:.44);
        aim.scale.set(.24+flicker*.12+charge*.16,height*(plane?.87:1),1);
        aim.rotation.set(.16+Math.cos(i*.8+time*3.2)*.23,i*.77+plane*Math.PI*.5,
          Math.sin(i*.8+time*2.7)*.23);
        aim.updateMatrix();
        fire.setMatrixAt((i-1)*2+plane,aim.matrix);
      }
    }
    fire.instanceMatrix.needsUpdate=true;
    uniforms.clock.value=time;
    uniforms.surge.value=charge;
  };
}

export function carveEmberCoil(k,entry,mobile){
  const body=k.bone(k.root,0,.249,0),{bones,dorsalAt}=spine(k,body,mobile);
  const {head,jaw}=dragonHead(k,bones.at(-1),mobile),fire=trailingFire(k,body,bones,dorsalAt);
  fire(0,0);
  return {
    body,head,inspectionHead:head,crest:k.bone(body,0,0,0),pattern:'hover',
    catalogueSculpt:entry.id,sourceSculpt:true,
    polishEnergy:{tint:0xf98548,shape:'embers',anchor:body,offset:[0,.65,.015],span:[1,.80,.82]},
    cataloguePose({beat,headtime,wind,strike,travel,fall,stage,attackPattern}){
      const spit=strike*(attackPattern==='cinders'?1.26:.83);
      for(const [i,joint] of bones.entries()){
        const u=i/(bones.length-1),ripple=Math.sin(beat*.69+i*.61);
        joint.rotation.set(ripple*(.028+travel*.011)-wind*u*.037+spit*u*.081,
          ripple*(.035+travel*.031)+wind*.036*u-spit*.07*u,ripple*.026+fall*.046*u);
      }
      head.rotation.x=-wind*.229+spit*.298;
      head.rotation.y=Math.sin(beat*.61)*.11+wind*.242-spit*.18;
      jaw.rotation.x=.068+wind*.441+spit*.617+stage*.081;
      fire(headtime,wind*.57+spit*.67);
    },
  };
}
