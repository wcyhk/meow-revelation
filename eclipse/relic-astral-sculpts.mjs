import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2,sides=[-1,1];
const sweep=(k,j,m,curve,steps=12)=>k.sculpt.sweep(j,m,curve,{steps,sides:7,ridge:.23});
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,
  {sides:mobile?11:17,rings:mobile?14:22,section:2.34,ridge:.19,seed}));
const plate=(k,j,m,profile,depth=.04)=>k.sculpt.plate(j,m,profile,depth,.014);
const mirror=(side,profile)=>profile.map(([x,...rest])=>[side*x,...rest]);

function lineMaterials(k,[dark,metal,light,textile]){
  for(const [name,color,kind,metalness,roughness] of [
    ['astralHide',dark,'hide',.13,.68],['astralPlate',metal,'bronze',.61,.46],
    ['astralRim',light,'iron',.72,.48],['astralTextile',textile,'cloth',.09,.75],
  ]){
    k.materials[name]=paintedFinish(new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:metalness>.3?.68:.25}),kind,true,true);
  }
}

function starKeeper(k,weapon,mobile,build){
  const dark=0x222b34,metal=0x625647,light=0xa7a083,textile=0x3a5362;
  lineMaterials(k,[dark,metal,light,textile]);
  const model=build(k,{broad:.36,ground:1.17,neck:.91,style:'duel',finish:'astralTextile',armLength:.69,mobile,
    portrait(k,head){
      head.name='照誓追契者 · 方星面甲';
      cast(k,head,'astralHide',[[0,-.167,.163,.102,.093],[0,-.069,.11,.165,.146],[0,.119,-.018,.183,.185],
        [0,.265,-.043,.179,.148],[0,.351,-.083,.107,.093]],mobile);
      for(const side of sides){
        const mask=mirror(side,[[.023,.15,.29],[.151,.183,.202],[.201,.076,.059],[.188,-.077,.13],
          [.103,-.197,.229],[.042,-.147,.271]]);
        plate(k,head,'astralPlate',mask,.053);
        sweep(k,head,'astralRim',mask.slice(1,6).map(([x,y,z],i)=>[x,y+.022,z+.024,[.022,.027,.018,.013,.004][i]]));
        sweep(k,head,'glow',mirror(side,[[.044,.069,.321,.007],[.105,.085,.277,.019],[.152,.095,.209,.005]]));
        const vane=mirror(side,[[.042,.211,-.164],[.203,.229,-.171],[.317,.353,-.226],
          [.187,.516,-.251],[.097,.433,-.202],[.045,.30,-.115]]);
        plate(k,head,'astralRim',vane,.047);
      }
    },
    weapon(k,body,back,head,hands,flaps){
      const dial=k.bone(back,0,.588,-.162);
      dial.name='照誓追契者 · 曆盤';
      for(const [r,depth] of [[.373,-.082],[.462,-.131],[.546,-.179]]){
        k.mesh(dial,'ring','astralPlate',0,0,depth,r,r,.66);
        for(let t=0;t<10;t++){
          const a=t*tau/10;
          k.mesh(dial,'gem',t%3?'astralRim':'glow',Math.sin(a)*r,Math.cos(a)*r,depth-.035,.032,.055,.027,0,0,-a);
        }
      }
      const pointer=k.bone(dial,0,0,-.212);
      plate(k,pointer,'astralRim',[[-.021,-.239,.08],[.046,-.011,.05],[.093,.319,.032],
        [.024,.461,.028],[-.019,.193,.035]],.044);
      flaps.push({joint:pointer,axis:'z',amp:.52,bias:-.10,seed:4.84});
      const blade=hands[1];
      markEnemyWeapon(blade,[.104,1.34,.161],{from:[0,-.24,.034],width:.13});
      sweep(k,blade,'astralHide',[[0,-.49,-.027,.036],[0,-.16,.019,.05],[.024,.216,.056,.053],
        [.021,.439,.090,.039]],15);
      plate(k,blade,'astralRim',[[-.119,.233,.093],[.099,.233,.102],[.148,.766,.133],
        [.108,1.35,.156],[-.013,1.154,.194],[-.123,.628,.168]],.073);
      const glow=[[-.029,.365,.153,.011],[.017,.618,.188,.018],[.045,.873,.195,.018],
        [.051,1.231,.172,.004]];
      sweep(k,blade,'glow',glow,18);
    }});
  return dress(model,weapon,{tint:textile,trim:light,lining:dark,length:1.25,spread:.36,tone:0xb4d6b1,shape:'sigils'});
}

function moonWalker(k,weapon,mobile,build){
  const dark=0x362733,metal=0x6d4871,light=0xd0a7a1,textile=0x583751;
  lineMaterials(k,[dark,metal,light,textile]);
  const model=build(k,{broad:.31,ground:1.08,neck:.83,style:'shade',armLength:.60,finish:'astralTextile',mobile,
    portrait(k,head){
      cast(k,head,'astralHide',[[0,-.219,.133,.116,.11],[0,-.032,.05,.173,.172],
        [0,.143,-.047,.197,.181],[0,.267,-.099,.134,.147],[0,.345,-.164,.071,.072]],mobile,7.4);
      const lunarHead=k.bone(head,0,.099,.17);
      plate(k,lunarHead,'astralRim',[[.011,-.318,.102],[-.104,-.212,.153],[-.167,-.064,.101],
        [-.174,.09,.01],[-.091,.226,-.004],[-.047,.271,.003],[-.104,.104,.02],
        [-.104,.015,.061],[-.063,-.159,.123],[.083,-.233,.103]],.05);
      sweep(k,head,'glow',[[-.008,-.053,.221,.01],[.056,-.048,.192,.023],[.112,-.023,.163,.015],[.154,.013,.112,.005]]);
      for(let i=0;i<4;i++){
        const y=.14-i*.067;
        cast(k,head,i%2?'astralPlate':'astralHide',[[.024,y+.11,-.070,.046,.055],[.209,y+.081,-.183,.076,.054],
          [.249,y-.04,-.327,.040,.038],[.281,y-.227,-.415,.004,.005]],mobile,i*2.1);
      }
    },
    weapon(k,body,back,head,hands,flaps){
      const blade=hands[0];
      markEnemyWeapon(blade,[.39,1.08,.061],{from:[0,-.29,.025],width:.21});
      sweep(k,blade,'astralPlate',[[0,-.40,-.015,.044],[0,-.131,.025,.054],[-.012,.145,.045,.055],
        [-.012,.294,.065,.047]],13);
      const crescent=[[-.08,.207,.122],[.186,.299,.152],[.292,.508,.128],[.389,.823,.081],
        [.398,1.08,.053],[.213,.911,.075],[.06,.759,.081],[-.084,.651,.108],[-.169,.429,.134]];
      plate(k,blade,'astralRim',crescent,.061);
      sweep(k,blade,'glow',[[.113,.313,.174,.01],[.203,.414,.174,.025],[.281,.67,.141,.024],
        [.350,.871,.125,.015],[.384,1.051,.075,.004]],16);
      for(const side of sides){
        const fin=k.bone(back,side*.146,.476,-.179);
        const width=side>0?.681:.442;
        const p=mirror(side,[[0,.085,.063],[width*.42,.161,-.156],[width*.83,.006,-.289],[width,-.149,-.341],
          [width*.71,-.222,-.296],[width*.152,-.361,-.148],[.023,-.208,-.115]]);
        plate(k,fin,'astralPlate',p,.048);
        sweep(k,fin,'astralRim',p.slice(1,6).map(([x,y,z])=>[x,y+.025,z-.024,.012]));
        flaps.push({joint:fin,axis:'y',amp:.295,bias:side*.13,seed:side*.77});
      }
    }});
  return dress(model,weapon,{tint:textile,trim:light,lining:dark,length:1.12,spread:.65,tone:0xe8aace,shape:'mist'});
}

function dragonMonk(k,weapon,mobile,build){
  const dark=0x203842,metal=0x42645c,light=0xa5bfa4,textile=0x395a50;
  lineMaterials(k,[dark,metal,light,textile]);
  const model=build(k,{broad:.384,ground:.99,neck:.77,style:'shade',legs:false,armLength:.64,finish:'astralTextile',mobile,
    portrait(k,head){
      cast(k,head,'astralHide',[[0,-.135,.275,.093,.069],[0,-.071,.231,.176,.121],
        [0,.046,.101,.224,.171],[0,.187,-.061,.203,.177],[0,.191,-.210,.117,.106]],mobile,3.52);
      for(const side of sides){
        const f=path=>mirror(side,path);
        sweep(k,head,'astralRim',f([[.056,.061,.309,.02],[.148,.169,.202,.052],[.187,.193,.051,.04],
          [.239,.271,-.101,.025],[.237,.389,-.195,.005]]),14);
        sweep(k,head,'glow',f([[.077,.057,.275,.009],[.150,.109,.186,.018],[.182,.138,.051,.004]]));
        sweep(k,head,'astralPlate',f([[.11,-.088,.16,.036],[.206,-.183,.199,.026],
          [.312,-.254,.269,.018],[.438,-.056,.29,.004]]),17);
        const fin=f([[.042,.202,.037],[.215,.289,-.107],[.374,.421,-.214],
          [.324,.205,-.298],[.196,-.021,-.247],[.055,.065,-.109]]);
        plate(k,head,'astralRim',fin,.044);
      }
    },
    weapon(k,body,back,head,hands,flaps){
      const rod=hands[1];
      markEnemyWeapon(rod,[.104,1.24,.088],{from:[0,-.57,.025],width:.169,aim:false,kind:'focus'});
      sweep(k,rod,'astralHide',[[0,-.79,-.069,.048],[0,-.30,.014,.049],[.01,.40,.04,.055],
        [.043,.99,.063,.069],[.069,1.139,.084,.031]],19);
      k.mesh(rod,'ring','astralRim',0,1.125,.089,.193,.224,.78,0,.20,-.09);
      k.mesh(rod,'gem','glow',0,1.128,.095,.066,.102,.061);
      const coils=k.bone(body,0,-.631,0);
      coils.name='照誓追契者 · 盤龍';
      for(let row=0;row<2;row++){
        const path=Array.from({length:8},(_,i)=>{
          const a=(i/7)*tau*.92+row*2.7,span=1-i*.030,h=.06+row*.22+i*.009;
          return [Math.sin(a)*.50*span,h,Math.cos(a)*.46*span-.128,.101-i*.009,.079-i*.005];
        });
        cast(k,coils,'astralHide',path,mobile,row);
        sweep(k,coils,row?'astralRim':'glow',path.map(([x,y,z,r])=>[x*1.06,y+.07,z*1.06,r*.26]),20);
      }
      flaps.push({joint:coils,axis:'y',amp:.239,bias:.055,seed:8.9});
    }});
  return dress(model,weapon,{tint:textile,trim:light,lining:dark,length:.62,spread:.52,tone:0x92dfce,shape:'ribbons'});
}

function dress(model,weapon,{tint,trim,lining,length,spread,tone,shape}){
  model.polishEnergy={tint:tone,shape,anchor:model.body,offset:[0,.49,-.17],span:[.82,1.01,.75]};
  model.relicDress=tools=>{
    for(const side of sides)for(let i=0;i<4;i++){
      const x=.043+i*.073,w=.100+i*.012,trail=length*(1+i*.060);
      const path=mirror(side,[[x,.275,-.183+i*.10,w*.62],[x+.074,.071,-.287+i*.096,w],
        [x+spread*.28,-trail*.32,-.369+i*.133,w*.91],
        [x+spread*.54,-trail*.63,-.505+i*.17,w*.77],
        [x+spread*.72,-trail,-.65+i*.211,w*.18]]);
      tools.silk(model.body,weapon.guardian.name+' · 裂帛 '+side+' '+(i+1),path,
        {style:'woven',tint,trim,lining,phase:side*.82+i*.9,flex:1.08+i*.12});
    }
    return true;
  };
  return model;
}

const astral={'sam-in':starKeeper,'moon-kukri':moonWalker,'sky-dragon-staff':dragonMonk};

export function astralRelicHunter(k,weapon,mobile,build){
  return astral[weapon.id]?.(k,weapon,mobile,build)??null;
}
