import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1],tau=Math.PI*2;
const mirror=(s,path)=>path.map(([x,...rest])=>[s*x,...rest]);
const plate=(k,j,m,path,depth=.052)=>k.sculpt.plate(j,m,path,depth,.015);
const curve=(k,j,m,path,steps=12)=>k.sculpt.sweep(j,m,path,{steps,sides:7,ridge:.22});
const solid=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?10:17,rings:mobile?15:23,section:2.48,ridge:.20,seed,
}));

const robes={
  'earth-beads':{form:'earth',name:'沉鐘追契者',size:[.54,.94,.68],tint:[0x3b322c,0x6b654a,0xa0906e,0x4b5141],
    flare:.78,aura:0xd4c082,shape:'sigils'},
  'lotus-beads':{form:'sutra',name:'照誓追契者',size:[.31,1.19,.92],tint:[0x343746,0x6d8786,0xc6bcaa,0x486971],
    flare:1.28,aura:0xbeead7,shape:'mist'},
  'dragon-fish':{form:'drake',name:'沉鐘追契者',size:[.48,1.02,.78],tint:[0x3a282a,0x8e6040,0xc69460,0x70513a],
    flare:.85,aura:0xefb478,shape:'embers'},
  'lotus-fish':{form:'bloom',name:'照誓追契者',size:[.37,1.15,.86],tint:[0x3b3240,0x8c637a,0xd6b2a3,0x6b546f],
    flare:1.10,aura:0xffcace,shape:'ribbons'},
};

function surfaces(k,tints){
  for(const [i,name] of ['templeDark','templeShell','templeEdge','templeCloth'].entries()){
    const alloy=i===1||i===2;
    k.materials[name]=paintedFinish(new T.MeshStandardMaterial({color:tints[i],vertexColors:true,
      roughness:alloy?.46:.76,metalness:alloy?.65:.12,envMap:forgeEnvironment(),envMapIntensity:alloy?.69:.22}),
    ['hide','iron','bronze','cloth'][i],true,true);
  }
}

function enshrine(k,head,data,mobile){
  const {form}=data,w=form==='earth'?.244:form==='drake'?.263:.176;
  const z=form==='drake'?.322:.295;
  head.name=data.name+' · 錘面';
  solid(k,head,'templeDark',[[0,-.22,.12,w*.52,.112],[0,-.087,.05,w*.9,.147],[0,.129,-.044,w,.198],
    [0,.259,-.062,w*.83,.144],[0,.348,-.121,w*.51,.095]],mobile);
  for(const side of sides){
    const y=form==='earth'?.125:.155;
    const mask=mirror(side,[[.025,y,z+.034],[w*.68,y+.02,z-.063],[w*1.04,y-.054,z-.147],
      [w*1.14,-.127,z-.194],[w*.78,-.239,z-.071],[.052,-.212,z+.056],[.038,-.085,z+.054]]);
    plate(k,head,'templeShell',mask,.055);
    curve(k,head,'templeEdge',mask.slice(1,6).map(([x,y,z],i)=>[x,y+.017,z+.026,[.016,.028,.021,.014,.004][i]]));
    curve(k,head,'glow',mirror(side,[[.04,.078,z+.054,.007],[w*.59,.093,z+.003,.015],[w*.9,.111,z-.058,.003]]));
    if(form==='drake'){
      const fang=mirror(side,[[w*.25,-.112,.321,.033,.033],[w*.37,-.149,.384,.038,.034],
        [w*.43,-.256,.445,.025,.022],[w*.31,-.317,.501,.005,.006]]);
      solid(k,head,'templeEdge',fang,mobile,side);
    }
    const c=form==='sutra'?.55:form==='bloom'?.37:.47;
    curve(k,head,'templeEdge',mirror(side,[[.081,.232,-.06,.04],[w*.79,.362,-.15,.067],
      [w*1.08,c,-.253,.047],[w*1.17,c+.19,-.404,.004]]),16);
    for(let i=0;i<3;i++){
      const y=.204-i*.090;
      curve(k,head,i===1?'templeEdge':'templeCloth',mirror(side,[[w*.50,y,-.164,.038],[w*.97,y-.057,-.223,.053],
        [w*1.12,y-.203,-.336,.036],[w*1.09,y-.307,-.40,.005]]),14);
    }
  }
}

function templeBeads(k,hand,form,joints){
  const string=k.bone(hand,.069,.092,.196);
  markEnemyWeapon(string,[0,.34,.029],{from:[0,-.23,.022],width:.19,aim:false,kind:'ring'});
  const pts=Array.from({length:13},(_,i)=>{
    const a=i*tau/12;return [Math.sin(a)*.198,Math.cos(a)*.276,Math.sin(a*2)*.051,.019];
  });
  curve(k,string,'templeDark',pts,28);
  for(const [i,[x,y,z]] of pts.slice(0,-1).entries()){
    const r=(form==='earth'?.062:.047)+(i%3)*.010;
    k.mesh(string,form==='earth'?'gem':'pearl',i===0?'glow':i%2?'templeShell':'templeEdge',x,y,z,r,r*.93,r);
  }
  joints.push({joint:string,speed:form==='earth'?.96:1.42});
}

function templeBell(k,hand,form,mobile,joints){
  const bronze=form==='drake';
  const bell=k.bone(hand,.027,.45,.176);
  markEnemyWeapon(bell,[0,.43,.036],{from:[0,-.36,.015],aim:false,width:.35,kind:'ring'});
  const profile=[[0,-.311],[.143,-.31],[.268,-.299],[.349,-.267],[.357,-.214],
    [.311,-.121],[.27,-.036],[.216,.104],[.161,.23],[.093,.315],[0,.344]];
  k.geometry(bell,'templeShell',new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),mobile?24:42));
  const outline=[.351,.279,.206];
  for(const [i,r] of outline.entries())k.mesh(bell,'ring','templeEdge',0,-.247+i*.165,0,r,r,.63,Math.PI*.5);
  for(let i=0;i<8;i++){
    const a=i*tau/8,x=Math.sin(a),z=Math.cos(a);
    const strut=[[x*.107,.264,z*.107,.022],[x*.169,.138,z*.169,.028],[x*.271,-.053,z*.271,.021],
      [x*.327,-.203,z*.327,.013]];
    curve(k,bell,bronze?'templeDark':'templeEdge',strut);
    k.mesh(bell,'gem',i%2?'templeEdge':'glow',x*.281,-.079,z*.281,.033,.072,.028,0,a);
  }
  joints.push({joint:bell,speed:bronze?.82:-.73});
}

function altar(k,body,back,data,mobile,flaps){
  const {form}=data,lotus=form==='bloom'||form==='sutra';
  for(const side of sides){
    for(let i=0;i<3;i++){
      const y=.51-i*.157,wide=data.size[0]*(1.03-i*.08);
      const brace=mirror(side,[[.039,y+.104,.241],[wide*.63,y+.131,.178],[wide*1.04,y+.059,.036],
        [wide*1.16,y-.120,-.138],[wide*.63,y-.141,-.259],[.045,y-.082,-.271]]);
      plate(k,body,lotus?'templeShell':i%2?'templeShell':'templeDark',brace,.061);
      curve(k,body,'templeEdge',brace.slice(1).map(([x,y,z])=>[x,y+.019,z-.018,.018]));
    }
    for(let i=0;i<(lotus?5:3);i++){
      const t=i/(lotus?4:2),joint=k.bone(back,side*(.107+t*.20),.264+t*.11,-.099-t*.059);
      joint.name=data.name+' · '+(lotus?'浮刻蓮瓣':'後袈枷');
      const x=.223+t*(form==='bloom'?.362:.257),y=(lotus?.47:.29)+Math.sin(t*2.16)*.219,z=-.387-t*.137;
      const detail=mirror(side,[[.012,.016,.028,.040,.046],[x*.3,y*.40,-.063,.096,.053],
        [x*.81,y*.83,z*.48,.106,.056],[x,y,z*.85,.068,.033],[x*1.08,y*1.19,z,.005,.006]]);
      solid(k,joint,i%3===0?'templeEdge':'templeShell',detail,mobile,side*1.24+i);
      curve(k,joint,lotus?'glow':'templeEdge',detail.map(([x,y,z,r])=>[x,y+.031,z+.033,r*.28]));
      flaps.push({joint,axis:'z',amp:.12+t*.11,bias:side*.078,seed:i*.71+side});
    }
  }
}

export function templeRelicHunter(k,weapon,mobile,build){
  const data=robes[weapon.id];
  if(!data)return null;
  surfaces(k,data.tint);
  const {form,flare,size:[broad,ground,neck],tint:[dark,,trim,dye]}=data,joints=[];
  const model=build(k,{broad,ground,neck,style:form==='earth'?'heavy':'shade',armLength:.74,finish:'templeCloth',
    legs:form==='earth'||form==='drake',mobile,portrait(k,head){enshrine(k,head,data,mobile);},
    weapon(k,body,back,head,hands,flaps){
      altar(k,body,back,data,mobile,flaps);
      if(form==='earth'||form==='sutra')templeBeads(k,hands[1],form,joints);
      else templeBell(k,hands[1],form,mobile,joints);
    }});
  model.cataloguePose=({headtime,wind,strike,stage})=>{
    for(const {joint,speed} of joints)joint.rotation.z=Math.sin(headtime*speed*2.4)*.38+wind*.26-strike*.80+stage*.17;
  };
  model.polishEnergy={tint:data.aura,shape:data.shape,anchor:model.body,offset:[0,.48,-.12],span:[broad+.5,.96,.79]};
  model.relicDress=tools=>{
    for(const side of sides)for(let i=0;i<3;i++){
      const width=.09+i*.021,x=.070+i*.109,y=.26-i*.045,z=.181-i*.161,length=flare*(.9+i*.12);
      tools.silk(model.body,data.name+' · 寺紗 '+side+' '+(i+1),mirror(side,[
        [x,y,z,width*.6],[x+.049,.021,z-.048,width],[x+.112,-length*.35,z-.113,width*.98],
        [x+.175,-length*.69,z-.206,width*.64],[x+.258,-length,z-.317,width*.19],
      ]),{style:'woven',tint:dye,trim,lining:dark,phase:side*.76+i*.81,flex:1.14+i*.26});
    }
    return true;
  };
  return model;
}
