import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2,sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...coordinates])=>[side*x,...coordinates]);
const line=(k,j,m,path,steps=11,ribs=6)=>k.sculpt.sweep(j,m,path.map(([x,y,z,r=.013])=>[x,y,z,r]),
  {steps,sides:ribs,ridge:.14});
const plate=(k,j,m,path,d=.04)=>k.sculpt.plate(j,m,path,d,d*.35);
const pin=(k,j,m,x,y,z,r=.028)=>k.mesh(j,'gem',m,x,y,z,r,r,r*.74);
const carve=(k,j,m,path,mobile,section=2.32)=>k.geometry(j,m,sculptVolume(path,{
  rings:mobile?12:18,sides:mobile?10:14,section,ridge:.14,
}));

function finishes(k){
  const material=(color,metalness,roughness,kind,envMapIntensity,scan=.36)=>paintedFinish(new T.MeshStandardMaterial({
    color,metalness,roughness,envMapIntensity,envMap:forgeEnvironment(),vertexColors:true,
    ...(kind==='hide'?scannedSurface('leather',scan):scannedSurface('hammered',scan)),
  }),kind,true,true);
  Object.assign(k.materials,{
    vaultIron:material(0x242c32,.64,.63,'iron',.42),
    vaultBronze:material(0x75543a,.60,.59,'bronze',.55),
    vaultBrass:material(0xb88b4d,.71,.46,'bronze',.65,.27),
    vaultPatina:material(0x304541,.49,.62,'bronze',.50),
    vaultGlaze:material(0x375558,.31,.53,'bronze',.43,.21),
    vaultSkin:material(0x4b443e,.07,.81,'hide',.24),
    vaultBone:material(0x957b60,.13,.65,'bone',.28,.25),
    vaultInlay:new T.MeshBasicMaterial({color:0xffc47e}),
  });
}

function domePosition(angle,latitude,lift=0){
  const radial=Math.sin(latitude);
  const y=.30+1.04*Math.max(0,Math.cos(latitude))**.89;
  const shoulder=(.93+.07*Math.cos(angle*2))*(1+.035*Math.cos(angle*5));
  return [Math.sin(angle)*(1.03*radial*shoulder+lift*.68),y+lift,
    -.14+Math.cos(angle)*(1.35*radial+lift*.74)];
}

function meshGrid(rows,columns,sample,thickness=0){
  const xyz=[],uv=[],color=[],indices=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){
    const v=i/rows,u=j/columns;
    const [x,y,z,tone,green=1,blue=1]=sample(u,v);
    xyz.push(x,y,z);uv.push(u,v);color.push(tone,tone*green,tone*blue);
    if(i&&j){
      const a=i*(columns+1)+j,b=a-columns-1;
      indices.push(b-1,a-1,b,b,a-1,a);
    }
  }
  if(thickness){
    const index=(i,j)=>i*(columns+1)+j;
    const border=[];
    for(let i=0;i<rows;i++)border.push(index(i,0));
    for(let j=0;j<columns;j++)border.push(index(rows,j));
    for(let i=rows;i>0;i--)border.push(index(i,columns));
    for(let j=columns;j>0;j--)border.push(index(0,j));
    const inner=xyz.length/3;
    const center=[0,0,0];
    for(const i of border){
      const [x,y,z]=xyz.slice(i*3,i*3+3);
      const a=.988*x,b=y-thickness,c=-.14+(z+.14)*.988;
      xyz.push(a,b,c);uv.push(uv[i*2],uv[i*2+1]);color.push(.48,.44,.42);
      center[0]+=a;
      center[1]+=b;
      center[2]+=c;
    }
    const hub=xyz.length/3;
    xyz.push(...center.map(component=>component/border.length));
    uv.push(.5,.5);color.push(.44,.42,.41);
    for(let i=0;i<border.length;i++){
      const next=(i+1)%border.length,a=border[i],b=border[next],c=inner+i,d=inner+next;
      indices.push(a,c,b,b,c,d,hub,d,c);
    }
  }
  const geometry=new T.BufferGeometry().setIndex(indices);
  geometry.setAttribute('position',new T.Float32BufferAttribute(xyz,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.computeVertexNormals();
  return geometry;
}

function scuteProfile({angle,span,top,bottom,seed},u,v){
  const across=u*2-1,edge=Math.abs(across);
  const wrap=.69+.30*Math.min(1,v*5,(1-v)*4+.32);
  const spanAngle=angle+across*span*wrap+Math.sin(v*2.1+seed)*.016;
  const latitude=T.MathUtils.lerp(top,bottom,v)+v**3*(.084*(1-edge**.63)-.021*edge);
  const along=Math.sin(Math.PI*(.055+.91*v));
  const score=Math.sin(u*23+seed)*Math.sin(v*16-seed);
  const bulge=along*(.033+.055*(1-edge)**.79)+.024*(1-edge**8);
  return domePosition(spanAngle,latitude,bulge+(score*.006)*(1-edge**3));
}

function crownMark(k,carapace,tile,mark){
  const full=[
    [.24,.59],[.15,.37],[.35,.49],[.50,.26],[.66,.49],[.85,.37],[.76,.59],[.69,.66],[.31,.66],[.24,.59],
  ];
  const lateral=mark===0?full:full.map(([u,v],i)=>[
    .5+(u-.5)*.85,.52+(v-.52)*(mark===1?1.16:.86)+(i===3?-.03:0),
  ]);
  const inlay=lateral.map(([u,v])=>[...scuteProfile(tile,u,v),.012]);
  line(k,carapace,'vaultIron',inlay,28,6);
  line(k,carapace,mark===1?'vaultPatina':'vaultBrass',
    inlay.map(([x,y,z,r],i)=>[x+(i<5?-.009:.009),y+.010,z+.006,r*.63]),28,6);
  line(k,carapace,'vaultBrass',[[.31,.73],[.50,.746],[.70,.73]].map(([u,v])=>
    [...scuteProfile(tile,u,v),.007]),9,5);
}

function carapace(k,body,mobile){
  const back=k.bone(body,0,0,0);
  back.name='鎖庫金黿 · 弧形龜甲';
  k.geometry(back,'vaultIron',meshGrid(mobile?16:23,mobile?40:62,(u,v)=>{
    const lat=.008+v*1.56,a=u*tau;
    const spot=Math.cos(a*9+v*14)*Math.sin(a*11-v*19);
    return [...domePosition(a,lat),.72+spot*.13+v*.14,1.07,1.15];
  }));
  const bands=[[6,.222,.64,0],[9,.652,1.062,.45],[12,1.074,1.50,0]];
  for(const [row,[count,top,bottom,offset]] of bands.entries()){
    for(let i=0;i<count;i++){
      const angle=(i+offset)*tau/count;
      const tile={angle,span:tau/count*.476,top,bottom,seed:i*.834+row*2.3};
      const tone=Math.cos(i*5.26+row*1.3);
      const metal=row===1&&i%3===1?'vaultPatina':i%5===3?'vaultGlaze':'vaultBronze';
      k.geometry(back,metal,meshGrid(mobile?8:12,mobile?8:12,(u,v)=>{
        const edge=Math.abs(u*2-1),vein=Math.sin(u*27+v*39+tile.seed)*Math.cos(v*27-u*38);
        const abrasion=.22*edge**4+.14*v**4+.14*Math.max(0,vein)**5;
        const grain=.088*Math.sin(v*2.6+tile.seed)+.071*vein;
        return [...scuteProfile(tile,u,v),.67+abrasion+grain+tone*.09,
          metal==='vaultGlaze'?1.12:1.01,metal==='vaultGlaze'?1.14:.91];
      },.046));
      for(const side of sides){
        const profile=Array.from({length:7},(_,step)=>{
          const t=step/6,u=side<0?.049:.952;
          return [...scuteProfile(tile,u,.09+t*.83),.009+Math.sin(t*Math.PI)*.010];
        });
        line(k,back,i%4===0?'vaultBrass':'vaultPatina',profile,10,5);
      }
      const hasCrown=row===1&&(i===0||i===2||i===4||i===6||i===8)||row===2&&i%3===0;
      if(hasCrown)crownMark(k,back,tile,(i+row)%3);
      if(row===2&&i%2===1){
        const p=scuteProfile(tile,.51,.78);
        pin(k,back,'vaultBrass',p[0],p[1]+.021,p[2],.041);
      }
    }
  }
  for(const [r,material,size] of [[1.485,'vaultBronze',.064],[1.544,'vaultBrass',.031]]){
    const path=Array.from({length:37},(_,i)=>[...domePosition(i*tau/36,r,.021),size]);
    line(k,back,material,path,mobile?38:60,8);
  }
  return back;
}

function circularPlate(k,joint,finish,radius,depth,z){
  const geo=new T.CylinderGeometry(radius*.98,radius,depth,32);
  geo.rotateX(Math.PI*.5);
  geo.translate(0,0,z);
  k.geometry(joint,finish,geo);
}

function keyholeShape(){
  const p=new T.Path();
  p.moveTo(-.047,-.137);
  p.lineTo(-.039,-.048);
  p.absarc(0,.032,.084,Math.PI*1.34,Math.PI*-.34,true);
  p.lineTo(.048,-.137);
  p.closePath();
  return p;
}

function vaultDial(k,anchor,radius,mobile){
  circularPlate(k,anchor,'vaultIron',radius,.082,-.017);
  circularPlate(k,anchor,'vaultGlaze',radius*.78,.034,.026);
  const lock=k.bone(anchor,0,0,0);
  const surround=new T.Shape();
  surround.absarc(0,0,radius*.79,0,tau,false);
  const slot=keyholeShape(),scaled=new T.Path();
  for(const [i,p] of slot.getPoints(18).entries())scaled[i?'lineTo':'moveTo'](p.x*radius*3.2,p.y*radius*3.2);
  scaled.closePath();
  surround.holes.push(scaled);
  const geo=new T.ExtrudeGeometry(surround,{depth:.025,bevelEnabled:true,bevelSize:.011,
    bevelThickness:.012,bevelSegments:1,curveSegments:mobile?8:15});
  geo.translate(0,0,.035);
  k.geometry(lock,'vaultBronze',geo);
  k.mesh(anchor,'ring','vaultBrass',0,0,.071,radius*.94,radius*.94,.45);
  k.mesh(lock,'ring','vaultPatina',0,0,.071,radius*.71,radius*.71,.70);
  for(let i=0;i<(mobile?12:16);i++){
    const count=mobile?12:16,a=i*tau/count,x=Math.sin(a),y=Math.cos(a);
    pin(k,anchor,i%4===0?'vaultBrass':'vaultPatina',x*radius*.839,y*radius*.839,.068,i%4===0?.027:.018);
    line(k,lock,'vaultBrass',[[x*radius*.58,y*radius*.58,.075,.004],[x*radius*.65,y*radius*.65,.077,.006],
      [x*radius*.696,y*radius*.696,.073,.003]],6,5);
  }
  return lock;
}

function cabinet(k,body,mobile){
  const crown=k.bone(body,0,1.321,-.164);
  crown.name='金黿 · 庫印鎖盤';
  crown.rotation.x=-Math.PI/2;
  const lock=vaultDial(k,crown,.322,mobile);
  const anchor=k.bone(lock,0,-.17,.043);
  anchor.name='金黿 · 庫印銅扣';
  const shoe=[[-.129,-.074,-.024],[-.138,.016,.011],[-.10,.10,.036],[.10,.093,.036],
    [.136,.023,.006],[.124,-.077,-.026]];
  plate(k,anchor,'vaultIron',shoe,.058);
  line(k,anchor,'vaultBrass',shoe.slice(1,5).map(([x,y,z])=>[x,y,z+.036,.018]),11,6);
  const hasp=k.bone(anchor,0,-.023,.047);
  for(const side of sides){
    const bow=mirror(side,[[.087,-.002,.003,.022],[.123,-.035,.058,.026],[.108,-.084,.109,.021],
      [.060,-.119,.152,.018],[.004,-.131,.164,.010]]);
    line(k,hasp,'vaultBrass',bow,13,7);
  }
  const vents=[];
  for(const dir of sides){
    const center=k.bone(body,0,dir>0?.410:.454,dir>0?1.115:-1.420);
    center.rotation.y=dir<0?Math.PI:0;
    const frame=[[-.431,.237,-.107],[-.238,.347,-.083],[0,.352,-.085],[.238,.347,-.083],
      [.431,.237,-.107],[.364,.006,.002],[.174,-.14,.049],[-.18,-.14,.049],[-.364,.006,.002]];
    plate(k,center,'vaultIron',frame,.081);
    line(k,center,'vaultBronze',frame.map(([x,y,z])=>[x,y,z+.023,.057]),22,8);
    line(k,center,'vaultBrass',frame.slice(0,5).map(([x,y,z])=>[x,y+.017,z+.061,.021]),17,6);
    const seal=k.bone(center,0,.057,.071);
    const dial=vaultDial(k,seal,dir>0?.166:.226,mobile);
    for(const side of sides){
      const x=side*.328;
      const grate=k.bone(center,x,.081,.025);
      grate.rotation.y=side*.13;grate.rotation.z=-side*.11;
      plate(k,grate,'vaultIron',mirror(side,[[-.075,.10,.008],[.082,.08,-.013],
        [.064,-.08,-.025],[-.062,-.111,.020]]),.042);
      for(let i=0;i<3;i++){
        const y=.067-i*.053;
        const port=k.bone(grate,0,y,.026);
        plate(k,port,'vaultBronze',[[-.057,.018,.018],[.056,.016,.017],[.048,-.017,-.005],
          [-.044,-.020,-.007]],.015);
        line(k,port,'vaultInlay',[[-.039,-.019,.004],[.039,-.019,.005]],5,5);
        vents.push({joint:port,side,i});
      }
      pin(k,center,'vaultBrass',x,.217,.014,.036);
      pin(k,center,'vaultPatina',side*.224,-.076,.090,.041);
      for(let i=0;i<3;i++){
        const rimX=side*(.19+i*.081),rimY=.19+i*.012;
        line(k,center,i===1?'vaultPatina':'vaultBrass',[[rimX,rimY,-.044,.01],
          [rimX+side*.026,rimY+.059,-.034,.017],[rimX+side*.069,rimY+.09,-.011,.004]],8);
      }
    }
    vents.push({joint:dial,side:dir,dial:true});
  }
  return {crown,lock,hasp,vents};
}

function limb(k,body,side,front,mobile){
  const upper=k.bone(body,side*(front?.671:.687),.104,front?.65:-.740);
  const elbow=k.bone(upper,side*.102,-.212,front?.035:-.045);
  const foot=k.bone(elbow,side*.042,-.228,.116);
  const fan=points=>mirror(side,points);
  carve(k,upper,'vaultSkin',fan([[0,.061,-.077,.188,.206],[.061,.004,-.035,.223,.204],
    [.143,-.111,.013,.193,.167],[.12,-.233,.088,.127,.109]]),mobile);
  carve(k,elbow,'vaultSkin',fan([[.006,.066,-.018,.124,.112],[.038,-.060,.038,.147,.123],
    [.046,-.152,.078,.115,.107],[.035,-.222,.113,.095,.102]]),mobile);
  carve(k,foot,'vaultIron',[[0,-.047,-.052,.139,.068],[0,-.031,.034,.158,.081],
    [0,-.034,.146,.192,.067],[.006,-.043,.237,.173,.056],[0,-.057,.273,.114,.027]],mobile,2.88);
  const knee=fan([[-.098,.178,.043],[.022,.2,.011],[.145,.143,-.001],[.214,.032,.021],
    [.153,-.136,.072],[.062,-.203,.139],[-.081,-.129,.124]]);
  plate(k,upper,'vaultIron',knee,.045);
  for(let i=0;i<(mobile?3:4);i++){
    const z=.106-i*.060,y=.101-i*.053;
    const guard=fan([[-.026,y+.029,z+.015],[.036,y+.049,z+.012],[.155,y+.043,z-.004],
      [.201,y-.031,z-.009],[.154,y-.074,z+.021],[.041,y-.068,z+.089]]);
    plate(k,upper,i%2?'vaultBronze':'vaultPatina',guard,.025);
    line(k,upper,'vaultBrass',guard.slice(0,5).map(([x,y,z])=>[x,y+.016,z+.017,.015]),8);
  }
  pin(k,elbow,'vaultBrass',side*.12,.023,.106,.045);
  const ridges=front?4:3;
  for(let i=0;i<ridges;i++){
    const x=(i-(ridges-1)/2)*.069,tip=.33-Math.abs(x)*.15;
    carve(k,foot,'vaultBone',[[x,-.032,.175,.049,.043],[x,-.044,.225,.049,.035],
      [x+side*.007,-.062,tip-.048,.027,.026],[x+side*.014,-.102,tip,.002,.005]],mobile);
  }
  return {upper,elbow,foot,side,front};
}

function throat(k,body,mobile){
  const head=k.bone(body,0,.255,1.108);
  const jaw=k.bone(head,0,-.155,.067);
  const neck=k.bone(body,0,.166,.607);
  carve(k,neck,'vaultSkin',[[0,.005,-.098,.241,.220],[0,.060,.117,.219,.162],
    [0,.102,.32,.171,.127],[0,.119,.404,.146,.125]],mobile);
  carve(k,head,'vaultSkin',[[0,-.14,.041,.160,.098],[0,-.068,.152,.221,.162],
    [0,.055,.019,.259,.221],[.012,.187,-.031,.242,.192],[.009,.262,-.127,.121,.119]],mobile);
  carve(k,jaw,'vaultIron',[[0,-.059,.224,.141,.048],[0,-.021,.194,.184,.069],
    [0,-.003,.042,.204,.094],[0,.042,-.082,.141,.062]],mobile);
  carve(k,head,'vaultBone',[[0,-.086,.284,.126,.067],[0,-.042,.354,.119,.075],
    [0,.032,.311,.141,.079],[0,.062,.193,.098,.057],[0,.075,.109,.055,.045]],mobile,2.75);
  for(const side of sides){
    const fan=points=>mirror(side,points);
    const socket=fan([[.041,.108,.218],[.133,.124,.257],[.213,.116,.215],[.253,.051,.153],
      [.214,-.029,.193],[.146,-.031,.244],[.075,.009,.241]]);
    plate(k,head,'vaultIron',socket,.020);
    pin(k,head,'glow',side*.138,.046,.273,.040);
    carve(k,head,'vaultBrass',fan([[.028,.099,.257,.023,.024],[.101,.166,.249,.046,.035],
      [.184,.169,.194,.053,.039],[.240,.143,.086,.034,.029],[.277,.10,-.036,.008,.010]]),mobile);
    carve(k,head,'vaultPatina',fan([[.103,-.035,.242,.024,.017],[.185,-.089,.212,.049,.039],
      [.24,-.045,.105,.058,.039],[.248,.014,-.044,.034,.027],[.224,.059,-.113,.006,.008]]),mobile);
    const nasal=fan([[.092,.057,.328,.013],[.073,.068,.347,.023],[.037,.053,.353,.010]]);
    line(k,head,'vaultIron',nasal,9);
    for(let i=0;i<(mobile?4:6);i++){
      const u=i/(mobile?3:5),x=.158+u*.084,y=-.043-u*.066,z=.23-u*.177;
      line(k,head,i%2?'vaultIron':'vaultBrass',fan([[x,y+.001,z,.006],[x+.022,y-.011,z-.039,.013],
        [x+.016,y-.048,z-.077,.009],[x-.019,y-.068,z-.084,.004]]),8);
    }
    for(let i=0;i<3;i++){
      const x=.102+i*.033,z=.258-i*.053;
      line(k,jaw,'vaultBone',fan([[x,-.003,z,.018],[x+.008,.025,z+.002,.014],[x+.019,.056,z-.017,.003]]),7);
    }
    line(k,jaw,'vaultBrass',fan([[.097,-.113,.211,.012],[.172,-.094,.159,.026],
      [.201,-.04,.068,.022],[.184,-.008,-.028,.013]]),11);
  }
  line(k,head,'vaultBrass',[[0,.170,.17,.029],[.014,.223,.119,.041],[.014,.267,.024,.056],
    [-.010,.272,-.071,.043],[-.025,.227,-.20,.009]],13);
  return {head,jaw,neck};
}

export function carveVaultTurtle(k,mobile){
  finishes(k);
  const body=k.bone(k.root,0,.510,0);
  body.name='鎖庫金黿';
  carve(k,body,'vaultSkin',[[0,.024,-1.35,.51,.22],[0,.043,-.98,.710,.269],[0,.08,-.52,.776,.270],
    [0,.085,.125,.752,.261],[0,.078,.703,.674,.244],[0,.014,1.065,.437,.192]],mobile,2.9);
  carve(k,body,'vaultIron',[[0,.281,-1.419,.395,.21],[0,.356,-1.05,.771,.26],
    [0,.388,-.308,.933,.285],[0,.38,.435,.903,.25],[0,.34,.993,.668,.21],
    [0,.277,1.194,.412,.18]],mobile,2.8);
  const shell=carapace(k,body,mobile);
  const drum=cabinet(k,shell,mobile);
  const {head,jaw,neck}=throat(k,body,mobile);
  const limbs=[];
  const tail=k.bone(body,0,.088,-1.205);
  carve(k,tail,'vaultSkin',[[0,.021,.079,.146,.137],[.018,.003,-.05,.125,.114],
    [.125,.015,-.237,.099,.084],[.233,.039,-.373,.060,.057],[.32,.086,-.512,.013,.015]],mobile);
  for(let i=0;i<4;i++){
    const x=.039+i*.068,z=-.086-i*.086,y=.085+i*.026,r=.078-i*.014;
    line(k,tail,i%2?'vaultBrass':'vaultBronze',[[x-.066,y,z+.045,r*.40],[x,y+r*.31,z,.041],
      [x+.09,y,z-.067,r*.50],[x+.067,y+.06,z-.133,.006]],8);
  }
  for(const side of sides)for(const front of [true,false])limbs.push(limb(k,body,side,front,mobile));
  const crest=k.bone(body,0,0,0);
  const vaultMechanism=({beat,stage,wind,strike,step,travel,fall})=>{
    const wake=Math.sin(beat*.52),charge=Math.max(stage*.27,wind*.64,strike*.92);
    shell.rotation.z=wake*travel*.032+strike*.021;
    drum.crown.position.y=1.321+charge*.091;
    drum.lock.rotation.z=wake*.097+wind*.42-strike*.74+stage*.31;
    drum.hasp.rotation.x=wake*.13-charge*.87;
    for(const {joint,side,i,dial} of drum.vents){
      if(dial)joint.rotation.z=side*(wind*.37-strike*.51+stage*.22)+wake*.057;
      else joint.rotation.x=charge*(.44+i*.14)+Math.sin(beat+i*.43)*.023;
    }
    neck.rotation.x=wind*.26-strike*.43;
    head.position.z=1.108-wind*.12+strike*.247;
    head.rotation.x=-wind*.17+strike*.23+Math.sin(beat*.61)*.028;
    jaw.rotation.x=.056+wind*.15+strike*.47+stage*.069;
    for(const {upper,elbow,foot,side,front} of limbs){
      const stride=step+side*Math.PI/2+(front?0:Math.PI);
      upper.rotation.x=Math.sin(stride)*travel*.33+wind*(front?.19:-.06)-strike*(front?.27:-.096);
      upper.rotation.z=side*(.035+wind*.063+fall*.19);
      elbow.rotation.x=(.19+Math.max(0,Math.cos(stride))*.33)*travel-wind*.081+strike*.047;
      foot.rotation.x=-elbow.rotation.x*.64-upper.rotation.x*.38+strike*.07;
    }
  };
  return {body,head,tail,legs:limbs.map(limb=>limb.upper),crest,pattern:'bulwark',
    campaign:{flaps:[],joints:[]},vaultMechanism};
}
