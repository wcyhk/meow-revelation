import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const TAU=Math.PI*2;
const sides=[-1,1];
const vein=(k,joint,material,track,segments=10)=>k.sculpt.sweep(joint,material,track,
  {sides:5,steps:segments,ridge:.21});
const mirrored=(side,points)=>points.map(([x,...tail])=>[x*side,...tail]);

function studioMaterial(k,name,color,metalness,roughness,kind){
  if(k.materials[name])return;
  k.materials[name]=paintedFinish(new T.MeshStandardMaterial({
    color,vertexColors:true,metalness,roughness,side:T.DoubleSide,
    envMap:forgeEnvironment(),envMapIntensity:metalness>.3?.69:.26,
  }),kind,true,true);
}

// Grid surfaces have real thickness and closed rims. Both sides can carry pigment.
function closedSurface(rows,cols,sample,flip=false){
  const xyz=[],colors=[],uv=[],indices=[];
  const stride=cols+1,layer=(rows+1)*stride;
  for(let face=0;face<2;face++)for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
    const u=row/rows,v=col/cols;
    const {point,pigment}=sample(u,v,face);
    xyz.push(...point);colors.push(...pigment);uv.push(u,v);
    if(row<rows&&col<cols){
      const a=face*layer+row*stride+col,b=a+stride;
      if(Boolean(face)===flip)indices.push(a,b,a+1,a+1,b,b+1);
      else indices.push(a,a+1,b,a+1,b+1,b);
    }
  }
  const close=(a,b)=>indices.push(a,b,a+layer,b,b+layer,a+layer);
  for(let row=0;row<rows;row++){
    close(row*stride,(row+1)*stride);
    close((row+1)*stride+cols,row*stride+cols);
  }
  for(let col=0;col<cols;col++){
    close(col+1,col);
    close(rows*stride+col,rows*stride+col+1);
  }
  const geo=new T.BufferGeometry().setIndex(indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(xyz,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}

const shellSections=[
  [-.34,.29,.26],[ -.57,.459,.366],[-.81,.557,.429],[-1.06,.554,.438],[-1.31,.473,.362],[-1.56,.272,.272],
];

function widowScute(row,u,v,face){
  const [z,width,raise]=shellSections[row];
  const a=(-1.91+v*3.82);
  const scallop=.021*Math.sin(a*7+row*.62)*u*u;
  const edge=Math.sin(u*Math.PI),bevel=Math.sin(Math.min(1,u*12,(1-u)*12)*1.5708);
  const inflation=(1+.14*edge)*(.93+.07*bevel);
  const rad=face===0?1:.89;
  const striation=Math.sin(a*31+u*14+row*.213)*.021;
  return [
    Math.sin(a)*width*rad*inflation*(1+striation),
    .25+Math.cos(a)*raise*rad*inflation*(1+striation)+.018*Math.sin(v*14+row),
    z-.255*u+.061*Math.cos(a)*u+scallop,
  ];
}

export function widowBody(k,{body,head,flaps},mobile){
  studioMaterial(k,'widowChitin',0x46324c,.36,.49,'hide');
  studioMaterial(k,'widowOxide',0x734553,.49,.48,'bronze');
  studioMaterial(k,'widowBone',0xc09889,.16,.63,'bone');
  const volume=[[0,.086,-1.74,.038,.059],[0,.246,-1.55,.28,.299],[0,.251,-1.18,.403,.362],
    [0,.233,-.80,.463,.377],[0,.161,-.41,.453,.270],[0,.06,.043,.322,.288],[0,.030,.23,.247,.225]];
  k.geometry(body,'deep',sculptVolume(volume,{sides:mobile?14:20,rings:mobile?19:28,section:2.12,ridge:.20}));
  for(const [row,[z]] of shellSections.entries()){
    const hinge=k.bone(body,0,.215,z);
    hinge.name='鎮墓腹甲 '+(row+1);
    flaps.push({joint:hinge,axis:'x',amp:.061+row*.010,bias:.011,seed:row*.92});
    const local=([x,y,zPos])=>[x,y-.215,zPos-z];
    const geometry=closedSurface(mobile?8:12,mobile?20:30,(u,v,face)=>{
      const point=local(widowScute(row,u,v,face));
      const pits=Math.sin(u*49+v*88)*Math.sin(v*32+row);
      const line=(.5+.5*Math.cos((v-.5)*98+u*8))**12;
      const band=Math.sin(Math.PI*u),grade=.75+band*.19-line*.122+pits*.05;
      return {point,pigment:[grade*(row%2?.87:1),grade*.88,grade*(row%2?1.06:.96)]};
    });
    k.geometry(hinge,row===3?'widowOxide':'widowChitin',geometry);
    for(const side of sides){
      const track=Array.from({length:9},(_,i)=>{
        const v=.5+side*i*.056;
        const [x,y,zPos]=local(widowScute(row,.84,v,0));
        return [x*1.014,y*1.033,zPos-.014,.006+.014*Math.sin(i*Math.PI/9)];
      });
      vein(k,hinge,'widowOxide',track,12);
      const joint=track[6];
      vein(k,hinge,row%2?'widowBone':'glow',[[joint[0]*.90,joint[1]+.01,joint[2]+.087,.005],
        [joint[0]*1.012,joint[1]+.023,joint[2]+.023,.014],[joint[0]*1.084,joint[1]-.069,joint[2]-.016,.005]]);
    }
  }
  for(const side of sides){
    const s=x=>x*side;
    const fang=[[s(.139),.069,.097,.051,.047],[s(.224),.137,.253,.068,.056],
      [s(.237),.065,.409,.049,.041],[s(.187),-.032,.513,.025,.025],[s(.111),-.08,.544,.006,.006]];
    k.geometry(head,'widowBone',sculptVolume(fang,{sides:9,rings:12,section:2.04,ridge:.21,seed:side}));
    vein(k,head,'widowOxide',fang.map(([x,y,z,r])=>[x,y+.027,z+.022,r*.35]));
  }
  const loom=k.bone(body,0,.168,-1.64);
  loom.name='織碑夫人 · 絲囊';
  k.geometry(loom,'widowChitin',sculptVolume([[0,-.155,.086,.115,.106],[0,-.116,.018,.223,.170],
    [0,-.022,-.046,.244,.152],[0,.134,-.035,.189,.099],[0,.191,.022,.063,.055]],
  {sides:mobile?11:17,rings:mobile?11:17,section:2.31,ridge:.22}));
  for(const side of sides)for(let i=0;i<3;i++){
    const s=x=>side*x;
    const gate=k.bone(loom,s(.079+i*.052),.092-i*.087,-.022+i*.027);
    gate.name='織碑夫人 · 吐絲瓣 '+side+'-'+i;
    const points=[[s(-.037),.056,.050],[s(.098),.104,.017],[s(.143),.048,-.080],
      [s(.106),-.056,-.155],[s(.038),-.110,-.137],[s(-.045),-.061,-.102],[s(-.068),.022,-.030]];
    k.sculpt.plate(gate,i===1?'widowOxide':'widowChitin',points,.044,.014);
    vein(k,gate,'widowBone',points.slice(0,5).map(([x,y,z],n)=>[x,y+.009,z-.013,[.009,.017,.019,.012,.004][n]]));
    const pore=[s(.037),-.048,-.126];
    k.mesh(gate,'gem','deep',...pore,.038,.053,.033,0,side*.29);
    vein(k,gate,i===0?'widowBone':'glow',[[s(.064),-.017,-.10,.006],[s(.036),-.063,-.156,.012],
      [s(.014),-.111,-.222,.008],[s(.047),-.168-i*.018,-.272,.003]],mobile?8:12);
    flaps.push({joint:gate,axis:'y',amp:.19+i*.036,bias:side*.11,seed:side*.35+i*.68});
    flaps.push({joint:gate,axis:'x',amp:.113,bias:.06,seed:i*.57-side*.43});
  }
  for(const side of sides){
    const s=x=>side*x;
    vein(k,loom,'widowBone',[[s(.061),.152,.089,.017],[s(.166),.139,.046,.035],[s(.242),.076,-.025,.028],
      [s(.269),-.032,-.096,.020],[s(.224),-.148,-.192,.007]],mobile?11:15);
  }
}

function mothPoint(side,u,v,surface,lower){
  const a=(lower?-.58:.62)-(lower?.86:1.46)*v;
  const lobes=1+.16*Math.sin(v*Math.PI)+.093*Math.sin(v*7.2);
  const scallop=Math.cos(v*24.4+Math.sin(v*5)*.5)*.056;
  const reach=(lower?.86:1.49)*lobes*(1+scallop*u**4);
  const x=(.035+Math.cos(a)*reach*u),y=(lower?.12:.08)+Math.sin(a)*reach*u;
  const bow=Math.sin(Math.PI*u)*(.098+Math.sin(v*3.7)*.061);
  const pleat=Math.sin(v*32.5+u*1.15)*Math.sin(Math.PI*u)*.017;
  return [x*side,y,-.024-u*.324+bow+pleat+(surface===0?.022:-.015)*(1-u*.53)];
}

function mothWing(k,joint,side,lower,mobile){
  const geometry=closedSurface(mobile?12:18,mobile?20:30,(u,v,face)=>{
    const point=mothPoint(side,u,v,face,lower);
    const spotCenter=lower?.52:.76;
    const eye=Math.hypot((u-spotCenter)*1.25,(v-.51)*1.63);
    const pupil=1-T.MathUtils.smoothstep(eye,.026,.061);
    const ring=Math.exp(-((eye-.101)**2)*1600);
    const halo=Math.exp(-((eye-.143)**2)*530);
    const rim=T.MathUtils.smoothstep(u,.79,.99),dust=Math.sin(u*77+Math.sin(v*72)*1.8)*Math.cos(v*133);
    const ribs=(.5+.5*Math.cos(v*35+u*2.1))**8;
    const shade=(lower?.61:.71)*(.58+u*.57)-rim*.25+dust*.046-ribs*.102;
    return {point,pigment:[shade+halo*.32+ring*.22-pupil*.18,shade*.77+ring*.35+pupil*.20,shade*1.17+ring*.61+pupil*.44]};
  },side<0);
  k.geometry(joint,lower?'mothLower':'mothWing',geometry);
  for(let veinIndex=0;veinIndex<(mobile?5:7);veinIndex++){
    const v=veinIndex/(mobile?4:6);
    const spine=Array.from({length:6},(_,i)=>{
      const u=.04+i*.188;
      const [x,y,z]=mothPoint(side,u,v,0,lower);
      return [x,y,z+.008,.029*(1-u)**1.12+.004];
    });
    vein(k,joint,veinIndex%3?'mothRib':'widowBone',spine,9);
  }
}

const panes=[
  [[.037,.052],[.32,.54],[.55,.81],[.69,.75],[.59,.411],[.38,.247]],
  [[.63,.412],[.776,.794],[1.07,.814],[1.23,.68],[1.09,.398],[.899,.28]],
  [[.42,.242],[.70,.351],[.885,.292],[.804,.041],[.61,-.213],[.413,-.112]],
  [[.878,.20],[1.113,.36],[1.245,.24],[1.172,-.082],[.919,-.368],[.802,-.225]],
  [[.244,.156],[.350,.048],[.408,-.173],[.339,-.375],[.148,-.253],[.086,-.045]],
];

function glassWing(k,joint,side,outer,mobile,flaps){
  const scale=outer?.67:1;
  for(const [i,pane] of panes.entries()){
    const xScale=scale*side;
    const points=pane.map(([x,y],index)=>[(x-(outer?.16:0))*xScale,
      (y-(outer?.266:0))*scale,-.056-x*.211+Math.sin(y*5.4)*.037+(index===3?.029:0)]);
    const pivot=k.bone(joint,...points[0]);
    const path=points.map(([x,y,z])=>[x-points[0][0],y-points[0][1],z-points[0][2]]);
    for(const [color,thickness,inflate] of [['windowLead',.064,1], [i%3===0?'windowRose':'windowGlass',.035,.87]]){
      const mid=path.reduce(([X,Y,Z],[x,y,z])=>[X+x/path.length,Y+y/path.length,Z+z/path.length],[0,0,0]);
      const cast=path.map(([x,y,z])=>[mid[0]+(x-mid[0])*inflate,mid[1]+(y-mid[1])*inflate,z+(inflate<1?.037:0)]);
      k.sculpt.plate(pivot,color,cast,thickness,.014);
    }
    for(const face of [-1,1]){
      vein(k,pivot,'windowLead',[[...path[0].slice(0,2),path[0][2]+face*.037,.014],
        [path[3][0]*.37,path[3][1]*.63,path[3][2]*.52+face*.037,.022],
        [path[3][0]*.62,path[3][1]*.89,path[3][2]*.83+face*.044,.015],
        [path[2][0],path[2][1],path[2][2]+face*.041,.011]]);
    }
    if(!mobile||i%2===0){
      const [x,y,z]=path[3];
      k.mesh(pivot,'gem',i===3?'glow':'windowGold',x,y,z,.045,.065,.031,0,side*.22,side*.34);
    }
    flaps.push({joint:pivot,axis:'y',amp:.09+i*.017,bias:side*.04,seed:i+side});
  }
}

function glassMaterials(k){
  studioMaterial(k,'windowLead',0x35374e,.72,.47,'iron');
  studioMaterial(k,'windowGlass',0x5563a8,.53,.27,'gem');
  studioMaterial(k,'windowRose',0xa34974,.45,.31,'gem');
  studioMaterial(k,'windowGold',0xa98960,.73,.47,'bronze');
}

function mothMaterials(k){
  studioMaterial(k,'mothWing',0xa889b6,.14,.71,'hide');
  studioMaterial(k,'mothLower',0x64517b,.17,.77,'cloth');
  studioMaterial(k,'mothRib',0x554251,.24,.64,'hide');
  studioMaterial(k,'widowBone',0xc09889,.16,.63,'bone');
}

function burialMaterials(k){
  studioMaterial(k,'burialPaper',0xcdbda3,.06,.84,'cloth');
  studioMaterial(k,'burialWax',0x914752,.18,.56,'hide');
  studioMaterial(k,'burialBone',0x72616a,.17,.67,'bone');
  studioMaterial(k,'burialStamp',0x77433f,.08,.74,'cloth');
}

export function sculptBurialCore(k,body,head,mobile,flaps){
  burialMaterials(k);
  const spine=[[0,-.43,-.167,.092,.117],[0,-.22,-.119,.254,.229],[0,-.012,-.044,.331,.271],
    [0,.19,.014,.285,.231],[0,.405,.085,.191,.173],[0,.565,.120,.131,.128]];
  k.geometry(body,'burialBone',sculptVolume(spine,{sides:mobile?15:22,rings:mobile?17:24,section:2.3,ridge:.21}));
  for(const side of sides){
    const fan=points=>mirrored(side,points);
    const mask=fan([[0,.326,.162],[.135,.282,.147],[.207,.077,.134],[.161,-.116,.278],[.052,-.254,.422],
      [.016,-.157,.431],[.061,-.008,.295],[.058,.140,.214]]);
    k.sculpt.plate(head,'burialPaper',mask,.049,.016);
    const brow=fan([[.022,.092,.275,.014],[.097,.137,.215,.041],[.183,.164,.145,.037],[.221,.182,.034,.008]]);
    vein(k,head,'burialWax',brow,14);
    vein(k,head,'glow',fan([[.076,.086,.245,.010],[.116,.102,.216,.019],[.161,.116,.176,.004]]));
    for(let row=0;row<4;row++){
      const y=.305-row*.141,z=.243-row*.012;
      const bib=fan([[.019,y+.084,z+.095],[.163,y+.126,z+.069],[.258,y+.037,z-.019],
        [.237,y-.097,z+.004],[.11,y-.114,z+.083],[.026,y-.081,z+.117]]);
      k.sculpt.plate(body,row===1?'burialWax':'burialPaper',bib,.034,.010);
      vein(k,body,'burialStamp',bib.slice(1,5).map(([x,v,w])=>[x,v,w+.023,.010]));
      const back=fan([[.033,y+.095,-.22],[.16,y+.14,-.185],[.306,y+.048,-.124],
        [.285,y-.057,-.173],[.114,y-.127,-.30],[.06,y-.088,-.293]]);
      k.sculpt.plate(body,row===2?'burialBone':'burialPaper',back,.038,.012);
      vein(k,body,'burialWax',back.slice(2,6).map(([x,h,z])=>[x,h,z-.022,.012]));
    }
    const streamer=k.bone(head,side*.145,.284,-.09);
    streamer.name='紙墓送靈者 · 兜後封條';
    paperRibbon(k,streamer,side,.51,.07,.11,side+3.4,mobile);
    flaps.push({joint:streamer,axis:'z',amp:.21,bias:side*.25,seed:side*1.32});
  }
}

function paperRibbon(k,joint,side,length,width,lean,seed,mobile){
  const leaf=closedSurface(mobile?10:15,mobile?6:9,(u,v,face)=>{
    const t=v*2-1,fold=1-Math.abs(t),torn=u**8*Math.cos(v*27+seed)*.052;
    const point=[side*(u*lean+t*width*(1-u*.29)),-u*length+torn,
      Math.sin(u*3.1+seed*.3)*u*.104+fold*.025+(face?.010:-.010)];
    const cross=(.5+.5*Math.cos((t-.14)*18+u*42))**12;
    const stamp=Math.exp(-((u-.29)**2)*260)*Math.exp(-(t*t)*3.8);
    const grain=.62+fold*.10+cross*.075+.046*Math.sin(u*90+v*71);
    return {point,pigment:[grain+stamp*.14,grain*.96-stamp*.19,grain*.91-stamp*.23]};
  },side<0);
  k.geometry(joint,'burialPaper',leaf);
}

export function sculptBurialWing(k,elbow,wrist,side,mobile,flaps){
  const fan=path=>mirrored(side,path);
  for(const [joint,span,reach,count] of [[elbow,1.17,.49,5],[wrist,.68,.65,4]]){
    for(let i=0;i<count;i++){
      const t=i/(count-1),x=.055+span*t*.73,y=.163+Math.sin(t*2.9)*.324;
      const hinge=k.bone(joint,side*x,y,-.060-t*.24);
      hinge.name='紙墓送靈者 · 枝骨紙翎 '+(i+1);
      const length=reach*(1+.25*Math.cos(t*2.95));
      const wing=closedSurface(mobile?9:13,mobile?6:9,(u,v,face)=>{
        const s=v*2-1,ridge=1-Math.abs(s);
        const w=(.142-i*.007)*(.75+Math.sin(Math.PI*u)*.46)*(1-u**3*.82);
        const point=[side*(span*.35*u+s*w),-.09-u*length+u*.17*s,
          -.045-u*.22+ridge*.069*(1-u*.62)+(face?.014:-.014)];
        const fiber=(.5+.5*Math.cos(u*107-v*31+i))**9;
        const ash=u*u*.19,crease=ridge*.22;
        const ink=Math.exp(-((u-(.22+i*.041))**2)*310)*(Math.sin(s*15)*.5+.5)**3;
        const pigment=.63+crease-ash+fiber*.09;
        return {point,pigment:[pigment+ink*.07,pigment*.95-ink*.16,pigment*.89-ink*.18]};
      },side<0);
      k.geometry(hinge,i===count-1?'burialBone':'burialPaper',wing);
      vein(k,hinge,'burialBone',fan([[0,-.047,.011,.019],[span*.16,-length*.39,-.050,.019],
        [span*.31,-length*.86-.032,-.207,.014],[span*.36,-length*.97-.082,-.253,.004]]));
      k.mesh(hinge,'ring','burialWax',0,-.032,-.029,.063,.061,.54,0,side*.38);
      const seal=k.bone(hinge,side*span*.13,-length*.41,-.084);
      seal.rotation.z=side*-.31;
      paperRibbon(k,seal,side,length*.63,.040,.105,i*1.4+side,mobile);
      flaps.push({joint:hinge,axis:'y',amp:.10+i*.020,bias:side*.06,seed:i*.68+side});
      flaps.push({joint:seal,axis:'x',amp:.25+i*.021,bias:.19,seed:i*.79+side});
    }
  }
  // Curved black fingers project beyond the outer folds and move from the wrist.
  for(let i=0;i<3;i++){
    const x=.08+i*.16,y=.213-i*.092;
    const claw=k.bone(wrist,side*x,y,-.090-i*.07);
    claw.name='紙墓送靈者 · 翼爪';
    vein(k,claw,'burialBone',fan([[0,0,.008,.060],[.153,.132,-.087,.052],
      [.276,.071,-.139,.037],[.301,-.091,-.159,.027],[.246,-.234,-.172,.006]]),17);
    vein(k,claw,'burialWax',fan([[.069,.057,-.022,.021],[.192,.118,-.072,.024],
      [.268,.052,-.103,.016],[.286,-.084,-.134,.005]]));
    flaps.push({joint:claw,axis:'x',amp:.14+i*.03,bias:.13,seed:i*.88+side});
  }
}

export function sculptRelicWing(k,variant,elbow,wrist,side,mobile,flaps){
  if(variant==='glass'){
    glassWing(k,elbow,side,false,mobile,flaps);
    glassWing(k,wrist,side,true,mobile,flaps);
  }else{
    mothWing(k,elbow,side,false,mobile);
    mothWing(k,wrist,side,true,mobile);
  }
}

export function sculptRelicCore(k,variant,body,head,mobile,flaps){
  const glass=variant==='glass';
  if(glass)glassMaterials(k);
  else mothMaterials(k);
  const mold=(parent,material,path,fur=false)=>k.geometry(parent,material,sculptVolume(path,{
    sides:mobile?9:13,rings:mobile?12:18,section:glass?3.25:2.16,ridge:glass?.18:.28,fur,
  }));
  const chassis=glass?'windowLead':'mothRib',highlight=glass?'windowGold':'widowBone';
  if(glass){
    mold(body,chassis,[[0,-.49,-.145,.129,.121],[0,-.25,-.031,.26,.231],[0,.04,.048,.359,.286],
      [0,.31,.072,.274,.247],[0,.48,.171,.094,.091]]);
    mold(head,'windowLead',[[0,-.191,.031,.101,.115],[0,-.078,.092,.193,.151],
      [0,.128,.129,.193,.177],[0,.29,-.024,.119,.102],[0,.43,-.094,.028,.035]]);
    const window=k.bone(body,0,.105,.323);
    const spokes=8;
    for(let i=0;i<spokes;i++){
      const a=i*TAU/spokes,X=Math.sin(a),Y=Math.cos(a);
      const x=Math.sin(a+.54),y=Math.cos(a+.54);
      const shard=[[X*.045,Y*.045,.028],[X*.219,Y*.219,-.021],[x*.204,y*.204,-.03],[x*.048,y*.047,.028]];
      k.sculpt.plate(window,i%3?'windowGlass':'windowRose',shard,.044,.015);
      vein(k,window,'windowGold',shard.slice(0,3).map(([x,y,z],j)=>[x,y,z+.021,j===1?.018:.01]));
    }
    k.mesh(window,'round','glow',0,0,.047,.052,.053,.025);
    k.mesh(window,'ring','windowLead',0,0,-.028,.241,.241,.39);
    flaps.push({joint:window,axis:'z',amp:.32,bias:0,seed:2.21});
  }else{
    mold(body,chassis,[[0,-.65,-.324,.068,.103],[0,-.463,-.258,.173,.232],
      [0,-.267,-.134,.253,.223],[0,.025,-.086,.34,.294],[0,.245,.016,.252,.229],[0,.432,.115,.087,.099]],true);
    mold(head,'mothRib',[[0,-.220,.052,.063,.079],[0,-.124,.124,.179,.141],
      [0,.038,.109,.238,.232],[0,.214,.024,.188,.180],[0,.301,-.123,.091,.086]],true);
    const curl=k.bone(head,0,-.146,.24);
    mold(curl,'widowBone',[[0,0,0,.026,.028],[-.011,-.077,.072,.031,.027],[.013,-.192,.158,.025,.022],
      [.048,-.250,.234,.019,.015],[.071,-.190,.267,.013,.012],[.071,-.121,.242,.003,.005]]);
    flaps.push({joint:curl,axis:'x',amp:.45,bias:.12,seed:1.31});
  }
  for(const side of sides){
    const orbit=glass?[[.012,.168,.241,.026,.023],[.095,.189,.262,.047,.029],
      [.188,.204,.223,.055,.032],[.223,.268,.119,.049,.037],[.144,.402,-.047,.021,.024],[.114,.465,-.065,.004,.006]]:
      [[.057,.092,.23,.037,.032],[.150,.133,.263,.062,.046],[.220,.072,.229,.071,.064],
        [.231,-.017,.180,.043,.049],[.195,-.107,.144,.010,.021]];
    mold(head,chassis,mirrored(side,orbit));
    vein(k,head,highlight,mirrored(side,orbit.map(([x,y,z,r])=>[x,y+.021,z+.028,r*.43])));
    k.mesh(head,glass?'gem':'round','glow',side*(glass?.105:.168),glass?.118:.067,glass?.291:.305,
      glass?.062:.043,glass?.024:.038,.025,0,side*.20,side*.05);
    for(let i=0;i<(mobile?4:6);i++){
      const y=.22-i*.098,z=-.224-i*.005;
      const t=.160+.090*Math.sin(i*2.01);
      const fins=mirrored(side,[[.064,y+.031,z,.026,.039],[.198,y-.01,z-.052,.073,.048],
        [.258+t*.39,y-.035,z-.117,.055,.035],[.31+t*.42,y-.095,z-.167,.004,.007]]);
      mold(body,i%3?chassis:highlight,fins,!glass);
      if(glass)vein(k,body,'windowGlass',fins.map(([x,y,z,r])=>[x,y+.022,z-.029,r*.24]));
    }
  }
}

export function sculptSporeStag(k,body,head,mobile,flaps){
  studioMaterial(k,'stagBark',0x344a3e,.10,.79,'hide');
  studioMaterial(k,'stagLichen',0x812f3a,.25,.64,'stone');
  studioMaterial(k,'stagSap',0x819e62,.20,.46,'gem');
  const mold=(joint,finish,path,seed=0)=>k.geometry(joint,finish,sculptVolume(path,{
    sides:mobile?9:13,rings:mobile?11:16,section:2.18,ridge:.31,seed,fur:true,
  }));
  mold(body,'stagBark',[[0,.038,-1.21,.255,.231],[0,.119,-.88,.380,.343],[0,.085,-.48,.401,.226],
    [0,.061,-.10,.289,.216],[0,.13,.213,.353,.316],[0,.27,.541,.354,.370],
    [0,.29,.755,.257,.304],[0,.357,.999,.178,.204]],6);
  mold(head,'stagBark',[[0,-.16,.230,.124,.105],[0,-.06,.215,.213,.185],[0,.081,.074,.238,.248],
    [0,.188,-.018,.223,.195],[0,.24,-.165,.146,.115]],2);
  for(const side of sides){
    const antler=mirrored(side,[[.112,.174,-.025,.050,.063],[.184,.293,-.116,.078,.064],
      [.313,.489,-.229,.060,.05],[.477,.754,-.340,.044,.031],[.458,.94,-.47,.004,.006]]);
    mold(head,'stagBark',antler,side);
    vein(k,head,'stagSap',antler.map(([x,y,z,r])=>[x,y+.026,z+.018,r*.30]));
    const jaw=mirrored(side,[[.066,-.10,.280,.036,.021],[.174,-.09,.263,.058,.041],
      [.228,-.049,.089,.061,.049],[.268,.044,-.038,.046,.032],[.282,.093,-.119,.005,.006]]);
    mold(head,'stagLichen',jaw,side);
    const count=mobile?5:7;
    for(let i=0;i<count;i++){
      const t=i/(count-1),z=.55-i*(mobile?.275:.187),y=.384+.083*Math.cos(i*.96);
      const w=.262+.098*Math.sin(t*Math.PI);
      const ribs=mirrored(side,[[.025,y+.037,z+.072,.063,.052],[w*.58,y-.025,z+.037,.098,.055],
        [w*.98,y-.168,z-.018,.083,.063],[w*1.12,y-.303,z+.018,.055,.047],
        [w*.83,y-.461,z-.062,.008,.006]]);
      mold(body,i%3===1?'stagLichen':'stagBark',ribs,i);
      vein(k,body,i%3===1?'stagSap':'stagLichen',ribs.map(([x,y,z,r])=>[x+side*.028,y+.020,z+.028,r*.22]));
      if(i%2===0){
        const pad=k.bone(body,side*w*1.056,y-.204,z-.035);
        pad.rotation.y=side*1.13;
        mold(pad,'deep',[[-.113,-.033,-.002,.022,.022],[0,.022,.016,.050,.052],[.10,-.028,-.006,.021,.021]]);
        k.mesh(pad,'gem','glow',0,.020,.065,.042,.029,.025);
      }
    }
    for(const [i,z] of [.532,.151,-.266,-.687].entries()){
      const y=.26+.053*Math.cos(i*.83),x=.275+.055*Math.sin(i*.81);
      const shell=k.bone(body,side*x,y,z);
      shell.name='森眼菌鹿 · 肩脊菌褶';
      const breadth=.29-i*.026,depth=.28+i*.018;
      k.geometry(shell,i%3===0?'stagLichen':'stagBark',closedSurface(mobile?8:12,mobile?11:16,(u,v,face)=>{
        const phi=(v-.5)*Math.PI*1.38,fall=u*u*.274,belly=Math.sin(Math.PI*u);
        const groove=Math.cos(v*83+u*16);
        const taper=.86+.08*Math.sin(v*19+i*.6)+.13*belly;
        const x=side*(.033+(.056+u*.151)*Math.cos(phi)*taper+(face?.009:-.009)+groove*.006);
        const y=.112+Math.sin(phi)*breadth*.60*(.47+u*.55)-fall+.018*groove*u;
        const z=-depth*u+.072*Math.sin(phi)+.096*belly-.034*Math.sin(v*14+i)*u**3;
        const line=.67+belly*.13+groove*.094-(face?.06:0);
        const rim=.11*Math.sin(v*Math.PI)*u;
        return {point:[x,y,z],pigment:[line+rim,line*(i===0?.80:.99),line*(i===0?.88:.91)]};
      },side<0));
      vein(k,shell,'stagSap',mirrored(side,[[.009,.146,.044,.018],[.077,.199,-.053,.025],
        [.148,.145,-.119,.020],[.173,-.018,-.198,.014],[.156,-.132,-.247,.005]]));
      for(let post=0;post<3;post++){
        const x=side*(.093+post*.028),y=.094-post*.045,z=-.091-post*.036;
        vein(k,shell,i%2?'stagSap':'stagLichen',[[x,y,z,.018],[x+side*.035,y-.023,z-.039,.023],
          [x+side*.042,y-.086,z-.041,.014],[x+side*.032,y-.120,z-.056,.004]],8);
      }
      flaps.push({joint:shell,axis:'z',amp:.105+i*.021,bias:side*.035,seed:side*.91+i*.64,stride:true});
    }
    const ligature=k.bone(body,side*.286,.206,.765);
    mold(ligature,'stagBark',mirrored(side,[[0,.022,-.021,.066,.042],[.074,-.093,.043,.068,.037],
      [.105,-.209,.107,.059,.027],[.056,-.315,.123,.038,.018],[.107,-.448,.207,.004,.005]]),side);
    flaps.push({joint:ligature,axis:'x',amp:.26,bias:side*.045,seed:4.28+side});
  }
}

export function sculptSporeLeg(k,{upper,shin,foot,side,hip,front},mobile,flaps){
  const s=x=>side*x;
  const fan=path=>mirrored(side,path);
  const bark=(joint,finish,path,seed)=>k.geometry(joint,finish,sculptVolume(path,
    {sides:mobile?9:13,rings:mobile?11:16,section:2.15,ridge:.28,fur:true,seed}));
  const knee=front?.147:-.111;
  bark(upper,'stagBark',fan([[0,.122,-.045,.136,.141],[.072,-.051,.010,.164,.168],
    [.116,-hip*.23,knee*.45,.143,.133],[.067,-hip*.40,knee*.82,.115,.101],
    [.041,-hip*.51,knee,.084,.091]]),front?4:9);
  bark(shin,'stagBark',fan([[.016,.052,.021,.103,.112],[.035,-hip*.15,.046,.111,.094],
    [.014,-hip*.34,.053,.072,.075],[.017,-hip*.49,.066,.067,.084]]),side+3);
  for(let i=0;i<(mobile?3:5);i++){
    const t=i/(mobile?2:4),x=.062+t*.116,y=.044-t*.078;
    const wood=fan([[x*.36,y+.073,-.101-t*.078,.032],[x,y-.028,-.061+.095*t,.069-t*.012],
      [x+.034,-hip*.232+t*.021,.021+t*.064,.054-t*.010],
      [x*.77,-hip*.41-t*.047,knee*.42+t*.117,.036],
      [x*.57,-hip*.55,knee*.62+t*.135,.006]]);
    bark(upper,i%3===1?'stagLichen':'stagBark',wood,i+side);
    vein(k,upper,i%2?'stagSap':'deep',wood.map(([x,h,z,r])=>[x+s(.018),h+.013,z+.028,r*.30]));
  }
  const frost=k.bone(shin,s(.049),-.072,.045);
  frost.name='森眼菌鹿 · 關節根鬚';
  const stem=fan([[0,.018,.070,.025],[.050,-.069,.091,.032],[.063,-.168,.097,.030],
    [.091,-.287,.109,.023],[.065,-hip*.405,.125,.003]]);
  bark(frost,'stagLichen',stem,14);
  vein(k,frost,'stagSap',stem.map(([x,y,z,r])=>[x+s(.017),y,z+.03,r*.57]));
  flaps.push({joint:frost,axis:'y',amp:.2,bias:side*.08,seed:side*.56+(front?1:3),stride:true});
  for(const toe of [-1,1]){
    const x=toe*.061;
    bark(foot,'deep',[[x*.55,.037,.050,.052,.066],[x,-.048,.087,.074,.073],
      [x*1.26,-.095,.182,.079,.060],[x*1.38,-.108,.284,.056,.034]],toe*3+side);
    vein(k,foot,'stagSap',[[x*.56,-.026,.120,.011],[x*1.06,-.051,.172,.014],
      [x*1.29,-.074,.227,.010],[x*1.36,-.092,.269,.003]]);
  }
}
