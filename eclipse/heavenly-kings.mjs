import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const signs=[-1,1];
const mirror=(s,track)=>track.map(([x,...rest])=>[x*s,...rest]);
const kmesh=(k,j,m,track,mobile,seed=0,section=2.35)=>k.geometry(j,m,sculptVolume(track,{
  rings:mobile?10:17,sides:mobile?9:14,section,seed,ridge:.12,
}));
const line=(k,j,m,track,mobile)=>k.sculpt.sweep(j,m,track,{steps:mobile?9:15,sides:mobile?6:8,ridge:.13});
const dot=(k,j,m,x,y,z,r)=>k.mesh(j,'gem',m,x,y,z,r,r*.94,r*.66);

function armor(k,j,m,track,depth,mobile,{back=false,rim='kingTrim'}={}){
  k.sculpt.plate(j,m,track,depth,depth*.34);
  line(k,j,rim,track.slice(0,-1).map(([x,y,z],i)=>[x,y,z+(back?-1:1)*depth*.51,i%3?.010:.015]),mobile);
}

export const heavenlyFinishes={
  m135:{kingSkin:[0xba8f73,.032,.83,'hide'],kingSilk:[0x264f68,.081,.82,'cloth'],kingTrim:[0x8fabac,.48,.52,'iron'],
    kingMetal:[0x395263,.57,.51,'iron'],kingDark:[0x1f2d3a,.54,.55,'iron'],kingHair:[0x282129,.048,.8,'hide'],
    kingWood:[0x315268,.07,.64,'hide'],kingBone:[0xc4d2c2,.21,.62,'hide']},
  m137:{kingSkin:[0x895b44,.037,.84,'hide'],kingSilk:[0x442225,.084,.80,'cloth'],kingTrim:[0xb67a53,.68,.49,'bronze'],
    kingMetal:[0x963b2a,.56,.53,'iron'],kingDark:[0x301d20,.62,.51,'iron'],kingHair:[0x211c20,.036,.85,'hide'],
    kingWood:[0x51242a,.13,.74,'hide'],kingBone:[0xc0a27a,.18,.68,'bone']},
  m139:{kingSkin:[0x90735b,.034,.8,'hide'],kingSilk:[0x28405b,.082,.78,'cloth'],kingTrim:[0xc09c64,.70,.49,'bronze'],
    kingMetal:[0x796751,.63,.53,'iron'],kingDark:[0x202e46,.52,.54,'iron'],kingHair:[0x302a28,.044,.83,'hide'],
    kingWood:[0x493c34,.10,.67,'hide'],kingBone:[0xb6aa8e,.19,.63,'bone']},
  m141:{kingSkin:[0x794b3d,.029,.84,'hide'],kingSilk:[0x50262c,.085,.79,'cloth'],kingTrim:[0x9e8076,.62,.52,'bronze'],
    kingMetal:[0x6b3f42,.63,.51,'iron'],kingDark:[0x272931,.59,.52,'iron'],kingHair:[0x2a252b,.028,.84,'hide'],
    kingWood:[0x4e2c2d,.11,.71,'hide'],kingBone:[0xb5aa9b,.19,.67,'bone']},
};

const names={m135:'多聞',m137:'持國',m139:'增長',m141:'廣目'};
const profiles={
  m135:{waist:.185,shoulder:.25,length:.42,depth:.19,arms:.28,head:1.81,face:.138,shape:2.18},
  m137:{waist:.265,shoulder:.354,length:.49,depth:.27,arms:.33,head:1.92,face:.158,shape:2.42},
  m139:{waist:.231,shoulder:.335,length:.44,depth:.25,arms:.32,head:1.98,face:.158,shape:2.31},
  m141:{waist:.268,shoulder:.351,length:.47,depth:.28,arms:.35,head:1.90,face:.174,shape:2.60},
};

function humanSkull(k,head,w,profile,mobile,id){
  const delicate=id==='m135';
  const geo=sculptVolume(profile,{rings:mobile?24:36,sides:mobile?26:38,section:delicate?2.12:2.35,ridge:.051,seed:48});
  const g=(x,size)=>Math.exp(-((x/size)**2));
  const {position,color}=geo.attributes;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),face=Math.min(1,Math.max(0,z)*7.4);
    const nose=g(x,delicate?.016:.023)*(g(y+.028,.030)*.84+g(y-.03,.082)*.49);
    const cheek=g(Math.abs(x)-w*.68,w*.25)*g(y+.027,.045);
    const eyes=g(Math.abs(x)-w*.5,w*.25)*g(y-.055,.030);
    const brow=g(Math.abs(x)-w*.51,w*.33)*g(y-.096,.018);
    const philtrum=g(x,.013)*g(y+.102,.013);
    position.setZ(i,z+face*(nose*.058+cheek*.033+brow*.023-eyes*.024-philtrum*.007));
    const a=1+face*(cheek*.09-eyes*.16+brow*.05-philtrum*.13);
    color.setXYZ(i,color.getX(i)*a,color.getY(i)*a,color.getZ(i)*a);
  }
  geo.computeVertexNormals();
  k.geometry(head,'kingSkin',geo);
}

function face(k,head,id,w,mobile){
  const seer=id==='m135',red=id==='m137',archer=id==='m139',masked=id==='m141';
  const jaw=k.bone(head,0,-.115,.055);
  const skull=[[0,-.138,.038,w*.68,.084],[0,-.077,.015,w*.89,.127],[0,.047,-.018,w,.150],
    [0,.157,-.038,w*.96,.154],[0,.234,-.047,w*.66,.103]];
  if(masked)kmesh(k,head,'kingSkin',skull,mobile,22,2.54);
  else humanSkull(k,head,w,skull,mobile,id);
  kmesh(k,jaw,masked?'kingDark':'kingSkin',[[0,-.063,.034,w*.46,.047],[0,-.035,.059,w*.79,.068],
    [0,.025,.062,w*.87,.061],[0,.053,.032,w*.92,.061]],mobile,61,2.43);
  if(masked)kmesh(k,head,'kingDark',[[0,-.077,.125,.044,.034],[0,-.047,.178,.039,.045],
    [0,.020,.164,.026,.05],[0,.096,.114,.019,.037]],mobile,69,2.15);
  line(k,jaw,'kingHair',[[-w*.43,.013,.093,.008],[0,.007,.124,.009],[w*.44,.01,.095,.005]],mobile);
  if(!masked)line(k,jaw,'kingSkin',[[-w*.30,.004,.110,.007],[0,-.005,.130,.010],[w*.29,.003,.108,.007]],mobile);
  if(archer)kmesh(k,jaw,'kingHair',[[0,.003,.137,.083,.031],[0,-.066,.122,.078,.027],[-.012,-.133,.109,.057,.033],
    [-.016,-.194,.121,.013,.008]],mobile,33);
  if(seer)kmesh(k,head,'kingHair',[[0,.146,-.084,.106,.076],[0,.208,-.073,.116,.085],[.003,.269,-.081,.107,.09],
    [0,.340,-.101,.082,.073],[0,.373,-.123,.033,.031]],mobile,4,2.35);
  else kmesh(k,head,'kingDark',[[0,.096,-.113,w*.81,.101],[0,.188,-.123,w*.96,.119],
    [0,.270,-.117,w*.70,.098],[0,.318,-.09,w*.32,.068]],mobile,9,2.54);
  for(const s of signs){
    const orbit=mirror(s,[[w*.19,.050,.138],[w*.41,.084,.150],[w*.67,.075,.136],[w*.83,.051,.108],
      [w*.64,.032,.131],[w*.39,.031,.152]]);
    armor(k,head,masked?'kingDark':'kingHair',orbit,.015,mobile,{rim:masked?'kingTrim':'kingSkin'});
    k.mesh(head,'round',masked||red?'glow':'kingBone',s*w*.52,.057,.153,w*.142,.010,.011,0,s*.22,s*-.21);
    k.mesh(head,'gem','kingDark',s*w*.55,.058,.165,.010,.009,.006);
    if(masked)kmesh(k,head,'kingDark',mirror(s,[[w*.77,-.087,.054,.034,.045],[w*.86,-.04,.071,.052,.044],
      [w*.91,.010,.057,.047,.045],[w*.91,.055,.042,.029,.034]]),mobile,41,2.23);
    else line(k,head,'kingHair',mirror(s,[[.014,-.067,.159,.003],[.019,-.063,.168,.005],[.026,-.065,.164,.002]]),mobile);
    kmesh(k,head,'kingSkin',mirror(s,[[w*.90,-.063,-.075,.024,.026],[w*1.10,-.035,-.078,.036,.032],
      [w*1.11,.026,-.088,.041,.036],[w*.91,.056,-.106,.024,.022]]),mobile,82);
    if(seer){
      armor(k,head,'kingMetal',mirror(s,[[.018,.128,.152],[.069,.188,.153],[.105,.202,.104],
        [.151,.150,-.009],[.148,.048,-.014],[.115,.093,.081],[.072,.118,.137]]),.026,mobile);
      const plait=k.bone(head,s*.122,.025,-.073);
      for(let i=0;i<7;i++){
        const y=-i*.043,x=s*(.024+i*.006);
        kmesh(k,plait,'kingHair',[[x,y+.04,.012,.034,.035],[x+s*.012,y-.01,.026,.041,.039],
          [x+s*.018,y-.05,.008,.022,.018]],mobile,16+i);
      }
      dot(k,plait,'kingTrim',s*.071,-.282,-.002,.034);
    }else if(red){
      const mount=mirror(s,[[.037,.148,.151],[.079,.266,.105],[.131,.300,.031],[.193,.208,-.088],
        [.223,.035,-.026],[.189,-.102,.048],[.151,-.054,.106],[.129,.071,.136]]);
      armor(k,head,'kingMetal',mount,.048,mobile);
      line(k,head,'kingBone',mirror(s,[[.082,.118,.168,.011],[.133,.185,.130,.021],[.186,.232,.03,.032],
        [.233,.320,-.057,.022],[.255,.386,-.065,.004]]),mobile);
      line(k,head,'kingMetal',mirror(s,[[.086,-.031,.118,.006],[.109,-.04,.139,.012],[.139,-.084,.103,.009]]),mobile);
    }else if(archer){
      armor(k,head,'kingMetal',mirror(s,[[.017,.148,.142],[.082,.221,.141],[.139,.234,.073],[.188,.171,-.022],
        [.209,.018,-.060],[.199,-.122,.023],[.141,-.131,.090],[.136,-.031,.144],[.101,.068,.142]]),.038,mobile);
      line(k,head,'kingTrim',mirror(s,[[.113,.171,.160,.014],[.156,.206,.093,.029],[.212,.275,.026,.034],
        [.236,.373,-.013,.017],[.234,.427,-.046,.003]]),mobile);
      line(k,jaw,'kingHair',mirror(s,[[.012,.084,.142,.015],[.055,.078,.140,.025],[.096,.046,.105,.018],[.114,.018,.090,.004]]),mobile);
    }else{
      const muzzle=mirror(s,[[.016,.104,.171],[.069,.159,.165],[.137,.138,.104],[.185,.091,.055],[.211,-.049,.045],
        [.186,-.168,.093],[.134,-.191,.145],[.078,-.148,.189],[.027,-.137,.202],[.067,-.073,.204]]);
      armor(k,head,'kingDark',muzzle,.034,mobile);
      line(k,head,'kingBone',mirror(s,[[.068,.143,.127,.038],[.111,.23,.12,.051],[.156,.283,.108,.047],
        [.190,.389,.079,.027],[.196,.478,.050,.004]]),mobile);
      line(k,head,'kingMetal',mirror(s,[[.081,.123,.169,.016],[.113,.086,.170,.019],[.134,.003,.144,.022],
        [.115,-.109,.184,.011]]),mobile);
      line(k,jaw,'kingBone',mirror(s,[[.121,-.043,.124,.032],[.135,.001,.158,.028],[.144,.065,.160,.013],
        [.13,.105,.153,.003]]),mobile);
      k.mesh(head,'gem','glow',s*.077,.055,.204,.028,.013,.009);
    }
  }
  return jaw;
}

function leviathanScales(k,j,s,mobile,{high,width,material='kingMetal',rear=false}){
  for(let i=0;i<(mobile?3:5);i++){
    const y=high-i*.111,r=width*(1-i*.073),z=rear?-.13+i*.006:.127+i*.018;
    armor(k,j,i%3===1?'kingDark':material,mirror(s,[[.014,y+.091,z],[r*.61,y+.134,z-.048],
      [r,y+.059,z-.115],[r*1.04,y-.016,z-.186],[r*.74,y-.15,z-.098],[r*.35,y-.113,z+.007],[.012,y-.056,z+.037]]),
      .034-i*.002,mobile,{back:rear});
  }
}

function core(k,body,id,p,mobile){
  const [w,d]=[p.shoulder,p.depth],red=id==='m137',archer=id==='m139',masked=id==='m141',seer=id==='m135';
  kmesh(k,body,seer?'kingSilk':'kingDark',[[0,.60,-.021,p.waist*.92,d*.75],[.015,.80,-.021,p.waist*1.11,d*.82],
    [.009,1.09,.013,w*.85,d*.98],[0,1.39,.021,w,d],[0,1.57,.008,w*.81,d*.84],[0,p.head-.17,-.005,w*.37,d*.58]],mobile,94,p.shape);
  const hinges=[];
  for(const s of signs){
    if(seer){
      kmesh(k,body,'kingSkin',mirror(s,[[.046,1.214,.163,.098,.069],[.112,1.337,.154,.147,.108],
        [.187,1.436,.095,.138,.116],[.147,1.547,.037,.079,.08],[.072,1.653,.015,.051,.065]]),mobile,24);
      const cross=mirror(s,[[.026,1.23,.276],[.114,1.358,.248],[.231,1.445,.157],[.301,1.381,.066],
        [.290,1.213,.135],[.206,1.102,.202],[.079,1.057,.257],[.029,1.122,.276]]);
      armor(k,body,s===1?'kingSilk':'kingMetal',cross,.038,mobile,{rim:'kingTrim'});
      line(k,body,'kingBone',mirror(s,[[.234,1.463,.077,.015],[.201,1.428,.148,.018],
        [.132,1.344,.220,.023],[.011,1.174,.27,.014]]),mobile);
    }else{
      const front=mirror(s,[[.029,1.484,d*.91],[w*.44,1.54,d*.78],[w*.80,1.483,d*.58],
        [w*1.06,1.371,-.018],[w*.97,1.147,d*.49],[w*.63,1.088,d*.86],[.036,1.138,d*1.10]]);
      armor(k,body,archer?'kingSilk':'kingMetal',front,red?.085:.073,mobile);
      for(let i=0;i<3;i++){
        const y=1.095-i*.121,reach=w*(.89-i*.106);
        armor(k,body,i===1?'kingDark':'kingMetal',mirror(s,[[.023,y+.063,d*1.10],[reach*.61,y+.077,d*.90],
          [reach*1.08,y+.016,d*.52],[reach*.97,y-.062,d*.48],[reach*.53,y-.087,d*.94],[.028,y-.093,d*1.13]]),.041,mobile);
      }
      line(k,body,red?'ember':'kingTrim',mirror(s,[[.065,1.429,d*1.02,.014],[w*.42,1.413,d*.99,.029],
        [w*.57,1.330,d*1.12,.027],[.087,1.225,d*1.23,.013]]),mobile);
    }
    const yoke=k.bone(body,s*(w*.64),1.36,-d*.68);
    yoke.name=names[id]+' · 背甲 '+s;
    if(red)leviathanScales(k,yoke,s,mobile,{high:.13,width:.235,rear:true});
    else if(archer){
      for(let i=0;i<3;i++){
        const y=.157-i*.143;
        armor(k,yoke,'kingMetal',mirror(s,[[.010,y+.057,-.045],[.173,y+.112,-.069],[.222,y+.045,-.165],
          [.191,y-.085,-.185],[.07,y-.108,-.142],[-.053,y-.065,-.096]]),.043,mobile,{back:true});
        dot(k,yoke,'kingTrim',s*.12,y-.017,-.183,.023);
      }
    }else if(masked){
      const track=mirror(s,[[.024,.202,-.043],[.166,.238,-.101],[.296,.137,-.090],
        [.301,-.075,-.032],[.176,-.277,-.128],[.065,-.34,-.178],[-.05,-.198,-.152]]);
      armor(k,yoke,'kingDark',track,.073,mobile,{back:true});
      line(k,yoke,'kingMetal',mirror(s,[[.052,.173,-.112,.024],[.155,.090,-.185,.047],
        [.172,-.052,-.191,.042],[.102,-.195,-.186,.036],[.057,-.286,-.213,.013]]),mobile);
    }else{
      line(k,yoke,'kingTrim',mirror(s,[[.043,.148,-.031,.019],[.132,.101,-.126,.044],
        [.148,-.052,-.194,.045],[.092,-.147,-.203,.024],[.004,-.19,-.163,.008]]),mobile);
    }
    hinges.push({joint:yoke,s});
  }
  const clasp=k.bone(body,0,.833,d*.98);
  kmesh(k,clasp,'kingMetal',[[0,-.076,.015,.069,.035],[0,-.022,.051,.127,.062],
    [0,.046,.05,.109,.054],[0,.086,.017,.051,.023]],mobile,27);
  dot(k,clasp,seer?'kingTrim':red?'ember':'glow',0,.02,.107,seer?.035:.053);
  return hinges;
}

function carveArms(k,body,id,p,mobile){
  const red=id==='m137',archer=id==='m139',masked=id==='m141',seer=id==='m135';
  return signs.map(s=>{
    const upper=k.bone(body,s*p.shoulder*.95,1.45,.031),elbow=k.bone(upper,s*.072,-p.arms,.031);
    const hand=k.bone(elbow,s*.020,-.292,.071),pauldron=k.bone(upper,s*.032,.007,-.023);
    const radius=seer?.108:masked?.147:.158;
    kmesh(k,upper,seer?'kingSkin':red?'kingMetal':'kingSilk',mirror(s,[[.011,.069,-.018,radius*.76,radius*.69],
      [.056,-.081,-.013,radius*1.14,radius],[.092,-.199,.002,radius*.94,radius*.88],[.070,-p.arms,.04,radius*.68,radius*.72]]),mobile,11);
    kmesh(k,elbow,seer?'kingSkin':'kingDark',mirror(s,[[.01,.074,.023,radius*.70,radius*.65],[.021,-.082,.035,radius*.85,radius*.77],
      [.031,-.191,.068,radius*.73,radius*.72],[.011,-.286,.075,radius*.49,radius*.51]]),mobile,18);
    const cap=archer?[[.017,.102,.046],[.151,.183,.066],[.239,.145,-.026],[.379,.089,-.117],
      [.313,.005,-.183],[.174,-.119,-.154],[.034,-.112,.029]]:
      masked?[[.013,.113,.09],[.106,.195,.033],[.230,.130,-.135],[.273,.017,-.162],
        [.212,-.128,-.107],[.088,-.177,.043],[.012,-.09,.147]]:
      seer?[[.005,.065,.063],[.09,.136,.022],[.177,.054,-.068],[.189,-.043,-.096],
        [.127,-.112,-.09],[.038,-.111,.049],[-.032,-.037,.094]]:
      [[.011,.096,.09],[.106,.179,.057],[.226,.113,-.059],[.310,.024,-.108],
        [.232,-.115,-.197],[.105,-.137,-.037],[.024,-.089,.134]];
    armor(k,pauldron,archer?'kingTrim':seer?'kingMetal':'kingDark',mirror(s,cap),seer?.044:.070,mobile);
    if(red||masked)leviathanScales(k,upper,s,mobile,{high:.006,width:red?.192:.182});
    if(archer)for(let i=0;i<3;i++){
      const u=.065-i*.061;
      line(k,pauldron,'kingMetal',mirror(s,[[.03,u+.034,.078,.012],[.124,u+.058,.075,.026],
        [.224,u+.047,-.009,.022],[.304,u+.062,-.082,.009]]),mobile);
    }
    for(let i=0;i<(mobile?2:3);i++){
      const y=-.093-i*.07,z=.106+i*.016;
      armor(k,elbow,i%2?'kingDark':'kingMetal',mirror(s,[[.031,y+.052,z],[.095,y+.061,z-.048],
        [.13,y-.013,z-.139],[.09,y-.068,z-.106],[.016,y-.063,z+.025],[-.04,y-.013,z+.017]]),.026,mobile);
    }
    kmesh(k,hand,seer?'kingSkin':'kingDark',mirror(s,[[0,.08,.01,.047,.052],[.027,.032,.038,.066,.058],
      [.038,-.024,.078,.067,.051],[.026,-.077,.108,.051,.037]]),mobile,31);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.028;
      line(k,hand,seer?'kingSkin':'kingMetal',[[x,.026,.053,.014],[x+s*.012,-.032,.104,.017],
        [x+s*.025,-.068,.122,.013],[x+s*.022,-.091,.092,.005]],mobile);
    }
    return {upper,elbow,hand,pauldron,s};
  });
}

function carveLegs(k,body,id,p,mobile){
  const archer=id==='m139',seer=id==='m135';
  return signs.map(s=>{
    const hip=k.bone(body,s*(p.waist*.61),.766,-.028),knee=k.bone(hip,s*.046,-.314,.028);
    const ankle=k.bone(knee,s*.009,-.326,.021);
    kmesh(k,hip,'kingSilk',mirror(s,[[0,.062,-.028,.104,.096],[.038,-.058,-.037,.137,.117],
      [.047,-.189,-.033,.121,.109],[.043,-.326,.013,.080,.078]]),mobile,31);
    kmesh(k,knee,'kingDark',mirror(s,[[.001,.047,.01,.084,.073],[.016,-.083,-.029,.099,.09],
      [.023,-.181,-.041,.090,.089],[.014,-.33,.03,.057,.055]]),mobile,57);
    kmesh(k,ankle,'kingDark',mirror(s,[[.018,-.059,.175,.07,.055],[.022,-.028,.105,.088,.069],
      [.022,.031,.019,.076,.077],[.009,.071,-.027,.06,.064]]),mobile,24,2.67);
    if(!seer){
      armor(k,knee,archer?'kingMetal':'kingDark',mirror(s,[[.023,.052,.109],[.11,.025,.075],[.129,-.086,.043],
        [.095,-.241,.062],[.032,-.323,.099],[-.035,-.21,.111],[-.048,-.053,.110]]),.040,mobile);
      for(let i=0;i<3;i++)line(k,knee,i===1?'kingTrim':'kingMetal',mirror(s,[[.09,-.05-i*.085,.048,.011],
        [.101,-.078-i*.085,-.058,.020],[.021,-.087-i*.09,-.124,.017],[-.069,-.086-i*.081,-.068,.008]]),mobile);
    }
    return {hip,knee,ankle,s};
  });
}

function pipa(k,j,mobile){
  const bowl=[[0,-.527,.007,.063,.034],[0,-.461,.037,.181,.093],[0,-.327,.035,.215,.10],
    [0,-.169,.025,.182,.078],[0,-.030,.014,.095,.041],[0,.147,.015,.043,.037]];
  kmesh(k,j,'kingWood',bowl,mobile,36,2.44);
  kmesh(k,j,'kingMetal',bowl.map(([x,y,z,a,b])=>[x,y,z-.033,a*.94,b*.83]),mobile,20,2.2);
  line(k,j,'kingWood',[[0,-.19,.071,.051],[0,.10,.075,.043],[-.007,.41,.073,.035],
    [.008,.68,.084,.043],[.064,.80,.082,.017]],mobile);
  line(k,j,'kingTrim',[[-.088,-.430,.137,.013],[0,-.433,.144,.023],[.083,-.436,.139,.013]],mobile);
  for(const s of signs)line(k,j,'kingTrim',mirror(s,[[.021,-.505,.08,.008],[.172,-.44,.094,.013],
    [.202,-.31,.136,.013],[.164,-.150,.116,.011],[.066,.002,.081,.010]]),mobile);
  for(let i=0;i<8;i++){
    const y=-.077+i*.071,w=.039+(1-i/8)*.016;
    line(k,j,'kingDark',[[-w,y,.108,.006],[0,y,.122,.010],[w,y,.109,.006]],mobile);
  }
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.019,h=.52+i*.043;
    line(k,j,'kingBone',[[x*1.41,-.435,.15,.006],[x,-.16,.155,.004],[x*.74,.15,.118,.004],[x*.64,h,.115,.003]],mobile);
    line(k,j,'kingTrim',[[0,h,.080,.013],[(i%2?1:-1)*.075,h+.015,.085,.016]],mobile);
  }
  for(const x of [-.115,.115])dot(k,j,'kingTrim',x,-.295,.115,.028);
}

function flameBlade(k,j,mobile){
  // The mark follows the tip of the solid metal. Energy runs inside the carved channels.
  markEnemyWeapon(j,[.031,1.42,.05],{from:[0,-.13,.04],width:.20});
  line(k,j,'kingWood',[[0,-.295,.03,.041],[0,-.178,.033,.049],[0,.104,.039,.049],[0,.269,.04,.039]],mobile);
  const outline=[[-.087,.234,.04],[-.172,.406,.027],[-.148,.529,.041],[-.232,.721,.034],
    [-.192,1.043,.040],[-.097,1.270,.038],[.031,1.42,.05],[.118,1.18,.043],[.089,.929,.049],
    [.128,.714,.05],[.087,.472,.043],[.081,.264,.049]];
  k.sculpt.plate(j,'kingDark',outline,.069,.025);
  for(const s of signs){
    const z=.041+s*.045;
    k.sculpt.plate(j,'kingMetal',[[-.055,.26,z],[-.135,.455,z],[-.121,.715,z],[-.154,.984,z],
      [-.081,1.253,z],[.024,1.374,z],[.043,1.123,z],[.026,.808,z],[.037,.445,z]],.026,.009);
    line(k,j,'kingTrim',[[-.154,.43,z],[-.146,.55,z],[-.215,.721,z],[-.182,1.02,z],[-.086,1.241,z],
      [.027,1.407,z,.003]].map(([x,y,v,r=.012])=>[x,y,v,r]),mobile);
    line(k,j,'ember',[[-.014,.316,z+s*.010,.015],[-.073,.53,z+s*.014,.017],[-.056,.728,z+s*.018,.028],
      [-.081,.951,z+s*.012,.019],[.011,1.247,z+s*.006,.006]],mobile);
  }
  line(k,j,'kingTrim',[[-.248,.28,.016,.018],[-.123,.185,.039,.051],[0,.158,.059,.052],[.102,.207,.045,.052],
    [.238,.306,.015,.007]],mobile);
  dot(k,j,'ember',0,.175,.103,.042);
  dot(k,j,'kingTrim',0,-.278,.053,.045);
}

function lightningBow(k,j,mobile){
  markEnemyWeapon(j,[-.68,0,.069],{from:[.247,0,.065],width:.24,kind:'bow'});
  const grip=k.bone(j,0,0,.074);
  line(k,grip,'kingWood',[[0,-.217,0,.039],[.023,-.084,0,.067],[.024,.078,-.005,.061],[0,.237,-.005,.041]],mobile);
  for(const s of signs){
    const half=[[.012,0,.063,.049],[.057,s*.199,.077,.071],[.182,s*.385,.083,.065],[.272,s*.524,.069,.057],
      [.217,s*.701,.054,.045],[.280,s*.798,.005,.008]];
    line(k,j,'kingMetal',half,mobile);
    line(k,j,'kingTrim',half.map(([x,y,z,r])=>[x-.039,y,z+.034,r*.40]),mobile);
    const fin=[[.068,s*.227,.099],[.21,s*.336,.097],[.354,s*.479,.055],[.363,s*.631,.033],
      [.253,s*.596,.098],[.164,s*.463,.128],[.09,s*.357,.135]];
    armor(k,j,'kingDark',fin,.027,mobile);
    line(k,j,'kingTrim',[[.033,s*.219,.094,.015],[.196,s*.393,.152,.027],[.307,s*.486,.09,.011]],mobile);
    dot(k,j,'glow',.14,s*.33,.143,.029);
  }
  const string=k.bone(j,.27,0,.012);
  line(k,string,'kingTrim',[[0,-.790,.001,.005],[-.063,0,.016,.008],[0,.790,.001,.005]],mobile);
  j.userData.string=string;
  return string;
}

function trident(k,j,mobile){
  markEnemyWeapon(j,[.006,1.48,.037],{from:[0,-.04,.053],width:.23});
  line(k,j,'kingWood',[[0,-.77,.045,.027],[0,-.371,.043,.042],[0,.061,.047,.047],[0,.61,.05,.036],
    [.009,.946,.038,.036],[0,1.192,.036,.036]],mobile);
  for(const y of [-.72,-.39,-.23,.37,.785,.918]){
    line(k,j,'kingTrim',[[0,y-.027,.046,.043],[.006,y,.046,.053],[0,y+.022,.044,.042]],mobile);
  }
  armor(k,j,'kingDark',[[0,.847,.033],[-.112,1.042,.024],[-.092,1.257,.013],[0,1.467,.03],
    [.088,1.288,.036],[.112,1.035,.041],[.036,.895,.037]],.045,mobile);
  line(k,j,'kingTrim',[[0,.969,.067,.007],[.013,1.108,.074,.014],[0,1.303,.076,.022],[.004,1.451,.039,.003]],mobile);
  for(const s of signs){
    line(k,j,'kingMetal',mirror(s,[[.01,.876,.031,.051],[.138,.903,.059,.046],[.235,1.069,.052,.044],
      [.234,1.242,.025,.034],[.179,1.373,.047,.004]]),mobile);
    line(k,j,'kingTrim',mirror(s,[[.054,.885,.087,.008],[.169,.958,.101,.014],
      [.249,1.103,.097,.016],[.187,1.356,.071,.003]]),mobile);
    dot(k,j,'ember',s*.09,.932,.089,.026);
  }
}

function garments(id,body){
  const seer=id==='m135',red=id==='m137',archer=id==='m139';
  return signs.flatMap(s=>{
    const phase=s*.82,front=[1,0,s*.16],side=[.69,.07,s*-.65];
    const piece=(parent,label,track,tint,trim,lining,flex,across=front)=>({parent,name:names[id]+' · '+label+' '+s,
      path:mirror(s,track),tint,trim,lining,phase,flex,across});
    if(seer)return [
      piece(body,'水紋腰襬',[[.092,.787,.199,.085],[.147,.56,.249,.126],[.214,.22,.288,.154],[.256,-.026,.235,.074]],
        0x365e76,0xa9c2bf,0x294354,1.14),
      piece(body,'天衣長帶',[[.214,1.469,-.084,.055],[.465,1.474,-.172,.083],[.672,1.768,-.28,.105],
        [.725,2.12,-.321,.080],[.823,2.26,-.424,.045],[1.005,2.195,-.470,.007]],0x315c82,0x9bcdd0,0x395274,1.22,side),
      piece(body,'回流下帶',[[.181,1.026,-.151,.064],[.449,.95,-.283,.10],[.661,.649,-.347,.108],
        [.889,.493,-.283,.040],[1.034,.603,-.204,.009]],0x28577c,0x8abcc0,0x304b63,1.41,side),
    ];
    if(red)return [
      piece(body,'朱雀戰裙',[[.153,.822,.22,.12],[.215,.623,.292,.15],[.238,.342,.288,.11],[.297,.095,.244,.036]],
        0x582a2b,0xb66b46,0x33212a,.73),
      piece(body,'焰紋背帛',[[.300,1.439,-.22,.104],[.487,1.143,-.365,.177],[.535,.708,-.52,.174],
        [.612,.204,-.57,.065]],0x461d27,0x9b4b33,0x362329,1.04,side),
    ];
    if(archer)return [
      piece(body,'鎏金護裙',[[.123,.851,.211,.082],[.141,.623,.282,.111],[.239,.398,.28,.138],[.285,.220,.249,.054]],
        0x293f61,0xa79970,0x35445c,.75),
      piece(body,'青龍側襬',[[.251,.923,-.12,.117],[.384,.644,-.264,.169],[.435,.37,-.401,.23],
        [.528,.033,-.487,.161]],0x263c66,0x957951,0x253047,.92,side),
    ];
    return [
      piece(body,'鐵縫戰袴',[[.131,.830,.255,.110],[.213,.603,.337,.151],[.273,.346,.324,.151],
        [.293,.085,.301,.116]],0x592b33,0x8c624d,0x252731,.62),
      piece(body,'骨白披帛',[[.210,1.59,-.13,.077],[.453,1.923,-.238,.119],[.687,1.608,-.379,.162],
        [.701,1.110,-.499,.117],[.881,.514,-.584,.101],[1.045,.289,-.631,.022]],
        0xa7a49a,0xc0b4a2,0x584e56,1.22,side),
      piece(body,'背幡尾襬',[[.19,.955,-.28,.119],[.223,.645,-.39,.147],[.397,.355,-.444,.192],
        [.507,.110,-.54,.104]],0x3b2831,0x6d544b,0x2e2729,1.08,side),
    ];
  });
}

function fitPipaHands(instrument,arms){
  const target=new T.Vector3(),world=new T.Vector3(),goal=new T.Vector3(),current=new T.Vector3(),pivot=new T.Vector3();
  const correction=new T.Quaternion();
  return (time,strike)=>{
    for(const {upper,elbow,hand,s} of arms){
      if(s>0)target.set(-.018,.457,.125);
      else target.set(.056*Math.sin(time*10.3),-.189+Math.sin(time*10.3)*(.030+strike*.036),.152);
      instrument.localToWorld(target);
      for(let step=0;step<4;step++)for(const joint of [elbow,upper]){
        joint.parent.updateWorldMatrix(true,false);
        hand.getWorldPosition(world);
        pivot.copy(joint.position);
        current.copy(world);
        joint.parent.worldToLocal(current).sub(pivot).normalize();
        goal.copy(target);
        joint.parent.worldToLocal(goal).sub(pivot).normalize();
        correction.setFromUnitVectors(current,goal);
        joint.quaternion.premultiply(correction);
      }
    }
  };
}

export function sculptHeavenlyKing(k,entry,mobile){
  const {id}=entry,p=profiles[id];
  if(!p)return null;
  const seer=id==='m135',red=id==='m137',archer=id==='m139';
  const body=k.bone(k.root,0,seer?.22:-.04,0),head=k.bone(body,0,p.head,.022);
  const hinges=core(k,body,id,p,mobile),jaw=face(k,head,id,p.face,mobile);
  const arms=carveArms(k,body,id,p,mobile),legs=carveLegs(k,body,id,p,mobile);
  const tool=seer?k.bone(body,-.057,1.251,.304):k.bone(arms[archer?0:1].hand,0,-.023,.078);
  tool.name=['寒潮琵琶','朱雀鋼劍','雷擊弓','三支槍'][Object.keys(profiles).indexOf(id)];
  let string;
  if(seer)pipa(k,tool,mobile);
  else if(red)flameBlade(k,tool,mobile);
  else if(archer)string=lightningBow(k,tool,mobile);
  else trident(k,tool,mobile);
  if(archer){
    const quiver=k.bone(body,.308,1.184,-.365);
    quiver.rotation.z=-.27;
    kmesh(k,quiver,'kingWood',[[0,-.211,0,.079,.057],[0,-.1,0,.101,.072],[0,.091,0,.11,.072],
      [0,.289,0,.125,.078],[0,.321,0,.129,.084]],mobile,31,2.63);
    for(let i=0;i<6;i++){
      const x=(i%3-1)*.057,z=(Math.floor(i/3)-.4)*.057,y=.415+(i%2)*.077;
      line(k,quiver,'kingWood',[[x,.179,z,.008],[x-.021,y+.102,z,.007]],mobile);
      line(k,quiver,'kingBone',[[x,.33,z,.005],[x+.029,y+.028,z+.005,.016],
        [x+.006,y+.103,z,.004]],mobile);
    }
  }
  const clothing=garments(id,body),pipaHands=seer?fitPipaHands(tool,arms):null;
  const clothDress=tools=>{
    for(const {parent,name,path,...options} of clothing)tools.silk(parent,name,path,{...options,style:'woven'});
    return true;
  };
  const color=seer?0xa8e9e9:red?0xff8553:archer?0xe4c180:0xf19d77;
  return {body,head,arms:arms.map(a=>a.upper),legs:seer?[]:legs.map(l=>l.hip),crest:k.bone(body,0,0,0),grounded:!seer,
    heavenKing:true,heavenDress:clothDress,catalogueSculpt:id,pattern:seer?'hover':archer?'aim':'duel',
    polishEnergy:{tint:color,shape:seer?'mist':red?'embers':archer?'ribbons':'sigils',anchor:body,
      offset:[0,1.37,-.23],span:[.80,.80,.38],weaponWidth:archer?.60:.57,emissionScale:.62},
    cataloguePose({beat,headtime:t,wind,strike,travel,fall,step,attackPattern}){
      const shooting=archer&&['lance','cross','barrage','feathers','coins'].includes(attackPattern);
      const draw=shooting?wind:0;
      body.rotation.x=(red?-.18:-.11)*wind+strike*(seer?.14:.30)+fall*.27;
      head.rotation.set(-wind*.12+strike*.17,Math.sin(t*1.78)*.064+(wind-strike)*.16,0);
      jaw.rotation.x=.033+strike*(seer?.17:.29)+wind*.063;
      for(const {s,upper,elbow,hand,pauldron} of arms){
        const stride=Math.sin(step+s*Math.PI*.5)*travel;
        upper.rotation.set(stride*.315-wind*(s>0?.84:.52)+strike*(s>0?.77:.49),
          s*(wind*.30-strike*.23),s*(.19+wind*.31-strike*.123));
        elbow.rotation.set(-.24-wind*.35+strike*.36+fall*.28,s*(wind*.17-strike*.08),0);
        hand.rotation.y=s*(wind*.24-strike*.33);
        pauldron.rotation.x=stride*.12+wind*.13-strike*.19;
        pauldron.rotation.z=s*(wind*.10-strike*.14);
        if(seer){
          upper.rotation.set((s>0?-1.16:-.84)-wind*.23+strike*.08,s*(.16+wind*.18),s*(s>0?.33:.25));
          elbow.rotation.x=(s>0?-1.12:-.76)+Math.sin(t*8.3+s)*.045+strike*.57;
          hand.rotation.y=(s<0?Math.cos(t*8.3)*.13:.091)+s*.16*wind;
        }else if(archer){
          if(s<0){upper.rotation.x-=.35+draw*.61;elbow.rotation.x+=.21+draw*.63;}
          else elbow.rotation.z=draw*.53-strike*.22;
        }
      }
      for(const {s,hip,knee,ankle} of legs){
        const stride=Math.cos(step+s*Math.PI*.5)*travel;
        hip.rotation.x=seer?-.09*wind:stride*.57+wind*.15-strike*.095;
        hip.rotation.z=s*(.059+(archer?draw*.11:wind*.09));
        knee.rotation.x=-Math.max(0,stride)*.47-wind*.12+fall*.21;
        ankle.rotation.x=-Math.min(0,stride)*.27+strike*.06;
      }
      for(const {joint,s} of hinges){
        joint.rotation.y=s*(wind*.13-strike*.17);
        joint.rotation.x=Math.sin(beat*.83+s*.70)*.031+travel*.057+wind*.15-strike*.14;
      }
      tool.rotation.z=seer?-.47-strike*.071:archer?-.12+draw*.16:-.101-wind*.37+strike*.40;
      tool.rotation.x=seer?.081+Math.sin(t*2.1)*.025:wind*.16-strike*.28;
      pipaHands?.(t,strike);
      if(string)string.scale.x=1+draw*2.8;
    },
  };
}
