import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2;
const sides=[-1,1];

function relief(k,parent,style,span,base){
  const {mesh,rod,sculpt}=k;
  const taper=style==='mantle';
  const electric=style==='demon';
  const loose=style==='court';
  for(const side of sides){
    for(let i=0;i<4;i++){
      const y=base-i*.20, w=span*(taper?1.10-.10*i:.67+i*.12);
      const z=-.34-((i+1)%3)*.040;
      const plate=[
        [side*span*.12,y+.105,z+.034],[side*w*.62,y+.145,z-.011],
        [side*w,y+.055,z],[side*w*.91,y-.115,z-.042],
        [side*w*.45,y-.17,z-.050],[side*span*.08,y-.115,z-.032],
      ];
      sculpt.plate(parent,taper?'body':i%3===1?'edge':'body',plate,.039,.014);
      const gold=loose&&i%3===1?'edge':'trim';
      sculpt.sweep(parent,gold,[[side*w*.20,y-.115,z-.066,.014],[side*w*.46,y-.126,z-.076,.022],
        [side*w*.86,y-.071,z-.057,.015],[side*w*.955,y+.038,z-.017,.008]],
      {sides:6,steps:8,ridge:.14});
      if(!taper)mesh(parent,'gem',electric&&i%2?'glow':'trim',side*w*.77,y+.049,z-.05,.033,.05,.03,0,side*.18);
      rod(parent,'deep',[side*w*.41,y+.093,z-.049],[side*w*.75,y+.047,z-.047],.022);
    }
  }
}

function helmet(k,head,style){
  const {mesh,sculpt}=k;
  const crown=style==='emperor', spiral=style==='serpent';
  for(const side of sides){
    sculpt.sweep(head,crown?'deep':'trim',
      [[side*.14,.15,-.091,.061],[side*.235,.21,-.172,.056],[side*.314,crown?.254:.387,-.238,.048],
        [side*(spiral?.45:.33),crown?.299:.552,-.312,.020],[side*.41,crown?.27:.617,-.356,.003]],
      {sides:8,steps:10,ridge:.22});
    for(let i=0;i<3;i++){
      const a=i*.084;
      mesh(head,'scale',i%2?'edge':'trim',side*(.145+a*.6),.14-a,-.154-a*.18,.10,.14,.24,.24,side*1.14,side*.26);
    }
  }
}

function features(k,head,{width,height,lip,jaw,brow,z,skin='edge',frame='trim',visor='open'},mobile){
  const {mesh,geometry,sculpt}=k;
  const rings=mobile?13:18;
  const w=width,h=height,d=z;
  const form=[
    [0,-h*.77,d+.022,w*jaw*.66,h*.21],[0,-h*.54,d+.043,w*jaw,h*.29],
    [0,-h*.27,d+.048,w*.89,h*.43],[0,h*.025,d+.019,w*.99,h*.38],
    [0,h*.35,d-.011,w*.94,h*.34],[0,h*.62,d-.038,w*.72,h*.25],
  ];
  geometry(head,skin,sculptVolume(form,{rings,sides:mobile?12:16,section:2.09,ridge:.08}));
  const eyeZ=d+h*.435;
  for(const side of sides){
    const eye=side*w*.438;
    const inner=side*w*.19,outer=side*w*.83;
    const y=h*(.07+brow*.16);
    const pitch=side*brow*.22;
    const socket=[[inner,y+h*.061,eyeZ],[eye,y+h*.117,eyeZ+.011],
      [outer,y+h*.035,eyeZ-.032],[side*w*.651,y-h*.095,eyeZ+.003],[inner,y-h*.053,eyeZ-.009]];
    sculpt.plate(head,'deep',socket,.014,.005);
    mesh(head,'gem',visor==='open'?'trim':'glow',eye,y,eyeZ+.012,w*.164,h*.052,.018,0,0,pitch);
    sculpt.sweep(head,skin,[[inner,y+h*.078,eyeZ+.004,.017],
      [eye,y+h*.161,eyeZ+.014,.024],[outer,y+h*.069,eyeZ-.028,.010]],
    {steps:8,sides:6,ridge:.13});
    sculpt.sweep(head,skin,[[side*w*.21,-h*.16,eyeZ+.005,.026],
      [side*w*.65,-h*.214,eyeZ-.006,.036],[side*w*.87,-h*.16,eyeZ-.068,.009]],
    {steps:8,sides:6,ridge:.17});
    if(visor!=='open'){
      const flare=visor==='demon'?1.3:visor==='serpent'?1.13:1;
      sculpt.plate(head,frame,[[side*w*.69,h*.43,eyeZ-.027],[side*w*1.15,h*.49,eyeZ-.125],
        [side*w*1.35,h*.045,eyeZ-.168],[side*w*.99*flare,-h*.47,eyeZ-.084],
        [side*w*.53,-h*.55,eyeZ+.005],[side*w*.70,-h*.18,eyeZ+.019]],.027,.009);
      sculpt.sweep(head,'edge',[[side*w*.95,h*.439,eyeZ-.079,.020],
        [side*w*1.24,h*.116,eyeZ-.149,.022],[side*w*.97,-h*.46,eyeZ-.088,.009]],
      {steps:8,sides:6,ridge:.18});
    }
  }
  sculpt.sweep(head,skin,[[0,h*.31,eyeZ-.018,w*.105],[0,-h*.033,eyeZ+w*.28,w*.17],
    [0,-h*.196,eyeZ+w*.32,w*.23],[0,-h*.256,eyeZ+w*.19,w*.07]],
    {steps:9,sides:8,ridge:.12});
  sculpt.sweep(head,'deep',[[-w*lip,-h*.36,eyeZ+.012,.006],
    [0,-h*.404,eyeZ+.049,.015],[w*lip,-h*.36,eyeZ+.012,.007]],{steps:8,sides:5,ridge:.12});
  sculpt.sweep(head,skin,[[-w*lip*.83,-h*.443,eyeZ+.012,.009],
    [0,-h*.515,eyeZ+.046,.021],[w*lip*.85,-h*.441,eyeZ+.014,.008]],{steps:8,sides:6,ridge:.15});
}

const masks={
  m117:{width:.206,height:.252,lip:.46,jaw:1.07,brow:.77,z:.239,visor:'demon',skin:'body'},
  m124:{width:.239,height:.237,lip:.64,jaw:.81,brow:.73,z:.233,visor:'serpent'},
  m125:{width:.243,height:.265,lip:.57,jaw:.86,brow:.65,z:.224,visor:'serpent',skin:'body'},
  m154:{width:.203,height:.244,lip:.62,jaw:.88,brow:.77,z:.315,visor:'demon',skin:'body',frame:'iron'},
};

function lordArms(k,parts,id){
  const dark=id==='m124'||id==='m125';
  const {sculpt,mesh}=k;
  for(const [i,arm] of parts.arms.entries()){
    const side=i%2===0?-1:1, tier=2;
    for(let n=0;n<tier;n++){
      const y=.142-n*.117, w=(.224-n*.033)*(dark?1.1:1);
      sculpt.plate(arm,'body',[[side*.04,y+.10,-.09],[side*w*.70,y+.12,-.123],
        [side*w,y+.029,-.132],[side*w*.90,y-.101,-.118],[side*.05,y-.093,-.093]],.038,.012);
      mesh(arm,'gem',n?'edge':'trim',side*w*.68,y+.056,-.163,.027,.033,.024);
    }
  }
}

export function finishSpecialBoss(k,parts,id,mobile){
  const {bone,mesh,rod,sculpt}=k,{body,head,tail}=parts;
  if(masks[id]){
    features(k,head,masks[id],mobile);
    lordArms(k,parts,id);
  }
  if(id==='m027'){
    features(k,head,{width:.20,height:.214,lip:.65,jaw:1.04,brow:.83,z:.35,skin:'rust',frame:'trim',visor:'demon'},mobile);
  }
  if(id==='m117'||id==='m124'||id==='m125'){
    relief(k,body,id==='m117'?'demon':'shroud',.49,.68);
    if(head)helmet(k,head,id==='m124'||id==='m125'?'serpent':'guardian');
    if(tail)for(let index=0;index<(mobile?5:9);index++){
      const t=index/(mobile?5:9);
      const z=-.36-t*.83;
      const x=.14+t*1.57;
      mesh(tail,'scale',index%3?'body':'edge',x,.28-t*.17,z,.17-t*.089,.14,.47,.38,Math.sin(t*PI)*.69,.24);
    }
  }else if(id==='m154'){
    relief(k,body,'demon',.56,.47);
    for(const side of sides){
      const shoulder=bone(body,side*.47,.69,-.055);
      for(let p=0;p<4;p++){
        const a=.42+p*.23;
        sculpt.sweep(shoulder,p%2?'iron':'edge',[[0,-.10,-.02,.047],
          [side*(.16+p*.04),Math.cos(a)*.25,-.11-p*.073,.040],
          [side*.42,Math.cos(a)*.42,-.30-p*.08,.009]],{steps:8,sides:7,ridge:.23});
      }
    }
  }else if(id==='m005'){
    for(const side of sides)for(let i=0;i<5;i++){
      const y=.29+i*.148,z=-.33-i*.042,x=side*(.26+Math.sin(i*.48)*.16);
      sculpt.sweep(body,i%2?'ash':'ivory',[[x,y+.14,z,.058],
        [x+side*.095,y+.023,z-.036,.072],[x+side*.21,y-.086,z-.083,.048],
        [x+side*.26,y-.206,z-.061,.004]],{sides:7,steps:mobile?7:9,ridge:.22});
    }
  }else if(id==='m014'){
    for(const side of sides)for(let i=0;i<(mobile?4:6);i++){
      const z=.64-i*.247,y=.24+Math.sin(i*.81)*.13;
      const x=side*(.33+Math.sin(i*.51)*.10);
      sculpt.sweep(body,i%2?'edge':'trim',[[x*.77,y+.27,z-.037,.027],
        [x,y+.14,z-.01,.039],[x*1.15,y+.035,z+.013,.023],
        [x*1.13,y-.077,z+.049,.004]],{sides:6,steps:8,ridge:.24});
    }
  }else if(id==='m015'){
    for(const [i,wing] of parts.arms.entries()){
      const side=i%2===0?-1:1;
      for(let p=0;p<(mobile?3:5);p++){
        const a=p*.16;
        sculpt.sweep(wing,p%2?'ember':'ivory',[[0,.063+a*.09,-.03-a*.13,.023],
          [side*(.27+a),.15+a*.06,-.162-a*.28,.032],
          [side*(.49+a*1.18),.17-a*.12,-.34-a*.50,.022],
          [side*(.62+a*1.39),.021,-.56-a*.36,.003]],{sides:6,steps:8,ridge:.19});
      }
    }
  }else if(id==='m027'){
    relief(k,body,'demon',.68,.69);
    for(const side of sides)for(let i=0;i<4;i++){
      const x=side*(.41+i*.068),y=.61+i*.063,z=-.30-i*.071;
      sculpt.sweep(body,i%2?'ivory':'rust',[[x,y-.09,z,.046],[x+side*.12,y+.07,z-.093,.055],
        [x+side*.164,y+.18,z-.18,.034],[x+side*.18,y+.22,z-.251,.005]],{sides:7,steps:9,ridge:.23});
    }
  }else if(/^m08[5-8]$/.test(id)){
    const kind=Number(id.at(-1))-5;
    features(k,head,{width:[.171,.126,.159,.151][kind],height:[.196,.22,.19,.208][kind],
      lip:.39,jaw:[.87,.72,.84,.71][kind],brow:[.62,.19,.51,.34][kind],z:.199,
      visor:kind===1?'serpent':'demon',skin:kind===2?'trim':'edge'},mobile);
    helmet(k,head,kind%2?'serpent':'emperor');
    for(const side of sides){
      const arm=parts.arms[side===-1?0:1];
      const taper=kind===1?.42:.27;
      sculpt.plate(arm,kind===0?'trim':'edge',[
        [side*.013,-.025,-.155],[side*.175,.128,-.175],[side*(.248+taper*.125),.03,-.171],
        [side*.218,-.257,-.139],[side*.11,-.38,-.079],
      ],.037,.012);
      sculpt.sweep(arm,kind===2?'glow':'trim',[[side*.05,.052,-.189,.022],
        [side*.171,-.024,-.200,.026],[side*.236,-.156,-.179,.022],
        [side*.188,-.283,-.12,.004]],{steps:9,sides:6,ridge:.18});
      for(let i=0;i<3;i++){
        const x=side*(.19+i*.084), y=.24+i*(kind===3?.12:.044);
        mesh(parts.sourceCrest,kind===1?'pearl':kind===0?'horn':'gem',i===1?'glow':'body',
          x,y,-.134-i*.019,.066,.095+i*.026,.038,.17,.44*side,.28*side);
      }
    }
  }else if(id==='m106'){
    for(const side of sides){
      const neck=parts.arms[0];
      for(let i=0;i<(mobile?3:5);i++){
        const y=.38+i*.172,z=-.231-i*.018,x=side*(.24-i*.014);
        sculpt.sweep(neck,'edge',[[x*.62,y+.056,z+.031,.038],[x,y+.048,z-.032,.051],
          [x*1.26,y+.098,z-.157,.030],[x*1.30,y+.24,z-.218,.005]],
        {steps:9,sides:6,ridge:.22});
      }
    }
  }else if(id.startsWith('trial-')&&parts.mount){
    const {knight,mantle,helm}=parts.mount;
    const gate=id.split('-')[1],dark=id.endsWith('-dark');
    const crest=gate==='jing'?'horn':gate==='shang'?'gem':'scale';
    const finish=dark?'body':'edge';
    features(k,helm,{width:gate==='jing'?.196:.151,height:gate==='kai'?.218:.169,lip:.33,jaw:.80,
      brow:gate==='shang'?.39:.67,z:.209,visor:'guardian',skin:finish},mobile);
    relief(k,knight,'shroud',gate==='shang'?.34:.30,.55);
    for(const side of sides){
      const x=side*(gate==='kai'?.38:.23);
      mesh(mantle,crest,'trim',x,-.21,-.29,.086,.122,.064,.42,side*.23,side*.19);
      sculpt.sweep(mantle,finish,[[x*.47,.068,-.27,.030],[x*.74,-.18,-.33,.032],
        [x*1.08,-.40,-.40,.029],[x*1.28,-.51,-.47,.004]],{steps:10,sides:7,ridge:.21});
    }
  }
}
