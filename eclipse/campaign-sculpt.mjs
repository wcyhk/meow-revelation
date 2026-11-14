import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {fitGuardianCollar,sculptGuardianHead} from './campaign-guardian-armour.mjs?v=maskwork-1';
import {detailBossVariant,detailForestGuardian} from './enemy-sculpt.mjs?v=turnaround-2';

const TAU=Math.PI*2;
const opposite=(side,points)=>points.map(([x,...rest])=>[x*side,...rest]);
const low={sides:7,rings:8,section:1.68,ridge:.14};
const shape=(k,joint,finish,path,options=low)=>k.geometry(joint,finish,
  sculptVolume(path.map(([x,y,z,w,h=w])=>[x,y,z,w,h]),options));
const plate=(k,joint,finish,front,depth=.055)=>k.sculpt.plate(joint,finish,front,depth,depth*.32);
const seam=(k,joint,finish,path,r=.023)=>k.sculpt.sweep(joint,finish,path.map(p=>[...p,r]),{sides:5,steps:7,ridge:.17});
const jewel=(k,joint,finish,x,y,z,a,b=a,c=a,rz=0)=>k.mesh(joint,'gem',finish,x,y,z,a,b,c,0,0,rz);
const studs=(k,joint,points,r=.031)=>points.forEach(([x,y,z])=>jewel(k,joint,'trim',x,y,z,r));

// Long torn strips are built as solid swept sections. Repeated seams run down
// both sides and the folds have thickness for the model turnaround.
function fabric(k,joint,finish,path,seed=0){
  shape(k,joint,finish,path,{sides:8,rings:13,section:3.2,ridge:.29,seed});
  for(const face of [-1,1]){
    const line=path.map(([x,y,z,r,t],i)=>[x+r*(i%2?.26:-.26),y,z+face*t*.84,.010*(1-i*.11)]);
    k.sculpt.sweep(joint,'trim',line,{sides:5,steps:10,ridge:.2});
  }
}

function face(k,head,{z=.24,width=.26,length=.35,style='mask'}={}){
  const hollow=style==='hood',ave=style==='owl'||style==='beak';
  const high=ave?.31:.26;
  const lean=ave?.13:.049;
  shape(k,head,'deep',[[0,-length*.71,z-.11,width*.55,.10],[0,-length*.33,z-.116,width*.94,.20],
    [0,.04,z-.12,width,.22],[0,high*.69,z-.15,width*.83,.19],[0,high,z-.19,width*.35,.113]],
  {sides:13,rings:15,section:2.65,ridge:.12});
  if(style==='coin'){
    for(const sign of [-1,1]){
      k.mesh(head,'bar','trim',0,0,z+sign*.08,.31,.095,.31,Math.PI*.5);
      k.mesh(head,'ring','edge',0,0,z+sign*.12,.294,.294,.20);
      k.mesh(head,'metal','deep',0,0,z+sign*.185,.127,.121,.024,0,0,Math.PI*.25);
      for(let i=0;i<12;i++){
        const a=i*TAU/12;jewel(k,head,'body',Math.sin(a)*.227,Math.cos(a)*.227,z+sign*.134,.031,.039,.046,a);
      }
    }
    return;
  }
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    plate(k,head,hollow?'body':'edge',fan([[.025,high-.014,z+.022],[width*.75,high-.056,z+.011],
      [width*1.18,high-.18,z-.09],[width*.95,-length*.25,z+.023],[width*.49,-length*.63,z+.06],
      [.035,-length*.38,z+.128]]),.044);
    seam(k,head,'trim',fan([[.021,high-.020,z+.053],[width*.74,high-.056,z+.027],
      [width*.94,.072,z+.012],[width*.55,-length*.56,z+.108]]),.018);
    const eyeX=width*.49,eyeY=.04+lean*.2;
    plate(k,head,'deep',fan([[eyeX-.091,eyeY+.028,z+.099],[eyeX+.105,eyeY+.058,z+.058],
      [eyeX+.082,eyeY-.042,z+.074],[eyeX-.063,eyeY-.038,z+.105]]),.028);
    if(style!=='blank')jewel(k,head,'glow',side*eyeX,eyeY,z+.123,.047,.032,.03,side*.31);
  }
  if(ave)shape(k,head,'edge',[[0,.056,z+.062,.084,.066],[0,-.022,z+.198,.081,.076],
    [0,-length*.45,z+.303,.047,.043],[0,-length*.82,z+.348,.008,.006]],low);
  else if(style==='helmet')plate(k,head,'trim',[[0,high,z+.045],[-.045,.08,z+.139],[-.038,-.196,z+.127],
    [0,-.24,z+.16],[.038,-.196,z+.127],[.045,.08,z+.139]],.038);
}

function lantern(k,parent,x,y,z,size=.52){
  const joint=k.bone(parent,x,y,z);
  joint.scale.setScalar(size);
  shape(k,joint,'trim',[[0,-.47,0,.056,.056],[0,-.37,0,.23,.22],[0,-.32,0,.245,.245],
    [0,-.27,0,.19,.19]],{sides:8,rings:8,section:2.1,ridge:.09});
  shape(k,joint,'trim',[[0,.20,0,.22,.22],[0,.26,0,.25,.25],[0,.33,0,.14,.14],
    [0,.42,0,.08,.08]],{sides:8,rings:8,section:2.1,ridge:.09});
  k.mesh(joint,'ring','trim',0,.44,0,.099,.13,.77);
  jewel(k,joint,'glow',0,-.065,0,.152,.23,.157);
  for(let i=0;i<6;i++){
    const a=i*TAU/6,X=Math.cos(a),Z=Math.sin(a);
    k.sculpt.sweep(joint,'trim',[[X*.172,.22,Z*.172,.031],[X*.235,.06,Z*.235,.026],
      [X*.228,-.225,Z*.228,.017],[X*.174,-.31,Z*.174,.024]],{sides:5,steps:8});
  }
  return joint;
}

function bell(k,joint,size){
  const {mesh}=k;
  const profile=[[.11,.50],[.24,.43],[.34,.20],[.39,-.08],[.46,-.29],[.55,-.36],
    [.56,-.42],[.43,-.42],[.37,-.34],[.33,-.17],[.29,.04],[.14,.37]];
  const geo=new T.LatheGeometry(profile.map(([x,y])=>new T.Vector2(x,y)),30);
  geo.scale(size,size,size);
  k.geometry(joint,'trim',geo);
  mesh(joint,'ring','edge',0,-.34*size,0,.526*size,.526*size,size,Math.PI*.5);
  mesh(joint,'ring','body',0,.13*size,0,.36*size,.36*size,size*.56,Math.PI*.5);
  mesh(joint,'bar','deep',0,-.445*size,0,.037*size,.40*size,.037*size);
  jewel(k,joint,'glow',0,-.639*size,0,.09*size,.17*size,.09*size);
  for(let i=0;i<10;i++){
    const a=i*TAU/10, x=Math.cos(a)*size,z=Math.sin(a)*size;
    jewel(k,joint,'edge',x*.392,-.18*size,z*.392,.049*size,.084*size,.049*size);
  }
}

function hookedBlade(k,joint,{length=1.1,breadth=.24,tear=.05}={}){
  shape(k,joint,'deep',[[0,-.47,0,.061,.055],[0,-.255,.08,.069,.057],[0,.01,.17,.083,.079]]);
  k.mesh(joint,'ring','trim',0,.014,.171,.153,.122,.74,Math.PI*.5);
  shape(k,joint,'edge',[[0,-.001,.18,breadth*.76,.072],[-.034,.22,.25,breadth,.077],
    [breadth*.41,length*.48,.325,breadth*.88,.058],[breadth*.86,length*.81,.37,breadth*.58,.046],
    [breadth*.70,length,.44,.006,.006]],{sides:10,rings:22,section:1.7,ridge:.06});
  for(const face of [-1,1])k.sculpt.sweep(joint,'glow',[
    [.014,.118,.235+face*.053,.020],[-.012,.38*length,.29+face*.051,.018],
    [breadth*.36,.64*length,.36+face*.041,.013],[breadth*.79,.82*length-tear,.39+face*.017,.004],
  ],{sides:5,steps:12,ridge:.19});
}

function torque(k,joint,radius,finish='trim',twists=12){
  k.mesh(joint,'ring',finish,0,0,0,radius,radius,.66);
  k.mesh(joint,'ring','edge',0,0,-.055,radius*.91,radius*.91,.40);
  for(let i=0;i<twists;i++){
    const a=i*TAU/twists;
    jewel(k,joint,i%3?'edge':'glow',Math.sin(a)*radius,Math.cos(a)*radius,-.024,
      radius*.07,radius*(i%3?.08:.17),radius*.049,-a);
  }
}

function hardshell(k,joint,y,z,w,span=.46,edge='edge',id=1){
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    const path=fan([[0,y+.095,z+.048],[w*.73,y+.24,z-.024],[w*1.03,y+.026,z-.17],
      [w*.96,y-.18,z-.22],[w*.53,y-span,z-.159],[.014,y-span+.07,z+.035]]);
    plate(k,joint,edge,path,.064);
    seam(k,joint,'trim',path.slice(1,5),.018);
    studs(k,joint,[path[1],path[3]],.025);
    const inward=Math.sign(z);
    const rune=fan([[w*.31,y+.122,z+inward*.094,.008],[w*.52,y+.034,z+inward*.047,.014],
      [w*.43,y-.13,z+inward*.021,.018],[w*.58,y-.215,z-inward*.025,.004]]);
    if(id%2===0)k.sculpt.sweep(joint,'glow',rune,{sides:5,steps:7});
  }
}

function cloak(k,body,layout,flaps,colors=['deep','body','edge']){
  for(let i=0;i<layout.length;i++){
    const [x,z,width,length,flow]=layout[i];
    const root=k.bone(body,x,.57,z);
    const slide=Math.sign(x)||1;
    fabric(k,root,colors[i%colors.length],[[0,.10,0,width*.40,.041],[slide*.105,-length*.32,flow*.23,width*.79,.046],
      [slide*.19,-length*.53,flow*.49,width*.71,.031],[slide*.20,-length*.76,flow*.70,width*.50,.022],
      [slide*.32,-length,flow,width*.037,.007]],i);
    flaps.push({joint:root,axis:'x',amp:.14+(i%3)*.07,bias:0,seed:i*.81});
  }
}

function fighter(k,profile){
  const {root,bone,mesh}=k;
  const {broad=.46,neck=.77,ground=.90,armLength=.69,helmet='helmet',height=1.05,legs=true,
    style='duel',finish='body',weapon,headwear,guardianType,mobile=false}=profile;
  const body=bone(root,0,ground,0),head=bone(body,0,neck,.053);
  const flaps=[],arms=[],feet=[],joints=[];
  shape(k,body,finish,[[0,-.31,-.03,broad*.54,broad*.49],[0,-.11,-.066,broad*.74,broad*.67],
    [0,.20,-.037,broad*.89,broad*.70],[0,.45,-.016,broad,broad*.77],
    [0,.59,-.036,broad*.73,broad*.66],[0,neck-.031,-.021,broad*.32,broad*.38]],
  {sides:16,rings:19,section:2.86,ridge:.16});
  const jaw=guardianType?sculptGuardianHead(k,head,guardianType,mobile):
    face(k,head,{width:broad*.55,z:broad*.51,style:helmet,length:.27+height*.078});
  if(guardianType)fitGuardianCollar(k,body,guardianType,broad,mobile);
  const back=bone(body,0,.22,-broad*.54);
  flaps.push({joint:back,axis:'x',amp:.11,bias:.04,seed:4.8});
  const grips=[];
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    const arm=bone(body,side*broad*.94,.44,.016),elbow=bone(arm,side*.051,-armLength*.54,.012);
    const grip=bone(elbow,side*.011,-armLength*.36,.107);
    grips.push(grip);
    arms.push(arm);
    joints.push({joint:elbow,side});
    shape(k,arm,finish,fan([[0,.15,-.02,.087,.089],[.031,.016,-.02,.167,.151],[.042,-armLength*.26,.017,.151,.135],
      [.037,-armLength*.54,.014,.103,.111]]),{sides:10,rings:11,section:2.45,ridge:.18});
    shape(k,elbow,'deep',fan([[.01,.04,.014,.101,.116],[.05,-.10,.031,.136,.128],[.031,-armLength*.36,.085,.110,.095],
      [.013,-armLength*.48,.129,.079,.091]]),{sides:8,rings:10,section:2.6,ridge:.15});
    shape(k,grip,'edge',fan([[.013,.045,-.008,.077,.079],[.024,-.023,.009,.105,.112],
      [.04,-.132,.044,.083,.068],[.035,-.171,.059,.011,.016]]),low);
    if(style==='duel'||style==='heavy'){
      for(let i=0;i<3;i++){
        const y=.13-i*.094;
        plate(k,arm,i===0?'edge':'body',fan([[-.086,y+.104,-.10],[.13,y+.137,-.117],[.294,y+.031,-.03],
          [.21,y-.097,.15],[.042,y-.123,.169],[-.095,y-.042,.103]]),.043);
        seam(k,arm,'trim',fan([[.042,y+.087,.152],[.155,y+.061,.167],[.235,y-.03,.101]]),.019);
      }
      for(let i=0;i<2;i++)plate(k,elbow,i%2?'trim':'edge',fan([[-.10,-.039-i*.12,.083],[.11,-.05-i*.12,.106],
        [.16,-.142-i*.12,.091],[.068,-.27-i*.09,.12],[-.074,-.209-i*.12,.103]]),.044);
    }
    if(legs){
      const hip=bone(root,side*broad*.59,ground-.212,.04);
      const knee=bone(hip,side*.017,-ground*.39,.033);
      feet.push(hip);
      flaps.push({joint:knee,axis:'x',amp:.072,bias:-.06,seed:side*.86,stride:true});
      shape(k,hip,'deep',fan([[0,.097,0,.14,.143],[.02,-.125,-.01,.172,.151],
        [.02,-ground*.42,.032,.113,.131]]),{sides:10,rings:12,section:2.55,ridge:.11});
      shape(k,knee,finish,fan([[.02,.032,0,.11,.113],[.03,-.144,.043,.13,.149],[.045,-ground*.36,.118,.113,.114],
        [.04,-ground*.46,.13,.086,.118]]),{sides:10,rings:12,section:2.55,ridge:.13});
      for(let i=-1;i<=1;i++)
        shape(k,knee,'edge',[[i*.076,-ground*.40,.13,.062,.065],[i*.078,-ground*.44,.26,.055,.055],
          [i*.092,-ground*.487,.34,.014,.012]],low);
    }
  }
  const collar=bone(head,0,-.195,-.12);
  flaps.push({joint:collar,axis:'z',amp:.05,bias:.0,seed:6});
  if(headwear)headwear(k,head,collar);
  if(weapon)weapon(k,body,back,head,grips,flaps);
  return {body,head,crest:bone(body,0,.10,0),arms,legs:feet,pattern:style==='heavy'?'slam':style==='shade'?'hover':'duel',
    campaign:{flaps,joints,jaw},back};
}

function vest(k,body,broad,height,flaps){
  for(let i=0;i<3;i++){
    const y=.49-i*.168;
    hardshell(k,body,y,broad*.68,broad*(.81-i*.03),height*.36,i%2?'body':'edge',i);
    hardshell(k,body,y,-broad*.62,broad*(.72-i*.05),height*.31,'body',i+1);
    jewel(k,body,'trim',0,y-.057,broad*.79,.067,.088,.028);
  }
  cloak(k,body,[[-broad*.67,-broad*.55,.18,1.18,-.37],[-.13,-broad*.71,.19,1.25,-.31],
    [.13,-broad*.70,.19,1.19,-.28],[broad*.66,-broad*.51,.18,1.15,-.33]],flaps);
}

function antlers(k,head,{span=.47,reach=.62,prongs=3,finish='edge',width=.088}={}){
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    const spine=[[.15,.12,-.07,width],[span*.57,reach*.55,-.10,width*1.14],[span*.83,reach*.84,-.21,width*.67],
      [span*1.06,reach,-.32,width*.34],[span*.88,reach*1.30,-.38,.007]];
    shape(k,head,finish,fan(spine));
    for(let i=0;i<prongs;i++){
      const [x,y,z]=spine[i+1];
      shape(k,head,i%2?'trim':finish,fan([[x,y,z,width*.51],[x+.093,y+.12,z+.046,width*.38],
        [x+.19,y+.235,z+.091,.008]]));
    }
  }
}

function ritualCowl(k,head,collar,width=.35){
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    plate(k,head,'edge',fan([[0,.36,.096],[width*.56,.26,.067],[width*.98,.06,.19],
      [width*1.04,-.273,.212],[width*.63,-.21,.227],[width*.57,.15,.265]]),.057);
    fabric(k,head,'deep',fan([[width*.49,.334,-.117,.117,.061],[width*.88,.139,-.277,.158,.082],
      [width*.78,-.244,-.256,.165,.065],[width*.61,-.564,-.28,.118,.029]]),4);
    fabric(k,collar,'body',fan([[width*.63,.045,-.077,.091,.040],[width*1.11,-.082,-.09,.11,.052],
      [width*1.29,-.42,-.123,.079,.034],[width*1.52,-.59,-.205,.007,.007]]),11);
  }
  const bridge=[[0,.23,.14,.164,.12],[0,.34,.074,.193,.139],[0,.50,-.072,.14,.14],[0,.51,-.20,.068,.091]];
  shape(k,head,'body',bridge,{sides:15,rings:14,section:2.44,ridge:.13});
}

function archetypes(){
  const armored=(broad,height,length,headwear,sidework)=>k=>fighter(k,{
    broad,height,headwear,
    weapon(k,body,back,head,grips,flaps){
      vest(k,body,broad,height,flaps);
      if(length)hookedBlade(k,grips[1],{length,breadth:broad*.43});
      sidework?.(k,body,back,head,grips,flaps);
    },
  });
  return {
    imp:k=>fighter(k,{broad:.44,ground:.77,neck:.54,armLength:.91,style:'heavy',helmet:'mask',
      headwear(k,h){antlers(k,h,{span:.53,reach:.66,prongs:3,finish:'deep',width:.062});},
      weapon(k,b,back,h,hands){
        hardshell(k,b,.414,.305,.425,.38,'body');
        hardshell(k,b,.408,-.386,.401,.38,'deep');
        for(const side of [-1,1])for(let i=0;i<4;i++){
          const x=(i-1.5)*.058,hand=hands[side===1?1:0];
          shape(k,hand,'trim',[[x,-.04,.094,.044],[x*1.6,-.15,.138,.041],[x*1.74,-.22,.24,.027],[x*1.5,-.285,.26,.004]]);
          shape(k,back,'edge',opposite(side,[[.14,.18+i*.14,-.048,.093],[.29,.35+i*.15,-.18,.093],[.33,.48+i*.119,-.37,.006]]));
        }
      },
    }),
    cultist:k=>fighter(k,{broad:.33,armLength:.63,helmet:'beak',height:1.11,style:'duel',
      headwear(k,h,c){ritualCowl(k,h,c,.35);},
      weapon(k,b,back,h,hands,flaps){
        cloak(k,b,[[-.30,.16,.22,1.16,.25],[-.16,-.206,.20,1.28,-.47],[.06,-.25,.24,1.35,-.44],[.27,-.17,.23,1.29,-.35],[.316,.16,.198,1.09,.24]],flaps);
        const lamp=lantern(k,hands[1],.11,-.19,.16,.73);
        flaps.push({joint:lamp,axis:'z',amp:.35,bias:-.10,seed:4.3});
        for(let n=0;n<5;n++)jewel(k,b,'trim',0,.366-n*.092,.30+.015*n,.039,.047,.026);
      },
    }),
    knight:armored(.48,1.05,1.05,
      (k,h)=>antlers(k,h,{span:.38,reach:.49,prongs:2,finish:'deep',width:.073}),
      (k,b,back,h,hands)=>{
        for(let y=.35;y<=.79;y+=.133)for(const side of [-1,1])
          shape(k,back,'trim',opposite(side,[[.09,y,0,.044],[.32,y+.14,-.14,.056],[.65,y+.27,-.24,.009]]));
        plate(k,hands[0],'edge',[[-.37,.25,.20],[.03,.37,.17],[.39,.23,.19],[.26,-.23,.29],[0,-.44,.30],[-.24,-.20,.29]],.091);
        seam(k,hands[0],'glow',[[0,.25,.264],[-.10,.091,.265],[.089,-.06,.31],[0,-.21,.378]],.029);
      }),
    sentinel:armored(.41,1.22,1.48,(k,h)=>{
      for(let i=0;i<5;i++){
        const x=(i-2)*.125;
        shape(k,h,i%2?'trim':'edge',[[x,.117,.04,.077],[x*1.64,.337,-.042,.049],[x*2.48,.69-Math.abs(i-2)*.093,-.23,.005]]);
      }
    },(k,b,back)=>{
      for(const side of [-1,1])for(let i=0;i<5;i++){
        const x=.15+i*.073,y=.49-i*.085;
        shape(k,b,'edge',opposite(side,[[x,y,-.14,.077],[x+.125,y+.079,-.20,.084],[x+.302,y+.18,-.34,.007]]));
      }
    }),
    oracle:k=>fighter(k,{broad:.35,ground:1.10,neck:.85,helmet:'hood',legs:false,style:'shade',
      headwear(k,h,c){ritualCowl(k,h,c,.43);},
      weapon(k,b,back,h,hands,flaps){
        const astrolabe=k.bone(h,0,.073,-.367);
        torque(k,astrolabe,.68,'trim',11);
        flaps.push({joint:astrolabe,axis:'z',amp:.42,bias:.45,seed:2});
        const jewelHand=k.bone(hands[1],.057,.065,.43);
        jewel(k,jewelHand,'glow',0,0,0,.136,.19,.136);
        torque(k,jewelHand,.19,'trim',6);
        cloak(k,b,[[-.36,.18,.17,1.23,.22],[-.30,-.16,.20,1.27,-.51],[-.09,-.27,.19,1.44,-.55],
          [.10,-.27,.17,1.43,-.52],[.30,-.17,.24,1.28,-.41],[.31,.18,.17,1.19,.20]],flaps);
      },
    }),
    drummer:k=>fighter(k,{broad:.46,ground:.87,neck:.68,style:'heavy',helmet:'mask',
      headwear(k,h,c){antlers(k,h,{span:.36,reach:.48,prongs:1,width:.071});ritualCowl(k,h,c,.31);},
      weapon(k,b,back,h,hands,flaps){
        const drum=k.bone(b,0,.064,.49);
        k.mesh(drum,'bar','body',0,0,0,.412,.47,.42);
        for(const end of [-1,1]){
          k.mesh(drum,'ring','edge',0,end*.237,0,.414,.414,.62,Math.PI*.5);
          k.mesh(drum,'bar',end===1?'edge':'deep',0,end*.221,0,.39,.044,.39);
        }
        for(let i=0;i<10;i++){
          const a=i*TAU/10,b=a+.31,p=(a,y)=>[Math.cos(a)*.418,y,Math.sin(a)*.418];
          seam(k,drum,'trim',[p(a,-.251),p(b,.018),p(a,.251)],.021);
        }
        for(const grip of hands){
          shape(k,grip,'body',[[0,-.153,.014,.034],[0,.12,.19,.058],[0,.531,.34,.053],[0,.619,.411,.029]]);
          jewel(k,grip,'edge',0,.558,.37,.093,.109,.094);
        }
        cloak(k,b,[[-.33,-.22,.18,.91,-.26],[-.11,-.33,.19,1.04,-.29],[.23,-.27,.21,1.02,-.40]],flaps);
      },
    }),
    spriggan:k=>fighter(k,{broad:.35,ground:.77,neck:.61,helmet:'hood',finish:'deep',style:'heavy',
      headwear(k,h){
        antlers(k,h,{span:.57,reach:.72,prongs:3,finish:'body',width:.062});
        for(let i=0;i<8;i++){
          const a=i*2.39996,r=.10+(i%3)*.083;
          shelfMushroom(k,h,Math.cos(a)*r,.19+i*.032,Math.sin(a)*r-.085,.116+i%2*.046,a);
        }
      },
      weapon(k,b,back,h,hands,flaps){
        tendrils(k,b,7,flaps,{width:.44,origin:.26,span:.55,trail:.41,finish:'body'});
        for(const hand of hands)for(let i=0;i<3;i++){
          const x=(i-1)*.074;
          shape(k,hand,'edge',[[x,-.04,.123,.047],[x*1.2,-.19,.20,.035],[x*1.88,-.36,.17,.012],[x*1.4,-.449,.238,.004]]);
        }
      },
    }),
    coin:k=>fighter(k,{broad:.322,ground:1.10,neck:.74,helmet:'coin',legs:false,style:'shade',
      weapon(k,b,back,h,hands,flaps){
        cloak(k,b,[[-.37,.19,.16,1.24,.17],[-.31,-.19,.21,1.42,-.5],[-.08,-.29,.18,1.55,-.55],
          [.16,-.29,.24,1.48,-.48],[.29,-.18,.25,1.29,-.37],[.31,.14,.16,1.17,.32]],flaps);
        for(let i=0;i<7;i++){
          const link=k.bone(b,((i%3)-1)*.105,.33-i*.139,.34+i*.012);
          torque(k,link,.077+i%2*.026,'trim',4);
          flaps.push({joint:link,axis:'y',amp:.25,bias:.12,seed:i*.9});
        }
      },
    }),
    coffin:k=>fighter(k,{broad:.58,ground:1.04,armLength:.94,style:'heavy',helmet:'helmet',height:1.21,
      weapon(k,b,back,h,hands,flaps){
        for(const side of [-1,1]){
          const panel=opposite(side,[[0,1.18,-.17],[.415,.97,-.19],[.493,.53,-.20],[.421,-.45,-.21],[.28,-.77,-.22],[0,-.87,-.23]]);
          const returnPanel=panel.map(([x,y,z])=>[x,y,z-.27]);
          plate(k,back,'deep',panel,.154);plate(k,back,'body',returnPanel,.16);
          seam(k,back,'trim',returnPanel,.045);
          for(let i=0;i<6;i++){
            const y=.735-i*.237;
            seam(k,back,'edge',[[0,y+.03,-.50],[side*.205,y-.068,-.53],[side*.43,y,-.482]],.029);
          }
        }
        const lock=k.bone(back,0,.136,-.58);torque(k,lock,.166,'trim',6);
        jewel(k,lock,'glow',0,0,-.043,.039,.088,.039);
        hookedBlade(k,hands[1],{length:.96,breadth:.32});
        vest(k,b,.50,.94,flaps);
      },
    }),
    toller:k=>fighter(k,{broad:.37,ground:.94,neck:.79,helmet:'hood',armLength:.50,
      headwear(k,h,c){ritualCowl(k,h,c,.41);},
      weapon(k,b,back,h,hands,flaps){
        cloak(k,b,[[-.32,.15,.23,1.1,.29],[-.24,-.28,.25,1.28,-.40],[0,-.35,.21,1.35,-.45],
          [.23,-.28,.24,1.29,-.38],[.34,.12,.24,1.15,.31]],flaps);
        const burden=k.bone(b,0,1.13,-.72);
        bell(k,burden,1.12);
        for(const side of [-1,1]) seam(k,b,'trim',opposite(side,[[.27,.65,.04],[.43,.927,-.32],[.27,1.55,-.71]]),.056);
        flaps.push({joint:burden,axis:'x',amp:.28,bias:-.19,seed:2.4});
      },
    }),
  };
}

function tendrils(k,body,count,flaps,{width=.67,origin=.30,span=1.05,trail=.27,finish='body'}={}){
  for(let i=0;i<count;i++){
    const a=i*TAU/count,dx=Math.sin(a),dz=Math.cos(a);
    const tip=k.bone(body,dx*width*.70,origin,dz*width*.44);
    const reach=span*(.67+i%4*.135);
    for(let split=0;split<2;split++){
      const path=[[0,.06,0,.10,.077],[dx*reach*.17,.056,dz*trail*.31,.102,.073],
        [dx*reach*.39,-.19,dz*trail*.47,.075,.047],[dx*reach*.67,-reach*.54,dz*trail*.80,.051,.028],
        [dx*reach*(.99-split*.22),-reach*(.98-split*.23),dz*trail+split*.18,.006,.004]];
      if(split)path[2][0]*=.49;
      fabric(k,tip,split?'edge':finish,path,i+split*17);
    }
    flaps.push({joint:tip,axis:'z',amp:.26,bias:dx*.15,seed:i*.67});
  }
}

function shelfMushroom(k,body,x,y,z,r,rot){
  const joint=k.bone(body,x,y,z);
  joint.rotation.z=rot*.31;
  shape(k,joint,'trim',[[0,-r*.56,0,r*.21,r*.23],[0,0,0,r*.33,r*.28],[r*.16,r*.34,0,r*.24,r*.27]]);
  shape(k,joint,'body',[[0,0,0,r*.40,r*.39],[0,r*.07,0,r*.99,r*.89],[0,r*.31,.005,r*.71,r*.67],
    [0,r*.49,-.021,r*.25,r*.22]],{sides:10,rings:7,section:2.5,ridge:.27});
  for(let i=0;i<8;i++){
    const a=i*TAU/8;
    jewel(k,joint,i%3?'edge':'glow',Math.cos(a)*r*.75,r*.09,Math.sin(a)*r*.68,r*.078,r*.041,r*.075);
  }
}

function wraith(k,variant){
  const {root,bone}=k;
  const body=bone(root,0,1.04,0),head=bone(body,0,.54,.16),flaps=[],arms=[];
  const eyeForm=variant==='eyes';
  shape(k,body,variant==='wax'?'edge':'deep',[[0,-.48,-.11,.20,.15],[0,-.31,-.086,.43,.342],
    [0,.01,-.057,.50,.356],[0,.29,-.078,.39,.29],[0,.61,-.104,.25,.19],[0,.83,-.13,.07,.08]],
  {sides:16,rings:19,section:2.68,ridge:.22});
  if(eyeForm){
    for(let row=0;row<3;row++){
      const eyelids=bone(body,0,-.24+row*.26,0);
      for(let column=0;column<7;column++){
        const angle=(column+row*.33)*TAU/7;
        const sine=Math.sin(angle),cosine=Math.cos(angle);
        const x=sine*(.45-row*.073),z=cosine*(.29-row*.039);
        k.mesh(eyelids,'scale',column%2?'edge':'body',x+sine*.05,0,z+cosine*.05,.131,.123,.62,0,angle,column*.13);
        k.mesh(eyelids,'round','deep',x+sine*.105,.013,z+cosine*.105,.087,.063,.026,0,angle);
        k.mesh(eyelids,'gem','glow',x+sine*.124,.017,z+cosine*.124,.032,.045,.031,0,angle);
      }
      flaps.push({joint:eyelids,axis:'y',amp:.071,bias:0,seed:row*1.7});
    }
  }else{
    face(k,head,{style:variant==='veil'?'blank':'hood',width:variant==='wax'?.26:.217,z:.125,length:.32});
    ritualCowl(k,head,body,variant==='wax'?.26:.36);
  }
  if(variant==='wax'){
    for(let i=0;i<8;i++){
      const a=i*TAU/8,dx=Math.cos(a),dz=Math.sin(a);
      const wick=k.bone(body,dx*(.22+i%2*.086),.26+i%3*.182,dz*.23);
      shape(k,wick,'body',[[0,-.24,0,.085],[.02,-.123,0,.10],[.018,.025,0,.091]]);
      jewel(k,wick,'glow',.019,.10,0,.041,.095,.041,i*.21);
    }
    shellRift(k,body,.33);
  }
  const drops=variant==='wisp'?10:variant==='veil'?9:variant==='wax'?6:8;
  const modelWidths={wisp:.44,veil:.42,wax:.37,eyes:.45};
  const trailing={wisp:.61,veil:.33,wax:.15,eyes:.24};
  tendrils(k,body,drops,flaps,{width:modelWidths[variant],origin:.12,span:variant==='wax'?.57:1.02,trail:trailing[variant]});
  for(const side of [-1,1]){
    const root=bone(body,side*.29,.31,.025);
    arms.push(root);
    for(let i=0;i<3;i++)fabric(k,root,i===0?'deep':i===1?'edge':'body',opposite(side,[
      [0,.02,i*.05,.111,.051],[.15,-.06,i*.084,.09,.052],[.295,-.29,i*.106,.062,.035],
      [.34+i*.038,-.50-i*.052,.21-i*.15,.008,.006],
    ]),i*6+side);
  }
  return {body,head,arms,crest:bone(body,0,0,0),pattern:variant==='wax'?'slam':'hover',campaign:{flaps,joints:[]}};
}

function shellRift(k,body,z){
  const coords=[[-.143,.17,z],[.023,.37,z+.037],[.177,.225,z+.019],[.123,.022,z+.081],
    [.207,-.13,z+.047],[.038,-.27,z+.067],[-.15,-.17,z+.058],[-.201,-.012,z+.031]];
  plate(k,body,'deep',coords,.073);
  seam(k,body,'glow',coords.map(([x,y,w])=>[x,y,w+.046]),.018);
  jewel(k,body,'glow',.018,.089,z+.113,.061,.18,.061);
}

function quadruped(k,variant){
  const {root,bone}=k;
  const forge=variant==='forgeBeast';
  const armored=['salamander','forgeBeast','vaultTurtle'].includes(variant);
  const long=variant==='salamander'||forge;
  const antlered=variant==='stag';
  const length=variant==='vaultTurtle'?1.28:antlered?1.37:forge?1.52:long?1.20:1.08;
  const hip=variant==='vaultTurtle'?.46:antlered?.96:forge?.72:long?.53:.62;
  const girth=variant==='vaultTurtle'?.72:antlered?.35:forge?.46:long?.28:.345;
  const body=bone(root,0,hip,0),head=bone(body,0,antlered?.39:.11,length*.70);
  const tail=bone(body,0,0,-length*.74);
  const legs=[],joints=[],flaps=[];
  shape(k,body,'body',[[0,.029,-length*.89,girth*.54,girth*.53],[0,.06,-length*.58,girth*.85,girth*.77],
    [0,.07,-.09,girth*.94,girth*(antlered?.94:1.14)],[0,.11,length*.31,girth*.76,girth*.98],
    [.012,.12,length*.68,girth*.61,girth*.82],[0,.14,length*.83,girth*.41,girth*.53]],
  {sides:17,rings:23,section:2.52,ridge:armored?.18:.10});
  if(variant==='vaultTurtle'){
    shape(k,body,'body',[[0,.02,0,girth,.98],[0,.194,0,girth*1.23,1.08],[0,.38,-.06,girth,1.03],
      [0,.68,-.11,girth*.74,.78],[0,.82,-.09,girth*.59,.64]],{sides:18,rings:21,section:2.68,ridge:.14});
    for(let i=0;i<5;i++){
      const y=.39+i*.09,w=(.54-i*.065)*1.18;
      for(const side of [-1,1]){
        const fan=points=>opposite(side,points);
        plate(k,body,i%2?'trim':'edge',fan([[0,y+.089,-.65],[w,y,-.91],[w+.058,y-.117,-.64],
          [w+.056,y-.134,.21],[w*.78,y-.057,.53],[0,y+.093,.49]]),.064);
        seam(k,body,'trim',fan([[w+.055,y-.117,-.64],[w+.065,y-.134,-.13],[w+.005,y-.067,.26]]),.026);
      }
    }
    const seal=k.bone(body,0,.84,-.20);
    seal.rotation.x=-Math.PI*.15;torque(k,seal,.42,'trim',16);
    jewel(k,seal,'glow',0,0,.109,.139,.135,.091);
    for(const side of [-1,1]){
      const lamp=lantern(k,body,side*.69,.48,side*.52,.60);
      flaps.push({joint:lamp,axis:'z',amp:.12,bias:side*.12,seed:side});
    }
  }else if(variant==='hound'){
    for(let i=0;i<7;i++){
      const z=(i-3)*.224,y=.27+Math.cos(i*.83)*.033;
      for(const side of [-1,1])shape(k,body,'edge',opposite(side,[[.053,y,z,.039],
        [.275,y-.081,z-.028,.046],[.397,y-.26,z+.002,.039],[.273,y-.44,z+.083,.007]]));
      jewel(k,body,'trim',0,y+.071,z-.059,.071,.084,.073);
    }
  }else if(long){
    for(let i=0;i<8;i++){
      const z=i*.237-length*.80;
      shape(k,body,i%3?'edge':'glow',[[0,.283,z+.10,.089],[.057,.396,z,.095],[.018,.56,z-.122,.054],[.045,.67,z-.237,.009]]);
      for(const side of [-1,1]){
        const fan=points=>opposite(side,points);
        plate(k,body,i%2?'deep':'body',fan([[.13,.205,z+.16],[.352,.198,z+.145],
          [.408,.029,z],[.34,-.14,z-.041],[.232,.05,z-.132]]),.045);
        seam(k,body,'glow',fan([[.28,.225,z+.16],[.393,.121,z+.059],[.428,.088,z-.06]]),.016);
      }
    }
  }else if(antlered){
    for(let i=0;i<12;i++){
      const side=i%2?-1:1,z=(i%7-3)*.221;
      shelfMushroom(k,body,side*(.17+i%3*.065),.32+(i%4)*.089,z,.09+i%4*.046,side*.51+i*.49);
    }
  }
  const jaw=k.bone(head,0,-.166,.12),broad=variant==='vaultTurtle'?.28:antlered?.19:forge?.36:.265;
  shape(k,head,variant==='hound'?'edge':'body',[[0,-.12,.015,broad*.66,.11],[0,-.089,.171,broad*.91,.23],
    [0,.036,.045,broad,.217],[0,.19,-.069,broad*.83,.183],[0,.29,-.23,broad*.53,.10]],{sides:13,rings:16,section:2.46,ridge:.19});
  shape(k,jaw,'edge',[[0,-.088,.251,broad*.67,.103],[0,-.045,.193,broad*.92,.191],
    [0,.029,.012,broad*.97,.16],[0,.078,-.09,broad*.64,.08]],{sides:11,rings:11,section:2.3});
  const teeth=variant==='hound'?8:variant==='vaultTurtle'?5:6;
  if(antlered)antlers(k,head,{span:.62,reach:.86,prongs:3,finish:'trim',width:.070});
  if(forge) {
    for(const side of [-1,1]){
      const fan=points=>opposite(side,points);
      const chimney=bone(body,side*.37,.38,-.49);
      chimney.rotation.z=-side*.28;
      shape(k,chimney,'deep',[[0,-.11,0,.14,.14],[0,.09,0,.17,.17],[0,.29,0,.126,.126],
        [0,.37,0,.185,.185],[0,.46,0,.19,.19]],{sides:12,rings:16,section:2.44,ridge:.14});
      k.mesh(chimney,'ring','trim',0,.47,0,.175,.175,.63,Math.PI*.5);
      jewel(k,chimney,'glow',0,.448,0,.116,.015,.116);
      shape(k,head,'edge',fan([[.24,.108,-.06,.14],[.418,.279,-.227,.14],[.53,.46,-.365,.088],
        [.55,.595,-.441,.04],[.48,.73,-.50,.009]]),{sides:9,rings:15,section:2.12,ridge:.22});
      const shoulder=fan([[.28,.42,.43],[.48,.52,.40],[.63,.37,.51],[.67,.12,.39],[.49,-.02,.30],[.31,.15,.45]]);
      plate(k,body,'edge',shoulder,.10);
      seam(k,body,'trim',shoulder,.025);
      studs(k,body,[shoulder[1],shoulder[3],shoulder[4]],.040);
      shape(k,jaw,'trim',fan([[.253,.047,.21,.104],[.375,.069,.345,.102],[.39,.18,.442,.063],
        [.327,.315,.495,.039],[.275,.392,.451,.006]]),{sides:9,rings:14,section:1.98,ridge:.19});
    }
  }
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    seam(k,head,'trim',fan([[.047,.156,.272],[broad*.86,.119,.193],[broad*1.14,.045,.034]]),.036);
    jewel(k,head,'glow',side*broad*.68,.05,.244,.064,.047,.051,side*.18);
    for(let i=0;i<teeth;i++){
      const shift=i*.045;
      shape(k,jaw,'trim',fan([[broad*.56,-.019,.34-shift,.032],[broad*(.74-i*.026),.074,.33-shift,.023],
        [broad*(.67-i*.023),.128+(i%2)*.044,.366-shift,.004]]));
    }
    if(variant==='hound'){
      shape(k,head,'edge',fan([[.15,.157,-.008,.109],[.238,.331,-.123,.103],[.195,.458,-.21,.054],[.185,.569,-.25,.006]]));
      for(let j=0;j<3;j++)shape(k,head,'body',fan([[.138,.108-j*.088,.16,.073],[.32,.046-j*.083,.072,.080],
        [.40,-.01-j*.12,-.161,.009]]));
    }
    for(const front of [true,false]){
      const z=front?length*.64:-length*.56;
      const shift=antlered?.11:variant==='vaultTurtle'?.29:.19;
      const upper=bone(body,side*(girth*.56+shift),.045,z);
      const shin=bone(upper,side*.045,-hip*.48,front?.15:-.12);
      const foot=bone(shin,side*.029,-hip*.51,front?-.08:.09);
      legs.push(upper);
      joints.push({joint:shin,side,leg:true,step:front?1:0});
      shape(k,upper,'body',fan([[.013,.109,0,girth*.43,girth*.46],[.08,-hip*.144,.029,girth*.5,girth*.53],
        [.07,-hip*.40,.086,girth*.35,girth*.38],[.052,-hip*.51,.126,girth*.29,girth*.30]]),{sides:10,rings:13,section:2.42,ridge:.12});
      shape(k,shin,'edge',fan([[.012,.032,.012,girth*.34,girth*.34],[.036,-hip*.21,.062,girth*.31,girth*.32],
        [.03,-hip*.46,.039,girth*.23,girth*.25],[.015,-hip*.53,.039,girth*.24,girth*.31]]),{sides:9,rings:10,section:2.6,ridge:.13});
      shape(k,foot,'deep',[[0,-.074,.073,girth*.42,girth*.55],[0,-.024,.069,girth*.46,girth*.48],[0,.046,.027,girth*.33,girth*.38]]);
      for(let i=-1;i<=1;i++)shape(k,foot,'trim',[[i*girth*.30,-.023,.118,girth*.152],[i*girth*.34,-.064,.225,girth*.125],
        [i*girth*.44,-.091,.32,.007]]);
    }
  }
  const span=antlered?.48:variant==='vaultTurtle'?.53:long?1.26:1.01;
  shape(k,tail,long?'edge':'body',[[0,.016,.16,girth*.41],[.07,.10,-.11,girth*.36],[.13,.15,-span*.44,girth*.32],
    [.31,.34,-span*.74,girth*.20],[.21,.37,-span*.92,.007]],{sides:12,rings:19,section:1.91,ridge:.18});
  if(long) for(let i=0;i<5;i++){
    const z=-.146-i*.19,x=i*.038;
    shape(k,tail,i%2?'glow':'trim',[[x,.13+i*.039,z,.066],[x+.085,.31+i*.051,z-.055,.061],[x+.151,.385+i*.055,z-.177,.008]]);
  }
  return {body,head,tail,legs,crest:bone(body,0,0,0),pattern:variant==='vaultTurtle'?'bulwark':'gallop',
    campaign:{flaps,joints,jaw,baseJaw:.03}};
}

function weaver(k,variant,mobile){
  const {root,bone}=k;
  const queen=variant==='queen',beetle=variant==='scarab',body=bone(root,0,queen?1.03:.64,0);
  const head=bone(body,0,queen?.32:-.022,beetle?.67:.53);
  const legs=[],joints=[],flaps=[];
  const w=queen?.63:beetle?.41:.4;
  shape(k,body,'body',[[0,.08,-1.27,w*.36,.19],[0,.26,-1.06,w*.81,.41],[0,.25,-.73,w,.52],
    [0,.18,-.41,w*.96,.46],[0,.056,-.03,w*.75,.31],[0,.032,.26,w*.44,.24]],
  {sides:18,rings:22,section:beetle?2.84:2.39,ridge:.14});
  if(queen){
    const mask=bone(head,0,.33,.22);face(k,mask,{style:'mask',width:.208,z:.185,length:.29});
    antlers(k,mask,{span:.39,reach:.54,prongs:2,finish:'trim',width:.058});
    tendrils(k,head,6,flaps,{width:.45,origin:.29,span:1.14,trail:.56,finish:'deep'});
  }else{
    shape(k,head,'deep',[[0,-.15,.06,.193,.20],[0,-.062,.086,.24,.23],[0,.12,.021,.242,.246],
      [0,.33,-.056,.13,.135]],{sides:12,rings:12,section:2.78,ridge:.18});
  }
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    for(let i=0;i<4;i++){
      const z=-1.09+i*.236,y=.429+Math.sin(i*.63)*.19;
      plate(k,body,i%2?'edge':'body',fan([[.054,y,z-.122],[w*.69,y-.084,z-.156],[w*1.03,y-.252,z+.032],
        [w*.97,y-.325,z+.157],[w*.36,y-.11,z+.208],[.047,y-.069,z+.155]]),.047);
      seam(k,body,'trim',fan([[.071,y-.04,z+.106],[w*.69,y-.07,z+.157],[w*.87,y-.23,z+.29]]),.022);
    }
    if(beetle)jewel(k,body,'glow',side*.171,.758,-.52,.19,.097,.25,side*.25);
    else for(let i=0;i<6;i++){
      const x=.091+(i%3)*.048,y=.617-(i%2)*.083,z=-.87+i*.126;
      seam(k,body,'edge',fan([[x,y,z],[x+.085,y-.068,z+.093],[x+.155,y-.172,z+.103]]),.016);
    }
    for(let i=0;i<3;i++)jewel(k,head,'glow',side*(.091+i*.037),.028+i*.073,.22-i*.068,.048,.031,.041,side*.16);
    shape(k,head,'edge',fan([[.104,-.084,.129,.077],[.20,-.14,.223,.069],
      [.251,-.19,.405,.035],[.167,-.258,.47,.004]]),low);
    const count=beetle?3:4;
    for(let i=0;i<count;i++){
      const z=.206-i*.294;
      const thigh=bone(body,side*(w*.45),-.048,z);
      const width=queen?1.10:beetle?.59:.79;
      const rise=queen?.455:beetle?.22:.34;
      const shin=bone(thigh,side*width*.59,rise,i*.07-.08);
      legs.push(thigh);
      joints.push({joint:shin,side,leg:true,step:i});
      shape(k,thigh,'deep',fan([[0,0,0,.15,.104],[width*.43,rise*.84,.039,.101,.087],
        [width*.59,rise,i*.07-.08,.107,.10]]),{sides:9,rings:11,section:2.69,ridge:.18});
      const tip=(queen?1.25:.85)*-.84;
      shape(k,shin,i%2?'trim':'edge',fan([[0,.011,0,.098,.087],[width*.196,-.042,.094,.096,.078],
        [width*.235,tip*.48,.17,.056,.044],[width*.365,tip,.23+i*.024,.009,.013]]),
      {sides:9,rings:12,section:1.64,ridge:.20});
      jewel(k,shin,'body',0,0,0,.113,.098,.091);
      if(!mobile)seam(k,shin,'glow',fan([[.062,.018,.051],[width*.18,-.11,.11],[width*.23,tip*.54,.198]]),.015);
    }
  }
  const abdomen=bone(body,0,.041,-.90);
  shape(k,abdomen,'trim',[[0,0,.24,.095],[0,.018,-.006,.129],[0,-.039,-.262,.071],[0,-.076,-.41,.009]]);
  flaps.push({joint:abdomen,axis:'x',amp:.21,bias:-.13,seed:6});
  return {body,head,legs,crest:bone(body,0,0,0),pattern:'crawl',campaign:{flaps,joints}};
}

function rootDragonHead(k,head){
  shape(k,head,'body',[[0,.159,-.31,.255,.22],[0,.13,-.126,.314,.259],[0,.073,.12,.278,.177],
    [0,-.061,.345,.215,.131],[0,-.121,.52,.181,.108],[0,-.121,.656,.116,.078]],
  {sides:16,rings:21,section:2.66,ridge:.215});
  const jaw=k.bone(head,0,-.177,.06);
  shape(k,jaw,'deep',[[0,.129,-.13,.223,.084],[0,-.054,.155,.239,.088],[0,-.041,.372,.166,.076],
    [0,-.019,.565,.120,.035]],{sides:12,rings:18,section:2.51,ridge:.11});
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points);
    const eyebrow=fan([[.109,.257,.167],[.274,.229,.073],[.346,.073,.020],[.27,.032,.226],[.151,.103,.360]]);
    plate(k,head,'edge',eyebrow,.066);
    seam(k,head,'trim',eyebrow.slice(1),.019);
    jewel(k,head,'glow',side*.23,.090,.257,.063,.039,.042,side*.36);
    for(let i=0;i<6;i++){
      const x=.20-i*.012,z=.215+i*.061,r=.035-i*.002;
      shape(k,head,'trim',fan([[x,-.118,z,r],[x+.011,-.169,z+.020,r*.68],[x+.018,-.256,z+.058,.004]]));
    }
    for(let i=0;i<3;i++){
      const height=.245+i*.085;
      shape(k,head,i%2?'trim':'edge',fan([[.176,.103,-.07-i*.052,.077],[.353,.208,-.17-i*.076,.076],
        [.483,height,-.339-i*.078,.054],[.579,height+.153,-.459-i*.091,.005]]));
    }
  }
  return jaw;
}

function owlMantle(k,body,mobile){
  for(const side of [-1,1])for(let row=0;row<3;row++){
    for(let i=0;i<(mobile?3:5);i++){
      const x=i*(mobile?.10:.063), y=.335-row*.162+i*.012;
      for(const surface of [-1,1]){
        const [start,bend,end]=opposite(side,[[.061+x,y,surface*.20],[.103+x,y-.133,surface*(.273-i*.013)],
          [.16+x,y-.253,surface*(.285-i*.012)]]);
        k.geometry(body,row%2?'body':surface>0?'edge':'trim',featherVane(start,bend,end,.054,i+11*row,6));
      }
    }
  }
}

function winged(k,variant,mobile){
  const {root,bone}=k;
  const moth=['moth','kite','glass'].includes(variant),owl=variant==='owl',dragon=variant==='rootDragon';
  const paper=variant==='crane'||variant==='paper';
  const body=bone(root,0,1.02,0),head=bone(body,0,dragon?.64:.52,dragon?.32:owl?.31:.139);
  const flaps=[],flight=[],legs=[],arms=[];
  shape(k,body,moth?'deep':'body',[[0,-.46,-.15,.158,.19],[0,-.26,-.094,.309,.293],[0,-.006,-.03,.338,.316],
    [0,.236,.062,.277,.258],[0,.416,.124,.198,.208],[0,.558,.185,.113,.114]],
  {sides:16,rings:16,section:2.53,ridge:.14});
  let jaw;
  if(dragon){
    jaw=rootDragonHead(k,head);
    shape(k,body,'body',[[0,-.06,.085,.224,.200],[0,.29,.102,.261,.232],[0,.53,.207,.221,.206],
      [0,.76,.275,.174,.174]],{sides:15,rings:16,section:2.76,ridge:.191});
    antlers(k,head,{span:.51,reach:.67,prongs:3,finish:'trim',width:.071});
  }else if(variant==='kite'){
    const eye=bone(head,0,.069,.201);
    plate(k,eye,'deep',[[0,.351,.021],[.337,.171,.079],[.245,-.19,.096],[0,-.466,.18],[-.225,-.21,.064],[-.329,.15,.08]],.061);
    torque(k,eye,.19,'trim',8);jewel(k,eye,'glow',0,0,.194,.089,.049,.037);
  }else{
    face(k,head,{style:owl?'owl':paper?'beak':moth?'hood':'mask',width:owl?.29:paper?.18:.228,
      z:paper?.209:owl?.269:.225,length:owl?.287:paper?.45:.37});
    if(owl){
      antlers(k,head,{span:.49,reach:.53,prongs:2,finish:'trim',width:.063});
      owlMantle(k,body,mobile);
    }
    if(moth){
      const collar=bone(body,0,.29,-.052);ritualCowl(k,head,collar,.27);
      for(const side of [-1,1])shape(k,head,'trim',opposite(side,[[.096,.188,-.07,.044],[.202,.529,-.18,.038],
        [.445,.683,-.334,.021],[.512,.615,-.412,.005]]));
    }
    if(paper)for(const side of [-1,1])plate(k,head,'body',opposite(side,[[.023,.272,.153],[.241,.400,-.032],[.215,.063,.04],
      [.123,-.082,.298],[.052,.075,.249]]),.034);
  }
  const count=mobile?6:8;
  for(const side of [-1,1]){
    const fan=points=>opposite(side,points),hinge=bone(body,side*.22,.267,-.07);
    const elbow=bone(hinge,side*(owl?.45:.58),.263,-.095);
    const wrist=bone(elbow,side*.62,.22,-.13);
    flight.push({root:hinge,elbow,hand:wrist,side,membranous:moth||dragon});
    arms.push(hinge);
    shape(k,hinge,'body',fan([[0,.008,.015,.112],[.238,.184,-.058,.107],[owl?.46:.59,.253,-.085,.092]]));
    shape(k,elbow,'trim',fan([[0,.012,.01,.077],[.339,.223,-.119,.079],[.653,.24,-.179,.067]]));
    if(moth||paper||dragon){
      const upper=moth?[[0,.024,.036],[.348,.41,.077],[.951,.50,-.12],[1.28,.337,-.24]]:
        [[0,.052,.017],[.443,.465,-.011],[.88,.515,-.153],[1.12,.372,-.288]];
      plate(k,elbow,'body',fan([...upper,[1.09,.04,-.249],[.89,-.26,-.319],[.70,-.22,-.276],
        [.59,-.47,-.38],[.29,-.39,-.28],[.134,-.227,-.143]]),moth?.055:.04);
      plate(k,wrist,dragon?'deep':'edge',fan([[-.112,.18,.13],[.381,.175,-.085],[.603,-.138,-.24],
        [.48,-.385,-.29],[.232,-.594,-.398],[.117,-.467,-.30],[-.081,-.265,-.141]]),.052);
      for(const [part,length] of [[elbow,.91],[wrist,.45]])for(let i=0;i<5;i++){
        const x=length*(i*.15+.10),y=.35-i*.075;
        for(const face of [-1,1])seam(k,part,i%3?'trim':'glow',fan([[.012,y*.11,face*.032],[x*.46,y*.67,face*.061-.032],
          [x,y-.26,face*.037-.15],[x*1.17,y-.43,face*.023-.224]]),.015);
      }
      if(moth){
        for(const [part,x,y,z,w] of [[elbow,.64,.118,-.037,.191],[wrist,.235,-.10,-.10,.143]]){
          const eye=bone(part,side*x,y,z);
          torque(k,eye,w,'trim',7);
          jewel(k,eye,'glow',0,0,.069,w*.35,w*.61,w*.25);
        }
        if(variant==='glass')for(let shard=0;shard<4;shard++){
          const x=.38+shard*.216,y=.379-shard*.153;
          const splinter=bone(elbow,side*x,y,-.067-shard*.038);
          const point=shard%2?.23:.37;
          plate(k,splinter,shard%2?'deep':'edge',fan([[0,-.133,-.049],[.113,.041,.016],
            [.145,point,-.147],[.053,point+.04,-.213],[-.104,.034,-.031]]),.061);
          seam(k,splinter,'glow',fan([[.062,-.044,.008],[.122,.10,.002],[.14,point,-.061]]),.013);
          flaps.push({joint:splinter,axis:'x',amp:.119,bias:0,seed:shard*1.28});
        }
      }else for(let i=0;i<4;i++){
        const x=.13+i*.173,y=.22-i*.096;
        plate(k,wrist,variant==='paper'?'edge':'trim',fan([[x,y,.036],[x+.12,y+.055,-.084],[x+.173,y-.239,-.21],
          [x+.127,y-.329,-.246],[x+.028,y-.157,-.133]]),.044);
      }
    }else{
      for(let layer=0;layer<3;layer++)for(let i=0;i<count;i++){
        const part=layer===0?hinge:layer===1?elbow:wrist;
        const t=i/(count-1),x=.053+t*.41,y=.11+Math.sin(t*1.51)*.083;
        const a=[x,y,.054-t*.15],b=[x+.19+t*.08,y-.167,-.14-t*.093],
          c=[x+.293+t*.31,y-.55+t*.26,-.34-t*.12];
        k.geometry(part,i%4===0?'trim':layer%2?'deep':'edge',featherVane(...fan([a,b,c]),.096+layer*.02,i+layer*11,8));
      }
    }
    if(owl||paper){
      const leg=bone(body,side*.132,-.265,.051);
      legs.push(leg);
      shape(k,leg,'trim',fan([[.042,.035,.014,.053],[.074,-.136,.013,.071],[.059,-.250,.191,.039]]),low);
      for(let i=-1;i<=1;i++)shape(k,leg,'edge',[[i*.051,-.227,.144,.033],[i*.059,-.258,.252,.029],[i*.074,-.306,.323,.005]]);
    }else if(dragon||moth){
      for(let i=0;i<3;i++){
        const flap=bone(body,side*(.15+i*.061),-.096-i*.123,-.20);
        shape(k,flap,moth?'edge':'body',fan([[0,.01,.049,.104],[.18,-.281,-.118,.088],
          [.23,-.46-i*.21,-.28,.047],[.39,-.73-i*.17,-.50,.007]]));
        flaps.push({joint:flap,axis:'z',amp:.14,bias:side*.10,seed:i*.87+side});
      }
    }
  }
  const tail=bone(body,0,-.144,-.237);
  if(dragon){
    shape(k,tail,'body',[[0,.01,.108,.179,.151],[.244,-.129,-.338,.175,.154],[.179,-.104,-.655,.145,.137],
      [-.06,-.006,-.99,.096,.104],[-.29,.154,-1.28,.063,.062],[-.23,.344,-1.47,.006,.008]],
    {sides:15,rings:26,section:2.36,ridge:.25});
    for(let i=0;i<6;i++){
      const x=Math.sin(i*.77)*.218,z=-.23-i*.146;
      shape(k,tail,i%3?'edge':'glow',[[x,-.031,z,.048],[x+.081,.113,z-.061,.069],[x+.098,.246,z-.18,.006]]);
    }
  }
  for(let i=0;i<(owl?7:5);i++){
    const side=i%2?-1:1,x=side*i*.036;
    fabric(k,tail,i%2?'edge':'body',[[x,.062,-.001,.083,.053],[x*1.8,-.084,-.291,.094,.049],
      [x*2.16,-.21,-.417,.076,.037],[x*2.80,-.31-i*.044,-.696-i*.061,.008,.005]],i+12);
  }
  const crest=bone(body,0,.68,-.13);
  if(variant==='moth'){
    torque(k,crest,.438,'trim',12);
    jewel(k,crest,'glow',0,.065,-.052,.19,.209,.050);
  }
  return {body,head,arms,legs,tail,flight,crest,pattern:'wing',campaign:{flaps,joints:[],jaw}};
}

function riverKeeper(k,type){
  const {root,bone}=k;
  const eclipse=type==='eclipse',body=bone(root,0,.12,0),tail=bone(body,0,.15,-.214);
  const neck=bone(body,0,.217,.43),head=bone(neck,0,1.06,.34);
  const flaps=[],arms=[];
  const path=[[0,.176,.411,.29,.26],[-.325,.166,.132,.302,.252],[-.628,.126,-.30,.269,.227],
    [-.473,.129,-.731,.245,.215],[-.069,.12,-.947,.224,.195],[.501,.166,-.805,.205,.174],
    [.693,.239,-.582,.155,.150],[.611,.302,-.235,.122,.106],[.454,.335,-.034,.083,.081],
    [.291,.361,-.198,.046,.054],[.242,.40,-.431,.009,.011]];
  shape(k,tail,'deep',path,{sides:17,rings:38,section:2.24,ridge:.178});
  for(let i=0;i<(eclipse?13:18);i++){
    const t=i/(eclipse?12:17),p=t*(path.length-1),j=Math.floor(p),rest=p-j;
    const [x,y,z,r]=path[j].map((value,axis)=>T.MathUtils.lerp(value,path[Math.min(j+1,path.length-1)][axis],rest));
    const crest=bone(tail,x,y+r*.39,z);
    crest.rotation.y=Math.sin(t*TAU)*1.6;
    k.mesh(crest,'scale',i%2?'edge':'body',0,r*.19,0,r*.87,r*.73,r*.81,Math.PI*.45,0,i*.04);
    seam(k,crest,'trim',[[-r*.78,r*.16,.017],[0,r*.41,.024],[r*.65,r*.20,-.014]],.021);
  }
  shape(k,neck,'body',[[0,0,-.16,.318,.268],[0,.31,-.125,.315,.28],[0,.592,0,.24,.211],
    [0,.845,.123,.198,.181],[0,1.10,.291,.141,.16]],{sides:17,rings:21,section:2.73,ridge:.16});
  face(k,head,{style:eclipse?'mask':'hood',width:eclipse?.245:.20,z:.154,length:.28});
  antlers(k,head,{span:eclipse?.33:.43,reach:eclipse?.44:.58,prongs:2,finish:'trim',width:.061});
  for(let i=0;i<5;i++){
    const y=.804-i*.159,w=.25+i*.012;
    hardshell(k,neck,y,.128-i*.045,w,.26,i%2?'body':'edge',i);
    hardshell(k,neck,y,-.166-i*.015,w*.73,.23,'deep',i+1);
  }
  for(const side of [-1,1]){
    const wrist=bone(neck,side*.218,.63,.072);
    arms.push(wrist);
    const fan=points=>opposite(side,points);
    shape(k,wrist,'body',fan([[0,.06,0,.085],[.133,-.17,.06,.104],[.21,-.33,.091,.08],
      [.34,-.432,.231,.074],[.43,-.51,.28,.013]]),low);
    for(let i=0;i<3;i++)shape(k,wrist,'edge',fan([[.253+i*.033,-.391,.21,.038],[.324+i*.039,-.47,.32,.030],
      [.34+i*.052,-.53,.37,.004]]));
    if(side===1&&!eclipse){
      const oar=bone(wrist,.334,-.393,.238);
      oar.rotation.z=-.64;
      shape(k,oar,'trim',[[0,-.27,-.06,.038],[0,.43,.082,.052],[.018,1.02,.17,.039]]);
      plate(k,oar,'edge',[[-.12,.60,.161],[.04,.67,.17],[.22,1.10,.193],[.14,1.37,.112],[-.13,1.36,.111],
        [-.21,1.14,.17],[-.09,.80,.16]],.08);
      for(const side of [1,-1])seam(k,oar,'glow',[[0,.677,.17+side*.039],[.055,.843,.16+side*.044],
        [.041,1.21,.147+side*.057]],.021);
    }
  }
  const crest=bone(head,0,.34,-.417);
  if(eclipse){
    torque(k,crest,.63,'trim',15);
    k.mesh(crest,'bar','deep',0,0,0,.49,.108,.49,Math.PI*.50);
    k.mesh(crest,'ring','glow',0,0,.079,.483,.483,.57);
    for(let i=0;i<11;i++){
      const a=i*TAU/11,r=Math.sin(a),s=Math.cos(a);
      shape(k,crest,'edge',[[r*.53,s*.53,-.038,.057],[r*.697,s*.697,-.063,.076],[r*.85,s*.85,-.102,.008]]);
    }
  }else{
    for(const side of [-1,1]){
      const charm=lantern(k,neck,side*.41,.91,-.178,.38);
      flaps.push({joint:charm,axis:'z',amp:.32,bias:side*.1,seed:side*.6});
    }
  }
  flaps.push({joint:tail,axis:'y',amp:.26,bias:0,seed:12});
  return {body,head,arms,tail,crest,pattern:'coil',campaign:{flaps,joints:[],neck}};
}

function guardian(k,type,mobile){
  const styles={
    lotus:{broad:.35,ground:1.13,neck:.88,helmet:'mask',style:'shade',legs:false},
    fox:{broad:.39,ground:1.05,neck:.88,helmet:'mask',style:'duel'},
    boar:{broad:.59,ground:.98,neck:.72,helmet:'mask',style:'heavy',armLength:.84},
    crown:{broad:.50,ground:1.08,neck:.81,helmet:'helmet',style:'duel'},
    goat:{broad:.55,ground:.96,neck:.70,helmet:'mask',style:'heavy',armLength:.80},
    frost:{broad:.47,ground:1.05,neck:.82,helmet:'helmet',style:'duel'},
    bank:{broad:.57,ground:1.04,neck:.67,helmet:'coin',style:'heavy',armLength:.83},
    clock:{broad:.43,ground:1.10,neck:.87,helmet:'helmet',style:'duel'},
    hangman:{broad:.46,ground:1.16,neck:.86,helmet:'blank',style:'duel'},
  };
  return fighter(k,{...styles[type],height:1.22,guardianType:type,mobile,headwear(k,head,collar){
    if(type==='lotus'||type==='fox'||type==='hangman')ritualCowl(k,head,collar,.37);
    if(type==='goat'||type==='boar'){
      for(const side of [-1,1]){
        const fan=points=>opposite(side,points);
        const curl=type==='goat'?
          [[.08,.19,.024,.112],[.31,.399,-.112,.133],[.56,.412,-.22,.095],[.603,.226,-.252,.086],[.57,-.02,-.17,.060],[.47,-.144,.115,.007]]:
          [[.096,-.271,.119,.091],[.23,-.278,.28,.101],[.381,-.217,.37,.093],[.489,-.071,.38,.068],[.51,.104,.342,.008]];
        shape(k,head,'edge',fan(curl),{sides:12,rings:18,section:2.19,ridge:.24});
        for(let i=0;i<2;i++)seam(k,head,'trim',fan(curl.slice(0,-1).map(([x,y,z,w])=>[x,y+w*(i?.6:-.58),z+w*.46])),.014);
      }
    }else if(type==='bank'||type==='frost'){
      for(let i=0;i<5;i++){
        const x=(i-2)*.085,y=.218+Math.cos(i*1.27)*.025;
        shape(k,head,i%3?'trim':'edge',[[x,y,.085],[x*1.26,y+.19,-.039,.080],[x*1.59,y+.35,-.14,.059],
          [x*1.73,y+.44-(i%3)*.05,-.218,.006]].map(p=>p.length===3?[...p,.089]:p));
      }
    }else if(type==='fox'){
      for(const side of [-1,1])plate(k,head,'edge',opposite(side,[[.071,.20,.183],[.333,.624,-.021],
        [.361,.275,-.159],[.252,.156,.121],[.117,.119,.217]]),.079);
    }
  },weapon(k,body,back,head,hands,flaps){
    const broad=styles[type].broad;
    if(type==='lotus'||type==='fox'){
      tendrils(k,body,type==='lotus'?12:9,flaps,{width:.72,origin:.26,span:1.35,trail:.59,finish:'body'});
      for(const side of [-1,1]){
        const bloom=k.bone(body,side*.43,.303,.223);bloom.rotation.y=side*.37;
        const petals=type==='lotus'?9:5;
        for(let i=0;i<petals;i++){
          const a=i*TAU/petals,s=Math.sin(a),r=Math.cos(a);
          shape(k,bloom,i%2?'edge':'body',[[0,0,0,.043],[s*.129,.04,r*.123,.099,.043],
            [s*.23,.149,r*.195,.074,.039],[s*.30,.261,r*.28,.006,.004]]);
        }
        jewel(k,bloom,'glow',0,.117,0,.098,.11,.084);
        flaps.push({joint:bloom,axis:'x',amp:.17,bias:side*.22,seed:4+side});
      }
    }else if(type!=='crown')vest(k,body,broad,1.15,flaps);
    if(type==='boar'){
      for(let i=0;i<7;i++){
        const x=(i-3)*.111;
        shape(k,back,i%3?'body':'glow',[[x,.59,-.047,.126],[x*1.19,.87,-.14,.129],[x*1.46,1.13,-.36,.057],
          [x*1.65,1.31-(i%3)*.06,-.54,.007]]);
      }
      for(const side of [-1,1])lantern(k,back,side*.415,.77,-.20,.49);
    }
    if(type==='frost'){
      const bellJoint=k.bone(back,0,.59,-.33);bell(k,bellJoint,1.09);
      flaps.push({joint:bellJoint,axis:'z',amp:.27,bias:.15,seed:9});
    }
    if(type==='clock'||type==='bank'){
      const dial=k.bone(body,0,.374,.51);torque(k,dial,type==='bank'?.43:.33,'trim',14);
      seam(k,dial,'glow',[[0,0,.069],[.017,.19,.093],[.066,.258,.083]],.028);
      seam(k,dial,'edge',[[0,0,.065],[-.179,-.13,.074],[-.244,-.092,.081]],.031);
      flaps.push({joint:dial,axis:'z',amp:.29,bias:.20,seed:2});
    }
    if(type==='hangman'||type==='crown'||type==='clock'||type==='goat'||type==='boar')
      hookedBlade(k,hands[1],{length:type==='hangman'?1.62:type==='clock'?1.33:1.14,breadth:type==='goat'?.32:.24});
    if(type==='crown'||type==='hangman'){
      if(type==='crown'){
        const train=Array.from({length:9},(_,i)=>[(i-4)*.104,-.28-Math.abs(i-4)*.007,.13+Math.abs(i-4)*.017,
          1.56+Math.cos(i)*.23,-.43-Math.abs(i-4)*.067]);
        cloak(k,body,train,flaps,['deep','body','body','edge']);
      }else{
        for(const side of [-1,1]){
          const hooks=k.bone(body,side*.264,.586,-.353);
          const f=p=>opposite(side,p);
          const crooked=[[.01,-.02,.021,.076],[.17,.287,-.102,.069],[.27,.481,-.22,.057],
            [.35,.575,-.275,.046],[.47,.462,-.32,.033],[.42,.331,-.36,.005]];
          shape(k,hooks,'trim',f(crooked),{sides:11,rings:19,section:2.14,ridge:.23});
          seam(k,hooks,'glow',f(crooked.map(([x,y,z,r])=>[x,y,z+.031,r*.23])),.016);
          for(let ring=0;ring<4;ring++){
            const y=.31-ring*.133,z=-.27+ring*.021;
            k.mesh(hooks,'chain',ring%2?'edge':'deep',side*.43,y,z,.092,.12,.66,0,ring*1.04,side*.18);
          }
          const shroud=k.bone(body,side*.29,.41,-.325);
          fabric(k,shroud,'deep',f([[0,0,0,.209,.08],[.11,-.32,-.32,.265,.066],[.251,-.64,-.46,.21,.04],
            [.31,-.956,-.531,.16,.036],[.28,-1.43,-.63,.006,.004]]),9);
          flaps.push({joint:shroud,axis:'x',amp:.18,bias:.09,seed:3+side});
          flaps.push({joint:hooks,axis:'z',amp:.09,bias:0,seed:7+side});
        }
      }
    }
  }});
}

const regular=archetypes();
const campaignModels={
  ...regular,
  stalker:k=>stalker(k),
  wisp:k=>wraith(k,'wisp'),
  scarab:(k,m)=>weaver(k,'scarab',m),
  salamander:k=>quadruped(k,'salamander'),
  weaver:(k,m)=>weaver(k,'weaver',m),
  crane:(k,m)=>winged(k,'crane',m),
  kite:(k,m)=>winged(k,'kite',m),
  veil:k=>wraith(k,'veil'),
  wax:k=>wraith(k,'wax'),
  eyes:k=>wraith(k,'eyes'),
  hound:k=>quadruped(k,'hound'),
  'forest-0':(k,m)=>winged(k,'owl',m),
  'forest-1':(k,m)=>guardian(k,'lotus',m),
  'forest-2':(k,m)=>guardian(k,'fox',m),
  'forest-3':(k,m)=>guardian(k,'boar',m),
  'forest-4':(k,m)=>weaver(k,'queen',m),
  'forest-5':k=>quadruped(k,'vaultTurtle'),
  'forest-6':k=>riverKeeper(k,'eclipse'),
  'forest-7':k=>quadruped(k,'stag'),
  'forest-8':(k,m)=>winged(k,'moth',m),
  'forest-9':(k,m)=>guardian(k,'crown',m),
  'forest-10':(k,m)=>guardian(k,'goat',m),
  'forest-11':k=>riverKeeper(k,'oar'),
  'forest-12':(k,m)=>guardian(k,'frost',m),
  'forest-13':k=>quadruped(k,'forgeBeast'),
  'forest-14':(k,m)=>winged(k,'paper',m),
  'forest-15':(k,m)=>guardian(k,'bank',m),
  'forest-16':(k,m)=>guardian(k,'clock',m),
  'forest-17':(k,m)=>winged(k,'rootDragon',m),
  'forest-18':(k,m)=>winged(k,'glass',m),
  'forest-19':(k,m)=>guardian(k,'hangman',m),
};

function stalker(k){
  const parts=fighter(k,{broad:.336,ground:.82,neck:.59,helmet:'hood',armLength:.93,style:'heavy',
    headwear(k,h,c){ritualCowl(k,h,c,.28);},
    weapon(k,b,back,h,hands,flaps){
      cloak(k,b,[[-.40,-.081,.24,1.03,-.61],[-.256,-.263,.20,1.29,-.79],[.09,-.294,.22,1.39,-.91],
        [.311,-.112,.24,1.19,-.68]],flaps);
      for(const grip of hands)for(let claw=0;claw<4;claw++){
        const x=(claw-1.5)*.065;
        shape(k,grip,'edge',[[x,.019,.088,.035],[x*1.20,-.098,.203,.059],[x*1.43,-.218,.351,.048],
          [x*1.52,-.367,.465,.028],[x*1.37,-.46,.468,.004]],
        {sides:8,rings:13,section:2.12,ridge:.17});
        seam(k,grip,'glow',[[x,-.08,.214],[x*1.53,-.207,.366],[x*1.58,-.336,.473]],.014);
      }
    },
  });
  parts.body.rotation.x=.27;
  parts.pattern='gallop';
  parts.campaign.lean=.24;
  return parts;
}

function finishCampaign(k,entry){
  const forged=entry.finish==='iron'||entry.finish==='bronze';
  const organic=['hide','wood','stone'].includes(entry.finish);
  const dark=new T.Color(entry.palette[0]);
  const worn=new T.Color(entry.palette[2]).lerp(new T.Color(0xc08354),.32);
  const finishes=[['deep',0,.72],['body',forged?2:organic?1:0,forged?.64:.72],
    ['edge',forged?2:3,forged?.79:.61],['trim',2,.87]];
  for(const [name,kind,amount] of finishes){
    const surface=k.materials[name];
    const previous=surface.onBeforeCompile;
    const cacheKey=surface.customProgramCacheKey();
    surface.customProgramCacheKey=()=>cacheKey+'|campaign-patina';
    surface.onBeforeCompile=shader=>{
      previous.call(surface,shader);
      Object.assign(shader.uniforms,{
        campaignFinish:{value:kind},campaignWear:{value:amount},
        campaignOxide:{value:dark},campaignExposed:{value:worn},
      });
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        uniform float campaignFinish,campaignWear;
        uniform vec3 campaignOxide,campaignExposed;
      `).replace('#include <color_fragment>',`#include <color_fragment>
        vec3 workPoint=vPaintPoint;
        vec3 workNormal=normalize(vPaintNormal);
        float weather=paintGrain(workPoint*vec3(11.,18.,14.));
        float age=paintGrain(workPoint*vec3(28.,47.,38.))*.48+weather*.52;
        float chipped=smoothstep(.55,.83,age);
        float grooved=sin(workPoint.x*96.+workPoint.z*99.+weather*8.);
        float knot=sin(workPoint.y*143.+workPoint.z*61.+weather*9.);
        float linework=pow(.5+.5*grooved*knot,12.);
        float weave=(.5+.5*grooved)*(.5+.5*knot);
        float wearFilter=1.-smoothstep(.14,.62,max(fwidth(grooved),fwidth(knot)));
        float spread=.50+.50*dot(workNormal,normalize(vec3(.66,.51,.38)));
        float lifted=chipped*(.72+spread*.28);
        if(campaignFinish<.5){
          diffuseColor.rgb*=.68+age*.44+(weave-.5)*wearFilter*.19;
        }else if(campaignFinish<1.5){
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.46+campaignOxide*.22,(1.-lifted)*.37);
          diffuseColor.rgb*=.80+age*.44+linework*.19*wearFilter;
        }else if(campaignFinish<2.5){
          vec3 exposed=mix(campaignExposed,diffuseColor.rgb,.44)*(.63+spread*.37);
          diffuseColor.rgb=mix(diffuseColor.rgb*.72+campaignOxide*.11,exposed,lifted*campaignWear);
          diffuseColor.rgb+=campaignExposed*linework*wearFilter*lifted*.24;
        }else{
          diffuseColor.rgb*=.69+age*.49+spread*.10;
          diffuseColor.rgb=mix(diffuseColor.rgb,campaignOxide, (1.-weather)*linework*wearFilter*.19);
        }
      `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+(1.-age)*.13-lifted*campaignWear*.24-linework*wearFilter*.08,.24,.98);
      `);
    };
  }
}

function jointCuirass(k,model,entry,mobile){
  const {body,head,arms=[]}=model;
  const broad=entry.proportions[0]*.39;
  const layers=mobile?2:3;
  const rough=['hide','wood','stone','bone'].includes(entry.finish);
  const ridge=rough?'edge':'trim';
  const jointed=['ogre','duelist','emperor','captain','priest'].includes(entry.family)&&!!model.back;
  if(jointed){
    const spine=k.bone(body,0,.288,-broad*.74);
    for(let i=0;i<layers;i++){
      const y=.16-i*.121,x=broad*(.85-i*.068);
      for(const side of [-1,1]){
        const path=opposite(side,[[.037,y+.089,-.102],[x*.51,y+.097,-.078],[x*.88,y+.039,.043],
          [x*.88,y-.057,.071],[x*.46,y-.104,-.018],[.043,y-.084,-.11]]);
        plate(k,spine,i%2?'deep':'body',path,.028);
        seam(k,spine,ridge,path.slice(0,4),.013);
        if(!mobile)studs(k,spine,[path[2],path[4]],.019);
      }
      const centerY=y-.037;
      jewel(k,spine,i===0?'glow':'trim',0,centerY,-.145,.029,.038,.018);
    }
    for(const [index,arm] of arms.entries()){
      const side=index?1:-1, path=opposite(side,[[.062,.133,-.09,.032],[.159,.096,-.112,.038],
        [.208,-.073,-.084,.026],[.082,-.158,-.062,.011]]);
      k.sculpt.sweep(arm,rough?'edge':'body',path,{sides:6,steps:8,ridge:.21});
    }
  }else if(['beast','turtle','spider'].includes(entry.family)){
    const len=entry.family==='spider'?1.12:.89;
    for(let i=0;i<layers+1;i++)for(const side of [-1,1]){
      const z=-len+i*.243,x=broad*(.54+Math.sin(i*.6)*.25);
      const y=(entry.family==='turtle'?.61:.36)+Math.cos(i)*.049;
      const path=opposite(side,[[x*.73,y+.069,z-.12,.023],[x*.97,y+.019,z+.017,.037],
        [x*1.27,y-.087,z+.069,.032],[x*1.31,y-.161,z+.135,.006]]);
      k.sculpt.sweep(body,ridge,path,{sides:7,steps:9,ridge:.18});
    }
  }else if(['star','eggs','shade'].includes(entry.family)){
    for(let i=0;i<layers+3;i++){
      const a=i*TAU/(layers+3),X=Math.sin(a),Z=Math.cos(a);
      const rim=k.bone(body,X*.28,.167+(i%2)*.073,Z*.21);
      rim.rotation.y=a;
      plate(k,rim,'deep',[[0,.18,.055],[.077,.07,.031],[.11,-.18,.064],[0,-.34,.16],
        [-.092,-.159,.055],[-.082,.048,.047]],.023);
      seam(k,rim,i%2?ridge:'glow',[[.018,.124,.07],[.044,-.043,.071],[.021,-.197,.119]],.012);
      model.campaign.flaps.push({joint:rim,axis:'x',amp:.13,bias:0,seed:a});
    }
  }else if(head&&model.flight){
    for(const {root:wing,side,membranous} of model.flight){
      const tail=membranous?-.24:-.18;
      const profile=opposite(side,[[0,.01,-.071],[.19,.13,-.091],[.38,.22,tail],[.50,.24,tail-.055]]);
      seam(k,wing,ridge,profile,.022);
      seam(k,wing,'deep',profile.map(([x,y,z])=>[x,y-.033,z-.041]),.020);
    }
  }
}

const guardianBacks=[
  null,'prayer','prayer','rivets',null,null,'sundial',null,null,'oath','rivets','ferry','oath',null,null,'sundial',
  'sundial',null,null,'oath',
];

function guardianKeepsake(k,model,id,mobile){
  const feature=guardianBacks[Number(id.slice(7))];
  if(!feature)return;
  const offering=k.bone(model.body,0,.48,model.back?-.38:-.22);
  if(feature==='prayer'||feature==='oath'){
    const w=feature==='oath'?.24:.166,h=feature==='oath'?.46:.31;
    const outline=[[-w,.335,.039],[0,.42,-.037],[w,.321,.021],[w*.91,-h*.55,-.081],
      [.08,-h,-.17],[0,-h*1.14,-.177],[-.078,-h,-.14],[-w*.91,-h*.5,-.05]];
    plate(k,offering,'deep',outline,.054);
    seam(k,offering,'trim',outline.map(([x,y,z])=>[x,y,z-.041]),.019);
    for(let i=0;i<(mobile?4:6);i++){
      const y=.212-i*.073;
      seam(k,offering,i%2?'edge':'glow',[[-w*.47,y,-.109],[0,y+.041,-.136],
        [w*.45,y+.006,-.118]],.009+i*.001);
    }
  }else if(feature==='rivets'){
    for(let i=0;i<4;i++){
      const y=.38-i*.173,z=-.04-i*.018;
      for(const side of [-1,1]){
        const p=opposite(side,[[.105,y+.07,z],[.25,y+.09,z+.037],[.31,y-.017,z+.021],
          [.19,y-.098,z],[.07,y-.04,z-.036]]);
        plate(k,offering,i%2?'trim':'body',p,.041);
        jewel(k,offering,'glow',side*.172,y-.032,z-.050,.026,.027,.018);
      }
    }
  }else{
    const ring=k.bone(offering,0,.105,-.049);
    torque(k,ring,feature==='ferry'?.247:.295,'trim',mobile?8:13);
    jewel(k,ring,'deep',0,0,-.056,.176,.176,.028);
    const hands=k.bone(ring,0,0,-.089);
    seam(k,hands,'edge',[[-.095,-.122,0],[0,0,-.006],[.058,.177,.01]],.023);
    seam(k,hands,'glow',[[0,-.023,.027],[.048,.077,.017],[.13,.10,.023]],.014);
    model.campaign.flaps.push({joint:hands,axis:'z',amp:.34,bias:.49,seed:4});
    if(feature==='ferry')for(const side of [-1,1])lantern(k,ring,side*.301,-.254,-.042,.32);
  }
  model.campaign.flaps.push({joint:offering,axis:'x',amp:.097,bias:-.032,seed:5.7});
}

export function buildCampaignSculpt(k,entry,mobile=false,weapon){
  if(!entry.palette)return null;
  const id=entry.artId??entry.id,build=campaignModels[id];
  if(!build)return null;
  finishCampaign(k,entry);
  const model=build(k,mobile);
  jointCuirass(k,model,entry,mobile);
  if(id.startsWith('forest-')){
    guardianKeepsake(k,model,id,mobile);
    detailForestGuardian(k,model,id,mobile);
  }
  if(!entry.field)detailBossVariant(k,model,entry,weapon,mobile);
  return model;
}

export function poseCampaignSculpt(model,time,{stage,wind,strike,travel,fall,step,beat}){
  const {campaign,body}=model;
  const {flaps,joints,jaw,baseJaw=0,lean=0,neck}=campaign;
  for(const {joint,side,leg,step:offset=0} of joints){
    const phase=step+(side>0?Math.PI:0)+offset*1.86;
    if(leg){
      joint.rotation.x=(.13+Math.max(0,Math.cos(phase))*.47)*travel+wind*.082-strike*.07;
      joint.rotation.z=side*(Math.sin(phase)*travel*.143+wind*.11);
    }else{
      joint.rotation.x=-.12+wind*.42-strike*.30+travel*Math.sin(phase)*.17;
      joint.rotation.y=side*(wind*.23-strike*.16);
      joint.rotation.z=side*(.033+strike*.15);
    }
  }
  for(const {joint,axis,amp,bias,seed,stride} of flaps){
    const wave=Math.sin((stride?step:beat)*.61+seed);
    joint.rotation[axis]=bias+wave*amp*(.47+travel*.70+stage*.162)+strike*amp*.78-wind*amp*.43;
  }
  if(neck){
    neck.rotation.x=-wind*.23+strike*.31+Math.sin(time*2.7)*.065;
    neck.rotation.y=Math.sin(beat*.26)*(.17+stage*.08);
  }
  if(jaw)jaw.rotation.x=baseJaw+wind*.29+strike*.42-fall*.03;
  body.rotation.x+=lean+travel*.075;
}
