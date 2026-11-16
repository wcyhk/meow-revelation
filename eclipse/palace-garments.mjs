import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const fabrics={
  m075:{
    cloth:'bShadow',facing:'bCloth',weave:[.93,.25,.17],crest:'Cinder spirit riding mantle',
    front:[[.111,-.031,.257,.134],[.165,-.269,.324,.192],[.198,-.698,.417,.134],[.278,-1.218,.38,.087]],
    back:[[.186,.52,-.23,.126],[.30,.181,-.365,.21],[.63,-.327,-.527,.226],[.96,-.827,-.645,.036]],
    stay:[[.217,.413,-.22,.104],[.34,.119,-.404,.152],[.62,-.476,-.557,.152],[1.135,-.993,-.58,.016]],
    shape:[.080,.077,.45,1.03],hem:[.18,.94,.51,.68,.033],flex:1.33,sideDrift:.14,
  },
  m076:{
    cloth:'bShadow',facing:'bCloth',weave:[1,.81,.30],crest:'Gilt lightning split skirt',
    front:[[.12,.045,.308,.162],[.222,-.247,.42,.211],[.346,-.718,.504,.229],[.41,-1.243,.474,.129]],
    back:[[.209,.59,-.26,.148],[.288,.251,-.386,.217],[.368,-.361,-.458,.264],[.55,-1.168,-.591,.131]],
    stay:[[.207,.325,-.158,.075],[.346,-.095,-.292,.161],[.533,-.575,-.412,.199],[.664,-1.029,-.434,.09]],
    shape:[.084,.068,.49,1.16],hem:[.21,.65,.94,.6,.29],flex:.71,sideDrift:.08,edging:'bTrim',
  },
  m079:{
    cloth:'bCloth',facing:'bShadow',weave:[.24,1,.75],crest:'Wind spirit priest train',
    front:[[.085,.05,.215,.096],[.108,-.266,.282,.136],[.176,-.677,.319,.192],[.292,-1.291,.373,.128]],
    back:[[.126,.479,-.24,.097],[.201,.08,-.375,.193],[.329,-.375,-.612,.294],[.657,-1.217,-.76,.266]],
    stay:[[.191,.315,-.15,.045],[.290,.056,-.194,.077],[.498,-.356,-.279,.126],[.678,-.764,-.524,.033]],
    shape:[.054,.066,.42,.73],hem:[.51,.86,.03,.71,.22],flex:1.58,sideDrift:.16,
  },
  m080:{
    cloth:'bCloth',facing:'bShadow',weave:[.37,.69,.99],crest:'Flood revenant waist silk',
    front:[[.112,-.021,.28,.146],[.163,-.221,.392,.19],[.262,-.637,.458,.245],[.364,-1.108,.518,.14]],
    back:[[.186,.111,-.328,.135],[.27,-.184,-.385,.192],[.477,-.578,-.539,.245],[.536,-1.122,-.644,.118]],
    stay:[[.097,.506,-.247,.053],[.25,.451,-.415,.089],[.41,.214,-.519,.116],[.61,.019,-.633,.027]],
    shape:[.067,.07,.45,.81],hem:[.13,.88,.55,.76,.03],flex:1.46,sideDrift:.10,
  },
  m081:{
    cloth:'bShadow', facing:'bCloth', weave:[.43,.20,.19], crest:'flame tabard',
    front:[[.08,-.02,.247,.142],[.143,-.29,.31,.162],[.202,-.64,.365,.144],[.22,-.98,.44,.065]],
    back:[[.22,.66,-.24,.122],[.28,.24,-.348,.199],[.39,-.25,-.48,.237],[.51,-.82,-.55,.107]],
    stay:[[.178,.39,-.34,.09],[.29,.07,-.432,.13],[.36,-.48,-.501,.12],[.425,-1.047,-.48,.035]],
    shape:[.088,.073,.39,.94], hem:[0,.83,.40,.90,.12], flex:.83,
  },
  m082:{
    cloth:'bCloth', facing:'bShadow', weave:[.29,.45,.62], crest:'water spirit shroud',
    front:[[.13,-.08,.229,.20],[.21,-.31,.322,.25],[.35,-.65,.38,.22],[.49,-.86,.21,.061]],
    back:[[.20,.55,-.24,.164],[.33,.21,-.371,.29],[.46,-.34,-.55,.285],[.58,-.90,-.44,.091]],
    stay:[[.21,.14,-.27,.11],[.29,-.13,-.455,.17],[.47,-.58,-.582,.16],[.51,-.94,-.19,.035]],
    shape:[.098,.096,.46,.72], hem:[.49,.91,.30,.88,.62], flex:1.42,
  },
  m083:{
    cloth:'bShadow', facing:'bCloth', weave:[.27,.47,.38], crest:'swordsman traveling coat',
    front:[[.11,-.018,.224,.105],[.135,-.174,.279,.113],[.20,-.356,.277,.078],[.30,-.55,.214,.04]],
    back:[[.18,.57,-.232,.105],[.23,.16,-.341,.138],[.26,-.228,-.42,.105],[.34,-.57,-.50,.045]],
    stay:[[.23,.33,-.256,.059],[.34,.02,-.39,.07],[.55,-.40,-.56,.075],[.71,-.53,-.80,.013]],
    shape:[.070,.060,.35,1.1], hem:[.32,.80,.49,.67,.07], flex:1.22,
  },
  m084:{
    cloth:'bShadow', facing:'bCloth', weave:[.59,.46,.24], crest:'archer riding coat',
    front:[[.115,-.025,.261,.15],[.167,-.22,.293,.16],[.22,-.486,.317,.13],[.283,-.71,.29,.083]],
    back:[[.192,.58,-.20,.107],[.25,.18,-.315,.17],[.235,-.23,-.37,.201],[.217,-.73,-.365,.132]],
    stay:[[.279,.24,-.114,.082],[.315,-.038,-.199,.104],[.338,-.346,-.253,.115],[.39,-.614,-.27,.046]],
    shape:[.064,.054,.34,.91], hem:[1,.32,.17,.31,.91], flex:.69,
  },
  m099:{
    cloth:'bWood', facing:'bShadow', weave:[.59,.72,.71], crest:'rime-forged hide',
    front:[[.218,-.045,.356,.168],[.25,-.22,.424,.195],[.29,-.60,.44,.196],[.336,-.89,.464,.082]],
    back:[[.302,.655,-.43,.198],[.445,.24,-.523,.292],[.500,-.295,-.63,.337],[.58,-.92,-.605,.165]],
    stay:[[.373,.401,-.51,.127],[.525,.051,-.58,.176],[.602,-.298,-.704,.16],[.727,-.65,-.667,.052]],
    shape:[.095,.085,.51,1.13], hem:[.18,.99,.25,.74,0], flex:.51,
  },
  m105:{
    cloth:'bCloth', facing:'bShadow', weave:[.94,.58,.28], crest:'thunder priest vestments',
    front:[[.105,.342,.244,.111],[.12,.05,.324,.164],[.18,-.62,.41,.184],[.31,-1.16,.47,.091]],
    back:[[.16,.625,-.21,.118],[.22,.224,-.387,.202],[.28,-.336,-.51,.245],[.44,-1.19,-.574,.14]],
    stay:[[.148,.37,-.081,.068],[.288,-.011,-.20,.092],[.44,-.55,-.41,.115],[.56,-.98,-.45,.028]],
    shape:[.056,.067,.38,.92], hem:[.32,.72,.52,.91,.25], flex:1.31,
  },
};

export const hasPalaceGarments=id=>Object.hasOwn(fabrics,id);

function interp(points,t){
  const h=Math.min(points.length-1.00001,t*(points.length-1));
  const i=Math.floor(h),p=h-i;
  return T.MathUtils.lerp(points[i],points[i+1],p);
}

// Both faces and the sewn edge are present even when a flap turns inside out.
function clothPanel(k,body,panel,finish,mobile){
  const {track,side,across,rag,flex,phase,name,weave,shorten,edging}=panel;
  const curve=new T.CatmullRomCurve3(track.map(([x,y,z])=>new T.Vector3(side*x,y,z)));
  const widths=track.map(([, , ,w])=>w);
  const acrossDir=new T.Vector3(...across).normalize();
  const rows=mobile?11:17,columns=mobile?8:12;
  const layer=(rows+1)*(columns+1), count=layer*2;
  const positions=new Float32Array(count*3),base=new Float32Array(count*3);
  const shades=new Float32Array(count*3),uvo=new Float32Array(count*2);
  const idx=[],border=[],shape=new T.Vector3(),cut=new T.Vector3(),tangent=new T.Vector3(),normal=new T.Vector3();
  const pigment=new T.Color();
  const embroidery=new T.Color(...weave).multiplyScalar(1.58);
  for(let face=0;face<2;face++){
    for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
      const s=col/columns,u=s*2-1,t=row/rows;
      const cutEdge=interp(rag,s);
      const v=t*(1-cutEdge*shorten*(t*t));
      const vertex=face*layer+row*(columns+1)+col;
      curve.getPoint(v,shape);
      curve.getTangent(v,tangent);
      cut.copy(acrossDir).addScaledVector(tangent,-acrossDir.dot(tangent)).normalize();
      normal.crossVectors(tangent,cut).normalize();
      const width=interp(widths,v);
      const pleats=(.014+.044*v)*Math.cos((u+.12*v)*Math.PI*2.7+phase);
      const lip=Math.pow(Math.abs(u),8)*.022+.010*Math.pow(t,15);
      const piping=s>.07&&s<.15||s>.85&&s<.93;
      shape.addScaledVector(cut,u*width)
        .addScaledVector(normal,pleats+lip+(face===0?.009:-.009)+(piping?.014:0));
      shape.toArray(base,vertex*3);
      const ribShadow=.82+.16*Math.cos((u+.12*v)*Math.PI*2.7+phase)+.055*Math.cos((t+s)*25);
      const band=Number(piping||t>.89||Math.abs((s-.50)*1.75)+Math.abs(t-.47)<.19&&t>.22);
      pigment.setRGB(ribShadow, ribShadow, ribShadow);
      if(band)pigment.lerp(embroidery,t>.89?.62:.74);
      if(face)pigment.multiplyScalar(.78);
      pigment.toArray(shades,vertex*3);
      uvo[vertex*2]=s;
      uvo[vertex*2+1]=t;
      if(row===rows||col===columns)continue;
      const d=vertex+columns+1;
      const edgeCell=col===1||col===columns-2||row===rows-2;
      if(face===0)(edging&&edgeCell?border:idx).push(vertex,d,vertex+1,vertex+1,d,d+1);
      else idx.push(vertex,vertex+1,d,vertex+1,d+1,d);
    }
  }
  const cap=(a,b)=>idx.push(a,b,a+layer,b,b+layer,a+layer);
  for(let col=0;col<columns;col++){
    cap(col,col+1);
    const a=rows*(columns+1)+col;
    cap(a+1,a);
  }
  for(let row=0;row<rows;row++){
    const a=row*(columns+1),b=a+columns+1;
    cap(b,a);
    cap(a+columns,b+columns);
  }
  positions.set(base);
  const shapeBuffer=new T.BufferGeometry();
  shapeBuffer.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
  shapeBuffer.setAttribute('color',new T.BufferAttribute(shades,3));
  shapeBuffer.setAttribute('uv',new T.BufferAttribute(uvo,2));
  shapeBuffer.setIndex(idx.concat(border));
  shapeBuffer.computeVertexNormals();
  const mesh=new T.Mesh(shapeBuffer,k.materials[finish]);
  mesh.name=name;
  mesh.frustumCulled=false;
  body.add(mesh);
  if(edging){
    shapeBuffer.setDrawRange(0,idx.length);
    const hem=new T.BufferGeometry();
    for(const [key,value] of Object.entries(shapeBuffer.attributes))hem.setAttribute(key,value);
    hem.setIndex(border);
    const trim=new T.Mesh(hem,k.materials[edging]);
    trim.name=name+' · gilt edging';
    trim.frustumCulled=false;
    body.add(trim);
  }
  const sway=t=>t*t*(1.23-.23*t);
  return ({beat,wind,strike,travel,fall,stage})=>{
    const speed=travel*.23+wind*.145+strike*.32+stage*.016;
    for(let row=1;row<=rows;row++){
      const t=row/rows,amplitude=sway(t)*flex;
      const curl=Math.sin(beat*.83-t*3.4+phase)*.042+speed*.39;
      const sideways=(Math.sin(beat*.62+phase-t*2.23)*.047+wind*.062-strike*.101)*amplitude;
      for(let face=0;face<2;face++)for(let col=0;col<=columns;col++){
        const vertex=3*(face*layer+row*(columns+1)+col),u=col/columns-.5;
        positions[vertex]=base[vertex]+side*sideways;
        positions[vertex+1]=base[vertex+1]+(speed*.201+fall*.055+curl*u)*amplitude;
        positions[vertex+2]=base[vertex+2]+(curl+u*speed*.11)*amplitude*Math.sign(across[0]);
      }
    }
    shapeBuffer.attributes.position.needsUpdate=true;
    shapeBuffer.computeVertexNormals();
  };
}

function hingeArmor(k,body,id,s,pattern,mobile){
  const outer=[], w=s.chest, h=s.length;
  const [scale,depth,rib,angular]=pattern.shape;
  const point=(i,f)=>[0,h*i,-.036,w*f,(w*.56+.058)*f];
  k.geometry(body,'bShadow',sculptVolume([point(-.16,.62),point(.03,.70),point(.39,.83),
    point(.75,.94),point(.95,.80),point(1.2,.37)],{rings:mobile?9:15,sides:mobile?11:17,section:2.31,ridge:.06}));
  const rearDepth=w*.62+.115;
  const rim=id==='m099'?'bBone':'bTrim';
  const center=[
    [0,h*.920,w*.53+.152],[-w*.156,h*.775,w*.62+.142],
    [-w*.088,h*.573,w*.60+.152],[0,h*.323,w*.49+.115],
    [w*.126,h*.52,w*.61+.146],[w*.17,h*.725,w*.65+.13],
  ];
  k.sculpt.plate(body,'bOxide',center,.052,.018);
  for(const side of sides){
    const reflect=path=>path.map(([x,y,z,r])=>[x*side,y,z,r]);
    const pectoral=reflect([[.032,h*.920,w*.61+.090],[w*.41,h*1.00,w*.49+.093],
      [w*.87,h*.92,w*.21+.072],[w*1.04,h*.70,-.004],[w*.79,h*.60,w*.20+.061],
      [w*.51,h*(.43+angular*.07),w*.46+.092],[.040,h*.55,w*.61+.13]]).map(p=>p.slice(0,3));
    k.sculpt.plate(body,id==='m082'?'bCloth':'bMetal',pectoral,scale,scale*.46);
    k.sculpt.sweep(body,rim,pectoral.slice(0,5).map(([x,y,z],i)=>[x,y+.012,z+.025,.014+.004*(i%2)]),{sides:6,steps:11});
    const backs=mobile?3:4;
    for(let i=0;i<backs;i++){
      const h0=h*(.822-i*.15),reach=w*(.88-i*.082);
      const dorsal=k.bone(body,side*w*.51,h0,-rearDepth*.72);
      dorsal.name=pattern.crest+' · posterior lames '+(i+1);
      const profile=reflect([[.002,.078,-.056],[reach*.42,.059,-.018],[reach*.60,-.023,.083],
        [reach*.50,-.10,.090],[.049,-.120,-rearDepth*.34],[-reach*.28,-.079,-rearDepth*.42],
        [-reach*.36,.014,-rearDepth*.36]]).map(p=>p.slice(0,3));
      k.sculpt.plate(dorsal,i%2===0||id==='m099'?'bMetal':'bCloth',profile,depth*(1-i*.118),depth*.25);
      k.sculpt.sweep(dorsal,rim,profile.slice(2).map(([x,y,z])=>[x,y,z-.031,.009]),{steps:8,sides:5});
      outer.push({joint:dorsal,side,i});
    }
    for(let i=0;i<(mobile?3:4);i++){
      const q=h*(.59-i*.125),rw=w*(.69-i*.10);
      const ribs=reflect([[.044,q+.027,w*.60+.104],[rw*.64,q+.062,w*.44+.104],
        [rw*1.14,q+.009,w*rib+.042],[rw*1.20,q-.077,.015],[rw*.76,q-.104,w*.44+.089],
        [.049,q-.065,w*.60+.112]]).map(p=>p.slice(0,3));
      k.sculpt.plate(body,i%2?'bOxide':'bMetal',ribs,depth*.49,depth*.21);
      k.mesh(body,'gem',rim,side*rw*.68,q-.008,w*.54+.118,.018,.018,.014);
    }
  }
  return ({beat,wind,strike,travel})=>{
    for(const {joint,side,i} of outer){
      joint.rotation.z=side*(.028*Math.sin(beat*.88-i*.66)+wind*.11-strike*.07+travel*.028);
      joint.rotation.y=side*(wind*.085-strike*.072);
    }
  };
}

function sculptFloodTorso(k,body,s,mobile){
  const parts=[],w=s.chest;
  const spawn=(joint,finish,track,rings=12,level=2.63)=>
    k.geometry(joint,finish,sculptVolume(track,{rings:mobile?rings:rings+5,sides:mobile?9:13,section:level,ridge:.14}));
  spawn(body,'bFlesh',[[0,-.17,-.04,.198,.172],[.021,.032,-.05,.221,.213],[.019,.333,-.049,w*.87,.284],
    [0,.656,-.031,w,.255],[0,.793,-.015,.19,.165]]);
  for(const side of sides){
    const f=path=>path.map(([x,...rest])=>[x*side,...rest]);
    const chest=k.bone(body,side*.207,.558,.154);
    chest.name='Flood revenant pectoral';
    spawn(chest,'bBone',f([[-.131,.016,.074,.056,.043],[-.054,.029,.111,.092,.063],
      [.106,.069,.046,.107,.098],[.18,.073,-.055,.054,.065]]));
    const back=k.bone(body,side*.197,.527,-.269);
    back.name='Flood revenant scapula';
    spawn(back,'bFlesh',f([[.086,.133,.017,.062,.044],[.062,.074,-.025,.112,.054],
      [.005,-.107,-.037,.09,.047],[-.078,-.176,-.011,.027,.028]]));
    for(let rib=0;rib<3;rib++){
      const u=.383-rib*.102,reach=.318-rib*.036;
      spawn(body,rib===1?'bFlesh':'bBone',f([[.053,u,.213,.059,.066],[reach*.40,u+.026,.201,.063,.054],
        [reach*.90,u+.044,.141,.052,.047],[reach,u+.063,.047,.026,.020]]),9);
    }
    for(let rib=0;rib<3;rib++){
      const u=.301-rib*.114,reach=.281-rib*.014;
      const line=f([[.045,u,-.249,.008],[reach*.48,u+.018,-.266,.025],
        [reach*.93,u+.058,-.211,.044],[reach*1.25,u+.128,-.146,.006]]);
      k.sculpt.sweep(body,'bMetal',line,{steps:mobile?7:11,sides:6});
    }
    parts.push({chest,back,side});
  }
  return ({beat,wind,strike,travel})=>{
    for(const {chest,back,side} of parts){
      const breathe=Math.sin(beat*.73)*.021;
      chest.rotation.y=side*(breathe+wind*.13-strike*.10);
      back.rotation.x=-breathe+wind*.152-strike*.094+travel*.042;
    }
  };
}

export function palaceGarments(k,body,sash,entry,shape,mobile){
  const pattern=fabrics[entry.id];
  if(!pattern)return null;
  const folds=[];
  folds.push(entry.id==='m080'?sculptFloodTorso(k,body,shape,mobile):hingeArmor(k,body,entry.id,shape,pattern,mobile));
  for(const side of sides){
    const sidePhase=side*.66;
    const drift=pattern.sideDrift??0;
    const taper=track=>track.map(([x,y,z,w],i)=>[x+drift*side*i*.43,y+drift*side*i*.19,z,w]);
    folds.push(clothPanel(k,sash,{
      track:pattern.front,side,across:[1,.02,-side*.19],phase:sidePhase,weave:pattern.weave,
      flex:pattern.flex*.7,rag:pattern.hem,shorten:.17,edging:pattern.edging,name:pattern.crest+' · front panels',
    },pattern.cloth,mobile));
    folds.push(clothPanel(k,body,{
      track:taper(pattern.back),side,across:[-.93,.035,-side*.23],phase:sidePhase+.89,weave:pattern.weave,
      flex:pattern.flex,rag:pattern.hem,shorten:.23,edging:pattern.edging,name:pattern.crest+' · split rear mantle',
    },pattern.cloth,mobile));
    folds.push(clothPanel(k,body,{
      track:taper(pattern.stay),side,across:[-.71,.06,-side*.52],phase:sidePhase+1.38,weave:pattern.weave,
      flex:pattern.flex*.93,rag:[.42,.61,.24,.57,.15],shorten:.14,name:pattern.crest+' · outer drape',
    },pattern.facing,mobile));
  }
  return sample=>{for(const move of folds)move(sample);};
}
