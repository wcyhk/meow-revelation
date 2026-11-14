import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const offset=(at,path,direction=1)=>path.map(([x,y,z,...rest])=>[
  at[0]+x*direction,at[1]+y,at[2]+z*direction,...rest,
]);

// Head details and cloth are fitted in each original rig's local coordinates.
const armour={
  m003:{mask:'fang',metal:'steel',silk:'裂口獵皮',tint:0x4b5244,trim:0x73644d,hems:[[.29,.43,-.23,.10],[.61,.12,-.39,.13],[.67,-.31,-.53,.12],[.72,-.66,-.60,.062]],span:.62,crest:[.16,.105,-.07,.32]},
  m004:{mask:'plates',metal:'steel',silk:'騎槍手燕尾旗',tint:0x435770,hems:[[.16,.61,-.17,.052],[.22,.38,-.34,.082],[.34,.09,-.58,.090],[.39,-.22,-.75,.021]],span:.35,crest:[.13,.17,-.08,.24]},
  m006:{mask:'brow',metal:'ochre',silk:'赤賊掩面束帶',tint:0x773b36,hems:[[.127,-.015,-.09,.043],[.22,-.16,-.24,.067],[.36,-.31,-.41,.056],[.42,-.51,-.54,.019]],anchor:'head',span:.39,crest:[.12,.09,-.04,.18]},
  m008:{mask:'jewel',metal:'rind',silk:'翠華祭衣',tint:0x416046,hems:[[.21,.72,-.158,.061],[.30,.34,-.324,.11],[.34,-.27,-.49,.138],[.48,-.91,-.72,.074]],span:.29,crest:[.105,.16,-.06,.16]},
  m009:{mask:'bark',metal:'jade',silk:'句芒葉纓',tint:0x456641,trim:0x9c9b5c,hems:[[.18,.26,-.06,.048],[.25,.10,-.20,.077],[.40,-.19,-.36,.069],[.50,-.55,-.48,.025]],anchor:'head',span:.33,crest:[.17,.20,-.08,.31]},
  m010:{mask:'diadem',metal:'jade',silk:'風運飄帶',tint:0x4b6d57,hems:[[.18,.64,-.18,.070],[.27,.27,-.38,.102],[.41,-.10,-.58,.105],[.51,-.70,-.79,.044]],span:.37,crest:[.12,.14,-.06,.22]},
  m011:{mask:'brow',metal:'clay',silk:'炎運腕旗',tint:0x982e21,hems:[[.29,.53,-.16,.078],[.43,.26,-.26,.112],[.47,-.14,-.43,.11],[.53,-.50,-.52,.068]],span:.46,crest:[.13,.04,-.055,.23]},
  m012:{mask:'jewel',metal:'cobalt',silk:'水運霜帛',tint:0x5c86a2,trim:0xb4d6db,hems:[[.22,.62,-.18,.061],[.29,.31,-.34,.092],[.38,-.22,-.57,.12],[.46,-.69,-.81,.038]],span:.35,crest:[.12,.14,-.053,.23]},
  m013:{mask:'diadem',metal:'brass',silk:'雷運銅鈴綬',tint:0x825744,hems:[[.24,.55,-.15,.05],[.37,.15,-.32,.082],[.43,-.28,-.52,.059],[.46,-.91,-.69,.034]],span:.33,crest:[.122,.149,-.07,.30]},
  m016:{mask:'plates',metal:'rind',silk:'裹鐮鎖甲裙',tint:0x945733,hems:[[.20,.21,.234,.097],[.30,-.037,.284,.129],[.40,-.33,.38,.135],[.43,-.69,.48,.098]],span:.40,crest:[.132,.18,-.09,.28]},
  m017:{mask:'fang',metal:'rind',silk:'魔奧朱金束帛',tint:0x8c643f,hems:[[.20,.72,-.218,.081],[.29,.45,-.326,.121],[.34,-.15,-.49,.103],[.44,-.63,-.64,.047]],span:.39,crest:[.138,.15,-.062,.27]},
  m018:{mask:'plates',metal:'ochre',silk:'裂紋龍袍',tint:0x723125,hems:[[.24,.71,-.25,.077],[.35,.39,-.41,.138],[.43,-.20,-.57,.167],[.43,-.91,-.75,.126]],span:.43,crest:[.13,.19,-.08,.22]},
  m019:{mask:'diadem',metal:'ivory',silk:'冰龍旌帶',tint:0x516f88,trim:0xbbc3ab,hems:[[.145,.59,-.15,.045],[.26,.33,-.305,.076],[.35,-.055,-.49,.092],[.45,-.51,-.80,.043]],span:.30,crest:[.125,.155,-.085,.20]},
  m020:{mask:'plates',metal:'cobalt',silk:'楚軍斷氅',tint:0x4a516b,hems:[[.22,.67,-.19,.083],[.33,.34,-.39,.130],[.46,-.13,-.55,.153],[.56,-.89,-.68,.096]],span:.44,crest:[.14,.21,-.075,.26]},
  m021:{mask:'jewel',metal:'rind',silk:'喪魂白帛',tint:0xa5b0aa,trim:0x679a99,hems:[[.242,.13,-.155,.064],[.35,-.20,-.335,.083],[.45,-.55,-.52,.073],[.54,-.94,-.71,.035]],anchor:'head',span:.28,crest:[.135,.102,-.055,.23]},
  m023:{mask:'fang',metal:'ochre',silk:'屠翼的斷皮圍裙',tint:0x3f4b37,hems:[[.31,.03,.305,.096],[.44,-.21,.377,.15],[.47,-.52,.39,.128],[.42,-.86,.49,.079]],span:.61,crest:[.157,.090,-.070,.27]},
  m027:{mask:'bark',metal:'rust',silk:'破滅者暗紅垂裳',tint:0x942b24,hems:[[.37,.12,.397,.080],[.53,-.13,.475,.131],[.60,-.43,.514,.123],[.63,-.72,.584,.053]],span:.66,crest:[.172,.19,-.05,.27]},
  m028:{mask:'jewel',metal:'teal',silk:'狐仙的引雷冠纓',tint:0x9a6d45,trim:0xc1ad79,hems:[[.17,.072,-.083,.049],[.29,-.023,-.232,.077],[.41,-.28,-.37,.083],[.49,-.59,-.49,.038]],anchor:'head',span:.36,crest:[.13,.136,-.057,.21]},
  m029:{mask:'brow',metal:'steel',silk:'鐵拐葫蘆繫繩',tint:0x7f4c37,hems:[[.19,.46,-.15,.038],[.32,.13,-.30,.056],[.44,-.21,-.48,.049],[.60,-.38,-.62,.027]],span:.36,crest:[.13,.13,-.05,.18]},
  m031:{mask:'diadem',metal:'brass',silk:'公公官服雲肩',tint:0x833b36,hems:[[.23,.625,-.19,.079],[.35,.315,-.37,.123],[.455,-.19,-.53,.132],[.50,-.73,-.65,.100]],span:.41,crest:[.135,.18,-.063,.27]},
  m032:{mask:'jewel',metal:'cobalt',silk:'藍菜花湖藍飄袖',tint:0x456f97,trim:0x94bec4,hems:[[.215,.54,-.14,.08],[.345,.26,-.29,.115],[.440,-.14,-.48,.151],[.55,-.61,-.66,.092]],span:.30,crest:[.128,.12,-.06,.19]},
  m033:{mask:'fang',metal:'red',silk:'妖刀姬白紅寬袖',tint:0xaf4542,hems:[[.23,.46,-.108,.075],[.34,.19,-.285,.137],[.44,-.14,-.418,.150],[.63,-.42,-.61,.106]],span:.31,crest:[.141,.15,-.06,.23]},
  m034:{mask:'jewel',metal:'ivory',silk:'白面狐仙霧白襟帛',tint:0xa7b3c0,trim:0xc5aa80,hems:[[.18,.53,.20,.063],[.28,.31,.24,.093],[.34,-.16,.327,.080],[.49,-.82,.49,.035]],span:.36,crest:[.13,.139,-.069,.20]},
  m035:{mask:'fang',metal:'clay',silk:'火怨炎鬃',tint:0x964333,hems:[[.15,.18,-.14,.067],[.23,.035,-.26,.095],[.32,-.26,-.46,.111],[.36,-.63,-.62,.049]],anchor:'head',span:.43,crest:[.151,.121,-.045,.27]},
  m036:{mask:'plates',metal:'cobalt',silk:'水怨凍結垂絲',tint:0x7b99b6,trim:0xa9bfbf,hems:[[.23,.53,-.24,.065],[.38,.24,-.41,.10],[.40,-.31,-.51,.151],[.41,-1.02,-.70,.061]],span:.41,crest:[.139,.185,-.055,.27]},
  m037:{mask:'bark',metal:'moss',silk:'風怨散葉披幟',tint:0x51684f,hems:[[.26,.44,-.19,.074],[.41,.16,-.38,.122],[.53,-.12,-.59,.083],[.64,-.57,-1.00,.040]],span:.44,crest:[.144,.13,-.05,.25]},
  m038:{mask:'diadem',metal:'brass',silk:'雷怨朱銅纓',tint:0x956b42,hems:[[.25,.63,-.225,.046],[.39,.24,-.40,.064],[.48,-.27,-.61,.095],[.50,-.90,-.77,.061]],span:.45,crest:[.15,.160,-.057,.23]},
  m039:{mask:'diadem',metal:'brass',silk:'樓陀羅飄髮',tint:0x425d77,trim:0x93a7a4,hems:[[.129,.15,-.18,.073],[.233,-.089,-.37,.105],[.36,-.34,-.54,.108],[.51,-.563,-.71,.067]],anchor:'head',span:.39,crest:[.146,.18,-.066,.24]},
  m040:{mask:'jewel',metal:'jade',silk:'伶人青襟打結帶',tint:0x547a77,trim:0xc5b99d,hems:[[.166,.457,.24,.054],[.265,.12,.28,.071],[.36,-.26,.37,.082],[.44,-.58,.51,.033]],span:.34,crest:[.12,.16,-.063,.20]},
  m041:{mask:'fang',metal:'jade',silk:'夜叉冠後獸鬃',tint:0x6a6346,hems:[[.161,.102,-.09,.088],[.32,-.04,-.205,.102],[.37,-.24,-.33,.113],[.49,-.61,-.43,.055]],anchor:'head',span:.36,crest:[.153,.086,-.066,.29]},
  m042:{mask:'brow',metal:'ochre',silk:'伐由戰車風向旗',tint:0x8b5035,hems:[[.22,.23,-.44,.066],[.36,.13,-.58,.129],[.51,-.10,-.78,.091],[.64,-.28,-.96,.047]],span:.35,crest:[.14,.13,-.064,.24]},
  m043:{mask:'fang',metal:'black',silk:'雷怨望束甲皮',tint:0x473851,hems:[[.49,.34,-.188,.069],[.64,.09,-.315,.103],[.73,-.27,-.422,.090],[.72,-.61,-.54,.074]],span:.62,crest:[.161,.14,-.07,.29]},
  m044:{mask:'plates',metal:'cobalt',silk:'水怨望脊披',tint:0x55697f,hems:[[.42,.48,-.24,.082],[.59,.22,-.34,.130],[.66,-.05,-.51,.139],[.54,-.58,-.69,.074]],span:.61,crest:[.160,.17,-.056,.25]},
  m045:{mask:'bark',metal:'moss',silk:'風怨望肘後裂帶',tint:0x4d6245,hems:[[.48,.27,-.205,.063],[.65,.101,-.33,.090],[.78,-.14,-.456,.083],[.85,-.47,-.61,.037]],span:.63,crest:[.156,.15,-.08,.24]},
  m046:{mask:'brow',metal:'clay',silk:'火怨望熔痕腰綬',tint:0x984334,hems:[[.355,.036,.333,.078],[.49,-.21,.405,.123],[.53,-.47,.466,.128],[.59,-.72,.50,.051]],span:.64,crest:[.16,.15,-.058,.25]},
  m047:{mask:'diadem',metal:'ochre',silk:'雷絕望護頸旒',tint:0x7d6d4b,hems:[[.168,.178,-.092,.064],[.279,.03,-.244,.10],[.34,-.20,-.382,.113],[.42,-.47,-.54,.076]],anchor:'head',span:.62,crest:[.155,.167,-.055,.27]},
  m048:{mask:'plates',metal:'steel',silk:'水絕望霜界披掛',tint:0x73899e,trim:0xafced3,hems:[[.37,.39,-.28,.10],[.46,.14,-.41,.139],[.52,-.14,-.57,.169],[.55,-.73,-.74,.119]],span:.60,crest:[.163,.12,-.065,.32]},
  m049:{mask:'bark',metal:'jade',silk:'風絕望橡葉護腰',tint:0x506b4a,hems:[[.35,-.02,.306,.067],[.50,-.16,.40,.120],[.69,-.37,.42,.117],[.66,-.72,.44,.042]],span:.64,crest:[.149,.16,-.084,.24]},
  m050:{mask:'fang',metal:'clay',silk:'火絕望冠後焦幟',tint:0x7d3127,hems:[[.26,.35,-.24,.086],[.45,.13,-.39,.132],[.63,-.17,-.57,.15],[.73,-.74,-.70,.060]],span:.62,crest:[.172,.13,-.05,.27]},
  m051:{mask:'plates',metal:'ochre',silk:'復仇者裂邊戰裙',tint:0x882e37,hems:[[.214,.217,.221,.063],[.325,-.06,.296,.088],[.405,-.29,.367,.097],[.46,-.63,.43,.053]],span:.37,crest:[.147,.13,-.05,.22]},
  m056:{mask:'jewel',metal:'jade',silk:'復仇者小玲荊藤耳帶',tint:0x84719b,trim:0xa9b78a,hems:[[.156,.10,-.099,.051],[.32,-.049,-.253,.08],[.466,-.33,-.395,.09],[.62,-.72,-.53,.043]],anchor:'head',span:.34,crest:[.12,.126,-.061,.20]},
};

const creatures={
  m001:{form:'hood',metal:'rind',shell:'edge',tint:0x805968,name:'紫蛇背顎軟鰭',span:[.26,.07,-.065],ridge:[[.09,.12,-.01,.036],[.22,.19,-.04,.081],[.34,.12,-.24,.102],[.31,-.11,-.39,.029]]},
  m002:{form:'hood',metal:'rind',shell:'trim',tint:0x795b36,name:'邪蟒發電頸膜',span:[.31,.106,-.036],ridge:[[.13,.151,.02,.056],[.32,.287,-.106,.088],[.46,.214,-.21,.121],[.58,-.05,-.34,.019]]},
  m005:{form:'ruff',metal:'edge',shell:'trim',tint:0x99948c,name:'白熊耳下冬毛',span:[.275,.093,.09],ridge:[[.29,.18,.052,.082],[.38,-.015,-.041,.11],[.43,-.245,-.12,.131],[.43,-.40,-.242,.063]]},
  m007:{form:'horn',metal:'clay',shell:'brass',tint:0x8a3424,name:'火龍顎後烈焰褶膜',span:[.21,.061,.093],ridge:[[.18,.08,.061,.075],[.306,.181,-.106,.097],[.402,.09,-.327,.118],[.46,-.156,-.49,.029]]},
  m014:{form:'ruff',metal:'edge',shell:'trim',tint:0x533d3f,name:'黑麟分叉頸鬃',span:[.32,.09,.098],ridge:[[.33,.27,.011,.105],[.47,.09,-.17,.141],[.58,-.19,-.36,.105],[.675,-.338,-.59,.031]]},
  m015:{form:'feather',metal:'body',shell:'edge',tint:0x9e3d26,name:'紅雀朱紅次翎',span:[.22,.119,-.073],ridge:[[.18,.06,-.20,.091],[.31,.125,-.405,.143],[.43,.18,-.64,.134],[.65,.293,-.89,.043]]},
  m022:{form:'shell',metal:'black',shell:'steel',tint:0x6a767f,name:'玄武冰翅頸褶',span:[.15,.08,.078],ridge:[[.151,.105,.04,.057],[.248,.046,-.067,.089],[.331,-.054,-.25,.106],[.412,-.084,-.36,.045]]},
  m024:{form:'horn',metal:'moss',shell:'ochre',tint:0x5c6944,name:'毒龍頸囊',span:[.208,.055,.09],ridge:[[.19,.079,.071,.062],[.335,.024,-.025,.108],[.405,-.054,-.25,.132],[.424,-.214,-.417,.062]]},
  m030:{form:'membrane',metal:'black',shell:'brass',tint:0x583128,name:'九影耳翼與喉膜',span:[.167,.091,.084],ridge:[[.166,.122,.034,.051],[.33,.281,-.112,.12],[.406,.125,-.297,.146],[.421,-.183,-.455,.033]]},
  m052:{form:'ruff',metal:'steel',shell:'ivory',tint:0x798b9c,name:'冰精靈白色腮毛',span:[.16,-.019,.19],ridge:[[.176,.025,.17,.054],[.263,-.020,.014,.103],[.348,-.14,-.182,.092],[.408,-.314,-.33,.034]]},
  m053:{form:'horn',metal:'clay',shell:'brass',tint:0x764132,name:'火鎮墓獸裂鬃',span:[.16,-.002,.176],ridge:[[.18,.051,.131,.047],[.25,.012,-.051,.082],[.356,-.09,-.203,.135],[.47,-.214,-.32,.027]]},
  m054:{form:'membrane',metal:'cobalt',shell:'brass',tint:0x576493,name:'雷鎮墓獸頸下放電膜',span:[.17,.012,.182],ridge:[[.17,.052,.119,.06],[.218,-.019,-.056,.093],[.296,-.093,-.22,.116],[.355,-.23,-.37,.038]]},
  m055:{form:'hood',metal:'jade',shell:'steel',tint:0x557d80,name:'古龍下頜水鬚',span:[.213,.062,.116],ridge:[[.16,-.084,.21,.038],[.28,-.09,.36,.063],[.405,-.233,.465,.081],[.51,-.38,.34,.011]]},
};

const rays={
  plates:[[.014,.039,.055],[.057,.075,.028],[.087,.028,-.048],[.065,-.054,-.12],[.032,-.108,-.129]],
  brow:[[0,.005,.054],[.047,.045,.03],[.085,.046,-.021],[.116,.003,-.086],[.082,-.077,-.106]],
  diadem:[[-.008,-.018,.085],[.039,.076,.037],[.074,.135,-.020],[.116,.188,-.101],[.067,.049,-.111]],
  fang:[[-.019,-.02,.060],[.046,.048,.052],[.09,.027,-.044],[.11,-.057,-.125],[.054,-.143,-.136]],
  bark:[[-.015,-.07,.072],[.042,-.008,.064],[.061,.061,-.027],[.135,.107,-.09],[.101,-.038,-.151]],
  jewel:[[-.027,.021,.066],[.031,.072,.039],[.077,.041,-.017],[.101,-.011,-.094],[.044,-.066,-.104]],
};

function metal(k,name,fallback){return k.materials[name]?name:fallback;}
function panel(k,part,finish,outline,depth=.027){k.sculpt.plate(part,finish,outline,depth,depth*.29);}
function sweep(k,part,finish,points,mobile){
  k.sculpt.sweep(part,finish,points,{steps:mobile?9:13,sides:mobile?6:8,ridge:.17});
}
function shaped(k,part,finish,points,mobile,seed){
  k.geometry(part,finish,sculptVolume(points,{sides:mobile?7:10,rings:mobile?11:17,section:2.38,ridge:.23,seed}));
}

const reliefs={
  m008:{seal:'pagoda',size:[.107,.165],at:[0,.54,-.25],finish:'rind',inlay:'edge'},
  m016:{seal:'eye',size:[.147,.125],at:[0,.53,.285],finish:'rind',inlay:'deep'},
  m017:{seal:'gate',size:[.192,.15],at:[0,.53,-.29],finish:'rind',inlay:'deep'},
  m018:{seal:'fang',size:[.185,.15],at:[0,.51,-.32],finish:'ochre',inlay:'red'},
  m020:{seal:'gate',size:[.189,.13],at:[0,.43,.337],finish:'steel',inlay:'cobalt'},
  m023:{seal:'eye',size:[.155,.13],at:[0,.23,.365],finish:'black',inlay:'clay'},
  m027:{seal:'fang',size:[.183,.178],at:[0,.16,.48],finish:'rust',inlay:'deep'},
  m031:{seal:'pagoda',size:[.129,.14],at:[0,.564,-.31],finish:'brass',inlay:'red'},
  m032:{seal:'lotus',size:[.167,.10],at:[0,.447,-.26],finish:'cobalt',inlay:'steel'},
  m033:{seal:'eye',size:[.136,.11],at:[0,.285,.264],finish:'red',inlay:'brass'},
  m035:{seal:'fang',size:[.162,.128],at:[0,.47,.329],finish:'clay',inlay:'ochre'},
  m036:{seal:'lotus',size:[.142,.13],at:[0,.41,.34],finish:'cobalt',inlay:'steel'},
  m037:{seal:'gate',size:[.15,.105],at:[0,.45,.328],finish:'moss',inlay:'ochre'},
  m038:{seal:'pagoda',size:[.126,.112],at:[0,.505,.329],finish:'brass',inlay:'black'},
  m039:{seal:'eye',size:[.162,.135],at:[0,.481,.264],finish:'cobalt',inlay:'brass'},
  m040:{seal:'lotus',size:[.112,.111],at:[0,.431,-.30],finish:'ochre',inlay:'jade'},
  m041:{seal:'fang',size:[.129,.155],at:[0,.41,.29],finish:'jade',inlay:'ochre'},
  m043:{seal:'eye',size:[.208,.12],at:[0,.335,.409],finish:'black',inlay:'brass'},
  m044:{seal:'lotus',size:[.172,.154],at:[0,.29,.429],finish:'cobalt',inlay:'steel'},
  m045:{seal:'fang',size:[.223,.123],at:[0,.33,.410],finish:'moss',inlay:'jade'},
  m046:{seal:'gate',size:[.203,.155],at:[0,.315,.407],finish:'clay',inlay:'black'},
  m047:{seal:'pagoda',size:[.206,.165],at:[0,.29,.428],finish:'ochre',inlay:'brass'},
  m048:{seal:'lotus',size:[.217,.142],at:[0,.28,.431],finish:'cobalt',inlay:'steel'},
  m049:{seal:'eye',size:[.174,.135],at:[0,.35,.417],finish:'jade',inlay:'moss'},
  m050:{seal:'fang',size:[.215,.175],at:[0,.28,.415],finish:'clay',inlay:'black'},
  m051:{seal:'gate',size:[.146,.159],at:[0,.491,-.273],finish:'ochre',inlay:'red'},
  m056:{seal:'lotus',size:[.129,.10],at:[0,.432,.264],finish:'jade',inlay:'lilac'},
};

const ornaments={
  fang:[[0,-.95],[.61,-.48],[.92,-.1],[.83,.70],[.38,.48],[.22,.16],[0,.27]],
  pagoda:[[0,-.93],[.46,-.73],[.57,-.27],[.91,.17],[.57,.43],[.44,.74],[0,1.02]],
  eye:[[0,-.68],[.40,-.48],[.82,-.17],[1,.12],[.72,.33],[.36,.52],[0,.55]],
  gate:[[0,-.88],[.57,-.69],[.94,-.21],[.93,.48],[.67,.84],[.38,.67],[0,.92]],
  lotus:[[0,-.78],[.46,-.57],[.87,-.32],[1,.42],[.66,.24],[.40,.71],[0,1.01]],
};

function relief(k,upper,mobile,design){
  const pattern=ornaments[design.seal];
  const direction=design.at[2]>0?1:-1;
  const mount=path=>offset(design.at,path,direction);
  const [w,h]=design.size;
  const side=pattern.map(([x,y])=>[w*x,h*y,.026-.020*x*x]);
  const outline=[...side,...mirror(-1,side.slice(1,-1)).reverse()];
  panel(k,upper,metal(k,design.finish,'body'),mount(outline),.034);
  panel(k,upper,metal(k,design.inlay,'deep'),mount(outline.map(([x,y,z])=>[x*.74,y*.75,z+.026])),.024);
  for(const sign of sides){
    const keel=mirror(sign,side.slice(1,-1));
    sweep(k,upper,'trim',mount(keel.map(([x,y,z],i)=>[x*.97,y*.95,z+.02,i===0||i===4?.006:.013])),mobile);
    sweep(k,upper,'edge',mount(mirror(sign,[[w*.066,-h*.47,.052,.006],[w*.27,-h*.22,.063,.012],
      [w*.51,h*.04,.065,.009],[w*.63,h*.30,.050,.003]])),mobile);
  }
  const [trim,light]=mount([[0,.014,.056],[0,.016,.085]]);
  k.mesh(upper,'gem','trim',...trim,w*.28,h*.43,.034);
  k.mesh(upper,'gem','glow',...light,w*.14,h*.21,.018);
}

function facialDetail(k,head,entry,mobile){
  switch(entry.id){
    case 'm003':
    case 'm023':
      for(const side of sides){
        const curve=entry.id==='m003'?[[.115,.025,.169,.021],[.167,.058,.185,.031],
          [.221,.019,.146,.037],[.223,-.086,.117,.058],[.169,-.155,.129,.029]]:
          [[.101,-.04,.156,.019],[.162,-.061,.17,.031],[.213,-.045,.122,.030],
            [.245,-.073,.06,.041],[.202,-.135,.086,.005]];
        sweep(k,head,entry.id==='m003'?'teal':'moss',mirror(side,curve),mobile);
        const fang=entry.id==='m003'?[[.061,-.141,.171,.023],[.074,-.106,.199,.022],[.079,-.069,.204,.002]]:
          [[.087,-.144,.134,.023],[.098,-.177,.168,.019],[.115,-.237,.207,.002]];
        sweep(k,head,'ivory',mirror(side,fang),mobile);
      }
      break;
    case 'm018':
      for(const side of sides){
        const lengths=[.02,.061,.106,.136];
        for(const [i,len] of lengths.entries()){
          const x=.138+i*.026;
          sweep(k,head,i%2?'brass':'black',mirror(side,[[x,.33,-.021,.012],
            [x+.008,.26-len,.018,.015],[x+.006,.15-len,.049,.011],[x-.01,.092-len,.039,.004]]),mobile);
        }
      }
      break;
    case 'm033':
      for(const side of sides){
        const tusk=mirror(side,[[.136,-.1,.17,.025],[.176,-.04,.197,.032],
          [.165,.036,.208,.024],[.144,.091,.187,.009],[.123,.096,.174,.002]]);
        sweep(k,head,'ivory',tusk,mobile);
        sweep(k,head,'brass',mirror(side,[[.071,.10,.184,.006],[.128,.108,.191,.013],
          [.181,.123,.155,.010],[.224,.122,.09,.004]]),mobile);
      }
      break;
    case 'm056':
      for(const side of sides){
        const line=mirror(side,[[.12,.143,.123,.014],[.157,.193,.037,.022],
          [.209,.161,-.032,.019],[.273,.241,-.11,.017],[.308,.294,-.184,.003]]);
        sweep(k,head,'jade',line,mobile);
        sweep(k,head,'ivory',line.map(([x,y,z,r])=>[x+side*.014,y+.019,z+.006,r*.35]),mobile);
      }
      break;
  }
}

function rigArmour(k,parts,entry,mobile,tools,design){
  const {body,head}=parts;
  const upper=entry.family==='rider'&&head?.parent!==body?head?.parent??body:body;
  const size=design.span;
  const finish=metal(k,design.metal,'body');
  const edge=metal(k,'ironRim','edge');
  const neck=head?.position.y??.76;
  const soft=design.anchor==='head'&&head?head:upper;
  const style=['m035','m039','m041'].includes(entry.id)?'mane':'cloth';
  if(reliefs[entry.id])relief(k,upper,mobile,reliefs[entry.id]);
  if(head)facialDetail(k,head,entry,mobile);
  for(const side of sides){
    const hem=mirror(side,design.hems);
    tools.silk(soft,design.silk+(side<0?' 左':' 右'),hem,{across:[.87,0,side*.49],tint:design.tint,
      trim:design.trim??0xbfa167,style,phase:side*.73,flex:design.anchor==='head'?.76:1.1});
    if(head){
      const [x,y,z,rise]=design.crest;
      const at=[side*x,y,z];
      const rim=rays[design.mask];
      const outline=mirror(side,rim.map(([u,v,w])=>[u,v*rise/.23,w]));
      panel(k,head,finish,offset(at,outline));
      sweep(k,head,edge,offset(at,outline.slice(0,4).map(([u,v,w],i)=>[u+side*.012,v+.005,w+.013,[.009,.015,.013,.003][i]])),mobile);
      if(design.mask==='jewel'||design.mask==='diadem'){
        k.mesh(head,'gem','trim',at[0]+side*.039,at[1]+.036,at[2]+.056,.026,.034,.018,0,side*.34);
        k.mesh(head,'gem','glow',at[0]+side*.041,at[1]+.036,at[2]+.066,.012,.019,.012,0,side*.34);
      }else{
        const rear=mirror(side,[[.031,.076,-.047,.024],[.087,.102,-.147,.026],
          [.121,.024,-.207,.021],[.105,-.053,-.239,.007]]);
        sweep(k,head,finish,offset(at,rear),mobile);
      }
    }
    const unarmored=entry.id==='m003';
    const pauldron=k.bone(upper,side*size*(unarmored?.83:.90),Math.max(.29,neck*(unarmored?.41:.71)),unarmored?-.31:-.18);
    pauldron.name=entry.name+'側後護肩';
    const shape=unarmored?.81:design.mask==='bark'?1.21:design.mask==='plates'?.82:1;
    const form=mirror(side,[[0,.08,-.046],[.134,.123*shape,-.079],[.218*shape,.033,-.035],
      [.19*shape,-.063,.055],[.111,-.131,.091],[.032,-.123,.041]]);
    panel(k,pauldron,unarmored?'ochre':finish,form,.039);
    const trail=form.slice(0,5).map(([x,y,z],i)=>[x+side*.008,y-.005,z-.025,[.010,.017,.019,.013,.003][i]]);
    sweep(k,pauldron,unarmored?'brass':edge,trail,mobile);
    k.mesh(pauldron,'gem','trim',side*.065,.051,-.082,.023,.021,.018);
    const arm=parts.arms?.[side===1?1:0];
    tools.hinge(pauldron,{side,axis:'z',wind:.14,strike:-.19,travel:.045,phase:.06,follow:arm,ratio:.29});
    const [x,y,z]=hem[0];
    const front=z>=0?1:-1;
    const border=mirror(side,[[0,.041,front*.017],[.047,.019,front*.026],
      [.052,-.023,front*.031],[.019,-.053,front*.034],[-.014,-.029,front*.022]]);
    panel(k,soft,'trim',offset([x,y,z],border),.021);
    k.mesh(soft,'gem',design.mask==='jewel'?'glow':finish,x+side*.018,y-.01,z+front*.047,.018,.025,.014);
  }
}

function rigCreature(k,parts,entry,mobile,tools,design){
  // The original sea-serpent rigs keep their skull on the first articulated spine joint.
  const head=parts.head??parts.body.children[0]?.children[0];
  if(!head?.isObject3D)return false;
  const shell=metal(k,design.shell,'edge');
  const finish=metal(k,design.metal,'body');
  const [x,y,z]=design.span;
  const long=design.form==='hood'||design.form==='membrane';
  for(const side of sides){
    const points=mirror(side,design.ridge);
    tools.silk(head,design.name+(side<0?' 左':' 右'),points,{across:[.22,0,1],tint:design.tint,
      trim:0xa69270,style:long||design.form==='shell'?'membrane':'mane',phase:side*1.12,flex:long?1.17:.66});
    const jaw=k.bone(head,side*x,y,z);
    jaw.name=entry.name+'顎側輪廓';
    const horn=design.form==='horn',ruff=design.form==='ruff',feather=design.form==='feather';
    const shape=mirror(side,[[0,.017,.015,.029,.020],[.079,.059,-.065,.043,.028],
      [.134,horn?.143:.109,-.132,.034,.019],[.179,horn?.181:feather?.162:.052,-.227,.004,.003]]);
    shaped(k,jaw,finish,shape,mobile,side+.15);
    sweep(k,jaw,shell,shape.map(([x,y,z,r],i)=>[x+side*.014,y+.016,z+.016,r*(i<2?.44:.32)]),mobile);
    const count=ruff||feather?3:long?2:1;
    for(let i=0;i<count;i++){
      const y=-.021-i*.035,z=.078-i*.049;
      panel(k,jaw,i===0?shell:finish,mirror(side,[[.026,y+.024,z],[.079,y+.049,z-.031],
        [.125+i*.016,y+.026,z-.104],[.133+i*.025,y-.032,z-.145],[.057,y-.037,z-.065]]),.021);
    }
    tools.hinge(jaw,{side,axis:'y',wind:ruff?.09:.19,strike:-.22,travel:.047,phase:.09});
    if(design.form==='shell'||design.form==='feather'||design.form==='membrane'){
      const back=parts.body;
      const w=design.form==='shell'?.44:.22;
      const rear=k.bone(back,side*w,design.form==='shell'?.17:.13,-.50);
      rear.name=entry.name+'脊甲下緣';
      const contour=mirror(side,[[.018,.07,.156],[.10,.153,.081],[.157,.084,-.037],
        [.135,-.012,-.158],[.056,-.041,-.167],[.008,-.007,-.023]]);
      panel(k,rear,finish,contour,.043);
      sweep(k,rear,shell,contour.slice(1,5).map(([x,y,z],i)=>[x,y+.018,z,[.017,.023,.019,.005][i]]),mobile);
      tools.hinge(rear,{side,axis:'x',wind:.09,strike:.17,travel:.048,phase:.04});
    }
  }
  return true;
}

export function refineBossA(k,parts,entry,mobile,tools){
  const armourDesign=armour[entry.id];
  if(armourDesign){
    rigArmour(k,parts,entry,mobile,tools,armourDesign);
    return true;
  }
  const creature=creatures[entry.id];
  return creature?rigCreature(k,parts,entry,mobile,tools,creature):false;
}
