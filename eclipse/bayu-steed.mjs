import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1],mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
export const bayuFinishes={
  bayuPearl:[0xacaca2,.045,.88,'hide'],bayuFur:[0x766c61,.025,.89,'hide'],bayuSoot:[0x45383a,.025,.9,'hide'],
  bayuBlue:[0x535f68,.54,.57,'iron'],bayuGold:[0xad884d,.66,.58,'bronze'],
  bayuSteel:[0xa5aeaa,.67,.55,'iron'],bayuRed:[0x793737,.10,.83,'cloth'],
  bayuShadow:[0x3d252a,.11,.84,'hide'],bayuLinen:[0xada082,.08,.85,'cloth'],
};

function kit(k,mobile){
  const joint=(parent,name,x,y,z)=>{
    const j=k.bone(parent,x,y,z);
    j.name=name;
    return j;
  };
  const mass=(j,m,p,seed,section=2.45,fur=false)=>k.geometry(j,m,
    sculptVolume(p,{rings:mobile?11:17,sides:mobile?9:14,seed,ridge:.15,section,fur}));
  const plate=(j,m,p,d=.043)=>k.sculpt.plate(j,m,p,d,d*.33);
  const wire=(j,m,p)=>k.sculpt.sweep(j,m,p,{steps:mobile?8:13,sides:mobile?5:7,ridge:.15});
  const leaf=(j,m,p,w,s)=>k.geometry(j,m,featherVane(...p,w,s,mobile?7:12));
  return {joint,mass,plate,wire,leaf};
}

export function buildBayuSteed(k,mobile){
  const t=kit(k,mobile),{joint,mass,plate,wire,leaf}=t;
  const body=joint(k.root,'Bayu white steed thorax',0,.89,-.02);
  const seat=joint(body,'Bayu fitted red saddle',0,.407,-.219);
  const neck=joint(body,'Bayu steed flexing neck',0,.244,.403),head=joint(neck,'Bayu steed fitted ivory head',0,.265,.398);
  const muzzle=joint(head,'Bayu steed lower jaw',0,-.162,.148),tail=joint(body,'Bayu braided steed tail',0,.228,-.818);
  mass(body,'bayuPearl',[[0,.069,-.871,.173,.184],[0,.087,-.676,.32,.28],[0,.065,-.328,.327,.283],
    [.009,.073,.116,.352,.309],[0,.082,.413,.313,.32],[0,.115,.648,.173,.213]],24.63,2.43,true);
  mass(neck,'bayuPearl',[[0,-.164,-.136,.215,.168],[0,-.067,-.017,.238,.173],[0,.058,.106,.217,.154],
    [0,.191,.248,.158,.132],[0,.284,.379,.128,.115]],12.67,2.45,true);
  mass(head,'bayuPearl',[[0,.127,-.065,.123,.10],[0,.089,-.04,.147,.111],[0,-.013,.098,.14,.106],
    [0,-.099,.26,.103,.076],[0,-.131,.367,.111,.076],[0,-.131,.415,.073,.06]],7.61,2.56,true);
  mass(muzzle,'bayuFur',[[0,-.053,-.035,.068,.067],[0,-.071,.056,.089,.072],
    [0,-.043,.162,.098,.063],[0,-.014,.25,.073,.041]],27.63);
  mass(tail,'bayuSoot',[[0,.027,.041,.054,.059],[.057,-.022,-.139,.08,.075],[.155,-.167,-.256,.091,.078],
    [.246,-.373,-.356,.075,.056],[.258,-.501,-.392,.031,.031]],52.4,2.45,true);
  const brow=[[0,.166,.031],[.084,.139,.094],[.102,.064,.187],[.08,-.041,.292],
    [0,-.028,.336],[-.077,-.051,.297],[-.105,.059,.176],[-.084,.148,.082]];
  plate(head,'bayuBlue',brow,.048);
  wire(head,'bayuGold',brow.map(([x,y,z],i)=>[x,y+.016,z+.031,i%3===1?.013:.007]));
  k.mesh(head,'gem','steel',0,.036,.261,.046,.059,.026);
  const pads=[],legs=[];
  for(const side of sides){
    const f=p=>mirror(side,p);
    const ear=joint(head,'Bayu folded mount ear '+side,side*.112,.133,-.071);
    mass(ear,'bayuPearl',f([[.011,.009,-.019,.037,.031],[.03,.073,-.027,.049,.031],
      [.054,.149,-.048,.032,.025],[.053,.203,-.07,.006,.005]]),15+side);
    wire(ear,'bayuFur',f([[.014,.023,.016,.005],[.031,.083,.007,.015],
      [.056,.153,-.025,.011],[.053,.193,-.051,.002]]));
    const curl=f([[.094,.115,.057,.036,.034],[.17,.165,.093,.053,.043],[.236,.183,.163,.045,.039],
      [.251,.151,.269,.04,.038],[.229,.121,.344,.032,.027],[.197,.084,.402,.012,.012]]);
    mass(head,'bayuGold',curl,26.38+side,2.44);
    wire(head,'bayuSteel',curl.map(([x,y,z,r],i)=>[x,y+.021,z+.016,r*.42]));
    const eye=f([[.087,.041,.176],[.134,.062,.139],[.151,.045,.107],[.139,.017,.136],[.092,.013,.185]]);
    plate(head,'bayuSoot',eye,.021);
    k.mesh(head,'round','glow',side*.113,.032,.181,.023,.012,.012,0,side*.6,side*.17);
    const cheek=f([[.089,.036,.227],[.137,.022,.107],[.157,-.048,.044],[.123,-.137,.082],
      [.096,-.153,.253],[.096,-.112,.329],[.076,-.053,.32]]);
    plate(head,'bayuPearl',cheek,.036);
    wire(head,'bayuGold',cheek.slice(0,5).map(([x,y,z],i)=>[x,y-.006,z+.016,[.003,.012,.014,.008,.004][i]]));
    wire(head,'bayuSoot',f([[.043,-.116,.407,.006],[.071,-.096,.4,.015],
      [.095,-.089,.373,.014],[.101,-.098,.354,.004]]));
    for(let i=0;i<(mobile?5:8);i++){
      const u=i/(mobile?4:7),path=f([[.016+u*.078,.242-u*.15,.27-u*.28],[.095+u*.073,.191-u*.19,.118-u*.31],
        [.16+u*.025,-.023-u*.107,.028-u*.39]]);
      leaf(neck,i%2?'bayuPearl':'bayuFur',path,.062,61+i);
    }
    const saddle=joint(seat,'Bayu pendant saddle blanket '+side,side*.089,-.02,-.028);
    const cape=f([[.023,.045,.29],[.2,.029,.331],[.316,-.088,.215],[.43,-.204,.054],
      [.366,-.346,-.221],[.236,-.309,-.392],[.121,-.169,-.433],[.041,-.042,-.333]]);
    plate(saddle,'bayuRed',cape,.043);
    wire(saddle,'bayuGold',cape.map(([x,y,z],i)=>[x,y-.012,z+.015,i%3===0?.01:.015]));
    for(let i=0;i<4;i++){
      const z=.222-i*.145,x=.342-i*.026,y=-.115-i*.037;
      const brand=f([[x-.056,y+.046,z+.049],[x+.015,y+.061,z+.019],[x+.036,y+.006,z-.04],
        [x+.006,y-.038,z-.06],[x-.042,y-.021,z+.001]]);
      plate(saddle,i%2?'bayuGold':'bayuBlue',brand,.029);
      wire(saddle,'bayuLinen',brand.slice(1,5).map(([x,y,z],i)=>[x+side*.016,y-.011,z+.01,[.004,.011,.009,.003][i]]));
    }
    const flank=f([[.03,.356,.326],[.195,.306,.389],[.371,.195,.366],[.392,.018,.27],
      [.28,-.121,.235],[.081,-.117,.334],[.025,.048,.422]]);
    plate(body,'bayuPearl',flank,.052);
    wire(body,'bayuGold',flank.slice(1,6).map(([x,y,z],i)=>[x+side*.011,y-.009,z+.023,[.004,.013,.017,.01,.004][i]]));
    pads.push({saddle,ear,side});
    for(const front of [true,false]){
      const s=side*(front?.243:.261),h=front?.367:.392,l=front?.391:.368;
      const thigh=joint(body,'Bayu steed hip '+side+' '+front,s,.012,front?.437:-.581);
      const knee=joint(thigh,'Bayu steed knee '+side+' '+front,side*.021,-h,front?.065:-.077);
      const hoof=joint(knee,'Bayu steed cloven hoof '+side+' '+front,side*.015,-l,front?.022:.049);
      mass(thigh,'bayuPearl',f([[0,.123,-.064,.11,.133],[.034,.039,-.009,.136,.133],
        [.051,-h*.39,.029,.121,.092],[.038,-h*.76,.059,.08,.071],[.024,-h,.064,.055,.06]]),11.9+side,2.40,true);
      mass(knee,'bayuPearl',f([[0,.064,.01,.057,.06],[.017,-l*.25,.012,.073,.074],
        [.028,-l*.69,-.009,.061,.069],[.02,-l,.014,.051,.057]]),10.8+side,2.48,true);
      const pad=f([[-.055,.054,.049],[.056,.08,.074],[.096,-.026,.096],[.078,-.143,.112],
        [.031,-.212,.116],[-.04,-.127,.099]]);
      plate(knee,'bayuBlue',pad,.043);
      wire(knee,'bayuGold',pad.slice(1,5).map(([x,y,z],i)=>[x,y+.01,z+.02,[.005,.011,.01,.003][i]]));
      mass(hoof,'bayuSoot',[[0,.053,-.028,.056,.043],[.008,.008,.011,.062,.067],[.016,-.041,.103,.058,.07],
        [.016,-.075,.155,.035,.046]],21.07+side,3.10);
      wire(hoof,'bayuFur',[[0,-.039,.118,.007],[.005,-.066,.149,.008],[.009,-.073,.154,.003]]);
      legs.push({thigh,knee,hoof,side,front});
    }
  }
  return {body,seat,pose({beat,wind,strike,travel,step,fall}){
    body.rotation.x=wind*.114-strike*.248+Math.sin(step*2)*travel*.076+fall*.089;
    body.rotation.z=Math.sin(step)*travel*.055+(wind-strike)*.061;
    neck.rotation.x=wind*.22-strike*.269+Math.sin(beat*.79)*.039;
    neck.rotation.y=Math.sin(beat*.57)*.073*(1-wind)-strike*.16;
    head.rotation.x=-wind*.068+strike*.163;
    muzzle.rotation.x=wind*.068+strike*.205;
    tail.rotation.set(Math.sin(beat*.60)*.08+travel*.27+strike*.34,Math.sin(beat*.72)*.195+wind*.19,-strike*.14);
    for(const {saddle,ear,side} of pads){
      saddle.rotation.z=side*(wind*.12+strike*.09+Math.sin(step+side)*travel*.16);
      ear.rotation.y=side*(.10+wind*.14-strike*.16);
    }
    for(const {thigh,knee,hoof,side,front} of legs){
      const w=Math.sin(step+side*1.21+(front?.14:2.71))*travel;
      thigh.rotation.x=w*.62-wind*(front?.32:.14)+strike*(front?.479:-.225);
      knee.rotation.x=Math.min(0,w)*.63+wind*.06+strike*(front?.13:-.29);
      hoof.rotation.x=Math.max(0,w)*.38+strike*.12;
    }
  }};
}

export function fitBayuRider(k,rig,mobile){
  const {joint,mass,plate,wire,leaf}=kit(k,mobile),{body,head,limbs}=rig;
  const silks=[],scales=[];
  const crest=joint(head,'Bayu gold wire crown',0,.177,-.052);
  mass(crest,'bayuBlue',[[0,-.016,-.009,.109,.107],[0,.051,-.015,.145,.113],
    [.006,.134,-.043,.105,.084],[.006,.186,-.066,.052,.061]],20.3);
  for(const {shoulder,elbow,wrist,leg,knee,side} of limbs){
    const f=p=>mirror(side,p);
    leg.position.x=side*.295;
    leg.rotation.z=side*.39;
    knee.position.z+=.116;
    const relief=f([[.002,.072,.096],[.081,.097,.078],[.146,.095,.016],[.163,.049,-.077],
      [.164,-.005,-.104],[.109,-.029,-.107],[.07,.012,.035]]);
    plate(crest,'bayuGold',relief,.025);
    wire(crest,'bayuSteel',relief.slice(0,5).map(([x,y,z],i)=>[x,y+.017,z+.018,[.003,.009,.010,.009,.003][i]]));
    for(let i=0;i<4;i++){
      const u=i*.033;
      leaf(head,i%2?'black':'bayuShadow',f([[.104+u,.15-u*.36,-.064],[.154+u,.019-u*.42,-.136],
        [.159+u,-.268-u*.6,-.21]]),.041+i*.004,13+i);
    }
    const chest=f([[.023,.646,.199],[.123,.657,.19],[.241,.562,.141],[.23,.444,.161],
      [.187,.305,.241],[.079,.288,.275],[.045,.493,.232]]);
    plate(body,side===1?'bayuRed':'bayuShadow',chest,.04);
    wire(body,'bayuGold',chest.slice(0,5).map(([x,y,z],i)=>[x,y+.011,z+.021,[.004,.017,.014,.01,.004][i]]));
    const back=f([[.031,.639,-.138],[.138,.624,-.203],[.253,.491,-.232],[.225,.301,-.286],
      [.104,.249,-.302],[.045,.423,-.252]]);
    plate(body,'bayuShadow',back,.037);
    wire(body,'bayuGold',back.slice(1,5).map(([x,y,z],i)=>[x,y-.014,z-.017,[.005,.012,.009,.003][i]]));
    const shield=joint(shoulder,'Bayu shoulder lame '+side,side*.051,.022,-.026);
    mass(shoulder,'skin',f([[0,.047,-.02,.08,.085],[.047,-.035,-.019,.117,.102],
      [.083,-.16,.019,.102,.075],[.125,-.31,.027,.065,.062]]),21+side);
    for(let row=0;row<3;row++){
      const y=.094-.084*row,w=.234-row*.025;
      const panel=f([[-.061,y+.047,.084],[w*.44,y+.076,.079],[w*.94,y+.035,.009],[w,y-.061,-.059],
        [w*.55,y-.111,-.137],[.011,y-.086,-.098],[-.05,y-.028,.017]]);
      plate(shield,row%2?'bayuGold':'bayuBlue',panel,.045);
      wire(shield,'bayuGold',panel.slice(1,6).map(([x,y,z],i)=>[x,y+.012,z-.015,[.005,.014,.014,.008,.003][i]]));
    }
    scales.push({shield,side});
    mass(elbow,'bayuShadow',f([[0,.059,-.014,.063,.065],[.04,-.056,.036,.088,.08],
      [.046,-.168,.08,.084,.076],[.024,-.312,.102,.056,.052]]),23.8);
    const cuff=f([[-.031,-.023,.069],[.062,-.03,.128],[.113,-.091,.113],[.113,-.227,.139],
      [.05,-.267,.178],[-.048,-.212,.131],[-.059,-.097,.113]]);
    plate(elbow,'bayuGold',cuff,.044);
    wire(elbow,'bayuSteel',cuff.slice(1,6).map(([x,y,z],i)=>[x,y+.01,z+.018,[.005,.015,.014,.011,.004][i]]));
    mass(wrist,'skin',[[0,.041,.002,.04,.041],[.014,-.01,.05,.076,.052],[.009,-.082,.105,.048,.048]],7.18+side);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.031;
      wire(wrist,'skin',[[x,-.012,.051,.013],[x+.008,-.052,.093,.018],[x+.014,-.085,.124,.005]]);
    }
    mass(leg,'bayuRed',f([[0,.078,-.028,.114,.107],[.043,-.067,-.009,.133,.123],
      [.064,-.204,.018,.111,.097],[.029,-.396,.021,.076,.073]]),16.2+side);
    mass(knee,'bayuShadow',f([[0,.036,.003,.069,.068],[.038,-.066,.101,.104,.082],
      [.048,-.229,.125,.077,.064],[.054,-.34,.194,.057,.048]]),27.39+side);
    const greave=f([[-.052,-.037,.104],[.043,.014,.134],[.099,-.036,.13],[.122,-.134,.148],
      [.083,-.269,.191],[.015,-.304,.201],[-.034,-.158,.18]]);
    plate(knee,'bayuBlue',greave,.039);
    wire(knee,'bayuGold',greave.slice(1,6).map(([x,y,z],i)=>[x,y+.013,z+.021,[.004,.012,.013,.009,.003][i]]));
    silks.push({parent:body,name:'伐由 · 騎裝雙裾 '+side,path:f([[.159,.07,.172,.095],[.233,-.204,.21,.109],
      [.313,-.442,.235,.096],[.363,-.581,.267,.061]]),tint:0x7d483b,trim:0xbe955d,lining:0x51303b,phase:side*.82,flex:.83,
      across:[.81,0,side*.54]});
  }
  const lance=joint(limbs[1].wrist,'Bayu twin-flanged lance',.014,-.052,.122);
  mass(lance,'bayuShadow',[[0,-.477,0,.027,.028],[0,-.253,.009,.033,.039],
    [.021,.144,.013,.031,.032],[.048,.6,.026,.027,.025],[.062,.943,.031,.024,.025]],7.5);
  const shell=[[.046,.835,.026],[.133,.993,.046],[.12,1.135,.054],[.075,1.437,-.022],
    [.002,1.23,.066],[-.054,1.08,.052],[-.041,.942,.028]];
  plate(lance,'bayuSteel',shell,.057);
  wire(lance,'bayuGold',shell.slice(0,4).map(([x,y,z],i)=>[x,y,z+.026,[.006,.016,.013,.003][i]]));
  for(const side of sides){
    const f=p=>mirror(side,p);
    wire(lance,'bayuGold',f([[.021,.821,.048,.011],[.105,.875,.069,.025],
      [.159,.97,.06,.02],[.147,1.041,.035,.003]]));
  }
  markEnemyWeapon(lance,[.075,1.437,-.022],{from:[0,-.476,.003],width:.142});
  return {silks,pose({beat,wind,strike,travel,step}){
    for(const {leg,knee,side} of limbs){
      leg.rotation.set(.37+travel*Math.sin(step+side)*.12,side*.18,side*(.48+wind*.12));
      knee.rotation.x=-.79-travel*.15+strike*.15;
    }
    lance.rotation.set(.44+wind*.56-strike*.83,.17+wind*.26,-.69-wind*.32+strike*.61);
    for(const {shield,side} of scales)shield.rotation.z=side*(wind*.123-strike*.13+Math.sin(beat*.71)*.036);
  }};
}
