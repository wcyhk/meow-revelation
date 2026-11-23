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
// 星劍焚界 / Starblade Cataclysm — Three.js 0.187.0 / WebGL2
// 21 visual seconds; +Y up, XZ ground; size scales the entire local performance.
// Add group, update(deltaSeconds) in your existing loop, dispose at teardown. No render hook.
// setObject(loadedRigidObject,{height:3,rotation:[0,0,0]}) clones model/materials and restarts.
// Source geometry/textures stay caller-owned; source visibility and placement are never changed.
// Ordinary rigid mesh materials only; no shader hooks, skins, morphs or instances.
// setObject(null) restores the bundled golden sword.
// setSweepPath(startVector3,endVector3): local unscaled y=0, distance >= .1; restarts.
// Default path (2,0,0) to (22,0,0). Host owns damage, collisions and original weapon visibility.
// reset replays the same seed at the current transform. stop/hit are single-shot compatibility no-ops.
// finished means all visible layers ended. No terrain modification or external textures.
// density affects decorative stars only; color tints golden energy, preserving the red/dark core.
// MeshSurfaceSampler is bundled under the following Three.js license:
/*
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
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-e31e21da0e96e087.mjs';
const createStarbladeEffect = __vfxModule.createStarbladeEffect;
const starbladeLayers = __vfxModule.starbladeLayers;
const starbladeStages = __vfxModule.starbladeStages;

const preset={"id":"starblade-cataclysm","name":"星劍焚界","english":"Starblade Cataclysm","category":"beam","color":"#ffd35a","description":"劍化成金色星光，升空聚成四瓣核心，再射出光束燒開熔岩裂谷。","tags":"劍 星粒 十字 四瓣 蓄力 雷射 掃射 熔岩 裂谷 SAO sword stars cross charge laser sweep lava","schools":["light","fire"],"kind":1,"variant":8,"seed":829661,"duration":21,"burst":true,"maxParticles":51902,"defaultDensity":0.5,"previewTime":11.9,"thumbnailTime":11.9,"lifecycle":{"start":13.1,"end":3.3}};
export const defaultOptions={"color":"#ffd35a","size":1,"speed":1,"density":0.5,"detail":1};
export default function createVFX(options={}){return createStarbladeEffect(THREE,preset,{...defaultOptions,...options});}
