import * as T from '../three.min.mjs';

const point=new T.Vector3(),tangent=new T.Vector3(),normal=new T.Vector3(),bitangent=new T.Vector3();
const ridge=new T.OctahedronGeometry(1);
const jaw=new T.TorusGeometry(.09,.019,6,10);
const pearl=new T.SphereGeometry(1,8,5);
const dummy=new T.Object3D(),yAxis=new T.Vector3(0,1,0);

export function createTendril(config,mobile) {
  const rings=mobile?18:24,sides=mobile?9:12;
  const geometry=new T.BufferGeometry();
  for(const attr of ['position','normal']) {
    geometry.setAttribute(attr,new T.BufferAttribute(new Float32Array((rings+1)*sides*3),3).setUsage(T.DynamicDrawUsage));
  }
  const colors=[],index=[],inside=new T.Color(config.flesh),outside=new T.Color(config.skin),tint=new T.Color();
  for(let row=0;row<=rings;row++) {
    for(let side=0;side<sides;side++) {
      const angle=side/sides*Math.PI*2;
      const wet=Math.max(0,Math.sin(angle))*.59+Math.sin(row*.76+angle*2)*.11+
        Math.sin(angle*3+(row/rings)*12)*.105;
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
    vertexColors:true,side:T.DoubleSide,metalness:.12,roughness:.30,
    emissive:config.flesh,emissiveIntensity:.18,
  }));
  skin.frustumCulled=false;
  const count=mobile?5:7;
  const plates=new T.InstancedMesh(ridge,new T.MeshStandardMaterial({
    color:config.skin,emissive:config.flesh,emissiveIntensity:.32,roughness:.32,metalness:.16,
  }),count);
  const suckers=new T.InstancedMesh(jaw,new T.MeshStandardMaterial({
    color:config.flesh,roughness:.27,metalness:.16,emissive:config.flesh,emissiveIntensity:.25,
  }),count*2);
  const pits=new T.InstancedMesh(pearl,new T.MeshStandardMaterial({
    color:config.skin,roughness:.38,emissive:config.flesh,emissiveIntensity:.12,
  }),count*2);
  for(const mesh of [plates,suckers,pits]){
    mesh.frustumCulled=false;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  }
  const root=new T.Group();
  root.add(skin,plates,suckers,pits);
  return {root,skin,plates,suckers,pits,rings,sides,count,curve:new T.CubicBezierCurve3()};
}

export function shapeTendril(art,radius) {
  const {curve,skin,plates,suckers,pits,rings,sides,count}=art;
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
      const angle=side/sides*Math.PI*2+Math.sin(t*5)*.36,cos=Math.cos(angle),sin=Math.sin(angle);
      const x=normal.x*cos+bitangent.x*sin,y=normal.y*cos+bitangent.y*sin,z=normal.z*cos+bitangent.z*sin;
      const channel=thickness*(1+.11*Math.cos(angle*3+t*10)+.06*Math.sin(t*55-angle*3));
      const i=row*sides+side;
      positions.setXYZ(i,point.x+x*channel,point.y+y*channel,point.z+z*channel);
      normals.setXYZ(i,x,y,z);
    }
    if(row>=3&&row<3+count*2&&row%2===1) {
      const index=(row-3)/2,shift=index%2?.37:-.33;
      dummy.position.copy(point).addScaledVector(bitangent,-thickness*.83);
      dummy.quaternion.setFromUnitVectors(yAxis,bitangent);
      dummy.scale.set(thickness*.63,thickness*.43,thickness*1.02);
      dummy.updateMatrix();
      plates.setMatrixAt(index,dummy.matrix);
      for(const side of [-1,1]){
        const i=index*2+(side>0?1:0);
        dummy.position.copy(point).addScaledVector(bitangent,thickness*.92).addScaledVector(normal,side*thickness*.34)
          .addScaledVector(tangent,shift*side*thickness);
        dummy.quaternion.setFromUnitVectors(yAxis,bitangent).multiply(rotateSucker);
        dummy.scale.set(thickness*2.9,thickness*2.4,thickness*1.35);
        dummy.updateMatrix();
        suckers.setMatrixAt(i,dummy.matrix);
        dummy.position.addScaledVector(bitangent,-thickness*.017);
        dummy.scale.set(thickness*.148,thickness*.127,thickness*.043);
        dummy.updateMatrix();
        pits.setMatrixAt(i,dummy.matrix);
      }
    }
  }
  positions.needsUpdate=normals.needsUpdate=true;
  plates.instanceMatrix.needsUpdate=suckers.instanceMatrix.needsUpdate=pits.instanceMatrix.needsUpdate=true;
}

const rotateSucker=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2);
