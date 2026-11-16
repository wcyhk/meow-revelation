import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const bones=(k,j,finish,path,mobile,seed=0)=>k.geometry(j,finish,sculptVolume(path,{
  rings:mobile?13:20,sides:mobile?10:16,section:2.35,ridge:.22,fur:false,seed,
}));
const sweep=(k,j,finish,path,steps=13)=>k.sculpt.sweep(j,finish,path,{steps,sides:8,ridge:.19});

export function carveCloudDragon(k,head,mobile){
  head.name='狂魔惡龍 · 霜骨顱';
  bones(k,head,'drakeSlate',[[0,-.089,.489,.114,.071],[0,-.051,.325,.235,.135],[0,.077,.117,.310,.228],
    [0,.178,-.065,.279,.245],[0,.149,-.305,.214,.210],[0,.089,-.497,.074,.119]],mobile,3.3);
  bones(k,head,'drakeHorn',[[0,-.095,.398,.072,.041],[0,-.023,.464,.116,.075],[0,.074,.422,.102,.084],
    [0,.129,.299,.105,.103],[0,.17,.154,.063,.087]],mobile,5.18);
  const jaw=k.bone(head,0,-.129,.045);
  jaw.name='狂魔惡龍 · 下顎';
  bones(k,jaw,'drakeSlate',[[0,-.042,.490,.087,.050],[0,-.083,.345,.205,.087],[0,-.063,.129,.239,.095],
    [0,.014,-.092,.205,.106],[0,.042,-.229,.137,.085]],mobile,4.4);
  const frills=[];
  for(const side of sides){
    const f=path=>mirror(side,path);
    const brow=f([[.060,.115,.401,.026],[.133,.193,.344,.057],[.237,.211,.156,.071],
      [.301,.217,-.072,.064],[.32,.266,-.232,.025],[.304,.318,-.335,.004]]);
    sweep(k,head,'drakeHorn',brow,17);
    sweep(k,head,'deep',f([[.107,.092,.384,.013],[.187,.137,.299,.046],[.255,.154,.196,.031],
      [.278,.177,.106,.005]]),12);
    k.mesh(head,'gem','glow',side*.215,.152,.261,.040,.022,.022,0,side*.57,side*.20);
    const nostril=k.bone(head,side*.102,-.018,.465);
    nostril.rotation.y=side*.41;
    k.mesh(nostril,'gem','deep',0,0,0,.032,.022,.014);
    const cheeks=f([[.077,-.073,.424],[.168,-.038,.353],[.302,.057,.149],[.332,.106,-.045],
      [.307,-.095,-.234],[.273,-.181,-.105],[.218,-.130,.140],[.133,-.118,.317]]);
    k.sculpt.plate(head,'drakeHorn',cheeks,.052,.014);
    sweep(k,head,'drakeSlate',cheeks.slice(1,7).map(([x,y,z])=>[x+side*.035,y-.015,z+.004,.022]),14);
    for(let tooth=0;tooth<5;tooth++){
      const t=tooth*.20,x=.119+t*.116,z=.375-t*.39;
      const size=.032+(tooth%3)*.011;
      sweep(k,head,'drakeHorn',f([[x,-.095,z,size],[x+.009,-.150,z+.025,size*.72],
        [x-.017,-.185-size*.87,z+.035,.004]]),8);
      if(tooth%2===0)sweep(k,jaw,'drakeHorn',f([[x+.018,-.046,z,.029],[x+.023,.021,z+.013,.021],
        [x+.009,.060,z+.038,.003]]),8);
    }
    for(let ear=0;ear<4;ear++){
      const base=k.bone(head,side*(.236+ear*.018),.116-ear*.048,-.203-ear*.032);
      base.name='狂魔惡龍 · 活動鬃骨';
      const length=.475+ear*.038;
      const bone=f([[0,.035,.032,.054,.047],[.133,.089,-.115,.076,.050],
        [.349,.127-ear*.034,-length*.75,.046,.036],[.421,.020-ear*.064,-length,.004,.005]]);
      bones(k,base,ear===1?'drakeHorn':'drakeSlate',bone,mobile,ear*side);
      sweep(k,base,ear===1?'glow':'drakeTrim',bone.map(([x,y,z,r])=>[x,y+.026,z+.029,r*.34]),13);
      frills.push({base,side,ear});
    }
  }
  return {jaw,frills};
}

export function carveCloudEddies(k,bank,mobile){
  for(let i=0;i<(mobile?6:9);i++){
    const a=i*tau/(mobile?6:9),r=.42+i%3*.18;
    const eddy=k.bone(bank,Math.sin(a)*r,.02+i%3*.049,Math.cos(a)*r);
    eddy.name='狂魔惡龍 · 雲渦';
    eddy.rotation.y=-a+.77;
    bones(k,eddy,i%3?'mist':'drakeCloud',[[0,-.028,.398,.027,.046],[.107,-.063,.231,.180,.111],
      [.165,-.013,-.048,.239,.144],[.106,.078,-.322,.169,.127],[-.052,.123,-.472,.071,.057],
      [-.206,.194,-.608,.024,.029],[-.292,.235,-.65,.003,.005]],mobile,i*.28);
    sweep(k,eddy,'mist',[[.186,.074,.237,.027],[.285,.066,.031,.056],[.218,.098,-.251,.051],
      [.057,.147,-.421,.024],[-.168,.191,-.523,.006]]);
  }
}

export function poseCloudDragon(rig,beat,wind,strike,travel){
  rig.jaw.rotation.x=.058+wind*.147+strike*.391;
  for(const {base,side,ear} of rig.frills){
    const offset=beat*.72-ear*.68+side*.55;
    base.rotation.y=side*(.045+Math.sin(offset)*(.064+travel*.09)+strike*(.14+ear*.028));
    base.rotation.x=-Math.sin(offset*.89)*.14-wind*.16+strike*.28;
  }
}
