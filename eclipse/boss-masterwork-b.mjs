import * as T from '../three.min.mjs';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {sculptPao} from './pao-sculpt.mjs?v=chiaroscuro-1';

const sides=[-1,1],TAU=2*Math.PI;
const mirror=(side,points)=>points.map(([x,...tail])=>[x*side,...tail]);
const available=(k,finish,fallback)=>k.materials[finish]?finish:fallback;
const cast=(k,node,finish,points,depth=.037)=>k.sculpt.plate(node,finish,points,depth,depth*.29);
const sweep=(k,node,finish,points,steps=9)=>k.sculpt.sweep(node,finish,points,{steps,sides:6,ridge:.14});
const relief=(k,node,finish,points,mobile,section=2.4)=>k.geometry(node,finish,
  sculptVolume(points,{rings:mobile?9:13,sides:mobile?8:11,section,ridge:.21}));
const crest=(k,node,finish,a,b,c,w,seed,mobile)=>k.geometry(node,finish,
  featherVane(a,b,c,w,seed,mobile?7:10));
const name=(node,title)=>(node.name=title,node);
const pin=(k,node,finish,[x,y,z],r=.016)=>k.mesh(node,'gem',finish,x,y,z,r,r*.91,r*.66);

function bind(parts,apply){
  const before=parts.finishPose;
  parts.finishPose=pose=>{before?.(pose);apply(pose);};
}

// A domed, double-sided forging with an irregular cutting edge. The recess between
// the two channels is stamped into the geometry and catches light from either side.
function die(k,node,finish,border,points,mobile,options={}){
  const {depth=.038,camber=.070,back=false,scar=.9,compact=false}=options;
  const center=points.reduce((sum,pt)=>sum.add(new T.Vector3(...pt)),new T.Vector3()).multiplyScalar(1/points.length);
  const cycle=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),true);
  const samples=points.length*(mobile||compact?2:3);
  const radii=mobile||compact?[.0,.30,.73,.90,1]:[.0,.26,.55,.78,.908,1],count=radii.length;
  const positions=[],uv=[],rgb=[],indices=[],t=back?-1:1;
  const tip=new T.Vector3();
  const full=count* samples;
  for(const face of sides){
    for(let row=0;row<count;row++)for(let i=0;i<samples;i++){
      const u=i/samples,r=radii[row],beat=Math.sin(u*TAU*4.0+.70)*.62+Math.cos(u*TAU*7.0)*.38;
      const groove=scar*Math.sin(u*TAU*2.0-r*5.8)*Math.sin(r*Math.PI)*.018;
      cycle.getPoint(u,tip);
      tip.lerp(center,1-r);
      tip.z+=t*(face*depth*.50+Math.pow(1-r,1.7)*camber+groove+(row===count-3?-.007:.008)*beat);
      positions.push(...tip.toArray());uv.push(u,r);
      const pigment=(face===1?.82:.49)+beat*.096+(row===count-2?.15:row===count-3?-.11:0);
      rgb.push(pigment,pigment*.982,pigment*.966);
    }
  }
  const facing=points.reduce((area,[x,y],i)=>{
    const next=points[(i+1)%points.length];return area+x*next[1]-next[0]*y;
  },0)<0?-1:1;
  for(const side of sides){
    const offset=side===1?full:0,flip=side*facing*t>0;
    for(let row=0;row<count-1;row++)for(let i=0;i<samples;i++){
      const a=offset+row*samples+i,b=offset+row*samples+(i+1)%samples;
      const c=a+samples,d=b+samples;
      if(flip)indices.push(a,c,b,b,c,d);else indices.push(a,b,c,b,d,c);
    }
  }
  for(let i=0;i<samples;i++){
    const a=full-samples+i,b=full-samples+(i+1)%samples;
    indices.push(a,b,a+full,b,b+full,a+full);
  }
  const mesh=new T.BufferGeometry();
  mesh.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  mesh.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  mesh.setAttribute('color',new T.Float32BufferAttribute(rgb,3));
  mesh.setIndex(indices);mesh.computeVertexNormals();k.geometry(node,finish,mesh);
  const gauge=points.map((pt,i)=>[pt[0],pt[1],pt[2]+depth*.57*t,i%3===0?.012:.009]);
  gauge.push([...gauge[0]]);
  sweep(k,node,border,gauge,mobile?8:13);
}

const court={
  m081:{face:[.180,.251,.06,.085,.135],side:[.28,.33,-.28,.245],crown:'hook',finish:'bOxide',rim:'bTrim',seal:'flame'},
  m082:{face:[.174,.234,.064,.073,.167],side:[.29,.30,-.29,.256],crown:'veil',finish:'bOxide',rim:'bBone',seal:'droplet'},
  m083:{face:[.158,.226,.060,.065,.133],side:[.254,.27,-.27,.218],crown:'blade',finish:'bMetal',rim:'bInlay',seal:'mirror'},
  m084:{face:[.168,.228,.067,.068,.142],side:[.269,.24,-.32,.229],crown:'blade',finish:'bOxide',rim:'bTrim',seal:'arrow'},
  m085:{face:[.140,.237,.059,.067,.167],side:[.303,.44,-.33,.25],crown:'flame',finish:'body',rim:'trim',seal:'flame'},
  m086:{face:[.133,.215,.061,.065,.151],side:[.269,.38,-.31,.23],crown:'veil',finish:'body',rim:'edge',seal:'droplet'},
  m087:{face:[.149,.233,.062,.073,.167],side:[.331,.40,-.34,.248],crown:'blade',finish:'deep',rim:'trim',seal:'arrow'},
  m088:{face:[.145,.230,.059,.065,.167],side:[.291,.36,-.32,.255],crown:'leaf',finish:'body',rim:'trim',seal:'leaf'},
  m089:{face:[.187,.249,.059,.079,.159],side:[.28,.31,-.28,.21],crown:'hook',finish:'bOxide',rim:'bInlay',seal:'flame',mount:'flame'},
  m090:{face:[.180,.240,.058,.071,.146],side:[.27,.33,-.27,.22],crown:'veil',finish:'bMetal',rim:'bBone',seal:'droplet',mount:'droplet'},
  m091:{face:[.179,.238,.061,.075,.144],side:[.28,.3,-.29,.23],crown:'leaf',finish:'bOxide',rim:'bTrim',seal:'leaf',mount:'leaf'},
  m092:{face:[.183,.247,.067,.075,.166],side:[.30,.29,-.30,.23],crown:'blade',finish:'bMetal',rim:'bInlay',seal:'arrow',mount:'arrow'},
  m093:{face:[.172,.245,.061,.068,.146],side:[.29,.31,-.25,.22],crown:'veil',finish:'bMetal',rim:'bBone',seal:'mirror',mount:'mirror'},
  m094:{face:[.188,.258,.058,.082,.159],side:[.29,.30,-.30,.235],crown:'hook',finish:'bOxide',rim:'bTrim',seal:'mask',mount:'mask'},
  m097:{face:[.156,.222,.041,.070,.157],side:[.29,.37,-.32,.235],crown:'blade',finish:'rind',rim:'mica',seal:'mirror'},
  m099:{face:[.198,.255,.050,.083,.184],side:[.37,.36,-.40,.282],crown:'hook',finish:'bOxide',rim:'bBone',seal:'droplet'},
  m100:{face:[.147,.223,.061,.066,.138],side:[.279,.37,-.32,.219],crown:'veil',finish:'bOxide',rim:'bBone',seal:'droplet'},
  m101:{face:[.168,.218,.068,.072,.119],side:[.33,.32,-.30,.26],crown:'cotton',finish:'deep',rim:'trim',seal:'leaf'},
  m102:{face:[.190,.237,.057,.083,.157],side:[.355,.39,-.38,.261],crown:'hook',finish:'bOxide',rim:'bTrim',seal:'mask'},
  m104:{face:[.184,.231,.053,.077,.155],side:[.381,.43,-.40,.272],crown:'stone',finish:'bMetal',rim:'bInlay',seal:'arrow'},
  m105:{face:[.138,.211,.063,.064,.129],side:[.281,.34,-.30,.236],crown:'cotton',finish:'bCloth',rim:'bInlay',seal:'mirror'},
  m107:{face:[.153,.234,.061,.072,.137],side:[.326,.40,-.34,.26],crown:'captain',finish:'rind',rim:'trim',seal:'anchor'},
  m109:{face:[.171,.244,.060,.074,.151],side:[.32,.35,-.303,.239],crown:'cotton',finish:'rind',rim:'trim',seal:'flame'},
  m110:{face:[.192,.253,.056,.080,.173],side:[.381,.38,-.37,.26],crown:'hook',finish:'bMetal',rim:'bInlay',seal:'mask'},
  m112:{face:[.160,.225,.066,.066,.150],side:[.289,.39,-.327,.242],crown:'stone',finish:'bOxide',rim:'bTrim',seal:'mirror'},
  m113:{face:[.194,.269,.058,.08,.155],side:[.345,.32,-.371,.262],crown:'hook',finish:'rind',rim:'ember',seal:'flame'},
  m117:{face:[.218,.256,.056,.090,.163],side:[.38,.31,-.37,.26],crown:'hook',finish:'body',rim:'trim',seal:'mask'},
  m118:{face:[.154,.226,.058,.071,.150],side:[.267,.36,-.297,.20],crown:'cotton',finish:'identityMetal',rim:'trim',seal:'flame'},
  m119:{face:[.178,.247,.069,.068,.166],side:[.333,.36,-.35,.27],crown:'blade',finish:'identityMetal',rim:'edge',seal:'droplet'},
  m120:{face:[.215,.256,.076,.078,.190],side:[.39,.34,-.365,.31],crown:'elephant',finish:'rind',rim:'edge',seal:'leaf'},
  m122:{face:[.155,.228,.062,.067,.143],side:[.267,.31,-.31,.22],crown:'veil',finish:'body',rim:'trim',seal:'droplet'},
  m123:{face:[.161,.253,.060,.064,.150],side:[.34,.40,-.35,.246],crown:'flame',finish:'identityMetal',rim:'trim',seal:'arrow'},
  m124:{face:[.213,.265,.049,.086,.158],side:[.365,.37,-.37,.272],crown:'hook',finish:'body',rim:'trim',seal:'flame'},
  m125:{face:[.211,.264,.054,.083,.159],side:[.355,.36,-.36,.254],crown:'blade',finish:'body',rim:'edge',seal:'arrow'},
};

const marks={
  flame:[[-.66,-.76],[-.49,-.27],[-.41,.16],[-.16,.02],[.04,.84],[.34,.28],[.30,.03],[.57,.17],[.61,-.35],[.38,-.76]],
  droplet:[[-.52,-.34],[-.58,-.003],[-.24,.40],[.01,.95],[.29,.41],[.56,.043],[.56,-.38],[.22,-.67],[-.23,-.62],[-.52,-.34]],
  mirror:[[-.75,0],[-.27,.28],[0,.84],[.27,.28],[.74,0],[.27,-.27],[0,-.84],[-.27,-.27],[-.75,0]],
  arrow:[[-.51,-.51],[-.64,-.26],[-.25,.04],[-.09,.37],[0,.79],[.09,.37],[.25,.04],[.64,-.26],[.51,-.54],[0,-.17],[-.51,-.51]],
  leaf:[[-.57,-.54],[-.58,-.06],[-.24,.27],[.06,.24],[.50,.73],[.54,.23],[.46,-.31],[.06,-.53],[-.57,-.54]],
  mask:[[-.70,-.61],[-.66,.39],[-.23,.66],[0,.39],[.23,.66],[.67,.40],[.69,-.60],[.30,-.53],[.21,-.70],[-.21,-.70],[-.30,-.52],[-.70,-.61]],
  anchor:[[-.67,-.29],[-.40,-.57],[0,-.61],[.40,-.57],[.67,-.29],[.45,-.20],[0,-.38],[0,.65],[-.28,.41],[.28,.41]],
};

function cutMarks(k,node,finish,mark,[x,y,z],scale,front,mobile){
  const [w,h]=scale,t=front?1:-1;
  const path=marks[mark].map(([a,b],i)=>[x+a*w,y+b*h,z+(a*a*.014-b*.008)*t,i%3===0?.009:.012]);
  sweep(k,node,finish,path,mobile?12:18);
}

function faceProfiles(k,head,design,mobile){
  const {face:[wide,z,eyeline,lift,reach],crown,finish,rim,seal}=design;
  const metal=available(k,finish,'body'),border=available(k,rim,'trim'),shadow=available(k,'bOxide','deep');
  const bone=available(k,'bBone','edge');
  const exposed=['cotton','captain'].includes(crown),living=available(k,'bFlesh',available(k,'identityHide','edge'));
  for(const side of sides){
    const s=x=>side*x;
    const orbit=mirror(side,[[wide*.17,eyeline-.044,z+.025],[wide*.38,eyeline-.054,z+.017],
      [wide*.61,eyeline-.042,z-.002],[wide*.79,eyeline+.020,z-.045],
      [wide*.62,eyeline+.047,z-.019],[wide*.31,eyeline+.034,z+.017]]);
    if(!exposed)cast(k,head,shadow,orbit,.015);
    const eyebrow=mirror(side,[[wide*.18,eyeline+.028,z+.038,.012,.011],[wide*.42,eyeline+.056,z+.038,.027,.018],
      [wide*.71,eyeline+.083,z+.017,.028,.021],[wide*.93,eyeline+.071,z-.074,.022,.015],
      [wide*1.05,eyeline+.045,z-.119,.005,.004]]);
    relief(k,head,exposed?living:metal,eyebrow,mobile);
    if(!exposed){
      sweep(k,head,border,eyebrow.map(([x,y,z,r])=>[x,y+.004,z+.022,r*.46]));
      sweep(k,head,'glow',mirror(side,[[wide*.27,eyeline+.004,z+.033,.004],[wide*.44,eyeline+.006,z+.032,.010],
        [wide*.57,eyeline+.014,z+.021,.013],[wide*.69,eyeline+.022,z-.000,.002]]),8);
    }
    if(crown!=='elephant'){
      const cheek=mirror(side,[[wide*.39,eyeline-.070,z+.036,.013,.014],[wide*.58,eyeline-.065,z+.020,.034,.026],
        [wide*.86,eyeline-.048,z-.020,.040,.031],[wide,eyeline-.027,z-.102,.031,.021],
        [wide*.97,eyeline-.036,z-.153,.008,.006]]);
      relief(k,head,exposed?living:metal,cheek,mobile,2.20);
    }
    if(!exposed){
      const fork=crown==='hook'?.064:crown==='flame'?.052:.033;
      const fin=mirror(side,[[wide*.65,.112,z-.111],[wide*1.09,.142+lift,z-.15],
        [wide*1.27,.088,z-.21],[wide*1.16,-.082,z-.237],[wide*.80,-.161-fork,z-.124],
        [wide*.48,-.180-fork,z+.011],[wide*.53,-.114,z+.023],[wide*.78,-.049,z-.030]]);
      die(k,head,metal,border,fin,mobile,{depth:.025,camber:.034});
      pin(k,head,border,[s(wide*.96),-.049,z-.126],.013);
    }
    const nape=mirror(side,[[.013,.195,-reach*.89],[wide*.68,.243,-reach*.96],[wide*1.08,.195,-reach*.64],
      [wide*1.12,.080,-reach*.51],[wide*.83,.019,-reach*1.02],[wide*.37,.044,-reach*1.15],[.013,.094,-reach*1.04]]);
    if(crown==='captain'||crown==='cotton'){
      sweep(k,head,border,nape.slice(1,5).map(([x,y,z],i)=>[x,y,z,[.008,.024,.022,.005][i]]));
    }else die(k,head,metal,border,nape,mobile,{back:true,depth:.022,camber:.033});
    if(crown==='hook'||crown==='leaf'||crown==='blade'||crown==='flame'){
      const lean=crown==='blade'?.81:crown==='leaf'?1.34:1.02;
      relief(k,head,crown==='hook'?bone:metal,mirror(side,[[wide*.82,.222,-.103,.034,.034],
        [wide*1.27,.284+lift,-.189,.043,.030],[wide*lean*1.68,.302+lift,-.255,.031,.020],
        [wide*1.91*lean,.309+lift*1.56,-.329,.002,.004]]),mobile,2.48);
    }
  }
  if(!exposed&&crown!=='elephant'){
    const nose=[[0,.124,z+.019,.019,.016],[.001,.080,z+.057,.026,.017],[.003,.019,z+.065,.030,.035],
      [.003,-.018,z+.037,.019,.019],[0,-.062,z+.026,.007,.006]];
    relief(k,head,border,nose,mobile,3.01);
    sweep(k,head,shadow,[[-wide*.48,-.141,z+.030,.004],[0,-.156,z+.052,.012],[wide*.48,-.14,z+.029,.004]],8);
  }
  if(seal==='mask'||seal==='flame'){
    for(const side of sides)for(let i=0;i<2;i++){
      const x=.059+i*.025;
      sweep(k,head,bone,mirror(side,[[x,-.137,z+.025,.014],[x*1.09,-.181+i*.015,z+.049,.016],
        [x*1.21,-.209+i*.020,z+.024,.003]]),7);
    }
  }
}

const exposedFaces={
  m101:{skin:'rind',hair:'crest',kind:'penitent',brow:[.130,.061,.203],mouth:[.061,-.122,.213],cheek:.72,chin:.61,locks:4},
  m105:{skin:'bFlesh',hair:'bShadow',kind:'ascetic',brow:[.121,.059,.217],mouth:[.052,-.123,.223],cheek:.72,chin:.67,locks:2},
  m107:{skin:'edge',hair:'deep',kind:'captain',brow:[.141,.062,.216],mouth:[.075,-.122,.232],cheek:.85,chin:.76,locks:4},
  m109:{skin:'brocade',hair:'crest',kind:'yaksha',brow:[.159,.078,.228],mouth:[.073,-.141,.232],cheek:.93,chin:1.02,locks:7},
  m118:{skin:'identityHide',hair:'deep',kind:'muzzle',brow:[.138,.068,.232],mouth:[.079,-.131,.252],cheek:.88,chin:.67,locks:4},
};

function exposedFace(k,parts,mobile,design){
  const {head}=parts,{brow:[w,y,z],mouth:[m,mh,mz],cheek,chin,locks,kind}=design;
  const flesh=available(k,design.skin,'edge'),hair=available(k,design.hair,'deep');
  const cheekRig=name(k.bone(head,0,0,.014),'Upper face and expression');
  const lower=name(k.bone(head,0,-.083,.047),'Mandible and beard');
  const seal=kind==='penitent'||kind==='ascetic';
  const tense=kind==='ascetic'||kind==='yaksha';
  const tilt=kind==='captain'?-.035:kind==='muzzle'?-.021:tense?.026:.009;
  for(const side of sides){
    const path=points=>mirror(side,points);
    const brow=path([[w*.27,y+.032,z+.029,.012,.009],[w*.53,y+.055,z+.023,.025,.018],
      [w*.76,y+.058+tilt,z-.016,.027,.020],[w*.98,y+.037+tilt,z-.047,.018,.013],
      [w*1.07,y+.011+tilt,z-.112,.004,.003]]);
    relief(k,cheekRig,flesh,brow,mobile,2.22);
    sweep(k,cheekRig,hair,brow.slice(0,4).map(([x,yy,zz,r])=>[x,yy-.012,zz+.020,r*.41]),9);
    const socket=path([[w*.23,y+.005,z+.024],[w*.48,y+.018,z+.018],[w*.69,y+.012+tilt,z-.005],
      [w*.91,y-.011+tilt,z-.037],[w*.69,y-.018,z-.012],[w*.44,y-.018,z+.014]]);
    cast(k,cheekRig,'deep',socket,.011);
    sweep(k,cheekRig,flesh,socket.slice(0,4).map(([x,yy,zz],i)=>[x,yy+.001,zz+.015,[.003,.009,.010,.002][i]]));
    pin(k,cheekRig,'glow',[side*w*.51,y+.002,z+.036],kind==='muzzle'?.012:.009);
    const high=kind==='yaksha'?-.032:kind==='penitent'?-.05:-.039;
    relief(k,cheekRig,flesh,path([[w*.32,high-.024,z+.017,.014,.012],[w*.57,high,z+.020,.028*cheek,.024],
      [w*.92,high+.023,z-.023,.033*cheek,.027],[w*1.1,high+.031,z-.080,.026,.025],
      [w*1.07,high-.022,z-.143,.004,.004]]),mobile);
    sweep(k,cheekRig,'deep',path([[w*.77,high-.035,z+.019,.003],[w*.86,high-.048,z+.011,.006],
      [w*.95,high-.073,z-.013,.005],[w*.91,high-.093,z-.030,.002]]),7);
    const lip=path([[0,mh+.082,mz-.027,.008],[m*.49,mh+.074,mz-.016,.012],
      [m*.88,mh+.073-tilt*.25,mz-.026,.010],[m*1.13,mh+.084-tilt*.62,mz-.052,.002]]);
    sweep(k,lower,'deep',lip,7);
    relief(k,lower,flesh,path([[m*.043,mh+.027,mz-.03,.014,.016],[m*.73,mh+.036,mz-.026,.029,.031],
      [m*1.41,mh+.052,mz-.051,.036,.030],[w*.95,mh+.082,mz-.126,.024,.024],
      [w*1.13,mh+.112,mz-.178,.005,.004]]),mobile,2.38);
    if(!seal)for(let i=0;i<(mobile?Math.max(3,locks-2):locks);i++){
      const f=i/(locks-1),span=kind==='yaksha'?.241:kind==='captain'?.136:.082;
      relief(k,lower,hair,path([[m*(.22+f),mh+.044+f*.032,mz-.052,.014,.013],
        [m*(.43+f*.86),mh-.031*(1-f),mz-.007+f*.019,.021,.017],
        [m*(.48+f*.89),mh-.065-span*chin*(1-f*.78),mz-.034+f*.039,.009,.010],
        [m*(.30+f),mh-.087-span*chin*(1-f*.74),mz-.048+f*.024,.002,.003]]),mobile,2.10);
    }
    if(kind==='captain'||kind==='yaksha')sweep(k,cheekRig,hair,path([[.012,-.080,mz+.027,.012],
      [.043,-.088,mz+.035,.023],[.091,-.101,mz+.011,.019],[.118,-.084,mz-.009,.008],
      [.124,-.069,mz-.028,.002]]),12);
    const nape=path([[w*.35,.247,-.067,.011],[w*.75,.216,-.143,.022],
      [w*.98,.143,-.175,.026],[w*.96,.065,-.185,.023],[w*.81,-.024,-.154,.004]]);
    sweep(k,head,kind==='captain'?'trim':hair,nape,10);
  }
  const bridge=kind==='muzzle'?.064:kind==='captain'?.048:kind==='penitent'?.036:.032;
  const peak=tense?.074:.056;
  relief(k,cheekRig,flesh,[[0,.122,z+.007,.012,.009],[.003,.07,z+.034,peak*.4,.020],
    [.004,.016,z+bridge,peak*.46,.035],[.004,-.020,z+bridge+.021,peak*.52,.027],
    [0,-.056,z+bridge*.37,peak*.25,.003]],mobile,2.6);
  if(kind==='penitent')sweep(k,head,available(k,'trim','edge'),[[0,.187,z-.039,.008],[0,.159,z-.006,.014],[0,.13,z-.001,.004]],7);
  if(kind==='captain')pin(k,head,'trim',[-.149,-.034,.08],.024);
  if(kind==='muzzle')for(const side of sides)sweep(k,lower,'edge',mirror(side,[[m*.79,.019,mz-.020,.018],
    [m*.85,.059,mz-.003,.015],[m*.93,.086,mz-.006,.002]]),8);
  bind(parts,({beat,wind,strike,stagger})=>{
    lower.rotation.x=Math.sin(beat*.46)*.018+wind*.048+strike*.127+stagger*.061;
    lower.rotation.y=(wind-strike)*.032;
  });
}

function courtCarving(k,parts,mobile,design,expression){
  const {head,body}=parts;
  if(!head||!body)return false;
  const frame=available(k,design.finish,'body'),rim=available(k,design.rim,'trim'),dark=available(k,'bOxide','deep');
  if(expression)exposedFace(k,parts,mobile,expression);
  else faceProfiles(k,head,design,mobile);
  if(parts.fittedPalace||parts.relicGarments||parts.orochiThrall||parts.votiveTailoring)return true;
  const [reach,y,z,span]=design.side,base=head.parent?.isGroup?head.parent:body;
  const back=name(k.bone(base,0,head.position.y*.45+y*.34,z),'Engraved dorsal cuirass');
  for(const side of sides){
    const s=x=>x*side;
    const fins=design.mount?2:design.crown==='veil'?2:3;
    for(let i=0;i<fins;i++){
      const w=reach*(1-i*.14),h=.128-i*.123,offset=-i*.036;
      const shape=mirror(side,[[.035,h+.034,offset-.030],[w*.54,h+.083,offset-.023],[w*.92,h+.059,offset+.06],
        [w*1.17,h-.024,offset+.141],[w*.80,h-.125,offset+.061],[w*.32,h-.106,offset-.072],[.041,h-.054,offset-.091]]);
      die(k,back,i%2?dark:frame,rim,shape,mobile,{back:true,camber:.05,depth:.027});
      pin(k,back,rim,[s(w*.51),h+.012,offset-.067],.017);
    }
  }
  const badge=[[-span*.39,.082,-.092],[0,.142,-.118],[span*.39,.082,-.092],[span*.29,-.092,-.13],
    [0,-.152,-.172],[-span*.29,-.092,-.13]];
  die(k,back,dark,rim,badge,mobile,{back:true,camber:.028,depth:.023});
  cutMarks(k,back,rim,design.seal,[0,.001,-.173],[span*.32,.102],false,mobile);
  bind(parts,({wind,strike,beat})=>{back.rotation.x=Math.sin(beat*.64)*.023+wind*.049-strike*.071;});
  if(design.mount){
    for(const side of sides){
      const panel=name(k.bone(body,side*.29,.18,-.41),'Saddle cantle');
      panel.rotation.y=side*.64;
      const shape=mirror(side,[[-.05,.142,-.093],[.132,.164,-.052],[.258,.043,-.032],
        [.239,-.16,-.112],[.088,-.232,-.17],[-.024,-.13,-.174]]);
      die(k,panel,frame,rim,shape,mobile,{back:true,camber:.043,depth:.033});
      cutMarks(k,panel,rim,design.seal,[side*.084,-.018,-.149],[.086,.103],false,mobile);
    }
  }
  return true;
}

function sea(k,parts,mobile,solar){
  const hub=parts.head.parent;
  const arms=hub.children.filter(node=>node!==parts.head&&node.children.length>0&&node.position.lengthSq()>.0001);
  const segments=solar?10:7;
  const dorsal=name(k.bone(hub,0,.10,-.176),'Spiny dorsal mouth');
  const jaws=name(k.bone(parts.head,0,0,.169),'Radial mouth pincers');
  for(let i=0;i<segments;i++){
    const a=i*TAU/segments,cos=Math.cos(a),sin=Math.sin(a);
    const arm=arms[i];
    const turn=(points,dir)=>points.map(([x,y,z,...r])=>[x*cos-dir*y*sin,x*dir*sin+y*cos,z,...r]);
    const shape=solar?[[0,.132,.018],[.093,.189,.022],[.131,.317,.001],[.062,.392,-.034],
      [-.04,.326,-.039],[-.088,.184,.007]]:[[0,.121,.025],[.086,.177,.025],[.101,.308,-.012],
      [.016,.334,-.042],[-.096,.263,-.005],[-.075,.158,.019]];
    die(k,dorsal,solar?'bMetal':'bCloth',solar?'bTrim':'bBone',turn(shape,1),mobile,
      {back:true,camber:.039,depth:.023,compact:true});
    if(arm){
      const tendon=arm.children.find(node=>node.position.y>.27&&node.position.y<.8);
      for(const side of sides){
        const strand=mirror(side,[[.054,.137,-.088,.026,.015],[.102,.250,-.137,.033,.029],
          [.118,.405,-.114,.022,.026],[.074,.566,-.11,.008,.010]]);
        relief(k,arm,solar?'bMetal':'bInlay',strand,mobile);
        if(tendon)sweep(k,tendon,solar?'bTrim':'bMetal',mirror(side,[[.057,.035,.004,.020],
          [.075,.171,.030,.024],[.063,.31,.113,.016],[.021,.411,.142,.003]]),7);
      }
    }
    sweep(k,jaws,'bBone',turn([[-.075,.151,-.021,.018],[-.051,.107,.015,.024],
      [-.017,.072,.058,.016],[.004,.051,.064,.003]],-1),7);
    pin(k,dorsal,'bInlay',[Math.cos(a)*.187,Math.sin(a)*.187,-.055],.022);
  }
  bind(parts,({beat,strike,stage})=>{
    dorsal.rotation.z=Math.sin(beat*.27)*.07-strike*.12+stage*.1;
  });
}

function livingBeast(k,parts,mobile,tiger){
  const {body,head}=parts;
  const fur=available(k,'bFur','body'),bone=available(k,'bBone','edge');
  for(const side of sides){
    const s=x=>side*x;
    const jaw=mirror(side,[[.05,-.159,.321,.035,.026],[.142,-.161,.315,.060,.044],
      [.25,-.112,.206,.071,.054],[.332,-.058,.052,.060,.051],[.326,-.046,-.101,.012,.010]]);
    relief(k,head,fur,jaw,mobile);
    sweep(k,head,tiger?'bInlay':'bOxide',mirror(side,[[.105,.038,.330,.027],[.156,.053,.313,.031],
      [.241,.094,.207,.033],[.29,.107,.132,.009]]),11);
    for(let i=0;i<3;i++){
      const w=.062+i*.042,z=.36-i*.053;
      sweep(k,head,bone,mirror(side,[[w,-.087,z,.018],[w*1.05,-.137+i*.02,z+.023,.024],
        [w*1.13,-.178+i*.020,z+.036,.003]]),7);
    }
    const ears=tiger?[
      [[.173,.16,-.15],[.251,.336,-.204],[.327,.435,-.259]],
      [[.245,.126,-.219],[.328,.281,-.348],[.399,.359,-.430]],
      [[.278,.085,-.274],[.347,.226,-.423],[.433,.27,-.469]],
    ]:[
      [[.265,.056,-.108],[.417,.126,-.205],[.50,.185,-.217]],
      [[.30,-.028,-.135],[.407,.006,-.269],[.503,.091,-.302]],
    ];
    for (const [i,ear] of ears.entries()){
      const [a,b,c]=mirror(side,ear);
      crest(k,head,i%2?bone:fur,a,b,c,tiger?.109:.086,i+7,mobile);
    }
    for(let i=0;i<(mobile?3:5);i++){
      const z=.18-i*.198,w=.49-i*.039;
      const muscle=mirror(side,[[w*.52,.49,z+.084,.053,.046],[w*.92,.411,z+.037,.079,.065],
        [w*1.1,.31,z-.092,.050,.071],[w*1.12,.159,z-.108,.016,.014]]);
      relief(k,body,i%2===0?fur:'bOxide',muscle,mobile);
      if(tiger)crest(k,body,bone,[s(w*.58),.55,z+.07],[s(w*.75),.582,z-.1],[s(w*.91),.42,z-.23],.086,i+66,mobile);
    }
  }
  if(tiger)fangMantle(k,parts,mobile,false);
}

function fangMantle(k,parts,mobile,spirit){
  const {body,head}=parts;
  const neck=name(k.bone(body,0,.48,.15),spirit?'Tiger spirit collar':'White tiger shoulder mane');
  const fur=available(k,'bFur','body'),dark=available(k,'bOxide','deep'),bone=available(k,'bBone','edge');
  const fans=[];
  for(const side of sides){
    const f=p=>mirror(side,p);
    const x=spirit?.42:.49,front=spirit?.320:.328;
    const upper=f([[.018,.588,front+.061,.043,.036],[.088,.632,front+.051,.065,.047],
      [.218,.682,front+.048,.082,.052],[x*.81,.664,front-.014,.067,.040],
      [x,.573,front-.102,.040,.038],[x*1.09,.473,front-.180,.006,.005]]);
    relief(k,body,spirit?'bFlesh':bone,upper,mobile,2.34);
    sweep(k,body,spirit?'bTrim':dark,upper.map(([px,y,z,r])=>[px,y-.024,z+.026,r*.42]),9);
    for(let i=0;i<3;i++){
      const y=.485-i*.113,w=x*(1-i*.123),z=front-i*.016;
      const ribs=f([[.023,y+.056,z+.019],[w*.46,y+.091,z+.034],[w*.76,y+.058,z+.008],
        [w*1.18,y-.029,z-.116],[w*.96,y-.109,z-.162],[w*.40,y-.069,z+.023],[.028,y-.047,z+.043]]);
      die(k,body,i%2===0?fur:dark,spirit?'bTrim':bone,ribs,mobile,{camber:.047,depth:.031,compact:true,scar:1.22});
    }
    const spline=name(k.bone(neck,side*.142,.211,-.361),'Layered mane at scapula');
    for(let i=0;i<(mobile?5:8);i++){
      const v=i*.067,dx=(i%2)*.028;
      crest(k,spline,i%3===1?fur:bone,[side*(.021+v*.36),.09-v*.46,-.027],
        [side*(.115+v*.84),.026-v*.52,-.07-dx],
        [side*(.21+v*.73),-.09-v*.60,-.18-dx-v*.17],.052+(i%3)*.017,i+67,mobile);
    }
    fans.push({spline,side});
    if(spirit){
      const brow=f([[.028,.068,.249,.014,.014],[.072,.103,.249,.035,.028],
        [.135,.091,.214,.038,.029],[.182,.074,.147,.022,.017],[.186,.017,.097,.004,.004]]);
      relief(k,head,'bBone',brow,mobile,2.64);
      sweep(k,head,'glow',brow.slice(1,4).map(([x,y,z,r])=>[x,y-.023,z+.021,r*.40]),7);
      const cheek=f([[.058,-.048,.281],[.135,-.025,.228],[.194,.005,.134],[.205,-.075,.111],
        [.194,-.174,.164],[.113,-.195,.251],[.072,-.137,.272]]);
      die(k,head,fur,bone,cheek,mobile,{camber:.039,depth:.024,compact:true});
      sweep(k,head,bone,f([[.068,-.123,.283,.025],[.085,-.178,.309,.027],
        [.077,-.218,.318,.018],[.051,-.248,.299,.003]]),9);
    }
  }
  bind(parts,({beat,wind,strike})=>{
    neck.rotation.x=Math.sin(beat*.55)*.036+wind*.053-strike*.097;
    for(const {spline,side} of fans)spline.rotation.z=side*(wind*.083-strike*.142);
  });
}

function eightNecks(k,parts,mobile){
  if(parts.orochiRig)return true;
  const {body}=parts;
  const heads=body.children.map(n=>n.children.find(c=>c.position.y>.55&&c.position.z>.35)).filter(Boolean);
  for(const [index,head] of heads.entries()){
    const mid=heads.length*.5,kind=index<mid?'bTrim':'bBone',jaw=head.children.find(n=>n.position.z>.10&&n.position.y<-.05)??head;
    for(const side of sides){
      const brow=mirror(side,[[.026,.109,.221,.015,.012],[.091,.139,.217,.032,.022],
        [.148,.139,.135,.042,.026],[.189,.121,.058,.021,.016],[.189,.07,.005,.004,.004]]);
      relief(k,head,'bOxide',brow,mobile);
      sweep(k,head,kind,brow.map(([x,y,z,r])=>[x,y+.023,z+.020,r*.39]));
      const cheek=mirror(side,[[.059,-.035,.262],[.161,.077,.164],[.201,.051,.013],
        [.189,-.064,-.053],[.138,-.133,.046],[.080,-.087,.213]]);
      cast(k,head,'bMetal',cheek,.024);
      const f=jaw===head?0:.117,z=jaw===head?0:.133;
      sweep(k,jaw,'bBone',mirror(side,[[.093,-.115+f,.239-z,.014],[.111,-.169+f,.26-z,.019],
        [.077,-.211+f,.323-z,.003]]),7);
    }
  }
  const cap=name(k.bone(body,0,.61,-.485),'Octarch spinal scutes');
  for(let i=0;i<(mobile?3:5);i++){
    const y=-i*.047,z=-i*.135,w=.303-i*.021;
    const shell=[[-w*.46,y+.052,z+.134],[0,y+.084,z+.165],[w*.44,y+.052,z+.134],[w,y-.075,z+.015],
      [w*.79,y-.079,z-.113],[0,y-.024,z-.192],[-w*.73,y-.082,z-.114],[-w,y-.081,z+.017]];
    die(k,cap,i%2?'bCloth':'bOxide','bTrim',shell,mobile,{depth:.036,camber:.09,scar:1.25});
  }
}

function cloudDragon(k,parts,mobile){
  const {body}=parts,head=body.userData.dragonHead??parts.head;
  const stream=[];
  if(!head)return false;
  const neck=head.parent;
  for(const side of sides){
    const whisker=name(k.bone(head,side*.217,-.08,.44),'Dragon whisker');
    sweep(k,whisker,'edge',mirror(side,[[0,0,0,.024],[.227,-.02,.071,.027],[.40,.092,.13,.021],
      [.584,.21,.11,.010],[.746,.28,-.071,.002]]),13);
    stream.push({whisker,side});
    relief(k,head,'deep',mirror(side,[[.055,.06,.382,.031],[.131,.125,.366,.048],
      [.201,.158,.251,.051],[.239,.166,.123,.026],[.232,.126,.091,.007]]),mobile);
    sweep(k,head,'glow',mirror(side,[[.093,.069,.383,.009],[.149,.092,.355,.018],[.211,.117,.274,.008]]),8);
    for(let i=0;i<(mobile?3:6);i++){
      const w=.12+i*.022,h=.48+i*.142,z=-.276-i*.018;
      const path=mirror(side,[[w,h+.12,z],[w+.16,h+.14,z-.11],[w+.259,h+.07,z-.206],
        [w+.17,h-.056,z-.255],[w+.045,h-.08,z-.166],[w-.026,h,z-.114]]);
      cast(k,neck,i%2?'edge':'body',path,.029);
      sweep(k,neck,'trim',path.slice(1,5).map(([x,y,z],j)=>[x,y+.018,z-.023,[.008,.011,.010,.003][j]]),8);
    }
  }
  bind(parts,({beat,wind,strike})=>{
    for(const {side,whisker} of stream){
      whisker.rotation.y=side*(Math.sin(beat*.58)*.11+wind*.31-strike*.37);
      whisker.rotation.x=Math.cos(beat*.68+side*.41)*.115-strike*.19;
    }
  });
  return true;
}

function iceReborn(k,parts,mobile){
  const {pao,head,body}=parts;
  const work=k.sculpt?k:{...k,sculpt:sculptPao(k)};
  for(const side of sides){
    const texture=mirror(side,[[.032,.286,-.159],[.096,.341,-.201],[.199,.264,-.229],
      [.231,.158,-.212],[.135,.083,-.239],[.046,.142,-.249]]);
    die(work,head,'wingEdge','cyan',texture,mobile,{back:true,depth:.019,camber:.037});
    const wing=pao.wings[side<0?0:1];
    for(let i=0;i<(mobile?2:4);i++){
      const x=.176+i*.215,r=.024-i*.003;
      sweep(work,wing,'cyan',mirror(side,[[x,.299+i*.116,-.20,r*.52],[x+.079,.466+i*.111,-.25,r],
        [x+.142,.562+i*.098,-.277,r*.84],[x+.226,.594+i*.088,-.301,.004]]),10);
    }
    const flank=mirror(side,[[.071,.571,-.273],[.217,.581,-.294],[.285,.475,-.225],
      [.262,.322,-.266],[.169,.264,-.361],[.060,.359,-.374]]);
    die(work,body,'body','cyan',flank,mobile,{back:true,depth:.027,camber:.042,scar:1.4});
  }
  if(!k.sculpt)work.sculpt.finish(k.geometry);
}

function twin(k,parts,mobile,yama){
  for(const [index,head] of (parts.heads??[parts.head]).entries()){
    if(!head)continue;
    const body=head.parent,kind=yama?(index?'edge':'body'):(index?'edge':'trim');
    for(const side of sides){
      const wide=index?.135:.175;
      const brow=mirror(side,[[.027,.085,.234,.010],[wide*.48,.111,.231,.020],
        [wide*.78,.103,.195,.019],[wide,.092,.126,.004]]);
      sweep(k,head,kind,brow,8);
      if(yama)sweep(k,head,'edge',mirror(side,[[.051,-.094,.229,.015],[.076,-.151,.280,.023],
        [.067,-.196,.268,.008],[.047,-.22,.263,.003]]),9);
      else crest(k,head,kind,[side*wide*.55,.204,-.102],[side*wide,.281,-.197],[side*wide*1.23,.389,-.19],.058,index+42,mobile);
      const reed=mirror(side,[[.013,.931,-.22],[wide,.941,-.29],[wide*1.74,.859,-.32],
        [wide*1.69,.696,-.32],[wide*.61,.565,-.376],[.017,.665,-.368]]);
      die(k,body,index?'body':'deep',kind,reed,mobile,{back:true,depth:.026,camber:.041});
    }
    cutMarks(k,body,kind,yama?'mask':'leaf',[0,.742,-.411],[.11,.147],false,mobile);
  }
}

function cobra(k,parts,mobile){
  const {head,body}=parts;
  for(const side of sides){
    const s=x=>side*x;
    const width=.425;
    for(let i=0;i<(mobile?3:5);i++){
      const y=.30-i*.137,w=width*(1-Math.abs(i-1)*.083);
      const hood=mirror(side,[[.051,y+.138,-.153],[w*.65,y+.186,-.209],[w*1.17,y+.064,-.135],
        [w*1.215,y-.103,-.126],[w*.46,y-.196,-.303],[.081,y-.127,-.318]]);
      die(k,head,i%2?'rind':'hide','edge',hood,mobile,{back:true,depth:.033,camber:.070});
      sweep(k,head,'trim',mirror(side,[[.026,y+.061,-.336,.013],[w*.34,y+.032,-.305,.026],
        [w*.76,y-.036,-.255,.017],[w,y-.066,-.146,.003]]),8);
    }
    sweep(k,head,'edge',mirror(side,[[.113,.085,.323,.018],[.234,.181,.241,.027],
      [.327,.249,.169,.037],[.433,.267,.092,.006]]),10);
    for(let i=0;i<2;i++)sweep(k,head,'edge',mirror(side,[[.101+i*.04,-.076,.36-i*.05,.020],
      [.111+i*.045,-.153,.37-i*.052,.025],[.071+i*.054,-.204,.391-i*.046,.003]]),8);
  }
  const crestLine=name(k.bone(body,0,1.05,-.472),'Naga dorsal ligaments');
  for(let i=0;i<(mobile?3:5);i++)sweep(k,crestLine,i%2?'edge':'rind',[[0,i*.157,0,.057],
    [.018,i*.157+.11,-.139,.061],[-.013,i*.157+.154,-.217,.028],[0,i*.157+.213,-.25,.003]],8);
}

function spider(k,parts,mobile){
  const {body,head}=parts;
  for(const side of sides){
    const w=side*.26;
    const skull=mirror(side,[[.035,.122,.307],[.101,.158,.247],[.239,.094,.148],[.313,-.031,.142],
      [.288,-.106,.275],[.204,-.118,.375],[.092,-.067,.412]]);
    die(k,head,'rind','edge',skull,mobile,{camber:.034,depth:.029});
    for(let i=0;i<3;i++){
      const path=mirror(side,[[.071+i*.031,-.041,.409-i*.036],[.096+i*.050,-.118,.449-i*.038],
        [.084+i*.062,-.166,.493-i*.051],[.048+i*.064,-.185,.507-i*.059]]);
      sweep(k,head,'edge',path.map(([x,y,z],j)=>[x,y,z,[.019,.025,.016,.003][j]]),8);
    }
    for(let i=0;i<(mobile?4:6);i++){
      const z=-.45-i*.18,y=.51+Math.sin(i*.6)*.17,x=w*(1+Math.sin(i*.68)*.29);
      const flank=k.bone(body,x,y,z);flank.rotation.y=side*.69;
      die(k,flank,i%2?'hide':'rind','trim',[[-.11,.063,.016],[.006,.127,.028],[.12,.088,.017],
        [.157,-.052,-.091],[.039,-.128,-.192],[-.106,-.074,-.102]],mobile,{depth:.025,camber:.064});
      sweep(k,flank,i%2?'trim':'edge',[[.012,.056,0,.029],[side*.065,.159,-.059,.042],
        [side*.091,.234,-.137,.034],[side*.095,.255,-.269,.004]],7);
    }
  }
}

const singular={
  m095:(k,p,m)=>sea(k,p,m,false),m096:(k,p,m)=>sea(k,p,m,true),m098:iceReborn,
  m103:eightNecks,m106:cloudDragon,m108:(k,p,m)=>livingBeast(k,p,m,true),m111:(k,p,m)=>livingBeast(k,p,m,false),
  m114:(k,p,m)=>twin(k,p,m,false),m115:(k,p,m)=>twin(k,p,m,true),m116:cobra,m121:spider,
};

export function masterworkB(k,parts,entry,mobile){
  if(parts.frenzyTiger||parts.asuraCarved||parts.predatorForge||parts.templeSculpt||parts.bullPortrait||parts.valleyFigure)return true;
  const run=singular[entry.id],design=court[entry.id];
  if(run)return run(k,parts,mobile)!==false;
  if(parts.carvedThunder&&entry.id==='m104'){
    faceProfiles(k,parts.head,design,mobile);
    return true;
  }
  if(design)return courtCarving(k,parts,mobile,design,exposedFaces[entry.id]);
  return false;
}
