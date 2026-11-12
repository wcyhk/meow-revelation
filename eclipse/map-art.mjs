import * as T from '../three.min.mjs';

const TAU=Math.PI*2;
const glow={transparent:true,depthWrite:false,blending:T.AdditiveBlending};

export function piece(root,geometry,material,x=0,y=0,z=0) {
  const mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);
  root.add(mesh);
  return mesh;
}

export function floorRing(inner,outer,sides=48) {
  return new T.RingGeometry(inner,outer,sides).rotateX(-Math.PI/2);
}

function lathe(profile,segments=12) {
  return new T.LatheGeometry(profile.map(([radius,y])=>new T.Vector2(radius,y)),segments);
}

function crest(points,thickness,bevel=.025) {
  const path=new T.Shape();
  for (const [i,[x,y]] of points.entries()) {
    if (i===0) path.moveTo(x,y);
    else path.lineTo(x,y);
  }
  path.closePath();
  const shape=new T.ExtrudeGeometry(path,{depth:thickness,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1});
  shape.translate(0,0,-thickness*.5);
  return shape;
}

function combine(geometries) {
  const parts={position:[],normal:[],uv:[]};
  for (const geometry of geometries) {
    const source=geometry.index?geometry.toNonIndexed():geometry;
    for (const [name,values] of Object.entries(parts)) {
      for (const value of source.attributes[name].array) values.push(value);
    }
    if (source!==geometry) source.dispose();
    geometry.dispose();
  }
  const result=new T.BufferGeometry();
  for (const [name,data] of Object.entries(parts)) {
    result.setAttribute(name,new T.Float32BufferAttribute(data,name==='uv'?2:3));
  }
  return result;
}

function ornamentalRing(radius,count,span) {
  const strokes=[];
  for (let i=0;i<count;i++) {
    const angle=i*TAU/count;
    const thick=i%3===0?1.28:.72;
    strokes.push(new T.BoxGeometry(.026,.012,span*thick)
      .translate(0,0,radius).rotateY(angle));
    if (i%3===0) {
      strokes.push(new T.BoxGeometry(.037,.015,.055).rotateY(Math.PI/4)
        .translate(0,0,radius+span*.73).rotateY(angle));
    }
  }
  return combine(strokes);
}

function floorShade(view,root,radius) {
  const shade=view.ground(view.shadow,0xf9e7d2,.83,radius*3.3,radius*2.75);
  shade.position.set(.11,.019,.16);
  root.add(shade);
}

export function monument(view,prop,tone,{tall=false,stone=0x918178}={}) {
  const root=new T.Group();
  root.position.set(prop.x,0,prop.z);
  root.rotation.y=prop.angle??(prop.x*.21+prop.z*.29);
  const {radius:r}=prop;
  const style=prop.style??2;
  const h=tall?1.76:.80+style*.23;
  const sides=style===2?8:style===1?12:6;
  const tint=new T.Color(tone);
  const stoneTint=new T.Color(stone).lerp(tint,tall?.13:.19);
  const rock=new T.MeshStandardMaterial({color:stoneTint,roughness:.92,map:view.battleTextures.stone,
    bumpMap:view.battleTextures.stone,bumpScale:.061});
  const edge=new T.MeshStandardMaterial({color:tint.clone().lerp(new T.Color(0x9c8561),.78),
    roughness:.52,metalness:.47});
  const inset=new T.MeshStandardMaterial({color:0x332c30,roughness:.85});
  const lit=new T.MeshBasicMaterial({color:tone,opacity:.83,...glow});
  const base=lathe([[0,.01],[r*.94,.01],[r,.055],[r,.14],[r*.92,.19],[r*.73,.23],
    [r*.70,.29],[r*.61,.32],[r*.58,.40],[r*.48,h-.15],[r*.54,h-.10],[r*.59,h-.025],[0,h]],sides);
  piece(root,base,rock);
  piece(root,combine([
    lathe([[r*.93,.154],[r*.90,.19],[r*.75,.214],[r*.75,.191],[r*.93,.154]],sides),
    lathe([[r*.66,.31],[r*.65,.36],[r*.57,.40],[r*.57,.363],[r*.66,.31]],sides),
    lathe([[r*.52,h-.16],[r*.62,h-.12],[r*.63,h-.062],[r*.55,h-.018],[r*.52,h-.045],[r*.52,h-.16]],sides),
  ]),edge);
  const plates=[],staves=[],runes=[];
  for (let i=0;i<(style===3?6:4);i++) {
    const angle=TAU*i/(style===3?6:4)+Math.PI/7;
    plates.push(crest([[0,-.26],[-.116,-.135],[-.116,.128],[0,.27],[.116,.128],[.116,-.135]],.046,.012)
      .scale(r,h*.68,1).translate(0,h*.62,r*.54).rotateY(angle));
    const strokes=[[-.055,-.08,.055,-.08],[-.055,.06,0,.15],[0,.15,.055,.06],[0,-.17,0,.14]];
    for (const [x1,y1,x2,y2] of strokes) {
      const span=Math.hypot(x2-x1,y2-y1);
      runes.push(new T.BoxGeometry(.018,span,.011).rotateZ(-Math.atan2(x2-x1,y2-y1))
        .translate((x1+x2)*.5,(y1+y2)*.5,0).scale(r,h*.63,1)
        .translate(0,h*.62,r*.54+.038).rotateY(angle));
    }
    const side=r*.38;
    staves.push(new T.BoxGeometry(.065,h*.44,.066).translate(side,h*.55,side).rotateY(angle));
  }
  piece(root,combine(plates),inset);
  piece(root,combine(staves),edge);
  piece(root,combine(runes),lit);
  const tip=style===0?new T.IcosahedronGeometry(r*.25,0):new T.OctahedronGeometry(r*.22);
  const gem=piece(root,tip,new T.MeshStandardMaterial({color:tint,emissive:tint,emissiveIntensity:.49,roughness:.30,metalness:.26}),0,h+.10,0);
  gem.scale.y=style===3?1.36:.80;
  gem.rotation.y=Math.PI/4;
  floorShade(view,root,r);
  return root;
}

export function lantern(view) {
  const root=new T.Group();
  const stone=new T.MeshStandardMaterial({color:0x847060,roughness:.87,map:view.battleTextures.stone});
  const bronze=new T.MeshStandardMaterial({color:0xb27d43,roughness:.38,metalness:.57});
  const trim=new T.MeshStandardMaterial({color:0xd9a966,roughness:.38,metalness:.53});
  piece(root,lathe([[0,.01],[.40,.01],[.43,.04],[.39,.11],[.34,.125],[.29,.17],[0,.17]],10),stone);
  piece(root,combine([
    lathe([[0,.14],[.29,.14],[.335,.177],[.31,.212],[.25,.237],[0,.237]],12),
    lathe([[0,.66],[.36,.66],[.363,.695],[.30,.719],[.23,.753],[.15,.80],[.09,.837],[0,.84]],12),
    new T.TorusGeometry(.081,.019,5,12).translate(0,.906,0),
  ]),bronze);
  const braces=[];
  for (let i=0;i<6;i++) {
    const angle=i*TAU/6;
    braces.push(crest([[-.036,.19],[-.034,.32],[-.086,.50],[-.058,.665],[.058,.665],[.084,.50],[.032,.32],[.036,.19]],.024,.009)
      .translate(0,0,.237).rotateY(angle));
    braces.push(new T.OctahedronGeometry(.042).translate(0,.519,.270).rotateY(angle));
  }
  braces.push(lathe([[.244,.276],[.259,.295],[.254,.315],[.244,.317],[.244,.276]],12));
  braces.push(lathe([[.255,.599],[.275,.614],[.269,.637],[.256,.635],[.255,.599]],12));
  piece(root,combine(braces),trim);
  const flame=piece(root,lathe([[0,-.16],[.077,-.142],[.125,-.073],[.119,.021],[.066,.097],[.026,.17],[0,.222]],8),
    new T.MeshBasicMaterial({color:0xffc477}),0,.40);
  const heart=piece(flame,lathe([[0,-.112],[.053,-.083],[.065,-.018],[.038,.036],[0,.108]],7),
    new T.MeshBasicMaterial({color:0xfff3bb}),0,0,.052);
  const halo=new T.Sprite(new T.SpriteMaterial({map:view.halo,color:0xffa760,opacity:.68,...glow}));
  halo.position.y=.46;
  halo.scale.set(1.8,1.9,1);
  root.add(halo);
  const light=view.ground(view.halo,0xffbd77,.26,3.4,2.85);
  light.material.blending=T.AdditiveBlending;
  light.position.y=.028;
  light.renderOrder=-6;
  root.add(light);
  const marker=piece(root,combine([floorRing(.77,.793),ornamentalRing(.81,18,.105)]),
    new T.MeshBasicMaterial({color:0xffce8b,opacity:.69,...glow}),0,.041);
  marker.renderOrder=6;
  floorShade(view,root,.44);
  root.userData={flame,heart,halo,marker,light};
  return root;
}

export function lightLantern(root,lit,time,strength=1,index=0) {
  const {flame,halo,light}=root.userData;
  flame.visible=halo.visible=light.visible=lit;
  if (!lit) return;
  const pulse=Math.sin(time*8.4+index*2.1);
  flame.position.y=.414+pulse*.033;
  flame.rotation.set(.13*pulse,time*.86,.11*Math.cos(time*6.1+index));
  flame.scale.set(.91+pulse*.075,1.13+pulse*.20,.90);
  halo.material.opacity=strength*(.59+pulse*.11);
  light.material.opacity=strength*(.24+pulse*.043);
}

export function ritualFixture(view,root,point,mode,ink,stone) {
  const stand=new T.Group();
  stand.position.set(point.x,0,point.z);
  root.add(stand);
  const r=mode==='hold'?1.24:.80;
  const rock=new T.MeshStandardMaterial({color:new T.Color(stone).lerp(new T.Color(0x746b63),.42),
    roughness:.82,map:view.battleTextures.stone,bumpMap:view.battleTextures.stone,bumpScale:.045});
  const metal=new T.MeshStandardMaterial({color:0xa3815f,metalness:.55,roughness:.43});
  const light=new T.MeshBasicMaterial({color:ink,opacity:.84,...glow});
  piece(stand,lathe([[0,.019],[r*1.025,.019],[r*1.06,.06],[r*1.03,.12],[r*.94,.167],[0,.167]],12),rock);
  piece(stand,combine([floorRing(r*.83,r*.97,12),floorRing(r*.67,r*.69,12),ornamentalRing(r*.77,18,r*.089)]),metal,0,.179);
  piece(stand,combine([floorRing(r*.88,r*.912,12),floorRing(r*.68,r*.695,12),ornamentalRing(r*.74,12,r*.097)]),light,0,.188);
  floorShade(view,stand,r*.88);
  let gem,charge;
  if (mode==='break') {
    piece(stand,lathe([[0,.16],[.37,.16],[.34,.30],[.24,.37],[.27,.53],[.18,.62],[0,.62]],8),rock);
    piece(stand,combine([lathe([[.23,.41],[.30,.44],[.30,.48],[.23,.50],[.23,.41]],8),
      new T.TorusGeometry(.36,.033,5,16).rotateX(Math.PI/2).translate(0,.55,0)]),metal);
    gem=piece(stand,new T.OctahedronGeometry(.39),new T.MeshStandardMaterial({color:ink,emissive:ink,
      emissiveIntensity:.70,metalness:.22,roughness:.26}),0,.88);
    gem.scale.y=1.47;
  } else if (mode==='bait') {
    piece(stand,lathe([[0,.17],[.33,.17],[.26,.24],[.17,.30],[.14,.69],[.20,.75],[0,.75]],8),metal);
    gem=new T.Group();
    gem.position.y=.91;
    stand.add(gem);
    const rim=new T.MeshStandardMaterial({color:0xbf996b,metalness:.64,roughness:.32});
    const frame=piece(gem,new T.TorusGeometry(.46,.061,6,20),rim);
    frame.scale.y=1.16;
    const mirror=piece(gem,new T.CircleGeometry(.429,20),new T.MeshStandardMaterial({color:0x756d65,
      emissive:ink,emissiveIntensity:.22,roughness:.22,metalness:.48,side:T.DoubleSide}),0,0,.014);
    mirror.scale.y=1.17;
    piece(gem,crest([[-.32,-.31],[-.28,-.38],[.32,.34],[.27,.41]],.008,0),light,0,0,.024);
  } else {
    gem=piece(stand,combine([floorRing(.36,.405,4),floorRing(.47,.497,4).rotateY(Math.PI/4),
      floorRing(.13,.154,4).rotateY(Math.PI/4)]),light,0,.198);
    if (mode==='hold') {
      charge=view.ground(view.halo,ink,.44,2.17,2.17);
      charge.material.blending=T.AdditiveBlending;
      charge.position.y=.202;
      charge.userData.size=2.17;
      charge.renderOrder=9;
      stand.add(charge);
    }
  }
  return {root:stand,point,gem,light,charge};
}
