import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const reflect=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);
const sweep=(k,part,material,points,steps=10,sides=7)=>k.sculpt.sweep(part,material,points,{steps,sides,ridge:.19});
const plate=(k,part,material,points,thickness=.033)=>k.sculpt.plate(part,material,points,thickness,thickness*.36);
const rivet=(k,part,material,x,y,z,r=.022)=>k.mesh(part,'gem',material,x,y,z,r,r,r*.64);
const carving=(k,part,material,profile,seed=0)=>k.geometry(part,material,
  sculptVolume(profile,{sides:12,rings:16,section:2.21,ridge:.13,seed}));

const champions={
  m113:{name:'劫火袈裟',shoulder:[.232,1.41,.02],chest:[.28,.32],face:'flame',iron:'rind',rim:'ember',tint:0x702329,trim:0xbc773c,
    hem:[[.12,.91,.16,.068],[.20,.66,.25,.127],[.32,.37,.26,.122],[.51,.19,.27,.013]],
    mantle:[[.20,1.41,-.16,.055],[.49,1.30,-.27,.091],[.52,1.02,-.41,.08],[.44,.74,-.50,.023]],flex:1.15},
  m117:{name:'阿修羅咒裝',shoulder:[.40,.65,.02],chest:[.37,.46],face:'demon',iron:'body',rim:'trim',tint:0x421c27,trim:0xf0aa57,
    hem:[[.12,.02,.30,.073],[.21,-.20,.41,.141],[.28,-.45,.32,.11],[.33,-.71,.41,.028]],
    mantle:[[.32,.63,-.20,.11],[.45,.35,-.43,.133],[.53,.03,-.55,.103],[.64,-.28,-.64,.021]],flex:1.0},
  m118:{name:'風猿領巾',shoulder:[.221,1.41,.01],chest:[.27,.30],face:'open',iron:'rind',rim:'trim',tint:0x236368,trim:0xcac389,
    hem:[[.19,.85,.15,.036],[.38,.65,.19,.064],[.42,.39,.10,.047],[.46,.17,.17,.013]],
    mantle:[[.13,1.56,-.21,.043],[.30,1.38,-.43,.065],[.29,1.11,-.62,.082],[.46,.99,-.69,.012]],flex:1.35},
  m119:{name:'禍海聖帶',shoulder:[.272,1.41,.015],chest:[.34,.38],face:'open',iron:'rind',rim:'trim',tint:0x49355c,trim:0xcfa963,
    hem:[[.083,.88,.16,.056],[.162,.62,.24,.102],[.115,.40,.26,.086],[.190,.21,.21,.025]],
    mantle:[[.26,1.43,-.27,.066],[.33,1.13,-.44,.149],[.44,.81,-.50,.151],[.42,.56,-.63,.045]],flex:.9},
  m120:{name:'象首垂珠帛',shoulder:[.315,1.41,.025],chest:[.40,.31],face:'elephant',iron:'rind',rim:'trim',tint:0x274351,trim:0xbd994e,
    hem:[[.26,.91,.19,.054],[.35,.68,.27,.104],[.35,.44,.29,.094],[.43,.26,.25,.021]],
    mantle:[[.31,1.38,-.23,.100],[.43,1.13,-.36,.106],[.37,.92,-.49,.131],[.40,.65,-.56,.037]],flex:.74},
  m123:{name:'日輪綬帶',shoulder:[.246,1.41,.015],chest:[.29,.29],face:'sun',iron:'rind',rim:'trim',tint:0x483b69,trim:0xe8c68e,
    hem:[[.14,.99,.14,.073],[.28,.85,.27,.093],[.39,.68,.32,.07],[.47,.52,.34,.017]],
    mantle:[[.25,1.45,-.18,.047],[.55,1.32,-.24,.072],[.58,1.03,-.43,.07],[.73,.85,-.64,.031]],flex:1.01},
  m124:{name:'龍母王旒',shoulder:[.44,1.34,.14],chest:[.46,.55],face:'demon',iron:'body',rim:'trim',tint:0x70313a,trim:0xdb9e4a,
    hem:[[.26,.88,.47,.034],[.47,.60,.38,.092],[.51,.37,.24,.067],[.74,.24,.09,.009]],
    mantle:[[.36,1.49,-.16,.080],[.54,1.30,-.39,.142],[.61,1.05,-.57,.149],[.68,.64,-.66,.022]],flex:1.03},
  m125:{name:'旱雷冠旒',shoulder:[.41,1.32,.16],chest:[.46,.55],face:'sun',iron:'body',rim:'trim',tint:0x465052,trim:0xc29e56,
    hem:[[.20,.86,.49,.062],[.32,.57,.49,.109],[.39,.24,.31,.088],[.58,.08,.20,.012]],
    mantle:[[.31,1.42,-.18,.081],[.39,1.12,-.46,.121],[.49,.83,-.66,.134],[.67,.57,-.76,.020]],flex:.88},
  m135:{name:'雪蓮紗',shoulder:[.212,1.41,.008],chest:[.25,.26],face:'veil',iron:'rind',rim:'trim',tint:0x437788,trim:0x9acbc1,
    hem:[[.10,.93,.19,.043],[.18,.57,.25,.077],[.25,.29,.23,.099],[.29,.09,.27,.020]],
    mantle:[[.27,1.40,-.14,.069],[.48,1.20,-.29,.110],[.62,.97,-.44,.088],[.84,.91,-.62,.019]],flex:1.42},
  m137:{name:'鎏火戰披',shoulder:[.255,1.41,.021],chest:[.31,.31],face:'demon',iron:'rind',rim:'trim',tint:0x902922,trim:0xd38a47,
    hem:[[.15,.91,.20,.037],[.23,.63,.32,.099],[.24,.38,.32,.112],[.31,.12,.37,.018]],
    mantle:[[.30,1.43,-.23,.085],[.38,1.15,-.42,.165],[.46,.84,-.59,.154],[.53,.49,-.74,.041]],flex:.85},
  m139:{name:'背旗金穗',shoulder:[.297,1.41,.02],chest:[.36,.28],face:'sun',iron:'rind',rim:'trim',tint:0x315c6e,trim:0xe1b45a,
    hem:[[.28,.84,.18,.071],[.44,.71,.25,.106],[.52,.48,.21,.079],[.60,.23,.34,.013]],
    mantle:[[.37,1.46,-.19,.059],[.45,1.22,-.39,.103],[.42,.94,-.58,.148],[.65,.54,-.76,.039]],flex:1.12},
  m141:{name:'夜叉護幡',shoulder:[.289,1.41,.026],chest:[.37,.40],face:'tusk',iron:'rind',rim:'trim',tint:0x562a40,trim:0xb79a77,
    hem:[[.20,.86,.24,.064],[.33,.61,.35,.116],[.28,.34,.39,.13],[.37,.10,.41,.021]],
    mantle:[[.35,1.43,-.29,.080],[.45,1.20,-.55,.127],[.64,.93,-.66,.158],[.73,.44,-.84,.019]],flex:.95},
  m142:{name:'腐囊獸皮',shoulder:[.323,1.41,.018],chest:[.37,.27],face:'flame',iron:'rind',rim:'ember',tint:0x696631,trim:0xbd9745,
    hem:[[.13,.88,.16,.056],[.22,.52,.26,.12],[.39,.34,.32,.098],[.47,.17,.33,.009]],
    mantle:[[.39,1.34,-.17,.053],[.67,1.26,-.31,.139],[.71,.98,-.53,.172],[.95,.79,-.72,.018]],flex:1.13},
  m143:{name:'雷鬼骨縫',shoulder:[.357,1.41,.021],chest:[.41,.37],face:'tusk',iron:'rind',rim:'edge',tint:0x5d4930,trim:0xcaa256,
    hem:[[.15,.91,.20,.093],[.24,.64,.31,.125],[.29,.40,.36,.102],[.40,.19,.30,.026]],
    mantle:[[.35,1.35,-.27,.079],[.47,1.03,-.40,.120],[.57,.78,-.49,.100],[.59,.53,-.70,.024]],flex:.65},
  m146:{name:'凶夢蛾縷',shoulder:[.238,1.41,.027],chest:[.30,.27],face:'veil',iron:'rind',rim:'edge',tint:0x624672,trim:0x99bdd5,
    hem:[[.10,.83,.18,.032],[.25,.58,.31,.12],[.34,.29,.31,.089],[.46,.16,.35,.018]],
    mantle:[[.26,1.38,-.16,.078],[.56,1.29,-.37,.137],[.59,.93,-.57,.174],[.75,.58,-.76,.017]],flex:1.25},
  m147:{name:'風衛破幟',shoulder:[.297,1.41,.022],chest:[.39,.29],face:'tusk',iron:'rind',rim:'trim',tint:0x6b603e,trim:0xbab48f,
    hem:[[.22,.91,.18,.067],[.36,.64,.29,.098],[.45,.32,.32,.084],[.59,.18,.37,.015]],
    mantle:[[.35,1.43,-.23,.090],[.47,1.17,-.40,.118],[.59,.84,-.58,.105],[.72,.55,-.71,.027]],flex:.92},
  'raid-flame':{name:'熔爐火皮',shoulder:[.382,1.41,.018],chest:[.44,.41],face:'flame',iron:'rind',rim:'ember',tint:0x672921,trim:0xe47a42,
    hem:[[.26,.89,.27,.066],[.42,.62,.35,.11],[.47,.42,.37,.074],[.63,.26,.42,.006]],
    mantle:[[.41,1.46,-.29,.092],[.62,1.19,-.39,.128],[.67,.86,-.60,.131],[.78,.66,-.73,.023]],flex:.69},
};

function helmetRelief(k,head,{face,iron,rim}){
  if(face==='veil'){
    for(const side of sides)sweep(k,head,rim,reflect(side,[[.05,.10,.225,.017],[.113,.142,.199,.018],
      [.176,.104,.155,.026],[.177,-.045,.112,.024],[.149,-.132,.11,.008]]));
    return;
  }
  const tusk=face==='tusk'||face==='elephant';
  const open=face==='open';
  const deep=face==='demon';
  for(const side of sides){
    const path=reflect(side,[[.112,.136,.143],[.151,.243,.084],[.194,.221,-.067],
      [.180,.042,-.190],[.147,-.108,-.166],[.176,-.146,-.022],[.166,-.072,.095]]);
    plate(k,head,iron,path,.024);
    sweep(k,head,rim,reflect(side,[[.127,.184,.137,.017],[.174,.267,.031,.026],
      [.205,.204,-.127,.022],[.157,.031,-.213,.015],[.113,-.112,-.196,.008]]),15);
    if(!open){
      const brow=deep?.123:.095;
      sweep(k,head,rim,reflect(side,[[.024,.094,.223,.007],[.086,brow,.231,.017],
        [.145,.127,.185,.025],[.176,.082,.145,.006]]));
      if(tusk)sweep(k,head,'edge',reflect(side,[[.142,-.062,.139,.034],[.208,-.128,.165,.029],
        [.265,-.150,.212,.020],[.289,-.073,.247,.004]]));
    }
    rivet(k,head,rim,side*.153,-.047,-.204,.018);
  }
  if(face==='sun'||face==='flame')sweep(k,head,rim,[[0,.138,.154,.008],[0,.241,.129,.035],
    [.017,.322,.063,.028],[.027,.374,-.038,.016],[.011,.392,-.103,.004]],13);
}

function champion(k,parts,spec,tools){
  const {body,head}=parts,{shoulder,chest,iron,rim,tint,trim}=spec;
  const [sx,sy,sz]=shoulder,[width,depth]=chest;
  helmetRelief(k,head,spec);
  for(const side of sides){
    const original=parts.arms?.find(arm=>arm.position.x*side>.10)??
      body.children.find(part=>Math.abs(part.position.x-side*sx)<.072&&Math.abs(part.position.y-sy)<.082);
    const plateJoint=k.bone(body,side*sx,sy,sz);
    plateJoint.name=spec.name+' · 肩甲';
    tools.hinge(plateJoint,{side,axis:'z',wind:-.11,strike:.12,travel:.03,phase:.05,follow:original,ratio:.30});
    const pauldron=reflect(side,[[.015,.104,.131],[.105,.175,.069],[.224,.132,-.056],
      [.245,.061,-.151],[.195,-.083,-.165],[.191,-.135,.044],[.083,-.100,.157]]);
    plate(k,plateJoint,iron,pauldron,.050);
    sweep(k,plateJoint,rim,reflect(side,[[.066,.033,.167,.015],[.154,.112,.127,.023],
      [.234,.103,.001,.025],[.231,.047,-.122,.018],[.184,-.058,-.178,.007]]),14);
    for(let i=0;i<2;i++){
      const hinge=k.bone(plateJoint,side*(.135-i*.041),-.053-i*.063,.016);
      const louver=reflect(side,[[-.052,.048,-.140],[.061,.046,-.139],[.103,-.030,-.077],
        [.106,-.067,.084],[.034,-.113,.125],[-.036,-.081,.123]]);
      plate(k,hinge,i?iron:'deep',louver,.029);
      sweep(k,hinge,rim,reflect(side,[[.063,.017,-.125,.012],[.098,-.024,-.017,.014],[.081,-.078,.096,.010]]));
      tools.hinge(hinge,{side,axis:'z',wind:-.05,strike:.055,phase:.028});
    }
    rivet(k,plateJoint,rim,side*.138,-.037,-.167);
    const y=sy-.21,z=depth;
    const contours=reflect(side,[[width*.11,y+.16,z+.043],[width*.57,y+.24,z+.004],
      [width*.97,y+.144,z-.082],[width*.88,y-.048,z-.090],[width*.41,y-.185,z+.045],
      [width*.07,y-.086,z+.101]]);
    plate(k,body,iron,contours,.030);
    sweep(k,body,rim,contours.slice(0,5).map(([x,y,z],i)=>[x,y,z+.027,[.013,.022,.020,.017,.008][i]]),14);
    const dorsal=reflect(side,[[.014,sy+.092,-z*.73],[width*.71,sy+.113,-z*.78],
      [width*.96,sy-.096,-z*.84],[width*.67,sy-.29,-z*1.22],[width*.31,sy-.33,-z*1.19],[.019,sy-.235,-z*.96]]);
    plate(k,body,'deep',dorsal,.035);
    sweep(k,body,rim,dorsal.slice(1,5).map(([x,y,z])=>[x,y,z-.032,.014]),12);
    rivet(k,body,iron,side*width*.57,sy-.037,-z*.96);
    const skirtY=spec.hem[0][1]+.10,skirtZ=spec.hem[0][2]+.025;
    for(let i=0;i<3;i++){
      const y=skirtY-i*.07,x=width*(.49+i*.09),d=skirtZ+i*.027;
      sweep(k,body,i===1?'deep':rim,reflect(side,[[x*.3,y+.043,d+.029,.012],
        [x*.73,y+.031,d+.049,.016],[x,y-.019,d+.026,.017],[x*1.15,y-.028,d-.044,.006]]),8);
    }
    tools.silk(body,spec.name+' · 披襟',reflect(side,spec.hem),{tint,trim,phase:side*.85,flex:spec.flex});
    tools.silk(body,spec.name+' · 背披',reflect(side,spec.mantle),{tint,trim,phase:side*.93+1.3,flex:spec.flex});
  }
  if(spec.face==='demon'||spec.face==='tusk'){
    const y=sy-.26,z=depth+.118;
    const crest=[[0,y+.096,z],[-.084,y+.056,z-.028],[-.052,y-.049,z+.027],[0,y-.095,z+.044],
      [.048,y-.055,z+.032],[.083,y+.059,z-.027]];
    plate(k,body,rim,crest,.019);
    sweep(k,body,iron,[[0,y-.064,z+.056,.012],[-.011,y+.011,z+.031,.017],
      [.021,y+.083,z+.024,.005]],10);
  }
}

const beasts={
  m116:{name:'蛇王頸帆',skin:'rind',ridge:'trim',tint:0x413246,trim:0x986789,style:'membrane',
    crown:[.15,.05,.17],back:[.02,1.56,.19],flank:[.12,1.26,.22],breadth:.38,
    bends:[[.14,.14,-.17,.094],[.39,.25,-.26,.15],[.56,.19,-.38,.163],[.66,.02,-.49,.027]]},
  m121:{name:'女王絲囊',skin:'rind',ridge:'edge',tint:0x5a3f4b,trim:0xa78665,style:'membrane',
    crown:[.31,-.04,.31],back:[-.04,.78,-.89],flank:[.51,.03,-.63],breadth:.31,
    bends:[[.16,-.16,.02,.036],[.34,-.31,.05,.079],[.46,-.50,-.03,.065],[.53,-.63,-.14,.008]]},
  m126:{name:'阿修羅赤鰭',skin:'rind',ridge:'trim',tint:0x5e252d,trim:0xc0956d,style:'membrane',
    crown:[.115,.05,.15],back:[.08,.88,.24],flank:[.19,.75,.31],breadth:.24,
    bends:[[.105,.08,-.09,.057],[.233,.135,-.20,.106],[.303,.043,-.37,.09],[.32,-.11,-.49,.007]]},
  m129:{name:'沙麟頸鬃',skin:'rind',ridge:'trim',tint:0x785735,trim:0xd4ae72,style:'mane',
    crown:[.22,.05,.22],back:[.01,.55,-.41],flank:[.44,.34,.22],breadth:.35,
    bends:[[.14,.07,-.10,.066],[.23,.02,-.31,.110],[.25,-.02,-.57,.095],[.38,-.085,-.77,.007]]},
  m130:{name:'罕王鞍韉',skin:'rind',ridge:'trim',tint:0x324779,trim:0x93b9c1,style:'cloth',
    crown:[.22,.04,.26],back:[.04,.46,-.50],flank:[.42,.22,-.12],breadth:.38,
    bends:[[.28,.46,-.12,.133],[.45,.31,-.25,.143],[.52,-.03,-.39,.116],[.55,-.28,-.66,.049]]},
  m132:{name:'墮饕熔皮',skin:'rind',ridge:'ember',tint:0x753932,trim:0xe6773b,style:'membrane',
    crown:[.26,.06,.21],back:[.03,.71,-.38],flank:[.51,.48,.14],breadth:.44,
    bends:[[.20,.03,-.16,.086],[.39,.08,-.30,.12],[.45,.12,-.55,.11],[.53,.07,-.73,.006]]},
  m134:{name:'玄武冰鱗',skin:'rind',ridge:'edge',tint:0x428996,trim:0xa2d6d3,style:'membrane',
    crown:[.12,.17,.19],back:[.03,.61,-.79],flank:[.70,-.02,-.52],breadth:.46,
    bends:[[.64,.17,-.57,.076],[.85,.19,-.71,.114],[1.03,.27,-.91,.099],[1.19,.37,-1.18,.013]]},
  m138:{name:'青龍雲鬣',skin:'rind',ridge:'edge',tint:0x31656b,trim:0xb7d2c3,style:'mane',
    crown:[.18,.04,.24],back:[.55,1.25,.105],flank:[.58,1.07,.15],breadth:.27,
    bends:[[.13,.02,.19,.032],[.31,-.13,.28,.054],[.58,-.15,.13,.042],[.79,.03,-.10,.006]]},
  m140:{name:'白虎雪鬚',skin:'rind',ridge:'edge',tint:0xadb9ba,trim:0xe2dcc6,style:'mane',
    crown:[.20,.04,.18],back:[-.03,.51,-.31],flank:[.44,.32,.16],breadth:.31,
    bends:[[.13,-.08,.17,.068],[.21,-.15,.14,.104],[.29,-.23,-.022,.087],[.36,-.27,-.23,.005]]},
  m144:{name:'太初饕餮裂鰭',skin:'rind',ridge:'ember',tint:0x513335,trim:0xf08a43,style:'membrane',
    crown:[.26,.09,.25],back:[.024,.64,-.51],flank:[.52,.33,.04],breadth:.43,
    bends:[[.20,-.021,-.19,.086],[.44,.16,-.49,.164],[.52,.20,-.67,.112],[.63,.36,-.79,.008]]},
  m145:{name:'混沌雷腱',skin:'rind',ridge:'edge',tint:0x695944,trim:0xcbaf66,style:'membrane',
    crown:[.22,.09,.18],back:[-.035,.64,-.41],flank:[.57,.41,-.14],breadth:.45,
    bends:[[.16,.01,-.13,.066],[.41,.17,-.29,.136],[.55,.29,-.41,.102],[.64,.38,-.54,.006]]},
  m149:{name:'檮杌風鬣',skin:'rind',ridge:'edge',tint:0x4f6969,trim:0x9bcfc9,style:'mane',
    crown:[.245,.07,.20],back:[.025,.56,-.54],flank:[.49,.45,.2],breadth:.40,
    bends:[[.18,.065,-.17,.085],[.31,.19,-.37,.123],[.36,.33,-.65,.095],[.47,.43,-.91,.011]]},
  m150:{name:'龜皇殼緣',skin:'burntShell',ridge:'royalShell',tint:0x663f30,trim:0xe29853,style:'membrane',
    crown:[.28,.06,.22],back:[.018,.70,-1.12],flank:[.83,.31,-.73],breadth:.52,
    bends:[[.36,.38,-.55,.12],[.64,.38,-.79,.167],[.76,.32,-1.03,.171],[.88,.26,-1.28,.013]]},
  m152:{name:'貪獸逆鰓',skin:'rind',ridge:'edge',tint:0x306879,trim:0xe08e58,style:'membrane',
    crown:[.23,-.008,.29],back:[.025,.69,-.55],flank:[.37,.47,-.29],breadth:.38,
    bends:[[.21,-.061,-.071,.069],[.36,-.10,-.26,.108],[.44,-.04,-.41,.108],[.51,.07,-.51,.008]]},
  m154:{name:'牛鬼鞍骨',skin:'iron',ridge:'edge',tint:0x693931,trim:0xba8150,style:'mane',
    crown:[.30,.03,.38],back:[.023,.75,-.98],flank:[.68,.34,-.49],breadth:.52,
    bends:[[.22,-.024,.36,.094],[.43,-.14,.22,.117],[.49,-.26,.03,.098],[.62,-.38,-.19,.014]]},
  m157:{name:'山魈肩鬣',skin:'rind',ridge:'edge',tint:0x6c4042,trim:0xbc8770,style:'mane',
    crown:[.19,-.01,.18],back:[.025,.49,-.38],flank:[.54,.39,-.11],breadth:.40,
    bends:[[.13,.07,-.14,.084],[.23,-.09,-.22,.150],[.32,-.25,-.31,.102],[.38,-.39,-.45,.012]]},
  m158:{name:'古猿冰髮',skin:'rind',ridge:'edge',tint:0x68717c,trim:0xb7bece,style:'mane',
    crown:[.21,.02,.23],back:[.03,.74,-.45],flank:[.48,.46,-.08],breadth:.41,
    bends:[[.09,.11,-.18,.087],[.23,-.03,-.29,.149],[.29,-.20,-.43,.103],[.40,-.39,-.52,.011]]},
};

function animalAnatomy(k,parts,spec,mobile,tools){
  const {body,head}=parts,{skin,ridge,tint,trim,style,breadth}=spec;
  const [hx,hy,hz]=spec.crown,[bx,by,bz]=spec.back,[fx,fy,fz]=spec.flank;
  for(const side of sides){
    if(head){
      const cheek=k.bone(head,side*hx,hy,hz);
      cheek.name=spec.name+' · 顎襯';
      const bone=reflect(side,[[0,.10,-.087],[.095,.088,-.19],[.15,.031,-.263],[.12,-.125,-.151],
        [.050,-.131,-.017],[-.009,-.045,.025]]);
      plate(k,cheek,skin,bone,.025);
      sweep(k,cheek,ridge,reflect(side,[[0,.042,.011,.009],[.055,.059,-.071,.020],[.10,.049,-.179,.022],
        [.134,.083,-.268,.017],[.109,.11,-.333,.004]]),12);
      const parent=spec===beasts.m121||spec===beasts.m134?body:head;
      const flexPath=spec.bends.map(([x,y,z,w])=>[side*x,y,z,w]);
      tools.silk(parent,spec.name+' · '+(side<0?'左':'右'),flexPath,
        {across:[0,1,.16],tint,trim,style,phase:side*.91,flex:style==='mane'?1.25:.86});
      tools.hinge(cheek,{side,axis:'y',wind:.06,strike:-.13,phase:.04});
    }else{
      tools.silk(body,spec.name+' · 甲緣',reflect(side,spec.bends),
        {across:[.15,1,0],tint,trim,style,phase:side*.81,flex:.69});
    }
    const furrow=k.bone(body,side*fx,fy,fz);
    furrow.name=spec.name+' · 背肋';
    // The outboard edge is recessed into the skin and rounds onto the back.
    const flank=reflect(side,[[-.062,.083,.153],[.052,.083,.117],[.088,.021,-.008],
      [.088,-.077,-.138],[.069,-.185,-.177],[-.017,-.168,-.132],[-.073,-.056,.024]]);
    plate(k,furrow,skin,flank,.028);
    sweep(k,furrow,ridge,reflect(side,[[.019,.065,.146,.013],[.076,.040,.068,.018],
      [.093,-.020,-.046,.018],[.073,-.14,-.176,.009]]),11);
    tools.hinge(furrow,{side,axis:'z',wind:-.08,strike:.10,phase:.04});
    for(let i=0;i<(mobile?3:5);i++){
      const t=i/(mobile?3:5),x=side*(bx+breadth*(.24+t*.58)),y=by-t*.077,z=bz+t*.26;
      sweep(k,body,i%2?skin:ridge,[[x,y,z,.029],[x+side*.068,y+.069,z-.073,.046],
        [x+side*.097,y+.142,z-.168,.031],[x+side*.05,y+.17,z-.229,.005]],9);
    }
  }
}

const fliers={
  m127:{name:'西嵐裂翼',anchor:[.22,1.04,-.19],cut:[.57,.49,-.04],width:.127,length:.94,tint:0x633f47,trim:0xc48756,style:'membrane',iron:'rind',rim:'trim',throat:[.123,-.05,.093]},
  m128:{name:'卡利亞蝠翼',anchor:[.27,.79,-.05],cut:[.51,.59,-.15],width:.19,length:1.16,tint:0x362940,trim:0xa56640,style:'membrane',iron:'rind',rim:'trim',throat:[.20,-.05,.19]},
  m131:{name:'水龍鰭翼',anchor:[.28,.76,.05],cut:[.56,.46,.026],width:.13,length:.81,tint:0x3a76a1,trim:0x92b0c5,style:'membrane',iron:'rind',rim:'edge',throat:[.18,-.022,.13]},
  m136:{name:'朱雀羽翎',anchor:[.25,.47,-.03],cut:[.63,.21,-.048],width:.115,length:.72,tint:0x953743,trim:0xf1a952,style:'mane',iron:'rind',rim:'ember',throat:[.071,.05,.029]},
  m148:{name:'窮奇後翎',anchor:[.252,.259,-.083],cut:[.48,.305,-.042],width:.15,length:.74,tint:0x334a62,trim:0x75a6be,style:'mane',iron:'rind',rim:'edge',throat:[.18,-.04,.12]},
  m151:{name:'蜂王腹翅',anchor:[.244,.248,-.091],cut:[.54,.115,-.095],width:.105,length:.67,tint:0x6c7534,trim:0xb9bd63,style:'membrane',iron:'rind',rim:'trim',throat:[.162,-.056,.136]},
  'raid-wyvern':{name:'沙龍裂膜',anchor:[.28,.65,.04],cut:[.61,.52,.04],width:.15,length:1.02,tint:0x5e4b3c,trim:0xbe975e,style:'membrane',iron:'rind',rim:'trim',throat:[.18,-.04,.12]},
};

function skinWyvernWings(k,parts,spec,mobile){
  const ribs=[3,5,7,9,0],skeletons=[],panels=[];
  const material=k.materials.membrane;
  material.side=T.DoubleSide;
  for(const {shoulder,vertices,side} of parts.webs){
    const root=new T.Bone(),bones=[root];
    shoulder.add(root);
    const position=[],normalColor=[],uv=[],joints=[],weights=[],indices=[];
    const rows=mobile?10:16,columns=mobile?6:10,point=new T.Vector3(),tangent=new T.Vector3();
    const ridge=new T.Vector3(...vertices[2]);
    for(let panel=0;panel<ribs.length-1;panel++){
      const a=ribs[panel],b=ribs[panel+1],last=b===0;
      const left=new T.Vector3(...vertices[a]),right=new T.Vector3(...vertices[b]);
      const scallop=new T.Vector3(...vertices[last?1:a+1]);
      const span=left.distanceTo(right);
      if(last)scallop.copy(left).lerp(right,.46).lerp(ridge,.27);
      const outline=new T.CatmullRomCurve3([left,scallop,right],false,'catmullrom',.24);
      const skinJoint=new T.Bone();
      skinJoint.name=spec.name+' · 翼膜 '+(panel+1);
      skinJoint.position.copy(ridge).lerp(scallop,.48);
      root.add(skinJoint);
      bones.push(skinJoint);panels.push({joint:skinJoint,side,panel});
      const offset=position.length/3;
      tangent.copy(left).sub(ridge).cross(right.clone().sub(ridge)).normalize();
      if(tangent.y>0)tangent.negate();
      for(let row=0;row<=rows;row++){
        const r=Math.max(.006,row/rows);
        for(let column=0;column<=columns;column++){
          const u=column/columns,v=Math.sin(Math.PI*u),billow=Math.sin(Math.PI*r);
          const edge=outline.getPoint(u,point);
          edge.lerpVectors(ridge,edge,r);
          const billowDepth=(.045+spec.width*(.46+panel*.10))*v*billow;
          const torn=(panel+r)*.5+side;
          edge.addScaledVector(tangent,billowDepth+Math.sin(u*26+torn)*r**8*v*.019);
          position.push(edge.x,edge.y,edge.z);
          uv.push(panel*.24+u*.24,r);
          const webbing=Math.pow(Math.max(0,Math.cos(r*32+u*13+panel)),9)*.106;
          const worn=(r**5)*(.09+.13*Math.cos(u*16.7+torn)**2);
          const shade=.76+billowDepth*1.20+webbing+worn-v*.15;
          normalColor.push(shade,shade*.94,shade*.90);
          joints.push(0,bones.length-1,0,0);
          const influence=Math.min(.89,(billow+.09)*v);
          weights.push(1-influence,influence,0,0);
          if(!row||!column)continue;
          const i=offset+row*(columns+1)+column,j=i-columns-1;
          indices.push(j-1,i-1,j,j,i-1,i);
        }
      }
      sweep(k,shoulder,'rind',Array.from({length:6},(_,i)=>{
        const p=outline.getPoint(i/5);
        return [...p.toArray(),.012+(1-i/5)*.005+Math.min(span*.012,.014)];
      }),13,6);
    }
    const geo=new T.BufferGeometry().setIndex(indices);
    geo.setAttribute('position',new T.Float32BufferAttribute(position,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geo.setAttribute('color',new T.Float32BufferAttribute(normalColor,3));
    geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
    geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
    geo.computeVertexNormals();
    const mesh=new T.SkinnedMesh(geo,material);
    mesh.name=spec.name+' · 翼膜';
    mesh.frustumCulled=false;
    shoulder.add(mesh);
    shoulder.updateWorldMatrix(true,true);
    const skeleton=new T.Skeleton(bones);
    mesh.bind(skeleton,mesh.matrixWorld);
    skeletons.push(skeleton);
  }
  const pose=parts.cataloguePose,dispose=parts.disposeRig;
  parts.cataloguePose=context=>{
    pose(context);
    const {beat,travel,wind,strike,stage,fall}=context;
    for(const {joint,side,panel} of panels){
      const pulse=Math.sin(beat*.72-panel*.51+side*.19);
      joint.rotation.x=pulse*(.10+travel*.065)-wind*.12+strike*.21+fall*.16;
      joint.rotation.y=side*(pulse*.08+stage*.06+strike*.13);
      joint.rotation.z=side*(pulse*.09+wind*.08-strike*.085);
    }
  };
  parts.disposeRig=()=>{
    dispose?.();
    for(const skeleton of skeletons)skeleton.dispose();
  };
}

function flying(k,parts,spec,mobile,tools){
  const {body,head}=parts,{anchor,cut,width,length,iron,rim}=spec;
  if(parts.webs)skinWyvernWings(k,parts,spec,mobile);
  for(const side of sides){
    const wing=body.children.find(child=>
      Math.abs(child.position.x-side*anchor[0])<.041&&Math.abs(child.position.y-anchor[1])<.07&&Math.abs(child.position.z-anchor[2])<.09);
    if(!wing)throw Error('Missing wing joint for '+spec.name);
    const [x,y,z]=cut;
    const layers=parts.webs?1:mobile?2:3;
    for(let i=0;i<layers;i++){
      const origin=i*.21,stretch=length*(1-i*.12),w=width*(1-i*.13);
      if(parts.webs){
        tools.silk(wing,spec.name+' · 翼根側帆',reflect(side,[[.06,.035,-.12,w*.29],
          [.147,-.017,-.29,w*.41],[.271,-.035,-.42,w*.43],[.34,-.091,-.54,w*.041]]),
        {across:[1,.17,.03],tint:spec.tint,trim:spec.trim,style:spec.style,phase:side*.87,flex:.81});
        continue;
      }
      const profile=[[x+origin,y+origin*.34,z-.071,w*.47],
        [x+.11+origin,y-.087+i*.11,z-stretch*.34,w],
        [x+.18+origin,y-.174+i*.11,z-stretch*.67,w*.89],
        [x+.26+origin,y-.184+i*.12,z-stretch,w*.054]];
      tools.silk(wing,spec.name+' '+(i+1),reflect(side,profile),
        {across:[1,.30,.025],tint:spec.tint,trim:spec.trim,style:spec.style,phase:side*.72+i*.42,flex:1+i*.16});
    }
    const flange=k.bone(wing,side*x*.48,y*.63,z+.01);
    plate(k,flange,iron,reflect(side,[[0,.092,.015],[.155,.127,-.057],[.226,.056,-.116],
      [.233,-.074,-.144],[.125,-.115,-.071],[.017,-.043,.057]]),.033);
    sweep(k,flange,rim,reflect(side,[[.021,.074,.037,.012],[.136,.108,-.031,.021],
      [.220,.040,-.106,.021],[.157,-.106,-.11,.009]]));
    tools.hinge(flange,{side,axis:'y',wind:.105,strike:-.16,phase:.07});
    const [hx,hy,hz]=spec.throat;
    sweep(k,head,rim,reflect(side,[[hx*.72,hy+.073,hz+.097,.010],[hx,hy+.044,hz+.022,.027],
      [hx+.047,hy-.022,hz-.118,.029],[hx+.033,hy-.075,hz-.218,.011],[hx*.78,hy-.11,hz-.265,.003]]),13);
  }
}

function royalPair(k,parts,awakened,tools){
  for(const [i,head] of parts.heads.entries()){
    const actor=head.parent;
    const tint=i?awakened?0x7e3536:0xb9a080:0x713032;
    const trim=i?0x8f8c80:0xcd9c62;
    const accent=i?'royalCyan':'bronzeRib';
    const cloth=i?'royalIvory':'royalCrimson';
    for(const side of sides){
      const link=k.bone(actor,side*(i?.175:.20),.468,-.135);
      const edge=reflect(side,[[.006,.112,.03],[.079,.124,-.061],[.131,.039,-.108],
        [.098,-.035,-.127],[.075,-.091,-.071],[.015,-.053,.025]]);
      plate(k,link,cloth,edge,.039);
      sweep(k,link,'trim',edge.slice(0,5).map(([x,y,z])=>[x,y+.015,z-.014,.013]));
      rivet(k,link,accent,side*.071,.036,-.104);
      tools.hinge(link,{side,axis:'z',wind:i?.13:.09,strike:-.15,phase:.051});
      tools.silk(actor,i?'王妃雲紗':'王袍金綬',reflect(side,
        [[.116,.450,-.271,.051],[.20,.249,-.386,.093],[.27,-.097,-.458,.105],[.37,-.59,-.561,.029]]),
        {tint,trim,phase:i*.83+side*.82,flex:awakened?1.14:.97});
      tools.silk(actor,i?'亞彌細穗':'雅瑪垂旒',reflect(side,
        [[.092,.26,.194,.028],[.194,.067,.267,.053],[.24,-.226,.311,.075],[.29,-.49,.383,.018]]),
        {tint,trim,phase:1+i+side*.66,flex:1.05});
      sweep(k,head,accent,reflect(side,[[.074,.168,-.069,.009],[.143,.178,-.131,.022],
        [.169,.098,-.173,.017],[.142,-.034,-.140,.011],[.117,-.086,-.085,.004]]),14);
      if(awakened){
        sweep(k,head,'trim',reflect(side,[[.11,.134,.101,.019],[.157,.172,.049,.036],
          [.207,.264,-.052,.031],[.210,.342,-.133,.009],[.248,.375,-.179,.003]]),15);
      }
    }
  }
}

function varuna(k,parts,tools){
  const rider=parts.head.parent;
  for(const side of sides){
    tools.silk(rider,'伐楼拿 · 船幔',reflect(side,
      [[.21,.933,-.126,.043],[.34,.659,-.228,.074],[.42,.34,-.386,.085],[.51,.063,-.472,.013]]),
      {tint:0x863e42,trim:0xd2a46c,phase:side*.83,flex:1.11});
    tools.silk(parts.body,'伐楼拿 · 水旗',reflect(side,
      [[.39,.255,-.67,.052],[.56,.19,-.82,.109],[.62,.08,-1.01,.096],[.68,.122,-1.20,.019]]),
      {tint:0x397c83,trim:0xa9caca,style:'membrane',phase:1.7+side});
    const arm=parts.arms.find(part=>part.position.x*side>0);
    const pauldron=k.bone(rider,side*.208,.87,-.036);
    plate(k,pauldron,'varunaBlue',reflect(side,[[.026,.079,.139],[.107,.131,.083],[.207,.064,.021],
      [.205,-.026,-.078],[.110,-.089,-.092],[.013,-.062,-.019]]),.047);
    sweep(k,pauldron,'trim',reflect(side,[[.018,.031,.138,.018],[.147,.114,.055,.029],
      [.216,.038,-.038,.024],[.165,-.055,-.097,.011]]));
    tools.hinge(pauldron,{side,axis:'z',wind:-.08,strike:.10,phase:.055,follow:arm,ratio:.24});
    sweep(k,parts.head,'varunaBlue',reflect(side,[[.067,.073,-.126,.017],[.132,.016,-.151,.031],
      [.161,-.076,-.119,.024],[.143,-.191,-.045,.009]]),14);
  }
}

function reaper(k,parts,tools){
  const {head,body}=parts;
  helmetRelief(k,head,{face:'veil',iron:'rind',rim:'rind'});
  for(let i=0;i<5;i++){
    const a=Math.PI*.54+i*.44,x=Math.sin(a),z=Math.cos(a);
    tools.silk(body,'黑影 · 裂帷',[[x*.30,.72,z*.29,.109],[x*.58,.38,z*.47,.151],
      [x*.64,-.02,z*.65,.137],[x*.83,-.59-(i%2)*.16,z*.88,.017]],
    {across:[z,0,-x],tint:0x302940,trim:0x79718e,phase:i*.78,flex:1.28});
  }
  for(const side of sides){
    const link=k.bone(body,side*.27,.79,-.102);
    plate(k,link,'rind',reflect(side,[[-.009,.13,.142],[.126,.142,.076],[.241,.057,-.037],
      [.196,-.113,-.11],[.064,-.178,-.095],[-.032,-.043,.027]]),.042);
    sweep(k,link,'trim',reflect(side,[[.033,.132,.097,.017],[.148,.119,.068,.026],
      [.199,.021,-.047,.020],[.109,-.121,-.101,.009]]),15);
    tools.hinge(link,{side,axis:'z',wind:.12,strike:-.16,phase:.07,follow:parts.arms[side<0?0:1]});
  }
}

function eggGhost(k,parts,mobile,tools){
  const {head,body}=parts;
  for(let i=0;i<(mobile?3:5);i++){
    const a=(i+(mobile?.42:.55))*tau/(mobile?3:5),x=Math.sin(a),z=Math.cos(a);
    const charm=k.bone(body,x*.58,.469,z*.58-.102);
    charm.rotation.y=a;
    plate(k,charm,'redBinding',[[-.077,.011,.014],[.069,.032,.004],[.078,-.092,.064],
      [.042,-.18,.089],[-.075,-.147,.067]],.028);
    tools.hinge(charm,{axis:'x',wind:.04,strike:-.11,phase:.03});
    tools.silk(charm,'雞蛋怪 · 鎮殼符紙',[[0,-.094,.075,.041],[.035,-.23,.14,.057],
      [.018,-.44,.162,.057],[-.042,-.66,.212,.016]],
    {tint:0x9f6930,trim:0xd8ad64,phase:i*.78,flex:1.27});
    sweep(k,body,'shellScar',[[x*.477,.47,z*.488-.101,.026],[x*.622,.29,z*.602-.101,.034],
      [x*.688,.034,z*.66-.13,.024],[x*.65,-.23,z*.61-.15,.006]],17);
  }
  sweep(k,head,'shellScar',[[-.387,-.198,.498,.013],[-.311,-.176,.55,.027],[-.211,-.193,.586,.024],
    [-.109,-.215,.607,.014],[-.027,-.291,.56,.004]],14);
}

function straw(k,parts,mobile,tools){
  const {head,body}=parts;
  for(const side of sides){
    sweep(k,head,'edge',reflect(side,[[.12,.134,.13,.011],[.201,.145,.118,.022],
      [.249,.092,.02,.022],[.28,-.025,-.09,.015],[.29,-.132,-.165,.003]]),13);
    for(let i=0;i<(mobile?3:5);i++){
      const t=i*.11;
      tools.silk(body,'稻草怪 · 燒焦草繩',reflect(side,[[.47-t*.19,.19-t,-.27-t*.50,.053],
        [.52+t*.16,-.04-t,-.44-t*.51,.077],[.58+t*.17,-.30-t,-.56-t*.62,.064],
        [.63+t*.14,-.51-t,-.72-t*.59,.012]]),
      {tint:0x7f563a,trim:0xbd9066,phase:i*.64+side*.73,flex:1.18,style:'mane'});
    }
    const knot=k.bone(body,side*.464,.172,-.293);
    const band=reflect(side,[[0,.064,.09],[.062,.113,.027],[.14,.078,-.096],
      [.139,-.046,-.119],[.081,-.106,-.051],[-.01,-.063,.077]]);
    plate(k,knot,'brocade',band,.037);
    sweep(k,knot,'edge',band.slice(0,5).map(([x,y,z])=>[x,y,z-.027,.017]));
    tools.hinge(knot,{side,axis:'z',wind:-.06,strike:.143,phase:.039});
  }
}

const trials={
  'trial-jing-light':{name:'京門明甲',cut:.08,tint:0x825447,trim:0xcf9f76,mask:'sun'},
  'trial-jing-dark':{name:'京門暗旒',cut:.15,tint:0x49282f,trim:0xad665e,mask:'demon'},
  'trial-shang-light':{name:'上門霜披',cut:.22,tint:0x4f728a,trim:0xbac7cf,mask:'veil'},
  'trial-shang-dark':{name:'上門鬼帛',cut:.32,tint:0x373c68,trim:0x878bc6,mask:'tusk'},
  'trial-kai-light':{name:'開門青幟',cut:.41,tint:0x465f55,trim:0xa9c197,mask:'open'},
  'trial-kai-dark':{name:'開門黑幡',cut:.49,tint:0x303f2c,trim:0x82966e,mask:'demon'},
};

function trial(k,parts,spec,tools){
  const {body,head,mount:{knight,helm}}=parts;
  helmetRelief(k,helm,{face:spec.mask,iron:'body',rim:'edge'});
  for(const side of sides){
    const {tint,trim,name,cut}=spec;
    tools.silk(knight,name+' · 馬背旗',reflect(side,[[.14,.77,-.22,.062],[.27,.56,-.48,.107],
      [.36,.24+cut*.13,-.72-cut*.19,.117],[.43,.06,-.94-cut*.30,.018]]),
      {tint,trim,phase:side*.95+cut,flex:1.12+cut*.27});
    tools.silk(body,name+' · 鞍邊綬帶',reflect(side,[[.62,.31,-.49,.052],[.72,.12,-.56,.091],
      [.82,-.12,-.69,.08],[.85,-.31-cut*.16,-.81,.028]]),{tint,trim,phase:side+cut*2,flex:.84});
    const neck=k.bone(head,side*.30,.11,.14);
    plate(k,neck,'body',reflect(side,[[.011,.154,.132],[.094,.103,.077],[.141,-.008,.028],
      [.102,-.12,-.059],[.016,-.173,-.051],[.003,-.042,.144]]),.036);
    sweep(k,neck,'edge',reflect(side,[[.024,.141,.126,.012],[.101,.077,.114,.026],
      [.133,-.019,.035,.019],[.078,-.122,-.057,.006]]));
    tools.hinge(neck,{side,axis:'y',wind:.076,strike:-.137,travel:.058,phase:.041});
  }
}

export function refineBossC(k,parts,entry,mobile,tools){
  const {id}=entry;
  if(champions[id])champion(k,parts,champions[id],tools);
  else if(beasts[id])animalAnatomy(k,parts,beasts[id],mobile,tools);
  else if(fliers[id])flying(k,parts,fliers[id],mobile,tools);
  else if(trials[id])trial(k,parts,trials[id],tools);
  else if(id==='m114'||id==='m115')royalPair(k,parts,id==='m115',tools);
  else if(id==='m122')varuna(k,parts,tools);
  else if(id==='m153')reaper(k,parts,tools);
  else if(id==='m155')eggGhost(k,parts,mobile,tools);
  else if(id==='m156')straw(k,parts,mobile,tools);
  else return false;
  return true;
}
