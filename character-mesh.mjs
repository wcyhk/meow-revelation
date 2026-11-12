import * as T from "./three.min.mjs";

export const JOINT_LIMIT = 24;

const forms = {
  orb:new T.SphereGeometry(1,10,7),
  round:new T.SphereGeometry(1,14,9),
  gem:new T.OctahedronGeometry(1,0),
  pebble:new T.IcosahedronGeometry(1,1),
  barrel:new T.CylinderGeometry(.84,1,1,9),
  spike:new T.ConeGeometry(1,1,8),
  box:new T.BoxGeometry(1,1,1),
  hoop:new T.TorusGeometry(1,.10,5,26),
};

export class FigureBuilder {
  constructor() {
    this.joints = [];
    this.positions = [];
    this.normals = [];
    this.colors = [];
    this.bindings = [];
    this.glow = [];
    this.wardrobe = [];
    this.indices = [];
    this.joint("core",null,[0,0,0]);
  }
  joint(name,parent,position) {
    if(this.joints.length>=JOINT_LIMIT)throw Error("Too many joints for "+name);
    const index = this.joints.length;
    this.joints.push({name,parent,position});
    return index;
  }
  shape(joint,form,position,scale,color,angles=[0,0,0],glow=0,gear=0) {
    const geometry = typeof form==="string"?forms[form]:form;
    const rotation = new T.Quaternion().setFromEuler(new T.Euler(...angles));
    const transform = new T.Matrix4().compose(new T.Vector3(...position),rotation,new T.Vector3(...scale));
    const normalMatrix = new T.Matrix3().getNormalMatrix(transform);
    const tone = new T.Color(color);
    const vertex = new T.Vector3();
    const normal = new T.Vector3();
    const base = this.bindings.length;
    const p = geometry.attributes.position, n = geometry.attributes.normal;
    for(let i=0;i<p.count;i++){
      vertex.fromBufferAttribute(p,i).applyMatrix4(transform);
      normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();
      this.positions.push(vertex.x,vertex.y,vertex.z);
      this.normals.push(normal.x,normal.y,normal.z);
      this.colors.push(tone.r,tone.g,tone.b);
      this.bindings.push(joint);
      this.glow.push(glow);
      this.wardrobe.push(gear);
    }
    const index = geometry.index;
    const length = index?.count || p.count;
    const order = scale[0]*scale[1]*scale[2]<0?[0,2,1]:[0,1,2];
    for(let i=0;i<length;i+=3){
      for(const offset of order){
        this.indices.push(base+(index?index.getX(i+offset):i+offset));
      }
    }
  }
  volume(joint,outline,position,scale,color,angles=[0,0,0],glow=0,gear=0) {
    const shape = new T.Shape();
    shape.moveTo(...outline[0]);
    for(const point of outline.slice(1)){
      if(point.length===2)shape.lineTo(...point);
      else if(point.length===4)shape.quadraticCurveTo(...point);
      else shape.bezierCurveTo(...point);
    }
    shape.closePath();
    const mesh = new T.ExtrudeGeometry(shape,{depth:1,curveSegments:5,bevelEnabled:true,bevelSegments:1,bevelSize:.034,bevelThickness:.16,steps:1});
    mesh.translate(0,0,-.5);
    this.shape(joint,mesh,position,scale,color,angles,glow,gear);
    mesh.dispose();
  }
  line(joint,points,radius,color,gear=0,glow=0) {
    const curve = new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const mesh = new T.TubeGeometry(curve,Math.max(5,points.length*3),radius,5,false);
    this.shape(joint,mesh,[0,0,0],[1,1,1],color,[0,0,0],glow,gear);
    mesh.dispose();
  }
  finish(style) {
    const geometry = new T.BufferGeometry();
    for(const [name,data,size] of [
      ["position",this.positions,3],["normal",this.normals,3],["pigment",this.colors,3],
      ["joint",this.bindings,1],["emission",this.glow,1],["gear",this.wardrobe,1],
    ])geometry.setAttribute(name,new T.Float32BufferAttribute(data,size));
    geometry.setIndex(this.indices);
    return {geometry,joints:this.joints,style};
  }
}

const vertex = `
  attribute float joint;
  attribute float emission;
  attribute float gear;
  attribute vec3 pigment;
  uniform mat4 bones[${JOINT_LIMIT}];
  uniform float weapon;
  uniform float forged;
  uniform float ink;
  varying vec3 surface;
  varying vec3 nWorld;
  varying vec3 towardCamera;
  varying float lit;
  varying float height;
  void main() {
    mat4 bone = bones[int(joint + .5)];
    vec4 p = bone * vec4(position, 1.0);
    vec3 normalHere = normalize(mat3(bone) * normal);
    p.xyz += normalHere * ink * .011;
    vec4 world = modelMatrix * p;
    vec4 view = viewMatrix * world;
    surface = pigment;
    lit = emission;
    height = p.y;
    nWorld = normalize(mat3(modelMatrix) * normalHere);
    towardCamera = normalize(cameraPosition - world.xyz);
    gl_Position = abs(gear) > .5 && (abs(abs(gear) - weapon) > .5 || (gear < -.5 && forged < .5))
      ? vec4(2.0, 2.0, 2.0, 1.0)
      : projectionMatrix * view;
  }
`;

const fragment = `
  uniform vec3 cool;
  uniform vec3 warm;
  uniform float hit;
  uniform float ink;
  uniform float ward;
  uniform float edge;
  varying vec3 surface;
  varying vec3 nWorld;
  varying vec3 towardCamera;
  varying float lit;
  varying float height;
  void main() {
    vec3 n = normalize(nWorld);
    float incidence = dot(n, normalize(vec3(-.55,.74,.49)));
    float soft = smoothstep(-.43,.61,incidence) * .59 + smoothstep(.36,.62,incidence) * .07;
    float rim = pow(1.0 - clamp(dot(n, normalize(towardCamera)),0.0,1.0),2.65);
    float ambient = smoothstep(.03, .94, height);
    vec3 shadow = vec3(.40,.42,.54) + cool * .17;
    vec3 light = vec3(1.16,1.06,1.02) + warm * .15;
    vec3 result = surface * mix(shadow,light,soft + .38 + ambient * .06);
    result += surface * lit * .68;
    float bounce = max(0.,dot(n,normalize(vec3(.56,-.29,-.64))));
    result += warm*bounce*.075 + (cool*.37 + vec3(.12,.13,.18)) * rim * (.27+ward*.44);
    result += min(vec3(.13),surface*.44) * smoothstep(.72,.94,incidence);
    result = mix(result,vec3(.018,.011,.029),smoothstep(.73,.99,rim)*edge*.84);
    result = mix(result, vec3(1.0,.52,.35), hit*.55);
    if(ink > .5) result = mix(vec3(.014,.009,.028),cool*.10,ward*.37);
    gl_FragColor = vec4(result,1.0);
    #include <colorspace_fragment>
  }
`;

export function figureMaterial(bones,cool,warm,outline) {
  return new T.ShaderMaterial({
    uniforms:{
      bones:{value:bones},cool:{value:cool},warm:{value:warm},ink:{value:outline?1:0},
      weapon:{value:0},forged:{value:0},hit:{value:0},ward:{value:0},edge:{value:0},
    },
    vertexShader:vertex,fragmentShader:fragment,side:outline?T.BackSide:T.FrontSide,
  });
}
