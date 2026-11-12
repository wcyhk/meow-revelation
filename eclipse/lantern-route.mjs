export const roomBounds={minX:-14.7,maxX:14.7,minZ:-15.9,maxZ:13.0};

export function lanternRadius(stage) {
  return 6.55-Math.min(.95,(stage?.dread??0)*.57)-((stage?.difficulty?.id==='abyss')?.38:0);
}

export function routeLayout(stage,seed) {
  let value=(seed^Math.imul(stage.floor,0x9e3779b9))>>>0;
  const draw=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  const side=draw()>.5?1:-1;
  const exit=stage.boss?{x:side*(1.2+draw()*2.2),z:-9.65-draw()*1.6}
    :{x:side*(4.3+draw()*7.4),z:-11.6-draw()*3.05};
  const barricades=[];
  for(const [i,step] of [-.91,.91].entries()){
    const hp=15+stage.floor*.29;
    barricades.push({kind:'breakable',style:'fence',key:'gate-'+i,x:exit.x+step,z:exit.z+1.23,radius:.65,hp,maxHp:hp,chill:0,gate:true});
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
