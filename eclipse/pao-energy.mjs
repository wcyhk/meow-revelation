import * as T from '../three.min.mjs';

const sourcePoint=new T.Vector3();
const angleStep=2.39996323;

export function paoEnergy(root,sources,mobile){
  const perSource=mobile?8:15;
  const count=sources.length*perSource;
  const position=new Float32Array(count*3),opacity=new Float32Array(count),size=new Float32Array(count);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.BufferAttribute(position,3).setUsage(T.DynamicDrawUsage));
  geometry.setAttribute('opacity',new T.BufferAttribute(opacity,1).setUsage(T.DynamicDrawUsage));
  geometry.setAttribute('size',new T.BufferAttribute(size,1).setUsage(T.DynamicDrawUsage));
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`attribute float opacity,size;
      varying float energy;
      void main(){
        vec4 p=modelViewMatrix*vec4(position,1.0);
        energy=opacity;
        gl_PointSize=size;
        gl_Position=projectionMatrix*p;
      }`,
    fragmentShader:`varying float energy;
      void main(){
        vec2 p=gl_PointCoord*2.0-1.0;
        float distanceFromCenter=dot(p,p);
        float halo=exp(-distanceFromCenter*4.8)*.43;
        float core=exp(-distanceFromCenter*23.0);
        float edge=1.0-smoothstep(.44,1.0,distanceFromCenter);
        gl_FragColor=vec4(mix(vec3(.028,.62,.46),vec3(.77,.99,.84),core),
          edge*(halo+core*.59)*energy);
        #include <colorspace_fragment>
      }`,
  });
  const cloud=new T.Points(geometry,material);
  cloud.frustumCulled=false;
  cloud.renderOrder=34;
  root.add(cloud);
  const inverses=new T.Matrix4();
  const scale=mobile?1:1.32;
  return {
    count,
    update(time,cast,travel,fall,landing){
      root.updateWorldMatrix(true,false);
      inverses.copy(root.matrixWorld).invert();
      for(const [source,emitter] of sources.entries()){
        const wing=source>=2;
        emitter.getWorldPosition(sourcePoint).applyMatrix4(inverses);
        for(let sample=0;sample<perSource;sample++){
          const index=source*perSource+sample;
          const phase=(time*(wing?.57:.84)+sample/perSource+source*.31)%1;
          const angle=sample*angleStep+phase*2.71+source*.63;
          const burst=wing?.29+travel*.25:.28+cast*.59+landing*.26;
          const spread=phase*burst+.068;
          const offset=index*3;
          position[offset]=sourcePoint.x+Math.cos(angle)*spread;
          position[offset+1]=sourcePoint.y+phase*(wing?.45:.70+cast*.33)+Math.sin(angle)*spread*.47;
          position[offset+2]=sourcePoint.z+Math.sin(angle)*spread-travel*phase*.29;
          opacity[index]=Math.sin(phase*Math.PI)**1.08*(wing?.65+travel*.23:.75+cast*.25)*(1-fall*.96);
          size[index]=scale*(3.3+(index%5)*.84+cast*2.11)*(1-phase*.50);
        }
      }
      for(const attribute of Object.values(geometry.attributes))attribute.needsUpdate=true;
    },
    dispose(){
      geometry.dispose();
      material.dispose();
    },
  };
}
