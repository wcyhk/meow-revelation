import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);

export const wootaiFinishes={
  wBlack:[0x322b28,.34,.69,'hide'],wBronze:[0x78704c,.68,.52,'bronze'],
  wGold:[0xab833f,.70,.51,'bronze'],wInset:[0x54423a,.56,.63,'bronze'],
  wRed:[0x73302a,.12,.77,'hide'],wIron:[0x5c6e70,.76,.49,'iron'],
  wSteel:[0xadbdba,.75,.52,'iron'],wWood:[0x392b24,.13,.81,'hide'],
};
export const xuanFinishes={
  xCloak:[0x232326,.07,.89,'cloth'],xPleat:[0x303034,.05,.84,'cloth'],
  xBraid:[0x70392e,.15,.77,'cloth'],xCopper:[0x845b36,.70,.58,'bronze'],
  xGold:[0xb79859,.72,.53,'bronze'],xSkin:[0x927258,.02,.82,'hide'],
  xCheek:[0x776150,.02,.84,'hide'],xAsh:[0x95948a,.06,.78,'hide'],
  xHair:[0xb7b6a4,.03,.77,'hide'],xShadow:[0x57564f,.07,.86,'hide'],
  xSole:[0x362926,.17,.8,'hide'],xEmber:[0x9e4f36,.40,.65,'gem'],
};

function named(k,parent,name,x,y,z){
  const joint=k.bone(parent,x,y,z);
  joint.name=name;
  return joint;
}

function tools(k,mobile){
  return {
    shell(joint,material,path,seed,section=2.38,fur=false){
      k.geometry(joint,material,sculptVolume(path,{
        rings:mobile?11:18,sides:mobile?9:14,section,seed,ridge:.18,fur,
      }));
    },
    rib(joint,material,path){
      k.sculpt.sweep(joint,material,path,{steps:mobile?8:13,sides:mobile?5:7,ridge:.135});
    },
    tile(joint,material,path,depth=.041){
      k.sculpt.plate(joint,material,path,depth,depth*.30);
    },
    leaf(joint,material,path,width,seed){
      k.geometry(joint,material,featherVane(...path,width,seed,mobile?7:12));
    },
  };
}

function joints(k,body,prefix,{shoulder,elbow,wrist,hip,knee,foot}){
  return sides.map(side=>{
    const upper=named(k,body,prefix+' shoulder '+side,side*shoulder[0],shoulder[1],shoulder[2]);
    const lower=named(k,upper,prefix+' elbow '+side,side*elbow[0],elbow[1],elbow[2]);
    const palm=named(k,lower,prefix+' palm '+side,side*wrist[0],wrist[1],wrist[2]);
    const thigh=named(k,body,prefix+' hip '+side,side*hip[0],hip[1],hip[2]);
    const shin=named(k,thigh,prefix+' knee '+side,side*knee[0],knee[1],knee[2]);
    const heel=named(k,shin,prefix+' heel '+side,side*foot[0],foot[1],foot[2]);
    return {upper,lower,palm,thigh,shin,heel,side};
  });
}

function wootaiBlade(k,t,palm,side){
  const blade=named(k,palm,'Wootai forged crescent '+side,.006,-.05,.109);
  const f=path=>mirror(side,path);
  const {shell,rib,tile}=t;
  shell(blade,'wWood',[[0,-.38,0,.025,.032],[0,-.273,0,.037,.043],[0,-.077,.008,.033,.034],
    [.004,.108,.008,.035,.037],[.013,.208,.019,.043,.043]],21.4+side);
  for(let i=0;i<7;i++){
    const y=-.292+i*.069;
    rib(blade,i%3?'wInset':'wGold',[[-.038,y-.014,.014,.008],[-.016,y,.043,.010],
      [.022,y+.017,.049,.009],[.039,y+.034,.013,.003]]);
  }
  shell(blade,'wBronze',[[0,-.48,.01,.013,.021],[0,-.428,.012,.049,.052],
    [0,-.389,.014,.056,.049],[0,-.33,.006,.028,.026]],3.81);
  const profile=[[-.028,.17,.016],[.028,.326,.014],[.137,.474,.018],[.241,.718,.029],
    [.301,.972,.035],[.291,1.223,.014],[.236,1.479,-.018],[.177,1.573,-.034],
    [.185,1.361,.017],[.173,1.119,.054],[.112,.907,.074],[.028,.749,.063],[-.028,.559,.043],
    [-.047,.393,.025],[-.07,.217,.011]];
  tile(blade,'wIron',f(profile),.047);
  for(const front of sides){
    const outer=profile.slice(2,8);
    const polish=outer.map(([x,y,z])=>[x,y,z+front*.019]);
    const inset=outer.map(([x,y,z],i)=>[x-[.021,.064,.056,.038,.024,.005][i],y,z+front*[.028,.036,.038,.035,.026,.019][i]]);
    tile(blade,'wSteel',f([...polish,...inset.reverse()]),.014);
    const fuller=[[.026,.332,.017],[.088,.512,.027],[.159,.742,.039],[.209,.998,.04],[.214,1.226,.021]];
    rib(blade,'wInset',f(fuller.map(([x,y,z],i)=>[x,y,z+front*.03,[.003,.016,.021,.013,.003][i]])));
    const collar=f([[-.068,.108,front*.076],[.073,.115,front*.068],[.157,.199,front*.067],
      [.133,.279,front*.062],[.035,.237,front*.060],[-.071,.207,front*.057]]);
    tile(blade,'wGold',collar,.031);
    rib(blade,'wRed',collar.slice(0,4).map(([x,y,z],i)=>[x,y-.009,z+front*.025,[.004,.014,.014,.003][i]]));
  }
  markEnemyWeapon(blade,[side*.177,1.57,-.034],{from:[0,-.28,.003],width:.121,aim:false});
  return blade;
}

export function forgeWootai(k,entry,mobile){
  const t=tools(k,mobile),{shell,rib,tile}=t;
  const body=named(k,k.root,'Wootai curved padded cuirass',0,1.19,0);
  const head=named(k,body,'Wootai dented open helm',0,.91,.082);
  const {jaw}=carvedFace(k,head,{style:'soldier',width:.291,finish:'skin',brow:'black',detailed:!mobile});
  const limbs=joints(k,body,'Wootai',{shoulder:[.365,.576,-.028],elbow:[.065,-.347,.023],
    wrist:[.031,-.321,.043],hip:[.124,-.302,-.016],knee:[.045,-.435,.043],foot:[.014,-.392,.027]});
  const armour=[],blades=[],cloth=[];
  shell(body,'wBlack',[[0,-.39,-.04,.24,.184],[0,-.186,-.009,.279,.219],[0,.135,-.01,.335,.236],
    [0,.371,-.012,.394,.259],[0,.626,-.034,.392,.253],[0,.795,-.043,.266,.192],
    [0,.861,.02,.115,.098]],7.41);
  shell(head,'wInset',[[0,-.11,-.148,.124,.079],[0,.015,-.145,.159,.096],[0,.185,-.113,.177,.109],
    [0,.279,-.091,.126,.11],[0,.312,-.119,.044,.055]],10.21);
  for(const side of sides){
    const f=path=>mirror(side,path);
    const crown=f([[.011,.202,.125],[.097,.239,.109],[.171,.213,.044],[.201,.136,-.036],
      [.168,.102,.098],[.09,.13,.144],[.014,.12,.154]]);
    tile(head,'wBronze',crown,.047);
    rib(head,'wGold',crown.slice(0,6).map(([x,y,z],i)=>[x,y+.014,z+.026,[.004,.013,.017,.015,.01,.003][i]]));
    const cheek=f([[.124,.113,.131],[.172,.147,.064],[.208,.107,-.092],[.198,-.107,-.128],
      [.167,-.147,-.03],[.139,-.074,.114]]);
    tile(head,'wIron',cheek,.042);
    rib(head,'wGold',cheek.slice(1,5).map(([x,y,z],i)=>[x,y-.015,z-.017,[.005,.012,.009,.003][i]]));
    rib(head,'wRed',f([[.034,.246,.046,.007],[.112,.301,-.061,.015],[.141,.273,-.156,.013],[.14,.175,-.207,.003]]));
    for(let row=0;row<5;row++){
      const y=.604-row*.13,w=.37-row*.025;
      const panel=f([[.012,y+.023,.278],[.128,y+.058,.289],[w*.71,y+.092,.253],[w,y+.055,.183],
        [w*1.03,y-.018,.117],[w*.85,y-.053,.183],[w*.56,y-.057,.266],[.055,y-.06,.312]]);
      tile(body,row%2?'wInset':'wBronze',panel,.048);
      rib(body,'wGold',panel.slice(0,6).map(([x,h,z],i)=>[x,h+.009,z+.022,[.004,.012,.017,.014,.008,.004][i]]));
      const back=f([[.036,y+.039,-.256],[w*.43,y+.056,-.307],[w*.79,y+.046,-.273],[w,y-.006,-.201],
        [w*.93,y-.075,-.213],[w*.47,y-.094,-.313],[.067,y-.066,-.293]]);
      tile(body,row%2?'wBlack':'wBronze',back,.044);
      rib(body,'wInset',back.slice(1,6).map(([x,h,z],i)=>[x,h+.01,z-.023,[.005,.013,.014,.009,.003][i]]));
    }
    rib(body,'wRed',f([[.276,.654,-.206,.008],[.191,.518,-.317,.029],[.087,.342,-.349,.038],
      [-.069,.194,-.337,.032],[-.175,.113,-.263,.007]]));
    const shoulder=limbs[side<0?0:1].upper;
    const buckle=named(k,shoulder,'Wootai hinged shoulder lames '+side,side*.034,.023,-.027);
    for(let row=0;row<4;row++){
      const y=.145-row*.089,w=.263-row*.032;
      const lame=f([[-.108,y+.026,.099],[w*.41,y+.068,.103],[w*.94,y+.013,.043],[w,y-.081,-.045],
        [w*.63,y-.122,-.137],[.021,y-.081,-.139],[-.086,y-.021,-.087]]);
      tile(buckle,(row===0&&side===1)?'wRed':row%2?'wBronze':'wInset',lame,.05);
      rib(buckle,'wGold',lame.slice(1,6).map(([x,h,z],i)=>[x,h+.011,z-.017,[.005,.015,.015,.008,.004][i]]));
    }
    armour.push({buckle,side});
    cloth.push({parent:body,name:'於台 · 紅銅裂襟 '+side,
      path:f([[.089,-.114,.281,.095],[.088,-.38,.352,.125],[.101,-.628,.411,.117],[.129,-.887,.398,.070]]),
      tint:0x7f3028,trim:0xb59859,lining:0x422923,phase:side*.62,flex:.7,across:[.98,0,side*.12]});
    cloth.push({parent:body,name:'於台 · 燻皮後裾 '+side,
      path:f([[.14,-.126,-.204,.11],[.16,-.31,-.256,.15],[.17,-.57,-.298,.145],[.23,-.7,-.327,.076]]),
      tint:0x393230,trim:0x806044,lining:0x332626,phase:side*.95,flex:.65,across:[.93,0,side*.28]});
  }
  for(const {upper,lower,palm,thigh,shin,heel,side} of limbs){
    const f=path=>mirror(side,path);
    shell(upper,'wBlack',f([[0,.064,-.023,.097,.103],[.034,-.037,0,.129,.119],[.062,-.183,.009,.102,.105],
      [.066,-.345,.025,.067,.073]]),3.7+side);
    shell(lower,'wBronze',f([[0,.052,.014,.06,.066],[.031,-.075,.028,.089,.09],[.044,-.171,.06,.097,.079],
      [.026,-.307,.062,.06,.06]]),4.74+side);
    for(let row=0;row<3;row++){
      const y=-.039-row*.077;
      const blade=f([[-.05,y+.034,.081],[.064,y+.063,.109],[.102,y+.017,.075],
        [.099,y-.057,.103],[.021,y-.078,.147],[-.051,y-.038,.118]]);
      tile(lower,row%2?'wInset':'wIron',blade,.041);
      rib(lower,'wGold',blade.slice(1,5).map(([x,h,z],i)=>[x,h+.007,z+.024,[.004,.014,.012,.004][i]]));
    }
    shell(palm,'wWood',[[0,.037,.014,.056,.05],[.008,-.03,.058,.077,.063],[.015,-.11,.098,.049,.052]],2.22+side);
    for(let i=0;i<4;i++)rib(palm,'wInset',[[(i-1.5)*.037,-.038,.09,.02],
      [(i-1.5)*.04,-.08,.137,.025],[(i-1.5)*.033,-.119,.139,.004]]);
    blades.push({blade:wootaiBlade(k,t,palm,side),side});
    shell(thigh,'wBlack',f([[0,.061,-.001,.107,.117],[.039,-.111,-.005,.132,.122],
      [.048,-.238,.029,.102,.096],[.045,-.408,.043,.078,.077]]),6.72+side);
    shell(shin,'wInset',f([[0,.039,.034,.084,.091],[.02,-.094,.037,.101,.093],
      [.03,-.273,.047,.072,.067],[.018,-.406,.064,.046,.06]]),3.14+side);
    const shinPlate=f([[-.057,.023,.077],[.027,.074,.134],[.092,.055,.112],[.116,-.11,.099],
      [.094,-.29,.105],[.013,-.37,.105],[-.045,-.254,.098]]);
    tile(shin,'wIron',shinPlate,.051);
    rib(shin,'wGold',shinPlate.slice(1,6).map(([x,y,z],i)=>[x,y+.013,z+.027,[.004,.014,.011,.01,.003][i]]));
    shell(heel,'wBlack',[[0,.07,.015,.052,.049],[.014,.011,.05,.075,.062],
      [.016,-.025,.172,.061,.077],[.021,-.04,.251,.03,.06]],5.79+side);
    tile(heel,'wBronze',f([[-.046,.019,.12],[.053,.025,.119],[.083,-.011,.172],[.041,-.038,.254],
      [-.06,-.039,.205]]),.031);
  }
  const clasp=[[0,.458,.312],[.087,.396,.294],[.063,.294,.321],[.002,.256,.353],[-.068,.313,.326],[-.083,.399,.298]];
  tile(body,'wGold',clasp,.048);
  tile(body,'wInset',clasp.map(([x,y,z])=>[x*.62,.356+(y-.356)*.65,z+.025]),.024);
  k.mesh(body,'gem','wRed',0,.36,.369,.038,.052,.024);
  return {body,head,grounded:true,crest:k.bone(body,0,0,0),pattern:'duel',catalogueSculpt:entry.id,
    wootaiElderSculpt:true,commanderGarments:cloth,polishEnergy:{tint:0xe89575,shape:'ribbons',offset:[0,.58,-.32],
      span:[.69,.57,.36],anchor:body},
    cataloguePose({beat,step,wind,strike,travel,stage}){
      const feint=Math.sin(beat*.58)*.082;
      body.rotation.y=-wind*.31+strike*.53;
      head.rotation.x=wind*.13-strike*.12;
      head.rotation.y=feint+wind*.14-strike*.25;
      jaw.rotation.x=.025+strike*.14;
      for(const {upper,lower,palm,thigh,shin,heel,side} of limbs){
        const gait=Math.sin(step+side*Math.PI*.50)*travel;
        const lead=side===1;
        upper.rotation.set(-.47+gait*.17-(lead?.34:.50)*wind+(lead?.93:.42)*strike,
          side*(.055+wind*.35)-strike*.55,side*(.37+wind*.49-strike*.20)+feint);
        lower.rotation.set(-.73-wind*.29+strike*(lead?.51:.84),side*(.16+wind*.09-strike*.37),0);
        palm.rotation.set(.08-wind*.29+strike*.29,side*.08,-side*(wind*.20+strike*.11));
        thigh.rotation.x=gait*.47+wind*.18-strike*.20;
        shin.rotation.x=-Math.max(0,gait)*.56+wind*.12;
        heel.rotation.x=-gait*.23+strike*.11;
      }
      for(const {blade,side} of blades)blade.rotation.set(1.17+wind*(side===1?.4:.31)-strike*(side===1?.57:.38),
        side*(.062-wind*.21)+strike*.52,side*(-.11+wind*.37-stage*.08)+strike*.37);
      for(const {buckle,side} of armour)buckle.rotation.set(wind*.12-strike*.16,side*.045,side*(wind*.13+strike*.115));
    },
  };
}

export function carveXuanElder(k,entry,mobile){
  const {shell,tile,rib,leaf}=tools(k,mobile);
  const body=named(k,k.root,'Xuan elder folded robe',0,1.19,0);
  const head=named(k,body,'Xuan elder swept white hair',0,.872,.086);
  const {jaw}=carvedFace(k,head,{style:'elder',width:.285,finish:'xSkin',brow:'xAsh',eye:'xEmber',
    lids:'xSkin',dark:'xShadow',detailed:!mobile,tone:.016});
  const limbs=joints(k,body,'Xuan elder',{shoulder:[.268,.592,-.018],elbow:[.077,-.318,.016],
    wrist:[.007,-.308,.078],hip:[.115,-.313,.014],knee:[.043,-.448,-.027],foot:[.018,-.376,.042]});
  const cloth=[],locks=[],fingers=[];
  shell(body,'xCloak',[[0,-.31,-.029,.227,.183],[0,-.145,-.025,.252,.193],
    [0,.125,-.012,.252,.228],[0,.408,-.035,.285,.236],[0,.625,-.024,.305,.212],
    [0,.746,-.018,.229,.162],[0,.816,.007,.116,.117]],12.04);
  shell(head,'xAsh',[[0,-.16,-.144,.104,.06],[.015,-.02,-.135,.150,.096],[.022,.14,-.103,.181,.124],
    [.025,.251,-.047,.169,.135],[.034,.321,-.125,.083,.095],[.032,.322,-.215,.030,.041]],8.2,2.27,true);
  for(const side of sides){
    const f=path=>mirror(side,path);
    const locksJoint=named(k,head,'Xuan elder layered temporal locks '+side,0,0,0);
    for(let i=0;i<(mobile?7:11);i++){
      const u=i/(mobile?6:10),twist=side===1?.037:-.017;
      const path=f([[.027+u*.114+twist,.258-u*.105,.098+u*.03],[.121+u*.065,.288-u*.071,-.039],
        [.126+u*.058,.19-u*.23,-.202-u*.04]]);
      leaf(locksJoint,i%3?'xHair':'xAsh',path,.045+u*.015,32.92+i+side*9);
      rib(locksJoint,i%3?'xHair':'xShadow',path.map(([x,y,z],j)=>[x,y+.019,z-.005,[.006,.017,.002][j]]));
    }
    for(let i=0;i<4;i++){
      const u=i*.027;
      const path=f([[.104+u,.089-u*.52,.092],[.156+u,.025-u*.58,.063],[.164+u,-.145-u*.721,-.107]]);
      leaf(locksJoint,i%3?'xHair':'xAsh',path,.038,53.19+i);
    }
    locks.push({joint:locksJoint,side});
    shell(head,'xHair',f([[.016,-.071,.142,.011,.012],[.052,-.066,.161,.022,.013],
      [.093,-.081,.16,.025,.017],[.139,-.104,.12,.013,.011],[.148,-.146,.107,.005,.005]]),8.47);
    const cheek=f([[.123,-.001,.113],[.145,-.034,.101],[.124,-.056,.125],
      [.104,-.075,.146],[.085,-.106,.142],[.097,-.121,.129]]);
    rib(head,'xCheek',cheek.map(([x,y,z],i)=>[x,y,z,[.002,.007,.009,.006,.004,.002][i]]));
    for(let i=0;i<(mobile?5:8);i++){
      const u=i*.012;
      leaf(jaw,i%3?'xHair':'xAsh',f([[.013+u,.024,.094],[.034+u,-.093,.14],
        [.044+u,-.189+i*.011,.108-u*.26]]),.022,71+i);
    }
    const collar=f([[.025,.734,.142],[.169,.727,.191],[.277,.68,.171],[.336,.625,.077],
      [.32,.591,-.091],[.265,.634,-.18],[.121,.719,-.184],[.038,.742,-.08]]);
    tile(body,'xCloak',collar,.06);
    rib(body,'xBraid',collar.map(([x,y,z],i)=>[x,y-.021,z+(z<0?-.018:.025),[.009,.023,.028,.023,.018,.02,.014,.006][i]]));
    for(let row=0;row<4;row++){
      const y=.562-row*.098,w=.253-row*.022;
      rib(body,row===1?'xBraid':'xPleat',f([[.016,y-.035,.232,.009],[.128,y-.01,.235,.026],[w,y+.052,.15,.021],
        [w*1.03,y+.084,.061,.004]]));
      rib(body,row===0?'xBraid':'xPleat',f([[.014,y-.055,-.263,.006],[.121,y+.004,-.265,.031],[w*.91,y+.049,-.218,.026],
        [w*1.08,y+.086,-.109,.006]]));
    }
    rib(body,'xBraid',f([[.043,.293,.233,.013],[.122,.15,.238,.03],[.196,.023,.234,.029],
      [.228,-.127,.257,.032],[.207,-.289,.292,.039],[.22,-.39,.3,.009]]));
    const drag=side<0?.075:.005;
    cloth.push(
      {parent:body,name:'玄真長老 · 交襟垂帶 '+side,
        path:f([[.036,.131,.262,.074],[.104,-.105,.299,.12],[.148,-.441,.329,.134],[.198,-.889-drag,.381,.101]]),
        tint:side<0?0x352d2e:0x302d30,trim:0x894437,lining:0x44282a,phase:side*.63,flex:.72,across:[.98,0,side*.15]},
      {parent:body,name:'玄真長老 · 紅沿斗篷 '+side,
        path:f([[.133,.668,-.189,.143],[.234,.263,-.26,.18],[.245,-.235,-.312,.223],[.292,-.961-drag,-.42,.176]]),
        tint:0x202024,trim:0x753c34,lining:0x3d2c2d,phase:side*.91,flex:.82,across:[.92,0,side*.27]},
      {parent:body,name:'玄真長老 · 風擺側衣 '+side,
        path:f([[.219,.109,-.073,.111],[.308,-.177,-.122,.145],[.327,-.544,-.156,.176],[.379,-.895-drag,-.211,.10]]),
        tint:0x2d282b,trim:0x703930,lining:0x422b2d,phase:side*1.26,flex:.76,across:[.58,0,side*.81]},
    );
  }
  cloth.push({parent:body,name:'玄真長老 · 摺脊後幅',
    path:[[.022,.664,-.19,.112],[.033,.31,-.283,.147],[.054,-.235,-.345,.163],[.011,-.981,-.401,.111]],
    tint:0x1e1e23,trim:0x522e2b,lining:0x30262a,phase:.27,flex:.81,across:[.98,0,.16]});
  rib(body,'xCopper',[[.26,.002,.117,.012],[.188,-.026,.216,.027],[0,-.046,.268,.036],[-.167,-.027,.226,.025],[-.265,.003,.102,.009]]);
  tile(body,'xGold',[[.001,.036,.246],[.048,-.02,.275],[.035,-.097,.284],[0,-.121,.292],
    [-.045,-.082,.284],[-.046,-.017,.274]],.042);
  for(const {upper,lower,palm,thigh,shin,heel,side} of limbs){
    const f=path=>mirror(side,path);
    shell(upper,'xSkin',f([[0,.064,-.021,.071,.077],[.058,-.044,-.003,.108,.106],
      [.083,-.151,.022,.086,.093],[.081,-.311,.029,.059,.062]]),14.3+side);
    const flesh=f([[.046,-.05,.077,.029,.029],[.084,-.118,.102,.043,.032],[.097,-.173,.097,.041,.031],
      [.086,-.271,.069,.011,.014]]);
    shell(upper,'xSkin',flesh,8.8-side);
    shell(lower,'xSkin',f([[0,.055,.026,.055,.061],[.03,-.059,.044,.085,.08],[.031,-.176,.061,.07,.069],
      [.016,-.306,.079,.045,.052]]),5.46+side);
    for(let row=0;row<4;row++){
      const y=-.009-row*.067;
      const section=f([[-.071,y+.024,.047],[.021,y+.056,.121],[.093,y+.02,.103],
        [.101,y-.039,.056],[.06,y-.074,.018],[-.053,y-.051,.035]]);
      tile(lower,row%3===1?'xCopper':'xGold',section,.041);
      rib(lower,'xCopper',section.slice(0,5).map(([x,h,z],i)=>[x,h+.011,z+.021,[.004,.011,.015,.009,.003][i]]));
    }
    shell(palm,'xSkin',[[0,.045,-.009,.04,.052],[0,.009,.051,.066,.061],[.014,-.061,.104,.054,.04]],15+side);
    const tendon=named(k,palm,'Xuan elder opening fingers '+side,0,-.026,.081);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.035,y=-.027-Math.abs(i-1.4)*.021;
      rib(tendon,'xSkin',[[x,0,0,.018],[x+.004,y,.04,.021],[x+.007,y-.033,.078,.018],[x+.008,y-.015,.112,.006]]);
    }
    rib(palm,'xSkin',f([[-.046,-.012,.025,.019],[-.07,-.048,.061,.027],[-.042,-.083,.146,.01]]));
    fingers.push({tendon,side});
    shell(thigh,'xPleat',f([[0,.065,.004,.107,.091],[.031,-.099,-.02,.114,.099],
      [.04,-.246,-.052,.102,.092],[.036,-.427,-.03,.068,.07]]),14+side);
    shell(shin,'xCloak',f([[0,.065,.004,.071,.073],[.026,-.081,.027,.083,.079],
      [.027,-.248,.054,.067,.067],[.017,-.369,.061,.052,.060]]),13.4+side);
    shell(heel,'xSole',[[0,.068,-.014,.047,.05],[.012,.011,.057,.068,.061],
      [.019,-.037,.132,.054,.073],[.022,-.036,.221,.031,.06]],4.11+side);
    shell(heel,'xSkin',[[0,.02,.018,.05,.044],[.009,.013,.097,.066,.048],[.019,-.015,.165,.052,.053],
      [.021,-.018,.211,.032,.04]],15.1+side);
    rib(heel,'xCopper',f([[-.056,-.003,.113,.006],[-.016,.021,.144,.013],[.041,.009,.171,.014],[.061,-.012,.172,.004]]));
  }
  return {body,head,grounded:true,crest:k.bone(body,0,0,0),pattern:'duel',catalogueSculpt:entry.id,
    wootaiElderSculpt:true,commanderGarments:cloth,polishEnergy:{tint:0xf5aa73,shape:'lotus',offset:[0,.3,-.28],
      span:[.67,.4,.39],anchor:body},
    cataloguePose({beat,step,wind,strike,travel,stage}){
      const breath=Math.sin(beat*.52)*.036;
      body.rotation.y=(strike-wind)*.27;
      body.rotation.x+=wind*.15-strike*.055;
      head.rotation.x=breath+wind*.17-strike*.19;
      head.rotation.y=wind*.18-strike*.24;
      jaw.rotation.x=.017+wind*.04+strike*.19;
      for(const {upper,lower,palm,thigh,shin,heel,side} of limbs){
        const gait=Math.sin(step+side*Math.PI*.50)*travel,lead=side===1;
        upper.rotation.set(-.14+gait*.32-wind*(lead?.99:.57)-strike*(lead?1.16:.81),
          side*(.034+wind*.18-strike*.43),side*(.084+wind*.43+strike*.22+stage*.033));
        lower.rotation.set(-.44-wind*(lead?.92:.62)+strike*(lead?.34:.02),side*(.023+wind*.31-strike*.32),0);
        palm.rotation.set(wind*.25-strike*.51,side*(.07+wind*.46-strike*.34),side*(wind*.2-strike*.15));
        thigh.rotation.x=gait*.49-wind*.056+strike*.15;
        shin.rotation.x=-Math.max(0,gait)*.51+wind*.08;
        heel.rotation.x=-gait*.22;
      }
      for(const {tendon,side} of fingers)tendon.rotation.x=.18+wind*.71-strike*(side===1?.46:.25);
      for(const {joint,side} of locks)joint.rotation.z=side*(breath+wind*.084-strike*.139);
    },
  };
}
