import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {bossSkin} from './boss-skin.mjs?v=boss-foundry-1';

const sides=[-1,1];
const flip=(side,points)=>points.map(([x,...rest])=>[x*side,...rest]);
const line=(k,j,mat,path,steps=11)=>k.sculpt.sweep(j,mat,path,{steps,sides:7,ridge:.24});
const shell=(k,j,mat,outline,depth=.046)=>k.sculpt.plate(j,mat,outline,depth,depth*.33);
const flesh=(k,j,mat,path,mobile,seed=0)=>k.geometry(j,mat,sculptVolume(path,{
  sides:mobile?12:17,rings:mobile?15:21,section:2.53,ridge:.29,seed,fur:mat==='windFur'||mat.startsWith('windPelt')
}));

function splitRuff(k,parent,finish,path,mobile,index){
  const n=path.length-1;
  const sample=path.map(([x,y,z,w,d])=>[x,y,z,w,d]);
  k.geometry(parent,finish,sculptVolume(sample,{sides:mobile?7:9,rings:mobile?10:15,section:2.27,ridge:.32,fur:true,seed:index}));
  if(index%2===0)line(k,parent,mobile?finish:'windPeltLight',path.map(([x,y,z,w],i)=>[x+.014,y+.016,z-.018,w*(i===n?.08:.22)]),9);
}

function mantleLocks(k,parent,finish,path,mobile,index,side){
  const ends=mobile?[-1,1]:[-1,0,1];
  for(const finger of ends){
    const phase=index*.91+finger*1.9;
    const branch=path.map(([x,y,z,w,d],i)=>{
      const t=i/(path.length-1),fan=t**1.36,yaw=Math.sin(t*4.1+phase);
      return [side*(x-.014+finger*.045*fan+yaw*.022*t),y+finger*.050*fan+yaw*.035*t,
        z+finger*(w*.44+.045*fan)+yaw*.025*t,w*(finger===0?.48:.58)*(1-.2*t),d*.61];
    });
    const geometry=sculptVolume(branch,{sides:mobile?6:7,rings:mobile?12:16,section:2.12,ridge:.23,fur:true,seed:index+finger});
    const {color,uv}=geometry.attributes;
    for(let i=0;i<uv.count;i++){
      const t=uv.getY(i),u=uv.getX(i)*Math.PI*2;
      const fibre=.78+.135*Math.cos(u*4+t*2.18+phase)+.087*Math.cos(u*7-t*3.1);
      const gradient=.74+.42*Math.sin(t*Math.PI)**.7-.19*t**4;
      color.setXYZ(i,color.getX(i)*fibre*gradient*.97,color.getY(i)*fibre*gradient,
        color.getZ(i)*fibre*gradient*(1.025+t*.085));
    }
    k.geometry(parent,finish,geometry);
  }
}

function taowuHead(k,head,mobile){
  flesh(k,head,'windFur',[[0,-.061,-.28,.305,.210],[0,.034,-.148,.369,.265],
    [0,.006,.055,.321,.222],[0,-.053,.273,.252,.157],[0,-.138,.451,.195,.087]],mobile,2);
  flesh(k,head,'windEnamel',[[0,-.07,.329,.159,.063],[0,-.121,.415,.182,.080],
    [0,-.132,.503,.132,.057],[0,-.157,.541,.100,.028]],mobile,3);
  const jaw=k.bone(head,0,-.219,.019);
  flesh(k,jaw,'windFlesh',[[0,-.015,-.145,.248,.079],[0,-.086,.101,.238,.100],
    [0,-.101,.278,.176,.060],[0,-.056,.431,.112,.041]],mobile,4);
  line(k,jaw,'windCharcoal',[[-.118,-.008,.379,.023],[0,-.048,.431,.023],[.118,-.008,.379,.023]]);
  const noseStrip=[[0,.323,.162],[.062,.285,.238],[.077,.174,.346],[.062,.093,.390],
    [0,.052,.472],[-.062,.093,.390],[-.077,.174,.346],[-.062,.285,.238]];
  shell(k,head,'windVerdigris',noseStrip,.042);
  for(let i=-4;i<=4;i++){
    const x=i*.040,u=Math.abs(i)/4,z=.469-u*.079;
    line(k,head,'windIvory',[[x,-.119-u*.033,z,.017],[x*1.015,-.183-u*.034,z+.029,.016],
      [x*1.016,-.238+u*.017,z+.035,.008],[x*.98,-.260+u*.021,z+.014,.002]],8);
    if(i%2===0)line(k,jaw,'windIvory',[[x,-.031,z-.065,.014],
      [x*1.03,.042-u*.014,z-.043,.012],[x,.073-u*.029,z-.038,.003]],7);
  }
  const curls=[];
  for(const side of sides){
    const p=path=>flip(side,path);
    const crescent=p([[.022,.110,.351],[.089,.256,.308],[.157,.414,.192],[.249,.508,.047],
      [.269,.419,-.114],[.215,.246,-.084],[.159,.150,.081],[.158,.036,.261],[.073,.044,.345]]);
    shell(k,head,'windIvory',crescent,.042);
    flesh(k,head,'windIvory',p([[.041,.083,.321,.034,.031],[.106,.207,.268,.061,.042],
      [.150,.355,.155,.070,.057],[.199,.471,.054,.052,.041],[.163,.580,-.111,.011,.010]]),mobile,7);
    line(k,head,'windCharcoal',p([[.036,.104,.361,.010],[.110,.245,.296,.018],
      [.153,.395,.175,.013],[.196,.464,.073,.004]]),12);
    const cheek=p([[.130,.152,.277],[.255,.257,.095],[.365,.139,-.015],[.394,.012,.064],
      [.349,-.099,.192],[.224,-.170,.378],[.131,-.107,.418],[.162,.025,.350]]);
    shell(k,head,'windVerdigris',cheek,.057);
    line(k,head,'windVerdigris',p([[.037,.246,.239,.023],[.058,.413,.197,.040],
      [.097,.550,.066,.032],[.198,.638,-.079,.003]]),15);
    line(k,head,'windBlue',p([[.106,-.012,.366,.014],[.200,.061,.329,.030],
      [.290,.119,.218,.027],[.350,.118,.054,.015],[.362,.086,-.057,.004]]),14);
    line(k,head,'windBlue',p([[.084,-.118,.474,.010],[.171,-.091,.427,.021],
      [.240,-.044,.351,.019],[.338,-.025,.251,.011],[.382,-.013,.153,.003]]),13);
    const orbit=p([[.089,.044,.358],[.163,.112,.358],[.227,.129,.296],[.242,.084,.295],
      [.177,.053,.371],[.124,.009,.397]]);
    shell(k,head,'windCharcoal',orbit,.021);
    k.mesh(head,'gem','glow',side*.167,.076,.383,.047,.012,.018,0,side*.38,side*.32);
    line(k,head,'windTrim',orbit.slice(1,4).map(([x,y,z])=>[x,y+.017,z+.024,.009]));
    const curl=k.bone(head,side*.24,.192,.054);
    const curlShape=p([[.001,.005,.006,.025],[.102,.057,.027,.028],[.209,.104,.036,.029],
      [.273,.162,.042,.024],[.260,.219,.078,.024],[.210,.227,.123,.016],[.190,.193,.144,.007],[.205,.160,.142,.0015]]);
    line(k,curl,'windIvory',curlShape,18);
    line(k,curl,'windBlue',curlShape.slice(0,5).map(([x,y,z,r])=>[x,y-.008,z+.019,r*.26]),12);
    curls.push({curl,side});
    flesh(k,head,'windIvory',p([[.196,-.143,.374,.051,.043],[.188,-.221,.439,.043,.046],
      [.154,-.305,.477,.032,.032],[.113,-.380,.468,.021,.020],[.093,-.394,.429,.004,.004]]),mobile,16);
    flesh(k,jaw,'windIvory',p([[.148,-.052,.249,.033,.036],[.174,-.006,.291,.030,.030],
      [.161,.052,.308,.021,.019],[.139,.116,.294,.004,.004]]),mobile,21);
    for(let i=0;i<4;i++){
      const x=.184-i*.022,y=-.176+i*.017,z=.335+i*.041;
      line(k,head,'windIvory',p([[x,y,z,.017],[x+.003,y-.048,z+.011,.014],[x-.012,y-.074,z+.004,.002]]),9);
    }
    for(let i=0;i<6;i++){
      const t=i/5;
      k.geometry(head,i%2?'windFur':'windScale',featherVane(...p([[.193+t*.1,.227-t*.26,-.037],
        [.341+t*.088,.201-t*.267,-.146],[.416+t*.052,.105-t*.304,-.39-t*.082]]),
      .109-t*.029,i+36,mobile?8:13));
    }
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/(mobile?4:6),x=.193+t*.093;
      splitRuff(k,head,i%3===0?'windPeltFade':'windPelt',p([[x,.164-t*.096,-.098,.051,.046],
        [x+.09,.093-t*.142,-.202,.071,.052],[x+.168,-.069-t*.19,-.327,.059,.042],
        [x+.133,-.223-t*.187,-.438,.037,.031],[x+.099,-.352-t*.163,-.488,.004,.005]]),mobile,i+21);
    }
  }
  return {jaw,curls};
}

function taowuLeg(k,body,side,front,mobile){
  const p=path=>flip(side,path);
  const hip=k.bone(body,side*(front?.327:.308),front?.248:.169,front?.403:-.460);
  const hock=k.bone(hip,side*(front?.104:.131),-.309,front?.042:-.100);
  const paw=k.bone(hock,side*.045,-.287,.073);
  flesh(k,hip,'windFur',p([[-.057,.074,-.083,.137,.144],[.018,.041,-.048,.182,.166],
    [.086,-.062,front?.037:-.020,.167,.137],[.121,-.197,front?.080:-.068,.131,.109],
    [.115,-.325,front?.065:-.083,.083,.082]]),mobile,front?31:44);
  flesh(k,hock,'windScale',p([[0,.073,-.064,.093,.110],[.015,-.035,-.044,.110,.093],
    [.051,-.149,.012,.100,.089],[.054,-.283,.067,.075,.074]]),mobile,48);
  flesh(k,paw,'windCharcoal',p([[.006,.036,-.063,.087,.061],[.018,.011,.052,.120,.072],
    [.034,-.040,.142,.132,.071],[.045,-.069,.205,.091,.042]]),mobile,67);
  for(let i=0;i<3;i++){
    const y=.094-i*.108,z=front?.044:-.061;
    const band=p([[.023,y+.050,z+.103],[.133,y+.047,z+.119],[.210,y-.018,z+.075],
      [.221,y-.083,z-.031],[.146,y-.118,z-.129],[.068,y-.053,z-.090]]);
    shell(k,hip,i===0?'windEnamel':'windScale',band,.045);
    line(k,hip,'windTrim',band.slice(1,5).map(([x,y,z])=>[x+side*.015,y+.014,z,.016-i*.002]));
    const shin=p([[.039,y+.026,z+.073],[.097,y+.021,z+.066],[.139,y-.031,z-.000],
      [.126,y-.088,z-.044],[.063,y-.077,z-.069]]);
    shell(k,hock,i%2?'windEnamel':'windScale',shin,.036);
    line(k,hock,'windBlue',shin.slice(1,5).map(([x,y,z])=>[x,y+.011,z+.017,.008]));
  }
  for(let i=0;i<4;i++){
    const x=.043+(i-1.4)*.052,z=.162-Math.abs(i-1.5)*.016;
    flesh(k,paw,'windFur',p([[x,-.036,z,.034,.041],[x+.006,-.047,z+.057,.034,.036],
      [x+.015,-.068,z+.103,.022,.016]]),mobile,72+i);
    line(k,paw,'windIvory',p([[x+.015,-.050,z+.079,.018],[x+.019,-.070,z+.110,.018],
      [x+.016,-.106,z+.161,.002]]));
  }
  return {hip,hock,paw,front,side};
}

function bindArchTail(k,base,spines,links,mobile){
  const path=[[0,0,0,.155,.127]];
  for(const [i,[x,y,z]] of spines.entries()){
    const [X,Y,Z]=path.at(-1),w=.167*(1-i*.11);
    path.push([X+x,Y+y,Z+z,w,w*.73]);
  }
  const curve=new T.CatmullRomCurve3(path.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.43);
  const geo=sculptVolume(path,{sides:mobile?11:16,rings:mobile?45:64,section:2.37,ridge:.26,fur:true,seed:91});
  const {uv,color}=geo.attributes,indices=[],weights=[];
  for(let i=0;i<uv.count;i++){
    const row=uv.getY(i),u=uv.getX(i),t=curve.getUtoTmapping(row)*(links.length-1);
    const segment=Math.min(links.length-2,Math.floor(t));
    const mix=T.MathUtils.smoothstep(t-segment,0,1);
    indices.push(segment,segment+1,0,0);weights.push(1-mix,mix,0,0);
    const pattern=.60+.31*row+Math.cos(u*Math.PI*2)**2*.20;
    const center=color.getX(i);
    color.setXYZ(i,center*pattern*.96,center*pattern*.98,center*pattern*1.015);
  }
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  const mesh=new T.SkinnedMesh(geo,k.materials.windPelt);
  mesh.name='檮杌 · 連續蒙皮尾軸';
  mesh.frustumCulled=false;
  base.add(mesh);
  base.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(links);
  mesh.bind(skeleton,mesh.matrixWorld);
  return skeleton;
}

export function sculptWindTaowu(k,entry,mobile){
  const body=k.bone(k.root,0,.806,0),head=k.bone(body,0,.638,.718);
  flesh(k,body,'windFur',[[0,.125,-.837,.266,.235],[0,.211,-.604,.403,.344],
    [0,.253,-.190,.454,.390],[0,.302,.221,.500,.389],[0,.426,.480,.408,.302],
    [0,.592,.664,.298,.263]],mobile,10);
  const {jaw,curls}=taowuHead(k,head,mobile);
  const legs=sides.flatMap(side=>[true,false].map(front=>taowuLeg(k,body,side,front,mobile)));
  const mantle=[],tailLinks=[];
  for(const side of sides){
    const p=path=>flip(side,path);
    for(let i=0;i<6;i++){
      const t=i/5,joint=k.bone(body,side*(.045+t*.067),.641-t*.238,.470-t*1.092);
      const span=.421+Math.sin(t*2.8)*.215;
      const plate=p([[.007,.082,.089],[span*.46,.133,.042],[span*.79,.093,-.111],
        [span,.018,-.194],[span*.83,-.157,-.215],[span*.42,-.088,-.145],[.031,-.018,-.089]]);
      shell(k,joint,i%2?'windVerdigris':'windScale',plate,.049);
      line(k,joint,i%2?'windPelt':'windBlue',plate.slice(1,6).map(([x,y,z])=>[x+side*.008,y+.031,z+.008,.020]),14);
      k.geometry(joint,'windFur',featherVane(...p([[span*.49,.034,.006],[span*.90,-.058,-.101],
        [span*1.12,-.250,-.291]]),.121-t*.031,i+214,mobile?8:12));
      mantle.push({joint,side,t});
    }
    const count=mobile?9:13;
    for(let i=0;i<count;i++){
      const t=i/(count-1),x=.134+.112*Math.sin(t*2.24),z=.467-t*1.19,y=.67-.17*t;
      const drape=k.bone(body,side*x,y,z);
      drape.name='檮杌 · 烏銀鬃披';
      const drop=.463+.25*Math.sin(t*2.23),width=.080+t*.02;
      mantleLocks(k,drape,i%4===0?'windPeltFade':i%3===0?'windPeltLight':'windPelt',[[.063,.060,.052,width*.62,.039],
        [.241,-.021,.007,width,.065],[.357,-.179,-.078,width*.92,.051],[.414,-drop*.67,-.119,width*.63,.045],
        [.383,-drop,-.193,width*.18,.023],[.344,-drop+.023,-.281,.004,.005]],mobile,i+70,side);
      mantle.push({joint:drape,side,t});
    }
  }
  const tailAnchor=k.bone(body,0,.122,-.790);
  let joint=tailAnchor;
  const links=[[.052,.102,-.191],[.056,.212,-.166],[.018,.236,-.033],[-.038,.228,.153],[-.078,.125,.242],[-.114,-.026,.269]];
  for(let i=0;i<=links.length;i++){
    const previous=i?links[i-1]:[0,0,0],bone=new T.Bone();
    bone.position.set(...previous);
    joint.add(bone);
    joint=bone;
    tailLinks.push(joint);
    if(i===links.length)break;
    const [x,y,z]=links[i];
    const w=.169*(1-i*.079);
    joint.name='檮杌 · 拱尾 '+(i+1);
    for(const side of sides){
      const end=.215*(1-i*.058);
      if(i<3)splitRuff(k,joint,i%2?'windPelt':'windPeltFade',flip(side,[[.024,w*.38,.023,.049,.025],
        [.087,(w+y)*.61,z*.45,.058,.030],[.146,y*.91,z*.81,.057,.026],
        [.170,y+.081,z+Math.sign(z)*end*.62,.035,.017],[.164,y+.066,z+Math.sign(z)*end,.004,.004]]),mobile,i+92);
      else mantleLocks(k,joint,i%2?'windPelt':'windPeltFade',[[.023,w*.35,.014,.041,.023],
        [.073,(w+y)*.49,z*.37,.054,.027],[.116,y*.85,z*.77,.059,.027],
        [.140,y+.058,z+Math.sign(z)*end*.71,.031,.016],[.143,y+.04,z+Math.sign(z)*end,.003,.004]],mobile,i+91,side);
    }
  }
  const tailSkeleton=bindArchTail(k,tailAnchor,links,tailLinks,mobile);
  const skin=bossSkin(k,mobile,tools=>{
    for(const {paw,side,front} of legs)tools.silk(paw,entry.name+' · 踝鬚',flip(side,[[.071,.021,.131,.026],
      [.155,-.074,.175,.041],[.186,-.122,.248,.045],[.172,-.094,.293,.031],[.118,-.027,.324,.007]]),
    {tint:0x6a758b,trim:0xabb7bb,phase:side+(front?.42:.94),style:'mane',flex:1.15,across:[.07,.45,.82]});
    const streams=mobile?4:6;
    for(let i=0;i<streams;i++){
      const fan=i/(streams-1)*2-1,lift=.031*Math.sin(i*1.67);
      tools.silk(joint,entry.name+' · 柔尾尖',[[fan*.031,.080,.032,.039],[fan*.062,.106+lift,.195,.044],
        [fan*.077+.022,.057+lift,.331,.039],[fan*.091-.016,-.099+lift,.459,.027],
        [fan*.131-.126,-.268+fan*.071,.493-fan*.041,.003]],
      {tint:i%2?0x62676b:0x879093,trim:i%2?0x959ea4:0xc6c9c4,phase:.74+i*.21,style:'mane',flex:1.14+i*.034,across:[.72,.55,.14]});
    }
    return true;
  });
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'gallop',windTaowu:true,grounded:true,sourceSculpt:true,skin,
    disposeRig:()=>tailSkeleton.dispose(),
    polishEnergy:{tint:0x91def7,shape:'ribbons',anchor:body,offset:[0,.44,.13],span:[.94,.77,.87]},
    cataloguePose({beat,headtime,wind,strike,travel,step,fall,stage}){
      body.rotation.x=-.13*wind+.22*strike+.09*Math.sin(step*1.84)*travel+fall*.19;
      head.rotation.set(wind*.26-strike*.51+.059*Math.sin(headtime*3.1),Math.sin(beat*.6)*.12-strike*.24,0);
      jaw.rotation.x=.056+wind*.34+strike*.69+stage*.073;
      for(const {curl,side} of curls)curl.rotation.y=side*(wind*.12-strike*.23+Math.sin(beat*.85)*.091);
      for(const {hip,hock,paw,side,front} of legs){
        const gait=Math.sin(step+(front?0:Math.PI)+side*Math.PI*.56);
        hip.rotation.x=gait*travel*.59+wind*.21-strike*(front?.48:.22);
        hip.rotation.z=side*(fall*.38+strike*.058);
        hock.rotation.x=-Math.max(0,gait)*travel*.47+wind*.25+fall*.22;
        paw.rotation.x=Math.max(0,-gait)*travel*.28-strike*.27;
      }
      for(const {joint,side,t} of mantle){
        joint.rotation.y=side*(wind*.073-strike*.126+Math.sin(beat*.81+t*4.4)*travel*.079);
        joint.rotation.z=side*(Math.sin(beat*.91+t*2.93)*.065+wind*.08-strike*.13);
      }
      for(const [i,link] of tailLinks.entries()){
        link.rotation.y=Math.sin(beat*.68-i*.64)*(.061+travel*.11)+strike*.045;
        link.rotation.x=Math.sin(beat*.52+i*.68)*.046+wind*.038-strike*.066;
      }
    }};
}
