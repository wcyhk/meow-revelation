import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);
const sweep=(k,j,mat,path,steps=9)=>k.sculpt.sweep(j,mat,path,{sides:7,steps,ridge:.24});

function coat(k,j,mat,path,mobile,seed=0){
  k.geometry(j,mat,sculptVolume(path,{sides:mobile?12:17,rings:mobile?14:19,section:2.34,ridge:.32,fur:true,seed}));
}

function maneFan(k,head,mobile){
  const locks=[];
  for(const side of sides){
    const count=mobile?7:8;
    for(let row=0;row<count;row++){
      const t=row/(count-1),a=-.65+t*2.18;
      const x=.078+Math.cos(a)*.185,y=Math.sin(a)*.243,z=-.11+t*.062;
      const r=.42+.17*Math.sin(t*2.94),end=[Math.cos(a)*r+.106,Math.sin(a)*r+.131,z-.206-t*.247];
      const joint=k.bone(head,side*x,y,z);
      const q=path=>reflect(side,path);
      const dx=end[0]-x,dy=end[1]-y,dz=end[2]-z;
      coat(k,joint,row%3?'frenzyAsh':'frenzyCharcoal',q([[0,0,0,.101,.087],[dx*.43,dy*.36,dz*.32,.109,.084],
        [dx*.76,dy*.67,dz*.68,.075,.047],[dx,dy,dz,.006,.006]]),mobile,row);
      k.geometry(joint,row%2?'frenzyPale':'frenzyWhite',featherVane(...q([[.023,.028,.058],
        [dx*.59,dy*.54,dz*.44+.089],[dx*.98,dy*.96,dz-.008]]),.087-t*.018,row+47,mobile?8:12));
      sweep(k,joint,'frenzyCharcoal',q([[dx*.13,dy*.17,.073,.014],[dx*.52,dy*.48,dz*.33+.08,.023],
        [dx*.78,dy*.72,dz*.66+.049,.014],[dx*.93,dy*.90,dz*.85,.004]]));
      locks.push({joint,side,t});
    }
  }
  return locks;
}

function frenzyFace(k,head,mobile){
  coat(k,head,'frenzyAsh',[[0,-.043,-.217,.216,.176],[0,.048,-.078,.251,.209],
    [0,.036,.089,.244,.167],[0,-.017,.224,.186,.130],[0,-.067,.359,.134,.074]],mobile);
  coat(k,head,'frenzyWhite',[[0,-.082,.111,.16,.094],[0,-.045,.226,.169,.096],
    [0,-.064,.365,.132,.066],[0,-.084,.407,.098,.041]],mobile,4);
  coat(k,head,'frenzyCopper',[[0,-.049,.343,.075,.042],[0,-.041,.387,.078,.042],
    [0,-.077,.413,.060,.023],[0,-.095,.399,.034,.033]],mobile,6);
  const jaw=k.bone(head,0,-.155,.072);
  coat(k,jaw,'frenzyWhite',[[0,-.016,-.083,.147,.070],[0,-.056,.075,.169,.102],
    [0,-.047,.207,.138,.078],[0,-.020,.273,.103,.045]],mobile,2);
  sweep(k,jaw,'frenzyCharcoal',[[-.093,.007,.239,.016],[0,-.003,.275,.022],[.093,.007,.239,.016]],11);
  const locks=maneFan(k,head,mobile);
  for(const side of sides){
    const q=path=>reflect(side,path);
    coat(k,head,'frenzyCharcoal',q([[.068,.087,.272,.029,.024],[.143,.087,.237,.054,.038],
      [.192,.092,.134,.058,.042],[.215,.105,.032,.012,.012]]),mobile,side+9);
    k.mesh(head,'gem','glow',side*.139,.081,.273,.052,.021,.025,0,side*.33,side*.23);
    sweep(k,head,'frenzyWhite',q([[.051,.107,.272,.013],[.127,.131,.264,.034],
      [.202,.137,.196,.040],[.235,.147,.084,.003]]),12);
    sweep(k,head,'frenzyPale',q([[.098,.037,.319,.011],[.151,.027,.298,.030],
      [.226,.067,.234,.043],[.253,.096,.114,.005]]),12);
    coat(k,head,'frenzyAsh',q([[.150,.160,-.033,.058,.065],[.236,.203,-.058,.076,.051],
      [.281,.259,-.089,.045,.037],[.287,.296,-.121,.009,.014]]),mobile,13);
    k.sculpt.plate(head,'frenzyCopper',q([[.173,.184,.012],[.246,.200,-.008],[.274,.256,-.061],
      [.228,.238,-.048],[.196,.218,-.020]]),.017,.006);
    for(let i=0;i<4;i++){
      const y=.021-i*.047,z=.303-i*.012;
      sweep(k,head,'frenzyCharcoal',q([[.093+i*.028,y-.031,z+.031,.003],
        [.176+i*.017,y-.010,z+.006,.014],[.251+i*.007,y+.017,z-.082,.019],
        [.296+i*.005,y+.024,z-.168,.004]]),12);
      const x=.08+i*.028;
      sweep(k,jaw,'frenzyBone',q([[x,-.004,.248-i*.044,.014],[x+.003,.022,.252-i*.046,.011],
        [x-.009,.043,.248-i*.058,.002]]));
    }
    coat(k,head,'frenzyBone',q([[.141,-.121,.292,.046,.037],[.166,-.187,.307,.040,.032],
      [.153,-.254,.279,.027,.025],[.134,-.300,.259,.004,.004]]),mobile,61);
    for(let i=0;i<4;i++)sweep(k,head,i%2?'frenzyPale':'frenzyAsh',q([[.095+i*.024,-.086+i*.029,.405-i*.021,.004],
      [.229+i*.035,-.137+i*.036,.386-i*.033,.008],[.407+i*.024,-.136+i*.050,.283-i*.049,.002]]),13);
  }
  return {jaw,locks};
}

function limbStripes(k,joint,side,span,z0,y0){
  for(let row=0;row<4;row++){
    const r=(1-row*.098)*span,y=y0-row*.082;
    sweep(k,joint,'frenzyCharcoal',reflect(side,[[.009,y+.041,z0+r*.64,.004],
      [.085,y+.018,z0+r,.015],[.145+r*.34,y-.025,z0+r*.56,.023],
      [.159+r*.47,y-.058,z0-r*.12,.018],[.105+r*.44,y-.063,z0-r*.68,.004]]),12);
  }
}

function frenzyArm(k,body,side,mobile){
  const q=path=>reflect(side,path);
  const arm=k.bone(body,side*.321,.449,.025);
  const elbow=k.bone(arm,side*.277,-.206,.091),wrist=k.bone(elbow,side*.217,-.242,.184);
  coat(k,arm,'frenzyAsh',q([[-.102,.014,-.086,.136,.136],[.019,.073,-.051,.163,.150],
    [.137,.011,.008,.149,.120],[.241,-.135,.050,.119,.098],[.282,-.198,.088,.079,.084]]),mobile,side);
  coat(k,elbow,'frenzyPale',q([[-.030,.036,-.037,.104,.093],[.071,.002,.019,.147,.103],
    [.151,-.072,.088,.122,.098],[.218,-.179,.149,.101,.086],[.235,-.255,.185,.073,.065]]),mobile,5);
  limbStripes(k,arm,side,.143,.051,-.019);
  limbStripes(k,elbow,side,.083,.087,-.011);
  for(let i=0;i<4;i++){
    const t=i*.058;
    k.geometry(arm,i%2?'frenzyPale':'frenzyWhite',featherVane(...q([[.035+t,.105-i*.035,-.102],
      [.130+t,.073-i*.044,-.149],[.211+t,-.039-i*.052,-.152]]),.071-i*.009,44+i,mobile?7:11));
  }
  coat(k,wrist,'frenzyWhite',q([[.001,.023,-.033,.078,.080],[.036,.011,.033,.111,.081],
    [.066,-.026,.109,.121,.071],[.091,-.068,.139,.087,.048]]),mobile,9);
  const digits=[];
  for(let i=0;i<4;i++){
    const spread=(i-1.4)*.071,digit=k.bone(wrist,side*(spread+.079),-.059,.125-Math.abs(i-1.4)*.030);
    const curl=.048+i*.011;
    coat(k,digit,'frenzyWhite',q([[0,0,-.021,.047,.037],[.008,-.018,.031,.047,.036],
      [.019,-.008,.076,.031,.028],[.028,curl,.108,.024,.022]]),mobile,13+i);
    coat(k,digit,'frenzyGold',q([[.021,curl-.017,.101,.028,.023],[.030,curl+.033,.123,.024,.022],
      [.021,curl+.090,.129,.012,.014],[.012,curl+.121,.115,.004,.004]]),mobile,18+i);
    digits.push(digit);
  }
  return {arm,elbow,wrist,digits,side};
}

function frenzyLeg(k,body,side,mobile){
  const q=path=>reflect(side,path);
  const hip=k.bone(body,side*.242,-.080,-.081),hock=k.bone(hip,side*.216,-.281,.112);
  const toes=k.bone(hock,side*.052,-.383,-.016);
  coat(k,hip,'frenzyAsh',q([[-.034,.100,-.117,.128,.124],[.084,.008,-.069,.167,.143],
    [.158,-.091,.019,.159,.142],[.224,-.224,.134,.124,.100],[.210,-.309,.110,.105,.099]]),mobile,72);
  coat(k,hock,'frenzyCharcoal',q([[.010,.063,-.068,.106,.107],[.027,-.043,-.047,.128,.116],
    [.066,-.173,-.057,.111,.106],[.073,-.301,-.050,.080,.084],[.056,-.385,-.019,.067,.076]]),mobile,77);
  coat(k,toes,'frenzyWhite',q([[.006,-.001,-.037,.073,.056],[.018,-.008,.051,.103,.076],
    [.040,-.043,.137,.120,.067],[.050,-.051,.174,.103,.045]]),mobile,82);
  limbStripes(k,hip,side,.153,.062,-.039);
  for(let i=0;i<4;i++){
    const x=.051+(i-1.5)*.056,z=.168-Math.abs(i-1.5)*.02;
    sweep(k,toes,'frenzyGold',q([[x,-.058,z,.033],[x+.005,-.066,z+.069,.025],
      [x+.013,-.094,z+.113,.002]]),10);
    if(i===3)continue;
    k.geometry(hock,i%2?'frenzyWhite':'frenzyPale',featherVane(...q([[.053,.059-i*.09,-.104],
      [.111,-.003-i*.097,-.132],[.159,-.084-i*.105,-.105]]),.071-i*.012,i+75,mobile?7:9));
  }
  return {hip,hock,toes,side};
}

export function sculptFrenzyTiger(k,entry,mobile){
  const body=k.bone(k.root,0,.995,0),head=k.bone(body,0,.557,.405);
  coat(k,body,'frenzyAsh',[[0,-.227,-.234,.241,.233],[0,-.143,-.199,.329,.273],
    [0,.096,-.102,.416,.325],[0,.321,-.065,.438,.344],[0,.499,.049,.383,.309],
    [0,.645,.163,.248,.224]],mobile,23);
  const {jaw,locks}=frenzyFace(k,head,mobile);
  const arms=sides.map(side=>frenzyArm(k,body,side,mobile)),legs=sides.map(side=>frenzyLeg(k,body,side,mobile));
  for(const side of sides){
    const q=path=>reflect(side,path);
    coat(k,body,'frenzyPale',q([[.025,.540,.254,.096,.070],[.117,.438,.275,.137,.078],
      [.141,.283,.284,.133,.071],[.071,.085,.223,.084,.047],[.032,-.163,.128,.055,.041]]),mobile,125);
    for(let i=0;i<6;i++){
      const t=i/5,x=.042+i*.027,y=.53-i*.117,z=-.26-Math.sin(t*2.1)*.11;
      k.geometry(body,i%2?'frenzyPale':'frenzyWhite',featherVane(...q([[x,y+.085,z+.038],
        [x+.087,y-.015,z-.049],[x+.158,y-.155,z-.062]]),.107-t*.022,i+103,mobile?8:11));
      sweep(k,body,'frenzyCharcoal',q([[x+.027,y+.059,z-.011,.014],[x+.146,y+.038,z-.061,.027],
        [x+.248,y-.041,z-.038,.030],[x+.319-t*.018,y-.111,z+.118,.004]]),14);
    }
  }
  const tail=k.bone(body,0,-.143,-.426),tip=k.bone(tail,.218,.529,-.573);
  coat(k,tail,'frenzyAsh',[[0,0,0,.116,.112],[.103,.062,-.213,.119,.095],
    [.174,.236,-.411,.096,.086],[.218,.529,-.573,.073,.068]],mobile,40);
  coat(k,tip,'frenzyAsh',[[0,0,0,.073,.068],[.026,.227,-.033,.066,.062],
    [.012,.438,-.047,.048,.044],[-.048,.577,.016,.022,.019],[-.093,.622,.066,.004,.004]],mobile,45);
  for(const [joint,base] of [[tail,0],[tip,1]])for(let i=0;i<4;i++){
    const t=i/4,r=(base?.073:.115)*(1-t*.34);
    const [x,y,z]=base?[.027*Math.sin(t*3.8),t*.61,-t*.024]:[t*.22,t*t*.51,-t*.56];
    sweep(k,joint,'frenzyCharcoal',Array.from({length:8},(_,a)=>{
      const angle=a*Math.PI*2/7;
      return [x+Math.cos(angle)*r,y+Math.sin(angle)*r*(base?.38:.83),z+Math.sin(angle)*r*(base?.89:.55),.013];
    }),10);
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'slam',grounded:true,frenzyTiger:true,
    cataloguePose({beat,headtime,wind,strike,travel,step,fall,stage}){
      body.rotation.set(.22+wind*.24-strike*.37+travel*Math.sin(step)*.12+fall*.29,Math.sin(beat*.74)*.064,(wind-strike)*.14);
      head.rotation.x=-wind*.32+strike*.55;
      head.rotation.y=Math.sin(headtime*2.12)*.19*(1-wind);
      jaw.rotation.x=.087+wind*.45+strike*.61+stage*.06;
      tail.rotation.set(travel*.21-wind*.25+strike*.35,Math.sin(beat*.65)*.36+wind*.30-strike*.47,0);
      tip.rotation.z=Math.sin(beat*.68)*.25+strike*.30;
      for(const {joint,side,t} of locks){
        joint.rotation.x=Math.sin(beat*1.18-t*3.22)*(.042+travel*.079)+wind*.08-strike*.16;
        joint.rotation.z=side*(wind*.048-strike*.109);
      }
      for(const {arm,elbow,wrist,digits,side} of arms){
        const gait=Math.sin(step+side*Math.PI*.51)*travel,lead=side===1?1:.78;
        arm.rotation.set(-.29+gait*.51-wind*1.07*lead+strike*.98,side*(.19+wind*.29-strike*.46),
          side*(.08+wind*.18+strike*.18));
        elbow.rotation.x=-.19+wind*.43-strike*.41+gait*.30;
        wrist.rotation.x=-.11-wind*.27+strike*.38;
        wrist.rotation.y=side*(.13+wind*.17-strike*.27);
        for(const [i,digit] of digits.entries())digit.rotation.x=-.03+wind*.17+strike*.46+Math.sin(beat*.9+i)*.035;
      }
      for(const {hip,hock,toes,side} of legs){
        const gait=Math.sin(step+(side===1?0:Math.PI)+1.05)*travel;
        hip.rotation.x=-.11+gait*.53+wind*.17-strike*.21;
        hip.rotation.z=side*(.077+fall*.22);
        hock.rotation.x=.19-Math.max(0,gait)*.69+strike*.16+stage*.037;
        toes.rotation.x=-hock.rotation.x*.62+wind*.12;
      }
    }};
}
