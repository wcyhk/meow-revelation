import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';

export const thunderPriestessFinishes={
  priestessSkin:[0xbda58a,.045,.66,'hide'],priestessHair:[0x42454c,.12,.72,'hide'],
  priestessSable:[0x212632,.18,.72,'cloth'],priestessRim:[0xc38a43,.68,.43,'bronze'],
  priestessSilk:[0xb4a58b,.06,.79,'cloth'],priestessSeal:[0x69482e,.41,.62,'bronze'],
};

export function sculptThunderPriestess(k,entry,mobile){
  const {root,bone,mesh,sculpt,geometry}=k;
  const body=bone(root,0,1.08,0),head=bone(body,.042,.88,.076);
  const collar=bone(body,0,.684,-.005),halo=bone(body,0,.93,-.33);
  const torso=bone(body,0,.08,.02);
  const arms=[],limbs=[],veils=[],signets=[];
  const shell=(j,m,path,seed=0)=>geometry(j,m,sculptVolume(path,
    {rings:mobile?13:19,sides:mobile?11:15,section:2.38,ridge:.17,seed}));
  const wax=(j,m,path)=>sculpt.sweep(j,m,path,{steps:12,sides:7,ridge:.21});
  const plate=(j,m,path,t=.040)=>sculpt.plate(j,m,path,t,.016);
  shell(torso,'priestessSable',[[0,-.286,-.022,.186,.139],[0,-.117,-.012,.252,.169],[0,.08,.008,.235,.176],
    [0,.276,.011,.261,.204],[0,.465,.034,.293,.217],[0,.548,.005,.249,.18]],1.43);
  shell(collar,'priestessSkin',[[0,-.157,-.013,.268,.206],[0,-.077,-.033,.276,.178],
    [0,.04,-.002,.20,.122],[0,.148,.041,.103,.096],[.019,.228,.054,.09,.096]],3.01);
  shell(torso,'priestessSilk',[[0,-1.029,-.14,.381,.229],[0,-.817,-.14,.355,.245],[0,-.536,-.082,.314,.231],
    [0,-.277,-.026,.256,.187],[0,-.122,-.021,.232,.156]],5.02);
  const {jaw}=carvedFace(k,head,{style:'noble',finish:'priestessSkin',brow:'priestessHair',dark:'deep',
    lids:'priestessSkin',eye:'glow',width:.288,detailed:!mobile});
  shell(head,'priestessHair',[[0,-.099,-.082,.144,.109],[0,.067,-.113,.194,.155],[0,.192,-.095,.177,.146],
    [-.017,.303,-.109,.139,.116],[-.028,.35,-.168,.083,.074]],6.67);
  const bun=bone(head,-.045,.234,-.192);
  shell(bun,'priestessHair',[[0,-.052,-.051,.102,.095],[0,.036,-.074,.132,.101],[-.028,.124,-.114,.103,.084],
    [-.063,.181,-.130,.056,.054]],7.20);
  for(const side of [-1,1]){
    const flip=points=>points.map(([x,...rest])=>[x*side,...rest]);
    wax(head,'priestessRim',flip([[.012,.144,.152,.016],[.089,.176,.132,.025],
      [.15,.176,.058,.028],[.18,.189,-.061,.018],[.151,.232,-.171,.006]]));
    for(let i=0;i<3;i++){
      const w=.105+i*.029;
      wax(head,'priestessHair',flip([[w*.39,.226-i*.014,.084,.028],[w*.74,.169-i*.036,.124,.041],
        [w,.071-i*.033,.11,.038],[w*1.13,-.018-i*.064,.039,.024],[w*1.16,-.121-i*.048,-.026,.004]]));
    }
    const arm=bone(body,side*.284,.552,.04),elbow=bone(arm,side*.066,-.335,.028);
    const palm=bone(elbow,side*.049,-.291,.073);
    arms.push(arm);limbs.push({forearm:elbow,side});
    shell(arm,'priestessSkin',flip([[.048,-.355,.024,.077,.092],[.058,-.203,.014,.108,.108],
      [.034,-.072,-.005,.118,.102],[.008,.095,-.012,.099,.093]]),side+1.91);
    shell(elbow,'priestessSkin',flip([[.036,-.298,.064,.064,.062],[.050,-.183,.061,.095,.084],
      [.046,-.078,.023,.101,.084],[.016,.054,.008,.075,.077]]),side+3.1);
    shell(palm,'priestessSkin',[[0,-.093,.037,.070,.061],[.015,-.009,.029,.087,.067],[.013,.069,-.004,.067,.058]]);
    for(let i=0;i<3;i++){
      const y=-.118-i*.060,z=.089+i*.012;
      wax(elbow,i%2?'priestessSeal':'priestessRim',flip([[-.065,y+.013,z,.016],[.026,y-.008,z+.052,.023],
        [.125,y+.037,z+.037,.022],[.154,y+.085,z-.025,.009]]));
    }
    const shoulder=bone(arm,0,-.143,-.064);
    const lower=bone(shoulder,side*.064,-.280,-.181);
    const outer=side===1?1.12:.92;
    shell(shoulder,'priestessSilk',flip([[.009,.057,.057,.099,.032],[.065,-.093,-.042,.148,.047],
      [.122,-.279,-.174,.141,.035],[.167*outer,-.355,-.224,.101,.030]]),side+8.21);
    shell(lower,'priestessSilk',flip([[.018,.032,.052,.108,.042],[.068,-.159,-.091,.161,.045],
      [.115,-.307*outer,-.228,.137,.029],[.156,-.431*outer,-.287,.012,.006]]),side+8.60);
    veils.push({shoulder,lower,side});
    for(let i=0;i<3;i++){
      const y=.10+i*.123,x=.108+i*.044;
      plate(torso,i%2?'priestessSeal':'priestessRim',flip([[.022,y+.075,.212],[x,y+.061,.193],[x+.056,y+.014,.167],
        [x+.073,y-.041,.121],[.101,y-.076,.245],[.024,y-.054,.253]]),.032);
    }
    const fold=bone(torso,side*.213,-.14,-.241);
    wax(fold,'priestessRim',flip([[.02,.055,.036,.013],[.11,-.149,-.058,.024],[.20,-.366,-.20,.024],
      [.236,-.595,-.308,.018],[.314,-.79,-.347,.006]]));
    for(let i=0;i<4;i++){
      const x=.053+i*.042,y=.15-i*.08,z=-.205-i*.035;
      plate(collar,'priestessRim',flip([[x*.4,y+.086,z],[x,y+.088,z-.043],[x+.108,y+.026,z-.076],
        [x+.123,y-.048,z-.103],[x+.022,y-.076,z-.065]]),.028);
    }
  }
  const tablet=bone(limbs[1].forearm,.055,-.293,.125);
  tablet.name='五運・太 · 天符冊';
  const way=[[-.137,.114,0],[.123,.141,0],[.173,.073,.032],[.165,-.116,.02],[.043,-.185,.047],
    [-.115,-.154,.039],[-.154,-.112,.023]];
  plate(tablet,'priestessSeal',way,.058);
  plate(tablet,'priestessSilk',way.map(([x,y,z])=>[x*.814,y*.83,z+.038]),.030);
  for(let i=0;i<4;i++){
    const y=.075-i*.049;
    wax(tablet,'priestessRim',[[-.083,y,.079,.006],[-.039,y+.011,.088,.010],[.018,y,.084,.009],[.088,y+.007,.078,.003]]);
  }
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4+0.33,x=Math.sin(a),y=Math.cos(a);
    const mark=bone(halo,x*.599,y*.716,.035+Math.sin(i*2.1)*.073);
    mark.rotation.z=-a;
    plate(mark,'priestessRim',[[-.073,-.068,0],[-.039,.076,.017],[.054,.097,-.005],
      [.091,-.037,.016],[.026,-.098,.034]],.034);
    wax(mark,'glow',[[-.041,-.041,.032,.009],[.01,.019,.047,.013],[.049,.062,.045,.004]]);
    signets.push({mark,a});
  }
  mesh(halo,'ring','priestessSeal',0,0,-.037,.582,.717,.39);
  mesh(halo,'ring','glow',0,0,.043,.567,.699,.22);
  return {body,head,arms,limbs,crest:bone(root,0,0,0),pattern:'hover',sourceSculpt:true,catalogueSculpt:entry.id,
    polishEnergy:{tint:0xf4bc5d,shape:'sigils',anchor:halo,span:[.77,.78,.48]},
    sourceDress(tools){
      for(const side of [-1,1])for(const back of [false,true]){
        const x=side*(back?.219:.155),z=back?-.222:.194,flow=back?.13:.075;
        tools.silk(torso,'五運・太 · 象牙金帛',[[x,-.121,z,.169],[x+side*.044,-.333,z+.048,.184],
          [x+side*.091,-.611,z+(back?-.129:.137),.181],[x+side*flow,-.876,z+(back?-.272:.164),.131],
          [x+side*flow*1.23,-1.106,z+(back?-.303:.146),.055]],
          {tint:0xa59b85,trim:0xc67738,lining:0x3d342c,style:'woven',phase:side+(back?1.6:.2),flex:1.34});
      }
      return true;
    },
    cataloguePose({beat,headtime,wind,strike,travel,stage}){
      arms[0].rotation.x=-.27-wind*.56-strike*.41;
      arms[0].rotation.z=-.18-wind*.08-strike*.23;
      arms[1].rotation.x=-.42-wind*.55+strike*.18;
      halo.rotation.z=headtime*.52+strike*.34;
      halo.rotation.y=Math.sin(beat*.43)*.107+wind*.17-strike*.26;
      for(const {mark,a} of signets){
        mark.rotation.z=-a+.16*Math.cos(beat*.66+a*2.0)+strike*.42;
        mark.position.z=.06+Math.sin(beat*.74+a)*.061+stage*.06;
      }
      jaw.rotation.x=.013+wind*.14+strike*.25;
      for(const {shoulder,lower,side} of veils){
        shoulder.rotation.z=side*(Math.sin(beat*.73)*.067+wind*.14+strike*.29);
        lower.rotation.x=travel*.22-wind*.11+strike*.23+Math.sin(beat*.89+side)*.087;
      }
    },
  };
}
