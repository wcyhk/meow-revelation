import * as T from '../three.min.mjs';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2,sides=[-1,1];
const mirror=(s,p)=>p.map(([x,...rest])=>[s*x,...rest]);
const cast=(k,j,m,path,mobile,seed=0)=>k.geometry(j,m,sculptVolume(path,{
  sides:mobile?10:16,rings:mobile?14:21,section:2.42,ridge:.20,seed,
}));
const vein=(k,j,m,path,steps=13)=>k.sculpt.sweep(j,m,path,{steps,sides:7,ridge:.20});
const panel=(k,j,m,p,depth=.047)=>k.sculpt.plate(j,m,p,depth,.014);

const styles={
  'wave-wheel':{kind:'water',name:'逆輪匠',size:[.48,1.05,.78],face:[.235,.32,.25],
    palette:[0x233a42,0x5c827e,0xb6a582,0x38565d],aura:0x7fe1d8,shape:'ribbons',cloth:.80},
  'kali-wheel':{kind:'altar',name:'黑壇卡里',size:[.36,1.17,.89],face:[.204,.30,.25],
    palette:[0x241e25,0x4e3451,0xb37e63,0x542544],aura:0xd783c6,shape:'sigils',cloth:1.18},
  'thunder-sword':{kind:'thunder',name:'截雲劍師',size:[.31,1.21,.89],face:[.19,.34,.19],
    palette:[0x232f45,0x466684,0xa8c0cc,0x364c6c],aura:0x8fe0ff,shape:'bolts',cloth:1.12},
  'blood-sword':{kind:'blood',name:'血池劍鬼',size:[.34,1.10,.96],face:[.178,.252,.21],
    palette:[0x2d2427,0x67333c,0xca8b78,0x612f4f],aura:0xff607f,shape:'ribbons',cloth:1.30},
  'dragon-kukri':{kind:'flame',name:'赤面龍刀客',size:[.47,.99,.82],face:[.229,.302,.28],
    palette:[0x301e22,0x7a4535,0xb2906d,0x633635],aura:0xff9a62,shape:'embers',cloth:.94},
};

function surfaces(k,palette){
  for(const [i,id] of ['duelDark','duelSteel','duelTrim','duelCloth'].entries()){
    const alloy=i===1||i===2,name=['hide','iron','bronze','cloth'][i];
    k.materials[id]=paintedFinish(new T.MeshStandardMaterial({color:palette[i],vertexColors:true,
      envMap:forgeEnvironment(),envMapIntensity:alloy?.70:.25,metalness:alloy?.63:.10,roughness:alloy?.43:.71}),name,true,true);
  }
}

function portrait(k,head,s,mobile){
  const [w,z,height]=s.face;
  head.name=s.name+' · 額面';
  cast(k,head,'duelDark',[[0,-height,.137,w*.59,.109],[0,-.083,.078,w*.96,.161],
    [0,.111,-.031,w,.178],[0,.261,-.095,w*.81,.152],[0,.353,-.178,w*.40,.073]],mobile);
  const narrow=s.kind==='blood',dragon=s.kind==='flame';
  for(const side of sides){
    const mask=mirror(side,[[.025,.149,z],[w*.70,.185,z-.061],[w*1.11,.046,z-.172],[w*1.03,-.098,z-.152],
      [w*.76,-height*.81,z-.027],[.059,-height,z+.053],[.029,-.063,z+.030]]);
    panel(k,head,narrow?'duelTrim':'duelSteel',mask,.053);
    vein(k,head,'duelTrim',mask.slice(1,6).map(([x,y,d],i)=>[x,y+.026,d+.027,[.017,.028,.020,.015,.004][i]]));
    vein(k,head,'glow',mirror(side,[[.042,.071,z+.061,.0088],[w*.51,.078,z+.034,.016],
      [w*.83,.095,z-.035,.008],[w*.97,.092,z-.071,.003]]));
    if(dragon||s.kind==='altar'){
      const horn=mirror(side,[[w*.62,.209,-.065,.056,.050],[w*1.17,.247,-.19,.072,.055],
        [w*1.42,.423,-.287,.052,.041],[w*1.53,.554,-.432,.004,.005]]);
      cast(k,head,'duelTrim',horn,mobile,side*5.2);
      vein(k,head,'glow',horn.map(([x,y,z,r])=>[x,y+.020,z+.028,r*.30]));
    }else{
      for(let row=0;row<3;row++){
        const y=.21-row*.091,j=w*(.92+row*.084);
        vein(k,head,row%2?'duelCloth':'duelSteel',mirror(side,[[j*.79,y,-.087,.039],[j*1.21,y-.075,-.213,.051],
          [j*1.12,y-.213,-.327,.032],[j*.99,y-.342,-.405,.003]]),16);
      }
    }
  }
}

function handWheel(k,hand,kind,tracks){
  const drum=k.bone(hand,.069,.132,.166),altar=kind==='altar';
  const r=altar?.337:.387;
  markEnemyWeapon(drum,[0,r,.025],{from:[0,-r,.03],width:r*.94,aim:false,kind:'ring'});
  for(const [i,z] of [.035,-.062,-.124].entries())
    k.mesh(drum,'ring',i?'duelSteel':'duelTrim',0,0,z,r-i*.036,r-i*.039,.84);
  for(let i=0;i<(altar?8:11);i++){
    const a=i*tau/(altar?8:11),s=Math.sin(a),c=Math.cos(a);
    const joint=k.bone(drum,s*r*.91,c*r*.90,0);
    joint.rotation.z=-a;
    panel(k,joint,i%3?'duelTrim':'duelSteel',[[-.029,.083,.014],[.035,.053,.026],[.058,.003,.062],
      [.038,-.023,.081],[-.074,-.016,.028],[-.049,.049,.018]],.043);
    k.mesh(joint,'gem','glow',0,.021,.058,.014,.029,.02);
  }
  tracks.push({joint:drum,speed:altar?-1.6:2.2});
}

function handBlade(k,part,s){
  const dragon=s.kind==='flame',blood=s.kind==='blood',reach=dragon?1.188:blood?1.47:1.37;
  const outline=dragon?[[0,.188,.153],[.132,.309,.169],[.293,.571,.139],[.336,.866,.172],
    [.318,1.24,.113],[.149,1.103,.082],[.039,.911,.115],[-.113,.634,.151],[-.164,.387,.186]]:
    [[-.059,.269,.063],[.130,.312,.079],[.157,.672,.101],[.119,1.226,.136],
      [.093,reach+.191,.101],[.016,reach*.94,.118],[-.109,1.161,.106],[-.119,.579,.109]];
  markEnemyWeapon(part,dragon?[.32,1.24,.11]:[.093,reach+.19,.10],{from:[0,-.37,.043],width:dragon?.21:.142});
  vein(k,part,'duelDark',[[0,-.47,-.031,.033],[0,-.191,.015,.046],[.014,.054,.056,.060],
    [.019,.241,.109,.053]],15);
  panel(k,part,'duelDark',outline,.077);
  panel(k,part,'duelSteel',outline.map(([x,y,z])=>[x*.91,y-.012,z+.044]),.032);
  vein(k,part,'glow',outline.slice(1,6).map(([x,y,z],i)=>[x*.79,y-.022,z+.074,[.004,.014,.027,.022,.003][i]]));
  for(const side of sides){
    vein(k,part,'duelTrim',mirror(side,[[.021,.229,.118,.032],[.138,.255,.167,.062],
      [.189,.216,.209,.045],[.222,.242,.241,.006]]),12);
    for(let n=0;n<4;n++){
      const t=n*.11,y=.397+t;
      vein(k,part,'duelTrim',mirror(side,[[.021,y,.155,.012],[.073,y+.057,dragon?.213:.165,.024],
        [.105,y+.081,.183,.004]]),8);
    }
  }
}

function rearMark(k,body,back,s,mobile,flaps){
  const kind=s.kind;
  for(const side of sides){
    const form=k.bone(back,side*.177,.381,-.11);
    form.name=s.name+' · 側背法甲';
    const silhouette=kind==='water'?[[0,.101,-.043,.056,.059],[.146,.071,-.155,.083,.068],
      [.312,-.018,-.275,.096,.061],[.378,-.263,-.390,.066,.049],[.279,-.394,-.445,.006,.005]]:
      kind==='altar'?[[0,.035,.018,.047,.048],[.232,.114,-.059,.062,.065],
        [.419,.314,-.237,.073,.042],[.514,.613,-.401,.037,.027],[.579,.684,-.556,.005,.006]]:
        kind==='thunder'?[[0,.121,-.018,.053,.052],[.147,.263,-.093,.087,.078],[.271,.465,-.226,.064,.051],
          [.341,.622,-.372,.039,.029],[.266,.781,-.491,.004,.005]]:
          kind==='blood'?[[0,.081,-.018,.041,.042],[.137,.079,-.187,.068,.046],
            [.246,-.117,-.328,.053,.035],[.381,-.348,-.467,.038,.022],[.451,-.542,-.537,.003,.004]]:
            [[0,.095,-.053,.076,.069],[.163,.203,-.181,.106,.085],[.301,.298,-.285,.075,.069],
              [.396,.374,-.409,.043,.035],[.415,.535,-.561,.005,.006]];
    const path=mirror(side,silhouette);
    cast(k,form,'duelSteel',path,mobile,side*5.2);
    vein(k,form,'duelTrim',path.map(([x,y,z,r])=>[x,y+.029,z+.022,r*.38]));
    flaps.push({joint:form,axis:'y',amp:.17,bias:side*.074,seed:5.6+side});
    for(let row=0;row<3;row++){
      const y=.581-row*.164,w=(s.size[0]+.02)*(1-.108*row);
      const armor=mirror(side,[[.045,y+.086,.228],[w*.61,y+.11,.181],[w,y+.028,.109],[w*1.13,y-.131,-.070],
        [w*.74,y-.168,-.23],[.055,y-.077,-.257]]);
      panel(k,body,row%2?'duelSteel':'duelDark',armor,.055);
      vein(k,body,'duelTrim',armor.slice(1).map(([x,y,z],i)=>[x,y+.020,z+side*.019,[.014,.020,.020,.016,.005][i]]));
    }
  }
}

export function duelRelicHunter(k,weapon,mobile,fighter){
  const spec=styles[weapon.id];
  if(!spec)return null;
  surfaces(k,spec.palette);
  const {size:[broad,ground,neck],kind,cloth,shape,aura,palette:[dark,,trim,dye]}=spec,tracks=[];
  const actor=fighter(k,{broad,ground,neck,style:kind==='water'?'heavy':'duel',mobile,armLength:.75,finish:'duelCloth',
    portrait(k,head){portrait(k,head,spec,mobile);},
    weapon(k,body,back,head,hands,flaps){
      rearMark(k,body,back,spec,mobile,flaps);
      if(kind==='water'||kind==='altar'){
        handWheel(k,hands[1],kind,tracks);
        if(kind==='altar')handWheel(k,hands[0],kind,tracks);
      }else handBlade(k,hands[1],spec);
    }});
  actor.cataloguePose=({headtime,wind,strike,stage})=>{
    for(const {joint,speed} of tracks)joint.rotation.z=headtime*speed+wind*.20+strike*.79+stage*.33;
  };
  actor.polishEnergy={tint:aura,shape,anchor:actor.body,offset:[0,.47,-.07],span:[.9,.96,.81]};
  actor.relicDress=tools=>{
    for(const side of sides)for(let n=0;n<3;n++){
      const x=.074+n*.103,z=.22-n*.20,d=cloth*(1+n*.11);
      tools.silk(actor.body,spec.name+' · 衣甲下擺 '+side+' '+(n+1),mirror(side,[
        [x,.281,z,.063],[x+.055,.091,z-.068,.118],[x+.119,-d*.32,z-.134,.132],
        [x+.173,-d*.69,z-.279,.109],[x+.294,-d,z-.467,.031],
      ]),{style:'woven',tint:dye,trim,lining:dark,phase:side*.64+n*.83,flex:1.17+n*.14});
    }
    return true;
  };
  return actor;
}
