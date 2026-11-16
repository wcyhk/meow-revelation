import * as T from '../three.min.mjs';

const sides=[-1,1],turn=Math.PI*2;
const bell=(value,radius)=>Math.exp(-((value/radius)**2));
const rows={
  m061:[
    [-.237,.051,.071,.124],[-.209,.072,.106,.118],[-.169,.098,.128,.139],
    [-.113,.117,.145,.143],[-.064,.134,.157,.168],[.001,.143,.167,.175],
    [.062,.139,.170,.181],[.109,.145,.163,.192],[.164,.144,.152,.177],
    [.217,.124,.136,.151],[.253,.086,.097,.115],[.284,.012,.053,.07],
  ],
  m062:[
    [-.208,.050,.088,.116],[-.183,.075,.117,.145],[-.137,.097,.138,.151],
    [-.089,.116,.141,.159],[-.033,.134,.157,.159],[.019,.136,.153,.166],
    [.074,.129,.151,.172],[.127,.135,.143,.174],[.181,.126,.135,.159],
    [.226,.104,.120,.124],[.266,.073,.071,.106],[.288,.013,.040,.071],
  ],
  m073:[
    [-.236,.055,.088,.105],[-.212,.077,.12,.132],[-.169,.114,.138,.156],
    [-.121,.131,.155,.174],[-.06,.151,.17,.18],[-.007,.154,.182,.192],
    [.05,.15,.173,.189],[.103,.15,.166,.188],[.153,.143,.155,.171],
    [.194,.132,.143,.143],[.235,.093,.106,.111],[.267,.028,.063,.076],
  ],
  m074:[
    [-.199,.043,.097,.106],[-.172,.069,.123,.129],[-.132,.095,.137,.147],
    [-.086,.108,.149,.16],[-.036,.125,.168,.17],[.018,.137,.17,.173],
    [.071,.133,.164,.171],[.118,.142,.157,.169],[.16,.139,.142,.164],
    [.213,.116,.13,.137],[.251,.077,.093,.111],[.282,.029,.049,.074],
  ],
  m077:[
    [-.217,.046,.092,.12],[-.182,.073,.116,.13],[-.142,.093,.145,.147],
    [-.093,.11,.152,.155],[-.043,.13,.166,.17],[.015,.137,.171,.177],
    [.062,.131,.165,.182],[.109,.134,.158,.182],[.171,.128,.143,.176],
    [.219,.114,.131,.144],[.258,.084,.101,.101],[.289,.018,.053,.082],
  ],
  m105:[
    [-.245,.051,.087,.104],[-.224,.083,.109,.127],[-.184,.102,.139,.155],
    [-.134,.118,.153,.168],[-.075,.138,.171,.17],[-.018,.151,.175,.18],
    [.039,.145,.176,.173],[.089,.139,.172,.182],[.149,.151,.159,.171],
    [.205,.139,.148,.142],[.249,.079,.102,.104],[.278,.014,.052,.068],
  ],
};
const profiles={
  m061:{
    eye:[.067,.063,.014,-.011],nose:[.034,.077,-.033],chin:[.046,-.163],cheek:.032,
    shade:[.93,.89,.84],eyeDye:'xuduIris',skin:'xuduSkin',lips:'xuduLip',root:'xuduShade',brow:'xuduHair',
  },
  m062:{
    eye:[.061,.052,.011,.012],nose:[.026,.064,-.023],chin:[.056,-.119],cheek:.026,
    shade:[.96,.91,.87],eyeDye:'scoutIris',skin:'scoutSkin',lips:'scoutLip',root:'scoutShade',brow:'bHair',
  },
  m073:{
    eye:[.073,.061,.012,-.009],nose:[.032,.077,-.035],chin:[.055,-.151],cheek:.036,
    shade:[.96,.91,.86],eyeDye:'vesperEye',skin:'vesperSkin',lips:'vesperLip',root:'vesperCrease',brow:'vesperBlack',
  },
  m074:{
    eye:[.064,.052,.012,.008],nose:[.027,.056,-.029],chin:[.05,-.125],cheek:.026,
    shade:[.97,.93,.89],eyeDye:'riderEye',skin:'riderSkin',lips:'riderLip',root:'riderCrease',brow:'riderBlack',
  },
  m077:{
    eye:[.063,.053,.014,.012],nose:[.025,.054,-.023],chin:[.052,-.133],cheek:.028,
    shade:[.95,.94,.92],eyeDye:'dawnEye',skin:'dawnSkin',lips:'dawnLip',root:'dawnCrease',brow:'dawnHair',
  },
  m105:{
    eye:[.076,.055,.010,.01],nose:[.026,.073,-.039],chin:[.061,-.149],cheek:.029,
    shade:[.92,.89,.87],eyeDye:'amakusaIris',skin:'amakusaSkin',lips:'amakusaLip',root:'amakusaShade',brow:'bHair',
  },
};
const photoNames={m061:'Xudu gaunt portrait',m062:'Duoling scout portrait',m073:'Vesper priest portrait',
  m074:'Striped tiger rider portrait',m077:'Dawn priest portrait',m105:'Amakusa stern portrait'};
export const templePortraitFinishes={
  m061:{xuduSkin:[0xa09378,.025,.81,'hide'],xuduLip:[0x76614e,.018,.78,'hide'],
    xuduShade:[0x524338,.015,.88,'hide'],xuduIris:[0x718449,.06,.44,'gem'],xuduHair:[0x98856b,.03,.86,'hide']},
  m062:{scoutSkin:[0xa3785d,.018,.82,'hide'],scoutLip:[0x895d49,.018,.78,'hide'],
    scoutShade:[0x57382e,.018,.87,'hide'],scoutIris:[0x7d6545,.05,.43,'gem']},
  m073:{vesperSkin:[0x9e8065,.018,.85,'hide'],vesperLip:[0x795543,.017,.87,'hide'],
    vesperCrease:[0x4a3434,.01,.9,'hide'],vesperEye:[0x816e63,.05,.54,'gem']},
  m074:{riderSkin:[0xb08c70,.016,.85,'hide'],riderLip:[0x916654,.014,.82,'hide'],
    riderCrease:[0x594137,.014,.89,'hide'],riderEye:[0x846e55,.044,.51,'gem']},
  m077:{dawnSkin:[0xbba998,.016,.88,'hide'],dawnLip:[0x906b64,.013,.86,'hide'],
    dawnCrease:[0x58494d,.016,.88,'hide'],dawnEye:[0x687582,.06,.49,'gem']},
  m105:{amakusaSkin:[0xae8d6f,.022,.84,'hide'],amakusaLip:[0x825e4b,.016,.85,'hide'],
    amakusaShade:[0x523c34,.014,.89,'hide'],amakusaIris:[0x97817a,.06,.47,'gem'],
    amakusaCap:[0x262329,.07,.90,'cloth'],amakusaBraid:[0x61333a,.14,.82,'cloth'],
    amakusaThread:[0x795946,.20,.80,'cloth'],amakusaCollar:[0x98713e,.37,.73,'hide']},
};

function faceProfile(id){
  const data=rows[id],p=profiles[id];
  const front=new T.CatmullRomCurve3(data.map(([y,w,f])=>new T.Vector3(y,w,f)),false,'catmullrom',.38);
  const back=new T.CatmullRomCurve3(data.map(([y,,,b])=>new T.Vector3(y,b,0)),false,'catmullrom',.39);
  const shape=y=>{
    let i=data.findIndex(([h])=>h>=y)-1;
    if(i<0)i=y<=data[0][0]?0:data.length-2;
    const t=(i+T.MathUtils.clamp((y-data[i][0])/(data[i+1][0]-data[i][0]),0,1))/(data.length-1);
    const {y:wide,z:depth}=front.getPoint(t);
    return [wide,depth,back.getPoint(t).y];
  };
  function forward(x,y,wide,depth){
    const [ex,ey,,pitch]=p.eye,[nx,nz,ny]=p.nose;
    const a=Math.abs(x),face=Math.sqrt(Math.max(0,1-(x/wide)**2));
    const lateral=a-ex,point=ey+lateral*(pitch+.10);
    const brow=bell(lateral,.054)*bell(y-point-.050,.038)*.031;
    const orbit=bell(lateral,.033)*bell(y-point,.029)*.026;
    const temple=bell(a-.104,.028)*bell(y-.09,.08)*.016;
    const cheek=bell(a-.082,.035)*bell(y+.016,.044)*p.cheek;
    const hollow=bell(a-.094,.033)*bell(y+.103,.049)*.018;
    const bridge=bell(x,.023)*bell(y-ny-.083,.086)*nz*.56;
    const tip=bell(x,nx)*bell(y-ny,.032)*nz*.68;
    const chin=bell(x,.049)*bell(y-p.chin[1]+.058,.047)*.027;
    return .009+depth*face+(brow-orbit+cheek-temple-hollow+bridge+tip+chin)*face;
  }
  function at(x,y,offset=0){
    const [w,f]=shape(y);
    return [x,y,forward(x,y,w,f)+offset];
  }
  return {shape,forward,at,p,data};
}

function skinSurface(id,mobile,field){
  const {data,shape,forward,p}=field;
  const rings=mobile?27:43,spokes=mobile?30:46;
  const min=data[0][0],max=data.at(-1)[0];
  const position=[],uv=[],color=[],indices=[];
  for(let row=0;row<=rings;row++){
    const t=row/rings,y=min+(max-min)*t;
    const [wide,depth,back]=shape(y);
    for(let i=0;i<=spokes;i++){
      const a=i/spokes*turn,c=Math.cos(a),x=Math.sin(a)*wide;
      const z=c>0?forward(x,y,wide,depth):.009+back*c;
      const scan=.96-Math.sin(y*24+a*2.4)**4*.035+(Math.cos(a*11-y*26)**8)*.017;
      const cool=1-bell(Math.abs(x)-.102,.039)*bell(y+.098,.038)*.073;
      const cheekColor=.022*bell(Math.abs(x)-.087,.038)*bell(y+.029,.032);
      position.push(x,y,z);
      color.push((p.shade[0]+cheekColor)*scan,(p.shade[1]-.03*(1-cool))*scan*cool,(p.shade[2]+cheekColor*.44)*scan*cool);
      uv.push(i/spokes,t);
      if(row<rings&&i<spokes){
        const a=row*(spokes+1)+i,b=a+spokes+1;
        indices.push(a,a+1,b,b,a+1,b+1);
      }
    }
  }
  const cap=position.length/3;
  position.push(0,min-.008,.031,0,max+.004,-.009);
  uv.push(.5,0,.5,1);
  color.push(.81,.76,.70,.88,.85,.80);
  for(let i=0;i<spokes;i++){
    const a=rings*(spokes+1)+i;
    indices.push(cap,i+1,i,cap+1,a,a+1);
  }
  const g=new T.BufferGeometry().setIndex(indices);
  g.setAttribute('position',new T.Float32BufferAttribute(position,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T.Float32BufferAttribute(color,3));
  g.computeVertexNormals();
  const n=g.attributes.normal,b=new T.Vector3(),far=new T.Vector3();
  for(let row=0;row<=rings;row++){
    const start=row*(spokes+1),end=start+spokes;
    b.fromBufferAttribute(n,start).add(far.fromBufferAttribute(n,end)).normalize();
    n.setXYZ(start,b.x,b.y,b.z);n.setXYZ(end,b.x,b.y,b.z);
  }
  return g;
}

export function templePortrait(k,head,id,mobile){
  if(!profiles[id])return null;
  const field=faceProfile(id),{at,p}=field,[ex,ey,open,slant]=p.eye,[mouth,lower]=p.chin;
  const shell=k.bone(head,0,0,0);
  shell.name=photoNames[id];
  k.geometry(shell,p.skin,skinSurface(id,mobile,field));
  const rib=(joint,material,path)=>k.sculpt.sweep(joint,material,path,{steps:mobile?8:12,sides:mobile?5:7,ridge:.11});
  const tile=(joint,material,path,d)=>k.sculpt.plate(joint,material,path,d,d*.34);
  const jaw=k.bone(shell,0,lower-.012,.112);
  jaw.name=photoNames[id]+' lip hinge';
  const aged=id==='m061',elder=aged||id==='m073',stern=id==='m105';
  for(const side of sides){
    const f=(path,depth=0)=>path.map(([x,y,r])=>[...at(x*side,y,depth),r]);
    const upper=[[ex-.032,ey-.005,.002],[ex-.011,ey+open*.49,.007],[ex+.014,ey+open,.010],[ex+.044,ey+slant,.003]];
    const lowerLid=[[ex-.032,ey-.006,.002],[ex-.009,ey-open*.42,.005],[ex+.017,ey-open*.48,.006],[ex+.044,ey+slant,.002]];
    tile(shell,p.root,[...f(upper,.008),...f(lowerLid.slice(1,-1).reverse(),.008)].map(a=>a.slice(0,3)),.011);
    const [x,y,z]=at((ex+.001)*side,ey+.004,.015);
    k.mesh(shell,'round',p.eyeDye,x,y,z,.012,.009,.018,0,side*.26,side*slant*7);
    k.mesh(shell,'round','bShadow',x,y,z+.016,.004,.008,.004);
    rib(shell,p.root,f(upper,.019));
    rib(shell,p.lips,f(lowerLid,.017));
    const brow=[[ex-.043,ey+.039,.004],[ex-.018,ey+.046,.009],[ex+.015,ey+.046+slant*.48,.012],
      [ex+.049,ey+.041+slant,.008],[ex+.063,ey+.028+slant,.003]];
    rib(shell,p.brow,f(brow,.014));
    if(!mobile)rib(shell,p.brow,f(brow.slice(1).map(([a,b,c])=>[a+.004,b+.012,c*.38]),.013));
    const [nx,,ny]=p.nose;
    rib(shell,p.lips,f([[nx*.59,ny+.003,.003],[nx*.94,ny-.01,.008],
      [nx*1.14,ny-.018,.009],[nx*1.31,ny-.013,.003]],.012));
    rib(shell,p.root,f([[nx*.55,ny-.025,.002],[nx*.83,ny-.021,.005],[nx*1.11,ny-.020,.004]],.017));
    rib(shell,p.lips,f([[.006,lower+.033,.004],[mouth*.39,lower+.024,.009],
      [mouth*.68,lower+.029,.006],[mouth,lower+.023,.003]],.009));
    rib(shell,p.root,f([[0,lower+.019,.003],[mouth*.52,lower+.016,.005],[mouth*.87,lower+.017,.005],
      [mouth,lower+.023,.003]],.015));
    rib(jaw,p.lips,f([[0,lower+.001,.004],[mouth*.40,lower-.001,.008],[mouth*.82,lower+.01,.003]],.017)
      .map(([x,y,z,r])=>[x,y-lower+.012,z-.112,r]));
    const cheek=elder?[[.119,-.014,.003],[.095,-.041,.006],[.082,-.087,.008],[.091,-.113,.003]]:
      stern?[[.119,-.022,.002],[.113,-.049,.004],[.09,-.104,.006],[.084,-.126,.002]]:
        [[.116,-.028,.003],[.102,-.052,.006],[.073,-.071,.006],[.061,-.095,.002]];
    rib(shell,p.lips,f(cheek,.008));
    if(elder)for(let i=0;i<(mobile?2:4);i++){
      rib(shell,i%2?p.root:p.lips,f([[.058,.137+i*.016,.001],[.091,.142+i*.014,.003],
        [.124,.129+i*.018,.001]],.009));
    }
    const ear=k.bone(shell,side*(aged?.123:.127),.035,-.049);
    ear.name=photoNames[id]+' helix '+side;
    ear.rotation.y=side*(aged?.34:.49);
    const e=path=>path.map(([x,...rest])=>[x*side,...rest]);
    const outline=e([[.002,.052,.024],[.033,.068,.01],[.058,.04,-.013],[.061,.008,-.025],
      [.048,-.039,.004],[.02,-.066,.021],[.003,-.039,.026]]);
    tile(ear,p.skin,outline,.028);
    tile(ear,p.root,outline.slice(1,-1).map(([x,y,z])=>[x*.72,y*.79,z+.017]),.017);
    rib(ear,p.lips,e([[.006,.044,.037,.005],[.03,.059,.027,.014],[.055,.027,.002,.011],
      [.047,-.023,.009,.015],[.018,-.053,.034,.008]]));
    rib(ear,p.skin,e([[.028,.027,.038,.003],[.032,.005,.043,.010],[.027,-.018,.046,.012],[.012,-.024,.038,.004]]));
    if(aged){
      const strip=e([[.01,-.071,.06],[.08,-.05,.039],[.141,-.048,-.017],[.155,-.091,-.104],
        [.115,-.157,-.169],[.048,-.198,-.117],[.017,-.169,-.055]]);
      for(let fold=0;fold<3;fold++){
        const layer=strip.map(([x,y,z],i)=>[x+side*(.03+(i>3?.016:0)),y-.05-fold*.031,z+.035-fold*.025]);
        tile(shell,fold%2?'priThread':'priRobe',layer,.033);
        rib(shell,'priBone',layer.slice(0,5).map(([x,y,z],i)=>[x,y+.013,z+.018,[.006,.010,.013,.008,.002][i]]));
      }
    }
  }
  if(id==='m062'){
    const scar=[[-.091,.031,.001],[-.098,.005,.003],[-.099,-.021,.004],[-.107,-.039,.002]];
    rib(shell,'scoutLip',scar.map(([x,y,r])=>[...at(x,y,.011),r]));
  }
  if(id==='m073')for(const side of sides){
    const lock=[[.023,-.105,.002],[.058,-.12,.009],[.084,-.148,.011],[.094,-.175,.006],[.086,-.188,.002]];
    rib(shell,'vesperBlack',lock.map(([x,y,r])=>[...at(x*side,y,.011),r]));
  }
  return jaw;
}
