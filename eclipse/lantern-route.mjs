export const roomBounds={minX:-14.7,maxX:14.7,minZ:-15.9,maxZ:13.0};

export function lanternRadius(stage) {
  return 8.5-Math.min(.95,(stage?.dread??0)*.57)-(stage?.difficulty?.id==='abyss'?.38:0);
}

// Opening positions and masonry sampled from the painted rooms. Coordinates are
// in the same world space as the collision and interaction radius.
const doorways={
  'grove.jpg':{x:.38,z:-14.6,setback:1.95,stone:0x383c41,trim:0x5d6668,light:0x9fe2e2,shape:'round'},
  'fen.jpg':{x:2.71,z:-14.25,setback:1.65,stone:0x294644,trim:0x5c7770,light:0x71efce,shape:'point'},
  'lotus.jpg':{x:10.1,z:-12.2,setback:.70,stone:0x525641,trim:0x9d7e4c,light:0xffda8e,shape:'round',yaw:-.19},
  'frost.jpg':{x:-8.8,z:-13.2,setback:1.55,stone:0x565570,trim:0x8887ab,light:0xc9e1ff,shape:'point',yaw:.12},
  'forge.jpg':{x:6.72,z:-12.1,setback:1.45,stone:0x3e292e,trim:0x995b48,light:0xff9b55,shape:'forge',yaw:-.12},
  'grave.jpg':{x:.15,z:-10.95,stone:0x52536d,trim:0x84829e,light:0xc69fff,shape:'point'},
  'vault-gold.jpg':{x:-.35,z:-10.9,stone:0x464038,trim:0x9e7745,light:0xffd47d,shape:'vault'},
  'dunes.jpg':{x:11.05,z:-10.35,stone:0x714837,trim:0xb37a4c,light:0xffbb70,shape:'round',yaw:-.18},
  'fungus.jpg':{x:.19,z:-10.85,stone:0x344a3c,trim:0x658671,light:0x9bd5b6,shape:'root'},
  'cathedral.jpg':{x:-.22,z:-10.55,stone:0x4c4055,trim:0x80708a,light:0xba92fa,shape:'point'},
  'desecrated-cathedral.jpg':{x:.34,z:-10.45,stone:0x59454e,trim:0x956d85,light:0xf1a7db,shape:'root'},
  'throne.jpg':{x:1.02,z:-13.9,setback:1.7,stone:0x4a272c,trim:0x875647,light:0xef976f,shape:'point'},
  'crimson-throne.jpg':{x:1.02,z:-13.9,setback:1.7,stone:0x4a272c,trim:0x875647,light:0xff795c,shape:'point'},
};

export function routeLayout(stage,seed) {
  let value=(seed^Math.imul(stage.floor,0x9e3779b9))>>>0;
  const draw=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  const frame=doorways[stage.picture]??doorways['grove.jpg'];
  const exit={x:frame.x+(draw()-.5)*.42,z:frame.z+(draw()-.5)*.44,frame};
  const yaw=frame.yaw??0,cos=Math.cos(yaw),sin=Math.sin(yaw);
  const barricades=[];
  for(const [i,step] of [-.91,.91].entries()){
    const hp=15+stage.floor*.29;
    barricades.push({kind:'breakable',style:'fence',key:'gate-'+i,x:exit.x+step*cos+1.23*sin,z:exit.z+1.23*cos-step*sin,
      yaw,radius:.65,hp,maxHp:hp,chill:0,gate:true});
  }
  for(let i=0;i<4;i++){
    const x=(i%2?-1:1)*(7.2+draw()*5.15);
    const z=i<2?5.8+draw()*2.1:-3.2-draw()*4.5;
    const hp=19+stage.floor*.32;
    barricades.push({kind:'breakable',style:i%2?'urn':'crate',key:'room-'+i,x,z,radius:i%2?.61:.72,hp,maxHp:hp,chill:0});
  }
  return {...exit,barricades,ready:false,found:false,passed:false,clock:1.25,searchTime:0,prowls:0,seed:draw()*Math.PI*2};
}

const twins={
  75:{name:'青喪骨皇',effigy:'hound',frame:37,tint:0x9affb2,effect:'root',form:'萬根出殯',attacks:['roots','jaws','pounce','gravity']},
  85:{name:'照屍孿影',effigy:'eyes',frame:38,tint:0xefb2ff,effect:'void',form:'百目翻相',attacks:['gravefan','blink','toll','jaws']},
  95:{name:'斷燈孿王',effigy:'coffin',frame:39,tint:0xffa87e,effect:'blood',form:'暗火開棺',attacks:['jaws','cleave','toll','sweep']},
};

export function twinSpec(stage) {
  const twin=twins[stage.floor];
  if(!twin||(stage.floor===75&&stage.difficulty?.id!=='abyss'))return null;
  const mode=stage.difficulty;
  return {...twin,secondary:true,hp:Math.round((490+stage.floor*5.2)*(mode?.hp??1)),height:3.20,speed:2.52*Math.sqrt(mode?.pace??1),
    reach:5.12,radius:2.18,time:1.15/Math.sqrt(mode?.pace??1),hurt:(16+stage.floor*.19)*(mode?.damage??1),mass:4.0,phases:[.45]};
}
