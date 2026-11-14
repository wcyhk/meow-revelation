import * as T from '../three.min.mjs';
import {featherVane,sculptVolume,wingWeb} from './sculpt-volume.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2;
const signs=[-1,1];
const reflect=(side,track)=>track.map(([x,...tail])=>[side*x,...tail]);
const mass=(k,j,finish,profile,rings=15,sides=11,section=2.43,ridge=.16)=>
  k.geometry(j,finish,sculptVolume(profile.map(([x,y,z,a,b=a])=>[x,y,z,a,b]),{rings,sides,section,ridge}));
const line=(k,j,finish,track,r=.018)=>k.sculpt.sweep(j,finish,track.map(([x,y,z,a=r])=>[x,y,z,a]),{sides:6,steps:9,ridge:.14});
const relief=(k,j,finish,track,depth=.047)=>k.sculpt.plate(j,finish,track,depth,depth*.38);
const stone=(k,j,finish,x,y,z,r=.04,h=r,d=r,angle=0)=>k.mesh(j,'gem',finish,x,y,z,r,h,d,0,0,angle);

function hoop(k,j,finish,r,t=.024,steps=24,x=0,y=0,z=0){
  const geo=new T.TorusGeometry(r,t,8,steps);
  geo.translate(x,y,z);
  k.geometry(j,finish,geo);
}

function dress(k,station,s,panelCount){
  const panels=[];
  const {length,waist,bell,hem,slit=0}=s;
  mass(k,station,'bShadow',[[0,-length,-.02,bell*.84,bell*.69],[0,-length*.77,-.017,bell*.81,bell*.71],
    [0,-length*.47,0,(bell+waist)*.45,(bell+waist)*.35],[0,-.072,0,waist*.99,waist*.74]],19,18,2.37,.095);
  for(let i=0;i<panelCount;i++){
    const a=i*TAU/panelCount,dark=i%3===1;
    const joint=k.bone(station,0,0,0);
    joint.rotation.y=a;
    const w=(bell*.31+waist*.07)*(i%2?.84:1);
    const end=length*(i%2?.86:1)+(i===0?slit:0),h=hem*(i%3-1)*.07;
    const p=[[-w*.52,-.056,waist*.95],[w*.50,-.053,waist*.96],[w*.75,-end*.39,(waist+bell)*.49],
      [w*1.14,-end*.82,bell*.98],[w*.66,-end,bell*(1.03+h)],[-w*.39,-end*.95,bell*.99],
      [-w*1.03,-end*.79,bell*.85],[-w*.71,-end*.41,(waist+bell)*.46]];
    relief(k,joint,dark?'bShadow':'bCloth',p,.071);
    line(k,joint,'bTrim',p.slice(0,7).map(([x,y,z])=>[x,y,z+.053]),.012);
    for(const side of signs)line(k,joint,i%2?'bOxide':'bInlay',[
      [side*w*.21,-.092,waist+.038],[side*w*.37,-end*.33,(waist+bell)*.45+.063],
      [side*w*.51,-end*.63,bell*.79+.045],[side*w*.25,-end*.85,bell*.97+.052]],.012);
    if(s.embroidery)for(let knot=0;knot<3;knot++){
      const t=.48+knot*.137;
      stone(k,joint,knot%2?'bInlay':'bTrim',Math.sin(i+knot*.94)*w*.35,-end*t,T.MathUtils.lerp(waist,bell,t)+.052,.035,.059,.012,TAU/8);
    }
    panels.push({joint,a,index:i});
  }
  return panels;
}

// facial width, chin width, brow height, nasal projection, cheek height,
// mouth width and brow falloff are measured in the local head coordinates.
const headForms={
  m060:[.169,.084,.072,.051,.037,.071,.21,'blind-wrap'],
  m061:[.170,.073,.061,.075,.061,.067,.16,'worn'],
  m062:[.153,.079,.051,.045,.056,.063,.09,'narrow'],
  m063:[.180,.089,.064,.084,.053,.093,.34,'fang'],
  m064:[.173,.091,.075,.055,.072,.070,.23,'ice-visor'],
  m065:[.174,.061,.073,.032,.078,.065,.32,'jade'],
  m066:[.193,.111,.066,.079,.057,.089,.29,'fang'],
  m067:[.177,.100,.068,.073,.060,.072,.24,'court'],
  m068:[.186,.118,.067,.071,.054,.091,.31,'royal-mask'],
  m069:[.161,.092,.060,.061,.065,.075,.12,'worn'],
  m070:[.187,.124,.054,.063,.055,.097,.19,'war-mark'],
  m071:[.169,.073,.064,.038,.070,.066,.16,'narrow'],
  m072:[.155,.062,.058,.042,.050,.071,.08,'soft'],
  m073:[.172,.095,.063,.065,.062,.074,.29,'court'],
  m074:[.152,.065,.057,.048,.065,.067,.12,'soft'],
  m075:[.163,.076,.069,.086,.065,.087,.31,'scarlet'],
  m076:[.177,.098,.064,.071,.059,.079,.31,'lacquer'],
  m077:[.157,.066,.059,.043,.069,.064,.06,'soft'],
  m078:[.188,.103,.061,.092,.068,.084,.22,'worn'],
  m079:[.161,.052,.076,.025,.076,.061,.34,'jade'],
  m080:[.196,.108,.050,.034,.064,.091,.32,'relic'],
  m081:[.166,.088,.066,.067,.056,.085,.29,'lacquer'],
  m082:[.185,.094,.064,.035,.051,.083,.33,'blind-visor'],
  m083:[.153,.097,.081,.046,.037,.069,.23,'split-visor'],
  m084:[.161,.082,.068,.054,.062,.070,.20,'split-visor'],
  m089:[.170,.101,.071,.068,.069,.084,.25,'fang'],
  m090:[.177,.099,.068,.055,.059,.087,.30,'ice-visor'],
  m091:[.174,.093,.072,.063,.060,.082,.24,'jade'],
  m092:[.189,.103,.079,.059,.064,.080,.24,'royal-mask'],
  m093:[.174,.090,.057,.039,.071,.074,.25,'relic'],
  m094:[.185,.102,.073,.060,.051,.085,.36,'scarlet'],
  m099:[.201,.123,.070,.094,.083,.097,.32,'fang'],
  m100:[.158,.070,.054,.022,.060,.079,.31,'relic'],
  m102:[.210,.132,.055,.096,.062,.099,.34,'fang'],
  m104:[.220,.156,.052,.048,.058,.115,.08,'monolith'],
  m105:[.157,.066,.066,.065,.053,.071,.19,'court'],
  m110:[.202,.117,.060,.113,.087,.097,.28,'muzzle'],
  m112:[.170,.100,.077,.066,.054,.083,.24,'royal-mask'],
};
const livingFaces=new Set(['worn','narrow','court','war-mark','soft']);
const gaussian=(value,radius)=>Math.exp(-((value/radius)**2));
const faceLevels=[
  [-.264,.47,.102,-.004],[-.210,.72,.125,-.006],[-.158,.84,.143,-.012],
  [-.095,.94,.168,-.017],[-.020,1,.187,-.021],[.058,.99,.184,-.022],
  [.128,.94,.178,-.024],[.211,.89,.158,-.040],[.272,.75,.137,-.059],[.305,.47,.104,-.060],
];

function headSurface(p,mobile){
  const [width,chin,eyeY,nose,cheek,mouth,browDrop,kind]=p;
  const levels=new T.CatmullRomCurve3(faceLevels.map(([y,w,d])=>new T.Vector3(y,w,d)));
  const taper=new T.CatmullRomCurve3(faceLevels.map(([y,, ,z])=>new T.Vector3(y,z,0)));
  const rows=mobile?18:25, spokes=mobile?23:31, pos=[],uv=[],idx=[];
  for(let row=0;row<=rows;row++){
    const {x:y,y:w,z:depth}=levels.getPoint(row/rows);
    const {y:back}=taper.getPoint(row/rows);
    for(let j=0;j<=spokes;j++){
      const a=j*TAU/spokes,front=Math.cos(a),f=front>0?front**1.06:0;
      const jaw=gaussian(y+.22,.11),wide=T.MathUtils.lerp(width*w,chin*(.84+w*.14),jaw);
      const x=Math.sin(a)*wide,lateral=Math.abs(x),eye=width*.52;
      const bridge=gaussian(x,width*.20)*gaussian(y+.000,.101)*nose;
      const noseTip=gaussian(x,width*.28)*gaussian(y+.060,.041)*nose*.42;
      const eyeHeight=eyeY+(lateral-eye)*browDrop;
      const socket=gaussian(lateral-eye,width*.32)*gaussian(y-eyeHeight,.037)*.040;
      const arch=gaussian(lateral-eye,width*.42)*gaussian(y-eyeHeight-.065,.047)*.042;
      const cheekbone=gaussian(lateral-width*.71,width*.32)*gaussian(y+.068-cheek*.43,.045)*.039;
      const maxilla=gaussian(x,mouth*1.52)*gaussian(y+.119,.075)*.029;
      const mouthCrease=gaussian(x,mouth)*gaussian(y+.149,.019)*.024;
      const mentum=gaussian(x,chin*.82)*gaussian(y+.235,.034)*.044;
      const fracture=kind==='monolith'?Math.sin(a*8.5+y*18.4)*Math.cos(y*23.3+a*5.7)*.008:0;
      pos.push(x,y,back+depth*front+(bridge+noseTip-socket+arch+cheekbone+maxilla-mouthCrease+mentum)*f+fracture);
      uv.push(j/spokes,row/rows);
      if(row<rows&&j<spokes){const i=row*(spokes+1)+j;idx.push(i,i+1,i+spokes+1,i+1,i+spokes+2,i+spokes+1);}
    }
  }
  const cap=pos.length/3;
  pos.push(0,faceLevels[0][0]-.011,-.01,0,.315,-.067);uv.push(.5,0,.5,1);
  for(let s=0;s<spokes;s++)idx.push(cap,s+1,s,cap+1,rows*(spokes+1)+s,rows*(spokes+1)+s+1);
  const g=new T.BufferGeometry().setIndex(idx);
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.computeVertexNormals();
  const n=g.attributes.normal,edge=new T.Vector3(),far=new T.Vector3();
  for(let row=0;row<=rows;row++){
    const a=row*(spokes+1),b=a+spokes;
    edge.fromBufferAttribute(n,a).add(far.fromBufferAttribute(n,b)).normalize();
    n.setXYZ(a,edge.x,edge.y,edge.z); n.setXYZ(b,edge.x,edge.y,edge.z);
  }
  return g;
}

function brow(k,j,id,mobile){
  const p=headForms[id];
  const [w,chin,eyeY,nose,cheek,mouth,slope,design]=p;
  const living=livingFaces.has(design);
  const visor=design.includes('visor')||design==='blind-wrap';
  const skull=design==='relic', fang=['fang','scarlet','muzzle'].includes(design), imperial=design==='royal-mask';
  const render=skull?'bBone':living?'bFlesh':design==='monolith'?'bMetal':'bOxide';
  k.geometry(j,render,headSurface(p,mobile));
  const jaw=k.bone(j,0,-.173,.073);
  mass(k,jaw,render,[[0,-.081,.011,chin*.57,.052],[0,-.055,.047,chin*.78,.067],
    [0,-.017,.063,chin,.062],[0,.033,.048,chin*.91,.055]],mobile?8:11,10,2.19,.075);
  for(const side of signs){
    const f=points=>reflect(side,points);
    const eye=w*.51,inner=eye-w*.30,outer=eye+w*.34;
    const y=eyeY-.016,z=.139;
    const upper=f([[inner,y-.004,z+.069,.008],[eye*.80,y+.022,z+.071,.018],[eye*1.13,y+.033,z+.063,.022],
      [outer,y+slope*.072,z+.037,.012]]);
    const bottom=f([[inner,y-.004,z+.069,.004],[eye*.77,y-.018,z+.071,.008],[eye*1.16,y-.013,z+.061,.010],
      [outer,y+slope*.072,z+.031,.004]]);
    relief(k,j,'bShadow',[...upper.map(a=>a.slice(0,3)),...bottom.slice(1,-1).reverse().map(a=>a.slice(0,3))],.013);
    line(k,j,living?'bHair':skull?'bOxide':'bMetal',upper);line(k,j,living?'bFlesh':render,bottom);
    if(design!=='blind-wrap'){
      k.mesh(j,'round',living?'bBone':'glow',eye*side,y+.004,z+.083,w*.189,.014,.020,.04,side*.30,side*slope*.6);
      k.mesh(j,'round',living?'bShadow':'bInlay',(eye+.007)*side,y+.004,z+.101,w*.060,.015,.007);
    }
    const browShape=f([[w*.10,y+.049,.204,.015],[eye*.84,y+.060,.195,.020],[eye*1.39,y+.074,.171,.021],
      [w*.91,y+.078,.122,.006]]);
    if(!living)mass(k,j,skull?'bBone':'bMetal',browShape,mobile?7:11,7,2.08,.11);
    if(living){
      line(k,j,'bHair',browShape.map(([x,a,b,r])=>[x,a+.015,b+.018,r*.37]));
      if(design==='worn'||design==='court')for(let row=0;row<(mobile?1:2);row++){
        line(k,j,'bOxide',f([[eye*.71,y+.108+row*.024,.201,.003],[eye*1.21,y+.118+row*.029,.184,.006],
          [w*.88,y+.119+row*.028,.126,.003]]));
      }
      mass(k,j,'bFlesh',f([[w*.89,-.098,-.041,.020,.027],[w*1.05,-.045,-.07,.028,.038],
        [w*1.09,.027,-.085,.031,.037],[w*.92,.079,-.078,.014,.025]]),8,8,2.12,.08);
      line(k,j,'bOxide',f([[w*.984,-.061,-.049,.008],[w*1.10,-.017,-.058,.008],[w*1.06,.040,-.067,.004]]));
    }else {
      const cheekOuter=w*(fang?1.14:1.02);
      const cheekPlate=f([[w*.77,y+.048,.123],[cheekOuter,y+.057,.009],[cheekOuter,y-.110,.023],
        [w*.84,-.188,.103],[w*.46,-.207,.187],[w*.36,-.144,.226],[w*.66,-.063+cheek*.32,.197]]);
      relief(k,j,skull?'bBone':visor?'bMetal':'bTrim',cheekPlate,.032);
      line(k,j,skull?'bOxide':'bInlay',cheekPlate.slice(1,6).map(([x,y,z])=>[x,y,z+.033]),.012);
      for(let rivet=0;rivet<(mobile?1:3);rivet++){
        const pinY=y-.012-rivet*.055,x=side*(cheekOuter*.89-rivet*.012);
        stone(k,j,visor?'bTrim':'bMetal',x,pinY,.086+rivet*.021,.014,.015,.013);
      }
    }
    const wing=.022+nose*.17,zin=.169+nose*.91;
    mass(k,j,render,f([[w*.12,-.056,zin,.012],[wing,-.079,zin+.007,.017],[wing+.002,-.092,zin-.002,.015],
      [w*.24,-.095,zin-.028,.008]]),8,8,2.27,.11);
    line(k,j,'bShadow',f([[w*.056,-.099,zin+.006,.005],[wing,-.092,zin+.008,.006],[wing+.009,-.099,zin-.012,.003]]));
    if(fang)mass(k,jaw,'bBone',f([[mouth*.94,-.01,.104,.030],[mouth*1.17,.030,.143,.023],[mouth*1.11,.101,.16,.005]]),
      9,7,2.15,.15);
    if(skull)for(let t=0;t<(mobile?3:5);t++){
      const x=mouth*(.12+t*.175),r=.012-t*.0008;
      mass(k,jaw,'bBone',f([[x,.015,.096,r,.012],[x,.032,.110,r,.012],[x,.047,.105,.008,.008]]),4,6,2.08,.068);
    }
  }
  const lipZ=.096+nose*.17,lipWidth=mouth*(design==='soft'?1.10:1);
  line(k,jaw,'bShadow',[[-lipWidth,.031,lipZ],[0,.029,lipZ+.031],[lipWidth,.028,lipZ]],living?.008:.013);
  if(living){
    const upperLip=[[-lipWidth,.027,lipZ],[0,.038,lipZ+.026],[lipWidth,.028,lipZ]];
    line(k,jaw,'bFlesh',upperLip,.008);
    line(k,jaw,'bFlesh',[[-lipWidth*.81,.020,lipZ+.003],[0,.015,lipZ+.025],[lipWidth*.81,.018,lipZ+.003]],.010);
    if(design==='court'||design==='worn')for(const side of signs)line(k,j,'bHair',
      reflect(side,[[.005,-.129,.241,.013],[mouth*.60,-.129,.239,.021],[mouth*1.33,-.158,.197,.004]]));
    if(design==='war-mark')for(const side of signs)line(k,j,'bInlay',
      reflect(side,[[w*.88,.103,.151,.018],[w*.78,-.026,.198,.031],[w*.91,-.123,.167,.006]]));
  }else{
    const bridge=[[0,.164,.179,.027],[0,.082,.206,.041],[0,-.022,.199+nose,.037],[0,-.106,.164+nose,.006]];
    mass(k,j,skull?'bBone':visor?'bMetal':'bTrim',bridge,11,8,2.8,.086);
    if(!skull)line(k,jaw,'bInlay',[[-chin*.89,.013,.097],[0,-.042,.146],[chin*.88,.012,.097]],.018);
  }
  if(visor||imperial||design==='scarlet')helmetCage(k,j,p,mobile);
  else{
    const finish=design==='court'||design==='worn'?'bCloth':'bHair';
    const crown=k.bone(j,0,.03,-.137);
    mass(k,crown,finish,[[0,-.172,-.013,w*.72,.058],[0,-.066,-.035,w*.93,.098],
      [0,.075,-.026,w*1.07,.122],[0,.17,.01,w*.96,.143],[0,.258,.073,w*.76,.122],
      [0,.293,.101,w*.56,.107]],13,12,2.42,.12);
    if(design==='court'||design==='worn')line(k,crown,'bTrim',
      [[-w*.95,.027,-.066],[-w*.51,.044,-.128],[0,.041,-.156],[w*.58,.03,-.121],[w*.91,.033,-.075]],.013);
  }
  return jaw;
}

function helmetCage(k,j,[width,,eye,, , , ,kind],mobile){
  const blind=kind==='blind-wrap'||kind==='blind-visor', split=kind==='split-visor', red=kind==='scarlet';
  const w=width*(blind?1.16:1.04), finish=red?'bInlay':'bMetal';
  for(const side of signs){
    const f=points=>reflect(side,points);
    const guard=f([[0,.231,.174],[w*.75,.238,.116],[w*1.21,.173,.036],[w*1.25,.025,.052],
      [w*.97,-.153,.132],[w*.59,-.161,.193],[w*.54,eye+.049,.189],[0,eye+.085,.222]]);
    relief(k,j,finish,guard,.052);
    line(k,j,'bTrim',guard.slice(0,6).map(([x,y,z])=>[x,y,z+.035]),.014);
    if(!mobile)for(let i=0;i<3;i++)stone(k,j,red?'bBone':'bInlay',
      side*w*(.96-i*.10),.127-i*.072,.143+i*.014,.020,.023,.018);
    if(split)line(k,j,'glow',f([[w*.44,.222,.194,.011],[w*.74,.169,.182,.010],[w*.71,.112,.204,.003]]));
  }
  if(blind){
    relief(k,j,kind==='blind-wrap'?'bCloth':'bShadow',[[-w*1.01,eye+.033,.157],[-w*.54,eye+.052,.245],
      [w*.45,eye+.049,.248],[w*1.03,eye+.026,.164],[w*.96,eye-.038,.174],[0,eye-.019,.254],
      [-w*.93,eye-.039,.164]],.032);
    line(k,j,'bInlay',[[-w*.98,eye+.015,.183],[-w*.51,eye+.009,.272],[w*.41,eye-.004,.276],[w*.95,eye+.005,.195]],.010);
  }
  const back=k.bone(j,0,.123,-.128);
  for(let i=0;i<(mobile?2:3);i++){
    const y=.091-i*.098,wid=w*(1.03+i*.098);
    const band=[[-wid,y+.041,.042],[-wid*.59,y+.047,-.067],[0,y+.033,-.127],
      [wid*.64,y+.042,-.064],[wid,y+.037,.046],[wid*.92,y-.059,.04],[0,y-.071,-.127],
      [-wid*.90,y-.053,.035]];
    relief(k,back,'bOxide',band,.027);
    line(k,back,'bTrim',band.slice(0,5),.013);
  }
}

function strands(k,head,s,mobile){
  const hair=k.bone(head,0,.16,-.059);
  const width=s.hair==='mane'?.46:s.hair==='long'?.29:.225;
  const end=s.hair==='bun'?.38:s.hair==='pony'?.80:s.hair==='beard'?.66:.63;
  for(let i=0;i<(mobile?10:16);i++){
    const t=i/(mobile?9:15),a=PI*.36+PI*1.28*t,x=Math.cos(a),z=Math.sin(a);
    const face=s.hair==='beard';
    const wind=s.hair==='pony';
    const track=[[x*.15,face?-.319:.173,face?.187:z*.136],[x*width*.72,face?-.419:.03,face?.29:z*.23-.036],
      [x*width*(wind?.69:1)+Number(wind)*.28,-end*(.70+t*.23),face?.320:z*.28-.23],
      [x*width*(wind?.52:.81)+Number(wind)*.49,-end*(.92+t*.21),face?.34:z*.36-.29]];
    mass(k,hair,i%4===0?'bBone':'bHair',track.map(([x,y,z],n)=>[x,y,z,[.046,.052,.037,.003][n],[.032,.047,.022,.003][n]]),
      11,7,2.67,.18);
  }
  if(s.hair==='bun'||s.hair==='pony'){
    stone(k,hair,'bHair',0,.106,-.255,.154,.159,.147,.4);
    const pin=k.bone(hair,0,.25,-.225);
    pin.rotation.z=.75;
    line(k,pin,'bTrim',[[0,-.23,0,.022],[0,.26,0,.015]]);
  }
  return hair;
}

function crown(k,j,design){
  if(design==='cloth')return;
  if(design==='square'){
    relief(k,j,'bMetal',[[-.156,.244,.141],[.16,.244,.141],[.19,.592,.107],[-.193,.592,.112]],.096);
    for(let y=.30;y<.61;y+=.055)line(k,j,'bTrim',[[-.165,y,.215],[0,y+.008,.231],[.165,y,.209]],.020);
    line(k,j,'bTrim',[[-.184,.619,-.03],[.181,.613,-.026],[.196,.611,.271],[-.198,.611,.267],[-.184,.619,-.03]],.037);
    for(const side of signs)for(let i=0;i<5;i++)line(k,j,'bInlay',
      [[side*(.049+i*.032),.60,.236],[side*(.051+i*.032),.407-i*.007,.258]],.011);
    return;
  }
  if(design==='cloth-pin'){
    const brow=[[-.178,.160,.118],[-.111,.211,.162],[0,.22,.174],[.122,.215,.15],[.173,.174,.105],
      [.139,.243,.07],[0,.280,.088],[-.133,.239,.08]];
    relief(k,j,'bCloth',brow,.035);
    line(k,j,'bTrim',brow.slice(0,5).map(([x,y,z])=>[x,y,z+.023]),.011);
    mass(k,j,'bMetal',[[-.218,.202,-.116,.019],[-.076,.243,-.142,.024],[.113,.302,-.173,.026],
      [.301,.391,-.222,.006]],10,8,2.42,.11);
    return;
  }
  if(design==='sun'){
    for(let i=0;i<9;i++){
      const a=(i*.193-.77),s=Math.sin(a),c=Math.cos(a);
      mass(k,j,i%2?'bTrim':'bMetal',[[s*.19,.211+c*.033,.061,.046],[s*.32,.334+c*.168,-.049,.049],
        [s*.38,.36+c*.27,-.087,.005]],11,8,2.68,.23);
    }
  }else for(const side of signs){
    const f=path=>reflect(side,path);
    const high=design==='branches'?.63:design==='stag'?.52:design==='flame'?.62:.46;
    const spread=design==='stag'?.36:design==='branches'?.42:.26;
    const tip=[spread*1.25,high,-.17];
    mass(k,j,'bMetal',f([[.082,.151,.106,.065],[spread*.63,high*.41,.037,.084],[spread,high*.72,-.064,.066],
      [...tip,.006]]),15,11,2.7,.24);
    line(k,j,'bTrim',f([[.08,.176,.171],[spread*.67,high*.46,.095],[spread*1.02,high*.78,-.01],[tip[0],tip[1],tip[2]+.03]]),.016);
    if(design==='branches'||design==='flame'||design==='stag')for(let i=0;i<3;i++){
      const x=.124+i*.064,y=.21+i*.105;
      mass(k,j,i%2?'bBone':'bInlay',f([[x,y,-.029,.062],[x+.083,y+.082,-.109,.044],[x+.170,y+.20,-.18,.006]]),
        10,7,2.3,.22);
    }
  }
  stone(k,j,'bInlay',0,.260,.218,.065,.108,.054);
}

function armorLap(k,body,mode,height,width,mobile,collar){
  const narrow=mode==='vest', rows=mobile?3:4;
  for(const side of signs){
    const fan=p=>reflect(side,p);
    // Each side is a closed saddle of plates, wrapping the upper ribcage into
    // the back rather than copying flat chest pieces onto the far side.
    const rear=fan([[.038,height+.158,-.306],[width*.79,height+.131,-.293],
      [width*1.07,height-.034,-.167],[width*.94,height-.247,-.117],
      [width*.53,height-.369,-.24],[.043,height-.318,-.346]]);
    relief(k,body,'bOxide',rear,.063);
    line(k,body,'bTrim',rear.map(([x,y,z])=>[x,y,z-.041]),.016);
    for(let i=0;i<rows;i++){
      const t=i/(rows-1),y=height-.06-t*.308,span=width*(1.08-t*.23);
      const plate=fan([[span*.52,y+.046,-.25],[span*.94,y+.045,-.148],[span,y+.014,.041],
        [span*.79,y-.065,.165],[span*.59,y-.10,.159],[span*.64,y-.074,-.182]]);
      relief(k,body,narrow?'bCloth':i%2?'bOxide':'bMetal',plate,.025);
      line(k,body,'bTrim',plate.slice(1,5),.012);
      stone(k,body,'bInlay',side*span*.944,y-.031,-.04,.023,.029,.024);
    }
    const strap=fan([[width*.19,height+.195,-.251,.027],[width*.58,height+.026,-.333,.036],
      [width*.40,height-.198,-.367,.026],[width*.206,height-.36,-.302,.015]]);
    line(k,body,'bWood',strap);
    line(k,body,'bTrim',strap.map(([x,y,z,r])=>[x+side*.028,y,z-.008,r*.37]));
    if(collar){
      const y=height+.228,w=width;
      const collarEdge=fan([[.034,y+.040,.171],[w*.54,y+.051,.152],[w*.97,y-.021,-.003],
        [w*.86,y-.114,-.157],[.038,y-.077,-.276]]);
      if(collar==='gilt'||collar==='scales'){
        relief(k,body,collar==='gilt'?'bTrim':'bMetal',collarEdge,.028);
        const returned=collarEdge.map(([x,y,z])=>[x*.85,y-.035,z*.93]);
        relief(k,body,'bOxide',returned,.035);
        line(k,body,'bInlay',collarEdge.map(([x,y,z])=>[x,y+.014,z]),.013);
      }else{
        const collarCloth=collar==='linen'?'bCloth':'bWood';
        const roll=collarEdge.map(([x,y,z],i)=>[x,y,z,i===0?.04:i===4?.015:.032]);
        mass(k,body,collarCloth,roll,mobile?7:10,8,2.52,.11);
        line(k,body,'bTrim',roll.map(([x,y,z,r])=>[x,y+.013,z+.029,r*.30]));
      }
    }
  }
}

function tailoredCoat(k,body,s,mobile){
  const rear=k.bone(body,0,s.length*.64,-.237);
  const rows=mobile?3:5;
  const w=s.chest;
  if(s.back==='sash'){
    for(let i=0;i<rows;i++){
      const y=.24-i*.103,z=-.19+Math.sin(i*.7)*.041;
      line(k,rear,i%2?'bTrim':'bCloth',[[-w*.77,y+.054,z+.04],[-w*.24,y-.035,z-.029],
        [w*.30,y-.069,z-.039],[w*.78,y-.05,z+.043]],.022);
    }
    const knot=k.bone(rear,-w*.18,-.267,-.12);
    const strips=signs.map(side=>{
      const cord=k.bone(knot,.068*side,0,0);
      mass(k,cord,'bInlay',reflect(side,[[0,0,0,.076,.042],[.134,-.11,-.034,.063,.031],
        [.202,-.346,-.111,.039,.022],[.17,-.489,-.204,.004,.005]]),12,9,2.88,.15);
      return {joint:cord,type:'wing',side};
    });
    return strips;
  }
  if(s.back==='jade'||s.back==='epaulettes'||s.back==='prayer'){
    const prayer=s.back==='prayer', jade=s.back==='jade';
    const rim=jade?.212:prayer?.181:.15;
    hoop(k,rear,'bTrim',rim,.024,22,0,-.049,-.101);
    hoop(k,rear,'bOxide',rim*.69,.018,19,0,-.044,-.129);
    stone(k,rear,prayer?'bBone':'bInlay',0,-.048,-.13,rim*.53,rim*.57,.036,PI*.25);
    for(let i=0;i<(jade?6:4);i++){
      const angle=i*TAU/(jade?6:4),x=Math.sin(angle),y=Math.cos(angle);
      line(k,rear,'bTrim',[[x*rim*.63,y*rim*.63-.048,-.137],[x*rim,y*rim-.048,-.128],
        [x*(rim+.086),y*(rim+.086)-.048,-.109]],.013);
    }
    for(const side of signs){
      const fan=p=>reflect(side,p);
      line(k,rear,prayer?'bBone':'bCloth',fan([[.035,.226,-.024,.023],[w*.51,.109,-.059,.042],
        [w*.67,-.092,-.036,.038],[w*.72,-.33,.017,.009]]));
      if(prayer)for(let i=0;i<rows;i++){
        const y=-.136-i*.049;
        relief(k,rear,'bBone',fan([[.021,y+.027,-.10],[w*.26,y+.03,-.097],
          [w*.25,y-.019,-.112],[.031,y-.023,-.117]]),.016);
      }
    }
  }
  if(s.back==='broken'||s.back==='sabre'){
    for(const side of signs){
      const f=p=>reflect(side,p);
      for(let i=0;i<rows;i++){
        const y=.228-i*.093,x=w*(.23+i*.085);
        const path=f([[x,y+.046,-.106],[x+.121,y+.079,-.062],[x+.198,y+.018,.001],
          [x+.122,y-.107,-.051],[x+.037,y-.058,-.105]]);
        relief(k,rear,s.back==='broken'?'bOxide':'bMetal',path,.036);
        line(k,rear,'bTrim',path.slice(0,4).map(([a,b,c])=>[a,b,c-.028]),.012);
      }
    }
  }
  return [];
}

function breastplate(k,body,s,y,w){
  for(const side of signs){
    const mid=.39,round=s==='lamellar'||s==='imperial';
    const shoulder=reflect(side,[[.065*w,y+.074,.274],[.64*w,y+.17,.245],[1.19*w,y+.078,.09],
      [1.05*w,y-.153,.092],[.49*w,y-.244,.266],[.114*w,y-.208,.354]]);
    relief(k,body,'bMetal',shoulder,.061);
    line(k,body,'bTrim',shoulder.map(([x,h,z])=>[x,h,z+.046]),.021);
    relief(k,body,'bOxide',reflect(side,[[.08*w,y+.079,-mid*.56],[.58*w,y+.17,-mid*.68],[1.11*w,y+.02,-mid*.44],
      [.96*w,y-.174,-mid*.47],[.215*w,y-.274,-mid*.78]]),.074);
    line(k,body,'bTrim',reflect(side,[[.124*w,y+.063,-.274],[.619*w,y+.14,-.313],[.872*w,y-.067,-.276],
      [.648*w,y-.198,-.315],[.33*w,y-.259,-.339]]),.016);
    for(let i=0;i<(round?6:3);i++){
      const row=y-.052-i*.082;
      const z=.252+(round?.674:.36)*Math.sin((i+.1)*.46)*.113;
      const panel=reflect(side,[[.071*w,row+.065,z],[.746*w,row+.080,z-.045],[.889*w,row+.010,z-.076],
        [.678*w,row-.072,z-.041],[.09*w,row-.062,z+.018]]);
      relief(k,body,i%2?'bInlay':'bMetal',panel,.029);
      for(const p of panel.slice(1,3))stone(k,body,'bTrim',...p,.027,.024,.025);
    }
  }
}

function arm(k,body,s,side){
  const f=path=>reflect(side,path),wide=s.chest;
  const root=k.bone(body,side*wide*.83,.560,.012);
  const elbow=k.bone(root,side*.105,-s.arm*.52,.04);
  const hand=k.bone(elbow,side*.023,-s.arm*.47,.108);
  const r=s.sleeve,skin=s.armor==='bare'?'bFlesh':'bCloth';
  mass(k,root,skin,f([[0,.126,-.039,r*.71,r*.78],[.058,.019,-.027,r*1.08,r*.91],
    [.104,-s.arm*.25,.009,r*.88,r*.78],[.114,-s.arm*.57,.057,r*.70,r*.57]]));
  mass(k,elbow,skin,f([[.003,.036,.029,r*.65,r*.54],[.039,-s.arm*.116,.052,r*.87,r*.68],
    [.057,-s.arm*.36,.106,r*.75,r*.59],[.037,-s.arm*.49,.128,r*.48,r*.42]]));
  for(const z of [-1,1]){
    const plate=reflect(side,[[-r*.66,.088,z*r*.49],[.065,.163,z*r*.84],[r*.83,.084,z*r*.59],
      [r*1.34,-.078,z*r*.43],[r*.95,-.198,z*r*.52],[-r*.30,-.145,z*r*.82]]);
    if(s.armor!=='bare')relief(k,root,'bMetal',plate,.041);
    line(k,root,'bTrim',plate.map(([x,y,p])=>[x,y,p+z*.028]),.019);
  }
  for(let i=0;i<3;i++){
    const y=-s.arm*(i*.096+.23);
    for(const z of [-1,1])line(k,elbow,i===1?'bInlay':'bTrim',
      f([[-r*.6,y,z*r*.31],[-r*.198,y-.019,z*r*.49],[r*.61,y-.03,z*r*.45],[r*.86,y+.015,z*r*.21]]),.015);
  }
  const armShell=s.pauldron;
  if(armShell){
    const wide=armShell==='spines'?1.21:armShell==='round'?1.11:1.03;
    const width=r*wide,rows=s.mobile?2:3;
    for(let i=0;i<rows;i++){
      const y=.086-i*.089,w=width*(1+i*.089);
      const loop=f([[.035,y+.051,w*.94],[w*.68,y+.104,w*.78],[w*1.37,y+.039,.018],
        [w*1.28,y-.049,-w*.79],[w*.52,y-.112,-w*.95],[-w*.17,y-.081,-w*.61]]);
      relief(k,root,i%2?'bOxide':'bMetal',loop,.024);
      line(k,root,i%2?'bMetal':'bTrim',loop.slice(1,5),.013);
      if(armShell==='spines'&&i%2===0)mass(k,root,'bBone',
        f([[w*1.23,y,-w*.51,.034],[w*1.48,y+.12,-w*.67,.033],
          [w*1.83,y+.167,-w*.93,.004]]),7,7,2.27,.19);
    }
  }
  mass(k,hand,'bFlesh',f([[.00,.077,.00,.068,.051],[.025,.003,.039,.081,.063],[.031,-.068,.091,.087,.050],
    [.045,-.112,.106,.078,.036]]),11,10,2.54,.16);
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.035;
    line(k,hand,'bMetal',f([[x,-.021,.109,.014],[x+.025,-.076,.15,.015],[x+.037,-.111,.113,.009]]));
  }
  return {root,elbow,hand,side};
}

function leg(k,body,side,s,raised=false){
  const hip=k.bone(body,side*s.chest*.45,-.066,-.025),knee=k.bone(hip,side*.024,-s.leg*.52,.076);
  const boot=k.bone(knee,side*.013,-s.leg*.49,.009);
  const r=s.chest*.32;
  mass(k,hip,'bCloth',[[0,.121,-.028,r,r*.94],[0,-s.leg*.20,.013,r*.90,r*.74],[0,-s.leg*.51,.075,r*.73,r*.70]],13,11);
  mass(k,knee,'bMetal',[[0,.091,.013,r*.78,r*.71],[0,-.152,-.008,r*.81,r*.82],
    [side*.012,-s.leg*.40,.022,r*.56,r*.57],[side*.012,-s.leg*.52,.018,r*.50,r*.56]],14,11,2.61,.16);
  mass(k,boot,'bShadow',[[0,-.043,.19,r*.66,r*.56],[0,-.021,.101,r*.71,r*.62],[0,.014,-.04,r*.55,r*.61]],12,10,2.89,.13);
  relief(k,knee,'bInlay',[[-r*.67,.040,.099],[r*.61,.067,.094],[r*.58,-.13,.133],[r*.23,-s.leg*.44,.114],
    [-r*.28,-s.leg*.44,.114],[-r*.61,-.13,.129]],.035);
  line(k,knee,'bTrim',[[-r*.35,.046,.135],[0,-.069,.161],[r*.44,.043,.149]],.02);
  if(raised)hip.rotation.x=side*.22;
  return {hip,knee,boot,side};
}

function weapon(k,hand,type,side=1){
  const joint=k.bone(hand,.016,-.013,.122);
  if(type==='fist'||type==='shield')return joint;
  if(type==='orb'||type==='loop'||type==='disc'){
    const radius=type==='disc'?.31:type==='loop'?.26:.21;
    hoop(k,joint,'bInlay',radius,.037,30);
    hoop(k,joint,'bTrim',radius*.74,.014,24,0,0,.070);
    stone(k,joint,'glow',0,0,.063,radius*.56,radius*.61,radius*.32);
    for(let i=0;i<9;i++){
      const a=i*TAU/9,x=Math.sin(a),y=Math.cos(a);
      mass(k,joint,'bOxide',[[x*radius*.70,y*radius*.70,.019,.035],[x*radius*1.07,y*radius*1.07,.023,.042],
        [x*radius*1.26,y*radius*1.26,.037,.006]],6,6,2.66,.13);
    }
    return joint;
  }
  if(type==='book'){
    for(const side of signs){
      const flake=k.bone(joint,0,0,0);
      flake.rotation.set(.57,side*.24,0);
      const page=reflect(side,[[0,-.21,.013],[.269,-.23,.037],[.281,.211,.077],[.015,.175,.009]]);
      relief(k,flake,'bMetal',page,.062);
      relief(k,flake,'bBone',page.map(([x,y,z])=>[x*.94,y*.91,z+.047]),.028);
      for(let row=0;row<5;row++)line(k,flake,'bOxide',reflect(side,[[.049,-.119+row*.055,.097],[.20,-.132+row*.060,.141]]),.008);
    }
    return joint;
  }
  if(type==='fan'){
    for(let i=0;i<12;i++){
      const a=i*.216-1.17,x=Math.sin(a),y=Math.cos(a);
      relief(k,joint,i%2?'bCloth':'bInlay',[[x*.067,y*.067,0],[x*.61-.062,y*.61+.04,.027],
        [x*.68+.035,y*.68-.02,.045],[x*.58+.091,y*.58-.045,.024]],.035);
      line(k,joint,'bTrim',[[0,0,.041],[x*.32,y*.32,.033],[x*.63,y*.63,.051]],.014);
    }
    return joint;
  }
  if(type==='bow'){
    const limb=[[0,0,.03,.042],[.172,.29,.037,.061],[.29,.567,.016,.055],[.236,.767,-.008,.044],[.345,.862,.006,.006]];
    for(const part of signs){
      const f=pt=>pt.map(([x,y,z,r])=>[x,y*part,z,r]);
      mass(k,joint,'bInlay',f(limb),16,8,2.1,.14);
      line(k,joint,'bBone',f(limb.map(([x,y,z,r])=>[x-.012,y,z+.04,r*.37])));
    }
    const cord=k.bone(joint,.341,0,0);
    line(k,cord,'bInlay',[[0,-.86,.008],[-.086,0,.019],[0,.86,.008]],.011);
    joint.userData.cord=cord;
    return joint;
  }
  if(type==='mace'){
    mass(k,joint,'bWood',[[0,-.42,0,.038],[0,.12,0,.048],[.025,.729,.045,.043],[.037,1.26,.064,.039]],17,9);
    const cage=k.bone(joint,.037,1.27,.067);
    stone(k,cage,'bInlay',0,.150,0,.124,.166,.118);
    for(let ray=0;ray<6;ray++){
      const a=ray*TAU/6,x=Math.sin(a),z=Math.cos(a);
      mass(k,cage,'bTrim',[[x*.19,-.018,z*.18,.034],[x*.23,.12,z*.21,.041],
        [x*.146,.26,z*.14,.028],[x*.026,.389,z*.026,.005]],11,8,2.35,.16);
    }
    hoop(k,cage,'bMetal',.201,.026,18,0,.12,0);
    joint.userData.cage=cage;
    return joint;
  }
  const isAxe=['axe','crescent'].includes(type),staff=['branch','hook','sceptre','trident','flame','staff'].includes(type);
  const length=isAxe?1.37:staff?1.28:type==='spear'?1.62:type==='dagger'?.47:.92;
  mass(k,joint,'bWood',[[0,staff?-.72:-.265,0,.038,.042],[0,.138,0,.046,.049],[.012,length*.85,.017,.043,.043],
    [0,length,.014,.029,.036]],15,10,2.10,.15);
  for(let i=0;i<6;i++){
    const ring=k.bone(joint,0,-.17+i*.073,0);
    ring.rotation.x=PI*.50;
    hoop(k,ring,i%2?'bOxide':'bTrim',.048,.012,10);
  }
  if(isAxe){
    for(const sign of type==='axe'?signs:[side]){
      const f=p=>reflect(sign,p),h=length*.73;
      const edge=f([[.013,h+.093,.009],[.236,h+.35,.03],[.517,h+.474,.05],[.704,h+.287,.074],
        [.632,h-.093,.088],[.308,h-.182,.059],[.407,h+.038,.041],[.222,h+.103,.028]]);
      relief(k,joint,'bMetal',edge,.073);
      for(const face of signs){
        line(k,joint,'bInlay',edge.slice(1,7).map(([x,y,z])=>[x,y,z+face*.049]),.026);
        relief(k,joint,'bOxide',f([[.15,h+.138,face*.068],[.411,h+.364,face*.094],[.547,h+.264,face*.095],
          [.528,h+.116,face*.093],[.303,h+.153,face*.094]]),.026);
      }
    }
  }else if(staff){
    const prongs={branch:4,hook:1,sceptre:3,trident:3,flame:5,staff:2}[type];
    const h=length,wide=type==='hook'?.41:type==='branch'?.35:.205;
    for(let i=0;i<prongs;i++){
      const a=i*TAU/prongs+PI*.23,x=Math.sin(a)*wide,z=Math.cos(a)*wide*.69;
      const prong=[[0,h-.20,0,.074],[x*.53,h+.105,z*.48,.059],[x,h+.286+(i%2)*.177,z,.044],
        [x*(type==='hook'?.51:1.16),h+.411+(i%2)*.131,z*1.19,.004]];
      mass(k,joint,type==='branch'?'bWood':'bMetal',prong,14,10,2.42,.23);
      line(k,joint,'bInlay',prong.map(([a,b,c,r])=>[a,b,c+.026,r*.37]));
      if(type==='branch')for(const d of signs)mass(k,joint,'bInlay',[[x*.61,h+.13,z*.68,.022],[x*.98+d*.074,h+.174,z+d*.046,.051],
        [x*1.32+d*.145,h+.29,z+d*.093,.005]],8,6,2,.19);
    }
    stone(k,joint,'bInlay',0,h+.062,.042,.091,.15,.091);
  }else{
    const h=length,x=type==='spear'?.10:type==='dagger'?.071:type==='curved'?.23:.17;
    const edge=[[-x*.79,.24,.03],[x*.62,.22,.03],[x*.94,h*.62,.059],[x*.73,h*.92,.063],
      [type==='curved'?x*.94:.03,h+.097,.069],[-x*.78,h*.71,.06],[-x*.93,h*.45,.036]];
    relief(k,joint,'bMetal',edge,.051);
    for(const face of signs)line(k,joint,'bInlay',edge.slice(1,6).map(([x,y,z])=>[x,y,z+face*.038]),.018);
    line(k,joint,'bTrim',[[-.170,.228,.015],[0,.288,.071],[.171,.241,.021]],.036);
  }
  return joint;
}

function drapery(k,body,design,mobile){
  const joints=[];
  const long=design==='wings'||design==='imperial';
  const count=mobile?5:8;
  for(const side of signs){
    const wing=k.bone(body,side*.17,.551,-.23);
    for(let i=0;i<count;i++){
      const t=i/(count-1),s=side;
      const start=[s*t*.27,.06-t*.13,-.07],bend=[s*(.18+t*.30),-.23+t*.29,-.16-t*.25];
      const end=[s*(long?.36+t*.76:.27+t*.34),-.92+t*.32+(design==='wings'?.28*t:0),-.43-t*.64];
      k.geometry(wing,i%3?'bCloth':'bOxide',featherVane(start,bend,end,.081+(long?.037:0),i+55*side,9));
      if(i%3===0)line(k,wing,'bTrim',[[...start,.016],[...bend,.018],[...end,.005]]);
    }
    joints.push({wing,side});
  }
  return joints;
}

function attach(k,body,head,s,arms,mobile){
  const cast=k.bone(body,0,.46,-.20);
  const pieces=[];
  if(s.extra==='sun'||s.extra==='runes'){
    const back=k.bone(head,0,.11,-.285);
    const radius=s.extra==='sun'?.71:.54;
    hoop(k,back,'bOxide',radius,.039,38);
    hoop(k,back,'bInlay',radius+.025,.019,38,0,0,-.041);
    for(let i=0;i<10;i++){
      const a=i*TAU/10,x=Math.sin(a),y=Math.cos(a);
      relief(k,back,'bTrim',[[x*radius-y*.078,y*radius+x*.078,-.035],[x*(radius+.124),y*(radius+.12),-.051],
        [x*radius+y*.078,y*radius-x*.078,-.027],[x*(radius-.09),y*(radius-.08),.021]],.048);
      stone(k,back,'glow',x*radius,y*radius,.027,.029,.052,.027,-a);
    }
    pieces.push({joint:back,type:'halo'});
  }
  if(s.extra==='banners'||s.extra==='wings'){
    for(const {wing,side} of drapery(k,body,s.extra==='wings'?'wings':'imperial',mobile)){
      pieces.push({joint:wing,type:'wing',side});
    }
  }
  if(s.extra==='spider')for(const side of signs)for(let i=0;i<3;i++){
    const limb=k.bone(body,side*.26,.40+i*.083,-.265);
    const f=p=>reflect(side,p);
    const radius=.49+.19*i;
    mass(k,limb,'bMetal',f([[0,0,0,.079],[.27,.232,-.16,.092],[radius,.35,-.25,.070],
      [radius+.24,.14,-.28,.052],[radius+.29,-.14,-.38,.006]]),17,10,2.60,.23);
    line(k,limb,'bInlay',f([[.05,.068,.033],[.27,.249,-.098],[radius,.39,-.184],[radius+.22,.142,-.229]]),.018);
    pieces.push({joint:limb,type:'wing',side});
  }
  if(s.extra==='swords'){
    for(let i=0;i<4;i++){
      const a=i*TAU/4+PI*.25,rad=.78+i%2*.16;
      const joint=k.bone(cast,Math.sin(a)*rad,.30,Math.cos(a)*rad);
      const length=.42+i%2*.16;
      const blade=[[0,-.18,0],[.055,-.11,.022],[.064,length*.54,.016],[0,length+.063,0],
        [-.049,length*.52,.019],[-.046,-.121,.015]];
      relief(k,joint,'bInlay',blade,.026);
      for(const side of signs)line(k,joint,'glow',[[0,-.104,side*.027],
        [.007,length*.54,side*.024],[0,length-.026,side*.021]],.011);
      line(k,joint,'bTrim',[[-.106,-.158,.007],[0,-.127,.035],[.105,-.157,.005]],.021);
      pieces.push({joint,type:'orbit',a,rad,i});
    }
  }
  if(s.extra==='leaves')for(let i=0;i<7;i++){
    const a=i*2.4,rad=.66+(i%3)*.12;
    const leaf=k.bone(cast,Math.sin(a)*rad,.11+(i%4)*.25,Math.cos(a)*rad);
    relief(k,leaf,'bInlay',[[0,-.15,0],[.077,-.077,.020],[.09,.038,.072],[.046,.128,.118],
      [-.013,.199,.10],[-.072,.071,.068],[-.066,-.053,.027]],.025);
    line(k,leaf,'bTrim',[[0,-.15,.02],[.011,-.026,.071],[-.005,.091,.111],[-.014,.177,.115]],.011);
    pieces.push({joint:leaf,type:'orbit',a,rad,i});
  }
  if(s.extra==='arrows'){
    const quiver=k.bone(body,.17,.38,-.39);
    quiver.rotation.z=-.27;
    mass(k,quiver,'bCloth',[[0,-.41,-.04,.118,.095],[0,-.24,-.035,.123,.112],[0,.24,-.05,.157,.145],[0,.32,-.067,.168,.156]]);
    for(let i=0;i<6;i++){
      const x=Math.sin(i*TAU/6)*.094,z=Math.cos(i*TAU/6)*.114-.05;
      line(k,quiver,'bWood',[[x,.08,z,.018],[x,.79+i%2*.11,z,.012]]);
      for(const side of signs)relief(k,quiver,'bBone',[[x,z*.0+.51,z],[x+side*.056,.58,z],[x+side*.057,.72,z],[x,.77,z]],.008);
    }
    pieces.push({joint:quiver,type:'quiver'});
  }
  if(s.extra==='shards'||s.extra==='fire'||s.extra==='spectral'){
    for(let i=0;i<(mobile?5:8);i++){
      const a=i*2.4,rad=.68+(i%3)*.15;
      const joint=k.bone(cast,Math.sin(a)*rad,.12+(i%4)*.27,Math.cos(a)*rad);
      const spectral=s.extra==='spectral',fire=s.extra==='fire';
      if(spectral||fire){
        mass(k,joint,'bCloth',[[0,-.13,0,.088,.063],[.075,.042,0,.129,.11],[.078,.23,-.037,.092,.063],[.17,.40,-.09,.004,.006]],13,9,2.43,.28);
        line(k,joint,'bInlay',[[.049,-.09,.052],[.163,.071,.081],[.122,.232,.034],[.17,.38,-.049]],.022);
      }else{
        stone(k,joint,'bBone',0,0,0,.104,.25,.089,.27);
        relief(k,joint,'bInlay',[[0,.219,.021],[.089,.045,.054],[.008,-.234,.03],[-.042,-.023,.079]],.021);
      }
      pieces.push({joint,type:'orbit',a,rad,i});
    }
  }
  if(s.extra==='drum'){
    const drum=k.bone(body,0,.171,.429);
    drum.rotation.x=PI*.50;
    const lathe=new T.LatheGeometry([[.13,-.231],[.26,-.195],[.298,-.09],[.296,.116],[.247,.193],[.14,.221]]
      .map(([x,y])=>new T.Vector2(x,y)),22);
    k.geometry(drum,'bWood',lathe);
    for(const side of signs){
      const rim=k.bone(drum,0,side*.19,0);
      rim.rotation.x=PI*.5;
      hoop(k,rim,'bTrim',.256,.035,26);
      k.mesh(rim,'bar','bBone',0,0,0,.248,.043,.248,PI*.5);
    }
    for(let i=0;i<12;i++){
      const a=i*TAU/12,b=a+.23;
      line(k,drum,'bInlay',[[Math.sin(a)*.252,-.21,Math.cos(a)*.252],[Math.sin(b)*.313,.008,Math.cos(b)*.313],
        [Math.sin(a)*.257,.211,Math.cos(a)*.257]],.019);
    }
  }
  if(s.extra==='shield'){
    const shield=k.bone(arms[0].elbow,-.034,-.15,.21);
    const path=[[-.35,.271,.015],[0,.413,.057],[.34,.288,.03],[.303,-.149,.148],[0,-.439,.196],[-.257,-.193,.133]];
    relief(k,shield,'bOxide',path,.13);
    line(k,shield,'bTrim',path.map(([x,y,z])=>[x,y,z+.081]),.036);
    relief(k,shield,'bMetal',path.map(([x,y,z])=>[x*.68,y*.67,z+.068]),.068);
    stone(k,shield,'bInlay',0,.055,.186,.073,.131,.034);
    pieces.push({joint:shield,type:'shield'});
  }
  return {cast,pieces};
}

function humanoid(k,entry,s,mobile,mount){
  const body=k.bone(mount?.saddle??k.root,0,mount?.offset??(s.float?1.1:s.leg+.178),0);
  const chest=s.chest,y=s.length;
  const head=k.bone(body,0,y+.295,.047),lip=brow(k,head,entry.id,mobile);
  const hair=strands(k,head,s,mobile);
  crown(k,head,s.crown);
  const waist=s.waist,bell=s.bell;
  const inner=s.armor==='bare'?'bFlesh':'bCloth';
  mass(k,body,inner,[[0,-.183,-.046,waist*.92,waist*.80],[0,.017,-.047,waist*1.10,waist*.90],
    [0,y*.38,-.042,chest*.97,chest*.65],[0,y*.74,-.05,chest*1.04,chest*.71],[0,y*.94,-.04,chest*.84,chest*.65],
    [0,y*1.21,-.019,chest*.37,chest*.39]],21,16,2.73,.13);
  if(s.armor!=='bare')breastplate(k,body,s.armor,y*.74,chest);
  else for(const side of signs){
    mass(k,body,'bFlesh',reflect(side,[[.061,y*.53,.254,chest*.27,chest*.15],[.207,y*.74,.23,chest*.36,chest*.21],
      [.35,y*.90,.183,chest*.18,chest*.18]]),15,11,2.58,.18);
    const mark=s.extra==='drum'?'bInlay':'bOxide';
    line(k,body,mark,reflect(side,[[.067,y*.93,.24],[.176,y*.75,.275],[.29,y*.65,.252],[.31,y*.50,.241]]),.026);
    line(k,body,mark,reflect(side,[[.073,y*.84,.254],[.205,y*.70,.29],[.25,y*.54,.266]]),.009);
  }
  if(s.armor!=='bare'&&(!mount||barding[entry.id]))armorLap(k,body,s.armor,y*.74,chest,mobile,s.collar);
  const sash=k.bone(body,0,.07,0);
  mass(k,sash,'bWood',[[0,-.154,0,waist*1.12,waist*.96],[0,-.092,.021,waist*1.14,waist*.98],[0,-.034,.034,waist*1.13,waist*.96]],
    9,18,2.53,.09);
  for(const face of signs){
    hoop(k,sash,'bTrim',.111,.023,15,0,-.09,face*waist*.99+.024);
    stone(k,sash,'bInlay',0,-.093,face*waist*1.02,.069,.071,.044,TAU/8);
  }
  const panels=dress(k,sash,{length:s.skirt,waist,bell,hem:s.hem,embroidery:s.armor==='imperial'},
    mobile?Math.max(4,s.panels-(mount?3:2)):s.panels);
  const legs=s.float?[]:signs.map(side=>leg(k,body,side,s,!!mount));
  if(mount)for(const l of legs){
    l.hip.position.x=l.side*(mount.width+.032);
    l.hip.rotation.z=l.side*.41;
    l.knee.rotation.x=-.48;
  }
  const arms=signs.map(side=>{
    const scaled={...s,chest:chest*(side===1?s.asymmetric??1:1)};
    return arm(k,body,scaled,side);
  });
  const [left,right]=arms.map((item,i)=>weapon(k,item.hand,s.weapons[i]??'fist',item.side));
  const alternateArms=[];
  if(entry.id==='m081'){
    for(const side of signs){
      const limb=arm(k,body,{...s,chest:s.chest*.67,sleeve:s.sleeve*.73,arm:s.arm*.67},side);
      limb.root.position.set(side*s.chest*.62,.333,.049);
      const crescent=weapon(k,limb.hand,'crescent',side);
      crescent.scale.setScalar(.68);
      alternateArms.push({...limb,crescent});
    }
  }
  const tail=drapery(k,body,s.flow??'mantle',mobile);
  const {cast,pieces}=attach(k,body,head,s,arms,mobile);
  if(!mount)pieces.push(...tailoredCoat(k,body,s,mobile));
  const aim=s.weapons.includes('bow')||s.weapons.includes('spear');
  return {body:mount?.body??body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,
    pattern:mount?'gallop':s.float?'hover':aim?'aim':s.armor==='bare'?'slam':'duel',
    cataloguePose({beat,headtime,wind,strike,travel,fall,step,stage}){
      const read=(s.move??1),back=Math.sin(beat*.55)*.06;
      mount?.pose({beat,wind,strike,travel,step,stage});
      body.rotation.x=back*.43+travel*.091+wind*s.lean-strike*s.snap+fall*.17;
      body.rotation.z=(wind-strike)*s.lean*.42+Math.sin(step)*travel*.067;
      head.rotation.x=back*.63-wind*.21+strike*.14;
      head.rotation.y=Math.sin(headtime*2.46)*.081*(1-wind)+strike*.24*read;
      lip.rotation.x=wind*.11+strike*.25+stage*.018;
      hair.rotation.x=-travel*.14+strike*.20+Math.sin(beat*.62)*.061;
      hair.rotation.z=Math.sin(beat*.53)*.067+wind*.13*read;
      for(const {root,elbow,hand,side} of arms){
        const forward=(side===1?s.right:s.left);
        root.rotation.x=back+Math.sin(step+side*PI*.5)*.27*travel-wind*forward+strike*(aim?-.53:s.thrust*forward);
        root.rotation.y=side*(.09+wind*.24)+strike*side*.31;
        root.rotation.z=side*(s.spread+wind*.56-strike*.28+stage*.049);
        elbow.rotation.x=-.21-wind*.63+strike*.68+back*.35;
        elbow.rotation.y=side*(wind*.14+strike*.16);
        hand.rotation.z=side*(wind*.23-strike*.26);
      }
      for(const {root,elbow,crescent,side} of alternateArms){
        root.rotation.set(-.67-back*.21+wind*.43-strike*.94,side*(.28+wind*.49),side*(.69+wind*.31-strike*.51));
        elbow.rotation.x=-.29+wind*.66-strike*.57;
        crescent.rotation.x=.45-wind*.35+strike*.48;
        crescent.rotation.z=side*(.30-wind*.51+strike*.27);
      }
      left.rotation.set(-.19-strike*.50,wind*.35,.40+wind*.25);
      right.rotation.set(aim?-.22+wind*.37:-.52+wind*.51-strike*.17,wind*.23,-.29+strike*.42*read);
      for(const tool of [left,right])if(tool.userData.cord)tool.userData.cord.scale.x=1+wind*2.34;
      if(right.userData.cage)right.userData.cage.rotation.y=headtime*(.65+wind*.22)+strike*.49;
      for(const {hip,knee,boot,side} of legs){
        const gait=Math.sin(step+side*PI*.5)*travel;
        hip.rotation.x=mount?-.23+gait*.25:gait*.58+wind*.15-strike*.13;
        knee.rotation.x=mount?-.39+gait*.16:-(Math.max(0,gait)*.68+wind*.10);
        boot.rotation.x=-Math.min(0,gait)*.38+strike*.067;
      }
      for(const {joint,a,index} of panels){
        joint.rotation.y=a+Math.sin(beat*.52+index*.74)*.073+wind*.175*read;
        joint.rotation.x=Math.sin(beat*.632+index*.62)*.109+travel*Math.cos(a)*.148+strike*.16;
      }
      for(const {wing,side} of tail)wing.rotation.set(-travel*.155+back*2.51-wind*.13,
        side*(back+wind*.27-strike*.29),side*(back*.8+wind*.32));
      cast.rotation.y=headtime*(s.orbit??.42)+wind*.39;
      for(const {joint,type,side,a,rad,i} of pieces){
        if(type==='wing')joint.rotation.set(back*2.46-travel*.25+strike*.37,side*(.14+wind*.43-strike*.28),side*(.09+back+wind*.22));
        else if(type==='halo'){joint.rotation.z=headtime*(s.orbit??.47);joint.scale.setScalar(1+.24*wind+.15*stage);}
        else if(type==='orbit'){
          joint.position.set(Math.sin(a)*(rad+wind*.27+strike*.15),Math.sin(beat*.62+i)*.15+.12+(i%4)*.27,
            Math.cos(a)*(rad+wind*.27+strike*.15));
          joint.rotation.set(beat*.32+i*.4,i+.97*headtime,a+.21*strike);
        }else if(type==='shield')joint.rotation.x=wind*.49-strike*.43;
        else if(type==='quiver')joint.rotation.x=back+travel*.23;
      }
    },
  };
}

const robes={
  m060:{face:'sage',hair:'long',crown:'cloth-pin',armor:'lamellar',weapons:['fist','disc'],extra:'shards',
    chest:.34,waist:.23,bell:.49,skirt:1.19,sleeve:.185,left:1.03,right:.54,flow:'wings',float:true},
  m061:{face:'sage',hair:'bun',crown:'cloth',armor:'lamellar',weapons:['fist','branch'],extra:'shield',
    chest:.31,waist:.225,bell:.44,skirt:.83,sleeve:.131,leg:.74,lean:.29,left:.56,right:.93},
  m062:{face:'face',hair:'pony',crown:'cloth',armor:'vest',weapons:['dagger','fist'],extra:'none',
    chest:.258,waist:.155,bell:.29,skirt:.53,sleeve:.104,leg:.98,right:.27,left:1.39,move:-1,spread:.13,asymmetric:.83},
  m063:{face:'oni',hair:'mane',crown:'stag',armor:'lamellar',weapons:['spear','fist'],extra:'fire',
    chest:.40,waist:.21,bell:.46,skirt:1.09,sleeve:.159,leg:.96,flow:'imperial',lean:.19,left:1.17,right:.37},
  m064:{face:'helm',hair:'long',crown:'flame',armor:'imperial',weapons:['curved','sword'],extra:'shards',
    chest:.38,waist:.25,bell:.49,skirt:1.22,sleeve:.193,leg:1.11,asymmetric:1.11,flow:'wings',left:.91,right:1.24},
  m065:{face:'ghost',hair:'mane',crown:'branches',armor:'vest',weapons:['hook','fist'],extra:'none',
    chest:.33,waist:.19,bell:.42,skirt:1.21,sleeve:.177,leg:1.14,hem:2,spread:.29,left:1.01,right:.49,orbit:.15},
  m066:{face:'oni',hair:'beard',crown:'sun',armor:'imperial',weapons:['sceptre','sword'],extra:'runes',
    chest:.35,waist:.224,bell:.53,skirt:1.17,sleeve:.175,leg:1.08,asymmetric:.91,left:.66,right:.99},
  m067:{face:'sage',hair:'beard',crown:'square',armor:'imperial',weapons:['fist','sword'],extra:'banners',
    chest:.40,waist:.25,bell:.65,skirt:1.24,sleeve:.24,length:.90,left:.77,right:1.03,float:true,panels:11,flow:'imperial'},
  m068:{face:'helm',hair:'beard',crown:'square',armor:'imperial',weapons:['sword','sword'],extra:'sun',
    chest:.49,waist:.28,bell:.70,skirt:1.35,sleeve:.225,length:.92,left:1.37,right:1.62,float:true,panels:12,flow:'imperial',orbit:-.55},
  m069:{face:'sage',hair:'pony',crown:'stag',armor:'lamellar',weapons:['loop','staff'],extra:'runes',
    chest:.34,waist:.235,bell:.42,skirt:.96,sleeve:.181,leg:.88,left:.82,right:1.14,flow:'imperial',orbit:.65},
  m070:{face:'face',hair:'bun',crown:'cloth',armor:'bare',weapons:['fist','axe'],extra:'none',
    chest:.51,waist:.269,bell:.48,skirt:.81,sleeve:.21,length:.777,leg:1.02,left:.37,right:1.43,lean:.30,snap:.29},
  m071:{face:'face',hair:'long',crown:'cloth-pin',armor:'vest',weapons:['curved','spear'],extra:'none',
    chest:.255,waist:.176,bell:.365,skirt:.99,sleeve:.16,length:.80,leg:1.04,left:.92,right:1.31,float:true,flow:'wings'},
  m072:{face:'face',hair:'bun',crown:'sun',armor:'bare',weapons:['fist','orb'],extra:'drum',
    chest:.278,waist:.206,bell:.67,skirt:1.17,sleeve:.13,left:.50,right:1.11,lean:-.20,float:true,flow:'imperial'},
  m073:{face:'sage',hair:'beard',crown:'sun',armor:'imperial',weapons:['orb','book'],extra:'fire',
    chest:.36,waist:.229,bell:.49,skirt:.91,sleeve:.22,leg:.86,left:1.14,right:.90,spread:.23,orbit:-.59},
  m074:{face:'face',hair:'pony',crown:'cloth',armor:'vest',weapons:['hook','fist'],extra:'none',
    chest:.288,waist:.206,bell:.38,skirt:.62,sleeve:.150,length:.67,leg:.725,left:1.04,right:.43,spread:.22,snap:.28},
  m075:{face:'oni',hair:'pony',crown:'cloth-pin',armor:'lamellar',weapons:['curved','dagger'],extra:'wings',
    chest:.42,waist:.21,bell:.78,skirt:1.34,sleeve:.15,length:.80,leg:1.11,left:1.2,right:.88,panels:12,flow:'wings',float:true},
  m076:{face:'oni',hair:'mane',crown:'sun',armor:'imperial',weapons:['sword','flame'],extra:'spider',
    chest:.45,waist:.24,bell:.72,skirt:1.31,sleeve:.18,left:.85,right:1.26,panels:11,flow:'imperial',float:true},
  m077:{face:'face',hair:'bun',crown:'cloth-pin',armor:'vest',weapons:['fist','fan'],extra:'spectral',
    chest:.268,waist:.18,bell:.64,skirt:1.18,sleeve:.173,length:.67,left:1.19,right:1.37,float:true,orbit:-.38,move:-1},
  m078:{face:'sage',hair:'beard',crown:'branches',armor:'bare',weapons:['branch','fist'],extra:'leaves',
    chest:.55,waist:.30,bell:.47,skirt:.81,sleeve:.243,length:.70,leg:.91,left:1.18,right:.48,lean:.21,snap:.25},
  m079:{face:'ghost',hair:'long',crown:'stag',armor:'vest',weapons:['trident','loop'],extra:'wings',
    chest:.315,waist:.171,bell:.59,skirt:1.29,sleeve:.151,left:1.22,right:.92,panels:11,flow:'wings',float:true,orbit:.79},
  m080:{face:'skull',hair:'beard',crown:'cloth',armor:'bare',weapons:['loop','disc'],extra:'banners',
    chest:.415,waist:.23,bell:.60,skirt:1.22,sleeve:.173,length:.80,left:1.21,right:1.10,panels:11,float:true,lean:-.19},
  m081:{face:'oni',hair:'bun',crown:'cloth-pin',armor:'lamellar',weapons:['crescent','curved'],extra:'fire',
    chest:.38,waist:.224,bell:.54,skirt:.99,sleeve:.144,leg:1.06,left:1.06,right:1.26,lean:.23,flow:'wings'},
  m082:{face:'ghost',hair:'mane',crown:'cloth',armor:'vest',weapons:['loop','loop'],extra:'spectral',
    chest:.465,waist:.25,bell:.65,skirt:.96,sleeve:.191,length:.67,left:1.2,right:1.18,panels:7,float:true,orbit:-.67},
  m083:{face:'helm',hair:'pony',crown:'cloth',armor:'lamellar',weapons:['fist','spear'],extra:'none',
    chest:.34,waist:.19,bell:.36,skirt:.59,sleeve:.148,leg:1.05,left:.45,right:1.65,asymmetric:1.35,lean:.25,snap:.36},
  m084:{face:'oni',hair:'long',crown:'stag',armor:'lamellar',weapons:['bow','dagger'],extra:'arrows',
    chest:.353,waist:.232,bell:.37,skirt:.74,sleeve:.145,leg:.99,left:1.40,right:.38,move:-1,snap:.192},
  m089:{face:'oni',hair:'mane',crown:'flame',armor:'imperial',weapons:['shield','flame'],extra:'shield',
    chest:.395,waist:.242,bell:.44,skirt:.65,sleeve:.20,length:.66,leg:.71,left:.49,right:1.35},
  m090:{face:'helm',hair:'mane',crown:'stag',armor:'imperial',weapons:['curved','curved'],extra:'swords',
    chest:.395,waist:.243,bell:.43,skirt:.65,sleeve:.183,length:.68,leg:.715,left:1.32,right:1.40,orbit:.85},
  m091:{face:'oni',hair:'beard',crown:'branches',armor:'imperial',weapons:['fist','mace'],extra:'none',
    chest:.389,waist:.240,bell:.49,skirt:.70,sleeve:.19,length:.64,leg:.715,left:.42,right:1.52,flow:'wings'},
  m092:{face:'helm',hair:'beard',crown:'sun',armor:'imperial',weapons:['fist','spear'],extra:'none',
    chest:.424,waist:.249,bell:.44,skirt:.66,sleeve:.19,length:.72,leg:.762,left:.41,right:1.71,snap:.29},
  m093:{face:'skull',hair:'long',crown:'sun',armor:'imperial',weapons:['fist','curved'],extra:'shards',
    chest:.415,waist:.251,bell:.45,skirt:.68,sleeve:.18,length:.71,leg:.76,left:.27,right:1.51,orbit:.34},
  m094:{face:'oni',hair:'mane',crown:'flame',armor:'imperial',weapons:['fist','curved'],extra:'none',
    chest:.435,waist:.26,bell:.45,skirt:.68,sleeve:.179,length:.73,leg:.745,left:.36,right:1.64,lean:.23},
  m099:{face:'oni',hair:'mane',crown:'stag',armor:'imperial',weapons:['crescent','crescent'],extra:'shards',
    chest:.664,waist:.385,bell:.58,skirt:.94,sleeve:.30,length:.82,leg:.89,left:1.24,right:1.33,panels:9,asymmetric:1.14,snap:.315},
  m102:{face:'oni',hair:'mane',crown:'stag',armor:'bare',weapons:['crescent','axe'],extra:'none',
    chest:.617,waist:.30,bell:.48,skirt:.67,sleeve:.228,length:.82,leg:.96,left:.54,right:1.28,lean:.27,snap:.38},
  m104:{face:'helm',hair:'bun',crown:'cloth',armor:'bare',weapons:['fist','fist'],extra:'shards',
    chest:.72,waist:.39,bell:.49,skirt:.64,sleeve:.30,length:.81,leg:.85,left:1.02,right:1.49,lean:.32,snap:.44},
  m105:{face:'sage',hair:'pony',crown:'square',armor:'lamellar',weapons:['orb','fist'],extra:'spectral',
    chest:.281,waist:.209,bell:.57,skirt:1.27,sleeve:.127,length:.78,left:1.19,right:.96,panels:12,float:true,orbit:.75},
  m110:{face:'goat',hair:'mane',crown:'cloth-pin',armor:'bare',weapons:['disc','orb'],extra:'fire',
    chest:.527,waist:.31,bell:.49,skirt:.69,sleeve:.22,length:.74,leg:.92,left:.83,right:1.22,panels:8,lean:.18,snap:.29},
  m112:{face:'helm',hair:'beard',crown:'flame',armor:'vest',weapons:['crescent','loop'],extra:'none',
    chest:.369,waist:.21,bell:.59,skirt:1.13,sleeve:.154,length:.81,leg:1.10,left:1.08,right:.97,asymmetric:1.14,panels:11},
};

const neutral={length:.71,arm:.76,leg:.93,lean:.18,snap:.24,thrust:1.12,spread:.19,panels:8,hem:1};
const coatStyles={
  m060:'broken',m061:'prayer',m062:'sash',m063:'epaulettes',m064:'sabre',m065:'jade',m066:'prayer',m067:'sash',
  m068:'sabre',m069:'jade',m070:'sash',m071:'sabre',m072:'sash',m073:'prayer',m075:'broken',m076:'sabre',
  m077:'sash',m078:'jade',m079:'broken',m080:'epaulettes',m081:'sabre',m082:'broken',m083:'sabre',
  m084:'sash',m099:'epaulettes',m102:'broken',m104:'broken',m105:'prayer',m110:'epaulettes',m112:'sash',
};
const shoulderCuts={
  m060:['linen','spines'],m061:['linen','round'],m062:['wrap','rail'],m063:['scales','spines'],m064:['scales','spines'],
  m065:['wrap','rail'],m066:['gilt','round'],m067:['gilt','round'],m068:['gilt','spines'],m069:['wrap','round'],
  m071:['wrap','rail'],m073:['gilt','round'],m074:['linen',null],m075:['scales','spines'],m076:['gilt','spines'],
  m077:['linen','rail'],m079:['wrap','spines'],m081:['scales','spines'],m082:['wrap','round'],m083:['scales','rail'],
  m084:['scales','rail'],m089:['scales',null],m090:['scales','spines'],m091:['gilt','round'],m092:['gilt','round'],
  m093:['scales','spines'],m094:['scales','spines'],m099:['scales','spines'],m105:['gilt','round'],m112:['gilt','round'],
};

// The base, cloth, plated, patinated and inlaid colors are kept separate on the rig
// so runes, embroidery and edges retain their own relief under grazing light.
const pigments={
  m060:[0x0d1927,0x1c4659,0x768d8b,0x119aa1,0xafe0e3],
  m061:[0x161b17,0x4f5340,0xa0a698,0x507929,0xadb979],
  m062:[0x2b1b13,0x736048,0x625139,0xb08f59,0xe0d3bc],
  m063:[0x191723,0x552e30,0x664139,0x9a4428,0xcd9b67],
  m064:[0x10142a,0x1c407f,0x3b4a7c,0x306ed7,0xb5d0e6],
  m065:[0x14271a,0x4a5f28,0x687b53,0x578824,0xc9ef8c],
  m066:[0x1d1d1d,0x705724,0x827048,0x8e712f,0xd6ca9a],
  m067:[0x11131d,0x20222b,0x9a782e,0xbf932d,0xebc76c],
  m068:[0x171823,0x292633,0x97752b,0xcd9936,0xf2d177],
  m069:[0x181822,0x2b4b33,0x907041,0x37905b,0xc7ad7a],
  m070:[0x251817,0x632b1e,0x703632,0xda3224,0xd9a678],
  m071:[0x141c30,0x202c4f,0x2c3b5b,0x2d56a2,0xe0e8ee],
  m072:[0x493027,0xb6a28b,0xb37c39,0xf58126,0xe6d1a9],
  m073:[0x3a1c1c,0x87383c,0x68432b,0xcf4b22,0xdeb380],
  m074:[0x301d22,0x995b4a,0x9b5134,0xba5028,0xf0ba89],
  m075:[0x1d121e,0x36242b,0x3f262b,0xa01923,0x9b9ba2],
  m076:[0x141014,0x262320,0x575035,0x9d711d,0xceae55],
  m077:[0x242c42,0xa2bbd2,0x59748f,0x60a7d9,0xe6ecdb],
  m078:[0x352a1d,0x657048,0x68674c,0xa9bb30,0xdcc9a3],
  m079:[0x10292b,0x17434b,0x467879,0x21b5a4,0x8ae3d0],
  m080:[0x131e32,0x293e71,0x617caa,0x4675e9,0xa6bcd5],
  m081:[0x22191b,0x4e2b25,0x694738,0xe43b15,0xd9ae7b],
  m082:[0x111d30,0x1a2f50,0x2b5d82,0x2b9bdb,0xc5e8f4],
  m083:[0x162524,0x233e2f,0x375247,0x36a64b,0x8ace94],
  m084:[0x241f22,0x302d29,0x4f4732,0xbb941d,0xd7c08d],
  m089:[0x201419,0x7d2c20,0x804624,0xde4d16,0xefb068],
  m090:[0x15182a,0x202b62,0x28629a,0x24a3ed,0xd1aa6b],
  m091:[0x1a2019,0x3c5934,0x578153,0x35bd67,0xd5b378],
  m092:[0x2d201b,0x694d2a,0x876a32,0xcc980e,0xeed386],
  m093:[0x30363c,0xa6a8aa,0xa3a298,0xdddbc3,0xeae9df],
  m094:[0x101318,0x23242b,0x414548,0x746036,0xa6a09a],
  m095:[0x272341,0x743184,0x643b71,0xc34256,0xb2e2e3],
  m096:[0x48281e,0xb97429,0xa76029,0xe75123,0xf5d27c],
  m099:[0x21242a,0x805249,0x437280,0x61bbc3,0xb2c9cb],
  m100:[0x151c2c,0x272f45,0x55717d,0x629fad,0xb7d0cd],
  m102:[0x321714,0x9e2d1e,0x6a2a23,0xd94c1f,0xe7b672],
  m103:[0x27110f,0x81261c,0x54342e,0xde4c16,0xd6a06a],
  m104:[0x393a34,0x747d73,0x7a7d71,0xbb9b55,0xdad9be],
  m105:[0x301a22,0x743331,0x674635,0x933321,0xd7b174],
  m108:[0x15191e,0x39444e,0x4e7180,0x7db6cb,0xd1dbd7],
  m110:[0x452219,0x754d34,0x9c6b36,0xc07126,0xd9c5a3],
  m111:[0x22191e,0x662624,0x522a2d,0x8f303d,0xaa9b8f],
  m112:[0x272621,0x514a3f,0x746957,0xb37622,0xbdaf9d],
};

function finishing(id,[shadow,fabric,metal,inlay,bone]){
  const fur=['m074','m078','m089','m108','m110','m111'].includes(id);
  const scale=['m095','m096','m102','m103','m111'].includes(id);
  const stonework=id==='m104';
  const patina=new T.Color(metal).lerp(new T.Color(shadow),.47).getHex();
  const hair=id==='m074'?0x25202a:id==='m075'?0x86898c:id==='m108'?0x9faeac:fur?fabric:0x313039;
  const light=[0xf0c3a0,0xbcb6a0,0xcd908c];
  return {
    bShadow:[shadow,.08,.86,'cloth'],bCloth:[fabric,.11,.76,scale?'hide':'cloth'],
    bMetal:[metal,stonework?.27:.67,stonework?.78:.48,stonework?'stone':'iron'],
    bTrim:[new T.Color(inlay).lerp(new T.Color(bone),.54).getHex(),.51,.44,'bronze'],
    bOxide:[patina,.46,.63,'stone'],bInlay:[inlay,.37,.37,'gem'],bBone:[bone,.18,.58,stonework?'stone':'bone'],
    bWood:[new T.Color(metal).lerp(new T.Color(0x483126),.52).getHex(),.15,.83,'hide'],
    bFur:[id==='m074'?0xb47a3e:id==='m089'?0x8f3231:id==='m108'?0x868e91:fabric,.03,.85,'hide'],
    bHair:[hair,.14,.72,'hide'],bFlesh:[id==='m104'?metal:id==='m080'?bone:scale?fabric:
      new T.Color(fabric).lerp(new T.Color(light[Number(id.slice(1))%3]),.66).getHex(),.04,.76,stonework?'stone':'hide'],
  };
}

export const finishesB=Object.fromEntries(Object.entries(pigments).map(([id,palette])=>[id,finishing(id,palette)]));

function finishRelief(k,id){
  const [shadow,,metal,inlay,bone]=pigments[id];
  const oxidized=new T.Color(shadow).lerp(new T.Color(metal),.23);
  const bevel=new T.Color(bone).lerp(new T.Color(inlay),.20);
  const treatments={bMetal:0,bTrim:0,bOxide:2,bWood:2,bBone:2,bCloth:1,bShadow:1,bInlay:3,bHair:2,bFur:2};
  for(const [name,category] of Object.entries(treatments)){
    const material=k.materials[name];
    const original=material.onBeforeCompile,key=material.customProgramCacheKey();
    material.customProgramCacheKey=()=>key+'|cast-relief';
    material.onBeforeCompile=shader=>{
      original.call(material,shader);
      Object.assign(shader.uniforms,{
        ledgerOxide:{value:oxidized},ledgerEdge:{value:bevel},ledgerFinish:{value:category},
        ledgerGrain:{value:(Number(id.slice(1))%13)*.315},
      });
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        uniform vec3 ledgerOxide,ledgerEdge;
        uniform float ledgerFinish,ledgerGrain;
      `).replace('#include <color_fragment>',`#include <color_fragment>
        vec3 metalAt=vPaintPoint+vec3(ledgerGrain,ledgerGrain*.73,ledgerGrain*.137);
        float erosion=paintGrain(metalAt*vec3(19.4,25.3,14.5));
        float laid=(.54+.46*sin((metalAt.y+erosion*.135)*131.))*cos(metalAt.z*109.+metalAt.x*97.);
        float reading=1.-smoothstep(.15,.67,fwidth(laid));
        float wear=smoothstep(.49,.79,erosion);
        float ridgeBright=pow(max(0.,dot(normalize(vPaintNormal),normalize(vec3(.41,.79,-.45)))),2.);
        if(ledgerFinish<.5){
          diffuseColor.rgb=mix(ledgerOxide*.65+diffuseColor.rgb*.46,diffuseColor.rgb,wear*.81);
          diffuseColor.rgb+=ledgerEdge*(wear*.065+ridgeBright*.071+max(0.,laid)*wear*reading*.048);
        }else if(ledgerFinish<1.5){
          diffuseColor.rgb*=.79+erosion*.29+laid*reading*.083;
        }else if(ledgerFinish<2.5){
          diffuseColor.rgb*=.78+erosion*.34+wear*ridgeBright*.127;
        }else{
          diffuseColor.rgb*=.72+erosion*.36;
          diffuseColor.rgb+=ledgerEdge*reading*wear*(.027+laid*.031);
        }
      `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+(1.-wear)*.113-wear*ridgeBright*.075,.25,.99);
      `);
    };
  }
}

function clawedFoot(k,j,x,finish='bBone',amount=3){
  for(let i=0;i<amount;i++){
    const px=x+(i-(amount-1)*.5)*.060;
    mass(k,j,finish,[[px,-.037,.129,.042,.034],[px*1.02,-.024,.207,.041,.041],[px*1.06,-.052,.285,.021,.023],
      [px*1.10,-.083,.324,.004,.004]],9,7,2.31,.13);
  }
}

function stripes(k,joint,w,depth,amount,padding=.19,segments=9){
  for(let index=0;index<amount;index++){
    const t=index/(amount-1),z=padding-depth*.62+t*depth*1.38;
    const a=(.52+.48*Math.sin(t*PI)**.43)*w;
    for(const side of signs){
      mass(k,joint,'bShadow',reflect(side,[[.061,a*.80,z,.034,.008],[a*.42,a*.72,z+.024,.048,.013],
        [a*.83,a*.41,z-.082,.039,.012],[a,-a*.092,z-.147,.028,.010],[a*.79,-a*.498,z-.209,.006,.005]],
      ),segments,7,2.42,.09);
    }
  }
}

function tigerHead(k,head,storm,mobile){
  mass(k,head,'bFur',[[0,-.151,.152,.198,.179],[0,-.069,.098,.233,.211],[0,.084,.051,.293,.261],
    [0,.227,-.091,.248,.205],[0,.31,-.155,.163,.154]],19,17,2.51,.19);
  const jaw=k.bone(head,0,-.113,.054);
  mass(k,jaw,'bFur',[[0,-.104,.14,.17,.177],[0,-.049,.21,.203,.158],[0,.076,.108,.182,.158]],12,13,2.37,.16);
  for(const side of signs){
    const f=p=>reflect(side,p);
    mass(k,head,'bBone',f([[.079,-.074,.288,.105,.111],[.145,.025,.25,.129,.118],[.202,.122,.112,.112,.089],
      [.252,.13,.012,.045,.052]]),16,12,2.4,.15);
    mass(k,head,'bCloth',f([[.152,.16,-.049,.099,.099],[.218,.25,-.10,.105,.090],[.216,.382,-.146,.074,.047],
      [.167,.453,-.153,.006,.007]]),14,10,2.33,.19);
    line(k,head,'bShadow',f([[.059,.077,.342],[.149,.116,.286],[.245,.13,.138]]),.041);
    stone(k,head,'glow',side*.145,.083,.308,.053,.023,.023,side*.32);
    line(k,head,'bBone',f([[.063,.118,.316],[.139,.149,.292],[.229,.148,.197]]),.029);
    for(let i=0;i<3;i++){
      const y=-.021-i*.027,x=.114+i*.036;
      stone(k,head,'bShadow',side*x,y,.333-i*.026,.014,.014,.013);
      if(storm)line(k,head,'bBone',f([[x,y,.339-i*.023,.009],[x+.096,y-.02-i*.014,.367,.007],
        [x+.173,y-.061-i*.023,.361,.003]]));
    }
    mass(k,head,'bBone',f([[.146,-.084,.255,.053],[.159,-.164,.281,.040],[.102,-.252,.323,.005]]),12,8,2.32,.135);
    for(let i=0;i<(storm?6:4);i++){
      const a=i*.061,z=.19-a*.45,y=.12+a*.55;
      line(k,head,'bShadow',f([[.032,y+.071,z+.061,.029],[.13+i*.014,y-.021,z+.073,.035],
        [.22+i*.008,y-.063,z+.013,.025],[.251+i*.008,y-.085,z-.016,.008]]));
    }
    if(storm)for(let row=0;row<3;row++)for(let i=0;i<(mobile?3:5);i++){
      const y=.08+row*.078-i*.058,z=-.135-i*.067;
      const base=[side*(.19+row*.047),y,z],mid=[side*(.344+row*.056),y+.21,z-.11];
      const tip=[side*(.431+row*.102),y+.35+row*.067,z-.231];
      k.geometry(head,row%2?'bShadow':'bBone',featherVane(base,mid,tip,.079,i+row*11+side,9));
    }
  }
  stone(k,head,'bShadow',0,.012,.372,.087,.055,.059);
  return jaw;
}

function mountTiger(k,entry,mobile){
  const plated=entry.id==='m089';
  const body=k.bone(k.root,0,.71,0),neck=k.bone(body,0,.115,.69),tail=k.bone(body,0,.105,-.83);
  const head=k.bone(neck,0,-.099,.277),jaw=tigerHead(k,head,false,mobile),paws=[];
  mass(k,body,plated?'bOxide':'bFur',[[0,.09,-.983,.257,.253],[0,.064,-.69,.314,.288],
    [0,.05,-.29,.322,.307],[0,.031,.21,.377,.332],[0,.061,.60,.322,.30],[0,.086,.86,.168,.19]],
    mobile?15:20,mobile?12:16,2.31,.23);
  mass(k,neck,'bFur',[[0,-.012,-.16,.271,.26],[0,-.025,.086,.245,.224],[0,-.113,.24,.186,.216]],
    17,14,2.29,.22);
  mass(k,tail,'bFur',[[0,.025,.037,.082],[-.182,.105,-.203,.084],[-.27,.19,-.449,.068],
    [-.33,.41,-.717,.056],[-.218,.566,-.938,.047],[-.063,.635,-.985,.029]],21,11,2.26,.19);
  for(let i=0;i<9;i++){
    const t=i/8,y=.11+t*.556,z=-.10-t*.84,x=-Math.sin(t*2.8)*.262;
    const stripe=k.bone(tail,x,y,z);
    stripe.rotation.x=.83;hoop(k,stripe,i%3?'bShadow':'bTrim',.065-t*.03,.013,13);
  }
  stripes(k,body,.377,1.16,mobile?7:plated?8:10,.19,mobile?5:7);
  const saddle=k.bone(body,0,.371,-.068);
  mass(k,saddle,'bCloth',[[0,-.046,-.433,.209,.072],[0,-.024,-.272,.37,.137],[0,.051,.106,.313,.114],
    [0,.070,.29,.167,.082]],15,15,2.48,.14);
  for(const side of signs){
    const f=p=>reflect(side,p);
    for(let i=0;i<5;i++){
      const z=-.40+i*.158;
      const plaque=f([[.122,.054,z+.075],[.38,-.028,z+.094],[.42,-.193,z+.034],[.38,-.185,z-.05],[.15,.082,z-.072]]);
      relief(k,saddle,plated?'bMetal':'bCloth',plaque,.050);line(k,saddle,'bTrim',plaque,.017);
    }
    line(k,head,'bTrim',f([[.189,.153,-.064],[.205,.084,.098],[.193,.007,.278],[.082,-.062,.355]]),.022);
    if(plated){
      for(let i=0;i<5;i++){
        const y=.25-i*.073,x=.06+i*.024,z=.073-i*.032;
        relief(k,neck,i%2?'bOxide':'bMetal',f([[x,y,z],[x+.173,y+.039,z+.019],[x+.261,y-.102,z+.005],
          [x+.218,y-.147,z+.037],[x+.065,y-.115,z+.083]]),.055);
      }
      line(k,neck,'bInlay',f([[.069,.254,.134],[.252,.146,.203],[.304,.003,.245],[.26,-.153,.210]]),.026);
    }
    for(const front of [true,false]){
      const base=k.bone(body,side*(front?.306:.281),front?.012:.034,front?.535:-.584);
      const knee=k.bone(base,side*.039,-.318,front?.091:-.13);
      mass(k,base,'bFur',f([[0,.16,-.051,.165,.17],[.04,.033,-.017,.187,.171],[.049,-.19,.064,.122,.109],
        [.039,-.32,front?.073:-.108,.090,.092]]),17,13,2.63,.18);
      mass(k,knee,'bFur',[[0,.055,-.038,.101,.10],[0,-.083,-.051,.112,.098],[0,-.233,-.017,.078,.076],
        [0,-.305,.04,.091,.124]],17,12,2.26,.16);
      stripes(k,base,.113,.25,mobile?3:4,.035,mobile?5:7);
      const foot=k.bone(knee,0,-.283,-.045);
      mass(k,foot,'bFur',[[0,-.026,.141,.114,.069],[0,.017,.069,.136,.077],[0,.076,-.035,.087,.056]],13,11,2.51,.13);
      clawedFoot(k,foot,0);
      paws.push({base,knee,side,front});
    }
  }
  return {
    body,saddle,width:plated?.337:.284,offset:plated?.70:.61,
    pose({beat,wind,strike,travel,step}){
      body.rotation.x=Math.sin(step)*travel*.10+wind*.22-strike*.31;
      body.rotation.z=Math.sin(step*.5)*travel*.08;
      neck.rotation.x=-wind*.279+strike*.319;
      jaw.rotation.x=wind*.11+strike*.59;
      tail.rotation.y=Math.sin(beat*.31)*(.334+travel*.24)+strike*.27;
      tail.rotation.x=wind*.09-strike*.14-Math.cos(beat*.53)*.12;
      for(const {base,knee,side,front} of paws){
        const p=step+(side<0?PI:0)+(front?PI*.79:0),g=Math.sin(p)*travel;
        base.rotation.x=g*.61+wind*(front?-.22:.092)+strike*(front?.32:-.29);
        knee.rotation.x=Math.max(0,Math.cos(p))*travel*.74*Math.sign(g||1)+strike*.12;
      }
    },
  };
}

const barding={
  m090:{head:.96,neck:.56,flank:.39,fauld:.83,crests:2,tail:.94,lash:true},
  m091:{head:1.13,neck:.61,flank:.42,fauld:1.15,crests:3,tail:.77,lash:false},
  m092:{head:1.06,neck:.65,flank:.46,fauld:.98,crests:3,tail:.86,lash:true},
  m093:{head:.89,neck:.67,flank:.41,fauld:.96,crests:2,tail:1.17,lash:false},
  m094:{head:1.19,neck:.58,flank:.48,fauld:1.28,crests:4,tail:1.04,lash:true},
};

function bardedHorse(k,entry,mobile){
  const s=barding[entry.id], w=s.flank, ivory=entry.id==='m093', dark=entry.id==='m094';
  const body=k.bone(k.root,0,.877,0), neck=k.bone(body,0,.20,.58), head=k.bone(neck,0,s.neck,.34);
  const lowerJaw=k.bone(head,0,-.12,.144), tail=k.bone(body,0,.14,-.96),legs=[];
  mass(k,body,'bWood',[[0,-.09,-1.12,w*.40,w*.54],
    [0,.01,-.867,w*.99,.367],[0,-.071,-.508,w*1.04,.369],[0,-.063,.054,w,.321],
    [0,.052,.56,w*.90,.350],[0,.102,.786,w*.58,.255]],mobile?16:21,mobile?14:17,2.34,.13);
  mass(k,neck,'bShadow',[[0,-.18,-.19,w*.66,.268],[0,.049,-.064,.273,.273],
    [0,.31,.038,.217,.227],[0,s.neck*.81,.173,.17,.166],[0,s.neck+.016,.30,.123,.127]],16,13,2.48,.19);
  mass(k,head,'bWood',[[0,.095,-.148,.198*s.head,.19],[0,.008,.017,.213*s.head,.161],
    [0,-.122,.181,.153*s.head,.122],[0,-.299,.336,.132*s.head,.099],[0,-.339,.39,.108*s.head,.067]],16,12,2.14,.15);
  mass(k,lowerJaw,'bShadow',[[0,.035,-.073,.151,.093],[0,-.055,.018,.119,.090],
    [0,-.168,.189,.106,.068],[0,-.205,.245,.095,.056]],11,10,2.34,.17);
  const seat=k.bone(body,0,.216,-.18);
  mass(k,seat,'bCloth',[[0,-.181,-.51,.245,.069],[0,-.029,-.435,w*.94,.128],
    [0,.046,.226,w*.81,.106],[0,.111,.414,w*.54,.079]],14,12,2.59,.13);
  const mane=k.bone(neck,0,.23,-.19),ruff=k.bone(tail,0,0,0);
  const hairCount=mobile?6:10;
  for(let i=0;i<hairCount;i++){
    const t=i/(hairCount-1),side=i%2?-1:1;
    k.geometry(mane,ivory&&i%2?'bBone':'bHair',featherVane([side*.054,t*.41,-t*.062],
      [side*(.11+t*.067),.08+t*.43,-.17-t*.135],[side*(.16+t*.18),.033+t*.34,-.28-t*.19],.062,i+8,7));
    k.geometry(ruff,dark||i%3?'bHair':'bInlay',featherVane([side*.026,.133,.004],
      [side*(.103+t*.045),.043,-s.tail*.38-t*.11],[side*(.20+t*.073),-.28+s.tail*t*.17,-s.tail*.72-t*.14],.087,i+54,8));
  }
  for(const side of signs){
    const fan=p=>reflect(side,p);
    const tack=fan([[.037,.046,-.088],[.176*s.head,.017,.052],[.187*s.head,-.139,.165],
      [.152*s.head,-.298,.325],[.091,-.366,.416],[.038,-.29,.362]]);
    relief(k,head,'bMetal',tack,.043);
    line(k,head,'bTrim',tack.map(([x,y,z])=>[x,y,z+.036]),.014);
    stone(k,head,'glow',side*.151*s.head,-.061,.111,.036,.023,.018);
    const cheek=fan([[.164*s.head,.014,.111,.032],[.187*s.head,-.153,.236,.035],
      [.134,-.236,.352,.031],[.098,-.323,.429,.015]]);
    line(k,head,'bWood',cheek);
    line(k,head,'bInlay',cheek.map(([x,y,z,r])=>[x-.014*side,y-.023,z+.022,r*.34]));
    for(let i=0;i<s.crests;i++){
      const y=i*.027;
      mass(k,head,i%2?'bMetal':'bTrim',fan([[.089+y,.085+y,-.11,.049],[.123+y,.167+y,-.127,.049],
        [.19+y,.23+y*.9,-.13-y,.044],[.26+y,.275+y,-.173-y*.4,.006]]),9,8,2.28,.15);
    }
    const bridge=fan([[w*.54,.057,.51],[w,.141,.39],[w*1.28,-.034,.283],[w*1.36,-.317,.220],
      [w*.78,-.41,.331],[w*.52,-.25,.48]]);
    relief(k,body,'bOxide',bridge,.081);
    line(k,body,'bTrim',bridge,.025);
    for(let i=0;i<3;i++){
      const z=-.55+i*.28;
      const path=fan([[w*.33,.193,z+.120],[w*.91,.108,z+.138],[w*1.19,-.043,z+.128],
        [w*1.23,-.221*s.fauld,z+.058],[w,-.251*s.fauld,z-.123],[w*.60,-.036,z-.167]]);
      relief(k,seat,i%2?'bOxide':'bMetal',path,.045);
      line(k,seat,'bTrim',path.map(([x,y,z])=>[x*1.05,y,z]),.017);
      stone(k,seat,'bInlay',side*w*1.22,-.145*s.fauld,z,.049,.053,.035,.31);
    }
    const carrier=k.bone(body,side*w*.61,.244,-.806);
    mass(k,carrier,'bWood',fan([[0,.106,.07,.097,.134],[.025,-.004,.033,.133,.146],
      [.066,-.145,-.055,.088,.113],[.051,-.24,-.079,.048,.059]]),12,11,2.48,.17);
    line(k,carrier,'bTrim',fan([[-.052,.067,-.041],[.042,.121,-.081],[.119,.013,-.108],[.092,-.154,-.125]]),.019);
    for(const front of [true,false]){
      const hip=k.bone(body,side*(front?w*.69:w*.76),front?.034:.078,front?.513:-.717);
      const knee=k.bone(hip,side*.018,-.383,front?.08:-.157);
      const foot=k.bone(knee,0,-.352,front?.033:.112);
      mass(k,hip,'bWood',[[0,.095,-.036,.145,.173],[0,-.022,-.015,.171,.148],
        [0,-.187,front?.041:-.072,.104,.096],[side*.018,-.373,front?.073:-.141,.07,.072]],13,11,2.32,.14);
      mass(k,knee,'bMetal',[[0,.035,0,.088,.087],[0,-.073,-.052,.103,.074],[0,-.225,-.003,.063,.064],
        [0,-.357,.063,.056,.066]],13,9,2.76,.13);
      const greave=[[-.092,.039,.065],[.062,.06,.086],[.098,-.072,.07],[.061,-.214,.129],
        [0,-.319,.143],[-.064,-.192,.094],[-.088,-.049,.065]];
      relief(k,knee,front?'bMetal':'bOxide',greave,.025);
      line(k,knee,'bInlay',greave.slice(2,6),.012);
      mass(k,foot,'bShadow',[[0,-.083,.069,.082,.095],[0,-.036,.046,.091,.110],[0,.044,.016,.068,.088]],9,11,3.13,.11);
      line(k,foot,'bTrim',[[-.070,-.060,.104],[0,-.049,.142],[.069,-.06,.103]],.016);
      legs.push({hip,knee,foot,side,front});
    }
  }
  return {body,saddle:seat,width:w*.87,offset:.53,
    pose({beat,wind,strike,travel,step,stage}){
      body.rotation.x=travel*Math.sin(step)*.068+wind*.215-strike*.32;
      body.rotation.z=travel*Math.sin(step*.51)*.076;
      neck.rotation.x=-wind*.24+strike*.341+travel*Math.cos(step)*.184;
      neck.rotation.z=Math.sin(beat*.61)*(.04+travel*.079);
      head.rotation.x=-neck.rotation.x*.41+wind*.11-strike*.151;
      lowerJaw.rotation.x=wind*.26+strike*.39;
      mane.rotation.x=Math.sin(beat*.72)*.091+travel*.23+wind*.11;
      tail.rotation.x=wind*.190-strike*.26;tail.rotation.y=Math.sin(beat*.61)*(.24+travel*.26)+stage*.056;
      ruff.rotation.z=Math.sin(beat*.72)*.077;
      for(const {hip,knee,foot,side,front} of legs){
        const p=step+(side<0?PI:0)+(front?0:PI*.76),g=Math.sin(p)*travel;
        hip.rotation.x=g*.59+wind*(front?-.31:.079)+strike*(front?.34:-.29);
        knee.rotation.x=-.19+Math.max(0,Math.cos(p))*travel*.53+strike*.14;
        foot.rotation.x=-Math.min(0,g)*.224+wind*.12;
      }
    },
  };
}

function starfish(k,entry,mobile){
  const gold=entry.id==='m096';
  const body=k.bone(k.root,0,.57,.04),arms=[],center=k.bone(body,0,0,0);
  center.rotation.x=-.33;
  const number=gold?10:7;
  mass(k,center,'bCloth',[[0,-.1,-.068,.344,.108],[0,0,-.073,.456,.126],[0,.195,-.069,.389,.149],
    [0,.373,-.052,.274,.121]],15,20,3.08,.27);
  const mouth=k.bone(center,0,.113,.168);
  for(const side of signs){
    hoop(k,mouth,'bMetal',gold?.166:.153,.055,30,0,0,side*.12);
    hoop(k,mouth,'bInlay',.098,.019,22,0,0,side*.14);
    for(let i=0;i<9;i++){
      const a=i*TAU/9;
      stone(k,mouth,i%2?'bTrim':'glow',Math.sin(a)*.154,Math.cos(a)*.154,side*.156,.030,.051,.029,-a);
    }
  }
  stone(k,mouth,'bShadow',0,0,.094,.112,.117,.033);
  for(let i=0;i<number;i++){
    const a=i*TAU/number;
    const top=k.bone(center,Math.sin(a)*.215,.134+Math.cos(a)*.244,-.041+i%2*.028);
    top.rotation.z=-a;
    const long=i%2===0?1:.75,left=(i%2===0?-1:1)*(gold?.15:.29);
    const mid=k.bone(top,left*.69,.69*long,-.061);
    mass(k,top,'bCloth',[[0,-.109,.061,.161,.123],[left*.12,.163,.025,.14,.118],[left*.37,.39*long,-.038,.121,.091],
      [left*.72,.69*long,-.094,.09,.075]],15,13,2.38,.27);
    mass(k,mid,'bCloth',[[0,-.141,.012,.103,.074],[left*.21,.073,.009,.098,.071],[left*.15,.243*long,.072,.085,.065],
      [left*-.29,.433*long,.117,.072,.057],[left*-.54,.50*long,.142,.049,.046]],14,12,2.16,.25);
    for(const side of signs){
      line(k,top,'bInlay',[[side*.043,-.077,.155],[left*.17+side*.053,.153,.118],[left*.44+side*.041,.405*long,.071],
        [left*.72+side*.027,.643*long,.021]],.018);
      line(k,mid,'bTrim',[[side*.034,-.109,-.059],[left*.16+side*.052,.15,-.083],[left*-.19+side*.06,.313*long,.007],
        [left*-.52+side*.018,.46*long,.100]],.017);
    }
    for(let row=0;row<(mobile?4:6);row++){
      const y=.058+row*.084,z=.110-row*.016,x=left*row*.085;
      stone(k,top,row%2?'bMetal':'bBone',x,y,z,.041,.062,.024,-left*2);
    }
    stone(k,mid,'bBone',left*-.52,.496*long,.142,.066,.073,.063,.6);
    hoop(k,mid,'bInlay',.039,.015,12,left*-.49,.49*long,.197);
    arms.push({top,mid,a,i});
  }
  return {body,head:mouth,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'radial',
    cataloguePose({headtime,beat,wind,strike,travel,stage,fall}){
      center.rotation.set(-.40-wind*.20+strike*.42-fall*.23,Math.sin(headtime*1.41)*.22,headtime*(gold?.215:.32)+strike*.22);
      mouth.scale.setScalar(1+wind*.30+strike*.18+stage*.045);
      for(const {top,mid,a,i} of arms){
        top.rotation.set(Math.sin(beat*.65+i*.74)*(.20+travel*.31)+wind*.31-strike*.44,
          Math.sin(beat*.31+i*.22)*.19,-a+Math.sin(beat*.44+i*.77)*.25);
        mid.rotation.x=Math.cos(beat*.51+i*.48)*.493+wind*.73-strike*.47;
        mid.rotation.z=Math.sin(beat*.51+i*.87)*.18;
      }
    },
  };
}

function oldOni(k,entry,mobile){
  const tiger=entry.id==='m108';
  const s=tiger?{...neutral,chest:.58,arm:.80,leg:.98,sleeve:.24,armor:'bare'}:
    {...neutral,chest:.67,arm:.76,leg:.73,sleeve:.29,armor:'bare'};
  const body=k.bone(k.root,0,tiger?1.06:.77,tiger?0:-.075);
  const head=k.bone(body,0,tiger?.65:.51,tiger?.29:.61);
  const jaw=tigerHead(k,head,tiger,mobile);
  mass(k,body,'bFur',[[0,-.311,-.41,.34,.324],[0,-.102,-.236,.414,.351],[0,.11,-.196,.536,.443],
    [0,.401,-.15,.621,.487],[0,.632,-.04,.47,.411],[0,.833,.010,.271,.321]],22,19,2.56,.22);
  const tail=k.bone(body,0,-.15,-.514);
  const tailTrack=tiger?[[0,.021,0,.105],[.16,.197,-.376,.101],[.298,.396,-.687,.093],
    [.248,.802,-.933,.072],[.124,1.121,-.889,.046],[0,1.28,-.712,.019]]:
    [[0,.13,0,.104],[.22,.244,-.427,.079],[.542,.211,-.659,.079],[.729,.406,-.704,.073],
      [.77,.773,-.604,.052],[.679,.929,-.564,.035]];
  mass(k,tail,'bCloth',tailTrack,24,12,2.41,.24);
  for(let i=0;i<7;i++){
    const p=tailTrack[Math.min(i,tailTrack.length-1)];
    const ring=k.bone(tail,p[0],p[1]-.042,p[2]+.021);
    ring.rotation.x=.81;
    hoop(k,ring,i%2?'bShadow':'bMetal',p[3]*1.03,.013,15);
  }
  const arms=signs.map(side=>arm(k,body,s,side)),legs=signs.map(side=>leg(k,body,side,s,false));
  for(const side of signs){
    if(!tiger){
      const horn=k.bone(head,side*.17,.145,-.055);
      const curl=reflect(side,[[.022,.025,.031,.128],[.218,.127,.037,.143],[.45,.125,.137,.125],
        [.59,-.032,.253,.100],[.614,-.251,.365,.078],[.514,-.328,.503,.048],[.383,-.19,.565,.007]]);
      mass(k,horn,'bBone',curl,24,14,2.31,.27);
      const curve=new T.CatmullRomCurve3(curl.map(([x,y,z])=>new T.Vector3(x,y,z)));
      for(let i=0;i<11;i++){
        const t=.11+i*.073,a=curve.getPointAt(t);
        const ring=k.bone(horn,a.x,a.y,a.z);ring.rotation.y=side*(.66-t*.74);ring.rotation.z=side*t;
        hoop(k,ring,'bMetal',.131-t*.087,.019,15);
      }
      for(let j=0;j<4;j++)relief(k,body,'bOxide',reflect(side,[[.22,.571-j*.13,-.102],[.531,.475-j*.118,-.153],
        [.649,.302-j*.113,-.30],[.46,.246-j*.093,-.38],[.248,.409-j*.117,-.35]]),.061);
    }else{
      stripes(k,body,.57,.63,mobile?5:8,.15);
      for(let i=0;i<6;i++){
        const f=p=>reflect(side,p),y=.48-i*.089;
        relief(k,body,i%2?'bBone':'bOxide',f([[.08,y+.073,.309],[.362,y+.091,.293],[.586,y-.015,.146],
          [.488,y-.11,.119],[.185,y-.12,.271],[.047,y-.043,.384]]),.043);
      }
    }
  }
  if(!tiger){
    for(const {root,side} of arms){root.position.y=.068;root.position.z=.54;root.position.x=side*.43;}
    for(const {hip,side} of legs){hip.position.y=.068;hip.position.z=-.62;hip.position.x=side*.39;}
    for(const {hand} of arms)clawedFoot(k,hand,0,'bMetal');
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:tiger?'slam':'gallop',
    cataloguePose({beat,headtime,wind,strike,travel,step,fall,stage}){
      body.rotation.set((tiger?.15:.26)+wind*.25-strike*.38+travel*Math.sin(step)*.10+fall*.34,
        Math.sin(beat*.79)*.061,(wind-strike)*.13);
      head.rotation.x=-wind*.31+strike*.47;
      head.rotation.y=Math.sin(headtime*2.1)*.19*(1-wind);
      jaw.rotation.x=wind*.46+strike*.60;
      tail.rotation.y=Math.sin(beat*.62)*.43+wind*.33-strike*.49;
      tail.rotation.x=travel*.19-wind*.19+strike*.33;
      for(const {root,elbow,side} of arms){
        const g=Math.sin(step+side*PI*.5)*travel;
        root.rotation.set((tiger?-.27:-.77)+g*.67-wind*(tiger?1.1:.42)+strike*.87,side*.14,side*(.10+wind*.28));
        elbow.rotation.x=-.26+(Math.cos(step+side*PI)*travel)*.54+wind*.24-strike*.15;
      }
      for(const {hip,knee,side} of legs){
        const d=Math.sin(step+(side===1?0:PI)+PI*.34)*travel;
        hip.rotation.x=(tiger?0:-.079)+d*.51;
        knee.rotation.x=-.19-Math.max(0,d)*.78+strike*.15+stage*.035;
      }
    },
  };
}

function hydra(k,entry,mobile){
  const body=k.bone(k.root,0,.68,-.024),tails=[],heads=[],legs=[];
  mass(k,body,'bCloth',[[0,-.031,-1.18,.39,.348],[0,.034,-.81,.575,.486],[0,.06,-.43,.634,.568],
    [0,.129,.062,.685,.529],[0,.281,.402,.548,.443],[0,.351,.571,.405,.386]],27,18,2.51,.25);
  for(let i=0;i<8;i++){
    const t=i/7,side=i%2?1:-1,x=(.086+.27*Math.sin((i/2)*.62))*side,z=.43-t*.51;
    const neck=k.bone(body,x,.271+t*.09,z);
    const length=.68+Math.sin(i*1.97)*.14,y=(i<4?.687:1.15)+Math.sin(i*.614)*.18;
    const drift=side*(.38+Math.abs(3.5-i)*.135);
    mass(k,neck,'bCloth',[[0,-.071,-.12,.151,.157],[drift*.22,y*.17,.07,.172,.181],
      [drift*.64,y*.56,length*.32,.137,.128],[drift*.91,y*.94,length*.72,.099,.111],[drift,y,length,.104,.104]],
      19,12,2.42,.23);
    for(let j=0;j<4;j++){
      const p=j/4,x=drift*(.12+p*.67),h=y*(.16+p*.7),z=length*(.13+p*.64);
      relief(k,neck,j%2?'bMetal':'bOxide',[[x-.107,h+.086,z+.069],[x+.019,h+.108,z+.162],
        [x+.114,h+.067,z+.067],[x+.055,h-.09,z+.16],[x-.079,h-.087,z+.169]],.037);
      mass(k,neck,'bBone',[[x-.046,h+.011,z-.095,.047],[x-.16*side,h+.088,z-.212,.056],[x-.29*side,h+.20,z-.339,.007]],
        8,8,2.31,.17);
    }
    const head=k.bone(neck,drift,y,length),jaw=k.bone(head,0,-.117,.133);
    mass(k,head,'bOxide',[[0,.18,-.119,.145,.15],[0,.093,.018,.164,.162],[.019,-.01,.172,.142,.144],
      [0,-.043,.342,.094,.076],[.035,-.041,.407,.056,.047]],17,12,2.67,.21);
    mass(k,jaw,'bShadow',[[0,-.068,.034,.12,.073],[0,-.04,.131,.117,.069],
      [0,.003,.263,.072,.043],[.008,.019,.323,.038,.025]],10,9,2.48,.17);
    for(const side of signs){
      const f=p=>reflect(side,p);
      relief(k,head,'bMetal',f([[.055,.15,.113],[.145,.17,.019],[.181,.096,-.016],[.131,.027,.173],[.046,.061,.24]]),.045);
      stone(k,head,'glow',side*.128,.069,.181,.044,.026,.029);
      mass(k,head,'bBone',f([[.112,.114,-.02,.051],[.216,.213,-.143,.043],[.265,.314,-.257,.007]]),11,8,2.63,.19);
      for(let tooth=0;tooth<(mobile?2:4);tooth++){
        const z=.13+tooth*.073,x=.108-tooth*.02;
        mass(k,head,'bBone',f([[x,-.077,z,.023],[x+.005,-.126,z+.015,.020],[x-.016,-.176,z+.06,.004]]),7,7);
      }
    }
    heads.push({neck,head,jaw,i,side});
  }
  for(const side of signs){
    const tail=k.bone(body,side*.36,.16,-.887);
    const f=p=>reflect(side,p);
    const path=f([[0,-.044,.101,.172],[.074,.088,-.247,.193],[.268,.221,-.73,.143],
      [.472,.541,-.963,.110],[.572,.771,-1.257,.075],[.618,.812,-1.60,.006]]);
    mass(k,tail,'bCloth',path,24,13,2.42,.25);
    for(let i=0;i<5;i++){
      const t=i/5,x=.03+.52*t,y=.063+.68*t,z=-.124-1.2*t;
      mass(k,tail,'bBone',f([[x,y+.10,z,.067],[x+.043,y+.255,z-.057,.050],[x+.108,y+.341,z-.198,.005]]),10,8);
    }
    tails.push({tail,side});
    const s={...neutral,chest:.66,leg:.72};
    for(const front of [true,false]){
      const l=leg(k,body,side,s);
      l.hip.position.set(side*.45,-.037,front?.39:-.74);
      clawedFoot(k,l.boot,0,'bBone',4);
      legs.push({...l,front});
    }
  }
  return {body,head:heads[2].head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'gallop',
    cataloguePose({headtime,beat,wind,strike,stage,travel,step,fall}){
      body.rotation.x=wind*.18-strike*.28+.061*Math.sin(beat)+fall*.22;
      for(const {neck,head,jaw,i,side} of heads){
        const t=wind*.7+Math.sin(headtime*3.7+i*.875)*.21,s=Math.max(0,strike-.035*i);
        neck.rotation.set(t*.78-s*.84,side*(Math.sin(beat*.88+i*.49)*.17+wind*.23-s*.30),side*(wind*.09+stage*.041));
        head.rotation.x=Math.sin(beat*.62+i)*.097-strike*.31;
        jaw.rotation.x=.11+wind*.63+s*.75;
      }
      for(const {tail,side} of tails)tail.rotation.set(travel*.21-wind*.31+strike*.22,side*(Math.sin(beat*.51)*.27+wind*.16),side*stage*.065);
      for(const {hip,knee,side,front} of legs){
        const p=step+side*PI*.5+(front?PI*.7:0);
        hip.rotation.x=Math.sin(p)*travel*.55+wind*(front?-.31:.15);
        knee.rotation.x=-Math.max(0,Math.cos(p))*travel*.54+strike*.20;
      }
    },
  };
}

function iceShade(k,entry,mobile){
  const body=k.bone(k.root,0,1.11,0),head=k.bone(body,0,.83,.088);
  const jaw=brow(k,head,entry.id,mobile),panels=dress(k,body,{length:1.16,waist:.211,bell:.39,hem:1,slit:.16,embroidery:true},mobile?7:10);
  const s={...neutral,chest:.30,sleeve:.114,armor:'imperial'};
  const wings=[];
  mass(k,body,'bCloth',[[0,-.19,-.09,.231,.171],[0,.094,-.061,.25,.216],[0,.38,-.029,.29,.211],
    [0,.594,.025,.261,.185],[0,.792,.063,.16,.118]],16,16,2.43,.22);
  crown(k,head,'flame');
  const arms=signs.map(side=>arm(k,body,s,side));
  for(const side of signs){
    for(let row=0;row<6;row++){
      const y=.585-row*.091;
      relief(k,body,row%2?'bMetal':'bOxide',reflect(side,[[.051,y+.048,.253],[.206,y+.035,.238],[.253,y-.03,.177],
        [.200,y-.083,.220],[.072,y-.055,.273]]),.044);
      line(k,body,'bInlay',reflect(side,[[.104,y+.024,.287],[.163,y-.031,.268],[.218,y+.018,.234]]),.017);
    }
    const wing=k.bone(body,side*.191,.61,-.212);
    const elbow=k.bone(wing,side*.541,.496,-.117);
    const ribs=[
      [[0,0,0],[.178,.25,-.052],[.42,.48,-.096],[.54,.495,-.117]],
      [[0,0,0],[.435,.28,-.09],[.82,.33,-.162],[1.09,.178,-.255]],
      [[0,0,0],[.45,.12,-.14],[.725,-.248,-.24],[.763,-.39,-.28]],
      [[0,0,0],[.277,-.058,-.107],[.478,-.305,-.22],[.357,-.522,-.26]],
    ];
    k.geometry(wing,'bOxide',wingWeb(ribs,side,7+side));
    for(const [i,path] of ribs.entries()){
      mass(k,wing,i%3?'bMetal':'bBone',reflect(side,path.map(([x,y,z],j)=>[x,y,z,[.067,.053,.045,.004][j]])),
        mobile?12:17,10,2.18,.18);
      line(k,wing,'bInlay',reflect(side,path.map(([x,y,z],j)=>[x,y,z+.048-j*.01,.019-j*.005])));
    }
    for(let i=0;i<4;i++){
      const path=reflect(side,[[.012,-i*.043,0],[.269-i*.056,.187-i*.11,-.07],[.44-i*.063,.199-i*.15,-.18]]);
      mass(k,elbow,i%2?'bOxide':'bBone',path.map(([x,y,z],j)=>[x,y,z,[.041,.052,.005][j]]),11,8,2.34,.21);
    }
    wings.push({wing,elbow,side});
  }
  const icicle=k.bone(arms[1].hand,.062,-.08,.153);
  const jewelAt=weapon(k,icicle,'disc');
  jewelAt.scale.setScalar(.61);
  const ghostSword=weapon(k,arms[0].hand,'dagger');ghostSword.scale.setScalar(.78);
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'hover',
    cataloguePose({beat,headtime,wind,strike,stage,travel,fall}){
      body.rotation.x=wind*.21-strike*.36+travel*.18+fall*.39;
      head.rotation.y=Math.sin(headtime*2.64)*.131-wind*.52+strike*.35;
      jaw.rotation.x=wind*.39+strike*.43;
      jewelAt.rotation.z=headtime*1.62+wind*2.1-strike*1.88;
      for(const {root,elbow,side} of arms){
        root.rotation.x=-wind*(side>0?1.21:.57)-strike*(side>0?.61:.48)+travel*.08;
        root.rotation.z=side*(.31+wind*.23+strike*.26);
        elbow.rotation.x=-wind*.81+strike*.94;
      }
      for(const {wing,elbow,side} of wings){
        wing.rotation.set(Math.sin(beat)*.09-travel*.24,side*(.31+wind*.45-strike*.33),side*(.15+Math.sin(beat*.61)*.159-wind*.17+strike*.25));
        elbow.rotation.y=side*(.14+stage*.185+strike*.11);
        elbow.rotation.z=side*(Math.sin(beat*.78)*.134+wind*.31-strike*.17);
      }
      for(const {joint,index,a} of panels)joint.rotation.set(Math.sin(beat*.76+index)*.136+wind*.15+strike*.16,a+travel*.036,0);
    },
  };
}

const specialized={m095:starfish,m096:starfish,m100:iceShade,m103:hydra,m108:oldOni,m111:oldOni};

export function sculptB(k,entry,mobile=false){
  const specializedShape=specialized[entry.id];
  if(specializedShape||robes[entry.id])finishRelief(k,entry.id);
  if(specializedShape)return specializedShape(k,entry,mobile);
  const design=robes[entry.id];
  if(!design)return null;
  const [collar,pauldron]=shoulderCuts[entry.id]??[];
  const mount=barding[entry.id]?bardedHorse(k,entry,mobile):
    ['m074','m089'].includes(entry.id)?mountTiger(k,entry,mobile):null;
  return humanoid(k,entry,{...neutral,...design,back:coatStyles[entry.id],collar,pauldron,mobile},mobile,mount);
}
