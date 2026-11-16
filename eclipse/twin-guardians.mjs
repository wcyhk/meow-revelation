import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);
const volume=(k,part,finish,track,mobile,section=2.38,seed=0)=>
  k.geometry(part,finish,sculptVolume(track,{rings:mobile?9:15,sides:mobile?9:12,section,seed,ridge:.15}));
const skin=(k,part,finish,shape,d=.037)=>k.sculpt.plate(part,finish,shape,d,d*.29);
const line=(k,part,finish,path,mobile)=>k.sculpt.sweep(part,finish,path,{steps:mobile?8:12,sides:mobile?5:7,ridge:.18});
function joint(k,parent,name,x,y,z){
  const hinge=k.bone(parent,x,y,z);
  hinge.name=name;
  return hinge;
}

function rootHound(k,entry,mobile){
  const body=joint(k,k.root,'Bone Emperor ossuary spine',0,.705,-.071);
  const head=joint(k,body,'Bone Emperor skull',0,.291,.64);
  const jaw=joint(k,head,'Bone Emperor jaw hinge',0,-.15,.025);
  volume(k,body,'deep',[[0,-.051,-.88,.196,.273],[0,.059,-.606,.298,.354],[0,.151,-.159,.365,.385],
    [0,.159,.295,.371,.391],[0,.177,.536,.244,.307]],mobile,2.65,6.9);
  volume(k,head,'edge',[[0,.091,-.258,.094,.149],[.042,.045,-.105,.160,.225],[.054,.027,.089,.178,.212],
    [.019,-.046,.247,.092,.146],[.011,-.055,.389,.065,.116],[0,-.072,.489,.029,.080]],mobile,2.57,1.4);
  volume(k,jaw,'edge',[[0,.019,-.13,.044,.125],[0,-.022,.023,.059,.181],[0,-.048,.157,.045,.135],
    [0,-.036,.325,.037,.102],[0,-.003,.484,.018,.082]],mobile,2.71,14.2);
  const branches=[],limbs=[];
  for(const side of sides){
    const f=path=>mirror(side,path);
    const brow=f([[.048,.197,-.129],[.162,.231,-.072],[.241,.151,-.025],[.249,.046,.141],[.151,.028,.214],[.064,.108,.209]]);
    skin(k,head,'edge',brow,.041);
    skin(k,head,'deep',f([[.087,.123,.172],[.152,.113,.186],[.165,.044,.221],[.103,.036,.221]]),.025);
    k.mesh(head,'gem','glow',side*.133,.082,.222,.019,.012,.026,0,side*.5,side*.22);
    for(let i=0;i<5;i++){
      const z=.148+i*.054,x=.128-i*.012;
      volume(k,head,'edge',f([[x,-.049,z,.031,.023],[x+.016,-.143,z+.015,.027,.018],
        [x*.87,-.198+i*.012,z+.054,.004,.004]]),true,2.59,i+.5);
    }
    const antler=joint(k,head,'Bone Emperor antler '+side,side*.176,.157,-.098);
    volume(k,antler,'body',f([[0,0,0,.060,.053],[.18,.117,-.052,.064,.057],[.35,.222,-.169,.055,.049],
      [.42,.351,-.282,.029,.031],[.382,.462,-.356,.003,.005]]),mobile,2.09,side+2.1);
    for(let q=0;q<3;q++){
      const x=.09+q*.113,y=.065+q*.096,z=-.018-q*.102;
      volume(k,antler,q%2?'trim':'edge',f([[x,y,z,.045,.043],[x+.024,y+.16,z-.069,.036,.031],
        [x-.022,y+.245+(q===1?.08:0),z-.133,.004,.005]]),true,2.45,q+.76);
    }
    for(let row=0;row<(mobile?5:7);row++){
      const t=row/(mobile?4:6),z=.479-t*1.07,h=.396-.11*t,x=.29+.083*Math.sin(t*Math.PI);
      const rib=joint(k,body,'Bone Emperor rib '+side+' '+row,0,h,z);
      const path=f([[.021,.031,-.017,.032,.027],[x*.47,.004,.009,.054,.039],[x,-.111,.016,.059,.042],
        [x*1.11,-.236,-.039,.045,.039],[x*.81,-.406,-.133,.036,.028],[x*.49,-.464,-.111,.004,.006]]);
      volume(k,rib,'edge',path,mobile,2.97,t*2.341+side);
      line(k,rib,row%2?'body':'trim',f([[.048,.042,-.001,.009],[x*.55,-.029,.045,.020],
        [x*1.02,-.154,.057,.022],[x*1.04,-.247,-.015,.006]]),mobile);
      const vine=joint(k,body,'Death-root '+side+' '+row,side*x*.68,h+.015,z-.12);
      volume(k,vine,row%3?'body':'trim',f([[0,0,0,.042,.052],[.143,.091,-.111,.056,.046],
        [.270,.146+t*.095,-.249,.040,.035],[.333,.264+t*.169,-.416,.029,.022],
        [.245,.351+t*.18,-.554,.004,.005]]),mobile,2.12,row+.82);
      line(k,vine,'glow',f([[.089,.097,-.061,.009],[.182,.153,-.173,.012],[.257,.210+t*.13,-.262,.003]]),mobile);
      branches.push({vine,side,row});
    }
    for(const front of [true,false]){
      const hip=joint(k,body,'Bone Emperor '+(front?'front':'rear')+' thigh '+side,side*.294,.039,front?.383:-.636);
      const knee=joint(k,hip,'Bone Emperor knee '+side,0,-.318,front?.06:-.102);
      const foot=joint(k,knee,'Bone Emperor claw '+side,0,-.372,.033);
      volume(k,hip,'body',f([[0,.15,-.064,.105,.143],[.045,.051,.026,.144,.154],
        [.019,-.148,.065,.102,.097],[.012,-.316,.058,.068,.07]]),mobile,2.82,side+.5);
      volume(k,knee,'edge',f([[0,.044,-.035,.069,.073],[.019,-.101,0,.107,.076],
        [.013,-.266,.036,.057,.069],[0,-.367,.044,.050,.055]]),mobile,2.52,1.61);
      volume(k,foot,'deep',[[0,.031,-.066,.072,.099],[0,.016,.03,.103,.111],
        [0,-.016,.119,.032,.102]],mobile,2.8,14);
      for(let i=0;i<3;i++){
        const x=(i-1)*.067;
        volume(k,foot,'edge',[[x,.01,.104,.027,.026],[x,-.021,.164,.026,.022],
          [x*.95,-.047,.222,.004,.003]],true,2.1,i);
      }
      limbs.push({hip,knee,foot,side,front});
    }
  }
  const tail=joint(k,body,'Upturned root tail',0,.09,-.812);
  volume(k,tail,'deep',[[0,.01,.07,.135,.118],[.032,.103,-.33,.101,.110],[.087,.237,-.629,.077,.073],
    [.079,.47,-.955,.041,.042],[.028,.542,-1.243,.004,.004]],mobile,2.81,4.37);
  for(let i=0;i<4;i++){
    const y=.085+i*.106,z=-.257-i*.188;
    volume(k,tail,'edge',[[.027,y,z,.056,.047],[.09,y+.134,z-.041,.035,.037],
      [.113,y+.269,z-.134,.003,.004]],true,2.49,i+.3);
  }
  return {
    body,head,crest:k.bone(body,0,0,0),grounded:true,pattern:'gallop',
    polishEnergy:{tint:entry.palette[3],shape:'ribbons',anchor:body,offset:[0,.32,-.42],span:[1.06,.57,1.17]},
    cataloguePose({beat,headtime,step,wind,strike,travel,stage,fall}){
      body.rotation.x=Math.sin(beat*.92)*.027+wind*.149-strike*.39+fall*.16;
      body.position.y=.705+Math.sin(step*2)*.036*travel+wind*.078-strike*.036;
      head.rotation.x=Math.sin(headtime*2.4)*.078-wind*.27+strike*.26;
      head.rotation.y=Math.sin(beat*.61)*.105;
      jaw.rotation.x=.041+wind*.34+strike*.62;
      tail.rotation.set(Math.sin(beat*.87)*.105+wind*.3-strike*.25,Math.sin(beat*.71)*.254,stage*.065);
      for(const {vine,side,row} of branches){
        vine.rotation.x=wind*.21-strike*.38+Math.sin(beat*.92+row*.59)*.12;
        vine.rotation.z=side*(stage*.14+strike*.25);
      }
      for(const {hip,knee,foot,side,front} of limbs){
        const phase=step+(side<0?Math.PI:0)+(front?0:Math.PI);
        hip.rotation.x=Math.cos(phase)*travel*.59+wind*(front?-.41:.19)+strike*(front?.52:-.31);
        knee.rotation.x=-Math.max(0,Math.sin(phase))*travel*.58-wind*.14+strike*.09;
        foot.rotation.x=-hip.rotation.x*.55-knee.rotation.x*.79;
      }
    },
  };
}

function eye(k,parent,x,y,z,w,side,mobile){
  const orbit=joint(k,parent,'Corpse sentry floating eye',x,y,z);
  orbit.rotation.y=side*.25;
  skin(k,orbit,'edge',[[-w,.012,0],[-w*.52,w*.44,.031],[w*.04,w*.52,.056],[w*.65,w*.34,.04],[w,-.009,0],
    [w*.61,-w*.32,.053],[0,-w*.49,.044],[-w*.59,-w*.30,.044]],.027);
  k.mesh(orbit,'round','deep',0,0,.077,w*1.51,w*.64,.046);
  k.mesh(orbit,'round','glow',0,.002,.102,w*.59,w*.61,.022);
  const pupil=k.bone(orbit,0,.002,.122);
  k.mesh(pupil,'gem','deep',0,0,0,w*.22,w*.36,.021);
  const lid=joint(k,orbit,'Corpse sentry eyelid',0,.015,.046);
  const top=[[-w*.93,-.003,.029],[-w*.49,w*.39,.039],[0,w*.49,.053],[w*.51,w*.36,.045],[w*.93,-.005,.031],
    [w*.56,-w*.044,.051],[0,w*.11,.073],[-w*.53,-w*.045,.052]];
  skin(k,lid,'body',top,.024);
  line(k,lid,'trim',top.slice(0,5).map(([x,y,v],i)=>[x,y+.009,v+.015,.007+Math.sin(i*.75)*.006]),mobile);
  return {orbit,pupil,lid,side};
}

function splitShade(k,entry,mobile){
  const body=joint(k,k.root,'Twin Corpse Shadow center',0,.53,0);
  const head=joint(k,body,'Twin Corpse Shadow joined masks',0,.986,.162);
  const eyes=[],sails=[],ribbons=[],masks=[];
  volume(k,body,'deep',[[0,-.388,-.072,.045,.051],[0,-.143,-.111,.152,.149],
    [0,.233,-.086,.217,.234],[0,.601,-.098,.258,.177],[0,.817,-.056,.127,.109]],mobile,2.45,3.34);
  for(const side of sides){
    const f=path=>mirror(side,path);
    const mask=joint(k,head,'Twin corpse mask '+side,side*.093,0,side*.014);
    const relief=f([[-.02,.23,.064],[.091,.234,.05],[.197,.177,-.023],[.205,.074,.019],
      [.152,-.159,.104],[.104,-.247,.108],[.021,-.267,.113],[-.03,-.099,.154]]);
    skin(k,mask,side<0?'edge':'body',relief,.082);
    skin(k,mask,'deep',f([[.027,.085,.143],[.141,.144,.122],[.165,.05,.170],[.081,-.033,.189],[.026,-.015,.183]]),.028);
    line(k,mask,'edge',f([[.029,.101,.178,.011],[.087,.123,.176,.020],[.166,.076,.173,.009]]),mobile);
    k.mesh(mask,'gem','glow',side*.091,.073,.188,.038,.016,.022,0,side*.39);
    const cheek=f([[.026,-.038,.258],[.073,-.079,.226],[.135,-.091,.174],[.139,-.225,.144],
      [.081,-.254,.163],[.029,-.197,.212]]);
    skin(k,mask,side<0?'body':'edge',cheek,.027);
    volume(k,mask,'trim',f([[.099,.166,-.041,.045,.037],[.157,.267,-.081,.055,.047],
      [.224,.355,-.145,.035,.028],[.238,.427,-.282,.004,.003]]),mobile,2.09,side+2.4);
    masks.push({mask,side});
    for(let i=0;i<3;i++){
      const y=.688-i*.178,z=-.216-i*.058;
      const fan=joint(k,body,'Corpse shadow shutter '+side+' '+i,side*.147,y,z);
      const a=.948-i*.14,b=.653-i*.15;
      const loop=f([[-.011,.066,.042],[a*.33,.24,.031],[a*.73,.31,-.016],[a,.238,-.105],
        [a*.86,-b*.34,-.119],[a*.65,-b,-.15],[a*.41,-b*.62,-.081],[.026,-.134,-.016]]);
      skin(k,fan,i%2?'deep':'body',loop,.051);
      skin(k,fan,'trim',f([[.029,.064,-.022],[a*.42,.20,-.032],[a*.84,.193,-.089],[a*.78,.076,-.119],
        [a*.45,-.125,-.14],[.034,-.034,-.097]]),.023);
      eyes.push(eye(k,fan,side*a*.63,.109-i*.024,.041,.131-i*.017,side,mobile));
      if(i<2){
        const back=eye(k,fan,side*a*.61,.08,-.118,.106-i*.019,side,mobile);
        back.orbit.rotation.y=Math.PI+side*.19;
        eyes.push(back);
      }
      const trim=f([[.019,.081,.083,.008],[a*.36,.241,.067,.027],[a*.70,.283,.018,.016],[a,.236,-.079,.004]]);
      line(k,fan,'edge',trim,mobile);
      line(k,fan,'glow',f([[a*.61,.104,-.16,.012],[a*.63,-.117,-.134,.011],[a*.54,-b*.67,-.17,.004]]),mobile);
      sails.push({fan,side,i});
    }
    for(let i=0;i<(mobile?4:6);i++){
      const h=.236-i*.094,x=.052+i*.071,z=-.154-i*.057;
      const cloth=joint(k,body,'Twin shadow pointed shroud '+side+' '+i,side*x,h,z);
      const loop=f([[.001,.051,.054],[.091,.041,-.008],[.14,-.33,-.073],
        [.37,-.737+i*.088,-.271-i*.044],[.135,-.541+i*.07,-.189],[.044,-.245,-.098]]);
      skin(k,cloth,i%2?'body':'deep',loop,.036);
      const cut=f([[.015,.054,.054],[.105,-.22,-.05],[.191,-.49+i*.051,-.185],[.343,-.714+i*.083,-.281]]);
      line(k,cloth,'edge',cut.map(([x,y,v],j)=>[x,y,v+.019,[.004,.014,.012,.002][j]]),mobile);
      ribbons.push({cloth,side,i});
    }
  }
  eyes.push(eye(k,body,0,.54,.281,.236,0,mobile));
  return {
    body,head,crest:k.bone(body,0,0,0),pattern:'hover',
    polishEnergy:{tint:entry.palette[3],shape:'sigils',anchor:body,offset:[0,.623,.096],span:[1.10,.83,.38]},
    cataloguePose({beat,headtime,wind,strike,travel,stage,fall}){
      body.rotation.x=travel*.17+wind*.11-strike*.17+fall*.45;
      for(const {fan,side,i} of sails){
        fan.rotation.set((wind*.19-strike*.29)*i,side*(.12+i*.17+wind*.35-strike*.37),
          side*(Math.sin(beat*.62+i*.81)*.133+strike*.33-stage*.18));
      }
      for(const [i,{pupil,lid,side}] of eyes.entries()){
        pupil.position.x=Math.sin(headtime*2.28+i*.72)*.031;
        pupil.scale.y=1-wind*.31+strike*.43;
        lid.scale.y=.78+.22*Math.sin(beat*.91+i*.81)+wind*.36-strike*.49;
        lid.rotation.z=side*wind*.12;
      }
      for(const {mask,side} of masks){
        mask.position.x=side*(.093+wind*.11+stage*.029);
        mask.rotation.y=side*(.042+wind*.31-strike*.38);
      }
      for(const {cloth,side,i} of ribbons){
        cloth.rotation.x=travel*.26+Math.sin(beat*.69+i*.7)*.16+strike*.47;
        cloth.rotation.z=side*(.09+wind*.22-strike*.26);
      }
    },
  };
}

function coffinKing(k,entry,mobile){
  const body=joint(k,k.root,'Severed King armored torso',0,1.16,0);
  const head=joint(k,body,'Severed King repoussé mask',0,.786,.104);
  const lids=[],arms=[],legs=[],flaps=[];
  volume(k,body,'deep',[[0,-.267,-.007,.198,.235],[0,-.084,-.014,.285,.251],[0,.232,-.037,.339,.416],
    [.01,.449,-.023,.366,.43],[0,.635,-.015,.240,.28],[0,.736,-.008,.145,.22]],mobile,2.93,7.76);
  const chamber=joint(k,body,'Severed King burning coffin chamber',0,.425,-.448);
  const structure=[[-.366,-.621,.184],[-.441,-.28,.052],[-.492,.582,.014],[-.321,.711,-.032],
    [0,.888,-.108],[.321,.711,-.032],[.492,.582,.014],[.441,-.28,.052],[.366,-.621,.184],[0,-.745,.19]];
  skin(k,chamber,'deep',structure,.175);
  const furnace=[[-.233,-.38,-.083],[-.279,.278,-.164],[-.186,.552,-.176],[0,.708,-.205],
    [.186,.552,-.176],[.279,.278,-.164],[.233,-.38,-.083],[0,-.526,-.088]];
  skin(k,chamber,'body',furnace,.052);
  const core=joint(k,chamber,'Severed King armed ember',0,.119,-.231);
  volume(k,core,'glow',[[0,-.376,.012,.023,.032],[.033,-.144,-.039,.128,.12],
    [0,.102,-.084,.123,.115],[-.041,.318,-.026,.062,.072],[.031,.433,.063,.002,.003]],mobile,1.86,19.4);
  volume(k,head,'body',[[0,-.208,-.043,.061,.088],[0,-.133,.022,.116,.167],[0,.031,-.023,.172,.178],
    [0,.191,-.085,.177,.151],[0,.318,-.098,.122,.106],[0,.404,-.117,.043,.071]],mobile,2.54,25.1);
  for(const side of sides){
    const f=path=>mirror(side,path);
    const door=joint(k,chamber,'Coffin ember door '+side,side*.391,.102,-.241);
    const pat=f([[-.355,.589,.013],[-.124,.788,.044],[.037,.523,.023],[.066,.193,-.04],
      [.049,-.431,-.088],[-.112,-.632,-.134],[-.377,-.603,-.116],[-.396,.167,-.035]]);
    skin(k,door,'body',pat,.087);
    const guard=f([[-.330,.549,-.069],[-.129,.716,-.062],[.001,.49,-.067],[.021,-.413,-.138],
      [-.129,-.57,-.178],[-.340,-.53,-.14],[-.344,.312,-.107]]);
    line(k,door,'trim',guard.map(([x,y,z],i)=>[x,y,z,.020+.004*Math.sin(i)]),mobile);
    for(let bar=0;bar<4;bar++){
      const y=.459-bar*.237;
      skin(k,door,bar%2?'trim':'deep',f([[-.329,y+.046,-.112],[-.164,y+.068,-.127],[-.004,y+.03,-.092],
        [-.014,y-.052,-.118],[-.174,y-.043,-.152],[-.318,y-.078,-.126]]),.024);
      k.mesh(door,'gem','edge',side*-.284,y-.008,-.146,.024,.024,.017);
    }
    lids.push({door,side});
    const helm=f([[.008,.217,.127],[.112,.257,.101],[.211,.259,-.003],[.224,.148,-.104],[.177,-.137,.105],
      [.123,-.158,.149],[.08,-.061,.191],[.017,.012,.203]]);
    skin(k,head,'edge',helm,.059);
    const eyeSocket=f([[.026,.136,.181],[.103,.173,.181],[.164,.105,.128],[.105,.044,.211],[.029,.044,.236]]);
    skin(k,head,'deep',eyeSocket,.024);
    k.mesh(head,'gem','glow',side*.079,.095,.237,.041,.013,.024,0,side*.35,side*.31);
    volume(k,head,'trim',f([[.111,.234,.016,.047,.033],[.168,.397,-.046,.054,.05],
      [.246,.541,-.156,.032,.031],[.171,.625,-.174,.004,.005]]),mobile,2.38,side+6.2);
    const shoulder=joint(k,body,'Severed King cast shoulder '+side,side*.356,.475,.017);
    const elbow=joint(k,shoulder,'Severed King elbow '+side,side*.128,-.341,.016);
    const hand=joint(k,elbow,'Severed King grip '+side,side*.042,-.352,.079);
    volume(k,shoulder,'deep',f([[.015,.09,-.056,.115,.124],[.069,-.012,-.019,.158,.173],
      [.139,-.164,.015,.126,.104],[.132,-.341,.032,.097,.10]]),mobile,2.76,side+2.97);
    const shield=f([[-.041,.121,.152],[.154,.276,.106],[.299,.231,-.006],[.34,.101,-.144],
      [.275,-.162,-.14],[.114,-.21,.118],[-.04,-.098,.193]]);
    skin(k,shoulder,'body',shield,.083);
    line(k,shoulder,'edge',shield.slice(1,7).map(([x,y,z],i)=>[x,y+.021,z+.028,.017+Math.sin(i*.64)*.008]),mobile);
    volume(k,elbow,'body',f([[0,.069,.008,.076,.096],[.06,-.077,.014,.127,.134],
      [.079,-.215,.045,.122,.101],[.045,-.332,.093,.061,.078]]),mobile,2.67,3);
    volume(k,hand,'edge',f([[0,.071,.009,.078,.076],[.035,-.018,.073,.09,.072],[.055,-.106,.087,.057,.052]]),mobile,2.56,8.6);
    const hip=joint(k,body,'Severed King hip '+side,side*.179,-.267,-.035);
    const knee=joint(k,hip,'Severed King knee '+side,side*.031,-.353,-.066);
    volume(k,hip,'deep',f([[0,.059,-.017,.133,.137],[.016,-.046,.011,.145,.129],
      [.037,-.269,-.052,.093,.093],[.033,-.374,-.092,.091,.078]]),mobile,2.29,7.6);
    volume(k,knee,'body',f([[.008,.057,-.013,.105,.107],[.011,-.179,-.009,.107,.104],
      [.018,-.347,.073,.146,.118],[.016,-.371,.186,.147,.062]]),mobile,2.84,1.76);
    const flap=joint(k,body,'Severed King hip iron lamella '+side,side*.214,-.181,.11);
    skin(k,flap,'body',f([[-.087,.058,.008],[.103,.027,.017],[.163,-.113,.122],[.148,-.289,.161],
      [.052,-.398,.206],[-.084,-.34,.207]]),.055);
    const rip=f([[.02,.039,.424],[.198,.134,.342],[.352,.231,.213],[.363,.511,.207],[.25,.594,.309],
      [.129,.468,.429],[.027,.412,.48]]);
    skin(k,body,'body',rip,.079);
    line(k,body,'trim',rip.slice(1,6).map(([x,y,z],i)=>[x,y+.025,z+.039,[.009,.020,.024,.017,.006][i]]),mobile);
    arms.push({shoulder,elbow,hand,side});
    legs.push({hip,knee,side});
    flaps.push({flap,side});
  }
  const hew=joint(k,arms[1].hand,'Severed King obsidian axe',.031,-.029,.127);
  volume(k,hew,'trim',[[0,-.364,0,.032,.036],[.014,-.096,.011,.045,.048],[.021,.348,.027,.035,.032],
    [.037,.889,.039,.029,.034],[.056,1.118,.035,.019,.024]],mobile,2.94,8);
  const blade=[[.012,.651,0],[.382,.603,.033],[.591,.778,.058],[.671,1.081,.054],[.603,1.312,.075],
    [.426,1.176,.098],[.306,1.001,.094],[.02,1.034,.043],[-.087,.991,.012]];
  skin(k,hew,'body',blade,.065);
  line(k,hew,'edge',blade.slice(1,7).map(([x,y,z],i)=>[x,y,z+.049,[.011,.026,.034,.022,.015,.004][i]]),mobile);
  line(k,hew,'glow',[[.382,.648,.098,.009],[.473,.818,.107,.015],[.512,.96,.131,.013],
    [.611,1.132,.109,.004]],mobile);
  markEnemyWeapon(hew,[.604,1.312,.075],{width:.29});
  const chain=joint(k,arms[0].hand,'Severed King hanging lantern',-.023,-.05,.167);
  for(let i=0;i<4;i++){
    const link=new T.TorusGeometry(.037,.009,6,10);
    link.rotateY(i%2?Math.PI*.5:0);
    link.translate(-i*.032,-i*.064,0);
    k.geometry(chain,'trim',link);
  }
  const bell=joint(k,chain,'Severed King shuttered lantern',-.101,-.289,0);
  volume(k,bell,'body',[[0,-.211,0,.092,.096],[0,-.162,0,.166,.151],[0,-.041,0,.175,.161],
    [0,.091,0,.109,.102],[0,.164,0,.046,.047]],mobile,2.8,4.55);
  k.mesh(bell,'gem','glow',0,-.075,.138,.049,.093,.029);
  for(const side of sides)line(k,bell,'edge',mirror(side,[[.089,.077,.069,.016],[.143,-.019,.113,.028],
    [.148,-.122,.091,.021],[.089,-.178,.084,.009]]),mobile);
  return {
    body,head,crest:k.bone(body,0,0,0),grounded:true,pattern:'slam',
    polishEnergy:{tint:entry.palette[3],shape:'embers',anchor:chamber,offset:[0,.246,-.277],span:[.63,1.08,.37]},
    cataloguePose({step,beat,headtime,wind,strike,stage,travel,fall}){
      body.rotation.x=Math.sin(beat*.66)*.01+wind*.115-strike*.24+fall*.29;
      body.rotation.z=travel*Math.sin(step)*.069+wind*.06-strike*.17;
      head.rotation.y=Math.sin(beat*.45)*.12-wind*.17+strike*.28;
      chamber.rotation.x=.092+wind*.08-strike*.28;
      core.scale.set(1+strike*.33,.7+stage*.19+strike*.48,1+wind*.26);
      for(const {door,side} of lids)door.rotation.y=side*(.11+stage*.21+wind*.65+strike*.8+Math.sin(beat*.37)*.018);
      for(const {shoulder,elbow,side} of arms){
        shoulder.rotation.set(-.13+Math.sin(step+side*Math.PI*.5)*travel*.25-wind*(side>0?1.14:.49)+strike*(side>0?1.51:.34),
          side*(.1+wind*.29-strike*.21),side*(.14+wind*.47-strike*.23));
        elbow.rotation.x=-.23-wind*.62+strike*.48;
      }
      for(const {hip,knee,side} of legs){
        const s=Math.sin(step+side*Math.PI*.5)*travel;
        hip.rotation.x=s*.49+wind*.06-strike*.11;
        knee.rotation.x=-Math.max(0,s)*.62;
      }
      for(const {flap,side} of flaps)flap.rotation.x=Math.sin(beat*.71+side)*.076+strike*.35;
      hew.rotation.set(-.11+wind*.58-strike*.39,.14-wind*.26,-.18+strike*.31);
      chain.rotation.set(Math.sin(beat*.74)*.150+wind*.49-strike*.83,0,Math.sin(headtime*2.26)*.168);
    },
  };
}

const guardians={
  '青喪骨皇':rootHound,
  '照屍孿影':splitShade,
  '斷燈孿王':coffinKing,
};

export function twinGuardianSculpt(k,entry,mobile){
  const build=guardians[entry.id];
  if(!build)return null;
  return {...build(k,entry,mobile),twinGuardian:true,catalogueSculpt:entry.id};
}
