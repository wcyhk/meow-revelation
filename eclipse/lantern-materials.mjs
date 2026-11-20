import * as T from '../three.min.mjs';
import {lanternDesign} from './lantern-designs.mjs';
import {forgeEnvironment} from './pao-materials.mjs?v=nightforge-1';
import {scannedSurface} from './sculpt-material.mjs?v=sculpted-1';
import {etchedMetal} from './lantern-geometry.mjs';

export function forgedMaterials(weapon){
  const {palette,seed}=lanternDesign(weapon),[,light,dark,body,trim]=palette;
  const hue=(seed%13-6)*.003;
  const finish=(color,metalness,roughness,glow=0)=>{
    const material=new T.MeshStandardMaterial({color:new T.Color(color).offsetHSL(hue,0,0),metalness,roughness,
      envMap:forgeEnvironment(),envMapIntensity:.85,...scannedSurface(metalness>.4?'hammered':'leather',.23),
      emissive:light,emissiveIntensity:glow});
    material.userData.restGlow=glow;return metalness>.4?etchedMetal(material):material;
  };
  return {dark:finish(dark,.18,.73),body:finish(body,.64,.38),trim:finish(trim,.78,.29),
    edge:finish(0xe8dfca,.83,.24),patina:finish(dark,.64,.59),hardened:finish(body,.86,.28,.035),
    core:finish(light,.31,.23,.72)};
}
