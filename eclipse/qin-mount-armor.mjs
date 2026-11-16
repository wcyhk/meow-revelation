import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:15,sides:mobile?6:8,ridge:.18});
const volume=(k,j,m,p,mobile,seed=7)=>k.geometry(j,m,sculptVolume(p,{rings:mobile?12:16,
  sides:mobile?9:13,section:2.38,ridge:.16,seed}));

function steelwork(k,j,material,trim,path,mobile,depth=.039){
  k.sculpt.plate(j,material,path,depth,depth*.28);
  sweep(k,j,trim,path.slice(0,-1).map(([x,y,z],i)=>[x,y+.009,z+.011,i===0?.005:.014]),mobile);
}

export function qinMountLeg(k,leg,knee,side,front,mobile){
  const f=x=>side*x;
  const thigh=front?[[0,.146,-.041,.129,.148],[.024,.017,.003,.145,.156],[.039,-.127,.031,.108,.127],
    [.04,-.298,.065,.079,.073],[.049,-.395,.101,.062,.06]]:
    [[-.009,.202,.047,.179,.142],[.023,.049,.032,.179,.153],[.051,-.116,-.036,.131,.10],
    [.045,-.287,-.122,.077,.073],[.048,-.393,-.143,.065,.069]];
  const lowerLeg=[[0,.067,-.023,.058,.072],[.017,-.064,.005,.082,.077],[.023,-.193,.038,.057,.064],
    [.027,-.300,.038,.048,.057],[.031,-.367,.059,.059,.063]];
  volume(k,leg,front?'ivory':'cobalt',mirror(side,thigh),mobile,front?9:4);
  volume(k,knee,front?'ivory':'steel',mirror(side,lowerLeg),mobile,12);
  const fetlock=k.bone(knee,f(.025),-.356,.064);
  fetlock.name='騎馬槍手 · 馬蹄';
  volume(k,fetlock,'lining',[[0,.045,-.011,.048,.061],[0,-.004,.009,.066,.07],
    [f(.009),-.047,.076,.090,.065],[f(.012),-.069,.102,.081,.055]],mobile,15);
  steelwork(k,fetlock,'steel','ironRim',mirror(side,[[.021,.007,.095],[.067,-.011,.077],
    [.083,-.045,.098],[.021,-.052,.143],[-.063,-.051,.123],[-.074,-.029,.089]]),mobile,.03);
  for(const [index,[x,y,z,r]] of [[.082,-.122,.063,.014],[.055,-.222,.075,.013],[.037,-.291,.083,.010]].entries()){
    sweep(k,knee,index===1?'brass':'cobalt',mirror(side,[[x-.028,y-.02,z-.044,r],[x,y,z-.005,r*1.65],
      [x-.049,y+.008,z+.027,r*.87],[x-.099,y-.013,z,r*.37]]),mobile);
  }
  if(front){
    steelwork(k,knee,'steel','ironRim',mirror(side,[[.011,.073,.071],[.083,.026,.049],
      [.076,-.193,.093],[.039,-.252,.113],[-.016,-.201,.098],[-.035,-.019,.073]]),mobile,.038);
  }else{
    steelwork(k,leg,'jade','brass',mirror(side,[[.045,.14,.075],[.149,.148,.041],[.203,.057,-.033],
      [.182,-.143,-.065],[.103,-.23,-.029],[.068,-.074,.092]]),mobile,.047);
  }
  return fetlock;
}

export function qinMountArmor(k,mount,neck,muzzle,mobile){
  const saddle=k.bone(mount,0,.28,-.481);
  saddle.name='騎馬槍手 · 馬尾鞍甲';
  const skirts=[];
  for(const side of [-1,1]){
    const f=x=>side*x;
    const bolster=k.bone(saddle,f(.142),.095,.048);
    volume(k,bolster,'lining',mirror(side,[[.009,.04,.18,.061,.047],[.066,.045,.09,.084,.061],
      [.138,.025,-.04,.077,.043],[.199,-.056,-.131,.060,.031]]),mobile,31);
    for(let row=0;row<4;row++){
      const y=.015-row*.088,z=-row*.094;
      const plate=k.bone(saddle,0,0,0);
      plate.rotation.y=f(.17);
      const rear=mirror(side,[[.012,y+.086,.035+z],[.153,y+.077,.018+z],[.304,y+.029,.039+z],
        [.355,y-.069,.13+z],[.298,y-.152,.10+z],[.148,y-.152,-.035+z],[.029,y-.095,-.083+z]]);
      steelwork(k,plate,row%2?'cobalt':'jade','steel',rear,mobile,.049);
      for(let pin=0;pin<3;pin++){
        const x=.096+pin*.069;
        const rivetZ=-.021+z+.001*pin;
        k.mesh(plate,'gem','brass',f(x),y+.029-pin*.016,rivetZ,.02,.022,.016);
        sweep(k,plate,'lining',mirror(side,[[x-.015,y+.044-pin*.016,rivetZ-.015,.012],
          [x+.012,y+.014-pin*.016,rivetZ-.025,.014],[x-.001,y-.013-pin*.016,rivetZ-.019,.008]]),mobile);
      }
      skirts.push({plate,side,row});
    }
    for(const strand of [0,1,2])sweep(k,saddle,strand===1?'brass':'ochre',mirror(side,[[.164,.149,.112,.015],
      [.23,.13,-.08,.025],[.288-strand*.034,.009,-.254,.028],
      [.332-strand*.038,-.133,-.324,.020],[.369-strand*.042,-.245,-.356,.006]]),mobile);
    const brow=mirror(side,[[.009,.143,.112],[.103,.159,.067],[.155,.110,-.039],
      [.144,.023,.065],[.104,-.075,.243],[.044,-.028,.294],[.014,.06,.187]]);
    steelwork(k,muzzle,'steel','ironRim',brow,mobile,.045);
    sweep(k,muzzle,'brass',mirror(side,[[.024,.094,.238,.005],[.097,.04,.192,.014],
      [.129,-.055,.140,.018],[.144,-.124,.025,.023],[.131,-.205,-.159,.008]]),mobile);
    sweep(k,neck,'lining',mirror(side,[[.154,.539,.262,.017],[.182,.411,.221,.025],[.23,.283,.170,.031],
      [.248,.061,.113,.033],[.239,-.091,.054,.012]]),mobile);
  }
  return ({beat,wind,strike,travel})=>{
    for(const {plate,side,row} of skirts){
      plate.rotation.y=side*(.17+Math.sin(beat*.77-row*.29)*travel*.080+wind*.052-strike*.077);
      plate.rotation.x=Math.cos(beat*.78-row*.37)*(.029+travel*.065)+strike*.15;
    }
  };
}
