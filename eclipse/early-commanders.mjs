import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';

const mirror=(s,path)=>path.map(([x,...row])=>[s*x,...row]);
const sweep=(k,j,m,p,mobile)=>k.sculpt.sweep(j,m,p,{steps:mobile?10:16,sides:mobile?6:8,ridge:.22});
const volume=(k,j,m,p,mobile,seed=0)=>k.geometry(j,m,sculptVolume(p,{rings:mobile?12:19,
  sides:mobile?9:14,section:2.44,ridge:.17,seed}));
const solid=(k,j,m,p,d)=>k.sculpt.plate(j,m,p,d,d*.31);

export const commanderFinishes={
  emberIron:[0x702d27,.68,.49,'iron'],emberBone:[0xc2aba0,.14,.61,'bone'],
  emberHide:[0x916c54,.018,.88,'hide'],emberScar:[0x865047,.024,.88,'hide'],
  emberLacquer:[0x3e252d,.22,.57,'hide'],emberCloth:[0x643332,.08,.76,'cloth'],
  ghostSteel:[0x49647b,.66,.49,'iron'],ghostSilver:[0x9eafb2,.68,.41,'iron'],
  ghostGold:[0xb18a63,.58,.49,'bronze'],ghostInk:[0x272533,.08,.82,'cloth'],
  xiangFlesh:[0x817c72,.014,.86,'hide'],
};

const gaussian=(n,r)=>Math.exp(-((n/r)**2));

export function emberBody(k,body,sections,mobile){
  const geometry=sculptVolume(sections,{rings:mobile?29:40,sides:mobile?24:32,section:2.26,ridge:.085,seed:10});
  const {position,color}=geometry.attributes;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),a=Math.abs(x),y=position.getY(i),z=position.getZ(i);
    const front=Math.max(0,z)*3.6,rear=Math.max(0,-z)*3.5;
    const pec=gaussian(y-.411-a*.12,.107)*gaussian(a-.188,.151);
    const sternum=gaussian(a,.038)*gaussian(y-.32,.24);
    const belly=gaussian(y-.047,.18)*gaussian(a-.113,.11);
    const rib=gaussian(y-(.312-a*.32),.032)*gaussian(a-.197,.156);
    const scapula=gaussian(y-(.34+a*.36),.123)*gaussian(a-.238,.151);
    const spine=gaussian(x,.042)*gaussian(y-.24,.31);
    position.setZ(i,z+front*(pec*.059+belly*.026-sternum*.028-rib*.031)-rear*(scapula*.06-spine*.028));
    const stain=.98+front*(pec*.07-sternum*.06-rib*.13)+rear*(scapula*.055-spine*.084);
    color.setXYZ(i,color.getX(i)*stain,color.getY(i)*stain,color.getZ(i)*stain);
  }
  geometry.computeVertexNormals();
  k.geometry(body,'emberHide',geometry);
}

function forged(k,j,coat,rim,p,d,mobile){
  solid(k,j,coat,p,d);
  sweep(k,j,rim,p.slice(0,-1).map(([x,y,z],i)=>[x,y+.006,z+d*.42,i===0?.004:.012]),mobile);
}

function stud(k,g,m,x,y,z,r){
  k.mesh(g,'gem','black',x,y,z,r*1.19,r*1.25,r*.69);
  k.mesh(g,'gem',m,x,y,z+Math.sign(z)*r*.47,r,r*.93,r*.70);
}

function garments(){
  const strips=[];
  return {strips,add(parent,name,path,tint,trim,phase,flex,lining){
    strips.push({parent,name,path,tint,trim,phase,flex,lining});
  }};
}

function jointAnatomy(k,rig,mobile,{ember}){
  const shell=ember?'emberHide':'ghostSteel',w=ember?1.10:.83;
  for(const {shoulder,elbow,wrist,leg,knee,side:s} of rig.limbs){
    volume(k,shoulder,shell,mirror(s,[[0,.071,-.015,.128*w,.119*w],[.034,-.044,-.020,.159*w,.139*w],
      [.098,-.164,-.018,.142*w,.121*w],[.144,-.325,.016,.097*w,.103*w]]),mobile,3);
    volume(k,elbow,shell,mirror(s,[[.008,.045,.006,.097*w,.101*w],[.04,-.106,.011,.136*w,.128*w],
      [.032,-.244,.031,.102*w,.086*w],[.024,-.342,.053,.073*w,.071*w]]),mobile,17);
    volume(k,wrist,ember?'emberHide':'ochre',mirror(s,[[0,.053,.005,.048*w,.066*w],[.027,-.029,.029,.089*w,.091*w],
      [.027,-.098,.093,.069*w,.058*w]]),mobile,9);
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.041*w;
      sweep(k,wrist,ember?'emberHide':'ochre',[[x,.018,.058,.022],[x,-.054,.089,.029],
        [x+s*.01,-.098,.133,.020],[x+s*.017,-.071,.153,.014]],mobile);
      sweep(k,wrist,ember?'emberBone':'ghostSilver',[[x+s*.011,-.089,.122,.012],[x+s*.020,-.072,.153,.018],
        [x+s*.018,-.048,.161,.006]],mobile);
    }
    volume(k,leg,ember?'emberLacquer':'ghostInk',mirror(s,[[.003,.05,.004,.157*w,.129*w],[.017,-.101,.021,.16*w,.12*w],
      [.03,-.283,-.012,.132*w,.111*w],[.031,-.441,-.058,.092*w,.108*w]]),mobile,3);
    volume(k,knee,ember?'emberLacquer':'ghostSteel',mirror(s,[[0,.061,-.007,.109*w,.115*w],[.009,-.128,-.018,.101*w,.098*w],
      [.021,-.259,.026,.095*w,.081*w],[.027,-.302,.127,.122*w,.063*w],[.048,-.309,.223,.079*w,.058*w]]),mobile,8);
    const rim=ember?'brass':'ghostSilver';
    const hood=mirror(s,[[.022,.125,.123],[.103*w,.067,.098],[.108*w,-.117,.101],
      [.071,-.252,.138],[.001,-.303,.153],[-.05,-.176,.119],[-.067,-.021,.114]]);
    forged(k,knee,ember?'emberIron':'cobalt',rim,hood,.053,mobile);
    for(let i=0;i<3;i++)stud(k,knee,rim,s*.062,.015-i*.082,.149+i*.012,.013);
  }
}

function forgeAxe(k,hand,mobile){
  markEnemyWeapon(hand,[-.06,1.60,-.062],{from:[0,.09,0],width:.30});
  sweep(k,hand,'black',[[0,-.84,.016],[.008,-.30,.026],[.007,.32,.018],[.023,1.17,-.018]]
    .map(([x,y,z],i)=>[x,y,z,[.041,.047,.049,.054][i]]),mobile);
  const guard=k.bone(hand,.012,1.16,.002);
  const outer=[[-.188,.407,-.051],[-.374,.373,-.038],[-.478,.215,-.005],[-.474,-.017,.061],
    [-.387,-.214,.094],[-.233,-.327,.107],[-.058,-.349,.102],[.085,-.268,.07],[.04,-.071,.033]];
  const inner=[[-.205,.275,-.019],[-.334,.248,.003],[-.374,.123,.051],[-.369,-.011,.065],
    [-.297,-.151,.091],[-.17,-.195,.105],[-.103,-.149,.075],[-.073,-.065,.044],[.04,-.071,.033]];
  for(let i=0;i<outer.length-1;i++)forged(k,guard,i%3===1?'emberIron':'black','emberIron',
    [outer[i],outer[i+1],inner[i+1],inner[i]],.048,mobile);
  sweep(k,guard,'emberIron',outer.map(([x,y,z],i)=>[x,y,z+.018,i===0||i===8?.007:.031]),mobile);
  sweep(k,guard,'glow',outer.slice(0,7).map(([x,y,z],i)=>[x+.009,y,z+.033,i===0?.003:.008]),mobile);
  for(let i=0;i<3;i++){
    const [x,y,z]=inner[1+i*2];
    sweep(k,guard,i===1?'brass':'emberIron',[[.062,.075-i*.092,.088,.047],[x*.48,y*.62,z+.056,.042],
      [x*.82,y*.84,z+.018,.027],[x,y,z,.009]],mobile);
    stud(k,guard,'brass',x*.68,y*.72,z+.052,.026);
  }
  forged(k,guard,'black','brass',[[.005,-.221,.035],[.061,-.206,.018],[.119,-.067,-.02],
    [.112,.129,-.074],[.064,.215,-.082],[-.031,.114,-.002],[-.06,-.129,.077]],.063,mobile);
}

export function emberCommander(k,rig,hand,mobile){
  const {body,head,limbs}=rig;
  const cloth=garments(),toggles=[];
  jointAnatomy(k,rig,mobile,{ember:true});
  forgeAxe(k,hand,mobile);
  const crown=k.bone(head,0,.112,-.062);
  volume(k,crown,'emberBone',[[0,.012,-.021,.129,.091],[.004,.074,.002,.157,.131],
    [.014,.139,.013,.137,.114],[.035,.186,-.013,.092,.071],[.055,.210,-.052,.01,.01]],mobile,55);
  for(let i=0;i<11;i++){
    const x=(i-5)*.026,t=i/10;
    const tip=.18+.084*(1-Math.abs(t-.58)*1.72);
    volume(k,crown,i%3?'emberBone':'ivory',[[x,.029,.129- Math.abs(x)*.26,.018,.02],
      [x+.006,.098,.146-Math.abs(x)*.35,.027,.027],[x+.025,.164,.077-t*.083,.026,.028],
      [x+.057,tip,-.102-t*.072,.004,.005]],mobile,14+i);
  }
  for(const s of [-1,1])for(let i=0;i<4;i++){
    const y=.034-i*.027;
    sweep(k,crown,i%2?'emberBone':'ivory',mirror(s,[[.128,y,.064,.016],[.149,y+.031,.005,.025],
      [.146,y+.024,-.094,.024],[.119,y-.009,-.144,.004]]),mobile);
  }
  for(const {elbow,shoulder,side:s} of limbs){
    const strap=k.bone(shoulder,s*.038,-.05,.029);
    strap.rotation.y=s*.31;
    forged(k,strap,s>0?'emberIron':'emberLacquer','brass',mirror(s,[[.021,.137,.056],[.163,.164,.012],
      [.217,.056,-.108],[.183,-.087,-.094],[.083,-.151,.022],[.037,-.103,.137]]),.049,mobile);
    for(let i=0;i<3;i++){
      const y=.02-i*.094;
      forged(k,elbow,i===1?'emberIron':'emberLacquer','brass',mirror(s,[[-.052,y+.037,.107],[.094,y+.061,.103],
        [.144,y-.006,.066],[.106,y-.051,.119],[.007,y-.076,.151],[-.048,y-.018,.124]]),.041,mobile);
    }
    for(let i=0;i<3;i++)sweep(k,shoulder,'emberScar',mirror(s,[[.107,.051-i*.055,.108,.005],
      [.166,.053-i*.061,.099,.011],[.192,-.019-i*.055,.083,.014],[.156,-.084-i*.058,.108,.004]]),mobile);
    const armor=k.bone(body,s*.244,.28,-.205);
    armor.rotation.y=s*.55;
    for(let i=0;i<3;i++)forged(k,armor,'emberLacquer','emberIron',mirror(s,[[.034,.29-i*.13,-.022],[.157,.3-i*.14,-.012],
      [.215,.189-i*.13,.055],[.157,.109-i*.13,.015],[.073,.128-i*.137,-.083],[.011,.196-i*.12,-.061]]),.046,mobile);
    cloth.add(body,'五運・炎 腰裙 '+s,mirror(s,[[.14,-.08,.312,.137],[.181,-.204,.363,.181],
      [.254,-.49,.435,.162],[.292,-.867,.49,.062]]),0x672e2c,0xb89956,s*.84,.92,0x28262d);
    cloth.add(body,'五運・炎 側手巾 '+s,mirror(s,[[.247,.47,-.195,.063],[.343,.226,-.281,.102],
      [.389,-.219,-.369,.129],[.463,-.69,-.566,.016]]),0x41333c,0x976745,s*1.03,1.07,0x292731);
    toggles.push({joint:armor,side:s});
  }
  const apron=k.bone(body,.006,-.021,.25);
  forged(k,apron,'emberLacquer','brass',[[-.154,.108,.061],[-.078,.148,.088],[.074,.141,.102],
    [.169,.103,.061],[.109,-.082,.122],[0,-.153,.150],[-.122,-.054,.102]],.051,mobile);
  stud(k,apron,'glow',0,.034,.145,.033);
  const backHarness=k.bone(body,.003,.595,-.216);
  sweep(k,backHarness,'emberLacquer',[[-.265,-.015,.066,.029],[-.154,-.143,-.072,.047],
    [-.021,-.26,-.101,.051],[.139,-.408,-.102,.044],[.283,-.551,-.045,.03]],mobile);
  for(let i=0;i<3;i++)sweep(k,backHarness,'brass',[[.032+i*.046,-.25-i*.084,-.146,.008],
    [.106+i*.054,-.236-i*.081,-.16,.017],[.128+i*.052,-.306-i*.079,-.147,.015],
    [.071+i*.042,-.322-i*.082,-.139,.004]],mobile);
  return {strips:cloth.strips,pose({beat,travel,wind,strike}){
    for(const {joint,side} of toggles)joint.rotation.y=side*(.55+Math.sin(beat*.72)*.029+travel*.08+wind*.1-strike*.16);
    apron.rotation.x=travel*.12+strike*.21;
    crown.rotation.z=.017*Math.sin(beat*.92)+strike*.044;
  }};
}

function spectralSpear(k,hand,mobile){
  markEnemyWeapon(hand,[0,1.95,-.086],{from:[0,.56,.02],width:.19});
  sweep(k,hand,'black',[[0,-1.11,0,.035],[0,-.48,.007,.044],[0,.39,0,.042],[0,1.49,-.015,.045]],mobile);
  const blade=k.bone(hand,0,1.167,.027);
  const profile=[[-.102,-.015,.08],[-.15,.133,.044],[-.065,.344,-.026],[.004,.782,-.116],
    [.105,.357,-.076],[.142,.125,-.032],[.076,-.014,.061],[.005,-.067,.092]];
  forged(k,blade,'ghostSilver','ghostSteel',profile,.041,mobile);
  for(const side of [-1,1]){
    forged(k,blade,'ghostSteel','ghostSilver',mirror(side,[[.016,-.181,.044],[.123,-.08,.03],[.224,.068,-.065],
      [.196,-.133,-.081],[.108,-.264,-.016],[.042,-.26,.04]]),.052,mobile);
    sweep(k,blade,'glow',mirror(side,[[.026,-.15,.078,.013],[.097,-.07,.073,.014],
      [.154,.013,.025,.011],[.206,.05,-.039,.002]]),mobile);
  }
  sweep(k,blade,'glow',[[0,-.095,.15,.019],[.013,.21,.071,.016],[.008,.472,.022,.010],[.004,.782,-.111,.002]],mobile);
  for(let i=0;i<4;i++){
    const y=-.12-i*.077;
    forged(k,blade,i%2?'ghostGold':'ghostSteel','ghostSilver',[[-.061,y,.035],[.052,y,.05],
      [.07,y-.04,.068],[-.005,y-.067,.106],[-.071,y-.046,.061]],.027,mobile);
  }
}

export function xiangCommander(k,rig,weapon,mobile){
  const {body,head,limbs}=rig;
  const cloth=garments(),hinges=[];
  jointAnatomy(k,rig,mobile,{ember:false});
  spectralSpear(k,weapon,mobile);
  const hair=k.bone(head,0,.082,-.013);
  volume(k,hair,'black',[[0,.013,-.065,.127,.085],[.007,.068,-.038,.146,.125],
    [.015,.124,-.048,.128,.131],[.028,.153,-.068,.094,.099],[.041,.182,-.081,.018,.03]],mobile,31);
  for(let i=0;i<6;i++){
    const x=(i-2.5)*.041;
    sweep(k,hair,i%2?'black':'ghostSteel',[[x,.053,.088,.007],[x+.013,.106,.058,.017],
      [x+.04,.147,-.014,.018],[x+.054,.15,-.099,.004]],mobile);
  }
  const plume=k.bone(head,.012,.175,-.081);
  volume(k,plume,'black',[[0,-.051,-.022,.119,.105],[.011,.052,-.014,.133,.121],[.018,.128,.016,.111,.099],
    [.026,.226,-.06,.068,.066],[.081,.329,-.208,.021,.022]],mobile,13);
  sweep(k,plume,'ghostGold',[[.127,.121,-.049,.013],[.096,.161,.037,.019],[-.018,.17,.072,.021],
    [-.107,.143,.018,.019],[-.121,.112,-.089,.008]],mobile);
  for(let n=0;n<5;n++)sweep(k,plume,n%3?'black':'ghostSteel',[[.015+n*.014,.215,-.09,.023],
    [.072+n*.018,.289,-.187,.034],[.15+n*.021,.233,-.305,.03],
    [.19+n*.024,.119,-.379-n*.016,.004]],mobile);
  for(const {shoulder,elbow,side:s} of limbs){
    const cover=k.bone(shoulder,s*.017,.036,-.016);
    cover.rotation.y=s*.25;
    for(let i=0;i<(s<0?4:3);i++){
      const y=-i*.08;
      const edge=(s<0?.265:.198)-i*.018;
      forged(k,cover,i%2?'cobalt':'ghostSteel','ghostSilver',mirror(s,[[.009,y+.092,.089],[.103,y+.174,.027],
        [edge,y+.19,-.035],[edge+.046,y+.095,-.148],[.171,y-.053,-.143],[.088,y-.047,.086],[.034,y+.006,.145]]),.051,mobile);
      stud(k,cover,'ghostGold',s*.126,y+.093,.097,.022);
    }
    forged(k,elbow,'ghostSteel','ghostGold',mirror(s,[[.061,.101,.114],[.131,.047,.083],
      [.151,-.116,.089],[.089,-.314,.138],[.001,-.274,.161],[-.051,-.094,.137],[-.044,.019,.116]]),.059,mobile);
    sweep(k,elbow,'ghostSilver',mirror(s,[[.064,.063,.145,.012],[.099,-.042,.15,.021],
      [.065,-.175,.155,.019],[.04,-.267,.172,.003]]),mobile);
    for(let row=0;row<4;row++){
      const y=.48-row*.107;
      forged(k,body,row%2?'ghostSteel':'cobalt','ghostGold',mirror(s,[[.028,y+.061,.273],[.129,y+.091,.228],
        [.293,y+.044,.137],[.315,y-.044,.177],[.212,y-.109,.244],[.083,y-.126,.300],[.018,y-.055,.293]]),.048,mobile);
    }
    sweep(k,head,'ghostSteel',mirror(s,[[.091,.021,.13,.018],[.141,.068,.07,.025],
      [.184,.084,-.065,.03],[.188,.025,-.14,.022],[.156,-.089,-.186,.006]]),mobile);
    cloth.add(body,'鳴隙署・八針織者 玄錦大氅 '+s,mirror(s,[[.15,.61,-.193,.114],[.258,.267,-.309,.177],
      [.321,-.36,-.48,.208],[.379,-.894,-.72,.136],[.428,-1.058,-.757,.063]]),0x2e303b,0xa28567,s*.72,1.06,0x352a37);
    cloth.add(body,'鳴隙署・八針織者 甲下藍襬 '+s,mirror(s,[[.127,.049,.245,.093],[.145,-.252,.305,.139],
      [.20,-.571,.356,.171],[.24,-.964,.36,.075]]),0x3c5373,0xb0a281,s*.4,.91,0x262936);
    for(let i=0;i<3;i++){
      const u=i*.13;
      sweep(k,body,'ghostGold',mirror(s,[[.094,.526-u,-.241,.020],[.198,.50-u,-.292,.027],
        [.289,.395-u,-.298,.023],[.316,.275-u,-.352,.004]]),mobile);
    }
    hinges.push({cover,side:s});
  }
  for(const s of [-1,1]){
    sweep(k,head,'black',mirror(s,[[.013,-.077,.099,.008],[.049,-.066,.126,.016],
      [.073,-.077,.122,.020],[.098,-.109,.111,.009],[.109,-.141,.086,.003]]),mobile);
    for(let i=0;i<4;i++){
      const x=.015+i*.018;
      volume(k,rig.jaw,i%3?'black':'ghostSteel',mirror(s,[[x,.004,.096,.024,.017],
        [x*.91,-.053,.107,.026,.023],[x*.68,-.137,.102,.024,.019],
        [x*.34,-.217+i*.022,.074,.003,.004]]),mobile,27+i);
    }
  }
  return {strips:cloth.strips,pose({beat,wind,strike,travel}){
    for(const {cover,side} of hinges)cover.rotation.y=side*(.25+wind*.10-strike*.19+Math.sin(beat*.79)*travel*.13);
    plume.rotation.x=wind*.06-strike*.137;
    plume.rotation.z=Math.sin(beat*.79)*.038+travel*.12;
  }};
}
