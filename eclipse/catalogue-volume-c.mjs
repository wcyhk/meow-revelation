import * as T from '../three.min.mjs';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {backFeathers,beastRelief,championRelief,creaturePatinas,curvedPlate,designsC,membraneRelief,serpentRelief} from './catalogue-c-detail.mjs?v=penumbra-1';

const sides=[-1,1];
const tau=Math.PI*2;
const vector=point=>new T.Vector3(...point);
const skin=(k,group,finish,sections,settings={})=>k.geometry(group,finish,
  sculptVolume(sections,{sides:11,rings:15,section:2.1,ridge:.13,...settings}));
const horn=(k,group,finish,points)=>k.sculpt.sweep(group,finish,points,{steps:9,sides:7,ridge:.16});
const plate=(k,group,finish,points,depth=.043)=>k.sculpt.plate(group,finish,points,depth,.013);
const blank=(k,body)=>k.bone(body,0,0,0);
const gem=(k,group,finish,position,size)=>k.mesh(group,'gem',finish,...position,...size);

function eye(k,head,x,y,z,size,finish='glow'){
  k.mesh(head,'round','deep',x,y,z,size*1.66,size*1.1,size*.65);
  k.mesh(head,'gem',finish,x,y+.01,z+size*.52,size,size*.54,size*.42);
}

function mouth(k,head,{width,length,brow,eyes,jaw,fangs=3,crest='rind',hide='hide'}){
  const muzzle=length*.72;
  skin(k,head,hide,[[0,-.09,-.28,width*.85,.20],[0,.035,-.12,width,.24],
    [0,-.024,.17,width*.92,.18],[0,-.090,muzzle,width*.70,.088],[0,-.11,length,width*.55,.044]],
  {rings:17,sides:14,section:2.55});
  const mandible=k.bone(head,0,-.16,.04);
  skin(k,mandible,'deep',[[0,-.006,-.15,width*.80,.042],[0,-.065,.19,width*.76,.071],
    [0,-.076,length*.74,width*.51,.047],[0,-.05,length*.91,width*.44,.036]],{section:2.55});
  skin(k,mandible,jaw,[[0,-.05,-.17,width*.64,.045],[0,-.104,.13,width*.69,.052],
    [0,-.103,length*.75,width*.51,.046],[0,-.053,length*.94,width*.39,.035]]);
  for(const side of sides){
    const x=side*width;
    horn(k,head,brow,[[x*.49,.095,muzzle*.79,.036],[x*.87,.142,.19,.061],[x*.97,.179,-.066,.081],
      [x*.75,.180,-.24,.027]]);
    eye(k,head,x*.74,.080,.212,eyes);
    horn(k,head,crest,[[x*.51,-.123,muzzle,.037],[x*.95,-.095,.126,.057],[x*1.03,.013,-.096,.058],
      [x*.74,-.014,-.30,.017]]);
    for(let i=0;i<fangs;i++){
      const z=length*.86-i*length*.81/fangs;
      horn(k,head,'edge',[[x*(.60+i*.07),-.128,z,.025],[x*(.59+i*.06),-.207,z+.015,.019],
        [x*(.56+i*.058),-.256+i*.011,z-.038,.002]]);
    }
  }
  k.mesh(head,'round','deep',0,-.087,length*.93,width*.48,.053,.082);
  for(const side of sides){
    const x=width*side;
    curvedPlate(k,head,crest,[[x*.91,-.048,-.26,.032,.037],[x*1.01,-.059,-.07,.037,.052],
      [x*.94,-.058,.099,.039,.041],[x*.72,-.082,muzzle*.87,.008,.014]]);
    horn(k,head,'deep',[[x*.96,-.094,-.17,.006],[x*.99,-.099,.013,.011],
      [x*.94,-.101,.18,.009],[x*.62,-.11,muzzle*1.04,.002]]);
  }
  return mandible;
}

function horns(k,head,points,finish='edge'){
  for(const side of sides)for(const chain of points){
    horn(k,head,finish,chain.map(([x,y,z,r])=>[x*side,y,z,r]));
  }
}

function ridges(k,part,center,width,count,finish='rind'){
  const track=new T.CatmullRomCurve3(center.map(vector));
  for(let i=0;i<count;i++){
    const t=(i+.12)/count;
    const p=track.getPointAt(t),r=width*(.66+.34*Math.sin(Math.PI*t));
    for(const side of sides){
      const x=side*r;
      plate(k,part,finish,[[p.x+x*.17,p.y+.013,p.z+.064],[p.x+x*.98,p.y-.054,p.z+.022],
        [p.x+x*.84,p.y-.065,p.z-.087],[p.x+x*.36,p.y+.042,p.z-.116],[p.x+x*.13,p.y+.061,p.z-.031]],.031);
    }
  }
}

function makeTail(k,body,sections,finish='hide',trim='rind'){
  const curve=new T.CatmullRomCurve3(sections.map(([x,y,z])=>vector([x,y,z])));
  const joints=[];
  for(let i=0;i<5;i++){
    const p=curve.getPointAt(i/5),bone=k.bone(body,p.x,p.y,p.z);
    const sweep=[];
    for(let j=0;j<5;j++){
      const t=Math.min(1,(i+j/4)/5+.013);
      const v=curve.getPointAt(t).sub(p);
      const radius=T.MathUtils.lerp(sections[0][3],sections.at(-1)[3],t*.72+t*t*.28);
      sweep.push([v.x,v.y,v.z,radius,radius*.71]);
    }
    skin(k,bone,finish,sweep,{rings:11,sides:10});
    ridges(k,bone,sweep.map(([x,y,z,r])=>[x,y+r*.52,z]),sweep[2][3]*.82,5,trim);
    joints.push(bone);
  }
  return joints;
}

function pelt(k,body,width,y,z,length,count,finish='silk',spread=.24){
  for(let i=0;i<count;i++){
    const t=i/(count-1),x=(t-.5)*width;
    const slash=length*(.65+.35*Math.cos((t-.48)*2.7))+Math.sin(i*4.7)*.079;
    skin(k,body,finish,[[x,y,z,.047,.035],[x*1.09,y-slash*.28,z-spread*.39,.067,.039],
      [x*1.21,y-slash*.75,z-spread*.84,.039,.024],[x*1.24-.051,y-slash,z-spread,.006,.005]],
    {rings:7,sides:6,section:2.75,ridge:.24,seed:i});
  }
}

const serpentProfiles={
  // Upright fan of eight dark plates over a low ring of coils.
  m116:{core:[[0,.19,.08,.27,.22],[0,.42,.25,.25,.22],[.09,.74,.37,.23,.19],
    [.11,1.03,.34,.22,.18],[0,1.44,.41,.16,.16],[0,1.91,.39,.15,.16]],
    path:[[0,.24,.03,.27],[-.77,.18,-.09,.24],[-.70,.18,-.65,.20],[.18,.17,-.84,.16],
      [.79,.25,-.34,.08],[.39,.37,.05,.014]],
    skull:[0,1.89,.38],width:.22,length:.39,eyes:.032,style:'hood',spines:8,
    antlers:[[[.17,.21,-.07,.042],[.23,.36,-.17,.039],[.31,.56,-.34,.012],[.30,.68,-.46,.003]]]},
  // Mottled upright asp. The tail lies sideways under the white belly and short snout.
  m126:{core:[[0,.18,.08,.22,.20],[.07,.42,.36,.23,.20],[.10,.75,.47,.22,.19],
    [.05,1.12,.41,.178,.16],[-.10,1.49,.44,.12,.12]],
    path:[[0,.21,.06,.23],[-.75,.15,-.33,.23],[-1.18,.13,-.75,.16],[-.81,.12,-1.02,.099],
      [-.12,.16,-1.05,.063],[.40,.13,-1.21,.014]],skull:[-.10,1.52,.46],
    width:.165,length:.33,eyes:.028,style:'asp',spines:0,
    antlers:[[[.09,.12,-.04,.035],[.18,.18,-.06,.028],[.27,.28,-.14,.003]]]},
  // High recurved jade body, six branching brow horns and white streamers.
  m138:{core:[[.17,.16,.07,.30,.25],[.52,.36,.12,.26,.23],[.72,.78,.23,.26,.20],
    [.55,1.24,.28,.24,.21],[.21,1.68,.27,.215,.18],[-.19,1.94,.35,.19,.17]],
    path:[[.17,.16,.07,.30],[-.54,.20,.16,.22],[-.76,.24,-.42,.18],[-.20,.45,-.68,.126],
      [.22,.62,-.31,.073],[.14,.72,.0,.017]],skull:[-.19,1.94,.35],
    width:.26,length:.48,eyes:.035,style:'jade',spines:9,
    antlers:[[[.13,.10,-.04,.052],[.26,.29,-.20,.073],[.30,.51,-.32,.043],[.23,.68,-.41,.004]],
      [[.25,.27,-.18,.033],[.41,.42,-.24,.035],[.47,.56,-.20,.003]],
      [[.17,.08,.04,.028],[.30,.19,.16,.026],[.45,.31,.12,.004]]]},
  // A heavy blue, ground-hugging crocodilian dragon with red talons and side plates.
  m152:{core:[[0,.32,-.73,.33,.28],[0,.47,-.31,.40,.33],[0,.51,.16,.40,.32],
    [.08,.63,.43,.32,.23],[.14,.80,.65,.24,.22]],
    path:[[0,.32,-.71,.36],[-.21,.31,-1.29,.30],[-.44,.42,-1.74,.22],[-.34,.62,-2.11,.155],
      [-.09,.85,-2.37,.092],[.05,1,-2.61,.018]],skull:[.14,.83,.69],
    width:.34,length:.59,eyes:.043,style:'greed',spines:12,
    antlers:[[[.19,.12,-.03,.064],[.39,.19,-.17,.058],[.45,.25,-.37,.004]],
      [[.24,.01,-.02,.058],[.39,-.020,-.20,.050],[.52,-.07,-.34,.004]]]},
};

function serpent(k,entry,mobile){
  const spec=serpentProfiles[entry.id],body=k.bone(k.root,0,.06,0),neck=blank(k,body);
  const main=spec.core;
  skin(k,neck,'hide',main,{rings:27,sides:16,section:2.35});
  const line=new T.CatmullRomCurve3(main.map(([x,y,z])=>vector([x,y,z])));
  const ribs=mobile?13:21;
  for(let i=0;i<ribs;i++){
    const t=(i+.28)/ribs,p=line.getPointAt(t),r=.163+(1-t)*.055;
    const forward=line.getTangentAt(t);
    const group=k.bone(neck,p.x,p.y,p.z+r*.73);
    group.rotation.x=Math.atan2(forward.z,forward.y);
    plate(k,group,i%6===2?'trim':'edge',[[-r*.89,-.030,.008],[0,-.044,.047],[r*.89,-.030,.008],
      [r*.76,.041,-.011],[0,.056,.042],[-r*.76,.041,-.011]],.031);
    for(const side of sides)if(i%2===0)horn(k,group,'rind',[[side*r*.48,.035,-.13,r*.23],
      [side*r*.86,.09,-.22,r*.29],[side*r*1.16,.09,-.34,.004]]);
  }
  const tail=makeTail(k,body,spec.path);
  const head=k.bone(neck,...spec.skull);
  const jaw=mouth(k,head,{...spec,brow:'rind',jaw:spec.style==='greed'?'rind':'edge',fangs:spec.style==='greed'?7:4});
  horns(k,head,spec.antlers);
  serpentRelief(k,neck,head,line,entry.id,mobile);
  const flourishes=[];
  if(spec.style==='hood'){
    for(const side of sides){
      const flap=k.bone(neck,side*.07,1.13,.30);
      plate(k,flap,'hide',[[0,-.63,.0],[side*.37,-.50,-.02],[side*.57,-.24,-.06],[side*.71,.13,-.17],
        [side*.60,.48,-.23],[side*.39,.71,-.11],[side*.16,.68,.0],[0,.40,.01]],.105);
      for(let i=0;i<8;i++){
        const t=i/7;
        horn(k,flap,i%3===0?'edge':'rind',[[0,-.5+t*.37,.058,.025],[side*(.14+t*.17),-.32+t*.47,-.023,.027],
          [side*(.38+t*.31),-.42+t*.76,-.089,.048],[side*(.40+t*.27),-.33+t*.91,-.18,.003]]);
        horn(k,flap,'trim',[[side*.12,-.45+t*.52,-.03,.021],[side*(.24+t*.32),-.28+t*.62,-.09,.014],
          [side*(.37+t*.23),-.35+t*.78,-.15,.003]]);
      }
      flourishes.push(flap);
    }
  }
  if(spec.style==='jade'){
    for(const side of sides){
      const whisker=k.bone(head,side*.12,-.064,.32);
      horn(k,whisker,'edge',[[0,0,0,.021],[side*.23,-.08,.17,.017],[side*.50,-.064,.25,.012],
        [side*.76,.139,.24,.006],[side*.81,.287,.17,.002]]);
      flourishes.push(whisker);
    }
  }
  if(spec.style==='greed')for(const side of sides)for(const z of [.29,-.55]){
    const hip=k.bone(body,side*.24,.35,z),ankle=k.bone(hip,side*.21,-.20,.06);
    skin(k,hip,'hide',[[0,0,0,.17,.14],[side*.23,-.15,-.017,.14,.12],[side*.27,-.23,.068,.108,.082]]);
    skin(k,ankle,'rind',[[0,.04,-.034,.10,.08],[side*.03,-.09,.092,.12,.055],[side*.06,-.135,.21,.096,.035]]);
    for(let i=0;i<4;i++)horn(k,ankle,'ember',[[side*(-.077+i*.054),-.106,.158,.028],
      [side*(-.095+i*.066),-.132,.254,.021],[side*(-.112+i*.071),-.16,.289,.002]]);
    flourishes.push(hip);
  }
  return {body,head,pattern:spec.style==='greed'?'crawl':'coil',crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose({headtime,travel,wind,strike,fall,stage,step}){
      neck.rotation.set(wind*.21-strike*.25,Math.sin(headtime*1.72)*(.058+travel*.08),Math.sin(headtime*1.41)*.05);
      head.rotation.y=Math.sin(headtime*1.88)*.073-wind*.075+strike*.16;
      jaw.rotation.x=.05+wind*.14+strike*.59+stage*.068;
      for(const [i,link] of tail.entries()){
        link.rotation.y=Math.sin(headtime*3.2-i*.53)*(.06+travel*.17)+strike*.05*(i+1);
        link.rotation.x=Math.cos(headtime*2.3+i*.7)*(.021+travel*.03)+fall*.07;
      }
      for(const [i,joint] of flourishes.entries()){
        if(spec.style==='greed')joint.rotation.x=Math.sin(step+i*Math.PI*.89)*travel*.44;
        else{
          joint.rotation.z=sides[i]*(Math.sin(headtime*3.1+i)*.047-wind*.11+strike*.23+stage*.13);
          joint.rotation.y=sides[i]*(wind*.13+Math.sin(headtime*2.6+i)*.10);
        }
      }
    }};
}

function wolfSpider(k,entry,mobile){
  const body=k.bone(k.root,0,.70,0),head=k.bone(body,0,-.10,.66);
  skin(k,body,'hide',[[0,.031,.32,.30,.20],[0,.01,.10,.43,.33],[0,.07,-.24,.62,.45],
    [0,.29,-.64,.64,.55],[0,.46,-.99,.49,.40],[0,.41,-1.31,.16,.19]],{sides:18,rings:27,section:2.55});
  skin(k,head,'rind',[[0,.04,-.18,.28,.19],[0,.004,-.04,.36,.23],[0,-.038,.16,.35,.20],
    [0,-.171,.39,.20,.12],[0,-.24,.52,.09,.038]],{rings:16,sides:15,section:2.65});
  const limbs=[];
  for(let i=0;i<(mobile?6:9);i++){
    const t=i/(mobile?6:9),zr=-.40-t*.61,yr=.48+t*.22;
    for(const side of sides){
      curvedPlate(k,body,i%4===1?'edge':'patina',[[side*.022,yr+.061,zr,.084,.041],
        [side*(.19+t*.032),yr+.037,zr+.017,.092,.058],[side*(.43+t*.040),yr-.032,zr+.043,.078,.041],
        [side*(.53+t*.027),yr-.15,zr-.016,.009,.005]]);
      horn(k,body,'deep',[[side*.032,yr+.106,zr-.057,.013],
        [side*.28,yr+.065,zr-.041,.023],[side*.49,yr-.062,zr-.041,.003]]);
    }
  }
  for(const side of sides){
    for(const [i,[x,y,z,spread,angle]] of [[.27,-.02,.59,.52,.22],[.37,.04,.34,.71,.08],
      [.43,.08,.01,.82,-.13],[.43,.14,-.28,.71,-.34]].entries()){
      const hip=k.bone(body,side*x,y,z),knee=k.bone(hip,side*spread,.50,angle);
      horn(k,hip,'edge',[[0,-.03,0,.094],[side*.19,.22,angle*.50,.094],
        [side*spread*.7,.50,angle*.75,.109],[side*spread,.51,angle,.085]]);
      horn(k,knee,'rind',[[0,0,0,.101],[side*.19,-.137,angle*.40,.094],
        [side*.24,-.40,angle*.68,.061],[side*.31,-.81,angle*1.45,.027],[side*.25,-.99,angle*1.59,.003]]);
      horn(k,knee,'edge',[[side*.03,-.04,.048,.047],[side*.14,-.21,.066,.055],
        [side*.242,-.45,.067,.043],[side*.28,-.77,.044,.004]]);
      for(let g=0;g<4;g++){
        const t=g/4;
        for(const direction of sides)horn(k,knee,'deep',[[side*(.17+t*.11),-.24-t*.44,direction*.063,.016],
          [side*(.22+t*.13),-.32-t*.42,direction*.103,.012],[side*(.25+t*.12),-.43-t*.44,direction*.135,.002]]);
      }
      limbs.push({hip,knee,i,side});
    }
    pelt(k,body,.89,.36,-.96,.34,mobile?8:13,'edge',.35);
    for(let i=0;i<5;i++){
      const a=i*.27;
      eye(k,head,side*(.062+i*.059),.062-a*.067,.333-a*.097,.037-i*.003);
    }
    horn(k,head,'edge',[[side*.21,-.10,.30,.073],[side*.34,-.19,.46,.079],
      [side*.31,-.33,.62,.055],[side*.16,-.39,.64,.007]]);
    horn(k,head,'deep',[[side*.25,-.20,.42,.054],[side*.33,-.18,.54,.059],[side*.39,-.28,.72,.004]]);
  }
  for(let i=0;i<7;i++){
    const z=-.27-i*.123,y=.46+Math.sin(i*.55)*.35;
    for(const side of sides)horn(k,body,i%2?'edge':'rind',[[side*(.36+i*.024),y,z,.077],
      [side*(.43+i*.017),y+.17,z-.06,.065],[side*(.41+i*.016),y+.26,z-.18,.004]]);
  }
  return {body,head,pattern:'crawl',crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose({wind,strike,headtime,step,travel,fall}){
      body.rotation.x=-wind*.31+strike*.26;
      for(const {hip,knee,side,i} of limbs){
        const swing=Math.sin(step+side*Math.PI/2+i*1.95);
        hip.rotation.x=swing*travel*.26+wind*.17-strike*.26;
        hip.rotation.z=side*(swing*travel*.09+wind*.19-fall*.31);
        knee.rotation.x=-Math.max(0,swing)*travel*.46+Math.sin(headtime*4.5+i)*.016;
      }
    }};
}

const flyingProfiles={
  m127:{core:[[0,.26,-.83,.16,.19],[0,.40,-.36,.21,.26],[0,.65,-.10,.24,.28],[0,.92,.16,.28,.25],
    [0,1.22,.36,.20,.18]],skull:[0,1.43,.51],width:.188,length:.34,eyes:.034,
    shoulders:[.22,1.04,-.19],wing:[[.03,0,0],[.57,.49,-.04],[1.22,.94,-.16],[1.95,.86,-.30],
      [1.69,.42,-.80],[1.31,.37,-1.04],[.99,.11,-.86],[.69,.17,-.70],[.37,-.16,-.64],[.08,-.22,-.29]],
    antlers:[[[.12,.089,.03,.057],[.22,.29,-.12,.053],[.25,.47,-.18,.019],[.24,.57,-.19,.003]]],
    tail:[[0,.31,-.79,.17],[.19,.17,-1.14,.143],[.54,.16,-1.71,.11],[.41,.53,-2.06,.063],[.05,.80,-2.23,.014]],
    style:'spiked'},
  m128:{core:[[0,.40,-.88,.25,.23],[0,.51,-.45,.36,.31],[0,.68,-.05,.37,.32],[0,.82,.23,.28,.26],
    [0,.94,.57,.21,.20]],skull:[0,1.04,.69],width:.26,length:.59,eyes:.040,
    shoulders:[.27,.79,-.05],wing:[[.03,0,0],[.43,.51,-.12],[1.13,.91,-.13],[2.06,1.23,-.26],
      [1.83,.38,-.87],[1.51,.53,-1.13],[1.25,.08,-1.25],[.92,.23,-1.11],[.58,-.17,-.93],[.08,-.24,-.38]],
    antlers:[[[.21,.102,-.011,.079],[.35,.20,-.16,.099],[.44,.35,-.40,.057],[.42,.48,-.56,.005]],
      [[.13,.20,-.18,.049],[.21,.38,-.29,.037],[.19,.59,-.51,.003]]],
    tail:[[0,.45,-.82,.24],[0,.50,-1.37,.18],[-.32,.56,-1.71,.12],[-.58,.53,-2.28,.077],
      [-.32,.31,-2.76,.02]],style:'bat'},
  m131:{core:[[0,.39,-.81,.25,.23],[0,.54,-.38,.36,.30],[0,.60,-.06,.35,.33],[0,.75,.32,.27,.23],
    [0,.94,.60,.18,.15]],skull:[0,1.01,.72],width:.27,length:.48,eyes:.043,
    shoulders:[.28,.76,.05],wing:[[.02,0,0],[.56,.46,.03],[1.28,.84,-.04],[2.07,.76,-.25],
      [1.77,.27,-.53],[1.52,.35,-.64],[1.31,-.15,-.88],[.99,.03,-.83],[.57,-.26,-.84],[.08,-.17,-.29]],
    antlers:[[[.14,.09,.013,.057],[.21,.26,-.17,.064],[.23,.45,-.31,.031],[.31,.56,-.44,.005]],
      [[.18,.10,.01,.040],[.37,.15,-.19,.037],[.52,.21,-.26,.003]]],
    tail:[[0,.40,-.75,.24],[.15,.39,-1.17,.19],[.44,.30,-1.55,.13],[.29,.24,-2.09,.075],
      [0,.25,-2.39,.02]],style:'fins'},
  'raid-wyvern':{core:[[0,.29,-.76,.23,.20],[0,.47,-.39,.34,.27],[0,.63,-.04,.39,.27],[0,.66,.33,.28,.22],
    [0,.82,.56,.19,.16]],skull:[0,.88,.71],width:.25,length:.47,eyes:.033,
    shoulders:[.28,.65,.04],wing:[[.02,0,0],[.61,.52,.04],[1.16,.81,-.17],[2.10,.67,-.27],
      [1.75,.06,-.81],[1.44,.22,-.90],[1.17,-.28,-1.13],[.87,-.12,-1.02],[.49,-.22,-.84],[.07,-.24,-.27]],
    antlers:[[[.14,.08,.013,.069],[.27,.21,-.12,.083],[.35,.33,-.39,.03],[.37,.32,-.48,.005]],
      [[.17,-.09,-.03,.065],[.30,-.11,-.16,.051],[.47,-.21,-.35,.004]]],
    tail:[[0,.32,-.73,.25],[-.12,.43,-1.12,.18],[-.25,.51,-1.56,.13],[.09,.49,-2.17,.070],
      [.16,.44,-2.56,.017]],style:'dunes'},
};

function wyvern(k,entry,mobile){
  const spec=flyingProfiles[entry.id],body=k.bone(k.root,0,.47,0);
  skin(k,body,'hide',spec.core,{sides:16,rings:24,section:2.25});
  const head=k.bone(body,...spec.skull);
  const jaw=mouth(k,head,{...spec,brow:'rind',jaw:'hide',fangs:6});
  horns(k,head,spec.antlers);
  const waist=spec.core[2][1];
  const shoulders=[],legs=[],tethers=[];
  for(const side of sides){
    const [x,y,z]=spec.shoulders;
    const shoulder=k.bone(body,x*side,y,z);
    const vertices=spec.wing.map(([x,y,z])=>[x*side,y,z]);
    plate(k,shoulder,'membrane',vertices,.045);
    membraneRelief(k,shoulder,vertices,entry,mobile);
    const tip=vertices[3],joint=vertices[2];
    const strut=(target,index)=>horn(k,shoulder,index%2===0?'rind':'trim',[[0,0,.012,.092],
      [joint[0]*.66,joint[1]*.79,joint[2]*.79,.081],[joint[0],joint[1],joint[2],.065],
      [target[0]*.81,target[1]*.74+joint[1]*.23,target[2]*.65,.043],[...target,.005]]);
    strut(tip,0);
    for(const [index,v] of [4,6,8].entries())strut(vertices[v],index+1);
    for(let i=0;i<vertices.length-2;i++){
      const a=vertices[i],b=vertices[i+1],inside=i>2&&i%2===0?.073:.035;
      horn(k,shoulder,'rind',[[...a,.035],[a[0]*.52+b[0]*.48,(a[1]+b[1])*.50+.034,(a[2]+b[2])*.50,.028],
        [b[0],b[1],b[2],inside]]);
    }
    for(let i=0;i<(mobile?5:9);i++){
      const t=i/(mobile?7:11);
      const point=[side*(.44+t*.80),.42+t*.34,-.08-t*.14];
      horn(k,shoulder,spec.style==='fins'?'ember':'hide',[[...point,.021],
        [point[0]-side*.024,point[1]-.10,point[2]-.12,.024],[point[0]-side*.087,point[1]-.23,point[2]-.37,.003]]);
    }
    const hip=k.bone(body,.19*side,waist*.77,-.32),claw=k.bone(hip,side*.20,-.22,.13);
    skin(k,hip,'hide',[[0,.02,-.05,.16,.12],[side*.12,-.13,-.066,.15,.11],[side*.23,-.20,.12,.095,.09]],
      {rings:10,sides:9});
    skin(k,claw,'rind',[[0,.03,-.06,.087,.073],[side*.084,-.14,.005,.075,.060],[side*.09,-.28,.134,.103,.042]]);
    for(let i=0;i<4;i++)horn(k,claw,'edge',[[side*(i-.85)*.057,-.254,.11,.025],
      [side*(i-.85)*.059,-.263,.25-i*.016,.021],[side*(i-.85)*.061,-.33,.292-i*.019,.002]]);
    shoulders.push(shoulder);
    legs.push({hip,claw,side});
    if(spec.style==='spiked'){
      const hand=k.bone(body,side*.22,1.0,.13);
      horn(k,hand,'edge',[[0,0,.002,.055],[side*.23,-.28,.17,.022],[side*.37,-.59,.46,.003]]);
      tethers.push(hand);
    }
  }
  const top=spec.core.map(([x,y,z,r])=>[x,y+r*.63,z]);
  for(let i=0;i<8;i++){
    const curve=new T.CatmullRomCurve3(top.map(vector)),p=curve.getPointAt(i/9);
    horn(k,body,spec.style==='fins'?'edge':'rind',[[p.x,p.y-.018,p.z,.088],
      [p.x+.02,p.y+.179,p.z-.09,.071],[p.x+.051,p.y+.31,p.z-.24,.004]]);
  }
  const tail=makeTail(k,body,spec.tail);
  return {body,head,pattern:'wing',crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose({beat,headtime,wind,strike,travel,fall,stage}){
      body.rotation.x=-wind*.24+strike*.37+Math.sin(headtime*2.3)*.04;
      head.rotation.y=Math.sin(headtime*2.8)*.08+strike*.15;
      jaw.rotation.x=wind*.098+strike*.72+stage*.098;
      for(const [i,shoulder] of shoulders.entries()){
        shoulder.rotation.z=sides[i]*(Math.sin(beat*.72+i*.16)*(.32+travel*.19)+wind*.36-strike*.46-fall*.38);
        shoulder.rotation.y=sides[i]*(Math.sin(beat*.62)*.17+wind*.23-strike*.38);
      }
      for(const {hip,claw,side} of legs){
        hip.rotation.x=-travel*.24+wind*.25-strike*.34;
        claw.rotation.x=Math.sin(headtime*4.3+side)*.11+strike*.44;
      }
      for(const [index,joint] of tail.entries())joint.rotation.y=Math.sin(beat*.41-index*.74)*(.11+travel*.10)-strike*.14;
      for(const [index,hand] of tethers.entries())hand.rotation.x=-wind*(1.1+index*.4)+strike*(.63+index*.22);
    }};
}

function vermilionBird(k,entry,mobile){
  const body=k.bone(k.root,0,.78,0),head=k.bone(body,0,.77,.53);
  skin(k,body,'hide',[[0,.05,-.63,.21,.19],[0,.27,-.28,.33,.28],[0,.25,.08,.40,.32],
    [0,.39,.36,.29,.25],[0,.61,.52,.20,.18],[0,.76,.53,.15,.155]],{rings:23,sides:16,section:2});
  skin(k,head,'hide',[[0,-.10,-.14,.115,.10],[0,-.011,-.11,.137,.133],
    [0,.071,-.01,.131,.13],[0,.046,.105,.114,.100],[0,-.024,.189,.080,.069]]);
  skin(k,head,'trim',[[0,.019,.095,.104,.072],[0,-.005,.206,.090,.069],
    [0,-.054,.326,.045,.052],[0,-.128,.388,.007,.009]],{rings:12,sides:11,section:2.35});
  const jaw=k.bone(head,0,-.056,.10);
  skin(k,jaw,'rind',[[0,-.021,-.032,.075,.039],[0,-.041,.09,.069,.025],
    [0,-.052,.172,.039,.016],[0,-.100,.249,.004,.005]]);
  for(const side of sides){
    eye(k,head,side*.096,.056,.126,.029);
    horn(k,head,'ember',[[side*.041,.101,.078,.031],[side*.092,.132,-.02,.034],
      [side*.109,.155,-.15,.016],[side*.107,.153,-.23,.004]]);
  }
  const primaries=[],train=[];
  for(const side of sides){
    const wing=k.bone(body,side*.25,.47,-.03);
    backFeathers(k,body,wing,side,mobile);
    skin(k,wing,'hide',[[0,0,0,.14,.19],[side*.27,.14,0,.18,.23],
      [side*.55,.20,-.05,.17,.22],[side*.82,.26,-.10,.122,.161]]);
    const count=mobile?7:11;
    for(let i=0;i<count;i++){
      const t=i/(count-1);
      const origin=[side*(.28+t*.64),.10+t*.35,-.14+t*.09];
      const endpoint=[side*(1.06+t*.89),-.37+t*1.23,-.32-t*.38];
      const bulge=[side*(.72+t*.81),.03+t*.82,-.30-t*.29];
      k.geometry(wing,i%4===0?'ember':'plume',
        featherVane(origin,bulge,endpoint,.17-.046*t,side*i*.54,11));
      const mid=[origin[0]*.81+endpoint[0]*.19,origin[1]*.89+endpoint[1]*.11,origin[2]-.07];
      const tip=[origin[0]*.42+endpoint[0]*.58,origin[1]*.37+endpoint[1]*.63,origin[2]-.155];
      k.geometry(wing,i%3?'trim':'rind',featherVane(origin,mid,tip,.124,i*.87,8));
    }
    for(let i=0;i<3;i++)horn(k,head,i%2?'trim':'rind',[[side*(.029+i*.033),.088,-.091,.039],
      [side*(.07+i*.046),.20+i*.048,-.142,.048],
      [side*(.13+i*.053),.32+i*.036,-.29,.026],[side*(.17+i*.075),.38+i*.043,-.49,.003]]);
    for(let i=0;i<4;i++){
      const claw=k.bone(body,side*.19,-.055,.08-i*.016);
      horn(k,claw,'rind',[[0,0,0,.055],[side*.07,-.21,.03,.045],[side*(i-1.4)*.06,-.27,.25,.029],
        [side*(i-1.4)*.08,-.34,.32,.004]]);
    }
    primaries.push(wing);
  }
  for(let i=0;i<(mobile?7:11);i++){
    const p=(i-(mobile?3:5))*.17,mantle=k.bone(body,p*.14,.18,-.43);
    const c=Math.abs(p);
    k.geometry(mantle,i%3===0?'rind':i%2?'plume':'ember',
      featherVane([0,0,0],[p*.55,-.17,-.57],[p*1.38,-.37+c*.5,-1.58+c*.44],.17-c*.04,i*.72,14));
    train.push(mantle);
  }
  return {body,head,pattern:'wing',crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose({beat,wind,strike,travel,headtime,stage}){
      jaw.rotation.x=.064+strike*.40;
      for(const [i,wing] of primaries.entries()){
        wing.rotation.z=sides[i]*(Math.sin(beat*.70)*(.40+travel*.14)+wind*.32-strike*.53);
        wing.rotation.x=Math.cos(beat*.74)*.18+wind*.24-strike*.37;
      }
      for(const [i,plume] of train.entries()){
        plume.rotation.x=Math.sin(headtime*3.4-i*.32)*.23+wind*.22-strike*.19;
        plume.rotation.y=(i-(train.length-1)*.5)*(.024+strike*.022+stage*.018);
      }
    }};
}

function iceTurtle(k,entry,mobile){
  const body=k.bone(k.root,0,.59,-.07);
  skin(k,body,'hide',[[0,-.06,-.93,.28,.23],[0,.055,-.62,.57,.37],[0,.15,-.16,.82,.58],
    [0,.17,.32,.72,.49],[0,.035,.68,.48,.29],[0,-.095,.86,.27,.18]],{sides:24,rings:29,section:2.41});
  const heads=[],limbs=[];
  const crystal=(x,y,z,w,h,tilt)=>{
    const p=Math.sign(x||1);
    const shard=k.bone(body,x,y,z);
    skin(k,shard,'rind',[[0,-.10,0,w,w*.88],[0,.06,0,w*1.37,w*1.1],
      [p*tilt*.73,h*.54,-.09,w*.72,w*.64],[p*tilt,h,-.23,.008,.009]],
    {sides:7,rings:6,section:2.8,ridge:.041});
    horn(k,shard,'edge',[[p*w*.53,.07,w*.87,.029],[p*w*.39+p*tilt*.67,h*.52,.05,.023],
      [p*tilt,h*.97,-.20,.004]]);
    return shard;
  };
  for(const [x,y,z,w,h,t] of [[0,.60,-.25,.26,.88,.15],[0,.55,-.63,.25,.68,.02],[0,.46,.21,.23,.62,.08],
    [-.39,.41,-.18,.23,.72,.37],[.39,.41,-.18,.23,.66,.40],[-.58,.21,.24,.18,.58,.39],[.58,.19,.19,.18,.56,.36],
    [-.43,.28,-.64,.18,.61,.31],[.42,.27,-.60,.18,.59,.32],[-.52,.04,-.81,.15,.45,.33],[.52,.04,-.81,.15,.45,.33]])crystal(x,y,z,w,h,t);
  for(const side of sides){
    for(let i=0;i<7;i++){
      const z=.61-i*.21,y=.58-i*.025,x=side*(.53+Math.sin(i*.55)*.16);
      curvedPlate(k,body,i%3?'patina':'edge',[[x*.51,y+.034,z+.17,.071,.040],
        [x*.80,y+.014,z+.09,.095,.037],[x,y-.095,z+.005,.068,.046],
        [x*1.05,y-.24,z-.103,.008,.006]]);
      horn(k,body,'rind',[[x*.65,y+.014,z+.131,.025],[x*.83,y-.015,z+.09,.033],
        [x*1.09,y-.22,z-.038,.004]]);
    }
    for(let i=0;i<7;i++){
      const a=.14+i*.43,x=.72*Math.sin(a)*side,z=.76*Math.cos(a)-.13;
      plate(k,body,i%3?'deep':'edge',[[x,-.14,z],[x+side*.146,-.070,z+.019],[x+side*.181,.097,z-.165],
        [x,.14,z-.23],[x-side*.102,.080,z-.13]],.067);
    }
    for(const fore of [-1,1]){
      const limb=k.bone(body,.54*side,-.02,fore*.52),ankle=k.bone(limb,side*.17,-.23,0);
      skin(k,limb,'hide',[[0,.058,0,.16,.17],[side*.17,-.12,0,.17,.15],[side*.20,-.27,.08,.118,.11]]);
      skin(k,ankle,'rind',[[0,0,0,.115,.11],[side*.028,-.18,.15,.145,.083],[side*.096,-.20,.27,.117,.045]]);
      for(let i=0;i<3;i++)horn(k,ankle,'edge',[[side*(i-.7)*.069,-.17,.21,.035],
        [side*(i-.7)*.082,-.20,.33-i*.025,.022],[side*(i-.7)*.093,-.24,.38-i*.029,.003]]);
      limbs.push({limb,ankle,side,fore});
    }
    for(let i=0;i<6;i++){
      const t=i/5;
      horn(k,body,i%2?'rind':'edge',[[side*(.36+t*.17),.29-t*.08,-.61-t*.07,.09],
        [side*(.62+t*.20),.32+t*.14,-.95-t*.18,.06],[side*(.77+t*.39),.47+t*.35,-1.30-t*.38,.004]]);
    }
  }
  const face=k.bone(body,.06,.084,.69);
  skin(k,face,'rind',[[0,-.03,-.22,.18,.16],[.034,.074,.033,.163,.145],[.027,.210,.22,.14,.137]]);
  const head=k.bone(face,.033,.214,.239);
  const jaw=mouth(k,head,{width:.171,length:.29,brow:'edge',eyes:.032,jaw:'rind'});
  heads.push({face,jaw,side:1});
  const viper=k.bone(body,.40,.06,-.68);
  skin(k,viper,'hide',[[0,0,0,.118,.109],[.37,.08,-.22,.106,.091],[.52,.37,-.24,.085,.075],
    [.44,.66,-.14,.077,.065],[.29,.77,.03,.071,.061],[.17,.77,.16,.069,.065]],
  {sides:12,rings:16});
  const snake=k.bone(viper,.17,.775,.16);
  const snakeJaw=mouth(k,snake,{width:.096,length:.148,brow:'edge',eyes:.019,jaw:'rind',fangs:2});
  heads.push({face:viper,jaw:snakeJaw,side:-1});
  const tail=makeTail(k,body,[[0,.04,-.85,.15],[-.36,.08,-1.05,.13],[-.63,.24,-1.27,.092],
    [-.75,.38,-1.45,.065],[-.90,.56,-1.68,.015]]);
  return {body,pattern:'crawl',crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose({beat,wind,strike,travel,headtime,fall,step}){
      for(const {limb,ankle,side,fore} of limbs){
        const phase=step+side*Math.PI*.5+fore*Math.PI*.5;
        limb.rotation.x=Math.sin(phase)*travel*.32+wind*.16-strike*.29;
        ankle.rotation.x=-Math.max(0,Math.cos(phase))*travel*.31+fall*.22;
      }
      for(const {face,jaw,side} of heads){
        face.rotation.y=side*(wind*.18+Math.sin(headtime*1.92+.8*side)*.14);
        face.rotation.x=-wind*.18+strike*.31;
        jaw.rotation.x=strike*.54;
      }
      for(const [i,bone] of tail.entries())bone.rotation.y=Math.sin(beat*.42-i*.84)*(.12+travel*.12);
    }};
}

const championProfiles={
  m113:{frames:'raiment',size:[.27,1.72,.32],crown:'flame',weapon:'wheel',faces:1,
    armor:[.40,.31,.22],position:[.11,.14,.31],cloak:[.69,.82,.21],crest:[.14,.28,.20]},
  m118:{frames:'guard',size:[.26,1.85,.29],crown:'monkey',weapon:'lance',faces:1,
    armor:[.39,.21,.19],position:[.09,.40,.30],cloak:[.61,.57,.09],crest:[.06,.15,.01]},
  m119:{frames:'guard',size:[.32,1.88,.36],crown:'turban',weapon:'trident',faces:1,
    armor:[.48,.17,.28],position:[.10,.38,.15],cloak:[.72,.93,.15],crest:[.06,.11,.06]},
  m120:{frames:'guard',size:[.37,1.73,.29],crown:'elephant',weapon:'axe',faces:1,
    armor:[.53,.28,.27],position:[.17,.39,.19],cloak:[.52,.58,.21],crest:[.13,.38,.13]},
  m123:{frames:'carriage',size:[.29,1.94,.27],crown:'sunburst',weapon:'sceptre',faces:1,
    armor:[.41,.31,.22],position:[.10,.11,.25],cloak:[.48,.61,.23],crest:[.24,.44,.31]},
  m135:{frames:'hover',size:[.25,1.71,.25],crown:'plait',weapon:'lotus',faces:1,
    armor:[.33,.13,.18],position:[.05,.26,.30],cloak:[.40,.89,.24],crest:[.11,.29,.24]},
  m137:{frames:'guard',size:[.30,1.94,.29],crown:'horns',weapon:'sword',faces:1,
    armor:[.44,.26,.24],position:[.14,.17,.28],cloak:[.61,.78,.29],crest:[.15,.30,.10]},
  m139:{frames:'guard',size:[.35,2.07,.26],crown:'spurs',weapon:'bow',faces:1,
    armor:[.54,.31,.24],position:[.11,.23,.29],cloak:[.81,.82,.31],crest:[.12,.34,.12]},
  m141:{frames:'guard',size:[.34,2.04,.39],crown:'tusks',weapon:'halberd',faces:1,
    armor:[.44,.35,.21],position:[.18,.30,.30],cloak:[.76,.97,.41],crest:[.13,.24,.23]},
  m142:{frames:'hover',size:[.38,1.67,.25],crown:'fungus',weapon:'thorns',faces:1,
    armor:[.41,.41,.21],position:[.12,.18,.03],cloak:[1.17,1.06,.23],crest:[.24,.30,.05]},
  m143:{frames:'ogre',size:[.42,1.89,.37],crown:'bone',weapon:'club',faces:1,
    armor:[.49,.36,.29],position:[.12,.31,.67],cloak:[.47,.43,.19],crest:[.17,.21,.18]},
  m146:{frames:'hover',size:[.28,1.64,.26],crown:'moth',weapon:'tendrils',faces:1,
    armor:[.38,.31,.18],position:[.19,.08,.16],cloak:[.56,.91,.43],crest:[.12,.48,.18]},
  m147:{frames:'guard',size:[.35,1.78,.28],crown:'thorns',weapon:'pike',faces:1,
    armor:[.57,.28,.25],position:[.15,.30,.29],cloak:[.71,.61,.29],crest:[.16,.33,.25]},
  'raid-flame':{frames:'ogre',size:[.45,1.93,.40],crown:'slag',weapon:'gauntlets',faces:1,
    armor:[.66,.41,.26],position:[.12,.39,.19],cloak:[.72,.46,.27],crest:[.21,.45,.13]},
};

function helmet(k,head,spec){
  const [width,height,depth]=spec.crest;
  skin(k,head,spec.crown==='moth'?'silk':'hide',[[0,-.16,.02,.095,.115],[0,-.084,0,.131,.134],
    [0,.068,0,.154,.141],[0,.166,-.026,.148,.135],[0,.242,-.052,.09,.098]],
  {rings:15,sides:14,section:2.4,ridge:.11});
  skin(k,head,'rind',[[0,.038,-.080,.171,.113],[0,.099,-.11,.173,.158],
    [0,.20,-.098,.162,.134],[0,.29,-.086,.106,.081],[0,.333,-.07,.025,.041]],
  {rings:13,sides:13,section:2.3});
  for(const side of sides){
    const cap=side*.123;
    eye(k,head,side*.075,.049,.127,.028);
    plate(k,head,'trim',[[cap,.12,.14],[side*.048,.083,.173],[side*.03,.119,.174],
      [side*.086,.169,.163],[side*.158,.159,.104],[side*.163,.097,.105]],.026);
    horn(k,head,'deep',[[side*.044,-.105,.109,.025],[side*.112,-.105,.111,.036],
      [side*.134,-.064,.072,.034],[side*.145,.005,.005,.027]]);
    plate(k,head,'rind',[[cap,.11,-.150],[side*.196,.035,-.105],[side*.190,-.181,-.082],
      [side*.088,-.19,-.144],[side*.079,.075,-.19]],.061);
  }
  const crest=(profile,finish='edge')=>horns(k,head,[profile],finish);
  const whip=(x,y,z,t)=>[[.092,.13,.0,.043],[x,y,z,.051],[x*1.27,y+t,z+.12,.026],
    [x*1.42,y+t*1.48,z+.15,.003]];
  if(spec.crown==='elephant'){
    for(const side of sides){
      plate(k,head,'hide',[[side*.11,.09,-.028],[side*.24,.185,-.08],[side*.38,.13,-.048],
        [side*.341,-.065,.075],[side*.26,-.177,.116],[side*.15,-.127,.074]],.072);
    }
    const trunk=k.bone(head,0,-.031,.109);
    horn(k,trunk,'hide',[[0,0,0,.080],[0,-.10,.12,.077],[.025,-.215,.185,.068],
      [.045,-.36,.19,.05],[.085,-.44,.27,.036],[.083,-.437,.363,.021]]);
    crest([[.092,-.097,.11,.047],[.142,-.155,.219,.048],[.158,-.144,.352,.024],[.150,-.109,.390,.003]]);
    return [trunk];
  }
  if(spec.crown==='monkey'){
    for(const side of sides)k.mesh(head,'round','hide',side*.142,.061,.005,.082,.087,.045);
    skin(k,head,'edge',[[0,-.143,.094,.065,.029],[0,-.096,.14,.089,.042],
      [0,-.039,.166,.081,.048],[0,.016,.150,.043,.030]],{rings:10,sides:12});
    crest([[.12,.192,.018,.046],[.19,.30,-.037,.035],[.16,.40,-.103,.003]],'trim');
  }else if(spec.crown==='turban'){
    for(let i=0;i<4;i++){
      const r=.156+i*.008;
      k.mesh(head,'ring',i%2?'rind':'silk',0,.133+i*.036,-.024,r,r,.65,1.57,0,.16-i*.09);
    }
    crest([[.013,.25,.073,.035],[.034,.38,.017,.042],[.007,.47,-.02,.003]],'trim');
  }else if(spec.crown==='plait'){
    skin(k,head,'deep',[[0,.176,-.016,.156,.13],[.014,.256,-.055,.135,.119],
      [-.01,.337,-.122,.105,.092],[-.05,.489,-.18,.08,.069]]);
    crest([[.014,.285,-.10,.03],[.08,.42,-.11,.021],[.125,.49,-.08,.004]],'trim');
  }else if(spec.crown==='fungus'){
    for(let i=0;i<5;i++)crest(whip(.17+i*.057,.18+i*.046,-.07-i*.028,.11),
      i%2?'rind':'ember');
  }else if(spec.crown==='moth'){
    crest(whip(.25,.29,-.09,.18),'silk');
    crest(whip(.21,.09,-.12,.045),'edge');
    crest(whip(.24,-.116,-.16,-.16),'rind');
  }else if(spec.crown==='sunburst'){
    for(let i=0;i<5;i++)crest(whip(.135+i*.07,.30+i*.032,-.14-i*.046,.15+i*.036),i%2?'trim':'rind');
  }else if(spec.crown==='tusks'){
    crest([[.10,.124,.007,.029],[.19,.25,-.04,.043],[.30,.29,-.11,.043],[.37,.053,-.17,.032],
      [.49,-.43,-.15,.021],[.56,-.68,-.055,.003]]);
    crest(whip(.20,.24,-.04,.19),'ember');
  }else{
    for(let i=0;i<(spec.crown==='flame'?4:3);i++)crest(
      whip(.20+width*i*.62,.19+height*i*.37,-.051-depth*i*.33,(i%2===0?.19:.12)),
      spec.crown==='slag'?i%2?'ember':'rind':i%2?'trim':'edge');
  }
  return [];
}

function armament(k,group,kind,side,radius){
  const stave=(a,b,r=.041)=>k.rod(group,'deep',a,b,r);
  const loop=(color,x,y,z,r,rx=0)=>k.mesh(group,'ring',color,x,y,z,r,r,1,rx);
  if(kind==='wheel'){
    const x=side*.28;
    loop('trim',x,-.11,.17,.37);
    loop('ember',x,-.11,.206,.32);
    for(let i=0;i<8;i++){
      const a=i*tau/8,c=Math.cos(a),s=Math.sin(a);
      horn(k,group,i%2?'edge':'rind',[[x+c*.34,-.11+s*.34,.15,.049],
        [x+c*.42-s*.09,-.11+s*.42+c*.09,.18,.040],[x+c*.51-s*.13,-.11+s*.51+c*.13,.204,.004]]);
    }
    return;
  }
  if(kind==='lotus'||kind==='tendrils'||kind==='thorns'){
    gem(k,group,kind==='lotus'?'glow':'ember',[0,-.22,.17],[.09,.08,.07]);
    for(let i=0;i<5;i++){
      const n=(i-2)*.125;
      horn(k,group,i%2?'edge':'rind',[[0,-.23,.17,.044],[n*.33,-.14,.24,.039],
        [n,-.083,.27,.030],[n*1.26,-.016,.31,.004]]);
    }
    return;
  }
  if(kind==='gauntlets'){
    for(let i=0;i<5;i++){
      const offset=(i-2)*.072;
      horn(k,group,'rind',[[offset,.029,.058,.085],[offset,-.11,.145,.080],
        [offset*1.22,-.236,.152,.058],[offset*1.31,-.330,.096,.006]]);
      horn(k,group,'ember',[[offset,-.013,.126,.027],[offset,-.143,.190,.031],
        [offset*1.21,-.236,.188,.005]]);
    }
    return;
  }
  if(kind==='bow'){
    const chain=[[.06,-.77,.10,.033],[side*.27,-.65,.10,.064],[side*.42,-.37,.15,.055],
      [side*.29,-.11,.20,.055],[side*.42,.33,.13,.052],[side*.29,.60,.085,.075],
      [.07,.75,.10,.03]];
    horn(k,group,'rind',chain);
    horn(k,group,'trim',chain.map(([x,y,z,r])=>[x,y,z+.065,r*.38]));
    stave([.06,-.76,.09],[.07,.75,.09],.009);
    return;
  }
  if(kind==='sword'){
    stave([0,-.26,.15],[0,.29,.15],.055);
    plate(k,group,'ember',[[-.12,.20,.152],[-.22,.52,.15],[-.28,.92,.15],[-.13,1.27,.15],
      [.01,1.51,.15],[.11,1.35,.15],[.013,.98,.16],[.07,.74,.15],[.10,.23,.15]],.078);
    horn(k,group,'edge',[[-.14,.24,.19,.028],[-.23,.60,.19,.025],[-.21,.98,.19,.022],
      [.008,1.51,.18,.004]]);
    horn(k,group,'trim',[[-.16,.26,.14,.044],[0,.185,.14,.072],[.15,.27,.14,.047],[.23,.42,.14,.004]]);
    return;
  }
  stave([0,-.70,.11],[0,kind==='sceptre'?1.01:1.13,.11],radius);
  stave([0,-.52,.11],[0,.17,.11],radius*1.28);
  for(const y of [-.69,-.5,-.33,.29,.86,1.10]){
    loop('trim',0,y,.11,radius*1.29,1.57);
  }
  if(kind==='club'){
    horn(k,group,'rind',[[0,.68,.07,.089],[0,.91,.11,.16],[.02,1.13,.13,.21],[.06,1.37,.15,.11]]);
    for(let i=0;i<7;i++){
      const a=i*tau/7,x=Math.cos(a),z=Math.sin(a);
      horn(k,group,'edge',[[x*.12,1.10,z*.13+.13,.049],[x*.21,1.18,z*.22+.13,.048],
        [x*.29,1.33,z*.31+.13,.003]]);
    }
  }else if(kind==='axe'||kind==='halberd'){
    const n=kind==='axe'?.69:.56;
    plate(k,group,'rind',[[-.063,.88,.11],[side*n*.42,.79,.11],[side*n,.60,.11],[side*n*.96,1.07,.12],
      [side*n,1.42,.11],[side*n*.45,1.51,.11],[.084,1.24,.13]],.092);
    horn(k,group,'edge',[[side*n*.98,.62,.11,.024],[side*(n+.04),.96,.11,.035],
      [side*n*.97,1.41,.12,.034],[side*n*.51,1.5,.14,.004]]);
  }else if(kind==='trident'){
    for(const sign of [-1,0,1])horn(k,group,'trim',[[0,.96,.11,.061],[sign*.16,1.04,.11,.052],
      [sign*.217,1.21,.13,.044],[sign*.21,1.39+(.16-Math.abs(sign)*.16),.14,.004]]);
  }else if(kind==='sceptre'){
    for(let i=0;i<6;i++){
      const a=i*tau/6,x=Math.cos(a),z=Math.sin(a);
      horn(k,group,'trim',[[0,.93,.11,.038],[x*.11,1.04,.11+z*.11,.041],
        [x*.20,1.21,.11+z*.20,.027],[x*.10,1.42,.11+z*.10,.003]]);
    }
    gem(k,group,'glow',[0,1.18,.11],[.131,.152,.12]);
  }else{
    plate(k,group,kind==='pike'?'rind':'trim',[[0,.96,.11],[-.127,1.14,.11],
      [-.149,1.41,.11],[kind==='pike'?.16:0,1.61,.11],[.175,1.30,.11],[.095,1.08,.11]],.073);
    horn(k,group,'edge',[[0,.99,.162],[0,1.31,.154,.031],[kind==='pike'?.16:0,1.61,.11,.002]].map(
      p=>p.length===3?[...p,.045]:p));
  }
}

function ashSeat(k,root){
  const seat=k.bone(root,0,.034,-.04);
  skin(k,seat,'deep',[[0,-.14,0,.18,.18],[0,-.05,0,.58,.54],
    [0,.075,0,.83,.76],[0,.20,0,.76,.70],[0,.31,0,.32,.29]],
  {sides:25,rings:19,section:2.45,ridge:.20});
  for(let i=0;i<12;i++){
    const a=i*tau/12,c=Math.cos(a),s=Math.sin(a);
    const protrusion=k.bone(seat,.52*c,.06,.53*s);
    skin(k,protrusion,i%3===0?'rind':'deep',[[0,-.08,0,.14,.14],
      [c*.14,.02,s*.16,.244,.182],[c*.14,.134,s*.15,.22,.182],[0,.21,0,.13,.092]],
    {sides:8,rings:7,section:2.6,ridge:.36,seed:i});
    horn(k,seat,i%2?'ember':'rind',[[c*.18,.291,s*.16,.013],[c*.29,.27,s*.28,.018],
      [c*.41-s*.024,.239,s*.41+c*.027,.018],[c*.49,.236,s*.42,.003]]);
  }
  return seat;
}

function indraElephant(k,body,mobile){
  const mount=k.bone(body,0,.048,-.23),legs=[];
  skin(k,mount,'elephantHide',[[0,.28,-.66,.29,.24],[0,.35,-.40,.43,.35],
    [0,.43,.012,.44,.39],[0,.41,.35,.36,.32],[0,.33,.57,.27,.27]],
  {sides:18,rings:24,section:2.5,ridge:.21});
  const head=k.bone(mount,0,.40,.49);
  skin(k,head,'elephantHide',[[0,-.21,.08,.18,.15],[0,-.12,.103,.23,.212],
    [0,.079,.047,.25,.211],[0,.24,-.041,.217,.14],[0,.32,-.086,.13,.074]],
  {sides:15,rings:18,section:2.35});
  const trunk=k.bone(head,0,-.105,.214);
  skin(k,trunk,'elephantHide',[[0,0,0,.116,.11],[0,-.13,.12,.112,.105],[0,-.39,.247,.080,.072],
    [0,-.48,.406,.060,.054],[.08,-.49,.535,.044,.046],[.126,-.434,.563,.029,.033]],
  {rings:15,sides:12,section:2.12,ridge:.16});
  const tail=k.bone(mount,0,.31,-.61);
  horn(k,tail,'elephantHide',[[0,0,0,.07],[-.13,-.09,-.23,.051],[-.21,-.27,-.30,.038],[-.24,-.40,-.44,.010]]);
  for(const side of sides){
    const ear=k.bone(head,side*.13,.066,-.091);
    plate(k,ear,'elephantHide',[[0,.04,0],[side*.205,.19,-.07],[side*.34,.103,-.11],
      [side*.37,-.073,-.074],[side*.245,-.226,.063],[side*.102,-.166,.073]],.06);
    horn(k,ear,'elephantArmor',[[side*.071,.12,.046,.035],[side*.192,.065,.0,.045],
      [side*.268,-.024,.013,.024],[side*.279,-.103,.024,.003]]);
    eye(k,head,side*.174,.075,.222,.025);
    horn(k,head,'edge',[[side*.15,-.11,.24,.062],[side*.24,-.19,.45,.067],[side*.38,-.15,.69,.069],
      [side*.46,-.05,.79,.049],[side*.49,.06,.82,.003]]);
    horn(k,head,'trim',[[side*.18,-.18,.39,.032],[side*.249,-.17,.41,.037],
      [side*.281,-.119,.38,.028]]);
    plate(k,mount,'elephantArmor',[[side*.259,.46,-.55],[side*.464,.40,-.47],[side*.50,.19,-.37],
      [side*.475,.165,.39],[side*.362,.41,.43],[side*.254,.50,.18]],.10);
    const limit=mobile?5:8;
    for(let i=0;i<limit;i++){
      const z=-.47+i*.84/limit;
      horn(k,mount,i%2?'ember':'trim',[[side*.36,.45,z,.029],[side*.46,.369,z,.035],
        [side*.51,.256,z+.016,.022],[side*.478,.18,z+.025,.003]]);
    }
    for(const z of [-.42,.35]){
      const leg=k.bone(mount,side*.298,.33,z),hoof=k.bone(leg,0,-.29,.026);
      skin(k,leg,'elephantHide',[[0,.07,0,.14,.15],[side*.06,-.094,-.01,.15,.135],
        [side*.06,-.261,.016,.118,.112]],{rings:13,sides:12});
      skin(k,hoof,'elephantHide',[[side*.062,.03,-.03,.115,.101],[side*.072,-.107,.011,.117,.098],
        [side*.061,-.19,.044,.129,.083]],{rings:12,sides:11});
      k.mesh(hoof,'ring','trim',side*.065,-.078,.016,.117,.117,.97,Math.PI/2);
      for(let i=0;i<3;i++)gem(k,hoof,'edge',[side*(i-1)*.057,-.166,.115],[.028,.037,.036]);
      legs.push({leg,hoof,side,z});
    }
  }
  return {head,trunk,tail,legs};
}

function jointedChampion(k,entry,mobile){
  const spec=championProfiles[entry.id];
  const floating=spec.frames==='raiment';
  const body=k.bone(k.root,0,spec.frames==='carriage'?.40:floating?.27:.07,0);
  const seat=floating?ashSeat(k,k.root):null;
  const elephant=spec.frames==='carriage'?indraElephant(k,body,mobile):null;
  const [width,height,depth]=spec.size;
  const [shell,hood,fold]=spec.armor;
  const head=k.bone(body,0,height,.045),shoulders=[],steps=[],threads=[],streamers=[];
  const crownParts=helmet(k,head,spec);
  skin(k,body,'hide',[[0,.47,-.02,width*.68,depth*.62],[0,.68,-.018,width*.70,depth*.67],
    [0,.97,0,width*.79,depth*.82],[0,1.19,.012,width*.84,depth*.91],
    [0,1.46,.035,width,depth],[0,height-.10,.033,width*.46,depth*.69]],
  {sides:17,rings:22,section:2.30});
  const [mx,my,ml]=spec.position;
  for(const side of sides){
    for(let row=0;row<4;row++){
      const y=1.38-row*.184,x=side*(shell*.75-row*.031),z=depth*.72+row*.018;
      plate(k,body,row===0?'rind':row%2?'trim':'hide',[[side*.017,y+.11,z],
        [side*.092,y+.157,z+.022],[x,y+.083+hood*.16,z-.069],
        [x+side*.01,y-.12,z-.088],[side*.08,y-.11,z+.040],[side*.022,y-.17,z+.051]],.065);
      plate(k,body,row%3?'rind':'trim',[[side*.046,y+.083,-depth*.78],
        [x*.88,y+.020,-depth*.67],[x*.74,y-.105,-depth*.82],[side*.069,y-.111,-depth*.89]],.048);
      horn(k,body,iTrim(row),[[side*.053,y-.09,z+.080,.024],[side*.18,y-.077,z+.047,.022],
        [x*.89,y-.055,z-.027,.011]]);
    }
    const shoulder=k.bone(body,side*width*.85,1.41,mx*.15);
    const forearm=k.bone(shoulder,side*(.14+fold*.23),-.32,.018);
    const palm=k.bone(forearm,side*.034,-.26,.033);
    skin(k,shoulder,'hide',[[0,.020,0,.14,.134],[side*.12,-.13,0,.151,.13],
      [side*.16,-.31,.07,.102,.098]],{sides:12,rings:12});
    skin(k,forearm,'hide',[[0,.029,0,.101,.111],[side*.018,-.11,.019,.127,.10],
      [side*.038,-.27,.044,.071,.076]],{sides:12,rings:12});
    for(let i=0;i<3;i++){
      const y=.09-i*.13,x=.17+i*.056;
      plate(k,shoulder,i%2?'trim':'rind',[[side*.015,y+.055,.161],[side*x,y+.11,.14],
        [side*(x+.085),y+.076+hood*.74,ml*.13],[side*(x+.03),y-.12,-.091],
        [side*.061,y-.101,-.120]],.074);
    }
    plate(k,forearm,'rind',[[side*-.072,-.01,.093],[side*.014,.073,.09],[side*.108,-.012,.112],
      [side*.141,-.20,.101],[side*.013,-.248,.116],[side*-.087,-.16,.111]],.060);
    skin(k,palm,'hide',[[0,.051,.044,.078,.070],[side*.024,-.031,.058,.086,.082],
      [side*.016,-.098,.12,.057,.047]]);
    for(let i=0;i<4;i++)horn(k,palm,'edge',[[side*(i-.98)*.041,-.065,.092,.023],
      [side*(i-.95)*.046,-.12,.164,.016],[side*(i-.85)*.046,-.136,.187,.003]]);
    if(side===1||['wheel','lotus','thorns','tendrils','gauntlets'].includes(spec.weapon)){
      armament(k,palm,spec.weapon,side,.035+fold*.08);
    }
    shoulders.push({shoulder,forearm,palm,side});
    if(floating){
      const extraArm=k.bone(body,side*.19,1.39,-.08);
      const extraForearm=k.bone(extraArm,side*.32,.23,-.05);
      const extraPalm=k.bone(extraForearm,side*.12,.25,.06);
      skin(k,extraArm,'silk',[[0,-.02,0,.13,.12],[side*.17,.072,-.028,.119,.105],
        [side*.32,.22,-.046,.106,.089]],{sides:12,rings:13});
      skin(k,extraForearm,'silk',[[0,-.01,-.01,.110,.100],[side*.063,.11,.0,.091,.087],
        [side*.11,.29,.050,.073,.076]],{sides:12,rings:13});
      horn(k,extraPalm,'ember',[[0,-.09,0,.053],[side*.054,.039,.04,.062],
        [side*.068,.172,.067,.034],[side*.064,.236,.043,.004]]);
      shoulders.push({shoulder:extraArm,forearm:extraForearm,palm:extraPalm,side,raised:true});
    }
    const thigh=k.bone(body,side*width*.61,.71,-.02);
    const ankle=k.bone(thigh,side*width*.08,-.31,.014);
    skin(k,thigh,'silk',[[0,.036,0,.17,.145],[0,-.10,-.020,.164,.135],
      [side*.018,-.31,.001,.119,.108]]);
    skin(k,ankle,'rind',[[0,.017,0,.113,.113],[0,-.103,-.031,.104,.088],
      [side*.027,-.25,.031,.092,.087],[side*.045,-.30,.137,.094,.055]]);
    plate(k,thigh,'trim',[[side*.126,.101,.145],[side*-.129,.084,.155],[side*-.092,-.18,.147],
      [side*.052,-.238,.14],[side*.159,-.127,.121]],.060);
    for(let i=0;i<4;i++)horn(k,ankle,'edge',[[side*(i-.9)*.042,-.25,.118,.022],
      [side*(i-.91)*.047,-.28,.201,.017],[side*(i-.93)*.047,-.320,.216,.003]]);
    steps.push({thigh,ankle,side});
  }
  const [cape,strand,back]=spec.cloak;
  const fabric=k.bone(body,0,1.27,-depth*.8);
  pelt(k,fabric,cape,0,0,strand,mobile?7:12,'silk',back);
  pelt(k,fabric,cape*.96,-.035,.03,strand*.73,mobile?6:9,'rind',back*.82);
  if(floating){
    for(let i=0;i<8;i++){
      const a=i*tau/8,c=Math.cos(a),s=Math.sin(a);
      skin(k,body,i%2?'rind':'trim',[[.218*c,.71,.19*s,.092,.045],[.248*c,.42,.229*s,.094,.047],
        [.31*c,.25,.282*s,.051,.039],[.38*c,.075,.313*s,.006,.009]],
      {sides:7,rings:9,section:2.4,ridge:.20,seed:i});
    }
  }
  for(let i=0;i<5;i++){
    const x=(i-2)*cape*.14;
    horn(k,fabric,'trim',[[x,0,.055,.024],[x*1.14,-.21,-back*.19,.022],
      [x*1.2,-.45,-back*.39,.016],[x*1.25-.02,-strand*.78,-back*.89,.006]]);
  }
  if(['m135','m142','m146'].includes(entry.id))for(const side of sides){
    for(let i=0;i<(entry.id==='m142'?5:3);i++){
      const limb=k.bone(body,side*(.19+i*.031),.89+i*.12,-.12-i*.04);
      const twist=entry.id==='m135'?1.08:entry.id==='m142'?.74:.94;
      const rise=i*.19;
      horn(k,limb,i%2?'silk':'rind',[[0,0,0,.061],[side*(.41+i*.14),-.08+rise,-.026,.059],
        [side*(.68+i*.15),rise*1.58+.27,-.083,.047],
        [side*(.78+i*.15)*twist,rise*2.10+.46,-.141,.031],
        [side*(.69+i*.13)*twist,rise*2.31+.58,-.085,.003]]);
      threads.push({limb,side,i});
    }
  }
  if(entry.id==='m113'||entry.id==='m141')for(const side of sides){
    const ribbon=k.bone(body,side*.28,1.45,-.13);
    horn(k,ribbon,'edge',[[0,0,0,.052],[side*.19,.06,-.10,.064],[side*.38,-.12,-.10,.05],
      [side*.37,-.55,-.051,.043],[side*.48,-.94,.15,.041],[side*.57,-1.15,.25,.005]]);
    streamers.push(ribbon);
  }
  if(spec.frames==='carriage'){
    const palanquin=k.bone(body,0,.32,-.19);
    plate(k,palanquin,'rind',[[-.47,-.04,.01],[-.34,.26,.04],[.34,.26,.04],[.47,-.04,.02]],.57);
    for(const side of sides){
      horn(k,palanquin,'trim',[[side*.44,.08,-.32,.035],[side*.37,.26,-.24,.041],
        [side*.35,.26,.27,.041],[side*.43,.12,.33,.025]]);
      const plume=k.bone(body,side*.32,1.05,-.31);
      pelt(k,plume,.45,.20,-.075,.96,mobile?5:7,'ember',.43);
      streamers.push(plume);
    }
  }
  championRelief(k,body,head,shoulders,fabric,entry.id,mobile);
  return {body,head,pattern:spec.frames==='hover'?'hover':spec.frames==='ogre'?'slam':'duel',
    crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose({beat,headtime:t,wind,strike,travel,fall,step,stage}){
      body.rotation.x=-wind*.17+strike*(spec.frames==='ogre'?.59:.32);
      body.rotation.y=Math.sin(beat*.51)*.047+wind*.133-strike*.22;
      head.rotation.y=Math.sin(t*1.73)*.12+wind*.143-strike*.068;
      for(const {shoulder,forearm,palm,side,raised} of shoulders){
        const swing=Math.sin(step+side*Math.PI*.50)*travel*.29;
        if(raised){
          shoulder.rotation.set(-wind*.78+strike*.34,side*(wind*.49-strike*.32),
            side*(.14+wind*.29+stage*.11+Math.sin(t*3.2)*.09));
          forearm.rotation.x=-wind*.40+strike*.23;
          continue;
        }
        shoulder.rotation.set(swing-wind*(side>0?1.03:.62)+strike*(side>0?1.13:.72),side*(wind*.34-strike*.21),
          side*(.12+wind*.32+stage*.087));
        forearm.rotation.x=-.28-wind*(spec.frames==='hover'?.4:.32)+strike*.47+fall*.40;
        palm.rotation.y=side*(wind*.28-strike*.39);
      }
      for(const {thigh,ankle,side} of steps){
        const pace=Math.sin(step+side*Math.PI*.5);
        thigh.rotation.x=pace*travel*.48;
        ankle.rotation.x=-Math.max(0,pace)*travel*.46+floorCorrection(spec.frames,fall);
      }
      for(const {limb,side,i} of threads){
        limb.rotation.z=side*(Math.sin(t*3.55+i*.67)*.23+wind*.33-strike*.48);
        limb.rotation.y=side*(Math.cos(t*3.26-i*.73)*.20+stage*.22);
      }
      for(const [index,ribbon] of streamers.entries())ribbon.rotation.x=wind*.49+Math.sin(t*3.2+index)*.21-strike*.34;
      for(const element of crownParts)element.rotation.x=-wind*.23+strike*.77+Math.sin(t*2.4)*.16;
      fabric.rotation.x=wind*.32-strike*.34+travel*.20;
      if(seat){
        seat.rotation.y=t*.19+strike*.43;
        seat.scale.setScalar(1+wind*.088+stage*.10);
      }
      if(elephant){
        elephant.head.rotation.y=Math.sin(t*2.11)*.14+wind*.18-strike*.26;
        elephant.trunk.rotation.x=Math.sin(t*3.36)*.31-wind*.46+strike*.81;
        elephant.tail.rotation.y=Math.sin(t*3.31)*(.17+travel*.29);
        for(const {leg,hoof,side,z} of elephant.legs){
          const pace=Math.sin(step+side*Math.PI*.5+Math.sign(z)*Math.PI*.5);
          leg.rotation.x=pace*travel*.31+wind*.13-strike*.22;
          hoof.rotation.x=-Math.max(0,pace)*travel*.20;
        }
      }
    }};
}

const floorCorrection=(frames,fall)=>frames==='hover'?.13+fall*.31:fall*.13;
const iTrim=row=>row===0||row===3?'trim':'edge';

const beastProfiles={
  m129:{mode:'kirin',belly:[[0,.15,-.79,.28,.27],[0,.19,-.41,.38,.36],[0,.21,.18,.38,.37],
    [0,.30,.43,.27,.29],[0,.57,.65,.20,.22]],neck:[0,.72,.65],width:.23,length:.45,eyes:.033,
    arm:[.32,.08,.30],leg:[.29,.03,-.46],stride:.38,tails:[[0,.18,-.73,.18],[.04,.38,-1.12,.13],
      [.27,.72,-1.46,.08],[.44,.90,-1.63,.048],[.47,1.01,-1.86,.010]],
    horns:[[[.12,.15,-.06,.045],[.29,.27,-.17,.06],[.42,.47,-.34,.04],[.54,.66,-.53,.003]],
      [[.22,.25,-.14,.034],[.43,.36,-.19,.027],[.58,.4,-.26,.002]]],mane:[.88,.52,10],jaw:'hide'},
  m130:{mode:'rider',belly:[[0,.08,-.78,.26,.24],[0,.13,-.42,.36,.33],[0,.12,.09,.40,.29],
    [0,.14,.40,.39,.28],[0,.26,.56,.26,.21]],neck:[0,.39,.63],width:.26,length:.45,eyes:.040,
    arm:[.30,.18,.32],leg:[.28,.16,-.50],stride:.43,tails:[[0,.16,-.73,.17],[-.22,.28,-1.04,.12],
      [-.40,.50,-1.40,.089],[-.58,.49,-1.64,.035],[-.72,.56,-1.87,.012]],
    horns:[[[.17,.11,-.06,.047],[.31,.23,-.26,.043],[.46,.25,-.49,.003]]],mane:[.86,.36,12],jaw:'deep'},
  m132:{mode:'magma',belly:[[0,.01,-.70,.38,.30],[0,.17,-.39,.46,.40],[0,.31,.06,.52,.44],
    [0,.37,.36,.48,.38],[0,.43,.56,.34,.29]],neck:[0,.58,.66],width:.37,length:.35,eyes:.039,
    arm:[.44,.22,.36],leg:[.30,.03,-.51],stride:.27,tails:[[0,.14,-.62,.20],[.21,.26,-.98,.14],
      [.28,.43,-1.24,.08],[.13,.48,-1.49,.033],[0,.51,-1.63,.009]],
    horns:[[[.18,.12,-.06,.075],[.29,.25,-.20,.092],[.46,.37,-.36,.041],[.54,.50,-.48,.004]],
      [[.22,.04,.06,.073],[.40,.10,.15,.084],[.53,.20,.16,.039],[.59,.29,.20,.003]]],mane:[1.03,.51,13],jaw:'ember'},
  m140:{mode:'tiger',belly:[[0,.04,-.62,.29,.25],[0,.13,-.35,.39,.31],[0,.20,.09,.43,.34],
    [0,.23,.37,.40,.31],[0,.39,.52,.32,.24]],neck:[0,.57,.62],width:.31,length:.32,eyes:.039,
    arm:[.31,.20,.37],leg:[.30,.08,-.45],stride:.52,tails:[[0,.12,-.59,.18],[-.18,.25,-.97,.13],
      [-.37,.61,-1.21,.095],[-.44,.88,-1.24,.062],[-.55,1.02,-1.42,.018]],
    horns:[[[.17,.14,0,.067],[.28,.25,-.12,.056],[.32,.36,-.22,.005]]],mane:[.87,.35,11],jaw:'edge'},
  m144:{mode:'volcanic',belly:[[0,-.01,-.65,.40,.33],[0,.17,-.37,.49,.45],[0,.25,0,.56,.44],
    [0,.24,.37,.48,.39],[0,.32,.65,.35,.32]],neck:[0,.48,.72],width:.36,length:.43,eyes:.046,
    arm:[.44,.16,.34],leg:[.36,.06,-.49],stride:.31,tails:[[0,.06,-.69,.19],[-.19,.18,-1.04,.14],
      [-.26,.31,-1.37,.092],[-.17,.59,-1.58,.055],[-.04,.73,-1.79,.010]],
    horns:[[[.19,.19,-.07,.10],[.35,.40,-.21,.088],[.42,.75,-.35,.043],[.55,.88,-.46,.007]],
      [[.21,.04,-.01,.062],[.41,.21,-.04,.045],[.55,.37,-.12,.004]]],mane:[1.10,.67,14],jaw:'deep'},
  m145:{mode:'chaos',belly:[[0,.07,-.74,.33,.24],[0,.18,-.44,.36,.30],[0,.24,-.01,.49,.42],
    [0,.28,.31,.51,.43],[0,.34,.53,.31,.30]],neck:[0,.55,.67],width:.32,length:.35,eyes:.036,
    arm:[.44,.21,.30],leg:[.31,.03,-.52],stride:.36,tails:[[0,.16,-.71,.24],[.25,.26,-1.08,.15],
      [.44,.41,-1.31,.096],[.52,.61,-1.57,.061],[.40,.81,-1.89,.010]],
    horns:[[[.22,.19,-.05,.082],[.39,.34,-.18,.087],[.59,.48,-.32,.048],[.69,.66,-.41,.004]],
      [[.18,.22,-.13,.064],[.36,.72,-.36,.077],[.31,1.07,-.55,.028],[.34,1.24,-.65,.004]]],mane:[1.07,.42,13],jaw:'hide'},
  m149:{mode:'wind',belly:[[0,.11,-.65,.34,.28],[0,.23,-.23,.44,.36],[0,.29,.11,.46,.40],
    [0,.39,.35,.40,.37],[0,.53,.51,.32,.27]],neck:[0,.72,.64],width:.34,length:.43,eyes:.047,
    arm:[.35,.19,.33],leg:[.32,.08,-.44],stride:.43,tails:[[0,.17,-.62,.18],[-.22,.23,-1.11,.13],
      [-.50,.51,-1.46,.088],[-.49,.73,-1.54,.064],[-.62,.88,-1.72,.011]],
    horns:[[[.17,.19,-.06,.058],[.31,.32,-.18,.065],[.54,.45,-.25,.041],[.59,.52,-.38,.004]],
      [[.22,.038,.10,.043],[.45,.17,.24,.043],[.56,.39,.38,.022],[.45,.56,.48,.004]]],mane:[.91,.57,15],jaw:'edge'},
};

function quadruped(k,entry,mobile){
  const spec=beastProfiles[entry.id],body=k.bone(k.root,0,.78,0);
  skin(k,body,'hide',spec.belly,{sides:19,rings:27,section:2.42,ridge:.21,fur:spec.mode==='tiger'});
  const head=k.bone(body,...spec.neck),jaw=mouth(k,head,{...spec,brow:'rind',fangs:5});
  horns(k,head,spec.horns,spec.mode==='volcanic'?'ember':'edge');
  const joints=[],tail=makeTail(k,body,spec.tails),flames=[];
  const [spread,fringe,count]=spec.mane;
  for(const side of sides){
    pelt(k,head,spread*.30,-.08,-.20,fringe*.68,mobile?6:8,'rind',.27);
    for(let i=0;i<(mobile?Math.ceil(count*.61):count);i++){
      const t=i/(mobile?Math.ceil(count*.61):count);
      const x=side*(.24+Math.sin(t*1.95)*spread*.33),y=.56-Math.sin(t*2.17)*.31,z=.58-t*1.04;
      const scale=fringe*(.65+.35*Math.cos(t*3.76));
      if(spec.mode==='magma'||spec.mode==='volcanic'||spec.mode==='chaos'){
        const peak=k.bone(body,x,y,z);
        skin(k,peak,i%3?'rind':'ember',[[0,0,0,.108,.063],[side*.06,scale*.37,-.051,.091,.076],
          [side*.08,scale*.69,-.08,.036,.046],[side*.11,scale,-.207,.004,.004]],
        {sides:8,rings:8,section:2.8,ridge:.28,seed:i});
        horn(k,peak,'ember',[[side*.029,.035,.065,.023],[side*.041,scale*.31,.026,.039],
          [side*.072,scale*.56,-.030,.023],[side*.091,scale*.81,-.136,.004]]);
        flames.push({peak,side,i});
      }else{
        const path=[[x,y,z],[x+side*scale*.16,y+scale*.21,z-scale*.12],
          [x+side*scale*.27,y+scale*.25,z-scale*.45],[x+side*scale*.19,y+scale*.20,z-scale*.75]];
        horn(k,body,i%3===0?'edge':'rind',path.map(([x,y,z],j)=>[x,y,z,[.071,.060,.034,.003][j]]));
      }
    }
    for(const [fore,pivot] of [[true,spec.arm],[false,spec.leg]]){
      const [x,y,z]=pivot;
      const hip=k.bone(body,x*side,y,z),knee=k.bone(hip,side*(fore?.115:.14),-.30,fore?.027:-.066),
        paw=k.bone(knee,side*.087,-.285,.095);
      const bulk=spec.mode==='magma'||spec.mode==='volcanic'?.23:fore?.17:.193;
      skin(k,hip,'hide',[[0,.065,0,bulk,bulk*.84],[side*.105,-.072,.016,bulk*1.05,bulk*.86],
        [side*.131,-.30,.061,bulk*.64,bulk*.60]],{rings:15,sides:12,section:2.2});
      skin(k,knee,'rind',[[0,.012,-.01,bulk*.72,bulk*.64],[side*.052,-.15,.0,bulk*.63,bulk*.56],
        [side*.088,-.267,.077,bulk*.46,bulk*.48]]);
      skin(k,paw,['tiger','volcanic'].includes(spec.mode)?'ember':'hide',[[0,.029,-.036,bulk*.60,bulk*.55],
        [side*.044,-.081,.092,bulk*.76,bulk*.37],[side*.065,-.107,.229,bulk*.80,bulk*.33]],{section:2.6});
      for(let i=0;i<4;i++)horn(k,paw,'edge',[[side*(i-1.29)*.056,-.084,.19,.036],
        [side*(i-1.28)*.061,-.096,.291-i*.014,.024],[side*(i-1.23)*.067,-.139,.342-i*.017,.004]]);
      if(spec.mode==='tiger')for(let stripe=0;stripe<4;stripe++)horn(k,hip,'deep',[
        [side*.072,-.056-stripe*.055,-.14,.010],[side*.159,-.063-stripe*.051,-.06,.026],
        [side*.193,-.088-stripe*.057,.064,.028],[side*.13,-.108-stripe*.056,.127,.006]]);
      joints.push({hip,knee,paw,side,fore});
    }
    if(spec.mode==='tiger'||spec.mode==='wind')for(let i=0;i<8;i++){
      const z=.44-i*.139,x=side*(.18+.23*Math.sin((i+.93)*.28));
      horn(k,body,spec.mode==='tiger'?'deep':'edge',[[x*.61,.47,z,.022],[x,.35,z-.046,.032],
        [x*1.05,.19,z-.117,.046],[x*.83,.053,z-.167,.007]]);
    }
  }
  let rider;
  if(spec.mode==='rider'){
    rider=k.bone(body,0,.55,-.18);
    plate(k,rider,'trim',[[-.31,-.10,.05],[.31,-.10,.05],[.42,.11,.07],[.29,.24,-.032],
      [-.29,.24,-.032],[-.43,.10,.066]],.106);
    skin(k,rider,'silk',[[0,.07,-.07,.22,.145],[0,.32,.03,.22,.159],
      [0,.56,.033,.18,.136],[0,.76,.012,.22,.12],[0,.95,-.02,.09,.083]],{sides:14,rings:17});
    const riderHead=k.bone(rider,0,.93,.018);
    helmet(k,riderHead,{crown:'turban',crest:[.07,.15,.10]});
    for(const side of sides){
      horn(k,rider,'rind',[[side*.14,.69,.01,.09],[side*.29,.56,.09,.102],[side*.34,.42,.34,.070],
        [side*.42,.33,.36,.040]]);
      horn(k,rider,'trim',[[side*.40,.32,.36,.025],[side*.49,.14,.56,.016],
        [side*.35,.024,.63,.012],[side*.28,-.02,.69,.003]]);
    }
    pelt(k,rider,.89,.77,-.18,.70,mobile?8:12,'silk',.42);
  }
  if(spec.mode==='chaos')eye(k,head,0,.191,.255,.062,'ember');
  beastRelief(k,body,head,joints,spec,entry.id,mobile);
  return {body,head,pattern:spec.mode==='rider'?'gallop':'crawl',crest:blank(k,body),
    catalogueSculpt:entry.id,cataloguePose({beat,headtime:t,wind,strike,travel,fall,step,stage}){
      head.rotation.x=wind*.16-strike*.35+Math.sin(t*2.1)*.056;
      head.rotation.y=Math.sin(t*2.24)*.08+strike*.15;
      jaw.rotation.x=wind*.29+strike*.61;
      body.rotation.x=-.13*wind+strike*.22+Math.sin(step*1.86)*travel*.054;
      for(const {hip,knee,paw,side,fore} of joints){
        const stride=Math.sin(step+(fore?.0:Math.PI)+side*Math.PI*.52);
        hip.rotation.x=stride*travel*spec.stride+wind*.17-strike*(fore?.39:.22);
        hip.rotation.z=side*(fall*.37+strike*.06);
        knee.rotation.x=-Math.max(0,stride)*travel*.47+wind*.18+fall*.22;
        paw.rotation.x=Math.max(0,-stride)*travel*.25-strike*.32;
      }
      for(const [i,bone] of tail.entries())bone.rotation.y=Math.sin(beat*.63-i*.83)*(.12+travel*.17)+strike*.11;
      for(const {peak,i,side} of flames){
        peak.rotation.x=Math.sin(t*6.3+i*.68)*.19+wind*.20-strike*.17;
        peak.scale.y=1+wind*.13+strike*.29+stage*.13+Math.sin(t*7.2+i*.47)*.065*side;
      }
      if(rider)rider.rotation.x=wind*.31-strike*.38+Math.sin(step*1.75)*travel*.13;
    }};
}

const finish=(color,type='iron')=>{
  const properties={iron:[.48,.46],bronze:[.55,.46],hide:[.17,.62],bone:[.22,.57],cloth:[.12,.79]};
  return [color,...properties[type],type];
};
const four=(hide,rind,edge,silk,ember)=>({
  hide:finish(hide,'hide'),rind:finish(rind),edge:finish(edge,'bone'),
  silk:finish(silk,'cloth'),ember:finish(ember,'bronze'),
});

export const finishesC={
  m113:four(0x8b6048,0x963921,0xebd1b2,0xcdc5b1,0xf08a43),
  m116:{hide:[0x242b3a,.22,.62,'hide'],rind:[0x334356,.52,.45,'iron'],edge:[0x908877,.16,.70,'bone']},
  m118:four(0x654736,0x403c33,0xabc1ba,0x307e75,0xb8a347),
  m119:four(0x6e4d38,0x343c40,0xcbad82,0x5b526c,0xc29450),
  m120:four(0x777b84,0x364858,0xe5cfac,0x4f5a6a,0x936048),
  m121:{hide:[0x49343b,.13,.72,'hide'],rind:[0x353849,.36,.48,'hide'],edge:[0xb99f7d,.21,.58,'bone']},
  m123:{...four(0x72654e,0x4a3a2c,0xe4bf80,0x3b7773,0xa85f36),
    elephantHide:finish(0x493f36,'hide'),elephantArmor:finish(0x476b69,'iron')},
  m126:{hide:[0x583f31,.11,.70,'hide'],rind:[0x462521,.34,.58,'iron'],edge:[0xaca09a,.16,.62,'bone']},
  m127:{hide:[0x502821,.19,.66,'hide'],rind:[0x51434a,.54,.43,'iron'],edge:[0xc5b8a6,.22,.57,'bone'],
    membrane:[0x702d23,.15,.72,'hide']},
  m128:{hide:[0x262d2b,.19,.64,'hide'],rind:[0x393633,.44,.52,'iron'],edge:[0xae8d61,.22,.57,'bone'],
    membrane:[0x754e2a,.12,.63,'hide']},
  m129:four(0x784a27,0x9b6337,0xdacd9c,0xb18e63,0xc58c39),
  m130:four(0x1b3e53,0x29627a,0x91b8c1,0x354d94,0x77a2bd),
  m131:{hide:[0x28678f,.25,.58,'hide'],rind:[0x14466e,.50,.46,'iron'],edge:[0x9bc9d1,.23,.48,'bone'],
    membrane:[0x4a96b3,.20,.54,'hide'],ember:[0xbcd6db,.31,.50,'bone']},
  m132:four(0x4a1c1a,0x632b24,0xe8a174,0x4e2221,0xcf572c),
  m134:{hide:[0x242854,.23,.62,'hide'],rind:[0x335980,.51,.41,'iron'],edge:[0x9bcee5,.22,.44,'bone']},
  m135:four(0x95796c,0x254b68,0xb0d1d6,0x577994,0x638fac),
  m136:{hide:[0x973521,.15,.60,'hide'],rind:[0x433066,.23,.58,'hide'],edge:[0xffdbc2,.22,.46,'bone'],
    plume:[0xe5a24a,.18,.50,'hide'],ember:[0xdb592a,.15,.50,'hide']},
  m137:four(0x503024,0x5c2824,0xc9754b,0x8a3227,0xf05a32),
  m138:{hide:[0x3b827c,.19,.58,'hide'],rind:[0x27645e,.36,.52,'iron'],edge:[0xdbd5ba,.19,.50,'bone']},
  m139:four(0x675649,0x394049,0xc2a67a,0x3e416f,0xb58a47),
  m140:four(0xddd9cb,0x9babb5,0xf0ded0,0x31465e,0xaa402e),
  m141:four(0x61352f,0x332b32,0xd3c5b4,0x723130,0xa84334),
  m142:four(0x47401d,0x65561f,0xbe9b58,0x4b4c2c,0xa96f21),
  m143:four(0x645940,0x685a3a,0xd2c198,0x5a4e3c,0xc29d4e),
  m144:four(0x252222,0x464032,0xbf9677,0x503826,0xca7526),
  m145:four(0x383332,0x4d453b,0xaba081,0x574939,0xa98a52),
  m146:four(0x825f7c,0x383870,0x9b81a8,0x493f81,0x643572),
  m147:four(0x716549,0x504d3a,0xb1a37c,0x626847,0xa3824b),
  m149:four(0x314750,0x4b5f63,0x9ba8a7,0x3e606e,0x8ec9e2),
  m152:{hide:[0x174f5e,.24,.61,'hide'],rind:[0x116c7a,.46,.43,'iron'],edge:[0xb6bbc5,.26,.49,'bone'],
    ember:[0xac473b,.18,.58,'hide']},
  'raid-wyvern':{hide:[0x6d491d,.18,.66,'hide'],rind:[0x804c20,.46,.51,'bronze'],edge:[0xd6a068,.20,.55,'bone'],
    membrane:[0x8e6035,.16,.61,'hide']},
  'raid-flame':four(0x47302a,0x422f2a,0xcb7e58,0x6f3c31,0xe27432),
};
for(const [id,spec] of Object.entries(designsC)){
  finishesC[id].patina=[spec.streak,.58,.49,['ash','regent','fiend'].includes(spec.face)?'bronze':'iron'];
}
for(const [id,color] of Object.entries(creaturePatinas))finishesC[id].patina=[color,.38,.56,'iron'];
finishesC.m132.cinder=[0xc55f3c,.22,.47,'stone'];
finishesC.m144.cinder=[0xe86220,.19,.47,'stone'];

const sculptors={m116:serpent,m121:wolfSpider,m126:serpent,m127:wyvern,m128:wyvern,m131:wyvern,
  m134:iceTurtle,m136:vermilionBird,m138:serpent,m152:serpent,'raid-wyvern':wyvern};

export function sculptC(k,entry,mobile){
  if(championProfiles[entry.id])return jointedChampion(k,entry,mobile);
  if(beastProfiles[entry.id])return quadruped(k,entry,mobile);
  return sculptors[entry.id]?.(k,entry,mobile)??null;
}
