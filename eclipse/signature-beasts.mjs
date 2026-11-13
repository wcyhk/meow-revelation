import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const opposite=(side,points)=>points.map(([x,y,z,...rest])=>[x*side,y,z,...rest]);

function anatomy(k,part,finish,sections,shape={}){
  k.geometry(part,finish,sculptVolume(sections,shape));
}

function blade(k,part,finish,sections,seed=0){
  anatomy(k,part,finish,sections,{sides:8,rings:12,section:1.48,ridge:.17,seed});
}

export function sculptWhiteBear(k){
  const {root,bone,mesh}=k;
  const body=bone(root,0,.99,0);
  const head=bone(body,0,.72,.24);
  const jaw=bone(head,0,-.077,.17);
  const arms=[],legs=[],knees=[],wrists=[];
  anatomy(k,body,'deep',[[0,-.59,-.11,.27,.26],[0,-.34,-.10,.52,.41],[0,.02,-.06,.56,.44],[0,.36,-.07,.68,.47],
    [0,.59,-.08,.58,.41],[0,.79,-.08,.29,.26],[0,.85,-.04,.14,.16]],{section:2.2,ridge:.115});
  anatomy(k,body,'edge',[[0,-.55,.07,.25,.09],[0,-.34,.25,.43,.18],[0,.01,.35,.46,.19],[0,.33,.36,.56,.21],
    [0,.52,.29,.40,.16],[0,.67,.14,.25,.155]],{ridge:.145,section:2.25,fur:true,sides:24});
  anatomy(k,head,'edge',[[0,-.18,.07,.16,.18],[0,-.05,.07,.33,.28],[0,.15,.015,.32,.35],
    [0,.33,-.06,.265,.28],[0,.41,-.12,.15,.16]],{ridge:.13,fur:true,sides:24});
  anatomy(k,head,'body',[[0,-.122,.18,.154,.12],[0,-.079,.31,.205,.14],[0,.009,.37,.174,.17],[0,.104,.24,.20,.19],
    [0,.185,.14,.12,.111]],{sides:18,section:2.6,ridge:.11});
  anatomy(k,head,'deep',[[0,-.051,.476,.096,.040],[0,.005,.505,.144,.055],[0,.048,.496,.126,.062],
    [0,.073,.423,.084,.035]],{section:3.0,ridge:.045});
  anatomy(k,jaw,'deep',[[0,-.142,.05,.115,.116],[0,-.094,.088,.19,.166],[0,-.024,.10,.199,.189],
    [0,.006,.091,.133,.16]],{sides:16,section:2.6});
  for(let i=0;i<10;i++){
    const y=.68-i*.103,w=.14+Math.sin(i*.34)*.045;
    blade(k,body,i%3===0?'coal':'rust',[[0,y,-.433,w,.10],[i%2?.078:-.078,y+.09,-.57,w*1.17,.066],
      [i%2?.081:-.081,y-.025,-.78,w*.65,.039],[0,y-.153,-.92+i*.020,.007,.006]],i);
    blade(k,body,'ember',[[0,y+.028,-.552,.034,.012],[.024,y+.013,-.699,.025,.014],[0,y-.075,-.832+i*.013,.003,.004]],i);
  }
  for(let row=0;row<5;row++)for(let i=-3;i<=3;i++){
    const x=i*(.102+(row<2?.019:0)),y=.47-row*.152,z=.543-(Math.abs(i)/3)**2*.097-
      Math.pow(Math.abs(row-1)*.114,2);
    const side=i>=0?1:-1,reach=.141+((row*13+(i+4)*7)%8)*.008;
    anatomy(k,body,i%3===1?'ash':'edge',[[x,y,z-.060,.040,.030],[x+side*.026,y-.044,z,.060,.027],
      [x+side*.046,y-reach*.68,z+.025,.031,.018],[x+side*.046,y-reach,z-.03,.004,.004]],
    {sides:6,rings:8,section:1.61,ridge:.20,seed:row*5+i});
  }
  for(const side of [-1,1]){
    const reflect=points=>opposite(side,points);
    anatomy(k,head,'body',reflect([[.237,.179,-.152,.11,.079],[.294,.255,-.195,.148,.115],
      [.332,.344,-.192,.101,.079],[.354,.367,-.218,.035,.029]]),{sides:12,rings:13,section:2.28});
    mesh(head,'round','deep',side*.206,.132,.312,.101,.085,.062,0,side*.37,side*.20);
    mesh(head,'gem','glow',side*.206,.133,.366,.047,.031,.029,0,side*.33,side*.18);
    blade(k,head,'edge',reflect([[.059,.194,.386,.054,.041],[.168,.222,.356,.087,.047],[.263,.208,.263,.062,.046],
      [.346,.168,.166,.024,.017],[.346,.119,.11,.006,.003]]),side);
    for(let i=0;i<5;i++){
      const y=.14-i*.065;
      blade(k,head,i%4===2?'body':'edge',reflect([[.224,y+.08,.17,.071,.085],[.342,y+.033,.156,.089,.065],
        [.377,y-.107,.073,.063,.043],[.334,y-.18,-.027,.005,.009]]),i);
    }
    for(let i=0;i<3;i++){
      const x=.089+i*.039;
      blade(k,jaw,'ivory',reflect([[x,-.061,.237-i*.035,.028,.028],[x,-.023,.260-i*.037,.020,.019],
        [x*.90,.026-i*.012,.243-i*.041,.003,.003]]),i);
    }
    for(let i=0;i<5;i++){
      const y=.59-i*.146,x=.21+i*.026;
      blade(k,body,i%3?'edge':'ash',reflect([[x,y,.357,.114,.076],[x+.094,y-.06,.426,.130,.079],
        [x+.11,y-.19,.40,.083,.042],[x+.09,y-.29,.294,.005,.009]]),i*1.61);
    }
    for(let i=0;i<5;i++){
      const z=.18-i*.148,x=.16+i*.028;
      blade(k,body,i%2?'rust':'coal',reflect([[x,.56,z,.142,.101],[x+.11,.81,z-.041,.124,.075],
        [x+.31,.80,z-.13,.091,.006],[x+.50,.65,z-.23,.007,.003]]),i);
    }
    for(let i=0;i<8;i++){
      const y=.59-i*.116,z=-.458+(i%2)*.051;
      blade(k,body,i%3===1?'coal':'rust',reflect([[.153,y,z,.103,.085],[.254,y+.027,z-.10,.112,.064],
        [.409,y-.029,z-.17,.082,.042],[.53,y-.13,z-.21+i*.015,.007,.007]]),i);
      blade(k,body,'ember',reflect([[.279,y+.040,z-.104,.022,.024],[.395,y+.015,z-.155,.023,.018],
        [.458,y-.061,z-.18,.004,.004]]),i);
    }
    const arm=bone(body,side*.567,.43,.017);
    const elbow=bone(arm,side*.136,-.48,.033);
    const claw=bone(elbow,side*.05,-.52,.223);
    arms.push(arm);wrists.push({elbow,claw,side});
    anatomy(k,arm,'body',reflect([[.02,-.56,.052,.129,.134],[.108,-.37,-.02,.217,.204],[.094,-.21,-.06,.292,.26],
      [.041,-.009,-.003,.289,.234],[-.04,.132,.01,.156,.14]]),{section:2.3,ridge:.13,fur:true});
    anatomy(k,elbow,'ash',reflect([[.035,-.528,.24,.201,.175],[.06,-.316,.123,.223,.215],[.056,-.17,.031,.193,.178],
      [.017,.015,-.014,.167,.166]]),{section:2.6,ridge:.135,fur:true});
    for(let i=0;i<5;i++){
      const z=.264-i*.124;
      blade(k,arm,i%2?'rust':'coal',reflect([[.02,.037,z,.198,.085],[.231,.174,z-.041,.164,.068],
        [.411,.122,z-.14,.105,.045],[.521,-.062,z-.32,.005,.009]]),i);
      blade(k,arm,'ember',reflect([[.184,.162,z-.052,.051,.024],[.334,.164,z-.127,.033,.020],
        [.416,.066,z-.230,.006,.004]]),i);
      const y=-.118-i*.078;
      blade(k,elbow,i%3===1?'coal':'rust',reflect([[.071,y,.159,.096,.067],[.226,y+.074,.158,.100,.054],
        [.277,y-.032,.114,.077,.036],[.243,y-.169,.048,.007,.008]]),i);
    }
    anatomy(k,claw,'deep',[ [0,-.118,.12,.185,.192],[0,-.049,.072,.223,.182],[0,.036,0,.17,.132] ],
      {section:2.6,ridge:.15,sides:14,rings:11});
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.094,z=.177-Math.abs(i-1.5)*.032;
      blade(k,claw,'ivory',[[x,-.042,z,.055,.047],[x*1.13,-.101,z+.104,.052,.040],
        [x*1.22,-.167,z+.164,.029,.031],[x*1.33,-.219,z+.165,.006,.007]],i);
    }
    const thigh=bone(root,side*.305,.65,.012);
    const knee=bone(thigh,side*.068,-.307,-.109);
    legs.push(thigh);knees.push(knee);
    anatomy(k,thigh,'deep',reflect([[.071,-.364,-.14,.151,.179],[.081,-.229,-.044,.226,.254],
      [.027,-.080,.008,.258,.235],[-.011,.104,-.01,.183,.171]]),{section:2.4,ridge:.16});
    anatomy(k,knee,'body',[[0,-.294,.151,.204,.203],[0,-.233,.085,.211,.219],[0,-.10,-.025,.158,.172],
      [0,.047,-.043,.144,.144]],{section:2.6,ridge:.17});
    for(let i=0;i<3;i++){
      const x=(i-1)*.126;
      blade(k,knee,'ivory',[[x,-.249,.245,.064,.047],[x*1.04,-.276,.327,.059,.043],
        [x*1.12,-.31,.391,.031,.026],[x*1.16,-.335,.407,.005,.006]],i);
    }
  }
  blade(k,head,'rust',[[0,.21,-.18,.166,.123],[0,.375,-.262,.142,.080],[0,.554,-.367,.072,.038],[0,.59,-.523,.004,.005]]);
  const crest=bone(root,0,0,0);
  return {body,head,arms,legs,crest,signature:{type:'bear',jaw,wrists,knees}};
}

export function sculptPhoenix(k){
  const {root,bone,mesh}=k;
  const body=bone(root,0,1.31,0),head=bone(body,0,.31,.67);
  const tail=bone(body,0,-.015,-.52);
  const arms=[],joints=[],talons=[];
  anatomy(k,body,'coal',[[0,-.25,.03,.13,.21],[0,-.145,-.15,.32,.43],[0,.095,-.107,.42,.63],
    [0,.333,-.054,.331,.45],[0,.48,.05,.159,.24]],{section:2.22,ridge:.10});
  anatomy(k,body,'rust',[[0,.02,.12,.27,.34],[0,.20,.28,.36,.44],[0,.40,.30,.246,.41],[0,.59,.43,.158,.165]],
    {section:2.2,ridge:.15});
  anatomy(k,head,'rust',[[0,-.13,.008,.16,.193],[0,-.02,.053,.207,.224],[0,.113,.051,.208,.19],
    [0,.247,-.009,.169,.18],[0,.292,-.10,.091,.093]],{section:2.17,ridge:.15});
  blade(k,head,'trim',[[0,-.004,.145,.184,.111],[0,-.117,.324,.151,.074],[0,-.164,.474,.097,.036],
    [0,-.211,.553,.012,.014]],12);
  blade(k,head,'deep',[[0,-.064,.19,.115,.052],[0,-.154,.294,.099,.052],[0,-.177,.407,.062,.025],[0,-.209,.50,.014,.012]],3);
  function vane(part,finish,a,b,c,width,i){
    k.geometry(part,finish,featherVane(a,b,c,width,i,11));
  }
  for(const side of [-1,1]){
    const reflect=points=>opposite(side,points);
    mesh(head,'round','deep',side*.147,.075,.211,.077,.064,.061,0,side*.35);
    mesh(head,'gem','glow',side*.161,.083,.239,.036,.030,.035,0,side*.35);
    for(let i=0;i<6;i++){
      const x=side*(.045+i*.035),y=.154-i*.022;
      vane(head,i%3===0?'ivory':i%2?'rust':'ember',[x*.89,y,.134],[x*1.59,y+.199,-.14-i*.026],
        [x*2.08,y+.28,-.445-i*.046],.072+i*.007,i);
    }
    for(let i=0;i<7;i++){
      const x=side*(.037+i*.043),y=.28-i*.066;
      vane(body,i%4===2?'trim':i%2===0?'ember':'rust',[x,y,.632-i*.036],
        [x*1.6,y-.161,.566-i*.05],[x*1.42,y-.35,.463-i*.044],.095,i*1.53);
    }
    const wing=bone(body,side*.272,.275,-.14);
    const elbow=bone(wing,side*.611,.15,-.108);
    const outer=bone(elbow,side*.566,.21,-.055);
    arms.push(wing);joints.push({elbow,outer,side});
    anatomy(k,wing,'coal',reflect([[0,0,0,.17,.10],[.242,.15,-.06,.292,.105],[.461,.16,-.117,.249,.092],
      [.634,.17,-.15,.155,.061]]),{axis:'x',sides:15,rings:16,section:2.24});
    anatomy(k,elbow,'rust',reflect([[0,0,0,.168,.083],[.17,.14,.032,.21,.066],[.37,.181,-.022,.177,.078],
      [.61,.222,-.054,.118,.053]]),{axis:'x',sides:13,rings:14,section:2.24});
    for(let layer=0;layer<2;layer++)for(let i=0;i<7;i++){
      const x=.10+i*.063,y=.14-i*.011-layer*.095,z=-.04-i*.016-layer*.028;
      const [a,b,c]=reflect([[x,y,z],[x+.28,y-.17-layer*.065,z-.147],[x+.62+layer*.10,y-.395-layer*.10,z-.324]]);
      vane(wing,i%4===0?'trim':layer?'rust':'ember',a,b,c,.105+layer*.022,i+layer*8);
    }
    for(let i=0;i<8;i++){
      const x=.09+i*.052,y=.095+i*.011,z=-.020-i*.020;
      const [a,b,c]=reflect([[x,y,z],[x+.278,y-.16,z-.165],[x+.58,y-.48+(i*.035),z-.46]]);
      vane(elbow,i%5===3?'ivory':i%3?'ember':'rust',a,b,c,.144,i);
    }
    for(let i=0;i<11;i++){
      const t=i/10,x=.103+t*.34,y=.037+t*.135,z=-t*.086;
      const [a,b,c]=reflect([[x,y,z],[x+.26+t*.14,y-.25+t*.14,z-.11],[x+.42+t*.54,y-.68+t*.75,z-.35+t*.063]]);
      vane(outer,i%3===0?'ember':'ivory',a,b,c,.15,i*1.22);
      if(i%2===1){
        const [a,b,c]=reflect([[x,y,z+.024],[x+.14,y-.105+t*.072,z-.03],[x+.34,y-.27+t*.264,z-.082]]);
        vane(outer,i%3===0?'coal':'trim',a,b,c,.092,i);
      }
    }
    const foot=bone(body,side*.164,-.18,.13);
    talons.push(foot);
    anatomy(k,foot,'coal',reflect([[0,0,0,.065,.088],[.058,-.168,-.049,.095,.077],[.067,-.26,.038,.091,.063]]),
      {sides:11,rings:11,section:2.4});
    for(let i=0;i<3;i++){
      const x=.056+(i-1)*.067;
      blade(k,foot,'trim',reflect([[x,-.242,.024,.043,.045],[x+.032,-.319,.124,.042,.041],
        [x+.055,-.361,.207,.027,.028],[x+.04,-.412,.22,.005,.004]]),i);
    }
  }
  for(let i=-5;i<=5;i++){
    const x=i*.054;
    vane(tail,i%3===0?'trim':i%2?'rust':'ember',[x,.092,0],[x*2.1,.189-Math.abs(i)*.019,-.46],
      [x*4.3,-.33-Math.abs(i)*.027,-1.45+Math.abs(i)*.10],.143,i+32);
  }
  const crest=bone(root,0,0,0);
  return {body,head,arms,tail,crest,signature:{type:'phoenix',joints,talons}};
}

export function sculptDestroyer(k){
  const {root,bone,mesh,rod}=k;
  const body=bone(root,0,1.01,0),head=bone(body,0,.88,.16);
  const jaw=bone(head,0,-.055,.091),tail=bone(body,0,-.40,-.34);
  const arms=[],legs=[],limbs=[];
  anatomy(k,body,'coal',[[0,-.46,-.06,.35,.34],[0,-.27,-.02,.61,.41],[0,.09,-.055,.60,.46],
    [0,.37,-.023,.69,.46],[0,.64,-.026,.67,.39],[0,.79,.027,.45,.28],[0,.85,.048,.24,.228]],
  {sides:20,rings:28,section:2.55,ridge:.13});
  anatomy(k,body,'rust',[[0,-.24,.29,.43,.198],[0,-.043,.36,.48,.231],[0,.22,.31,.54,.22],
    [0,.46,.30,.49,.192],[0,.63,.26,.314,.151]],{sides:17,section:2.66,ridge:.14});
  anatomy(k,head,'coal',[[0,-.18,.076,.146,.181],[0,-.09,.087,.258,.26],[0,.124,.038,.298,.29],
    [0,.33,-.062,.253,.229],[0,.40,-.103,.16,.18]],{section:2.33,ridge:.15});
  anatomy(k,jaw,'rust',[[0,-.155,.062,.15,.128],[0,-.074,.088,.206,.147],[0,.016,.11,.171,.158]],
    {sides:14,rings:13,section:2.65,ridge:.17});
  blade(k,head,'trim',[[0,-.062,.278,.065,.031],[0,.103,.321,.102,.054],[0,.293,.243,.085,.060],
    [0,.419,.041,.054,.052],[0,.479,-.097,.007,.006]]);
  blade(k,tail,'deep',[[0,-.04,.21,.25,.199],[.04,-.17,-.13,.233,.163],[.13,-.41,-.38,.173,.136],
    [.31,-.48,-.70,.156,.134],[.598,-.39,-.97,.13,.11],[.917,-.13,-1.13,.103,.083],
    [1.02,.22,-1.20,.064,.061],[.97,.53,-1.37,.007,.006]]);
  const spine=[[0,-.02,-.35],[0,.046,-.398],[0,.223,-.425],[0,.40,-.406],[0,.58,-.368],[0,.75,-.290]];
  for(const [i,[x,y,z]] of spine.entries())blade(k,body,i%3?'rust':'trim',[[x,y-.08,z+.04,.145,.061],[x,y+.064,z-.12,.132,.051],
    [x+.039,y+.184,z-.227,.072,.035],[x+.03,y+.19,z-.354,.008,.005]],i);
  for(const side of [-1,1]){
    const reflect=points=>opposite(side,points);
    mesh(head,'round','deep',side*.171,.103,.284,.100,.080,.077,0,side*.28);
    mesh(head,'gem','glow',side*.173,.12,.344,.052,.035,.031,0,side*.18,-side*.13);
    blade(k,head,'ivory',reflect([[.091,.159,.333,.057,.045],[.235,.161,.284,.086,.049],[.311,.113,.137,.087,.051],
      [.281,.001,.219,.070,.049],[.207,-.151,.290,.046,.035],[.164,-.197,.308,.007,.005]]),side);
    const horn=[[.197,.251,-.002,.142,.131],[.357,.264,-.087,.164,.136],[.511,.352,-.151,.143,.119],
      [.593,.531,-.154,.102,.074],[.542,.729,-.144,.068,.053],[.418,.852,-.171,.005,.006]];
    anatomy(k,head,'coal',reflect(horn),{sides:16,rings:24,section:2.25,ridge:.25});
    blade(k,head,'rust',reflect([[.283,.299,.051,.084,.053],[.448,.356,-.043,.104,.058],[.556,.506,-.069,.063,.034],
      [.539,.642,-.088,.031,.019],[.474,.746,-.119,.005,.004]]),3);
    for(let i=0;i<4;i++){
      const y=.535-i*.207,x=.14+i*.017;
      blade(k,body,i%3===1?'coal':'trim',reflect([[x,y,.459,.068,.061],[.306,y+.074,.425,.081,.051],
        [.522,y+.019,.298,.084,.045],[.586,y-.12,.114,.055,.032],[.537,y-.179,-.073,.009,.008]]),i);
      blade(k,body,i%2?'ember':'rust',reflect([[.375,y+.049,-.274,.13,.075],[.556,y+.101,-.354,.099,.060],
        [.670,y-.009,-.431,.063,.033],[.716,y-.122,-.553,.006,.006]]),i);
    }
    const arm=bone(body,side*.612,.51,.003);
    const forearm=bone(arm,side*.08,-.48,.078);
    const fist=bone(forearm,side*.05,-.39,.11);
    arms.push(arm);limbs.push({forearm,side});
    anatomy(k,arm,'rust',reflect([[.035,-.49,.10,.15,.162],[.132,-.31,.05,.225,.221],[.12,-.08,.011,.247,.248],
      [.04,.147,-.076,.208,.207]]),{section:2.48,ridge:.13});
    anatomy(k,forearm,'coal',reflect([[.045,-.426,.103,.137,.152],[.084,-.29,.087,.172,.179],
      [.089,-.129,.058,.229,.225],[.025,.046,.04,.176,.167]]),{section:2.72,ridge:.17});
    for(let i=0;i<5;i++){
      const z=.23-i*.116;
      blade(k,arm,i%2?'ivory':'trim',reflect([[.041,.073,z,.17,.099],[.218,.212,z-.03,.144,.080],
        [.385,.174,z-.11,.098,.050],[.489,.037,z-.245,.007,.005]]),i);
      const y=-.078-i*.071;
      blade(k,forearm,i%2?'ember':'rust',reflect([[.077,y,.18,.116,.054],[.221,y+.037,.128,.096,.046],
        [.283,y-.056,.035,.064,.032],[.240,y-.122,-.06,.007,.006]]),i);
    }
    const leg=bone(root,side*.377,.78,.04);legs.push(leg);
    anatomy(k,leg,'rust',reflect([[.032,-.69,.11,.211,.177],[.042,-.55,-.005,.242,.218],
      [.004,-.32,-.032,.222,.235],[-.032,-.14,-.01,.275,.239],[-.073,.082,.004,.236,.174]]),
    {sides:16,rings:21,section:2.5,ridge:.155});
    for(let i=0;i<3;i++){
      const x=(i-1)*.125;
      blade(k,leg,'coal',[[x,-.646,.209,.080,.065],[x*1.10,-.693,.314,.087,.061],
        [x*1.15,-.75,.427,.035,.028],[x*1.29,-.768,.469,.004,.004]],i);
    }
    const apron=bone(body,side*.20,-.28,.449);
    for(let i=0;i<3;i++){
      const x=side*i*.10;
      blade(k,apron,i%2?'trim':'deep',[[x,.108,0,.147,.066],[x+.03*side,-.144,.032,.178,.065],
        [x+.11*side,-.43,-.011,.119,.031],[x+.14*side,-.58,-.192,.009,.005]],i);
    }
    if(side===1){
      rod(fist,'deep',[.06,-.398,-.245],[.016,.49,.457],.081);
      rod(fist,'trim',[.016,.49,.457],[-.049,.96,.72],.104);
      k.sculpt.plate(fist,'coal',[[.0,.39,.31],[-.14,.65,.48],[.16,.98,.52],[.43,1.28,.56],
        [.89,1.33,.47],[1.12,1.15,.39],[.82,.89,.36],[.427,.72,.36],[.30,.48,.317]],.125,.037);
      k.sculpt.sweep(fist,'ivory',[[.179,.494,.37,.044],[.41,.70,.39,.052],[.81,.88,.41,.041],
        [1.122,1.155,.416,.019]],{sides:9,steps:18,ridge:.22});
      for(let i=0;i<5;i++){
        const x=.28+i*.132;
        blade(k,fist,'trim',[[x,.76+i*.092,.489,.071,.053],[x+.058,.796+i*.092,.584,.059,.041],
          [x+.102,.778+i*.092,.676,.006,.007]],i);
      }
    }else{
      for(let i=0;i<4;i++){
        const x=(i-1.5)*.075;
        blade(k,fist,'ivory',[[x,.046,0,.040,.038],[x,-.054,.081,.054,.046],
          [x*1.12,-.135,.12,.018,.024],[x*1.11,-.16,.084,.004,.004]],i);
      }
    }
  }
  const crest=bone(root,0,0,0);
  return {body,head,arms,legs,tail,crest,limbs,signature:{type:'destroyer',jaw}};
}

export function poseSignatureBeast(model,time,beat,{wind,strike,travel,fall}){
  const rig=model.signature;
  if(rig.type==='bear'){
    rig.jaw.rotation.x=.054+wind*.27+strike*.42+Math.sin(beat*.41)*.032;
    for(const {side,elbow,claw} of rig.wrists){
      const step=Math.cos(beat+side*Math.PI*.5)*travel;
      elbow.rotation.x=-.19+wind*.59-strike*.65+step*.27;
      elbow.rotation.z=side*(.09+wind*.16-strike*.19);
      claw.rotation.x=-.12+strike*.38-step*.23+fall*.3;
    }
    for(const [i,knee] of rig.knees.entries())knee.rotation.x=travel*Math.max(0,Math.sin(beat+i*Math.PI))*.52;
    model.body.rotation.x+=.19;
    model.head.rotation.x-=.16;
  }else if(rig.type==='phoenix'){
    for(const {side,elbow,outer} of rig.joints){
      elbow.rotation.z=side*(.20+Math.sin(beat-.75)*(.32+travel*.14)-wind*.13+strike*.19);
      elbow.rotation.y=side*(.11+wind*.26-strike*.21);
      outer.rotation.z=side*(-.14+Math.sin(beat-1.39)*(.28+travel*.12)-wind*.34+strike*.21);
      outer.rotation.y=side*(.12+wind*.15-strike*.05);
    }
    for(const foot of rig.talons)foot.rotation.x=.32+wind*.23-strike*.67+Math.cos(beat*.54)*.091;
    model.tail.rotation.x=Math.sin(beat-.3)*.13+wind*.39-strike*.26;
    model.tail.rotation.z=Math.sin(time*2.14)*.12;
  }else{
    rig.jaw.rotation.x=.057+wind*.25+strike*.42;
    model.tail.rotation.x=Math.sin(beat*.71)*.20-wind*.26+strike*.30;
    model.tail.rotation.y=Math.sin(beat*.57)*(.19+travel*.24)+strike*.31;
  }
}
