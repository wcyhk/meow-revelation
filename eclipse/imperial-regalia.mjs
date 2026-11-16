import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...p])=>[s*x,...p]);
const ridge=(k,j,m,path,mobile)=>k.sculpt.sweep(j,m,path,{steps:mobile?8:13,sides:mobile?5:8,ridge:.16});
const cast=(k,j,m,path,mobile,seed=0,section=2.63)=>k.geometry(j,m,sculptVolume(path,
  {rings:mobile?10:16,sides:mobile?9:13,section,ridge:.12,seed}));
const rivet=(k,j,m,x,y,z,r=.020)=>k.mesh(j,'gem',m,x,y,z,r,r,r*.63);

function plate(k,j,finish,outline,depth,mobile,{rear=false,rim='bTrim'}={}){
  k.sculpt.plate(j,finish,outline,depth,depth*.32);
  ridge(k,j,rim,outline.slice(0,-1).map(([x,y,z],i)=>[x,y,z+(rear?-1:1)*depth*.48,i%3?.011:.015]),mobile);
}

function ceremonialBody(k,body,mobile){
  cast(k,body,'bCloth',[[0,-.23,-.024,.286,.211],[0,.038,-.029,.282,.235],[0,.35,-.048,.344,.266],
    [0,.662,-.048,.407,.280],[0,.822,-.037,.361,.23],[0,.974,-.010,.181,.142]],mobile,40);
  const hinges=[];
  for(const s of sides){
    ridge(k,body,'bTrim',mirror(s,[[.095,.863,.175,.028],[.261,.770,.212,.037],[.220,.493,.241,.029],
      [.094,.310,.229,.030],[.028,.076,.232,.025]]),mobile);
    ridge(k,body,'bInlay',mirror(s,[[.272,.772,.186,.009],[.305,.612,.20,.014],[.247,.401,.258,.016],
      [.109,.153,.247,.009]]),mobile);
    const hinge=k.bone(body,s*.315,.642,-.194);
    hinge.name='軒轅 · 曲簷肩甲';
    const turn=mirror(s,[[.008,.135,-.035],[.179,.166,-.006],[.267,.08,-.050],[.26,-.051,-.146],
      [.123,-.156,-.179],[-.024,-.088,-.103],[-.087,.024,-.041]]);
    plate(k,hinge,'bMetal',turn,.068,mobile,{rear:true});
    for(let i=0;i<3;i++){
      const x=s*(.08+i*.049),y=.039-i*.039;
      rivet(k,hinge,'bInlay',x,y,-.127-i*.015,.031-i*.005);
    }
    const clasp=k.bone(body,s*.244,.49,-.211);
    plate(k,clasp,'bOxide',mirror(s,[[0,.092,.009],[.106,.112,-.041],[.134,.031,-.104],
      [.067,-.052,-.122],[.013,-.076,-.079],[-.022,-.021,-.026]]),.046,mobile,{rear:true});
    hinges.push({hinge,s});
  }
  const coin=k.bone(body,0,.513,-.308);
  cast(k,coin,'bMetal',[[0,-.139,-.02,.074,.025],[0,-.077,-.06,.171,.065],
    [0,.042,-.069,.182,.052],[0,.123,-.034,.126,.028],[0,.16,0,.058,.017]],mobile,50,2.26);
  ridge(k,coin,'bTrim',[[-.13,.013,-.13,.015],[-.072,.055,-.133,.018],[0,.028,-.146,.019],
    [.074,-.032,-.136,.018],[.137,.018,-.126,.015]],mobile);
  for(const s of sides)rivet(k,coin,'bInlay',s*.043,.025,-.147,.027);
  return hinges;
}

function warBody(k,body,mobile){
  cast(k,body,'bShadow',[[0,-.27,-.024,.304,.219],[0,.061,-.044,.31,.249],[0,.29,-.058,.389,.285],
    [0,.659,-.045,.483,.312],[0,.872,-.037,.406,.252],[0,1.01,-.03,.196,.164]],mobile,72,2.93);
  const hinges=[];
  for(const s of sides){
    const chest=mirror(s,[[.057,.762,.276],[.095,.945,.195],[.275,.916,.198],[.473,.75,.037],
      [.449,.567,.146],[.319,.387,.272],[.094,.46,.336],[.025,.538,.333]]);
    plate(k,body,'bMetal',chest,.060,mobile);
    ridge(k,body,'bOxide',mirror(s,[[.069,.805,.306,.012],[.236,.833,.268,.036],[.297,.665,.319,.044],
      [.187,.554,.372,.055],[.067,.532,.379,.014]]),mobile);
    for(let i=0;i<3;i++){
      const y=.336-i*.112;
      plate(k,body,i%2?'bMetal':'bOxide',mirror(s,[[.035,y+.063,.309],[.207,y+.104,.263],[.397,y+.063,.088],
        [.382,y-.065,.105],[.189,y-.077,.302],[.041,y-.099,.324]]),.042,mobile);
    }
    for(let i=0;i<(mobile?3:4);i++){
      const y=.636-i*.143,w=.28-i*.044;
      const hinge=k.bone(body,s*.128,y,-.321+i*.019);
      hinge.name='軒轅強 · 脊甲 '+s+' '+(i+1);
      plate(k,hinge,i%2?'bMetal':'bOxide',mirror(s,[[-.051,.117,-.012],[w*.51,.177,-.059],[w*.95,.102,.005],
        [w*1.23,-.009,.08],[w*.70,-.133,.037],[.071,-.097,-.076],[-.052,-.045,-.069]]),.055,mobile,{rear:true});
      ridge(k,hinge,'bInlay',mirror(s,[[-.02,.054,-.098,.010],[w*.41,.063,-.092,.023],[w*.76,.007,-.052,.023],
        [w*.92,-.071,-.015,.007]]),mobile);
      rivet(k,hinge,'bTrim',s*w*.45,.003,-.106,.023);
      hinges.push({hinge,s,index:i});
    }
    const waist=k.bone(body,s*.259,-.056,-.127);
    plate(k,waist,'bMetal',mirror(s,[[.006,.13,-.116],[.117,.088,-.031],[.172,-.054,.034],
      [.134,-.204,-.078],[.061,-.249,-.195],[-.047,-.123,-.238]]),.053,mobile,{rear:true});
    hinges.push({hinge:waist,s,index:4});
  }
  ridge(k,body,'bInlay',[[0,.86,-.275,.026],[0,.608,-.449,.035],[0,.374,-.421,.029],
    [0,.148,-.377,.017],[0,-.084,-.323,.010]],mobile);
  return hinges;
}

function ceremonyCloth(body,sash,s){
  const phase=s*.72,tint=0x22272f,trim=0x9a7038,lining=0x3f3026;
  return [
    {parent:sash,name:'軒轅 · 對襟長袍 '+s,path:mirror(s,[[.079,.028,.23,.094],[.118,-.301,.359,.155],
      [.167,-.708,.407,.204],[.193,-1.148,.42,.176]]),tint,trim,lining,phase,flex:.83},
    {parent:body,name:'軒轅 · 披帛 '+s,path:mirror(s,[[.248,.495,-.239,.116],[.289,.091,-.373,.178],
      [.368,-.46,-.532,.223],[.477,-1.134,-.66,.162]]),tint,trim,lining,phase:phase+.69,flex:1.13},
    {parent:body,name:'軒轅 · 流霞佩帶 '+s,path:mirror(s,[[.319,.562,-.139,.040],[.586,.38,-.204,.052],
      [.772,.466,-.365,.037],[.911,.311,-.628,.014]]),tint:0x9b6225,trim:0xf6d888,lining,phase,flex:1.53},
  ];
}

function warCloth(body,sash,s){
  const phase=s*1.11,tint=0x3c292d,trim=0xdc9a4a,lining=0x382f39;
  return [
    {parent:sash,name:'軒轅強 · 分牙戰裙 '+s,path:mirror(s,[[.161,.024,.291,.118],[.268,-.239,.433,.143],
      [.376,-.653,.486,.174],[.462,-1.206,.38,.030]]),tint,trim,lining,phase,flex:.62},
    {parent:body,name:'軒轅強 · 裂旌 '+s,path:mirror(s,[[.421,.731,-.255,.086],[.579,.436,-.435,.144],
      [.731,-.033,-.637,.166],[.941,-.602,-.955,.044]]),tint,trim,lining,phase:phase+.82,flex:1.22},
    {parent:body,name:'軒轅強 · 鐵甲內披 '+s,path:mirror(s,[[.079,.197,-.315,.076],[.16,-.223,-.429,.109],
      [.254,-.703,-.612,.147],[.329,-1.243,-.777,.041]]),tint:0x222632,trim:0xb68449,lining,phase,flex:.91},
  ];
}

export function carveImperialRegalia(k,entry,body,head,sash,mobile){
  if(entry.id!=='m067'&&entry.id!=='m068')return null;
  const war=entry.id==='m068';
  const hinges=war?warBody(k,body,mobile):ceremonialBody(k,body,mobile);
  const cloth=sides.flatMap(s=>war?warCloth(body,sash,s):ceremonyCloth(body,sash,s));
  const underskirt=k.bone(sash,0,-.085,-.019);
  underskirt.name=war?'軒轅強 · 甲裙暗裡':'軒轅 · 內袍褶';
  const width=war?.81:1;
  cast(k,underskirt,'bShadow',[[0,-1.081,.045,.345*width,.269],[0,-.838,.007,.421*width,.369],
    [0,-.503,-.012,.387*width,.341],[0,-.196,-.015,.312*width,.287],[0,.006,.008,.254,.226]],mobile,17,2.77);
  for(const s of sides){
    for(let i=0;i<3;i++){
      const dis=i*.103;
      ridge(k,underskirt,i===1?'bOxide':'bCloth',mirror(s,[[width*.196,-.156,.188-dis,.009],
        [width*(.313+i*.021),-.390,.223-dis,.025],[width*(.396+i*.014),-.723,.213-dis,.034],
        [width*(.352+i*.021),-.968,.162-dis,.008]]),mobile);
    }
    cloth.push({parent:head,name:(war?'軒轅強':'軒轅')+' · 下頜鬚 '+s,path:mirror(s,[[.014,-.152,.252,.040],
      [.036,-.224,.276,.061],[.056,-.382,.281,.060],[.066,-(war?.526:.498),.30,.008]]),tint:0x242223,trim:0x4b4240,
      lining:0x232224,phase:s*.91,flex:.45});
  }
  if(war)for(const s of sides){
    ridge(k,head,'bRegaliaOxBlood',mirror(s,[[.062,.112,.249,.009],[.088,.097,.253,.015],
      [.108,.046,.244,.016],[.115,.009,.232,.005]]),mobile);
    const finial=mirror(s,[[.104,.352,-.111,.045,.029],[.203,.425,-.179,.057,.038],
      [.228,.594,-.284,.040,.022],[.182,.746,-.322,.004,.004]]);
    cast(k,head,'bOxide',finial,mobile,83,2.26);
    ridge(k,head,'bTrim',finial.map(([x,y,z,r])=>[x+s*.018,y+.009,z+.035,r*.40]),mobile);
  }
  return {cloth,
    arms(arms){
      for(const {root,elbow,hand,side:s} of arms){
        const cuff=war?.18:.247;
        cast(k,root,'bCloth',mirror(s,[[.013,.157,-.026,.15,.131],[.118,.049,-.007,.208,.177],
          [.146,-.143,.005,.186,.164],[.112,-.382,.039,.139,.133]]),mobile,54);
        cast(k,elbow,'bCloth',mirror(s,[[.006,.072,.018,.128,.123],[.043,-.102,.048,cuff*.85,cuff*.67],
          [.066,-.293,.102,cuff,cuff*.68],[.046,-.446,.139,cuff*.66,cuff*.57]]),mobile,63);
        const glove=mirror(s,[[0,.062,.011,.065,.054],[.021,-.016,.045,.091,.077],
          [.029,-.083,.104,.08,.046],[.032,-.119,.116,.055,.037]]);
        cast(k,hand,war?'bOxide':'bFlesh',glove,mobile,79,2.4);
        for(let i=0;i<4;i++){
          const x=(i-1.5)*.035;
          ridge(k,hand,war?'bTrim':'bMetal',[[x,-.039,.102,.012],[x+.012*s,-.072,.138,.016],
            [x+.031*s,-.111,.109,.006]],mobile);
        }
        const front=war?[[.015,.130,.074],[.154,.249,.019],[.33,.167,-.063],[.391,.063,-.179],
          [.264,-.079,-.11],[.155,-.145,.071],[.014,-.045,.201]]:
          [[.012,.080,.122],[.093,.162,.093],[.213,.154,.055],[.282,.064,-.052],
            [.245,-.080,-.11],[.132,-.132,.068],[.002,-.048,.18]];
        plate(k,root,'bMetal',mirror(s,front),war?.078:.057,mobile);
        for(let i=0;i<(war?3:2);i++){
          const y=-.113-i*.079,depth=.125+i*.027;
          plate(k,elbow,war?'bMetal':'bOxide',mirror(s,[[0,y+.049,depth],[.13,y+.062,depth-.037],
            [cuff*.96,y+.005,depth-.139],[.16,y-.075,depth-.091],[.044,y-.078,depth+.071],[-.024,y-.018,depth+.029]]),.031,mobile);
        }
        if(!war)cloth.push({parent:elbow,name:'軒轅 · 廣袖暗裡 '+s,path:mirror(s,[[.036,-.047,-.068,.093],[.088,-.188,-.139,.15],
          [.124,-.327,-.185,.178],[.161,-.509,-.173,.101]]),across:[.78,.03,-s*.61],tint:0x2c2930,trim:0xbf9749,
          lining:0x503933,phase:s*.83,flex:.71});
      }
    },
    pose({beat,wind,strike,travel}){
      underskirt.rotation.x=Math.sin(beat*.56)*.034+travel*.14-wind*.08+strike*.17;
      underskirt.rotation.y=(wind-strike)*(war?.154:.088);
      for(const {hinge,s,index=0} of hinges){
        hinge.rotation.y=s*(wind*(war?.17:.10)-strike*.102);
        hinge.rotation.x=Math.sin(beat*.74-index*.62)*.038+wind*.082-strike*(war?.22:.13)+travel*.051;
      }
    },
  };
}

export function palaceCombatLegs(k,id,legs,mobile){
  const archer=id==='m084';
  for(const {hip,knee,boot,side:s} of legs){
    cast(k,hip,'bCloth',mirror(s,[[.012,.085,-.045,.106,.108],[.062,-.120,-.035,.151,.125],
      [.070,-.301,.009,.130,.105],[.018,-.515,.073,.081,.083]]),mobile,8,2.45);
    cast(k,knee,archer?'bShadow':'bCloth',mirror(s,[[.008,.089,.014,.082,.083],[.049,-.081,-.029,.117,.108],
      [.042,-.186,-.039,.111,.107],[.034,-.365,-.006,.083,.084],[.012,-.49,.035,.059,.061]]),mobile,21,2.44);
    cast(k,boot,'bShadow',mirror(s,[[.022,-.069,.207,.077,.058],[.022,-.035,.126,.092,.095],
      [.029,.025,.025,.083,.084],[.004,.071,-.042,.065,.072]]),mobile,33,2.75);
    if(archer){
      plate(k,knee,'bMetal',mirror(s,[[.015,.085,.123],[.110,.053,.077],[.139,-.095,.075],[.114,-.297,.051],
        [.045,-.398,.069],[-.015,-.317,.111],[-.039,-.108,.105]]),.048,mobile);
      ridge(k,knee,'bBone',mirror(s,[[.039,.064,.128,.011],[.073,-.093,.116,.020],[.064,-.225,.124,.017],
        [.046,-.34,.118,.006]]),mobile);
      for(let i=0;i<3;i++){
        const y=-.064-i*.114;
        ridge(k,knee,'bWood',mirror(s,[[.105,y,.036,.013],[.106,y-.018,-.072,.021],
          [.046,y-.040,-.139,.025],[-.041,y-.036,-.08,.008]]),mobile);
        rivet(k,knee,'bTrim',s*.047,y-.039,-.155,.021);
      }
      plate(k,boot,'bOxide',mirror(s,[[-.047,.058,.062],[.083,.038,.078],[.125,-.037,.162],[.062,-.064,.233],
        [-.064,-.056,.201],[-.072,-.025,.137]]),.034,mobile);
    }else{
      for(let i=0;i<(mobile?4:5);i++){
        const y=.044-i*.084,outer=.126-i*.012;
        plate(k,knee,i%2?'bCloth':'bMetal',mirror(s,[[.017,y+.052,.12],[.082,y+.060,.071],[outer,y-.010,-.042],
          [outer*.92,y-.081,-.09],[.053,y-.099,-.121],[.013,y-.046,-.091],[-.025,y-.012,.11]]),.026,mobile,{rim:'bOxide'});
        ridge(k,knee,'bInlay',mirror(s,[[.03,y-.012,.108,.006],[.078,y-.009,.055,.009],
          [outer*.92,y-.038,-.037,.008],[.07,y-.077,-.111,.003]]),mobile);
      }
      ridge(k,boot,'bMetal',mirror(s,[[-.035,.057,.011,.011],[.105,.003,.002,.020],[.117,-.055,.139,.023],
        [.023,-.082,.242,.018],[-.073,-.073,.212,.008]]),mobile);
    }
  }
}
