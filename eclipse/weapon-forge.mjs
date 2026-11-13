import * as T from '../three.min.mjs';
import {designs} from './weapon-designs.mjs?v=armory-art-1';

const PI=Math.PI, TAU=PI*2;
const s=.1;
const up=new T.Vector3(0,1,0);
const vec=([x,y,z=0])=>new T.Vector3(x*s,y*s,z*s);

function workshop(root,materials) {
  function add(geometry,finish='body',point=[0,0,0],group=root) {
    const mesh=new T.Mesh(geometry,materials[finish]);
    mesh.position.copy(vec(point));
    group.add(mesh);
    return mesh;
  }
  function gem(point,radius,finish='core',scale=[1,1,1],detail=0) {
    const mesh=add(new T.IcosahedronGeometry(radius*s,detail),finish,point);
    mesh.scale.set(...scale);
    return mesh;
  }
  function plate(outline,finish='edge',depth=.65,point=[0,0,0],bevel=.14) {
    const shape=new T.Shape();
    for(let i=0;i<outline.length;i+=2){
      const x=outline[i]*s,y=outline[i+1]*s;
      if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);
    }
    shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{depth:depth*s,bevelEnabled:true,
      bevelThickness:bevel*s,bevelSize:bevel*s,bevelSegments:1,steps:1});
    geometry.translate(0,0,-depth*s/2);
    return add(geometry,finish,point);
  }
  function line(points,width=.25,finish='trim',smooth=true) {
    const path=points.map(vec);
    const curve=smooth?new T.CatmullRomCurve3(path):new T.CurvePath();
    if(!smooth)for(let i=1;i<path.length;i++)curve.add(new T.LineCurve3(path[i-1],path[i]));
    return add(new T.TubeGeometry(curve,Math.max(4,path.length*3),width*s,5,false),finish);
  }
  function segment(a,b,width,finish='trim',tip=width) {
    const first=vec(a),last=vec(b),axis=last.clone().sub(first);
    const mesh=add(new T.CylinderGeometry(tip*s,width*s,axis.length(),8),finish);
    mesh.position.copy(first).lerp(last,.5);
    mesh.quaternion.setFromUnitVectors(up,axis.normalize());
    return mesh;
  }
  function loop(point,radius,width,finish='trim',plane='xy',sides=24,arc=TAU) {
    const mesh=add(new T.TorusGeometry(radius*s,width*s,6,sides,arc),finish,point);
    if(plane==='xz')mesh.rotation.x=PI/2;
    if(plane==='yz')mesh.rotation.y=PI/2;
    return mesh;
  }
  function lathe(points,point=[0,0,0],finish='body',sides=16){
    return add(new T.LatheGeometry(points.map(([x,y])=>new T.Vector2(x*s,y*s)),sides),finish,point);
  }
  function handle(bottom,top,radius=.61) {
    segment([0,bottom],[0,top],radius,'dark',radius*.89);
    for(const y of [bottom+.14,top-.1])loop([0,y],radius*.98,.18,'trim','xz',12);
  }
  function grip(y,radius=.68,count=7,spacing=.28) {
    for(let i=0;i<count;i++){
      const at=y+(i-(count-1)*.5)*spacing;
      const strip=loop([0,at],radius,.11,i===0||i===count-1?'trim':'dark','xz',12);
      strip.rotation.z=i%2?.15:-.13;
      if(i%2===0){
        gem([radius*.72,at,radius*.71],.092,'trim',[.72,1.30,.67]);
        gem([-radius*.72,at,-radius*.71],.092,'trim',[.72,1.30,.67]);
      }
    }
  }
  function inlay(points,z=.58,width=.08,finish='core',smooth=true) {
    for(const side of [-1,1])line(points.map(([x,y])=>[x,y,side*z]),width,finish,smooth);
  }
  function studs(points,radius=.16,z=.78,finish='trim') {
    for(const [x,y] of points)for(const side of [-1,1])gem([x,y,side*z],radius,finish,[1,1,.64]);
  }
  function box(point,size,finish='trim') {
    return add(new T.BoxGeometry(...size.map(x=>x*s)),finish,point);
  }
  return {root,add,gem,plate,line,segment,loop,lathe,handle,grip,inlay,studs,box};
}

function blade(h,guard,edge,fuller) {
  const {plate,handle,grip,gem,studs,inlay,loop,line}=h;
  const scythe=guard==='bone';
  handle(scythe?-11:-8.1,scythe?5.8:-2.55,scythe?.57:.63);
  grip(scythe?-3:-5.55,.66,scythe?12:8);
  plate(edge,'edge',.89);
  plate(fuller,'body',1.03);
  if(scythe) {
    for(const [x,y] of [[0,4.2],[1.15,4.75],[2.32,5.43]])gem([x,y,.2],.8,'trim',[1,1.4,.74]);
    loop([0,5.1],1.17,.17,'trim');
    studs([[3.25,6.8],[4.9,7.3],[6.3,7.12]],.21,.65,'core');
    return;
  }
  const guards={
    'fire-guard':[-3.8,-2.65,-3.45,-.25,-2.23,-1.7,-1.76,.65,-.96,-1.37,0,-.35,.98,-1.37,1.9,.65,2.31,-1.63,3.45,-.25,3.85,-2.65,2.15,-3.6,0,-3.38,-2.17,-3.6],
    ribbon:[-2.9,-2.71,-3.48,-2.2,-1.43,-2.08,0,-2.7,1.63,-2.05,3,-2.26,3.4,-2.89,1.05,-3.2,-1.07,-3.2],
    frost:[-3.6,-1.68,-2.2,-1.41,-1.7,-.32,0,-1.78,1.42,-.7,2.1,-1.67,3.08,-1.2,2.34,-3.1,-2.2,-3.32],
    lightning:[-3.66,-2.48,-2.46,-1.43,-1.58,-1.7,-.56,-.53,.39,-1.85,2,-1.47,3.73,-2.31,2.85,-2.85,.92,-2.72,-.28,-3.54,-1.23,-2.77],
    collar:[-2.03,-2.92,-1.64,-2.42,1.42,-2.31,1.79,-3.21,1.03,-3.73,-1.7,-3.63],
    dragon:[-2.49,-2.94,-2.61,-1.57,-1.7,-1.85,-.94,-.55,1.78,-.75,2.42,-1.61,1.28,-1.99,2.42,-2.39,.86,-3.45,-1.37,-3.63],
    temple:[-2.4,-3.1,-1.76,-2.11,1.77,-2.04,2.6,-2.72,1.17,-3.63,-1.02,-3.59],
    leaves:[-2.92,-2.57,-3.15,-.77,-1.42,-1.57,.06,-2.31,1.44,-1.64,2.95,-.57,2.66,-2.57,1.14,-3.5,-1.2,-3.37],
    blood:[-3.04,-2.23,-2.67,-1.09,-1.09,-1.82,.12,-.97,.94,-2.1,2.92,-1.1,2.79,-2.66,1.64,-3.18,-1.93,-3.44],
    nether:[-3.33,-2.47,-2.54,-1.36,-1.63,-1.53,-.89,-.64,1.04,-1.69,1.86,-.51,3.28,-1.64,2.81,-2.94,1.31,-3.47,-1.71,-3.29],
  };
  plate(guards[guard],'trim',1.0,[0,0,0],.19);
  for(const side of [-1,1]){
    plate(guards[guard].map((value,index)=>index%2?(value+2.5)*.62-2.5:value*.76),'dark',.28,[0,0,side*.60],.08);
  }
  gem([0,-2.65,0],.75,'core',[1,1.05,1.2],1);
  studs([[-1.63,-2.38],[1.63,-2.38],[-.98,-2.85],[.98,-2.85]],.14,.75,'edge');
  gem([0,-8.12,0],guard==='nether'?1.04:.68,'trim',[1,.77,.83]);
  if(guard==='ribbon'){
    line([[-.2,-7.55,.18],[-1.8,-8.7,.25],[-4.1,-8.48,.44],[-5.04,-9.5,.57]],.19,'core');
    line([[.1,-7.6,-.18],[-1.1,-8.82,-.37],[-3.13,-9.65,-.21]],.12,'body');
  }
  if(guard==='fire-guard'){
    for(const side of [-1,1]){
      line([[0,-3,side*.64],[1.48,-2.83,side*.77],[2.8,-1.29,side*.67],[2.45,-.56,side*.52]],.16,'core');
      line([[0,-3,side*.64],[-1.48,-2.83,side*.77],[-2.8,-1.29,side*.67],[-2.45,-.56,side*.52]],.16,'core');
    }
  }
  if(guard==='lightning')inlay([[.03,-.47],[.55,.84],[.16,1.71],[.64,2.79],[.22,3.4],[.81,4.95]],.60,.12,'core',false);
  if(guard==='frost')studs([[-.76,.25],[-.48,2.42],[-.52,4.6],[-.44,6.42]],.2,.6,'core');
  if(guard==='blood'||guard==='nether')inlay([[-.45,-1.6],[-.81,.69],[-.68,2.4],[-.82,4.25],[-.55,5.7]],.60,.155,'core');
  if(guard==='dragon'||guard==='temple'){
    studs(guard==='dragon'?[[1.11,-1.61],[-.47,2.24],[-2.98,4.8]]:[[.86,-2.31],[-.46,1.05],[-2.44,3.52]],.27,.62,'core');
    for(let i=0;i<4;i++)loop([0,-5.1-i*.65],.66,.084,i%2?'edge':'trim','xz',12);
  }
  if(guard==='leaves'){
    for(let i=0;i<4;i++){
      const leaf=plate([0,0,-1.52,1.21,-1.47,2.29,-.41,1.61,.17,.28],'core',.36,[-.91+i*.14,i*1.27-1.85,.57],.06);
      leaf.rotation.z=-i*.21;
    }
  }
}

function branch(h,ancient){
  const {plate,handle,grip,inlay,gem}=h;
  handle(-8.4,-3,.66);grip(-5.7,.68);
  plate([-3.1,-2.76,-2.51,-.61,-1.45,-.52,0,-1.27,1.56,-.4,2.51,-.79,3.13,-2.82,1.2,-3.22,-1.22,-3.15],'trim',1.2);
  plate([-1.21,-2.51,-1.26,7.39,-.46,10.38,.56,10.11,1.17,7.34,1.24,-2.49],'body',1);
  for(let i=0;i<3;i++)for(const side of [-1,1]){
    const y=-.45+i*2.82+(ancient&&side===1?.51:0);
    const profile=[.63,y-.65,2.7-i*.31,y-.37,3.8-i*.13,y+.51,4.39-i*.31,y+2.07,3.18-i*.32,y+1.49,2.45-i*.13,y+.67,.7,y+.34];
    plate(profile.map((n,j)=>j%2?n:n*side),i===1&&ancient?'trim':'edge',.78);
  }
  inlay([[0,-2],[.29,-.7],[-.21,.28],[.23,1.88],[-.19,3.1],[.2,4.26],[-.25,5.7],[.11,7.1],[0,9.25]],.63,.15,'core',false);
  gem([0,-2.2,.78],.51,'core');
}

function pole(h,style,outline) {
  const {handle,grip,plate,inlay,gem,loop,studs,line}=h;
  handle(-10.7,style==='wing'?5.6:4.9,style==='red'||style==='blue'?.43:.55);
  grip(-3.32,style==='red'||style==='blue'?.49:.61,9,.37);
  plate(outline,'edge',.88);
  const inset=outline.map((v,i)=>i%2?(v-6.8)*.86+6.8:v*.81);
  plate(inset,style==='red'?'trim':'body',.96,[0,0,0],.10);
  const socket=style==='vritra'?2.39:2.94;
  loop([0,socket],.77,.20,'trim','xz',12);
  loop([0,socket-.63],.60,.13,'edge','xz',12);
  gem([0,socket+.58,.63],style==='nether'?1.04:.69,'core',[1,1.16,.58],1);
  gem([0,-10.83],.68,'edge',[1,1.67,1]);
  if(style==='ribbon'||style==='nether'||style==='wing'){
    const spread=style==='wing'?2.7:1.7;
    for(const side of [-1,1]){
      const tassel=plate([0,0,-.79,-1.1,-.58,-2.86,.08,-4.7,.6,-3.59,.61,-1.5],
        style==='ribbon'?'core':'trim',.23,[spread*side,socket-.25,side*.27],.06);
      tassel.rotation.z=-side*.38;
    }
  }
  if(style==='red'||style==='blue'||style==='ice'){
    const crest=style==='red'?[[-.7,3.64],[-.5,5],[-2.22,7.48],[-2.2,9.78]]:[[0,3.43],[-.25,4.9],[-.37,6.29],[-.7,7.66],[-.12,9.89]];
    inlay(crest,.59,.13,'core',false);
    studs([[0,-6.65],[0,-6.1],[0,-5.55]],.14,.44);
  }
  if(style==='vritra'||style==='shiva')for(const side of [-1,1]){
    line([[side*.24,3.57,.54],[side*1.25,4.38,.6],[side*2.92,4.9,.59],[side*3.48,6.55,.55]],.14,'core');
    gem([side*2.82,4.87,.71],.27,'trim');
  }
}

function axe(h,style,outline) {
  const {handle,grip,plate,gem,loop,studs}=h;
  handle(-8.96,style==='moon'?5.63:6.87,.68);
  grip(-4.4,.71,10,.43);
  plate(outline,'edge',1.04);
  plate(outline.map((v,i)=>i%2?(v-3.9)*.74+3.9:(v+.5)*.78-.5),'body',1.18,[0,0,0],.11);
  gem([0,3.9],1.48,'trim',[1,1.19,.63]);
  gem([0,3.91,.95],style==='sun'?.86:.66,'core',[1,1,.62],1);
  studs(style==='blood'?[[-4.15,2.4],[-3.57,3.0],[-2.91,3.67]]:[[-3.15,4.49],[-2.41,4.38],[-1.68,4.21]],.2,.62,'trim');
  loop([0,-8.81],.74,.19,'edge','xz',10);
}

function wheel(h,radius,teeth,style,center) {
  const {loop,plate,gem,segment}=h;
  const profile=loop([0,0,0],radius,style==='wave'?.47:.41,'body','xy',32);
  if(style==='wave')profile.scale.x=1.08;
  for(const side of [-1,1]){
    loop([0,0,side*.44],radius+.10,.12,'edge');
    loop([0,0,side*.49],radius-.51,.075,'trim');
    if(style==='wave'){
      loop([0,0,side*.67],radius-1.34,.17,'core').rotation.set(side*.24,side*.32,.26);
      loop([0,0,side*.53],radius+.55,.115,'trim','xy',24,PI*1.3).rotation.z=side*1.49;
    }
  }
  if(center==='hub'){
    gem([0,0,0],1.76,'body',[1,1,.47],1);
    loop([0,0,.65],1.59,.22,'edge');
    gem([0,0,.67],.77,'core',[1,1,.53]);
    for(const side of [-1,1])loop([0,0,side*.72],.96,.09,'trim','xy',14);
    for(let i=0;i<4;i++){
      const angle=i*PI/2;
      segment([Math.sin(angle)*1.2,Math.cos(angle)*1.2],[Math.sin(angle)*radius,Math.cos(angle)*radius],.22,'trim');
    }
  }
  const flanges={
    flange:[-.64,-.3,-1.3,1.02,-.59,1.9,.33,1.05,1.27,.46,.94,-.19],
    sun:[-.5,-.2,-.36,.73,.35,1.8,.67,.51,.43,-.24],
    dart:[-.39,-.2,-.62,.56,-.12,2.36,.55,.83,.48,-.19],
    wave:[-1,-.5,-.5,.57,.53,1.56,2.03,1.64,1.17,.81,.74,-.08],
    scythe:[-1.53,-.47,-1.12,1.27,.25,3.0,2.54,3.12,1.31,1.95,1.10,.44,.18,-.27],
  };
  for(let i=0;i<teeth;i++){
    const angle=i*TAU/teeth;
    const local=flanges[style].map((n,j)=>j%2?n+radius:n);
    const tooth=plate(local,'edge',style==='scythe'?.84:.51,[0,0,0],.10);
    tooth.rotation.z=angle;
    if(style!=='sun'||i%2===0)gem([-Math.sin(angle)*(radius-.37),Math.cos(angle)*(radius-.37),.58],.25,'core',[1,1,.53]);
  }
}

function face(h,y,z,scale,finish='edge'){
  const {gem}=h;
  gem([0,y,z],1.42*scale,finish,[1,.95,.75],1);
  gem([0,y-.97*scale,z+.39*scale],.74*scale,finish,[1,.73,.77]);
  for(const side of [-1,1])gem([side*.49*scale,y+.11*scale,z+.98*scale],.37*scale,'dark',[1,.74,.48]);
  gem([0,y-.34*scale,z+1.03*scale],.23*scale,'dark',[.72,1,.57]);
}
function staff(h,style) {
  const {handle,grip,loop,gem,line,plate,lathe,segment}=h;
  const long=style==='imperial'||style==='treasure'||style==='dragon';
  handle(-10.7,long?8.9:6.3,long?.46:.57);
  grip(-3.3,long?.54:.65,8,.38);
  for(const y of [-9.7,-.6,4.4])loop([0,y],long?.48:.65,.12,'trim','xz',12);
  if(style==='dragon'){
    for(const side of [-1,1]) {
      line([[0,-8.7,side*.35],[side*.78,-6.5,side*.57],[side*.91,-4.3,side*.58],[0,-2.46,side*.60]],.21,'body');
      line([[0,3.1,side*.35],[side*.76,4.6,side*.57],[side*.75,6.9,side*.53],[0,8.5,side*.4]],.24,'core');
    }
    for(const y of [-10,9.1])gem([0,y],.90,'edge',[.79,1.29,.79],1);
  }else if(style==='treasure'){
    segment([0,-7.18],[0,6.2],.47,'body',.49);
    for(const y of [-10.5,8.83]){
      gem([0,y],.87,'core',[1,1.05,1],1);
      for(const d of [-.56,.56])loop([0,y+d],.52,.18,'trim','xz',12);
    }
  }else if(style==='imperial'){
    const head=lathe([[0,0],[1.55,-.18],[2.18,.48],[2.38,1.7],[1.92,3.05],[.7,3.84],[0,4.02]],[0,7.28],'trim');
    head.rotation.z=.18;
    for(let i=0;i<7;i++){
      const angle=i*TAU/7;
      gem([Math.cos(angle)*1.73,8.67,Math.sin(angle)*1.73],.53,i%2?'edge':'core');
    }
    for(const y of [8.42,9.41])loop([0,y],1.93,.11,'dark','xz');
    gem([0,11.03],.76,'core',[1,1.16,1]);
    gem([0,-10.72],1.08,'trim');
  }else if(style==='bones'){
    face(h,7.8,.55,1.12);
    for(const side of [-1,1]){
      line([[side*.69,7.78],[side*2.14,7.78],[side*3.75,6.74],[side*3.45,5.91]],.25,'edge');
      line([[side*.93,7.12],[side*2.34,6.33],[side*2.62,5.26]],.21,'edge');
    }
    for(let i=0;i<7;i++)loop([0,5.6-i*1.3],.53,.14,'edge','xz',9);
  }else if(style==='bat'){
    plate([-4.66,8.11,-3.83,9.88,-2.84,8.75,-2.0,10.49,-1.26,8.44,0,7.52,1.3,8.68,2.01,10.39,2.77,8.71,4.0,9.85,4.41,7.65,3.04,7.98,2.37,6.49,1.36,6.92,0,5.4,-1.31,6.8,-2.44,6.29,-3.1,7.93],'body',.91);
    gem([0,7.69,.66],1.2,'core',[1,1.15,.67],1);
    loop([0,7.7,.51],1.36,.16,'trim');
  }else if(style==='wind'){
    for(let i=0;i<3;i++){
      const curl=loop([Math.sin(i*TAU/3)*1.44,7.65+Math.cos(i*TAU/3)*1.2,.12],1.68,.27,i%2?'edge':'trim','xy',24,PI*1.51);
      curl.rotation.z=i*TAU/3;
    }
    gem([0,7.56,.48],1.04,'core',[1,1.18,.72],1);
    line([[0,6.54],[.33,5.67],[1.13,5.61],[2.06,4.75]],.22,'body');
  }else if(style==='chain'){
    gem([0,8.08],1.14,'core',[1,1.14,.76],1);
    for(const side of [-1,1]){
      line([[0,6],[side*1.5,6.4],[side*2.5,7.55],[side*1.88,9.6],[side*1.23,9.08]],.32,'body');
      for(let i=0;i<4;i++){
        const link=loop([side*(1.86+i*.22),7.11-i*.83,side*.2],.46,.12,'edge');
        link.rotation.y=side*(i%2===0?.9:.17);
      }
    }
    gem([0,9.75],.83,'trim',[.71,1.35,.71]);
  }else{
    const curl=loop([.07,8.39],1.73,.34,'body','xy',28,PI*1.64);
    curl.rotation.z=-1.3;
    line([[0,6],[.78,6.57],[1.42,7.12],[1.64,8.1]],.32,'trim');
    gem([.10,8.37,.32],1.03,'core',[1.14,.84,.76],1);
    for(let i=0;i<4;i++)loop([0,5.59-i*.49],.68,.16,i%2?'trim':'body','xz',12);
  }
}

function orb(h,radius,style) {
  const {gem,loop,line,plate,studs}=h;
  if(style==='fortune'){
    h.lathe([[0,-.6],[4.41,-.59],[4.95,-.31],[5.07,0],[4.95,.34],[4.47,.59],[0,.6]],[0,0,0],'trim',32).rotation.x=PI/2;
    for(const side of [-1,1]){
      loop([0,0,.66*side],radius-.52,.23,'edge');
      loop([0,0,.69*side],radius-1.1,.09,'core');
      for(const [stroke,width] of [
        [[[-2.4,2.4],[-1.9,1.89]],.17],[[[-2.8,1.3],[-.63,1.3],[-1.79,.22],[-1.84,-2.48]],.21],
        [[[-1.75,.14],[-.68,-.7]],.15],[[[.13,2.1],[2.65,2.1]],.16],
        [[[.36,1.43],[.46,.56],[2.5,.56],[2.5,1.45],[.36,1.43]],.15],
        [[[.13,.03],[.2,-2.28],[2.68,-2.28],[2.64,-.02],[.13,.03]],.18],
        [[[.28,-1.02],[2.6,-1.02]],.14],[[[1.44,-.02],[1.44,-2.18]],.14],
      ])line(stroke.map(([x,y])=>[x,y,side*.75]),width,'body',false);
    }
    return;
  }
  gem([0,0,0],radius*.87,style==='dragon'?'edge':'body',[1,1.02,.91],2);
  if(style==='dragon'){
    loop([0,0,0],radius*.92,.30,'trim').rotation.set(.51,.42,-.30);
    line([[-3,-1,1.7],[-2.24,1.56,2.14],[-.41,2.74,2.54],[1.91,2.15,2.63],[2.65,.94,2.55],[1.73,.50,3.1]],.48,'trim');
    gem([2.17,1.08,3.03],.46,'core',[1.2,.73,1]);
    for(let i=0;i<5;i++)gem([-2.57+i*.62,2.68+Math.sin(i*.6)*.76,.8+i*.28],.55,'edge',[.61,1.27,.75]);
  }else if(style==='fire'){
    for(let i=0;i<5;i++){
      const angle=i*TAU/5;
      const flame=plate([-.93,-3.3,-1.06,-1.09,-.81,2.52,1.15,5.55,.7,2.1,1.1,-1.31,.66,-3.27],i%2?'trim':'core',.29,[Math.sin(angle)*radius*.74,0,Math.cos(angle)*radius*.74],.08);
      flame.rotation.y=angle;
    }
    loop([0,-2.54,0],radius*.73,.25,'trim','xz',24);
  }else if(style==='ice'){
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      gem([Math.cos(a)*radius*.73,Math.sin(a)*radius*.73,Math.sin(i*2)*1.2],1.21,i%2?'edge':'core',[.83,1.69,.76]).rotation.z=a-PI/2;
    }
    loop([0,.05,0],radius*.88,.14,'trim','yz');
  }else{
    const stars=style==='storm'?7:4;
    for(let i=0;i<stars;i++){
      const angle=i*TAU/stars;
      const arc=loop([0,0,0],radius*.94,.13+i%2*.055,i%2?'edge':'core','xy',26,PI*1.43);
      arc.rotation.set(angle*.61,i%2?.87:-.71,angle);
      gem([Math.sin(angle)*radius*.69,Math.cos(angle)*radius*.71,i%2?1.28:2.58],.49,i%2?'edge':'core');
    }
  }
  if(style==='storm'||style==='spark'){
    studs([[0,0],[.92,.82],[-1.14,-1.09]],.24,radius*.73,'core');
  }
}

function beads(h,style){
  const {gem,loop,line,lathe}=h;
  const earth=style==='earth', count=earth?12:10;
  const points=Array.from({length:count+1},(_,i)=>{
    const a=i*TAU/count;
    return [Math.sin(a)*(earth?3.88:3.44),Math.cos(a)*(earth?4.62:3.72)+.9,Math.sin(a*2)*.72];
  });
  line(points,.16,earth?'dark':'trim');
  points.slice(0,-1).forEach((point,i)=>{
    gem(point,earth?.55+i%3*.05:.80+i%3*.10,i%2?'body':'edge',[1,1,earth?.88:1.17],1);
    if(!earth)loop(point,.65,.10,'trim','xz',10).rotation.z=i*.55;
  });
  if(earth){
    gem([0,-3.96,.12],.68,'trim');
    for(let i=0;i<5;i++)line([[0,-4.09,.1],[(i-2)*.26,-5.48,.08],[(i-2)*.47,-7.11,-.2]],.145,'core');
  }else{
    gem([0,-3.3,.16],1.05,'core',[1,1.14,1],1);
    lathe([[0,-1.3],[.64,-1.07],[1.11,.2],[.81,.52],[.43,.69],[0,.58]],[0,-4.52,0],'trim',10);
  }
}

function animalDoll(h,style){
  const {gem,plate,line,loop}=h;
  const fox=style==='fox';
  gem([0,.71,0],2.05,'body',[.87,1.11,.67],1);
  gem([0,3.75,.15],2.13,fox?'edge':'body',[1.02,.96,.78],2);
  for(const side of [-1,1]){
    gem([side*.98,-2.02,.27],1.02,'body',[.72,1.49,.88],1);
    gem([side*1.82,1.45,0],1.10,'body',[.81,1.24,.66],1).rotation.z=side*.51;
    const ear=fox?[0,0,.3,2.55,2.26,3.62,2.03,.62]:[0,0,1.2,1.64,4.5,2.13,3.04,.5,1.65,-.63];
    plate(ear.map((n,i)=>i%2?n:n*side),fox?'body':'edge',.61,[side*1.08,4.8,-.08]);
    gem([side*.84,3.83,1.61],.45,'dark',[1,.65,.49],1);
    gem([side*.75,3.94,1.81],.175,'core');
    line([[side*.98,2.21,.98],[side*1.85,2.03,1.17],[side*1.59,.13,.85],[side*1.94,-1.15,.69]],.15,fox?'trim':'edge');
    if(fox)line([[side*1.3,3.17,1.62],[side*1.62,3.08,1.26],[side*1.96,3.17,1.02]],.13,'core');
  }
  gem([0,3.12,1.67],.38,fox?'trim':'core',[1,.71,.64]);
  loop([0,1.9,0],1.35,.19,'trim','xz');
  gem([0,1.76,1.19],.57,'core');
}

function fish(h,style) {
  const {gem,loop,line,plate,segment}=h;
  const lotus=style==='lotus';
  const body=gem([-.6,1.1,0],3.33,lotus?'edge':'body',[1.02,1.09,.8],2);
  body.rotation.z=-.21;
  line([[-3.04,1.51,1.55],[-1.69,1.24,2.42],[.0,1.18,2.62],[1.76,1.47,1.89]],.26,'dark');
  if(lotus){
    for(let i=0;i<8;i++){
      const angle=i*TAU/8;
      const petal=plate([0,-.66,-1.03,.04,-1.28,1.21,-.38,2.12,.28,2.18,1.03,1.30,.77,.2],'body',.35,[-.63-Math.sin(angle)*2.12,1.08+Math.cos(angle)*2.2,1.91],.08);
      petal.rotation.z=angle;
    }
    gem([-.64,1.03,2.58],1.36,'core',[1,1,.41],2);
  }else{
    const carving=loop([-.63,1.3,2.16],2.47,.17,'trim','xy',25,PI*1.84);
    carving.rotation.z=.55;
    line([[-2.48,1.01,2.0],[-2.37,2.18,2.2],[-.67,2.58,2.49],[.68,1.81,2.58],[.77,.53,2.46],[-.54,.38,2.58],[-1.33,1.12,2.65],[-.64,1.89,2.65]],.21,'core');
    gem([-.58,1.77,2.72],.36,'edge');
  }
  const ring=loop([-.87,-2.2,0],lotus?1.84:2.17,.29,'trim');
  ring.rotation.z=.37;
  segment([2.56,-4.9,-.2],[4.28,3.31,-.17],.39,'dark',.49);
  const mallet=gem([4.32,3.59,-.17],.83,'trim',[1,1.39,.91],1);
  mallet.rotation.z=-.21;
}
function bow(h,limb,style){
  const {line,plate,gem,segment,loop,root}=h;
  const limbs=line(limb,style==='turtle'?.54:.47,'body');
  const fittings=[];
  for(const side of [-1,1]){
    const tip=side<0?limb[0]:limb.at(-1);
    const trim=gem([tip[0],tip[1],0],style==='dragon'?.95:.63,'trim',[1,1.3,.85]);
    fittings.push(trim);
    const y=side*3.66;
    const ornaments={
      dragon:[-.42,0,-2.02,1.41,-2.54,3.2,-1.07,2.5,.17,4.0,.61,2.05,2.13,2.51,1.63,.57,.49,-.73],
      oni:[-.63,-.63,-2.17,1.66,-2.37,3.42,-.8,2.47,1.03,3.2,.74,1.36,2.0,1.1,.73,-1.11],
      turtle:[-.91,-.85,-1.57,.74,-.72,2.26,.72,2.08,1.44,.81,.85,-.72],
      red:[-.5,-.67,-1.45,.65,-.75,2.37,-.01,1.43,1.78,2.51,1.48,.87,.44,-.65],
      nether:[-.68,-1.08,-2.37,1.15,-3.4,2.41,-1.38,2.1,-.78,3.3,.19,2.0,1.91,2.91,1.27,1.14,.78,-.96],
    };
    const platePart=plate(ornaments[style].map((v,i)=>i%2?v*side:v),style==='oni'||style==='turtle'?'edge':'trim',.53,[-3.05,y,0],.08);
    fittings.push(platePart);
    const stone=gem([-2.7,y+side*.69,.48],style==='dragon'?.63:.35,'core',[.86,1.4,.7]);
    fittings.push(stone);
    if(style==='dragon'||style==='nether'){
      fittings.push(gem([-3.6,y+side*1.82,-.48],.5,'edge',[1,1.6,.63]));
      fittings.push(gem([-3.6,y+side*1.82,.54],.5,'edge',[1,1.6,.63]));
    }
  }
  for(const y of [-.8,-.35,.35,.8])loop([-1.86,y],.54,.10,'trim','xz',12);
  const string=[-1,1].map(()=>h.add(new T.CylinderGeometry(.0105,.0105,1,5),'edge'));
  const arrow=new T.Group();
  root.add(arrow);
  h.add(new T.CylinderGeometry(.021,.021,.66,6).rotateZ(PI/2),'trim',[0,0,0],arrow);
  h.add(new T.ConeGeometry(.05,.14,5).rotateZ(PI/2),'core',[-3.7,0,0],arrow);
  h.add(new T.ConeGeometry(.042,.12,4).rotateZ(-PI/2),'edge',[2.95,0,0],arrow);
  const position=limbs.geometry.getAttribute('position');
  position.setUsage(T.DynamicDrawUsage);
  root.userData.launch={bow:true,tip:[-.39,0,.015]};
  root.userData.bow={position,rest:position.array.slice(),string,arrow,attachments:fittings.map(mesh=>({mesh,rest:mesh.position.clone()})),
    ends:[vec(limb[0]),vec(limb.at(-1))],draw:-1,nocked:false};
  shapeBow(root,0,false);
}

const lineDirection=new T.Vector3();

export function shapeBow(root,pull,nocked) {
  const bow=root.userData.bow;
  if(!bow)return;
  const draw=Math.round(pull*48)/48;
  if(draw===bow.draw&&nocked===bow.nocked)return;
  bow.draw=draw;
  bow.nocked=nocked;
  const {position,rest,string,arrow,ends,attachments}=bow;
  const bend=y=>Math.min(1,Math.abs(y)/.87)**1.7;
  for(let i=0;i<position.count;i++){
    const offset=i*3, y=rest[offset+1];
    position.setXYZ(i,rest[offset]+draw*.123*bend(y),y*(1-draw*.075),rest[offset+2]);
  }
  position.needsUpdate=true;
  for(const {mesh,rest} of attachments){
    mesh.position.x=rest.x+draw*.123*bend(rest.y);
    mesh.position.y=rest.y*(1-draw*.075);
  }
  const nock=(ends[0].x+ends[1].x)/2+draw*.49;
  for(const [index,end] of ends.entries()){
    const strand=string[index];
    const x=end.x+draw*.123*bend(end.y),y=end.y*(1-draw*.075);
    strand.position.set((nock+x)*.5,y*.5,.015);
    lineDirection.set(x-nock,y,0);
    strand.scale.y=lineDirection.length();
    strand.quaternion.setFromUnitVectors(up,lineDirection.normalize());
  }
  arrow.position.set(nock-.32,0,.015);
  arrow.visible=nocked;
}

function crossbow(h,style){
  const {plate,line,segment,gem,box,loop}=h;
  h.root.userData.launch={flat:true,tip:[0,.785,.09]};
  const lion=style==='lion';
  plate([-1.19,-6.39,-1.5,-4.8,-1.21,-3.41,-.78,.28,-.51,6.96,.64,7.69,1.02,6.18,1.04,.11,1.44,-3.89,1.49,-5.52,.89,-6.45],'dark',1.55);
  box([0,2.3,.82],[.76,8.8,.17],'edge');
  box([0,.65,.89],[.27,8.43,.12],'body');
  for(const side of [-1,1]){
    const sweep=lion?[[0,4.44],[2.82,4.86],[5.15,3.55],[6.2,4.55],[6.64,6.3]]:
      [[0,4.09],[3.24,3.47],[4.87,3.59],[5.32,5.57],[6.1,5.8]];
    line(sweep.map(([x,y])=>[x*side,y,.1]),lion?.56:.46,lion?'trim':'body');
    line([[6.1*side,lion?6.3:5.8,.1],[0,1.33,.22]],.10,'edge');
    const claws=lion?3:2;
    for(let i=0;i<claws;i++){
      const x=(3.56+i*.88)*side;
      const tooth=gem([x,4.2+i*.14,.19],.61,'edge',[.65,1.63,.74]);
      tooth.rotation.z=-side*.41;
    }
    gem([side*1.17,-2.24,.71],.38,'trim');
  }
  if(lion){
    face(h,3.84,1.1,.82,'core');
    for(let i=0;i<9;i++){
      const angle=(i-4)*.61;
      const mane=gem([-Math.sin(angle)*1.57,3.92+Math.cos(angle)*1.53,.96],.57,'trim',[1,1.63,.86]);
      mane.rotation.z=angle;
    }
  }else{
    for(const y of [-1.36,1.4,6.37])box([0,y,.66],[1.60,.38,.57],'trim');
    segment([0,-.7,1.46],[0,3.05,1.46],.31,'body');
    for(const y of [.01,2.53])box([0,y,1.13],[.57,.26,.9],'trim');
    gem([0,3.19,1.43],.34,'core');
  }
  const trigger=loop([.17,-2.8,-.66],.73,.15,'trim','yz',10);
  trigger.scale.y=.74;
}

function gun(h,cannon){
  const {plate,loop,lathe,segment,studs,box,gem}=h;
  h.root.userData.launch={tip:[0,cannon?.838:.944,0]};
  if(cannon){
    lathe([[.04,-3.8],[1.31,-3.58],[1.79,-2.58],[1.57,-.3],[1.46,3.7],[1.84,6.43],[2.29,7.2],
      [2.33,8.18],[1.72,8.38],[1.20,8.1],[1.22,6.48],[.90,4.32],[.03,3.8]],[0,0,0],'body',20);
    for(const [y,r] of [[-2.53,1.75],[-1.12,1.62],[.19,1.57],[4.36,1.54],[6.48,1.88],[7.7,2.30]]){
      loop([0,y],r,.16,y>6?'edge':'trim','xz',16);
    }
    plate([-.38,-1.47,2.04,-2.01,3.4,-3.47,2.73,-5.18,1.37,-5.79,1.01,-3.98,-.22,-3.64],'dark',1.42);
    plate([1.26,-2.38,2.62,-3.53,2.37,-4.53,1.61,-4.72,1.14,-3.49],'trim',1.65);
    studs([[0,1.6],[0,2.46],[0,3.34]],.27,1.48,'core');
    gem([0,5.84,1.59],.45,'core',[1,1,.55]);
  }else{
    plate([.55,6.55,1.06,5.03,1.05,1.38,1.42,-.68,1.59,-2.19,1.38,-3.65,
      2.46,-6.86,1.83,-8.04,.32,-7.93,.64,-5.04,.21,-3.65,-.79,-3.15,-1.02,-2.08,-.76,.45,-.72,5.28,-.39,6.63],'dark',1.21);
    segment([0,-.41],[0,9.42],.53,'body',.40);
    for(const y of [1.02,4.78,6.38,9.14])loop([0,y],y>8?.43:.55,.12,y>8?'edge':'trim','xz',12);
    box([0,9.10,.47],[.17,.43,.31],'trim');
    segment([0,-1.25,1.21],[0,2.07,1.21],.32,'body');
    for(const y of [-.8,1.62])box([0,y,1.00],[.64,.26,.87],'trim');
    loop([.83,-2.58,.01],.90,.13,'trim').scale.y=1.15;
    box([1.45,-7.59,0],[1.81,.34,1.25],'trim').rotation.z=.20;
    studs([[.42,-1.45],[.37,-.92],[.64,-5.36],[.7,-6.21]],.15,.64,'edge');
  }
}
function beak(h){
  const {plate,gem,loop,line,handle}=h;
  handle(-6.52,-1.78,.71);
  plate([-2.13,-2.54,-2.35,-.61,-3.48,1.93,-2.93,4.97,-1.24,5.4,-.42,7.28,1.37,5.34,3.21,5.35,3.96,3.67,6.73,3.03,7.94,1.46,6.62,-1.20,5.93,.22,4.49,.76,3.3,-.19,2.12,-1.85,-.13,-1.61],'trim',1.58);
  plate([2.51,.38,3.67,3.13,5.89,3.04,7.62,1.38,6.64,-.67,5.95,.39,4.29,.97],'edge',1.09,[0,0,.39]);
  for(const side of [-1,1]){
    gem([2.4,3.25,side*.91],.61,'core',[1.24,.84,.63]);
    line([[-1.86,-.44,side*.77],[-.77,.47,side*.9],[.45,1.32,side*.91],[-.32,2.62,side*.82]],.25,'body');
  }
  loop([0,-2.19],.86,.21,'edge','xz',12);
}

function shell(h) {
  const {gem,handle,line,loop,segment}=h;
  handle(-6.4,.19,.67);
  const carapace=gem([0,.98,0],2.78,'body',[1.33,.76,1.16],1);
  carapace.rotation.y=PI/6;
  loop([0,.64,0],3.03,.26,'trim','xz',6);
  for(let i=0;i<6;i++){
    const a=i*TAU/6;
    const x=Math.cos(a),z=Math.sin(a);
    segment([x*1.63,1.12,z*1.66],[x*(i%2?4.74:5.45),3.12,z*4.75],.80,i%2?'edge':'core',.045);
    line([[0,2.52,0],[x*1.34,2.21,z*1.40],[x*3.1,1.42,z*3.1]],.19,'edge');
  }
  gem([0,2.72,0],1.05,'edge',[1,1.5,1]);
}

function tusk(h,style){
  const {plate,gem,loop,grip,handle,line}=h;
  const edge={
    qilin:[-1.36,-2.16,-2.82,.49,-3.13,3.61,-2.62,6.51,-1.01,9.81,-.99,7.38,-.24,5.61,1.24,4.2,2.3,2.51,1.83,.02,1.52,-2.22],
    elephant:[-.92,-3.05,-3.39,-2.46,-5.14,-.67,-6.33,2.32,-6.14,5.8,-4.77,7.67,-4.37,5.38,-3.53,3.45,-1.58,2.12,1.72,1.83,2.54,.37,2.4,-1.93,.87,-3.12],
    fang:[-1.48,-2.36,-2.21,1.09,-2.9,3.71,-2.46,6.6,-.94,10.18,-.42,7.17,.78,5.22,2.12,2.22,1.74,-.57,1.24,-2.47],
  };
  const y=style==='elephant'?-2.46:-2.01;
  handle(style==='elephant'?-6.31:-8.5,y,.77);
  grip(style==='qilin'?-2.7:-3.9,.78,7);
  plate(edge[style],style==='qilin'?'body':'edge',1.55,[0,0,0],.22);
  plate(edge[style].map((n,i)=>i%2?(n-y)*.48+y:n*.82),'trim',1.85,[0,0,0],.12);
  for(let i=0;i<4;i++){
    const offset=style==='elephant'?-i*.93:-i*.28;
    const ty=style==='elephant'?i*.57-2.17:i*1.11-2.05;
    const torus=loop([offset,ty,0],1.58-i*.19,.20,i%2?'edge':'trim','xz',12);
    torus.rotation.z=-i*.15;
  }
  if(style==='elephant'){
    for(let i=0;i<3;i++)gem([-.62-i*1.45,-.58+i*.44,1.09],.44,'core',[1,1,.53]);
  }else if(style==='fang'){
    gem([0,-2.16,.94],1.00,'core',[.85,1.15,.58],1);
  }else{
    line([[-.45,-1.06,.97],[-1.27,1.13,.99],[-1.60,3.18,.90],[-1.72,5.65,.57]],.19,'core');
  }
}

function claw(h,style) {
  const {plate,gem,loop,line}=h;
  const shuriken=style==='shuriken',chaos=style==='chaos';
  if(shuriken){
    plate([-1.09,-3.12,-1.48,-.91,-1.76,.63,-4.58,.45,-5.76,1.48,-3.89,2.96,-2.84,5.26,-1.74,3.42,.19,3.26,2.6,6.61,2.59,3.52,5.41,2.47,3.14,1.22,2.32,-.42,1.18,-1.51,.58,-3.45],'edge',.82);
    plate([-1.2,-1.77,-.82,2.65,2.15,3.12,2.7,1.52,1.09,-.41,.29,-2.09],'body',1.04);
    gem([.7,1.81,.8],.71,'core',[1,1,.54],1);
    loop([0,-1.72],1.15,.24,'trim','xz',12);
    return;
  }
  plate([-2.23,-4.56,-2.81,-2.41,-2.62,.66,-1.67,2.26,1.9,2.14,2.54,.56,2.63,-2.12,2.12,-4.43],'body',1.62);
  const count=chaos?5:4;
  for(let i=0;i<count;i++){
    const x=-2.09+i*(chaos?.97:1.37),height=(chaos?6.45:5.55)+Math.sin(i*1.1)*1.48;
    plate([-.47,-.85,-.66,1.3,-.94,height*.74,-1.9,height*.96,-1.20,height+.09,-.13,height*.87,.69,height*.63,.58,1.29,.39,-1.1],
      chaos?'edge':i%2?'trim':'edge',.63,[x,1.65,0],.09).rotation.z=chaos?-.18:.18;
    gem([x,.54,.9],.39,'core');
  }
  for(const y of [-3.71,-1.75])line([[-2.22,y,.89],[0,y,.97],[2.22,y,.86]],.19,'trim',false);
  loop([0,-2.8],1.34,.21,'trim','xz',12);
}

function feather(h){
  const {plate,line,grip,handle,gem}=h;
  handle(-6.52,-1.2,.54);
  grip(-4.2,.58);
  for(const [side,turn] of [[-1,-.28],[1,.36]]){
    const edge=[-.43,-1.55,-1.75,.36,-2.20,1.49,-1.53,1.44,-2.55,3.23,-1.75,2.94,-2.23,4.71,-1.73,4.27,-1.86,6.68,-.21,10.17,.46,7.1,.81,5.67,.53,5.69,1.33,4.33,.72,4.42,1.77,2.21,1.29,1.1,.54,-1.42];
    plate(edge,side===-1?'edge':'core',.49,[side*.75,0,side*.32],.08).rotation.z=turn;
    line([[0,-.52,side*.42],[side*.94,2.1,side*.60],[side*1.61,5.0,side*.67],[side*2.35,7.1,side*.70]],.19,'trim');
  }
  gem([0,-1.95,.58],.69,'core');
}

function seal(h) {
  const {lathe,loop,line,gem}=h;
  lathe([[0,-.49],[4.38,-.48],[4.95,-.26],[5.24,.12],[4.86,.48],[0,.48]],[0,0,0],'body',32).rotation.x=PI/2;
  for(const side of [-1,1]){
    for(const [r,w,finish] of [[4.69,.29,'edge'],[3.92,.14,'trim'],[3.15,.11,'edge'],[2.28,.10,'trim']]){
      loop([0,0,side*.53],r,w,finish,'xy',30);
    }
    for(let i=0;i<8;i++){
      const angle=i*TAU/8;
      const x=Math.cos(angle),y=Math.sin(angle);
      line([[x*3.08-y*.2,y*3.08+x*.2,side*.64],[x*2.67,y*2.67,side*.64],[x*3.08+y*.21,y*3.08-x*.21,side*.64]],.125,'edge',false);
      gem([x*4.21,y*4.21,side*.55],.20,'trim',[1,1,.48]);
    }
    gem([0,0,side*.56],1.26,'core',[1,1,.34],1);
  }
}

function snake(h) {
  const {gem,lathe,loop,line}=h;
  lathe([[0,-4.75],[2.86,-4.73],[3.65,-4.15],[4.29,-3.12],[4.27,-1.76],[3.85,-1.38],[3.66,-1.61],[3.81,-2.16],[3.2,-4.08],[0,-4.15]],[0,0,0],'body',20);
  for(let i=0;i<6;i++)loop([0,-4.28+i*.51],3.24+Math.sin((i+.2)*.37)*.96,.13,i%2?'edge':'trim','xz',20);
  line([[2.17,-2.61,-.59],[-.49,-2.65,-1.08],[-2.21,-1.46,0],[-1.69,-.44,1.37],[.10,.26,.87],[.61,2.24,.19],[.39,4.67,.19],[-.07,6.19,.19],[-1.36,6.64,.18]],.49,'body');
  const head=gem([-1.72,6.61,.18],1.09,'edge',[1.31,.54,.60],1);
  head.rotation.z=.18;
  gem([-1.89,6.72,.78],.20,'core');
  gem([-1.89,6.72,-.42],.20,'core');
  line([[-2.37,6.31,.18],[-2.86,6.11,.18],[-3.08,5.87,.31]],.10,'core');
}

function box(h) {
  const {plate,loop,gem,box,line}=h;
  plate([-2.88,-3.99,-4.14,-1.8,-4.13,2.75,-3.34,4.96,0,5.83,3.28,4.90,4.12,2.67,4.13,-1.86,2.82,-3.94,0,-4.36],'trim',2.42);
  plate([-2.72,-3.14,-3.37,-1.58,-3.34,2.71,-2.56,4.3,0,5.2,2.52,4.33,3.37,2.66,3.37,-1.51,2.63,-3.16,0,-3.5],'body',2.58);
  for(const side of [-1,1]){
    const eye=loop([0,1.22,side*1.43],2.0,.27,'edge','xy',20);
    eye.scale.y=1.40;
    gem([0,1.25,side*1.51],1.35,'core',[.87,1.30,.47],1);
    for(const x of [-3.17,3.17]){
      box([x,.69,side*1.43],[.42,3.13,.36],'trim');
      line([[x*.82,-2.44,side*1.43],[x*.56,-3.7,side*1.35],[x*.52,-5.12,side*.63]],.18,'trim');
    }
  }
  loop([0,-4.44],.94,.19,'trim','xz',12);
}

function lute(h) {
  const {plate,gem,loop,segment,box,line}=h;
  const outline=[0,-8.15,-2.82,-7.52,-4.01,-5.38,-3.57,-3.1,-2.11,-1.63,-.98,.52,-.68,5.44,-1.04,7.29,-.40,9.83,.97,9.65,1.39,8.6,.65,6.91,.82,4.66,1.22,-.01,2.22,-1.62,3.62,-3.21,4.09,-5.42,2.94,-7.36];
  plate(outline,'dark',2.08,[0,0,0],.23);
  plate(outline.map((n,i)=>i%2?n*.95:n*.9),'trim',.87,[0,0,.89],.11);
  const inlay=loop([0,-4.92,1.42],2.35,.16,'edge');
  inlay.scale.y=1.15;
  for(const x of [-.58,-.18,.18,.59]){
    segment([x,-6.39,1.61],[x*.51,8.14,.79],.049,'edge');
  }
  for(let i=0;i<6;i++){
    box([0,-2.2+i*1.26,1.17-i*.073],[1.28-i*.081,.105,.23],'body');
  }
  for(const x of [-1.05,1.05])for(const y of [6.31,7.3]){
    segment([0,y,.3],[x*1.65,y,.3],.18,'trim');
    gem([x*1.57,y,.3],.39,'core');
  }
  box([0,-6.12,1.29],[2.69,.40,.72],'body');
  for(const side of [-1,1])line([[side*1.46,-7.05,1.35],[side*2.41,-5.81,1.4],[side*2.10,-4.55,1.41]],.14,'core');
}

function bell(h) {
  const {lathe,handle,grip,loop,gem,segment}=h;
  handle(-10.9,5.1,.62);
  grip(-3.2,.68);
  lathe([[.12,-2.51],[3.60,-2.53],[3.78,-2.13],[3.12,-1.96],[2.52,-1.12],[2.33,.39],[1.93,1.68],[.9,2.45],[.11,2.69]],[0,6.8,0],'trim',19).material.side=T.DoubleSide;
  for(const [y,r] of [[4.31,3.55],[5.5,2.58],[6.5,2.35],[7.63,2.14]])loop([0,y],r,.18,y===4.31?'edge':'body','xz',18);
  segment([0,4.48],[0,3.24],.22,'dark');
  gem([0,3.17],.92,'core',[1,1.21,1]);
  for(let i=0;i<6;i++){
    const a=i*TAU/6;
    gem([Math.sin(a)*2.18,7.48,Math.cos(a)*2.18],.48,'edge',[.62,1.43,.64]);
  }
  loop([0,9.55],1.13,.22,'edge','xy',12);
}

function twins(h) {
  const {root}=h;
  for(const side of [-1,1]){
    const group=new T.Group();
    group.position.x=side*.24;
    group.rotation.z=side*.31;
    root.add(group);
    const bladeKit=workshop(group,root.userData.finishes);
    const {plate,handle,grip,gem,loop}=bladeKit;
    handle(-6.25,-2.03,.62);grip(-3.7,.66);
    const contour=side<0?[-1.3,-2.25,-2.12,.68,-1.61,3.13,-.16,5.86,1.82,7.37,1.56,5.61,.61,4.0,.83,2.8,1.73,.89,1.31,-2.32]:
      [-1.16,-2.21,-1.98,-.24,-1.45,2.31,-.63,4.41,2.0,6.27,1.32,4.77,.73,3.18,2.02,2.36,1.42,.35,1.20,-2.08];
    plate(contour,'edge',.93);
    plate(contour.map((v,i)=>i%2?(v+2.3)*.80-2.3:v*.68),'body',1.06);
    loop([0,-1.78],1.59,.20,'trim','xz',12);
    gem([0,-1.46,.69],.56,'core');
  }
}
const makers={blade,branch,pole,axe,wheel,staff,orb,beads,doll:animalDoll,fish,bow,crossbow,
  rifle:h=>gun(h,false),cannon:h=>gun(h,true),
  beak,shell,tusk,claw,feather,seal,snake,box,lute,bell,twins};

function combineParts(group,animated){
  const byMaterial=new Map();
  for(const mesh of group.children){
    if(animated.has(mesh))continue;
    if(mesh.isGroup){combineParts(mesh,animated);continue;}
    if(!byMaterial.has(mesh.material))byMaterial.set(mesh.material,[]);
    byMaterial.get(mesh.material).push(mesh);
  }
  for(const [material,parts] of byMaterial){
    if(parts.length<2)continue;
    const sources=parts.map(mesh=>{
      mesh.updateMatrix();
      const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry;
      geometry.applyMatrix4(mesh.matrix);
      return geometry;
    });
    const geometry=new T.BufferGeometry();
    for(const [name,size] of [['position',3],['normal',3],['uv',2]]){
      const values=new Float32Array(sources.reduce((sum,source)=>sum+source.getAttribute(name).array.length,0));
      let offset=0;
      for(const source of sources){
        const array=source.getAttribute(name).array;
        values.set(array,offset);
        offset+=array.length;
      }
      geometry.setAttribute(name,new T.BufferAttribute(values,size));
    }
    for(const [index,mesh] of parts.entries()){
      const source=sources[index];
      if(source!==mesh.geometry)source.dispose();
      mesh.geometry.dispose();
      group.remove(mesh);
    }
    group.add(new T.Mesh(geometry,material));
  }
}

export function buildWeapon(weapon,finishes){
  const root=new T.Group();
  const [kind,...recipe]=designs[weapon.id];
  root.userData.finishes=finishes;
  makers[kind](workshop(root,finishes),...recipe);
  const animated=new Set();
  const bow=root.userData.bow;
  if(bow){
    animated.add(bow.arrow);
    for(const mesh of root.children)if(mesh.geometry?.getAttribute('position')===bow.position)animated.add(mesh);
    for(const {mesh} of bow.attachments)animated.add(mesh);
    for(const string of bow.string)animated.add(string);
  }
  combineParts(root,animated);
  return root;
}

export function disposeWeapon(root){
  root.traverse(part=>{if(part.isMesh)part.geometry.dispose();});
  for(const material of Object.values(root.userData.finishes))material.dispose();
}
