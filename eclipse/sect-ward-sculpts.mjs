import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(s,track)=>track.map(([x,...rest])=>[s*x,...rest]);
const volume=(k,j,m,path,mob,seed=0,section=2.33,fur=false)=>k.geometry(j,m,
  sculptVolume(path,{rings:mob?10:16,sides:mob?10:14,section,seed,fur,ridge:.15}));
const plate=(k,j,m,path,depth=.046)=>k.sculpt.plate(j,m,path,depth,depth*.34);
const seam=(k,j,m,path,mob)=>k.sculpt.sweep(j,m,path,{steps:mob?8:13,sides:mob?5:7,ridge:.18});
function pivot(k,parent,name,x,y,z){
  const joint=k.bone(parent,x,y,z);
  joint.name=name;
  return joint;
}

function silk(body,name,path,{tint,trim,lining,phase,flex,across}){
  return {parent:body,name,path,tint,trim,lining,phase,flex,across};
}

function carveSageBeard(k,head,mob){
  const braid=[];
  for(const s of sides){
    const f=p=>reflect(s,p);
    const temple=pivot(k,head,'Sage talc-silver sideburn '+s,s*.142,.108,-.014);
    volume(k,temple,'bBone',f([[0,.089,-.037,.048,.051],[.02,.007,.002,.052,.048],
      [.022,-.154,.041,.032,.044],[.014,-.241,.081,.005,.009]]),mob,8.64+s,2.27,true);
    seam(k,temple,'bHair',f([[.029,.038,.033,.007],[.062,-.087,.037,.012],[.036,-.188,.077,.007]]),mob);
    for(let i=0;i<4;i++){
      const x=.029+i*.031,spread=(.043+i*.024)*s,path=[
        [s*x,-.078-i*.012,.235-i*.012,.037-i*.003,.039-i*.004],
        [s*x,-.19-i*.018,.277+i*.019,.061-i*.007,.043-i*.004],
        [s*x+spread*.44,-.359-i*.023,.294-.011*i,.055-i*.006,.036-i*.003],
        [s*x+spread,-.539-i*.024,.332-.025*i,.031-i*.004,.023-i*.003],
        [s*x+spread*.81,-.664+i*.043,.363+.016*i,.004,.005],
      ];
      const lock=pivot(k,head,'Sage divided beard lock '+s+' '+i,s*.011,-.016,0);
      volume(k,lock,i===3?'bTrim':'bBone',path,mob,7.12+i*.651+s,2.79,true);
      seam(k,lock,i%3?'bBone':'bTrim',path.slice(1,4).map(([x,y,z,r],i)=>[x+s*.015,y+.019,z+.018,r*[.28,.44,.09][i]]),mob);
      braid.push({lock,s,i});
    }
    for(let g=0;g<3;g++){
      const at=s*(.042+.035*g);
      volume(k,head,'bBone',[[at,-.115,.282,.019,.022],[at+s*.022,-.131,.313,.024,.024],
        [at+s*.055,-.173,.298,.014,.018],[at+s*.069,-.216,.249,.004,.005]],true,6.82+g);
    }
    const tied=pivot(k,head,'Sage silver rear tie '+s,s*.109,.165,-.169);
    volume(k,tied,'bHair',f([[.002,.074,-.011,.033,.056],[.083,-.031,-.067,.064,.051],
      [.112,-.278,-.137,.057,.042],[.154,-.445,-.156,.019,.022],[.182,-.507,-.168,.005,.006]]),mob,13.12+s,2.64,true);
    seam(k,tied,'bBone',f([[.051,-.027,-.151,.008],[.093,-.25,-.191,.017],
      [.153,-.413,-.206,.011],[.169,-.473,-.192,.004]]),mob);
  }
  return ({beat,wind,strike,travel})=>{
    for(const {lock,s,i} of braid){
      lock.rotation.set(travel*.19+wind*.073-strike*.21+Math.sin(beat*.92+i*.34)*.045,
        s*(wind*.07-strike*.06),s*(Math.sin(beat*.72+i*.56)*.047+strike*.11));
    }
  };
}

function sageWard(k,body,head,mob){
  const beard=carveSageBeard(k,head,mob),silks=[],bundles=[];
  volume(k,body,'bFlesh',[[0,-.219,-.043,.255,.214],[.016,.002,-.058,.325,.271],[.015,.236,-.04,.423,.302],
    [.004,.485,-.026,.480,.298],[0,.684,-.043,.395,.245],[.016,.829,-.01,.171,.132]],mob,18.3,2.34);
  volume(k,body,'bCloth',[[0,-.211,-.071,.26,.222],[-.02,-.156,-.073,.335,.284],[.014,-.056,-.04,.352,.293],
    [-.014,.077,-.035,.315,.266],[0,.14,-.05,.284,.227]],mob,13.8);
  for(const s of sides){
    const f=p=>reflect(s,p),covered=s>0;
    const pec=pivot(k,body,'Sage shoulder tendon '+s,s*.144,.551,.144);
    volume(k,pec,'bFlesh',f([[-.073,-.126,.096,.056,.055],[.035,-.076,.12,.102,.089],
      [.174,-.037,.071,.115,.084],[.254,.062,-.002,.085,.077],[.29,.14,-.082,.054,.053]]),mob,12.4+s);
    const scapula=pivot(k,body,'Sage articulated scapula '+s,s*.185,.49,-.268);
    volume(k,scapula,'bFlesh',f([[.101,.171,.071,.066,.069],[.155,.059,-.036,.113,.076],
      [.098,-.081,-.067,.093,.058],[.043,-.232,-.052,.042,.036],[.012,-.324,-.018,.027,.022]]),mob,22.1+s);
    const collar=f([[.013,.702,.226],[.186,.766,.179],[.392,.684,.054],[.438,.461,.093],
      [.34,.332,.222],[.152,.503,.271],[.047,.412,.298]]);
    if(covered){
      plate(k,body,'bCloth',collar.map(([x,y,z])=>[x,y,z+.049]),.063);
      seam(k,body,'bTrim',collar.slice(0,6).map(([x,y,z],i)=>[x,y+.02,z+.082,[.01,.021,.032,.021,.015,.003][i]]),mob);
    }else{
      const binding=f([[.026,.109,.307],[.185,.103,.278],[.381,.258,.214],[.424,.364,.021],
        [.359,.383,-.078],[.263,.266,.146],[.102,.162,.285]]);
      plate(k,body,'bWood',binding,.032);
    }
    for(let rib=0;rib<3;rib++){
      const y=.322-rib*.081,r=.20-rib*.023;
      const line=f([[.049,y,.228,.016],[r*.55,y+.019,.273,.038],[r,y+.063,.238,.041],
        [r*1.54,y+.93*.103,.172,.012]]);
      volume(k,body,covered?'bCloth':'bFlesh',line.map(([x,y,z,w])=>[x,y,z,w,w*.78]),mob,rib+21.72);
    }
    const bundle=pivot(k,body,'Sage knotted robe clasp '+s,s*.242,.067,-.127);
    volume(k,bundle,'bWood',f([[.016,.12,.063,.048,.067],[.104,.057,-.026,.078,.079],
      [.116,-.052,-.043,.067,.064],[.072,-.146,-.072,.017,.022]]),mob,1.25+s);
    seam(k,bundle,'bTrim',f([[.013,.01,.027,.009],[.085,-.02,-.09,.021],[.144,-.065,-.061,.017],[.126,-.157,-.095,.008]]),mob);
    for(let i=0;i<3;i++){
      const x=.108+i*.038, y=.104-i*.109,z=-.149-i*.026;
      const start=[s*x,y+.02,z],mid=[s*(x+.13),y+.11,z-.11],tip=[s*(x+.18),y+.17,z-.24];
      k.geometry(bundle,i%2?'bInlay':'bCloth',featherVane(start,mid,tip,.056+i*.009,13.1+i*.86,mob?7:12));
      seam(k,bundle,'bTrim',[[...start,.008],[...mid,.019],[...tip,.004]],mob);
    }
    silks.push(
      silk(body,'道士・必 · 不對稱織袍 '+s,f([[.188,.126,.228,.073],[.242,-.179,.324,.138],
        [.31,-.444,.331,.153],[.368,-.773+s*.125,.344,.047]]),
        {tint:covered?0x9b632c:0x615229,trim:0xcb9b4b,lining:0x3d2824,phase:s*.86,flex:.84,across:[.98,.03,-.19*s]}),
      silk(body,'道士・必 · 打結背帶 '+s,f([[.14,.457,-.325,.098],[.273,.183,-.449,.154],
        [.413,-.239,-.549,.156],[.461,-.737-s*.09,-.537,.071]]),
        {tint:covered?0x6a783e:0x526239,trim:0xc3a062,lining:0x373a29,phase:s*.58,flex:.81,across:[.76,.04,-.62*s]}),
    );
    bundles.push({pec,scapula,bundle,s});
  }
  const arms=limbs=>{
    for(const {root,elbow,hand,side:s} of limbs){
      const f=path=>reflect(s,path),r=s<0?.212:.18;
      volume(k,root,'bFlesh',f([[0,.135,-.045,r*.54,r*.67],[.058,.015,-.034,r,r*.91],
        [.096,-.163,.018,r*.81,r*.72],[.091,-.363,.055,r*.49,r*.59]]),mob,4.7+s);
      volume(k,elbow,'bFlesh',f([[0,.038,.023,r*.45,r*.56],[.026,-.074,.077,r*.82,r*.72],
        [.041,-.185,.121,r*.63,r*.61],[.041,-.333,.126,r*.39,r*.43]]),mob,6.57+s);
      const band=f([[-.074,-.126,.123],[.119,-.116,.147],[.156,-.197,.148],[.142,-.314,.152],
        [.073,-.352,.173],[-.067,-.264,.173]]);
      plate(k,elbow,s<0?'bCloth':'bWood',band,.033);
      seam(k,elbow,'bTrim',band.slice(1,5).map(([x,y,z],i)=>[x,y+.009,z+.018,[.008,.017,.013,.005][i]]),mob);
      volume(k,hand,'bFlesh',f([[0,.039,.021,.058,.047],[.02,-.03,.056,.074,.067],
        [.054,-.077,.103,.059,.073],[.029,-.137,.127,.033,.047]]),mob,18.8+s);
    }
  };
  return {silks,fitArms:arms,pose(sample){
    const {beat,wind,strike,travel}=sample;
    beard(sample);
    for(const {pec,scapula,bundle,s} of bundles){
      pec.rotation.y=s*(Math.sin(beat*.51)*.043+wind*.087-strike*.11);
      scapula.rotation.x=travel*.035+wind*.092-strike*.143;
      bundle.rotation.z=s*(wind*.12-strike*.26);
    }
  }};
}

const sects={
  m063:{
    title:'幻炎 · 燼紅羽衣',width:.397,seed:21.8,ink:0x76392d,outer:0x281d2c,trim:0xe0a55c,
    front:[[.099,.436,.31,.086],[.169,-.009,.355,.126],[.187,-.467,.44,.161],[.336,-1.042,.465,.087]],
    rear:[[.185,.648,-.251,.101],[.287,.271,-.383,.165],[.418,-.253,-.485,.218],[.619,-.857,-.592,.084]],
    side:[[.292,.448,-.071,.069],[.348,.027,-.166,.111],[.434,-.455,-.245,.176],[.511,-.881,-.341,.048]],
    flank:[.228,.043,.182,-.210],braid:.91,offset:.098,cut:'fire',
  },
  m064:{
    title:'污水 · 層冰潮紋',width:.390,seed:29.5,ink:0x244e85,outer:0x1b2b54,trim:0x94c9db,
    front:[[.116,.352,.294,.084],[.162,-.018,.354,.128],[.235,-.554,.405,.179],[.273,-1.159,.423,.068]],
    rear:[[.183,.665,-.289,.111],[.297,.317,-.445,.166],[.336,-.267,-.556,.19],[.426,-1.107,-.75,.154]],
    side:[[.233,.510,-.146,.078],[.322,.104,-.316,.124],[.514,-.424,-.448,.175],[.58,-.89,-.50,.104]],
    flank:[.189,.077,.253,-.168],braid:.65,offset:.076,cut:'ice',
  },
  m065:{
    title:'毒風 · 葉繡長襟',width:.324,seed:31.7,ink:0x526336,outer:0x232c22,trim:0xb8c677,
    front:[[.082,.485,.255,.072],[.118,.071,.314,.117],[.186,-.46,.389,.131],[.24,-1.135,.412,.072]],
    rear:[[.141,.531,-.18,.081],[.186,.266,-.336,.137],[.338,-.328,-.534,.196],[.611,-.907,-.669,.054]],
    side:[[.174,.321,-.065,.061],[.28,-.048,-.165,.122],[.413,-.442,-.311,.116],[.632,-.754,-.471,.034]],
    flank:[.298,.025,.227,-.316],braid:1.42,offset:.158,cut:'wind',
  },
  m066:{
    title:'暗電 · 鎏金重領',width:.374,seed:34.1,ink:0x7e6131,outer:0x292733,trim:0xe4bb67,
    front:[[.102,.51,.289,.09],[.173,.046,.354,.114],[.214,-.517,.386,.137],[.346,-1.104,.356,.093]],
    rear:[[.169,.671,-.234,.101],[.263,.292,-.405,.175],[.374,-.201,-.458,.192],[.536,-1.059,-.597,.101]],
    side:[[.279,.468,-.132,.083],[.372,.128,-.251,.121],[.468,-.308,-.366,.153],[.547,-.925,-.43,.086]],
    flank:[.192,.072,.191,-.133],braid:.72,offset:.048,cut:'thunder',
  },
};

function sectArmour(k,body,d,mob){
  const w=d.width,flex=d.braid,silks=[],hinges=[];
  volume(k,body,'bShadow',[[0,-.183,-.03,w*.54,w*.48],[.007,.034,-.037,w*.63,w*.55],[.007,.315,-.019,w*.818,w*.6],
    [0,.547,-.024,w*.94,w*.67],[0,.721,-.035,w*.69,w*.51],[0,.83,-.02,w*.41,w*.35]],mob,d.seed);
  for(const s of sides){
    const f=p=>reflect(s,p);
    const breast=pivot(k,body,d.title+' 胸甲 '+s,s*.043,.437,.087);
    const c=f([[.005,.226,.154],[w*.42,.248,.148],[w*.86,.181,.046],[w,.029,-.073],[w*.76,-.129,.07],
      [w*.43,-.186,.178],[.015,-.119,.233]]);
    plate(k,breast,s<0&&d.cut==='wind'?'bCloth':'bMetal',c,.061);
    seam(k,breast,'bTrim',c.slice(0,5).map(([x,y,z],i)=>[x,y+.022,z+.038,[.006,.026,.028,.016,.003][i]]),mob);
    hinges.push({j:breast,s,i:0});
    const [wide,shift,rise,drop]=d.flank;
    const quantity=d.cut==='ice'?5:d.cut==='fire'?4:d.cut==='wind'?3:4;
    for(let i=0;i<quantity;i++){
      const y=.586-i*.128,z=-.293-i*.028,w=wide-i*.016;
      const j=pivot(k,body,d.title+' 側背扣 '+s+' '+(i+1),s*(.059+i*shift*.49),y,z);
      const p=f([[.013,.097,-.07],[w*.54,rise,-.032],[w*1.14,rise*.76,-.033],[w*1.34,.003,-.146-i*.013],
        [w*.93,drop*.74,-.216],[w*.38,drop,-.172],[.019,-.069,-.102]]);
      plate(k,j,i%2?'bOxide':'bMetal',p,.041);
      seam(k,j,d.cut==='ice'?'bBone':'bTrim',p.slice(1,6).map(([x,y,z],c)=>[x,y,z-.036,[.007,.017,.024,.016,.005][c]]),mob);
      if(d.cut==='wind'||d.cut==='fire'){
        const start=[s*w*.42,rise*.6,-.068],mid=[s*w*1.04,.021,-.169],last=[s*w*1.48,drop*.91,-.287];
        k.geometry(j,i%2?'bCloth':'bInlay',featherVane(start,mid,last,.079+i*.008,d.seed+i*.73,mob?7:11));
      }
      if(d.cut==='thunder')k.mesh(j,'gem','bInlay',s*w*.84,.017,-.16,.041,.056,.032,0,s*.28,s*.18);
      hinges.push({j,s,i:i+1});
    }
    const front=f(d.front.map(([x,y,z,a],i)=>[x+s*d.offset*i*.31,y+s*d.offset*i*.118,z,a]));
    const rear=f(d.rear.map(([x,y,z,a],i)=>[x+s*d.offset*i*.61,y-s*d.offset*i*.13,z,a]));
    const side=f(d.side.map(([x,y,z,a],i)=>[x-s*d.offset*i*.22,y+s*d.offset*i*.27,z,a]));
    silks.push(
      silk(body,d.title+' 前襟 '+s,front,{tint:d.ink,trim:d.trim,lining:d.outer,
        phase:s*.71,flex:.69*flex,across:[.98,.034,s*.12]}),
      silk(body,d.title+' 背襬 '+s,rear,{tint:d.outer,trim:d.trim,lining:d.ink,
        phase:s*.97,flex,across:[.96,.025,-s*.27]}),
      silk(body,d.title+' 側脇 '+s,side,{tint:d.ink,trim:d.trim,lining:d.outer,
        phase:s*1.24,flex:.90*flex,across:[.62,.07,-s*.72]}),
    );
  }
  return {silks,pose({beat,wind,strike,travel}){
    for(const {j,s,i} of hinges){
      j.rotation.x=Math.sin(beat*.69+i*.48)*.043+wind*.093-strike*.174;
      j.rotation.z=s*(wind*.11-strike*.083+travel*.035);
    }
  }};
}

export function carveSectWard(k,entry,body,head,mobile){
  if(entry.id==='m078')return sageWard(k,body,head,mobile);
  const style=sects[entry.id];
  return style?sectArmour(k,body,style,mobile):null;
}
