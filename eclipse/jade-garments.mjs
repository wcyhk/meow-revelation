import * as T from '../three.min.mjs';

const sides=[-1,1];

// Each strip is drawn in body space. The same skeleton drives its shell and hem.
function silkGeometry(path,first,rows,columns,seed){
  const position=[],uv=[],color=[],joints=[],weights=[],index=[];
  for(let row=0;row<=rows;row++){
    const t=row/rows;
    const segment=Math.min(path.length-2,Math.floor(t*(path.length-1)));
    const blend=t*(path.length-1)-segment;
    const [x,y,z,width]=path[segment].map((value,i)=>T.MathUtils.lerp(value,path[segment+1][i],blend));
    const weight=blend*blend*(3-2*blend);
    for(let col=0;col<=columns;col++){
      const u=col/columns,v=u*2-1;
      const pleat=Math.cos(v*10+seed+t*2)*.030+Math.cos(v*21-seed)*.013;
      const tear=(.036*Math.cos(col*2.48+seed)+.042*Math.abs(v))*t**7;
      position.push(x+width*v,y+tear,z+pleat*(.58+.42*t));
      uv.push(u,t);
      const seam=Math.abs(v)>.69&&Math.abs(v)<.94;
      const stitch=seam&&(row%3!==2||Math.abs(v)>.85);
      const shade=.76+pleat*3.9+.063*Math.sin(t*45+v*19+seed);
      color.push(shade*(stitch?1.38:1),shade*(stitch?1.29:.46),shade*(stitch?1.02:.47));
      joints.push(first+segment,first+segment+1,0,0);
      weights.push(1-weight,weight,0,0);
      if(row&&col){
        const b=row*(columns+1)+col,a=b-columns-1;
        index.push(a-1,b-1,a,a,b-1,b);
      }
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setIndex(index);
  geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));
  geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
  geometry.computeVertexNormals();
  return geometry;
}

export function bindJadeSilks(body,material,mobile){
  const group=new T.Group();
  group.name='佳真 · 冠帶與戰袍';
  body.add(group);
  const root=new T.Bone(),bones=[root],strips=[];
  group.add(root);
  const panels=[{name:'繡金戰袍',side:0,phase:0,path:[
    [0,.18,.380,.133],[.005,-.04,.470,.144],[-.003,-.25,.523,.116],[.018,-.50,.542,.094],
  ]}];
  for(const side of sides){
    panels.push({name:side<0?'左背披帛':'右背披帛',side,phase:side*.76,back:true,path:[
      [side*.296,.483,-.360,.094],[side*.390,.22,-.458,.133],
      [side*.443,-.06,-.574,.148],[side*.526,-.38,-.590,.111],
    ]});
    panels.push({name:side<0?'左腰旒':'右腰旒',side,phase:1.2+side,path:[
      [side*.325,.145,.336,.042],[side*.539,.004,.343,.054],
      [side*.662,-.206,.286,.050],[side*.677,-.435,.147,.033],
    ]});
  }
  for(const {path,side,name,phase,back} of panels){
    const first=bones.length;
    const chain=[];
    for(const [i,[x,y,z]] of path.entries()){
      const joint=new T.Bone(),parent=chain.at(-1)??root;
      const [px,py,pz]=path[i-1]??[0,0,0];
      joint.name=`${name} ${i+1}`;
      joint.position.set(x-px,y-py,z-pz);
      parent.add(joint);
      chain.push(joint);
      bones.push(joint);
    }
    const geometry=silkGeometry(path,first,mobile?12:21,mobile?7:9,phase);
    const mesh=new T.SkinnedMesh(geometry,material);
    mesh.name=name;
    mesh.frustumCulled=false;
    group.add(mesh);
    strips.push({mesh,chain,side,phase,back});
  }
  body.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(bones);
  for(const {mesh} of strips)mesh.bind(skeleton,mesh.matrixWorld);
  return {
    pose(beat,wind,strike,travel,stage,fall,turn){
      for(const {chain,side,phase,back} of strips)for(const [i,joint] of chain.entries()){
        const t=i/(chain.length-1),wave=beat*.86-i*.95+phase;
        joint.rotation.set(
          Math.sin(wave)*(.08+travel*.07)*t+(wind*.14-strike*.28+fall*.29)*t*(back?1:-1),
          Math.cos(wave*.83+phase)*.12*t+side*stage*.09*t+turn*.32*t,
          Math.sin(wave*.68)*.07*t+side*(wind*.18+strike*.14+stage*.15)*t,
        );
      }
    },
    dispose(){skeleton.dispose();},
  };
}
