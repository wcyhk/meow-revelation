import * as T from '../three.min.mjs';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1],mirror=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);
const up=new T.Vector3(0,1,0);
export const moonFinishes={
  m039:{moonSkin:[0x426e7c,.035,.83,'hide'],moonLip:[0x3c4f59,.024,.87,'hide'],moonHair:[0x213943,.03,.86,'hide'],
    moonBrass:[0xac8244,.65,.54,'bronze'],moonJade:[0x436f73,.54,.56,'gem'],moonCrimson:[0x723039,.09,.85,'cloth'],
    moonDeep:[0x333a5c,.12,.79,'cloth'],moonBow:[0x6a4740,.32,.69,'hide']},
  m041:{moonSkin:[0x667044,.02,.86,'hide'],moonLip:[0x4e5136,.019,.87,'hide'],moonHair:[0x402c2d,.03,.88,'hide'],
    moonBrass:[0xad8343,.65,.55,'bronze'],moonJade:[0x525c37,.49,.61,'gem'],moonCrimson:[0x703531,.12,.78,'hide'],
    moonDeep:[0x3f5150,.14,.77,'cloth'],moonBow:[0x62432f,.22,.77,'hide']},
};

export const moonShapes={
  m039:{torso:[.269,.33,.345,.19],waist:.218,neck:.87,height:1.13,skin:'moonSkin',shell:'moonSkin',clad:true,replaceCrown:true},
  m041:{torso:[.263,.335,.366,.204],waist:.228,neck:.86,height:1.127,skin:'moonSkin',shell:'moonSkin',clad:true,replaceCrown:true},
};

function tools(k,mobile){
  const joint=(parent,name,x,y,z)=>{
    const j=k.bone(parent,x,y,z);
    j.name=name;
    return j;
  };
  const mass=(j,m,p,seed,section=2.43)=>k.geometry(j,m,
    sculptVolume(p,{rings:mobile?11:18,sides:mobile?9:14,seed,ridge:.16,section}));
  const tile=(j,m,p,d=.037)=>k.sculpt.plate(j,m,p,d,d*.33);
  const edge=(j,m,p)=>k.sculpt.sweep(j,m,p,{steps:mobile?8:13,sides:mobile?5:7,ridge:.14});
  const vane=(j,m,p,w,seed)=>k.geometry(j,m,featherVane(...p,w,seed,mobile?7:12));
  return {joint,mass,tile,edge,vane};
}

export function moonPortrait(k,head,mobile,archer){
  const base=carvedFace(k,head,{style:archer?'soldier':'noble',width:archer?.302:.32,finish:'moonSkin',eye:'moonJade',
    lids:'moonLip',brow:'moonHair',detailed:!mobile,fang:'ivory'});
  const {joint,mass,tile,edge,vane}=tools(k,mobile);
  const scalp=joint(head,archer?'Rudra braided blue hair':'Yaksha broad temple and dark hair',0,.107,-.085);
  mass(scalp,'moonHair',[[0,-.211,-.062,.095,.068],[0,-.135,-.072,.137,.097],[0,-.016,-.067,.163,.113],
    [0,.082,-.038,.159,.127],[.011,.163,-.051,.122,.096],[.027,.199,-.126,.073,.079]],43.9);
  for(const side of sides){
    const f=p=>mirror(side,p);
    const trim=f([[.014,.067,.21],[.098,.094,.184],[.168,.127,.105],[.176,.113,-.001],
      [.159,.049,.018],[.103,.027,.112],[.038,.008,.187]]);
    tile(scalp,'moonBrass',trim,.023);
    edge(scalp,'moonJade',trim.slice(1,6).map(([x,y,z],i)=>[x,y+.004,z+.016,[.003,.012,.010,.008,.003][i]]));
    for(let i=0;i<(mobile?5:8);i++){
      const u=i/(mobile?4:7),depth=archer?.205:.107;
      const track=f([[.102+.043*u,.13-.07*u,.126-.083*u],[.154+.079*u,-.051-.112*u,-.012-.084*u],
        [.148+.093*u,-.282-.15*u,-.157-u*depth]]);
      vane(scalp,i%3?'moonHair':'moonDeep',track,.051+i*.003,66+i);
    }
    const ear=joint(head,archer?'Rudra gold ear clasp '+side:'Yaksha sculpted ear '+side,side*.139,.02,-.01);
    mass(ear,'moonSkin',f([[0,.038,.009,.022,.02],[.018,.021,.009,.033,.029],
      [.023,-.037,.02,.026,.023],[.008,-.066,.028,.01,.011]]),11.5);
    edge(ear,archer?'moonBrass':'moonLip',f([[.009,.042,.031,.004],[.028,.02,.041,.009],
      [.034,-.019,.044,.011],[.022,-.052,.041,.003]]));
  }
  k.mesh(scalp,'gem','moonJade',0,.047,.204,.024,.051,.024);
  return base;
}

function cloth(parent,name,path,colors,phase,across,flex){
  const [tint,trim,lining]=colors;
  return {parent,name,path,tint,trim,lining,phase,across,flex};
}

export function fitMoonFighter(k,rig,mobile,archer){
  const {joint,mass,tile,edge}=tools(k,mobile),{body,limbs}=rig;
  const silks=[],pauldrons=[];
  const kind=archer?'Rudra':'Yaksha';
  for(const {shoulder,elbow,wrist,leg,knee,side} of limbs){
    const f=p=>mirror(side,p);
    const back=f([[.023,.651,-.136],[.146,.645,-.18],[.262,.551,-.23],[.28,.398,-.209],
      [.173,.299,-.269],[.068,.363,-.293],[.013,.483,-.254]]);
    tile(body,archer?'moonDeep':'moonJade',back,.052);
    edge(body,'moonBrass',back.slice(1,6).map(([x,y,z],i)=>[x,y+.011,z-.026,[.005,.015,.017,.011,.004][i]]));
    const belt=f([[.022,.085,.24],[.145,.117,.24],[.24,.099,.178],[.265,.036,.10],
      [.181,-.022,.251],[.093,-.064,.299],[.023,-.016,.283]]);
    tile(body,archer?'moonDeep':'moonCrimson',belt,.041);
    edge(body,'moonBrass',belt.slice(1,6).map(([x,y,z],i)=>[x,y+.006,z+.021,[.006,.014,.013,.011,.004][i]]));
    const chest=archer?[[.039,.597,.205],[.144,.636,.201],[.249,.561,.163],[.236,.47,.169],
      [.176,.427,.223],[.059,.446,.26]]:[[.027,.649,.204],[.162,.689,.195],[.257,.549,.177],[.214,.379,.255],
      [.184,.312,.271],[.05,.377,.296]];
    tile(body,archer?'moonBrass':'moonJade',f(chest),.044);
    edge(body,'moonBrass',f(chest.slice(0,6).map(([x,y,z],i)=>[x,y-.009,z+.028,[.005,.014,.015,.013,.009,.003][i]])));
    if(archer){
      const inlay=f([[.069,.565,.245],[.133,.59,.237],[.21,.55,.224],[.198,.508,.244],
        [.154,.477,.268],[.083,.5,.281]]);
      tile(body,'moonJade',inlay,.022);
      edge(body,'moonBrass',inlay.slice(0,5).map(([x,y,z],i)=>[x,y+.006,z+.016,[.003,.011,.012,.009,.003][i]]));
      for(let n=0;n<3;n++)k.mesh(body,'gem',n===1?'moonJade':'moonBrass',
        side*(.105+n*.043),.482+n*.024,.268-n*.017,.018,.021,.016,0,side*.20);
    }else{
      const girdle=f([[.045,.602,.242],[.118,.633,.23],[.217,.556,.191],[.245,.472,.192],
        [.197,.428,.264],[.095,.413,.288],[.053,.49,.271]]);
      tile(body,'moonBrass',girdle,.046);
      tile(body,'moonJade',girdle.map(([x,y,z])=>[x*.86+side*.015,.517+(y-.517)*.75,z+.028]),.024);
      edge(body,'moonBrass',girdle.slice(1,6).map(([x,y,z],i)=>[x,y-.016,z+.033,[.004,.012,.016,.013,.004][i]]));
      edge(body,'moonDeep',f([[.037,.679,.177,.005],[.073,.563,.263,.022],[.107,.456,.299,.024],
        [.091,.331,.321,.018],[.054,.27,.323,.004]]));
    }
    for(let row=0;row<3;row++){
      const w=.19-row*.027,h=.37-row*.091;
      const rib=f([[.018,h+.016,.221],[.079,h+.039,.239],[w*.83,h+.064,.229],
        [w,h+.013,.209],[w*.74,h-.035,.24],[.055,h-.04,.27]]);
      tile(body,archer?'moonSkin':row%2?'moonSkin':'moonJade',rib,.025);
      if(!archer)edge(body,'moonBrass',rib.slice(0,5).map(([x,y,z],i)=>[x,y+.01,z+.01,[.003,.008,.01,.008,.003][i]]));
    }
    const cap=joint(shoulder,kind+' shaped shoulder plate '+side,side*.042,.021,-.032);
    mass(shoulder,'moonSkin',f([[0,.057,-.02,.086,.097],[.053,-.021,-.032,.134,.121],
      [.082,-.155,.003,.121,.103],[.113,-.299,.028,.081,.077]]),12.1+side);
    for(let i=0;i<(side>0?4:2);i++){
      const y=.134-i*.081,w=(side>0?.269:.203)-i*.028;
      const flare=f([[-.09,y+.038,.068],[w*.47,y+.073,.097],[w*.94,y+.017,.036],[w*1.02,y-.075,-.086],
        [w*.65,y-.111,-.15],[.033,y-.073,-.121],[-.052,y-.028,-.026]]);
      tile(cap,i%2?'moonBrass':archer?'moonDeep':'moonCrimson',flare,.045);
      edge(cap,'moonBrass',flare.slice(1,6).map(([x,y,z],i)=>[x,y+.011,z-.013,[.005,.016,.017,.01,.004][i]]));
    }
    pauldrons.push({cap,side});
    mass(elbow,'moonSkin',f([[0,.054,.001,.073,.081],[.043,-.065,.045,.108,.092],
      [.045,-.185,.069,.093,.074],[.028,-.316,.103,.057,.058]]),19.1+side);
    for(let row=0;row<3;row++){
      const y=-.031-row*.081;
      const section=f([[-.059,y+.023,.092],[.021,y+.064,.139],[.111,y+.029,.101],
        [.112,y-.045,.121],[.042,y-.073,.159],[-.052,y-.051,.142]]);
      tile(elbow,row%2?'moonDeep':'moonBrass',section,.037);
      edge(elbow,'moonBrass',section.slice(1,5).map(([x,y,z],i)=>[x,y-.01,z+.019,[.004,.013,.012,.003][i]]));
    }
    mass(wrist,'moonSkin',[[0,.049,-.003,.044,.047],[.011,-.019,.044,.069,.058],[.021,-.088,.105,.059,.046]],7.9+side);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.031;
      edge(wrist,'moonSkin',[[x,.013,.052,.016],[x+.004,-.048,.109,.018],[x+.01,-.096,.14,.005]]);
    }
    mass(leg,'moonDeep',f([[0,.075,-.013,.112,.114],[.032,-.075,-.022,.131,.117],
      [.044,-.235,.022,.108,.088],[.03,-.386,.019,.073,.066]]),33+side);
    mass(knee,archer?'moonBrass':'moonSkin',f([[0,.054,.014,.077,.083],[.022,-.116,.024,.097,.088],
      [.038,-.252,.077,.076,.077],[.035,-.344,.207,.079,.051],[.018,-.355,.269,.043,.037]]),21.78+side,2.69);
    const greave=f([[-.032,.007,.105],[.071,.048,.133],[.106,-.033,.131],[.111,-.171,.139],
      [.044,-.26,.191],[-.048,-.177,.173],[-.053,-.046,.121]]);
    tile(knee,archer?'moonJade':'moonDeep',greave,.04);
    edge(knee,'moonBrass',greave.slice(1,6).map(([x,y,z],i)=>[x,y-.014,z+.024,[.004,.012,.014,.008,.003][i]]));
    const lower=archer?.75:.67;
    silks.push(
      cloth(body,kind+' split front weave '+side,f([[.105,.058,.251,.085],[.142,-.142,.293,.123],
        [.201,-.407,.331,.148],[.244,-lower,.366,.099]]),
      archer?[0x823340,0xb0884c,0x522b45]:[0x395953,0xb08a55,0x513336],side*.68,[.97,0,side*.18],.79),
      cloth(body,kind+' pleated back weave '+side,f([[.136,.383,-.246,.072],[.197,.111,-.292,.12],
        [.233,-.246,-.337,.147],[.273,-lower-.059,-.385,.108]]),
      archer?[0x513b58,0xb18b5a,0x45303f]:[0x473b42,0xa37e53,0x4c3337],side*.93,[.91,0,side*.31],1.04),
    );
  }
  const weapon=archer?drawBow(k,rig,mobile):heldSpear(k,rig,mobile);
  return {silks,pose(data){
    const {beat,wind,strike}=data;
    for(const {cap,side} of pauldrons)cap.rotation.z=side*(wind*.143-strike*.137+Math.sin(beat*.61)*.037);
    weapon(data);
  }};
}

function heldSpear(k,rig,mobile){
  const {joint,mass,tile,edge}=tools(k,mobile),limb=rig.limbs[1],off=rig.limbs[0];
  const spear=joint(limb.wrist,'Yaksha chipped crescent spear',.021,-.054,.131);
  mass(spear,'moonBow',[[0,-.726,-.02,.028,.033],[0,-.384,.003,.039,.042],[.018,.071,.006,.035,.034],
    [.045,.646,.012,.035,.039],[.066,1.126,.054,.036,.035]],23.4);
  for(let i=0;i<6;i++){
    const y=-.527+i*.133,x=i*.008;
    edge(spear,i%2?'moonCrimson':'moonBrass',[[x-.037,y,.021,.004],[x-.010,y+.02,.056,.009],
      [x+.026,y+.038,.044,.011],[x+.044,y+.053,.017,.004]]);
  }
  const leaf=[[.046,1.011,.04],[.132,1.19,.059],[.148,1.402,.053],[.081,1.66,-.017],
    [.061,1.446,.084],[-.032,1.285,.089],[-.066,1.153,.054],[-.01,1.058,.035]];
  tile(spear,'steel',leaf,.06);
  edge(spear,'ivory',leaf.slice(1,6).map(([x,y,z],i)=>[x,y,z+.027,[.007,.015,.012,.014,.004][i]]));
  for(const side of sides){
    const f=p=>mirror(side,p),curve=f([[.034,1.092,.044],[.203,1.204,.023],[.244,1.412,.049],[.316,1.537,.038],
      [.281,1.318,.11],[.176,1.145,.128],[.096,1.081,.079]]);
    tile(spear,'moonBrass',curve,.042);
    edge(spear,'steel',curve.slice(1,5).map(([x,y,z],i)=>[x,y+.018,z+.024,[.005,.011,.011,.003][i]]));
  }
  markEnemyWeapon(spear,[.081,1.66,-.016],{from:[0,-.71,0],width:.187});
  return ({wind,strike,travel})=>{
    limb.shoulder.rotation.x=-.37-wind*.89+strike*.54;
    limb.elbow.rotation.x=-.75-wind*.37+strike*.46;
    spear.rotation.set(1.06+wind*.27-strike*.46,.13+wind*.36,-.94+wind*.71-strike*.83);
    off.shoulder.rotation.x=-.42-wind*.48-strike*.24;
    off.elbow.rotation.y=-.27-wind*.15+strike*.23;
    off.wrist.rotation.x=-travel*.22+wind*.35-strike*.38;
  };
}

function drawBow(k,rig,mobile){
  const {joint,mass,tile,edge}=tools(k,mobile),{body}=rig,hold=rig.limbs[1],pull=rig.limbs[0];
  pull.wrist.name='Rudra string draw hand';
  const bow=joint(hold.wrist,'Rudra offset gilded bow',.014,-.038,.122);
  mass(bow,'moonBow',[[.013,-.204,-.017,.03,.035],[0,-.087,-.007,.046,.045],[0,.077,0,.046,.044],
    [.014,.209,-.011,.031,.033]],13.63);
  const limbs=[],cords=[];
  for(const side of sides){
    const p=joint(bow,'Rudra bending bow limb '+side,0,0,0);
    const rise=side>0?1:.90;
    const path=[[.015,.135,-.019,.035,.037],[.085,.324,-.038,.047,.046],[.165,.528,-.061,.045,.049],
      [.182,.711,-.084,.037,.035],[.107,.871,-.114,.029,.029],[.007,1.019,-.147,.019,.018],[-.049,1.107,-.152,.003,.004]];
    mass(p,'moonBow',path.map(([x,y,z,...radius])=>[x,y*side*rise,z,...radius]),21.16+side,2.70);
    edge(p,'moonBrass',path.map(([x,y,z,r])=>[x+.011,y*side*rise,z+.025,r*.48]));
    const tip=joint(p,'Rudra limb tip '+side,-.043,side*rise*1.075,-.15);
    tile(tip,'moonJade',[[-.047,.019,.02],[-.022,.076,.043],[.035,.057,.04],[.044,-.004,.043],
      [.014,-.037,.028],[-.041,-.021,.017]],.027);
    if(side>0)markEnemyWeapon(tip,[.003,.07,.02],{from:[.01,-.034,.005],width:.084,aim:false,kind:'bow'});
    const strand=joint(bow,'Rudra taut string '+side,0,0,0);
    const geo=new T.CylinderGeometry(.008,.008,1,6);
    geo.translate(0,.5,0);
    k.geometry(strand,'ivory',geo);
    limbs.push({p,tip,side});
    cords.push(strand);
  }
  const end=new T.Vector3(),nock=new T.Vector3(),direction=new T.Vector3(),targetWorld=new T.Vector3();
  const a=new T.Vector3(),b=new T.Vector3(),q=new T.Quaternion(),rest=new T.Quaternion();
  return ({wind,strike})=>{
    hold.shoulder.rotation.set(-.55-wind*.224+strike*.147,.245+wind*.18,.24+wind*.14);
    hold.elbow.rotation.set(-.77-wind*.31+strike*.25,-.26+wind*.17,-.17);
    bow.rotation.set(1.26+wind*.068-strike*.26,.15+wind*.13,-.42+wind*.20);
    body.localToWorld(targetWorld.set(.335+wind*.079,.373+wind*.101,.435+wind*.09));
    for(let pass=0;pass<2;pass++)for(const pivot of [hold.elbow,hold.shoulder]){
      bow.getWorldPosition(end);
      pivot.worldToLocal(a.copy(end)).normalize();
      pivot.worldToLocal(b.copy(targetWorld)).normalize();
      q.setFromUnitVectors(a,b).slerp(rest,.38);
      pivot.quaternion.multiply(q);
    }
    pull.shoulder.rotation.set(-.51-wind*.53+strike*.42,-.12,.29+wind*.11);
    pull.elbow.rotation.set(-.86-wind*.38+strike*.56,.31,-.18);
    nock.set(-.035-wind*.29+strike*.083,.028,.073+wind*.04);
    bow.localToWorld(targetWorld.copy(nock));
    for(let pass=0;pass<2;pass++)for(const pivot of [pull.elbow,pull.shoulder]){
      pull.wrist.localToWorld(end.set(.024,-.06,.12));
      pivot.worldToLocal(a.copy(end)).normalize();
      pivot.worldToLocal(b.copy(targetWorld)).normalize();
      q.setFromUnitVectors(a,b).slerp(rest,.47);
      pivot.quaternion.multiply(q);
    }
    pull.wrist.localToWorld(end.set(.024,-.06,.12));
    nock.lerp(bow.worldToLocal(end),.96-strike*.24);
    for(const [i,{p,tip,side}] of limbs.entries()){
      p.rotation.z=side*(wind*.164-strike*.082);
      bow.worldToLocal(tip.getWorldPosition(end));
      const strand=cords[i];
      direction.copy(end).sub(nock);
      strand.position.copy(nock);
      strand.scale.y=direction.length();
      strand.quaternion.setFromUnitVectors(up,direction.normalize());
    }
  };
}

export function fitMoonSitar(k,rig,mobile){
  const {joint,mass,tile,edge,vane}=tools(k,mobile),{body,head,limbs}=rig;
  const locks=joint(head,'Gandharva swept brown hair and scarf',0,.075,-.071);
  mass(locks,'gandharvaHair',[[0,-.119,-.066,.113,.104],[0,-.045,-.077,.144,.11],
    [.006,.112,-.063,.165,.126],[.017,.164,-.068,.142,.119],[.026,.201,-.089,.103,.094]],12.88);
  const wraps=[];
  for(const side of sides){
    const f=path=>mirror(side,path);
    for(let i=0;i<(mobile?6:9);i++){
      const u=i/(mobile?5:8),v=f([[.091+u*.037,.171-u*.073,.092-u*.081],
        [.16+u*.043,.126-u*.19,-.027-u*.133],[.183+u*.076,-.069-u*.25,-.16-u*.113]]);
      vane(locks,i%3?'gandharvaHair':'gandharvaWood',v,.045+i*.006,36+i);
    }
    const band=f([[.032,.21,.138],[.105,.225,.109],[.159,.217,.027],[.177,.154,-.104],
      [.135,.112,-.146],[.144,.158,-.016],[.074,.171,.089]]);
    tile(head,'gandharvaScarf',band,.024);
    edge(head,'gandharvaWood',band.slice(0,5).map(([x,y,z],i)=>[x,y+.01,z-.017,[.004,.011,.009,.007,.003][i]]));
    const scarf=joint(locks,'Gandharva scarf trailing cloth '+side,side*.064,.103,-.165);
    for(let i=0;i<3;i++){
      const u=i*.028,v=f([[.018+u,.047,-.003],[.078+u,.006,-.148-u*.57],
        [.133+u,-.178-u*.76,-.287-u*.87]]);
      vane(scarf,i%2?'linen':'gandharvaScarf',v,.043+i*.007,72+i);
      edge(scarf,'gandharvaScarf',v.map(([x,y,z],i)=>[x,y,z,[.006,.014,.003][i]]));
    }
    wraps.push({scarf,side});
  }
  const hold=limbs[1],pluck=limbs[0];
  pluck.wrist.name='Gandharva string pluck hand';
  const si=joint(hold.wrist,'Gandharva hand-carved sitar',.009,-.049,.132);
  const shell=[[0,-.958,-.025,.063,.055],[0,-.875,-.037,.152,.115],[0,-.77,-.035,.214,.156],
    [.006,-.622,-.026,.23,.167],[0,-.498,-.019,.186,.126],[0,-.376,-.019,.146,.093],[0,-.303,.013,.064,.056]];
  mass(si,'gandharvaWood',shell,33.12,2.31);
  mass(si,'gandharvaLacquer',[[0,-.457,.019,.081,.067],[0,-.266,.024,.072,.061],
    [-.003,-.067,.019,.065,.057],[0,.191,.011,.056,.055],[.017,.407,-.023,.059,.044],
    [.013,.624,-.081,.057,.045],[.023,.714,-.109,.028,.029]],9.6,2.77);
  const chamber=[[0,-.943,.068],[.123,-.869,.095],[.204,-.746,.139],[.211,-.608,.138],[.182,-.489,.111],
    [.105,-.39,.093],[.071,-.323,.07],[0,-.289,.056]];
  tile(si,'gandharvaScarf',[...chamber,...chamber.slice(1,-1).reverse().map(([x,y,z])=>[-x,y,z])],.041);
  for(const side of sides){
    const f=p=>mirror(side,p);
    edge(si,'oldGold',f(chamber.map(([x,y,z],i)=>[x,y,z+.023,[.005,.012,.014,.016,.013,.012,.01,.004][i]])));
    const cavity=f([[.033,-.826,.123],[.121,-.786,.156],[.168,-.686,.16],[.137,-.6,.159],[.069,-.559,.148],
      [.053,-.613,.157],[.099,-.691,.168],[.071,-.75,.162]]);
    tile(si,'gandharvaLacquer',cavity,.026);
    edge(si,'oldGold',cavity.slice(0,7).map(([x,y,z],i)=>[x,y,z+.019,[.003,.012,.012,.012,.008,.009,.004][i]]));
    for(let n=0;n<(mobile?6:9);n++){
      const y=.062+n*.069,z=.012-n*.008;
      edge(si,n%2?'oldGold':'gandharvaWood',f([[.027,y,z,.011],[.048,y+.009,z+.018,.013],
        [.083+n*.004,y+.018,z+.019,.014],[.099+n*.006,y+.022,z+.016,.006]]));
    }
  }
  for(let fret=0;fret<(mobile?10:15);fret++){
    const y=-.379+fret*.097*Math.pow(.967,fret),w=.066+Math.sin(fret*.59)*.006;
    edge(si,fret%4?'gandharvaWood':'oldGold',[[-w,y,.073,.005],[0,y+.013,.106,.010],[w,y,.073,.005]]);
  }
  for(let n=0;n<5;n++){
    const x=(n-2)*.020;
    edge(si,n%3?'ivory':'oldGold',[[x*1.16,-.812,.176,.003],[x,-.605,.177,.004],
      [x*.91,-.222,.138,.003],[x*.75,.22,.098,.003],[x*.61,.613,-.028,.0025]]);
  }
  const badge=joint(si,'Gandharva sympathetic string bracket',.019,.492,-.058);
  tile(badge,'oldGold',[[-.052,-.022,.056],[.05,-.024,.041],[.063,.066,.017],[.016,.098,-.021],[-.043,.065,.023]],.026);
  markEnemyWeapon(badge,[.032,.09,-.016],{from:[-.02,-.027,.032],width:.076,aim:false,kind:'focus'});

  const target=new T.Vector3(),point=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),q=new T.Quaternion(),rest=new T.Quaternion();
  return ({beat,wind,strike,travel})=>{
    hold.shoulder.rotation.set(-.57-wind*.31+strike*.24,.27+wind*.27,.19+wind*.25);
    hold.elbow.rotation.set(-.91-wind*.26+strike*.31,-.15+wind*.17,.20);
    si.rotation.set(1.52+wind*.23-strike*.28,.17+wind*.21,-1.18+wind*.24-strike*.21);
    body.localToWorld(target.set(-.12,.275+wind*.078,.45+strike*.063));
    si.worldToLocal(b.copy(target)).normalize();
    a.set(0,-.58,.17).normalize();
    q.setFromUnitVectors(a,b).slerp(rest,.14);
    si.quaternion.multiply(q);
    pluck.shoulder.rotation.set(-.61-wind*.33+strike*.27,-.063,.32+wind*.19);
    pluck.elbow.rotation.set(-1.03-wind*.35+strike*.64,.38+wind*.31-strike*.275,-.15);
    pluck.wrist.rotation.set(.08+wind*.32-strike*.51,.12,-.25);
    si.localToWorld(target.set(.052-strike*.11,-.58+wind*.065,.18+wind*.127));
    for(let i=0;i<3;i++)for(const pivot of [pluck.elbow,pluck.shoulder]){
      pluck.wrist.localToWorld(point.set(.024,-.054,.127));
      pivot.worldToLocal(a.copy(point)).normalize();
      pivot.worldToLocal(b.copy(target)).normalize();
      q.setFromUnitVectors(a,b).slerp(rest,pivot===pluck.elbow?.30:.45);
      pivot.quaternion.multiply(q);
    }
    locks.rotation.x=Math.sin(beat*.71)*.033+travel*.085;
    for(const {scarf,side} of wraps){
      scarf.rotation.x=wind*.129-strike*.21+Math.sin(beat*.55+side)*.075;
      scarf.rotation.z=side*(travel*.107+wind*.073-strike*.134);
    }
  };
}
