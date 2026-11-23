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
// 地面冰封 / Ground Ice Eruption — Three.js r187, WebGL2.
// Add fx.group, update(deltaSeconds), then fx.render(renderer,scene,camera).
// render REPLACES renderer.render; call once per scene/frame, including all ice instances.
// SRGBColorSpace + NoToneMapping; opaque full-frame output. No host composer required.
// Bloom uses four lazy render targets and keeps opaque mesh occlusion. Transparent
// environment surfaces do not occlude bloom; stacked postprocessing/alpha output not supported.
// XZ ground / +Y up. Lance flies +X into (2.6,1.5,0); shield hits are an authored demo script.
// No collision, damage, input, automatic loop, terrain editing or external texture fetch.
// Color, bloom, shiny, size and speed preserve time. reset replays the same fixed seed.
// dispose releases only effect-owned resources and lazy bloom targets; later calls are inert.
import * as THREE from "../../../three.min.mjs";
import * as __vfxDependency1 from "./pass.mjs";
import {__vfxModule} from './runtime-b5b1addcbc82ae91.mjs';
const createIceMagic = __vfxModule.createIceMagic;

export const defaultOptions={"size":1,"speed":1,"bloom":1.1,"shiny":1,"color":"#d4e8ed"};
export default function createVFX(options={}){return createIceMagic("ground-freeze-study",{...defaultOptions,...options});}
