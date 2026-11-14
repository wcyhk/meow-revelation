
const sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...point])=>[x*s,...point]);
const plate=(k,j,m,path,depth=.035)=>k.sculpt.plate(j,m,path,depth,depth*.34);
const sweep=(k,j,m,path,sides=7,steps=10)=>k.sculpt.sweep(j,m,path,{sides,steps,ridge:.16});
const gem=(k,j,m,x,y,z,a,b=a,c=a)=>k.mesh(j,'gem',m,x,y,z,a,b,c);

// Folded relief follows the spine instead of adding floating flat decals.
function shell(k,j,{x=0,y,z,w,h,mode='plate',face=-1,mobile}){
  const depth=face*.074;
  const rows=mobile?3:4;
  for(let i=0;i<rows;i++){
    const Y=y-i*h/rows,Z=z+depth*(1-i*.13),width=w*(1-i*.13);
    for(const side of sides){
      const p=mirror(side,[[.028,Y+.09,Z],[width*.50,Y+.128,Z+depth*.91],[width,Y+.014,Z+depth*.43],
        [width*.91,Y-.133,Z-depth*.40],[width*.48,Y-.184,Z+depth*.49],[.029,Y-.133,Z+depth*1.23]]);
      plate(k,j,mode==='skin'?(i%2?'deep':'body'):i%2?'body':'edge',p,.037);
      sweep(k,j,mode==='bone'?'edge':'trim',p.slice(1,5).map(q=>[q[0],q[1],q[2]+face*.026,.013]),5,7);
      if(mode==='plate')gem(k,j,'trim',x+side*width*.80,Y-.07,Z+depth*.69,.029,.039,.027);
    }
    if(mode==='bone')sweep(k,j,i%2?'edge':'body',[[x,Y+.063,Z,.043],[x,Y-.035,Z+depth*.89,.053],
      [x,Y-.148,Z+depth*1.45,.028]],7,8);
  }
}

function straps(k,j,{x=0,y,z,w,h,r=.024,material='trim',back=-1}){
  for(const side of sides){
    const one=side*w;
    sweep(k,j,material,[[x+one*.38,y,z,.020],[x+one,y-h*.28,z+back*.082,r],
      [x+one*.88,y-h*.72,z+back*.13,r],[x+one*.27,y-h,z+back*.064,.012]],7,10);
    gem(k,j,'edge',x+one*.94,y-h*.68,z+back*.119,.039,.047,.028);
  }
}

function crooked(k,j,finish,x,y,z,size,side){
  sweep(k,j,finish,[[x,y,z,.038*size],[x+side*.14*size,y+.10*size,z-.07*size,.051*size],
    [x+side*.23*size,y+.26*size,z-.15*size,.031*size],[x+side*.17*size,y+.42*size,z-.20*size,.005]]);
}

function relicCase(k,j,{x=0,y,z,w,h,face=-1,trim='trim',body='deep',mark='glow'}){
  const fit=path=>path.map(([u,v,d])=>[x+u*w,y+v*h,z+d*face]);
  const rim=fit([[-.63,.79,0],[.49,.91,0],[.92,.49,.02],[.87,-.66,.04],[.11,-1,.05],[-.81,-.73,.04],[-.97,.36,.02]]);
  plate(k,j,body,rim,.064);
  sweep(k,j,trim,[...rim,rim[0]].map(([X,Y,Z])=>[X,Y,Z+face*.052,.024]),6,17);
  for(let i=0;i<3;i++){
    const Y=.34-i*.31;
    sweep(k,j,i===1?mark:trim,fit([[-.57,Y,.076],[.0,Y+.08,.098],[.60,Y-.031,.083]])
      .map(q=>[...q,.011]),5,7);
  }
}

function gills(k,j,{x,y,z,w,h,n=4,glass=false}){
  for(const side of sides)for(let i=0;i<n;i++){
    const Z=z-i*.124,Y=y+Math.sin(i*.62)*.068;
    const p=mirror(side,[[x*.63,Y+.068,Z+.052],[x+w*.49,Y+.03,Z+.06],[x+w,Y-.066,Z+.028],
      [x+w*.84,Y-h,Z-.12],[x+w*.19,Y-h*.67,Z-.065]]);
    plate(k,j,i%2?'edge':'body',p,.027);
    sweep(k,j,glass?'glow':'deep',p.slice(1,4).map(q=>[q[0]+side*.016,q[1]-.009,q[2]-.024,.011]),5,6);
  }
}

function shingle(k,j,x,y,z,w,len,finish='edge'){
  const tip= z-len;
  plate(k,j,finish,[[x,y+.08,z+.063],[x+w*.98,y-.037,z+.043],[x+w*.69,y-.064,tip+.079],
    [x,y-.14,tip],[x-w*.69,y-.063,tip+.078],[x-w*.98,y-.033,z+.036]],.041);
  sweep(k,j,'trim',[[x,y+.099,z+.032,.018],[x,y+.046,z-len*.41,.017],[x,y-.116,tip,.004]],5,8);
}

function wingside(k,model,width,drop){
  for(const wing of model.flight??[]){
    const {root,side}=wing;
    for(let i=0;i<3;i++){
      const x=.13+i*.131;
      sweep(k,root,i===0?'edge':'trim',mirror(side,[[x,.03-i*.012,-.10,.013],
        [x+width*.65,.083-i*.026,-.18-i*.045,.018],
        [x+width,-drop-i*.036,-.29-i*.063,.004]]),5,9);
    }
  }
}

function fittings(k,body,w,y,z){
  for(const s of sides){
    const ring=k.bone(body,s*w,y,z);
    k.mesh(ring,'chain','trim',0,0,0,.095,.137,.61,.34,s*.44);
    k.mesh(ring,'gem','edge',0,-.094,-.018,.041,.051,.027);
  }
}

// The original campaign bosses keep the silhouettes of their existing key art.
const guardianDetails=[
  (k,m)=>{wingside(k,m,.31,.16);gills(k,m.body,{x:.18,y:.39,z:.01,w:.23,h:.28,n:4});},
  (k,m)=>{straps(k,m.body,{y:.72,z:-.31,w:.36,h:.54,material:'edge'});fittings(k,m.body,.275,.18,-.41);},
  (k,m)=>{relicCase(k,m.body,{x:.24,y:.37,z:-.37,w:.14,h:.33,mark:'edge'});fittings(k,m.body,.29,.57,-.38);},
  (k,m,v)=>{shell(k,m.body,{y:.61,z:-.48,w:.55,h:.68,mobile:v});gills(k,m.body,{x:.40,y:.37,z:.33,w:.22,h:.24});},
  (k,m)=>{gills(k,m.body,{x:.43,y:.43,z:-.42,w:.21,h:.30,n:6});fittings(k,m.body,.42,.60,-.82);},
  (k,m)=>{for(let i=0;i<5;i++)shingle(k,m.body,0,.79-i*.057,-.21-i*.144,.184+i*.014,.29,'trim');},
  (k,m)=>{relicCase(k,m.campaign.neck??m.body,{y:.46,z:-.18,w:.20,h:.37,mark:'edge'});gills(k,m.head,{x:.126,y:.17,z:.011,w:.143,h:.23,n:3});},
  (k,m)=>{for(let i=0;i<5;i++)crooked(k,m.body,i%3?'body':'edge',Math.sin(i)*.14,.40,-.55+i*.229,.67,i%2?1:-1);},
  (k,m)=>{wingside(k,m,.29,.25);relicCase(k,m.body,{y:.13,z:-.36,w:.275,h:.39,body:'body'});},
  (k,m)=>{straps(k,m.body,{y:.755,z:-.39,w:.45,h:.82});fittings(k,m.body,.41,.47,-.49);},
  (k,m)=>{gills(k,m.body,{x:.37,y:.43,z:.23,w:.20,h:.30,n:5});fittings(k,m.body,.35,.34,-.42);},
  (k,m)=>{gills(k,m.head,{x:.139,y:.145,z:.15,w:.12,h:.182,n:4,glass:true});fittings(k,m.campaign.neck??m.body,.209,.35,-.377);},
  (k,m,v)=>{shell(k,m.body,{y:.55,z:-.473,w:.47,h:.62,mobile:v});fittings(k,m.body,.44,.23,-.326);},
  (k,m)=>{gills(k,m.body,{x:.38,y:.39,z:.2,w:.22,h:.34,n:5,glass:true});for(const s of sides)crooked(k,m.head,'trim',s*.19,.183,-.18,.78,s);},
  (k,m)=>{wingside(k,m,.42,.21);for(let i=0;i<3;i++)shingle(k,m.body,(i-1)*.152,.38,-.28,.14,.59,'edge');},
  (k,m)=>{relicCase(k,m.body,{y:.44,z:-.49,w:.33,h:.39,trim:'edge'});straps(k,m.body,{y:.64,z:-.48,w:.46,h:.71});},
  (k,m)=>{relicCase(k,m.body,{x:.175,y:.35,z:-.42,w:.235,h:.48,trim:'edge'});fittings(k,m.body,.39,.501,-.43);},
  (k,m)=>{wingside(k,m,.51,.17);for(let i=0;i<5;i++)crooked(k,m.body,'body',Math.sin(i)*.16,.07-i*.075,-.39,.64,i%2?1:-1);},
  (k,m)=>{wingside(k,m,.48,.26);gills(k,m.body,{x:.19,y:.32,z:.045,w:.22,h:.24,n:4,glass:true});},
  (k,m,v)=>{shell(k,m.body,{y:.67,z:-.465,w:.51,h:.66,mobile:v});fittings(k,m.body,.46,.43,-.49);},
];

export function detailForestGuardian(k,model,id,mobile){
  guardianDetails[Number(id.slice(7))](k,model,mobile);
}

const twinMarks={
  '青喪骨皇':{name:'roots',depth:.44,breadth:.35},
  '照屍孿影':{name:'eyes',depth:.30,breadth:.42},
  '斷燈孿王':{name:'coffin',depth:.88,breadth:.31},
};

export function detailBossVariant(k,model,entry,weapon,mobile){
  const {body,head}=model;
  const twin=twinMarks[entry.id];
  if(twin?.name==='roots'){
    for(const side of sides)for(let i=0;i<5;i++){
      crooked(k,body,i%2?'edge':'trim',side*(.18+i*.051),.31,-.81+i*.26,.69+i*.12,side);
    }
    relicCase(k,head,{y:.18,z:-.22,w:.17,h:.23,body:'body',mark:'glow'});
    return;
  }
  if(twin?.name==='eyes'){
    for(let i=0;i<7;i++){
      const angle=i*2.399,x=Math.sin(angle)*.43,z=Math.cos(angle)*.33;
      const eye=k.bone(body,x,.30-i*.116,z);
      eye.rotation.y=angle;
      plate(k,eye,'body',[[-.13,.029,.02],[0,.112,.062],[.13,.027,.021],[0,-.083,.043]],.035);
      gem(k,eye,'glow',0,.026,.072,.039,.022,.022);
    }
    return;
  }
  if(twin?.name==='coffin'){
    relicCase(k,body,{y:.52,z:-twin.depth,w:twin.breadth,h:.51,trim:'edge'});
    for(const side of sides)for(let i=0;i<4;i++)k.mesh(body,'chain','trim',side*.272,.742-i*.243,-.982,
      .089,.143,.83,0,i*.73,side*.16);
    return;
  }
  if(!weapon)return;
  const seed=weapon.sigil??0;
  const width=.18+seed%7*.019, span=.25+seed%5*.034;
  const reliquary=k.bone(body,0,.28,model.back?-.45:-.318);
  const prongs=mobile?3:5;
  const long=['pierce','beam','line','volley'].includes(weapon.spell?.action);
  const front=k.bone(body,0,.362,model.back?.366:.341);
  relicCase(k,front,{y:0,z:.019,w:width*.63,h:span*.60,face:1,body:'body'});
  for(const side of sides)for(let i=0;i<prongs;i++){
    const u=i/(prongs-1),x=width*(.48+u*.91),y=span*(.63-u*.94);
    const height=long?.41+.18*u:.25+Math.sin(u*3.14)*.16;
    sweep(k,reliquary,i%2?'edge':'trim',mirror(side,[[x*.20,y,.006,.026],
      [x,y+.065,-.096,.035],[x*1.28,y+height*.51,-.147,.027],
      [x*(1.28+(seed%5)*.074),y+height,-.238,.006]]),6,11);
    if(i%2===0)gem(k,reliquary,'glow',side*x*.80,y+.102,-.172,.031,.073,.039);
  }
  const previous=model.cataloguePose;
  model.cataloguePose=state=>{
    previous?.(state);
    const {beat,wind,strike,stage}=state;
    reliquary.rotation.y=Math.sin(beat*.49)*(.07+stage*.12);
    reliquary.rotation.x=wind*-.28+strike*.21;
    reliquary.scale.set(1+stage*.18+wind*.13,1+stage*.24,1);
  };
}
