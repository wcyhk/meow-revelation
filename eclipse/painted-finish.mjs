import * as T from '../three.min.mjs';

const finishes={iron:[.38,.39],bronze:[.44,.52],bone:[.29,.20],cloth:[.29,.08],hide:[.39,.13],stone:[.32,.21],gem:[.16,.45]};
const surfaceKinds=Object.keys(finishes);

export function paintedFinish(material,kind,sculpted=false){
  const [pigment,shine]=finishes[kind];
  const before=material.onBeforeCompile;
  const program=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>program+'|painted-finish'+(sculpted?'|sculpted-'+kind:'');
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
      ${sculpted ? `
        const int surfaceKind=${surfaceKinds.indexOf(kind)};
        float pits=paintGrain(q*vec3(29.4,39.4,32.2));
        float fine=(pits-.5)*.30;
        float relief=.0;
        if(surfaceKind<=1){
          float rubbed=smoothstep(.38,.72,mottles);
          float oxide=(1.-rubbed)*smoothstep(.41,.77,pits);
          relief=oxide*.23-scratches*.35;
          vec3 copper=surfaceKind==1?vec3(.035,.078,.062):vec3(.053,.068,.087);
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.49+copper*.67,oxide*.43);
          diffuseColor.rgb+=rubbed*scratches*paintHighlight*.077;
        }else if(surfaceKind==2){
          float lamina=pow(.5+.5*sin(q.y*89.+q.z*14.+wash*4.3),7.);
          relief=.08*lamina-pits*.028;
          diffuseColor.rgb*=.93+fine-lamina*.092;
        }else if(surfaceKind==3){
          float yarn=sin(q.x*148.+q.z*70.)*sin(q.y*137.-q.z*31.+wash);
          relief=.095*patina;
          diffuseColor.rgb*=.97+fine+yarn*.063;
        }else if(surfaceKind==4 || surfaceKind==5){
          relief=.13*patina-fine;
          diffuseColor.rgb*=.98+fine;
        }else{
          relief=-.15*ridge+.12*patina;
          diffuseColor.rgb+=pow(ridge,3.)*paintHighlight*.027;
        }
      ` : ''}
    `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+wash*paintPigment*.19+patina*.24-scratches*paintShine*.29-flecks*paintShine*.22${sculpted?'+relief':''},.2,1.0);`);
  };
  return material;
}
