import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const finish=(k,name,fallback)=>k.materials[name]?name:fallback;
const mirror=(sign,path)=>path.map(([x,...rest])=>[x*sign,...rest]);
const band=(k,j,m,points,mobile,steps=12)=>k.sculpt.sweep(j,m,points,{
  sides:mobile?6:8,steps:mobile?Math.max(6,steps-3):steps,ridge:.17,
});
const plate=(k,j,m,path,depth=.035)=>k.sculpt.plate(j,m,path,depth,depth*.30);
const gem=(k,j,m,x,y,z,r=.022)=>k.mesh(j,'gem',m,x,y,z,r,r*.84,r*.80);

// [shape, frame, inset, width, height, center Y, front Z, back Z, crown spread, flank angle]
const garments={
  m004:['pinion','steel','cobalt',.30,.24,.47,.217,-.29,.28,.39],
  m006:['cord','ochre','dusk',.33,.28,.43,.285,-.27,.22,.35],
  m008:['lotus','brass','brocade',.31,.24,.51,.259,-.26,.22,.43],
  m009:['roots','jade','ochre',.27,.31,.49,.247,-.31,.38,.58],
  m010:['fan','steel','jade',.36,.29,.41,.279,-.28,.27,.48],
  m011:['ribs','brass','red',.38,.20,.42,.335,-.28,.23,.36],
  m012:['ripple','steel','dusk',.29,.28,.48,.305,-.27,.235,.50],
  m013:['fork','brass','cobalt',.30,.24,.49,.27,-.27,.225,.62],
  m016:['pinion','rind','brocade',.36,.36,.48,.299,-.32,.29,.37],
  m017:['fork','rind','crest',.31,.26,.46,.295,-.32,.27,.55],
  m018:['ribs','brass','black',.34,.34,.47,.333,-.30,.34,.43],
  m019:['ripple','ivory','cobalt',.26,.24,.38,.269,-.265,.25,.55],
  m020:['pinion','steel','dusk',.375,.31,.46,.329,-.30,.31,.47],
  m021:['lotus','rind','porcelain',.28,.24,.49,.260,-.30,.24,.5],
  m023:['cord','brass','black',.43,.23,.50,.309,-.29,.29,.42],
  m027:['ribs','rust','coal',.56,.29,.49,.375,-.405,.44,.53],
  m028:['fan','ochre','teal',.29,.26,.49,.249,-.29,.26,.54],
  m029:['cord','ochre','steel',.28,.26,.43,.209,-.28,.22,.51],
  m031:['fork','brass','red',.34,.28,.49,.319,-.29,.27,.49],
  m032:['lotus','steel','cobalt',.27,.28,.50,.273,-.25,.25,.43],
  m033:['pinion','brass','red',.28,.18,.53,.265,-.242,.28,.54],
  m034:['ripple','ivory','cobalt',.32,.21,.474,.254,-.279,.29,.52],
  m035:['ribs','ochre','clay',.34,.24,.52,.334,-.31,.27,.49],
  m036:['ripple','steel','cobalt',.36,.23,.51,.347,-.31,.30,.47],
  m037:['roots','jade','moss',.38,.22,.478,.324,-.34,.29,.50],
  m038:['fork','brass','ochre',.33,.255,.515,.329,-.319,.33,.54],
  m039:['fan','brass','cobalt',.34,.235,.45,.265,-.315,.31,.67],
  m040:['lotus','ochre','jade',.25,.22,.47,.269,-.30,.23,.37],
  m041:['roots','steel','jade',.31,.24,.45,.29,-.29,.30,.51],
  m042:['pinion','ochre','steel',.27,.23,.42,.259,-.27,.24,.58],
  m043:['fork','brass','black',.54,.26,.42,.393,-.36,.32,.62],
  m044:['ripple','steel','cobalt',.51,.26,.40,.41,-.37,.31,.58],
  m045:['roots','jade','moss',.54,.24,.45,.404,-.40,.38,.63],
  m046:['ribs','brass','clay',.48,.22,.44,.41,-.36,.32,.45],
  m047:['fork','brass','black',.57,.31,.38,.406,-.41,.39,.50],
  m048:['fan','steel','cobalt',.53,.30,.41,.404,-.39,.36,.61],
  m049:['roots','jade','moss',.53,.27,.43,.405,-.40,.38,.56],
  m050:['ribs','ironRim','clay',.55,.29,.37,.413,-.40,.36,.55],
  m051:['cord','brass','red',.31,.36,.49,.289,-.291,.23,.40],
  m056:['roots','ivory','jade',.29,.27,.47,.272,-.27,.28,.68],
  m059:['lotus','rim','red',.30,.29,.47,.316,-.285,.31,.55],
  m060:['ripple','patina','silk',.28,.235,.47,.290,-.29,.28,.53],
  m061:['roots','jade','silk',.26,.285,.46,.315,-.28,.26,.51],
  m062:['cord','patina','leather',.25,.23,.46,.30,-.277,.235,.36],
  m063:['pinion','iron','trim',.33,.25,.492,.307,-.28,.32,.46],
  m064:['ripple','iron','patina',.32,.27,.466,.309,-.29,.31,.50],
  m065:['roots','rim','patina',.33,.26,.46,.372,-.29,.32,.54],
  m066:['fork','rim','patina',.34,.25,.471,.317,-.29,.34,.60],
  m067:['ribs','trim','deep',.39,.30,.577,.351,-.32,.33,.50],
  m068:['pinion','trim','rind',.443,.32,.596,.34,-.345,.41,.56],
  m069:['fan','rim','silk',.31,.27,.46,.313,-.285,.29,.57],
  m070:['ribs','trim','patina',.40,.25,.471,.345,-.31,.28,.46],
  m071:['ripple','rim','silk',.26,.31,.446,.302,-.27,.235,.51],
  m072:['fork','trim','leather',.27,.25,.478,.318,-.28,.26,.59],
  m073:['lotus','rim','red',.30,.31,.466,.318,-.298,.27,.51],
  m074:['cord','rim','patina',.25,.21,.48,.282,-.27,.23,.44],
  m075:['pinion','rim','silk',.42,.25,.48,.309,-.338,.31,.39],
  m076:['fork','trim','patina',.36,.29,.478,.346,-.334,.32,.63],
  m077:['ripple','rim','silk',.26,.29,.44,.32,-.29,.25,.59],
  m078:['roots','rim','patina',.39,.23,.470,.322,-.307,.36,.47],
  m079:['fan','patina','silk',.28,.27,.47,.32,-.302,.35,.59],
  m080:['ripple','patina','silk',.36,.27,.45,.317,-.309,.29,.56],
};

// Profile starts and ends at the central stay. Side reliefs meet it at rest.
const shapes={
  pinion:[[.07,-.25],[.36,-.28],[.68,-.13],[.90,.126],[1,.40],[.63,.31],[.27,.17],[.077,.094]],
  cord:[[.1,-.30],[.35,-.26],[.61,-.25],[.8,-.05],[.98,.20],[.78,.36],[.36,.28],[.12,.08]],
  lotus:[[.065,-.29],[.38,-.36],[.65,-.25],[.87,.022],[.95,.30],[.64,.18],[.36,.435],[.09,.15]],
  roots:[[.08,-.38],[.40,-.302],[.59,-.095],[.885,-.146],[1,.27],[.70,.183],[.51,.45],[.12,.224]],
  fan:[[.065,-.29],[.31,-.19],[.63,-.15],[.91,.061],[.98,.43],[.69,.37],[.44,.21],[.093,.08]],
  ribs:[[.075,-.26],[.34,-.46],[.72,-.32],[.98,-.08],[.93,.29],[.65,.36],[.36,.20],[.10,.10]],
  ripple:[[.06,-.34],[.33,-.39],[.59,-.355],[.86,-.17],[.99,.165],[.84,.42],[.47,.33],[.09,.13]],
  fork:[[.08,-.36],[.346,-.24],[.65,-.22],[.96,.10],[.99,.43],[.63,.20],[.48,.39],[.094,.12]],
};

function baseTorso(parts,entry){
  const {head,body}=parts;
  return ['m004','m029','m042','m074'].includes(entry.id)?head?.parent??body:body;
}

function amberRivet(k,j,m,x,y,z,s){
  gem(k,j,'deep',x,y,z,s*1.35);
  gem(k,j,m,x,y,z+s*.47,s*.83);
}

function twistedCord(k,j,trim,shape,mobile){
  for(const sign of sides){
    band(k,j,'deep',shape.map(([x,y,z,r])=>[x+sign*.011,y,z,r*1.24]),mobile);
    band(k,j,trim,shape.map(([x,y,z,r],i)=>[x+sign*.009*Math.cos(i),y,z+.014,r*.51]),mobile);
  }
}

function embossedSurface(k,part,material,path,depth,mobile){
  const center=new T.Vector3();
  for(const point of path)center.add(new T.Vector3(...point));
  center.divideScalar(path.length);
  const reverse=T.ShapeUtils.isClockWise(path.map(([x,y])=>new T.Vector2(x,y)));
  const position=[],uv=[],index=[],color=[];
  const rings=mobile?4:7,stride=path.length;
  for(let row=0;row<rings;row++){
    const r=1-row/rings;
    for(const [i,[x,y,z]] of path.entries()){
      const wear=Math.sin(i*3.784+row*.67)*.005;
      const dz=Math.sin(Math.PI*.5*(1-r))*depth+Math.sin(i*2.8)*Math.sin(Math.PI*r)*depth*.135;
      position.push(T.MathUtils.lerp(center.x,x,r),T.MathUtils.lerp(center.y,y,r),T.MathUtils.lerp(center.z,z,r)+dz);
      const phi=i*Math.PI*2/stride;
      uv.push(.5+Math.cos(phi)*r*.5,.5+Math.sin(phi)*r*.5);
      const stain=.78+Math.sin(i*2.46+row*.61)*.10+wear*3;
      color.push(stain,stain*.98,stain*.93);
      if(row===rings-1)continue;
      const a=row*stride+i,b=row*stride+(i+1)%stride,c=a+stride,d=b+stride;
      if(reverse)index.push(a,c,b,c,d,b);
      else index.push(a,b,c,c,b,d);
    }
  }
  const apex=position.length/3;
  position.push(center.x,center.y,center.z+depth);
  uv.push(.5,.5);
  color.push(.87,.85,.82);
  for(let i=0;i<stride;i++){
    const a=(rings-1)*stride+i,b=(rings-1)*stride+(i+1)%stride;
    if(reverse)index.push(a,apex,b);
    else index.push(a,b,apex);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  k.geometry(part,material,geometry);
}

function stampedFront(k,part,model,mobile){
  const [kind,outerName,innerName,width,height,top,depth]=model;
  const outline=shapes[kind];
  const metal=finish(k,outerName,'trim'),inset=finish(k,innerName,'body');
  // Mount the two curves along the body, with the opening following the breathing axis.
  for(const sign of sides){
    const relief=mirror(sign,outline.map(([x,y])=>[x*width,top+y*height,depth-.136*x*x-x*.027]));
    const bevel=relief.map(([x,y,z])=>[x*.972,top+(y-top)*.94,z+.026]);
    const garnet=bevel.map(([x,y,z])=>[x*.88+sign*.012,top+(y-top)*.76,z+.014]);
    plate(k,part,'deep',relief,.035);
    plate(k,part,metal,bevel,.033);
    embossedSurface(k,part,inset,garnet,kind==='ribs'?.057:kind==='lotus'?.044:.035,mobile);
    const n=kind==='ribs'?3:kind==='lotus'||kind==='fan'?3:2;
    for(let i=0;i<n;i++){
      const t=i/3;
      const ridge=mirror(sign,[[width*(.27-t*.12),top-height*(.23-t*.20),depth+.055,.010],
        [width*(.44-t*.068),top-height*(.135-t*.19),depth+.060,.017],
        [width*(.654-t*.125),top+height*(.02+t*.21),depth+.039-t*.009,.014],
        [width*(.84-t*.083),top+height*(.22+t*.1),depth-.044+t*.026,.002]]);
      band(k,part,kind==='cord'?'deep':metal,ridge,mobile);
      const [x,y,z]=ridge[2];
      if(kind==='ribs'||kind==='cord'||kind==='fork')amberRivet(k,part,'edge',x*1.11,y-.035,z-.004,.012);
    }
    if(kind==='cord')twistedCord(k,part,metal,mirror(sign,[[width*.09,top+.08,depth+.037,.029],
      [width*.37,top+.028,depth+.068,.028],[width*.67,top-.033,depth+.019,.030],
      [width*.98,top-.069,depth-.084,.011]]),mobile);
  }
}

function attachRear(k,head,torso,entry,model,mobile){
  const [kind,outerName,innerName,w,height,top,,depth,span,angle]=model;
  const trim=finish(k,outerName,'trim');
  const shell=finish(k,innerName,'body');
  const collar=entry.id==='m027'?.82:.72;
  const topRear=Math.min(top+.145,(head?.position.y??.92)*collar);
  const arch=topRear+.13;
  for(const side of sides){
    const rear=mirror(side,[[.036,arch,depth+.049],[w*.48,arch+.043,depth+.014],
      [w*.91,arch-.045,depth-.009],[w*.855,topRear-.090,depth-.068],
      [w*.59,topRear-height*.61,depth-.055],[w*.16,topRear-height*.28,depth-.083]]);
    plate(k,torso,shell,rear,.032);
    band(k,torso,trim,rear.slice(0,5).map(([x,y,z],i)=>[x,y,z-.025,[.010,.017,.019,.016,.002][i]]),mobile);
    const length=kind==='lotus'||kind==='cord'?.128:.18;
    const fitted=mirror(side,[[w*.153,topRear+.064,depth-.061,.013],
      [w*.39,topRear+.025,depth-.101,.028],[w*.66,topRear-.041,depth-.119,.036],
      [w*.80,topRear-length,depth-.087,.006]]);
    band(k,torso,trim,fitted,mobile);
    if(!head)continue;
    const anchor=.09+span*.25;
    const y=entry.id==='m033'?.210:entry.id==='m031'?.23:entry.id==='m068'?.30:.186;
    const axis=-.12-angle*.17;
    const contour=mirror(side,[[anchor,y-.14,-.112],[anchor*.855,y-.056,-.181],
      [span*.95,y+.039,axis-.106],[span*(1+angle*.08),y-.023,axis-.184],
      [span*.86,y-.12,axis-.202],[anchor*.95,y-.165,axis-.088]]);
    plate(k,head,shell,contour,.020);
    band(k,head,trim,contour.slice(1,5).map(([x,y,z],i)=>[x,y+.012,z-.007,[.008,.015,.014,.002][i]]),mobile);
    gem(k,head,'edge',side*span*.80,y-.045,axis-.135,.014);
  }
}

function volume(k,parent,m,points,mobile,seed,{section=2.2,detail=15}={}){
  k.geometry(parent,m,sculptVolume(points,{seed,section,ridge:.22,
    sides:mobile?9:13,rings:mobile?detail-3:detail+3}));
}

function oni(k,parts,mobile){
  const {body,head}=parts;
  const hingeParts=[];
  // Deep sternum and skin folds connect the neck to the broad shoulder blocks.
  k.materials.teal.color.setHex(0x365959);
  k.materials.teal.metalness=.04;
  k.materials.teal.roughness=.67;
  for(const side of sides){
    volume(k,body,'teal',mirror(side,[[.032,.390,.266,.034,.023],[.125,.465,.285,.116,.051],
      [.246,.472,.270,.121,.066],[.369,.430,.215,.109,.055],[.464,.370,.109,.048,.029]]),mobile,side,{section:2.59});
    volume(k,body,'teal',mirror(side,[[.318,-.087,.202,.043,.032],[.398,.015,.199,.067,.037],
      [.405,.129,.221,.091,.049],[.428,.245,.18,.090,.039],[.491,.318,.111,.051,.026]]),mobile,side*3.3);
    band(k,body,'lining',mirror(side,[[.026,.332,.317,.009],[.104,.321,.327,.010],
      [.230,.333,.325,.014],[.344,.362,.288,.013],[.420,.357,.196,.002]]),mobile);
    band(k,body,'ochre',mirror(side,[[.357,-.059,.219,.012],[.422,.048,.229,.017],
      [.459,.138,.209,.020],[.524,.260,.137,.006]]),mobile);
    for(let n=0;n<4;n++){
      const t=n/3,ly=.172+t*.13,lx=.22+t*.04;
      band(k,body,'ochre',mirror(side,[[lx,ly-.014,.321,.003],[lx+.017,ly,.327,.007],
        [lx+.031,ly+.01,.323,.005],[lx+.048,ly+.004,.308,.002]]),mobile,8);
    }
    const throat=mirror(side,[[.010,.635,.137,.020],[.085,.583,.182,.049],
      [.176,.549,.213,.063],[.241,.513,.195,.054],[.319,.475,.178,.004]]);
    band(k,body,'teal',throat,mobile);
    band(k,head,'ochre',mirror(side,[[.061,.206,.159,.019],[.137,.213,.108,.035],
      [.196,.192,.047,.043],[.238,.147,-.099,.024],[.193,.121,-.194,.003]]),mobile);
    volume(k,head,'teal',mirror(side,[[.077,-.121,.133,.047,.037],[.152,-.133,.154,.057,.054],
      [.208,-.091,.124,.071,.042],[.215,-.021,.091,.059,.042]]),mobile,side-4);
    const hinge=k.bone(body,side*.436,.374,-.248);
    hinge.name='獨角鬼 · 背後甲鉸';
    hingeParts.push({hinge,side});
    const frame=mirror(side,[[.030,.066,.043],[.083,.103,.022],[.187,.075,-.112],
      [.198,-.044,-.096],[.103,-.109,-.046],[.006,-.089,-.03]]);
    plate(k,hinge,'ochre',frame,.064);
    band(k,hinge,'brass',frame.slice(1,5).map(([x,y,z],i)=>[x,y,z-.028,[.007,.020,.018,.003][i]]),mobile);
    gem(k,hinge,'brass',side*.09,.032,-.065,.024);
  }
  volume(k,head,'ivory',[[0,.176,.159,.084,.046],[-.007,.214,.157,.073,.048],
    [-.023,.296,.137,.061,.037],[-.047,.39,.106,.036,.020],[-.059,.513,.029,.002,.002]],mobile,18,
  {section:2.69,detail:18});
  const original=parts.finishPose;
  parts.finishPose=pose=>{
    original?.(pose);
    const {beat,wind,strike,fall,stagger}=pose;
    for(const {hinge,side} of hingeParts){
      const load=side<0?1:.57;
      hinge.rotation.x=load*(wind*.19-strike*.23)+fall*.12;
      hinge.rotation.z=side*(wind*.15-strike*.17+stagger*.10+Math.sin(beat*.80)*.026);
    }
  };
}

function swordSpirit(k,{head,body},mobile){
  const hair='ivory';
  for(const side of sides){
    const red=mirror(side,[[.045,.140,.202,.018],[.116,.148,.207,.029],[.176,.172,.17,.035],
      [.221,.232,.113,.035],[.235,.31,.034,.028],[.223,.382,-.068,.003]]);
    band(k,head,'red',red,mobile,18);
    band(k,head,'brass',red.map(([x,y,z,r])=>[x+side*.007,y+.004,z+.019,r*.26]),mobile,16);
    band(k,head,'black',mirror(side,[[.044,-.026,.224,.007],[.095,-.044,.254,.010],
      [.141,-.085,.254,.007],[.171,-.113,.220,.003]]),mobile);
    for(let lock=0;lock<(mobile?5:8);lock++){
      const t=lock/(mobile?4:7);
      const a=[.011+t*.135,.295+t*.007,-.058-t*.044];
      const b=[.046+t*.173,.174-t*.021,-.216+t*.068];
      const c=[.076+t*.258,-.155-.27*t,-.25-.087*t];
      k.geometry(head,lock%3?hair:'steel',featherVane(...mirror(side,[a,b,c]),.020+.021*t,11+lock,mobile?9:13));
      band(k,head,lock%2?hair:'steel',mirror(side,[[...a,.006],[...b,.012],[...c,.001]]),mobile,8);
    }
    const breast=mirror(side,[[.031,.653,.256,.008],[.124,.625,.285,.014],
      [.184,.558,.292,.014],[.214,.514,.263,.005]]);
    band(k,body,'steel',breast,mobile,13);
  }
}

// Thickness and dorsal detail fit the source skull/neck placements separately.
// [kind, coat, crest, snout X/Y/Z, spine X/Y/Z, length, count]
const animals={
  m001:['hood','rind','edge',[.19,.060,.191],[.082,.267,-.096],.56,6],
  m002:['hood','body','trim',[.212,.065,.205],[.117,.292,-.111],.64,7],
  m005:['ruff','ivory','ash',[.215,.015,.407],[.340,.742,-.125],.63,6],
  m007:['horn','clay','brass',[.165,.023,.245],[.224,.274,.145],.87,7],
  m014:['ruff','body','edge',[.285,.120,.415],[.294,.658,-.141],.89,8],
  m015:['plume','body','edge',[.231,.072,.201],[.297,.339,-.186],.68,7],
  m022:['shell','black','steel',[.161,.051,.13],[.347,.321,-.178],.59,7],
  m024:['serrated','moss','ochre',[.161,.018,.247],[.214,.245,.174],.71,8],
  m030:['membrane','black','clay',[.153,.034,.151],[.235,.250,-.178],.46,6],
  m052:['ruff','steel','ivory',[.156,-.048,.235],[.25,.337,-.089],.61,6],
  m053:['horn','clay','brass',[.166,-.054,.243],[.267,.322,-.097],.59,6],
  m054:['membrane','cobalt','brass',[.172,-.052,.233],[.238,.353,-.123],.65,7],
  m055:['plume','jade','steel',[.215,.022,.338],[.196,.321,.075],.71,7],
  m057:['shell','patina','rim',[.156,-.051,.251],[.269,.324,-.076],.63,6],
  m058:['serrated','rind','trim',[.162,-.059,.250],[.24,.346,-.060],.68,7],
};

function skullTendons(k,head,profile,mobile){
  const [kind,skin,ridge,[x,y,z]]=profile;
  const stain=finish(k,skin,'body'),edge=finish(k,ridge,'edge');
  for(const side of sides){
    const lines=kind==='ruff'?4:3;
    for(let i=0;i<lines;i++){
      const t=i/(lines-1);
      const y1=y+.071-t*.16,x1=x*(1.05+.09*t),z1=z-.07-t*.029;
      const arc=mirror(side,[[x1*.61,y1-.043,z1+.064,.004],[x1*.82,y1+.007,z1+.044,.012],
        [x1*1.02,y1+.029,z1-.036,.024-(.011*t)],[x1*1.32,y1-.006,z1-.195,.015],
        [x1*1.38,y1-.052,z1-.22,.003]]);
      band(k,head,i===0?edge:stain,arc,mobile,14);
    }
    const fang=kind==='horn'||kind==='serrated'||kind==='hood'||kind==='membrane';
    if(fang){
      const length=kind==='hood'?.14:kind==='serrated'?.13:.095;
      const q=mirror(side,[[x*.55,y-.082,z+.061,.022],[x*.69,y-.116,z+.075,.024],
        [x*.60,y-.123-length*.47,z+.079,.016],[x*.48,y-.104-length,z+.077,.002]]);
      volume(k,head,finish(k,'ivory','edge'),q,mobile,side*14,{section:2.21,detail:12});
    }
  }
}

function dorsalSpines(k,body,profile,mobile){
  const [kind,skin,ridge,,[base,up,forward],length,available]=profile;
  const count=mobile?Math.max(4,available-2):available;
  const coat=finish(k,skin,'body'),edge=finish(k,ridge,'edge');
  for(const side of sides)for(let i=0;i<count;i++){
    const t=i/count,fall=t*length,steps=kind==='ruff'?12:10;
    const x=base*(.89-t*.38),y=up-(t**1.4)*.225,z=forward-fall;
    const height=kind==='serrated'?.25:kind==='shell'?.16:kind==='hood'?.09:.13;
    const poke=kind==='serrated'?.085:.046;
    const a=[x*.78,y-.041,z+.107],b=[x*1.08,y+height*(1-t*.31),z-.008],c=[x*1.18+poke,y+height*.84,z-.14],
      d=[x*.874,y-.013,z-.144],e=[x*.65,y-.044,z-.043];
    if(kind==='ruff'||kind==='plume'){
      k.geometry(body,i%3?coat:edge,featherVane(...mirror(side,[a,b,c]),.064-t*.025,18+i*3,mobile?8:15));
    }else{
      const points=mirror(side,[a,b,c,d,e]);
      plate(k,body,i%3===1?edge:coat,points,.044-.019*t);
    }
    band(k,body,edge,mirror(side,[[...a,.007],[...b,height*.13],[...c,.002]]),mobile,steps);
  }
}

function serpentHood(k,head,evil,mobile){
  const [inner,middle,rim]=evil?['body','rind','trim']:['rind','deep','edge'];
  for(const side of sides){
    const spread=evil?1.14:1;
    const hood=mirror(side,[[.087,-.205,.152],[.216,-.181,.129],[.415,-.231,-.024],
      [.50,-.117,-.120],[.433,.095,-.18],[.31,.177,-.149],[.191,.073,-.014]].map(([x,y,z])=>[x*spread,y,z]));
    plate(k,head,middle,hood,.052);
    embossedSurface(k,head,inner,hood.map(([x,y,z])=>[x*.96,y*.92,z+.034]),.092,mobile);
    band(k,head,rim,hood.slice(2).map(([x,y,z],i)=>[x,y,z+.021,[.007,.023,.026,.019,.004][i]]),mobile,17);
    for(let i=0;i<(mobile?3:5);i++){
      const rise=.03+i*.047,x=(.27+i*.014)*spread;
      band(k,head,i%2?inner:rim,mirror(side,[[.13,.018-rise*.61,.247,.005],[.22*spread,.031-rise*.73,.195,.018],
        [x,.010-rise,.119,.020],[x+.095,.013-rise*.82,-.02,.015],
        [x+.139,-.034-rise*.77,-.095,.002]]),mobile);
    }
    const cheek=mirror(side,[[.105,-.030,.244,.026],[.187,.016,.237,.043],[.242,.064,.157,.054],
      [.265,.13,.071,.033],[.318,.216,-.115,.004]]);
    volume(k,head,evil?'trim':'rind',cheek,mobile,side*3.6,{section:2.46,detail:16});
    band(k,head,'deep',mirror(side,[[.117,.003,.257,.018],[.175,.056,.245,.024],[.225,.041,.206,.019],
      [.235,.018,.175,.004]]),mobile);
    gem(k,head,'glow',side*.181,.045,.262,.025);
    const fang=mirror(side,[[.102,-.061,.31,.035],[.130,-.100,.333,.031],[.133,-.176,.346,.023],
      [.116,-.246,.329,.011],[.103,-.271,.308,.002]]);
    volume(k,head,'edge',fang,mobile,side*4,{section:2.35,detail:13});
    if(!evil)band(k,head,'edge',mirror(side,[[.189,.143,.005,.026],[.262,.226,-.091,.039],
      [.317,.266,-.158,.030],[.327,.279,-.262,.005]]),mobile,16);
  }
}

function bearChest(k,body,head,mobile){
  // Lay angled guard hairs over the main pale fur volume instead of a painted breastplate.
  for(const side of sides){
    for(let row=0;row<4;row++){
      const count=mobile?4:6;
      for(let i=0;i<count;i++){
        const strand=i*2.17+row*1.49+side*.84;
        const t=i/(count-1),curve=.036*Math.sin(strand),curl=Math.cos(strand*1.27)*.021;
        const x=.037+t*(.36+row*.021)+Math.abs(curl),y=.477-row*.192+t*.11+curve,
          z=.552-(t*t*.101)-row*.010;
        const a=[x,y,z-.028],b=[x*1.02+.01+curl,y-.072+curve,z+.019],
          c=[x+.078*(t-.04)+curl,y-.18-(i%3)*.013,z+.024-(row===3?.055:0)];
        const width=.052+.013*Math.sin(1.2+i*.72)+row*.003;
        const m=i>0&&((i+row+side)%4===0||t>.7&&row===0)?'ash':'edge';
        k.geometry(body,m,featherVane(...mirror(side,[a,b,c]),width,10+i+row*3,mobile?7:12));
        band(k,body,m,mirror(side,[[...a,.007],[...b,.011],[...c,.001]]),mobile,7);
      }
    }
    for(let i=0;i<(mobile?4:7);i++){
      const t=i/(mobile?3:6),x=.11+t*.2,y=-.125+t*.135,z=.391-t*.196;
      k.geometry(head,i%3?'edge':'ivory',featherVane(...mirror(side,
        [[x,y,z],[x+.042,y-.062,z+.027],[x+.062,y-.215,z-.045]]),.039+t*.018,29+i,mobile?8:12));
    }
  }
}

function beastMasterwork(k,parts,entry,mobile,profile){
  const {body}=parts;
  const head=parts.head??body.children[0]?.children[0];
  if(!head)return false;
  skullTendons(k,head,profile,mobile);
  const bone=profile[0]==='hood'?head.parent:body;
  dorsalSpines(k,bone,profile,mobile);
  if(profile[0]==='hood')serpentHood(k,head,entry.id==='m002',mobile);
  if(entry.id==='m005')bearChest(k,body,head,mobile);
  if(entry.id==='m022'){
    for(let i=0;i<(mobile?4:6);i++){
      const theta=i*.81,reach=.397+.061*Math.sin(i*.855);
      const x=Math.cos(theta)*reach,z=Math.sin(theta)*reach;
      volume(k,body,i%3?'black':'steel',[[x,.195,z,.069,.058],[x*1.01,.277,z,.086,.058],
        [x*.98,.358,z-.026,.039,.031],[x*.90,.409,z-.067,.003,.002]],mobile,i+.34,{section:2.88,detail:11});
    }
  }
  return true;
}

export function masterworkA(k,parts,entry,mobile){
  if(entry.id==='m003'){
    oni(k,parts,mobile);
    return true;
  }
  const animal=animals[entry.id];
  if(animal)return beastMasterwork(k,parts,entry,mobile,animal);
  const garment=garments[entry.id];
  if(!garment)return false;
  const torso=baseTorso(parts,entry);
  stampedFront(k,torso,garment,mobile);
  attachRear(k,parts.head,torso,entry,garment,mobile);
  if(entry.id==='m033')swordSpirit(k,parts,mobile);
  return true;
}
