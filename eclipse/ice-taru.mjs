import * as T from '../three.min.mjs';
import {sculptVolume,wingWeb} from './sculpt-volume.mjs?v=sculpted-1';

const sides=[-1,1];
const mirror=(side,list)=>list.map(([x,...rest])=>[side*x,...rest]);
const line=(k,j,finish,path,steps=12)=>k.sculpt.sweep(j,finish,path,{steps,sides:6,ridge:.20});
const plate=(k,j,finish,path,depth=.037)=>k.sculpt.plate(j,finish,path,depth,.015);
const cast=(k,j,finish,path,mobile,seed)=>k.geometry(j,finish,sculptVolume(path,{
  sides:mobile?11:16,rings:mobile?14:20,section:2.37,ridge:.21,seed,
}));

export const taruFinishes={
  taruMask:[0x395e64,.24,.57,'hide'],taruDark:[0x223041,.25,.77,'hide'],
  taruPale:[0xa4bac3,.32,.57,'bone'],taruSteel:[0x687e8b,.76,.48,'iron'],
  taruOxide:[0x394755,.53,.58,'iron'],taruSilk:[0x262e50,.10,.80,'cloth'],
  taruFrost:[0x77c8d4,.26,.40,'gem'],taruHair:[0xa9adb7,.08,.73,'hide'],
  taruRoots:[0x5b6570,.11,.78,'hide'],
};

export function carveTaruHead(k,head,mobile){
  const jaw=k.bone(head,0,-.099,.067),hair=k.bone(head,0,.214,-.108);
  head.name='天草樽 · 靛霜面甲';
  cast(k,head,'taruMask',[[0,-.159,.068,.116,.106],[0,-.070,.069,.158,.120],
    [0,.025,.058,.173,.134],[0,.129,-.009,.171,.141],[0,.231,-.054,.111,.084]],mobile,5);
  cast(k,jaw,'taruDark',[[0,-.114,.046,.093,.067],[0,-.069,.090,.137,.058],
    [0,.012,.093,.120,.050]],mobile,11);
  cast(k,hair,'taruRoots',[[0,-.109,-.058,.066,.073],[0,.003,-.039,.125,.101],
    [.012,.114,-.061,.138,.097],[.025,.159,-.143,.112,.093],[.032,.174,-.209,.068,.064]],mobile,12);
  for(const side of sides){
    const p=path=>mirror(side,path);
    plate(k,head,'taruSteel',p([[.096,.153,.138],[.156,.199,.057],[.215,.18,-.040],
      [.207,.083,.030],[.177,-.008,.139],[.130,-.031,.166],[.123,.056,.144]]),.044);
    line(k,head,'taruDark',p([[.034,.047,.168,.009],[.081,.041,.189,.025],
      [.122,.071,.173,.023],[.159,.100,.131,.004]]));
    k.mesh(head,'gem','glow',side*.092,.051,.190,.048,.013,.014,.035,side*.40,side*.28);
    line(k,head,'taruPale',p([[.072,.134,.158,.018],[.113,.211,.128,.033],[.139,.337,.056,.028],
      [.160,.445,-.023,.021],[.177,.482,-.077,.004]]),14);
    line(k,head,'taruPale',p([[.124,.147,.095,.017],[.195,.207,.028,.031],[.247,.287,-.054,.022],
      [.270,.355,-.108,.005]]),11);
    line(k,jaw,'taruPale',p([[.049,-.063,.153,.011],[.086,-.01,.149,.026],
      [.093,.048,.141,.015],[.081,.075,.137,.004]]));
    for(let i=0;i<4;i++){
      line(k,hair,i%3?'taruHair':'taruRoots',p([[.021+i*.028,-.048,-.028,.039],
        [.038+i*.029,.085,-.072,.042],[.044+i*.026,.156,-.145,.033],
        [.038+i*.024,.147,-.263,.012]]),13);
    }
  }
  line(k,head,'taruPale',[[.012,.123,.151,.043],[-.006,.238,.116,.048],[-.025,.364,.057,.029],
    [-.025,.475,-.033,.021],[-.016,.524,-.076,.003]],14);
  return {jaw,hair};
}

export function buildTaruWing(k,body,side,mobile){
  const p=path=>mirror(side,path);
  const wing=k.bone(body,side*.243,.609,-.201);
  const elbow=k.bone(wing,side*.406,.197,-.101);
  wing.name='天草樽 · 霜骨翼';
  cast(k,wing,'taruOxide',p([[0,-.015,0,.088,.081],[.125,.108,-.046,.101,.078],
    [.277,.168,-.092,.082,.064],[.409,.202,-.103,.061,.051]]),mobile,7);
  const ribs=[
    [[0,0,0],[.241,.132,.019],[.367,.221,-.050]],
    [[0,0,0],[.344,.067,-.092],[.599,-.14,-.202]],
    [[0,0,0],[.231,-.140,-.124],[.474,-.382,-.226]],
    [[0,0,0],[.088,-.221,-.106],[.277,-.458,-.198]],
    [[0,0,0],[-.025,-.219,-.081],[.091,-.351,-.138]],
  ];
  k.geometry(elbow,'taruDark',wingWeb(ribs,side,7.3+side));
  for(const [i,rib] of ribs.entries()){
    const path=p(rib.map(([x,y,z],j)=>[x,y,z,[.041,.030,.003][j]]));
    line(k,elbow,i%2?'taruSteel':'taruPale',path,13);
    line(k,elbow,i%2?'taruPale':'taruOxide',path.map(([x,y,z,r])=>[x,y+.009,z+.024,r*.52]),11);
    if(!i)continue;
    const u=rib[1],v=rib[2];
    line(k,elbow,'taruFrost',p([[u[0]*.76,u[1]*.68,u[2]*.80+.02,.004],
      [u[0]*.97,u[1]*.99,u[2]+.041,.010],[v[0]*.82,v[1]*.71,v[2]*.83,.004]]),9);
  }
  line(k,wing,'taruPale',p([[.005,.073,.041,.028],[.153,.186,-.033,.031],
    [.287,.22,-.063,.027],[.396,.236,-.102,.008]]),13);
  return {wing,elbow,side};
}

export function fitTaruHands(k,joint,side,mobile){
  const {hand}=joint,p=path=>mirror(side,path);
  const frost=k.bone(hand,0,-.153,.196);
  frost.name='天草樽 · 手心霜火';
  if(!k.materials.taruFrostVapor){
    k.materials.taruFrostVapor=new T.ShaderMaterial({
      transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      uniforms:{clock:{value:0},surge:{value:0}},
      vertexShader:`
        uniform float clock,surge;
        varying vec3 ember,surface,eye;
        void main(){
          float wave=sin(position.x*8.+position.y*12.-clock*7.)*cos(position.z*11.-position.y*5.+clock*5.);
          vec3 p=position*(.86+wave*.18+surge*.17);
          vec4 mv=modelViewMatrix*vec4(p,1.);
          ember=p;
          surface=normalize(normalMatrix*normal);
          eye=normalize(-mv.xyz);
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader:`
        uniform float clock,surge;
        varying vec3 ember,surface,eye;
        void main(){
          float rim=1.-clamp(dot(normalize(surface),normalize(eye)),0.,1.);
          float weave=sin(ember.x*12.+ember.y*19.+ember.z*9.-clock*9.)*.5+.5;
          float vapour=pow(rim,2.)*(.32+.68*weave);
          float core=smoothstep(.57,.95,weave)*(.27+.43*surge);
          vec3 hue=mix(vec3(.13,.56,.69),vec3(.63,.92,1.),smoothstep(.35,1.,weave));
          gl_FragColor=vec4(hue,max(vapour,core)*(.53+.22*surge));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  }
  const vapor=new T.Mesh(new T.IcosahedronGeometry(1,mobile?2:3),k.materials.taruFrostVapor);
  vapor.name='天草樽 · 緊貼手心嘅霜焰';
  vapor.position.set(side*.052,-.055,.091);
  vapor.scale.set(.151,.199,.153);
  vapor.renderOrder=33;
  frost.add(vapor);
  for(let i=0;i<3;i++){
    const x=.032+i*.061;
    cast(k,frost,i%2?'taruSteel':'taruFrost',p([[x*.71,.055-i*.031,-.026,.021,.031],
      [x+.024,.008-i*.037,.082,.047,.034],[x+.050,-.068-i*.038,.143,.033,.038],
      [x+.038,-.133-i*.072,.189,.004,.005]]),mobile,11+i);
    line(k,frost,'taruPale',p([[x*.74,.064-i*.043,.007,.006],[x+.032,.013-i*.037,.129,.020],
      [x+.058,-.068-i*.039,.180,.014],[x+.041,-.138-i*.075,.229,.003]]),11);
  }
  return frost;
}

export function pulseTaruHands(k,time,force){
  const uniforms=k.materials.taruFrostVapor.uniforms;
  uniforms.clock.value=time;
  uniforms.surge.value=force;
}

export function sewTaruTail(k,body,hair,skin){
  for(let i=-3;i<=3;i++){
    const x=i*.033,sag=Math.abs(i)*.024;
    skin.silk(hair,'天草樽 · 白髮馬尾',[[x,.133,-.127,.032],[x*1.4,.097,-.258,.069],
      [x*1.56,-.101,-.343,.086],[x*1.67,-.381,-.415,.081],
      [x*1.51,-.752,-.446,.064],[x*1.18,-1.124+sag,-.501,.046],
      [x*.47,-1.319+sag,-.565,.009]],{style:'mane',tint:i%2?0xa9afb7:0xbfc2c9,
      trim:0x838f9c,phase:i*.37,flex:1.39,across:[.93,.07,.24]});
  }
  for(const side of sides)for(let i=0;i<3;i++){
    const x=.053+i*.105;
    skin.silk(body,'天草樽 · 靛青佩襬',mirror(side,[[x,.008,.218,.085],[x+.02,-.254,.267,.101],
      [x+.04,-.499,.309,.120],[x+.08,-.783,.297,.100],[x+.103,-1.013,.270,.070]]),
    {style:'woven',tint:i===1?0x2d3754:0x394a6a,trim:0x8fadb8,lining:0x313c55,
      phase:side*.77+i*.81,flex:1.11});
  }
  return true;
}
