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
// Comic Ink Arcs: warm-black pointed arcs, 8 styles; no fire, debris or external assets.
// duration = 0.03 + inkArcDuration (default 0.78s). XZ arcs, +Y up.
// setOptions preserves elapsed time. Finite values are clamped; style/count rounded.
// Add group, update(deltaSeconds), reset to replay, dispose at teardown.
import * as THREE from "../../../three.min.mjs";
var __vfxModule = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/effects/comic-ink-arcs-ink.js
	const comicInkControls = [
		[
			"inkStyle",
			"墨線款式",
			0,
			7,
			0,
			1,
			""
		],
		[
			"inkArcCount",
			"弧線數量",
			0,
			32,
			9,
			1,
			"條"
		],
		[
			"inkArcWidth",
			"弧線粗細",
			.25,
			3,
			.25,
			.05,
			"×"
		],
		[
			"inkArcLength",
			"弧線長度",
			.25,
			2,
			.9,
			.05,
			"×"
		],
		[
			"inkRadius",
			"墨線外擴範圍",
			.5,
			2,
			.7,
			.05,
			"×"
		],
		[
			"inkSpeed",
			"墨線外擴速度",
			.25,
			2,
			1,
			.05,
			"×"
		],
		[
			"inkIrregularity",
			"筆觸不規則程度",
			0,
			1,
			0,
			.01,
			"%"
		],
		[
			"inkDryness",
			"乾筆斷筆程度",
			0,
			1,
			.46,
			.01,
			"%"
		],
		[
			"inkOpacity",
			"墨色不透明度",
			.1,
			1,
			.9,
			.01,
			"%"
		],
		[
			"inkArcDuration",
			"弧線持續時間",
			.2,
			1.5,
			.75,
			.01,
			"秒"
		],
		[
			"inkFadeStart",
			"消散開始位置",
			.2,
			.8,
			.45,
			.01,
			"%"
		]
	];
	function normalizeComicInk(next = {}, base = {}) {
		const result = {};
		for (const [key, , min, max, value] of comicInkControls) {
			const n = Number.isFinite(next[key]) ? next[key] : Number.isFinite(base[key]) ? base[key] : value;
			result[key] = Math.min(max, Math.max(min, key.endsWith("Count") || key === "inkStyle" ? Math.round(n) : n));
		}
		return result;
	}
	function createComicInk(T, seed) {
		const uniforms = {
			style: { value: 0 },
			age: { value: 0 },
			arcCount: { value: 9 },
			arcWidth: { value: .25 },
			arcLength: { value: .9 },
			radius: { value: .7 },
			speed: { value: 1 },
			irregularity: { value: 0 },
			dryness: { value: .46 },
			opacity: { value: .9 },
			arcDuration: { value: .75 },
			fadeStart: { value: .45 },
			inkColor: { value: new T.Color("#241D1A") }
		};
		const segments = 48, sides = 6, positions = [], uvs = [], parts = [], indices = [];
		for (let part = 0; part < 2; part++) {
			const base = positions.length / 3;
			for (let j = 0; j <= segments; j++) for (let k = 0; k <= sides; k++) {
				const u = j / segments;
				positions.push(u, k / sides, 0);
				uvs.push(u, k / sides);
				parts.push(part, 0);
			}
			for (let j = 0; j < segments; j++) for (let k = 0; k < sides; k++) {
				const a = base + j * 7 + k, b = a + sides + 1;
				indices.push(a, a + 1, b, b, a + 1, b + 1);
			}
		}
		const geometry = new T.InstancedBufferGeometry();
		geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
		geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
		geometry.setAttribute("inkPart", new T.Float32BufferAttribute(parts, 2));
		geometry.setIndex(indices);
		geometry.instanceCount = 32;
		let state = (seed ?? 829661) >>> 0;
		const random = () => {
			state = Math.imul(state, 1664525) + 1013904223 >>> 0;
			return state / 4294967296;
		};
		geometry.setAttribute("inkSeed", new T.InstancedBufferAttribute(Float32Array.from({ length: 128 }, random), 4));
		geometry.setAttribute("inkId", new T.InstancedBufferAttribute(Float32Array.from({ length: 32 }, (_, i) => i), 1));
		const common = `uniform float style,age,arcCount,arcWidth,arcLength,radius,speed,irregularity,dryness,opacity,arcDuration,fadeStart;float sat(float x){return clamp(x,0.,1.);}float sm(float a,float b,float x){float q=sat((x-a)/(b-a));return q*q*(3.-2.*q);}`;
		const material = new T.ShaderMaterial({
			uniforms,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			side: T.FrontSide,
			toneMapped: false,
			vertexShader: common + `attribute vec2 inkPart;attribute vec4 inkSeed;attribute float inkId;varying vec2 vInkUV;varying float vLife,vAlive,vSeed;
 vec3 path(float u,float t){float a,rad,y;
  float band=mod(inkId,3.),ring=floor(inkId/3.),spread=1.25,offset=ring*.17,spacing=ring*.14;
   if(style>2.5&&style<3.5){spread=1.65;offset=ring*.06;spacing=ring*.22;}
   if(style>3.5&&style<4.5){spread=5.53;offset=0.;spacing=ring*.12;}
   if(style>4.5&&style<5.5){offset=ring*.05;spacing=ring*.065;}
   if(style>5.5&&style<6.5){offset=0.;spacing=0.;}
   if(style>6.5){spread=.32;offset=(ring-1.)*.48;spacing=0.;}
   a=band*2.094395+offset+(u-.5)*spread*arcLength+t*.16;rad=(.70+1.95*(1.-exp(-10.*t*speed))+t*.72*speed+spacing)*radius;y=.25+(style>5.5?0.:ring*.045)+t*.08;
  return vec3(cos(a)*rad,y,sin(a)*rad);
 }
 void main(){float id=inkId,start=.03,duration=arcDuration,t=max(0.,age-start);vLife=sat(t/duration);vAlive=step(start,age)*(1.-step(duration,t))*(1.-step(arcCount,id));vSeed=inkSeed.z;vInkUV=uv;if(vAlive<.5){gl_Position=vec4(2.,2.,2.,1.);return;}
  if(dryness<=0.&&inkPart.x>.5){gl_Position=vec4(2.,2.,2.,1.);return;}
  float strokeU=uv.x;
  float drawU=mix(sm(fadeStart,1.,vLife)*.65,1.,strokeU);vec3 p=path(drawU,t),tangent=normalize(path(drawU+.002,t)-path(drawU-.002,t));vec3 across=normalize(cross(vec3(0.,1.,0.),tangent)),up=cross(tangent,across);
  float taper=max(0.,min(min(uv.x/.28,1.),(1.-uv.x)/.38))*mix(1.25,.35,uv.x),grain=1.+irregularity*.30*sin(uv.x*28.+inkSeed.x*31.);float width=.13*arcWidth*taper*grain*(1.-.60*sm(fadeStart,1.,vLife));
  if(style>.5&&style<1.5){width*=1.55*(.85+.25*sin(uv.x*9.+inkSeed.x*2.));}
  if(style>1.5&&style<2.5){width*=1.75;}
  if(style>2.5&&style<3.5){width*=1.2*(1.-.12*mod(inkId,3.));}
  if(style>5.5&&style<6.5){float ring=floor(inkId/3.);width*=ring<.5?1.3:ring<1.5?1.:.65;vAlive*=ring<.5?.14:ring<1.5?.28:.8;}
  // Separate along stroke width, never cut across its length. Independent tips
  // keep a nonzero separation even where their tapered width reaches zero.
  if(dryness>0.){
   float baseWidth=.13*arcWidth*(1.-.60*sm(fadeStart,1.,vLife));
   float lane=inkPart.x<.5?-1.:1.;
   p+=across*lane*baseWidth*(.70+dryness*.85);
   width*=.48;
  }
  float theta=uv.y*6.283185;p+=(across*cos(theta)+up*sin(theta))*width;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 }`,
			fragmentShader: common + `uniform vec3 inkColor;varying vec2 vInkUV;varying float vLife,vAlive,vSeed;
 void main(){float u=vInkUV.x;float dry=1.;if(style>1.5&&style<2.5){float stripe=abs(sin(vInkUV.y*25.13274+.4*sin(vInkUV.x*7.+vSeed)));dry=sm(.18,.42,stripe);}float fade=sm(fadeStart,1.,vLife);float breakup=1.;float alpha=vAlive*opacity*dry*breakup*(1.-fade);if(alpha<.003)discard;gl_FragColor=vec4(inkColor,alpha);#include <colorspace_fragment>
 }`.replace(";#include", ";\n#include")
		});
		const mesh = new T.Mesh(geometry, material);
		mesh.name = "rolling-ground-burst-smoke-arcs";
		mesh.frustumCulled = false;
		mesh.userData = {
			role: "smoke-arcs",
			groundBurstWindow: [0, 1.53],
			particlesPerEvent: 32
		};
		return {
			mesh,
			sync(time, options) {
				geometry.instanceCount = options.inkArcCount;
				uniforms.age.value = time;
				for (const [key] of comicInkControls) uniforms[key.slice(3, 4).toLowerCase() + key.slice(4)].value = options[key];
			},
			dispose() {
				geometry.dispose();
				material.dispose();
			}
		};
	}

//#endregion
//#region src/effects/comic-ink-arcs-runtime.js
	const id = "comic-ink-arcs";
	const styleNames = [
		"A・乾淨漫畫圓弧",
		"B・毛筆掃圓弧",
		"C・飛白乾筆圓弧",
		"D・多重漫畫衝擊弧",
		"E・書法墨圈",
		"F・纖細速度圓弧",
		"G・墨暈圓弧",
		"H・斷筆圓弧"
	];
	function createComicInkArcs(T, options = {}) {
		const group = new T.Group(), ink = createComicInk(T, 20261108);
		group.name = id;
		ink.mesh.name = "comic-ink-arcs-strokes";
		group.add(ink.mesh);
		let elapsed = 0, disposed = false, settings = {
			size: 1,
			speed: 1,
			...normalizeComicInk()
		};
		const duration = () => .03 + settings.inkArcDuration;
		function sync() {
			if (disposed) return;
			group.scale.setScalar(settings.size);
			group.visible = elapsed < duration();
			ink.sync(elapsed, settings);
		}
		function setOptions(next = {}) {
			if (disposed) return;
			for (const key of ["size", "speed"]) if (Number.isFinite(next[key])) settings[key] = Math.max(.25, Math.min(2, next[key]));
			Object.assign(settings, normalizeComicInk(next, settings));
			sync();
		}
		setOptions(options);
		return {
			group,
			update(dt) {
				if (disposed || !Number.isFinite(dt) || dt < 0 || elapsed >= duration()) return;
				elapsed = Math.min(duration(), elapsed + dt * settings.speed);
				sync();
			},
			reset() {
				if (disposed) return;
				elapsed = 0;
				sync();
			},
			setOptions,
			dispose() {
				if (disposed) return;
				disposed = true;
				group.visible = false;
				ink.dispose();
				group.removeFromParent();
				group.clear();
			},
			get particleCount() {
				return settings.inkArcCount;
			},
			get lifecycle() {
				return {
					start: .03,
					end: duration()
				};
			},
			get settings() {
				return { ...settings };
			},
			get elapsed() {
				return elapsed;
			},
			get duration() {
				return duration();
			},
			get phase() {
				return disposed || elapsed >= duration() ? "finished" : elapsed < .03 ? "starting" : "active";
			},
			get finished() {
				return disposed || elapsed >= duration();
			}
		};
	}

//#endregion
exports.createComicInkArcs = createComicInkArcs;
exports.id = id;
exports.styleNames = styleNames;
return exports;
})({});
const createComicInkArcs = __vfxModule.createComicInkArcs;
const id = __vfxModule.id;
const styleNames = __vfxModule.styleNames;

const preset={"id":"comic-ink-arcs","name":"漫畫墨弧","english":"Comic Ink Arcs","category":"burst","color":"#241D1A","description":"尖頭墨色圓弧向外散開，逐漸變細淡去，可切換八種筆觸。","tags":"墨線 圓弧 漫畫 衝擊 黑色 手繪 ink arc comic impact brush","schools":[],"kind":3,"variant":0,"seed":20261108,"duration":1.53,"burst":true,"maxParticles":32,"defaultDensity":0.28125,"previewTime":0.25,"thumbnailTime":0.25,"lifecycle":{"start":0.03,"end":1.53}};
export const defaultOptions={"size":1,"speed":1,"inkStyle":0,"inkArcCount":9,"inkArcWidth":0.25,"inkArcLength":0.9,"inkRadius":0.7,"inkSpeed":1,"inkIrregularity":0,"inkDryness":0.46,"inkOpacity":0.9,"inkArcDuration":0.75,"inkFadeStart":0.45};
export default function createVFX(options={}){return createComicInkArcs(THREE,{...defaultOptions,...options});}
