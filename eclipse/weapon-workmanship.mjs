import * as T from '../three.min.mjs';

const sides=[-1,1];
const tau=Math.PI*2;

// Collars and bevel bands are fitted around the original design coordinates.
// [proximal end, distal end, height above the face, number of engravings]
const hardened={
  flameblade:[.13,.93,.58,6],reaper:[.27,.91,.57,5],'sam-in':[.09,.94,.59,5],
  'glacier-sword':[.14,.91,.62,6],'thunder-sword':[.13,.91,.57,6],
  'moon-kukri':[.09,.92,.60,5],'dragon-kukri':[.11,.95,.59,7],
  'skanda-kukri':[.11,.91,.59,6],goumang:[.11,.87,.60,5],'blood-sword':[.10,.94,.77,7],
  'nether-sword':[.11,.94,.59,6],windhalberd:[.08,.92,.59,6],
  'sky-halberd':[.08,.91,.57,7],'red-corporal':[.11,.94,.59,5],'blue-corporal':[.11,.94,.56,5],
  'shiva-trident':[.11,.94,.62,6],xuanming:[.10,.93,.58,5],
  'vritra-spear':[.08,.94,.62,6],'nether-halberd':[.10,.92,.58,5],
  'snow-axe':[.13,.85,.64,6],'blood-axe':[.15,.87,.63,7],'zhurong-axe':[.17,.89,.64,6],
};

function crossSection(flat,y){
  const cuts=[];
  for(let i=0;i<flat.length;i+=2){
    const x=flat[i],a=flat[i+1],x2=flat[(i+2)%flat.length],b=flat[(i+3)%flat.length];
    if((a<=y&&b>y)||(b<=y&&a>y))cuts.push(x+(x2-x)*(y-a)/(b-a));
  }
  cuts.sort((x,y)=>x-y);
  let wide=null;
  for(let i=0;i+1<cuts.length;i+=2){
    if(!wide||cuts[i+1]-cuts[i]>wide[1]-wide[0])wide=cuts.slice(i,i+2);
  }
  return wide;
}

function bladeCut(h,id,kind,outline){
  const [from,to,lift,count]=hardened[id];
  const ys=outline.filter((_,i)=>i%2===1),minimum=Math.min(...ys),height=Math.max(...ys)-minimum;
  const coating=kind==='axe'?'trim':'hardened';
  for(const s of sides){
    for(let band=0;band<count;band++){
      const t=from+(to-from)*band/count,y=minimum+height*t;
      const next=y+height*.063*(kind==='blade'?1.17:1),inside=crossSection(outline,y),outside=crossSection(outline,next);
      if(!inside||!outside)continue;
      const left=band%2===0||(id==='reaper'||id.includes('kukri'));
      const at=(section,m)=>T.MathUtils.lerp(section[0],section[1],left?m:1-m);
      const a=at(inside,.12),b=at(inside,.34),c=at(outside,.24),d=at(outside,.11);
      const width=Math.abs(a-b);
      if(width<.14)continue;
      const z=s*lift;
      // The channel at the root of each bevel is inlaid rather than cut through the blade.
      h.plate([a,y,b,y-.064,c,next,d,next-.11],coating,.10,[0,0,z],.045);
      h.line([[a,y,z+s*.049],[(a+b)*.53,y+.142,z+s*.086],[d,next-.119,z+s*.035]],
        .042,band%3===1?'core':'patina',false);
    }
    const isSword=kind==='blade'&&id!=='reaper';
    if(isSword){
      const y=-7.70,z=s*.51;
      h.plate([-.50,y+.47,-.35,y+.84,.32,y+.82,.54,y+.28,.39,y-.09,-.38,y-.045],
        'patina',.18,[0,0,z],.048);
      h.gem([0,y+.42,z+s*.15],.14,'hardened',[1,1.25,.57]);
    }
  }
}

const shaftWork={
  'sky-dragon-staff':[.59,7.56,1.78,2.84,3,'edge'],
  'treasure-staff':[.61,6.82,1.48,2.54,4,'trim'],
  'venom-cane':[.56,6.71,1.30,2.22,4,'core'],
  'yama-cane':[.61,6.51,1.60,2.15,4,'edge'],
  'bat-cane':[.56,6.31,2.09,2.32,5,'body'],
  'cursed-cane':[.53,6.91,1.66,2.02,3,'trim'],
  'rushou-cane':[.56,7.17,1.43,2.24,3,'edge'],
  'emperor-rod':[.55,7.29,1.43,2.31,3,'trim'],
  bell:[.55,5.66,2.25,1.34,3,'trim'],
};

function chasedShaft(h,id){
  const [radius,y,reach,peak,tiers,finish]=shaftWork[id];
  h.loop([0,y-.60,0],radius*1.24,.13,'hardened','xz',13);
  for(let n=0;n<tiers;n++){
    const t=n/tiers,a=t*tau+.23;
    const point=(r,h)=>[Math.cos(a)*r,y+h,Math.sin(a)*r];
    h.solid([[...point(radius-.045,-.33),.12,.14],[...point(radius*1.47,-.10),.17,.23],
      [...point(reach*.79,peak*.46),.115,.13],[...point(reach,peak*.78),.022,.04]],finish,
      {rings:9,sides:7,section:2.11,ridge:.15});
    h.gem(point(radius*1.59,.07),.16,n%3?'patina':'core',[.75,1.53,.82]);
    h.line([point(radius+.07,-.70),point(radius+.18,-.12),point(reach*.8,peak*.51)],
      .046,'trim');
  }
}

const bowBands={
  stormbow:[-3.10,5.00,.60,1.08,'hardened'],'oni-bow':[-3.60,3.42,.53,1.19,'trim'],
  'turtle-bow':[-2.62,3.63,.62,.75,'edge'],'red-bow':[-3.21,4.79,.57,1.28,'trim'],
  'nether-bow':[-4.02,4.68,.59,1.37,'edge'],
};

function bowBinding(h,id){
  const [x,y,z,width,finish]=bowBands[id],bow=h.root.userData.bow;
  for(const s of sides){
    const section=new T.Group();
    section.name='弓肢護箍';
    section.position.set(x*.1,s*y*.1,0);
    h.root.add(section);
    bow.attachments.push({mesh:section,rest:section.position.clone()});
    function mount(mesh){
      mesh.position.sub(section.position);
      section.add(mesh);
    }
    for(const face of sides){
      const a=s*y,depth=face*z;
      mount(h.plate([-.42,-.85,.34,-.95,.77,-.45,.62,.32,.32,.87,-.55,.69],
        'patina',.20,[x,a,depth],.085));
      mount(h.line([[x-width*.49,a-s*.52,depth],[x+.28,a-s*.15,depth+face*.20],
        [x+width*.53,a+s*.58,depth+face*.12]],.13,finish));
      mount(h.gem([x+.32,a+s*.25,depth+face*.27],.144,'core',[.68,1.44,.71]));
    }
  }
}

// [case radius, trim depth, count, phase] for rings, shell, crystal, and prayer beads.
const casings={
  tiger:[4.60,.66,4,.44],chakra:[5.26,.77,8,.16],'han-spear':[3.15,.57,8,.01],
  'wave-wheel':[4.76,.65,4,.19],'kali-wheel':[3.41,.63,3,.36],
  dragon:[3.80,2.65,4,.56],'thunder-pearl':[3.76,2.74,5,.26],'ice-orb':[3.78,2.40,5,.76],
  'fire-orb':[3.73,2.38,6,.48],'spark-orb':[3.20,2.50,5,.40],'golden-orb':[4.51,.84,6,.22],
  'earth-beads':[3.57,.65,6,.63],'lotus-beads':[3.30,.69,5,.78],'ice-talisman':[2.22,.96,4,.31],
  turtle:[3.81,.93,5,.66],'nether-box':[2.85,1.39,4,.15],
};

function captiveSetting(h,id,kind){
  const [radius,depth,count,phase]=casings[id];
  const stone=kind==='orb'&&id!=='golden-orb',chain=kind==='beads';
  const flat=!stone&&!chain;
  for(let i=0;i<count;i++){
    const angle=(i/count)*tau+phase;
    const center=chain?.78:0;
    const point=(r,a,z)=>[Math.sin(a)*r,center+Math.cos(a)*r,z];
    const seat=stone?Math.sqrt(Math.max(.18,1-(radius/(radius+.75))**2))*.84+.40:1;
    const path=[
      point(radius-.18,angle-.105,-depth*seat),
      point(radius+.22,angle-.07,-depth*.71),
      point(radius+.34,angle,0),
      point(radius+.17,angle+.067,depth*.69),
      point(radius-.21,angle+.11,depth*seat),
    ];
    if(kind==='box'||kind==='seal'){
      for(const p of path){p[0]*=.87;p[1]*=1.43;}
    }
    h.line(path,.133,i%2===1?'patina':'trim');
    for(const s of sides){
      const p=point(radius-.18,angle+.073,depth*s*seat);
      if(kind==='box'||kind==='seal'){p[0]*=.87;p[1]*=1.43;}
      h.gem(p,stone?.189:.158,i%3===2?'core':'hardened',[.93,1.38,.61]);
      if(flat&&(i%2===0||kind==='seal')){
        const a=point(radius-.54,angle-.08,depth*1.031*s),b=point(radius-.24,angle+.042,depth*1.21*s);
        if(kind==='box'||kind==='seal'){a[0]*=.87;b[0]*=.87;a[1]*=1.43;b[1]*=1.43;}
        h.line([a,b],.037,'core',false);
      }
    }
  }
}

const lofts={
  phoenix:[-.75,3.91,1.42,.72,4,'brass'],qilin:[-.09,3.42,1.69,.66,4,'edge'],
  'fox-doll':[.34,-.30,2.25,1.29,5,'trim'],'snow-doll':[.10,-.57,2.02,1.40,5,'edge'],
  'kunoichi-claw':[-.18,-.12,2.30,.74,5,'patina'],'dragon-fish':[.15,-.25,2.12,1.48,5,'trim'],
  'lotus-fish':[.18,-.49,1.92,1.39,4,'edge'],airavata:[-.72,.57,2.01,.97,5,'trim'],
  hundun:[.11,-1.05,2.26,.93,5,'patina'],qiongqi:[.78,3.37,1.45,.57,5,'trim'],
  taotie:[-.19,-.75,2.24,.95,6,'edge'],taowu:[-.67,2.06,1.93,.84,5,'hardened'],
  snake:[.12,-.36,1.54,.65,5,'trim'],
};

function creatureFittings(h,id,kind){
  const [x,y,width,depth,count,finish]=lofts[id];
  const tin=finish==='brass'?'trim':finish;
  for(const s of sides){
    for(let i=0;i<count;i++){
      const q=(i/(count-1))-.5,d=s*(depth+Math.cos(q*2.45)*.22),a=x+q*width*.93,b=y+(kind==='fish'?q*.7:0);
      const f=(k,n,m)=>[a+k*width,b+n,d+s*m];
      const hook=h.solid([[...f(-.09,-.31,-.15),.13,.12],[...f(.017,.04,.11),.216,.168],
        [...f(.10,.39,.23),.155,.11],[...f(.12,.53,.08),.028,.016]],i%2?'patina':tin,
        {rings:7,sides:7,section:2.13,ridge:.17});
      hook.rotation.z=i%2?.026:-.026;
      h.gem(f(.03,.08,.20),.091,i%3?'hardened':'core',[.75,.96,.65]);
    }
    h.line([[x-width*.46,y-.34,s*(depth+.10)],[x,y-.047,s*(depth+.36)],[x+width*.52,y+.31,s*(depth+.09)]],
      .075,'trim');
  }
}

const firearms={
  cannon:[2.08,1.57,[-2.98,-1.01,2.42,5.22],.24],
  'western-rifle':[.70,.62,[-6.12,-2.31,.21,4.62],.43],
  'sniper-crossbow':[.66,.68,[-5.17,-1.46,1.11,4.90],.50],
  'lion-crossbow':[.81,.73,[-5.24,-1.98,1.04,4.29],.58],
};

function barrelHardware(h,id){
  const [width,depth,rows,sweep]=firearms[id];
  for(const s of sides){
    for(const [i,y] of rows.entries()){
      const v=s*depth,c=width*(1-i*.08);
      h.plate([-c,y-.43,-c*.73,y+.59,c*.60,y+.87,c,y+.31,c*.80,y-.40],
        i%2?'patina':'hardened',.16,[0,0,v],.08);
      for(const x of [-c*.52,c*.55])h.gem([x,y+.22,v+s*.17],.13,i===2?'core':'trim',[.80,.85,.46]);
      const inletX=-s*.31+Math.sin(i*1.6)*.20;
      h.line([[inletX,y-.18,v+s*.18],[inletX+s*sweep*.63,y+.08,v+s*.215],
        [inletX+s*sweep,y+.48,v+s*.12]],.050,i===1?'trim':'dark',false);
    }
  }
}

function foldingBelly(h,id){
  for(const s of sides){
    const z=s*.7;
    const half=[[-1.06,.05],[-.64,.63],[0,.67],[.62,.52],[1.17,.07]];
    for(let i=0;i<3;i++){
      const y=i*2.30-1.32;
      h.line(half.map(([x,q])=>[x,y+q,z+s*.08*q]),i===1?.094:.113,i===1?'core':'hardened');
      h.gem([0,y+.57,z+s*.18],.13,'trim',[.98,1.03,.66]);
    }
  }
  if(id==='true-seven')h.loop([0,-7.71,0],.75,.141,'trim','xz',13);
}

function luteBack(h){
  for(const s of sides){
    const z=-1.27,w=1.43*s;
    h.line([[.014,-7.06,z],[w,-6.55,z-.17],[w*1.71,-5.41,z-.18],
      [w*1.46,-4.39,z-.13],[w*.57,-3.11,z-.08],[w*.22,-2.02,z+.14]],.103,'trim');
    for(let n=0;n<4;n++){
      const y=-6.43+n*.78;
      const x=w*(1.23-.12*n);
      h.plate([-.21,-.35,.15,-.41,.41,-.12,.26,.25,.06,.35,-.28,.21],
        n%2?'patina':'hardened',.061,[x,y,z-.19],.04);
    }
  }
  h.line([[0,-7.33,-1.21],[0,-5.16,-1.54],[0,-3.18,-1.18],[0,-2.14,-.94],[.22,.08,-.65]],.121,'dark');
}

function twinsTang(h){
  // The two blade groups are siblings kept at child indices zero and one.
  const blades=h.root.children.slice(0,2);
  for(const [i,node] of blades.entries()){
    const z=i===0?.68:-.68;
    const channels=[h.line([[-1.17,-1.07,z],[-.85,.22,z],[-.49,2.38,z],[.47,4.54,z]],
      .10,'patina'),h.gem([0,-2.12,z],.26,'trim',[1.62,.66,.67])];
    for(const part of channels)node.add(part);
  }
}

export function workRelic(h,id,kind,recipe){
  if(hardened[id])bladeCut(h,id,kind,recipe[1]);
  else if(shaftWork[id])chasedShaft(h,id);
  else if(bowBands[id])bowBinding(h,id);
  else if(casings[id])captiveSetting(h,id,kind);
  else if(lofts[id])creatureFittings(h,id,kind);
  else if(firearms[id])barrelHardware(h,id);
  else if(kind==='branch')foldingBelly(h,id);
  else if(kind==='lute')luteBack(h);
  else if(kind==='twins')twinsTang(h);
  else throw new Error('Missing workshop detail for '+id);
}
