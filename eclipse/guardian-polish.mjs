const sides=[-1,1];
const mir=(s,path)=>path.map(([x,...rest])=>[s*x,...rest]);
const plate=(k,j,color,p,d=.035)=>k.sculpt.plate(j,color,p,d,d*.34);
const rib=(k,j,color,p,sides=7,steps=11)=>k.sculpt.sweep(j,color,p,{sides,steps,ridge:.17});

// The high points and the side depth are fitted to the individual head sculpts.
const court={
  'forest-1':[.157,.15,.280,.033,.47,0x9bf6d2,'mist'],
  'forest-2':[.182,.13,.288,.054,.38,0x9edaf9,'mist'],
  'forest-3':[.310,.12,.306,.071,.44,0xff7840,'embers'],
  'forest-9':[.206,.224,.322,.113,.69,0xff805e,'sigils'],
  'forest-10':[.237,.145,.292,.068,.47,0xf9ca77,'sigils'],
  'forest-12':[.196,.181,.246,.116,.50,0x96d8ff,'bolts'],
  'forest-15':[.246,.12,.283,.12,.53,0xffc371,'sigils'],
  'forest-16':[.167,.129,.330,.048,.45,0xffb57a,'ribbons'],
  'forest-19':[.187,.112,.305,.088,.65,0xff4a69,'ribbons'],
};
const creatures={
  'forest-0':[.213,.122,.286,.062,.36,0xff9d66,'embers'],
  'forest-4':[.213,.108,.290,.088,.42,0xe697fa,'ribbons'],
  'forest-5':[.168,.089,.305,.09,.34,0xffcc88,'sigils'],
  'forest-6':[.236,.136,.295,.105,.53,0xff9852,'embers'],
  'forest-7':[.199,.084,.288,.071,.49,0x99f6b3,'mist'],
  'forest-8':[.154,.162,.234,.044,.57,0xd399ff,'mist'],
  'forest-11':[.174,.103,.295,.068,.46,0x9cebd4,'ribbons'],
  'forest-13':[.214,.092,.307,.092,.37,0xff773e,'embers'],
  'forest-14':[.168,.154,.230,.047,.38,0xf3c2dd,'mist'],
  'forest-17':[.226,.125,.337,.063,.40,0xa1fcb7,'ribbons'],
  'forest-18':[.161,.143,.238,.060,.38,0xadb2ff,'bolts'],
};

function courtMask(k,head,w,h,z,fork,tier,mobile){
  const crown=k.bone(head,0,.065,-.025);
  crown.name='冠面 · 額脊與耳側甲';
  for(const s of sides){
    const rim=mir(s,[[w*.17,h*.47,z-.04],[w*.78,h*.96,z-.075],[w*1.23,h*.35,z-.18],
      [w*1.09,-h*.8,z-.201],[w*.67,-h*1.24,z-.11],[w*.42,-h*.53,z-.027]]);
    plate(k,head,'deep',rim,.038);
    rib(k,head,'edge',mir(s,[[w*.19,h*.69,z,.008],[w*.52,h*.72,z-.01,.035],[w*.89,h*.77,z-.046,.026],
      [w*1.12,h*.41,z-.123,.017],[w*.94,-h*.28,z-.158,.011]]));
    rib(k,head,'trim',mir(s,[[w*.24,-h*.65,z-.024,.011],[w*.58,-h*.64,z-.036,.029],
      [w*.91,-h*.27,z-.105,.033],[w*1.04,h*.34,z-.139,.004]]));
    const spike=mir(s,[[w*.73,h*.57,z-.13,.044],[w*.97,h*.74,z-.18,.058],
      [w*1.15,h+fork,z-.287,.035],[w*1.22,h+fork*.93,z-.39,.003]]);
    rib(k,crown,'edge',spike,8,mobile?10:16);
    for(let i=0;i<(mobile?3:4);i++){
      const y=h*.81-i*tier*.14;
      const curve=mir(s,[[w*.02,y+.033,-.206],[w*.62,y+.056,-.236],[w*1.01,y+.022,-.192],
        [w*1.13,y-.042,-.135],[w*.49,y-.066,-.217],[w*.07,y-.05,-.226]]);
      plate(k,head,i%2?'body':'deep',curve,.028);
      rib(k,head,i%2?'edge':'trim',curve.slice(1,5).map(([x,y,z])=>[x,y-.01,z-.012,.010]),6,8);
    }
  }
  rib(k,head,'edge',[[0,h*.95,z-.029,.028],[0,h*.47,z+.005,.032],[0,-h*.21,z+.064,.04],
    [0,-h*.43,z+.037,.006]],8,11);
  k.mesh(head,'gem','glow',0,h*.77,z+.002,.024,.039,.013);
}

function wildMask(k,head,w,h,z,crest,mobile){
  for(const s of sides){
    const muzzle=mir(s,[[w*.38,-h*.18,z+.023,.018],[w*.89,h*.20,z-.022,.042],
      [w*1.22,h*.42,z-.114,.041],[w*1.52,h*.67,z-.23,.021],[w*1.47,h+crest,z-.32,.004]]);
    rib(k,head,'edge',muzzle,8,mobile?10:15);
    const socket=mir(s,[[w*.37,h*.26,z+.017],[w*.73,h*.52,z-.014],[w*1.12,h*.44,z-.089],
      [w*.97,-h*.14,z-.074],[w*.57,-h*.27,z+.013]]);
    plate(k,head,'deep',socket,.024);
    rib(k,head,'body',mir(s,[[w*.28,h*.36,z+.026,.013],[w*.58,h*.53,z+.014,.030],
      [w*.89,h*.56,z-.049,.032],[w*1.22,h*.42,z-.108,.009]]));
    for(let i=0;i<(mobile?2:3);i++){
      const y=h*.17-i*.059;
      const shear=mir(s,[[w*.95,y+.048,z-.158],[w*1.25,y+.075,z-.212],[w*1.32,y+.025,z-.304],
        [w*1.04,y-.049,z-.346],[w*.80,y-.037,z-.232]]);
      plate(k,head,i%2?'body':'edge',shear,.028);
    }
  }
}

function armour(k,parts,w,tier,sentinel,mobile){
  const {body,arms=[]}=parts;
  for(const side of sides){
    const arm=arms[side>0?1:0];
    const anchor=arm??body;
    for(let i=0;i<(mobile?2:3);i++){
      const y=arm?.13-i*.09:tier-i*.13,z=arm?-.14:-.40;
      const reach=(w*(1.26-i*.10))*(arm?1:1.55);
      const piece=mir(side,[[.024,y+.047,z+.11],[reach*.76,y+.131,z+.021],[reach,y+.035,z-.048],
        [reach*.94,y-.059,z-.116],[reach*.56,y-.113,z-.142],[.033,y-.04,z-.038]]);
      plate(k,anchor,i%2?'body':'deep',piece,.049);
      rib(k,anchor,'trim',piece.slice(1,5).map(([x,y,z])=>[x+side*.009,y+.01,z-.021,.015]),7,10);
      k.mesh(anchor,'gem',sentinel&&i===0?'glow':'edge',side*reach*.52,y+.019,z-.14,.021,.040,.020);
    }
  }
}

export function polishGuardian(k,parts,entry,mobile){
  const id=entry.artId??entry.id;
  const helmet=court[id],hide=creatures[id];
  if(!helmet&&!hide)return false;
  const {head,body}=parts;
  const [w,h,z,fork,tier,tint,shape]=helmet??hide;
  if(helmet)courtMask(k,head,w,h,z,fork,tier,mobile);
  else wildMask(k,head,w,h,z,fork,mobile);
  armour(k,parts,w,tier,id==='forest-9',mobile);
  parts.polishEnergy={tint,shape,anchor:body,offset:[0,.44,0],span:[.88,tier+.37,.81]};
  return true;
}
