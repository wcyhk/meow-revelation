import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const line=(k,j,m,p,n=12)=>k.sculpt.sweep(j,m,p,{steps:n,sides:7,ridge:.22});
const plate=(k,j,m,points,depth=.043)=>k.sculpt.plate(j,m,points,depth,.016);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?11:17,rings:mobile?14:22,section:2.32,ridge:.18,seed,
}));

const hunters={
  'glacier-sword':{form:'blade',broad:.34,ground:1.22,neck:.90,armLength:.80,
    helmet:[.157,.276,.346,.156],cloth:0x315268,dark:0x182b42,metal:0xa2b7c4,edge:0xd6eeef,crest:0x69def4,
    crestSide:1,flare:.53,tail:1.18,shape:'bolts'},
  'snow-axe':{form:'axes',broad:.54,ground:.93,neck:.70,armLength:.84,
    helmet:[.253,.246,.249,.218],cloth:0x6e523c,dark:0x262528,metal:0x596966,edge:0xa59476,crest:0xbedef2,
    crestSide:-1,flare:.66,tail:.78,shape:'mist'},
  'red-corporal':{form:'red',broad:.40,ground:1.08,neck:.84,armLength:.78,
    helmet:[.193,.255,.320,.163],cloth:0x803631,dark:0x292833,metal:0x704034,edge:0xcfa480,crest:0xf18c70,
    crestSide:-1,flare:.54,tail:.97,shape:'embers'},
  'blue-corporal':{form:'blue',broad:.43,ground:1.15,neck:.91,armLength:.79,
    helmet:[.179,.272,.336,.172],cloth:0x234c70,dark:0x1c2e3a,metal:0x526a7c,edge:0xc1c8aa,crest:0x80d5ec,
    crestSide:1,flare:.64,tail:1.10,shape:'ribbons'},
};

function materialSet(k,profile){
  for(const [id,tone,metalness,roughness,type] of [
    ['hunterDark',profile.dark,.33,.64,'iron'],['hunterShell',profile.metal,.64,.47,'iron'],
    ['hunterBright',profile.edge,.68,.44,profile.form==='axes'?'bronze':'iron'],
    ['hunterCoat',profile.cloth,.08,.76,'cloth'],
  ]){
    const material=new T.MeshStandardMaterial({color:tone,metalness,roughness,vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:metalness>.4?.69:.22});
    k.materials[id]=paintedFinish(material,type,true,true);
  }
}

function visage(k,head,profile,mobile){
  const {form,helmet:[breadth,z,peak,cheek],crestSide}=profile;
  const strong=form==='axes';
  head.name='神器守護者 · 頭兜';
  cast(k,head,'hunterDark',[[0,-.211,.012,breadth*.52,.109],[0,-.082,-.014,breadth*.96,.175],
    [0,.068,-.04,breadth,.197],[0,.224,-.067,breadth*.91,.177],
    [0,peak,-.089,breadth*.57,.093],[0,peak+.049,-.102,.031,.053]],mobile);
  for(const side of sides){
    const f=x=>side*x;
    const lower=strong?.294:.201,flare=side===crestSide?.056:0;
    const mask=[[f(.016),.153,z+.022],[f(breadth*.71),.128,z-.033],[f(breadth*1.06+flare),.043,z-.146],
      [f(breadth*1.16+flare),-.117,z-.205],[f(cheek),-lower,z-.049],
      [f(.092),-.244,z+.041],[f(.038),-.069,z+.044]];
    plate(k,head,'hunterShell',mask,.052);
    line(k,head,'hunterBright',[[f(.030),.122,z+.064,.014],[f(.092),.149,z+.048,.034],
      [f(breadth*.85),.160,z-.045,.032],[f(breadth*1.10),.127,z-.143,.019],
      [f(breadth*1.19),.093,z-.182,.004]],14);
    line(k,head,'glow',[[f(.035),.056,z+.067,.007],[f(.085),.075,z+.056,.012],
      [f(breadth*.75),.087,z+.016,.010],[f(breadth*.92),.086,z-.045,.004]]);
    line(k,head,'hunterBright',mask.slice(2,6).map(([x,y,d],i)=>[x,y+.021,d+.025,[.014,.022,.018,.004][i]]));
    for(let i=0;i<(mobile?3:4);i++){
      const y=.157-i*.083,x=breadth+flare*.64;
      const nape=[[f(x*.83),y+.095,-.064],[f(x*1.13),y+.083,-.148],[f(x*.91),y+.021,-.261],
        [f(x*.48),y-.039,-.294],[f(.032),y-.073,-.285],[f(.026),y+.006,-.278]];
      plate(k,head,i%2?'hunterBright':'hunterShell',nape,.040);
      line(k,head,'hunterCoat',nape.slice(1,5).map(([x,h,d])=>[x,h+.007,d-.024,.009]));
    }
    const ridge=form==='blade'?[[.124,.191,.031,.046],[.198,.338,-.09,.063],[.262,.534,-.199,.044],[.247,.661,-.283,.005]]:
      strong?[[.174,.191,-.01,.071],[.321,.304,-.13,.091],[.406,.440,-.134,.061],[.350,.469,-.052,.006]]:
        form==='red'?[[.085,.258,.012,.035],[.124,.425,-.081,.050],[.156,.57,-.233,.030],[.234,.62,-.345,.005]]:
          [[.14,.211,-.07,.036],[.212,.34,-.169,.061],[.321,.507,-.300,.039],[.367,.528,-.446,.005]];
    cast(k,head,side===crestSide?'hunterBright':'hunterShell',mirror(side,ridge.map(([x,y,d,r])=>[x,y,d,r,r*.81])),mobile,side);
  }
}

function gear(k,joint,form,right,mobile){
  const spear=form==='blue'||form==='red',axe=form==='axes';
  const span=spear?1.68:axe?1.11:1.39,bladeWidth=spear?(form==='red'?.111:.141):axe?.40:.217;
  const sideways=axe&&!right?-1:1;
  const tip=[axe?.398*sideways:0,span+.19,.186];
  markEnemyWeapon(joint,tip,{from:[0,-.36,.076],width:bladeWidth*.91});
  line(k,joint,'hunterDark',[[0,-.71,-.034,.035],[0,-.33,.028,.041],[0,.051,.066,.041],
    [0,.34,.104,.046],[0,span*.65,.137,.042]],16);
  const blade=axe?[[0,.721,.125],[.252,.741,.152],[.404,.964,.165],[.398,1.278,.123],[.137,1.277,.10],
    [.026,1.147,.123],[-.067,.934,.165]]:
    [[0,span+.193,.166],[bladeWidth,span-.062,.179],[bladeWidth*.69,span-.342,.158],
      [bladeWidth*.83,span*.47,.173],[-bladeWidth*.64,span*.42,.224],[-bladeWidth*.82,span-.264,.178],
      [-bladeWidth*.64,span-.04,.178]];
  const outline=mirror(sideways,blade);
  plate(k,joint,'hunterShell',outline,.061);
  plate(k,joint,'hunterBright',outline.map(([x,y,z],i)=>[x*.91,y-.007,z+.037+i%3*.007]),.020);
  line(k,joint,'glow',outline.slice(0,4).map(([x,y,z],i)=>[x*.80,y-.011,z+.058,[.004,.020,.017,.005][i]]),14);
  for(const side of sides){
    const quillon=mirror(side,[[0,span*.41,.097,.047],[bladeWidth*.58,span*.465,.148,.062],
      [bladeWidth*1.13,span*.438,.213,.046],[bladeWidth*1.44,span*.471,.196,.006]]);
    line(k,joint,'hunterBright',quillon,13);
    for(let i=0;i<(mobile?3:5);i++){
      const y=.12+i*.094;
      k.mesh(joint,'ring',i%2?'hunterBright':'hunterCoat',0,y,.08+.013*i,.053,.059,.68,Math.PI*.5,.077);
    }
  }
}

function mantle(k,body,back,profile,mobile,flaps){
  const {form,broad,flare,crestSide}=profile;
  for(const side of sides){
    for(let plateIndex=0;plateIndex<4;plateIndex++){
      const y=.516-plateIndex*.158,w=broad*(1.02-plateIndex*.073);
      const thrust=(side===crestSide?flare*.35:.07);
      const shield=mirror(side,[[.025,y+.118,.287],[w*.62,y+.151,.235],[w+thrust,y+.035,.103],
        [w*1.10,y-.112,-.129],[w*.83,y-.179,-.233],[.043,y-.091,-.268]]);
      plate(k,body,plateIndex%2?'hunterDark':'hunterShell',shield,.061);
      line(k,body,'hunterBright',shield.slice(1,6).map(([x,h,z],i)=>[x,h+.018,z-.017,[.016,.029,.022,.018,.005][i]]));
    }
    const spine=k.bone(back,side*(broad*.43),.43,-.130);
    spine.name='神器守護者 · 活動背鎧';
    const castLine=form==='blade'?[[.016,.04,0,.047,.052],[.073,.275,-.096,.091,.060],[.122,.613,-.227,.065,.041],[.104,.839,-.350,.004,.005]]:
      form==='axes'?[[.014,-.04,.031,.045,.059],[.14,.128,-.203,.107,.073],[.273,.253,-.307,.065,.049],[.377,.17,-.395,.005,.006]]:
        form==='red'?[[.023,.029,.012,.039,.053],[.104,.237,-.090,.061,.061],[.203,.537,-.176,.053,.039],[.321,.695,-.31,.004,.006]]:
          [[.017,.021,.02,.051,.064],[.202,.192,-.12,.106,.052],[.348,.342,-.237,.090,.045],[.436,.344,-.399,.005,.005]];
    const castPath=mirror(side,castLine);
    cast(k,spine,'hunterShell',castPath,mobile,side);
    line(k,spine,'hunterBright',castPath.map(([x,y,z,r])=>[x,y+.037,z+.032,r*.35]));
    flaps.push({joint:spine,axis:'z',amp:.12,bias:side*.035,seed:side*.87});
  }
}

export function armoredRelicHunter(k,weapon,mobile,fighter){
  const design=hunters[weapon.id];
  if(!design)return null;
  materialSet(k,design);
  const {form,broad,ground,neck,armLength,cloth,edge,tail,crest,shape}=design;
  const model=fighter(k,{broad,ground,neck,armLength,style:form==='axes'?'heavy':'duel',finish:'hunterCoat',mobile,
    portrait(k,head){visage(k,head,design,mobile);},
    weapon(k,body,back,head,grips,flaps){
      mantle(k,body,back,design,mobile,flaps);
      gear(k,grips[1],form,true,mobile);
      if(form==='axes')gear(k,grips[0],form,false,mobile);
    }});
  model.polishEnergy={tint:crest,shape,anchor:model.body,offset:[0,.49,-.11],span:[broad+.49,neck*.89,.79]};
  model.relicDress=tools=>{
    for(const side of sides){
      for(let i=0;i<3;i++){
        const x=.046+i*.102,w=.098+i*.022,fall=tail*(1+i*.089);
        tools.silk(model.body,weapon.guardian.name+' · 兵甲下襟 '+side+' '+(i+1),mirror(side,[
          [x,.26,-.202+i*.13,w*.63],[x+.045,.082,-.24+i*.19,w],
          [x+.134,-fall*.39,-.31+i*.21,w*.94],[x+.196,-fall*.69,-.49+i*.24,w*.77],
          [x+.230,-fall,-.61+i*.29,w*.16],
        ]),{style:'woven',tint:cloth,trim:edge,lining:design.dark,phase:i*.90+side*.67,flex:1.12+i*.21});
      }
      const strap=form==='red'||form==='blue';
      if(strap)tools.silk(model.back,weapon.guardian.name+' · 軍幡 '+side,mirror(side,[
        [.111,.504,-.107,.039],[.243,.365,-.284,.082],
        [.361,.102,-.463,.095],[.479,-.207,-.681,.082],[.597,-.483,-.938,.031],
      ]),{style:'woven',tint:cloth,trim:edge,lining:design.dark,phase:side*.77,flex:1.42});
    }
    return true;
  };
  return model;
}
