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
// 連續雷流 / Sustained Arc
// Three.js 0.187.0 / WebGL2. Retains 14 layer types, original palette and three-scale glow.
// Add fx.group to your scene, call fx.update(deltaSeconds), then fx.render(renderer, scene, camera).
// IMPORTANT: render() replaces renderer.render(); it renders all support VFX in that scene together.
// update alone does NOT provide the accepted glow. No extra animation loop or camera is installed.
// Supports size/speed, stop (fade), reset (preserves placement), dispose, setLayer(-1 or 0..13).
// Lightning only: setEndpoints(Vector3,Vector3) in group-parent coordinates; coincident endpoints stop it.
// Valid endpoints after stopping require reset(). size after setEndpoints changes the whole root scale;
// reapply endpoints after size changes. Ground motifs follow the beam, not terrain.
// +Y up. Healing/shield origin: ground center. Default lightning endpoints: (+/-1.7,1.88,0).
// render uses SRGBColorSpace / NoToneMapping and restores the renderer settings afterward.
// Shared half-float glow: full-resolution scenes, half/quarter/eighth-size halos; display scene alone uses 4x MSAA. Dispose at teardown.
// Built-in lossless stamp data; no external textures, demonstration characters, UI or gameplay logic.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-2bd5595a3cd2fb94.mjs';
const createSupportVfxEffect = __vfxModule.createSupportVfxEffect;

const preset={"id":"sustained-arc","name":"連續雷流","english":"Sustained Arc","category":"beam","supportVfxKind":"lightning","kind":1,"variant":0,"schools":["storm"],"color":"#a4b6ff","seed":829655,"duration":5,"burst":false,"maxParticles":23,"defaultDensity":0.5,"lifecycle":{"start":0.18,"end":0.28},"previewTime":2.2,"thumbnailTime":2.2,"previewActiveDuration":4,"description":"持續雷電特效，分岔電流連接施放端與目標，適合表現持續電擊。","tags":"連續雷流 Sustained Arc support-magic lightning 14 圖層"};
export const defaultOptions={"size":1,"speed":1};
export default function createVFX(options={}){return createSupportVfxEffect(preset,{...defaultOptions,...options});}
