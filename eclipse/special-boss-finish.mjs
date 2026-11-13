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

function pair(k,parts,court){
  const {bone,mesh,sculpt}=k;
  for(const [index,hand] of parts.arms.entries()){
    const actor=hand.parent;
    const back=bone(actor,0,.05,-.046);
    relief(k,back,court?'court':'shroud',court?.28:.36,.26);
    const clasp=bone(actor,index?.097:-.09,.31,-.26);
    if(court){
      mesh(clasp,'ring','trim',0,0,0,.126,.147,.82,.12,.075,.19);
      mesh(clasp,'gem','edge',0,0,-.032,.049,.071,.039);
    }else{
      sculpt.sweep(clasp,'edge',[[0,.036,.03,.055],[.13,-.062,-.04,.047],[.18,-.24,-.068,.038],[.067,-.32,-.089,.006]],
        {sides:8,steps:12,ridge:.19});
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

export function finishSpecialBoss(k,parts,id,mobile){
  const {bone,mesh,rod,sculpt}=k,{body,head,tail}=parts;
  if(id==='m114'||id==='m115'){
    pair(k,parts,id==='m114');
  }else if(id==='m117'||id==='m122'||id==='m124'||id==='m125'||id==='m133'){
    const style=id==='m133'?'mantle':id==='m117'?'demon':'shroud';
    relief(k,body,style,id==='m133'?.72:id==='m122'?.33:.49,id==='m122'?.38:.68);
    if(head)helmet(k,head,id==='m133'?'emperor':id==='m124'||id==='m125'?'serpent':'guardian');
    if(tail)for(let index=0;index<(mobile?5:9);index++){
      const t=index/(mobile?5:9);
      const z=id==='m122'?-index*.157:-.36-t*.83;
      const x=id==='m122'?Math.sin(index*.71)*.20:.14+t*1.57;
      mesh(tail,'scale',index%3?'body':'edge',x,.28-t*.17,z,.17-t*.089,.14,.47,.38,Math.sin(t*PI)*.69,.24);
    }
  }else if(id==='m150'){
    for(const side of sides)for(let i=0;i<(mobile?5:8);i++){
      const z=.66-i*.25, x=side*(.76-Math.abs(z)*.152);
      const y=.33+Math.sin(i*.42)*.14;
      sculpt.plate(body,i%3?'copper':'edge',
        [[x*.87,y+.25,z+.13],[x*1.10,y+.15,z+.164],[x*1.15,y-.13,z+.095],
          [x*1.12,y-.14,z-.142],[x*.96,y+.19,z-.127]],.035,.014);
      mesh(body,'gem','trim',x*1.155,y-.055,z+.025,.045,.055,.050,.14,side*.37);
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
  }else if(id==='m155'){
    const ring=bone(body,0,-.17,-.26);
    for(let i=0;i<(mobile?5:8);i++){
      const a=i*TAU/(mobile?5:8),s=Math.sin(a),c=Math.cos(a);
      rod(ring,i%2?'body':'trim',[s*.30,c*.35,.053],[s*.51,c*.48,-.12],.042,'horn');
      mesh(ring,'scale','edge',s*.44,c*.416,-.10,.117,.095,.33,.17,0,-a);
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
    const {knight,mantle}=parts.mount;
    const gate=id.split('-')[1],dark=id.endsWith('-dark');
    const crest=gate==='jing'?'horn':gate==='shang'?'gem':'scale';
    const finish=dark?'body':'edge';
    relief(k,knight,'shroud',gate==='shang'?.34:.30,.55);
    for(const side of sides){
      const x=side*(gate==='kai'?.38:.23);
      mesh(mantle,crest,'trim',x,-.21,-.29,.086,.122,.064,.42,side*.23,side*.19);
      sculpt.sweep(mantle,finish,[[x*.47,.068,-.27,.030],[x*.74,-.18,-.33,.032],
        [x*1.08,-.40,-.40,.029],[x*1.28,-.51,-.47,.004]],{steps:10,sides:7,ridge:.21});
    }
  }
}
