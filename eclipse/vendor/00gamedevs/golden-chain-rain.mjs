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
// 金鏈驟雨 / Golden Chain Rain
// 金鏈驟雨 / Golden Chain Rain
// Single shot: three waves at 0, 1.1 and 2.2 visual seconds; complete by 7.5 seconds.
// Local origin is the ground center, +Y is up, and impact points lie on local y = 0.
// quantity is chains per wave (1-12, default 8); each wave launches across 0.4 seconds.
// Each chain travels for 0.35s, holds for 0.75s, erodes for 0.75s, then clears its final sparks within 0.35s.
// size scales the whole effect once. spread changes horizontal layout only; density changes decorative chips only.
// spriteChains (boolean, default true) switches only links and their thin halos to instanced axis-aligned sprite rings. Endpoint clipping uses the rendered positions at the source, arrow tail and ground; no cut across interpolated corner flags. Keeps flowing liquid patterns and timing; close-up depth is approximate. setOptions switches at the current time; reset preserves the mode.
// textureDensity controls chain-surface pattern density (0.25-3, default 0.7); independent of particle density and chain count.
// Dark ochre sprite links preserve holes and depth occlusion; solid 3D links remain optional; irregular golden liquid contours continuously flow and deform across the links. Separate thin halos need no bloom pass.
// Only aerial source endpoints carry golden water; no ground ripples or impact flash. Eight yellow-gold fissures per contact use a separate rounded, soft local bloom layer without scene capture or a required full-screen pass. They reveal outward in 0.18s and remain for 3s from each contact, including a final 0.3s fade. Rising crack chips are 8x the previous allocation (616 default / 1232 maximum), preserving erosion chips (179 / 358). Existing decorative capacity is 1590; each rising chip lives 1.95s (200% longer), with movement halved again to 25% of the original. After its existing 0.105s fade-in, each chip keeps full size and brightness through age 1.6s, then fades opacity over 0.35s without shrinking. The same fixed pool recycles after each full life, stops births by 3s from contact, and lets existing chips fade naturally; all chips clear by 7.45s. Spin, pool size and impact shards are unchanged. Impact shard size is 0.5x the initial burst version (visible length about 0.04-0.08 local units); count, paths and timing are unchanged. Separate golden impact shards burst within 0-0.025s of contact, arc outward and fall before 0.65s: 3-24 per contact, 12 default. Total 1083 default / 2454 global maximum, preserving the previous chip counts. No terrain deformation.
// Aerial ripple cores, soft edges and halos fade together over strand ages 1.10-1.55s, retaining the held size and peak opacity. Golden water uses fine irregular moving ripples, opaque white-gold centers, soft outer edges and misty local bloom; no scene capture or refraction.
// Glowing chips peel from the progressing erosion band; density changes erosion, rising and impact chips only, never source ripples, arrows or ground cracks.
// Call update(deltaSeconds) in the existing game loop until finished; reset replays the same seeded layout at the current transform.
// stop follows the single-shot contract and does not interrupt the cast. hit is a compatibility method, not terrain or damage detection.
// Arrowheads share the chain dark-gold base, animated irregular liquid texture and textureDensity/detail/color controls; arrow facets use continuous model-space texture sampling at 3x their previous spatial density; chain density and time coefficients are unchanged.
// Solid gold arrowheads lead the attached chain without piercing. Contact at 0.35s is followed by a 0.08s ease-out penetration of 0.32 along the flight axis (half the 0.64 arrow length). Both link modes remain attached to the arrow tail. Arrowheads stay fixed, then erode with the chain; all buried surfaces clip at local y=0.
// Impact rebound amplitude is doubled from the previous revision (six times the initial version); contact timing, frequency and damping are unchanged.
// No terrain fitting, character binding, physics, external textures, extra postprocessing, camera or extra animation loop is included.
// Three.js 0.187.0 / WebGL2 / SRGBColorSpace / NoToneMapping
// 將 group 加入場景，在既有遊戲循環呼叫 update(deltaSeconds)，結束時 dispose()。
// 建立後起始 → 持續；由遊戲碰撞呼叫 hit(worldPosition?, worldNormal?)，或 stop() 自然收尾。
// hit() 預設從彈體前端觸發；指定世界座標時將前端對準接觸點，根物件中心可能偏移。
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
  "textureDensity": {
    "min": 0.25,
    "max": 3,
    "default": 0.7
  },
  "crackBloom": {
    "min": 0,
    "max": 5,
    "default": 0.15
  },
  "crackBloomSpread": {
    "min": 0.25,
    "max": 3,
    "default": 1
  },
  "id": "golden-chain-rain",
  "name": "金鏈驟雨",
  "english": "Golden Chain Rain",
  "category": "area",
  "kind": 2,
  "variant": 15,
  "schools": [
    "light"
  ],
  "color": "#ffd166",
  "seed": 829647,
  "duration": 7.5,
  "burst": true,
  "maxParticles": 2454,
  "defaultDensity": 0.5,
  "lifecycle": {
    "start": 0.35,
    "end": 1.1
  },
  "previewTime": 1.65,
  "thumbnailTime": 1.65,
  "quantity": {
    "min": 1,
    "max": 12,
    "default": 8,
    "label": "每波鎖鏈數量",
    "unit": "條",
    "help": "每波落下的鎖鏈條數，固定連續三波；裝飾密度不會減少鎖鏈或鏈節。"
  },
  "spread": {
    "min": 0.5,
    "max": 2,
    "default": 1,
    "label": "落點散布範圍",
    "help": "拉開鎖鏈起點與落點的水平間距；鏈節粗細、落下高度與演出時間不變。"
  },
  "description": "金鏈連落三波，箭頭插地炸出金色碎片；地裂散出柔光，碎片沿裂縫緩緩浮起。",
  "tags": "金鏈 鎖鏈 驟雨 聖光 金色 落擊 三波 範圍 地裂 插地 漣漪 水波 碎片 golden chain rain holy light gold cracks embedded arrows ripples fragments"
};
export const defaultOptions = {
  "spriteChains": true,
  "speed": 1,
  "detail": 1,
  "color": "#ffd166",
  "size": 1,
  "density": 0.5,
  "crackBloomSpread": 1,
  "crackBloom": 0.15,
  "textureDensity": 0.7,
  "quantity": 8,
  "spread": 1
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
