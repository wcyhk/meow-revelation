import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';

export const fateTempleFinishes={
  fateSkin:[0xae8c73,.035,.70,'hide'],fatePale:[0xa6b3b9,.10,.69,'hide'],
  fateDark:[0x303047,.12,.73,'hide'],fateSilk:[0xc1b9a1,.066,.76,'cloth'],
  fateGold:[0xa38145,.62,.48,'bronze'],fateJade:[0x487b65,.45,.52,'bronze'],
};

const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

export function fateMentorPortrait(wind){
  return function carve(k,head,mobile){
    const {jaw}=carvedFace(k,head,{style:wind?'noble':'elder',width:wind?.31:.337,finish:'fateSkin',
      eye:'glow',brow:wind?'fateDark':'fatePale',dark:'black',lids:'fateSkin',detailed:!mobile});
    const tone=wind?'fateDark':'fatePale',locks=[];
    for(const side of [-1,1]){
      const fan=p=>mirror(side,p);
      const part=k.bone(head,side*.131,.081,-.084);
      part.name=wind?'五運・蕭 · 綰髮':'五運・傳 · 白髮';
      for(let i=0;i<(mobile?5:8);i++){
        const x=.018+i*.015,drop=(wind?.38:.75)+i*.025;
        k.geometry(part,tone,sculptVolume(fan([[x,.164,.004,.043,.041],
          [x+.022,.056,-.014,.064,.049],[x+.039,-drop*.26,-.068,.054,.047],
          [x+.074,-drop*.54,-.148,.044,.041],[x+.092,-drop*.78,-.238,.032,.025],
          [x+.105,-drop,-.31,.006,.004]]),{sides:8,rings:11,section:2.11,ridge:.19,seed:side+i*2.31}));
      }
      if(wind)k.sculpt.sweep(head,'fateGold',fan([[.033,.162,.139,.017],[.087,.176,.112,.024],
        [.162,.158,.046,.023],[.172,.139,-.09,.011]]),{steps:11,sides:6,ridge:.19});
      if(!wind){
        k.sculpt.sweep(jaw,'fatePale',fan([[.058,-.059,.133,.016],[.094,-.086,.152,.024],
          [.103,-.16,.127,.016],[.119,-.209,.088,.006]]),{steps:10,sides:7,ridge:.17});
        k.sculpt.plate(head,'steel',fan([[.081,.16,.035],[.155,.182,.054],[.179,.085,.105],
          [.151,.044,.126],[.104,.083,.114]]),.029,.013);
      }
      locks.push({part,side});
    }
    return {jaw,locks};
  };
}

export function poseFateMentor(rig,pose,wind){
  const {beat,strike,wind:windup,travel}=pose;
  for(const {part,side} of rig.look.locks){
    part.rotation.x=Math.sin(beat*.67+side)*(wind?.075:.129)+travel*.22-windup*.13+strike*.27;
    part.rotation.y=side*(Math.cos(beat*.64)*.085+windup*.16-strike*.19);
  }
}

export function dressFateMentor(rig,tools,wind){
  const color=wind?0xa8aa91:0x273a62,edge=wind?0x88975a:0xa9bfce,lining=wind?0x354a32:0x302e46;
  for(const {side,shoulder,elbow} of rig.limbs){
    const out=path=>mirror(side,path);
    const long=wind?.62:.81,reach=wind?.23:.31;
    tools.silk(shoulder,'五運 · 寬袖',out([[.016,.012,.018,.113],[.059,-.129,-.013,.15],
      [.079,-.284,-.014,.181],[.123,-long*.75,-.094,.200],[reach,-long,-.21,.052]]),
    {tint:color,trim:edge,lining,across:[.62,.0,.78],style:'woven',phase:side*.83,flex:wind?1.31:1.06});
    tools.silk(elbow,'五運 · 袖緣',out([[.002,-.073,.08,.065],[.038,-.191,.071,.093],
      [.076,-.338,.027,.101],[.095,-long*.79,-.105,.021]]),
    {tint:color,trim:edge,lining,across:[.72,0,.58],style:'woven',phase:side*.42,flex:1.05});
    tools.silk(rig.body,'五運 · 長背幅',out([[.155,.503,-.185,.113],[.253,.277,-.273,.151],
      [.342,-.12,-.391,.196],[.403,-.452,-.582,.177],[.524,-.89,-.760,.029]]),
    {tint:wind?0x335e50:0x283959,trim:edge,lining,style:'woven',phase:side*1.87,flex:1.48});
    tools.silk(rig.body,'五運 · 腰間繡襬',out([[.118,.041,.207,.12],[.145,-.243,.279,.177],
      [.175,-.54,.370,.159],[.273,-.80,.434,.118],[.313,-.934,.473,.026]]),
    {tint:wind?0xaf9f85:0x8e9799,trim:wind?0x989a65:0x7f9cb8,lining,style:'woven',phase:side*.93,flex:1.10});
  }
  return true;
}
