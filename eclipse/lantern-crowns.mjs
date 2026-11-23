import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';

const PI=Math.PI,TAU=PI*2;

const monarchs={
  'forest-0':{kind:'owl',metal:0xa23f32,trim:0xe8ad6d,cloth:0x4d202b},
  'forest-1':{kind:'lotus',weapon:'lotus-fish',metal:0xc1dbce,trim:0xbcb178,cloth:0x37656e},
  'forest-2':{kind:'fox',weapon:'frostlute',metal:0x796ca6,trim:0xd8edef,cloth:0x343a62},
  'forest-3':{kind:'furnace',weapon:'zhurong-axe',metal:0x583732,trim:0xbf7351,cloth:0x481f2b},
  'forest-4':{kind:'weaver',metal:0x76566d,trim:0xc6b6c9,cloth:0x392c4b},
  'forest-5':{kind:'vault',metal:0x927452,trim:0xe1b66c,cloth:0x3d331f},
  'forest-6':{kind:'eclipse',metal:0x92654a,trim:0xc89968,cloth:0x493237},
  'forest-7':{kind:'deer',metal:0x436869,trim:0xc5b37b,cloth:0x2d4441},
  'forest-8':{kind:'moth',metal:0x6e62ac,trim:0xb1a2d9,cloth:0x3d244a},
  'forest-9':{kind:'warden',weapon:'blood-sword',metal:0x586078,trim:0xbca27b,cloth:0x681e34},
};

export const crownDesign=entry=>monarchs[entry.id];

export function sculptCrownFace(head,kind,c,size){
  const {ball,plate,box,rod,put,halo,gem,cone}=c;
  const s=size/.31;
  if(kind==='eclipse'){
    ball(head,'dark',0,0,-.026*s,.315*s,.353*s,.244*s);
    ball(head,'body',0,0,.138*s,.289*s,.285*s,.095*s);
    halo(head,0,0,.232*s,.224*s,'trim');
    halo(head,0,0,.254*s,.159*s,'core');
    ball(head,'dark',0,0,.248*s,.146*s,.146*s,.031*s);
    const shadow=put(head,gem,'core',0,0,.282*s,.046*s,.101*s,.018*s);shadow.rotation.z=.31;
    for(let i=0;i<8;i++){
      const a=i*TAU/8;
      box(head,i%2?'trim':'edge',Math.sin(a)*.286*s,Math.cos(a)*.286*s,.197*s,.042*s,.079*s,.058*s).rotation.z=-a;
      rod(head,'body',[Math.sin(a)*.262*s,Math.cos(a)*.262*s,-.034*s],[0,0,-.236*s],.019*s);
    }
    return;
  }
  const visor=(points,finish,depth,z)=>plate(head,points.map(([x,y])=>[x*s,y*s]),finish,depth*s,z*s);
  const animal=kind==='owl'||kind==='fox'||kind==='deer'||kind==='furnace';
  ball(head,animal?'dark':'body',0,0,-.037*s,.321*s,.376*s,.275*s);
  visor([[-.31,.18],[-.21,.32],[.17,.34],[.33,.23],[.28,-.12],[.07,-.37],[-.11,-.33],[-.29,-.13]],animal?'edge':'trim',.079,.148);
  visor([[-.255,.13],[-.135,.205],[.15,.212],[.269,.14],[.17,-.12],[0,-.24],[-.20,-.13]],'dark',.027,.218);
  if(animal){
    const long=kind==='fox'||kind==='deer';
    const beak=put(head,gem,kind==='furnace'?'trim':'edge',0,-.11*s,(long?.317:.287)*s,.139*s,(kind==='owl'?.213:.137)*s,(long?.178:.087)*s);
    beak.rotation.x=long?.31:kind==='owl'?-.34:.10;
    put(head,gem,'dark',0,-.10*s,(long?.454:.297)*s,.069*s,.048*s,.056*s);
    for(const side of [-1,1]){
      const ear=put(head,cone,'body',side*.232*s,.352*s,.026*s,.098*s,(kind==='fox'?.460:.26)*s,.085*s);
      ear.rotation.z=-side*.34;
      if(kind==='furnace'){
        const tusk=put(head,cone,'edge',side*.185*s,-.213*s,.30*s,.074*s,.31*s,.060*s);tusk.rotation.z=-side*.56;tusk.rotation.x=.36;
      }
    }
  }else{
    visor([[-.055,.135],[.043,.164],[.09,-.064],[.046,-.231],[-.075,-.188]],'edge',.024,.257);
    visor([[-.117,-.195],[-.025,-.29],[.137,-.173],[.106,-.291],[0,-.344],[-.098,-.301]],'body',.036,.251);
  }
  for(const side of [-1,1]){
    const lens=ball(head,'core',side*.155*s,.052*s,.246*s,(kind==='owl'?.099:.094)*s,(kind==='owl'?.071:.039)*s,.027*s);
    lens.rotation.z=side*.23;
    put(head,gem,'dark',side*.164*s,.053*s,.271*s,.018*s,.039*s,.016*s);
    const brow=box(head,'trim',side*.159*s,.137*s,.246*s,.21*s,.043*s,.044*s);brow.rotation.z=side*.23;
    rod(head,'trim',[side*.25*s,.24*s,.027*s],[side*.30*s,-.15*s,-.064*s],.018*s);
    const hinge=ball(head,'trim',side*.298*s,-.024*s,-.101*s,.035*s,.103*s,.082*s);hinge.rotation.z=side*.17;
    box(head,'body',side*.193*s,-.052*s,-.219*s,.13*s,.31*s,.043*s).rotation.z=side*.31;
  }
  if(kind==='owl')for(const side of [-1,1])for(let i=0;i<3;i++){
    const etched=put(head,gem,i===1?'trim':'body',side*(.204+i*.033)*s,(.235-i*.104)*s,.246*s,.043*s,.089*s,.033*s);
    etched.rotation.z=side*(-.65+i*.23);
  }
  if(kind==='weaver'||kind==='vault')for(const side of [-1,1]){
    const jaw=put(head,cone,'edge',side*.161*s,-.257*s,.292*s,.052*s,(kind==='weaver'?.225:.16)*s,.054*s);
    jaw.rotation.z=side*(kind==='weaver'?2.78:.69);
    halo(head,side*.245*s,-.217*s,.190*s,.061*s,kind==='vault'?'core':'trim');
  }
  if(kind==='furnace'){
    box(head,'body',0,-.092*s,.281*s,.274*s,.147*s,.134*s);
    for(const side of [-1,1])box(head,'core',side*.082*s,-.104*s,.354*s,.055*s,.034*s,.022*s).rotation.z=side*.24;
  }
  for(let i=0;i<3;i++)box(head,'trim',0,(.24-i*.19)*s,-.285*s,(.18+i%2*.12)*s,.028*s,.035*s);
}

export function spreadCrownWing(wing,side,kind,c,animate){
  const {plate,put,rod,group,cloth,gem}=c;
  if(kind==='owl'){
    for(let i=0;i<5;i++){
      const base=group(wing,side*i*.151,-i*.061,-i*.033);
      const length=1.38-i*.088;
      const upper=[side*(length*.72),.52-i*.023];
      const tip=[side*length,.60-i*.222];
      plate(base,[[0,0],[side*.39,.30],upper,tip,[side*(length*.82),-.076-i*.106],[side*.18,-.30]],i%2?'trim':'body',.035);
      rod(base,'edge',[0,-.01,.021],[...upper,.027],.016);
      rod(base,'trim',[0,-.02,-.024],[...tip,-.027],.015);
      animate((_,p,w)=>{base.rotation.y=side*(i*.048+p*.28*Math.sin(i+1)-w*.18);base.rotation.z=side*(p*.13+w*.14)*(i/4);});
    }
    const pennant=cloth(wing,side*.45,-.26,-.075,.23,.79,side*.29);
    animate((t,p,w,k,g)=>{pennant.rotation.x=.11+g*.4+.11*Math.sin(t*4.1)-k*.38;pennant.rotation.z=side*(.29+p*.26);});
  }else{
    for(const [level,spread] of [[0,1.47],[1,.97]]){
      const panel=group(wing,0,-level*.33,-level*.12);
      const spar=[side*spread*.51,.72-level*.19,0],outer=[side*spread,.89-level*.19,0];
      const shoulder=[side*spread*.58,.18-level*.08,0],bottom=[side*spread*.72,-.30-level*.30,0];
      const xy=p=>p.slice(0,2);
      plate(panel,[[0,0],xy(spar),xy(outer),xy(shoulder),xy(bottom),[side*.21,-.42]],'dark',.07);
      plate(panel,[[side*.15,.00],[side*spread*.52,.62],[side*spread*.86,.72],[side*spread*.59,.24],[side*spread*.67,-.19]],'body',.06,.045);
      plate(panel,[[side*.21,-.10],[side*spread*.54,.22],[side*spread*.62,-.14],[side*.29,-.34]],'glass',.035,-.078);
      for(const [from,to] of [[[0,0,0],spar],[spar,outer],[outer,shoulder],[shoulder,bottom],[bottom,[side*.21,-.42,0]],[[0,0,0],shoulder]]){
        rod(panel,'trim',from,to,.020);
      }
      for(const z of [.085,-.10])put(panel,gem,'core',side*spread*.51,.26-level*.06,z,.107,.162,.040);
      animate((t,p,w,k)=>{panel.rotation.z=side*(-.08+level*.17+p*(.30+level*.24)+w*.29-k*.38);panel.rotation.y=side*(-.12+p*.41+.13*Math.sin(t*3.8+level));});
    }
  }
}

export function assembleCrown(model,c){
  const {body,head,limbs,motif}=model;
  const {group,put,ball,plate,rod,box,halo,cloth,gem,cone,cylinder}=c;
  const posed=[];
  const animate=pose=>posed.push(pose);
  const panel=(parent,shape,finish,depth,z=0)=>plate(parent,shape,finish,depth,z);
  const jewel=(parent,x,y,z,scale=.08)=>put(parent,gem,'core',x,y,z,scale,scale*1.48,scale*.71);
  function silk(p,x,y,z,width,length,yaw,tilt){
    const anchor=group(p,x,y,z);anchor.rotation.y=yaw;
    const tail=cloth(anchor,0,0,0,width,length,tilt,true);
    animate((t,p,w,k,g)=>{
      anchor.rotation.x=-.13*Math.cos(t*3.1+tilt*2)-g*.51-w*.25+k*.39;
      tail.rotation.z=tilt+Math.sin(t*2.6-yaw)*(.10+g*.12)*(1+p*.3);
    });
    return tail;
  }
  function petals(parent,y,radius,count,kind){
    for(let i=0;i<count;i++){
      const yaw=i*TAU/count,base=group(parent,Math.sin(yaw)*radius,y,Math.cos(yaw)*radius);
      base.rotation.y=yaw;
      const petal=group(base);
      const tip=-1.11;
      panel(petal,[[-.14,.04],[.17,.04],[.31,-.32],[.21,tip+.22],[0,tip],[-.19,tip+.18],[-.33,-.32]],i%2?'body':'edge',.061);
      panel(petal,[[-.12,-.18],[.12,-.18],[.18,-.39],[0,tip+.18],[-.15,-.40]],'glass',.030,.052);
      for(const side of [-1,1])rod(petal,'trim',[0,tip+.065,.05],[side*.17,-.28,.05],.013);
      jewel(petal,0,-.24,.064,.043);
      if(kind==='crown'){petal.rotation.z=PI;petal.scale.set(.55,.455,.77);}
      const pitch=kind==='crown'?.49:-.49;
      animate((t,p,w,k,g)=>{petal.rotation.x=pitch-i%2*.24-p*.37-w*.23+k*.26+.10*Math.sin(t*2.9+i)*(.6+g);});
    }
  }
  if(motif.kind==='owl'||motif.kind==='moth'){
    for(const [index,wing] of model.wings.entries())spreadCrownWing(wing,index?1:-1,motif.kind,c,animate);
    for(let i=0;i<3;i++){
      const row=group(body,(i-1)*.16,.68,-.365);
      panel(row,[[-.13,0],[.14,.07],[.28,-.32],[.06,-.79],[-.13,-.68],[-.23,-.28]],i%2?'trim':'body',.039);
      rod(row,'edge',[0,-.02,.024],[.061,-.68,.025],.013);
      silk(row,0,-.31,-.049,.15,.66,i*.11,(i-1)*.20);
      animate((t,p,w,k,g)=>{row.rotation.x=.07+g*.48-k*.18+Math.sin(t*3.4+i)*(.10+p*.08);row.rotation.z=(i-1)*(.16+p*.22);});
    }
    if(motif.kind==='moth')for(const side of [-1,1]){
      rod(head,'trim',[side*.15,.29,-.04],[side*.37,.61,-.04],.021);
      rod(head,'trim',[side*.37,.61,-.04],[side*.44,.70,-.112],.013);
      jewel(head,side*.44,.70,-.112,.055);
    }
  }
  if(motif.kind==='lotus'){
    petals(body,1.19,.36,8,'lotus');
    petals(head,.47,.21,5,'crown');
    for(const side of [-1,1]){
      silk(body,side*.42,1.91,-.24,.28,1.69,side*.36,side*.28);
      silk(head,side*.30,.12,-.108,.13,.84,side*.32,side*.24);
    }
    halo(body,0,1.60,-.43,.52,'trim');
  }
  if(motif.kind==='fox'){
    for(const side of [-1,1]){
      silk(body,side*.42,2.14,-.32,.39,1.67,side*.26,side*.15);
      rod(body,'trim',[side*.22,1.63,-.26],[side*.66,2.29,-.36],.033);
      const bell=group(body,side*.66,2.28,-.39);
      put(bell,cone,'body',0,-.209,0,.19,.48,.18);
      halo(bell,0,-.395,0,.193,'trim',PI/2);
      jewel(bell,0,-.41,0,.064);
      animate((t,p,w,k,g)=>{bell.rotation.x=Math.sin(t*(3.4+p)+side)*(.15+g*.19)+k*.34;bell.rotation.z=side*(.10+w*.20-k*.31);});
    }
    for(let i=0;i<5;i++)put(body,gem,i%2?'edge':'core',0,1.89-i*.17,-.373,.105,.060,.053);
  }
  if(motif.kind==='furnace'){
    for(const side of [-1,1]){
      const stack=group(body,side*.53,1.77,-.22);
      put(stack,cylinder,'dark',0,.36,0,.181,.68,.181);
      put(stack,cylinder,'trim',0,.70,0,.225,.10,.225);
      put(stack,cylinder,'core',0,.752,0,.14,.035,.14);
      for(let i=0;i<3;i++)halo(stack,0,.13+i*.24,0,.182,i===1?'body':'trim',PI/2);
      const grate=group(stack,0,.15,-.17);
      for(let i=0;i<4;i++)box(grate,i%2?'core':'trim',(i-1.5)*.073,.09,-.032,.03,.28,.045);
      const crest=panel(stack,[[0,0],[side*.39,.19],[side*.20,.45],[0,.29]],'body',.068,.10);
      animate((t,p,w,k)=>{stack.rotation.z=side*(-.13-p*.34-w*.19+k*.18);crest.position.x=side*p*.22;});
    }
    for(let i=0;i<4;i++)box(body,i%2?'body':'trim',0,1.14+i*.17,-.39,.40,.078,.11);
  }
  if(motif.kind==='weaver'){
    for(const side of [-1,1]){
      const slab=group(body,side*.36,1.05,-.18);
      panel(slab,[[-.24,-.17],[-.28,.48],[0,.73],[.26,.51],[.24,-.17]],'edge',.14);
      panel(slab,[[-.2,-.09],[-.2,.46],[0,.64],[.18,.44],[.17,-.09]],'dark',.04,.10);
      for(let i=0;i<4;i++)box(slab,i===3?'core':'trim',0,.37-i*.14,.134,(.22-i*.019),.018,.008);
      for(let i=0;i<3;i++)rod(slab,'trim',[-.132,.34-i*.13,-.085],[.128,.34-i*.13,-.085],.014);
      silk(slab,0,.060,-.10,.34,.72,side*.33,side*.24);
      animate((t,p,w,k,g)=>{slab.rotation.x=-.96+p*.44+w*.36-k*.24;slab.rotation.y=side*(.36+p*.59+Math.sin(t*2.9)*g*.09);slab.rotation.z=-side*(.2+p*.30);});
    }
    for(const side of [-1,1])for(let i=0;i<3;i++)jewel(head,side*(.20+i*.039),.21-i*.105,.225-i*.014,.044-i*.007);
  }
  if(motif.kind==='vault'){
    const treasury=group(body,0,1.24,0);
    ball(treasury,'dark',0,.01,0,.71,.27,.68);
    jewel(treasury,0,.36,0,.181);
    for(const side of [-1,1]){
      const leaf=group(treasury,side*.08,.07,-.14);
      const lid=ball(leaf,'body',side*.39,.24,.036,.40,.31,.69);lid.rotation.z=-side*.26;
      for(let i=0;i<3;i++){
        const rib=halo(leaf,side*(.395-i*.085),.22+i*.077,.034,.61-i*.09,'trim',PI*.5);
        rib.scale.set(.53-i*.067,.79-i*.14,.51);rib.rotation.y=side*.43;
        jewel(leaf,side*.43,.42-i*.031,-.48+i*.36,.051);
      }
      panel(leaf,[[0,.11],[side*.58,.09],[side*.63,.32],[side*.44,.53],[side*.11,.61]],'trim',.072,-.51);
      const lock=group(leaf,side*.19,.36,-.53);
      halo(lock,0,0,-.021,.145,'edge');
      box(lock,'dark',0,0,-.043,.145,.16,.063);
      jewel(lock,0,-.015,-.083,.058);
      animate((t,p,w,k)=>{leaf.rotation.z=side*(-.12+p*.56+w*.15+k*.10);leaf.position.x=side*(.08+p*.15);});
    }
    for(const [index,limb] of limbs.entries()){
      const side=index%2?1:-1;
      ball(limb.joint,'trim',side*.11,-.13,-.011,.15,.16,.20).rotation.z=side*.23;
    }
  }
  if(motif.kind==='eclipse'){
    const sun=group(body,0,1.01,-.18);
    jewel(sun,0,0,0,.31);
    for(let i=0;i<3;i++){
      const g=group(sun);
      halo(g,0,0,0,.44+i*.17,i===1?'core':'trim');
      for(let j=0;j<7;j++){
        const a=j*TAU/7,r=.44+i*.17;
        const arc=put(g,gem,j%3?'body':'edge',Math.cos(a)*r,Math.sin(a)*r,0,.061,.14,.043);arc.rotation.z=a-PI/2;
      }
      animate((t,p,w,k)=>{g.rotation.set(i*.61+p*.36*Math.sin(t*.8+i),t*(i%2?.82:-.47)*(1+p*.23)+w*.42, i*.71-t*.38-k*.32);});
    }
    for(const side of [-1,1])silk(body,side*.28,1.39,-.30,.20,1.24,side*.19,side*.28);
  }
  if(motif.kind==='deer'){
    for(const side of [-1,1]){
      const branch=group(head,side*.22,.20,-.16);
      const joints=[[0,0,0],[side*.11,.29,-.04],[side*.35,.53,-.16],[side*.48,.84,-.40]];
      for(let i=1;i<joints.length;i++){
        rod(branch,i===1?'body':'edge',joints[i-1],joints[i],.077-i*.014);
        const [x,y,z]=joints[i];
        rod(branch,'trim',[x,y,z],[x-side*.07,y+.24,z+.081],.032-i*.005);
        jewel(branch,x-side*.07,y+.24,z+.081,.046);
      }
      animate((t,p,w,k)=>{branch.rotation.z=side*(p*.18+w*.13-k*.24);branch.rotation.y=side*Math.sin(t*2.1)*(.035+p*.03);});
      for(let i=0;i<3;i++){
        const g=group(body,side*(.25+i*.17),1.13+(i===1?.31:.19),-.31-i*.17);
        put(g,cylinder,'trim',0,.14,0,.046,.36,.046);
        ball(g,'body',0,.33,0,.205-i*.019,.125,.174);
        halo(g,0,.285,0,.155-i*.009,'core',PI/2);
        for(let j=0;j<4;j++){
          const a=j*1.59;
          rod(g,'edge',[0,.28,0],[Math.sin(a)*.145,.28,Math.cos(a)*.135],.010);
        }
        animate((t,p,w,k,gait)=>{g.rotation.x=.12+Math.sin(t*3.2+i)*(.12+gait*.15)-p*.30;g.rotation.z=side*(.36+(i-1)*.23+p*.24);});
      }
    }
  }
  if(motif.kind==='warden'){
    for(const side of [-1,1]){
      const brow=group(head,side*.14,.24,-.03);
      panel(brow,[[0,-.03],[side*.18,-.07],[side*.53,.19],[side*.52,.43],[side*.35,.32],[side*.26,.47],[side*.13,.34],[side*.057,.61]],'trim',.106);
      panel(brow,[[side*.043,.06],[side*.167,.051],[side*.42,.30],[side*.25,.26],[side*.13,.25]],'core',.025,.061);
      panel(brow,[[side*.061,.23],[side*.14,.26],[side*.17,.14],[side*.056,.15]],'body',.021,.081);
      rod(brow,'edge',[side*.125,.12,-.054],[side*.423,.25,-.071],.016);
      jewel(brow,side*.30,.24,-.069,.030);
      animate((t,p,w,k)=>{brow.position.x=side*(.14+p*.11);brow.rotation.z=-side*(p*.32+w*.17-k*.10);});
      const jaw=group(head,side*.23,-.154,.128);
      panel(jaw,[[0,.12],[side*.075,.097],[side*.093,-.053],[side*.027,-.206],[-side*.024,-.17]],'body',.064);
      rod(jaw,'edge',[0,.068,.048],[side*.032,-.151,.044],.012);
      silk(body,side*.41,2.08,-.40,.55,1.90,side*.31,side*.34);
      const shoulder=group(body,side*.51,1.83,.013);
      for(let row=0;row<3;row++){
        const y=.23-row*.11;
        const guard=panel(shoulder,[[0,y+.09],[side*.17,y+.13],[side*.33,y+.08],[side*.31,y-.086],[side*.119,y-.067]],row%2?'trim':'body',.18);
        guard.rotation.y=-side*.27;
        rod(shoulder,'trim',[side*.036,y+.084,.092],[side*.261,y+.086,.143],.013);
        put(shoulder,gem,'edge',side*.188,y+.039,.128,.021,.021,.021);
      }
      animate((t,p,w,k,g)=>{shoulder.rotation.z=side*(.08+p*.24+w*.33-k*.27+g*.067*Math.sin(t*4));});
      for(let i=0;i<3;i++){
        const row=group(body,side*(.32+i*.026),1.52-i*.22,-.27);
        const lame=panel(row,[[-.14,.09],[.17,.12],[.19,-.09],[.05,-.25],[-.11,-.19]],'body',.08);
        lame.rotation.y=side*.45;
        rod(row,'trim',[-.13,.06,-.051],[.16,.11,-.047],.021);
        animate((t,p,w,k,g)=>{row.rotation.x=.23+i*.12+w*.33-k*.45;row.rotation.z=side*(p*.18+g*.19*Math.sin(t*4.6-i*.32));});
      }
    }
    const collar=group(body,0,2.055,.009);
    halo(collar,0,-.025,0,.32,'body',PI/2);
    panel(collar,[[-.26,.018],[-.12,.092],[0,.015],[.12,.092],[.26,.018],[.20,-.094],[-.20,-.094]],'trim',.104,.19);
    const sternum=group(body,0,1.49,.347);
    jewel(sternum,0,.015,.055,.122);
    halo(sternum,0,.015,.043,.153,'edge');
    const crownSpine=group(head,0,.30,-.252);
    panel(crownSpine,[[-.09,-.18],[-.10,.28],[0,.62],[.10,.28],[.09,-.18],[0,-.25]],'body',.079);
    rod(crownSpine,'edge',[0,.04,-.051],[0,.48,-.071],.023);
    jewel(crownSpine,0,.18,-.061,.045);
    animate((t,p,w,k)=>{crownSpine.rotation.x=p*.24+w*.14-k*.18;});
    for(const side of [-1,1])for(let i=0;i<4;i++){
      rod(sternum,'trim',[side*.245,.37-i*.22,-.064],[side*(.07+i*.039),.28-i*.22,.12],.031-i*.003);
    }
    for(const limb of limbs){
      const side=limb.phase===0?1:-1;
      const p=limb.knee;
      panel(p,[[-.108,-.031],[.099,-.035],[.138,-.18],[.061,-.36],[-.063,-.30],[-.132,-.14]],'body',.068,.136);
      rod(p,'trim',[0,-.044,.18],[side*.039,-.274,.18],.018);
      box(p,'edge',side*.064,-.11,-.110,.14,.20,.047).rotation.z=side*.24;
    }
    const left=model.limbs.find(limb=>limb.arm&&limb.phase===PI)?.hand;
    if(left){
      const shackle=group(left,0,-.05,.20);
      halo(shackle,0,0,0,.17,'trim');
      jewel(shackle,0,0,.04,.10);
      markEnemyWeapon(shackle,[0,.12,.02],{from:[0,-.13,0],kind:'ring',aim:false,width:.28});
    }
  }
  return (time,phase,wind,strike,travel,fall)=>{
    const change=Math.min(1,phase*.68)*(1-fall*.49);
    for(const pose of posed)pose(time,change,wind,strike,travel);
  };
}
