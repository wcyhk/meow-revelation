const mirror=(side,path)=>path.map(([x,...rest])=>[x*side,...rest]);
const sides=[-1,1];

// Placement and cut follow each creature's own silhouette at combat distance.
const profiles={
  imp:['裂石頸甲','head','mane',0x605047,0xae8b67,[.17,.07,-.03,.055],[.31,-.03,-.12,.079],[.36,-.22,-.22,.015]],
  cultist:['燈徒封火袖','body','cloth',0x70392d,0xc18b59,[.28,.36,-.17,.072],[.41,.15,-.28,.111],[.48,-.36,-.42,.067]],
  knight:['荊騎披襟','body','cloth',0x493f36,0xa08a65,[.24,.40,-.24,.080],[.39,.19,-.37,.114],[.42,-.41,-.57,.051]],
  stalker:['伏獵頰縷','head','mane',0x633f4a,0xb68278,[.15,.01,.11,.063],[.27,-.08,-.03,.080],[.41,-.25,-.17,.009]],
  wisp:['幽火魂紗','body','membrane',0x4a8279,0xa3d0c3,[.11,.16,-.14,.069],[.30,-.20,-.25,.09],[.43,-.67,-.57,.013]],
  sentinel:['冰甲衛頸帶','head','cloth',0x3c5371,0xacaeaf,[.17,.09,-.15,.041],[.23,-.10,-.22,.07],[.29,-.40,-.39,.021]],
  oracle:['先知紫縷','body','cloth',0x68517d,0xb99bbe,[.18,.49,-.21,.064],[.31,.14,-.37,.090],[.43,-.43,-.58,.045]],
  scarab:['冰甲蟲後鞘','body','membrane',0x497080,0x8acccc,[.27,.21,-.27,.098],[.37,.25,-.48,.105],[.43,.09,-.73,.028]],
  salamander:['熔螈火腮','head','membrane',0x804b37,0xde9866,[.14,.06,.13,.041],[.28,.071,-.03,.083],[.35,.02,-.26,.017]],
  weaver:['織網蛛腹絲','body','membrane',0x6e414e,0xbb868e,[.23,.25,-.48,.051],[.31,.16,-.69,.103],[.44,-.11,-.88,.012]],
  drummer:['鼓手皮鼓穗','body','cloth',0x88532f,0xc49669,[.34,.16,.37,.067],[.43,-.14,.46,.094],[.47,-.56,.58,.032]],
  crane:['紙鶴羽帛','wing','cloth',0xb9a08e,0xddd2bc,[.11,.03,-.09,.051],[.28,.083,-.22,.092],[.49,.10,-.43,.019]],
  spriggan:['樹妖嫩枝披','head','mane',0x526944,0x9aac73,[.19,.21,-.04,.046],[.34,.24,-.17,.087],[.40,.05,-.35,.014]],
  coin:['錢卒穿幣腰帶','body','cloth',0x785137,0xd4ba72,[.22,.10,-.25,.036],[.35,-.18,-.38,.069],[.43,-.53,-.45,.033]],
  kite:['夜蛾翅背','wing','membrane',0x5d4978,0xa283bb,[.09,.041,-.12,.047],[.29,.12,-.29,.11],[.55,.14,-.55,.036]],
  veil:['影魅斂面紗','head','cloth',0x733e55,0xd0a3c0,[.22,-.02,-.04,.08],[.34,-.16,-.12,.09],[.41,-.53,-.33,.036]],
  coffin:['運棺斷束','body','cloth',0x50353d,0x9c7354,[.31,.33,-.38,.075],[.5,.12,-.62,.096],[.59,-.42,-.74,.047]],
  wax:['蠟鬼凝滴','head','membrane',0xa7865c,0xffc480,[.13,-.043,-.02,.056],[.23,-.19,-.06,.064],[.29,-.36,-.11,.013]],
  toller:['鐘侍繫鐘繩','body','cloth',0x4f695c,0xa8c19a,[.21,.41,-.29,.038],[.32,.19,-.57,.061],[.39,-.30,-.73,.042]],
  eyes:['眾眼血膜','body','membrane',0x713b43,0xe98674,[.24,.24,-.21,.065],[.38,-.09,-.34,.10],[.51,-.35,-.54,.037]],
  hound:['獵骨犬耳筋','head','membrane',0x58414a,0xab7881,[.15,.086,.05,.048],[.24,.15,-.06,.078],[.38,.14,-.21,.015]],
};
const cuts={
  imp:[.092,.024,.046,-.018],cultist:[.087,.096,.029,.05],knight:[.115,.130,.006,.01],
  stalker:[.092,.067,.077,.018],wisp:[.063,.031,.058,-.035],sentinel:[.117,.082,.041,.003],
  oracle:[.09,.067,.018,.033],scarab:[.109,.064,.091,-.015],salamander:[.076,.029,.073,.026],
  weaver:[.078,.107,.069,-.022],drummer:[.112,.044,.081,.039],crane:[.074,.099,.02,-.012],
  spriggan:[.13,.088,.027,.049],coin:[.071,.039,.034,.068],kite:[.083,.122,.041,-.026],
  veil:[.081,.042,.036,.027],coffin:[.124,.081,.074,.021],wax:[.072,.047,.087,.04],
  toller:[.09,.095,.070,-.005],eyes:[.102,.081,.081,.02],hound:[.074,.101,.068,-.036],
};

export function refineCreature(k,parts,entry,mobile,tools){
  const id=entry.artId??entry.id,profile=profiles[id];
  if(!profile)return false;
  const [name,mount,style,tint,trim,...path]=profile;
  const [w,h,d,cut]=cuts[id];
  for(const side of sides){
    const wing=mount==='wing'?parts.flight.find(joint=>joint.side===side).root:null;
    const parent=wing??parts[mount]??parts.body;
    const coords=mirror(side,path);
    const across=wing?[0,0,1]:style==='membrane'?[.27,1,0]:[1,0,0];
    const flex=id==='wax'?1.00:id==='hound'?.91:style==='cloth'?1.15:.77;
    tools.silk(parent,name,coords,{tint,trim,style,across,phase:side*.83+cut*11,flex});
    const [x,y,z]=coords[0];
    const clamp=k.bone(parent,x,y,z);
    const front=z>.09?1:-1;
    const edge=mirror(side,[[0,h,d*front],[w*.86,h+cut,0],[w,-.014,-d*.50],
      [w*.57,-h*.76,-d*.78],[.012,-h*.71,d*.24],[-w*.33,-.024,d*.56]]);
    k.sculpt.plate(clamp,'body',edge,.030,.009);
    k.sculpt.sweep(clamp,'edge',edge.slice(0,4).map(([a,b,c],i)=>[a,b+.005,c+front*.013,[.011,.021,.018,.003][i]]),
      {sides:6,steps:8,ridge:.15});
    tools.hinge(clamp,{side,axis:'y',wind:.07,strike:-.13,phase:.047,travel:.077});
    const head=parts.head;
    if(head){
      k.sculpt.sweep(head,style==='cloth'?'edge':'body',mirror(side,[[w*.64,.04+cut,.207+d,.010],
        [w*1.59,.075+h*.45,.185+d*.79,.029],[w*2.38,.058+h*.30,.076+d*.42,.023],
        [w*2.86,.006+cut,-.045,.003]]),{sides:6,steps:7,ridge:.19});
      if(!mobile)k.mesh(head,'gem','trim',side*w*1.72,.088+cut,.215+d*.74,.012,.016,.012);
    }
  }
  return true;
}
