import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

// Width, height, bridge, chin, brow inclination and crown/back construction.
const designs={
  lotus:[.221,.44,.089,.108,.19,'petals'],
  fox:[.207,.40,.145,.087,.23,'fox'],
  boar:[.284,.45,.135,.167,.13,'hide'],
  crown:[.237,.44,.123,.104,.15,'crown'],
  goat:[.242,.46,.15,.137,.18,'bone'],
  frost:[.228,.43,.102,.109,.14,'frost'],
  bank:[.251,.43,.10,.139,.08,'coin'],
  clock:[.218,.43,.106,.100,.09,'clock'],
  hangman:[.228,.47,.107,.113,.13,'shroud'],
};
const mirror=(side,points)=>points.map(([x,...tail])=>[x*side,...tail]);
const plate=(k,j,finish,outline,depth=.033)=>k.sculpt.plate(j,finish,outline,depth,depth*.37);
const rib=(k,j,finish,track,r=.016)=>k.sculpt.sweep(j,finish,
  track.map(([x,y,z,size=r])=>[x,y,z,size]),{steps:8,sides:6,ridge:.15});
const gem=(k,j,finish,x,y,z,r=.025,h=r,depth=r)=>k.mesh(j,'gem',finish,x,y,z,r,h,depth);
const signs=[-1,1];

export function sculptGuardianHead(k,head,type,mobile){
  const [w,h,bridge,chin,tilt,cut]=designs[type];
  const hide=cut==='hide',coin=cut==='coin',shroud=cut==='shroud',fox=cut==='fox';
  const outside=hide?'body':shroud?'deep':'edge', interior=hide?'trim':'deep';
  const swept=(parent,finish,path,rings=12,sides=10)=>k.geometry(parent,finish,
    sculptVolume(path.map(([x,y,z,r,q=r])=>[x,y,z,r,q]),{rings,sides,section:2.55,ridge:.18}));
  swept(head,interior,[[0,-h*.66,.014,chin*.61,.105],[0,-h*.51,.038,chin,.146],[0,-h*.20,.012,w*.91,.174],
    [0,.05,-.028,w,.19],[0,.17,-.054,w*.88,.169],[0,.29,-.099,w*.67,.112]],
  mobile?14:18,mobile?12:15);
  const jaw=k.bone(head,0,-h*.48,.121);
  if(coin){
    for(const [i,z] of [.082,.159].entries()){
      k.mesh(head,'ring',i?'edge':'trim',0,.02,z,w*(i?1.06:1.20),w*(i?1.19:1.32),1);
      k.mesh(head,'bar',i?'body':'deep',0,.016,z,w*(i?.94:1.07),.055,w*1.15,Math.PI*.5);
    }
  }
  if(!shroud){
    swept(head,outside,[[0,.181,.12,.034],[0,.119,.189,.053],[0,.052,.201+bridge*.50,.042],
      [0,-.104,.186+bridge,.049],[0,-.157,.153+bridge,.007]],13,10);
  }
  for(const side of signs){
    const fan=points=>mirror(side,points);
    const cheek=fan([[.017,.199,.131],[w*.675,.175,.128],[w*1.12,.09,-.011],
      [w*1.11,-h*.213,.042],[w*.82,-h*.49,.107],[chin*.64,-h*.57,.204],
      [chin*.42,-h*.31,.196+bridge*.54]]);
    if(!coin)plate(k,head,outside,cheek,shroud?.021:.038);
    const crow=fan([[w*.19,.128,.203],[w*.51,.136,.187],[w*.85,.111,.153],
      [w*.78,.054+tilt*.07,.158],[w*.50,.041,.197],[w*.23,.053,.225]]);
    plate(k,head,'deep',crow,.018);
    if(!shroud)gem(k,head,'glow',side*w*.52,.084,.222,w*.165,.018,.015);
    rib(k,head,shroud?'body':'trim',crow.slice(0,4).map(([x,y,z])=>[x,y+.017,z+.027]),.015);
    if(!shroud){
      const trace=fan([[w*.92,.095,.082],[w*.99,-.053,.099],[w*.79,-h*.44,.172],[chin*.57,-h*.54,.235]]);
      rib(k,head,hide?'deep':'trim',trace,.020);
      if(!mobile)rib(k,head,'body',trace.map(([x,y,z])=>[x*1.04,y+.025,z-.022]),.013);
    }
    const guard=fan([[w*.83,.177,-.044],[w*1.11,.082,-.123],[w*.91,-.052,-.163],
      [w*.73,-h*.49,-.124],[w*.51,-h*.46,-.026],[w*.79,-.027,-.014]]);
    plate(k,head,shroud?'body':'deep',guard,.031);
    rib(k,head,'trim',guard.slice(1,5),.015);
    if(cut==='bone'||hide||fox){
      const end=fox?.310:.226;
      const fang=fan([[chin*.62,-.05,.106,.034],[chin*.85,-.001,.175,.035],
        [chin*.71,.090,end,.022],[chin*.44,.112,end+.028,.005]]);
      swept(jaw,'edge',fang,9,7);
    }
    for(let i=0;i<(mobile?2:4);i++){
      const y=.111-i*.087,x=w*(.90-i*.064);
      gem(k,head,i%2?'trim':'body',side*x,y,.076+i*.036,.018,.020,.019);
    }
  }
  swept(jaw,outside,[[0,-.065,.057,chin*.50,.055],[0,-.031,.079,chin*.84,.049],
    [0,.025,.078,chin*.93,.046],[0,.052,.034,chin*.81,.039]],10,9);
  if(!shroud)rib(k,jaw,'deep',[[-chin*.72,.029,.098],[0,.038,.133],[chin*.72,.026,.099]],.016);
  for(let i=0;i<3;i++){
    const y=.119-i*.096,v=w*(.98+i*.054);
    const rear=[[-v,y+.041,-.11],[-v*.43,y+.037,-.232],[0,y+.04,-.237],[v*.52,y+.041,-.23],
      [v,y+.033,-.112],[v*.86,y-.057,-.12],[0,y-.074,-.246],[-v*.84,y-.056,-.13]];
    plate(k,head,i%2?'deep':'body',rear,.026);
    rib(k,head,cut==='frost'||cut==='clock'?'edge':'trim',rear.slice(0,5),.012);
  }
  return jaw;
}

export function fitGuardianCollar(k,body,type,width,mobile){
  const [,,,,,,cut]=designs[type];
  const fabric=cut==='shroud'||cut==='petals', index=cut==='coin'||cut==='clock'?1:0;
  for(const side of signs){
    for(let i=0;i<(mobile?2:3);i++){
      const w=width*(.89+i*.096),y=.685-i*.112, z=(i+.7)*.039;
      const folded=mirror(side,[[.034,y,.22],[w*.52,y+.037,.23-z],[w*.99,y-.03,.09],
        [w*1.08,y-.066,-.11],[w*.75,y-.102,-.245],[.032,y-.105,-.261],[.03,y-.148,-.172]]);
      plate(k,body,fabric?'body':i%2?'deep':'body',folded,.031);
      rib(k,body,i%2?'edge':'trim',folded.slice(0,6),i===0?.018:.013);
      if(!mobile)gem(k,body,index&&i!==1?'glow':'trim',side*w*.86,y-.047,-.182,.018,.029,.015);
    }
  }
}
