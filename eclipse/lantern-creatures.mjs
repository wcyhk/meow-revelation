import * as T from '../three.min.mjs';
import {designHash,lanternThemes,originalRelics} from './lantern-designs.mjs';
import {buildWeapon,disposeWeapon} from './lantern-weapons.mjs';
import {forgedMaterials} from './lantern-materials.mjs';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';
import {enemyCurrent} from './enemy-current.mjs?v=boss-foundry-1';
import {armWeaponEmission} from './enemy-weapon-energy.mjs?v=boss-foundry-1';
import {enemyWeapons,markEnemyWeapon} from './enemy-weapon-pose.mjs?v=boss-foundry-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {etchedMetal,roundedBlock} from './lantern-geometry.mjs';

// Independent designs: living correspondence, lamp cages, ceramic masks,
// calibration machinery and folded paper. No imported character outlines,
// decoded sprite measurements or third-party game palettes are used.
const PI=Math.PI,TAU=2*PI,up=new T.Vector3(0,1,0);
const themeForTone={amber:'earth',gold:'light',ember:'fire',blood:'blood',jade:'wind',moss:'poison',teal:'water',frost:'ice',bone:'light',violet:'void',void:'void',venom:'poison'};
const tide=['潮痕',0x7bdfdb,0x21313b,0x587b80,0xc2c8b9];
const paletteFor=entry=>lanternThemes[themeForTone[entry.tone]]??tide;
export function bestiaryTint(entry){return paletteFor(entry)[1];}

export function mountBestiary(scene,entry,height,mobile=false,spec={}){
  const seed=designHash(entry.id+':'+(spec.relicWeapon?.id??'')),v=seed%7;
  const [,glow,dark,bodyColor,trimColor]=paletteFor(entry),clothTime={value:0};
  const root=new T.Group();root.name=entry.name;
  root.userData.originalBlueprint='lantern-v1:'+entry.family+':'+seed;
  const material=(color,metalness,roughness,emission=0)=>new T.MeshStandardMaterial({color,metalness,roughness,
    envMap:forgeEnvironment(),envMapIntensity:.74,...scannedSurface(metalness>.4?'hammered':'leather',.22),
    emissive:glow,emissiveIntensity:emission});
  const materials={body:material(bodyColor,.63,.40),dark:material(dark,.18,.79),trim:material(trimColor,.79,.30),
    edge:material(0xdfd5bc,.42,.43),core:material(glow,.29,.22,1.12),glass:material(dark,.56,.23,.13),
    cloth:material(new T.Color(dark).offsetHSL(.025,.02,.045),.08,.85)};
  for(const kind of ['body','trim','edge','glass'])etchedMetal(materials[kind]);
  materials.cloth.side=T.DoubleSide;
  materials.cloth.customProgramCacheKey=()=> 'lantern-paper-cloth-v1';
  materials.cloth.onBeforeCompile=shader=>{
    shader.uniforms.lanternClothTime=clothTime;
    shader.vertexShader='uniform float lanternClothTime;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float hem=pow(1.0-uv.y,2.0);
      transformed.z+=hem*(sin(lanternClothTime*2.1+position.x*4.3)*.075+sin(lanternClothTime*3.7+position.x*7.0)*.022);
      transformed.x+=hem*sin(lanternClothTime*1.6+position.y*3.0)*.024;`);
  };
  const cube=roundedBlock(.13,mobile?3:5),sphere=new T.SphereGeometry(1,mobile?16:22,mobile?10:14),
    cylinder=new T.CylinderGeometry(1,1,1,mobile?10:14),gem=new T.OctahedronGeometry(1),
    ring=new T.TorusGeometry(1,.055,5,mobile?24:36),cone=new T.ConeGeometry(1,1,8);
  const geometries=new Set([cube,sphere,cylinder,gem,ring,cone]),silks=[],limbs=[],wings=[],coils=[],weaponRoots=[];
  const group=(parent,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const put=(parent,geo,finish,x,y,z,sx=1,sy=sx,sz=sx)=>{
    const m=new T.Mesh(geo,materials[finish]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;parent.add(m);return m;
  };
  const box=(p,f,x,y,z,sx,sy,sz)=>put(p,cube,f,x,y,z,sx,sy,sz);
  const volume=(parent,finish,sections,ridge=.045)=>{
    const geometry=sculptVolume(sections,{sides:mobile?12:18,rings:mobile?16:24,ridge,seed:seed%31});geometries.add(geometry);
    return put(parent,geometry,finish,0,0,0);
  };
  const ball=(p,f,x,y,z,sx,sy=sx,sz=sx)=>put(p,sphere,f,x,y,z,sx,sy,sz);
  const rod=(p,f,a,b,r=.025)=>{
    const first=new T.Vector3(...a),last=new T.Vector3(...b),delta=last.clone().sub(first);
    const mesh=put(p,cylinder,f,...first.clone().lerp(last,.5),r,delta.length(),r);
    mesh.quaternion.setFromUnitVectors(up,delta.normalize());return mesh;
  };
  const halo=(p,x,y,z,r,finish='trim',turn=0)=>{const m=put(p,ring,finish,x,y,z,r,r,r);m.rotation.x=turn;return m;};
  const plate=(p,points,finish='body',depth=.07,z=0)=>{
    const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.018,bevelSize:.019,bevelSegments:2,curveSegments:4});
    geo.translate(0,0,-depth/2);geometries.add(geo);return put(p,geo,finish,0,0,z);
  };
  const cloth=(p,x,y,z,width,length,turn=0)=>{
    const geo=new T.PlaneGeometry(width,length,3,mobile?5:8);geo.translate(0,-length/2,0);
    const positions=geo.attributes.position;
    for(let i=0;i<positions.count;i++){
      const weight=1-geo.attributes.uv.getY(i);
      positions.setZ(i,Math.sin(positions.getX(i)*13)*.035*weight);
      if(weight>.99)positions.setY(i,positions.getY(i)+.10*(i%3));
    }
    geo.computeVertexNormals();geometries.add(geo);
    const mesh=put(p,geo,'cloth',x,y,z);mesh.rotation.z=turn;silks.push(mesh);return mesh;
  };
  const cage=(p,x,y,z,r=.19,h=.5)=>{
    for(const sy of [-1,1]){const cap=put(p,cylinder,'trim',x,y+sy*h*.5,z,r,.045,r);cap.rotation.y=PI/10;}
    for(let i=0;i<6;i++){
      const a=i*TAU/6;rod(p,i%2?'body':'trim',[x+Math.cos(a)*r*.87,y-h/2,z+Math.sin(a)*r*.87],[x+Math.cos(a)*r*.87,y+h/2,z+Math.sin(a)*r*.87],.018);
    }
    put(p,gem,'core',x,y,z,r*.56,h*.36,r*.56);
  };
  const rivets=(p,y,z,width,count=5)=>{for(let i=0;i<count;i++)put(p,gem,'trim',(i/(count-1)-.5)*width,y+(i%2)*.016,z,.025,.022,.019);};
  const face=(p,x,y,z,size=.32)=>{
    const head=group(p,x,y,z);
    const broad=1+(v-3)*.065;
    ball(head,'edge',0,0,0,size*broad,size*1.22,size*.72);
    plate(head,[[-size*.87,size*.55],[0,size*1.18],[size*.83,size*.42],[size*.57,-size*.93],[0,-size*1.22],[-size*.57,-size*.84]],'dark',.036,size*.53);
    for(const side of [-1,1]){
      const brow=box(head,'trim',side*size*.42,size*.15,size*.72,size*.67,size*.115,.046);brow.rotation.z=side*.14;
      box(head,'core',side*size*.39,size*.04,size*.74,size*.45,size*.059,.036);
      rod(head,'trim',[side*size*.74,-size*.12,size*.57],[side*size*.39,-size*.72,size*.61],.019);
      cage(head,side*size*.97,-size*.22,0,size*.12,size*.63);
    }
    const seam=box(head,'trim',0,-size*.28,size*.77,.023,size*.44,.028);seam.rotation.z=(v-3)*.12;
    for(let i=0;i<3+v%3;i++)box(head,'trim',(i-(2+v%3)/2)*.064,size*.87,.04,.027,.14+i%2*.10,.13);
    for(const side of [-1,1]){
      const shell=ball(head,'body',side*size*.79,-size*.03,-size*.14,size*.28,size*.86,size*.69);shell.rotation.z=side*-.12;
      halo(head,side*size*.87,size*.03,-size*.18,size*.30,'trim');
      rod(head,'trim',[side*size*.49,size*.82,-size*.15],[side*size*.70,-size*.55,-size*.52],.017);
      for(let j=0;j<4;j++)box(head,'trim',side*size*.53,size*(.56-j*.34),-size*.64,.027,.043,.021);
    }
    for(let row=0;row<4;row++){
      const back=ball(head,row%2?'body':'dark',0,size*(.64-row*.34),-size*.58,size*.67,size*.16,size*.15);
      for(const side of [-1,1])put(head,gem,'trim',side*size*.43,size*(.68-row*.34),-size*.71,.015,.014,.012);
    }
    cloth(head,0,-size*.78,-size*.47,size*.85,size*.95);
    return head;
  };
  const body=group(root,0,0,0),arms=[],legs=[];
  let head,pattern='duel',footed=true;
  const family=entry.family;

  if(['beast','turtle','spider'].includes(family)){
    const spider=family==='spider',shell=family==='turtle';pattern=spider?'crawl':'gallop';
    const width=(shell?.87:.55)+(v-3)*.025;
    ball(body,'dark',0,.91,0,width,.46,shell?.78:.97);
    for(let i=0;i<(shell?7:5);i++){
      const z=(i-2)*.25,armor=ball(body,i%2?'body':'trim',0,1.10,z,width*(1-i%2*.08),.20,.24);
      armor.rotation.x=(i-2)*.08;
      for(const side of [-1,1])box(body,'trim',side*width*.65,1.17,z,.058,.045,.17);
    }
    cage(body,0,1.27,.04,width*.43,.59);
    head=face(body,0,.93,.87,shell?.27:.31);
    const count=spider?8:shell?6:4;
    for(let i=0;i<count;i++){
      const side=i%2?1:-1,row=Math.floor(i/2),z=(row-(count/2-1)/2)*.53;
      const hip=group(body,side*width*.69,.85,z),knee=group(hip,side*.36,-.29,.06);
      rod(hip,'body',[0,0,0],[side*.36,-.29,.06],.085);ball(hip,'trim',0,0,0,.13);
      rod(knee,'edge',[0,0,0],[side*.12,-.47,.16],.047);
      const foot=box(knee,'dark',side*.12,-.46,.24,.20,.10,.33);foot.rotation.y=side*.16;
      legs.push(hip);limbs.push({joint:hip,knee,phase:i*PI*.73});
    }
    for(let i=0;i<4;i++){const tail=group(body,0,.72,-.80-i*.18);box(tail,'body',0,0,0,.16-i*.02,.14,.26);coils.push(tail);}
    if(spider)for(const side of [-1,1]){
      const spindle=group(body,side*.26,1.30,-.23);rod(spindle,'trim',[0,0,0],[side*.19,.53,-.19],.025);cage(spindle,side*.19,.56,-.19,.09,.25);
    }
  }else if(['bird','dragon','wasp'].includes(family)){
    pattern='wing';footed=false;
    body.position.y=.36;ball(body,'dark',0,.83,0,.28,.52,.37);cage(body,0,.98,.12,.25,.73);
    head=face(body,0,1.48,.17,.26);
    for(const side of [-1,1]){
      const wing=group(body,side*.23,1.23,-.12);wings.push(wing);
      const span=1.17+v*.075;
      for(let j=0;j<4;j++){
        const panel=plate(wing,[[0,0],[side*(span-.16*j),.52-j*.19],[side*(span*.83-.10*j),-.18-j*.15],[side*.17,-.43-j*.09]],j%2?'edge':'body',.025,-j*.034);
        panel.rotation.y=side*(.08+j*.065);
        rod(wing,'trim',[0,0,0],[side*(span-.16*j),.52-j*.19,0],.022);
        cage(wing,side*(span*.57-j*.06),.15-j*.14,.01,.055,.21);
      }
      cloth(wing,side*.48,-.14,-.07,.24,.85,side*.20);
      rod(body,'trim',[side*.16,.55,.13],[side*.35,.13,.26],.041);
      put(body,cone,'edge',side*.35,.12,.32,.065,.23,.065).rotation.x=PI/2;
    }
    for(let i=0;i<3;i++)cloth(body,(i-1)*.15,.55,-.20,.17,1.07+i%2*.20,(i-1)*.13);
  }else if(['serpent','hydra'].includes(family)){
    pattern='coil';footed=false;
    for(let i=0;i<13+v;i++){
      const a=i*.40,r=.53+i*.018,y=.27+i*.049;
      const link=group(body,Math.sin(a)*r,y,Math.cos(a)*r);link.rotation.y=a;
      box(link,i%3?'body':'trim',0,0,0,.30,.20,.28);rivets(link,.10,.13,.20,3);coils.push(link);
      if(i%3===0)cage(link,0,.16,0,.09,.28);
    }
    head=face(body,0,1.58,.26,.33);
    for(const side of [-1,1])cloth(body,side*.21,1.29,-.12,.25,1.0,side*.25);
    if(family==='hydra')for(const side of [-1,1])face(body,side*.57,1.12,-.18,.22);
  }else{
    const broad=family==='ogre'?1.28:family==='emperor'?1.10:.92;
    const tall=family==='shade'||family==='priest';pattern=tall?'hover':'duel';footed=!tall;
    const torso=group(body,0,1.34,0);body.userData.torso=torso;
    volume(torso,'dark',[[0,-.51,0,.26*broad,.20],[0,-.21,0,.32*broad,.25],[0,.09,-.015,.43*broad,.28],[0,.43,-.03,.47*broad,.27],[0,.66,-.04,.26,.19]],.035);
    for(const side of [-1,1]){
      const plateMesh=plate(torso,[[side*.03,.65],[side*.49*broad,.48],[side*.45*broad,.06],[side*.15,-.23],[side*.04,.01]],'body',.085,.18);
      plateMesh.rotation.y=side*-.10;
      for(let row=0;row<4;row++){
        const rib=box(torso,'trim',side*(.16+row*.035),.35-row*.12,.29,.20+row*.013,.035,.04);rib.rotation.z=side*.24;
      }
      for(let row=0;row<3;row++){
        const pauldron=ball(torso,row%2?'trim':'body',side*(.47*broad+.025*row),.41-row*.087,-.01,.24-row*.014,.135,.29-row*.012);
        pauldron.rotation.z=side*-.20;
        for(const z of [-.20,.20])put(torso,gem,'trim',side*(.47*broad+.025*row),.45-row*.087,z,.022,.022,.023);
      }
      for(let row=0;row<3;row++){
        const backPlate=ball(torso,'body',side*.23,.43-row*.23,-.23,.24,.175,.13);backPlate.rotation.y=side*.17;
        rivets(torso,.49-row*.23,-.33,.65,5);
      }
    }
    cage(torso,0,.10,.30,.145,.49);
    halo(torso,0,.15,-.315,.39,'trim');
    for(let i=0;i<5;i++)box(torso,'trim',0,.58-i*.20,-.34,.10,.13,.12);
    head=face(body,0,2.27,0,family==='ogre'?.38:.31);
    if(family==='captain'||family==='emperor'){
      const dial=halo(head,0,.23,-.11,.50,'body');dial.rotation.y=.13;
      for(let i=0;i<8;i++){const a=i*TAU/8;const tick=box(head,i%2?'trim':'core',Math.cos(a)*.49,.23+Math.sin(a)*.49,-.12,.035,.10,.04);tick.rotation.z=a;}
    }
    for(const side of [-1,1]){
      const shoulder=group(body,side*.54*broad,1.89,.015),elbow=group(shoulder,0,-.44,.04),hand=group(elbow,0,-.34,.10);
      volume(shoulder,'dark',[[0,.04,0,.12,.13],[.015,-.13,.025,.15,.14],[0,-.35,.035,.11,.11],[0,-.45,.04,.085,.09]]);
      ball(shoulder,'body',0,-.16,.10,.13,.21,.092);
      ball(elbow,'trim',0,0,0,.12);volume(elbow,'body',[[0,-.02,.045,.14,.15],[0,-.13,.07,.145,.14],[0,-.31,.10,.10,.10]]);
      for(let j=0;j<3;j++)box(elbow,j%2?'trim':'body',0,-.08-j*.07,.20,.22,.035,.045);
      ball(hand,'dark',0,-.025,.02,.11,.12,.09);arms.push(shoulder);limbs.push({joint:shoulder,knee:elbow,hand,phase:side===1?0:PI,arm:true});
      cloth(torso,side*.32,.43,-.33,.37,1.24+v*.032,side*.14);
      if(footed){
        const hip=group(body,side*.25,1.03,.01),knee=group(hip,0,-.43,.04);
        volume(hip,'dark',[[0,.02,0,.14,.13],[0,-.16,.01,.17,.15],[0,-.39,.035,.11,.11]]);
        ball(hip,'body',0,-.21,.13,.14,.20,.11);
        ball(knee,'trim',0,0,0,.13);volume(knee,'body',[[0,-.035,.035,.13,.14],[0,-.18,.04,.15,.15],[0,-.36,.07,.11,.12]]);
        ball(knee,'dark',0,-.40,.18,.16,.10,.25);box(knee,'trim',0,-.35,.36,.25,.065,.10);
        legs.push(hip);limbs.push({joint:hip,knee,phase:side===1?0:PI});
      }else cloth(body,side*.17,1.15,.03,.34,.99,side*.09);
    }
    const hand=limbs.find(l=>l.arm&&l.phase===0)?.hand;
    if(hand){
      const ids=Array.from(originalRelics.keys());
      const wid=spec.relicWeapon?.id??(tall?'bell':family==='captain'?'cannon':family==='ogre'?'qilin':ids[seed%ids.length]);
      const weapon=spec.relicWeapon??{id:wid},finishes=forgedMaterials(weapon),carried=buildWeapon(weapon,finishes);
      carried.position.set(0,.02,.19);carried.scale.setScalar(.62);
      if(carried.userData.launch?.bow)carried.rotation.y=PI/2;else carried.rotation.x=PI/2;
      hand.add(carried);weaponRoots.push(carried);
      const bow=!!carried.userData.launch?.bow;
      markEnemyWeapon(carried,bow?carried.userData.launch.tip:[0,.85,0],{from:bow?[.13,0,.035]:[0,-.30,0],width:.16,aim:false,kind:bow?'bow':'edge'});
      Object.entries(finishes).forEach(([name,mat])=>{materials['carried-'+name]=mat;});
    }
    if(family==='eggs'||family==='star'){
      pattern='hover';footed=false;
      for(let i=0;i<5;i++){const a=i*TAU/5;cage(body,Math.cos(a)*.67,1.54+Math.sin(a)*.65,-.10,.14,.39);}
    }
  }
  // Distinct suspended seals on the side and rear, visible in turnarounds.
  for(let i=0;i<3+v%3;i++){
    const a=i*TAU/(3+v%3),seal=group(body,Math.cos(a)*.36,.62+Math.sin(a)*.13,-.40);
    cloth(seal,0,0,0,.115,.36+(i%3)*.09,(i-1)*.14);put(seal,gem,'core',0,-.045,.012,.034,.052,.025);
  }
  root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root),scale=height*.87/Math.max(1.5,bounds.max.y),parts={body,head,arms,legs};
  const weapons=enemyWeapons(root,parts),weaponEmission=armWeaponEmission(weapons,materials,glow);
  const aura=enemyCurrent(root,bounds,{tint:glow,body,effect:spec.effect??themeForTone[entry.tone],field:!!entry.field,mobile,weapons});
  scene.add(root);
  return {root,entry,materials,body,head,arms,legs,limbs,wings,coils,silks,clothTime,weapons,weaponEmission,aura,
    crest:head??body,dimensions:[1,1,1],palette:[dark,bodyColor,trimColor,glow],scale,pattern,footed,floor:0,
    geometry:geometries,weaponRoots,heading:undefined,original:true};
}

export function poseBestiary(model,unit,spec,time,x,z){
  const {root,body,head,scale,clothTime}=model,phase=spec.phase??unit.bossPhase??0,fall=spec.fall??0;
  const travel=spec.stepWeight??unit.move??0,beat=spec.gaitPhase??time*(3.0+travel*3.5);
  const wind=unit.attack?T.MathUtils.clamp(1-unit.attack.time/Math.max(.01,unit.attack.windup??unit.spec?.time??1),0,1):0;
  const strike=unit.motion?Math.max(0,1-unit.motion.age/.38):0,flash=spec.flash??unit.flash??0;
  const aiming=unit.attack??unit.motion??unit;
  const desired=Math.atan2(aiming.dx??unit.dx??0,aiming.dz??unit.dz??1);
  model.heading=model.heading===undefined?desired:model.heading+Math.atan2(Math.sin(desired-model.heading),Math.cos(desired-model.heading))*.24;
  root.rotation.set(0,model.heading,fall*.92);root.position.set(x,model.footed?.015:.17+Math.sin(time*2.1)*.06,z);
  root.scale.setScalar(scale*(1+phase*.11)*(1-fall*.10));
  body.rotation.x=-wind*.19+strike*.24+fall*.31;body.rotation.z=Math.sin(beat*.5)*travel*.035;
  body.position.x=(unit.reaction?.dx??0)*flash*.045;body.position.z=-wind*.07+strike*.13;
  if(head){head.rotation.y=Math.sin(time*1.3)*.035;head.rotation.x=-wind*.11+strike*.13;}
  for(const limb of model.limbs){
    const gait=Math.sin(beat+limb.phase)*travel;
    limb.joint.rotation.x=limb.arm?-gait*.23-wind*.64+strike*.93:gait*.45;
    limb.joint.rotation.z=limb.arm?Math.sin(limb.phase)*.1:0;
    limb.knee.rotation.x=limb.arm?-.08-wind*.30+strike*.22:Math.max(0,-gait)*.52;
  }
  for(const [i,wing] of model.wings.entries()){wing.rotation.z=(i?-1:1)*(.14+Math.sin(time*4.7)*.10+wind*.31-strike*.23);wing.rotation.y=(i?-1:1)*(.09+Math.sin(time*2.9)*.08);}
  for(const [i,coil] of model.coils.entries())coil.rotation.z=Math.sin(time*2.8-i*.30)*(.035+travel*.08);
  clothTime.value=time+travel*.17;
  const power=1+phase*.18+wind*.44+strike*.38;
  model.materials.core.emissiveIntensity=power*(1.05+Math.sin(time*2.3)*.12);
  model.materials.body.emissiveIntensity=.018+flash*.08;
  model.weaponFlash=model.aura.update(time,phase,wind,strike,fall,flash,travel,spec.subdued,unit.motion);
  if(model.weaponEmission){
    const u=model.weaponEmission;u.weaponClock.value=time;u.weaponCharge.value=wind;u.weaponRelease.value=strike;
    u.weaponStage.value=phase;u.weaponIdlePulse.value=Math.max(0,Math.sin(time*2.2))**8;u.weaponLive.value=1-fall;
  }
}

export function removeBestiary(scene,model){
  scene.remove(model.root);model.aura?.dispose();
  for(const weapon of model.weaponRoots)disposeWeapon(weapon);
  for(const geometry of model.geometry)geometry.dispose();
  for(const material of new Set(Object.values(model.materials)))material.dispose();
}
