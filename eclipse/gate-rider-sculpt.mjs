import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const profiles={
  jing:{center:.323,brow:.154, cheek:.226,face:'edge',round:.052},
  shang:{center:.302,brow:.184,cheek:.251,face:'trim',round:.016},
  kai:{center:.308,brow:.133,cheek:.236,face:'body',round:.085},
};
const sides=[-1,1];
const metal=(k,joint,finish,path,depth)=>k.sculpt.plate(joint,finish,path,depth,.014);
const rib=(k,joint,finish,path,steps=10)=>k.sculpt.sweep(joint,finish,path,{steps,sides:7,ridge:.16});

export function sculptGateRider(k,{helm,knight,hand,gate,dark},mobile){
  const {center,brow,cheek,face,round}=profiles[gate];
  const patina=dark?'body':face,crest=dark?'edge':'trim';
  helm.name='門神 · 鍛面兜';
  k.geometry(helm,'deep',sculptVolume([[0,-.128,.039,.127,.181],[0,-.023,.01,.212,.251],
    [0,brow+.029,-.017,.234,.256],[0,.289,-.048,.193,.223],[0,.370,-.071,.112,.116],
    [0,.398,-.081,.042,.043]],{sides:mobile?14:20,rings:mobile?16:23,section:2.19,ridge:.13}));
  for(const side of sides){
    const f=x=>side*x;
    const mir=path=>path.map(([x,...rest])=>[f(x),...rest]);
    const eyebrow=mir([[.023,brow+.036,center],[.122,brow+.058,center-.019],
      [.219,brow+.091+round*.5,center-.094],[cheek+.031,brow+.019,center-.226],
      [cheek,brow-.034,center-.244],[.168,brow+.002,center-.058],[.047,brow-.009,center+.008]]);
    const visor=mir([[.033,brow-.057,center+.011],[.141,brow-.051,center-.02],[cheek,brow+.025,center-.12],
      [cheek+.008,-.034,center-.155],[.157,-.137-round,center-.123],[.118,-.105,center-.044],
      [.058,-.093,center+.009]]);
    metal(k,helm,patina,eyebrow,.046);
    metal(k,helm,face,visor,.043);
    rib(k,helm,'glow',mir([[.042,brow-.024,center+.019,.008],[.121,brow-.015,center+.008,.012],
      [.175,brow+.003,center-.048,.010],[.205,brow+.025,center-.091,.003]]));
    rib(k,helm,crest,visor.slice(2,6).map(([x,y,z],i)=>[x,y-.005,z+.025,[.013,.023,.018,.005][i]]));
    for(let row=0;row<3;row++){
      const y=.029-row*.065;
      const neck=mir([[.216,y+.113,-.009],[.246,y+.073,-.171],[.183,y+.063,-.272],
        [.074,y+.040,-.326],[.039,y-.041,-.335],[.163,y-.055,-.296],[.250,y-.040,-.169]]);
      metal(k,helm,row%2?'deep':patina,neck,.033);
      rib(k,helm,crest,neck.slice(1,5).map(([x,h,z])=>[x,h,z-.019,.009]),8);
    }
    const arm=k.bone(knight,f(.22),.681,.012);
    arm.name='門神 · 關節甲袖';
    k.geometry(arm,'deep',sculptVolume(mir([[.006,.046,0,.111,.120],[.078,-.041,-.073,.143,.149],
      [.164,-.172,-.061,.119,.108],[.200,-.260,.019,.094,.106],[.203,-.31,.10,.079,.089],
      [.207,-.34,.153,.106,.086]]),{sides:10,rings:14,section:2.13,ridge:.15}));
    for(let row=0;row<3;row++){
      const y=.079-row*.109;
      const scale=mir([[.006,y+.034,.088],[.112,y+.087,.091],[.202,y+.032,-.018],[.204,y-.059,-.09],
        [.124,y-.105,-.063],[.057,y-.061,.069]]);
      metal(k,arm,row===0?face:patina,scale,.038);
      rib(k,arm,crest,scale.slice(1,5).map(([x,h,z])=>[x+f(.015),h+.008,z+.018,.010]),9);
    }
    const leg=k.bone(knight,f(.22),.22,.11);
    k.geometry(leg,'deep',sculptVolume(mir([[.041,.032,0,.097,.128],[.136,-.047,.089,.136,.138],
      [.222,-.171,.138,.115,.129],[.228,-.324,.111,.093,.092],[.186,-.467,.069,.063,.089]]),
      {sides:10,rings:13,section:2.28,ridge:.16}));
    metal(k,leg,face,mir([[.098,-.042,.203],[.213,-.077,.222],[.303,-.176,.197],[.275,-.298,.173],
      [.228,-.339,.136],[.175,-.258,.219],[.167,-.169,.238]]),.042);
    rib(k,leg,crest,mir([[.170,-.124,.230,.013],[.223,-.18,.263,.026],[.245,-.255,.223,.015],
      [.238,-.318,.166,.003]]));
  }
  rib(k,helm,crest,[[0,.371,-.041,.027],[0,.311,.129,.036],[0,brow+.074,center-.001,.036],
    [0,brow-.034,center+.044,.029],[0,-.107,center+.034,.006]],13);
  k.mesh(hand,'gem','deep',0,.017,.039,.088,.123,.082);
}
