import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const sweep=(k,j,m,path,steps=12)=>k.sculpt.sweep(j,m,path,{steps,sides:7,ridge:.23});
const solid=(k,j,m,path,mobile,seed)=>k.geometry(j,m,sculptVolume(path,
  {rings:mobile?15:22,sides:mobile?11:16,section:2.38,ridge:.24,seed}));
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

export function sculptRoyalCoil(k,coils,path,mobile){
  const route=new T.CatmullRomCurve3(path.map(([x,y,z])=>new T.Vector3(x,y,z)));
  const radius=new T.CatmullRomCurve3(path.map(([, , ,r,h])=>new T.Vector3(r,h,0)));
  const sections=[],count=5;
  for(let i=0;i<count;i++){
    const t=(i+.45)/count,pos=route.getPointAt(t);
    const joint=k.bone(coils,...pos.toArray());
    joint.name='劉邦之魂 · 龍軀遊環 '+(i+1);
    const arc=Array.from({length:7},(_,j)=>{
      const visible=T.MathUtils.clamp((i+j/6)/count+(j===0?-.013:j===6?.013:0),0,1);
      const p=route.getPointAt(visible).sub(pos);
      const w=radius.getPoint(route.getUtoTmapping(visible));
      return [...p.toArray(),w.x,w.y];
    });
    solid(k,joint,i%3?'cobalt':'steel',arc,mobile,i);
    for(let scale=0;scale<(mobile?5:7);scale++){
      const u=(i+(scale+.55)/(mobile?5:7))/count,p=route.getPointAt(u).sub(pos),axis=route.getTangentAt(u);
      const {x:w,y:h}=radius.getPoint(route.getUtoTmapping(u));
      const crest=k.bone(joint,p.x,p.y+h*.37,p.z);
      crest.rotation.y=Math.atan2(axis.x,axis.z);
      for(const side of sides){
        const line=mirror(side,[[.016,h*.61,-.059],[w*.57,h*.69,-.025],[w*.96,h*.21,.041],
          [w*1.07,-h*.39,.131],[w*.68,-h*.49,.157],[w*.46,h*.10,.101],[.022,h*.54,.063]]);
        k.sculpt.plate(crest,scale%3===1?'jade':'steel',line,.027,.011);
        sweep(k,crest,(scale+i)%3===0?'glow':'ivory',line.slice(1,6).map(([x,y,z],j)=>[x,y+.009,z,[.011,.017,.015,.012,.005][j]]));
      }
      sweep(k,crest,scale%2?'steel':'ivory',[[0,h*.48,-.044,.026],[w*.12,h*.89,-.039,.044],
        [w*.29,h*1.24,.081,.028],[w*.33,h*1.53,.154,.003]]);
    }
    sections.push({joint,pos});
  }
  return sections;
}

export function sculptRoyalWyrm(k,wyrm,mobile){
  wyrm.name='劉邦之魂 · 青灰龍面';
  solid(k,wyrm,'cobalt',[[0,-.066,.372,.064,.043],[0,-.035,.242,.116,.078],[0,.028,.047,.173,.133],
    [0,.095,-.124,.176,.149],[0,.065,-.305,.144,.118],[0,.023,-.452,.048,.065]],mobile,2.4);
  const jaw=k.bone(wyrm,0,-.086,.087);
  solid(k,jaw,'steel',[[0,-.029,.29,.063,.033],[0,-.046,.177,.091,.048],[0,-.048,.037,.142,.065],
    [0,.025,-.152,.141,.065]],mobile,3.3);
  const fins=[];
  for(const side of sides){
    const line=path=>mirror(side,path);
    sweep(k,wyrm,'ivory',line([[.019,.011,.305,.022],[.083,.087,.21,.044],[.143,.114,.043,.055],
      [.185,.115,-.131,.037],[.192,.155,-.258,.006]]),16);
    sweep(k,wyrm,'black',line([[.031,-.001,.28,.011],[.112,.054,.173,.032],
      [.147,.067,.087,.024],[.152,.079,.019,.003]]),10);
    k.mesh(wyrm,'gem','glow',side*.112,.061,.191,.034,.019,.016,0,side*.45);
    for(let i=0;i<3;i++){
      const x=.086+.024*i,z=.237-i*.09;
      sweep(k,wyrm,'ivory',line([[x,-.053,z,.024],[x+.005,-.107,z+.02,.015],[x-.008,-.161,z+.032,.003]]),7);
      sweep(k,jaw,'ivory',line([[x*.84,-.013,z-.1,.018],[x*.79,.051,z-.079,.008],[x*.75,.070,z-.069,.003]]),7);
    }
    for(let tier=0;tier<3;tier++){
      const fin=k.bone(wyrm,side*(.112+.027*tier),.071-.029*tier,-.151-.069*tier);
      const tip=tier*.032;
      const shape=line([[0,.012,.018],[.076,.059,-.076],[.332+tip,.222,-.299],
        [.283+.044*tier,.07,-.364],[.112,-.106,-.258],[.029,-.096,-.105]]);
      k.sculpt.plate(fin,tier===1?'ivory':'jade',shape,.028,.009);
      sweep(k,fin,'steel',shape.slice(1,5).map(([x,y,z],index)=>[x,y+.017,z,[.010,.016,.012,.003][index]]));
      fins.push({fin,tier,side});
    }
  }
  return {jaw,fins};
}

export function poseRoyalCoil(sections,wyrm,{beat,travel,wind,strike,stage}){
  const amp=.020+travel*.053,turn=wind*.16-strike*.25;
  for(const [i,{joint,pos}] of sections.entries()){
    const phase=beat*.86-i*.42;
    joint.position.y=pos.y+Math.sin(phase)*amp*(.4+i*.156)+stage*.022*i;
    joint.rotation.y=Math.cos(phase)*.048+turn*(i*.11-.14);
  }
  wyrm.jaw.rotation.x=.048+wind*.191+strike*.393;
  for(const {fin,tier,side} of wyrm.fins){
    fin.rotation.y=side*(Math.sin(beat*.89+tier*.56)*.11+wind*.15-strike*.29);
    fin.rotation.x=Math.cos(beat*.61+tier)*.09+stage*.11;
  }
}
