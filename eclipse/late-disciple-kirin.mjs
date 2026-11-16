import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const line=(k,j,m,path,steps=10)=>k.sculpt.sweep(j,m,path,{sides:7,steps,ridge:.22});
const plate=(k,j,m,vertices,depth=.047)=>k.sculpt.plate(j,m,vertices,depth,depth*.32);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,
  {sides:mobile?10:15,rings:mobile?13:19,section:2.49,ridge:.26,seed,fur:m==='sandHair'}));
const ring=(k,j,m,r,t,arc=Math.PI*2)=>k.geometry(j,m,new T.TorusGeometry(r,t,7,28,arc));

function asuraHead(k,head,mobile){
  cast(k,head,'asuraRed',[[0,-.165,.016,.130,.130],[0,-.095,.002,.194,.173],
    [0,.045,-.033,.221,.179],[0,.130,-.058,.212,.169],[0,.198,-.066,.151,.115]],mobile,25);
  const jaw=k.bone(head,0,-.105,.112);
  cast(k,jaw,'asuraRed',[[0,-.098,-.020,.10,.068],[0,-.072,.065,.131,.070],
    [0,-.012,.078,.147,.061],[0,.024,.005,.132,.07]],mobile,28);
  line(k,jaw,'deep',[[-.072,-.005,.108,.014],[0,-.022,.129,.021],[.075,-.004,.110,.014]]);
  for(const side of sides){
    const p=path=>mirror(side,path);
    const helm=p([[.005,.149,.189],[.09,.322,.166],[.163,.395,.065],[.213,.338,-.039],
      [.239,.150,-.012],[.181,.049,.077],[.095,.062,.177],[.051,.122,.204]]);
    plate(k,head,'asuraIvory',helm,.049);
    line(k,head,'asuraTrim',helm.slice(1,7).map(([x,y,z])=>[x,y+.012,z+.024,.015]));
    line(k,head,'deep',p([[.021,.051,.179,.012],[.088,.085,.194,.025],[.153,.051,.166,.024],[.180,.034,.111,.003]]));
    k.mesh(head,'gem','glow',side*.097,.047,.213,.031,.013,.010,0,0,side*.19);
    cast(k,head,'asuraRed',p([[.085,.011,.163,.030,.029],[.145,-.017,.172,.049,.044],
      [.186,-.058,.139,.043,.039],[.215,-.104,.065,.005,.006]]),mobile,39);
    line(k,jaw,'asuraIvory',p([[.091,-.037,.066,.023],[.103,.019,.095,.024],[.080,.069,.092,.003]]));
    for(let i=0;i<3;i++){
      const y=.186-i*.075,z=-.081-i*.034;
      plate(k,head,i%2?'asuraIvory':'asuraGold',p([[.109,y+.052,z+.029],[.211,y+.097,z-.019],
        [.272,y+.019,z-.077],[.231,y-.083,z-.094],[.150,y-.071,z-.047]]),.031);
    }
  }
  cast(k,head,'asuraIvory',[[0,.135,.162,.033,.034],[0,.238,.152,.063,.045],
    [0,.351,.119,.080,.063],[0,.433,.053,.046,.052],[0,.475,-.016,.005,.007]],mobile,63);
  return jaw;
}

function asuraArm(k,body,side,upper,mobile){
  const p=path=>mirror(side,path);
  const arm=k.bone(body,side*(upper?.34:.30),upper?.646:.523,upper?-.146:.125);
  const elbow=k.bone(arm,side*(upper?.36:.139),upper?.208:-.287,upper?.024:.079);
  const palm=k.bone(elbow,side*(upper?.231:.046),upper?.153:-.302,upper?.052:.123);
  const up=upper?1:-1;
  cast(k,arm,'asuraRed',p([[.009,.006,-.061,.111,.105],[.104,up*.039,-.021,.156,.123],
    [upper?.274:.145,up*.123,.026,.127,.112],[upper?.359:.149,upper?.205:-.289,.053,.090,.086]]),mobile,up+80);
  cast(k,elbow,'asuraRed',p([[.012,0,-.033,.087,.095],[.064,up*.048,.029,.105,.09],
    [upper?.174:.049,upper?.113:-.199,.086,.096,.080],[upper?.232:.044,upper?.151:-.308,.114,.074,.069]]),mobile,up+81);
  cast(k,palm,'asuraRed',p([[.008,.023,-.022,.077,.067],[.037,up*.036,.034,.095,.079],
    [.071,up*.077,.104,.098,.06],[.098,up*.106,.149,.052,.039]]),mobile,up+82);
  for(let row=0;row<3;row++){
    const y=up*(.035+row*.064),x=.048+row*(upper?.044:.008),z=.044+row*.021;
    const band=p([[x-.087,y+.035,z+.062],[x+.075,y+.028,z+.068],[x+.109,y+.005,z-.018],
      [x+.052,y-.045,z-.092],[x-.051,y-.046,z-.058],[x-.091,y-.027,z+.030]]);
    plate(k,elbow,row%2?'asuraIvory':'asuraGold',band,.033);
    line(k,elbow,'asuraTrim',band.slice(1,6).map(([x,y,z])=>[x,y+.012,z+.018,.011]));
  }
  for(let i=0;i<4;i++){
    const x=.039+i*.042,y=up*(.048+i*.014),z=.081+Math.sin(i*.72)*.031;
    cast(k,palm,'asuraRed',p([[x,y,z,.027,.029],[x+.028,y+up*.029,z+.046,.029,.027],
      [x+.020,y+up*.072,z+.076,.019,.018],[x-.006,y+up*.099,z+.073,.004,.008]]),mobile,i+111);
  }
  return {arm,elbow,palm,upper,side};
}

export function sculptAsuraDisciple(k,entry,mobile){
  const body=k.bone(k.root,0,1.025,0),head=k.bone(body,0,.842,.146);
  const jaw=asuraHead(k,head,mobile),halo=k.bone(body,0,.867,-.378);
  cast(k,body,'asuraRed',[[0,-.215,-.044,.218,.187],[0,-.071,-.052,.259,.208],
    [0,.179,-.027,.359,.261],[0,.473,.011,.381,.274],[0,.650,.025,.294,.221],[0,.805,.096,.150,.135]],mobile,154);
  ring(k,halo,'asuraGold',.519,.041);
  ring(k,halo,'asuraTrim',.475,.019);
  for(let i=0;i<(mobile?10:13);i++){
    const a=i/(mobile?10:13)*Math.PI*2,spike=k.bone(halo,0,0,0);
    spike.rotation.z=a;
    plate(k,spike,'asuraGold',[[-.061,.475,.001],[.026,.494,-.006],[.044,.571,-.055],
      [.019,.676,-.106],[-.066,.601,-.041]],.047);
    line(k,spike,i%3?'asuraTrim':'glow',[[.003,.503,.040,.013],[.018,.569,.028,.014],[.016,.647,-.076,.004]]);
  }
  const arms=sides.flatMap(side=>[true,false].map(upper=>asuraArm(k,body,side,upper,mobile))),legs=[];
  for(const side of sides){
    const p=path=>mirror(side,path);
    const hip=k.bone(body,side*.185,-.183,.012),shin=k.bone(hip,side*.055,-.35,.043);
    cast(k,hip,'asuraNavy',p([[-.020,.045,-.033,.143,.125],[.021,-.094,-.015,.157,.142],
      [.058,-.218,.025,.126,.110],[.055,-.358,.052,.092,.093]]),mobile,168);
    cast(k,shin,'asuraRed',p([[0,.052,-.024,.091,.104],[.019,-.072,-.007,.127,.108],
      [.030,-.217,.033,.096,.088],[.037,-.387,.091,.091,.059]]),mobile,174);
    const boot=k.bone(shin,0,-.360,.076);
    cast(k,boot,'asuraRed',p([[0,.038,-.031,.087,.067],[.015,.015,.049,.114,.058],
      [.030,-.019,.132,.123,.050],[.021,-.028,.194,.083,.029]]),mobile,185);
    for(let i=0;i<4;i++)line(k,boot,'asuraRed',p([[(i-1.5)*.052,-.007,.132,.028],
      [(i-1.4)*.054,-.027,.179,.029],[(i-1.2)*.054,-.044,.219,.011]]),9);
    for(let i=0;i<3;i++){
      const band=k.bone(shin,side*.030,-.275+i*.068,.070-i*.023);
      band.rotateX(Math.PI/2+.19);
      ring(k,band,i%2?'asuraIvory':'asuraGold',.119-i*.005,.018);
    }
    legs.push({hip,shin,boot,side});
    const breast=p([[.009,.699,.263],[.163,.670,.273],[.323,.568,.189],[.361,.485,.026],
      [.273,.380,.108],[.184,.238,.264],[.044,.245,.304],[.084,.453,.295]]);
    plate(k,body,'asuraIvory',breast,.052);
    line(k,body,'asuraGold',breast.slice(0,7).map(([x,y,z])=>[x,y+.012,z+.026,.018]),15);
    for(let i=0;i<3;i++){
      const at=.106+i*.094,w=.141+i*.022;
      const coat=p([[at,.068,.215-i*.081],[at+w,.048,.187-i*.075],[at+w*.99,-.202,.193-i*.087],
        [at+w*.83,-.416,.234-i*.129],[at+w*.28,-.536,.242-i*.151],[at-.045,-.359,.244-i*.153]]);
      plate(k,body,i%2?'asuraGold':'asuraNavy',coat,.041);
      line(k,body,'asuraTrim',coat.slice(1,6).map(([x,y,z])=>[x,y+.011,z+.020,.017]),14);
    }
    const back=p([[.004,.567,-.17],[.233,.574,-.227],[.343,.408,-.231],[.319,.191,-.261],
      [.181,.088,-.289],[.035,.236,-.290]]);
    plate(k,body,'asuraNavy',back,.049);
    line(k,body,'asuraGold',back.slice(1,6).map(([x,y,z])=>[x,y,z-.029,.018]));
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'duel',asuraCarved:true,grounded:true,
    cataloguePose({beat,step,wind,strike,travel,stage,fall}){
      body.rotation.x=.07-wind*.13+strike*.29+Math.sin(beat*.91)*.032+fall*.12;
      head.rotation.x=-wind*.21+strike*.28;
      jaw.rotation.x=.056+wind*.25+strike*.42;
      halo.rotation.z=Math.sin(beat*.43)*.087+stage*.09+strike*.18;
      for(const {arm,elbow,palm,upper,side} of arms){
        const move=Math.sin(step+side*Math.PI*.58)*travel;
        arm.rotation.set((upper?-.15:.16)+move*.22-wind*(upper?.75:.49)+strike*(upper?1.03:.56),
          side*(wind*.26-strike*.44),side*(upper?.15:.08)+side*(wind*.18-strike*.28));
        elbow.rotation.z=side*(.091+wind*(upper?.27:.19)-strike*.51);
        elbow.rotation.x=-.10+wind*.36-strike*.49;
        palm.rotation.y=side*(wind*.17-strike*.24);
      }
      for(const {hip,shin,boot,side} of legs){
        const pace=Math.sin(step+side*Math.PI*.54);
        hip.rotation.x=pace*travel*.38+wind*.11-strike*.14;
        shin.rotation.x=Math.max(0,-pace)*travel*.44+wind*.073;
        boot.rotation.x=-shin.rotation.x*.59;
      }
    }};
}

function kirinHead(k,head,mobile){
  cast(k,head,'sandSkin',[[0,.064,-.225,.261,.182],[0,.083,-.102,.278,.210],
    [0,.040,.123,.260,.175],[0,-.028,.296,.213,.135],[0,-.119,.472,.174,.093],
    [0,-.135,.597,.118,.068]],mobile,207);
  const jaw=k.bone(head,0,-.177,.044);
  cast(k,jaw,'sandJaw',[[0,-.003,-.143,.208,.065],[0,-.046,.080,.217,.086],
    [0,-.074,.277,.175,.061],[0,-.056,.483,.114,.041],[0,-.035,.532,.082,.028]],mobile,218);
  for(const side of sides){
    const p=path=>mirror(side,path);
    const brow=p([[.021,.125,.330],[.124,.216,.246],[.224,.215,.055],[.292,.136,-.106],
      [.264,.046,-.118],[.191,.039,.193],[.124,-.035,.352]]);
    plate(k,head,'sandScale',brow,.052);
    line(k,head,'sandTrim',brow.slice(1,6).map(([x,y,z])=>[x,y+.019,z+.017,.016]));
    k.mesh(head,'gem','glow',side*.181,.087,.263,.040,.016,.020,0,side*.41,side*.15);
    line(k,head,'sandDark',p([[.057,-.126,.584,.022],[.143,-.124,.504,.029],
      [.203,-.097,.334,.019],[.215,-.056,.159,.012]]),14);
    cast(k,head,'sandDark',p([[.133,.181,-.033,.078,.065],[.191,.244,-.120,.083,.071],
      [.272,.317,-.226,.072,.059],[.386,.444,-.302,.052,.039],[.484,.539,-.306,.025,.023],
      [.559,.570,-.211,.004,.005]]),mobile,260);
    line(k,head,'sandTrim',p([[.170,.250,-.052,.017],[.260,.340,-.188,.022],
      [.379,.438,-.279,.015],[.474,.531,-.288,.016],[.524,.552,-.227,.003]]),13);
    for(let i=0;i<4;i++){
      const t=i/3,x=.143+t*.087,z=.474-t*.339;
      line(k,head,'sandIvory',p([[x,-.123,z,.027],[x+.013,-.170,z+.012,.023],
        [x+.002,-.213,z+.004,.003]]));
    }
    for(let i=0;i<5;i++){
      const t=i/4;
      cast(k,head,i%3?'sandHair':'sandJaw',p([[.157+t*.04,.122-t*.21,.069,.066,.052],
        [.274+t*.056,.114-t*.24,-.108,.103,.071],[.336+t*.049,.015-t*.257,-.238,.061,.049],
        [.389+t*.027,-.100-t*.292,-.373,.005,.007]]),mobile,i+373);
    }
  }
  return jaw;
}

function kirinLeg(k,body,side,front,mobile){
  const p=path=>mirror(side,path);
  const shoulder=k.bone(body,side*(front?.311:.292),front?.291:.211,front?.359:-.510);
  const knee=k.bone(shoulder,side*.103,-.325,front?.056:-.137);
  const paw=k.bone(knee,side*.031,-.313,.091);
  cast(k,shoulder,'sandHair',p([[-.041,.102,-.041,.123,.125],[.029,.033,-.043,.148,.150],
    [.085,-.106,front?.034:-.063,.135,.122],[.103,-.248,front?.041:-.128,.089,.081],
    [.108,-.337,front?.063:-.133,.062,.066]]),mobile,407);
  cast(k,knee,'sandSkin',p([[.002,.062,-.057,.066,.074],[.014,-.052,-.019,.092,.076],
    [.042,-.198,.042,.066,.073],[.030,-.307,.089,.057,.058]]),mobile,410);
  cast(k,paw,'sandJaw',p([[.003,.026,-.049,.062,.054],[.023,-.018,.024,.097,.061],
    [.036,-.034,.118,.122,.046],[.037,-.064,.190,.083,.026]]),mobile,412);
  for(let i=0;i<3;i++){
    const y=.021-i*.089;
    const ridge=p([[.051,y+.063,.097],[.133,y+.056,.077],[.169,y+.001,-.027],
      [.115,y-.066,-.089],[.083,y-.065,-.048],[.071,y-.047,.078]]);
    plate(k,shoulder,i%2?'sandJaw':'sandScale',ridge,.035);
    line(k,shoulder,'sandTrim',ridge.slice(1,5).map(([x,y,z])=>[x,y+.009,z+.016,.011]));
    const toe=(i-1)*.064+.038;
    line(k,paw,'sandIvory',p([[toe,-.041,.139,.025],[toe+.012,-.056,.199,.021],
      [toe+.027,-.077,.244,.004]]));
  }
  return {shoulder,knee,paw,side,front};
}

export function sculptDesertKirin(k,entry,mobile){
  const body=k.bone(k.root,0,.782,-.023),head=k.bone(body,0,.604,.751),neck=k.bone(body,0,.343,.373);
  cast(k,body,'sandSkin',[[0,.171,-.91,.239,.225],[0,.255,-.611,.380,.325],[0,.301,-.19,.448,.390],
    [0,.341,.202,.412,.363],[0,.407,.452,.326,.281],[0,.542,.656,.267,.243]],mobile,442);
  cast(k,neck,'sandJaw',[[0,-.227,.010,.291,.184],[0,-.031,.111,.293,.202],
    [0,.156,.259,.229,.142],[0,.271,.380,.168,.117]],mobile,443);
  const jaw=kirinHead(k,head,mobile);
  const legs=sides.flatMap(side=>[true,false].map(front=>kirinLeg(k,body,side,front,mobile)));
  const panels=[];
  for(const side of sides){
    const p=path=>mirror(side,path);
    for(let i=0;i<7;i++){
      const t=i/6,z=.578-t*1.42,y=.637-t*.355;
      const rib=k.bone(body,side*(.044+t*.059),y,z);
      const w=.252+Math.sin(t*2.9)*.245;
      const scale=p([[.011,.068,.083],[w*.40,.102,.039],[w*.75,.061,-.079],
        [w*1.05,-.080,-.197],[w*.85,-.193,-.218],[w*.44,-.105,-.121],[.036,-.032,-.076]]);
      plate(k,rib,i%3?'sandScale':'sandHair',scale,.049);
      line(k,rib,'sandTrim',scale.slice(1,6).map(([x,y,z])=>[x,y+.022,z+.018,.014]));
      const fret=p([[w*.170,.06,.072],[w*.493,.010,-.038],[w*.754,-.091,-.112],[w*.891,-.159,-.172]]);
      line(k,rib,i%2?'sandDark':'sandJaw',fret.map(([x,y,z],j)=>[x,y,z,[.012,.019,.013,.002][j]]));
      k.geometry(rib,'sandHair',featherVane(...p([[.024,.042,.028],[w*.28,.055,-.092],
        [w*.511,-.102,-.267]]),.066,i+505,mobile?8:11));
      panels.push({rib,side,t});
    }
  }
  const tail=[];
  let link=k.bone(body,0,.142,-.871);
  for(const [index,[x,y,z]] of [[0,.095,-.301],[.096,.172,-.270],[.145,.209,-.226],
    [.148,.184,-.219],[.091,.153,-.204]].entries()){
    const r=.126*(1-index*.151);
    cast(k,link,index%2?'sandDark':'sandSkin',[[0,-.004,.020,r,r*.84],
      [x*.48,y*.49,z*.51,r*.90,r*.79],[x,y,z,r*.81,r*.69]],mobile,index+533);
    line(k,link,'sandTrim',[[0,r*.66,.017,.018],[x*.55,y*.52+r*.59,z*.52,.015],
      [x,y+r*.43,z,.003]]);
    tail.push(link);
    link=k.bone(link,x,y,z);
  }
  for(const side of sides){
    const p=path=>mirror(side,path);
    cast(k,link,'sandHair',p([[.001,.019,.033,.036,.035],[.044,.078,-.119,.069,.057],
      [.063,.156,-.265,.036,.036],[.083,.217,-.401,.003,.004]]),mobile,574);
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'gallop',desertKirin:true,grounded:true,
    cataloguePose({headtime,wind,strike,travel,beat,step,fall,stage}){
      body.rotation.x=-wind*.13+strike*.23+Math.sin(step*1.72)*travel*.06;
      neck.rotation.x=.082+wind*.16-strike*.32;
      head.rotation.x=wind*.20-strike*.48+Math.sin(headtime*2.87)*.049;
      yawHead(head,beat,wind,strike);
      jaw.rotation.x=.071+wind*.32+strike*.59+stage*.058;
      for(const {shoulder,knee,paw,side,front} of legs){
        const move=Math.cos(step+(front?0:Math.PI)+side*Math.PI*.55)*travel;
        shoulder.rotation.x=move*.58+wind*.17-strike*(front?.43:.21);
        shoulder.rotation.z=side*(fall*.41+strike*.041);
        knee.rotation.x=Math.max(0,move)*-.53+wind*.28;
        paw.rotation.x=-knee.rotation.x*.43+strike*.067;
      }
      for(const {rib,side,t} of panels)rib.rotation.z=side*(Math.sin(beat*.62+t*4.2)*travel*.07+wind*.051-strike*.076);
      for(const [i,joint] of tail.entries()){
        joint.rotation.y=(.092+travel*.143)*Math.sin(beat*.64-i*.69);
        joint.rotation.x=Math.cos(beat*.59-i*.57)*.064+wind*.052-strike*.091;
      }
    }};
}

function yawHead(head,beat,wind,strike){
  head.rotation.y=Math.sin(beat*.67)*.09+wind*.077-strike*.13;
}
