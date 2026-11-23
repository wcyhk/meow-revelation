/*!
00GameDevs exported assets — original code only
This license applies only to original code delivered by the VFX, Shader and Object copy/download functions. Website UI code, branding, avatars and promotional images are not licensed by this notice. Third-party code retains its own copyright and license.

The MIT License

Copyright (c) 2026 00GameDevs (@00vchannel)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Third-party dependency: Three.js (including its addons).
Keep the notices supplied with each dependency when distributing your game.
The notice below does not replace any additional notices in imported modules.

The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// 聖遺物・治癒降臨 / Sacred Relic Descent
// 替換模型 / Replace the model after loading (for example with GLTFLoader):
// const fx = createVFX(); scene.add(fx.group);
// const installedModel = fx.setObject(gltf.scene); // auto-fit height 3, bottom-center at contact
// Optional: fx.setObject(gltf.scene, { height: 3, rotation: [0, 0, Math.PI] }); // radians, before fitting
// fx.setObject(null); // restore the built-in pyramid
// The installed copy inherits descent, burial, fade, cancel and replay. Original model/materials are not modified.
// Geometry/textures stay shared and caller-owned; effect.dispose() only releases cloned materials/skeleton resources.
// Standard mesh materials only; custom shaders/hooks, lines, sprites and points are rejected before replacing the current model.
// Skinned models must include all bones. Animation clips are not started automatically; use installedModel with your mixer.
// Lit materials need your scene lights. Installed copies do not cast shadows. Late replacement preserves current playback time; call reset() to replay.
// Five-layer holy sigil: 36 outer glyphs, 32 inner glyphs, 12 small seals, geometric web and four orbiting emblems. All rotation and reveal use the shared clock; no external textures.
// 聖遺物・治癒降臨：三角錐占位版 / Triangular-pyramid placeholder edition.
// Closed downward-pointing triangular pyramid: three white side faces, one white triangular top, gold edges and built-in facet shading. Height 3; top width 1.96 and depth 1.6974; tip at local origin. After contact at 1.35s, the tip penetrates 0.6 units over 0.08s; built-in body materials hide below local ground. No wings or sculpted relic model. Ground waves use flowing water patterns; impact has five pressure ridges within radius 4.5 and 5x debris (120 default / 240 max), without extending its range or timing.
// +Y up, XZ flat ground, group origin is the impact point. Triangle height is 3 local units.
// At speed 1: circle 0-1s, accelerating descent 1-1.35s, contact at 1.35s.
// Five paired waves at 3.35/5.35/7.35/9.35/11.35s: ground light plus a hollow magic-smoke ring anchored at y=1.5 with 5x vertical thickness. Each lasts 1.6s; complete at 13s.
// Default healing radius 9. spread (0.5-1.5) changes both healing wave radii, not their heights, the impact or timing.
// Circle, contact flash and healing waves use 5x linear light gain; neutral dust and rocks do not.
// size scales the whole effect; density changes only decorative particles; detail changes runes/flow.
// Continue update(deltaSeconds) until finished. reset preserves transform/settings and deterministic seed.
// stop prevents new impact/pulses and fades existing visuals within 0.45 visual seconds.
// hit is a compatibility alias for stop, never a collision or healing trigger.
// No actual healing, collision detection, terrain deformation, camera motion, sound or required postprocessing.
// Three.js 0.187.0 / WebGL2 / SRGBColorSpace / NoToneMapping
// 將 group 加入場景，在既有遊戲循環呼叫 update(deltaSeconds)，結束時 dispose()。
// 持續 update 至 finished 後 dispose()；phase 提供階段。reset() 保留目前位置。
// 單次效果自行結束；不包含碰撞判斷或網站自動展示排程。
// size 控制核心或草葉尺寸；speed 控制視覺動畫速度；detail 控制裝飾或筆觸強度。
// quantity 僅用於支援款的主體總數／每輪數量；density 控制裝飾粒子或植被密度。
// spread 僅用於支援款的散布範圍，預設值見 defaultOptions；不改主體大小、數量或演出時間。
// 無外部貼圖；Fireball 的 render 包含光暈合成，其他素材依各自說明。不同渲染設定可能影響外觀。

import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-425eeb97bf8b8465.mjs';
const createEffect = __vfxModule.createEffect;


const preset = {
  "id": "sacred-relic-descent",
  "name": "聖遺物・治癒降臨",
  "english": "Sacred Relic Descent",
  "category": "area",
  "kind": 2,
  "variant": 18,
  "schools": [
    "light"
  ],
  "color": "#f5cc75",
  "seed": 829652,
  "duration": 13,
  "burst": true,
  "maxParticles": 416,
  "defaultDensity": 0.5,
  "lifecycle": {
    "start": 1.35,
    "end": 1.65
  },
  "previewTime": 3.85,
  "thumbnailTime": 3.85,
  "spread": {
    "min": 0.5,
    "max": 1.5,
    "default": 1,
    "label": "治療光波範圍",
    "help": "一起調整貼地光波與中段煙浪的範圍，不改高度、三角錐、砸地或時間。"
  },
  "description": "多層白金法陣旋轉，三角錐砸地揚石，每兩秒推出水紋光波與中段煙浪。",
  "tags": "聖遺物 治癒 白金 三角錐 暫代 召喚 落地 光波 魔法陣 碎石 塵浪 地裂 中段 煙浪 雙層 sacred relic healing holy triangular pyramid tetrahedron placeholder summon descent pulse debris dust cracks mid-height magic smoke ring two-layer"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#f5cc75",
  "size": 1,
  "density": 0.5,
  "spread": 1
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
