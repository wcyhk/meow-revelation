import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';
import {markEnemyWeapon} from './enemy-weapon-pose.mjs?v=night-current-1';
import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';

const sides=[-1,1];
const reflect=(side,path)=>path.map(([x,...rest])=>[side*x,...rest]);

function wardenFinishes(k){
  for(const [name,color,metalness,roughness,kind] of [
    ['wardenBronze',0x7a542e,.73,.54,'bronze'],
    ['wardenSteel',0x383d44,.67,.48,'iron'],
    ['wardenWorn',0x877e65,.46,.53,'bone'],
    ['wardenCloth',0x442b32,.09,.78,'cloth'],
  ]){
    k.materials[name]=paintedFinish(new T.MeshStandardMaterial({
      color,metalness,roughness,vertexColors:true,envMap:forgeEnvironment(),
      envMapIntensity:metalness>.4?.81:.33,
    }),kind,true,true);
  }
}

function crownSparks(k,anchor,mobile){
  const count=mobile?64:122,phases=new Float32Array(count),centers=new Float32Array(count*3);
  for(let i=0;i<count;i++)phases[i]=(i*.6180339)%1;
  const plume=new T.BufferGeometry();
  plume.setAttribute('position',new T.BufferAttribute(centers,3));
  plume.setAttribute('seed',new T.BufferAttribute(phases,1));
  const material=new T.ShaderMaterial({
    uniforms:{clock:{value:0},summon:{value:0},stage:{value:0}},
    transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,
    vertexShader:`
      attribute float seed;
      uniform float clock,summon,stage;
      varying float life;
      void main(){
        float wave=fract(seed*7.01+clock*(.28+seed*.18));
        float angle=seed*82.12+clock*(1.95+stage*.15)-wave*1.8;
        float spiral=(.114+sin(seed*88.)*.10)+wave*(.18+summon*.13);
        vec3 p=vec3(cos(angle)*spiral,(wave-.18)*(.44+summon*.19),sin(angle)*spiral*.71+.13);
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mv;
        life=sin(wave*3.14159)*(.30+stage*.08+summon*.43)*(.6+seed*.54);
        gl_PointSize=clamp((14.+seed*10.+summon*7.)/max(1.,-mv.z),1.1,6.5);
      }
    `,
    fragmentShader:`
      varying float life;
      void main(){
        float r=length((gl_PointCoord-.5)*2.);
        float spec=exp(-r*r*10.);
        float glow=exp(-r*r*3.3)*(1.-smoothstep(.58,1.,r));
        gl_FragColor=vec4(mix(vec3(.81,.14,.031),vec3(1.,.79,.36),spec),life*(glow*.56+spec*.66));
      }
    `,
  });
  const motes=new T.Points(plume,material);
  motes.name='王冠守夜者 · 燈芯旋火';motes.frustumCulled=false;
  anchor.add(motes);
  return {plume,material,motes};
}

export function sculptFinalWarden(k,mobile){
  const {root,bone,mesh,sculpt,geometry}=k;
  wardenFinishes(k);
  const body=bone(root,0,1.27,0),head=bone(body,0,.945,.057),neck=bone(body,0,.678,-.083);
  const arms=[],legs=[],joints=[],flaps=[],ribs=[],hems=[],shins=[],mask=[];
  const volume=(joint,m,path,seed=0)=>geometry(joint,m,sculptVolume(path,{
    sides:mobile?11:16,rings:mobile?15:23,section:2.34,ridge:.19,seed,
  }));
  const piping=(joint,m,path)=>sculpt.sweep(joint,m,path,{sides:7,steps:14,ridge:.22});
  const plate=(joint,m,points,t=.065)=>sculpt.plate(joint,m,points,t,.018);
  const cleft=bone(body,0,.315,.257);
  cleft.name='王冠守夜者 · 長明燈匣';
  volume(body,'deep',[[0,-.292,-.032,.226,.194],[0,-.075,-.010,.303,.255],
    [0,.179,-.011,.352,.289],[0,.405,-.062,.438,.312],[0,.617,-.074,.431,.304],[0,.804,-.057,.225,.202]]);
  volume(neck,'body',[[0,-.21,0,.199,.20],[0,.012,-.003,.208,.212],[0,.212,.058,.173,.183],[0,.307,.068,.121,.137]]);
  volume(head,'deep',[[0,-.209,.026,.097,.087],[0,-.09,.084,.207,.165],[0,.092,.043,.237,.203],
    [0,.238,-.030,.222,.183],[0,.348,-.077,.138,.121]]);
  volume(cleft,'deep',[[0,-.274,-.029,.134,.057],[0,-.193,.007,.212,.12],[0,.015,.035,.234,.131],
    [0,.164,.024,.213,.131],[0,.251,-.014,.121,.068]]);
  volume(cleft,'glow',[[0,-.155,.06,.03,.025],[0,-.097,.111,.076,.075],[0,.025,.148,.111,.062],
    [0,.091,.132,.074,.049],[0,.166,.043,.015,.011]],5.8);
  const sparks=crownSparks(k,cleft,mobile);
  for(let i=0;i<5;i++){
    const x=(i-2)*.056;
    piping(cleft,i===2?'wardenWorn':'wardenSteel',[[x*.57,-.204,.107,.011],[x,-.093,.183,.016],
      [x*1.12,.018,.217,.018],[x*.74,.142,.18,.015],[x*.39,.225,.095,.006]]);
  }

  for(const side of sides){
    const out=path=>reflect(side,path);
    const half=bone(head,side*.073,.015,.213);
    half.name='王冠守夜者 · 裂面';
    volume(half,'wardenSteel',out([[.017,-.204,.07,.03,.033],[.073,-.124,.089,.057,.054],
      [.132,-.004,.021,.064,.041],[.129,.093,-.012,.092,.064],[.108,.184,-.028,.105,.071],
      [.038,.247,-.026,.069,.039],[-.007,.292,-.068,.006,.005]]),side*2.7);
    volume(half,'wardenWorn',out([[.013,-.215,.099,.006,.005],[.061,-.126,.131,.033,.027],
      [.120,-.034,.102,.050,.031],[.165,.045,.041,.051,.036],[.153,.130,.043,.045,.037],
      [.081,.177,.085,.039,.032],[.024,.232,.056,.028,.023],[-.012,.291,-.042,.004,.004]]),side*1.14);
    piping(half,'wardenBronze',out([[.005,.207,.074,.018],[.063,.186,.106,.027],[.125,.148,.096,.026],
      [.17,.102,.043,.019],[.184,.054,-.006,.004]]));
    piping(half,'glow',out([[.016,.092,.105,.005],[.067,.109,.121,.015],[.104,.116,.103,.010],[.135,.119,.091,.004]]));
    for(let n=0;n<3;n++){
      const travel=n*.038;
      piping(half,'wardenWorn',out([[.017+travel,-.084-travel,.128,.014],[.046+travel,-.116-travel,.146,.016],
        [.075+travel,-.173-travel,.143,.010],[.087+travel,-.215-travel,.123,.004]]));
    }
    for(let n=0;n<4;n++){
      const i=n*.034;
      piping(half,n===0?'wardenBronze':'wardenSteel',out([[.098+i*.42,.186-i,.082,.007],
        [.128+i*.64,.191-i,.069,.011],[.157+i*.59,.163-i,.042,.008],[.163+i*.61,.118-i,.022,.003]]));
    }
    mask.push({half,side});
    const spike=bone(head,side*.124,.155,-.041);
    volume(spike,'wardenSteel',out([[.013,-.013,.068,.096,.047],[.089,.144,.002,.108,.059],
      [.12,.306,-.052,.077,.048],[.184,.481,-.097,.056,.030],[.247,.577,-.172,.028,.019],
      [.279,.618,-.188,.005,.004]]),side*2);
    piping(spike,'wardenBronze',out([[.055,.105,.050,.026],[.100,.260,.012,.028],[.175,.443,-.040,.024],
      [.253,.55,-.112,.013]]));
    for(let i=0;i<4;i++){
      const y=.123-i*.141,spread=.413-i*.029;
      const rib=bone(cleft,0,y,-.058);
      rib.name='王冠守夜者 · 肋甲';
      plate(rib,i%2?'wardenSteel':'wardenBronze',out([[.042,.049,.139],[.156,.124,.115],[spread,.097,-.058],
        [spread+.007,.011,-.123],[spread-.059,-.037,-.143],[.172,.029,.095],[.046,-.018,.169]]),.055);
      piping(rib,i%2?'wardenWorn':'body',out([[.059,.038,.168,.011],[.176,.105,.137,.017],[spread-.015,.092,-.037,.013]]));
      ribs.push({rib,side,i});
    }
    const arm=bone(body,side*.441,.501,.012),elbow=bone(arm,side*.061,-.49,.015),grip=bone(elbow,side*.027,-.420,.065);
    arms.push(arm);joints.push({joint:elbow,side});
    volume(arm,'deep',out([[.054,-.514,.021,.102,.127],[.091,-.322,-.014,.162,.164],
      [.025,-.064,-.033,.193,.174],[0,.151,-.07,.126,.12]]),side);
    volume(elbow,'body',out([[.017,-.482,.099,.092,.103],[.079,-.354,.048,.138,.147],
      [.074,-.149,.031,.161,.166],[.015,.036,.004,.142,.133]]),side+1);
    volume(grip,'deep',out([[.015,-.151,.074,.091,.082],[.014,-.068,.072,.125,.103],
      [.02,.054,.012,.113,.093]]));
    for(let i=0;i<3;i++){
      const y=.25-i*.121,x=.067+i*.035,tip=side<0?.41:.27;
      plate(arm,i===0?'wardenSteel':'body',out([[-.128,y-.04,-.122],[-.045,y+.076,-.206],
        [x+.112,y+.137,-.157],[tip,y+.08,-.035],[tip-.051,y-.09,.108],[.102,y-.107,.178],
        [-.106,y-.06,.088]]));
      piping(arm,'wardenBronze',out([[.025,y+.081,-.235,.022],[x+.111,y+.141,-.187,.025],[tip+.015,y+.093,-.042,.021],
        [tip-.048,y-.071,.136,.019],[.153,y-.104,.202,.011]]));
    }
    for(let i=0;i<4;i++){
      const x=(i-1.5)*.056;
      piping(grip,'edge',[[x,-.056,.122,.027],[x,-.147,.143,.029],[x*.94,-.182,.096,.024],[x*.96,-.158,.061,.011]]);
    }
    const leg=bone(root,side*.273,.997,-.029),shin=bone(leg,side*.027,-.497,.058);
    legs.push(leg);shins.push({shin,side});
    volume(leg,'deep',out([[.034,-.55,.08,.120,.114],[.022,-.342,.038,.16,.161],
      [0,-.028,-.006,.207,.183],[.01,.101,-.004,.167,.153]]));
    volume(shin,'wardenSteel',out([[.022,-.442,.046,.093,.111],[.065,-.277,-.032,.133,.111],
      [.035,-.133,-.001,.157,.151],[.013,.037,.041,.15,.16]]));
    plate(shin,'wardenBronze',out([[-.098,.104,.101],[.042,.139,.169],[.153,.041,.128],
      [.127,-.160,.155],[.061,-.334,.141],[-.027,-.428,.141],[-.097,-.217,.124]]),.051);
    for(let i=0;i<3;i++){
      const x=(i-1)*.071;
      volume(shin,'wardenSteel',[[x,-.399,.133,.052,.046],[x,-.445,.26,.052,.046],[x,-.472,.34,.027,.018],
        [x,-.477,.379,.006,.004]],i+4);
    }

    for(let i=0;i<4;i++){
      const from=.091+i*.097,len=.86+i*.17;
      const cape=bone(body,side*from,.602-i*.076,-.26-i*.035);
      const end=bone(cape,side*(.10+i*.021),-len*.47,-.193);
      cape.name='王冠守夜者 · 側背垂旒';
      const width=.137+i*.029;
      volume(cape,i===1?'wardenSteel':'wardenCloth',out([[0,.037,0,width*.60,.042],[.021,-len*.129,-.063,width,.055],
        [.061,-len*.316,-.138,width*.97,.047],[.107+i*.018,-len*.53,-.194,width*.79,.041]]),i*2.1+side);
      volume(end,i===2?'deep':'wardenCloth',out([[.01,.064,.029,width*.71,.04],[.099,-len*.234,-.044,width*.92,.048],
        [.148,-len*.408,-.168,width*.56,.037],[.179,-len*.557,-.223,width*.22,.021],[.155,-len*.589,-.245,.005,.004]]),i*2.1-side);
      piping(end,'wardenBronze',out([[.018,.018,-.018,.014],[.093,-len*.212,-.066,.016],[.142,-len*.409,-.20,.014],
        [.15,-len*.554,-.256,.004]]));
      hems.push({cape,end,side,i});
    }
    if(side===1){
      const sword=bone(grip,0,-.049,.108);
      sword.name='王冠守夜者 · 落日裂王劍';
      markEnemyWeapon(sword,[.265,1.65,.14],{width:.20});
      piping(sword,'deep',[[0,-.33,-.02,.05],[0,-.110,0,.057],[.02,.091,.037,.068],[.04,.20,.05,.063]]);
      piping(sword,'trim',[[-.26,.18,.023,.043],[-.139,.234,.094,.061],[.032,.176,.096,.073],[.214,.245,.055,.052],[.317,.31,.043,.006]]);
      plate(sword,'body',[[-.078,.232,.053],[.143,.251,.036],[.233,.595,.035],[.181,.645,.038],
        [.271,.733,.062],[.339,1.184,.072],[.265,1.65,.14],[.093,1.394,.051],[-.039,1.03,.018],[-.086,.623,.029]],.088);
      piping(sword,'edge',[[-.066,.288,.104,.021],[-.091,.601,.085,.027],[-.033,1.014,.103,.026],
        [.096,1.392,.112,.025],[.269,1.635,.193,.008]]);
      piping(sword,'trim',[[.033,.314,.109,.028],[.092,.719,.092,.033],[.145,1.058,.111,.024],[.183,1.328,.116,.009]]);
    }else{
      const lantern=bone(grip,0,-.118,.169);
      lantern.name='王冠守夜者 · 殘燈';
      volume(lantern,'glow',[[0,-.235,0,.035,.026],[0,-.164,.041,.067,.069],[0,-.058,.021,.076,.072],[0,.021,0,.028,.031]]);
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3,x=Math.cos(a),z=Math.sin(a);
        piping(lantern,i%2?'trim':'edge',[[x*.029,.089,z*.029,.019],[x*.12,-.011,z*.12,.023],
          [x*.134,-.174,z*.134,.019],[x*.053,-.26,z*.053,.014],[0,-.278,0,.009]]);
      }
      flaps.push({joint:lantern,axis:'z',amp:.23,bias:0,seed:5.3});
    }
  }
  return {body,head,arms,legs,pattern:'duel',crest:bone(root,0,0,0),
    campaign:{flaps,joints},sourceSculpt:true,polishEnergy:{tint:0xee714d,shape:'embers',anchor:body,span:[.72,.94,.61]},
    disposeRig(){sparks.plume.dispose();sparks.material.dispose();},
    cataloguePose({beat,step,headtime,wind,strike,travel,stage,fall}){
      sparks.motes.visible=fall<.59;
      sparks.material.uniforms.clock.value=headtime;
      sparks.material.uniforms.summon.value=Math.max(wind*.73,strike)*(1-fall);
      sparks.material.uniforms.stage.value=stage;
      for(const {half,side} of mask){
        half.rotation.y=side*(stage*.11+wind*.061-strike*.081);
        half.rotation.z=side*(stage*.063+Math.sin(beat*.46)*.019);
      }
      for(const {rib,side,i} of ribs){
        rib.rotation.y=side*(Math.sin(beat*.73-i*.32)*.035+stage*.09+wind*.12-strike*.23);
      }
      for(const {cape,end,side,i} of hems){
        const wave=Math.sin(beat*.82-i*.66+side*.17);
        cape.rotation.x=travel*.23+wave*.055+wind*.12-strike*.25;
        cape.rotation.z=side*(.12+wave*.048+stage*.074+strike*.27);
        end.rotation.x=wave*.09+travel*.24-wind*.08+strike*.38;
        end.rotation.z=side*(wave*.058+fall*.21);
      }
      for(const {shin,side} of shins){
        const stepSwing=Math.sin(step+side*Math.PI*.5)*travel;
        shin.rotation.x=Math.max(0,stepSwing)*.56+strike*.23+fall*.28;
      }
    },
  };
}
