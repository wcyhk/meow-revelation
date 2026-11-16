import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const reflect=(s,path)=>path.map(([x,...p])=>[s*x,...p]);
const stroke=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?8:14,sides:mobile?6:8,ridge:.17});

function anatomy(k,part,finish,profile,mobile,options={}){
  k.geometry(part,finish,sculptVolume(profile,{rings:mobile?12:18,sides:mobile?9:14,section:2.22,ridge:.12,fur:true,...options}));
}

function tuft(k,joint,finish,profile,mobile,seed){
  anatomy(k,joint,finish,profile,mobile,{rings:mobile?6:10,sides:mobile?6:9,section:1.62,ridge:.21,seed});
}

function cuff(k,j,side,y,z,r,mobile,seed){
  const s=x=>x*side;
  for(let i=0;i<(mobile?5:8);i++){
    const a=i*.432-seed,ro=Math.sin(a),out=Math.cos(a),l=.084+.055*Math.sin(i*.81+seed);
    const x=ro*r,depth=out*r+z;
    tuft(k,j,i%3===0?'bearUnderfur':'bearGuardHair',[[s(x*.84),y+.018,depth-.013,.035,.027],
      [s(x+ro*.019),y-.036,depth+.024,.047,.029],[s(x+ro*.019+.016),y-l*.78,depth+.037,.034,.018],
      [s(x+ro*.03+.026),y-l,depth+.022,.004,.004]],mobile,seed+i*1.36);
  }
}

export function bearClawSculpt(k,elbow,paw,side,mobile){
  anatomy(k,elbow,'bearUnderfur',reflect(side,[[.015,.049,-.016,.139,.147],[.039,-.093,.009,.181,.153],
    [.068,-.246,.074,.216,.191],[.08,-.377,.144,.194,.159],[.043,-.523,.233,.137,.132]]),mobile,{seed:11});
  for(let i=0;i<3;i++)cuff(k,elbow,side,-.209-i*.100,.12+i*.029,.178-i*.013,mobile,.15+i*.21);
  anatomy(k,paw,'deep',[[0,-.154,.143,.154,.133],[0,-.096,.083,.216,.171],[.014,.013,.026,.18,.141],
    [.019,.065,-.035,.124,.106]],mobile,{section:2.38,fur:false,seed:13});
  cuff(k,paw,side,.026,.052,.157,mobile,1.31);
  anatomy(k,paw,'deep',[[0,-.169,.031,.064,.061],[.008,-.19,.098,.114,.073],[.008,-.173,.154,.087,.059]],mobile,
    {rings:8,sides:9,section:2.45,fur:false,seed:16});
  const toes=[];
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.088,depth=.154-Math.abs(i-1.5)*.018;
    const toe=k.bone(paw,x,-.124,depth);
    toe.name='白熊前掌 · 第'+(i+1)+'趾';
    anatomy(k,toe,'bearUnderfur',[[0,.029,-.056,.044,.056],[0,.012,.004,.056,.055],
      [x*.14,-.016,.063,.048,.037],[x*.24,-.042,.09,.031,.025]],mobile,{rings:8,sides:9,seed:i});
    stroke(k,toe,'ivory',[[x*.16,-.019,.06,.032],[x*.27,-.049,.107,.03],[x*.42,-.089,.146,.017],
      [x*.61,-.132,.151,.003]],mobile);
    stroke(k,toe,'ash',[[x*.15,-.007,.054,.009],[x*.27,-.032,.106,.009],[x*.43,-.071,.132,.003]],mobile);
    toes.push(toe);
  }
  return toes;
}

export function bearHockSculpt(k,thigh,knee,side,mobile){
  anatomy(k,thigh,'bearUnderfur',reflect(side,[[.012,.13,-.047,.179,.165],[.047,-.065,-.008,.254,.217],
    [.083,-.22,-.051,.222,.229],[.071,-.321,-.114,.147,.153],[.063,-.37,-.135,.121,.121]]),mobile,{seed:8});
  anatomy(k,knee,'bearUnderfur',reflect(side,[[.018,.071,-.052,.138,.146],[.023,-.102,-.067,.178,.157],
    [.029,-.198,-.024,.154,.132],[.033,-.239,.021,.113,.121]]),mobile,{seed:27});
  for(let i=0;i<3;i++){
    cuff(k,thigh,side,-.146-i*.087,-.017-i*.053,.207-i*.028,mobile,1.97+i*.4);
    cuff(k,knee,side,-.039-i*.077,-.071+i*.029,.168-i*.015,mobile,.77+i*.2);
  }
  for(let i=0;i<(mobile?4:6);i++){
    const t=i/(mobile?3:5),x=-.121+t*.28,y=-.091+Math.sin(i*1.18)*.027;
    tuft(k,thigh,i%3?'bearUnderfur':'bearGuardHair',reflect(side,[[x,y,-.233,.046,.026],
      [x+.021,y-.117,-.277+t*.027,.053,.031],[x+.016,y-.201,-.259+t*.022,.034,.019],
      [x+.039,y-.257,-.227+t*.019,.004,.005]]),mobile,32+i);
  }
  const hock=k.bone(knee,side*.019,-.198,.025);
  hock.name='白熊後腿 · 踝關節';
  anatomy(k,hock,'deep',[[0,-.15,.174,.158,.142],[.013*side,-.109,.099,.195,.164],
    [.019*side,-.047,.037,.158,.141],[.021*side,.029,-.032,.115,.108]],mobile,{seed:4,section:2.13});
  cuff(k,hock,side,-.012,.041,.131,mobile,.52);
  const toes=[];
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.076,depth=.203-Math.abs(i-1.5)*.021;
    const toe=k.bone(hock,x,-.114,depth);
    toe.name='白熊後掌 · 第'+(i+1)+'趾';
    anatomy(k,toe,'bearUnderfur',[[0,.03,-.044,.045,.059],[x*.13,.006,.012,.056,.069],
      [x*.17,-.023,.056,.048,.051],[x*.18,-.035,.064,.021,.024]],mobile,{rings:8,sides:9,seed:3+i});
    stroke(k,toe,'ivory',[[x*.13,-.003,.048,.023],[x*.14,-.017,.078,.026],[x*.21,-.038,.111,.012],
      [x*.27,-.071,.126,.003]],mobile);
    toes.push(toe);
  }
  return {knee,hock,toes,side};
}

export function bearRuffSculpt(k,body,head,mobile){
  // Broad roots stay under the underfur and long, crossing tips break the edge of the ruff.
  for(const s of [-1,1]){
    const rows=mobile?5:6,cnt=mobile?7:9;
    for(let row=0;row<rows;row++)for(let i=0;i<cnt;i++){
      const t=(i+.38*(row%2))/cnt,seed=i*1.67+row*.81+s*.34;
      const y=.584-row*(.71/(rows-1))+t*.07+Math.sin(seed)*.036;
      const x=.011+t*(.54-row*.025)+Math.sin(seed*.68)*.021;
      const front=.528-.187*t**1.6-row*.015+Math.sin(seed*2.35)*.012;
      const len=.192+.056*Math.cos(seed*.892)+t*.057,w=(.058-.020*t)*(1+.16*Math.cos(seed));
      const bend=.057+.050*Math.sin(seed*.45)+t*.065;
      tuft(k,body,(row+i)%8===2?'bearUnderfur':'bearGuardHair',reflect(s,[[x,y,front-.068,w*.93,.022],
        [x+bend*.18,y-len*.26,front-.018,w,.031],[x+bend*.48,y-len*.59,front+.012,w*.74,.022],
        [x+bend*.76,y-len*.84,front+.022,w*.40,.011],[x+bend,y-len,front+.007,.003,.004]]),mobile,seed);
      if(i%3===row%3)stroke(k,body,'bearGuardHair',reflect(s,[[x,y-len*.22,front+.008,.005],
        [x+bend*.36,y-len*.54,front+.031,.007],[x+bend*.74,y-len*.86,front+.033,.005],
        [x+bend*.93,y-len*1.05,front+.012,.002]]),mobile);
    }
    for(let i=0;i<(mobile?6:9);i++){
      const t=i/(mobile?5:8),x=.119+t*.229,y=.123-t*.38,z=.334-t*.171;
      tuft(k,head,i%3?'bearGuardHair':'bearUnderfur',reflect(s,[[x,y,z-.017,.046,.042],
        [x+.084,y-.049,z-.015,.053,.038],[x+.099,y-.101,z-.027,.032,.024],
        [x+.103,y-.165,z-.081,.005,.005]]),mobile,18+i);
      if(i>1)tuft(k,body,i%3?'bearUnderfur':'bearGuardHair',reflect(s,[[.436,.51-t*.258,.208-t*.137,.062,.042],
        [.508,.402-t*.274,.243-t*.131,.068,.049],[.579,.259-t*.287,.21-t*.158,.049,.030],
        [.622,.152-t*.29,.141-t*.17,.005,.004]]),mobile,22+i);
    }
  }
}
