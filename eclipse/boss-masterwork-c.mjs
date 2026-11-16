import * as T from '../three.min.mjs';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';

const halves=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const line=(k,joint,finish,path,steps=12,sides=7)=>k.sculpt.sweep(joint,finish,path,{steps,sides,ridge:.16});
const eye=(k,joint,finish,x,y,z,w,h)=>k.mesh(joint,'gem',finish,x,y,z,w,h,.42*w);
const shell=(k,joint,finish,path,mobile,seed=0)=>k.geometry(joint,finish,sculptVolume(path,
  {sides:mobile?9:13,rings:mobile?11:16,section:2.34,ridge:.17,seed}));

function alloy(k,base,highlight,roughness){
  const material=k.materials[base];
  if(!material?.isMeshStandardMaterial)return;
  material.roughness=roughness;
  material.envMapIntensity*=.77;
  const pigment=new T.Color(highlight);
  material.color.lerp(pigment,.19);
}

// A saddle-shaped, capped scale with realistic curvature in two directions.
// Local x is outboard, y runs along the scale and +z is the raised face.
function scaleGeometry(length,width,depth,point,seed,mobile){
  const rows=mobile?8:11,columns=mobile?7:9;
  const xyz=[],uv=[],colors=[],indices=[];
  const layer=(rows+1)*(columns+1);
  for(let back=0;back<2;back++)for(let i=0;i<=rows;i++){
    const v=i/rows;
    for(let j=0;j<=columns;j++){
      const u=j/columns,d=u*2-1,edge=Math.abs(d);
      const widthAt=(.40+Math.sin(v*Math.PI*.96)*.61)*(1-(v*v)*point*.72);
      const channel=(1-edge*edge)**1.5*Math.sin(Math.PI*(.11+v*.80));
      const damage=Math.cos(j*2.17+seed)*Math.sin(i*1.29-seed)*.019;
      const x=d*width*widthAt+length*.12*v*v;
      const y=length*(.63-v)-edge*edge*length*.16+damage*length;
      const z=back===0?depth*(.29+channel*.89-edge*.22)+damage*depth:depth*(-.17+channel*.25);
      xyz.push(x,y,z);uv.push(u,v);
      const burn=.61+.22*channel+.28*edge**4+.09*Math.sin(v*8.4+seed)+.072*Math.cos(v*58+j*.9);
      colors.push(burn,burn*.97,burn*.92);
      if(i&&j){
        const a=back*layer+i*(columns+1)+j,b=a-columns-1;
        if(!back)indices.push(b-1,a-1,b,b,a-1,a);
        else indices.push(b-1,b,a-1,b,a,a-1);
      }
    }
  }
  for(let i=0;i<rows;i++)for(const j of [0,columns]){
    const a=i*(columns+1)+j,b=a+columns+1;
    if(j===0)indices.push(a,a+layer,b,b,a+layer,b+layer);
    else indices.push(a,b,a+layer,b,b+layer,a+layer);
  }
  for(let j=0;j<columns;j++)for(const i of [0,rows]){
    const a=i*(columns+1)+j,b=a+1;
    if(i===rows)indices.push(a,a+layer,b,b,a+layer,b+layer);
    else indices.push(a,b,a+layer,b,b+layer,a+layer);
  }
  const geometry=new T.BufferGeometry().setIndex(indices);
  geometry.setAttribute('position',new T.Float32BufferAttribute(xyz,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  return geometry;
}

function armorScale(k,parent,finish,pitch,{point=.65,seed=0,rotation=[0,0,0],at},mobile){
  const part=k.bone(parent,...at);
  part.rotation.set(...rotation);
  k.geometry(part,finish,scaleGeometry(...pitch,point,seed,mobile));
  return part;
}

function linkedPose(parts,callback){
  const before=parts.cataloguePose;
  parts.cataloguePose=context=>{
    before?.(context);
    callback(context);
  };
}

const rulers={
  // shoulder, breast, back, sculpted emblem and individually colored inlay
  m135:{styles:['rind','edge','identityMetal'],face:'ice',at:[.204,1.40,-.032],stern:[.25,1.19,.311],back:[.285,1.16,-.33],ornament:[.19,.189,.12],pitch:[.28,.166,.087],color:0x79a5b6,rough:.45},
  m137:{styles:['rind','trim','identityMetal'],face:'flame',at:[.255,1.40,.008],stern:[.31,1.18,.370],back:[.32,1.17,-.35],ornament:[.19,.207,.111],pitch:[.31,.152,.104],color:0x983c2c,rough:.50},
  m139:{styles:['rind','edge','identityMetal'],face:'arrow',at:[.295,1.41,.011],stern:[.344,1.20,.313],back:[.379,1.17,-.392],ornament:[.181,.192,.109],pitch:[.319,.16,.102],color:0x4d6973,rough:.53},
  m141:{styles:['rind','trim','identityMetal'],face:'kirtimukha',at:[.293,1.39,.024],stern:[.370,1.18,.431],back:[.421,1.16,-.48],ornament:[.215,.196,.131],pitch:[.35,.178,.119],color:0x6c2633,rough:.56},
  m142:{styles:['rind','ember','identityMetal'],face:'blight',at:[.311,1.40,.014],stern:[.32,1.13,.310],back:[.422,1.16,-.341],ornament:[.191,.19,.122],pitch:[.34,.181,.091],color:0x80773f,rough:.67},
  m143:{styles:['deep','edge','rind'],face:'jaw',at:[.341,1.41,.024],stern:[.42,1.23,.400],back:[.408,1.12,-.397],ornament:[.213,.208,.141],pitch:[.341,.187,.132],color:0x4b4644,rough:.64},
  m146:{styles:['rind','edge','identityMetal'],face:'moth',at:[.227,1.39,.022],stern:[.28,1.19,.31],back:[.32,1.11,-.36],ornament:[.170,.192,.131],pitch:[.282,.197,.086],color:0x536083,rough:.46},
  m147:{styles:['rind','trim','identityMetal'],face:'wind',at:[.280,1.39,.010],stern:[.379,1.17,.336],back:[.411,1.13,-.38],ornament:[.208,.199,.131],pitch:[.336,.17,.119],color:0x686853,rough:.54},
  'raid-flame':{styles:['rind','ember','deep'],face:'slag',at:[.373,1.4,.014],stern:[.454,1.20,.372],back:[.461,1.18,-.43],ornament:[.218,.229,.147],pitch:[.371,.19,.136],color:0x604136,rough:.70},
};

function hat(k,head,spec,mobile){
  const [w,y,z]=spec.ornament,[metal,inlay]=spec.styles;
  const winged=['wind','moth','ice'].includes(spec.face),pointed=['flame','arrow','slag'].includes(spec.face);
  const [length,reach]=winged?[.21,.18]:pointed?[.26,.13]:[.14,.087];
  for(const side of halves){
    const crest=mirror(side,[[w*.62,y-.055,z,.031,.023],[w*.99,y+.026,z-.048,.047,.037],
      [w+reach*.43,y+length*.38,z-.157,.068,.030],[w+reach*.89,y+length*.71,z-.240,.044,.021],
      [w+reach,y+length,z-.39,.005,.003]]);
    shell(k,head,metal,crest,mobile,side);
    line(k,head,inlay,crest.map(([x,y,z,r],i)=>[x+side*.018,y+.024,z+.034,r*(i===2?.29:.20)]),12);
    const ear=armorScale(k,head,spec.styles[2],[.204,w*.39,.037],
      {at:[side*w*.91,.043,-.14],rotation:[.22,side*-1.17,side*-.36],point:.77,seed:side},mobile);
    eye(k,ear,inlay,0,.032,.052,.014,.022);
  }
  if(spec.face==='kirtimukha'||spec.face==='jaw'||spec.face==='blight'){
    for(const side of halves){
      const teeth=mirror(side,[[.072,-.171,.257,.027,.035],[.121,-.214,.267,.040,.039],
        [.173,-.208,.259,.026,.025],[.195,-.14,.217,.006,.008]]);
      shell(k,head,'edge',teeth,mobile);
    }
  }
}

function sovereign(k,parts,spec,mobile){
  const {head,body}=parts,{styles:[metal,inlay,leather],at:[sx,sy,sz],stern:[cx,cy,cz],back:[bx,by,bz],pitch}=spec;
  alloy(k,metal,spec.color,spec.rough);
  hat(k,head,spec,mobile);
  const pauldrons=[];
  const compact=spec.face==='ice'||spec.face==='moth';
  for(const side of halves){
    const follower=body.children.reduce((near,child)=>Math.abs(child.position.x-side*sx)<.102
      &&Math.abs(child.position.y-sy)<.052&&Math.abs(child.position.z)<.12?(near??child):near,null);
    const armor=k.bone(body,side*(sx+.065),sy+.046,sz-.041);
    pauldrons.push({armor,side,follower});
    for(let row=0;row<3;row++){
      const shoulder=armorScale(k,armor,row===0?metal:leather,
        [pitch[0]*(1-row*.13),pitch[1]*(1-row*.16),pitch[2]*(1-row*.15)],
        {at:[side*(.09+row*.04),-.035-row*.077,.064-row*.049],
          rotation:[-.35-row*.13,side*(.48+row*.20),side*(.50+row*.26)],point:compact?.85:.60,seed:row+side},mobile);
      line(k,shoulder,inlay,[[.024,pitch[0]*.42,.044],[.059,pitch[0]*.16,pitch[2]*.90],
        [.057,-pitch[0]*.12,pitch[2]*1.01],[.030,-pitch[0]*.32,pitch[2]*.40]],7,5);
    }
    const front = armorScale(k,body,metal,[pitch[0]*.83,cx*.36,pitch[2]*.59],
      {at:[side*(cx*.61),cy+.021,cz],rotation:[.12,side*.30,side*.48],point:.88,seed:side*2},mobile);
    const rear = armorScale(k,body,leather,[pitch[0]*1.3,bx*.30,pitch[2]*.48],
      {at:[side*bx*.62,by,bz],rotation:[-.13,Math.PI+side*.28,side*.41],point:.92,seed:side*4},mobile);
    for(const panel of [front,rear]){
      eye(k,panel,inlay,-.026,pitch[0]*.29,pitch[2]*.52,.017,.022);
      line(k,panel,inlay,[[0,pitch[0]*.27,pitch[2]*.62,.012],[.042,pitch[0]*.14,pitch[2]*.77,.013],
        [.049,0,pitch[2]*.92,.014],[.012,-pitch[0]*.19,pitch[2]*.70,.010],[.038,-pitch[0]*.36,pitch[2]*.34,.003]],13);
    }
  }
  const keystone=armorScale(k,body,metal,[pitch[0]*.91,cx*.41,pitch[2]*.78],
    {at:[0,cy+.068,cz+.028],rotation:[.05,0,0],point:.91,seed:2},mobile);
  for(const side of halves){
    const horn=mirror(side,[[.014,-.052,.067,.012],[.080,-.006,.079,.029],[.109,.036,.052,.026],
      [.101,.119,.044,.014],[.067,.168,.041,.003]]);
    line(k,keystone,inlay,horn,11);
  }
  eye(k,keystone,'glow',0,.035,pitch[2]*1.10,.041,.052);
  linkedPose(parts,({beat,wind,strike,travel,fall})=>{
    for(const {armor,side,follower} of pauldrons){
      armor.rotation.x=(follower?.rotation.x??0)*.39+wind*.10-strike*.13+fall*.15;
      armor.rotation.y=side*(wind*.105+strike*.14);
      armor.rotation.z=side*(Math.sin(beat*1.03)*travel*.044+wind*.14-strike*.16);
    }
  });
}

const serpents={
  m126:{mat:['rind','trim','edge'],face:[.14,.10,.26],spine:[[.04,1.30,.23],[.063,1.08,.24],[.11,.82,.245]],
    profile:[.22,.065,.06],angle:.70,pigment:0x603137,rough:.62,type:'crest'},
  m138:{mat:['rind','trim','edge'],face:[.209,.128,.30],spine:[[.21,1.69,.103],[.52,1.37,.06],[.67,1.05,.04]],
    profile:[.308,.10,.074],angle:1.01,pigment:0x285758,rough:.45,type:'gill'},
  m152:{mat:['rind','edge','ember'],face:[.305,.10,.403],spine:[[.082,.804,.40],[.029,.773,.028],[.062,.745,-.36]],
    profile:[.36,.126,.090],angle:1.39,pigment:0x223e52,rough:.53,type:'scale'},
};

function serpent(k,parts,spec,mobile){
  const {head,body}=parts,[primary,rim,bone]=spec.mat,[w,h,z]=spec.face;
  alloy(k,primary,spec.pigment,spec.rough);
  const anchor=spec.type==='scale'?body:head.parent;
  for(const side of halves){
    const skull=mirror(side,[[w*.78,h-.12,z,.030,.033],[w*.98,h-.08,z-.12,.051,.042],
      [w*1.13,h+.009,z-.235,.059,.049],[w*1.05,h+.083,z-.336,.043,.031],[w*.99,h+.106,z-.39,.005,.007]]);
    shell(k,head,primary,skull,mobile,side);
    line(k,head,rim,skull.map(([x,y,z,w])=>[x+side*.029,y+.026,z+.021,w*.27]),12);
    if(spec.type==='gill')for(let i=0;i<(mobile?3:4);i++){
      const x=w*(i*.22+1.13),y=h-i*.054;
      const strand=mirror(side,[[x,y,z-.192,.012,.018],[x+.108,y-.072,z-.24,.030,.023],
        [x+.205,y-.091,z-.39,.028,.016],[x+.319,y-.079,z-.56,.004,.009]]);
      shell(k,head,bone,strand,mobile,i);
    }
    for(const [i,[x,y,z]] of spec.spine.entries()){
      const off=spec.profile[1]*(.70+i*.073);
      const scale=armorScale(k,anchor,i%2?rim:primary,spec.profile,
        {at:[x+side*off,y,z],rotation:[.52-i*.093,Math.PI+side*spec.angle,side*(-.54+i*.11)],point:.72,seed:i+side},mobile);
      line(k,scale,i===1?'glow':rim,[[.019,.10,.029,.004],[.051,.034,.073,.012],
        [.047,-.058,.059,.008],[.020,-.12,.042,.003]],9);
    }
  }
}

const flyers={
  m127:{palette:['rind','trim','hide'],w:.186,h:.13,z:.270,spine:[.13,.87,-.31],armor:[.22,.115,.040],style:'struck',color:0x74513d,finish:.57},
  m128:{palette:['rind','edge','hide'],w:.306,h:.096,z:.446,spine:[.20,.70,-.43],armor:[.286,.127,.060],style:'bat',color:0x623e51,finish:.58},
  m131:{palette:['rind','edge','ember'],w:.275,h:.102,z:.349,spine:[.223,.71,-.39],armor:[.245,.116,.052],style:'stream',color:0x3d7490,finish:.48},
  m136:{palette:['rind','ember','plume'],w:.128,h:.101,z:.244,spine:[.24,.35,-.29],armor:[.283,.100,.043],style:'vermilion',color:0x874a41,finish:.54},
  m148:{palette:['rind','edge','brocade'],w:.20,h:.092,z:.302,spine:[.229,.24,-.352],armor:[.29,.113,.046],style:'owl',color:0x374c60,finish:.51},
  m151:{palette:['rind','trim','brocade'],w:.196,h:.074,z:.137,spine:[.223,.19,-.21],armor:[.22,.104,.052],style:'wasp',color:0x5e6537,finish:.59},
  'raid-wyvern':{palette:['rind','trim','hide'],w:.258,h:.087,z:.329,spine:[.18,.64,-.37],armor:[.276,.107,.049],style:'dunes',color:0x89643a,finish:.62},
};

function flightArmor(k,parts,spec,mobile){
  const {body,head}=parts,{palette:[base,rim,soft],w,h,z,spine:[sx,sy,sz],armor,style}=spec;
  alloy(k,base,spec.color,spec.finish);
  const feathered=style==='vermilion'||style==='owl';
  const wasp=style==='wasp';
  const count=mobile?3:4;
  for(const side of halves){
    const cheek=mirror(side,[[w*.46,h-.063,z-.012,.026,.018],[w*.76,h-.084,z-.075,.055,.037],
      [w*1.12,h-.028,z-.19,.059,.046],[w*1.17,h+.047,z-.306,.043,.043],
      [w*1.05,h+.093,z-.392,.009,.006]]);
    shell(k,head,feathered?soft:base,cheek,mobile,side);
    if(!feathered){
      const hooked=mirror(side,[[w*.52,h+.064,z+.034,.012],[w*.83,h+.092,z-.02,.025],
        [w*1.13,h+.115,z-.154,.036],[w*1.25,h+.085,z-.267,.014],[w*1.32,h+.056,z-.333,.003]]);
      line(k,head,rim,hooked,13);
    }
    for(let i=0;i<count;i++){
      const t=i/(count-1),x=side*(sx+.036+t*.065),y=sy-t*.19,Z=sz+t*.48;
      const plate=armorScale(k,body,i===1?soft:base,armor,
        {at:[x,y,Z],rotation:[-1.10,side*(.72+t*.34),side*(.31+t*.18)],point:wasp?.46:.78,seed:i+side*2},mobile);
      line(k,plate,rim,[[.029,armor[0]*.40,.039],[.053,armor[0]*.16,armor[2]*.94],
        [.053,-armor[0]*.096,armor[2]],[.035,-armor[0]*.32,armor[2]*.46]],8,5);
    }
    if(parts.webs){
      const {vertices,shoulder}=parts.webs.find(wing=>wing.side===side);
      const [basePoint,second,join,tip]=vertices;
      shell(k,shoulder,base,[[...basePoint,.077,.065],
        [second[0],second[1]+.038,second[2]+.035,.065,.074],
        [join[0],join[1]+.045,join[2]+.024,.059,.074],
        [tip[0]*.84+join[0]*.16,tip[1]+.053,tip[2]-.008,.039,.045],
        [tip[0],tip[1]+.025,tip[2],.005,.006]],mobile,side);
      const broken=style==='struck';
      const talon=[[join[0]+side*.01,join[1]+.01,join[2],.05],
        [join[0]+side*.12,join[1]+.16,join[2]-.07,.052],
        [join[0]+side*(broken?.15:.28),join[1]+(broken?.23:.25),join[2]-.13,.032],
        [join[0]+side*(broken?.188:.28),join[1]+(broken?.28:.31),join[2]-.25,.002]];
      line(k,shoulder,rim,talon,14);
    }else if(feathered){
      for(let i=0;i<count;i++){
        const y=h+i*.022,x=side*(w*.62+i*.029),Z=z-.17-i*.028;
        const path=[[x,y,Z],[x+side*.087,y+.124,Z-.115],[x+side*.11,y+.155,Z-.279-i*.02]];
        k.geometry(head,i%3?soft:rim,featherVane(...path,.046+(i%2)*.018,side+i,mobile?8:12));
      }
    }
  }
}

const grounded={
  m129:{mat:['rind','edge','hide'],nose:[.222,.113,.305],zone:[.429,.337,-.06],pitch:[.265,.105,.063],motion:'antler',pigment:0x9f6f37,rough:.53},
  m130:{mat:['rind','trim','silk'],nose:[.226,.095,.317],zone:[.467,.303,-.49],pitch:[.289,.116,.064],motion:'harness',pigment:0x35697d,rough:.51},
  m132:{mat:['rind','ember','hide'],nose:[.353,.114,.282],zone:[.573,.365,-.067],pitch:[.304,.130,.078],motion:'furnace',pigment:0x703025,rough:.68},
  m134:{mat:['rind','edge','hide'],nose:[0,0,0],zone:[.43,.28,-.48],pitch:[.364,.186,.114],motion:'ice',pigment:0x517f95,rough:.48},
  m144:{mat:['rind','ember','hide'],nose:[.333,.144,.365],zone:[.588,.379,-.178],pitch:[.339,.149,.107],motion:'basalt',pigment:0x533932,rough:.71},
  m145:{mat:['rind','trim','hide'],nose:[.325,.122,.268],zone:[.568,.372,-.14],pitch:[.309,.133,.073],motion:'sinus',pigment:0x584b3c,rough:.61},
  m149:{mat:['rind','edge','hide'],nose:[.269,.139,.358],zone:[.487,.37,-.10],pitch:[.301,.139,.055],motion:'current',pigment:0x3f6771,rough:.51},
  m150:{mat:['burntShell','royalShell','copper'],nose:[.33,.105,.369],zone:[.834,.56,-.47],pitch:[.394,.191,.110],motion:'shell',pigment:0x5b432e,rough:.58},
  m154:{mat:['iron','trim','edge'],nose:[.369,.085,.44],zone:[.644,.56,-.37],pitch:[.347,.152,.089],motion:'yoke',pigment:0x3e3029,rough:.61},
  m157:{mat:['rind','edge','hide'],nose:[.220,.057,.180],zone:[.516,.402,-.29],pitch:[.313,.152,.069],motion:'primate',pigment:0x623a3c,rough:.63},
  m158:{mat:['body','edge','copper'],nose:[.253,.071,.214],zone:[.543,.710,-.31],pitch:[.337,.174,.069],motion:'shag',pigment:0x8396a0,rough:.72},
};

function quadruped(k,parts,spec,mobile){
  const {head,body}=parts,{mat:[stone,edge,back],nose:[w,h,z],zone:[sx,sy,sz],pitch,motion}=spec;
  alloy(k,stone,spec.pigment,spec.rough);
  const fortified=motion==='ice'||motion==='shell'||motion==='yoke';
  const fur=['primate','shag','current'].includes(motion);
  const hot=motion==='furnace'||motion==='basalt';
  if(hot){
    alloy(k,back,0x564441,.76);
    alloy(k,edge,0xbc511d,.54);
    k.materials[back].metalness=.12;
  }
  const hinges=[];
  for(const side of halves){
    if(head){
      const skull=mirror(side,[[w*.64,h+.019,z+.014,.021,.027],[w*.94,h+.070,z-.065,.056,.044],
        [w*1.17,h+.066,z-.166,.067,.054],[w*1.19,h+.008,z-.270,.053,.048],
        [w*.97,h-.063,z-.369,.008,.012]]);
      shell(k,head,fur?back:stone,skull,mobile,side);
      if(fur)for(let strand=0;strand<(mobile?3:5);strand++){
        const root=w*.69+strand*.036,S=Math.sin(strand*.7);
        const hair=mirror(side,[[root,h-.051-strand*.022,z-.10,.024],[root+.039,h-.095-strand*.023,z-.200,.033],
          [root+.091,h-.093-strand*.032,z-.322-.017*S,.029],[root+.13,h-.151-strand*.033,z-.395-.032*S,.003]]);
        line(k,head,strand%2?edge:back,hair,10,6);
      }else{
        line(k,head,edge,skull.map(([x,y,z,r])=>[x+side*.021,y+.015,z+.027,r*.24]),12);
        if(hot||fortified){
          const ridge=mirror(side,[[w*.38,h-.06,z+.057,.012],[w*.62,h-.091,z+.050,.031],
            [w*.84,h-.103,z-.021,.043],[w*1.02,h-.153,z-.099,.024],[w*1.06,h-.202,z-.18,.004]]);
          line(k,head,hot?'deep':edge,ridge,13);
        }
      }
    }
    const plateCount=mobile?3:4;
    for(let i=0;i<plateCount;i++){
      const t=i/(plateCount-1),x=side*(sx-(fortified?.18:.099)*t),y=sy-(fortified?.039:.057)*t,z=sz-.44*t;
      const scale=armorScale(k,body,i===2?back:stone,
        [pitch[0]*(1-t*.3),pitch[1]*(1-t*.15),pitch[2]*(1-t*.15)],
        {at:[x,y,z],rotation:[-1.04+t*.17,side*(.94+t*.19),side*(.36-t*.11)],point:fortified?.51:.84,seed:side+i},mobile);
      line(k,scale,edge,[[.014,pitch[0]*.35,.037],[.056,pitch[0]*.13,pitch[2]*.84],
        [.040,-pitch[0]*.04,pitch[2]*.87],[.035,-pitch[0]*.21,pitch[2]*.50],[.025,-pitch[0]*.39,.027]],9,6);
      if(i<2)hinges.push({scale,side,i,base:scale.rotation.x});
      if(hot){
        line(k,scale,'deep',[[.030,pitch[0]*.14,pitch[2]*.93,.009],
          [.044,pitch[0]*.02,pitch[2]*1.11,.017],[.065,-pitch[0]*.15,pitch[2]*.85,.009]],8,6);
        line(k,scale,'glow',[[.034,pitch[0]*.123,pitch[2]*1.0,.003],
          [.043,pitch[0]*.028,pitch[2]*1.18,.007],[.066,-pitch[0]*.13,pitch[2]*.96,.002]],8,5);
      }
    }
    if(fortified){
      const fluke=mirror(side,[[sx*.51,sy*.89,sz-.37,.031,.038],[sx*.78,sy+.018,sz-.49,.055,.051],
        [sx*.97,sy+.092,sz-.62,.042,.039],[sx*1.12,sy+.147,sz-.78,.005,.003]]);
      shell(k,body,back,fluke,mobile,side);
      line(k,body,edge,fluke.map(([x,y,z,r])=>[x,y+.039,z,r*.43]),12);
    }
  }
  linkedPose(parts,({beat,wind,strike,stage,travel})=>{
    for(const {scale,side,i,base} of hinges){
      scale.rotation.x=base+wind*.10-strike*.11+stage*.05+Math.sin(beat*.86+i+side)*travel*.078;
    }
  });
}

function jade(k,{head,body},mobile){
  for(const side of halves){
    const collar=mirror(side,[[.024,.81,.354,.018,.025],[.124,.822,.359,.035,.041],[.229,.846,.314,.044,.043],
      [.311,.851,.229,.035,.027],[.378,.811,.164,.007,.006]]);
    shell(k,body,'blueSteel',collar,mobile,side);
    line(k,body,'goldWear',collar.map(([x,y,z,r])=>[x,y+.025,z+.033,r*.39]),12);
    const nape=armorScale(k,head,'blueSteel',[.239,.068,.042],
      {at:[side*.137,.052,-.265],rotation:[-.29,Math.PI+side*.49,side*.43],point:.76,seed:side},mobile);
    line(k,nape,'goldWear',[[.014,.113,.026],[.034,.056,.05],[.031,-.03,.051],[.017,-.072,.038]],9);
  }
}

function reaper(k,parts,mobile){
  if(parts.shadowSculpt)return;
  const {head,body}=parts,hood=k.bone(head,0,.11,-.12);
  for(const side of halves){
    const shroud=mirror(side,[[.026,.23,-.077,.022,.039],[.102,.332,-.159,.060,.061],
      [.179,.27,-.215,.062,.054],[.248,.106,-.18,.053,.047],[.242,-.03,-.098,.035,.033],
      [.174,-.145,.057,.009,.011]]);
    shell(k,hood,'deep',shroud,mobile,side);
    line(k,hood,'rind',shroud.map(([x,y,z,r])=>[x+side*.025,y-.008,z+.033,r*.34]),13);
    const mantle=armorScale(k,body,'rind',[.27,.083,.056],
      {at:[side*.326,.62,-.397],rotation:[-.51,Math.PI+side*.73,side*.88],point:1.06,seed:side},mobile);
    line(k,mantle,'edge',[[.012,.125,.031],[.035,.053,.058],[.042,-.051,.067],[.028,-.097,.043]],9);
    for(let i=0;i<(mobile?3:5);i++){
      const s=i*.11,x=.092+s,y=.58-s*.36,z=-.451-s*.27;
      const a=mirror(side,[[x,y,z,.017],[x+.072,y+.046,z-.072,.032],
        [x+.147,y+.103,z-.17,.024],[x+.207,y+.11,z-.238,.003]]);
      line(k,body,i===1?'edge':'deep',a,12);
    }
  }
  linkedPose(parts,({beat,wind,strike})=>{
    hood.rotation.x=wind*.12-strike*.17;
    hood.rotation.y=Math.sin(beat*.69)*.061;
  });
}

function egg(k,parts,mobile){
  const {body}=parts,pieces=[];
  for(const side of halves){
    for(let i=0;i<(mobile?3:4);i++){
      const a=.57+i*.58;
      const x=side*Math.sin(a)*.68,z=-.135-Math.cos(a)*.66,y=.075+i*.104;
      const part=armorScale(k,body,i%2?'shellIvory':'shellScar',[.209+i*.031,.095+i*.006,.049],
        {at:[x,y,z],rotation:[-.16+i*.15,Math.PI+side*-a*.8,side*(-.25+i*.18)],point:.94,seed:side*i+3},mobile);
      line(k,part,'shellIvory',[[.009,.106,.023],[.045,.041,.048],[.022,.007,.056],[.042,-.046,.046],
        [.014,-.092,.022]],9);
      if(i===1){
        line(k,part,'glow',[[.044,.041,.049],[.022,.007,.058],[.042,-.046,.052]],8,5);
        pieces.push({part,side,yaw:part.rotation.y});
      }
    }
    const mouth=mirror(side,[[.125,-.398,.574,.016],[.212,-.422,.592,.031],[.323,-.356,.552,.042],
      [.401,-.302,.476,.026],[.427,-.235,.413,.006]]);
    line(k,body,'redBinding',mouth,12);
  }
  linkedPose(parts,({beat,wind,strike,stage})=>{
    for(const {part,side,yaw} of pieces)part.rotation.y=yaw+side*(Math.sin(beat*.8)*.041+wind*.08+strike*.12+stage*.12);
  });
}

function straw(k,{head,body},mobile){
  const anchors=[[-.20,.11,.153],[-.30,.17,.07],[-.27,.109,-.12],[-.19,.049,-.25]];
  for(const side of halves){
    for(const [i,[x,y,z]] of anchors.entries()){
      const strand=[[side*x,y,z,.019],[side*(x-.035),y-.185,z-.038,.026],
        [side*(x-.026),y-.344-i*.018,z-.079,.023],[side*(x+.037),y-.417-i*.03,z-.115,.003]];
      line(k,head,i%2?'edge':'body',strand,12,6);
    }
    for(let i=0;i<(mobile?3:5);i++){
      const y=.385-i*.102,Z=-.64-(i%2)*.045;
      const twig=mirror(side,[[.11,y+.07,Z+.018,.021],[.271,y+.052,Z-.06,.037],
        [.395,y-.01,Z-.091,.04],[.482,y-.075,Z-.041,.033],[.511,y-.161,Z+.011,.005]]);
      shell(k,body,i%2?'brocade':'body',twig,mobile,i+side);
      line(k,body,i%3?'edge':'deep',twig.map(([x,y,z,r])=>[x,y+.007,z-.034,r*.31]),9,6);
    }
  }
}

const mounted={
  'trial-jing-light':{mat:['body','trim'],tone:0x887166,width:.21,reach:.32,rise:.38,theme:'temple'},
  'trial-jing-dark':{mat:['deep','edge'],tone:0x46313a,width:.24,reach:.32,rise:.26,theme:'barb'},
  'trial-shang-light':{mat:['edge','trim'],tone:0x718799,width:.25,reach:.26,rise:.33,theme:'moon'},
  'trial-shang-dark':{mat:['body','edge'],tone:0x49495f,width:.21,reach:.31,rise:.45,theme:'shade'},
  'trial-kai-light':{mat:['body','edge'],tone:0x708268,width:.24,reach:.32,rise:.22,theme:'winds'},
  'trial-kai-dark':{mat:['deep','edge'],tone:0x394635,width:.26,reach:.36,rise:.31,theme:'fang'},
};

function mandrillMuzzle(k,head,mobile){
  const jaw=head.children.find(joint=>joint.isGroup&&Math.abs(joint.position.y+.151)<.002
    &&Math.abs(joint.position.z-.131)<.002);
  for(const side of halves){
    const muzzle=mirror(side,[[.023,.045,.215,.027,.025],[.058,-.021,.256,.050,.043],
      [.078,-.078,.276,.058,.047],[.097,-.121,.220,.048,.034],[.121,-.15,.196,.009,.010]]);
    shell(k,head,'rind',muzzle,mobile,side+1);
    line(k,head,'deep',mirror(side,[[.022,-.079,.285,.010],[.064,-.085,.301,.020],
      [.087,-.103,.295,.016],[.083,-.119,.267,.003]]),11,6);
    if(jaw){
      const outside=mirror(side,[[.057,-.073,.110,.028,.022],[.113,-.05,.124,.043,.031],
        [.155,-.005,.066,.038,.033],[.159,.041,-.041,.009,.012]]);
      shell(k,jaw,'rind',outside,mobile,side+8);
      const fang=mirror(side,[[.091,.012,.138,.026,.020],[.108,.044,.155,.024,.018],
        [.107,.083,.161,.018,.012],[.091,.127,.154,.004,.003]]);
      shell(k,jaw,'edge',fang,mobile,side+3);
    }
  }
}

function rider(k,parts,spec,mobile){
  const {body,head,mount:{helm,knight}}=parts,{mat:[base,edge],tone,width,reach,rise,theme}=spec;
  alloy(k,base,tone,theme==='moon'?.48:.59);
  for(const side of halves){
    const bent=theme==='moon'||theme==='winds';
    const crown=mirror(side,[[width*.70,.23,.074,.034,.028],[width,.31,-.012,.061,.031],
      [width+reach*.38,.35+rise*.43,-.115,.066,.025],[width+reach*.69,.32+rise*.71,-.224,.041,.017],
      [width+reach*(bent?.57:.76),.29+rise,-.323,.004,.006]]);
    shell(k,helm,base,crown,mobile,side);
    line(k,helm,edge,crown.map(([x,y,z,r])=>[x,y+.031,z+.019,r*.37]),12);
    for(let i=0;i<(mobile?2:3);i++){
      const armor=armorScale(k,knight,i===1?edge:base,[.224,width*.35,.065],
        {at:[side*(.173+.023*i),.68-i*.14,-.269-i*.046],
          rotation:[-.33,Math.PI+side*.52,side*.59],point:.94,seed:i+side},mobile);
      line(k,armor,edge,[[.022,.10,.03],[.046,.034,.061],[.034,-.04,.069],[.022,-.1,.033]],9);
    }
    const brow=mirror(side,[[.078,.35,.38,.026,.017],[.19,.342,.347,.066,.045],[.29,.261,.291,.063,.036],
      [.321,.130,.253,.044,.04],[.319,-.024,.229,.009,.012]]);
    shell(k,head,base,brow,mobile,side);
    line(k,head,edge,brow.map(([x,y,z,r])=>[x+side*.019,y+.029,z+.034,r*.34]),11);
    const flank=armorScale(k,body,base,[.31,reach*.40,.074],
      {at:[side*.68,.32,-.54],rotation:[-.43,side*1.48,side*.36],point:.65,seed:side+2},mobile);
    eye(k,flank,'glow',.03,.034,.077,.034,.036);
  }
}

export function masterworkC(k,parts,{id},mobile){
  if(Object.hasOwn(rulers,id))sovereign(k,parts,rulers[id],mobile);
  else if(Object.hasOwn(serpents,id))serpent(k,parts,serpents[id],mobile);
  else if(Object.hasOwn(flyers,id))flightArmor(k,parts,flyers[id],mobile);
  else if(parts.snowTiger||parts.windTaowu||parts.desertKirin||parts.asuraCarved)return true;
  else if(id==='m157'){
    quadruped(k,parts,grounded[id],mobile);
    mandrillMuzzle(k,parts.head,mobile);
  }
  else if(Object.hasOwn(grounded,id))quadruped(k,parts,grounded[id],mobile);
  else if(Object.hasOwn(mounted,id))rider(k,parts,mounted[id],mobile);
  else if(id==='m133')jade(k,parts,mobile);
  else if(id==='m153')reaper(k,parts,mobile);
  else if(id==='m155')egg(k,parts,mobile);
  else if(id==='m156')straw(k,parts,mobile);
  else return false;
  return true;
}
