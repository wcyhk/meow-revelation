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
// 金刃雷矢 / Golden-Bladed Lightning Arrow
// 金刃雷矢 / Golden-Bladed Lightning Arrow
// Local +X is forward; the arrow tip is x = 1.7 * settings.size.
// Charge: 1.2 visual seconds; hit/stop drain: 1.4 visual seconds.
// Four separated solid blades; 90-140 ms seeded leaders, shorter attached forks.
// Full ribbon envelopes: arrow radial 1.6 * size, impact radius 3.5 * size.
// Impact energy peaks at 5x for 12ms, then returns to normal by 90ms; range is unchanged.
// Heavy impact births stop at 0.45s; rings begin at 0.08s and 0.18s.
// Eight reusable draw layers; no new allocations on a discharge or replay.
// const fx = createVFX(); scene.add(fx.group);
// In your existing loop: fx.update(deltaSeconds);
// Once fx.phase === "active", call fx.setDirection(directionInParentSpace, travelSpeed).
// setDirection moves immediately; wait for active when charging at a fixed point.
// Your collision system calls fx.hit(worldContact, worldNormal).
// Continue update until finished; reset preserves transform/settings; dispose releases the effect.
// variationSeed is the read-only uint32 seed of this cast.
// reset() chooses a new variation; reset({ variationSeed: savedSeed }) reproduces one.
// Example: const savedSeed = fx.variationSeed; fx.reset({ variationSeed: savedSeed });
// Sampling the same cast must keep this seed; do not call unseeded reset every frame.
// The sigil stays at the release point and fades; stop fades without an impact.
// speed changes visual timing, not world travel speed. density affects decorative sparks only.
// The website target, target recoil, camera, controls and demo scheduling are excluded.
// No textures, postprocessing, collision detection or additional animation loop are included.
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
  "id": "electric-magic-arrow-strike",
  "name": "金刃雷矢",
  "english": "Golden-Bladed Lightning Arrow",
  "category": "projectile",
  "kind": 0,
  "variant": 7,
  "schools": [
    "storm"
  ],
  "color": "#ffd36a",
  "seed": 829646,
  "duration": 5,
  "burst": false,
  "maxParticles": 256,
  "defaultDensity": 0.5,
  "lifecycle": {
    "start": 1.2,
    "end": 1.4
  },
  "previewTime": 1.15,
  "thumbnailTime": 1.15,
  "description": "金色箭身纏著閃電往前飛，打中時炸出雷光與兩道光圈。",
  "tags": "雷光 魔箭 雷電 魔法箭 蓄力 命中 弓箭 投射物 電擊 電流 金色 electric magic arrow strike lightning charge impact projectile golden 雷光魔箭 Electric Magic Arrow Strike"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#ffd36a",
  "size": 1,
  "density": 0.5
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
