import * as T from '../three.min.mjs';
import {carveSpringShade,springShadeFinishes} from './spring-shade-sculpt.mjs?v=spring-shade-1';
import {sculptThunderPriestess,thunderPriestessFinishes} from './thunder-priestess-sculpt.mjs?v=thunder-priestess-1';
import {carveDynastyTrio,dynastyFinishes} from './dynasty-trio.mjs?v=dynasty-trio-1';
import {dressFateMentor,fateMentorPortrait,fateTempleFinishes,poseFateMentor} from './fate-temple-sculpt.mjs?v=fate-mentor-1';
import {iceExperimentFinishes,forgeIceExperiment} from './ice-experiment-sculpt.mjs?v=frost-circuit-1';
import {broodOfShadows} from './nightwing-brood.mjs?v=nine-shadows-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {carvedFace,demonicMempo,openHelm} from './catalogue-a-face.mjs?v=maskwork-1';
import {paintedFinish} from './painted-finish.mjs?v=ascendant-1';
import {wingTissue} from './wing-tissue.mjs?v=emberlight-1';
import {sculptRoyalCoil,sculptRoyalWyrm,poseRoyalCoil} from './royal-ghost-coil.mjs?v=royal-coil-1';
import {courtPortrait,redBanditPortrait} from './early-portraits.mjs?v=boss-foundry-1';
import {gorgeRig} from './gorge-armour.mjs?v=gorge-armour-2';
import {rancourGeometry,rancourShapes} from './boss-rancour.mjs?v=rancour-1';
import {oniFinishes,oniLimbSculpt,oniTorso} from './oni-anatomy.mjs?v=oni-1';
import {qinMountArmor,qinMountLeg} from './qin-mount-armor.mjs?v=qin-1';
import {commanderFinishes,emberBody,emberCommander,xiangCommander} from './early-commanders.mjs?v=early-commanders-1';
import {crutchFinishes,forgeIronCrutch} from './iron-crutch-sculpt.mjs?v=iron-crutch-1';
import {butcherFinishes,carveTowerButcher} from './tower-butcher-sculpt.mjs?v=bone-cutter-1';
import {sculptBurialBeast} from './tomb-beast-rigs.mjs?v=tomb-rigs-1';
import {carveXuanElder,forgeWootai,wootaiFinishes,xuanFinishes} from './wootai-elder-sculpts.mjs?v=wootai-elder-2';
import {bayuFinishes,buildBayuSteed,fitBayuRider} from './bayu-steed.mjs?v=bayu-steed-1';
import {fitMoonFighter,fitMoonSitar,moonFinishes,moonPortrait,moonShapes} from './yuetian-duelists.mjs?v=yuetian-duelists-3';
import {forgeWhiteTortoise,whiteTortoiseFinishes} from './white-tortoise.mjs?v=white-tortoise-1';
import {fitQinFireRegalia,qinCourtHead,qinFireFinishes,qinGownCore} from './qin-fire-regalia.mjs?v=qin-fire-regalia-1';

const PI=Math.PI,TAU=PI*2,flanks=[-1,1];
const volume=(k,j,m,s,detail=16,section=2.18,ridge=.14,fur=false)=>k.geometry(j,m,
  sculptVolume(s,{rings:detail,sides:Math.max(8,detail-4),section,ridge,fur}));
const sweep=(k,j,m,p,n=12,r=7)=>k.sculpt.sweep(j,m,p,{steps:n,sides:r,ridge:.20});
const plate=(k,j,m,p,depth=.043,bevel=.013)=>k.sculpt.plate(j,m,p,depth,bevel);
const vane=(k,j,m,a,b,c,w,seed)=>k.geometry(j,m,featherVane(a,b,c,w,seed,12));
function rim(k,j,m,r,t,z=0){
  const g=new T.TorusGeometry(r,t,6,28);g.translate(0,0,z);k.geometry(j,m,g);
}

function hideScales(k,bone,sections,a,b,density,profile){
  const center=new T.CatmullRomCurve3(sections.map(([x,y,z])=>new T.Vector3(x,y,z)));
  const radius=new T.CatmullRomCurve3(sections.map(([, , ,w,h])=>new T.Vector3(w,h,0)));
  const out=new T.Vector3(),cross=new T.Vector3(),up=new T.Vector3(0,1,0);
  const count=profile.rows;
  for(let row=0;row<count;row++){
    const t=a+(b-a)*(row+.43)/count;
    const origin=center.getPointAt(t),direction=center.getTangentAt(t).normalize();
    const parameters=radius.getPoint(center.getUtoTmapping(t));
    cross.crossVectors(direction,up).normalize();
    if(cross.lengthSq()<.001)cross.set(1,0,0);
    const spine=new T.Vector3().crossVectors(cross,direction).normalize();
    for(let i=0;i<density;i++){
      const angle=TAU*(i+.5*(row%2))/density;
      const s=Math.sin(angle),c=Math.cos(angle);
      const target=origin.clone().addScaledVector(spine,c*parameters.y*.97).addScaledVector(cross,s*parameters.x*.95);
      out.copy(spine).multiplyScalar(c).addScaledVector(cross,s).normalize();
      const scale=k.bone(bone,target.x,target.y,target.z);
      scale.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(
        new T.Vector3().crossVectors(direction,out).normalize(),direction,out));
      const h=profile.length*(.81+.24*Math.cos(i*1.83+row*.77)),w=profile.width*(.86+Math.abs(c)*.18);
      const gloss=Math.abs(c)>.78&&(row+i)%3===0;
      plate(k,scale,gloss?profile.ridge:profile.hide,[
        [0,-h*.79,.018],[w*.52,-h*.68,.007],[w*.86,-h*.14,.019],[w*.68,h*.44,.005],
        [0,h*.62,.026],[-w*.62,h*.47,.004],[-w*.86,-h*.095,.013],[-w*.59,-h*.58,.006],
      ],.025,.009);
      if(gloss)sweep(k,scale,profile.ridge,[[0,-h*.60,.034,.010],[w*.15,-h*.045,.043,.012],
        [0,h*.48,.038,.002]],6,5);
    }
  }
}

function batSail(k,bone,side,border,finish,mobile){
  const ray=border.map(row=>new T.CatmullRomCurve3(row.map(p=>new T.Vector3(...p))));
  const p=[],uv=[],color=[],tri=[],rows=mobile?10:16,columns=mobile?6:10;
  for(let i=0;i<ray.length-1;i++)for(const face of flanks){
    const offset=p.length/3;
    for(let r=0;r<=rows;r++){
      const t=r/rows,edgeA=ray[i].getPoint(t),edgeB=ray[i+1].getPoint(t);
      for(let j=0;j<columns;j++){
        const u=j/(columns-1),d=Math.sin(PI*u);
        const point=edgeA.clone().lerp(edgeB,u);
        point.x-=side*d*(.065+t*.12)*t**6;
        point.y-=d*(.09+t*.16)*t**6;
        point.z-=d*(.027+.074*Math.sin(PI*t))+face*.005;
        p.push(...point.toArray());
        uv.push(u,t);
        const vein=Math.exp(-Math.abs(u-.53-Math.sin(t*14+i)*.073)*26);
        const tendon=.62+.19*Math.abs(Math.cos(u*PI))+.21*vein+.055*Math.cos(t*28-u*4+i);
        color.push(tendon,tendon,tendon);
        if(r<rows&&j<columns-1){
          const a=offset+r*columns+j,b=a+columns;
          if(face*side>0)tri.push(a,a+1,b,a+1,b+1,b);
          else tri.push(a,b,a+1,a+1,b,b+1);
        }
      }
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));geometry.setIndex(tri);
  geometry.computeVertexNormals();
  k.geometry(bone,finish,geometry);
}

function sourcePose(entry,body,head,extras,pattern){
  return {body,head,crest:new T.Group(),catalogueSculpt:entry.id,cataloguePose:extras,pattern};
}

const metals={
  steel:[0x89a9b4,.65,.41,'iron'],brass:[0xb69857,.58,.45,'bronze'],
  black:[0x272633,.55,.49,'iron'],ivory:[0xaab2a6,.18,.57,'bone'],
  jade:[0x456754,.32,.56,'iron'],dusk:[0x24204c,.12,.62,'cloth'],
  red:[0x91352e,.13,.59,'cloth'],skin:[0x967060,.08,.71,'hide'],
  cobalt:[0x34475f,.44,.48,'iron'],ochre:[0x785747,.30,.62,'bronze'],
  teal:[0x315b60,.16,.65,'hide'],lilac:[0x8c7b98,.11,.68,'cloth'],
  clay:[0x9a3f20,.28,.62,'hide'],moss:[0x465638,.25,.64,'hide'],
  lining:[0x1a2028,.11,.82,'cloth'],rivet:[0x453c34,.69,.44,'bronze'],
  linen:[0xaaa087,.07,.79,'cloth'],ironRim:[0x596370,.77,.37,'iron'],
  wingHide:[0x47504b,.10,.72,'hide'],wingBlood:[0x482922,.10,.77,'hide'],
};

function garmentPanel(k,j,finish,rows,seed,columns=7){
  const spine=new T.CatmullRomCurve3(rows.map(([x,y,z])=>new T.Vector3(x,y,z)));
  const profile=new T.CatmullRomCurve3(rows.map(([, , ,w,fold])=>new T.Vector3(w,fold,0)));
  const p=[],uv=[],color=[],tri=[],loops=12,layer=(loops+1)*columns;
  for(const side of flanks)for(let row=0;row<=loops;row++){
    const t=row/loops,center=spine.getPoint(t),{x:width,y:fold}=profile.getPoint(t);
    for(let col=0;col<columns;col++){
      const u=col/(columns-1)*2-1;
      const wave=Math.cos(u*PI*1.74-seed+t*2.8)*.74+Math.cos(u*PI*3.15+seed*.7-t*5.2)*.26;
      const fray=t**7*Math.cos(col*2.4+seed)*.028;
      p.push(center.x+width*u,center.y+fray,center.z+fold*(wave-u*u*.59)+side*.010);
      uv.push((u+1)*.5,t);
      const shade=.80+wave*.115+Math.abs(u)*.11-(side<0?.16:0);
      color.push(shade,shade,shade);
      if(row<loops&&col<columns-1){
        const a=(side<0?0:layer)+row*columns+col,b=a+columns;
        if(side<0)tri.push(a,a+1,b,a+1,b+1,b);
        else tri.push(a,b,a+1,a+1,b,b+1);
      }
    }
  }
  for(let row=0;row<loops;row++)for(const col of [0,columns-1]){
    const a=row*columns+col,b=a+columns;
    if(col===0)tri.push(a,a+layer,b,b,a+layer,b+layer);
    else tri.push(a,b,a+layer,b,b+layer,a+layer);
  }
  for(const row of [0,loops])for(let col=0;col<columns-1;col++){
    const a=row*columns+col;
    if(row===0)tri.push(a,a+layer,a+1,a+1,a+layer,a+layer+1);
    else tri.push(a,a+1,a+layer,a+1,a+layer+1,a+layer);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.setIndex(tri);
  geometry.computeVertexNormals();
  k.geometry(j,finish,geometry);
}

function garmentFasteners(k,body,neck,torso,waist,finish,kind){
  if(kind==='skin')return;
  const chest=neck*.71,z=torso[3],wide=torso[2];
  for(const side of flanks){
    const x=t=>side*t;
    if(kind==='armour'){
      const w=wide*.67;
      const facets=[
        [x(.022),chest-.032,z+.043],[x(w*.62),chest+.083,z*.94],[x(w*1.13),chest+.013,z*.65],
        [x(w*1.40),chest-.139,z*.38],[x(w*.88),chest-.251,z*.73],[x(.055),chest-.22,z+.046],
      ];
      plate(k,body,finish,facets,.056,.019);
      sweep(k,body,'ironRim',[[x(.048),chest-.022,z+.086,.019],[x(w*.68),chest+.064,z*.95+.037,.022],
        [x(w*1.13),chest+.008,z*.66+.045,.019],[x(w*1.39),chest-.15,z*.39+.015,.004]],10,7);
      for(let i=0;i<2;i++){
        const y=.02+i*.109;
        plate(k,body,finish,[[x(.015),y+.092,z*.84],[x(w*.64),y+.086,z*.88],[x(w*1.13),y+.058,z*.53],
          [x(w),y-.048,z*.52],[x(w*.65),y-.066,z*.82],[x(.037),y-.037,z*.96]],.036,.011);
      }
      const back=[[x(.03),chest+.068,-z*.85],[x(w*.72),chest+.092,-z*.91],
        [x(w*1.34),chest+.021,-z*.6],[x(w*1.02),chest-.178,-z*.73],
        [x(.06),chest-.255,-z*.98],[x(.019),chest-.113,-z*1.02]];
      plate(k,body,finish,back,.05,.015);
      sweep(k,body,'ironRim',[[x(.04),chest-.253,-z-.037,.021],[x(w*.57),chest-.21,-z-.028,.014],
        [x(w*1.08),chest-.147,-z*.73-.026,.017],[x(w*1.28),chest-.017,-z*.61,.003]],11,6);
    }else{
      const neckline=kind==='ritual'?finish:'linen',crossover=kind==='rustic'?.37:.54;
      sweep(k,body,neckline,[[x(wide*.32),neck*.84,z*.64,.046],[x(wide*.64),neck*.75,z*.98,.042],
        [x(wide*.23),neck*.56,z*1.12,.034],[-x(wide*crossover),neck*.35,z*1.17,.026],
        [-x(waist*.73),.031,z*.95,.010]],14,7);
      for(let i=0;i<3;i++)sweep(k,body,finish,[[x(wide*(.57+i*.109)),neck*.70-i*.036,z*.68,.021],
        [x(wide*(.63+i*.092)),neck*.61-i*.039,z*.82,.017],[x(wide*(.78+i*.083)),neck*.35-i*.038,z*.75,.002]],9,6);
      sweep(k,body,'lining',[[x(wide*.43),neck*.84,-z*.62,.034],[x(wide*.75),neck*.63,-z*.89,.039],
        [x(wide*.49),neck*.29,-z*.96,.029],[x(.045),-.038,-z*.81,.019]],12,7);
    }
  }
  const belt=k.bone(body,0,-.055,-.01);
  belt.rotation.x=PI/2;belt.scale.y=z/waist*.92;
  rim(k,belt,'lining',waist*.992,.036);rim(k,belt,finish,waist*1.02,.018,.024);
  const buckle=k.bone(body,.017,-.064,z*.982+.025);
  const hw=kind==='armour'?.082:.064, h=.053;
  plate(k,buckle,finish,[[-hw,-h,0],[hw,-h,0],[hw,h,0],[-hw,h,0]],.028,.012);
  plate(k,buckle,'lining',[[-hw*.67,-h*.57,.024],[hw*.67,-h*.57,.024],[hw*.67,h*.57,.024],
    [-hw*.67,h*.57,.024]],.013,.004);
  sweep(k,buckle,'rivet',[[-hw*.68,.003,.036,.013],[0,.005,.042,.013],[hw*.63,.005,.036,.009]],6,5);
}

const faceProfiles={
  m003:['ogre','teal','ochre',1.0],m004:['soldier','ochre','black',.7],
  m006:['wild','skin','black',.92],m009:['ascetic','ivory','black',.64],
  m010:['elder','skin','black',.78],m011:['elder','emberHide','emberBone',1.04],
  m012:['ghost','ivory','steel',.72],m013:['noble','ivory','black',.66],
  m018:['elder','ochre','black',.88],m019:['ascetic','ivory','cobalt',.69],
  m020:['soldier','xiangFlesh','black',1.04],m023:['ogre','ochre','red',1.15],
  m028:['noble','skin','black',.70],m029:['elder','skin','ivory',.94],
  m031:['ascetic','ochre','black',.82],m032:['noble','ivory','cobalt',.67],
  m033:['wild','skin','ivory',.79],m034:['noble','ivory','steel',.73],
  m035:['elder','ochre','ivory',.89],m036:['ghost','ivory','steel',.80],
  m037:['ascetic','skin','ivory',.75],m038:['elder','ochre','ivory',1.04],
  m039:['soldier','ochre','teal',.82],m040:['wild','ochre','black',.91],
  m041:['ogre','teal','black',1.07],m042:['soldier','ochre','black',.83],
  m043:['ogre','ochre','black',1.18],m044:['ghost','cobalt','black',.92],
  m045:['ogre','teal','black',1.01],m046:['wild','clay','black',1.08],
  m047:['ogre','ochre','black',1.14],m048:['ghost','cobalt','black',.99],
  m049:['ogre','teal','black',1.18],m050:['wild','clay','black',1.20],
  m056:['ghost','ivory','steel',.76],
};

const fittedHelms={
  m004:{material:'jade',trim:'brass',crest:.38,flare:1.24,span:.94},
  m020:{material:'cobalt',trim:'steel',crest:.52,flare:1.41,span:1.05},
  m031:{material:'black',trim:'brass',crest:.26,flare:.97,span:.91},
  m033:{material:'black',trim:'red',crest:.44,flare:1.24,span:.94},
  m036:{material:'cobalt',trim:'steel',crest:.65,flare:1.51,span:.97},
  m041:{material:'jade',trim:'brass',crest:.48,flare:1.15,span:1.07},
};
const courtMasks={
  m012:{face:'cobalt',trim:'steel',opening:.51,jaw:false},
  m033:{face:'red',trim:'ivory',opening:.87,jaw:false},
  m041:{face:'jade',trim:'brass',opening:.71,jaw:false},
  m043:{face:'black',trim:'brass',opening:1.01},m044:{face:'cobalt',trim:'brass',opening:.86},
  m045:{face:'jade',trim:'brass',opening:1.12},m046:{face:'black',trim:'clay',opening:.65},
  m047:{face:'clay',trim:'brass',opening:1.26},m048:{face:'cobalt',trim:'steel',opening:.81},
  m049:{face:'jade',trim:'brass',opening:1.08},m050:{face:'clay',trim:'brass',opening:1.37},
};

function layeredBack(k,rig,torso,neck,finish,kind){
  if(!kind)return;
  const {body,cloak,limbs}=rig,z=torso[3];
  const n=kind==='gorge'?5:kind==='lacquer'?4:3;
  for(const side of flanks){
    const f=x=>side*x,span=torso[2]*.92;
    const arc=k.bone(body,0,neck*.62,-z*.52);
    arc.name=side<0?'Left scapular armour':'Right scapular armour';
    for(let row=0;row<n;row++){
      const y=.157-row*.126,run=span*(.89-.09*Math.cos(row*1.12));
      const profile=kind==='gorge'?1.16:kind==='lacquer'?.84:.91;
      const a=[[f(.029),y+.061,-z*.59],[f(run*.60),y+.084,-z*.67],
        [f(run*1.18),y+.019,-z*.28],[f(run*1.16),y-.068,-z*.19],
        [f(run*.67),y-.098*profile,-z*.68],[f(.056),y-.085*profile,-z*.81]];
      plate(k,arc,row%2?finish:'black',a,.048,.014);
      sweep(k,arc,kind==='lacquer'?'rivet':finish,[[f(.06),y-.078,-z*.89,.011],
        [f(run*.57),y-.078,-z*.79,.018],[f(run*1.15),y-.069,-z*.27,.010]],9,6);
      k.mesh(arc,'gem','rivet',f(run*.48),y+.037,-z*.72,.021,.023,.015);
    }
    const limb=limbs[side>0?1:0];
    const shield=k.bone(limb.shoulder,0,0,0);shield.name='Side pauldron';
    for(let i=0;i<(kind==='gorge'?3:2);i++){
      const y=.163-i*.088,w=.254-i*.030;
      plate(k,shield,i%2?finish:'ironRim',[[f(.084),y+.068,-.193],[f(w*.98),y+.085,-.125],
        [f(w*1.26),y+.002,.028],[f(w),y-.104,.163],[f(.103),y-.057,.177],[f(.104),y-.021,-.096]],.057,.013);
      sweep(k,shield,finish,[[f(.088),y+.071,-.206,.016],[f(w*.93),y+.08,-.161,.021],
        [f(w*1.25),y+.028,-.029,.024],[f(w*1.10),y-.064,.12,.014]],11,6);
    }
  }
  const brooch=k.bone(cloak,0,.038,-.14);
  brooch.name='Mantle clasp';
  rim(k,brooch,finish,.072,.019,-.012);
  k.mesh(brooch,'gem','ironRim',0,0,-.036,.041,.049,.02);
}

function gandharvaSkull(k,head,mobile){
  const profile=[[-.193,.035,.047,-.008],[-.178,.079,.092,-.011],[-.145,.113,.114,-.013],
    [-.105,.130,.128,-.020],[-.056,.146,.137,-.027],[.003,.158,.141,-.036],
    [.055,.156,.141,-.043],[.100,.151,.150,-.048],[.157,.147,.152,-.055],
    [.204,.133,.135,-.064],[.249,.099,.107,-.070],[.271,.058,.069,-.071],[.289,.004,.004,-.073]];
  const data=new T.CatmullRomCurve3(profile.map(([,w,d,z])=>new T.Vector3(w,d,z)),false,'catmullrom',.42);
  const gauss=(p,c,w)=>Math.exp(-(((p-c)/w)**2));
  function sample(y){
    const i=profile.findIndex((p,index)=>index<profile.length-1&&y<=profile[index+1][0]);
    const index=i<0?profile.length-2:i;
    const t=T.MathUtils.clamp((y-profile[index][0])/(profile[index+1][0]-profile[index][0]),0,1);
    return data.getPoint((index+t)/(profile.length-1));
  }
  function depth(x,y,cosine,contour){
    const u=Math.abs(x),front=contour.z+contour.y*cosine;
    if(cosine<=0)return front;
    const orbital=-.041*gauss(u,.069,.045)*gauss(y,.049,.022);
    const brow=.031*gauss(u,.073,.049)*gauss(y,.093,.024);
    const cheek=.040*gauss(u,.115,.038)*gauss(y,-.018,.035);
    const hollow=-.017*gauss(u,.110,.035)*gauss(y,-.080,.040);
    const bridge=.053*gauss(u,.004,.020)*gauss(y,.027,.058);
    const nose=.068*gauss(u,0,.025)*gauss(y,-.032,.020);
    const ala=.022*gauss(u,.035,.017)*gauss(y,-.041,.014);
    const lips=.016*gauss(u,0,.059)*gauss(y,-.104,.026);
    const chin=.023*gauss(u,0,.056)*gauss(y,-.149,.023);
    return front+(orbital+brow+cheek+hollow+bridge+nose+ala+lips+chin)*cosine**1.35;
  }
  const fitted=(x,y,lift=0)=>{
    const contour=sample(y),cosine=Math.sqrt(Math.max(.004,1-(x/contour.x)**2));
    return [x,y,depth(x,y,cosine,contour)+lift];
  };
  const position=[],uv=[],color=[],index=[];
  const bands=mobile?35:48,segments=mobile?40:56;
  for(let row=0;row<=bands;row++){
    const v=row/bands,y=-.193+v*.482,contour=sample(y);
    for(let col=0;col<=segments;col++){
      const u=col/segments,theta=(u-.5)*TAU,x=Math.sin(theta)*contour.x,cosine=Math.cos(theta);
      position.push(x,y,depth(x,y,cosine,contour));uv.push(u,v);
      const blood=gauss(Math.abs(x),.10,.043)*gauss(y,-.018,.059)*Math.max(0,cosine);
      const shade=.76+Math.max(0,cosine)*.19+Math.sin(theta*7+y*45)*.032;
      color.push(shade*(1+blood*.18),shade*(1-blood*.12),shade*(1-blood*.10));
      if(row<bands&&col<segments){
        const a=row*(segments+1)+col,b=a+segments+1;
        index.push(a,a+1,b,a+1,b+1,b);
      }
    }
  }
  for(const [row,winding] of [[0,-1],[bands,1]]){
    const v=row/bands,y=-.193+v*.482,center=position.length/3;
    position.push(0,y,sample(y).z);uv.push(.5,v);color.push(.80,.78,.77);
    for(let col=0;col<segments;col++){
      const start=row*(segments+1)+col;
      if(winding<0)index.push(center,start+1,start);
      else index.push(center,start,start+1);
    }
  }
  const g=new T.BufferGeometry();
  g.setIndex(index);g.setAttribute('position',new T.Float32BufferAttribute(position,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(color,3));
  g.computeVertexNormals();
  const normals=g.attributes.normal,a=new T.Vector3(),b=new T.Vector3();
  for(let row=0;row<=bands;row++){
    const first=row*(segments+1),last=first+segments;
    a.fromBufferAttribute(normals,first).add(b.fromBufferAttribute(normals,last)).normalize();
    normals.setXYZ(first,...a.toArray());normals.setXYZ(last,...a.toArray());
  }
  head.userData.gandharvaSculpt=true;
  k.geometry(head,'gandharvaSkin',g);
  const jaw=k.bone(head,0,-.111,.033);
  jaw.name='乾達婆 · 下顎';
  const seam=(joint,finish,points,jawed=false)=>sweep(k,joint,finish,points.map(([x,y,r,lift])=>{
    const [xx,yy,z]=fitted(x,y,lift);
    return [xx,yy+(jawed?.111:0),z-(jawed?.033:0),r];
  }),mobile?8:12,6);
  const earDress=[];
  for(const side of flanks){
    const f=x=>side*x;
    const top=[[f(.028),.043],[f(.047),.055],[f(.076),.063],[f(.102),.061],[f(.116),.051]];
    const bottom=[[f(.116),.051],[f(.099),.038],[f(.073),.032],[f(.047),.034],[f(.028),.043]];
    const lens=[...top,...bottom.slice(1,-1)].map(([x,y])=>fitted(x,y,.021));
    plate(k,head,'lining',lens,.014,.005);
    const iris=fitted(f(.073),.047,.033);
    k.mesh(head,'round','gandharvaEye',...iris,.032,.013,.013,0,f(.38),f(.104));
    k.mesh(head,'gem','glow',iris[0]-.008,iris[1]+.002,iris[2]+.013,.009,.010,.005,0,f(.29));
    k.mesh(head,'round','black',iris[0]-.004,iris[1]+.001,iris[2]+.016,.004,.007,.004,0,f(.24));
    seam(head,'gandharvaSkin',top.map(([x,y],i)=>[x,y,[.004,.008,.011,.009,.002][i],.032]));
    seam(head,'gandharvaLip',bottom.map(([x,y],i)=>[x,y,[.003,.006,.007,.005,.001][i],.027]));
    seam(head,'black',[[f(.031),.086,.004,.009],[f(.058),.102,.011,.013],
      [f(.094),.105,.014,.012],[f(.125),.091,.009,.008],[f(.136),.080,.002,.006]]);
    seam(head,'lining',[[f(.021),-.048,.004,.012],[f(.034),-.052,.007,.011],[f(.047),-.049,.002,.010]]);
    seam(head,'gandharvaLip',[[0,-.103,.004,.009],[f(.024),-.099,.008,.013],[f(.049),-.101,.006,.011],
      [f(.064),-.106,.002,.006]]);
    seam(jaw,'gandharvaLip',[[0,-.118,.008,.010],[f(.025),-.116,.009,.012],
      [f(.047),-.111,.006,.008],[f(.063),-.106,.002,.007]],true);
    seam(head,'lining',[[0,-.112,.004,.012],[f(.028),-.109,.005,.012],[f(.064),-.106,.002,.008]]);
    const ear=k.bone(head,f(.139),.024,-.033);
    ear.rotation.y=f(.6);
    volume(k,ear,'gandharvaSkin',[[0,-.062,.021,.014,.011],[f(.027),-.024,.028,.033,.024],
      [f(.035),.017,.015,.042,.019],[f(.036),.056,-.012,.032,.015],[f(.020),.079,-.021,.012,.008]],
    mobile?10:15,2.11,.08);
    sweep(k,ear,'gandharvaLip',[[f(.004),-.037,.049,.008],[f(.034),-.006,.043,.012],
      [f(.039),.024,.034,.008],[f(.026),.045,.029,.003]],9,6);
    const drop=k.bone(ear,f(.012),-.054,.043);
    rim(k,drop,'brass',.037,.008,.008);
    k.mesh(drop,'gem','jade',0,-.067,.012,.019,.033,.014);
    earDress.push({drop,side});
  }
  return {jaw,earDress};
}

function humanoid(k,entry,descriptor){
  const {torso,waist,neck,skin='skin',shell='body',sleeve=shell,skirt='deep',facing=.14,boot='black',width=.34,mask='ivory',
    height=1.17,edge='brass',dress=0,robe=0,teeth=false,hair='black',rear='deep',collar=0,
    clad=false,bodySurface,replaceCrown=false,cut=teeth?'skin':shell==='black'||shell==='cobalt'?'armour':robe>.9?'ritual':'rustic'}=descriptor;
  const body=k.bone(k.root,0,height,0),head=k.bone(body,0,neck,facing);
  head.name='Head and helmet';
  const chest=[
    [0,-.44,-.048,waist*.86,waist*.67],[0,-.23,-.025,waist,.24],[0,.023,.012,torso[0],torso[3]*.92],
    [0,neck*.31,-.012,torso[1],torso[3]],[0,neck*.72,-.056,torso[2],torso[3]*.78],
    [0,neck*.91,-.048,torso[0]*.53,torso[3]*.65],
  ];
  if(bodySurface)bodySurface(k,body,chest,descriptor.mobile);
  else volume(k,body,shell,chest,23,2.32,.19);
  const [style,finish,brow,fit]=faceProfiles[entry.id];
  const custom=descriptor.headSurface?.(k,head,descriptor.mobile)??
    (entry.id==='m040'?gandharvaSkull(k,head,descriptor.mobile):null);
  const {jaw}=custom??carvedFace(k,head,{style,finish,brow,width:width*fit,dark:'lining',fang:mask});
  if(!custom&&!replaceCrown)volume(k,head,hair,[[0,-.102,-.102,width*.43,.096],[0,.056,-.137,width*.58,.103],
    [0,.186,-.094,width*.53,.135],[0,.282,-.065,width*.40,.112]],16,2.25,.27,true);
  if(!replaceCrown&&entry.id!=='m041'&&fittedHelms[entry.id])openHelm(k,head,fittedHelms[entry.id]);
  if(entry.id!=='m041'&&courtMasks[entry.id])demonicMempo(k,head,courtMasks[entry.id]);
  const limbs=[],skirts=[];
  const cloak=k.bone(body,0,neck*.69,-torso[3]*.8);
  if(robe){
    for(let i=-4;i<=4;i++){
      const angle=PI+i*.27,tip=robe*(.82+.19*Math.cos(i*.61));
      const flap=k.bone(cloak,Math.sin(angle)*.29,.01,.033+Math.cos(angle)*.054);
      flap.rotation.y=i*.15;
      const width=.122+Math.cos(i*.7)*.041;
      garmentPanel(k,flap,i%3?rear:skirt,[[0,.071,.006,width*.74,.018],
        [.008,-tip*.28,-.127,width*.98,.036],[.018,-tip*.68,-.249,width*1.13,.039],
        [.039,-tip*.96,-.32,width*.81,.050]],i*.92);
      sweep(k,flap,cut==='armour'?edge:'linen',[[width*.61,.063,-.019,.015],[width*.94,-tip*.28,-.157,.012],
        [width,-tip*.70,-.286,.012],[width*.78,-tip*.925,-.36,.004]],10,6);
      skirts.push(flap);
    }
  }
  if(dress){
    for(let i=0;i<10;i++){
      const flap=k.bone(body,0,-.14,0);
      flap.rotation.y=TAU*i/10;
      const length=dress*(.86+.14*Math.cos(i*2.32));
      const r=waist+.051;
      if(cut==='armour'&&dress<.8){
        plate(k,flap,i%3===1?rear:skirt,[[-.10,.065,r],[.125,.067,r],[.148,-length*.42,r+.068],
          [.143,-length*.82,r+.13],[.093,-length*.96,r+.147],
          [-.091,-length*.98,r+.143],[-.141,-length*.79,r+.111],[-.158,-length*.43,r+.073]],.054,.013);
      }else garmentPanel(k,flap,i%3===1?rear:skirt,[[0,.059,r,.115,.021],[.017,-length*.33,r+.042,.146,.035],
        [-.009,-length*.68,r+.137,.164,.047],[(i%3-1)*.034,-length,r+.174,.134,.048]],i*1.23);
      sweep(k,flap,i%2?edge:shell,[[.094,.031,r+.041,.015],[.142,-.312,r+.072,.016],
        [.154,-length*.76,r+.149,.010],[.087,-length*.923,r+.172,.003]],10,6);
      skirts.push(flap);
    }
  }
  for(const side of flanks){
    const f=x=>x*side,y=neck*.65;
    const shoulder=k.bone(body,f(torso[2]*.87),y,-.014);
    const elbow=k.bone(shoulder,f(.145),-.32,.014);
    const wrist=k.bone(elbow,f(.025),-.338,.054);
    const leg=k.bone(body,f(waist*.55),-.31,-.043);
    const knee=k.bone(leg,f(.026),-.394,-.061);
    if(clad){
      limbs.push({shoulder,elbow,wrist,leg,knee,side});
      continue;
    }
    volume(k,shoulder,sleeve,[[0,.071,0,.139,.117],[f(.093),-.071,-.016,.168,.147],
      [f(.125),-.211,.004,.132,.110],[f(.153),-.333,.008,.104,.095]],15,2.21,.23);
    volume(k,elbow,sleeve,[[0,.033,0,.106,.105],[f(.034),-.079,.018,.142,.132],
      [f(.034),-.229,.015,.117,.099],[f(.025),-.334,.054,.071,.071]],15,2.30,.22);
    volume(k,wrist,skin,[[0,.040,0,.061,.065],[0,-.016,.016,.095,.088],
      [f(.014),-.100,.085,.074,.050]],11,2.38,.19);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.037;
      sweep(k,wrist,i===1?skin:edge,[[x,.015,.018,.023],[x,-.046,.092,.026],[x,-.098,.113,.020]],8,6);
    }
    volume(k,leg,skirt,[[0,.07,0,.134,.13],[f(.013),-.106,.019,.153,.139],
      [f(.024),-.297,-.035,.127,.121],[f(.031),-.431,-.063,.100,.119]],14,2.4,.19);
    volume(k,knee,boot,[[0,.052,0,.113,.12],[0,-.16,0,.108,.102],[f(.013),-.28,.07,.116,.111],
      [f(.017),-.306,.192,.135,.064],[f(.013),-.308,.242,.084,.038]],15,2.8,.15);
    for(let i=0;i<3;i++){
      const b=k.bone(elbow,f(.027),-.166-i*.067,.034);
      b.rotation.x=PI/2;
      rim(k,b,i===1?shell:edge,.119-i*.009,cut==='armour'?.020:.013);
      if(cut==='armour')plate(k,shoulder,i===0?edge:shell,[[f(.028),.142-i*.078,-.108],
        [f(.186+i*.017),.147-i*.075,-.074],[f(.231+i*.016),.017-i*.068,.056],
        [f(.12),-.048-i*.073,.148],[f(.002),-.015-i*.074,.105]],.045,.012);
      else if(cut!=='skin')sweep(k,shoulder,i===1?edge:shell,[[f(.04),.10-i*.075,-.09,.037],
        [f(.162),.104-i*.072,-.078,.033],[f(.205),.009-i*.073,.038,.022],[f(.101),-.04-i*.073,.141,.004]],10,7);
    }
    if(cut==='armour'){
      plate(k,elbow,edge,[[f(.02),.016,.091],[f(.109),.019,.098],[f(.164),-.214,.104],
        [f(.121),-.303,.12],[f(.038),-.237,.129],[f(-.034),-.097,.141]],.048,.013);
      plate(k,knee,edge,[[f(.027),.021,.098],[f(.101),-.066,.106],[f(.098),-.17,.125],
        [f(.029),-.236,.141],[f(-.055),-.154,.124],[f(-.068),-.048,.106]],.04,.013);
      sweep(k,shoulder,'ironRim',[[f(.02),.105,-.132,.023],[f(.161),.102,-.153,.025],
        [f(.246),.017,-.069,.021],[f(.244),-.079,.056,.009]],10,7);
    }
    if(!custom&&!fittedHelms[entry.id])sweep(k,head,finish,[[f(width*.40),.073,.012,.030],
      [f(width*.46*fit),.038,.004,.035],[f(width*.435*fit),-.021,.012,.021],[f(width*.37),-.048,.036,.006]],9,7);
    if(!custom&&!teeth)for(let i=0;i<3;i++)vane(k,head,hair,[f(.046+i*.039),.253,-.052],
      [f(.071+i*.05),.184,-.158],[f(.074+i*.053),.019-i*.037,-.222],.039,13+i);
    for(let i=0;i<3;i++){
      const arch=collar+i*.022;
      if(collar)sweep(k,body,edge,[[f(.081),neck*.74+i*.020,.186,.021],
        [f(.25),neck*.82+arch*.26,.143,.032],[f(.421),neck*(.77+i*.043)+arch*.36,-.09,.023],
        [f(.426),neck*.74+arch*.16,-.193,.003]],11,6);
    }
    limbs.push({shoulder,elbow,wrist,leg,knee,side});
  }
  if(!clad)garmentFasteners(k,body,neck,torso,waist,edge,cut);
  const rig={body,head,jaw,limbs,skirts,cloak,earDress:custom?.earDress,look:custom};
  const fitted=entry.id>='m043'&&entry.id<='m050'?'gorge':fittedHelms[entry.id]?'lacquer':
    ['m018','m035','m037','m038','m039','m042'].includes(entry.id)?'mantle':null;
  if(!clad)layeredBack(k,rig,torso,neck,edge,fitted);
  return rig;
}

function poseHumanoid(rig,{beat,step,wind,strike,travel},motion={}){
  for(const {side,shoulder,elbow,wrist,leg,knee} of rig.limbs){
    const stride=Math.sin(step+side*PI*.5)*travel;
    shoulder.rotation.x=-.13+stride*.31-wind*(side>0?(motion.gather??.81):.54)+strike*(side>0?(motion.swing??.89):.47);
    shoulder.rotation.z=side*(.08+(motion.spread??.11)+wind*.29-strike*.13);
    elbow.rotation.x=-.43+Math.abs(stride)*.22+wind*.44-strike*.41;
    wrist.rotation.y=side*(.093+wind*.19-strike*.22);
    leg.rotation.x=-.07+stride*.26-wind*.072+strike*.19;
    knee.rotation.x=Math.max(0,-stride)*.45+wind*.07;
  }
  for(const [i,flap] of rig.skirts.entries()){
    flap.rotation.x=Math.sin(beat*.67+i*.54)*(.047+travel*.055)+strike*.32;
    flap.rotation.z=Math.sin(beat*.70+i*.79)*(.066+travel*.06)+wind*.055;
  }
  rig.jaw.rotation.x=.06+wind*.16+strike*.33;
  if(rig.earDress){
    rig.jaw.rotation.x=.019+wind*.074+strike*.145;
    for(const {drop,side} of rig.earDress){
      drop.rotation.x=Math.sin(beat*.77+side)*.11+wind*.06-strike*.14;
      drop.rotation.z=side*.08+travel*Math.cos(step+side)*.14;
    }
  }
  rig.head.rotation.x=-wind*.14+strike*.29;
  rig.head.rotation.y=Math.sin(beat*.54)*.086-wind*.19+strike*.15;
  rig.cloak.rotation.x=travel*.24+strike*.26;
}

function solidBlade(k,j,h,wide,kind,edge='steel',shaft='black'){
  markEnemyWeapon(j,kind==='axe'?[wide*1.35,h+.20,0]:[kind==='sabre'?wide*.95:0,h+.17,-.075],{width:Math.max(.112,wide*.83)});
  if(kind==='axe'){
    sweep(k,j,shaft,[[0,-.87,0,.06],[0,-.38,.025,.064],[0,.35,0,.06],[0,h-.19,-.017,.076]],17,8);
    plate(k,j,edge,[[0,h,0],[wide*.72,h+.28,-.06],[wide*1.51,h+.25,.015],[wide*1.59,h-.062,.02],
      [wide*1.32,h-.35,.08],[wide*.93,h-.38,.128],[wide*.64,h-.22,.092],[0,h-.1,.01]],.079,.022);
    plate(k,j,shaft,[[0,h,0],[-wide*.47,h+.01,.065],[-wide*.74,h+.137,.04],[-wide*.88,h-.181,.10],
      [-wide*.307,h-.23,.062],[0,h-.113,.089]],.085,.018);
    for(let i=0;i<4;i++)sweep(k,j,'glow',[[wide*(.4+i*.23),h-.07,.071,.018],
      [wide*(.55+i*.22),h+.103,.074,.015],[wide*(.59+i*.28),h+.18,.071,.003]],8,6);
    return;
  }
  if(kind==='lance'){
    sweep(k,j,shaft,[[0,-1.07,0,.031],[0,-.18,0,.042],[0,.57,.016,.039],[0,h-.15,-.024,.054]],19,8);
    plate(k,j,edge,[[-wide*.82,h-.19,-.026],[-wide,h-.04,-.019],[-wide*.21,h+.22,-.06],
      [.004,h+.36,-.10],[wide*.47,h+.094,-.03],[wide*.85,h-.01,.023],[wide*.37,h-.183,.012]],.076,.018);
    for(const side of flanks)sweep(k,j,'brass',[[0,h-.193,.034,.03],[side*wide*.63,h-.111,.035,.021],
      [side*wide*.91,h+.04,-.001,.004]],9,6);
    return;
  }
  const curved=kind==='sabre',x=curved?wide*.78:0;
  sweep(k,j,shaft,[[0,-.32,0,.046],[0,-.14,0,.057],[0,.05,0,.051],[0,.172,.02,.049]],10,8);
  plate(k,j,edge,[[-wide,.161,.016],[wide*.95,.17,.016],[wide*.91+x*.21,h*.46,-.035],
    [wide*.84+x*.69,h*.79,-.104],[x+wide*.25,h+.156,-.128],[x-wide*.4,h+.066,-.13],
    [-wide+x*.56,h*.68,-.074],[-wide+x*.14,h*.31,-.01]],.075,.018);
  sweep(k,j,'brass',[[-wide*1.77,.147,.018,.036],[-wide*.77,.201,.04,.041],[wide*1.32,.146,.029,.040],
    [wide*1.58,.166,.051,.007]],10,7);
  sweep(k,j,'glow',[[0,.204,.055,.021],[x*.12,h*.36,.049,.019],
    [x*.57,h*.76,-.036,.014],[x+wide*.23,h+.124,-.05,.003]],13,6);
}

function ritualPole(k,j,height,mark,tip='ivory'){
  markEnemyWeapon(j,[0,height+.24,.04],{width:.17,aim:false});
  sweep(k,j,'black',[[0,-.81,0,.040],[0,-.37,0,.047],[0,.37,.026,.043],
    [0,height-.05,.04,.053]],16,8);
  for(let i=0;i<7;i++)k.mesh(j,'ring',i%2?'brass':'ochre',0,.08+i*.105,.019,.052,.051,.6,PI/2);
  rim(k,j,tip,.104,.021,.062);
  mark(k,k.bone(j,0,height,.043),tip);
}

function hiddenHalo(k,body,y,z,r,finish,points,tilt=0){
  const base=k.bone(body,0,y,z),joints=[];
  base.rotation.x=tilt;
  rim(k,base,finish,r,.018);
  for(let i=0;i<points;i++){
    const a=i*TAU/points;
    const part=k.bone(base,Math.cos(a)*r,Math.sin(a)*r,.026);
    part.rotation.z=a+PI*.5;
    k.mesh(part,'gem','glow',0,0,0,.056,.087,.043);
    plate(k,part,finish,[[-.067,-.056,-.002],[.061,-.055,.009],[.085,.056,.005],
      [-.01,.153,-.02],[-.081,.037,-.006]],.036,.009);
    joints.push(part);
  }
  return {base,joints};
}

function ironOni(k,entry,mobile){
  const rig=humanoid(k,entry,{torso:[.46,.61,.59,.32],waist:.43,neck:.71,skin:'teal',shell:'teal',
    skirt:'teal',height:1.04,width:.48,edge:'ochre',hair:'ochre',teeth:true,clad:true,bodySurface:oniTorso,mobile});
  const {body,head}=rig;
  const anatomy=oniLimbSculpt(k,rig,mobile);
  sweep(k,head,'ivory',[[0,.176,.136,.09],[-.005,.265,.140,.075],[-.033,.399,.104,.043],
    [-.059,.513,.025,.003]],15,9);
  for(const side of flanks){
    for(let i=0;i<5;i++){
      const x=side*(.054+i*.03);
      sweep(k,head,'ochre',[[x,.159,.091,.039],[x*1.29,.29,-.04,.049],
        [x*1.48,.375+i*.012,-.183,.038],[x*1.24,.301,-.27,.005]],12,7);
    }
    const buckle=k.bone(body,side*.35,.085,.246);
    buckle.rotation.y=side*.45;
    rim(k,buckle,'brass',.126,.038);
    rim(k,buckle,'black',.087,.014,.025);
  }
  for(let i=0;i<13;i++){
    const a=TAU*i/13;const joint=k.bone(body,0,-.082,0);joint.rotation.y=a;
    const r=.433+.037*Math.sin(i*.7);
    const length=i===0||i===6?.192:.21+.061*Math.cos(i*1.37);
    plate(k,joint,i%2?'ochre':'brass',[[.082,.017,r],[-.098,0,r],[-.106,-length*.67,r+.025],
      [-.021,-length,r+.06],[.099,-length*.72,r+.029]],.047,.014);
    sweep(k,joint,'black',[[.014,-.014,r+.041,.015],[.018,-.109,r+.06,.016],[-.009,-.236,r+.091,.003]],7,6);
  }
  const club=k.bone(rig.limbs[0].wrist,0,-.06,.081);
  markEnemyWeapon(club,[-.034,.88,-.08],{width:.24});
  volume(k,club,'ochre',[[0,-.15,0,.065,.056],[0,.12,0,.069,.073],[-.026,.31,.01,.123,.118],
    [-.045,.71,-.053,.181,.145],[-.034,.88,-.08,.131,.107]],17,3.02,.31);
  for(let i=0;i<7;i++){
    const a=TAU*i/7;
    sweep(k,club,'brass',[[Math.sin(a)*.11,.47,Math.cos(a)*.11,.041],
      [Math.sin(a)*.18,.62,Math.cos(a)*.19,.048],[Math.sin(a)*.25,.62,Math.cos(a)*.27,.004]],10,7);
  }
  const model=sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:1.1,swing:.68,spread:.24});
    rig.limbs[0].shoulder.rotation.x=-.19-pose.wind*1.21+pose.strike*1.07;
    club.rotation.x=-.31-pose.wind*.35+pose.strike*.23;
    anatomy.pose(pose);
  },'slam');
  return {...model,oniGarments:anatomy.garments};
}

function bandit(k,entry,mobile){
  const rig=humanoid(k,entry,{torso:[.24,.28,.354,.183],waist:.25,neck:.89,
    shell:'banditVest',sleeve:'banditLinen',skirt:'banditWrap',rear:'dusk',height:1.12,hair:'black',edge:'red',robe:.42,dress:.55});
  const {body,head}=rig;
  const portraitPose=redBanditPortrait(k,rig,mobile);
  for(const side of flanks){
    const f=x=>x*side;
    sweep(k,head,'black',[[f(.045),-.044,.169,.017],[f(.127),-.065,.164,.027],
      [f(.179),-.096,.087,.021],[f(.172),-.126,.03,.003]],9,6);
    plate(k,body,'banditVest',[[f(.049),.57,.198],[f(.310),.614,.124],
      [f(.304),.229,.191],[f(.180),.093,.221],[f(.07),.251,.227]],.023,.009);
  }
  sweep(k,body,'red',[[-.27,.656,.105,.036],[-.063,.46,.241,.039],[.108,.241,.258,.038],
    [.296,.019,.141,.033]],15,7);
  const swordArm=rig.limbs[1],blade=k.bone(swordArm.wrist,.040,-.040,.103);
  blade.name='赤賊頭目 · 長刀';
  solidBlade(k,blade,1.44,.083,'sabre','steel','banditWrap');
  const ribbon=k.bone(body,-.239,-.022,-.07);
  for(let i=0;i<4;i++)vane(k,ribbon,i%2?'red':'ochre',[-.027,.004,.034],[-.13,-.18,-.06],
    [-.22-i*.041,-.46,-.13+i*.027],.045,12+i);
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:.67,swing:1.1});
    portraitPose(pose);
    const ready=1-Math.min(1,pose.wind+pose.strike);
    swordArm.shoulder.rotation.x-=ready*.64;
    swordArm.elbow.rotation.x-=ready*.79;
    blade.rotation.set(.38+pose.wind*.42-pose.strike*.76,.26,-1.15-pose.wind*.55+pose.strike*.38);
    ribbon.rotation.x=pose.travel*.43+Math.sin(pose.beat*1.19)*.173+pose.strike*.38;
  },'duel');
}

function auspiciousPoleA(k,j,tip){
  rim(k,j,'brass',.229,.027,.039);
  for(let i=0;i<7;i++){
    const f=k.bone(j,0,0,0);f.rotation.z=i*TAU/7;
    plate(k,f,tip,[[0,.058,.064],[-.093,.198,.033],[-.055,.386,.05],[.018,.299,.066],
      [.065,.177,.039]],.036,.009);
  }
  k.mesh(j,'gem','glow',0,0,.029,.099,.123,.084);
}
function auspiciousPoleB(k,j,tip){
  for(const side of flanks)sweep(k,j,tip,[[0,-.062,.019,.052],[side*.136,.019,.042,.055],
    [side*.267,.141,-.064,.047],[side*.278,.289,-.067,.023],[side*.219,.362,-.083,.003]],15,8);
  k.mesh(j,'gem','glow',0,.161,.027,.09,.112,.082);rim(k,j,'brass',.151,.021,.037);
}

const constellations={
  m010:{torso:[.27,.37,.42,.22],dress:1.14,shell:'jade',skirt:'jade',rear:'black',edge:'brass',
    head:'crown',pose:[.95,.72,1.3],gear:'censer'},
  m011:{torso:[.35,.48,.49,.29],dress:.79,shell:'skin',skirt:'ochre',rear:'red',edge:'brass',
    head:'tie',pose:[1.16,1.34,.83],gear:'axe'},
  m012:{torso:[.26,.34,.38,.21],dress:.95,shell:'cobalt',skirt:'dusk',rear:'cobalt',edge:'steel',
    head:'white',pose:[.61,.77,.67],gear:'arrow'},
};
function constellation(k,entry,mobile){
  const a=constellations[entry.id];
  const flame=entry.id==='m011',wind=entry.id==='m010';
  const rig=humanoid(k,entry,{...a,waist:a.torso[0],neck:.88,collar:.26,robe:0,dress:0,
    hair:a.head==='white'?'ivory':'black',clad:flame,replaceCrown:true,
    headSurface:flame?undefined:fateMentorPortrait(wind),bodySurface:flame?emberBody:undefined,mobile});
  const {body,head}=rig,crown=k.bone(head,0,.18,-.04);
  const hand=k.bone(rig.limbs[1].wrist,.021,-.033,.047);
  const commander=flame?emberCommander(k,rig,hand,mobile):null;
  let aura=null;
  for(const side of flame?[]:flanks){
    const f=x=>x*side;
    if(a.head==='crown')for(let i=0;i<3;i++){
      sweep(k,crown,'brass',[[f(.05+i*.032),.014,.051,.033],
        [f(.132+i*.025),.081+i*.058,-.023,.039],
        [f(.135+i*.055),.193+i*.085,-.111,.004]],13,8);
    }
    for(let i=0;i<3;i++){
      plate(k,body,i%2?a.edge:a.shell,[[f(.067),.492-i*.091,.257],
        [f(.231),.568-i*.135,.193],[f(.327),.469-i*.138,.113],[f(.235),.331-i*.082,.201],
        [f(.095),.345-i*.086,.27]],.039,.012);
    }
  }
  if(a.gear==='censer'){
    ritualPole(k,hand,1.26,auspiciousPoleB,'ivory');
    aura=hiddenHalo(k,body,-.28,.001,.716,'jade',11,PI/2);
  }else if(a.gear==='arrow'){
    solidBlade(k,hand,1.26,.071,'lance','cobalt');
  }
  const model=sourcePose(entry,body,head,pose=>{
    const [gather,swing,spin]=a.pose;
    poseHumanoid(rig,pose,{gather,swing});
    hand.rotation.z=.24-pose.wind*.63+pose.strike*.97;
    hand.rotation.x=.10+pose.wind*.37-pose.strike*.67;
    commander?.pose(pose);
    if(!flame)poseFateMentor(rig,pose,wind);
    if(aura){
      aura.base.rotation.z=pose.headtime*spin;
      for(const [i,j] of aura.joints.entries())j.rotation.y=Math.sin(pose.beat*.49+i*.62)*.22+pose.wind*.49;
    }
  },flame||wind?'duel':'hover');
  if(flame)return {...model,commanderGarments:commander.strips};
  return {...model,legs:wind?rig.limbs.map(limb=>limb.leg):[],sourceSculpt:true,
    sourceDress:tools=>dressFateMentor(rig,tools,wind),
    polishEnergy:{tint:wind?0xa2dab5:0x9ddbf3,shape:wind?'ribbons':'mist',anchor:body,span:[.69,.74,.55]}};
}

function spiralFans(k,j){
  for(const side of flanks){
    const f=x=>side*x;
    plate(k,j,'ivory',[[0,.02,.024],[f(.234),.041,.039],[f(.373),.199,.031],[f(.25),.38,-.029],
      [f(.037),.301,.006],[f(.061),.15,.01]],.031,.008);
    for(let i=0;i<6;i++)sweep(k,j,i%2?'brass':'glow',[[0,.027,.062,.01],
      [f(.171+i*.021),.101+i*.029,.073,.013],[f(.294+i*.013),.205+i*.02,.062,.002]],8,6);
  }
}

function firstEmperor(k,entry,mobile){
  const rig=humanoid(k,entry,{torso:[.277,.329,.374,.238],waist:.288,neck:.879,height:1.184,
    clad:true,replaceCrown:true,bodySurface:qinGownCore,headSurface:qinCourtHead,mobile});
  const {body,head,limbs}=rig,{animate,sourceDress,finishPose,blade}=fitQinFireRegalia(k,rig,mobile);
  const pose=sourcePose(entry,body,head,p=>{
    poseHumanoid(rig,p,{gather:.62,swing:.82,spread:.047});
    animate(p);
  },'duel');
  return {...pose,sourceSculpt:true,sourceDress,finishPose,inspectionHead:head,qinFireSabre:blade,
    arms:limbs.map(limb=>limb.shoulder),legs:limbs.map(limb=>limb.leg),
    polishEnergy:{tint:0xe59a55,shape:'sigils',anchor:body,offset:[0,.26,-.10],span:[.55,.93,.46]}};
}

function qinRider(k,entry,mobile){
  const spectralHorse=entry.id==='m004',general=entry.id==='m020',tiger=entry.id==='m029';
  const rig=humanoid(k,entry,{torso:general?[.29,.38,.41,.22]:[.25,.31,.35,.19],
    waist:.27,neck:.82,shell:tiger?'steel':general?'cobalt':'jade',skirt:'dusk',rear:tiger?'ochre':general?'cobalt':'jade',
    robe:general?.86:.78,edge:tiger?'brass':'steel',collar:.18,height:1.23});
  const {body,head}=rig;
  const mount=k.bone(k.root,0,.93,-.061);
  body.position.y=.32;body.position.z=-.187;
  mount.add(body);
  const tail=[],legs=[];
  volume(k,mount,tiger?'black':general?'cobalt':'ivory',[[0,.177,-.82,.158,.14],[0,.126,-.59,.291,.25],
    [0,.032,-.20,.353,.319],[0,.05,.31,.316,.327],[0,.083,.63,.224,.239]],22,2.18,.22);
  for(const side of flanks){
    const f=x=>side*x;
    const hide=tiger?'moss':'cobalt',bridle=tiger?'ochre':'brass';
    const bard=k.bone(mount,0,0,0);
    garmentPanel(k,bard,hide,[[f(.297),.322,-.08,.103,.019],[f(.352),.19,-.112,.131,.028],
      [f(.367),-.09,-.186,.126,.055],[f(.409),-.339,-.238,.089,.050]],side*1.43);
    for(let i=0;i<2;i++){
      const chest=k.bone(mount,0,-i*.092,.413-i*.14);
      sweep(k,chest,'lining',[[f(.093),.288,.116,.039],[f(.273),.141,.125,.037],
        [f(.366),-.082,-.06,.033],[f(.346),-.132,-.348,.026]],13,7);
      sweep(k,chest,bridle,[[f(.093),.276,.148,.017],[f(.281),.131,.153,.019],
        [f(.381),-.083,-.018,.014],[f(.358),-.131,-.318,.009]],10,6);
    }
    const clasp=k.bone(mount,f(.377),.043,-.44);
    clasp.rotation.y=side*.9;
    rim(k,clasp,bridle,.092,.022);rim(k,clasp,'lining',.057,.013,.018);
  }
  const neck=k.bone(mount,0,.32,.386);
  volume(k,neck,'cobalt',[[0,-.173,.16,.27,.197],[0,.141,.15,.252,.218],
    [0,.455,.27,.194,.175],[0,.69,.413,.113,.103]],20,2.16,.19);
  const muzzle=k.bone(neck,0,.613,.408);
  if(tiger)neck.visible=false;
  volume(k,muzzle,general?'steel':'ivory',[[0,-.018,-.194,.144,.131],[0,.08,-.052,.152,.153],
    [0,.068,.119,.109,.103],[0,.015,.332,.111,.087],[0,-.022,.442,.099,.072]],15,2.29,.22);
  for(const side of flanks){
    const f=x=>x*side;
    sweep(k,muzzle,'cobalt',[[f(.084),.167,.015,.054],[f(.094),.261,-.042,.051],[f(.118),.329,-.119,.005]],11,7);
    k.mesh(muzzle,'gem','glow',f(.131),.100,.129,.036,.028,.017,0,f(.4));
    sweep(k,muzzle,'lining',[[f(.056),-.08,.391,.027],[f(.128),-.036,.28,.034],
      [f(.156),.039,.151,.035],[f(.128),.13,.033,.029],[f(.123),.181,-.11,.016]],13,8);
    sweep(k,muzzle,'brass',[[f(.063),-.078,.392,.013],[f(.139),-.031,.28,.016],
      [f(.171),.043,.15,.017],[f(.145),.132,.036,.012],[f(.136),.185,-.091,.003]],11,7);
    for(let i=0;i<7;i++)vane(k,neck,i%2?'steel':'cobalt',[f(.014),.645-i*.081,.294-i*.066],
      [f(.157),.51-i*.073,.142-i*.057],[f(.201+i*.014),.344-i*.064,-.071-i*.055],.081,33+i);
    for(let i=0;!spectralHorse&&i<4;i++)plate(k,mount,i%2?'steel':'cobalt',[[f(.127),.302-i*.08,-.53],
      [f(.327),.332-i*.091,-.414],[f(.395),.224-i*.062,-.012],[f(.31),.113-i*.09,.189],[f(.23),.145-i*.08,.101]],.046,.014);
    for(const front of [false,true]){
      const leg=k.bone(mount,f(.211),-.072,front?.433:-.51);
      const knee=k.bone(leg,f(.047),-.389,front?.102:-.145);
      let fetlock;
      if(spectralHorse)fetlock=qinMountLeg(k,leg,knee,side,front,mobile);
      else{
        volume(k,leg,front?'ivory':'cobalt',[[0,.13,0,.137,.151],[f(.014),.012,.009,.157,.123],
          [f(.04),-.204,front?.056:-.107,.107,.098],[f(.049),-.391,front?.1:-.14,.063,.066]],16,2.32);
        volume(k,knee,'steel',[[0,.045,0,.077,.084],[f(.013),-.131,0,.079,.071],[f(.017),-.294,.022,.060,.063],
          [f(.016),-.408,.13,.102,.062],[f(.018),-.412,.207,.08,.042]],15,2.69);
      }
      legs.push({leg,knee,fetlock,front,side});
    }
    sweep(k,head,'steel',[[f(.103),.133,.025,.047],[f(.214),.219,-.081,.054],
      [f(.26),.319,-.133,.029],[f(.306),.414,-.203,.004]],13,8);
  }
  let t=k.bone(mount,0,.128,-.745);
  for(let i=0;i<5;i++){
    const r=.096-i*.013;
    sweep(k,t,i%2?'steel':'cobalt',[[0,.017,.014,r],[.033,-.018,-.154,r*.95],
      [.021,-.081,-.27,r*.63]],11,7);
    if(i>2)for(const side of flanks)vane(k,t,'ivory',[0,-.01,-.13],[side*.119,.029,-.27],
      [side*.16,-.06,-.42],.059,8+i);
    tail.push(t);t=k.bone(t,.021,-.081,-.257);
  }
  const weapon=k.bone(rig.limbs[1].wrist,0,-.07,.079);
  solidBlade(k,weapon,general?1.09:1.47,general?.187:.085,general?'sabre':'lance','steel','black');
  const emitters=flanks.map(side=>{
    const part=k.bone(mount,side*.60,-.04,side*.201);
    if(!general&&!tiger)for(let i=0;i<(mobile?3:5);i++)sweep(k,part,i%2?'steel':'glow',[
      [side*.018,-.35-i*.021,.235-i*.105,.041],[side*.153,-.11+i*.196,.147,.037],
      [side*.08,.14+i*.198,.021,.002],
    ],10,6);
    return part;
  });
  const armorPose=spectralHorse?qinMountArmor(k,mount,neck,muzzle,mobile):null;
  return sourcePose(entry,mount,head,pose=>{
    const {step,beat,wind,strike,travel}=pose;
    poseHumanoid(rig,pose,{swing:general?1.5:.82,spread:.22});
    body.rotation.x=-wind*.21+strike*.31;
    for(const {leg,knee,fetlock,side,front} of legs){
      const stride=Math.sin(step+side*PI*.5+Number(front)*2.75);
      leg.rotation.x=stride*(.15+travel*.53)-wind*.18+strike*.44*Number(front);
      knee.rotation.x=Math.max(0,stride)*(.18+travel*.51)+wind*.10;
      if(fetlock)fetlock.rotation.x=-knee.rotation.x*.67+Math.min(0,stride)*travel*.21;
    }
    for(const [i,link] of tail.entries()){
      link.rotation.y=Math.sin(beat*.71-i*.49)*(.12+travel*.22);
      link.rotation.x=Math.cos(beat*.61-i*.51)*.11+strike*.17;
    }
    neck.rotation.x=wind*.20-strike*.24+Math.sin(beat*.61)*.07;
    muzzle.rotation.x=-neck.rotation.x*.53;
    weapon.rotation.z=.39+wind*.79-strike*.91;
    weapon.rotation.x=general?-.29+wind*.63-strike*.64:-.62-wind*.26+strike*1.17;
    for(const [i,e] of emitters.entries())e.rotation.y=beat*.51+i*PI;
    armorPose?.(pose);
  },'gallop');
}

function ghostHydra(k,entry,mobile){
  const rig=humanoid(k,entry,{torso:[.235,.28,.31,.18],waist:.24,neck:.76,shell:'cobalt',
    skin:'ivory',skirt:'dusk',rear:'steel',dress:.85,robe:.79,height:.82,edge:'steel'});
  const {body,head}=rig;
  const cloud=k.bone(body,0,-.22,.01);
  for(let i=0;i<13;i++){
    const a=TAU*i/13;
    volume(k,cloud,i%3?'ivory':'steel',[[Math.cos(a)*.54,-.15,Math.sin(a)*.45,.135,.12],
      [Math.cos(a)*.64,-.04+(i%2)*.05,Math.sin(a)*.48,.203,.18],
      [Math.cos(a)*.61,.11+(i%3)*.031,Math.sin(a)*.53,.123,.109]],9,2.32,.24);
  }
  const coils=k.bone(body,0,.04,0);
  const first=[
    [-.019,-.06,-.78,.171,.133],[-.58,-.13,-.67,.184,.134],[-.86,-.11,-.21,.16,.15],
    [-.83,-.035,.51,.166,.163],[-.18,.089,.75,.185,.14],[.54,.27,.57,.17,.134],[.78,.39,.022,.146,.117],
    [.688,.51,-.50,.141,.123],[.235,.58,-.71,.136,.112],[-.40,.58,-.41,.128,.105],
  ];
  const rings=sculptRoyalCoil(k,coils,first,mobile);
  const neck=k.bone(coils,-.39,.54,-.36),wyrm=k.bone(neck,.16,1.03,.226);
  volume(k,neck,'cobalt',[[0,0,0,.14,.11],[-.24,.27,-.21,.172,.123],
    [-.23,.62,-.24,.152,.132],[.018,.90,.032,.139,.122],[.15,1.029,.235,.131,.105]],24,2.28,.20);
  const dragon=sculptRoyalWyrm(k,wyrm,mobile);
  for(const side of flanks){
    const f=x=>x*side;
    sweep(k,head,'black',[[f(.037),.182,.112,.018],[f(.132),.226,-.06,.033],
      [f(.13),.362,-.139,.021],[f(.081),.392,-.13,.004]],9,7);
  }
  return sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:.62,swing:1.0});
    coils.rotation.y=Math.sin(pose.headtime*1.7)*.13+pose.wind*.37-pose.strike*.26;
    cloud.rotation.y=-pose.headtime*.20;
    neck.rotation.z=Math.sin(pose.headtime*3.7)*.14+pose.wind*.26;
    wyrm.rotation.x=-pose.wind*.48+pose.strike*.55;
    poseRoyalCoil(rings,dragon,pose);
  },'hover');
}

function iceGeneral(k,entry,mobile){
  const rig=humanoid(k,entry,{torso:[.34,.41,.43,.25],waist:.31,neck:.91,skin:'ochre',shell:'cobalt',
    skirt:'dusk',edge:'brass',clad:true,replaceCrown:true});
  const {body,head}=rig,weapon=k.bone(rig.limbs[1].wrist,0,-.059,.081);
  const commander=xiangCommander(k,rig,weapon,mobile);
  const shades=[];
  for(let i=0;i<7;i++){
    const a=i*TAU/7;
    const ghost=k.bone(body,Math.sin(a)*.44,.636+Math.sin(i*6.2)*.13,Math.cos(a)*.31-.03);
    vane(k,ghost,'cobalt',[0,-.046,.015],[.062,.142,-.05],[.13,.228,-.183],.087,11+i);
    shades.push(ghost);
  }
  const model=sourcePose(entry,body,head,pose=>{
    const {wind,strike,headtime,travel}=pose;
    poseHumanoid(rig,pose,{gather:1.21,swing:1.36,spread:.31});
    weapon.rotation.set(-.33+wind*.41-strike*.87,.23+wind*.64,
      -.33+wind*1.1-strike*1.51);
    commander.pose(pose);
    for(const [i,shade] of shades.entries()){
      shade.rotation.z=Math.sin(headtime*3.2+i*.72)*.28+wind*.47;
      shade.rotation.x=travel*.31+strike*.53;
    }
  },'duel');
  return {...model,commanderGarments:commander.strips};
}

function iceScute(k,body,x,z,width,length,y,height,angle,row,mobile){
  const bounds=[[-.63,-.88],[.51,-1.06],[1,-.26],[.82,.75],[.07,1.04],[-.86,.67],[-1,-.28]];
  const sin=Math.sin(angle),cos=Math.cos(angle);
  const points=bounds.map(([a,b],i)=>[
    x+cos*a*width+sin*b*length,y+(i%3)*.018-.035,-.014+z+cos*b*length-sin*a*width,
  ]);
  plate(k,body,'black',points,.059,.022);
  const crest=[x+sin*.049,y+height,z-.026];
  const girdle=points.map(([x,y,z])=>[x+(crest[0]-x)*.22,y+height*.56,z+(crest[2]-z)*.22]);
  const position=[...crest],index=[],uv=[.5,.5],color=[1.03,1.04,1.08];
  for(const [loop,ring] of [girdle,points].entries())for(const [i,[x,y,z]] of ring.entries()){
    position.push(x,y+(loop===1?.018:0),z);
    uv.push(.5+.42*ring.length/7*bounds[i][0],.5+.40*bounds[i][1]);
    const shade=(loop===0?.89:.60)+(i%3)*.047+row*.018;
    color.push(shade*.94,shade,shade*1.03);
  }
  for(let i=0;i<points.length;i++){
    const next=(i+1)%points.length;
    index.push(0,1+next,1+i,1+i,1+next,8+i,1+next,8+next,8+i);
  }
  const shape=new T.BufferGeometry();
  shape.setAttribute('position',new T.Float32BufferAttribute(position,3));
  shape.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  shape.setAttribute('color',new T.Float32BufferAttribute(color,3));
  shape.setIndex(index);shape.computeVertexNormals();
  k.geometry(body,row%3===1?'shell':'cobalt',shape);
  const fracture=[girdle[4],crest,girdle[1],points[1]];
  sweep(k,body,row%2?'edge':'steel',fracture.map(([x,y,z],i)=>[x,y+.008,z,[.003,.020,.012,.003][i]]),mobile?7:10,6);
  if(row%2===0){
    const spike=[[crest[0],crest[1]-.019,crest[2],width*.36,.058],
      [crest[0]+sin*.048,crest[1]+height*.47,crest[2]-.091,width*.25,.045],
      [crest[0]+sin*.103,crest[1]+height*.83,crest[2]-.194,.003,.005]];
    volume(k,body,'steel',spike,mobile?8:12,2.8,.26);
  }
}

function iceTortoise(k,entry,mobile){
  const body=k.bone(k.root,0,.96,0),head=k.bone(body,0,-.06,.892);
  volume(k,body,'black',[[0,-.365,-.125,.508,.56],[0,-.225,-.045,.695,.81],
    [0,.007,-.016,.713,.818],[0,.219,-.064,.599,.675],[0,.35,-.09,.396,.465],
    [0,.415,-.11,.091,.088]],20,2.83,.13);
  const saddle=k.bone(body,0,-.27,-.007);
  saddle.rotation.x=PI/2;saddle.scale.y=1.13;
  rim(k,saddle,'ironRim',.680,.043);rim(k,saddle,'ochre',.624,.036,.031);
  for(let i=0;i<4;i++)iceScute(k,body,0,.56-i*.35,.215,.193,.275+Math.sin(.71+i*.75)*.105,
    .16,.03,i,mobile);
  for(const side of flanks)for(let i=0;i<4;i++){
    const z=.55-i*.322,x=side*(.509+Math.sin(i*1.02)*.095);
    iceScute(k,body,x,z,.146,.183,.032,.123,side*.35,i+1,mobile);
    iceScute(k,body,x*.58,z+.023,.204,.183,.193,.142,side*.43,i+2,mobile);
  }
  const neck=k.bone(body,0,-.208,.588);
  volume(k,neck,'moss',[[0,-.052,-.142,.187,.150],[0,.034,.035,.192,.169],[0,.111,.232,.153,.13],
    [0,.194,.369,.130,.088]],17,2.71,.20);
  neck.add(head);head.position.set(0,.188,.359);
  volume(k,head,'moss',[[0,.112,-.143,.143,.129],[0,.071,-.021,.234,.141],[0,.049,.137,.217,.108],
    [0,.023,.241,.166,.097],[0,-.008,.374,.115,.063],[0,-.048,.430,.051,.031]],mobile?17:23,2.85,.37);
  const jaw=k.bone(head,0,-.115,.016);
  volume(k,jaw,'black',[[0,.002,-.041,.144,.071],[0,-.036,.119,.182,.081],[0,-.044,.263,.126,.063],
    [0,.003,.387,.074,.030]],mobile?12:17,2.71,.25);
  sweep(k,head,'ivory',[[0,.138,.084,.046],[0,.109,.246,.044],[0,.046,.402,.038],
    [0,-.082,.442,.006]],mobile?10:16,8);
  const legs=[];
  for(const side of flanks){
    const f=x=>side*x;
    plate(k,head,'black',[[f(.072),.069,.237],[f(.132),.125,.211],[f(.208),.132,.103],
      [f(.198),.061,.078],[f(.142),.035,.156],[f(.091),.041,.228]],.035,.010);
    k.mesh(head,'gem','glow',f(.157),.077,.206,.049,.023,.019,0,f(.58));
    sweep(k,head,'ironRim',[[f(.067),.087,.254,.019],[f(.143),.138,.217,.033],
      [f(.243),.153,.038,.028],[f(.26),.102,-.093,.004]],13,7);
    plate(k,head,'steel',[[f(.044),-.011,.344],[f(.146),.009,.292],[f(.234),.053,.162],
      [f(.236),-.037,.068],[f(.177),-.112,.131],[f(.109),-.095,.282]],.049,.015);
    for(let i=0;i<3;i++)sweep(k,head,i%2?'steel':'ivory',[[f(.124+i*.031),.121,-.037-i*.042,.039],
      [f(.173+i*.035),.177+i*.06,-.072-i*.047,.043],[f(.231+i*.025),.214+i*.07,-.21-i*.023,.003]],11,7);
    for(let i=0;i<4;i++)sweep(k,jaw,'ivory',[[f(.105+i*.022),-.017,.306-i*.051,.018],
      [f(.115+i*.019),.016,.328-i*.056,.017],[f(.100+i*.018),.051-i*.004,.33-i*.055,.002]],7,6);
    for(const front of [false,true]){
      const leg=k.bone(body,side*.442,-.255,front?.45:-.463);
      const talon=k.bone(leg,side*.1,-.43,.11);
      volume(k,leg,'moss',[[0,.064,0,.145,.142],[f(.067),-.08,.047,.19,.144],[f(.094),-.29,.082,.149,.153],
        [f(.097),-.436,.116,.105,.112]],17,2.58,.27);
      for(let i=0;i<3;i++)plate(k,leg,i%2?'steel':'shell',[[f(.009),.007-i*.12,.13],[f(.123),.051-i*.12,.151],
        [f(.228),.008-i*.12,.105],[f(.210),-.125-i*.12,.139],[f(.079),-.125-i*.12,.175]],.031,.009);
      for(let i=0;i<3;i++)sweep(k,talon,'ivory',[[.064*(i-1),-.057,.053,.050],[.082*(i-1),-.123,.131,.046],
        [.093*(i-1),-.154,.228,.005]],10,7);
      legs.push({leg,talon,side,front});
    }
  }
  let hook=k.bone(body,0,-.104,-.710);
  const tail=[];
  for(let i=0;i<4;i++){
    const r=.101-i*.010,rise=.094+i*.019;
    sweep(k,hook,i%2?'shell':'steel',[[0,0,.047,r],[.019,rise*.39,-.087,r*.94],
      [.016,rise,-.204,r*.83]],11,7);
    plate(k,hook,'black',[[-r*.7,.052,.010],[r*.68,.056,.022],[r*.92,rise*.61,-.079],
      [r*.47,rise+.044,-.207],[-r*.50,rise+.054,-.192]],.034,.010);
    tail.push(hook);hook=k.bone(hook,.016,rise,-.189);
  }
  volume(k,hook,'black',[[0,-.085,0,.053,.06],[0,.001,0,.159,.154],
    [0,.107,.012,.140,.128],[0,.201,.005,.046,.05]],14,3.9,.24);
  for(let i=0;i<8;i++){
    const a=TAU*i/8;
    sweep(k,hook,'steel',[[Math.cos(a)*.098,.052,Math.sin(a)*.118,.056],
      [Math.cos(a)*.189,.096,Math.sin(a)*.184,.046],[Math.cos(a)*.254,.16,Math.sin(a)*.256,.003]],9,6);
  }
  return sourcePose(entry,body,head,({headtime,step,wind,strike,travel,stage})=>{
    neck.rotation.x=-wind*.31+strike*.48;
    head.rotation.x=wind*.24-strike*.36;
    jaw.rotation.x=wind*.14+strike*.64;
    for(const {leg,talon,side,front} of legs){
      const cycle=Math.sin(step+side*PI*.5+(front?.37:2.97));
      leg.rotation.x=cycle*travel*.42-wind*.16+strike*.16;
      talon.rotation.x=-leg.rotation.x*.62;
    }
    for(const [i,link] of tail.entries()){
      link.rotation.y=Math.sin(headtime*3.2+i*.47)*(.13+travel*.044)-wind*.29+strike*.43;
      link.rotation.x=wind*.18-i*.022-strike*.17-stage*.03;
    }
  },'crawl');
}

function bandedPoisonChest(k,body,mobile){
  for(let i=0;i<(mobile?5:8);i++){
    const t=i/(mobile?4:7),y=.112-t*.30,z=.398-t*.654,w=.18+Math.sin(t*PI)*.11;
    for(const side of flanks){
      const f=x=>side*x;
      const keel=[[f(.014),y-.139,z+.102],[f(w*.59),y-.106,z+.073],[f(w),y-.028,z+.034],
        [f(w*.95),y+.007,z-.073],[f(w*.559),y-.060,z-.126],[f(.014),y-.115,z-.092]];
      plate(k,body,i%3===2?'black':'ochre',keel,.041,.016);
      sweep(k,body,'moss',keel.slice(0,4).map(([x,y,z],n)=>[x,y-.017,z+.012,[.006,.020,.026,.003][n]]),9,6);
    }
  }
}

function regionalDragon(k,entry,mobile){
  const poison=entry.id==='m024';
  const body=k.bone(k.root,0,poison?1.33:.92,0),neck=k.bone(body,0,.08,.32);
  const head=k.bone(neck,0,.49,.662),jaw=k.bone(head,0,-.151,.13);
  const deep=poison?'moss':'clay',accent=poison?'ochre':'red';
  const abdomen=[[0,-.20,-.66,.169,.188],[0,-.118,-.395,.277,.239],[0,-.051,-.061,.348,.299],
    [0,.13,.339,.278,.243],[0,.193,.53,.169,.152]];
  const throat=[[0,-.019,-.013,.18,.16],[0,.12,.152,.197,.167],[0,.317,.456,.15,.14],[0,.489,.652,.131,.111]];
  volume(k,body,deep,abdomen,24,2.25,.15);
  volume(k,neck,deep,throat,21,2.25,.17);
  const scales={hide:poison?'moss':'clay',ridge:poison?'ochre':'brass',width:.064,length:.112,rows:mobile?5:7};
  hideScales(k,body,abdomen,.12,.91,mobile?7:9,scales);
  hideScales(k,neck,throat,.16,.88,mobile?5:7,{...scales,width:.053,length:.071,rows:4});
  const skull=poison?[[0,.129,-.294,.141,.110],[0,.101,-.113,.246,.188],[0,.031,.104,.244,.129],
    [0,-.013,.294,.190,.093],[0,-.051,.427,.151,.073],[0,-.088,.497,.095,.038]]:
    [[0,.048,-.236,.13,.096],[0,.042,-.086,.214,.167],[0,.01,.135,.199,.108],
      [0,-.044,.281,.15,.078],[0,-.078,.417,.109,.048]];
  volume(k,head,deep,skull,19,poison?2.37:2.8,.22);
  const lower=poison?[[0,-.016,-.152,.172,.063],[0,-.056,.033,.205,.078],[0,-.021,.251,.159,.054],
    [0,.007,.326,.102,.026]]:[[0,-.033,-.115,.132,.08],[0,-.041,.068,.149,.053],[0,-.013,.218,.119,.033]];
  volume(k,jaw,accent,lower,poison?16:12,2.42,.16);
  if(poison){
    bandedPoisonChest(k,body,mobile);
    k.materials.wingHide.color.setHex(0x898c99);
    k.materials.wingHide.roughness=.72;
  }
  const wings=[],feet=[];
  for(const side of flanks){
    const f=x=>side*x;
    sweep(k,head,'ivory',poison?[[f(.144),.128,-.083,.074],[f(.201),.234,-.154,.067],
      [f(.275),.378,-.232,.042],[f(.332),.471,-.412,.004]]:
      [[f(.135),.117,-.063,.053],[f(.219),.233,-.181,.047],
        [f(.271),.359,-.34,.035],[f(.306),.397,-.399,.004]],15,8);
    if(poison){
      plate(k,head,'black',[[f(.108),.065,.287],[f(.174),.104,.263],[f(.221),.122,.123],
        [f(.225),.056,.066],[f(.18),.024,.141],[f(.119),.015,.277]],.037,.011);
      sweep(k,head,'ochre',[[f(.105),.082,.299,.014],[f(.170),.129,.288,.036],
        [f(.230),.160,.158,.041],[f(.274),.133,.018,.006]],14,8);
      k.mesh(head,'gem','glow',f(.18),.071,.265,.043,.024,.025,0,f(.42),f(.08));
      for(let i=0;i<5;i++){
        const z=.422-i*.072,x=.096+i*.025;
        sweep(k,head,'ivory',[[f(x*.93),-.077,z,.026],[f(x),-.124,z+.015,.023],
          [f(x*1.04),-.188-i*.006,z+.025,.003]],9,6);
        sweep(k,head,'ochre',[[f(.21+i*.005),.025-i*.019,z-.20,.021],
          [f(.257+i*.01),-.021-i*.023,z-.268,.033],[f(.282+i*.023),-.043-i*.022,z-.39,.003]],9,6);
      }
    }else k.mesh(head,'gem','glow',f(.155),.044,.207,.035,.022,.019,0,f(.37));
    for(let i=0;i<5;i++){
      sweep(k,jaw,'ivory',[[f(.09),.007,.197-i*.056,.018],[f(.098),.057,.196-i*.057,.015],
        [f(.089),.082-i*.004,.186-i*.056,.002]],6,5);
      vane(k,head,i%3?accent:'ivory',[f(.133),.086,-.027-i*.019],
        [f(.215),.096+i*.057,-.133-i*.046],
        [f(.274+i*.019),.081+i*.087,-.256-i*.050],.066,36+i);
    }
    if(poison){
      const shoulder=k.bone(body,f(.242),.22,.108);
      const wing=k.bone(shoulder,f(.772),.625,-.144);
      volume(k,shoulder,'venomWingBone',[[0,0,0,.162,.102],[f(.191),.199,.067,.139,.080],
        [f(.389),.442,.027,.126,.084],[f(.593),.607,-.073,.109,.061],[f(.772),.626,-.142,.070,.056]],18,2.42,.19);
      sweep(k,shoulder,'venomWingGold',[[0,.054,.072,.061],[f(.176),.279,.11,.066],[f(.374),.472,.068,.057],
        [f(.596),.629,-.024,.048],[f(.771),.666,-.089,.028]],18,8);
      sweep(k,wing,'venomWingGold',[[f(-.047),.021,.019,.047],[f(.014),.208,-.039,.066],
        [f(.074),.294,-.074,.042],[f(.171),.274,-.15,.004]],13,7);
      const ribs=[
        [[0,.018,.015],[f(.31),.192,-.098],[f(.70),.19,-.218],[f(1.06),.06,-.309]],
        [[0,.012,.006],[f(.31),.069,-.112],[f(.738),-.099,-.341],[f(1.024),-.43,-.522]],
        [[0,.004,0],[f(.276),-.038,-.191],[f(.574),-.33,-.463],[f(.727),-.84,-.783]],
        [[0,-.01,-.018],[f(.094),-.171,-.218],[f(.267),-.454,-.466],[f(.241),-1.05,-.813]],
        [[0,-.019,-.022],[f(-.155),-.257,-.178],[f(-.277),-.49,-.329],[f(-.439),-.85,-.562]],
      ];
      const sail=wingTissue(k,wing,side,ribs,mobile);
      batSail(k,shoulder,side,[
        [[0,.030,.00],[f(.191),.22,.065],[f(.457),.493,.021],[f(.772),.625,-.144]],
        [[0,-.042,-.083],[f(.172),.113,-.21],[f(.315),.273,-.316],[f(.273),.221,-.580]],
        [[0,-.085,-.108],[f(.11),.024,-.267],[f(.17),.091,-.441],[f(.108),-.033,-.654]],
      ],'wingHide',mobile);
      for(let i=0;i<5;i++)sweep(k,shoulder,i%3?'moss':'ochre',[[f(.09+i*.104),.149+i*.087,.042,.029],
        [f(.17+i*.11),.243+i*.074,-.023,.038],[f(.26+i*.11),.342+i*.07,-.139,.004]],10,6);
      wings.push({shoulder,wing,sail,side});
    }else for(let i=0;i<8;i++)vane(k,body,i%3?'clay':'brass',[f(.14),.167,.374-i*.134],
      [f(.23),.48,.344-i*.143],[f(.29+i*.016),.599-i*.012,.236-i*.168],.079,45+i);
    for(let i=0;i<2;i++){
      const leg=k.bone(body,f(.27-i*.025),-.107,.198-i*.553);
      const paw=k.bone(leg,f(.043),-.278,.063);
      sweep(k,leg,deep,[[0,.082,-.024,.101],[f(.048),-.093,-.059,.104],[f(.041),-.285,.059,.061]],13,8);
      for(let j=-1;j<2;j++)sweep(k,paw,'ivory',[[f(.043*j),.038,0,.036],
        [f(.056*j),-.023,.105,.034],[f(.058*j),-.041,.171,.004]],8,6);
      feet.push({leg,paw,side,i});
    }
  }
  let tail=k.bone(body,0,-.113,-.639);
  const bones=[];
  for(let i=0;i<(mobile?7:9);i++){
    const a=i/((mobile?7:9)-1),r=poison?.145-.115*a:.165-.137*i/10;
    const d=poison?.274:.342;
    const rise=poison?-.066+.192*a:-.026,x=poison?.020+.027*a:.047;
    volume(k,tail,deep,[[0,.02,.035,r,r],[x*.47,rise*.52,-d*.43,r*.96,r*.89],[x,rise,-d,r*.84,r*.77]],12,2.22,.21);
    if(i%2===0||poison)sweep(k,tail,poison?'venomWingGold':accent,[[0,r*.82,-.025,r*.37],
      [x*.53,rise*.55+r*.9,-.13,r*.38],[x,rise+r*.62,-.27,r*.17]],9,6);
    bones.push(tail);tail=k.bone(tail,x,rise,-d+.024);
  }
  if(poison){
    tail.name='毒龍 · 矛尾';
    k.mesh(tail,'gem','venomWingGold',0,0,-.034,.086,.081,.115);
    for(let i=0;i<4;i++){
      const a=TAU*i/4+.15,x=Math.sin(a),y=Math.cos(a);
      sweep(k,tail,'venomWingBone',[[0,0,.025,.041],[x*.062,y*.058,-.057,.035],
        [x*.095,y*.089,-.14,.027],[x*.085,y*.087,-.241,.003]],11,7);
      sweep(k,tail,'venomWingGold',[[x*.021,y*.022,-.005,.017],[x*.077,y*.061,-.061,.017],
        [x*.103,y*.10,-.135,.014],[x*.084,y*.087,-.232,.002]],9,6);
    }
  }
  const model=sourcePose(entry,body,head,({headtime,beat,step,wind,strike,travel,stage})=>{
    body.rotation.x=-wind*.24+strike*.19;
    neck.rotation.z=Math.sin(headtime*2.1)*.12+wind*.14;
    head.rotation.x=-wind*.39+strike*.37;jaw.rotation.x=wind*.22+strike*.62;
    for(const {shoulder,wing,sail,side} of wings){
      shoulder.rotation.z=side*(.36+Math.sin(headtime*6.9)*(.26+travel*.24)+wind*.35-strike*.37);
      wing.rotation.y=side*(.08+Math.sin(headtime*6.9-.5)*.21+wind*.10);
      wing.rotation.z=side*(.05+Math.cos(headtime*6.9-.41)*.28+strike*.27);
      sail.pose(headtime,wind,strike,travel);
    }
    for(const [i,link] of bones.entries()){
      link.rotation.y=(poison?.047:.60)+Math.sin(headtime*2.9-i*.43)*(.17+travel*.138)-wind*.15+strike*.22;
      link.rotation.x=Math.sin(headtime*2.7-i*.46)*.11+stage*.091+(poison?.114+i*.013:0);
    }
    for(const {leg,paw,side,i} of feet){
      leg.rotation.x=Math.sin((poison?beat:step)+side*PI*.5+i*2.8)*(.09+travel*.42)+wind*.34;
      paw.rotation.x=wind*.39-strike*.41-leg.rotation.x*.49;
    }
  },poison?'wing':'coil');
  if(poison)model.disposeRig=()=>{for(const {sail} of wings)sail.dispose();};
  return model;
}

function foxThicket(k,body,white,mobile){
  const base=new T.Bone(),all=[base],tails=[];
  base.name=white?'九尾 · 骨架':'狐仙 · 骨架';
  body.add(base);
  const data={positions:[],uv:[],color:[],joints:[],weights:[],triangles:[]};
  const count=white?9:6,rows=mobile?13:19,sides=mobile?8:12;
  for(let i=0;i<count;i++){
    const spread=(i-(count-1)*.5)*(white?.305:.414),side=spread<0?-1:1;
    const outer=Math.abs(spread),rhythm=Math.sin(i*2.54),x=Math.sin(spread),arch=Math.cos(spread);
    const curl=white?.7:.96;
    const path=[
      [x*.218,.065+arch*.075,-.229-outer*.018],
      [x*.364,.211+arch*.07,-.386-(i%2)*.058],
      [x*(.98+curl*.25),.50+arch*.54+rhythm*.081,-.63-(i%3)*.115],
      [x*(1.268+curl*.31)+side*.08,.63+arch*.98+rhythm*.119,-.61-(i%3)*.175],
      [x*(1.577+curl*.26)+side*.135,.578+arch*1.192+rhythm*.127,-.22-(i%3)*.157],
    ];
    const profile=white?[.065,.128,.177,.117,.003]:[.055,.111,.177,.113,.004];
    const curve=new T.CatmullRomCurve3(path.map(p=>new T.Vector3(...p)),false,'catmullrom',.44);
    const frames=curve.computeFrenetFrames(rows,false);
    const centerAt=t=>curve.getPointAt(t);
    const first=all.length,links=[];
    for(let j=0;j<5;j++){
      const t=j/4,bone=new T.Bone();
      bone.name=`狐尾 ${i+1} · 骨 ${j+1}`;
      bone.position.copy(centerAt(t));
      if(j)bone.position.sub(centerAt((j-1)/4));
      (links.at(-1)??base).add(bone);all.push(bone);links.push(bone);
    }
    for(let row=0;row<=rows;row++){
      const t=row/rows,center=centerAt(t),group=Math.min(3,Math.floor(t*4)),mix=t*4-group;
      const spreadWeight=mix*mix*(3-2*mix);
      const width=T.MathUtils.lerp(profile[group],profile[group+1],spreadWeight)*(1+.10*rhythm);
      const arch=Math.sin(t*PI),trim=white?T.MathUtils.smoothstep(t,.55,.96):T.MathUtils.smoothstep(t,.65,.98);
      for(let j=0;j<=sides;j++){
        const u=j/sides,phi=TAU*u;
        const welt=(Math.cos(phi*3+t*6+rhythm)+.31*Math.sin(phi*7-t*5))*.11;
        const bundles=Math.max(0,Math.cos(phi*6-t*21+i*.43))**4;
        const fur=arch*(bundles*.025+Math.sin(phi*15+row*.92+i)*.008+Math.cos(phi*11-row*.46)*.023);
        const radius=Math.max(.002,width+fur)*(1+welt);
        const point=center.clone().addScaledVector(frames.normals[row],radius*Math.cos(phi))
          .addScaledVector(frames.binormals[row],radius*Math.sin(phi)*(white?.87:.95));
        data.positions.push(point.x,point.y,point.z);
        data.uv.push(u,t);
        const wrinkles=.72+.10*welt+.15*Math.sin(phi*.99)*arch+bundles*.10;
        data.color.push(wrinkles*(white?.92+trim*.095:1+trim*.20),
          wrinkles*(white?.95+trim*.072:.78+trim*.21),wrinkles*(white?1.04:.61+trim*.28));
        data.joints.push(first+group,first+group+1,0,0);
        data.weights.push(1-spreadWeight,spreadWeight,0,0);
        if(row&&j){
          const c=data.positions.length/3-1,a=c-sides-1;
          data.triangles.push(a-1,a,c-1,a,c,c-1);
        }
      }
    }
    for(let n=0;n<(mobile?6:9);n++){
      const yaw=n*TAU*.382+i*.63;
      const start=.28+(n%3)*.11,end=.84+(n%4)*.047;
      const ridgeSide=new T.Vector3(),ridgeAcross=new T.Vector3();
      const offset=data.positions.length/3;
      for(let rib=0;rib<=5;rib++){
        const progress=rib/5,t=start+progress*(end-start),r=Math.min(rows,Math.round(t*rows));
        const center=centerAt(t),group=Math.min(3,Math.floor(t*4)),mix=t*4-group;
        const weight=mix*mix*(3-2*mix);
        const width=T.MathUtils.lerp(profile[group],profile[group+1],weight);
        const phi=yaw+progress*.43;
        ridgeSide.copy(frames.normals[r]).multiplyScalar(Math.cos(phi)).addScaledVector(frames.binormals[r],Math.sin(phi));
        ridgeAcross.copy(frames.normals[r]).multiplyScalar(-Math.sin(phi)).addScaledVector(frames.binormals[r],Math.cos(phi));
        const arch=Math.sin(progress*PI)**.86;
        center.addScaledVector(ridgeSide,width*.93+.048*arch);
        for(const flank of flanks){
          const point=center.clone().addScaledVector(ridgeAcross,flank*(.003+arch*.037));
          data.positions.push(...point.toArray());data.uv.push(flank*.5+.5,t);
          const tint=.72+arch*.34;
          data.color.push(tint*(white?.94:1.11),tint*(white?.98:.87),tint*(white?1.07:.75));
          data.joints.push(first+group,first+group+1,0,0);
          data.weights.push(1-weight,weight,0,0);
        }
        if(rib){
          const b=offset+rib*2,a=b-2;
          data.triangles.push(a,a+1,b,a+1,b+1,b);
        }
      }
    }
    tails.push({links,spread});
    const clasp=path[0];
    const facet=[[clasp[0]-.058,clasp[1]+.052,clasp[2]+.039],[clasp[0]+.059,clasp[1]+.061,clasp[2]+.034],
      [clasp[0]+.077,clasp[1]+.021,clasp[2]-.036],[clasp[0]+.032,clasp[1]-.069,clasp[2]-.056],
      [clasp[0]-.055,clasp[1]-.064,clasp[2]-.030]];
    plate(k,body,white?'steel':'ochre',facet,.029,.009);
  }
  const {positions,uv,color,joints,weights,triangles}=data;
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  geo.setIndex(triangles);geo.computeVertexNormals();
  const oldFur=k.materials[white?'ivory':'skin'];
  const finish=oldFur.clone();
  finish.side=T.DoubleSide;
  finish.metalness=.018;
  finish.roughness=.87;
  finish.color.setHex(white?0xbcc1c3:0xc4a07a);
  finish.normalScale.multiplyScalar(.70);
  k.materials.foxFur=paintedFinish(finish,'hide',true,true);
  const mesh=new T.SkinnedMesh(geo,finish);
  mesh.name=white?'九尾 · 加權尾束':'狐仙 · 加權尾束';
  mesh.frustumCulled=false;
  body.add(mesh);
  body.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(all);
  mesh.bind(skeleton,mesh.matrixWorld);
  return {
    dispose(){skeleton.dispose();},
    pose({headtime,wind,strike,travel,stage}){
      for(const [i,{links,spread}] of tails.entries())for(const [j,link] of links.entries()){
        const t=j/4,lag=i*.67+j*.91,flow=headtime*(white?2.65:3.16)-lag;
        link.rotation.x=Math.sin(flow)*(.076+travel*.106)*t+(wind*.12-strike*.186)*(t+.28);
        link.rotation.y=Math.cos(flow-.38)*(.11+travel*.083)*t+spread*(wind*.095-strike*.073+stage*.032);
        link.rotation.z=Math.sin(flow+spread)*.049*t+spread*(strike*.064-wind*.045);
      }
    },
  };
}

function vixen(k,entry,mobile){
  const white=entry.id==='m034',colors=white?['ivory','lilac','brass']:['jade','teal','brass'];
  const [skirt,rear,edge]=colors;
  const rig=humanoid(k,entry,{torso:[.21,.27,.30,.19],waist:.25,neck:.84,shell:white?'lilac':'jade',
    skin:'ivory',skirt,rear,edge,robe:white?1.22:.73,dress:white?1.38:1.03,hair:white?'ivory':'black',collar:.27});
  const {body,head}=rig,tails=foxThicket(k,body,white,mobile);
  for(const side of flanks){
    const f=x=>side*x;
    plate(k,head,white?'steel':'brass',[[f(.045),.12,.104],[f(.167),.21,.042],
      [f(.28),.429,-.015],[f(.267),.24,-.101],[f(.121),.131,-.095]],.046,.010);
    plate(k,head,white?'lilac':'ochre',[[f(.13),.156,.059],[f(.24),.338,.003],[f(.242),.244,.029],
      [f(.172),.143,.052]],.023,.008);
    for(let i=0;i<3;i++)vane(k,head,white?'ivory':'black',[f(.093),.046,-.019],
      [f(.191),-.104-i*.058,-.133],[f(.205+i*.043),-.28-i*.16,-.229],.064,21+i);
  }
  const fans=k.bone(rig.limbs[1].wrist,0,-.04,.113);
  spiralFans(k,fans);
  const seal=hiddenHalo(k,body,-.243,.033,white?.62:.54,white?'brass':'steel',9,PI/2);
  const wisps=[];
  if(!white)for(let i=0;i<4;i++){
    const wisp=k.bone(body,0,0,0);
    k.mesh(wisp,'gem','cobalt',0,0,0,.112,.119,.11);
    rim(k,wisp,'steel',.132,.016);rim(k,wisp,'jade',.149,.010,-.012);
    for(let j=0;j<6;j++){
      const a=j*TAU/6;
      sweep(k,wisp,'glow',[[Math.sin(a)*.148,Math.cos(a)*.148,.027,.010],
        [Math.sin(a+.24)*.193,Math.cos(a+.24)*.193,-.026,.011],
        [Math.sin(a+.31)*.221,Math.cos(a+.31)*.19,-.047,.002]],7,6);
    }
    wisps.push(wisp);
  }
  const model=sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:1.03,swing:white?1.27:.83,spread:.32});
    fans.rotation.z=pose.beat*.25-pose.wind*.79+pose.strike*.92;
    tails.pose(pose);
    seal.base.rotation.z=-pose.headtime*.83;
    for(const [i,wisp] of wisps.entries()){
      const a=pose.headtime*(1.16+pose.wind*.32)+i*TAU/4;
      wisp.position.set(Math.sin(a)*(.74+pose.strike*.21),.33+Math.cos(a*1.7)*.54,Math.cos(a)*.65);
      wisp.rotation.set(a*.90,a*.43,-a*.88);
    }
  },'hover');
  model.disposeRig=tails.dispose;
  return model;
}

function shadowBat(k,entry,mobile){
  const body=k.bone(k.root,0,1.57,-.019),head=k.bone(body,0,.337,.225),jaw=k.bone(head,0,-.155,.075);
  volume(k,body,'clay',[[0,-.39,-.26,.15,.16],[0,-.124,-.12,.31,.268],[0,.169,-.041,.435,.31],
    [0,.357,.061,.353,.24],[0,.403,.179,.207,.133]],22,2.21,.27,true);
  volume(k,head,'black',[[0,-.104,-.11,.20,.151],[0,-.004,-.058,.25,.215],[0,.129,-.073,.234,.164],
    [0,.215,-.115,.188,.124],[0,.274,-.147,.123,.079]],19,2.43,.29);
  volume(k,jaw,'clay',[[0,-.134,-.03,.12,.09],[0,-.068,.048,.17,.106],
    [0,-.03,.163,.138,.066],[0,.023,.192,.109,.041]],12,2.32,.21);
  const brood=broodOfShadows(k,body,mobile);
  const wings=[],feet=[];
  for(const side of flanks){
    const f=x=>side*x;
    plate(k,head,'black',[[f(.016),.108,.171],[f(.111),.113,.207],[f(.212),.09,.147],
      [f(.184),-.008,.153],[f(.080),-.024,.195]],.023,.009);
    sweep(k,head,'brass',[[f(.025),.115,.202,.022],[f(.111),.153,.203,.047],
      [f(.192),.133,.166,.036],[f(.265),.092,.094,.005]],10,8);
    for(let i=0;i<(mobile?3:5);i++){
      const y=.30-i*.119,z=-.26-i*.014;
      const ridge=[[f(.015),y+.045,z+.012],[f(.17+i*.012),y+.057,z-.029],
        [f(.333-i*.021),y-.056,z-.063],[f(.22),y-.161,z-.039],[f(.06),y-.101,z-.073]];
      plate(k,body,i%2?'black':'clay',ridge,.051,.016);
      sweep(k,body,i%2?'red':'brass',ridge.slice(1,4).map(([x,Y,Z])=>[x,Y,Z-.034,.020]),9,6);
      if(i<3)k.mesh(body,'gem','glow',f(.113+i*.018),y-.039,z-.091,.028,.046,.024,0,0,f(-.31));
    }
    sweep(k,head,'red',[[f(.131),.076,.031,.077],[f(.22),.302,-.06,.087],
      [f(.287),.484,-.166,.040],[f(.276),.546,-.206,.004]],14,8);
    k.mesh(head,'gem','glow',f(.144),.047,.169,.048,.022,.027,0,f(.37),f(.22));
    for(let i=0;i<4;i++)sweep(k,jaw,'ivory',[[f(.049+i*.022),.018,.163-i*.033,.022],
      [f(.062+i*.022),.067,.155-i*.03,.020],[f(.058+i*.022),.108,.144-i*.03,.003]],7,6);
    const wing=k.bone(body,f(.348),.139,-.113);
    const wrist=k.bone(wing,f(.642),.41,-.011);
    sweep(k,wing,'clay',[[0,0,0,.13],[f(.269),.141,.06,.161],[f(.485),.323,.039,.11],
      [f(.652),.415,-.007,.072]],15,9);
    const ribs=[
      [[0,.036,-.04],[f(.31),.227,-.023],[f(.63),.365,-.124],[f(.858),.47,-.302]],
      [[0,.036,-.04],[f(.287),.151,-.138],[f(.50),.176,-.293],[f(.727),.073,-.597]],
      [[0,.032,-.04],[f(.245),.05,-.223],[f(.425),-.023,-.424],[f(.465),-.252,-.809]],
      [[0,.03,-.04],[f(.123),-.046,-.221],[f(.196),-.209,-.417],[f(.231),-.459,-.749]],
      [[0,.018,-.041],[f(-.081),-.044,-.203],[f(-.27),-.111,-.324],[f(-.46),-.332,-.541]],
    ];
    batSail(k,wrist,side,ribs,'wingBlood',mobile);
    for(const [i,row] of ribs.entries())sweep(k,wrist,i%2?'clay':'black',
      row.map((point,index)=>[...point,[.044,.041,.026,.004][index]]),12,7);
    for(const [i,row] of ribs.entries()){
      const [a,b,c,d]=row;
      sweep(k,wrist,i%2?'black':'red',[[a[0],a[1],a[2]-.042,.032],
        [b[0]*.91,b[1]-.038,b[2]-.063,.034],[c[0]*1.05,c[1]-.056,c[2]-.030,.018],
        [d[0],d[1]+.018,d[2]-.006,.004]],mobile?10:15,7);
    }
    const extension=[
      [[0,-.027,-.03],[f(.19),.099,-.08],[f(.44),.271,-.083],[f(.642),.412,-.011]],
      [[0,-.037,-.035],[f(.13),-.006,-.146],[f(.32),.043,-.298],[f(.465),-.159,-.562]],
      [[0,-.044,-.046],[f(.057),-.084,-.147],[f(.099),-.167,-.257],[f(.125),-.326,-.379]],
    ];
    batSail(k,wing,side,extension,'wingBlood',mobile);
    sweep(k,wrist,'ivory',[[0,.038,-.025,.030],[f(.092),.092,.076,.038],[f(.191),.107,.10,.026],
      [f(.258),.022,.081,.004]],12,7);
    wings.push({wing,wrist,side});
    const leg=k.bone(body,f(.181),-.295,-.171);
    sweep(k,leg,'black',[[0,.067,-.029,.091],[f(.06),-.168,.044,.097],
      [f(.07),-.405,.098,.065]],13,8);
    for(let i=0;i<3;i++)sweep(k,leg,'ivory',[[f(.035*i),-.361,.091,.031],
      [f(.039*i),-.445,.181,.032],[f(.042*i),-.487,.211,.003]],8,6);
    feet.push(leg);
  }
  return sourcePose(entry,body,head,pose=>{
    const {headtime,wind,strike,travel,stage}=pose;
    brood(pose);
    for(const {wing,wrist,side} of wings){
      const pulse=Math.sin(headtime*(6.7+stage*.61));
      wing.rotation.z=side*(.43+pulse*(.41+travel*.36)+wind*.51-strike*.66);
      wing.rotation.y=side*(-.19+wind*.38+strike*.37);
      wrist.rotation.z=side*(Math.sin(headtime*6.7-.65)*.35+wind*.56);
    }
    for(const [i,leg] of feet.entries())leg.rotation.x=wind*.63-strike*.61+Math.sin(headtime*2.7+i*PI)*.17;
    jaw.rotation.x=wind*.17+strike*.68;
  },'wing');
}

const realmFigures={
  m039:{torso:[.31,.34,.40,.21],colors:['ochre','red','cobalt','brass'],hair:'sunCrown',length:1.03,gear:'bow',pace:[.72,.46,.68]},
  m040:{torso:[.26,.34,.34,.23],colors:['ochre','jade','cobalt','ivory'],hair:'clothHood',length:.88,gear:'lute',pace:[.52,.43,.73]},
  m041:{torso:[.28,.33,.36,.22],colors:['jade','ochre','black','brass'],hair:'lionMane',length:.92,gear:'glaive',pace:[1.02,1.32,.76]},
  m056:{torso:[.21,.30,.33,.19],colors:['jade','lilac','black','ivory'],hair:'tornCrown',length:1.39,gear:'thorns',pace:[.67,1.06,1.1]},
};

function instrument(k,j,mobile){
  const bowl=k.bone(j,0,-.155,.041);
  bowl.name='乾達婆 · 鳴潮琵琶';
  volume(k,bowl,'gandharvaLacquer',[[0,-.45,.014,.055,.045],[0,-.37,.01,.176,.103],
    [0,-.235,-.009,.25,.128],[0,-.093,-.012,.235,.123],[0,.037,-.006,.162,.085],
    [0,.18,.005,.094,.058],[0,.25,.032,.057,.035]],mobile?18:24,2.09,.06);
  const outline=[[0,-.44,.077],[.13,-.402,.084],[.222,-.288,.098],[.244,-.199,.101],
    [.215,-.078,.103],[.149,.052,.09],[.091,.169,.076],[.05,.247,.066]];
  const face=[...outline,...outline.slice(1).reverse().map(([x,y,z])=>[-x,y,z])];
  plate(k,bowl,'gandharvaWood',face,.031,.013);
  plate(k,bowl,'gandharvaLacquer',[[-.065,-.313,.132],[.063,-.313,.132],[.095,-.268,.13],
    [.056,-.239,.13],[-.065,-.24,.13],[-.094,-.278,.128]],.022,.011);
  const rosette=k.bone(bowl,0,-.133,.133);
  k.mesh(rosette,'round','black',0,0,0,.066,.077,.012);
  rim(k,rosette,'oldGold',.074,.008,.009);
  for(const side of flanks){
    const f=x=>side*x;
    sweep(k,bowl,'oldGold',outline.map(([x,y,z],i)=>[f(x),y,z+.029,i===7?.006:.009]),mobile?17:23,7);
    sweep(k,bowl,'gandharvaWood',[[f(.028),-.408,-.053,.008],[f(.130),-.318,-.106,.010],
      [f(.168),-.217,-.118,.010],[f(.146),-.094,-.112,.009],[f(.074),.048,-.080,.005]],14,6);
    sweep(k,bowl,'jade',[[f(.206),-.215,.126,.004],[f(.167),-.263,.131,.012],
      [f(.125),-.218,.132,.010],[f(.140),-.163,.131,.004]],12,7);
  }
  sweep(k,bowl,'gandharvaLacquer',[[0,.17,.051,.053],[0,.38,.064,.061],[0,.63,.032,.059],
    [.024,.816,-.005,.061],[.068,.856,-.012,.017]],16,8);
  for(let i=0;i<8;i++){
    const y=.087+i*.063,w=.077-i*.003;
    sweep(k,bowl,i%2?'ivory':'oldGold',[[-w,y,.118],[0,y+.004,.136],[w,y,.118]],6,5);
  }
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.021,y=.629+i*.055,side=i%2===0?-1:1;
    sweep(k,bowl,i===1?'glow':'ivory',[[x,-.273,.153,.003],[x*.8,.18,.149,.0028],[x*.57,y,.101,.0025]],13,5);
    k.rod(bowl,'oldGold',[0,y,.011],[side*.091,y-.019,.018],.019);
    k.mesh(bowl,'gem','jade',side*.086,y-.020,.018,.034,.026,.022);
  }
  markEnemyWeapon(bowl,[0,.84,.034],{from:[0,-.32,.092],aim:false,width:.21,kind:'focus'});
  return bowl;
}

function arcBow(k,j){
  const joints=[];
  for(const side of flanks){
    const draw=k.bone(j,0,0,0);
    sweep(k,draw,'brass',[[0,0,0,.048],[.133,side*.221,-.022,.043],
      [.224,side*.56,-.099,.048],[.141,side*.744,-.123,.033],
      [-.019,side*.872,-.127,.005]],17,8);
    sweep(k,draw,'ivory',[[.139,side*.30,.013,.022],[.226,side*.57,-.056,.024],
      [.159,side*.699,-.091,.019],[.035,side*.775,-.128,.002]],11,6);
    sweep(k,draw,'glow',[[0,0,0,.008],[-.01,side*.537,-.10,.006],[-.024,side*.86,-.127,.005]],10,5);
    joints.push(draw);
  }
  return joints;
}

function gandharvaHood(k,head,mobile){
  volume(k,head,'gandharvaHood',[[0,.081,-.126,.13,.096],[0,.161,-.09,.164,.143],
    [0,.228,-.078,.161,.150],[0,.296,-.089,.132,.135],[0,.349,-.156,.064,.072],
    [0,.364,-.196,.009,.026]],mobile?14:19,2.27,.18,true);
  for(const side of flanks){
    const f=x=>side*x;
    const fold=k.bone(head,0,0,0);
    fold.name='乾達婆 · 包頭後褶';
    const crown=[[f(.008),.118,.158],[f(.067),.159,.139],[f(.118),.223,.103],[f(.119),.289,.027],
      [f(.082),.311,-.052],[f(.041),.258,-.012],[f(.009),.202,.082]];
    plate(k,head,'brass',crown,.032,.012);
    plate(k,head,'jade',crown.map(([x,y,z])=>[x*.91,y+.008,z+.025]),.018,.008);
    sweep(k,head,'oldGold',[[f(.014),.126,.185,.011],[f(.067),.172,.168,.024],
      [f(.118),.224,.130,.023],[f(.121),.283,.052,.016],[f(.082),.314,-.04,.004]],16,7);
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?3:5),y=.24-t*.107;
      const back=[[f(.109),y,.062-t*.026,.016],[f(.153),y+.028,-.031,.025],[f(.159),y+.043,-.119,.030],
        [f(.119),y+.031,-.204,.028],[f(.041),y+.014,-.257,.009]];
      sweep(k,fold,i%3?'gandharvaHood':'jade',back,12,7);
      sweep(k,fold,'oldGold',back.map(([x,y,z,r])=>[x+f(.011),y+.017,z-.012,r*.38]),11,6);
    }
    for(let i=0;i<(mobile?6:8);i++){
      const t=i/(mobile?5:7),ripple=Math.sin(i*2.15);
      const root=[f(.031+t*.102),.197-t*.032,-.186-t*.053];
      const arch=[f(.083+t*.081),.048-t*.019,-.259-ripple*.021];
      const tip=[f(.075+t*.115),-.128-t*.075,-.262+(t-.5)*.08];
      k.geometry(head,i%3?'black':'gandharvaHood',featherVane(root,arch,tip,.043+t*.012,48+i,mobile?8:13));
      sweep(k,head,i%3?'black':'gandharvaHood',[[...root,.013],[...arch,.027],[...tip,.004]],mobile?9:13,6);
    }
    const knot=k.bone(head,f(.083),-.062,-.252);
    for(let i=0;i<3;i++)sweep(k,knot,'oldGold',[[0,.048-i*.035,-.017,.010],
      [f(.029),.049-i*.035,-.031,.011],[f(.046),.036-i*.035,.001,.009]],8,6);
  }
  k.mesh(head,'gem','jade',0,.190,.179,.048,.064,.038);
  k.mesh(head,'gem','glow',0,.199,.209,.020,.028,.012);
}

function courtFigure(k,entry,mobile){
  const info=realmFigures[entry.id],[shell,skirt,rear,edge]=info.colors;
  const gandharva=entry.id==='m040';
  const white=['hornMask','tornCrown'].includes(info.hair);
  const rig=humanoid(k,entry,{torso:info.torso,waist:info.torso[0]+.01,neck:.87,shell,skirt,rear,edge,
    robe:gandharva?0:info.length*.92,dress:gandharva?0:info.length,hair:white?'ivory':'black',
    collar:gandharva?0:.29,mobile,...(gandharva?{cut:'skin'}:{})});
  const {body,head}=rig;
  if(gandharva)gandharvaHood(k,head,mobile);
  const portraitPose=courtPortrait(k,rig,entry.id,mobile);
  const crown=k.bone(head,0,.17,-.059),effects=[],off=k.bone(rig.limbs[0].wrist,-.032,-.044,.079),
    hand=k.bone(rig.limbs[1].wrist,.022,-.05,.07);
  for(const side of flanks){
    const f=x=>side*x;
    switch(portraitPose?null:info.hair){
      case 'circlet':
      case 'sunCrown':{
        for(let j=0;j<4;j++)sweep(k,crown,'brass',[[f(.028+j*.029),.045,.064,.030],
          [f(.083+j*.036),.192,.018,.030],[f(.11+j*.046),.204+j*.07,-.128,.004]],12,7);
        const jewel=k.bone(crown,f(.132),.15,-.036);rim(k,jewel,'brass',.082,.018,.038);
        k.mesh(jewel,'gem','glow',0,0,.063,.043,.06,.023);
        break;
      }
      case 'twinBuns':{
        volume(k,crown,'cobalt',[[f(.208),.016,-.005,.086,.095],[f(.227),.096,-.014,.11,.099],
          [f(.234),.165,-.042,.073,.065],[f(.23),.207,-.032,.038,.046]],14,2.46,.31,true);
        sweep(k,crown,'brass',[[f(.138),.112,.056,.016],[f(.245),.146,.068,.023],[f(.327),.115,.033,.004]],9,6);
        for(let i=0;i<3;i++)vane(k,crown,'cobalt',[f(.224),.047,-.02],[f(.309+i*.033),-.24,-.134],
          [f(.39+i*.087),-.62-i*.04,-.304],.082,i+12);
        break;
      }
      case 'hornMask':
      case 'tornCrown':{
        for(let i=0;i<5;i++)vane(k,crown,i%2?'ivory':'steel',[f(.045+i*.029),.038,-.018],
          [f(.263+i*.025),-.109-i*.061,-.153],[f(.333+i*.043),-.278-i*.072,-.317],.081,52+i);
        sweep(k,head,info.hair==='hornMask'?'red':'jade',[[f(.128),.025,.102,.055],
          [f(.211),.146,.022,.059],[f(.219),.239,-.037,.041],[f(.171),.294,-.105,.003]],12,7);
        break;
      }
      case 'lionMane':
        for(let i=0;i<7;i++)vane(k,head,white?'ivory':i%2?'black':'ochre',[f(.064+i*.016),.18,-.028],
          [f(.225+i*.012),.118-i*.07,-.098],[f(.24+i*.021),-.17-i*.082,-.27],.09,41+i);
        for(let i=0;i<4;i++)sweep(k,head,white?'ivory':'black',[[f(.038+i*.035),-.055,.117,.036],
          [f(.077+i*.03),-.17,.176,.036],[f(.139+i*.034),-.32-i*.037,.133,.008]],10,7);
        break;
      case 'clothHood':break;
    }
    for(let i=0;i<5;i++){
      const trim=k.bone(body,0,.559-i*.097,-info.torso[3]-.015);
      sweep(k,trim,i%2?edge:rear,[[f(.054),.009,-.015,.020],
        [f(.166),.004,-.033,.024],[f(.239),-.037,-.041,.004]],8,6);
    }
  }
  let effect=null,lute;
  switch(info.gear){
    case 'courtBlade': {
      solidBlade(k,hand,1.39,.071,'sabre');
      effect=hiddenHalo(k,body,.67,-.34,.74,'brass',13,.07);
      break;
    }
    case 'floralBasket':{
      const basket=k.bone(hand,0,.21,.12);
      volume(k,basket,'ochre',[[0,-.181,-.049,.123,.1],[0,-.074,-.043,.18,.139],
        [0,.089,-.023,.221,.177],[0,.129,.014,.189,.17]],18,2.6,.19);
      for(let i=0;i<9;i++){
        const a=i*TAU/9,x=Math.sin(a),z=Math.cos(a);
        const bud=k.bone(basket,x*.193,.20+Math.sin(i*3.71)*.09,z*.15);
        sweep(k,basket,'jade',[[x*.061,-.13,z*.047,.026],[x*.149,.059,z*.087,.021],
          [x*.196,.26,z*.15,.015]],11,6);
        for(let p=0;p<5;p++)vane(k,bud,p%2?'lilac':'ivory',[0,.014,0],
          [Math.sin(p*TAU/5)*.092,.055,Math.cos(p*TAU/5)*.082],
          [Math.sin(p*TAU/5)*.17,.061,Math.cos(p*TAU/5)*.12],.044,i*5+p);
        effects.push(bud);
      }
      break;
    }
    case 'splitSabre':
      solidBlade(k,hand,1.29,.13,'sabre','steel');
      solidBlade(k,off,.74,.092,'sabre','cobalt');
      break;
    case 'bow':
      effects.push(...arcBow(k,hand));
      if(entry.id==='m039'){
        const drift=k.bone(body,0,-.943,0);
        for(let i=0;i<(mobile?5:7);i++){
          const a=TAU*i/(mobile?5:7),curve=[];
          for(let j=0;j<5;j++){
            const t=j/4,angle=a+t*.92,r=.50-.11*t+Math.sin(a*2.2)*.038;
            curve.push([Math.sin(angle)*r,-.081+.128*t+Math.sin(angle*3)*.043,Math.cos(angle)*r,
              [.02,.082,.098,.057,.003][j],[.018,.058,.071,.034,.003][j]]);
          }
          volume(k,drift,i%3?'steel':'teal',curve,mobile?9:15,2.18,.19);
        }
        effects.push(drift);
      }
      break;
    case 'lute':
      lute=instrument(k,hand,mobile);
      effect=hiddenHalo(k,body,-.37,.016,.43,'steel',8,PI/2);
      break;
    case 'glaive':
      solidBlade(k,hand,1.31,.154,'lance','steel');
      break;
    case 'thorns':
      for(const side of flanks)for(let i=0;i<4;i++){
        const arm=k.bone(body,side*(.113+i*.05),.514-i*.13,-.229);
        sweep(k,arm,'black',[[0,.03,.006,.036],[side*(.153+i*.02),.085,-.072,.062],
          [side*(.325+i*.07),.193-i*.087,-.32,.047],[side*(.482+i*.055),.338-i*.142,-.411,.004]],16,7);
        k.mesh(arm,'gem',i%3?'jade':'glow',side*(.267+i*.06),.122-i*.051,-.236,.061,.079,.059);
        effects.push(arm);
      }
      ritualPole(k,hand,.76,auspiciousPoleB,'jade');
      break;
  }
  const model=sourcePose(entry,body,head,pose=>{
    const [gather,swing,rate]=info.pace;
    const {beat,wind,strike,headtime}=pose;
    poseHumanoid(rig,pose,{gather,swing,spread:.19});
    portraitPose?.(pose);
    hand.rotation.z=.41+wind*.69-strike*.94;
    hand.rotation.x=-.17+wind*.45-strike*.74;
    off.rotation.x=.13-pose.wind*.42+pose.strike*.55;
    if(lute){
      const plucking=rig.limbs[0],carrying=rig.limbs[1];
      carrying.shoulder.rotation.x=-.57-wind*.52+strike*.29;
      carrying.shoulder.rotation.z=.21+wind*.24;
      carrying.elbow.rotation.x=-.48-wind*.21-strike*.23;
      hand.rotation.set(.18+wind*.22-strike*.19,-.11,-.15);
      lute.rotation.set(.86+Math.sin(beat*.64)*.07-wind*.23+strike*.31,.06+wind*.19,.42-wind*.37+strike*.35);
      plucking.shoulder.rotation.x=-.61-wind*.47+strike*.17;
      plucking.shoulder.rotation.z=-.081-wind*.25+strike*.11;
      plucking.elbow.rotation.x=-.67-wind*.19+strike*.23;
      plucking.elbow.rotation.y=.31+wind*.28+strike*.17;
      plucking.wrist.rotation.z=wind*.28-strike*.54;
    }
    if(effect){
      effect.base.rotation.z=headtime*rate;
      effect.base.scale.setScalar(.87+wind*.17+strike*.29);
    }
    for(const [i,joint] of effects.entries()){
      joint.rotation.x=Math.sin(beat*.83+i*.55)*.071+wind*.24-strike*.21;
      joint.rotation.z=Math.cos(headtime*(2.8+rate)+i*.49)*.105+strike*.29;
    }
  },['courtBlade','bow','lute','thorns'].includes(info.gear)?'hover':'duel');
  if(gandharva)model.clothLimbs=rig.limbs;
  return model;
}

function windCavalry(k,entry,mobile){
  const mount=buildBayuSteed(k,mobile);
  const rig=humanoid(k,entry,{torso:[.204,.278,.328,.187],waist:.217,neck:.79,shell:'bayuShadow',
    skirt:'bayuRed',rear:'bayuShadow',clad:true,replaceCrown:true,mobile});
  rig.body.position.set(.014,.24,.022);
  mount.seat.add(rig.body);
  const rider=fitBayuRider(k,rig,mobile);
  const parts=sourcePose(entry,mount.body,rig.head,pose=>{
    poseHumanoid(rig,{...pose,travel:pose.travel*.33},{gather:.75,swing:.86,spread:.15});
    mount.pose(pose);
    rider.pose(pose);
  },'gallop');
  return {...parts,moonSourceRig:true,grounded:true,commanderGarments:rider.silks,polishEnergy:{
    tint:0xcfb176,shape:'ribbons',anchor:mount.body,offset:[0,.19,-.26],span:[.69,.42,.59],
  }};
}

function moonDuelist(k,entry,mobile){
  const archer=entry.id==='m039',musician=entry.id==='m040';
  const shape=musician?{torso:[.241,.304,.31,.184],waist:.219,neck:.839,height:1.14,skin:'gandharvaSkin',
    shell:'gandharvaSkin',cut:'skin',replaceCrown:true}:
    {...moonShapes[entry.id],headSurface:(kit,head,phone)=>moonPortrait(kit,head,phone,archer)};
  const rig=humanoid(k,entry,{...shape,mobile});
  const fitting=musician?null:fitMoonFighter(k,rig,mobile,archer);
  const sitar=musician?fitMoonSitar(k,rig,mobile):null;
  const {body,head}=rig;
  const model=sourcePose(entry,body,head,pose=>{
    poseHumanoid(rig,pose,{gather:archer?.68:musician?.58:.91,swing:archer?.68:musician?.45:1.08});
    fitting?.pose(pose);
    sitar?.(pose);
    if(musician)for(const {leg,knee,side} of rig.limbs){
      leg.rotation.set(-.53-pose.wind*.073+pose.strike*.15,side*-.31,side*(.50+pose.wind*.14));
      knee.rotation.set(.84-pose.strike*.15,side*.11,-side*.24);
    }
  },archer||musician?'hover':'duel');
  return {...model,moonSourceRig:true,grounded:!archer&&!musician,commanderGarments:fitting?.silks,
    clothLimbs:musician?rig.limbs:undefined,polishEnergy:{
      tint:archer?0x85c6ef:musician?0x7bdfe6:0xb8ca83,shape:archer?'sigils':'ribbons',anchor:body,
      offset:archer?[0,.40,-.31]:[0,.36,-.32],span:archer?[.68,.57,.31]:[.59,.52,.37],
    }};
}

const rancourRelics={
  m035:{metal:'clay',arch:'ochre',guard:'axe',orbit:5,span:.603,tempo:1.36},
  m036:{metal:'cobalt',arch:'steel',guard:'sabre',orbit:6,span:.623,tempo:1.08},
  m037:{metal:'moss',arch:'jade',guard:'lance',orbit:4,span:.652,tempo:1.65},
  m038:{metal:'brass',arch:'ochre',guard:'sabre',orbit:7,span:.672,tempo:1.82},
};
function rancour(k,entry,mobile){
  const a=rancourRelics[entry.id];
  const rig=humanoid(k,entry,{...rancourShapes[entry.id],clad:true});
  const {body,head}=rig;
  const dress=rancourGeometry(k,rig,entry.id,mobile);
  const weapon=k.bone(rig.limbs[1].wrist,.04,-.03,.07);
  solidBlade(k,weapon,a.guard==='axe'?.98:1.27,a.guard==='axe'?.217:.115,a.guard,a.metal,'black');
  const eye=k.bone(rig.limbs[0].wrist,-.048,-.17,.093);
  dress.focus(eye);
  for(const side of flanks){
    const f=x=>side*x;
    for(let i=0;i<3;i++){
      const claw=k.bone(eye,f(.081),i*.109-.091,.014);
      sweep(k,claw,a.metal,[[0,.006,.023,.034],[f(.086),.093,-.017,.034],
        [f(.114),.165,-.073,.024],[f(.096),.221,-.129,.004]],11,6);
    }
  }
  const arc=k.bone(body,0,.694,-.327),runes=[];
  for(let i=0;i<a.orbit;i++){
    const angle=TAU*i/a.orbit,rune=k.bone(arc,Math.sin(angle)*a.span,Math.cos(angle)*a.span,.023);
    rune.rotation.z=-angle;
    k.mesh(rune,'gem','glow',0,0,.035,.077,.077,.055);
    rim(k,rune,a.arch,.103,.016);rim(k,rune,a.metal,.127,.011,-.023);
    for(let n=0;n<3;n++){
      const theta=n*TAU/3;
      sweep(k,rune,a.arch,[[Math.sin(theta)*.103,Math.cos(theta)*.11,.01,.022],
        [Math.sin(theta+.31)*.158,Math.cos(theta+.31)*.158,.027,.021],
        [Math.sin(theta+.49)*.19,Math.cos(theta+.49)*.19,.004,.002]],7,6);
    }
    runes.push({rune,angle});
  }
  const pose=sourcePose(entry,body,head,pose=>{
    const {headtime,wind,strike,beat}=pose;
    poseHumanoid(rig,pose,{gather:a.tempo*.69,swing:a.tempo*.81});
    arc.rotation.z=headtime*a.tempo+wind*.4-strike*.6;
    for(const {rune,angle} of runes)rune.rotation.y=Math.sin(headtime*2.4+angle)*.37+wind*.41;
    weapon.rotation.set(-.29+wind*.34-strike*.87,.1,.28+wind*.39-strike*1.34);
    eye.rotation.z=Math.sin(beat*.71)*.19-wind*.31;
    eye.scale.setScalar(.91+wind*.28+strike*.32);
    dress.pose(pose);
  },'duel');
  return {...pose,rancourGarments:dress.garments};
}

const titans={
  m043:{mask:'brass',armour:'black',ridge:'lilac',type:'hammer',rings:3,finish:'lightning',size:1},
  m044:{mask:'brass',armour:'cobalt',ridge:'lilac',type:'guard',rings:4,finish:'ice',size:1},
  m045:{mask:'brass',armour:'moss',ridge:'lilac',type:'claws',rings:3,finish:'wind',size:1},
  m046:{mask:'brass',armour:'clay',ridge:'lilac',type:'blades',rings:4,finish:'fire',size:1},
  m047:{mask:'ochre',armour:'black',ridge:'brass',type:'hammer',rings:4,finish:'lightning',size:1.19},
  m048:{mask:'steel',armour:'cobalt',ridge:'steel',type:'guard',rings:5,finish:'ice',size:1.16},
  m049:{mask:'jade',armour:'moss',ridge:'jade',type:'claws',rings:4,finish:'wind',size:1.15},
  m050:{mask:'clay',armour:'clay',ridge:'clay',type:'blades',rings:5,finish:'fire',size:1.22},
};

const titanHorns={
  m043:[[.072,-.035,.141,.06],[.169,.058,.076,.082],[.211,.202,-.011,.067],
    [.174,.288,-.067,.056],[.093,.306,-.122,.036],[.023,.339,-.165,.006]],
  m044:[[.071,-.047,.12,.069],[.125,.12,.059,.077],[.16,.263,-.105,.061],
    [.213,.41,-.225,.027],[.266,.448,-.348,.005]],
  m045:[[.071,-.068,.15,.053],[.149,.087,.051,.063],[.26,.19,-.075,.05],
    [.36,.198,-.221,.038],[.434,.092,-.384,.004]],
  m046:[[.06,-.050,.145,.071],[.142,.078,.083,.063],[.197,.263,.001,.054],
    [.163,.45,-.133,.042],[.216,.56,-.202,.004]],
  m047:[[.073,-.053,.135,.064],[.195,.073,.072,.085],[.297,.185,-.049,.084],
    [.279,.335,-.071,.062],[.185,.426,-.089,.038],[.075,.454,-.091,.004]],
  m048:[[.062,-.067,.151,.051],[.166,.061,.037,.066],[.246,.173,-.105,.06],
    [.217,.366,-.138,.040],[.266,.562,-.303,.004]],
  m049:[[.059,-.059,.156,.048],[.147,.061,.068,.070],[.228,.197,-.059,.057],
    [.308,.371,-.161,.05],[.411,.391,-.359,.005]],
  m050:[[.072,-.044,.134,.061],[.166,.081,.093,.081],[.249,.26,-.024,.063],
    [.276,.416,-.193,.052],[.197,.583,-.277,.003]],
};

function altarTitan(k,entry,mobile){
  const a=titans[entry.id],levitates=a.size>1;
  const rig=gorgeRig(k,entry,mobile,a);
  const {body,head}=rig;
  const [style,finish,brow,fit]=faceProfiles[entry.id];
  const {jaw}=carvedFace(k,head,{style,finish,brow,width:.47*fit,dark:'lining',fang:'ivory'});
  rig.jaw=jaw;
  demonicMempo(k,head,courtMasks[entry.id]);
  volume(k,head,'black',[[0,-.083,-.103,.192,.091],[0,.042,-.129,.245,.123],
    [0,.171,-.086,.201,.132],[0,.271,-.058,.149,.103]],mobile?12:16,2.51,.15);
  for(const {side} of rig.limbs){
    const f=x=>side*x;
    const helm=k.bone(head,0,.039,0);
    plate(k,helm,a.mask,[[f(.126),.073,.096],[f(.195),.171,-.014],[f(.23),.119,-.119],
      [f(.204),-.07,-.158],[f(.186),-.176,-.075],[f(.149),-.167,.013],[f(.132),-.041,.082]],.045,.015);
    for(let i=0;i<2;i++){
      const g=k.bone(helm,0,i*.066-.14,-.102);
      plate(k,g,i%2?a.mask:'black',[[f(.03),.011,-.13],[f(.143),.03,-.126],[f(.211),.036,-.073],
        [f(.212),-.04,-.046],[f(.135),-.065,-.137],[f(.03),-.069,-.148]],.04,.011);
    }
    const crest=k.bone(head,0,.189,-.020);
    const sections=titanHorns[entry.id].map(([x,y,z,r])=>[f(x),y,z,r,r*.78]);
    volume(k,crest,a.mask,sections,mobile?13:19,a.finish==='ice'?3:2.14,.28);
    sweep(k,crest,a.ridge,sections.slice(1).map(([x,y,z,r])=>[x+f(.033),y,z+.04,r*.41]),14,6);
    if(a.finish==='wind'||levitates){
      const [x,y,z,r]=sections.at(-3);
      sweep(k,crest,a.ridge,[[x-f(.077),y-.074,z+.012,r*.70],[x+f(.029),y+.032,z-.041,r*.58],
        [x+f(.141),y+.126,z-.052,r*.44],[x+f(.211),y+.185,z-.149,.005]],mobile?8:13,7);
    }
  }
  const platform=k.bone(body,0,-.471,-.046),mist=[];
  if(levitates){
    const limit=mobile?7:11;
    for(let i=0;i<limit;i++){
      const angle=TAU*i/limit,r=.50+(i%2)*.09;
      const glyph=k.bone(platform,Math.sin(angle)*r,-.21+Math.sin(i*3.2)*.08,Math.cos(angle)*r);
      glyph.rotation.y=angle;
      sweep(k,glyph,i%2?'steel':a.ridge,[[-.095,.127,-.023,.071],[.035,.071,.057,.103],
        [.151,-.009,.083,.082],[.29,-.043,.031,.006]],mobile?9:13,7);
      mist.push(glyph);
    }
  }
  return {...sourcePose(entry,body,head,pose=>{
    const {headtime,wind,strike}=pose;
    poseHumanoid(rig,pose,{gather:levitates?.8:1.17,swing:a.type==='blades'?1.51:.89,spread:.23});
    rig.poseForge(pose);
    head.rotation.z=Math.sin(headtime*2)*.073+wind*.115-strike*.21;
    platform.rotation.y=headtime*.46+wind*.73;
    for(const [i,joint] of mist.entries())joint.rotation.x=Math.sin(headtime*1.6+i*.77)*.21;
  },levitates?'hover':'slam'),gorgeArmour:true};
}

function ancientKnowledge(k,entry,mobile){
  const body=k.bone(k.root,0,1.11,.03),neck=k.bone(body,0,.21,.612);
  const head=k.bone(neck,-.041,.67,.501),jaw=k.bone(head,0,-.159,.17);
  const haunch=[[0,-.097,-.617,.163,.145],[0,.016,-.406,.294,.221],[0,.042,-.057,.341,.316],
    [0,.094,.354,.299,.239],[0,.207,.66,.186,.144]];
  const column=[[0,-.071,-.089,.176,.146],[-.042,.134,.129,.213,.177],
    [-.074,.348,.307,.172,.149],[-.068,.567,.462,.154,.137],[-.045,.672,.498,.139,.115]];
  volume(k,body,'jade',haunch,23,2.20,.25);
  volume(k,neck,'jade',column,22,2.29,.23);
  hideScales(k,body,haunch,.09,.94,mobile?6:8,{hide:'jade',ridge:'steel',rows:mobile?5:7,width:.066,length:.117});
  hideScales(k,neck,column,.07,.94,mobile?6:7,{hide:'teal',ridge:'ivory',rows:4,width:.052,length:.083});
  volume(k,head,'jade',[[0,.084,-.27,.18,.138],[0,.057,-.075,.242,.174],[0,.011,.181,.175,.137],
    [0,-.035,.375,.13,.071],[0,-.053,.482,.113,.052]],21,2.41,.25);
  volume(k,jaw,'ivory',[[0,-.044,-.049,.165,.055],[0,-.066,.121,.156,.069],[0,-.052,.31,.089,.039]],15,2.25,.21);
  const moustaches=[],legs=[],tails=[],crownTines=[],lamella=[];
  for(const side of flanks){
    const f=x=>side*x;
    const out=points=>points.map(([x,...rest])=>[f(x),...rest]);
    const whisker=k.bone(head,f(.158),-.066,.356);
    sweep(k,whisker,'ivory',[[0,0,0,.029],[f(.185),.095,.232,.026],
      [f(.35),.268,.220,.023],[f(.502),.434,.106,.005],[f(.697),.568,-.053,.001]],19,6);
    moustaches.push(whisker);
    k.mesh(head,'gem','glow',f(.16),.019,.232,.044,.024,.024,0,f(.43));
    sweep(k,head,'teal',[[f(.057),.075,.362,.048],[f(.177),.104,.251,.055],
      [f(.239),.14,.12,.056],[f(.275),.149,-.123,.022],[f(.312),.05,-.241,.005]],14,8);
    plate(k,head,'jade',[[f(.07),-.108,.412],[f(.162),-.069,.326],[f(.222),-.062,.184],
      [f(.229),.004,.014],[f(.176),-.12,.047],[f(.092),-.18,.336]],.033,.012);
    sweep(k,head,'steel',out([[.026,.103,.393,.024],[.122,.121,.319,.048],[.198,.140,.216,.053],
      [.231,.129,.096,.040],[.263,.082,-.051,.005]]),15,8);
    sweep(k,jaw,'ivory',out([[.052,-.067,.245,.036],[.096,-.094,.306,.045],[.122,-.073,.421,.028],
      [.102,-.006,.487,.014],[.071,.028,.501,.004]]),15,7);
    for(let i=0;i<4;i++){
      const y=.114-i*.067,z=-.004-i*.047;
      const gill=k.bone(head,f(.161+i*.021),y,z);
      const branch=out([[.002,-.008,.044,.043],[.088,.058,-.018,.070,.045],
        [.178,.082,-.145,.057,.026],[.241,.012,-.249,.038,.018],[.272,-.091,-.337,.005,.004]]);
      volume(k,gill,i%2?'jade':'teal',branch,mobile?12:17,2.22,.24);
      sweep(k,gill,i%3?'steel':'ivory',branch.map(([x,y,z,r])=>[x+f(.016),y+.024,z+.013,r*.28]),12,6);
      lamella.push({gill,side,i});
    }
    for(let i=0;i<6;i++){
      sweep(k,head,i%2?'clay':'brass',[[f(.082+i*.028),.121,-.036-i*.024,.047],
        [f(.158+i*.045),.194+i*.041,-.108-i*.051,.044],
        [f(.233+i*.044),.342+i*.041,-.274-i*.054,.024],
        [f(.261+i*.055),.341+i*.052,-.364-i*.06,.003]],12,7);
      for(const p of [body,neck])vane(k,p,i%2?'jade':'moss',[f(.083+i*.007),.259,.36-i*.14],
        [f(.17),.371,.213-i*.13],[f(.21),.463,.127-i*.14],.062,3+i*2);
    }
    for(let i=0;i<7;i++){
      const p=i/6,y=.095+i*.067,z=.226+i*.052,w=.137-p*.026;
      const under=out([[.002,y+.057,z+.044],[w*.53,y+.050,z+.024],[w,y+.080,z-.003],
        [w*1.18,y-.018,z-.011],[w*.69,y-.046,z+.070],[.002,y-.039,z+.089]]);
      plate(k,neck,i%3?'ivory':'steel',under,.054,.023);
      sweep(k,neck,'teal',under.slice(2).map(([x,h,z])=>[x,h-.022,z+.025,.013]),13,6);
    }
    const crown=k.bone(head,f(.092),.185,-.116);
    crown.name='知識的古龍 · 祭枝冠';
    const branch=out([[.011,.008,.022,.068],[.082,.176,-.004,.080],[.159,.389,-.085,.073],
      [.232,.569,-.194,.057],[.349,.708,-.270,.032],[.461,.811,-.246,.006]]);
    sweep(k,crown,'clay',branch,18,9);
    sweep(k,crown,'brass',branch.map(([x,y,z,r])=>[x+f(.028),y+.013,z+.019,r*.31]),16,7);
    sweep(k,crown,'clay',out([[.142,.346,-.075,.055],[.267,.392,-.128,.055],
      [.393,.494,-.116,.028],[.472,.609,-.185,.005]]),15,8);
    crownTines.push({crown,side});
    for(const front of [false,true]){
      const leg=k.bone(body,f(.287),-.061,front?.379:-.342);
      const knee=k.bone(leg,f(.081),-.337,front?.026:-.094);
      volume(k,leg,front?'jade':'steel',[[0,.089,0,.139,.129],[f(.048),-.037,.013,.164,.149],
        [f(.089),-.216,-.05,.128,.127],[f(.085),-.341,front?.018:-.098,.081,.079]],16,2.18,.18);
      volume(k,knee,'ivory',[[0,.042,.009,.082,.084],[f(.035),-.121,.046,.093,.082],
        [f(.059),-.321,.122,.066,.073],[f(.044),-.384,.164,.087,.056]],15,2.33,.23);
      for(let row=0;row<4;row++){
        const y=.021-row*.097,z=.063+row*.034;
        plate(k,knee,row%2?'steel':'teal',out([[-.064,y+.028,z+.026],[.081,y+.056,z+.032],
          [.136,y+.019,z-.029],[.108,y-.06,z+.023],[.034,y-.080,z+.077],[-.043,y-.05,z+.051]]),.029,.012);
        sweep(k,knee,'jade',out([[.007,y+.044,z+.060,.012],[.055,y+.045,z+.067,.017],[.101,y+.011,z+.029,.006]]),8,5);
      }
      for(let p=-1;p<2;p++)sweep(k,knee,'ivory',[[f(.032+p*.046),-.345,.12,.032],
        [f(.044+p*.054),-.40,.217,.029],[f(.04+p*.052),-.406,.304,.003]],8,6);
      legs.push({leg,knee,front,side});
    }
  }
  let tail=k.bone(body,0,.083,-.613);
  for(let i=0;i<(mobile?7:9);i++){
    const r=.141-i*.013;
    sweep(k,tail,'jade',[[0,0,.037,r],[.016,.051,-.131,r*.94],[.023,.073,-.253,r*.91]],12,8);
    sweep(k,tail,'steel',[[0,r*.51,-.035,r*.62],[.011,r+.06,-.106,r*.52],
      [.023,r+.112,-.197,.003]],9,7);
    tails.push(tail);tail=k.bone(tail,.023,.073,-.234);
  }
  const model=sourcePose(entry,body,head,({headtime,wind,strike,travel,step,stage})=>{
    neck.rotation.y=Math.sin(headtime*2.4)*.21+wind*.36-strike*.43;
    head.rotation.x=-wind*.34+strike*.49;
    jaw.rotation.x=wind*.23+strike*.66;
    for(const [i,w] of moustaches.entries())w.rotation.y=Math.sin(headtime*3.3+i*PI)*.22-wind*.37+strike*.28;
    for(const {gill,side,i} of lamella)gill.rotation.y=side*(Math.sin(headtime*1.7-i*.6)*.10+wind*.12+strike*.25);
    for(const {crown,side} of crownTines)crown.rotation.z=side*(Math.sin(headtime*2.2)*.035+wind*.088-strike*.073);
    for(const {leg,knee,front,side} of legs){
      const t=Math.sin(step+side*PI*.5+Number(front)*2.7);
      leg.rotation.x=t*(.11+travel*.46)+wind*.21-strike*.16;
      knee.rotation.x=Math.max(0,t)*travel*.54+wind*.14-strike*.09;
    }
    for(const [i,t] of tails.entries())t.rotation.y=Math.sin(headtime*3.8-i*.43)*(.18+travel*.17)+stage*.08;
  },'wing');
  model.ancientBanners=crownTines;
  model.inspectionHead=head;
  return model;
}

const catalogue={m003:ironOni,m004:qinRider,m006:bandit,m007:regionalDragon,m009:carveSpringShade,m010:constellation,m011:constellation,
  m012:constellation,m013:sculptThunderPriestess,m018:firstEmperor,m019:ghostHydra,m020:iceGeneral,m022:forgeWhiteTortoise,m023:carveTowerButcher,m024:regionalDragon,
  m028:vixen,m029:forgeIronCrutch,m030:shadowBat,m031:carveDynastyTrio,m032:carveDynastyTrio,m033:carveDynastyTrio,m034:vixen,
  m035:rancour,m036:rancour,m037:rancour,m038:rancour,m039:moonDuelist,m040:moonDuelist,m041:moonDuelist,m042:windCavalry,
  m043:altarTitan,m044:altarTitan,m045:altarTitan,m046:altarTitan,m047:altarTitan,m048:altarTitan,m049:altarTitan,m050:altarTitan,
  m051:forgeWootai,m052:forgeIceExperiment,m053:sculptBurialBeast,m054:sculptBurialBeast,m055:ancientKnowledge,
  m056:courtFigure,m057:sculptBurialBeast,m058:sculptBurialBeast,m059:carveXuanElder};
export const finishesA=Object.fromEntries(Object.keys(catalogue).map(id=>[id,metals]));
for(const [id,finishes] of Object.entries(dynastyFinishes))finishesA[id]={...metals,...finishes};
finishesA.m023={...metals,...butcherFinishes};
finishesA.m006={...metals,banditVest:[0x5e856f,.12,.74,'cloth'],banditLinen:[0xa8a6a6,.04,.82,'cloth'],
  banditWrap:[0x4e4139,.12,.79,'cloth']};
finishesA.m009={...metals,...springShadeFinishes};
finishesA.m013={...metals,...thunderPriestessFinishes};
finishesA.m010={...metals,...fateTempleFinishes};
finishesA.m012=finishesA.m010;
finishesA.m052={...metals,...iceExperimentFinishes};
finishesA.m042={...metals,...bayuFinishes};
for(const [id,finishes] of Object.entries(moonFinishes))finishesA[id]={...metals,...finishes};
finishesA.m051={...metals,...wootaiFinishes};
finishesA.m059={...metals,...xuanFinishes};
finishesA.m029={...metals,...crutchFinishes};
finishesA.m011={...metals,...commanderFinishes};
finishesA.m020=finishesA.m011;
finishesA.m018={...metals,...qinFireFinishes};
finishesA.m022={...metals,...whiteTortoiseFinishes};
finishesA.m024={...metals,venomWingBone:[0x666657,.21,.60,'bone'],venomWingGold:[0xa08645,.43,.58,'bronze']};
finishesA.m003={...metals,...oniFinishes};
finishesA.m040={...metals,gandharvaSkin:[0xa98571,.04,.71,'hide'],gandharvaLip:[0x744648,.035,.77,'hide'],
  gandharvaEye:[0x809289,.02,.31,'gem'],gandharvaHood:[0x34434b,.08,.83,'cloth'],oldGold:[0xb08c4d,.64,.49,'bronze'],
  gandharvaLacquer:[0x352931,.13,.67,'hide'],gandharvaWood:[0x876247,.19,.67,'hide'],
  gandharvaHair:[0x57382d,.05,.83,'hide'],gandharvaScarf:[0xc1b497,.07,.82,'cloth']};
export function sculptA(k,entry,mobile){
  return catalogue[entry.id]?.(k,entry,mobile)??null;
}
