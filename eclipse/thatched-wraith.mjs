import * as T from '../three.min.mjs';
import {sculptVolume} from './sculpt-volume.mjs?v=sculpted-1';

const tau=Math.PI*2;
const sides=[-1,1];
export const thatchedWraithFinishes={
  thatchNight:[0x32292d,.05,.88,'hide'],thatchAsh:[0x56382e,.08,.90,'hide'],
  thatchHusk:[0x876147,.026,.96,'hide'],thatchStem:[0xc7a672,.006,.97,'cloth'],
  thatchRope:[0xcebaa4,.025,.92,'cloth'],
  thatchCinder:[0xa04d2f,.22,.72,'bronze'],thatchIndigo:[0x454769,.13,.84,'cloth'],
  thatchSclera:[0x6b464c,.14,.65,'hide'],thatchIris:[0xcc522e,.16,.63,'hide'],
};

function tooling(k,mobile){
  return {
    cast:(joint,mat,sections,seed=0)=>k.geometry(joint,mat,sculptVolume(sections,{
      sides:mobile?12:18,rings:mobile?14:22,section:2.42,ridge:.19,seed,
    })),
    trim:(joint,mat,path,steps=10)=>k.sculpt.sweep(joint,mat,path,{steps,sides:6,ridge:.30}),
    plate:(joint,mat,shape,t=.034)=>k.sculpt.plate(joint,mat,shape,t,.014),
  };
}

function lash(k,g,parent,radius,oval,cordY,opening,mobile){
  const {trim}=g,count=mobile?36:58;
  const limit=opening?Math.PI-opening:Math.PI;
  for(const side of sides){
    for(let strand=0;strand<3;strand++){
      const path=[];
      for(let i=0;i<=count/2;i++){
        const theta=side*(Math.PI-limit*i/(count/2));
        const pitch=theta*22+strand*tau/3;
        const drift=Math.cos(pitch)*.020;
        path.push([Math.sin(theta)*(radius+drift),cordY+Math.sin(pitch)*.024,
          Math.cos(theta)*(radius+drift)*oval,.015+strand*.001]);
      }
      trim(parent,strand===2?'thatchStem':'thatchRope',path,mobile?23:44);
    }
    if(!opening)continue;
    const x=side*Math.sin(opening)*radius,z=Math.cos(opening)*(radius*oval);
    trim(parent,'thatchRope',[[x,cordY+.021,z-.004,.030],[x+side*.051,cordY+.012,z+.018,.036],
      [x+side*.074,cordY-.049,z+.023,.034],[x+side*.016,cordY-.070,z+.032,.012]],13);
  }
}

function bundleGeometry(tier,sector,count,trunk,extent,length,opening,oval,mobile){
  const positions=[],colors=[],uvs=[],indices=[];
  const stemCount=(mobile?9:12)+Math.floor(tier*.5);
  const angle=sector*tau/count;
  const cosine=Math.cos(angle),sine=Math.sin(angle);
  const tierWidth=tau/count;

  function appendReed(offset,variation,drop,radius,root=.0){
    const strandAngle=angle+offset;
    if(opening&&Math.abs(Math.atan2(Math.sin(strandAngle),Math.cos(strandAngle)))<opening)return;
    const start=positions.length/3;
    const divisions=root>0?(mobile?3:5):(mobile?5:7);
    const facets=root>0?(mobile?3:4):(mobile?5:6);
    const wave=Math.sin(variation*2.27),curl=Math.cos(variation*1.64);
    const twist=Math.sin(variation*.71),tone=.42+.31*Math.pow(.5+.5*Math.cos(variation*3.73),1.12);
    for(let row=0;row<=divisions;row++){
      const t=root+(1-root)*row/divisions;
      const drift=offset+wave*.093*t+twist*.052*Math.sin(Math.PI*t)+Math.max(0,t-.66)*curl*.13;
      const stemRadius=trunk+(extent-trunk)*(t*.67+Math.pow(t,.64)*.47)*(1+wave*.161);
      const x=Math.sin(angle+drift)*stemRadius-Math.sin(angle)*trunk;
      const z=(Math.cos(angle+drift)*stemRadius-Math.cos(angle)*trunk)*oval;
      const y=.045-length*drop*t+curl*.028*Math.sin(t*4.3)+t*t*.034*twist;
      const width=radius*(1-.52*t)*Math.max(.045,Math.min(1,(1-t)*7));
      for(let face=0;face<facets;face++){
        const theta=face*tau/facets+t*.64*twist;
        positions.push(x*cosine-z*sine+Math.sin(theta)*width,y+.32*Math.cos(theta)*width,
          x*sine+z*cosine+Math.cos(theta)*width*.61);
        uvs.push((offset/tierWidth)+.5+t*.068, t);
        const fiber=.82+.17*Math.cos(theta*2+variation)+.15*t-.10*Math.cos(t*12.5+variation);
        const brightness=tone*fiber;
        colors.push(brightness*1.12,brightness*.94,brightness*(.67+.24*twist*twist));
        if(row<divisions){
          const a=start+row*facets+face,b=start+row*facets+(face+1)%facets;
          indices.push(a,a+facets,b,b,a+facets,b+facets);
        }
      }
    }
    const end=start+divisions*facets;
    for(let i=1;i<facets-1;i++)indices.push(end,end+i+1,end+i);
  }

  for(let i=0;i<stemCount;i++){
    const variation=i*1.71+sector*11.123+tier*19.317;
    const offset=(i/(stemCount-1)-.5)*tierWidth+tierWidth*.07*Math.sin(variation);
    const drop=.77+.43*(.5+.5*Math.sin(variation*1.561));
    const radius=.013+.014*(.5+.5*Math.cos(variation*1.21))+tier*.0017;
    appendReed(offset,variation,drop,radius);
    if(i%3===1)appendReed(offset+.036,variation+.45,drop*1.12,radius*.44,.52);
    if(i%4===0)appendReed(offset-.045,variation+2.7,drop*.81,radius*.68,.17);
  }
  if(!positions.length)return null;
  const geometry=new T.BufferGeometry().setIndex(indices);
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geometry.computeVertexNormals();
  return geometry;
}

function weave(k,g,body,mobile){
  const {cast,plate,trim}=g;
  const skirts=[];
  const racks=[
    [.83,.18,.34,.32,0,.81],[.56,.29,.49,.36,0,.83],[.232,.395,.61,.38,.30,.86],
    [-.025,.493,.72,.36,.43,.87],[-.272,.592,.83,.39,.38,.87],[-.501,.70,.95,.45,.25,.84],
  ];
  cast(body,'thatchNight',[[0,-.835,-.04,.558,.403],[0,-.702,-.049,.635,.489],[0,-.34,-.077,.504,.41],
    [0,.046,-.091,.451,.35],[0,.44,-.103,.335,.261],[0,.74,-.049,.216,.179],[0,.997,-.015,.070,.078]],16);
  for(const [j,[height,trunk,extent,length,opening,oval]] of racks.entries()){
    const tier=k.bone(body,0,height,-.025);
    tier.name='未寄郵庭・背函拾骨 · 扎草層 '+(j+1);
    const count=mobile?6:9;
    for(let i=0;i<count;i++){
      const sector=i+.15*Math.sin(j*2.3),a=sector*tau/count;
      const geometry=bundleGeometry(j,sector,count,trunk,extent,length,opening,oval,mobile);
      if(!geometry)continue;
      const pivot=k.bone(tier,Math.sin(a)*trunk,0,Math.cos(a)*trunk*oval);
      pivot.name='未寄郵庭・背函拾骨 · 草束 '+(j+1)+' '+(i+1);
      pivot.rotation.y=a;
      k.geometry(pivot,'thatchStem',geometry);
      skirts.push({pivot,angle:a,j,i});
    }
    const cordRadius=trunk+(extent-trunk)*.64;
    lash(k,g,tier,cordRadius,oval,-.131,opening,mobile);
    if(j===3||j===4){
      for(let i=0;i<12;i++){
        const a=i*tau/12+.285;
        if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<opening)continue;
        const pivot=k.bone(tier,Math.sin(a)*cordRadius,-.147,Math.cos(a)*cordRadius*oval);
        pivot.rotation.y=a;
        const c=i%3===0?'thatchCinder':'thatchIndigo';
        plate(pivot,c,[[-.025,.066,-.011],[.023,.069,-.012],[.037,-.061,.033],
          [.022,-.218,.044],[-.027,-.197,.041],[-.039,-.041,.021]],.025);
        trim(pivot,'thatchRope',[[.003,.049,.017,.017],[.002,.001,.027,.017],
          [-.008,-.090,.052,.008]]);
      }
    }
  }
  return skirts;
}

function hauntedFace(k,g,body,mobile){
  const {cast,trim,plate}=g,head=k.bone(body,0,.041,.286),eyes=[];
  head.name='未寄郵庭・背函拾骨 · 三眼藏面';
  plate(head,'thatchNight',[[-.151,.381,-.046],[.165,.345,-.038],[.261,-.04,-.012],
    [.258,-.392,.024],[.07,-.468,.050],[-.238,-.423,.025],[-.269,-.025,-.005]],.075);
  for(const [i,[x,y,z,s,t]] of [[0,.245,.125,.112,-.14],[-.132,-.057,.155,.115,.34],
    [.131,-.192,.148,.133,-.25]].entries()){
    const iris=k.bone(head,x,y,z);
    iris.rotation.z=t;
    cast(iris,'thatchSclera',[[0,-s*.56,.005,s*.43,.041],[0,-s*.28,.031,s*.90,.052],
      [0,.006,.040,s*1.11,.081],[0,s*.36,.030,s*.84,.054],[0,s*.53,.012,s*.42,.033]],11+i);
    k.mesh(iris,'round','thatchIris',0,0,.102,s*.56,s*.58,.022);
    k.mesh(iris,'round','thatchNight',.006,.005,.134,s*.14,s*.44,.010,0,0,-.11);
    for(const side of sides){
      const h=.68*s*side;
      trim(iris,side>0?'thatchAsh':'thatchNight',[[-s*1.12,0,.041,.005],[-s*.57,h,.076,.019],
        [0,h*.9,.097,.022],[s*.59,h*.63,.075,.017],[s*1.14,-h*.22,.049,.004]],12);
    }
    eyes.push(iris);
  }
  for(const side of sides)for(let i=0;i<(mobile?5:8);i++){
    const x=side*(.157+i*.029),y=.364-i*.062,z=.106+i*.009;
    trim(head,i%2?'thatchHusk':'thatchAsh',[[x*.73,y+.128,z-.051,.031],[x,y+.012,z,.048],
      [x*1.20,y-.218,z+.036,.043],[x*1.32,y-.389,z+.068,.006]],11);
  }
  return {head,eyes};
}

export function carveThatchedWraith(k,entry,mobile){
  const g=tooling(k,mobile),body=k.bone(k.root,0,1.144,0);
  k.materials.thatchIris.emissive.setHex(0xfb371b);
  k.materials.thatchIris.emissiveIntensity=.91;
  const skirts=weave(k,g,body,mobile),{head,eyes}=hauntedFace(k,g,body,mobile);
  return {
    body,head,inspectionHead:head,crest:k.bone(body,0,0,0),
    catalogueSculpt:entry.id,sourceSculpt:true,pattern:'hover',
    polishEnergy:{tint:0xe78357,shape:'bolts',anchor:body,offset:[0,-.19,.12],span:[.83,.77,.71]},
    sourceDress(skin){
      for(const side of sides)for(let i=0;i<6;i++){
        const a=(.53+i*.45)*side,z=Math.cos(a)*.561,x=Math.sin(a)*.672;
        const color=i%3===0?0x9f4a2c:i%3===1?0x454368:0x95704d;
        skin.silk(body,'未寄郵庭・背函拾骨 · 打結長繩',[[x,-.224+i*.017,z,.029],
          [x*1.046,-.357+i*.019,z*1.13,.039],[x*1.17,-.523+i*.020,z*1.20,.036],
          [x*1.22,-.627+i*.017,z*1.27,.010]],{style:'woven',tint:color,trim:0xad8059,
          lining:0x513b37,flex:1.46,phase:a*1.61,across:[Math.cos(a),0,-Math.sin(a)]});
      }
      return true;
    },
    cataloguePose({beat,wind,strike,travel,fall,stage,attackPattern}){
      const draw=attackPattern==='gravity'?1.22:.81;
      const sway=Math.sin(beat*.67);
      head.rotation.set(-wind*.19+strike*.28,sway*.072+wind*.15-strike*.18,sway*.061);
      for(const [i,eye] of eyes.entries()){
        eye.scale.x=1+wind*.10+strike*.16;
        eye.scale.y=.94+Math.sin(beat*.55+i*.802)*.053+wind*.24+strike*.18;
      }
      for(const {pivot,angle,j,i} of skirts){
        const ripple=Math.sin(beat*(.62+j*.07)-angle*2.9+i*.26);
        const flex=1-Math.pow(1-j/6,2.1);
        pivot.rotation.x=flex*(ripple*.12+travel*.16-wind*.21+strike*draw*.59+fall*.23);
        pivot.rotation.z=flex*(ripple*.093+stage*.061+Math.cos(angle)*strike*.13);
      }
    },
  };
}
