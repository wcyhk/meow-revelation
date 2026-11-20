import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...rest])=>[x*s,...rest]);
const form=(k,j,m,path,mob,seed=0,section=2.48,fur=false)=>
  k.geometry(j,m,sculptVolume(path,{rings:mob?10:16,sides:mob?9:13,section,seed,fur,ridge:.16}));
const plate=(k,j,m,path,d=.039)=>k.sculpt.plate(j,m,path,d,d*.32);
const seam=(k,j,m,path,mob)=>k.sculpt.sweep(j,m,path,{steps:mob?8:13,sides:mob?5:7,ridge:.18});
function hinge(k,parent,name,x,y,z){
  const joint=k.bone(parent,x,y,z);joint.name=name;
  return joint;
}

function emberBlade(k,hand,side,small,mob){
  const blade=hinge(k,hand,small?'Raksasa curved upper blade '+side:'Raksasa lower crescent '+side,.025,-.022,.135);
  const f=p=>mirror(side,p),size=small?.76:1;
  const hilt=f([[0,-.28,.008,.024,.028],[.015,-.129,.014,.035,.039],
    [.026,.105,.023,.036,.041],[.033,.315,.023,.029,.032],[.038,.408,.031,.022,.024]]);
  form(k,blade,'bWood',hilt,mob,14.5,2.85);
  for(let i=0;i<5;i++){
    const y=-.187+i*.055;
    seam(k,blade,i%2?'bMetal':'bTrim',f([[-.027,y,.05,.006],[.019,y+.007,.063,.009],[.052,y+.018,.046,.005]]),true);
  }
  const outer=small?[[.024,.256,.016],[.173,.395,.028],[.312,.608,.047],[.405,.89,.035],[.369,.998,-.014],
    [.292,.895,.039],[.181,.713,.061],[.106,.495,.049],[.021,.462,.023]]:
    [[.026,.357,.014],[.163,.596,.022],[.379,.739,.037],[.534,.617,.044],[.574,.436,.025],
      [.518,.203,.062],[.419,.096,.091],[.337,.149,.082],[.406,.33,.076],[.354,.512,.069],[.228,.522,.056],[.079,.451,.042]];
  const edge=f(outer.map(([x,y,z])=>[x*size,y*size,z]));
  plate(k,blade,'bOxide',edge,small?.046:.055);
  const cut=edge.slice(1,small?8:10).map(([x,y,z],i)=>[x*.981,y-.017,z+.031,i%3===1?.019:.011]);
  seam(k,blade,'bTrim',cut,mob);
  seam(k,blade,'bInlay',cut.map(([x,y,z,r])=>[x*.98,y-.011,z+.026,r*.43]),mob);
  const root=small?.25:.38,tip=small?.69:.61;
  plate(k,blade,'bMetal',f([[.062,root,.061],[.233,root+.177,.087],[.302,tip,.084],
    [.272,tip-.113,.114],[.114,root+.052,.099]]),.026);
  const hot=f([[.071,root+.068,.091,.004],[.132,root+.13,.103,.012],[.208,root+.192,.106,.014],
    [.231,root+.21,.109,.003]]);
  seam(k,blade,'glow',hot,mob);
  const top=edge[small?4:5];
  markEnemyWeapon(blade,top,{from:[0,-.21,.021],aim:false,width:small?.074:.103});
  return blade;
}

export function fitEmberForge(k,body,arms,alternate,mob){
  const shoulderArmor=[];
  for(const [rank,limbs] of [[0,arms],[1,alternate]]){
    for(const {root,elbow,hand,side} of limbs){
      const f=path=>mirror(side,path),scale=rank===0?1:.79;
      root.name=(rank?'Raksasa lower':'Raksasa upper')+' shoulder '+side;
      const cap=hinge(k,root,'Raksasa articulated shoulder lame '+rank+' '+side,side*.043,.009,-.012);
      form(k,root,'bCloth',f([[0,.109,-.034,.079,.091],[.057,-.02,-.018,.112,.118],
        [.091,-.147,.025,.095,.099],[.101,-.289,.049,.068,.078]].map(([x,y,z,r,w])=>[x,y,z,r*scale,w*scale])),mob,13.4+rank);
      const rail=f([[-.044,.133,.106],[.102,.196,.101],[.202,.143,.019],[.226,.069,-.119],
        [.152,-.081,-.155],[.035,-.164,-.008],[-.052,-.084,.117]].map(([x,y,z])=>[x*scale,y*scale,z*scale]));
      plate(k,cap,rank?'bMetal':'bOxide',rail,.052*scale);
      seam(k,cap,'bTrim',rail.slice(1,6).map(([x,y,z],i)=>[x,y+.026,z-.02,[.009,.019,.025,.014,.005][i]]),mob);
      for(let l=0;l<(mob?2:3);l++){
        const y=-.028-.08*l,w=.172-l*.015;
        const band=f([[-.046,y+.05,.106],[w*.63,y+.076,.111],[w,y+.018,.043],[w*.84,y-.084,-.074],
          [w*.28,y-.114,-.090],[-.053,y-.059,.067]].map(([x,y,z])=>[x*scale,y*scale,z*scale]));
        plate(k,root,l%2?'bOxide':'bMetal',band,.031);
        seam(k,root,'bInlay',band.slice(0,4).map(([x,y,z],i)=>[x,y+.006,z+.021,[.006,.017,.009,.004][i]]),mob);
      }
      form(k,elbow,'bShadow',f([[0,.037,-.026,.065,.073],[.038,-.093,.019,.096,.089],
        [.049,-.178,.07,.085,.079],[.031,-.298,.098,.058,.061]].map(([x,y,z,r,w])=>[x,y,z,r*scale,w*scale])),mob,24.6+rank);
      const vambrace=f([[-.061,-.023,.118],[.071,.004,.128],[.126,-.091,.128],[.123,-.221,.165],
        [.043,-.273,.18],[-.054,-.182,.173]].map(([x,y,z])=>[x*scale,y*scale,z*scale]));
      plate(k,elbow,'bMetal',vambrace,.041);
      seam(k,elbow,'bTrim',vambrace.slice(1,6).map(([x,y,z],i)=>[x,y+.007,z+.024,[.007,.015,.018,.01,.004][i]]),mob);
      form(k,hand,'bFlesh',f([[0,.045,.01,.046,.049],[.024,-.022,.059,.067,.059],
        [.035,-.083,.107,.052,.047]]),mob,7.4);
      shoulderArmor.push({cap,side,rank});
    }
  }
  for(const side of sides){
    const f=p=>mirror(side,p);
    const anchor=f([[.068,.739,-.201],[.231,.76,-.224],[.395,.613,-.172],[.398,.414,-.151],
      [.27,.322,-.262],[.135,.451,-.325],[.055,.524,-.291]]);
    plate(k,body,'bOxide',anchor,.038);
    seam(k,body,'bInlay',anchor.slice(1,6).map(([x,y,z],i)=>[x,y-.007,z-.028,[.007,.018,.017,.012,.004][i]]),mob);
  }
  return {
    blades:arms.map(({hand,side})=>emberBlade(k,hand,side,false,mob)),
    extras:alternate.map(({hand,side})=>emberBlade(k,hand,side,true,mob)),
    pose({beat,wind,strike}){
      for(const {cap,rank,side} of shoulderArmor){
        cap.rotation.z=side*(.071+wind*(rank?.13:.21)-strike*.115);
        cap.rotation.x=Math.sin(beat*.51+rank)*.043+wind*.101-strike*.135;
      }
    },
  };
}

export function tigerMask(k,head,mob){
  const jaw=hinge(k,head,'Golden tiger articulated bite',0,-.111,.074),earPivots=[],maneRoots=[];
  const cranium=sculptVolume([[0,-.193,-.039,.082,.099],[0,-.11,-.009,.128,.127],[0,-.021,-.025,.176,.168],
    [0,.087,-.037,.214,.158],[0,.191,-.051,.188,.147],[0,.284,-.077,.116,.105],[0,.339,-.104,.048,.065]],
  {sides:mob?16:25,rings:mob?20:30,section:2.44,seed:9.99,ridge:.19,fur:true});
  const p=cranium.attributes.position,c=cranium.attributes.color;
  for(let i=0;i<p.count;i++){
    const x=Math.abs(p.getX(i)),y=p.getY(i),z=p.getZ(i);
    const stripe=Math.pow(Math.max(0,Math.cos(y*48+x*17+z*13)),5)*Math.min(1,Math.max(0,(x-.105)*13));
    const r=c.getX(i)*(1-stripe*.68);
    c.setXYZ(i,r*(1+stripe*.065),r*(1-stripe*.20),r*(1-stripe*.19));
  }
  k.geometry(head,'tigerFur',cranium);
  form(k,jaw,'tigerPale',[[0,-.078,-.017,.039,.067],[0,-.065,.048,.057,.098],
    [0,-.057,.123,.048,.087],[0,-.047,.173,.026,.057],[0,-.032,.194,.014,.043]],mob,8.85,2.5,true);
  form(k,jaw,'tigerEar',[[0,-.025,.032,.017,.094],[0,-.014,.097,.020,.10],[0,-.018,.153,.014,.072],[0,-.024,.183,.008,.049]],
    mob,8.72);
  form(k,head,'tigerFur',[[0,.114,.12,.055,.053],[0,.035,.174,.068,.053],[0,-.021,.22,.071,.055],
    [0,-.061,.247,.081,.041],[0,-.095,.251,.064,.026]],mob,16.2,2.85);
  const nose=[[-.081,-.056,.254],[-.057,-.045,.28],[.054,-.046,.277],[.083,-.057,.251],
    [.067,-.077,.283],[.026,-.094,.305],[0,-.109,.313],[-.029,-.095,.304],[-.067,-.08,.281]];
  plate(k,head,'tigerStripe',nose,.033);
  seam(k,head,'tigerEar',[[-.068,-.067,.280,.003],[-.04,-.063,.302,.009],
    [0,-.073,.313,.007],[.046,-.061,.298,.008],[.069,-.067,.276,.003]],mob);
  seam(k,head,'tigerStripe',[[0,-.095,.294,.01],[0,-.118,.305,.009],[.007,-.128,.304,.005]],mob);
  const blaze=[[0,.266,.062],[.061,.235,.09],[.049,.182,.145],[.032,.131,.178],
    [.014,.084,.195],[-.019,.12,.179],[-.035,.161,.151],[-.063,.223,.104]];
  plate(k,head,'tigerPale',blaze,.021);
  seam(k,head,'tigerEar',[[0,.252,.09,.003],[.016,.219,.131,.008],[.008,.179,.162,.006],[.006,.135,.184,.002]],
    mob);
  const crest=hinge(k,head,'Tiger red mane supporting crest',0,.048,-.084);
  form(k,crest,'tigerCrest',[[0,-.294,-.203,.079,.046],[0,-.172,-.178,.159,.071],[0,-.021,-.122,.181,.104],
    [0,.123,-.074,.156,.118],[0,.242,-.062,.121,.132],[0,.338,-.141,.083,.118],[0,.408,-.233,.054,.068],
    [0,.423,-.329,.019,.038]],mob,31.04,2.48,true);
  for(let i=0;i<(mob?7:11);i++){
    const center=(mob?3:5),x=(i-center)*.033,lift=1-Math.abs(i-center)/center;
    k.geometry(crest,i%4?'tigerCrest':'tigerEar',featherVane([x,.166+lift*.048,-.006-lift*.013],
      [x*1.12,.334+lift*.053,-.081-lift*.031],[x*1.32,.437+lift*.047,-.23-Math.abs(x)*.8],.04+lift*.017,22.9+i,mob?8:13));
  }
  for(let i=0;i<(mob?8:12);i++){
    const u=i/(mob?7:11)-.5,a=Math.abs(u),x=u*.25;
    const root=[x*.36,.373-a*.12,-.268+a*.10];
    const bend=[x*.93+.019,.112-a*.04,-.218+a*a*.20];
    const lower=[x*1.14,-.113-a*.091,-.265+a*a*.19];
    const tip=[x*.86-.022,-.295+a*.109,-.305+a*a*.30];
    k.geometry(crest,i%3?'tigerCrest':'tigerEar',featherVane(root,lower,tip,.039,41.02+i,mob?8:13));
    seam(k,crest,i%3?'tigerEar':'tigerCrest',[[...root,.004],[...bend,.011],[...lower,.018],[...tip,.002]],mob);
  }
  for(const s of sides){
    const f=p=>mirror(s,p);
    const ear=hinge(k,head,'Golden tiger rounded ear helix '+s,s*.143,.136,-.104);
    const outline=f([[.004,.033,.054],[.017,.099,.052],[.051,.141,.017],[.093,.14,-.012],
      [.123,.103,-.039],[.126,.053,-.043],[.095,.015,-.015],[.061,-.028,.019],[.02,-.024,.039]]);
    plate(k,ear,'tigerFur',outline,.043);
    plate(k,ear,'tigerEar',outline.map(([x,y,z])=>[x*.77+s*.019,y*.75+.013,z+.028]),.028);
    seam(k,ear,'tigerPale',f([[.013,.043,.073,.005],[.037,.107,.054,.015],[.073,.127,.025,.014],
      [.107,.084,.007,.010],[.099,.038,.001,.004]]),mob);
    for(let tuft=0;tuft<3;tuft++){
      const u=tuft*.024;
      seam(k,ear,'tigerPale',f([[.036+u,.022,.058,.006],[.049+u,.073,.056,.008],[.051+u,.092,.047,.002]]),true);
    }
    earPivots.push({ear,s});

    const brow=f([[.031,.063,.162,.021],[.076,.113,.151,.043],[.114,.118,.13,.044],
      [.159,.098,.09,.043],[.185,.081,.046,.026],[.204,.065,.013,.009]]);
    form(k,head,'tigerStripe',brow.map(([x,y,z,r])=>[x,y,z,r,r*.52]),mob,19.33);
    seam(k,head,'tigerPale',brow.map(([x,y,z,r])=>[x,y+.021,z+.015,r*.40]),mob);
    const eye=f([[.037,.058,.181],[.073,.077,.168],[.107,.089,.146],[.154,.088,.117],
      [.162,.072,.107],[.118,.050,.144],[.07,.035,.179],[.048,.04,.183]]);
    plate(k,head,'tigerEar',eye,.018);
    k.mesh(head,'round','tigerIris',s*.096,.063,.171,.024,.012,.012,0,s*.33,s*.29);
    k.mesh(head,'round','tigerStripe',s*.097,.063,.183,.005,.011,.008,0,s*.21,s*.19);
    seam(k,head,'tigerPale',f([[.045,.032,.184,.004],[.103,.035,.164,.011],
      [.151,.063,.122,.019],[.169,.076,.087,.002]]),mob);
    form(k,head,'tigerFur',f([[.087,-.067,.189,.036,.037],[.123,-.046,.169,.066,.054],
      [.170,-.018,.097,.067,.045],[.192,-.031,.007,.035,.037]]),mob,37.44,2.42,true);
    form(k,head,'tigerPale',f([[.036,-.063,.233,.019,.023],[.071,-.085,.237,.041,.026],
      [.102,-.104,.23,.054,.033],[.126,-.11,.208,.042,.028],[.141,-.097,.161,.014,.019]]),mob,20.6,2.52,true);
    seam(k,head,'tigerFur',f([[.047,-.056,.243,.004],[.082,-.067,.251,.011],
      [.11,-.084,.246,.012],[.138,-.102,.22,.005]]),mob);
    seam(k,head,'tigerEar',f([[.016,-.115,.292,.004],[.055,-.128,.279,.008],[.102,-.147,.254,.01],
      [.125,-.131,.218,.006],[.134,-.11,.197,.002]]),mob);
    form(k,head,'bBone',f([[.083,-.124,.231,.017,.014],[.092,-.152,.245,.015,.015],
      [.086,-.186,.256,.011,.010],[.077,-.192,.249,.002,.003]]),true,11.2);
    form(k,jaw,'bBone',f([[.106,-.026,.115,.014,.015],[.109,-.001,.143,.012,.012],[.1,.029,.15,.002,.004]]),true,11.74);
    for(let i=0;i<5;i++){
      const x=.054+i*.018,y=-.092-(i%2)*.02,z=.294-i*.011;
      k.mesh(head,'round','tigerStripe',x*s,y,z,.0045,.0045,.0041);
    }
    for(let i=0;i<(mob?4:6);i++){
      const tuple=[[.092+i*.008,-.086-i*.01,.279-i*.004,.0025],[.142+i*.013,-.091-i*.011,.264+i*.003,.0021],
        [.199+i*.013,-.084-i*.018,.24+i*.004,.0018],[.242+i*.007,-.097-i*.024,.183+i*.012,.0008]];
      seam(k,head,'tigerPale',f(tuple),true);
    }
    const sideMane=hinge(k,crest,'Tiger swept mane neck root '+s,s*.084,-.046,-.071);
    for(let i=0;i<(mob?7:11);i++){
      const u=i/(mob?6:10),start=f([[.032,-.006-u*.15,.084],[.129+.09*u,-.092-u*.115,-.031],
        [.16+.14*u,-.215-u*.13,-.132-u*.08]]);
      k.geometry(sideMane,i%3?'tigerCrest':'tigerEar',featherVane(...start,.057+i*.002,35.2+i,mob?8:13));
    }
    for(let i=0;i<4;i++){
      const u=i*.032;
      seam(k,head,'tigerStripe',f([[.136,.142-u,.108,.004],[.173,.151-u,.061,.012],
        [.192,.126-u,.011,.015],[.177,.084-u,-.045,.004]]),mob);
    }
    maneRoots.push({sideMane,s});
  }
  head.userData.tigerPortrait=({beat,wind,strike,travel})=>{
    crest.rotation.x=(Math.sin(beat*.61)*.023+wind*.112-strike*.153)+travel*.077;
    for(const {ear,s} of earPivots)ear.rotation.set(-wind*.137+strike*.16,Math.sin(beat*.59+s)*.07,
      s*(.013+wind*.119-strike*.09));
    for(const {sideMane,s} of maneRoots)sideMane.rotation.z=s*(Math.sin(beat*.72+s)*.042+wind*.072-strike*.192);
  };
  return jaw;
}

function tigerOffering(k,hand,s,mob){
  const token=hinge(k,hand,s<0?'Tiger cut bronze disc':'Tiger palm-held spirit stone',s*.018,-.029,.136);
  const d=s<0?.273:.153;
  for(let i=0;i<(s<0?12:8);i++){
    const a=i*2*Math.PI/(s<0?12:8),t=Math.sin(a),l=Math.cos(a);
    const rotate=(r,z)=>[t*r,l*r,z];
    const outline=[rotate(d*.55,.035),rotate(d*.92,.019),[t*d*.96+l*.054,l*d*.96-t*.054,.038],
      [t*d*.87+l*.061,l*d*.87-t*.061,.091],rotate(d*.64,.11)];
    plate(k,token,i%3?'bMetal':'bInlay',outline,.038);
    seam(k,token,'bTrim',outline.slice(1,4).map(([x,y,z],j)=>[x,y,z+.022,[.006,.017,.003][j]]),mob);
  }
  k.mesh(token,'gem','bOxide',0,0,.103,d*.63,d*.60,d*.211);
  k.mesh(token,'gem','glow',s*.004,.011,.146,d*.21,d*.19,.031);
  if(s>0){
    for(const side of sides)seam(k,token,'bBone',mirror(side,[[.041,-.097,.083,.014],
      [.13,-.014,.095,.026],[.145,.105,.045,.021],[.106,.164,.028,.003]]),mob);
  }
  markEnemyWeapon(token,[0,d*.98,.092],{from:[0,-d,.069],width:d*.56,aim:false,kind:'ring'});
  return token;
}

export function tigerForge(k,body,mob){
  const silks=[],fans=[];
  form(k,body,'tigerFur',[[0,-.19,-.044,.224,.19],[.017,-.012,-.054,.28,.232],
    [.008,.282,-.05,.389,.247],[.008,.535,-.039,.457,.259],[0,.729,-.032,.364,.226],[0,.85,-.011,.186,.151]],mob,18.3,2.57,true);
  form(k,body,'tigerFur',[[0,.604,.011,.199,.141],[0,.732,.004,.202,.155],
    [0,.881,.026,.152,.113],[0,1.014,.044,.122,.087]],mob,24.1,2.43,true);
  for(let i=0;i<(mob?5:7);i++){
    const s=i%2===0?1:-1,u=Math.floor(i/2)*.081;
    k.geometry(body,i%3?'tigerPale':'tigerFur',featherVane([s*u,.65+u*.17,.191],
      [s*(u+.04),.474+u*.17,.244],[s*(u+.07),.294+u*.48,.265],.048,13.12+i,mob?7:12));
    k.geometry(body,i%3?'tigerFur':'tigerStripe',featherVane([s*u,.69+u*.21,-.158],
      [s*(u+.043),.489+u*.15,-.253],[s*(u+.049),.281+u*.41,-.31],.051,18.47+i,mob?7:12));
  }
  for(const s of sides){
    const f=p=>mirror(s,p);
    const pec=hinge(k,body,'Tiger spirit fitted chest tendon '+s,s*.079,.499,.191);
    form(k,pec,'tigerPale',f([[-.051,-.07,.009,.055,.042],[.065,-.039,.045,.088,.048],
      [.205,.019,.034,.093,.058],[.301,.067,-.019,.073,.041],[.38,.137,-.096,.041,.035]]),mob,18.4+s,2.52,true);
    const back=hinge(k,body,'Tiger embossed scapular shell '+s,s*.172,.522,-.306);
    plate(k,back,'bMetal',f([[.022,.184,.039],[.156,.189,-.008],[.293,.096,-.072],[.31,-.081,-.142],
      [.178,-.236,-.138],[.043,-.143,-.114]]),.066);
    for(let row=0;row<4;row++){
      const y=.154-row*.096,w=.215-row*.024,z=-.101-row*.023;
      const chip=f([[.015,y+.03,z-.012],[w*.52,y+.067,z-.019],[w*.99,y+.034,z+.012],[w*1.18,y-.073,z-.022],
        [w*.49,y-.119,z-.046],[.009,y-.081,z-.055]]);
      plate(k,back,row%2?'bOxide':'tigerFur',chip,.035);
      seam(k,back,'bTrim',chip.slice(1,5).map(([x,h,v],i)=>[x,h-.014,v-.027,[.007,.016,.014,.004][i]]),mob);
    }
    for(let i=0;i<(mob?4:6);i++){
      const x=.07+i*.039,y=.164-i*.082;
      k.geometry(back,i%2?'tigerFur':'tigerStripe',featherVane([s*x,y,-.062],[s*(x+.147),y-.041,-.139],
        [s*(x+.211),y-.142,-.21],.061,i+8.72,mob?7:12));
    }
    for(let row=0;row<4;row++){
      const y=.366-row*.092,w=.275-row*.043;
      form(k,body,'tigerFur',f([[.026,y,.205,.032,.029],[w*.47,y+.027,.229,.056,.049],
        [w*.92,y+.062,.217,.047,.046],[w*1.41,y+.111,.12,.021,.024]]),mob,row+.75+s,2.52,true);
      seam(k,body,'tigerStripe',f([[w*.67,y+.071,.222,.003],[w*.96,y+.071,.251,.014],
        [w*1.19,y+.097,.222,.021],[w*1.36,y+.126,.145,.016],[w*1.41,y+.142,.078,.003]]),mob);
      seam(k,body,'tigerStripe',f([[.075,y+.092,-.302+row*.021,.004],[.216,y+.082,-.313+row*.026,.019],
        [.333,y+.031,-.277+row*.026,.024],[.377,y-.026,-.229+row*.021,.014],[.396,y-.068,-.158+row*.021,.003]]),mob);
    }
    fans.push({pec,back,s});
    silks.push({parent:body,name:'織風亭・雙面封印 · 烈紋側裾 '+s,path:f([[.226,.122,.183,.072],[.307,-.082,.239,.117],
      [.365,-.303,.306,.139],[.434,-.667,.312,.063]]),tint:0x747774,trim:0xad9673,lining:0x3b3537,phase:s*.81,flex:.85,
      across:[.98,0,s*.14]});
    silks.push({parent:body,name:'織風亭・雙面封印 · 灰鐵圍布 '+s,path:f([[.067,.104,.155,.078],[.093,-.108,.233,.123],
      [.154,-.376,.304,.126],[.205,-.742,.358,.085]]),tint:0x5e6c69,trim:0x917a58,lining:0x3b3537,phase:s*.65,flex:.75,
      across:[.97,0,s*.19]});
  }
  const fitArms=limbs=>{
    for(const {root,elbow,hand,side:s} of limbs){
      const f=p=>mirror(s,p);
      form(k,root,'tigerFur',f([[0,.113,-.048,.103,.103],[.053,.025,-.023,.171,.134],
        [.095,-.13,.018,.141,.128],[.113,-.342,.061,.081,.085]]),mob,3.3+s,2.49,true);
      form(k,elbow,'tigerPale',f([[0,.045,.027,.083,.074],[.049,-.068,.058,.137,.118],
        [.066,-.192,.116,.125,.108],[.041,-.302,.151,.072,.072]]),mob,5.17+s,2.68,true);
      for(let row=0;row<3;row++){
        const y=-.025-row*.084;
        plate(k,root,'tigerStripe',f([[.066,y+.034,-.142],[.168,y+.017,-.127],[.205,y-.015,-.048],
          [.193,y-.064,-.026],[.154,y-.04,-.116],[.078,y-.019,-.15]]),.020);
      }
      const guard=f([[-.081,-.028,.095],[.064,.031,.145],[.148,-.011,.107],[.16,-.154,.156],
        [.086,-.244,.218],[-.064,-.202,.168]]);
      plate(k,elbow,'bMetal',guard,.051);
      seam(k,elbow,'bTrim',guard.slice(1,5).map(([x,y,z],i)=>[x,y+.016,z+.041,[.007,.017,.024,.005][i]]),mob);
      form(k,hand,'tigerFur',f([[0,.061,.005,.058,.063],[.025,-.007,.069,.083,.073],
        [.038,-.098,.117,.066,.057]]),mob,17.6+s,2.38,true);
      for(let i=0;i<4;i++){
        const x=(i-1.5)*.035;
        form(k,hand,'bBone',[[x,-.048,.14,.022,.02],[x+.011,-.101,.176,.022,.018],
          [x+.02,-.143,.203,.005,.005]],true,i+.7);
      }
    }
  };
  const fitLegs=limbs=>{
    for(const {hip,knee,boot,side:s} of limbs){
      const f=p=>mirror(s,p);
      form(k,hip,'tigerFur',f([[0,.061,-.021,.126,.14],[.037,-.096,-.029,.156,.146],
        [.043,-.25,.028,.129,.108],[.007,-.502,.09,.086,.084]]),mob,11.12+s,2.5,true);
      form(k,knee,'tigerFur',f([[0,.054,.007,.084,.089],[.044,-.136,-.062,.105,.099],
        [.018,-.263,-.099,.087,.071],[.008,-.438,.01,.058,.064]]),mob,11.8+s,2.52,true);
      const cuff=f([[-.062,-.054,.054],[.039,-.004,.111],[.117,-.036,.087],[.125,-.168,.06],
        [.079,-.246,.033],[-.033,-.204,.061]]);
      plate(k,knee,'bMetal',cuff,.043);
      seam(k,knee,'bTrim',cuff.slice(1,5).map(([x,y,z],i)=>[x,y-.014,z+.027,[.005,.011,.012,.004][i]]),mob);
      form(k,boot,'tigerStripe',f([[0,.085,-.027,.059,.053],[.011,-.014,.004,.075,.069],
        [.028,-.049,.145,.046,.085],[.033,-.054,.207,.031,.052]]),mob,16.8+s,2.83,true);
      for(let i=0;i<3;i++){
        const x=(i-1)*.047;
        form(k,boot,'bBone',[[x,-.066,.145,.025,.024],[x+.005,-.059,.196,.023,.022],[x+.007,-.078,.237,.006,.006]],true,i+3.3);
      }
    }
  };
  return {silks,fitArms,fitLegs,weapons:limbs=>limbs.map(({hand,side})=>tigerOffering(k,hand,side,mob)),
    pose({beat,wind,strike,travel}){
      for(const {pec,back,s} of fans){
        pec.rotation.y=s*(Math.sin(beat*.64)*.049+wind*.13-strike*.109);
        back.rotation.x=travel*.04+wind*.123-strike*.156;
        back.rotation.z=s*(wind*.071-strike*.112);
      }
    }};
}
