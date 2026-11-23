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
// 獄炎火柱 / Hellfire Pillar — Three.js r187, WebGL2.
// 加入 fx.group，逐幀呼叫 fx.update(deltaSeconds)；fx.reset() 會原地重播。
// Add fx.group, call fx.update(deltaSeconds) each frame; fx.reset() replays at the same transform.
// XZ ground plane, +Y up. The pillar travels 27.6 local units along +Z, centered on the group origin.
// One shot: 4.2 visual seconds. No external assets, collision, camera or render hook.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-5889609bc2e69d67.mjs';
const HELLFIRE_THEMES = __vfxModule.HELLFIRE_THEMES;
const HELLFIRE_TIMELINE = __vfxModule.HELLFIRE_TIMELINE;
const HellfirePillarVFX = __vfxModule.HellfirePillarVFX;
const createHellfirePillarEffect = __vfxModule.createHellfirePillarEffect;
const normalizeHellfirePillarOptions = __vfxModule.normalizeHellfirePillarOptions;

export {HellfirePillarVFX,HELLFIRE_THEMES,HELLFIRE_TIMELINE};
export const defaultOptions={"theme":"hellfire","size":1,"speed":1};
export default function createVFX(options={}){return createHellfirePillarEffect({"id":"hellfire-pillar","lifecycle":{"start":1.15,"end":1.1}},{...defaultOptions,...options});}
