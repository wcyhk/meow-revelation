import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],turn=Math.PI*2;
const mirror=(side,path)=>path.map(([x,...tail])=>[x*side,...tail]);
const plate=(k,joint,finish,path,depth=.052)=>k.sculpt.plate(joint,finish,path,depth,depth*.41);
const vein=(k,joint,finish,path,width=.024)=>k.sculpt.sweep(joint,finish,
  path.map(([x,y,z,r=width])=>[x,y,z,r]),{sides:6,steps:11,ridge:.19});
const gem=(k,joint,finish,x,y,z,w,h=w,d=w)=>k.mesh(joint,'gem',finish,x,y,z,w,h,d);

function sculpt(k,joint,finish,path,mobile,{section=2.43,ridge=.23,seed=0,fur=false}={}){
  k.geometry(joint,finish,sculptVolume(path.map(([x,y,z,w,d=w])=>[x,y,z,w,d]),
    {section,ridge,seed,fur,sides:mobile?8:11,rings:mobile?10:15}));
}

// Separate unpainted metal, colored enamel, aged biological surfaces and cloth.
const palettes=[
  [0x482934,0x95462f,0xbba17f,0x31212e], [0x345052,0x317d76,0xc2d9b5,0x1d3338],
  [0x34496c,0x586587,0xc4d9e1,0x272135], [0x432529,0x9d3924,0x99816c,0x241922],
  [0x39304a,0x6e325d,0xd5b2c1,0x251e32], [0x37303a,0x9a6938,0xbba379,0x27232a],
  [0x58353b,0xa2623c,0xd9ad81,0x38252b], [0x274245,0x48775f,0xc0ac7e,0x1a302f],
  [0x3c3055,0x664488,0xb9a8ce,0x241c33], [0x332d3f,0x72252f,0xd2ac79,0x211926],
  [0x4a3935,0x755329,0xc3ae91,0x2b252b], [0x284751,0x367b78,0x9fc6bb,0x162d34],
  [0x354657,0x477994,0xa5cfde,0x222b38], [0x42303a,0x934734,0xa9866d,0x261b27],
  [0x4d3a50,0x805877,0xd6c1ae,0x382239], [0x4e3433,0xa77739,0xdab68c,0x30232b],
  [0x412a41,0x8c5b43,0xcda680,0x30252b], [0x304039,0x487a51,0xa7ba80,0x21352d],
  [0x41304c,0x714d89,0xc3add1,0x2d213a], [0x382b43,0x8f3447,0xc19d8f,0x261b2b],
];

function materials(k,number){
  const [iron,enamel,bone,cloth]=palettes[number];
  const metal=(color,roughness,metalness,finish)=>paintedFinish(new T.MeshStandardMaterial({
    color,roughness,metalness,vertexColors:true,envMap:forgeEnvironment(),envMapIntensity:.63,
  }),finish,true,true);
  k.materials.carvedIron=metal(iron,.43,.66,'iron');
  k.materials.carvedEnamel=metal(enamel,.47,.43,'bronze');
  k.materials.carvedIvory=metal(bone,.58,.13,'bone');
  k.materials.carvedCloth=metal(cloth,.88,.035,'cloth');
}

function hangs(k,model,parent,x,y,z,{axis='x',amp=.20,bias=0,seed=0}={}){
  const hinge=k.bone(parent,x,y,z);
  model.campaign.flaps.push({joint:hinge,axis,amp,bias,seed});
  return hinge;
}

// Closed beading and a recessed second surface make the joints readable from behind.
function lame(k,joint,points,{finish='carvedIron',edge='carvedEnamel',depth=.055,trim=.02}={}){
  plate(k,joint,finish,points,depth);
  vein(k,joint,edge,points.slice(0,4),trim);
}

function collar(k,m,{wide,y,z,drop,crest,mobile}){
  const rear=z<0,sign=rear?-1:1;
  for(const side of sides){
    const arm=m.arms?.[side>0?1:0];
    for(let row=0;row<3;row++){
      const top=y-row*drop*.36,reach=wide*(1-row*.095),front=z+sign*row*.016;
      const shape=mirror(side,[[.025,top+.054,front],[reach*.54,top+.15,front+sign*.025],
        [reach*.97,top+.093,front-sign*.071],[reach*1.19,top-.021,front-sign*.26],
        [reach*.80,top-drop*.46,front-sign*.106],[reach*.26,top-drop*.59,front+sign*.015]]);
      lame(k,m.body,shape,{finish:row===1?'carvedEnamel':'carvedIron',edge:row===1?'carvedIvory':'carvedEnamel',depth:.060});
      gem(k,m.body,'carvedIvory',side*reach*.70,top-.006,front+sign*.038,.023,.032,.019);
      if(row===1)vein(k,m.body,'glow',mirror(side,[[.11,top-.045,front+sign*.042],[reach*.49,top+.007,front+sign*.049],
        [reach*.83,top-.047,front-sign*.038],[reach,top-.041,front-sign*.097]]),.010);
    }
    if(!arm)continue;
    const points=mirror(side,[[.02,.107,.120],[.132,.194,.043],[.222,.197,-.088],
      [.257,.104,-.182],[.188,-.083,-.174],[.050,-.143,-.067],[.015,-.061,.085]]);
    lame(k,arm,points,{finish:'carvedIron',edge:'carvedIvory',depth:.057});
    if(!mobile)gem(k,arm,'carvedEnamel',side*.147,.113,-.164,.046,.065,.028);
  }
  if(crest){
    const anchor=k.bone(m.body,0,y-drop*.30,z+sign*.105);
    anchor.rotation.y=rear?Math.PI:0;
    seal(k,anchor,crest,numberOfPoints(crest));
  }
}

const numberOfPoints=style=>({crown:3,clock:12,shackle:7,weight:6,sun:10,silk:8,lotus:5}[style]??5);
function seal(k,joint,style,count){
  const wide=style==='weight'?.222:.164;
  k.mesh(joint,'ring','carvedIvory',0,0,.031,wide,wide,wide*.83);
  k.mesh(joint,'bar','carvedIron',0,0,0,wide*.95,.095,wide*.95,Math.PI/2);
  for(let i=0;i<count;i++){
    const a=i*turn/count,x=Math.sin(a),y=Math.cos(a);
    const short=1+(i%2)*.15;
    const work=[[x*wide*.37,y*wide*.37,.075,.016],[x*wide*.93,y*wide*.93,.070,.023],
      [x*wide*1.28*short,y*wide*1.28*short,.024,.005]];
    vein(k,joint,i%3===0?'glow':'carvedEnamel',work);
  }
  gem(k,joint,'glow',0,0,.084,wide*.27,wide*.42,wide*.20);
}

function brow(k,m,{w=.23,z=.28,y=.06,h=.15,slope=.04,mobile}){
  for(const side of sides){
    const track=mirror(side,[[w*.22,y+.041,z+.018,.013,.016],[w*.51,y+.074+slope,z+.006,.045,.029],
      [w*.88,y+.074,z-.036,.055,.033],[w*1.30,y+.055,z-.163,.036,.030],[w*1.34,y+.106,z-.243,.004,.005]]);
    sculpt(k,m.head,'carvedIron',track,mobile,{section:3});
    vein(k,m.head,'carvedIvory',track.map(([x,y,z,r])=>[x,y+.031,z+.017,r*.42]));
    const jaw=mirror(side,[[w*.27,y-.097,z+.084],[w*.61,y-.070,z+.047],[w*1.09,y+.028,z-.087],
      [w*1.20,y-.08,z-.144],[w*.98,y-h*.96,z-.055],[w*.36,y-h*1.38,z+.086]]);
    lame(k,m.head,jaw,{finish:'carvedEnamel',edge:'carvedIvory',depth:.04,trim:.012});
  }
}

function locks(k,m,parent,{y,z,length,width,amount=5,finish='carvedIvory',mobile}){
  for(let i=0;i<amount;i++){
    const t=i-(amount-1)/2,x=t*width/amount,side=Math.sign(t)||1;
    const l=length*(.79+.19*Math.cos(t*.58));
    const lock=hangs(k,m,parent,x,y-.006*Math.abs(t),z-.023*Math.abs(t),{
      amp:.14+i*.015,bias:-side*.061,seed:i*1.2,
    });
    sculpt(k,lock,finish,[[0,.024,0,.049,.028],[side*.034,-l*.28,.041,.060,.027],
      [side*.021,-l*.59,.080,.055,.021],[-side*.039,-l*.83,.11,.037,.016],
      [-side*.073,-l,.166,.004,.005]],mobile,{ridge:.30,seed:i,fur:true});
    vein(k,lock,finish==='carvedCloth'?'carvedEnamel':'trim',[[0,-.04,.028,.009],
      [side*.036,-l*.34,.073,.013],[side*.011,-l*.68,.105,.010],[-side*.052,-l*.89,.136,.004]]);
  }
}

function wingWork(k,m,type,mobile){
  for(const {root,elbow,hand,side} of m.flight){
    const feather=type==='ash'||type==='paper';
    const finish=type==='glass'?'carvedEnamel':type==='root'?'carvedCloth':'carvedIron';
    sculpt(k,root,finish,mirror(side,[[.005,.059,-.039,.094],[.151,.198,-.099,.129],
      [.306,.274,-.135,.112],[.566,.298,-.211,.054],[.628,.325,-.278,.005]]),mobile);
    for(let row=0;row<(mobile?3:5);row++){
      const i=row*.154, y=.315-row*.085;
      if(feather){
        const points=mirror(side,[[.102+i,y,.045-i*.12],[.228+i,y-.141,-.151-i*.093],
          [.352+i,y-.442-row*.035,-.304-i*.11]]);
        k.geometry(elbow,row%3?'carvedEnamel':'carvedIvory',featherVane(...points,.105,19+row,mobile?7:10));
      }else{
        const cuff=mirror(side,[[.080+i,y,.027-i*.149],[.286+i,y+.101,-.036-i*.12],
          [.472+i,y+.067,-.135-i*.13],[.378+i,y-.092,-.203-i*.12],
          [.272+i,y-.257,-.291-i*.15],[.208+i,y-.102,-.154-i*.08]]);
        lame(k,elbow,cuff,{finish:row%2?finish:'carvedCloth',edge:'carvedIvory',depth:.041,trim:.011});
      }
    }
    if(type==='glass'||type==='moth'){
      const orbit=k.bone(hand,side*.23,-.19,-.20);
      orbit.rotation.set(Math.PI*.16,Math.PI,side*.35);
      seal(k,orbit,type==='glass'?'shackle':'silk',type==='glass'?6:8);
    }
    if(type==='glass'){
      const arches=mirror(side,[[.066,.162,.058,.049],[.276,.285,-.049,.047],
        [.418,.253,-.170,.043],[.615,.057,-.236,.039],[.714,-.147,-.279,.008]]);
      sculpt(k,hand,'carvedIvory',arches,mobile,{section:3,ridge:.08});
      for(let i=0;i<3;i++){
        const x=.25+i*.175,y=.20-i*.139,z=-.11-i*.036;
        const glass=mirror(side,[[x-.105,y-.150,z+.065],[x-.087,y+.107,z+.014],
          [x+.025,y+.247,z-.131],[x+.168,y+.041,z-.141],[x+.105,y-.113,z-.050],
          [x+.025,y-.207,z-.031]]);
        lame(k,hand,glass,{finish:i===1?'glow':'carvedEnamel',edge:'carvedIron',depth:.054,trim:.020});
        vein(k,hand,'carvedIvory',glass.slice(1,4).map(([a,b,c])=>[a,b,c+.037]),.014);
      }
    }else if(type==='moth'){
      for(let i=0;i<(mobile?3:5);i++){
        const x=.097+i*.097,y=-.192-i*.065,depth=-.182-i*.037;
        const stream=mirror(side,[[x,y,depth],[x+.15,y-.218,depth-.051],
          [x+.14,y-.442-i*.027,depth-.147]]);
        k.geometry(hand,i%3?'carvedCloth':'carvedIvory',featherVane(...stream,.096-i*.007,i+5,mobile?8:11));
      }
    }
  }
}

function chitinCasing(k,m,style,mobile){
  const vault=style==='vault',width=vault?.91:.64,length=vault?1.74:1.07;
  for(let row=0;row<(mobile?4:5);row++){
    const p=row/(mobile?3:4),z=-length*.58+p*length;
    const air=Math.sin(p*Math.PI);
    const reach=width*(.74+.22*air),y=(vault?.58:.43)+air*.105;
    for(const side of sides){
      const over=mirror(side,[[.024,y+.232,z-.155,.036,.044],[reach*.29,y+.215,z-.143,.071,.056],
        [reach*.63,y+.084,z-.102,.076,.046],[reach*.91,y-.043,z-.040,.067,.045],
        [reach*1.14,y-.238,z+.074,.045,.029],[reach*1.09,y-.324,z+.117,.005,.005]]);
      sculpt(k,m.body,vault?'carvedIron':'carvedEnamel',over,mobile,{section:3.4,ridge:.27,seed:row});
      const seam=over.map(([x,y,z,r])=>[x+side*.022,y+.045,z-.013,Math.max(.004,r*.28)]);
      vein(k,m.body,row%2?'carvedIvory':'glow',seam);
      if(vault){
        const vent=mirror(side,[[reach*.93,y-.11,z-.095],[reach*1.06,y-.042,z-.063],
          [reach*1.22,y-.208,z+.006],[reach*1.20,y-.303,z+.05],[reach*.983,y-.252,z-.097]]);
        lame(k,m.body,vent,{finish:'carvedIron',depth:.075,edge:'carvedEnamel'});
      }
    }
  }
}

function neckRuff(k,m,type,mobile){
  const moth=type==='moth',glass=type==='glass',root=type==='root';
  for(const side of sides){
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?3:5), x=.096+t*.14;
      const track=mirror(side,[[x,.277-t*.24,.187,.024],[x+.079,.244-t*.22,.266-t*.085,.053,.030],
        [x+.184,.204-t*.28,.206-t*.11,.039,.022],[x+.201,.053-t*.29,.05-t*.12,.005]]);
      sculpt(k,m.body,i%3?'carvedIvory':'carvedCloth',track,mobile,{ridge:.29,seed:i,fur:moth||root});
    }
    if(moth||glass){
      const horn=glass?[[.074,.158,.162,.055],[.263,.326,.068,.082],[.326,.416,-.032,.068],
        [.307,.620,-.112,.034],[.237,.716,-.083,.005]]:
        [[.085,.124,.13,.039],[.245,.297,-.002,.062],[.401,.456,-.139,.039],
          [.462,.474,-.293,.022],[.391,.392,-.385,.005]];
      sculpt(k,m.head,glass?'carvedIvory':'carvedEnamel',mirror(side,horn),mobile,{ridge:.26});
    }
  }
  if(moth)locks(k,m,m.body,{y:.076,z:.265,length:.63,width:.24,amount:mobile?3:5,
    finish:'carvedCloth',mobile});
}

function shell(k,m,{depth,wide,y,style,mobile}){
  const hinge=m.tail??m.body,rocky=style==='slag',locks=style==='vault';
  for(const side of sides){
    for(let i=0;i<(mobile?4:5);i++){
      const z=depth+i*.267,x=wide*(.65+i*.047),top=y+.13*Math.sin(i*.81);
      const track=mirror(side,[[.14,top+.05,z-.15],[x*.64,top+.164,z-.157],[x,top+.119,z-.105],
        [x*1.17,top+.010,z+.017],[x*1.09,top-.114,z+.21],[x*.61,top-.036,z+.17],[.11,top+.028,z+.119]]);
      lame(k,m.body,track,{finish:i%2?'carvedEnamel':'carvedIron',edge:locks?'carvedIvory':'carvedEnamel',depth:.061});
      if(rocky||locks)vein(k,m.body,'glow',mirror(side,[[x*.44,top+.133,z-.131,.013],[x*.64,top+.164,z-.093,.025],
        [x*.79,top+.149,z+.018,.012],[x*.94,top+.112,z+.048,.005]]));
      if(rocky)sculpt(k,m.body,'carvedIron',mirror(side,[[x*.60,top+.062,z,.072],[x*.83,top+.203,z-.113,.092],
        [x*.95,top+.32-i*.017,z-.208,.042],[x*.89,top+.38-i*.033,z-.333,.005]]),mobile);
    }
    if(style==='deer'){
      const tine=mirror(side,[[.082,.194,.082,.053],[.28,.445,-.142,.071],[.46,.649,-.19,.060],
        [.608,.83,-.305,.032],[.571,1.05,-.489,.005]]);
      sculpt(k,m.head,'carvedIron',tine,mobile,{ridge:.35,fur:true});
      sculpt(k,m.head,'carvedIvory',mirror(side,[[.45,.65,-.19,.051],[.544,.804,-.10,.043],
        [.674,.908,-.10,.021],[.757,.954,-.14,.004]]),mobile);
    }
    if(rocky)sculpt(k,hinge,'carvedEnamel',mirror(side,[[.06,.115,-.22,.045],[.136,.213,-.39,.058],
      [.226,.29,-.54,.049],[.274,.37,-.66,.005]]),mobile);
  }
  if(style==='vault'||style==='silk')chitinCasing(k,m,style,mobile);
}

function river(k,m,solar,mobile){
  const {neck,tail}=m.campaign;
  for(const side of sides){
    const horns=mirror(side,[[.107,.117,.119,.062],[.226,.252,-.012,.067],[.362,.231,-.173,.056],
      [.412,.338,-.291,.037],[.333,.483,-.349,.004]]);
    sculpt(k,m.head,solar?'carvedEnamel':'carvedIvory',horns,mobile,{ridge:.31});
    for(let i=0;i<(mobile?4:6);i++){
      const y=.84-i*.151,h=.16+i*.014;
      const track=mirror(side,[[.05,y+.073,-.184],[h,y+.128,-.215],[h*1.35,y+.098,-.154],
        [h*1.50,y-.012,-.082],[h*1.05,y-.095,-.198],[.059,y-.046,-.239]]);
      lame(k,neck,track,{finish:i%2?'carvedEnamel':'carvedIron',edge:'carvedIvory',depth:.047});
    }
  }
  const point=k.bone(tail??m.tail,solar?.57:-.53,.41,-.42);
  point.rotation.x=-.48;
  seal(k,point,solar?'sun':'lotus',solar?10:6);
}

function finalWardens(k,m,king,mobile){
  for(const side of sides){
    const mantle=hangs(k,m,m.body,side*.30,.611,-.34,{axis:'z',amp:.21,bias:side*.037,seed:side+3.7});
    const shoulder=mirror(side,[[.014,.060,.037,.047,.057],[.090,.175,-.038,.118,.070],
      [.218,.251,-.134,.099,.062],[.347,.171,-.289,.063,.046],[.399,-.048,-.430,.017,.018]]);
    sculpt(k,mantle,king?'carvedEnamel':'carvedIron',shoulder,mobile,{section:3.1,ridge:.28,seed:side});
    const dagger=king?[[.081,.213,.099,.041],[.168,.327,.016,.059],[.201,.417,-.114,.045],
      [.203,.524,-.222,.030],[.159,.644,-.285,.004]]:
      [[.107,-.095,.152,.039],[.166,-.159,.227,.051],[.179,-.275,.230,.037],
        [.148,-.378,.209,.027],[.100,-.489,.157,.004]];
    sculpt(k,m.head,king?'carvedIron':'carvedIvory',mirror(side,dagger),mobile,{section:2.9,ridge:.17});
    vein(k,m.head,king?'carvedIvory':'carvedEnamel',mirror(side,dagger.map(([x,y,z,r])=>[x,y,z+.038,r*.39])));
    const count=mobile?3:4;
    for(let i=0;i<count;i++){
      const y=.098-i*.117,x=.075+i*.021,z=-.087-i*.024;
      const contour=mirror(side,[[x-.073,y+.093,z+.033],[x+.143,y+.125,z-.019],[x+.230,y+.017,z-.096],
        [x+.184,y-.186,z-.155],[x+.094,y-.224,z-.102],[x+.013,y-.085,z-.068]]);
      lame(k,mantle,contour,{finish:i%2?'carvedIron':'carvedEnamel',edge:i%2?'carvedEnamel':'carvedIvory',depth:.043});
      if(king)vein(k,mantle,'glow',contour.slice(2,5).map(([x,y,z],p)=>[x,y-.015,z-.027,[.006,.015,.003][p]]));
      else if(i<3)k.mesh(mantle,'chain','carvedIvory',side*(.148+i*.022),y-.107,z-.132,.07,.108,.69,0,i*.98,side*.13);
    }
  }
  const bridge=king?[[0,.063,.273,.021,.020],[-.006,.183,.295,.045,.026],
    [.008,.261,.229,.071,.037],[.014,.339,.172,.060,.027],[.005,.478,.041,.004,.006]]:
    [[0,.056,.245,.020,.024],[.014,-.039,.311,.053,.054],[-.007,-.141,.364,.046,.039],
      [.011,-.268,.324,.035,.024],[.02,-.376,.244,.004,.005]];
  sculpt(k,m.head,king?'carvedEnamel':'carvedIron',bridge,mobile,{section:2.9,ridge:.20});
  vein(k,m.head,king?'glow':'carvedIvory',bridge.map(([x,y,z,r])=>[x,y+.014,z+.026,r*.23]));
}

const armor={
  1:[.33,.62,.33,.40,'lotus'],2:[.35,.51,.35,.37,'lotus'],3:[.48,.54,.40,.53,'weight'],
  9:[.47,.57,.42,.48,'crown'],10:[.47,.52,.43,.45,'shackle'],12:[.42,.56,.39,.42,'shackle'],
  15:[.47,.52,.43,.43,'weight'],16:[.39,.54,.36,.40,'clock'],19:[.43,.54,.36,.49,'shackle'],
};

export function masterworkGuardian(k,m,entry,mobile){
  const id=entry.artId??entry.id;
  if(entry.field||!m.campaign||!id.startsWith('forest-'))return false;
  const n=Number(id.slice(7));
  if(!palettes[n])return false;
  materials(k,n);
  if(armor[n]){
    const [wide,y,z,drop,crest]=armor[n];
    collar(k,m,{wide,y,z,drop,crest,mobile});
    collar(k,{body:m.body},{wide:wide*.97,y:y+.103,z:-z*.99,drop:drop*.98,crest,mobile});
    if(n===9||n===19){
      brow(k,m,{w:.242,z:.269,y:.087,h:.17,mobile});
      finalWardens(k,m,n===9,mobile);
      const center=hangs(k,m,m.body,0,.49,-.45,{amp:.26,seed:7.3});
      locks(k,m,center,{y:0,z:0,length:n===19?1.29:1.05,width:.50,amount:mobile?3:5,finish:'carvedCloth',mobile});
    }
    if(n===10)locks(k,m,m.head,{y:-.119,z:.253,length:.42,width:.28,amount:mobile?5:7,mobile});
    if(n===2)brow(k,m,{w:.223,z:.286,y:.087,h:.159,slope:.068,mobile});
    if(n===12){
      for(const side of sides) for(let i=0;i<3;i++){
        const x=.17+i*.076, y=.21-i*.050;
        sculpt(k,m.head,i===1?'carvedIvory':'carvedEnamel',mirror(side,[[x*.72,y,.07,.041],
          [x,y+.11,-.045,.069,.045],[x+.055,y+.19,-.13,.046,.028],[x+.031,y+.27,-.197,.005]]),mobile);
      }
    }
    if(n===1){
      for(const side of sides)for(let i=0;i<3;i++){
        const fan=mirror(side,[[.038,.141,-.077,.045],[.126+i*.067,.295-i*.084,-.148,.102,.042],
          [.247+i*.080,.456-i*.115,-.241,.081,.031],[.329+i*.113,.648-i*.145,-.349,.004]]);
        sculpt(k,m.head,i%2?'carvedEnamel':'carvedIvory',fan,mobile,{ridge:.15});
      }
    }
  }else if(m.flight){
    const styles={0:'ash',8:'moth',14:'paper',17:'root',18:'glass'};
    wingWork(k,m,styles[n],mobile);
    neckRuff(k,m,styles[n],mobile);
    brow(k,m,{w:n===17?.27:n===0?.25:.18,y:n===0?.085:.062,z:n===17?.39:n===0?.40:.28,h:n===17?.18:.121,mobile});
    const spine=hangs(k,m,m.body,0,.247,-.301,{amp:.125,seed:4.4});
    locks(k,m,spine,{y:.056,z:-.09,length:n===17?.61:.46,width:.33,amount:mobile?3:5,
      finish:n===0||n===14?'carvedIvory':'carvedCloth',mobile});
  }else if(n===6||n===11){
    river(k,m,n===6,mobile);
  }else{
    const shellShape={4:[-.68,.60,.35,'silk'],5:[-.79,.69,.57,'vault'],7:[-.77,.38,.30,'deer'],13:[-.84,.49,.36,'slag']};
    const [depth,wide,y,style]=shellShape[n];
    shell(k,m,{depth,wide,y,style,mobile});
    brow(k,m,{w:n===4?.24:n===7?.21:.32,z:n===4?.33:.28,y:.084,h:.14,mobile});
  }
  return true;
}

const phantoms={
  '青喪骨皇':['bone',-.82,.39],
  '照屍孿影':['eyes',-.33,.45],
  '斷燈孿王':['iron',-.94,.67],
};
const branchForms={
  fire:'flare',ice:'fan',wind:'vane',lightning:'fork',light:'crown',earth:'shield',
  void:'eyes',blood:'bone',poison:'fan',
};
const seals={
  flare:[.390,.64,.21,3],fan:[.44,.48,.16,5],vane:[.58,.37,.16,4],fork:[.40,.65,.16,4],
  crown:[.38,.54,.12,5],shield:[.41,.31,.21,3],eyes:[.44,.42,.13,4],bone:[.39,.42,.23,4],
  iron:[.36,.51,.10,3],
};

export function masterworkHunt(k,m,entry,weapon,mobile){
  const phantom=phantoms[entry.id];
  if(!m.campaign||!entry.palette||!(weapon||phantom))return;
  if(!k.materials.carvedIron){
    const index=({fire:13,ice:12,wind:7,lightning:16,light:15,earth:5,void:8,blood:19,poison:17})[weapon?.element]??
      (phantom?.[0]==='bone'?17:phantom?.[0]==='eyes'?8:19);
    materials(k,index);
  }
  const type=phantom?.[0]??branchForms[weapon?.element]??'crown';
  const [width,height,depth,count]=seals[type];
  const ridges=mobile?count:count+1;
  const sigil=weapon?.sigil??3;
  const rear=phantom?.[1]??(m.back?-.49:m.tail?-.51:-.33);
  const y=phantom?.[2]??(m.tail?.position.z<-.55?.41:.54);
  const shell=hangs(k,m,m.body,0,y,rear,{amp:.087,bias:-.11,seed:(sigil%13)*.38});
  const spine=k.bone(shell,0,.052,-.071);
  spine.rotation.y=Math.PI;
  seal(k,spine,type==='eyes'?'silk':type==='crown'?'clock':'shackle',ridges+3);
  for(const side of sides){
    for(let i=0;i<ridges;i++){
      const t=i/(ridges-1),rise=height*(.66+.34*Math.cos(t*1.62));
      const z=-t*.093;
      const branch=hangs(k,m,shell,side*width*t*.59,-t*.20,z,{
        amp:.12+t*.08,bias:side*.07,seed:sigil*.16+i*.84,axis:'z',
      });
      const full=width*(.68+t*.56),forward=type==='vane'?.15:type==='fan'?-.14:-.029;
      const outline=mirror(side,[[.001,.035,.023,.031,.029],[full*.47,rise*.36,-depth*.34,.058,.030],
        [full*.89,rise*.52,-depth*.71,.041,.026],[full,rise*.83,-depth,.027,.019],
        [full*.80+forward,rise*(type==='shield'?.90:1.12),-depth*1.48,.004,.004]]);
      sculpt(k,branch,i%2?'carvedEnamel':'carvedIron',outline,mobile,{section:type==='bone'?1.78:3.2,ridge:.28});
      vein(k,branch,i%2?'carvedIvory':'glow',outline.map(([x,y,z,r])=>[x,y+.024,z-.022,r*.31]));
      if(type==='eyes'){
        const x=side*full*.67;
        gem(k,branch,'deep',x,rise*.365,-depth*.72,.078,.053,.029);
        gem(k,branch,'glow',x,rise*.371,-depth*.94,.035,.024,.023);
      }
    }
  }
}
