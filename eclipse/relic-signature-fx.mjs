import {awakeningFx} from './relic-awakening-fx.mjs';

const wave=(o,a,d)=>({x:o.x+Math.cos(a)*d,z:o.z+Math.sin(a)*d});
const releases={
  tiger:['blade','dash'],
  dragon:['relay','crown'],
  phoenix:['feather','wing'],
  turtle:['ice','shell'],
  qilin:['pillar','anchor'],
  flameblade:['needle','triad'],
  stormbow:['glass','sight'],
  windhalberd:['notch','sweep'],
  frostlute:['thread','strings'],
  chakra:['mirror','orbit'],
  reaper:['wheel','scythe'],
  bell:['crown','bell'],
  fangs:['fang','cross'],
  cannon:['sun','fuse'],
};

export function nativeRelicSignature(view,weapon,origin,center,bearing,linked=false){
  const design=releases[weapon.id];
  if(!design)return;
  const [shape,layout]=design,palette=linked?0xfff1d5:weapon.tone;
  const fx=(form,where,settings,color=palette)=>awakeningFx(view,form,where,color,settings);
  switch(layout){
    case 'dash':
      for(let i=0;i<3;i++)fx(shape,wave(origin,bearing,.48+i*.64),{y:.42+i*.18,life:.21+i*.07,size:.58+i*.21,angle:-bearing+1.4});
      break;
    case 'crown':
      for(let i=0;i<3;i++)fx(shape,wave(center,i*Math.PI*2/3,.77),{y:2.8-i*.34,lift:-2.0,life:.4+i*.12,size:.62});
      break;
    case 'wing':
      for(const side of [-1,1])for(let i=0;i<3;i++){
        const a=bearing+side*(.35+i*.26);
        fx(shape,wave(origin,a,1.0+i*.45),{y:.64+i*.28,size:.88,life:.45,angle:Math.PI/2-a,dx:Math.cos(a)*1.7,dz:Math.sin(a)*1.7});
      }
      break;
    case 'shell':
      for(let i=0;i<6;i++)fx(shape,wave(origin,bearing+i*Math.PI/3,1.05),{y:.37,life:.72,size:1.1,angle:i*Math.PI/3,lift:.38});
      fx('frost',origin,{life:1.10,size:1.48});
      break;
    case 'anchor':
      fx(shape,center,{life:.67,y:2.85,lift:-2.44,size:1.1});
      fx('trap',center,{life:1.33,size:2.20,spin:-1.4});
      break;
    case 'triad':
      for(let i=0;i<3;i++)fx(shape,wave(center,bearing+i*2*Math.PI/3,1.23),{y:3.2,life:.30+i*.16,size:.92,lift:-3.05});
      break;
    case 'sight':
      for(let i=0;i<4;i++)fx(shape,wave(origin,bearing,2.0+i*1.30),{y:.48,life:.38+i*.12,size:.62,angle:-bearing,lift:.78});
      break;
    case 'sweep':
      for(let i=0;i<3;i++)fx(shape,origin,{y:.38+i*.46,size:1.17+i*.47,life:.46+i*.10,angle:bearing+i*2.2,spin:i%2?7:-6});
      break;
    case 'strings':
      for(let i=0;i<5;i++){
        const anchor=wave(center,bearing+Math.PI*.5,(i-2)*.40);
        fx(shape,wave(anchor,bearing,-1.48),{y:.45+i*.20,life:.59,size:.9,angle:Math.PI*.5-bearing,stretchZ:3.45,lift:.4});
      }
      break;
    case 'orbit':
      for(let i=0;i<8;i++)fx(shape,wave(origin,bearing+i*Math.PI*.25,2.32),{y:.41,life:.55,size:.55,angle:i*Math.PI*.25,spin:5});
      break;
    case 'scythe':
      fx(shape,center,{y:.90,life:.40,size:1.68,angle:bearing,lift:.72,spin:9});
      fx('notch',center,{y:.34,life:.57,size:2.12,angle:-bearing,spin:-4.3});
      break;
    case 'bell':
      for(let i=0;i<3;i++)fx(shape,center,{y:.44+i*.52,life:.53+i*.19,size:1.33-i*.26,lift:.65+i*.25});
      break;
    case 'cross':
      for(const side of [-1,1])for(let i=0;i<2;i++){
        const a=bearing+side*.49,where=wave(origin,a,1.15+i*1.0);
        fx(shape,where,{y:1.35-i*.42,life:.32+i*.12,size:1.18,angle:-a,dx:Math.cos(a)*2,dz:Math.sin(a)*2,lift:-.45});
      }
      break;
    case 'fuse':
      fx(shape,center,{y:3.78,life:.49,size:1.09,lift:-3.20,spin:8});
      fx('stone',center,{y:.30,life:.74,size:.79,lift:1.10,spin:-9});
      break;
  }
}
