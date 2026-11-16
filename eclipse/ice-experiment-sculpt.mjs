import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

export const iceExperimentFinishes={
  expIce:[0x71859e,.33,.49,'stone'],expFrost:[0xb1bbc3,.24,.54,'bone'],
  expCore:[0x333b68,.64,.44,'gem'],expDusk:[0x293144,.28,.63,'hide'],
};

const sides=[-1,1];
const mirror=(s,path)=>path.map(([x,...rest])=>[x*s,...rest]);

export function forgeIceExperiment(k,entry,mobile){
  const {root,bone,mesh,geometry,sculpt}=k;
  const body=bone(root,0,.85,0),neck=bone(body,0,.21,.31),head=bone(neck,0,.092,.324);
  const jaw=bone(head,0,-.079,.039),heart=bone(body,0,.455,-.138);
  const legs=[],hocks=[],cage=[],tail=[];
  const shell=(joint,material,path,seed=0)=>geometry(joint,material,sculptVolume(path,{
    sides:mobile?11:16,rings:mobile?14:21,section:2.36,seed,ridge:.24,
  }));
  const seam=(joint,material,path)=>sculpt.sweep(joint,material,path,{steps:11,sides:6,ridge:.19});
  const arm=(joint,material,outline,depth=.041)=>sculpt.plate(joint,material,outline,depth,.018);
  shell(body,'expDusk',[[0,.046,-.71,.166,.151],[0,-.039,-.49,.271,.222],[0,.048,-.174,.372,.300],
    [0,.091,.16,.361,.298],[0,.109,.405,.235,.199],[0,.126,.51,.140,.113]],1.43);
  shell(neck,'expIce',[[0,-.067,-.17,.213,.159],[0,-.057,.070,.211,.188],
    [0,.018,.21,.175,.146],[0,.061,.371,.153,.117]],3.92);
  shell(head,'expIce',[[0,.066,-.167,.177,.125],[0,.082,-.033,.208,.184],
    [0,.044,.128,.183,.148],[0,-.049,.288,.132,.096],[0,-.104,.456,.085,.053]],7.5);
  shell(jaw,'expDusk',[[0,-.156,-.062,.084,.066],[0,-.108,.048,.143,.085],
    [0,-.075,.175,.124,.065],[0,-.047,.371,.076,.037]],5.4);
  shell(heart,'expCore',[[0,-.094,-.009,.132,.132],[0,.025,.015,.251,.183],[0,.20,-.013,.227,.19],
    [0,.379,.018,.125,.125],[0,.449,.027,.033,.039]],4.8);
  mesh(heart,'gem','glow',0,.19,.048,.137,.181,.104,0,.21,.13);
  for(let i=0;i<3;i++){
    const band=bone(heart,0,.083+i*.078,.02);
    band.name='冰精靈 · 導雷核心 '+(i+1);
    band.rotation.set(.18+i*.49,.23,i*.45);
    mesh(band,'ring',i===1?'glow':'expFrost',0,0,.021,.26-i*.036,.22-i*.025,.52,.7);
    cage.push({joint:band,ring:true,phase:i*.84});
  }
  for(const side of sides){
    const reflect=path=>mirror(side,path);
    arm(head,'expFrost',reflect([[.047,.136,.151],[.121,.137,.089],[.209,.084,-.042],
      [.224,-.043,.032],[.172,-.133,.195],[.126,-.157,.295],[.089,-.082,.353],[.052,.012,.223]]));
    seam(head,'expDusk',reflect([[.037,.071,.214,.018],[.093,.097,.181,.034],[.151,.112,.136,.028],
      [.190,.082,.093,.006]]));
    seam(head,'glow',reflect([[.045,.053,.230,.006],[.098,.083,.201,.013],[.145,.096,.158,.008]]));
    for(let i=0;i<5;i++){
      const x=.144-i*.017,z=.061+i*.054;
      seam(jaw,'expFrost',reflect([[x,-.078,z,.022],[x+.010,-.024,z+.015,.019],
        [x-.008,.023-(i%3)*.011,z+.03,.004]]));
    }
    for(let i=0;i<4;i++){
      const z=.315-i*.26,y=.15+i*.018;
      const rib=bone(body,side*(.25+i%2*.037),y,z);
      rib.name='冰精靈 · 冰弧肋 '+(i+1);
      const height=.75-i*.059;
      const path=reflect([[.001,-.07,.008,.075,.056],[.164,.057,-.013,.098,.076],
        [.226,.299,-.102,.081,.06],[.174,height*.80,-.19,.06,.038],[.083,height,-.229,.041,.023],
        [-.053,height+.15,-.277,.008,.005]]);
      shell(rib,i===2?'expIce':'expFrost',path,i*.83+side);
      seam(rib,i%2?'expIce':'glow',path.slice(1).map(([x,Y,Z,r],n)=>[x+side*.024,Y+.014,Z+.027,r*(n===3?.19:.29)]));
      for(let thorn=0;thorn<2;thorn++){
        const t=.12+thorn*.19;
        const p=reflect([[.129,t,-.034,.041,.027],[.273,t+.102,-.129,.052,.039],
          [.335,t+.179,-.203,.025,.015],[.393,t+.259,-.292,.004,.005]]);
        shell(rib,thorn?'expIce':'expFrost',p,i*.65+thorn*.71);
      }
      cage.push({joint:rib,side,phase:i*.54});
    }
    for(const front of [true,false]){
      const hip=bone(root,side*(front?.296:.263),.765,front?.303:-.479);
      const knee=bone(hip,side*.068,-.327,front?.108:-.136);
      const toes=bone(knee,side*.028,-.32,front?.028:.157);
      legs.push(hip);hocks.push({knee,toes,side,front});
      shell(hip,'expDusk',reflect([[.062,-.352,.086,.106,.101],[.074,-.17,.066,.149,.144],
        [.043,-.006,-.024,.188,.154],[.02,.071,-.029,.141,.107]]),2.5+side);
      shell(knee,'expIce',reflect([[.022,-.282,.051,.077,.074],[.05,-.142,.03,.090,.089],
        [.025,-.06,.07,.124,.102],[.019,.057,.046,.108,.097]]),4.12+side);
      arm(knee,'expFrost',reflect([[-.078,.045,.091],[.031,.127,.131],[.139,.063,.148],
        [.151,-.088,.124],[.118,-.215,.141],[.004,-.317,.153],[-.067,-.124,.105]]));
      for(let c=-1;c<=1;c++){
        const x=c*.062;
        shell(toes,'expDusk',[[x,-.032,.028,.055,.059],[x*1.11,-.065,.123,.053,.054],
          [x*1.21,-.083,.174,.028,.034],[x*1.22,-.093,.226,.008,.009]],c*.83);
        seam(toes,'expFrost',[[x,-.028,.104,.024],[x*1.12,-.061,.163,.029],[x*1.21,-.092,.236,.004]]);
      }
    }
  }
  let joint=bone(body,0,.119,-.659);
  const backbone=[[.023,.06,-.253],[.031,.126,-.215],[.027,.217,-.177],[.006,.297,-.143],
    [-.027,.265,-.034],[-.059,.208,.043]];
  for(const [i,[x,y,z]] of backbone.entries()){
    const r=.122-i*.014;
    joint.name='冰精靈 · 脊尾 '+(i+1);
    shell(joint,i%2?'expIce':'expDusk',[[0,0,.045,r,r*.89],[x*.43,y*.36,z*.35,r*.93,r*.65],
      [x,y,z,r*.74,r*.58]],i*1.43);
    geometry(joint,i%2?'expFrost':'expIce',featherVane([0,.01,.016],[x+.052,y*.61+.077,z*.43],
      [x+.085,y+.23,z-.092],.095-i*.009,i*1.19,9));
    tail.push(joint);joint=bone(joint,x,y,z);
  }
  return {body,head,legs,pattern:'crawl',crest:bone(root,0,0,0),sourceSculpt:true,catalogueSculpt:entry.id,
    polishEnergy:{tint:0x9abaff,shape:'bolts',anchor:heart,span:[.73,.6,.64],offset:[0,.07,0]},
    cataloguePose({beat,wind,strike,travel,stage,step}){
      neck.rotation.x=wind*.28-strike*.48;
      head.rotation.x=-wind*.31+strike*.31;
      jaw.rotation.x=.027+wind*.24+strike*.49;
      for(const {joint,ring,side,phase} of cage){
        const rhythm=Math.sin(beat*.67+phase);
        if(ring){joint.rotation.z=beat*.48+phase+strike*.82;joint.rotation.x=.62+rhythm*.25;}
        else {
          joint.rotation.z=side*(rhythm*.08+stage*.11+wind*.20-strike*.24);
          joint.rotation.y=side*(rhythm*.031+strike*.15);
        }
      }
      for(const {knee,toes,side,front} of hocks){
        const lift=Math.max(0,Math.sin(step+side*Math.PI*.5+(front?0:Math.PI)))*travel;
        knee.rotation.x=lift*.62+wind*.23-strike*.26;
        toes.rotation.x=-lift*.25+strike*.40;
      }
      for(const [i,spike] of tail.entries()){
        spike.rotation.y=Math.sin(beat*.62-i*.48)*(.10+travel*.14)+strike*.17;
        spike.rotation.x=Math.cos(beat*.71-i*.83)*.089+wind*.09-strike*.17;
      }
    },
  };
}
