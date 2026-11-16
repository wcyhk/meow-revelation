import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2,sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const line=(k,j,m,path,n=12)=>k.sculpt.sweep(j,m,path,{steps:n,sides:7,ridge:.23});
const plate=(k,j,m,path,thick=.045)=>k.sculpt.plate(j,m,path,thick,.017);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,
  {sides:mobile?11:17,rings:mobile?15:22,section:2.23,ridge:.21,seed}));

const designs={
  'thunder-pearl':{name:'三珠刑官',size:[.39,1.02,.89],head:[.218,.286,.208],counts:3,lift:.23,drop:1.08,
    tint:[0x252c3d,0x596780,0xa6aeb5,0x383b60],shape:'bolts',aura:0xb1bcff},
  'ice-orb':{name:'白髮霜珠師',size:[.31,1.14,.86],head:[.179,.327,.156],counts:1,lift:.73,drop:1.17,
    tint:[0x33414a,0x6b888f,0xc7d4ca,0x416572],shape:'mist',aura:0xb6f1ff},
  'fire-orb':{name:'燼腹火珠師',size:[.53,.91,.72],head:[.231,.232,.205],counts:1,lift:.18,drop:.76,
    tint:[0x29242c,0x6d3830,0xc87850,0x542d37],shape:'embers',aura:0xff8c4d},
  'spark-orb':{name:'鳴骨珠師',size:[.33,.97,.99],head:[.171,.363,.146],counts:2,lift:.86,drop:1.08,
    tint:[0x222636,0x494665,0xa298ab,0x40304e],shape:'bolts',aura:0xc99aff},
  'golden-orb':{name:'金玉審判使',size:[.42,1.10,.91],head:[.191,.297,.165],counts:1,lift:.55,drop:.97,
    tint:[0x393338,0x846242,0xd7b175,0x626352],shape:'sigils',aura:0xffdb95},
};

function surfaces(k,colors){
  for(const [i,id] of ['orbHide','orbShell','orbRim','orbWeave'].entries()){
    const metal=i===1||i===2,kind=['hide','iron','bronze','cloth'][i];
    k.materials[id]=paintedFinish(new T.MeshStandardMaterial({color:colors[i],metalness:metal?.62:.13,
      roughness:metal?.43:.72,vertexColors:true,envMap:forgeEnvironment(),envMapIntensity:metal?.69:.22}),kind,true,true);
  }
}

function face(k,head,id,spec,mobile){
  const [w,peak,lower]=spec.head;
  head.name=spec.name+' · 面目';
  cast(k,head,'orbHide',[[0,-lower,.114,w*.54,.111],[0,-.073,.066,w,.161],
    [0,.10,-.038,w*.96,.189],[0,.211,-.095,w*.84,.163],[0,peak,-.145,w*.48,.089]],mobile);
  for(const side of sides){
    const f=x=>side*x;
    const face=mirror(side,[[.034,.151,.266],[w*.61,.154,.219],[w*1.06,.094,.113],[w*1.11,-.062,.08],
      [w*.74,-.173,.169],[.057,-lower,.225],[.025,-.097,.251]]);
    plate(k,head,'orbShell',face,.049);
    line(k,head,'orbRim',face.slice(1,6).map(([x,y,z],i)=>[x,y+.013,z+.025,[.019,.027,.021,.013,.005][i]]));
    const eye=mirror(side,[[.039,.061,.285,.008],[w*.55,.083,.254,.019],[w*.83,.090,.200,.009],[w*.98,.101,.163,.003]]);
    line(k,head,'glow',eye);
    if(id==='ice-orb'||id==='spark-orb'){
      for(let i=0;i<4;i++){
        const p=mirror(side,[[w*.52,.201,-.133,.047],[w*(.82+i*.07),.101,-.216,.065],
          [w*(1.17+i*.135),-.123-i*.042,-.273,.045],[w*(1.25+i*.16),-.36-i*.049,-.322,.008]]);
        line(k,head,i%2?'orbRim':'orbShell',p,16);
      }
    }else{
      const outward=id==='fire-orb'?.408:id==='golden-orb'?.304:.313;
      const ridge=mirror(side,[[w*.56,.192,-.043,.053],[w*.99,.304,-.168,.073],
        [outward,.421,-.256,.039],[outward*1.07,.575,-.354,.004]]);
      line(k,head,'orbRim',ridge,15);
      if(id==='golden-orb')line(k,head,'glow',ridge.map(([x,y,z,r])=>[x,y+.031,z-.024,r*.40]));
    }
  }
}

function heldSphere(k,orb,id){
  markEnemyWeapon(orb,[0,.15,.067],{from:[0,-.16,.018],aim:false,width:.21,kind:'ring'});
  k.mesh(orb,'pearl','orbShell',0,0,0,.198,.187,.199);
  k.mesh(orb,'gem','glow',0,0,.192,.081,.113,.059);
  const axes=id==='fire-orb'?[.24,.93,1.46]:[.16,Math.PI*.50,Math.PI*.82];
  for(const [i,angle] of axes.entries()){
    const ring=k.bone(orb,0,0,.008);
    ring.rotation.set(angle,i*.39,i*.53);
    k.mesh(ring,'ring',i===1?'glow':'orbRim',0,0,0,.234+i*.027,.232+i*.020,.65);
    for(let n=0;n<5;n++){
      const a=n*tau/5;
      k.mesh(ring,'gem',n%2?'orbShell':'orbRim',Math.sin(a)*(.234+i*.027),Math.cos(a)*(.232+i*.020),.01,
        .032,.052,.027,0,0,-a);
    }
  }
}

function reliquary(k,body,id,spec,mobile,events){
  const {size:[w],counts}=spec;
  const dorsal=k.bone(body,0,.407,-.31);
  dorsal.name=spec.name+' · 背後法座';
  if(id==='fire-orb'){
    cast(k,dorsal,'orbShell',[[0,-.421,-.051,.208,.139],[0,-.302,-.131,.367,.133],
      [0,-.022,-.142,.391,.192],[0,.278,-.121,.311,.191],[0,.513,-.113,.162,.125]],mobile,8.13);
    for(const side of sides)for(let i=0;i<4;i++){
      const y=.303-i*.173;
      const strut=mirror(side,[[.052,y+.082,-.227,.039],[.22,y+.101,-.312,.064],
        [.283,y+.014,-.365,.051],[.257,y-.067,-.401,.019]]);
      line(k,dorsal,'orbRim',strut);
      line(k,dorsal,'glow',strut.map(([x,y,z,r])=>[x,y+.029,z-.030,r*.31]));
    }
    return;
  }
  for(let i=0;i<(id==='thunder-pearl'?counts:2);i++){
    const fan=k.bone(dorsal,0,.042-i*.07,-.046-i*.046);
    fan.rotation.z=.23*i;
    const radius=(id==='golden-orb'?.53:id==='spark-orb'?.37:w*1.05)+.084*i;
    k.mesh(fan,'ring',i%2?'orbShell':'orbRim',0,0,0,radius,radius*.92,.69);
    const marks=id==='thunder-pearl'?6:8;
    for(let mark=0;mark<marks;mark++){
      const a=mark*tau/marks+i*.21,s=Math.sin(a),c=Math.cos(a);
      k.mesh(fan,'gem',mark%3?'orbRim':'glow',radius*s,radius*c*.92,-.039,.038,.058,.030,0,0,-a);
      line(k,fan,'orbShell',[[radius*s,radius*c*.90,-.05,.018],[s*radius*1.19,c*radius*1.09,-.143,.022],
        [s*radius*1.21,c*radius*1.15,-.184,.004]],8);
    }
    events.push({joint:fan,axis:'z',phase:i*.51+spec.lift,amount:i%2?-.31:.27});
  }
}

export function orbRelicHunter(k,weapon,mobile,fighter){
  const id=weapon.id,spec=designs[id];
  if(!spec)return null;
  surfaces(k,spec.tint);
  const {size:[broad,ground,neck],counts,lift,drop,aura,shape,tint:[dark,,edge,cloth]}=spec;
  const tracks=[];
  const actor=fighter(k,{broad,ground,neck,style:id==='fire-orb'?'heavy':'shade',armLength:.67,finish:'orbWeave',
    legs:id==='fire-orb'||id==='thunder-pearl',mobile,
    portrait(k,head){face(k,head,id,spec,mobile);},
    weapon(k,body,back,head,hands,flaps){
      reliquary(k,body,id,spec,mobile,tracks);
      const orb=k.bone(hands[1],.08,.081,.20);
      orb.name=spec.name+' · 運轉法珠';
      heldSphere(k,orb,id);
      tracks.push({joint:orb,axis:'z',phase:lift+.31,amount:1.27});
      for(let i=1;i<counts;i++){
        const mote=k.bone(body,i%2?-.44:.5,.44+i*.043,-.023-i*.093);
        k.mesh(mote,'pearl','orbRim',0,0,0,.13,.12,.13);
        k.mesh(mote,'ring','glow',0,0,0,.168,.169,.67,.18+i*.51,-.39);
        flaps.push({joint:mote,axis:'x',amp:.48+i*.087,bias:.45,seed:2.19+i*.97});
      }
      for(const side of sides){
        const x=side*broad*.73,y=.42;
        const plating=mirror(side,[[.026,y+.139,.214],[broad*.56,y+.170,.173],[broad*1.09,y+.069,.060],
          [broad*.92,y-.147,-.101],[broad*.51,y-.166,.029],[.045,y-.079,.243]]);
        plate(k,body,'orbShell',plating,.06);
        line(k,body,'orbRim',plating.slice(1,6).map(([x,y,z])=>[x,y+.019,z+.022,.017]));
        k.mesh(body,'gem','glow',x,y-.031,.168,.038,.058,.024);
      }
    }});
  actor.cataloguePose=({headtime,wind,strike,stage})=>{
    for(const {joint,axis,phase,amount} of tracks)
      joint.rotation[axis]=headtime*amount*(.76+stage*.28)+phase+wind*.19+strike*.78;
  };
  actor.polishEnergy={tint:aura,shape,anchor:actor.body,offset:[0,.58,-.02],span:[broad+.51,neck*.88,.88]};
  actor.relicDress=tools=>{
    for(const side of sides)for(let i=0;i<3;i++){
      const x=.06+i*.113,y=.287-i*.024,z=.10-i*.14,w=.086+i*.018;
      tools.silk(actor.body,spec.name+' · 浮紗 '+side+' '+(i+1),mirror(side,[
        [x,y,z,w*.60],[x+.049,.056,z-.062,w],[x+.157,-drop*.34,z-.158,w*.84],
        [x+.246,-drop*.72,z-.302,w*.68],[x+.299,-drop,z-.481,w*.18],
      ]),{style:'woven',tint:cloth,trim:edge,lining:dark,phase:side*.73+i*.65,flex:1.15+i*.2});
    }
    return true;
  };
  return actor;
}
