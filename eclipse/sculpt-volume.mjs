import * as T from '../three.min.mjs';

const TAU=Math.PI*2;

// A closed sweep whose first local axis controls the width of a cross section.
// Lengthwise profiles keep broad anatomy and small changes in curvature in the same mesh.
export function sculptVolume(sections,{axis='y',sides=16,rings=24,section=2,ridge=.06,seed=0,fur=false}={}){
  const curve=new T.CatmullRomCurve3(sections.map(([x,y,z])=>new T.Vector3(x,y,z)),false,'catmullrom',.43);
  const radial=new T.CatmullRomCurve3(sections.map(([, , ,x,z])=>new T.Vector3(x,z,0)),false,'catmullrom',.36);
  const frame=curve.computeFrenetFrames(rings,false);
  const position=[],uv=[],colors=[],indices=[];
  const initialNormal=new T.Vector3(axis==='x'?0:1,axis==='x'?1:0,0);
  const twist=frame.normals[0].angleTo(initialNormal)*(frame.binormals[0].dot(initialNormal)<0?-1:1);
  for(let ring=0;ring<=rings;ring++){
    const t=ring/rings;
    const center=curve.getPointAt(t),width=radial.getPoint(curve.getUtoTmapping(t));
    for(let i=0;i<=sides;i++){
      const a=(i/sides)*TAU+twist;
      const round=value=>Math.sign(value)*Math.pow(Math.abs(value),2/section);
      const fold=Math.cos(a*3+seed+t*.84)*.57+Math.cos(a*7+seed-t*5.7)*.28+Math.cos(a*11+t*13.4)*.15;
      const tuft=fur?Math.sin(a*13+t*.9+seed)*.57+Math.sin(a*17+t*2.8)*.23:0;
      const score=1+ridge*fold+tuft*.066;
      const nx=round(Math.cos(a))*Math.max(.002,width.x)*score;
      const nz=round(Math.sin(a))*Math.max(.002,width.y)*score;
      const point=center.clone().addScaledVector(frame.normals[ring],nx).addScaledVector(frame.binormals[ring],nz);
      position.push(point.x,point.y,point.z);uv.push(i/sides,t);
      const shade=.81+fold*.097+.085*Math.sin(t*Math.PI)+.09*Math.max(.0,Math.cos(a))+tuft*.098;
      colors.push(shade,shade,shade);
      if(ring<rings&&i<sides){
        const a=ring*(sides+1)+i,b=a+sides+1;
        indices.push(a,a+1,b,b,a+1,b+1);
      }
    }
  }
  const first=position.length/3;
  position.push(...curve.getPoint(0).toArray(),...curve.getPoint(1).toArray());
  colors.push(.79,.79,.79,.79,.79,.79);uv.push(.5,0,.5,1);
  for(let i=0;i<sides;i++){
    const a=rings*(sides+1)+i;
    indices.push(first,i+1,i,first+1,a,a+1);
  }
  const geo=new T.BufferGeometry().setIndex(indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const normals=geo.attributes.normal,normal=new T.Vector3(),other=new T.Vector3();
  for(let i=0;i<=rings;i++){
    const a=i*(sides+1),b=a+sides;
    normal.fromBufferAttribute(normals,a).add(other.fromBufferAttribute(normals,b)).normalize();
    normals.setXYZ(a,normal.x,normal.y,normal.z);normals.setXYZ(b,normal.x,normal.y,normal.z);
  }
  return geo;
}

// A feather has a curved rachis, asymmetric vanes, frayed margins and thickness on
// its underside. Coordinates run from root to tip, with a ridge normal to the vane.
export function featherVane(start,arch,tip,width,seed,sections=12){
  const curve=new T.CatmullRomCurve3([start,arch,tip].map(point=>new T.Vector3(...point)));
  const normal=new T.Vector3(0,0,1);
  const position=[],uv=[],colors=[],indices=[];
  const ribs=[-1,-.53,-.05,0,.50,1];
  const row=ribs.length,sideStride=(sections+1)*row;
  for(const [sideIndex,face] of [1,-1].entries())for(let i=0;i<=sections;i++){
    const u=i/sections,center=curve.getPoint(u),tangent=curve.getTangent(u);
    const across=normal.clone().cross(tangent).normalize();
    for(const [j,rib] of ribs.entries()){
      const barb=Math.sin(i*2.8+j*.64+seed);
      const edge=Math.pow(Math.abs(rib),2);
      const span=width*(.023+Math.sin(Math.PI*u)**.84)*(1-u*.39);
      const nick=1-Math.max(0,barb)*.15*edge;
      const spine=.052*Math.exp(-rib*rib*18)*(1-u*.59);
      const point=center.clone().addScaledVector(across,rib*span*nick*(rib<0?.77:1));
      point.addScaledVector(tangent,-Math.abs(rib)*span*.32);
      point.z+=face*(.004+spine)+rib*rib*Math.sin(u*4+seed)*.026;
      position.push(...point.toArray());uv.push((rib+1)*.5,u);
      const tint=(face>0?.78:.53)+u*.17+spine*2.5+barb*edge*.088;
      colors.push(tint,tint*.93,tint*.86);
      if(i===sections||j===row-1)continue;
      const a=sideIndex*sideStride+i*row+j,b=a+row;
      if(face>0)indices.push(a,b,a+1,b,b+1,a+1);
      else indices.push(a,a+1,b,b,a+1,b+1);
    }
  }
  for(let i=0;i<sections;i++)for(const j of [0,row-1]){
    const a=i*row+j,b=a+row;
    if(j===0)indices.push(a,b,a+sideStride,b,b+sideStride,a+sideStride);
    else indices.push(a,a+sideStride,b,b,a+sideStride,b+sideStride);
  }
  const geo=new T.BufferGeometry().setIndex(indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  return geo;
}

export function wingWeb(segments,side,seed){
  const position=[],uv=[],color=[],indices=[];
  const divisions=10,span=12;
  const paths=segments.map(points=>new T.CatmullRomCurve3(points.map(point=>new T.Vector3(...point))));
  const seams=paths.length-1;
  for(let panel=0;panel<seams;panel++){
    const first=paths[panel],next=paths[panel+1],base=position.length/3;
    for(let i=0;i<=divisions;i++)for(let j=0;j<=span;j++){
      const u=i/divisions,v=j/span;
      const a=first.getPoint(Math.max(.024,u)),b=next.getPoint(Math.max(.033,u));
      const p=a.clone().lerp(b,v);
      const pocket=Math.sin(v*Math.PI);
      const fold=pocket*Math.cos(v*15.3+u*8.3+panel)*u;
      const rag=Math.max(0,Math.sin(j*1.99+panel*2.7+seed))**3;
      p.x-=(.08+rag*.09)*u**6*pocket;
      p.y+=pocket*u**5*(.29-.35*rag)+fold*.032;
      p.z-=pocket*u*(.15+.036*fold);
      position.push(side*p.x,p.y,p.z);
      uv.push((panel+v)/seams,u);
      const stain=.75+fold*.22+(u**11)*(.21+rag*.07)-.14*pocket;
      color.push(stain,stain*.96,stain*.95);
      if(i===divisions||j===span)continue;
      const from=base+i*(span+1)+j,to=from+span+1;
      if(side>0)indices.push(from,to,from+1,to,to+1,from+1);
      else indices.push(from,from+1,to,to,from+1,to+1);
    }
  }
  const geo=new T.BufferGeometry().setIndex(indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geo.computeVertexNormals();
  return geo;
}
