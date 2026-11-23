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
// 渦光黑洞 / Luminous Vortex Black Hole
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

// 引力透鏡使用 Three.js 內建透射取樣真實背景與不透明物件；不保證扭曲其他透明物件。
// Gravitational lensing samples the actual background and opaque scene via native Three.js transmission. Other transparent objects may be excluded.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-425eeb97bf8b8465.mjs';
const createEffect = __vfxModule.createEffect;


const preset = {
  "id": "black-hole",
  "name": "渦光黑洞",
  "english": "Luminous Vortex Black Hole",
  "category": "area",
  "kind": 2,
  "variant": 9,
  "schools": [
    "astral"
  ],
  "color": "#ffab42",
  "seed": 719903,
  "duration": 6,
  "burst": false,
  "maxParticles": 256,
  "defaultDensity": 1,
  "lifecycle": {
    "start": 1.1,
    "end": 1.4
  },
  "previewTime": 2.2,
  "thumbnailTime": 2.2,
  "sizeRange": {
    "min": 0.25,
    "max": 12,
    "default": 6
  },
  "detailRange": {
    "min": 0.25,
    "max": 4,
    "default": 2
  },
  "previewActiveDuration": 13.7,
  "description": "黑洞周圍的亮光不斷往內捲，後面的景物也像被吸力拉彎。",
  "tags": "黑洞 引力 重力 吸積盤 扭曲 星界 black hole gravity gravitational lens accretion distortion astral 黑洞 Black Hole"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 2,
  "color": "#ffab42",
  "size": 6,
  "density": 1
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
