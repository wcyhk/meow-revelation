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
// 裂空碎斬 / Rift-Shattering Slashes
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

// panelCount 控制獨立三角扭曲板數量（0–32），預設 9；不改變刀光或碎片數量。
// 空間錯位使用 Three.js 內建透射；支援背景、不透明場景與本素材刀光，其他透明物件不保證被扭曲。
// Spatial distortion samples the background, opaque scene and this effect's blade; other transparent objects may be excluded.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-425eeb97bf8b8465.mjs';
const createEffect = __vfxModule.createEffect;


const preset = {
  "id": "dimensional-rend",
  "name": "裂空碎斬",
  "english": "Rift-Shattering Slashes",
  "category": "area",
  "kind": 6,
  "variant": 1,
  "schools": [
    "astral"
  ],
  "color": "#729dff",
  "seed": 671423,
  "duration": 3.4,
  "burst": true,
  "maxParticles": 128,
  "defaultDensity": 0.3,
  "lifecycle": {
    "start": 0.2,
    "end": 2.4
  },
  "previewTime": 0.64,
  "thumbnailTime": 0.64,
  "sizeRange": {
    "min": 0.25,
    "max": 4,
    "default": 2
  },
  "panelCount": {
    "min": 0,
    "max": 32,
    "default": 9
  },
  "quantity": {
    "min": 1,
    "max": 32,
    "default": 18,
    "label": "斬痕數量",
    "unit": "道",
    "help": "一次施放劃出的斬痕總數；空間切片由粒子密度控制。"
  },
  "spread": {
    "min": 0.5,
    "max": 4,
    "default": 2,
    "label": "散布範圍",
    "help": "只改變斬痕之間的距離，不改斬痕長度、數量或演出時間。"
  },
  "description": "刀光劃過時，背景像碎玻璃一樣錯開、散開，再慢慢恢復。",
  "tags": "斬擊 次元 空間 裂縫 連斬 星界 slash cut rift dimensional rend spatial astral 次元裂斬 Dimensional Rend"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#729dff",
  "size": 2,
  "density": 0.3,
  "panelCount": 9,
  "quantity": 18,
  "spread": 2
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
