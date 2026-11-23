import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {revealCurve,wardenDissolve,wardenFragments} from './warden-transformation.mjs';

const tau=Math.PI*2;
const sides=[-1,1];

function silverFinishes(materials){
  const environment=forgeEnvironment();
  for(const [name,color,roughness,metalness,emissive,strength,kind] of [
    ['vigilSatin',0xe5e9f1,.59,.15,0x647b9d,.20,'cloth'],
    ['vigilLining',0x505d7e,.81,.13,0x182746,.18],
    ['vigilSilver',0xb4c7de,.27,.70,0x273b58,.21,'iron'],
    ['vigilEtching',0xebe9dc,.41,.53,0x7a8ba1,.30],
    ['vigilPorcelain',0xf0dbc6,.56,.12,0x614d55,.15],
    ['vigilHair',0xd9dce7,.48,.27,0x616987,.16],
    ['vigilLips',0xa9747c,.64,.06,0x3d2131,.12],
    ['vigilInk',0x3f445b,.72,.20,0x212036,.07],
  ]){
    const material=new T.MeshStandardMaterial({
      color,metalness,roughness,emissive,emissiveIntensity:strength,vertexColors:true,
      envMap:environment,envMapIntensity:metalness>.5?.83:.42,
    });
    materials[name]=kind?paintedFinish(material,kind,true):material;
  }
  materials.vigilPearl=new T.MeshBasicMaterial({color:0xe6f7ff,toneMapped:false});
}

function surface(rows,columns,sample,reverse=false){
  const points=[],colors=[],uv=[],indices=[];
  for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
    const [x,y,z,pigment]=sample(row/rows,col/columns);
    points.push(x,y,z);
    colors.push(pigment*.97,pigment*.99,pigment);
    uv.push(col/columns,row/rows);
    if(row===rows||col===columns)continue;
    const a=row*(columns+1)+col,b=a+columns+1;
    if(reverse)indices.push(a,a+1,b,a+1,b+1,b);
    else indices.push(a,b,a+1,a+1,b,b+1);
  }
  const geometry=new T.BufferGeometry().setIndex(indices);
  geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.computeVertexNormals();
  return geometry;
}

function cowl(mobile,lining){
  return surface(mobile?10:17,mobile?32:44,(u,v)=>{
    const a=v*tau, arch=Math.cos(a),taper=Math.cos(u*Math.PI*.5);
    const drape=Math.sin(a*5+u*3)*.016+Math.sin(a*9-u*2)*.008;
    const edge=(lining?-.022:.023)+drape*Math.sin(u*Math.PI);
    return [Math.sin(a)*(.276+edge)*taper,.009+arch*(.355+edge)*taper+.139*Math.sin(u*Math.PI),
      .25-.51*Math.sin(u*Math.PI*.5)-.10*Math.max(0,arch)*taper,
      .87+.085*Math.cos(a*5+u*2)+.04*arch];
  },!lining);
}

function porcelainFace(mobile){
  return surface(mobile?22:32,mobile?32:46,(u,v)=>{
    const a=v*tau,y=-.227+u*.483,front=Math.cos(a);
    const oval=Math.sin(Math.PI*u)**.59;
    const width=(.142+.029*revealCurve(u,.19,.46))*oval;
    const x=Math.sin(a)*width;
    const px=Math.abs(x);
    const relief=(atX,atY,sx,sy)=>Math.exp(-(((px-atX)/sx)**2+((y-atY)/sy)**2));
    const ridge=.052*relief(0,.001,.044,.106)+.038*relief(0,-.052,.041,.045);
    const cheeks=.017*relief(.108,-.028,.048,.061);
    const sockets=.020*relief(.084,.060,.051,.029);
    const chin=.017*relief(0,-.162,.083,.063);
    const plane=.045-u*.029+front*(.139+.032*revealCurve(u,.23,.52))*oval;
    return [x,y,plane+(ridge+cheeks-sockets+chin)*Math.max(0,front)**3,
      .90+.062*Math.max(0,front)+cheeks*1.42-sockets*.90];
  },true);
}

function pleat(depth,length,start,end,rows,lining){
  return surface(rows,40,(u,v)=>{
    const a=v*tau,c=Math.cos(a),s=Math.sin(a);
    const folds=Math.cos(a*8+u*2.1)+.31*Math.cos(a*13-u*5);
    const flare=start+(end-start)*u**.83;
    const ripple=folds*(.015+.035*u)-(lining?.020:0);
    return [s*(flare+ripple),-length*u+(c*.050-.044*Math.abs(s))*u*u,
      c*(flare*depth+ripple)-u*u*.13,.88+.083*folds];
  },lining);
}

function blessingLight(radius,halo){
  const material=new T.ShaderMaterial({
    uniforms:{clock:{value:0},power:{value:0},visibility:{value:1},seal:{value:0},hand:{value:1}},
    defines:halo?{VIGIL_HALO:1}:{},
    side:T.DoubleSide,forceSinglePass:true,transparent:true,depthWrite:false,
    blending:T.AdditiveBlending,toneMapped:false,
    vertexShader:`
      uniform float seal;
      varying vec2 local;
      void main(){
        local=uv*2.-1.;
        vec4 point=modelViewMatrix*vec4(position,1.);
        #ifndef VIGIL_HALO
          // Keep a charged seal readable when the wrist turns edge-on.
          vec4 anchor=modelViewMatrix[3];
          vec2 scale=vec2(length(modelViewMatrix[0].xyz),length(modelViewMatrix[1].xyz));
          vec4 front=anchor+vec4(position.xy*scale,0.,0.);
          point=mix(point,front,smoothstep(.03,.50,seal));
        #endif
        gl_Position=projectionMatrix*point;
      }`,
    fragmentShader:`
      uniform float clock,power,visibility,seal,hand;
      varying vec2 local;
      float band(float r,float at,float w){return 1.-smoothstep(w*.25,w,abs(r-at));}
      void main(){
        float r=length(local), a=atan(local.y,local.x);
        float light,core;
        #ifdef VIGIL_HALO
          float orbit=.5+.5*cos(a*3.-clock*.94);
          float ticks=pow(max(0.,cos(a*24.)),13.);
          float rays=pow(max(0.,cos(a*12.+.09)),14.);
          float wheel=band(r,.77,.012)+band(r,.825,.010)*.77;
          float rim=band(r,.80,.086)*(.12+.25*orbit);
          float tracer=band(r,.90+.015*cos(a*6.),.010)*pow(orbit,7.);
          float filigree=band(r,.795,.043)*ticks*.55+band(r,.902,.085)*rays*.72;
          core=clamp(wheel+tracer+filigree,0.,1.);
          light=(wheel*.74+filigree+tracer*.72+rim)*(1.+power*.40);
        #else
          float cross=pow(abs(cos(a*2.+clock*.18)),20.)*exp(-r*7.)*.88;
          core=exp(-r*r*45.);
          light=(exp(-r*r*12.)*.56+cross+core*.64+band(r,.42,.034)*power*.39)
            *(.23+power*.71);
          if(seal>.01){
            float angle=a+hand*clock*1.27;
            float radius=.48+power*.24;
            float spokes=pow(.5+.5*cos(angle*10.),7.);
            float arcs=smoothstep(-.35,.15,cos(angle*3.));
            float ring=band(r,radius,.018)*arcs+band(r,radius-.10,.013)*.67;
            float glyphs=band(r,radius+.068,.048)*spokes;
            float bloom=band(r,radius,.110)*.22;
            core=clamp(core+(ring*.76+glyphs*.65)*seal,0.,1.);
            light+=(ring*.60+glyphs*.49+bloom)*seal;
          }
        #endif
        gl_FragColor=vec4(mix(vec3(.37,.65,1.),vec3(.98,.985,1.),core),
          min(1.,light*visibility)*(1.-smoothstep(.91,1.,r)));
      }`,
  });
  const mesh=new T.Mesh(new T.PlaneGeometry(radius*2,radius*2),material);
  mesh.renderOrder=halo?28:32;
  return mesh;
}

function buildHalo(k,form,mobile){
  const halo=k.bone(form,0,2.16,-.55);
  halo.name='晏燈 · 銀輪光環';
  const wheel=k.bone(halo,0,0,0),bands=k.bone(wheel,0,0,0);
  const segments=mobile?68:104;
  k.geometry(bands,'vigilSilver',new T.TorusGeometry(1.034,.029,6,segments));
  k.geometry(bands,'vigilEtching',new T.TorusGeometry(.963,.012,5,segments));
  for(let n=0;n<16;n++){
    const a=n*tau/16,s=Math.sin(a),c=Math.cos(a),major=n%4===0;
    k.mesh(bands,'gem',major?'vigilPearl':'vigilEtching',s*1.029,c*1.029,.003,
      major?.045:.028,major?.095:.050,major?.035:.021,0,0,-a);
    if(major)k.mesh(bands,'gem','vigilSilver',s*.955,c*.955,-.017,.039,.081,.032,0,0,-a);
  }
  const light=blessingLight(1.30,true);
  light.position.z=.031;
  halo.add(light);
  return {halo,wheel,bands,light};
}

export function sculptSilverWarden(k,parent,mobile){
  silverFinishes(k.materials);
  const form=k.bone(parent,0,0,0),costume=k.bone(form,0,0,0),body=k.bone(costume,0,1.36,0);
  form.name='王冠守夜者 · 銀輝法衣';
  const head=k.bone(body,0,.894,.018);
  head.name='晏燈 · 瓷面兜帽';
  const full={sides:mobile?10:14,rings:mobile?13:19,section:2.16,ridge:.081};
  const carve=(part,material,path,options={})=>k.geometry(part,material,sculptVolume(path,{...full,...options}));
  const seam=(part,material,points,steps=10)=>k.sculpt.sweep(part,material,points,{sides:5,steps});
  const plate=(part,material,outline,thickness)=>k.sculpt.plate(part,material,outline,thickness,thickness*.28);
  const gem=(joint,finish,x,y,z,sx,sy,sz,tilt=0)=>k.mesh(joint,'gem',finish,x,y,z,sx,sy,sz,0,0,tilt);
  carve(body,'vigilSatin',[[0,-.349,-.015,.247,.177],[0,-.13,-.029,.268,.194],
    [0,.13,-.038,.318,.221],[0,.417,-.043,.416,.228],[0,.610,-.062,.374,.200],[0,.752,-.022,.135,.131]]);
  carve(body,'vigilLining',[[0,.600,-.048,.177,.131],[0,.696,-.020,.151,.132],[0,.89,.016,.120,.116]]);
  k.geometry(head,'vigilPorcelain',porcelainFace(mobile));
  k.geometry(head,'vigilSatin',cowl(mobile,false));
  k.geometry(head,'vigilLining',cowl(mobile,true));
  carve(head,'vigilHair',[[-.135,.193,.139,.034,.022],[-.069,.241,.166,.051,.034],
    [.039,.239,.190,.056,.046],[.110,.200,.183,.038,.024],[.140,.137,.147,.006,.008]],
    {sides:9,rings:19,section:2.76,ridge:.23});
  seam(head,'vigilLips',[[-.046,-.118,.169,.003],[-.021,-.122,.182,.005],
    [0,-.119,.188,.004],[.021,-.122,.182,.005],[.044,-.115,.170,.003]],11);
  seam(head,'vigilPorcelain',[[-.019,-.132,.176,.003],[0,-.135,.185,.008],[.019,-.131,.176,.003]],7);
  gem(head,'vigilSilver',0,.154,.199,.015,.024,.008);
  gem(head,'vigilPearl',0,.153,.206,.004,.008,.003);
  for(let index=0;index<3;index++){
    const inset=index*.015;
    seam(head,'vigilSatin',[[-.122+inset,.222+inset*.23,.173,.004],[-.046,.259-inset,.180+inset*.50,.007],
      [.055,.252-inset,.204,.008],[.139-inset,.193+inset,.176,.004]],12);
  }
  const lids=[];
  for(const side of sides){
    const reflect=path=>path.map(([x,...rest])=>[x*side,...rest]);
    seam(head,'vigilEtching',reflect([[.005,.381,.153,.013],[.145,.338,.171,.013],
      [.256,.219,.190,.014],[.301,.022,.247,.015],[.247,-.203,.232,.013],[.112,-.331,.221,.017]]),17);
    seam(head,'vigilSilver',reflect([[.005,.389,.092,.011],[.155,.357,.119,.011],
      [.285,.234,.145,.010],[.322,.011,.193,.012],[.266,-.220,.189,.011],[.119,-.351,.181,.014]]),17);
    const lid=k.bone(head,0,.056,.175);
    lid.name=side<0?'晏燈 · 左眼':'晏燈 · 右眼';
    lids.push(lid);
    seam(lid,'vigilInk',reflect([[.035,-.004,.027,.003],[.073,.010,.016,.009],[.104,.009,.008,.010],
      [.131,.001,-.006,.006],[.146,-.004,-.015,.003]]),9);
    seam(lid,'vigilLips',reflect([[.050,-.012,.023,.003],[.083,-.015,.013,.005],[.116,-.009,.002,.003]]),7);
    gem(lid,'vigilPearl',side*.087,-.002,.017,.014,.008,.004);
    gem(lid,'vigilInk',side*.088,-.002,.023,.004,.006,.002);
    seam(head,'vigilSilver',reflect([[.038,.103,.199,.003],[.082,.120,.186,.007],[.130,.099,.161,.003]]),9);
    seam(head,'vigilEtching',reflect([[.131,.026,.153,.003],[.142,.005,.146,.004],
      [.125,-.017,.156,.004],[.128,-.043,.150,.002]]),8);
    carve(head,'vigilHair',reflect([[.146,.176,.122,.032,.038],[.172,.108,.127,.038,.026],
      [.177,.023,.125,.030,.028],[.136,-.102,.133,.021,.023],[.104,-.162,.146,.004,.006]]),
      {sides:8,rings:13,section:2.4,ridge:.21,seed:side});
    seam(head,'vigilEtching',reflect([[.168,.207,.161,.006],[.177,.125,.155,.008],
      [.184,.051,.151,.006],[.161,-.050,.155,.004]]));
    seam(head,'vigilEtching',reflect([[.266,.196,.108,.005],[.272,.140,-.018,.007],
      [.235,.072,-.142,.006],[.151,.020,-.221,.004],[.049,-.023,-.250,.003]]),12);
    seam(head,'vigilSilver',reflect([[.306,.072,.183,.005],[.286,-.042,.146,.007],
      [.247,-.145,.118,.006],[.181,-.211,.082,.004]]),11);
    plate(body,'vigilSilver',reflect([[.048,.581,.171],[.159,.702,.144],[.327,.614,.177],[.432,.482,.138],
      [.348,.337,.198],[.205,.404,.226],[.102,.278,.210]]),.038);
    seam(body,'vigilEtching',reflect([[.070,.299,.237,.012],[.205,.439,.249,.013],[.348,.371,.215,.010],
      [.445,.496,.151,.011],[.331,.629,.193,.012],[.161,.716,.164,.009]]),14);
    seam(body,'vigilLining',reflect([[.046,.464,.222,.009],[.123,.361,.246,.013],[.162,.173,.202,.013],
      [.183,-.068,.180,.011],[.153,-.231,.166,.007]]),14);
    seam(body,'vigilSilver',reflect([[.126,.411,.249,.005],[.199,.364,.244,.007],[.267,.413,.207,.005],
      [.330,.474,.184,.006],[.393,.463,.163,.004]]),12);
    for(let rivet=0;rivet<4;rivet++){
      const d=rivet*.053;
      gem(body,'vigilEtching',side*(.176+d),.392+d*.23,.237-d*.43,.010,.012,.007);
    }
    plate(body,'vigilSilver',reflect([[.039,.658,-.202],[.174,.673,-.22],[.402,.543,-.157],
      [.339,.408,-.247],[.159,.382,-.298],[.010,.257,-.292]]),.044);
    seam(body,'vigilEtching',reflect([[.041,.651,-.232,.009],[.182,.692,-.239,.013],
      [.406,.554,-.169,.012],[.332,.409,-.273,.013],[.161,.371,-.329,.010],
      [.016,.238,-.316,.009]]),17);
  }
  plate(body,'vigilEtching',[[0,.420,.241],[.087,.519,.232],[0,.613,.224],[-.087,.519,.232]],.036);
  plate(body,'vigilSilver',[[0,.449,.267],[.055,.514,.261],[0,.577,.255],[-.055,.514,.261]],.022);
  gem(body,'vigilPearl',0,.516,.264,.032,.044,.021);
  for(const side of sides){
    seam(body,'vigilEtching',[[side*.087,.531,.256],[side*.053,.566,.260],[side*.032,.596,.249]],7);
    seam(body,'vigilEtching',[[side*.087,.504,.267],[side*.055,.465,.279],[side*.027,.454,.277]],7);
  }
  const hem=k.bone(costume,0,1.373,.00);
  hem.name='晏燈 · 百褶銀袍';
  k.geometry(hem,'vigilSatin',pleat(.65,1.19,.267,.509,mobile?15:23,false));
  k.geometry(hem,'vigilLining',pleat(.65,1.19,.267,.509,mobile?15:23,true));
  const hemBinding=Array.from({length:41},(_,index)=>{
    const a=index*tau/40,s=Math.sin(a),c=Math.cos(a);
    const rim=.499+.045*(Math.cos(a*8+2.1)+.31*Math.cos(a*13-5));
    return [s*rim,-1.16+c*.050-.044*Math.abs(s),c*(rim-.155)-.123,.008];
  });
  seam(hem,'vigilEtching',hemBinding,mobile?32:56);
  const surcoat=k.bone(body,0,-.13,.20);
  carve(surcoat,'vigilSatin',[[0,.034,.003,.133,.035],[0,-.173,.009,.166,.046],
    [0,-.394,.056,.174,.040],[0,-.676,.066,.133,.040],[0,-.921,.032,.021,.010]],{ridge:.14});
  const tails=[],arms=[],lamps=[];
  for(const side of sides){
    const reflect=path=>path.map(([x,...rest])=>[x*side,...rest]);
    const train=k.bone(body,side*.195,.505,-.233);
    carve(train,'vigilSatin',reflect([[.04,0,0,.137,.058],[.121,-.286,-.088,.195,.061],
      [.145,-.696,-.211,.197,.063],[.183,-1.12,-.357,.139,.041],[.229,-1.59,-.468,.007,.008]]),{ridge:.22});
    seam(train,'vigilEtching',reflect([[.124,-.01,-.041,.012],[.273,-.30,-.13,.017],
      [.310,-.708,-.252,.016],[.306,-1.11,-.388,.012],[.230,-1.55,-.483,.008]]),17);
    seam(train,'vigilSilver',reflect([[.033,-.115,-.104,.007],[.102,-.360,-.197,.011],
      [.141,-.674,-.287,.013],[.161,-1.050,-.416,.011],[.217,-1.484,-.489,.007]]),19);
    for(let index=0;index<3;index++){
      const length=index*.26,spread=index*.025;
      seam(train,'vigilEtching',reflect([[.107+spread,-.324-length,-.190-length*.37,.006],
        [.154+spread,-.406-length,-.227-length*.38,.007],[.247+spread,-.437-length,-.238-length*.38,.008],
        [.205+spread,-.502-length,-.264-length*.39,.006]]),10);
    }
    tails.push({train,side});
    seam(surcoat,'vigilEtching',reflect([[.120,.01,.022,.009],[.169,-.166,.063,.012],[.177,-.396,.092,.012],
      [.139,-.675,.109,.014],[.071,-.833,.085,.010],[.018,-.911,.052,.005]]),15);
    const foot=k.bone(costume,side*.177,.264,-.019);
    carve(foot,'vigilSilver',[[0,-.183,.25,.061,.042],[0,-.179,.113,.099,.061],
      [0,-.12,-.036,.093,.077],[0,.109,-.04,.082,.073]]);
    const shoulder=k.bone(body,side*.368,.465,-.012);
    const elbow=k.bone(shoulder,side*.026,-.389,.012);
    const wrist=k.bone(elbow,0,-.406,.032);
    wrist.name=side<0?'晏燈 · 左掌':'晏燈 · 右掌';
    carve(shoulder,'vigilSatin',reflect([[.024,.101,-.014,.090,.101],[.065,-.016,-.002,.170,.151],
      [.044,-.165,.005,.149,.132],[.024,-.356,.009,.117,.096],[.019,-.430,.017,.102,.094]]));
    seam(shoulder,'vigilEtching',reflect([[.017,.030,.132],[.098,-.061,.133],[.119,-.192,.119],
      [.060,-.308,.108]].map(([x,y,z])=>[x,y,z,.006])),10);
    carve(elbow,'vigilSatin',reflect([[.014,.037,-.016,.103,.092],[.044,-.085,-.024,.135,.110],
      [.022,-.229,.005,.157,.120],[.004,-.387,.008,.122,.107]]),{ridge:.16});
    carve(elbow,'vigilSilver',[[0,-.425,.023,.100,.099],[0,-.399,.015,.138,.114],
      [0,-.335,.012,.126,.111],[0,-.302,.009,.101,.094]]);
    carve(elbow,'vigilEtching',[[0,-.394,.012,.138,.111],[0,-.383,.011,.145,.117],[0,-.369,.010,.138,.113]],
      {sides:12,rings:6,section:1.9,ridge:.048});
    seam(elbow,'vigilEtching',reflect([[.092,-.059,.057,.008],[.119,-.164,.077,.012],
      [.125,-.255,.079,.011],[.088,-.345,.088,.010]]));
    carve(wrist,'vigilPorcelain',[[0,.030,.007,.064,.046],[0,-.039,.030,.069,.042],
      [0,-.097,.045,.091,.037],[0,-.146,.049,.078,.026]],{sides:9,rings:10,ridge:.033});
    for(let index=0;index<4;index++){
      const x=(index-1.5)*.044,tip=[.084,.121,.109,.078][index];
      carve(wrist,'vigilPorcelain',reflect([[x,-.112,.054,.026,.022],[x*1.08,-.166,.067,.023,.021],
        [x*1.29,-.180-tip*.42,.090,.019,.018],[x*1.36,-.170-tip*.78,.114,.010,.011],
        [x*1.36,-.166-tip*.80,.115,.005,.006]]),{sides:6,rings:8,ridge:.016});
    }
    carve(wrist,'vigilPorcelain',reflect([[-.055,-.053,.046,.035,.027],[-.093,-.066,.068,.029,.025],
      [-.125,-.103,.102,.021,.019],[-.128,-.124,.122,.009,.009]]),{sides:7,rings:9,ridge:.02});
    const light=blessingLight(.42,false);
    light.name=side<0?'晏燈 · 左掌銀紋':'晏燈 · 右掌銀紋';
    light.material.uniforms.hand.value=side;
    light.position.set(0,-.104,.112);
    wrist.add(light);
    lamps.push(light);
    arms.push({shoulder,elbow,wrist,foot,side,light});
  }
  for(let index=0;index<5;index++){
    const y=-.11-index*.140,scale=1-index*.12;
    plate(surcoat,'vigilSilver',[[0,y+.042*scale,.056],[.032*scale,y,.061],
      [0,y-.042*scale,.071],[-.032*scale,y,.061]],.009);
  }
  const relic=k.bone(body,0,.33,-.319);
  relic.name='晏燈 · 背章';
  for(const side of sides){
    seam(relic,'vigilSilver',[[side*.016,.301,.094,.028],[side*.104,.223,-.112,.042],
      [side*.132,.041,-.103,.039],[side*.097,-.183,-.069,.029],[0,-.312,.011,.008]],16);
  }
  plate(relic,'vigilEtching',[[0,.229,-.152],[.085,.055,-.154],[0,-.135,-.107],[-.085,.055,-.154]],.057);
  gem(relic,'vigilPearl',0,.049,-.200,.023,.061,.022);
  k.geometry(relic,'vigilSilver',new T.TorusGeometry(.082,.009,5,mobile?20:30).scale(1,1.18,1).translate(0,.052,-.196));
  for(const side of sides){
    seam(relic,'vigilEtching',[[side*.047,.141,-.144,.007],[side*.111,.132,-.145,.009],[side*.157,.187,-.136,.006],
      [side*.180,.201,-.097,.003]],10);
    seam(relic,'vigilEtching',[[side*.057,.001,-.164,.006],[side*.117,-.062,-.132,.008],
      [side*.109,-.118,-.092,.004]],8);
    gem(relic,'vigilPearl',side*.122,.129,-.154,.009,.013,.008);
  }
  const {halo,wheel,bands,light}=buildHalo(k,form,mobile);
  const fragments=wardenFragments(form,wheel,mobile);
  const fade=wardenDissolve(Object.entries(k.materials)
    .filter(([name])=>name.startsWith('vigil')).map(([,material])=>material),false);
  const emissions=[light,...lamps];
  return {root:form,head,fade,pose({beat,headtime,wind,strike,travel,fall,step,stagger,subdued,attackPattern,progress=0}){
    const pulse=Math.sin(beat*.56),cast=Math.max(wind,strike*.95);
    const visibility=(1-fall)*(subdued?.65:1);
    const invocation=attackPattern==='eclipse'||attackPattern==='spiral'||attackPattern==='summon';
    const thrust=attackPattern==='lance',slash=attackPattern==='cleave'||attackPattern==='sweep'||attackPattern==='jaws';
    const stomp=attackPattern==='toll'||attackPattern==='cinders';
    const gather=invocation?wind:0,unfold=invocation?strike:0;
    const coil=slash?wind:0,slice=slash?strike:0;
    const draw=thrust?wind:0,reach=thrust?strike:0;
    const press=stomp?wind:0,impact=stomp?strike:0;
    body.position.y=1.36+pulse*.026+strike*.039+gather*.08+press*.035-impact*.11;
    const breaking=revealCurve(progress,.05,.31)*(1-revealCurve(progress,.36,.71));
    body.rotation.x=-wind*.12+strike*.15-stagger*.18-breaking*.16+reach*.21+impact*.28-gather*.11;
    body.rotation.y=.33*coil-.39*slice+.18*draw-.22*reach;
    body.rotation.z=-.10*coil+.13*slice-.09*reach;
    head.rotation.set(-.038+pulse*.043+wind*.106-strike*.096+.13*impact-.11*gather,
      -body.rotation.y*.62,-stagger*.10+.07*slice);
    const blink=revealCurve(Math.cos(headtime*1.61+.85),.996,1);
    for(const lid of lids)lid.scale.y=1-.86*blink-.10*press;
    hem.rotation.set(-travel*.10+Math.sin(beat*.71)*.027,Math.sin(beat*.45)*(.035+travel*.034),pulse*.026);
    surcoat.rotation.x=.071+Math.sin(beat*.76)*.062+travel*.143+strike*.18+breaking*.43;
    for(const {train,side} of tails){
      train.rotation.x=travel*.28+Math.sin(beat*.81+side*.5)*.077+strike*.25+breaking*.49;
      train.rotation.z=side*(.07+pulse*.038+wind*.12-strike*.18);
    }
    for(const {shoulder,elbow,wrist,foot,side,light:palm} of arms){
      const lead=side===1;
      shoulder.rotation.set(-.94-wind*.22-strike*.32+stagger*.29+breaking*.49-gather*.31-unfold*.18+
        (lead?.46*draw-.54*reach:.18*draw+.27*reach)+.51*impact-(lead?.30*coil:0),
      side*(.11+wind*.12)+(lead?.40*coil-.66*slice:0),
      side*(.72+pulse*.061+wind*.18-strike*.22-fall*.26+breaking*.28-.56*gather+.69*unfold+
        (lead?-.37*draw-.42*reach:.17*reach)+.22*press-.27*impact+(lead?.26*coil+.29*slice:0)));
      elbow.rotation.set(-.27-wind*.17+strike*.18-.47*gather+.22*unfold+
        (lead?-draw*.54+reach*.24:.05*draw-.32*reach),side*.09,-side*(.19+strike*.09-.14*impact));
      wrist.rotation.set(.36+wind*.22-strike*.27+.30*gather-.26*unfold-(lead?.36*reach:0)-.47*impact,
        side*(.23+wind*.16-strike*.19+.25*press),-side*.12+(lead?.35*slice:0));
      foot.rotation.x=Math.sin(step+side*Math.PI*.5)*travel*.38;
      foot.position.y=.264+Math.max(0,Math.sin(step+side*Math.PI*.5))*travel*.063;
      palm.material.uniforms.power.value=Math.max(breaking,gather*.92,unfold,lead?cast:cast*(1-.66*Math.max(draw,reach,coil,slice)));
      const direct=lead?Math.max(draw,reach,coil,slice):0;
      palm.material.uniforms.seal.value=(subdued?.58:1)*Math.max(
        revealCurve(gather,.34,.88),unfold*.86,
        .73*revealCurve(Math.max(direct,press,impact),.44,.94),
      );
    }
    costume.visible=progress<.76;
    halo.position.y=body.position.y+.80;
    halo.rotation.set(body.rotation.x-.24+pulse*.042,stagger*.16,Math.sin(beat*.29)*.044);
    wheel.rotation.z=headtime*.13+wind*.31+gather*.29+unfold*.51;
    bands.visible=progress<.12;
    light.visible=progress<.19;
    fade.amount.value=revealCurve(progress,.19,.76);
    fragments.update(progress);
    for(const emission of emissions){
      emission.material.uniforms.clock.value=headtime;
      emission.material.uniforms.visibility.value=visibility*(1-revealCurve(progress,.14,.37));
    }
    light.material.uniforms.power.value=Math.max(cast,breaking,gather*.94,unfold);
  },dispose(){
    for(const emission of emissions)emission.material.dispose();
    fragments.dispose();
  }};
}
