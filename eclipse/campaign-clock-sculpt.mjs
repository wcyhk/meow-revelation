import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const mirror=(side,pts)=>pts.map(([x,...rest])=>[side*x,...rest]);
const line=(k,part,finish,path,steps=11)=>k.sculpt.sweep(part,finish,path,{sides:7,steps,ridge:.18});
const plate=(k,part,finish,path,depth)=>k.sculpt.plate(part,finish,path,depth,.014);

function material(k,name,color,metalness,roughness,kind){
  if(k.materials[name])return;
  k.materials[name]=paintedFinish(new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
    envMap:forgeEnvironment(),envMapIntensity:.78}),kind,true,true);
}

function finishes(k){
  material(k,'clockBlue',0x37454d,.76,.46,'iron');
  material(k,'clockSteel',0x657377,.83,.39,'iron');
  material(k,'clockCopper',0xae684d,.74,.48,'bronze');
  material(k,'clockVial',0x6c3539,.28,.42,'gem');
}

function linkage(k,part,side,from,to,width,mobile){
  const a=new T.Vector3(...from),b=new T.Vector3(...to);
  const middle=a.clone().lerp(b,.54);
  k.rod(part,'clockBlue',a.toArray(),middle.toArray(),width);
  k.rod(part,'clockCopper',middle.toArray(),b.toArray(),width*.54);
  const pivot=k.bone(part,...middle.toArray());
  pivot.rotation.y=side*Math.PI*.5;
  k.mesh(pivot,'ring','clockSteel',0,0,0,width*1.45,width*1.45,.54);
  k.mesh(pivot,'gem','clockVial',0,0,.019,width*.54,width*.54,.016);
  if(!mobile)k.mesh(pivot,'gem','glow',0,0,.037,width*.18,width*.18,.008);
}

export function clockArm(k,{arm,elbow,grip,side,length},mobile){
  finishes(k);
  const fan=pts=>mirror(side,pts);
  const bulk=(joint,finish,path)=>k.geometry(joint,finish,sculptVolume(fan(path),
    {sides:mobile?11:16,rings:mobile?13:18,section:2.34,ridge:.14}));
  bulk(arm,'clockBlue',[[0,.125,-.02,.103,.106],[.046,.014,-.013,.155,.144],
    [.054,-length*.33,.018,.132,.114],[.042,-length*.55,.044,.093,.102]]);
  bulk(elbow,'clockBlue',[[.007,.051,.056,.111,.111],[.035,-.115,.072,.113,.115],
    [.081,-length*.36,.138,.104,.085],[.062,-length*.46,.149,.059,.075]]);
  for(let i=0;i<3;i++){
    const y=.119-i*.082,reach=side===1?.321-i*.039:.216+i*.025;
    const sweep=fan([[-.045,y+.087,-.119],[.16,y+.144,-.164],[reach,y+.018,-.089],
      [reach-.042,y-.076,.043],[.14,y-.129,.155],[.017,y-.067,.158]]);
    plate(k,arm,i===1?'clockCopper':'clockSteel',sweep,.048);
    line(k,arm,'clockCopper',sweep.slice(1,6).map(([x,h,z])=>[x,h+.023,z+.012,.012]));
  }
  const guard=fan([[.008,.038,.108],[.165,.104,.09],[.221,-.096,.136],[.177,-.273,.176],
    [.068,-.364,.205],[-.051,-.207,.166],[-.068,-.051,.123]]);
  plate(k,elbow,'clockSteel',guard,.043);
  line(k,elbow,'clockVial',fan([[.042,-.048,.168,.018],[.121,-.096,.195,.037],[.141,-.179,.213,.032],
    [.102,-.249,.244,.026],[.052,-.297,.232,.006]]),14);
  for(const d of [-.077,.061]){
    const [a,b]=fan([[.121,.037,d],[.13,-.295,d+.103]]);
    linkage(k,elbow,side,a,b,.032,mobile);
  }
  bulk(grip,'clockBlue',[[.004,.064,.028,.078,.076],[.016,-.02,.073,.101,.094],[.033,-.11,.148,.086,.081],
    [.021,-.158,.17,.054,.059]]);
  for(let i=0;i<3;i++){
    const x=.069-i*.065;
    line(k,grip,'clockCopper',fan([[x,.011,.123,.024],[x+.011,-.035,.183,.032],[x+.018,-.094,.195,.028],
      [x+.022,-.144,.19,.015],[x+.029,-.174,.205,.004]]),12);
  }
}

export function clockLeg(k,{hip,knee,side,ground},mobile){
  finishes(k);
  const fan=pts=>mirror(side,pts);
  k.geometry(hip,'clockBlue',sculptVolume(fan([[.006,.093,-.063,.119,.134],[.056,-.080,-.066,.132,.152],
    [.075,-ground*.23,.024,.121,.123],[.052,-ground*.409,.064,.092,.091]]),{sides:13,rings:17,section:2.23,ridge:.17}));
  k.geometry(knee,'clockBlue',sculptVolume(fan([[.016,.077,.008,.099,.115],[.035,-.103,.061,.098,.132],
    [.021,-ground*.30,.132,.081,.101],[.015,-ground*.465,.144,.08,.091]]),{sides:12,rings:16,section:2.30,ridge:.17}));
  const tube=fan([[.072,.04,-.094],[.163,-.292,-.066]]);
  linkage(k,hip,side,...tube,.041,mobile);
  const shield=fan([[-.081,.098,.085],[.051,.134,.147],[.141,.042,.143],[.176,-.166,.14],
    [.117,-.351,.194],[.051,-.393,.257],[-.074,-.235,.213],[-.092,-.062,.113]]);
  plate(k,knee,'clockSteel',shield,.046);
  line(k,knee,'clockCopper',shield.slice(1,7).map(([x,y,z])=>[x,y+.018,z+.034,.014]));
  line(k,knee,'glow',fan([[.019,-.064,.191,.013],[.080,-.146,.201,.019],
    [.078,-.278,.230,.010],[.072,-.329,.276,.003]]),12);
  for(let i=0;i<2;i++){
    const y=-.139-i*.130,z=-.084+i*.057;
    linkage(k,knee,side,...fan([[.078,y+.078,z],[.115,y-.097,z+.048]]),.029,mobile);
  }
  const foot=-ground*.49;
  k.geometry(knee,'clockBlue',sculptVolume(fan([[.012,foot+.038,.053,.102,.058],[.027,foot+.038,.143,.132,.089],
    [.041,foot+.026,.254,.144,.058],[.043,foot+.008,.338,.113,.031]]),{sides:13,rings:14,section:2.7,ridge:.16}));
  for(const x of [-.038,.071])line(k,knee,'clockSteel',fan([[x,foot+.059,.161,.035],
    [x+.006,foot+.051,.249,.042],[x+.011,foot+.02,.354,.032],[x+.019,foot-.006,.383,.006]]),12);
}

export function clockBlade(k,hand,mobile){
  finishes(k);
  markEnemyWeapon(hand,[.286,1.46,.238],{from:[0,-.32,.08],width:.19});
  const spine=[[0,-.36,.043,.035],[-.014,-.13,.077,.046],[0,.084,.102,.057],[.019,.31,.127,.052]];
  line(k,hand,'clockBlue',spine,13);
  const knife=[[-.020,.293,.151],[.201,.426,.202],[.346,.758,.229],[.382,1.128,.245],[.284,1.461,.232],
    [.237,1.214,.218],[.081,.934,.169],[-.019,.695,.143],[-.080,.459,.161]];
  plate(k,hand,'clockBlue',knife,.079);
  plate(k,hand,'clockSteel',knife.slice(1,7).concat([[.155,.913,.225],[.064,.594,.204]]),.035);
  for(const side of [-1,1]){
    const z=side*.061;
    line(k,hand,'clockCopper',[[0,.374,.148+z,.017],[.115,.526,.194+z,.025],
      [.209,.799,.241+z,.022],[.257,1.076,.239+z,.020],[.276,1.326,.246+z,.004]],15);
    line(k,hand,'glow',[[.055,.542,.166+z,.008],[.105,.661,.199+z,.017],[.167,.846,.222+z,.016],
      [.216,.937,.236+z,.010],[.236,1.138,.25+z,.003]],14);
    for(let i=0;i<(mobile?4:7);i++){
      const y=.573+i*.087,x=.107+i*.023;
      line(k,hand,i%3?'clockSteel':'clockCopper',[[x-.048,y,.179+z,.005],
        [x-.017,y+.024,.206+z,.011],[x+.011,y+.017,.207+z,.003]],5);
    }
  }
  const guard=k.bone(hand,0,.259,.148);
  k.mesh(guard,'ring','clockCopper',0,0,0,.156,.137,.82,0,.13,-.14);
  k.mesh(guard,'gem','clockVial',0,0,.069,.077,.09,.049);
  for(const side of [-1,1])line(k,guard,'clockBlue',mirror(side,[[.034,-.046,.008,.062],[.117,.033,.115,.056],
    [.184,.106,.166,.038],[.241,.08,.131,.004]]),14);
}
