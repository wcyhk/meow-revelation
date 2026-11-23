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

function shatteredMantle(k,body){
  return sides.map(side=>{
    const root=k.bone(body,side*.367,.456,-.226);
    root.name=side<0?'王冠守夜者 · 左碎晶肩脊':'王冠守夜者 · 右碎晶肩脊';
    const high=side<0?.29:.41;
    const armour=mirror([
      [-.017,-.047,.068],[.151,-.151,.021],[.354,-.144,-.145],[.468,.041,-.219],
      [.323,.098,-.154],[.374,high,-.257],[.161,.204,-.144],[.135,.101,-.045],
    ],side);
    k.sculpt.plate(root,'wardenObsidian',armour,.081,.018);
    k.sculpt.plate(root,'wardenObsidian',mirror([
      [.023,-.091,.069],[.233,-.208,-.058],[.394,-.126,-.158],[.302,-.061,-.143],
      [.270,.279,-.204],[.127,.006,.009],
    ],side),.045,.011);
    k.sculpt.sweep(root,'wardenMoonEdge',mirror([
      [.164,-.130,.048,.010],[.219,-.065,-.018,.011],[.214,-.028,-.077,.006],
      [.324,.070,-.123,.010],[.347,high-.032,-.227,.004],
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

export function forgeWardenMoonKit(k,body,cleft,amber){
  const material=fractureMaterial();
  const core=eclipseHeart(k,cleft,material);
  const mantle=shatteredMantle(k,body);
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
      if(blade){
        blade.root.visible=awake;bloodBlade.visible=!awake;
        const spread=open*(.65+wind*.35);
        for(const {section,pivot,side} of blade.pieces){
          section.position.set(pivot[0]+side*spread*.024,pivot[1]+spread*(side<0?-.022:.008),pivot[2]+side*spread*.013);
          section.rotation.z=side*spread*.067;
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
