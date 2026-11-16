import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const TAU=Math.PI*2,sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...point])=>[s*x,...point]);
const wire=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:17,sides:mobile?6:9,ridge:.23});
const shape=(k,j,m,p,mobile,seed=1,section=2.54)=>k.geometry(j,m,
  sculptVolume(p,{rings:mobile?12:19,sides:mobile?9:13,section,ridge:.21,seed}));
const plate=(k,j,m,p,d=.06)=>k.sculpt.plate(j,m,p,d,d*.31);
const jewel=(k,j,m,x,y,z,a,b=a,c=a)=>k.mesh(j,'gem',m,x,y,z,a,b,c);

function material(k,name,color,metalness,roughness,profile){
  const base=new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
    envMap:k.materials.edge.envMap,envMapIntensity:metalness>.4?.52:.16});
  k.materials[name]=paintedFinish(base,profile,true,true);
}

function seal(k,j,mat,r,t,mobile,z=0){
  const torus=new T.TorusGeometry(r,t,mobile?6:8,mobile?30:45);
  torus.translate(0,0,z);k.geometry(j,mat,torus);
}

function trimmed(k,j,mat,edge,points,mobile,d=.064,side=1){
  plate(k,j,mat,points,d);
  wire(k,j,edge,points.slice(0,-1).map(([x,y,z],i)=>[x,y+.008,z+side*d*.45,i===0?.005:.017]),mobile);
}

function shaft(k,j,r,h,finish,mobile){
  wire(k,j,finish,[[0,-.73,0,r*.78],[.006,-.21,.01,r],[0,.34,.013,r*.95],[.01,h,-.026,r*.76]],mobile);
}

function stoneCrown(k,j,mobile){
  const flares=[];
  for(let i=-3;i<=3;i++){
    const t=i/3,s=Math.sign(i)||1;
    const crown=k.bone(j,t*.122,.27-Math.abs(t)*.052,-.106-Math.abs(t)*.061);
    const climb=.318+(1-Math.abs(t))*.28;
    const outer=[[0,-.043,.09,.073,.079],[s*.054,climb*.29,.043,.098,.067],
      [s*.091,climb*.56,-.031,.073,.049],[s*.153,climb*.88,-.194,.051,.036],
      [s*.197,climb,-.245,.008,.008]];
    shape(k,crown,i%2?'relicSlate':'relicBasalt',outer,mobile,22+i,3.1);
    wire(k,crown,'glow',outer.slice(0,4).map(([x,y,z],n)=>[x+s*.018,y,z+.054,[.006,.015,.012,.004][n]]),mobile);
    flares.push({joint:crown,axis:'z',bias:t*.46,amp:.08,seed:i*1.2});
  }
  return flares;
}

function stoneSovereign(k,weapon,mobile){
  material(k,'relicBasalt',0x37313a,.19,.82,'stone');
  material(k,'relicSlate',0x6c625c,.23,.75,'stone');
  material(k,'relicFracture',0x926056,.38,.63,'iron');
  const body=k.bone(k.root,0,1.04,-.02),head=k.bone(body,0,.685,.079),spine=k.bone(body,0,.265,-.287);
  const arms=[],legs=[],joints=[],flaps=stoneCrown(k,head,mobile);
  shape(k,body,'relicBasalt',[[0,-.33,-.05,.31,.267],[0,-.13,-.055,.402,.286],[0,.14,-.036,.446,.317],
    [0,.422,-.037,.528,.351],[0,.63,-.098,.409,.285],[0,.729,-.061,.205,.207]],mobile,31,3.6);
  shape(k,head,'relicSlate',[[0,-.221,.058,.165,.142],[.011,-.105,.027,.232,.209],[0,.091,.015,.266,.229],
    [-.018,.244,-.032,.243,.215],[-.024,.321,-.079,.172,.173]],mobile,18,3.1);
  const jaw=k.bone(head,0,-.155,.127);
  const roof=[[-.192,.081,.197],[-.128,.17,.202],[.068,.202,.213],[.199,.084,.187],
    [.157,-.061,.212],[.055,-.104,.26],[-.179,-.041,.231]];
  trimmed(k,head,'relicBasalt','relicFracture',roof,mobile,.074);
  plate(k,jaw,'relicBasalt',[[-.157,.032,.094],[-.086,.059,.113],[.105,.055,.142],[.171,.035,.096],
    [.101,-.119,.127],[.012,-.165,.167],[-.115,-.105,.131]],.067);
  for(const s of sides){
    wire(k,head,'relicBasalt',mirror(s,[[.025,.049,.319,.016],[.086,.071,.317,.037],
      [.147,.080,.293,.032],[.187,.055,.258,.007]]),mobile);
    wire(k,head,'glow',mirror(s,[[.028,.041,.353,.009],[.081,.052,.352,.022],
      [.142,.069,.325,.020],[.191,.047,.280,.005]]),mobile);
    wire(k,jaw,'glow',mirror(s,[[.013,.016,.162,.011],[.088,.002,.167,.024],
      [.116,-.044,.164,.014],[.153,-.057,.139,.004]]),mobile);
    for(let i=0;i<4;i++){
      const y=.557-i*.162;
      const shell=mirror(s,[[.067,y+.081,.255],[.239,y+.129,.242],[.469-i*.052,y+.014,.119],
        [.445-i*.057,y-.144,.188],[.24,y-.20,.365],[.038,y-.138,.373]]);
      trimmed(k,body,i%2?'relicSlate':'relicBasalt','relicFracture',shell,mobile,.082);
      wire(k,body,'glow',mirror(s,[[.031,y-.117,.397,.004],[.159,y-.141,.398,.016],
        [.222,y-.205,.407,.014],[.334-i*.039,y-.132,.296,.007]]),mobile);
      const scarp=mirror(s,[[.02,y-.253,-.047],[.245,y-.211,-.092],[.426,y-.329,-.121],
        [.322,y-.466,-.145],[.128,y-.489,-.172],[.004,y-.447,-.109]]);
      trimmed(k,spine,'relicSlate','relicBasalt',scarp,mobile,.077,-1);
    }
    const shoulder=k.bone(body,.46*s,.383,-.023),elbow=k.bone(shoulder,.136*s,-.398,.051);
    const palm=k.bone(elbow,.061*s,-.331,.085);
    shape(k,shoulder,'relicBasalt',mirror(s,[[.006,.155,-.04,.165,.178],[.119,.055,-.021,.238,.239],
      [.139,-.194,.035,.207,.172],[.134,-.391,.057,.133,.139]]),mobile,4,3.4);
    shape(k,elbow,'relicSlate',mirror(s,[[0,.084,.027,.128,.135],[.063,-.028,.048,.172,.156],
      [.077,-.187,.078,.194,.158],[.061,-.331,.092,.141,.127]]),mobile,6,3.6);
    trimmed(k,elbow,'relicBasalt','relicFracture',mirror(s,[[.024,.055,.158],[.152,.1,.144],
      [.201,-.033,.105],[.244,-.194,.163],[.121,-.251,.213],[.017,-.211,.204]]),mobile,.087);
    for(let i=0;i<3;i++){
      const x=(i-1)*.082;
      shape(k,palm,'relicSlate',[[x,.05,.016,.068,.057],[x+s*.016,-.047,.05,.077,.069],
        [x+s*.026,-.13,.129,.063,.053],[x+s*.043,-.161,.154,.032,.032]],mobile,15+i,3.25);
    }
    const hip=k.bone(k.root,s*.282,.804,.03),ankle=k.bone(hip,s*.04,-.325,.031);
    shape(k,hip,'relicSlate',mirror(s,[[0,.05,-.02,.151,.138],[.044,-.099,.014,.173,.153],
      [.05,-.248,.026,.127,.128],[.05,-.39,.044,.097,.096]]),mobile,8,3.7);
    shape(k,ankle,'relicBasalt',mirror(s,[[.019,.044,.051,.139,.141],[.05,-.126,.018,.161,.147],
      [.07,-.28,.064,.158,.151],[.057,-.396,.164,.138,.112]]),mobile,14,3.3);
    for(let i=0;i<3;i++)shape(k,ankle,'relicSlate',[[s*(i-1)*.092,-.358,.139,.055,.074],
      [s*(i-1)*.111,-.391,.233,.087,.062],[s*(i-1)*.12,-.432,.326,.05,.023]],mobile,23+i,3.2);
    arms.push(shoulder);legs.push(hip);joints.push({joint:elbow,side:s});
    flaps.push({joint:ankle,axis:'x',bias:0,amp:.13,seed:s*.9,stride:true});
    if(s>0){
      const blade=k.bone(palm,0,-.054,.082);
      markEnemyWeapon(blade,[0,1.62,-.055],{from:[0,.028,0],width:.34});
      shaft(k,blade,.057,1.23,'relicBasalt',mobile);
      const edge=[[-.065,.22,.034],[-.141,.628,.063],[-.139,1.079,.036],[-.086,1.363,-.011],
        [0,1.632,-.054],[.115,1.31,-.013],[.143,.958,.051],[.111,.469,.072],[.073,.22,.053]];
      trimmed(k,blade,'relicSlate','relicFracture',edge,mobile,.092);
      for(const side of sides)for(let i=0;i<3;i++){
        const y=.54+i*.241,x=side*.16;
        shape(k,blade,'relicBasalt',[[x*.46,y-.11,.047,.067,.038],[x*1.44,y-.071,.08,.069,.049],
          [x*2.08,y+.045,.111,.047,.034],[x*2.48,y+.159,.101,.006,.007]],mobile,31+i,2.88);
      }
      wire(k,blade,'glow',[[0,.317,.098,.007],[-.015,.651,.115,.021],[.019,.982,.104,.02],
        [-.012,1.301,.049,.013],[0,1.613,-.025,.002]],mobile);
    }
  }
  return {body,head,legs,arms,crest:spine,pattern:'slam',
    campaign:{flaps,joints,jaw,lean:.14,neck:head},
    polishEnergy:{tint:0xf08153,shape:'embers',anchor:body,offset:[0,.41,-.21],span:[.89,.69,.65]}};
}

function edgeSpirit(k,weapon,mobile){
  material(k,'relicSilver',0x898398,.57,.52,'iron');
  material(k,'relicFrost',0xc1bac6,.62,.45,'iron');
  material(k,'relicBlackGlass',0x3d303c,.36,.69,'stone');
  const body=k.bone(k.root,0,1.29,0),head=k.bone(body,0,.69,.045),axis=k.bone(body,0,.36,-.108);
  const flaps=[],copies=[];
  const cuirass=[[0,.534,.10],[.253,.371,.067],[.182,.102,.185],
    [0,-.337,.292],[-.223,.122,.172],[-.264,.371,.014]];
  trimmed(k,body,'relicBlackGlass','relicSilver',cuirass,mobile,.092);
  trimmed(k,body,'relicBlackGlass','relicFrost',cuirass.map(([x,y,z])=>[x*.91,y+.05,-z-.12]),mobile,.075,-1);
  shape(k,head,'relicBlackGlass',[[0,-.181,.028,.102,.064],[0,-.09,.008,.138,.109],[0,.079,.016,.179,.143],
    [.013,.219,-.058,.144,.112],[.025,.329,-.129,.04,.043]],mobile,8,3.45);
  const pick=[[-.177,.095,.072],[-.092,.201,.128],[.019,.27,.17],[.131,.137,.129],
    [.151,-.027,.143],[.091,-.11,.174],[0,-.233,.207],[-.079,-.133,.149],[-.136,-.018,.126]];
  trimmed(k,head,'relicSilver','relicFrost',pick,mobile,.043);
  wire(k,head,'glow',[[-.122,.01,.155,.006],[-.047,.038,.218,.019],[.045,.039,.224,.019],
    [.118,.021,.169,.007]],mobile);
  for(let i=0;i<7;i++){
    const s=Math.sign(i-3)||1,t=(i-3)/3,width=.094+.033*(1-Math.abs(t));
    const haft=k.bone(axis,t*(.47+Math.abs(t)*.29),Math.cos(t*1.8)*.216+(i%2)*.11,-.085-Math.abs(t)*.175);
    haft.rotation.z=-t*.88;
    const h=.817+(.16*(1-Math.abs(t)));
    const shape=[[-width,-.27,.019],[-width*.88,.041,.029],[-width,.407,-.004],[.028,h,-.101],
      [width*.88,.43,-.021],[width*.81,.074,.037],[width*.52,-.273,.046]];
    trimmed(k,haft,i%2?'relicSilver':'relicBlackGlass','relicFrost',shape,mobile,.065);
    wire(k,haft,'glow',[[0,-.251,.081,.005],[-s*.009,.064,.095,.016],[s*.021,.41,.041,.014],[.023,h,-.067,.002]],mobile);
    const cross=k.bone(haft,0,-.202,.024);
    for(const n of sides)wire(k,cross,'relicSilver',mirror(n,[[.01,.032,.048,.033],[.103,.044,.079,.032],
      [.159,.129,.035,.023],[.172,.195,-.021,.004]]),mobile);
    copies.push({haft,t,z:haft.position.z,rest:haft.rotation.z});
  }
  const edge=k.bone(body,.379,.12,.187);
  markEnemyWeapon(edge,[.388,1.17,-.076],{from:[.064,.15,.041],width:.283});
  const strut=[[0,-.188,.073],[-.066,.248,.108],[.07,.55,.083],[.38,1.18,-.075],
    [.305,.546,.109],[.173,.216,.159],[.075,-.229,.139]];
  trimmed(k,edge,'relicSilver','relicFrost',strut,mobile,.071);
  flaps.push({joint:edge,axis:'y',bias:-.15,amp:.33,seed:1.2});
  return {body,head,crest:axis,pattern:'hover',campaign:{joints:[],flaps,neck:head,lean:-.10},
    vaultMechanism({beat,wind,strike,stage}){
      axis.rotation.y=.096*Math.sin(beat*.21)+wind*.20-strike*.53;
      for(const {haft,t,z,rest} of copies){
        haft.rotation.z=rest+Math.sin(beat*.84+t*2.1)*.085+wind*t*.31-strike*t*.48;
        haft.position.z=z+Math.sin(beat*.48+t)*.045-t*wind*.056+stage*t*.13;
      }
    },
    relicDress(tools){
      for(const s of sides)tools.silk(body,'崩山刀靈 · 礦煙尾跡 '+s,mirror(s,[[.076,-.03,.059,.083],
        [.122,-.339,-.071,.115],[.227,-.639,-.169,.126],[.318,-1.053,-.298,.031]]),
        {tint:0x483d55,trim:0x9e869d,lining:0x312c41,style:'woven',phase:s*.87,flex:1.38});
      return true;
    },polishEnergy:{tint:0xf6a0a0,shape:'ribbons',anchor:axis,offset:[0,.27,-.12],span:[.86,.72,.57]}};
}

function fittedBoots(k,model,mobile,{gap,wrap,leather,plate:metal,rim}){
  const ground=model.body.position.y;
  for(const s of sides){
    const hip=k.bone(k.root,s*gap,ground-.209,.012);
    const knee=k.bone(hip,s*.023,-.407,.041);
    const ankle=k.bone(knee,s*.014,-.327,.086);
    shape(k,hip,wrap,mirror(s,[[.006,.073,-.024,.126,.126],[.021,-.116,.011,.138,.119],
      [.034,-.284,-.027,.115,.102],[.028,-.419,.033,.089,.104]]),mobile,12);
    shape(k,knee,leather,mirror(s,[[0,.064,.011,.095,.093],[.014,-.092,.013,.114,.103],
      [.022,-.231,.046,.093,.078],[.016,-.348,.075,.069,.068]]),mobile,18);
    shape(k,ankle,leather,[[0,-.104,.195,.079,.080],[s*.012,-.086,.115,.106,.116],
      [s*.012,-.039,.05,.094,.089],[s*.01,.035,-.021,.076,.067]],mobile,49,3.1);
    trimmed(k,knee,metal,rim,mirror(s,[[.012,.131,.119],[.103,.088,.091],[.128,-.038,.070],
      [.121,-.179,.119],[.052,-.286,.151],[-.037,-.245,.143],[-.064,-.084,.114]]),mobile,.047);
    trimmed(k,ankle,metal,rim,mirror(s,[[.006,-.011,.107],[.082,-.034,.097],[.088,-.086,.184],
      [.035,-.105,.257],[-.051,-.105,.241],[-.087,-.085,.165],[-.056,-.037,.119]]),mobile,.038);
    for(let i=0;i<3;i++)wire(k,knee,rim,mirror(s,[[.091,-.063-i*.073,-.021,.009],[.097,-.068-i*.072,-.076,.013],
      [.043,-.079-i*.073,-.103,.012],[-.062,-.076-i*.075,-.049,.004]]),mobile);
    model.legs.push(hip);
    model.campaign.flaps.push({joint:knee,axis:'x',bias:-.06,amp:.16,seed:s*.91,stride:true},
      {joint:ankle,axis:'x',bias:.036,amp:-.083,seed:s*1.18,stride:true});
  }
}

function hanCaptain(k,weapon,mobile,fighter){
  material(k,'relicHanSteel',0x48515b,.57,.49,'iron');
  material(k,'relicHanTrim',0x9fa7a1,.61,.51,'bronze');
  material(k,'relicHanWood',0x4f3b38,.16,.72,'hide');
  material(k,'relicHanInner',0x343b46,.10,.80,'cloth');
  const bodySize=.405;
  const model=fighter(k,{broad:bodySize,ground:1.10,neck:.84,armLength:.76,style:'ritual',finish:'relicHanInner',legs:false,mobile,
    portrait(k,head){
      shape(k,head,'relicHanWood',[[0,-.165,.05,.118,.085],[0,-.088,.022,.153,.104],[0,.050,.017,.166,.136],
        [0,.174,-.022,.152,.132],[0,.212,-.067,.122,.096]],mobile,41,2.12);
      const visor=[[-.174,.09,.11],[-.095,.209,.155],[.089,.248,.151],[.181,.143,.094],
        [.155,.072,.118],[.016,.093,.171],[-.127,.062,.151]];
      trimmed(k,head,'relicHanSteel','relicHanTrim',visor,mobile,.057);
      const plume=k.bone(head,.014,.229,-.029);
      shape(k,plume,'relicHanWood',[[0,-.023,.024,.069,.052],[.016,.069,-.024,.082,.075],
        [.079,.187,-.177,.066,.055],[.174,.145,-.326,.007,.012]],mobile,12);
      for(const s of sides){
        wire(k,head,'glow',mirror(s,[[.034,.031,.149,.008],[.089,.044,.161,.014],
          [.127,.049,.136,.013],[.144,.048,.108,.003]]),mobile);
        for(let i=0;i<3;i++)trimmed(k,head,'relicHanSteel','relicHanTrim',mirror(s,[[.108,.026-i*.072,.081],
          [.181,.062-i*.071,.017],[.209,.003-i*.078,-.105],[.169,-.061-i*.07,-.129],
          [.095,-.068-i*.068,-.085]]),mobile,.033);
      }
      const jaw=k.bone(head,0,-.113,.105);
      for(let i=-2;i<=2;i++)shape(k,jaw,'relicHanInner',[[i*.022,.025,.061,.032,.024],[i*.022,-.037,.109,.035,.030],
        [i*.024,-.154,.095,.029,.021],[i*.025,-.231-Math.cos(i)*.045,.057,.004,.004]],mobile,61+i,2.15);
      return jaw;
    },
    weapon(k,body,back,head,grips,flaps){
      for(const s of sides){
        for(let i=0;i<4;i++){
          const y=.49-i*.115;
          const contour=mirror(s,[[.019,y+.062,.295],[.167,y+.083,.231],[.345,y+.062,.161],
            [.373,y-.036,.068],[.273,y-.096,.181],[.127,y-.121,.29],[.019,y-.088,.343]]);
          trimmed(k,body,i%2?'relicHanInner':'relicHanSteel','relicHanTrim',contour,mobile,.048);
          jewel(k,body,'trim',s*.127,y-.021,.306,.023,.025,.016);
        }
        const pauldron=grips[s>0?1:0].parent.parent;
        for(let i=0;i<3;i++)trimmed(k,pauldron,i%2?'relicHanInner':'relicHanSteel','relicHanTrim',mirror(s,[[.019,.115-i*.086,.108],
          [.164,.151-i*.091,.081],[.286,.077-i*.066,-.044],[.215,-.044-i*.091,-.113],
          [.066,-.076-i*.067,.087]]),mobile,.052);
      }
      const rack=k.bone(back,-.026,.34,-.084);
      for(let i=-1;i<=1;i++){
        const rod=k.bone(rack,i*.112,.018-i*.093,-.085-i*.01);
        rod.rotation.z=-.603+i*.071;
        shaft(k,rod,.028,.57,'relicHanWood',mobile);
        shape(k,rod,'relicHanTrim',[[0,.36,.022,.037,.035],[0,.557,.016,.062,.03],
          [0,.712,-.007,.049,.023],[.038,.878,-.033,.004,.005]],mobile,51+i,2.77);
      }
      trimmed(k,rack,'relicHanSteel','relicHanTrim',[[-.222,.13,.004],[-.128,.26,-.054],[.095,.21,-.072],
        [.238,.073,.008],[.122,-.061,-.043],[-.11,-.071,-.031]],mobile,.061,-1);
      flaps.push({joint:rack,axis:'y',bias:.13,amp:.18,seed:3.7});
      const spear=k.bone(grips[1],0,-.072,.091);
      markEnemyWeapon(spear,[.061,1.71,-.071],{from:[0,.47,.009],width:.203});
      shaft(k,spear,.049,1.45,'relicHanWood',mobile);
      const point=[[-.094,1.127,.064],[-.139,1.266,.044],[-.057,1.53,-.023],[.061,1.705,-.071],
        [.119,1.546,-.023],[.138,1.324,.033],[.062,1.135,.063],[.003,1.072,.086]];
      trimmed(k,spear,'relicHanTrim','edge',point,mobile,.057);
      wire(k,spear,'glow',[[0,1.113,.115,.006],[.032,1.31,.099,.018],[.054,1.502,.046,.013],[.061,1.696,-.037,.002]],mobile);
    },
  });
  fittedBoots(k,model,mobile,{gap:.22,wrap:'relicHanInner',leather:'relicHanWood',plate:'relicHanSteel',rim:'relicHanTrim'});
  model.relicDress=tools=>{
    for(const s of sides){
      tools.silk(model.body,'漢營槍督 · 軍袍 '+s,mirror(s,[[.130,.043,.31,.100],[.213,-.262,.367,.144],
        [.266,-.570,.411,.212],[.297,-.927,.487,.080]]),{tint:0x454957,trim:0xb0a99b,lining:0x312e3e,style:'woven',phase:s*.94,flex:.94});
      tools.silk(model.body,'漢營槍督 · 指揮旗 '+s,mirror(s,[[.176,.600,-.242,.064],[.275,.304,-.356,.078],
        [.404,-.186,-.539,.115],[.529,-.722,-.678,.034]]),{tint:0x3d5156,trim:0x91a19b,lining:0x392d3e,style:'woven',phase:s*1.33,flex:1.32});
    }
    return true;
  };
  model.polishEnergy={tint:0x94b8ce,shape:'bolts',anchor:model.body,offset:[0,.52,-.092],span:[.64,.83,.49]};
  return model;
}

function templeWarden(k,weapon,mobile,fighter){
  material(k,'relicTempleBronze',0x9b754a,.61,.44,'bronze');
  material(k,'relicTempleLacquer',0x67443d,.18,.63,'hide');
  material(k,'relicTempleVoid',0x2a262d,.18,.67,'iron');
  material(k,'relicTempleIvory',0xb0a086,.07,.79,'bone');
  const model=fighter(k,{broad:.47,ground:1.09,neck:.76,armLength:.722,style:'ritual',finish:'relicTempleLacquer',legs:false,mobile,
    portrait(k,head){
      shape(k,head,'relicTempleVoid',[[0,-.218,.073,.135,.095],[0,-.074,.021,.172,.141],[0,.078,-.011,.203,.147],
        [0,.219,-.052,.196,.156],[0,.374,-.112,.118,.101]],mobile,47,2.53);
      const face=[[-.134,.101,.087],[-.026,.151,.111],[.119,.115,.097],[.151,-.002,.133],[.107,-.216,.164],
        [.007,-.253,.172],[-.107,-.198,.164],[-.161,-.025,.132]];
      trimmed(k,head,'relicTempleIvory','relicTempleBronze',face,mobile,.035);
      for(const s of sides){
        wire(k,head,'relicTempleVoid',mirror(s,[[.032,.032,.158,.005],[.076,.041,.169,.016],
          [.115,.051,.148,.012],[.135,.036,.134,.003]]),mobile);
        wire(k,head,'relicTempleBronze',mirror(s,[[.148,.177,.064],[.174,.111,.134],
          [.184,-.032,.145],[.142,-.149,.179],[.094,-.25,.197]].map(([x,y,z],i)=>[x,y,z,[.015,.028,.026,.017,.007][i]])),mobile);
      }
      const jaw=k.bone(head,0,-.17,.148);
      wire(k,jaw,'relicTempleVoid',[[-.073,.011,.046,.004],[0,-.012,.065,.012],[.073,.011,.046,.004]],mobile);
      jewel(k,head,'glow',0,.119,.153,.035,.054,.021);
      return jaw;
    },
    weapon(k,body,back,head,grips,flaps){
      const pagoda=k.bone(back,0,.28,-.187);
      for(let i=0;i<3;i++){
        const tower=k.bone(pagoda,0,.143+i*.197,-.02-i*.021);
        const r=.398-i*.09;
        shape(k,tower,'relicTempleLacquer',[[0,-.095,-.035,r*.77,r*.57],[0,.015,-.033,r*.87,r*.66],
          [0,.067,-.037,r*.65,r*.48]],mobile,47+i,3.2);
        for(let l=0;l<8;l++){
          const a=l*TAU/8,b=(l+1)*TAU/8,x=Math.sin(a),z=Math.cos(a),u=Math.sin(b),v=Math.cos(b);
          const roof=[[x*r*.48,.121,z*r*.43],[x*r*.89,.04,z*r*.72],[x*r*1.15,.015,z*r*.95],
            [u*r*1.14,.019,v*r*.96],[u*r*.90,.045,v*r*.71],[u*r*.45,.119,v*r*.43]];
          trimmed(k,tower,l%2?'relicTempleBronze':'relicTempleVoid','trim',roof,mobile,.041);
          if(l%2===0)jewel(k,tower,'glow',x*r*.97,-.049,z*r*.88,.023,.030,.025);
        }
      }
      flaps.push({joint:pagoda,axis:'x',bias:-.073,amp:.09,seed:3.6});
      seal(k,body,'relicTempleBronze',.197,.039,mobile,.355);
      seal(k,body,'relicTempleVoid',.148,.024,mobile,.381);
      jewel(k,body,'glow',0,0,.405,.097,.097,.067);
      for(const s of sides){
        const shoulder=grips[s>0?1:0].parent.parent;
        const wing=mirror(s,[[.035,.084,.121],[.147,.183,.074],[.281,.172,-.056],
          [.341,.058,-.167],[.242,-.069,-.109],[.137,-.124,.055],[.040,-.072,.151]]);
        trimmed(k,shoulder,'relicTempleLacquer','relicTempleBronze',wing,mobile,.072);
        for(let i=0;i<3;i++)wire(k,body,'relicTempleBronze',mirror(s,[[.05,.518-i*.129,.296,.013],
          [.187,.521-i*.119,.304,.032],[.317,.437-i*.102,.237,.026],[.362,.356-i*.11,.134,.004]]),mobile);
      }
      const staff=k.bone(grips[1],.077,-.067,.079);
      staff.rotation.z=-.24;
      markEnemyWeapon(staff,[0,1.64,-.08],{from:[0,.39,.028],width:.25,aim:false});
      shaft(k,staff,.056,1.39,'relicTempleLacquer',mobile);
      const urn=k.bone(staff,0,1.197,-.066);
      seal(k,urn,'relicTempleBronze',.214,.024,mobile);
      seal(k,urn,'trim',.146,.018,mobile,.041);
      shape(k,urn,'relicTempleIvory',[[0,-.179,0,.058,.055],[0,-.036,.015,.107,.079],
        [0,.11,.011,.094,.081],[0,.218,-.018,.04,.036]],mobile,64,2.22);
      for(const s of sides)wire(k,urn,'relicTempleBronze',mirror(s,[[.025,-.173,.041,.021],
        [.152,-.085,.087,.027],[.184,.091,.046,.032],[.103,.231,-.02,.028],[.046,.274,-.039,.007]]),mobile);
      jewel(k,urn,'glow',0,.122,.104,.058,.096,.036);
    },
  });
  fittedBoots(k,model,mobile,{gap:.27,wrap:'relicTempleLacquer',leather:'relicTempleVoid',plate:'relicTempleLacquer',rim:'relicTempleBronze'});
  model.relicDress=tools=>{
    for(const s of sides)for(let row=0;row<2;row++){
      const depth=row===0?.296:-.303;
      tools.silk(model.body,'寶塔戒律使 · 廟紋綬 '+s+' '+row,mirror(s,[[.128,.172,depth,.075],
        [.183,-.119,depth+s*.031,.136],[.231,-.418,depth+.093,.168],[.348,-.927,depth-.14,.048]]),
        {tint:0x6c4843,trim:0xc39a72,lining:0x4c3c48,style:'woven',phase:s*.92+row*.77,flex:.95+row*.21});
    }
    return true;
  };
  model.polishEnergy={tint:0xf4b66c,shape:'sigils',anchor:model.body,offset:[0,.48,-.287],span:[.82,.72,.61]};
  return model;
}

const hunts={'true-seven':stoneSovereign,'seven-blade':edgeSpirit,'han-spear':hanCaptain,'treasure-staff':templeWarden};

export function sculptEarthRelicHunter(k,weapon,mobile,fighter){
  const sculpt=hunts[weapon.id];
  if(!sculpt)return null;
  const model=sculpt(k,weapon,mobile,fighter);
  model.earthRelic=weapon.id;
  return model;
}
