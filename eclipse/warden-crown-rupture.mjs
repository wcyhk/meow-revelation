import * as T from '../three.min.mjs';
import {revealCurve as ease} from './warden-transformation.mjs';

const tau=Math.PI*2;
const sides=[-1,1];
const whiteHeat=new T.Color(0xffdbba);
const moonHeat=new T.Color(0xb993ff);

function facet(sections,detail){
  const positions=[],uv=[],pigment=[],indices=[];
  for(const [row,layer] of sections.entries()){
    for(const [index,point] of layer.entries()){
      positions.push(...point);uv.push(index/detail,row/(sections.length-1));
      const patina=.74+.21*Math.max(0,Math.cos(index*1.44+row*.71));
      pigment.push(patina,patina,patina*1.09);
      if(row===sections.length-1)continue;
      const next=(index+1)%detail,a=row*detail+index,b=row*detail+next;
      indices.push(a,a+detail,b,b,a+detail,b+detail);
    }
  }
  const geo=new T.BufferGeometry().setIndex(indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(pigment,3));
  geo.computeVertexNormals();
  return geo;
}

function fractureCap(outline,center,down){
  const positions=[...center],uv=[.5,.5],indices=[];
  outline.forEach((point,i)=>{
    positions.push(...point);uv.push(.5+Math.sin(i)*.5,.5+Math.cos(i)*.5);
    const a=i+1,b=(i+1)%outline.length+1;
    indices.push(0,down?a:b,down?b:a);
  });
  const geo=new T.BufferGeometry().setIndex(indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  return geo;
}

function sculptHorn(k,head,side,mobile){
  const hilts=[
    [.130,.18,.01,.092,.082],
    [.223,.26,.012,.101,.075],
    [.246,.39,-.024,.095,.063],
    [.281,.51,-.078,.073,.054],
    [.339,.66,-.093,.049,.036],
    [.381,.762,-.141,.029,.020],
    [.416,.833,-.198,.004,.003],
  ];
  const detail=mobile?8:12;
  const breakIndex=side<0?3:4;
  const [x,y,z]=hilts[breakIndex];
  const pivot=[side*x,y,z];
  const rows=hilts.map(([x,y,z,width,depth],row)=>Array.from({length:detail},(_,i)=>{
    const a=tau*i/detail,bulge=1+.08*Math.sin(i*2.4+row*1.31);
    const roughEdge=row===breakIndex?(Math.sin(a*3.1+side)*.022+Math.cos(a*2.)*.018):0;
    return [side*x+Math.cos(a)*width*bulge,y+roughEdge,z+Math.sin(a)*depth*bulge];
  }));
  const heel=k.bone(head,0,0,0);
  heel.name=side<0?'血冠 · 左斷根':'血冠 · 右斷根';
  const tip=k.bone(head,...pivot);
  tip.name=side<0?'血冠 · 左冠尖':'血冠 · 右冠尖';
  const local=point=>point.map((value,index)=>value-pivot[index]);
  const rim=rows[breakIndex];
  k.geometry(heel,'wardenSteel',facet(rows.slice(0,breakIndex+1),detail));
  k.geometry(tip,'wardenSteel',facet(rows.slice(breakIndex).map(row=>row.map(local)),detail));
  k.geometry(heel,'wardenCrownCore',fractureCap(rim,[pivot[0],y-.009,pivot[2]],false));
  k.geometry(tip,'wardenCrownCore',fractureCap(rim.map(local),[0,.008,0],true));
  for(const [colour,indexes,gild] of [['wardenBronze',[1,3],1],['wardenWorn',[0,4],.58],['wardenCrimson',[6,7],.87]]){
    for(const index of indexes){
      const from=rows.map((ring,row)=>{
        const [px,py,pz]=ring[index];
        const [cx,,cz]=hilts[row];
        const raised=1.1;
        return [cx*side+(px-cx*side)*raised,py,cz+(pz-cz)*raised,Math.max(.004,(.021-.0025*row)*gild)];
      });
      k.sculpt.sweep(heel,colour,from.slice(0,breakIndex+1),{sides:5,steps:10,ridge:.14});
      const tail=from.slice(breakIndex).map(([x,y,z,r])=>[x-pivot[0],y-pivot[1],z-pivot[2],r]);
      k.sculpt.sweep(tip,colour,tail,{sides:5,steps:8,ridge:.14});
    }
  }
  return {heel,tip,pivot,side};
}

function crownMetal(k,head){
  const band=k.bone(head,0,0,0);
  band.name='血冠 · 黑鐵冠座';
  const brow=[
    [-.306,.235,-.016],[-.233,.268,.124],[-.146,.294,.187],[-.081,.277,.218],
    [0,.307,.249],[.081,.277,.218],[.146,.294,.187],[.233,.268,.124],[.306,.235,-.016],
    [.232,.160,.161],[.120,.197,.238],[0,.221,.262],[-.120,.197,.238],[-.232,.160,.161],
  ];
  k.sculpt.plate(band,'wardenCrimson',brow,.057,.011);
  k.sculpt.sweep(band,'wardenBronze',brow.slice(0,9).map(([x,y,z])=>[x,y+.009,z+.014,.011]),
    {sides:5,steps:22,ridge:.17});
  k.sculpt.sweep(band,'wardenWorn',brow.slice(9).map(([x,y,z])=>[x,y,z+.014,.008]),
    {sides:5,steps:15,ridge:.17});
  for(const side of sides){
    k.sculpt.sweep(band,'wardenBronze',[
      [side*.27,.233,.105,.020],[side*.28,.229,-.029,.020],
      [side*.218,.219,-.150,.017],[side*.092,.218,-.213,.016],[0,.219,-.217,.013],
    ],{sides:5,steps:12,ridge:.18});
    for(let i=0;i<3;i++){
      const distance=.104+i*.060;
      k.mesh(band,'gem','wardenWorn',side*distance,.24-i*.008,.239-i*.038,.015,.020,.010,0,side*.23);
    }
  }
  const seal=k.bone(head,0,.268,.252);
  seal.name='血冠 · 王印';
  for(const side of sides){
    const wing=k.bone(seal,0,0,0);
    wing.name=side<0?'血冠 · 王印左片':'血冠 · 王印右片';
    const edge=[[0,.141,.003],[.064,.092,.007],[.081,.028,.017],[.054,-.051,.039],
      [0,-.087,.046],[.012,-.035,.039],[-.008,.017,.028],[.013,.068,.018]]
      .map(([x,y,z])=>[side*x,y,z]);
    k.sculpt.plate(wing,'wardenSteel',edge,.036,.008);
    k.sculpt.sweep(wing,'wardenBronze',edge.slice(0,5).map(([x,y,z])=>[x,y,z+.013,.009]),
      {sides:5,steps:9,ridge:.14});
    k.mesh(wing,'gem','wardenCrimson',side*.031,.033,.046,.024,.048,.013,0,side*.15);
  }
  const cleft=k.bone(head,0,.244,.277);
  cleft.name='血冠 · 月蝕裂紋';
  const cracks=[
    [[-.012,.174,-.063,.006],[.010,.113,-.017,.010],[-.019,.056,.007,.012],
      [.013,.002,.024,.010],[-.012,-.041,.027,.008],[.015,-.080,.026,.004]],
    [[.011,.112,-.020,.006],[.052,.091,-.016,.007],[.094,.100,-.043,.003]],
    [[-.013,.043,.007,.006],[-.061,.009,.019,.007],[-.104,.014,.001,.003]],
  ];
  for(const path of cracks)k.sculpt.sweep(cleft,'wardenCrownCore',path,{sides:5,steps:10,ridge:.11});
  return {seal,cleft};
}

function crownSparks(head,mobile){
  const position=[],centers=[],seeds=[],release=[],scales=[];
  const count=mobile?16:26;
  const vertices=[[0,.98,0],[.48,-.28,.39],[-.41,-.55,.31],[-.38,-.44,-.33],[.33,-.52,-.37]];
  const faces=[[0,1,2],[0,2,3],[0,3,4],[0,4,1],[1,4,3],[1,3,2]];
  for(let i=0;i<count;i++){
    const side=i%2===0?-1:1,seed=((i+1)*.61803)%1;
    const source=[side*(.14+seed*.18),.37+seed*.24,.12+(1-seed)*.10];
    for(const face of faces)for(const index of face){
      position.push(...vertices[index]);centers.push(...source);seeds.push(seed);
      release.push(side*(.40+seed*.65),.15+seed*.75,(.34-seed)*.84);
      scales.push(.019+seed*.045);
    }
  }
  const geometry=new T.BufferGeometry()
    .setAttribute('position',new T.Float32BufferAttribute(position,3))
    .setAttribute('center',new T.Float32BufferAttribute(centers,3))
    .setAttribute('launch',new T.Float32BufferAttribute(release,3))
    .setAttribute('seed',new T.Float32BufferAttribute(seeds,1))
    .setAttribute('chipSize',new T.Float32BufferAttribute(scales,1));
  const material=new T.ShaderMaterial({
    uniforms:{progress:{value:0}},transparent:true,depthWrite:false,forceSinglePass:true,
    side:T.DoubleSide,toneMapped:false,
    vertexShader:`
      attribute vec3 center,launch;
      attribute float seed,chipSize;
      uniform float progress;
      varying float life,heat,rim;
      void main(){
        float t=max(0.,progress-.216-seed*.12)*1.84;
        float angle=t*(6.+seed*10.);
        float s=sin(angle),c=cos(angle);
        vec3 p=position*chipSize;
        p.xz=mat2(c,-s,s,c)*p.xz;
        p.xy=mat2(c,-s,s,c)*p.xy;
        p+=center+launch*t+vec3(0.,-1.63*t*t,.31*t*t);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        life=smoothstep(.015,.069,t)*(1.-smoothstep(.61,1.06,t));
        heat=(1.-smoothstep(.04,.53,t))*(.58+seed*.42);
        rim=position.y;
      }`,
    fragmentShader:`
      varying float life,heat,rim;
      void main(){
        if(life<.01)discard;
        vec3 slag=mix(vec3(.14,.087,.23),vec3(.75,.53,.93),smoothstep(-.35,.85,rim)*.58);
        vec3 core=mix(slag,vec3(1.,.76,.58),heat*smoothstep(-.4,.73,rim));
        gl_FragColor=vec4(core,life);
      }`,
  });
  const shards=new T.Mesh(geometry,material);
  shards.name='血冠 · 飛裂冠屑';
  shards.frustumCulled=false;shards.renderOrder=32;
  head.add(shards);
  return shards;
}

export function buildWardenCrown(k,head,mobile){
  const horns=sides.map(side=>sculptHorn(k,head,side,mobile));
  const {seal,cleft}=crownMetal(k,head);
  const shards=crownSparks(head,mobile);
  const core=k.materials.wardenCrownCore;
  return {
    pose(stage,transition,subdued){
      const moving=transition?.phase===2;
      const progress=moving?transition.progress:0;
      const broken=stage===2&&!moving;
      const fracture=broken?1:ease(progress,.19,.47);
      const flare=ease(progress,.07,.24)*(1-ease(progress,.36,.65));
      const spread=subdued?.79:1;
      cleft.visible=broken||progress>.08;
      core.color.copy(moonHeat).lerp(whiteHeat,flare*(subdued?.42:1))
        .multiplyScalar(.56+flare*.50);
      for(const {heel,tip,pivot,side} of horns){
        const t=Math.max(0,progress-(side<0?.23:.30))*1.38;
        heel.rotation.z=-side*.04*fracture;
        tip.position.set(pivot[0]+side*(t*spread*1.37+.04*fracture),
          pivot[1]+t*(.91-t*1.85),pivot[2]+t*(side<0?.27:-.55));
        tip.rotation.set(t*(side<0?2.6:-3.9),side*t*3.16,-side*t*3.43);
        tip.scale.setScalar(1-ease(progress,.73,.88)*.964);
        tip.visible=!broken&&progress<.875;
      }
      seal.visible=!broken&&progress<.86;
      for(const [index,piece] of seal.children.entries()){
        const side=index===0?-1:1,travel=ease(progress,.19+index*.028,.64);
        piece.position.set(side*travel*.31,travel*(.13-.46*travel),travel*.13);
        piece.rotation.set(-travel*.69,side*travel*1.53,side*travel*1.16);
        piece.scale.setScalar(1-ease(progress,.69,.86)*.94);
      }
      shards.visible=moving&&progress>.22&&progress<.90;
      shards.material.uniforms.progress.value=progress;
    },
    dispose(){shards.material.dispose();},
  };
}
