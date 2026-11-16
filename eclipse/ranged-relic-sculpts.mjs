import * as T from '../three.min.mjs';
import {forge,shapeBow} from './armory.mjs?v=emberlight-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const cord=(k,j,finish,path,steps=10)=>k.sculpt.sweep(j,finish,path,{sides:7,steps,ridge:.21});
const shell=(k,j,finish,outline,depth=.046)=>k.sculpt.plate(j,finish,outline,depth,depth*.33);
const hide=(k,j,finish,path,mobile,seed=0)=>k.geometry(j,finish,sculptVolume(path,{
  sides:mobile?9:14,rings:mobile?11:16,section:2.41,ridge:.24,seed,fur:finish==='rangedPelt'
}));
const gem=(k,j,finish,where,size)=>k.mesh(j,'gem',finish,...where,...size);
const circle=(k,j,finish,radius,tube,span=Math.PI*2)=>
  k.geometry(j,finish,new T.TorusGeometry(radius,tube,7,26,span));

const marksmen={
  'western-rifle':{shape:'duster',role:'gun',body:[.38,1.02,.74,.76],colors:[0x3f3444,0x322632,0x624247,0xb7a179,0x8d8797],
    element:0xb9aedf,energy:'mist',scale:1.16},
  'sniper-crossbow':{shape:'stone',role:'flat',body:[.31,.97,.72,.69],colors:[0x516069,0x262e39,0x3e4652,0xacadb6,0x676b81],
    element:0xb5bcea,energy:'mist',scale:1.00},
  'lion-crossbow':{shape:'lion',role:'flat',body:[.49,1.05,.82,.78],colors:[0x74735b,0x372f28,0x654938,0xb79552,0x885939],
    element:0xe4ca85,energy:'bolts',scale:1.11},
  'red-bow':{shape:'plume',role:'bow',body:[.30,1.06,.83,.76],colors:[0x822b36,0x311c29,0x702630,0xcf8b66,0x93423c],
    element:0xff7947,energy:'embers',scale:1.09},
};

function materials(k,design){
  const [metal,shadow,cloth,trim,pelt]=design.colors;
  for(const [name,color,metalness,roughness,finish] of [
    ['rangedPlate',metal,.54,.48,design.shape==='stone'?'stone':'iron'],
    ['rangedShadow',shadow,.32,.65,'iron'],['rangedCloth',cloth,.09,.78,'cloth'],
    ['rangedTrim',trim,.60,.43,'bronze'],['rangedPelt',pelt,.046,.76,'hide'],
    ['rangedIvory',0xc3b19b,.12,.61,'bone'],['rangedWood',0x473020,.14,.71,'hide'],
  ]){
    const material=new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:metalness>.4?.66:.21});
    k.materials[name]=paintedFinish(material,finish,true,true);
  }
  k.materials.rangedGlow=new T.MeshBasicMaterial({color:design.element});
}

function exactWeapon(k,weapon,grip,design){
  const socket=k.bone(grip,.015,-.021,design.role==='bow'?.20:.135);
  const model=forge(weapon);
  model.scale.setScalar(design.scale);
  if(design.role==='bow'){
    model.rotation.y=Math.PI/2;
    model.position.set(.015,.036,-.146);
  }else{
    model.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(-1,0,0),
      new T.Vector3(0,0,1),new T.Vector3(0,1,0)));
    model.position.set(design.role==='gun'?.057:.020,.052,design.role==='gun'?.232:.285);
  }
  for(const [name,mat] of Object.entries(model.userData.finishes))k.materials['rangedForge'+name]=mat;
  socket.add(model);
  const bow=model.userData.bow;
  if(bow)socket.userData.weaponClearanceParts=[...bow.string,bow.arrow,...bow.attachments.map(part=>part.mesh)];
  model.updateMatrix();
  const tip=new T.Vector3(...model.userData.launch.tip).applyMatrix4(model.matrix);
  const from=tip.clone().addScaledVector(new T.Vector3(0,0,1),design.role==='bow'?-.66:-.98);
  markEnemyWeapon(socket,tip.toArray(),{from:from.toArray(),width:design.role==='gun'?.12:.20,kind:'bow'});
  const flash=k.bone(socket,...tip.toArray());
  const glare=new T.MeshBasicMaterial({color:design.element,transparent:true,opacity:.68,
    depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  k.materials.rangedMuzzle=glare;
  const halo=design.role==='gun'?.081:design.role==='bow'?.055:.072;
  circle(k,flash,'rangedMuzzle',halo,.011,Math.PI*1.7);
  const bud=k.bone(flash,0,0,.060);
  circle(k,bud,'rangedMuzzle',halo*.42,.015);
  gem(k,flash,'rangedMuzzle',[0,0,.064],[.024,.024,.089]);
  flash.visible=false;
  return {model,flash,glare};
}

function dusterCollar(k,head,mobile){
  const neck=k.bone(head,0,-.20,.018);
  hide(k,neck,'rangedShadow',[[0,-.089,-.007,.196,.139],[0,-.016,-.012,.191,.152],
    [0,.052,-.019,.172,.131],[0,.080,-.024,.106,.086]],mobile,42);
  const mouth=k.bone(neck,0,.080,-.025);
  mouth.rotation.x=-Math.PI/2;
  circle(k,mouth,'rangedTrim',.115,.020);
  circle(k,mouth,'rangedGlow',.083,.008,Math.PI*1.43);
  for(const side of sides){
    const s=path=>reflect(side,path);
    const lapel=s([[.077,-.121,.104],[.172,-.031,.152],[.238,.075,.034],
      [.229,.128,-.154],[.144,.052,-.193],[.130,-.052,-.052]]);
    shell(k,head,'rangedPlate',lapel,.051);
    cord(k,head,'rangedTrim',lapel.slice(1,5).map(([x,y,z])=>[x,y+.012,z+.015,.013]));
    cord(k,mouth,'rangedGlow',s([[.037,.048,.008,.009],[.053,.090,.040,.010],
      [.076,.126,.119,.006],[.058,.158,.163,.001]]),11);
  }
}

function stoneCowl(k,head,mobile){
  hide(k,head,'rangedCloth',[[0,-.219,-.057,.113,.112],[0,-.094,-.092,.214,.167],
    [0,.066,-.067,.229,.193],[.028,.195,-.112,.182,.158],[.055,.337,-.203,.073,.096],
    [.080,.394,-.247,.007,.014]],mobile,25);
  hide(k,head,'rangedShadow',[[0,-.192,.145,.093,.079],[0,-.063,.179,.147,.084],
    [0,.073,.160,.172,.099],[0,.151,.109,.115,.082]],mobile,29);
  for(const side of sides){
    const p=path=>reflect(side,path);
    const plate=p([[.017,.132,.235],[.140,.148,.215],[.209,.092,.103],
      [.190,-.081,.065],[.126,-.166,.149],[.027,-.176,.222],[.061,-.079,.257]]);
    shell(k,head,'rangedPlate',plate,.037);
    cord(k,head,'rangedTrim',plate.slice(1,6).map(([x,y,z])=>[x,y+.010,z+.015,.012]));
    cord(k,head,'rangedGlow',p([[.029,.068,.263,.005],[.078,.086,.254,.011],
      [.126,.076,.227,.009],[.158,.067,.189,.003]]));
  }
  const lens=k.bone(head,.086,.073,.251);
  circle(k,lens,'rangedTrim',.036,.009);
  gem(k,lens,'rangedGlow',[0,0,.011],[.025,.027,.013]);
}

function lionFace(k,head,mobile){
  hide(k,head,'rangedPelt',[[0,-.171,-.072,.179,.123],[0,-.087,-.062,.249,.191],
    [0,.043,-.042,.268,.221],[0,.169,-.028,.226,.158],[0,.245,-.079,.127,.109]],mobile,65);
  hide(k,head,'rangedIvory',[[0,-.137,.103,.118,.088],[0,-.102,.186,.169,.101],
    [0,-.068,.291,.152,.092],[0,-.080,.365,.097,.046]],mobile,71);
  const jaw=k.bone(head,0,-.182,.087);
  hide(k,jaw,'rangedPelt',[[0,-.082,.017,.113,.064],[0,-.069,.134,.161,.056],
    [0,-.038,.246,.106,.051],[0,-.006,.303,.072,.028]],mobile,73);
  hide(k,head,'rangedShadow',[[0,-.036,.294,.065,.042],[0,-.047,.354,.088,.043],
    [0,-.088,.398,.048,.027],[0,-.103,.364,.021,.018]],mobile,83);
  for(const side of sides){
    const p=path=>reflect(side,path);
    cord(k,head,'rangedShadow',p([[.052,.065,.262,.011],[.128,.072,.237,.031],
      [.198,.122,.174,.036],[.228,.139,.093,.010]]));
    k.mesh(head,'gem','rangedGlow',side*.123,.077,.257,.036,.015,.013,0,side*.34,side*.21);
    cord(k,head,'rangedPelt',p([[.042,.103,.228,.020],[.139,.129,.234,.048],
      [.197,.169,.155,.037],[.231,.184,.054,.004]]));
    hide(k,head,'rangedPelt',p([[.157,.168,-.012,.038,.045],[.241,.211,-.029,.071,.054],
      [.282,.262,-.077,.052,.038],[.275,.296,-.103,.028,.024]]),mobile,94);
    cord(k,jaw,'rangedIvory',p([[.118,-.042,.212,.031],[.125,.018,.229,.027],
      [.111,.076,.238,.015],[.100,.112,.216,.004]]),12);
    for(let i=0;i<6;i++){
      const t=i/5;
      hide(k,head,i%3?'rangedPelt':'rangedWood',p([[.138+t*.075,.144-t*.257,.141,.057,.038],
        [.224+t*.072,.097-t*.259,.033,.078,.047],[.316+t*.012,-.003-t*.248,-.101,.051,.037],
        [.344-t*.063,-.128-t*.236,-.243,.006,.005]]),mobile,109+i);
    }
  }
  return jaw;
}

function phoenixMask(k,head,mobile){
  hide(k,head,'rangedIvory',[[0,-.188,.015,.071,.084],[0,-.083,.038,.136,.116],
    [0,.006,.001,.148,.132],[0,.142,-.009,.132,.126],[0,.196,-.061,.111,.087]],mobile,25);
  hide(k,head,'rangedShadow',[[0,-.047,-.075,.149,.116],[0,.059,-.046,.179,.150],
    [.007,.185,-.044,.160,.129],[.016,.248,-.091,.081,.093]],mobile,28);
  cord(k,head,'rangedPelt',[[-.052,-.079,.148,.006],[0,-.085,.171,.009],[.049,-.079,.148,.005]]);
  for(const side of sides){
    const p=path=>reflect(side,path);
    const brow=p([[.016,.074,.151],[.096,.145,.145],[.157,.157,.075],
      [.203,.228,-.059],[.195,.087,-.073],[.138,.017,.073],[.051,-.008,.153]]);
    shell(k,head,'rangedPlate',brow,.027);
    cord(k,head,'rangedTrim',brow.slice(1,6).map(([x,y,z])=>[x,y+.015,z+.016,.011]));
    k.mesh(head,'gem','rangedGlow',side*.076,.045,.169,.025,.010,.007,0,side*.21,-side*.18);
    for(let i=0;i<4;i++){
      const t=i*.054;
      k.geometry(head,i%2?'rangedPelt':'rangedPlate',featherVane(...p([[.062+t,.113+t,.132-t],
        [.102+t,.252+t,-.051-t],[.172+t,.398+t,-.212-t]]),.061-i*.009,i+50,mobile?9:13));
    }
  }
}

function cartridgeRifleman(k,body,back,grips,flaps,mobile){
  const left=grips[0].parent.parent,right=grips[1].parent.parent;
  const collar=k.bone(body,0,.25,.213);
  for(const side of sides){
    const p=path=>reflect(side,path);
    const flap=p([[.036,.471,.053],[.316,.359,.015],[.387,.220,-.101],
      [.339,.073,-.089],[.222,-.030,.042],[.091,-.126,.088]]);
    shell(k,collar,'rangedShadow',flap,.042);
    cord(k,collar,'rangedTrim',flap.slice(1,6).map(([x,y,z])=>[x,y+.013,z+.017,.015]));
  }
  for(let i=0;i<6;i++){
    const t=i/5,x=-.268+t*.476,y=.504-t*.654,z=.248+Math.sin(Math.PI*t)*.093;
    cord(k,body,'rangedTrim',[[x-.029,y-.068,z,.023],[x,y+.017,z+.014,.023],[x+.013,y+.048,z+.010,.013]],8);
    gem(k,body,'rangedShadow',[x-.020,y-.051,z+.031],[.024,.027,.020]);
  }
  const hat=k.bone(back,-.247,.342,-.359);
  const brim=[[-.361,.018,.0],[0,-.115,.113],[.371,.013,-.018],
    [.238,.277,-.067],[.041,.250,-.150],[-.284,.207,-.119]];
  shell(k,hat,'rangedShadow',brim,.060);
  cord(k,hat,'rangedTrim',[...brim,brim[0]].map(([x,y,z])=>[x,y,z+.026,.013]),16);
  hide(k,hat,'rangedCloth',[[0,-.032,.014,.188,.110],[.010,.043,-.015,.176,.131],
    [.019,.161,-.044,.141,.117],[.026,.227,-.075,.076,.081]],mobile,144);
  flaps.push({joint:hat,axis:'z',amp:.055,bias:-.40,seed:1.5});
  for(const shoulder of [left,right])for(let i=0;i<2;i++){
    const y=.134-i*.11,p=[[-.13,y+.012,.033],[.10,y+.047,.089],[.177,y-.030,.036],
      [.112,y-.093,-.088],[-.094,y-.085,-.134]];
    shell(k,shoulder,'rangedPlate',p,.038);
    cord(k,shoulder,'rangedTrim',p.slice(1,5).map(([x,y,z])=>[x,y+.019,z,.012]));
  }
}

function concealmentPlates(k,body,back,grips,flaps){
  const shoulder=grips[0].parent.parent;
  for(let row=0;row<5;row++)for(let column=0;column<2;column++){
    const x=(column-.7)*.22+(row%2)*.053,y=.544-row*.156,z=-.224-row*.024;
    const edge=[[x-.133,y+.045,z+.022],[x+.081,y+.109,z-.041],[x+.142,y+.002,z-.077],
      [x+.099,y-.086,z-.045],[x-.078,y-.101,z-.031],[x-.161,y-.036,z+.015]];
    shell(k,back,(row+column)%3?'rangedPlate':'rangedShadow',edge,.063);
    cord(k,back,'rangedTrim',edge.slice(1,5).map(([x,y,z])=>[x,y+.014,z-.034,.012]));
  }
  for(let i=0;i<3;i++){
    const y=.203-i*.105,p=[[-.177,y+.167,-.005],[.084,y+.152,-.046],[.228,y+.049,-.080],
      [.202,y-.098,-.058],[-.093,y-.144,.073],[-.234,y-.044,.101]];
    shell(k,shoulder,i%2?'rangedShadow':'rangedPlate',p,.068);
    cord(k,shoulder,'rangedTrim',p.slice(1,5).map(([x,y,z])=>[x,y+.019,z+.016,.015]));
  }
  const rack=k.bone(back,.125,.214,-.255);
  for(let i=0;i<5;i++){
    const x=(i-2)*.056,y=.322+(i%2)*.122;
    cord(k,rack,'rangedWood',[[x,-.229,-.014,.018],[x+.033,.081,.011,.016],[x+.074,y,.003,.009]],10);
    gem(k,rack,'rangedGlow',[x+.079,y+.022,.008],[.021,.040,.021]);
  }
  flaps.push({joint:rack,axis:'z',amp:.098,bias:.41,seed:3.91});
  const buckle=k.bone(body,.001,.218,.274);
  circle(k,buckle,'rangedTrim',.111,.017,Math.PI*1.56);
  gem(k,buckle,'rangedPlate',[0,0,0],[.082,.082,.031]);
}

function lionHarness(k,body,back,grips,flaps,mobile){
  const crown=k.bone(back,0,.294,-.221);
  for(const side of sides){
    const p=path=>reflect(side,path);
    const crest=p([[.031,.032,.029],[.186,.216,-.019],[.351,.113,-.173],[.435,-.065,-.289],
      [.385,-.310,-.264],[.214,-.477,-.125],[.080,-.436,.021]]);
    shell(k,crown,'rangedPlate',crest,.078);
    cord(k,crown,'rangedTrim',crest.slice(1,7).map(([x,y,z])=>[x,y+.008,z-.038,.029]),15);
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/6;
      hide(k,crown,i%2?'rangedPelt':'rangedWood',p([[.09+t*.169,.194-t*.510,-.092,.051,.043],
        [.285+t*.216,.109-t*.418,-.248,.085,.055],[.396+t*.177,-.005-t*.442,-.391,.057,.036],
        [.449+t*.134,-.172-t*.417,-.466,.006,.006]]),mobile,i+199);
    }
    const shoulder=grips[side===1?1:0].parent.parent;
    for(let i=0;i<3;i++){
      const y=.154-i*.12;
      const fang=p([[.011,y+.070,.144],[.188,y+.120,.142],[.315,y+.09,-.021],
        [.305,y-.113,-.184],[.171,y-.164,-.131],[.050,y-.067,.105]]);
      shell(k,shoulder,i%2?'rangedShadow':'rangedPlate',fang,.061);
      cord(k,shoulder,'rangedTrim',fang.slice(1,5).map(([x,y,z])=>[x,y+.023,z+.017,.022]));
      hide(k,shoulder,'rangedIvory',p([[.246,y+.091,.014,.048,.052],[.34,y+.199,-.067,.051,.040],
        [.402,y+.230,-.189,.027,.029],[.416,y+.188,-.243,.004,.004]]),mobile,162+i);
    }
    cord(k,body,'rangedTrim',p([[.010,.503,.288,.021],[.178,.445,.318,.028],
      [.293,.241,.232,.026],[.330,.080,.154,.020],[.146,-.084,.257,.010]]),16);
  }
  flaps.push({joint:crown,axis:'x',amp:.098,bias:.041,seed:4.11});
}

function scarletFlight(k,body,back,grips,flaps,mobile){
  for(const side of sides){
    const p=path=>reflect(side,path),wing=k.bone(back,side*.131,.344,-.181);
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/6,y=.309-i*.149;
      const start=p([[.029+t*.073,y,.059],[.215+t*.217,y+.054,-.111],[.370+t*.341,y-.032,-.489]]);
      k.geometry(wing,i%2?'rangedPlate':'rangedPelt',featherVane(...start,.104-t*.023,313+i,mobile?10:14));
      cord(k,wing,i%3===2?'rangedGlow':'rangedTrim',start.map(([x,y,z],i)=>[x,y+.028,z-.019,i===2?.002:.014]),11);
    }
    flaps.push({joint:wing,axis:'z',amp:.17,bias:side*.071,seed:side*1.32});
    const shoulder=grips[side===1?1:0].parent.parent;
    for(let i=0;i<4;i++){
      const y=.147-i*.075;
      const plume=p([[-.071,y,.087],[.143,y+.112,.044],[.304,y+.117,-.100],
        [.213,y-.092,-.085],[.058,y-.174,.102]]);
      shell(k,shoulder,i%2?'rangedShadow':'rangedPlate',plume,.040);
      cord(k,shoulder,'rangedTrim',plume.slice(1,5).map(([x,y,z])=>[x,y+.018,z,.014]));
    }
    cord(k,body,'rangedTrim',p([[.017,.415,.256,.011],[.110,.496,.256,.020],
      [.187,.346,.254,.026],[.171,.210,.277,.020],[.065,.089,.292,.006]]));
  }
}

const headSculpts={duster:dusterCollar,stone:stoneCowl,lion:lionFace,plume:phoenixMask};
const armors={duster:cartridgeRifleman,stone:concealmentPlates,lion:lionHarness,plume:scarletFlight};

function fitBoots(k,model,design,mobile){
  const [,rise]=design.body;
  for(const [index,hip] of model.legs.entries()){
    const p=path=>reflect(sides[index],path);
    const joint=model.campaign.flaps.find(flap=>flap.joint.parent===hip).joint;
    const broad=design.shape==='lion'?1.13:design.shape==='plume'?.92:1.01;
    hide(k,joint,'rangedShadow',p([[.022,-rise*.336,.055,.103*broad,.084],
      [.025,-rise*.431,.128,.140*broad,.084],[.021,-rise*.465,.245,.170*broad,.061],
      [.010,-rise*.493,.355,.119*broad,.043]]),mobile,510+index);
    const tip=p([[-.121*broad,-rise*.441,.212],[.016,-rise*.420,.231],[.139*broad,-rise*.436,.227],
      [.117*broad,-rise*.501,.355],[.031,-rise*.521,.393],[-.110*broad,-rise*.499,.357]]);
    shell(k,joint,design.shape==='duster'?'rangedCloth':'rangedPlate',tip,.039);
    cord(k,joint,'rangedTrim',tip.slice(1,6).map(([x,y,z])=>[x,y+.012,z,.010]));
    for(let row=0;row<3;row++){
      const y=.055-row*.108,z=.097+row*.022;
      const shape=p([[-.078,y+.022,z+.034],[.043,y+.071,z+.023],[.117*broad,y+.011,z-.018],
        [.106*broad,y-.081,z+.048],[.013,y-.108,z+.069],[-.070,y-.059,z+.056]]);
      shell(k,joint,row%2?'rangedShadow':'rangedPlate',shape,.040);
      cord(k,joint,'rangedTrim',shape.slice(1,5).map(([x,y,z])=>[x,y+.012,z+.017,.009]));
    }
  }
}

function dressMarksman(model,weapon,design,tools){
  const [,dark,cloth,trim,pelt]=design.colors;
  for(const side of sides){
    if(design.shape==='duster')for(let row=0;row<3;row++){
      const x=.052+row*.093;
      tools.silk(model.body,weapon.guardian.name+' · 皮衣後襟',reflect(side,[
        [x,.34,-.193,.085],[x+.049,.119,-.243,.126],[x+.092,-.271,-.394,.121],
        [x+.151,-.741,-.532,.103],[x+.198,-1.205,-.662,.013],
      ]),{tint:cloth,trim,lining:dark,style:'woven',phase:side*.87+row*.73,flex:1.15+row*.19});
    }else if(design.shape==='stone'){
      tools.silk(model.head,weapon.guardian.name+' · 碎牆披巾',reflect(side,[
        [.14,.071,-.133,.048],[.189,-.139,-.233,.087],[.248,-.385,-.421,.107],
        [.332,-.645,-.572,.063],[.399,-.895,-.661,.011],
      ]),{tint:cloth,trim,lining:dark,style:'woven',phase:side*.74,flex:1.17});
    }else if(design.shape==='lion')for(let row=0;row<2;row++){
      const x=.15+row*.14;
      tools.silk(model.head,weapon.guardian.name+' · 斷鬃',reflect(side,[
        [x,.048,-.073,.082],[x+.068,-.066,-.161,.115],[x+.138,-.22,-.293,.109],
        [x+.191,-.41,-.439,.061],[x+.207,-.566,-.587,.009],
      ]),{tint:pelt,trim,lining:dark,style:'mane',phase:side*.73+row*.97,flex:.95+row*.31});
    }else for(let row=0;row<2;row++){
      const x=.064+row*.128;
      tools.silk(model.back,weapon.guardian.name+' · 長焰羽',reflect(side,[
        [x,.366,-.078,.071],[x+.091,.143,-.236,.098],[x+.184,-.211,-.370,.107],
        [x+.282,-.511,-.515,.081],[x+.363,-.893,-.628,.009],
      ]),{tint:cloth,trim,lining:dark,style:'woven',phase:side*.89+row*.57,flex:1.38+row*.49});
    }
  }
  return true;
}

export function sculptRangedRelic(k,weapon,mobile,fighter){
  const design=marksmen[weapon.id];
  if(!design)return null;
  materials(k,design);
  const [broad,ground,neck,armLength]=design.body;
  let gear;
  const model=fighter(k,{broad,ground,neck,armLength,style:'ritual',finish:'rangedCloth',mobile,
    portrait(k,head){return headSculpts[design.shape](k,head,mobile);},
    weapon(k,body,back,head,grips,flaps){
      armors[design.shape](k,body,back,grips,flaps,mobile);
      gear=exactWeapon(k,weapon,grips[1],design);
    },
  });
  fitBoots(k,model,design,mobile);
  model.pattern='aim';
  model.campaign.poseDrives=(_drives,time,{wind,strike})=>{
    if(design.role==='bow')shapeBow(gear.model,Math.min(1,wind*.96),wind>.12&&strike<.42);
    const intensity=wind*.26+strike**2*.89;
    gear.flash.visible=intensity>.075;
    gear.flash.rotation.z=time*2.61;
    gear.flash.scale.set(.59+intensity*.96,.59+intensity*.96,.52+strike*1.19);
    gear.glare.opacity=intensity*.79;
  };
  if(design.shape==='stone')model.campaign.lean=.115;
  model.rangedRelic=design.shape;
  model.rangedWeapon=gear.model;
  model.polishEnergy={shape:design.energy,tint:design.element,anchor:model.body,
    offset:[0,.333,-.14],span:[broad+.45,neck*.84,.66]};
  model.relicDress=tools=>dressMarksman(model,weapon,design,tools);
  return model;
}
