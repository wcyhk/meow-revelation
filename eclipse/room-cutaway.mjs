import * as T from '../three.min.mjs';

const windows=new WeakMap();

export class RoomCutaway {
  constructor() {
    this.focus={value:new T.Vector3()};
    this.sight={value:new T.Vector3(0,.73,.683)};
    this.enabled={value:0};
  }

  place(x,z,direction) {
    this.focus.value.set(x,1.04,z);
    this.sight.value.copy(direction);
    this.enabled.value=1;
  }

  cover(root) {
    root.traverse(node=>{
      if(node.isMesh&&node.userData.cover!==false){
        for(const material of Array.isArray(node.material)?node.material:[node.material]){
          this.material(material);
        }
      }
    });
  }

  material(material) {
    if(!material||material.isShaderMaterial||windows.has(material))return material;
    windows.set(material,this);
    const previous=material.onBeforeCompile,cacheKey=material.customProgramCacheKey();
    material.customProgramCacheKey=()=>cacheKey+'|lantern-cutaway';
    material.onBeforeCompile=shader=>{
      previous.call(material,shader);
      shader.uniforms.lanternFocus=this.focus;
      shader.uniforms.lanternSight=this.sight;
      shader.uniforms.lanternCutaway=this.enabled;
      shader.vertexShader='varying vec3 lanternLocalPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
        vec4 coverPosition=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          coverPosition=instanceMatrix*coverPosition;
        #endif
        lanternLocalPosition=(modelMatrix*coverPosition).xyz;
        #include <project_vertex>
      `);
      shader.fragmentShader=`
        varying vec3 lanternLocalPosition;
        uniform vec3 lanternFocus,lanternSight;
        uniform float lanternCutaway;
      `+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`
        #include <alphatest_fragment>
        if(lanternCutaway>.5 && lanternLocalPosition.y>.17){
          vec3 offset=lanternLocalPosition-lanternFocus;
          float depth=dot(offset,lanternSight);
          vec3 plane=offset-lanternSight*depth;
          float distanceToHero=length(vec2(plane.x,length(plane.yz)*.69));
          if(depth>.08 && distanceToHero<1.95){
            float edge=smoothstep(1.12,1.94,distanceToHero);
            float grain=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
            if(grain>edge)discard;
          }
        }
      `);
    };
    material.needsUpdate=true;
    return material;
  }
}
