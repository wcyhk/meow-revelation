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
// 星穹箭雨 / Celestial Arrow Rain — Three.js 0.187.0 / WebGL2.
// 4.5 visual seconds. Ground center is the local origin, XZ ground, +Y up.
// Add fx.group, update(deltaSeconds), reset() to replay, dispose() at teardown.
// Local canvas textures are generated on first update and shared between live casts.
// No external textures, extra rendering pass, camera argument, collision or damage.
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
//#region src/effects/celestial-arrow-rain-runtime.js
	const SEQUENCE_DURATION = 4.5;
	const GIANT_IMPACT_TIME = 2.5;
	/**
	* Platform LOD presets balancing visual richness, draw-call count, and texture VRAM.
	* - high:   Desktop / Console (~8.3 MB procedural texture VRAM)
	* - medium: Mid-tier Desktop / Tablet (~8.1 MB VRAM, lighter particle pools)
	* - low:    Mobile WebGL (~2.1 MB VRAM, lean geometry & particle counts)
	*/
	const QUALITY_PRESETS = {
		high: {
			label: "高 (桌面)",
			textureSize: 512,
			starSize: 256,
			arrowCount: 110,
			maxArrows: 180,
			maxShockwaves: 200,
			maxStars: 190,
			maxDust: 140,
			maxSparks: 280,
			bloomEnabled: true
		},
		medium: {
			label: "中 (平衡)",
			textureSize: 512,
			starSize: 128,
			arrowCount: 80,
			maxArrows: 120,
			maxShockwaves: 130,
			maxStars: 120,
			maxDust: 84,
			maxSparks: 160,
			bloomEnabled: true
		},
		low: {
			label: "低 (行動)",
			textureSize: 256,
			starSize: 128,
			arrowCount: 50,
			maxArrows: 80,
			maxShockwaves: 85,
			maxStars: 80,
			maxDust: 44,
			maxSparks: 88,
			bloomEnabled: false
		}
	};
	const THEMES = {
		celestial: {
			name: "星穹聖光",
			accentCss: "#38bdf8",
			accent2Css: "#fbbf24",
			accentSoft: "rgba(56, 189, 248, 0.28)",
			ink: 726576,
			primary: 959977,
			secondary: 16096779,
			core: 14743551,
			dustDark: 2503754,
			dustLight: 8032944,
			crackCore: 3718648,
			crackEdge: 725538
		},
		crimson: {
			name: "猩紅業火",
			accentCss: "#f87171",
			accent2Css: "#f59e0b",
			accentSoft: "rgba(239, 68, 68, 0.30)",
			ink: 2361613,
			primary: 14427686,
			secondary: 16347926,
			core: 16771276,
			dustDark: 3350564,
			dustLight: 8542558,
			crackCore: 16347926,
			crackEdge: 1705992
		},
		astral: {
			name: "星靈幻紫",
			accentCss: "#c084fc",
			accent2Css: "#f472b6",
			accentSoft: "rgba(168, 85, 247, 0.30)",
			ink: 1772334,
			primary: 9647082,
			secondary: 15485081,
			core: 16246527,
			dustDark: 2891842,
			dustLight: 8152734,
			crackCore: 15235577,
			crackEdge: 1444132
		},
		emerald: {
			name: "蒼翠風暴",
			accentCss: "#34d399",
			accent2Css: "#2dd4bf",
			accentSoft: "rgba(16, 185, 129, 0.28)",
			ink: 467996,
			primary: 366185,
			secondary: 3003583,
			core: 14483189,
			dustDark: 1979696,
			dustLight: 6394246,
			crackCore: 3462041,
			crackEdge: 465429
		}
	};
	const DEFAULT_CONFIG = {
		"theme": "celestial",
		"quality": "high",
		"arrowCount": 110,
		"radius": 5.2,
		"slantDeg": 20,
		"maxArrows": 180,
		"maxShockwaves": 200,
		"maxStars": 190,
		"maxDust": 140,
		"maxSparks": 280
	};
	/**
	* Creates an isolated per-instance theme uniform bundle so multiple concurrent
	* Arrow Rain casts can use independent color palettes without clobbering each other.
	*/
	function createThemeUniforms(themeOrKey = "celestial") {
		const theme = typeof themeOrKey === "string" ? THEMES[themeOrKey] || THEMES.celestial : themeOrKey;
		return {
			ink: { value: new three.Color(theme.ink) },
			primary: { value: new three.Color(theme.primary) },
			secondary: { value: new three.Color(theme.secondary) },
			core: { value: new three.Color(theme.core) },
			dustDark: { value: new three.Color(theme.dustDark) },
			dustLight: { value: new three.Color(theme.dustLight) },
			crackCore: { value: new three.Color(theme.crackCore) },
			crackEdge: { value: new three.Color(theme.crackEdge) }
		};
	}
	function applyThemeToUniforms(themeU, themeOrKey) {
		const theme = typeof themeOrKey === "string" ? THEMES[themeOrKey] || THEMES.celestial : themeOrKey;
		themeU.ink.value.setHex(theme.ink);
		themeU.primary.value.setHex(theme.primary);
		themeU.secondary.value.setHex(theme.secondary);
		themeU.core.value.setHex(theme.core);
		themeU.dustDark.value.setHex(theme.dustDark);
		themeU.dustLight.value.setHex(theme.dustLight);
		themeU.crackCore.value.setHex(theme.crackCore);
		themeU.crackEdge.value.setHex(theme.crackEdge);
		return theme;
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
	function clamp01(v) {
		return v < 0 ? 0 : v > 1 ? 1 : v;
	}
	function smoothstep(edge0, edge1, x) {
		const t = clamp01((x - edge0) / (edge1 - edge0));
		return t * t * (3 - 2 * t);
	}
	function easeOutCubic(t) {
		const c = clamp01(t);
		return 1 - Math.pow(1 - c, 3);
	}
	function easeOutBack(t) {
		const c = clamp01(t);
		return 1 + 2.70158 * Math.pow(c - 1, 3) + 1.70158 * Math.pow(c - 1, 2);
	}
	function easeInCubic(t) {
		const c = clamp01(t);
		return c * c * c;
	}
	/**
	* Creates a resolution-independent 2D canvas. Drawing proceeds in logical coordinates
	* (default 1024x1024) while rasterizing directly into `pixelSize x pixelSize` for ~78% VRAM savings.
	*/
	function createCanvas2D(pixelSize, logicalSize = 1024) {
		const canvas = document.createElement("canvas");
		canvas.width = pixelSize;
		canvas.height = pixelSize;
		const ctx = canvas.getContext("2d");
		const scale = pixelSize / logicalSize;
		if (scale !== 1) ctx.scale(scale, scale);
		return {
			canvas,
			ctx,
			size: logicalSize,
			half: logicalSize * .5,
			pixelSize
		};
	}
	function drawLayeredRunePath(ctx, drawFn, inkW, primaryW, coreW, isSecondary = false) {
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.strokeStyle = "rgba(0, 0, 0, 1)";
		ctx.lineWidth = inkW;
		ctx.beginPath();
		drawFn(ctx);
		ctx.stroke();
		ctx.strokeStyle = isSecondary ? "rgba(0, 40, 255, 1)" : "rgba(0, 255, 0, 1)";
		ctx.lineWidth = primaryW;
		ctx.beginPath();
		drawFn(ctx);
		ctx.stroke();
		if (coreW > 0) {
			ctx.strokeStyle = isSecondary ? "rgba(210, 80, 255, 1)" : "rgba(255, 255, 0, 1)";
			ctx.lineWidth = coreW;
			ctx.beginPath();
			drawFn(ctx);
			ctx.stroke();
		}
	}
	function createSkyRingOuterTexture(pixelSize = 512, anisotropy = 4) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 1024);
		ctx.clearRect(0, 0, size, size);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 456, 0, Math.PI * 2), 20, 11, 4, false);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 422, 0, Math.PI * 2), 14, 7, 2.5, true);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 366, 0, Math.PI * 2), 16, 8, 3, false);
		for (let i = 0; i < 24; i++) {
			const ang = i / 24 * Math.PI * 2;
			ctx.save();
			ctx.translate(half, half);
			ctx.rotate(ang);
			const type = i % 4;
			drawLayeredRunePath(ctx, (c) => {
				if (type === 0) {
					c.moveTo(380, -9);
					c.lineTo(410, 0);
					c.lineTo(380, 9);
					c.moveTo(392, -6);
					c.lineTo(392, 6);
				} else if (type === 1) {
					c.moveTo(382, -8);
					c.lineTo(408, 8);
					c.moveTo(382, 8);
					c.lineTo(408, -8);
				} else if (type === 2) {
					c.moveTo(380, 0);
					c.lineTo(410, 0);
					c.moveTo(395, -10);
					c.lineTo(395, 10);
				} else {
					c.moveTo(382, -7);
					c.lineTo(408, -7);
					c.lineTo(395, 9);
					c.closePath();
				}
			}, 9, 4.5, 1.8, i % 2 === 1);
			ctx.restore();
		}
		for (let i = 0; i < 12; i++) {
			const ang = i / 12 * Math.PI * 2;
			ctx.save();
			ctx.translate(half, half);
			ctx.rotate(ang);
			drawLayeredRunePath(ctx, (c) => {
				c.moveTo(438, 0);
				c.lineTo(456, -12);
				c.lineTo(476, 0);
				c.lineTo(456, 12);
				c.closePath();
			}, 10, 5, 2, true);
			ctx.restore();
		}
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = anisotropy;
		tex.needsUpdate = true;
		return tex;
	}
	function createSkyRingMidTexture(pixelSize = 512, anisotropy = 4) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 1024);
		ctx.clearRect(0, 0, size, size);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 344, 0, Math.PI * 2), 16, 8, 3, true);
		for (let t = 0; t < 2; t++) {
			const offset = t * Math.PI / 3;
			drawLayeredRunePath(ctx, (c) => {
				for (let i = 0; i <= 3; i++) {
					const ang = offset + i * Math.PI * 2 / 3;
					const x = half + Math.cos(ang) * 336;
					const y = half + Math.sin(ang) * 336;
					if (i === 0) c.moveTo(x, y);
					else c.lineTo(x, y);
				}
			}, 18, 9, 3.2, t === 1);
		}
		for (let i = 0; i < 6; i++) {
			const ang = i / 6 * Math.PI * 2;
			const cx = half + Math.cos(ang) * 336;
			const cy = half + Math.sin(ang) * 336;
			drawLayeredRunePath(ctx, (c) => c.arc(cx, cy, 26, 0, Math.PI * 2), 11, 5.5, 2, false);
		}
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = anisotropy;
		tex.needsUpdate = true;
		return tex;
	}
	function createSkyRingInnerTexture(pixelSize = 512, anisotropy = 4) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 1024);
		ctx.clearRect(0, 0, size, size);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 224, 0, Math.PI * 2), 15, 7.5, 2.5, false);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 138, 0, Math.PI * 2), 12, 6, 2, true);
		drawLayeredRunePath(ctx, (c) => {
			for (let i = 0; i <= 16; i++) {
				const ang = i / 16 * Math.PI * 2;
				const r = i % 2 === 0 ? 216 : 94;
				const x = half + Math.cos(ang) * r;
				const y = half + Math.sin(ang) * r;
				if (i === 0) c.moveTo(x, y);
				else c.lineTo(x, y);
			}
		}, 15, 7, 2.5, false);
		drawLayeredRunePath(ctx, (c) => {
			c.moveTo(half, half - 54);
			c.lineTo(half + 54, half);
			c.lineTo(half, half + 54);
			c.lineTo(half - 54, half);
			c.closePath();
		}, 12, 6, 2.5, true);
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = anisotropy;
		tex.needsUpdate = true;
		return tex;
	}
	function createGroundOuterTexture(pixelSize = 512, anisotropy = 4) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 1024);
		ctx.clearRect(0, 0, size, size);
		for (let i = 0; i < 4; i++) {
			const a0 = i * Math.PI / 2 + .14;
			const a1 = (i + 1) * Math.PI / 2 - .14;
			drawLayeredRunePath(ctx, (c) => c.arc(half, half, 456, a0, a1), 22, 11, 3.8, false);
		}
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 412, 0, Math.PI * 2), 12, 6, 2, true);
		for (let i = 0; i < 8; i++) {
			const ang = i / 8 * Math.PI * 2;
			ctx.save();
			ctx.translate(half, half);
			ctx.rotate(ang);
			drawLayeredRunePath(ctx, (c) => {
				c.moveTo(476, -14);
				c.lineTo(436, 0);
				c.lineTo(476, 14);
			}, 14, 7, 2.5, i % 2 === 0);
			ctx.restore();
		}
		for (let i = 0; i < 32; i++) {
			if (i % 4 === 0) continue;
			const ang = i / 32 * Math.PI * 2;
			ctx.save();
			ctx.translate(half, half);
			ctx.rotate(ang);
			drawLayeredRunePath(ctx, (c) => {
				c.moveTo(412, 0);
				c.lineTo(434, 0);
			}, 8, 3.5, 1, false);
			ctx.restore();
		}
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = anisotropy;
		tex.needsUpdate = true;
		return tex;
	}
	function createGroundInnerTexture(pixelSize = 512, anisotropy = 4) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 1024);
		ctx.clearRect(0, 0, size, size);
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 310, 0, Math.PI * 2), 14, 7, 2.2, false);
		drawLayeredRunePath(ctx, (c) => {
			for (let i = 0; i <= 8; i++) {
				const ang = i / 8 * Math.PI * 2 + Math.PI / 8;
				const x = half + Math.cos(ang) * 304;
				const y = half + Math.sin(ang) * 304;
				if (i === 0) c.moveTo(x, y);
				else c.lineTo(x, y);
			}
		}, 14, 6.5, 2.2, true);
		for (let i = 0; i < 4; i++) {
			const ang = i * Math.PI / 2;
			ctx.save();
			ctx.translate(half, half);
			ctx.rotate(ang);
			drawLayeredRunePath(ctx, (c) => {
				c.moveTo(95, 0);
				c.lineTo(290, 0);
			}, 12, 5.5, 2, false);
			ctx.restore();
		}
		drawLayeredRunePath(ctx, (c) => c.arc(half, half, 86, 0, Math.PI * 2), 14, 7, 2.5, true);
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = anisotropy;
		tex.needsUpdate = true;
		return tex;
	}
	function createGroundCrackDecalTexture(pixelSize = 512, anisotropy = 4) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 1024);
		const rng = mulberry32(918273);
		ctx.clearRect(0, 0, size, size);
		const MAX_SAFE_R = size * .42;
		const scorchGrad = ctx.createRadialGradient(half, half, 0, half, half, size * .24);
		scorchGrad.addColorStop(0, "rgba(220, 255, 80, 0.92)");
		scorchGrad.addColorStop(.28, "rgba(130, 230, 40, 0.72)");
		scorchGrad.addColorStop(.62, "rgba(20, 150, 10, 0.34)");
		scorchGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
		ctx.fillStyle = scorchGrad;
		ctx.beginPath();
		ctx.arc(half, half, size * .24, 0, Math.PI * 2);
		ctx.fill();
		function fillTaperedCrack(points, startWidth, fillStyle) {
			if (points.length < 2) return;
			const left = [];
			const right = [];
			const n = points.length;
			for (let i = 0; i < n; i++) {
				const p = points[i];
				const prev = points[Math.max(0, i - 1)];
				const next = points[Math.min(n - 1, i + 1)];
				let dx = next.x - prev.x;
				let dy = next.y - prev.y;
				const len = Math.hypot(dx, dy) || 1;
				dx /= len;
				dy /= len;
				const nx = -dy;
				const ny = dx;
				const progress = i / (n - 1);
				const w = startWidth * Math.pow(1 - progress, 1.35);
				left.push({
					x: p.x + nx * w,
					y: p.y + ny * w
				});
				right.push({
					x: p.x - nx * w,
					y: p.y - ny * w
				});
			}
			ctx.fillStyle = fillStyle;
			ctx.beginPath();
			ctx.moveTo(left[0].x, left[0].y);
			for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
			for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
			ctx.closePath();
			ctx.fill();
		}
		function buildCrackBranch(startX, startY, baseAngle, targetDist, steps) {
			const pts = [{
				x: startX,
				y: startY
			}];
			let curX = startX;
			let curY = startY;
			let ang = baseAngle;
			const stepLen = targetDist / steps;
			for (let s = 1; s <= steps; s++) {
				ang += (rng() - .5) * .42;
				let nx = curX + Math.cos(ang) * stepLen;
				let ny = curY + Math.sin(ang) * stepLen;
				const rFromCenter = Math.hypot(nx - half, ny - half);
				if (rFromCenter > MAX_SAFE_R) {
					const scale = MAX_SAFE_R / rFromCenter;
					nx = half + (nx - half) * scale;
					ny = half + (ny - half) * scale;
					pts.push({
						x: nx,
						y: ny
					});
					break;
				}
				curX = nx;
				curY = ny;
				pts.push({
					x: curX,
					y: curY
				});
			}
			return pts;
		}
		const mainCracks = [];
		const subCracks = [];
		const numMain = 16;
		for (let i = 0; i < numMain; i++) {
			const angle = i / numMain * Math.PI * 2 + (rng() - .5) * .24;
			const organicLen = size * (.18 + rng() * .22);
			const steps = 8 + Math.floor(rng() * 5);
			const startOffset = 8 + rng() * 14;
			const pts = buildCrackBranch(half + Math.cos(angle) * startOffset, half + Math.sin(angle) * startOffset, angle, organicLen, steps);
			const baseW = 7.5 + rng() * 5.5;
			mainCracks.push({
				pts,
				baseW
			});
			const forkCount = rng() > .35 ? 2 : 1;
			for (let f = 0; f < forkCount; f++) {
				const origin = pts[Math.min(pts.length - 2, Math.max(2, Math.floor(pts.length * (.28 + rng() * .42))))];
				const forkAngle = angle + (f % 2 === 0 ? 1 : -1) * (.35 + rng() * .55);
				const forkLen = organicLen * (.26 + rng() * .28);
				const subPts = buildCrackBranch(origin.x, origin.y, forkAngle, forkLen, 5);
				subCracks.push({
					pts: subPts,
					baseW: baseW * (.45 + rng() * .15)
				});
			}
		}
		mainCracks.forEach(({ pts, baseW }) => fillTaperedCrack(pts, baseW * 1.45, "rgba(0, 235, 30, 0.94)"));
		subCracks.forEach(({ pts, baseW }) => fillTaperedCrack(pts, baseW * 1.35, "rgba(0, 215, 25, 0.88)"));
		mainCracks.forEach(({ pts, baseW }) => fillTaperedCrack(pts, baseW * .52, "rgba(255, 120, 255, 0.98)"));
		subCracks.forEach(({ pts, baseW }) => fillTaperedCrack(pts, baseW * .42, "rgba(235, 90, 220, 0.92)"));
		for (let i = 0; i < 42; i++) {
			const ang = rng() * Math.PI * 2;
			const dist = size * (.06 + rng() * .2);
			const cx = half + Math.cos(ang) * dist;
			const cy = half + Math.sin(ang) * dist;
			const chipR = 3 + rng() * 6;
			ctx.fillStyle = "rgba(0, 200, 140, 0.78)";
			ctx.beginPath();
			for (let v = 0; v < 5; v++) {
				const va = v / 5 * Math.PI * 2 + rng() * .5;
				const vr = chipR * (.6 + rng() * .5);
				const px = cx + Math.cos(va) * vr;
				const py = cy + Math.sin(va) * vr;
				if (v === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.closePath();
			ctx.fill();
		}
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = anisotropy;
		tex.needsUpdate = true;
		return tex;
	}
	function createStarburstTexture(pixelSize = 256) {
		const { canvas, ctx, size, half } = createCanvas2D(pixelSize, 512);
		ctx.clearRect(0, 0, size, size);
		const halo = ctx.createRadialGradient(half, half, 0, half, half, half * .48);
		halo.addColorStop(0, "rgba(255, 255, 255, 0.95)");
		halo.addColorStop(.35, "rgba(255, 255, 255, 0.35)");
		halo.addColorStop(1, "rgba(255, 255, 255, 0.0)");
		ctx.fillStyle = halo;
		ctx.fillRect(0, 0, size, size);
		function drawSpike(angle, length, width) {
			ctx.save();
			ctx.translate(half, half);
			ctx.rotate(angle);
			const g = ctx.createLinearGradient(0, -length, 0, length);
			g.addColorStop(0, "rgba(255,255,255,0)");
			g.addColorStop(.5, "rgba(255,255,255,0.95)");
			g.addColorStop(1, "rgba(255,255,255,0)");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.moveTo(0, -length);
			ctx.lineTo(width, 0);
			ctx.lineTo(0, length);
			ctx.lineTo(-width, 0);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		drawSpike(0, half * .92, 18);
		drawSpike(Math.PI * .5, half * .92, 18);
		drawSpike(Math.PI * .25, half * .52, 10);
		drawSpike(-Math.PI * .25, half * .52, 10);
		const tex = new three.CanvasTexture(canvas);
		tex.generateMipmaps = false;
		tex.minFilter = three.LinearFilter;
		tex.needsUpdate = true;
		return tex;
	}
	function mergeArrowParts(parts) {
		let totalVerts = 0;
		const normalized = parts.map(({ geo, partId }) => {
			const g = geo.index ? geo.toNonIndexed() : geo.clone();
			if (!g.attributes.normal) g.computeVertexNormals();
			totalVerts += g.attributes.position.count;
			return {
				g,
				partId
			};
		});
		const positions = new Float32Array(totalVerts * 3);
		const normals = new Float32Array(totalVerts * 3);
		const partIds = new Float32Array(totalVerts);
		let offset = 0;
		for (const { g, partId } of normalized) {
			const count = g.attributes.position.count;
			positions.set(g.attributes.position.array, offset * 3);
			normals.set(g.attributes.normal.array, offset * 3);
			partIds.fill(partId, offset, offset + count);
			offset += count;
			g.dispose();
		}
		const merged = new three.BufferGeometry();
		merged.setAttribute("position", new three.BufferAttribute(positions, 3));
		merged.setAttribute("normal", new three.BufferAttribute(normals, 3));
		merged.setAttribute("aPartId", new three.BufferAttribute(partIds, 1));
		merged.computeBoundingSphere();
		return merged;
	}
	function createStylizedArrowGeometry(includeCrossguard = false) {
		const parts = [];
		const headGeo = new three.ConeGeometry(.135, .62, 4, 1);
		headGeo.rotateX(Math.PI);
		headGeo.translate(0, -.05, 0);
		parts.push({
			geo: headGeo,
			partId: 1
		});
		const headBack = new three.ConeGeometry(.135, .22, 4, 1);
		headBack.translate(0, .37, 0);
		parts.push({
			geo: headBack,
			partId: 1
		});
		const shaftGeo = new three.CylinderGeometry(.032, .046, 1.66, 6, 1);
		shaftGeo.translate(0, 1.08, 0);
		parts.push({
			geo: shaftGeo,
			partId: 0
		});
		const collarGeo = new three.CylinderGeometry(.072, .072, .08, 6, 1);
		collarGeo.translate(0, .44, 0);
		parts.push({
			geo: collarGeo,
			partId: 2
		});
		if (includeCrossguard) for (let side = -1; side <= 1; side += 2) {
			const wing = new three.BoxGeometry(.46, .09, .045);
			wing.rotateZ(side * .42);
			wing.translate(side * .24, .56, 0);
			parts.push({
				geo: wing,
				partId: 2
			});
		}
		for (let i = 0; i < 3; i++) {
			const ang = i / 3 * Math.PI * 2;
			const fin = new three.BoxGeometry(.018, .52, .16);
			const pos = fin.attributes.position;
			for (let v = 0; v < pos.count; v++) {
				const y = pos.getY(v);
				if (pos.getZ(v) > 0) pos.setY(v, y + .18);
			}
			fin.computeVertexNormals();
			fin.translate(0, 1.62, .09);
			fin.rotateY(ang);
			parts.push({
				geo: fin,
				partId: 2
			});
		}
		return mergeArrowParts(parts);
	}
	function createCrossTrailGeometry() {
		const p1 = new three.PlaneGeometry(.24, 1, 1, 1);
		p1.translate(0, .5, 0);
		const p2 = new three.PlaneGeometry(.24, 1, 1, 1);
		p2.rotateY(Math.PI * .5);
		p2.translate(0, .5, 0);
		const g1 = p1.toNonIndexed();
		const g2 = p2.toNonIndexed();
		const c1 = g1.attributes.position.count;
		const total = c1 + g2.attributes.position.count;
		const pos = new Float32Array(total * 3);
		const uv = new Float32Array(total * 2);
		pos.set(g1.attributes.position.array, 0);
		pos.set(g2.attributes.position.array, c1 * 3);
		uv.set(g1.attributes.uv.array, 0);
		uv.set(g2.attributes.uv.array, c1 * 2);
		g1.dispose();
		g2.dispose();
		p1.dispose();
		p2.dispose();
		const merged = new three.BufferGeometry();
		merged.setAttribute("position", new three.BufferAttribute(pos, 3));
		merged.setAttribute("uv", new three.BufferAttribute(uv, 2));
		merged.computeBoundingSphere();
		return merged;
	}
	function createHelicalRibbonGeometry(radiusBottom, radiusTop, height, turns, width, phaseOffset) {
		const segs = 44;
		const positions = [];
		const uvs = [];
		const indices = [];
		for (let i = 0; i <= segs; i++) {
			const u = i / segs;
			const y = u * height;
			const r = three.MathUtils.lerp(radiusBottom, radiusTop, u);
			const angle = phaseOffset + u * Math.PI * 2 * turns;
			const w = width * Math.sin(u * Math.PI);
			const cx = Math.cos(angle) * r;
			const cz = Math.sin(angle) * r;
			positions.push(cx, y - w * .5, cz);
			positions.push(cx, y + w * .5, cz);
			uvs.push(u, 0);
			uvs.push(u, 1);
			if (i < segs) {
				const base = i * 2;
				indices.push(base, base + 1, base + 2);
				indices.push(base + 1, base + 3, base + 2);
			}
		}
		const geo = new three.BufferGeometry();
		geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		geo.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
		geo.setIndex(indices);
		geo.computeVertexNormals();
		geo.computeBoundingSphere();
		return geo;
	}
	function createDiamondSparkGeometry() {
		const geo = new three.OctahedronGeometry(.11, 0);
		geo.scale(.45, 1.9, .45);
		geo.computeBoundingSphere();
		return geo;
	}
	/**
	* Wraps a shared base BufferGeometry with a per-instance InstancedBufferAttribute
	* without duplicating vertex arrays. Dispose safely via `disposeInstancedWrapperGeometry()`.
	*/
	function createInstancedWrapperGeometry(baseGeo, instAttr) {
		const geo = new three.BufferGeometry();
		const sharedKeys = Object.keys(baseGeo.attributes);
		for (let i = 0; i < sharedKeys.length; i++) {
			const key = sharedKeys[i];
			geo.setAttribute(key, baseGeo.attributes[key]);
		}
		if (baseGeo.index) geo.setIndex(baseGeo.index);
		geo.setAttribute("aInstData", instAttr);
		geo.boundingSphere = baseGeo.boundingSphere ? baseGeo.boundingSphere.clone() : null;
		geo._sharedAttrKeys = sharedKeys;
		geo._hasSharedIndex = Boolean(baseGeo.index);
		return geo;
	}
	function disposeInstancedWrapperGeometry(geo) {
		if (!geo) return;
		if (geo._sharedAttrKeys) for (let i = 0; i < geo._sharedAttrKeys.length; i++) geo.deleteAttribute(geo._sharedAttrKeys[i]);
		if (geo._hasSharedIndex) geo.setIndex(null);
		geo.dispose();
	}
	/**
	* Pre-allocates all shared GPU textures & geometries once per game level.
	* Multiple simultaneous `DeterministicArrowRainVFX` instances share this bundle with 0 extra VRAM.
	* Call `sharedAssets.dispose()` when unloading the scene/level.
	*/
	function createArrowRainSharedAssets(options = {}) {
		const textureSize = options.textureSize || 512;
		const starSize = options.starSize || 256;
		const anisotropy = options.anisotropy || 4;
		const texture = (create) => typeof document === "undefined" ? new three.Texture() : create();
		const textures = {
			skyOuter: texture(() => createSkyRingOuterTexture(textureSize, anisotropy)),
			skyMid: texture(() => createSkyRingMidTexture(textureSize, anisotropy)),
			skyInner: texture(() => createSkyRingInnerTexture(textureSize, anisotropy)),
			groundOuter: texture(() => createGroundOuterTexture(textureSize, anisotropy)),
			groundInner: texture(() => createGroundInnerTexture(textureSize, anisotropy)),
			cracks: texture(() => createGroundCrackDecalTexture(textureSize, anisotropy)),
			starburst: texture(() => createStarburstTexture(starSize))
		};
		const circleGeo = new three.CircleGeometry(1, 48);
		circleGeo.rotateX(-Math.PI * .5);
		const crackGeo = new three.CircleGeometry(3, 48);
		crackGeo.rotateX(-Math.PI * .5);
		const swGeo = new three.CircleGeometry(1, 28);
		swGeo.rotateX(-Math.PI * .5);
		const giantGeo = createStylizedArrowGeometry(true);
		giantGeo.scale(2.55, 2.55, 2.55);
		const pillarGeo = new three.CylinderGeometry(2.45, 1.45, 22, 24, 1, true);
		pillarGeo.translate(0, 9.6, 0);
		const geometries = {
			circle: circleGeo,
			crack: crackGeo,
			arrow: createStylizedArrowGeometry(false),
			trail: createCrossTrailGeometry(),
			shockwave: swGeo,
			star: new three.PlaneGeometry(1, 1),
			dust: new three.IcosahedronGeometry(.45, 1),
			spark: createDiamondSparkGeometry(),
			giantArrow: giantGeo,
			helix1: createHelicalRibbonGeometry(.75, 1.55, 5.4, 2.2, .34, 0),
			helix2: createHelicalRibbonGeometry(.95, 1.85, 5.4, 2, .28, Math.PI),
			pillar: pillarGeo
		};
		return {
			textures,
			geometries,
			textureSize,
			starSize,
			estimatedTextureVramMB: (6 * textureSize * textureSize * 4 * 1.333 + starSize * starSize * 4) / 1048576,
			dispose() {
				Object.values(textures).forEach((t) => t && t.dispose());
				Object.values(geometries).forEach((g) => g && g.dispose());
			}
		};
	}
	function createToonArrowMaterial(themeU, isGiant = false) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: true,
			side: three.DoubleSide,
			blending: three.NormalBlending,
			uniforms: {
				uInk: themeU.ink,
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core,
				uLightDir: { value: new three.Vector3(.45, .82, .35).normalize() },
				uGiantAlpha: { value: 1 },
				uGiantDissolve: { value: 0 },
				uIsGiant: { value: isGiant ? 1 : 0 }
			},
			vertexShader: `
      attribute float aPartId;
      #ifdef USE_INSTANCING
        attribute vec4 aInstData;
      #endif
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      varying float vPartId;
      varying float vLocalY;
      varying vec4 vInstData;

      void main() {
        vPartId = aPartId;
        vLocalY = position.y;
        #ifdef USE_INSTANCING
          vInstData = aInstData;
          vec4 localPos = instanceMatrix * vec4(position, 1.0);
          vec3 norm = mat3(instanceMatrix) * normal;
        #else
          vInstData = vec4(1.0, 0.0, 0.0, 0.0);
          vec4 localPos = vec4(position, 1.0);
          vec3 norm = normal;
        #endif

        vec4 worldPos = modelMatrix * localPos;
        vWorldPos = worldPos.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * norm);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
			fragmentShader: `
      uniform vec3 uInk;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      uniform vec3 uLightDir;
      uniform float uGiantAlpha;
      uniform float uGiantDissolve;
      uniform float uIsGiant;

      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      varying float vPartId;
      varying float vLocalY;
      varying vec4 vInstData;

      void main() {
        float alpha = uIsGiant > 0.5 ? uGiantAlpha : vInstData.x;
        float dissolve = uIsGiant > 0.5 ? uGiantDissolve : vInstData.y;
        if (alpha <= 0.01) discard;

        float heightNorm = clamp((vLocalY + 0.4) / 2.4, 0.0, 1.0);
        float dissolveMask = heightNorm - dissolve * 1.18;
        if (dissolve > 0.01 && dissolveMask < 0.0) discard;

        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(cameraPosition - vWorldPos);
        float ndl = dot(N, uLightDir) * 0.5 + 0.5;
        float fresnel = 1.0 - max(dot(N, V), 0.0);

        vec3 baseMid = uPrimary;
        vec3 baseHi = uCore;
        if (vPartId > 1.5) {
          baseMid = uSecondary;
          baseHi = mix(uSecondary, uCore, 0.55);
        } else if (vPartId > 0.5) {
          baseMid = mix(uPrimary, uCore, 0.25);
          baseHi = uCore;
        }

        vec3 col;
        if (ndl > 0.72) {
          col = mix(baseMid, baseHi, 0.65);
        } else if (ndl > 0.36) {
          col = baseMid;
        } else {
          col = mix(uInk, baseMid, 0.45);
        }

        float inkRim = smoothstep(0.60, 0.78, fresnel);
        col = mix(col, uInk, inkRim * 0.85);

        float coreRidge = smoothstep(0.76, 0.94, max(dot(N, V), 0.0)) * step(0.4, vPartId);
        col = mix(col, uCore * 1.06, coreRidge * 0.55);

        if (dissolve > 0.01 && dissolveMask < 0.14) {
          col = mix(uSecondary, uCore, 0.65) * 1.08;
        }

        gl_FragColor = vec4(col, alpha);
      }
    `
		});
	}
	function createToonTrailMaterial(themeU) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.DoubleSide,
			blending: three.NormalBlending,
			uniforms: {
				uInk: themeU.ink,
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core
			},
			vertexShader: `
      #ifdef USE_INSTANCING
        attribute vec4 aInstData;
      #endif
      varying vec2 vUv;
      varying vec4 vInstData;
      void main() {
        vUv = uv;
        #ifdef USE_INSTANCING
          vInstData = aInstData;
          vec4 localPos = instanceMatrix * vec4(position, 1.0);
        #else
          vInstData = vec4(1.0, 0.0, 0.0, 0.0);
          vec4 localPos = vec4(position, 1.0);
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * localPos;
      }
    `,
			fragmentShader: `
      uniform vec3 uInk;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      varying vec2 vUv;
      varying vec4 vInstData;

      void main() {
        float alphaIn = vInstData.x;
        if (alphaIn <= 0.01) discard;

        float distFromCenter = abs(vUv.x - 0.5) * 2.0;
        float halfW = mix(0.95, 0.05, pow(vUv.y, 0.85));
        if (distFromCenter > halfW) discard;

        float normX = distFromCenter / max(halfW, 0.001);
        float lengthFade = (1.0 - smoothstep(0.35, 1.0, vUv.y)) * smoothstep(0.0, 0.06, vUv.y);

        vec3 col = uPrimary;
        if (normX < 0.28) {
          col = mix(uPrimary, uCore, 0.72);
        } else if (normX > 0.78) {
          col = mix(uInk, uPrimary, 0.35);
        }

        col = mix(col, uSecondary, smoothstep(0.45, 0.95, vUv.y) * 0.45);

        float outAlpha = alphaIn * lengthFade * 0.82;
        if (outAlpha <= 0.01) discard;
        gl_FragColor = vec4(col, outAlpha);
      }
    `
		});
	}
	function createMagicCircleMaterial(themeU, texture, isGround = false) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.DoubleSide,
			blending: three.NormalBlending,
			polygonOffset: isGround,
			polygonOffsetFactor: isGround ? -2 : 0,
			polygonOffsetUnits: isGround ? -2 : 0,
			uniforms: {
				uMap: { value: texture },
				uInk: themeU.ink,
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core,
				uOpacity: { value: 0 },
				uPulse: { value: 0 }
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
      uniform vec3 uInk;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      uniform float uOpacity;
      uniform float uPulse;
      varying vec2 vUv;

      void main() {
        if (uOpacity <= 0.005) discard;

        float r = length(vUv - 0.5);
        float radialSafety = 1.0 - smoothstep(0.46, 0.495, r);
        if (radialSafety <= 0.005) discard;

        vec4 tex = texture2D(uMap, vUv);
        if (tex.a <= 0.02) discard;

        vec3 col = uInk;
        col = mix(col, uPrimary, tex.g);
        col = mix(col, uSecondary, tex.b);
        col = mix(col, uCore * (0.98 + uPulse * 0.14), tex.r * 0.85);

        float finalAlpha = tex.a * uOpacity * radialSafety;
        gl_FragColor = vec4(col, finalAlpha);
      }
    `
		});
	}
	function createGroundCrackMaterial(themeU, crackTex) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.FrontSide,
			blending: three.NormalBlending,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			polygonOffsetUnits: -4,
			uniforms: {
				uMap: { value: crackTex },
				uCrackCore: themeU.crackCore,
				uCrackEdge: themeU.crackEdge,
				uSecondary: themeU.secondary,
				uCore: themeU.core,
				uReveal: { value: 0 },
				uOpacity: { value: 0 },
				uHeat: { value: 1 }
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
      uniform vec3 uCrackCore;
      uniform vec3 uCrackEdge;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      uniform float uReveal;
      uniform float uOpacity;
      uniform float uHeat;
      varying vec2 vUv;

      void main() {
        if (uOpacity <= 0.005 || uReveal <= 0.005) discard;

        vec2 centered = vUv - 0.5;
        float dist = length(centered);

        float edgeFade = 1.0 - smoothstep(0.41, 0.47, dist);
        if (edgeFade <= 0.005) discard;

        float angle = atan(centered.y, centered.x);
        float jag = sin(angle * 11.0) * 0.022 + cos(angle * 7.0 + 1.4) * 0.016;
        float revealRadius = uReveal * 0.48 + jag;
        float revealMask = 1.0 - smoothstep(revealRadius - 0.04, revealRadius + 0.01, dist);
        if (revealMask <= 0.005) discard;

        vec4 tex = texture2D(uMap, vUv);
        if (tex.a <= 0.015) discard;

        vec3 hotCore = mix(uCrackCore, uCore, 0.45) * (0.85 + 0.25 * uHeat);
        vec3 cooledCore = mix(uCrackEdge, uSecondary, 0.25);
        vec3 coreCol = mix(cooledCore, hotCore, uHeat);

        vec3 col = mix(uCrackEdge, coreCol, smoothstep(0.18, 0.78, tex.r));
        float finalAlpha = tex.a * edgeFade * revealMask * uOpacity;
        if (finalAlpha <= 0.01) discard;

        gl_FragColor = vec4(col, finalAlpha);
      }
    `
		});
	}
	function createShockwaveRingMaterial(themeU) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.DoubleSide,
			blending: three.NormalBlending,
			polygonOffset: true,
			polygonOffsetFactor: -3,
			polygonOffsetUnits: -3,
			uniforms: {
				uInk: themeU.ink,
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core
			},
			vertexShader: `
      attribute vec4 aInstData;
      varying vec2 vUv;
      varying vec4 vInstData;
      void main() {
        vUv = uv;
        vInstData = aInstData;
        vec4 localPos = instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * localPos;
      }
    `,
			fragmentShader: `
      uniform vec3 uInk;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      varying vec2 vUv;
      varying vec4 vInstData;

      void main() {
        float alphaIn = vInstData.y;
        if (alphaIn <= 0.01) discard;

        float r = length(vUv - 0.5) * 2.0;
        if (r > 0.98) discard;

        float thickness = vInstData.z;
        float outerEdge = 0.95;
        float innerEdge = max(0.05, outerEdge - thickness);

        if (r < innerEdge || r > outerEdge) discard;

        float bandT = (r - innerEdge) / max(outerEdge - innerEdge, 0.001);
        vec3 accent = mix(uPrimary, uSecondary, vInstData.w);

        vec3 col = accent;
        if (bandT > 0.88) {
          col = mix(uInk, accent, 0.35);
        } else if (bandT > 0.62) {
          col = mix(accent, uCore, 0.65);
        }

        float innerSoft = smoothstep(0.0, 0.25, bandT);
        float outAlpha = alphaIn * innerSoft * 0.88;
        if (outAlpha <= 0.01) discard;
        gl_FragColor = vec4(col, outAlpha);
      }
    `
		});
	}
	function createHelixWindMaterial(themeU) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.DoubleSide,
			blending: three.NormalBlending,
			uniforms: {
				uInk: themeU.ink,
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core,
				uTime: { value: 0 },
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
      uniform vec3 uInk;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        if (uOpacity <= 0.01) discard;

        float scrollU = fract(vUv.x * 3.0 - uTime * 2.8);
        float slashMask = smoothstep(0.08, 0.16, scrollU) * (1.0 - smoothstep(0.72, 0.88, scrollU));
        float edgeY = 1.0 - abs(vUv.y - 0.5) * 2.0;
        float endFade = smoothstep(0.0, 0.12, vUv.x) * (1.0 - smoothstep(0.84, 1.0, vUv.x));

        float shape = slashMask * smoothstep(0.05, 0.22, edgeY) * endFade;
        if (shape <= 0.08) discard;

        vec3 col = uPrimary;
        if (edgeY > 0.62) {
          col = mix(uPrimary, uCore, 0.65);
        } else if (edgeY < 0.28) {
          col = mix(uInk, uSecondary, 0.45);
        }

        gl_FragColor = vec4(col, shape * uOpacity * 0.82);
      }
    `
		});
	}
	function createEnergyPillarMaterial(themeU) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.DoubleSide,
			blending: three.NormalBlending,
			uniforms: {
				uInk: themeU.ink,
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core,
				uTime: { value: 0 },
				uOpacity: { value: 0 }
			},
			vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
			fragmentShader: `
      uniform vec3 uInk;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;

      void main() {
        if (uOpacity <= 0.01) discard;

        float stripes = sin(vUv.x * 6.283185 * 14.0 + uTime * 3.0) * 0.5 + 0.5;
        float fastStreaks = sin(vUv.x * 6.283185 * 22.0 - vUv.y * 8.0 + uTime * 10.0) * 0.5 + 0.5;
        float band = step(0.46, stripes * 0.65 + fastStreaks * 0.35);

        vec3 V = normalize(cameraPosition - vWorldPos);
        float edgeRim = 1.0 - abs(dot(normalize(vWorldNormal), V));
        float rimWeight = mix(0.25, 1.0, smoothstep(0.15, 0.72, edgeRim));
        float vFade = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.58, 1.0, vUv.y));

        float alpha = band * rimWeight * vFade * uOpacity * 0.68;
        if (alpha <= 0.015) discard;

        vec3 col = mix(uPrimary, uSecondary, smoothstep(0.2, 0.85, vUv.y));
        col = mix(col, uCore, smoothstep(0.65, 0.95, edgeRim) * 0.55);

        gl_FragColor = vec4(col, alpha);
      }
    `
		});
	}
	function createToonDustMaterial(themeU) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: three.NormalBlending,
			uniforms: {
				uDustDark: themeU.dustDark,
				uDustLight: themeU.dustLight,
				uPrimary: themeU.primary,
				uLightDir: { value: new three.Vector3(.4, .88, .3).normalize() }
			},
			vertexShader: `
      attribute vec4 aInstData;
      varying vec3 vWorldNormal;
      varying vec4 vInstData;
      void main() {
        vInstData = aInstData;
        vec4 localPos = instanceMatrix * vec4(position, 1.0);
        vec3 norm = mat3(instanceMatrix) * normal;
        vWorldNormal = normalize(mat3(modelMatrix) * norm);
        gl_Position = projectionMatrix * modelViewMatrix * localPos;
      }
    `,
			fragmentShader: `
      uniform vec3 uDustDark;
      uniform vec3 uDustLight;
      uniform vec3 uPrimary;
      uniform vec3 uLightDir;
      varying vec3 vWorldNormal;
      varying vec4 vInstData;

      void main() {
        float alpha = vInstData.x;
        if (alpha <= 0.01) discard;

        float ndl = dot(normalize(vWorldNormal), uLightDir) * 0.5 + 0.5;
        float litBand = step(0.48, ndl);
        vec3 col = mix(uDustDark, uDustLight, litBand);
        col = mix(col, uPrimary, vInstData.y * 0.28);

        gl_FragColor = vec4(col, alpha * 0.82);
      }
    `
		});
	}
	function createClampedSparkMaterial(themeU, starTex = null) {
		return new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: three.DoubleSide,
			blending: three.AdditiveBlending,
			uniforms: {
				uMap: { value: starTex },
				uHasMap: { value: starTex ? 1 : 0 },
				uPrimary: themeU.primary,
				uSecondary: themeU.secondary,
				uCore: themeU.core
			},
			vertexShader: `
      uniform float uHasMap;
      attribute vec4 aInstData;
      varying vec2 vUv;
      varying vec4 vInstData;
      void main() {
        vUv = uv;
        vInstData = aInstData;
        vec4 localPos = instanceMatrix * vec4(position, 1.0);
        if (uHasMap > 0.5) {
          vec4 center = modelViewMatrix * instanceMatrix[3];
          float scale = length(modelViewMatrix[0].xyz) * length(instanceMatrix[0].xyz);
          gl_Position = projectionMatrix * vec4(center.xy + position.xy * scale, center.zw);
        } else {
          gl_Position = projectionMatrix * modelViewMatrix * localPos;
        }
      }
    `,
			fragmentShader: `
      uniform sampler2D uMap;
      uniform float uHasMap;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform vec3 uCore;
      varying vec2 vUv;
      varying vec4 vInstData;

      void main() {
        float alpha = vInstData.x;
        if (alpha <= 0.01) discard;

        float mask = 1.0;
        if (uHasMap > 0.5) {
          mask = texture2D(uMap, vUv).a;
          if (mask <= 0.02) discard;
        }

        vec3 tint = mix(uPrimary, uSecondary, vInstData.y);
        vec3 col = mix(tint, uCore, vInstData.z);
        col = min(col * 0.82, vec3(0.85));

        gl_FragColor = vec4(col * alpha * mask, alpha * mask);
      }
    `
		});
	}
	var DeterministicArrowRainVFX = class {
		/**
		* @param {THREE.Scene} scene - Target Three.js scene
		* @param {object} sharedAssets - Result of `createArrowRainSharedAssets()`
		* @param {object} [options] - Optional per-instance overrides (theme, arrowCount, radius, slantDeg, pool sizes)
		*/
		constructor(scene, sharedAssets, options = {}) {
			this.scene = scene;
			this.shared = sharedAssets;
			this.config = {
				...DEFAULT_CONFIG,
				...options
			};
			this.themeU = createThemeUniforms(this.config.theme);
			this.root = new three.Group();
			this.scene.add(this.root);
			this.targetCenter = new three.Vector3(0, 0, 0);
			this.seed = options.seed ?? 202611;
			this.time = 0;
			this.isPlaying = false;
			this.activeArrowCount = 0;
			this._dummyMat = new three.Matrix4();
			this._pos = new three.Vector3();
			this._scale = new three.Vector3();
			this._quat = new three.Quaternion();
			this._wobbleQuat = new three.Quaternion();
			this._axis = new three.Vector3();
			this._dir = new three.Vector3();
			this._down = new three.Vector3(0, -1, 0);
			this._up = new three.Vector3(0, 1, 0);
			this._giantQuat = new three.Quaternion();
			this._identityQuat = new three.Quaternion();
			this._giantWobbleAxis = new three.Vector3(1, 0, 0);
			this.MAX_ARROWS = this.config.maxArrows;
			this.MAX_SHOCKWAVES = this.config.maxShockwaves;
			this.MAX_STARS = this.config.maxStars;
			this.MAX_DUST = this.config.maxDust;
			this.MAX_SPARKS = this.config.maxSparks;
			const { textures, geometries } = sharedAssets;
			this._materials = [];
			this._wrapperGeometries = [];
			this.skyOuterMat = createMagicCircleMaterial(this.themeU, textures.skyOuter, false);
			this.skyMidMat = createMagicCircleMaterial(this.themeU, textures.skyMid, false);
			this.skyInnerMat = createMagicCircleMaterial(this.themeU, textures.skyInner, false);
			this._materials.push(this.skyOuterMat, this.skyMidMat, this.skyInnerMat);
			this.skyOuterMesh = new three.Mesh(geometries.circle, this.skyOuterMat);
			this.skyMidMesh = new three.Mesh(geometries.circle, this.skyMidMat);
			this.skyInnerMesh = new three.Mesh(geometries.circle, this.skyInnerMat);
			this.root.add(this.skyOuterMesh, this.skyMidMesh, this.skyInnerMesh);
			this.groundOuterMat = createMagicCircleMaterial(this.themeU, textures.groundOuter, true);
			this.groundInnerMat = createMagicCircleMaterial(this.themeU, textures.groundInner, true);
			this._materials.push(this.groundOuterMat, this.groundInnerMat);
			this.groundOuterMesh = new three.Mesh(geometries.circle, this.groundOuterMat);
			this.groundInnerMesh = new three.Mesh(geometries.circle, this.groundInnerMat);
			this.groundOuterMesh.position.y = .03;
			this.groundInnerMesh.position.y = .04;
			this.root.add(this.groundOuterMesh, this.groundInnerMesh);
			this.crackMat = createGroundCrackMaterial(this.themeU, textures.cracks);
			this._materials.push(this.crackMat);
			this.crackMesh = new three.Mesh(geometries.crack, this.crackMat);
			this.crackMesh.position.y = .02;
			this.crackMesh.visible = false;
			this.root.add(this.crackMesh);
			this.arrowInstData = new Float32Array(this.MAX_ARROWS * 4);
			const arrowInstAttr = new three.InstancedBufferAttribute(this.arrowInstData, 4);
			arrowInstAttr.setUsage(three.DynamicDrawUsage);
			const arrowGeo = createInstancedWrapperGeometry(geometries.arrow, arrowInstAttr);
			this._wrapperGeometries.push(arrowGeo);
			this.arrowMat = createToonArrowMaterial(this.themeU, false);
			this._materials.push(this.arrowMat);
			this.arrowMesh = new three.InstancedMesh(arrowGeo, this.arrowMat, this.MAX_ARROWS);
			this.arrowMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.arrowMesh.count = 0;
			this.arrowMesh.visible = false;
			this.arrowMesh.frustumCulled = false;
			this.root.add(this.arrowMesh);
			this.trailInstData = new Float32Array(this.MAX_ARROWS * 4);
			const trailInstAttr = new three.InstancedBufferAttribute(this.trailInstData, 4);
			trailInstAttr.setUsage(three.DynamicDrawUsage);
			const trailGeo = createInstancedWrapperGeometry(geometries.trail, trailInstAttr);
			this._wrapperGeometries.push(trailGeo);
			this.trailMat = createToonTrailMaterial(this.themeU);
			this._materials.push(this.trailMat);
			this.trailMesh = new three.InstancedMesh(trailGeo, this.trailMat, this.MAX_ARROWS);
			this.trailMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.trailMesh.count = 0;
			this.trailMesh.visible = false;
			this.trailMesh.frustumCulled = false;
			this.root.add(this.trailMesh);
			this.swInstData = new Float32Array(this.MAX_SHOCKWAVES * 4);
			const swInstAttr = new three.InstancedBufferAttribute(this.swInstData, 4);
			swInstAttr.setUsage(three.DynamicDrawUsage);
			const swGeo = createInstancedWrapperGeometry(geometries.shockwave, swInstAttr);
			this._wrapperGeometries.push(swGeo);
			this.swMat = createShockwaveRingMaterial(this.themeU);
			this._materials.push(this.swMat);
			this.swMesh = new three.InstancedMesh(swGeo, this.swMat, this.MAX_SHOCKWAVES);
			this.swMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.swMesh.count = 0;
			this.swMesh.visible = false;
			this.swMesh.frustumCulled = false;
			this.root.add(this.swMesh);
			this.starInstData = new Float32Array(this.MAX_STARS * 4);
			const starInstAttr = new three.InstancedBufferAttribute(this.starInstData, 4);
			starInstAttr.setUsage(three.DynamicDrawUsage);
			const starGeo = createInstancedWrapperGeometry(geometries.star, starInstAttr);
			this._wrapperGeometries.push(starGeo);
			this.starMat = createClampedSparkMaterial(this.themeU, textures.starburst);
			this._materials.push(this.starMat);
			this.starMesh = new three.InstancedMesh(starGeo, this.starMat, this.MAX_STARS);
			this.starMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.starMesh.count = 0;
			this.starMesh.visible = false;
			this.starMesh.frustumCulled = false;
			this.root.add(this.starMesh);
			this.dustInstData = new Float32Array(this.MAX_DUST * 4);
			const dustInstAttr = new three.InstancedBufferAttribute(this.dustInstData, 4);
			dustInstAttr.setUsage(three.DynamicDrawUsage);
			const dustGeo = createInstancedWrapperGeometry(geometries.dust, dustInstAttr);
			this._wrapperGeometries.push(dustGeo);
			this.dustMat = createToonDustMaterial(this.themeU);
			this._materials.push(this.dustMat);
			this.dustMesh = new three.InstancedMesh(dustGeo, this.dustMat, this.MAX_DUST);
			this.dustMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.dustMesh.count = 0;
			this.dustMesh.visible = false;
			this.dustMesh.frustumCulled = false;
			this.root.add(this.dustMesh);
			this.sparkInstData = new Float32Array(this.MAX_SPARKS * 4);
			const sparkInstAttr = new three.InstancedBufferAttribute(this.sparkInstData, 4);
			sparkInstAttr.setUsage(three.DynamicDrawUsage);
			const sparkGeo = createInstancedWrapperGeometry(geometries.spark, sparkInstAttr);
			this._wrapperGeometries.push(sparkGeo);
			this.sparkMat = createClampedSparkMaterial(this.themeU, null);
			this._materials.push(this.sparkMat);
			this.sparkMesh = new three.InstancedMesh(sparkGeo, this.sparkMat, this.MAX_SPARKS);
			this.sparkMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.sparkMesh.count = 0;
			this.sparkMesh.visible = false;
			this.sparkMesh.frustumCulled = false;
			this.root.add(this.sparkMesh);
			this.giantGroup = new three.Group();
			this.giantGroup.visible = false;
			this.root.add(this.giantGroup);
			this.giantArrowMat = createToonArrowMaterial(this.themeU, true);
			this._materials.push(this.giantArrowMat);
			this.giantArrowMesh = new three.Mesh(geometries.giantArrow, this.giantArrowMat);
			this.giantGroup.add(this.giantArrowMesh);
			this.helixMat = createHelixWindMaterial(this.themeU);
			this._materials.push(this.helixMat);
			this.helix1 = new three.Mesh(geometries.helix1, this.helixMat);
			this.helix2 = new three.Mesh(geometries.helix2, this.helixMat);
			this.giantGroup.add(this.helix1, this.helix2);
			this.pillarMat = createEnergyPillarMaterial(this.themeU);
			this._materials.push(this.pillarMat);
			this.pillarMesh = new three.Mesh(geometries.pillar, this.pillarMat);
			this.pillarMesh.visible = false;
			this.root.add(this.pillarMesh);
			this.arrows = [];
			this.dustSpecs = [];
			this.sparkSpecs = [];
			this.rebuildSpecs();
		}
		/** Updates this instance's color theme without affecting any other active casts. */
		setTheme(themeOrKey) {
			this.config.theme = typeof themeOrKey === "string" ? themeOrKey : "custom";
			return applyThemeToUniforms(this.themeU, themeOrKey);
		}
		/** Updates instance parameters (arrowCount, radius, slantDeg) and rebuilds trajectories. */
		setConfig(partial) {
			Object.assign(this.config, partial);
			if (partial.theme) this.setTheme(partial.theme);
			this.rebuildSpecs();
		}
		/** Starts playback at world position (x, z). Suitable for game ability triggers & pooling. */
		play(x = this.targetCenter.x, z = this.targetCenter.z, newSeed = true) {
			this.castAt(x, z, newSeed);
			this.time = 0;
			this.isPlaying = true;
			this.root.visible = true;
		}
		/** Stops playback and immediately removes all meshes from rendering (0 draw calls). */
		stop() {
			this.isPlaying = false;
			this.root.visible = false;
			this.activeArrowCount = 0;
		}
		/**
		* Self-contained game-loop tick. Returns `true` while active, `false` once finished.
		*/
		update(dt, camera, speed = 1) {
			if (!this.isPlaying) return false;
			this.time += dt * speed;
			if (this.time >= SEQUENCE_DURATION) {
				this.stop();
				return false;
			}
			this.evaluate(this.time);
			return true;
		}
		/** Recomputes deterministic trajectories, coaxial dust plumes & spark bursts. */
		rebuildSpecs() {
			const rng = mulberry32(this.seed);
			const count = Math.min(this.MAX_ARROWS, Math.max(10, Math.round(this.config.arrowCount)));
			const radius = this.config.radius;
			const slantRad = three.MathUtils.degToRad(this.config.slantDeg);
			const skyHeight = 14.5;
			const baseDir = new three.Vector3(Math.sin(slantRad), -Math.cos(slantRad), .12 * Math.sin(slantRad)).normalize();
			this.arrows = [];
			for (let i = 0; i < count; i++) {
				const goldenAng = i * 2.3999632 + (rng() - .5) * .35;
				const dist = (.12 + Math.sqrt(clamp01((i + .5) / count + (rng() - .5) * .08)) * .88) * radius;
				const ix = Math.cos(goldenAng) * dist;
				const iz = Math.sin(goldenAng) * dist;
				const spawnTime = .46 + i % 3 * .44 + rng() * .52;
				const flightDur = .24 + rng() * .14;
				const impactTime = spawnTime + flightDur;
				const dir = baseDir.clone();
				dir.x += (rng() - .5) * .055;
				dir.z += (rng() - .5) * .055;
				dir.normalize();
				const quat = new three.Quaternion().setFromUnitVectors(this._down, dir);
				const wobbleAxis = new three.Vector3().crossVectors(dir, this._up);
				if (wobbleAxis.lengthSq() < 1e-4) wobbleAxis.set(1, 0, 0);
				else wobbleAxis.normalize();
				this.arrows.push({
					impactPos: new three.Vector3(ix, 0, iz),
					dir,
					quat,
					wobbleAxis,
					spawnTime,
					flightDur,
					impactTime,
					flightDist: (skyHeight + rng() * 2.4) / Math.max(.25, -dir.y),
					scale: .82 + rng() * .42,
					wobbleAmp: .07 + rng() * .06,
					wobbleFreq: 34 + rng() * 14,
					dissolveStart: 3.35 + rng() * .52,
					dissolveDur: .52 + rng() * .22,
					useSecondarySw: rng() > .62
				});
			}
			const blastAxis = baseDir.clone().negate().normalize();
			const refAxis = Math.abs(blastAxis.y) < .99 ? new three.Vector3(0, 1, 0) : new three.Vector3(1, 0, 0);
			const perpU = new three.Vector3().crossVectors(blastAxis, refAxis).normalize();
			const perpV = new three.Vector3().crossVectors(blastAxis, perpU).normalize();
			const slantSin = Math.hypot(baseDir.x, baseDir.z);
			const fwdHorizX = slantSin > .001 ? baseDir.x / slantSin : 0;
			const fwdHorizZ = slantSin > .001 ? baseDir.z / slantSin : 0;
			const giantDustCount = Math.max(16, Math.round(this.MAX_DUST * .3));
			const giantDustStart = this.MAX_DUST - giantDustCount;
			const axialDustCutoff = Math.round(giantDustCount * .46);
			this.dustSpecs = [];
			for (let i = 0; i < this.MAX_DUST; i++) if (i >= giantDustStart) {
				const gi = i - giantDustStart;
				const ang = gi / giantDustCount * Math.PI * 2 + (rng() - .5) * .22;
				if (gi < axialDustCutoff) {
					const axialSpd = 6.5 + rng() * 6.5;
					const radialSpd = 1.4 + rng() * 2.6;
					const rx = perpU.x * Math.cos(ang) + perpV.x * Math.sin(ang);
					const ry = perpU.y * Math.cos(ang) + perpV.y * Math.sin(ang);
					const rz = perpU.z * Math.cos(ang) + perpV.z * Math.sin(ang);
					const startH = .2 + rng() * .9;
					this.dustSpecs.push({
						ox: blastAxis.x * startH + rx * .45,
						oy: Math.max(.22, blastAxis.y * startH + ry * .45),
						oz: blastAxis.z * startH + rz * .45,
						vx: blastAxis.x * axialSpd + rx * radialSpd,
						vy: blastAxis.y * axialSpd + ry * radialSpd,
						vz: blastAxis.z * axialSpd + rz * radialSpd,
						spawnTime: GIANT_IMPACT_TIME + rng() * .07,
						life: .72 + rng() * .52,
						maxScale: 1.05 + rng() * 1.15,
						rotSpeed: (rng() - .5) * 3.2
					});
				} else {
					const spd = 4.2 + rng() * 5.2;
					const fwdBoost = (3.4 + rng() * 3.2) * slantSin;
					this.dustSpecs.push({
						ox: Math.cos(ang) * (.6 + rng() * .7) + fwdHorizX * .35 * slantSin,
						oy: .22,
						oz: Math.sin(ang) * (.6 + rng() * .7) + fwdHorizZ * .35 * slantSin,
						vx: Math.cos(ang) * spd + fwdHorizX * fwdBoost,
						vy: .7 + rng() * 1.9,
						vz: Math.sin(ang) * spd + fwdHorizZ * fwdBoost,
						spawnTime: GIANT_IMPACT_TIME + rng() * .08,
						life: .75 + rng() * .55,
						maxScale: 1.15 + rng() * 1.15,
						rotSpeed: (rng() - .5) * 3
					});
				}
			} else {
				const parent = this.arrows[i % count];
				const ang = rng() * Math.PI * 2;
				const spd = .8 + rng() * 1.9;
				this.dustSpecs.push({
					ox: parent.impactPos.x,
					oy: .22,
					oz: parent.impactPos.z,
					vx: Math.cos(ang) * spd,
					vy: .45 + rng() * 1.1,
					vz: Math.sin(ang) * spd,
					spawnTime: parent.impactTime,
					life: .38 + rng() * .3,
					maxScale: .45 + rng() * .5,
					rotSpeed: (rng() - .5) * 4
				});
			}
			const riseCount = Math.round(this.MAX_SPARKS * .15);
			const rainBurstEnd = Math.round(this.MAX_SPARKS * .68);
			const giantSparkCount = this.MAX_SPARKS - rainBurstEnd;
			const axialSparkCutoff = Math.round(giantSparkCount * .6);
			this.sparkSpecs = [];
			for (let i = 0; i < this.MAX_SPARKS; i++) if (i < riseCount) {
				const ang = rng() * Math.PI * 2;
				const rad = rng() * radius * .95;
				this.sparkSpecs.push({
					type: "rise",
					ox: Math.cos(ang) * rad,
					oy: .1,
					oz: Math.sin(ang) * rad,
					vx: (rng() - .5) * .4,
					vy: 3.5 + rng() * 4.5,
					vz: (rng() - .5) * .4,
					spawnTime: .08 + rng() * 1.4,
					life: .65 + rng() * .55,
					scale: .7 + rng() * .7,
					colorMix: rng(),
					coreMix: rng() * .6
				});
			} else if (i < rainBurstEnd) {
				const parent = this.arrows[(i - riseCount) % count];
				const ang = rng() * Math.PI * 2;
				const spd = 2 + rng() * 4.2;
				this.sparkSpecs.push({
					type: "burst",
					ox: parent.impactPos.x,
					oy: .12,
					oz: parent.impactPos.z,
					vx: Math.cos(ang) * spd,
					vy: 3.2 + rng() * 4.5,
					vz: Math.sin(ang) * spd,
					spawnTime: parent.impactTime,
					life: .28 + rng() * .25,
					scale: .55 + rng() * .55,
					colorMix: rng(),
					coreMix: .4 + rng() * .5
				});
			} else {
				const gi = i - rainBurstEnd;
				const ang = rng() * Math.PI * 2;
				if (gi < axialSparkCutoff) {
					const axialSpd = 9 + rng() * 10.5;
					const coneSpread = 1.6 + rng() * 4.4;
					const rx = perpU.x * Math.cos(ang) + perpV.x * Math.sin(ang);
					const ry = perpU.y * Math.cos(ang) + perpV.y * Math.sin(ang);
					const rz = perpU.z * Math.cos(ang) + perpV.z * Math.sin(ang);
					this.sparkSpecs.push({
						type: "burst",
						ox: blastAxis.x * .35 + rx * .4,
						oy: Math.max(.18, blastAxis.y * .35 + ry * .4),
						oz: blastAxis.z * .35 + rz * .4,
						vx: blastAxis.x * axialSpd + rx * coneSpread,
						vy: blastAxis.y * axialSpd + ry * coneSpread,
						vz: blastAxis.z * axialSpd + rz * coneSpread,
						spawnTime: GIANT_IMPACT_TIME,
						life: .45 + rng() * .45,
						scale: .9 + rng() * .95,
						colorMix: rng(),
						coreMix: .6 + rng() * .4
					});
				} else {
					const spd = 4.2 + rng() * 7;
					const fwdBoost = (5 + rng() * 6) * slantSin;
					this.sparkSpecs.push({
						type: "burst",
						ox: (rng() - .5) * .6,
						oy: .22,
						oz: (rng() - .5) * .6,
						vx: Math.cos(ang) * spd + fwdHorizX * fwdBoost,
						vy: 3.8 + rng() * 5.8,
						vz: Math.sin(ang) * spd + fwdHorizZ * fwdBoost,
						spawnTime: GIANT_IMPACT_TIME,
						life: .45 + rng() * .42,
						scale: .85 + rng() * .85,
						colorMix: rng(),
						coreMix: .5 + rng() * .45
					});
				}
			}
		}
		castAt(x, z, newSeed = true) {
			this.targetCenter.set(x, 0, z);
			this.root.position.set(x, 0, z);
			if (newSeed) {
				this.seed = this.seed + 7919 >>> 0;
				this.rebuildSpecs();
			}
		}
		/**
		* Deterministic frame evaluator using tight active-instance compaction:
		* sets `mesh.count = activeCount` and `mesh.visible = activeCount > 0` so inactive
		* pools submit 0 vertices and 0 draw calls to the GPU.
		*/
		evaluate(t) {
			this.time = t;
			const radius = this.config.radius;
			const slantRad = three.MathUtils.degToRad(this.config.slantDeg);
			const skyHeight = 14.5;
			const slantDir = this._dir.set(Math.sin(slantRad), -Math.cos(slantRad), .12 * Math.sin(slantRad)).normalize();
			const skyOffsetDist = skyHeight / Math.max(.25, -slantDir.y);
			const skyCenterX = -slantDir.x * skyOffsetDist;
			const skyCenterZ = -slantDir.z * skyOffsetDist;
			const skyPop = easeOutBack(clamp01(t / .45));
			const skyClose = easeInCubic(clamp01((t - 3.35) / .85));
			const skyScaleFactor = Math.max(.001, skyPop * (1 - skyClose * .72));
			const skyOpacity = smoothstep(0, .22, t) * (1 - skyClose);
			const skyPulse = Math.sin(t * 9) * .5 + .5;
			const skyBaseR = radius * 1.18;
			const skyVis = skyOpacity > .005;
			this.skyOuterMesh.visible = skyVis;
			this.skyMidMesh.visible = skyVis;
			this.skyInnerMesh.visible = skyVis;
			if (skyVis) {
				this.skyOuterMesh.position.set(skyCenterX, skyHeight, skyCenterZ);
				this.skyMidMesh.position.set(skyCenterX, 14.15, skyCenterZ);
				this.skyInnerMesh.position.set(skyCenterX, 13.8, skyCenterZ);
				this.skyOuterMesh.scale.setScalar(skyBaseR * skyScaleFactor);
				this.skyMidMesh.scale.setScalar(skyBaseR * .96 * skyScaleFactor);
				this.skyInnerMesh.scale.setScalar(skyBaseR * .88 * skyScaleFactor);
				this.skyOuterMesh.rotation.y = t * .65;
				this.skyMidMesh.rotation.y = -t * 1.15;
				this.skyInnerMesh.rotation.y = t * 1.85;
				this.skyOuterMat.uniforms.uOpacity.value = skyOpacity * .92;
				this.skyMidMat.uniforms.uOpacity.value = skyOpacity * .88;
				this.skyInnerMat.uniforms.uOpacity.value = skyOpacity * .95;
				this.skyOuterMat.uniforms.uPulse.value = skyPulse;
				this.skyMidMat.uniforms.uPulse.value = skyPulse;
				this.skyInnerMat.uniforms.uPulse.value = skyPulse;
			}
			const groundPop = easeOutBack(clamp01(t / .36));
			const groundClose = easeInCubic(clamp01((t - 3.45) / .85));
			const groundScale = Math.max(.001, radius * 1.06 * groundPop * (1 - groundClose * .35));
			const groundOpacity = smoothstep(0, .18, t) * (1 - groundClose);
			const groundVis = groundOpacity > .005;
			this.groundOuterMesh.visible = groundVis;
			this.groundInnerMesh.visible = groundVis;
			if (groundVis) {
				this.groundOuterMesh.scale.setScalar(groundScale);
				this.groundInnerMesh.scale.setScalar(groundScale * .92);
				this.groundOuterMesh.rotation.y = -t * .42;
				this.groundInnerMesh.rotation.y = t * .85;
				this.groundOuterMat.uniforms.uOpacity.value = groundOpacity * .86;
				this.groundInnerMat.uniforms.uOpacity.value = groundOpacity * .82;
				this.groundOuterMat.uniforms.uPulse.value = skyPulse;
				this.groundInnerMat.uniforms.uPulse.value = skyPulse;
			}
			let arrowIdx = 0;
			let trailIdx = 0;
			let swIdx = 0;
			let starIdx = 0;
			const nArrows = this.arrows.length;
			for (let i = 0; i < nArrows; i++) {
				const a = this.arrows[i];
				if (t < a.spawnTime || t > a.dissolveStart + a.dissolveDur) continue;
				if (t < a.impactTime) {
					const u = clamp01((t - a.spawnTime) / a.flightDur);
					const distRem = a.flightDist * (1 - u);
					this._pos.copy(a.impactPos).addScaledVector(a.dir, -distRem);
					this._scale.set(a.scale, a.scale * (1 + .18 * u), a.scale);
					this._dummyMat.compose(this._pos, a.quat, this._scale);
					this.arrowMesh.setMatrixAt(arrowIdx, this._dummyMat);
					const fadeIn = smoothstep(0, .14, u);
					this.arrowInstData[arrowIdx * 4] = fadeIn;
					this.arrowInstData[arrowIdx * 4 + 1] = 0;
					arrowIdx++;
					const trailLen = (2.8 + 2.4 * u) * a.scale;
					this._scale.set(a.scale * 1.1, trailLen, a.scale * 1.1);
					this._dummyMat.compose(this._pos, a.quat, this._scale);
					this.trailMesh.setMatrixAt(trailIdx, this._dummyMat);
					this.trailInstData[trailIdx * 4] = fadeIn * .92;
					trailIdx++;
				} else {
					const sinceImpact = t - a.impactTime;
					const wobble = Math.sin(sinceImpact * a.wobbleFreq) * a.wobbleAmp * Math.exp(-sinceImpact * 9.5);
					this._wobbleQuat.setFromAxisAngle(a.wobbleAxis, wobble);
					this._quat.copy(a.quat).premultiply(this._wobbleQuat);
					this._pos.copy(a.impactPos);
					this._scale.setScalar(a.scale);
					this._dummyMat.compose(this._pos, this._quat, this._scale);
					this.arrowMesh.setMatrixAt(arrowIdx, this._dummyMat);
					const dissolveP = clamp01((t - a.dissolveStart) / a.dissolveDur);
					this.arrowInstData[arrowIdx * 4] = 1 - easeInCubic(dissolveP);
					this.arrowInstData[arrowIdx * 4 + 1] = dissolveP;
					arrowIdx++;
					if (sinceImpact < .11) {
						const tp = sinceImpact / .11;
						const trailLen = (1 - tp) * 2.4 * a.scale;
						this._scale.set(a.scale, Math.max(.01, trailLen), a.scale);
						this._dummyMat.compose(a.impactPos, a.quat, this._scale);
						this.trailMesh.setMatrixAt(trailIdx, this._dummyMat);
						this.trailInstData[trailIdx * 4] = (1 - tp) * .72;
						trailIdx++;
					}
					if (sinceImpact < .34 && swIdx < this.MAX_SHOCKWAVES) {
						const p = sinceImpact / .34;
						const swScale = (.35 + easeOutCubic(p) * 1.15) * a.scale;
						this._pos.set(a.impactPos.x, .05, a.impactPos.z);
						this._scale.setScalar(swScale);
						this._dummyMat.compose(this._pos, this._quat.identity(), this._scale);
						this.swMesh.setMatrixAt(swIdx, this._dummyMat);
						this.swInstData[swIdx * 4] = p;
						this.swInstData[swIdx * 4 + 1] = (1 - p) * .85;
						this.swInstData[swIdx * 4 + 2] = .24 * (1 - p * .45);
						this.swInstData[swIdx * 4 + 3] = a.useSecondarySw ? 1 : 0;
						swIdx++;
					}
					if (sinceImpact < .18 && starIdx < this.MAX_STARS) {
						const p = sinceImpact / .18;
						const sScale = (.65 + easeOutCubic(p) * 1.15) * a.scale;
						this._pos.set(a.impactPos.x, .32, a.impactPos.z);
						this._scale.setScalar(sScale);
						this._dummyMat.compose(this._pos, this._identityQuat, this._scale);
						this.starMesh.setMatrixAt(starIdx, this._dummyMat);
						this.starInstData[starIdx * 4] = (1 - p) * .88;
						this.starInstData[starIdx * 4 + 1] = a.useSecondarySw ? .7 : .15;
						this.starInstData[starIdx * 4 + 2] = .72;
						starIdx++;
					}
				}
			}
			const giantSpawn = 2.12;
			const giantDissolveStart = 3.75;
			const giantDissolveDur = .68;
			let giantActive = 0;
			this._giantQuat.setFromUnitVectors(this._down, slantDir);
			this._giantWobbleAxis.crossVectors(slantDir, this._up);
			if (this._giantWobbleAxis.lengthSq() < 1e-4) this._giantWobbleAxis.set(1, 0, 0);
			else this._giantWobbleAxis.normalize();
			if (t >= giantSpawn && t <= 4.43) {
				this.giantGroup.visible = true;
				giantActive = 1;
				const giantFlightDist = 18.5 / Math.max(.25, -slantDir.y);
				if (t < GIANT_IMPACT_TIME) {
					const u = clamp01((t - giantSpawn) / .3799999999999999);
					const distRem = giantFlightDist * (1 - Math.pow(u, 1.35));
					this.giantGroup.position.copy(slantDir).multiplyScalar(-distRem);
					this.giantGroup.quaternion.copy(this._giantQuat);
					this.giantArrowMat.uniforms.uGiantAlpha.value = smoothstep(0, .14, u);
					this.giantArrowMat.uniforms.uGiantDissolve.value = 0;
					this.helix1.visible = true;
					this.helix2.visible = true;
					this.helix1.scale.setScalar(1);
					this.helix2.scale.setScalar(1);
					this.helix1.rotation.y = t * 8.5;
					this.helix2.rotation.y = -t * 6.8;
					this.helixMat.uniforms.uTime.value = t;
					this.helixMat.uniforms.uOpacity.value = smoothstep(0, .25, u) * .92;
				} else {
					const sinceG = t - GIANT_IMPACT_TIME;
					const shudder = Math.sin(sinceG * 42) * .075 * Math.exp(-sinceG * 6.5);
					this._wobbleQuat.setFromAxisAngle(this._giantWobbleAxis, shudder);
					this.giantGroup.position.set(0, 0, 0);
					this.giantGroup.quaternion.copy(this._giantQuat).premultiply(this._wobbleQuat);
					const dissolveP = clamp01((t - giantDissolveStart) / giantDissolveDur);
					this.giantArrowMat.uniforms.uGiantAlpha.value = 1 - easeInCubic(dissolveP);
					this.giantArrowMat.uniforms.uGiantDissolve.value = dissolveP;
					if (sinceG < .55) {
						const wp = sinceG / .55;
						this.helix1.visible = true;
						this.helix2.visible = true;
						this.helix1.rotation.y = t * 7;
						this.helix2.rotation.y = -t * 5.8;
						const spread = 1 + easeOutCubic(wp) * .65;
						this.helix1.scale.set(spread, 1, spread);
						this.helix2.scale.set(spread, 1, spread);
						this.helixMat.uniforms.uTime.value = t;
						this.helixMat.uniforms.uOpacity.value = (1 - wp) * .85;
					} else {
						this.helix1.visible = false;
						this.helix2.visible = false;
						this.helix1.scale.setScalar(1);
						this.helix2.scale.setScalar(1);
					}
				}
			} else this.giantGroup.visible = false;
			if (t >= GIANT_IMPACT_TIME) {
				const sinceG = t - GIANT_IMPACT_TIME;
				if (sinceG < .85) {
					const p = sinceG / .85;
					this.pillarMesh.visible = true;
					this.pillarMesh.position.set(0, 0, 0);
					this.pillarMesh.quaternion.copy(this._giantQuat);
					const xzScale = (.55 + easeOutCubic(p) * 1.15) * (radius / 5.2);
					this.pillarMesh.scale.set(xzScale, 1 + p * .25, xzScale);
					this.pillarMat.uniforms.uTime.value = t;
					this.pillarMat.uniforms.uOpacity.value = Math.sin(clamp01(p * 3.5) * Math.PI * .5) * (1 - smoothstep(.32, 1, p));
				} else this.pillarMesh.visible = false;
				const crackReveal = easeOutCubic(clamp01(sinceG / .28));
				const crackFadeOut = 1 - easeInCubic(clamp01((t - 3.6) / .85));
				const crackHeat = 1 - smoothstep(.45, 1.65, sinceG);
				this.crackMesh.visible = crackFadeOut > .005;
				if (this.crackMesh.visible) {
					this.crackMesh.scale.setScalar(radius / 5.2 * 1.25);
					this.crackMat.uniforms.uReveal.value = crackReveal;
					this.crackMat.uniforms.uOpacity.value = crackFadeOut * .96;
					this.crackMat.uniforms.uHeat.value = crackHeat;
				}
				if (sinceG < .78 && swIdx < this.MAX_SHOCKWAVES) {
					const p = sinceG / .78;
					const grandScale = .8 + easeOutCubic(p) * radius * 1.32;
					this._pos.set(slantDir.x * .65 * easeOutCubic(p), .06, slantDir.z * .65 * easeOutCubic(p));
					this._scale.setScalar(grandScale);
					this._dummyMat.compose(this._pos, this._quat.identity(), this._scale);
					this.swMesh.setMatrixAt(swIdx, this._dummyMat);
					this.swInstData[swIdx * 4] = p;
					this.swInstData[swIdx * 4 + 1] = (1 - p) * .95;
					this.swInstData[swIdx * 4 + 2] = .28 * (1 - p * .45);
					this.swInstData[swIdx * 4 + 3] = 0;
					swIdx++;
				}
				for (let r = 0; r < 2; r++) {
					const rDelay = r * .08;
					const rDur = .66 + r * .14;
					if (sinceG >= rDelay && sinceG < rDelay + rDur && swIdx < this.MAX_SHOCKWAVES) {
						const p = (sinceG - rDelay) / rDur;
						const ringScale = .9 + easeOutCubic(p) * radius * (.95 - r * .18);
						const travel = .45 + easeOutCubic(p) * (4.6 + r * 2.8);
						this._pos.copy(slantDir).multiplyScalar(-travel);
						this._scale.setScalar(ringScale);
						this._dummyMat.compose(this._pos, this._giantQuat, this._scale);
						this.swMesh.setMatrixAt(swIdx, this._dummyMat);
						this.swInstData[swIdx * 4] = p;
						this.swInstData[swIdx * 4 + 1] = (1 - p) * .9;
						this.swInstData[swIdx * 4 + 2] = (.24 - r * .05) * (1 - p * .4);
						this.swInstData[swIdx * 4 + 3] = r === 1 ? 1 : 0;
						swIdx++;
					}
				}
				if (sinceG < .32 && starIdx < this.MAX_STARS) {
					const p = sinceG / .32;
					const sScale = 2 + easeOutCubic(p) * 4.4;
					this._pos.copy(slantDir).multiplyScalar(-1.05);
					this._scale.setScalar(sScale);
					this._dummyMat.compose(this._pos, this._identityQuat, this._scale);
					this.starMesh.setMatrixAt(starIdx, this._dummyMat);
					this.starInstData[starIdx * 4] = (1 - p) * .95;
					this.starInstData[starIdx * 4 + 1] = .35;
					this.starInstData[starIdx * 4 + 2] = .85;
					starIdx++;
				}
			} else {
				this.pillarMesh.visible = false;
				this.crackMesh.visible = false;
			}
			let dustIdx = 0;
			for (let i = 0; i < this.dustSpecs.length; i++) {
				const d = this.dustSpecs[i];
				const dt = t - d.spawnTime;
				if (dt < 0 || dt > d.life) continue;
				const p = dt / d.life;
				const drag = 1 - Math.exp(-dt * 3.4);
				this._pos.set(d.ox + d.vx * drag * .55, Math.max(.18, d.oy + d.vy * drag * .55), d.oz + d.vz * drag * .55);
				const s = d.maxScale * (.35 + easeOutCubic(p) * .85) * (1 - smoothstep(.65, 1, p) * .35);
				this._axis.set(.4, 1, .25).normalize();
				this._quat.setFromAxisAngle(this._axis, dt * d.rotSpeed);
				this._scale.setScalar(s);
				this._dummyMat.compose(this._pos, this._quat, this._scale);
				this.dustMesh.setMatrixAt(dustIdx, this._dummyMat);
				this.dustInstData[dustIdx * 4] = smoothstep(0, .12, p) * (1 - smoothstep(.42, 1, p));
				this.dustInstData[dustIdx * 4 + 1] = 1 - smoothstep(0, .35, p);
				dustIdx++;
			}
			let sparkIdx = 0;
			const grav = 14.5;
			for (let i = 0; i < this.sparkSpecs.length; i++) {
				const sp = this.sparkSpecs[i];
				const dt = t - sp.spawnTime;
				if (dt < 0 || dt > sp.life) continue;
				const p = dt / sp.life;
				let vx = sp.vx;
				let vy = sp.vy;
				let vz = sp.vz;
				if (sp.type === "rise") this._pos.set(sp.ox + vx * dt + Math.sin(dt * 7 + i) * .14, sp.oy + vy * dt, sp.oz + vz * dt + Math.cos(dt * 6 + i) * .14);
				else {
					const px = sp.ox + vx * dt;
					const py = Math.max(.06, sp.oy + vy * dt - .5 * grav * dt * dt);
					const pz = sp.oz + vz * dt;
					vy = sp.vy - grav * dt;
					this._pos.set(px, py, pz);
				}
				this._axis.set(vx, vy, vz);
				if (this._axis.lengthSq() > 1e-4) {
					this._axis.normalize();
					this._quat.setFromUnitVectors(this._up, this._axis);
				} else this._quat.identity();
				const s = sp.scale * (1 - p * .65);
				this._scale.set(s, s * (1 + Math.min(1.2, Math.hypot(vx, vy, vz) * .08)), s);
				this._dummyMat.compose(this._pos, this._quat, this._scale);
				this.sparkMesh.setMatrixAt(sparkIdx, this._dummyMat);
				this.sparkInstData[sparkIdx * 4] = smoothstep(0, .1, p) * (1 - smoothstep(.45, 1, p));
				this.sparkInstData[sparkIdx * 4 + 1] = sp.colorMix;
				this.sparkInstData[sparkIdx * 4 + 2] = sp.coreMix;
				sparkIdx++;
			}
			this.activeArrowCount = arrowIdx + giantActive;
			this.arrowMesh.count = arrowIdx;
			this.arrowMesh.visible = arrowIdx > 0;
			if (arrowIdx > 0) {
				this.arrowMesh.instanceMatrix.needsUpdate = true;
				this.arrowMesh.geometry.attributes.aInstData.needsUpdate = true;
			}
			this.trailMesh.count = trailIdx;
			this.trailMesh.visible = trailIdx > 0;
			if (trailIdx > 0) {
				this.trailMesh.instanceMatrix.needsUpdate = true;
				this.trailMesh.geometry.attributes.aInstData.needsUpdate = true;
			}
			this.swMesh.count = swIdx;
			this.swMesh.visible = swIdx > 0;
			if (swIdx > 0) {
				this.swMesh.instanceMatrix.needsUpdate = true;
				this.swMesh.geometry.attributes.aInstData.needsUpdate = true;
			}
			this.starMesh.count = starIdx;
			this.starMesh.visible = starIdx > 0;
			if (starIdx > 0) {
				this.starMesh.instanceMatrix.needsUpdate = true;
				this.starMesh.geometry.attributes.aInstData.needsUpdate = true;
			}
			this.dustMesh.count = dustIdx;
			this.dustMesh.visible = dustIdx > 0;
			if (dustIdx > 0) {
				this.dustMesh.instanceMatrix.needsUpdate = true;
				this.dustMesh.geometry.attributes.aInstData.needsUpdate = true;
			}
			this.sparkMesh.count = sparkIdx;
			this.sparkMesh.visible = sparkIdx > 0;
			if (sparkIdx > 0) {
				this.sparkMesh.instanceMatrix.needsUpdate = true;
				this.sparkMesh.geometry.attributes.aInstData.needsUpdate = true;
			}
		}
		/**
		* Releases all per-instance GPU buffers, materials, and scene graph nodes without
		* invalidating `sharedAssets` (which can continue serving other active casts).
		*/
		dispose() {
			this.root.removeFromParent();
			for (let i = 0; i < this._materials.length; i++) this._materials[i].dispose();
			for (let i = 0; i < this._wrapperGeometries.length; i++) disposeInstancedWrapperGeometry(this._wrapperGeometries[i]);
			this.arrowMesh.dispose();
			this.trailMesh.dispose();
			this.swMesh.dispose();
			this.starMesh.dispose();
			this.dustMesh.dispose();
			this.sparkMesh.dispose();
			this._materials.length = 0;
			this._wrapperGeometries.length = 0;
		}
	};
	let shared = null;
	let users = 0;
	function normalizeCelestialArrowRainOptions(spec, options = {}) {
		return {
			size: finiteRange(options.size, .25, 2, 1),
			speed: finiteRange(options.speed, .25, 2, 1),
			quantity: Math.round(finiteRange(options.quantity, spec.quantity.min, spec.quantity.max, spec.quantity.default)),
			spread: finiteRange(options.spread, spec.spread.min, spec.spread.max, spec.spread.default)
		};
	}
	function createCelestialArrowRainEffect(spec, options = {}) {
		const group = new three.Group();
		group.name = spec.id;
		const mount = new three.Group();
		group.add(mount);
		let settings = normalizeCelestialArrowRainOptions(spec, options);
		let cast = null, elapsed = 0, disposed = false;
		group.scale.setScalar(settings.size);
		const lifecycle = {
			start: .46,
			end: 1.15,
			...spec.lifecycle
		};
		const rainConfig = () => ({
			arrowCount: settings.quantity,
			radius: DEFAULT_CONFIG.radius * settings.spread
		});
		const ensureCast = () => {
			if (cast) return;
			shared ??= createArrowRainSharedAssets(QUALITY_PRESETS.high);
			cast = new DeterministicArrowRainVFX(mount, shared, {
				...rainConfig(),
				seed: spec.seed
			});
			users++;
		};
		function showFrame() {
			if (elapsed > 0 && elapsed < SEQUENCE_DURATION) {
				ensureCast();
				cast.root.visible = true;
				cast.evaluate(elapsed);
			} else if (cast) cast.root.visible = false;
		}
		return {
			group,
			lifecycle,
			get settings() {
				return settings;
			},
			get elapsed() {
				return elapsed;
			},
			get duration() {
				return SEQUENCE_DURATION;
			},
			get particleCount() {
				return DEFAULT_CONFIG.maxShockwaves + DEFAULT_CONFIG.maxStars + DEFAULT_CONFIG.maxDust + DEFAULT_CONFIG.maxSparks;
			},
			get phase() {
				return disposed || elapsed >= SEQUENCE_DURATION ? "finished" : elapsed < lifecycle.start ? "starting" : elapsed >= SEQUENCE_DURATION - lifecycle.end ? "ending" : "active";
			},
			get finished() {
				return disposed || elapsed >= SEQUENCE_DURATION;
			},
			update(dt) {
				if (disposed || elapsed >= SEQUENCE_DURATION || !Number.isFinite(dt) || dt <= 0) return;
				elapsed = Math.min(SEQUENCE_DURATION, elapsed + dt * settings.speed);
				group.visible = elapsed < SEQUENCE_DURATION;
				showFrame();
			},
			reset() {
				if (disposed) return;
				elapsed = 0;
				group.visible = true;
				showFrame();
			},
			setOptions(partial = {}) {
				if (disposed) return;
				const previous = settings;
				settings = normalizeCelestialArrowRainOptions(spec, {
					...settings,
					...partial
				});
				group.scale.setScalar(settings.size);
				if (cast && (previous.quantity !== settings.quantity || previous.spread !== settings.spread)) {
					cast.setConfig(rainConfig());
					showFrame();
				}
			},
			dispose() {
				if (disposed) return;
				disposed = true;
				group.visible = false;
				group.removeFromParent();
				mount.removeFromParent();
				if (cast) {
					cast.dispose();
					cast = null;
					if (--users === 0) {
						shared.dispose();
						shared = null;
					}
				}
			}
		};
	}

//#endregion
exports.createCelestialArrowRainEffect = createCelestialArrowRainEffect;
exports.normalizeCelestialArrowRainOptions = normalizeCelestialArrowRainOptions;
return exports;
})({}, THREE);
const createCelestialArrowRainEffect = __vfxModule.createCelestialArrowRainEffect;
const normalizeCelestialArrowRainOptions = __vfxModule.normalizeCelestialArrowRainOptions;

const preset={"id":"celestial-arrow-rain","name":"星穹箭雨","english":"Celestial Arrow Rain","category":"area","kind":2,"variant":21,"schools":["light","arcane"],"color":"#0ea5e9","seed":202611,"duration":4.5,"burst":true,"maxParticles":810,"lifecycle":{"start":0.46,"end":1.15},"previewTime":2.63,"thumbnailTime":2.63,"quantity":{"min":10,"max":180,"default":110,"label":"箭雨數量","unit":"支","help":"調整落下的小箭數量；最後一支巨箭固定出現。"},"spread":{"min":0.5,"max":1.5,"default":1,"label":"落點散布範圍","help":"調整箭雨落點、法陣與地面光波的範圍。"},"description":"藍金法陣召來斜落的箭雨，最後一支巨箭擊地，激起光柱與裂紋。","tags":"星穹 星光 聖光 魔法 巨箭 箭雨 藍金 落擊 地裂 法陣 celestial arrow rain gold blue magic impact"};
export const defaultOptions={"size":1,"speed":1,"quantity":110,"spread":1};
export default function createVFX(options={}){return createCelestialArrowRainEffect(preset,{...defaultOptions,...options});}
