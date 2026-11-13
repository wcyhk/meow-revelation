import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const PI=Math.PI,TAU=PI*2;
const mirror=(side,points)=>points.map(([x,...rest])=>[side*x,...rest]);

function embers(parent,mobile){
  const count=mobile?23:39,positions=new Float32Array(count*3),ids=new Float32Array(count);
  for(let i=0;i<count;i++)ids[i]=i;
  const position=new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage);
  const geometry=new T.BufferGeometry().setAttribute('position',position).setAttribute('motif',new T.BufferAttribute(ids,1));
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{clock:{value:0},surge:{value:0},fade:{value:1}},
    vertexShader:`attribute float motif;uniform float clock,surge;varying float heat,theta;
      void main(){
        heat=.4+pow(.5+.5*sin(clock*6.+motif*2.399),2.)*.6;theta=motif*1.7+clock*.8;
        vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;
        gl_PointSize=clamp((70.+surge*38.)/max(1.,-p.z),2.1,17.)*(.57+heat*.55);
      }`,
    fragmentShader:`uniform float fade,surge;varying float heat,theta;
      void main(){
        vec2 u=gl_PointCoord*2.-1.;u=mat2(cos(theta),sin(theta),-sin(theta),cos(theta))*u;
        float r=abs(u.x)*1.26+abs(u.y)*.63;
        float core=exp(-r*7.8),streak=exp(-r*3.8)*smoothstep(1.,.52,r);
        vec3 c=mix(vec3(.64,.046,.021),vec3(1.,.58,.119),heat*.79+core*.18);
        gl_FragColor=vec4(c+core*.44,(core+streak*.78)*fade*(.71+surge*.24));
        #include <colorspace_fragment>
      }`,
  });
  const points=new T.Points(geometry,material);
  points.frustumCulled=false;parent.add(points);
  return {position,material,vector:new T.Vector3(),dispose(){geometry.dispose();material.dispose();}};
}

export function sculptKirin(k,mobile){
  const {root,bone,mesh,sculpt}=k;
  const body=bone(root,0,1.06,0),head=bone(body,0,.72,1.03);
  const jaw=bone(head,0,-.24,.36),tail=bone(body,0,.30,-1.14);
  const rig={type:'kirin',knees:[],lume:null,jaw,tail};
  const build=(part,finish,sections,{sides=13,rings=16,section=2.3,ridge=.135,seed=0}={})=>
    k.geometry(part,finish,sculptVolume(sections,{sides,rings,section,ridge,seed}));
  const blade=(part,finish,sections,i=0)=>build(part,finish,sections,{sides:8,rings:10,section:1.59,ridge:.21,seed:i});
  build(body,'coal',[[0,-.17,-1.28,.134,.18],[0,-.03,-1.12,.417,.30],[0,.006,-.75,.50,.431],
    [0,.033,-.23,.37,.37],[0,.09,.24,.434,.414],[0,.264,.66,.508,.442],
    [0,.44,.82,.369,.304],[0,.55,.92,.204,.221]],{sides:22,rings:28,ridge:.12});
  build(body,'body',[[0,.112,.47,.47,.31],[0,.302,.654,.439,.379],[0,.454,.75,.363,.346],
    [0,.662,.872,.271,.279],[0,.827,1.01,.224,.217],[0,.908,1.126,.182,.20]],
  {sides:17,rings:23,section:2.54});
  build(head,'body',[[0,-.30,.12,.15,.14],[0,-.224,.219,.279,.194],[0,-.123,.165,.338,.268],
    [0,.028,.065,.331,.296],[0,.17,-.056,.228,.213],[0,.222,-.16,.119,.136]]);
  build(head,'coal',[[0,-.279,.31,.124,.191],[0,-.201,.407,.154,.217],[0,-.108,.388,.198,.256],
    [0,-.026,.245,.187,.219],[0,.044,.112,.119,.169]],{section:2.93,sides:16});
  build(jaw,'edge',[[0,-.052,.08,.128,.093],[0,-.019,.13,.141,.118],[0,.019,.091,.187,.16],
    [0,.072,-.099,.153,.135]],{section:2.52,sides:13});
  blade(head,'edge',[[0,-.169,.579,.049,.060],[0,-.074,.494,.103,.061],[0,.084,.276,.091,.085],
    [0,.214,.07,.087,.071],[0,.338,-.129,.009,.006]]);
  build(tail,'coal',[[0,.00,.21,.174,.151],[0,.074,-.18,.152,.132],[.07,.108,-.42,.129,.119],
    [.105,.185,-.67,.119,.099],[.066,.306,-.93,.083,.072],[.027,.32,-1.16,.009,.006]],{rings:21,sides:14});
  for(let i=0;i<8;i++){
    const y=.265+(i%3)*.043,x=(i-3.5)*.068,z=-.64-i*.027;
    blade(tail,i%3===0?'rust':'ember',[[x*.50,y,z+.12,.080,.061],[x,y+.11,z-.14,.101,.047],
      [x*1.54,y+.19,z-.38,.062,.045],[x*1.7,y+.09,z-.71+(i%3)*.042,.004,.007]],i);
  }
  const legs=[];
  for(const side of [-1,1]){
    const reflect=points=>mirror(side,points);
    mesh(head,'round','coal',side*.244,-.038,.251,.094,.088,.073,0,side*.29);
    mesh(head,'gem','glow',side*.255,-.048,.314,.043,.031,.026,0,side*.29,-side*.18);
    blade(head,'edge',reflect([[.124,.042,.325,.062,.048],[.237,.071,.270,.096,.064],
      [.321,.046,.112,.102,.052],[.395,.029,-.056,.064,.043],[.522,.093,-.30,.008,.006]]),side);
    blade(head,'edge',reflect([[.167,.108,-.101,.121,.091],[.289,.271,-.241,.134,.089],
      [.469,.474,-.326,.079,.065],[.491,.684,-.37,.055,.045],[.426,.88,-.53,.006,.005]]),11);
    blade(head,'ivory',reflect([[.281,.288,-.197,.060,.044],[.446,.414,-.19,.073,.041],
      [.521,.512,-.288,.036,.022],[.529,.605,-.462,.006,.004]]),7);
    blade(head,'trim',reflect([[.262,-.205,.344,.045,.038],[.331,-.196,.477,.045,.027],
      [.371,-.132,.626,.032,.022],[.424,-.073,.688,.005,.003]]),6);
    for(let i=0;i<5;i++){
      const z=.51-i*.335,x=.26+Math.abs(i-2)*.037,y=.48-i*.045;
      blade(body,i%3===0?'edge':'body',reflect([[x,y,.05+z,.093,.067],[x+.143,y+.06,z-.044,.133,.083],
        [x+.261,y+.134,z-.134,.104,.067],[x+.333,y+.219,z-.275,.073,.034],
        [x+.363,y+.34+(i%2)*.14,z-.40,.008,.006]]),i);
      sculpt.sweep(body,'ivory',reflect([[x+.126,y+.076,z-.022,.026],[x+.262,y+.178,z-.147,.024],
        [x+.334,y+.286+(i%2)*.082,z-.31,.003]]),{sides:6,steps:10,ridge:.17});
      blade(body,i%2?'body':'edge',reflect([[x+.003,y-.116,z+.156,.088,.064],
        [x+.16,y-.235,z+.047,.128,.080],[x+.202,y-.227,z-.096,.082,.05],
        [x+.172,y-.277,z-.253,.008,.006]]),i+8);
    }
    for(const front of [true,false]){
      const ankle=bone(body,side*(front?.364:.333),front?.16:.058,front?.62:-.843);
      const knee=bone(ankle,side*.032,-.45,front?.15:-.145);
      const hoof=bone(knee,side*.011,-.457,front?-.053:.13);
      legs.push(ankle);
      rig.knees.push({ankle,knee,hoof,side,front});
      build(ankle,'body',reflect([[.03,-.514,front?.094:-.104,.132,.154],[.062,-.352,front?.083:-.14,.169,.186],
        [.076,-.156,front?.025:-.089,.229,.239],[.03,.083,0,.209,.212]]),{sides:14,rings:16,section:2.67});
      blade(ankle,'edge',reflect([[.184,-.349,.136,.098,.061],[.238,-.199,.102,.124,.066],
        [.261,-.034,.036,.095,.058],[.26,.109,-.037,.033,.041],[.193,.202,-.122,.006,.005]]),7);
      build(knee,'coal',[[0,-.485,.055,.127,.159],[0,-.306,.023,.123,.148],[side*.032,-.154,-.02,.150,.16],
        [.0,.061,.025,.154,.164]],{sides:12,rings:16,section:2.65});
      build(hoof,'rust',[[0,-.143,.07,.17,.152],[0,-.082,.069,.203,.221],[0,-.019,.041,.187,.187],[0,.105,0,.157,.127]],
        {sides:13,rings:12,section:2.64});
      for(const split of [-1,1])blade(hoof,'coal',[[split*.078,.017,.129,.074,.070],[split*.088,-.069,.174,.083,.075],
        [split*.099,-.152,.267,.048,.045],[split*.103,-.159,.286,.006,.005]],3);
      for(let i=0;i<5;i++){
        const a=i*TAU/5,b=a+.41;
        blade(hoof,i%3===1?'rust':'ember',[[Math.cos(a)*.107,.01,Math.sin(a)*.10,.077,.083],
          [Math.cos(a)*.185,.16,Math.sin(a)*.185,.095,.067],[Math.cos(b)*.174,.33,Math.sin(b)*.195,.064,.025],
          [Math.cos(b)*.232,.49+(i%3)*.091,Math.sin(b)*.271,.006,.004]],i);
      }
    }
  }
  for(let i=0;i<7;i++){
    const z=.69-i*.254,y=.68-i*.033;
    blade(body,i%3?'body':'edge',[[0,y-.158,z+.128,.111,.093],[0,y+.039,z+.023,.132,.091],
      [(i%2?.026:-.026),y+.269,z-.182,.065,.036],[0,y+.408-(i%3)*.061,z-.291,.006,.005]],i+19);
  }
  const crest=bone(root,0,0,0);
  rig.lume=embers(root,mobile);
  return {body,head,tail,legs,crest,signature:rig};
}

export function poseKirin(model,time,step,{wind,strike,travel,fall,stage}){
  const {knees,jaw,tail,lume}=model.signature;
  jaw.rotation.x=.09+wind*.40+strike*.30;
  model.head.rotation.x+=-.04+Math.sin(step*.91)*travel*.11-wind*.29+strike*.37;
  model.body.rotation.y=Math.sin(step*.5)*travel*.058;
  tail.rotation.y=Math.sin(step*.64)*(.16+travel*.22)+strike*.19;
  tail.rotation.x=.05+Math.sin(time*4)*.08+wind*.14;
  for(const leg of knees){
    const {side,front,ankle,knee,hoof}=leg;
    const beat=step+(side===1?PI:0)+(front?0:PI*.86);
    const lift=Math.max(0,Math.cos(beat))*travel;
    ankle.rotation.x=travel*Math.sin(beat)*.40+(front?-wind*.21+strike*.14:wind*.092);
    knee.rotation.x=(front?1:-1)*(.066+lift*.67)+wind*(front?.31:.09)-strike*.24;
    hoof.rotation.x=-knee.rotation.x*.65+lift*.11;
  }
  model.root.updateMatrixWorld(true);
  const {vector,position,material}=lume;
  const surge=wind*.95+strike*.74+stage*.41;
  material.uniforms.clock.value=time%65536;
  material.uniforms.surge.value=surge;
  material.uniforms.fade.value=1-fall;
  for(let i=0;i<position.count;i++){
    const group=i%6,pulse=(time*(.51+((i*21)%7)*.057)+i*.163)%1;
    const a=i*2.399+time*1.73;
    const source=group<4?knees[group].hoof:group===4?jaw:tail;
    const width=.112+pulse*(.28+surge*.20);
    vector.set(Math.cos(a)*width,pulse*(.47+surge*.32),Math.sin(a)*width-(group===5?.72:0));
    model.root.worldToLocal(source.localToWorld(vector));
    position.setXYZ(i,vector.x,vector.y,vector.z);
  }
  position.needsUpdate=true;
}
