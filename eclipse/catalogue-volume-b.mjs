import * as T from '../three.min.mjs';
import {featherVane,sculptVolume,wingWeb} from './sculpt-volume.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2;
const signs=[-1,1];
const reflect=(side,track)=>track.map(([x,...tail])=>[side*x,...tail]);
const mass=(k,j,finish,profile,rings=15,sides=11,section=2.43,ridge=.16)=>
  k.geometry(j,finish,sculptVolume(profile.map(([x,y,z,a,b=a])=>[x,y,z,a,b]),{rings,sides,section,ridge}));
const line=(k,j,finish,track,r=.018)=>k.sculpt.sweep(j,finish,track.map(([x,y,z,a=r])=>[x,y,z,a]),{sides:6,steps:9,ridge:.14});
const relief=(k,j,finish,track,depth=.047)=>k.sculpt.plate(j,finish,track,depth,depth*.38);
const stone=(k,j,finish,x,y,z,r=.04,h=r,d=r,angle=0)=>k.mesh(j,'gem',finish,x,y,z,r,h,d,0,0,angle);

function hoop(k,j,finish,r,t=.024,steps=24,x=0,y=0,z=0){
  const geo=new T.TorusGeometry(r,t,8,steps);
  geo.translate(x,y,z);
  k.geometry(j,finish,geo);
}

function dress(k,station,s,panelCount){
  const panels=[];
  const {length,waist,bell,hem,slit=0}=s;
  mass(k,station,'bShadow',[[0,-length,-.02,bell*.84,bell*.69],[0,-length*.77,-.017,bell*.81,bell*.71],
    [0,-length*.47,0,(bell+waist)*.45,(bell+waist)*.35],[0,-.072,0,waist*.99,waist*.74]],19,18,2.37,.095);
  for(let i=0;i<panelCount;i++){
    const a=i*TAU/panelCount,dark=i%3===1;
    const joint=k.bone(station,0,0,0);
    joint.rotation.y=a;
    const w=(bell*.31+waist*.07)*(i%2?.84:1);
    const end=length*(i%2?.86:1)+(i===0?slit:0),h=hem*(i%3-1)*.07;
    const p=[[-w*.52,-.056,waist*.95],[w*.50,-.053,waist*.96],[w*.75,-end*.39,(waist+bell)*.49],
      [w*1.14,-end*.82,bell*.98],[w*.66,-end,bell*(1.03+h)],[-w*.39,-end*.95,bell*.99],
      [-w*1.03,-end*.79,bell*.85],[-w*.71,-end*.41,(waist+bell)*.46]];
    relief(k,joint,dark?'bShadow':'bCloth',p,.071);
    line(k,joint,'bTrim',p.slice(0,7).map(([x,y,z])=>[x,y,z+.053]),.012);
    for(const side of signs)line(k,joint,i%2?'bOxide':'bInlay',[
      [side*w*.21,-.092,waist+.038],[side*w*.37,-end*.33,(waist+bell)*.45+.063],
      [side*w*.51,-end*.63,bell*.79+.045],[side*w*.25,-end*.85,bell*.97+.052]],.012);
    if(s.embroidery)for(let knot=0;knot<3;knot++){
      const t=.48+knot*.137;
      stone(k,joint,knot%2?'bInlay':'bTrim',Math.sin(i+knot*.94)*w*.35,-end*t,T.MathUtils.lerp(waist,bell,t)+.052,.035,.059,.012,TAU/8);
    }
    panels.push({joint,a,index:i});
  }
  return panels;
}

function brow(k,j,s){
  const mask=['oni','helm','goat','skull','ghost'].includes(s);
  const cap=s==='sage';
  mass(k,j,mask?'bMetal':'bFlesh',[[0,-.274,.026,.10,.105],[0,-.17,.024,.165,.148],[0,-.022,.013,.200,.19],
    [0,.139,-.038,.177,.173],[0,.241,-.075,.124,.128],[0,.294,-.096,.066,.084]],17,15,2.45,.095);
  mass(k,j,'bHair',[[0,-.168,-.139,.103,.061],[0,-.02,-.139,.188,.163],[0,.141,-.107,.203,.181],[0,.25,-.073,.141,.125],
    [0,.298,-.038,.075,.084]],17,14,2.45,.18);
  for(const side of signs){
    const fan=path=>reflect(side,path);
    const y=s==='skull'?.014:.025;
    const socket=fan([[.028,y+.027,.192],[.134,y+.066,.178],[.159,y+.024,.177],[.124,y-.023,.19],[.049,y-.018,.203]]);
    relief(k,j,'bShadow',socket,.021);
    stone(k,j,mask?'glow':'bBone',side*.089,y,.218,.043,.018,.016,side*.23);
    line(k,j,mask?'bInlay':'bHair',fan([[.035,y+.035,.214],[.087,y+.058,.210],[.150,y+.08,.177]]),.020);
    if(mask){
      relief(k,j,'bBone',fan([[.034,.137,.161],[.149,.151,.129],[.193,.052,.102],[.162,-.066,.149],
        [.104,-.167,.201],[.052,-.108,.212],[.058,-.02,.234]]),.042);
      line(k,j,'bInlay',fan([[.188,.062,.143],[.136,-.075,.204],[.07,-.184,.204]]),.016);
    }
  }
  mass(k,j,mask?'bBone':'bFlesh',[[0,-.124,.198,.042,.028],[0,-.093,.236,.057,.045],[0,.025,.189,.040,.023],[0,.107,.169,.032,.019]],12,9,2.32,.07);
  const lip=k.bone(j,0,-.176,.091);
  mass(k,lip,mask?'bMetal':'bFlesh',[[0,-.067,.041,.105,.087],[0,-.025,.071,.134,.098],[0,.023,.039,.111,.061]],10,11,2.27,.06);
  line(k,lip,mask?'bShadow':'bOxide',[[-.071,.025,.164],[0,.032,.186],[.072,.019,.167]],.012);
  for(const side of signs)if(mask)for(let i=0;i<4;i++){
    const x=side*(i+.47)*.022;
    mass(k,lip,'bBone',[[x,.015,.174,.014,.014],[x,.057,.192,.014,.011],[x,.07+i*.004,.181,.005,.006]],5,6,2,.08);
  }
  if(cap){
    mass(k,j,'bCloth',[[0,.20,-.027,.190,.157],[0,.278,-.02,.197,.147],[0,.331,-.057,.146,.141],[0,.365,-.077,.105,.132]],12,12,2.88,.09);
    line(k,j,'bTrim',[[-.159,.286,.108],[0,.307,.160],[.157,.289,.11]],.022);
  }
  return lip;
}

function strands(k,head,s,mobile){
  const hair=k.bone(head,0,.16,-.059);
  const width=s.hair==='mane'?.46:s.hair==='long'?.29:.225;
  const end=s.hair==='bun'?.38:s.hair==='pony'?.80:s.hair==='beard'?.66:.63;
  for(let i=0;i<(mobile?10:16);i++){
    const t=i/(mobile?9:15),a=PI*.36+PI*1.28*t,x=Math.cos(a),z=Math.sin(a);
    const face=s.hair==='beard';
    const wind=s.hair==='pony';
    const track=[[x*.15,face?-.319:.173,face?.187:z*.136],[x*width*.72,face?-.419:.03,face?.29:z*.23-.036],
      [x*width*(wind?.69:1)+Number(wind)*.28,-end*(.70+t*.23),face?.320:z*.28-.23],
      [x*width*(wind?.52:.81)+Number(wind)*.49,-end*(.92+t*.21),face?.34:z*.36-.29]];
    mass(k,hair,i%4===0?'bBone':'bHair',track.map(([x,y,z],n)=>[x,y,z,[.046,.052,.037,.003][n],[.032,.047,.022,.003][n]]),
      11,7,2.67,.18);
  }
  if(s.hair==='bun'||s.hair==='pony'){
    stone(k,hair,'bHair',0,.106,-.255,.154,.159,.147,.4);
    const pin=k.bone(hair,0,.25,-.225);
    pin.rotation.z=.75;
    line(k,pin,'bTrim',[[0,-.23,0,.022],[0,.26,0,.015]]);
  }
  return hair;
}

function crown(k,j,design){
  if(design==='cloth')return;
  if(design==='square'){
    relief(k,j,'bMetal',[[-.156,.244,.141],[.16,.244,.141],[.19,.592,.107],[-.193,.592,.112]],.096);
    for(let y=.30;y<.61;y+=.055)line(k,j,'bTrim',[[-.165,y,.215],[0,y+.008,.231],[.165,y,.209]],.020);
    line(k,j,'bTrim',[[-.184,.619,-.03],[.181,.613,-.026],[.196,.611,.271],[-.198,.611,.267],[-.184,.619,-.03]],.037);
    for(const side of signs)for(let i=0;i<5;i++)line(k,j,'bInlay',
      [[side*(.049+i*.032),.60,.236],[side*(.051+i*.032),.407-i*.007,.258]],.011);
    return;
  }
  if(design==='sun'){
    for(let i=0;i<9;i++){
      const a=(i*.193-.77),s=Math.sin(a),c=Math.cos(a);
      mass(k,j,i%2?'bTrim':'bMetal',[[s*.19,.211+c*.033,.061,.046],[s*.32,.334+c*.168,-.049,.049],
        [s*.38,.36+c*.27,-.087,.005]],11,8,2.68,.23);
    }
  }else for(const side of signs){
    const f=path=>reflect(side,path),asym=design==='cloth-pin'?(side===1?.73:.24):1;
    const high=design==='branches'?.63:design==='stag'?.52:design==='flame'?.62:.46;
    const spread=design==='stag'?.36:design==='branches'?.42:.26;
    const tip=[spread*1.25,high*asym,-.17];
    mass(k,j,'bMetal',f([[.082,.151,.106,.065],[spread*.63,high*.41*asym,.037,.084],[spread,high*.72*asym,-.064,.066],
      [...tip,.006]]),15,11,2.7,.24);
    line(k,j,'bTrim',f([[.08,.176,.171],[spread*.67,high*.46*asym,.095],[spread*1.02,high*.78*asym,-.01],[tip[0],tip[1],tip[2]+.03]]),.016);
    if(design==='branches'||design==='flame'||design==='stag')for(let i=0;i<3;i++){
      const x=.124+i*.064,y=.21+i*.105;
      mass(k,j,i%2?'bBone':'bInlay',f([[x,y,-.029,.062],[x+.083,y+.082,-.109,.044],[x+.170,y+.20,-.18,.006]]),
        10,7,2.3,.22);
    }
  }
  stone(k,j,'bInlay',0,.260,.218,.065,.108,.054);
}

function breastplate(k,body,s,y,w){
  for(const side of signs){
    const mid=.39,round=s==='lamellar'||s==='imperial';
    const shoulder=reflect(side,[[.065*w,y+.074,.274],[.64*w,y+.17,.245],[1.19*w,y+.078,.09],
      [1.05*w,y-.153,.092],[.49*w,y-.244,.266],[.114*w,y-.208,.354]]);
    relief(k,body,'bMetal',shoulder,.061);
    line(k,body,'bTrim',shoulder.map(([x,h,z])=>[x,h,z+.046]),.021);
    relief(k,body,'bOxide',reflect(side,[[.08*w,y+.079,-mid*.56],[.58*w,y+.17,-mid*.68],[1.11*w,y+.02,-mid*.44],
      [.96*w,y-.174,-mid*.47],[.215*w,y-.274,-mid*.78]]),.074);
    line(k,body,'bTrim',reflect(side,[[.124*w,y+.063,-.274],[.619*w,y+.14,-.313],[.872*w,y-.067,-.276],
      [.648*w,y-.198,-.315],[.33*w,y-.259,-.339]]),.016);
    for(let i=0;i<(round?6:3);i++){
      const row=y-.052-i*.082;
      const z=.252+(round?.674:.36)*Math.sin((i+.1)*.46)*.113;
      const panel=reflect(side,[[.071*w,row+.065,z],[.746*w,row+.080,z-.045],[.889*w,row+.010,z-.076],
        [.678*w,row-.072,z-.041],[.09*w,row-.062,z+.018]]);
      relief(k,body,i%2?'bInlay':'bMetal',panel,.029);
      for(const p of panel.slice(1,3))stone(k,body,'bTrim',...p,.027,.024,.025);
    }
  }
}

function arm(k,body,s,side){
  const f=path=>reflect(side,path),wide=s.chest;
  const root=k.bone(body,side*wide*.83,.560,.012);
  const elbow=k.bone(root,side*.105,-s.arm*.52,.04);
  const hand=k.bone(elbow,side*.023,-s.arm*.47,.108);
  const r=s.sleeve,skin=s.armor==='bare'?'bFlesh':'bCloth';
  mass(k,root,skin,f([[0,.126,-.039,r*.71,r*.78],[.058,.019,-.027,r*1.08,r*.91],
    [.104,-s.arm*.25,.009,r*.88,r*.78],[.114,-s.arm*.57,.057,r*.70,r*.57]]));
  mass(k,elbow,skin,f([[.003,.036,.029,r*.65,r*.54],[.039,-s.arm*.116,.052,r*.87,r*.68],
    [.057,-s.arm*.36,.106,r*.75,r*.59],[.037,-s.arm*.49,.128,r*.48,r*.42]]));
  for(const z of [-1,1]){
    const plate=reflect(side,[[-r*.66,.088,z*r*.49],[.065,.163,z*r*.84],[r*.83,.084,z*r*.59],
      [r*1.34,-.078,z*r*.43],[r*.95,-.198,z*r*.52],[-r*.30,-.145,z*r*.82]]);
    if(s.armor!=='bare')relief(k,root,'bMetal',plate,.041);
    line(k,root,'bTrim',plate.map(([x,y,p])=>[x,y,p+z*.028]),.019);
  }
  for(let i=0;i<3;i++){
    const y=-s.arm*(i*.096+.23);
    for(const z of [-1,1])line(k,elbow,i===1?'bInlay':'bTrim',
      f([[-r*.6,y,z*r*.31],[-r*.198,y-.019,z*r*.49],[r*.61,y-.03,z*r*.45],[r*.86,y+.015,z*r*.21]]),.015);
  }
  mass(k,hand,'bFlesh',f([[.00,.077,.00,.068,.051],[.025,.003,.039,.081,.063],[.031,-.068,.091,.087,.050],
    [.045,-.112,.106,.078,.036]]),11,10,2.54,.16);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.035;
    line(k,hand,'bMetal',f([[x,-.021,.109,.014],[x+.025,-.076,.15,.015],[x+.037,-.111,.113,.009]]));
  }
  return {root,elbow,hand,side};
}

function leg(k,body,side,s,raised=false){
  const hip=k.bone(body,side*s.chest*.45,-.066,-.025),knee=k.bone(hip,side*.024,-s.leg*.52,.076);
  const boot=k.bone(knee,side*.013,-s.leg*.49,.009);
  const r=s.chest*.32;
  mass(k,hip,'bCloth',[[0,.121,-.028,r,r*.94],[0,-s.leg*.20,.013,r*.90,r*.74],[0,-s.leg*.51,.075,r*.73,r*.70]],13,11);
  mass(k,knee,'bMetal',[[0,.091,.013,r*.78,r*.71],[0,-.152,-.008,r*.81,r*.82],
    [side*.012,-s.leg*.40,.022,r*.56,r*.57],[side*.012,-s.leg*.52,.018,r*.50,r*.56]],14,11,2.61,.16);
  mass(k,boot,'bShadow',[[0,-.043,.19,r*.66,r*.56],[0,-.021,.101,r*.71,r*.62],[0,.014,-.04,r*.55,r*.61]],12,10,2.89,.13);
  relief(k,knee,'bInlay',[[-r*.67,.040,.099],[r*.61,.067,.094],[r*.58,-.13,.133],[r*.23,-s.leg*.44,.114],
    [-r*.28,-s.leg*.44,.114],[-r*.61,-.13,.129]],.035);
  line(k,knee,'bTrim',[[-r*.35,.046,.135],[0,-.069,.161],[r*.44,.043,.149]],.02);
  if(raised)hip.rotation.x=side*.22;
  return {hip,knee,boot,side};
}

function weapon(k,hand,type,side=1){
  const joint=k.bone(hand,.016,-.013,.122);
  if(type==='fist'||type==='shield')return joint;
  if(type==='orb'||type==='loop'||type==='disc'){
    const radius=type==='disc'?.31:type==='loop'?.26:.21;
    hoop(k,joint,'bInlay',radius,.037,30);
    hoop(k,joint,'bTrim',radius*.74,.014,24,0,0,.070);
    stone(k,joint,'glow',0,0,.063,radius*.56,radius*.61,radius*.32);
    for(let i=0;i<9;i++){
      const a=i*TAU/9,x=Math.sin(a),y=Math.cos(a);
      mass(k,joint,'bOxide',[[x*radius*.70,y*radius*.70,.019,.035],[x*radius*1.07,y*radius*1.07,.023,.042],
        [x*radius*1.26,y*radius*1.26,.037,.006]],6,6,2.66,.13);
    }
    return joint;
  }
  if(type==='book'){
    for(const side of signs){
      const flake=k.bone(joint,0,0,0);
      flake.rotation.set(.57,side*.24,0);
      const page=reflect(side,[[0,-.21,.013],[.269,-.23,.037],[.281,.211,.077],[.015,.175,.009]]);
      relief(k,flake,'bMetal',page,.062);
      relief(k,flake,'bBone',page.map(([x,y,z])=>[x*.94,y*.91,z+.047]),.028);
      for(let row=0;row<5;row++)line(k,flake,'bOxide',reflect(side,[[.049,-.119+row*.055,.097],[.20,-.132+row*.060,.141]]),.008);
    }
    return joint;
  }
  if(type==='fan'){
    for(let i=0;i<12;i++){
      const a=i*.216-1.17,x=Math.sin(a),y=Math.cos(a);
      relief(k,joint,i%2?'bCloth':'bInlay',[[x*.067,y*.067,0],[x*.61-.062,y*.61+.04,.027],
        [x*.68+.035,y*.68-.02,.045],[x*.58+.091,y*.58-.045,.024]],.035);
      line(k,joint,'bTrim',[[0,0,.041],[x*.32,y*.32,.033],[x*.63,y*.63,.051]],.014);
    }
    return joint;
  }
  if(type==='bow'){
    const limb=[[0,0,.03,.042],[.172,.29,.037,.061],[.29,.567,.016,.055],[.236,.767,-.008,.044],[.345,.862,.006,.006]];
    for(const part of signs){
      const f=pt=>pt.map(([x,y,z,r])=>[x,y*part,z,r]);
      mass(k,joint,'bInlay',f(limb),16,8,2.1,.14);
      line(k,joint,'bBone',f(limb.map(([x,y,z,r])=>[x-.012,y,z+.04,r*.37])));
    }
    const cord=k.bone(joint,.341,0,0);
    line(k,cord,'bInlay',[[0,-.86,.008],[-.086,0,.019],[0,.86,.008]],.011);
    joint.userData.cord=cord;
    return joint;
  }
  const isAxe=['axe','crescent'].includes(type),staff=['branch','hook','sceptre','trident','flame','staff'].includes(type);
  const length=isAxe?1.37:staff?1.28:type==='spear'?1.62:type==='dagger'?.47:.92;
  mass(k,joint,'bWood',[[0,staff?-.72:-.265,0,.038,.042],[0,.138,0,.046,.049],[.012,length*.85,.017,.043,.043],
    [0,length,.014,.029,.036]],15,10,2.10,.15);
  for(let i=0;i<6;i++){
    const ring=k.bone(joint,0,-.17+i*.073,0);
    ring.rotation.x=PI*.50;
    hoop(k,ring,i%2?'bOxide':'bTrim',.048,.012,10);
  }
  if(isAxe){
    for(const sign of type==='axe'?signs:[side]){
      const f=p=>reflect(sign,p),h=length*.73;
      const edge=f([[.013,h+.093,.009],[.236,h+.35,.03],[.517,h+.474,.05],[.704,h+.287,.074],
        [.632,h-.093,.088],[.308,h-.182,.059],[.407,h+.038,.041],[.222,h+.103,.028]]);
      relief(k,joint,'bMetal',edge,.073);
      for(const face of signs){
        line(k,joint,'bInlay',edge.slice(1,7).map(([x,y,z])=>[x,y,z+face*.049]),.026);
        relief(k,joint,'bOxide',f([[.15,h+.138,face*.068],[.411,h+.364,face*.094],[.547,h+.264,face*.095],
          [.528,h+.116,face*.093],[.303,h+.153,face*.094]]),.026);
      }
    }
  }else if(staff){
    const prongs={branch:4,hook:1,sceptre:3,trident:3,flame:5,staff:2}[type];
    const h=length,wide=type==='hook'?.41:type==='branch'?.35:.205;
    for(let i=0;i<prongs;i++){
      const a=i*TAU/prongs+PI*.23,x=Math.sin(a)*wide,z=Math.cos(a)*wide*.69;
      const prong=[[0,h-.20,0,.074],[x*.53,h+.105,z*.48,.059],[x,h+.286+(i%2)*.177,z,.044],
        [x*(type==='hook'?.51:1.16),h+.411+(i%2)*.131,z*1.19,.004]];
      mass(k,joint,type==='branch'?'bWood':'bMetal',prong,14,10,2.42,.23);
      line(k,joint,'bInlay',prong.map(([a,b,c,r])=>[a,b,c+.026,r*.37]));
      if(type==='branch')for(const d of signs)mass(k,joint,'bInlay',[[x*.61,h+.13,z*.68,.022],[x*.98+d*.074,h+.174,z+d*.046,.051],
        [x*1.32+d*.145,h+.29,z+d*.093,.005]],8,6,2,.19);
    }
    stone(k,joint,'bInlay',0,h+.062,.042,.091,.15,.091);
  }else{
    const h=length,x=type==='spear'?.10:type==='dagger'?.071:type==='curved'?.23:.17;
    const edge=[[-x*.79,.24,.03],[x*.62,.22,.03],[x*.94,h*.62,.059],[x*.73,h*.92,.063],
      [type==='curved'?x*.94:.03,h+.097,.069],[-x*.78,h*.71,.06],[-x*.93,h*.45,.036]];
    relief(k,joint,'bMetal',edge,.051);
    for(const face of signs)line(k,joint,'bInlay',edge.slice(1,6).map(([x,y,z])=>[x,y,z+face*.038]),.018);
    line(k,joint,'bTrim',[[-.170,.228,.015],[0,.288,.071],[.171,.241,.021]],.036);
  }
  return joint;
}

function drapery(k,body,design,mobile){
  const joints=[];
  const long=design==='wings'||design==='imperial';
  const count=mobile?6:10;
  for(const side of signs){
    const wing=k.bone(body,side*.17,.551,-.23);
    for(let i=0;i<count;i++){
      const t=i/(count-1),s=side;
      const start=[s*t*.27,.06-t*.13,-.07],bend=[s*(.18+t*.30),-.23+t*.29,-.16-t*.25];
      const end=[s*(long?.36+t*.76:.27+t*.34),-.92+t*.32+(design==='wings'?.28*t:0),-.43-t*.64];
      k.geometry(wing,i%3?'bCloth':'bOxide',featherVane(start,bend,end,.081+(long?.037:0),i+55*side,9));
      if(i%3===0)line(k,wing,'bTrim',[[...start,.016],[...bend,.018],[...end,.005]]);
    }
    joints.push({wing,side});
  }
  return joints;
}

function attach(k,body,head,s,arms,mobile){
  const cast=k.bone(body,0,.46,-.20);
  const pieces=[];
  if(s.extra==='sun'||s.extra==='runes'){
    const back=k.bone(head,0,.11,-.285);
    const radius=s.extra==='sun'?.71:.54;
    hoop(k,back,'bOxide',radius,.039,38);
    hoop(k,back,'bInlay',radius+.025,.019,38,0,0,-.041);
    for(let i=0;i<10;i++){
      const a=i*TAU/10,x=Math.sin(a),y=Math.cos(a);
      relief(k,back,'bTrim',[[x*radius-y*.078,y*radius+x*.078,-.035],[x*(radius+.124),y*(radius+.12),-.051],
        [x*radius+y*.078,y*radius-x*.078,-.027],[x*(radius-.09),y*(radius-.08),.021]],.048);
      stone(k,back,'glow',x*radius,y*radius,.027,.029,.052,.027,-a);
    }
    pieces.push({joint:back,type:'halo'});
  }
  if(s.extra==='banners'||s.extra==='wings'){
    for(const {wing,side} of drapery(k,body,s.extra==='wings'?'wings':'imperial',mobile)){
      pieces.push({joint:wing,type:'wing',side});
    }
  }
  if(s.extra==='spider')for(const side of signs)for(let i=0;i<3;i++){
    const limb=k.bone(body,side*.26,.40+i*.083,-.265);
    const f=p=>reflect(side,p);
    const radius=.49+.19*i;
    mass(k,limb,'bMetal',f([[0,0,0,.079],[.27,.232,-.16,.092],[radius,.35,-.25,.070],
      [radius+.24,.14,-.28,.052],[radius+.29,-.14,-.38,.006]]),17,10,2.60,.23);
    line(k,limb,'bInlay',f([[.05,.068,.033],[.27,.249,-.098],[radius,.39,-.184],[radius+.22,.142,-.229]]),.018);
    pieces.push({joint:limb,type:'wing',side});
  }
  if(s.extra==='leaves')for(let i=0;i<7;i++){
    const a=i*2.4,rad=.66+(i%3)*.12;
    const leaf=k.bone(cast,Math.sin(a)*rad,.11+(i%4)*.25,Math.cos(a)*rad);
    relief(k,leaf,'bInlay',[[0,-.15,0],[.077,-.077,.020],[.09,.038,.072],[.046,.128,.118],
      [-.013,.199,.10],[-.072,.071,.068],[-.066,-.053,.027]],.025);
    line(k,leaf,'bTrim',[[0,-.15,.02],[.011,-.026,.071],[-.005,.091,.111],[-.014,.177,.115]],.011);
    pieces.push({joint:leaf,type:'orbit',a,rad,i});
  }
  if(s.extra==='arrows'){
    const quiver=k.bone(body,.17,.38,-.39);
    quiver.rotation.z=-.27;
    mass(k,quiver,'bCloth',[[0,-.41,-.04,.118,.095],[0,-.24,-.035,.123,.112],[0,.24,-.05,.157,.145],[0,.32,-.067,.168,.156]]);
    for(let i=0;i<6;i++){
      const x=Math.sin(i*TAU/6)*.094,z=Math.cos(i*TAU/6)*.114-.05;
      line(k,quiver,'bWood',[[x,.08,z,.018],[x,.79+i%2*.11,z,.012]]);
      for(const side of signs)relief(k,quiver,'bBone',[[x,z*.0+.51,z],[x+side*.056,.58,z],[x+side*.057,.72,z],[x,.77,z]],.008);
    }
    pieces.push({joint:quiver,type:'quiver'});
  }
  if(s.extra==='shards'||s.extra==='fire'||s.extra==='spectral'){
    for(let i=0;i<(mobile?5:8);i++){
      const a=i*2.4,rad=.68+(i%3)*.15;
      const joint=k.bone(cast,Math.sin(a)*rad,.12+(i%4)*.27,Math.cos(a)*rad);
      const spectral=s.extra==='spectral',fire=s.extra==='fire';
      if(spectral||fire){
        mass(k,joint,'bCloth',[[0,-.13,0,.088,.063],[.075,.042,0,.129,.11],[.078,.23,-.037,.092,.063],[.17,.40,-.09,.004,.006]],13,9,2.43,.28);
        line(k,joint,'bInlay',[[.049,-.09,.052],[.163,.071,.081],[.122,.232,.034],[.17,.38,-.049]],.022);
      }else{
        stone(k,joint,'bBone',0,0,0,.104,.25,.089,.27);
        relief(k,joint,'bInlay',[[0,.219,.021],[.089,.045,.054],[.008,-.234,.03],[-.042,-.023,.079]],.021);
      }
      pieces.push({joint,type:'orbit',a,rad,i});
    }
  }
  if(s.extra==='drum'){
    const drum=k.bone(body,0,.171,.429);
    drum.rotation.x=PI*.50;
    const lathe=new T.LatheGeometry([[.13,-.231],[.26,-.195],[.298,-.09],[.296,.116],[.247,.193],[.14,.221]]
      .map(([x,y])=>new T.Vector2(x,y)),22);
    k.geometry(drum,'bWood',lathe);
    for(const side of signs){
      const rim=k.bone(drum,0,side*.19,0);
      rim.rotation.x=PI*.5;
      hoop(k,rim,'bTrim',.256,.035,26);
      k.mesh(rim,'bar','bBone',0,0,0,.248,.043,.248,PI*.5);
    }
    for(let i=0;i<12;i++){
      const a=i*TAU/12,b=a+.23;
      line(k,drum,'bInlay',[[Math.sin(a)*.252,-.21,Math.cos(a)*.252],[Math.sin(b)*.313,.008,Math.cos(b)*.313],
        [Math.sin(a)*.257,.211,Math.cos(a)*.257]],.019);
    }
  }
  if(s.extra==='shield'){
    const shield=k.bone(arms[0].elbow,-.034,-.15,.21);
    const path=[[-.35,.271,.015],[0,.413,.057],[.34,.288,.03],[.303,-.149,.148],[0,-.439,.196],[-.257,-.193,.133]];
    relief(k,shield,'bOxide',path,.13);
    line(k,shield,'bTrim',path.map(([x,y,z])=>[x,y,z+.081]),.036);
    relief(k,shield,'bMetal',path.map(([x,y,z])=>[x*.68,y*.67,z+.068]),.068);
    stone(k,shield,'bInlay',0,.055,.186,.073,.131,.034);
    pieces.push({joint:shield,type:'shield'});
  }
  return {cast,pieces};
}

function humanoid(k,entry,s,mobile,mount){
  const body=k.bone(mount?.saddle??k.root,0,mount?.offset??(s.float?1.1:s.leg+.178),0);
  const chest=s.chest,y=s.length;
  const head=k.bone(body,0,y+.295,.047),lip=brow(k,head,s.face);
  const hair=strands(k,head,s,mobile);
  crown(k,head,s.crown);
  const waist=s.waist,bell=s.bell;
  const inner=s.armor==='bare'?'bFlesh':'bCloth';
  mass(k,body,inner,[[0,-.183,-.046,waist*.92,waist*.80],[0,.017,-.047,waist*1.10,waist*.90],
    [0,y*.38,-.042,chest*.97,chest*.65],[0,y*.74,-.05,chest*1.04,chest*.71],[0,y*.94,-.04,chest*.84,chest*.65],
    [0,y*1.21,-.019,chest*.37,chest*.39]],21,16,2.73,.13);
  if(s.armor!=='bare')breastplate(k,body,s.armor,y*.74,chest);
  else for(const side of signs){
    mass(k,body,'bFlesh',reflect(side,[[.061,y*.53,.254,chest*.27,chest*.15],[.207,y*.74,.23,chest*.36,chest*.21],
      [.35,y*.90,.183,chest*.18,chest*.18]]),15,11,2.58,.18);
    const mark=s.extra==='drum'?'bInlay':'bOxide';
    line(k,body,mark,reflect(side,[[.067,y*.93,.24],[.176,y*.75,.275],[.29,y*.65,.252],[.31,y*.50,.241]]),.026);
    line(k,body,mark,reflect(side,[[.073,y*.84,.254],[.205,y*.70,.29],[.25,y*.54,.266]]),.009);
  }
  const sash=k.bone(body,0,.07,0);
  mass(k,sash,'bWood',[[0,-.154,0,waist*1.12,waist*.96],[0,-.092,.021,waist*1.14,waist*.98],[0,-.034,.034,waist*1.13,waist*.96]],
    9,18,2.53,.09);
  for(const face of signs){
    hoop(k,sash,'bTrim',.111,.023,15,0,-.09,face*waist*.99+.024);
    stone(k,sash,'bInlay',0,-.093,face*waist*1.02,.069,.071,.044,TAU/8);
  }
  const panels=dress(k,sash,{length:s.skirt,waist,bell,hem:s.hem,embroidery:s.armor==='imperial'},
    mobile?Math.max(4,s.panels-(mount?3:2)):s.panels);
  const legs=s.float?[]:signs.map(side=>leg(k,body,side,s,!!mount));
  if(mount)for(const l of legs){
    l.hip.position.x=l.side*(mount.width+.032);
    l.hip.rotation.z=l.side*.41;
    l.knee.rotation.x=-.48;
  }
  const arms=signs.map(side=>{
    const scaled={...s,chest:chest*(side===1?s.asymmetric??1:1)};
    return arm(k,body,scaled,side);
  });
  const [left,right]=arms.map((item,i)=>weapon(k,item.hand,s.weapons[i]??'fist',item.side));
  const tail=drapery(k,body,s.flow??'mantle',mobile);
  const {cast,pieces}=attach(k,body,head,s,arms,mobile);
  const aim=s.weapons.includes('bow')||s.weapons.includes('spear');
  return {body:mount?.body??body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,
    pattern:mount?'gallop':s.float?'hover':aim?'aim':s.armor==='bare'?'slam':'duel',
    cataloguePose({beat,headtime,wind,strike,travel,fall,step,stage}){
      const read=(s.move??1),back=Math.sin(beat*.55)*.06;
      mount?.pose({beat,wind,strike,travel,step,stage});
      body.rotation.x=back*.43+travel*.091+wind*s.lean-strike*s.snap+fall*.17;
      body.rotation.z=(wind-strike)*s.lean*.42+Math.sin(step)*travel*.067;
      head.rotation.x=back*.63-wind*.21+strike*.14;
      head.rotation.y=Math.sin(headtime*2.46)*.081*(1-wind)+strike*.24*read;
      lip.rotation.x=wind*.11+strike*.25+stage*.018;
      hair.rotation.x=-travel*.14+strike*.20+Math.sin(beat*.62)*.061;
      hair.rotation.z=Math.sin(beat*.53)*.067+wind*.13*read;
      for(const {root,elbow,hand,side} of arms){
        const forward=(side===1?s.right:s.left);
        root.rotation.x=back+Math.sin(step+side*PI*.5)*.27*travel-wind*forward+strike*(aim?-.53:s.thrust*forward);
        root.rotation.y=side*(.09+wind*.24)+strike*side*.31;
        root.rotation.z=side*(s.spread+wind*.56-strike*.28+stage*.049);
        elbow.rotation.x=-.21-wind*.63+strike*.68+back*.35;
        elbow.rotation.y=side*(wind*.14+strike*.16);
        hand.rotation.z=side*(wind*.23-strike*.26);
      }
      left.rotation.set(-.19-strike*.50,wind*.35,.40+wind*.25);
      right.rotation.set(aim?-.22+wind*.37:-.52+wind*.51-strike*.17,wind*.23,-.29+strike*.42*read);
      for(const tool of [left,right])if(tool.userData.cord)tool.userData.cord.scale.x=1+wind*2.34;
      for(const {hip,knee,boot,side} of legs){
        const gait=Math.sin(step+side*PI*.5)*travel;
        hip.rotation.x=mount?-.23+gait*.25:gait*.58+wind*.15-strike*.13;
        knee.rotation.x=mount?-.39+gait*.16:-(Math.max(0,gait)*.68+wind*.10);
        boot.rotation.x=-Math.min(0,gait)*.38+strike*.067;
      }
      for(const {joint,a,index} of panels){
        joint.rotation.y=a+Math.sin(beat*.52+index*.74)*.073+wind*.175*read;
        joint.rotation.x=Math.sin(beat*.632+index*.62)*.109+travel*Math.cos(a)*.148+strike*.16;
      }
      for(const {wing,side} of tail)wing.rotation.set(-travel*.155+back*2.51-wind*.13,
        side*(back+wind*.27-strike*.29),side*(back*.8+wind*.32));
      cast.rotation.y=headtime*(s.orbit??.42)+wind*.39;
      for(const {joint,type,side,a,rad,i} of pieces){
        if(type==='wing')joint.rotation.set(back*2.46-travel*.25+strike*.37,side*(.14+wind*.43-strike*.28),side*(.09+back+wind*.22));
        else if(type==='halo'){joint.rotation.z=headtime*(s.orbit??.47);joint.scale.setScalar(1+.24*wind+.15*stage);}
        else if(type==='orbit'){
          joint.position.set(Math.sin(a)*(rad+wind*.27+strike*.15),Math.sin(beat*.62+i)*.15+.12+(i%4)*.27,
            Math.cos(a)*(rad+wind*.27+strike*.15));
          joint.rotation.set(beat*.32+i*.4,i+.97*headtime,a+.21*strike);
        }else if(type==='shield')joint.rotation.x=wind*.49-strike*.43;
        else if(type==='quiver')joint.rotation.x=back+travel*.23;
      }
    },
  };
}

const robes={
  m060:{face:'sage',hair:'long',crown:'cloth-pin',armor:'lamellar',weapons:['fist','disc'],extra:'shards',
    chest:.34,waist:.23,bell:.49,skirt:1.19,sleeve:.185,left:1.03,right:.54,flow:'wings',float:true},
  m061:{face:'sage',hair:'bun',crown:'cloth',armor:'lamellar',weapons:['fist','branch'],extra:'shield',
    chest:.31,waist:.225,bell:.44,skirt:.83,sleeve:.131,leg:.74,lean:.29,left:.56,right:.93},
  m062:{face:'face',hair:'pony',crown:'cloth',armor:'vest',weapons:['dagger','fist'],extra:'none',
    chest:.258,waist:.155,bell:.29,skirt:.53,sleeve:.104,leg:.98,right:.27,left:1.39,move:-1,spread:.13,asymmetric:.83},
  m063:{face:'oni',hair:'mane',crown:'stag',armor:'lamellar',weapons:['spear','fist'],extra:'fire',
    chest:.40,waist:.21,bell:.46,skirt:1.09,sleeve:.159,leg:.96,flow:'imperial',lean:.19,left:1.17,right:.37},
  m064:{face:'helm',hair:'long',crown:'flame',armor:'imperial',weapons:['curved','sword'],extra:'shards',
    chest:.38,waist:.25,bell:.49,skirt:1.22,sleeve:.193,leg:1.11,asymmetric:1.11,flow:'wings',left:.91,right:1.24},
  m065:{face:'ghost',hair:'mane',crown:'branches',armor:'vest',weapons:['hook','fist'],extra:'none',
    chest:.33,waist:.19,bell:.42,skirt:1.21,sleeve:.177,leg:1.14,hem:2,spread:.29,left:1.01,right:.49,orbit:.15},
  m066:{face:'oni',hair:'beard',crown:'sun',armor:'imperial',weapons:['sceptre','sword'],extra:'runes',
    chest:.35,waist:.224,bell:.53,skirt:1.17,sleeve:.175,leg:1.08,asymmetric:.91,left:.66,right:.99},
  m067:{face:'sage',hair:'beard',crown:'square',armor:'imperial',weapons:['fist','sword'],extra:'banners',
    chest:.40,waist:.25,bell:.65,skirt:1.24,sleeve:.24,length:.90,left:.77,right:1.03,float:true,panels:11,flow:'imperial'},
  m068:{face:'helm',hair:'beard',crown:'square',armor:'imperial',weapons:['sword','sword'],extra:'sun',
    chest:.49,waist:.28,bell:.70,skirt:1.35,sleeve:.225,length:.92,left:1.37,right:1.62,float:true,panels:12,flow:'imperial',orbit:-.55},
  m069:{face:'sage',hair:'pony',crown:'stag',armor:'lamellar',weapons:['loop','staff'],extra:'runes',
    chest:.34,waist:.235,bell:.42,skirt:.96,sleeve:.181,leg:.88,left:.82,right:1.14,flow:'imperial',orbit:.65},
  m070:{face:'face',hair:'bun',crown:'cloth',armor:'bare',weapons:['fist','axe'],extra:'none',
    chest:.51,waist:.269,bell:.48,skirt:.81,sleeve:.21,length:.777,leg:1.02,left:.37,right:1.43,lean:.30,snap:.29},
  m071:{face:'face',hair:'long',crown:'cloth-pin',armor:'vest',weapons:['curved','spear'],extra:'none',
    chest:.255,waist:.176,bell:.365,skirt:.99,sleeve:.16,length:.80,leg:1.04,left:.92,right:1.31,float:true,flow:'wings'},
  m072:{face:'face',hair:'bun',crown:'sun',armor:'bare',weapons:['fist','orb'],extra:'drum',
    chest:.278,waist:.206,bell:.67,skirt:1.17,sleeve:.13,left:.50,right:1.11,lean:-.20,float:true,flow:'imperial'},
  m073:{face:'sage',hair:'beard',crown:'sun',armor:'imperial',weapons:['orb','book'],extra:'fire',
    chest:.36,waist:.229,bell:.49,skirt:.91,sleeve:.22,leg:.86,left:1.14,right:.90,spread:.23,orbit:-.59},
  m074:{face:'face',hair:'pony',crown:'cloth',armor:'vest',weapons:['hook','fist'],extra:'none',
    chest:.288,waist:.206,bell:.38,skirt:.62,sleeve:.150,length:.67,leg:.725,left:1.04,right:.43,spread:.22,snap:.28},
  m075:{face:'oni',hair:'pony',crown:'cloth-pin',armor:'lamellar',weapons:['curved','dagger'],extra:'wings',
    chest:.42,waist:.21,bell:.78,skirt:1.34,sleeve:.15,length:.80,leg:1.11,left:1.2,right:.88,panels:12,flow:'wings',float:true},
  m076:{face:'oni',hair:'mane',crown:'sun',armor:'imperial',weapons:['sword','flame'],extra:'spider',
    chest:.45,waist:.24,bell:.72,skirt:1.31,sleeve:.18,left:.85,right:1.26,panels:11,flow:'imperial',float:true},
  m077:{face:'face',hair:'bun',crown:'cloth-pin',armor:'vest',weapons:['fist','fan'],extra:'spectral',
    chest:.268,waist:.18,bell:.64,skirt:1.18,sleeve:.173,length:.67,left:1.19,right:1.37,float:true,orbit:-.38,move:-1},
  m078:{face:'sage',hair:'beard',crown:'branches',armor:'bare',weapons:['branch','fist'],extra:'leaves',
    chest:.55,waist:.30,bell:.47,skirt:.81,sleeve:.243,length:.70,leg:.91,left:1.18,right:.48,lean:.21,snap:.25},
  m079:{face:'ghost',hair:'long',crown:'stag',armor:'vest',weapons:['trident','loop'],extra:'wings',
    chest:.315,waist:.171,bell:.59,skirt:1.29,sleeve:.151,left:1.22,right:.92,panels:11,flow:'wings',float:true,orbit:.79},
  m080:{face:'skull',hair:'beard',crown:'cloth',armor:'bare',weapons:['loop','disc'],extra:'banners',
    chest:.415,waist:.23,bell:.60,skirt:1.22,sleeve:.173,length:.80,left:1.21,right:1.10,panels:11,float:true,lean:-.19},
  m081:{face:'oni',hair:'bun',crown:'cloth-pin',armor:'lamellar',weapons:['crescent','curved'],extra:'fire',
    chest:.38,waist:.224,bell:.54,skirt:.99,sleeve:.144,leg:1.06,left:1.06,right:1.26,lean:.23,flow:'wings'},
  m082:{face:'ghost',hair:'mane',crown:'cloth',armor:'vest',weapons:['loop','loop'],extra:'spectral',
    chest:.465,waist:.25,bell:.65,skirt:.96,sleeve:.191,length:.67,left:1.2,right:1.18,panels:7,float:true,orbit:-.67},
  m083:{face:'helm',hair:'pony',crown:'cloth',armor:'lamellar',weapons:['fist','spear'],extra:'none',
    chest:.34,waist:.19,bell:.36,skirt:.59,sleeve:.148,leg:1.05,left:.45,right:1.65,asymmetric:1.35,lean:.25,snap:.36},
  m084:{face:'oni',hair:'long',crown:'stag',armor:'lamellar',weapons:['bow','dagger'],extra:'arrows',
    chest:.353,waist:.232,bell:.37,skirt:.74,sleeve:.145,leg:.99,left:1.40,right:.38,move:-1,snap:.192},
  m089:{face:'oni',hair:'mane',crown:'flame',armor:'imperial',weapons:['shield','flame'],extra:'shield',
    chest:.395,waist:.242,bell:.44,skirt:.65,sleeve:.20,length:.66,leg:.71,left:.49,right:1.35},
  m099:{face:'oni',hair:'mane',crown:'stag',armor:'imperial',weapons:['crescent','crescent'],extra:'shards',
    chest:.664,waist:.385,bell:.58,skirt:.94,sleeve:.30,length:.82,leg:.89,left:1.24,right:1.33,panels:9,asymmetric:1.14,snap:.315},
  m102:{face:'oni',hair:'mane',crown:'stag',armor:'bare',weapons:['crescent','axe'],extra:'none',
    chest:.617,waist:.30,bell:.48,skirt:.67,sleeve:.228,length:.82,leg:.96,left:.54,right:1.28,lean:.27,snap:.38},
  m104:{face:'helm',hair:'bun',crown:'cloth',armor:'bare',weapons:['fist','fist'],extra:'shards',
    chest:.72,waist:.39,bell:.49,skirt:.64,sleeve:.30,length:.81,leg:.85,left:1.02,right:1.49,lean:.32,snap:.44},
  m105:{face:'sage',hair:'pony',crown:'square',armor:'lamellar',weapons:['orb','fist'],extra:'spectral',
    chest:.281,waist:.209,bell:.57,skirt:1.27,sleeve:.127,length:.78,left:1.19,right:.96,panels:12,float:true,orbit:.75},
  m110:{face:'goat',hair:'mane',crown:'cloth-pin',armor:'bare',weapons:['disc','orb'],extra:'fire',
    chest:.527,waist:.31,bell:.49,skirt:.69,sleeve:.22,length:.74,leg:.92,left:.83,right:1.22,panels:8,lean:.18,snap:.29},
  m112:{face:'helm',hair:'beard',crown:'flame',armor:'vest',weapons:['crescent','loop'],extra:'none',
    chest:.369,waist:.21,bell:.59,skirt:1.13,sleeve:.154,length:.81,leg:1.10,left:1.08,right:.97,asymmetric:1.14,panels:11},
};

const neutral={length:.71,arm:.76,leg:.93,lean:.18,snap:.24,thrust:1.12,spread:.19,panels:8,hem:1};

// The base, cloth, plated, patinated and inlaid colors are kept separate on the rig
// so runes, embroidery and edges retain their own relief under grazing light.
const pigments={
  m060:[0x0d1927,0x1c4659,0x768d8b,0x119aa1,0xafe0e3],
  m061:[0x161b17,0x4f5340,0xa0a698,0x507929,0xadb979],
  m062:[0x2b1b13,0x736048,0x625139,0xb08f59,0xe0d3bc],
  m063:[0x191723,0x552e30,0x664139,0x9a4428,0xcd9b67],
  m064:[0x10142a,0x1c407f,0x3b4a7c,0x306ed7,0xb5d0e6],
  m065:[0x14271a,0x4a5f28,0x687b53,0x578824,0xc9ef8c],
  m066:[0x1d1d1d,0x705724,0x827048,0x8e712f,0xd6ca9a],
  m067:[0x11131d,0x20222b,0x9a782e,0xbf932d,0xebc76c],
  m068:[0x171823,0x292633,0x97752b,0xcd9936,0xf2d177],
  m069:[0x181822,0x2b4b33,0x907041,0x37905b,0xc7ad7a],
  m070:[0x251817,0x632b1e,0x703632,0xda3224,0xd9a678],
  m071:[0x141c30,0x202c4f,0x2c3b5b,0x2d56a2,0xe0e8ee],
  m072:[0x493027,0xb6a28b,0xb37c39,0xf58126,0xe6d1a9],
  m073:[0x3a1c1c,0x87383c,0x68432b,0xcf4b22,0xdeb380],
  m074:[0x301d22,0x995b4a,0x9b5134,0xba5028,0xf0ba89],
  m075:[0x1d121e,0x36242b,0x3f262b,0xa01923,0x9b9ba2],
  m076:[0x141014,0x262320,0x575035,0x9d711d,0xceae55],
  m077:[0x242c42,0xa2bbd2,0x59748f,0x60a7d9,0xe6ecdb],
  m078:[0x352a1d,0x657048,0x68674c,0xa9bb30,0xdcc9a3],
  m079:[0x10292b,0x17434b,0x467879,0x21b5a4,0x8ae3d0],
  m080:[0x131e32,0x293e71,0x617caa,0x4675e9,0xa6bcd5],
  m081:[0x22191b,0x4e2b25,0x694738,0xe43b15,0xd9ae7b],
  m082:[0x111d30,0x1a2f50,0x2b5d82,0x2b9bdb,0xc5e8f4],
  m083:[0x162524,0x233e2f,0x375247,0x36a64b,0x8ace94],
  m084:[0x241f22,0x302d29,0x4f4732,0xbb941d,0xd7c08d],
  m089:[0x201419,0x7d2c20,0x804624,0xde4d16,0xefb068],
  m095:[0x272341,0x743184,0x643b71,0xc34256,0xb2e2e3],
  m096:[0x48281e,0xb97429,0xa76029,0xe75123,0xf5d27c],
  m099:[0x21242a,0x805249,0x437280,0x61bbc3,0xb2c9cb],
  m100:[0x151c2c,0x272f45,0x55717d,0x629fad,0xb7d0cd],
  m102:[0x321714,0x9e2d1e,0x6a2a23,0xd94c1f,0xe7b672],
  m103:[0x27110f,0x81261c,0x54342e,0xde4c16,0xd6a06a],
  m104:[0x393a34,0x747d73,0x7a7d71,0xbb9b55,0xdad9be],
  m105:[0x301a22,0x743331,0x674635,0x933321,0xd7b174],
  m108:[0x15191e,0x39444e,0x4e7180,0x7db6cb,0xd1dbd7],
  m110:[0x452219,0x754d34,0x9c6b36,0xc07126,0xd9c5a3],
  m111:[0x22191e,0x662624,0x522a2d,0x8f303d,0xaa9b8f],
  m112:[0x272621,0x514a3f,0x746957,0xb37622,0xbdaf9d],
};

function finishing(id,[shadow,fabric,metal,inlay,bone]){
  const fur=['m074','m078','m089','m108','m110','m111'].includes(id);
  const scale=['m095','m096','m102','m103','m111'].includes(id);
  const stonework=id==='m104';
  const patina=new T.Color(metal).lerp(new T.Color(shadow),.47).getHex();
  const hair=id==='m074'?0x25202a:id==='m075'?0x86898c:id==='m108'?0x9faeac:fur?fabric:0x313039;
  const light=[0xf0c3a0,0xbcb6a0,0xcd908c];
  return {
    bShadow:[shadow,.08,.86,'cloth'],bCloth:[fabric,.11,.76,scale?'hide':'cloth'],
    bMetal:[metal,stonework?.27:.67,stonework?.78:.48,stonework?'stone':'iron'],
    bTrim:[new T.Color(inlay).lerp(new T.Color(bone),.54).getHex(),.51,.44,'bronze'],
    bOxide:[patina,.46,.63,'stone'],bInlay:[inlay,.37,.37,'gem'],bBone:[bone,.18,.58,stonework?'stone':'bone'],
    bWood:[new T.Color(metal).lerp(new T.Color(0x483126),.52).getHex(),.15,.83,'hide'],
    bFur:[id==='m074'?0xb47a3e:id==='m089'?0x8f3231:id==='m108'?0x868e91:fabric,.03,.85,'hide'],
    bHair:[hair,.14,.72,'hide'],bFlesh:[id==='m104'?metal:id==='m080'?bone:scale?fabric:
      new T.Color(fabric).lerp(new T.Color(light[Number(id.slice(1))%3]),.66).getHex(),.04,.76,stonework?'stone':'hide'],
  };
}

export const finishesB=Object.fromEntries(Object.entries(pigments).map(([id,palette])=>[id,finishing(id,palette)]));

function clawedFoot(k,j,x,finish='bBone',amount=3){
  for(let i=0;i<amount;i++){
    const px=x+(i-(amount-1)*.5)*.060;
    mass(k,j,finish,[[px,-.037,.129,.042,.034],[px*1.02,-.024,.207,.041,.041],[px*1.06,-.052,.285,.021,.023],
      [px*1.10,-.083,.324,.004,.004]],9,7,2.31,.13);
  }
}

function stripes(k,joint,w,depth,amount,padding=.19,segments=9){
  for(let index=0;index<amount;index++){
    const t=index/(amount-1),z=padding-depth*.62+t*depth*1.38;
    const a=(.52+.48*Math.sin(t*PI)**.43)*w;
    for(const side of signs){
      mass(k,joint,'bShadow',reflect(side,[[.061,a*.80,z,.034,.008],[a*.42,a*.72,z+.024,.048,.013],
        [a*.83,a*.41,z-.082,.039,.012],[a,-a*.092,z-.147,.028,.010],[a*.79,-a*.498,z-.209,.006,.005]],
      ),segments,7,2.42,.09);
    }
  }
}

function tigerHead(k,head,storm,mobile){
  mass(k,head,'bFur',[[0,-.151,.152,.198,.179],[0,-.069,.098,.233,.211],[0,.084,.051,.293,.261],
    [0,.227,-.091,.248,.205],[0,.31,-.155,.163,.154]],19,17,2.51,.19);
  const jaw=k.bone(head,0,-.113,.054);
  mass(k,jaw,'bFur',[[0,-.104,.14,.17,.177],[0,-.049,.21,.203,.158],[0,.076,.108,.182,.158]],12,13,2.37,.16);
  for(const side of signs){
    const f=p=>reflect(side,p);
    mass(k,head,'bBone',f([[.079,-.074,.288,.105,.111],[.145,.025,.25,.129,.118],[.202,.122,.112,.112,.089],
      [.252,.13,.012,.045,.052]]),16,12,2.4,.15);
    mass(k,head,'bCloth',f([[.152,.16,-.049,.099,.099],[.218,.25,-.10,.105,.090],[.216,.382,-.146,.074,.047],
      [.167,.453,-.153,.006,.007]]),14,10,2.33,.19);
    line(k,head,'bShadow',f([[.059,.077,.342],[.149,.116,.286],[.245,.13,.138]]),.041);
    stone(k,head,'glow',side*.145,.083,.308,.053,.023,.023,side*.32);
    line(k,head,'bBone',f([[.063,.118,.316],[.139,.149,.292],[.229,.148,.197]]),.029);
    for(let i=0;i<3;i++){
      const y=-.021-i*.027,x=.114+i*.036;
      stone(k,head,'bShadow',side*x,y,.333-i*.026,.014,.014,.013);
      if(storm)line(k,head,'bBone',f([[x,y,.339-i*.023,.009],[x+.096,y-.02-i*.014,.367,.007],
        [x+.173,y-.061-i*.023,.361,.003]]));
    }
    mass(k,head,'bBone',f([[.146,-.084,.255,.053],[.159,-.164,.281,.040],[.102,-.252,.323,.005]]),12,8,2.32,.135);
    for(let i=0;i<(storm?6:4);i++){
      const a=i*.061,z=.19-a*.45,y=.12+a*.55;
      line(k,head,'bShadow',f([[.032,y+.071,z+.061,.029],[.13+i*.014,y-.021,z+.073,.035],
        [.22+i*.008,y-.063,z+.013,.025],[.251+i*.008,y-.085,z-.016,.008]]));
    }
    if(storm)for(let row=0;row<3;row++)for(let i=0;i<(mobile?3:5);i++){
      const y=.08+row*.078-i*.058,z=-.135-i*.067;
      const base=[side*(.19+row*.047),y,z],mid=[side*(.344+row*.056),y+.21,z-.11];
      const tip=[side*(.431+row*.102),y+.35+row*.067,z-.231];
      k.geometry(head,row%2?'bShadow':'bBone',featherVane(base,mid,tip,.079,i+row*11+side,9));
    }
  }
  stone(k,head,'bShadow',0,.012,.372,.087,.055,.059);
  return jaw;
}

function mountTiger(k,entry,mobile){
  const plated=entry.id==='m089';
  const body=k.bone(k.root,0,.71,0),neck=k.bone(body,0,.115,.69),tail=k.bone(body,0,.105,-.83);
  const head=k.bone(neck,0,-.099,.277),jaw=tigerHead(k,head,false,mobile),paws=[];
  mass(k,body,plated?'bOxide':'bFur',[[0,.09,-.983,.257,.253],[0,.064,-.69,.314,.288],
    [0,.05,-.29,.322,.307],[0,.031,.21,.377,.332],[0,.061,.60,.322,.30],[0,.086,.86,.168,.19]],
    mobile?17:22,mobile?14:17,2.31,.23);
  mass(k,neck,'bFur',[[0,-.012,-.16,.271,.26],[0,-.025,.086,.245,.224],[0,-.113,.24,.186,.216]],
    17,14,2.29,.22);
  mass(k,tail,'bFur',[[0,.025,.037,.082],[-.182,.105,-.203,.084],[-.27,.19,-.449,.068],
    [-.33,.41,-.717,.056],[-.218,.566,-.938,.047],[-.063,.635,-.985,.029]],21,11,2.26,.19);
  for(let i=0;i<9;i++){
    const t=i/8,y=.11+t*.556,z=-.10-t*.84,x=-Math.sin(t*2.8)*.262;
    const stripe=k.bone(tail,x,y,z);
    stripe.rotation.x=.83;hoop(k,stripe,i%3?'bShadow':'bTrim',.065-t*.03,.013,13);
  }
  stripes(k,body,.377,1.16,mobile?7:11,.19,mobile?6:8);
  const saddle=k.bone(body,0,.371,-.068);
  mass(k,saddle,'bCloth',[[0,-.046,-.433,.209,.072],[0,-.024,-.272,.37,.137],[0,.051,.106,.313,.114],
    [0,.070,.29,.167,.082]],15,15,2.48,.14);
  for(const side of signs){
    const f=p=>reflect(side,p);
    for(let i=0;i<5;i++){
      const z=-.40+i*.158;
      const plaque=f([[.122,.054,z+.075],[.38,-.028,z+.094],[.42,-.193,z+.034],[.38,-.185,z-.05],[.15,.082,z-.072]]);
      relief(k,saddle,plated?'bMetal':'bCloth',plaque,.050);line(k,saddle,'bTrim',plaque,.017);
    }
    line(k,head,'bTrim',f([[.189,.153,-.064],[.205,.084,.098],[.193,.007,.278],[.082,-.062,.355]]),.022);
    if(plated){
      for(let i=0;i<5;i++){
        const y=.25-i*.073,x=.06+i*.024,z=.073-i*.032;
        relief(k,neck,i%2?'bOxide':'bMetal',f([[x,y,z],[x+.173,y+.039,z+.019],[x+.261,y-.102,z+.005],
          [x+.218,y-.147,z+.037],[x+.065,y-.115,z+.083]]),.055);
      }
      line(k,neck,'bInlay',f([[.069,.254,.134],[.252,.146,.203],[.304,.003,.245],[.26,-.153,.210]]),.026);
    }
    for(const front of [true,false]){
      const base=k.bone(body,side*(front?.306:.281),front?.012:.034,front?.535:-.584);
      const knee=k.bone(base,side*.039,-.318,front?.091:-.13);
      mass(k,base,'bFur',f([[0,.16,-.051,.165,.17],[.04,.033,-.017,.187,.171],[.049,-.19,.064,.122,.109],
        [.039,-.32,front?.073:-.108,.090,.092]]),17,13,2.63,.18);
      mass(k,knee,'bFur',[[0,.055,-.038,.101,.10],[0,-.083,-.051,.112,.098],[0,-.233,-.017,.078,.076],
        [0,-.305,.04,.091,.124]],17,12,2.26,.16);
      stripes(k,base,.113,.25,mobile?3:4,.035,mobile?6:8);
      const foot=k.bone(knee,0,-.283,-.045);
      mass(k,foot,'bFur',[[0,-.026,.141,.114,.069],[0,.017,.069,.136,.077],[0,.076,-.035,.087,.056]],13,11,2.51,.13);
      clawedFoot(k,foot,0);
      paws.push({base,knee,side,front});
    }
  }
  return {
    body,saddle,width:plated?.337:.284,offset:plated?.70:.61,
    pose({beat,wind,strike,travel,step}){
      body.rotation.x=Math.sin(step)*travel*.10+wind*.22-strike*.31;
      body.rotation.z=Math.sin(step*.5)*travel*.08;
      neck.rotation.x=-wind*.279+strike*.319;
      jaw.rotation.x=wind*.11+strike*.59;
      tail.rotation.y=Math.sin(beat*.31)*(.334+travel*.24)+strike*.27;
      tail.rotation.x=wind*.09-strike*.14-Math.cos(beat*.53)*.12;
      for(const {base,knee,side,front} of paws){
        const p=step+(side<0?PI:0)+(front?PI*.79:0),g=Math.sin(p)*travel;
        base.rotation.x=g*.61+wind*(front?-.22:.092)+strike*(front?.32:-.29);
        knee.rotation.x=Math.max(0,Math.cos(p))*travel*.74*Math.sign(g||1)+strike*.12;
      }
    },
  };
}

function starfish(k,entry,mobile){
  const gold=entry.id==='m096';
  const body=k.bone(k.root,0,.57,.04),arms=[],center=k.bone(body,0,0,0);
  center.rotation.x=-.33;
  const number=gold?10:7;
  mass(k,center,'bCloth',[[0,-.1,-.068,.344,.108],[0,0,-.073,.456,.126],[0,.195,-.069,.389,.149],
    [0,.373,-.052,.274,.121]],15,20,3.08,.27);
  const mouth=k.bone(center,0,.113,.168);
  for(const side of signs){
    hoop(k,mouth,'bMetal',gold?.166:.153,.055,30,0,0,side*.12);
    hoop(k,mouth,'bInlay',.098,.019,22,0,0,side*.14);
    for(let i=0;i<9;i++){
      const a=i*TAU/9;
      stone(k,mouth,i%2?'bTrim':'glow',Math.sin(a)*.154,Math.cos(a)*.154,side*.156,.030,.051,.029,-a);
    }
  }
  stone(k,mouth,'bShadow',0,0,.094,.112,.117,.033);
  for(let i=0;i<number;i++){
    const a=i*TAU/number;
    const top=k.bone(center,Math.sin(a)*.215,.134+Math.cos(a)*.244,-.041+i%2*.028);
    top.rotation.z=-a;
    const long=i%2===0?1:.75,left=(i%2===0?-1:1)*(gold?.15:.29);
    const mid=k.bone(top,left*.69,.69*long,-.061);
    mass(k,top,'bCloth',[[0,-.109,.061,.161,.123],[left*.12,.163,.025,.14,.118],[left*.37,.39*long,-.038,.121,.091],
      [left*.72,.69*long,-.094,.09,.075]],15,13,2.38,.27);
    mass(k,mid,'bCloth',[[0,-.141,.012,.103,.074],[left*.21,.073,.009,.098,.071],[left*.15,.243*long,.072,.085,.065],
      [left*-.29,.433*long,.117,.072,.057],[left*-.54,.50*long,.142,.049,.046]],14,12,2.16,.25);
    for(const side of signs){
      line(k,top,'bInlay',[[side*.043,-.077,.155],[left*.17+side*.053,.153,.118],[left*.44+side*.041,.405*long,.071],
        [left*.72+side*.027,.643*long,.021]],.018);
      line(k,mid,'bTrim',[[side*.034,-.109,-.059],[left*.16+side*.052,.15,-.083],[left*-.19+side*.06,.313*long,.007],
        [left*-.52+side*.018,.46*long,.100]],.017);
    }
    for(let row=0;row<(mobile?4:6);row++){
      const y=.058+row*.084,z=.110-row*.016,x=left*row*.085;
      stone(k,top,row%2?'bMetal':'bBone',x,y,z,.041,.062,.024,-left*2);
    }
    stone(k,mid,'bBone',left*-.52,.496*long,.142,.066,.073,.063,.6);
    hoop(k,mid,'bInlay',.039,.015,12,left*-.49,.49*long,.197);
    arms.push({top,mid,a,i});
  }
  return {body,head:mouth,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'radial',
    cataloguePose({headtime,beat,wind,strike,travel,stage,fall}){
      center.rotation.set(-.40-wind*.20+strike*.42-fall*.23,Math.sin(headtime*1.41)*.22,headtime*(gold?.215:.32)+strike*.22);
      mouth.scale.setScalar(1+wind*.30+strike*.18+stage*.045);
      for(const {top,mid,a,i} of arms){
        top.rotation.set(Math.sin(beat*.65+i*.74)*(.20+travel*.31)+wind*.31-strike*.44,
          Math.sin(beat*.31+i*.22)*.19,-a+Math.sin(beat*.44+i*.77)*.25);
        mid.rotation.x=Math.cos(beat*.51+i*.48)*.493+wind*.73-strike*.47;
        mid.rotation.z=Math.sin(beat*.51+i*.87)*.18;
      }
    },
  };
}

function oldOni(k,entry,mobile){
  const tiger=entry.id==='m108';
  const s=tiger?{...neutral,chest:.58,arm:.80,leg:.98,sleeve:.24,armor:'bare'}:
    {...neutral,chest:.67,arm:.76,leg:.73,sleeve:.29,armor:'bare'};
  const body=k.bone(k.root,0,tiger?1.06:.77,tiger?0:-.075);
  const head=k.bone(body,0,tiger?.65:.51,tiger?.29:.61);
  const jaw=tigerHead(k,head,tiger,mobile);
  mass(k,body,'bFur',[[0,-.311,-.41,.34,.324],[0,-.102,-.236,.414,.351],[0,.11,-.196,.536,.443],
    [0,.401,-.15,.621,.487],[0,.632,-.04,.47,.411],[0,.833,.010,.271,.321]],22,19,2.56,.22);
  const tail=k.bone(body,0,-.15,-.514);
  const tailTrack=tiger?[[0,.021,0,.105],[.16,.197,-.376,.101],[.298,.396,-.687,.093],
    [.248,.802,-.933,.072],[.124,1.121,-.889,.046],[0,1.28,-.712,.019]]:
    [[0,.13,0,.104],[.22,.244,-.427,.079],[.542,.211,-.659,.079],[.729,.406,-.704,.073],
      [.77,.773,-.604,.052],[.679,.929,-.564,.035]];
  mass(k,tail,'bCloth',tailTrack,24,12,2.41,.24);
  for(let i=0;i<7;i++){
    const p=tailTrack[Math.min(i,tailTrack.length-1)];
    const ring=k.bone(tail,p[0],p[1]-.042,p[2]+.021);
    ring.rotation.x=.81;
    hoop(k,ring,i%2?'bShadow':'bMetal',p[3]*1.03,.013,15);
  }
  const arms=signs.map(side=>arm(k,body,s,side)),legs=signs.map(side=>leg(k,body,side,s,false));
  for(const side of signs){
    if(!tiger){
      const horn=k.bone(head,side*.17,.145,-.055);
      const curl=reflect(side,[[.022,.025,.031,.128],[.218,.127,.037,.143],[.45,.125,.137,.125],
        [.59,-.032,.253,.100],[.614,-.251,.365,.078],[.514,-.328,.503,.048],[.383,-.19,.565,.007]]);
      mass(k,horn,'bBone',curl,24,14,2.31,.27);
      const curve=new T.CatmullRomCurve3(curl.map(([x,y,z])=>new T.Vector3(x,y,z)));
      for(let i=0;i<11;i++){
        const t=.11+i*.073,a=curve.getPointAt(t);
        const ring=k.bone(horn,a.x,a.y,a.z);ring.rotation.y=side*(.66-t*.74);ring.rotation.z=side*t;
        hoop(k,ring,'bMetal',.131-t*.087,.019,15);
      }
      for(let j=0;j<4;j++)relief(k,body,'bOxide',reflect(side,[[.22,.571-j*.13,-.102],[.531,.475-j*.118,-.153],
        [.649,.302-j*.113,-.30],[.46,.246-j*.093,-.38],[.248,.409-j*.117,-.35]]),.061);
    }else{
      stripes(k,body,.57,.63,mobile?5:8,.15);
      for(let i=0;i<6;i++){
        const f=p=>reflect(side,p),y=.48-i*.089;
        relief(k,body,i%2?'bBone':'bOxide',f([[.08,y+.073,.309],[.362,y+.091,.293],[.586,y-.015,.146],
          [.488,y-.11,.119],[.185,y-.12,.271],[.047,y-.043,.384]]),.043);
      }
    }
  }
  if(!tiger){
    for(const {root,side} of arms){root.position.y=.068;root.position.z=.54;root.position.x=side*.43;}
    for(const {hip,side} of legs){hip.position.y=.068;hip.position.z=-.62;hip.position.x=side*.39;}
    for(const {hand} of arms)clawedFoot(k,hand,0,'bMetal');
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:tiger?'slam':'gallop',
    cataloguePose({beat,headtime,wind,strike,travel,step,fall,stage}){
      body.rotation.set((tiger?.15:.26)+wind*.25-strike*.38+travel*Math.sin(step)*.10+fall*.34,
        Math.sin(beat*.79)*.061,(wind-strike)*.13);
      head.rotation.x=-wind*.31+strike*.47;
      head.rotation.y=Math.sin(headtime*2.1)*.19*(1-wind);
      jaw.rotation.x=wind*.46+strike*.60;
      tail.rotation.y=Math.sin(beat*.62)*.43+wind*.33-strike*.49;
      tail.rotation.x=travel*.19-wind*.19+strike*.33;
      for(const {root,elbow,side} of arms){
        const g=Math.sin(step+side*PI*.5)*travel;
        root.rotation.set((tiger?-.27:-.77)+g*.67-wind*(tiger?1.1:.42)+strike*.87,side*.14,side*(.10+wind*.28));
        elbow.rotation.x=-.26+(Math.cos(step+side*PI)*travel)*.54+wind*.24-strike*.15;
      }
      for(const {hip,knee,side} of legs){
        const d=Math.sin(step+(side===1?0:PI)+PI*.34)*travel;
        hip.rotation.x=(tiger?0:-.079)+d*.51;
        knee.rotation.x=-.19-Math.max(0,d)*.78+strike*.15+stage*.035;
      }
    },
  };
}

function hydra(k,entry,mobile){
  const body=k.bone(k.root,0,.68,-.024),tails=[],heads=[],legs=[];
  mass(k,body,'bCloth',[[0,-.031,-1.18,.39,.348],[0,.034,-.81,.575,.486],[0,.06,-.43,.634,.568],
    [0,.129,.062,.685,.529],[0,.281,.402,.548,.443],[0,.351,.571,.405,.386]],27,18,2.51,.25);
  for(let i=0;i<8;i++){
    const t=i/7,side=i%2?1:-1,x=(.086+.27*Math.sin((i/2)*.62))*side,z=.43-t*.51;
    const neck=k.bone(body,x,.271+t*.09,z);
    const length=.68+Math.sin(i*1.97)*.14,y=(i<4?.687:1.15)+Math.sin(i*.614)*.18;
    const drift=side*(.38+Math.abs(3.5-i)*.135);
    mass(k,neck,'bCloth',[[0,-.071,-.12,.151,.157],[drift*.22,y*.17,.07,.172,.181],
      [drift*.64,y*.56,length*.32,.137,.128],[drift*.91,y*.94,length*.72,.099,.111],[drift,y,length,.104,.104]],
      19,12,2.42,.23);
    for(let j=0;j<4;j++){
      const p=j/4,x=drift*(.12+p*.67),h=y*(.16+p*.7),z=length*(.13+p*.64);
      relief(k,neck,j%2?'bMetal':'bOxide',[[x-.107,h+.086,z+.069],[x+.019,h+.108,z+.162],
        [x+.114,h+.067,z+.067],[x+.055,h-.09,z+.16],[x-.079,h-.087,z+.169]],.037);
      mass(k,neck,'bBone',[[x-.046,h+.011,z-.095,.047],[x-.16*side,h+.088,z-.212,.056],[x-.29*side,h+.20,z-.339,.007]],
        8,8,2.31,.17);
    }
    const head=k.bone(neck,drift,y,length),jaw=k.bone(head,0,-.117,.133);
    mass(k,head,'bOxide',[[0,.18,-.119,.145,.15],[0,.093,.018,.164,.162],[.019,-.01,.172,.142,.144],
      [0,-.043,.342,.094,.076],[.035,-.041,.407,.056,.047]],17,12,2.67,.21);
    mass(k,jaw,'bShadow',[[0,-.068,.034,.12,.073],[0,-.04,.131,.117,.069],
      [0,.003,.263,.072,.043],[.008,.019,.323,.038,.025]],10,9,2.48,.17);
    for(const side of signs){
      const f=p=>reflect(side,p);
      relief(k,head,'bMetal',f([[.055,.15,.113],[.145,.17,.019],[.181,.096,-.016],[.131,.027,.173],[.046,.061,.24]]),.045);
      stone(k,head,'glow',side*.128,.069,.181,.044,.026,.029);
      mass(k,head,'bBone',f([[.112,.114,-.02,.051],[.216,.213,-.143,.043],[.265,.314,-.257,.007]]),11,8,2.63,.19);
      for(let tooth=0;tooth<(mobile?2:4);tooth++){
        const z=.13+tooth*.073,x=.108-tooth*.02;
        mass(k,head,'bBone',f([[x,-.077,z,.023],[x+.005,-.126,z+.015,.020],[x-.016,-.176,z+.06,.004]]),7,7);
      }
    }
    heads.push({neck,head,jaw,i,side});
  }
  for(const side of signs){
    const tail=k.bone(body,side*.36,.16,-.887);
    const f=p=>reflect(side,p);
    const path=f([[0,-.044,.101,.172],[.074,.088,-.247,.193],[.268,.221,-.73,.143],
      [.472,.541,-.963,.110],[.572,.771,-1.257,.075],[.618,.812,-1.60,.006]]);
    mass(k,tail,'bCloth',path,24,13,2.42,.25);
    for(let i=0;i<5;i++){
      const t=i/5,x=.03+.52*t,y=.063+.68*t,z=-.124-1.2*t;
      mass(k,tail,'bBone',f([[x,y+.10,z,.067],[x+.043,y+.255,z-.057,.050],[x+.108,y+.341,z-.198,.005]]),10,8);
    }
    tails.push({tail,side});
    const s={...neutral,chest:.66,leg:.72};
    for(const front of [true,false]){
      const l=leg(k,body,side,s);
      l.hip.position.set(side*.45,-.037,front?.39:-.74);
      clawedFoot(k,l.boot,0,'bBone',4);
      legs.push({...l,front});
    }
  }
  return {body,head:heads[2].head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'gallop',
    cataloguePose({headtime,beat,wind,strike,stage,travel,step,fall}){
      body.rotation.x=wind*.18-strike*.28+.061*Math.sin(beat)+fall*.22;
      for(const {neck,head,jaw,i,side} of heads){
        const t=wind*.7+Math.sin(headtime*3.7+i*.875)*.21,s=Math.max(0,strike-.035*i);
        neck.rotation.set(t*.78-s*.84,side*(Math.sin(beat*.88+i*.49)*.17+wind*.23-s*.30),side*(wind*.09+stage*.041));
        head.rotation.x=Math.sin(beat*.62+i)*.097-strike*.31;
        jaw.rotation.x=.11+wind*.63+s*.75;
      }
      for(const {tail,side} of tails)tail.rotation.set(travel*.21-wind*.31+strike*.22,side*(Math.sin(beat*.51)*.27+wind*.16),side*stage*.065);
      for(const {hip,knee,side,front} of legs){
        const p=step+side*PI*.5+(front?PI*.7:0);
        hip.rotation.x=Math.sin(p)*travel*.55+wind*(front?-.31:.15);
        knee.rotation.x=-Math.max(0,Math.cos(p))*travel*.54+strike*.20;
      }
    },
  };
}

function iceShade(k,entry,mobile){
  const body=k.bone(k.root,0,1.11,0),head=k.bone(body,0,.83,.088);
  const jaw=brow(k,head,'skull'),panels=dress(k,body,{length:1.16,waist:.211,bell:.39,hem:1,slit:.16,embroidery:true},mobile?7:10);
  const s={...neutral,chest:.30,sleeve:.114,armor:'imperial'};
  const wings=[];
  mass(k,body,'bCloth',[[0,-.19,-.09,.231,.171],[0,.094,-.061,.25,.216],[0,.38,-.029,.29,.211],
    [0,.594,.025,.261,.185],[0,.792,.063,.16,.118]],16,16,2.43,.22);
  crown(k,head,'flame');
  const arms=signs.map(side=>arm(k,body,s,side));
  for(const side of signs){
    for(let row=0;row<6;row++){
      const y=.585-row*.091;
      relief(k,body,row%2?'bMetal':'bOxide',reflect(side,[[.051,y+.048,.253],[.206,y+.035,.238],[.253,y-.03,.177],
        [.200,y-.083,.220],[.072,y-.055,.273]]),.044);
      line(k,body,'bInlay',reflect(side,[[.104,y+.024,.287],[.163,y-.031,.268],[.218,y+.018,.234]]),.017);
    }
    const wing=k.bone(body,side*.191,.61,-.212);
    const elbow=k.bone(wing,side*.541,.496,-.117);
    const ribs=[
      [[0,0,0],[.178,.25,-.052],[.42,.48,-.096],[.54,.495,-.117]],
      [[0,0,0],[.435,.28,-.09],[.82,.33,-.162],[1.09,.178,-.255]],
      [[0,0,0],[.45,.12,-.14],[.725,-.248,-.24],[.763,-.39,-.28]],
      [[0,0,0],[.277,-.058,-.107],[.478,-.305,-.22],[.357,-.522,-.26]],
    ];
    k.geometry(wing,'bOxide',wingWeb(ribs,side,7+side));
    for(const [i,path] of ribs.entries()){
      mass(k,wing,i%3?'bMetal':'bBone',reflect(side,path.map(([x,y,z],j)=>[x,y,z,[.067,.053,.045,.004][j]])),
        mobile?12:17,10,2.18,.18);
      line(k,wing,'bInlay',reflect(side,path.map(([x,y,z],j)=>[x,y,z+.048-j*.01,.019-j*.005])));
    }
    for(let i=0;i<4;i++){
      const path=reflect(side,[[.012,-i*.043,0],[.269-i*.056,.187-i*.11,-.07],[.44-i*.063,.199-i*.15,-.18]]);
      mass(k,elbow,i%2?'bOxide':'bBone',path.map(([x,y,z],j)=>[x,y,z,[.041,.052,.005][j]]),11,8,2.34,.21);
    }
    wings.push({wing,elbow,side});
  }
  const icicle=k.bone(arms[1].hand,.062,-.08,.153);
  const jewelAt=weapon(k,icicle,'disc');
  jewelAt.scale.setScalar(.61);
  const ghostSword=weapon(k,arms[0].hand,'dagger');ghostSword.scale.setScalar(.78);
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'hover',
    cataloguePose({beat,headtime,wind,strike,stage,travel,fall}){
      body.rotation.x=wind*.21-strike*.36+travel*.18+fall*.39;
      head.rotation.y=Math.sin(headtime*2.64)*.131-wind*.52+strike*.35;
      jaw.rotation.x=wind*.39+strike*.43;
      jewelAt.rotation.z=headtime*1.62+wind*2.1-strike*1.88;
      for(const {root,elbow,side} of arms){
        root.rotation.x=-wind*(side>0?1.21:.57)-strike*(side>0?.61:.48)+travel*.08;
        root.rotation.z=side*(.31+wind*.23+strike*.26);
        elbow.rotation.x=-wind*.81+strike*.94;
      }
      for(const {wing,elbow,side} of wings){
        wing.rotation.set(Math.sin(beat)*.09-travel*.24,side*(.31+wind*.45-strike*.33),side*(.15+Math.sin(beat*.61)*.159-wind*.17+strike*.25));
        elbow.rotation.y=side*(.14+stage*.185+strike*.11);
        elbow.rotation.z=side*(Math.sin(beat*.78)*.134+wind*.31-strike*.17);
      }
      for(const {joint,index,a} of panels)joint.rotation.set(Math.sin(beat*.76+index)*.136+wind*.15+strike*.16,a+travel*.036,0);
    },
  };
}

const specialized={m095:starfish,m096:starfish,m100:iceShade,m103:hydra,m108:oldOni,m111:oldOni};

export function sculptB(k,entry,mobile=false){
  const specializedShape=specialized[entry.id];
  if(specializedShape)return specializedShape(k,entry,mobile);
  const design=robes[entry.id];
  if(!design)return null;
  const mounted=entry.id==='m074'||entry.id==='m089';
  return humanoid(k,entry,{...neutral,...design},mobile,mounted?mountTiger(k,entry,mobile):null);
}
