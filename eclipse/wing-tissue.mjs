import * as T from '../three.min.mjs';

// Ray and membrane geometry share the same anchors so the skin keeps contact as
// a wing closes. A narrow fold along each ray catches a clean edge light.
export function wingTissue(kit,wing,side,outlines,mobile){
  const base=new T.Bone(),bones=[base],fingers=[];
  wing.add(base);
  const curves=outlines.map(path=>new T.CatmullRomCurve3(path.map(p=>new T.Vector3(...p))));
  for(const [i,curve] of curves.entries()){
    const palm=new T.Bone(),knuckle=new T.Bone();
    const start=curve.getPoint(0),joint=curve.getPoint(.46);
    palm.name='Wing ray '+(i+1);
    knuckle.name='Wing ray hinge '+(i+1);
    palm.position.copy(start);knuckle.position.copy(joint).sub(start);
    base.add(palm);palm.add(knuckle);
    bones.push(palm,knuckle);
    fingers.push({palm,knuckle});
    for(const [part,from,to,origin,diameters] of [
      [palm,0,.49,start,[.052,.045,.035,.027]],
      [knuckle,.45,1,joint,[.031,.024,.017,.003]],
    ]){
      const path=diameters.map((w,n)=>[...curve.getPoint(from+(to-from)*n/3).sub(origin).toArray(),w,w*.69]);
      kit.sculpt.sweep(part,'venomWingBone',path,{steps:mobile?8:12,sides:mobile?6:8,ridge:.21});
      const edge=path.map(([x,y,z,w],n)=>[x,y+w*.59,z+.016,[.017,.013,.009,.002][n]]);
      kit.sculpt.sweep(part,'venomWingGold',edge,{steps:8,sides:5,ridge:.16});
    }
  }
  const skin=kit.materials.wingHide;
  skin.side=T.DoubleSide;
  const position=[],uv=[],tints=[],indices=[],joints=[],weights=[];
  const segments=mobile?12:18,columns=mobile?7:11;
  for(let panel=0;panel<curves.length-1;panel++){
    const left=curves[panel],right=curves[panel+1];
    const vertexStart=position.length/3;
    for(let row=0;row<=segments;row++){
      const t=row/segments;
      const bend=T.MathUtils.smoothstep(t,.22,.73);
      const nearLeft=left.getPoint(t),nearRight=right.getPoint(t);
      for(let col=0;col<columns;col++){
        const u=col/(columns-1),sin=Math.sin(Math.PI*u);
        const edgeWeight=T.MathUtils.smoothstep(u,0,1);
        const edgeTear=(.17+.022*panel)*t**8*sin*(1+.39*Math.sin(u*35+panel*2.9));
        const ridge=.028*Math.sin(t*9.4+panel)*Math.max(0,Math.cos(u*8.7-t*12.1+panel))**3;
        const ripple=sin*Math.sin(Math.PI*t)*(.125+.035*Math.sin(u*19+t*18+panel)+ridge);
        const p=nearLeft.clone().lerp(nearRight,u);
        p.x-=side*edgeTear*.62;p.y-=edgeTear*1.4;p.z-=ripple+edgeTear*.43;
        position.push(...p.toArray());uv.push(u*.8+t*.14,t*.91);
        const lean=.70-.11*Math.cos(u*Math.PI*2);
        const veins=.19*Math.exp(-Math.abs(u-.48+.10*Math.sin(t*12+panel))*31);
        const branches=.12*Math.pow(.5+.5*Math.sin(u*27+t*25+panel*2.8),8);
        const mottling=.1*Math.sin(u*30+t*15+panel)*Math.cos(t*23-u*19);
        const weathering=lean+veins+branches+mottling+.14*t**8*sin;
        tints.push(weathering*.93,weathering*.966,weathering);
        joints.push(1+panel*2,2+panel*2,3+panel*2,4+panel*2);
        weights.push((1-edgeWeight)*(1-bend),(1-edgeWeight)*bend,edgeWeight*(1-bend),edgeWeight*bend);
        const torn=panel%2===1&&t>.84&&u>.39&&u<.66;
        if(row===segments||col===columns-1||torn)continue;
        const a=vertexStart+row*columns+col,b=a+columns;
        if(side>0)indices.push(a,a+1,b,a+1,b+1,b);
        else indices.push(a,b,a+1,a+1,b,b+1);
      }
    }
  }
  const mesh=new T.SkinnedMesh(new T.BufferGeometry(),skin);
  mesh.name='毒龍 · 翼膜';
  mesh.frustumCulled=false;
  mesh.geometry.setIndex(indices);
  mesh.geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  mesh.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  mesh.geometry.setAttribute('color',new T.Float32BufferAttribute(tints,3));
  mesh.geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
  mesh.geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  mesh.geometry.computeVertexNormals();
  wing.add(mesh);
  wing.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(bones);
  mesh.bind(skeleton,mesh.matrixWorld);
  return {
    pose(time,wind,strike,travel){
      for(const [i,{palm,knuckle}] of fingers.entries()){
        const delay=i*.31;
        palm.rotation.z=side*(Math.sin(time*6.9-delay)*(.046+travel*.027)+wind*.055-strike*.073)*i/4;
        knuckle.rotation.x=Math.cos(time*6.9-delay)*(.11+travel*.025)-wind*.14+strike*.21;
        knuckle.rotation.z=side*(Math.sin(time*6.9-delay-.5)*.12+strike*.093)*i/4;
      }
    },
    dispose(){skeleton.dispose();},
  };
}
