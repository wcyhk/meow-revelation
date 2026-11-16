import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';

const signs=[-1,1];
const mirror=(side,p)=>p.map(([x,...rest])=>[side*x,...rest]);
const line=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?9:14,sides:mobile?6:8,ridge:.15});
const shell=(k,j,m,p,mobile,seed=0,section=2.61,fur=false)=>k.geometry(j,m,sculptVolume(p,{
  rings:mobile?12:19,sides:mobile?10:16,section,seed,ridge:.18,fur,
}));
const plate=(k,j,m,p,d=.05)=>k.sculpt.plate(j,m,p,d,d*.27);
const fastener=(k,j,m,x,y,z,r)=>k.mesh(j,'gem',m,x,y,z,r,r,.55*r);
function finish(k,name,color,roughness,metalness,type){
  if(k.materials[name])return;
  k.materials[name]=paintedFinish(new T.MeshStandardMaterial({
    color,roughness,metalness,vertexColors:true,envMap:forgeEnvironment(),envMapIntensity:metalness>.3?.54:.21,
  }),type,true,true);
}

export function goatHooves(k,{hip,knee,side,ground},mobile,drives){
  finish(k,'ledgerWool',0x524135,.86,.038,'hide');
  finish(k,'ledgerHorn',0x6d5e47,.72,.12,'bone');
  const p=track=>mirror(side,track),hock=k.bone(knee,side*.046,-ground*.249,-.073);
  const foot=k.bone(hock,side*.011,-ground*.180,.052),toes=[];
  shell(k,hip,'ledgerWool',p([[0,.113,-.032,.149,.163],[.025,-.022,-.053,.156,.163],
    [.043,-.177,-.032,.113,.128],[.047,-.361,.021,.093,.103],[.035,-ground*.407,.029,.087,.089]]),mobile,31,2.29,true);
  shell(k,knee,'ledgerWool',p([[0,.084,.017,.087,.095],[.039,-.012,-.01,.094,.101],
    [.063,-.111,-.050,.081,.094],[.055,-ground*.275,-.079,.076,.080]]),mobile,12,2.32,true);
  shell(k,hock,'ledgerHorn',p([[0,.058,-.01,.076,.093],[.003,.006,.018,.087,.095],
    [.015,-.090,.037,.061,.068],[.010,-ground*.188,.054,.073,.073]]),mobile,19);
  const greave=p([[.039,.083,.077],[.111,.041,.067],[.136,-.103,.029],[.088,-.208,-.016],
    [.012,-.235,.022],[-.065,-.105,.067],[-.058,.042,.096]]);
  plate(k,knee,'edge',greave,.036);
  line(k,knee,'trim',greave.slice(0,5).map(([x,y,z],i)=>[x,y,z+.022,[.010,.017,.020,.017,.006][i]]),mobile);
  line(k,hock,'deep',p([[-.068,-.022,.021,.023],[-.028,-.027,.087,.018],
    [.064,-.027,.081,.019],[.082,-.022,.006,.016]]),mobile);
  for(const pos of signs){
    const toe=k.bone(foot,pos*.063,-.082,.084);
    toe.name='糧簿山羊 · 偶蹄 '+side+' '+pos;
    shell(k,toe,'ledgerHorn',[[0,.055,-.071,.044,.034],[0,.007,-.023,.063,.061],
      [pos*.008,-.019,.087,.065,.057],[pos*.012,-.052,.149,.051,.031]],mobile,side+pos,3.31);
    line(k,toe,'trim',[[0,.011,-.022,.015],[pos*.012,.019,.049,.017],[pos*.021,-.025,.131,.012],
      [pos*.025,-.047,.149,.005]],mobile);
    toes.push(toe);
  }
  drives.push({hock,foot,toes,side,goat:true});
}

export function boarPaws(k,{hip,knee,side,ground},mobile,drives){
  finish(k,'kilnHide',0x4a2e2e,.79,.075,'hide');
  finish(k,'kilnIron',0x5c3c38,.59,.41,'iron');
  const p=track=>mirror(side,track),hock=k.bone(knee,side*.037,-ground*.259,.022);
  const foot=k.bone(hock,side*.022,-ground*.162,.054),toes=[];
  shell(k,hip,'kilnHide',p([[0,.104,-.038,.177,.196],[.035,-.042,-.029,.226,.193],
    [.052,-.218,-.028,.183,.165],[.036,-ground*.421,.020,.142,.139]]),mobile,29,3.08);
  shell(k,knee,'kilnHide',p([[0,.064,-.023,.150,.152],[.043,-.047,.023,.173,.179],
    [.052,-.139,.034,.153,.159],[.055,-ground*.289,.034,.125,.130]]),mobile,23,2.82);
  shell(k,hock,'kilnIron',p([[0,.065,-.062,.160,.129],[.019,.004,.013,.169,.146],
    [.02,-.081,.086,.142,.119],[.024,-ground*.176,.099,.124,.097]]),mobile,11,3.3);
  for(const facet of signs){
    const z=facet*.112;
    const saddle=p([[.038,.095,z],[.162,.069,z-.008],[.208,-.061,z-.089],[.181,-.210,z-.102],
      [.091,-.259,z+.031],[-.028,-.199,z+.071],[-.070,-.034,z+.065]]);
    plate(k,knee,'kilnIron',saddle,.051);
    line(k,knee,'trim',saddle.slice(0,5).map(([x,y,z0],i)=>[x,y,z0+facet*.036,[.013,.020,.026,.019,.006][i]]),mobile);
    for(let i=0;i<2;i++)fastener(k,knee,'edge',side*(.079+i*.071),-.166+i*.081,z+facet*.055,.026);
  }
  for(const pos of [-2,-1,1,2]){
    const outer=Math.abs(pos)===2;
    const toe=k.bone(foot,pos*.070,-.062,.124-(outer?.08:0));
    toe.name='獄爐豬王 · 裂趾 '+side+' '+pos;
    const turn=pos*.02;
    shell(k,toe,outer?'kilnIron':'edge',[[0,.036,-.080,.058,.056],[turn*.19,.010,.012,.072,.073],
      [turn*.47,-.023,.103-(outer?.024:0),.066,.051],[turn,-.064,.159-(outer?.042:0),.039,.030]],mobile,22+pos,3.03);
    line(k,toe,'deep',[[0,-.037,-.038,.025],[turn*.39,-.043,.062,.032],[turn,-.065,.156-(outer?.040:0),.016]],mobile);
    toes.push(toe);
  }
  drives.push({hock,foot,toes,side,goat:false});
}

export function paceSiegeLegs(drives,time,{step,travel,wind,strike}){
  for(const {hock,foot,toes,side,goat} of drives){
    const stride=Math.cos(step+side*Math.PI*.50);
    hock.rotation.x=travel*stride*(goat?.37:.18)+wind*.15-strike*.18;
    hock.rotation.z=side*(goat?.016:.041)*(1+wind+strike);
    foot.rotation.x=-hock.rotation.x*.69+Math.max(0,stride)*travel*(goat?.083:.046);
    for(const [i,toe] of toes.entries())toe.rotation.x=(-wind*.085+strike*(.18+i*.031))*(goat?1.21:.84);
  }
}

export function buildLedgerBack(k,back,flaps,mobile){
  finish(k,'ledgerHide',0x503625,.83,.055,'hide');
  finish(k,'ledgerPages',0xa98e58,.83,.028,'cloth');
  const hanging=k.bone(back,0,.267,-.172);
  hanging.name='糧簿山羊 · 壽糧帳簿';
  const cover=[[-.26,.218,.041],[.228,.253,.018],[.287,.149,-.031],[.216,-.466,-.094],
    [.134,-.534,-.112],[-.275,-.496,-.116],[-.297,-.389,-.062]];
  plate(k,hanging,'ledgerHide',cover,.070);
  plate(k,hanging,'ledgerHide',cover.map(([x,y,z])=>[x*1.061,y,z-.184]),.064);
  plate(k,hanging,'ledgerPages',cover.map(([x,y,z])=>[x*.86,y*.94,z-.093]),.171);
  for(let i=0;i<7;i++)line(k,hanging,'trim',[[.264,.159,-.027-i*.028,.006],[.240,-.112,-.039-i*.027,.008],
    [.224,-.379,-.068-i*.027,.008],[.193,-.477,-.105-i*.028,.004]],mobile);
  for(const s of signs){
    const p=q=>mirror(s,q);
    line(k,hanging,'edge',p([[.114,.192,-.216,.019],[.140,-.013,-.255,.021],[.121,-.295,-.281,.020],
      [.106,-.471,-.282,.017]]),mobile);
    line(k,back,'ledgerHide',p([[.077,.50,-.008,.052],[.194,.342,-.004,.069],
      [.320,.122,-.108,.054],[.279,-.222,-.193,.046]]),mobile);
    const slip=k.bone(hanging,s*.155,-.415,-.168);
    plate(k,slip,'ledgerPages',p([[-.063,.042,.023],[.048,.051,0],[.064,-.256,-.030],
      [.022,-.371,-.101],[-.062,-.332,-.064]]),.016);
    for(let row=0;row<4;row++){
      const y=-.046-row*.049;
      line(k,slip,'ledgerHide',p([[-.039,y,-.048],[.008,y+.007,-.058],[.037,y-.007,-.059]]
        .map(([x,y,z])=>[x,y,z,.008])),mobile);
    }
    flaps.push({joint:slip,axis:'x',amp:.22,bias:s*.097,seed:s*1.21});
  }
  flaps.push({joint:hanging,axis:'z',amp:.062,bias:-.15,seed:3.7});
}

export function buildKilnBack(k,back,flaps,mobile){
  const kiln=k.bone(back,0,.28,-.213);
  kiln.name='獄爐豬王 · 排爐背甲';
  shell(k,kiln,'kilnIron',[[0,-.391,.014,.189,.103],[0,-.248,-.016,.293,.165],
    [0,-.061,-.016,.349,.209],[0,.132,.011,.338,.193],[0,.276,.051,.255,.146],
    [0,.338,.107,.124,.086]],mobile,33,3.15);
  for(const s of signs){
    const p=q=>mirror(s,q);
    line(k,kiln,'edge',p([[.077,.329,.062,.046],[.260,.253,.019,.064],[.351,.123,-.036,.059],
      [.350,-.103,-.080,.063],[.243,-.286,-.092,.037],[.109,-.384,-.113,.029]]),mobile);
    for(let rung=0;rung<3;rung++){
      const y=.155-rung*.167,z=-.222+Math.abs(rung-1)*.018;
      const gate=k.bone(kiln,s*.129,y,z);
      const vent=p([[-.102,.069,.039],[.142,.093,.011],[.180,.039,-.034],
        [.155,-.062,-.045],[.067,-.095,-.064],[-.106,-.060,-.051]]);
      plate(k,gate,'deep',vent,.052);
      line(k,gate,'trim',vent.slice(0,5).map(([x,y,z0],i)=>[x,y,z0-.025,[.016,.026,.032,.023,.005][i]]),mobile);
      for(let i=0;i<2;i++)line(k,gate,'glow',p([[-.056,.023-i*.042,-.077,.013],[.063,.007-i*.041,-.088,.019],
        [.134,-.008-i*.043,-.076,.008]]),mobile);
      flaps.push({joint:gate,axis:'x',amp:.079+s*.017,bias:s*.083,seed:rung*.92+s*.31});
    }
  }
}

export function fitFoxHood(k,head,collar,mobile){
  finish(k,'frostHood',0x383750,.91,.096,'cloth');
  finish(k,'frostBinding',0x77718d,.81,.088,'cloth');
  const silks=[[0,-.273,-.084,.127,.116],[0,-.193,-.128,.233,.148],
    [0,.019,-.151,.263,.169],[0,.179,-.114,.240,.178],[0,.319,-.086,.195,.151],[0,.390,-.082,.062,.103]];
  shell(k,head,'frostHood',silks,mobile,11,2.14,true);
  for(const s of signs){
    const p=q=>mirror(s,q);
    shell(k,head,'frostHood',p([[.135,.152,.049,.116,.107],[.182,.238,.029,.130,.122],
      [.240,.376,-.012,.092,.085],[.280,.519,-.062,.060,.053],[.263,.642,-.089,.008,.013]]),mobile,23,2.14);
    shell(k,head,'frostBinding',p([[.147,.222,.127,.066,.030],[.208,.338,.088,.068,.049],
      [.256,.476,.039,.040,.030],[.267,.599,-.039,.009,.008]]),mobile,9,2.15);
    line(k,head,'frostBinding',p([[.066,.351,.052,.023],[.192,.278,.108,.033],[.225,.151,.130,.038],
      [.213,-.030,.158,.027],[.17,-.204,.201,.013]]),mobile);
    line(k,head,'frostBinding',p([[.035,.343,-.198,.014],[.168,.234,-.283,.025],
      [.209,.075,-.314,.027],[.159,-.162,-.265,.012]]),mobile);
    shell(k,collar,'frostHood',p([[.038,.077,-.144,.095,.086],[.132,.039,-.161,.118,.092],
      [.22,-.103,-.117,.118,.086],[.276,-.241,-.042,.100,.063]]),mobile,35,2.15);
  }
}

export function dressFoxGuardian(tools,body){
  for(let i=0;i<9;i++){
    const p=(i-4)/4,spread=Math.abs(p),r=Math.sign(p)||1,lag=((i+1)%3)*.035;
    tools.silk(body,'霜鐘狐僧 · 狐尾披帛 '+(i+1),[
      [p*.282,.296,-.206-lag,.107],[p*.537,.097-lag,-.379+spread*.057,.176],
      [p*.757,-.279-spread*.064,-.488-lag,.158],[p*(.877+.146*spread),-.709+spread*.075,-.50-lag,.104],
      [p*(1.02+.24*spread),-.98+spread*.107,-.548-r*.07,.020],
    ],{tint:i%3?0x575578:0x68607c,trim:i%2?0x9e9ab8:0x7b7ba3,lining:0x342f4d,
      across:[.90,p*.12,.22+spread*.30],style:'woven',flex:1.02+spread*.12,phase:i*.46});
  }
  return true;
}
