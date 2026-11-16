import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

export const iceRebirthFinishes={
  rebirthMarrow:[0xa5765d,.10,.68,'hide'],rebirthSinew:[0x674136,.08,.74,'hide'],
  rebirthIce:[0x477d89,.43,.47,'gem'],rebirthBone:[0xb1a69a,.33,.55,'bone'],
  rebirthSteel:[0x405362,.73,.49,'iron'],rebirthCopper:[0x845c43,.67,.46,'bronze'],
};
const sides=[-1,1];
const flip=(s,shape)=>shape.map(([x,...rest])=>[s*x,...rest]);

export function carveIceRebirth(k,entry,mobile){
  const {root,bone,mesh,geometry,sculpt}=k;
  const body=bone(root,0,1.37,0),head=bone(body,0,.867,.17),jaw=bone(head,0,-.114,.06);
  const heart=bone(body,0,.35,.308);
  heart.name='冰雪神 · 凝霜心核';
  const arms=[],legs=[],limbs=[],shins=[],ribs=[];
  const volume=(joint,finish,path,seed=0)=>geometry(joint,finish,sculptVolume(path,{
    rings:mobile?13:21,sides:mobile?11:16,section:2.42,seed,ridge:.20,
  }));
  const line=(joint,finish,path,steps=13)=>sculpt.sweep(joint,finish,path,{steps,sides:7,ridge:.21});
  const plate=(joint,finish,points,t=.057)=>sculpt.plate(joint,finish,points,t,.019);
  volume(body,'deep',[[0,-.367,-.042,.266,.221],[0,-.112,-.017,.376,.304],[0,.161,-.006,.449,.342],
    [0,.414,-.055,.469,.356],[0,.657,-.041,.395,.281],[0,.811,.033,.187,.162]]);
  volume(heart,'rebirthIce',[[0,-.259,-.013,.091,.069],[0,-.131,.027,.151,.119],
    [0,.025,.062,.165,.135],[0,.168,.040,.140,.105],[0,.291,.013,.048,.039]],9);
  mesh(heart,'gem','glow',0,.027,.171,.083,.168,.037,.02,.37,-.07);
  volume(head,'rebirthSinew',[[0,-.204,.083,.133,.144],[0,-.109,.098,.227,.200],[0,.112,.035,.263,.245],
    [.026,.271,-.057,.212,.193],[.037,.35,-.107,.112,.116]],1.68);
  volume(jaw,'deep',[[0,-.134,.013,.115,.075],[0,-.099,.131,.172,.11],
    [0,-.059,.152,.181,.161],[0,.014,.127,.156,.135]]);
  for(const side of sides){
    const p=shape=>flip(side,shape);
    const mask=p([[.024,.194,.24],[.112,.231,.228],[.239,.218,.119],[.281,.076,.098],
      [.228,-.074,.16],[.124,-.167,.251],[.05,-.134,.293],[.112,-.016,.273]]);
    plate(head,'rebirthBone',mask,.039);
    line(head,'rebirthCopper',mask.slice(1,6).map(([x,y,z],i)=>[x+side*.017,y,z+.018,[.024,.035,.033,.016,.006][i]]));
    line(head,'glow',p([[.050,.081,.281,.007],[.114,.106,.289,.014],[.173,.099,.236,.018],[.217,.076,.205,.004]]));
    volume(head,side===1?'rebirthIce':'rebirthBone',p([[.12,.171,.021,.064,.05],[.212,.282,-.062,.085,.074],
      [.330,.406,-.172,.069,.055],[.380,.574,-.212,.040,.035],[.348,.697,-.267,.006,.005]]),8+side);
    for(let tooth=0;tooth<3;tooth++){
      const x=.054+.048*tooth;
      line(jaw,'rebirthBone',p([[x,-.087,.232-tooth*.036,.021],[x+.012,-.04,.255-tooth*.033,.030],
        [x+.007,.022-tooth*.014,.246-tooth*.037,.004]]),10);
    }
    for(let i=0;i<5;i++){
      const y=.612-i*.149;
      const rib=bone(body,side*(.143+i*.012),y,-.037-i*.013);
      rib.name='冰雪神 · 裂胸骨 '+(i+1);
      volume(rib,'rebirthSteel',p([[.008,.019,.194,.073,.068],[.123,.064,.216,.106,.097],
        [.26,.016,.158,.092,.086],[.31,-.081,.039,.075,.060],[.236,-.147,-.221,.040,.043],
        [.109,-.091,-.398,.005,.008]]),4+i);
      line(rib,i%3?'rebirthBone':'rebirthCopper',p([[.014,.020,.297,.027],[.113,.086,.30,.044],
        [.227,.073,.24,.038],[.305,-.016,.125,.029],[.336,-.105,-.107,.019],[.195,-.143,-.322,.005]]));
      plate(rib,i%2?'rebirthIce':'rebirthCopper',p([[.087,.042,-.236],[.171,.100,-.282],
        [.268,.081,-.348],[.299,-.014,-.426],[.171,-.119,-.482],[.058,-.087,-.311]]),.047);
      ribs.push({rib,side,i});
    }
    const shoulder=bone(body,side*.476,.548,.018),forearm=bone(shoulder,side*.126,-.473,.071);
    const fist=bone(forearm,side*.048,-.407,.095);
    arms.push(shoulder);limbs.push({forearm,side});
    volume(shoulder,'rebirthMarrow',p([[.126,-.493,.103,.138,.151],[.154,-.282,.071,.211,.205],
      [.108,-.067,.026,.243,.231],[.028,.152,-.037,.177,.175]]),2.36+side);
    volume(forearm,'rebirthSteel',p([[.04,-.443,.085,.112,.115],[.099,-.293,.041,.152,.166],
      [.104,-.126,.031,.182,.197],[.026,.048,.031,.135,.127]]),4.1+side);
    volume(fist,'rebirthSinew',p([[.008,-.139,.055,.089,.103],[.024,-.04,.053,.142,.135],[.029,.092,.014,.105,.099]]),6.1+side);
    for(let i=0;i<(side===1?3:4);i++){
      const z=.176-i*.106,high=.267-i*.046,span=side===1?.293:.412;
      plate(shoulder,side===1?'rebirthIce':'rebirthBone',p([[-.046,.021,z+.045],[.118,.147,z+.029],
        [.244,high,z-.063],[span,high-.052,z-.136],[span+.027,high-.199,z-.191],[.211,-.199,z-.097],[.077,-.072,z+.050]]));
      if(i%2===0)line(shoulder,'rebirthCopper',p([[.045,.072,z+.095,.019],[.201,.169,z+.015,.028],
        [span,.194,z-.087,.018],[span+.03,.087,z-.147,.005]]));
    }
    for(let i=0;i<3;i++){
      const y=-.087-i*.095;
      plate(forearm,i%2?'rebirthIce':'rebirthBone',p([[.023,y+.081,.139],[.112,y+.061,.146],
        [.21,y-.005,.067],[.197,y-.115,.015],[.088,y-.143,.135],[.019,y-.095,.145]]),.032);
    }
    const hip=bone(root,side*.346,1.03,.021),shin=bone(hip,side*.066,-.485,.045);
    legs.push(hip);shins.push({shin,side});
    volume(hip,'deep',p([[.048,-.504,.045,.129,.136],[.085,-.271,.011,.205,.176],
      [.029,-.041,-.011,.206,.201],[-.025,.098,-.03,.169,.145]]),7.44+side);
    volume(shin,'rebirthSteel',p([[.046,-.461,.065,.117,.132],[.064,-.279,-.056,.158,.145],
      [.045,-.117,.004,.174,.165],[.027,.097,.067,.151,.152]]),8.34+side);
    plate(shin,'rebirthIce',p([[-.098,.139,.124],[.04,.199,.193],[.153,.094,.164],
      [.181,-.066,.139],[.091,-.291,.166],[.019,-.376,.154],[-.084,-.211,.151],[-.111,-.038,.167]]),.061);
    for(let c=0;c<3;c++){
      const x=(c-1)*.083;
      volume(shin,'rebirthBone',[[x,-.418,.134,.062,.053],[x,-.477,.231,.059,.061],
        [x*1.10,-.503,.318,.034,.031],[x*1.12,-.506,.365,.005,.005]],c*1.48);
    }
    const blade=bone(fist,side*.026,-.038,.109);
    blade.name=side===1?'冰雪神 · 銀霜斬月':'冰雪神 · 暮冰鉤';
    const long=side===1?1.29:1.0,width=side===1?.52:.43;
    markEnemyWeapon(blade,[side*width,long,.116],{width:.23});
    line(blade,'deep',[[0,-.32,-.017,.057],[0,-.093,.001,.071],[0,.114,.036,.062],[side*.081,.259,.042,.046]]);
    const bladeProfile=p([[.016,.189,.047],[.165,.307,.032],[.289,long*.64,.025],[width-.041,long*.857,.082],
      [width,long,.116],[width+.11,long*.57,.104],[.332,long*.335,.084],[.191,long*.21,.08],[.061,.173,.065]]);
    plate(blade,side===1?'rebirthSteel':'rebirthCopper',bladeProfile,.086);
    line(blade,side===1?'rebirthBone':'rebirthIce',bladeProfile.slice(4).map(([x,y,z],i)=>[x,y,z+.047,[.007,.046,.034,.025,.009][i]]),20);
    line(blade,'rebirthIce',bladeProfile.slice(1,5).map(([x,y,z],i)=>[x,y,z+.037,[.013,.026,.033,.006][i]]),16);
  }
  return {body,head,arms,legs,limbs,crest:bone(root,0,0,0),sourceSculpt:true,catalogueSculpt:entry.id,pattern:'slam',
    polishEnergy:{tint:0x8bddfc,shape:'bolts',anchor:heart,span:[.78,.77,.62],offset:[0,.1,.06]},
    sourceDress(tools){
      for(const side of sides){
        const p=path=>flip(side,path);
        tools.silk(body,'冰雪神 · 冰腔下擺',p([[.105,-.121,.237,.11],[.169,-.294,.315,.123],
          [.205,-.492,.354,.126],[.246,-.707,.321,.090],[.273,-.884,.263,.021]]),
          {tint:0x365161,trim:0x91aeae,lining:0x3e292c,phase:side*.73,style:'woven',flex:1.01});
        tools.silk(body,'冰雪神 · 側背裂襯',p([[.294,.096,-.248,.09],[.316,-.114,-.285,.132],
          [.419,-.374,-.336,.121],[.482,-.681,-.381,.092],[.569,-.813,-.434,.013]]),
          {tint:0x372c36,trim:0xa58370,lining:0x213f58,phase:side*1.16,style:'woven',flex:1.37});
      }
      return true;
    },
    cataloguePose({beat,step,wind,strike,travel,stage,fall}){
      jaw.rotation.x=.056+wind*.21+strike*.43;
      for(const {rib,side,i} of ribs){
        rib.rotation.y=side*(Math.sin(beat*.64-i*.41)*.03+wind*.13+stage*.04-strike*.20);
        rib.rotation.x=wind*.09-strike*.14;
      }
      for(const {shin,side} of shins)shin.rotation.x=Math.max(0,Math.sin(step+side*Math.PI*.5))*travel*.58+strike*.24+fall*.20;
      heart.rotation.z=Math.sin(beat*.68)*.19+wind*.40-strike*.36;
      heart.scale.setScalar(.95+stage*.085+wind*.11+strike*.25);
    },
  };
}
