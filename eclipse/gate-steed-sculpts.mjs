import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {sculptGateRider} from './gate-rider-sculpt.mjs?v=gate-rider-1';

const sides=[-1,1];
const reflect=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);

const gates={
  'trial-jing-light':{finish:[0xc1b6a5,0x635354,0xab713c,0x534744,0xe1d3bc],neck:.12,bulk:.57,haunch:.53,
    nose:.11,ankle:.118,horn:'flame',tack:'sun',drape:[0x715446,0xd9ac77],energy:0xffb278},
  'trial-jing-dark':{finish:[0x302528,0x372125,0x865a39,0x32262b,0x967c65],neck:.06,bulk:.61,haunch:.58,
    nose:.18,ankle:.127,horn:'ram',tack:'gate',drape:[0x47262c,0xac6042],energy:0xf98250},
  'trial-shang-light':{finish:[0xa1b5c4,0x4d6c84,0x8396a7,0x587484,0xd5e7ec],neck:.29,bulk:.45,haunch:.41,
    nose:-.09,ankle:.074,horn:'crystal',tack:'fin',drape:[0x526d8a,0xbcddf4],energy:0x9ce8fa},
  'trial-shang-dark':{finish:[0x242d41,0x33284b,0x68779d,0x252641,0x8693a5],neck:.24,bulk:.41,haunch:.41,
    nose:-.02,ankle:.081,horn:'hook',tack:'iris',drape:[0x45335b,0x8ea5d8],energy:0xa393ed},
  'trial-kai-light':{finish:[0x83998c,0x435747,0x828568,0x415946,0xbfceb4],neck:.16,bulk:.56,haunch:.51,
    nose:.07,ankle:.10,horn:'branch',tack:'vane',drape:[0x506647,0xb1ca86],energy:0xc3ed9a},
  'trial-kai-dark':{finish:[0x303d35,0x28322e,0x65714e,0x222925,0x9da484],neck:.08,bulk:.55,haunch:.46,
    nose:.13,ankle:.096,horn:'scythe',tack:'ribs',drape:[0x303e32,0x85955f],energy:0xa4e077},
  m089:{finish:[0x843c25,0x49202a,0xbb8251,0x51262c,0xbf874d],neck:.12,bulk:.60,haunch:.48,
    nose:.13,ankle:.109,horn:'flame',tack:'gate',drape:[0x7f322c,0xcb8549],energy:0xff743e,gate:'jing',ritual:'kiln'},
  m090:{finish:[0x3f6895,0x222d5e,0x657c9a,0x2a3257,0xa8bdcd],neck:.24,bulk:.47,haunch:.39,
    nose:-.071,ankle:.080,horn:'crystal',tack:'iris',drape:[0x33547f,0x86d9ee],energy:0x66b9ff,gate:'shang',ritual:'frost'},
  m091:{finish:[0x476d48,0x2c3d39,0x799151,0x304337,0xb1b98a],neck:.12,bulk:.54,haunch:.45,
    nose:.091,ankle:.095,horn:'branch',tack:'vane',drape:[0x304b3c,0x8eb56c],energy:0x79ee86,gate:'kai',ritual:'verdant'},
  m092:{finish:[0x746242,0x443729,0xbf994e,0x483a38,0xbeb089],neck:.12,bulk:.57,haunch:.52,
    nose:.169,ankle:.117,horn:'ram',tack:'sun',drape:[0x6e5a3c,0xc8ab6d],energy:0xf9cd62,gate:'jing',ritual:'thunder'},
  m093:{finish:[0x94a0aa,0x626d85,0xb1a994,0x4b5062,0xe0ddce],neck:.205,bulk:.49,haunch:.41,
    nose:-.029,ankle:.084,horn:'hook',tack:'fin',drape:[0x6f7386,0xe1dec2],energy:0xcce7ff,gate:'shang',ritual:'dawn'},
  m094:{finish:[0x312d2f,0x23212d,0x776a4b,0x2d272d,0x74716b],neck:.13,bulk:.63,haunch:.53,
    nose:.173,ankle:.121,horn:'scythe',tack:'ribs',drape:[0x3b3037,0x837452],energy:0xbcaa70,gate:'kai',ritual:'dusk',dark:true},
};

export const gateFinishes=Object.fromEntries(Object.entries(gates).map(([id,{finish:[iron,under,cast,leather,bone]}])=>[id,{
  gateIron:[iron,.67,.49,'iron'],gateUnder:[under,.34,.62,'stone'],
  gateCast:[cast,.72,.44,'bronze'],gateLeather:[leather,.09,.80,'hide'],gateBone:[bone,.22,.58,'bone'],
}]));

const branches={
  flame:[[.14,.17,.33,.053],[.25,.34,.27,.077],[.27,.59,.17,.071],[.24,.78,.048,.038],[.37,.91,-.051,.005]],
  ram:[[.17,.13,.17,.066],[.30,.32,.04,.128],[.44,.44,-.21,.136],[.60,.28,-.31,.098],
    [.67,.109,-.227,.064],[.60,-.019,.048,.037],[.46,.034,.186,.004]],
  crystal:[[.09,.16,.27,.051],[.19,.39,.21,.082],[.28,.61,.12,.058],[.31,.88,-.11,.009]],
  hook:[[.18,.20,.15,.064],[.31,.41,.032,.099],[.53,.53,-.23,.067],[.62,.44,-.43,.034],[.52,.28,-.54,.005]],
  branch:[[.146,.16,.22,.043],[.247,.36,.12,.076],[.39,.57,-.027,.062],[.48,.79,-.175,.051],
    [.38,.93,-.32,.005]],
  scythe:[[.153,.19,.27,.057],[.31,.36,.15,.102],[.55,.56,-.092,.091],[.74,.71,-.36,.066],[.66,.99,-.63,.004]],
};

const armorOutline={
  sun:[[0,.20,.121],[.26,.26,.04],[.54,.24,-.102],[.64,.03,-.21],[.57,-.24,-.264],[.28,-.36,-.20],[0,-.30,.10]],
  gate:[[0,.18,.077],[.25,.33,.04],[.44,.362,-.10],[.57,.25,-.25],[.62,.05,-.39],[.55,-.24,-.37],
    [.31,-.29,-.30],[.14,-.43,-.11],[0,-.31,.025]],
  fin:[[0,.29,.14],[.29,.333,.057],[.49,.37,-.15],[.64,.55,-.65],[.59,.19,-.53],[.47,-.05,-.28],[.20,-.20,.11]],
  iris:[[0,.179,.132],[.18,.316,.074],[.40,.31,-.046],[.61,.36,-.37],[.65,.12,-.49],
    [.50,-.16,-.31],[.30,-.31,-.12],[0,-.24,.085]],
  vane:[[0,.18,.08],[.22,.30,.041],[.46,.28,-.067],[.65,.19,-.23],[.76,.048,-.61],[.50,-.255,-.36],
    [.28,-.321,-.13],[.097,-.26,.02]],
  ribs:[[0,.21,.066],[.23,.33,-.034],[.47,.44,-.238],[.64,.575,-.704],[.57,.29,-.51],[.62,.13,-.39],
    [.54,-.17,-.29],[.37,-.295,-.17],[.092,-.20,.029]],
};

const crownOutline={
  sun:[[.098,.32,-.012],[.188,.371,-.079],[.25,.46,-.195],[.314,.64,-.365],[.248,.463,-.376],[.181,.33,-.22]],
  gate:[[.139,.301,-.06],[.242,.395,-.091],[.366,.424,-.173],[.419,.276,-.152],[.397,.094,-.105],[.269,.20,-.23]],
  fin:[[.055,.34,-.065],[.14,.62,-.072],[.32,.78,-.389],[.27,.515,-.336],[.246,.39,-.231],[.141,.29,-.112]],
  iris:[[.149,.244,-.031],[.258,.391,-.133],[.41,.376,-.26],[.488,.28,-.47],[.289,.13,-.33],[.205,.074,-.10]],
  vane:[[.094,.315,-.046],[.22,.401,-.106],[.35,.44,-.26],[.479,.558,-.433],[.38,.368,-.355],[.235,.258,-.21]],
  ribs:[[.094,.312,-.107],[.175,.473,-.221],[.287,.577,-.33],[.437,.688,-.497],[.37,.531,-.578],[.271,.304,-.275]],
};

const volume=(k,parent,finish,sections,mobile,settings={})=>k.geometry(parent,finish,
  sculptVolume(sections,{sides:mobile?10:15,rings:mobile?12:19,section:2.5,ridge:.22,...settings}));
const plate=(k,parent,finish,path,thickness=.044)=>k.sculpt.plate(parent,finish,path,thickness,.013);
const line=(k,parent,finish,path,steps=9)=>k.sculpt.sweep(parent,finish,path,{steps,sides:6,ridge:.18});

function carapace(k,body,head,form,mobile){
  const {neck,bulk,haunch,nose,tack,horn}=form;
  const predator=tack==='vane'||tack==='ribs';
  const frost=tack==='fin'||tack==='iris';
  volume(k,body,'gateLeather',[[0,.105,-1.24,haunch*.55,haunch*.45],[0,.18,-.92,haunch,haunch*.82],
    [0,.16,-.50,haunch*.85,.40],[0,.14,-.18,bulk*.83,.39],[0,.18,.23,bulk,.43],
    [0,.25,.56,bulk*.91,.40],[0,.33,.77,bulk*.46,.27]],mobile,{rings:18,ridge:.16});
  volume(k,body,'gateUnder',[[0,-.21,.38,bulk*.62,.26],[0,.025,.59,bulk*.74,.31],
    [0,.24,.696,bulk*.64,.34],[0,.45+neck*.64,.799,bulk*.56,.30],[0,.51+neck,.989,.23,.23]],mobile);
  volume(k,head,'gateUnder',[[0,-.012,-.25,.20,.23],[0,.04,-.062,.268,.246],[0,.035,.19,.239,.224],
    [0,-.076,.405+nose,.202,.143],[0,-.16,.548+nose,.164,.101]],mobile,{section:frost?2.11:3.05});
  volume(k,head,'gateBone',[[0,-.136,.332+nose,.108,.084],[0,-.181,.474+nose,.169,.089],
    [0,-.161,.605+nose,.154,.066],[0,-.140,.662+nose,.091,.047]],mobile,{section:2.77});
  plate(k,head,'gateIron',[[0,.26,.082],[.151,.253,.181],[.209,.18,.257+nose*.65],[.122,.028,.471+nose],
    [0,-.069,.581+nose],[-.122,.028,.471+nose],[-.209,.18,.257+nose*.65],[-.151,.253,.181]],.06);
  line(k,head,'gateCast',[[0,.305,.085,.021],[0,.213,.277,.033],[0,.108,.436+nose,.024],[0,-.041,.574+nose,.005]]);
  for(const side of sides){
    const mk=points=>reflect(side,points);
    const temple=mk([[.129,.181,.318+nose*.55],[.241,.225,.166],[.311,.141,.007],
      [.292,-.054,.063],[.181,-.174,.31+nose*.59],[.155,-.115,.421+nose]]);
    plate(k,head,'gateIron',temple,.054);
    line(k,head,'gateBone',temple.slice(1,5).map(([x,y,z],i)=>[x+side*.018,y+.015,z+.018,[.031,.024,.019,.004][i]]));
    line(k,head,'glow',mk([[.162,.061,.383+nose*.55,.003],[.202,.079,.34+nose*.41,.012],
      [.241,.116,.243+nose*.27,.008],[.255,.129,.192,.003]]));
    volume(k,head,horn==='crystal'?'gateBone':'gateIron',mk(branches[horn].map(([x,y,z,r])=>[x,y,z,r,r*(frost?.74:.92)])),
      mobile,{rings:horn==='ram'?18:12,section:horn==='crystal'?3.5:2.32});
    line(k,head,'gateCast',mk(branches[horn].map(([x,y,z,r])=>[x+.032,y+.032,z+.029,r*.31])));
    if(predator||frost){
      const first=branches[horn][2];
      const spur=mk([[first[0],first[1]-.03,first[2],.053],
        [first[0]+.14,first[1]+.10,first[2]-.19,.042],[first[0]+.06,first[1]+.36,first[2]-.27,.006]]);
      line(k,head,'gateBone',spur,12);
      line(k,head,'gateCast',mk([[.139,-.14,.521+nose,.017],[.203,-.18,.544+nose,.029],
        [.229,-.111,.571+nose,.024],[.216,-.009,.595+nose,.005]]),10);
    }
    for(let i=0;i<(mobile?3:5);i++){
      const z=.364+i*.093,y=.37+i*.074+neck*i*.16;
      const reach=predator?.12:frost?-.04:.03;
      const nib=mk([[.06,y+.11,z+.19],[bulk*.61,y+.089,z+.109],[bulk*.92+reach,y,z+.036],
        [bulk*.84+reach,y-.158,z-.047],[bulk*.66,y-.207,z+.047],[.12,y-.139,z+.26]]);
      plate(k,body,i%2?'gateUnder':'gateIron',nib,.050);
      line(k,body,'gateCast',nib.slice(1,5).map(([x,y,z],j)=>[x+side*.018,y+.011,z+.019,[.023,.031,.014,.004][j]]));
    }
  }
}

function lowerLeg(k,leg,side,hind,form,mobile){
  const {tack,ankle}=form;
  const heel=hind?-.19:.10, frost=tack==='fin'||tack==='iris', claw=tack==='vane'||tack==='ribs';
  volume(k,leg,'gateLeather',[[0,.09,0,.18,.23],[side*.05,-.105,-.047,.215,.19],
    [side*.016,-.28,heel*.71,.148,.145],[0,-.47,heel,ankle*1.19,.113]],mobile,{ridge:.27});
  const fetlock=k.bone(leg,0,-.429,heel);
  fetlock.name=hind?'後腿 · 跗關節':'前腿 · 球節';
  volume(k,fetlock,'gateUnder',[[0,.03,0,ankle,.095],[0,-.14,.027,ankle*.94,.081],
    [-side*.022,-.28,.13,ankle*.81,.069],[0,-.43,.23,ankle*.94,.074]],mobile);
  const hoofZ=hind?.16:.20;
  for(let toe=0;toe<(claw?3:2);toe++){
    const x=(toe-(claw?1:.5))*(claw?.083:.105);
    const reach=hoofZ+(claw?.090-Math.abs(x)*.48:0);
    volume(k,fetlock,frost||claw?'gateBone':'gateIron',[[x,-.38,hoofZ-.04,.062,.065],
      [x,-.463,hoofZ+.04,.072,.071],[x,-.529,reach+.168,.064,.053],[x,-.546,reach+.200,.040,.027]],mobile,
      {sides:7,rings:7,section:claw?2.3:3.4});
  }
  const size=frost?.84:claw?1.12:1;
  const keel=reflect(side,[[.037,.077,.084],[-.099,.024,.097],[-.129,-.080,.163],
    [-.102,-.256,.207],[.03,-.372,.25],[.118,-.261,.236],[.156,-.082,.150]]);
  const border=keel.map(([x,y,z])=>[x*size,y,z]);
  plate(k,fetlock,'gateIron',border,.047);
  line(k,fetlock,'gateCast',border.slice(1,6).map(([x,y,z],i)=>[x,y+.014,z+.030,[.019,.026,.024,.023,.006][i]]));
  const rear=reflect(side,[[.115,.035,-.015],[.128,-.029,-.082],[.085,-.196,-.060],
    [.046,-.366,.070],[-.066,-.301,.049],[-.095,-.112,-.058],[-.074,-.005,-.080]]);
  plate(k,fetlock,'gateUnder',rear,.032);
  line(k,fetlock,'gateBone',rear.slice(1,5).map(([x,y,z],i)=>[x,y,z-.031,[.016,.021,.013,.003][i]]));
  if(claw||tack==='gate')line(k,leg,'gateIron',reflect(side,[[.112,-.074,.115,.046],
    [.197,-.238,.097,.063],[.166,-.383,.054,.051],[.134,-.49,.034,.007]]));
  return fetlock;
}

function flankLamellae(k,body,form,mobile){
  const {bulk,tack}=form;
  const styles={
    sun:{columns:4,start:.27,fall:.075,flare:.19,needle:.14,light:'gateBone'},
    gate:{columns:4,start:.23,fall:.11,flare:.23,needle:.16,light:'glow'},
    fin:{columns:3,start:.16,fall:.055,flare:.32,needle:.33,light:'gateBone'},
    iris:{columns:3,start:.10,fall:.055,flare:.19,needle:.31,light:'glow'},
    vane:{columns:4,start:.19,fall:.057,flare:.31,needle:.26,light:'gateBone'},
    ribs:{columns:4,start:.23,fall:.081,flare:.36,needle:.31,light:'glow'},
  };
  const {columns,start,fall,flare,needle,light}=styles[tack];
  for(const side of sides){
    const mk=points=>reflect(side,points);
    for(let i=0;i<columns;i++){
      const f=i/(columns-1),z=.52-f*.99,y=start-i*fall*.20;
      const x=bulk*(.84+.14*Math.sin(f*Math.PI));
      const shingle=mk([[x*.84,y+.217,z+.132],[x+.093,y+.235,z+.041],[x+.145,y+.103,z-.096],
        [x+.093+flare*.16,y-.113,z-needle],[x+.065,y-.26-f*fall,z-.188-needle*.44],
        [x-.012,y-.269,z+.015],[x-.063,y-.161,z+.087]]);
      plate(k,body,i%2?'gateUnder':'gateIron',shingle,.061);
      line(k,body,i===1?light:'gateCast',shingle.slice(1,6).map(([x,y,z],i)=>[x+side*.045,y+.011,z-.015,
        [.025,.019,.024,.019,.004][i]]),10);
      const seam=mk([[x+.123,y+.148,z+.071,.011],[x+.163,y+.068,z-.035,.019],
        [x+.143,y-.050,z-needle*.42,.014],[x+.103,y-.194,z-needle*.63,.005]]);
      line(k,body,'gateCast',seam,8);
      if(!mobile||i%2===0)k.mesh(body,'metal','gateBone',side*(x+.183),y+.106,z-.007,.044,.052,.04,.24,.57,side*.54);
    }
    line(k,body,'gateLeather',mk([[.297,.575,-.386,.058],[bulk+.084,.398,-.42,.073],
      [bulk+.147,.156,-.39,.061],[bulk+.121,-.089,-.326,.054],[bulk-.071,-.267,-.273,.052]]),13);
    line(k,body,'gateCast',mk([[.305,.612,-.395,.015],[bulk+.111,.413,-.434,.020],
      [bulk+.179,.167,-.405,.021],[bulk+.159,-.063,-.346,.011],[bulk-.034,-.31,-.273,.009]]),12);
  }
}

function crown(k,helm,tack){
  for(const side of sides){
    const chiseled=reflect(side,crownOutline[tack]);
    plate(k,helm,tack==='fin'?'gateBone':'gateIron',chiseled,.038);
    line(k,helm,tack==='iris'?'glow':'gateCast',chiseled.slice(0,5).map(([x,y,z],i)=>[x+side*.019,y+.026,z+.006,
      [.014,.029,.021,.014,.004][i]]),11);
  }
  if(tack==='sun'||tack==='vane'){
    const height=tack==='sun'?.882:.661;
    line(k,helm,'gateCast',[[0,.333,-.099,.052],[0,.487,-.185,.077],[0,height*.84,-.22,.064],
      [0,height,-.379,.004]],12);
    line(k,helm,'gateBone',[[0,.379,-.03,.012],[0,.581,-.133,.033],[0,height*.89,-.238,.017],
      [0,height,-.358,.003]],11);
  }
}

function barding(k,body,tail,knight,helm,form,mobile){
  const {tack,neck}=form;
  const fin=tack==='fin',iris=tack==='iris',vane=tack==='vane',ribs=tack==='ribs',gate=tack==='gate';
  const broad=tack==='sun'||gate;
  const moving=[];
  for(const side of sides){
    const mk=points=>reflect(side,points);
    const ham=k.bone(body,0,.13,-.845);
    ham.name='馬臀鎧 · 後鞍';
    const shell=mk(armorOutline[tack].map(([x,y,z])=>[x,y+.094,z]));
    plate(k,ham,'gateIron',shell,.080);
    line(k,ham,'gateCast',shell.map(([x,y,z],i)=>[x,y+.010,z-.048,i===0?.011:.021]),15);
    const relief=mk([[.08,.225,.096],[.27,.283,.026],[.42,.238,-.091],[.51,.108,-.201],
      [.39,-.115,-.234],[.19,-.148,-.133],[.11,-.008,.028]]);
    plate(k,ham,'gateUnder',relief,.038);
    if(broad||iris){
      for(let i=0;i<(mobile?7:10);i++){
        const a=i*Math.PI*2/(mobile?7:10),end=iris?.18:.192;
        const x=.308+Math.cos(a)*.12,y=.091+Math.sin(a)*.166;
        line(k,ham,i%3?'gateCast':'glow',mk([[.308+Math.cos(a)*.047,.091+Math.sin(a)*.064,-.165,.014],
          [x,y,-.187,.021],[.308+Math.cos(a)*end,.091+Math.sin(a)*.189,-.177,.003]]),6);
      }
      k.mesh(ham,'gem','glow',side*.308,.093,-.197,.048,.056,.022);
    }else{
      for(let i=0;i<4;i++){
        line(k,ham,i===2?'glow':'gateBone',mk([[.116+i*.019,.246-i*.055,.024,.011],
          [.34+i*.020,.161-i*.041,-.111,.020],[.54+i*.017,.16-i*.056,-.290,.011],
          [.64+i*.019,.20-i*.054,-.39-i*.032,.003]]),8);
      }
    }
    moving.push({part:ham,side,flutter:(!broad?.31:.17),lag:.44});

    const shoulder=k.bone(knight,side*(vane||ribs?.29:.225),.62,-.102);
    shoulder.name='神將 · 背肩套甲';
    const flare=fin?.39:iris?.31:ribs?.35:vane?.29:gate?.24:.19;
    const rise=fin?.46:ribs?.47:vane?.19:iris?.33:gate?.29:.22;
    for(let i=0;i<(mobile?3:4);i++){
      const row=i*.113;
      const plume=mk([[.008,.167-row,.029],[.14,.220-row,-.029],[.19+flare*.47,.218+rise*.26-row,-.16],
        [.165+flare,.108+rise-row*1.23,-.31-flare*1.11],[.189+flare*.27,-.111-row,-.329],
        [.11,-.16-row,-.19],[.029,-.104-row,-.017]]);
      plate(k,shoulder,i%2?'gateUnder':'gateIron',plume,.057);
      line(k,shoulder,flare>.30&&i===0?'glow':'gateCast',plume.slice(1,6)
        .map(([x,y,z],j)=>[x+side*.013,y+.009,z-.019,[.011,.026,.020,.014,.004][j]]),11);
    }
    moving.push({part:shoulder,side,flutter:.19,lag:.59});
    const tailFork=mk([[.04,.11,.045,.070],[.08,.169,-.161,.079],[.16,.232,-.381,.064],
      [.24+(fin||vane?.10:0),.29+(gate||ribs?.15:0),-.62,.039],[.33,.16+neck,-.86,.004]]);
    line(k,tail,fin?'gateBone':'gateIron',tailFork,15);
    line(k,tail,'gateCast',tailFork.map(([x,y,z,r])=>[x+side*.016,y+.047,z-.021,r*.49]),12);
    for(let i=0;i<3;i++){
      const a=i*.056;
      line(k,tail,i===1?'gateUnder':'gateLeather',mk([[.086+a,.194,-.223-i*.075,.036],
        [.14+a,.212-i*.03,-.428-i*.059,.044],[.249+a,.094-i*.052,-.688-i*.099,.006]]),9);
    }
  }
  const saddle=[
    [-.27,.551,-.62],[-.10,.60,-.74],[.10,.60,-.74],[.27,.551,-.62],
    [.26,.398,-.82],[.11,.356,-.96],[0,.314,-1.008],[-.11,.356,-.96],[-.26,.398,-.82],
  ];
  plate(k,body,'gateUnder',saddle,.088);
  line(k,body,'gateCast',saddle.map(([x,y,z],i)=>[x,y+.025,z-.037,i===6?.025:.020]),14);
  const lines=gate?5:ribs?4:3;
  for(let i=0;i<lines;i++){
    const y=.47-i*.082,z=-.841-i*.048,x=.199-i*.026;
    line(k,body,i===1?'glow':'gateIron',[[-x,y+.033,z+.043,.012],
      [-x*.51,y-.021,z-.068,.024],[0,y-.034,z-.099,.027],[x*.51,y-.021,z-.068,.024],[x,y+.033,z+.043,.012]],9);
  }
  crown(k,helm,tack);
  return moving;
}

export function sculptGateSteed(k,entry,mobile,trial,shapeWeapon){
  const form=gates[entry.id];
  if(!form)return null;
  const [ ,trialGate,contrast]=entry.id.split('-');
  const gate=form.gate??trialGate,dark=form.dark??contrast==='dark';
  const {root,bone,mesh}=k;
  const float=gate==='shang',mountHeight=float?1.185:1.09;
  const body=bone(root,0,mountHeight,0),head=bone(body,0,.27+form.neck,1.025);
  const tail=bone(body,0,.18,-1.19);
  const knight=bone(body,0,.558,-.28),helm=bone(knight,0,.99,.009);
  const hand=bone(knight,.43,.34,.17),mantle=bone(knight,0,.57,-.22),embers=bone(knight,0,.46,-.20);
  const crest=bone(helm,0,.32,-.202);
  carapace(k,body,head,form,mobile);
  flankLamellae(k,body,form,mobile);
  volume(k,knight,'gateUnder',[[0,.12,.024,.222,.141],[0,.33,.013,.297,.259],
    [0,.57,-.018,.307,.265],[0,.755,-.02,.305,.214],[0,.829,-.024,.17,.14]],mobile,
    {ridge:.18});
  sculptGateRider(k,{knight,helm,hand,gate,dark},mobile);
  shapeWeapon(k,hand,trial);
  const moving=barding(k,body,tail,knight,helm,form,mobile);
  if(form.ritual)ritualStirrups(k,knight,body,moving,form);
  for(const side of sides){
    const chest=reflect(side,[[.03,.70,.22],[.13,.785,.19],[.29,.742,.123],[.34,.543,.177],
      [.25,.345,.240],[.172,.236,.260],[.036,.34,.284]]);
    plate(k,knight,'gateIron',chest,.064);
    line(k,knight,'gateCast',chest.slice(1,6).map(([x,y,z],i)=>[x,y,z+.034,[.016,.024,.029,.021,.005][i]]),11);
    const vertebra=reflect(side,[[.034,.74,-.236],[.116,.701,-.264],[.191,.596,-.214],[.174,.45,-.254],
      [.088,.305,-.258],[.035,.336,-.268]]);
    plate(k,knight,'gateIron',vertebra,.061);
    line(k,knight,'glow',vertebra.slice(1,5).map(([x,y,z],i)=>[x*.74,y,z-.047,[.002,.015,.019,.004][i]]));
    mesh(knight,'gem','gateCast',side*.16,.254,-.335,.080,.13,.045,.3,side*.28,.14);
  }
  const legs=[],ankles=[];
  for(const side of sides)for(const z of [-.785,.648]){
    const hind=z<0;
    const base=side*(hind?form.haunch*.75:form.bulk*.68);
    const leg=bone(root,base,mountHeight,z);
    legs.push(leg);
    ankles.push(lowerLeg(k,leg,side,hind,form,mobile));
  }
  return {
    body,head,legs,tail,crest,gateRider:true,mount:{knight,helm,hand,mantle,embers,trial},
    gateDress(tools){
      const [tint,trim]=form.drape;
      const {tack}=form;
      for(const side of sides){
        const mk=points=>reflect(side,points);
        const rust=tack==='gate',frost=tack==='fin'||tack==='iris',verdant=tack==='vane'||tack==='ribs';
        tools.silk(mantle,entry.name+' · 背幟',mk([[.113,.13,-.087,.066],[.21,.046,-.35,.140],
          [.31,-.16,-.57,.132],[.39+(verdant?.22:0),-.34+(frost?.12:0),-.82,.102],
          [.44+(verdant?.31:0),-.51+(frost?.13:0),-1.104,.009]]),
        {tint,trim,phase:side*.85,style:rust?'cloth':frost?'woven':'cloth',flex:frost?1.49:1.19});
        tools.silk(body,entry.name+' · 後鞍裙',mk([[.39,.46,-.61,.10],[.52,.28,-.71,.142],
          [.61,-.026,-.79,.139],[.60,-.262,-.90,.093],[.575,-.42,-.974,.011]]),
        {tint,trim,phase:side*1.14,flex:.91,across:[.03,.41,.88]});
      }
      return true;
    },
    polishEnergy:{tint:form.energy,shape:gate==='jing'?(dark?'mist':'sigils'):gate==='shang'?(dark?'bolts':'mist'):'ribbons'},
    cataloguePose({beat,step,wind,strike,travel,fall,stage}){
      const offset=float?(Math.sin(beat*1.4)*.041+stage*.031):0;
      body.position.y=mountHeight+offset;
      ankles.forEach((ankle,i)=>{
        legs[i].position.y=mountHeight+offset;
        const pace=Math.sin(step+i*Math.PI*.81);
        ankle.rotation.x=.07-travel*(.31+Math.max(0,pace)*.55)+wind*.23-strike*.33-fall*.14;
      });
      for(const {part,side,flutter,lag} of moving){
        part.rotation.x=wind*.110-strike*flutter+Math.sin(beat*1.26-lag)*travel*.14;
        part.rotation.z=side*(Math.sin(beat*1.07-lag)*.052+travel*.12+stage*.06);
      }
    },
  };
}

function ritualStirrups(k,knight,body,moving,form){
  const slender=['frost','dawn'].includes(form.ritual);
  const fourDoors=['thunder','dawn','dusk'].includes(form.ritual);
  for(const side of sides){
    const fan=outline=>reflect(side,outline);
    const guard=k.bone(knight,side*.255,.579,-.12);
    guard.name='門神將 · 鞍上護幟';
    const curl=form.ritual==='verdant'?.29:form.ritual==='dusk'?.24:slender?.21:.15;
    for(let row=0;row<3;row++){
      const y=.26-row*.135,flair=curl+row*.08,z=-.062-row*.052;
      const frame=fan([[.008,y-.044,z+.076],[.091,y+.121,z+.041],[.159,y+.172,z-.084],
        [flair,y+.082,z-.255],[flair+.031,y-.104,z-.370],[flair*.67,y-.167,z-.300],[.057,y-.152,z-.095]]);
      plate(k,guard,row%2?'gateUnder':'gateIron',frame,.043);
      line(k,guard,'gateCast',frame.slice(1,6).map(([x,h,Z],i)=>[x+side*.017,h+.018,Z-.017,[.013,.025,.024,.018,.005][i]]),11);
      if(row===1)line(k,guard,'glow',fan([[.077,y+.014,z+.069,.007],[.153,y+.048,z-.071,.017],
        [flair*.88,y-.004,z-.137,.012],[flair,y-.085,z-.241,.004]]));
    }
    moving.push({part:guard,side,flutter:.17,lag:side+2.31});
    const foot=k.bone(body,side*(form.bulk*.89),.235,-.24);
    foot.name='門神將 · 門紋踏環';
    for(let t=0;t<(fourDoors?4:3);t++){
      const y=t*.093,z=-.153+t*.075;
      line(k,foot,t%2?'gateIron':'gateCast',fan([[.010,y+.077,z+.054,.021],[.20,y+.042,z+.035,.037],
        [.24,y-.140,z+.02,.044],[.21,y-.288,z-.012,.035],[.103,y-.314,z-.020,.019],
        [.064,y-.26,z-.010,.006]]));
    }
    if(fourDoors)k.mesh(foot,'gem','glow',side*.228,.014,-.033,.031,.071,.043,0,side*.77);
    moving.push({part:foot,side,flutter:.18,lag:side+4.8});
  }
}
