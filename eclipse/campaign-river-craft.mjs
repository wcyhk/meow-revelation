import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const weld=(k,j,name,points,detail=10)=>k.sculpt.sweep(j,name,points,{steps:detail,sides:7,ridge:.2});
const plate=(k,j,name,path,thickness)=>k.sculpt.plate(j,name,path,thickness,.017);
function finish(k,name,color,metalness,roughness,paint){
  if(k.materials[name])return;
  const surface=new T.MeshStandardMaterial({color,roughness,metalness,vertexColors:true,
    envMap:forgeEnvironment(),envMapIntensity:.62});
  k.materials[name]=paintedFinish(surface,paint,true,true);
}

export function craftRiverScales(k,tail,path,eclipse,mobile,flaps){
  finish(k,'riverScale',eclipse?0x574132:0x4c706a,.34,.58,eclipse?'bronze':'hide');
  finish(k,'riverEdge',eclipse?0x9d6745:0x9dab9f,.48,.49,eclipse?'bronze':'bone');
  const route=new T.CatmullRomCurve3(path.map(point=>new T.Vector3(...point.slice(0,3))));
  const ray=new T.CatmullRomCurve3(path.map(point=>new T.Vector3(point[3],point[4],0)));
  const count=eclipse?(mobile?13:17):(mobile?16:22);
  for(let i=0;i<count;i++){
    const t=(i+.36)/count,center=route.getPointAt(t),axis=route.getTangentAt(t);
    const radius=ray.getPoint(route.getUtoTmapping(t)),w=radius.x,h=radius.y;
    const hinge=k.bone(tail,center.x,center.y+h*.30,center.z);
    hinge.name=eclipse?'銅砂蝕日者 · 銅鱗':'白鱗渡守 · 浪脊鱗';
    hinge.rotation.y=Math.atan2(-axis.x,-axis.z);
    const row=i%3,round=eclipse?1.03:1.22;
    for(const face of sides){
      const platePath=[[face*w*.06,h*.73,-.102],[face*w*.59,h*.74,-.072],[face*w*.93,h*.39,-.01],
        [face*w*1.09,h*.073,.064],[face*w*.86,h*.21,.136],[face*w*.41,h*.67,.108],[face*w*.10,h*.83,.067]];
      plate(k,hinge,row===1?'riverEdge':'riverScale',platePath,.037*w/.25+.013);
      weld(k,hinge,row===2?'edge':'riverEdge',[[face*w*.07,h*.82,-.104,.012],[face*w*.45,h*.84,-.093,.018],
        [face*w*.87,h*.45,.009,.018],[face*w*1.10,h*.12,.066,.013],[face*w*.91,h*.31,.129,.004]]);
      if(i%2===0)weld(k,hinge,row===0?'glow':'trim',[[face*w*.22,h*.87,.034,.007],
        [face*w*.49,h*.80,.061,.013],[face*w*.73,h*.62,.098,.005]],7);
    }
    weld(k,hinge,row===2?'riverEdge':'riverScale',[[0,h*.49,-.106,.022],[w*.03,h*.89,-.052,.042],
      [w*.11,h*round,.063,.029],[w*.20,h*round*1.12,.139,.004]],11);
    flaps.push({joint:hinge,axis:'x',amp:.080+Math.sin(t*9)*.022,bias:.01,seed:t*9.1,stride:true});
  }
}

export function ferryPaddle(k,oar,mobile){
  finish(k,'riverWood',0x58493f,.15,.62,'hide');
  finish(k,'riverSteel',0x7faca0,.62,.41,'iron');
  finish(k,'riverRust',0x927462,.72,.52,'bronze');
  markEnemyWeapon(oar,[.10,1.48,.142],{from:[0,-.29,-.062],width:.17});
  weld(k,oar,'riverWood',[[0,-.34,-.126,.043],[.008,-.112,-.039,.046],[0,.365,.077,.060],
    [.032,.728,.125,.077],[.035,.956,.151,.065]],18);
  const blade=[[-.055,.704,.118],[.067,.743,.148],[.182,.884,.158],[.244,1.172,.125],
    [.172,1.449,.091],[.101,1.482,.14],[-.042,1.441,.212],[-.208,1.226,.233],
    [-.221,1.042,.214],[-.123,.870,.152]];
  plate(k,oar,'riverWood',blade,.103);
  const rim=blade.map(([x,y,z],i)=>[x,y,z+.059,i===5?.009:.018]);
  weld(k,oar,'riverSteel',[...rim,rim[0]],20);
  weld(k,oar,'riverRust',[...blade,blade[0]].map(([x,y,z])=>[x,y,z-.052,.015]),18);
  for(const side of sides){
    const z=side*.062;
    const channel=[[.036,.779,.149+z,.011],[.006,.925,.198+z,.021],[-.080,1.105,.226+z,.024],
      [-.071,1.244,.230+z,.014],[.06,1.385,.166+z,.004]];
    weld(k,oar,'riverSteel',channel,15);
    weld(k,oar,'glow',channel.map(([x,y,d,r])=>[x+.028,y,d+side*.021,r*.57]),13);
    for(let i=0;i<(mobile?4:7);i++){
      const y=.86+i*.081,x=.05+.08*Math.sin(i*.81),w=.058+i%2*.026;
      weld(k,oar,'riverRust',[[x-w,y,.159+z,.011],[x-w*.27,y+.059,.187+z,.018],
        [x+w*.61,y+.035,.183+z,.009]],8);
    }
  }
  for(let i=0;i<7;i++){
    const y=-.156+i*.11,z=.005+i*.026;
    k.mesh(oar,'ring',i%2?'riverWood':'riverRust',0,y,z,.064,.067,.61,Math.PI*.46);
  }
  k.geometry(oar,'riverRust',sculptVolume([[0,-.404,-.113,.052,.043],[0,-.366,-.100,.072,.064],
    [0,-.310,-.112,.068,.058],[0,-.268,-.118,.047,.053]],{sides:10,rings:10,section:2.16,ridge:.15}));
}
