import * as T from '../three.min.mjs';
import {sculptVolume,featherVane} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=2*Math.PI;
const reflect=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const plate=(k,j,m,path,depth=.038)=>k.sculpt.plate(j,m,path,depth,depth*.31);
const edge=(k,j,m,path,mobile)=>k.sculpt.sweep(j,m,path,{steps:mobile?10:16,sides:mobile?6:8,ridge:.18});
const volume=(k,j,m,path,mobile,seed=0,section=2.34)=>k.geometry(j,m,
  sculptVolume(path,{sides:mobile?9:13,rings:mobile?11:17,section,ridge:.22,seed}));
const leaf=(k,j,m,[a,b,c],w,seed,mobile)=>k.geometry(j,m,featherVane(a,b,c,w,seed,mobile?8:13));

function taperPlate(k,j,finish,trim,side,shape,thickness,mobile,facing=1){
  const points=reflect(side,shape);
  plate(k,j,finish,points,thickness);
  edge(k,j,trim,points.slice(1,5).map(([x,y,z],i)=>[x,y+.008,z+.023*facing,[.005,.019,.014,.003][i]]),mobile);
}

function rivet(k,part,material,x,y,z,size){
  k.mesh(part,'gem','deep',x,y,z,size*1.21,size*1.24,size*.66);
  k.mesh(part,'gem',material,x,y,z+Math.sign(z)*.011,size,size*.89,size*.72);
}

function coil(k,part,material,path,width,mobile){
  for(let i=0;i<3;i++){
    const offset=.019*(i-1);
    edge(k,part,i===1?'deep':material,path.map(([x,y,z,r],j)=>[
      x+offset*Math.cos(j*1.1+i),y+offset*Math.sin(j*1.1+i),z+(i-1)*.013,r*width,
    ]),mobile);
  }
}

function splitHat(k,hat,mobile){
  const count=mobile?32:48;
  const profiles=[[0,.041],[.159,.034],[.262,.016],[.321,-.023],[.303,-.040],[.135,-.016],[0,-.014]];
  const position=[],uv=[],color=[],triangles=[];
  for(const [band,[r,y]] of profiles.entries())for(let i=0;i<=count;i++){
    const t=i/count,a=t*tau;
    const bent=Math.cos(a*2+.73)*.023+Math.sin(a*4.0-.2)*.012;
    const nick=(Math.sin(a*11)**6)*r*.037;
    const w=(r-nick)*(1+.037*Math.cos(a)+.034*Math.sin(a*3));
    position.push(Math.sin(a)*w,y+Math.sin(a)*w*.11+bent*(r/.321),Math.cos(a)*w);
    uv.push(t,band/(profiles.length-1));
    const shade=.73+.105*Math.cos(a*5.1+band)+.13*Math.sin(a*7-band*.4);
    color.push(shade,shade*.93,shade*.87);
    if(i<count&&band<profiles.length-1){
      const a=band*(count+1)+i,b=a+count+1;
      triangles.push(a,b,a+1,b,b+1,a+1);
    }
  }
  const g=new T.BufferGeometry();
  g.setIndex(triangles);
  g.setAttribute('position',new T.Float32BufferAttribute(position,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T.Float32BufferAttribute(color,3));
  g.computeVertexNormals();
  k.geometry(hat,'ochre',g);
}

export function redBanditPortrait(k,rig,mobile){
  const {body,head,limbs}=rig;
  const hat=k.bone(head,-.008,.236,-.043);
  hat.rotation.z=-.078;hat.rotation.x=.072;
  splitHat(k,hat,mobile);
  volume(k,hat,'banditWrap',[[0,.020,0,.126,.127],[0,.069,-.009,.142,.137],[0,.158,-.031,.114,.117],
    [0,.192,-.051,.075,.086],[0,.212,-.066,.012,.016]],mobile,18,2.17);
  const bind=[];
  for(let i=0;i<=8;i++){
    const a=i*tau/8;
    bind.push([Math.sin(a)*.144,.053+Math.cos(a*3)*.008,Math.cos(a)*.139-.014,.014]);
  }
  edge(k,hat,'red',bind,mobile);
  const headband=[];
  for(let i=0;i<=14;i++){
    const a=i*tau/14;
    headband.push([Math.sin(a)*.168,.188+Math.sin(a*1.6)*.017,Math.cos(a)*.177-.002,.023]);
  }
  edge(k,head,'banditLinen',headband,mobile);
  for(let i=0;i<(mobile?7:10);i++){
    const a=(i+.4)*tau/(mobile?7:10),x=Math.sin(a),z=Math.cos(a);
    edge(k,hat,i%2?'black':'steel',[[x*.156,.017,z*.16,.005],[x*.221,.008,z*.225,.009],
      [x*.272,-.011+Math.cos(a*2)*.009,z*.279,.009],[x*.313,-.027,z*.313,.002]],mobile);
  }
  const left=limbs[0].shoulder,right=limbs[1].elbow;
  const pincer=[[0,.099,.099],[-.172,.153,.068],[-.279,.092,-.021],[-.256,-.037,-.102],
    [-.143,-.16,-.099],[-.045,-.105,.143]];
  plate(k,left,'dusk',pincer,.036);
  edge(k,left,'banditLinen',pincer.slice(0,5).map(([x,y,z],i)=>[x,y+.011,z+.027,[.006,.012,.013,.008,.003][i]]),mobile);
  for(let i=0;i<3;i++)taperPlate(k,right,'black','red',1,
    [[-.036,.049-i*.094,.114],[.061,.085-i*.094,.124],[.163,.051-i*.094,.092],
      [.123,-.047-i*.094,.141],[.021,-.061-i*.094,.159],[-.047,-.008-i*.094,.14]],.035,mobile);
  const harness=[[-.304,.593,-.103,.054],[-.228,.439,-.219,.052],[-.055,.302,-.264,.046],
    [.161,.073,-.263,.044],[.26,-.115,-.159,.02]];
  coil(k,body,'ochre',harness,1,mobile);
  const lock=k.bone(head,.124,-.061,.072);
  edge(k,lock,'red',[[0,0,.081,.014],[.073,-.008,.008,.022],[.106,-.041,-.092,.012],
    [.143,-.089,-.19,.003]],mobile);
  return ({beat,wind,strike,travel})=>{
    hat.rotation.x=.072+wind*.085-strike*.13;
    lock.rotation.y=Math.sin(beat*.8)*.085+travel*.13-strike*.17;
  };
}

function rudra(k,rig,mobile){
  const {body,head,limbs}=rig,braids=[];
  volume(k,head,'cobalt',[[0,-.07,-.121,.116,.086],[0,.034,-.143,.166,.10],
    [0,.132,-.091,.162,.13],[0,.212,-.069,.119,.120],[0,.278,-.093,.083,.074]],mobile,18);
  for(const side of sides){
    const f=x=>side*x;
    const crown=[[.012,.128,.153],[.064,.146,.139],[.142,.188,.105],[.194,.282,-.017],
      [.157,.322,-.103],[.079,.237,-.027],[.023,.194,.067]];
    taperPlate(k,head,'cobalt','brass',side,crown,.063,mobile);
    volume(k,head,'brass',reflect(side,[[.08,.151,.135,.012,.008],[.147,.222,.12,.036,.023],
      [.213,.291,.042,.029,.020],[.223,.381,-.105,.025,.011],[.192,.396,-.167,.003,.003]]),mobile,side+12);
    for(let i=0;i<3;i++){
      const u=i*.055;
      const braid=k.bone(head,f(.072+u),.15-i*.036,-.128-u*.3);
      coil(k,braid,i%2?'cobalt':'teal',reflect(side,[[0,0,0,.042],[.041,-.127,-.093,.046],
        [.073,-.271,-.117,.04],[.11,-.396,-.146,.03],[.158,-.448-i*.047,-.192,.005]]),1,mobile);
      braid.rotation.z=f(.12+i*.15);braids.push({braid,side,i});
    }
    for(let i=0;i<3;i++)taperPlate(k,limbs[side===1?1:0].shoulder,i%2?'cobalt':'steel','brass',side,
      [[.013,.072-i*.077,-.118],[.13,.166-i*.077,-.163],[.274,.123-i*.077,-.097],
        [.203,-.045-i*.077,.126],[.11,-.071-i*.077,.137],[.032,-.021-i*.077,.067]],.046,mobile);
    const rear=[[.041,.407,-.245],[.161,.486,-.298],[.275,.458,-.339],[.293,.295,-.352],
      [.175,.198,-.367],[.046,.240,-.322]];
    taperPlate(k,body,'cobalt','ivory',side,rear,.052,mobile,-1);
    rivet(k,body,'brass',f(.235),.391,-.374,.028);
    rivet(k,head,'steel',f(.148),.038,.065,.023);
  }
  k.mesh(head,'gem','glow',0,.162,.18,.029,.050,.018);
  return ({beat,wind,strike,travel})=>{
    for(const {braid,side,i} of braids){
      braid.rotation.z=side*(.12+i*.15+Math.sin(beat*.84-i*.77)*.065+strike*.13);
      braid.rotation.x=travel*.11+wind*.082-strike*.23;
    }
  };
}

function yaksha(k,rig,mobile){
  const {body,head,jaw,limbs}=rig,shanks=[];
  for(const side of sides){
    const f=x=>side*x;
    const earFrame=[[.117,.089,.117],[.192,.135,.069],[.239,.177,-.108],[.215,.076,-.213],
      [.161,-.053,-.136],[.125,-.083,.039]];
    taperPlate(k,head,'black','jade',side,earFrame,.061,mobile);
    const split=reflect(side,[[.136,.125,.066,.050,.036],[.208,.198,-.012,.080,.055],
      [.316,.289,-.134,.064,.041],[.342,.411,-.249,.040,.028],[.323,.483,-.312,.003,.004]]);
    volume(k,head,'jade',split,mobile,side,2.6);
    edge(k,head,'ivory',split.map(([x,y,z,r])=>[x+f(.023),y+.027,z+.016,r*.37]),mobile);
    const eye=[[.036,.101,.146],[.091,.125,.134],[.174,.083,.059],[.172,.035,.089],
      [.122,.009,.161],[.047,.034,.17]];
    taperPlate(k,head,'black','steel',side,eye,.035,mobile);
    k.mesh(head,'gem','glow',f(.086),.059,.175,.036,.010,.014,0,0,f(.21));
    const jowl=[[.035,-.024,.157],[.085,-.022,.174],[.151,-.054,.147],[.185,-.101,.064],
      [.146,-.171,.011],[.069,-.151,.141]];
    taperPlate(k,head,'jade','brass',side,jowl,.068,mobile);
    volume(k,jaw,'ivory',reflect(side,[[.067,-.041,.157,.026,.016],[.092,.017,.155,.024,.017],
      [.107,.078,.132,.015,.012],[.094,.1,.108,.002,.002]]),mobile,side+8);
    const mantle=k.bone(head,f(.123),.043,-.134);
    for(let i=0;i<(mobile?4:6);i++){
      const t=i*.044;
      const coords=reflect(side,[[.031+t,.108-i*.023,-.023],[.151+t,.044-i*.031,-.14],
        [.175+t,-.125-i*.043,-.269+i*.015]]);
      leaf(k,mantle,i%2?'black':'ochre',coords,.068,i+83,mobile);
      edge(k,mantle,'black',coords.map(([x,y,z],i)=>[x,y,z,[.02,.036,.003][i]]),mobile);
    }
    shanks.push({mantle,side});
    for(let i=0;i<3;i++)taperPlate(k,body,i%2?'jade':'black','steel',side,
      [[.053,.239+i*.121,-.273],[.156,.274+i*.121,-.355],[.258,.239+i*.121,-.392],
        [.209,.113+i*.121,-.402],[.137,.084+i*.121,-.39],[.037,.121+i*.121,-.322]],.048,mobile,-1);
    const shin=limbs[side===1?1:0].knee;
    taperPlate(k,shin,'jade','brass',side,[[.014,.017,.138],[.099,.058,.147],[.147,-.052,.146],
      [.088,-.218,.168],[.038,-.240,.174],[-.021,-.108,.151]],.043,mobile);
  }
  return ({beat,wind,strike})=>{
    for(const {mantle,side} of shanks){
      mantle.rotation.y=side*(wind*.102-strike*.18)+Math.sin(beat*.58+side)*.054;
      mantle.rotation.x=strike*.22-wind*.073;
    }
  };
}

function elder(k,rig,mobile){
  const {body,head,jaw,limbs}=rig,beards=[];
  volume(k,head,'red',[[0,.028,-.15,.122,.081],[0,.129,-.117,.172,.112],[0,.233,-.12,.161,.126],
    [0,.296,-.164,.119,.074],[0,.327,-.216,.051,.046],[0,.332,-.249,.011,.014]],mobile,18);
  for(const side of sides){
    const f=x=>side*x;
    const wrap=[[.004,.139,.124],[.078,.157,.135],[.136,.212,.082],[.147,.27,-.063],
      [.111,.297,-.16],[.028,.253,-.109],[.004,.218,.029]];
    taperPlate(k,head,'ochre','brass',side,wrap,.041,mobile);
    for(let i=0;i<(mobile?3:5);i++)edge(k,head,i%3?'red':'ochre',reflect(side,[[.12,.101+i*.025,-.03,.015],
      [.176,.109+i*.023,-.096,.028],[.147,.135+i*.023,-.193,.028],[.047,.148+i*.030,-.234,.008]]),mobile);
    const theMoustache=reflect(side,[[.012,-.067,.149,.014,.01],[.047,-.081,.166,.026,.014],
      [.107,-.113,.158,.032,.016],[.142,-.134,.097,.003,.003]]);
    volume(k,head,'ivory',theMoustache,mobile,side+1);
    const beard=k.bone(jaw,f(.034),.013,.093);
    for(let i=0;i<(mobile?5:8);i++){
      const t=i/(mobile?4:7);
      const flow=reflect(side,[[.031+t*.05,-.009,.03],[.066+t*.053,-.141,.079-t*.025],
        [.081+t*.095,-.32-t*.06,.036-t*.047]]);
      leaf(k,beard,i%3?'ivory':'linen',flow,.036,i+7,mobile);
      edge(k,beard,i%2?'ivory':'ochre',flow.map(([x,y,z],i)=>[x,y,z,[.012,.022,.002][i]]),mobile);
    }
    beards.push({beard,side});
    const bind=limbs[side===1?1:0].elbow;
    for(let i=0;i<3;i++)taperPlate(k,bind,i%2?'red':'black','brass',side,[[.02,.039-i*.083,.135],[.081,.077-i*.083,.151],
      [.128,.025-i*.083,.108],[.10,-.063-i*.083,.154],[.022,-.092-i*.083,.178],[-.024,-.021-i*.083,.159]],.032,mobile);
    coil(k,body,'ochre',reflect(side,[[.075,.592,-.223,.031],[.187,.481,-.311,.036],
      [.229,.309,-.384,.033],[.193,.149,-.375,.029],[.139,.034,-.319,.009]]),1,mobile);
  }
  k.mesh(head,'gem','brass',0,.187,.165,.044,.049,.026);
  k.mesh(head,'gem','glow',0,.192,.193,.022,.025,.01);
  return ({beat,wind,strike,travel})=>{
    for(const {beard,side} of beards){
      beard.rotation.z=Math.sin(beat*.62+side)*.072+side*strike*.084;
      beard.rotation.x=wind*.14-strike*.19+travel*.12;
    }
  };
}

const portraits={m039:rudra,m041:yaksha,m059:elder};
export function courtPortrait(k,rig,id,mobile){return portraits[id]?.(k,rig,mobile);}
