import {qiongFaceFinishes,qiongqiMask,qiongqiFoot,hornetRefitFinishes,sculptKingHornet} from './late-beast-refits.mjs?v=anatomy-1';
import {sculptYetiJaw,sculptYetiFinger,carveYetiRuff,iceFur,fineYetiTuft,yetiAnatomyFinishes} from './ancient-yeti-anatomy.mjs?v=glacial-fur-2';
import {bossSkin} from './boss-skin.mjs?v=boss-foundry-1';
import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=forgeburst-1';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {carvedFace,demonicMempo,openHelm} from './catalogue-a-face.mjs?v=maskwork-1';
import {legacyCDetail,legacyCFinishes} from './catalogue-c-legacy.mjs?v=boss-foundry-1';
import {relicFinishes,relicTailoring} from './relic-tailoring.mjs?v=relic-1';
import {durgaFinishes,forgeDurga} from './durga-relic-sculpt.mjs?v=durga-1';
import {sculptAsuraDisciple} from './late-disciple-kirin.mjs?v=primal-1';
import {carveAbbotVotive} from './votive-tailoring.mjs?v=votive-1';

import {carveThatchedWraith,thatchedWraithFinishes} from './thatched-wraith.mjs?v=boss-foundry-1';

const PI=Math.PI,TAU=PI*2;
const sides=[-1,1];
const shape=(k,part,finish,sections,rings=13,sides=10,section=2.15,ridge=.16,seed=0)=>
  k.geometry(part,finish,sculptVolume(sections,{rings,sides,section,ridge,seed}));
const swept=(k,part,finish,points,steps=13,sides=8,ridge=.24)=>
  k.sculpt.sweep(part,finish,points,{steps,sides,ridge});
const plate=(k,part,finish,points,thick=.05,bevel=.016)=>k.sculpt.plate(part,finish,points,thick,bevel);
const vector=point=>new T.Vector3(...point);

function ventralScale(k,joint,span,row,evil,mobile){
  const width=span*(evil?.90:.84);
  const length=.054+Math.sin((row+1)*.72)*.007;
  const rows=mobile?8:12,cols=mobile?8:12,layer=(rows+1)*(cols+1);
  const xyz=[],uv=[],color=[],index=[];
  for(let face=0;face<2;face++)for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
    const t=r/rows,s=c/cols*2-1;
    const wrap=Math.sqrt(1-s*s*.91),dip=(1-t)*(.012+wrap*.027);
    const scallop=Math.sin(s*9+row*.69)*t**5*.004;
    const x=s*width*(.86+Math.sin(t*Math.PI)*.18),y=t*length*2-length-dip+scallop;
    const groove=Math.sin(s*45+t*10+row)*.010*t*wrap;
    const z=wrap*(.021+.028*Math.sin(t*Math.PI))+.023+groove+Math.abs(s)*.015+(face?-.009:.009);
    const seal=(.5+.5*Math.cos(s*(evil?14:17)+(row%3)*.2+t*6))**9;
    const tint=.70+wrap*.19+seal*.15-(face?.19:0)-t**8*.064;
    xyz.push(x,y,z);uv.push(c/cols,t);
    color.push(tint*(evil?.87:1.05),tint*(evil?1.02:.99),tint*(evil?.86:1.03));
    if(r&&c){
      const d=face*layer+r*(cols+1)+c,b=d-cols-1,a=b-1;
      if(face)index.push(a,d-1,b,b,d-1,d);
      else index.push(a,b,d-1,b,d,d-1);
    }
  }
  const sealEdge=(a,b)=>index.push(a,b,a+layer,a+layer,b,b+layer);
  for(let i=0;i<cols;i++){
    sealEdge(i+1,i);
    sealEdge(rows*(cols+1)+i,rows*(cols+1)+i+1);
  }
  for(let i=0;i<rows;i++){
    sealEdge(i*(cols+1),(i+1)*(cols+1));
    sealEdge((i+1)*(cols+1)+cols,i*(cols+1)+cols);
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(xyz,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geo.setIndex(index);geo.computeVertexNormals();
  k.geometry(joint,'snakeBelly',geo);
}

function snake(k,entry,mobile){
  const evil=entry.id==='m002';
  const body=k.bone(k.root,0,.12,0);
  const spine=k.bone(body,0,.14,0);
  const head=k.bone(spine,0,1.43,.47);
  const jaw=k.bone(head,0,-.15,.13);
  const base=evil?[
    [0,0,0,.21,.23],[-.13,.21,.36,.23,.25],[-.15,.48,.61,.26,.27],[-.075,.81,.57,.23,.25],
    [.07,1.08,.40,.186,.20],[0,1.38,.41,.155,.18],
  ]:[
    [0,0,0,.123,.157],[-.12,.12,.275,.15,.166],[-.14,.36,.485,.14,.16],[.051,.60,.54,.126,.148],
    [.12,.85,.343,.115,.146],[.103,1.10,.312,.107,.132],[0,1.43,.41,.106,.13],
  ];
  shape(k,spine,'body',base,28,15,2.07,.16,3);
  const neckCurve=new T.CatmullRomCurve3(base.map(([x,y,z])=>vector([x,y,z])));
  const neckRows=mobile?7:10,neckSpan=evil?.117:.082;
  for(let row=0;row<neckRows;row++){
    const v=(row+.63)/neckRows,p=neckCurve.getPointAt(v),t=neckCurve.getTangentAt(v);
    for(const side of sides)for(let col=0;col<3;col++){
      const a=(col+.47+(row%2)*.24)*PI*.188;
      const section=evil?(.222-.061*v):(.146-.032*v);
      const normal=new T.Vector3(Math.sin(a)*side,t.z*Math.cos(a),-t.y*Math.cos(a)).normalize();
      const top=p.clone().addScaledVector(normal,section*.94);
      const patch=k.bone(spine,top.x,top.y,top.z);
      patch.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(
        new T.Vector3().crossVectors(t,normal).normalize(),t,normal));
      const width=neckSpan*(.66+.4*Math.cos(a));
      plate(k,patch,(row+col)%4===0?'trim':'rind',[[0,.094,.005],[width*.61,.045,-.003],
        [width*.58,-.024,.016],[0,-.073,.037],[-width*.55,-.025,.008],[-width*.53,.039,-.001]],.021,.008);
      if(col===0)swept(k,patch,'edge',[[0,.062,.024,.010],[.005,.016,.03,.009],[0,-.051,.049,.003]],7,5);
    }
  }
  const fronts=evil?15:17;
  for(let i=0;i<fronts;i++){
    const t=(i+.27)/fronts;
    const p=neckCurve.getPointAt(t);
    const tangent=neckCurve.getTangentAt(t);
    const forward=new T.Vector3(0,-tangent.z,tangent.y).normalize();
    const section=evil?(.218-.058*t):(.155-.037*t);
    const face=k.bone(spine,p.x+forward.x*section,p.y+forward.y*section,p.z+forward.z*section);
    face.rotation.x=Math.atan2(-forward.y,forward.z);
    ventralScale(k,face,section,i,evil,mobile);
    for(const side of sides)if(i%2===0) swept(k,face,'rind',[
      [side*section*.78,-.06,-.084,.036],[side*section*1.14,0,-.112,.029],[side*section*1.19,.079,-.165,.003],
    ],6,5,.22);
  }
  const sectionCount=evil?5:6,segments=[];
  const tailLength=evil?3.24:3.66;
  const track=[
    [0,.13,.07],[evil?-.53:-.43,.079,-.64],[evil?-.22:.28,.12,-1.44],
    [evil?.48:-.23,.19,-2.28],[evil?-.35:.31,.25,-2.91],[.04,.31,-tailLength],
  ];
  const tailCurve=new T.CatmullRomCurve3(track.map(vector));
  for(let segment=0;segment<sectionCount;segment++){
    const pos=tailCurve.getPointAt(segment/sectionCount);
    const bone=k.bone(body,pos.x,pos.y,pos.z);
    segments.push(bone);
    const coils=[];
    for(let j=0;j<5;j++){
      const t=Math.min(1,(segment+j/4)/sectionCount+.007);
      const p=tailCurve.getPointAt(t).sub(pos);
      const radius=(evil?.188:.119)*(1-t**2.32)+.013;
      coils.push([p.x,p.y,p.z,radius,radius*.76]);
    }
    shape(k,bone,'body',coils,17,13,2.15,.18,segment);
    for(let i=0;i<6;i++){
      const t=(segment+(i+.37)/6)/sectionCount;
      const p=tailCurve.getPointAt(t).sub(pos);
      const radius=(evil?.183:.109)*(1-t**2.34)+.008;
      const forward=tailCurve.getTangentAt(t);
      const yaw=Math.atan2(-forward.x,-forward.z);
      const keel=k.bone(bone,p.x,p.y+radius*.67,p.z);
      keel.rotation.y=yaw;
      swept(k,keel,'rind',[[0,0,.055,radius*.47],[0,radius*.23,-.01,radius*.58],[0,radius*.89,-.13,radius*.08]],6,6,.20);
      for(const side of sides){
        plate(k,keel,i%3===0?'trim':'rind',[
          [side*radius*.29,.014,.076],[side*radius*.88,-.021,.034],[side*radius*.91,-.039,-.10],
          [side*radius*.46,.014,-.088],[side*radius*.29,.023,-.006],
        ],.018,.006);
      }
    }
  }
  const tip=segments.at(-1);
  const tipOffset=tailCurve.getPointAt(1).sub(tailCurve.getPointAt((sectionCount-1)/sectionCount));
  for(let i=-2;i<=2;i++)swept(k,tip,'rind',[
    [tipOffset.x,tipOffset.y,tipOffset.z+.20,.034],[tipOffset.x+i*.075,tipOffset.y+.091,tipOffset.z-.096,.029],
    [tipOffset.x+i*.128,tipOffset.y+.231+Math.abs(i)*.035,tipOffset.z-.29+Math.abs(i)*.045,.003],
  ],8,6);
  const headScale=evil?1.19:.96;
  for(const side of sides){
    const f=x=>side*x*headScale;
    const cheek=evil?'trim':'rind';
    shape(k,head,'body',[
      [f(.047),-.085,-.20,.125,.11],[f(.068),-.042,-.108,.156,.128],[f(.069),-.065,.04,.151,.136],
      [f(.056),-.09,.18,.108,.077],[f(.04),-.142,.31,.061,.030],
    ],15,12,2.7,.17);
    plate(k,head,cheek,[[f(.01),.05,.32],[f(.231),.060,.139],[f(.281),.14,-.13],
      [f(.138),.10,-.188],[f(.082),.12,.034]],.044,.014);
    swept(k,head,'deep',[[f(.088),.015,.194,.041],[f(.178),.041,.135,.064],[f(.212),.077,.004,.049]],9,7);
    k.mesh(head,'gem','glow',f(.179),.050,.146,.042,.022,.033,0,side*.69);
    swept(k,head,'edge',[[f(.038),-.041,.309,.029],[f(.14),-.052,.14,.041],[f(.22),.02,.039,.04],
      [f(.247),.099,-.099,.04],[f(.26),.24,-.26,.007]],12,7);
    for(let i=0;i<5;i++){
      const sidePlate=k.bone(head,f(.166+i*.014),-.033+i*.021,.13-i*.06);
      sidePlate.rotation.y=side*(1.01+i*.07);
      plate(k,sidePlate,i%2?'rind':'trim',[[0,.047,.003],[.04,.026,.007],[.044,-.025,.014],
        [-.001,-.058,.033],[-.038,-.02,.011],[-.04,.018,.002]],.018,.008);
    }
    const blades=evil?4:3;
    for(let i=0;i<blades;i++){
      const x=.114+i*.033,y=.028+i*.045,z=.025-i*.036;
      swept(k,head,i>0?'rind':'trim',[[f(x),y,z,.044],[f(x+.06),y+.112,z-.028,.049],
        [f(x+.105),y+.169,z-.109,.030],[f(x+.181),y+.185,z-.243,.002]],9,7);
    }
    for(let i=0;i<3;i++){
      swept(k,jaw,'edge',[[f(.081+i*.018),.038,.141-i*.061,.014],[f(.078+i*.019),.084,.137-i*.064,.012],
        [f(.055+i*.025),.111-i*.009,.124-i*.069,.0015]],6,5);
    }
    swept(k,head,'trim',[[f(.056),-.10,.25,.016],[f(.159),-.119,.31,.013],[f(.254),-.070,.356,.009],
      [f(.325),.041,.397,.0015]],11,6,.1);
    for(let i=0;i<3;i++){
      const s=.096+i*.044,y=.061+i*.043;
      const hinge=[
        [f(s),y,.238,.029],[f(s+.029),y+.05,.215,.036],[f(s+.082),y+.078,.102,.031],
        [f(s+.110),y+.110,-.027,.008],
      ];
      swept(k,head,i===0?'snakeBelly':'rind',hinge,12,7);
      if(i===1)swept(k,head,'glow',hinge.map(([x,y,z,r])=>[x,y+.019,z+.018,r*.24]),10,6);
    }
    const row=evil?4:3;
    for(let i=0;i<row;i++){
      const t=i/(row-1),spread=evil?.31:.215;
      const spike=[[f(.104+t*.06),.166+t*.043,-.145,.058],[f(.18+t*.12),.222+t*.08,-.243,.075],
        [f(.22+spread*t),.298+t*.13,-.352,.041],[f(.27+spread*t),.354+t*.178,-.470,.006]];
      swept(k,head,i===0?'snakeBelly':'rind',spike,14,8,.28);
      swept(k,head,i===row-1?'glow':'snakeBelly',spike.map(([x,y,z,r])=>[x,y+.022,z+.038,r*.38]),10,6);
    }
    const barb=evil?.043:.030;
    swept(k,jaw,'rind',[[f(.139),-.062,-.072,.032],[f(.181),-.08,.069,.040],
      [f(.131),-.038,.174,.026],[f(.075),.003,.198+barb,.003]],13,7);
  }
  shape(k,jaw,'edge',[[0,-.025,-.06,.135,.036],[0,-.045,.059,.129,.048],[0,-.062,.201,.062,.025]],13,11,2.5,.14);
  const orb=k.bone(head,.24,-.26,.42);
  k.mesh(orb,'round','glow',0,0,0,.053,.053,.053);
  k.mesh(orb,'ring','rind',0,0,0,.097,.097,.32,.7,.68);
  return {body,inspectionHead:head,pattern:'coil',crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,cataloguePose({travel,headtime,wind,strike,stage}) {
    spine.rotation.x=.04*Math.sin(headtime*1.84)-wind*.16+strike*.24;
    spine.rotation.z=Math.sin(headtime*2.34)*(.07+travel*.065);
    head.rotation.y=Math.sin(headtime*2.71)*.12+wind*.12-strike*.23;
    head.rotation.x=-wind*.19+strike*.28;
    jaw.rotation.x=-.055+wind*.19+strike*.51;
    for(const [i,link] of segments.entries()){
      link.position.y=tailCurve.getPointAt(i/sectionCount).y+Math.sin(headtime*4-i*.96)*(.027+.056*travel);
      link.rotation.y=Math.sin(headtime*3.6-i*1.06)*(.07+travel*.058)+wind*i*.013-strike*.056;
    }
    orb.position.x=Math.cos(headtime*3.8)*.243;
    orb.position.y=-.24+Math.sin(headtime*4.18)*.054;
    orb.scale.setScalar(.88+wind*.49+strike*.79+stage*.12);
  }};
}

function folds(k,root,finish,sections,{count=13,start=0,end=TAU,overlap=.65,seed=0}={}){
  for(let i=0;i<count;i++){
    const angle=start+(end-start)*(i+.5)/count;
    const x=Math.sin(angle),z=Math.cos(angle);
    const points=sections.map(([radius,height,width],j)=>{
      const kink=Math.sin(i*3.23+j*2.1+seed)*(j>.0?.025:.006);
      return [x*(radius+kink),height+kink,z*(radius+kink),width*overlap,width*.55];
    });
    shape(k,root,finish,points,12,8,2.0,.28,i*.76+seed);
  }
}

function longGarment(k,body,colors,v){
  const skirt=k.bone(body,0,.30,0),panels=[];
  const silhouette=[[.42,-v.length,.039],[.58,-v.length*.84,.039],[.40,-v.length*.56,.063],
    [.36,-v.length*.29,.108],[v.waist,.08,.081]];
  folds(k,skirt,colors.inside,silhouette,{count:19,seed:v.seed});
  for(let i=0;i<v.panels;i++){
    const a=i*(TAU/v.panels);
    const panel=k.bone(skirt,0,0,0);
    panel.rotation.y=a;
    panels.push(panel);
    const width=v.panelW*(i%2===0?1:.88);
    plate(k,panel,i%3===1?colors.accent:colors.cloth,[
      [-.105,.09,v.waist],[.10,.087,v.waist],[width*.72,-v.length*.46,.43],[width,-v.length*.84,.59],
      [width*.33,-v.length*1.01,.579],[-width*.035,-v.length*.92,.606],[-width*.88,-v.length*.98,.59],
      [-width*.94,-v.length*.63,.51],
    ],.041,.013);
    for(const side of sides){
      swept(k,panel,'trim',[[side*.094,.07,v.waist+.026,.016],[side*width*.5,-v.length*.41,.461,.015],
        [side*width*.68,-v.length*.67,.55,.013],[side*width*.9,-v.length*.91,.617,.008]],11,6,.12);
      if(i%2===0) plate(k,panel,'edge',[[0,-.40,.46],[-width*.2,-.53,.525],[0,-.68,.584],[width*.2,-.53,.525]],.018,.008);
    }
  }
  return {skirt,panels};
}

function face(k,head,{skin='edge',hair='deep',eyes='glow',brow=.16,human=true}={}){
  shape(k,head,skin,[[0,-.223,.055,.057,.067],[0,-.164,.089,.104,.085],[0,-.073,.091,.141,.099],
    [0,.028,.08,.154,.116],[0,.12,.069,.137,.124],[0,.169,.034,.094,.092]],18,13,2.25,.08);
  for(const side of sides){
    shape(k,head,hair,[[side*.099,.160,-.052,.101,.091],[side*.173,.106,-.021,.083,.090],[side*.173,-.044,.007,.067,.080],
      [side*.151,-.176,.021,.059,.049],[side*.109,-.258,-.031,.009,.012]],14,10,2.2,.22);
    swept(k,head,skin,[[side*.023,.04,.189,.018],[side*.068,.050,.171,.026],[side*.122,.049,.144,.015],[side*.151,.083,.099,.003]],9,6,.16);
    if(human)k.mesh(head,'gem',eyes,side*.067,.025,.172,.018,.008,.015,0,side*.37);
    else k.mesh(head,'gem',eyes,side*.076,.030,.176,.028,.021,.018,0,side*.37);
    plate(k,head,'deep',[[0,-.135,.164],[side*.073,-.126,.159],[side*.045,-.151,.166],[0,-.149,.174]],.009,.005);
  }
  swept(k,head,skin,[[0,.052,.16,.028],[0,-.024,.197,.035],[0,-.05,.209,.033],[0,-.075,.19,.019]],8,7,.12);
  swept(k,head,hair,[[-brow,.095,.12,.026],[0,.166,.14,.035],[brow,.095,.126,.024]],11,7,.18);
}

function arm(k,body,side,{wide=.32,y=.78,rest=-.04,cloth='body',shell='edge',glove='deep'}={}){
  const shoulder=k.bone(body,side*wide,y,rest);
  const elbow=k.bone(shoulder,side*.058,-.37,.068);
  const palm=k.bone(elbow,side*.017,-.335,.086);
  shape(k,shoulder,cloth,[[0,-.335,.067,.124,.134],[side*.04,-.18,.035,.165,.148],[side*.028,-.043,-.01,.173,.155],
    [-side*.025,.121,-.034,.136,.136]],15,11,2.6,.13);
  shape(k,elbow,glove,[[0,-.342,.07,.079,.077],[side*.015,-.243,.053,.099,.099],[side*.024,-.116,.037,.128,.097],
    [0,.036,-.011,.11,.097]],13,10,2.2,.13);
  for(let i=0;i<3;i++){
    const at=-.07-i*.086;
    swept(k,elbow,i%2===0?shell:'trim',[
      [-side*.083,at,.035,.027],[0,at+.015,.143,.039],[side*.109,at-.021,.05,.029],[side*.071,at-.019,-.041,.006],
    ],10,7,.16);
  }
  for(let i=0;i<4;i++){
    const x=(i-1.6)*.040;
    swept(k,palm,glove,[[x,.065,.004,.035],[x,-.018,.033,.030],[x*.99,-.075,.059,.023],[x*.84,-.096,.028,.015]],8,6,.16);
  }
  swept(k,palm,glove,[[side*.084,.034,-.006,.035],[side*.111,-.02,.025,.033],[side*.094,-.067,.060,.024]],8,6,.15);
  return {shoulder,elbow,palm,side};
}

function ring(k,joint,finish,radius,width,segments=32,rotation=0,depth=.02){
  const geometry=new T.TorusGeometry(radius,width,6,segments);
  geometry.rotateZ(rotation);geometry.translate(0,0,depth);
  k.geometry(joint,finish,geometry);
}

function bell(k,joint,finish,scale=1){
  const points=[[.054,.22],[.086,.193],[.112,.11],[.126,.028],[.174,-.023],[.173,-.054],
    [.145,-.062],[.125,-.037],[.085,.053],[.067,.138]].map(([x,y])=>new T.Vector2(x*scale,y*scale));
  k.geometry(joint,finish,new T.LatheGeometry(points,14));
  k.mesh(joint,'gem','rind',0,-.019,0,.056*scale,.073*scale,.056*scale);
  k.mesh(joint,'ring','trim',0,.242*scale,0,.032*scale,.038*scale,.45);
}

function garmentMotion({panels=[],skirt,arms},pose,motion={}){
  const {beat,wind,strike,travel}=pose;
  if(skirt)skirt.rotation.x=travel*.14-wind*.085+strike*.11;
  for(const [i,panel] of panels.entries()){
    panel.rotation.x=Math.sin(beat*.57+i*.94)*(.046+travel*.10)+strike*.06+wind*.044;
    panel.rotation.z=Math.cos(beat*.33+i*.75)*(.029+travel*.043);
  }
  for(const {side,elbow,palm} of arms){
    elbow.rotation.x=-.24+wind*(motion.reach??.56)-strike*(motion.stroke??.63)+Math.cos(beat*.5+side)*.067;
    elbow.rotation.z=side*(.086+wind*.19-strike*.13);
    palm.rotation.z=side*(.06+Math.cos(beat*.71+side)*.071+wind*.22);
  }
}

function royalMedium(k,entry,mobile){
  const reaper=entry.id==='m021';
  const body=k.bone(k.root,0,1.18,0);
  const head=k.bone(body,0,1.09,.022);
  const colors=reaper?{inside:'deep',accent:'body',cloth:'brocade'}:{inside:'deep',accent:'brocade',cloth:'body'};
  const profile=reaper?{length:1.34,waist:.255,panelW:.20,panels:9,seed:8}:{length:1.37,waist:.235,panelW:.232,panels:9,seed:5};
  const robe=longGarment(k,body,colors,profile);
  shape(k,body,'body',[[0,.07,0,.257,.185],[0,.29,.02,.229,.187],[0,.48,.014,.28,.193],
    [0,.71,-.015,.336,.187],[0,.89,-.028,.23,.139],[0,.986,-.021,.11,.083]],22,15,2.53,.14);
  shape(k,body,'edge',[[0,.29,.19,.291,.089],[0,.405,.194,.292,.096],[0,.47,.166,.237,.074]],9,14,2.65,.15);
  const mask=k.bone(head,0,-.045,.039);
  mask.name='Painted court face';
  const {jaw}=carvedFace(k,mask,{style:reaper?'ghost':'noble',finish:reaper?'porcelain':'complexion',
    brow:reaper?'rind':'deep',width:reaper?.323:.303,dark:'deep',eye:'glow',
    lids:reaper?'porcelain':'complexion',detailed:!mobile});
  const hair=k.bone(head,0,.06,-.17),crown=k.bone(head,0,.20,-.066);
  const arms=sides.map(side=>arm(k,body,side,{wide:reaper?.36:.30,y:.76,cloth:'brocade',shell:'edge',glove:'edge'}));
  for(const side of sides){
    swept(k,body,'trim',[[side*.095,.91,.084,.023],[side*.205,.70,.219,.037],[side*.093,.49,.249,.023],
      [side*.17,.33,.278,.020]],12,7,.14);
    plate(k,body,side===1?'rind':'edge',[[side*.08,.77,.229],[side*.293,.75,.143],[side*.321,.63,.086],
      [side*.23,.55,.219],[side*.11,.59,.237]],.042,.018);
    const ribbons=reaper?3:2;
    for(let i=0;i<ribbons;i++){
      const x=.085+i*.108;
      swept(k,robe.skirt,i===1?'edge':'brocade',[
        [side*x,.052,-.24,.039],[side*x*1.25,-.39,-.319,.044],
        [side*(x+.06),-.92,-.55,.044],[side*(x+.12),-1.41,-.60-i*.009,.006],
      ],16,7,.23);
    }
    const shoulder=arms[side>0?1:0].shoulder;
    for(let i=0;i<3;i++)swept(k,shoulder,i%2?'rind':'trim',[
      [side*.015,.115-i*.07,-.146,.019],[side*.105,.135-i*.07,-.123,.025],
      [side*.182,.055-i*.069,-.023,.024],[side*.166,-.033-i*.071,.101,.019],
      [side*.104,-.091-i*.074,.139,.004],
    ],10,7);
    plate(k,body,reaper?'brocade':'rind',[[side*.03,.901,-.076],[side*.158,.861,-.15],[side*.262,.728,-.179],
      [side*.171,.502,-.217],[side*.055,.567,-.247],[side*.025,.743,-.221]],.037,.012);
    swept(k,body,'trim',[[side*.027,.895,-.101,.016],[side*.182,.82,-.171,.019],
      [side*.25,.733,-.189,.017],[side*.159,.521,-.24,.005]],10,7);
    const cope=k.bone(body,0,.69,-.17);
    for(let i=0;i<3;i++){
      const y=.12-i*.087,w=.183+i*.025;
      plate(k,cope,reaper?'brocade':'rind',[[side*.018,y+.029,-.039],[side*w,y+.05,-.052],
        [side*(w+.061),y-.032,-.036],[side*(w*.62),y-.084,-.091],[side*.027,y-.103,-.073]],.038,.012);
      swept(k,cope,'trim',[[side*.028,y-.086,-.081,.013],[side*w*.68,y-.071,-.106,.017],
        [side*(w+.049),y-.037,-.044,.004]],9,6);
    }
  }
  for(let i=0;i<5;i++){
    const dart=k.bone(robe.skirt,0,.048,0);dart.rotation.y=i*TAU/5+.32;
    const blade=.04+i*.006;
    plate(k,dart,'rind',[[-blade,.046,.279],[blade,.046,.285],[blade*.96,-.072,.335],
      [0,-.136,.376],[-blade*.85,-.069,.337]],.031,.011);
    k.mesh(dart,'gem','trim',0,-.029,.331,.020,.026,.016);
  }
  if(reaper){
    const halo=k.bone(crown,0,.18,-.024);
    ring(k,halo,'trim',.49,.027,44,0,-.014);
    ring(k,halo,'rind',.526,.011,44,0,-.034);
    for(let i=0;i<8;i++){
      const a=i*TAU/8;
      swept(k,halo,'edge',[[Math.cos(a)*.47,Math.sin(a)*.47,-.01,.033],
        [Math.cos(a)*.544,Math.sin(a)*.544,-.033,.028],[Math.cos(a)*.592,Math.sin(a)*.592,-.07,.003]],7,6);
    }
    for(const side of sides){
      swept(k,crown,'brocade',[[side*.243,.02,.016,.052],[side*.434,.15,-.081,.084],
        [side*.637,.48,-.16,.06],[side*.671,.71,-.188,.005]],13,8,.28);
      swept(k,crown,'trim',[[side*.282,.087,.066,.018],[side*.463,.272,-.016,.033],
        [side*.615,.583,-.11,.02],[side*.639,.66,-.131,.002]],11,7,.12);
    }
    const count=mobile?17:25;
    for(let i=0;i<count;i++){
      const a=PI*.58+PI*.84*i/(count-1);
      const x=Math.sin(a),z=Math.cos(a),ridge=.91+.24*Math.sin(i*2.53);
      swept(k,hair,i%4===1?'edge':'crest',[[x*.098,.15,z*.064,.061],[x*.211,-.14,z*.164,.083],
        [x*.393,-.59*ridge,z*.332,.108],[x*.260,-1.12*ridge,z*.46,.063],[x*.143,-1.27*ridge,z*.365,.003]],18,7,.24);
    }
    for(const {side,palm} of arms){
      const talisman=k.bone(palm,side*.03,-.106,.047);
      ring(k,talisman,'trim',.17,.031,22,0,0);
      ring(k,talisman,'rind',.118,.010,22,0,.025);
      k.mesh(talisman,'gem','glow',0,0,.053,.041,.105,.028);
      for(let i=0;i<3;i++){
        const x=(i-1)*.062;
        plate(k,talisman,'brocade',[[x-.024,-.13,.026],[x+.02,-.134,.026],[x+.04,-.30,.045],[x-.012,-.34,.044]],.013,.004);
      }
    }
  }else{
    for(let i=0;i<16;i++){
      const a=PI*.40+PI*1.2*i/15;
      swept(k,hair,i%4===0?'body':'deep',[[Math.sin(a)*.073,.195,Math.cos(a)*.064,.047],
        [Math.sin(a)*.198,.10,Math.cos(a)*.12,.067],[Math.sin(a)*.214,-.23,Math.cos(a)*.192,.062],
        [Math.sin(a)*.166,-.57,Math.cos(a)*.122,.012]],14,7,.26);
    }
    for(const side of sides){
      for(let i=0;i<3;i++){
        const x=.073+i*.061;
        for(const j of [0,1])plate(k,crown,j===0?'rind':'body',[[side*x,.0,.10],[side*(x+.082),.063+i*.036,.024],
          [side*(x+.17),.142+i*.048,-.028],[side*(x+.105),.177+i*.039,-.08],[side*x,.097,-.019]],.041,.015);
        k.mesh(crown,'gem','trim',side*(x+.065),.041+i*.034,.119,.035,.038,.034);
      }
      const earring=k.bone(head,side*.176,-.085,.034);
      ring(k,earring,'trim',.045,.011,18,0);
      k.mesh(earring,'gem','rind',0,-.083,0,.035,.058,.025);
    }
    k.mesh(crown,'gem','glow',0,.05,.194,.036,.051,.017);
    const fan=k.bone(arms[0].palm,.038,-.04,.09);
    for(let i=-3;i<=3;i++){
      const a=i*.26;
      const rib=k.bone(fan,0,0,0);rib.rotation.z=a;
      swept(k,rib,'trim',[[0,0,0,.021],[0,.255,.052,.023],[0,.487,.089,.007]],10,6,.12);
      if(i!==3)plate(k,rib,i%2?'body':'rind',[[0,.08,.004],[0,.49,.071],[-.12,.483,.069],[-.036,.19,.016]],.020,.006);
    }
  }
  return {body,head,arms:arms.map(s=>s.shoulder),crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,cataloguePose(pose){
    garmentMotion({...robe,arms},pose,{reach:reaper?.51:.72,stroke:reaper?.74:.49});
    const {beat,wind,strike,stage}=pose;
    hair.rotation.x=Math.sin(beat*.65)*.035-wind*.12+strike*.18;
    hair.rotation.y=Math.sin(beat*.37)*(.069+stage*.033);
    crown.rotation.z=Math.sin(beat*.8)*.024+strike*.05;
    jaw.rotation.x=.018+wind*.20+strike*.34;
  }};
}

function mailedLeg(k,hips,side,offset=.19){
  const thigh=k.bone(hips,side*offset,.05,.015),shin=k.bone(thigh,side*.036,-.42,.028);
  shape(k,thigh,'body',[[0,-.415,.028,.148,.148],[0,-.28,.017,.174,.171],[0,-.12,-.006,.165,.16],
    [0,.02,.0,.136,.14]],15,11,2.35);
  shape(k,shin,'deep',[[0,-.37,.073,.109,.108],[0,-.26,.028,.119,.113],[0,-.098,-.016,.131,.12],[0,.05,.018,.146,.147]],14,11,2.3);
  shape(k,shin,'edge',[[0,-.384,.168,.119,.154],[0,-.343,.136,.128,.165],[0,-.284,.092,.113,.128]],9,10,2.5);
  for(let i=0;i<3;i++){
    const y=-.065-i*.096;
    swept(k,shin,i===1?'brocade':'trim',[[-.10,y,-.02,.023],[-.087,y,.091,.026],[0,y+.021,.129,.029],
      [.100,y,.067,.022],[.113,y-.008,-.032,.013]],11,7,.1);
  }
  return {thigh,shin,side};
}

function relicGreave(k,{thigh,shin,side},yaksha){
  const f=x=>side*x;
  const bevel=path=>path.map(([x,...rest])=>[f(x),...rest]);
  const rise=yaksha?.133:.086;
  const knee=bevel([[-.110,.047,.100],[-.021,.082+rise,.151],[.113,.111+rise*.67,.098],
    [.173,.017,.058],[.128,-.141,.141],[.042,-.198,.197],[-.081,-.127,.176]]);
  plate(k,shin,yaksha?'crest':'rind',knee,.056,.021);
  swept(k,shin,'trim',bevel([[-.093,.035,.157,.015],[.008,.099+rise,.173,.028],[.122,.093+rise*.52,.13,.027],
    [.157,-.027,.11,.017],[.089,-.138,.179,.004]]),14,8,.17);
  for(let row=0;row<3;row++){
    const y=-.095-row*.081,z=-.106+row*.012;
    const spur=yaksha?.14-row*.012:.065+row*.016;
    const fin=bevel([[.063,y+.072,z+.085],[.144,y+.094,z+.001],[.141+spur,y+.042,z-.077],
      [.113+spur,y-.062,z-.092],[.083,y-.092,z-.127],[.020,y-.04,z-.076]]);
    plate(k,shin,row%2?'rind':yaksha?'brocade':'body',fin,.049,.018);
    swept(k,shin,row===0&&yaksha?'edge':'trim',fin.slice(1,5).map(([x,h,p])=>[x+f(.013),h+.014,p-.014,.013]),11,7,.16);
  }
  const shoulder=bevel([[.027,-.105,.143],[.161,-.077,.081],[.203,-.165,-.025],
    [.187,-.298,-.15],[.146,-.385,-.094],[.102,-.302,.082],[.041,-.284,.134]]);
  plate(k,thigh,yaksha?'brocade':'rind',shoulder,.052,.017);
  swept(k,thigh,yaksha?'crest':'trim',shoulder.slice(1,6).map(([x,y,z])=>[x+f(.019),y+.010,z,.018]),12,8);
  for(let toe=0;toe<(yaksha?3:2);toe++){
    const x=-.077+toe*(yaksha?.067:.14);
    swept(k,shin,yaksha?'crest':'trim',bevel([[x,-.309,.176,.023],[x+.001,-.346,.284,.041],
      [x+.010,-.395,.322,.027],[x+.027,-.432,yaksha?.378:.338,.004]]),10,7);
  }
}

function knightRelic(k,entry,mobile){
  const yaksha=entry.id==='m109';
  const body=k.bone(k.root,0,1.00,0),head=k.bone(body,0,.94,.016);
  const arms=sides.map(side=>arm(k,body,side,{wide:.30,y:.69,cloth:yaksha?'rind':'body'}));
  const legs=sides.map(side=>mailedLeg(k,k.root,side,yaksha?.18:.22));
  for(const leg of legs){
    leg.thigh.position.y=.93;
    relicGreave(k,leg,yaksha);
  }
  const shell=yaksha?'relicCinnabar':'relicSoot';
  shape(k,body,shell,[[0,-.13,-.01,.279,.183],[0,.12,.007,.309,.202],[0,.36,.01,.332,.187],
    [0,.67,-.02,.386,.218],[0,.823,-.035,.256,.182],[0,.90,0,.14,.12]],24,15,2.81);
  if(yaksha)face(k,head,{hair:'rind',skin:'brocade',human:false});
  else{
    const seated=k.bone(head,0,-.046,.059);
    const {jaw}=carvedFace(k,seated,{style:'elder',finish:'sculptAsh',width:.337,
      brow:'deep',dark:'deep',eye:'glow',lids:'sculptAsh'});
    jaw.rotation.x=.13;
    openHelm(k,head,{material:'rind',trim:'trim',dark:'deep',crest:.48,flare:.97,span:.94,vent:'open'});
    demonicMempo(k,seated,{face:'rind',trim:'trim',fang:'edge',opening:.93,jaw:false});
  }
  shape(k,head,'body',[[0,.010,-.089,.145,.122],[0,.153,-.055,.18,.155],
    [0,.218,-.063,.155,.132],[0,.325,-.065,.112,.098]],16,15,2.2,.11);
  const mantle=k.bone(body,0,.65,-.21);
  const tailoring=relicTailoring(k,body,arms,legs,mantle,yaksha,mobile);
  for(const side of sides){
    for(let i=0;i<4;i++){
      const y=.71-i*.129,x=side*(.24-i*.017);
      plate(k,body,i%2===0?'rind':'trim',[[x*.40,y+.058,.216],[x*1.41,y+.066,.079],
        [x*1.55,y-.044,.116],[x*.88,y-.08,.232],[x*.40,y-.040,.267]],.043,.014);
    }
    for(let i=0;i<(yaksha?7:3);i++){
      const x=.054+i*.027,y=.17+i*.005;
      swept(k,head,yaksha?'crest':'trim',[[side*x,y,.048,.043],[side*x*1.55,y+.105,-.041,.048],
        [side*(x+.155),y+.244+(yaksha?.051*Math.sin(i*.32):0),-.184,.005]],10,7,.18);
    }
    swept(k,head,'rind',[[side*.014,.139,.137,.028],[side*.106,.111,.176,.037],
      [side*.168,.019,.127,.032],[side*.169,-.143,.069,.024],[side*.128,-.21,.076,.004]],13,8);
  }
  const mace=k.bone(arms[yaksha?0:1].palm,.035,-.05,.05);
  const shaftLength=yaksha?1.17:.76;
  markEnemyWeapon(mace,[0,shaftLength+.34,.06],{width:.21});
  swept(k,mace,'deep',[[.0,-.88,-.026,.037],[.006,-.46,-.022,.042],[0,.11,0,.043],
    [-.016,.62,.013,.042],[.001,shaftLength,.064,.047]],20,9,.19);
  for(let i=0;i<18;i++){
    const y=-.84+i*(shaftLength+1.05)/19;
    k.mesh(mace,'ring',i%3===0?'edge':'trim',0,y,.02,.052,.052,.82,PI/2);
  }
  const top=k.bone(mace,.014,shaftLength,.051);
  if(yaksha){
    shape(k,top,'brocade',[[0,-.10,0,.10,.13],[.035,.086,.027,.242,.17],[0,.302,-.005,.196,.17],
      [-.08,.467,-.06,.077,.09],[-.171,.521,-.036,.001,.008]],22,12,2.6,.21);
    for(const side of sides){
      swept(k,top,'rind',[[side*.081,.007,.037,.068],[side*.237,.179,.078,.069],
        [side*.266,.36,-.024,.049],[side*.382,.491,-.127,.004]],13,8,.30);
      plate(k,top,'trim',[[side*.047,.037,.141],[side*.194,.115,.154],[side*.221,.223,.123],[side*.078,.284,.127]],.031,.01);
      k.mesh(top,'gem','glow',side*.086,.177,.161,.035,.017,.021);
    }
  }else{
    shape(k,top,'deep',[[0,-.17,0,.114,.11],[0,-.059,.006,.23,.219],[0,.13,.006,.213,.215],[0,.225,0,.107,.108]],16,13,3.1,.17);
    for(let i=0;i<12;i++){
      const a=TAU*i/12,y=(i%3-1)*.109,x=Math.cos(a),z=Math.sin(a);
      swept(k,top,i%2?'edge':'trim',[[x*.171,y,z*.171,.039],[x*.237,y+.028,z*.23,.049],[x*.33,y+.061,z*.31,.005]],7,6);
    }
    for(const side of sides)ring(k,top,'rind',.161,.019,22,0,side*.154);
  }
  return finishKnight({k,entry,body,head,arms,legs,mantle,weapon:top,tailoring});
}

function finishKnight({k,entry,body,head,arms,legs,mantle,weapon,tailoring}){
  return {body,head,arms:arms.map(s=>s.shoulder),legs:legs.map(s=>s.thigh),crest:k.bone(body,0,0,0),
    relicGarments:tailoring?.garments,
    catalogueSculpt:entry.id,cataloguePose({wind,strike,beat,step,travel}){
      for(const {side,elbow,palm} of arms){
        elbow.rotation.x=-.26+wind*.63-strike*.78+Math.cos(beat+side)*.05;
        palm.rotation.z=side*(.071+wind*.39-strike*.22);
      }
      for(const {shin,side} of legs)shin.rotation.x=.11+Math.max(0,Math.sin(step+side*PI*.57))*travel*.73+strike*.16;
      mantle.rotation.x=Math.sin(beat*.73)*.055+travel*.19+strike*.33;
      mantle.rotation.z=Math.sin(beat*.38)*.094+wind*.16;
      weapon.rotation.z=Math.sin(beat*.43)*.137+wind*.65-strike*.85;
      tailoring?.motion({wind,strike,beat});
  }};
}

function abbot(k,entry,mobile){
  const body=k.bone(k.root,0,1.12,0),head=k.bone(body,0,1.02,.08);
  const votive=carveAbbotVotive(k,body,mobile);
  shape(k,head,'deep',[[0,-.286,-.017,.194,.132],[0,-.11,-.035,.230,.218],[0,.069,-.071,.234,.225],
    [0,.213,-.106,.198,.175],[0,.35,-.115,.111,.094]],24,17,2.23,.12);
  face(k,head,{hair:'crest',human:false});
  const arms=sides.map(side=>arm(k,body,side,{wide:.38,y:.63,cloth:'brocade',shell:'edge',glove:'edge'}));
  const beadChain=k.bone(arms[1].palm,.07,-.12,.09);
  for(let i=0;i<17;i++){
    const a=i*TAU/17;
    const y=Math.sin(a)*.33,z=Math.cos(a)*.165;
    k.mesh(beadChain,'round',i%5===0?'edge':'rind',Math.sin(a*.5)*.032,y,z,.05,.05,.05);
    if(i%3===0)k.mesh(beadChain,'ring','trim',Math.sin(a*.5)*.032,y,z,.054,.052,.37,PI/2,a);
  }
  const talisman=k.bone(arms[0].palm,-.026,-.14,.11);
  plate(k,talisman,'brocade',[[-.142,-.131,.01],[.141,-.131,0],[.108,.112,.011],[-.092,.122,.017]],.05,.019);
  swept(k,talisman,'glow',[[-.095,-.074,.04],[.065,-.074,.042],[.065,.075,.041],[-.082,.074,.043]],9,6,.12);
  return {body,head,arms:arms.map(s=>s.shoulder),crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,votiveTailoring:votive.silks,cataloguePose(pose){
    garmentMotion({arms},pose,{reach:.76,stroke:.58});
    votive.pose(pose);
    const {beat,wind,strike}=pose;
    beadChain.rotation.set(Math.sin(beat*1.1)*.17-wind*.52+strike*.60,wind*.44,Math.cos(beat*.7)*.18+strike*.49);
    talisman.scale.setScalar(.83+wind*.37+strike*.77);
  }};
}

function barrel(k,joint,finish,radius,length,side=0){
  const revolve=new T.LatheGeometry([[0,-length*.5],[radius*.76,-length*.5],[radius,-length*.40],
    [radius*.84,length*.32],[radius*.97,length*.40],[radius,length*.49],[radius*.64,length*.50],[radius*.529,length*.28]]
    .map(([x,y])=>new T.Vector2(x,y)),21);
  revolve.rotateX(PI/2);revolve.translate(side,0,0);k.geometry(joint,finish,revolve);
  for(const z of [-length*.32,-length*.06,length*.29,length*.44]){
    const ringPos=k.bone(joint,side,0,z);
    ring(k,ringPos,'trim',radius*.98,radius*.087,23);
    if(z>length*.3)ring(k,ringPos,'edge',radius*.79,radius*.038,26,0,.025);
  }
}

function captain(k,entry){
  const body=k.bone(k.root,0,.95,0),head=k.bone(body,0,1.03,.015);
  const robe=longGarment(k,body,{inside:'deep',accent:'body',cloth:'brocade'},
    {length:1.14,waist:.31,panelW:.232,panels:8,seed:24});
  shape(k,body,'brocade',[[0,.04,.006,.338,.204],[0,.21,.014,.329,.29],[0,.49,.048,.405,.289],
    [0,.76,-.047,.365,.26],[0,.931,-.026,.23,.14]],22,17,2.53);
  const arms=sides.map(side=>arm(k,body,side,{wide:.385,y:.73,cloth:'brocade',shell:'edge',glove:'edge'}));
  const legs=sides.map(side=>mailedLeg(k,k.root,side,.205));
  for(const leg of legs)leg.thigh.position.y=.89;
  face(k,head,{skin:'edge',hair:'rind',human:true});
  shape(k,head,'deep',[[0,.072,-.035,.145,.106],[0,.211,-.027,.178,.127],[0,.29,-.036,.185,.136],
    [0,.323,-.047,.121,.099]],14,16,2.73);
  for(let i=0;i<3;i++){
    const a=(i+.13)*TAU/3;
    const hat=k.bone(head,0,.185,-.015);hat.rotation.y=a;
    plate(k,hat,'deep',[[-.287,-.027,.087],[0,.10,.303],[.304,.021,.09],[0,-.05,.108]],.055,.026);
    swept(k,hat,'trim',[[-.275,-.021,.10,.025],[-.142,.051,.211,.036],[0,.115,.304,.032],
      [.146,.068,.217,.026],[.298,.025,.087,.008]],18,8,.1);
  }
  swept(k,head,'brocade',[[.131,.222,-.048,.044],[.263,.34,-.093,.058],[.336,.432,-.129,.040],
    [.401,.433,-.270,.012],[.404,.391,-.307,.003]],17,7);
  for(const side of sides){
    const line=[[side*.105,.924,.062,.028],[side*.25,.757,.179,.037],[side*.268,.55,.221,.033],
      [side*.242,.23,.298,.036],[side*.288,-.106,.423,.027]];
    swept(k,body,'trim',line,18,8);
    plate(k,body,'deep',[[0,.722,.286],[side*.159,.777,.248],[side*.286,.667,.21],[side*.179,.461,.279],
      [side*.109,.267,.309],[0,.314,.341]],.039,.013);
    swept(k,head,'rind',[[0,-.089,.192,.023],[side*.14,-.102,.167,.031],[side*.158,-.177,.11,.024],
      [side*.103,-.283,.143,.006]],12,6);
    for(let b=0;b<5;b++){
      const y=.64-.078*b;
      k.mesh(body,'round','trim',side*.14,y,.305+Math.sin(b*.58)*.056,.032,.036,.024);
    }
  }
  const cannon=k.bone(k.root,-.92,.47,.325);
  markEnemyWeapon(cannon,[0,.12,1.1],{width:.26});
  const pitch=k.bone(cannon,0,.36,.005);
  barrel(k,pitch,'rind',.251,1.34);
  for(const side of sides){
    const wheel=k.bone(cannon,side*.44,-.055,-.006);wheel.rotation.y=PI/2;
    ring(k,wheel,'trim',.342,.047,33);ring(k,wheel,'deep',.266,.037,28);
    for(let i=0;i<8;i++){
      const a=TAU*i/8, x=Math.cos(a),y=Math.sin(a);
      swept(k,wheel,'body',[[x*.06,y*.06,0,.034],[x*.191,y*.191,.02,.040],[x*.318,y*.318,0,.027]],5,6);
    }
    k.mesh(wheel,'gem','edge',0,0,.067,.13,.13,.11);
    swept(k,cannon,'body',[[side*.31,-.09,-.67,.090],[side*.30,.102,-.44,.093],[side*.28,.21,.076,.092],
      [side*.27,.122,.533,.073]],14,8);
  }
  const parrot=k.bone(body,.02,1.82,-.25);
  shape(k,parrot,'brocade',[[0,-.145,-.079,.071,.071],[0,-.06,-.025,.103,.102],[0,.0,.007,.115,.106],
    [0,.085,.058,.091,.077],[0,.131,.113,.058,.067]],14,10,2.08);
  const wings=sides.map(side=>{
    const wing=k.bone(parrot,side*.078,.016,0);
    for(let i=0;i<7;i++){
      k.geometry(wing,i%3===2?'rind':'brocade',featherVane([side*.042,.02,i*.015],
        [side*(.19+i*.016),.065,-.030-i*.038],[side*(.28+i*.044),.016,-.114-i*.069],.061,16+i,8));
    }
    return wing;
  });
  swept(k,parrot,'trim',[[0,.102,.117,.048],[0,.089,.195,.048],[0,.052,.231,.005]],8,6);
  return {body,head,arms:arms.map(s=>s.shoulder),legs:legs.map(s=>s.thigh),crest:k.bone(k.root,0,0,0),
    catalogueSculpt:entry.id,cataloguePose(pose){
      garmentMotion({...robe,arms},pose,{reach:.63,stroke:.49});
      const {headtime,wind,strike,beat,step,travel}=pose;
      cannon.position.z=.32-strike*.24;
      cannon.rotation.y=-wind*.19+strike*.08;
      pitch.rotation.x=-wind*.18+strike*.18;
      parrot.position.set(Math.cos(headtime*1.9)*.77,1.70+Math.sin(headtime*6.9)*.13,-.14+Math.sin(headtime*1.9)*.66);
      parrot.rotation.y=-headtime*1.9;
      for(const [i,wing] of wings.entries())wing.rotation.z=(i?1:-1)*(.29+.58*Math.sin(headtime*18-i*.3));
      for(const [i,{shin}] of legs.entries())shin.rotation.x=Math.sin(step+i*PI)*travel*.37+strike*.07;
      head.rotation.y=-wind*.18+Math.cos(beat*.34)*.04;
  }};
}

function shadowReaper(k,entry){
  const body=k.bone(k.root,0,1.13,0),head=k.bone(body,0,1.07,.012);
  const cloak=k.bone(body,0,.87,-.115);
  shape(k,body,'deep',[[0,-.68,-.064,.13,.101],[0,-.42,-.05,.24,.184],[0,-.10,-.024,.35,.237],
    [0,.28,-.018,.29,.25],[0,.69,-.028,.36,.214],[0,.951,0,.194,.129]],24,16,2.3,.25);
  shape(k,head,'shadowIron',[[0,-.237,.071,.119,.133],[0,-.038,.035,.232,.177],[0,.130,-.039,.276,.24],
    [0,.267,-.124,.225,.225],[.019,.403,-.272,.123,.133],[.033,.482,-.378,.018,.026]],23,17,2.25,.23);
  shape(k,head,'deep',[[0,-.155,.146,.105,.077],[0,-.059,.183,.173,.093],
    [0,.072,.15,.20,.11],[0,.143,.135,.143,.087]],15,11,2.3,.13);
  const ribs=[];
  for(const side of sides){
    const reflect=points=>points.map(([x,...rest])=>[side*x,...rest]);
    const cheek=reflect([[.044,.16,.192],[.172,.221,.133],[.247,.147,.037],[.258,.024,-.020],
      [.188,-.104,.072],[.117,-.215,.16],[.067,-.167,.213],[.105,-.068,.229],[.032,.041,.262]]);
    plate(k,head,'shadowIvory',cheek,.033,.016);
    swept(k,head,'shadowIron',reflect([[.031,.149,.233,.028],[.139,.214,.182,.038],[.226,.173,.087,.039],
      [.259,.075,.011,.024],[.289,-.071,-.079,.006]]),15,8);
    swept(k,head,'glow',reflect([[.037,.066,.264,.006],[.092,.088,.253,.011],[.155,.099,.222,.014],
      [.179,.097,.190,.004]]),10,6);
    swept(k,head,'trim',reflect([[.071,-.159,.206,.010],[.124,-.116,.205,.016],[.211,-.030,.122,.015],
      [.247,.025,.079,.005]]),11,6);
    for(let i=0;i<5;i++){
      const root=k.bone(cloak,side*(.13+i*.073),.085-i*.071,-.117-i*.055);
      root.name='黑影 · 脊骨裂翼 '+(i+1);
      const peak=.57-i*.086,span=.38+i*.048;
      shape(k,root,'shadowIron',reflect([[.004,.027,.009,.058,.082],[.082,.208,-.084,.102,.084],
        [.162,peak*.81,-.198,.112,.066],[span*.83,peak,-.284,.072,.041],
        [span,peak-.038,-.376,.033,.024],[span+.058,peak-.176,-.433,.006,.005]]),15,11,2.36,.23,side*i*1.6);
      plate(k,root,i%3===1?'brocade':'deep',reflect([[.069,.10,-.068],[.157,peak*.81,-.20],[span*.80,peak,-.29],
        [span+.012,peak-.04,-.367],[span+.064,peak-.183,-.422],[span+.016,-.29,-.543],
        [span-.07,-.17,-.537],[span-.15,-.443,-.57],[span-.213,-.289,-.50],[.048,-.09,-.25]]),.044,.018);
      swept(k,root,i===1?'veilEdge':'shadowIvory',reflect([[.141,peak*.71,-.23,.019],[span*.74,peak-.015,-.315,.023],
        [span+.010,peak-.11,-.405,.024],[span+.043,-.037,-.48,.019],
        [span-.031,-.23,-.539,.007]]),13,6);
      ribs.push({root,side,i});
    }
  }
  const arms=sides.map(side=>arm(k,body,side,{wide:.35,y:.77,cloth:'deep',shell:'rind',glove:'rind'}));
  const veils=[];
  for(let i=0;i<10;i++){
    const a=i*TAU/10, x=Math.sin(a),z=Math.cos(a),hem=.94+Math.sin(i*1.7)*.24;
    const flap=k.bone(cloak,0,0,0);flap.rotation.y=a;
    veils.push(flap);
    plate(k,flap,i%4===1?'brocade':'deep',[
      [-.112,.02,.18],[.136,.015,.19],[.245,-.47,.28],[.195,-.84,.39],[.130,-1.26*hem,.45],
      [.03,-1.01*hem,.40],[-.06,-1.49*hem,.51],[-.204,-1.25*hem,.445],[-.22,-.79,.36],[-.207,-.38,.24],
    ],.055,.013);
    swept(k,flap,i%3===0?'rind':'body',[[x*.011,-.08,.209,.020],[x*.054,-.50,.312,.024],
      [x*.073,-.94*hem,.432,.019],[x*.135,-1.24*hem,.471,.005]],14,7);
    swept(k,flap,'trim',[[z*.034,-.032,.18,.009],[z*.052,-.41,.285,.007],
      [z*.077,-.76*hem,.38,.009],[z*.14,-1.13*hem,.455,.003]],12,6);
  }
  const spine=k.bone(body,0,.81,-.31);
  for(let i=0;i<9;i++){
    plate(k,spine,i%2?'edge':'rind',[[0,-i*.089+.024,-.03],[.095,-i*.09-.058,-.042],
      [0,-i*.09-.11,-.065],[-.095,-i*.09-.058,-.042]],.031,.013);
  }
  const scythe=k.bone(arms[1].palm,.02,-.03,.039);
  markEnemyWeapon(scythe,[1.22,.73,.207],{width:.27});
  swept(k,scythe,'deep',[[.06,-.99,-.081,.052],[-.04,-.55,-.076,.061],[0,.22,.04,.063],
    [.08,.78,.093,.045],[.213,1.22,.112,.039]],27,9);
  for(let i=0;i<12;i++)k.mesh(scythe,'ring',i%3?'body':'trim',.012+Math.sin(i*.41)*.038,-.65+i*.10,.010,.062,.066,.61,PI/2,.04);
  plate(k,scythe,'rind',[
    [.13,1.15,.114],[.285,1.35,.128],[.496,1.39,.151],[.776,1.28,.194],[1.038,1.08,.219],
    [1.22,.73,.207],[1.13,.813,.201],[.95,.925,.18],[.74,.953,.147],[.51,.949,.123],[.35,1.05,.105],
  ],.069,.019);
  swept(k,scythe,'glow',[[.29,1.07,.128,.016],[.51,.960,.141,.019],[.71,.941,.166,.017],
    [.953,.924,.196,.012],[1.14,.808,.231,.006],[1.216,.734,.238,.0015]],23,6,.14);
  ring(k,scythe,'trim',.14,.019,21,0,.103);
  return {body,head,arms:arms.map(s=>s.shoulder),crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,shadowSculpt:true,
    cataloguePose({beat,wind,strike,travel,stage}){
    for(const {root,side,i} of ribs){
      root.rotation.y=side*(.085+stage*.07+Math.sin(beat*.59-i*.44)*.093+strike*.26);
      root.rotation.x=travel*.21+wind*.18-strike*.32+Math.cos(beat*.74-i*.47)*.043;
    }
    for(const [i,flap] of veils.entries()){
      flap.rotation.x=Math.sin(beat*.75+i*.67)*.12+travel*.31+wind*.11-strike*.18;
      flap.rotation.z=Math.sin(beat*.43+i*.45)*(.08+travel*.055);
    }
    for(const {side,elbow,palm} of arms){
      elbow.rotation.x=-.39+wind*.78-strike*.98;
      palm.rotation.z=side*(.068+wind*.29-strike*.44);
    }
    scythe.rotation.y=.33+wind*.6-strike*.88;
  }};
}

function qiongqi(k,entry,mobile){
  const body=k.bone(k.root,0,1.03,-.02),head=k.bone(body,0,.52,.68);
  shape(k,body,'body',[[0,-.19,-.79,.16,.128],[0,-.11,-.39,.243,.259],[0,.05,-.13,.35,.323],
    [0,.19,.18,.331,.297],[0,.36,.51,.242,.235],[0,.51,.63,.156,.159]],29,19,2.15,.3);
  const {jaw,crown}=qiongqiMask(k,head,mobile);
  head.scale.setScalar(1.23);
  const frostVane=(parent,finish,root,arch,end,width,seed,sections)=>{
    const geometry=featherVane(root,arch,end,width,seed,sections);
    const {position,color,uv}=geometry.attributes;
    const curve=new T.CatmullRomCurve3([root,arch,end].map(p=>new T.Vector3(...p)));
    const frames=Array.from({length:sections+1},(_,i)=>{
      const t=i/sections;
      return {center:curve.getPoint(t),tangent:curve.getTangent(t)};
    });
    const point=new T.Vector3();
    for(let i=0;i<color.count;i++){
      const t=uv.getY(i),s=uv.getX(i)*2-1,edge=Math.abs(s);
      const sheath=Math.sin(Math.PI*t)**.64;
      const serration=Math.sin(t*sections*Math.PI+seed*.43+Math.sign(s)*.75);
      const branch=Math.sin(t*sections*2.40+edge*3.8+s*.63+seed*.73);
      const ruffle=branch*.012*sheath*Math.sin(Math.PI*edge);
      const {center,tangent}=frames[Math.round(t*sections)];
      point.fromBufferAttribute(position,i).sub(center);
      point.multiplyScalar(1-Math.max(0,serration)*.29*edge**3*sheath);
      point.add(center).addScaledVector(tangent,.036*serration*sheath*edge**2);
      point.z+=ruffle;
      position.setXYZ(i,point.x,point.y,point.z);
      const midBand=Math.max(0,Math.sin((t+.01)*Math.PI*4.2+seed*.19))**1.8;
      const frost=Math.min(1,t**3*.55+midBand*.24+edge*.11);
      const tone=color.getX(i)*(.84+frost*.64+branch*.22*sheath*edge);
      color.setXYZ(i,tone*(.82+frost*.12),tone*(.92+frost*.08),tone*(1.13-frost*.06));
    }
    geometry.computeVertexNormals();
    k.geometry(parent,finish,geometry);
  };
  const wings=[],legs=[],tail=[];
  for(const side of sides){
    const x=a=>side*a;
    for(let i=0;i<8;i++){
      const gradient=i/8;
      frostVane(body,i%3?'qiongFeather':'qiongIce',[x(.124+gradient*.073),.467-gradient*.52,.577],
        [x(.248+gradient*.08),.409-gradient*.49,.267],
        [x(.345+gradient*.08),.26-gradient*.46,-.132-gradient*.104],.10+gradient*.031,13+i,mobile?10:13);
      swept(k,body,i%2?'qiongFeather':'qiongIce',[[x(.104+gradient*.118),.47-gradient*.43,.552,.013],
        [x(.252+gradient*.093),.411-gradient*.45,.304,.021],
        [x(.339+gradient*.09),.302-gradient*.41,-.075-gradient*.11,.006]],11,7);
    }
    for(let i=0;i<5;i++){
      const spread=i*.034;
      k.geometry(head,i%2?'qiongIce':'qiongFeather',featherVane([x(.122+spread),.116-i*.042,.160-i*.037],
        [x(.253+spread),.038-i*.041,.031-i*.029],
        [x(.291+spread),-.043-i*.058,-.242-i*.043],.060-i*.003,89+i,mobile?8:12));
    }
    for(let i=0;i<2;i++){
      const fore=i===0;
      const leg=k.bone(body,x(fore?.225:.169),fore?.081:-.083,fore?.263:-.521);
      const knee=k.bone(leg,x(.045),fore?-.46:-.34,fore?-.082:-.172);
      const heel=k.bone(knee,x(.019),fore?-.36:-.39,fore?.077:.134);
      shape(k,leg,'body',[[0,.085,0,.143,.122],[x(.023),-.047,-.033,fore?.167:.185,fore?.123:.148],
        [x(.055),-.195,fore?.029:-.093,fore?.117:.139,fore?.102:.128],
        [x(.049),fore?-.31:-.257,fore?-.022:-.131,.084,.097],
        [x(.045),fore?-.44:-.35,fore?-.073:-.162,.061,.074]],18,13,2.32,.33);
      shape(k,knee,'rind',[[0,.054,-.016,.069,.076],[x(.017),-.022,.016,.076,.073],
        [x(.012),-.147,.027,.063,.061],[x(.019),-.34,fore?.072:.123,.045,.047]],12,10,2.20,.21);
      for(let row=0;row<3;row++){
        const y=.105-row*.086,z=fore?.027:-.07;
        plate(k,leg,row%2?'qiongFeather':'rind',[[x(.030),y+.021,z+.114],[x(.127),y+.023,z+.129],
          [x(.183),y-.027,z+.015],[x(.152),y-.102,z-.073],[x(.079),y-.147,z-.055],
          [x(.096),y-.071,z+.076]],.041,.014);
        frostVane(leg,row%2?'qiongIce':'qiongPale',[x(.091),y+.022,z+.129],[x(.157),y-.053,z+.113],
          [x(.131),y-.209-(fore?.082:.030),z-.123],.047,136+row,mobile?7:10);
      }
      for(let branch=0;branch<3;branch++){
        const t=branch*.039;
        swept(k,knee,branch%2?'qiongFeather':'qiongRuff',[[x(.032+t*.46),.028-t,.038-t*.47,.009],
          [x(.082-t*.22),-.039-t,.048-t*.83,.016],[x(.076-t*.19),-.106-t,.067-t,.014],
          [x(.051-t*.35),-.229-t,.082-t,.002]],8,6,.19);
      }
      qiongqiFoot(k,heel,side,fore,mobile);
      legs.push({leg,knee,heel,side,i});
    }
    const wing=k.bone(body,x(.252),.259,-.083);
    const wrist=k.bone(wing,x(.673),.41,-.025);
    const back=k.bone(wrist,x(.524),.018,-.129);
    swept(k,wing,'rind',[[0,0,0,.133],[x(.25),.27,.069,.148],[x(.489),.408,.039,.103],[x(.674),.413,-.022,.074]],20,12);
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?3:5),reach=.20+t*.30;
      shape(k,wing,i%2?'qiongPelt':'qiongRuff',[[x(-.038+t*.094),.032+t*.17,.076,.053,.048],
        [x(.115+t*.117),.111+t*.16,.119,.089,.071],[x(.220+t*.193),.111+t*.161,.020,.077,.058],
        [x(.257+t*.184),.047+t*.128,-reach,.037,.026],[x(.228+t*.179),-.088+t*.145,-reach-.211,.004,.006]],
      11,8,2.26,.39,i+49);
    }
    for(let i=0;i<4;i++){
      const t=i/4;
      frostVane(wing,i%2?'qiongMantle':'qiongIce',[x(.042+t*.38),.15+t*.28,.101],
        [x(.171+t*.44),.24+t*.221,-.02],[x(.233+t*.50),.066+t*.14,-.55+t*.021],.116-t*.032,i+189,mobile?9:12);
    }
    swept(k,wrist,'rind',[[0,0,0,.093],[x(.312),.105,-.038,.091],[x(.534),.016,-.132,.079]],16,12);
    swept(k,back,'trim',[[0,0,0,.109],[x(.276),-.061,-.171,.11],[x(.529),-.151,-.261,.072],
      [x(.673),-.255,-.268,.002]],16,10);
    const primaries=mobile?7:9;
    for(let i=0;i<primaries;i++){
      const t=i/(primaries-1), length=.93+.32*Math.sin(t*PI);
      const origin=[x(.616*t),-.085+t*.121,-.049-.155*t];
      const mid=[x(.63*t+.21),-.31+t*.22,-.39-length*.24];
      const tip=[x(.33+.63*t+.475*t*t),-.66+t*.45,-.49-length*.54];
      frostVane(back,i%3===0?'qiongMantle':i%2?'rind':'qiongQuill',origin,mid,tip,.146-.021*t,451+i,19);
      swept(k,back,i%2?'glow':'edge',[[origin[0],origin[1]+.025,origin[2],.014],
        [mid[0],mid[1]+.047,mid[2],.013],[tip[0],tip[1]+.009,tip[2],.002]],16,6,.10);
    }
    for(let i=0;i<9;i++){
      const t=i/8, pivot=i<=4?wing:wrist, offset=i<=4?.14:.015;
      const a=[x(offset+(i%5)*.088),.052+t*.13,.013];
      const b=[x(offset+(i%5)*.11+.026),-.102+t*.20,-.29];
      const c=[x(offset+(i%5)*.125+.073),-.36+t*.29,-.78+t*.054];
      frostVane(pivot,i%3?'qiongQuill':'rind',a,b,c,.127,320+i,13);
      frostVane(pivot,i%2?'qiongMantle':'qiongIce',[a[0],a[1]+.095,.030],
        [b[0]-x(.022),b[1]+.075,-.142],[c[0]-x(.008),c[1]+.13,c[2]+.24],.073,i,11);
    }
    for(let i=0;i<5;i++){
      const t=i/4,y=.425-t*.093;
      frostVane(body,i%2?'qiongMantle':'qiongFeather',[x(.041+t*.041),y,.17-t*.12],
        [x(.133+t*.045),y+.025,-.11-t*.09],[x(.263+t*.025),y-.12,-.43-t*.084],.105-t*.015,i+57,mobile?9:13);
    }
    wings.push({wing,wrist,back,side});
  }
  let joint=k.bone(body,0,-.099,-.69);
  for(let i=0;i<8;i++){
    const t=i/8,r=.082*(1-t)+.013,x=.018*Math.sin(i*.62),y=-.045+Math.sin(t*4.3)*.011,z=-.17;
    shape(k,joint,i%3?'qiongRuff':'qiongPale',[[0,.010,.027,r,r*.86],[x*.55,y*.40,z*.47,r*.93,r*.78],
      [x,y,z,r*.78,r*.65]],10,9,2.38,.23,i);
    for(const side of sides)swept(k,joint,i%3?'qiongPale':'qiongIce',[[side*.027,.031,.025,.019],
      [x+side*r*.61,y+.062,z*.50,.023],[x+side*r*.77,y+.026,z*.93,.017],
      [x+side*r*.92,y+.011,z-.063,.003]],9,7);
    tail.push(joint);
    joint=k.bone(joint,x,y,z);
  }
  for(let i=-1;i<=1;i++)k.geometry(joint,i%2?'qiongPale':'qiongRuff',featherVane([0,0,0],[i*.031,-.067,-.144],
    [i*.057,-.112,-.255],.034,i+4,9));
  const skin=bossSkin(k,mobile,tools=>{
    for(const {back,wing,side} of wings){
      tools.silk(back,entry.name+' · 柔翎',[[side*.156,-.065,-.087,.064],[side*.36,-.211,-.303,.103],
        [side*.506,-.442,-.609,.096],[side*.491,-.654,-.819,.011]],
      {tint:0x374469,trim:0x89abc4,phase:side*.71,style:'mane',flex:1.16,across:[1,.16,.18]});
      tools.silk(wing,entry.name+' · 腋羽',[[side*.110,.079,.040,.038],[side*.242,.114,-.111,.074],
        [side*.325,.023,-.383,.085],[side*.450,-.191,-.671,.011]],
      {tint:0x465568,trim:0x86b3c6,phase:side*.87,style:'mane',flex:1.12,across:[1,.23,.18]});
    }
    return true;
  });
  const litQuills=k.materials.qiongQuill;
  litQuills.emissive.setHex(0x39798e);
  return {body,head,pattern:'wing',crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,sourceSculpt:true,skin,
    polishEnergy:{tint:0x82cef6,shape:'mist',anchor:body,offset:[0,.28,.03],span:[1.04,.72,.87]},
    cataloguePose({headtime,wind,strike,travel,stage,step}){
      const flop=Math.sin(headtime*(5.2+stage*.8));
      head.rotation.x=-wind*.31+strike*.55+Math.sin(headtime*4.2)*.09;
      head.rotation.y=Math.sin(headtime*1.85)*.13+wind*.11;
      jaw.rotation.x=wind*.25+strike*.59;
      crown.rotation.x=.031*Math.sin(headtime*4.7)+wind*.122-strike*.194;
      litQuills.emissiveIntensity=.07+wind*.14+strike*.29+stage*.12;
      for(const {side,wing,wrist,back} of wings){
        wing.rotation.z=side*(.25+flop*(.345+travel*.38)+wind*.62-strike*.64);
        wing.rotation.y=side*(.16+wind*.54-strike*.29);
        wrist.rotation.z=side*(Math.sin(headtime*5.2-.69)*.33+wind*.37);
        wrist.rotation.y=side*(-.18-wind*.25+strike*.26);
        back.rotation.z=side*(Math.sin(headtime*5.2-.96)*.23+strike*.31);
      }
      for(const {leg,knee,heel,side,i} of legs){
        const motion=Math.cos(step+i*1.95+side*.68);
        leg.rotation.x=-.19+wind*.51+strike*.33+motion*(.12+travel*.33);
        knee.rotation.x=.25+wind*.18+travel*.18*(motion+.63);
        heel.rotation.x=-.29+knee.rotation.x*.8;
      }
      for(const [i,link] of tail.entries()){
        link.rotation.x=-.065+Math.sin(headtime*3.8-i*.47)*(.06+travel*.09);
        link.rotation.y=Math.sin(headtime*2.4-i*.57)*(.09+travel*.14)-strike*.037;
      }
  }};
}

function frozenLord(k,entry,mobile){
  const body=k.bone(k.root,0,1.1,.006),head=k.bone(body,0,.96,.069);
  const jaw=k.bone(head,0,-.096,.07);
  jaw.name='織風亭・裁燈使 · 冰結下顎';
  const robe=longGarment(k,body,{inside:'deep',accent:'rind',cloth:'brocade'},
    {length:1.17,waist:.275,panelW:.20,panels:7,seed:10});
  shape(k,body,'body',[[0,.095,-.02,.257,.178],[0,.303,.02,.277,.216],[0,.466,.008,.317,.22],
    [0,.637,.011,.363,.191],[0,.836,-.027,.290,.169],[0,.92,-.018,.15,.127]],22,15,2.48,.22);
  shape(k,head,'skull',[[0,-.105,.077,.108,.126],[0,-.051,.039,.159,.146],[0,.025,.048,.195,.147],
    [0,.151,.042,.213,.156],[0,.216,-.03,.184,.114]],17,14,2.75,.25);
  shape(k,jaw,'skull',[[0,-.116,.021,.089,.077],[0,-.076,.085,.119,.103],
    [0,-.035,.142,.138,.105],[0,.007,.075,.101,.093]],15,12,2.48,.22);
  plate(k,head,'rind',[[-.172,.147,.126],[.01,.244,.135],[.183,.137,.131],
    [.09,.139,.196],[.006,.093,.225],[-.083,.147,.197]],.045,.012);
  swept(k,head,'deep',[[0,-.047,.192,.022],[0,-.09,.210,.031],[-.011,-.108,.193,.009]],11,7);
  const arms=sides.map(side=>arm(k,body,side,{wide:.35,y:.735,cloth:'body',shell:'rind',glove:'edge'}));
  const legs=sides.map(side=>mailedLeg(k,body,side,.19));
  const blizzard=[];
  for(const side of sides){
    const x=a=>side*a;
    const shoulder=arms[side===1?1:0].shoulder;
    const eye=k.bone(head,x(.092),.019,.151);
    eye.rotation.y=x(.25);
    k.mesh(eye,'gem','deep',0,0,.034,.073,.053,.051);
    k.mesh(eye,'gem','glow',0,.006,.078,.047,.019,.012,0,0,x(.15));
    swept(k,head,'skull',[[x(.041),-.030,.195,.026],[x(.089),-.037,.203,.038],
      [x(.151),-.029,.173,.038],[x(.183),.025,.10,.027],[x(.202),.112,.041,.004]],13,9);
    for(let j=0;j<4;j++){
      const at=x(.017+j*.027),z=.157-j*j*.002;
      swept(k,head,'frostEdge',[[at,-.075,z+.047,.013],[at,-.109,z+.066,.019],[at,-.127,z+.058,.007]],7,6);
      swept(k,jaw,'skull',[[at,-.052,z-.017,.017],[at,-.023,z+.015,.018],[at,-.003,z+.009,.006]],7,6);
    }
    for(let i=0;i<5;i++){
      swept(k,head,'rind',[[x(.091+i*.020),.10,.09-i*.032,.053],
        [x(.167+i*.037),.23+i*.047,-.032-i*.023,.045],[x(.229+i*.042),.34+i*.051,-.154-i*.031,.002]],13,7,.12);
    }
    for(let i=0;i<4;i++){
      const t=i/4,y=.46+t*.42, fragment=k.bone(body,x(.23+t*.09),y,-.173-t*.021);
      blizzard.push({fragment,side,t});
      plate(k,fragment,i%2?'rind':'mica',[[x(-.06),-.112,.02],[x(.108),-.035,.028],
        [x(.34+t*.18),.158+t*.26,-.18],[x(.173),.119,-.07],[x(-.031),.042,-.019]],.050,.015);
      swept(k,fragment,'edge',[[0,-.076,.044,.016],[x(.119),.005,.030,.021],
        [x(.233),.109+t*.18,-.102,.014],[x(.337+t*.18),.161+t*.26,-.181,.002]],11,6,.17);
    }
    for(let i=0;i<4;i++){
      const y=.044-i*.076;
      plate(k,shoulder,i%2?'rind':'brocade',[
        [x(.056),y+.111,-.141],[x(.229),y+.105,-.108],[x(.271),y-.061,.011],
        [x(.166),y-.073,.176],[x(.048),y-.055,.141],
      ],.039,.014);
      swept(k,body,'trim',[[x(.044),.64-i*.093,.219,.017],[x(.194),.645-i*.08,.206,.025],
        [x(.307),.649-i*.077,.049,.003]],9,6);
    }
    const nape=k.bone(head,x(.137),.131,-.129);
    for(let i=0;i<5;i++){
      const w=.093+i*.022,h=.16-i*.069;
      plate(k,nape,i%3?'rind':'mica',[[x(.009),h+.041,-.023],[x(w*.49),h+.092,-.096],
        [x(w),h+.069,-.181],[x(w*1.07),h-.047,-.257],[x(w*.64),h-.123,-.222],
        [x(.008),h-.092,-.069]],.031,.014);
      swept(k,nape,'frostEdge',[[x(.033),h+.050,-.064,.013],[x(w*.61),h+.071,-.144,.019],
        [x(w*.94),h-.027,-.233,.014],[x(w*.97),h-.08,-.247,.004]],9,7);
    }
  }
  const blade=k.bone(arms[1].palm,.025,-.037,.026);
  markEnemyWeapon(blade,[.037,1.418,-.036],{width:.155});
  swept(k,blade,'deep',[[0,-.36,-.005,.051],[.006,-.19,-.002,.059],[0,.04,0,.053],[0,.19,0,.053]],16,9,.25);
  plate(k,blade,'rind',[[-.148,.127,.012],[.148,.108,.016],[.113,.253,.023],[.09,.68,-.034],
    [.088,1.131,-.054],[.037,1.418,-.036],[-.055,1.299,-.052],[-.103,.981,-.049],[-.125,.584,-.025]],.086,.019);
  swept(k,blade,'glow',[[0,.215,.071,.017],[-.008,.47,.041,.013],[.027,.728,.028,.016],
    [.029,.961,.015,.011],[.014,1.23,.001,.007],[.039,1.402,-.025,.002]],23,6);
  for(const side of sides)swept(k,blade,'edge',[[side*.055,.14,.012,.032],[side*.204,.135,.013,.045],
    [side*.278,.345,.012,.030],[side*.26,.423,-.023,.003]],11,7);
  return {body,head,arms:arms.map(s=>s.shoulder),legs:legs.map(s=>s.thigh),crest:k.bone(body,0,0,0),
    catalogueSculpt:entry.id,frozenMandible:true,cataloguePose(pose){
      const {beat,headtime,wind,strike,step,travel,stage}=pose;
      garmentMotion({...robe,arms},pose,{reach:.73,stroke:1.02});
      head.rotation.y=Math.sin(beat*.46)*.079-wind*.22;
      jaw.rotation.x=.028+wind*.26+strike*.48+stage*.028;
      blade.rotation.y=-wind*.58+strike*.87;
      blade.rotation.z=.19+wind*.86-strike*1.37;
      for(const {shin,side} of legs)shin.rotation.x=Math.sin(step+side*PI*.52)*travel*.45;
      for(const {fragment,side,t} of blizzard){
        fragment.rotation.y=side*(.02+wind*.14+stage*.21+Math.sin(headtime*(2+t))*.083);
        fragment.rotation.x=Math.cos(beat*.54+t*3.9)*.098+strike*.15;
      }
  }};
}

function mandrillLeg(k,body,side,mobile){
  const p=points=>points.map(([x,...rest])=>[side*x,...rest]);
  const thigh=k.bone(body,side*.218,.05,.015),shin=k.bone(thigh,side*.065,-.41,.063);
  shape(k,thigh,'mandrillLeather',p([[-.015,.064,-.057,.158,.142],[.034,-.066,-.031,.178,.146],
    [.064,-.227,.045,.144,.121],[.061,-.421,.070,.113,.107]]),17,14,2.42,.25);
  shape(k,shin,'mandrillHide',p([[0,.056,-.044,.111,.107],[.033,-.066,-.013,.131,.112],
    [.044,-.245,.043,.104,.092],[.036,-.377,.086,.091,.072]]),16,13,2.55,.24);
  const toe=k.bone(shin,side*.041,-.381,.112);
  shape(k,toe,'mandrillHide',p([[0,.021,-.047,.071,.054],[.013,-.018,.024,.103,.062],
    [.025,-.045,.096,.112,.058],[.023,-.057,.166,.072,.026]]),13,10,2.41,.26);
  for(let i=0;i<4;i++){
    const x=(i-1.4)*.044,z=.117+Math.sin(i*.88)*.021;
    swept(k,toe,'mandrillIvory',p([[x,-.034,z,.026],[x+.008,-.051,z+.047,.024],
      [x+.019,-.070,z+.073,.003]]),9,7);
  }
  const kneecap=p([[-.117,.077,.084],[.029,.156,.098],[.117,.086,.023],[.135,-.009,.026],
    [.103,-.131,.145],[.038,-.156,.172],[-.096,-.062,.143]]);
  plate(k,shin,'mandrillLeather',kneecap,.041,.013);
  swept(k,shin,'mandrillIvory',kneecap.slice(1,6).map(([x,y,z])=>[x,y+.011,z+.02,.014]),10,7);
  for(let row=0;row<(mobile?3:4);row++){
    const y=-.13-row*.073,edge=p([[.052,y+.049,.12],[.126,y+.030,.091],[.152,y-.056,.021],
      [.093,y-.094,-.067],[.030,y-.046,-.046],[.035,y-.006,.079]]);
    plate(k,shin,row%2?'mandrillLeather':'rind',edge,.030,.011);
    swept(k,shin,'trim',edge.slice(0,5).map(([x,y,z])=>[x,y+.011,z,.010]),9,7);
  }
  return {thigh,shin,toe,side};
}

function mandrill(k,entry,mobile){
  const body=k.bone(k.root,0,1.26,0),head=k.bone(body,0,.75,.15);
  shape(k,body,'hide',[[0,-.435,-.06,.355,.256],[0,-.123,-.026,.35,.263],[0,.113,.05,.416,.315],
    [0,.35,.058,.53,.303],[0,.56,-.027,.585,.288],[0,.68,-.053,.37,.211],[0,.743,0,.192,.173]],24,19,2.5,.25);
  const robe=longGarment(k,body,{inside:'deep',accent:'rind',cloth:'brocade'},
    {length:.84,waist:.347,panelW:.217,panels:7,seed:21});
  const beaded=k.bone(body,0,.567,.025);
  for(let i=0;i<15;i++){
    const a=i*TAU/15;
    k.mesh(beaded,'round','hair',Math.sin(a)*.37,Math.cos(a)*.123-.071,Math.cos(a)*.301,.065,.057,.064);
    k.mesh(beaded,'gem','trim',Math.sin(a)*.37+.016,Math.cos(a)*.123-.046,Math.cos(a)*.302+.051,.021,.016,.008);
  }
  shape(k,head,'hair',[[0,-.181,.04,.148,.14],[0,-.127,-.025,.197,.186],[0,.028,-.036,.25,.214],
    [0,.193,-.083,.243,.192],[0,.305,-.092,.152,.137]],21,17,2.51,.25);
  const jaw=k.bone(head,0,-.151,.131);
  shape(k,jaw,'rind',[[0,-.096,.028,.112,.081],[0,-.004,.079,.153,.075],
    [0,.06,.095,.153,.064]],14,12,2.49,.15);
  const legs=sides.map(side=>mandrillLeg(k,body,side,mobile)),arms=[];
  for(const side of sides){
    const x=a=>side*a;
    const shoulder=k.bone(body,x(.449),.529,.014);
    const elbow=k.bone(shoulder,x(.24),-.32,-.022);
    const palm=k.bone(elbow,x(.04),-.39,.06);
    arms.push({shoulder,elbow,palm,side});
    shape(k,shoulder,'mandrillHide',[[x(-.119),.101,-.053,.121,.130],[x(-.014),.107,-.042,.163,.142],
      [x(.106),.046,-.021,.197,.159],[x(.177),-.067,.041,.170,.148],
      [x(.215),-.193,.03,.140,.123],[x(.237),-.332,-.028,.128,.120]],20,16,2.3,.29);
    shape(k,elbow,'mandrillHide',[[x(-.024),.097,-.074,.106,.090],[0,.019,-.034,.129,.111],
      [x(.025),-.092,-.022,.162,.145],[x(.052),-.225,.023,.143,.130],[x(.043),-.324,.060,.122,.115],
      [x(.041),-.420,.099,.100,.087]],18,14,2.37,.32);
    shape(k,palm,'mandrillHide',[[0,.068,0,.104,.085],[x(.013),-.032,.035,.143,.117],
      [x(.038),-.11,.08,.105,.065]],12,13,2.54,.28);
    shape(k,shoulder,'hide',[[x(.007),.111,-.075,.066,.073],[x(.073),.071,-.109,.116,.078],
      [x(.149),-.022,-.155,.106,.064],[x(.193),-.172,-.119,.073,.061],[x(.219),-.247,-.083,.028,.022]],18,13,2.6,.22);
    shape(k,elbow,'rind',[[x(.002),.078,-.031,.057,.049],[x(.046),.014,-.120,.092,.062],
      [x(.073),-.096,-.158,.112,.062],[x(.068),-.209,-.101,.078,.051],[x(.040),-.332,-.037,.028,.019]],16,14,2.7,.26);
    const tattoo=Array.from({length:20},(_,i)=>{
      const t=i/19,r=.111*(1-t*.92),a=(.17+t*1.39)*TAU;
      return [x(.103+Math.cos(a)*r),.023+Math.sin(a)*r*.84,.176+.029*Math.sin(t*Math.PI),.015-t*.009];
    });
    swept(k,shoulder,'mandrillInk',tattoo,22,7,.16);
    const chestEdge=[[x(.023),.538,.241,.015],[x(.130),.527,.288,.023],[x(.278),.482,.279,.030],
      [x(.386),.391,.187,.029],[x(.471),.336,.072,.017],[x(.518),.278,-.021,.003]];
    swept(k,body,'mandrillInk',chestEdge,16,7,.13);
    const wrist=[[x(-.093),-.139,.131],[x(.030),-.106,.170],[x(.148),-.141,.159],
      [x(.161),-.290,.115],[x(.067),-.361,.134],[x(-.093),-.322,.152]];
    plate(k,elbow,'mandrillLeather',wrist,.051,.016);
    swept(k,elbow,'mandrillIvory',[...wrist,wrist[0]].map(([x,y,z])=>[x,y,z+.030,.019]),18,8,.18);
    for(let j=0;j<3;j++)swept(k,elbow,'mandrillIvory',[[x(-.070+j*.043),-.278,.183,.008],
      [x(-.044+j*.040),-.217,.196,.014],[x(-.022+j*.041),-.168,.196,.010]],8,6);
    for(let i=0;i<4;i++){
      const dx=x((i-1.5)*.059);
      shape(k,palm,'mandrillHide',[[dx,-.052,.093,.037,.034],[dx+x(.017),-.114,.165,.039,.039],
        [dx+x(.026),-.160,.177,.029,.032],[dx+x(.028),-.184,.149,.016,.018]],12,8,2.25,.29,i);
      swept(k,palm,'mandrillInk',[[dx-x(.015),-.104,.150,.005],[dx+x(.007),-.128,.192,.009],
        [dx+x(.029),-.127,.175,.005]],8,7,.18);
      swept(k,jaw,'edge',[[x(.022+i*.036),.019,.136,.012],[x(.026+i*.038),.064,.135,.011],
        [x(.025+i*.044),.085+i*.007,.118,.002]],7,6);
      swept(k,head,'rind',[[x(.012+i*.022),-.022+i*.04,.185,.022],[x(.107+i*.015),.045+i*.031,.207,.037],
        [x(.209+i*.018),.077+i*.038,.104,.032],[x(.261+i*.013),.114+i*.038,-.004,.004]],12,7);
      swept(k,head,'hair',[[x(.02+i*.03),.273-i*.009,.019,.071],[x(.04+i*.05),.403-i*.028,-.052,.076],
        [x(.13+i*.052),.51-i*.050,-.247,.058],[x(.163+i*.054),.41-i*.039,-.329,.005]],16,8,.33);
      const band=k.bone(elbow,x(.044),-.15-i*.058,.055);
      band.rotation.x=PI/2-.1;
      ring(k,band,i%3?'trim':'rind',.176-i*.011,.023,22);
    }
    k.mesh(head,'gem','glow',x(.105),.041,.217,.037,.021,.023,-.03,x(.35),-x(.21));
    k.mesh(shoulder,'gem','brocade',x(.130),.009,.214,.096,.085,.022,.012,x(.3));
    swept(k,head,'deep',[[x(.038),-.091,.124,.053],[x(.12),-.19,.148,.064],
      [x(.12),-.34,.134,.047],[x(.071),-.416,.119,.004]],15,8);
  }
  const bat=k.bone(arms[1].palm,.015,-.034,.091);
  bat.rotation.z=-.09;bat.rotation.x=.12;
  shape(k,bat,'hair',[[0,-.47,.008,.065,.069],[.013,-.185,.025,.077,.073],[-.01,.15,.01,.072,.076],
    [-.033,.373,-.017,.123,.131],[-.035,.785,-.036,.196,.172],[-.026,1.095,-.017,.161,.178],
    [0,1.207,.031,.105,.093]],23,14,2.78,.28);
  for(let i=0;i<6;i++){
    const b=k.bone(bat,-.031,.53+i*.112,-.028);
    b.rotation.x=PI/2;ring(k,b,i%2?'deep':'trim',.137+Math.sin(i*.54)*.049,.028,24);
    for(const side of sides)swept(k,b,'rind',[[side*.129,0,0,.057],
      [side*.201,.041,.004,.051],[side*.275,.071,.012,.003]],9,7,.18);
  }
  return {body,head,legs:legs.map(s=>s.thigh),crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'slam',
    cataloguePose(pose){
      const {headtime,wind,strike,step,travel}=pose;
      garmentMotion({...robe,arms},pose,{reach:.55,stroke:.76});
      head.rotation.x=Math.sin(headtime*3.2)*.074-wind*.30+strike*.42;
      jaw.rotation.x=wind*.26+strike*.59;
      beaded.rotation.x=Math.sin(headtime*4.9)*.077+travel*.068+strike*.24;
      for(const {shoulder,elbow,side} of arms){
        shoulder.rotation.z=side*(.16+wind*.21+strike*(side===1?.32:.09));
        shoulder.rotation.x=Math.cos(step+side*PI*.5)*travel*.2+wind*(side===1?-1.12:-.57)+strike*(side===1?1.73:.49);
        elbow.rotation.z=side*(.07+wind*.39-strike*.27);
      }
      bat.rotation.x=-.37-wind*.50+strike*.21;
      for(const {shin,toe,side} of legs){
        shin.rotation.x=Math.sin(step+side*PI*.5)*travel*.37;
        toe.rotation.x=-shin.rotation.x*.41+wind*.07-strike*.08;
      }
  }};
}

function ancientYeti(k,entry,mobile){
  const body=k.bone(k.root,0,.94,-.019),head=k.bone(body,0,.473,.469);
  const pelt=(part,finish,path,seed,section=2.2,resolution={})=>k.geometry(part,finish,sculptVolume(path,
    {sides:mobile?7:10,rings:mobile?9:13,section,ridge:.24,fur:true,seed,...resolution}));
  pelt(body,'yetiShade',[[0,-.278,-.103,.392,.32],[0,.022,-.11,.570,.416],
    [0,.337,-.087,.675,.465],[0,.62,-.134,.546,.461],[0,.834,-.172,.350,.328],
    [0,.925,-.28,.22,.201]],15,2.44,{sides:mobile?19:25,rings:mobile?21:27});
  const jaw=sculptYetiJaw(k,head,mobile);
  const ribs=[],arms=[],legs=[],ruff=k.bone(body,0,.345,.26);
  const coatCount=mobile?4:6;
  for(const [face,count] of [[1,coatCount],[-1,coatCount+1]])for(const side of sides){
    for(let i=0;i<count;i++){
      const t=i/(count-1),wave=Math.sin(i*2.3+side*.24);
      const x=side*(.055+t*.47),y=(face>0?.64:.743)-t*.26,z=face>0?.373-.064*t:-(.53-.05*t);
      const width=.066+Math.sin(t*2.7)*.044,tip=.31-.078*t+wave*.040;
      const coat=i%3===1?'yetiFrost':i%3===2?'hide':'yetiWool';
      iceFur(k,body,coat,[[x,y,z-face*.06,width*.62,.041],
        [x*1.02,y-tip*.21,z+face*.067,width,.065],
        [x+side*.059,y-tip*.60,z+face*.087,width*.81,.052],
        [x+side*.084,y-tip,z+face*.075,.004,.008]],mobile,i+side*2);
      const split=x+side*(.021+width*.27),drop=tip*.49,z2=z+face*.065;
      pelt(body,i%2?'yetiWool':'yetiFrost',[[split,y-.20,z2-face*.018,width*.44,.031],
        [split+side*.015,y-.23-drop*.28,z2+face*.047,width*.59,.039],
        [split+side*.043,y-.29-drop*.51,z2+face*.059,width*.41,.031],
        [split+side*.050,y-.31-drop*.84,z2+face*.072,.003,.005]],i*1.31+side);
    }
  }
  for(const side of sides){
    const x=a=>side*a;
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/(mobile?4:6),spread=.092+t*.42,phase=Math.sin(i*2.68)*.027;
      carveYetiRuff(k,body,[[spread-.018,.325-t*.110,-.506+phase,.050,.039],
        [spread+.032,.196-t*.094,-.572+phase,.071,.053],
        [spread+.077,.054-t*.037,-.563+phase,.068,.048],
        [spread+.089,-.147+t*.093,-.479+phase,.019,.026],
        [spread+.061,-.187+t*.073,-.453+phase,.004,.006]],mobile,side,i+86);
      if(i<4){
        const t=i/3,y=.131-t*.082,n=.108+t*.107;
        fineYetiTuft(k,body,i%2?'yetiWool':'hide',[[x(n-.008),y+.115,.295,.055,.042],
          [x(n+.038),y+.051,.393,.074,.047],[x(n+.098),y-.048,.402,.063,.038],
          [x(n+.136),y-.122,.370,.029,.027],[x(n+.151),y-.153,.357,.004,.005]],mobile,side,i+97);
      }
    }
    const horn=k.bone(head,x(.121),.088,.094);
    const points=[[0,-.070,.013,.082],[x(.058),.096,.007,.086],[x(.143),.251,-.037,.074],
      [x(.230),.399,-.088,.054],[x(.271),.545,-.158,.025],[x(.282),.626,-.182,.003]];
    shape(k,horn,'yetiHorn',points.map(([a,b,c,r])=>[a,b,c,r,r*.77]),20,10,3.1,.29);
    const curve=new T.CatmullRomCurve3(points.map(([a,b,c])=>vector([a,b,c])));
    for(let i=0;i<7;i++){
      const t=(i+.68)/8;
      const p=curve.getPointAt(t);
      const r=.074-t*.048;
      const crest=[[p.x-x(r*.59),p.y-.037,p.z+r*.45],[p.x-x(r*.32),p.y+.008,p.z+r*.80],
        [p.x+x(r*.48),p.y+.017,p.z+r*.62],[p.x+x(r*.72),p.y-.026,p.z+r*.14],
        [p.x+x(r*.24),p.y-.047,p.z+r*.42]];
      plate(k,horn,i%4?'yetiHornLight':'copper',crest,.022,.006);
    }
    const shoulder=k.bone(body,x(.488),.441,.034);
    const elbow=k.bone(shoulder,x(.417),-.238,.071);
    const paw=k.bone(elbow,x(.178),-.449,.173);
    pelt(shoulder,'yetiShade',[[x(-.175),.096,-.082,.202,.187],[x(-.029),.132,-.057,.233,.218],
      [x(.139),.099,-.021,.282,.228],[x(.286),-.021,.017,.247,.202],
      [x(.367),-.106,.031,.197,.163],[x(.427),-.220,.042,.155,.143]],19,2.39,
    {rings:18,sides:mobile?15:19});
    pelt(elbow,'yetiShade',[[x(-.048),.094,-.062,.142,.133],[0,.015,-.008,.168,.153],
      [x(.058),-.115,.034,.183,.172],[x(.127),-.236,.097,.169,.147],
      [x(.172),-.420,.157,.136,.119]],21,2.39,{rings:17,sides:mobile?15:19});
    pelt(paw,'hide',[[0,.097,-.045,.136,.104],[x(.029),.018,.039,.171,.133],
      [x(.047),-.099,.097,.161,.111],[x(.037),-.192,.169,.108,.078]],24,2.49,
    {rings:14,sides:mobile?12:16});
    for(let i=0;i<(mobile?4:6);i++){
      const t=i/(mobile?3:5),z=-.130+t*.261,y=.191+Math.sin(t*Math.PI)*.065;
      carveYetiRuff(k,shoulder,[[-.125+t*.051,y-.019,z-.071,.058,.047],
        [.066+t*.066,y+.041,z-.025,.086,.058],[.218+t*.089,y+.016,z+.051,.086,.055],
        [.332+t*.107,y-.098,z+.094,.046,.037],[.357+t*.084,y-.216,z+.139,.004,.007]],mobile,side,i+103);
    }
    for(let i=0;i<5;i++){
      const t=i*.2,z=-.217+t*.113,y=.189-t*.076;
      const scapula=[[x(-.163+t*.071),y+.097,z-.03],[x(.023+t*.083),y+.103,z-.09],
        [x(.169+t*.127),y+.073,z-.138],[x(.280+t*.147),y-.126,z-.129],
        [x(.352+t*.107),y-.233,z-.036]];
      const lock=scapula.map(([x,y,z],j)=>[x,y,z,[.048,.081,.085,.061,.004][j],[.037,.055,.062,.048,.005][j]]);
      carveYetiRuff(k,shoulder,lock.map(([x,y,z,w,d])=>[x*side,y,z,w,d]),mobile,side,i+32);
      carveYetiRuff(k,body,[[.029+t*.079,.578-t*.189,-.340-t*.080,.069,.043],
        [.263+t*.051,.44-t*.19,-.488-t*.053,.087,.057],[.408+t*.106,.308-t*.180,-.541+t*.042,.064,.046],
        [.522+t*.043,.212-t*.236,-.512+t*.11,.004,.006]],mobile,side,i+12);
    }
    for(let i=0;i<(mobile?5:7);i++){
      const t=i/(mobile?4:6),lean=Math.cos(t*PI)*.061;
      const flank=.12+t*.22,top=.117-t*.063,front=.145+t*.071;
      const tone=i%3===0?'yetiFrost':i%3===1?'yetiWool':'hide';
      iceFur(k,shoulder,tone,[[x(flank-.033),top,front-.073,.052,.038],
        [x(flank+.033),top-.085,front+.023,.071,.058],
        [x(flank+.112),top-.19,front+.071,.049,.049],
        [x(flank+.177),top-.29+lean,front+.033,.004,.005]],mobile,1.9+i);
      const bend=.066+t*.129,armZ=-.018+t*.333;
      fineYetiTuft(k,elbow,tone,[[x(bend-.016),-.041,armZ-.015,.055,.041],
        [x(bend+.087),-.160,armZ+.041,.063,.049],
        [x(bend+.133),-.303,armZ+.090,.060,.041],
        [x(bend+.151),-.367,armZ+.113,.036,.029],
        [x(bend+.162),-.479+lean,armZ+.149,.003,.004]],mobile,side,i+4.1);
      if(i%2===0)pelt(paw,i%4?'yetiFrost':'yetiWool',[[x(-.09+t*.135),.034,.105,.036,.026],
        [x(-.08+t*.168),-.047,.175,.039,.029],
        [x(-.04+t*.19),-.139,.240,.021,.019],[x(.012+t*.181),-.20,.269,.003,.004]],12+i);
    }
    const thigh=k.bone(body,x(.357),-.301,-.107);
    const calf=k.bone(thigh,x(.098),-.322,.116);
    const foot=k.bone(calf,x(.034),-.232,.142);
    pelt(thigh,'yetiShade',[[x(-.057),.139,-.143,.174,.136],[x(.006),.062,-.078,.213,.165],
      [x(.032),-.074,-.028,.209,.162],[x(.071),-.204,.043,.168,.142],
      [x(.091),-.331,.101,.117,.113]],56,2.46,{rings:16,sides:mobile?12:15});
    pelt(calf,'hide',[[0,.071,-.051,.117,.118],[x(.013),.012,-.041,.143,.134],[x(.035),-.079,.000,.156,.128],
      [x(.046),-.209,.082,.131,.115],[x(.037),-.260,.148,.100,.079]],56,2.56,{rings:15,sides:mobile?13:17});
    pelt(foot,'yetiShade',[[0,.033,-.032,.087,.073],[x(.025),-.002,.035,.141,.081],
      [x(.034),-.027,.119,.148,.068],[x(.027),-.051,.186,.091,.035]],61);
    for(let i=0;i<5;i++){
      const t=i/4;
      pelt(thigh,i%2?'yetiFrost':'yetiWool',[[x(.037+t*.104),.059-t*.047,-.112+t*.055,.071,.046],
        [x(.087+t*.141),-.045-t*.038,-.151+t*.051,.078,.063],
        [x(.145+t*.129),-.186-t*.035,-.098+t*.073,.053,.042],
        [x(.185+t*.07),-.312-t*.056,.017+t*.047,.005,.006]],65+i);
      pelt(calf,i%3?'yetiWool':'yetiFrost',[[x(.034+t*.071),.053-t*.014,-.105+t*.058,.043,.033],
        [x(.101+t*.064),-.032-t*.016,-.141+t*.079,.063,.045],
        [x(.151+t*.036),-.127-t*.038,-.080+t*.092,.047,.036],
        [x(.160+t*.024),-.219-t*.034,.012+t*.086,.004,.005]],69+i);
    }
    const fingers=[];
    for(let i=0;i<4;i++){
      const dy=(i-1.5)*.041, finger=k.bone(paw,x((i-1.5)*.073),-.142+dy,.112+(i===1?.041:0));
      sculptYetiFinger(k,finger,side,mobile);
      const toe=.029+(i-1.5)*.063,z=.108-Math.abs(i-1.7)*.019;
      pelt(foot,i%2?'yetiWool':'hide',[[x(toe),-.021,z,.040,.041],[x(toe+.012),-.039,z+.069,.040,.035],
        [x(toe+.025),-.049,z+.121,.026,.018]],78+i);
      swept(k,foot,'yetiClaw',[[x(toe+.022),-.040,z+.106,.032],[x(toe+.033),-.052,z+.147,.023],
        [x(toe+.028),-.078,z+.207,.003]],11,7,.23);
      fingers.push(finger);
    }
    const count=mobile?6:8;
    for(let i=0;i<count;i++){
      const t=i/(count-1);
      const tuft=k.bone(shoulder,x(.11+t*.26),.21-t*.11,-.17+t*.36);
      ribs.push({tuft,i,side});
      carveYetiRuff(k,tuft,[[0,-.052,.025,.060,.047],[.125+t*.045,.051+t*.026,-.091,.099,.056],
        [.255+t*.088,-.011+t*.071,-.192-t*.055,.071,.047],[.347+t*.11,-.036+t*.076,-.258-t*.082,.006,.007]],mobile,side,31+i);
      swept(k,tuft,i%2?'yetiHorn':'yetiHornLight',[[x(.051),.032,-.071,.036],[x(.110),.13,-.124,.028],
        [x(.158),.221,-.187,.003]],11,7);
      const r=.36+.07*Math.sin(t*PI);
      iceFur(k,body,i%4?'yetiWool':'yetiShade',[[x(.14+t*.11),.78-t*.19,-.271-t*.15,.056,.045],
        [x(.29+t*.15),.9-t*.43,-.401-t*.10,.082,.053],[x(r+t*.18),.85-t*.60,-.58-t*.15,.048,.040],
        [x(r+t*.24),.82-t*.73,-.64-t*.18,.004,.008]],mobile,51+i);
    }
    arms.push({shoulder,elbow,paw,fingers,side});
    legs.push({thigh,calf,foot,side});
  }
  const mane=k.bone(head,0,.19,-.14);
  for(let i=-2;i<=2;i++){
    const q=i*.059;
    iceFur(k,body,i%2?'yetiRib':'hide',[[q,.626,-.091,.046,.053],[q*1.38,.819,-.182,.083,.059],
      [q*1.81,.928-Math.abs(i)*.023,-.325,.063,.042],[q*1.90,1.083-Math.abs(i)*.051,-.485,.004,.007]],mobile,i+110);
  }
  for(let i=-4;i<=4;i++){
    const t=i/4,w=.069-Math.abs(t)*.015;
    iceFur(k,mane,i%2?'yetiWool':'yetiFrost',[[t*.112,-.026,.134,w*.61,.039],[t*.166,.147,-.061,w,.051],
      [t*.225,.285-Math.abs(t)*.075,-.167,w*.76,.043],
      [t*.320,.425-Math.abs(t)*.175,-.349-Math.abs(t)*.066,.006,.007]],mobile,i+62);
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'crawl',sourceSculpt:true,grounded:true,
    sourceDress(tools){
      for(const side of sides){
        const x=value=>side*value;
        tools.silk(ruff,entry.name+' · 垂霜胸鬃',[[x(.086),.116,.044,.059],[x(.127),-.005,.105,.084],
          [x(.202),-.152,.143,.064],[x(.226),-.297,.110,.009]],
        {tint:0x83919e,trim:0xb6c5ca,phase:side*.62,style:'mane',flex:1.12,across:[.88,.19,.26]});
        const arm=arms.find(arm=>arm.side===side);
        tools.silk(arm.elbow,entry.name+' · 肘雪絨',[[x(.097),-.095,-.084,.047],[x(.189),-.204,-.030,.075],
          [x(.263),-.344,.055,.070],[x(.285),-.471,.153,.008]],
        {tint:0x758595,trim:0xb0b8c1,phase:side*.85,style:'mane',flex:.94,across:[.15,.49,.73]});
      }
      return true;
    },
    polishEnergy:{tint:0xb6d0d8,shape:'mist',anchor:body,offset:[0,.27,.04],span:[.87,.60,.80]},
    cataloguePose({beat,headtime,wind,strike,travel,step,stage}){
      body.rotation.x=.197+wind*.21-strike*.30+Math.sin(beat*.47)*.047;
      head.rotation.x=-.10-wind*.39+strike*.46;
      head.rotation.y=Math.sin(headtime*2.8)*.085+wind*.15-strike*.27;
      jaw.rotation.x=.30+Math.sin(beat*.83)*.049+wind*.36+strike*.69+stage*.08;
      mane.rotation.x=Math.sin(beat*.62)*.052+travel*.11+strike*.25;
      ruff.rotation.x=Math.sin(beat*.84)*.041-wind*.19+strike*.32;
      for(const {shoulder,elbow,paw,fingers,side} of arms){
        const pace=Math.sin(step+side*PI*.5)*travel;
        shoulder.rotation.x=pace*.56-wind*.67+strike*.82;
        shoulder.rotation.z=side*(.16+wind*.24-strike*.19);
        elbow.rotation.x=-.23+Math.max(0,pace)*.48+wind*.23-strike*.38;
        paw.rotation.x=.11-wind*.36+strike*.49;
        for(const [i,finger] of fingers.entries())finger.rotation.x=Math.cos(beat*.8+i*.7)*.071+wind*.27-strike*.37;
      }
      for(const {thigh,calf,foot,side} of legs){
        const pace=Math.cos(step+side*PI*.5)*travel;
        thigh.rotation.x=-.11+pace*.35+wind*.13;
        calf.rotation.x=Math.max(0,pace)*.27+wind*.17-strike*.22;
        foot.rotation.x=-.47*calf.rotation.x-strike*.079;
      }
      for(const {tuft,i,side} of ribs)tuft.rotation.z=side*(Math.sin(beat+i*.34)*.052+wind*.12-strike*.16);
  }};
}

export const catalogueFinishes={
  m001:{rind:[0x75437c,.47,.45,'iron'],snakeBelly:[0xbca594,.18,.66,'bone']},
  m002:{rind:[0x922577,.22,.43,'hide'],snakeBelly:[0xb4a879,.18,.60,'hide']},
  m008:{rind:[0x1d7051,.42,.43,'iron'],brocade:[0x355b32,.11,.66,'cloth'],complexion:[0x977462,.06,.70,'hide']},
  m016:{...durgaFinishes,rind:[0x9e7c4c,.64,.54,'iron'],brocade:[0xb85b37,.08,.64,'cloth'],crest:[0xbcb1a2,.35,.6,'bone'],
    sculptStone:[0x988270,.12,.67,'stone']},
  m017:{...relicFinishes,rind:[0x673d23,.62,.46,'iron'],brocade:[0xb26b23,.15,.57,'cloth'],crest:[0x968476,.40,.57,'iron'],
    sculptAsh:[0x898681,.09,.68,'stone']},
  m021:{rind:[0x458f97,.47,.42,'iron'],brocade:[0x8f261a,.17,.58,'cloth'],crest:[0xcbd1cd,.05,.78,'bone'],
    porcelain:[0xcac2ad,.09,.65,'bone']},
  m097:{rind:[0x5b9ca6,.66,.4,'iron'],brocade:[0x1c2c46,.27,.62,'cloth'],mica:[0x94c7cb,.40,.37,'gem'],
    skull:[0x8baba6,.23,.62,'bone']},
  m101:{rind:[0x9d3c08,.22,.52,'stone'],brocade:[0xa54a20,.10,.66,'cloth'],crest:[0x99704c,.06,.86,'hide']},
  m107:{rind:[0x49372f,.52,.53,'iron'],brocade:[0x772f26,.14,.58,'cloth']},
  m109:{...relicFinishes,rind:[0xb46f2c,.52,.49,'bronze'],brocade:[0xa44524,.16,.56,'cloth'],crest:[0xddd3b3,.14,.58,'bone']},
  m117:{asuraRed:[0x853e31,.08,.73,'hide'],asuraGold:[0x9b6e43,.66,.44,'bronze'],
    asuraNavy:[0x26344c,.11,.72,'cloth'],asuraIvory:[0xc3b6a0,.28,.58,'bone'],
    asuraTrim:[0xceb285,.68,.42,'bronze']},
  m148:{...qiongFaceFinishes,rind:[0x2d3f54,.42,.52,'iron'],brocade:[0x15336a,.38,.49,'hide'],ember:[0xcd7850,.14,.49,'bone'],
    trim:[0x4c6a84,.39,.55,'iron'],qiongFeather:[0x495775,.10,.71,'hide'],
    qiongIce:[0x9db8ca,.14,.59,'bone'],qiongQuill:[0x568eae,.23,.45,'hide'],
    qiongMantle:[0x8099b6,.25,.46,'hide']},
  m151:{...hornetRefitFinishes},
  m153:{rind:[0x282c4e,.54,.48,'iron'],brocade:[0x33213b,.14,.69,'cloth'],
    shadowIron:[0x363846,.67,.46,'iron'],shadowIvory:[0x746e72,.44,.56,'bone']},
  m156:thatchedWraithFinishes,
  m157:{rind:[0x9e4d41,.21,.5,'hide'],brocade:[0x862d36,.24,.57,'cloth'],hide:[0xa55654,.09,.69,'hide'],
    hair:[0x2a2728,.10,.72,'hide'],mandrillHide:[0x9d544d,.05,.78,'hide'],
    mandrillLeather:[0x543438,.14,.68,'hide'],mandrillIvory:[0xc0a585,.21,.58,'bone'],
    mandrillInk:[0x4e2632,.04,.82,'hide']},
  m158:{...yetiAnatomyFinishes,rind:[0x633324,.41,.56,'bronze'],copper:[0xa4543d,.42,.51,'bronze'],hide:[0x758491,.06,.85,'hide'],
    yetiWool:[0x91a6ae,.06,.84,'cloth'],yetiFrost:[0xb5c7c8,.03,.79,'cloth'],
    yetiShade:[0x58636f,.04,.86,'hide']},
};
for(const [id,finishes] of Object.entries(legacyCFinishes))Object.assign(catalogueFinishes[id],finishes);

const sculpts={
  m001:snake,m002:snake,m008:royalMedium,m016:forgeDurga,m017:knightRelic,m021:royalMedium,
  m097:frozenLord,m101:abbot,m107:captain,m109:knightRelic,m117:sculptAsuraDisciple,m148:qiongqi,m151:sculptKingHornet,m153:shadowReaper,
  m156:carveThatchedWraith,m157:mandrill,m158:ancientYeti,
};

export function catalogueSculpt(kit,entry,mobile){
  const parts=sculpts[entry.id]?.(kit,entry,mobile);
  if(parts&&entry.id!=='m156'&&!['m148','m151','m158'].includes(entry.id))legacyCDetail(kit,entry,parts,mobile);
  return parts;
}
