import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

export const xiaolingFinishes={
  avengerSkin:[0xbb9b87,.05,.78,'hide'],avengerEyes:[0x433251,.14,.60,'hide'],
  avengerHair:[0xc2bac2,.10,.75,'hide'],avengerRoot:[0x6a606b,.10,.8,'hide'],
  avengerGreen:[0x5b6642,.10,.81,'cloth'],avengerPurple:[0x43385c,.13,.81,'cloth'],
  avengerGold:[0xb69961,.58,.56,'bronze'],avengerIron:[0x46574b,.60,.56,'iron'],
  avengerVeil:[0x87858c,.15,.80,'cloth'],
};

export function carveXiaoling(k,entry,mobile){
  const sidesCount=mobile?11:16,rings=mobile?14:21;
  const shape=(joint,mat,path,seed=0)=>k.geometry(joint,mat,sculptVolume(path,{
    sides:sidesCount,rings,section:2.38,ridge:.15,seed,
  }));
  const thread=(joint,mat,path,steps=11)=>k.sculpt.sweep(joint,mat,path,{steps,sides:6,ridge:.19});
  const plate=(joint,mat,path,t=.034)=>k.sculpt.plate(joint,mat,path,t,.014);
  const body=k.bone(k.root,0,1.031,0),head=k.bone(body,0,.839,.102);
  const hair=k.bone(head,0,.078,-.039),focus=k.bone(body,-.588,.762,-.324);
  const limbs=[];
  head.name='復仇者小玲 · 銀髮眉眼';
  shape(body,'avengerPurple',[[0,-.705,-.082,.315,.210],[0,-.401,-.061,.312,.206],
    [0,-.137,-.001,.245,.179],[0,.109,.018,.207,.142],[.011,.351,.021,.271,.205],
    [.01,.566,.024,.283,.190],[0,.719,.018,.147,.109]],16);
  shape(head,'avengerSkin',[[0,-.162,.093,.084,.069],[0,-.093,.079,.133,.086],
    [0,.018,.043,.161,.113],[0,.121,.020,.169,.125],[0,.177,-.036,.142,.108]],4.2);
  shape(head,'avengerSkin',[[0,-.061,.148,.026,.026],[0,-.035,.174,.032,.027],
    [0,.005,.168,.028,.034],[0,.05,.142,.019,.021]],5.5);
  shape(hair,'avengerHair',[[0,-.216,-.107,.117,.080],[.011,-.118,-.081,.167,.127],
    [.016,.034,-.071,.195,.160],[.010,.132,-.064,.198,.163],[-.002,.199,-.081,.176,.144],
    [-.023,.251,-.106,.134,.109],[-.042,.291,-.158,.071,.062]],13);
  thread(head,'avengerEyes',[[-.042,-.081,.145,.005],[0,-.087,.168,.008],[.044,-.080,.152,.004]],8);
  for(const side of sides){
    const p=path=>mirror(side,path);
    thread(head,'avengerEyes',p([[.032,.036,.145,.005],[.078,.051,.153,.012],
      [.118,.045,.126,.014],[.142,.028,.100,.003]]));
    k.mesh(head,'gem','glow',side*.078,.033,.149,.023,.010,.008);
    for(let i=0;i<(mobile?6:10);i++){
      const width=.012+i*(mobile?.021:.013),x=width*1.26,z=.089-i*.014;
      thread(hair,i%4?'avengerHair':'avengerRoot',p([[x*.60,.192+i*.009,z-.127,.041],
        [x*.98,.147+i*.007,z+.006,.052],[x*1.42,.039-i*.015,z+.061,.053],
        [x*1.47,-.117-i*.020,z+.049,.038],[x*1.48,-.214-i*.016,z-.039,.005]]),14);
    }
    for(let i=0;i<3;i++){
      const x=.012+i*.037;
      thread(hair,i===1?'avengerRoot':'avengerHair',p([[x*.59,.264,-.077,.020],
        [x*.89,.223,.005,.044],[x*1.14,.150,.089,.045],[x*1.27,.071,.124,.025],
        [x*1.46,.013-i*.031,.114,.005]]),12);
      thread(hair,'avengerHair',p([[x*.51,.269,-.169,.024],[x*.85,.176,-.213,.034],
        [x*1.20,.038,-.237,.044],[x*1.15,-.112,-.225,.042],
        [x*1.28,-.238,-.195,.006]]),13);
    }
    plate(body,'avengerGreen',p([[.029,.609,.157],[.151,.712,.091],[.305,.565,.112],
      [.269,.370,.178],[.145,.183,.199],[.093,.301,.213],[.135,.531,.202]]),.046);
    thread(body,'avengerGold',p([[.054,.641,.172],[.134,.534,.217],[.091,.394,.23],
      [.062,.24,.214],[.093,.160,.182]].map(([x,y,z],i)=>[x,y,z,[.007,.017,.018,.016,.005][i]])));
    const arm=k.bone(body,side*.261,.524,.025),elbow=k.bone(arm,side*.12,-.333,.060);
    const hand=k.bone(elbow,side*.045,-.255,.100);
    const leg=k.bone(body,side*.113,-.664,-.016);
    shape(arm,'avengerGreen',p([[0,.046,-.01,.121,.110],[.034,-.119,.012,.142,.128],
      [.096,-.248,.038,.129,.113],[.12,-.333,.060,.117,.101]]),7.2);
    shape(elbow,'avengerGreen',p([[0,.039,-.025,.133,.115],[.022,-.086,.044,.158,.133],
      [.046,-.194,.086,.156,.150],[.049,-.265,.102,.122,.132]]),11);
    shape(hand,'avengerSkin',p([[.001,.01,.021,.046,.050],[.025,-.063,.062,.068,.062],
      [.045,-.125,.098,.056,.044],[.044,-.158,.121,.034,.029]]),14);
    for(let digit=0;digit<4;digit++)thread(hand,'avengerSkin',p([[.018+digit*.020,-.094,.098,.012],
      [.023+digit*.020,-.145,.120,.016],[.017+digit*.020,-.186,.128,.007]]),7);
    shape(leg,'avengerIron',p([[.012,-.297,.199,.096,.063],[.009,-.261,.118,.112,.084],
      [.010,-.205,.048,.082,.088],[.010,-.096,.001,.076,.071]]),12);
    limbs.push({arm,elbow,hand,leg,side});
  }
  focus.name='復仇者小玲 · 墨羽靈器';
  shape(focus,'avengerIron',[[.02,-.237,-.048,.052,.04],[.032,-.142,.026,.111,.072],
    [.012,-.009,.079,.124,.087],[0,.135,-.021,.071,.060],[.014,.216,-.096,.033,.033]],11);
  for(const side of sides){
    for(let i=0;i<4;i++)thread(focus,i%3?'avengerIron':'avengerGold',mirror(side,[[.036,.078-i*.037,.042,.017],
      [.126+i*.023,.019-i*.042,.005,.027],[.206+i*.022,.087-i*.063,-.064,.023],
      [.263+i*.019,.142-i*.079,-.122,.004]]),12);
  }
  k.mesh(focus,'gem','glow',0,.033,.155,.073,.079,.023,.06,0,.35);
  return {
    body,head,arms:limbs.map(limb=>limb.arm),legs:limbs.map(limb=>limb.leg),
    sourceSculpt:true,catalogueSculpt:entry.id,pattern:'duel',inspectionHead:head,crest:k.bone(body,0,0,0),
    polishEnergy:{tint:0xa3c96f,shape:'ribbons',anchor:body,offset:[.039,.352,-.052],span:[.80,.98,.70]},
    sourceDress(skin){
      for(const side of sides){
        skin.silk(hair,'小玲 · 弧垂長髮',mirror(side,[[.066,.068,-.099,.088],[.134,-.119,-.162,.092],
          [.173,-.295,-.241,.102],[.181,-.435,-.314,.074],[.212,-.563,-.463,.010]]),
        {tint:0xaba6b2,trim:0xd9d4d6,phase:side*.94,flex:1.37,style:'mane',across:[.91,.13,.25]});
        for(let strand=0;strand<2;strand++){
          const x=.027+strand*.066;
          skin.silk(hair,'小玲 · 後髮束',mirror(side,[[x,.135,-.202,.034],[x*.91,.017,-.241,.062],
            [x*1.09,-.172,-.259,.080],[x*1.32,-.358,-.338,.062],
            [x*1.75,-.622+strand*.06,-.437,.010]]),
          {tint:strand?0xb1aeb5:0xababb3,trim:0xd0cdd3,phase:side*.66+strand*.81,
            flex:1.49,style:'mane',across:[.93,.10,.22]});
        }
        for(let i=0;i<5;i++){
          const front=i<2,x=.049+i*.064,y=front?.189:.403,z=front?.182:-.145;
          const cl=front&&i===0?0x43345f:i%2?0x617046:0x474f39;
          skin.silk(body,'小玲 · 草綠長披',mirror(side,[[x,y,z,.09],[x+.061,y-.333,z-.035,.121],
            [x+.102,y-.653,z-.148,.136],[x+.125,y-.917,z-.268,.104],[x+.169,y-1.180,z-.452,.012]]),
          {style:'woven',tint:cl,trim:0xb1a36c,lining:0x3d3d48,phase:side*.72+i*.82,flex:1.25+i*.058});
        }
        const {elbow}=limbs.find(limb=>limb.side===side);
        skin.silk(elbow,'小玲 · 廣袖',mirror(side,[[.054,-.044,.065,.081],[.062,-.110,.137,.116],
          [.073,-.236,.173,.136],[.091,-.370,.148,.081],[.121,-.411,.102,.021]]),
        {style:'woven',tint:0x586748,trim:0xaca274,lining:0x463e56,flex:1.30,phase:side*.83});
      }
      return true;
    },
    cataloguePose({beat,wind,strike,travel,step,fall,stage,attackPattern}){
      const fan=attackPattern==='marked'?1.24:.91;
      head.rotation.y=wind*.14-strike*.18+Math.sin(beat*.53)*.083;
      hair.rotation.x=wind*.21-strike*.24+Math.sin(beat*.69)*.13;
      focus.rotation.x=Math.cos(beat*.59)*.13-wind*.28+strike*.52*fan;
      focus.rotation.z=Math.sin(beat*.81)*.17+wind*.52-strike*.64*fan;
      focus.position.x=-.588-wind*.14-strike*.27*fan;
      focus.position.y=.762+Math.sin(beat*.81)*.11+wind*.16+strike*.17+stage*.058;
      for(const {arm,elbow,hand,leg,side} of limbs){
        const walk=Math.sin(step+side*Math.PI*.5)*travel;
        arm.rotation.set(walk*.43-wind*(side<0?.62:.92)+strike*.81*fan,
          side*(.08+wind*.23-strike*.31),side*(.20+wind*.43-strike*.14+fall*.15));
        elbow.rotation.x=-.12-wind*.26+strike*.27;
        hand.rotation.y=side*(.20+wind*.39-strike*.43);
        leg.rotation.x=walk*.60;
      }
    },
  };
}
