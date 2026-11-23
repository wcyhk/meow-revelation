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
// 符晶飛彈 / Runic Crystal Missiles
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
  "id": "arcane-missile",
  "spread": {
    "min": 0.5,
    "max": 3,
    "default": 1,
    "label": "投射物散布範圍",
    "help": "拉開晶核與配對尾跡的繞行間距；晶核大小、尾跡長度與整組前進方向不變。"
  },
  "quantity": {
    "min": 1,
    "max": 6,
    "default": 3,
    "label": "晶核數量",
    "unit": "枚",
    "help": "晶核與配對尾跡一起增減；整組共同飛行及命中。"
  },
  "lifecycle": {
    "start": 0.35,
    "end": 0.8
  },
  "name": "符晶飛彈",
  "english": "Runic Crystal Missiles",
  "category": "projectile",
  "color": "#c99aff",
  "description": "三顆魔法水晶一邊繞圈一邊前進，身後拖著發光圖案。",
  "tags": "魔法 螺旋 法師 奧術飛彈 Arcane missile",
  "maxParticles": 768,
  "kind": 0,
  "variant": 3,
  "duration": 5,
  "burst": false,
  "seed": 36748,
  "schools": [
    "arcane"
  ]
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#c99aff",
  "size": 1,
  "density": 0.5,
  "quantity": 3,
  "spread": 1
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
