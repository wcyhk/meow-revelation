import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?11:17,rings:mobile?14:21,section:2.36,ridge:.20,seed,
}));
const line=(k,j,m,path,n=12)=>k.sculpt.sweep(j,m,path,{steps:n,sides:7,ridge:.22});
const plate=(k,j,m,path,depth=.055)=>k.sculpt.plate(j,m,path,depth,.017);

const champions={
  'oni-bow':{name:'夜紗追契者',ritual:'bow',tones:[0x3d3b38,0x455c64,0x978c73,0x4b5262],glow:0xb6d7f7},
  'zhurong-axe':{name:'薪火追契者',ritual:'axe',tones:[0x442a2a,0x8a4631,0xc38356,0x652d42],glow:0xff9956},
  airavata:{name:'照誓追契者',tones:[0x657271,0x586564,0xa6a591,0x39606b],glow:0xc1e8bd},
};

function surfaces(k,tone){
  for(const [i,key] of ['mythHide','mythShell','mythIvory','mythCloth'].entries()){
    const metal=i===1||i===2;
    k.materials[key]=paintedFinish(new T.MeshStandardMaterial({color:tone[i],vertexColors:true,
      roughness:metal?.53:.78,metalness:metal?.50:.11,
      envMap:forgeEnvironment(),envMapIntensity:metal?.67:.24}),['hide','iron','bone','cloth'][i],true,true);
  }
}

function elephant(k,s,mobile){
  const body=k.bone(k.root,0,.90,0),head=k.bone(body,0,.138,.918);
  body.name='照誓追契者 · 雲象軀';
  head.name='照誓追契者 · 鑽鼻骨面';
  cast(k,body,'mythHide',[[0,-.022,-1.019,.275,.356],[0,.072,-.726,.433,.534],[0,.042,-.302,.52,.563],
    [0,.079,.108,.516,.525],[0,.127,.53,.386,.432],[0,.225,.76,.264,.301]],mobile,5.3);
  cast(k,head,'mythHide',[[0,-.138,.371,.213,.243],[0,-.052,.207,.344,.323],[0,.104,.052,.386,.356],
    [0,.238,-.176,.340,.301],[0,.316,-.301,.219,.204]],mobile,9);
  const trunk=[],flaps=[],legs=[];
  let parent=head;
  for(let i=0;i<6;i++){
    const r=.152-i*.019,segment=k.bone(parent,0,i?-.161:-.142,i?.087:.348);
    segment.name='照誓追契者 · 象鼻節 '+(i+1);
    cast(k,segment,'mythHide',[[0,.042,-.058,r,r*.89],[0,-.039,.034,r*1.03,r*.94],
      [0,-.128,.084,r*.96,r*.91],[0,-.204,.133,r*.85,r*.78]],mobile,i*.85);
    line(k,segment,i%2?'mythShell':'mythIvory',[[-r*.79,-.059,.100,.012],[-r*.25,-.073,.146,.015],
      [r*.31,-.092,.135,.015],[r*.87,-.103,.101,.004]],11);
    trunk.push(segment);parent=segment;
  }
  for(const side of sides){
    const f=shape=>mirror(side,shape),ear=k.bone(head,side*.294,.164,-.072);
    const outline=f([[.047,.042,.114],[.258,.223,.034],[.531,.095,-.082],[.516,-.226,-.145],
      [.387,-.458,-.168],[.179,-.476,-.090],[.103,-.247,.011]]);
    plate(k,ear,'mythShell',outline,.056);
    plate(k,ear,'mythHide',outline.map(([x,y,z])=>[x*.90,y*.91,z+.036]),.024);
    for(let i=0;i<5;i++){
      const t=i*.12;
      line(k,ear,i%2?'mythIvory':'mythShell',f([[.053,-.022-t*.32,.131,.012],[.24,-.040-t*.55,.117,.022],
        [.40,-.113-t*.65,.04,.015],[.424,-.193-t*.68,-.057,.003]]),13);
    }
    flaps.push({ear,side});
    k.mesh(head,'gem','glow',side*.262,.122,.279,.059,.031,.035,0,side*.42,.18);
    for(let tooth=0;tooth<3;tooth++){
      const sft=tooth*.079,r=.098-tooth*.021,x=.237+sft;
      const toothPath=f([[x,-.185-sft,.224,r,r*.92],[x+.058,-.215-sft,.408,r*.94,r*.82],
        [x+.127,-.171-sft,.615,r*.64,r*.52],[x+.15,-.018-sft,.741,r*.33,r*.27],
        [x+.129,.113-sft,.837,.006,.006]]);
      cast(k,head,'mythIvory',toothPath,mobile,tooth*3.4+side);
    }
    for(let n=0;n<4;n++){
      const z=-.44+n*.272;
      const ribs=f([[.034,.44,z+.075],[.259,.467,z],[.489,.294,z-.091],
        [.520,.043,z-.137],[.366,-.127,z-.085],[.198,.118,z+.088]]);
      plate(k,body,n%2?'mythCloth':'mythShell',ribs,.058);
      line(k,body,'mythIvory',ribs.slice(1,6).map(([x,y,z],i)=>[x,y+.024,z+.027,[.014,.023,.029,.020,.005][i]]));
    }
    for(const [n,z] of [-.69,.557].entries()){
      const upper=k.bone(body,side*.338,-.094,z),foot=k.bone(upper,side*.034,-.435,n?.125:-.103);
      upper.name='照誓追契者 · 承重腿 '+side+' '+n;
      legs.push({upper,foot,side,n});
      cast(k,upper,'mythHide',f([[0,.189,-.067,.188,.207],[.037,-.029,-.047,.220,.216],
        [.063,-.254,.055,.174,.152],[.049,-.467,.12,.133,.135]]),mobile);
      cast(k,foot,'mythHide',f([[.023,.064,.025,.133,.144],[.039,-.141,.016,.149,.148],
        [.043,-.336,.051,.182,.160],[.042,-.405,.126,.173,.169]]),mobile);
      for(let toe=0;toe<4;toe++){
        const x=-.095+toe*.065,z=.166+Math.sin(toe*.78)*.017;
        const p=[[x,-.312,z,.032],[x+.002,-.374,z+.08,.047],[x+.013,-.398,z+.138,.027]];
        line(k,foot,'mythIvory',p,9);
      }
    }
  }
  const crown=k.bone(body,0,.486,-.073);
  for(let tier=0;tier<3;tier++){
    const x=.43-tier*.105,h=tier*.16,w=x*.73;
    for(const side of sides){
      const cap=mirror(side,[[0,h+.17,-.119],[w*.69,h+.119,-.173],[x,h+.054,-.226],
        [x*.88,h-.019,.014],[w*.37,h-.018,.155],[0,h+.041,.156]]);
      plate(k,crown,'mythShell',cap,.055);
      line(k,crown,'mythIvory',cap.slice(1).map(([x,y,z])=>[x,y+.021,z,.019]));
    }
  }
  k.mesh(crown,'gem','glow',0,.62,-.083,.074,.112,.067);
  const model={body,head,legs:legs.map(({upper})=>upper),crest:k.bone(body,0,.40,-.09),pattern:'gallop',
    catalogueSculpt:'relic-airavata',mythRelic:true,
    polishEnergy:{tint:s.glow,shape:'sigils',anchor:body,offset:[0,.38,.04],span:[.86,.63,1.15]},
    cataloguePose({beat,step,travel,wind,strike,stage}){
      for(const [i,joint] of trunk.entries()){
        joint.rotation.x=-.09+Math.sin(beat*.56-i*.37)*.115-wind*.12+strike*.25;
        joint.rotation.y=Math.cos(beat*.43-i*.34)*(.104+travel*.06);
      }
      for(const {ear,side} of flaps)ear.rotation.y=side*(.21+Math.sin(beat*.61+side)*.17+strike*.38-stage*.09);
      for(const {upper,foot,side,n} of legs){
        const cycle=Math.sin(step+side*1.4+n*1.8)*travel;
        upper.rotation.x=cycle*.49+wind*.09-strike*.08;
        foot.rotation.x=Math.max(0,-cycle)*.86-wind*.07+strike*.13;
      }
      head.rotation.x=-wind*.16+strike*.14;
      crown.rotation.z=Math.sin(beat*.74)*travel*.11+strike*.13;
    }};
  return model;
}

function championHead(k,head,bow,mobile){
  const w=bow?.234:.238;
  cast(k,head,'mythHide',[[0,-.201,.169,w*.54,.112],[0,-.065,.074,w*.91,.158],
    [0,.128,-.039,w,.184],[0,.275,-.10,w*.85,.171],[0,.36,-.17,w*.45,.09]],mobile,4.5);
  for(const side of sides){
    const path=mirror(side,[[.036,.176,.315],[.169,.168,.242],[.246,.069,.148],[.220,-.154,.163],
      [.167,-.259,.23],[.047,-.182,.338]]);
    plate(k,head,'mythShell',path,.056);
    line(k,head,'mythIvory',path.slice(1,5).map(([x,y,z])=>[x,y+.019,z+.031,.017]));
    line(k,head,'glow',mirror(side,[[.026,.074,.352,.008],[.121,.084,.317,.018],[.166,.097,.271,.004]]));
    const length=bow?(side===-1?.35:.64):.56;
    line(k,head,'mythIvory',mirror(side,[[.143,.237,-.041,.069],[.229,.373,-.135,.077],
      [.276,length,-.264,.049],[.248,length+.14,-.375,bow&&side===-1?.029:.005]]),17);
  }
}

function championWeapon(k,hand,bow){
  if(bow){
    const rim=k.bone(hand,.015,.08,.151);
    markEnemyWeapon(rim,[0,.051,1.02],{from:[0,0,.02],width:.19,kind:'bow'});
    for(const side of sides){
      const wing=[[.02,0,.038,.059],[.145,side*.276,.073,.076],[.176,side*.561,.108,.060],
        [.086,side*.754,.189,.035],[.034,side*.838,.244,.004]];
      line(k,rim,'mythShell',wing,17);
      line(k,rim,'mythIvory',wing.map(([x,y,z,r])=>[x+.022,y,z+.038,r*.35]));
      line(k,rim,'glow',[[.034,side*.828,.236,.006],[0,side*.386,.157,.008],[0,0,-.08,.011]],12);
    }
  }else{
    markEnemyWeapon(hand,[.429,1.457,.121],{from:[0,-.32,.033],width:.27});
    line(k,hand,'mythHide',[[0,-.71,-.05,.044],[0,-.26,.031,.055],[.03,.18,.066,.053],
      [.051,.716,.089,.063],[.062,1.083,.139,.059]],18);
    const jaw=[[-.06,.841,.147],[.113,.873,.15],[.368,.957,.19],[.488,1.212,.128],
      [.432,1.466,.117],[.216,1.337,.167],[.071,1.239,.209],[-.066,1.140,.214]];
    plate(k,hand,'mythShell',jaw,.095);
    plate(k,hand,'mythIvory',jaw.map(([x,y,z])=>[x*.94,y-.01,z+.047]),.027);
    line(k,hand,'glow',jaw.slice(2,6).map(([x,y,z],i)=>[x*.85,y-.016,z+.077,[.012,.022,.023,.005][i]]),16);
  }
}

export function mythRelicHunter(k,weapon,mobile,fighter){
  const config=champions[weapon.id];
  if(!config)return null;
  surfaces(k,config.tones);
  if(!config.ritual)return elephant(k,config,mobile);
  const bow=config.ritual==='bow',[dark,,rim,cloth]=config.tones;
  const model=fighter(k,{broad:bow?.53:.6,ground:bow?.99:1.08,neck:bow?.74:.79,style:'heavy',armLength:.81,mobile,
    finish:'mythHide',portrait(k,head){championHead(k,head,bow,mobile);},
    weapon(k,body,back,head,grips,flaps){
      championWeapon(k,grips[1],bow);
      for(const side of sides)for(let i=0;i<4;i++){
        const n=i*.105,y=.46-n,x=.15+n*.24;
        const fin=k.bone(back,side*x,y,-.089-n*.2);
        const taper=mirror(side,[[.01,.061,-.076,.063,.079],[.106,.175,-.164,.107,.076],
          [.231,.321,-.303,.082,.049],[.293,.416,-.423,.041,.025],[.34,.476,-.501,.004,.005]]);
        cast(k,fin,i%2?'mythIvory':'mythShell',taper,mobile,side*i);
        line(k,fin,'glow',taper.map(([x,y,z,r])=>[x,y+.038,z+.024,r*.28]));
        flaps.push({joint:fin,axis:'y',amp:.151+i*.037,bias:side*.09,seed:i*.84+side});
      }
    }});
  model.polishEnergy={tint:config.glow,shape:bow?'bolts':'embers',anchor:model.body,offset:[0,.45,-.126],span:[.99,.81,.94]};
  model.relicDress=tools=>{
    for(const side of sides)for(let index=0;index<3;index++){
      const x=.075+index*.16,z=.151-index*.166,w=.109+index*.015,d=(bow?.74:.94)*(1+index*.11);
      tools.silk(model.body,config.name+' · 戰甲下襟 '+side+' '+(index+1),mirror(side,[
        [x,.26,z,w*.67],[x+.049,.058,z-.078,w],[x+.117,-d*.34,z-.145,w*.87],
        [x+.171,-d*.72,z-.287,w*.70],[x+.237,-d,z-.431,w*.19],
      ]),{style:'woven',tint:cloth,trim:rim,lining:dark,phase:index*.81+side*.61,flex:1.15+index*.15});
    }
    return true;
  };
  return model;
}
