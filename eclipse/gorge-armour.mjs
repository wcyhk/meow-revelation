import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];

const armour={
  m043:{shell:[.54,.335,.35,.02],gut:[.45,.19,.17],line:'torch',rear:'conduit',
    ridge:'lilac',edge:'brass',hinges:[.57,.49],arm:[.30,.34],length:.67,
    left:[[-.08,.128],[.116,.243],[.301,.185],[.379,.046],[.307,-.085],[.208,-.196],[-.048,-.064]],
    right:[[-.06,.16],[.14,.204],[.326,.11],[.334,-.089],[.214,-.205],[.018,-.101]]},
  m044:{shell:[.56,.38,.328,-.04],gut:[.432,.22,.20],line:'delta',rear:'scallops',
    ridge:'steel',edge:'brass',hinges:[.49,.55],arm:[.29,.32],length:.66,
    left:[[-.08,.086],[.114,.19],[.263,.207],[.387,.14],[.371,-.041],[.253,-.158],[.027,-.107]],
    right:[[-.1,.082],[.075,.164],[.236,.132],[.301,.018],[.349,-.15],[.227,-.238],[-.039,-.104]]},
  m045:{shell:[.506,.34,.313,.087],gut:[.42,.18,.24],line:'branch',rear:'fronds',
    ridge:'jade',edge:'brass',hinges:[.55,.46],arm:[.31,.33],length:.67,
    left:[[-.115,.08],[.061,.149],[.31,.26],[.516,.279],[.383,.111],[.317,-.071],[.089,-.181]],
    right:[[-.107,.074],[.102,.144],[.314,.177],[.263,.073],[.437,.061],[.315,-.133],[.022,-.166]]},
  m046:{shell:[.541,.363,.31,-.018],gut:[.43,.16,.21],line:'split',rear:'vent',
    ridge:'ochre',edge:'brass',hinges:[.48,.59],arm:[.32,.30],length:.67,
    left:[[-.105,.09],[.076,.219],[.202,.311],[.264,.173],[.402,.195],[.301,-.147],[.049,-.207]],
    right:[[-.105,.13],[.107,.256],[.317,.306],[.361,.163],[.433,.14],[.282,-.131],[.015,-.207]]},
  m047:{shell:[.72,.397,.448,.042],gut:[.51,.27,.139],line:'fork',rear:'coil',
    ridge:'ochre',edge:'brass',hinges:[.54,.55],arm:[.35,.37],length:.73,
    left:[[-.128,.202],[.097,.294],[.349,.248],[.459,.089],[.409,-.102],[.22,-.212],[-.053,-.109]],
    right:[[-.089,.17],[.146,.236],[.417,.185],[.468,.005],[.293,-.21],[.046,-.188]]},
  m048:{shell:[.64,.438,.448,-.04],gut:[.50,.181,.24],line:'drop',rear:'glacier',
    ridge:'steel',edge:'brass',hinges:[.55,.59],arm:[.33,.39],length:.71,
    left:[[-.125,.119],[.084,.237],[.259,.294],[.423,.195],[.512,.016],[.364,-.161],[.151,-.221],[-.048,-.104]],
    right:[[-.096,.123],[.099,.213],[.248,.233],[.422,.11],[.443,-.086],[.296,-.252],[.034,-.163]]},
  m049:{shell:[.666,.361,.438,.06],gut:[.49,.175,.26],line:'vane',rear:'canopy',
    ridge:'jade',edge:'brass',hinges:[.59,.54],arm:[.31,.38],length:.74,
    left:[[-.096,.173],[.110,.249],[.306,.204],[.501,.37],[.501,.208],[.368,-.006],[.253,-.181],[-.031,-.106]],
    right:[[-.073,.103],[.123,.201],[.354,.313],[.483,.226],[.412,.069],[.349,-.136],[.086,-.198]]},
  m050:{shell:[.675,.445,.419,.016],gut:[.522,.265,.19],line:'furnace',rear:'firebox',
    ridge:'ochre',edge:'brass',hinges:[.56,.62],arm:[.35,.38],length:.72,
    left:[[-.093,.122],[.101,.248],[.269,.304],[.379,.253],[.485,.156],[.414,-.085],[.198,-.178],[-.061,-.118]],
    right:[[-.108,.138],[.10,.314],[.19,.359],[.293,.302],[.421,.322],[.482,.151],[.389,-.120],[.118,-.209]]},
};

const engravings={
  torch:[[-.47,.73],[-.19,.91],[.11,.59],[-.05,.55],[.31,.13],[.43,-.61],[.10,-.44],[-.06,-.72]],
  delta:[[-.63,.39],[-.38,.53],[-.16,.31],[-.29,.03],[.05,-.27],[.42,.02],[.53,.39],[.76,.58]],
  branch:[[-.72,.51],[-.35,.11],[-.095,.55],[.029,.29],[-.020,.045],[.38,-.27],[.54,-.66],[.69,-.52]],
  split:[[-.53,.68],[-.29,.38],[-.33,.137],[.03,.005],[.24,-.31],[.06,-.42],[.32,-.71]],
  fork:[[-.63,.18],[-.42,.64],[-.17,.61],[.12,.24],[-.08,.141],[.25,-.16],[.15,-.37],[.43,-.76]],
  drop:[[-.69,.20],[-.39,.44],[-.11,.48],[.21,.28],[.54,.10],[.29,-.37],[.12,-.52],[-.23,-.62],[-.42,-.28]],
  vane:[[-.62,.48],[-.35,.49],[-.04,.21],[.21,.34],[.59,.07],[.34,-.18],[.131,-.54],[-.19,-.66]],
  furnace:[[-.62,-.44],[-.46,.38],[-.19,.62],[.22,.61],[.48,.34],[.62,-.44],[.33,-.38],[.16,.31],[-.14,.31],[-.3,-.38]],
};

const outline=(side,points)=>points.map(([x,y,z])=>[side*x,y,z]);
const volume=(k,j,finish,track,mobile,section=2.52)=>
  k.geometry(j,finish,sculptVolume(track,{rings:mobile?12:17,sides:mobile?12:16,section,ridge:.13}));
const plate=(k,j,finish,track,thickness)=>k.sculpt.plate(j,finish,track,thickness,thickness*.35);
const seam=(k,j,finish,track,mobile)=>
  k.sculpt.sweep(j,finish,track,{sides:mobile?5:7,steps:mobile?9:13,ridge:.15});

function geometryShell(loop,relief,offset,depth,mobile){
  const path=loop.map(p=>new T.Vector3(...p));
  const ref=new T.Vector3();
  for(const p of path)ref.add(p);
  ref.multiplyScalar(1/path.length);
  const widths=[1,.914,.73,.51,.20];
  const steps=path.length*(mobile?1:2);
  const positions=[],uv=[],colors=[],indices=[];
  const p=new T.Vector3();
  const layer=steps*widths.length;
  for(const face of [0,1]){
    for(let row=0;row<widths.length;row++)for(let s=0;s<steps;s++){
      const u=s/steps*path.length,a=Math.floor(u),b=(a+1)%path.length;
      p.copy(path[a]).lerp(path[b],u-a).lerp(ref,1-widths[row]);
      const raise=[0,.52,.88,1.14,1.0][row];
      const gouge=Math.sin(s*.89+row*.749)*Math.sin(s*1.637-row*.247);
      p.z+=offset*(raise*relief+(row>0?gouge*.013:0)-face*depth);
      positions.push(...p);
      uv.push(s/steps,row/(widths.length-1));
      const patina=.55+raise*.37+.105*Math.sin(s*.946+row*.52)+gouge*.099;
      colors.push(patina,patina*.981,patina*.937);
      if(row===widths.length-1)continue;
      const start=face*layer+row*steps,s1=(s+1)%steps;
      const a0=start+s,b0=start+s1,d0=a0+steps,d1=b0+steps;
      if(face===0)indices.push(a0,b0,d0,b0,d1,d0);
      else indices.push(a0,d0,b0,b0,d0,d1);
    }
  }
  const core=positions.length/3;
  positions.push(ref.x,ref.y,ref.z+offset*relief,ref.x,ref.y,ref.z+offset*(relief-depth));
  uv.push(.5,1,.5,1);colors.push(.91,.86,.78,.82,.77,.71);
  for(let s=0;s<steps;s++){
    const q=(s+1)%steps;
    const row=layer-steps;
    indices.push(row+s,row+q,core,row+s+layer,core+1,row+q+layer,s,layer+s,q,q,layer+s,layer+q);
  }
  // Casting loops follow the photographed edge order, which differs between left and right.
  const orient=path.reduce((sum,a,i)=>{const b=path[(i+1)%path.length];return sum+a.x*b.y-b.x*a.y;},0);
  if(Math.sign(orient)!==offset)for(let i=0;i<indices.length;i+=3){
    const other=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=other;
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  return geo;
}

function cast(k,part,p,color,contour,mobile,relief=.06,face=1,trim=true){
  k.geometry(part,color,geometryShell(contour,relief,face,.055,mobile));
  if(!trim)return;
  const R=contour.map(([x,y,z],i)=>[x*.995,y+.003,z+face*.018,.011+i%3*.004]);
  R.push(R[0]);
  seam(k,part,p.edge,R,mobile);
}

function chassis(k,body,a,p,mobile){
  const [w,d,waist,lean]=p.shell;
  const [front,depth,sternum]=p.gut;
  const upper=a.size>1;
  volume(k,body,'lining',[[0,-.36,-.026,waist*.76,d*.58],[lean*.59,-.22,-.071,waist,d*.73],
    [lean*.33,-.02,-.022,w*.80,d*.91],[lean,.229,-.036,w*.94,d],[lean*.56,.43,-.032,w*.92,d*.81],
    [lean*.15,.57,-.068,w*.65,d*.655],[0,.658,-.042,waist*.63,d*.61]],mobile,2.37);
  const take=(track)=>track.map(([x,y,z])=>[x+lean*.25,y,z]);
  const stern=take([[-front*.23,.516,d*.75],[front*.22,.548,d*.74],[front*.44,.37,d*.87],[front*.28,.124,d*.96],
    [0,-.054,d*.94],[-front*.32,.142,d*.98],[-front*.42,.324,d*.92]]);
  cast(k,body,p,a.armour,stern,mobile,.092);
  const crest=k.bone(body,lean*.25,.261,d+.076);
  crest.name='Inlaid furnace seal';
  const rune=engravings[p.line];
  seam(k,crest,p.ridge,rune.map(([x,y],i)=>[x*front*.38,y*.193,-Math.abs(x)*.046,.014+i%3*.003]),mobile);
  const hinges=[];
  for(const [i,side] of sides.entries()){
    const reach=w*(i===0?.98:1.04);
    const plateShape=outline(side,[[.071,.523,d*.652],[reach*.49,.572+sternum*.12,d*.58],[reach*.88,.455,d*.406],
      [reach*1.037,.299,d*.03],[reach*.84,.168,d*.54],[reach*.52,.097,d*.77],[.065,.163,d*.89]]);
    cast(k,body,p,a.armour,plateShape,mobile,.124);
    const reliefMark=outline(side,[[.078,.466,d*.79+.043],[reach*.38,.536,d*.74+.028],
      [reach*.76,.477,d*.50+.050],[reach*.91,.406,d*.342+.041],[reach*.69,.358,d*.62+.065],
      [reach*.38,.422,d*.76+.062],[.088,.402,d*.91+.038]]);
    cast(k,body,p,p.edge,reliefMark,mobile,.034,1,false);
    const mark=outline(side,[[.102,.435,d*.84+.083],[reach*.371,.464,d*.78+.067],
      [reach*.60,.423,d*.70+.064],[reach*.746,.416,d*.52+.067]]);
    seam(k,body,p.ridge,mark.map(([x,y,z],cell)=>[x,y,z,[.007,.015,.016,.003][cell]]),mobile);
    const ribCount=mobile?3:4;
    for(let q=0;q<ribCount;q++){
      const ky=.156-q*.137,rx=reach*(.65-q*.083),rr=d*(.91-q*.083);
      const joint=k.bone(body,side*.048,ky,.027);
      joint.name='Fitted abdominal rib '+(q+1);
      const rib=outline(side,[[.017,.054,rr+.021],[rx*.47,.086,rr+.024],[rx*.93,.058,rr*.69],
        [rx*1.17,.006,rr*.38],[rx*.95,-.109,rr*.64],[rx*.55,-.08,rr+.04],[.022,-.069,rr+.044]]);
      cast(k,joint,p,q%2?'ironRim':a.armour,rib,mobile,depth*.35,1,q%2===0);
      k.mesh(joint,'gem',p.ridge,side*rx*.55,-.008,rr+.081,.024,.031,.021);
      hinges.push({joint,side,i:q});
    }
    const shoulderRear=k.bone(body,side*.044,.384,-d);
    shoulderRear.name='Hinged posterior carapace';
    const path=outline(side,[[.015,.145,-.027],[w*.35,.238,-.059],[w*.83,.196,.069],[w*.97,.070,.118],
      [w*.84,-.073,.079],[w*.48,-.143,-.118],[.053,-.082,-.103]]);
    cast(k,shoulderRear,p,a.armour,path,mobile,.086,-1);
    const carvedFillet=outline(side,[[.031,.096,-.114],[w*.372,.156,-.135],[w*.593,.114,-.109],[w*.82,.059,-.019]]);
    seam(k,shoulderRear,p.ridge,carvedFillet.map(([x,y,z],i)=>[x,y,z,.017-i*.003]),mobile);
    hinges.push({joint:shoulderRear,side,i:5});
    const lap=upper?2:3;
    for(let q=0;q<lap;q++){
      const b=k.bone(body,side*(waist*.54+q*.047),-.22,-.13+q*.124);
      b.name='Waist fauld hinge';
      b.rotation.y=side*(.66+q*.48);
      const flap=outline(side,[[-.055,.022,.021],[.056,.049,.039],[.152,-.043,.053],[.166,-.188,.099],
        [.088,-.34+q*.035,.144],[-.044,-.286,.130],[-.082,-.115,.072]]);
      cast(k,b,p,q%2?'rivet':a.armour,flap,mobile,.05);
      hinges.push({joint:b,side,i:q+6});
    }
  }
  return hinges;
}

function dorsal(k,body,a,p,mobile){
  const [w,d]=p.shell;
  const motion=[];
  if(p.rear==='conduit'||p.rear==='coil'){
    const stacked=p.rear==='coil';
    const height=stacked?.47:.39,reach=stacked?.30:.218;
    const armature=k.bone(body,0,.25,-d-.045);
    armature.name=stacked?'Bent lightning accumulator':'Copper lightning manifold';
    const map=[[0,-height,.027,.06,.035],[.019,-.23,-.04,.11,.047],[-.024,0,-.115,.124,.055],
      [.036,.202,-.072,.141,.063],[0,height*.83,-.027,.103,.055]];
    volume(k,armature,a.armour,map,mobile,2.83);
    for(const side of sides){
      const path=outline(side,[[.026,-height*.88,-.056],[reach*.57,-height*.52,-.108],
        [reach,-.004,-.157],[reach*.76,height*.34,-.121],[reach*.57,height*.65,-.058],[.056,height*.72,-.009]]);
      seam(k,armature,'rivet',path.map(([x,y,z])=>[x,y,z,.048]),mobile);
      seam(k,armature,p.ridge,path.map(([x,y,z])=>[x+side*.012,y,z-.035,.018]),mobile);
    }
    for(let i=0;i<(stacked?5:4);i++){
      const a=i*Math.PI*.57,len=(stacked?.11:.075)+i*.011;
      k.mesh(armature,'gem',i%2?p.edge:'glow',Math.sin(a)*.077,-height*.65+i*.132,-.136,len*.63,len*.54,len*.33);
    }
    motion.push({joint:armature,side:1,i:0});
  }else for(const side of sides){
    const kind=p.rear;
    const ice=kind==='scallops'||kind==='glacier',fire=kind==='vent'||kind==='firebox';
    const wide=kind==='scallops'?.18:kind==='glacier'?.265:kind==='vent'?.207:kind==='firebox'?.278:kind==='fronds'?.296:.374;
    const rows=mobile?3:4;
    for(let i=0;i<rows;i++){
      const u=i/(rows-1),h=.102+u*.112,x=.09+wide*u*.8,y=.45-u*.135,z=-d-.024-u*.115;
      const joint=k.bone(body,side*x,y,z);
      joint.name=kind+' articulated dorsal '+(i+1);
      const loop=ice?[[.002,.112,-.034],[wide*.47,h+.105,-.052],[wide*.97,h*.66,-.123],[wide*1.17,-.013,-.167],
        [wide*.71,-.147,-.152],[wide*.265,-.106,-.078],[0,-.057,-.03]]:fire?
        [[.01,.103,-.006],[wide*.43,h*.92,-.039],[wide*.93,h*.86,-.078],[wide*1.19,.026,-.152],
          [wide*.85,-.084,-.174],[wide*.364,-.136,-.095],[.016,-.067,-.034]]:
        [[.01,.076,-.021],[wide*.54,h*.92,-.071],[wide*.91,h*.99,-.174],[wide*1.27,h*.62,-.263],
          [wide*.93,-.083,-.200],[wide*.45,-.129,-.109],[.015,-.081,-.021]];
      const route=outline(side,loop);
      cast(k,joint,p,i%2&&ice?p.ridge:a.armour,route,mobile,.035+i*.007,-1);
      if(fire||ice){
        for(let slot=0;slot<3;slot++){
          const start=wide*(.24+slot*.23),yy=h*.57-slot*.032;
          seam(k,joint,fire?'rivet':p.ridge,outline(side,[[start,yy,-.115,.012],
            [start+wide*.08,yy-.049,-.160,.021],[start+wide*.035,yy-.109,-.193,.014]]).map(([x,y,z],i)=>[x,y,z,[.013,.018,.011][i]]),mobile);
        }
      }
      motion.push({joint,side,i});
    }
  }
  return motion;
}

function lumbarArmour(k,body,id,p,mobile){
  if(!['m044','m046','m049'].includes(id))return [];
  const d=p.shell[1],motion=[],vent=id==='m046',canopy=id==='m049';
  const widths=canopy?[.35,.315,.247,.160]:vent?[.247,.228,.203,.155]:[.28,.277,.230,.161,.1];
  for(let i=0;i<widths.length;i++){
    const w=widths[i],y=.17-i*(canopy?.121:vent?.107:.104),z=-d-.038+i*.024;
    const joint=k.bone(body,0,y,z);
    joint.name=canopy?'Grafted root lumbar lamella':vent?'Heat-damaged lumbar vent':'Glacial lumbar guard';
    for(const side of sides){
      const loop=outline(side,canopy?[[.005,.054,-.104],[w*.51,.104,-.082],[w,.156,-.058],[w*1.06,.075,-.091],
        [w*.75,-.043,-.131],[w*.36,-.140,-.174],[.007,-.101,-.168]]:vent?
        [[.023,.063,-.119],[w*.44,.085,-.09],[w*.93,.049,-.038],[w*.96,-.047,-.079],
          [w*.60,-.106,-.146],[w*.17,-.091,-.159],[.021,-.036,-.156]]:
        [[.006,.050,-.102],[w*.54,.082,-.071],[w*.95,.067,-.026],[w*1.14,.015,-.017],
          [w*.86,-.084,-.074],[w*.31,-.115,-.122],[.006,-.076,-.143]]);
      cast(k,joint,p,vent?i%2?'rivet':'clay':canopy?i%2?'jade':'moss':i%2?'cobalt':'steel',loop,mobile,.033,-1,false);
      const path=loop.slice(3,7).map(([x,h,e],j)=>[x*.996,h,e-.028,[.004,.016,.015,.006][j]]);
      seam(k,joint,vent?'ochre':canopy?'brass':'ironRim',path,mobile);
      if(vent){
        for(let port=0;port<2;port++){
          const x=side*w*(.32+port*.27),e=-.151+port*.013;
          seam(k,joint,'black',[[x,.029,e,.017],[x+side*.017,-.009,e-.018,.023],
            [x+side*.026,-.054,e-.03,.006]],mobile);
          seam(k,joint,'glow',[[x,.025,e-.013,.005],[x+side*.018,-.009,e-.033,.009],
            [x+side*.026,-.048,e-.036,.003]],mobile);
        }
      }else{
        const branch=outline(side,[[.012,.024,-.146],[w*.32,.035,-.123],[w*.55,.011,-.127],[w*.78,-.017,-.115]]);
        seam(k,joint,canopy?'rivet':'ivory',branch.map(([x,h,e],j)=>[x,h,e,[.004,.014,.012,.004][j]]),mobile);
      }
    }
    const badge=vent?'ochre':canopy?'jade':'steel';
    k.mesh(joint,'gem',badge,0,-.021,-.20,.058,.04,.036);
    motion.push({joint,side:i%2?-1:1,i:i+2});
  }
  return motion;
}

function buildLimb(k,body,a,p,side,mobile){
  const [w]=p.shell,index=side<0?0:1;
  const fire=a.finish==='fire',ice=a.finish==='ice',wind=a.finish==='wind';
  const [upper,lower]=p.arm;
  const shoulder=k.bone(body,side*(w*.75),p.hinges[index],-.019);
  shoulder.name='Asymmetric pauldron '+(side<0?'left':'right');
  const elbow=k.bone(shoulder,side*(.09+upper*.15),-upper,.045);
  const wrist=k.bone(elbow,side*.048,-lower,.063);
  const leg=k.bone(body,side*p.shell[2]*.56,-.29,-.045);
  const knee=k.bone(leg,side*.019,-p.length*.497,-.058);
  const outer=side===-1?p.left:p.right;
  const reach=Math.max(...outer.map(([x])=>x));
  const contour=outline(side,outer.map(([x,y],i)=>[x,y,.138-(x/reach)*.15+Math.sin(i*.57)*.034]));
  volume(k,shoulder,'lining',outline(side,[[.008,.094,-.024],[.085,-.071,-.033],[.119,-upper*.79,.021]])
    .map(([x,y,z],i)=>[x,y,z,[.15,.175,.12][i],[.153,.167,.12][i]]),mobile);
  cast(k,shoulder,p,a.armour,contour,mobile,.095);
  const back=contour.map(([x,y,z],i)=>[x*1.043,y*.91,-z-.053-i*.004]);
  cast(k,shoulder,p,a.armour,back,mobile,.089,-1);
  for(let row=0;row<(mobile?2:3);row++){
    const y=-.024-row*.075,b=(.285-row*.011)*(reach/.38);
    const shell=outline(side,[[-.025,y+.069,.097],[b*.78,y+.076,.12],[b,y+.027,.019],[b*.96,y-.009,-.14],
      [b*.29,y-.113,-.191],[.034,y-.084,-.089]]);
    plate(k,shoulder,row%2?p.ridge:a.armour,shell,.034);
    k.mesh(shoulder,'gem',p.edge,side*b*.78,y+.028,.108,.026,.02,.016);
  }
  const r=a.size>1?.219:p.rear==='vent'?.168:.185;
  const raw=[[-.035,.050,.04],[.108,.074,.059],[r*1.24,-.051,.119],[r*1.32,-lower*.64,.156],
    [.121,-lower*.94,.163],[-r*.20,-lower,.21],[-r*.58,-lower*.45,.135]];
  const guard=outline(side,raw);
  volume(k,elbow,a.armour,[[0,.052,.011,r*.68,r*.59],[side*.061,-.057,.011,r,r*.82],
    [side*.052,-lower*.65,.061,r*.93,r*.86],[side*.049,-lower,.076,r*.57,r*.70]],mobile,2.81);
  cast(k,elbow,p,a.armour,guard,mobile,.081);
  cast(k,elbow,p,a.armour,guard.map(([x,y,z])=>[x*.82,y,-z*.91]),mobile,.068,-1);
  const seal=k.bone(elbow,side*.071,-.126,.212);
  const etching=engravings[p.line].map(([x,y],i)=>[x*.127,y*.148,-Math.abs(x)*.027-.021,.013+i%2*.004]);
  const collar=outline(side,[[-.095,.118,-.035],[-.028,.153,-.028],[.081,.148,-.025],[.130,.101,-.045],
    [.107,.056,-.053],[.036,.083,-.008],[-.042,.071,-.009]]);
  cast(k,seal,p,p.edge,collar,mobile,.021,1,false);
  seam(k,seal,'rivet',etching.map(([x,y,z,R])=>[x,y,z,R*1.72]),mobile);
  seam(k,seal,fire||!ice&&!wind?'glow':p.ridge,etching.map(([x,y,z,R])=>[x,y,z+.014,R*.76]),mobile);
  const palm=k.bone(wrist,side*.018,-.043,.026);
  palm.name='Jointed forge gauntlet';
  volume(k,palm,a.armour,[[0,.071,-.023,.098,.090],[side*.039,.006,.015,r*.93,r*.83],
    [side*.069,-.143,.073,r*.92,r*.84],[side*.055,-.196,.093,r*.68,r*.60]],mobile,2.89);
  for(let i=0;i<4;i++){
    const x=(-.11+i*.075)+side*.063,y=-.073-Math.sin(i*.83)*.04,blade=fire||wind;
    const tipY=blade?y-.231-(1-Math.abs(i-1.5)/2)*.091:y-.163;
    const tipZ=blade?.283:ice?.26:.235;
    const clawJoint=k.bone(palm,x,y,.109);
    clawJoint.name='Gauntlet phalanx '+(i+1);
    const phalanx=[[-.038,.024,0],[.021,.048,.008],[.043,-.065,.04],[.031,tipY-y,tipZ-.11],
      [-.023,tipY-y+.013,tipZ-.102],[-.044,-.084,.052]];
    cast(k,clawJoint,p,i%2?p.ridge:a.armour,phalanx,mobile,.030,1,false);
    k.mesh(clawJoint,'gem',p.edge,0,-.017,.038,.018,.025,.019);
  }
  const draped=a.size>1;
  const length=draped?.79:1;
  volume(k,leg,'lining',[[0,.062,-.015,.145,.124],[side*.016,-.125,.011,.153,.127],
    [side*.012,-.281,-.046,.103,.102],[0,-.35,-.055,.084,.095]],mobile);
  volume(k,knee,a.armour,[[0,.057,-.011,.11,.105],[0,-.14*length,-.019,.111,.104],
    [side*.02,-.286*length,.089,.143,.115],[side*.028,-.289*length,.221,.153,.067]],mobile,2.84);
  for(let row=0;row<3;row++){
    const y=-.075-row*.058,z=.108+row*.016;
    plate(k,knee,row%2?p.ridge:a.armour,[[-.106,y+.054,z],[.104,y+.072,z],[.117,y-.038,z+.035],
      [.018,y-.081,z+.058],[-.103,y-.025,z+.037]],.037);
  }
  return {side,shoulder,elbow,wrist,palm,seal,leg,knee};
}

export function gorgeRig(k,entry,mobile,a){
  const p=armour[entry.id];
  const body=k.bone(k.root,0,a.size>1?1.027:1.04,0);
  body.name='Sculpted '+entry.name+' body';
  const head=k.bone(body,0,a.size>1?.685:.631,.122);
  head.name='Head and helmet';
  const cloak=k.bone(body,0,.361,-.305),skirts=[];
  const plates=chassis(k,body,a,p,mobile);
  const rear=dorsal(k,body,a,p,mobile);
  rear.push(...lumbarArmour(k,body,entry.id,p,mobile));
  const limbs=sides.map(side=>buildLimb(k,body,a,p,side,mobile));
  const poseForge=({beat,headtime,wind,strike,travel})=>{
    for(const {joint,side,i} of plates){
      joint.rotation.x=.020*Math.sin(beat*.69+i*.51)+wind*.073-strike*.104;
      joint.rotation.z=side*(wind*.027-strike*.064+i*.001*travel);
    }
    for(const {joint,side,i} of rear){
      joint.rotation.x=.036*Math.sin(beat*.66+i*.65)+(wind-strike)*(.081+i*.017);
      joint.rotation.z=side*(wind*.13-strike*.086)*(.49+i*.17);
    }
    for(const {side,palm,seal} of limbs){
      palm.rotation.y=side*(.041+wind*.201-strike*.257);
      seal.rotation.z=Math.sin(headtime*1.12+side)*.046+wind*.11-strike*.15;
    }
  };
  return {body,head,limbs,cloak,skirts,poseForge};
}
