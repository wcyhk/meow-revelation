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
// 火焰魔法彈 / Flame Magic Bolt — Three.js 0.187.0 / WebGL2.
// Add fx.group, call update(deltaSeconds), and reset() for another cast.
// Local path: (0,1.45,4.3) to (0,1.45,-4.3); XZ ground, +Y up. Impact at 1.836 visual seconds.
// Optional: call setCameraPosition(worldPosition) before rendering for camera-facing ribbons and smoke.
// No external assets or built-in collision. Named classes use group-local endpoints.
// For gameplay, call launch() and step(), or pool.fireForward() and pool.update(); spawn() plays the authored timeline.
// The pool returns null when full; dispose the pool, not its individual casts.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-afa5aa3ec3c6d0c6.mjs';
const FLAME_MAGIC_BOLT = __vfxModule.FLAME_MAGIC_BOLT;
const HyperdimensionalSoulFireballPool = __vfxModule.HyperdimensionalSoulFireballPool;
const HyperdimensionalSoulFireballVFX = __vfxModule.HyperdimensionalSoulFireballVFX;
const createFlameMagicBoltEffect = __vfxModule.createFlameMagicBoltEffect;
const normalizeFlameMagicBoltOptions = __vfxModule.normalizeFlameMagicBoltOptions;

export {HyperdimensionalSoulFireballVFX,HyperdimensionalSoulFireballPool};
export const defaultOptions={"size":1,"speed":1};
export default function createVFX(options={}){return createFlameMagicBoltEffect({"id":"flame-magic-bolt","seed":20261121,"lifecycle":{"start":0.476,"end":0.68}},{...defaultOptions,...options});}
