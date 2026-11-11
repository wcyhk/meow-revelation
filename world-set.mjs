import * as T from "./three.min.mjs";
import { haloFragment, planeVertex } from "./world-light.mjs?v=moonlight";

export const PITCH = 55 * Math.PI / 180;
export const DEPTH = Math.sin(PITCH);
const CELL = 720;
const pointZ = y => (y - .5) * CELL / DEPTH;

const profiles = {
  village:{set:"harbor", wet:.43, floor:.36, stone:0x46555a, steel:0x9b7757},
  entry:{set:"ruin", wet:.72, floor:.29, stone:0x414659, steel:0x987a7f},
  reef:{set:"coast", wet:.84, floor:.34, stone:0x465059, steel:0x857d79},
  fen:{set:"crystal", wet:.92, floor:.35, stone:0x555971, steel:0x8388b1},
  boss:{set:"sanctum", wet:.82, floor:.31, stone:0x473d5d, steel:0x9870a7},
  exchange:{set:"harbor", wet:.45, floor:.45, stone:0x4e403a, steel:0xab7150},
  cistern:{set:"ruin", wet:1.0, floor:.43, stone:0x365759, steel:0x6d9a96},
  archive:{set:"vault", wet:.23, floor:.46, stone:0x514140, steel:0x99705c},
  vault:{set:"vault", wet:.62, floor:.44, stone:0x603e45, steel:0xd39051},
  flats:{set:"coast", wet:1.0, floor:.43, stone:0x6b6178, steel:0xb59ea8},
  wreck:{set:"harbor", wet:.82, floor:.43, stone:0x364956, steel:0x937b62},
  salt:{set:"crystal", wet:1.0, floor:.43, stone:0x4d5684, steel:0x90a9d9},
  abbey:{set:"sanctum", wet:.84, floor:.43, stone:0x43496b, steel:0xa49bca},
  cliff:{set:"coast", wet:.30, floor:.44, stone:0x483c50, steel:0x9f6c62},
  garden:{set:"grove", wet:.52, floor:.43, stone:0x4e5158, steel:0x78654c},
  bridge:{set:"ruin", wet:.68, floor:.42, stone:0x3e4e62, steel:0x78a6a4},
  temple:{set:"sanctum", wet:.91, floor:.43, stone:0x49314a, steel:0xa68186},
};
export const profileFor = id => profiles[id] || profiles.village;

function stoneGrain() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 96;
  const context = canvas.getContext("2d");
  const img = context.createImageData(96,96);
  let seed = 714977;
  const next = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for(let y = 0; y < 96; y++) {
    for(let x = 0; x < 96; x++) {
      const grain = Math.sin((x * .13 + y * .075) + Math.cos(y * .28) * .48);
      const chip = next() < .042 ? -54 : 0;
      const value = 161 + grain * 30 + next() * 48 + chip;
      const i = (y * 96 + x) * 4;
      img.data[i] = img.data[i+1] = img.data[i+2] = value;
      img.data[i+3] = 255;
    }
  }
  context.putImageData(img,0,0);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  return texture;
}

export class TideSet {
  constructor(scene) {
    this.root = new T.Group();
    scene.add(this.root);
    this.models = [];
    this.moving = [];
    const grain = stoneGrain();
    this.forms = {
      block:new T.BoxGeometry(1,1,1),
      column:new T.CylinderGeometry(.40,.52,1,7,1),
      drum:new T.CylinderGeometry(.5,.5,1,10,1),
      rock:new T.DodecahedronGeometry(.59,0),
      shard:new T.OctahedronGeometry(.6,0),
      ring:new T.TorusGeometry(.5,.054,6,40),
      plane:new T.PlaneGeometry(1,1),
    };
    this.stone = new T.MeshStandardMaterial({map:grain,bumpMap:grain,bumpScale:1.4,roughness:.83,flatShading:true});
    this.trim = new T.MeshStandardMaterial({map:grain,roughness:.39,metalness:.28,flatShading:true,emissiveIntensity:.11});
    this.glass = new T.MeshStandardMaterial({roughness:.25,metalness:.28,flatShading:true,emissiveIntensity:.24});
    this.coal = new T.MeshBasicMaterial({color:0xffe1a4});
    this.tide = new T.MeshBasicMaterial({color:0xabffee});
    this.shadow = new T.ShaderMaterial({
      uniforms:{tint:{value:new T.Color(0x080915)},strength:{value:.52}},
      vertexShader:planeVertex,fragmentShader:haloFragment,transparent:true,depthWrite:false,
    });
  }
  piece(group,shape,material,x,y,z,sx,sy,sz) {
    const mesh = new T.Mesh(this.forms[shape], material);
    mesh.position.set(x,y,z);
    mesh.scale.set(sx,sy,sz);
    group.add(mesh);
    return mesh;
  }
  anchor(x, y) {
    const group = new T.Group();
    this.models.push({group,x,y});
    this.root.add(group);
    return group;
  }
  contact(group,radius) {
    const shadow = this.piece(group,"plane",this.shadow,0,1,4,radius*2,radius*1.74,1);
    shadow.rotation.x = -Math.PI/2;
    shadow.renderOrder = 1;
  }
  pillar(group, height, tilt = 0) {
    this.contact(group,48);
    const body = new T.Group();
    body.rotation.z = tilt;
    group.add(body);
    this.piece(body,"block",this.stone,0,7,0,56,14,47).rotation.y = .11;
    this.piece(body,"drum",this.trim,0,16,0,48,8,43);
    this.piece(body,"column",this.stone,0,height*.51,0,41,height*.76,38);
    this.piece(body,"drum",this.trim,0,height*.87,0,44,9,41);
    this.piece(body,"drum",this.stone,0,height*.92,0,47,11,42).rotation.y = -.09;
    this.piece(body,"column",this.stone,0,height*.99,0,37,17,33);
    this.piece(body,"drum",this.trim,0,height*.985,0,38,3,35);
    const cap=this.piece(body,"shard",this.glass,0,height*1.055,0,12,height*.18,10);
    cap.rotation.y = .44;
    for(let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      this.piece(body,"block",this.trim,Math.cos(a)*16,height*.52,Math.sin(a)*15,3,height*.51,3);
    }
  }
  lantern(group, height, bright = false) {
    this.contact(group,39);
    this.piece(group,"rock",this.stone,0,6,0,41,16,34);
    this.piece(group,"column",this.stone,0,height*.30,0,13,height*.50,13);
    this.piece(group,"drum",this.trim,0,height*.54,0,22,5,22);
    this.piece(group,"drum",this.trim,0,height*.65,0,29,5,29);
    this.piece(group,"column",this.trim,0,height*1.17,0,23,13,23);
    this.piece(group,"shard",this.trim,0,height*1.29,0,8,14,8);
    const flame = this.piece(group,"shard",bright?this.tide:this.coal,0,height*.90,0,12,30,12);
    const crown = this.piece(group,"ring",this.trim,0,height*.83,0,38,38,27);
    crown.rotation.x = -Math.PI/2;
    for(let i=0;i<4;i++){
      const a = i * Math.PI / 2 + .73;
      this.piece(group,"block",this.trim,Math.cos(a)*12,height*.90,Math.sin(a)*12,2.3,height*.41,2.3);
    }
    this.moving.push({object:flame, y:flame.position.y, speed:.72, phase:height*.17, rise:2.5});
  }
  cluster(group, size, direction) {
    this.contact(group,size*.53);
    this.piece(group,"rock",this.stone,0,8,0,size*1.15,29,size*.74).rotation.y = direction;
    for(let i = 0; i < 4; i++) {
      const side = i - 1.5;
      const tall = size * (.68 + Math.sin(i*2.5 + direction) * .27);
      const gem = this.piece(group,"shard",i%3===0?this.trim:this.glass,side*size*.21,tall*.47,Math.sin(i*5)*15,17+i*3,tall,20);
      gem.rotation.set(side * .12, i * 1.75, side * -.20);
    }
  }
  rubble(group, side, type) {
    this.contact(group,49);
    for(let i=0;i<6;i++){
      const s = 24 + 15*Math.sin(i*1.46 + side);
      const shape = type==="vault"&&i%2===0?"block":"rock";
      const piece = this.piece(group,shape,i%3===0?this.trim:this.stone,(i-2.5)*13,5+i%3*7,(i%2-.5)*22,s,12+s*.66,s*.87);
      piece.rotation.set(i*.14,i*.74,side*.09*i);
    }
  }
  branches(group, side) {
    this.contact(group,57);
    for(let i=0;i<6;i++){
      const s = 22+i*11;
      const branch = this.piece(group,"column",i%2?this.stone:this.trim,side*(i*7-17),s*.43,i%3*12,7+i,s,8+i);
      branch.rotation.z = side * (.4-i*.15);
      branch.rotation.x = (i%2-.5)*.65;
      this.piece(group,"shard",this.glass,side*(i*10-20),s*.70,i%3*12,10,17,9);
    }
  }
  reliquary(group, large) {
    this.contact(group,75);
    this.piece(group,"drum",this.stone,0,8,0,105,16,78);
    this.piece(group,"drum",this.trim,0,20,0,80,12,61);
    this.piece(group,"drum",this.stone,0,29,0,58,10,45);
    const y = large?101:68;
    const size = large?116:81;
    const cage = this.piece(group,"ring",this.trim,0,y,0,size,size,20);
    cage.rotation.y = .27;
    const inset = this.piece(group,"ring",this.glass,0,y,0,size*.85,size*.85,15);
    const core = this.piece(group,"shard",this.glass,0,y,0,size*.31,size*.54,size*.23);
    const wick = this.piece(group,"shard",this.tide,0,y-2,8,size*.14,size*.36,size*.12);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const point=this.piece(cage,"shard",i%2?this.trim:this.tide,Math.cos(a)*.49,Math.sin(a)*.49,0,.080,.12,.24);
      point.rotation.z=a-Math.PI/2;
    }
    this.moving.push({object:cage,y,speed:.22,phase:.3,rise:2.3});
    this.moving.push({object:inset,y,speed:-.38,phase:1.6,rise:2.3});
    this.moving.push({object:core,y,speed:.61,phase:0,rise:5});
    this.moving.push({object:wick,y:y-2,speed:-.48,phase:0,rise:5});
  }
  dress(id, palette) {
    const profile = profileFor(id);
    this.root.clear();
    this.models.length = 0;
    this.moving.length = 0;
    this.stone.color.setHex(profile.stone);
    this.trim.color.setHex(profile.steel);
    this.trim.emissive.setHex(profile.steel);
    this.glass.color.setHex(palette.cool);
    this.glass.emissive.setHex(palette.cool);
    this.coal.color.setHex(palette.warm).multiplyScalar(1.37);
    this.tide.color.setHex(palette.cool).lerp(new T.Color(0xffffff),.33).multiplyScalar(1.28);
    const type = profile.set;
    for(const side of [-1,1]) {
      const edge = side<0?.060:.940;
      const rear = this.anchor(edge,profile.floor+.085);
      if(id==="village")this.branches(rear,side);
      else if(type==="crystal")this.cluster(rear,113,side);
      else if(type==="coast"||type==="grove")this.branches(rear,side);
      else this.pillar(rear,type==="sanctum"?185:128,side*.035);
      const sconce = this.anchor(side<0?.182:.818,profile.floor+.10);
      this.lantern(sconce,type==="vault"?82:65,type==="crystal"||side>0);
      const front = this.anchor(side<0?.015:.985,.84 + (side>0?.026:0));
      if(type==="crystal"||type==="sanctum")this.cluster(front,105,side);
      else if(type==="grove")this.branches(front,side);
      else this.rubble(front,side,type);
    }
    if(id==="village")this.reliquary(this.anchor(.5,.305),false);
    if(id==="temple")this.reliquary(this.anchor(.5,.442),true);
  }
  layout(width) {
    const compact = Math.min(1, .37 + width/940);
    for(const {group,x,y} of this.models) {
      group.position.set((x-.5)*width,0,pointZ(y));
      group.scale.setScalar(compact);
    }
  }
  update(time, still) {
    for(const {object,y,speed,phase,rise} of this.moving) {
      object.position.y = y + (still?0:Math.sin(time*2.3+phase)*rise);
      object.rotation.y = phase + (still?0:time*speed);
    }
  }
}
