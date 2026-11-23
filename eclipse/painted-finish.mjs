import * as T from '../three.min.mjs';

const finishes={iron:[.38,.39],bronze:[.44,.52],bone:[.29,.20],cloth:[.29,.08],hide:[.39,.13],stone:[.32,.21],gem:[.16,.45]};
const surfaceKinds=Object.keys(finishes);

export function paintedFinish(material,kind,sculpted=false,weathered=false){
  weathered=weathered&&sculpted;
  const [pigment,shine]=finishes[kind];
  const before=material.onBeforeCompile;
  const program=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>program+'|painted-finish'+(sculpted?'|sculpted':'')+(weathered?'|weathered':'');
  material.onBeforeCompile=shader=>{
    before.call(material,shader);
    shader.uniforms.paintPigment={value:pigment};
    shader.uniforms.paintShine={value:shine};
    shader.uniforms.paintSurface={value:surfaceKinds.indexOf(kind)};
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
      uniform int paintSurface;
      uniform vec3 paintShadow,paintHighlight;
      float paintHash(vec3 p){
        p=fract(p*vec3(.1031,.11369,.13787));
        p+=dot(p,p.yzx+19.19);
        return fract((p.x+p.y)*p.z);
      }
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
        int surfaceKind=paintSurface;
        float pits=paintGrain(q*vec3(29.4,39.4,32.2));
        float fine=(pits-.5)*.30;
        float relief=.0;
        if(surfaceKind<=1){
          float rubbed=smoothstep(.38,.72,mottles);
          float oxide=(1.-rubbed)*smoothstep(.41,.77,pits);
          relief=oxide*.23-scratches*.35;
          vec3 copper=surfaceKind==1?vec3(.035,.078,.062):vec3(.053,.068,.087);
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.49+copper*.67,oxide*.43);
          float brushed=sin(q.y*113.0+q.z*147.0+q.x*8.1);
          float wear=smoothstep(.26,.83,mottles)*(.41+.59*ridge);
          diffuseColor.rgb+=rubbed*scratches*paintHighlight*.077;
          diffuseColor.rgb*=1.0+wear*(.075*brushed+.044);
          relief-=wear*.055;
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
          float facets=abs(sin(q.x*24.+q.z*21.+sin(q.y*18.)*.45));
          float inclusion=smoothstep(.66,.98,facets)*smoothstep(.32,.65,mottles);
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.22+paintHighlight*.034,inclusion*.34);
          diffuseColor.rgb+=pow(ridge,3.)*paintHighlight*.048;
        }
      ` : ''}
      ${weathered ? `
        float paintPixel=length(fwidth(q));
        float fineDetail=1.0-smoothstep(.013,.045,paintPixel);
        float elevation=0.0,wornMetal=0.0,surfaceWear=0.0;
        if(surfaceKind<=1){
          float dents=smoothstep(.48,.81,pits)*smoothstep(.26,.73,mottles);
          float polish=smoothstep(.48,.79,mottles)*(.38+ridge*.62);
          float scoringEdge=smoothstep(.76,.975,scoring)*smoothstep(.44,.73,pits);
          wornMetal=polish-dents*.45;
          surfaceWear=dents*.17-polish*.28-scoringEdge*.14;
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.47+paintShadow*.09,dents*.49);
          diffuseColor.rgb+=paintHighlight*scoringEdge*(.048+polish*.12);
          elevation=.0019*(polish-dents*.75)-scoringEdge*.00064;
        }else if(surfaceKind==3){
          float warp=sin(q.x*166.+q.z*43.+wash*3.);
          float weft=sin(q.y*197.+q.z*69.);
          float thread=warp*weft;
          diffuseColor.rgb*=.974+thread*.058*fineDetail+patina*.023;
          elevation=.0011*thread;
        }else if(surfaceKind<6){
          elevation=.0020*(pits-patina*.42);
        }
      ` : ''}
    `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+wash*paintPigment*.19+patina*.24-scratches*paintShine*.29-flecks*paintShine*.22${sculpted?'+relief':''}${weathered?'+surfaceWear':''},.2,1.0);`);
    if(weathered){
      shader.fragmentShader=shader.fragmentShader
        .replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
          metalnessFactor=clamp(metalnessFactor*(1.0+wornMetal*.27),0.0,1.0);`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          vec3 paintDx=dFdx(-vViewPosition),paintDy=dFdy(-vViewPosition);
          vec3 paintU=cross(paintDy,normal),paintV=cross(normal,paintDx);
          float paintJacobian=dot(paintDx,paintU);
          normal=normalize(max(abs(paintJacobian),1e-9)*normal-
            sign(paintJacobian)*fineDetail*(dFdx(elevation)*paintU+dFdy(elevation)*paintV));`);
    }
  };
  return material;
}
