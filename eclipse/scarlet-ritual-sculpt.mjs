import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {carvedFace} from './catalogue-a-face.mjs?v=maskwork-1';

export const scarletRitualFinishes={
  scarletFlesh:[0x956449,.07,.68,'hide'],scarletCrown:[0xa06d40,.66,.47,'bronze'],
  scarletCloth:[0x703c2d,.19,.64,'cloth'],scarletFur:[0xbeb7a7,.06,.76,'hide'],
  scarletIndigo:[0x2b3143,.34,.53,'iron'],scarletCoal:[0x392b34,.22,.71,'stone'],
};

export function carveScarletRitual(k,entry,mobile){
  const {root,bone,mesh,geometry,sculpt}=k;
  const body=bone(root,0,1.05,0),head=bone(body,0,.886,.080),crown=bone(head,0,.193,-.026);
  const skirt=bone(body,0,-.202,-.052),pyre=bone(root,0,.20,-.104);
  const arms=[],limbs=[],stoles=[],coals=[];
  const form=(j,m,path,seed=0)=>geometry(j,m,sculptVolume(path,{
    rings:mobile?13:20,sides:mobile?10:16,section:2.43,ridge:.23,seed,
  }));
  const line=(j,m,path)=>sculpt.sweep(j,m,path,{steps:13,sides:7,ridge:.21});
  const rim=(j,m,p,d=.04)=>sculpt.plate(j,m,p,d,.014);
  form(body,'scarletIndigo',[[0,-.243,-.038,.182,.167],[0,-.07,-.021,.253,.224],
    [0,.207,-.007,.297,.251],[0,.468,-.02,.353,.228],[0,.63,-.016,.265,.178],[0,.75,.011,.104,.105]],3.62);
  form(skirt,'scarletCloth',[[0,-.37,-.032,.314,.222],[0,-.268,-.017,.42,.263],[0,-.014,.011,.348,.232],
    [0,.165,.02,.24,.174]],8.43);
  const {jaw}=carvedFace(k,head,{style:'soldier',width:.323,finish:'scarletFlesh',lids:'scarletFlesh',
    brow:'scarletCoal',dark:'deep',eye:'glow',detailed:!mobile});
  form(crown,'scarletCrown',[[0,-.029,-.021,.148,.131],[0,.061,-.008,.166,.136],
    [.023,.199,-.057,.128,.104],[.035,.345,-.093,.091,.081],[.041,.491,-.122,.028,.039]],8.61);
  form(pyre,'scarletCoal',[[0,-.087,-.011,.411,.30],[0,.028,-.01,.528,.414],[0,.171,-.019,.537,.398],
    [0,.255,-.065,.424,.338],[0,.319,-.078,.264,.217]],4.3);
  for(let i=0;i<(mobile?9:15);i++){
    const a=i*Math.PI*2/(mobile?9:15),x=Math.sin(a),z=Math.cos(a);
    const coal=bone(pyre,x*.451,.10+Math.sin(a*2)*.021,z*.34);
    coal.name='腐墨室・裁燈使 · 焦雲火片';
    coal.rotation.y=a;
    form(coal,i%3?'scarletCoal':'scarletCloth',[[0,-.046,.024,.11,.093],
      [.012,.040,.028,.157,.104],[.062,.122,.015,.132,.094],[.143,.208,-.061,.033,.014]],.71*i);
    line(coal,i%4?'scarletCrown':'glow',[[.01,.049,.093,.007],[.091,.071,.072,.013],
      [.103,.151,.037,.012],[.135,.181,-.003,.004]]);
    coals.push({coal,a});
  }
  for(const side of [-1,1]){
    const flip=path=>path.map(([x,...r])=>[side*x,...r]);
    const y=side===1?.064:.019;
    const spike=flip([[.066,.099,.06,.061],[.119,.212,.055,.067],
      [.193,.339+y,.017,.043],[.238,.494+y,-.08,.035],[.274,.586+y,-.155,.005]]);
    form(crown,side===1?'scarletCrown':'scarletCloth',spike,1.88+side);
    line(crown,'scarletCrown',spike.map(([x,y,z,r])=>[x+side*.015,y+.023,z+.019,r*.29]));
    const shoulder=bone(body,side*.329,.551,.031),elbow=bone(shoulder,side*.080,-.396,.035);
    const palm=bone(elbow,side*.035,-.320,.074);
    arms.push(shoulder);limbs.push({forearm:elbow,side});
    form(shoulder,'scarletIndigo',flip([[.071,-.412,.079,.098,.107],[.093,-.234,.049,.152,.146],
      [.068,-.069,-.015,.167,.158],[.022,.129,-.036,.116,.121]]),6*side);
    form(elbow,'scarletCloth',flip([[.031,-.322,.065,.077,.080],[.061,-.196,.045,.105,.112],
      [.049,-.055,.019,.122,.118],[.01,.073,.012,.093,.086]]),7*side);
    form(palm,'scarletFlesh',[[0,-.111,.051,.077,.070],[0,-.033,.053,.101,.086],[0,.073,.004,.073,.063]]);
    const coil=bone(shoulder,side*.024,.059,-.08);
    coil.name='腐墨室・裁燈使 · 月白披肩';
    form(coil,'scarletFur',flip([[.018,.086,.107,.061,.085],[.122,.167,.009,.097,.106],
      [.198,.11,-.097,.135,.102],[.226,-.069,-.14,.14,.092],[.201,-.218,-.123,.101,.061],
      [.176,-.331,-.073,.027,.026]]),2.42+side);
    for(let i=0;i<4;i++){
      const width=.045+i*.059,y=.567-i*.11,z=-.223-i*.031;
      rim(body,i%2?'scarletIndigo':'scarletCrown',flip([[.039,y+.064,z+.034],[width,y+.10,z-.015],
        [width+.078,y+.061,z-.093],[width+.085,y-.067,z-.101],[.084,y-.071,z-.082],[.025,y-.009,z+.017]]));
    }
    stoles.push({coil,side});
  }
  const focus=bone(limbs[1].forearm,.045,-.23,.126);
  focus.name='腐墨室・裁燈使 · 火雲法輪';
  mesh(focus,'ring','scarletCrown',0,.067,.014,.194,.185,.61,.19);
  mesh(focus,'ring','scarletIndigo',0,.072,.025,.145,.139,.40,.19);
  mesh(focus,'gem','glow',0,.063,.069,.057,.079,.036,0,.29,.08);
  return {body,head,arms,limbs,crest:bone(root,0,0,0),sourceSculpt:true,catalogueSculpt:entry.id,pattern:'hover',
    polishEnergy:{tint:0xee904d,shape:'embers',anchor:pyre,span:[.93,.73,.76],offset:[0,.38,0]},
    sourceDress(tools){
      for(const side of [-1,1]){
        const band=side*.14;
        tools.silk(skirt,'腐墨室・裁燈使 · 赤朱暗紋裙',[[band,.173,.215,.106],[band*1.41,-.009,.270,.139],
          [band*1.72,-.174,.355,.128],[band*2.18,-.355,.386,.119],[band*2.41,-.45,.492,.021]],
          {tint:0x8d4834,trim:0xc19265,lining:0x3d3848,style:'woven',phase:side*.78,flex:1.10});
        tools.silk(body,'腐墨室・裁燈使 · 白巾',[[side*.204,.641,-.183,.088],[side*.259,.447,-.328,.150],
          [side*.314,.14,-.427,.171],[side*.373,-.23,-.491,.143],[side*.40,-.55,-.628,.022]],
          {tint:0x9c9a87,trim:0xcb9765,lining:0x554a4e,style:'woven',phase:side*1.19,flex:1.29});
      }
      return true;
    },
    cataloguePose({beat,headtime,wind,strike,travel,stage,fall}){
      arms[1].rotation.x=-.54-wind*.69-strike*.14;
      arms[0].rotation.x=-.32+wind*.36-strike*.38;
      jaw.rotation.x=.023+wind*.18+strike*.35;
      focus.rotation.z=headtime*.95+strike*.89;
      pyre.rotation.y=headtime*.35+strike*.25;
      pyre.position.y=.2+Math.sin(beat*.87)*.06+stage*.08+strike*.15-fall*.16;
      for(const {coil,side} of stoles)coil.rotation.x=Math.sin(beat*.77+side)*.062+travel*.21+wind*.23-strike*.27;
      for(const {coal,a} of coals){
        const swell=Math.sin(headtime*2.7-a*.76);
        coal.position.y=.09+swell*.065+wind*.04+strike*.12;
        coal.rotation.z=swell*.14+stage*.09+strike*.24;
      }
    },
  };
}
