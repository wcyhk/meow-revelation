import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,points)=>points.map(([x,...rest])=>[x*side,...rest]);
const thin=(k,limb,finish,path,steps=10)=>k.sculpt.sweep(limb,finish,path,{sides:6,steps,ridge:.19});
const plate=(k,j,m,path,depth=.039)=>k.sculpt.plate(j,m,path,depth,depth*.38);
function carve(k,part,finish,path,mobile,furry=false,seed=0){
  const largePelt=furry&&path.length>4&&path.some(point=>point[3]>.11);
  const sides=largePelt?(mobile?18:25):furry?(mobile?11:16):(mobile?10:13);
  const rings=largePelt?(mobile?21:28):(mobile?12:16);
  const mesh=sculptVolume(path,{sides,rings,section:largePelt?2.17:2.47,ridge:furry?.22:.13,fur:furry,seed});
  if(largePelt){
    const {position,normal,uv,color}=mesh.attributes;
    for(let i=0;i<(rings+1)*(sides+1);i++){
      const around=uv.getX(i)*Math.PI*2,length=uv.getY(i);
      const flow=around+Math.sin(length*7.2+seed)*.16;
      const track=Math.sin(flow*9+length*7+seed)*.48
        +Math.cos(flow*13-length*12.2+seed*.53)*.24
        +Math.sin(flow*4+length*14.8)*.28;
      const cusp=Math.max(0,Math.sin(flow*7+length*11+seed))**2;
      const pad=Math.sin(length*Math.PI)**.78;
      const depth=(track*.015+cusp*.009)*pad;
      position.setXYZ(i,position.getX(i)+normal.getX(i)*depth,position.getY(i)+normal.getY(i)*depth,
        position.getZ(i)+normal.getZ(i)*depth);
      const sheen=color.getX(i)*(.92+track*.17+cusp*.06);
      color.setXYZ(i,sheen*(1+cusp*.033),sheen,sheen*(1-cusp*.048));
    }
    mesh.computeVertexNormals();
    for(let i=0;i<=rings;i++){
      const a=i*(sides+1),b=a+sides;
      const joined=new T.Vector3().fromBufferAttribute(normal,a).add(new T.Vector3().fromBufferAttribute(normal,b)).normalize();
      normal.setXYZ(a,joined.x,joined.y,joined.z);
      normal.setXYZ(b,joined.x,joined.y,joined.z);
    }
  }
  return k.geometry(part,finish,mesh);
}

function furLock(k,part,finish,points,normal,width,seed,mobile){
  const face=new T.Vector3(...normal).normalize();
  const path=new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...point)));
  const cuts=mobile?7:10,spines=[-1,-.61,-.26,0,.33,.69,1],position=[],shade=[],uv=[],index=[];
  const row=spines.length;
  for(let i=0;i<=cuts;i++){
    const t=i/cuts,origin=path.getPoint(t),tangent=path.getTangent(t);
    const cross=new T.Vector3().crossVectors(face,tangent).normalize();
    const span=width*(.038+Math.sin(Math.PI*t)**.69)*(1-.44*t);
    for(const [j,rib] of spines.entries()){
      const rag=Math.sin(seed+i*3.549+j*.981);
      const flank=rib<0?.73:1;
      const tuftCenter=Math.sin(seed+t*6.6)*.14;
      const ridge=(.007+Math.sin(Math.PI*t)*width*.57)*Math.exp(-((rib-tuftCenter)**2)*8)
        +Math.sin((rib+1)*11+seed)*width*.080;
      const point=origin.clone().addScaledVector(cross,rib*span*flank*(.89+rag*.11))
        .addScaledVector(tangent,-Math.abs(rib)*span*.41)
        .addScaledVector(face,ridge+(1-t)*.003);
      position.push(...point.toArray());
      uv.push((rib+1)*.5,t);
      const reflected=.52+.26*t+ridge*3.4+rag*Math.abs(rib)*.10;
      shade.push(reflected*(.94+t*.10),reflected,reflected*(1.07-t*.11));
      if(i<cuts&&j<row-1){
        const a=i*row+j,b=a+row;
        index.push(a,b,a+1,b,b+1,a+1);
      }
    }
  }
  const geometry=new T.BufferGeometry().setIndex(index);
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(shade,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.computeVertexNormals();
  k.geometry(part,finish,geometry);
}

function brow(k,head,side,mobile){
  const p=path=>mirror(side,path);
  const socket=p([[.082,.098,.276],[.151,.131,.248],[.210,.123,.191],[.200,.087,.221],
    [.150,.074,.271],[.106,.073,.289]]);
  plate(k,head,'tigerDark',socket,.014);
  k.mesh(head,'gem','tigerEye',side*.126,.096,.281,.033,.012,.016,0,side*.15,side*.28);
  k.mesh(head,'gem','tigerDark',side*.123,.096,.292,.008,.016,.008,0,side*.10,side*.20);
  carve(k,head,'tigerFur',p([[.043,.109,.271,.024,.019],[.107,.141,.278,.035,.021],
    [.173,.164,.240,.044,.032],[.234,.157,.188,.038,.029],[.279,.129,.058,.006,.006]]),mobile,true,side);
  carve(k,head,'tigerMuzzle',p([[.045,-.061,.325,.043,.045],[.102,-.089,.352,.059,.058],
    [.165,-.094,.312,.064,.064],[.225,-.044,.210,.053,.047],[.270,.012,.080,.014,.014]]),mobile,true,side);
  const ear=k.bone(head,side*.221,.210,-.053);
  carve(k,ear,'tigerFur',p([[.004,.005,.026,.074,.047],[.041,.056,.032,.083,.049],
    [.086,.107,.019,.045,.040],[.116,.134,-.003,.008,.011]]),mobile,true);
  plate(k,ear,'tigerDark',p([[.012,.018,.057],[.059,.036,.083],[.105,.108,.039],
    [.074,.087,.059],[.041,.067,.078]]),.014);
  for(let i=0;i<(mobile?4:5);i++){
    const t=i/(mobile?3:4),y=.113-.19*t,z=.114-.175*t;
    carve(k,head,i%3?'tigerMuzzle':'tigerFur',p([[.242,y,z,.042,.034],[.272,y-.016,z-.065,.064,.041],
      [.313+t*.031,y-.073,z-.135,.052,.037],[.371+t*.034,y-.144,z-.195,.005,.006]]),
    mobile,true,i+side);
  }
  for(let i=0;i<3;i++)thin(k,head,'tigerDark',p([[.097+i*.029,-.096+i*.034,.365-i*.024,.006],
    [.28+i*.041,-.12+i*.043,.341-i*.031,.008],[.438+i*.021,-.11+i*.057,.226-i*.07,.0018]]),13);
  for(let i=0;i<4;i++){
    const y=.030-i*.041;
    thin(k,head,'tigerDark',p([[.173,y-.041,.306,.002],[.212,y-.010,.264,.008],
      [.256,y+.004,.200,.013],[.288,y-.020,.143,.011],[.319,y-.016,.068,.002]]),12);
    thin(k,head,'tigerMuzzle',p([[.198,y+.013,.258,.004],[.242,y+.028,.212,.008],
      [.289,y+.016,.144,.007],[.301,y-.003,.070,.002]]),10);
  }
}

function headParts(k,head,mobile){
  carve(k,head,'tigerFur',[[0,-.181,.024,.13,.099],[.006,-.092,.039,.232,.185],
    [0,.067,.001,.255,.206],[0,.199,-.057,.211,.167],[.009,.267,-.134,.132,.136]],mobile,true);
  carve(k,head,'tigerDark',[[0,-.044,.317,.075,.042],[0,-.012,.374,.067,.031],
    [0,.021,.356,.051,.028],[0,.062,.303,.031,.014]],mobile);
  carve(k,head,'tigerMuzzle',[[0,.035,.328,.032,.023],[0,.081,.305,.048,.030],
    [0,.144,.269,.068,.033],[0,.193,.196,.027,.017]],mobile,true,8);
  const jaw=k.bone(head,0,-.144,.093);
  carve(k,jaw,'tigerMuzzle',[[0,-.101,.184,.080,.068],[0,-.043,.206,.132,.075],
    [0,.003,.101,.17,.084],[0,.024,-.024,.123,.054]],mobile,true,1.2);
  thin(k,jaw,'tigerDark',[[-.087,-.013,.213,.012],[0,-.025,.247,.016],[.087,-.011,.215,.012]]);
  for(const side of sides){
    const p=path=>mirror(side,path);
    brow(k,head,side,mobile);
    thin(k,head,'tigerDark',p([[.033,.235,.076,.011],[.063,.218,.140,.022],[.107,.203,.154,.023],
      [.172,.208,.114,.012],[.196,.233,.046,.002]]),13);
    thin(k,head,'tigerDark',p([[.048,.182,.194,.007],[.101,.183,.200,.013],[.155,.193,.174,.014],
      [.207,.187,.102,.004]]),12);
    for(let i=0;i<3;i++){
      const x=.09+i*.036,z=.25-i*.046;
      thin(k,jaw,'edge',p([[x,-.007,z,.013],[x+.004,.023,z+.007,.011],[x+.017,.048,z-.007,.003]]),8);
    }
    carve(k,head,'edge',p([[.151,-.119,.294,.031,.036],[.162,-.181,.306,.027,.029],
      [.152,-.226,.298,.012,.016],[.137,-.244,.299,.004,.005]]),mobile);
  }
  return jaw;
}

function fighterArm(k,body,side,mobile){
  const p=path=>mirror(side,path);
  const shoulder=k.bone(body,side*.388,.602,.024),elbow=k.bone(shoulder,side*.16,-.320,.091);
  const hand=k.bone(elbow,side*.056,-.320,.073);
  carve(k,shoulder,'tigerFurAsh',p([[-.086,.044,-.080,.125,.118],[.035,.060,-.058,.151,.128],
    [.146,.001,-.039,.149,.126],[.194,-.106,.001,.141,.121],[.185,-.216,.064,.103,.117],
    [.153,-.328,.096,.104,.111]]),mobile,true);
  carve(k,shoulder,'tigerFur',p([[-.046,.065,-.089,.065,.051],[.039,.097,-.123,.105,.089],
    [.115,.079,-.116,.136,.095],[.201,.026,-.099,.103,.087],
    [.233,-.081,-.067,.060,.058],[.228,-.153,-.009,.019,.023]]),mobile,true,3.8);
  carve(k,elbow,'tigerFur',p([[.002,.029,.018,.103,.108],[.014,-.072,.049,.144,.132],
    [.056,-.165,.068,.144,.124],[.056,-.313,.099,.106,.099]]),mobile,true);
  carve(k,hand,'tigerMuzzle',p([[.014,.037,.033,.103,.099],[.041,-.034,.086,.147,.111],
    [.033,-.095,.162,.152,.096],[.025,-.151,.169,.101,.070]]),mobile,true);
  for(let i=0;i<5;i++){
    const x=-.018+i*.041,y=.146-i*.041,d=.032*Math.sin(i*1.24);
    furLock(k,shoulder,i%2?'tigerFurAsh':'tigerFurTip',p([[x,y,.024],[x+.070,y-.052,.103+d],
      [x+.117,y-.132,.142+d],[x+.178,y-.217,.114+d]]),[side*.29,.19,.91],.086-i*.007,i+3,mobile);
    furLock(k,shoulder,i%3?'tigerFurAsh':'tigerFurTip',p([[x+.047,y-.031,-.100],
      [x+.115,y-.065,-.175-d],[x+.159,y-.123,-.207-d],[x+.214,y-.207,-.185-d]]),
    [side*.35,.15,-.91],.088-i*.006,i+16,mobile);
  }
  for(let i=0;i<5;i++){
    const y=.118-i*.037,z=-.152+i*.059;
    furLock(k,shoulder,i%2?'tigerFur':'tigerFurTip',p([[.045,y+.011,z-.034],
      [.132,y+.025,z-.057],[.238,y-.029,z-.038],[.292,y-.116,z-.012]]),[side*.58,.78,-.22],
    .059-i*.004,i+166,mobile);
    furLock(k,shoulder,'tigerFurShadow',p([[.072,y+.021,z+.019],[.190,y-.008,z+.011],
      [.263,y-.057,z+.021],[.291,y-.121,z+.029]]),[side*.73,.66,.14],.020+i*.003,i+182,mobile);
  }
  for(let i=0;i<4;i++){
    const y=-.032-i*.091;
    thin(k,shoulder,'tigerDark',p([[.046,y+.067,.123,.006],[.116,y+.039,.174,.018],
      [.205,y-.022,.190,.031],[.296,y-.060,.152,.029],[.330,y-.074,.074,.020],
      [.325,y-.077,-.052,.010],[.281,y-.047,-.095,.002]]),14);
    furLock(k,shoulder,'tigerDark',p([[.078,y+.031,-.124],[.176,y+.012,-.183],
      [.242,y-.024,-.171],[.285,y-.091,-.071]]),[side*.42,.06,-.89],.028+i*.006,i+26,mobile);
    if(i===3)continue;
    const armor=p([[-.106,y+.044,.121],[.026,y+.05,.166],[.104,y+.032,.148],[.142,y-.039,.091],
      [.103,y-.080,.074],[-.029,y-.077,.164]]);
    plate(k,elbow,i%2?'tigerClaw':'tigerClawDark',armor,.038);
    thin(k,elbow,'trim',armor.slice(1,5).map(([x,y,z])=>[x,y+.010,z+.019,.013]));
    thin(k,elbow,'tigerClawHot',p([[-.095,y+.006,.154,.009],[-.039,y-.010,.189,.018],
      [.021,y-.006,.202,.016],[.082,y-.029,.171,.003]]),11);
    k.mesh(elbow,'gem','tigerClawDark',side*.104,y-.015,.164,.021,.020,.019);
    k.mesh(elbow,'gem','trim',side*.102,y-.015,.180,.010,.009,.009);
  }
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.081,y=-.052-Math.abs(i-1.5)*.012,z=.197-i*.017;
    carve(k,hand,i%2?'tigerClawDark':'tigerClaw',
      p([[x,y,z,.037,.043],[x+.013,y-.039,z+.122,.047,.042],
        [x+.024,y-.091,z+.252,.028,.026],[x+.023,y-.159,z+.315,.004,.004]]),mobile);
    thin(k,hand,'trim',p([[x,y+.01,z+.011,.009],[x+.015,y-.012,z+.131,.011],
      [x+.024,y-.051,z+.226,.007],[x+.023,y-.129,z+.289,.002]]),9);
  }
  return {shoulder,elbow,hand,side};
}

function fighterLeg(k,body,side,mobile){
  const p=path=>mirror(side,path);
  const hip=k.bone(body,side*.249,.002,-.053),shin=k.bone(hip,side*.146,-.255,.169);
  carve(k,hip,'tigerFurAsh',p([[-.014,.083,-.130,.114,.142],[.071,.002,-.079,.161,.151],
    [.122,-.117,.044,.164,.141],[.150,-.228,.148,.118,.124],[.137,-.315,.166,.087,.082]]),mobile,true);
  carve(k,shin,'tigerFur',p([[.001,.097,-.037,.106,.111],[.015,.020,-.010,.123,.114],[.035,-.091,-.037,.105,.109],
    [.041,-.249,-.071,.092,.105],[.05,-.341,-.005,.100,.094]]),mobile,true);
  carve(k,shin,'tigerMuzzle',p([[.015,.041,.075,.042,.036],[.052,.007,.101,.069,.039],
    [.066,-.074,.110,.042,.032],[.097,-.157,.099,.004,.006]]),mobile,true,2);
  const paw=k.bone(shin,side*.059,-.326,-.024);
  carve(k,paw,'tigerMuzzle',[[0,-.038,-.049,.101,.049],[.011,-.038,.054,.125,.057],
    [.018,-.046,.157,.137,.048],[.016,-.055,.219,.084,.033]],mobile,true);
  for(let i=0;i<4;i++){
    const x=(i-1.4)*.048,z=.214-Math.abs(i-1.5)*.014;
    thin(k,paw,'tigerDark',[[x,-.042,z,.018],[x+.003,-.048,z+.054,.016],[x+.005,-.05,z+.078,.003]],8);
  }
  for(let i=0;i<3;i++){
    const y=-.07-i*.069;
    thin(k,hip,'tigerDark',p([[.013,y,.129,.009],[.108,y-.010,.189,.023],
      [.207,y-.057,.168,.024],[.269,y-.062,.073,.012],[.269,y-.076,-.029,.002]]),12);
  }
  for(let i=0;i<5;i++){
    const y=.102-i*.060,x=.051+i*.030,z=-.17+i*.029;
    furLock(k,hip,i%3?'tigerFur':'tigerFurTip',p([[x,y,z],[x+.071,y-.045,z-.018],
      [x+.129,y-.106,z+.034],[x+.196,y-.163,z+.144]]),[side*.51,-.10,-.85],.060-i*.005,i+37,mobile);
    furLock(k,hip,'tigerDark',p([[x+.013,y-.039,z-.019],[x+.095,y-.063,z-.038],
      [x+.128,y-.103,z+.024],[x+.142,y-.149,z+.087]]),[side*.44,-.20,-.86],.017+i*.002,i+51,mobile);
    if(i<3)furLock(k,shin,i%2?'tigerFur':'tigerFurAsh',p([[.027,.074-i*.083,-.119+i*.006],
      [.067,.023-i*.083,-.131],[.099,-.061-i*.079,-.124],[.132,-.117-i*.081,-.100]]),
    [side*.58,.08,-.79],.063-i*.009,i+72,mobile);
  }
  return {hip,shin,paw,side};
}

export function sculptWhiteTigerChampion(k,entry,mobile){
  const body=k.bone(k.root,0,.82,0),head=k.bone(body,0,.663,.299);
  carve(k,body,'tigerFurAsh',[[0,-.15,-.105,.219,.167],[0,.042,-.122,.256,.199],
    [0,.290,-.081,.318,.209],[0,.459,-.057,.367,.232],[0,.581,-.012,.358,.245],
    [0,.677,.061,.242,.202],[0,.739,.142,.164,.142]],mobile,true);
  const jaw=headParts(k,head,mobile);
  const arms=sides.map(side=>fighterArm(k,body,side,mobile));
  const legs=sides.map(side=>fighterLeg(k,body,side,mobile));
  for(const side of sides){
    const p=path=>mirror(side,path);
    carve(k,body,'tigerFur',p([[.046,.701,.150,.076,.058],[.111,.635,.195,.116,.082],
      [.183,.532,.211,.131,.082],[.160,.418,.159,.101,.063],[.078,.300,.154,.027,.027]]),mobile,true);
    for(let i=0;i<5;i++){
      const x=.033+i*.049,y=.711-i*.021,z=.231-i*.033;
      furLock(k,body,i%3?'tigerFurTip':'tigerMuzzle',p([[x,y,z],[x+.041,y-.095,z+.037],
        [x+.094,y-.176,z+.030],[x+.112,y-.264,z-.013]]),[side*.22,.08,.98],.077-i*.008,i+85,mobile);
      furLock(k,body,i%2?'tigerFurAsh':'tigerFurTip',p([[x,y+.026,-.085],[x+.036,y-.034,-.189],
        [x+.107,y-.115,-.267],[x+.166,y-.198,-.251]]),[side*.39,.18,-.90],.080-i*.008,i+93,mobile);
    }
    for(let i=0;i<4;i++){
      const y=.522-i*.087,z=.190-i*.012;
      thin(k,body,'tigerDark',p([[.209,y-.047,z+.028,.004],[.254,y-.013,z+.010,.017],
        [.311,y+.017,z-.048,.022],[.339,y+.011,z-.136,.006]]),10);
      furLock(k,body,i%2?'tigerFurAsh':'tigerFurTip',p([[.109+i*.017,y+.013,z+.074],
        [.166+i*.014,y-.054,z+.063],[.207+i*.011,y-.113,z+.059],[.229+i*.009,y-.19,z+.018]]),
      [side*.43,-.09,.90],.063-i*.004,i+103,mobile);
    }
    for(let i=0;i<(mobile?4:5);i++){
      const y=.592-i*.082,z=-.231-(i%2)*.034,x=.038+i*.029;
      thin(k,body,'tigerDark',p([[x,y,z,.012],[x+.127,y+.022,z-.049,.024],[x+.217,y-.018,z+.016,.031],
        [x+.269,y-.059,z+.088,.019],[x+.262,y-.105,z+.186,.002]]),14);
      furLock(k,body,i%2?'tigerFurAsh':'tigerFurTip',p([[x+.018,y+.025,z+.016],
        [x+.065,y-.041,z-.033],[x+.112,y-.113,z-.057],[x+.161,y-.203,z-.055]]),
      [side*.32,.13,-.94],.064,i+121,mobile);
      thin(k,body,'tigerDark',p([[x+.06,y-.015,z-.064,.005],[x+.124,y-.060,z-.079,.015],
        [x+.165,y-.112,z-.093,.011],[x+.224,y-.180,z-.06,.002]]),13);
    }
    for(let i=0;i<3;i++){
      const x=.023+i*.017,y=.56-i*.126,z=-.29-(i%2)*.025;
      furLock(k,body,i%2?'tigerFurAsh':'tigerFurTip',p([[x,y+.090,z+.037],
        [x+.030,y+.020,z-.018],[x+.055,y-.068,z-.043],[x+.076,y-.144,z-.023]]),
      [side*.14,.11,-.98],.074-i*.006,i+139,mobile);
      furLock(k,body,'tigerDark',p([[x+.014,y+.03,z-.020],[x+.042,y-.019,z-.053],
        [x+.077,y-.097,z-.048],[x+.102,y-.150,z-.024]]),[side*.18,.09,-.98],.024-i*.002,i+146,mobile);
    }
    for(let i=0;i<5;i++){
      const x=.024+i*.041,y=.693-i*.044,z=-.188-i*.011;
      furLock(k,body,i%3?'tigerFur':'tigerFurTip',p([[x,y+.015,z+.032],[x+.023,y-.023,z-.028],
        [x+.066,y-.102,z-.074],[x+.086,y-.198,z-.056]]),[side*.24,.33,-.92],.068-i*.004,i+202,mobile);
      if(i!==4)furLock(k,body,'tigerFurShadow',p([[x+.019,y-.018,z-.019],[x+.068,y-.057,z-.066],
        [x+.087,y-.112,z-.080],[x+.105,y-.168,z-.069]]),[side*.37,.29,-.88],.021,i+219,mobile);
    }
    const belt=p([[.014,.117,.219],[.213,.120,.202],[.322,.071,.032],[.306,.005,-.179],
      [.178,-.106,-.238],[.020,-.068,-.219]]);
    plate(k,body,'tigerClawDark',belt,.043);
    thin(k,body,'trim',belt.map(([x,y,z])=>[x,y+.026,z+.012,.018]),16);
  }
  const tabard=k.bone(body,0,.099,.211);
  const panel=[[-.148,.062,.051],[.147,.062,.051],[.143,-.328,.172],[.185,-.625,.127],[0,-.585,.199],
    [-.187,-.621,.126],[-.144,-.32,.17]];
  plate(k,tabard,'silk',panel,.026);
  thin(k,tabard,'trim',[...panel,panel[0]].map(([x,y,z])=>[x,y,z+.024,.013]),21);
  for(const side of sides){
    thin(k,tabard,'tigerClaw',mirror(side,[[.011,-.028,.084,.013],[.077,-.137,.138,.018],
      [.087,-.255,.183,.013],[.024,-.35,.209,.017],[.122,-.481,.188,.003]]),14);
  }
  const tail=k.bone(body,0,-.014,-.229),tailEnd=k.bone(tail,.247,.434,-.398);
  const stem=[[0,0,0,.126,.11],[.108,.029,-.227,.098,.097],[.208,.224,-.321,.080,.073],
    [.247,.434,-.398,.066,.060]];
  carve(k,tail,'tigerFur',stem,mobile,true);
  carve(k,tailEnd,'tigerFur',[[0,-.007,0,.066,.07],[.024,.202,-.022,.056,.056],
    [.042,.404,-.078,.039,.037],[.01,.549,-.184,.01,.009]],mobile,true);
  for(const [joint,count,shift] of [[tail,4,0],[tailEnd,5,.05]])for(let i=0;i<count;i++){
    const t=i/count,angle=Math.sin(t*1.8),r=.09-t*.018-shift*.58;
    const [x,y,z]=joint===tail?[t*.25,t*t*.46,-t*.395]:[t*.037,t*.51,-t*.13];
    const path=Array.from({length:8},(_,n)=>{
      const a=n*Math.PI*2/7;
      return [x+Math.cos(a)*r,y+Math.sin(a)*r*(1-angle*.65),z+Math.sin(a)*r*(.36+angle*.43),.011];
    });
    thin(k,joint,'tigerDark',path,10);
  }
  return {body,head,crest:k.bone(body,0,0,0),catalogueSculpt:entry.id,pattern:'duel',grounded:true,snowTiger:true,
    cataloguePose({beat,wind,strike,travel,stage,fall,step}){
      body.rotation.x=.11+wind*.19-strike*.36+travel*.11;
      head.rotation.y=Math.sin(beat*.47)*.103-wind*.20+strike*.29;
      head.rotation.x=.016+wind*.17-strike*.21;
      jaw.rotation.x=.037+wind*.12+strike*.59+stage*.07;
      tabard.rotation.x=-.09+Math.sin(beat*.64)*.08+travel*.18+strike*.46;
      tabard.rotation.z=wind*.19-strike*.31;
      tail.rotation.set(wind*.14-strike*.28,Math.sin(beat*.72)*.23-.14*strike,Math.sin(beat*.51)*.13);
      tailEnd.rotation.z=Math.sin(beat*.69-.42)*.21+strike*.39;
      tailEnd.rotation.y=wind*.14-strike*.24;
      for(const arm of arms){
        const {shoulder,elbow,hand,side}=arm,lead=side===1?1:.67;
        const run=Math.sin(step+side*Math.PI*.50)*travel;
        shoulder.rotation.set(.13+run*.46-wind*.89*lead+strike*1.14*lead,
          side*(wind*.35-strike*.52),side*(.16+wind*.21+strike*.27));
        elbow.rotation.set(-.37+Math.max(0,run)*.24+wind*.48-strike*.34,side*(wind*.16-strike*.29),side*.14);
        hand.rotation.x=-.07-wind*.40+strike*.64;
      }
      for(const {hip,shin,paw,side} of legs){
        const gait=Math.sin(step+side*Math.PI*.50)*travel;
        hip.rotation.x=-.15+gait*.37+wind*.18-strike*.21;
        hip.rotation.z=side*(.075+fall*.31);
        shin.rotation.x=.12+Math.max(0,-gait)*.42+wind*.16;
        paw.rotation.x=-shin.rotation.x*.63-hip.rotation.x*.44;
      }
    }};
}
