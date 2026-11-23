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
// 烈焰空爆 / Billowing Airburst
// 載入時預先建立所需實例並呼叫 fx.prewarm(renderer,camera)；同步準備，勿在起爆那一幀呼叫。
// Prepare instances during loading: fx.prewarm(renderer,camera), using the playback renderer.
// 播放完以 reset() 重用；離開場景才 dispose()。預熱不推進時間、不更換種子。
// Reuse finished instances via reset(); dispose only at teardown. Warmup preserves time and seed.
// Context restored or renderer/output changed: prewarm again before playback.
// 烈焰空爆 / Billowing Airburst
// 2.4 視覺秒的單次空中爆炸；建立後由 update(deltaSeconds) 立即推進，不需呼叫 hit()。
// A 2.4-visual-second airburst starts on update(deltaSeconds); hit() is not a trigger.
// 局部原點是爆心，+Y 朝上；所有圖層隨 size 同步縮放，沒有地面痕跡。
// Local origin is the blast center, +Y is up. size scales every layer; no ground effect is included.
// quantity 控制 2–6 條主煙尾（預設 4）；density 只改裝飾火星。
// quantity selects 2–6 smoke jets (default 4); density changes decorative embers only.
// detail 控制表面起伏與紋理強度；speed 控制完整演出的時間。
// detail controls surface billowing and texture strength; speed scales the full timeline.
// 在遊戲既有迴圈持續 update 至 finished，再 dispose；reset 保留位置、方向、設定，並產生新的隨機煙尾。
// Continue your existing update loop until finished, then dispose. reset preserves transform/settings and samples new smoke jets.
// 讀取 variationSeed；reset({variationSeed}) 可精確重播同一爆炸，倒帶時使用同一種子。
// Read variationSeed and pass reset({variationSeed}) to reproduce one burst, including timeline seeks.
// No textures, scene capture, required postprocessing, collision logic or separate animation loop.
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
  "id": "billowing-airburst",
  "name": "烈焰空爆",
  "english": "Billowing Airburst",
  "category": "burst",
  "kind": 3,
  "variant": 11,
  "schools": [
    "fire"
  ],
  "color": "#ff7a24",
  "seed": 829648,
  "duration": 2.4,
  "burst": true,
  "renderStyle": "toon",
  "maxParticles": 128,
  "defaultDensity": 0.5,
  "lifecycle": {
    "start": 0.15,
    "end": 1.8
  },
  "previewTime": 0.22,
  "thumbnailTime": 0.22,
  "quantity": {
    "min": 2,
    "max": 6,
    "default": 4,
    "label": "噴出煙尾",
    "unit": "條",
    "help": "調整向外噴出的主煙尾數量；密度只改變裝飾火星，不減少煙尾或爆心。",
    "previewTime": 0.22
  },
  "description": "火球在空中炸開，粗大的煙尾往四周噴出，火焰慢慢變成煙霧散去。",
  "tags": "火焰 爆炸 空爆 煙霧 煙尾 噴發 命中 火球 飛彈 fire explosion airburst billowing smoke jets impact 烈焰空爆 Billowing Airburst"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#ff7a24",
  "size": 1,
  "density": 0.5,
  "quantity": 4
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
