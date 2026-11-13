import * as T from '../three.min.mjs';

const rings=16,sides=7;
const point=new T.Vector3(),tangent=new T.Vector3(),normal=new T.Vector3(),bitangent=new T.Vector3();
const ridge=new T.OctahedronGeometry(1);
const jaw=new T.TorusGeometry(.09,.024,5,8);
const dummy=new T.Object3D(),yAxis=new T.Vector3(0,1,0);

export function createTendril(config) {
  const geometry=new T.BufferGeometry();
  for(const attr of ['position','normal']) {
    geometry.setAttribute(attr,new T.BufferAttribute(new Float32Array((rings+1)*sides*3),3).setUsage(T.DynamicDrawUsage));
  }
  const colors=[],index=[],inside=new T.Color(config.flesh),outside=new T.Color(config.skin),tint=new T.Color();
  for(let row=0;row<=rings;row++) {
    for(let side=0;side<sides;side++) {
      const angle=side/sides*Math.PI*2;
      const wet=Math.max(0,Math.sin(angle))*.64+Math.sin(row*.7)*.05;
      tint.copy(outside).lerp(inside,Math.max(0,wet));
      colors.push(tint.r,tint.g,tint.b);
      if(row===rings) continue;
      const a=row*sides+side,b=row*sides+(side+1)%sides;
      index.push(a,b,a+sides,b,b+sides,a+sides);
    }
  }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.setIndex(index);
  const skin=new T.Mesh(geometry,new T.MeshStandardMaterial({
    vertexColors:true,side:T.DoubleSide,metalness:.15,roughness:.40,
    emissive:config.flesh,emissiveIntensity:.18,
  }));
  skin.frustumCulled=false;
  const plates=new T.InstancedMesh(ridge,new T.MeshStandardMaterial({
    color:config.skin,emissive:config.flesh,emissiveIntensity:.32,roughness:.32,metalness:.16,
  }),5);
  const suckers=new T.InstancedMesh(jaw,new T.MeshBasicMaterial({color:config.flesh}),5);
  plates.frustumCulled=suckers.frustumCulled=false;
  const root=new T.Group();
  root.add(skin,plates,suckers);
  return {root,skin,plates,suckers,curve:new T.CubicBezierCurve3()};
}

export function shapeTendril(art,radius) {
  const {curve,skin,plates,suckers}=art;
  const positions=skin.geometry.attributes.position,normals=skin.geometry.attributes.normal;
  for(let row=0;row<=rings;row++) {
    const t=row/rings;
    curve.getPoint(t,point);
    curve.getTangent(t,tangent);
    normal.set(tangent.z,0,-tangent.x);
    if(normal.lengthSq()<.001) normal.set(1,0,0);
    normal.normalize();
    bitangent.crossVectors(tangent,normal).normalize();
    const thickness=radius*(.035+.965*Math.pow(1-t,.73))*(1+.08*Math.sin(row*1.5));
    for(let side=0;side<sides;side++) {
      const angle=side/sides*Math.PI*2,cos=Math.cos(angle),sin=Math.sin(angle);
      const x=normal.x*cos+bitangent.x*sin,y=normal.y*cos+bitangent.y*sin,z=normal.z*cos+bitangent.z*sin;
      const i=row*sides+side;
      positions.setXYZ(i,point.x+x*thickness,point.y+y*thickness,point.z+z*thickness);
      normals.setXYZ(i,x,y,z);
    }
    if(row>2&&row<13&&row%2===1) {
      const index=(row-3)/2;
      dummy.position.copy(point).addScaledVector(bitangent,-thickness*.83);
      dummy.quaternion.setFromUnitVectors(yAxis,bitangent);
      dummy.scale.set(thickness*.62,thickness*.52,thickness*.73);
      dummy.updateMatrix();
      plates.setMatrixAt(index,dummy.matrix);
      dummy.position.copy(point).addScaledVector(bitangent,thickness*.92);
      dummy.quaternion.setFromUnitVectors(yAxis,bitangent).multiply(rotateSucker);
      dummy.scale.setScalar(thickness*4);
      dummy.updateMatrix();
      suckers.setMatrixAt(index,dummy.matrix);
    }
  }
  positions.needsUpdate=normals.needsUpdate=true;
  plates.instanceMatrix.needsUpdate=suckers.instanceMatrix.needsUpdate=true;
}

const rotateSucker=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2);
