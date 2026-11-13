import * as T from '../three.min.mjs';

const SCALE=.1;

export function forgedSurface(outline,depth,bevel,camber,finish){
  const contour=[];
  for(let i=0;i<outline.length;i+=2)contour.push(new T.Vector2(outline[i],outline[i+1]));
  const triangles=T.ShapeUtils.triangulateShape(contour.slice(),[]);
  const position=[],uv=[],materialColor=[];
  function distance(p){
    let nearest=Infinity;
    for(let i=0;i<contour.length;i++){
      const a=contour[i],b=contour[(i+1)%contour.length];
      const dx=b.x-a.x,dy=b.y-a.y;
      const t=T.MathUtils.clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/Math.max(.000001,dx*dx+dy*dy),0,1);
      nearest=Math.min(nearest,(p.x-a.x-dx*t)**2+(p.y-a.y-dy*t)**2);
    }
    return Math.sqrt(nearest);
  }
  function put(p,side,margin){
    const height=depth*.31+bevel*.30+Math.min(1,margin/(bevel*2.4+.30))*depth*.20;
    const shoulder=1-Math.exp(-margin*1.15);
    position.push(p.x*SCALE,p.y*SCALE,
      (side*(height+camber*shoulder)+Math.sin(p.y*.29)*camber*.16*shoulder)*SCALE);
    uv.push(p.x*.128,p.y*.116);
    const grain=.94+.071*Math.sin(p.x*4.9+p.y*.51)*Math.cos(p.y*1.7);
    const sharpened=finish==='edge'?1+(1-Math.min(1,margin*.54))*.19:1;
    materialColor.push(grain*sharpened,grain*sharpened,grain*sharpened);
  }
  function surface(a,b,c,side,levels){
    if(!levels){
      for(const p of [a,b,c])put(p,side,distance(p));
      return;
    }
    const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
    surface(a,ab,ca,side,levels-1);surface(ab,b,bc,side,levels-1);
    surface(ca,bc,c,side,levels-1);surface(ab,bc,ca,side,levels-1);
  }
  for(const [a,b,c] of triangles){
    const side=T.Triangle.getNormal(
      new T.Vector3(contour[a].x,contour[a].y,0),
      new T.Vector3(contour[b].x,contour[b].y,0),
      new T.Vector3(contour[c].x,contour[c].y,0),new T.Vector3()).z;
    const order=side<0?[a,c,b]:[a,b,c];
    for(const flip of [1,-1]){
      const [i,j,k]=flip>0?order:[order[0],order[2],order[1]];
      const from=contour[i],to=contour[j],tip=contour[k];
      const center=from.clone().add(to).add(tip).multiplyScalar(1/3);
      surface(from,to,center,flip,2);
      surface(to,tip,center,flip,2);
      surface(tip,from,center,flip,2);
    }
  }
  const clockwise=T.ShapeUtils.isClockWise(contour);
  for(let i=0;i<contour.length;i++){
    const first=contour[i],second=contour[(i+1)%contour.length];
    for(let step=0;step<4;step++){
      const a=first.clone().lerp(second,step/4),b=first.clone().lerp(second,(step+1)/4);
      const [l,r]=clockwise?[b,a]:[a,b];
      for(const [p,side] of [[l,1],[l,-1],[r,1],[r,1],[l,-1],[r,-1]])put(p,side,0);
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(materialColor,3));
  geometry.computeVertexNormals();
  // Smooth the raised faces as one forged surface, while retaining the rim crease.
  const normals=geometry.attributes.normal;
  const shared=new Map(),normal=new T.Vector3();
  for(let i=0;i<normals.count;i++){
    normal.fromBufferAttribute(normals,i);
    if(Math.abs(normal.z)<.14)continue;
    const key=position.slice(i*3,i*3+3).map(value=>Math.round(value*100000)).join(',');
    let group=shared.get(key);
    if(!group)shared.set(key,group={direction:new T.Vector3(),indices:[]});
    group.direction.add(normal);
    group.indices.push(i);
  }
  for(const {direction,indices} of shared.values()){
    direction.normalize();
    for(const index of indices)normals.setXYZ(index,direction.x,direction.y,direction.z);
  }
  return geometry;
}
