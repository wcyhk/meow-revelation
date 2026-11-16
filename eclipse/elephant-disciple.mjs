import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

export const elephantDiscipleFinishes={
  discipleHide:[0x465c7f,.08,.64,'hide'],discipleEar:[0x5c6075,.055,.72,'hide'],
  discipleIvory:[0xd0bb92,.17,.59,'bone'],discipleGold:[0x9e6c37,.62,.49,'bronze'],
  discipleIron:[0x313d4b,.71,.49,'iron'],discipleRed:[0x673434,.21,.63,'hide'],
};

export function carveElephantDisciple(k,entry,mobile){
  const {root,bone,mesh,geometry,sculpt}=k;
  const body=bone(root,0,1.13,0),head=bone(body,0,.85,.13);
  const nose=bone(head,0,-.052,.233),elbowNose=bone(nose,.012,-.231,.105),
    taperNose=bone(elbowNose,-.008,-.211,.146);
  const arms=[],legs=[],limbs=[],shins=[],ears=[];
  const volume=(j,m,steps,seed=0)=>geometry(j,m,sculptVolume(steps,{
    rings:mobile?14:21,sides:mobile?10:15,section:2.36,ridge:.19,seed,
  }));
  const trim=(j,m,path,steps=13)=>sculpt.sweep(j,m,path,{steps,sides:7,ridge:.19});
  const panel=(j,m,shape,depth=.047)=>sculpt.plate(j,m,shape,depth,.017);
  volume(body,'discipleHide',[[0,-.402,-.03,.322,.236],[0,-.19,-.004,.429,.31],[0,.046,.037,.509,.396],
    [0,.281,.031,.492,.381],[0,.533,-.037,.441,.27],[0,.703,-.042,.243,.18],[0,.807,.02,.131,.141]],1.92);
  volume(head,'discipleHide',[[0,-.215,.064,.129,.146],[0,-.094,.021,.242,.231],[0,.098,-.016,.296,.255],
    [.011,.262,-.047,.237,.174],[.013,.396,-.07,.151,.117]],4.48);
  volume(nose,'discipleHide',[[0,.095,-.089,.122,.124],[0,-.017,.015,.153,.136],[.013,-.122,.093,.129,.122],
    [.014,-.223,.105,.106,.100]],8.54);
  volume(elbowNose,'discipleHide',[[0,.047,-.012,.106,.092],[.004,-.059,.037,.099,.096],[-.010,-.136,.09,.090,.087],
    [-.018,-.23,.151,.072,.075]],8.7);
  volume(taperNose,'discipleHide',[[0,.031,-.011,.071,.074],[.011,-.081,.069,.076,.075],
    [.034,-.138,.157,.066,.072],[.052,-.099,.234,.054,.056],[.059,-.026,.249,.046,.04]],9.4);
  volume(head,'discipleGold',[[0,.185,-.056,.151,.127],[0,.280,-.041,.212,.171],[0,.394,-.043,.199,.161],
    [.027,.486,-.054,.165,.134],[.043,.565,-.097,.089,.107],[.037,.617,-.096,.053,.072]],6.42);
  for(const side of [-1,1]){
    const out=path=>path.map(([x,...r])=>[side*x,...r]);
    const ear=bone(head,side*.23,.012,-.025);ears.push({ear,side});
    ear.name='迦尼薩師弟 · 耳殼';
    volume(ear,'discipleHide',out([[.019,-.276,-.096,.036,.046],[.094,-.197,-.100,.131,.064],
      [.167,-.031,-.116,.166,.079],[.145,.147,-.141,.165,.075],[.105,.251,-.17,.077,.042],
      [.063,.283,-.193,.015,.014]]),3*side);
    panel(ear,'discipleEar',out([[.015,.138,-.047],[.122,.207,-.100],[.245,.169,-.148],[.264,-.004,-.169],
      [.19,-.177,-.132],[.101,-.21,-.087],[.04,-.102,-.041]]),.025);
    trim(ear,'discipleIvory',out([[.042,.119,-.031,.017],[.134,.158,-.086,.022],[.218,.105,-.089,.018],
      [.213,-.015,-.103,.012],[.156,-.115,-.074,.004]]));
    trim(head,'deep',out([[.051,.055,.199,.018],[.124,.101,.203,.039],[.194,.091,.154,.036],[.231,.047,.102,.006]]));
    mesh(head,'gem','glow',side*.123,.067,.231,.038,.017,.019,0,side*.29,side*.1);
    volume(head,'discipleIvory',out([[.128,-.084,.115,.064,.054],[.225,-.127,.218,.081,.056],
      [.296,-.113,.338,.059,.039],[.342,-.034,.399,.040,.023],[.344,.065,.424,.005,.006]]),6.88+side);
    trim(head,'discipleIron',out([[.039,.251,.129,.034],[.129,.317,.148,.046],[.206,.313,.091,.041],
      [.221,.245,-.048,.024],[.175,.224,-.171,.005]]));
    for(let i=0;i<4;i++){
      const y=.517-i*.151,w=.449-i*.021;
      const chest=out([[.024,y+.083,.336],[.195,y+.10,.296],[w*.91,y+.021,.096],
        [w,y-.061,-.017],[w*.83,y-.129,.09],[.177,y-.087,.348],[.017,y-.059,.372]]);
      panel(body,i%2?'discipleIron':'discipleGold',chest,.047);
      trim(body,i%2?'discipleGold':'discipleIvory',chest.slice(1,6).map(([x,y,z],j)=>[x,y+.018,z+.023,[.012,.022,.021,.014,.005][j]]));
      const rear=out([[.058,y+.113,-.22],[.226,y+.083,-.256],[w*.89,y+.025,-.199],
        [w,y-.118,-.118],[.216,y-.13,-.302],[.071,y-.05,-.353]]);
      panel(body,i%2?'discipleRed':'discipleIron',rear,.052);
      trim(body,'discipleGold',rear.slice(1).map(([x,y,z],j)=>[x,y,z-.026,[.014,.021,.019,.015,.004][j]]));
    }
    const upper=bone(body,side*.443,.537,.014),elbow=bone(upper,side*.091,-.449,.08);
    const palm=bone(elbow,side*.057,-.356,.08);
    arms.push(upper);limbs.push({forearm:elbow,side});
    volume(upper,'discipleHide',out([[.094,-.455,.074,.148,.149],[.133,-.262,.048,.185,.177],
      [.094,-.084,.028,.231,.206],[.013,.102,-.023,.165,.148]]),3+side);
    volume(elbow,'discipleHide',out([[.059,-.372,.07,.106,.11],[.081,-.241,.033,.136,.158],
      [.075,-.074,.004,.164,.167],[.01,.06,.021,.123,.123]]),4+side);
    volume(palm,'discipleHide',[[0,-.131,.071,.101,.103],[.007,-.053,.065,.128,.125],
      [.007,.061,.024,.106,.105]],3);
    for(let p=0;p<3;p++){
      const y=.118-p*.108;
      panel(upper,p%2?'discipleIron':'discipleIvory',out([[-.068,y+.034,.11],[.097,y+.143,.034],
        [.241,y+.099,-.086],[.302,y-.018,-.166],[.207,y-.129,-.103],[.044,y-.088,.132]]));
    }
    for(let digit=0;digit<4;digit++){
      const x=(digit-1.5)*.054;
      trim(palm,'discipleEar',[[x,-.075,.114,.031],[x,-.149,.135,.033],[x*.93,-.176,.103,.026],[x*.95,-.143,.059,.013]]);
    }
    const hip=bone(root,side*.296,.924,.059),shin=bone(hip,side*.036,-.454,.041);
    legs.push(hip);shins.push({shin,side});
    volume(hip,'discipleHide',out([[.039,-.463,.042,.109,.118],[.053,-.289,.023,.183,.169],
      [.013,-.096,-.009,.201,.187],[-.028,.095,-.013,.151,.145]]),3.6+side);
    volume(shin,'discipleIron',out([[.022,-.43,.076,.116,.113],[.034,-.325,.027,.134,.135],
      [.041,-.156,.032,.146,.146],[.011,.052,.053,.132,.138]]),7.1+side);
    for(let toe=0;toe<3;toe++){
      const x=(toe-1)*.075;
      volume(shin,'discipleIvory',[[x,-.377,.15,.057,.057],[x*1.12,-.411,.224,.062,.056],[x*1.15,-.434,.286,.038,.027],
        [x*1.14,-.436,.313,.005,.005]],toe+side);
    }
    if(side===1){
      const axe=bone(palm,0,-.047,.099);
      axe.name='迦尼薩師弟 · 玄刃短斧';
      markEnemyWeapon(axe,[.68,.79,.067],{width:.28});
      trim(axe,'discipleIron',[[0,-.308,-.02,.054],[0,.089,0,.056],[.068,.29,.036,.071],[.137,.63,.06,.057]]);
      const outline=[[.016,.41,.026],[.132,.68,.04],[.38,.849,.033],[.57,.862,.052],[.68,.79,.067],
        [.53,.624,.102],[.34,.513,.111],[.207,.412,.059],[.074,.376,.037]];
      panel(axe,'discipleIron',outline,.068);
      trim(axe,'discipleIvory',outline.slice(3,8).map(([x,y,z],i)=>[x,y,z+.030,[.014,.02,.018,.014,.004][i]]),17);
      trim(axe,'discipleGold',[[.106,.493,.073,.029],[.233,.674,.091,.032],[.427,.763,.106,.019],[.549,.76,.116,.006]]);
    }
  }
  return {body,head,arms,legs,limbs,crest:bone(root,0,0,0),sourceSculpt:true,catalogueSculpt:entry.id,pattern:'slam',
    polishEnergy:{tint:0xa3b8e9,shape:'ribbons',anchor:body,span:[.92,.68,.73]},
    sourceDress(tools){
      for(const side of [-1,1])for(const back of [false,true]){
        const d=back?-.01:.07,z=back?-.33:.29,x=side*(back?.30:.17);
        tools.silk(body,'迦尼薩 · 走金袍擺',[[x,d,z,.112],[x+side*.046,-.24,z*1.21,.14],
          [x+side*.118,-.49,z*1.42,.122],[x+side*.156,-.71,z*1.64,.081],[x+side*.19,-.85,z*1.61,.018]],
          {tint:back?0x72372d:0x263c58,trim:0xbd8f4b,lining:0x46352d,phase:side+(back?2.4:.2),style:'woven',flex:back?1.15:.99});
      }
      return true;
    },
    cataloguePose({beat,step,wind,strike,travel,stage,fall}){
      nose.rotation.x=Math.sin(beat*.69)*.117-wind*.31+strike*.42;
      nose.rotation.y=Math.sin(beat*.52)*.181+stage*.14;
      elbowNose.rotation.x=Math.cos(beat*.74)*.074-wind*.19+strike*.38;
      taperNose.rotation.x=Math.sin(beat*.91-.36)*.168+strike*.43;
      for(const {ear,side} of ears)ear.rotation.y=side*(Math.cos(beat*.86)*.105+wind*.22-strike*.42+stage*.15);
      for(const {shin,side} of shins)shin.rotation.x=Math.max(0,Math.sin(step+side*Math.PI*.5))*travel*.52+strike*.23+fall*.20;
    },
  };
}
