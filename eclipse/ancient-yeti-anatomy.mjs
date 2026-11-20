import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const boneLine=(k,part,finish,path,steps=8)=>k.sculpt.sweep(part,finish,path,{steps,sides:7,ridge:.20});
const skin=(k,part,finish,path,settings={})=>k.geometry(part,finish,sculptVolume(path,{rings:15,sides:12,section:2.42,ridge:.25,...settings}));

export const yetiAnatomyFinishes={
  yetiFace:[0x384951,.13,.72,'hide'],yetiRib:[0x6b7680,.12,.71,'hide'],
  yetiGum:[0x652f35,.09,.61,'hide'],yetiIvory:[0xc7bebe,.21,.48,'bone'],
  yetiClaw:[0x2d333e,.23,.52,'bone'],yetiHorn:[0x5c3935,.27,.51,'bone'],
  yetiHornLight:[0x9c5d50,.27,.48,'bone'],
};

export function sculptYetiJaw(k,head,mobile){
  head.name='未寄郵庭・雙面封印 · 暴顎頭骨';
  const fit={rings:mobile?14:20,sides:mobile?13:17};
  skin(k,head,'yetiFace',[[0,-.201,-.116,.121,.111],[0,-.077,-.11,.184,.158],
    [0,.043,-.043,.198,.177],[0,.171,-.061,.194,.173],[0,.261,-.114,.145,.139],
    [0,.312,-.203,.107,.101]],fit);
  skin(k,head,'yetiFace',[[0,.001,.024,.147,.074],[0,-.025,.153,.165,.089],
    [0,-.077,.243,.159,.076],[0,-.112,.271,.122,.059],[0,-.143,.286,.099,.036]],fit);
  skin(k,head,'yetiClaw',[[0,-.075,.115,.111,.055],[0,-.096,.191,.137,.071],
    [0,-.084,.261,.106,.047],[0,-.073,.302,.075,.025]],fit);
  const jaw=k.bone(head,0,-.166,-.025);
  jaw.name='未寄郵庭・雙面封印 · 可動下顎';
  skin(k,jaw,'yetiFace',[[0,-.001,-.094,.136,.058],[0,-.053,.061,.163,.096],
    [0,-.061,.201,.149,.083],[0,-.034,.302,.111,.053],[0,-.017,.330,.090,.031]],fit);
  skin(k,jaw,'yetiGum',[[0,-.009,.039,.104,.037],[0,-.006,.140,.132,.043],[0,.001,.247,.110,.038],
    [0,.008,.315,.074,.018]],{...fit,ridge:.07});
  skin(k,jaw,'yetiGum',[[0,.030,.038,.057,.028],[0,.030,.112,.081,.031],[0,.024,.206,.077,.028],
    [0,.028,.272,.039,.016]],{...fit,ridge:.11});
  for(const side of sides){
    const p=path=>reflect(side,path);
    const orbit=p([[.033,.010,.220],[.069,.089,.204],[.123,.098,.164],[.171,.060,.105],
      [.146,.020,.143],[.095,.022,.200]]);
    k.sculpt.plate(head,'yetiClaw',orbit,.036,.009);
    k.mesh(head,'gem','glow',side*.097,.043,.214,.026,.009,.020,.08,side*.53,-side*.27);
    boneLine(k,head,'yetiRib',p([[.028,.047,.214,.018],[.068,.105,.208,.035],
      [.132,.118,.157,.035],[.178,.098,.092,.014],[.189,.063,.049,.002]]),12);
    const arch=p([[.088,-.104,.246,.04],[.144,-.096,.195,.054],[.201,-.043,.093,.055],
      [.210,.047,-.015,.056],[.177,.097,-.115,.020]]);
    skin(k,head,'yetiRib',arch.map(([x,y,z,w])=>[x,y,z,w,w*.80]),fit);
    boneLine(k,head,'yetiGum',p([[.032,-.135,.279,.018],[.105,-.142,.271,.022],
      [.142,-.134,.228,.025],[.153,-.121,.150,.009]]),12);
    boneLine(k,jaw,'yetiRib',p([[.110,-.020,.267,.028],[.154,-.064,.164,.049],
      [.169,-.035,.040,.043],[.155,-.009,-.059,.006]]),12);
    for(let i=0;i<4;i++){
      const t=i/3,x=.035+i*.032,z=.285-.092*t*t;
      const canine=i===3;
      boneLine(k,head,'yetiIvory',p([[x,-.142,z,.012],[x+.004,-.173,z+.016,canine?.027:.013],
        [x+(canine?-.006:.004),canine?-.244:-.196,z+.031,.002]]));
      boneLine(k,jaw,'yetiIvory',p([[x,.015,z+.012,.012],[x+.008,.048,z+.006,canine?.020:.011],
        [x+.006,canine?.106:.066,z-.003,.002]]));
    }
    for(let i=0;i<(mobile?3:5);i++){
      const t=i/(mobile?2:4),y=.12-t*.202,z=.096-t*.08;
      iceFur(k,head,i%2?'yetiWool':'yetiFrost',p([[.144,y+.02,z,.041,.037],[.226,y-.026,z+.025,.053,.048],
        [.257,y-.12,z+.041,.044,.041],[.227,y-.235,z+.050,.005,.006]]),mobile,53+i);
    }
    iceFur(k,jaw,'yetiWool',p([[.051,-.060,.227,.044,.032],[.106,-.099,.201,.064,.049],
      [.136,-.188,.177,.031,.028],[.109,-.246,.175,.004,.007]]),mobile,67+side);
  }
  return jaw;
}

export function iceFur(k,part,finish,path,mobile,seed){
  const geometry=sculptVolume(path,{sides:mobile?7:8,rings:mobile?12:14,section:2.08,ridge:.25,fur:true,seed});
  const {color,uv}=geometry.attributes;
  for(let i=0;i<uv.count;i++){
    const t=uv.getY(i),angle=uv.getX(i)*Math.PI*2;
    const fibre=.76+.20*Math.cos(angle*3+t*1.18+seed*.63)+.13*Math.cos(angle*5-t*2.1);
    const tip=.86+.27*Math.sin(t*Math.PI)**.72-.21*t**3;
    color.setXYZ(i,color.getX(i)*fibre*tip*.91,color.getY(i)*fibre*tip*.99,color.getZ(i)*fibre*tip*1.08);
  }
  k.geometry(part,finish,geometry);
}

export function carveYetiRuff(k,part,path,mobile,side,seed){
  for(const branch of mobile?[-1,1]:[-1,0,1]){
    iceFur(k,part,seed%3?'yetiWool':'yetiFrost',reflect(side,path.map(([x,y,z,w,d],i)=>{
      const t=i/(path.length-1),fan=t**1.25,wave=Math.sin(t*4+seed*.91+branch*1.15);
      return [x+branch*.045*fan+wave*.013*t,y+branch*.053*fan+wave*.022*t,
        z+branch*(w*.48+.047*fan),w*(branch===0?.43:.58),d*.72];
    })),mobile,seed+branch);
  }
}

export function fineYetiTuft(k,part,finish,path,mobile,side,seed){
  const geometryFor=offset=>{
    const profile=path.map(([x,y,z,w,d],i)=>{
      const t=i/(path.length-1),travel=t**1.4;
      return [x+side*offset*(.015+t*.020),y+offset*travel*.040,
        z+offset*(w*.22+.031*travel),w*.56,d*.52];
    });
    return sculptVolume(profile,{sides:mobile?6:8,rings:mobile?10:13,section:2.18,ridge:.19,fur:true,seed:seed+offset*.3});
  };
  for(const branch of [-1,1]){
    const geometry=geometryFor(branch),{color,uv}=geometry.attributes;
    for(let i=0;i<uv.count;i++){
      const t=uv.getY(i),u=uv.getX(i)*Math.PI*2;
      const strand=.76+.21*Math.cos(u*3+t*1.57+seed*1.1)+.09*Math.cos(u*5+t*.42+branch);
      const sheen=strand*(.83+.29*Math.sin(t*Math.PI)-t**5*.24);
      color.setXYZ(i,sheen*.92,sheen*.97,sheen*1.12);
    }
    k.geometry(part,finish,geometry);
  }
}

export function sculptYetiFinger(k,finger,side,mobile){
  const fit={sides:mobile?8:11,rings:mobile?12:16,section:2.47,ridge:.24};
  skin(k,finger,'yetiRib',reflect(side,[[0,.044,.024,.049,.044],[.016,-.024,.049,.054,.049],
    [.029,-.106,.098,.049,.045],[.026,-.178,.133,.037,.035],[.013,-.217,.153,.028,.027]]),fit);
  const claws=reflect(side,[[.029,-.166,.124,.027],[.027,-.201,.152,.034],[.025,-.262,.196,.027],
    [.011,-.307,.239,.018],[-.013,-.329,.255,.002]]);
  boneLine(k,finger,'yetiClaw',claws,13);
  boneLine(k,finger,'yetiRib',claws.slice(1).map(([x,y,z,r])=>[x+side*.015,y+.008,z+.006,r*.28]),10);
}
