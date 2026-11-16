import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(s,p)=>p.map(([x,...r])=>[s*x,...r]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:16,sides:mobile?6:9,ridge:.17});
const mass=(k,j,m,p,mobile,seed=0,section=2.44,fur=false)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?12:18,sides:mobile?10:15,section,ridge:.17,seed,fur,
}));
const plate=(k,j,m,path,d=.039)=>k.sculpt.plate(j,m,path,d,d*.29);

export const qinFireFinishes={
  qinOxblood:[0x862c22,.10,.74,'cloth'],qinUnlit:[0x241e23,.16,.72,'cloth'],
  qinLacquer:[0x363239,.34,.55,'iron'],qinCuff:[0x665236,.44,.55,'bronze'],
  qinWire:[0x9b7442,.58,.46,'bronze'],qinBlade:[0xb9964c,.62,.39,'bronze'],
  qinBladeBack:[0x726249,.52,.49,'iron'],qinSkin:[0xa07962,.047,.76,'hide'],
  qinHair:[0x292224,.058,.82,'hide'],qinEye:[0x9e5835,.13,.41,'gem'],
};

export function qinGownCore(k,body,shape,mobile){
  mass(k,body,'qinUnlit',shape,mobile,26);
  const lapels=sides.map(s=>mirror(s,[[.089,.820,.046],[.254,.756,.152],[.302,.673,.195],
    [.235,.472,.229],[.135,.224,.246],[.053,.071,.216],[.004,.205,.241],[.102,.535,.246]]));
  for(const [i,lapel] of lapels.entries()){
    plate(k,body,i?'qinLacquer':'qinOxblood',lapel,.048);
    sweep(k,body,'qinWire',lapel.slice(0,6).map(([x,y,z],n)=>[x,y,z+.029,[.021,.025,.024,.020,.021,.012][n]]),mobile);
  }
  for(const s of sides){
    const t=p=>mirror(s,p);
    sweep(k,body,'qinOxblood',t([[.112,.797,-.124,.074],[.202,.691,-.218,.092],[.217,.498,-.252,.082],
      [.173,.266,-.234,.051],[.112,.101,-.195,.031]]),mobile);
    for(let r=0;r<4;r++)plate(k,body,r%2?'qinCuff':'qinLacquer',t([[.014,.68-r*.119,-.249],
      [.139,.705-r*.126,-.263],[.231,.615-r*.122,-.224],[.197,.550-r*.112,-.243],
      [.061,.566-r*.117,-.280],[.012,.593-r*.107,-.286]]),.032);
  }
  mass(k,body,'qinOxblood',[[0,-.105,0,.283,.229],[0,-.057,0,.312,.260],
    [0,.030,0,.311,.262],[0,.068,0,.288,.236]],mobile,13,3.04);
  for(const s of sides)sweep(k,body,'qinWire',mirror(s,[[0,-.052,.260,.020],[.163,-.024,.256,.019],
    [.288,-.031,.155,.020],[.314,-.037,-.041,.019],[.243,-.038,-.192,.019],[0,-.058,-.258,.020]]),mobile);
  plate(k,body,'qinCuff',[[-.108,.031,.268],[.073,.052,.275],[.102,.002,.281],
    [.011,-.112,.273],[-.091,-.084,.266]],.032);
  plate(k,body,'qinBlade',[[-.052,.004,.296],[.068,.019,.296],[.048,-.047,.304],[-.012,-.077,.301]],.019);
}

export function qinCourtHead(k,head,mobile){
  const face=carvedFace(k,head,{style:'elder',finish:'qinSkin',lids:'qinSkin',brow:'qinHair',eye:'qinEye',
    detailed:!mobile,width:.290,tone:5,fang:'qinBladeBack'});
  mass(k,head,'qinHair',[[0,-.082,-.088,.142,.105],[0,.083,-.124,.170,.126],[0,.200,-.108,.158,.117],
    [.020,.291,-.078,.118,.103],[.040,.350,-.097,.056,.054]],mobile,17,2.51,true);
  mass(k,face.jaw,'qinHair',[[0,-.223,.133,.026,.024],[0,-.151,.139,.044,.041],[0,-.073,.113,.067,.064],
    [0,-.014,.089,.078,.054]],mobile,28,2.23,true);
  for(const s of sides){
    const t=p=>mirror(s,p);
    sweep(k,head,'qinHair',t([[.007,-.057,.210,.017],[.049,-.061,.213,.024],
      [.096,-.081,.182,.019],[.153,-.108,.126,.006]]),mobile);
    sweep(k,head,'qinHair',t([[.127,.159,-.055,.035],[.152,.082,-.039,.038],[.146,-.002,-.021,.020],
      [.124,-.093,.038,.005]]),mobile);
    sweep(k,face.jaw,'qinHair',t([[.079,-.020,.084,.024],[.066,-.078,.122,.022],[.049,-.150,.134,.014],
      [.024,-.195,.135,.003]]),mobile);
    mass(k,head,'qinSkin',t([[.138,-.014,-.024,.020,.026],[.168,.022,-.039,.041,.040],
      [.167,.106,-.045,.036,.039],[.151,.139,-.058,.018,.019]]),mobile,27);
    sweep(k,head,'qinHair',t([[.146,.257,-.132,.029],[.136,.174,-.199,.043],
      [.110,.087,-.225,.040],[.081,-.040,-.193,.009]]),mobile);
  }
  return face;
}

function crown(k,head,mobile){
  const top=k.bone(head,0,.277,-.012),chains=[];
  mass(k,top,'qinLacquer',[[0,-.048,-.065,.179,.124],[.005,.052,-.074,.174,.125],
    [.012,.160,-.080,.129,.107],[.009,.241,-.083,.106,.098]],mobile,16,2.86);
  const lid=[[-.260,.188,-.330],[.208,.187,-.342],[.230,.164,.290],[-.249,.164,.299]];
  plate(k,top,'qinLacquer',lid,.067);
  sweep(k,top,'qinWire',[...lid,lid[0]].map(([x,y,z])=>[x,y+.032,z,.011]),mobile);
  for(const s of sides)for(let i=0;i<7;i++){
    const x=(i-3)*.065,y=s===1?.157:.170,z=s===1?.304:-.342;
    const chain=k.bone(top,x,y,z),length=.103+(1-Math.abs(i-3)/3)*.148+(s===1?.005:.072);
    sweep(k,chain,'qinWire',[[0,0,0,.006],[.006,-length*.51,.011,.006],
      [.004,-length,.008,.004]],mobile);
    const beads=mobile?4:6;
    for(let n=1;n<=beads;n++){
      const r=.010+(n%2)*.004;
      k.mesh(chain,'round',n%3?'qinCuff':'qinOxblood',.005,-n*length/beads,.008,r,r*.91,r);
    }
    chains.push(chain);
  }
  return chains;
}

function sleeve(k,limb,mobile){
  const {shoulder,elbow,wrist,knee,leg,side:s}=limb,t=p=>mirror(s,p);
  mass(k,shoulder,'qinOxblood',t([[0,.076,-.012,.131,.118],[.046,-.002,-.011,.156,.151],
    [.112,-.158,.017,.151,.139],[.142,-.327,.014,.113,.106]]),mobile,8,2.45);
  mass(k,elbow,'qinUnlit',t([[0,.040,-.004,.114,.108],[.032,-.067,.030,.129,.112],
    [.026,-.202,.047,.134,.116],[.021,-.329,.059,.094,.092]]),mobile,3,2.58);
  mass(k,wrist,'qinSkin',t([[.000,.048,0,.072,.065],[.009,-.016,.016,.094,.081],
    [.010,-.087,.070,.065,.050]]),mobile,41);
  mass(k,leg,'qinUnlit',t([[0,.064,-.019,.126,.137],[.010,-.151,-.032,.134,.143],
    [.026,-.386,-.045,.102,.120]]),mobile,41);
  mass(k,knee,'qinLacquer',t([[0,.043,-.013,.115,.107],[.018,-.156,.018,.104,.106],
    [.023,-.266,.078,.127,.112],[.024,-.294,.246,.142,.064],[.022,-.290,.295,.073,.026]]),mobile,41,3.14);
  for(let i=0;i<3;i++){
    const y=.03-i*.058;
    plate(k,shoulder,i===1?'qinCuff':'qinLacquer',t([[.005,y+.094,-.079],[.132,y+.07,-.125],
      [.199,y+.007,-.013],[.149,y-.076,.116],[.089,y-.119,.148],[.014,y-.061,.102]]),.032);
    sweep(k,shoulder,'qinWire',t([[.022,y-.047,.122,.010],[.127,y-.061,.121,.019],
      [.196,y-.035,-.016,.015],[.161,y+.016,-.114,.004]]),mobile);
    sweep(k,elbow,'qinWire',t([[.146,-.133-i*.05,.017,.015],[.109,-.138-i*.05,.144,.017],
      [-.028,-.139-i*.05,.131,.018],[-.074,-.138-i*.049,.027,.008]]),mobile);
  }
  plate(k,elbow,'qinLacquer',t([[.056,.013,.107],[.13,-.07,.137],[.14,-.203,.158],
    [.078,-.297,.157],[.010,-.270,.146],[-.027,-.127,.143]]),.039);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.034;
    sweep(k,wrist,'qinSkin',[[x,.011,.065,.024],[x,-.042,.100,.027],[x,-.087,.102,.019]],mobile);
  }
  sweep(k,knee,'qinWire',t([[-.080,-.226,.122,.012],[.031,-.243,.216,.016],
    [.126,-.266,.219,.012],[.140,-.281,.167,.003]]),mobile);
}

function imperialSabre(k,wrist,mobile){
  const blade=k.bone(wrist,.024,-.061,.049);
  blade.name='不死的秦始皇 · 鎏金刀';
  const edge=[[0,.147,.012],[.061,.154,.012],[.102,.482,.006],[.161,.801,-.023],
    [.254,1.092,-.076],[.214,1.071,-.075],[.117,.827,-.033],[.063,.513,.006],[-.019,.163,.016]];
  plate(k,blade,'qinBladeBack',edge,.030);
  sweep(k,blade,'qinBlade',[[.061,.143,.022,.012],[.106,.487,.015,.016],
    [.167,.804,-.015,.016],[.254,1.092,-.069,.002]],mobile);
  sweep(k,blade,'qinWire',[[0,-.176,0,.035],[0,-.104,0,.039],[0,.078,0,.034],[.01,.162,.017,.032]],mobile);
  for(let i=0;i<4;i++)sweep(k,blade,'qinHair',[[.033,-.101+i*.038,-.016,.009],[.018,-.094+i*.038,.036,.012],
    [-.030,-.085+i*.038,.019,.009]],mobile);
  sweep(k,blade,'qinCuff',[[-.126,.116,.016,.009],[-.067,.130,.032,.032],[.048,.118,.037,.027],[.117,.145,.005,.006]],mobile);
  markEnemyWeapon(blade,[.254,1.092,-.076],{width:.070,aim:false});
  return blade;
}

export function fitQinFireRegalia(k,rig,mobile){
  const {body,head,limbs}=rig,chains=crown(k,head,mobile);
  for(const limb of limbs)sleeve(k,limb,mobile);
  const blade=imperialSabre(k,limbs[1].wrist,mobile);
  const spread=Array.from({length:10},(_,i)=>i*Math.PI/5);
  let melee=false;
  return {
    sourceDress(tools){
      for(const [i,a] of spread.entries()){
        const sin=Math.sin(a),cos=Math.cos(a),red=Math.abs(sin)>.55;
        const span=.64+.053*Math.cos(a*2);
        const path=[[sin*.276,-.082,cos*.228,.095],[sin*.347,-.408,cos*.288,.149],
          [sin*(span-.1),-.771,cos*.444,.162],[sin*span,-1.102-Math.abs(sin)*.023,cos*.52,.155]];
        tools.silk(body,red?'秦始皇 · 朱裳':'秦始皇 · 玄裳',path,{
          tint:red?0x852a20:0x2a2126,trim:red?0x8f5238:0x4a3638,
          lining:0x33232a,phase:i*.64,flex:.57,across:[cos,0,-sin],style:'woven',
        });
      }
      for(const s of sides)tools.silk(body,'秦始皇 · 後幅 '+s,mirror(s,[[.212,.748,-.169,.137],
        [.292,.388,-.273,.181],[.368,-.184,-.369,.188],[.463,-.779,-.554,.141],[.482,-1.116,-.651,.084]]),
      {tint:0x582320,trim:0x8a502d,lining:0x261d25,phase:s*.8,flex:.73,across:[.91,0,s*.31],style:'woven'});
      for(const {shoulder,side:s} of limbs)tools.silk(shoulder,'秦始皇 · 垂袖 '+s,
        mirror(s,[[.082,-.035,.001,.081],[.172,-.165,-.066,.118],[.215,-.303,-.160,.12],[.218,-.433,-.219,.071]]),
        {tint:0x5b2728,trim:0x84583e,lining:0x30262a,phase:s*.62,flex:.86,across:[.58,0,s*.82],style:'woven'});
      return true;
    },
    animate({beat,wind,strike,stage,attackPattern}){
      const spell=['summon','prison','fissure'].includes(attackPattern);
      melee=attackPattern==='cleave'||attackPattern==='sweep';
      blade.rotation.set(2.73-wind*.41-strike*.25,.18+wind*.15,.72+wind*.74);
      const off=limbs[0];
      if(spell){
        off.shoulder.rotation.x=-.26-wind*1.01-strike*.47;
        off.elbow.rotation.x=-.48-wind*.25+strike*.17;
        off.wrist.rotation.z=-.14+wind*.51-strike*.28;
      }
      for(const [i,chain] of chains.entries()){
        chain.rotation.x=Math.sin(beat*.89+i*.17)*.093-wind*.106+strike*.208;
        chain.rotation.z=Math.sin(beat*.63+i*.26)*(.058+stage*.020)+strike*.081;
      }
    },
    finishPose(){
      const weapon=this.weapons.find(item=>item.node===blade);
      if(weapon)weapon.aim=melee;
    },
    blade,
  };
}
