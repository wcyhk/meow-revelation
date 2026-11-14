import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...coordinates])=>[x*side,...coordinates]);
const bead=(k,part,finish,x,y,z,r)=>k.mesh(part,'gem',finish,x,y,z,r,r*.84,r*.58);
const ridge=(k,part,finish,path,steps=9,segments=7)=>k.sculpt.sweep(part,finish,path,{steps,sides:segments,ridge:.20});
const shield=(k,part,finish,path,depth=.028)=>k.sculpt.plate(part,finish,path,depth,depth*.36);
const raised=(k,part,finish,path,mobile,section=2.65)=>k.geometry(part,finish,sculptVolume(path,{
  sides:mobile?10:13,rings:mobile?10:15,section,ridge:.16,
}));

// Head dimensions, dorsal silhouette, metal finishes and spell colors are independent.
const court={
  m113:{face:'fireMask',features:[.184,.244,.247,.176],rear:[.346,1.34,-.336,.32,.236],metals:['rind','ember','trim'],light:[0xff793d,'embers',[0,.65,0],[.88,1.12,.58]]},
  m118:{face:'monkey',features:[.164,.236,.229,.148],rear:[.274,1.37,-.303,.33,.169],metals:['identityMetal','edge','trim'],light:[0x78e4cf,'ribbons',[0,.88,0],[.72,1.02,.43]]},
  m119:{face:'ash',features:[.168,.257,.244,.171],rear:[.316,1.31,-.375,.38,.315],metals:['rind','identityMetal','trim'],light:[0xf1c96e,'sigils',[0,.94,.06],[.77,.91,.50]]},
  m120:{face:'elephant',features:[.208,.260,.257,.160],rear:[.342,1.30,-.323,.375,.239],metals:['rind','identityMetal','trim'],light:[0x9bbdda,'bolts',[0,.95,.02],[.73,.89,.53]]},
  m123:{face:'sunKing',features:[.171,.243,.260,.160],rear:[.374,1.40,-.341,.38,.355],metals:['identityMetal','rind','trim'],light:[0xffce77,'bolts',[0,1.03,.0],[.92,1.07,.58]]},
  m135:{face:'seer',features:[.149,.249,.232,.142],rear:[.287,1.19,-.361,.29,.280],metals:['identityMetal','rind','edge'],light:[0x9be8ee,'mist',[0,.71,.02],[.97,1.03,.62]]},
  m137:{face:'demon',features:[.185,.249,.275,.191],rear:[.365,1.34,-.336,.37,.287],metals:['rind','identityMetal','trim'],light:[0xff7934,'embers',[0,.76,.10],[.82,1.20,.60]]},
  m139:{face:'archer',features:[.170,.247,.233,.185],rear:[.390,1.30,-.445,.25,.39],metals:['rind','identityMetal','edge'],light:[0xe6cf8a,'ribbons',[.18,.94,.12],[1.05,.61,.45]]},
  m141:{face:'warden',features:[.184,.267,.254,.183],rear:[.425,1.31,-.485,.43,.312],metals:['identityMetal','rind','trim'],light:[0xdda14e,'sigils',[0,.75,-.10],[.88,1.13,.54]]},
  m142:{face:'rot',features:[.200,.253,.232,.201],rear:[.370,1.19,-.374,.326,.28],metals:['identityMetal','deep','ember'],light:[0xc19045,'embers',[0,.76,-.07],[.93,1.03,.61]]},
  m143:{face:'skull',features:[.186,.269,.258,.171],rear:[.415,1.20,-.440,.405,.27],metals:['rind','deep','edge'],light:[0xf1c575,'bolts',[0,.86,.06],[.88,1.02,.53]]},
  m146:{face:'moth',features:[.159,.249,.236,.154],rear:[.284,1.26,-.389,.30,.34],metals:['rind','identityMetal','edge'],light:[0x9d97e4,'mist',[0,.82,.12],[.91,1.06,.62]]},
  m147:{face:'halberd',features:[.175,.274,.247,.178],rear:[.393,1.25,-.383,.34,.30],metals:['identityMetal','rind','trim'],light:[0xc5dca4,'ribbons',[0,.68,-.02],[.95,.98,.52]]},
  'raid-flame':{face:'slag',features:[.206,.268,.285,.206],rear:[.443,1.21,-.481,.37,.34],metals:['deep','rind','ember'],light:[0xff692c,'embers',[0,.75,.02],[.95,1.14,.63]]},
};

function browAndJaw(k,head,des,mobile){
  const {face,features:[width,front,brow,back],metals:[metal,,edge]}=des;
  const bone=['skull','halberd'].includes(face);
  const bare=['monkey','ash','sunKing','archer'].includes(face);
  const eyeSpacing=width*(face==='seer'?.40:face==='moth'?.43:.50);
  const eyeY=face==='rot'?.040:face==='moth'?.060:.075;
  const cheekY=face==='elephant'?-.054:face==='monkey'?-.078:-.117;
  const cheekZ=face==='elephant'?front-.025:front-.017;
  for(const side of sides){
    const s=x=>x*side;
    const orbit=mirror(side,[[eyeSpacing*.43,eyeY+.038,brow],[eyeSpacing*1.18,eyeY+.040,brow+.003],
      [width*.86,eyeY+.053,brow-.034],[width*.85,eyeY-.036,brow-.045],[eyeSpacing*.92,eyeY-.036,brow],
      [eyeSpacing*.36,eyeY-.021,brow+.013]]);
    shield(k,head,'deep',orbit,.020);
    k.mesh(head,'gem','glow',s(eyeSpacing),eyeY,brow+.019,eyeSpacing*.30,.009,.009,0,s(.17),s(.12));
    const mineral=bare?'identityHide':bone?'edge':metal;
    raised(k,head,mineral,mirror(side,[[eyeSpacing*.38,eyeY+.021,brow+.019,.016,.014],
      [eyeSpacing*.84,eyeY+.052,brow+.035,.029,.023],[width*.72,eyeY+.061,brow+.007,.032,.026],
      [width*.98,eyeY+.045,brow-.025,.019,.019],[width*1.12,eyeY+.025,brow-.072,.004,.004]]),mobile);
    const orbitalLip=mirror(side,[[eyeSpacing*.64,eyeY-.038,brow+.018,.006],
      [eyeSpacing*1.05,eyeY-.049,brow+.011,.010],[width*.83,eyeY-.050,brow-.019,.011],
      [width*.98,eyeY-.030,brow-.066,.003]]);
    ridge(k,head,bone?'edge':bare?'identityHide':edge,orbitalLip);
    raised(k,head,mineral,mirror(side,[[width*.38,cheekY-.026,cheekZ+.003,.013,.018],
      [width*.61,cheekY,cheekZ+.009,.032,.028],[width*.91,cheekY+.048,cheekZ-.040,.045,.030],
      [width,cheekY+.073,cheekZ-.130,.029,.027],[width*.84,cheekY+.034,cheekZ-.19,.009,.007]]),mobile);
    const h=face==='elephant'?.065:face==='seer'?.092:.12;
    const visor=mirror(side,[[width*.73,h+.072,.091],[width*1.09,h+.053,.041],[width*1.28,h-.010,-.080],
      [width*1.27,h-.081,-back*.78],[width*1.04,h-.162,-back*1.13],
      [width*.78,h-.153,-back*.92],[width*.92,h-.071,-.030],[width*.78,h-.029,.070]]);
    shield(k,head,metal,visor,face==='seer'?.020:.037);
    ridge(k,head,edge,visor.slice(0,6).map(([x,y,z],i)=>[x+s(.013),y+.012,z-.005,[.006,.012,.017,.018,.014,.004][i]]));
    bead(k,head,edge,s(width*1.18),h-.048,-back*.53,.016);
    // A broad internal shadow separates lower jaw from the previous head volume.
    if(!bare)ridge(k,head,'deep',mirror(side,[[.012,-.159,front+.016,.012],[width*.37,-.149,front+.022,.016],
      [width*.69,-.172,front-.001,.013],[width*.87,-.165,front-.043,.003]]),8);
  }
  if(face!=='elephant'&&face!=='moth'){
    const finish=bare?'identityHide':bone?'edge':metal;
    raised(k,head,finish,[[0,.124,brow+.013,.017,.013],[.006,.069,brow+.025,.027,.021],
      [-.003,.005,front+.040,.023,.031],[.005,-.032,front+.052,.039,.022],[.005,-.061,front+.014,.025,.015]],mobile);
  }
}

function courtIdentity(k,parts,spec,mobile){
  const {head,body}=parts,{face,features:[w,f,,b],metals:[metal,inset,edge],rear:[shoulder,height,back,reach,drop]}=spec;
  browAndJaw(k,head,spec,mobile);
  for(const side of sides){
    const s=x=>side*x;
    // These layers wrap around the ears and nape, under the existing crown horns.
    for(let row=0;row<3;row++){
      const y=.204-row*.081,z=-b-.018-row*.014;
      const collar=mirror(side,[[.011,y+.039,z],[w*.49,y+.063,z-.022],[w*.99,y+.041,z+.031],
        [w*1.21,y-.016,z+.091],[w*.98,y-.055,z+.025],[w*.47,y-.040,z-.029],[.012,y-.028,z-.022]]);
      shield(k,head,row%2?inset:metal,collar,.026);
      ridge(k,head,row===1?'deep':edge,collar.slice(1,6).map(([x,y,z],i)=>[x+s(.011),y,z-.018,[.005,.012,.012,.010,.003][i]]));
      if(row!==1)bead(k,head,edge,s(w*.59),y+.013,z-.039,.019);
    }
    const arm=body.children.find(c=>Math.abs(c.position.x-side*shoulder)<.12
      &&Math.abs(c.position.y-1.41)<.045&&Math.abs(c.position.z)<.053);
    const joint=arm??body;
    const [x,y,z]=arm?[0,0,0]:[s(shoulder),height,0];
    const depth=Math.abs(back);
    const molding=mirror(side,[[.008,.079,.07],[reach*.38,.177,.015],[reach*.75,.155,-depth*.45],
      [reach*.86,.045,-depth*.80],[reach*.63,-.058,-depth*1.05],[reach*.20,-.093,-depth*.88],[.005,-.056,-depth*.48]])
      .map(([a,b,c])=>[a+x,b+y,c+z]);
    shield(k,joint,metal,molding,.029);
    ridge(k,joint,edge,molding.slice(0,6).map(([x,y,z],i)=>[x+s(.014),y+.013,z-.012,[.010,.022,.025,.021,.015,.004][i]]),12);
    for(let row=0;row<(mobile?2:3);row++){
      const S=side*reach,H=height-row*drop*.36,D=back-row*.052;
      const fin=[[s(.022),H+.075,D-.002],[S*.46,H+.12,D-.033],[S*.94,H+.074,D+.009],
        [S*1.16,H-.015,D+.052],[S*.82,H-.108,D+.014],[S*.38,H-.094,D-.061],[s(.015),H-.037,D-.072]];
      shield(k,body,row%2?metal:inset,fin,.038);
      ridge(k,body,row===1?'deep':edge,fin.slice(1).map(([x,y,z],i)=>[x,y,z-.024,[.009,.015,.017,.014,.010,.003][i]]));
      bead(k,body,edge,S*.49,H+.021,D-.064,.023);
    }
    // Deep relief at the readable distance of the practice camera.
    if(face==='elephant'){
      for(let i=0;i<3;i++){
        const y=.132-i*.071;
        ridge(k,head,i===1?'edge':'deep',mirror(side,[[.194,y,.112,.006],[.277,y+.032,.094,.015],
          [.331,y+.012,.058,.016],[.360,y-.064,.013,.002]]),11);
      }
      raised(k,head,'edge',mirror(side,[[.131,-.14,.164,.034,.025],[.201,-.175,.270,.065,.040],
        [.227,-.124,.352,.044,.034],[.199,-.076,.405,.014,.011],[.163,-.044,.423,.002,.002]]),mobile);
    }else if(face==='moth'||face==='seer'){
      const crest=mirror(side,[[.014,.20,.133,.024,.013],[.079,.243,.082,.068,.028],
        [w*1.23,.31,-.026,.052,.031],[w*1.64,.367,-b*.81,.032,.016],[w*1.86,.458,-b*1.21,.002,.002]]);
      raised(k,head,face==='seer'?'trim':'identityMetal',crest,mobile,2.7);
      ridge(k,head,edge,crest.map(([x,y,z,r])=>[x,y+.006,z+.031,r*.25]),11);
    }else if(['ash','sunKing','archer','monkey'].includes(face)){
      const length=face==='ash'?.204:face==='archer'?.143:face==='sunKing'?.157:.083;
      const brow=mirror(side,[[.019,-.067,f+.030,.011],[.073,-.080,f+.036,.019],[.13,-.104,f+.012,.021],
        [w*.92,-.118,f-.039,.014],[w,-.076,f-.080,.002]]);
      ridge(k,head,'deep',brow,13);
      for(let i=0;i<(mobile?4:6);i++){
        const x=w*(.27+i*.094),g=1-i*.105;
        ridge(k,head,i%3===0?'identityHide':'deep',mirror(side,[[x,-.121,f-.008,.016],
          [x*1.21,-.177,f+.003,.022],[x*.98,-.184-length*.56*g,f-.003,.018],
          [x*.67,-.187-length*g,f-.068,.003]]),11);
      }
      if(face==='sunKing'){
        const jewel=mirror(side,[[.052,.254,.143,.019],[.129,.285,.105,.033],[.22,.263,.036,.018],
          [.294,.224,-.070,.004]]);
        ridge(k,head,'trim',jewel,12);
        bead(k,head,'glow',s(.122),.281,.138,.019);
      }
    }else{
      const fangLength=face==='warden'?.152:face==='demon'?.146:face==='rot'?.063:.106;
      for(let fang=0;fang<3;fang++){
        const x=.057+fang*.027,l=fangLength*(.57+fang*.25);
        ridge(k,head,boneFinish(face),mirror(side,[[x,-.161,f+.004,.014],[x*1.12,-.164-l*.31,f+.045,.019],
          [x*1.17,-.172-l*.72,f+.045,.011],[x*1.32,-.172-l,f+.033,.002]]),9);
      }
      if(face==='fireMask'||face==='slag'||face==='rot'){
        ridge(k,head,'ember',mirror(side,[[.037,.169,f-.026,.006],[.091,.176,f-.049,.011],
          [.133,.251,.079,.012],[w*.92,.299,-.012,.004]]),13);
      }
    }
  }
  const y=height-.018,z=back-.040;
  const emblem=[[0,y+.186,z+.015],[reach*.34,y+.084,z],[reach*.26,y-.063,z-.044],[0,y-.185,z-.066],
    [-reach*.26,y-.063,z-.044],[-reach*.34,y+.084,z]];
  shield(k,body,metal,emblem,.041);
  ridge(k,body,edge,[...emblem,emblem[0]].map(([x,y,z])=>[x,y,z-.035,.017]),16);
  raised(k,body,inset,[[0,y+.13,z-.054,.021,.014],[.011,y+.061,z-.077,.074,.033],
    [0,y-.040,z-.093,.066,.028],[-.011,y-.106,z-.095,.010,.012]],mobile);
  if(['sunKing','seer','moth','rot','slag','warden'].includes(face))bead(k,body,'glow',0,y+.03,z-.13,.056);
}

const boneFinish=face=>['skull','halberd','warden','demon'].includes(face)?'edge':'trim';

function affect(parts,[tint,shape,offset,span],anchor=parts.body){
  parts.polishEnergy={tint,shape,anchor,offset,span};
}

const beasts={
  m116:{crest:'cobra',head:[.36,.092,.416,.278],spine:[.27,1.60,-.29,.53,.33],finishes:['rind','trim','edge'],light:[0xdb9cec,'sigils',[0,1.47,.17],[.64,1.08,.47]]},
  m121:{crest:'silk',head:[.28,-.03,.562,.23],spine:[.37,.43,-.81,.61,.38],finishes:['rind','trim','edge'],light:[0xe0b98c,'sigils',[0,.21,-.18],[.65,.67,.69]]},
  m126:{crest:'cinder',head:[.23,.015,.351,.26],spine:[.21,.93,.06,.42,.41],finishes:['rind','trim','edge'],light:[0xf76d63,'embers',[.05,.75,.17],[.63,.92,.54]]},
  m127:{crest:'spurs',head:[.21,.016,.358,.24],spine:[.28,.85,-.36,.44,.29],finishes:['rind','trim','edge'],light:[0xf0a27d,'embers',[0,.80,.18],[.87,.84,.60]]},
  m128:{crest:'fang',head:[.32,-.042,.544,.38],spine:[.34,.71,-.56,.44,.49],finishes:['rind','trim','edge'],light:[0xc981a5,'bolts',[0,.77,.20],[.85,1.02,.66]]},
  m129:{crest:'mane',head:[.38,.044,.411,.53],spine:[.36,.66,-.46,.53,.43],finishes:['rind','trim','edge'],light:[0xe0d2ae,'ribbons',[0,.38,.04],[.86,.56,.85]]},
  m130:{crest:'bridle',head:[.33,-.02,.415,.47],spine:[.38,.57,-.43,.42,.46],finishes:['rind','trim','edge'],light:[0x90e1ed,'ribbons',[0,.45,.08],[.79,.54,1.05]]},
  m131:{crest:'gills',head:[.32,.035,.476,.31],spine:[.32,.79,-.51,.45,.49],finishes:['rind','trim','edge'],light:[0x73d9fb,'mist',[0,.75,.08],[.94,.83,.64]]},
  m132:{crest:'maw',head:[.36,.035,.389,.54],spine:[.38,.62,-.51,.52,.43],finishes:['rind','ember','edge'],light:[0xff7940,'embers',[0,.43,.13],[.87,.71,.62]]},
  m134:{crest:'shell',head:[.34,.035,.744,.53],spine:[.83,.67,-.91,.57,.46],finishes:['rind','trim','edge'],light:[0x8bd4fa,'bolts',[0,.39,-.36],[1.13,.78,.94]]},
  m136:{crest:'plumes',head:[.19,.090,.350,.32],spine:[.35,.48,-.47,.44,.40],finishes:['rind','trim','edge'],light:[0xffa341,'embers',[0,.44,.06],[1.12,.87,.91]]},
  m138:{crest:'dragon',head:[.36,-.017,.456,.32],spine:[.55,1.40,.074,.49,.39],finishes:['rind','trim','edge'],light:[0x89eed7,'ribbons',[.16,1.17,.15],[.84,.87,.91]]},
  m140:{crest:'tiger',head:[.29,.018,.336,.36],spine:[.37,.56,-.35,.52,.40],finishes:['rind','trim','edge'],light:[0xb7eaff,'ribbons',[0,.44,.06],[1.01,.57,.88]]},
  m144:{crest:'inferno',head:[.401,.035,.429,.58],spine:[.42,.74,-.43,.56,.55],finishes:['rind','ember','edge'],light:[0xffa04d,'embers',[0,.48,.02],[.91,.80,.89]]},
  m145:{crest:'lightning',head:[.391,.006,.400,.48],spine:[.46,.70,-.48,.54,.51],finishes:['rind','trim','edge'],light:[0xffdb8b,'bolts',[0,.44,-.02],[.90,.75,.91]]},
  m148:{crest:'owl',head:[.24,.009,.383,.40],spine:[.23,.50,-.49,.48,.39],finishes:['rind','trim','edge'],light:[0x83c9fc,'mist',[0,.26,.09],[1.03,.73,.91]]},
  m149:{crest:'frost',head:[.416,.061,.424,.69],spine:[.45,.59,-.43,.51,.51],finishes:['rind','trim','edge'],light:[0xc5f5ff,'ribbons',[0,.45,.13],[.94,.69,.94]]},
  m150:{crest:'emperor',head:[.49,.045,.425,.60],spine:[.87,.93,-.95,.56,.43],finishes:['burntShell','royalShell','copper'],light:[0xc89ee7,'sigils',[0,.65,-.24],[1.25,.84,1.14]]},
  m151:{crest:'chitin',head:[.20,.064,.276,.13],spine:[.26,.35,-.35,.38,.24],finishes:['rind','trim','edge'],light:[0xffd577,'sigils',[0,.36,-.07],[.66,.70,.51]]},
  m152:{crest:'serpent',head:[.33,.03,.555,.34],spine:[.34,.79,-.72,.46,.50],finishes:['rind','trim','edge'],light:[0x7df0da,'ribbons',[.05,.78,.12],[.83,.68,.68]]},
  m154:{crest:'horns',head:[.48,.045,.604,.27],spine:[.62,.97,-.92,.62,.47],finishes:['iron','trim','edge'],light:[0xff7257,'embers',[0,.54,.14],[.93,.88,.79]]},
  m157:{crest:'mandrill',head:[.29,-.07,.241,.44],spine:[.49,.56,-.53,.53,.40],finishes:['rind','trim','edge'],light:[0xf4806b,'embers',[0,.55,.03],[.80,.81,.73]]},
  m158:{crest:'yeti',head:[.31,-.025,.300,.44],spine:[.54,.78,-.52,.64,.54],finishes:['body','copper','edge'],light:[0x9cdfff,'mist',[0,.56,.04],[.91,.91,.86]]},
  'raid-wyvern':{crest:'dune',head:[.31,-.01,.466,.37],spine:[.37,.80,-.40,.52,.55],finishes:['rind','trim','edge'],light:[0xeac06e,'ribbons',[0,.77,.15],[1.08,.62,.87]]},
};

function beastFace(k,head,spec,mobile){
  const {crest,head:[w,h,z,temple],finishes:[base,edge,bone]}=spec;
  const beak=crest==='plumes'||crest==='owl'||crest==='chitin';
  const maw=['cinder','maw','inferno','fang','lightning','frost','yeti'].includes(crest);
  const plates=crest==='shell'||crest==='emperor'||crest==='bridle';
  const pointed=maw||crest==='tiger'||crest==='mandrill';
  for(const side of sides){
    const s=x=>side*x;
    const brow=mirror(side,[[w*.26,h+.082,z+.032,.012,.015],
      [w*.53,h+.123,z+.011,.045,.038],[w*.77,h+.141,z-w*.16,.050,.037],
      [w*1.05,h+.101,z-w*.63,.035,.026],[w*1.05,h+.079,z-w*.94,.006,.007]]);
    raised(k,head,maw?'deep':base,brow,mobile,3.05);
    ridge(k,head,edge,brow.map(([x,y,z,r])=>[x,y+.019,z+.024,r*.35]),11);
    if(!plates){
      const socket=mirror(side,[[w*.33,h+.055,z+.024],[w*.65,h+.073,z-.014],[w*.91,h+.086,z-.085],
        [w*.78,h+.01,z-.072],[w*.49,h+.006,z+.014],[w*.37,h+.02,z+.021]]);
      shield(k,head,'deep',socket,.024);
      k.mesh(head,'gem','glow',s(w*.595),h+.044,z+.004,w*.092,.011,.018,0,s(.24),s(.16));
    }
    const cheek=mirror(side,[[w*.40,h-.085,z+.012,.02,.016],[w*.66,h-.114,z-.047,.054,.035],
      [w*.94,h-.08,z-w*.45,.069,.047],[w*1.21,h-.015,z-w*.81,.067,.045],
      [w*1.13,h+.022,-temple*.80,.008,.005]]);
    raised(k,head,base,cheek,mobile);
    const seam=cheek.map(([x,y,z,r],i)=>[x+s(.012),y+.027,z+.022,i===0?.006:r*.28]);
    ridge(k,head,plates?edge:'deep',seam,11);
    if(pointed||crest==='dragon'||crest==='serpent'){
      for(let i=0;i<(mobile?3:4);i++){
        const x=w*(.40+i*.163), y=h-.131-i*.019,Z=z+.022-i*w*.14;
        const fang=mirror(side,[[x,y,Z,.025],[x*1.12,y-.047,Z+.047,.028],
          [x*1.13,y-(.070+i*.014),Z+.044,.013],[x*.93,y-.128-i*.008,Z+.057,.003]]);
        ridge(k,head,bone,fang,9);
      }
    }else{
      for(let i=0;i<3;i++){
        const y=h-i*.039;
        ridge(k,head,i===1?edge:base,mirror(side,[[w*.68,y,z-w*.32,.015],[w*1.02,y+.016,z-w*.71,.026],
          [w*1.14,y+.040,z-w*.99,.026],[w*1.21,y+.087,z-w*1.2,.003]]),9);
      }
    }
  }
  if(beak){
    raised(k,head,edge,[[0,h+.098,z-.034,.034,.034],[.004,h+.033,z+.044,.059,.038],
      [0,h-.035,z+.090,.048,.034],[-.003,h-.109,z+.073,.029,.030],[.006,h-.15,z+.047,.007,.008]],mobile,2.50);
  }else if(maw){
    raised(k,head,'deep',[[0,h-.128,z+.032,w*.37,.022],[0,h-.094,z+.041,w*.46,.036],
      [.008,h-.076,z+.074,w*.42,.029],[0,h-.061,z+.089,w*.22,.009]],mobile,3.12);
    ridge(k,head,edge,[[0,h+.08,z-w*.31,.027],[.009,h+.067,z+.01,.041],[.005,h+.034,z+.043,.022],
      [0,h+.002,z+.057,.007]],9);
  }
}

function beastBack(k,body,spec,mobile){
  const {crest,spine:[width,y,z,length,rise],finishes:[metal,edge,bone]}=spec;
  const tower=crest==='shell'||crest==='emperor';
  const long=crest==='serpent'||crest==='cobra'||crest==='dragon';
  const crown=crest==='lightning'||crest==='inferno'||crest==='yeti';
  const sections=tower||long?(mobile?3:5):(mobile?2:3);
  for(const side of sides){
    for(let i=0;i<sections;i++){
      const t=i/(sections-.35),X=(tower?.44:.13)+width*(tower?.66:.73)*t;
      const H=y-(tower?.19:.13)*t,D=z+.36*t;
      const dx=length*(.19+t*.21),dy=rise*(.34-t*.13);
      const contour=mirror(side,[[X*.45,H+.045,D+.075],[X+.021,H+.099,D+.10],
        [X+dx*.64,H+dy*.87,D+.012],[X+dx,H+dy*.61,D-.13],
        [X+dx*.77,H-.10,D-.23],[X+.016,H-.16,D-.187],[X*.51,H-.078,D-.045]]);
      shield(k,body,i%2?metal:edge,contour,.036);
      ridge(k,body,i%2?bone:metal,contour.slice(1,6).map(([x,y,z],i)=>[x,y+.014,z-.023,[.011,.017,.017,.013,.003][i]]),10);
      if(!long)bead(k,body,edge,side*(X+dx*.51),H-.032,D-.19,.018);
      if(crown||long||tower){
        const spine=mirror(side,[[X*.63,H+.033,D+.021,.03,.025],[X+.07,H+dy*.73,D-.048,.058,.038],
          [X+dx*.87,H+dy*1.41,D-.137,.050,.031],[X+dx*.93,H+dy*1.96,D-.295,.030,.024],
          [X+dx*.72,H+dy*2.40,D-.388,.003,.004]]);
        raised(k,body,i%2?bone:metal,spine,mobile,2.35);
      }
    }
  }
}

function wildIdentity(k,parts,spec,mobile){
  if(parts.head)beastFace(k,parts.head,spec,mobile);
  else{
    const lead=parts.body.children.find(child=>child.position.z>.51&&child.position.y>-.18);
    if(lead)beastFace(k,lead,{...spec,head:[.31,.085,.255,.251]},mobile);
  }
  beastBack(k,parts.body,spec,mobile);
}

function mirrorCrown(k,head,trim,base,h,z,w,mobile){
  for(const side of sides){
    const arc=mirror(side,[[w*.42,h-.031,z+.057,.010,.010],[w*.67,h+.028,z+.031,.038,.029],
      [w*.99,h+.053,z-.042,.043,.025],[w*1.13,h+.011,z-.138,.033,.020],
      [w*.99,h-.066,z-.198,.024,.019],[w*.73,h-.196,z-.178,.005,.005]]);
    raised(k,head,base,arc,mobile,2.70);
    ridge(k,head,trim,arc.map(([x,y,z,r])=>[x+side*.017,y+.012,z-.015,r*.41]));
    bead(k,head,'glow',side*w*1.02,h-.075,z-.182,.021);
  }
}

function twinReliquary(k,parts,awakened,mobile){
  for(const [i,head] of parts.heads.entries()){
    const actor=head.parent,metal=i?'royalCyan':'bronzeRib',ivory=i?'royalIvory':'royalPale';
    const radius=i?.155:.181,eye=awakened?.269:.178;
    mirrorCrown(k,head,'trim',metal,.179,.127,radius,mobile);
    for(const s of sides){
      ridge(k,head,'deep',mirror(s,[[.023,.086,eye,.011],[.060,.110,eye+.009,.023],
        [.096,.110,eye-.013,.029],[.147,.099,eye-.055,.008]]),11);
      ridge(k,head,ivory,mirror(s,[[.051,-.049,eye+.018,.012],[.098,-.066,eye+.016,.029],
        [.129,-.043,eye-.019,.038],[.160,-.02,eye-.089,.015]]),11);
      if(awakened){
        ridge(k,head,ivory,mirror(s,[[.082,-.077,eye+.01,.026],[.101,-.145,eye+.076,.024],
          [.125,-.213,eye+.062,.012],[.142,-.255,eye+.028,.002]]),10);
      }
      const seam=mirror(s,[[.024,.621,-.178],[.109,.668,-.222],[.189,.572,-.275],[.207,.448,-.260],
        [.128,.317,-.311],[.035,.367,-.28]]);
      shield(k,actor,i?'royalCyan':'royalCrimson',seam,.036);
      ridge(k,actor,'trim',seam.slice(0,6).map(([x,y,z])=>[x,y,z-.025,.016]),13);
    }
  }
}

function naga(k,parts,id,mobile){
  const {head,body}=parts;
  const bronze=id==='m117'?'edge':'trim';
  const width=id==='m117'?.29:id==='m124'?.28:.26;
  const eye=id==='m117'?.451:id==='m124'?.395:.401;
  mirrorCrown(k,head,bronze,'deep',.224,.221,width,mobile);
  for(const s of sides){
    const flame=id==='m117'?.28:id==='m124'?.40:.30;
    const jowls=mirror(s,[[.041,-.184,eye+.008,.019,.018],[width*.53,-.133,eye+.027,.055,.043],
      [width*.91,-.085,eye-.029,.052,.039],[width*1.17,-.049,eye-.153,.039,.034],
      [width*1.24,-.065,eye-.261,.005,.005]]);
    raised(k,head,'deep',jowls,mobile,3.1);
    for(let i=0;i<3;i++){
      const x=.104+i*.055,h=-.133-i*.034;
      ridge(k,head,bronze,mirror(s,[[x,h,eye+.013,.021],[x*1.13,h-.051,eye+.065,.026],
        [x*1.23,h-.10,eye+.060,.019],[x*1.19,h-.08-flame*.30,eye+.037,.002]]),9);
    }
    const shoulderY=id==='m117'?.63:1.39;
    for(let i=0;i<(mobile?2:3);i++){
      const y=shoulderY-i*.158,x=.28+i*.037,z=-.435-i*.044;
      const outline=mirror(s,[[.023,y+.058,z],[.133,y+.111,z-.037],[x+.072,y+.061,z-.019],
        [x+.112,y-.038,z+.042],[x*.83,y-.133,z-.016],[.095,y-.116,z-.057],[.022,y-.064,z-.028]]);
      shield(k,body,'body',outline,.036);
      ridge(k,body,i%2?'deep':bronze,outline.slice(1,7).map(([a,b,c])=>[a,b,c-.024,.016]),12);
    }
  }
}

function waterCourt(k,parts,mobile){
  const {head,body}=parts;
  mirrorCrown(k,head,'trim','varunaBlue',.204,.148,.157,mobile);
  for(const s of sides){
    const brow=mirror(s,[[.020,.074,.152,.010,.014],[.071,.095,.180,.023,.025],
      [.118,.082,.147,.024,.018],[.143,.077,.114,.004,.006]]);
    raised(k,head,'varunaSkin',brow,mobile);
    ridge(k,head,'deep',mirror(s,[[.013,-.091,.19,.012],[.059,-.104,.19,.018],[.108,-.128,.155,.019],
      [.141,-.156,.116,.004]]),10);
    const rider=head.parent;
    const scale=mirror(s,[[.027,.875,-.156],[.126,.906,-.235],[.213,.815,-.237],[.219,.704,-.217],
      [.118,.623,-.258],[.026,.643,-.218]]);
    shield(k,rider,'varunaBlue',scale,.044);
    ridge(k,rider,'trim',scale.map(([x,y,z])=>[x,y,z-.029,.014]),13);
    for(let i=0;i<3;i++){
      const x=.16+i*.17,z=-.99+i*.075;
      ridge(k,body,'varunaRed',mirror(s,[[x,.192,z,.022],[x*1.17,.179,z-.034,.034],
        [x*1.30,.127,z-.079,.028],[x*1.43,.063,z-.087,.003]]),9);
    }
  }
}

function shadowVeil(k,parts,mobile){
  const {head,body}=parts;
  mirrorCrown(k,head,'rind','deep',.273,.177,.214,mobile);
  for(const side of sides){
    const brow=mirror(side,[[.019,.094,.232,.010,.008],[.076,.123,.256,.043,.023],
      [.149,.144,.20,.050,.029],[.217,.098,.123,.033,.023],[.231,.049,.048,.004,.005]]);
    raised(k,head,'rind',brow,mobile);
    ridge(k,head,'glow',mirror(side,[[.073,.078,.260,.006],[.119,.087,.249,.012],[.156,.100,.217,.003]]),8);
    ridge(k,head,'deep',mirror(side,[[.028,-.08,.237,.012],[.060,-.124,.26,.026],[.128,-.161,.221,.032],
      [.189,-.205,.148,.009]]),11);
    for(let i=0;i<(mobile?2:4);i++){
      const y=.79-i*.116,z=-.52-i*.075;
      const spike=mirror(side,[[.019,y+.088,z],[.100,y+.121,z-.078],[.199,y+.068,z-.150],
        [.259,y-.03,z-.157],[.178,y-.141,z-.121],[.073,y-.105,z-.029]]);
      shield(k,body,i%2?'rind':'deep',spike,.037);
      ridge(k,body,'rind',spike.map(([x,y,z])=>[x,y,z-.027,.014]),10);
    }
  }
}

function crackedShell(k,parts,mobile){
  const {head,body}=parts;
  for(const side of sides){
    const s=x=>side*x;
    const x=side<0?-.250:.249,Z=side<0?.61:.62;
    const cuts=[[x-.071,-.161,Z+.02],[x-.032,-.141,Z+.034],[x,-.151,Z+.045],[x+.042,-.145,Z+.038],
      [x+.069,-.177,Z+.014],[x+.016,-.188,Z+.022],[x-.035,-.197,Z+.022]];
    shield(k,head,'deep',cuts,.028);
    ridge(k,head,'glow',[[x-.030,-.176,Z+.04,.004],[x+.008,-.174,Z+.05,.012],
      [x+.038,-.161,Z+.038,.004]],8);
    for(let i=0;i<(mobile?3:4);i++){
      const t=i*.13,y=.61-i*.117;
      const seam=mirror(side,[[.11+t*.3,y+.072,-.50],[.22+t*.4,y+.083,-.637],[.34+t*.5,y-.055,-.75],
        [.44+t*.3,y-.157,-.643],[.42+t*.44,y-.212,-.592],[.16+t*.45,y-.120,-.489]]);
      shield(k,body,'shellScar',seam,.035);
      ridge(k,body,'shellIvory',seam.slice(1,6).map(([x,y,z])=>[x,y+.025,z-.025,.017]));
      bead(k,body,'redBinding',s(.34+t*.5),y-.055,-.792,.025);
    }
  }
}

function strawSeal(k,parts,mobile){
  const {head,body}=parts;
  for(const side of sides){
    const x=v=>v*side;
    const eye=mirror(side,[[.019,.049,.232],[.071,.075,.253],[.150,.12,.229],[.167,.052,.204],
      [.112,.001,.232],[.054,.006,.242]]);
    shield(k,head,'deep',eye,.026);
    ridge(k,head,'glow',mirror(side,[[.039,.036,.257,.004],[.083,.044,.273,.010],[.117,.055,.264,.005]]),9);
    const bone=mirror(side,[[.059,.113,.261,.015,.012],[.104,.160,.230,.052,.029],[.176,.192,.159,.061,.037],
      [.229,.214,.058,.047,.026],[.242,.181,-.09,.008,.006]]);
    raised(k,head,'rind',bone,mobile,2.72);
    for(let i=0;i<4;i++){
      const a=.07+i*.029,h=-.100-i*.009;
      ridge(k,head,'deep',mirror(side,[[a,h,.250,.009],[a*.99,h-.032,.263,.013],[a*.91,h-.065,.254,.008],
        [a*.89,h-.089,.238,.002]]),7);
    }
    const cage=mirror(side,[[.012,.546,-.731,.022],[.123,.482,-.776,.045],[.237,.402,-.829,.065],
      [.296,.316,-.842,.049],[.312,.21,-.838,.015],[.28,.093,-.860,.002]]);
    ridge(k,body,'deep',cage,16);
    ridge(k,body,'trim',cage.map(([a,b,c,r])=>[a+x(.018),b+.019,c-.024,r*.30]),13);
  }
}

const specials={
  m114:{light:[0xe8cb9c,'sigils',[0,.52,0],[1.13,.94,.50]],run:(k,p,m)=>twinReliquary(k,p,false,m)},
  m115:{light:[0xf18273,'ribbons',[0,.53,0],[1.19,1.05,.52]],run:(k,p,m)=>twinReliquary(k,p,true,m)},
  m117:{light:[0xffb86c,'bolts',[0,.46,.04],[.93,1.18,.58]],run:(k,p,m)=>naga(k,p,'m117',m)},
  m122:{light:[0x8edae5,'ribbons',[0,.46,.12],[1.03,.57,1.06]],run:waterCourt},
  m124:{light:[0xfac765,'bolts',[0,.94,.06],[1.11,1.36,.71]],run:(k,p,m)=>naga(k,p,'m124',m)},
  m125:{light:[0xeacf91,'sigils',[0,.90,.1],[1.04,1.31,.64]],run:(k,p,m)=>naga(k,p,'m125',m)},
  m153:{light:[0xb896fb,'mist',[0,.52,.06],[.83,.95,.61]],run:shadowVeil},
  m155:{light:[0xffbf74,'embers',[0,.27,.08],[.83,.71,.70]],run:crackedShell},
  m156:{light:[0xfa9152,'embers',[0,.14,.01],[.80,.89,.65]],run:strawSeal},
};

const riders={
  'trial-jing-light':[0xf5c479,'sigils',[0,.33,.01],[.85,.68,.98],.20,.11,.223],
  'trial-jing-dark':[0xdf82c0,'ribbons',[0,.48,.06],[.94,.71,.97],.22,.08,.237],
  'trial-shang-light':[0x9cdcf8,'bolts',[0,.42,.10],[.94,.76,1.11],.195,.16,.218],
  'trial-shang-dark':[0xc6a2fd,'mist',[0,.39,0],[1.10,.82,1.23],.24,.09,.235],
  'trial-kai-light':[0xb8dd99,'ribbons',[0,.49,.05],[.94,.77,1.12],.213,.17,.253],
  'trial-kai-dark':[0x9f9ce8,'sigils',[0,.36,-.04],[.91,.68,1.09],.24,.13,.256],
};
function trialIdentity(k,parts,[tint,shape,offset,span,width,rise,face],mobile){
  const {mount:{knight,helm},body}=parts;
  mirrorCrown(k,helm,'trim','body',rise,.176,width,mobile);
  for(const s of sides){
    const faceJoin=mirror(s,[[.035,.091,face],[.097,.127,face+.018],[.173,.129,face-.022],
      [width*1.12,.072,face-.092],[width*1.02,-.069,face-.104],[.089,-.116,face+.003],[.048,-.06,face+.024]]);
    shield(k,helm,'deep',faceJoin,.042);
    ridge(k,helm,'edge',faceJoin.slice(0,5).map(([x,y,z])=>[x,y+.018,z+.022,.015]),11);
    ridge(k,helm,'glow',mirror(s,[[.059,.064,face+.032,.007],[.105,.075,face+.035,.010],
      [.147,.077,face+.012,.004]]),9);
    for(let i=0;i<(mobile?2:3);i++){
      const y=.69-i*.145,z=-.29-i*.06;
      const rim=mirror(s,[[.027,y+.068,z],[.133,y+.098,z-.042],[.234,y+.072,z-.035],
        [.268,y-.038,z+.029],[.187,y-.108,z-.015],[.027,y-.071,z-.055]]);
      shield(k,knight,i%2?'edge':'body',rim,.036);
      ridge(k,knight,'trim',rim.slice(1,6).map(([x,y,z])=>[x,y+.009,z-.027,.015]));
    }
  }
  affect(parts,[tint,shape,offset,span],body);
}

export function polishBossC(k,parts,entry,mobile){
  const id=entry.id;
  const regal=court[id],beast=beasts[id],special=specials[id],rider=riders[id];
  if(regal){
    courtIdentity(k,parts,regal,mobile);
    affect(parts,regal.light);
  }else if(beast){
    wildIdentity(k,parts,beast,mobile);
    affect(parts,beast.light);
  }else if(special){
    special.run(k,parts,mobile);
    affect(parts,special.light);
  }else if(rider)trialIdentity(k,parts,rider,mobile);
  else return false;
  return true;
}
