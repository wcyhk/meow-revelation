import * as T from '../three.min.mjs';

const TAU=Math.PI*2;

// Build each articulated part in its local coordinates and batch its static pieces by finish.
export function sculptPao(k){
  const joints=new Map();
  const normal=new T.Vector3();
  function collect(part,finish,geometry){
    const mesh=geometry.index?geometry.toNonIndexed():geometry;
    if(mesh!==geometry)geometry.dispose();
    if(!joints.has(part))joints.set(part,new Map());
    const finishes=joints.get(part);
    if(!finishes.has(finish))finishes.set(finish,[]);
    finishes.get(finish).push(mesh);
  }
  function sweep(part,finish,path,{sides=9,steps=path.length*4,ridge=.10}={}){
    const centers=path.map(p=>new T.Vector3(...p.slice(0,3)));
    const curve=new T.CatmullRomCurve3(centers);
    const section=new T.CatmullRomCurve3(path.map(p=>new T.Vector3(p[3],p[4]??p[3],0)));
    const frame=curve.computeFrenetFrames(steps,false);
    const positions=[],uvs=[],indices=[];
    const point=new T.Vector3();
    for(let row=0;row<=steps;row++){
      const t=row/steps,center=curve.getPointAt(t);
      const shape=section.getPoint(curve.getUtoTmapping(t));
      for(let j=0;j<=sides;j++){
        const angle=j*TAU/sides;
        const crest=1+ridge*Math.cos(angle*3+t*2);
        point.copy(center)
          .addScaledVector(frame.normals[row],Math.cos(angle)*Math.max(.001,shape.x)*crest)
          .addScaledVector(frame.binormals[row],Math.sin(angle)*Math.max(.001,shape.y)*crest);
        positions.push(...point.toArray());
        uvs.push(j/sides,t);
        if(row===steps||j===sides)continue;
        const a=row*(sides+1)+j,b=a+sides+1;
        indices.push(a,b,a+1,b,b+1,a+1);
      }
    }
    const last=positions.length/3;
    positions.push(...centers[0].toArray(),...centers.at(-1).toArray());
    uvs.push(.5,0,.5,1);
    for(let j=0;j<sides;j++){
      const a=steps*(sides+1)+j;
      indices.push(last,j+1,j,last+1,a,a+1);
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const normals=geometry.attributes.normal,other=new T.Vector3();
    for(let i=0;i<=steps;i++){
      const a=i*(sides+1),b=a+sides;
      normal.fromBufferAttribute(normals,a).add(other.fromBufferAttribute(normals,b)).normalize();
      normals.setXYZ(a,normal.x,normal.y,normal.z);
      normals.setXYZ(b,normal.x,normal.y,normal.z);
    }
    collect(part,finish,geometry);
  }
  function plate(part,finish,points,thickness=.06,bevel=.024){
    const center=new T.Vector3();
    const vectors=points.map(point=>new T.Vector3(...point));
    for(const point of vectors)center.add(point);
    center.divideScalar(vectors.length);
    const axis=vectors[1].clone().sub(vectors[0]).normalize();
    const face=new T.Vector3();
    for(let i=0;i<vectors.length;i++){
      const a=vectors[i].clone().sub(center),b=vectors[(i+1)%vectors.length].clone().sub(center);
      face.add(a.cross(b));
    }
    face.normalize();
    const up=face.clone().cross(axis).normalize();
    const outline=new T.Shape();
    for(const [index,point] of vectors.entries()){
      const p=point.clone().sub(center),x=p.dot(axis),y=p.dot(up);
      if(index===0)outline.moveTo(x,y);
      else outline.lineTo(x,y);
    }
    outline.closePath();
    const geometry=new T.ExtrudeGeometry(outline,{depth:thickness,bevelEnabled:true,bevelSize:bevel,
      bevelThickness:bevel*.70,bevelSegments:1,steps:1});
    const matrix=new T.Matrix4().makeBasis(axis,up,face);
    matrix.setPosition(center.addScaledVector(face,-thickness*.5));
    geometry.applyMatrix4(matrix);
    collect(part,finish,geometry);
  }
  function finish(merge){
    for(const [part,finishes] of joints)for(const [finish,pieces] of finishes){
      if(merge){
        for(const piece of pieces)merge(part,finish,piece);
        continue;
      }
      const geometry=new T.BufferGeometry();
      for(const [name,size] of [['position',3],['normal',3],['uv',2]]){
        const values=new Float32Array(pieces.reduce((sum,piece)=>sum+piece.attributes[name].array.length,0));
        let offset=0;
        for(const piece of pieces){
          const data=piece.attributes[name].array;
          values.set(data,offset);
          offset+=data.length;
        }
        geometry.setAttribute(name,new T.BufferAttribute(values,size));
      }
      for(const piece of pieces)piece.dispose();
      part.add(new T.Mesh(geometry,k.materials[finish]));
    }
  }
  return {sweep,plate,finish};
}

const mirrored=(side,points)=>points.map(([x,...rest])=>[x*side,...rest]);

export function skull(k,sculpt,head){
  const {sweep,plate}=sculpt;
  const {bone,mesh}=k;
  sweep(head,'oldBone',[
    [0,-.096,.21,.089,.081],[0,-.005,.157,.147,.153],[0,.116,.138,.202,.212],
    [0,.246,.096,.196,.183],[0,.344,.067,.106,.126],[0,.378,.055,.028,.046],
  ],{sides:24,steps:22,ridge:.073});
  const jaw=bone(head,0,-.076,.24);
  sweep(jaw,'oldBone',[
    [-.104,.026,-.065,.021],[-.113,-.068,.054,.043],[-.076,-.119,.111,.039],
    [0,-.13,.122,.038],[.076,-.119,.111,.039],[.113,-.068,.054,.043],[.104,.026,-.065,.021],
  ],{steps:26,sides:10});
  plate(head,'deep',[[-.103,-.071,.308],[.103,-.071,.308],[.071,-.148,.347],[-.069,-.151,.347]],.033,.01);
  sweep(head,'body',[
    [0,.407,.273,.010],[0,.311,.298,.054,.031],[0,.215,.328,.062,.043],[0,.099,.356,.043,.032],[0,.035,.369,.017],
  ],{sides:11});
  for(const side of [-1,1]){
    const points=values=>mirrored(side,values);
    mesh(head,'pearl','deep',side*.112,.091,.329,.083,.053,.027,0,side*.10,side*-.23);
    mesh(head,'gem','eye',side*.115,.087,.353,.031,.013,.022,0,0,side*-.27);
    mesh(head,'gem','eyeCore',side*.119,.088,.370,.010,.006,.008,0,0,side*-.27);
    plate(head,'body',points([[.014,.121,.364],[.067,.178,.352],[.176,.163,.286],[.192,.103,.276],[.117,.123,.351],[.064,.100,.359]]),.024,.012);
    // Nose, cheek arch, jaw spurs and the ridged edges of the skull.
    sweep(head,'oldBone',points([[.034,.11,.345,.020],[.09,.15,.347,.032],[.151,.135,.322,.026],[.185,.137,.268,.023],[.171,.202,.230,.005]]));
    sweep(head,'oldBone',points([[.182,.155,.255,.042],[.185,.064,.293,.038],[.152,.008,.339,.035],[.128,-.092,.337,.025],[.166,-.202,.257,.003]]));
    sweep(head,'edge',points([[.042,.065,.347,.028],[.055,.023,.371,.024],[.045,-.025,.371,.021],[.022,-.065,.378,.004]]));
    sweep(head,'ivoryShade',points([[.195,.193,.180,.047],[.213,.107,.018,.039],[.173,.008,-.028,.037],[.126,-.088,.035,.024]]));
    for(let socket=0;socket<3;socket++){
      const y=.014-socket*.040;
      mesh(head,'pearl','deep',side*(.122+socket*.018),y,.319-socket*.018,.020,.011,.012);
    }
    for(let tooth=0;tooth<5;tooth++){
      const x=(.013+tooth*.019)*side,z=.358-Math.abs(x)*.4;
      sweep(head,'ivoryShade',[[x,-.064,z,.013],[x,-.093,z+.004,.010],[x,-.119+tooth*.005,z+.009,.001]],{steps:6,sides:6});
      sweep(jaw,'oldBone',[[x,-.099,z-.22,.012],[x,-.082,z-.22,.008],[x,-.073+tooth*.008,z-.219,.001]],{steps:6,sides:6});
    }
    for(let tip=0;tip<4;tip++){
      const x=.047+tip*.040;
      const tipHeight=.59-tip*.032+(tip%2)*.06;
      sweep(head,tip%2?'edge':'oldBone',points([
        [x,.229,.282-tip*.018,.041,.034],[x*1.25,.34,.267-tip*.038,.041,.027],
        [x*1.58,.44,.213-tip*.040,.024,.015],[x*1.98,tipHeight,.128-tip*.043,.001,.001],
      ]),{steps:15,sides:8,ridge:.24});
    }
    const horn=points([[.185,.064,.101,.065],[.289,.110,.054,.086],[.413,.208,-.016,.080],[.533,.342,-.093,.072],
      [.611,.482,-.105,.065],[.620,.624,-.117,.048],[.568,.745,-.104,.023],[.495,.804,-.068,.001]]);
    sweep(head,'body',horn,{sides:12,steps:29,ridge:.24});
    const curve=new T.CatmullRomCurve3(horn.map(p=>new T.Vector3(...p.slice(0,3))));
    for(let ridge=0;ridge<7;ridge++){
      const t=.16+ridge*.10;
      const node=curve.getPointAt(t),tangent=curve.getTangentAt(t);
      const size=.086-ridge*.007;
      const shell=[];
      for(const offset of [-.024,0,.026]){
        const center=node.clone().addScaledVector(tangent,offset);
        const radius=size*(offset===0?1.31:1.04);
        shell.push([...center.toArray(),radius,radius*.82]);
      }
      sweep(head,ridge%3===0?'trim':'bronzeShade',shell,{steps:5,sides:11,ridge:.18});
    }
  }
  for(let i=0;i<4;i++){
    const y=.324-i*.061;
    plate(head,i%2?'oldBone':'ivoryShade',[
      [-.14+i*.02,y,-.049],[-.065,y+.026,-.125],[0,y+.017,-.143],
      [.065,y+.026,-.125],[.14-i*.02,y,-.049],[.081,y-.047,-.092],[0,y-.063,-.132],[-.088,y-.042,-.092],
    ],.029,.016);
  }
  return jaw;
}

export function beardLocks(k,sculpt,head,count=5){
  const {sweep}=sculpt;
  const beard=k.bone(head,0,-.090,.348);
  const locks=[];
  const layers=[{width:.135,depth:.035,shift:.012},{width:.093,depth:.105,shift:0},{width:.090,depth:-.019,shift:.019}];
  for(const [layer,{width,depth,shift}] of layers.entries()){
    for(const side of [-1,1]){
      const lock=k.bone(beard,side*.039,0,0);
      locks.push(lock);
      for(let strand=0;strand<count;strand++){
        const spread=strand/(count-1);
        const x=side*(.018+spread*width);
        const length=1.03-spread*.38-layer*.082+Math.sin(strand*2.44)*.053;
        const sway=Math.sin(strand*1.23+layer*2.4)*.039;
        sweep(lock,(strand+layer)%4===0?'ivoryShade':layer%2?'edge':'oldBone',[
          [x,.024,depth-spread*.066,.029,.027],[x*1.24,-length*.20,depth+.040,.039-spread*.011,.034],
          [x+sway,-length*.49,depth+.084+shift,.029-spread*.006,.025],
          [x*.78+sway*.32,-length*.80,depth+.112,.014,.017],
          [side*(.057+spread*.029)+sway*.50,-length,depth+.16,.0015,.0015],
        ],{steps:layer===0?13:10,sides:6,ridge:.26});
      }
    }
  }
  return {beard,locks};
}

export function cuirass(k,sculpt,body,awakened){
  const {sweep,plate}=sculpt;
  const {mesh,bone}=k;
  sweep(body,'deep',[
    [0,-.12,-.051,.23,.17],[0,.14,-.025,.29,.23],[0,.37,-.018,.335,.24],
    [0,.63,-.034,.445,.25],[0,.80,-.027,.353,.205],[0,.91,-.021,.17,.15],
  ],{sides:18,steps:19,ridge:.13});
  const back=k.bone(body,0,0,0);
  sweep(back,'ivoryShade',[[0,.88,-.207,.06],[0,.64,-.272,.084],[0,.37,-.287,.064],[0,.09,-.24,.042],[0,-.06,-.21,.022]]);
  for(let row=0;row<8;row++){
    const y=.82-row*.101,spread=.145-row*.010,z=-.283+(row-3)**2*.0031;
    plate(back,row%3?'body':'wingEdge',[
      [-spread,y+.035,z+.034],[-spread*.65,y+.058,z-.038],[0,y+.043,z-.070],
      [spread*.65,y+.058,z-.038],[spread,y+.035,z+.034],
      [spread*.65,y-.037,z-.021],[0,y-.065,z-.069],[-spread*.65,y-.037,z-.021],
    ],.040,.013);
    sweep(back,'bronzeShade',[[0,y+.040,z-.061,.010],[0,y-.003,z-.095,.023],[0,y-.049,z-.073,.009]],{sides:7,steps:6});
    if(row%2===1){
      plate(back,'deep',[[-.048,y+.037,z-.079],[.044,y+.037,z-.079],[.039,y-.032,z-.080],
        [0,y-.050,z-.098],[-.041,y-.027,z-.086]],.019,.008);
      mesh(back,'gem','cyan',0,y+.002,z-.102,.028,.039,.014);
    }
  }
  for(const side of [-1,1]){
    const p=values=>mirrored(side,values);
    plate(body,'body',p([[.014,.629,.271],[.07,.812,.248],[.248,.827,.230],[.407,.725,.152],
      [.349,.565,.233],[.182,.490,.296],[.058,.500,.306]]),.083,.027);
    plate(body,'wingEdge',p([[.066,.719,.300],[.128,.791,.291],[.277,.787,.257],[.399,.709,.188],
      [.276,.642,.293],[.181,.652,.329],[.091,.598,.319]]),.039,.012);
    sweep(body,'cyan',p([[.086,.608,.341,.011],[.095,.691,.352,.020],[.149,.731,.343,.024],
      [.250,.743,.304,.028],[.336,.782,.231,.022],[.419,.752,.169,.002]]),{sides:7,steps:16});
    for(let row=0;row<4;row++){
      const y=.527-row*.092,outer=.36-row*.016;
      plate(body,row%2?'body':'bronzeShade',p([[.066,y+.046,.258],[.210,y+.023,.307],[outer,y+.052,.22],
        [outer+.04,y-.018,.155],[.204,y-.052,.264],[.056,y-.014,.265]]),.044,.012);
      sweep(body,row%2?'ivoryShade':'trim',p([[.102,y+.020,.292,.010],[.226,y-.018,.344,.020],
        [outer-.003,y+.017,.264,.015],[outer+.049,y+.05,.219,.001]]),{steps:9,sides:6});
    }
    // Overlapping flank scales wrap from the ribs to the back instead of ending at a flat front.
    for(let row=0;row<5;row++){
      const y=.72-row*.112,x=.445-row*.032;
      plate(body,'body',p([[x-.014,y+.04,.173],[x+.020,y+.047,.065],[x+.044,y+.032,-.059],
        [x-.011,y+.002,-.201],[x-.081,y-.077,-.209],[x-.037,y-.069,.103]]),.033,.011);
      sweep(body,row%2?'bronzeShade':'wingEdge',p([[x-.04,y-.01,.133,.009],[x+.058,y-.001,.060,.014],
        [x+.065,y-.010,-.067,.014],[x-.001,y-.047,-.183,.005]]),{sides:6,steps:9});
    }
    // Scapular armor forms a raised collar around the wing roots.
    for(let row=0;row<3;row++){
      const y=.781-row*.116,x=.114+row*.022;
      plate(back,row%2?'wingEdge':'body',p([[x,y+.042,-.276],[.262,y+.091,-.266],[.406,y+.035,-.226],
        [.449,y-.039,-.168],[.334,y-.116,-.224],[x+.020,y-.071,-.309]]),.055,.019);
      sweep(back,row===0?'trim':'ivoryShade',p([[x,y+.038,-.318,.011],[.244,y+.058,-.322,.018],
        [.352,y+.014,-.289,.014],[.420,y-.047,-.219,.003]]),{sides:6,steps:10});
      mesh(back,'gem','trim',side*.309,y-.047,-.285,.019,.023,.010);
    }
    // Front and back tassets have raised bronze rims, scalloped ends and rivets.
    for(const facing of [-1,1]){
      const z=.190*facing;
      const y=facing>0?.143:.090;
      const outline=p([[.079,y+.093,z],[.241,y+.163,z-.021*facing],[.449,y+.129,z-.051*facing],
        [.506,y-.034,z-.021*facing],[.358,y-.253,z+.061*facing],[.167,y-.126,z+.061*facing]]);
      plate(body,'trim',outline,.066,.023);
      const center=new T.Vector3(side*.282,y-.010,z+.06*facing);
      const inset=outline.map(point=>new T.Vector3(...point).lerp(center,.20).add(new T.Vector3(0,0,.024*facing)).toArray());
      plate(body,'body',inset,.047,.016);
      for(const [index,point] of inset.slice(1).entries()){
        mesh(body,'gem','trim',point[0],point[1]-.015,point[2]+.033*facing,.017,.022,.018,0,index*.22);
      }
    }
    for(let clasp=0;clasp<3;clasp++){
      mesh(back,'gem','trim',side*(.121+clasp*.046),.202-clasp*.036,-.300-clasp*.016,.022,.026,.015);
    }
    if(awakened){
      mesh(back,'gem','cyan',side*.283,.548,-.325,.046,.054,.026);
      sweep(back,'wingEdge',p([[.211,.511,-.326,.009],[.257,.499,-.349,.023],[.306,.520,-.350,.016],
        [.336,.57,-.315,.008]]),{sides:7,steps:10});
    }
  }
  return back;
}

export function rivenCloth(k,sculpt,skirt,count=10){
  const pieces=[];
  const {sweep,plate}=sculpt;
  for(let i=0;i<count;i++){
    const angle=(i+.55)*TAU/count;
    const length=.87+Math.cos(i*2.21)*.19+Math.sin(i*.78)*.10;
    const x=Math.sin(angle)*.265,z=Math.cos(angle)*.172;
    const strip=k.bone(skirt,x,.04,z);
    strip.rotation.y=angle;
    pieces.push(strip);
    const rootWidth=.152+(i%3)*.025;
    for(let section=0;section<3;section++){
      const y=-section*length*.25;
      const last=section===2;
      const curl=.045+section*.044;
      const taper=1-section*.15;
      const half=rootWidth*taper;
      const hem=last?length*.47:length*.30;
      const a=Math.sin(i*1.8+section*2.16)*.029;
      plate(strip,section===1&&i%3===0?'clothSeam':'deep',[
        [-half,y,.008+curl],[a,y+.024,.027+curl],[half,y,-.017+curl],
        [half*.84+a,y-hem*.60,.040+curl],[half*.46,y-hem*(last?1.04:.87),.023+curl],
        [a-.011,y-hem*.75,.056+curl],[-half*.32+a,y-hem,.051+curl],[-half*.87,y-hem*.70,.008+curl],
      ],.021,.008);
      const seamCount=section===2?1:2;
      for(let seam=0;seam<seamCount;seam++){
        const offset=(seam-.5)*half*.69;
        sweep(strip,seam?'clothSeam':'deep',[
          [a+offset,y-.017,.043+curl,.011],[offset*.71,y-hem*.29,.066+curl,.012],
          [offset+a,y-hem*.61,.081+curl,.009],[offset,y-hem*.89,.085+curl,.001],
        ],{sides:4,steps:5,ridge:.17});
      }
    }
  }
  return pieces;
}

export function bracer(k,sculpt,arm,elbow,palm,side){
  const {sweep,plate}=sculpt;
  const {mesh}=k;
  const p=values=>mirrored(side,values);
  for(let row=0;row<3;row++){
    const x=.032+row*.062,y=.113-row*.053;
    for(const direction of [-1,1]){
      const z=.117*direction;
      const outline=p([[x-.087,y+.08,z],[x+.050,y+.073,z-.047*direction],[x+.168,y+.012,z-.097*direction],
        [x+.129,y-.081,z-.050*direction],[x+.036,y-.136,z+.011*direction],[x-.058,y-.049,z+.051*direction]]);
      plate(arm,row===0?'trim':'body',outline,.038,.016);
    }
  }
  sweep(arm,'cyan',p([[.022,.112,.211,.008],[.097,.092,.208,.020],[.152,.022,.181,.030],[.221,-.041,.143,.001]]),
    {sides:7,steps:12});
  const hub=p([[.127,-.274,.096,.068],[.112,-.203,.137,.082],
    [.077,-.121,.126,.104],[.031,-.058,.085,.088],[0,-.02,.012,.067]]);
  sweep(elbow,'body',hub,{sides:13,steps:14,ridge:.19});
  for(let row=0;row<3;row++){
    const y=-.214+row*.090,x=.120-row*.038;
    for(const direction of [-1,1]){
      const z=direction*(.154-row*.035)+.060;
      plate(elbow,row===0?'trim':'wingEdge',p([[x-.081,y+.034,z],[x+.045,y+.061,z],[x+.092,y+.008,z-.031*direction],
        [x+.069,y-.048,z],[x-.020,y-.083,z+.027*direction]]),.033,.012);
    }
    mesh(elbow,'gem','bronzeShade',side*(x+.049),y+.021,.190-row*.025,.021,.027,.019);
  }
  sweep(elbow,'cyan',p([[.127,-.218,.211,.009],[.103,-.154,.225,.019],[.082,-.097,.207,.017],[.077,-.039,.174,.002]]),
    {sides:7,steps:11});
  for(let finger=0;finger<4;finger++){
    const x=(finger-1.5)*.056;
    const reach=.202-Math.abs(finger-1.4)*.024;
    sweep(palm,'body',[[x,-.019,.058,.032],[x*1.16,-.096,.106,.027],
      [x*1.24,-.149,.143,.025],[x*1.15,-reach,.111,.018]],{sides:8,steps:10});
    sweep(palm,'oldBone',[[x*1.15,-reach+.030,.124,.019],[x*1.13,-reach,.112,.015],
      [x*1.018,-reach-.042,.070,.001]],{steps:7,sides:6});
    mesh(palm,'gem','wingEdge',x*1.17,-.098,.133,.023,.028,.015);
  }
  const thumb=p([[.077,-.030,.01,.038],[.137,-.067,.064,.031],[.151,-.115,.100,.019],[.118,-.128,.142,.002]]);
  sweep(palm,'body',thumb,{steps:11,sides:8});
}

export function wingJoint(k,sculpt,hinge,project){
  const {sweep,plate}=sculpt;
  const points=path=>path.map(([x,y,z,...radii])=>[...project([x,y,z]),...radii]);
  sweep(hinge,'deep',points([[0,0,.01,.118],[.16,.25,-.017,.112],[.34,.48,-.086,.092],[.51,.69,-.13,.070],
    [.61,1.03,-.147,.065],[.71,1.29,-.16,.098],[.91,1.26,-.177,.064],[1.18,1.18,-.19,.038]]),
    {sides:13,steps:32,ridge:.20});
  for(const facing of [-1,1]){
    const z=.119*facing;
    for(let section=0;section<4;section++){
      const x=.06+section*.109,y=.090+section*.147;
      plate(hinge,section%2?'body':'wingEdge',points([
        [x-.079,y-.084,z],[x+.042,y-.068,z+.029*facing],[x+.132,y+.032,z],
        [x+.102,y+.119,z-.078*facing],[x+.012,y+.097,z-.038*facing],[x-.079,y-.023,z+.013*facing],
      ]),.042,.018);
    }
    sweep(hinge,'wingEdge',points([[.068,.004,z,.029],[.20,.24,z-.02,.035],[.39,.48,z-.065,.031],
      [.55,.75,z-.119,.024],[.65,1.13,z-.15,.005]]),{sides:7,steps:17});
    sweep(hinge,'bronzeShade',points([[.22,.33,z-.016,.006],[.31,.46,z-.034,.019],
      [.36,.58,z-.065,.018],[.41,.717,z-.114,.001]]),{sides:7,steps:14});
  }
  const crown=points([[.77,1.22,-.158,.093],[.70,1.34,-.166,.105],[.58,1.48,-.176,.091],
    [.44,1.56,-.173,.057],[.31,1.55,-.15,.037],[.24,1.44,-.10,.001]]);
  sweep(hinge,'body',crown,{sides:13,steps:26,ridge:.24});
  const emitter=k.bone(hinge,...project([.56,.92,-.16]));
  return emitter;
}
