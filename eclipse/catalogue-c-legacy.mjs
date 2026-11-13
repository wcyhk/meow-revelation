import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {curvedPlate} from './catalogue-c-detail.mjs?v=penumbra-1';

const sides=[-1,1],turn=Math.PI*2;
const seam=(k,part,mat,path)=>k.sculpt.sweep(part,mat,path,{sides:6,steps:10,ridge:.15});
const plate=(k,part,mat,points,depth=.034)=>k.sculpt.plate(part,mat,points,depth,.011);
const solid=(k,part,mat,path)=>k.geometry(part,mat,sculptVolume(path,{
  sides:10,rings:12,section:2.5,ridge:.17,
}));

function frozen(k,{head,body},mobile){
  for(const side of sides){
    for(let i=0;i<6;i++){
      const x=(.084+i*.018)*side,y=.178-i*.035;
      seam(k,head,'frostEdge',[[x*.54,y+.065,.164,.014],[x*.88,y+.020,.189,.017],
        [x*1.14,y-.024,.105,.013],[x*1.34,y-.052,-.055,.002]]);
    }
    for(let i=0;i<(mobile?5:8);i++){
      const x=(.094+i*.033)*side,y=.779-i*.083,z=-.188-i*.012;
      curvedPlate(k,body,i%3===0?'frostEdge':'rind',[[x*.24,y,z-.119,.018,.021],
        [x*.60,y+.013,z-.093,.038,.026],[x*.91,y-.016,z-.037,.065,.043],
        [x,y-.055,z+.045,.008,.007]],.20);
      seam(k,body,'deep',[[x*.28,y+.01,z-.125,.013],[x*.64,y-.011,z-.092,.019],
        [x*.97,y-.03,z-.018,.003]]);
    }
  }
}

function court(k,{head,body},mobile){
  const abbot=mobile.id==='m101', captain=mobile.id==='m107';
  const phone=mobile.mobile;
  for(const side of sides){
    const f=x=>side*x;
    if(abbot){
      for(let i=0;i<7;i++){
        const x=f(.081+i*.034);
        seam(k,head,'legacyMetal',[[x*.64,.243-i*.016,-.174,.019],[x,.156-i*.022,-.208,.031],
          [x*.94,.001-i*.025,-.231,.025],[x*.84,-.193-i*.015,-.162,.004]]);
      }
      for(let i=0;i<(phone?5:8);i++){
        const x=f(.087+i*.035),y=.629-i*.051;
        seam(k,body,'legacyMetal',[[x*.47,y+.016,-.368,.015],[x*.71,y-.037,-.401,.024],
          [x,y-.084,-.383,.025],[x*1.38,y-.119,-.308,.004]]);
      }
    }else if(captain){
      for(let i=0;i<5;i++){
        const x=f(.065+i*.028);
        seam(k,head,'legacyMetal',[[x*.53,.269,-.128,.014],[x*.78,.182,-.164,.015],
          [x,.112,-.159,.012],[x*1.09,.072,-.118,.003]]);
      }
      for(let i=0;i<6;i++){
        const x=f(.124+i*.024),y=.759-i*.093;
        plate(k,body,i%3?'leatherTrim':'legacyMetal',[[x*.34,y+.074,-.305],[x*.76,y+.034,-.310],
          [x*1.31,y-.034,-.285],[x*.98,y-.088,-.31],[x*.62,y-.052,-.33]]);
      }
      // Two riveted ammunition loops cross the rear of the tricorn coat.
      seam(k,body,'legacyMetal',[[f(.34),.77,-.226,.027],[f(.226),.53,-.308,.041],
        [-f(.1),.29,-.345,.041],[-f(.33),-.10,-.28,.032]]);
    }else{
      for(let i=0;i<6;i++){
        const x=f(.062+i*.026),z=-.045-i*.029;
        seam(k,head,i%2?'oldIvory':'legacyMetal',[[x,.195,z,.024],[x*1.28,.258,z-.04,.028],
          [x*1.42,.361+i*.013,z-.137,.015],[x*1.63,.433+i*.023,z-.23,.002]]);
      }
      for(let i=0;i<7;i++){
        const x=f(.14+i*.021),y=.687-i*.083;
        curvedPlate(k,body,'legacyMetal',[[x*.15,y+.037,-.239,.028,.018],[x*.62,y+.011,-.291,.042,.027],
          [x*.98,y-.028,-.267,.057,.037],[x*1.28,y-.074,-.198,.005,.004]],.17);
      }
    }
  }
  if(abbot){
    for(let i=0;i<9;i++){
      const x=(i-4)*.056,y=.32-.12*Math.abs(i-4);
      seam(k,body,'edge',[[x,y+.266,-.363,.012],[x+.012,y+.113,-.42,.018],
        [x+.025,y-.027,-.42,.015],[x+.04,y-.096,-.356,.002]]);
    }
  }
}

function bird(k,{head,body},mobile){
  for(const side of sides){
    for(let i=0;i<(mobile?7:11);i++){
      const t=i/(mobile?7:11),x=side*(.08+t*.10),z=.53-t*.94;
      k.geometry(body,i%3?'sootFeather':'paleQuill',featherVane([x,.355-t*.17,z],
        [x*1.4,.386-t*.19,z-.15],[x*1.87,.37-t*.27,z-.34],.073-t*.020,i*2+1,9));
    }
    for(let i=0;i<5;i++){
      const x=side*(.108+i*.029),z=.17-i*.052;
      seam(k,head,i%2?'paleQuill':'sootFeather',[[x*.62,.145,z,.016],[x,.115,z-.093,.024],
        [x*1.11,.062,z-.194,.019],[x*.94,-.01,z-.30,.002]]);
    }
  }
}

function wasp(k,{head,body},mobile){
  for(const side of sides){
    for(let n=0;n<(mobile?5:8);n++){
      const y=.283-n*.064,x=side*(.14+n*.011);
      curvedPlate(k,body,n%3===0?'swallowGold':'rind',[[x*.25,y+.015,-.222,.026,.016],
        [x*.55,y+.007,-.264,.041,.030],[x*.94,y-.019,-.296,.067,.033],
        [x*1.23,y-.064,-.252,.006,.004]]);
    }
    seam(k,head,'swallowGold',[[side*.064,.18,.109,.012],[side*.153,.116,.16,.023],
      [side*.222,.071,.11,.031],[side*.237,-.046,.031,.008]]);
    seam(k,head,'deep',[[side*.118,.21,-.027,.024],[side*.197,.14,-.08,.03],
      [side*.227,.032,-.16,.025],[side*.16,-.071,-.176,.004]]);
  }
}

function reaper(k,{head,body},mobile){
  for(const side of sides){
    for(let i=0;i<(mobile?6:9);i++){
      const y=.752-i*.137,x=side*(.32-i*.016);
      seam(k,body,i%3?'hemStitch':'rind',[[x*.25,y+.07,-.273,.014],
        [x*.59,y-.024,-.262,.021],[x*.94,y+.007,-.211,.023],[x*1.22,y-.057,-.181,.003]]);
    }
    for(let i=0;i<7;i++){
      const x=side*(.032+i*.030),z=.083-i*.027;
      seam(k,head,'hemStitch',[[x*.66,.27,z,.015],[x*.89,.240,z-.096,.017],
        [x,.162,z-.161,.018],[x*.81,.033,z-.179,.002]]);
    }
  }
  solid(k,body,'hemStitch',[[0,-.64,-.22,.033,.023],[0,-.34,-.249,.066,.037],
    [0,.05,-.291,.052,.039],[0,.48,-.277,.040,.028],[.012,.79,-.214,.024,.028]]);
}

function woven(k,{head,body},mobile){
  for(let row=0;row<4;row++){
    const rv=.30+row*.114;
    for(let i=0;i<(mobile?9:13);i++){
      const a=3.14+(i/13-.5)*2.61,x=Math.sin(a),z=Math.cos(a);
      const p=(r,y,t)=>[Math.sin(a+t)*r,y,Math.cos(a+t)*r*.85];
      const y=.405-row*.318,r=rv+.035;
      seam(k,body,i%3===0?'tarnish':'strawFray',[[...p(r,y+.023,-.03),.015],[...p(r+.11,y-.086,.05),.022],
        [x*(r+.141),y-.238,z*(r+.141)*.87,.024],[...p(r+.156,y-.325,-.06),.003]]);
    }
  }
  for(const side of sides){
    seam(k,head,'tarnish',[[side*.108,.204,-.05,.042],[side*.206,.075,-.066,.057],
      [side*.252,-.042,.052,.060],[side*.221,-.192,.098,.018]]);
    seam(k,head,'strawFray',[[side*.079,-.18,.11,.018],[side*.153,-.24,.14,.022],
      [side*.179,-.31,.17,.011],[side*.19,-.422,.22,.002]]);
  }
}

function greatApe(k,{head,body},mobile){
  const frozen=mobile.id==='m158';
  for(const side of sides){
    const x=n=>side*n;
    for(let i=0;i<(mobile.mobile?6:9);i++){
      const y=.65-i*.103,z=frozen?-.44:-.249,span=frozen?.62:.47;
      k.geometry(body,i%3===0?'chestFur':'maneFiber',featherVane([x(.09+i*.022),y,z+.03],
        [x(span*.60+i*.016),y-.10,z-.075],[x(span-i*.012),y-.249,z-.135],.073,i*5+side,10));
    }
    for(let i=0;i<7;i++){
      const fx=x(.14+i*.018),y=.19-i*.039,z=.05-i*.017;
      seam(k,head,i%4?'maneFiber':'chestFur',[[fx*.79,y+.068,z,.025],[fx*.99,y+.027,z-.08,.031],
        [fx*1.16,y-.044,z-.148,.026],[fx*1.39,y-.10,z-.205,.004]]);
    }
    for(let i=0;i<4;i++){
      const fx=x(.06+i*.026);
      seam(k,head,i%2?'chestFur':'maneFiber',[[fx,-.076,.201,.019],[fx*1.14,-.123,.221,.022],
        [fx*1.17,-.183,.222,.017],[fx*1.22,-.244,.187,.002]]);
    }
  }
}

const metallic=[.54,.48,'iron'];
const bronze=[.49,.45,'bronze'];
const cloth=[.13,.73,'cloth'];
const hide=[.12,.64,'hide'];
const bone=[.20,.56,'bone'];
export const legacyCFinishes={
  m097:{frostEdge:[0xabced3,...metallic]},
  m101:{legacyMetal:[0x907147,...bronze]},
  m107:{legacyMetal:[0x9f7c54,...bronze],leatherTrim:[0x56443b,...hide]},
  m109:{legacyMetal:[0xbd843e,...bronze],oldIvory:[0xcac2a3,...bone]},
  m148:{sootFeather:[0x30485f,...hide],paleQuill:[0x6a8999,...bone]},
  m151:{swallowGold:[0x80762e,...bronze]},
  m153:{hemStitch:[0x565171,...cloth]},
  m156:{strawFray:[0xa87843,...hide],tarnish:[0xa4652e,...bronze]},
  m157:{chestFur:[0xa7605a,...hide],maneFiber:[0x423039,...hide]},
  m158:{chestFur:[0xa8aaa8,...hide],maneFiber:[0x747d7d,...hide]},
};

const work={
  m097:frozen,m101:court,m107:court,m109:court,m148:bird,m151:wasp,m153:reaper,m156:woven,m157:greatApe,m158:greatApe,
};

export function legacyCDetail(k,entry,parts,mobile){
  const sculpt=work[entry.id];
  if(!sculpt)return;
  if(['m101','m107','m109','m157','m158'].includes(entry.id))sculpt(k,parts,{id:entry.id,mobile});
  else sculpt(k,parts,mobile);
}
