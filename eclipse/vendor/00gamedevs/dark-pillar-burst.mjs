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
// 黑暗光柱爆發 / Dark Pillar Burst — Three.js r187 / WebGL2.
// Place fx.group at the ground center (XZ, +Y up), call update(deltaSeconds), and reset() to replay.
// One 17.84-second cast at speed 1. seek(seconds) samples visual time. Use the normal Three.js render loop and Canvas 2D for full glyph visuals.
// A scene light illuminates the debris. No external assets, custom render pass, damage or collisions.
// The optional DarkPillarBurstVFX class setTime(seconds) loops; the default factory plays once.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-2187bab9911e9b10.mjs';
const DARK_PILLAR_BURST = __vfxModule.DARK_PILLAR_BURST;
const DarkPillarBurstVFX = __vfxModule.DarkPillarBurstVFX;
const createDarkPillarBurstEffect = __vfxModule.createDarkPillarBurstEffect;
const normalizeDarkPillarBurstOptions = __vfxModule.normalizeDarkPillarBurstOptions;

export {DarkPillarBurstVFX};
export const defaultOptions={"size":1,"speed":1,"circleDiameter":2,"pillarHeight":1,"pillarWidth":2};
export default function createVFX(options={}){return createDarkPillarBurstEffect({"id":"dark-pillar-burst","lifecycle":{"start":1.15,"end":1.5399999999999991}},{...defaultOptions,...options});}
