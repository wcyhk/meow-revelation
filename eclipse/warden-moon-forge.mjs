import * as T from '../three.min.mjs';
import {revealCurve as ease} from './warden-transformation.mjs';

const sides=[-1,1];
const mirror=(path,side)=>path.map(([x,...rest])=>[x*side,...rest]);

function fractureMaterial(){
  return new T.ShaderMaterial({
    uniforms:{clock:{value:0},strength:{value:0},concentrate:{value:0}},
    transparent:true,side:T.DoubleSide,forceSinglePass:true,depthWrite:false,
    blending:T.AdditiveBlending,toneMapped:false,
    vertexShader:`
      attribute vec2 fracture;
      varying vec2 channel;
      void main(){
        channel=fracture;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
      }`,
    fragmentShader:`
      uniform float clock,strength,concentrate;
      varying vec2 channel;
      void main(){
        float across=abs(channel.x);
        float pulse=smoothstep(.55,1.,.5+.5*cos(channel.y*17.-clock*(4.+5.*concentrate)));
        float taper=smoothstep(0.,.13,channel.y)*(1.-smoothstep(.90,1.,channel.y));
        float halo=pow(1.-across,2.6),edge=pow(1.-across,10.);
        vec3 light=mix(vec3(.21,.093,.66),vec3(.90,.83,1.),edge*.63+pulse*.27);
        gl_FragColor=vec4(light,(halo*.43+edge*(.26+.37*pulse))*taper*strength);
      }`,
  });
}

function fractureThreads(parent,paths,material){
  const positions=[],values=[];
  for(const points of paths){
    const strips=points.map(([x,y,z,width],index)=>{
      const [ax,ay]=points[Math.max(0,index-1)];
      const [bx,by]=points[Math.min(points.length-1,index+1)];
      const dx=bx-ax,dy=by-ay,scale=width/Math.hypot(dx,dy);
      return [[x-dy*scale,y+dx*scale,z],[x+dy*scale,y-dx*scale,z]];
    });
    const row=(index,side)=>{
      positions.push(...strips[index][side]);
      values.push(side===0?-1:1,index/(strips.length-1));
    };
    for(let index=0;index<strips.length-1;index++){
      row(index,0);row(index,1);row(index+1,0);
      row(index,1);row(index+1,1);row(index+1,0);
    }
  }
  const geometry=new T.BufferGeometry()
    .setAttribute('position',new T.Float32BufferAttribute(positions,3))
    .setAttribute('fracture',new T.Float32BufferAttribute(values,2));
  const lines=new T.Mesh(geometry,material);
  lines.renderOrder=32;
  parent.add(lines);
  return lines;
}

function eclipseHeart(k,cleft,material){
  const core=k.bone(cleft,0,-.012,.168);
  core.name='王冠守夜者 · 月蝕空心';
  const outline=[
    [.002,.188,.014],[.151,.106,-.022],[.117,-.094,-.007],[.007,-.184,.029],
    [-.131,-.093,.005],[-.145,.089,-.013],
  ];
  k.sculpt.plate(core,'wardenObsidian',outline,.051,.017);
  for(const side of sides){
    k.sculpt.plate(core,'wardenObsidian',mirror([
      [.006,.173,.056],[.118,.104,.041],[.097,.025,.070],[.121,-.054,.044],
      [.072,-.114,.091],[.018,-.085,.065],[.046,-.012,.072],[.021,.058,.075],
    ],side),.028,.006);
    k.sculpt.sweep(core,'wardenWorn',mirror([
      [.004,.180,.061,.010],[.103,.104,.061,.013],
      [.106,-.083,.066,.010],[.010,-.161,.076,.006],
    ],side),{sides:5,steps:9});
  }
  k.mesh(core,'gem','wardenMoonEdge',.003,.027,.091,.019,.058,.014);
  fractureThreads(core,[
    [[.009,.186,.072,.014],[-.016,.097,.084,.024],[.012,.049,.114,.030],[-.025,-.014,.114,.025],
      [.004,-.067,.109,.019],[-.021,-.140,.086,.011]],
    [[.012,.044,.106,.014],[.060,.021,.102,.018],[.079,-.051,.097,.015],[.120,-.064,.077,.007]],
    [[-.020,-.004,.110,.015],[-.071,-.023,.100,.015],[-.092,-.090,.083,.009]],
  ],material).name='王冠守夜者 · 空心裂光';
  return core;
}

function eclipseVisor(k,head,material){
  const visor=k.bone(head,0,.02,.23);
  visor.name='王冠守夜者 · 黑曜月面';
  const crown=[
    [0,.36,-.034],[.044,.212,.027],[.178,.202,.009],[.197,.152,-.005],
    [.087,.107,.079],[.033,.124,.141],[0,.068,.157],
    [-.040,.125,.124],[-.119,.122,.067],[-.224,.179,-.039],[-.166,.236,-.053],[-.058,.186,.025],
  ];
  k.sculpt.plate(visor,'wardenObsidian',crown,.044,.012);
  for(const [index,side] of sides.entries()){
    const height=index?.11:.18;
    k.sculpt.plate(visor,'wardenObsidian',mirror([
      [.110,.002,.098],[.185,.034,.048],[.233,height,-.072],[.288,height-.117,-.163],
      [.302,-.036,-.228],[.206,-.123,-.084],[.130,-.224,.053],[.095,-.177,.089],
    ],side),.047,.012);
    k.sculpt.sweep(visor,'wardenWorn',mirror([
      [.125,-.177,.092,.010],[.181,-.109,.038,.014],[.237,-.064,-.090,.013],[.276,-.012,-.181,.006],
    ],side),{sides:5,steps:10});
  }
  fractureThreads(visor,[
    [[.001,.335,-.006,.007],[-.008,.242,.020,.015],[.012,.177,.077,.013],[-.005,.109,.156,.011]],
    [[-.152,.189,-.008,.010],[-.105,.163,.025,.013],[-.058,.160,.082,.012],[-.010,.127,.134,.007]],
  ],material);
  return visor;
}

function brokenCrescent(k,head){
  const moon=k.bone(head,-.085,.155,-.35);
  moon.name='王冠守夜者 · 懸浮斷月';
  const segments=[[47,115],[126,224],[239,310]];
  const pieces=segments.map(([start,end],index)=>{
    const piece=k.bone(moon,0,0,-.017*index);
    const steps=8;
    const branch=Array.from({length:steps+1},(_,i)=>{
      const t=i/steps,a=(start+(end-start)*t)*Math.PI/180;
      const outer=.69+.023*Math.cos(a*7)-.024*index;
      const depth=.015*Math.sin(a*4);
      const inner=outer-(.028+.115*Math.sin(Math.PI*t)**.64+.038*(1-Math.abs(Math.cos(a))));
      return {outer:[Math.cos(a)*outer,Math.sin(a)*outer*.88,depth],
        inner:[Math.cos(a)*inner,Math.sin(a)*inner*.88,depth+.016]};
    });
    const outside=branch.map(point=>point.outer),inside=branch.map(point=>point.inner);
    k.sculpt.plate(piece,'wardenObsidian',[...outside,...inside.slice().reverse()],.055,.012);
    const bevel=(points,depth)=>points.map(([x,y,z],i)=>[x,y,z+depth,.006+.006*Math.sin(i*Math.PI/steps)]);
    k.sculpt.sweep(piece,'wardenMoonEdge',bevel(inside,.037),{sides:5,steps:12});
    k.sculpt.sweep(piece,'wardenWorn',bevel(outside,-.041),{sides:5,steps:12});
    return piece;
  });
  return {moon,pieces};
}

function shatteredMantle(k,body){
  return sides.map(side=>{
    const root=k.bone(body,side*.367,.456,-.226);
    root.name=side<0?'王冠守夜者 · 左碎晶肩脊':'王冠守夜者 · 右碎晶肩脊';
    const high=side<0?.49:.32;
    const armour=mirror([
      [-.017,-.047,.068],[.151,-.151,.021],[.354,-.144,-.145],[.534,.023,-.339],
      [.368,.106,-.224],[.399,high,-.321],[.161,.204,-.144],[.135,.101,-.045],
    ],side);
    k.sculpt.plate(root,'wardenObsidian',armour,.081,.018);
    k.sculpt.plate(root,'wardenObsidian',mirror([
      [.023,-.091,.069],[.233,-.208,-.058],[.394,-.126,-.158],[.302,-.061,-.143],
      [.299,.323,-.292],[.127,.006,.009],
    ],side),.045,.011);
    k.sculpt.sweep(root,'wardenMoonEdge',mirror([
      [.164,-.130,.048,.010],[.219,-.065,-.018,.011],[.214,-.028,-.077,.006],
      [.324,.070,-.172,.010],[.387,high-.032,-.307,.004],
    ],side),{sides:5,steps:11});
    k.sculpt.sweep(root,'wardenWorn',mirror([
      [.106,-.122,-.025,.007],[.241,-.138,-.117,.013],[.389,-.074,-.236,.013],[.514,.024,-.343,.006],
    ],side),{sides:5,steps:11});
    return root;
  });
}

function shadowBlade(k,weapon,material){
  const root=k.bone(weapon,0,0,0);
  root.name='王冠守夜者 · 幽月裂刃';
  const pieces=[];
  let mainEdge;
  const layout=[
    {pivot:[-.046,.279,.065],side:-1,points:[
      [-.064,.245,.060],[.039,.310,.060],[.028,.514,.080],[.010,.697,.084],[-.029,.720,.086],
      [.034,.874,.103],[.029,1.064,.114],[.097,1.229,.119],[.091,1.381,.129],
      [.029,1.280,.109],[-.087,.975,.061],[-.136,.607,.061],
    ],edge:[
      [-.068,.263,.093,.013],[-.077,.456,.106,.015],[-.099,.609,.097,.021],
      [-.059,.774,.110,.018],[-.044,.990,.100,.014],[.005,1.127,.112,.015],[.066,1.305,.141,.009],
    ]},
    {pivot:[.073,.293,.081],side:1,points:[
      [.060,.263,.070],[.171,.270,.072],[.219,.591,.083],[.186,.628,.081],[.270,.746,.094],
      [.339,1.161,.114],[.284,1.653,.157],[.214,1.483,.153],[.185,1.230,.135],
      [.110,1.123,.125],[.087,.873,.106],[.024,.727,.118],[.076,.665,.088],
    ],edge:[
      [.149,.286,.117,.017],[.173,.476,.110,.021],[.192,.581,.110,.020],[.171,.628,.124,.021],
      [.229,.740,.120,.025],[.273,.977,.117,.025],[.299,1.174,.144,.023],[.281,1.530,.178,.017],
      [.285,1.636,.167,.010],
    ]},
  ];
  for(const {pivot,side,points,edge} of layout){
    const section=k.bone(root,...pivot);
    section.name=side<0?'幽月裂刃 · 短鉤':'幽月裂刃 · 主鋒';
    const local=([x,y,z,...rest])=>[x-pivot[0],y-pivot[1],z-pivot[2],...rest];
    k.sculpt.plate(section,'wardenObsidian',points.map(local),.050,.016);
    k.sculpt.sweep(section,'wardenMoonEdge',edge.map(([x,y,z,width])=>local([x,y,z,width*.41])),
      {sides:5,steps:17,ridge:.08});
    const glow=[edge,edge.map(([x,y,z,width])=>[x,y,z-.079,width*.79])].map(path=>path.map(local));
    fractureThreads(section,glow,material);
    pieces.push({section,pivot,side});
    if(side===1){
      mainEdge={node:section,heel:new T.Vector3(...local(points[0])),tip:new T.Vector3(...local(points[6]))};
    }
  }
  // The hit rig stores each articulated blade segment's envelope so the
  // original sword wrist and grip clearance also cover the split shape.
  weapon.userData.weaponClearanceParts=pieces.map(({section})=>section);
  return {root,pieces,mainEdge};
}

export function forgeWardenMoonKit(k,body,head,cleft,amber){
  const material=fractureMaterial();
  const core=eclipseHeart(k,cleft,material);
  const mantle=shatteredMantle(k,body);
  const visor=eclipseVisor(k,head,material);
  const {moon:ring,pieces:crescent}=brokenCrescent(k,head);
  let blade,bloodBlade;
  return {
    get edge(){return blade?.root.visible?blade.mainEdge:null;},
    mountBlade(weapon,original){
      blade=shadowBlade(k,weapon,material);
      bloodBlade=original;
    },
    pose({moon,headtime,wind,strike,fall,subdued}){
      const awake=moon>.33;
      core.visible=awake;amber.visible=!awake;
      const open=ease(moon,.33,.88);
      visor.visible=ring.visible=awake;
      visor.scale.setScalar(.75+open*.25);
      ring.scale.setScalar(.68+open*.32);
      if(blade){
        blade.root.visible=awake;bloodBlade.visible=!awake;
        const spread=open*(.65+wind*.35);
        for(const {section,pivot,side} of blade.pieces){
          section.position.set(pivot[0]+side*spread*.041,pivot[1]+spread*(side<0?-.043:.008),pivot[2]+side*spread*.022);
          section.rotation.z=side*spread*.104;
        }
      }
      for(const [index,root] of mantle.entries()){
        root.visible=awake;
        const side=sides[index];
        root.rotation.set(-open*.21-wind*.13+strike*.10,side*open*.20,side*(open*.21+strike*.13));
        root.scale.setScalar(.65+open*.35);
      }
      if(!awake)return;
      const charge=Math.max(wind,strike);
      ring.rotation.set(-.16+wind*.17,Math.sin(headtime*.74)*.17+.18,Math.sin(headtime*.61)*.12);
      for(const [index,piece] of crescent.entries()){
        const float=Math.sin(headtime*1.71+index*1.91)*(subdued?.013:.033);
        piece.position.y=float+strike*.035;
        piece.rotation.z=(index-1)*(charge*.08+float);
      }
      core.rotation.z=Math.sin(headtime*1.32)*.055*moon;
      const swell=1+Math.sin(headtime*3.8)*.064+charge*.10;
      core.scale.set(swell,1+charge*.06,swell);
      const uniform=material.uniforms;
      uniform.clock.value=headtime;
      uniform.strength.value=ease(moon,.33,.73)*(1-fall)*(subdued?.57:.86+charge*.32);
      uniform.concentrate.value=charge;
    },
    dispose(){material.dispose();},
  };
}
