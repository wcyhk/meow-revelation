import {sculptTaotie,taotieFinishes} from './taotie-sculpts.mjs?v=taotie-1';
import {nightmareFinishes,nightmareSculpts} from './nightmare-boss-forms.mjs?v=nightmare-anatomy-1';
import * as T from '../three.min.mjs';
import {hundunFinishes,sculptPrimordialHundun} from './primordial-hundun.mjs?v=thunder-claws-1';
import {jadeDragonAtelier,jadeDragonFinishes} from './jade-dragon-atelier.mjs?v=tidal-jade-1';
import {carveElephantDisciple,elephantDiscipleFinishes} from './elephant-disciple.mjs?v=ivory-disciple-1';
import {anantaFinishes,sculptAnanta} from './ananta-sculpt.mjs?v=seven-cobra-1';
import {carveScarletRitual,scarletRitualFinishes} from './scarlet-ritual-sculpt.mjs?v=scarlet-ritual-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=forgeburst-1';
import {sculptGreedFace,sculptGreedLimbs,sculptGreedTail,sculptGreedTorso} from './greed-dragon.mjs?v=atelier-3';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {beastRelief,championRelief,creaturePatinas,curvedPlate,designsC,serpentRelief} from './catalogue-c-detail.mjs?v=maskwork-1';
import {fittedChampionArmor,identityFinishes,sculptChampionFace} from './catalogue-human-c.mjs?v=maskwork-1';
import {sculptWhiteTigerChampion} from './white-tiger-sculpt.mjs?v=champion-3';
import {sculptWindTaowu} from './wind-taowu-sculpt.mjs?v=wind-crown-1';
import {sculptDesertKirin} from './late-disciple-kirin.mjs?v=primal-1';
import {heavenlyFinishes,sculptHeavenlyKing} from './heavenly-kings.mjs?v=heavenly-kings-1';
import {coastalFinishes,sculptCoastalDragon} from './coastal-dragons.mjs?v=coastal-dragons-1';
import {carveTempleDisciple,templeDiscipleFinishes} from './temple-disciples.mjs?v=temple-disciples-1';
import {agasuraFinishes,carveAgasura} from './agasura-sculpt.mjs?v=agasura-sinuous-1';
import {carveGhostKhan,ghostKhanFinishes} from './ghost-khan.mjs?v=ghost-khan-1';
import {hyunmuFinishes,inscribeShell,hyunmuSkull,sculptCoil,designStreamers} from './hyunmu-glacier.mjs?v=glacial-carapace-1';
import {carveVermilionBird,vermilionFinishes} from './vermilion-phoenix.mjs?v=vermilion-feathers-1';

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
    [.08,.63,.43,.32,.23],[.14,.85,.65,.24,.22],[.157,1.188,.624,.189,.175]],
    path:[[0,.32,-.71,.36],[-.21,.31,-1.29,.30],[-.44,.42,-1.74,.22],[-.34,.62,-2.11,.155],
      [-.09,.85,-2.37,.092],[.05,1,-2.61,.018]],skull:[.154,1.203,.633],
    width:.34,length:.59,eyes:.043,style:'greed',spines:12,
    antlers:[[[.18,.12,-.03,.041],[.33,.20,-.17,.038],[.40,.255,-.32,.004]],
      [[.23,.01,-.02,.049],[.38,-.020,-.20,.038],[.48,-.07,-.34,.004]]]},
};

function serpent(k,entry,mobile){
  const spec=serpentProfiles[entry.id],body=k.bone(k.root,0,.06,0),neck=blank(k,body);
  const greed=spec.style==='greed';
  const main=spec.core;
  if(greed)sculptGreedTorso(k,neck,mobile);
  else skin(k,neck,'hide',main,{rings:27,sides:16,section:2.35});
  const line=new T.CatmullRomCurve3(main.map(([x,y,z])=>vector([x,y,z])));
  const ribs=greed?0:mobile?13:21;
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
  if(greed)sculptGreedTail(k,tail,mobile);
  const head=k.bone(neck,...spec.skull);
  const jaw=greed?sculptGreedFace(k,head,mobile):mouth(k,head,{...spec,brow:'rind',jaw:'edge',fangs:4});
  horns(k,head,spec.antlers);
  if(!greed)serpentRelief(k,neck,head,line,entry.id,mobile);
  const jade=spec.style==='jade'?jadeDragonAtelier(k,{neck,head,jaw,spine:line},mobile):null;
  const flourishes=[];
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
    sculptGreedLimbs(k,hip,ankle,side,z>0,mobile);
    flourishes.push(hip);
  }
  return {body,head,inspectionHead:jade?head:undefined,pattern:spec.style==='greed'?'crawl':'coil',
    crest:blank(k,body),catalogueSculpt:entry.id,
    cataloguePose(pose){
      const {headtime,travel,wind,strike,fall,stage,step}=pose;
      neck.rotation.set(wind*.21-strike*.25,Math.sin(headtime*1.72)*(.058+travel*.08),Math.sin(headtime*1.41)*.05);
      head.rotation.y=Math.sin(headtime*1.88)*.073-wind*.075+strike*.16;
      jaw.rotation.x=.05+wind*.14+strike*.59+stage*.068;
      jade?.(pose);
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
  const abdomen=k.bone(body,0,.117,-.249);
  abdomen.name='沙漠女王蜘蛛 · 腹節甲';
  skin(k,body,'rind',[[0,-.083,-.292,.28,.211],[0,-.02,-.07,.39,.27],
    [0,.027,.241,.347,.253],[0,.091,.443,.215,.143]],{sides:15,rings:20,section:2.55});
  skin(k,abdomen,'spiderCarapace',[[0,-.139,.21,.237,.191],[0,.051,.061,.454,.34],[0,.236,-.209,.648,.454],
    [0,.379,-.552,.717,.556],[0,.453,-.907,.492,.421],[0,.378,-1.119,.218,.231]],{sides:18,rings:26,section:2.29});
  skin(k,head,'rind',[[0,.04,-.18,.28,.19],[0,.004,-.04,.36,.23],[0,-.038,.16,.35,.20],
    [0,-.171,.39,.20,.12],[0,-.24,.52,.09,.038]],{rings:16,sides:15,section:2.65});
  const limbs=[],mandibles=[],barbs=[];
  const ribs=mobile?7:10;
  for(let i=0;i<ribs;i++){
    const t=i/(ribs-1),zr=-.22-t*.75,yr=.56+t*.05;
    for(const side of sides){
      const broad=.49+Math.sin(t*Math.PI)*.24;
      curvedPlate(k,abdomen,i%4===1?'spiderRim':'spiderCarapace',[[side*.013,yr+.223,zr,.094,.055],
        [side*.168,yr+.249,zr+.029,.107,.073],[side*(broad*.57),yr+.191,zr+.031,.129,.068],
        [side*broad,yr-.073,zr+.014,.093,.064],[side*(broad*.91),yr-.245,zr-.056,.009,.007]]);
      horn(k,abdomen,'deep',[[side*.032,yr+.26,zr-.051,.017],
        [side*(broad*.50),yr+.252,zr-.024,.025],[side*broad,yr-.088,zr+.033,.004]]);
      const pin=k.bone(abdomen,side*broad*.58,yr+.107,zr-.037);
      pin.name='女王蜘蛛 · 棘層';
      horn(k,pin,'spiderRim',[[0,-.028,.035,.073],[side*.055,.079,-.039,.071],
        [side*.105,.194,-.096,.039],[side*.157,.239-t*.061,-.18,.005]]);
      barbs.push({pin,side,t});
    }
  }
  for(const side of sides){
    for(const [i,[x,y,z,spread,angle]] of [[.27,-.02,.59,.52,.22],[.37,.04,.34,.71,.08],
      [.43,.08,.01,.82,-.13],[.43,.14,-.28,.71,-.34]].entries()){
      const hip=k.bone(body,side*x,y,z),knee=k.bone(hip,side*spread,.50,angle);
      horn(k,hip,'spiderRim',[[0,-.03,0,.094],[side*.19,.22,angle*.50,.118],
        [side*spread*.7,.50,angle*.75,.115],[side*spread,.51,angle,.085]]);
      horn(k,hip,'edge',[[side*.034,.096,.066],[side*.201,.29,.009],
        [side*spread*.68,.519,angle*.70,.055],[side*spread,.568,angle+.027,.004]]);
      horn(k,knee,'rind',[[0,0,0,.101],[side*.19,-.137,angle*.40,.094],
        [side*.24,-.40,angle*.68,.061],[side*.31,-.81,angle*1.45,.027],[side*.25,-.99,angle*1.59,.003]]);
      horn(k,knee,'edge',[[side*.03,-.04,.048,.047],[side*.14,-.21,.066,.055],
        [side*.242,-.45,.067,.043],[side*.28,-.77,.044,.004]]);
      for(let g=0;g<4;g++){
        const t=g/4;
        for(const direction of sides)horn(k,knee,'deep',[[side*(.17+t*.11),-.24-t*.44,direction*.063,.016],
          [side*(.22+t*.13),-.32-t*.42,direction*.103,.012],[side*(.25+t*.12),-.43-t*.44,direction*.135,.002]]);
      }
      for(let l=0;l<3;l++){
        const y=-.157-l*.186,w=.055-l*.011;
        curvedPlate(k,knee,l%2?'spiderRim':'spiderCarapace',[[side*.103,y+.094,.059,w,.036],
          [side*.186,y+.07,.096,w*1.17,.035],[side*.269,y-.022,.06,w*.93,.028],
          [side*.311,y-.095,-.07,.004,.006]]);
      }
      limbs.push({hip,knee,i,side});
    }
    pelt(k,body,.89,.36,-.96,.34,mobile?8:13,'edge',.35);
    for(let i=0;i<5;i++){
      const a=i*.27;
      eye(k,head,side*(.062+i*.059),.062-a*.067,.333-a*.097,.037-i*.003);
    }
    const mouth=k.bone(head,side*.181,-.114,.234);
    mouth.name='女王蜘蛛 · 腭鉗';
    horn(k,mouth,'edge',[[side*.023,.014,.041,.073],[side*.155,-.079,.226,.081],
      [side*.136,-.224,.379,.055],[side*.004,-.268,.389,.007]]);
    horn(k,mouth,'deep',[[side*.067,-.09,.177,.054],[side*.156,-.066,.305,.059],[side*.212,-.161,.465,.004]]);
    for(let i=0;i<4;i++){
      const y=.067-i*.071,z0=.094+i*.065;
      curvedPlate(k,head,i%3?'spiderCrest':'rind',[[side*.022,y+.064,z0,.058,.039],
        [side*.148,y+.100,z0-.043,.090,.058],[side*.255,y+.032,z0-.101,.073,.045],
        [side*.286,y-.091,z0-.168,.007,.009]]);
    }
    mandibles.push({mouth,side});
  }
  for(let i=0;i<7;i++){
    const z=-.27-i*.123,y=.46+Math.sin(i*.55)*.35;
    for(const side of sides)horn(k,body,i%2?'edge':'rind',[[side*(.36+i*.024),y,z,.077],
      [side*(.43+i*.017),y+.17,z-.06,.065],[side*(.41+i*.016),y+.26,z-.18,.004]]);
  }
  return {body,head,pattern:'crawl',crest:blank(k,body),catalogueSculpt:entry.id,sourceSculpt:true,
    polishEnergy:{tint:0xe0b98c,shape:'sigils',anchor:abdomen,span:[.79,.68,.77]},
    cataloguePose({wind,strike,headtime,step,travel,fall}){
      body.rotation.x=-wind*.31+strike*.26;
      abdomen.rotation.x=.034*Math.sin(headtime*2.1)-wind*.19+strike*.27;
      for(const {pin,side,t} of barbs)pin.rotation.z=side*(Math.sin(headtime*3.8-t*8)*.042+wind*.081-strike*.13);
      for(const {mouth,side} of mandibles){
        mouth.rotation.y=side*(.12+Math.sin(headtime*3.2+side)*.09+wind*.47-strike*.26);
        mouth.rotation.x=wind*.13-strike*.43;
      }
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
  const shoulders=[],legs=[],tethers=[],webs=[];
  for(const side of sides){
    const [x,y,z]=spec.shoulders;
    const shoulder=k.bone(body,x*side,y,z);
    const vertices=spec.wing.map(([x,y,z])=>[x*side,y,z]);
    const tip=vertices[3],joint=vertices[2];
    webs.push({shoulder,vertices,side});
    const strut=(target,index)=>horn(k,shoulder,index%2===0?'rind':'trim',[[0,0,.012,.092],
      [joint[0]*.66,joint[1]*.79,joint[2]*.79,.081],[joint[0],joint[1],joint[2],.065],
      [target[0]*.81,target[1]*.74+joint[1]*.23,target[2]*.65,.043],[...target,.005]]);
    strut(tip,0);
    for(const [index,v] of [5,7,9].entries())strut(vertices[v],index+1);
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
  return {body,head,webs,pattern:'wing',crest:blank(k,body),catalogueSculpt:entry.id,
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

function glacierCrystal(k,parent,width,height,tilt,seed,mobile){
  const faces=mobile?5:6,positions=[],uv=[],colors=[],index=[];
  const tiers=[[-.077,1.06,.01,0],[.042,1.24,-.011,.10],
    [height*.61,.76,-.104,.62],[height*.842,.34,-.164,.88]];
  const points=tiers.map(([y,r,z,offset],ring)=>Array.from({length:faces},(_,i)=>{
    const angle=seed*.42+i*Math.PI*2/faces+ring*.12;
    const ripple=1+.20*Math.cos(i*4.4+seed*.87);
    return [Math.cos(angle)*r*width*ripple+tilt*offset,y+Math.sin(i*2.5+seed)*width*.14,
      Math.sin(angle)*r*width*ripple+z];
  }));
  const tip=[tilt,height,-.232];
  function facet(polygon,shine){
    const start=positions.length/3;
    for(const [j,p] of polygon.entries()){
      positions.push(...p);uv.push(j%2,Math.floor(j/2)*.7+((j+1)%2)*.08);
      const m=shine-(j%2)*.16;
      colors.push(m*.68,m*.95,m*1.27);
    }
    index.push(start,start+1,start+2);
    if(polygon.length===4)index.push(start,start+2,start+3);
  }
  for(let i=0;i<faces;i++){
    const next=(i+1)%faces;
    for(let j=0;j<points.length-1;j++){
      const shine=.56+.28*Math.cos(i*2.43+seed*.42+j*.87)+.054*j;
      facet([points[j][i],points[j+1][i],points[j+1][next],points[j][next]],shine);
    }
    facet([points.at(-1)[i],tip,points.at(-1)[next]],.79+i*.048);
    if(i%2===0){
      const ridgesteps=points.map(row=>row[i]);
      const ticks=ridgesteps.map(([x,y,z],j)=>[x,y+.004,z,.019-j*.0032]);
      horn(k,parent,i%4?'iceMelt':'iceRidge',[...ticks,[tip[0],tip[1]-.025,tip[2],.002]]);
    }
    if(i===1||i===4){
      const mid=points[2][i],low=points[1][next],high=points[3][next];
      horn(k,parent,'iceMelt',[[low[0],low[1],low[2]+.008,.004],
        [mid[0]*.57+low[0]*.43,mid[1]*.57+low[1]*.43,mid[2]*.57+low[2]*.43,.010],
        [mid[0]*.66+high[0]*.34,mid[1]*.66+high[1]*.34,mid[2]*.66+high[2]*.34,.005],
        [high[0],high[1],high[2]+.008,.001]]);
    }
  }
  const mesh=new T.BufferGeometry().setIndex(index);
  mesh.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  mesh.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  mesh.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  mesh.computeVertexNormals();
  k.geometry(parent,'iceFacet',mesh);
}

function glacialPlastron(k,body){
  skin(k,body,'iceScute',[[0,-.168,.729,.218,.099],[0,-.225,.448,.407,.127],
    [0,-.246,.065,.547,.135],[0,-.221,-.342,.476,.137],[0,-.179,-.684,.367,.096],
    [0,-.126,-.897,.187,.073]],{rings:24,sides:21,section:2.69,ridge:.31});
  for(const side of sides){
    const p=path=>path.map(([x,...rest])=>[side*x,...rest]);
    for(let row=0;row<6;row++){
      const t=row/5,z=.62-t*1.33,y=-.239-Math.sin(t*Math.PI)*.116;
      const w=.228+Math.sin(t*Math.PI)*.369;
      const scute=p([[.011,y+.049,z+.074],[w*.53,y+.031,z+.10],[w*.88,y+.073,z+.032],
        [w*1.05,y+.153,z-.067],[w*.77,y+.026,z-.158],[w*.54,y-.019,z-.183],
        [.025,y-.022,z-.101]]);
      plate(k,body,row%3?'iceScale':'iceScute',scute,.065);
      horn(k,body,'iceRidge',scute.slice(2,6).map(([x,y,z])=>[x+side*.022,y+.022,z,.015-row*.0013]));
      horn(k,body,'iceMelt',p([[w*.42,y+.051,z+.102,.011],[w*.68,y+.039,z+.047,.021],
        [w*.85,y+.081,z-.029,.017],[w*.88,y+.106,z-.067,.004]]));
    }
    const spur=p([[.247,-.121,-.789],[.429,-.036,-.814],[.556,.073,-.906],
      [.563,.001,-1.037],[.466,-.111,-1.124],[.215,-.219,-1.003],[.076,-.218,-.873]]);
    plate(k,body,'iceScute',spur,.067);
    horn(k,body,'iceRidge',spur.slice(1,6).map(([x,y,z])=>[x,y+.028,z-.018,.019]));
  }
}

function glacialLimb(k,limb,ankle,side,fore,mobile){
  const p=path=>path.map(([x,...rest])=>[side*x,...rest]);
  skin(k,limb,'iceScale',p([[-.031,.066,-.029,.154,.137],[.081,.022,-.014,.173,.152],
    [.150,-.071,.004,.133,.111],[.171,-.156,.024,.105,.099],[.186,-.227,.05,.114,.087]]),
  {sides:mobile?11:15,rings:mobile?12:17,section:2.57,ridge:.29});
  skin(k,ankle,'iceScute',p([[0,.087,-.045,.107,.097],[.025,-.039,.024,.122,.096],
    [.052,-.122,.113,.127,.080],[.080,-.173,.214,.115,.055],[.070,-.22,.262,.080,.038]]),
  {sides:mobile?11:15,rings:mobile?13:17,section:2.64,ridge:.28});
  for(let row=0;row<3;row++){
    const y=.058-row*.069,z=fore===1?.046:-.042,w=.088+row*.024;
    const rank=p([[.019+w,y+.069,z+.087],[.084+w,y+.052,z+.091],[.108+w,y+.014,z+.028],
      [.094+w,y-.059,z-.076],[.040+w,y-.091,z-.117],[.028+w,y-.041,z-.034]]);
    plate(k,limb,row%2?'iceScale':'rind',rank,.040);
    horn(k,limb,'iceRidge',rank.slice(1,5).map(([x,y,z])=>[x+side*.011,y+.015,z,.013]));
    const heel=p([[.03,y+.020,z-.08],[.077,y+.034,z-.114],[.119,y-.019,z-.092],
      [.118,y-.085,z-.031],[.048,y-.085,z+.023]]);
    plate(k,ankle,row%2?'iceScute':'iceScale',heel,.037);
  }
  for(let i=0;i<4;i++){
    const x=(i-1.45)*.054,z=.190+Math.sin(i*.92)*.057;
    skin(k,ankle,i%2?'iceScale':'iceScute',p([[x,-.151,z,.036,.032],[x+.011,-.178,z+.054,.033,.036],
      [x+.020,-.201,z+.101,.020,.017]]),{sides:8,rings:9,section:2.44,ridge:.26});
    horn(k,ankle,i===2?'iceMelt':'iceRidge',p([[x+.021,-.19,z+.093,.023],
      [x+.029,-.198,z+.137,.022],[x+.028,-.234,z+.176,.002]]));
  }
}

function iceTurtle(k,entry,mobile){
  const body=k.bone(k.root,0,.59,-.07);
  skin(k,body,'hide',[[0,-.042,-.92,.29,.25],[0,.082,-.62,.58,.378],[0,.12,-.16,.78,.49],
    [0,.143,.32,.73,.44],[0,.052,.68,.54,.278],[0,-.09,.86,.29,.17]],{sides:22,rings:29,section:2.53});
  inscribeShell(k,body,mobile);
  glacialPlastron(k,body);
  const limbs=[];
  const crystal=(x,y,z,w,h,tilt,seed)=>{
    const p=Math.sign(x||1);
    const shard=k.bone(body,x,y,z);
    glacierCrystal(k,shard,w,h,p*tilt,seed,mobile);
    return shard;
  };
  const iceCrown=[[.012,.75,-.20,.104,.63,.041],[-.026,.70,-.58,.092,.59,-.013],[.016,.63,.285,.092,.51,.04],
    [-.38,.53,-.17,.097,.49,.28],[.39,.535,-.15,.102,.53,.31],[-.61,.32,.26,.083,.39,.34],[.61,.32,.24,.086,.42,.34],
    [-.43,.45,-.58,.083,.47,.29],[.44,.45,-.58,.082,.45,.27],[-.55,.155,-.78,.077,.281,.21],[.53,.178,-.77,.078,.32,.22]];
  for(const [seed,row] of iceCrown.entries())crystal(...row,seed+2);
  for(const side of sides){
    for(const fore of [-1,1]){
      const limb=k.bone(body,.54*side,-.02,fore*.52),ankle=k.bone(limb,side*.17,-.23,0);
      glacialLimb(k,limb,ankle,side,fore,mobile);
      limbs.push({limb,ankle,side,fore});
    }
  }
  const face=k.bone(body,0,.091,.655);
  skin(k,face,'iceScale',[[0,-.07,-.19,.198,.158],[.008,.072,.093,.172,.156],[.007,.216,.283,.142,.127],
    [0,.301,.379,.130,.121]],{sides:13,rings:18,section:2.60});
  skin(k,face,'snakeBelly',[[0,-.033,-.044,.112,.108],[.008,.081,.145,.123,.152],
    [.016,.18,.275,.103,.111]],{sides:13,rings:16,section:2.42});
  const head=k.bone(face,0,.263,.405);
  const jaw=hyunmuSkull(k,head,mobile);
  const snake=sculptCoil(k,body,mobile),streamers=designStreamers(k,body);
  const ice=k.materials.iceMelt;
  ice.emissive.setHex(0x478e92);
  return {body,head,pattern:'crawl',crest:blank(k,body),catalogueSculpt:entry.id,sourceSculpt:true,grounded:true,
    disposeRig:()=>snake.skeleton.dispose(),
    sourceDress(tools){
      for(const {root,side,paths} of streamers)for(const [i,path] of paths.entries())tools.silk(root,'玄武 · 分叉流冰鰭',path,
        {tint:i?0x4966ad:0xa3d2e8,trim:i===2?0x566aaa:0xb9e4ea,style:'membrane',phase:side*.45+i*.57,flex:.89,across:[.91,.24,.15]});
      return true;
    },
    polishEnergy:{tint:0x91e8e8,shape:'mist',anchor:body,offset:[0,.26,-.37],span:[.94,.70,.93]},
    cataloguePose({beat,wind,strike,travel,headtime,fall,step,stage}){
      for(const {limb,ankle,side,fore} of limbs){
        const phase=step+side*Math.PI*.5+fore*Math.PI*.5;
        limb.rotation.x=Math.sin(phase)*travel*.32+wind*.16-strike*.29;
        ankle.rotation.x=-Math.max(0,Math.cos(phase))*travel*.31+fall*.22;
      }
      face.rotation.y=wind*.25+Math.sin(headtime*1.92)*.14;
      face.rotation.x=-wind*.18+strike*.32;
      head.rotation.x=-wind*.12+strike*.14;
      jaw.rotation.x=.075+wind*.12+strike*.57;
      snake.jaw.rotation.x=wind*.39+strike*.55;
      for(const [i,bone] of snake.bones.entries()){
        bone.rotation.y=Math.sin(beat*.48-i*.57)*(.047+travel*.07)+strike*.067;
        bone.rotation.x=Math.sin(beat*.62-i*.68)*.071+(i>3?wind*.082-strike*.052:0);
      }
      for(const {root,side} of streamers){
        root.rotation.y=side*(Math.sin(beat*.73)*.11+wind*.15-strike*.29);
        root.rotation.x=.032+Math.cos(beat*.83+side)*.11+wind*.21-strike*.30;
      }
      ice.emissiveIntensity=.19+wind*.26+strike*.52+stage*.18;
    }};
}

const championProfiles={
  m113:{frames:'raiment',size:[.27,1.72,.32],crown:'flame',weapon:'wheel',faces:1,
    armor:[.40,.31,.22],position:[.11,.14,.31],cloak:[.69,.82,.21],crest:[.14,.28,.20]},
  m120:{frames:'guard',size:[.37,1.73,.29],crown:'elephant',weapon:'axe',faces:1,
    armor:[.53,.28,.27],position:[.17,.39,.19],cloak:[.52,.58,.21],crest:[.13,.38,.13]},
  m123:{frames:'carriage',size:[.29,1.94,.27],crown:'indra',weapon:'sceptre',faces:1,
    armor:[.41,.31,.22],position:[.10,.11,.25],cloak:[.48,.61,.23],crest:[.24,.44,.31]},
  m135:{frames:'hover',size:[.25,1.71,.25],crown:'plait',weapon:'lotus',faces:1,
    armor:[.33,.13,.18],position:[.05,.26,.30],cloak:[.40,.89,.24],crest:[.11,.29,.24]},
  m137:{frames:'guard',size:[.30,1.94,.29],crown:'horns',weapon:'sword',faces:1,
    armor:[.44,.26,.24],position:[.14,.17,.28],cloak:[.61,.78,.29],crest:[.15,.30,.10]},
  m139:{frames:'guard',size:[.35,2.07,.26],crown:'spurs',weapon:'bow',faces:1,
    armor:[.54,.31,.24],position:[.11,.23,.29],cloak:[.81,.82,.31],crest:[.12,.34,.12]},
  m141:{frames:'guard',size:[.34,2.04,.39],crown:'tusks',weapon:'halberd',faces:1,
    armor:[.44,.35,.21],position:[.18,.30,.30],cloak:[.76,.97,.41],crest:[.13,.24,.23]},
  'raid-flame':{frames:'ogre',size:[.45,1.93,.40],crown:'slag',weapon:'gauntlets',faces:1,
    armor:[.66,.41,.26],position:[.12,.39,.19],cloak:[.72,.46,.27],crest:[.21,.45,.13]},
};

function helmet(k,head,spec,id=null,mobile=false){
  const [width,height,depth]=spec.crest;
  if(id)sculptChampionFace(k,head,id,mobile);
  else skin(k,head,spec.crown==='moth'?'silk':'hide',[[0,-.16,.02,.095,.115],[0,-.084,0,.131,.134],
      [0,.068,0,.154,.141],[0,.166,-.026,.148,.135],[0,.242,-.052,.09,.098]],
    {rings:15,sides:14,section:2.4,ridge:.11});
  skin(k,head,'rind',[[0,.038,-.080,.171,.113],[0,.099,-.11,.173,.158],
    [0,.20,-.098,.162,.134],[0,.29,-.086,.106,.081],[0,.333,-.07,.025,.041]],
  {rings:13,sides:13,section:2.3});
  if(!id)for(const side of sides){
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
  }else if(spec.crown==='indra'){
    for(const side of sides)for(let i=0;i<(mobile?5:8);i++){
      const t=i/(mobile?5:8),x=side*(.024+t*.091),width=.031+.022*t;
      skin(k,head,i%3?'deep':'indraHair',[[x,.146-t*.028,-.02,width,.049],
        [x*1.23,.268+t*.035,-.079,width*1.27,.061],[x*1.76,.426+t*.040,-.137,width*.94,.046],
        [x*2.18,.530+t*.023,-.243,width*.51,.025],[x*2.28,.616-t*.062,-.32,.004,.005]],
      {rings:mobile?8:12,sides:mobile?7:10,section:2.19,ridge:.13,seed:i*3.2});
    }
    horn(k,head,'trim',[[-.126,.181,.080,.019],[-.063,.204,.125,.020],[0,.176,.161,.023],
      [.069,.199,.124,.022],[.139,.167,.054,.011]]);
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

function armament(k,palm,kind,side,radius){
  const group=k.bone(palm,0,0,0);
  const stave=(a,b,r=.041)=>k.rod(group,'deep',a,b,r);
  const loop=(color,x,y,z,r,rx=0)=>k.mesh(group,'ring',color,x,y,z,r,r,1,rx);
  if(kind==='wheel'){
    const x=side*.28;
    markEnemyWeapon(group,[x,.23,.18],{from:[x,-.50,.18],width:.33,aim:false,kind:'ring'});
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
    markEnemyWeapon(group,[side*.72,-.09,.14],{width:.25,kind:'bow'});
    const chain=[[.06,-.77,.10,.033],[side*.27,-.65,.10,.064],[side*.42,-.37,.15,.055],
      [side*.29,-.11,.20,.055],[side*.42,.33,.13,.052],[side*.29,.60,.085,.075],
      [.07,.75,.10,.03]];
    horn(k,group,'rind',chain);
    horn(k,group,'trim',chain.map(([x,y,z,r])=>[x,y,z+.065,r*.38]));
    stave([.06,-.76,.09],[.07,.75,.09],.009);
    return;
  }
  if(kind==='sword'){
    markEnemyWeapon(group,[.01,1.51,.15],{from:[0,0,.15],width:.17});
    stave([0,-.26,.15],[0,.29,.15],.055);
    plate(k,group,'ember',[[-.12,.20,.152],[-.22,.52,.15],[-.28,.92,.15],[-.13,1.27,.15],
      [.01,1.51,.15],[.11,1.35,.15],[.013,.98,.16],[.07,.74,.15],[.10,.23,.15]],.078);
    horn(k,group,'edge',[[-.14,.24,.19,.028],[-.23,.60,.19,.025],[-.21,.98,.19,.022],
      [.008,1.51,.18,.004]]);
    horn(k,group,'trim',[[-.16,.26,.14,.044],[0,.185,.14,.072],[.15,.27,.14,.047],[.23,.42,.14,.004]]);
    return;
  }
  markEnemyWeapon(group,[0,1.52,.13],{from:[0,0,.11],width:kind==='axe'||kind==='halberd'?.26:.17,aim:kind!=='sceptre'});
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
  mount.scale.set(1.4,1.36,1.42);
  skin(k,mount,'elephantHide',[[0,.28,-.72,.24,.21],[0,.39,-.49,.41,.32],[0,.51,-.12,.49,.43],
    [0,.53,.25,.47,.39],[0,.54,.46,.39,.29],[0,.42,.62,.26,.25]],
  {sides:18,rings:24,section:2.5,ridge:.21});
  const head=k.bone(mount,0,.47,.51);
  skin(k,head,'elephantHide',[[0,-.21,.08,.18,.15],[0,-.12,.103,.23,.212],
    [0,.079,.047,.27,.225],[0,.24,-.041,.249,.17],[0,.32,-.086,.146,.095]],
  {sides:15,rings:18,section:2.35});
  const trunk=k.bone(head,0,-.105,.214);
  skin(k,trunk,'elephantHide',[[0,0,0,.116,.11],[0,-.13,.12,.112,.105],[0,-.39,.247,.080,.072],
    [0,-.48,.406,.060,.054],[.08,-.49,.535,.044,.046],[.126,-.434,.563,.029,.033]],
  {rings:15,sides:12,section:2.12,ridge:.16});
  const tail=k.bone(mount,0,.31,-.61);
  horn(k,tail,'elephantHide',[[0,0,0,.07],[-.13,-.09,-.23,.051],[-.21,-.27,-.30,.038],[-.24,-.40,-.44,.010]]);
  const chest=k.bone(head,0,.074,.19);
  plate(k,chest,'indraRusset',[[-.198,.066,-.011],[-.155,.243,-.058],[0,.282,-.081],
    [.155,.243,-.058],[.198,.066,-.011],[.145,-.115,.076],[0,-.142,.109],[-.145,-.115,.076]],.054);
  horn(k,chest,'trim',[[-.137,.17,-.006],[-.088,.062,.075],[0,-.096,.133],[.092,.061,.078],[.138,.173,-.006]]
    .map(([x,y,z],i)=>[x,y,z,i===2?.030:.019]));
  gem(k,chest,'ember',[0,.073,.117],[.068,.088,.037]);
  const pavilion=k.bone(mount,0,.63,-.11);
  plate(k,pavilion,'elephantArmor',[[-.46,-.16,-.47],[-.42,.112,-.38],[.42,.112,-.38],[.46,-.16,-.47]],.31);
  plate(k,pavilion,'elephantArmor',[[-.44,.086,-.41],[.44,.086,-.41],[.46,.078,.325],[-.46,.078,.325]],.054);
  const banners=[];
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
    plate(k,mount,'indraRusset',[[side*.269,.573,-.585],[side*.465,.508,-.525],[side*.545,.341,-.361],
      [side*.529,.226,.406],[side*.457,.434,.552],[side*.268,.541,.406]],.091);
    const limit=mobile?5:8;
    for(let i=0;i<limit;i++){
      const z=-.50+i*.95/limit;
      horn(k,mount,i%2?'indraCoal':'trim',[[side*.35,.551,z,.019],[side*.489,.471,z,.028],
        [side*.553,.334,z+.016,.027],[side*.525,.249,z+.025,.005]]);
    }
    for(const z of [-.42,.35]){
      const leg=k.bone(mount,side*.304,.373,z),hoof=k.bone(leg,0,-.29,.026);
      skin(k,leg,'elephantHide',[[0,.11,0,.164,.173],[side*.056,-.08,-.018,.169,.139],
        [side*.062,-.261,.016,.128,.117]],{rings:13,sides:12});
      skin(k,hoof,'elephantHide',[[side*.062,.03,-.03,.132,.117],[side*.072,-.106,.011,.131,.116],
        [side*.061,-.192,.044,.142,.093]],{rings:12,sides:11});
      k.mesh(hoof,'ring','trim',side*.065,-.078,.016,.117,.117,.97,Math.PI/2);
      for(let i=0;i<3;i++)horn(k,leg,i%2?'trim':'indraCoal',[[side*.035,-.027-i*.064,.131,.021],
        [side*.136,-.044-i*.069,.103,.022],[side*.172,-.053-i*.067,.018,.019],[side*.116,-.077-i*.065,-.123,.005]]);
      for(let i=0;i<3;i++)gem(k,hoof,'edge',[side*(i-1)*.057,-.166,.115],[.028,.037,.036]);
      legs.push({leg,hoof,side,z});
    }
    horn(k,pavilion,'trim',[[side*.51,-.027,-.52,.024],[side*.463,.169,-.398,.043],
      [side*.45,.162,.319,.039],[side*.535,-.031,.411,.015]]);
    const flag=k.bone(pavilion,side*.344,.093,-.344);
    horn(k,flag,'indraCoal',[[0,0,0,.042],[side*.205,.124,-.025,.053],[side*.346,.272,-.113,.044],
      [side*.474,.437,-.142,.031],[side*.568,.581,-.126,.007]]);
    horn(k,flag,'trim',[[side*.199,.113,-.01,.014],[side*.384,.31,-.107,.019],[side*.527,.53,-.111,.012]]);
    banners.push({flag,side});
  }
  return {mount,head,trunk,tail,legs,banners};
}

function jointedChampion(k,entry,mobile){
  const spec=championProfiles[entry.id];
  const floating=spec.frames==='raiment';
  const anchor=k.bone(k.root,0,spec.frames==='carriage'?.16:floating?.27:.07,0);
  const seat=floating?ashSeat(k,k.root):null;
  const elephant=spec.frames==='carriage'?indraElephant(k,anchor,mobile):null;
  const body=elephant?k.bone(elephant.mount,0,.51,-.16):anchor;
  if(elephant)body.scale.setScalar(.43);
  const [width,height,depth]=spec.size;
  const [shell,hood,fold]=spec.armor;
  const headY=Math.min(height,1.79+(height-1.79)*.36);
  const head=k.bone(body,0,headY,.045),shoulders=[],steps=[],threads=[],streamers=[];
  const crownParts=helmet(k,head,spec,entry.id,mobile);
  skin(k,body,'hide',[[0,.47,-.02,width*.68,depth*.62],[0,.68,-.018,width*.70,depth*.67],
    [0,.97,0,width*.79,depth*.82],[0,1.19,.012,width*.84,depth*.91],
    [0,1.43,.025,width,depth],[0,headY-.228,.035,width*.80,depth*.79],
    [0,headY-.148,.043,width*.39,depth*.51],[0,headY-.094,.048,width*.33,depth*.43]],
  {sides:17,rings:22,section:2.30});
  const [mx]=spec.position;
  for(const side of sides){
    for(let row=0;row<4;row++){
      const y=1.38-row*.184,x=side*(shell*.75-row*.031),z=depth*.72+row*.018;
      if(row<2)plate(k,body,row===0?'rind':'trim',[[side*.017,y+.11,z-.075],
        [side*.092,y+.157,z-.056],[x,y+.083+hood*.16,z-.080],
        [x+side*.01,y-.12,z-.090],[side*.08,y-.11,z-.017],[side*.022,y-.17,z-.061]],.047);
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
  if(entry.id==='m135')for(const side of sides){
    for(let i=0;i<3;i++){
      const limb=k.bone(body,side*(.19+i*.031),.89+i*.12,-.12-i*.04);
      const twist=1.08;
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
  championRelief(k,body,shoulders,fabric,entry.id,mobile);
  const backArmor=fittedChampionArmor(k,body,shoulders,depth,entry.id,mobile);
  const elephantDress=elephant?tools=>{
    for(const side of sides)tools.silk(elephant.mount,'因陀羅 · 象轎重垂 '+side,[[side*.43,.77,-.11,.083],
      [side*.515,.591,-.178,.146],[side*.575,.36,-.250,.193],[side*.596,.215,-.339,.153]],{
      tint:0x316565,trim:0xc39855,lining:0x554246,flex:.82,across:[.20,0,side*.98],phase:side*.95,style:'woven',
    });
    return true;
  }:null;
  return {body:elephant?.mount??body,head,grounded:!floating,pattern:spec.frames==='hover'?'hover':spec.frames==='ogre'?'slam':'duel',
    crest:blank(k,body),catalogueSculpt:entry.id,sourceSculpt:!!elephant,sourceDress:elephantDress,
    ...(elephant?{indraCarriage:elephant,carriageRider:body,arms:shoulders.map(arm=>arm.shoulder),
      polishEnergy:{tint:0xf1c87f,shape:'bolts',anchor:elephant.mount,offset:[0,.49,-.151],span:[.63,.73,.79],
        weaponWidth:.60,emissionScale:.61}}:{}),
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
        thigh.rotation.x=elephant?-.65+pace*travel*.14:pace*travel*.48;
        if(elephant)thigh.rotation.z=side*.39;
        ankle.rotation.x=(elephant?.85:0)-Math.max(0,pace)*travel*.46+floorCorrection(spec.frames,fall);
      }
      for(const {limb,side,i} of threads){
        limb.rotation.z=side*(Math.sin(t*3.55+i*.67)*.23+wind*.33-strike*.48);
        limb.rotation.y=side*(Math.cos(t*3.26-i*.73)*.20+stage*.22);
      }
      for(const [index,ribbon] of streamers.entries())ribbon.rotation.x=wind*.49+Math.sin(t*3.2+index)*.21-strike*.34;
      for(const element of crownParts)element.rotation.x=-wind*.23+strike*.77+Math.sin(t*2.4)*.16;
      fabric.rotation.x=wind*.32-strike*.34+travel*.20;
      backArmor.rotation.x=wind*.14-strike*.12+travel*.06;
      if(seat){
        seat.rotation.y=t*.19+strike*.43;
        seat.scale.setScalar(1+wind*.088+stage*.10);
      }
      if(elephant){
        elephant.head.rotation.y=Math.sin(t*2.11)*.096+wind*.14-strike*.23;
        elephant.trunk.rotation.x=Math.sin(t*3.36)*.24-wind*.34+strike*.59;
        elephant.tail.rotation.y=Math.sin(t*3.31)*(.17+travel*.29);
        for(const {flag,side} of elephant.banners)flag.rotation.z=side*(Math.sin(beat*.65)*.022+wind*.11-strike*.145);
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
  m130:{mode:'rider',belly:[[0,.08,-.78,.26,.24],[0,.13,-.42,.36,.33],[0,.12,.09,.40,.29],
    [0,.14,.40,.39,.28],[0,.26,.56,.26,.21]],neck:[0,.39,.63],width:.26,length:.45,eyes:.040,
    arm:[.30,.18,.32],leg:[.28,.16,-.50],stride:.43,tails:[[0,.16,-.73,.17],[-.22,.28,-1.04,.12],
      [-.40,.50,-1.40,.089],[-.58,.49,-1.64,.035],[-.72,.56,-1.87,.012]],
    horns:[[[.17,.11,-.06,.047],[.31,.23,-.26,.043],[.46,.25,-.49,.003]]],mane:[.86,.36,12],jaw:'deep'},

};

function khanOnWolf(k,body,mobile){
  const rider=k.bone(body,0,.51,-.176),head=k.bone(rider,0,.94,.04),saddle=k.bone(body,0,.42,-.23);
  const jaw=k.bone(head,0,-.098,.116);
  skin(k,rider,'silk',[[0,.054,-.07,.234,.146],[0,.27,.029,.217,.178],[0,.49,.035,.205,.169],
    [0,.71,.027,.235,.151],[0,.805,.003,.166,.123],[0,.912,-.019,.111,.096]],{sides:15,rings:18,section:2.8});
  skin(k,head,'khanHide',[[0,-.171,.104,.087,.076],[0,-.105,.075,.125,.106],[0,-.034,.029,.154,.128],
    [0,.068,-.003,.167,.141],[0,.166,-.032,.131,.117]],{sides:15,rings:21,section:2.42});
  skin(k,head,'khanPelt',[[0,.114,-.031,.171,.138],[0,.152,-.041,.209,.150],[0,.197,-.052,.180,.135],
    [0,.255,-.074,.139,.112],[.041,.313,-.115,.056,.049],[.058,.327,-.133,.012,.016]],
    {sides:mobile?12:15,rings:17,section:2.5,ridge:.29,fur:true});
  skin(k,saddle,'rind',[[0,.005,-.49,.118,.108],[0,.026,-.30,.226,.115],
    [0,.069,.01,.317,.113],[0,.105,.242,.276,.151],[0,.128,.32,.154,.105]],{rings:13,sides:12,section:2.9});
  horn(k,head,'khanHide',[[0,.105,.153,.021],[0,.046,.182,.026],[.004,-.037,.226,.031],[0,-.066,.210,.012]]);
  horn(k,head,'khanVisor',[[0,.291,-.10,.024],[0,.275,-.006,.026],[0,.226,.056,.031],
    [0,.176,.114,.017],[0,.128,.143,.005]]);
  skin(k,jaw,'khanHide',[[0,-.071,-.007,.071,.047],[0,-.054,.052,.084,.037],
    [0,-.020,.043,.094,.057],[0,.010,-.006,.105,.066]],{rings:14,sides:14,section:2.70,ridge:.15});
  horn(k,head,'khanSkinShade',[[-.051,-.083,.170,.006],[-.023,-.088,.197,.009],
    [0,-.086,.200,.009],[.023,-.088,.197,.009],[.052,-.083,.170,.006]]);
  horn(k,jaw,'khanSkinShade',[[-.055,.012,.059,.005],[-.023,.006,.082,.008],[0,.007,.089,.010],
    [.025,.009,.080,.008],[.056,.011,.056,.005]]);
  const wrists=[],knees=[];
  for(const side of sides){
    const f=x=>side*x;
    const arm=k.bone(rider,f(.187),.685,.023),forearm=k.bone(arm,f(.121),-.17,.131);
    const thigh=k.bone(rider,f(.172),.118,.045),shin=k.bone(thigh,f(.155),-.16,.136);
    wrists.push({arm,forearm,side});knees.push({thigh,shin,side});
    const socket=[[f(.036),.059,.178],[f(.060),.073,.185],[f(.096),.074,.166],
      [f(.116),.057,.149],[f(.079),.048,.177],[f(.051),.045,.186]];
    plate(k,head,'khanSkinShade',socket,.009);
    k.mesh(head,'pearl','khanEye',f(.067),.060,.184,.021,.006,.010,0,f(.28),f(.12));
    k.mesh(head,'pearl','deep',f(.060),.060,.193,.005,.006,.003);
    horn(k,head,'khanPelt',[[f(.028),.077,.181,.008],[f(.058),.088,.191,.013],
      [f(.103),.085,.176,.011],[f(.132),.063,.144,.002]]);
    horn(k,head,'khanHide',[[f(.040),.044,.178,.004],[f(.067),.047,.190,.008],
      [f(.101),.053,.168,.005],[f(.114),.058,.149,.002]]);
    horn(k,head,'khanSkinShade',[[f(.041),-.057,.215,.009],[f(.057),-.051,.197,.009],
      [f(.069),-.042,.177,.006],[f(.081),-.062,.169,.004]]);
    skin(k,head,'khanHide',[[f(.044),.010,.159,.015,.012],[f(.077),.016,.169,.028,.020],
      [f(.109),.027,.151,.031,.023],[f(.136),.038,.119,.021,.013],
      [f(.149),.067,.089,.005,.004]],{rings:11,sides:10,section:2.37,ridge:.16});
    horn(k,head,'khanSkinShade',[[f(.081),-.035,.176,.005],[f(.105),-.043,.177,.008],
      [f(.133),-.031,.151,.011],[f(.151),-.012,.123,.004]]);
    const visor=[[f(.004),.154,.144],[f(.074),.193,.134],[f(.149),.193,.081],[f(.190),.149,.030],
      [f(.125),.107,.117],[f(.058),.116,.170],[f(.010),.098,.178]];
    plate(k,head,'khanVisor',visor,.019);
    horn(k,head,'khanVisorEdge',visor.slice(1,6).map(([x,y,z])=>[x,y-.007,z+.013,.010]));
    horn(k,head,'rind',[[f(.146),.155,.064,.033],[f(.177),.098,.055,.054],
      [f(.166),.003,.086,.045],[f(.142),-.089,.133,.012]]);
    plate(k,head,'khanVisor',[[f(.128),.199,.025],[f(.165),.205,-.076],[f(.179),.138,-.129],
      [f(.184),.065,-.106],[f(.169),.029,-.039],[f(.163),-.074,.047],
      [f(.129),-.093,.097],[f(.166),.066,.100]],.026);
    horn(k,head,'khanVisorEdge',[[f(.161),.192,-.076,.010],[f(.186),.132,-.111,.013],
      [f(.194),.055,-.080,.014],[f(.188),-.019,-.015,.012],[f(.158),-.085,.066,.006]]);
    k.mesh(head,'gem','trim',f(.190),.105,-.048,.010,.010,.010);
    k.mesh(head,'gem','trim',f(.181),.032,.021,.008,.009,.008);
    for(let i=0;i<3;i++){
      const x=.016+i*.024,y=-.051-i*.008;
      horn(k,head,i===1?'khanBeardTip':'khanPelt',[[f(x),y,.198,.007],
        [f(x+.022),y-.020,.212,.014],[f(x+.049),y-.037,.204,.014],
        [f(x+.074),y-.060,.179,.008],[f(x+.08),y-.086,.155,.002]]);
    }
    for(let i=0;i<4;i++){
      const x=.021+i*.020,y=-.014+i*.008;
      skin(k,jaw,i%3?'khanPelt':'khanBeardTip',[[f(x),y,.053-i*.009,.018,.015],
        [f(x*1.16),y-.044,.075-i*.010,.022,.016],[f(x*1.36),y-.097,.068-i*.016,.019,.014],
        [f(x*1.29),y-.141,.048-i*.021,.003,.005]],{rings:10,sides:8,fur:true,ridge:.28});
      const crest=.026+i*.041,y0=.221-i*.016,z0=-.174-(i%2)*.008;
      skin(k,head,i%2?'khanPelt':'khanVisor',[[f(crest),y0,z0,.027,.014],
        [f(crest+.014),y0-.051,z0-.029,.035,.026],[f(crest+.012),y0-.108,z0-.033,.027,.024],
        [f(crest-.010),y0-.176,z0+.007,.004,.007]],{rings:mobile?7:9,sides:7,section:2.5,ridge:.19,fur:true});
      horn(k,head,'khanVisorEdge',[[f(crest-.021),y0-.035,z0-.018,.005],
        [f(crest),y0-.058,z0-.048,.008],[f(crest+.027),y0-.055,z0-.034,.004]]);
    }
    for(let row=0;row<(mobile?4:5);row++){
      const y=.72-row*.121,w=.15+Math.sin(row*.79)*.044;
      const front=[[f(.018),y+.028,.211],[f(w*.54),y+.049,.205],[f(w),y+.036,.131],
        [f(w*1.09),y-.046,.119],[f(w*.54),y-.075,.207],[f(.02),y-.060,.231]];
      plate(k,rider,row%2?'rind':'silk',front,.029);
      horn(k,rider,'trim',front.slice(1,5).map(([x,y,z])=>[x,y,z+.018,.014]));
      const rear=front.map(([x,y,z])=>[x*1.12,y+.021,-z*.96-.035]);
      plate(k,rider,row%2?'khanPelt':'rind',rear,.036);
      horn(k,rider,row%2?'edge':'trim',rear.slice(1,5).map(([x,y,z])=>[x,y,z-.021,.016]));
      if(row%2===0)k.mesh(rider,'gem','trim',f(.121),y+.018,-.237,.024,.029,.018);
    }
    skin(k,arm,'khanPelt',[[0,.044,-.011,.094,.094],[f(.084),-.054,.045,.133,.123],
      [f(.119),-.163,.138,.080,.091]],{sides:11,rings:12,fur:true});
    for(let i=0;i<3;i++){
      const y=.067-i*.065,z=.012+i*.018,x=.104+i*.020;
      const rim=[[f(x-.121),y+.025,z+.113],[f(x-.024),y+.060,z+.082],[f(x+.077),y+.046,z+.033],
        [f(x+.113),y-.024,z-.045],[f(x+.047),y-.053,z-.109],[f(x-.048),y-.047,z-.127],
        [f(x-.015),y-.066,z-.026],[f(x-.097),y-.038,z+.080]];
      plate(k,arm,i%2?'khanVisor':'khanLamellar',rim,.037);
      horn(k,arm,'khanVisorEdge',rim.slice(0,6).map(([x,y,z])=>[x,y+.010,z,.012-i*.002]));
      horn(k,arm,'khanLamellar',[[f(x+.002),y+.044,z+.047,.010],[f(x+.061),y+.059,z+.006,.018],
        [f(x+.085),y+.012,z-.060,.014],[f(x+.072),y-.016,z-.097,.004]]);
      if(i<2)k.mesh(arm,'gem','khanVisorEdge',f(x+.027),y+.042,z+.065,.013,.013,.013);
    }
    skin(k,forearm,'rind',[[0,.023,-.04,.081,.097],[f(.06),-.082,.044,.091,.095],
      [f(.06),-.171,.149,.057,.065]],{rings:11,sides:10});
    skin(k,thigh,'silk',[[0,.034,-.032,.103,.087],[f(.101),-.074,.049,.112,.096],
      [f(.15),-.165,.124,.071,.076]],{rings:11,sides:10});
    skin(k,shin,'khanPelt',[[0,.041,.05,.073,.067],[f(.022),-.098,.077,.068,.079],
      [f(.035),-.190,.132,.073,.078],[f(.009),-.226,.201,.052,.032]],{rings:11,sides:9,fur:true});
    const skirt=[[f(.11),.149,.16],[f(.278),.144,.12],[f(.403),.027,.02],
      [f(.464),-.269,.169],[f(.376),-.403,.211],[f(.212),-.281,.191]];
    plate(k,saddle,'khanPelt',skirt,.049);
    horn(k,saddle,'trim',[...skirt,skirt[0]].map(([x,y,z])=>[x,y,z+.04,.019]));
    for(let i=0;i<4;i++){
      const x=f(.215+i*.046),y=-.09-i*.042;
      skin(k,saddle,i%2?'rind':'khanPelt',[[x,y+.04,.159,.025,.034],[x+f(.06),y-.03,.184,.037,.047],
        [x+f(.09),y-.133,.222,.006,.009]],{rings:8,sides:7,fur:true});
    }
    horn(k,body,'trim',[[f(.184),.294,.613,.022],[f(.227),.337,.410,.033],
      [f(.298),.216,.244,.025],[f(.326),.096,.062,.007]]);
  }
  return {rider,head,jaw,wrists,knees};
}

function khanMountPlate(k,hip,knee,side,fore){
  const p=points=>points.map(([x,...rest])=>[side*x,...rest]);
  for(let i=0;i<3;i++){
    const y=.133-i*.103,z=(fore?.093:-.127)+i*.019,x=.118+i*.018;
    const shell=p([[x-.092,y+.078,z+.108],[x+.031,y+.068,z+.136],
      [x+.118,y-.014,z+.096],[x+.156,y-.059,z+.009],[x+.124,y-.056,z-.127],
      [x+.017,y-.028,z-.183],[x-.072,y+.013,z-.100]]);
    plate(k,hip,i===0?'khanLamellar':'rind',shell,.051);
    horn(k,hip,'khanVisorEdge',shell.slice(1,7).map(([x,y,z])=>[x+side*.021,y,z,.013-i*.002]));
    horn(k,hip,'khanLamellar',p([[x-.005,y+.057,z+.095,.012],[x+.088,y+.018,z+.065,.022],
      [x+.132,y-.013,z-.014,.017],[x+.104,y-.024,z-.085,.004]]));
    if(i!==2)k.mesh(hip,'gem','trim',side*(x+.110),y-.009,z-.091,.017,.018,.014);
  }
  const stirrup=p([[.078,.045,.100],[.143,.012,.068],[.167,-.099,.012],[.134,-.183,-.096],
    [.056,-.204,-.108],[.045,-.114,.008]]);
  plate(k,knee,'khanVisor',stirrup,.043);
  horn(k,knee,'khanVisorEdge',stirrup.map(([x,y,z])=>[x+side*.014,y,z,.009]));
}

function quadruped(k,entry,mobile){
  const spec=beastProfiles[entry.id],body=k.bone(k.root,0,.78,0);
  skin(k,body,'hide',spec.belly,{sides:19,rings:27,section:2.42,ridge:.21,fur:spec.mode==='rider'});
  const head=k.bone(body,...spec.neck),jaw=mouth(k,head,{...spec,brow:'rind',fangs:5});
  horns(k,head,spec.horns,'edge');
  const joints=[],tail=makeTail(k,body,spec.tails);
  const [spread,fringe,count]=spec.mane;
  for(const side of sides){
    pelt(k,head,spread*.30,-.08,-.20,fringe*.68,mobile?6:8,'rind',.27);
    for(let i=0;i<(mobile?Math.ceil(count*.61):count);i++){
      const t=i/(mobile?Math.ceil(count*.61):count);
      const x=side*(.24+Math.sin(t*1.95)*spread*.33),y=.56-Math.sin(t*2.17)*.31,z=.58-t*1.04;
      const scale=fringe*(.65+.35*Math.cos(t*3.76));
      const path=[[x,y,z],[x+side*scale*.16,y+scale*.21,z-scale*.12],
        [x+side*scale*.27,y+scale*.25,z-scale*.45],[x+side*scale*.19,y+scale*.20,z-scale*.75]];
      horn(k,body,i%3===0?'edge':'rind',path.map(([x,y,z],j)=>[x,y,z,[.071,.060,.034,.003][j]]));
    }
    for(const [fore,pivot] of [[true,spec.arm],[false,spec.leg]]){
      const [x,y,z]=pivot;
      const hip=k.bone(body,x*side,y,z),knee=k.bone(hip,side*(fore?.115:.14),-.30,fore?.027:-.066),
        paw=k.bone(knee,side*.087,-.285,.095);
      const bulk=fore?.17:.193;
      skin(k,hip,'hide',[[0,.065,0,bulk,bulk*.84],[side*.105,-.072,.016,bulk*1.05,bulk*.86],
        [side*.131,-.30,.061,bulk*.64,bulk*.60]],{rings:15,sides:12,section:2.2});
      skin(k,knee,'rind',[[0,.012,-.01,bulk*.72,bulk*.64],[side*.052,-.15,.0,bulk*.63,bulk*.56],
        [side*.088,-.267,.077,bulk*.46,bulk*.48]]);
      skin(k,paw,'hide',[[0,.029,-.036,bulk*.60,bulk*.55],
        [side*.044,-.081,.092,bulk*.76,bulk*.37],[side*.065,-.107,.229,bulk*.80,bulk*.33]],{section:2.6});
      for(let i=0;i<4;i++)horn(k,paw,'edge',[[side*(i-1.29)*.056,-.084,.19,.036],
        [side*(i-1.28)*.061,-.096,.291-i*.014,.024],[side*(i-1.23)*.067,-.139,.342-i*.017,.004]]);
      if(spec.mode==='rider')khanMountPlate(k,hip,knee,side,fore);
      joints.push({hip,knee,paw,side,fore});
    }
  }
  const khan=spec.mode==='rider'?khanOnWolf(k,body,mobile):null;
  beastRelief(k,body,head,joints,spec,entry.id,mobile);
  return {body,head,khanRider:khan?.rider,portraitHead:khan?.head,pattern:khan?'gallop':'crawl',crest:blank(k,body),
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
      if(khan){
        khan.rider.rotation.x=wind*.31-strike*.38+Math.sin(step*1.75)*travel*.13;
        khan.head.rotation.y=-wind*.12+strike*.21+Math.sin(beat*.61)*.059;
        khan.jaw.rotation.x=.023+strike*.13+Math.sin(beat*.55)*.021;
        for(const {arm,forearm,side} of khan.wrists){
          arm.rotation.x=-.17-wind*.36+strike*.56;
          arm.rotation.z=side*(.07+wind*.15-strike*.15);
          forearm.rotation.x=-.45+wind*.39-strike*.39;
        }
        for(const {thigh,shin,side} of khan.knees){
          thigh.rotation.x=Math.sin(step+side*.4)*travel*.071+wind*.12-strike*.14;
          shin.rotation.x=wind*.11+strike*.19;
        }
      }
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
  m113:{...four(0x8b6048,0x963921,0xebd1b2,0xcdc5b1,0xf08a43),...scarletRitualFinishes},
  m116:anantaFinishes,
  m118:four(0x654736,0x403c33,0xabc1ba,0x307e75,0xb8a347),
  m119:four(0x6e4d38,0x343c40,0xcbad82,0x5b526c,0xc29450),
  m120:{...four(0x777b84,0x364858,0xe5cfac,0x4f5a6a,0x936048),...elephantDiscipleFinishes},
  m121:{hide:[0x49343b,.13,.72,'hide'],rind:[0x353849,.36,.48,'hide'],edge:[0xb99f7d,.21,.58,'bone'],
    spiderCarapace:[0x533539,.29,.58,'hide'],spiderRim:[0x7a5a51,.33,.65,'bone'],spiderCrest:[0x7c8999,.43,.50,'iron']},
  m123:{...four(0x8e7459,0x302f43,0xd2bb91,0x355c78,0x996437),
    elephantHide:finish(0x49494e,'hide'),elephantArmor:finish(0x316168,'iron'),
    indraRusset:finish(0x873e29,'iron'),indraCoal:finish(0x39343c,'iron'),indraHair:finish(0x23242c,'hide')},
  m126:{hide:[0x583f31,.11,.70,'hide'],rind:[0x462521,.34,.58,'iron'],edge:[0xaca09a,.16,.62,'bone']},
  m127:{hide:[0x502821,.19,.66,'hide'],rind:[0x51434a,.54,.43,'iron'],edge:[0xc5b8a6,.22,.57,'bone'],
    membrane:[0x702d23,.15,.72,'hide']},
  m128:{hide:[0x262d2b,.19,.64,'hide'],rind:[0x393633,.44,.52,'iron'],edge:[0xae8d61,.22,.57,'bone'],
    membrane:[0x754e2a,.12,.63,'hide']},
  m129:{...four(0x784a27,0x9b6337,0xdacd9c,0xb18e63,0xc58c39),
    sandSkin:[0x685042,.12,.72,'hide'],sandHair:[0x7b5a42,.045,.78,'hide'],
    sandScale:[0x927153,.31,.55,'hide'],sandTrim:[0xbda384,.35,.53,'bone'],
    sandJaw:[0xb9a589,.13,.72,'hide'],sandIvory:[0xcec1a1,.13,.64,'bone'],
    sandDark:[0x352f30,.11,.72,'bone']},
  m130:{...four(0x264e5b,0x295165,0x9ab5be,0x2d4458,0x77a2bd),
    khanPelt:[0x51656a,.04,.82,'hide'],khanHide:[0x8f6658,.08,.71,'hide'],
    khanSkinShade:[0x715146,.05,.76,'hide'],khanEye:[0xe4b887,.09,.42,'bone'],
    khanBeardTip:[0x8d8173,.04,.79,'hide'],khanLamellar:[0x4f6772,.68,.36,'iron'],
    khanVisor:[0x303d42,.66,.39,'iron'],khanVisorEdge:[0x89745d,.70,.37,'bronze']},
  m131:{hide:[0x28678f,.25,.58,'hide'],rind:[0x14466e,.50,.46,'iron'],edge:[0x9bc9d1,.23,.48,'bone'],
    membrane:[0x4a96b3,.20,.54,'hide'],ember:[0xbcd6db,.31,.50,'bone']},
  m132:four(0x4a1c1a,0x632b24,0xe8a174,0x4e2221,0xcf572c),
  m134:{...hyunmuFinishes},
  m135:four(0x95796c,0x254b68,0xb0d1d6,0x577994,0x638fac),
  m136:{...vermilionFinishes},
  m137:four(0x503024,0x5c2824,0xc9754b,0x8a3227,0xf05a32),
  m138:{hide:[0x3b827c,.19,.58,'hide'],rind:[0x27645e,.36,.52,'iron'],edge:[0xdbd5ba,.19,.50,'bone'],
    ...jadeDragonFinishes},
  m139:four(0x675649,0x394049,0xc2a67a,0x3e416f,0xb58a47),
  m140:{...four(0x9f9d94,0x7a929b,0xe3d9ba,0x253550,0xa63e31),
    tigerFur:[0x9a9f9d,.02,.87,'hide'],tigerMuzzle:[0xb1b2a6,.02,.86,'hide'],
    tigerFurAsh:[0x656b70,.02,.94,'hide'],tigerFurTip:[0xb9bec0,.02,.85,'hide'],
    tigerFurShadow:[0x4a525d,.02,.91,'hide'],
    tigerDark:[0x161d26,.03,.79,'hide'],tigerEye:[0xdc9e50,.14,.31,'bone'],
    tigerClaw:[0x873326,.52,.49,'iron'],tigerClawDark:[0x522b31,.62,.54,'iron'],
    tigerClawHot:[0xca5440,.53,.40,'iron']},
  m141:four(0x61352f,0x332b32,0xd3c5b4,0x723130,0xa84334),
  m142:four(0x47401d,0x65561f,0xbe9b58,0x4b4c2c,0xa96f21),
  m143:four(0x645940,0x685a3a,0xd2c198,0x5a4e3c,0xc29d4e),
  m144:four(0x252222,0x464032,0xbf9677,0x503826,0xca7526),
  m145:four(0x383332,0x4d453b,0xaba081,0x574939,0xa98a52),
  m146:four(0x825f7c,0x383870,0x9b81a8,0x493f81,0x643572),
  m147:four(0x716549,0x504d3a,0xb1a37c,0x626847,0xa3824b),
  m149:{...four(0x314750,0x4b5f63,0x9ba8a7,0x3e606e,0x8ec9e2),
    windFur:[0x344b52,.06,.79,'hide'],windScale:[0x57686b,.38,.55,'hide'],
    windEnamel:[0x326b6d,.51,.42,'iron'],windTrim:[0x9ebac1,.46,.41,'iron'],
    windIvory:[0xc7c7b4,.12,.58,'bone'],windBlue:[0x458eb3,.43,.43,'iron'],
    windCharcoal:[0x25343a,.11,.73,'hide'],windFlesh:[0x5a3836,.08,.71,'hide'],
    windPelt:[0x969c99,.03,.83,'hide'],windPeltFade:[0x636975,.07,.72,'hide'],
    windPeltLight:[0xc1c7c4,.02,.85,'hide'],windVerdigris:[0x406259,.42,.51,'iron']},
  m152:{hide:[0x174f5e,.24,.61,'hide'],rind:[0x116c7a,.46,.43,'iron'],edge:[0xb6bbc5,.26,.49,'bone'],
    ember:[0xac473b,.18,.58,'hide']},
  'raid-wyvern':{hide:[0x6d491d,.18,.66,'hide'],rind:[0x804c20,.46,.51,'bronze'],edge:[0xd6a068,.20,.55,'bone'],
    membrane:[0x8e6035,.16,.61,'hide']},
  'raid-flame':four(0x47302a,0x422f2a,0xcb7e58,0x6f3c31,0xe27432),
};
for(const [id,spec] of Object.entries(designsC)){
  finishesC[id].patina=[spec.streak,.58,.49,['ash','regent','fiend'].includes(spec.face)?'bronze':'iron'];
  Object.assign(finishesC[id],identityFinishes[id]);
}
for(const [id,color] of Object.entries(creaturePatinas))finishesC[id].patina=[color,.38,.56,'iron'];
for(const [id,finishes] of Object.entries(taotieFinishes))Object.assign(finishesC[id],finishes);
Object.assign(finishesC.m145,hundunFinishes);

const sculptors={m113:carveScarletRitual,m116:sculptAnanta,m120:carveElephantDisciple,m121:wolfSpider,m126:carveAgasura,m127:wyvern,m128:wyvern,m129:sculptDesertKirin,m131:wyvern,m132:sculptTaotie,
  m134:iceTurtle,m136:carveVermilionBird,m138:serpent,m140:sculptWhiteTigerChampion,m144:sculptTaotie,m145:sculptPrimordialHundun,m149:sculptWindTaowu,
  m152:serpent,'raid-wyvern':wyvern};

export function sculptC(k,entry,mobile){
  if(entry.id==='m130')return carveGhostKhan(k,entry,mobile);
  if(Object.hasOwn(nightmareSculpts,entry.id))return nightmareSculpts[entry.id](k,entry,mobile);
  if(Object.hasOwn(templeDiscipleFinishes,entry.id))return carveTempleDisciple(k,entry,mobile);
  if(Object.hasOwn(heavenlyFinishes,entry.id))return sculptHeavenlyKing(k,entry,mobile);
  if(Object.hasOwn(coastalFinishes,entry.id))return sculptCoastalDragon(k,entry,mobile);
  if(championProfiles[entry.id])return jointedChampion(k,entry,mobile);
  if(beastProfiles[entry.id])return quadruped(k,entry,mobile);
  return sculptors[entry.id]?.(k,entry,mobile)??null;
}

for(const [id,finishes] of Object.entries(heavenlyFinishes))Object.assign(finishesC[id],finishes);
for(const [id,finishes] of Object.entries(nightmareFinishes))Object.assign(finishesC[id],finishes);
for(const [id,finishes] of Object.entries(coastalFinishes))Object.assign(finishesC[id],finishes);
for(const [id,finishes] of Object.entries(templeDiscipleFinishes))Object.assign(finishesC[id],finishes);
Object.assign(finishesC.m126,agasuraFinishes);
Object.assign(finishesC.m130,ghostKhanFinishes);
