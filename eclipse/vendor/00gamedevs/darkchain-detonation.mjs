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
// 闇鏈崩陣 / Darkchain Sigil Rupture
// 闇鏈崩陣 / Darkchain Sigil Rupture
// A local 1.5-second neutral refraction pulse rebounds ten times at detonation, with stronger exponential damping and a smooth opacity tail; the last few rebounds are deliberately softer. Its radius remains fixed at 4.2 * size, and the entire lens fades smoothly; displacement power is reduced to 30 percent of the stronger revision. Native transmission captures opaque scene content only; transparent VFX are not in that capture. Scene complexity affects capture cost.
// Chains and flying links use instanced procedural billboard sprites: black ring pixels write depth, holes are discarded, and purple halos do not write depth.
// Local origin is the lower circle center; +Y is up. Upper circle height: 4.4 * size; radii: lower 2.3, upper 6.21 times size (upper diameter increased by 35 percent).
// 5.15-second single shot: circles, twelve independently growing chains, inward black aura, thirty absorption pulses, detonation.
// speed scales the complete timeline; density changes only decorative particles.
// Six separate chains grow downward and six upward, each reaching its own distinct endpoint on the opposite sigil. Strands never splice together: each grows along a bowed path, all connect by 0.85s, then jointly tighten with a damped rebound and settle straight by 1.25s. Link spacing and shape stretch with the curve; anchors stay fixed. At 3.65s the final pulse immediately releases the blast, launching 252 short black energy jets to radius 4.2 in 0.08s; curved open ribbons stretch outward with torn flowing edges, then their motion eases out and their tails fade over 1.30s. Six surface discharge groups (one fork each) keep a fixed path for 50-90ms, brighten for 40ms on release, and extinguish by 160ms. A cyan-violet membrane visibly churns and deforms around dark cavities, using continuous time-driven advection independent of the thirty scale pulses; a thick black traveling wave outline flows around the core in the same opaque pass; its contour deformation and wave amplitude are five times stronger, with the black band bounded to keep the center visible. Black chain bodies occlude an expanded back-face purple halo, keeping the bloom outside their silhouette; no screen-space bloom pass is required. Fifty-four primary jets and 198 quieter supports share the existing two passes. Sixteen outer brush strokes and twelve inward trails reuse two batches, with a doubled 7.8–10.1 * size starting radius distributed over a full spherical volume above, below, in front and behind the core. Ink moves continuously inward from its appearance, easing from slow to fast through an independently tilted, single-direction 1–2-turn spiral per stroke. There is no orbit-only wait or per-cycle respawn; tails follow prior inward positions and remain independent of orb pulses. Thirty-six fine independent branched black-purple discharges cover the lower sigil interior, with area-distributed roots up to 94.6 percent of its radius for 70-110ms each, using one preallocated batch. On detonation, these same strips scatter into short 0.48-1.10-unit lightning fragments around radius 3.1-5.15; they flicker independently for 1.30s instead of connecting back to the center. Chains connect in 0.40s (0.45-0.85s). Sigils have transparent gaps, black strokes and a purple corona in the same two passes. Twenty-four original stroke glyphs form two varied magic-text rings, with triangular construction, concentric tracks, diamonds and corner engravings. No filled black backing or external font/texture is used. Their motion histories are twice as long, with stronger inward rotation, narrower solid ink bodies and velocity-aligned heads; they use their own clock rather than orb pulses. A black hand-brushed pressure sheet (4.3 * size wide, 0.18 * size thick) uses radial opacity gradients and a deeply torn, fine-grained perimeter with radial dry-brush streaks. It expands from the orb center (y = 2.24 * size) toward radius 10.6 * size with a 0.80s quintic ease-out while fading over the same 0.80s; allow 10.9 * size of horizontal framing. Explosion jet count is tripled again (84 to 252; nine times the initial 28) and length is one fifth of the previous length; widths stay at one quarter, with outward range preserved. Incoming ink trail widths are halved, and the joint chain recoil is larger and lasts 0.40s. Fractures propagate from the nearest impact point toward both chain ends within 0.12s, throwing differently sized chain fragments outward. Detached chunks are scaled to 50 percent (another 29 percent reduction) and receive a 6.4 outward impulse (about 30 percent farther than the previous revision). Explosion debris has a black body and a soft purple corona in one pass. Both particle streams align with their projected velocity; inward particles use an independent clock and a fixed center destination, not the pulsing orb radius. Density never changes chains or the thirty pulses; no textures, postprocessing, character or scene are included.
// Call update(deltaSeconds) until finished; reset() replays at the current transform.
// stop() follows the existing single-shot contract and does not interrupt the sequence.
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
  "id": "darkchain-detonation",
  "name": "闇鏈崩陣",
  "english": "Darkchain Sigil Rupture",
  "category": "area",
  "kind": 2,
  "variant": 14,
  "schools": [
    "dark"
  ],
  "color": "#8300ff",
  "seed": 829645,
  "duration": 5.15,
  "burst": true,
  "maxParticles": 384,
  "defaultDensity": 0.5,
  "lifecycle": {
    "start": 0.45,
    "end": 1.35
  },
  "previewTime": 3.3,
  "thumbnailTime": 3.3,
  "description": "魔法陣把鎖鏈和煙吸向黑球，黑球縮小後炸開，震散鎖鏈並噴出紅紫閃電。",
  "tags": "闇鏈 聚爆 黑暗 紫色 魔法陣 鎖鏈 聚集 蓄力 脈動 能量球 爆炸 darkchain detonation dark purple lightning discharge magic circle sigil chains charge pulse orb explosion 暗能 雷裂 電弧 壓力波 闇鏈聚爆 Darkchain Detonation"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#8300ff",
  "size": 1,
  "density": 0.5
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
