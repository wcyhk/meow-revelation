import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const sides=[-1,1];
const mirror=(s,points)=>points.map(([x,...rest])=>[s*x,...rest]);
const shell=(k,j,m,path,mobile,seed=0)=>
  k.geometry(j,m,sculptVolume(path,{rings:mobile?10:16,sides:mobile?9:13,section:2.53,seed,ridge:.15}));
const plate=(k,j,m,path,d=.036)=>k.sculpt.plate(j,m,path,d,d*.34);
const seam=(k,j,m,path,mobile)=>k.sculpt.sweep(j,m,path,{sides:mobile?5:7,steps:mobile?8:12,ridge:.17});
function bone(k,parent,name,x,y,z){
  const j=k.bone(parent,x,y,z);j.name=name;
  return j;
}

export function kuberaAxe(k,hand,side,mobile){
  const axe=bone(k,hand,'Kubera hollow-ground votive axe',.016,-.013,.122);
  const f=p=>mirror(side,p);
  shell(k,axe,'bWood',[[0,-.27,0,.032,.037],[.006,.20,.003,.043,.047],
    [.014,.781,.014,.035,.044],[.006,1.302,.035,.032,.04]],mobile,7.61);
  for(let i=0;i<7;i++){
    const y=-.209+i*.069;
    seam(k,axe,i%3?'bOxide':'votiveAxeSocket',[[-.035,y+.01,.044,.005],[0,y,.065,.009],[.038,y+.019,.045,.006]],true);
  }
  shell(k,axe,'votiveAxeSocket',[[0,.842,.016,.043,.05],[0,1.004,.015,.055,.062],
    [.019,1.213,.027,.062,.063],[.02,1.316,.032,.043,.044]],mobile,17.11);
  const outline=[[.03,1.08,.017],[.247,1.276,.028],[.438,1.397,.036],[.615,1.463,.035],
    [.674,1.346,.036],[.642,1.114,.041],[.558,.903,.051],[.451,.809,.058],[.417,.859,.055],
    [.446,.964,.042],[.383,1.077,.028],[.262,1.083,.022],[.061,.992,.012]];
  plate(k,axe,'votiveAxeSteel',f(outline),.062);
  for(const face of sides){
    const outer=outline.slice(2,9);
    const edge=outer.map(([x,y,z])=>[x,y,z+face*.034]);
    const back=outer.map(([x,y,z],i)=>[x-.041-i*.002,1.11+(y-1.11)*.91,z+face*.056]);
    plate(k,axe,'votiveAxeEdge',f([...edge,...back.reverse()]),.016);
    const inset=[[.077,1.078,.061],[.282,1.245,.071],[.442,1.342,.075],[.493,1.265,.084],
      [.426,1.163,.086],[.263,1.141,.072],[.153,1.069,.058]].map(([x,y,z])=>[x,y,z*face]);
    plate(k,axe,'bOxide',f(inset),.025);
    seam(k,axe,'votiveAxeSocket',f(inset.slice(1,6).map(([x,y,z],i)=>[x,y,z+face*.013,[.004,.011,.014,.009,.004][i]])),mobile);
  }
  markEnemyWeapon(axe,[0,1.52,.025],{from:[0,-.225,0],width:.135});
  return axe;
}

export function carveAbbotVotive(k,body,mobile){
  const folds=[],silks=[];
  shell(k,body,'deep',[[0,-.934,-.069,.177,.144],[0,-.779,-.048,.247,.186],[.017,-.442,-.062,.26,.222],
    [0,-.074,-.055,.284,.229],[0,.243,-.067,.319,.237]],mobile,11.22);
  shell(k,body,'brocade',[[0,-.082,-.046,.301,.238],[.02,.112,-.046,.324,.241],[0,.349,-.04,.368,.274],
    [0,.604,-.029,.387,.274],[0,.833,-.035,.322,.236],[0,.951,-.027,.192,.173]],mobile,12.3);
  for(const side of sides){
    const f=path=>mirror(side,path);
    const mantle=bone(k,body,'Abbot hinged linen shoulder '+side,side*.239,.723,-.106);
    const border=f([[-.108,.117,.142],[.131,.132,.096],[.257,.054,-.066],[.301,-.138,-.179],
      [.088,-.227,-.234],[-.036,-.173,-.099],[-.133,-.095,.149]]);
    plate(k,mantle,'rind',border,.073);
    plate(k,mantle,'edge',border.map(([x,y,z],i)=>[x*.92,y*.85+.024,z+.037+i*.002]),.031);
    seam(k,mantle,'trim',border.slice(1,6).map(([x,y,z],i)=>[x,y+.026,z+.028,[.006,.018,.023,.014,.004][i]]),mobile);
    for(let n=0;n<5;n++){
      const z=.105-n*.072,y=.046-n*.034,spread=.233-n*.018;
      seam(k,mantle,n%2?'brocade':'trim',f([[-.077,y+.05,z,.006],[spread*.23,y+.013,z+.011,.012],
        [spread*.69,y-.015,z-.024,.014],[spread*1.025,y-.091,z-.057,.004]]),mobile);
    }
    folds.push({mantle,side});
    const breast=f([[.039,.666,.263],[.279,.657,.224],[.37,.512,.169],[.311,.303,.223],
      [.17,.215,.333],[.039,.353,.332]]);
    plate(k,body,'brocade',breast,.047);
    seam(k,body,'edge',breast.slice(0,5).map(([x,y,z],i)=>[x,y+.024,z+.043,[.008,.023,.024,.014,.004][i]]),mobile);
    const back=f([[.023,.672,-.349],[.228,.702,-.307],[.368,.57,-.278],[.356,.388,-.303],
      [.191,.211,-.362],[.039,.271,-.399]]);
    plate(k,body,'rind',back,.049);
    seam(k,body,'trim',back.slice(1,6).map(([x,y,z],i)=>[x,y+.013,z-.032,[.007,.018,.022,.014,.003][i]]),mobile);
    for(let item=0;item<4;item++){
      const w=.061-item*.007,x=.171+item*.041,y=.448-item*.070,z=-.379-item*.005;
      const stamp=f([[x-w,y+.045,z],[x+w,y+.045,z+.004],[x+w*.86,y-.025,z-.004],[x-w*.94,y-.059,z-.012]]);
      plate(k,body,item%2?'brocade':'deep',stamp,.021);
      seam(k,body,'edge',f([[x-w*.54,y+.016,z-.023,.007],[x+w*.37,y+.019,z-.022,.01],
        [x+w*.29,y-.043,z-.038,.004]]),mobile);
    }
    const collar=side<0?0xbd6b43:0x7a362b;
    silks.push(
      {parent:body,name:'本願寺 · 洗舊雙前襟 '+side,path:f([[.094,.646,.325,.074],[.196,.335,.376,.117],
        [.194,-.281,.45,.136],[.279,-1.02,.523,.108]]),tint:collar,trim:0xcda470,lining:0x36252a,
        phase:side*.76,flex:.99,across:[.97,0,.22*side]},
      {parent:body,name:'本願寺 · 破褶外裙 '+side,path:f([[.233,.139,.107,.109],[.299,-.167,.18,.165],
        [.422,-.543,.212,.188],[.454,-1.02+side*.08,.284,.118]]),tint:0x713021,trim:0xd09762,lining:0x33292c,
        phase:side*1.13,flex:1.18,across:[.44,.06,.86*side]},
      {parent:body,name:'本願寺 · 背面縫補袈裟 '+side,path:f([[.135,.621,-.384,.082],[.222,.274,-.453,.158],
        [.293,-.329,-.546,.213],[.393,-.914+side*.09,-.661,.058]]),tint:0x702d26,trim:0xe0a678,lining:0x27212a,
        phase:side*.94,flex:1.02,across:[.96,.07,-.29*side]},
    );
  }
  const sash=bone(k,body,'Abbot joined sash',0,.028,0);
  shell(k,sash,'rind',[[0,-.078,-.023,.319,.233],[0,-.017,-.029,.36,.254],[0,.04,-.019,.345,.251],
    [0,.083,-.014,.312,.232]],mobile,13.88);
  seam(k,sash,'trim',[[-.277,.046,.212,.006],[-.106,.014,.277,.024],[.109,-.018,.285,.022],[.267,.034,.227,.007]],mobile);
  return {silks,pose({wind,strike,beat}){
    sash.rotation.x=wind*.016-strike*.046;
    for(const {mantle,side} of folds){
      mantle.rotation.x=Math.sin(beat*.88+side)*.046+wind*.069-strike*.12;
      mantle.rotation.z=side*(wind*.048-strike*.082);
    }
  }};
}

export function carveKuberaVotive(k,body,mobile){
  const silks=[],plates=[];
  shell(k,body,'bShadow',[[0,-.136,-.033,.207,.159],[0,.07,-.043,.249,.191],[0,.37,-.04,.306,.216],
    [0,.651,-.029,.336,.224],[0,.837,-.018,.188,.151]],mobile,21.34);
  for(const side of sides){
    const f=path=>mirror(side,path);
    const breast=bone(k,body,'Kubera folded breastwork '+side,side*.144,.474,.193);
    const right=side>0,w=right?.29:.247;
    const cap=f([[-.113,.279,.062],[.063,.337,.064],[w*.87,.215,-.02],[w*1.14,.132,-.096],
      [w*.84,-.093,-.046],[.077,-.232,.06],[-.091,-.122,.137]]);
    plate(k,breast,'bMetal',cap,.074);
    seam(k,breast,'bTrim',cap.slice(0,5).map(([x,y,z],i)=>[x,y+.027,z+.04,[.011,.024,.026,.017,.005][i]]),mobile);
    const crest=f([[-.071,.202,.12],[.033,.232,.114],[.098,.113,.089],[.071,.043,.156],[-.034,-.012,.173]]);
    plate(k,breast,right?'bOxide':'bInlay',crest,.031);
    plates.push({bone:breast,side,index:0});
    for(let n=0;n<4;n++){
      const y=.442-n*.126,z=-.311+n*.025,w=(right?.183:.146)-n*.019;
      const dorsum=bone(k,body,'Kubera interlocking rear rib '+side+' '+(n+1),side*(.105+n*.037),y,z);
      const back=f([[-.031,.062,-.011],[w*.77,.111,-.05],[w*1.35,.049,-.086],[w*1.43,-.057,-.114],
        [w*.66,-.156,-.143],[-.045,-.107,-.085]]);
      plate(k,dorsum,n%2?'bMetal':'bOxide',back,.057);
      seam(k,dorsum,'bTrim',back.slice(1,6).map(([x,y,z],i)=>[x,y-.021,z-.031,[.007,.014,.025,.016,.005][i]]),mobile);
      k.mesh(dorsum,'gem',n%2?'bBone':'bInlay',side*w*.55,-.041,-.171,.03,.038,.025);
      plates.push({bone:dorsum,side,index:n+1});
    }
    silks.push(
      {parent:body,name:'庫貝拉 · 折疊前襟 '+side,path:f([[.129,.386,.351,.056],[.158,.039,.414,.118],
        [.264,-.459,.447,.149],[.348,-1.021+side*.12,.423,.076]]),tint:right?0x9b7b45:0x625542,
        trim:0xe3bd6c,lining:0x342c24,phase:side*.52,flex:.84,across:[.96,.01,-.21*side]},
      {parent:body,name:'庫貝拉 · 側骨披掛 '+side,path:f([[.202,.594,-.263,.079],[.321,.239,-.391,.126],
        [.49,-.263,-.529,.15],[.593,-.856+side*.12,-.651,.031]]),tint:0x5d5845,
        trim:0xcaa866,lining:0x292627,phase:side*.97,flex:.71,across:[.62,.02,-.74*side]},
    );
  }
  const fitArms=limbs=>{
    for(const {root,elbow,hand,side} of limbs){
      const f=path=>mirror(side,path),gold=side>0;
      shell(k,root,'bCloth',f([[.003,.077,-.027,.087,.084],[.052,-.021,-.026,.148,.138],
        [.097,-.159,.038,.108,.105],[.103,-.386,.055,.064,.075]]),mobile,6.7);
      const shoulder=f([[-.037,.155,.089],[.123,.205,.161],[.236,.157,.072],[.241,.039,-.096],
        [.172,-.139,-.111],[.053,-.214,.076],[-.075,-.046,.144]]);
      plate(k,root,gold?'bTrim':'bMetal',shoulder,.065);
      seam(k,root,'bBone',shoulder.slice(0,5).map(([x,y,z],i)=>[x,y+.019,z+.036,[.007,.025,.028,.017,.003][i]]),mobile);
      shell(k,elbow,'bShadow',f([[0,.039,.013,.079,.087],[.043,-.089,.04,.101,.097],
        [.063,-.245,.109,.095,.088],[.03,-.356,.116,.058,.07]]),mobile,17);
      const gauntlet=f([[-.06,.065,.122],[.065,.111,.147],[.121,.05,.138],[.182,-.112,.13],
        [.108,-.278,.202],[.019,-.283,.208],[-.048,-.121,.169]]);
      plate(k,elbow,gold?'bMetal':'bInlay',gauntlet,.062);
      seam(k,elbow,'bBone',gauntlet.slice(1,5).map(([x,y,z],i)=>[x,y+.021,z+.035,[.012,.022,.019,.006][i]]),mobile);
      shell(k,hand,'bBone',f([[0,.041,.027,.047,.065],[.022,-.019,.068,.071,.066],
        [.027,-.086,.108,.046,.046]]),mobile,11.2);
    }
  };
  return {silks,fitArms,pose({wind,strike,beat}){
    for(const {bone,side,index} of plates){
      bone.rotation.x=wind*.10-strike*.14+Math.sin(beat*.55+index*.38)*.033;
      bone.rotation.z=side*(wind*.13-strike*.095);
    }
  }};
}
