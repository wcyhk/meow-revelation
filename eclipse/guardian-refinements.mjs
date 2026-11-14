const sides=[-1,1];
const mir=(path,s)=>path.map(([x,...rest])=>[x*s,...rest]);

// The anchors are local to each existing torso, head or wing joint.
const garment={
  'forest-10': ['糧契背帶',0x5d4231,0xdeaa72,[[.26,.36,-.29,.07],[.32,.14,-.35,.092],[.48,-.18,-.38,.077],[.53,-.52,-.53,.057]]],
  'forest-1': ['蓮脈披帛',0x417c78,0xc5e0b2,[[.20,.48,-.31,.07],[.43,.20,-.48,.15],[.51,-.20,-.62,.124],[.64,-.657,-.64,.09]]],
  'forest-12': ['鳴霜鎧縧',0x455b85,0xa7cbea,[[.29,.32,-.28,.064],[.35,.18,-.39,.083],[.42,-.16,-.41,.07],[.49,-.51,-.55,.044]]],
  'forest-2': ['狐僧經幡',0x6b6891,0xe4d9d0,[[.20,.46,-.33,.103],[.38,.16,-.44,.11],[.55,-.19,-.57,.093],[.61,-.66,-.71,.071]]],
  'forest-3': ['爐王火氈',0x592c27,0xf09255,[[.36,.34,-.46,.135],[.59,.16,-.49,.115],[.71,-.14,-.51,.106],[.75,-.52,-.67,.087]]],
  'forest-15': ['庫吏封印',0x615036,0xd8af57,[[.33,.32,-.32,.105],[.39,.13,-.47,.115],[.43,-.17,-.51,.09],[.58,-.52,-.53,.078]]],
  'forest-16': ['銅晷刻度帶',0x763e34,0xd7ad75,[[.25,.42,-.29,.083],[.42,.21,-.36,.086],[.5,-.05,-.47,.072],[.47,-.44,-.55,.055]]],
  'forest-19': ['刑旗殘布',0x77313a,0xa78261,[[.31,.46,-.38,.117],[.49,.13,-.44,.118],[.53,-.29,-.63,.106],[.68,-.75,-.70,.054]]],
  'forest-9': ['守夜王旗',0x652932,0xc89165,[[.32,.42,-.43,.094],[.48,.12,-.51,.144],[.66,-.31,-.65,.106],[.74,-.84,-.84,.075]]],
};
const organs={
  'forest-11':['渡守鬚縷','head','mane',0x8aac99,0xe2e0bc,[[.15,-.02,.22,.058],[.28,-.11,.16,.067],[.40,-.32,.025,.035],[.44,-.49,-.179,.016]],[0,0,1]],
  'forest-6':['食日蛇冠','head','membrane',0x80433b,0xcb8662,[[.12,.19,.01,.041],[.25,.29,-.10,.107],[.34,.39,-.26,.10],[.36,.53,-.33,.02]],[0,1,0]],
  'forest-4':['織碑絲鬃','body','membrane',0x5c3e65,0xcb93bd,[[.28,.33,-.31,.144],[.46,.40,-.61,.093],[.51,.36,-.89,.073],[.69,.16,-1.12,.024]],[1,0,0]],
  'forest-5':['庫黿鬚鰭','head','membrane',0x775740,0xceae70,[[.21,.04,.12,.051],[.26,.07,-.01,.11],[.39,.12,-.17,.095],[.44,.04,-.32,.015]],[0,1,0]],
  'forest-7':['菌鹿耳葉','head','membrane',0x527663,0xb4daa4,[[.17,.12,.04,.036],[.29,.26,-.07,.081],[.37,.34,-.20,.087],[.48,.39,-.28,.017]],[0,1,0]],
  'forest-13':['火螈腮絲','head','mane',0x804836,0xf8a35c,[[.17,.07,.18,.064],[.25,.11,.006,.115],[.36,.17,-.17,.08],[.49,.15,-.37,.021]],[0,1,0]],
};
const pinions={
  'forest-0':['鴞羽翎衣','mane',0x6e4738,0xe3a45d,.68,.21,-.57],
  'forest-14':['送靈經紙','cloth',0xb2a89e,0xf1cdd6,.58,.23,-.67],
  'forest-17':['根龍翼皮','membrane',0x385743,0x759567,.71,.24,-.65],
  'forest-18':['彩窗鉛邊','membrane',0x593456,0xa589bc,.68,.195,-.62],
  'forest-8':['月蛾絨尾','mane',0x705182,0xc49bd7,.62,.20,-.74],
};

function metalwork(k,parts,entry,tools,stitch){
  const {body,head,arms=[]}=parts;
  const [, , ,path]=stitch;
  for(const side of sides){
    const upper=arms[side<0?0:1];
    if(!upper)continue;
    const cap=k.bone(body,upper.position.x,.45,-.045);
    const width=Math.abs(upper.position.x)*.53;
    const high=entry.id==='forest-12'||entry.id==='forest-9';
    const tip=high?.23:.135;
    const rim=mir([[.015,.091,.22],[width*.58,.15,.166],[width,.105,-.04],[width*.99,.053,-.20],
      [width*.65,-tip,-.234],[.057,-.093,-.25],[-.055,-.046,-.087],[-.045,.005,.145]],side);
    k.sculpt.plate(cap,entry.finish==='cloth'?'edge':'body',rim,.035,.012);
    k.sculpt.sweep(cap,'trim',rim.slice(2,7).map(([x,y,z])=>[x,y,z-.023,.015]),{steps:10,sides:6,ridge:.17});
    k.mesh(cap,'gem','trim',side*width*.59,-.025,-.228,.035,.047,.025);
    tools.hinge(cap,{axis:'x',side,wind:.06,strike:.06,travel:.06,follow:upper,ratio:.26});
    const [x,y,z]=path[0];
    k.rod(body,'edge',[side*(x-.048),y+.036,z-.014],[side*(x+.054),y-.009,z-.019],.021);
    if(head){
      const crest=mir([[.095,.16,-.165,.032],[.18,.17,-.18,.033],[.229,.093,-.205,.028],
        [.231,-.011,-.22,.018],[.194,-.105,-.215,.006]],side);
      k.sculpt.sweep(head,'trim',crest,{sides:7,steps:12,ridge:.21});
      const path=mir([[.182,-.002,.10],[.232,.034,.035],[.223,-.073,-.083],[.175,-.165,-.126],[.159,-.115,.029]],side);
      k.sculpt.plate(head,'edge',path,.021,.008);
    }
  }
}

export function refineGuardian(k,parts,entry,mobile,tools){
  const id=entry.id,rag=garment[id],organ=organs[id],wings=pinions[id];
  if(rag){
    const [label,tint,trim,path]=rag;
    metalwork(k,parts,entry,tools,rag);
    for(const s of sides)tools.silk(parts.body,label,mir(path,s),{tint,trim,phase:s*.78,flex:.98});
  }
  if(organ){
    const [label,key,style,tint,trim,path,across]=organ;
    const parent=parts[key]??parts.body;
    for(const s of sides){
      tools.silk(parent,label,mir(path,s),{tint,trim,style,across,phase:s*1.2,flex:.81});
      const base=mir(path.slice(0,3).map(([x,y,z,w],i)=>[x,y,z+.018,w*(i===0?.42:i===1?.25:.065)]),s);
      k.sculpt.sweep(parent,'edge',base,{steps:9,sides:7,ridge:.19});
      k.mesh(parent,'gem','trim',...base[0].slice(0,3),.034,.041,.026);
    }
  }
  if(wings){
    const [label,style,tint,trim,width,y,z]=wings;
    for(const {root,side} of parts.flight){
      const line=[[.10,.035,-.065,.06],[width*.46,y*.56,-.21,.10],[width*.74,y*.90,z*.78,.087],[width,y,z,.023]];
      tools.silk(root,label,mir(line,side),{tint,trim,style,across:[0,0,1],phase:side*.81,flex:.72});
      const rim=mir([[.055,.08,-.085],[width*.3,.157,-.185],[width*.64,y+.035,-.31],
        [width*.81,y-.031,-.42],[width*.41,y-.098,-.325],[.081,.038,-.171]],side);
      k.sculpt.plate(root,'body',rim,.037,.013);
      k.sculpt.sweep(root,'trim',rim.slice(1,5).map(([x,h,d])=>[x,h+.02,d,.018]),
        {steps:10,sides:6,ridge:.16});
    }
  }
  return Boolean(rag||organ||wings);
}
