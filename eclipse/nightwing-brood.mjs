import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);

export function broodOfShadows(k,body,mobile){
  const siblings=[];
  const cast=(joint,finish,path,seed)=>k.geometry(joint,finish,sculptVolume(path,{
    sides:mobile?8:12,rings:mobile?10:16,section:2.17,ridge:.24,seed,
  }));
  const edge=(joint,finish,path)=>k.sculpt.sweep(joint,finish,path,{sides:6,steps:10,ridge:.21});
  for(const side of sides){
    const out=points=>mirror(side,points);
    for(let i=0;i<4;i++){
      const scale=1-i*.104;
      const rack=k.bone(body,side*(.263+i*.046),.241-i*.147,-.026-i*.155);
      rack.name='九影 · 副顎 '+(side===1?i+1:i+5);
      const skull=k.bone(rack,side*(.086+i*.036),.046+i*.016,.119-i*.040);
      const jaw=k.bone(skull,side*.018,-.052,.013);
      skull.scale.setScalar(scale);
      const base=out([[.02,-.079,-.081,.074,.052],[.063,-.051,-.041,.107,.079],
        [.079,.053,.002,.133,.089],[.052,.128,-.032,.099,.073],[.049,.161,-.065,.048,.047]]);
      cast(skull,'black',base,1.73+i*.81+side);
      cast(skull,'red',out([[.026,-.043,.029,.058,.049],[.079,-.013,.071,.103,.052],
        [.083,.058,.073,.093,.071],[.065,.095,.015,.055,.041]]),2.73+i*.19);
      cast(jaw,'clay',out([[.009,-.065,-.026,.042,.044],[.066,-.048,.064,.073,.053],
        [.052,-.011,.139,.056,.036],[.009,.016,.173,.022,.017]]),9.41+i*.73);
      edge(skull,'brass',out([[.009,.065,.121,.025],[.077,.121,.112,.032],[.155,.097,.058,.029],
        [.181,.046,-.018,.013],[.165,-.007,-.079,.004]]));
      edge(skull,'glow',out([[.028,.050,.123,.007],[.070,.068,.135,.012],
        [.107,.065,.119,.011],[.135,.049,.100,.004]]));
      edge(skull,'clay',out([[.092,.083,.015,.049],[.152,.199,-.033,.047],[.218,.245,-.101,.030],
        [.219,.268+i*.023,-.176,.005]]));
      for(let tooth=0;tooth<3;tooth++){
        const x=.039+tooth*.035;
        edge(jaw,'ivory',out([[x,-.021,.091+tooth*.012,.012],[x,-.001,.125+tooth*.009,.011],
          [x+.013,.022,.155+tooth*.005,.002]]));
      }
      const brace=out([[.008,.033,.052,.027],[.06,.048,-.057,.048],[.111,-.009,-.153,.057],
        [.142,-.101,-.257,.031],[.108,-.145,-.293,.004]]);
      edge(rack,'black',brace);
      edge(rack,i%2?'red':'brass',brace.slice(1).map(([x,y,z,r])=>[x+side*.021,y+.026,z+.017,r*.54]));
      siblings.push({rack,skull,jaw,side,order:i});
    }
  }
  return function bite({beat,wind,strike,travel,stage}){
    for(const {rack,skull,jaw,side,order} of siblings){
      const phase=beat*.68-order*.63+side*.20;
      rack.rotation.z=side*(.14+Math.sin(phase)*(.08+travel*.07)+stage*.09+wind*.20-strike*.10);
      rack.rotation.y=side*(Math.cos(phase*.77)*.11-wind*.17+strike*.28);
      skull.rotation.x=Math.sin(phase)*.064-wind*.18+strike*.31;
      jaw.rotation.x=.025+Math.max(0,Math.sin(phase+strike*.76))*.12+wind*.08+strike*(.62-order*.08);
    }
  };
}
