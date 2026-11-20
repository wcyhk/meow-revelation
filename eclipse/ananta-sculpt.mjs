import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

export const anantaFinishes={
  anantaScale:[0x3b4652,.37,.56,'iron'],anantaHood:[0x343441,.11,.77,'hide'],
  anantaBelly:[0x9b917c,.23,.59,'bone'],anantaBrass:[0x9d743c,.68,.46,'bronze'],
};

export function sculptAnanta(k,entry,mobile){
  const {root,bone,geometry,sculpt,mesh}=k;
  const body=bone(root,0,.34,.015),spire=bone(body,0,.19,-.052);
  const heads=[],necks=[],hoods=[],tail=[];
  const shell=(j,m,path,seed=0)=>geometry(j,m,sculptVolume(path,{
    sides:mobile?9:14,rings:mobile?12:19,section:2.36,ridge:.24,seed,
  }));
  const line=(j,m,p,steps=11)=>sculpt.sweep(j,m,p,{steps,sides:6,ridge:.20});
  const plate=(j,m,p,s=.047)=>sculpt.plate(j,m,p,s,.015);
  shell(body,'anantaScale',[[0,-.205,-.39,.464,.21],[0,-.119,-.329,.699,.38],
    [0,.055,-.181,.742,.412],[0,.262,-.12,.601,.325],[0,.398,-.02,.431,.24],[0,.50,.012,.27,.151]],12);
  shell(spire,'deep',[[0,-.16,-.002,.23,.161],[0,.047,-.052,.407,.20],[0,.318,-.139,.513,.206],
    [0,.566,-.199,.369,.185],[0,.789,-.239,.228,.122]],9);
  for(let i=-3;i<=3;i++){
    const side=Math.sign(i)||1,bend=Math.abs(i),u=bend/3;
    const out=p=>p.map(([x,...r])=>[x*side,...r]);
    const neck=bone(spire,i*.163,.16+(.055*bend),.065-bend*.056);
    neck.name='腐墨室・八針織者 · 蛇頸 '+(i+4);
    const length=1.63-u*.612,offset=bend*(.051+u*.053);
    const shape=out([[.016,-.081,.055,.151,.121],[.055,length*.15,.137,.163,.149],
      [.107+offset*.37,length*.38,.17,.143,.144],[.142+offset*.79,length*.67,.156,.129,.133],
      [.174+offset,length*.885,.262,.114,.111],[.16+offset,length,.39,.104,.101]]);
    shell(neck,'anantaScale',shape,20+i*1.89);
    for(let j=0;j<8;j++){
      const t=j/8,y=.11+t*length*.90,x=side*(.038+.11*t+offset*t);
      const z=.272+t*.146+(j===0?-.018:0),w=.121-t*.031;
      const belly=[[x-w,y+.052,z-.043],[x-.007,y+.061,z+.021],[x+w,y+.059,z-.036],
        [x+w*.9,y-.049,z-.051],[x,y-.059,z+.023],[x-w*.82,y-.051,z-.051]];
      plate(neck,j%4===1?'anantaBrass':'anantaBelly',belly,.029);
      line(neck,'anantaHood',[[x-w*.71,y-.022,z-.017,.011],[x,y-.027,z+.051,.012],
        [x+w*.74,y-.019,z-.018,.004]],9);
    }
    const head=bone(neck,side*(.161+offset),length,.385);
    head.name='腐墨室・八針織者 · 蛇面 '+(i+4);
    const jaw=bone(head,0,-.082,.055);
    heads.push(head);necks.push({neck,head,jaw,i,side,bend});
    shell(head,'anantaScale',[[0,.077,-.16,.118,.106],[0,.056,-.047,.153,.139],
      [0,.018,.091,.149,.128],[0,-.038,.193,.117,.075],[0,-.058,.256,.086,.051]],3.9+i);
    shell(jaw,'anantaHood',[[0,-.061,-.062,.079,.070],[0,-.051,.061,.111,.063],
      [0,-.02,.154,.086,.061],[0,-.003,.201,.053,.033]],7.9+i);
    for(const s of [-1,1]){
      const x=v=>s*v;
      line(head,'deep',[[x(.023),.071,.157,.021],[x(.082),.079,.137,.034],[x(.127),.057,.098,.021],[x(.155),.025,.044,.005]]);
      mesh(head,'gem','glow',x(.088),.056,.165,.028,.012,.015,0,x(.35));
      line(jaw,'anantaBelly',[[x(.077),-.028,.107,.014],[x(.079),.023,.140,.016],[x(.065),.065,.154,.004]],8);
      const crown=[[x(.05),.087,.086,.028],[x(.109),.155,.006,.042],[x(.145),.168,-.086,.021],[x(.157),.177,-.146,.004]];
      line(head,(i+s)%3===0?'anantaBrass':'anantaScale',crown);
      const hood=bone(neck,x(.083),length*.82,.183);
      const height=.28+(.06*(3-bend)),reach=.21+u*.095;
      const profile=[[0,.129,.024],[x(.077),height,.026],[x(reach*.74),height+.052,-.084],[x(reach),height*.62,-.18],
        [x(reach*.93),-.118,-.192],[x(reach*.60),-.219,-.127],[x(.03),-.149,.019]];
      plate(hood,'anantaHood',profile,.034);
      line(hood,'anantaScale',profile.slice(1,6).map(([a,y,z],j)=>[a,y,z-.022,[.014,.022,.023,.015,.004][j]]));
      for(let j=0;j<3;j++)line(hood,'anantaBelly',[[x(.057),.094-j*.061,.025,.008],
        [x(reach*.55),.137-j*.09,-.085,.015],[x(reach*.85),.19-j*.10,-.163,.008]],8);
      hoods.push({hood,s,i});
    }
  }
  let joint=bone(body,0,.057,-.667);
  for(let i=0;i<8;i++){
    const x=.079+Math.sin(i*.66)*.123,y=.044+i*.018,z=i<5?-.234:-.135;
    const r=.208-i*.023;
    shell(joint,'anantaScale',[[0,0,.048,r,r*.82],[x*.57,y*.67,z*.48,r*.94,r*.84],[x,y,z,r*.73,r*.69]],i*1.41);
    line(joint,i%3?'anantaScale':'anantaBrass',[[.025,r+.017,-.014,r*.42],[x*.78,r+y+.076,z*.66,r*.44],
      [x*1.08,r+y+.114,z*.97,.005]]);
    tail.push(joint);joint=bone(joint,x,y,z);
  }
  const torque=bone(body,0,-.017,.327);
  mesh(torque,'gem','anantaBrass',0,.029,.119,.193,.185,.084);
  mesh(torque,'gem','glow',0,.052,.198,.075,.077,.026,.12,0,.04);
  for(const side of [-1,1])line(torque,'anantaBrass',[[0,.11,.147,.046],[side*.211,.065,.066,.063],
    [side*.384,.002,-.025,.050],[side*.489,.065,-.173,.030],[side*.509,.147,-.245,.006]],15);
  return {body,head:heads[3],heads,inspectionHead:heads[3],crest:bone(root,0,0,0),sourceSculpt:true,
    catalogueSculpt:entry.id,pattern:'coil',polishEnergy:{tint:0xae91e9,shape:'ribbons',anchor:spire,span:[.93,.91,.79]},
    cataloguePose({beat,wind,strike,travel,fall,stage,attackPattern}){
      const snap=attackPattern==='pounce'?1.22:.88;
      for(const {neck,head,jaw,i,side,bend} of necks){
        const ripple=Math.sin(beat*.62-i*.68),skew=Math.cos(beat*.54+i*.59);
        const bite=strike*Math.max(.47,1-bend*.12+skew*.12)*snap;
        neck.rotation.z=side*(.041+ripple*.051+wind*.087+stage*.032)+fall*.25;
        neck.rotation.x=ripple*.08+wind*.24-bite*.57+travel*.08;
        neck.rotation.y=side*(skew*.092+wind*.13-bite*.34);
        head.rotation.x=-wind*.28+bite*.38+ripple*.091;
        jaw.rotation.x=.065+Math.max(0,ripple)*.097+wind*.13+bite*.92;
      }
      for(const {hood,s,i} of hoods)hood.rotation.y=s*(.08+Math.sin(beat*.71+i*.57)*.07+wind*.19-strike*.15);
      for(const [i,link] of tail.entries()){
        link.rotation.x=Math.cos(beat*.49-i*.49)*(.072+travel*.10)+stage*.028;
        link.rotation.y=Math.sin(beat*.61-i*.58)*(.15+travel*.11)+strike*.22;
      }
    },
  };
}
