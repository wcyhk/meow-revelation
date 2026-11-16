import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=forgeburst-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const signs=[-1,1],TAU=Math.PI*2;
const mirror=(s,path)=>path.map(([x,...row])=>[s*x,...row]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:15,sides:mobile?6:8,ridge:.21});
const mass=(k,j,m,p,mobile,seed=1)=>k.geometry(j,m,sculptVolume(p,{rings:mobile?11:17,
  sides:mobile?8:13,section:2.48,ridge:.18,seed}));
const pin=(k,j,m,x,y,z,r=.021)=>k.mesh(j,'gem',m,x,y,z,r,r*.96,r*.72);

export const strongFinishes={starPewter:[0xa9b4b5,.57,.47,'iron'],starIvory:[0xe2d1b9,.07,.80,'cloth'],
  starAsh:[0xb4b6b0,.08,.79,'hide'],starEmber:[0x7f2624,.67,.45,'iron'],starSoot:[0x2d2529,.59,.54,'iron'],
  starJade:[0x3b604b,.32,.49,'iron'],starBronze:[0xb28c54,.62,.48,'bronze'],starInk:[0x242638,.12,.80,'cloth'],
  starAxeRed:[0xae312e,.44,.44,'iron'],starAxeEdge:[0xc74339,.52,.39,'iron'],starAxeSpine:[0x29252b,.56,.59,'iron']};

function panel(k,j,m,trim,p,mobile,d=.045,side=1){
  k.sculpt.plate(j,m,p,d,d*.27);
  sweep(k,j,trim,p.slice(0,-1).map(([x,y,z],i)=>[x,y+.006,z+side*d*.49,i===0?.004:.012]),mobile);
}

function wheel(k,j,m,r,t,mobile,z=0){
  const geometry=new T.TorusGeometry(r,t,mobile?6:9,mobile?35:53);
  geometry.translate(0,0,z);
  k.geometry(j,m,geometry);
}

export function isStrongConstellation(id){
  return id in sculpts;
}

export function strongSkin(k,body,profile,id,mobile){
  const fire=id==='m070';
  const gaussian=(n,r)=>Math.exp(-((n/r)**2));
  const rings=fire?(mobile?36:46):(mobile?31:43);
  const sides=fire?(mobile?25:36):(mobile?23:33);
  const geo=sculptVolume(profile,{rings,sides,section:2.18,ridge:.095,seed:fire?61:26});
  const {position,color}=geo.attributes;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),a=Math.abs(x);
    const front=Math.max(0,z)*2.8,back=Math.max(0,-z)*2.6;
    const pec=gaussian(a-(fire?.192:.098),fire?.154:.12)*gaussian(y-(fire?.528:.53)+a*.09,fire?.11:.138);
    const belly=gaussian(x,.195)*gaussian(y-.097,.157);
    const sternum=gaussian(x,.043)*gaussian(y-.431,.262);
    const rib=gaussian(y-.34+a*.37,.040)*gaussian(a-.229,.170);
    const shoulder=gaussian(a-.231,.142)*gaussian(y-.555,.173);
    const spine=gaussian(x,.052)*gaussian(y-.417,.414);
    if(fire){
      const fascia=gaussian(a-.28,.12)*gaussian(y-.22-a*.21,.17);
      const serratus=gaussian(a-.25,.12)*gaussian(y-.328,.146)*Math.cos((y+a*.51)*44);
      const abdomen=gaussian(a-.12,.078)*gaussian(y-.22,.18)*(.064-Math.cos(y*52+a*6)*.028);
      const lat=gaussian(a-.254,.14)*gaussian(y-.296+a*.08,.177);
      const trapezius=gaussian(y-.554-a*.30,.102)*gaussian(a-.121,.160);
      const iliac=gaussian(y-.121-a*.18,.031)*gaussian(a-.232,.115);
      const scar=gaussian(x-.118-(.62-y)*.38,.016)*gaussian(y-.438,.18);
      const scarEdge=gaussian(x-.134-(.62-y)*.38,.024)*gaussian(y-.44,.18);
      position.setZ(i,z+front*(pec*.106+belly*.037+abdomen+fascia*.032-sternum*.054-rib*.048+serratus*.011-scar*.023)
        -back*(shoulder*.118+lat*.073+trapezius*.066-spine*.057-iliac*.023));
      position.setX(i,x*(1+gaussian(y-.551,.126)*.047-gaussian(y-.063,.151)*.034));
      const shade=1+front*(pec*.09-rib*.15-sternum*.068+serratus*.065-scar*.20)+back*(shoulder*.071-spine*.112);
      color.setXYZ(i,color.getX(i)*(shade+front*scarEdge*.066),color.getY(i)*(shade-front*scarEdge*.033),
        color.getZ(i)*(shade-front*scarEdge*.042));
    }else{
      position.setZ(i,z+front*(pec*.057+belly*.042-sternum*.058-rib*.044)-back*(shoulder*.085-spine*.035));
      const shade=1+front*(pec*.075-rib*.14-sternum*.049)+back*(shoulder*.064-spine*.082);
      color.setXYZ(i,color.getX(i)*shade,color.getY(i)*shade,color.getZ(i)*shade);
    }
  }
  geo.computeVertexNormals();
  k.geometry(body,'bFlesh',geo);
}

export function strongLimbs(k,arms,measure,id,mobile){
  const hot=id==='m070',pearl=id==='m072',mist=id==='m071';
  const [upper,lower,accent]=hot?['bFlesh','bFlesh','starBronze']:pearl?['bFlesh','starIvory','starBronze']:
    mist?['starInk','starInk','starPewter']:['starJade','starIvory','starBronze'];
  const w=measure.sleeve,d=measure.arm;
  for(const {root,elbow,hand,side:s} of arms){
    mass(k,root,upper,mirror(s,[[0,.102,-.041,w*.78,w*.72],[.050,-.014,-.024,w,w*.96],
      [.081,-d*.26,.011,w*.84,w*.73],[.108,-d*.53,.053,w*.60,w*.54]]),mobile,7);
    mass(k,elbow,lower,mirror(s,[[.006,.058,.019,w*.64,w*.59],[.044,-d*.107,.043,w*.77,w*.72],
      [.052,-d*.29,.097,w*.72,w*.61],[.035,-d*.48,.120,w*.45,w*.47]]),mobile,8);
    mass(k,hand,'bFlesh',mirror(s,[[.004,.079,0,.055,.05],[.013,-.016,.023,.086,.069],
      [.026,-.073,.086,.077,.05],[.033,-.108,.117,.058,.032]]),mobile,2);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.034;
      sweep(k,hand,'bFlesh',[[x,.012,.04,.024],[x+s*.011,-.052,.101,.025],
        [x+s*.014,-.089,.139,.020],[x+s*.023,-.107,.115,.010]],mobile);
    }
    for(let i=0;i<(hot?3:2);i++){
      const y=-d*(.217+i*.096),e=w*(.88-i*.08);
      const cuff=mirror(s,[[-e*.34,y+.046,.101],[e*.47,y+.061,.113],[e*.82,y-.006,.085],
        [e*.65,y-.064,.106],[.022,y-.092,.161],[-e*.37,y-.047,.135]]);
      panel(k,elbow,hot?'starSoot':mist?'bMetal':'bCloth',accent,cuff,mobile,.035);
      pin(k,elbow,accent,s*e*.36,y-.002,.143,.018);
    }
  }
}

function windCenser(k,j,mobile){
  markEnemyWeapon(j,[.048,1.69,-.08],{from:[0,-.06,0],width:.18,aim:false});
  sweep(k,j,'bWood',[[0,-1.07,.015],[0,-.13,.018],[.021,.72,-.012],[.048,1.71,-.052]]
    .map(([x,y,z],i)=>[x,y,z,[.038,.039,.045,.032][i]]),mobile);
  const cage=k.bone(j,.031,1.26,-.014);
  cage.rotation.z=.17;
  wheel(k,cage,'starBronze',.103,.027,mobile,.041);
  pin(k,cage,'bInlay',0,.011,.061,.083);
  for(const side of signs)sweep(k,cage,'starBronze',mirror(side,[[.02,-.161,.018,.036],[.137,-.03,.037,.030],
    [.147,.092,-.034,.036],[.096,.206,-.071,.026],[.148,.287,-.118,.005]]),mobile);
  return cage;
}

function windsage(k,{body,head,arms,right},mobile,cloth){
  const censer=windCenser(k,right,mobile);
  const hair=k.bone(head,0,.078,.017);
  mass(k,hair,'bHair',[[.004,.030,-.059,.147,.098],[.006,.107,-.016,.166,.133],
    [.019,.158,-.024,.141,.126],[.042,.218,-.079,.084,.074],[.061,.235,-.13,.008,.012]],mobile,7);
  for(let i=0;i<8;i++){
    const x=(i-3.5)*.035;
    sweep(k,hair,i%3?'bHair':'starSoot',[[x,.062,.103-Math.abs(x)*.42,.019],
      [x+.016,.147,.083-Math.abs(x)*.28,.026],[x+.049,.184,-.021,.024],[x+.073,.185,-.123,.005]],mobile);
  }
  const crest=k.bone(head,0,.114,-.087);
  for(const s of signs){
    sweep(k,crest,'starBronze',mirror(s,[[.044,.063,.136,.022],[.133,.151,.065,.034],
      [.168,.243,-.021,.035],[.147,.327,-.069,.025],[.233,.398,-.173,.006]]),mobile);
    sweep(k,crest,'starJade',mirror(s,[[.061,.089,.129,.012],[.145,.175,.065,.02],[.156,.219,.011,.019],
      [.238,.282,-.06,.004]]),mobile);
    sweep(k,crest,'bInlay',mirror(s,[[.014,.051,.184,.011],[.086,.07,.175,.015],[.147,.097,.111,.015],
      [.155,.123,.016,.012],[.138,.134,-.08,.004]]),mobile);
    for(let row=0;row<4;row++){
      const y=.576-row*.106;
      panel(k,body,row%2?'starJade':'bMetal','starBronze',mirror(s,[[.037,y+.08,.183],[.192,y+.108,.146],
        [.294,y+.034,.075],[.296,y-.064,.126],[.174,y-.091,.231],[.041,y-.057,.239]]),mobile,.041);
    }
    const shoulder=arms[s<0?0:1].root;
    panel(k,shoulder,'starJade','starBronze',mirror(s,[[.011,.09,.112],[.102,.157,.088],[.241,.124,-.064],
      [.252,.012,-.145],[.155,-.085,.038],[.034,-.045,.144]]),mobile,.061);
    cloth.push({parent:body,name:'風・強 雙襟 '+s,path:mirror(s,[[.11,.028,.205,.105],[.146,-.28,.298,.143],
      [.206,-.612,.347,.159],[.224,-.935,.388,.053]]),tint:0x2b534b,trim:0xad9a68,lining:0x2c3039,phase:s*.64,flex:.91});
    cloth.push({parent:body,name:'風・強 後肩幟 '+s,path:mirror(s,[[.158,.592,-.24,.075],[.286,.285,-.325,.137],
      [.347,-.201,-.408,.156],[.35,-.779,-.618,.06]]),tint:0x3b5346,trim:0xa38452,lining:0x313241,phase:s*.89,flex:1.13});
  }
  const queue=k.bone(head,0,.115,-.194);
  for(let i=0;i<5;i++)sweep(k,queue,i%2?'bHair':'starInk',[[.026*(i-2),.053,.014,.030],
    [.009*i,.009,-.111,.046],[.076+i*.016,-.161,-.23,.049],[.15+i*.017,-.386,-.297,.004]],mobile);
  const waist=k.bone(body,0,-.29,0);
  waist.rotation.x=Math.PI*.5;
  wheel(k,waist,'starJade',.45,.021,mobile);
  return ({beat,wind,strike,travel})=>{
    queue.rotation.x=wind*.14-strike*.31+travel*.09;
    queue.rotation.y=Math.sin(beat*.89)*.094+strike*.19;
    censer.rotation.y=beat*.68+wind*.54;
    waist.rotation.z=beat*.41+strike*.33;
  };
}

function flameAxe(k,j,mobile){
  markEnemyWeapon(j,[.021,2.02,-.050],{from:[0,.29,.05],width:.47});
  sweep(k,j,'starAxeSpine',[[0,-.81,.02,.043],[.013,-.11,.019,.054],[.009,.65,.035,.042],
    [.017,1.31,.035,.052],[.022,1.84,-.043,.055]],mobile);
  const blade=k.bone(j,0,1.38,.025);
  blade.name='五運・炎 · 赤鐵鏤空斧刃';
  const crescent=[
    [.106,.435,-.031],[.247,.593,-.083],[.464,.576,-.078],[.654,.471,-.050],[.775,.306,-.021],
    [.842,.098,.035],[.788,-.166,.060],[.665,-.338,.084],[.465,-.476,.091],[.279,-.493,.070],
    [.169,-.342,.041],
  ];
  const apertures=[
    [.183,.383,.027],[.292,.459,.003],[.429,.443,-.011],[.563,.339,-.009],[.641,.218,.016],
    [.686,.095,.056],[.655,-.106,.074],[.552,-.257,.096],[.398,-.356,.121],[.290,-.359,.108],
    [.211,-.291,.067],
  ];
  for(const side of signs){
    const width=side>0?.905:1,tilt=side>0?.83:1;
    const fit=path=>mirror(side,path).map(([x,y,z])=>[x*width,y*tilt+side*.024,z]);
    const outer=fit(crescent),inner=fit(apertures);
    for(let i=0;i<crescent.length-1;i++){
      const edge=[outer[i],outer[i+1],inner[i+1],inner[i]];
      k.sculpt.plate(blade,i===3||i===7?'starEmber':'starAxeRed',edge,.064,.020);
      const bevel=[outer[i],outer[i+1]].map(([x,y,z],n)=>[x,y,z+.032,n?.014:.012]);
      sweep(k,blade,i%4?'starAxeEdge':'starAxeSpine',bevel,mobile);
      const ridge=[inner[i],inner[i+1]].map(([x,y,z],n)=>[x,y,z-.038,n?.023:.021]);
      sweep(k,blade,'starAxeSpine',ridge,mobile);
    }
    for(const [ray,target] of [1,4,7,9].entries()){
      const [x,y,z]=inner[target],mount=[.22,.092,-.072,-.225][ray];
      const web=[[0,mount,.055,.062],[x*.34,mount+(y-mount)*.71,z+.044,.066],
        [x*.72,y-.036,z+.025,.039],[x,y,z,.024]];
      sweep(k,blade,'starAxeSpine',web,mobile);
      sweep(k,blade,ray===2?'starAxeEdge':'starAxeRed',web.map(([px,py,pz,w])=>[px,py+.013,pz+.046,w*.31]),mobile);
    }
    for(const i of [2,5,7,9]){
      const [x,y,z]=outer[i],[inX,inY,inZ]=inner[i];
      const [dx,dy]=[x-inX,y-inY];
      sweep(k,blade,'starBronze',[[x-dx*.36,y-dy*.36,z+.046,.021],[x-dx*.62,y-dy*.62,z+.059,.025],
        [inX-dx*.16,inY-dy*.22,inZ+.043,.004]],mobile);
    }
  }
  for(const face of signs){
    pin(k,blade,'starAxeSpine',0,.098,.115*face,.156);
    pin(k,blade,'starBronze',0,.098,.177*face,.090);
    pin(k,blade,'starAxeRed',0,.108,.211*face,.048);
  }
}

function flameGreave(k,{hip,knee,boot,side:s},mobile){
  mass(k,hip,'starInk',mirror(s,[[.006,.047,-.035,.115,.098],[.027,-.082,-.012,.160,.139],
    [.041,-.245,.019,.135,.121],[.029,-.415,.048,.100,.105],[.019,-.526,.076,.078,.087]]),mobile,42);
  mass(k,knee,'starSoot',mirror(s,[[.001,.058,.011,.107,.101],[.012,-.091,-.026,.131,.112],
    [.031,-.232,-.019,.118,.103],[.024,-.386,.019,.090,.083],[.022,-.521,.032,.073,.079]]),mobile,29);
  mass(k,boot,'starInk',[[0,-.055,.187,.078,.062],[s*.01,-.041,.123,.111,.103],
    [s*.014,.006,.043,.096,.091],[s*.015,.057,-.006,.071,.079]],mobile,58);
  for(let i=0;i<4;i++){
    const y=-.018-i*.084,u=i*.011;
    panel(k,knee,i%3===0?'starEmber':'starSoot','starBronze',mirror(s,[[.012,y+.077,.116],
      [.112-u,y+.096,.089],[.156-u,y+.024,-.042],[.127-u,y-.076,.011],[.071-u,y-.116,.111],[.012,y-.066,.155]]),mobile,.043);
    sweep(k,knee,'starBronze',mirror(s,[[.089-u,y+.030,-.089,.009],[.061-u,y+.011,-.126,.015],
      [-.013,y+.004,-.131,.014],[-.076+u,y+.016,-.079,.004]]),mobile);
  }
  panel(k,boot,'starSoot','starBronze',mirror(s,[[.002,.053,.084],[.097,.018,.079],[.112,-.027,.139],
    [.073,-.057,.229],[.018,-.062,.258],[-.072,-.055,.215],[-.091,-.021,.146],[-.054,.021,.094]]),mobile,.038);
  sweep(k,boot,'starBronze',mirror(s,[[.016,-.041,.244,.006],[.054,-.024,.202,.014],
    [.075,-.006,.142,.013],[.064,.018,.102,.004]]),mobile);
}

function firekeeper(k,{body,head,arms,legs,right},mobile,cloth){
  flameAxe(k,right,mobile);
  const knuckles=[];
  const hair=k.bone(head,0,.085,.028);
  mass(k,hair,'starAsh',[[0,.016,-.061,.13,.082],[.007,.109,-.022,.169,.132],
    [.031,.172,-.051,.134,.105],[.089,.246,-.149,.060,.061],[.108,.274,-.212,.006,.012]],mobile,19);
  for(let i=0;i<9;i++){
    const x=(i-4)*.034,t=i/8;
    sweep(k,hair,i%2?'starIvory':'starAsh',[[x,.065,.149-Math.abs(x)*.34,.02],[x+.024,.129,.142-t*.039,.031],
      [x+.056,.202,-.051-t*.019,.028],[x+.098,.243-t*.063,-.212-t*.061,.006]],mobile);
  }
  for(const {root,elbow,hand,side:s} of arms){
    for(let i=0;i<3;i++)sweep(k,root,'starEmber',mirror(s,[[.084,.069-i*.063,.124,.006],
      [.188,.074-i*.067,.096,.014],[.236,.012-i*.067,.03,.018],[.196,-.056-i*.065,.054,.009]]),mobile);
    if(s===1)panel(k,elbow,'starSoot','starBronze',[[.034,.085,.142],[.153,.052,.117],[.183,-.149,.122],
      [.089,-.273,.174],[-.004,-.219,.164],[-.046,-.108,.138]],mobile,.059);
    const shield=k.bone(hand,0,-.006,.05);
    panel(k,shield,s>0?'starSoot':'starEmber','starBronze',mirror(s,[[.007,.064,.06],[.063,.043,.071],
      [.089,-.019,.094],[.064,-.071,.139],[-.028,-.078,.127],[-.052,-.023,.076]]),mobile,.035);
    pin(k,shield,'bTrim',s*.052,-.01,.132,.020);
    knuckles.push({shield,s});
  }
  for(const leg of legs)flameGreave(k,leg,mobile);
  for(const s of signs){
    cloth.push({parent:body,name:'炎・強 鱗裙 '+s,path:mirror(s,[[.139,.012,.261,.127],[.215,-.209,.331,.171],
      [.281,-.476,.401,.159],[.339,-.781,.417,.053]]),tint:0x522b31,trim:0xa78256,lining:0x2d2937,phase:s*.79,flex:1.12});
    cloth.push({parent:body,name:'炎・強 短帔 '+s,path:mirror(s,[[.244,.579,-.234,.078],[.376,.247,-.312,.115],
      [.427,-.097,-.398,.158],[.487,-.551,-.529,.04]]),tint:0x462a31,trim:0x916345,lining:0x322833,phase:s*.95,flex:.93});
    for(let row=0;row<3;row++)panel(k,body,row%2?'starSoot':'starEmber','starBronze',mirror(s,[[.067,.022-row*.101,.295],
      [.258,.068-row*.11,.236],[.369,-.002-row*.119,.138],[.328,-.092-row*.115,.196],
      [.164,-.097-row*.103,.307],[.061,-.051-row*.11,.322]]),mobile,.049);
    const scoops=k.bone(body,s*.018,.14,-.244);
    for(let i=0;i<3;i++){
      const y=-i*.082;
      panel(k,scoops,i%2?'starInk':'starSoot','starBronze',mirror(s,[[.028,y+.067,-.048],
        [.12,y+.114,-.031],[.238,y+.082,.014],[.284,y-.044,.079],[.171,y-.099,-.028],[.031,y-.073,-.113]]),mobile,.046);
    }
    for(let i=0;i<3;i++)pin(k,scoops,'starBronze',s*(.06+i*.043),.049-i*.073,-.095+i*.009,.024);
  }
  return ({wind,strike,beat})=>{
    hair.rotation.z=Math.sin(beat*.67)*.027+wind*.027-strike*.061;
    for(const {shield,s} of knuckles){
      shield.rotation.x=.04+wind*.19-strike*.29;
      shield.rotation.y=s*(wind*.10-strike*.18);
    }
  };
}

function tideKeeper(k,{body,head,arms,right},mobile,cloth){
  markEnemyWeapon(right,[.015,1.94,-.036],{from:[0,.55,.012],width:.16});
  sweep(k,right,'starInk',[[0,-1.08,.007],[.008,-.27,.023],[.012,.75,.023],[.017,1.57,.006]]
    .map(([x,y,z],i)=>[x,y,z,[.034,.041,.042,.027][i]]),mobile);
  panel(k,right,'bMetal','starPewter',[[-.083,1.22,.036],[-.111,1.374,.038],[-.066,1.623,.007],
    [.015,1.94,-.037],[.092,1.621,-.014],[.093,1.364,.048],[.064,1.217,.077]],mobile,.05);
  sweep(k,right,'glow',[[0,1.30,.067,.009],[.009,1.48,.067,.013],[.019,1.73,.021,.01],[.015,1.94,-.036,.002]],mobile);
  const hair=k.bone(head,0,.089,-.039);
  mass(k,hair,'starAsh',[[0,.013,.013,.135,.137],[.002,.089,.019,.152,.149],
    [.021,.147,-.041,.128,.115],[.043,.19,-.089,.092,.073],[.051,.203,-.121,.026,.028]],mobile,49);
  for(const s of signs){
    for(let i=0;i<4;i++){
      const x=.041+i*.032;
      sweep(k,hair,i%3?'starAsh':'starPewter',mirror(s,[[x,.091,.152,.018],[x+.021,.145,.126,.028],
        [x+.045,.162,.049,.031],[x+.087,.113,-.072,.006]]),mobile);
    }
    for(let i=0;i<6;i++){
      const x=.013+i*.023;
      mass(k,hair,i%4?'starAsh':'starPewter',mirror(s,[[x,.135,-.019,.038,.029],[x*1.32,.074,-.052,.047,.043],
        [x*1.72,-.103,-.107,.051,.039],[x*1.8,-.281-i*.017,-.184,.042,.027],
        [x*2.11,-.48-i*.021,-.239,.004,.005]]),mobile,33+i);
    }
    const sleeve=arms[s>0?1:0].root;
    panel(k,sleeve,'bCloth','starPewter',mirror(s,[[.026,.106,.081],[.134,.158,.071],[.219,.06,-.077],
      [.187,-.065,-.109],[.1,-.12,.02],[.04,-.068,.131]]),mobile,.039);
    cloth.push({parent:body,name:'水・強 寬袖氅 '+s,path:mirror(s,[[.13,.64,-.204,.077],[.265,.382,-.286,.179],
      [.35,-.098,-.404,.23],[.411,-.718,-.59,.163],[.477,-.953,-.639,.065]]),tint:0x252c43,trim:0x7194b3,lining:0x253040,phase:s*.96,flex:1.20});
    cloth.push({parent:body,name:'水・強 玄袍 '+s,path:mirror(s,[[.118,.08,.215,.115],[.151,-.239,.265,.136],
      [.185,-.587,.332,.173],[.21,-1.006,.378,.069]]),tint:0x222941,trim:0x8397b6,lining:0x292b41,phase:s*.62,flex:.98});
    sweep(k,body,'starPewter',mirror(s,[[.046,.627,.231,.013],[.127,.543,.259,.024],
      [.168,.324,.292,.020],[.136,.095,.270,.004]]),mobile);
  }
  return ({beat,travel,strike})=>{
    hair.rotation.x=Math.sin(beat*.64)*.032+travel*.13-strike*.23;
    hair.rotation.z=Math.sin(beat*.91)*.044+strike*.14;
  };
}

function stormPercussion(k,{body,head,right},mobile,cloth){
  const wheelRig=k.bone(body,0,.752,-.434);
  wheelRig.rotation.x=-.17;
  wheel(k,wheelRig,'starBronze',.515,.028,mobile);
  wheel(k,wheelRig,'bMetal',.462,.017,mobile,.048);
  wheel(k,wheelRig,'glow',.536,.008,mobile,-.013);
  for(let i=0;i<9;i++){
    const a=i*TAU/9,x=Math.sin(a),y=Math.cos(a),sigil=k.bone(wheelRig,x*.51,y*.51,-.016);
    sigil.rotation.z=-a;
    panel(k,sigil,'starBronze','bInlay',[[-.052,-.051,.028],[.049,-.056,.022],[.071,.039,.017],
      [.018,.116,.007],[-.072,.052,.017]],mobile,.039);
    pin(k,sigil,'glow',.006,.024,.068,.028);
  }
  const drum=k.bone(body,.034,.237,.218);
  sweep(k,drum,'bWood',[[0,-.252,.058,.09],[.017,-.152,.066,.156],[.019,.095,.057,.159],
    [.002,.192,.074,.10]],mobile);
  wheel(k,drum,'starBronze',.166,.029,mobile,.111);
  wheel(k,drum,'starPewter',.133,.014,mobile,.135);
  pin(k,drum,'starIvory',0,0,.156,.121);
  markEnemyWeapon(right,[0,.17,.04],{from:[0,-.15,.04],width:.2,aim:false,kind:'ring'});
  wheel(k,right,'starBronze',.16,.018,mobile,.04);
  wheel(k,right,'glow',.185,.011,mobile,.079);
  const bun=k.bone(head,0,.103,.014);
  mass(k,bun,'bHair',[[0,.036,-.027,.130,.115],[.009,.089,-.003,.151,.130],
    [.027,.169,-.048,.107,.092],[.066,.236,-.12,.061,.067],[.078,.284,-.13,.022,.018]],mobile,45);
  for(const s of signs){
    for(let i=0;i<3;i++)sweep(k,bun,i===1?'starSoot':'bHair',mirror(s,[[.02+i*.034,.035,.131-i*.018,.016],
      [.065+i*.031,.108,.109-i*.028,.023],[.108+i*.019,.139,.042-i*.023,.025],[.131+i*.019,.059,-.089,.004]]),mobile);
    sweep(k,bun,'starBronze',mirror(s,[[.032,.073,.123,.02],[.104,.141,.072,.029],
      [.163,.177,-.048,.029],[.229,.158,-.146,.004]]),mobile);
    cloth.push({parent:body,name:'雷・強 珠白長袍 '+s,path:mirror(s,[[.103,.107,.218,.107],[.163,-.212,.269,.175],
      [.254,-.681,.374,.238],[.367,-1.137,.508,.169]]),tint:0xc5b5a3,trim:0xb47c4e,lining:0x61505d,phase:s*.92,flex:1.21});
    cloth.push({parent:body,name:'雷・強 雷鼓綬帶 '+s,path:mirror(s,[[.181,.382,-.178,.045],[.258,.135,-.287,.083],
      [.458,-.213,-.42,.120],[.622,-.607,-.61,.032]]),tint:0xb98856,trim:0xffc692,lining:0x5b3962,phase:s*1.51,flex:1.37});
    sweep(k,body,'starBronze',mirror(s,[[.056,.535,.211,.012],[.126,.497,.236,.022],
      [.178,.366,.248,.020],[.123,.228,.251,.006]]),mobile);
  }
  return ({beat,wind,strike})=>{
    wheelRig.rotation.z=beat*.26+wind*.34-strike*.32;
    drum.rotation.x=wind*.11-strike*.22;
    bun.rotation.y=Math.sin(beat*.85)*.029+strike*.07;
  };
}

const sculpts={m069:windsage,m070:firekeeper,m071:tideKeeper,m072:stormPercussion};

export function sculptStrongConstellation(k,entry,parts,mobile){
  const cloth=[],pose=sculpts[entry.id](k,parts,mobile,cloth);
  return {cloth,pose};
}
