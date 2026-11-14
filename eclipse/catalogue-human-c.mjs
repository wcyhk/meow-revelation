import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {curvedPlate} from './catalogue-c-detail.mjs?v=maskwork-1';

const sides=[-1,1],tau=Math.PI*2;
const seam=(k,part,finish,points)=>k.sculpt.sweep(part,finish,points,{sides:6,steps:9,ridge:.13});
const trim=(k,part,finish,points,depth=.032)=>k.sculpt.plate(part,finish,points,depth,.012);

// Measured from the head pivot. Each set states jaw span, temple span, eye
// spacing, eye set-back, cheek height, nose projection, forehead and rear dome.
const heads={
  m113:[.108,.167,.083,.127,.066,.195,.263,.145,'fang','rays'],
  m118:[.119,.159,.064,.144,.052,.196,.226,.154,'simian','disk'],
  m119:[.100,.166,.069,.134,.061,.209,.236,.162,'beard','wrap'],
  m120:[.145,.180,.097,.139,.049,.175,.205,.164,'trunk','crest'],
  m123:[.107,.154,.079,.145,.052,.198,.255,.161,'moustache','sun'],
  m135:[.086,.144,.062,.141,.046,.184,.210,.131,'seer','plait'],
  m137:[.122,.172,.087,.145,.065,.193,.238,.193,'mask','flame'],
  m139:[.107,.165,.076,.139,.059,.201,.252,.178,'beard','bow'],
  m141:[.118,.178,.092,.145,.074,.215,.231,.189,'fang','tusk'],
  m142:[.141,.194,.097,.139,.071,.206,.197,.198,'rot','fungus'],
  m143:[.124,.174,.093,.151,.063,.205,.225,.174,'bone','skull'],
  m146:[.068,.142,.059,.145,.035,.182,.246,.155,'chrysalis','moth'],
  m147:[.096,.164,.086,.134,.055,.202,.218,.168,'bone','halberd'],
  'raid-flame':[.162,.194,.104,.150,.069,.212,.253,.171,'slag','slag'],
};

function facialMesh(k,head,finish,profile,mobile){
  const [chin,skull,eye,depth,cheek,nose,crown,rear,style]=profile;
  const geometry=new T.BufferGeometry(),positions=[],colors=[],uv=[],indices=[];
  const rows=[
    [-.185,chin*.72,.073,rear*.32],[-.129,chin,.099,rear*.54],[-.094,skull*.89,.116,rear*.70],
    [-.047,skull,.119,rear*.92],[.004,skull,depth,rear],[.047,skull*.96,depth,rear*1.03],
    [.088,skull*.99,depth*.92,rear],[.149,skull*.96,depth*.78,rear*.97],
    [.191,skull*.83,depth*.67,rear*.92],[crown,skull*.53,depth*.36,rear*.75],[crown+.034,.022,.013,rear*.23],
  ];
  const segments=mobile?24:36;
  for(const [row,[y,width,front,back]] of rows.entries()){
    for(let i=0;i<=segments;i++){
      const a=i*tau/segments,sin=Math.sin(a),cos=Math.cos(a),x=sin*width;
      let z=cos*(cos>=0?front:back);
      if(cos>0){
        const dyEye=y-.041,dyCheek=y+.035,dyBridge=y+.019,dxEye=Math.abs(x)-eye,dxCheek=Math.abs(x)-skull*.67;
        const isEye=Math.exp(-dxEye*dxEye/.00105-dyEye*dyEye/.0016);
        const isCheek=Math.exp(-dxCheek*dxCheek/.0021-dyCheek*dyCheek/.0030);
        const bridge=Math.exp(-x*x/.0013-dyBridge*dyBridge/.011);
        z+=cos*(-.050*isEye+isCheek*cheek*.57+(nose-depth)*bridge);
        if(style==='simian')z+=cos*Math.exp(-(x*x)/.008-((y+.084)**2)/.0013)*.031;
        if(style==='chrysalis')z+=cos*Math.cos(x*57)*.008;
      }
      const yoff=(style==='rot'||style==='slag')?Math.cos(a*3+y*12)*.010:0;
      positions.push(x,y+yoff,z);
      const shade=.68+.20*cos+.032*Math.cos(i*2.18+row*4.2);
      colors.push(shade*1.06,shade,shade*.96);
      uv.push(i/segments,row/(rows.length-1));
      if(row<rows.length-1&&i<segments){
        const one=row*(segments+1)+i,next=one+segments+1;
        indices.push(one,one+1,next,next,one+1,next+1);
      }
    }
  }
  geometry.setIndex(indices);
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  k.geometry(head,finish,geometry);
}

function moustache(k,head,x,nose,length,finish){
  seam(k,head,finish,[[x*.045,-.073,nose-.019,.015],[x*.074,-.078,nose+.011,.019],
    [x*.113,-.110,nose+.006,.017],[x*(.115+length),-.146+length*.35,nose-.037,.012],
    [x*(.137+length*.94),-.141+length*.72,nose-.084,.002]]);
}

function faceFittings(k,head,profile,id){
  const [chin,width,eye,depth,cheek,nose,crown,rear,style,helm]=profile;
  const eyes=style==='bone'||style==='slag'||style==='fang'||style==='rot'?1.18:1;
  for(const side of sides){
    const x=eye*side;
    const browY=.098+(style==='seer'?-.019:style==='slag'?.024:0);
    seam(k,head,'deep',[[x*.49,browY-.028,depth+.007,.017],[x*.9,browY,depth+.007,.019],
      [x*1.34,browY+.017,depth-.025,.016],[x*1.58,browY-.01,depth-.068,.004]]);
    k.mesh(head,'round','deep',x,browY-.046,depth-.011,.039*eyes,.023*eyes,.021);
    k.mesh(head,'gem','glow',x,browY-.042,depth+.010,.024*eyes,.009*eyes,.009);
    seam(k,head,style==='bone'?'edge':'identityHide',[[x*.65,browY-.069,depth+.014,.008],
      [x,browY-.076,depth+.02,.009],[x*1.40,browY-.064,depth-.009,.004]]);
    if(['beard','moustache','seer','simian'].includes(style)){
      moustache(k,head,side,nose,style==='moustache'?.038:.012,style==='seer'?'identityHide':'deep');
    }
    if(style==='beard'||(style==='moustache'&&id==='m123')){
      for(let i=0;i<5;i++){
        const dx=side*(.015+i*.014),swell=.047*Math.sin((i+.65)*.47);
        seam(k,head,i%2?'identityHide':'deep',[[dx,-.114,nose-.053,.014],
          [dx*1.32,-.163,nose-.033,.018],[dx*1.09,-.222-swell,nose-.050,.014],
          [dx*.8,-.248-swell,nose-.103,.002]]);
      }
    }
    if(style==='fang'||style==='bone'){
      for(let i=0;i<(style==='bone'?4:2);i++){
        const dx=side*(.043+i*.019);
        seam(k,head,'edge',[[dx,-.09,nose-.068,.014],[dx*1.11,-.128,nose-.044,.015],
          [dx*1.05,-.172+i*.006,nose-.035,.002]]);
      }
    }
    if(['slag','mask','rot','chrysalis'].includes(style)){
      for(let i=0;i<3;i++){
        const t=i/2,z=depth-.05-i*.027,y=.067-i*.071;
        trim(k,head,i===1?'edge':'identityMetal',[[side*.11,y+.043,z+.035],[side*(width+.05),y+.061,z-.087],
          [side*(width+.042),y-.02,z-.138],[side*.141,y-.047,z-.018],[side*.091,y-.018,z+.034]],.022);
        if(i!==1)seam(k,head,style==='slag'?'ember':'deep',[[side*.117,y+.038,z+.046],[side*.157,y+.031,z+.014,.016],
          [side*.187,y-.004,z-.059,.011],[side*.19,y-.023,z-.10,.001]].map(p=>p.length===3?[...p,.008]:p));
      }
    }
    const ear=side*width*.91;
    k.mesh(head,'round','identityHide',ear,.024,-.018,.034,.054,.029,0,0,side*.26);
    if(helm==='disk'||helm==='wrap'||helm==='sun'||helm==='crest'){
      for(let i=0;i<3;i++){
        const a=i*1.51+.06,y=-.017+Math.sin(a)*.038,z=-.013+Math.cos(a)*.035;
        k.mesh(head,'gem','trim',ear+side*.023,y,z,.016,.018,.015);
      }
    }
  }
  if(style!=='trunk')curvedPlate(k,head,'identityHide',[[0,-.071,nose-.020,chin*.15,.019],[0,-.038,nose,.037,.038],
    [0,.018,nose-.016,.027,.022],[0,.076,depth*.96,.017,.012]],.13);
  if(['bone','slag','rot','fang','mask'].includes(style)){
    seam(k,head,'identityMetal',[[0,.085,depth+.017,.026],[0,.154,depth+.041,.044],
      [0,crown*.94,depth*.66,.037],[0,crown+.066,-.003,.013]]);
  }
}

function helm(k,head,profile,id,mobile){
  const [,width,,depth,,,top,rear,,type]=profile;
  const shielded=['rays','sun','flame','bow','tusk','skull','halberd','slag'].includes(type);
  for(const side of sides){
    const sx=x=>side*x;
    for(let i=0;i<(mobile?3:4);i++){
      const t=i/3,y=.225-t*.091;
      curvedPlate(k,head,i%3===0?'identityMetal':'rind',[[sx(.02),y,-rear*.98,.027,.024],
        [sx(width*.46),y-.009,-rear*1.04,.042,.025],[sx(width*.78),y-.025,-rear*.82,.045,.030],
        [sx(width*.98),y-.059,-rear*.27,.007,.008]]);
    }
    if(shielded){
      const slit=type==='rays'||type==='tusk'?-.07:.006;
      trim(k,head,'identityMetal',[[sx(.092),top*.64,.084],[sx(width*1.14),top*.65,.025],
        [sx(width*1.26),.029,-.067],[sx(width*1.17),slit,-rear*.88],[sx(width*.60),slit-.031,-rear*.90],
        [sx(width*.72),.068,.050]]);
      seam(k,head,'trim',[[sx(.093),top*.67,.093,.016],[sx(width*1.10),top*.60,.048,.019],
        [sx(width*1.25),.016,-.062,.018],[sx(width*1.13),slit-.02,-rear*.92,.002]]);
    }
    if(type==='bow'||type==='skull'||type==='halberd'){
      const y=type==='skull'?.112:.181;
      seam(k,head,'identityMetal',[[sx(.05),y,depth*.85,.023],[sx(.16),y+.13,depth*.33,.033],
        [sx(.205),y+.17,-.104,.036],[sx(.26),y+.095,-.223,.022],[sx(.27),y+.072,-.290,.003]]);
    }else if(type==='tusk'){
      seam(k,head,'edge',[[sx(.089),.125,depth*.79,.023],[sx(.16),.175,.028,.033],
        [sx(.218),.138,-.019,.030],[sx(.229),.042,-.061,.020],[sx(.24),-.156,-.083,.003]]);
    }else if(type==='rapture'||id==='m142'){
      for(let j=0;j<3;j++)k.mesh(head,'gem','identityMetal',sx(.156+j*.029),.209-j*.074,-.103,.055,.073,.038);
    }else if(type==='disk'||type==='wrap'||type==='crest'){
      seam(k,head,'trim',[[0,top,.052,.017],[sx(.08),top+.019,.02,.023],
        [sx(width*.89),top*.87,-.051,.025],[sx(width*.98),top*.56,-.125,.016],[sx(.082),top*.31,-.171,.002]]);
    }
  }
}

export function sculptChampionFace(k,head,id,mobile){
  const profile=heads[id];
  facialMesh(k,head,'identityHide',profile,mobile);
  faceFittings(k,head,profile,id);
  helm(k,head,profile,id,mobile);
}

// Shoulder root > outside edge > lower side > back at sleeve height. The
// contours are deliberately separate assets so each model has its own outline.
const profiles={
  m113:{shell:[.32,.16,.18,.136,.28],shape:'sun',armor:'guard',back:'ashes',belly:.28,shade:0x8c361f,skin:0x9b5b40},
  m118:{shell:[.23,.117,.18,.208,.25],shape:'round',armor:'lamellar',back:'sash',belly:.24,shade:0x49666b,skin:0x856757},
  m119:{shell:[.24,.093,.223,.24,.17],shape:'taper',armor:'bib',back:'hide',belly:.24,shade:0x594855,skin:0xa0805d},
  m120:{shell:[.34,.17,.224,.178,.26],shape:'horn',armor:'belts',back:'scarves',belly:.29,shade:0x43596e,skin:0x7c7d78},
  m123:{shell:[.28,.21,.195,.163,.31],shape:'sun',armor:'bib',back:'medal',belly:.29,shade:0x826c3a,skin:0x806245},
  m135:{shell:[.166,.094,.132,.117,.11],shape:'veil',armor:'talisman',back:'ribbons',belly:.214,shade:0x436786,skin:0xa88375},
  m137:{shell:[.38,.184,.204,.218,.22],shape:'flame',armor:'guard',back:'sparks',belly:.30,shade:0x823b2d,skin:0x663e37},
  m139:{shell:[.334,.156,.254,.175,.27],shape:'scale',armor:'lamellar',back:'bowplate',belly:.28,shade:0x6f6256,skin:0x886c59},
  m141:{shell:[.42,.212,.236,.234,.37],shape:'horn',armor:'belts',back:'spine',belly:.34,shade:0x653f42,skin:0x6e4941},
  m142:{shell:[.418,.17,.24,.164,.28],shape:'rot',armor:'fibers',back:'mycelium',belly:.30,shade:0x6f6329,skin:0x6a5e36},
  m143:{shell:[.329,.196,.255,.198,.334],shape:'bone',armor:'hide',back:'ribs',belly:.33,shade:0x836f44,skin:0x756b4c},
  m146:{shell:[.275,.126,.144,.099,.244],shape:'moth',armor:'talisman',back:'web',belly:.214,shade:0x614a7f,skin:0x875e81},
  m147:{shell:[.441,.179,.238,.282,.291],shape:'scale',armor:'guard',back:'plates',belly:.34,shade:0x746954,skin:0x7b7159},
  'raid-flame':{shell:[.44,.192,.281,.259,.294],shape:'slag',armor:'fibers',back:'lava',belly:.37,shade:0x8b4a36,skin:0x593b32},
};

function shoulderFittings(k,part,side,profile,mobile){
  const [width,rise,front,drop,rear]=profile.shell;
  const style=profile.shape,x=v=>v*side;
  const count=mobile?2:3;
  for(let i=0;i<count;i++){
    const radius=width*(1-i*.16),y=-i*.099;
    const peaky=['sun','horn','flame','rot','slag'].includes(style);
    const lift=rise*(1-i*.185)*(peaky?1.15:.87);
    const thick=style==='veil'||style==='moth'?.035:.058;
    curvedPlate(k,part,i%2?'rind':'identityMetal',[[x(.034),y+.055,front*.61,.043,.028],
      [x(radius*.38),y+.092,front*.29,.084,thick],
      [x(radius*.78),y+lift,front*.031,.078,thick*.85],[x(radius),y+lift*.61,-rear*.26,.055,thick*.69],
      [x(radius*.90),y-lift*.43,-rear*.73,.035,thick*.42],[x(radius*.61),y-drop*.58,-rear,.003,.003]]);
    seam(k,part,i%2?'edge':'trim',[[x(.044),y+.03,front*.86,.016],
      [x(radius*.41),y+.077,front*.62,.021],[x(radius*.81),y+lift*.88,front*.17,.021],
      [x(radius),y+lift*.42,-rear*.20,.014],[x(radius*.93),y-.018,-rear*.55,.0025]]);
  }
  if(['horn','flame','rot','slag','bone'].includes(style)){
    const y=style==='bone'?.117:.078;
    seam(k,part,style==='slag'?'ember':'edge',[[x(width*.52),y,-rear*.56,.036],
      [x(width*.89),y+rise*.74,-rear*.67,.049],[x(width*1.08),y+rise*1.17,-rear*.89,.028],
      [x(width*1.13),y+rise*1.74,-rear*1.04,.003]]);
  }
  if(style==='moth'||style==='veil'){
    const hanging=k.bone(part,x(width*.54),-.06,rear*.22);
    for(let n=0;n<3;n++){
      seam(k,hanging,n%2?'identityMetal':'silk',[[x(.02+n*.042),.028,0,.029],
        [x(.09+n*.05),-.090,-n*.042,.035],[x(.097+n*.063),-.19,-.079-n*.039,.017],
        [x(.111+n*.067),-.26,-.15-n*.032,.003]]);
    }
  }
}

function rearFittings(k,root,profile,depth,mobile){
  const group=k.bone(root,0,0,0);
  const style=profile.back,z=-depth*1.10;
  if(style==='ribs'||style==='spine'||style==='plates'||style==='bowplate'||style==='lava'||style==='sparks'){
    for(let i=0;i<(mobile?4:6);i++){
      const y=1.49-i*.128;
      const f=profile.belly*(.88-i*.079);
      for(const side of sides){
        const r=f*side;
        const special=style==='spine'?'edge':style==='lava'||style==='sparks'?'ember':'identityMetal';
        curvedPlate(k,group,style==='ribs'?'edge':'rind',[[r*.065,y,z,.042,.034],
          [r*.44,y+.026,z-.046,.083,.045],[r*.82,y-.033,z+.005,.060,.037],
          [r,y-.071,z+.041,.009,.009]],.20);
        seam(k,group,i%2?'trim':special,[[r*.11,y-.017,z-.047,.017],[r*.49,y-.002,z-.071,.022],
          [r*.84,y-.056,z-.029,.014],[r,y-.069,z+.048,.003]]);
      }
    }
  }else if(style==='scarves'||style==='ribbons'||style==='sash'||style==='hide'){
    for(const side of sides){
      for(let i=0;i<(style==='sash'?2:4);i++){
        const x=side*(.058+i*.062);
        curvedPlate(k,group,i%2?'silk':'identityMetal',[[x*.57,1.5,z+.071,.053,.025],
          [x,1.24,z-.045,.055,.027],[x*1.22,.86,z-.097,.038,.026],
          [x*1.54-.02,.63+i*.058,z-.19,.004,.004]]);
      }
    }
  }else{
    const cy=1.32;
    for(let i=0;i<(mobile?5:8);i++){
      const a=i*tau/(mobile?5:8),s=Math.sin(a),c=Math.cos(a),r=.17;
      const scale=style==='medal'?.89:style==='web'?1.13:1.26;
      seam(k,group,i%2?(style==='ashes'?'ember':'edge'):'identityMetal',[[s*r*.17,cy+c*r*.17,z-.06,.023],
        [s*r*.68+c*.04,cy+c*r*.68-s*.04,z-.088,.030],[s*r*scale,cy+c*r*scale,z-.062,.025],
        [s*r*scale*1.47,cy+c*r*scale*1.45,z-.039,.003]]);
    }
  }
  return group;
}

export function fittedChampionArmor(k,body,shoulders,depth,id,mobile){
  const profile=profiles[id];
  const style=profile.armor,z=depth*1.03;
  const rows=style==='lamellar'?(mobile?4:5):style==='fibers'?4:3;
  for(let i=0;i<rows;i++){
    const p=profile.belly*(1-i*.079);
    const y=1.47-i*(style==='lamellar'?.12:.141);
    const metal=style==='hide'?'identityHide':style==='talisman'?'silk':i%2?'identityMetal':'rind';
    for(const side of sides){
      const x=p*side;
      curvedPlate(k,body,metal,[[x*.03,y+.055,z*.80,.044,.018],[x*.27,y+.052,z*1.10,.074,.033],
        [x*.59,y+.034,z,.086,.046],[x*.91,y-.019,z*.75,.068,.037],
        [x,y-.049,z*.44,.007,.009]],.15);
      if(style==='lamellar'||style==='belts'||style==='guard'){
        for(let j=0;j<(mobile?2:3);j++){
          const t=j/3;
          k.mesh(body,'gem','trim',x*(.18+t*.64),y-.006-t*.028,z*(1.10-t*.24),.018,.017,.014);
        }
      }
      if(style==='talisman'||style==='fibers'){
        seam(k,body,i%2?'identityMetal':'trim',[[x*.13,y+.062,z+.041,.014],[x*.29,y-.039,z+.041,.018],
          [x*.52,y-.136,z+.018,.013],[x*.71,y-.225,z-.010,.002]]);
      }
    }
  }
  for(const {shoulder,side,raised} of shoulders)if(!raised)shoulderFittings(k,shoulder,side,profile,mobile);
  return rearFittings(k,body,profile,depth,mobile);
}

export const identityFinishes=Object.fromEntries(Object.entries(profiles).map(([id,value])=>[id,{
  identityMetal:[value.shade,.48,.46,['m113','m123','m141'].includes(id)?'bronze':'iron'],
  identityHide:[value.skin,.07,.68,'hide'],
}]));
