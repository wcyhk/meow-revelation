import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {paintedFinish} from './painted-finish.mjs?v=nightforge-1';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';

const sides=[-1,1];
const scaleReference=2.30;
const name=(root,value)=>{root.name=value;return root;};

function embroideredCape(material){
  const setup=material.onBeforeCompile, key=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>`${key}|keeper-brocade`;
  material.onBeforeCompile=function(shader){
    setup.call(this,shader);
    shader.vertexShader=shader.vertexShader
      .replace('#include <common>','#include <common>\nvarying vec2 keeperCapeUv;')
      .replace('#include <uv_vertex>','#include <uv_vertex>\nkeeperCapeUv = uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec2 keeperCapeUv;
      float capeThread(vec2 p, vec2 a, vec2 b){
        vec2 d=b-a;
        return length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.));
      }
    `).replace('#include <color_fragment>',`#include <color_fragment>
      vec2 p=vec2(min(keeperCapeUv.x,1.-keeperCapeUv.x),keeperCapeUv.y);
      float pixel=clamp(max(fwidth(keeperCapeUv).x,fwidth(keeperCapeUv).y)*.65,.001,.021);
      float border=min(abs(p.x-.026),abs(p.y-.971));
      float braid=min(abs(p.x-.045),abs(p.y-.945));
      float trim=(1.-smoothstep(.004-pixel,.004+pixel,border))*smoothstep(.035,.09,p.y);
      trim=max(trim,(1.-smoothstep(.002-pixel,.002+pixel,braid))*.54*smoothstep(.25,.36,p.y));
      float stem=capeThread(p,vec2(.058,.924),vec2(.085,.843));
      stem=min(stem,capeThread(p,vec2(.085,.843),vec2(.126,.774)));
      stem=min(stem,capeThread(p,vec2(.126,.774),vec2(.183,.718)));
      stem=min(stem,capeThread(p,vec2(.183,.718),vec2(.236,.696)));
      float leaf=capeThread(p,vec2(.087,.841),vec2(.137,.852));
      leaf=min(leaf,capeThread(p,vec2(.137,.852),vec2(.191,.821)));
      leaf=min(leaf,capeThread(p,vec2(.112,.791),vec2(.095,.745)));
      leaf=min(leaf,capeThread(p,vec2(.095,.745),vec2(.103,.703)));
      leaf=min(leaf,capeThread(p,vec2(.149,.751),vec2(.192,.755)));
      leaf=min(leaf,capeThread(p,vec2(.192,.755),vec2(.222,.735)));
      leaf=min(leaf,capeThread(p,vec2(.181,.719),vec2(.192,.675)));
      leaf=min(leaf,capeThread(p,vec2(.192,.675),vec2(.221,.648)));
      float thread=max(trim,1.-smoothstep(.004-pixel,.004+pixel,stem));
      thread=max(thread,(1.-smoothstep(.0025-pixel,.0025+pixel,leaf))*.76);
      float weave=.84+.16*sin(p.x*1270.+p.y*480.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.57,.255,.091)*weave,thread*.89);
    `);
  };
  return material;
}

function palette(){
  function shade(color,style,metalness,roughness,emission=.035){
    const metal=metalness>.25;
    const scan=style==='hide'?{}:scannedSurface(metal?'hammered':'leather',metal?.35:.21);
    return paintedFinish(new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:emission,
      metalness,roughness,vertexColors:true,...scan,envMap:metal?forgeEnvironment():null,envMapIntensity:.95}),style,true);
  }
  return {
    fur:shade(0x34313f,'hide',.05,.78,.07),coal:shade(0x15151f,'hide',.03,.88,.048),
    furEdge:shade(0x545060,'hide',.08,.72,.055),inner:shade(0x94585e,'hide',.03,.84,.040),
    leather:shade(0x513b37,'hide',.07,.79),blade:shade(0x665b5a,'iron',.63,.49),
    brass:shade(0xaa7750,'bronze',.69,.43,.068),trim:shade(0xdcab70,'bronze',.59,.36,.085),
    linen:shade(0xa99479,'cloth',.035,.92,.047),burgundy:shade(0x673138,'cloth',.04,.84,.059),
    red:shade(0x9b4650,'cloth',.035,.87,.054),pupil:shade(0x120f14,'iron',.08,.58,.058),
    iris:shade(0xe8a952,'gem',.13,.32,.58),amber:shade(0xffd497,'gem',.13,.28,1.0),
    cape:embroideredCape(new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,side:T.DoubleSide,roughness:.93,
      metalness:.06,emissive:0x542633,emissiveIntensity:.082,...scannedSurface('leather',.19)})),
  };
}

function work(materials,mobile){
  const batches=new Map();
  function add(parent,finish,geometry){
    if(!batches.has(parent))batches.set(parent,new Map());
    const set=batches.get(parent);
    if(!set.has(finish))set.set(finish,[]);
    set.get(finish).push(geometry);
  }
  function joint(parent,label,x=0,y=0,z=0){
    const part=name(new T.Group(),label);
    part.position.set(x,y,z);
    parent.add(part);
    return part;
  }
  function globe(parent,finish,x,y,z,sx,sy,sz,turn=0){
    const shape=new T.SphereGeometry(1,mobile?10:14,mobile?7:9);
    shape.scale(sx,sy,sz).rotateZ(turn).translate(x,y,z);
    add(parent,finish,shape);
  }
  function relief(parent,finish,path,depth=.023){
    const xy=path.map(([x,y])=>new T.Vector2(x,y));
    const shape=new T.Shape(xy);
    shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSegments:1,
      bevelSize:depth*.37,bevelThickness:depth*.32,curveSegments:3});
    const positions=geo.getAttribute('position');
    // The bevel is built in XY, then bent to match the contour along Z.
    const range=Math.max(.001,Math.max(...path.map(p=>p[0]))-Math.min(...path.map(p=>p[0])));
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),y=positions.getY(i);
      let z=0,w=0;
      for(const [px,py,pz] of path){
        const d=1/(.004+((x-px)/range)**2+((y-py)/range)**2);
        z+=d*pz;
        w+=d;
      }
      positions.setZ(i,positions.getZ(i)-depth*.5+z/w);
    }
    const uv=geo.getAttribute('uv');
    const startX=Math.min(...path.map(p=>p[0])),startY=Math.min(...path.map(p=>p[1]));
    const tall=Math.max(.001,Math.max(...path.map(p=>p[1]))-startY);
    for(let i=0;i<positions.count;i++)uv.setXY(i,(positions.getX(i)-startX)/range,(positions.getY(i)-startY)/tall);
    geo.computeVertexNormals();
    add(parent,finish,geo);
  }
  function flow(parent,finish,path,{rings=mobile?9:14,edges=mobile?7:10,section=2.3,ridge=.13}={}){
    add(parent,finish,sculptVolume(path.map(([x,y,z,r,t=r])=>[x,y,z,r,t]),
      {rings,sides:edges,section,ridge,fur:finish==='fur'||finish==='furEdge'}));
  }
  function line(parent,finish,path,radius=.011,smooth=true){
    const points=path.map(p=>new T.Vector3(...p));
    const curve=smooth?new T.CatmullRomCurve3(points,false,'centripetal'):new T.CurvePath();
    if(!smooth)for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(points[i-1],points[i]));
    add(parent,finish,new T.TubeGeometry(curve,Math.max(4,path.length*(mobile?2:3)),radius,mobile?4:6));
  }
  function ring(parent,finish,x,y,z,radius,tube,pitch=0){
    const geo=new T.TorusGeometry(radius,tube,5,mobile?12:18);
    geo.rotateX(pitch).translate(x,y,z);
    add(parent,finish,geo);
  }
  function finish(){
    for(const [parent,byFinish] of batches)for(const [finish,sources] of byFinish){
      const parts=sources.map(shape=>shape.index?shape.toNonIndexed():shape);
      const joined=new T.BufferGeometry();
      for(const [field,n] of [['position',3],['normal',3],['uv',2],['color',3]]){
        const result=new Float32Array(parts.reduce((length,p)=>length+p.getAttribute('position').count*n,0));
        let cursor=0;
        for(const part of parts){
          const data=part.getAttribute(field);
          const end=cursor+n*part.getAttribute('position').count;
          if(data)result.set(data.array,cursor);
          else result.fill(1,cursor,end);
          cursor=end;
        }
        joined.setAttribute(field,new T.BufferAttribute(result,n));
      }
      for(const [i,p] of parts.entries()){
        p.dispose();
        if(sources[i]!==p)sources[i].dispose();
      }
      parent.add(new T.Mesh(joined,materials[finish]));
    }
  }
  return {add,globe,relief,flow,line,ring,joint,finish};
}

const reflect=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);

function catFace(h,head,mobile){
  const {flow,relief,globe,joint,line}=h;
  flow(head,'fur',[[0,-.31,.047,.24,.234],[0,-.235,.026,.379,.305],[0,-.083,-.025,.436,.365],
    [0,.103,-.061,.431,.365],[0,.255,-.094,.367,.299],[0,.348,-.085,.25,.230],
    [0,.402,-.078,.07,.098]],{rings:mobile?19:25,edges:mobile?20:26,section:2.35,ridge:.068});
  flow(head,'fur',[[0,-.281,.224,.115,.119],[0,-.23,.257,.156,.157],[0,-.169,.252,.206,.154],
    [0,-.111,.259,.164,.116],[0,-.037,.23,.102,.067]],{rings:13,edges:14,section:2.11});
  relief(head,'inner',[[-.058,-.11,.396],[-.031,-.104,.415],[.043,-.102,.408],[.061,-.117,.395],
    [.021,-.161,.411],[-.019,-.166,.412]],.031);
  line(head,'coal',[[0,-.143,.417],[.002,-.182,.413],[.041,-.196,.406],[.072,-.184,.388]],.009);
  line(head,'coal',[[0,-.182,.413],[-.041,-.197,.406],[-.068,-.188,.386]],.009);
  const eyes=[],ears=[];
  for(const s of sides){
    const eye=joint(head,'眼睛',s*.17,-.009,.300);
    eye.rotation.y=s*.44;
    eye.rotation.z=s*.16;
    globe(eye,'coal',0,0,0,.153,.111,.049);
    const lid=joint(eye,'虹膜');
    globe(lid,'iris',-.003,0,.043,.108,.082,.024);
    globe(lid,'pupil',s*.015,-.006,.066,.016,.077,.009);
    globe(lid,'amber',-.024,.034,.069,.017,.014,.004);
    line(eye,'furEdge',[[-.127,.023,.025],[-.068,.080,.038],[.028,.091,.033],[.113,.052,.028]],.016);
    line(eye,'coal',[[-.139,.033,.028],[-.072,.074,.05],[.030,.079,.049],[.116,.043,.034]],.013);
    line(eye,'furEdge',[[-.142,-.018,.033],[-.064,-.072,.030],[.020,-.079,.032],[.116,-.046,.030]],.011);
    eyes.push(lid);
    const ear=joint(head,'耳',s*.244,.224,-.079);
    ear.rotation.y=s*.16;
    const earOutline=reflect(s,[[-.13,-.033,.001],[-.052,.165,.009],[.123,.466,-.052],[.225,.151,-.052],
      [.192,.029,.029],[.137,-.018,.038]]);
    flow(ear,'fur',reflect(s,[[.039,-.030,-.031,.135,.080],[.043,.08,-.018,.147,.062],
      [.062,.196,-.034,.113,.048],[.097,.31,-.048,.069,.038],[.123,.43,-.058,.025,.022],[.124,.479,-.067,.003,.004]]),
    {rings:15,edges:13,section:1.89,ridge:.045});
    relief(ear,'inner',reflect(s,[[-.051,.038,.037],[.015,.158,.024],[.124,.397,-.026],[.158,.155,.004],
      [.139,.08,.051],[.099,.036,.052]]),.014);
    line(ear,'furEdge',earOutline.slice(1,5).map(([x,y,z])=>[x,y,z+.044]),.014);
    for(let i=0;i<3;i++){
      const z=-.095+i*.064;
      flow(ear,'fur',reflect(s,[[.018,.082,z,.043,.041],[.058,.137,z+.014,.042,.024],[.091,.188,z-.014,.003,.003]]),
        {rings:6,edges:6});
    }
    ears.push(ear);
    for(let i=0;i<(mobile?4:6);i++){
      const y=-.225+i*.047,z=.160-i*.048,r=.068+i*.005;
      flow(head,i%3?'fur':'furEdge',reflect(s,[[.280,y-.031,z,r,r*.81],[.385,y+.034,z-.029,r*1.18,r*.69],
        [.440+i*.011,y+.022,z-.109,r*.49,r*.26],[.494+i*.008,y+.009,z-.18,.002,.002]]),
        {rings:8,edges:7,section:2.21});
    }
    for(let i=0;i<3;i++){
      const y=-.16-i*.018,z=.379-i*.014;
      line(head,'furEdge',reflect(s,[[.106,y,z],[.223,y+.015,z+.073],
        [.337,y+.015-i*.03,z+.109],[.415-i*.019,y+.017-i*.049,z+.10]]),.0055);
    }
    for(let i=0;i<4;i++){
      const x=.036+i*.065, y=.22+i%2*.04;
      flow(head,i%3?'fur':'furEdge',reflect(s,[[x-.067,y+.115,.012,.049,.043],[x,y+.080,.143,.058,.042],
        [x+.022,y+.026,.226,.041,.031],[x+.013,y-.086,.289,.003,.003]]),{rings:7,edges:7});
    }
    // Overlapping tapered locks follow the curve of the scalp and turn out at the nape.
    for(let i=0;i<5;i++){
      const x=.014+i*.056,y=.284+.017*Math.cos(i*1.9),z=-.424+i*i*.0026;
      flow(head,i%2?'fur':'furEdge',reflect(s,[[x*.56,y+.039,z+.134,.041,.025],
        [x+.017,y-.078,z+.043,.054,.032],[x+.047,y-.188,z-.004,.049,.034],
        [x+.084,y-.282,z-.011,.027,.019],[x+.111,y-.355+(i*.012),z+.047,.002,.002]]),
        {rings:mobile?8:12,edges:mobile?7:9,section:1.82,ridge:.16});
      flow(head,i%2?'furEdge':'fur',reflect(s,[[x+.014,-.011,z+.034,.035,.021],
        [x+.037,-.115,z+.009,.046,.023],[x+.065,-.219+i*.009,z+.039,.032,.020],
        [x+.090,-.288+i*.014,z+.122,.002,.002]]),
        {rings:mobile?7:10,edges:mobile?6:8,section:1.83,ridge:.16});
    }
  }
  return {eyes,ears};
}

function outfit(h,body,mobile){
  const {flow,relief,globe,joint,line,ring}=h;
  flow(body,'leather',[[0,-.404,.00,.205,.206],[0,-.285,-.02,.293,.236],[0,-.106,-.037,.331,.254],
    [0,.123,-.041,.382,.261],[0,.31,-.018,.313,.21],[0,.398,.012,.145,.126]],{rings:20,edges:17});
  for(const s of sides){
    const f=path=>reflect(s,path);
    for(let i=0;i<4;i++){
      const y=.177-i*.115,w=.276-i*.008;
      const chest=f([[.011,y+.068,.255],[w*.66,y+.095,.214],[w,y+.042,.131],
        [w*.99,y-.07,.151],[w*.52,y-.103,.243],[.027,y-.113,.261]]);
      relief(body,i%2?'leather':'blade',chest,.018);
      line(body,'brass',chest.slice(1,6).map(([x,y,z])=>[x,y,z+.014]),.009,false);
      for(let rivet=0;rivet<(mobile?1:2);rivet++)globe(body,'trim',s*(.13+rivet*.066),y-.055,.267-rivet*.038,.010,.011,.007);
    }
    for(let i=0;i<3;i++){
      const y=.235-i*.155,fill=f([[.035,y+.058,-.218],[.185,y+.076,-.269],[.30,y+.025,-.206],
        [.319,y-.069,-.127],[.14,y-.091,-.250],[.037,y-.053,-.273]]);
      relief(body,i%2?'leather':'blade',fill,.027);
      line(body,'brass',fill.slice(0,5).map(([x,y,z])=>[x,y,z-.021]),.009);
    }
    const sash=f([[.021,-.267,.211],[.154,-.306,.191],[.271,-.365,.157],[.336,-.489,.125],
      [.277,-.609,.155],[.112,-.548,.235],[.054,-.440,.257]]);
    relief(body,'leather',sash,.041);
    line(body,'trim',sash.slice(2,7).map(([x,y,z])=>[x,y,z+.028]),.012);
    const neck=f([[.013,.247,.277,.070,.049],[.143,.312,.264,.083,.047],
      [.297,.302,.139,.085,.063],[.379,.283,-.029,.065,.068],[.313,.243,-.199,.048,.047],[.017,.295,-.273,.048,.039]]);
    flow(body,'burgundy',neck,{rings:15,edges:10,section:2.64});
    line(body,'trim',neck.map(([x,y,z,r])=>[x,y-r*.56,z+.019]),.011);
  }
  flow(body,'coal',[[0,-.327,-.016,.307,.248],[0,-.266,-.016,.312,.258],[0,-.211,-.021,.308,.253]],
    {rings:8,edges:17,section:2.58});
  const buckle=[[-.067,-.30,.246],[-.067,-.202,.267],[.057,-.205,.272],[.068,-.302,.265],[-.067,-.30,.246]];
  line(body,'brass',buckle,.017,false);
  line(body,'trim',[[-.043,-.247,.278],[.081,-.247,.281]],.011,false);
  const logo=joint(body,'胸釦',0,.227,.332);
  globe(logo,'brass',0,0,0,.088,.091,.032);
  ring(logo,'trim',0,0,.030,.065,.0105);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    line(logo,'trim',[[0,0,.039],[Math.cos(a+.14)*.024,Math.sin(a+.14)*.028,.042],
      [Math.cos(a)*.057,Math.sin(a)*.055,.037]],.007);
  }
  const pouch=joint(body,'藥囊',-.241,-.376,.097);
  pouch.rotation.z=-.31;
  flow(pouch,'leather',[[0,-.118,-.034,.071,.047],[0,-.08,0,.108,.090],
    [0,.025,.011,.116,.082],[0,.095,.015,.090,.041]]);
  relief(pouch,'blade',[[-.101,.057,.074],[.099,.065,.073],[.091,.008,.098],[0,-.030,.10],
    [-.078,.003,.104]],.025);
  globe(pouch,'brass',0,.007,.121,.022,.021,.008);
}

function arm(h,body,s,mobile){
  const {joint,flow,line,globe,ring}=h;
  const shoulder=joint(body,'肩',s*.306,.190,.03),elbow=joint(shoulder,'肘',0,-.23,0),hand=joint(elbow,'握柄定位',0,-.29,.044);
  shoulder.rotation.z=s*.20;
  flow(shoulder,'leather',[[0,-.261,.006,.096,.099],[0,-.156,-.012,.131,.143],
    [-s*.009,-.057,-.016,.140,.135],[-s*.013,.044,-.003,.095,.122]],{rings:11,edges:11});
  for(let i=0;i<3;i++){
    const y=-.07-i*.062;
    line(shoulder,i%2?'brass':'blade',[[s*.046,y+.062,.121],[s*.147,y+.033,.047],[s*.144,y+.021,-.031],
      [s*.083,y-.015,-.107]],.015);
  }
  flow(elbow,'linen',[[0,-.261,.056,.087,.079],[0,-.15,.041,.090,.081],
    [0,-.053,.017,.105,.104],[0,.035,-.014,.096,.092]],{rings:13,edges:11});
  for(let i=0;i<5;i++){
    const y=-.035-i*.047;
    line(elbow,i%2?'brass':'leather',Array.from({length:6},(_,j)=>{
      const a=(j/5)*Math.PI*2;
      return [Math.sin(a)*(.107-i*.0034),y+(.019+.011*i)*Math.cos(a),Math.cos(a)*(.103-i*.004)+.014+i*.008];
    }),.009);
  }
  globe(hand,'fur',0,-.016,.026,.099,.103,.093);
  for(let i=0;i<(mobile?3:4);i++){
    const x=(i/(mobile?2:3)-.5)*.101;
    globe(hand,'furEdge',x,-.065,.061+Math.abs(x)*.14,.028,.042,.036);
  }
  globe(hand,'furEdge',-s*.074,-.015,.041,.031,.058,.035,s*.2);
  ring(hand,'brass',0,.034,.01,.073,.013,Math.PI*.5);
  return {shoulder,elbow,hand,s};
}

function leg(h,body,s){
  const {joint,flow,line,globe,relief}=h;
  const hip=joint(body,'髖',s*.161,-.332,-.002),knee=joint(hip,'膝',0,-.287,.022),shoe=joint(knee,'腳',0,-.269,.03);
  flow(hip,'fur',[[0,-.308,.007,.10,.094],[s*.034,-.209,.018,.148,.132],
    [s*.028,-.067,-.014,.17,.151],[s*.001,.064,-.019,.127,.099]],{rings:11,edges:11});
  flow(knee,'leather',[[0,-.239,.034,.095,.084],[0,-.173,.012,.091,.076],
    [0,-.041,-.016,.118,.093],[0,.034,-.026,.105,.092]]);
  relief(knee,'blade',[[-.057,.025,.075],[.054,.026,.072],[.085,-.041,.071],[0,-.148,.119],
    [-.075,-.067,.088]],.024);
  for(let i=0;i<3;i++){
    const y=-.09-i*.062;
    line(knee,i?'brass':'leather',[[s*.091,y-.017,-.048],[s*.105,y+.005,.012],[0,y+.028,.113],
      [-s*.091,y+.003,.008]],.014);
  }
  globe(shoe,'fur',0,.019,.087,.124,.080,.167);
  for(let i=0;i<3;i++)globe(shoe,'furEdge',(i-1)*.064,.002,.196,.037,.051,.052);
  return {hip,knee,shoe,s};
}

function tail(h,body,mobile){
  const {joint,flow}=h;
  const base=joint(body,'尾根',0,-.245,-.229),mid=joint(base,'尾中',-.184,-.097,-.248),tip=joint(mid,'尾尖',-.265,.065,-.243);
  const skins=[[[0,0,.016,.082,.078],[-.092,-.068,-.127,.081,.073],[-.184,-.097,-.248,.074,.061]],
    [[0,0,.022,.076,.060],[-.143,-.018,-.132,.073,.061],[-.265,.065,-.246,.064,.055]],
    [[0,0,.013,.065,.057],[-.144,.091,-.072,.060,.052],[-.197,.228,-.102,.043,.041],
      [-.151,.293,-.142,.012,.012]]];
  [base,mid,tip].forEach((bone,i)=>flow(bone,i===2?'furEdge':'fur',skins[i],
    {rings:mobile?10:15,edges:mobile?9:11,section:2.12,ridge:.12}));
  return {base,mid,tip};
}

function hook(h,body){
  const {joint,line,ring,relief}=h;
  const clasp=joint(body,'燈鈎',.295,-.264,-.139);
  relief(clasp,'blade',[[-.047,.059,.004],[.046,.064,.006],[.060,-.056,.015],[0,-.098,.024],
    [-.048,-.068,.005]],.028);
  line(clasp,'trim',[[.015,.06,.021],[.025,-.018,.040],[.049,-.058,.044],[.018,-.109,.049]],.018);
  ring(clasp,'brass',.004,-.104,.050,.049,.014);
}

function mantle(h,body,material,mobile){
  const frame=name(new T.Group(),'紅斗篷');
  body.add(frame);
  frame.position.set(0,.292,-.106);
  const joints=Array.from({length:4},(_,i)=>name(new T.Bone(),'斗篷 '+i));
  frame.add(joints[0]);
  for(let i=1;i<4;i++){
    joints[i].position.set(0,-.343,-.101);
    joints[i-1].add(joints[i]);
  }
  const rows=mobile?17:25,cols=mobile?18:24;
  const position=[],uv=[],color=[],indices=[],weights=[],sources=[];
  const rose=new T.Color(0x81373f),lining=new T.Color(0x452934);
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
    const t=i/rows, u=j/cols,q=u*2-1,fold=Math.sin(q*11.4+t*.71)*(.022+.051*t);
    const x=q*(.264+.215*Math.sin(t*1.88)+.095*t);
    const y=-t*(1.01-.114*Math.abs(q))+Math.sin(q*15.5)*.037*t**6;
    const z=-.095-.387*t+(1-q*q)*(-.092+.025*t)+fold;
    position.push(x,y,z);
    uv.push(u,t);
    const bright=.81+fold*5.4+.12*Math.cos(t*3.1);
    const dye=T.MathUtils.smoothstep(fold,-.045,.07);
    color.push(T.MathUtils.lerp(lining.r,rose.r,dye)*bright,
      T.MathUtils.lerp(lining.g,rose.g,dye)*bright,T.MathUtils.lerp(lining.b,rose.b,dye)*bright);
    const segment=Math.min(2,Math.floor(3*t)),a=3*t-segment;
    sources.push(segment,segment+1,0,0);
    weights.push(1-a,a,0,0);
    if(i<rows&&j<cols){
      const from=i*(cols+1)+j,to=from+cols+1;
      indices.push(from,from+1,to,to,from+1,to+1);
    }
  }
  const geometry=new T.BufferGeometry().setIndex(indices);
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(sources,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  geometry.computeVertexNormals();
  const mesh=new T.SkinnedMesh(geometry,material);
  mesh.frustumCulled=false;
  frame.add(mesh);
  frame.updateMatrixWorld(true);
  const skeleton=new T.Skeleton(joints);
  mesh.bind(skeleton);
  for(const s of sides){
    const corner=h.joint(frame,'斗篷肩',s*.256,-.014,0);
    h.flow(corner,'burgundy',reflect(s,[[0,0,0,.076,.058],[.12,-.016,-.067,.070,.049],
      [.149,-.123,-.153,.045,.035],[.189,-.19,-.252,.008,.010]]));
  }
  return {frame,joints,skeleton};
}

export function createKeeper(scene,mobile=false){
  const materials=palette(),h=work(materials,mobile);
  const root=name(new T.Group(),'守燈貓');
  const gait=h.joint(root,'姿勢'),body=h.joint(gait,'軀幹',0,1.15,0),head=h.joint(body,'頭',0,.566,.047);
  outfit(h,body,mobile);
  const face=catFace(h,head,mobile),limbs=sides.map(s=>arm(h,body,s,mobile)),legs=sides.map(s=>leg(h,body,s));
  hook(h,body);
  const trailing=tail(h,body,mobile),cape=mantle(h,body,materials.cape,mobile);
  h.finish();
  scene?.add(root);
  return {root,gait,body,head,face,limbs,legs,trailing,cape,materials,heading:0,gaitClock:0};
}

export function poseKeeper(keeper,unit,spec,{x,z,height,time,direction,weaponProfile}){
  const {root,gait,body,head,face,limbs,legs,trailing,cape,materials}=keeper;
  const {dt=0,frame,grip,roll=0,fall=0,armLift=0,armReach=0,bend=0,sway=0,lag=0,
    squash=1,stretch=1,bob=0,fade=1,flash=0}=spec;
  const speed=Math.hypot(unit.vx??0,unit.vz??0),walking=frame===1&&roll===0;
  const moving=walking?T.MathUtils.clamp(speed*.29,.55,1):0;
  const atk=grip?.charge??0,blade=grip?.contact?.96:0;
  const dx=grip?.dx??unit.dx??direction,dz=grip?.dz??unit.dz??1;
  if(dx||dz){
    const want=Math.atan2(dx,dz);
    const change=Math.atan2(Math.sin(want-keeper.heading),Math.cos(want-keeper.heading));
    keeper.heading+=change*(dt?1-Math.exp(-dt*(grip?33:16)):1);
  }
  root.position.set(x,.012+Math.max(0,bob*(roll?.84:.45)),z);
  root.rotation.y=keeper.heading;
  root.scale.set(height/scaleReference*stretch,height/scaleReference,height/scaleReference);
  const reaction=flash*.16+fall*.72;
  gait.position.y=fall*.23;
  gait.rotation.set(fall*1.34-roll*.74
    +moving*.15+(grip?.pitch??0)*.074-reaction*.19,0,roll*.35+bend*.18+sway*.14);
  gait.scale.y=squash;
  const heading=keeper.heading;
  body.position.y=1.15+Math.sin(time*3.8)*.014-moving*.037;
  body.rotation.set(.02+moving*.16-atk*.15+blade*.13,-(grip?.sweep??0)*.32+moving*.06*Math.cos(keeper.gaitClock),
    .044*Math.sin(keeper.gaitClock)*moving+lag*.51);
  head.rotation.set(moving*-.13+blade*.075+reaction*.10,Math.sin(time*1.7)*.050*(1-moving),Math.sin(time*2.4)*.018);
  keeper.gaitClock+=dt*(6.7+speed*2.0);
  const step=keeper.gaitClock;
  for(const part of legs){
    const walk=Math.sin(step+part.s*Math.PI*.5)*moving;
    part.hip.rotation.set(walk*.75-roll*.08+atk*.03,part.s*.10,-part.s*.04);
    part.knee.rotation.x=-Math.max(0,-walk)*1.06+Math.abs(roll)*.043;
    part.shoe.rotation.x=Math.max(0,walk)*-.45;
  }
  for(const [i,part] of limbs.entries()){
    const armed=i===(weaponProfile?.hand??0),s=part.s;
    const walk=Math.sin(step+s*Math.PI*.5)*moving;
    part.shoulder.rotation.set(-.28-walk*.36-(armed?armLift*5.6+blade*.45:atk*.14),
      s*(armed?-.20-(grip?.sweep??0)*.28:-.17),s*(.18+(armed?armReach*-1.21+atk*.34:.02)));
    part.elbow.rotation.x=-.62-(armed?atk*.44-armReach*4.3:.14);
    part.hand.rotation.set(armed?armLift*.8:0,s*(armed?.20:-.12),s*(armed?.12:.04));
  }
  const swing=Math.sin(time*4.05+step*.66);
  trailing.base.rotation.set(.19+moving*.28,(-heading*.041)+swing*(.14+moving*.15),lag*1.28);
  trailing.mid.rotation.set(-.15+swing*.14,moving*.18+swing*.26,0);
  trailing.tip.rotation.set(.11+moving*.32,Math.cos(time*4.35)*.30,Math.sin(time*3)*.22);
  for(const [i,joint] of cape.joints.entries()){
    joint.rotation.x=-moving*(.10+i*.12)-blade*.13*(i+1)-Math.abs(roll)*.050+Math.cos(time*4.6+i*.9)*.045*(i+1);
    joint.rotation.z=lag*(1+i*.35)+Math.sin(time*4.1-i*.9)*(.015+moving*.04)*(i+1);
    joint.rotation.y=(grip?.sweep??0)*.115*Math.min(2,i);
  }
  for(const [i,ear] of face.ears.entries()){
    const side=sides[i];
    ear.rotation.z=side*(-flash*.16+moving*.045+Math.sin(time*3.1+i)*.028);
    ear.rotation.x=-.05*blade+.19*fall+Math.sin(time*3.8+i)*.03;
  }
  const blink=Math.pow(Math.max(0,Math.cos(time*1.47+1)),85)*.95;
  for(const eye of face.eyes)eye.scale.y=Math.max(.04,1-Math.max(blink,flash*.54));
  materials.iris.emissiveIntensity=unit.ascendant?1.31:.49;
  materials.amber.emissiveIntensity=unit.ascendant?2.31:1.1;
  root.visible=fade>.60||unit.ascendant;
  root.updateMatrixWorld(true);
}

export function keeperPaw(keeper,index,target){
  return keeper.limbs[index??0].hand.getWorldPosition(target);
}

export function removeKeeper(keeper){
  keeper.root.removeFromParent();
  keeper.cape.skeleton.dispose();
  keeper.root.traverse(node=>{if(node.isMesh)node.geometry.dispose();});
  for(const material of Object.values(keeper.materials))material.dispose();
}
