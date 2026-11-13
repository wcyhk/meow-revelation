import * as T from '../three.min.mjs';

const finishes={iron:[.38,.39],bronze:[.44,.52],bone:[.29,.20],cloth:[.29,.08],hide:[.39,.13],stone:[.32,.21],gem:[.16,.45]};

export function paintedFinish(material,kind){
  const [pigment,shine]=finishes[kind];
  const before=material.onBeforeCompile;
  const program=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>program+'|painted-finish';
  material.onBeforeCompile=shader=>{
    before.call(material,shader);
    shader.uniforms.paintPigment={value:pigment};
    shader.uniforms.paintShine={value:shine};
    shader.uniforms.paintShadow={value:new T.Color(0x293345)};
    shader.uniforms.paintHighlight={value:new T.Color(0xfbe0b5)};
    shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
      varying vec3 vPaintPoint;
      varying vec3 vPaintNormal;`).replace('#include <begin_vertex>',`#include <begin_vertex>
      vPaintPoint=position;
      vPaintNormal=normal;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vPaintPoint;
      varying vec3 vPaintNormal;
      uniform float paintPigment,paintShine;
      uniform vec3 paintShadow,paintHighlight;
      float paintHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float paintGrain(vec3 p){
        vec3 cell=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        vec4 a=vec4(paintHash(cell),paintHash(cell+vec3(1,0,0)),paintHash(cell+vec3(0,1,0)),paintHash(cell+vec3(1,1,0)));
        vec4 b=vec4(paintHash(cell+vec3(0,0,1)),paintHash(cell+vec3(1,0,1)),paintHash(cell+vec3(0,1,1)),paintHash(cell+vec3(1,1,1)));
        vec4 c=mix(a,b,f.z);
        return mix(mix(c.x,c.y,f.x),mix(c.z,c.w,f.x),f.y);
      }`).replace('#include <color_fragment>',`#include <color_fragment>
      vec3 q=vPaintPoint;
      vec3 brushN=normalize(vPaintNormal);
      float wash=sin(q.x*19.7+q.y*11.6+sin(q.z*8.4-q.y*3.0)*1.6)
        *cos(q.y*8.9+q.z*20.0);
      float strokes=sin(q.x*63.0+q.y*37.0+q.z*52.0+2.3*wash);
      float flecks=pow(.5+.5*sin(q.x*95.0-q.z*71.0+q.y*58.0)*cos(q.y*63.0+q.z*23.0),9.0);
      float upper=dot(brushN,normalize(vec3(-.37,.84,.40)));
      float mottles=paintGrain(q*vec3(13.5,10.2,14.))*.82+(.5+.5*strokes)*.18;
      float patina=1.0-smoothstep(.23,.68,mottles);
      float ridge=pow(max(0.0,upper),5.0);
      float scoring=sin(q.x*81.+q.y*216.+q.z*142.+wash*4.)*sin(q.y*39.+q.z*51.);
      float scratches=smoothstep(.73,.97,scoring)*(.21+ridge*.79);
      vec3 base=diffuseColor.rgb;
      diffuseColor.rgb*=1.0+paintPigment*(wash*.25+strokes*.042+upper*.41);
      diffuseColor.rgb=mix(diffuseColor.rgb,base*.55+paintShadow*.19,paintPigment*(1.0-smoothstep(-1.0,.35,upper)));
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.57+paintShadow*.10,patina*(.21+paintPigment*.31));
      diffuseColor.rgb+=paintHighlight*paintShine*(ridge*.12+scratches*.19+flecks*.032);
    `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+wash*paintPigment*.19+patina*.24-scratches*paintShine*.29-flecks*paintShine*.22,.2,1.0);`);
  };
  return material;
}
