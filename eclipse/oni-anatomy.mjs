import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const mirror=(s,path)=>path.map(([x,...rest])=>[s*x,...rest]);
const sweep=(k,part,finish,path,mobile)=>k.sculpt.sweep(part,finish,path,
  {steps:mobile?9:16,sides:mobile?6:9,ridge:.22});
const volume=(k,part,finish,path,mobile,seed)=>k.geometry(part,finish,sculptVolume(path,{rings:mobile?13:19,
  sides:mobile?9:14,section:2.32,ridge:.16,seed}));
const plate=(k,part,finish,points,depth)=>k.sculpt.plate(part,finish,points,depth,depth*.29);
const gaussian=(n,s)=>Math.exp(-((n/s)**2));

export const oniFinishes={oniHide:[0x4b6760,.045,.78,'hide'],oniScar:[0x755b4e,.03,.81,'hide'],
  oniVein:[0x394e4d,.025,.74,'hide'],oniHorn:[0xb09a77,.14,.56,'bone']};

export function oniTorso(k,body,sections,mobile){
  const geometry=sculptVolume(sections,{rings:mobile?35:48,sides:mobile?27:36,section:2.11,ridge:.115,seed:15});
  const {position,color}=geometry.attributes;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
    const a=Math.abs(x),front=Math.max(0,z)*3.4,back=Math.max(0,-z)*3.1;
    const rib=gaussian(y-.337+Math.sin(a*5)*.064,.046)*gaussian(a-.24,.22);
    const fascia=gaussian(x,.036)*gaussian(y-.103,.28);
    const stomach=gaussian(a-.138,.153)*gaussian(y-.074,.206);
    const folds=(gaussian(y+.103-a*.16,.024)+gaussian(y+.201-a*.22,.036))*gaussian(a-.193,.183);
    const hump=gaussian(a-.185,.182)*gaussian(y-.35,.24);
    const spine=gaussian(x,.048)*gaussian(y-.244,.49);
    position.setZ(i,z+front*(rib*.044+stomach*.076-fascia*.035-folds*.034)-back*(hump*.085-spine*.033));
    const spots=gaussian(a-.33,.15)*Math.sin(x*58+y*47)*Math.cos(y*55-z*10);
    color.setXYZ(i,color.getX(i)+front*(rib*.085-folds*.14)+back*spots*.047,
      color.getY(i)+front*(stomach*.027-fascia*.088-folds*.09)+back*(hump*.037+spots*.052),
      color.getZ(i)+front*(rib*.048-folds*.08)-back*spine*.072);
  }
  geometry.computeVertexNormals();
  k.geometry(body,'oniHide',geometry);
}

export function oniLimbSculpt(k,rig,mobile){
  const {body,limbs}=rig;
  for(const {shoulder,elbow,wrist,leg,knee,side:s} of limbs){
    volume(k,shoulder,'oniHide',mirror(s,[[.019,.122,-.034,.172,.159],[.06,.016,-.016,.204,.197],
      [.102,-.162,.039,.153,.151],[.143,-.303,.015,.111,.104]]),mobile,s+5);
    volume(k,elbow,'oniHide',mirror(s,[[.002,.048,.014,.108,.145],[.026,-.102,.053,.148,.125],
      [.027,-.226,.055,.117,.099],[.032,-.331,.068,.073,.076]]),mobile,6);
    for(let i=0;i<3;i++){
      sweep(k,shoulder,i===1?'oniScar':'oniVein',mirror(s,[[.172,.073-i*.049,.047,.003],
        [.197,.031-i*.048,.108,.014],[.189,-.049-i*.071,.136,.011],[.154,-.101-i*.067,.148,.003]]),mobile);
    }
    volume(k,wrist,'oniHide',mirror(s,[[0,.058,.017,.085,.078],[.017,-.033,.037,.104,.109],
      [.021,-.106,.084,.093,.067]]),mobile,14);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.044;
      sweep(k,wrist,'oniHide',[[x,.024,.046,.026],[x,-.061,.085,.037],
        [x+s*.012,-.107,.143,.031],[x+s*.017,-.084,.182,.025]],mobile);
      sweep(k,wrist,'oniHorn',[[x+s*.013,-.094,.146,.015],[x+s*.017,-.075,.181,.023],
        [x+s*.018,-.044,.204,.008]],mobile);
    }
    const knuckle=mirror(s,[[.008,.106,.122],[.112,.101,.117],[.167,.021,.079],
      [.106,-.141,.161],[.010,-.184,.182],[-.085,-.091,.151],[-.076,.068,.133]]);
    plate(k,elbow,s===1?'black':'ochre',knuckle,.069);
    sweep(k,elbow,'brass',knuckle.slice(1,5).map(([x,y,z],i)=>[x,y+.009,z+.037,[.01,.023,.022,.007][i]]),mobile);
    for(let i=0;i<3;i++)k.mesh(elbow,'gem','brass',s*(.075-i*.014),.057-i*.074,.168+i*.017,.022,.021,.012);
    volume(k,leg,'oniHide',mirror(s,[[.006,.077,.001,.172,.155],[.024,-.076,.012,.191,.156],
      [.041,-.273,-.011,.14,.142],[.032,-.447,-.066,.115,.112]]),mobile,4);
    volume(k,knee,'oniHide',mirror(s,[[.006,.080,.01,.115,.111],[.026,-.082,-.064,.139,.122],
      [.053,-.224,-.012,.111,.100],[.061,-.331,.098,.137,.082],[.036,-.352,.193,.128,.056]]),mobile,16);
    for(let i=0;i<3;i++){
      const x=(i-1)*.071;
      sweep(k,knee,'oniHide',[[x,-.317,.141,.032],[x,-.349,.202,.049],
        [x+s*.013,-.356,.254,.041],[x+s*.023,-.367,.279,.023]],mobile);
      sweep(k,knee,'oniHorn',[[x+s*.013,-.339,.236,.018],[x+s*.016,-.357,.264,.028],
        [x+s*.021,-.379,.304,.003]],mobile);
    }
    const shin=mirror(s,[[.04,.130,.081],[.146,.087,.032],[.157,-.041,.059],
      [.123,-.197,.123],[.055,-.273,.162],[-.032,-.208,.127],[-.054,-.055,.106]]);
    plate(k,knee,s<0?'ochre':'black',shin,.056);
    sweep(k,knee,'brass',shin.slice(1,6).map(([x,y,z],i)=>[x,y,z+.036,[.005,.022,.019,.019,.004][i]]),mobile);
    for(let i=0;i<4;i++)sweep(k,knee,i===2?'ochre':'black',mirror(s,[[.107,-.053-i*.054,-.046,.016],
      [.151,-.051-i*.054,-.089,.029],[.046,-.057-i*.054,-.151,.029],[-.106,-.063-i*.054,-.061,.009]]),mobile);
  }
  const back=k.bone(body,0,.22,-.31);
  for(let row=0;row<6;row++){
    const y=.23-row*.077,w=.058+Math.sin(row*.62)*.024;
    plate(k,back,row===4?'brass':'ochre',[[0,y+.048,-.037],[w,y+.002,-.066],[w*.82,y-.055,-.093],
      [0,y-.073,-.103],[-w*.89,y-.053,-.092],[-w,y+.008,-.067]],.051);
  }
  for(const s of [-1,1])sweep(k,back,'oniScar',mirror(s,[[.065,.30,.031,.004],[.199,.255,-.026,.016],
    [.273,.107,-.020,.019],[.219,-.021,-.035,.011],[.132,-.133,-.033,.003]]),mobile);
  return {garments:[{name:'灰燼庭・紙翼巡獵 · 前襠',parent:body,path:[[0,-.203,.454,.134],[.043,-.397,.475,.16],
    [.037,-.58,.531,.147],[.111,-.872,.568,.064]],tint:0x4c503e,trim:0xb3854e,lining:0x2f3032,phase:.45,flex:.71},
  {name:'灰燼庭・紙翼巡獵 · 右腰破幅',parent:body,path:[[.361,-.195,-.232,.092],[.447,-.411,-.291,.127],
    [.488,-.665,-.343,.131],[.464,-.913,-.398,.039]],tint:0x60523a,trim:0xb38756,lining:0x2b2a29,phase:1.3,flex:.87}],
  pose({beat,wind,strike}){back.rotation.x=Math.sin(beat*.45)*.019-wind*.046+strike*.09;}};
}
