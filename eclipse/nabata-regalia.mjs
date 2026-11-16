import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const rites={
  fire:{tails:[[-.10,.29,.48],[.16,.41,.56],[.42,.43,.55]],tone:0x813e31,metal:0xc88257,volume:.113,depth:.11},
  water:{tails:[[-.02,.23,.75],[.24,.30,.95],[.50,.31,.82]],tone:0x2c536d,metal:0x9cae9d,volume:.091,depth:.21},
  thunder:{tails:[[.09,.16,.37],[.35,.29,.47],[.51,.39,.42]],tone:0x594732,metal:0xae9352,volume:.124,depth:.064},
  wind:{tails:[[-.22,.15,.59],[.18,.45,.78],[.45,.58,.98]],tone:0x3f5348,metal:0x99a76b,volume:.093,depth:.15},
};
const mirror=(side,shape)=>shape.map(([x,...values])=>[side*x,...values]);
const sweep=(k,j,name,line,steps=12)=>k.sculpt.sweep(j,name,line,{sides:7,steps,ridge:.20});
const plate=(k,j,name,outline,depth)=>k.sculpt.plate(j,name,outline,depth,.019);

function material(k,name,color,metalness,roughness,finish){
  k.materials[name]??=paintedFinish(new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true}),finish,true,true);
}

export function nabataVestments(k,body,arms,element,mobile){
  const {tone,metal}=rites[element];
  material(k,'nabataBroadcloth',0x24232a,.021,.93,'cloth');
  material(k,'nabataLeather',0x322a29,.043,.92,'hide');
  material(k,'nabataBadge',metal,.54,.52,'bronze');
  const legs=[],shins=[];
  for(const side of [-1,1]){
    const hip=k.bone(body,side*.171,-.205,.017),knee=k.bone(hip,side*.096,-.415,.105);
    hip.name='納巴塔 · 分襠褲管 '+(side<0?'左':'右');
    knee.name='納巴塔 · 彎膝 '+(side<0?'左':'右');
    const folded=[[-.021,.083,.005,.118,.122],[.027,-.072,.034,.156,.155],
      [.069,-.262,.044,.147,.135],[.092,-.393,.086,.114,.117],[.096,-.445,.096,.096,.100]];
    k.geometry(hip,'nabataBroadcloth',sculptVolume(mirror(side,folded),{
      rings:mobile?13:19,sides:mobile?11:16,section:2.46,ridge:.18,seed:side*.73,
    }));
    k.geometry(knee,'nabataLeather',sculptVolume(mirror(side,[[0,.051,0,.106,.105],
      [.011,-.041,-.019,.133,.114],[.019,-.172,-.034,.106,.093],[.033,-.397,-.047,.086,.099],
      [.037,-.535,-.007,.111,.105]]),{rings:mobile?12:17,sides:mobile?10:15,section:2.62,ridge:.13,seed:side*18}));
    const foot=k.bone(knee,side*.037,-.528,0);
    k.geometry(foot,'deep',sculptVolume([[0,-.006,-.092,.075,.048],[0,-.025,-.023,.103,.070],
      [.015*side,-.039,.108,.121,.058],[.026*side,-.042,.193,.109,.035],
      [.022*side,-.048,.227,.069,.025]],{sides:11,rings:13,section:2.75,axis:'z',ridge:.085}));
    const cuff=mirror(side,[[.013,-.193,.022],[.033,-.180,.080],[.079,-.189,.068],
      [.118,-.254,.037],[.113,-.308,.007],[.043,-.260,.066],[.008,-.250,.058]]);
    plate(k,knee,'nabataBadge',cuff,.027);
    sweep(k,foot,'nabataBadge',mirror(side,[[0,-.025,.219,.008],[.086,-.016,.190,.013],
      [.096,.005,.113,.010],[.081,.022,.035,.005]]),9);
    legs.push(hip);shins.push({knee,side});
  }
  const sash=k.bone(body,0,-.186,.155);
  sash.name='納巴塔 · 腰封';
  const wrap=[[0,.023,.148],[.125,.036,.132],[.286,.044,.032],[.323,-.020,-.173],
    [.228,-.109,-.258],[.095,-.169,-.134],[0,-.142,.154]];
  for(const side of [-1,1]){
    const edge=mirror(side,wrap);
    plate(k,sash,'nabataLeather',edge,.061);
    sweep(k,sash,'nabataBadge',edge.slice(0,5).map(([x,y,z],j)=>[x,y+.014,z+.016,j%2?.026:.017]));
  }
  k.mesh(sash,'gem','nabataBadge',0,-.043,.183,.101,.087,.043,0,0,.72);
  k.mesh(sash,'gem','glow',0,-.042,.219,.038,.034,.019,0,0,.72);

  const flex={fire:1.28,water:1.57,thunder:1.08,wind:1.75}[element];
  return {legs,pose({step,wind,strike,travel}){
    for(const {knee,side} of shins){
      const pace=Math.sin(step+side*Math.PI*.49);
      knee.rotation.x=-.13+Math.max(0,-pace)*travel*.71+wind*.14-strike*.10;
      knee.rotation.z=side*(-.07+travel*.08+wind*.07-strike*.10);
    }
  },dress(skin){
    for(const [i,side] of [-1,1].entries()){
      for(let pleat=0;pleat<3;pleat++){
        const lateral=.11+pleat*.082,length=1.21-pleat*.106;
        skin.silk(arms[i],'納巴塔 · 黑垂袖',mirror(side,[[lateral,.095,-.013,.059],
          [lateral+.064,-.235,-.047,.111],[lateral+.081,-.529,-.131,.130],
          [lateral+.112,-.810,-.195,.102],[lateral+.132,-length,-.147,.016]]),{
          style:'woven',tint:0x25272d,trim:pleat===0?metal:0x3f3937,lining:0x151820,
          flex:flex*.89,phase:side*.85+pleat*.71,across:[.79,0,-side*.38],
        });
      }
      const wave=element==='water'?.14:element==='wind'?.25:.037;
      for(let panel=0;panel<2;panel++){
        const x=.13+panel*.18;
        skin.silk(body,'納巴塔 · 分幅背袍',mirror(side,[[x,.54,-.226,.085],
          [x+.026,.204,-.305,.142],[x+.075,-.252,-.311-wave,.152],
          [x+.113,-.723,-.333-wave,.132],[x+.222,-1.207+panel*.10,-.314-wave,.024]]),{
          style:'woven',tint:0x22212a,trim:panel===0?0x666057:metal,lining:0x111720,
          flex,phase:side*.52+panel*.86,across:[.92,0,-side*.37],
        });
      }
      skin.silk(sash,'納巴塔 · 印綬',mirror(side,[[.106,-.046,.141,.028],[.156,-.249,.127,.039],
        [.198+wave,-.464,.124,.036],[.227+wave,-.653,.084,.021],[.238+wave,-.707,.049,.006]]),{
        style:'woven',tint:tone,trim:metal,lining:0x1b2026,flex:flex*1.22,phase:side*.9,
      });
    }
    return true;
  }};
}

export function nabataRegalia(k,{body,skirt,side,element,mobile,articulation}){
  const {tails,tone,metal,volume,depth}=rites[element],wave=element==='water',lightning=element==='thunder';
  material(k,'nabataLaminate',tone,.43,.54,'bronze');
  material(k,'nabataHem',metal,.60,.49,'iron');
  const fan=points=>mirror(side,points);
  const torso=k.bone(body,side*.229,.242,-.133);
  torso.name='納巴塔 · 肋側承甲';
  const profile=fan([[.014,-.423,-.071,.097,.077],[.074,-.221,-.053,.133,.101],[.129,.044,-.037,.144,.13],
    [.174,.281,-.006,.128,.129],[.154,.468,.057,.103,.090],[.073,.581,.031,.054,.060]]);
  k.geometry(torso,'nabataLaminate',sculptVolume(profile,{sides:mobile?11:17,rings:mobile?16:23,section:2.5,ridge:.15}));
  for(let i=0;i<4;i++){
    const y=.361-i*.149,b=wave?.283:lightning?.265:.229;
    const rim=fan([[.013,y+.11,-.105],[b*.54,y+.129,-.206],[b,y+.037,-.238],
      [b+.028,y-.097,-.126],[b*.76,y-.139,.041],[b*.29,y-.061,.152],[.017,y+.033,.101]]);
    plate(k,torso,i%2?'deep':'nabataLaminate',rim,.048);
    sweep(k,torso,'nabataHem',rim.slice(1,6).map(([x,h,z],p)=>[x+side*.023,h+.006,z,[.016,.024,.025,.018,.006][p]]));
    sweep(k,torso,i%3?'trim':'glow',fan([[.132,y-.026,-.217,.008],[.181,y-.021,-.206,.019],
      [.22,y-.062,-.171,.013],[.186,y-.093,-.119,.005]]));
  }
  for(const [i,[start,flange,length]] of tails.entries()){
    const fin=k.bone(skirt,side*(.018+i*.021),.092,start*.77);
    fin.name='納巴塔 · '+['腰前鎧','側腹鎧','腰後葉'][i];
    const drift=depth+i*.026;
    const path=fan([[0,.03,0,.076,.036],[.071,-.093,-.038,.109,volume*.54],
      [flange*.46,-length*.45,-drift*.52,.122,volume*.48],[flange*.67,-length*.67,-drift,.097,.038],
      [flange*.75,-length*.91,-drift*1.8,.056,.029],[flange*.86,-length,-drift*1.9,.005,.006]]);
    k.geometry(fin,i===2?'nabataHem':'nabataLaminate',sculptVolume(path,
      {sides:mobile?9:14,rings:mobile?14:19,section:wave?2.19:2.65,ridge:.16,seed:i+side}));
    for(const depth of [-1,1])sweep(k,fin,i%2?'nabataLaminate':'nabataHem',path.map(([x,y,z,r])=>
      [x+side*r*.54,y,z+depth*r*.56,r*.15]),12);
    k.mesh(fin,'gem',i===0?'glow':'trim',side*.085,-length*.28,.032,.028,.063,.016,0,side*.23,side*.1);
    articulation.push({joint:fin,side,index:i,pace:(wave?1.2:lightning?.6:1)+i*.25});
  }
}

export function nabataBackplate(k,spine,side,element,mobile){
  const fan=points=>mirror(side,points);
  const profile={
    fire:[[.17,.385,.055],[.30,.23,.13],[.30,.10,.20],[.40,-.01,.27],[.44,-.21,.34]],
    water:[[.15,.27,.067],[.19,.11,.20],[.20,-.04,.34],[.21,-.21,.44],[.18,-.39,.61]],
    thunder:[[.24,.42,.078],[.32,.21,.16],[.28,.04,.25],[.29,-.14,.27],[.25,-.29,.29]],
    wind:[[.17,.31,.065],[.38,.17,.13],[.45,.03,.26],[.51,-.10,.40],[.57,-.23,.54]],
  }[element];
  const thunder=element==='thunder';
  for(const [i,[width,y,depth]] of profile.entries()){
    const offset=(element==='fire'?-i*.022:element==='wind'?.05+i*.026:.016);
    const point=fan([[.05,y+.10,-depth+.07],[width*.53,y+.152,-depth+.048],[width*.93,y+.08+offset,-depth],
      [width+.043,y-.08+offset,-depth-.043],[width*.66,y-.13,-depth-.09],[width*.26,y-.121,-depth-.051],
      [.025,y-.051,-depth+.057]]);
    plate(k,spine,i%2?'nabataLaminate':thunder?'body':'deep',point,.050);
    sweep(k,spine,'nabataHem',point.slice(1,6).map(([x,h,z],u)=>[x+side*.015,h,z-.029,[.012,.022,.023,.016,.006][u]]));
    if(i!==4){
      const x=width*.62;
      sweep(k,spine,i===1?'glow':'nabataLaminate',fan([[x*.6,y-.05,-depth-.010,.007],
        [x,y-.028,-depth-.031,.013],[x*1.17,y-.04,-depth-.054,.01],[x*1.26,y-.061,-depth-.067,.003]]),mobile?7:11);
    }
  }
}

export function nabataRegaliaPose(articulation,{beat,travel,wind,strike}){
  for(const {joint,index,side,pace} of articulation){
    const sway=Math.sin(beat*.73*pace+index+side*.9);
    joint.rotation.x=sway*(.055+travel*.108)-wind*.096+strike*.27;
    joint.rotation.y=side*(sway*.109+wind*.13-strike*.18);
  }
}
