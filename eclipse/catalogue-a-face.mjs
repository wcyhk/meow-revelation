import * as T from '../three.min.mjs';

const PI=Math.PI,TAU=PI*2,flanks=[-1,1];
const gaussian=(value,center,span)=>Math.exp(-(((value-center)/span)**2));
const rows=[
  [-.184,.054,.029,.077],[-.162,.082,.066,.039],[-.129,.105,.096,.016],
  [-.101,.120,.106,.006],[-.067,.143,.124,-.003],[-.027,.160,.137,-.013],
  [.016,.166,.136,-.013],[.057,.155,.142,-.021],[.095,.148,.135,-.029],
  [.134,.146,.132,-.035],[.174,.134,.116,-.049],[.21,.109,.095,-.054],
  [.245,.061,.062,-.059],[.264,.025,.024,-.038],
];

const faces={
  noble:{jaw:.92,brow:.76,crown:1.03,nose:[.044,.028,.045],cheek:.039,eyes:[.080,.049,.011,.007],mouth:[.057,-.096],tone:.02},
  soldier:{jaw:1.22,brow:1.19,crown:.99,nose:[.052,.034,.041],cheek:.038,eyes:[.082,.057,.011,.013],mouth:[.064,-.105],tone:.03},
  ascetic:{jaw:.85,brow:.89,crown:.90,nose:[.058,.023,.062],cheek:.051,eyes:[.081,.048,.009,.005],mouth:[.046,-.106],tone:.09},
  elder:{jaw:.88,brow:1.07,crown:.99,nose:[.064,.031,.055],cheek:.052,eyes:[.084,.050,.008,.006],mouth:[.051,-.111],tone:.09},
  ogre:{jaw:1.37,brow:1.38,crown:.91,nose:[.046,.053,.035],cheek:.049,eyes:[.081,.055,.013,.015],mouth:[.069,-.108],tone:.03},
  ghost:{jaw:.88,brow:1.09,crown:1.08,nose:[.046,.024,.053],cheek:.063,eyes:[.082,.058,.014,.012],mouth:[.049,-.103],tone:.10},
  wild:{jaw:1.16,brow:1.22,crown:1.01,nose:[.043,.039,.046],cheek:.041,eyes:[.085,.050,.013,.014],mouth:[.060,-.102],tone:.05},
};

function surfaceSample(config,width){
  const wr=width/.34;
  const curves=new T.CatmullRomCurve3(rows.map(([,w,d,c])=>new T.Vector3(w,d,c)));
  function widthAt(y){
    const interval=rows.findIndex((row,i)=>i<rows.length-1&&y<=rows[i+1][0]);
    const index=interval<0?rows.length-2:interval;
    const t=T.MathUtils.clamp((y-rows[index][0])/(rows[index+1][0]-rows[index][0]),0,1);
    const w=curves.getPoint((index+t)/(rows.length-1));
    const sx=w.x*wr*(1+(config.jaw-1)*gaussian(y,-.125,.069)+(config.crown-1)*gaussian(y,.16,.18));
    return {sx,d:w.y,cz:w.z};
  }
  function faceAt(x,y,d,cz,forward){
    const ax=Math.abs(x)/wr;
    const [eyes,eyeY]=config.eyes,[nose,noseW,noseHeight]=config.nose;
    const z=cz+d*forward;
    if(forward<=0)return z;
    const noseBridge=nose*gaussian(ax,0,noseW*.60)*gaussian(y,.015,noseHeight*1.1);
    const noseTip=nose*.72*gaussian(ax,0,noseW*.69)*gaussian(y,-.036,noseHeight*.49);
    const noseWing=nose*.37*gaussian(ax,noseW*.92,noseW*.51)*gaussian(y,-.049,noseHeight*.28);
    const sockets=-config.cheek*.91*gaussian(ax,eyes,.043)*gaussian(y,eyeY,.026);
    const brow=config.cheek*.77*config.brow*gaussian(ax,eyes+.011,.044)*gaussian(y,eyeY+.042,.021);
    const cheek=config.cheek*.84*gaussian(ax,.112,.034)*gaussian(y,-.017,.039);
    const lips=.023*gaussian(ax,0,config.mouth[0])*gaussian(y,config.mouth[1]-.002,.027);
    const chin=.019*config.jaw*gaussian(ax,0,.061)*gaussian(y,-.152,.024);
    return z+(noseBridge+noseTip+noseWing+sockets+brow+cheek+lips+chin)*forward**1.4;
  }
  function outline(x,y){
    const {sx,d,cz}=widthAt(y);
    const c=Math.sqrt(Math.max(.002,1-(x/sx)**2));
    return faceAt(x,y,d,cz,c);
  }
  function at(theta,y){
    const {sx,d,cz}=widthAt(y),x=sx*Math.sin(theta);
    return [x,y,faceAt(x,y,d,cz,Math.cos(theta))];
  }
  return {outline,at,wr};
}

function fittedPoint(state,x,y,offset=0){
  const xx=x*state.wr;
  return [xx,y,state.outline(xx,y)+offset];
}

function crownSurface(k,head,finish,state,detailed,seed){
  const bands=detailed?36:30,sectors=detailed?48:38,position=[],uv=[],colors=[],triangles=[];
  for(let row=0;row<=bands;row++){
    const t=row/bands,y=-.184+t*.448;
    for(let column=0;column<=sectors;column++){
      const u=column/sectors,theta=u*TAU-PI;
      const p=state.at(theta,y);
      if(row===0||row===bands){p[0]*=.04;p[2]=p[2]*.04-.031;}
      position.push(...p);uv.push(u,t);
      const pigment=.843+.13*Math.cos(theta)-.08*gaussian(y,-.107,.047)+.041*Math.sin(19*y+7*theta+seed);
      colors.push(pigment,.99*pigment,pigment*.986);
      if(row<bands&&column<sectors){
        const p=row*(sectors+1)+column,q=p+sectors+1;
        triangles.push(p,p+1,q,p+1,q+1,q);
      }
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setIndex(triangles);geometry.computeVertexNormals();
  const normals=geometry.attributes.normal,a=new T.Vector3(),b=new T.Vector3();
  for(let row=0;row<=bands;row++){
    const start=row*(sectors+1),end=start+sectors;
    a.fromBufferAttribute(normals,start).add(b.fromBufferAttribute(normals,end)).normalize();
    normals.setXYZ(start,a.x,a.y,a.z);normals.setXYZ(end,a.x,a.y,a.z);
  }
  k.geometry(head,finish,geometry);
}

export function carvedFace(k,head,parts){
  const {width=.34,finish='skin',style='soldier',brow='black',eye='glow',lids=finish,dark='lining',
    tone=0,detailed=false,fang='ivory',mouthShape,features=true}=parts;
  const config=faces[style];
  const state=surfaceSample(config,width);
  const {eyes,mouth,nose}=config;
  const groove=(joint,material,path)=>{
    k.sculpt.sweep(joint,material,path,{steps:9,sides:6,ridge:.10});
  };
  crownSurface(k,head,finish,state,detailed,tone+config.tone);
  const jaw=k.bone(head,0,-.111,.030);
  jaw.name='Mandible';
  const bottom=(x,y,depth=0)=>{
    const [a,b,z]=fittedPoint(state,x,y,depth);
    return [a,b+.111,z-.03];
  };
  if(!features)return {jaw,state};
  for(const side of flanks){
    const x=n=>side*n;
    const [at,h,open,slant]=eyes;
    const corner=[x(at-.038),h-slant*.55],edge=[x(at+.042),h+slant*.54];
    const upper=[corner,[x(at-.016),h+open*.66],[x(at+.013),h+open],[x(at+.032),h+open*.76],edge];
    const lower=[corner,[x(at-.013),h-open*.63],[x(at+.012),h-open*.75],[x(at+.035),h-open*.34],edge];
    const eyelid=k.bone(head,0,0,0);eyelid.name=side<0?'Left eyelids':'Right eyelids';
    k.sculpt.plate(eyelid,dark,[...upper,...lower.slice(1,-1).reverse()].map(([px,py])=>fittedPoint(state,px,py,.019)),.011,.005);
    groove(eyelid,lids,upper.map(([px,py],i)=>[...fittedPoint(state,px,py,.021),[.004,.012,.014,.011,.004][i]]));
    groove(eyelid,lids,lower.map(([px,py],i)=>[...fittedPoint(state,px,py,.019),[.003,.008,.009,.008,.003][i]]));
    const [ix,iy,iz]=fittedPoint(state,x(at+.003),h,.030);
    k.mesh(eyelid,'gem',eye,ix,iy,iz,style==='ogre'?.014:.0096,open*.76,.007,0,x(.26));
    const eyebrow=[[-.037,-.012],[-.016,.011],[.011,.020],[.039,.012],[.062,-.013]];
    const raised=style==='elder'?-.011:0;
    groove(head,brow,eyebrow.map(([px,py],i)=>[...fittedPoint(state,x(at+px),h+py+.029+raised,.009),
      [.005,.012,.015,.009,.002][i]]));
    const bridge=nose[1]*.71;
    const nostril=[[-.007,-.047],[.002,-.052],[.013,-.048]];
    groove(head,dark,nostril.map(([px,py],i)=>[...fittedPoint(state,x(bridge+px),py,.009),[.002,.006,.002][i]]));
    const lip=mouthShape??mouth[1];
    groove(head,lids,[[0,lip+.003],[x(mouth[0]*.45),lip+.011],[x(mouth[0]*.91),lip+.014],[x(mouth[0]),lip+.010]]
      .map(([px,py],i)=>[...fittedPoint(state,px,py,.008),[.009,.012,.008,.002][i]]));
    groove(jaw,lids,[[0,lip-.015],[x(mouth[0]*.54),lip-.015],[x(mouth[0]*.90),lip-.003],[x(mouth[0]),lip+.006]]
      .map(([px,py],i)=>[...bottom(px,py,.009),[.013,.011,.006,.002][i]]));
    if(style==='elder'||style==='ghost'){
      const creases=[[x(.108),-.036],[x(.09),-.066],[x(.092),-.094],[x(.104),-.117]];
      groove(head,lids,creases.map(([px,py],i)=>[...fittedPoint(state,px,py,.004),[.005,.008,.007,.002][i]]));
    }
    if(style==='ogre'){
      const point=bottom(x(.052),lip-.007,.017);
      groove(jaw,fang,[[...point,.019],[point[0]+x(.007),point[1]+.036,point[2]+.007,.017],
        [point[0]+x(.011),point[1]+.063,point[2]+.003,.003]]);
    }
  }
  const lip=mouthShape??mouth[1];
  groove(head,dark,[[-mouth[0],lip+.009],[-mouth[0]*.54,lip+.001],[0,lip-.003],[mouth[0]*.54,lip+.001],[mouth[0],lip+.009]]
    .map(([px,py],i)=>[...fittedPoint(state,px,py,.012),[.002,.006,.007,.006,.002][i]]));
  return {jaw,state};
}

export function openHelm(k,head,{material,trim,dark='lining',crest=1,flare=.9,vent='teeth',span=1}){
  const helmet=k.bone(head,0,0,0);helmet.name='Open helm / front and nape';
  const stroke=(j,s,p)=>k.sculpt.sweep(j,s,p,{steps:10,sides:7,ridge:.18});
  const plate=(j,s,p,t=.035)=>k.sculpt.plate(j,s,p,t,.013);
  for(const side of flanks){
    const x=n=>side*n*span;
    const brow=[[x(.018),.133,.156],[x(.087),.133,.129],[x(.141),.117,.083],[x(.187),.122,.018],
      [x(.191),.192,-.068],[x(.148),.214,-.134],[x(.04),.20,-.15],[x(.026),.18,.05]];
    const jaw=[[x(.125),.057,.104],[x(.188),.082,.023],[x(.205),.030,-.084],[x(.182),-.083,-.148],
      [x(.171),-.162,-.100],[x(.119),-.169,.025],[x(.099),-.13,.115],[x(.136),-.055,.138]];
    plate(helmet,material,brow,.048);plate(helmet,material,jaw,.045);
    stroke(helmet,trim,[[x(.021),.134,.179,.020],[x(.08),.126,.157,.022],[x(.147),.109,.106,.020],
      [x(.191),.102,.025,.025],[x(.198),.138,-.081,.010]]);
    stroke(helmet,trim,[[x(.118),-.143,.130,.013],[x(.141),-.102,.150,.024],[x(.176),-.047,.106,.023],
      [x(.195),.012,.027,.019],[x(.191),.083,-.101,.004]]);
    const rise=crest*.37;
    stroke(helmet,material,[[x(.136),.157,-.005,.058],[x(.16*flare),.20+rise*.177,-.078,.061],
      [x(.156*flare),.19+rise*.63,-.158,.039],[x(.094*flare),.18+rise,-.184,.025],
      [x(.069*flare),.163+rise*1.15,-.198,.003]]);
    stroke(helmet,trim,[[x(.118),.19,-.018,.02],[x(.156*flare),.22+rise*.32,-.088,.023],
      [x(.125*flare),.193+rise*.75,-.177,.016],[x(.069*flare),.163+rise*1.15,-.198,.002]]);
    for(let i=0;i<3;i++){
      const y=-.004-i*.054,nape=k.bone(helmet,0,y,0);
      plate(nape,i%2===0?material:dark,[[0,.048,-.24],[x(.102),.051,-.232],[x(.189),.047,-.176],
        [x(.191),-.048,-.147],[x(.109),-.067,-.22],[0,-.077,-.239]],.031);
      stroke(nape,trim,[[0,-.077,-.251,.012],[x(.11),-.061,-.23,.014],[x(.185),-.042,-.164,.005]]);
    }
    if(vent==='teeth')for(let i=0;i<4;i++){
      const z=.106-i*.029;
      stroke(helmet,dark,[[x(.122+i*.017),-.095,z,.005],[x(.124+i*.019),-.128,z+.006,.007],
        [x(.129+i*.018),-.157,z+.003,.002]]);
    }
  }
  return helmet;
}

export function demonicMempo(k,head,{face,trim,fang='ivory',opening=.8,jewel='glow',jaw=true}){
  const mask=k.bone(head,0,0,0);mask.name='Demon visor with open eyes';
  const stroke=(part,material,path)=>k.sculpt.sweep(part,material,path,{steps:10,sides:7,ridge:.18});
  const plate=(mesh,outline,size=.039)=>k.sculpt.plate(mask,mesh,outline,size,.012);
  for(const side of flanks){
    const f=x=>side*x;
    const eyeline=.057,wing=opening*.03;
    plate(face,[[f(.019),eyeline+.049,.165],[f(.082),eyeline+.042,.151],[f(.126),eyeline+.04+wing,.131],
      [f(.169),eyeline+.103,.084],[f(.193),eyeline+.045,.042],[f(.175),eyeline+.004,.074],
      [f(.127),eyeline+.012+wing*.63,.14],[f(.072),eyeline+.006,.169],[f(.028),eyeline+.013,.185]]);
    plate(face,[[f(.027),eyeline-.024,.176],[f(.079),eyeline-.021,.134],[f(.132),eyeline-.017+wing*.54,.143],
      [f(.194),.087,.045],[f(.219),-.028,.037],[f(.174),-.119,.087],[f(.109),-.156,.173],
      [f(.071),-.102,.185],[f(.073),-.050,.172]],.044);
    stroke(mask,trim,[[f(.030),eyeline+.032,.204,.014],[f(.076),eyeline+.023,.172,.018],
      [f(.134),eyeline+.034+wing*.50,.165,.019],[f(.187),eyeline+.08,.08,.004]]);
    stroke(mask,trim,[[f(.146),.021,.167,.018],[f(.164),-.022,.178,.020],
      [f(.129),-.088,.175,.016],[f(.108),-.136,.19,.005]]);
    if(jaw){
      plate(face,[[f(.030),-.157,.189],[f(.087),-.158,.193],[f(.14),-.146,.155],
        [f(.139),-.211,.134],[f(.091),-.253,.149],[f(.023),-.245,.167]],.036);
      stroke(mask,fang,[[f(.114),-.187,.182,.023],[f(.106),-.13,.217,.019],
        [f(.075),-.082,.228,.003]]);
    }
    k.mesh(mask,'gem',jewel,f(.086),eyeline-.006,.166,.017,.011,.011,0,f(.28));
  }
  return mask;
}
