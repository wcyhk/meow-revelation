import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const clamp=T.MathUtils.clamp;
const mirror=(side,track)=>track.map(([x,...rest])=>[side*x,...rest]);
const shell=(k,j,m,track,mobile,seed=0,ridge=.15)=>
  k.geometry(j,m,sculptVolume(track,{rings:mobile?10:17,sides:mobile?9:13,section:2.42,ridge,seed}));
const seam=(k,j,m,track,mobile)=>
  k.sculpt.sweep(j,m,track,{sides:mobile?5:7,steps:mobile?7:11,ridge:.18});
const plate=(k,j,m,track,depth=.031)=>k.sculpt.plate(j,m,track,depth,depth*.32);

// Lower heads hunt near the ground, while the upper row clears their horns.
// Values are sockets, the intervening bend and the head in trunk coordinates.
const tracks=[
  [[-.42,.35,.51],[-.70,.61,.77],[-1.05,.85,1.11],-.31,.90],
  [[-.15,.38,.63],[-.22,.56,.98],[-.41,.76,1.37],-.09,.88],
  [[.15,.38,.64],[.26,.59,.98],[.44,.83,1.41],.10,.92],
  [[.43,.37,.48],[.70,.63,.79],[1.08,.91,1.08],.32,.95],
  [[-.48,.47,.17],[-.64,.93,.43],[-.86,1.31,.68],-.27,.92],
  [[-.23,.54,.02],[-.29,1.09,.41],[-.31,1.64,.71],-.09,1],
  [[.22,.53,.03],[.29,1.12,.43],[.31,1.60,.78],.09,.97],
  [[.47,.48,.18],[.67,.91,.44],[.88,1.37,.71],.29,.93],
];

function spine(k,body,mobile){
  shell(k,body,'bFlesh',[[0,-.05,-1.25,.19,.253],[0,.055,-.928,.413,.464],[0,.139,-.554,.429,.555],
    [0,.192,-.091,.462,.609],[0,.259,.304,.426,.574],[0,.284,.629,.332,.457],[0,.252,.766,.262,.299]],
  mobile,3.74,.12);
  shell(k,body,'bShadow',[[0,-.093,-1.18,.149,.225],[0,-.141,-.858,.229,.391],[0,-.128,-.432,.244,.396],
    [0,-.075,-.014,.202,.361],[0,.018,.45,.193,.312],[0,.173,.719,.179,.254]],mobile,2.47,.14);
  const scutes=[];
  for(let row=0;row<7;row++){
    const t=row/6,z=.42-t*1.532,y=.62-Math.pow(t,1.48)*.323,w=.408-t*.139;
    const keel=k.bone(body,0,y,z);
    keel.name='Orochi spinal scute '+(row+1);
    const cap=[[-w*.43,.023,.146],[0,.122,.184],[w*.42,.023,.146],[w,-.141,-.002],
      [w*.72,-.096,-.155],[0,.031,-.229],[-w*.72,-.104,-.156],[-w,-.142,-.02]];
    plate(k,keel,row%3?'bOxide':'bMetal',cap,.044);
    seam(k,keel,row%2?'bInlay':'bTrim',[[-w*.42,.029,.154,.015],[0,.134,.181,.027],
      [w*.42,.027,.157,.014],[w*1.01,-.139,.006,.008]],mobile);
    if(row>1)shell(k,keel,row%2?'bBone':'bMetal',[[0,.091,-.019,.050,.083],
      [.02,.218,-.074,.050,.068],[.019,.264,-.208,.030,.035],[.003,.25,-.326,.004,.005]],true,row+.2,.19);
    scutes.push(keel);
    for(const side of sides){
      const ribs=mirror(side,[[w*.43,-.012,.125],[w*.9,-.042,.102],[w*1.37,-.155,.023],[w*1.39,-.256,-.12],
        [w*1.03,-.172,-.162],[w*.60,-.083,-.109]]);
      plate(k,keel,row%2?'bCloth':'bMetal',ribs,.028);
      seam(k,keel,'bInlay',ribs.slice(1,5).map(([x,h,p],i)=>[x,h,p+.025,[.005,.013,.010,.002][i]]),mobile);
    }
  }
  return scutes;
}

function skull(k,bend,offset,i,yaw,size,mobile){
  const head=k.bone(bend,...offset);
  head.name='Orochi head '+(i+1);head.rotation.y=yaw;
  head.scale.setScalar(size);
  const jaw=k.bone(head,0,-.093,.016);
  jaw.name='Orochi hinged jaw '+(i+1);
  const scale=i%3===0?1.10:i%3===1?.92:1;
  shell(k,head,'bOxide',[[0,.028,-.21,.064,.092],[0,.056,-.095,.128,.147],[0,.061,.047,.141,.168],
    [.007,.019,.192,.094,.142],[.003,.004,.333,.072,.123],[0,.002,.415,.049,.084]],
  mobile,i*.857,.119);
  shell(k,jaw,'bShadow',[[0,-.045,-.15,.060,.053],[0,-.060,-.051,.078,.108],
    [0,-.071,.095,.053,.132],[0,-.059,.224,.038,.115],[0,-.025,.393,.023,.055]],mobile,5+i,.103);
  plate(k,head,'bMetal',[[-.081,.118,.312],[0,.146,.349],[.093,.114,.309],[.079,.071,.387],
    [0,.050,.432],[-.061,.062,.393]],.023);
  for(const side of sides){
    const rim=mirror(side,[[.049,.142,.232],[.133,.163,.167],[.181,.116,.065],[.176,.078,-.045],
      [.209,.020,-.154],[.126,-.061,-.12],[.093,-.012,.177],[.058,.071,.293]]);
    plate(k,head,i%2?'bMetal':'bOxide',rim,.036);
    seam(k,head,'bInlay',mirror(side,[[.059,.153,.237,.010],[.124,.175,.164,.018],
      [.169,.133,.06,.016],[.177,.088,-.046,.006]]),mobile);
    plate(k,head,'bShadow',mirror(side,[[.112,.118,.196],[.168,.123,.124],[.164,.079,.125],[.110,.088,.209]]),.018);
    k.mesh(head,'gem','glow',side*.139,.101,.176,.027,.012,.025,0,side*.47,side*.12);
    const horn=mirror(side,[[.119,.094,-.099,.043,.046],[.188,.172,-.188,.051,.042],
      [.236*scale,.183+i*.008,-.299,.030,.029],[.302*scale,.164+i*.01,-.363,.003,.004]]);
    shell(k,head,'bBone',horn,true,i*.741,.18);
    const blade=mirror(side,[[.108,.019,.091],[.172,.044,.026],[.241,.059,-.082],[.271,.012,-.251],
      [.181,-.047,-.153],[.141,-.047,-.018]]);
    plate(k,head,'bMetal',blade,.027);
    for(let tooth=0;tooth<(mobile?3:4);tooth++){
      const x=.112-tooth*.013,z=.119+tooth*.073;
      shell(k,head,'bBone',mirror(side,[[x,-.076,z,.015,.018],[x*.97,-.112-tooth*.004,z+.014,.014,.015],
        [x*.79,-.151+tooth*.005,z+.053,.003,.003]]),true,i+tooth,.104);
    }
    shell(k,jaw,'bBone',mirror(side,[[.088,-.034,.092,.015,.020],[.099,.009,.109,.018,.019],
      [.09,.058,.141,.003,.004]]),true,i+.9);
  }
  return {head,jaw};
}

function cervicalRig(k,body,mobile){
  return tracks.map(([base,knee,tip,yaw,size],i)=>{
    const side=Math.sign(base[0]),tall=i>=4;
    const socket=k.bone(body,...base);
    socket.name='Orochi neck socket '+(i+1);
    const bridge=k.bone(socket,0,0,0);
    bridge.name='Orochi neck root '+(i+1);
    const [dx,dy,dz]=knee.map((v,j)=>v-base[j]);
    const [ex,ey,ez]=tip.map((v,j)=>v-knee[j]);
    const bend=k.bone(bridge,dx,dy,dz);
    bend.name='Orochi mid-neck joint '+(i+1);
    const radius=tall?.137:.152;
    shell(k,socket,'bOxide',[[0,-.164,-.14,radius*.89,radius],[0,-.059,-.071,radius*1.08,radius*1.23],
      [dx*.35,dy*.28,dz*.25,radius,radius*.97]],mobile,i+.61,.22);
    shell(k,bridge,'bFlesh',[[0,-.106,-.14,radius*.86,radius*.91],[dx*.28,dy*.20,dz*.16,radius,radius*1.02],
      [dx*.64,dy*.62,dz*.58,radius*.95,radius*.98],[dx,dy,dz,radius*.86,radius*.85]],mobile,i+.76,.10);
    shell(k,bend,'bCloth',[[ex*-.29,ey*-.31,ez*-.29,radius*.83,radius*.83],[ex*.25,ey*.17,ez*.24,radius*.87,radius*.83],
      [ex*.61,ey*.64,ez*.62,radius*.71,radius*.64],[ex,ey,ez,radius*.70,radius*.69]],mobile,17+i,.14);
    for(const [section,end] of [[bridge,[dx,dy,dz]],[bend,[ex,ey,ez]]]){
      const rows=section===bridge?3:2;
      for(let q=0;q<rows;q++){
        const along=.14+q*.27,[x,y,z]=end.map(v=>v*along);
        const cap=[[x-.088,y+.038,z+.086],[x,y+.054,z+.119],[x+.088,y+.034,z+.086],[x+.102,y-.054,z+.074],
          [x+.041,y-.077,z+.125],[x-.049,y-.078,z+.118],[x-.102,y-.048,z+.074]];
        plate(k,section,q%2?'bMetal':'bOxide',cap,.027);
        if(q<2)shell(k,section,i%3?'bBone':'bMetal',[[x,y+.018,z-.092,.043,.038],
          [x+side*.029,y+.054,z-.179,.048,.045],[x+side*.054,y+.133,z-.244,.003,.004]],true,i+q+.1);
      }
    }
    return {socket,bridge,bend,...skull(k,bend,[ex,ey,ez],i,yaw,size,mobile),yaw,side,tall,i};
  });
}

function plantedLeg(k,body,mobile,side,front){
  const hip=k.bone(body,side*(front?.50:.452),front?.182:.15,front?.306:-.837);
  const name=(front?'fore':'hind')+(side<0?' left':' right');
  hip.name='Orochi '+name+' shoulder socket';
  const upper=front?.429:.415,lower=front?.46:.476;
  const knee=k.bone(hip,0,-upper,0),foot=k.bone(knee,0,-lower,0);
  knee.name='Orochi '+name+' knee';foot.name='Orochi planted '+name+' foot';
  shell(k,hip,'bFlesh',[[side*.024,.176,-.056,.171,.187],[side*.067,.046,.015,.203,.209],
    [side*.029,-upper*.58,.019,.129,.153],[0,-upper,.004,.110,.121]],mobile,front?1.5:4,.16);
  shell(k,knee,'bCloth',[[0,.054,-.018,.111,.114],[side*.015,-.122,.014,.138,.127],
    [side*.032,-lower*.72,.03,.098,.100],[0,-lower,.044,.084,.101]],mobile,4.49,.122);
  shell(k,foot,'bOxide',[[0,.039,-.105,.093,.111],[0,.011,-.029,.117,.132],[.019,-.008,.097,.073,.141],
    [0,-.029,.218,.036,.104]],mobile,4.73,.073);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.064;
    shell(k,foot,'bBone',[[x,-.004,.137,.036,.035],[x*.99,-.017,.211,.031,.031],
      [x*.94,-.062,.285+Math.cos(i)*.018,.005,.006]],true,i+.45,.13);
  }
  for(let i=0;i<3;i++){
    const y=-.055-i*.119;
    plate(k,knee,i%2?'bMetal':'bOxide',[[-.074,y+.066,.101],[.063,y+.067,.117],[.124,y+.008,.041],
      [.085,y-.088,.057],[.022,y-.129,.126],[-.071,y-.068,.123]],.033);
  }
  return {hip,knee,foot,upper,lower,side,front};
}

function buildTail(k,body,side,mobile){
  const bulb=k.bone(body,side*.261,.03,-.951);
  bulb.name='Orochi tail root '+side;
  const hinges=[bulb];
  const segments=[[.12,.081,-.651,.172],[.213,.202,-.639,.117],[.152,.268,-.528,.057]];
  for(let part=0;part<segments.length;part++){
    const joint=hinges[part],[x,y,z,r]=segments[part];
    const end=part===segments.length-1?.009:r*.70;
    shell(k,joint,'bCloth',mirror(side,[[0,-.037,.121,r*.73,r],[x*.32,y*.26,z*.37,r,r*.91],
      [x*.68,y*.67,z*.70,r*.85,r*.73],[x,y,z,end,end]]),mobile,side*.83+part,.14);
    const anchor=y*.252+r*.54;
    shell(k,joint,'bBone',mirror(side,[[x*.32,anchor,z*.37,.045,.060],[x*.42,anchor+.13,z*.47,.043,.042],
      [x*.61,anchor+.191,z*.61,.004,.005]]),true,part+.7,.104);
    if(part<segments.length-1)hinges.push(k.bone(joint,x*side,y,z));
  }
  return {hinges,side};
}

function plantFoot(leg,body,step,travel,wind,strike,fall){
  const {hip,knee,foot,upper,lower,front,side}=leg;
  const phase=step+(side<0?Math.PI:0)+(front?0:Math.PI);
  const load=Math.cos(phase);
  const swing=Math.max(0,Math.sin(phase))*travel;
  const z=hip.position.z+load*travel*.205+(front?.105:-.115)+strike*(front?.109:-.04);
  const lift=swing*.151+(front?wind*.049:0)+fall*.31;
  const y=.075-body.position.y+lift-Math.sin(body.rotation.x)*z;
  const dz=z-hip.position.z,dy=y-hip.position.y;
  const length=clamp(Math.hypot(dy,dz),Math.abs(upper-lower)+.001,upper+lower-.001);
  const dir=Math.atan2(-dz,-dy);
  const sign=front?-1:1;
  const hipAngle=Math.acos(clamp((upper**2+length**2-lower**2)/(2*upper*length),-1,1));
  const jointAngle=Math.acos(clamp((upper**2+lower**2-length**2)/(2*upper*lower),-1,1));
  hip.rotation.set(dir-sign*hipAngle,side*(wind*.041-strike*.038),side*.071);
  knee.rotation.x=sign*(Math.PI-jointAngle);
  foot.rotation.x=-hip.rotation.x-knee.rotation.x-body.rotation.x-swing*.239;
}

export function sculptOrochi(k,entry,mobile){
  const body=k.bone(k.root,0,.618,-.024);
  body.name='Orochi shared ribcage';
  const scutes=spine(k,body,mobile),heads=cervicalRig(k,body,mobile);
  const tails=sides.map(side=>buildTail(k,body,side,mobile));
  const legs=sides.flatMap(side=>[plantedLeg(k,body,mobile,side,true),plantedLeg(k,body,mobile,side,false)]);
  const pose=({headtime,beat,wind,strike,stage,travel,step,fall})=>{
    body.rotation.x=Math.sin(beat*.86)*.023+wind*.09-strike*.157+fall*.144;
    body.rotation.z=Math.sin(step)*.071*travel;
    body.position.y=.618+.023*Math.sin(step*2)*travel+wind*.046-strike*.032;
    for(const {bridge,bend,head,jaw,yaw,side,tall,i} of heads){
      const lunge=Math.max(0,strike-i*.016);
      const drift=Math.sin(headtime*2.15+i*.624);
      bridge.rotation.set(wind*(tall?.15:.094)-lunge*.11,side*(wind*.14-lunge*.092)+drift*.056,side*(stage*.022+wind*.032));
      bend.rotation.set(wind*.15-lunge*.27+drift*.098,side*(wind*.065-lunge*.122),drift*.077);
      head.rotation.set(-wind*.08-lunge*.171+drift*.044,yaw+drift*.064-lunge*side*.052,-side*.021);
      jaw.rotation.x=.036+wind*.41+lunge*.65+.055*Math.max(0,Math.sin(beat*.63+i*.32));
    }
    for(const [i,scute] of scutes.entries())scute.rotation.x=Math.sin(beat*.88-i*.55)*.027+wind*.03-strike*.065;
    for(const {hinges,side} of tails)for(const [i,joint] of hinges.entries()){
      joint.rotation.set(Math.sin(beat*.54-i*.57)*.076-wind*.108+strike*.103,
        side*(Math.sin(beat*.57-i*.69)*.105+wind*.072-lungeTail(strike,i)),side*stage*.035);
    }
    for(const leg of legs)plantFoot(leg,body,step,travel,wind,strike,fall);
  };
  pose({headtime:0,beat:0,wind:0,strike:0,stage:0,travel:0,step:0,fall:0});
  return {body,head:heads[5].head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,orochiRig:true,
    pattern:'gallop',cataloguePose:pose};
}

const lungeTail=(strike,i)=>strike*(.064+i*.041);

export function carveOrochiThrall(k,body,mobile){
  shell(k,body,'bFlesh',[[0,-.151,-.061,.212,.186],[0,.082,-.061,.261,.251],[.014,.308,-.04,.426,.291],
    [.013,.536,-.05,.571,.33],[.005,.709,-.023,.469,.234],[0,.895,-.02,.228,.171]],mobile,4.45,.13);
  const ribs=[];
  for(const side of sides){
    const pec=k.bone(body,side*.123,.513,.226);
    pec.name='Thrall tendon and pectoral';
    shell(k,pec,'bCloth',mirror(side,[[-.07,-.103,.014,.083,.045],[.047,-.052,.051,.119,.082],
      [.213,-.012,.034,.144,.101],[.354,.095,-.086,.089,.075],[.39,.179,-.147,.048,.05]]),mobile,side+.63,.12);
    const back=k.bone(body,side*.258,.582,-.314);
    back.name='Thrall plated shoulder blade';
    shell(k,back,'bFlesh',mirror(side,[[.095,.105,.076,.113,.07],[.123,.07,-.023,.148,.067],
      [.151,-.093,-.041,.112,.078],[.09,-.263,-.033,.059,.041],[-.048,-.34,.018,.04,.036]]),mobile,2.6,.21);
    for(let row=0;row<3;row++){
      const y=-.013-row*.093,w=.127-row*.012;
      const rib=mirror(side,[[.03,y+.037,-.007],[w*.82,y+.064,-.045],[w*1.44,y+.04,-.050],
        [w*1.58,y-.062,-.066],[w*.95,y-.098,-.093],[w*.37,y-.045,-.078]]);
      plate(k,back,row%2?'bOxide':'bMetal',rib,.041);
      seam(k,back,'bInlay',rib.slice(2,6).map(([x,h,z])=>[x,h-.004,z-.033,.009]),mobile);
    }
    for(let row=0;row<3;row++){
      const y=.350-row*.107,edge=.287-row*.039;
      shell(k,body,row%2?'bFlesh':'bCloth',mirror(side,[[.030,y,.211,.048,.045],[edge*.52,y+.019,.246,.074,.059],
        [edge*.93,y+.065,.217,.061,.052],[edge*1.44,y+.085,.116,.037,.039]]),mobile,row*.53+side,.15);
      seam(k,body,'bInlay',mirror(side,[[edge*.70,y+.006,.281,.005],[edge*.97,y+.021,.262,.011],
        [edge*1.12,y+.102,.229,.012],[edge*1.29,y+.112,.176,.003]]),mobile);
    }
    ribs.push({pec,back,side});
  }
  for(let i=0;i<5;i++){
    const z=-.36-i*.009,y=.719-i*.155,w=.104-i*.006;
    plate(k,body,i%2?'bMetal':'bOxide',[[-w,y+.077,z],[0,y+.11,z-.041],[w,y+.076,z],
      [w*.68,y-.064,z-.021],[0,y-.104,z-.089],[-w*.68,y-.064,z-.021]],.045);
    seam(k,body,'bInlay',[[-w*.48,y+.036,z-.044,.010],[0,y+.05,z-.072,.015],
      [w*.40,y+.031,z-.044,.010]],mobile);
  }
  const arms=limbs=>{
    for(const {root,elbow,hand,side} of limbs){
      shell(k,root,'bFlesh',mirror(side,[[0,.12,-.051,.092,.101],[.071,.018,-.02,.172,.144],
        [.105,-.168,.043,.138,.124],[.121,-.36,.049,.088,.095]]),mobile,1.63,.16);
      shell(k,elbow,'bCloth',mirror(side,[[0,.037,.047,.076,.07],[.039,-.043,.082,.146,.122],
        [.06,-.165,.107,.147,.127],[.057,-.31,.127,.094,.086]]),mobile,6.70,.14);
      for(let i=0;i<3;i++){
        const y=-.121-i*.071;
        plate(k,elbow,i%2?'bMetal':'bOxide',mirror(side,[[-.056,y+.063,.135],[.064,y+.091,.211],
          [.158,y+.027,.188],[.194,y-.116,.144],[.063,y-.105,.244],[-.062,y-.097,.181]]),.037);
      }
      shell(k,hand,'bFlesh',mirror(side,[[0,.067,.026,.058,.063],[.011,.018,.062,.078,.075],
        [.035,-.051,.111,.087,.059],[.036,-.099,.14,.048,.042]]),mobile,11.2,.10);
      for(let i=0;i<4;i++){
        const x=(i-1.5)*.036;
        shell(k,hand,'bBone',[[x,-.044,.152,.019,.017],[x+.008,-.092,.175,.019,.017],
          [x+.014,-.117,.166,.005,.005]],true,9+i,.14);
      }
    }
  };
  const pose=({beat,wind,strike,travel})=>{
    for(const {pec,back,side} of ribs){
      const breathe=Math.sin(beat*.61)*.038;
      pec.rotation.y=side*(breathe+wind*.09-strike*.14);
      back.rotation.x=breathe+wind*.13-strike*.16;
      back.rotation.z=side*travel*.075;
    }
  };
  return {arms,pose};
}
