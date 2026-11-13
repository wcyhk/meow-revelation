import * as T from '../three.min.mjs';

const wings=new Set(['dragon','bird','wasp']);
const walkers=new Set(['beast','rider','turtle','spider']);
const masks=new Set(['ogre','duelist','captain','priest','shade','emperor','straw']);
const mirror=(side,points)=>points.map(([x,y,z,...rest])=>[side*x,y,z,...rest]);
const profile={sides:6,steps:8,ridge:.19};

export function creatureFace(k,joint,{snout,broad,reptile,horns,bear}) {
  const {sweep,plate}=k.sculpt;
  const eye=reptile?.50:.41;
  const cheek=broad*(bear?1.49:1.30);
  for(const side of [-1,1]){
    sweep(joint,bear?'body':'edge',mirror(side,[
      [broad*.10,.205,eye+.020,.030],[broad*.52,.229,eye+.032,.055],
      [broad*.88,.176,eye-.015,.058],[cheek,.107,.242,.046],[cheek*.88,-.014,.185,.008],
    ]),{...profile,steps:12});
    sweep(joint,'deep',mirror(side,[
      [broad*.11,.076,eye+.013,.018],[broad*.55,.048,eye+.029,.025],
      [broad*.93,.081,eye-.008,.027],[cheek*.92,.103,.222,.010],
    ]),profile);
    sweep(joint,bear?'edge':'body',mirror(side,[
      [broad*.70,.41,-.166,.042],[cheek*.94,.32,-.061,.078],[cheek,.13,.209,.069],
      [broad*.97,-.06,eye-.024,.057],[broad*.53,-.17,eye+snout*.18,.025],
    ]),{...profile,steps:14,sides:8});
    const jaw=broad*(reptile?.82:.77);
    sweep(joint,'deep',mirror(side,[[0,-.225,.39+snout*.69,.033],[jaw*.59,-.224,.39+snout*.62,.041],
      [jaw,-.158,.38+snout*.23,.041],[cheek*.84,-.06,.33,.014]]),profile);
    for(let i=0;i<(bear?3:2);i++){
      const x=jaw*(.33+i*.18),z=.397+snout*(.66-i*.123);
      sweep(joint,'edge',mirror(side,[[x,-.197,z,.028],[x*1.03,-.23-i*.012,z+.025,.024],
        [x*.96,-.275-i*.018,z+.04,.004]]),profile);
    }
    if(horns===2){
      sweep(joint,'edge',mirror(side,[[broad*.73,.328,-.059,.112],[broad*.98,.480,-.091,.104],
        [broad*1.32,.635,-.186,.072],[broad*1.25,.785,-.256,.036],[broad*.93,.89,-.29,.003]]),
      {...profile,steps:15,sides:9});
      sweep(joint,'trim',mirror(side,[[broad*.86,.41,-.024,.028],[broad*1.22,.55,-.081,.023],
        [broad*1.35,.70,-.170,.008]]),profile);
    }
    if(bear){
      const earX=broad*.95;
      sweep(joint,'edge',mirror(side,[[earX,.285,-.107,.099],[earX+.094,.425,-.102,.111],
        [earX+.15,.488,-.102,.084],[earX+.17,.45,-.105,.012]]),profile);
      for(let i=0;i<5;i++){
        const y=.234-i*.08,x=broad*(.79+Math.sin(i*.71)*.18);
        plate(joint,i%3===0?'body':'edge',mirror(side,[[x,y+.07,.15],[x+.10,y+.028,.083],
          [x+.186,y-.133,-.028],[x+.082,y-.087,.018],[x-.042,y-.041,.166]]),.047,.019);
      }
    }
  }
}

function signature(id) {
  let seed=2166136261;
  for(const char of id)seed=Math.imul(seed^char.charCodeAt(0),16777619);
  return seed>>>0;
}

function wingDetail(sculpt,entry,parts,seed) {
  const {sweep,plate}=sculpt;
  for(const [index,hinge] of (parts.arms??[]).slice(0,2).entries()){
    const side=index?1:-1;
    const feathered=entry.family==='bird'&&entry.id!=='m024';
    const insect=entry.family==='wasp';
    const span=insect?1.60:entry.id==='m024'?2.55:2.09;
    if(feathered){
      const layered=entry.id==='m015'||entry.id==='m148';
      for(let i=0;i<7;i++){
        const t=i/6,x=.32+t*(layered?1.37:1.18),y=.31+(layered?Math.sin(i*.23)*.58:t*.42);
        const z=layered?-.09-i*.038:.025,feather=.63+t*.15;
        for(const back of [-1,1]){
          const face=z+back*.09;
          plate(hinge,i%3===0?'edge':'body',mirror(side,[
            [x-.13,y+.10,face],[x+.03,y+.14,face],[x+feather,y-.34+t*.30,face-.053],
            [x+.34,y-.25+t*.10,face-.072],[x+.04,y-.11,face],
          ]),.032,.010);
          sweep(hinge,'trim',mirror(side,[[x,y+.10,face+back*.017,.021],[x+.22,y-.03,face,.015],
            [x+feather*.80,y-.27+t*.25,face-.04,.003]]),profile);
        }
      }
    }else{
      const upper=insect?.27:.66;
      const webZ=entry.id==='m151'?-.14:.015;
      const anchors=mirror(side,[[0,.02,webZ,.068],[span*.30,upper*.84,webZ+.03,.066],
        [span*.58,upper*1.14,webZ,.053],[span,upper*.91,webZ-.08,.016]]);
      sweep(hinge,'body',anchors,{...profile,steps:14});
      for(let i=0;i<4;i++){
        const x=(.33+i*.145)*span;
        const y=upper*(.91+i*.02);
        const tipY=upper*(.10+i*.14)-.18;
        sweep(hinge,'deep',mirror(side,[[x-.22,y,webZ,.031],[x,y-.13,webZ-.024,.034],
          [x+.11,tipY+.11,webZ-.06,.025],[x+.18,tipY,webZ-.09,.005]]),profile);
        for(const back of [-1,1]){
          sweep(hinge,(i+seed)%4===0?'edge':'trim',mirror(side,[[x-.16,y-.025,webZ+back*.056,.016],
            [x+.01,y-.19,webZ+back*.068,.014],[x+.16,tipY+.03,webZ+back*.028,.004]]),profile);
        }
      }
    }
  }
}

function mantleDetail(k,sculpt,entry,parts,seed) {
  const {body,head,arms=[],legs=[]}=parts;
  const {plate,sweep}=sculpt;
  const width=['ogre','straw'].includes(entry.family)?.59:entry.family==='emperor'?.49:.40;
  const armour=['iron','bronze'].includes(entry.finish)||['duelist','captain','emperor'].includes(entry.family);
  const wraps=['priest','shade','straw'].includes(entry.family);
  const bear=entry.id==='m005';
  const dangling=[];
  for(const side of [-1,1]){
    const edge=side*width;
    if(head&&entry.id!=='m153'){
      const boneFinish=wraps?'deep':'edge';
      sweep(head,boneFinish,mirror(side,[[.079,.35,.21,.036],[.24,.33,.23,.064],[.317,.21,.16,.046],
        [.27,.067,.18,.029],[.215,-.04,.22,.004]]),profile);
      sweep(head,'trim',mirror(side,[[.11,.27,-.257,.024],[.27,.24,-.23,.050],[.31,.12,-.22,.028],
        [.258,.007,-.17,.005]]),profile);
    }
    const raised=armour?.085:.047;
    for(let i=0;i<3;i++){
      const row=.58-i*.133;
      plate(body,i===0?'edge':'body',mirror(side,[
        [.07,row+.09,-.365],[width*.69,row+.135,-.30],[width*.94,row+.055,-.23],
        [width*.77,row-.056,-.31],[.078,row-.074,-.387],
      ]),raised,.017);
      sweep(body,'trim',mirror(side,[[.055,row-.085,-.402,.018],[width*.52,row-.079,-.387,.020],
        [width*.80,row-.055,-.321,.009]]),profile);
    }
    for(let i=0;i<(bear?5:3);i++){
      const row=.72-i*(bear?.141:.162),spread=width*(.79+(i===0?.14:0));
      const nose=bear?.53:.40;
      plate(body,bear?(i%3===2?'body':'edge'):armour?'body':wraps?'deep':'trim',mirror(side,[
        [spread*.12,row+.09,nose],[spread*.54,row+.147,nose-.030],[spread*.94,row+.093,nose-.111],
        [spread*1.12,row-.07,nose-.16],[spread*.69,row-.047,nose-.041],[spread*.25,row-.17,nose+.020],
      ]),bear?.044:.068,.016);
      sweep(body,bear?'edge':'trim',mirror(side,[[spread*.13,row-.12,nose+.045,.012],[spread*.57,row-.050,nose-.015,.023],
        [spread*.99,row+.017,nose-.133,.012]]),profile);
    }
    const shoulder=arms[side<0?0:1];
    if(shoulder&&shoulder.position.y>.39&&!parts.mount){
      for(let i=0;i<3;i++){
        const lift=.18-i*.13;
        plate(shoulder,armour?'edge':'body',mirror(side,[
          [.04,lift+.09,-.24],[.25,lift+.04,-.20],[.29,lift-.08,-.04],
          [.22,lift-.15,.14],[.09,lift-.085,.232],
        ]),raised,.015);
      }
      for(const direction of [-1,1])sweep(shoulder,'trim',mirror(side,[
        [.095,-.42,direction*.181,.031],[.245,-.49,direction*.187,.025],
        [.18,-.61,direction*.159,.010],
      ]),profile);
      if(bear){
        for(let i=0;i<4;i++){
          const y=.03-i*.18,x=.09+Math.sin(i)*.05;
          plate(shoulder,i%3===1?'body':'edge',mirror(side,[[x-.11,y+.095,.21],[x+.09,y+.10,.185],
            [x+.23,y-.08,.14],[x+.095,y-.18,.13],[x-.067,y-.07,.24]]),.071,.021);
        }
      }
    }
    const leg=legs[side<0?0:1];
    if(leg?.position.y>1&&leg.parent===k.root){
      const width=bear?.22:.17;
      for(let toe=0;toe<3;toe++){
        const x=(toe-1)*width*.73;
        sweep(leg,'edge',[[x,-.94,.27,.071],[x*1.11,-.955,.39,.067],
          [x*1.14,-.985,.46,.031],[x*1.19,-1.01,.51,.005]],profile);
      }
      for(const back of [-1,1])plate(leg,armour?'trim':'body',[
        [-width,-.39,back*.165],[width*.80,-.37,back*.178],[width,-.62,back*.196],
        [.01,-.78,back*.23],[-width*.91,-.65,back*.174],
      ],.065,.015);
    }
    if(wraps){
      const rag=k.bone(body,edge*.86,.49,-.34);
      const length=.64+((seed>>>(side===1?8:3))&7)*.048;
      plate(rag,'deep',mirror(side,[[0,.05,0],[.14,0,-.01],[.23,-length*.51,-.04],
        [.18,-length,-.095],[.11,-length*.87,-.076],[.04,-length*.90,-.06]]),.026,.011);
      sweep(rag,'trim',mirror(side,[[.08,-.02,-.042,.016],[.13,-length*.43,-.067,.015],[.17,-length*.88,-.087,.004]]),profile);
      dangling.push(rag);
    }else{
      sweep(body,bear?'edge':'deep',mirror(side,[[width*.64,.77,-.194,.040],[width,.59,-.240,.035],
        [width*.91,.36,-.254,.027],[width*.67,.23,-.302,.015]]),profile);
    }
  }
  return dangling;
}

function carapaceDetail(k,sculpt,entry,parts,seed) {
  const {body,head}=parts;
  const {sweep,plate}=sculpt;
  const spider=entry.family==='spider',shell=entry.family==='turtle'||spider;
  const wide=entry.family==='turtle'?.85:spider?.54:.46;
  const center=spider?-.53:-.22;
  const rows=4+seed%2;
  for(const side of [-1,1]){
    for(let i=0;i<rows;i++){
      const z=center+.67-i*.34,y=.58-Math.abs(z-center)*.28;
      const w=wide*(.8-Math.abs(z-center)*.24);
      plate(body,shell?'body':i%2?'edge':'body',mirror(side,[
        [w*.24,y+.09,z+.15],[w*.80,y,z+.19],[w*1.17,y-.19,z+.05],
        [w*.92,y-.27,z-.19],[w*.35,y-.034,z-.21],
      ]),.078,.023);
      sweep(body,i%3===0?'edge':'trim',mirror(side,[[w*.40,y+.022,z-.23,.028],
        [w*.84,y-.10,z-.22,.027],[w*1.17,y-.224,z+.002,.013]]),profile);
    }
    if(head)sweep(head,shell?'trim':'edge',mirror(side,[
      [.134,.33,-.12,.054],[.306,.29,.01,.066],[.40,.12,.10,.052],[.32,-.11,.23,.007],
    ]),profile);
  }
  if(!shell&&!parts.mount){
    for(let i=0;i<3;i++){
      const z=-.64-i*.21;
      sweep(body,'edge',[[0,.50,z,.061],[0,.70,z-.05,.046],[i%2?.08:-.08,.75,z-.19,.006]],profile);
    }
  }
}

function segmentedDetail(sculpt,entry,parts) {
  const {sweep,plate}=sculpt;
  for(const [index,neck] of (parts.arms??[]).entries()){
    if(entry.family!=='hydra'&&index>1)break;
    for(const side of [-1,1]){
      sweep(neck,'trim',mirror(side,[[.26,.43,-.12,.024],[.31,.68,-.195,.034],[.29,.94,-.19,.025],
        [.246,1.18,-.187,.013]]),profile);
      for(let i=0;i<4;i++){
        const y=.46+i*.191,z=-.25+i*.013;
        plate(neck,i%2?'edge':'body',mirror(side,[
          [.04,y-.07,z],[.13,y-.02,z-.055],[.193,y+.18,z-.14],[.286,y+.12,z-.022],[.229,y-.022,z+.014],
        ]),.050,.012);
      }
    }
  }
}

function radialDetail(sculpt,parts,seed) {
  for(const [i,limb] of (parts.arms??[]).entries()){
    const flare=.64+((seed>>>(i%10))&3)*.08;
    for(const side of [-1,1])sculpt.sweep(limb,i%2?'edge':'trim',[
      [0,.18,side*.06,.038],[side*.07,.35,side*.085,.037],[-side*.09,flare,side*.17,.023],
      [0,flare+.09,side*.20,.006],
    ],profile);
  }
}

export function detailCreature(k,entry,parts,mobile) {
  const seed=signature(entry.id),sculpt=k.sculpt;
  let cloth=[];
  if(wings.has(entry.family))wingDetail(sculpt,entry,parts,seed);
  else if(walkers.has(entry.family))carapaceDetail(k,sculpt,entry,parts,seed);
  else if(['serpent','hydra'].includes(entry.family))segmentedDetail(sculpt,entry,parts);
  else if(masks.has(entry.family))cloth=mantleDetail(k,sculpt,entry,parts,seed);
  else radialDetail(sculpt,parts,seed);
  return {cloth,seed,count:mobile?3:6};
}

export function poseCreatureDetail(detail,model,time,beat,wind,strike,travel) {
  const {cloth,seed}=detail;
  for(const [index,strip] of cloth.entries()){
    const side=index?1:-1;
    strip.rotation.set(-travel*.26-Math.sin(beat*1.38+index)*.091-strike*.32,
      side*.11+Math.sin(beat*.73+index)*.12,side*(.13+wind*.23+Math.sin(beat+index)*.11));
  }
  if(model.head&&!model.mount){
    model.head.rotation.y=Math.sin(time*1.17+seed%15)*(.077+travel*.08)+wind*.12-strike*.07;
  }
}

export function creatureAura(root,box,tint,detail) {
  const data=new Float32Array(detail.count*3);
  const positions=new T.BufferAttribute(data,3).setUsage(T.DynamicDrawUsage);
  const geometry=new T.BufferGeometry().setAttribute('position',positions);
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{tint:{value:new T.Color(tint)},energy:{value:.68}},
    vertexShader:`uniform float energy;
      void main(){vec4 eye=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*eye;
        gl_PointSize=clamp(70.*(.65+energy)/max(1.,-eye.z),2.,13.);}`,
    fragmentShader:`uniform vec3 tint;uniform float energy;
      void main(){vec2 p=gl_PointCoord*2.-1.;float d=length(p*vec2(1.16,.85));
        float glow=(1.-smoothstep(.19,1.,d))*.56;
        float core=1.-smoothstep(.05,.33,d);
        gl_FragColor=vec4(tint+core*.50,(glow+core*.57)*energy);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const points=new T.Points(geometry,material);
  points.frustumCulled=false;
  root.add(points);
  const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
  return {
    pose(time,stage,wind,fall){
      material.uniforms.energy.value=(.36+wind*.33+stage*.19)*(1-fall);
      for(let i=0;i<positions.count;i++){
        const angle=i*2.399+time*(.61+stage*.29)+detail.seed%29;
        const height=(i*.24+time*(.25+stage*.07))%1;
        positions.setXYZ(i,center.x+Math.cos(angle)*size.x*(.25+height*.23),
          box.min.y+size.y*(.12+height*.82),center.z+Math.sin(angle)*size.z*(.27+height*.17));
      }
      positions.needsUpdate=true;
    },
    dispose(){geometry.dispose();material.dispose();},
  };
}
