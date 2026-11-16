import * as T from '../three.min.mjs';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],p=Math.PI,clamp=T.MathUtils.clamp;
const mirror=(s,track)=>track.map(([x,...rest])=>[s*x,...rest]);
const cast=(k,j,m,shape,depth=.036)=>k.sculpt.plate(j,m,shape,depth,depth*.32);
const line=(k,j,m,track,mobile)=>k.sculpt.sweep(j,m,track,{steps:mobile?8:12,sides:mobile?5:7,ridge:.16});
const sweep=(k,j,m,track,mobile,seed=0,section=2.53)=>
  k.geometry(j,m,sculptVolume(track,{rings:mobile?10:16,sides:mobile?9:13,section,seed,ridge:.166}));
function joint(k,parent,name,x,y,z){
  const bone=k.bone(parent,x,y,z);bone.name=name;
  return bone;
}

const designs={
  m053:{
    key:'clinker',floor:.708,neck:[.399,.115,.35],broad:.401,
    hide:'clay',inside:'black',plate:'ochre',edge:'brass',rift:'glow',tone:0xf17d45,aura:'embers',
    snout:[.194,.162,.403],horn:[[0,0,0,.071,.076],[.104,.053,.038,.068,.056],[.196,.196,.012,.059,.043],
      [.24,.287,-.122,.037,.033],[.199,.348,-.249,.004,.005]],
    upper:[.364,.348],lower:[.405,.404],legX:[.319,.301],legZ:[.397,-.486],
    tail:[[.071,.069,-.341],[.104,.142,-.368],[.115,.199,-.301],[.102,.127,-.262]],pace:.92,wind:.14,
  },
  m054:{
    key:'conduit',floor:.786,neck:[.478,.120,.42],broad:.327,
    hide:'black',inside:'cobalt',plate:'brass',edge:'ivory',rift:'glow',tone:0xf4d283,aura:'bolts',
    snout:[.159,.149,.474],horn:[[.001,0,-.01,.054,.057],[.091,.116,-.023,.059,.061],[.177,.231,-.043,.047,.052],
      [.159,.394,-.102,.036,.034],[.249,.515,-.211,.004,.004]],
    upper:[.406,.405],lower:[.448,.455],legX:[.275,.251],legZ:[.476,-.560],
    tail:[[.027,.091,-.381],[.033,.129,-.398],[.048,.242,-.374],[.059,.254,-.343],[.036,.11,-.258]],pace:1.26,wind:.10,
  },
  m057:{
    key:'tide',floor:.774,neck:[.421,.231,.405],broad:.378,
    hide:'cobalt',inside:'black',plate:'steel',edge:'brass',rift:'glow',tone:0x88d8f5,aura:'mist',
    snout:[.163,.172,.425],horn:[[0,0,0,.064,.067],[.106,.109,-.028,.058,.047],[.208,.288,-.133,.057,.039],
      [.334,.448,-.239,.037,.027],[.355,.673,-.356,.004,.005]],
    upper:[.417,.413],lower:[.437,.475],legX:[.285,.242],legZ:[.467,-.464],
    tail:[[.015,.079,-.342],[.028,.103,-.372],[.06,.171,-.343],[.072,.329,-.369],[.051,.395,-.326]],pace:1.01,wind:.16,
  },
  m058:{
    key:'root',floor:.861,neck:[.366,.306,.418],broad:.337,
    hide:'moss',inside:'black',plate:'jade',edge:'ivory',rift:'glow',tone:0xafe892,aura:'ribbons',
    snout:[.171,.158,.379],horn:[[.003,0,0,.057,.063],[.084,.086,-.056,.058,.051],[.142,.233,-.159,.046,.043],
      [.232,.432,-.269,.031,.032],[.195,.552,-.349,.004,.004]],
    upper:[.437,.442],lower:[.453,.472],legX:[.273,.238],legZ:[.375,-.482],
    tail:[[.036,.09,-.311],[.083,.172,-.371],[.157,.268,-.360],[.129,.256,-.299],[.173,.253,-.291]],pace:.88,wind:.19,
  },
};

function crown(k,head,d,mobile){
  for(const s of sides){
    const f=path=>mirror(s,path);
    const at=joint(k,head,d.key+' curved arresting horn '+s,s*.126,.115,-.039);
    sweep(k,at,d.edge,f(d.horn),mobile,9.17+s,d.key==='conduit'?3.19:2.64);
    line(k,at,d.rift,f(d.horn.slice(1).map(([x,y,z,R],i)=>[x,y+.027,z+.035,R*(i===2?.27:.35)])),mobile);
    if(d.key==='root'||d.key==='tide'){
      for(let n=0;n<3;n++){
        const [x,y,z]=d.horn[n+1],wide=d.key==='root'?.144:.131;
        sweep(k,at,n%2?d.edge:d.plate,f([[x,y-.021,z,.033,.037],[x+wide*.54,y+.081,z-.045,.033,.027],
          [x+wide,y+.139+n*.017,z-.094,.004,.005]]),true,n+.91+s);
      }
    }
    if(d.key==='clinker'){
      cast(k,at,'clay',f([[.049,-.031,.097],[.109,.115,.084],[.222,.121,.023],[.281,.037,-.096],
        [.186,-.052,-.079],[.081,-.113,.009]]),.047);
      line(k,at,'glow',f([[.075,-.074,.079,.011],[.154,.012,.026,.017],[.131,.089,.078,.011],[.193,.096,.057,.004]]),mobile);
    }
  }
}

function visage(k,parent,d,mobile){
  const [along,lift,length]=d.neck,[wide,high,muzzle]=d.snout;
  const head=joint(k,parent,d.key+' skull',0,lift,length);
  const jaw=joint(k,head,d.key+' lower bite',0,-high*.93,.079);
  sweep(k,parent,d.hide,[[0,-.184,-.157,d.broad*.53,d.broad*.51],[0,-.031,.032,d.broad*.64,d.broad*.54],
    [0,lift*.81,along*.70,d.broad*.49,d.broad*.40],[0,lift,length+.023,d.broad*.39,d.broad*.33]],mobile,4.81);
  sweep(k,head,d.plate,[[0,.10,-.189,wide*.74,high*.73],[0,.071,-.055,wide*1.15,high*1.21],
    [0,.044,.079,wide*1.19,high*1.07],[0,-.073,muzzle*.68,wide*.77,high*.71],[0,-.093,muzzle,wide*.47,high*.41]],
  mobile,12.2,d.key==='conduit'?3.05:2.54);
  sweep(k,jaw,d.inside,[[0,-.059,-.111,.071,.093],[0,-.047,.054,.073,wide*.90],[0,-.038,muzzle*.49,.049,wide*.71],
    [0,-.018,muzzle*.78,.025,wide*.45]],mobile,10.23,2.27);
  crown(k,head,d,mobile);
  for(const s of sides){
    const f=path=>mirror(s,path);
    const orbital=f([[wide*.36,.128,.167],[wide*.73,.153,.096],[wide*1.05,.093,.034],[wide*1.107,-.004,.11],
      [wide*.79,-.022,.168],[wide*.42,.024,.231]]);
    cast(k,head,d.inside,orbital,.039);
    line(k,head,d.edge,orbital.slice(0,4).map(([x,y,z],i)=>[x,y+.013,z+.027,[.007,.022,.017,.005][i]]),mobile);
    k.mesh(head,'gem','glow',s*wide*.738,.067,.202,wide*.192,.018,.031,0,s*.53,s*.18);
    for(let i=0;i<4;i++){
      const z=.131+i*muzzle*.122,x=wide*(.71-i*.107);
      sweep(k,head,d.edge,f([[x,-.099,z,.018,.018],[x+.011,-.156-i%2*.016,z+.021,.022,.017],
        [x+.001,-.213-i%2*.026,z+.062,.003,.004]]),true,6+i,2.27);
    }
    if(d.key==='tide'){
      const tusk=f([[wide*.91,-.114,.176,.058,.042],[wide*1.05,-.186,.273,.056,.048],
        [wide*.88,-.238,.415,.038,.027],[wide*.54,-.161,.524,.004,.004]]);
      sweep(k,head,'ivory',tusk,mobile,19.22,2.51);
      for(let n=0;n<3;n++)line(k,head,'steel',f([[.161,.074-n*.072,-.017,.008],[.203,.031-n*.077,-.074,.018],
        [.194,-.048-n*.077,-.118,.005]]),mobile);
    }else if(d.key==='root'){
      const bark=f([[.012,.191,.072],[.097,.188,-.008],[.198,.095,-.083],[.242,-.003,-.104],
        [.193,-.101,-.006],[.104,-.124,.169],[.042,-.012,.234]]);
      cast(k,head,'jade',bark,.049);
      line(k,head,'ivory',bark.slice(1,5).map(([x,y,z],i)=>[x,y+.006,z-.031,[.008,.022,.017,.004][i]]),mobile);
      sweep(k,jaw,'ivory',f([[.118,-.011,.04,.026,.025],[.15,-.054,.133,.036,.027],
        [.139,.021,.202,.011,.013],[.111,.115,.214,.004,.005]]),mobile,12.2,2.48);
    }else{
      const cheek=f([[.087,.005,.18],[.171,.004,.083],[.205,-.085,-.028],[.156,-.182,.141],
        [.111,-.182,.253],[.079,-.088,.291]]);
      cast(k,head,d.key==='conduit'?'brass':'black',cheek,.051);
      line(k,head,d.key==='conduit'?'ivory':'ochre',cheek.slice(0,5).map(([x,y,z],i)=>[x,y+.012,z+.028,[.005,.018,.021,.010,.004][i]]),mobile);
    }
  }
  return {head,jaw};
}

function carapace(k,body,d,mobile){
  const w=d.broad,root=d.key==='root',sea=d.key==='tide',clinker=d.key==='clinker';
  sweep(k,body,d.hide,[[0,-.091,-.712,w*.41,w*.56],[0,-.023,-.536,w*.65,w*.80],[.012,.079,-.176,w*.78,w],
    [0,.109,.245,w*.81,w*.94],[0,.14,.482,w*.61,w*.70]],mobile,6.11,sea?2.29:2.66);
  const panels=[];
  const rows=root?5:sea?5:clinker?4:6;
  for(const side of sides){
    const f=path=>mirror(side,path);
    for(let i=0;i<rows;i++){
      const t=i/(rows-1),z=.383-t*.977,h=.255+(sea?.16:root?.11:.06)*Math.sin(t*p);
      const at=joint(k,body,d.key+' flank assembly '+side+' '+i,side*w*.51,h,z);
      const x=w*(clinker?1:.88)*(1-t*.20);
      const out=clinker?
        [[.017,.037,.109],[x*.64,.172,.147],[x*1.13,.078,.057],[x*1.09,-.184,-.035],[x*.49,-.213,-.24],[.015,-.083,-.214]]:
        sea?[[.014,.037,.125],[x*.49,.23,.071],[x,.199,-.125],[x*1.24,-.087,-.124],[x*.91,-.253,-.248],[.033,-.145,-.172]]:
        root?[[.012,.057,.19],[x*.51,.151,.154],[x*1.12,.185,-.073],[x*1.37,-.025,-.29],[x*.91,-.149,-.236],[.048,-.126,-.08]]:
        [[.01,.093,.098],[x*.56,.167,.076],[x*1.08,.107,-.024],[x*.92,-.043,-.15],[x*.43,-.128,-.221],[.01,-.071,-.186]];
      const rim=f(out);
      cast(k,at,i%2?d.hide:d.plate,rim,.058);
      line(k,at,d.edge,rim.slice(0,5).map(([x,y,z],n)=>[x,y+.033,z+.012,[.005,.022,.023,.018,.006][n]]),mobile);
      if(clinker||sea){
        for(let groove=0;groove<3;groove++){
          const shift=.043*groove;
          line(k,at,groove===1?d.rift:d.inside,f([[x*.39,.076-shift,.088,.006],
            [x*.76,.045-shift,.018,.015],[x*.82,-.047-shift,-.102,.015],[x*.52,-.106-shift,-.188,.004]]),mobile);
        }
      }else if(root){
        const track=f([[.034,.063,.11,.028],[x*.64,.162,.017,.037],[x*1.14,.13,-.179,.024],
          [x*1.28,.061,-.332,.004]]);
        sweep(k,at,'moss',track,true,4+i);
      }else{
        const spine=f([[.017,.076,.091,.024],[x*.54,.159,-.023,.037],
          [x*.87,.238,-.134,.026],[x*1.12,.225,-.242,.004]]);
        sweep(k,at,'brass',spine,mobile,4+i,3.38);
        line(k,at,'glow',spine.map(([x,y,z,r])=>[x,y+.028,z-.016,r*.39]),mobile);
        cast(k,at,'ochre',f([[x*.51,.116,.116],[x*.89,.082,.07],[x*1.03,.029,-.008],
          [x*.86,-.032,-.099],[x*.48,-.047,-.132],[x*.39,.026,.016]]),.037);
      }
      panels.push({at,side,i});
    }
  }
  return panels;
}

function hindquarters(k,body,d,mobile){
  const sea=d.key==='tide',root=d.key==='root',clinker=d.key==='clinker',legs=[];
  for(const side of sides)for(const [index,front] of [true,false].entries()){
    const f=path=>mirror(side,path);
    const hip=joint(k,body,d.key+' ankle drive '+side+' '+index,side*d.legX[index],front?.109:.055,d.legZ[index]);
    const upper=d.upper[index],lower=d.lower[index];
    const knee=joint(k,hip,d.key+' sculpted knee '+side+' '+index,0,-upper,0);
    const paw=joint(k,knee,d.key+' carved paw '+side+' '+index,0,-lower,0);
    const a=clinker?.159:sea?.151:root?.095:.108,n=clinker?.091:sea?.094:root?.064:.077;
    sweep(k,hip,d.hide,f([[.01,.122,-.078,a*.77,a],[.038,.022,-.019,a,a*.97],[.028,-upper*.57,.017,a*.69,a*.76],
      [.018,-upper,.016,a*.64,a*.57]]),mobile,18.2+index,2.52);
    sweep(k,knee,d.inside,f([[0,.064,-.028,n*1.17,n*1.24],[.015,-lower*.27,.028,n*1.42,n*1.28],
      [.018,-lower*.74,.021,n*.95,n],[0,-lower,.031,n*.76,n*.71]]),mobile,8.92+index,2.71);
    for(let i=0;i<(root?4:clinker?2:3);i++){
      const h=-lower*(i+.67)/(root?4.5:3.67);
      const cap=f([[-n*.77,h+.067,.064],[n*.39,h+.088,.103],[n*1.23,h+.018,.041],[n*.86,h-.091,.072],
        [.022,h-.123,.139],[-n*.71,h-.086,.116]]);
      cast(k,knee,i%2?d.hide:d.plate,cap,.029);
      line(k,knee,d.edge,cap.slice(0,4).map(([x,y,z],j)=>[x,y+.009,z+.025,[.003,.014,.012,.005][j]]),mobile);
    }
    const width=clinker?.117:sea?.104:root?.064:.072;
    sweep(k,paw,d.plate,[[0,.047,-.049,n*.88,width],[0,.019,.025,n,width*1.03],[.003,-.016,.111,.031,width*.92]],mobile,3.87,2.76);
    const toes=sea?4:root?3:clinker?3:2;
    for(let i=0;i<toes;i++){
      const x=(i-(toes-1)*.5)*(width*1.63/toes),toe=clinker?.162:sea?.227:root?.203:.215;
      sweep(k,paw,d.edge,[[x,.009,.081,.023,.027],[x*1.1,-.019,toe-.056,.031,.022],
        [x*1.17,-.036,toe,.007,.007]],true,2.64+i,2.56);
      if(i!==toes-1&&sea)cast(k,paw,'cobalt',[[x,.017,.106],[x+.041,.016,.116],[x+.046,-.025,.181],[x+.009,-.025,.198]],.019);
    }
    legs.push({hip,knee,paw,side,front,upper,lower});
  }
  return legs;
}

function tailRig(k,body,d,mobile){
  const tail=[];
  let j=joint(k,body,d.key+' tail coupling',0,.015,-.618);
  for(const [i,[x,y,z]] of d.tail.entries()){
    const r=.138-i*.021,last=i===d.tail.length-1;
    sweep(k,j,i%2?d.hide:d.plate,[[0,-.011,.076,r*.76,r*.87],[x*.35,y*.34,z*.44,r,r],
      [x*.75,y*.75,z*.73,r*.87,r*.77],[x,y,z,last?.008:r*.84,last?.009:r*.81]],mobile,10.13+i,2.55);
    if(d.key==='clinker'){
      const spot=[[.013,.049,.04],[x*.44,y+.095,z*.46],[x*.88,y+.127,z*.73],[x+.09,y+.023,z-.075],
        [x*.58,y-.018,z*.85],[-.021,.012,-.045]];
      cast(k,j,'black',spot,.048);
      line(k,j,'glow',spot.slice(1,4).map(([x,y,z],n)=>[x,y+.025,z,[.007,.018,.004][n]]),mobile);
    }else if(last&&d.key==='conduit'){
      for(let prong=0;prong<3;prong++){
        const spread=(prong-1)*.151,at=[x+spread*.31,y*.41,z*.72];
        const fork=[ [...at,.036,.032],[x+spread*.68,y+.142,z-.061,.036,.028],
          [x+spread,y+.179+Number(prong===1)*.114,z-.154,.021,.017],
          [x+spread*1.19,y+.227+Number(prong===1)*.116,z-.29,.003,.004] ];
        sweep(k,j,'brass',fork,mobile,i+prong*6.3,3.56);
        line(k,j,'glow',fork.slice(1).map(([x,y,z,r])=>[x,y+.008,z+.028,r*.46]),mobile);
      }
    }else if(last||d.key==='root'){
      for(const side of sides){
        const tide=d.key==='tide',start=[x*.48,y*.48,z*.66];
        const mid=[x+side*(tide?.21:.11),y+(tide?.137:.224),z*.95];
        const end=[x+side*(tide?.293:.207),y+(tide?.226:last?.415:.267),z-(tide?.296:.156)];
        k.geometry(j,d.key==='root'?'jade':'steel',featherVane(start,mid,end,last?.139:.074,11.9+i+side,mobile?8:12));
        line(k,j,d.edge,[[...start,.017],[...mid,.031],[...end,.003]],mobile);
      }
    }else{
      sweep(k,j,d.edge,[[x*.34,y*.6,z*.45,.047,.032],[x+.019,y+.113,z*.66,.037,.039],
        [x+.066,y+.199,z-.062,.004,.004]],true,12+i);
    }
    tail.push(j);
    if(!last)j=joint(k,j,d.key+' tail segment '+i,x,y,z);
  }
  return tail;
}

function plant({hip,knee,paw,side,front,upper,lower},body,phase,travel,wind,strike,fall){
  const pace=phase+(side===1?p:0)+(front?0:p),drive=travel*Math.cos(pace);
  const lift=Math.max(0,Math.sin(pace))*travel*.145+fall*.305+(front?wind*.076:0);
  const z=hip.position.z+(front?.076:-.061)+drive*.213+strike*(front?.193:-.069);
  const y=.051-body.position.y+lift-Math.sin(body.rotation.x)*z;
  const dy=y-hip.position.y,dz=z-hip.position.z,r=clamp(Math.hypot(dy,dz),Math.abs(upper-lower)+.001,upper+lower-.001);
  const sign=front?-1:1;
  const a=Math.acos(clamp((upper*upper+r*r-lower*lower)/(2*upper*r),-1,1));
  const b=Math.acos(clamp((upper*upper+lower*lower-r*r)/(2*upper*lower),-1,1));
  hip.rotation.set(Math.atan2(-dz,-dy)-sign*a,side*(.046+wind*.065),side*.059);
  knee.rotation.x=sign*(p-b);
  paw.rotation.x=-hip.rotation.x-knee.rotation.x-body.rotation.x-lift*.37;
}

export function sculptBurialBeast(k,entry,mobile){
  const d=designs[entry.id];
  if(!d)return null;
  const body=joint(k,k.root,d.key+' sculpted burial beast',0,d.floor,0);
  const neck=joint(k,body,d.key+' shoulder to cervical hinge',0,.059,d.neck[0]);
  const {head,jaw}=visage(k,neck,d,mobile);
  const plates=carapace(k,body,d,mobile),legs=hindquarters(k,body,d,mobile),tail=tailRig(k,body,d,mobile);
  const pose=({beat,step,wind,strike,travel,headtime,stage,fall})=>{
    body.rotation.set(wind*.109-strike*.188+fall*.21,0,travel*Math.sin(step*d.pace)*.046);
    body.position.y=d.floor+Math.sin(step*d.pace*2)*travel*.044+wind*.049-strike*.051;
    neck.rotation.set(wind*d.wind-strike*.38,Math.sin(headtime*2.48)*.11+wind*.13-strike*.17,stage*.037);
    head.rotation.x=-wind*.19+strike*.24;
    jaw.rotation.x=.056+wind*.398+strike*.67;
    for(const {at,side,i} of plates){
      at.rotation.x=Math.sin(beat*.79-i*.62)*.043+wind*.11-strike*.17;
      at.rotation.z=side*(wind*.27+strike*.09+stage*.11+(d.key==='root'?.03:0));
    }
    for(const [i,j] of tail.entries()){
      j.rotation.set(wind*.11-strike*.14+Math.sin(beat*.49-i*.61)*.091,
        Math.sin(headtime*2.1-i*.61)*(d.key==='root'?.248:.163)+travel*.11+strike*.17,stage*.046);
    }
    for(const leg of legs)plant(leg,body,step*d.pace,travel,wind,strike,fall);
  };
  pose({beat:0,step:0,wind:0,strike:0,travel:0,headtime:0,stage:0,fall:0});
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,tombBeastRig:true,pattern:'gallop',grounded:true,
    polishEnergy:{tint:d.tone,shape:d.aura,anchor:d.key==='tide'?head:body,offset:[0,.24,-.267],span:[.75,.57,.949]},
    cataloguePose:pose};
}
