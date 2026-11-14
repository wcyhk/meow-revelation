import {featherVane,sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const reflect=(side,points)=>points.map(([x,...rest])=>[x*side,...rest]);
const at=(x,y,z,points)=>points.map(([a,b,c,...rest])=>[a+x,b+y,c+z,...rest]);
const plate=(k,bone,finish,points,depth=.021)=>k.sculpt.plate(bone,finish,points,depth,depth*.31);
const line=(k,bone,finish,points,mobile)=>k.sculpt.sweep(bone,finish,points,{
  sides:mobile?6:8,steps:mobile?8:12,ridge:.17,
});
const inset=(k,bone,finish,x,y,z,w,h,d,rotation=0)=>k.mesh(bone,'gem',finish,x,y,z,w,h,d,0,0,rotation);

// [face, trim, side silhouette, back silhouette, brow, crown, scapula width, scapula depth]
// A raised brow is a mask or a headpiece. Bare faces retain the facial geometry and jaw animation.
const helms={
  m003:['teal','ivory','tusk','knots',.19,.121,.47,-.29],
  m004:['steel','ochre','wing','spine',.13,.174,.33,-.21],
  m006:['black','ochre','sash','knots',.121,.085,.341,-.256],
  m008:['rind','trim','orchid','scales',.12,.223,.31,-.21],
  m009:['jade','brass','fork','roots',.164,.261,.326,-.26],
  m010:['jade','steel','wing','scales',.107,.227,.321,-.30],
  m011:['clay','brass','tusk','ribs',.14,.201,.40,-.29],
  m012:['cobalt','steel','orchid','spine',.121,.172,.303,-.25],
  m013:['ochre','brass','fork','ribs',.138,.237,.303,-.27],
  m016:['rind','trim','wing','spine',.13,.291,.33,-.27],
  m017:['rind','trim','fork','knots',.151,.244,.32,-.25],
  m018:['black','brass','pagoda','spine',.144,.31,.36,-.29],
  m019:['cobalt','ivory','orchid','scales',.134,.225,.288,-.218],
  m020:['black','steel','wing','ribs',.15,.226,.382,-.245],
  m021:['porcelain','trim','veil','spine',.092,.178,.286,-.255],
  m023:['ochre','ivory','tusk','knots',.179,.211,.46,-.24],
  m027:['coal','rust','tusk','ribs',.26,.385,.558,-.388],
  m028:['ochre','ivory','ear','scales',.141,.175,.313,-.243],
  m029:['clay','brass','sash','knots',.124,.117,.316,-.209],
  m031:['black','brass','pagoda','spine',.143,.284,.34,-.25],
  m032:['cobalt','ivory','orchid','scales',.106,.121,.276,-.217],
  m033:['clay','ivory','fang','ribs',.137,.182,.217,-.25],
  m034:['steel','ivory','ear','scales',.119,.168,.291,-.231],
  m035:['clay','brass','tusk','ribs',.154,.212,.35,-.277],
  m036:['cobalt','steel','veil','spine',.169,.222,.354,-.292],
  m037:['moss','jade','wing','roots',.154,.175,.38,-.283],
  m038:['ochre','brass','fork','knots',.171,.205,.363,-.30],
  m039:['cobalt','ivory','veil','knots',.149,.193,.318,-.264],
  m040:['teal','brass','orchid','scales',.109,.163,.311,-.251],
  m041:['jade','steel','fang','roots',.153,.185,.326,-.26],
  m042:['ochre','steel','wing','spine',.127,.183,.314,-.257],
  m043:['black','brass','fork','ribs',.183,.257,.505,-.298],
  m044:['cobalt','steel','veil','spine',.162,.174,.54,-.334],
  m045:['jade','ironRim','ear','roots',.201,.226,.58,-.344],
  m046:['clay','brass','fang','scales',.182,.293,.503,-.318],
  m047:['black','brass','pagoda','knots',.203,.308,.561,-.36],
  m048:['cobalt','steel','orchid','ribs',.171,.255,.555,-.356],
  m049:['moss','brass','wing','roots',.201,.199,.585,-.345],
  m050:['clay','ironRim','tusk','spine',.197,.325,.601,-.343],
  m051:['black','brass','fang','ribs',.135,.191,.385,-.295],
  m056:['jade','ivory','veil','roots',.164,.23,.328,-.284],
};
const contour={
  tusk:[[.09,.07,.05],[.26,.106,-.04],[.34,.035,-.129],[.30,-.058,-.210],[.191,-.075,-.165]],
  wing:[[.12,.037,.052],[.24,.12,-.015],[.367,.174,-.17],[.31,.061,-.231],[.17,-.065,-.214]],
  sash:[[.095,.024,.075],[.24,.043,.007],[.286,-.013,-.12],[.247,-.103,-.234],[.16,-.065,-.216]],
  orchid:[[.107,.049,.029],[.216,.141,-.021],[.286,.15,-.168],[.263,.036,-.249],[.146,-.046,-.199]],
  fork:[[.129,.037,.026],[.223,.088,-.083],[.292,.215,-.191],[.292,.078,-.246],[.159,-.038,-.227]],
  pagoda:[[.080,.031,.026],[.226,.08,-.019],[.276,.063,-.186],[.249,.01,-.265],[.144,-.047,-.238]],
  veil:[[.086,.042,.057],[.183,.11,.002],[.25,.079,-.14],[.273,-.039,-.246],[.175,-.081,-.238]],
  ear:[[.106,.056,.026],[.187,.121,-.048],[.21,.215,-.23],[.278,.086,-.243],[.174,-.055,-.226]],
  fang:[[.112,.061,.043],[.209,.096,-.023],[.302,.082,-.125],[.254,-.104,-.222],[.163,-.085,-.172]],
};
const backShapes={
  knots:[[0,.125],[.63,.112],[1,.04],[.72,-.107],[.22,-.095],[.055,-.047]],
  spine:[[0,.086],[.83,.145],[1,.052],[.82,-.122],[.23,-.085],[.10,-.143]],
  roots:[[0,.128],[.63,.074],[1,.119],[.82,.015],[.46,-.076],[.10,-.10]],
  ribs:[[0,.073],[.79,.102],[1,.038],[.78,-.063],[.39,-.123],[.10,-.073]],
  scales:[[0,.132],[.55,.093],[1,.065],[.77,-.063],[.31,-.151],[.068,-.039]],
};

function cheekRelief(k,head,mobile,profile,id){
  const [metal,rim,shape,,width,height]=profile;
  // Month-court figures use hair ornaments. The shrine knights and war gods wear a fitted mask.
  const faceArmor=['m012','m016','m017','m027','m033','m035','m036','m037','m038','m041',
    'm043','m044','m045','m046','m047','m048','m049','m050','m051'].includes(id);
  const spirit=['m008','m021','m056'].includes(id);
  const depth=id==='m027'?.337:id==='m033'?.195:spirit?.158:.108;
  const offsetY=spirit?-.044:0;
  for(const side of sides){
    const surface=at(0,offsetY,0,reflect(side,[
      [width*.24,.090,depth+.068],[width*.59,.119,depth+.052],[width*.97,.100,depth+.016],
      [width*1.25,.065,depth-.049],[width*.83,.038,depth+.019],[width*.41,.063,depth+.064],
    ]));
    if(faceArmor){
      plate(k,head,'deep',surface,.022);
      line(k,head,rim,surface.slice(0,4).map(([x,y,z],i)=>[x,y+.010,z+.015,[.009,.017,.020,.003][i]]),mobile);
      const eye=surface[4];
      inset(k,head,'glow',eye[0]*.79,eye[1]+.022,eye[2]+.030,.022,.008,.008,side*.12);
      for(let n=0;n<2;n++){
        const y=-.052-n*.044,v=width*(1-.18*n);
        const guard=reflect(side,[[v*.24,y+.026,depth+.074],[v*.70,y+.059,depth+.052],
          [v*1.19,y+.045,depth-.012],[v*1.22,y-.018,depth-.058],[v*.8,y-.047,depth+.029],
          [v*.47,y-.037,depth+.069]]);
        plate(k,head,n%2?rim:metal,guard,.028);
        line(k,head,n%2?metal:rim,guard.slice(0,4).map(([x,y,z],i)=>[x,y,z+.014,[.004,.008,.009,.003][i]]),mobile);
      }
    }else{
      const temple=surface.slice(2,5);
      line(k,head,metal,temple.map(([x,y,z],i)=>[x*(1.07+i*.075),y-.047*i,z+.011,[.017,.023,.004][i]]),mobile);
      inset(k,head,rim,side*width*1.14,.031+offsetY,depth-.001,.023,.028,.016,side*.23);
    }
    const curve=reflect(side,contour[shape].map(([x,y,z])=>[x*(width/.158),y+height*.72,z]));
    const outside=curve.slice(1,4).map(([x,y,z])=>[x*1.012,y-.039,z-.034]).reverse();
    plate(k,head,metal,[...curve,...outside],.030);
    line(k,head,rim,curve.map(([x,y,z],i)=>[x,y+.007,z+.018,[.007,.015,.018,.012,.003][i]]),mobile);
    for(let row=0;row<(mobile?3:4);row++){
      const y=height*.72+.018-row*.052,shell=(1-row*.078),z=-.214+row*.007;
      const collar=reflect(side,[[.008,y+.04,z-.036],[width*.62,y+.046,z-.029],
        [width*1.21,y+.020,z+.023],[width*1.34,y-.019,z+.039],[width*.86*shell,y-.047,z-.019],
        [.025,y-.041,z-.052]]);
      plate(k,head,row%2?rim:metal,collar,.018);
      inset(k,head,'trim',side*width*.84*shell,y-.019,z-.044,.012,.013,.008);
    }
    if(id==='m003'||id==='m023'){
      const lip=id==='m003'?-.141:-.135;
      line(k,head,'deep',reflect(side,[[.036,lip,.167,.008],[.078,lip+.018,.191,.014],
        [.145,lip+.007,.176,.012],[.173,lip+.036,.139,.003]]),mobile);
      line(k,head,'ivory',reflect(side,[[.104,lip,.183,.022],[.113,lip+.05,.203,.020],
        [.125,lip+.095,.191,.013],[.125,lip+.126,.173,.002]]),mobile);
    }
  }
  if(faceArmor){
    const ridge=[[0,.161,depth+.036,.043,.019],[0,.097,depth+.071,.033,.025],
      [0,.021,depth+.089,.019,.020],[0,-.027,depth+.092,.028,.016],[0,-.068,depth+.065,.009,.008]];
    k.geometry(head,metal,sculptVolume(ridge,{rings:mobile?13:19,sides:mobile?10:16,section:2.63,ridge:.10}));
    inset(k,head,rim,0,.152,depth+.064,.026,.034,.017);
  }
}

function rearScapula(k,torso,mobile,profile,highest){
  const [metal,rim,,form,,,width,depth]=profile;
  const contour=backShapes[form];
  const spine=contour.slice(0,4);
  const scale=width/.49;
  for(const side of sides){
    for(let row=0;row<(mobile?2:3);row++){
      const y=highest-row*.14,half=width*(.97-row*.076),z=depth-row*.011;
      const face=reflect(side,contour.map(([x,h])=>[half*x,y+h*scale,z-.050*Math.sin(x*2.1)]));
      plate(k,torso,row%2?metal:'deep',face,.035);
      line(k,torso,rim,face.slice(2,6).map(([x,y,z],i)=>[x,y-.01,z-.035,[.004,.016,.014,.004][i]]),mobile);
      line(k,torso,metal,reflect(side,spine.map(([x,h],i)=>[half*x*.86,y+h*scale-.033,z-.06,[.003,.013,.017,.002][i]])),mobile);
      inset(k,torso,rim,side*half*.70,y+.025,z-.058,.018*scale,.022*scale,.014);
      inset(k,torso,'deep',side*half*.35,y-.030,z-.057,.015,.009,.012);
    }
    const [w,d]=[width,depth];
    line(k,torso,metal,reflect(side,[[w*.61,highest+.043,d+.027,.023],[w*.91,highest-.063,d+.060,.036],
      [w*1.07,highest-.21,d+.159,.039],[w*.92,highest-.32,d+.22,.010]]),mobile);
  }
}

function oniBindings(k,{body,head},mobile){
  for(const side of sides){
    const front=reflect(side,[[.112,.646,.085,.024],[.187,.554,.237,.048],
      [.216,.372,.306,.049],[.257,.193,.321,.04],[.257,-.112,.261,.026]]);
    const rear=reflect(side,[[.112,.648,.089,.023],[.152,.59,-.129,.047],
      [.201,.423,-.27,.046],[.238,.091,-.298,.045],[.257,-.112,-.244,.025]]);
    line(k,body,'black',front,mobile);
    line(k,body,'black',rear,mobile);
    for(const segment of [front,rear])line(k,body,'ochre',segment.map(([x,y,z,w],i)=>
      [x*1.175,y,z+(segment===front?.017:-.025),w*(i===0||i===segment.length-1?.25:.27)]),mobile);
    for(let i=0;i<(mobile?4:7);i++){
      const y=.242+i*.030,z=.221-i*.018,x=.169+i*.016;
      line(k,body,'teal',reflect(side,[[x,y,z,.005],[x+.079,y+.033,z+.017,.014],
        [x+.16,y+.018,z-.023,.008],[x+.188,y+.031,z-.058,.002]]),mobile);
    }
    line(k,head,'ochre',reflect(side,[[.137,.18,.055,.016],[.191,.17,-.022,.021],
      [.216,.126,-.126,.019],[.197,.08,-.194,.004]]),mobile);
  }
  for(let i=0;i<3;i++){
    const z=.024-i*.019,y=.203+i*.045;
    line(k,head,i%2?'brass':'ochre',[[-.070+i*.007,y,z+.139,.007],[-.044,y-.014,z+.148,.011],
      [.029,y-.013,z+.145,.011],[.071-i*.011,y,z+.131,.006]],mobile);
  }
}

function bansheeHair(k,{body,head},mobile,id){
  const priest=id==='m056',short=priest?.81:.46;
  for(const side of sides){
    for(let n=0;n<(mobile?6:10);n++){
      const t=n/(mobile?5:9);
      const strand=[.018+.177*t,.135+.061*t,.135-.137*t];
      const bend=[.072+.18*t,.229+.022*t,-.032-.072*t];
      const end=[.103+.31*t,short*(-.17-.47*t),-.183-.078*t];
      const coords=reflect(side,[strand,bend,end]);
      k.geometry(head,n%4===2?'steel':n%3?'ivory':'black',
        featherVane(...coords,.035+.023*Math.sin(t*2.6),14+n,mobile?12:18));
      line(k,head,n%3?'ivory':'steel',coords.map(([x,y,z],index)=>[x,y+.007,z,[.009,.020,.001][index]]),mobile);
    }
    if(priest){
      const flare=reflect(side,[[.107,.162,.120,.025],[.143,.219,.068,.034],
        [.177,.258,-.048,.036],[.218,.247,-.164,.022],[.257,.182,-.229,.002]]);
      line(k,head,'jade',flare,mobile);
      line(k,head,'ivory',flare.map(([x,y,z,r])=>[x+side*.020,y+.009,z+.007,r*.42]),mobile);
      const leaf=reflect(side,[[.05,.403,-.303],[.177,.445,-.344],[.336,.402,-.363],
        [.319,.299,-.358],[.21,.197,-.376],[.055,.215,-.37]]);
      plate(k,body,'jade',leaf,.032);
      line(k,body,'steel',leaf.slice(1,5).map(([x,y,z],i)=>[x,y,z-.023,[.007,.014,.017,.004][i]]),mobile);
      inset(k,body,'glow',side*.216,.362,-.387,.019,.029,.008,side*.23);
    }
  }
}

function dragonNeck(k,{body,head},mobile){
  const neck=head.parent;
  for(const side of sides){
    for(let i=0;i<(mobile?4:7);i++){
      const t=i/(mobile?3:6),z=.053+.52*t,y=.07+.42*t;
      const keel=reflect(side,[[.045,y+.082,z-.104],[.123-.032*t,y+.115,z-.064],
        [.191-.034*t,y+.05,z-.064],[.175-.03*t,y-.056,z+.083],
        [.092-.019*t,y-.04,z+.137],[.054,y+.013,z+.067]]);
      plate(k,neck,i%3?'moss':'ochre',keel,.024);
      line(k,neck,i%3?'ochre':'edge',keel.slice(1,5).map(([x,y,z],i)=>[x,y+.007,z,[.008,.013,.010,.002][i]]),mobile);
    }
    const wing=body.children.find(part=>Math.abs(part.position.x-.245*side)<.001&&Math.abs(part.position.z-.126)<.001);
    if(!wing)continue;
    for(let i=0;i<3;i++){
      const f=i*.118;
      const scale=reflect(side,[[.052+f,.147+f*.61,-.016],[.138+f,.211+f*.53,-.08],
        [.227+f,.208+f*.35,-.152],[.184+f,.146+f*.42,-.241],
        [.076+f,.105+f*.46,-.174],[.016+f,.112+f*.65,-.064]]);
      plate(k,wing,'moss',scale,.031);
      line(k,wing,'ochre',scale.slice(0,4).map(([x,y,z],n)=>[x,y+.018,z,[.004,.012,.011,.003][n]]),mobile);
    }
  }
}

// The top jaw, eye sockets and scales are fitted against each separate neck/head rig.
// [base, ridge, outline, muzzle depth, skull width, brow height, back width, back height]
const beasts={
  m001:['rind','edge','hood',.326,.231,.076,.18,.34],
  m002:['body','trim','hood',.349,.259,.081,.23,.39],
  m005:['ivory','ash','bear',.527,.303,.118,.50,.71],
  m007:['clay','brass','dragon',.429,.194,.099,.30,.179],
  m014:['coal','ember','dragon',.591,.31,.16,.48,.37],
  m015:['coal','ember','bird',.492,.224,.145,.38,.17],
  m022:['moss','steel','beak',.32,.223,.088,.41,.48],
  m024:['moss','ochre','dragon',.429,.2,.108,.30,.16],
  m030:['black','ivory','beak',.238,.233,.063,.27,.33],
  m052:['ivory','steel','hound',.40,.221,.092,.34,.24],
  m053:['black','ochre','hound',.40,.212,.092,.38,.27],
  m054:['ochre','brass','hound',.407,.219,.099,.34,.27],
  m055:['cobalt','steel','dragon',.554,.249,.146,.31,.38],
};

const energies={
  m001:[0xab76de,'ribbons',[0,.49,-.08],[.75,.84,1.20]],
  m002:[0xc781f1,'bolts',[0,.23,.30],[.63,.94,.84]],
  m003:[0x87c6c0,'mist',[0,.16,-.03],[.55,.42,.47]],
  m004:[0xb8daef,'ribbons',[0,.07,-.43],[.44,.33,.58]],
  m005:[0xa7e2df,'embers',[0,.07,.18],[.62,.44,.32]],
  m006:[0x83ac76,'ribbons',[0,.20,-.13],[.39,.50,.44]],
  m007:[0xff8540,'embers',[0,.10,-.36],[.55,.69,.53]],
  m008:[0x8fdec8,'sigils',[0,.63,-.29],[.54,.57,.38]],
  m009:[0x96cf6f,'ribbons',[0,.70,-.34],[.63,.52,.41]],
  m010:[0x9fd4ad,'ribbons',[0,.58,-.33],[.64,.49,.42]],
  m011:[0xee754a,'embers',[.14,.33,.20],[.47,.55,.26]],
  m012:[0x9bdce5,'mist',[0,.36,-.26],[.53,.35,.45]],
  m013:[0xf2c070,'bolts',[0,.53,-.34],[.55,.64,.28]],
  m014:[0xf97b45,'embers',[0,.4,-.32],[.71,.48,.76]],
  m015:[0xffb163,'embers',[0,.13,-.32],[.51,.49,.73]],
  m016:[0xeabb78,'sigils',[0,.35,.14],[.59,.57,.48]],
  m017:[0x8ec9eb,'sigils',[0,.49,-.28],[.58,.66,.34]],
  m018:[0xeab06c,'sigils',[0,.59,-.42],[.69,.61,.38]],
  m019:[0x9ee5f5,'mist',[0,.20,-.15],[.72,.50,.73]],
  m020:[0x91d0ef,'bolts',[0,.28,-.21],[.67,.51,.38]],
  m021:[0xe7be72,'sigils',[0,.94,-.15],[.60,.61,.31]],
  m022:[0x89cef4,'mist',[0,.27,-.21],[.84,.46,.62]],
  m023:[0x99bb77,'ribbons',[-.15,.32,.05],[.49,.59,.49]],
  m024:[0xaac879,'mist',[0,.19,-.01],[.38,.25,.54],true],
  m027:[0xec624d,'embers',[0,.48,-.44],[.85,.69,.61]],
  m028:[0x9be0ac,'bolts',[0,.39,-.32],[.56,.59,.41]],
  m029:[0xf5ab63,'ribbons',[0,.18,-.33],[.48,.40,.48]],
  m030:[0xec8456,'embers',[0,.37,-.30],[.66,.56,.58]],
  m031:[0xffb064,'sigils',[0,.73,-.31],[.56,.64,.34]],
  m032:[0x90d5ed,'mist',[0,.37,.26],[.53,.49,.33]],
  m033:[0xff966f,'embers',[0,.19,-.14],[.60,.53,.37]],
  m034:[0xaccaee,'bolts',[0,.43,-.36],[.76,.52,.52]],
  m035:[0xff8a5f,'embers',[0,.63,-.38],[.63,.61,.27]],
  m036:[0xa9c5ff,'mist',[0,.63,-.38],[.68,.53,.32]],
  m037:[0xa7d989,'ribbons',[0,.63,-.39],[.68,.56,.34]],
  m038:[0xf7ca77,'bolts',[0,.62,-.36],[.69,.66,.31]],
  m039:[0xc2c3ef,'sigils',[0,.73,-.36],[.68,.69,.27]],
  m040:[0x7bdfe6,'ribbons',[0,.45,-.27],[.65,.53,.37]],
  m041:[0xa8ca79,'ribbons',[.16,.35,.10],[.45,.59,.46]],
  m042:[0xdabc74,'ribbons',[0,.13,-.28],[.72,.38,.56]],
  m043:[0xbe91f9,'bolts',[0,.43,-.38],[.83,.65,.38]],
  m044:[0x8cd6ff,'mist',[0,.29,-.42],[.85,.47,.50]],
  m045:[0xbdcb8a,'ribbons',[0,.49,-.41],[.88,.53,.39]],
  m046:[0xf09658,'embers',[0,.33,-.35],[.75,.57,.37]],
  m047:[0xffc668,'bolts',[0,.45,-.35],[.91,.66,.47]],
  m048:[0xa3e0ff,'ribbons',[0,.33,-.42],[.92,.55,.46]],
  m049:[0xbcde83,'sigils',[0,.45,-.44],[.90,.59,.38]],
  m050:[0xffac73,'embers',[0,.45,-.42],[.89,.64,.49]],
  m051:[0xe89575,'ribbons',[0,.58,-.32],[.69,.57,.36]],
  m052:[0xc1e2f8,'mist',[0,.11,-.34],[.60,.33,.75]],
  m053:[0xf08a55,'embers',[0,.21,-.28],[.54,.41,.79]],
  m054:[0xf6bd71,'bolts',[0,.21,-.27],[.62,.39,.70]],
  m055:[0x8adee7,'sigils',[0,.46,-.33],[.61,.50,.57]],
  m056:[0xa2d3a0,'ribbons',[0,.63,-.33],[.65,.64,.45]],
};

function beastFace(k,parts,mobile,model,id){
  const [hide,ridge,outline,z,w,y,back,yBack]=model;
  const {body}=parts;
  const head=parts.head??body.children[0]?.children[0];
  if(!head)return;
  const hooked=['bird','beak'].includes(outline);
  const hood=outline==='hood';
  const canine=outline==='hound'||outline==='bear';
  const front=id==='m005'?-.038:id==='m014'?.031:canine?-.038:-.004;
  const section=[
    [0,front-.015,z+.032,w*.20,.031],[0,front+.020,z+.020,w*.40,.056],
    [0,front+.065,z-.067,w*.56,.047],[0,y+.014,z-.149,w*.79,.052],
    [0,y+.033,z-.23,w*.67,.045],
  ];
  k.geometry(head,hide,sculptVolume(section,{rings:mobile?14:21,sides:mobile?10:16,section:2.3,ridge:.24}));
  if(!hooked)inset(k,head,'deep',0,front+.034,z+.053,w*.24,.034,.028);
  for(const side of sides){
    const orbital=reflect(side,[[w*.33,y-.019,z-.085],[w*.63,y+.049,z-.138],[w*.96,y+.025,z-.222],
      [w*.81,y-.044,z-.214],[w*.51,y-.059,z-.12]]);
    plate(k,head,'deep',orbital,.028);
    line(k,head,hide,orbital.slice(0,3).map(([x,y,z],i)=>[x,y+.017,z+.006,[.009,.027,.006][i]]),mobile);
    inset(k,head,'glow',side*w*.65,y-.001,z-.137,.014,.018,.016,side*.28);
    line(k,head,ridge,reflect(side,[[w*.35,front+.012,z+.014,.008],[w*.57,front-.03,z-.035,.019],
      [w*.77,front-.059,z-.122,.026],[w*1.07,front-.017,z-.28,.03],[w*1.32,y*.92,z-.396,.006]]),mobile);
    const cheekRows=mobile?3:4;
    for(let n=0;n<cheekRows;n++){
      const atX=w*(.87+n*.092),atY=y*.4-n*.030,atZ=z-.254-n*.044;
      const curve=reflect(side,[[atX*.84,atY+.050,atZ+.098],[atX*1.06,atY+.065,atZ+.023],
        [atX*1.23,atY+.009,atZ-.065],[atX*1.13,atY-.062,atZ-.046],[atX*.80,atY-.044,atZ+.054]]);
      plate(k,head,n%2?hide:ridge,curve,.021);
      line(k,head,n%2?ridge:hide,curve.slice(1,4).map(([x,y,z],i)=>[x*1.012,y,z-.020,[.005,.011,.003][i]]),mobile);
    }
    if(!hooked){
      const fang=reflect(side,[[w*.54,front-.005,z-.067,.017],[w*.59,front-.056,z-.056,.013],
        [w*.56,front-.098,z-.036,.004]]);
      line(k,head,id==='m001'||id==='m002'?'edge':'ivory',fang,mobile);
    }
    if(!hood){
      for(let n=0;n<(mobile?3:5);n++){
        const fall=n*.139,t=1-.115*n,edge=back*(.92-.037*n),h=yBack-.024*n;
        const neck=reflect(side,[[edge*.19,h+.03,.159-fall],[edge*.683,h+.052,.146-fall],
          [edge,h-.002,.050-fall],[edge*.949,h-.057,-.067-fall],
          [edge*.425,h-.028,-.121-fall],[edge*.22,h+.014,-.090-fall]]);
        plate(k,body,n%2===0?hide:ridge,neck,.045*t);
        line(k,body,ridge,neck.slice(2,5).map(([x,y,z],i)=>[x*1.022,y+.011,z,[.004,.014,.004][i]]),mobile);
      }
    }
  }
}

export function polishBossA(k,parts,entry,mobile){
  const helm=helms[entry.id],beast=beasts[entry.id];
  if(helm&&parts.head){
    cheekRelief(k,parts.head,mobile,helm,entry.id);
    const torso=entry.family==='rider'?parts.head.parent:parts.body;
    rearScapula(k,torso,mobile,helm,parts.head.position.y*(entry.id==='m027'?.75:.64));
  }else if(beast)beastFace(k,parts,mobile,beast,entry.id);
  else return false;
  if(entry.id==='m003')oniBindings(k,parts,mobile);
  if(entry.id==='m033'||entry.id==='m056')bansheeHair(k,parts,mobile,entry.id);
  if(entry.id==='m024')dragonNeck(k,parts,mobile);
  const [tint,shape,offset,span,nearHead]=energies[entry.id];
  parts.polishEnergy={tint,shape,offset,span,anchor:nearHead?parts.head:parts.body};
  return true;
}
