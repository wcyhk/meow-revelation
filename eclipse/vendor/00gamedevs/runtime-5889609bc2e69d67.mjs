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
import * as THREE from "../../../three.min.mjs";
var __vfxModule = (function(exports, three) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
three = __toESM(three, 1);

//#region src/effects/option-values.js
/** @param {unknown} value @param {number} min @param {number} max @param {number} fallback */
	function finiteRange(value, min, max, fallback) {
		return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
	}

//#endregion
//#region src/effects/hellfire-pillar-runtime.js
/**
	* ============================================================================
	* HellfirePillarVFX.js - Stylized Anime 3D VFX Module (Three.js r160+ ESM)
	* ----------------------------------------------------------------------------
	* Game-Ready Optimizations:
	*  - Shared static procedural texture & geometry cache with ref-counting
	*  - Batched 3-in-1 spiral ribbons (1 draw call) & 6-in-1 lightning (1 draw call)
	*  - Compacted InstancedMesh active counts (0 GPU work for inactive particles)
	*  - Analytical AABB fragment early-out on advancing molten lava trail
	*  - World-space position/rotation independence, zero per-frame GC & dispose()
	*
	* Recommended Post-Processing (Optional):
	*  - renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
	*  - UnrealBloomPass(halfRes, strength: 0.32, radius: 0.25, threshold: 0.88)
	*
	* Quick Usage:
	*  import { HellfirePillarVFX } from './HellfirePillarVFX.js';
	*  const vfx = new HellfirePillarVFX();
	*  scene.add(vfx.group);
	*  vfx.cast(new THREE.Vector3(0, 0, 0), 0); // origin, yawRadians
	*
	*  // Inside your game loop:
	*  const alive = vfx.update(deltaSeconds);
	*
	*  // When removing from pool/scene:
	*  vfx.dispose();
	* ============================================================================
	*/
	const HELLFIRE_TIMELINE = {
		"STAGE1_END": .85,
		"STAGE2_END": 1.15,
		"STAGE3_END": 1.5,
		"STAGE4_END": 3.1,
		"STAGE5_END": 4.2,
		"REST_END": 5
	};
	const BURST_SURFACE_END = 1.05;
	const BURST_SMOKE_START = .22;
	const BURST_SMOKE_END = 1.68;
	const HELLFIRE_THEMES = {
		"hellfire": {
			"name": "獄炎紅蓮",
			"accent": "#eb4b10",
			"accentSoft": "rgba(235, 75, 16, 0.35)",
			"gradEnd": "#9e1218",
			"char": "#1c0408",
			"dark": "#9e1218",
			"mid": "#eb4b10",
			"highlight": "#ffb82e",
			"coreBody": "#ffd85a",
			"coreHot": [
				1.18,
				1.05,
				.78
			],
			"smokeDark": "#231829",
			"smokeMid": "#3d2230",
			"smokeBounce": "#d94514",
			"lightning": [
				1.16,
				1.06,
				.76
			],
			"circleBright": "#e06d24",
			"circleMid": "#a31b16",
			"crackHot": "#e86a1c",
			"crackCool": "#5c0c0a",
			"lightBase": "#ff5a1f",
			"lightMid": "#eb3d10"
		},
		"abyssal": {
			"name": "幽冥蒼焰",
			"accent": "#1888e0",
			"accentSoft": "rgba(24, 136, 224, 0.35)",
			"gradEnd": "#0b2d8a",
			"char": "#060c21",
			"dark": "#0e3694",
			"mid": "#1582db",
			"highlight": "#59d2f2",
			"coreBody": "#9beeff",
			"coreHot": [
				.85,
				1.12,
				1.22
			],
			"smokeDark": "#161e30",
			"smokeMid": "#243554",
			"smokeBounce": "#1884d6",
			"lightning": [
				.88,
				1.12,
				1.2
			],
			"circleBright": "#36b6e0",
			"circleMid": "#12469e",
			"crackHot": "#28a4e0",
			"crackCool": "#0b2459",
			"lightBase": "#209cff",
			"lightMid": "#1264db"
		},
		"violet": {
			"name": "業火紫雷",
			"accent": "#a62ce0",
			"accentSoft": "rgba(166, 44, 224, 0.35)",
			"gradEnd": "#4c0b87",
			"char": "#150424",
			"dark": "#570e96",
			"mid": "#a82be0",
			"highlight": "#e67cf2",
			"coreBody": "#f5b8ff",
			"coreHot": [
				1.16,
				.88,
				1.22
			],
			"smokeDark": "#21162e",
			"smokeMid": "#38214f",
			"smokeBounce": "#a62cd9",
			"lightning": [
				1.14,
				.9,
				1.2
			],
			"circleBright": "#cf68e3",
			"circleMid": "#6414a8",
			"crackHot": "#ba42e0",
			"crackCool": "#380a5e",
			"lightBase": "#c240ff",
			"lightMid": "#8a1ad9"
		},
		"venom": {
			"name": "煉獄毒炎",
			"accent": "#1eb84d",
			"accentSoft": "rgba(30, 184, 77, 0.35)",
			"gradEnd": "#0b5e2e",
			"char": "#051a0f",
			"dark": "#0d6b34",
			"mid": "#1eb84d",
			"highlight": "#9ee034",
			"coreBody": "#d4f77c",
			"coreHot": [
				1.04,
				1.18,
				.72
			],
			"smokeDark": "#15241e",
			"smokeMid": "#223d31",
			"smokeBounce": "#1eb34b",
			"lightning": [
				1.02,
				1.16,
				.78
			],
			"circleBright": "#6ed43b",
			"circleMid": "#127337",
			"crackHot": "#45cc41",
			"crackCool": "#0a401e",
			"lightBase": "#2ce05c",
			"lightMid": "#16a844"
		}
	};
	const DEFAULT_VFX_OPTIONS = {
		"theme": "hellfire",
		"scale": 1,
		"speed": 1,
		"moveEnabled": true,
		"moveSpeed": 1,
		"particleMult": 1,
		"rotateCircle": false,
		"autoLoop": false,
		"useLights": true,
		"useSoftGlow": false
	};
	function clamp01(v) {
		return Math.max(0, Math.min(1, v));
	}
	function lerp(a, b, t) {
		return a + (b - a) * t;
	}
	function smoothstep(e0, e1, x) {
		const t = clamp01((x - e0) / (e1 - e0));
		return t * t * (3 - 2 * t);
	}
	function easeOutExpo(t) {
		return t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp01(t));
	}
	function easeOutCubic(t) {
		return 1 - Math.pow(1 - clamp01(t), 3);
	}
	function easeInQuad(t) {
		const c = clamp01(t);
		return c * c;
	}
	function easeOutBack(t, s = 1.6) {
		const c = clamp01(t) - 1;
		return 1 + (s + 1) * c * c * c + s * c * c;
	}
	function mulberry32(seed) {
		let a = seed >>> 0;
		return function() {
			a |= 0;
			a = a + 1831565813 | 0;
			let t = Math.imul(a ^ a >>> 15, 1 | a);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}
	const _mat = new three.Matrix4();
	const _pos = new three.Vector3();
	const _quat = new three.Quaternion();
	const _scl = new three.Vector3();
	const _euler = new three.Euler();
	const _col = new three.Color();
	const _up = new three.Vector3(0, 1, 0);
	const _dir = new three.Vector3();
	const _worldPillarPos = new three.Vector3();
	function createPillarGlowTexture() {
		const w = 48, h = 96;
		const pixels = /* @__PURE__ */ new Uint8Array(18432);
		for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
			const u = (x + .5) / w * 2 - 1;
			const v = (y + .5) / h;
			const side = 1 - smoothstep(.08, 1, Math.abs(u) / lerp(1, .62, v));
			const end = smoothstep(0, .16, v) * (1 - smoothstep(.65, 1, v));
			const i = (y * w + x) * 4;
			pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
			pixels[i + 3] = Math.round(255 * side * side * end);
		}
		const map = new three.DataTexture(pixels, w, h);
		map.minFilter = map.magFilter = three.LinearFilter;
		map.needsUpdate = true;
		return map;
	}
	function createMagicCircleTexture() {
		const size = 512;
		const cx = size * .5;
		const cy = size * .5;
		const R = size * .445;
		const runeC = document.createElement("canvas");
		const backC = document.createElement("canvas");
		runeC.width = runeC.height = size;
		backC.width = backC.height = size;
		const rCtx = runeC.getContext("2d");
		const bCtx = backC.getContext("2d");
		const drawSigil = (ctx, wMult) => {
			ctx.save();
			ctx.translate(cx, cy);
			ctx.strokeStyle = "#ffffff";
			ctx.fillStyle = "#ffffff";
			ctx.lineCap = "round";
			ctx.lineJoin = "miter";
			const rings = [
				[R, 3.8],
				[R * .92, 2.2],
				[R * .77, 3.4],
				[R * .51, 2.6],
				[R * .23, 2.4]
			];
			for (let i = 0; i < rings.length; i++) {
				ctx.lineWidth = rings[i][1] * wMult;
				ctx.beginPath();
				ctx.arc(0, 0, rings[i][0], 0, Math.PI * 2);
				ctx.stroke();
			}
			ctx.lineWidth = 1.9 * wMult;
			for (let i = 0; i < 36; i++) {
				const a = i / 36 * Math.PI * 2;
				const rIn = i % 3 === 0 ? R * .895 : R * .93;
				ctx.beginPath();
				ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
				ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
				ctx.stroke();
			}
			const glyphCount = 18;
			const rBand = R * .845;
			ctx.lineWidth = 2.4 * wMult;
			for (let i = 0; i < glyphCount; i++) {
				const a = i / glyphCount * Math.PI * 2;
				ctx.save();
				ctx.rotate(a);
				ctx.translate(rBand, 0);
				ctx.rotate(Math.PI * .5);
				const s = 11.5;
				const kind = i % 6;
				ctx.beginPath();
				if (kind === 0) {
					ctx.moveTo(-11.5 * .6, s * .7);
					ctx.lineTo(0, -11.5 * .8);
					ctx.lineTo(s * .6, s * .7);
					ctx.moveTo(-6.325, .15 * s);
					ctx.lineTo(s * .55, .15 * s);
				} else if (kind === 1) {
					ctx.moveTo(0, -9.775);
					ctx.lineTo(0, s * .85);
					ctx.moveTo(-11.5 * .6, -11.5 * .35);
					ctx.lineTo(s * .6, s * .35);
					ctx.moveTo(s * .6, -11.5 * .35);
					ctx.lineTo(-11.5 * .6, s * .35);
				} else if (kind === 2) {
					ctx.moveTo(0, -9.775);
					ctx.lineTo(s * .65, 0);
					ctx.lineTo(0, s * .85);
					ctx.lineTo(-11.5 * .65, 0);
					ctx.closePath();
				} else if (kind === 3) {
					ctx.moveTo(-11.5 * .6, -8.625);
					ctx.lineTo(s * .55, -8.625);
					ctx.lineTo(-6.325, s * .75);
					ctx.lineTo(s * .6, s * .75);
				} else if (kind === 4) {
					ctx.moveTo(-5.75, -11.5 * .8);
					ctx.lineTo(-5.75, s * .8);
					ctx.moveTo(-5.75, -11.5 * .1);
					ctx.lineTo(s * .6, -8.625);
					ctx.moveTo(-5.75, .1);
					ctx.lineTo(s * .6, s * .75);
				} else {
					ctx.moveTo(-11.5 * .65, -6.325);
					ctx.lineTo(0, s * .8);
					ctx.lineTo(s * .65, -6.325);
					ctx.moveTo(0, -9.775);
					ctx.lineTo(0, s * .1);
				}
				ctx.stroke();
				ctx.restore();
			}
			ctx.lineWidth = 3.2 * wMult;
			for (let tri = 0; tri < 2; tri++) {
				ctx.beginPath();
				for (let k = 0; k < 3; k++) {
					const a = k / 3 * Math.PI * 2 + tri * Math.PI / 3 - Math.PI * .5;
					const px = Math.cos(a) * R * .765;
					const py = Math.sin(a) * R * .765;
					if (k === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.closePath();
				ctx.stroke();
			}
			ctx.lineWidth = 2.2 * wMult;
			ctx.beginPath();
			for (let k = 0; k < 12; k++) {
				const a = k / 12 * Math.PI * 2 - Math.PI * .5;
				const rad = k % 2 === 0 ? R * .51 : R * .25;
				const px = Math.cos(a) * rad;
				const py = Math.sin(a) * rad;
				if (k === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.closePath();
			ctx.stroke();
			for (let k = 0; k < 6; k++) {
				const a = k / 6 * Math.PI * 2 - Math.PI * .5;
				const sx = Math.cos(a) * R * .635;
				const sy = Math.sin(a) * R * .635;
				const sr = R * .088;
				ctx.lineWidth = 2.2 * wMult;
				ctx.beginPath();
				ctx.arc(sx, sy, sr, 0, Math.PI * 2);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(sx - sr * .55, sy);
				ctx.lineTo(sx + sr * .55, sy);
				ctx.moveTo(sx, sy - sr * .55);
				ctx.lineTo(sx, sy + sr * .55);
				ctx.stroke();
			}
			ctx.lineWidth = 2.8 * wMult;
			const cr = R * .14;
			ctx.beginPath();
			ctx.moveTo(0, -31.897600000000004);
			ctx.lineTo(cr * .85, 0);
			ctx.lineTo(0, cr);
			ctx.lineTo(-27.112960000000005, 0);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		};
		bCtx.shadowColor = "#ffffff";
		bCtx.shadowBlur = 6;
		drawSigil(bCtx, 2.5);
		drawSigil(rCtx, 1);
		const outC = document.createElement("canvas");
		outC.width = outC.height = size;
		const oCtx = outC.getContext("2d");
		const rData = rCtx.getImageData(0, 0, size, size).data;
		const bData = bCtx.getImageData(0, 0, size, size).data;
		const outImg = oCtx.createImageData(size, size);
		const out = outImg.data;
		for (let y = 0; y < size; y++) {
			const dy = (y - cy) / (size * .5);
			for (let x = 0; x < size; x++) {
				const dx = (x - cx) / (size * .5);
				const edgeMask = 1 - smoothstep(.9, .96, Math.hypot(dx, dy));
				const idx = (y * size + x) * 4;
				const rVal = rData[idx + 3] * edgeMask;
				const bVal = bData[idx + 3] * edgeMask;
				out[idx] = Math.min(255, Math.round(rVal));
				out[idx + 1] = Math.min(255, Math.round(bVal));
				out[idx + 2] = 0;
				out[idx + 3] = Math.min(255, Math.round(Math.max(rVal, bVal)));
			}
		}
		oCtx.putImageData(outImg, 0, 0);
		const tex = new three.CanvasTexture(outC);
		tex.anisotropy = 4;
		tex.needsUpdate = true;
		return tex;
	}
	function createVolcanicCracksTexture() {
		const size = 512;
		const cx = size * .5;
		const cy = size * .5;
		const maxR = size * .43;
		const rand = mulberry32(9311);
		const segments = [];
		const addCrackBranch = (x0, y0, angle, length, width, depth) => {
			const steps = Math.max(4, Math.floor(length / 18));
			let px = x0, py = y0, ang = angle;
			for (let s = 0; s < steps; s++) {
				const t = s / steps;
				const stepLen = length / steps * (.8 + rand() * .4);
				ang += (rand() - .5) * .52;
				const nx = px + Math.cos(ang) * stepLen;
				const ny = py + Math.sin(ang) * stepLen;
				const w = Math.max(.8, width * (1 - t * .72));
				segments.push({
					x1: px,
					y1: py,
					x2: nx,
					y2: ny,
					w
				});
				if (depth < 2 && s > 0 && s < steps - 1 && rand() < .34) {
					const side = rand() > .5 ? 1 : -1;
					addCrackBranch(nx, ny, ang + side * (.42 + rand() * .55), length * (.38 + rand() * .25), w * .72, depth + 1);
				}
				px = nx;
				py = ny;
			}
		};
		const primaryCount = 14;
		for (let i = 0; i < primaryCount; i++) {
			const baseA = i / primaryCount * Math.PI * 2 + (rand() - .5) * .22;
			const startR = 12 + rand() * 16;
			addCrackBranch(cx + Math.cos(baseA) * startR, cy + Math.sin(baseA) * startR, baseA, maxR * (.62 + rand() * .36), 5.2 + rand() * 3, 0);
		}
		const lavaC = document.createElement("canvas");
		const charC = document.createElement("canvas");
		lavaC.width = lavaC.height = size;
		charC.width = charC.height = size;
		const lCtx = lavaC.getContext("2d");
		const cCtx = charC.getContext("2d");
		const drawCracks = (ctx, widthMult, blurAmt) => {
			ctx.save();
			ctx.strokeStyle = "#ffffff";
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.shadowColor = "#ffffff";
			ctx.shadowBlur = blurAmt;
			ctx.lineWidth = 4.5 * widthMult;
			ctx.beginPath();
			const ringPts = 20;
			for (let i = 0; i <= ringPts; i++) {
				const a = i / ringPts * Math.PI * 2;
				const r = 34 + Math.sin(i * 3.7) * 9 + Math.cos(i * 5.3) * 6;
				const x = cx + Math.cos(a) * r;
				const y = cy + Math.sin(a) * r;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.closePath();
			ctx.stroke();
			for (let i = 0; i < segments.length; i++) {
				const seg = segments[i];
				ctx.lineWidth = seg.w * widthMult;
				ctx.beginPath();
				ctx.moveTo(seg.x1, seg.y1);
				ctx.lineTo(seg.x2, seg.y2);
				ctx.stroke();
			}
			ctx.restore();
		};
		drawCracks(cCtx, 2.6, 7);
		drawCracks(lCtx, 1, 2);
		const outC = document.createElement("canvas");
		outC.width = outC.height = size;
		const oCtx = outC.getContext("2d");
		const lData = lCtx.getImageData(0, 0, size, size).data;
		const cData = cCtx.getImageData(0, 0, size, size).data;
		const outImg = oCtx.createImageData(size, size);
		const out = outImg.data;
		for (let y = 0; y < size; y++) {
			const dy = (y - cy) / (size * .5);
			for (let x = 0; x < size; x++) {
				const dx = (x - cx) / (size * .5);
				const mask = 1 - smoothstep(.7, .88, Math.hypot(dx, dy));
				const idx = (y * size + x) * 4;
				const lVal = lData[idx + 3] * mask;
				const cVal = cData[idx + 3] * mask;
				out[idx] = Math.min(255, Math.round(lVal));
				out[idx + 1] = Math.min(255, Math.round(cVal));
				out[idx + 2] = 0;
				out[idx + 3] = Math.min(255, Math.round(Math.max(lVal, cVal)));
			}
		}
		oCtx.putImageData(outImg, 0, 0);
		const tex = new three.CanvasTexture(outC);
		tex.anisotropy = 4;
		tex.needsUpdate = true;
		return tex;
	}
	function createAnimeFlameNoiseTexture() {
		const size = 256;
		const canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext("2d");
		const img = ctx.createImageData(size, size);
		const data = img.data;
		const lattice = (width, height) => {
			const values = new Float64Array(width * height);
			for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
				const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
				values[y * width + x] = n - Math.floor(n);
			}
			return {
				width,
				height,
				values
			};
		};
		const octaves = (x, y, count) => Array.from({ length: count }, (_, i) => lattice(x << i, y << i));
		const warpOctaves = octaves(4, 4, 3);
		const redOctaves = octaves(7, 3, 4);
		const greenOctaves = octaves(5, 5, 4);
		const ridgeOctaves = octaves(12, 4, 3);
		const pNoise = (u, v, grid) => {
			const { width, height, values } = grid;
			const x = u * width, y = v * height;
			const ix = Math.floor(x), iy = Math.floor(y);
			const fx0 = x - ix, fy0 = y - iy;
			const sx = fx0 * fx0 * (3 - 2 * fx0);
			const sy = fy0 * fy0 * (3 - 2 * fy0);
			const wx = (ix % width + width) % width;
			const wy = (iy % height + height) % height;
			const nextX = wx + 1 === width ? 0 : wx + 1;
			const row = wy * width, nextRow = wy + 1 === height ? 0 : row + width;
			return lerp(lerp(values[row + wx], values[row + nextX], sx), lerp(values[nextRow + wx], values[nextRow + nextX], sx), sy);
		};
		const fbm = (u, v, grids) => {
			let sum = 0, amp = .5, norm = 0;
			for (let i = 0; i < grids.length; i++) {
				sum += pNoise(u, v, grids[i]) * amp;
				norm += amp;
				amp *= .5;
			}
			return sum / norm;
		};
		for (let y = 0; y < size; y++) {
			const v = y / size;
			for (let x = 0; x < size; x++) {
				const u = x / size;
				const wx = fbm(u + .17, v + .41, warpOctaves) - .5;
				const wy = fbm(u + .63, v + .23, warpOctaves) - .5;
				const r = fbm(u + wx * .16, v + wy * .12, redOctaves);
				const g = fbm(u + wx * .22 + .31, v + wy * .2 + .53, greenOctaves);
				const ridge = 1 - Math.abs(fbm(u + wx * .12, v, ridgeOctaves) * 2 - 1);
				const b = Math.pow(ridge, 1.9);
				const idx = (y * size + x) * 4;
				data[idx] = Math.floor(clamp01(r) * 255);
				data[idx + 1] = Math.floor(clamp01(g) * 255);
				data[idx + 2] = Math.floor(clamp01(b) * 255);
				data[idx + 3] = 255;
			}
		}
		ctx.putImageData(img, 0, 0);
		const tex = new three.CanvasTexture(canvas);
		tex.wrapS = tex.wrapT = three.RepeatWrapping;
		tex.anisotropy = 4;
		tex.needsUpdate = true;
		return tex;
	}
	function createThemeColorSet(themeKey) {
		const t = HELLFIRE_THEMES[themeKey] || HELLFIRE_THEMES.hellfire;
		return {
			char: new three.Color(t.char),
			dark: new three.Color(t.dark),
			mid: new three.Color(t.mid),
			highlight: new three.Color(t.highlight),
			coreBody: new three.Color(t.coreBody),
			coreHot: new three.Vector3(t.coreHot[0], t.coreHot[1], t.coreHot[2]),
			smokeDark: new three.Color(t.smokeDark),
			smokeMid: new three.Color(t.smokeMid),
			smokeBounce: new three.Color(t.smokeBounce),
			lightning: new three.Vector3(t.lightning[0], t.lightning[1], t.lightning[2]),
			circleBright: new three.Color(t.circleBright),
			circleMid: new three.Color(t.circleMid),
			crackHot: new three.Color(t.crackHot),
			crackCool: new three.Color(t.crackCool)
		};
	}
	function createMagicCircleMaterial(circleTex, noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.NormalBlending,
			side: three.DoubleSide,
			uniforms: {
				uMap: { value: circleTex },
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uEngrave: { value: 0 },
				uHeat: { value: 1 },
				uOpacity: { value: 1 },
				uChar: { value: colors.char },
				uCircleMid: { value: colors.circleMid },
				uCircleBright: { value: colors.circleBright }
			},
			vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform sampler2D uMap;
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uEngrave;
          uniform float uHeat;
          uniform float uOpacity;
          uniform vec3 uChar;
          uniform vec3 uCircleMid;
          uniform vec3 uCircleBright;
          varying vec2 vUv;

          void main() {
            vec2 p = vUv - 0.5;
            float dist = length(p) * 2.0;
            if (dist > 0.96 || dist > uEngrave + 0.04) discard;

            vec4 tex = texture2D(uMap, vUv);
            float runeCore = tex.r;
            float darkBacking = tex.g;
            if (tex.a < 0.04) discard;

            float reveal = 1.0 - smoothstep(uEngrave - 0.08, uEngrave + 0.02, dist);
            float n = texture2D(uNoise, vUv * 2.5 - vec2(0.0, uTime * 0.25)).r;
            float dissolve = smoothstep(0.05, 0.20, uOpacity - (1.0 - uOpacity) * n * 0.75);
            float alpha = tex.a * reveal * dissolve;
            if (alpha < 0.05) discard;

            float pulse = sin(dist * 12.0 - uTime * 6.5) * 0.5 + 0.5;
            float lit = clamp(runeCore * (0.65 + 0.35 * pulse) * uHeat, 0.0, 1.0);

            vec3 col = mix(uChar * 0.6, uCircleMid, smoothstep(0.20, 0.35, runeCore));
            col = mix(col, uCircleBright, smoothstep(0.55, 0.70, lit));
            col = min(col, vec3(0.84));

            gl_FragColor = vec4(col, alpha * clamp(darkBacking * 0.85 + runeCore, 0.0, 1.0));
          }
        `
		});
	}
	function createVolcanicCracksMaterial(cracksTex, noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.NormalBlending,
			uniforms: {
				uMap: { value: cracksTex },
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uSpread: { value: 0 },
				uHeat: { value: 1 },
				uOpacity: { value: 1 },
				uChar: { value: colors.char },
				uCrackCool: { value: colors.crackCool },
				uCrackHot: { value: colors.crackHot },
				uHighlight: { value: colors.highlight }
			},
			vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform sampler2D uMap;
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uSpread;
          uniform float uHeat;
          uniform float uOpacity;
          uniform vec3 uChar;
          uniform vec3 uCrackCool;
          uniform vec3 uCrackHot;
          uniform vec3 uHighlight;
          varying vec2 vUv;

          void main() {
            float dist = length(vUv - 0.5) * 2.0;
            if (dist > 0.90 || dist > uSpread + 0.03) discard;

            float circleMask = 1.0 - smoothstep(0.74, 0.90, dist);
            float spreadMask = 1.0 - smoothstep(uSpread - 0.14, uSpread + 0.02, dist);
            float mask = circleMask * spreadMask;
            if (mask < 0.02) discard;

            vec4 tex = texture2D(uMap, vUv);
            float lavaCore = tex.r;
            float charRim = tex.g;
            float alpha = tex.a * mask * uOpacity;
            if (alpha < 0.04) discard;

            float n = texture2D(uNoise, vUv * 3.0 + vec2(uTime * 0.08, -uTime * 0.18)).g;
            float pulse = 0.80 + 0.20 * sin(uTime * 7.0 - dist * 8.0 + n * 4.0);
            float temp = lavaCore * pulse * uHeat;

            vec3 col = uChar * 0.45;
            col = mix(col, uCrackCool, smoothstep(0.18, 0.30, lavaCore));
            col = mix(col, uCrackHot,  smoothstep(0.32, 0.45, temp));
            col = mix(col, uHighlight * 0.9, smoothstep(0.72, 0.84, temp));
            col = min(col, vec3(0.85));

            gl_FragColor = vec4(col, alpha * clamp(charRim * 0.8 + lavaCore, 0.0, 1.0));
          }
        `
		});
	}
	function createLavaTrailMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.NormalBlending,
			uniforms: {
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uStartZ: { value: -13.8 },
				uHeadZ: { value: -13.8 },
				uTrailW: { value: 2.95 },
				uHeadR: { value: 4.55 },
				uGlobalCool: { value: 0 },
				uOpacity: { value: 0 },
				uChar: { value: colors.char },
				uDark: { value: colors.dark },
				uMid: { value: colors.mid },
				uHighlight: { value: colors.highlight },
				uCrackCool: { value: colors.crackCool },
				uCrackHot: { value: colors.crackHot }
			},
			vertexShader: `
          varying vec2 vLocalXZ;
          void main() {
            vLocalXZ = position.xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uStartZ;
          uniform float uHeadZ;
          uniform float uTrailW;
          uniform float uHeadR;
          uniform float uGlobalCool;
          uniform float uOpacity;
          uniform vec3 uChar;
          uniform vec3 uDark;
          uniform vec3 uMid;
          uniform vec3 uHighlight;
          uniform vec3 uCrackCool;
          uniform vec3 uCrackHot;
          varying vec2 vLocalXZ;

          void main() {
            if (uOpacity < 0.01) discard;

            float x = vLocalXZ.x;
            float z = vLocalXZ.y;

            // Analytical AABB early-out BEFORE any texture fetches (major GPU fillrate win!)
            float maxR = uHeadR + 1.85;
            if (abs(x) > maxR || z < (uStartZ - maxR) || z > (uHeadZ + maxR)) discard;

            float boundsMask = (1.0 - smoothstep(7.2, 8.6, abs(x)))
                             * (1.0 - smoothstep(34.5, 37.5, abs(z)));
            if (boundsMask < 0.02) discard;

            vec2 uvFlow1 = vec2(x * 0.14, z * 0.11 - uTime * 0.07);
            vec2 uvFlow2 = vec2(x * 0.30 + 0.37, z * 0.24 + uTime * 0.04);
            vec3 n1 = texture2D(uNoise, uvFlow1).rgb;
            vec3 n2 = texture2D(uNoise, uvFlow2).rgb;

            float segZ = clamp(z, uStartZ, uHeadZ);
            float meander = (n1.r - 0.5) * 0.65 + sin(z * 0.65) * 0.16;
            float distTrail = length(vec2(x + meander, z - segZ));
            float distHead = length(vec2(x + meander * 0.45, z - uHeadZ));

            float jagged = (n1.g - 0.5) * 0.88 + (n2.b - 0.5) * 0.54;
            float normTrail = (distTrail + jagged) / uTrailW;
            float normHead = (distHead + jagged * 1.1) / uHeadR;
            float normD = min(normTrail, normHead);

            float erode = uGlobalCool * (0.55 + 0.55 * n1.g);
            float outerAlpha = (1.0 - smoothstep(0.92 - erode * 0.6, 1.16 - erode * 0.6, normD)) * boundsMask * uOpacity;
            if (outerAlpha < 0.04) discard;

            float distBehind = max(0.0, uHeadZ - z);
            float trailCool = clamp(distBehind / 24.0, 0.0, 0.72);
            float cool = clamp(trailCool + uGlobalCool * 0.92, 0.0, 1.0);

            float veinRidge = pow(n2.b, 1.35);
            float magmaPool = n1.r * 0.55 + n2.g * 0.45;
            float centerBias = clamp(1.0 - normD * 0.92, 0.0, 1.0);
            float pulse = 0.88 + 0.12 * sin(uTime * 6.5 - z * 1.8 + n1.r * 5.0);

            float heatField = (centerBias * 0.85 + veinRidge * 0.62 + magmaPool * 0.28 - cool * 0.78) * pulse;
            float crustMask = smoothstep(0.84, 0.98, normD);

            vec3 col = uChar * 0.48;
            col = mix(col, uCrackCool, smoothstep(0.16, 0.26, heatField) * (1.0 - crustMask));
            col = mix(col, uDark,      smoothstep(0.32, 0.40, heatField) * (1.0 - crustMask));
            col = mix(col, uMid,       smoothstep(0.50, 0.58, heatField) * (1.0 - crustMask));
            col = mix(col, uCrackHot,  smoothstep(0.64, 0.72, heatField) * (1.0 - crustMask));
            col = mix(col, uHighlight * 0.92, smoothstep(0.76, 0.84, heatField) * (1.0 - crustMask));
            col = min(col, vec3(0.86));

            gl_FragColor = vec4(col, outerAlpha * 0.96);
          }
        `
		});
	}
	function createInnerCoreMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: false,
			depthWrite: true,
			blending: three.NormalBlending,
			side: three.FrontSide,
			uniforms: {
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uDissolve: { value: 0 },
				uMid: { value: colors.mid },
				uCoreBody: { value: colors.coreBody },
				uCoreHot: { value: colors.coreHot }
			},
			vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;

          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(uv.y * 14.0 - uTime * 22.0) * 0.06;
            pos.xz *= (1.0 + wave);
            vec4 wp = modelMatrix * vec4(pos, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uDissolve;
          uniform vec3 uMid;
          uniform vec3 uCoreBody;
          uniform vec3 uCoreHot;
          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;

          void main() {
            float ndv = abs(dot(normalize(vNormalW), normalize(vViewDir)));

            vec2 uv1 = vec2(vUv.x * 2.0, vUv.y * 1.4 - uTime * 3.4);
            vec2 uv2 = vec2(vUv.x * 3.0 + 0.4, vUv.y * 2.2 - uTime * 4.8);
            float n = texture2D(uNoise, uv1).r * 0.65 + texture2D(uNoise, uv2).b * 0.35;

            float topCut = 1.0 - smoothstep(0.84, 1.0, vUv.y + (n - 0.5) * 0.22);
            float shape = n * 0.6 + (1.0 - vUv.y * 0.25) * 0.55 - uDissolve * 1.35;
            if (shape < 0.24 || topCut < 0.15) discard;

            vec3 col = uMid * 0.92;
            col = mix(col, uCoreBody * 0.92, smoothstep(0.32, 0.40, ndv + n * 0.15));
            float hotAxis = smoothstep(0.72, 0.84, ndv + (n - 0.45) * 0.14) * (1.0 - uDissolve * 0.8);
            col = mix(col, uCoreHot, hotAxis);

            gl_FragColor = vec4(col, 1.0);
          }
        `
		});
	}
	function createCelFlameMaterial(noiseTex, colors, isOuterTongues = false) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.NormalBlending,
			side: three.DoubleSide,
			uniforms: {
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uDissolve: { value: 0 },
				uIsOuter: { value: isOuterTongues ? 1 : 0 },
				uForwardDrag: { value: 0 },
				uChar: { value: colors.char },
				uDark: { value: colors.dark },
				uMid: { value: colors.mid },
				uHighlight: { value: colors.highlight }
			},
			vertexShader: `
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uIsOuter;
          uniform float uForwardDrag;

          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float ang = atan(pos.z, pos.x);
            float flutes = sin(ang * (uIsOuter > 0.5 ? 8.0 : 6.0) - uv.y * 4.5 + uTime * 4.2) * 0.16;
            vec2 dUv = vec2(uv.x * 2.0 + uv.y * 0.30, uv.y * 1.1 - uTime * (uIsOuter > 0.5 ? 2.2 : 1.85));
            float n = texture2D(uNoise, dUv).r;

            vec2 radial = normalize(pos.xz + vec2(0.0001));
            float dispAmt = (0.24 + uv.y * 0.48) * (uIsOuter > 0.5 ? 1.25 : 0.88);
            pos.xz += radial * ((n - 0.42) * dispAmt + flutes * (0.45 + uv.y * 0.6));
            pos.z -= pow(uv.y, 1.75) * uForwardDrag * (uIsOuter > 0.5 ? 2.15 : 1.45);

            vec4 wp = modelMatrix * vec4(pos, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uDissolve;
          uniform float uIsOuter;
          uniform vec3 uChar;
          uniform vec3 uDark;
          uniform vec3 uMid;
          uniform vec3 uHighlight;

          varying vec2 vUv;
          varying vec3 vNormalW;
          varying vec3 vViewDir;

          void main() {
            float ndv = abs(dot(normalize(vNormalW), normalize(vViewDir)));

            float twist = vUv.y * (uIsOuter > 0.5 ? -0.40 : 0.34);
            vec2 uv1 = vec2(vUv.x * 3.0 + twist, vUv.y * 1.35 - uTime * (uIsOuter > 0.5 ? 2.55 : 2.1));
            vec2 uv2 = vec2(vUv.x * 5.0 - twist * 1.1 + 0.37, vUv.y * 2.2 - uTime * (uIsOuter > 0.5 ? 3.4 : 2.9));

            vec3 n1 = texture2D(uNoise, uv1).rgb;
            vec3 n2 = texture2D(uNoise, uv2).rgb;
            float flameField = n1.r * 0.54 + n2.g * 0.28 + n2.b * 0.26;

            float heightGrad = mix(0.22, -0.36, pow(vUv.y, 1.15));
            float shellCut = uIsOuter > 0.5 ? -0.14 : -0.02;
            float dissolveSweep = uDissolve * 1.38;

            float shape = flameField + heightGrad + shellCut - dissolveSweep;

            float cutout = smoothstep(0.30, 0.335, shape);
            float topFade = 1.0 - smoothstep(0.90, 1.0, vUv.y);
            float alpha = cutout * topFade;
            if (alpha < 0.08) discard;

            float baseStreak = mix(0.10, 0.22, n2.b) * (1.0 - smoothstep(0.0, 0.16, vUv.y));
            float heat = shape + (1.0 - vUv.y) * 0.06 + baseStreak + ndv * 0.10 - uIsOuter * 0.10;
            float groundSeamWave = 0.018 + n1.r * 0.022;
            float groundSeamOutline = smoothstep(groundSeamWave * 0.55, groundSeamWave * 1.35, vUv.y);
            float outlineMask = smoothstep(0.33, 0.40, shape)
                              * smoothstep(0.14, 0.28, ndv)
                              * mix(0.38, 1.0, groundSeamOutline);

            vec3 col = uChar;
            col = mix(col, uDark,      smoothstep(0.36, 0.39, heat) * outlineMask);
            col = mix(col, uMid,       smoothstep(0.54, 0.575, heat) * outlineMask);
            col = mix(col, uHighlight, smoothstep(0.76, 0.795, heat) * outlineMask);
            col = min(col, vec3(0.86));

            gl_FragColor = vec4(col, alpha * (uIsOuter > 0.5 ? 0.90 : 0.95));
          }
        `
		});
	}
	function createBatchedSpiralRibbonMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: false,
			depthWrite: true,
			blending: three.NormalBlending,
			side: three.DoubleSide,
			uniforms: {
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uSpinTime: { value: 0 },
				uDissolve: { value: 0 },
				uChar: { value: colors.char },
				uDark: { value: colors.dark },
				uMid: { value: colors.mid },
				uHighlight: { value: colors.highlight }
			},
			vertexShader: `
          attribute vec3 aRibbonMeta; // x = spinSpeed, y = uvSpeed, z = uvOffset
          uniform float uSpinTime;
          varying vec2 vUv;
          varying vec2 vRibbonUv;

          void main() {
            vUv = uv;
            vRibbonUv = aRibbonMeta.yz;
            float a = uSpinTime * aRibbonMeta.x;
            float ca = cos(a);
            float sa = sin(a);
            vec3 p = position;
            p.x = position.x * ca + position.z * sa;
            p.z = -position.x * sa + position.z * ca;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uDissolve;
          uniform vec3 uChar;
          uniform vec3 uDark;
          uniform vec3 uMid;
          uniform vec3 uHighlight;
          varying vec2 vUv;
          varying vec2 vRibbonUv;

          void main() {
            float across = 1.0 - abs(vUv.y * 2.0 - 1.0);
            float ends = smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.78, 1.0, vUv.x));

            float spd = vRibbonUv.x;
            float off = vRibbonUv.y;
            vec2 uv1 = vec2(vUv.x * 3.0 - uTime * spd + off, vUv.y * 1.4);
            vec2 uv2 = vec2(vUv.x * 5.5 - uTime * (spd * 1.35) + off * 1.7, vUv.y * 2.0);
            float n = texture2D(uNoise, uv1).r * 0.62 + texture2D(uNoise, uv2).b * 0.38;

            float val = (0.35 + 0.78 * n) * across * ends;
            float thresh = 0.24 + uDissolve * 0.72;
            if (val < thresh) discard;

            float band = val - thresh;
            vec3 col = uChar;
            col = mix(col, uDark,      smoothstep(0.04, 0.065, band));
            col = mix(col, uMid,       smoothstep(0.14, 0.17, band));
            col = mix(col, uHighlight, smoothstep(0.30, 0.34, band));
            col = min(col, vec3(0.85));

            gl_FragColor = vec4(col, 1.0);
          }
        `
		});
	}
	function createRimLitToonSmokeMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: false,
			depthWrite: true,
			blending: three.NormalBlending,
			uniforms: {
				uNoise: { value: noiseTex },
				uLightPower: { value: 1 },
				uPillarWorldPos: { value: new three.Vector3() },
				uSmokeDark: { value: colors.smokeDark },
				uSmokeMid: { value: colors.smokeMid },
				uSmokeBounce: { value: colors.smokeBounce },
				uHighlight: { value: colors.highlight }
			},
			vertexShader: `
          varying vec3 vNormalW;
          varying vec3 vWorldPos;
          varying vec3 vViewDir;
          varying vec3 vLocalPos;
          varying vec3 vInstData;

          void main() {
            vLocalPos = position;
            vInstData = vec3(1.0);
            #ifdef USE_INSTANCING_COLOR
              vInstData = instanceColor;
            #endif

            mat4 instM = mat4(1.0);
            #ifdef USE_INSTANCING
              instM = instanceMatrix;
            #endif

            vec4 wp = modelMatrix * instM * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            vNormalW = normalize(mat3(modelMatrix) * mat3(instM) * normal);
            vViewDir = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uLightPower;
          uniform vec3 uPillarWorldPos;
          uniform vec3 uSmokeDark;
          uniform vec3 uSmokeMid;
          uniform vec3 uSmokeBounce;
          uniform vec3 uHighlight;

          varying vec3 vNormalW;
          varying vec3 vWorldPos;
          varying vec3 vViewDir;
          varying vec3 vLocalPos;
          varying vec3 vInstData;

          void main() {
            float dissolve = vInstData.r;
            float heat = vInstData.g;
            if (dissolve > 0.96) discard;

            float n = texture2D(uNoise, vLocalPos.xy * 0.7 + vLocalPos.zy * 0.7).g;
            if (n < dissolve) discard;

            vec3 N = normalize(vNormalW);
            vec3 V = normalize(vViewDir);
            float relY = clamp((vWorldPos.y - uPillarWorldPos.y) * 0.7 + 1.2, 0.8, 12.0);
            vec3 corePos = vec3(uPillarWorldPos.x, uPillarWorldPos.y + relY, uPillarWorldPos.z);
            vec3 L = normalize(corePos - vWorldPos);

            float facingCore = clamp(dot(N, L), 0.0, 1.0);
            float underSide = clamp(-N.y * 0.58 + facingCore * 0.85, 0.0, 1.0);
            float rim = pow(1.0 - max(dot(N, V), 0.0), 2.2);

            vec3 col = uSmokeDark;
            col = mix(col, uSmokeMid, smoothstep(0.15, 0.22, underSide + rim * 0.28));
            col = mix(col, uSmokeBounce * 0.94, smoothstep(0.42, 0.48, underSide + rim * 0.18 * facingCore) * uLightPower * heat);
            col = mix(col, uHighlight * 0.84, smoothstep(0.72, 0.78, underSide + rim * 0.38 * facingCore) * uLightPower * heat);

            col = min(col, vec3(0.82));
            gl_FragColor = vec4(col, 1.0);
          }
        `
		});
	}
	function createObsidianShardMaterial(colors) {
		return new three.ShaderMaterial({
			transparent: false,
			depthWrite: true,
			blending: three.NormalBlending,
			uniforms: {
				uLightPower: { value: 1 },
				uPillarWorldPos: { value: new three.Vector3() },
				uChar: { value: colors.char },
				uSmokeBounce: { value: colors.smokeBounce },
				uHighlight: { value: colors.highlight }
			},
			vertexShader: `
          varying vec3 vNormalW;
          varying vec3 vWorldPos;
          varying vec3 vLocalPos;
          varying vec3 vViewDir;

          void main() {
            vLocalPos = position;
            mat4 instM = mat4(1.0);
            #ifdef USE_INSTANCING
              instM = instanceMatrix;
            #endif
            vec4 wp = modelMatrix * instM * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            vNormalW = normalize(mat3(modelMatrix) * mat3(instM) * normal);
            vViewDir = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
			fragmentShader: `
          uniform float uLightPower;
          uniform vec3 uPillarWorldPos;
          uniform vec3 uChar;
          uniform vec3 uSmokeBounce;
          uniform vec3 uHighlight;
          varying vec3 vNormalW;
          varying vec3 vWorldPos;
          varying vec3 vLocalPos;
          varying vec3 vViewDir;

          void main() {
            vec3 N = normalize(vNormalW);
            vec3 V = normalize(vViewDir);
            float relY = clamp(vWorldPos.y - uPillarWorldPos.y, 1.5, 10.0);
            vec3 L = normalize(vec3(uPillarWorldPos.x, uPillarWorldPos.y + relY, uPillarWorldPos.z) - vWorldPos);
            float cel = step(0.35, dot(N, L));
            float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * max(dot(N, L), 0.0);

            float veinPattern = abs(sin(vLocalPos.x * 16.0 + vLocalPos.y * 11.0) * cos(vLocalPos.z * 14.0 - vLocalPos.x * 8.0));
            float vein = smoothstep(0.84, 0.91, veinPattern);

            vec3 obsidian = mix(vec3(0.05, 0.04, 0.07), uChar, 0.45);
            vec3 col = mix(obsidian, obsidian + uSmokeBounce * 0.42, cel * uLightPower);
            col += uSmokeBounce * smoothstep(0.25, 0.45, rim) * 0.65 * uLightPower;
            col = mix(col, mix(uSmokeBounce, uHighlight, 0.65) * 0.96, vein * uLightPower);

            gl_FragColor = vec4(col, 1.0);
          }
        `
		});
	}
	function createLavaBurstMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			depthWrite: true,
			side: three.FrontSide,
			uniforms: {
				uNoise: { value: noiseTex },
				uAge: { value: 0 },
				uChar: { value: colors.char },
				uDark: { value: colors.dark },
				uMid: { value: colors.mid },
				uHighlight: { value: colors.highlight },
				uCoreHot: { value: colors.coreHot },
				uSmokeDark: { value: colors.smokeDark },
				uSmokeMid: { value: colors.smokeMid }
			},
			vertexShader: `
          varying vec3 vShape;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vOutside;
          varying float vSeed;

          void main() {
            vSeed = instanceColor.r;
            vShape = position;
            vec3 p = position * (1.0 + 0.13 * sin(position.y * 9.0 + position.x * 5.0 + vSeed * 7.0)
                                    + 0.10 * cos(position.z * 8.0 - position.y * 3.0 - vSeed * 9.0));
            vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
            mat3 basis = mat3(instanceMatrix);
            vec3 invScaleSq = 1.0 / vec3(dot(basis[0], basis[0]), dot(basis[1], basis[1]), dot(basis[2], basis[2]));
            vNormal = normalize(normalMatrix * basis * (normal * invScaleSq));
            vec3 center = instanceMatrix[3].xyz;
            vOutside = normalize(mat3(modelViewMatrix) * vec3(center.x, 0.0, center.z));
            vView = -mv.xyz;
            gl_Position = projectionMatrix * mv;
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uAge;
          uniform vec3 uChar;
          uniform vec3 uDark;
          uniform vec3 uMid;
          uniform vec3 uHighlight;
          uniform vec3 uCoreHot;
          uniform vec3 uSmokeDark;
          uniform vec3 uSmokeMid;
          varying vec3 vShape;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vOutside;
          varying float vSeed;

          void main() {
            vec3 n = normalize(vNormal);
            float rim = 1.0 - max(0.0, dot(n, normalize(vView)));
            float coarse = texture2D(uNoise, vShape.xy * 0.55 + vShape.z * 0.32 + vec2(vSeed, -uAge * 0.9)).r;
            float fine = texture2D(uNoise, vShape.zy * 1.20 + vec2(vSeed * 1.9, uAge * 0.5)).b;
            float field = coarse * 0.71 + fine * 0.29;
            // Erode the cooled skin along stable seams, leaving no invisible depth behind.
            float ashField = texture2D(uNoise, vShape.xy * 0.55 + vShape.zy * 0.26 + vec2(vSeed * 2.6, vSeed)).g;
            float erosion = smoothstep(0.26 + vSeed * 0.04, ${BURST_SURFACE_END.toFixed(2)}, uAge);
            if (ashField + (vShape.y + 1.0) * 0.065 - rim * 0.12 < -0.06 + erosion * 1.21) discard;

            float outer = smoothstep(0.10, 0.78, dot(n, normalize(vOutside)));
            float hot = field + n.y * 0.14 - vShape.y * 0.14 - uAge * 0.47 + outer * 0.10;
            vec3 col = mix(uChar, uDark, smoothstep(0.19, 0.25, hot));
            col = mix(col, uMid, smoothstep(0.28, 0.36, hot));
            col = mix(col, uHighlight, smoothstep(0.41, 0.48, hot));
            col = mix(col, uCoreHot, smoothstep(0.58, 0.68, hot) * (1.0 - smoothstep(0.02, 0.13, uAge)));
            float edge = rim * rim * (0.18 + outer * 0.26) * (1.0 - smoothstep(0.22, 0.48, uAge));
            col += uMid * edge;
            float cooling = smoothstep(0.17, 0.60, uAge);
            vec3 smokeTone = mix(uSmokeDark, uSmokeMid, smoothstep(0.25, 0.76, ashField));
            smokeTone = mix(smokeTone, vec3(0.115, 0.105, 0.11), 0.28 + 0.26 * rim + ashField * 0.14);
            col = mix(col, smokeTone, cooling);
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `
		});
	}
	function createLavaBurstSmokeMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms: {
				uNoise: { value: noiseTex },
				uAge: { value: 0 },
				uSmokeDark: { value: colors.smokeDark },
				uSmokeMid: { value: colors.smokeMid },
				uSmokeBounce: { value: colors.smokeBounce }
			},
			vertexShader: `
          varying vec2 vPuff;
          varying float vSeed;
          void main() {
            vPuff = position.xy;
            vSeed = instanceColor.r;
            vec4 mv = modelViewMatrix * instanceMatrix[3];
            mv.xy += position.xy * vec2(length(modelMatrix[0].xyz * instanceMatrix[0].x),
                                        length(modelMatrix[1].xyz * instanceMatrix[1].y));
            gl_Position = projectionMatrix * mv;
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uAge;
          uniform vec3 uSmokeDark;
          uniform vec3 uSmokeMid;
          uniform vec3 uSmokeBounce;
          varying vec2 vPuff;
          varying float vSeed;
          void main() {
            float age = clamp((uAge - vSeed * 0.11) / (0.89 + vSeed * 0.11), 0.0, 1.0);
            float fade = smoothstep(0.0, 0.13, age) * (1.0 - smoothstep(0.24 + vSeed * 0.23, 0.89 + vSeed * 0.11, age));
            vec2 uv = vPuff * vec2(0.30, 0.35) + vec2(vSeed * 4.0, -age * 0.14);
            vec2 noise = texture2D(uNoise, uv).rg;
            float swirl = texture2D(uNoise, uv * 1.67 + (noise - 0.5) * 0.18).g;
            float rim = length(vPuff) + (noise.r - 0.5) * 0.43;
            float edge = 1.0 - smoothstep(0.28, 0.89, rim);
            float gaps = smoothstep(0.29 + age * 0.08, 0.69, swirl);
            float alpha = edge * (0.38 + gaps * 0.62) * fade * 0.76;
            if (alpha < 0.004) discard;
            vec3 col = mix(uSmokeDark, uSmokeMid, 0.36 + gaps * 0.64);
            col = mix(col, vec3(0.115, 0.105, 0.11), 0.48 + gaps * 0.28);
            col += uSmokeBounce * (1.0 - smoothstep(0.0, 0.30, age)) * gaps * 0.14;
            gl_FragColor = vec4(col, alpha);
            #include <colorspace_fragment>
          }
        `
		});
	}
	function createLavaBurstFlashMaterial(colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.AdditiveBlending,
			uniforms: {
				uAge: { value: 0 },
				uHighlight: { value: colors.highlight },
				uCoreHot: { value: colors.coreHot }
			},
			vertexShader: `
          varying vec2 vFlash;
          void main() {
            vFlash = position.xy;
            vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            mv.xy += position.xy * vec2(length(modelViewMatrix[0].xyz), length(modelViewMatrix[1].xyz));
            gl_Position = projectionMatrix * mv;
          }
        `,
			fragmentShader: `
          uniform float uAge;
          uniform vec3 uHighlight;
          uniform vec3 uCoreHot;
          varying vec2 vFlash;
          void main() {
            float r = length(vFlash);
            float core = (1.0 - smoothstep(0.08, 0.43, r)) * (1.0 - smoothstep(0.0, 0.10, uAge));
            float halo = pow(max(0.0, 1.0 - r), 2.4) * (1.0 - smoothstep(0.0, 0.23, uAge));
            gl_FragColor = vec4(mix(uHighlight, uCoreHot, core), core * 0.64 + halo * 0.36);
            #include <colorspace_fragment>
          }
        `
		});
	}
	function createBaseSplashMaterial(noiseTex, colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.NormalBlending,
			side: three.DoubleSide,
			uniforms: {
				uNoise: { value: noiseTex },
				uTime: { value: 0 },
				uDissolve: { value: 0 },
				uChar: { value: colors.char },
				uDark: { value: colors.dark },
				uMid: { value: colors.mid },
				uHighlight: { value: colors.highlight }
			},
			vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform sampler2D uNoise;
          uniform float uTime;
          uniform float uDissolve;
          uniform vec3 uChar;
          uniform vec3 uDark;
          uniform vec3 uMid;
          uniform vec3 uHighlight;
          varying vec2 vUv;

          void main() {
            vec2 uv1 = vec2(vUv.x * 6.0, vUv.y * 1.4 - uTime * 1.75);
            vec2 uv2 = vec2(vUv.x * 10.0 + 0.31, vUv.y * 2.2 - uTime * 2.4);
            vec3 n1 = texture2D(uNoise, uv1).rgb;
            vec3 n2 = texture2D(uNoise, uv2).rgb;

            float wave = n1.r * 0.58 + n2.b * 0.42;
            float radialBody = (1.0 - vUv.y) * 0.92 + wave * 0.56 - uDissolve * 1.25;
            float edge = smoothstep(0.36, 0.41, radialBody);
            if (edge < 0.05) discard;

            vec3 col = uChar;
            col = mix(col, uDark,      smoothstep(0.41, 0.45, radialBody));
            col = mix(col, uMid,       smoothstep(0.58, 0.62, radialBody));
            col = mix(col, uHighlight, smoothstep(0.80, 0.85, radialBody));
            col = min(col, vec3(0.85));

            gl_FragColor = vec4(col, edge * 0.95);
          }
        `
		});
	}
	function createFocalRingMaterial(colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.AdditiveBlending,
			side: three.DoubleSide,
			uniforms: {
				uOpacity: { value: 0 },
				uHighlight: { value: colors.highlight },
				uCoreHot: { value: colors.coreHot }
			},
			vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform float uOpacity;
          uniform vec3 uHighlight;
          uniform vec3 uCoreHot;
          varying vec2 vUv;
          void main() {
            float band = sin(vUv.y * 3.14159265);
            float edge = smoothstep(0.25, 0.65, band);
            vec3 col = mix(uHighlight * 0.85, uCoreHot * 0.96, smoothstep(0.55, 0.9, band));
            gl_FragColor = vec4(col, edge * uOpacity);
          }
        `
		});
	}
	function createLightningMaterial(colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.AdditiveBlending,
			side: three.DoubleSide,
			uniforms: {
				uColor: { value: colors.lightning },
				uOpacity: { value: 0 }
			},
			vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float center = 1.0 - abs(vUv.y * 2.0 - 1.0);
            float ends = smoothstep(0.0, 0.10, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
            float mask = smoothstep(0.18, 0.55, center) * ends;
            if (mask < 0.04) discard;
            gl_FragColor = vec4(uColor, mask * uOpacity);
          }
        `
		});
	}
	function createSparkMaterial(colors) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.AdditiveBlending,
			side: three.DoubleSide,
			uniforms: {
				uDark: { value: colors.dark },
				uMid: { value: colors.mid },
				uHighlight: { value: colors.highlight },
				uCoreHot: { value: colors.coreHot }
			},
			vertexShader: `
          varying vec2 vUv;
          varying vec3 vInstData;
          void main() {
            vUv = uv;
            vInstData = vec3(1.0);
            #ifdef USE_INSTANCING_COLOR
              vInstData = instanceColor;
            #endif
            mat4 instM = mat4(1.0);
            #ifdef USE_INSTANCING
              instM = instanceMatrix;
            #endif
            gl_Position = projectionMatrix * modelViewMatrix * instM * vec4(position, 1.0);
          }
        `,
			fragmentShader: `
          uniform vec3 uDark;
          uniform vec3 uMid;
          uniform vec3 uHighlight;
          uniform vec3 uCoreHot;
          varying vec2 vUv;
          varying vec3 vInstData;

          void main() {
            float heat = vInstData.r;
            float alpha = vInstData.g;
            if (alpha < 0.03) discard;

            vec2 p = abs(vUv - 0.5) * 2.0;
            float diamond = 1.0 - (p.x * 1.1 + p.y * 0.95);
            float mask = smoothstep(0.05, 0.22, diamond);
            if (mask < 0.04) discard;

            vec3 col = uDark;
            col = mix(col, uMid, smoothstep(0.20, 0.35, heat));
            col = mix(col, uHighlight, smoothstep(0.50, 0.65, heat));
            col = mix(col, uCoreHot, smoothstep(0.78, 0.92, heat * diamond * 1.25));

            gl_FragColor = vec4(col, mask * alpha);
          }
        `
		});
	}
	function createSculptedPillarGeometry(height, baseR, topR, radialSegs, heightSegs) {
		const geo = new three.CylinderGeometry(topR, baseR, height, radialSegs, heightSegs, true);
		geo.translate(0, height / 2, 0);
		const pos = geo.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
			const h = clamp01(y / height);
			const baseFlare = Math.pow(clamp01(1 - h * 3.5), 2.2) * .58;
			const waistPinch = -Math.sin(Math.min(h * 2.2, 1) * Math.PI) * .08;
			const topSpread = Math.pow(h, 2.2) * .26;
			const m = 1 + baseFlare + waistPinch + topSpread;
			pos.setXYZ(i, x * m, y, z * m);
		}
		geo.computeVertexNormals();
		return geo;
	}
	function createBatchedHelicalRibbonsGeometry() {
		const configs = [
			{
				height: 18.8,
				turns: 2.2,
				radBottom: 2.5,
				radTop: 3.35,
				widthBottom: 1.25,
				widthTop: .34,
				phase: 0,
				dir: 1,
				spin: 3.1,
				uvSpd: 2.2
			},
			{
				height: 17.6,
				turns: 2.5,
				radBottom: 2.85,
				radTop: 3.75,
				widthBottom: 1.1,
				widthTop: .3,
				phase: Math.PI * .68,
				dir: 1,
				spin: 3.7,
				uvSpd: 2.6
			},
			{
				height: 16,
				turns: 2,
				radBottom: 3.15,
				radTop: 4.1,
				widthBottom: .95,
				widthTop: .26,
				phase: Math.PI * 1.38,
				dir: -1,
				spin: -2.5,
				uvSpd: 2.4
			}
		];
		const segs = 72;
		const positions = [];
		const uvs = [];
		const metas = [];
		const indices = [];
		let vertOffset = 0;
		for (let rIdx = 0; rIdx < configs.length; rIdx++) {
			const cfg = configs[rIdx];
			const uvOff = rIdx * .33;
			for (let i = 0; i <= segs; i++) {
				const t = i / segs;
				const ang = cfg.phase + cfg.dir * t * cfg.turns * Math.PI * 2;
				const y = t * cfg.height;
				const rad = lerp(cfg.radBottom, cfg.radTop, Math.pow(t, .85)) + Math.sin(t * Math.PI * 2) * .28;
				const halfW = lerp(cfg.widthBottom, cfg.widthTop, t) * Math.sin(Math.min(t * 5, 1) * Math.PI * .5);
				const cx = Math.cos(ang) * rad;
				const cz = Math.sin(ang) * rad;
				const ox = Math.cos(ang) * halfW * .35;
				const oz = Math.sin(ang) * halfW * .35;
				positions.push(cx - ox, y - halfW * .88, cz - oz);
				positions.push(cx + ox, y + halfW * .88, cz + oz);
				uvs.push(t, 0, t, 1);
				metas.push(cfg.spin, cfg.uvSpd, uvOff, cfg.spin, cfg.uvSpd, uvOff);
				if (i < segs) {
					const b = vertOffset + i * 2;
					indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
				}
			}
			vertOffset += 146;
		}
		const geo = new three.BufferGeometry();
		geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		geo.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
		geo.setAttribute("aRibbonMeta", new three.Float32BufferAttribute(metas, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();
		return geo;
	}
	function createBaseCrownGeometry(innerR, outerR, height, spikes) {
		const geo = new three.CylinderGeometry(outerR, innerR, height, spikes * 3, 6, true);
		geo.translate(0, height / 2, 0);
		const pos = geo.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
			const h = clamp01(y / height);
			const petal = .45 + .55 * Math.pow(Math.abs(Math.sin(Math.atan2(z, x) * spikes * .5)), .7);
			const flare = 1 + Math.pow(h, 1.4) * (.4 + .32 * petal);
			pos.setXYZ(i, x * flare, Math.max(0, y) * petal, z * flare);
		}
		geo.computeVertexNormals();
		return geo;
	}
	function createPolarRingGeometry(innerR, outerR, segs = 40) {
		const geo = new three.RingGeometry(innerR, outerR, segs, 1);
		geo.rotateX(-Math.PI / 2);
		const pos = geo.attributes.position;
		const uv = geo.attributes.uv;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i), z = pos.getZ(i);
			const r = Math.hypot(x, z);
			const a = (Math.atan2(z, x) + Math.PI) / (Math.PI * 2);
			uv.setXY(i, a, clamp01((r - innerR) / (outerR - innerR)));
		}
		return geo;
	}
	function createObsidianShardGeometry() {
		const geo = new three.DodecahedronGeometry(.42, 0);
		const pos = geo.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
			const s = .7 + (Math.sin(x * 17.3 + y * 29.7 + z * 43.1) * .5 + .5) * .55;
			pos.setXYZ(i, x * s, y * s * 1.25, z * s);
		}
		geo.computeVertexNormals();
		return geo;
	}
	function createSparkStarGeometry() {
		const positions = [
			-.08,
			-.48,
			0,
			.08,
			-.48,
			0,
			.08,
			.48,
			0,
			-.08,
			.48,
			0,
			0,
			-.48,
			-.08,
			0,
			-.48,
			.08,
			0,
			.48,
			.08,
			0,
			.48,
			-.08
		];
		const uvs = [
			0,
			0,
			1,
			0,
			1,
			1,
			0,
			1,
			0,
			0,
			1,
			0,
			1,
			1,
			0,
			1
		];
		const indices = [
			0,
			1,
			2,
			0,
			2,
			3,
			4,
			5,
			6,
			4,
			6,
			7
		];
		const geo = new three.BufferGeometry();
		geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		geo.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
		geo.setIndex(indices);
		return geo;
	}
	function createBatchedLightningGeometry(arcCount = 6, segs = 16) {
		const vertsPerArc = (segs + 1) * 2;
		const totalVerts = arcCount * vertsPerArc;
		const positions = new Float32Array(totalVerts * 3);
		const uvs = new Float32Array(totalVerts * 2);
		const indices = [];
		for (let a = 0; a < arcCount; a++) {
			const vOff = a * vertsPerArc;
			for (let s = 0; s <= segs; s++) {
				const u = s / segs;
				const uvIdx = (vOff + s * 2) * 2;
				uvs[uvIdx + 0] = u;
				uvs[uvIdx + 1] = 0;
				uvs[uvIdx + 2] = u;
				uvs[uvIdx + 3] = 1;
				if (s < segs) {
					const b = vOff + s * 2;
					indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
				}
			}
		}
		const geo = new three.BufferGeometry();
		const posAttr = new three.BufferAttribute(positions, 3);
		posAttr.setUsage(three.DynamicDrawUsage);
		geo.setAttribute("position", posAttr);
		geo.setAttribute("uv", new three.BufferAttribute(uvs, 2));
		geo.setIndex(indices);
		return geo;
	}
	var HellfirePillarVFX = class HellfirePillarVFX {
		static _shared = null;
		static _refCount = 0;
		/**
		* Acquires shared procedural textures & static geometries across all active instances.
		* Multiple casts in a game share 1 set of GPU textures & vertex buffers!
		*/
		static acquireSharedAssets() {
			if (!HellfirePillarVFX._shared) {
				const PILLAR_H = 19.5;
				const coreGeo = new three.CylinderGeometry(.92, .88, PILLAR_H, 20, 14, true);
				coreGeo.translate(0, PILLAR_H / 2, 0);
				const texture = (create) => typeof document === "undefined" ? new three.Texture() : create();
				HellfirePillarVFX._shared = {
					magicCircleTex: texture(createMagicCircleTexture),
					volcanicCracksTex: texture(createVolcanicCracksTexture),
					flameNoiseTex: texture(createAnimeFlameNoiseTexture),
					pillarGlowTex: createPillarGlowTexture(),
					cracksGeo: new three.PlaneGeometry(16, 16).rotateX(-Math.PI / 2),
					lavaTrailGeo: new three.PlaneGeometry(18, 76).rotateX(-Math.PI / 2),
					circleGeo: new three.PlaneGeometry(10.8, 10.8).rotateX(-Math.PI / 2),
					focalRingGeo: createPolarRingGeometry(.85, 1.35, 36),
					lavaBurstGeo: new three.IcosahedronGeometry(1, 3),
					lavaBurstFlashGeo: new three.PlaneGeometry(2, 2),
					baseSplashGeo: createPolarRingGeometry(1.5, 5.1, 48),
					coreGeo,
					mainPillarGeo: createSculptedPillarGeometry(PILLAR_H, 2.1, 2.35, 32, 24),
					outerTonguesGeo: createSculptedPillarGeometry(PILLAR_H * .94, 2.48, 2.95, 28, 20),
					baseCrownGeo: createBaseCrownGeometry(2.95, 5.15, 3.8, 16),
					ribbonsGeo: createBatchedHelicalRibbonsGeometry(),
					smokeGeo: new three.IcosahedronGeometry(.92, 1),
					rockGeo: createObsidianShardGeometry(),
					sparkGeo: createSparkStarGeometry()
				};
			}
			HellfirePillarVFX._refCount++;
			return HellfirePillarVFX._shared;
		}
		static releaseSharedAssets() {
			HellfirePillarVFX._refCount = Math.max(0, HellfirePillarVFX._refCount - 1);
			if (HellfirePillarVFX._refCount === 0 && HellfirePillarVFX._shared) {
				const s = HellfirePillarVFX._shared;
				s.magicCircleTex.dispose();
				s.volcanicCracksTex.dispose();
				s.flameNoiseTex.dispose();
				s.pillarGlowTex.dispose();
				s.cracksGeo.dispose();
				s.lavaTrailGeo.dispose();
				s.circleGeo.dispose();
				s.focalRingGeo.dispose();
				s.lavaBurstGeo.dispose();
				s.lavaBurstFlashGeo.dispose();
				s.baseSplashGeo.dispose();
				s.coreGeo.dispose();
				s.mainPillarGeo.dispose();
				s.outerTonguesGeo.dispose();
				s.baseCrownGeo.dispose();
				s.ribbonsGeo.dispose();
				s.smokeGeo.dispose();
				s.rockGeo.dispose();
				s.sparkGeo.dispose();
				HellfirePillarVFX._shared = null;
			}
		}
		constructor(options = {}) {
			this.options = Object.assign({}, DEFAULT_VFX_OPTIONS, options);
			this.shared = HellfirePillarVFX.acquireSharedAssets();
			this.colors = createThemeColorSet(this.options.theme);
			this.time = 0;
			this.circleAngle = 0;
			this.disposed = false;
			this.group = new three.Group();
			this.group.name = "HellfirePillarVFX";
			this.originGroup = new three.Group();
			this.pillarGroup = new three.Group();
			this.group.add(this.originGroup, this.pillarGroup);
			const s = this.shared;
			const c = this.colors;
			this.cracksMat = createVolcanicCracksMaterial(s.volcanicCracksTex, s.flameNoiseTex, c);
			this.lavaTrailMat = createLavaTrailMaterial(s.flameNoiseTex, c);
			this.circleMat = createMagicCircleMaterial(s.magicCircleTex, s.flameNoiseTex, c);
			this.focalRingMat = createFocalRingMaterial(c);
			this.lavaBurstMat = createLavaBurstMaterial(s.flameNoiseTex, c);
			this.lavaBurstSmokeMat = createLavaBurstSmokeMaterial(s.flameNoiseTex, c);
			this.lavaBurstFlashMat = createLavaBurstFlashMaterial(c);
			this.baseSplashMat = createBaseSplashMaterial(s.flameNoiseTex, c);
			this.coreMat = createInnerCoreMaterial(s.flameNoiseTex, c);
			this.mainPillarMat = createCelFlameMaterial(s.flameNoiseTex, c, false);
			this.outerTonguesMat = createCelFlameMaterial(s.flameNoiseTex, c, true);
			this.baseCrownMat = createCelFlameMaterial(s.flameNoiseTex, c, false);
			this.ribbonsMat = createBatchedSpiralRibbonMaterial(s.flameNoiseTex, c);
			this.smokeMat = createRimLitToonSmokeMaterial(s.flameNoiseTex, c);
			this.rockMat = createObsidianShardMaterial(c);
			this.lightningMat = createLightningMaterial(c);
			this.sparkMat = createSparkMaterial(c);
			this._materials = [
				this.cracksMat,
				this.lavaTrailMat,
				this.circleMat,
				this.focalRingMat,
				this.lavaBurstMat,
				this.lavaBurstSmokeMat,
				this.lavaBurstFlashMat,
				this.baseSplashMat,
				this.coreMat,
				this.mainPillarMat,
				this.outerTonguesMat,
				this.baseCrownMat,
				this.ribbonsMat,
				this.smokeMat,
				this.rockMat,
				this.lightningMat,
				this.sparkMat
			];
			this.cracksMesh = new three.Mesh(s.cracksGeo, this.cracksMat);
			this.cracksMesh.position.y = .014;
			this.cracksMesh.renderOrder = 1;
			this.cracksMesh.matrixAutoUpdate = false;
			this.cracksMesh.updateMatrix();
			this.originGroup.add(this.cracksMesh);
			this.lavaTrailMesh = new three.Mesh(s.lavaTrailGeo, this.lavaTrailMat);
			this.lavaTrailMesh.position.y = .024;
			this.lavaTrailMesh.renderOrder = 2;
			this.lavaTrailMesh.visible = false;
			this.lavaTrailMesh.matrixAutoUpdate = false;
			this.lavaTrailMesh.updateMatrix();
			this.group.add(this.lavaTrailMesh);
			this.circleMesh = new three.Mesh(s.circleGeo, this.circleMat);
			this.circleMesh.position.y = .036;
			this.circleMesh.renderOrder = 3;
			this.originGroup.add(this.circleMesh);
			this.focalRingMesh = new three.Mesh(s.focalRingGeo, this.focalRingMat);
			this.focalRingMesh.position.y = .12;
			this.focalRingMesh.renderOrder = 4;
			this.focalRingMesh.visible = false;
			this.originGroup.add(this.focalRingMesh);
			const burstRand = mulberry32(73187);
			this.lavaBurstLobes = Array.from({ length: 10 }, (_, i) => {
				const angle = i * 2.39996 + burstRand() * .4;
				return {
					angle,
					x: Math.cos(angle),
					z: Math.sin(angle),
					radius: 1.3 + burstRand() * 2.2,
					reach: 2 + burstRand() * 3,
					lift: 1.4 + burstRand() * 3.2,
					width: 1.25 + burstRand() * .75,
					height: 1.65 + burstRand() * .9
				};
			});
			this.lavaBurst = new three.InstancedMesh(s.lavaBurstGeo, this.lavaBurstMat, this.lavaBurstLobes.length);
			this.lavaBurst.name = "hellfire-lava-eruption";
			this.lavaBurst.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.lavaBurst.renderOrder = 5;
			this.lavaBurst.frustumCulled = false;
			this.lavaBurst.visible = false;
			this.lavaBurstSmoke = new three.InstancedMesh(s.lavaBurstFlashGeo, this.lavaBurstSmokeMat, this.lavaBurstLobes.length);
			this.lavaBurstSmoke.name = "hellfire-lava-embersmoke";
			this.lavaBurstSmoke.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.lavaBurstSmoke.renderOrder = 5;
			this.lavaBurstSmoke.frustumCulled = false;
			this.lavaBurstSmoke.visible = false;
			for (let i = 0; i < this.lavaBurstLobes.length; i++) {
				_col.setRGB(burstRand(), 0, 0);
				this.lavaBurst.setColorAt(i, _col);
				this.lavaBurstSmoke.setColorAt(i, _col);
			}
			this.lavaBurstFlash = new three.Mesh(s.lavaBurstFlashGeo, this.lavaBurstFlashMat);
			this.lavaBurstFlash.name = "hellfire-lava-flash";
			this.lavaBurstFlash.position.y = 1.65;
			this.lavaBurstFlash.renderOrder = 10;
			this.lavaBurstFlash.frustumCulled = false;
			this.lavaBurstFlash.visible = false;
			this.originGroup.add(this.lavaBurst, this.lavaBurstSmoke, this.lavaBurstFlash);
			this.baseSplashMesh = new three.Mesh(s.baseSplashGeo, this.baseSplashMat);
			this.baseSplashMesh.position.y = .048;
			this.baseSplashMesh.renderOrder = 4;
			this.baseSplashMesh.visible = false;
			this.pillarGroup.add(this.baseSplashMesh);
			this.coreMesh = new three.Mesh(s.coreGeo, this.coreMat);
			this.coreMesh.position.y = -.06;
			this.coreMesh.renderOrder = 5;
			this.pillarGroup.add(this.coreMesh);
			this.mainPillarMesh = new three.Mesh(s.mainPillarGeo, this.mainPillarMat);
			this.mainPillarMesh.position.y = -.06;
			this.mainPillarMesh.renderOrder = 6;
			this.pillarGroup.add(this.mainPillarMesh);
			this.outerTonguesMesh = new three.Mesh(s.outerTonguesGeo, this.outerTonguesMat);
			this.outerTonguesMesh.position.y = -.06;
			this.outerTonguesMesh.renderOrder = 7;
			this.pillarGroup.add(this.outerTonguesMesh);
			this.baseCrownMesh = new three.Mesh(s.baseCrownGeo, this.baseCrownMat);
			this.baseCrownMesh.position.y = -.04;
			this.baseCrownMesh.renderOrder = 8;
			this.pillarGroup.add(this.baseCrownMesh);
			this.pillarGlow = null;
			if (this.options.useSoftGlow) {
				const material = new three.SpriteMaterial({
					map: s.pillarGlowTex,
					color: c.mid,
					transparent: true,
					depthWrite: false,
					blending: three.AdditiveBlending,
					opacity: 0,
					toneMapped: false
				});
				this.pillarGlow = new three.Sprite(material);
				this.pillarGlow.name = "hellfire-pillar-glow";
				this.pillarGlow.position.y = 10.2;
				this.pillarGlow.scale.set(12.5, 23.4, 1);
				this.pillarGlow.renderOrder = 9;
				this.pillarGroup.add(this.pillarGlow);
				this._materials.push(material);
			}
			this.ribbonsMesh = new three.Mesh(s.ribbonsGeo, this.ribbonsMat);
			this.ribbonsMesh.renderOrder = 8;
			this.pillarGroup.add(this.ribbonsMesh);
			this.LIGHTNING_COUNT = 6;
			this.LIGHTNING_SEGS = 16;
			this.lightningGeo = createBatchedLightningGeometry(this.LIGHTNING_COUNT, this.LIGHTNING_SEGS);
			this.lightningMesh = new three.Mesh(this.lightningGeo, this.lightningMat);
			this.lightningMesh.frustumCulled = false;
			this.lightningMesh.renderOrder = 11;
			this.lightningMesh.visible = false;
			this.pillarGroup.add(this.lightningMesh);
			this._lightningLastStep = -1;
			this.MAX_SMOKE = 96;
			this.smokeInst = new three.InstancedMesh(s.smokeGeo, this.smokeMat, this.MAX_SMOKE);
			this.smokeInst.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.smokeInst.frustumCulled = false;
			this.smokeInst.setColorAt(0, _col.setRGB(1, 0, 0));
			this.smokeInst.instanceColor.setUsage(three.DynamicDrawUsage);
			this.smokeInst.count = 0;
			this.smokeInst.visible = false;
			this.group.add(this.smokeInst);
			const smokeRand = mulberry32(4102);
			this.smokeData = Array.from({ length: this.MAX_SMOKE }, (_, i) => {
				const tier = i < 16 ? "wisp" : i < 64 ? "collar" : "mid";
				return {
					tier,
					angle: i / this.MAX_SMOKE * Math.PI * 2 + (smokeRand() - .5) * .5,
					rad0: tier === "wisp" ? 3.2 + smokeRand() * 2.2 : tier === "collar" ? 2.1 + smokeRand() * 2.1 : 2.6 + smokeRand() * 1.9,
					y0: tier === "wisp" ? .25 + smokeRand() * .5 : tier === "collar" ? .45 + smokeRand() * 1.2 : 4.2 + smokeRand() * 8.5,
					radSpeed: tier === "collar" ? 1.4 + smokeRand() * 1.8 : .7 + smokeRand() * 1.1,
					ySpeed: tier === "collar" ? .7 + smokeRand() * 1.3 : 2.6 + smokeRand() * 3,
					maxScale: tier === "wisp" ? .55 + smokeRand() * .45 : tier === "collar" ? 1.15 + smokeRand() * 1.1 : .85 + smokeRand() * .95,
					life: tier === "collar" ? 1.15 + smokeRand() * .85 : .95 + smokeRand() * .75,
					phase: smokeRand(),
					rotX: smokeRand() * 6.28,
					rotY: smokeRand() * 6.28,
					rotSpd: (smokeRand() - .5) * 1.4
				};
			});
			this.MAX_ROCKS = 64;
			this.rockInst = new three.InstancedMesh(s.rockGeo, this.rockMat, this.MAX_ROCKS);
			this.rockInst.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.rockInst.frustumCulled = false;
			this.rockInst.count = 0;
			this.rockInst.visible = false;
			this.group.add(this.rockInst);
			const rockRand = mulberry32(8817);
			this.rockData = Array.from({ length: this.MAX_ROCKS }, (_, i) => ({
				angle0: rockRand() * Math.PI * 2,
				rad0: 1.5 + rockRand() * 3.4,
				radVel: 1.4 + rockRand() * 3.2,
				vy0: 6.2 + rockRand() * 9.5,
				orbitSpd: (.8 + rockRand() * 1.8) * (rockRand() > .25 ? 1 : -1),
				delay: i < 32 ? rockRand() * .32 : .32 + rockRand() * 1.75,
				life: 1.65 + rockRand() * 1.3,
				scale: .38 + rockRand() * .78,
				rot0: new three.Vector3(rockRand() * 6, rockRand() * 6, rockRand() * 6),
				rotSpd: new three.Vector3((rockRand() - .5) * 8, (rockRand() - .5) * 8, (rockRand() - .5) * 8)
			}));
			this.MAX_SPARKS = 300;
			this.sparkInst = new three.InstancedMesh(s.sparkGeo, this.sparkMat, this.MAX_SPARKS);
			this.sparkInst.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.sparkInst.frustumCulled = false;
			this.sparkInst.renderOrder = 10;
			this.sparkInst.setColorAt(0, _col.setRGB(0, 0, 0));
			this.sparkInst.instanceColor.setUsage(three.DynamicDrawUsage);
			this.sparkInst.count = 0;
			this.sparkInst.visible = false;
			this.group.add(this.sparkInst);
			const sparkRand = mulberry32(5513);
			this.sparkData = Array.from({ length: this.MAX_SPARKS }, (_, i) => {
				const kind = i < 72 ? "implode" : i < 220 ? "vortex" : "trail";
				return {
					kind,
					angle0: sparkRand() * Math.PI * 2,
					rad0: kind === "implode" ? 4 + sparkRand() * 4.2 : kind === "vortex" ? 1.5 + sparkRand() * 3.5 : (sparkRand() - .5) * 3.6,
					trailFrac: sparkRand(),
					y0: kind === "implode" ? .25 + sparkRand() * 3.2 : kind === "vortex" ? .1 + sparkRand() * 2.4 : .08,
					angSpd: (2.2 + sparkRand() * 4) * (sparkRand() > .2 ? 1 : -1),
					riseSpd: kind === "trail" ? 2.4 + sparkRand() * 4 : 7.5 + sparkRand() * 12,
					life: kind === "implode" ? .35 + sparkRand() * .3 : kind === "trail" ? .9 + sparkRand() * 1.15 : .75 + sparkRand() * 1.05,
					phase: sparkRand(),
					size: kind === "trail" ? .22 + sparkRand() * .34 : .28 + sparkRand() * .48,
					stretch: kind === "trail" ? 1.1 + sparkRand() * 1.2 : 1.5 + sparkRand() * 2
				};
			});
			this.basePointLight = null;
			this.midPointLight = null;
			this.trailPointLight = null;
			if (this.options.useLights) {
				const t = HELLFIRE_THEMES[this.options.theme] || HELLFIRE_THEMES.hellfire;
				this.basePointLight = new three.PointLight(t.lightBase, 0, 22, 2);
				this.midPointLight = new three.PointLight(t.lightMid, 0, 26, 2);
				this.trailPointLight = new three.PointLight(t.lightBase, 0, 24, 2);
				this.group.add(this.basePointLight, this.midPointLight, this.trailPointLight);
			}
			this.setTime(0);
		}
		/** Re-triggers the spell cleanly at a given world position and yaw angle (zero allocations). */
		cast(origin = null, yawRadians = null) {
			if (origin) this.group.position.copy(origin);
			if (typeof yawRadians === "number") this.group.rotation.y = yawRadians;
			this.time = 0;
			this.circleAngle = 0;
			this._lightningLastStep = -1;
			this.group.visible = true;
			this.setTime(0);
		}
		setTheme(themeKey) {
			const t = HELLFIRE_THEMES[themeKey];
			if (!t) return;
			this.options.theme = themeKey;
			const c = this.colors;
			c.char.set(t.char);
			c.dark.set(t.dark);
			c.mid.set(t.mid);
			c.highlight.set(t.highlight);
			c.coreBody.set(t.coreBody);
			c.coreHot.set(t.coreHot[0], t.coreHot[1], t.coreHot[2]);
			c.smokeDark.set(t.smokeDark);
			c.smokeMid.set(t.smokeMid);
			c.smokeBounce.set(t.smokeBounce);
			c.lightning.set(t.lightning[0], t.lightning[1], t.lightning[2]);
			this.pillarGlow?.material.color.copy(c.mid);
			c.circleBright.set(t.circleBright);
			c.circleMid.set(t.circleMid);
			c.crackHot.set(t.crackHot);
			c.crackCool.set(t.crackCool);
			if (this.basePointLight) {
				this.basePointLight.color.set(t.lightBase);
				this.midPointLight.color.set(t.lightMid);
				this.trailPointLight.color.set(t.lightBase);
			}
		}
		setOptions(partial) {
			Object.assign(this.options, partial);
			if (partial.theme) this.setTheme(partial.theme);
		}
		getMotion(t) {
			const dist = this.options.moveEnabled ? 27.6 * this.options.moveSpeed : 0;
			const startZ = -dist * .5;
			const endZ = dist * .5;
			const moveStart = HELLFIRE_TIMELINE.STAGE2_END + .08;
			const moveEnd = HELLFIRE_TIMELINE.STAGE5_END - .14;
			const mU = clamp01((t - moveStart) / (moveEnd - moveStart));
			return {
				startZ,
				endZ,
				z: lerp(startZ, endZ, mU * mU * (3 - 2 * mU)),
				velNorm: this.options.moveEnabled && this.options.moveSpeed > .01 ? 7.2 * mU * (1 - mU) * Math.min(this.options.moveSpeed, 1.6) : 0,
				mU
			};
		}
		getStageInfo(t = this.time) {
			if (t < HELLFIRE_TIMELINE.STAGE1_END) return {
				name: "預兆蓄力",
				key: "omen"
			};
			if (t < HELLFIRE_TIMELINE.STAGE2_END) return {
				name: "內縮吸氣",
				key: "inhale"
			};
			if (t < HELLFIRE_TIMELINE.STAGE3_END) return {
				name: "地獄爆發",
				key: "burst"
			};
			if (t < HELLFIRE_TIMELINE.STAGE4_END) return {
				name: "烈焰狂湧",
				key: "sustain"
			};
			if (t < HELLFIRE_TIMELINE.STAGE5_END) return {
				name: "蝕刻消散",
				key: "dissolve"
			};
			return {
				name: "冷卻待機",
				key: "rest"
			};
		}
		getShakeMagnitude(intensity = .5, t = this.time) {
			if (intensity <= .001) return 0;
			if (t >= HELLFIRE_TIMELINE.STAGE2_END && t < HELLFIRE_TIMELINE.STAGE4_END) {
				const burstDecay = Math.exp(-(t - HELLFIRE_TIMELINE.STAGE2_END) * 5.2);
				const sustainRumble = t >= HELLFIRE_TIMELINE.STAGE3_END ? .08 : 0;
				return Math.max(burstDecay, sustainRumble) * intensity * .48;
			}
			return 0;
		}
		_updateLightningBatch(stepIdx, heightScale) {
			if (this._lightningLastStep === stepIdx) return;
			this._lightningLastStep = stepIdx;
			const posAttr = this.lightningGeo.attributes.position;
			const pos = posAttr.array;
			const segs = this.LIGHTNING_SEGS;
			const vertsPerArc = (segs + 1) * 2;
			for (let a = 0; a < this.LIGHTNING_COUNT; a++) {
				const rng = mulberry32((stepIdx + 1) * 7919 + a * 104729);
				const baseFloatIdx = a * vertsPerArc * 3;
				if (rng() < .24) {
					pos.fill(0, baseFloatIdx, baseFloatIdx + vertsPerArc * 3);
					continue;
				}
				const startAng = a / this.LIGHTNING_COUNT * Math.PI * 2 + (rng() - .5) * 1.4;
				const sweep = (rng() > .5 ? 1 : -1) * (1.1 + rng() * 1.5);
				const maxH = (11.5 + rng() * 7.5) * heightScale;
				const startY = .4 + rng() * 2;
				const baseR = 2.35 + rng() * 1.65;
				for (let s = 0; s <= segs; s++) {
					const u = s / segs;
					const ang = startAng + sweep * u;
					const jR = s === 0 || s === segs ? 0 : (rng() - .5) * 1.25;
					const jA = s === 0 || s === segs ? 0 : (rng() - .5) * .26;
					const r = baseR + u * .95 + jR;
					const cx = Math.cos(ang + jA) * r;
					const cz = Math.sin(ang + jA) * r;
					const cy = startY + u * maxH + (rng() - .5) * .35;
					const halfW = (.055 + Math.sin(u * Math.PI) * .06) * (.75 + rng() * .45);
					const tx = -Math.sin(ang) * halfW;
					const tz = Math.cos(ang) * halfW;
					const idx = baseFloatIdx + s * 6;
					pos[idx + 0] = cx - tx;
					pos[idx + 1] = cy;
					pos[idx + 2] = cz - tz;
					pos[idx + 3] = cx + tx;
					pos[idx + 4] = cy;
					pos[idx + 5] = cz + tz;
				}
			}
			posAttr.needsUpdate = true;
		}
		/** Advances animation by delta seconds. Returns true while active, false after finish. */
		update(dt) {
			if (this.disposed) return false;
			const scaledDt = dt * this.options.speed;
			this.time += scaledDt;
			if (this.options.rotateCircle) this.circleAngle += scaledDt * .45;
			if (this.time >= HELLFIRE_TIMELINE.REST_END) {
				if (this.options.autoLoop) this.time %= HELLFIRE_TIMELINE.REST_END;
				else {
					this.setTime(HELLFIRE_TIMELINE.STAGE5_END);
					return false;
				}
			}
			this.setTime(this.time);
			return this.time < HELLFIRE_TIMELINE.STAGE5_END;
		}
		/** Deterministic frame evaluation (supports scrubbing, pausing & zero-drift replay). */
		setTime(t) {
			this.time = t;
			const T1 = HELLFIRE_TIMELINE.STAGE1_END;
			const T2 = HELLFIRE_TIMELINE.STAGE2_END;
			const T3 = HELLFIRE_TIMELINE.STAGE3_END;
			const T4 = HELLFIRE_TIMELINE.STAGE4_END;
			const T5 = HELLFIRE_TIMELINE.STAGE5_END;
			const motion = this.getMotion(t);
			const startZ = motion.startZ;
			const pillarZ = motion.z;
			this.group.scale.setScalar(this.options.scale);
			this.originGroup.position.z = startZ;
			this.pillarGroup.position.z = pillarZ;
			this.group.updateWorldMatrix(true, false);
			this.pillarGroup.updateWorldMatrix(true, false);
			this.pillarGroup.getWorldPosition(_worldPillarPos);
			const circleVisible = t < T5;
			this.circleMesh.visible = circleVisible;
			if (circleVisible) {
				const intro = easeOutBack(clamp01(t / .28), 1.3);
				const inhalePinch = t >= T1 && t < T2 ? 1 - Math.sin((t - T1) / (T2 - T1) * Math.PI) * .14 : 1;
				const burstSnap = t >= T2 && t < T3 ? 1 + Math.sin((t - T2) / (T3 - T2) * Math.PI) * .08 : 1;
				this.circleMesh.scale.setScalar(Math.max(.001, intro * inhalePinch * burstSnap));
				this.circleMesh.rotation.y = this.options.rotateCircle ? this.circleAngle : 0;
				const heat = t < T1 ? .45 + .45 * smoothstep(0, T1, t) : t < T2 ? .9 + .15 * smoothstep(T1, T2, t) : t < T4 ? 1.05 : 1.05 * (1 - smoothstep(T4, T5 - .1, t));
				const op = smoothstep(0, .1, t) * (1 - smoothstep(T5 - .55, T5, t));
				this.circleMat.uniforms.uTime.value = t;
				this.circleMat.uniforms.uEngrave.value = easeOutCubic(clamp01(t / .52));
				this.circleMat.uniforms.uHeat.value = Math.max(.08, heat);
				this.circleMat.uniforms.uOpacity.value = op;
			}
			const cracksVisible = t > .05 && t < T5;
			this.cracksMesh.visible = cracksVisible;
			if (cracksVisible) {
				const spread = t < T2 ? easeOutCubic(clamp01((t - .05) / .72)) * .65 : .65 + easeOutExpo(clamp01((t - T2) / .3)) * .35;
				const crackHeat = t < T2 ? .55 + .35 * smoothstep(.05, T2, t) : t < T4 ? 1.08 : 1.08 * (1 - smoothstep(T4, T5 - .15, t));
				const crackOp = smoothstep(.05, .25, t) * (1 - smoothstep(T5 - .45, T5, t));
				this.cracksMat.uniforms.uTime.value = t;
				this.cracksMat.uniforms.uSpread.value = spread;
				this.cracksMat.uniforms.uHeat.value = Math.max(.05, crackHeat);
				this.cracksMat.uniforms.uOpacity.value = crackOp;
			}
			const trailVisible = t >= T2 && t < T5;
			this.lavaTrailMesh.visible = trailVisible;
			if (trailVisible) {
				const trailOp = smoothstep(T2, T2 + .16, t) * (1 - smoothstep(T5 - .42, T5, t));
				const globalCool = t > T4 ? smoothstep(T4, T5 - .05, t) : 0;
				this.lavaTrailMat.uniforms.uTime.value = t;
				this.lavaTrailMat.uniforms.uStartZ.value = startZ;
				this.lavaTrailMat.uniforms.uHeadZ.value = pillarZ;
				this.lavaTrailMat.uniforms.uGlobalCool.value = globalCool;
				this.lavaTrailMat.uniforms.uOpacity.value = trailOp;
			}
			if (t >= T1 && t < T2 + .06) {
				const u = clamp01((t - T1) / (T2 - T1));
				this.focalRingMesh.visible = true;
				const s = lerp(3.4, .42, easeInQuad(u));
				this.focalRingMesh.scale.set(s, 1, s);
				this.focalRingMat.uniforms.uOpacity.value = Math.sin(u * Math.PI) * .82;
			} else this.focalRingMesh.visible = false;
			const burstAge = t - T2;
			this.lavaBurst.visible = burstAge >= 0 && burstAge < BURST_SURFACE_END;
			this.lavaBurstFlash.visible = burstAge >= 0 && burstAge < .23;
			this.lavaBurstSmoke.visible = burstAge >= BURST_SMOKE_START && burstAge < BURST_SMOKE_END;
			if (this.lavaBurst.visible || this.lavaBurstSmoke.visible) {
				const spread = easeOutCubic(burstAge / .5);
				const rise = easeOutCubic(burstAge / .36);
				const stretch = .72 + .52 * Math.sin(rise * Math.PI * .82);
				this.lavaBurstMat.uniforms.uAge.value = burstAge;
				const drift = smoothstep(BURST_SMOKE_START, BURST_SMOKE_END, burstAge);
				this.lavaBurstSmokeMat.uniforms.uAge.value = (burstAge - BURST_SMOKE_START) / 1.46;
				for (let i = 0; i < this.lavaBurstLobes.length; i++) {
					const p = this.lavaBurstLobes[i];
					const r = p.radius + (spread + drift * .34) * p.reach;
					const y = 1.12 + p.lift * (rise + drift * .36);
					_pos.set(p.x * r, y, p.z * r);
					if (this.lavaBurst.visible) {
						_euler.set(0, -p.angle, -.3 - spread * .55 - drift * .38);
						_quat.setFromEuler(_euler);
						_scl.set(p.width * (1 + spread * .4 + drift * .26), p.height * (stretch + drift * .15), p.width * (.85 + drift * .25));
						_mat.compose(_pos, _quat, _scl);
						this.lavaBurst.setMatrixAt(i, _mat);
					}
					if (this.lavaBurstSmoke.visible) {
						_scl.set(p.width * (1.25 + spread * .23 + drift * .63), p.height * (.72 + drift * .38), 1);
						_mat.makeScale(_scl.x, _scl.y, 1).setPosition(_pos);
						this.lavaBurstSmoke.setMatrixAt(i, _mat);
					}
				}
				if (this.lavaBurst.visible) this.lavaBurst.instanceMatrix.needsUpdate = true;
				if (this.lavaBurstSmoke.visible) this.lavaBurstSmoke.instanceMatrix.needsUpdate = true;
			}
			if (this.lavaBurstFlash.visible) {
				this.lavaBurstFlashMat.uniforms.uAge.value = burstAge;
				this.lavaBurstFlash.scale.set(7 + burstAge * 9, 4 + burstAge * 4, 1);
			}
			const pillarActive = t >= T2 && t < T5 - .05;
			this.coreMesh.visible = pillarActive && t < T4 + .72;
			this.mainPillarMesh.visible = pillarActive;
			this.outerTonguesMesh.visible = pillarActive;
			this.baseCrownMesh.visible = pillarActive;
			this.baseSplashMesh.visible = pillarActive;
			if (pillarActive) {
				const yStretch = easeOutBack(clamp01((t - T2) / .2), .85);
				const xzPunch = 1 + Math.sin(clamp01((t - T2) / .28) * Math.PI) * .24;
				const breathe = 1 + Math.sin(t * 13) * .025;
				const dissolve = t > T4 ? smoothstep(T4, T5 - .08, t) : 0;
				const coreDissolve = t > T4 ? smoothstep(T4, T4 + .7, t) : 0;
				if (this.coreMesh.visible) {
					const coreXZ = Math.max(.01, xzPunch * (1 - easeInQuad(coreDissolve) * .85));
					this.coreMesh.scale.set(coreXZ, Math.max(.01, yStretch), coreXZ);
					this.coreMat.uniforms.uTime.value = t;
					this.coreMat.uniforms.uDissolve.value = coreDissolve;
				}
				const mantleXZ = xzPunch * breathe * (1 - dissolve * .22);
				this.mainPillarMesh.scale.set(mantleXZ, Math.max(.01, yStretch), mantleXZ);
				this.mainPillarMat.uniforms.uTime.value = t;
				this.mainPillarMat.uniforms.uDissolve.value = dissolve;
				this.mainPillarMat.uniforms.uForwardDrag.value = motion.velNorm;
				this.outerTonguesMesh.scale.set(mantleXZ * 1.03, Math.max(.01, yStretch * .98), mantleXZ * 1.03);
				this.outerTonguesMat.uniforms.uTime.value = t;
				this.outerTonguesMat.uniforms.uDissolve.value = clamp01(dissolve * 1.1);
				this.outerTonguesMat.uniforms.uForwardDrag.value = motion.velNorm;
				const crownIn = easeOutBack(clamp01((t - T2) / .22), 1.2);
				const crownOut = 1 - smoothstep(T4 + .1, T5 - .2, t);
				this.baseCrownMesh.scale.set(crownIn, Math.max(.01, crownIn * crownOut), crownIn);
				this.baseCrownMesh.rotation.y = t * .65;
				this.baseCrownMat.uniforms.uTime.value = t * 1.15;
				this.baseCrownMat.uniforms.uDissolve.value = clamp01(dissolve * 1.18);
				const splashScale = Math.max(.01, crownIn * (.96 + .04 * Math.sin(t * 16)));
				this.baseSplashMesh.scale.set(splashScale, 1, splashScale);
				this.baseSplashMesh.rotation.y = -t * .45;
				this.baseSplashMat.uniforms.uTime.value = t;
				this.baseSplashMat.uniforms.uDissolve.value = clamp01(dissolve * 1.08);
			}
			const ribbonsActive = t >= T2 + .03 && t < T5 - .08;
			this.ribbonsMesh.visible = ribbonsActive;
			if (ribbonsActive) {
				const rLaunch = easeOutBack(clamp01((t - (T2 + .03)) / .24), .7);
				const rDissolve = t > T4 ? smoothstep(T4, T5 - .1, t) : 0;
				const rXZ = .85 + .15 * rLaunch;
				this.ribbonsMesh.scale.set(rXZ, Math.max(.01, rLaunch), rXZ);
				this.ribbonsMat.uniforms.uTime.value = t;
				this.ribbonsMat.uniforms.uSpinTime.value = t - T2;
				this.ribbonsMat.uniforms.uDissolve.value = rDissolve;
			}
			const lightningActive = t >= T2 && t < T4 + .35;
			this.lightningMesh.visible = lightningActive;
			if (lightningActive) {
				const stepIdx = Math.floor(t * 14);
				const hScale = easeOutCubic(clamp01((Math.max(T2, stepIdx / 14) - T2) / .18));
				const lFade = t > T4 ? 1 - smoothstep(T4, T4 + .35, t) : 1;
				this.lightningMat.uniforms.uOpacity.value = .92 * lFade;
				this._updateLightningBatch(stepIdx, hScale);
			} else {
				this.lightningMat.uniforms.uOpacity.value = 0;
				this._lightningLastStep = -1;
			}
			let lightEnv = 0;
			if (t < T1) lightEnv = .12 + .3 * smoothstep(0, T1, t);
			else if (t < T2) lightEnv = .42 + .22 * smoothstep(T1, T2, t);
			else if (t < T3) lightEnv = .72 + .28 * easeOutExpo(clamp01((t - T2) / .14));
			else if (t < T4) lightEnv = .95;
			else if (t < T5) lightEnv = .95 * (1 - smoothstep(T4, T5 - .1, t));
			const flicker = .93 + .07 * Math.sin(t * 37) * Math.cos(t * 23);
			if (this.pillarGlow) {
				const rise = smoothstep(T2, T2 + .2, t);
				const strength = rise * lightEnv * (1 - smoothstep(T4, T4 + .65, t));
				this.pillarGlow.visible = strength > .002;
				this.pillarGlow.position.y = 10.2 * rise;
				this.pillarGlow.scale.y = Math.max(.01, 23.4 * rise);
				this.pillarGlow.material.opacity = .54 * strength * flicker;
			}
			if (this.basePointLight) {
				this.basePointLight.position.set(0, 1.8, pillarZ);
				this.midPointLight.position.set(0, 8, pillarZ);
				this.trailPointLight.position.set(0, .9, lerp(startZ, pillarZ, .58));
				this.basePointLight.intensity = lightEnv * 5.2 * flicker;
				this.midPointLight.intensity = (t >= T2 ? lightEnv : 0) * 4.2 * flicker;
				this.trailPointLight.intensity = (t >= T2 ? lightEnv : 0) * (this.options.moveEnabled ? 2.1 : 0) * flicker;
			}
			const shaderLight = clamp01(lightEnv);
			this.smokeMat.uniforms.uLightPower.value = shaderLight;
			this.smokeMat.uniforms.uPillarWorldPos.value.copy(_worldPillarPos);
			this.rockMat.uniforms.uLightPower.value = shaderLight;
			this.rockMat.uniforms.uPillarWorldPos.value.copy(_worldPillarPos);
			const pMult = this.options.particleMult;
			const smokeLimit = Math.min(this.MAX_SMOKE, Math.max(12, Math.floor(this.MAX_SMOKE * clamp01(pMult / 2) * 1.4)));
			let smokeCount = 0;
			if (t >= .08 && t < T5) for (let i = 0; i < smokeLimit; i++) {
				const s = this.smokeData[i];
				if (s.tier === "wisp") {
					if (t < T2 + .25) {
						const u = (t - .08 + s.phase * s.life) % s.life / s.life;
						const r = lerp(s.rad0, .9, easeInQuad(u));
						const a = s.angle + u * 1.4;
						const env = Math.sin(u * Math.PI) * (1 - smoothstep(T2, T2 + .25, t));
						const sc = s.maxScale * env;
						if (sc > .02) {
							_pos.set(Math.cos(a) * r, s.y0 + u * .8, startZ + Math.sin(a) * r);
							_euler.set(s.rotX + t * s.rotSpd, s.rotY + t * s.rotSpd, 0);
							_quat.setFromEuler(_euler);
							_scl.set(sc * 1.2, sc * .75, sc * 1.2);
							_mat.compose(_pos, _quat, _scl);
							this.smokeInst.setMatrixAt(smokeCount, _mat);
							this.smokeInst.setColorAt(smokeCount, _col.setRGB(1 - env * .92, .75, 0));
							smokeCount++;
						}
					}
				} else if (t >= T2) {
					const offsetT = t - T2 + s.phase * s.life;
					const cycleIdx = Math.floor(offsetT / s.life);
					const cycleStartT = T2 + cycleIdx * s.life - s.phase * s.life;
					if (cycleStartT <= T4 + .05) {
						const age = offsetT - cycleIdx * s.life;
						const u = clamp01(age / s.life);
						const dispEnv = t > T4 ? 1 - smoothstep(T4 + .15, T5, t) : 1;
						const dissolveVal = clamp01(smoothstep(.62, 1, u) + (1 - dispEnv) * .95);
						const popIn = easeOutCubic(clamp01(u / .18));
						const sc = s.maxScale * popIn * (.75 + .35 * u) * dispEnv;
						if (sc > .03 && dissolveVal < .95) {
							const spawnZ = this.getMotion(Math.max(T2, cycleStartT)).z;
							const drag = 1 - Math.exp(-age * 1.2);
							const r = s.rad0 + s.radSpeed * drag * 1.8;
							const y = s.y0 + s.ySpeed * age * .72;
							const ang = s.angle + age * .35;
							_pos.set(Math.cos(ang) * r, y, spawnZ + Math.sin(ang) * r);
							_euler.set(s.rotX + age * s.rotSpd, s.rotY + age * s.rotSpd * .8, 0);
							_quat.setFromEuler(_euler);
							_scl.set(sc * 1.12, sc * .88, sc * 1.12);
							_mat.compose(_pos, _quat, _scl);
							this.smokeInst.setMatrixAt(smokeCount, _mat);
							this.smokeInst.setColorAt(smokeCount, _col.setRGB(dissolveVal, (1 - u * .45) * dispEnv, 0));
							smokeCount++;
						}
					}
				}
			}
			this.smokeInst.count = smokeCount;
			this.smokeInst.visible = smokeCount > 0;
			if (smokeCount > 0) {
				this.smokeInst.instanceMatrix.needsUpdate = true;
				this.smokeInst.instanceColor.needsUpdate = true;
			}
			const rockLimit = Math.min(this.MAX_ROCKS, Math.floor(this.MAX_ROCKS * clamp01(pMult / 1.5)));
			let rockCount = 0;
			if (t > T2 && t < T5) for (let i = 0; i < rockLimit; i++) {
				const r = this.rockData[i];
				const spawnT = T2 + r.delay;
				const age = t - spawnT;
				if (age > 0 && age < r.life) {
					const u = age / r.life;
					const env = easeOutBack(clamp01(u / .1), .8) * (1 - smoothstep(.76, 1, u));
					if (env > .01) {
						const spawnZ = this.getMotion(spawnT).z;
						const y = Math.max(.18, .15 + r.vy0 * age - 4.6 * age * age);
						const rad = r.rad0 + r.radVel * (1 - Math.exp(-age * 1.35)) * 1.45;
						const ang = r.angle0 + r.orbitSpd * age;
						_pos.set(Math.cos(ang) * rad, y, spawnZ + Math.sin(ang) * rad);
						_euler.set(r.rot0.x + r.rotSpd.x * age, r.rot0.y + r.rotSpd.y * age, r.rot0.z + r.rotSpd.z * age);
						_quat.setFromEuler(_euler);
						_scl.setScalar(r.scale * env);
						_mat.compose(_pos, _quat, _scl);
						this.rockInst.setMatrixAt(rockCount, _mat);
						rockCount++;
					}
				}
			}
			this.rockInst.count = rockCount;
			this.rockInst.visible = rockCount > 0;
			if (rockCount > 0) this.rockInst.instanceMatrix.needsUpdate = true;
			const implodeMax = Math.min(72, Math.floor(72 * clamp01(pMult / 1.4)));
			const vortexMax = Math.min(148, Math.floor(148 * clamp01(pMult / 1.4)));
			const trailMax = Math.min(this.MAX_SPARKS - 220, Math.floor((this.MAX_SPARKS - 220) * clamp01(pMult / 1.4)));
			let sparkCount = 0;
			if (t < T5) {
				if (t < T2) for (let i = 0; i < implodeMax; i++) {
					const p = this.sparkData[i];
					const u = (t + p.phase * p.life) % p.life / p.life;
					const pull = easeInQuad(u);
					const ang = p.angle0 + pull * 1.6;
					const rad = lerp(p.rad0, .2, pull);
					const y = lerp(p.y0, 1.1, pull);
					_pos.set(Math.cos(ang) * rad, y, startZ + Math.sin(ang) * rad);
					_dir.set(-Math.cos(ang) * 2.2 - Math.sin(ang) * .7, 1.1 - p.y0, -Math.sin(ang) * 2.2 + Math.cos(ang) * .7).normalize();
					_quat.setFromUnitVectors(_up, _dir);
					const s = p.size * (1 - pull * .45);
					_scl.set(s * .6, s * p.stretch * (.7 + pull * 1.1), s * .6);
					_mat.compose(_pos, _quat, _scl);
					this.sparkInst.setMatrixAt(sparkCount, _mat);
					this.sparkInst.setColorAt(sparkCount, _col.setRGB(.65 + pull * .35, Math.sin(u * Math.PI) * .88, 0));
					sparkCount++;
				}
				else {
					const cool = t > T4 ? smoothstep(T4, T5, t) : 0;
					const sinceBurst = burstAge;
					if (burstAge < .62) for (let i = 0; i < Math.min(26, implodeMax); i++) {
						const p = this.sparkData[i];
						const life = .32 + p.phase * .3;
						if (burstAge >= life) continue;
						const ySpeed = p.riseSpd * .76;
						const radialSpeed = 5.8 + p.trailFrac * 8.6;
						const r = .85 + p.rad0 * .18 + radialSpeed * burstAge;
						const x = Math.cos(p.angle0), z = Math.sin(p.angle0);
						_pos.set(x * r, .48 + p.y0 * .28 + (ySpeed - 10 * burstAge) * burstAge, startZ + z * r);
						_dir.set(x * radialSpeed, ySpeed - 20 * burstAge, z * radialSpeed).normalize();
						_quat.setFromUnitVectors(_up, _dir);
						const alpha = 1 - smoothstep(life * .27, life, burstAge);
						const size = p.size * .65 * (.55 + alpha * .45);
						_scl.set(size * .55, size * (2.7 + p.phase * 1.8), size * .55);
						_mat.compose(_pos, _quat, _scl);
						this.sparkInst.setMatrixAt(sparkCount, _mat);
						this.sparkInst.setColorAt(sparkCount, _col.setRGB(.4 + alpha * .6, alpha, 0));
						sparkCount++;
					}
					for (let vIdx = 0; vIdx < vortexMax; vIdx++) {
						const p = this.sparkData[72 + vIdx];
						const offsetT = sinceBurst + p.phase * p.life;
						const cycleIdx = Math.floor(offsetT / p.life);
						const cycleStartT = T2 + cycleIdx * p.life - p.phase * p.life;
						if (cycleStartT <= T4 + .12) {
							const age = offsetT - cycleIdx * p.life;
							const u = clamp01(age / p.life);
							const alpha = smoothstep(0, .12, u) * (1 - smoothstep(.65, 1, u));
							if (alpha > .02) {
								const spawnZ = this.getMotion(Math.max(T2, cycleStartT)).z;
								const ang = p.angle0 + p.angSpd * age * (1 - cool * .4);
								const rad = p.rad0 + age * (.65 + cool * 1.2);
								const y = p.y0 + p.riseSpd * age * (1 - cool * .35);
								_pos.set(Math.cos(ang) * rad, y, spawnZ + Math.sin(ang) * rad);
								_dir.set(-Math.sin(ang) * p.angSpd * rad * .35 + Math.cos(ang) * .65, p.riseSpd * (1 - cool * .35), Math.cos(ang) * p.angSpd * rad * .35 + Math.sin(ang) * .65).normalize();
								_quat.setFromUnitVectors(_up, _dir);
								const s = p.size * (1 - u * .6);
								_scl.set(s * .65, s * (1 + p.stretch * (1 - cool * .5)), s * .65);
								_mat.compose(_pos, _quat, _scl);
								this.sparkInst.setMatrixAt(sparkCount, _mat);
								this.sparkInst.setColorAt(sparkCount, _col.setRGB(clamp01((1 - u * .65) * (1 - cool * .7)), alpha * .9, 0));
								sparkCount++;
							}
						}
					}
					if (t >= T2 + .08) {
						const sinceTrail = t - (T2 + .08);
						for (let trIdx = 0; trIdx < trailMax; trIdx++) {
							const p = this.sparkData[220 + trIdx];
							const offsetT = sinceTrail + p.phase * p.life;
							const cycleIdx = Math.floor(offsetT / p.life);
							const cycleStartT = T2 + .08 + cycleIdx * p.life - p.phase * p.life;
							if (cycleStartT <= T5 - .35) {
								const age = offsetT - cycleIdx * p.life;
								const u = clamp01(age / p.life);
								const alpha = smoothstep(0, .14, u) * (1 - smoothstep(.55, 1, u)) * (1 - cool * .7);
								if (alpha > .02) {
									const headAtSpawn = this.getMotion(Math.max(T2, cycleStartT)).z;
									const tz = lerp(startZ, headAtSpawn, p.trailFrac);
									const tx = p.rad0 + Math.sin(age * 3.5 + p.angle0) * .45;
									const ty = p.y0 + p.riseSpd * age;
									_pos.set(tx, ty, tz + Math.cos(age * 2.8 + p.angle0) * .3);
									_dir.set(Math.cos(age * 3.5 + p.angle0) * .35, p.riseSpd, -Math.sin(age * 2.8 + p.angle0) * .25).normalize();
									_quat.setFromUnitVectors(_up, _dir);
									const s = p.size * (1 - u * .65);
									_scl.set(s * .65, s * p.stretch, s * .65);
									_mat.compose(_pos, _quat, _scl);
									this.sparkInst.setMatrixAt(sparkCount, _mat);
									const freshness = 1 - clamp01((pillarZ - tz) / 24) * .5;
									const heat = clamp01((.92 - u * .55) * freshness * (1 - cool * .65));
									this.sparkInst.setColorAt(sparkCount, _col.setRGB(heat, alpha * .88, 0));
									sparkCount++;
								}
							}
						}
					}
				}
			}
			this.sparkInst.count = sparkCount;
			this.sparkInst.visible = sparkCount > 0;
			if (sparkCount > 0) {
				this.sparkInst.instanceMatrix.needsUpdate = true;
				this.sparkInst.instanceColor.needsUpdate = true;
			}
		}
		/** Cleanly disposes all per-instance GPU resources & releases shared asset cache refcount. */
		dispose() {
			if (this.disposed) return;
			this.disposed = true;
			for (let i = 0; i < this._materials.length; i++) this._materials[i].dispose();
			this.lightningGeo.dispose();
			this.lavaBurst.dispose();
			this.lavaBurstSmoke.dispose();
			this.smokeInst.dispose();
			this.rockInst.dispose();
			this.sparkInst.dispose();
			if (this.group.parent) this.group.parent.remove(this.group);
			HellfirePillarVFX.releaseSharedAssets();
		}
	};
	function normalizeHellfirePillarOptions(options = {}) {
		return {
			theme: Object.hasOwn(HELLFIRE_THEMES, options.theme) ? options.theme : "hellfire",
			size: finiteRange(options.size, .25, 2, 1),
			speed: finiteRange(options.speed, .25, 2, 1)
		};
	}
	function createHellfirePillarEffect(spec, options = {}) {
		const group = new three.Group();
		group.name = spec.id;
		let settings = normalizeHellfirePillarOptions(options);
		const duration = HELLFIRE_TIMELINE.STAGE5_END;
		const lifecycle = { ...spec.lifecycle };
		let cast, elapsed = 0, disposed = false;
		function showFrame() {
			group.visible = elapsed < duration;
			if (!group.visible || !cast && elapsed === 0) return;
			if (!cast) {
				cast = new HellfirePillarVFX({
					theme: settings.theme,
					scale: settings.size,
					useSoftGlow: true
				});
				group.add(cast.group);
			}
			cast.setTime(elapsed);
		}
		return {
			group,
			duration,
			lifecycle,
			get settings() {
				return settings;
			},
			get elapsed() {
				return elapsed;
			},
			get finished() {
				return disposed || elapsed >= duration;
			},
			get phase() {
				return this.finished ? "finished" : elapsed < lifecycle.start ? "starting" : elapsed >= HELLFIRE_TIMELINE.STAGE4_END ? "ending" : "active";
			},
			get particleCount() {
				return cast && group.visible ? cast.smokeInst.count + cast.rockInst.count + cast.sparkInst.count + (cast.lavaBurst.visible ? cast.lavaBurst.count : 0) + (cast.lavaBurstSmoke.visible ? cast.lavaBurstSmoke.count : 0) : 0;
			},
			update(dt) {
				if (disposed || elapsed >= duration || !Number.isFinite(dt) || dt <= 0) return;
				elapsed = Math.min(duration, elapsed + dt * settings.speed);
				showFrame();
			},
			reset() {
				if (disposed) return;
				elapsed = 0;
				cast?.cast();
				showFrame();
			},
			setOptions(partial = {}) {
				if (disposed) return;
				const previous = settings;
				settings = normalizeHellfirePillarOptions({
					...settings,
					...partial
				});
				if (cast) {
					if (settings.theme !== previous.theme) cast.setTheme(settings.theme);
					cast.options.scale = settings.size;
					showFrame();
				}
			},
			dispose() {
				if (disposed) return;
				disposed = true;
				group.visible = false;
				group.removeFromParent();
				cast?.dispose();
				cast = null;
			}
		};
	}

//#endregion
exports.HELLFIRE_THEMES = HELLFIRE_THEMES;
exports.HELLFIRE_TIMELINE = HELLFIRE_TIMELINE;
exports.HellfirePillarVFX = HellfirePillarVFX;
exports.createHellfirePillarEffect = createHellfirePillarEffect;
exports.normalizeHellfirePillarOptions = normalizeHellfirePillarOptions;
return exports;
})({}, THREE);

export {__vfxModule};
