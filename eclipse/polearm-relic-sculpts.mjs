import * as T from '../three.min.mjs';
import {forge} from './armory.mjs?v=emberlight-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...tail])=>[side*x,...tail]);
const line=(k,j,m,path,steps=11)=>k.sculpt.sweep(j,m,path,{sides:7,steps,ridge:.19});
const plate=(k,j,m,path,t=.047)=>k.sculpt.plate(j,m,path,t,t*.37);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?10:14,rings:mobile?12:18,section:2.50,ridge:.28,seed,
}));
const gem=(k,j,m,pos,scale)=>k.mesh(j,'gem',m,...pos,...scale);
const ring=(k,j,m,radius,tube,span=Math.PI*2)=>k.geometry(j,m,new T.TorusGeometry(radius,tube,7,28,span));

const designs={
  'sky-halberd':{type:'star',dimensions:[.42,1.03,.81,.76],colors:[0x633831,0x252835,0x9c5037,0xb69767,0xbb8867],
    light:0xff9c57,theme:'embers',scale:1.02,tip:[.04,1.14,0]},
  'shiva-trident':{type:'dance',dimensions:[.36,1.04,.88,.80],colors:[0x70503a,0x2c2b38,0x3d4968,0xc79d5d,0x688a9a],
    light:0xffd28b,theme:'bolts',scale:.99,tip:[0,1.165,0]},
  xuanming:{type:'ice',dimensions:[.54,.93,.80,.81],colors:[0x365979,0x222c3e,0x2a4765,0xa8cbd9,0x819aa9],
    light:0x9de5ff,theme:'mist',scale:1.12,tip:[.027,1.2,0]},
};

function materials(k,d){
  const [steel,shadow,cloth,trim,face]=d.colors;
  for(const [name,color,metalness,roughness,kind] of [
    ['poleSteel',steel,.58,.44,'iron'],['poleShadow',shadow,.25,.64,'hide'],
    ['poleCloth',cloth,.09,.82,'cloth'],['poleTrim',trim,.61,.42,'bronze'],
    ['poleFace',face,.05,.72,'hide'],['poleBone',0xc6c8bf,.14,.57,'bone'],
    ['poleDarkHair',0x2a2730,.04,.83,'hide'],
  ]){
    const material=new T.MeshStandardMaterial({color,metalness,roughness,vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:metalness>.45?.65:.24});
    k.materials[name]=paintedFinish(material,kind,true,true);
  }
  k.materials.poleGlow=new T.MeshBasicMaterial({color:d.light});
  k.materials.poleEffect=new T.MeshBasicMaterial({color:d.light,transparent:true,
    opacity:.45,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
}

function starHelmet(k,head,mobile){
  cast(k,head,'poleShadow',[[0,-.169,-.020,.172,.126],[0,-.042,-.07,.245,.198],
    [0,.121,-.042,.247,.192],[0,.229,-.076,.183,.174],[0,.315,-.187,.087,.122]],mobile,10);
  for(const side of sides){
    const p=path=>mirror(side,path);
    const crest=p([[.017,.141,.193],[.101,.244,.194],[.235,.298,.059],[.294,.373,-.154],
      [.169,.363,-.290],[.213,.218,-.294],[.276,.129,-.099],[.179,.094,.200]]);
    plate(k,head,'poleSteel',crest,.056);
    line(k,head,'poleTrim',crest.slice(1,7).map(([x,y,z])=>[x,y+.021,z+.018,.017]));
    const mask=p([[.005,.011,.206],[.107,.089,.215],[.215,.039,.160],[.235,-.083,.038],
      [.146,-.235,.136],[.040,-.206,.249],[.076,-.106,.275]]);
    plate(k,head,'poleSteel',mask,.039);
    line(k,head,'poleGlow',p([[.029,.029,.247,.005],[.107,.058,.249,.014],
      [.160,.037,.206,.009],[.198,.013,.167,.002]]));
    for(let i=0;i<3;i++)line(k,head,'poleTrim',p([[.058+i*.037,-.127,.257-i*.035,.005],
      [.098+i*.027,-.101,.230-i*.048,.008],[.125+i*.029,-.070,.181-i*.03,.003]]));
  }
  gem(k,head,'poleGlow',[0,.156,.235],[.036,.053,.026]);
}

function dancerFace(k,head,mobile){
  cast(k,head,'poleFace',[[0,-.179,.027,.089,.072],[0,-.085,.036,.142,.123],
    [0,.050,-.019,.165,.142],[0,.163,-.047,.151,.142],[0,.214,-.072,.119,.104]],mobile,37);
  cast(k,head,'poleDarkHair',[[0,.162,-.057,.173,.158],[0,.244,-.073,.176,.156],
    [.026,.311,-.105,.112,.107],[.030,.400,-.108,.075,.072],[.049,.440,-.098,.022,.032]],mobile,42);
  line(k,head,'poleFace',[[0,.055,.129,.019],[.006,.005,.153,.024],[0,-.046,.185,.018],[0,-.060,.174,.007]]);
  line(k,head,'poleShadow',[[-.046,-.087,.160,.006],[0,-.100,.183,.008],[.045,-.087,.160,.006]]);
  for(const side of sides){
    const p=path=>mirror(side,path);
    line(k,head,'poleDarkHair',p([[.030,.070,.135,.007],[.072,.071,.151,.011],[.111,.075,.118,.007]]));
    gem(k,head,'poleGlow',[side*.068,.046,.149],[.021,.009,.010]);
    cast(k,head,'poleDarkHair',p([[.052,.245,.071,.049,.065],[.126,.196,.056,.064,.051],
      [.168,.057,.020,.063,.038],[.194,-.132,-.048,.046,.035],[.214,-.311,-.124,.006,.006]]),mobile,50+side);
    const earring=k.bone(head,side*.165,-.048,-.002);
    earring.rotateY(side*.4);
    ring(k,earring,'poleTrim',.053,.013,Math.PI*1.76);
  }
  line(k,head,'poleBone',[[-.064,.151,.139,.005],[0,.161,.156,.009],[.064,.151,.141,.005]]);
  gem(k,head,'poleGlow',[0,.134,.162],[.021,.039,.012]);
  const crescent=k.bone(head,-.112,.298,.046);
  crescent.rotation.z=.98;
  ring(k,crescent,'poleTrim',.096,.021,Math.PI*1.27);
}

function iceFace(k,head,mobile){
  cast(k,head,'poleShadow',[[0,-.217,-.091,.177,.131],[0,-.102,-.051,.248,.232],
    [0,.071,-.051,.265,.229],[0,.243,-.091,.242,.197],[0,.344,-.123,.153,.183]],mobile,86);
  for(const side of sides){
    const p=path=>mirror(side,path);
    const mask=p([[.016,.066,.248],[.162,.155,.211],[.255,.123,.100],[.279,.008,-.029],
      [.167,-.219,.129],[.062,-.261,.240],[.096,-.109,.276]]);
    plate(k,head,'poleBone',mask,.042);
    line(k,head,'poleGlow',p([[.038,.057,.279,.008],[.107,.078,.276,.019],
      [.173,.061,.221,.015],[.218,.042,.152,.004]]));
    for(let i=0;i<4;i++){
      const x=.025+i*.036;
      cast(k,head,i%2?'poleBone':'poleFace',p([[x,-.101,.255,.031,.028],[x+.024,-.213,.266,.039,.022],
        [x+.035,-.354,.253,.030,.025],[x+.008,-.544,.194-i*.036,.004,.006]]),mobile,100+i);
    }
    cast(k,head,'poleSteel',p([[.189,.136,-.034,.073,.063],[.257,.251,-.117,.085,.059],
      [.324,.394,-.178,.066,.048],[.368,.533,-.231,.005,.005]]),mobile,114+side);
  }
}

function armorKit(k,body,back,grips,flaps,d,mobile){
  for(const [index,side] of sides.entries()){
    const p=path=>mirror(side,path),arm=grips[index].parent.parent;
    const n=d.type==='ice'?5:d.type==='star'?3:2;
    const width=d.type==='ice'?.39:d.type==='star'?.32:.20;
    for(let i=0;i<n;i++){
      const y=.176-i*.101,w=width*(1-i*.075),h=d.type==='ice'?.216:.130;
      const outline=p([[-.092,y+.069,.150],[w*.40,y+h,.143],[w*.91,y+h*.79,.028],
        [w*1.14,y+.023,-.154],[w*.81,y-.126,-.190],[w*.54,y-.114,-.066],[.014,y-.092,.111]]);
      plate(k,arm,i%2?'poleShadow':'poleSteel',outline,.068);
      line(k,arm,'poleTrim',outline.slice(1,6).map(([x,y,z])=>[x,y+.031,z+.020,.019]));
    }
    for(let row=0;row<3;row++){
      const y=.472-row*.151,w=width*(1-row*.092),depth=d.dimensions[0]*.68;
      const crest=p([[.012,y+.086,depth+.055],[w*.63,y+.077,depth+.044],[w,y+.028,depth-.033],
        [w*.98,y-.083,depth-.173],[w*.49,y-.143,depth-.062],[.038,y-.098,depth+.094]]);
      plate(k,body,row%2?'poleShadow':'poleSteel',crest,.045);
      line(k,body,'poleTrim',crest.slice(1,6).map(([x,y,z])=>[x,y+.013,z+.018,.015]));
      if(d.type!=='dance')gem(k,body,'poleGlow',[side*w*.59,y-.045,depth+.048],[.022,.026,.016]);
    }
    if(d.type==='ice'){
      const spike=k.bone(back,side*.251,.330,-.191);
      for(let i=0;i<(mobile?4:6);i++){
        const t=i/5,x=.071+t*.196,y=.206-t*.164,z=-.03-t*.077;
        cast(k,spike,i%2?'poleBone':'poleSteel',p([[x,y,z,.072,.104],[x+.066,y+.177,z-.118,.106,.079],
          [x+.171,y+.278,z-.167,.063,.064],[x+.263,y+.464-t*.03,z-.346,.003,.004]]),mobile,i+168);
      }
      flaps.push({joint:spike,axis:'x',amp:.096,bias:-.082,seed:side*1.50});
    }
    if(d.type==='star'){
      const trail=k.bone(back,side*.113,.319,-.249);
      for(let i=0;i<3;i++){
        const y=.42-i*.141,path=p([[.034,y,.014],[.309+i*.077,y+.101,-.097],
          [.583+i*.035,y-.17,-.348]]);
        k.geometry(trail,i%2?'poleSteel':'poleCloth',featherVane(...path,.131,i+155,mobile?9:14));
        line(k,trail,'poleTrim',path.map(([x,y,z],j)=>[x,y+.022,z-.012,j===2?.003:.016]));
      }
      flaps.push({joint:trail,axis:'z',amp:.18,bias:side*.08,seed:side*.76});
    }
  }
  const centerpiece=k.bone(back,0,.424,-.438);
  if(d.type==='dance'){
    ring(k,centerpiece,'poleTrim',.487,.047);
    ring(k,centerpiece,'poleSteel',.425,.027);
    for(let i=0;i<(mobile?8:10);i++){
      const jewel=k.bone(centerpiece,0,0,-.022);
      jewel.rotation.z=i*Math.PI*2/(mobile?8:10);
      line(k,jewel,'poleTrim',[[0,.402,.013,.015],[.051,.482,-.018,.024],[.028,.569,-.034,.011]]);
      gem(k,jewel,'poleGlow',[.028,.573,-.032],[.019,.031,.018]);
    }
    const damaru=k.bone(centerpiece,0,-.09,-.042);
    damaru.rotation.z=.55;
    cast(k,damaru,'poleCloth',[[0,-.163,0,.124,.098],[0,-.049,0,.064,.054],[0,.037,0,.073,.053],
      [0,.148,0,.121,.098]],mobile,270);
    for(const s of sides){
      const end=k.bone(damaru,0,s*.151,0);
      end.rotateX(Math.PI/2);
      ring(k,end,'poleTrim',.112,.024);
    }
  }else if(d.type==='star'){
    centerpiece.rotation.z=.91;
    ring(k,centerpiece,'poleShadow',.409,.054,Math.PI*1.71);
    ring(k,centerpiece,'poleTrim',.442,.027,Math.PI*1.71);
    for(let i=0;i<5;i++){
      const theta=i*.92+.28;
      gem(k,centerpiece,'poleGlow',[Math.cos(theta)*.442,Math.sin(theta)*.442,-.036],[.026,.032,.024]);
    }
  }else{
    const spine=[[-.155,.213,.032],[.162,.214,.033],[.201,.051,-.157],[.111,-.283,-.230],
      [-.094,-.286,-.224],[-.208,.059,-.150]];
    plate(k,centerpiece,'poleSteel',spine,.092);
    line(k,centerpiece,'poleTrim',spine.map(([x,y,z])=>[x,y,z-.047,.026]));
    line(k,centerpiece,'poleGlow',[[-.102,.095,-.065],[.003,.147,-.069],[.107,.093,-.077],[.003,-.181,-.243]]
      .map(point=>[...point,.019]));
  }
  flaps.push({joint:centerpiece,axis:'z',amp:d.type==='dance'?.23:.074,bias:.04,seed:3.86});
}

function polearm(k,weapon,grip,d){
  const hand=k.bone(grip,.018,-.039,.101),model=forge(weapon);
  model.position.set(0,.309,.034);
  model.scale.setScalar(d.scale);
  model.updateMatrix();
  const tip=new T.Vector3(...d.tip).applyMatrix4(model.matrix);
  const base=new T.Vector3(0,-.65*d.scale,.034);
  for(const [name,mat] of Object.entries(model.userData.finishes))k.materials['poleForged'+name]=mat;
  hand.add(model);
  markEnemyWeapon(hand,tip.toArray(),{from:base.toArray(),width:d.type==='ice'?.18:.22});
  const flare=k.bone(hand,...tip.toArray());
  const geometry=new T.TorusGeometry(.143,.014,6,22,Math.PI*1.46);
  geometry.rotateX(Math.PI/2);
  k.geometry(flare,'poleEffect',geometry);
  gem(k,flare,'poleEffect',[0,.018,0],[.028,.094,.031]);
  flare.visible=false;
  return {model,flare};
}

function lowerArmor(k,model,design,mobile){
  const [,rise]=design.dimensions;
  for(const [index,hip] of model.legs.entries()){
    const p=path=>mirror(sides[index],path);
    const shin=model.campaign.flaps.find(({joint})=>joint.parent===hip).joint;
    const heft=design.type==='ice'?1.15:design.type==='star'?1.02:.93;
    cast(k,shin,'poleShadow',p([[.013,-rise*.337,.044,.101*heft,.086],
      [.016,-rise*.422,.132,.132*heft,.082],[.025,-rise*.463,.247,.168*heft,.058],
      [.017,-rise*.495,.354,.113*heft,.038]]),mobile,871+index);
    const sole=p([[-.117*heft,-rise*.456,.214],[.015,-rise*.426,.220],[.124*heft,-rise*.445,.223],
      [.117*heft,-rise*.497,.349],[.016,-rise*.523,.388],[-.104*heft,-rise*.498,.339]]);
    plate(k,shin,'poleSteel',sole,.044);
    line(k,shin,'poleTrim',sole.slice(1,6).map(([x,y,z])=>[x,y+.013,z,.013]));
    for(let i=0;i<3;i++){
      const y=.072-i*.121;
      const scute=p([[-.092*heft,y+.028,.104],[.043,y+.067,.096],[.136*heft,y+.022,.043],
        [.091*heft,y-.088,.097],[.036,y-.120,.164],[-.084*heft,y-.071,.164]]);
      plate(k,shin,i%2?'poleShadow':'poleSteel',scute,.045);
      line(k,shin,'poleTrim',scute.slice(1,5).map(([x,y,z])=>[x,y+.011,z+.018,.011]));
    }
  }
}

const visages={star:starHelmet,dance:dancerFace,ice:iceFace};

export function sculptPolearmRelic(k,weapon,mobile,fighter){
  const design=designs[weapon.id];
  if(!design)return null;
  materials(k,design);
  const [broad,ground,neck,armLength]=design.dimensions;
  let gear;
  const model=fighter(k,{broad,ground,neck,armLength,style:'ritual',
    finish:'poleCloth',mobile,portrait(k,head){return visages[design.type](k,head,mobile);},
    weapon(k,body,back,head,grips,flaps){
      armorKit(k,body,back,grips,flaps,design,mobile);
      gear=polearm(k,weapon,grips[1],design);
    },
  });
  lowerArmor(k,model,design,mobile);
  if(design.type==='ice')model.pattern='slam';
  model.polearmRelic=design.type;
  model.polearm=gear.model;
  model.polishEnergy={shape:design.theme,tint:design.light,anchor:model.body,
    offset:[0,.412,-.173],span:[broad+.47,neck*.94,.65]};
  model.campaign.poseDrives=(_drives,time,{wind,strike})=>{
    const activity=.22*wind+.92*strike**2;
    gear.flare.visible=activity>.09;
    gear.flare.rotation.y=time*3.15;
    gear.flare.scale.set(.60+activity,.56+strike*.83,.60+activity);
    k.materials.poleEffect.opacity=.71*activity;
  };
  model.relicDress=tools=>{
    const [steel,shadow,cloth,trim]=design.colors;
    for(const side of sides)for(let row=0;row<3;row++){
      const long=design.type==='dance'?1.22:design.type==='ice'?.97:1.34;
      const x=.048+row*.105,z=-.16+row*.142,w=.096+row*.017;
      tools.silk(model.body,weapon.guardian.name+' · 分襟',mirror(side,[
        [x,.25,z,w*.61],[x+.052,.044,z-.025,w],[x+.103,-long*.30,z-.174,w*.93],
        [x+.137,-long*.71,z-.261,w*.72],[x+.197,-long,z-.432,.01],
      ]),{tint:row===0?steel:cloth,trim,lining:shadow,style:'woven',
        phase:side*.69+row*.87,flex:design.type==='dance'?1.58:1.19});
    }
    return true;
  };
  return model;
}
