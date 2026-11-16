import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const signs=[-1,1],tau=Math.PI*2;
const mirror=(s,track)=>track.map(([x,...tail])=>[x*s,...tail]);
const carve=(k,j,m,p,mobile,seed=0,section=2.43)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?11:18,sides:mobile?9:14,section,ridge:.127,seed,
}));
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:14,sides:mobile?6:8,ridge:.14});
const jewel=(k,j,m,x,y,z,r)=>k.mesh(j,'gem',m,x,y,z,r,r*.91,r*.66);
function armor(k,j,m,path,mobile,depth=.043,back=false,rim='dynastyGold'){
  k.sculpt.plate(j,m,path,depth,depth*.34);
  sweep(k,j,rim,path.slice(0,-1).map(([x,y,z],i)=>[x,y,z+(back?-1:1)*depth*.47,i%3?.008:.014]),mobile);
}

export const dynastyFinishes={
  m031:{dynastySkin:[0x867060,.033,.83,'hide'],dynastyDark:[0x25242e,.24,.73,'hide'],dynastyHair:[0x221e25,.052,.83,'hide'],
    dynastyGold:[0xb28a55,.62,.50,'bronze'],dynastyCloth:[0x262535,.078,.81,'cloth'],dynastyBright:[0x473771,.20,.61,'iron'],
    dynastyMetal:[0x5e3d3d,.55,.53,'iron'],dynastyLining:[0x5e3d58,.10,.82,'cloth'],dynastyPale:[0xb2a89b,.29,.59,'bone'],
    dynastyBlade:[0x939095,.76,.42,'iron'],dynastyWood:[0x502c29,.16,.75,'hide']},
  m032:{dynastySkin:[0xc0a593,.032,.80,'hide'],dynastyDark:[0x243a55,.24,.66,'iron'],dynastyHair:[0x253a66,.047,.85,'hide'],
    dynastyGold:[0xc5a360,.62,.49,'bronze'],dynastyCloth:[0x263b71,.085,.80,'cloth'],dynastyBright:[0x4e82a7,.25,.57,'iron'],
    dynastyMetal:[0x3b7185,.50,.55,'iron'],dynastyLining:[0x6c4771,.11,.82,'cloth'],dynastyPale:[0xa0c6ce,.15,.65,'hide'],
    dynastyBlade:[0xd58b9b,.11,.67,'hide'],dynastyWood:[0x9b6b49,.19,.75,'hide']},
  m033:{dynastySkin:[0xb7a193,.026,.84,'hide'],dynastyDark:[0x282432,.36,.61,'iron'],dynastyHair:[0xa7a8ad,.085,.80,'hide'],
    dynastyGold:[0xb59051,.61,.50,'bronze'],dynastyCloth:[0x9b322c,.084,.78,'cloth'],dynastyBright:[0x2b6485,.20,.57,'iron'],
    dynastyMetal:[0x4e545e,.61,.47,'iron'],dynastyLining:[0x3d353e,.11,.81,'cloth'],dynastyPale:[0xc1bcb5,.18,.65,'bone'],
    dynastyBlade:[0x67666c,.76,.38,'iron'],dynastyWood:[0x542c31,.19,.74,'hide'],dynastyMask:[0x848892,.54,.50,'iron']},
};

function maskSurface(k,head,id,mobile){
  const court=id==='m031',flower=id==='m032', w=court?.173:flower?.132:.150;
  const data=[[0,-.152,.021,w*.58,.081],[0,-.078,.013,w*.91,.118],[0,.048,-.015,w,.151],
    [0,.143,-.042,w*.93,.153],[0,.223,-.055,w*.67,.108]];
  const mesh=sculptVolume(data,{rings:mobile?24:35,sides:mobile?23:34,section:court?2.33:2.10,ridge:.046,seed:court?28:11});
  const {position,color}=mesh.attributes,g=(v,r)=>Math.exp(-((v/r)**2));
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),a=Math.abs(x),front=Math.min(1,Math.max(0,z)*8);
    const nose=g(x,court?.033:.023)*(g(y+.028,.033)*.89+g(y-.032,.082)*.47);
    const cheeks=g(a-w*.65,w*.30)*g(y+.021,.048),orb=g(a-w*.54,w*.26)*g(y-.060,.028);
    const brow=g(a-w*.58,w*.41)*g(y-.104,.024);
    const mouth=g(x,.027)*g(y+.102,.019);
    position.setZ(i,z+front*(nose*(court?.067:.053)+cheeks*.025-orb*.025+brow*(court?.031:.020)-mouth*.009));
    const shade=1+front*(cheeks*.08-orb*.16+mouth*.045);
    color.setXYZ(i,color.getX(i)*shade,color.getY(i)*shade,color.getZ(i)*shade);
  }
  mesh.computeVertexNormals();
  k.geometry(head,'dynastySkin',mesh);
  const jaw=k.bone(head,0,-.124,.044);
  carve(k,jaw,'dynastySkin',[[0,-.081,.027,w*.34,.033],[0,-.054,.048,w*.58,.045],
    [0,.003,.055,w*.65,.048],[0,.044,.041,w*.73,.057]],mobile,84,2.24);
  const lip=id==='m033'?.012:.022;
  sweep(k,jaw,court?'dynastyHair':'dynastyWood',[[-w*.36,lip,.105,.004],[0,id==='m033'?.024:.014,.134,.007],
    [w*.35,lip,.107,.004]],mobile);
  for(const s of signs){
    const lid=mirror(s,[[w*.24,.054,.155],[w*.42,.080,.159],[w*.64,.083,.142],[w*.82,.070,.117],
      [w*.62,.042,.140],[w*.41,.034,.158]]);
    armor(k,head,'dynastyDark',lid,mobile,.012,false,'dynastySkin');
    k.mesh(head,'round','dynastyPale',s*w*.51,.058,.165,w*.177,.012,.011,0,s*.26,-s*.11);
    k.mesh(head,'gem',court?'dynastyDark':'glow',s*w*.53,.058,.177,.011,.010,.006);
    sweep(k,head,'dynastyHair',mirror(s,[[w*.23,.095,.150,.007],[w*.48,.119,.151,.013],
      [w*.76,.114,.123,.013],[w*.90,.08,.093,.004]]),mobile);
    carve(k,head,'dynastySkin',mirror(s,[[w*.89,-.072,-.070,.027,.024],[w*1.075,-.025,-.076,.032,.037],
      [w*1.08,.046,-.088,.033,.039],[w*.93,.078,-.098,.018,.023]]),mobile,57);
    if(court){
      sweep(k,head,'dynastyHair',mirror(s,[[.016,-.086,.207,.005],[.059,-.097,.181,.018],
        [.107,-.131,.155,.025],[.131,-.176,.103,.004]]),mobile);
      for(let i=0;i<2;i++)sweep(k,head,'dynastyWood',mirror(s,[[.088,.023-i*.054,.153,.003],
        [.124,.010-i*.057,.136,.004],[.143,-.016-i*.059,.105,.002]]),mobile);
    }else jewel(k,head,flower?'dynastyGold':'dynastyPale',s*w*1.02,-.059,-.049,.026);
  }
  if(court)carve(k,jaw,'dynastyHair',[[0,-.18,.054,.017,.018],[.007,-.119,.094,.043,.028],
    [.005,-.059,.103,.064,.035],[0,.009,.082,.082,.034]],mobile,6,2.1);
  return jaw;
}

function headgear(k,head,id,mobile){
  const court=id==='m031',flower=id==='m032',locks=[];
  const hood=[[0,.024,-.126,.132,.099],[0,.118,-.102,.158,.15],[0,.207,-.075,.146,.153],
    [0,.275,-.044,.103,.103],[0,.331,-.058,.058,.068]];
  if(!court&&!flower){hood[3][1]=.243;hood[4][1]=.282;}
  carve(k,head,court?'dynastyDark':'dynastyHair',hood,mobile,37);
  for(const s of signs){
    if(court){
      const sides=mirror(s,[[.034,.155,.123],[.081,.26,.096],[.134,.315,.048],[.195,.249,-.094],
        [.211,.124,-.148],[.172,.042,-.143],[.129,.10,-.044],[.084,.17,.052]]);
      armor(k,head,'dynastyMetal',sides,mobile,.046);
      sweep(k,head,'dynastyGold',mirror(s,[[.077,.179,.140,.014],[.121,.218,.096,.035],
        [.193,.252,.015,.028],[.229,.331,-.091,.018],[.226,.395,-.196,.003]]),mobile);
      for(let i=0;i<4;i++){
        const x=.089+i*.024;
        sweep(k,head,i%2?'dynastyMetal':'dynastyGold',mirror(s,[[x,.235+i*.027,.024,.012],
          [x+.025,.301+i*.016,-.043,.019],[x-.003,.363+i*.020,-.109,.005]]),mobile);
      }
      const tassel=k.bone(head,s*.146,.11,-.057);
      sweep(k,tassel,'dynastyGold',mirror(s,[[.007,.036,.025,.010],[.064,-.077,.036,.017],[.057,-.216,.041,.011],
        [.044,-.306,.038,.003]]),mobile);
      locks.push({joint:tassel,s});
    }else if(flower){
      const bun=k.bone(head,s*.122,.192,-.048);
      carve(k,bun,'dynastyHair',mirror(s,[[.009,-.052,-.023,.081,.072],[.047,.029,-.019,.105,.093],
        [.067,.098,-.011,.091,.071],[.063,.154,-.035,.052,.044],[.051,.173,-.044,.013,.011]]),mobile,62,2.22);
      sweep(k,bun,'dynastyGold',mirror(s,[[.007,.011,.069,.011],[.057,.06,.083,.018],[.130,.101,.032,.021],
        [.152,.104,-.039,.005]]),mobile);
      jewel(k,bun,'dynastyPale',s*.066,.063,.1,.032);
      const band=mirror(s,[[.011,.172,.157],[.095,.191,.115],[.144,.164,.052],[.172,.127,-.037],
        [.134,.122,-.093],[.087,.147,.022],[.027,.131,.144]]);
      armor(k,head,'dynastyBright',band,mobile,.027);
    }else{
      const mask=mirror(s,[[.018,.128,.147],[.068,.163,.133],[.133,.144,.10],[.195,.094,-.021],
        [.176,-.043,.055],[.147,-.106,.107],[.133,-.023,.154],[.119,.024,.165],[.076,.088,.183],[.032,.076,.177]]);
      armor(k,head,'dynastyMask',mask,mobile,.041,false,'dynastyPale');
      sweep(k,head,'dynastyPale',mirror(s,[[.025,.121,.174,.013],[.089,.145,.161,.027],[.147,.111,.112,.023],
        [.192,.066,.020,.013],[.208,.043,-.104,.004]]),mobile);
      jewel(k,head,'glow',s*.075,.075,.189,.016);
      const lock=k.bone(head,s*.119,.146,-.09);
      locks.push({joint:lock,s});
      for(let i=0;i<(mobile?6:10);i++){
        const t=i/(mobile?6:10),x=.027+t*.133,z=-t*.18,curve=Math.sin(i*1.71)*.04;
        const ribbon=mirror(s,[[x,.025-t*.13,z,.05,.042],[x+.117,-.103,z-.061,.068,.056],
          [x+.152+curve,-.322-t*.095,z-.095,.058,.046],[x+.217,-.521-t*.191,z-.159,.031,.026],
          [x+.284,-.641-t*.151,z-.253,.005,.007]]);
        carve(k,lock,i%3?'dynastyHair':'dynastyPale',ribbon,mobile,35+i,1.75);
        if(i%2===0)sweep(k,lock,'dynastyPale',ribbon.map(([x,y,z,r])=>[x+s*.021,y,z+r*.69,r*.17]),mobile);
      }
    }
  }
  if(court){
    carve(k,head,'dynastyWood',[[0,.192,.021,.111,.082],[0,.282,-.007,.126,.104],[0,.356,-.034,.093,.073],
      [0,.407,-.053,.051,.044],[0,.432,-.069,.012,.017]],mobile,68,2.48);
    jewel(k,head,'dynastyGold',0,.288,.104,.053);
  }else if(!flower)sweep(k,head,'dynastyCloth',[[-.167,.147,.019,.013],[-.111,.172,.122,.023],
    [0,.166,.164,.024],[.112,.172,.122,.022],[.167,.147,.019,.010]],mobile);
  return locks;
}

const coats={
  m031:[[0,.55,-.027,.184,.174],[0,.828,-.047,.192,.19],[0,1.095,-.039,.231,.202],[0,1.391,-.012,.316,.230],
    [0,1.529,-.003,.258,.177],[0,1.669,.010,.115,.114]],
  m032:[[0,.59,-.025,.136,.123],[0,.81,-.035,.167,.149],[0,1.068,-.011,.173,.168],[0,1.307,.02,.234,.177],
    [0,1.448,.033,.176,.143],[0,1.61,.036,.086,.089]],
  m033:[[0,.56,-.028,.160,.145],[.01,.77,-.041,.195,.168],[.01,.995,-.012,.159,.156],[0,1.24,.035,.249,.188],
    [0,1.386,.02,.221,.166],[0,1.608,.036,.091,.103]],
};

function tailoring(k,body,id,mobile){
  const court=id==='m031',flower=id==='m032';
  carve(k,body,'dynastyCloth',coats[id],mobile,51,2.58);
  const yokes=[];
  for(const s of signs){
    const joint=k.bone(body,s*(court?.216:.171),court?1.38:1.325,-.16);
    if(court){
      armor(k,joint,'dynastyBright',mirror(s,[[.009,.137,-.034],[.147,.204,-.059],[.276,.119,-.116],
        [.276,-.047,-.142],[.163,-.173,-.127],[.025,-.130,-.066],[-.061,-.018,-.046]]),mobile,.071,true,'dynastyLining');
      for(let i=0;i<4;i++)sweep(k,joint,'dynastyLining',mirror(s,[[.021,.117-i*.056,-.073,.007],
        [.121,.15-i*.069,-.131,.024],[.223,.031-i*.048,-.17,.025],[.25,-.074-i*.028,-.16,.004]]),mobile);
      sweep(k,body,'dynastyGold',mirror(s,[[.091,1.57,.121,.016],[.143,1.429,.218,.026],
        [.184,1.225,.243,.026],[.139,1.051,.225,.022],[.09,.817,.204,.013]]),mobile);
    }else if(flower){
      armor(k,joint,'dynastyBright',mirror(s,[[.014,.176,-.019],[.128,.129,-.073],[.171,.011,-.131],
        [.127,-.126,-.127],[.039,-.167,-.103],[-.058,-.061,-.066]]),mobile,.041,true,'dynastyPale');
      sweep(k,body,'dynastyPale',mirror(s,[[.087,1.54,.108,.021],[.133,1.414,.193,.025],[.142,1.266,.227,.03],
        [.087,1.126,.202,.025],[.031,1.102,.217,.016]]),mobile);
    }else{
      armor(k,joint,'dynastyCloth',mirror(s,[[.011,.139,-.018],[.149,.159,-.066],[.243,.056,-.113],
        [.211,-.104,-.126],[.118,-.175,-.112],[.004,-.106,-.067]]),mobile,.043,true,'dynastyDark');
      sweep(k,body,s>0?'dynastyDark':'dynastyBright',mirror(s,[[.07,1.516,.109,.034],[.181,1.361,.187,.037],
        [.174,1.203,.242,.038],[.081,1.067,.242,.031],[.029,.947,.197,.030]]),mobile);
    }
    yokes.push({joint,s});
  }
  const obi=k.bone(body,0,.83,.012);
  const lens=court?.214:flower?.180:.209;
  carve(k,obi,court?'dynastyDark':'dynastyBright',[[0,-.08,.009,lens*.88,.159],[0,-.027,.035,lens,.179],
    [0,.051,.040,lens*.98,.172],[0,.087,.043,lens*.86,.137]],mobile,56,2.71);
  for(const s of signs)sweep(k,obi,'dynastyGold',mirror(s,[[0,-.031,.218,.020],[lens*.54,-.023,.201,.025],
    [lens*.87,-.012,.139,.021],[lens*1.01,.004,.018,.010]]),mobile);
  jewel(k,obi,flower?'dynastyPale':'dynastyGold',0,-.006,.234,.050);
  if(flower){
    const profile=[[0,.060,.043,.245,.197],[0,.137,.021,.295,.247],[0,.316,-.013,.226,.202],
      [0,.579,-.021,.152,.153],[0,.76,-.017,.125,.122]];
    carve(k,body,'dynastyCloth',profile,mobile,68,2.3);
    for(let i=0;i<(mobile?5:9);i++){
      const a=i*tau/(mobile?5:9),x=Math.sin(a),z=Math.cos(a);
      sweep(k,body,'dynastyPale',[[x*.249,.062,z*.223+.039,.014],[x*.289,.101,z*.265+.027,.029],
        [x*.275,.151,z*.252+.021,.025],[x*.236,.213,z*.223+.012,.005]],mobile);
    }
  }
  return yokes;
}

function limbs(k,body,id,mobile){
  const court=id==='m031',flower=id==='m032',arms=[],legs=[];
  for(const s of signs){
    const shoulder=k.bone(body,s*(court?.292:.215),court?1.468:1.379,.033);
    const forearm=k.bone(shoulder,s*.071,-(court?.31:.278),.049),hand=k.bone(forearm,s*.024,-.274,.062);
    const pauldron=k.bone(shoulder,s*.021,.036,-.024),r=court?.151:flower?.122:.117;
    carve(k,shoulder,'dynastyCloth',mirror(s,[[.006,.081,-.032,r*.79,r*.72],[.051,-.028,-.024,r*1.17,r*1.05],
      [.077,-.167,.005,r*.97,r*.83],[.081,-.291,.053,r*.67,r*.66]]),mobile,11);
    carve(k,forearm,court?'dynastyLining':'dynastyCloth',mirror(s,[[.014,.062,.021,r*.66,r*.61],
      [.034,-.082,.055,r*.90,r*.76],[.045,-.173,.095,r*.91,r*.73],[.024,-.269,.081,r*.59,r*.54]]),mobile,12);
    const cap=court?[[.016,.092,.084],[.111,.17,.093],[.241,.158,-.031],[.311,.058,-.137],
      [.222,-.10,-.143],[.119,-.117,-.046],[.026,-.083,.123]]:
      [[.014,.074,.071],[.088,.114,.069],[.183,.066,-.04],[.212,-.042,-.102],
        [.126,-.106,-.086],[.037,-.097,.051],[-.022,-.038,.094]];
    armor(k,pauldron,court?'dynastyBright':flower?'dynastyBright':'dynastyMetal',mirror(s,cap),mobile,court?.061:.036,
      false,court?'dynastyLining':flower?'dynastyPale':'dynastyGold');
    for(let i=0;i<(mobile?2:3);i++){
      const y=-.105-i*.075,z=.120+i*.015,wide=court?.148:.110;
      armor(k,forearm,i%2?'dynastyLining':court?'dynastyMetal':flower?'dynastyBright':'dynastyCloth',mirror(s,[[.021,y+.054,z],
        [wide*.79,y+.08,z-.044],[wide*1.09,y-.016,z-.113],[wide*.75,y-.087,z-.078],[.004,y-.066,z+.029],
        [-.037,y-.025,z+.025]]),mobile,.031,false,flower?'dynastyPale':'dynastyGold');
    }
    carve(k,hand,'dynastySkin',mirror(s,[[.007,.073,.003,.042,.046],[.021,.025,.045,.063,.050],
      [.027,-.027,.082,.060,.047],[.028,-.069,.106,.048,.033]]),mobile,33);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.027;
      sweep(k,hand,'dynastySkin',[[x,.022,.054,.013],[x+s*.009,-.002,.098,.018],[x+s*.021,-.056,.125,.014],
        [x+s*.028,-.078,.096,.004]],mobile);
    }
    arms.push({shoulder,forearm,hand,pauldron,s});
    if(flower)continue;
    const hip=k.bone(body,s*(court?.138:.121),.667,court?-.019:s*.012),knee=k.bone(hip,s*.041,-.288,.035);
    const ankle=k.bone(knee,s*.013,-.299,.037);
    const exposed=id==='m033'&&s===1;
    carve(k,hip,exposed?'dynastySkin':'dynastyDark',mirror(s,[[.001,.097,-.021,.092,.097],[.036,-.008,-.015,.124,.118],
      [.06,-.161,.021,.106,.095],[.039,-.297,.034,.069,.075]]),mobile,72);
    carve(k,knee,exposed?'dynastySkin':'dynastyMetal',mirror(s,[[.004,.066,.009,.067,.065],[.027,-.081,-.012,.086,.083],
      [.025,-.168,.002,.068,.070],[.009,-.296,.033,.046,.049]]),mobile,81);
    if(exposed)for(let i=0;i<3;i++)sweep(k,knee,'dynastyCloth',mirror(s,[[.013,-.221-i*.026,.071,.020],
      [.059,-.231-i*.022,.046,.026],[.061,-.241-i*.023,-.025,.024],[-.012,-.248-i*.019,-.059,.012]]),mobile);
    const boot=exposed?'dynastyCloth':court?'dynastyDark':'dynastyLining';
    carve(k,ankle,boot,mirror(s,[[.015,-.059,.179,.068,.050],[.029,-.016,.107,.081,.073],
      [.025,.052,.031,.068,.075],[.006,.087,-.019,.055,.058]]),mobile,67,2.5);
    sweep(k,ankle,exposed?'dynastyPale':'dynastyGold',mirror(s,[[-.04,-.026,.098,.010],[.027,-.053,.201,.017],
      [.091,-.043,.149,.016],[.075,-.013,.063,.008]]),mobile);
    legs.push({hip,knee,ankle,s});
  }
  return {arms,legs};
}

function blade(k,hand,id,s,mobile){
  const court=id==='m031',part=k.bone(hand,0,-.022,.069);
  part.name=court?'高公公 · 沉金直劍':s>0?'妖刀姬 · 鎏紋打刀':'妖刀姬 · 副刀';
  const l=court?1.29:s>0?1.36:.49, w=court?.067:s>0?.083:.056;
  const tip=[court?0:.12,l+.15,.05];
  markEnemyWeapon(part,tip,{from:[0,-.041,.049],width:court?.115:.14});
  const outline=court?[[-w,.175,.048],[-w*.91,l*.72,.049],[-w*.59,l,.050],tip,
    [w*.56,l,.050],[w*.91,l*.66,.050],[w,.173,.046]]:
    [[-w,.162,.043],[-w*.67,l*.53,.041],[-w*.41,l*.82,.052],[.051,l+.089,.054],tip,
      [.138,l*.91,.052],[.087,l*.56,.052],[w,.169,.046]];
  k.sculpt.plate(part,'dynastyBlade',outline,.037,.014);
  for(const f of signs){
    const z=.048+f*.022;
    sweep(k,part,'dynastyMetal',[[0,.23,z,.008],[court?.003:.016,l*.51,z,.011],
      [court?.002:.055,l*.83,z,.009],[tip[0],tip[1]-.018,z,.002]],mobile);
    sweep(k,part,'dynastyPale',outline.slice(1,5).map(([x,y,v],i)=>[x,y,v+f*.019,i===3?.003:.007]),mobile);
  }
  sweep(k,part,'dynastyWood',[[0,-.281,.044,.034],[0,-.208,.048,.048],[0,.015,.047,.043],[0,.196,.047,.041]],mobile);
  sweep(k,part,'dynastyGold',[[-.177,.229,.041,.011],[-.108,.156,.048,.041],[0,.131,.060,.052],
    [.107,.179,.049,.038],[.181,.233,.036,.006]],mobile);
  jewel(k,part,court?'dynastyBright':'dynastyGold',0,-.266,.059,.043);
  return part;
}

function peonyBasket(k,body,mobile){
  const basket=k.bone(body,.288,1.478,-.28);
  basket.name='藍菜花 · 牡丹花籃';
  carve(k,basket,'dynastyWood',[[0,-.008,.003,.106,.091],[0,.051,.001,.158,.138],[0,.13,-.008,.226,.173],
    [0,.199,-.012,.245,.179],[0,.225,-.008,.222,.17]],mobile,19,2.72);
  for(let j=0;j<7;j++){
    const r=.126+j*.018,y=.032+j*.028;
    sweep(k,basket,j%2?'dynastyWood':'dynastyGold',Array.from({length:18},(_,i)=>{
      const a=i*tau/17;
      return [r*Math.cos(a),y+.005*Math.sin(a*7),r*.77*Math.sin(a),j===6?.020:.011];
    }),mobile);
  }
  sweep(k,basket,'dynastyGold',[[-.208,.161,.014,.023],[-.18,.331,-.011,.027],[-.093,.448,-.025,.025],
    [0,.488,-.031,.026],[.108,.446,-.021,.023],[.19,.331,.012,.022],[.219,.164,.023,.017]],mobile);
  const buds=[];
  for(let i=0;i<6;i++){
    const a=i*tau/6,x=Math.cos(a),z=Math.sin(a),y=.261+(i%3)*.043;
    const bud=k.bone(basket,x*.149,y,z*.117);
    buds.push(bud);
    sweep(k,basket,'dynastyMetal',[[x*.037,.088,z*.038,.011],[x*.09,.171,z*.071,.015],[x*.15,y,z*.119,.009]],mobile);
    jewel(k,bud,'dynastyGold',0,.059,.012,.029);
    const petals=mobile?6:8;
    for(let j=0;j<petals;j++){
      const b=j*tau/petals,c=Math.cos(b),s=Math.sin(b);
      k.geometry(bud,j%3?'dynastyBlade':'dynastyLining',featherVane([0,.050,0],[c*.043,.092,s*.045],
        [c*.088,.072,s*.088],.041,j+i*.858,mobile?7:11));
    }
  }
  return {basket,buds};
}

function gripBasket(basket,arm){
  const target=new T.Vector3(),current=new T.Vector3(),want=new T.Vector3(),pivot=new T.Vector3();
  const rotation=new T.Quaternion();
  return ()=>{
    target.set(.113,.344,.025);
    basket.localToWorld(target);
    for(let i=0;i<4;i++)for(const joint of [arm.forearm,arm.shoulder]){
      arm.hand.getWorldPosition(current);
      pivot.copy(joint.position);
      joint.parent.worldToLocal(current).sub(pivot).normalize();
      want.copy(target);
      joint.parent.worldToLocal(want).sub(pivot).normalize();
      joint.quaternion.premultiply(rotation.setFromUnitVectors(current,want));
    }
  };
}

function dress(body,head,arms,id){
  const cloth=[];
  for(const s of signs){
    const phase=s*.91,front=[1,0,s*.13],side=[.70,.07,-s*.65];
    const add=(parent,name,path,tint,trim,lining,flex,axis=front)=>cloth.push({parent,name:name+' '+s,
      path:mirror(s,path),tint,trim,lining,flex,across:axis,phase});
    if(id==='m031'){
      add(body,'高公公 · 對開長袍',[[.121,.832,.173,.087],[.187,.568,.222,.126],[.213,.284,.245,.115],
        [.226,.055,.236,.094]],0x272538,0x94744e,0x512b39,.68);
      add(body,'高公公 · 紫焰披風',[[.287,1.444,-.103,.114],[.425,1.193,-.228,.158],[.489,.727,-.452,.188],
        [.59,.309,-.534,.1]],0x553365,0xa05e7f,0x3d2d54,1.15,side);
      add(body,'高公公 · 烏紗背襬',[[.082,.820,-.19,.094],[.103,.613,-.269,.106],[.164,.355,-.324,.137],
        [.209,.073,-.407,.079]],0x2a2b3d,0x876447,0x342738,.64);
    }else if(id==='m032'){
      add(body,'藍菜花 · 冰藍百褶裙',[[.077,.831,.161,.093],[.126,.592,.193,.149],[.205,.335,.256,.203],
        [.267,.124,.376,.228]],0x234479,0x76b0bd,0x354367,.91);
      add(body,'藍菜花 · 湖紗裙層',[[.123,.799,-.129,.091],[.216,.589,-.24,.154],[.259,.329,-.34,.206],
        [.299,.111,-.477,.213]],0x233762,0x7abac5,0x4b4868,1.08,side);
      add(head,'藍菜花 · 雙髻垂帶',[[.174,.181,-.17,.047],[.247,.003,-.293,.061],[.341,-.36,-.343,.069],
        [.407,-.741,-.418,.051],[.495,-.931,-.547,.013]],0x254a83,0x78b8d0,0x30375c,1.47,side);
      add(arms[s===1?1:0].forearm,'藍菜花 · 水袖',[[.047,.005,-.061,.076],[.129,-.122,-.091,.099],
        [.163,-.258,-.16,.109],[.244,-.363,-.229,.011]],0x3e76a2,0x9dc1c8,0x2c4966,1.24,side);
    }else{
      add(body,'妖刀姬 · 斜幅戰裙',s>0?[[.131,.808,.17,.067],[.188,.646,.194,.087],[.255,.416,.168,.085],
        [.374,.311,.102,.018]]:[[.102,.826,.21,.111],[.211,.587,.308,.173],[.256,.341,.355,.163],
        [.329,.042,.328,.068]],0x9c3833,0x99593e,0x382735,1.04);
      add(body,'妖刀姬 · 赤縁背掛',[[.203,1.373,-.146,.088],[.282,1.091,-.263,.134],[.379,.652,-.415,.176],
        [.493,.178,-.582,.116]],0x713036,0xb47543,0x352938,1.30,side);
      add(body,'妖刀姬 · 青紐',[[.037,.82,.211,.036],[.076,.674,.297,.046],[.143,.454,.332,.045],
        [.228,.231,.27,.014]],0x24658c,0x8aa3a1,0x324067,.99);
    }
  }
  return cloth;
}

export function carveDynastyTrio(k,entry,mobile){
  const {id}=entry,court=id==='m031',flower=id==='m032';
  const body=k.bone(k.root,0,flower?.133:.065,0),head=k.bone(body,0,court?1.791:flower?1.685:1.73,.052);
  const jaw=maskSurface(k,head,id,mobile),locks=headgear(k,head,id,mobile);
  const yokes=tailoring(k,body,id,mobile),{arms,legs}=limbs(k,body,id,mobile);
  const petals=flower?peonyBasket(k,body,mobile):null;
  const weapons=flower?[]:arms.filter(a=>!court||a.s>0).map(({hand,s})=>({part:blade(k,hand,id,s,mobile),s}));
  const hold=petals?gripBasket(petals.basket,arms[1]):null;
  const cloth=dress(body,head,arms,id);
  return {body,head,arms:arms.map(a=>a.shoulder),legs:legs.map(l=>l.hip),crest:k.bone(head,0,0,0),
    pattern:flower||court?'hover':'duel',grounded:!flower,sourceSculpt:true,dynastyTrio:true,catalogueSculpt:id,
    sourceDress(tools){
      for(const {parent,name,path,...options} of cloth)tools.silk(parent,name,path,{...options,style:'woven'});
      return true;
    },
    polishEnergy:{tint:court?0xe88b65:flower?0xb9d6fa:0xffa07b,shape:court?'sigils':flower?'mist':'embers',anchor:body,
      offset:[0,flower?.44:.95,-.235],span:[.69,.62,.49],weaponWidth:court?.48:.53,emissionScale:.54},
    cataloguePose({beat,headtime,wind,strike,travel,step,fall}){
      body.rotation.x=-wind*(court?.235:flower?.10:.28)+strike*(court?.38:flower?.16:.33)+fall*.28;
      head.rotation.x=-wind*.112+strike*.183;
      head.rotation.y=Math.sin(headtime*2.08)*.062+(wind-strike)*.141;
      jaw.rotation.x=.030+wind*.071+strike*.13;
      for(const {joint,s} of locks){
        joint.rotation.x=travel*.11+wind*.144-strike*.269;
        joint.rotation.z=s*(Math.sin(beat*.71)*.045+wind*.123-strike*.16);
      }
      for(const {joint,s} of yokes)joint.rotation.y=s*(wind*.119-strike*.127);
      for(const {shoulder,forearm,hand,pauldron,s} of arms){
        const pace=Math.sin(step+s*Math.PI*.5)*travel;
        shoulder.rotation.set(pace*.29-wind*(court?.75:1.03)+strike*(s>0?.83:.62),
          s*(wind*.207-strike*.256),s*(.185+wind*.179-strike*.08));
        forearm.rotation.set(-.24-wind*.367+strike*.489,s*(wind*.187-strike*.11),0);
        hand.rotation.z=s*(wind*.19-strike*.303);
        pauldron.rotation.x=wind*.171-strike*.231;
        if(flower){
          shoulder.rotation.set(s>0?1.55:-.51-wind*.37+strike*.51,s*.17,s*.24);
          forearm.rotation.x=s>0?.30:-.63-wind*.40+strike*.31;
        }
      }
      for(const {hip,knee,ankle,s} of legs){
        const gait=Math.cos(step+s*Math.PI*.5)*travel;
        hip.rotation.x=(id==='m033'&&s===1?-.16:0)+gait*.53+wind*.156-strike*.186;
        knee.rotation.x=-Math.max(0,gait)*.54+fall*.21;
        ankle.rotation.x=-Math.min(0,gait)*.29+strike*.071;
      }
      for(const {part,s} of weapons)part.rotation.set(-.14+wind*.42-strike*.56,0,s*(.23+wind*.37-strike*.58));
      if(petals){
        petals.basket.rotation.x=-wind*.06+strike*.08;
        petals.basket.rotation.z=Math.sin(beat*.61)*.048+wind*.071-strike*.109;
        for(const [i,bud] of petals.buds.entries())bud.rotation.z=Math.sin(beat*.65+i*.78)*.063+strike*.10;
        hold();
      }
    },
  };
}
