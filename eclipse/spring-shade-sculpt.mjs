import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

export const springShadeFinishes={
  springSkin:[0xb69a6e,.045,.67,'hide'],springLip:[0x80554b,.046,.71,'hide'],
  springHair:[0x62502d,.13,.68,'hide'],springTeal:[0x486d61,.49,.50,'bronze'],
  springGold:[0xa98a52,.64,.45,'bronze'],springDark:[0x1b3d37,.11,.78,'hide'],
};

export function carveSpringShade(k,entry,mobile){
  const {root,bone,mesh,sculpt,geometry}=k;
  const body=bone(root,0,1.03,0),head=bone(body,.033,.88,.091);
  const cloak=bone(body,0,.532,-.233),tiara=bone(head,0,.146,-.014);
  const arms=[],legs=[],limbs=[],hocks=[],leaves=[];
  const shape=(p,m,sections,seed=0)=>geometry(p,m,sculptVolume(sections,{
    sides:mobile?12:17,rings:mobile?15:21,section:2.38,ridge:.13,seed,
  }));
  const line=(p,m,path,steps=12)=>sculpt.sweep(p,m,path,{steps,sides:7,ridge:.19});
  const panel=(p,m,path,t=.039)=>sculpt.plate(p,m,path,t,.014);
  shape(body,'springDark',[[0,-.29,-.041,.201,.142],[0,-.081,-.028,.258,.188],[0,.16,-.011,.26,.207],
    [0,.393,.02,.314,.24],[0,.622,-.008,.29,.193],[.027,.788,.015,.105,.112]]);
  shape(head,'springSkin',[[0,-.16,.064,.090,.083],[0,-.106,.074,.132,.106],[0,.022,.041,.162,.130],
    [0,.148,-.015,.151,.141],[0,.243,-.042,.103,.106]]);
  shape(head,'springSkin',[[0,-.051,.173,.039,.032],[0,-.006,.195,.039,.041],[0,.048,.164,.029,.031]]);
  shape(tiara,'springHair',[[0,-.08,-.068,.155,.086],[0,.012,-.047,.177,.147],[0,.092,-.05,.161,.141],
    [-.025,.159,-.077,.134,.106],[-.03,.219,-.091,.070,.067]]);
  line(head,'springLip',[[-.061,-.092,.156,.006],[0,-.082,.176,.010],[.048,-.093,.161,.005]],8);
  for(const side of [-1,1]){
    const x=v=>side*v;
    const p=data=>data.map(([a,...rest])=>[x(a),...rest]);
    line(head,'springDark',p([[.035,.045,.168,.008],[.078,.058,.163,.015],[.123,.060,.137,.011],[.141,.051,.111,.004]]),9);
    mesh(head,'gem','glow',x(.080),.050,.173,.025,.012,.009,0,x(.19));
    line(tiara,'springHair',p([[.022,.158,.067,.037],[.085,.110,.127,.067],[.132,.02,.136,.061],
      [.143,-.125,.093,.049],[.144,-.218,.065,.005]]));
    line(tiara,'springGold',p([[.031,.019,.149,.010],[.089,.042,.142,.018],[.144,.071,.085,.019],
      [.159,.097,-.052,.015],[.101,.121,-.148,.004]]));
    const clasp=bone(head,x(.153),.041,-.014);
    panel(clasp,'springGold',p([[-.019,.047,.033],[.054,.074,.032],[.089,.03,.01],[.068,-.034,.027],
      [.022,-.058,.052],[-.027,-.007,.050]]),.025);
    for(let row=0;row<4;row++){
      const y=.528-row*.135,z=.173+row*.017,w=.323-row*.028;
      const trim=p([[.021,y+.123,z+.091],[.166,y+.154,z+.027],[w,y+.066,z-.025],
        [w*.91,y-.063,z-.039],[.134,y-.077,z+.077],[.018,y-.048,z+.112]]);
      panel(body,row%2?'springTeal':'springDark',trim,.034);
      line(body,'springGold',trim.slice(1,6).map(([a,h,d],i)=>[a,h+.011,d+.015,[.011,.018,.013,.016,.004][i]]));
    }
    const upper=bone(body,x(.284),.539,.016),elbow=bone(upper,x(.058),-.387,.062);
    const hand=bone(elbow,x(.034),-.316,.081);
    arms.push(upper);limbs.push({forearm:elbow,side});
    shape(upper,'springTeal',p([[.028,-.414,.076,.085,.093],[.044,-.225,.013,.13,.141],
      [.032,-.026,-.011,.151,.146],[0,.111,-.04,.106,.111]]),side);
    shape(elbow,'springSkin',p([[.03,-.334,.083,.067,.073],[.057,-.201,.059,.091,.074],
      [.047,-.048,.024,.105,.094],[.012,.053,-.003,.087,.083]]),3*side);
    shape(hand,'springGold',[[0,-.092,.046,.063,.065],[0,-.018,.035,.089,.075],[0,.068,.011,.067,.065]]);
    for(let i=0;i<3;i++){
      const y=.099-i*.076;
      panel(upper,i%2?'springTeal':'springGold',p([[-.058,y+.03,.099],[.061,y+.104,-.016],[.177,y+.049,-.117],
        [.209,y-.041,-.176],[.165,y-.102,-.097],[.045,y-.101,.083]]),.032);
    }
    const leg=bone(root,x(.206),.901,.044),knee=bone(leg,x(.047),-.417,.03);
    legs.push(leg);hocks.push({knee,side});
    shape(leg,'springDark',p([[.03,-.423,0,.091,.104],[.04,-.229,-.012,.142,.132],
      [0,-.039,0,.164,.144],[.017,.11,-.03,.127,.116]]),6.4*side);
    shape(knee,'springTeal',p([[.027,-.409,.137,.098,.140],[.017,-.298,.063,.081,.086],
      [.012,-.117,.041,.110,.105],[.023,.025,.045,.107,.100]]),7.7*side);
    for(let i=0;i<4;i++){
      const y=-.06-i*.089;
      line(knee,i===3?'ivory':'springGold',p([[-.075,y+.012,.110,.013],[.003,y-.031,.168,.017],
        [.075,y-.006,.129,.015],[.099,y+.055,.047,.005]]),9);
    }
    const shoots=bone(cloak,x(.194),.13,-.01);
    shoots.name='句芒 · 青枝肩披';
    for(let i=0;i<4;i++){
      const a=.04+i*.058;
      const points=p([[a,.092,-.045],[a+.121,-.052,-.171],[a+.229,-.236-i*.077,-.318-i*.027]]);
      geometry(shoots,i%2?'springTeal':'springDark',featherVane(...points,.10+i*.009,5+i,mobile?8:12));
      line(shoots,'springGold',points.map(([x,y,z],j)=>[x+.002,y+.012,z+.029,[.012,.016,.002][j]]),8);
    }
    leaves.push({shoots,side});
    if(side===1){
      const blade=bone(hand,.007,-.039,.083);
      blade.name='句芒 · 青芽長刀';
      markEnemyWeapon(blade,[.48,1.16,-.017],{width:.19});
      line(blade,'springDark',[[0,-.262,0,.045],[0,-.036,.002,.054],[.034,.115,.007,.055],[.053,.227,.016,.047]]);
      const cutting=[[.02,.216,.027],[.165,.245,.024],[.217,.434,.017],[.262,.644,.012],
        [.368,.895,.02],[.48,1.16,-.017],[.273,1.043,-.010],[.161,.854,.003],[.055,.484,.012],[-.029,.304,.006]];
      panel(blade,'springTeal',cutting,.067);
      line(blade,'ivory',cutting.slice(4).map(([x,y,z],j)=>[x,y,z+.034,[.022,.009,.02,.025,.026,.012][j]]),16);
      line(blade,'springGold',[[.029,.24,.061,.026],[.097,.409,.054,.024],[.18,.652,.049,.019],
        [.272,.879,.049,.017],[.432,1.101,.03,.006]],17);
    }
  }
  return {body,head,arms,legs,limbs,crest:bone(root,0,0,0),sourceSculpt:true,pattern:'duel',catalogueSculpt:entry.id,
    polishEnergy:{tint:0x82dfc0,shape:'ribbons',anchor:body,span:[.79,.69,.68]},
    sourceDress(tools){
      for(const side of [-1,1]){
        const s=p=>p.map(([x,...tail])=>[x*side,...tail]);
        tools.silk(cloak,'句芒 · 綠漆長披',s([[.101,.202,-.069,.069],[.21,-.031,-.233,.171],
          [.322,-.304,-.366,.207],[.426,-.627,-.49,.183],[.43,-1.07,-.66,.048]]),
          {tint:0x2c523e,trim:0x8ea369,lining:0x4e4d4c,style:'woven',phase:side*.68,flex:1.4});
        tools.silk(body,'句芒 · 銅扣窄裙',s([[.132,.040,.176,.099],[.171,-.158,.236,.118],
          [.184,-.407,.261,.11],[.263,-.619,.27,.096],[.275,-.755,.32,.018]]),
          {tint:0x2f493e,trim:0xb79b58,lining:0x2b3d47,style:'woven',phase:side*.91,flex:1.19});
      }
      return true;
    },
    cataloguePose({beat,step,wind,strike,travel,fall}){
      tiara.rotation.z=Math.sin(beat*.81)*.078+strike*.101;
      cloak.rotation.x=travel*.29+Math.sin(beat*.69)*.059+wind*.09-strike*.18;
      for(const {knee,side} of hocks)knee.rotation.x=Math.max(0,Math.sin(step+side*Math.PI*.5))*travel*.51+strike*.15+fall*.23;
      for(const {shoots,side} of leaves)shoots.rotation.z=side*(Math.sin(beat*.92+side)*.073+wind*.17-strike*.22);
    },
  };
}
