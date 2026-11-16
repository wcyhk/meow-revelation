import * as T from '../three.min.mjs';
import {paintedFinish} from './painted-finish.mjs?v=guard-forge-2';

const meshName='頭目 · 骨骼蒙皮';

function appendStrip(data,strip,index,bones,mobile){
  const {path,name,across,tint,trim,lining,style,phase,flex}=strip;
  const woven=style==='woven';
  const anchors=path.map(point=>new T.Vector3(...point.slice(0,3)));
  const spine=new T.CatmullRomCurve3(anchors,false,'catmullrom',.31);
  const rows=(path.length-1)*(mobile?4:6),columns=woven?(mobile?10:14):(mobile?6:8);
  const section=new T.Vector3(...across).normalize();
  const tangent=new T.Vector3(),span=new T.Vector3(),normal=new T.Vector3(),point=new T.Vector3();
  const base=new T.Color(tint),edge=new T.Color(trim),reverse=new T.Color(lining??tint);
  const offset=data.position.length/3;
  const silk=style==='cloth'||woven,skin=style==='membrane';
  const folds=woven?.061:silk?.046:skin?.025:.078;
  const chain=[];
  let parent=bones[0];
  for(const [i,a] of anchors.entries()){
    const joint=new T.Bone();
    joint.name=`${name} ${i+1}`;
    joint.position.copy(a);
    if(i)joint.position.sub(anchors[i-1]);
    parent.add(joint);
    bones.push(joint);chain.push(joint);
    parent=joint;
  }
  const stride=columns+1,layer=(rows+1)*stride;
  for(let face=0;face<(woven?2:1);face++)for(let row=0;row<=rows;row++){
    const t=row/rows,along=t*(path.length-1);
    const segment=Math.min(path.length-2,Math.floor(along)),mix=along-segment;
    const weight=mix*mix*(3-2*mix);
    const center=spine.getPoint(t);
    spine.getTangent(t,tangent);
    span.copy(section).addScaledVector(tangent,-section.dot(tangent));
    if(span.lengthSq()<.001){
      span.set(Math.abs(tangent.x)<.8?1:0,0,Math.abs(tangent.x)<.8?0:1);
      span.addScaledVector(tangent,-span.dot(tangent));
    }
    span.normalize();
    normal.crossVectors(tangent,span).normalize();
    const width=T.MathUtils.lerp(path[segment][3],path[segment+1][3],mix);
    for(let col=0;col<=columns;col++){
      const u=col/columns,v=u*2-1,hem=Math.abs(v);
      const second=woven?.28*Math.cos(v*18-t*5.1+phase):0;
      const pleat=(Math.cos(v*(silk?9:skin?12:18)+phase+t*2.1)*(woven?.72:1)+second)*folds;
      const rag=(woven?.05:silk?.16:skin?.09:.25)*t**7*(.47+.53*Math.sin(col*2.21+phase));
      const ridge=(pleat*(1-.24*hem)+width*.22*(1-v*v))*Math.min(1,width*5);
      const thickness=woven?(face?-.007:.007):0;
      point.copy(center).addScaledVector(span,width*v).addScaledVector(normal,ridge+thickness).addScaledVector(tangent,-rag);
      data.position.push(point.x,point.y,point.z);
      data.uv.push(u,t);
      const seam=silk&&col!==0&&col!==columns&&(col===1||col===columns-1);
      const vein=!silk&&(col===columns/2||Math.cos(t*43+v*12)>.79);
      const shade=.71+pleat*3.0+hem*.12+.055*Math.sin(v*20+t*36+phase);
      if(woven){
        const diamonds=Math.abs(Math.sin(u*19-t*23+phase)*Math.sin(u*19+t*23+phase));
        const pattern=T.MathUtils.smoothstep(diamonds,.57,.91)*(face?.09:.26);
        const piping=hem>.91?.89:hem>.78?.30:0;
        const border=t>.87?(t>.97?.72:.34):0;
        const thread=Math.max(piping,border,pattern);
        const c=face?reverse:base;
        const brightness=shade*(face?.83:1);
        data.color.push(T.MathUtils.lerp(c.r,edge.r,thread)*brightness,
          T.MathUtils.lerp(c.g,edge.g,thread)*brightness,T.MathUtils.lerp(c.b,edge.b,thread)*brightness);
      }else{
        const c=seam||vein?edge:base;
        data.color.push(c.r*shade,c.g*shade,c.b*shade);
      }
      data.joints.push(index+segment,index+segment+1,0,0);
      data.weights.push(1-weight,weight,0,0);
      if(row&&col){
        const b=offset+face*layer+row*stride+col,a=b-stride;
        if(face)data.indices.push(a-1,a,b-1,a,b,b-1);
        else data.indices.push(a-1,b-1,a,a,b-1,b);
      }
    }
  }
  if(woven){
    const stitch=(a,b)=>data.indices.push(offset+a,offset+a+layer,offset+b,offset+b,offset+a+layer,offset+b+layer);
    for(let row=0;row<rows;row++){
      stitch(row*stride,(row+1)*stride);
      stitch((row+1)*stride+columns,row*stride+columns);
    }
    for(let col=0;col<columns;col++){
      stitch(col+1,col);
      stitch(rows*stride+col,rows*stride+col+1);
    }
  }
  return {chain,phase,flex,woven,velocity:woven?chain.map(()=>new T.Vector3()):null};
}

function bindStrips(parent,strips,material,mobile){
  const root=new T.Bone(),bones=[root];
  parent.add(root);
  const data={position:[],uv:[],color:[],joints:[],weights:[],indices:[]};
  const motion=strips.map(strip=>appendStrip(data,strip,bones.length,bones,mobile));
  const geo=new T.BufferGeometry();
  geo.setIndex(data.indices);
  geo.setAttribute('position',new T.Float32BufferAttribute(data.position,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute(data.uv,2));
  geo.setAttribute('color',new T.Float32BufferAttribute(data.color,3));
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(data.joints,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(data.weights,4));
  geo.computeVertexNormals();
  const mesh=new T.SkinnedMesh(geo,material);
  mesh.name=meshName;
  mesh.frustumCulled=false;
  parent.add(mesh);
  parent.updateWorldMatrix(true,true);
  const skeleton=new T.Skeleton(bones);
  mesh.bind(skeleton,mesh.matrixWorld);
  return {motion,skeleton};
}

export function bossSkin(kit,mobile,author){
  const groups=new Map(),hinges=[];
  const tools={
    silk(parent,name,path,{across=[1,0,0],tint=0x8c4f3c,trim=0xcba777,lining,style='cloth',phase=0,flex=1}={}){
      if(!groups.has(parent))groups.set(parent,[]);
      groups.get(parent).push({name,path,across,tint,trim,lining,style,phase,flex});
    },
    hinge(group,{side=1,axis='x',wind=.12,strike=-.22,travel=.05,phase=.05,follow,ratio=.3}={}){
      hinges.push({group,side,axis,wind,strike,travel,phase,follow,ratio,rest:group.rotation[axis],
        followerRest:follow?.rotation[axis]??0});
    },
  };
  if(!author(tools))return null;
  const material=new T.MeshStandardMaterial({color:0xffffff,roughness:.87,metalness:.045,vertexColors:true,side:T.DoubleSide});
  kit.materials.bossSkin=material;
  const skinned=[];
  for(const [parent,strips] of groups){
    const woven=strips.filter(strip=>strip.style==='woven');
    const original=strips.filter(strip=>strip.style!=='woven');
    if(original.length)skinned.push(bindStrips(parent,original,material,mobile));
    if(woven.length){
      kit.materials.wovenSilk??=paintedFinish(new T.MeshPhysicalMaterial({color:0xffffff,roughness:.65,metalness:.032,
        sheen:.63,sheenColor:new T.Color(0xc9bfa9),sheenRoughness:.72,vertexColors:true,side:T.DoubleSide}), 'cloth',true,true);
      skinned.push(bindStrips(parent,woven,kit.materials.wovenSilk,mobile));
    }
  }
  const motion=skinned.flatMap(rig=>rig.motion);
  return {
    pose({beat,wind,strike,stage,stagger,travel,fall,turn=0,dt=1/60}){
      const tick=Math.min(.067,Math.max(0,dt));
      const drag=Math.exp(-tick*8.9);
      for(const {chain,phase,flex,woven,velocity} of motion)for(let i=1;i<chain.length;i++){
        const t=i/(chain.length-1),wave=beat*.89-i*.84+phase;
        const f=flex*t;
        const x=f*(Math.sin(wave)*(.07+travel*.10)+wind*.14-strike*.34+fall*.37);
        const y=f*(Math.cos(wave*.78+phase)*.107+stage*.067+stagger*.19);
        const z=f*(Math.sin(wave*.65)*(.078+travel*.04)+Math.cos(phase)*(wind*.12+strike*.15));
        const pose=chain[i].rotation;
        if(woven){
          const v=velocity[i];
          v.x=(v.x+(x-pose.x)*tick*89)*drag;
          v.y=(v.y+(y-turn*f*.23-pose.y)*tick*77)*drag;
          v.z=(v.z+(z+turn*f*.18-pose.z)*tick*84)*drag;
          pose.set(pose.x+v.x*tick,pose.y+v.y*tick,pose.z+v.z*tick);
        }else pose.set(x,y,z);
      }
      for(const item of hinges){
        const {group,axis,side,follow,followerRest,ratio,rest}=item;
        const followAngle=follow?T.MathUtils.clamp(follow.rotation[axis]-followerRest,-1.7,1.7)*ratio:0;
        group.rotation[axis]=rest+followAngle+side*(wind*item.wind+strike*item.strike+stage*item.phase+
          Math.sin(beat*.86+side)*(travel*.7+.3)*item.travel+stagger*.045);
      }
    },
    dispose(){for(const {skeleton} of skinned)skeleton.dispose();},
  };
}
