import * as T from '../three.min.mjs';
import {featherVane,sculptVolume,wingWeb} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(side,track)=>track.map(([x,...rest])=>[side*x,...rest]);
const form=(k,j,m,track,mobile,seed=0,section=2.49,fur=false)=>
  k.geometry(j,m,sculptVolume(track,{rings:mobile?9:15,sides:mobile?9:13,section,seed,fur,ridge:.145}));
const panel=(k,j,m,track,d=.035)=>k.sculpt.plate(j,m,track,d,d*.28);
const seam=(k,j,m,track,mobile)=>k.sculpt.sweep(j,m,track,{steps:mobile?8:12,sides:mobile?5:7,ridge:.19});
function pivot(k,parent,name,x,y,z){
  const j=k.bone(parent,x,y,z); j.name=name;
  return j;
}
function colorway(k,{deep,body,edge,trim,tint}){
  for(const [slot,color] of Object.entries({deep,body,edge,trim})){
    k.materials[slot].color.setHex(color);
    if(k.materials[slot].emissive)k.materials[slot].emissive.setHex(color);
  }
  if(tint!==undefined)k.materials.glow.color.setHex(tint);
}

function foxPatron(k,entry,mobile){
  colorway(k,{deep:0x2b252f,body:0x7b5449,edge:0xe2d8c2,trim:0x927a5b,tint:0x9cdaff});
  const body=pivot(k,k.root,'Fox patron running ribcage',0,.664,-.06);
  const head=pivot(k,body,'Fox patron lacquer face',0,.421,.591);
  const jaw=pivot(k,head,'Fox patron lower jaw',.002,-.107,.138);
  form(k,body,'body',[[0,-.027,-.702,.146,.199],[.010,.096,-.424,.256,.326],[0,.127,.006,.311,.346],
    [0,.198,.385,.252,.279],[0,.347,.553,.146,.179]],mobile,1.45,2.33,true);
  form(k,head,'edge',[[.001,.071,-.169,.121,.139],[0,.116,-.042,.149,.183],[.009,.065,.108,.158,.184],
    [.005,-.025,.232,.072,.127],[.001,-.049,.349,.034,.078],[0,-.075,.397,.020,.050]],mobile,15.1,2.41,true);
  form(k,jaw,'edge',[[0,-.022,-.09,.048,.070],[.004,-.06,-.017,.062,.09],
    [0,-.066,.10,.051,.065],[0,-.031,.241,.024,.041]],mobile,3.88);
  k.mesh(head,'gem','deep',0,-.067,.386,.056,.037,.047);
  const ears=[],tails=[],legs=[];
  for(const side of sides){
    const f=p=>mirror(side,p);
    const eye=f([[.045,.112,.24],[.111,.153,.179],[.164,.119,.135],[.131,.071,.167],[.048,.078,.237]]);
    panel(k,head,'deep',eye,.023);
    k.mesh(head,'gem','glow',side*.104,.115,.22,.024,.009,.024,0,side*.58,side*.27);
    seam(k,head,'trim',f([[.039,.165,.216,.007],[.096,.193,.190,.013],
      [.155,.167,.135,.011],[.185,.139,.038,.003]]),mobile);
    const lips=f([[.066,.005,.261],[.121,-.026,.215],[.185,-.088,.13],[.238,-.139,-.061],
      [.174,-.183,.045],[.116,-.126,.186]]);
    panel(k,head,'body',lips,.025);
    const ear=pivot(k,head,'Fox patron articulated ear '+side,side*.105,.176,-.044);
    const pinna=f([[.027,.042,.022],[.144,.368,-.025],[.236,.446,-.102],[.237,.18,-.146],
      [.158,-.027,-.06],[.033,-.062,-.016]]);
    panel(k,ear,'edge',pinna,.045);
    panel(k,ear,'body',f([[.048,.051,.065],[.158,.312,.003],[.232,.397,-.063],
      [.205,.17,-.04],[.124,.002,.067]]),.022);
    seam(k,ear,'trim',pinna.slice(0,4).map(([x,y,z],i)=>[x,y,z+.028,[.004,.011,.013,.004][i]]),mobile);
    ears.push({ear,side});
    for(let r=0;r<4;r++){
      const y=.177-r*.099,z=.374-r*.09;
      const w=.218+r*.018;
      const mane=f([[.023,y+.111,z],[w*.53,y+.108,z-.067],[w,y+.045,z-.071],[w*1.26,y+.009,z-.214],
        [w*.71,y-.13,z-.146],[.018,y-.073,z-.033]]);
      panel(k,body,r%2?'body':'edge',mane,.034);
      seam(k,body,'trim',mane.slice(0,4).map(([x,h,z],i)=>[x,h+.024,z+.014,.005+i*.003]),mobile);
    }
    for(const forward of [true,false]){
      const hip=pivot(k,body,'Fox patron haunch',side*(forward?.231:.204),.036,forward?.346:-.464);
      const hock=pivot(k,hip,'Fox patron hock',side*.036,-.306,forward?.029:-.088);
      const paw=pivot(k,hock,'Fox patron silver claw',side*.02,-.322,.084);
      form(k,hip,'body',f([[0,.118,-.037,.103,.091],[.051,.032,-.025,.12,.116],
        [.041,-.131,.021,.093,.087],[.035,-.308,.03,.068,.062]]),mobile,side+6.2,2.62,true);
      form(k,hock,'deep',f([[0,.047,-.069,.060,.053],[.014,-.103,-.018,.069,.067],
        [.018,-.223,.044,.049,.051],[.018,-.324,.082,.048,.043]]),mobile,4.62);
      form(k,paw,'edge',[[0,.024,-.028,.058,.067],[.003,.004,.030,.070,.082],
        [.003,-.025,.106,.021,.074]],true,13,2.72);
      for(let c=0;c<3;c++){
        const x=(c-1)*.038;
        form(k,paw,'trim',[[x,-.002,.068,.017,.016],[x,-.022,.120,.014,.016],
          [x,-.034,.158,.003,.004]],true,8+c);
      }
      legs.push({hip,hock,paw,side,forward});
    }
    for(let i=0;i<6;i++){
      const t=i/5,socket=pivot(k,body,'Fox patron tail '+(i+1+(side<0?0:6)),side*(.036+.085*t),.197+t*.115,-.525+t*.08);
      const spread=.27+t*.67-((i%2)*.045),rise=.77+.40*Math.sin(t*2.61),length=1.16+(1-t)*.18;
      const r=.096+.036*Math.sin(.25+t*2.06);
      const fruit=f([[0,-.021,.072,r*.56,r*.61],[spread*.40,rise*.29,-length*.31,r*.89,r*.94],
        [spread*.77,rise*.57,-length*.61,r,r*.92],[spread*.92,rise*.90,-length*.81,r*.81,r*.75],
        [spread,rise,-length,r*.43,r*.46],[spread*.83,rise*1.03,-length*1.10,.006,.008]]);
      form(k,socket,'edge',fruit,mobile,2.38+i*.83+side,2.32,true);
      const streak=fruit.slice(1,5).map(([x,y,z,a],j)=>[x-side*.031,y+a*.77,z-.023,a*[.10,.20,.23,.02][j]]);
      seam(k,socket,i%3?'body':'trim',streak,mobile);
      for(let layer=0;layer<(mobile?2:3);layer++){
        const [x,y,z]=fruit[2+layer],r=layer===0?.069:.048;
        const start=[x-side*r*.85,y+r*.27,z+.081];
        const crease=[x+side*r*.18,y+r*1.13,z-.084];
        const end=[x+side*r*.76,y+r*.77,z-.164];
        k.geometry(socket,layer===1&&i%2?'trim':'edge',featherVane(start,crease,end,r,8.1+i*.37+layer,mobile?6:9));
      }
      tails.push({socket,i,side});
    }
  }
  return {body,head,grounded:true,pattern:'gallop',
    polishEnergy:{tint:entry.palette[3],shape:'bolts',anchor:body,offset:[0,.46,-.67],span:[1.14,.75,.96]},
    cataloguePose({beat,headtime,step,wind,strike,travel,stage,fall}){
      body.rotation.x=wind*.16-strike*.36+travel*.031+fall*.23;
      body.position.y=.664+travel*.056*Math.sin(step*2)+wind*.048-strike*.035;
      head.rotation.set(Math.sin(beat*.59)*.041-wind*.22+strike*.39,Math.sin(headtime*2)*.124+strike*.13,stage*.04);
      jaw.rotation.x=.037+wind*.22+strike*.54;
      for(const {ear,side} of ears)ear.rotation.z=side*(.082+wind*.28-strike*.18);
      for(const {socket,i,side} of tails){
        socket.rotation.set(Math.sin(beat*.51-i*.75)*.134+travel*.32-wind*.21+strike*.25,
          side*(.07+i*.029+wind*.23-strike*.31+Math.sin(beat*.77+i*.4)*.058),side*stage*.101);
      }
      for(const {hip,hock,paw,side,forward} of legs){
        const a=step+(side<0?0:Math.PI)+(forward?0:Math.PI),stride=travel*Math.sin(a);
        hip.rotation.x=stride*.55+wind*(forward?-.24:.13)+strike*(forward?.21:-.24);
        hock.rotation.x=-Math.max(0,Math.cos(a))*travel*.48-wind*.086+strike*.09;
        paw.rotation.x=-stride*.32-hock.rotation.x*.57;
      }
    },
  };
}

function frostShard(k,j,i,mobile,length,width,seed){
  const points=[[0,.98,0],[-.60,.48,.026],[-.44,-.23,.29],[-.07,-.78,.18],[.46,-.29,.21],[.55,.37,-.01]]
    .map(([x,y,z])=>[x*width,y*length,z*width]);
  panel(k,j,'body',points,.052+width*.051);
  panel(k,j,i%2?'edge':'trim',points.map(([x,y,z],n)=>[x*.76+.014,y*.88,z+.045+(n===2?.018:0)]),.034);
  seam(k,j,i%3?'edge':'glow',[[.043,length*.72,.072],[-.034,length*.33,.144],
    [.025,length*.093,.18],[-.022,-length*.35,.142],[.013,-length*.53,.102]]
    .map(([x,y,z],r)=>[x,y,z+seed*.003,[.004,.009,.016,.011,.003][r]]),mobile);
}

function snowPatron(k,entry,mobile){
  colorway(k,{deep:0x141d34,body:0x2c5972,edge:0xb6d9df,trim:0x6a9bab,tint:0xbaf6ff});
  const body=pivot(k,k.root,'Frost revenant floating sternum',0,.553,0);
  const head=pivot(k,body,'Frost revenant split porcelain mask',0,1.06,.104);
  const links=[],mantles=[],shards=[];
  form(k,body,'deep',[[0,-.369,-.154,.123,.141],[.002,-.086,-.103,.216,.218],
    [0,.331,-.05,.354,.239],[0,.626,-.079,.318,.243],[0,.819,-.04,.174,.145]],mobile,1.94);
  form(k,head,'edge',[[0,-.204,.015,.057,.099],[0,-.121,.044,.121,.143],[0,.007,.018,.174,.171],
    [0,.183,-.064,.160,.127],[0,.337,-.089,.073,.089]],mobile,10.75,2.71);
  panel(k,head,'deep',[[-.028,.24,.138],[-.083,.1,.191],[-.028,-.052,.23],[-.058,-.16,.199],
    [0,-.248,.145],[.038,-.13,.194],[.022,-.021,.217],[.066,.126,.165],[.048,.233,.121]],.027);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const temple=f([[.062,.123,.185],[.15,.139,.142],[.183,.067,.099],[.177,-.091,.121],
      [.109,-.177,.179],[.06,-.118,.201]]);
    panel(k,head,side<0?'trim':'body',temple,.048);
    k.mesh(head,'gem','glow',side*.085,.056,.219,.046,.018,.026,0,side*.23,side*.20);
    const crown=pivot(k,head,'Frost revenant crown needle '+side,side*.081,.093,-.018);
    form(k,crown,'edge',f([[.02,.072,.022,.034,.051],[.084,.245,.004,.057,.052],[.162,.371,-.021,.04,.046],
      [.182,.548,-.149,.003,.005]]),mobile,side+2.74,3.12);
    const arm=pivot(k,body,'Frost revenant withered shoulder '+side,side*.279,.626,.064);
    const wrist=pivot(k,arm,'Frost revenant claw palm '+side,side*.198,-.35,.106);
    form(k,arm,'body',f([[0,.05,-.032,.077,.084],[.078,-.061,-.04,.104,.098],
      [.162,-.224,.039,.069,.077],[.193,-.349,.098,.06,.063]]),mobile,9.51);
    form(k,wrist,'edge',f([[0,.065,-.024,.043,.051],[.019,-.003,.014,.077,.073],
      [.069,-.082,.070,.046,.063]]),mobile,4.19);
    for(let finger=0;finger<4;finger++){
      const x=-.036+finger*.033;
      form(k,wrist,'edge',f([[x,-.037,.065,.017,.014],[x+.035,-.116,.083,.016,.017],
        [x+.050,-.169,.143,.003,.003]]),true,finger+.31);
    }
    links.push({arm,wrist,side,crown});
    for(let i=0;i<4;i++){
      const h=.609-i*.133,t=i/3;
      const robe=pivot(k,body,'Frost revenant broken mantle '+side+' '+i,side*(.104+.032*i),h,-.124-i*.067);
      const outline=f([[.04,.09,.029],[.22+t*.065,.054,-.084],[.367+t*.138,-.173,-.209],
        [.30+t*.11,-.492,-.345],[.453+t*.027,-.837+t*.21,-.401],[.178,-.561,-.274],[.076,-.292,-.142]]);
      panel(k,robe,i%2?'body':'deep',outline,.037);
      seam(k,robe,'edge',outline.slice(1,6).map(([x,y,z],j)=>[x,y,z-.022,[.005,.017,.014,.009,.003][j]]),mobile);
      mantles.push({robe,side,i});
      const shard=pivot(k,body,'Frost revenant floating shard '+side+' '+i,side*(.81-i*.046),.717-i*.196,-.38-i*.065);
      frostShard(k,shard,i,mobile,.24+i*.026,.22+i*.054,side);
      shards.push({shard,i,side});
    }
  }
  for(let i=0;i<(mobile?5:7);i++){
    const y=.46-i*.114,z=.22-i*.011,w=.29-i*.022;
    const breast=[[-w,y+.074,z-.041],[-.052,y+.032,z+.078],[.056,y+.046,z+.108],[w,y+.068,z-.058],
      [w*.77,y-.039,z-.016],[.029,y-.112,z+.128],[-w*.69,y-.056,z+.042]];
    panel(k,body,i%2?'trim':'body',breast,.032);
    seam(k,body,i===2?'glow':'edge',breast.slice(0,4).map(([x,h,v],j)=>[x,h+.009,v+.021,[.004,.017,.014,.005][j]]),mobile);
  }
  return {body,head,pattern:'hover',
    polishEnergy:{tint:entry.palette[3],shape:'ribbons',anchor:body,offset:[0,.51,-.20],span:[1.11,1.24,.56]},
    cataloguePose({beat,headtime,wind,strike,travel,stage,fall}){
      body.rotation.set(travel*.178+wind*.08-strike*.28+fall*.43,0,Math.sin(beat*.67)*.036);
      head.rotation.y=Math.sin(headtime*1.72)*.095-wind*.11+strike*.27;
      for(const {arm,wrist,side,crown} of links){
        arm.rotation.set(-.15-wind*.48+strike*.82,side*(wind*.28-strike*.45),side*(.19+wind*.45+stage*.10));
        wrist.rotation.x=wind*.28-strike*.36;
        crown.rotation.z=side*(wind*.066+stage*.12);
      }
      for(const {robe,side,i} of mantles){
        robe.rotation.set(travel*.19+Math.sin(beat*.47+i*.67)*.128+strike*.31,
          side*(.22+wind*.16-strike*.19),side*(.12+wind*.27-strike*.32));
      }
      for(const {shard,i,side} of shards){
        const t=headtime*1.53+i*.86+side*.12;
        shard.position.set(side*(.78-i*.043+wind*.31+strike*.184+Math.cos(t)*.11),.71-i*.164+Math.sin(t)*.133+stage*.19,
          -.34-i*.063+Math.sin(t*.69)*.155);
        shard.rotation.set(side*(.31+i*.14+wind*.53),t,side*(.24+i*.151-strike*.48));
      }
    },
  };
}

function yamaMagistrate(k,entry,mobile){
  colorway(k,{deep:0x252031,body:0x614153,edge:0xccb58c,trim:0x9a825f,tint:0xe1a5f3});
  const body=pivot(k,k.root,'Yama tribunal ribcage',0,1.12,0);
  const head=pivot(k,body,'Yama cast judgment mask',0,.831,.092);
  const skirt=[],arms=[],legs=[],leaves=[];
  form(k,body,'deep',[[0,-.273,-.032,.194,.183],[.02,.008,-.029,.268,.198],[.02,.303,-.048,.374,.257],
    [0,.544,-.031,.345,.213],[0,.746,-.012,.151,.165]],mobile,14.46);
  form(k,head,'edge',[[0,-.226,.044,.061,.088],[0,-.144,.051,.113,.141],[0,.017,.012,.168,.152],
    [0,.164,-.022,.169,.132],[0,.275,-.095,.132,.111]],mobile,2.72,3.04);
  const cap=pivot(k,head,'Yama triple tribunal crown',0,.222,-.083);
  form(k,cap,'deep',[[0,-.055,.037,.131,.153],[0,.022,.019,.194,.172],[0,.195,-.029,.207,.14],
    [0,.339,-.054,.172,.123],[0,.425,-.121,.089,.099]],mobile,11.9,3.31);
  const nasal=[[0,.174,.177],[-.05,.099,.241],[-.071,-.074,.221],[-.041,-.136,.207],
    [0,-.183,.224],[.041,-.136,.207],[.071,-.074,.221],[.05,.099,.241]];
  panel(k,head,'trim',nasal,.047);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const sockets=f([[.031,.101,.202],[.106,.147,.178],[.172,.107,.101],[.169,.025,.12],[.101,-.021,.206],[.033,-.016,.228]]);
    panel(k,head,'deep',sockets,.029);
    k.mesh(head,'gem','glow',side*.094,.063,.236,.037,.014,.023,0,side*.47);
    const cheek=f([[.068,-.044,.22],[.143,.019,.147],[.193,-.034,.064],[.185,-.155,.076],
      [.122,-.234,.135],[.068,-.177,.199]]);
    panel(k,head,'trim',cheek,.046);
    seam(k,head,'edge',cheek.slice(0,5).map(([x,y,z],i)=>[x,y-.012,z+.021,[.008,.022,.019,.012,.004][i]]),mobile);
    form(k,head,'edge',f([[.097,-.131,.193,.022,.018],[.103,-.199,.203,.022,.017],
      [.085,-.272,.234,.004,.004]]),true,side+.37);
    for(let b=0;b<3;b++){
      const x=.041+b*.070,y=.164+b*.031,d=b*.041;
      const crown=f([[x-.044,y-.091,.167-d],[x+.053,y-.071,.171-d],[x+.083,y+.098,.074-d],
        [x+.047,y+.227,-.039-d],[x-.005,y+.161,.004-d]]);
      panel(k,cap,b%2?'trim':'body',crown,.037);
      seam(k,cap,'edge',crown.slice(1,5).map(([x,y,v],i)=>[x,y,v+.022,[.013,.017,.012,.003][i]]),mobile);
    }
    const collar=f([[.028,.663,.319],[.168,.751,.294],[.376,.697,.156],[.482,.57,-.03],
      [.355,.424,.127],[.158,.414,.265],[.037,.304,.334]]);
    panel(k,body,'body',collar,.073);
    seam(k,body,'trim',collar.slice(0,6).map(([x,y,z],i)=>[x,y+.023,z+.047,[.009,.017,.028,.021,.016,.004][i]]),mobile);
    for(let b=0;b<3;b++){
      const x=side*(.141+b*.128),z=-.298-b*.052;
      const seal=pivot(k,body,'Yama lacquered back plate '+side+' '+b,x,.488-b*.097,z);
      const mark=f([[-.043,.091,.024],[.114,.146,-.016],[.209,.084,-.07],[.201,-.067,-.147],
        [.089,-.195,-.116],[-.036,-.143,-.052]]);
      panel(k,seal,b%2?'deep':'body',mark,.045);
      seam(k,seal,'edge',mark.slice(2,5).map(([x,y,z])=>[x,y,z-.027,.011]),mobile);
    }
    for(let i=0;i<3;i++){
      const at=side*(.097+i*.087),tail=pivot(k,body,'Yama tattered court silk '+side+' '+i,at,-.068,-.06-i*.12);
      const outline=f([[-.075,.078,.011],[.082,.059,.055],[.159,-.326,.116],[.209,-.881,.151],
        [.083,-1.066+i*.056,.169],[-.055,-.744+i*.093,.144],[-.092,-.279,.047]]);
      panel(k,tail,i%2?'body':'deep',outline,.032);
      seam(k,tail,'trim',outline.slice(1,6).map(([x,y,z],j)=>[x,y,z+.024,[.005,.013,.014,.008,.003][j]]),mobile);
      skirt.push({tail,side,i});
    }
    const shoulder=pivot(k,body,'Yama sleeve shoulder '+side,side*.318,.531,.028);
    const wrist=pivot(k,shoulder,'Yama reading hand '+side,side*.122,-.417,.118);
    form(k,shoulder,'body',f([[0,.108,-.021,.095,.126],[.074,-.026,-.014,.179,.158],
      [.144,-.205,.052,.152,.142],[.123,-.42,.112,.109,.106]]),mobile,16.34,2.63);
    form(k,wrist,'edge',f([[0,.075,-.002,.055,.068],[.042,-.047,.061,.075,.076],
      [.077,-.097,.098,.039,.057]]),mobile,22.4);
    const hip=pivot(k,body,'Yama hidden gait '+side,side*.123,-.277,-.05);
    form(k,hip,'deep',f([[0,.051,.013,.113,.109],[.053,-.268,.049,.109,.088],
      [.038,-.64,.128,.084,.111],[.012,-.755,.168,.058,.102]]),mobile,8.53,2.83);
    arms.push({shoulder,wrist,side});
    legs.push({hip,side});
  }
  const gavel=pivot(k,arms[1].wrist,'Yama blackwood tribunal gavel',.045,-.018,.189);
  form(k,gavel,'deep',[[0,-.321,.012,.036,.029],[.012,-.01,.011,.041,.036],
    [.025,.521,.038,.031,.026],[.032,.82,.054,.019,.022]],mobile,21.5);
  const hammer=pivot(k,gavel,'Yama embossed signet',.04,.734,.055);
  form(k,hammer,'trim',[[-.198,0,0,.078,.105],[-.13,0,.041,.142,.141],[0,.014,.072,.17,.137],
    [.15,.018,.052,.137,.125],[.239,.013,.023,.086,.092]],mobile,14.8,2.85);
  panel(k,hammer,'edge',[[-.16,.112,.105],[0,.141,.187],[.16,.095,.109],[.123,-.082,.139],
    [0,-.102,.193],[-.114,-.061,.147]],.033);
  markEnemyWeapon(gavel,[.069,.873,.125],{width:.23});
  const book=pivot(k,arms[0].wrist,'Yama open death ledger',-.051,.037,.204);
  for(const side of sides){
    const cover=pivot(k,book,'Yama hinged ledger cover '+side,0,0,0);
    const contour=mirror(side,[[.013,.227,.011],[.197,.269,.026],[.315,.208,.071],[.313,-.198,.051],
      [.165,-.223,.039],[.011,-.171,.016]]);
    panel(k,cover,'deep',contour,.072);
    panel(k,cover,'edge',contour.map(([x,y,z])=>[x*.90,y*.88,z+.081]),.042);
    for(let row=0;row<6;row++){
      const y=.156-row*.05;
      seam(k,cover,'trim',mirror(side,[[.038,y,.112,.006],[.118,y+.008,.129,.009],[.212,y,.136,.008],[.283,y-.006,.135,.003]]),true);
    }
    for(let i=0;i<3;i++){
      const leaf=pivot(k,book,'Yama airborne court writ '+side+' '+i,side*(.17+i*.21),.208+i*.033,.052-i*.096);
      const w=.102+i*.014,h=.19+i*.024;
      const corners=[[-w,h,.01],[w,h+.026,.017],[w*.88,-h,-.03],[-w*.91,-h+.027,-.042]];
      panel(k,leaf,i%2?'trim':'edge',corners,.012);
      seam(k,leaf,'deep',[[-w*.60,h*.51,.028],[w*.12,h*.56,.041],[w*.49,.009,.037],[-w*.22,-h*.41,.012]]
        .map(([x,y,z],j)=>[x,y,z,[.008,.007,.006,.003][j]]),true);
      for(const face of sides){
        const z=face>0?.044:-.053;
        const seal=[[-w*.37,h*.25,z],[w*.41,h*.30,z+.003],[w*.43,-h*.31,z],[0,-h*.47,z-.003],[-w*.41,-h*.32,z]];
        seam(k,leaf,'body',[...seal,seal[0]].map(([x,y,v])=>[x,y,v,.005]),true);
        seam(k,leaf,'deep',[[-w*.19,h*.119,z],[w*.23,h*.128,z],[.019,-h*.06,z],
          [w*.25,-h*.21,z],[-w*.16,-h*.16,z]].map(([x,y,v])=>[x,y,v,.006]),true);
      }
      leaves.push({leaf,cover,side,i});
    }
  }
  return {body,head,pattern:'duel',grounded:true,
    polishEnergy:{tint:entry.palette[3],shape:'sigils',anchor:head,offset:[0,.16,-.36],span:[.91,.52,.54]},
    cataloguePose({beat,headtime,wind,strike,travel,step,stage,fall}){
      body.rotation.x=wind*.125-strike*.315+fall*.48;
      head.rotation.y=Math.sin(beat*.46)*.106-wind*.344+strike*.357;
      cap.rotation.z=Math.sin(beat*.57)*.035+stage*.021;
      for(const {shoulder,wrist,side} of arms){
        shoulder.rotation.set(-.22-wind*(side>0?1.13:.29)+strike*(side>0?1.51:.61),side*(.24+wind*.51-strike*.29),
          side*(.16+wind*.43-strike*.21));
        wrist.rotation.x=wind*.26-strike*.31;
      }
      for(const {hip,side} of legs)hip.rotation.x=Math.sin(step+side*Math.PI*.5)*travel*.51;
      for(const {tail,side,i} of skirt)tail.rotation.set(Math.sin(beat*.46+i)*.11+travel*.20+strike*.29,side*stage*.08,side*(wind*.17-strike*.19));
      gavel.rotation.z=.27+wind*.24-strike*.66;
      book.rotation.set(.31+wind*.19-strike*.37,wind*.18-strike*.25,Math.sin(beat*.43)*.131);
      for(const {leaf,cover,side,i} of leaves){
        cover.rotation.y=side*(.34+wind*.47-strike*.25);
        leaf.position.x=side*(.16+i*.194+wind*.31+strike*.44);
        leaf.position.y=.217+i*.092+Math.sin(headtime*2.35+i*.59)*.062+strike*.16;
        leaf.rotation.set(wind*.42+strike*.35,side*(.478+wind*.74+strike*.30),Math.sin(beat*.54+i)*.24);
      }
    },
  };
}

function batMarquis(k,entry,mobile){
  colorway(k,{deep:0x221e38,body:0x693e50,edge:0xb39e99,trim:0x615277,tint:0xff8abe});
  k.materials.body.side=T.DoubleSide;
  const body=pivot(k,k.root,'Marquis rolling thorax',0,.938,-.06);
  const head=pivot(k,body,'Marquis leaf-nosed skull',0,.45,.244);
  const jaw=pivot(k,head,'Marquis attacking mandible',0,-.12,.038);
  const flight=[],claws=[];
  form(k,body,'deep',[[0,-.539,-.043,.073,.127],[.016,-.384,-.089,.173,.212],[.02,-.105,-.065,.253,.232],
    [0,.176,-.028,.267,.231],[0,.384,-.012,.14,.137]],mobile,4.19,2.54,true);
  form(k,head,'edge',[[0,-.149,-.025,.083,.101],[0,-.048,-.044,.152,.136],[0,.107,-.085,.18,.141],
    [0,.177,-.094,.134,.109],[0,.236,-.076,.087,.059]],mobile,7.3,2.56,true);
  form(k,jaw,'deep',[[0,-.029,.027,.07,.117],[0,-.071,.09,.064,.104],[.014,-.096,.163,.043,.087],
    [0,-.065,.244,.018,.047]],mobile,12.35,2.43);
  const nose=[[-.064,-.015,.163],[-.095,.123,.149],[-.023,.219,.166],[0,.191,.241],[.023,.219,.166],
    [.095,.123,.149],[.064,-.015,.163],[0,-.054,.241]];
  panel(k,head,'body',nose,.038);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const ear=pivot(k,head,'Marquis fluted ear '+side,side*.107,.119,-.111);
    const pinna=f([[.016,.018,.072],[.038,.177,.109],[.119,.345,.087],[.204,.487,-.002],
      [.257,.334,-.087],[.203,.105,-.111],[.131,-.081,-.014]]);
    panel(k,ear,'deep',pinna,.076);
    panel(k,ear,'body',pinna.map(([x,y,z])=>[x*.85+.032*side,y*.87,z+.065]),.032);
    seam(k,ear,'trim',pinna.slice(0,5).map(([x,y,z],i)=>[x,y,z+.023,[.005,.023,.018,.017,.004][i]]),mobile);
    const lens=f([[.046,.077,.177],[.107,.112,.148],[.161,.073,.099],[.16,.011,.112],[.101,-.008,.17]]);
    panel(k,head,'deep',lens,.022);
    k.mesh(head,'gem','glow',side*.099,.053,.196,.031,.021,.026,0,side*.59);
    for(let i=0;i<4;i++){
      const x=.037+i*.032,z=.191-i*.02;
      form(k,head,'edge',f([[x,-.053,z,.016,.016],[x+.005,-.116-i%2*.031,z+.021,.019,.016],
        [x-.004,-.157-i%2*.058,z+.053,.003,.004]]),true,6+i);
    }
    const wing=pivot(k,body,'Marquis wing ground hinge '+side,side*.144,.223,-.143);
    const wrist=pivot(k,wing,'Marquis outer flight elbow '+side,side*.612,.314,-.137);
    const knuckles=[
      [[0,0,0],[.24,.264,.034],[.488,.412,-.047],[.67,.52,-.145]],
      [[0,0,0],[.322,.097,-.041],[.545,.178,-.121],[.71,.111,-.196]],
      [[0,0,0],[.294,.041,-.073],[.471,-.203,-.154],[.521,-.304,-.249]],
      [[0,0,0],[.161,-.153,-.099],[.251,-.395,-.171],[.165,-.659,-.236]],
      [[0,0,0],[.067,-.186,-.072],[.022,-.443,-.158],[-.16,-.624,-.26]],
    ];
    k.geometry(wrist,'body',wingWeb(knuckles,side,side===1?7:11));
    form(k,wing,'deep',f([[0,0,0,.067,.095],[.186,.153,-.029,.106,.112],
      [.451,.261,-.106,.088,.074],[.617,.321,-.143,.059,.047]]),mobile,10.24,2.69);
    const inner=[
      [[0,0,0],[.231,.191,-.034],[.44,.294,-.111],[.619,.313,-.145]],
      [[0,0,0],[.249,.037,-.113],[.438,-.17,-.218],[.48,-.372,-.251]],
      [[0,0,0],[.175,-.094,-.099],[.274,-.29,-.172],[.207,-.557,-.271]],
    ];
    k.geometry(wing,'body',wingWeb(inner,side,side===1?4:13));
    for(const [i,segment] of knuckles.entries()){
      const bars=segment.map(([x,y,z],j)=>[x,y,z,[.055,.049,.032,.003][j]]);
      form(k,wrist,i%2?'deep':'trim',f(bars),mobile,side+3+i*.74,2.43);
      seam(k,wrist,'edge',f(bars.map(([x,y,z,r],j)=>[x,y+.007,z+.023,r*(j===1?.43:.24)])),mobile);
      if(i<knuckles.length-1){
        const next=knuckles[i+1];
        const [x,y,z]=bars[2];
        const [a,b,c]=next[3];
        seam(k,wrist,'deep',f([[x*.76,y*.56,z-.04,.006],[x*.89,y*.67,z-.09,.012],
          [(x+a)*.51,(y+b)*.55,(z+c)*.51-.107,.009],[a*.97,b*.91,c-.034,.003]]),mobile);
      }
    }
    const foot=pivot(k,body,'Marquis hooked roost claw '+side,side*.103,-.379,-.063);
    form(k,foot,'deep',f([[0,.097,-.018,.051,.045],[.078,-.005,.042,.065,.053],
      [.104,-.142,.06,.039,.043],[.09,-.205,.095,.024,.026]]),mobile,3.14);
    for(let i=0;i<3;i++){
      const x=.037+i*.035;
      form(k,foot,'edge',f([[x,-.149,.074,.019,.015],[x+.015,-.205,.122,.018,.015],
        [x+.01,-.237,.166,.004,.004]]),true,8+i);
    }
    flight.push({wing,wrist,ear,side});
    claws.push({foot,side});
  }
  const vane=pivot(k,body,'Marquis swept tail skin',0,-.491,-.118);
  k.geometry(vane,'body',featherVane([0,.022,0],[.037,-.236,-.15],[.007,-.525,-.383],.189,3.81,mobile?8:13));
  return {body,head,pattern:'wing',
    polishEnergy:{tint:entry.palette[3],shape:'embers',anchor:body,offset:[0,.192,.171],span:[1.23,.51,.39]},
    cataloguePose({beat,headtime,wind,strike,travel,stage,fall}){
      const roost=Math.max(0,1-(travel*.88+wind*.77+strike*1.19+stage*.36));
      body.rotation.z=Math.PI*roost+Math.sin(beat*.52)*.13;
      body.rotation.x=travel*.19+wind*.164-strike*.52+fall*.45;
      head.rotation.y=Math.sin(headtime*2.26)*.183+strike*.25;
      jaw.rotation.x=.057+wind*.38+strike*.73;
      for(const {wing,wrist,ear,side} of flight){
        wing.rotation.set(wind*.38-strike*.384,side*(.16+roost*.385+wind*.57-strike*.61),
          side*(.16+.19*Math.sin(beat*.86)+wind*.31-strike*.54));
        wrist.rotation.set(wind*.17-strike*.39,side*(.19+roost*.41+wind*.15-strike*.27),
          side*(Math.sin(beat*.93)*.173+wind*.24-strike*.35));
        ear.rotation.z=side*(.093+wind*.18-strike*.34);
      }
      for(const {foot,side} of claws)foot.rotation.x=Math.sin(beat*.59+side)*.095+strike*.31;
      vane.rotation.x=wind*.39-strike*.32+travel*.45;
    },
  };
}

const hunters={
  'fox-doll':foxPatron,
  'snow-doll':snowPatron,
  'yama-cane':yamaMagistrate,
  'bat-cane':batMarquis,
};

export function wraithRelicHunter(k,entry,weapon,mobile){
  const build=hunters[weapon?.id];
  if(!build)return null;
  const parts=build(k,entry,mobile);
  return {...parts,crest:k.bone(parts.body,0,0,0),wraithHunter:true,catalogueSculpt:entry.id};
}
