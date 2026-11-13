import * as T from '../three.min.mjs';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';
import {legacyCDetail,legacyCFinishes} from './catalogue-c-legacy.mjs?v=penumbra-1';

const PI=Math.PI,TAU=PI*2;
const sides=[-1,1];
const shape=(k,part,finish,sections,rings=13,sides=10,section=2.15,ridge=.16,seed=0)=>
  k.geometry(part,finish,sculptVolume(sections,{rings,sides,section,ridge,seed}));
const swept=(k,part,finish,points,steps=13,sides=8,ridge=.24)=>
  k.sculpt.sweep(part,finish,points,{steps,sides,ridge});
const plate=(k,part,finish,points,thick=.05,bevel=.016)=>k.sculpt.plate(part,finish,points,thick,bevel);
const vector=point=>new T.Vector3(...point);

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
    plate(k,face,i%4===1?'trim':'edge',[
      [-section*.78,-.038,0],[0,-.056,.018],[section*.78,-.038,0],[section*.71,.043,-.014],
      [0,.057,.013],[-section*.71,.043,-.014],
    ],.024,.009);
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
  }
  shape(k,jaw,'edge',[[0,-.025,-.06,.135,.036],[0,-.045,.059,.129,.048],[0,-.062,.201,.062,.025]],13,11,2.5,.14);
  const orb=k.bone(head,.24,-.26,.42);
  k.mesh(orb,'round','glow',0,0,0,.053,.053,.053);
  k.mesh(orb,'ring','rind',0,0,0,.097,.097,.32,.7,.68);
  return {body,pattern:'coil',crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,cataloguePose({travel,headtime,wind,strike,stage}) {
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

function garmentMotion({panels,skirt,arms},pose,motion={}){
  const {beat,wind,strike,travel}=pose;
  skirt.rotation.x=travel*.14-wind*.085+strike*.11;
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
  face(k,head,{hair:reaper?'crest':'deep',human:!reaper});
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

function knightRelic(k,entry){
  const sun=entry.id==='m016';
  const yaksha=entry.id==='m109';
  const body=k.bone(k.root,0,1.00,0),head=k.bone(body,0,.94,.016);
  const arms=sides.map(side=>arm(k,body,side,{wide:sun?.34:.30,y:.69,cloth:yaksha?'rind':'body'}));
  const legs=sides.map(side=>mailedLeg(k,k.root,side,yaksha?.18:.22));
  for(const leg of legs)leg.thigh.position.y=.93;
  shape(k,body,sun?'body':'edge',[[0,-.13,-.01,.279,.183],[0,.12,.007,.309,.202],[0,.36,.01,.332,.187],
    [0,.67,-.02,.386,.218],[0,.823,-.035,.256,.182],[0,.90,0,.14,.12]],24,15,2.81);
  face(k,head,{hair:sun?'deep':'rind',skin:yaksha?'brocade':'edge',human:false});
  shape(k,head,'body',[[0,.010,-.089,.145,.122],[0,.153,-.055,.18,.155],
    [0,.218,-.063,.155,.132],[0,sun?.436:.325,-.065,sun?.101:.112,.098]],16,15,sun?4.2:2.2,.11);
  const mantle=k.bone(body,0,.65,-.21);
  const cloth=sun?'brocade':'deep';
  for(let i=0;i<13;i++){
    const x=(i-6)*.047;
    swept(k,mantle,i%4===0?'trim':cloth,[[x*.73,0,0,.041],[x*1.36,-.24,-.07,.052],
      [x*1.56,-.66,-.16+x*.22,.054],[x*1.87,-1.16-.17*Math.cos(i*.79),-.39+x*.34,.037],
      [x*1.95,-1.32-.12*Math.cos(i*.89),-.44+x*.34,.008]],14,7,.23);
  }
  for(const side of sides){
    for(let i=0;i<4;i++){
      const y=.71-i*.129,x=side*(.24-i*.017);
      plate(k,body,i%2===0?'rind':'trim',[[x*.40,y+.058,.216],[x*1.41,y+.066,.079],
        [x*1.55,y-.044,.116],[x*.88,y-.08,.232],[x*.40,y-.040,.267]],.043,.014);
      plate(k,body,i%2?'rind':'deep',[[x*.19,y+.041,-.259],[x*1.04,y+.073,-.245],[x*1.48,y+.028,-.166],
        [x*1.43,y-.099,-.151],[x*.86,y-.114,-.254],[x*.16,y-.102,-.267]],.042,.012);
      swept(k,body,'trim',[[x*.34,y-.045,-.272,.025],[x*.895,y-.076,-.271,.024],[x*1.52,y-.041,-.175,.009]],9,6);
      k.mesh(body,'gem','trim',x*.35,y+.01,-.279,.022,.023,.014);
    }
    const shoulder=arms[side===1?1:0].shoulder;
    for(let i=0;i<4;i++){
      const y=.105-i*.079;
      plate(k,shoulder,i%3===0?'edge':'rind',[[side*.01,y+.063,-.176],[side*.212,y+.134,-.072],
        [side*.285,y+.030,.026],[side*.182,y-.091,.211],[side*.049,y-.05,.193]],.049,.014);
      swept(k,shoulder,i%3===0?'rind':'trim',[[side*.031,y+.061,-.178,.018],[side*.173,y+.111,-.099,.023],
        [side*.268,y+.039,.028,.023],[side*.167,y-.064,.206,.004]],11,7);
    }
    for(let i=0;i<(yaksha?7:3);i++){
      const x=.054+i*.027,y=.17+i*.005;
      swept(k,head,yaksha?'crest':'trim',[[side*x,y,.048,.043],[side*x*1.55,y+.105,-.041,.048],
        [side*(x+.155),y+.244+(yaksha?.051*Math.sin(i*.32):0),-.184,.005]],10,7,.18);
    }
    swept(k,head,'rind',[[side*.014,.139,.137,.028],[side*.106,.111,.176,.037],
      [side*.168,.019,.127,.032],[side*.169,-.143,.069,.024],[side*.128,-.21,.076,.004]],13,8);
  }
  if(sun){
    const shoulder=arms[1].shoulder;
    const disk=k.bone(arms[1].palm,.16,-.05,.18);
    for(const [r,w,finish,d] of [[.34,.041,'edge',.025],[.294,.042,'trim',.045],[.213,.015,'rind',.054],[.074,.026,'trim',.116]]){
      ring(k,disk,finish,r,w,36,0,d);
    }
    const face=new T.LatheGeometry([[0,0],[.275,0],[.292,.03],[.29,.085],[.25,.112],[.197,.137],[.08,.161],[0,.177]].map(v=>new T.Vector2(...v)),30);
    face.rotateX(PI/2);k.geometry(disk,'brocade',face);
    k.mesh(disk,'gem','glow',0,0,.174,.109,.109,.026);
    for(let i=0;i<12;i++){
      const a=i*TAU/12;
      const ray=k.bone(disk,0,0,0);ray.rotation.z=a;
      swept(k,ray,i%2?'edge':'trim',[[0,.285,.026,.031],[.052,.371,.055,.048],[.028,.451,.076,.031],
        [-.018,.498-(i%2)*.044,.03,.004]],10,7,.23);
    }
    for(let i=0;i<3;i++){
      const sleeve=k.bone(shoulder,.07,.04,-.152);sleeve.rotation.z=.24+i*.27;
      swept(k,sleeve,i%2?'edge':'trim',[[0,0,0,.062],[-.041,.13,-.06,.079],[-.16,.239,-.096,.056],
        [-.242,.443,-.182,.008]],11,7);
    }
    return finishKnight({k,entry,body,head,arms,legs,mantle,weapon:disk});
  }
  const mace=k.bone(arms[yaksha?0:1].palm,.035,-.05,.05);
  const shaftLength=yaksha?1.17:.76;
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
  return finishKnight({k,entry,body,head,arms,legs,mantle,weapon:top});
}

function finishKnight({k,entry,body,head,arms,legs,mantle,weapon}){
  return {body,head,arms:arms.map(s=>s.shoulder),legs:legs.map(s=>s.thigh),crest:k.bone(body,0,0,0),
    catalogueSculpt:entry.id,cataloguePose({wind,strike,beat,step,travel}){
      for(const {side,elbow,palm} of arms){
        elbow.rotation.x=-.26+wind*.63-strike*.78+Math.cos(beat+side)*.05;
        palm.rotation.z=side*(.071+wind*.39-strike*.22);
      }
      for(const {shin,side} of legs)shin.rotation.x=.11+Math.max(0,Math.sin(step+side*PI*.57))*travel*.73+strike*.16;
      mantle.rotation.x=Math.sin(beat*.73)*.055+travel*.19+strike*.33;
      mantle.rotation.z=Math.sin(beat*.38)*.094+wind*.16;
      weapon.rotation.z=Math.sin(beat*.43)*.137+wind*.65-strike*.85;
  }};
}

function abbot(k,entry){
  const body=k.bone(k.root,0,1.12,0),head=k.bone(body,0,1.02,.08);
  const robe=longGarment(k,body,{inside:'edge',accent:'rind',cloth:'brocade'},
    {length:1.26,waist:.34,panelW:.264,panels:10,seed:17});
  shape(k,body,'brocade',[[0,.1,.01,.37,.27],[0,.34,.02,.384,.28],[0,.55,-.014,.412,.28],
    [0,.77,-.035,.335,.24],[0,.88,-.03,.24,.19]],22,17,2.48);
  shape(k,head,'deep',[[0,-.286,-.017,.194,.132],[0,-.11,-.035,.230,.218],[0,.069,-.071,.234,.225],
    [0,.213,-.106,.198,.175],[0,.35,-.115,.111,.094]],24,17,2.23,.12);
  face(k,head,{hair:'crest',human:false});
  const mantle=k.bone(body,0,.76,-.032);
  const layers=[ [.38,.18,.045],[.53,-.053,.056],[.61,-.26,.049],[.574,-.34,.031],[.54,-.403,.013] ];
  folds(k,mantle,'deep',layers,{count:23,overlap:.99});
  for(const y of [-.25,-.34]) {
    const sweep=k.bone(mantle,0,y,-.02);sweep.scale.set(1.07,1,.85);sweep.rotation.x=PI/2;
    ring(k,sweep,y===-.25?'brocade':'trim',.561,.020,44);
  }
  const arms=sides.map(side=>arm(k,body,side,{wide:.38,y:.63,cloth:'brocade',shell:'edge',glove:'edge'}));
  for(const side of sides){
    const stole=[[side*.092,.80,.214,.052],[side*.218,.57,.287,.068],[side*.122,.31,.324,.050],
      [side*.14,.028,.348,.047],[side*.077,-.47,.457,.014]];
    swept(k,body,'edge',stole,15,8);
    for(let i=0;i<6;i++){
      const y=.58-i*.103;
      swept(k,body,i%2?'trim':'rind',[[side*.07,y,.291,.019],[side*.149,y-.023,.341,.022],
        [side*.249,y-.054,.253,.003]],7,6);
    }
  }
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
  return {body,head,arms:arms.map(s=>s.shoulder),crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,cataloguePose(pose){
    garmentMotion({...robe,arms},pose,{reach:.76,stroke:.58});
    const {beat,wind,strike}=pose;
    mantle.rotation.x=Math.sin(beat*.35)*.06+strike*.16;
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

function hornet(k,entry){
  const body=k.bone(k.root,0,1.16,.08),head=k.bone(body,0,.38,.23);
  shape(k,body,'rind',[[0,-.26,-.10,.14,.13],[0,-.093,-.006,.297,.261],[0,.113,-.008,.33,.29],
    [0,.27,-.042,.262,.195],[0,.423,-.054,.11,.106]],21,15,2.48,.17);
  shape(k,head,'trim',[[0,-.22,.013,.172,.12],[0,-.107,.045,.239,.165],[0,.026,.038,.254,.197],
    [0,.142,.013,.206,.146],[0,.233,-.033,.122,.119]],17,14,2.36,.19);
  const abdomen=k.bone(body,0,-.09,-.15);
  const sections=[
    [0,.145,-.123,.15,.151],[0,.011,-.227,.235,.201],[0,-.215,-.296,.286,.272],
    [0,-.485,-.286,.266,.256],[0,-.711,-.184,.192,.144],[0,-.854,-.019,.086,.071],
  ];
  shape(k,abdomen,'body',sections,23,16,2.26,.18);
  for(let i=0;i<6;i++){
    const y=-.081-i*.122,z=-.26+Math.max(0,i-2)*.058;
    const tier=k.bone(abdomen,0,y,z);
    tier.rotation.x=PI/2+(i-2)*.105;
    ring(k,tier,i%2?'trim':'deep',(.96-(i%2)*.031)*(.24-.028*Math.max(0,i-2)),.048-i*.003,26,0,.014);
  }
  swept(k,abdomen,'brocade',[[0,-.68,-.11,.117],[0,-.833,.006,.104],[.004,-.953,.144,.060],
    [.019,-1.04,.291,.004]],16,9,.25);
  const antennae=[],mandibles=[],wings=[],legs=[];
  for(const side of sides){
    k.mesh(head,'round','deep',side*.144,-.042,.190,.131,.185,.095,.09,side*.30,-side*.27);
    for(let i=0;i<3;i++)for(let j=0;j<2;j++){
      k.mesh(head,'gem',i===1&&j===0?'glow':'rind',side*(.112+j*.075),.001+(i-1)*.073,.261-j*.024,.045,.047,.023,
        .04,side*.36,-side*.15);
    }
    const antenna=k.bone(head,side*.103,.114,.137);
    swept(k,antenna,'trim',[[0,0,0,.026],[side*.08,.13,.098,.034],[side*.125,.278,.126,.022],
      [side*.077,.445,.154,.009],[side*.003,.491,.191,.003]],16,7,.18);
    antennae.push(antenna);
    const jaw=k.bone(head,side*.153,-.135,.10);
    swept(k,jaw,'edge',[[0,0,0,.055],[side*.082,-.074,.083,.059],[side*.083,-.167,.207,.040],
      [side*.011,-.190,.265,.019],[-side*.057,-.143,.263,.003]],14,8,.24);
    mandibles.push(jaw);
    for(let i=0;i<3;i++){
      const leg=k.bone(body,side*(.188+.019*i),.201-i*.16,.11-i*.15);
      const knee=k.bone(leg,side*(.252+.062*i),-.064-i*.036,.122-i*.07);
      swept(k,leg,i===1?'rind':'trim',[[0,0,0,.072],[side*.131,.026,.118-i*.03,.069],
        [side*(.245+i*.062),-.064-i*.036,.115-i*.07,.042]],12,8);
      swept(k,knee,'deep',[[0,0,0,.048],[side*.151,-.135,.083-i*.03,.04],
        [side*.168,-.296,.166-i*.06,.020],[side*.091,-.388,.167-i*.09,.003]],12,7);
      k.mesh(knee,'ring','trim',side*.078,-.062,.028,.049,.049,.56,-.47,0,side*.6);
      legs.push({leg,knee,side,i});
    }
    for(let i=0;i<2;i++){
      const flank=k.bone(body,side*.244,.248-i*.105,-.091-i*.124);
      const length=i===0?1.58:1.07;
      const blade=featherVane([0,0,0],[side*length*.58,.12,-.13],[side*length,.388-i*.22,-.29-i*.09],i===0?.31:.205,7+i,17);
      k.geometry(flank,'silk',blade);
      for(let j=0;j<5;j++){
        const t=(j+1)/6;
        swept(k,flank,j%2?'edge':'trim',[[0,0,0,.011],
          [side*length*t*.58,.20+j*.014,-.12-j*.021,.009],
          [side*length*t,.34+.03*j,-.20-j*.029,.002]],10,6,.08);
      }
      swept(k,flank,'rind',[[0,0,0,.025],[side*length*.40,.235,-.103,.027],[side*length*.75,.297,-.225,.013],
        [side*length,.388-i*.22,-.29-i*.09,.0015]],15,6,.12);
      wings.push({flank,side,i});
    }
  }
  return {body,head,pattern:'flutter',crest:k.bone(k.root,0,0,0),
    catalogueSculpt:entry.id,cataloguePose({headtime,wind,strike,travel,stage}){
      abdomen.rotation.x=.20+Math.sin(headtime*5.8)*.081+wind*.31-strike*.68;
      abdomen.rotation.z=Math.sin(headtime*2.1)*.16;
      for(const [i,antenna] of antennae.entries())antenna.rotation.x=Math.sin(headtime*5.5+i*.88)*.13-wind*.19;
      for(const [i,jaw] of mandibles.entries())jaw.rotation.y=(i?-1:1)*(.14+wind*.59+strike*.63);
      for(const {flank,side,i} of wings){
        const t=headtime*(19+stage*2.3)-i*.46;
        flank.rotation.z=side*(.36+Math.sin(t)*(.58+i*.104+travel*.21));
        flank.rotation.y=side*(.15+Math.sin(t+.62)*.21);
      }
      for(const {leg,knee,side,i} of legs){
        leg.rotation.x=Math.sin(headtime*5-i*.43)*.16+wind*.37;
        knee.rotation.z=side*(.12+strike*.38+Math.cos(headtime*4.9-i*.62)*.12);
      }
  }};
}

function shadowReaper(k,entry){
  const body=k.bone(k.root,0,1.13,0),head=k.bone(body,0,1.07,.012);
  const cloak=k.bone(body,0,.87,-.115);
  shape(k,body,'deep',[[0,-.68,-.064,.13,.101],[0,-.42,-.05,.24,.184],[0,-.10,-.024,.35,.237],
    [0,.28,-.018,.29,.25],[0,.69,-.028,.36,.214],[0,.951,0,.194,.129]],24,16,2.3,.25);
  shape(k,head,'deep',[[0,-.212,.02,.17,.122],[0,-.038,-.002,.227,.165],[0,.105,-.03,.223,.193],
    [0,.264,-.021,.166,.155],[0,.40,-.153,.142,.114],[.021,.49,-.23,.018,.026]],23,17,2.25,.23);
  face(k,head,{hair:'deep',skin:'rind',human:false});
  const arms=sides.map(side=>arm(k,body,side,{wide:.35,y:.77,cloth:'deep',shell:'rind',glove:'rind'}));
  const veils=[];
  for(let i=0;i<14;i++){
    const a=i*TAU/14, x=Math.sin(a),z=Math.cos(a),hem=.91+Math.sin(i*1.7)*.25;
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
  return {body,head,arms:arms.map(s=>s.shoulder),crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,cataloguePose({beat,wind,strike,travel}){
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
  shape(k,body,'body',[[0,-.19,-.79,.15,.117],[0,-.11,-.39,.215,.239],[0,.05,-.13,.32,.304],
    [0,.19,.18,.301,.257],[0,.36,.51,.224,.212],[0,.49,.63,.146,.155]],29,19,2.15,.3);
  shape(k,head,'rind',[[0,-.052,-.27,.21,.184],[0,.043,-.071,.232,.186],[0,.01,.126,.194,.133],
    [0,-.05,.271,.127,.090],[0,-.076,.385,.111,.059],[0,-.067,.431,.051,.029]],23,16,2.38,.21);
  const jaw=k.bone(head,0,-.113,.002);
  shape(k,jaw,'deep',[[0,-.027,0,.118,.067],[0,-.061,.176,.105,.053],[0,-.039,.374,.064,.025]],13,11);
  const wings=[],legs=[],tail=[];
  for(const side of sides){
    const x=a=>side*a;
    swept(k,head,'rind',[[x(.093),.107,.297,.021],[x(.158),.15,.213,.05],[x(.201),.163,.02,.048],
      [x(.190),.226,-.168,.040],[x(.161),.252,-.252,.004]],14,8);
    plate(k,head,'edge',[[x(.071),.048,.21],[x(.178),.089,.162],[x(.231),.093,.02],[x(.239),.013,-.138],
      [x(.129),-.104,.157],[x(.123),-.071,.203]],.028,.01);
    k.mesh(head,'gem','ember',x(.163),.109,.185,.04,.019,.035,-.055,x(.36),-x(.20));
    for(let i=0;i<5;i++){
      const length=.21+i*.047;
      swept(k,head,i<3?'trim':'rind',[[x(.089+i*.025),.135,-.037-i*.032,.049],
        [x(.122+i*.026),.257+i*.017,-.143-i*.045,.039],[x(.131+i*.021),.19+length*.66,-.228-i*.075,.003]],13,8);
      swept(k,jaw,'edge',[[x(.036+i*.012),.01,.347-i*.051,.014],[x(.04+i*.013),.051,.339-i*.05,.012],
        [x(.036+i*.013),.084-(i%2)*.015,.327-i*.050,.002]],7,5);
    }
    for(let i=0;i<8;i++){
      const gradient=i/8;
      k.geometry(body,i%3?'body':'edge',featherVane([x(.124+gradient*.073),.467-gradient*.52,.54],
        [x(.233+gradient*.08),.42-gradient*.49,.20],
        [x(.30+gradient*.08),.28-gradient*.46,-.116-gradient*.092],.078+gradient*.025,13+i,11));
    }
    for(let i=0;i<2;i++){
      const fore=i===0;
      const leg=k.bone(body,x(fore?.225:.169),fore?.081:-.083,fore?.263:-.521);
      const knee=k.bone(leg,x(.045),fore?-.46:-.34,fore?-.082:-.172);
      const heel=k.bone(knee,x(.019),fore?-.36:-.39,fore?.077:.134);
      shape(k,leg,'body',[[0,.085,0,.143,.122],[x(.023),-.047,-.033,.168,.123],
        [x(.055),-.201,fore?.029:-.103,.112,.101],[x(.045),fore?-.44:-.35,fore?-.073:-.162,.057,.068]],18,13,2.32,.33);
      shape(k,knee,'rind',[[0,.041,0,.065,.072],[x(.012),-.15,.014,.061,.055],
        [x(.019),-.34,fore?.072:.123,.045,.047]],12,10,2.20,.21);
      for(let j=0;j<3;j++)swept(k,heel,j===1?'edge':'trim',[
        [(j-1)*.044,.028,0,.034],[(j-1)*.056,-.027,.09,.030],[(j-1)*.058,-.044,.19,.004],
      ],8,6);
      legs.push({leg,knee,heel,side,i});
    }
    const wing=k.bone(body,x(.252),.259,-.083);
    const wrist=k.bone(wing,x(.673),.41,-.025);
    const back=k.bone(wrist,x(.524),.018,-.129);
    swept(k,wing,'rind',[[0,0,0,.133],[x(.25),.27,.069,.148],[x(.489),.408,.039,.103],[x(.674),.413,-.022,.074]],20,12);
    swept(k,wrist,'rind',[[0,0,0,.093],[x(.312),.105,-.038,.091],[x(.534),.016,-.132,.079]],16,12);
    swept(k,back,'trim',[[0,0,0,.109],[x(.276),-.061,-.171,.11],[x(.529),-.151,-.261,.072],
      [x(.673),-.255,-.268,.002]],16,10);
    const primaries=mobile?7:9;
    for(let i=0;i<primaries;i++){
      const t=i/(primaries-1), length=.93+.32*Math.sin(t*PI);
      const origin=[x(.616*t),-.085+t*.121,-.049-.155*t];
      const mid=[x(.63*t+.21),-.31+t*.22,-.39-length*.24];
      const tip=[x(.33+.63*t+.475*t*t),-.66+t*.45,-.49-length*.54];
      k.geometry(back,i%3===0?'trim':i%2?'rind':'brocade',featherVane(origin,mid,tip,.146-.021*t,451+i,19));
      swept(k,back,i%2?'glow':'edge',[[origin[0],origin[1]+.025,origin[2],.014],
        [mid[0],mid[1]+.047,mid[2],.013],[tip[0],tip[1]+.009,tip[2],.002]],16,6,.10);
    }
    for(let i=0;i<9;i++){
      const t=i/8, pivot=i<=4?wing:wrist, offset=i<=4?.14:.015;
      const a=[x(offset+(i%5)*.088),.052+t*.13,.013];
      const b=[x(offset+(i%5)*.11+.026),-.102+t*.20,-.29];
      const c=[x(offset+(i%5)*.125+.073),-.36+t*.29,-.78+t*.054];
      k.geometry(pivot,i%3?'rind':'body',featherVane(a,b,c,.127,320+i,13));
      k.geometry(pivot,i%2?'edge':'trim',featherVane([a[0],a[1]+.095,.030],
        [b[0]-x(.022),b[1]+.075,-.142],[c[0]-x(.008),c[1]+.13,c[2]+.24],.073,i,11));
    }
    wings.push({wing,wrist,back,side});
  }
  let joint=k.bone(body,0,-.099,-.69);
  for(let i=0;i<8;i++){
    const t=i/8;
    const r=.116*(1-t)+.026;
    shape(k,joint,i%3?'body':'rind',[[0,.01,.024,r,r*.81],[.011,-.02,-.086,r*.90,r*.77],
      [.014,-.024,-.211,r*.87,r*.70]],10,9,2.21,.23,i);
    swept(k,joint,i%2?'trim':'edge',[[0,r*.62,-.031,r*.56],[.021,r*.98,-.093,r*.49],
      [.032,r*1.52,-.168,.001]],8,7);
    tail.push(joint);
    joint=k.bone(joint,.014,-.024,-.195);
  }
  for(let i=-2;i<3;i++)k.geometry(joint,i%2?'brocade':'edge',featherVane([0,0,0],[i*.041,.044,-.21],
    [i*.089,(.1-Math.abs(i)*.039),-.469+Math.abs(i)*.09],.058,i+4,12));
  return {body,head,pattern:'wing',crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,
    cataloguePose({headtime,wind,strike,travel,stage,step}){
      const flop=Math.sin(headtime*(5.2+stage*.8));
      head.rotation.x=-wind*.31+strike*.55+Math.sin(headtime*4.2)*.09;
      head.rotation.y=Math.sin(headtime*1.85)*.13+wind*.11;
      jaw.rotation.x=wind*.25+strike*.47;
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

function strawIdol(k,entry,mobile){
  const body=k.bone(k.root,0,1.13,.02),head=k.bone(body,.016,.44,.31);
  head.scale.setScalar(.73);
  shape(k,body,'deep',[[0,-.719,0,.446,.353],[0,-.489,-.012,.466,.361],[0,-.11,-.028,.401,.316],
    [0,.192,-.018,.331,.259],[0,.478,.013,.251,.200],[0,.61,.04,.144,.105]],22,15,2.31,.3);
  const hanging=[];
  for(let tier=0;tier<4;tier++){
    const count=mobile?11:24,radius=.23+tier*.123;
    const girdle=k.bone(body,0,.406-tier*.325,0);
    girdle.rotation.x=PI/2+.08*Math.sin(tier*2.7);
    girdle.scale.y=.83;
    ring(k,girdle,'edge',radius+.08,.024,42);
    ring(k,girdle,'trim',radius+.092,.018,42,0,.042);
    ring(k,girdle,'brocade',radius+.061,.022,37,0,-.042);
    for(let i=0;i<count;i++){
      const a=i*TAU/count+tier*.102, x=Math.sin(a),z=Math.cos(a);
      const root=k.bone(body,x*radius,.476-tier*.316,z*radius*.83);
      root.rotation.y=a;
      const curl=Math.sin(i*.99+tier*1.78);
      hanging.push({root,i,tier});
      plate(k,root,i%5===0?'body':'rind',[
        [-.044,.068,0],[.059,.069,.013],[.087,-.17,.153],[.072+curl*.019,-.38,.188],
        [.045,-.49-curl*.058,.191],[-.005,-.43,.192],[-.028,-.65+curl*.081,.228],[-.062,-.48,.192],
        [-.083,-.19,.113],
      ],.029,.009);
      if(!mobile||i%2===0)swept(k,root,i%3?'brocade':'edge',[[.024,.053,.009,.011],[.041,-.15,.139,.014],
        [-.007,-.332,.191,.013],[-.025+curl*.014,-.53,.219,.004]],mobile?7:11,6);
      if(tier>0&&i%(mobile?6:5)===1)swept(k,root,i%2?'talon':'charm',[[.015,-.081,.122,.021],
        [.03,-.192,.177,.028],[-.012,-.31,.23,.018],[-.023,-.376,.243,.005]],8,6);
    }
  }
  shape(k,head,'rind',[[0,-.186,.039,.13,.14],[0,-.117,.027,.21,.179],[0,.03,.008,.226,.198],
    [0,.158,-.01,.209,.183],[0,.269,-.068,.139,.109]],17,14,2.42,.34);
  const arms=[],legs=[];
  for(const side of sides){
    const x=a=>side*a;
    const arm=k.bone(body,x(.441),.351,.008);
    arm.scale.setScalar(.77);
    const elbow=k.bone(arm,x(.294),-.29,.026);
    const fingers=k.bone(elbow,x(.07),-.369,.113);
    const leg=k.bone(body,x(.186),-.632,-.003);
    leg.scale.setScalar(.72);
    const boot=k.bone(leg,x(.059),-.293,.039);
    for(let i=0;i<7;i++){
      swept(k,arm,i%3?'brocade':'trim',[[x(.032),.061,i*.029-.092,.039],
        [x(.173),-.106,i*.033-.097,.050],[x(.294),-.29,i*.024-.064,.033]],15,6);
      swept(k,elbow,i%2?'rind':'brocade',[[x(.018),.002,i*.027-.075,.039],
        [x(.071),-.168,i*.029-.027,.046],[x(.108),-.338,i*.027+.012,.026]],14,6);
      swept(k,leg,i%2?'body':'rind',[[x(.026),.049,i*.02-.059,.037],
        [x(.041),-.15,i*.025-.078,.045],[x(.07),-.301,i*.026-.044,.028]],13,7);
    }
    for(let i=0;i<5;i++){
      swept(k,fingers,i%2?'rind':'edge',[[x(.01+i*.028),.01,.03+i*.021,.025],
        [x(.027+i*.032),-.15+.01*i,.109+i*.018,.022],
        [x(.019+i*.034),-.242+.014*i,.17+i*.024,.002]],10,6);
    }
    shape(k,boot,'deep',[[0,.043,0,.079,.061],[0,-.087,.047,.097,.081],[x(.01),-.119,.18,.123,.062],
      [x(.012),-.115,.232,.077,.034]],15,13,2.44,.31);
    for(let i=0;i<4;i++){
      swept(k,head,i%2?'edge':'trim',[[x(.036+i*.041),.228,.009,.030],
        [x(.069+i*.043),.319+i*.015,-.086,.030],[x(.103+i*.049),.39+i*.028,-.16-i*.036,.002]],13,6);
    }
    k.mesh(head,'gem','deep',x(.111),.026,.183,.086,.069,.045,.05,x(.38),x(.35));
    k.mesh(head,'gem','glow',x(.114),.025,.219,.051,.014,.024,-.02,x(.37),x(.41));
    for(let i=0;i<3;i++)swept(k,head,'deep',[[x(.013+i*.035),-.038,.209,.009],
      [x(.012+i*.039),-.093+(i%2)*.006,.218,.012],[x(.023+i*.044),-.137,.168,.003]],7,5);
    const strawBraid=k.bone(elbow,x(.051),-.264,.099);
    strawBraid.rotation.x=PI/2+.07;
    ring(k,strawBraid,'edge',.098,.022,19);
    for(let i=0;i<2;i++)ring(k,strawBraid,'trim',.104,.011,18,0,.030+i*.024);
    arms.push({arm,elbow,fingers,side});
    legs.push({leg,boot,side});
  }
  const halo=k.bone(head,0,.1,-.239);
  for(let i=0;i<6;i++){
    const angle=i*TAU/6;
    const reed=k.bone(halo,Math.sin(angle)*.228,Math.cos(angle)*.167,0);
    reed.rotation.z=-angle;
    bell(k,reed,i%3?'trim':'brocade',.4);
    swept(k,reed,'rind',[[-.011,0,-.011,.026],[-.042,.181,-.088,.026],
      [-.086,.277,-.159,.014],[-.169,.337,-.209,.002]],12,6);
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'slam',
    cataloguePose({headtime,wind,strike,travel,step}){
      head.rotation.y=Math.sin(headtime*2.15)*.117+wind*.22;
      head.rotation.x=-wind*.31+strike*.58;
      for(const {arm,elbow,fingers,side} of arms){
        const pace=Math.cos(step+side*PI*.5)*travel;
        arm.rotation.x=.24+pace*.37-wind*.89+strike*.90;
        arm.rotation.z=side*(.14+wind*.5-strike*.19);
        elbow.rotation.x=-.31+wind*.25-strike*.63;
        fingers.rotation.x=Math.sin(headtime*3.4+side)*.13+.3*wind;
      }
      for(const {leg,boot,side} of legs){
        leg.rotation.x=Math.cos(step+side*PI*.5)*travel*.71-strike*.15;
        boot.rotation.x=-leg.rotation.x*.57+wind*.07;
      }
      for(const {root,i,tier} of hanging){
        root.rotation.x=Math.sin(headtime*4.3+i*.69)*.078+travel*.12-wind*.067+strike*tier*.052;
        root.rotation.z=Math.sin(headtime*3.1+i*.45+tier*.47)*.077+strike*.1;
      }
  }};
}

function frozenLord(k,entry,mobile){
  const body=k.bone(k.root,0,1.1,.006),head=k.bone(body,0,.96,.069);
  const robe=longGarment(k,body,{inside:'deep',accent:'rind',cloth:'brocade'},
    {length:1.17,waist:.275,panelW:.20,panels:7,seed:10});
  shape(k,body,'body',[[0,.095,-.02,.257,.178],[0,.303,.02,.277,.216],[0,.466,.008,.317,.22],
    [0,.637,.011,.363,.191],[0,.836,-.027,.290,.169],[0,.92,-.018,.15,.127]],22,15,2.48,.22);
  shape(k,head,'skull',[[0,-.175,.038,.11,.10],[0,-.103,.039,.144,.135],[0,.025,.048,.195,.147],
    [0,.151,.042,.213,.156],[0,.216,-.03,.184,.114]],16,13,2.75,.25);
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
    for(let j=0;j<4;j++)swept(k,head,'deep',[[x(.018+j*.017),-.128,.172,.008],
      [x(.018+j*.02),-.161,.174,.008],[x(.02+j*.018),-.167,.153,.003]],6,5);
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
  }
  const blade=k.bone(arms[1].palm,.025,-.037,.026);
  swept(k,blade,'deep',[[0,-.36,-.005,.051],[.006,-.19,-.002,.059],[0,.04,0,.053],[0,.19,0,.053]],16,9,.25);
  plate(k,blade,'rind',[[-.148,.127,.012],[.148,.108,.016],[.113,.253,.023],[.09,.68,-.034],
    [.088,1.131,-.054],[.037,1.418,-.036],[-.055,1.299,-.052],[-.103,.981,-.049],[-.125,.584,-.025]],.086,.019);
  swept(k,blade,'glow',[[0,.215,.071,.017],[-.008,.47,.041,.013],[.027,.728,.028,.016],
    [.029,.961,.015,.011],[.014,1.23,.001,.007],[.039,1.402,-.025,.002]],23,6);
  for(const side of sides)swept(k,blade,'edge',[[side*.055,.14,.012,.032],[side*.204,.135,.013,.045],
    [side*.278,.345,.012,.030],[side*.26,.423,-.023,.003]],11,7);
  return {body,head,arms:arms.map(s=>s.shoulder),legs:legs.map(s=>s.thigh),crest:k.bone(body,0,0,0),
    catalogueSculpt:entry.id,cataloguePose(pose){
      const {beat,headtime,wind,strike,step,travel,stage}=pose;
      garmentMotion({...robe,arms},pose,{reach:.73,stroke:1.02});
      head.rotation.y=Math.sin(beat*.46)*.079-wind*.22;
      blade.rotation.y=-wind*.58+strike*.87;
      blade.rotation.z=.19+wind*.86-strike*1.37;
      for(const {shin,side} of legs)shin.rotation.x=Math.sin(step+side*PI*.52)*travel*.45;
      for(const {fragment,side,t} of blizzard){
        fragment.rotation.y=side*(.02+wind*.14+stage*.21+Math.sin(headtime*(2+t))*.083);
        fragment.rotation.x=Math.cos(beat*.54+t*3.9)*.098+strike*.15;
      }
  }};
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
  const legs=sides.map(side=>mailedLeg(k,body,side,.213)),arms=[];
  for(const side of sides){
    const x=a=>side*a;
    const shoulder=k.bone(body,x(.449),.529,.014);
    const elbow=k.bone(shoulder,x(.24),-.32,-.022);
    const palm=k.bone(elbow,x(.04),-.39,.06);
    arms.push({shoulder,elbow,palm,side});
    shape(k,shoulder,'hide',[[0,.123,-.01,.145,.149],[x(.11),-.002,.029,.227,.194],
      [x(.16),-.155,.02,.192,.183],[x(.241),-.324,-.019,.128,.12]],20,16,2.3,.28);
    shape(k,elbow,'hide',[[0,.042,0,.124,.131],[x(.04),-.096,-.026,.187,.168],
      [x(.031),-.277,.054,.158,.128],[x(.046),-.41,.079,.109,.105]],18,14,2.37,.28);
    shape(k,palm,'hide',[[0,.068,0,.104,.085],[x(.013),-.032,.035,.143,.117],
      [x(.038),-.11,.08,.119,.08]],12,13,2.54,.28);
    for(let i=0;i<4;i++){
      const dx=x((i-1.5)*.059);
      swept(k,palm,'rind',[[dx,-.057,.102,.034],[dx+x(.017),-.113,.174,.038],
        [dx+x(.028),-.175,.156,.023]],9,7);
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
      for(const {shin,side} of legs)shin.rotation.x=Math.sin(step+side*PI*.5)*travel*.37;
  }};
}

function ancientYeti(k,entry,mobile){
  const body=k.bone(k.root,0,.98,-.019),head=k.bone(body,0,.48,.31);
  shape(k,body,'hide',[[0,-.28,-.103,.559,.36],[0,.022,-.11,.666,.438],
    [0,.337,-.087,.735,.497],[0,.62,-.134,.558,.461],[0,.834,-.172,.364,.328],
    [0,.925,-.28,.22,.201]],26,21,2.44,.33);
  shape(k,head,'body',[[0,-.198,.032,.20,.147],[0,-.082,.019,.245,.178],[0,.083,.024,.214,.184],
    [0,.216,-.055,.182,.127],[0,.316,-.129,.133,.106]],22,16,2.63,.33);
  shape(k,head,'rind',[[0,-.126,.187,.131,.056],[0,-.070,.230,.153,.069],[0,.039,.165,.145,.065],
    [0,.141,.139,.107,.057],[0,.251,.078,.093,.033]],16,12,3.15,.23);
  const ribs=[],arms=[],legs=[];
  for(const side of sides){
    const x=a=>side*a;
    const horn=k.bone(head,x(.129),.104,.122);
    const points=[[0,-.065,.037,.078],[x(.060),.121,.045,.087],[x(.157),.304,.00,.077],
      [x(.251),.487,-.06,.056],[x(.265),.651,-.113,.022],[x(.237),.72,-.123,.002]];
    shape(k,horn,'rind',points.map(([a,b,c,r])=>[a,b,c,r,r*.77]),19,10,3.1,.29);
    const curve=new T.CatmullRomCurve3(points.map(([a,b,c])=>vector([a,b,c])));
    for(let i=0;i<7;i++){
      const t=(i+.68)/8;
      const p=curve.getPointAt(t);
      const band=k.bone(horn,p.x,p.y,p.z);
      band.rotation.x=PI/2+.26;
      band.rotation.y=x(.24);
      ring(k,band,i%3===1?'copper':'deep',.075-t*.051,.013,15,0,.008);
    }
    k.mesh(head,'gem','glow',x(.105),.011,.211,.032,.018,.021,-.05,x(.36),-x(.26));
    swept(k,head,'deep',[[x(.018),-.113,.226,.015],[x(.077),-.119,.238,.018],
      [x(.133),-.096,.217,.017],[x(.154),-.058,.182,.007]],12,6);
    const shoulder=k.bone(body,x(.524),.429,.025);
    const elbow=k.bone(shoulder,x(.438),-.194,.046);
    const paw=k.bone(elbow,x(.173),-.421,.148);
    shape(k,shoulder,'hide',[[x(-.048),.098,-.049,.234,.232],[x(.139),.083,.008,.357,.289],
      [x(.312),-.065,.039,.304,.262],[x(.442),-.205,.040,.192,.141]],19,17,2.59,.34);
    shape(k,elbow,'hide',[[0,.05,0,.183,.179],[x(.075),-.137,.053,.25,.216],
      [x(.128),-.27,.106,.226,.179],[x(.166),-.441,.149,.16,.126]],21,15,2.46,.32);
    shape(k,paw,'edge',[[0,.092,-.012,.151,.112],[0,-.037,.054,.196,.145],
      [x(.018),-.156,.151,.177,.132],[x(.016),-.221,.213,.123,.086]],17,15,2.7,.26);
    const thigh=k.bone(body,x(.357),-.321,-.107);
    const calf=k.bone(thigh,x(.098),-.322,.116);
    shape(k,thigh,'hide',[[0,.05,-.04,.229,.181],[x(.069),-.116,.009,.23,.171],
      [x(.103),-.318,.103,.137,.128]],17,13,2.70,.29);
    shape(k,calf,'body',[[0,.035,.028,.129,.129],[x(.029),-.159,.042,.143,.107],
      [x(.033),-.234,.19,.174,.106],[x(.031),-.245,.291,.133,.068]],19,12,2.56,.29);
    const fingers=[];
    for(let i=0;i<4;i++){
      const dy=(i-1.5)*.041, finger=k.bone(paw,x((i-1.5)*.073),-.142+dy,.112+(i===1?.041:0));
      shape(k,finger,'hide',[[0,.03,.041,.050,.041],[x(.023),-.11,.084,.045,.045],
        [x(.034),-.188,.118,.032,.034]],13,10,2.29,.34);
      swept(k,finger,'deep',[[x(.034),-.154,.121,.032],[x(.043),-.241,.155,.030],
        [x(.022),-.273,.209,.004]],10,8);
      swept(k,calf,'rind',[[x((i-1.5)*.053),-.21,.221,.039],[x((i-1.5)*.06),-.24,.294,.042],
        [x((i-1.5)*.07),-.254,.354,.003]],9,7,.23);
      fingers.push(finger);
    }
    const count=mobile?9:12;
    for(let i=0;i<count;i++){
      const t=i/(count-1);
      const tuft=k.bone(shoulder,x(.11+t*.26),.21-t*.11,-.17+t*.36);
      ribs.push({tuft,i,side});
      k.geometry(tuft,i%2?'edge':'hide',featherVane([0,-.052,.025],
        [x(.125+t*.045),.051+t*.036,-.091],[x(.39+t*.12),.047+t*.08,-.225-t*.08],
        .104+.014*t,31+i,15));
      if(i%3===0)swept(k,tuft,'copper',[[x(.051),.052,-.071,.041],[x(.131),.133,-.128,.035],
        [x(.178),.252,-.144,.002]],10,6);
      const r=.36+.07*Math.sin(t*PI);
      k.geometry(body,i%4?'hide':'edge',featherVane([x(.14+t*.11),.78-t*.19,-.271-t*.15],
        [x(.29+t*.15),.9-t*.43,-.401-t*.10],[x(r+t*.24),.89-t*.64,-.60-t*.16],.096,51+i,13));
    }
    arms.push({shoulder,elbow,paw,fingers,side});
    legs.push({thigh,calf,side});
  }
  const mane=k.bone(head,0,.15,-.17);
  for(let i=-5;i<=5;i++){
    const t=i/5;
    k.geometry(mane,i%2?'body':'edge',featherVane([t*.115,-.06,.128],[t*.179,.189,-.051],
      [t*.369,.603-Math.abs(t)*.19,-.333-Math.abs(t)*.069],.096-Math.abs(t)*.013,i+62,18));
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'crawl',
    cataloguePose({beat,headtime,wind,strike,travel,step}){
      body.rotation.x=.075+wind*.17-strike*.25+Math.sin(beat*.47)*.047;
      head.rotation.x=-wind*.34+strike*.42;
      head.rotation.y=Math.sin(headtime*2.8)*.085+wind*.15-strike*.27;
      mane.rotation.x=Math.sin(beat*.62)*.052+travel*.11+strike*.25;
      for(const {shoulder,elbow,paw,fingers,side} of arms){
        const pace=Math.sin(step+side*PI*.5)*travel;
        shoulder.rotation.x=pace*.56-wind*.67+strike*.82;
        shoulder.rotation.z=side*(.16+wind*.24-strike*.19);
        elbow.rotation.x=-.23+Math.max(0,pace)*.48+wind*.23-strike*.38;
        paw.rotation.x=.11-wind*.36+strike*.49;
        for(const [i,finger] of fingers.entries())finger.rotation.x=Math.cos(beat*.8+i*.7)*.071+wind*.27-strike*.37;
      }
      for(const {thigh,calf,side} of legs){
        const pace=Math.cos(step+side*PI*.5)*travel;
        thigh.rotation.x=-.11+pace*.35+wind*.13;
        calf.rotation.x=Math.max(0,pace)*.27+wind*.17-strike*.22;
      }
      for(const {tuft,i,side} of ribs)tuft.rotation.z=side*(Math.sin(beat+i*.34)*.052+wind*.12-strike*.16);
  }};
}

export const catalogueFinishes={
  m001:{rind:[0x75437c,.47,.45,'iron']},
  m002:{rind:[0x922577,.22,.43,'hide']},
  m008:{rind:[0x1d7051,.42,.43,'iron'],brocade:[0x355b32,.11,.66,'cloth']},
  m016:{rind:[0x9e7c4c,.64,.54,'iron'],brocade:[0xb85b37,.08,.64,'cloth'],crest:[0xbcb1a2,.35,.6,'bone']},
  m017:{rind:[0x673d23,.62,.46,'iron'],brocade:[0xb26b23,.15,.57,'cloth'],crest:[0x968476,.40,.57,'iron']},
  m021:{rind:[0x458f97,.47,.42,'iron'],brocade:[0x8f261a,.17,.58,'cloth'],crest:[0xcbd1cd,.05,.78,'bone']},
  m097:{rind:[0x5b9ca6,.66,.4,'iron'],brocade:[0x1c2c46,.27,.62,'cloth'],mica:[0x94c7cb,.40,.37,'gem'],
    skull:[0x8baba6,.23,.62,'bone']},
  m101:{rind:[0x9d3c08,.22,.52,'stone'],brocade:[0xa54a20,.10,.66,'cloth'],crest:[0x99704c,.06,.86,'hide']},
  m107:{rind:[0x49372f,.52,.53,'iron'],brocade:[0x772f26,.14,.58,'cloth']},
  m109:{rind:[0xb46f2c,.52,.49,'bronze'],brocade:[0xa44524,.16,.56,'cloth'],crest:[0xddd3b3,.14,.58,'bone']},
  m148:{rind:[0x2a3d52,.46,.51,'iron'],brocade:[0x15336a,.47,.46,'hide'],ember:[0xdf8c4d,.14,.37,'bone'],
    trim:[0x416781,.41,.52,'iron']},
  m151:{rind:[0x605a17,.53,.46,'iron'],brocade:[0x422016,.46,.47,'iron'],silk:[0xa69d5c,.04,.7,'hide']},
  m153:{rind:[0x282c4e,.54,.48,'iron'],brocade:[0x33213b,.14,.69,'cloth']},
  m156:{rind:[0x936037,.08,.79,'hide'],brocade:[0x4e271e,.09,.88,'cloth'],
    talon:[0xb94316,.24,.57,'bronze'],charm:[0x3445a7,.23,.54,'cloth']},
  m157:{rind:[0x9e4d41,.21,.5,'hide'],brocade:[0x862d36,.24,.57,'cloth'],hide:[0xa55654,.09,.69,'hide'],
    hair:[0x2a2728,.10,.72,'hide']},
  m158:{rind:[0x633324,.51,.52,'bronze'],copper:[0xa4543d,.46,.51,'bronze'],hide:[0xa4a9a9,.14,.7,'hide']},
};
for(const [id,finishes] of Object.entries(legacyCFinishes))Object.assign(catalogueFinishes[id],finishes);

const sculpts={
  m001:snake,m002:snake,m008:royalMedium,m016:knightRelic,m017:knightRelic,m021:royalMedium,
  m097:frozenLord,m101:abbot,m107:captain,m109:knightRelic,m148:qiongqi,m151:hornet,m153:shadowReaper,
  m156:strawIdol,m157:mandrill,m158:ancientYeti,
};

export function catalogueSculpt(kit,entry,mobile){
  const parts=sculpts[entry.id]?.(kit,entry,mobile);
  if(parts)legacyCDetail(kit,entry,parts,mobile);
  return parts;
}
