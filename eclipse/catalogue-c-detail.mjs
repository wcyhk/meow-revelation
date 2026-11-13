import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const line=(k,part,finish,track)=>k.sculpt.sweep(part,finish,track,{sides:6,steps:9,ridge:.13});
const volume=(k,part,finish,axis)=>k.geometry(part,finish,sculptVolume(axis,{
  rings:9,sides:9,section:2.18,ridge:.15,
}));
const shape=(k,part,finish,outline)=>k.sculpt.plate(part,finish,outline,.036,.009);

// Relief follows a crowned plate, keeping the weld seams on the metal as it
// curves around the ribcage or shingle. Each cross section is a continuous strip.
export function curvedPlate(k,part,finish,sections,ridge=.08){
  const form=sections.map(([x,y,z,width,depth])=>[x,y,z,width,depth]);
  k.geometry(part,finish,sculptVolume(form,{rings:12,sides:12,section:3.4,ridge}));
}

function rose(k,part,x,y,z,r,finish='trim'){
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,c=Math.cos(a),s=Math.sin(a);
    line(k,part,finish,[[x+r*.24*c,y+r*.24*s,z,r*.11],
      [x+r*.70*c-r*.20*s,y+r*.70*s+r*.20*c,z+.017,r*.11],
      [x+r*c,y+r*s,z+.011,r*.067],[x+r*.69*c+r*.18*s,y+r*.69*s-r*.18*c,z+.007,r*.013]]);
  }
  k.mesh(part,'gem','edge',x,y,z+.013,r*.19,r*.17,r*.12);
}

function seam(k,part,finish,start,end,radius=.008){
  k.rod(part,finish,start,end,radius);
}

export const designsC={
  m113:{depth:.315,face:'fiend',arm:'enamel',back:'flames',girth:.31,fasteners:6,emblem:'flame',streak:0xc8512a},
  m118:{depth:.301,face:'simian',arm:'mail',back:'crossed',girth:.26,fasteners:4,emblem:'braid',streak:0x3c7c79},
  m119:{depth:.359,face:'ash',arm:'ceremonial',back:'braid',girth:.32,fasteners:4,emblem:'crescent',streak:0x745d7f},
  m120:{depth:.297,face:'elephant',arm:'leather',back:'saddle',girth:.37,fasteners:5,emblem:'braid',streak:0x433a56},
  m123:{depth:.278,face:'regent',arm:'ceremonial',back:'sunburst',girth:.27,fasteners:5,emblem:'flower',streak:0x867a3e},
  m135:{depth:.258,face:'seer',arm:'silk',back:'knots',girth:.25,fasteners:4,emblem:'crescent',streak:0x356691},
  m137:{depth:.298,face:'redmask',arm:'enamel',back:'flames',girth:.30,fasteners:7,emblem:'flame',streak:0x8a292e},
  m139:{depth:.267,face:'regent',arm:'mail',back:'quiver',girth:.35,fasteners:6,emblem:'flower',streak:0x6f6b8b},
  m141:{depth:.398,face:'fiend',arm:'ceremonial',back:'braid',girth:.34,fasteners:6,emblem:'flame',streak:0x852b33},
  m142:{depth:.259,face:'maskrot',arm:'spore',back:'fungus',girth:.38,fasteners:5,emblem:'root',streak:0x676325},
  m143:{depth:.381,face:'skull',arm:'leather',back:'bones',girth:.42,fasteners:5,emblem:'bone',streak:0x948451},
  m146:{depth:.271,face:'moth',arm:'silk',back:'ribs',girth:.28,fasteners:5,emblem:'web',streak:0x594b88},
  m147:{depth:.291,face:'skull',arm:'mail',back:'crossed',girth:.35,fasteners:7,emblem:'bone',streak:0x666754},
  'raid-flame':{depth:.408,face:'slag',arm:'spore',back:'furnace',girth:.45,fasteners:6,emblem:'root',streak:0xd37336},
};

export function faceRelief(k,head,spec){
  const {face}=spec;
  const tex=['slag','maskrot','redmask'].includes(face)?'patina':'hide';
  if(face==='elephant'){
    for(const side of sides)for(let i=0;i<6;i++){
      const u=i/5;
      line(k,head,i%3?'hide':'edge',[[side*.141,.15-u*.13,-.025,.009],
        [side*(.265+Math.sin(u*3)*.04),.12-u*.19,.004,.018],[side*(.324-u*.052),.055-u*.18,.025,.001]]);
    }
    return;
  }
  const broad=['skull','slag','fiend','redmask'].includes(face);
  const uncovered=['seer','ash','simian','regent'].includes(face);
  const eyeY=.052;
  for(const side of sides){
    const x=(v)=>side*v;
    volume(k,head,uncovered?'hide':'deep',[[x(.044),eyeY-.035,.140,.029,.038],
      [x(.091),eyeY-.027,.140,.052,.040],[x(.138),eyeY-.044,.109,.064,.042],
      [x(.162),eyeY-.073,.059,.044,.033],[x(.151),eyeY-.100,-.016,.016,.013]]);
    if(broad){
      shape(k,head,face==='skull'?'edge':'patina',[[x(.033),-.051,.149],[x(.138),-.016,.118],
        [x(.160),-.091,.106],[x(.091),-.171,.159],[x(.043),-.131,.154]]);
      for(let tooth=0;tooth<3;tooth++){
        const y=-.103+tooth*.004,z=.168-tooth*.007;
        line(k,head,'edge',[[x(.026+tooth*.022),y,z,.013],[x(.027+tooth*.022),y-.041,z+.018,.008],
          [x(.027+tooth*.022),y-.044,z+.022,.002]]);
      }
    }else{
      line(k,head,tex,[[x(.023),-.098,.129,.012],[x(.064),-.103,.147,.011],
        [x(.109),-.091,.131,.001]]);
    }
    if(face==='moth'||face==='maskrot')for(let i=0;i<3;i++){
      const dx=.068+i*.035;
      line(k,head,i%2?'patina':'edge',[[x(dx),.09,.149,.016],[x(dx+.040),.112+i*.036,.127,.020],
        [x(dx+.076),.186+i*.042,.065,.002]]);
    }
    line(k,head,'trim',[[x(.155),.237,-.058,.014],[x(.175),.172,-.117,.018],
      [x(.153),.103,-.174,.017],[x(.106),-.006,-.200,.009]]);
  }
  volume(k,head,face==='skull'?'edge':tex,[[0,-.056,.166,.022,.028],[0,-.017,.164,.032,.035],
    [0,.061,.137,.026,.029],[0,.114,.145,.023,.024]]);
  if(face==='ash'||face==='regent'||face==='seer')rose(k,head,0,.126,.164,.029,'edge');
}

function stitchedShoulder(k,shoulder,side,style,mobile){
  const count=style==='mail'?(mobile?5:8):style==='spore'?4:5;
  for(let i=0;i<count;i++){
    const u=i/(count-1),x=side*(.086+u*.171);
    const y=.120-u*.037,z=-.158+Math.sin(u*2.53)*.058;
    const raised=style==='ceremonial'?.069:style==='spore'?.105:.033;
    line(k,shoulder,i%3===0?'edge':'patina',[[x*.72,y-.064,z+.026,.018],[x,y+raised,z,.023],
      [x*1.12,y+raised*.65,z-.041,.016],[x*1.17,y-.104,z-.019,.003]]);
    if(style==='leather'||style==='mail')k.mesh(shoulder,'gem','trim',x,y+.005,z+.245,.018,.024,.015);
  }
  if(style==='enamel'||style==='ceremonial'){
    rose(k,shoulder,side*.159,.070,.218,.055,'edge');
    line(k,shoulder,'patina',[[0,-.121,.166,.017],[side*.104,-.131,.218,.015],
      [side*.254,-.067,.141,.007]]);
  }
}

function heraldry(k,body,spec){
  const {girth,depth,emblem}=spec;
  const y=1.31,z=depth+.027;
  if(emblem==='flower')rose(k,body,0,y,z,.108,'edge');
  else if(emblem==='crescent'){
    line(k,body,'edge',[[-.118,y+.06,z,.015],[-.096,y-.030,z+.022,.024],
      [0,y-.086,z+.045,.028],[.100,y-.026,z+.022,.024],[.112,y+.063,z,.003]]);
    k.mesh(body,'gem','glow',0,y+.014,z+.022,.029,.037,.017);
  }else{
    for(const side of sides){
      const x=side*girth*.34;
      const drop=emblem==='flame'?.137:.100;
      const wave=emblem==='root'||emblem==='web';
      curvedPlate(k,body,emblem==='bone'?'edge':'patina',[[0,y-drop,z+.012,.014,.011],
        [x*.31,y-.034,z+.036,.024,.017],[x,y+.025,z+.011,.032,.028],
        [x*1.48,y+.11,z-.021,.022,.012],[x*(wave?2.19:1.68),y+.084,z-.057,.003,.003]]);
      if(wave)line(k,body,'trim',[[x*.29,y-.044,z+.044,.010],[x*.84,y-.094,z+.039,.013],
        [x*1.42,y-.122,z+.005,.002]]);
    }
    k.mesh(body,'gem',emblem==='flame'?'ember':'edge',0,y+.017,z+.074,.035,.057,.031);
  }
}

function backRig(k,body,spec,mobile){
  const {back,depth,girth}=spec,z=-depth-.012;
  const metal=['furnace','ribs','crossed','quiver','sunburst'].includes(back);
  const style=metal?'patina':'trim';
  for(let i=0;i<(mobile?4:6);i++){
    const y=1.41-i*.114,x=girth*(1.01-i*.065);
    if(back==='quiver'||back==='saddle'||back==='crossed'){
      if(i%2)continue;
      for(const side of sides)line(k,body,style,[[side*x,y+.13,z+.07,.027],
        [side*x*.73,y+.073,z-.03,.037],[0,y-.14,z-.065,.039],[-side*x*.90,y-.24,z+.04,.025]]);
    }else{
      for(const side of sides){
        const f=side*x;
        curvedPlate(k,body,style,[[f*.16,y,z,.042,.024],[f*.41,y+.023,z-.014,.049,.035],
          [f*.80,y-.02,z+.035,.033,.025],[f*.92,y-.075,z+.072,.004,.003]]);
      }
    }
  }
  if(back==='quiver'){
    const box=k.bone(body,.21,1.02,z-.08);
    box.rotation.z=-.44;
    volume(k,box,'deep',[[0,-.31,0,.069,.047],[0,-.115,-.024,.094,.066],
      [0,.24,-.04,.092,.071],[0,.271,-.04,.096,.072]]);
    for(let i=0;i<5;i++){
      const x=(i-2)*.030,y=.43+Math.sin(i*1.14)*.067;
      seam(k,box,'edge',[x,.22,-.025],[x,y,-.033],.008);
      shape(k,box,'ember',[[x,y-.060,-.045],[x-.020,y-.011,-.053],[x+.015,y+.016,-.050],[x+.021,y-.038,-.053]]);
    }
  }
  if(back==='bones'||back==='ribs'||back==='fungus'||back==='flames'||back==='furnace')for(let i=0;i<5;i++){
    const y=1.52-i*.142;
    for(const side of sides){
      const w=(girth*.52+i*.017)*side;
      curvedPlate(k,body,back==='bones'?'edge':back==='furnace'?'ember':'patina',[
        [w*.13,y,z+.06,.045,.031],[w*.46,y-.05,z-.085,.074,.052],
        [w*.91,y-.11,z-.099,.069,.033],[w*1.24,y-.15,z-.146,.004,.003]]);
    }
  }
}

export function championRelief(k,body,head,shoulders,fabric,id,mobile){
  const spec=designsC[id];
  faceRelief(k,head,spec);
  heraldry(k,body,spec);
  backRig(k,body,spec,mobile);
  for(const side of sides){
    for(let i=0;i<spec.fasteners;i++){
      const t=i/(spec.fasteners-1),x=side*spec.girth*(.82-t*.33);
      const y=1.46-t*.64,z=spec.depth*(.51+t*.52);
      k.mesh(body,'gem',i%2?'edge':'trim',x,y,z,.025,.026,.017);
      if(i%2===1)line(k,body,'patina',[[x*1.22,y-.020,z-.022,.012],[x*.90,y-.034,z+.013,.015],
        [x*.48,y-.082,z+.029,.002]]);
    }
  }
  for(const {shoulder,side,raised} of shoulders)if(!raised)stitchedShoulder(k,shoulder,side,spec.arm,mobile);
  for(let i=0;i<(mobile?4:7);i++){
    const t=i/(mobile?3:6)-.5,x=t*spec.girth*1.92;
    line(k,fabric,i%3?'patina':'trim',[[x,-.120,-.10,.014],[x*1.02,-.218,-.126,.014],
      [x*1.05,-.318,-.165,.012],[x*1.10,-.39,-.191,.002]]);
  }
}

const beastMarks={
  m129:{dorsal:'carved',tone:'rind',face:'gold',scales:9,neck:.34,pitch:.065,offset:.02,mark:0xaf6538},
  m130:{dorsal:'chain',tone:'trim',face:'brass',scales:7,neck:.31,pitch:.058,offset:-.05,mark:0x397fa9},
  m132:{dorsal:'slag',tone:'cinder',face:'fang',scales:10,neck:.43,pitch:.113,offset:.075,mark:0xb94328},
  m140:{dorsal:'stripe',tone:'deep',face:'silver',scales:9,neck:.30,pitch:.086,offset:-.10,mark:0xbdb5a8},
  m144:{dorsal:'furnace',tone:'cinder',face:'fang',scales:12,neck:.45,pitch:.104,offset:.086,mark:0xea6e23},
  m145:{dorsal:'barb',tone:'rind',face:'eye',scales:11,neck:.38,pitch:.128,offset:.077,mark:0xb38a58},
  m149:{dorsal:'wind',tone:'edge',face:'mask',scales:10,neck:.40,pitch:.094,offset:.02,mark:0x7094a7},
};

export function beastRelief(k,body,head,joints,spec,id,mobile){
  const style=beastMarks[id];
  const track=new T.CatmullRomCurve3(spec.belly.map(([x,y,z])=>new T.Vector3(x,y,z)));
  const [size,w]=[style.scales,style.neck];
  for(const side of sides){
    for(let i=0;i<size;i++){
      if(mobile&&i%5===4)continue;
      const t=(i+.5)/size,p=track.getPointAt(t);
      const z=p.z+(i%2?.018:-.011),x=side*w*(.67+.36*Math.sin(Math.PI*t)),y=p.y+.101+style.offset;
      curvedPlate(k,body,style.tone,[[x*.28,y+.208,z+.06,.038,.011],
        [x*.51,y+.182,z+.035,.065,.036],[x*.93,y+.11,z,.051,.030],[x*1.08,y-.04,z-style.pitch,.003,.007]]);
      if(i%2===0)line(k,body,'patina',[[x*.36,y+.143,z+.077,.015],[x*.70,y+.109,z+.052,.024],
        [x,y+.068,z+.018,.020],[x*1.09,y-.040,z-.05,.003]]);
    }
    const x=side*spec.width;
    if(style.face==='mask'||style.face==='gold'||style.face==='eye'){
      curvedPlate(k,head,style.face==='mask'?'edge':'patina',[[x*.1,.19,.134,.028,.018],[x*.61,.16,.19,.053,.021],
        [x*.92,.123,.213,.047,.033],[x*1.12,.05,.233,.002,.003]]);
      line(k,head,'edge',[[x*.36,.012,.296,.014],[x*.66,-.013,.247,.026],
        [x*.95,-.064,.092,.032],[x*1.09,-.10,-.115,.002]]);
    }
    if(style.face==='silver')for(let i=0;i<4;i++){
      line(k,head,'deep',[[x*(.37+i*.11),.164-i*.033,.103-i*.05,.019],
        [x*(.61+i*.11),.143-i*.048,.148-i*.048,.029],
        [x*(.79+i*.069),.098-i*.058,.10-i*.055,.026],[x*.96,-.009-i*.039,-.04-i*.014,.002]]);
    }
    if(style.face==='fang')line(k,head,'cinder',[[x*.54,.1,.25,.019],
      [x*.76,.15,.16,.036],[x*1.02,.127,.07,.035],[x*1.07,.072,-.105,.008]]);
  }
  for(const {hip,knee,paw,side,fore} of joints){
    const x=side*(fore?.21:.17);
    for(let i=0;i<(mobile?3:5);i++){
      const z=.135-i*.052;
      line(k,hip,style.tone,[[x*.52,-.027+i*.013,z,.017],[x*.94,-.112+i*.01,z-.019,.031],
        [x,-.201+i*.008,z-.027,.021],[x*.77,-.256,z-.011,.002]]);
    }
    curvedPlate(k,knee,style.dorsal==='stripe'?'hide':'patina',[[side*.035,-.015,.083,.046,.040],
      [side*.066,-.099,.092,.071,.036],[side*.081,-.19,.108,.052,.022],[side*.082,-.25,.116,.006,.004]]);
    for(let i=0;i<3;i++){
      line(k,paw,style.face==='fang'?'cinder':'edge',[[side*(i-1)*.065,-.073,.103,.017],
        [side*(i-1)*.075,-.083,.182,.019],[side*(i-1)*.075,-.112,.232,.004]]);
    }
  }
}

const flyingMarks={
  m127:{finish:'deep',edge:'rind',web:7,tail:'edge',offset:.02,col:0x482627},
  m128:{finish:'patina',edge:'deep',web:8,tail:'trim',offset:.09,col:0x744e2b},
  m131:{finish:'edge',edge:'patina',web:10,tail:'patina',offset:-.07,col:0x6092af},
  'raid-wyvern':{finish:'patina',edge:'deep',web:8,tail:'trim',offset:.06,col:0xab7849},
};

export function membraneRelief(k,wing,outline,entry,mobile){
  const style=flyingMarks[entry.id];
  const [start,_,joint,tip]=outline,side=Math.sign(tip[0]);
  for(let i=0;i<(mobile?5:style.web);i++){
    const n=i/(mobile?5:style.web),position=[side*(.62+n*.48),.28+n*.29,-.28-n*.13];
    line(k,wing,style.finish,[[position[0]*.77,position[1]-.11,position[2]+.05,.006],
      [position[0],position[1],position[2],.008],[position[0]+side*.16,position[1]+style.offset,position[2]-.140,.013],
      [position[0]+side*.25,position[1]+style.offset-.10,position[2]-.23,.002]]);
  }
  for(const index of [3,4,6,8]){
    const pos=outline[index];
    for(const sideDepth of [-1,1]){
      line(k,wing,style.edge,[[start[0],start[1],start[2]+sideDepth*.028,.014],
        [joint[0]*.70,joint[1]*.71,joint[2]+sideDepth*.038,.022],
        [joint[0]*.54+pos[0]*.46,joint[1]*.43+pos[1]*.57,joint[2]*.52+pos[2]*.48+sideDepth*.041,.012],
        [pos[0],pos[1],pos[2]+sideDepth*.021,.002]]);
    }
  }
}

export function backFeathers(k,bird,wing,side,mobile){
  const n=mobile?6:9;
  for(let i=0;i<n;i++){
    const t=i/n;
    curvedPlate(k,wing,i%3?'rind':'patina',[[side*(.27+t*.31),.085+t*.14,.066,.054,.029],
      [side*(.40+t*.70),.064+t*.32,.074,.089,.036],
      [side*(.57+t*.79),-.107+t*.68,-.013,.064,.018],
      [side*(.67+t*.96),-.190+t*.81,-.162,.004,.004]]);
  }
  for(let i=0;i<(mobile?5:7);i++){
    const x=side*(.09+i*.025);
    line(k,bird,i%2?'patina':'edge',[[x,.34,.205-i*.038,.014],[x*1.13,.24,.254-i*.038,.021],
      [x*1.20,.145,.182-i*.042,.018],[x*.92,.078,.101-i*.039,.002]]);
  }
}

const serpentMarks={
  m116:{finish:'edge',kind:'hood',pattern:8,rim:.022,col:0x65758c},
  m126:{finish:'trim',kind:'necks',pattern:10,rim:.014,col:0x935d45},
  m138:{finish:'edge',kind:'jade',pattern:11,rim:.016,col:0x72ac96},
  m152:{finish:'ember',kind:'greed',pattern:10,rim:.017,col:0x3d879b},
};

export function serpentRelief(k,neck,head,track,style,mobile){
  const mark=serpentMarks[style];
  for(let i=0;i<(mobile?mark.pattern-3:mark.pattern);i++){
    const t=(i+.65)/mark.pattern,p=track.getPointAt(t),radius=.172+.048*(1-t);
    for(const side of sides){
      const x=side*radius*(style==='m152'?1.41:1.08);
      curvedPlate(k,neck,i%4===0?mark.finish:'patina',[[p.x+x*.47,p.y+.047,p.z-radius*.77,.034,.025],
        [p.x+x*.67,p.y+.057,p.z-radius*.70,.050,.039],
        [p.x+x*.91,p.y+.035,p.z-radius*.39,.037,.025],[p.x+x*1.1,p.y-.048,p.z-radius*.13,.006,.004]]);
    }
  }
  for(const side of sides){
    for(let i=0;i<4;i++){
      const t=i/4;
      line(k,head,i===0?mark.finish:'patina',[[side*(.162+t*.052),.103-.095*t,-.10,mark.rim],
        [side*(.172+t*.061),.099-.107*t,-.207,.023],[side*(.161+t*.067),.076-.119*t,-.304,.022],
        [side*(.146+t*.065),.082-.15*t,-.379,.002]]);
    }
  }
}

export const creaturePatinas=Object.fromEntries([
  ...Object.entries(beastMarks).map(([id,v])=>[id,v.mark]),
  ...Object.entries(flyingMarks).map(([id,v])=>[id,v.col]),
  ...Object.entries(serpentMarks).map(([id,v])=>[id,v.col]),
  ['m121',0x82675f],['m134',0x71b3c0],['m136',0x7d4670],
]);
