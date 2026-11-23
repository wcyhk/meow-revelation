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
// 流光刃影 / Gleaming Blade Trail
// 武器軌跡接入 / Weapon trail setup
// 展示劍、滑鼠控制與自動演示僅供預覽，不包含在此模組。
// The preview sword, pointer input and automatic demo are excluded.
// const fx = createVFX();
// scene.add(fx.group);
// fx.attachWeapon(sword, { base: [0, 0, 0], tip: [0, 1, 0] });
// base／tip 為武器本地座標的刀根／刀尖，可傳入 Vector3 或 [x,y,z]。
// Blade base and tip use sword-local coordinates (Vector3 or [x,y,z]).
// 每幀先更新武器動作，再呼叫 fx.update(deltaSeconds)。
// Update the weapon animation first, then fx.update(deltaSeconds).
// stop() 停止記錄並淡出；reset() 保留綁定並開始新軌跡。
// stop() drains the trail; reset() starts a fresh stroke with the current weapon.
// detachWeapon() 解除武器參照；dispose() 只釋放特效，不釋放武器。
// detachWeapon() releases the binding; dispose() releases only the effect.
// size 控制刀身覆蓋比例；speed 控制拖影淡出速度，不改武器動作。
// size controls blade coverage; speed controls trail fading, not weapon motion.
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
  "id": "weapon-smear",
  "name": "流光刃影",
  "english": "Gleaming Blade Trail",
  "category": "area",
  "kind": 2,
  "variant": 11,
  "schools": [
    "arcane"
  ],
  "color": "#2878ff",
  "seed": 829642,
  "duration": 4,
  "burst": false,
  "maxParticles": 0,
  "defaultDensity": 0.5,
  "lifecycle": {
    "start": 0.001,
    "end": 0.18
  },
  "previewMode": "continuous",
  "previewTime": 0.45,
  "thumbnailTime": 0.45,
  "sizeRange": {
    "min": 0.25,
    "max": 1,
    "default": 1
  },
  "description": "揮劍時留下透明的藍色光痕，停手後很快消失。",
  "tags": "武器 拖影 殘影 斬擊 刀光 smear slash weapon trail sword blade arcane 武器拖影 Slash Smear"
};
export const defaultOptions = {
  "speed": 1,
  "detail": 1,
  "color": "#2878ff",
  "size": 1,
  "density": 0.5
};
export default function createVFX(options = {}) {
  return createEffect(preset, { ...defaultOptions, ...options });
}
