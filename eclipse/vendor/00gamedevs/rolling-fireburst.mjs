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
// Rolling Flame Burst: 2.15s, XZ ground origin, +Y up.
// No ink arcs. Thin horizontal opacity-fading shockwave at local Y=0.60 * size.
// New burst: rerollDebris(); reset(). reset alone keeps debris for seeking.
// Embedded cloud; antialiased WebGL2 renderer recommended. No external assets or render hook.
// Add group, update(deltaSeconds), reset to replay, dispose at teardown.
import * as THREE from "../../../three.min.mjs";
import {__vfxModule} from './runtime-d31d8532746fec6d.mjs';
const createRollingFireburst = __vfxModule.createRollingFireburst;

const preset={"id":"rolling-fireburst","name":"翻焰爆破","english":"Rolling Flame Burst","category":"burst","color":"#ff8b20","description":"大團火焰向外翻滾，逐漸變成濃煙，再從下往上破散。","tags":"火焰 煙霧 爆炸 翻滾 動漫 fire smoke explosion rolling anime","schools":["fire","light"],"kind":4,"variant":0,"seed":20261108,"duration":2.15,"burst":true,"maxParticles":696,"previewTime":0.36,"thumbnailTime":0.3,"lifecycle":{"start":0,"end":1.93}};
export const defaultOptions={"size":1,"speed":1};
export default function createVFX(options={}){return createRollingFireburst(THREE,preset,{...defaultOptions,...options});}
