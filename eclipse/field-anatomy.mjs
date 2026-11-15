import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);
const plate=(k,bone,finish,points,depth)=>k.sculpt.plate(bone,finish,points,depth,depth*.32);
const ridge=(k,bone,finish,points,mobile)=>k.sculpt.sweep(bone,finish,points,{
  sides:mobile?5:7,steps:mobile?7:10,ridge:.17,
});
const stud=(k,bone,finish,x,y,z,w,h,d,tilt=0)=>k.mesh(bone,'gem',finish,x,y,z,w,h,d,0,0,tilt);
const relief=(k,bone,finish,points,mobile,seed)=>k.geometry(bone,finish,sculptVolume(points,{
  rings:mobile?9:15,sides:mobile?7:11,section:2.24,ridge:.17,seed,
}));

// [width, front depth, eye line, crown height, local back depth, back width, seam finish]
const armour={
  imp:[.215,.342,.033,.379,-.389,.373,'edge'],
  cultist:[.162,.283,.089,.211,-.268,.237,'trim'],
  knight:[.241,.365,.056,.269,-.312,.361,'trim'],
  stalker:[.188,.289,.066,.229,-.301,.237,'edge'],
  sentinel:[.217,.340,.082,.302,-.281,.309,'edge'],
  oracle:[.197,.286,.061,.265,-.255,.249,'trim'],
  drummer:[.228,.359,.061,.247,-.348,.353,'trim'],
  spriggan:[.200,.312,.028,.319,-.263,.258,'body'],
  coffin:[.282,.424,.050,.317,-.412,.400,'trim'],
  toller:[.193,.305,.055,.256,-.277,.281,'trim'],
};
const crownCuts={
  imp:[[.023,.12],[.62,.07],[1.05,.42],[1.29,.01],[1.16,-.134],[.64,-.14]],
  cultist:[[.014,.04],[.45,.065],[1.06,.25],[1.19,.04],[.97,-.04],[.51,-.12]],
  knight:[[.023,.03],[.64,.15],[1.29,.20],[1.33,.02],[1.02,-.13],[.58,-.106]],
  stalker:[[.035,.068],[.47,.098],[1.14,.041],[1.42,-.01],[.97,-.16],[.48,-.12]],
  sentinel:[[.038,.13],[.84,.22],[1.32,.41],[1.38,.12],[1.10,-.11],[.49,-.12]],
  oracle:[[.026,.25],[.61,.18],[1.08,.21],[1.20,.06],[.92,-.12],[.45,-.16]],
  drummer:[[.03,.10],[.51,.09],[1.09,.15],[1.31,.04],[1.11,-.11],[.52,-.14]],
  spriggan:[[.025,.21],[.59,.11],[1.21,.36],[1.09,.02],[1.31,-.11],[.48,-.134]],
  coffin:[[.034,.05],[.51,.10],[1.18,.13],[1.18,-.01],[.91,-.15],[.51,-.16]],
  toller:[[.03,.18],[.61,.11],[1.11,.18],[1.25,.037],[1.05,-.11],[.52,-.14]],
};

function browAndCollar(k,parts,id,mobile){
  const {body,head}=parts;
  const [w,z,eyeY,crown,back,shoulder,trim]=armour[id];
  const hood=['cultist','stalker','oracle','toller'].includes(id);
  const bare=id==='imp'||id==='spriggan';
  const bone=id==='imp'?'edge':'body';
  for(const side of sides){
    const socket=mirror(side,[[w*.19,eyeY+.02,z+.035],[w*.60,eyeY+.071,z+.021],[w*.93,eyeY+.073,z-.029],
      [w*1.09,eyeY+.018,z-.077],[w*.66,eyeY-.044,z-.018],[w*.29,eyeY-.03,z+.033]]);
    plate(k,head,'deep',socket,.019);
    ridge(k,head,trim,socket.slice(0,4).map(([x,y,z],i)=>[x,y+.012,z+.013,[.005,.020,.017,.003][i]]),mobile);
    stud(k,head,'glow',side*w*.54,eyeY+.009,z+.027,w*.109,.013,.011,side*.145);
    const sideCut=mirror(side,crownCuts[id].map(([u,v],i)=>[u*w,v+crown*.46,z-[.067,.13,.223,.29,.32,.22][i]]));
    plate(k,head,hood?'deep':bone,sideCut,.029);
    ridge(k,head,trim,sideCut.slice(1,5).map(([x,y,z],i)=>[x,y+.008,z+.018,[.007,.018,.015,.004][i]]),mobile);
    const jaw=mirror(side,[[w*.18,-.139,z+.026],[w*.56,-.107,z+.018],[w*.92,-.053,z-.042],
      [w*1.14,-.071,z-.100],[w*.97,-.172,z-.131],[w*.5,-.214,z-.04]]);
    plate(k,head,bare?'body':hood?'deep':'edge',jaw,.027);
    ridge(k,head,bare?'edge':trim,jaw.slice(1,5).map(([x,y,z],i)=>[x,y-.006,z+.011,[.009,.018,.016,.003][i]]),mobile);
    if(bare){
      ridge(k,head,'edge',mirror(side,[[w*.50,-.169,z+.021,.017],[w*.57,-.12,z+.041,.012],
        [w*.58,-.065,z+.054,.0015]]),mobile);
    }
    for(let row=0;row<(mobile?2:3);row++){
      const y=.46-row*.132,width=shoulder*(1-row*.12);
      const backPlate=mirror(side,[[.033,y+.047,back-.022],[width*.48,y+.106,back-.041],
        [width*.92,y+.028,back-.026],[width*1.14,y-.049,back+.052],
        [width*.73,y-.095,back+.023],[.057,y-.108,back-.041]]);
      plate(k,body,row%2?'body':'deep',backPlate,.036);
      ridge(k,body,trim,backPlate.slice(1,5).map(([x,y,z],i)=>[x*1.01,y-.01,z-.025,[.004,.016,.021,.004][i]]),mobile);
      stud(k,body,trim,side*width*.71,y-.02,back-.055,.013,.020,.010,side*.21);
    }
    const arm=parts.arms[side>0?1:0];
    if(!hood&&arm){
      const cap=mirror(side,[[.04,.120,-.119],[.127,.196,-.161],[.249,.117,-.14],
        [.238,-.017,-.128],[.161,-.10,-.093],[.054,-.045,-.127]]);
      plate(k,arm,bare?'edge':'body',cap,.037);
      ridge(k,arm,trim,cap.slice(1,5).map(([x,y,z],i)=>[x,y+.012,z-.014,[.005,.013,.018,.003][i]]),mobile);
    }
  }
  if(!hood){
    relief(k,head,bone,[[0,-.13,z+.052,w*.101,.012],[0,-.061,z+.082,w*.18,.045],
      [0,.011,z+.08,w*.12,.024],[0,.125,z+.038,w*.17,.027],[0,crown,z-.089,w*.096,.039]],mobile,w*17);
  }
}

function lampClasp(k,{body,head},mobile,id){
  for(const side of sides){
    const band=mirror(side,[[.045,.58,.084,.013],[.143,.51,.28,.027],[.211,.36,.305,.018],
      [.207,.25,.306,.014],[.262,.185,.227,.003]]);
    ridge(k,body,'trim',band,mobile);
    if(id==='toller'){
      const guard=mirror(side,[[.064,.586,-.246],[.19,.70,-.253],[.329,.714,-.298],
        [.327,.605,-.347],[.267,.51,-.356],[.11,.511,-.321]]);
      plate(k,body,'trim',guard,.032);
      ridge(k,body,'edge',guard.slice(1,5).map(([x,y,z],i)=>[x,y,z-.024,[.008,.012,.012,.002][i]]),mobile);
    }else if(id==='oracle'){
      ridge(k,head,'edge',mirror(side,[[.082,.135,.117,.011],[.162,.208,.039,.019],
        [.206,.263,-.066,.017],[.25,.227,-.17,.005]]),mobile);
    }
  }
  stud(k,body,'trim',0,.359,.301,.05,.068,.031);
  stud(k,body,'glow',0,.359,.326,.023,.037,.018);
}

function crackedImp(k,{body,head},mobile,id){
  for(const side of sides){
    const outer=mirror(side,[[.16,.081,.258,.01],[.225,.063,.202,.027],[.254,.022,.082,.021],
      [.237,-.097,.008,.016],[.206,-.153,-.091,.002]]);
    ridge(k,head,id==='imp'?'edge':'body',outer,mobile);
    for(let row=0;row<(mobile?3:5);row++){
      const y=.16+row*.082,w=.14+row*.049;
      const crack=mirror(side,[[w*.63,y+.019,.294,.002],[w*.82,y+.062,.329,.005],
        [w*1.02,y+.037,.346,.004],[w*1.21,y+.111,.332,.002]]);
      ridge(k,body,row===2?'glow':id==='imp'?'deep':'edge',crack,mobile);
    }
  }
}

function shellChannels(k,{body,head},id,mobile){
  const beetle=id==='scarab',venom=id==='weaver';
  const w=beetle?.43:venom?.43:id==='hound'?.369:.34;
  const z=beetle||venom?.32:.35;
  const high=beetle?.22:venom?.175:.183;
  for(const side of sides){
    const cheek=mirror(side,[[.065,high,z-.05],[.163,high+.061,z-.093],[.234,high+.028,z-.18],
      [.277,high-.09,z-.205],[.236,high-.180,z-.15],[.13,high-.206,z-.022]]);
    plate(k,head,'deep',cheek,.032);
    ridge(k,head,'edge',cheek.slice(0,5).map(([x,y,z],i)=>[x,y+.017,z+.015,[.007,.030,.026,.021,.004][i]]),mobile);
    const jaw=mirror(side,[[.114,high-.126,z-.013,.018],[.176,high-.158,z+.07,.024],
      [.170,high-.184,z+.14,.016],[.132,high-.199,z+.165,.003]]);
    ridge(k,head,venom?'trim':'edge',jaw,mobile);
    const across=beetle?3:venom?4:2;
    for(let i=0;i<across;i++)stud(k,head,'glow',side*(.114+i*.034),high-.067+i*.03,z-.027-i*.047,
      .019-i*.002,.019-i*.002,.012,side*.34);
    const count=mobile?3:5;
    for(let n=0;n<count;n++){
      const t=n/(count-1),length=beetle||venom?1.10:1.28;
      const zz=.13-length*t,y=(beetle?.57:venom?.45:.285)+Math.sin(t*Math.PI)*.14;
      const reach=w*(.75+.20*Math.cos(t*2));
      const flap=mirror(side,[[.047,y+.076,zz+.084],[reach*.68,y+.039,zz+.143],[reach,y-.025,zz+.018],
        [reach*.98,y-.097,zz-.14],[reach*.59,y-.012,zz-.199],[.093,y+.061,zz-.13]]);
      plate(k,body,n%2?'body':'deep',flap,.039);
      ridge(k,body,beetle?'edge':venom?'trim':id==='hound'?'edge':'glow',
        flap.slice(2,6).map(([x,y,z],i)=>[x,y+.022,z,[.004,.016,.014,.003][i]]),mobile);
      if(!mobile)ridge(k,body,'body',flap.slice(0,4).map(([x,y,z],i)=>[x*.97,y+.02,z,[.003,.01,.013,.002][i]]),mobile);
    }
  }
}

function maskShreds(k,{body,head},id,mobile){
  const ghost=id==='veil',wax=id==='wax',many=id==='eyes';
  const w=many?.213:wax?.22:.18;
  const z=many?.224:wax?.277:.267;
  for(const side of sides){
    const cut=mirror(side,[[.012,.19,z-.044],[w*.75,.231,z-.10],[w*1.35,.071,z-.077],
      [w*.94,-.015,z+.064],[w*.76,-.194,z+.051],[.031,-.162,z+.041]]);
    plate(k,head,wax?'body':'deep',cut,.031);
    ridge(k,head,'edge',cut.slice(0,4).map(([x,y,z],i)=>[x,y+.007,z+.016,[.005,.014,.018,.007][i]]),mobile);
    if(many){
      for(let i=0;i<4;i++)stud(k,head,'glow',side*(.048+i*.052),.068+.045*Math.sin(i*1.31),
        z+.071-i*.021,.014,.021,.011,side*.56);
    }else if(!ghost){
      stud(k,head,'glow',side*w*.46,.066,z+.066,.024,.028,.014,side*.3);
    }else{
      const seam=mirror(side,[[.035,.082,z+.04,.003],[.068,.079,z+.046,.008],[.12,.065,z+.047,.006],
        [.149,.07,z+.027,.002]]);
      ridge(k,head,'trim',seam,mobile);
    }
    for(let i=0;i<(mobile?2:3);i++){
      const y=.38-i*.131,w=(wax?.22:.27)+i*.029;
      const shards=mirror(side,[[w*.12,y+.088,-.25],[w*.57,y+.098,-.291],[w*.97,y+.035,-.328],
        [w*1.02,y-.12,-.373],[w*.61,y-.214,-.398],[w*.09,y-.085,-.349]]);
      plate(k,body,wax?'edge':ghost?'deep':'body',shards,.027);
      ridge(k,body,many?'glow':wax?'body':'trim',shards.slice(1,5).map(([x,y,z],n)=>[x,y,z-.016,[.003,.013,.012,.002][n]]),mobile);
    }
  }
}

function pinions(k,{body,head,flight},mobile,id){
  const paper=id==='crane';
  const upper=paper?.166:.200,back=paper?-.27:-.20;
  for(const {elbow,side} of flight){
    for(let i=0;i<(mobile?3:5);i++){
      const start=.11+i*.14;
      const stroke=mirror(side,[[start,.04+i*.028,.022],[start+.237,.04-i*.048,-.074],
        [start+.313,-.104-i*.071,-.206]]);
      const [a,b,c]=stroke;
      k.geometry(elbow,i%2?'edge':'body',featherVane(a,b,c,.074-i*.006,8+i,mobile?7:11));
    }
    ridge(k,head,'trim',mirror(side,[[.05,.106,upper,.007],[.139,.197,upper-.048,.020],
      [.218,.288,back+.157,.014],[.268,.330,back,.003]]),mobile);
    const cover=mirror(side,[[.037,.298,-.146],[.153,.276,-.186],[.225,.204,-.168],
      [.163,.029,-.249],[.064,.014,-.256]]);
    plate(k,body,paper?'edge':'deep',cover,.030);
    ridge(k,body,'trim',cover.slice(1,5).map(([x,y,z],i)=>[x,y,z-.026,[.004,.019,.016,.003][i]]),mobile);
    const count=mobile?3:5;
    for(let i=0;i<count;i++){
      const offset=i*.055,sway=paper?1:.86;
      const [base,bend,end]=mirror(side,[[.025+offset,.265-i*.055,.229-i*.03],
        [.072+offset*sway,.087-i*.048,.337-offset*.3],[.084+offset,-.242-i*.027,.275-offset*1.1]]);
      k.geometry(body,i%2?'edge':'body',featherVane(base,bend,end,.052+(count-i)*.007,39+i,mobile?7:11));
    }
  }
}

function coffinJoinery(k,parts,mobile){
  const timber=k.bone(parts.back,0,0,-.062);
  for(const side of sides){
    const hem=mirror(side,[[.013,1.107,-.486,.028],[.353,.926,-.479,.034],
      [.454,.517,-.491,.037],[.388,-.434,-.506,.035],[.255,-.716,-.506,.030],
      [.014,-.835,-.524,.010]]);
    ridge(k,timber,'trim',hem,mobile);
    for(let i=0;i<(mobile?3:4);i++){
      const y=.68-i*.375,w=.35-.033*i;
      const tie=mirror(side,[[.053,y+.056,-.534],[w*.63,y+.061,-.551],[w,y+.103,-.495],
        [w*1.10,y-.075,-.482],[w*.58,y-.113,-.550],[.046,y-.087,-.549]]);
      plate(k,timber,i%2?'deep':'edge',tie,.034);
      ridge(k,timber,'trim',tie.slice(1,5).map(([x,y,z],index)=>[x,y-.004,z-.021,[.008,.017,.020,.005][index]]),mobile);
      stud(k,timber,'trim',side*w*.63,y-.021,-.578,.031,.030,.021);
    }
    ridge(k,timber,'deep',mirror(side,[[.024,.483,-.554,.010],[.067,.295,-.571,.020],
      [.071,.09,-.581,.016],[.022,-.298,-.568,.007]]),mobile);
  }
}

function houndJoint(k,parts,mobile){
  for(const [index,leg] of parts.legs.entries()){
    const sign=Math.sign(leg.position.x)||1;
    for(let row=0;row<2;row++){
      const high=.013-row*.077,direction=index<2?.021:-.026;
      const splint=mirror(sign,[[.098,high+.053,.053],[.131,high+.056,-.027],
        [.131,high-.101,-.110+direction],[.091,high-.166,-.120+direction],
        [.047,high-.128,-.024],[.059,high-.026,.036]]);
      plate(k,leg,row%2?'trim':'edge',splint,.025);
      ridge(k,leg,'deep',splint.slice(1,5).map(([x,y,z],n)=>[x+sign*.01,y,z,[.005,.009,.010,.001][n]]),mobile);
    }
  }
}

function coinRelief(k,{head,body},mobile){
  for(const front of sides){
    const depth=front===1?.379:-.018;
    for(const side of sides){
      const hinge=mirror(side,[[.105,.230,depth-.028],[.239,.184,depth-.013],[.296,.075,depth-.044],
        [.259,-.081,depth-.047],[.161,-.169,depth-.015],[.072,-.067,depth+.013]]);
      plate(k,head,'body',hinge,.030);
      ridge(k,head,'trim',hinge.slice(1,5).map(([x,y,z],i)=>[x,y,z+front*.027,[.004,.014,.016,.005][i]]),mobile);
      for(let i=0;i<3;i++){
        const x=side*(.147+i*.025),y=.091-i*.058;
        stud(k,head,'edge',x,y,depth+front*.029,.016,.025,.011,side*.21);
      }
    }
  }
  const seal=[[0,.385,-.322],[.128,.333,-.354],[.144,.195,-.367],[.036,.093,-.373],
    [-.072,.104,-.368],[-.151,.261,-.339],[-.125,.348,-.314]];
  plate(k,body,'trim',seal,.038);
  stud(k,body,'glow',0,.244,-.404,.028,.052,.015);
}

const animals=new Set(['scarab','weaver','hound','salamander']);
const spirits=new Set(['wisp','veil','wax','eyes']);
const fireClasp=new Set(['cultist','oracle','toller']);
const effects={
  imp:['embers',[0,.23,-.21],[.51,.53,.41]],
  cultist:['embers',[.17,.21,.18],[.46,.54,.47]],
  knight:['sigils',[0,.3,-.24],[.60,.51,.44]],
  stalker:['ribbons',[0,.35,-.18],[.52,.49,.51]],
  wisp:['mist',[0,.21,-.04],[.56,.48,.46]],
  sentinel:['bolts',[0,.35,-.21],[.56,.50,.36]],
  oracle:['sigils',[0,.60,-.31],[.53,.51,.42]],
  scarab:['bolts',[0,.27,-.40],[.48,.45,.58]],
  salamander:['embers',[0,.25,-.35],[.51,.40,.69]],
  weaver:['ribbons',[0,.23,-.39],[.64,.37,.65]],
  drummer:['sigils',[0,.26,.41],[.54,.43,.42]],
  crane:['ribbons',[0,.35,-.27],[.73,.48,.44]],
  spriggan:['mist',[0,.27,-.23],[.53,.47,.44]],
  coin:['sigils',[0,.42,-.24],[.49,.46,.44]],
  kite:['bolts',[0,.29,-.31],[.68,.47,.49]],
  veil:['mist',[0,.26,-.27],[.54,.55,.45]],
  coffin:['mist',[0,.43,-.59],[.58,.60,.41]],
  wax:['embers',[0,.26,-.24],[.46,.49,.38]],
  toller:['sigils',[0,.81,-.38],[.49,.49,.44]],
  eyes:['bolts',[0,.30,-.20],[.55,.52,.45]],
  hound:['ribbons',[0,.32,-.34],[.50,.45,.75]],
};

export function polishCreature(k,parts,entry,mobile){
  const id=entry.artId??entry.id;
  const effect=effects[id];
  if(!effect)return false;
  if(armour[id]){
    browAndCollar(k,parts,id,mobile);
    if(fireClasp.has(id))lampClasp(k,parts,mobile,id);
    if(id==='imp'||id==='spriggan')crackedImp(k,parts,mobile,id);
    if(id==='coffin')coffinJoinery(k,parts,mobile);
  }else if(animals.has(id))shellChannels(k,parts,id,mobile);
  else if(spirits.has(id))maskShreds(k,parts,id,mobile);
  else if(id==='coin')coinRelief(k,parts,mobile);
  else pinions(k,parts,mobile,id);
  if(id==='hound')houndJoint(k,parts,mobile);
  const [shape,offset,span]=effect;
  parts.polishEnergy={shape,offset,span,anchor:parts.body,tint:entry.palette[3],attackOnly:entry.field};
  return true;
}
