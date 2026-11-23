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
//#region src/effects/dark-lightning-runtime.js
	const DARK_LIGHTNING = Object.freeze({
		duration: 4.85,
		strikeTime: 1.5,
		impactTime: 1.52,
		fadeTime: 4.01
	});
	function createDarkLightningVFX(THREE, options) {
		const THEME_PRESETS = {
			crimson: {
				recolor: 0,
				primary: "#ff1a08",
				secondary: "#ff7a14",
				core: "#fff4d6",
				cloud: "#1c1426"
			},
			violet: {
				recolor: 1,
				primary: "#b829ff",
				secondary: "#ff38d4",
				core: "#f6e8ff",
				cloud: "#1b1129"
			},
			cyan: {
				recolor: 1,
				primary: "#00aaff",
				secondary: "#38f0ff",
				core: "#ebfcff",
				cloud: "#0e1d2c"
			},
			gold: {
				recolor: 1,
				primary: "#ff9d00",
				secondary: "#ffe247",
				core: "#fffbe6",
				cloud: "#261e12"
			},
			emerald: {
				recolor: 1,
				primary: "#10f048",
				secondary: "#a8ff1c",
				core: "#edffd9",
				cloud: "#102418"
			},
			void: {
				recolor: 1,
				primary: "#a8c6ff",
				secondary: "#dceaff",
				core: "#ffffff",
				cloud: "#181b22"
			}
		};
		const rawOpts = options || {};
		const initPreset = THEME_PRESETS[rawOpts.theme] || THEME_PRESETS.crimson;
		const opts = Object.assign({
			scale: 1,
			boltThickness: 1,
			density: 1,
			cloudScale: 1,
			flickerSpeed: 1,
			theme: "crimson",
			primaryColor: initPreset.primary,
			secondaryColor: initPreset.secondary,
			coreColor: initPreset.core,
			cloudColor: initPreset.cloud,
			quality: "high",
			seed: 0,
			pixelRatio: 1
		}, rawOpts);
		const cfg = {
			scale: opts.scale,
			boltThickness: opts.boltThickness,
			density: opts.density,
			cloudScale: opts.cloudScale,
			flickerSpeed: opts.flickerSpeed,
			theme: opts.theme,
			primaryColor: opts.primaryColor,
			secondaryColor: opts.secondaryColor,
			coreColor: opts.coreColor,
			cloudColor: opts.cloudColor
		};
		const qTier = opts.quality === "low" ? 0 : opts.quality === "medium" ? 1 : 2;
		const SEED_OFF = (opts.seed | 0) * 1009;
		const { duration: DURATION, strikeTime: STRIKE_T, impactTime: IMPACT_T } = DARK_LIGHTNING;
		const group = new THREE.Group();
		group.scale.setScalar(cfg.scale);
		const _themeUniforms = {
			uRecolor: { value: 0 },
			uPrimaryCol: { value: new THREE.Color(cfg.primaryColor) },
			uSecondaryCol: { value: new THREE.Color(cfg.secondaryColor) },
			uCoreCol: { value: new THREE.Color(cfg.coreColor) },
			uCloudCol: { value: new THREE.Color(cfg.cloudColor) }
		};
		const GLSL_PALETTE = `
    uniform float uRecolor;
    uniform vec3 uPrimaryCol;
    uniform vec3 uSecondaryCol;
    uniform vec3 uCoreCol;
    uniform vec3 uCloudCol;
    vec3 vfxTint(vec3 c) {
      if (uRecolor < 0.01) return c;
      float hi = max(c.r, max(c.g, c.b));
      if (hi < 0.0001) return c;
      float lo = min(c.r, min(c.g, c.b));
      float sat = (hi - lo) / hi;
      float warm = smoothstep(0.08, 0.58, c.g / hi);
      float whiteCore = smoothstep(0.45, 0.92, lo / hi);
      vec3 mapped = mix(uPrimaryCol, uSecondaryCol, warm);
      mapped = mix(mapped, uCoreCol, whiteCore);
      float neutralDark = (1.0 - smoothstep(0.18, 0.55, sat)) * (1.0 - smoothstep(0.15, 0.45, hi));
      vec3 tinted = mix(mapped * hi, uCloudCol * (hi * 2.4), neutralDark);
      return mix(c, tinted, uRecolor);
    }
  `;
		function applyThemeUniforms() {
			const preset = THEME_PRESETS[cfg.theme];
			const isDefaultCrimson = cfg.theme === "crimson" && cfg.primaryColor.toLowerCase() === "#ff1a08" && cfg.secondaryColor.toLowerCase() === "#ff7a14" && cfg.coreColor.toLowerCase() === "#fff4d6";
			_themeUniforms.uRecolor.value = isDefaultCrimson ? 0 : 1;
			_themeUniforms.uPrimaryCol.value.set(cfg.primaryColor);
			_themeUniforms.uSecondaryCol.value.set(cfg.secondaryColor);
			_themeUniforms.uCoreCol.value.set(cfg.coreColor);
			_themeUniforms.uCloudCol.value.set(cfg.cloudColor || (preset ? preset.cloud : "#1c1426"));
		}
		applyThemeUniforms();
		function hash01(n) {
			let x = (n + SEED_OFF | 0) ^ 2654435769;
			x = Math.imul(x ^ x >>> 16, 2246822507);
			x = Math.imul(x ^ x >>> 13, 3266489909);
			return ((x ^ x >>> 16) >>> 0) / 4294967296;
		}
		function hashSigned(n) {
			return hash01(n) * 2 - 1;
		}
		function clamp01(v) {
			return v < 0 ? 0 : v > 1 ? 1 : v;
		}
		function smoothstep(e0, e1, x) {
			const t = clamp01((x - e0) / (e1 - e0));
			return t * t * (3 - 2 * t);
		}
		function easeOutExpo(x) {
			return x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp01(x));
		}
		function easeOutCubic(x) {
			const t = 1 - clamp01(x);
			return 1 - t * t * t;
		}
		const BEAT_TIMES = [
			STRIKE_T,
			1.565,
			1.645,
			1.715,
			1.805,
			1.875,
			1.945,
			2.035,
			2.105,
			2.18,
			2.265,
			2.335,
			2.415,
			2.495,
			2.575,
			2.66,
			2.745,
			2.82,
			2.9,
			2.975,
			3.055,
			3.13,
			3.21,
			3.285,
			3.365,
			3.445,
			3.525,
			3.605,
			3.685,
			3.765,
			3.845,
			3.925,
			4.005,
			4.08
		];
		const _beatOut = {
			idx: 0,
			local: 0,
			pop: 0
		};
		function sampleBeat(t) {
			if (t <= BEAT_TIMES[0]) {
				_beatOut.idx = 0;
				_beatOut.local = 0;
				_beatOut.pop = 0;
				return _beatOut;
			}
			if (Math.abs(cfg.flickerSpeed - 1) > .01) {
				const scaled = (t - BEAT_TIMES[0]) * cfg.flickerSpeed;
				const step = .078;
				const idx = Math.floor(scaled / step);
				const loc = (scaled - idx * step) / step;
				_beatOut.idx = idx;
				_beatOut.local = loc;
				_beatOut.pop = Math.pow(1 - clamp01(loc / .38), 1.6);
				return _beatOut;
			}
			for (let i = 0; i < BEAT_TIMES.length - 1; i++) if (t < BEAT_TIMES[i + 1]) {
				const dt = BEAT_TIMES[i + 1] - BEAT_TIMES[i];
				const loc = (t - BEAT_TIMES[i]) / dt;
				_beatOut.idx = i;
				_beatOut.local = loc;
				_beatOut.pop = Math.pow(1 - clamp01(loc / .38), 1.6);
				return _beatOut;
			}
			_beatOut.idx = BEAT_TIMES.length - 2;
			_beatOut.local = 1;
			_beatOut.pop = 0;
			return _beatOut;
		}
		const disposables = [];
		function trackGeo(g) {
			disposables.push(g);
			return g;
		}
		function trackMat(m) {
			if (m && m.isShaderMaterial && m.fragmentShader) {
				m.uniforms = Object.assign({}, m.uniforms || {}, _themeUniforms);
				m.fragmentShader = GLSL_PALETTE + "\n" + m.fragmentShader.replace(/gl_FragColor\s*=\s*([^;]+);/g, "vec4 _vfxOut = $1; gl_FragColor = vec4(vfxTint(_vfxOut.rgb), _vfxOut.a);");
			}
			disposables.push(m);
			return m;
		}
		const _mat4 = new THREE.Matrix4();
		const _pos = new THREE.Vector3();
		const _quat = new THREE.Quaternion();
		const _scl = new THREE.Vector3();
		const _euler = new THREE.Euler();
		const _up = new THREE.Vector3(0, 1, 0);
		const _dir = new THREE.Vector3();
		const _tang = new THREE.Vector3();
		const _norm = new THREE.Vector3();
		const _bino = new THREE.Vector3();
		const _pA = new THREE.Vector3();
		const _pB = new THREE.Vector3();
		const GLSL_NOISE = `
    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 3; i++) {
        v += amp * vnoise(p);
        p *= 2.07;
        amp *= 0.5;
      }
      return v;
    }
  `;
		function mergeIndexedGeometries(geoList) {
			let totalVerts = 0, totalIdx = 0;
			for (let i = 0; i < geoList.length; i++) {
				totalVerts += geoList[i].attributes.position.count;
				totalIdx += geoList[i].index.count;
			}
			const positions = new Float32Array(totalVerts * 3);
			const uvs = new Float32Array(totalVerts * 2);
			const indices = new Uint32Array(totalIdx);
			let vOff = 0, iOff = 0;
			for (let g = 0; g < geoList.length; g++) {
				const geo = geoList[g];
				const posArr = geo.attributes.position.array;
				const uvArr = geo.attributes.uv.array;
				const idxArr = geo.index.array;
				positions.set(posArr, vOff * 3);
				uvs.set(uvArr, vOff * 2);
				for (let k = 0; k < idxArr.length; k++) indices[iOff + k] = idxArr[k] + vOff;
				vOff += geo.attributes.position.count;
				iOff += idxArr.length;
				geo.dispose();
			}
			const merged = new THREE.BufferGeometry();
			merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			merged.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
			merged.setIndex(new THREE.BufferAttribute(indices, 1));
			return trackGeo(merged);
		}
		function buildCutoutDiscGeometry(diameter, segments) {
			const geo = new THREE.CircleGeometry(diameter * .5, segments || 16);
			geo.rotateX(-Math.PI / 2);
			return trackGeo(geo);
		}
		function subdivideSharpSpine(rawPts, rawRads, subPerSeg, seed) {
			const outPts = [], outRads = [];
			for (let i = 0; i < rawPts.length - 1; i++) {
				const a = rawPts[i], b = rawPts[i + 1];
				const ra = rawRads[i], rb = rawRads[i + 1];
				for (let s = 0; s < subPerSeg; s++) {
					const f = s / subPerSeg;
					const p = new THREE.Vector3().lerpVectors(a, b, f);
					if (s > 0) {
						const kSalt = seed + i * 37 + s * 13;
						p.x += hashSigned(kSalt) * .065;
						p.z += hashSigned(kSalt + 7) * .065;
					}
					outPts.push(p);
					outRads.push(THREE.MathUtils.lerp(ra, rb, f) * (s > 0 ? .94 + hash01(seed + i * 29 + s) * .14 : 1));
				}
			}
			outPts.push(rawPts[rawPts.length - 1].clone());
			outRads.push(rawRads[rawRads.length - 1]);
			return {
				pts: outPts,
				rads: outRads
			};
		}
		function buildOutwardTubeGeometry(points, radii, radialSegs, twist, jaggedAmt) {
			const rings = points.length;
			const cols = radialSegs + 1;
			const vertCount = rings * cols;
			const positions = new Float32Array(vertCount * 3);
			const normals = new Float32Array(vertCount * 3);
			const uvs = new Float32Array(vertCount * 2);
			const indices = [];
			const prevNorm = new THREE.Vector3(0, 0, 1);
			const jAmt = jaggedAmt === void 0 ? .24 : jaggedAmt;
			for (let i = 0; i < rings; i++) {
				const p = points[i];
				if (i === 0) _tang.subVectors(points[1], points[0]).normalize();
				else if (i === rings - 1) _tang.subVectors(points[i], points[i - 1]).normalize();
				else _tang.subVectors(points[i + 1], points[i - 1]).normalize();
				_norm.copy(prevNorm).addScaledVector(_tang, -prevNorm.dot(_tang));
				if (_norm.lengthSq() < 1e-4) _norm.set(1, 0, 0).addScaledVector(_tang, -_tang.x);
				_norm.normalize();
				prevNorm.copy(_norm);
				_bino.crossVectors(_tang, _norm).normalize();
				const r = radii[i];
				const vCoord = i / (rings - 1);
				const angOff = (twist || 0) * vCoord;
				for (let j = 0; j <= radialSegs; j++) {
					const uCoord = j / radialSegs;
					const theta = uCoord * Math.PI * 2 + angOff;
					const jag = 1 + jAmt * Math.sin(theta * 3 + vCoord * 12) + jAmt * .58 * Math.cos(theta * 5 - vCoord * 16);
					const c = Math.cos(theta), s = Math.sin(theta);
					const nx = c * _norm.x + s * _bino.x;
					const ny = c * _norm.y + s * _bino.y;
					const nz = c * _norm.z + s * _bino.z;
					const idx = i * cols + j;
					positions[idx * 3] = p.x + nx * r * jag;
					positions[idx * 3 + 1] = p.y + ny * r * jag;
					positions[idx * 3 + 2] = p.z + nz * r * jag;
					normals[idx * 3] = nx;
					normals[idx * 3 + 1] = ny;
					normals[idx * 3 + 2] = nz;
					uvs[idx * 2] = uCoord;
					uvs[idx * 2 + 1] = vCoord;
				}
			}
			for (let i = 0; i < rings - 1; i++) for (let j = 0; j < radialSegs; j++) {
				const a = i * cols + j;
				const b = (i + 1) * cols + j;
				const c = (i + 1) * cols + (j + 1);
				const d = i * cols + (j + 1);
				indices.push(a, d, b, d, c, b);
			}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
			geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
			geo.setIndex(indices);
			return trackGeo(geo);
		}
		function buildFlatSlashRibbonRaw(points, widths) {
			const n = points.length;
			const positions = new Float32Array(n * 2 * 3);
			const uvs = new Float32Array(n * 2 * 2);
			const indices = [];
			for (let i = 0; i < n; i++) {
				const p = points[i];
				if (i === 0) _tang.subVectors(points[1], points[0]).normalize();
				else if (i === n - 1) _tang.subVectors(points[i], points[i - 1]).normalize();
				else _tang.subVectors(points[i + 1], points[i - 1]).normalize();
				_norm.set(p.x, 0, p.z);
				if (_norm.lengthSq() < 1e-4) _norm.set(1, 0, 0);
				_norm.normalize();
				_bino.crossVectors(_tang, _norm).normalize();
				const w = widths[i];
				const v = i / (n - 1);
				const base = i * 2;
				positions[base * 3] = p.x - _bino.x * w;
				positions[base * 3 + 1] = p.y - _bino.y * w;
				positions[base * 3 + 2] = p.z - _bino.z * w;
				positions[(base + 1) * 3] = p.x + _bino.x * w;
				positions[(base + 1) * 3 + 1] = p.y + _bino.y * w;
				positions[(base + 1) * 3 + 2] = p.z + _bino.z * w;
				uvs[base * 2] = 0;
				uvs[base * 2 + 1] = v;
				uvs[(base + 1) * 2] = 1;
				uvs[(base + 1) * 2 + 1] = v;
			}
			for (let i = 0; i < n - 1; i++) {
				const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
				indices.push(a, b, c, b, d, c);
			}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
			geo.setIndex(indices);
			return geo;
		}
		function createBatchedBoltPool(maxBolts, segments, material, renderOrder) {
			const vertsPerBolt = (segments + 1) * 4;
			const vertCount = maxBolts * vertsPerBolt;
			const positions = new Float32Array(vertCount * 3);
			const uvs = new Float32Array(vertCount * 2);
			const indices = [];
			for (let b = 0; b < maxBolts; b++) {
				const vOff = b * vertsPerBolt;
				for (let i = 0; i <= segments; i++) {
					const v = i / segments;
					for (let r = 0; r < 2; r++) {
						const base = vOff + i * 4 + r * 2;
						uvs[base * 2] = 0;
						uvs[base * 2 + 1] = v;
						uvs[(base + 1) * 2] = 1;
						uvs[(base + 1) * 2 + 1] = v;
					}
				}
				for (let i = 0; i < segments; i++) for (let r = 0; r < 2; r++) {
					const a = vOff + i * 4 + r * 2;
					const bIdx = a + 1;
					const c = vOff + (i + 1) * 4 + r * 2;
					const d = c + 1;
					indices.push(a, bIdx, c, bIdx, d, c);
				}
			}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
			geo.setIndex(indices);
			trackGeo(geo);
			const mesh = new THREE.Mesh(geo, material);
			mesh.frustumCulled = false;
			mesh.renderOrder = renderOrder || 4;
			group.add(mesh);
			const scratchPts = [];
			for (let i = 0; i <= segments; i++) scratchPts.push(new THREE.Vector3());
			return {
				mesh,
				maxBolts,
				segments,
				vertsPerBolt,
				scratchPts,
				hideSlot(slotIdx) {
					const arr = geo.attributes.position.array;
					const start = slotIdx * vertsPerBolt * 3;
					const end = start + vertsPerBolt * 3;
					for (let i = start; i < end; i++) arr[i] = 0;
				},
				writeSlot(slotIdx, pathPts, baseWidth, taperTip) {
					const arr = geo.attributes.position.array;
					const n = pathPts.length;
					const slotOff = slotIdx * vertsPerBolt * 3;
					for (let i = 0; i < n; i++) {
						const p = pathPts[i];
						if (i === 0) _tang.subVectors(pathPts[1], pathPts[0]).normalize();
						else if (i === n - 1) _tang.subVectors(pathPts[i], pathPts[i - 1]).normalize();
						else _tang.subVectors(pathPts[i + 1], pathPts[i - 1]).normalize();
						if (Math.abs(_tang.y) < .92) _norm.crossVectors(_tang, _up).normalize();
						else _norm.set(1, 0, 0).cross(_tang).normalize();
						_bino.crossVectors(_tang, _norm).normalize();
						const frac = i / (n - 1);
						const w = baseWidth * (taperTip ? Math.sin(frac * Math.PI) * .72 + .28 * (1 - frac * .5) : 1 - frac * .28);
						const baseIdx = slotOff + i * 12;
						arr[baseIdx] = p.x - _norm.x * w;
						arr[baseIdx + 1] = p.y - _norm.y * w;
						arr[baseIdx + 2] = p.z - _norm.z * w;
						arr[baseIdx + 3] = p.x + _norm.x * w;
						arr[baseIdx + 4] = p.y + _norm.y * w;
						arr[baseIdx + 5] = p.z + _norm.z * w;
						arr[baseIdx + 6] = p.x - _bino.x * w;
						arr[baseIdx + 7] = p.y - _bino.y * w;
						arr[baseIdx + 8] = p.z - _bino.z * w;
						arr[baseIdx + 9] = p.x + _bino.x * w;
						arr[baseIdx + 10] = p.y + _bino.y * w;
						arr[baseIdx + 11] = p.z + _bino.z * w;
					}
				},
				commit() {
					geo.attributes.position.needsUpdate = true;
				}
			};
		}
		function fillMidpointBolt(pts, startPt, endPt, displaceAmt, yBias, seedBase) {
			const n = pts.length - 1;
			pts[0].copy(startPt);
			pts[n].copy(endPt);
			let step = n, disp = displaceAmt, salt = seedBase | 0;
			while (step > 1) {
				const half = step >> 1;
				for (let i = 0; i < n; i += step) {
					const a = pts[i], b = pts[i + step], mid = pts[i + half];
					salt = salt + 7919 | 0;
					mid.set((a.x + b.x) * .5 + hashSigned(salt) * disp, Math.max(.03, (a.y + b.y) * .5 + hashSigned(salt + 131) * disp * .45 + yBias * (disp / displaceAmt)), (a.z + b.z) * .5 + hashSigned(salt + 263) * disp);
				}
				step = half;
				disp *= .56;
			}
		}
		const telegraphGlowMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uIntensity: { value: 0 },
				uRamp: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uRamp;
      ${GLSL_NOISE}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float ang = atan(p.y, p.x);
        float n1 = fbm(p * 3.2 + vec2(uTime * 0.6, -uTime * 0.9));
        float n2 = fbm(vec2(ang * 2.5, r * 5.0 - uTime * 3.4));
        float pool = pow(clamp(1.0 - r * (0.92 + (n1 - 0.5) * 0.25), 0.0, 1.0), 1.85);
        float veins = smoothstep(0.60, 0.88, n2) * (1.0 - smoothstep(0.15, 0.95, r)) * (0.45 + 0.55 * uRamp);
        float alpha = (pool * 0.86 + veins * 0.52) * uIntensity * (1.0 - smoothstep(0.65, 1.0, r));
        vec3 col = mix(vec3(0.72, 0.02, 0.04), vec3(1.0, 0.12, 0.03), pool * 0.85 + uRamp * 0.3);
        col = mix(col, vec3(1.0, 0.42, 0.08), clamp(veins * 0.82 + pow(pool, 3.0) * 0.42 * uRamp, 0.0, 1.0));
        gl_FragColor = vec4(col * alpha, alpha);
      }
    `
		}));
		const telegraphGlowMesh = new THREE.Mesh(buildCutoutDiscGeometry(7.8, 20), telegraphGlowMat);
		telegraphGlowMesh.position.y = .012;
		group.add(telegraphGlowMesh);
		const microBoltMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uOpacity: { value: 0 },
				uHotness: { value: .9 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      uniform float uHotness;
      void main() {
        float edge = abs(vUv.x - 0.5) * 2.0;
        float core = (1.0 - smoothstep(0.0, 0.24, edge));
        float innerGlow = pow(clamp(1.0 - edge, 0.0, 1.0), 1.85);
        float outerAura = pow(clamp(1.0 - edge, 0.0, 1.0), 3.1) * 0.95;
        float ends = smoothstep(0.0, 0.10, vUv.y) * (1.0 - smoothstep(0.90, 1.0, vUv.y));
        vec3 col = vec3(1.0, 0.08, 0.02) * outerAura * 1.95;
        col += vec3(1.0, 0.42, 0.05) * innerGlow * 1.45;
        col = mix(col, vec3(0.95, 0.98, 1.0) * 2.2, core * uHotness);
        gl_FragColor = vec4(col, clamp(innerGlow + outerAura, 0.0, 1.0) * ends * uOpacity);
      }
    `
		}));
		const TELE_ARC_COUNT = qTier === 0 ? 10 : 16;
		const LEADER_COUNT = qTier === 0 ? 4 : 6;
		const SKY_BOLT_COUNT = qTier === 0 ? 8 : qTier === 1 ? 12 : 16;
		const skyTeleBoltPool = createBatchedBoltPool(TELE_ARC_COUNT + LEADER_COUNT + SKY_BOLT_COUNT, 8, microBoltMat, 5);
		const WISP_COUNT = qTier === 0 ? 14 : 24;
		const wispGeo = trackGeo(new THREE.PlaneGeometry(.2, 1.05));
		wispGeo.rotateX(-Math.PI / 2);
		const wispMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uOpacity: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      ${GLSL_NOISE}
      void main() {
        float bend = sin(vUv.y * 4.5 - uTime * 7.5) * 0.18;
        float xDist = abs(vUv.x - 0.5 + bend);
        float n = vnoise(vec2(vUv.x * 4.0, vUv.y * 5.0 - uTime * 3.5));
        float xMask = (1.0 - smoothstep(0.0, 0.40 * (1.0 - vUv.y * 0.45), xDist));
        float yMask = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.20, 1.0, vUv.y));
        vec3 col = mix(vec3(0.65, 0.02, 0.04), vec3(1.0, 0.24, 0.05), yMask * xMask);
        gl_FragColor = vec4(col * 1.15, xMask * yMask * (0.65 + 0.35 * n) * uOpacity);
      }
    `
		}));
		const convergeWisps = new THREE.InstancedMesh(wispGeo, wispMat, WISP_COUNT);
		convergeWisps.frustumCulled = false;
		group.add(convergeWisps);
		const wispData = [];
		for (let i = 0; i < WISP_COUNT; i++) wispData.push({
			angle: hash01(103 + i * 17) * Math.PI * 2,
			rStart: 2.35 + hash01(104 + i * 19) * 1.85,
			speed: .78 + hash01(105 + i * 23) * .52,
			phase: hash01(106 + i * 29),
			len: .65 + hash01(107 + i * 31) * .65
		});
		const SKY_ORIGIN = new THREE.Vector3(3.4, 11.04, -.82);
		const CLOUD_COUNT = qTier === 0 ? 18 : qTier === 1 ? 26 : 36;
		const cloudGeo = trackGeo(new THREE.SphereGeometry(1, qTier === 0 ? 8 : 10, qTier === 0 ? 6 : 7));
		{
			const pos = cloudGeo.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
				const lump = 1 + .22 * Math.sin(vx * 3.5 + vz * 2.5) + .14 * Math.cos(vy * 4.2 - vx * 2.8);
				const ySculpt = vy < 0 ? vy * .46 : vy * .85;
				pos.setXYZ(i, vx * lump * 1.45, ySculpt * lump, vz * lump * 1.25);
			}
			cloudGeo.computeVertexNormals();
		}
		const cloudMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: true,
			side: THREE.FrontSide,
			uniforms: {
				uTime: { value: 0 },
				uOpacity: { value: 0 },
				uFlash: { value: 0 },
				uCharge: { value: 0 }
			},
			vertexShader: `
      varying vec3 vGroupPos;
      varying vec3 vNormalGroup;
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        // Group-local coordinates so spawning/moving/rotating vfx.group works anywhere in a 3D game!
        vec4 gp = instanceMatrix * vec4(position, 1.0);
        vGroupPos = gp.xyz;
        vNormalGroup = normalize(mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * gp;
      }
    `,
			fragmentShader: `
      varying vec3 vGroupPos;
      varying vec3 vNormalGroup;
      varying vec3 vLocalPos;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uFlash;
      uniform float uCharge;
      ${GLSL_NOISE}
      void main() {
        vec3 N = normalize(vNormalGroup);
        float n = fbm(vLocalPos.xz * 1.6 + vec2(uTime * 0.55, -uTime * 0.4));
        vec3 eyePos = vec3(3.40, 10.6, -0.82);
        vec3 toEye = normalize(eyePos - vGroupPos);
        float distEye = length(vGroupPos.xz - eyePos.xz);
        float underLight = (1.0 - smoothstep(-0.75, 0.35, N.y)) * (1.0 - smoothstep(1.25, 9.5, distEye));
        float eyeRim = pow(max(dot(N, toEye), 0.0), 1.6) * (1.0 - smoothstep(1.1, 8.0, distEye));

        vec3 darkAsh = vec3(0.032, 0.026, 0.046);
        vec3 bruiseGrey = vec3(0.085, 0.068, 0.105);
        vec3 bloodBrimstone = vec3(0.72, 0.12, 0.04);
        vec3 hellAmber = vec3(1.0, 0.42, 0.09) * (1.25 + uFlash * 0.85);

        float topStep = smoothstep(0.25, 0.72, N.y * 0.5 + 0.5 + (n - 0.5) * 0.35);
        vec3 col = mix(darkAsh, bruiseGrey, topStep * 0.75);
        col = mix(col, bloodBrimstone, clamp(underLight * (0.55 + uCharge * 0.45) + eyeRim * 0.45, 0.0, 1.0));
        col += hellAmber * clamp(pow(underLight * eyeRim, 1.4) * (0.6 + uFlash * 1.2) + smoothstep(0.74, 0.92, n) * eyeRim * (0.4 + uFlash * 0.9), 0.0, 1.0);
        gl_FragColor = vec4(col, uOpacity);
      }
    `
		}));
		const stormClouds = new THREE.InstancedMesh(cloudGeo, cloudMat, CLOUD_COUNT);
		stormClouds.frustumCulled = false;
		stormClouds.renderOrder = 2;
		group.add(stormClouds);
		const cloudData = [];
		for (let i = 0; i < CLOUD_COUNT; i++) {
			const ring = i < CLOUD_COUNT / 3 ? 0 : i < CLOUD_COUNT * 2 / 3 ? 1 : 2;
			const perRing = Math.max(1, Math.floor(CLOUD_COUNT / 3));
			const baseAng = i % perRing / perRing * Math.PI * 2 + ring * .38 + hashSigned(601 + i * 7) * .18;
			const baseRad = ring === 0 ? 1.6 + hash01(602 + i * 11) * 1.1 : ring === 1 ? 3.4 + hash01(602 + i * 11) * 1.7 : 5.75 + hash01(602 + i * 11) * 2.5;
			cloudData.push({
				ang: baseAng,
				rad: baseRad,
				yOff: ring * .42 + hashSigned(603 + i * 13) * .32,
				sx: (ring === 0 ? 1.12 : ring === 1 ? 1.68 : 2.34) * (.82 + hash01(604 + i * 17) * .45),
				sy: (ring === 0 ? .95 : ring === 1 ? 1.25 : 1.6) * (.85 + hash01(605 + i * 19) * .35),
				sz: (ring === 0 ? 1 : ring === 1 ? 1.5 : 2.1) * (.82 + hash01(606 + i * 23) * .45),
				spin: (ring === 0 ? .95 : ring === 1 ? .58 : .34) * (.88 + hash01(607 + i * 29) * .25)
			});
		}
		const LEVI_COUNT = qTier === 0 ? 14 : 26;
		const leviGeo = trackGeo(new THREE.OctahedronGeometry(.13, 0));
		leviGeo.scale(1.15, .78, .85);
		const leviMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			uniforms: {
				uOpacity: { value: 1 },
				uCharge: { value: 0 }
			},
			vertexShader: `
      varying vec3 vNormView;
      varying vec3 vViewPos;
      void main() {
        vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormView = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
			fragmentShader: `
      varying vec3 vNormView;
      varying vec3 vViewPos;
      uniform float uOpacity;
      uniform float uCharge;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormView), normalize(vViewPos))), 1.65);
        vec3 base = vec3(0.045, 0.012, 0.022);
        vec3 rimCol = mix(vec3(0.95, 0.10, 0.02), vec3(1.0, 0.65, 0.18), uCharge * 0.65) * (1.2 + uCharge * 0.6);
        gl_FragColor = vec4(mix(base, rimCol, smoothstep(0.30, 0.78, rim)), uOpacity);
      }
    `
		}));
		const leviDebris = new THREE.InstancedMesh(leviGeo, leviMat, LEVI_COUNT);
		leviDebris.frustumCulled = false;
		group.add(leviDebris);
		const leviData = [];
		for (let i = 0; i < LEVI_COUNT; i++) leviData.push({
			ang: hash01(310 + i * 11) * Math.PI * 2,
			rad: .55 + hash01(311 + i * 13) * 2.55,
			maxLift: .45 + hash01(312 + i * 17) * 1.45,
			scale: .55 + hash01(313 + i * 19) * 1.15,
			rotSpd: hashSigned(314 + i * 23) * 4.5,
			blastSpd: 3.5 + hash01(315 + i * 29) * 4.8
		});
		const skyRiftGroup = new THREE.Group();
		skyRiftGroup.position.set(SKY_ORIGIN.x, SKY_ORIGIN.y + .15, SKY_ORIGIN.z);
		const eyeWallGeo = trackGeo(new THREE.CylinderGeometry(5.8, 1.15, 2.45, qTier === 0 ? 24 : 36, 4, true));
		const eyeWallMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uIntensity: { value: 0 },
				uPop: { value: 0 },
				uCharge: { value: 0 }
			},
			vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        float ang = uv.x * 6.283185;
        float gust = sin(ang * 5.0 - uTime * 3.8 + uv.y * 6.0) * 0.42 + cos(ang * 9.0 + uTime * 2.5) * 0.22;
        vec3 p = position;
        p.xz *= (1.0 + gust * 0.08 * uv.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uPop;
      uniform float uCharge;
      ${GLSL_NOISE}
      void main() {
        float swirlX = vUv.x * 6.0 - uTime * (1.2 + uCharge * 1.1) + vUv.y * 2.4;
        float n1 = fbm(vec2(swirlX, vUv.y * 3.8 + uTime * 1.6));
        float n2 = fbm(vec2(swirlX * 2.1, vUv.y * 6.5 - uTime * 2.8));
        float verticalMask = smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.18, 1.0, vUv.y));
        float cloudCut = smoothstep(0.18, 0.72, n1);
        float brimstoneVein = smoothstep(0.68, 0.90, n2) * (1.0 - smoothstep(0.05, 0.85, vUv.y)) * (0.55 + uCharge * 0.45 + uPop * 0.85);
        float throatFire = (1.0 - smoothstep(0.02, 0.32, vUv.y)) * (0.45 + uCharge * 0.45 + uPop * 0.65);

        vec3 voidCloud = vec3(0.020, 0.015, 0.032);
        vec3 crimsonAsh = vec3(0.55, 0.06, 0.03);
        vec3 emberGlow = vec3(1.0, 0.28, 0.05) * (1.25 + uPop * 0.55);
        vec3 goldSpark = vec3(1.0, 0.80, 0.34) * 1.6;

        vec3 col = mix(voidCloud, crimsonAsh, cloudCut * 0.65);
        col = mix(col, emberGlow, clamp(throatFire * 0.85 + brimstoneVein * 0.9, 0.0, 1.0));
        col = mix(col, goldSpark, pow(brimstoneVein, 2.4) * 0.75);
        float alpha = clamp(verticalMask * (0.45 + 0.55 * cloudCut) + brimstoneVein * 0.35, 0.0, 0.94) * uIntensity;
        gl_FragColor = vec4(col, alpha);
      }
    `
		}));
		const eyeWallMesh = new THREE.Mesh(eyeWallGeo, eyeWallMat);
		eyeWallMesh.position.y = 1.25;
		eyeWallMesh.renderOrder = 3;
		skyRiftGroup.add(eyeWallMesh);
		const galeWindMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uIntensity: { value: 0 },
				uPop: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uPop;
      ${GLSL_NOISE}
      void main() {
        float n = fbm(vec2(vUv.x * 2.5, vUv.y * 8.0 - uTime * 7.5));
        float edge = abs(vUv.x - 0.5) * 2.0;
        float ribbon = (1.0 - smoothstep(0.18, 1.0, edge)) * smoothstep(0.0, 0.14, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
        float windStreak = smoothstep(0.26, 0.76, n);
        float rimGlow = smoothstep(0.55, 0.92, edge) * windStreak;
        vec3 darkWind = vec3(0.055, 0.042, 0.072);
        vec3 rustWind = vec3(0.85, 0.16, 0.04) * (1.15 + uPop * 0.55);
        vec3 amberEdge = vec3(1.0, 0.62, 0.18) * (1.45 + uPop * 0.5);
        vec3 col = mix(darkWind, rustWind, clamp(windStreak * 0.72, 0.0, 1.0));
        col = mix(col, amberEdge, clamp(rimGlow * 0.85, 0.0, 1.0));
        gl_FragColor = vec4(col, ribbon * (0.35 + 0.65 * windStreak) * uIntensity);
      }
    `
		}));
		const galeGeos = [];
		const GALE_COUNT = qTier === 0 ? 6 : 10;
		for (let g = 0; g < GALE_COUNT; g++) {
			const segs = qTier === 0 ? 22 : 28;
			const pts = [], wids = [];
			const tier = g % 3;
			const rStart = 7.4 - tier * 1.5 + hashSigned(501 + g * 13) * .9;
			const rEnd = 1.15 + tier * .55;
			const ang0 = g / GALE_COUNT * Math.PI * 2;
			const sweep = Math.PI * (1.35 + hash01(502 + g * 17) * .85);
			const yStart = 2 - tier * .55 + hashSigned(503 + g * 19) * .4;
			const yEnd = -.2 + tier * .28;
			for (let i = 0; i <= segs; i++) {
				const f = i / segs;
				const r = THREE.MathUtils.lerp(rStart, rEnd, easeOutCubic(f));
				const a = ang0 + f * sweep;
				const y = THREE.MathUtils.lerp(yStart, yEnd, f) + Math.sin(f * Math.PI * 2 + g) * .28;
				pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
				wids.push((.55 + tier * .18) * Math.sin(f * Math.PI) + .06);
			}
			galeGeos.push(buildFlatSlashRibbonRaw(pts, wids));
		}
		const galeRibbonsMesh = new THREE.Mesh(mergeIndexedGeometries(galeGeos), galeWindMat);
		galeRibbonsMesh.renderOrder = 4;
		skyRiftGroup.add(galeRibbonsMesh);
		group.add(skyRiftGroup);
		const COLUMN_VARIANT_SPINES = [
			[
				[
					3.4,
					11.04,
					-.82
				],
				[
					2.65,
					9.72,
					-.58
				],
				[
					1.85,
					8.35,
					-.24
				],
				[
					.65,
					7,
					.22
				],
				[
					-.68,
					5.88,
					.42
				],
				[
					.28,
					4.75,
					.26
				],
				[
					1.32,
					3.75,
					-.1
				],
				[
					.72,
					2.72,
					.12
				],
				[
					.38,
					1.68,
					.08
				],
				[
					.16,
					.76,
					.03
				],
				[
					0,
					.04,
					0
				]
			],
			[
				[
					3.4,
					11.04,
					-.82
				],
				[
					2.95,
					9.64,
					-.3
				],
				[
					1.55,
					8.24,
					.22
				],
				[
					1.25,
					6.88,
					-.32
				],
				[
					-.18,
					5.64,
					-.14
				],
				[
					-1.02,
					4.48,
					.34
				],
				[
					.32,
					3.48,
					.38
				],
				[
					.96,
					2.48,
					-.16
				],
				[
					-.24,
					1.56,
					.06
				],
				[
					.12,
					.72,
					-.03
				],
				[
					0,
					.04,
					0
				]
			],
			[
				[
					3.4,
					11.04,
					-.82
				],
				[
					2.42,
					9.7,
					-.6
				],
				[
					1.18,
					8.32,
					-.08
				],
				[
					-.82,
					6.96,
					.35
				],
				[
					-.1,
					5.72,
					-.26
				],
				[
					1.38,
					4.56,
					-.36
				],
				[
					.48,
					3.52,
					.28
				],
				[
					-.58,
					2.52,
					.24
				],
				[
					.52,
					1.6,
					-.1
				],
				[
					.15,
					.76,
					.04
				],
				[
					0,
					.04,
					0
				]
			],
			[
				[
					3.4,
					11.04,
					-.82
				],
				[
					2.25,
					9.68,
					.06
				],
				[
					2.65,
					8.28,
					-.48
				],
				[
					.88,
					6.92,
					-.18
				],
				[
					.16,
					5.68,
					.48
				],
				[
					-.74,
					4.52,
					.16
				],
				[
					.58,
					3.44,
					-.32
				],
				[
					1.18,
					2.44,
					.14
				],
				[
					.24,
					1.48,
					.16
				],
				[
					-.12,
					.68,
					-.05
				],
				[
					0,
					.04,
					0
				]
			],
			[
				[
					3.4,
					11.04,
					-.82
				],
				[
					2.9,
					9.6,
					-.44
				],
				[
					1.6,
					8.2,
					-.36
				],
				[
					.14,
					6.84,
					.32
				],
				[
					1.02,
					5.6,
					.42
				],
				[
					-.56,
					4.44,
					-.18
				],
				[
					-.86,
					3.36,
					.2
				],
				[
					.64,
					2.36,
					.32
				],
				[
					.72,
					1.48,
					-.12
				],
				[
					.09,
					.68,
					.03
				],
				[
					0,
					.04,
					0
				]
			],
			[
				[
					3.4,
					11.04,
					-.82
				],
				[
					2.56,
					9.68,
					-.26
				],
				[
					1.36,
					8.32,
					.32
				],
				[
					-.42,
					6.92,
					-.2
				],
				[
					-.96,
					5.76,
					.26
				],
				[
					.5,
					4.6,
					.36
				],
				[
					1.16,
					3.56,
					-.26
				],
				[
					.12,
					2.56,
					-.28
				],
				[
					-.36,
					1.6,
					.12
				],
				[
					.2,
					.72,
					.06
				],
				[
					0,
					.04,
					0
				]
			]
		];
		const VARIANT_RADII = [
			[
				.52,
				.78,
				.72,
				.6,
				.5,
				.44,
				.38,
				.32,
				.25,
				.16,
				.09
			],
			[
				.48,
				.72,
				.64,
				.68,
				.46,
				.52,
				.34,
				.36,
				.22,
				.15,
				.09
			],
			[
				.54,
				.78,
				.66,
				.58,
				.44,
				.52,
				.36,
				.31,
				.26,
				.17,
				.09
			],
			[
				.48,
				.74,
				.72,
				.56,
				.58,
				.43,
				.44,
				.29,
				.22,
				.15,
				.09
			],
			[
				.5,
				.8,
				.62,
				.58,
				.5,
				.4,
				.46,
				.32,
				.24,
				.16,
				.09
			],
			[
				.5,
				.75,
				.68,
				.6,
				.48,
				.54,
				.36,
				.31,
				.25,
				.16,
				.09
			]
		];
		const darkColumnMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: true,
			side: THREE.FrontSide,
			uniforms: {
				uTime: { value: 0 },
				uReveal: { value: 1 },
				uErode: { value: 0 },
				uOpacity: { value: 1 },
				uRimBoost: { value: 1 },
				uBeatSalt: { value: 0 }
			},
			vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      uniform float uTime;
      uniform float uBeatSalt;
      void main() {
        vUv = uv;
        float crackle = sin(uv.y * 34.0 - uTime * 38.0 + uBeatSalt) * cos(uv.x * 12.566 + uBeatSalt * 1.7);
        vec3 displaced = position + normal * (crackle * 0.036 * (1.0 - uv.y * 0.42));
        vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
        vViewPos = -mvPos.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
			fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      uniform float uTime;
      uniform float uReveal;
      uniform float uErode;
      uniform float uOpacity;
      uniform float uRimBoost;
      uniform float uBeatSalt;
      ${GLSL_NOISE}
      void main() {
        if (vUv.y > uReveal) discard;
        vec3 V = normalize(vViewPos);
        vec3 N = normalize(vNormalView);
        float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);

        float n = fbm(vec2(vUv.x * 5.2 + uBeatSalt * 0.37, vUv.y * 10.0 - uTime * 5.4));
        float nDeep = fbm(vec2(vUv.x * 3.8 + V.x * 0.4, vUv.y * 7.5 - uTime * 3.2));
        float topTatter = smoothstep(0.0, 0.15, vUv.y) * 0.42 + 0.58;
        float erodeMask = n * topTatter - uErode * 0.96;
        if (erodeMask < 0.08) discard;

        float rim = pow(1.0 - ndv, 2.45);
        float sharpRim = smoothstep(0.36, 0.66, rim + (n - 0.5) * 0.20);
        float hotRim = smoothstep(0.76, 0.95, rim + (n - 0.5) * 0.14);

        float erodeActive = smoothstep(0.02, 0.12, uErode);
        float erodeCrimson = (1.0 - smoothstep(0.08, 0.155, erodeMask)) * erodeActive;
        float erodeHotTip = (1.0 - smoothstep(0.08, 0.105, erodeMask)) * erodeActive;

        float innerVein = smoothstep(0.72, 0.90, n) * (1.0 - sharpRim) * 0.32;
        vec3 voidDepth = mix(vec3(0.018, 0.002, 0.006), vec3(0.085, 0.012, 0.115), smoothstep(0.45, 0.85, nDeep) * 0.65);
        vec3 coreCol = voidDepth + vec3(0.50, 0.018, 0.022) * innerVein;
        vec3 rimCol = vec3(1.0, 0.09, 0.02) * (1.50 * uRimBoost);
        vec3 hotCol = vec3(1.0, 0.80, 0.28) * (1.72 * uRimBoost);

        vec3 col = mix(coreCol, rimCol, clamp(sharpRim + erodeCrimson * 1.15, 0.0, 1.0));
        col = mix(col, hotCol, clamp(hotRim * 0.72 + erodeHotTip * 0.85, 0.0, 1.0));
        float tipHeat = smoothstep(0.80, 1.0, vUv.y);
        col = mix(col, vec3(1.0, 0.68, 0.18) * 1.48, tipHeat * 0.65);

        float throatFade = smoothstep(0.0, 0.07, vUv.y);
        gl_FragColor = vec4(col, uOpacity * throatFade);
      }
    `
		}));
		const helicalMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uOpacity: { value: 1 },
				uErode: { value: 0 },
				uSegStart: { value: .1 },
				uSegLen: { value: .5 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uErode;
      uniform float uSegStart;
      uniform float uSegLen;
      ${GLSL_NOISE}
      void main() {
        float d = fract(vUv.y - uSegStart);
        float segMask = smoothstep(0.0, 0.07, d) * (1.0 - smoothstep(uSegLen - 0.09, uSegLen, d));
        if (segMask < 0.02) discard;
        float n = fbm(vec2(vUv.x * 2.5, vUv.y * 11.0 - uTime * 7.5));
        float edge = abs(vUv.x - 0.5) * 2.0;
        float cut = n - uErode * 0.98;
        if (cut < 0.14) discard;
        float rim = smoothstep(0.45, 0.88, edge);
        float burn = (1.0 - smoothstep(0.14, 0.22, cut)) * smoothstep(0.02, 0.15, uErode);
        vec3 col = mix(vec3(0.03, 0.003, 0.008), vec3(1.0, 0.11, 0.02) * 1.55, clamp(rim + burn, 0.0, 1.0));
        col += vec3(1.0, 0.72, 0.22) * burn * 0.75;
        gl_FragColor = vec4(col, (1.0 - smoothstep(0.75, 1.0, edge)) * segMask * uOpacity);
      }
    `
		}));
		const COLUMN_VARIANT_COUNT = COLUMN_VARIANT_SPINES.length;
		const darkColumnMeshes = [];
		const variantSlashMeshes = [];
		const variantSamplePts = [];
		const HERO_BOLT_SEGS = 16;
		for (let v = 0; v < COLUMN_VARIANT_COUNT; v++) {
			const sub = subdivideSharpSpine(COLUMN_VARIANT_SPINES[v].map((c) => new THREE.Vector3(c[0], c[1], c[2])), VARIANT_RADII[v], qTier === 0 ? 2 : 3, 1200 + v * 97);
			const geo = buildOutwardTubeGeometry(sub.pts, sub.rads, qTier === 0 ? 10 : 12, 2.4 + v * .5, .26);
			const mesh = new THREE.Mesh(geo, darkColumnMat);
			mesh.renderOrder = 2;
			mesh.visible = false;
			group.add(mesh);
			darkColumnMeshes.push(mesh);
			const sampled = [];
			for (let i = 0; i <= HERO_BOLT_SEGS; i++) {
				const f = i / HERO_BOLT_SEGS * (sub.pts.length - 1);
				const i0 = Math.floor(f), i1 = Math.min(sub.pts.length - 1, i0 + 1);
				sampled.push(new THREE.Vector3().lerpVectors(sub.pts[i0], sub.pts[i1], f - i0));
			}
			variantSamplePts.push(sampled);
			const ribPts = [], ribWids = [];
			for (let i = 0; i < sub.pts.length; i++) {
				const f = i / (sub.pts.length - 1);
				const bp = sub.pts[i];
				const ang = f * Math.PI * 3.8 + v * 1.4;
				const orbitR = sub.rads[i] * 1.18 + .08;
				ribPts.push(new THREE.Vector3(bp.x + Math.cos(ang) * orbitR, bp.y, bp.z + Math.sin(ang) * orbitR));
				ribWids.push(.11 * Math.sin(f * Math.PI) + .025);
			}
			const rMesh = new THREE.Mesh(trackGeo(buildFlatSlashRibbonRaw(ribPts, ribWids)), helicalMat);
			rMesh.renderOrder = 3;
			rMesh.visible = false;
			group.add(rMesh);
			variantSlashMeshes.push(rMesh);
		}
		const heroBoltMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uOpacity: { value: 1 },
				uReveal: { value: 1 },
				uBoost: { value: 1 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      uniform float uReveal;
      uniform float uBoost;
      void main() {
        if (vUv.y > uReveal) discard;
        float edge = abs(vUv.x - 0.5) * 2.0;
        float coldIgnition = (1.0 - smoothstep(0.0, 0.10, edge));
        float whiteCore = (1.0 - smoothstep(0.02, 0.25, edge));
        float orangeMid = (1.0 - smoothstep(0.12, 0.56, edge));
        float redAura = pow(clamp(1.0 - edge, 0.0, 1.0), 1.95);
        vec3 col = vec3(1.0, 0.08, 0.02) * redAura * 2.15;
        col = mix(col, vec3(1.0, 0.52, 0.05) * 1.75, orangeMid);
        col = mix(col, vec3(1.0, 0.96, 0.80) * 2.2, whiteCore);
        col = mix(col, vec3(0.92, 0.98, 1.0) * 2.5, coldIgnition * 0.75);
        gl_FragColor = vec4(col * uBoost, clamp(redAura * 1.15, 0.0, 1.0) * uOpacity);
      }
    `
		}));
		const HERO_BOLT_COUNT = qTier === 0 ? 3 : 4;
		const heroBoltWidths = [
			.36,
			.23,
			.165,
			.13
		];
		const heroBoltPool = createBatchedBoltPool(HERO_BOLT_COUNT, HERO_BOLT_SEGS, heroBoltMat, 4);
		const forkMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: { uOpacity: { value: 1 } },
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      void main() {
        float edge = abs(vUv.x - 0.5) * 2.0;
        float core = (1.0 - smoothstep(0.02, 0.24, edge));
        float mid = (1.0 - smoothstep(0.14, 0.58, edge));
        float aura = pow(clamp(1.0 - edge, 0.0, 1.0), 1.9);
        float ends = smoothstep(0.0, 0.04, vUv.y) * (1.0 - smoothstep(0.96, 1.0, vUv.y));
        vec3 col = vec3(1.0, 0.09, 0.02) * aura * 2.15;
        col = mix(col, vec3(1.0, 0.50, 0.06) * 1.75, mid);
        col = mix(col, vec3(0.96, 0.98, 1.0) * 2.2, core);
        gl_FragColor = vec4(col, clamp(aura * 1.15, 0.0, 1.0) * ends * uOpacity);
      }
    `
		}));
		const FORK_COUNT = qTier === 0 ? 6 : 10;
		const SUB_STRIKE_SPECS = [{
			start: 1.57,
			end: 3.61,
			top: new THREE.Vector3(1.25, 10.85, -2.05),
			ground: new THREE.Vector3(-3.15, .04, -.95),
			seed: 8101
		}, {
			start: 1.63,
			end: 3.67,
			top: new THREE.Vector3(5.65, 10.82, .65),
			ground: new THREE.Vector3(3.15, .04, 1.25),
			seed: 8209
		}];
		const forkSubBoltPool = createBatchedBoltPool(FORK_COUNT + SUB_STRIKE_SPECS.length, 8, forkMat, 4);
		const subFlashMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: { uOpacity: { value: 0 } },
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float ang = atan(p.y, p.x);
        float star = 0.55 + 0.45 * pow(abs(sin(ang * 4.0)), 1.6);
        float g = pow(clamp(1.0 - r / (0.68 + 0.32 * star), 0.0, 1.0), 1.9);
        float c = pow(clamp(1.0 - r * 2.6, 0.0, 1.0), 2.2);
        vec3 col = mix(vec3(1.0, 0.10, 0.02), vec3(1.0, 0.58, 0.08), g) * 1.5;
        col = mix(col, vec3(1.0, 0.95, 0.72) * 1.85, c);
        gl_FragColor = vec4(col, g * uOpacity);
      }
    `
		}));
		const subFlashInst = new THREE.InstancedMesh(buildCutoutDiscGeometry(2.3, 14), subFlashMat, SUB_STRIKE_SPECS.length);
		subFlashInst.frustumCulled = false;
		subFlashInst.renderOrder = 3;
		group.add(subFlashInst);
		const curlWaveGeo = trackGeo(new THREE.CylinderGeometry(1.42, .82, .52, qTier === 0 ? 24 : 36, 2, true));
		const curlWaveMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uProgress: { value: 0 },
				uOpacity: { value: 0 }
			},
			vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        float ang = uv.x * 6.283185;
        float teeth = (abs(sin(ang * 7.0 + 0.5)) * 0.34 + abs(cos(ang * 11.0 - 0.9)) * 0.22) * uv.y;
        vec3 p = position;
        p.xz *= (1.0 + teeth);
        p.y += teeth * 0.45;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uProgress;
      uniform float uOpacity;
      ${GLSL_NOISE}
      void main() {
        float n = fbm(vec2(vUv.x * 9.0, vUv.y * 3.5 - uTime * 6.0));
        float cut = n * (1.0 - vUv.y * 0.35) - uProgress * 0.72;
        if (cut < 0.08) discard;
        float topRim = smoothstep(0.62, 0.96, vUv.y + (n - 0.5) * 0.22);
        float erodeCrimson = (1.0 - smoothstep(0.08, 0.14, cut));
        float hotEdge = (1.0 - smoothstep(0.08, 0.098, cut));
        vec3 col = mix(vec3(0.022, 0.002, 0.008), vec3(1.0, 0.09, 0.02) * 1.55, clamp(topRim + erodeCrimson * 1.15, 0.0, 1.0));
        col += vec3(1.0, 0.72, 0.20) * hotEdge * 0.85;
        gl_FragColor = vec4(col, smoothstep(0.0, 0.22, vUv.y) * uOpacity);
      }
    `
		}));
		const curlWaveMesh = new THREE.Mesh(curlWaveGeo, curlWaveMat);
		curlWaveMesh.position.y = .2;
		curlWaveMesh.renderOrder = 3;
		group.add(curlWaveMesh);
		const CRATER_COUNT = qTier === 0 ? 10 : 14;
		const craterGeo = trackGeo(new THREE.ConeGeometry(.28, .56, 4, 1));
		craterGeo.scale(1.35, 1, .42);
		const craterMat = trackMat(new THREE.ShaderMaterial({
			transparent: false,
			uniforms: { uHeat: { value: 1 } },
			vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormView;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormView = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
			fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormView;
      varying vec3 vViewPos;
      uniform float uHeat;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormView), normalize(vViewPos))), 2.1);
        float baseFissure = (1.0 - smoothstep(0.0, 0.24, vUv.y)) * uHeat;
        vec3 rock = vec3(0.038, 0.012, 0.018);
        vec3 lava = vec3(1.0, 0.14, 0.02) * 1.4;
        gl_FragColor = vec4(mix(rock, lava, clamp(baseFissure * 0.85 + smoothstep(0.68, 0.94, rim) * uHeat * 0.55, 0.0, 1.0)), 1.0);
      }
    `
		}));
		const craterCrust = new THREE.InstancedMesh(craterGeo, craterMat, CRATER_COUNT);
		craterCrust.frustumCulled = false;
		craterCrust.renderOrder = 2;
		group.add(craterCrust);
		const craterData = [];
		const clusterCenters = [
			.45,
			2.05,
			3.65,
			5.15
		];
		for (let i = 0; i < CRATER_COUNT; i++) {
			const cBase = clusterCenters[i % clusterCenters.length];
			craterData.push({
				ang: cBase + hashSigned(710 + i * 7) * .42,
				r: 1.55 + hash01(711 + i * 11) * .95,
				sx: .65 + hash01(712 + i * 13) * 1.05,
				sy: .45 + hash01(713 + i * 17) * .95,
				sz: .55 + hash01(714 + i * 19) * .75,
				tiltOut: .52 + hash01(715 + i * 23) * .48
			});
		}
		const CRYSTAL_COUNT = qTier === 0 ? 22 : 42;
		const crystalGeo = trackGeo(new THREE.OctahedronGeometry(.11, 0));
		crystalGeo.scale(.42, 2.1, .42);
		const crystalMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			uniforms: { uOpacity: { value: 0 } },
			vertexShader: `
      varying vec3 vNormView;
      varying vec3 vViewPos;
      void main() {
        vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormView = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
			fragmentShader: `
      varying vec3 vNormView;
      varying vec3 vViewPos;
      uniform float uOpacity;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormView), normalize(vViewPos))), 1.5);
        gl_FragColor = vec4(mix(vec3(0.04, 0.005, 0.015), vec3(1.0, 0.35, 0.06) * 1.65, smoothstep(0.28, 0.75, rim)), uOpacity);
      }
    `
		}));
		const shatterCrystals = new THREE.InstancedMesh(crystalGeo, crystalMat, CRYSTAL_COUNT);
		shatterCrystals.frustumCulled = false;
		group.add(shatterCrystals);
		const crystalData = [];
		for (let i = 0; i < CRYSTAL_COUNT; i++) {
			const f = hash01(910 + i * 7);
			const ang = hash01(911 + i * 11) * Math.PI * 2;
			const spd = 1.1 + hash01(912 + i * 13) * 2.6;
			crystalData.push({
				spineIdx: Math.min(HERO_BOLT_SEGS, Math.floor(f * HERO_BOLT_SEGS)),
				vx: Math.cos(ang) * spd,
				vy: .4 + hash01(913 + i * 17) * 1.4,
				vz: Math.sin(ang) * spd,
				rx: hashSigned(914 + i * 19) * 8,
				ry: hashSigned(915 + i * 23) * 8,
				scale: .55 + hash01(916 + i * 29) * .95,
				delay: f * .22
			});
		}
		function buildSpikeBladeGeometry() {
			const positions = new Float32Array([
				0,
				0,
				.085,
				-.44,
				.13,
				-.015,
				.44,
				.13,
				-.015,
				0,
				.44,
				.062,
				0,
				1,
				0,
				0,
				0,
				-.085,
				0,
				.44,
				-.062
			]);
			const uvs = new Float32Array([
				0,
				0,
				1,
				.14,
				1,
				.14,
				0,
				.46,
				1,
				1,
				0,
				0,
				0,
				.46
			]);
			const indices = [
				0,
				2,
				3,
				0,
				3,
				1,
				3,
				2,
				4,
				1,
				3,
				4,
				5,
				6,
				2,
				5,
				1,
				6,
				6,
				4,
				2,
				1,
				4,
				6
			];
			const geo = new THREE.BufferGeometry();
			geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
			geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
			geo.setIndex(indices);
			geo.computeVertexNormals();
			return trackGeo(geo);
		}
		const sharedBladeGeo = buildSpikeBladeGeometry();
		const spikeMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: true,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uErode: { value: 0 },
				uOpacity: { value: 1 },
				uRimBoost: { value: 1 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uErode;
      uniform float uOpacity;
      uniform float uRimBoost;
      ${GLSL_NOISE}
      void main() {
        float n = fbm(vec2(vUv.x * 4.2, vUv.y * 5.8 - uTime * 2.8));
        float cut = (1.0 - vUv.y * 0.56) + (n - 0.5) * 0.58 - uErode * 1.12;
        if (cut < 0.0) discard;
        float rim = smoothstep(0.66, 0.92, vUv.x + (n - 0.5) * 0.14);
        float innerCrack = smoothstep(0.76, 0.90, n) * (1.0 - vUv.x) * (1.0 - smoothstep(0.12, 0.85, vUv.y)) * 0.65;
        float tipGlow = smoothstep(0.76, 0.99, vUv.y);
        float baseHeat = (1.0 - smoothstep(0.0, 0.28, vUv.y));
        float erodeActive = smoothstep(0.02, 0.12, uErode);
        float erodeCrimson = (1.0 - smoothstep(0.0, 0.18, cut)) * erodeActive;
        float erodeHot = (1.0 - smoothstep(0.0, 0.06, cut)) * erodeActive;
        vec3 col = mix(vec3(0.022, 0.002, 0.008), vec3(1.0, 0.10, 0.02) * (1.58 * uRimBoost), clamp(rim + innerCrack + tipGlow * 0.8 + erodeCrimson * 1.15, 0.0, 1.0));
        col = mix(col, vec3(1.0, 0.52, 0.05) * 1.55, baseHeat * 0.82);
        col = mix(col, vec3(1.0, 0.94, 0.58) * 1.75, clamp(baseHeat * (1.0 - vUv.x) * 0.55 + erodeHot * 0.85, 0.0, 1.0));
        gl_FragColor = vec4(col, uOpacity);
      }
    `
		}));
		const SPIKE_COUNT = qTier === 0 ? 14 : 20;
		const spikeMesh = new THREE.InstancedMesh(sharedBladeGeo, spikeMat, SPIKE_COUNT);
		spikeMesh.frustumCulled = false;
		spikeMesh.renderOrder = 3;
		group.add(spikeMesh);
		const HERO_SPIKE_PRESETS = [
			[
				{
					angle: 2.75,
					tilt: 1.06,
					len: 4.55,
					width: .56,
					rOff: .34
				},
				{
					angle: .32,
					tilt: 1.24,
					len: 4.35,
					width: .54,
					rOff: .36
				},
				{
					angle: 5.55,
					tilt: 1.12,
					len: 3.9,
					width: .5,
					rOff: .34
				}
			],
			[
				{
					angle: 2.15,
					tilt: 1.22,
					len: 4.65,
					width: .58,
					rOff: .34
				},
				{
					angle: 5.95,
					tilt: .98,
					len: 4.4,
					width: .52,
					rOff: .36
				},
				{
					angle: 3.85,
					tilt: 1.16,
					len: 3.75,
					width: .48,
					rOff: .34
				}
			],
			[
				{
					angle: .85,
					tilt: 1.18,
					len: 4.7,
					width: .58,
					rOff: .36
				},
				{
					angle: 3.25,
					tilt: 1.02,
					len: 4.25,
					width: .54,
					rOff: .34
				},
				{
					angle: 4.85,
					tilt: 1.25,
					len: 3.95,
					width: .5,
					rOff: .34
				}
			],
			[
				{
					angle: 1.55,
					tilt: 1.14,
					len: 4.5,
					width: .56,
					rOff: .35
				},
				{
					angle: 4.3,
					tilt: 1.2,
					len: 4.3,
					width: .52,
					rOff: .36
				},
				{
					angle: 6.1,
					tilt: .94,
					len: 3.85,
					width: .48,
					rOff: .34
				}
			]
		];
		const groundCrimsonPoolMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uIntensity: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      ${GLSL_NOISE}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float n = fbm(p * 3.0 + uTime * 2.0);
        float outerRed = pow(clamp(1.0 - r, 0.0, 1.0), 1.65) * (0.85 + 0.15 * n);
        float innerOrange = pow(clamp(1.0 - r * 2.05, 0.0, 1.0), 1.8);
        float whiteHot = pow(clamp(1.0 - r * 4.2, 0.0, 1.0), 2.2);
        vec3 col = vec3(0.95, 0.07, 0.02) * outerRed * 0.95 + vec3(1.0, 0.44, 0.04) * innerOrange * 1.18 + vec3(1.0, 0.94, 0.65) * whiteHot * 1.12;
        gl_FragColor = vec4(col, clamp(outerRed * 0.85 + innerOrange * 0.5, 0.0, 1.0) * uIntensity);
      }
    `
		}));
		const groundCrimsonPool = new THREE.Mesh(buildCutoutDiscGeometry(8.2, 20), groundCrimsonPoolMat);
		groundCrimsonPool.position.y = .022;
		groundCrimsonPool.renderOrder = 2;
		group.add(groundCrimsonPool);
		const coreBlazeMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			depthTest: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uTime: { value: 0 },
				uIntensity: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      ${GLSL_NOISE}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float ang = atan(p.y, p.x);
        float star = 0.60 + 0.40 * pow(abs(sin(ang * 5.0 + uTime * 7.0)), 1.6) * (0.7 + 0.3 * cos(ang * 9.0 - uTime * 10.0));
        float n = fbm(p * 3.8 + uTime * 3.2);
        float hot = pow(clamp(1.0 - r / (0.72 + 0.28 * star), 0.0, 1.0), 1.85);
        float whiteCenter = pow(clamp(1.0 - r * 2.35, 0.0, 1.0), 2.2);
        vec3 col = mix(vec3(1.0, 0.16, 0.02), vec3(1.0, 0.56, 0.06), hot);
        col = mix(col, vec3(0.98, 0.98, 0.88), whiteCenter);
        gl_FragColor = vec4(col * 1.2, hot * (0.78 + 0.22 * n) * uIntensity);
      }
    `
		}));
		const blazeGeos = [];
		{
			const g0 = new THREE.PlaneGeometry(3.2, 3.2);
			g0.rotateX(-Math.PI / 2);
			g0.translate(0, .08, 0);
			blazeGeos.push(g0);
			for (let b = 0; b < 3; b++) {
				const gf = new THREE.PlaneGeometry(2.2, 1.85);
				gf.rotateY(b * (Math.PI / 3) + .2);
				gf.translate(0, .58, 0);
				blazeGeos.push(gf);
			}
		}
		const coreBlazeMesh = new THREE.Mesh(mergeIndexedGeometries(blazeGeos), coreBlazeMat);
		coreBlazeMesh.renderOrder = 6;
		group.add(coreBlazeMesh);
		const INNER_CROWN_COUNT = qTier === 0 ? 8 : 12;
		const innerCrownMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: { uOpacity: { value: 0 } },
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      void main() {
        float core = (1.0 - vUv.x) * (1.0 - vUv.y * 0.65);
        float tip = (1.0 - smoothstep(0.15, 1.0, vUv.y));
        vec3 col = mix(vec3(1.0, 0.26, 0.03), vec3(1.0, 0.96, 0.68), clamp(core * 1.28, 0.0, 1.0));
        gl_FragColor = vec4(col * 1.32, tip * uOpacity);
      }
    `
		}));
		const innerCrownMesh = new THREE.InstancedMesh(sharedBladeGeo, innerCrownMat, INNER_CROWN_COUNT);
		innerCrownMesh.frustumCulled = false;
		innerCrownMesh.renderOrder = 5;
		group.add(innerCrownMesh);
		const scorchMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms: {
				uTime: { value: 0 },
				uHeat: { value: 0 },
				uOpacity: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uHeat;
      uniform float uOpacity;
      ${GLSL_NOISE}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float ang = atan(p.y, p.x);
        float streak = 0.68 + 0.32 * sin(ang * 11.0 + 0.5) * cos(ang * 7.0 - 1.2);
        float n = fbm(p * 4.8);
        float shadow = (1.0 - smoothstep(0.10, max(0.1001, 0.95 * streak), r + (n - 0.5) * 0.25));
        float crackWave = abs(sin(ang * 8.0 + n * 4.5));
        float crack = (1.0 - smoothstep(0.0, 0.11, crackWave)) * (1.0 - smoothstep(0.08, 0.88, r));
        vec3 col = mix(vec3(0.02, 0.005, 0.008), vec3(1.0, 0.22, 0.04) * 1.45, crack * uHeat);
        col += vec3(1.0, 0.78, 0.25) * crack * (1.0 - smoothstep(0.0, 0.45, r)) * uHeat * 0.9;
        gl_FragColor = vec4(col, clamp(shadow * 0.80 + crack * uHeat, 0.0, 0.92) * uOpacity);
      }
    `
		}));
		const scorchMesh = new THREE.Mesh(buildCutoutDiscGeometry(8, 20), scorchMat);
		scorchMesh.position.y = .008;
		scorchMesh.renderOrder = 1;
		group.add(scorchMesh);
		const shockRingMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: {
				uProgress: { value: 0 },
				uOpacity: { value: 0 }
			},
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uProgress;
      uniform float uOpacity;
      ${GLSL_NOISE}
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float ang = atan(p.y, p.x);
        float teeth = abs(sin(ang * 7.0 + 0.4)) * 0.08 + abs(cos(ang * 13.0 - 0.8)) * 0.05;
        float n = vnoise(vec2(ang * 6.0, r * 7.0));
        float rad = mix(0.24, 0.94, uProgress) + teeth * (1.0 - uProgress * 0.3);
        float thickness = mix(0.055, 0.018, uProgress);
        float dist = abs(r - rad);
        float sharpRing = (1.0 - smoothstep(thickness * 0.15, thickness, dist));
        float breakup = smoothstep(uProgress * 0.72, uProgress * 0.72 + 0.08, n);
        vec3 col = mix(vec3(1.0, 0.06, 0.02) * 1.5, vec3(1.0, 0.45, 0.05) * 1.55, (1.0 - smoothstep(0.0, thickness * 0.55, dist)));
        gl_FragColor = vec4(col, sharpRing * breakup * uOpacity);
      }
    `
		}));
		const shockRingMesh = new THREE.Mesh(buildCutoutDiscGeometry(8.4, 24), shockRingMat);
		shockRingMesh.position.y = .025;
		group.add(shockRingMesh);
		const crawlBoltMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: { uOpacity: { value: 1 } },
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      void main() {
        float edge = abs(vUv.x - 0.5) * 2.0;
        float core = (1.0 - smoothstep(0.02, 0.22, edge));
        float midOrange = (1.0 - smoothstep(0.12, 0.55, edge));
        float outerRed = pow(clamp(1.0 - edge, 0.0, 1.0), 1.9);
        float taper = (1.0 - smoothstep(0.65, 1.0, vUv.y));
        vec3 col = vec3(1.0, 0.08, 0.02) * outerRed * 2.15;
        col = mix(col, vec3(1.0, 0.48, 0.05) * 1.75, midOrange);
        col = mix(col, vec3(0.96, 0.98, 1.0) * 2.25, core);
        gl_FragColor = vec4(col, clamp(outerRed * 1.15, 0.0, 1.0) * taper * uOpacity);
      }
    `
		}));
		const CRAWL_COUNT = qTier === 0 ? 10 : 16;
		const AFTER_COUNT = qTier === 0 ? 8 : 12;
		const groundBoltPool = createBatchedBoltPool(Math.max(CRAWL_COUNT, AFTER_COUNT), 8, crawlBoltMat, 5);
		const afterWindows = [
			{
				start: 4.05,
				end: 4.105,
				seed: 3011
			},
			{
				start: 4.13,
				end: 4.195,
				seed: 3019
			},
			{
				start: 4.26,
				end: 4.335,
				seed: 3027
			},
			{
				start: 4.36,
				end: 4.415,
				seed: 3035
			},
			{
				start: 4.49,
				end: 4.575,
				seed: 3043
			},
			{
				start: 4.68,
				end: 4.775,
				seed: 3051
			}
		];
		const SHARD_COUNT = qTier === 0 ? 20 : 38;
		const shardGeo = trackGeo(new THREE.OctahedronGeometry(.14, 0));
		shardGeo.scale(.52, 1.9, .44);
		const shardMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			uniforms: { uOpacity: { value: 1 } },
			vertexShader: `
      varying vec3 vNormView;
      varying vec3 vViewPos;
      void main() {
        vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormView = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
			fragmentShader: `
      varying vec3 vNormView;
      varying vec3 vViewPos;
      uniform float uOpacity;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormView), normalize(vViewPos))), 1.7);
        gl_FragColor = vec4(mix(vec3(0.04, 0.006, 0.012), vec3(1.0, 0.22, 0.04) * 1.45, smoothstep(0.32, 0.76, rim)), uOpacity);
      }
    `
		}));
		const voidShards = new THREE.InstancedMesh(shardGeo, shardMat, SHARD_COUNT);
		voidShards.frustumCulled = false;
		group.add(voidShards);
		const shardData = [];
		for (let i = 0; i < SHARD_COUNT; i++) {
			const ang = hash01(882 + i * 7) * Math.PI * 2;
			const spd = 2 + hash01(883 + i * 11) * 3.8;
			shardData.push({
				vx: Math.cos(ang) * spd,
				vy: 3.8 + hash01(884 + i * 13) * 5.2,
				vz: Math.sin(ang) * spd,
				rx: hashSigned(885 + i * 17) * 9,
				ry: hashSigned(886 + i * 19) * 9,
				rz: hashSigned(887 + i * 23) * 9,
				scale: .45 + hash01(888 + i * 29) * .92,
				delay: hash01(889 + i * 31) * .25,
				life: .65 + hash01(890 + i * 37) * .65
			});
		}
		const SPARK_COUNT = qTier === 0 ? 28 : 52;
		const sparkGeo = trackGeo(new THREE.PlaneGeometry(.055, .78));
		const sparkMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending,
			uniforms: { uOpacity: { value: 1 } },
			vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`,
			fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;
      void main() {
        float x = (1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5)));
        float head = smoothstep(0.0, 0.85, vUv.y);
        float tail = (1.0 - smoothstep(0.75, 1.0, vUv.y));
        gl_FragColor = vec4(mix(vec3(1.0, 0.18, 0.03), vec3(1.0, 0.94, 0.62), head * x) * 1.48, x * head * tail * uOpacity);
      }
    `
		}));
		const sparkStreaks = new THREE.InstancedMesh(sparkGeo, sparkMat, SPARK_COUNT);
		sparkStreaks.frustumCulled = false;
		group.add(sparkStreaks);
		const sparkData = [];
		for (let i = 0; i < SPARK_COUNT; i++) {
			const ang = hash01(551 + i * 7) * Math.PI * 2;
			const elev = .25 + hash01(552 + i * 11) * 1.05;
			const spd = 4.2 + hash01(553 + i * 13) * 6.5;
			sparkData.push({
				vx: Math.cos(ang) * Math.cos(elev) * spd,
				vy: Math.sin(elev) * spd + 1.2,
				vz: Math.sin(ang) * Math.cos(elev) * spd,
				delay: hash01(554 + i * 17) * .16,
				life: .38 + hash01(555 + i * 19) * .45,
				len: .55 + hash01(556 + i * 23) * .95
			});
		}
		const EMBER_COUNT = qTier === 0 ? 36 : 72;
		const emberPos = new Float32Array(EMBER_COUNT * 3);
		const emberSize = new Float32Array(EMBER_COUNT);
		const emberKind = new Float32Array(EMBER_COUNT);
		const emberSeed = [];
		for (let i = 0; i < EMBER_COUNT; i++) {
			const ang = hash01(990 + i * 7) * Math.PI * 2;
			const r = .2 + hash01(991 + i * 11) * 2.9;
			emberSeed.push({
				x0: Math.cos(ang) * r,
				z0: Math.sin(ang) * r,
				vy: .8 + hash01(992 + i * 13) * 1.65,
				swirl: hashSigned(993 + i * 17) * 1.9,
				delay: hash01(994 + i * 19) * .35,
				life: .95 + hash01(995 + i * 23) * .85
			});
			emberSize[i] = 11 + hash01(996 + i * 29) * 19;
			emberKind[i] = hash01(997 + i * 31) > .32 ? 1 : 0;
		}
		const emberGeo = trackGeo(new THREE.BufferGeometry());
		emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
		emberGeo.setAttribute("aSize", new THREE.BufferAttribute(emberSize, 1));
		emberGeo.setAttribute("aKind", new THREE.BufferAttribute(emberKind, 1));
		const emberMat = trackMat(new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms: {
				uOpacity: { value: 0 },
				uPixelRatio: { value: opts.pixelRatio }
			},
			vertexShader: `
      attribute float aSize;
      attribute float aKind;
      varying float vKind;
      uniform float uPixelRatio;
      void main() {
        vKind = aKind;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * uPixelRatio * (5.6 / max(-mvPos.z, 1.0)), 2.0, 48.0);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
			fragmentShader: `
      varying float vKind;
      uniform float uOpacity;
      void main() {
        vec2 c = gl_PointCoord * 2.0 - 1.0;
        float r = length(c);
        if (r > 1.0) discard;
        float soft = pow(1.0 - r, 2.0);
        vec3 col = vKind > 0.5 ? mix(vec3(1.0, 0.16, 0.03), vec3(1.0, 0.88, 0.45), pow(1.0 - r, 2.8)) : vec3(0.05, 0.01, 0.018);
        gl_FragColor = vec4(col, soft * uOpacity * (vKind > 0.5 ? 0.95 : 0.58));
      }
    `
		}));
		const risingEmbers = new THREE.Points(emberGeo, emberMat);
		risingEmbers.frustumCulled = false;
		group.add(risingEmbers);
		function update(rawTime) {
			const t = Math.max(0, Math.min(DURATION, rawTime));
			const isActive = t > .001 && t < DURATION - .001;
			group.visible = isActive;
			if (!isActive) return;
			const beat = sampleBeat(t);
			const bIdx = beat.idx;
			const bPop = beat.pop;
			const thick = cfg.boltThickness;
			const dens = cfg.density;
			const densCap = clamp01(dens);
			const densBoost = Math.max(0, dens - 1) * .48;
			const cScale = cfg.cloudScale;
			const fSpd = cfg.flickerSpeed;
			const teleIn = smoothstep(0, .32, t);
			const teleRamp = smoothstep(0, STRIKE_T, t);
			const teleFade = 1 - smoothstep(STRIKE_T, STRIKE_T + .25, t);
			const glowInt = t < STRIKE_T ? teleIn * (.48 + .56 * teleRamp + .12 * Math.sin(t * 24)) : teleFade * .65;
			telegraphGlowMat.uniforms.uTime.value = t;
			telegraphGlowMat.uniforms.uIntensity.value = glowInt;
			telegraphGlowMat.uniforms.uRamp.value = t < STRIKE_T ? teleRamp : 1;
			telegraphGlowMesh.visible = glowInt > .01;
			const tStrike = t - STRIKE_T;
			const strikeActive = tStrike >= 0 && t <= 4.01;
			const descent = clamp01(tStrike / .055);
			const erode = smoothstep(3.35, 3.99, t);
			const teleActive = t >= .12 && t < STRIKE_T;
			const leaderActive = t >= .72 && t < STRIKE_T;
			const skyBoltsActive = t >= .4 && t <= 3.9;
			skyTeleBoltPool.mesh.visible = teleActive || leaderActive || skyBoltsActive;
			if (skyTeleBoltPool.mesh.visible) {
				const subTick = Math.floor(t * 17 * fSpd);
				const blink = t * 17 * fSpd - subTick < .76 ? 1 : .22;
				microBoltMat.uniforms.uOpacity.value = (teleActive ? smoothstep(.12, .38, t) : 1 - smoothstep(3.5, 3.9, t)) * blink;
				let slot = 0;
				const teleMax = Math.max(1, Math.round(TELE_ARC_COUNT * densCap));
				for (let k = 0; k < TELE_ARC_COUNT; k++, slot++) {
					if (!teleActive || k >= teleMax) {
						skyTeleBoltPool.hideSlot(slot);
						continue;
					}
					const s = 7e3 + subTick * 131 + k * 29;
					if (hash01(s) >= Math.min(.99, .45 + .5 * teleRamp + densBoost)) {
						skyTeleBoltPool.hideSlot(slot);
						continue;
					}
					const a0 = hash01(s + 1) * Math.PI * 2;
					const r0 = .2 + hash01(s + 2) * 2.25 * (1 - teleRamp * .25);
					const a1 = a0 + hashSigned(s + 3) * 1.35;
					const r1 = .1 + hash01(s + 4) * 1.65;
					const hPeak = .12 + hash01(s + 5) * (.36 + teleRamp * .6);
					_pA.set(Math.cos(a0) * r0, .04, Math.sin(a0) * r0);
					_pB.set(Math.cos(a1) * r1, .04 + hPeak * .4, Math.sin(a1) * r1);
					fillMidpointBolt(skyTeleBoltPool.scratchPts, _pA, _pB, .36, hPeak * .55, s + 11);
					skyTeleBoltPool.writeSlot(slot, skyTeleBoltPool.scratchPts, (.046 + teleRamp * .026) * thick, true);
				}
				const lRamp = smoothstep(.72, STRIKE_T - .02, t);
				const lTick = Math.floor(t * 15 * fSpd);
				const leadMax = Math.max(1, Math.round(LEADER_COUNT * densCap));
				for (let k = 0; k < LEADER_COUNT; k++, slot++) {
					if (!leaderActive || k >= leadMax) {
						skyTeleBoltPool.hideSlot(slot);
						continue;
					}
					const ls = 7400 + lTick * 97 + k * 31;
					if (hash01(ls) >= Math.min(.99, .48 + lRamp * .5 + densBoost)) {
						skyTeleBoltPool.hideSlot(slot);
						continue;
					}
					const ang = hash01(ls + 1) * Math.PI * 2;
					const r0 = .18 + hash01(ls + 2) * 1.25;
					const climbH = Math.min(SKY_ORIGIN.y - .25, (2.2 + lRamp * 7.8) * (.78 + hash01(ls + 3) * .32));
					_pA.set(Math.cos(ang) * r0, .05, Math.sin(ang) * r0);
					_pB.set(THREE.MathUtils.lerp(_pA.x, SKY_ORIGIN.x, lRamp * .72) + hashSigned(ls + 4) * .65, climbH, THREE.MathUtils.lerp(_pA.z, SKY_ORIGIN.z, lRamp * .72) + hashSigned(ls + 5) * .65);
					fillMidpointBolt(skyTeleBoltPool.scratchPts, _pA, _pB, .45, 0, ls + 11);
					skyTeleBoltPool.writeSlot(slot, skyTeleBoltPool.scratchPts, (.05 + lRamp * .036) * thick, true);
				}
				const skyTick = Math.floor(t * 14 * fSpd);
				const skyCharge = t < STRIKE_T ? smoothstep(.4, STRIKE_T, t) : 1 - erode * .65;
				const skyMax = Math.max(1, Math.round(SKY_BOLT_COUNT * densCap));
				for (let k = 0; k < SKY_BOLT_COUNT; k++, slot++) {
					if (!skyBoltsActive || k >= skyMax) {
						skyTeleBoltPool.hideSlot(slot);
						continue;
					}
					const ks = 8600 + skyTick * 83 + k * 29;
					if (hash01(ks) >= Math.min(.99, .52 + skyCharge * .45 + densBoost)) {
						skyTeleBoltPool.hideSlot(slot);
						continue;
					}
					const a0 = k / SKY_BOLT_COUNT * Math.PI * 2 + hashSigned(ks + 1) * .48;
					const rInner = (1.1 + hash01(ks + 2) * 1.2) * cScale;
					const rOuter = (3.4 + hash01(ks + 3) * 4.4 * (.55 + .45 * skyCharge)) * cScale;
					_pA.set(SKY_ORIGIN.x + Math.cos(a0) * rInner, SKY_ORIGIN.y + .15, SKY_ORIGIN.z + Math.sin(a0) * rInner);
					_pB.set(SKY_ORIGIN.x + Math.cos(a0 + hashSigned(ks + 4) * .42) * rOuter, SKY_ORIGIN.y + .55 + hashSigned(ks + 5) * .85, SKY_ORIGIN.z + Math.sin(a0 + hashSigned(ks + 4) * .42) * rOuter);
					fillMidpointBolt(skyTeleBoltPool.scratchPts, _pA, _pB, 1.05, -.35, ks + 11);
					skyTeleBoltPool.writeSlot(slot, skyTeleBoltPool.scratchPts, (.095 + skyCharge * .085) * (.9 + bPop * .38) * thick, true);
				}
				skyTeleBoltPool.commit();
			}
			const wispAlpha = t < STRIKE_T + .02 ? smoothstep(.08, .35, t) * (1 - smoothstep(STRIKE_T - .06, STRIKE_T + .02, t)) * .85 : 0;
			wispMat.uniforms.uTime.value = t;
			wispMat.uniforms.uOpacity.value = wispAlpha;
			convergeWisps.visible = wispAlpha > .01;
			if (convergeWisps.visible) {
				for (let i = 0; i < WISP_COUNT; i++) {
					const wd = wispData[i];
					const p = (t * wd.speed + wd.phase) % 1;
					const rad = THREE.MathUtils.lerp(wd.rStart, .32, easeOutCubic(p));
					const ang = wd.angle + p * 1.15;
					_pos.set(Math.cos(ang) * rad, .05 + (1 - p) * .18, Math.sin(ang) * rad);
					_euler.set(0, -ang + Math.PI * .5 + .52, 0);
					_quat.setFromEuler(_euler);
					const s = Math.sin(p * Math.PI) * smoothstep(.32, .72, rad);
					_scl.set(.85 * s, 1, wd.len * (.45 + .75 * s));
					_mat4.compose(_pos, _quat, _scl);
					convergeWisps.setMatrixAt(i, _mat4);
				}
				convergeWisps.instanceMatrix.needsUpdate = true;
			}
			const leviVisible = t >= .18 && t <= 2.35;
			leviDebris.visible = leviVisible;
			if (leviVisible) {
				leviMat.uniforms.uCharge.value = t < STRIKE_T ? teleRamp : 1;
				leviMat.uniforms.uOpacity.value = smoothstep(.18, .45, t) * (1 - smoothstep(1.95, 2.35, t));
				for (let i = 0; i < LEVI_COUNT; i++) {
					const ld = leviData[i];
					if (t < STRIKE_T) {
						const lift = easeOutCubic(teleRamp) * ld.maxLift * 1.25;
						const jitter = teleRamp * .055;
						const rCur = ld.rad * (1 - teleRamp * .18);
						_pos.set(Math.cos(ld.ang + teleRamp * .65) * rCur + Math.sin(t * 52 + i * 3.1) * jitter, .06 + lift, Math.sin(ld.ang + teleRamp * .65) * rCur + Math.cos(t * 48 + i * 2.7) * jitter);
						_euler.set(t * ld.rotSpd, t * ld.rotSpd * .7, i);
						_scl.setScalar(ld.scale * smoothstep(.18, .48, t));
					} else {
						const bt = t - STRIKE_T;
						const rCur = ld.rad * .82 + ld.blastSpd * bt;
						_pos.set(Math.cos(ld.ang + .65) * rCur, Math.max(.05, .06 + ld.maxLift * 1.25 + 1.8 * bt - 5.2 * bt * bt), Math.sin(ld.ang + .65) * rCur);
						_euler.set(t * ld.rotSpd * 2.2, t * ld.rotSpd * 1.6, i);
						_scl.setScalar(ld.scale * (1 - smoothstep(.45, .85, bt)));
					}
					_quat.setFromEuler(_euler);
					_mat4.compose(_pos, _quat, _scl);
					leviDebris.setMatrixAt(i, _mat4);
				}
				leviDebris.instanceMatrix.needsUpdate = true;
			}
			const activeVariant = bIdx <= 1 ? 0 : (bIdx * 5 + 1) % COLUMN_VARIANT_COUNT;
			const activeSpinePts = variantSamplePts[activeVariant];
			const bhOpen = easeOutCubic(clamp01(t / 1.2));
			const bhClose = 1 - smoothstep(3.9, 4.73, t);
			const cloudOp = smoothstep(0, .4, t) * bhClose;
			stormClouds.visible = cloudOp > .01;
			if (stormClouds.visible) {
				cloudMat.uniforms.uTime.value = t;
				cloudMat.uniforms.uOpacity.value = cloudOp * .96;
				cloudMat.uniforms.uCharge.value = t < STRIKE_T ? teleRamp : 1;
				cloudMat.uniforms.uFlash.value = strikeActive ? .45 + bPop * .95 : teleRamp * .35;
				const radExpand = .55 + .45 * bhOpen;
				const sPop = bhOpen * (.45 + .55 * bhClose);
				for (let i = 0; i < CLOUD_COUNT; i++) {
					const cd = cloudData[i];
					const a = cd.ang + t * cd.spin;
					const r = cd.rad * radExpand * cScale;
					const cPuffXZ = .45 + .55 * cScale;
					const cPuffY = .55 + .45 * cScale;
					_pos.set(SKY_ORIGIN.x + Math.cos(a) * r, SKY_ORIGIN.y + .75 + cd.yOff + Math.sin(t * 2.4 + i * 1.3) * .25, SKY_ORIGIN.z + Math.sin(a) * r);
					_euler.set(.08 * Math.sin(t + i), -a, .08 * Math.cos(t + i));
					_quat.setFromEuler(_euler);
					_scl.set(cd.sx * sPop * cPuffXZ, cd.sy * sPop * cPuffY, cd.sz * sPop * cPuffXZ);
					_mat4.compose(_pos, _quat, _scl);
					stormClouds.setMatrixAt(i, _mat4);
				}
				stormClouds.instanceMatrix.needsUpdate = true;
			}
			const galeInt = smoothstep(.08, .65, t) * (1 - smoothstep(3.7, 4.45, t));
			skyRiftGroup.visible = galeInt > .01;
			if (skyRiftGroup.visible) {
				eyeWallMat.uniforms.uTime.value = t;
				eyeWallMat.uniforms.uIntensity.value = galeInt;
				eyeWallMat.uniforms.uCharge.value = t < STRIKE_T ? teleRamp : 1;
				eyeWallMat.uniforms.uPop.value = strikeActive ? bPop : teleRamp * .45;
				galeWindMat.uniforms.uTime.value = t;
				galeWindMat.uniforms.uIntensity.value = galeInt * (.78 + (strikeActive ? bPop * .35 : teleRamp * .25));
				galeWindMat.uniforms.uPop.value = strikeActive ? bPop : teleRamp * .45;
				const riftS = (.45 + .58 * bhOpen) * (.5 + .5 * bhClose);
				skyRiftGroup.scale.set(riftS * cScale, riftS, riftS * cScale);
				galeRibbonsMesh.rotation.y = t * (2.2 + (t < STRIKE_T ? teleRamp * 1.6 : 1.8));
				eyeWallMesh.rotation.y = t * .85;
			}
			if (strikeActive && erode < .99) {
				darkColumnMat.uniforms.uTime.value = t;
				darkColumnMat.uniforms.uReveal.value = easeOutExpo(descent);
				darkColumnMat.uniforms.uErode.value = erode;
				darkColumnMat.uniforms.uOpacity.value = 1 - smoothstep(3.89, 4.01, t);
				darkColumnMat.uniforms.uRimBoost.value = .94 + bPop * .42;
				darkColumnMat.uniforms.uBeatSalt.value = bIdx * 3.7;
				const wScale = (.94 + bPop * .2) * (1 - erode * .14) * thick;
				helicalMat.uniforms.uTime.value = t;
				helicalMat.uniforms.uErode.value = erode;
				helicalMat.uniforms.uOpacity.value = smoothstep(1.5, 1.58, t) * (1 - smoothstep(3.73, 3.97, t));
				helicalMat.uniforms.uSegStart.value = hash01(7700 + bIdx * 23);
				helicalMat.uniforms.uSegLen.value = .44 + hash01(7701 + bIdx * 29) * .26;
				for (let v = 0; v < COLUMN_VARIANT_COUNT; v++) {
					const isOn = v === activeVariant;
					darkColumnMeshes[v].visible = isOn;
					variantSlashMeshes[v].visible = isOn && erode < .96;
					if (isOn) darkColumnMeshes[v].scale.set(wScale, 1, wScale);
				}
			} else for (let v = 0; v < COLUMN_VARIANT_COUNT; v++) {
				darkColumnMeshes[v].visible = false;
				variantSlashMeshes[v].visible = false;
			}
			const baseBoltAlpha = strikeActive ? 1 - smoothstep(3.63, 3.99, t) : 0;
			heroBoltPool.mesh.visible = baseBoltAlpha > .01;
			if (heroBoltPool.mesh.visible) {
				heroBoltMat.uniforms.uOpacity.value = baseBoltAlpha;
				heroBoltMat.uniforms.uReveal.value = easeOutExpo(descent);
				heroBoltMat.uniforms.uBoost.value = .88 + bPop * .44;
				const fastTick = Math.floor(t * 22 * fSpd);
				const pts = heroBoltPool.scratchPts;
				for (let k = 0; k < HERO_BOLT_COUNT; k++) {
					const dutyRoll = hash01(2025 + bIdx * 43 + k * 19);
					if (k > 0 && dutyRoll <= Math.max(.02, .26 + erode * .28 - densBoost)) {
						heroBoltPool.hideSlot(k);
						continue;
					}
					const sBase = 3100 + bIdx * 197 + fastTick * (k > 0 ? 31 : 0) + k * 53;
					const spread = k === 0 ? .42 : .5 + k * .12;
					const sideShift = k === 1 ? -.38 : k === 2 ? .36 : hashSigned(sBase + 3) * .26;
					for (let i = 0; i <= HERO_BOLT_SEGS; i++) {
						const bp = activeSpinePts[i];
						if (i === 0 || i === HERO_BOLT_SEGS) {
							pts[i].copy(bp);
							continue;
						}
						const f = i / HERO_BOLT_SEGS;
						const env = Math.sin(f * Math.PI);
						pts[i].set(bp.x + hashSigned(sBase + i * 17) * spread * env + sideShift * env * (1 - f * .4), Math.max(.03, bp.y + hashSigned(sBase + i * 11) * .2 * env), bp.z + hashSigned(sBase + i * 23) * spread * env + (k === 0 ? .28 * env : 0));
					}
					heroBoltPool.writeSlot(k, pts, heroBoltWidths[k] * (.84 + bPop * .44) * (1 - erode * .48) * thick, false);
				}
				heroBoltPool.commit();
			}
			const forkBaseAlpha = strikeActive && t >= 1.54 ? 1 - smoothstep(3.55, 3.93, t) : 0;
			forkSubBoltPool.mesh.visible = forkBaseAlpha > .01;
			let anySubActive = false;
			if (forkSubBoltPool.mesh.visible) {
				forkMat.uniforms.uOpacity.value = forkBaseAlpha * (.78 + bPop * .32);
				const pts = forkSubBoltPool.scratchPts;
				let slot = 0;
				const forkMax = Math.max(1, Math.round(FORK_COUNT * densCap));
				for (let k = 0; k < FORK_COUNT; k++, slot++) {
					const fs = 6400 + bIdx * 89 + k * 37;
					if (k >= forkMax || hash01(fs) <= Math.max(.02, .3 - densBoost)) {
						forkSubBoltPool.hideSlot(slot);
						continue;
					}
					const origin = activeSpinePts[3 + Math.floor(hash01(fs + 1) * 10)];
					const sideAng = hash01(fs + 2) * Math.PI * 2;
					const reach = 1.45 + hash01(fs + 3) * 2.1;
					const dropY = -(.75 + hash01(fs + 4) * 1.85);
					_pA.copy(origin);
					_pB.set(origin.x + Math.cos(sideAng) * reach, Math.max(.15, origin.y + dropY), origin.z + Math.sin(sideAng) * reach);
					fillMidpointBolt(pts, _pA, _pB, .56, 0, fs + 11);
					forkSubBoltPool.writeSlot(slot, pts, (.095 + hash01(fs + 5) * .068) * (.88 + bPop * .35) * thick, true);
				}
				for (let s = 0; s < SUB_STRIKE_SPECS.length; s++, slot++) {
					const sp = SUB_STRIKE_SPECS[s];
					if (!(t >= sp.start && t <= sp.end && hash01(sp.seed + bIdx * 31) > .3)) {
						forkSubBoltPool.hideSlot(slot);
						_mat4.makeScale(0, 0, 0);
						subFlashInst.setMatrixAt(s, _mat4);
						continue;
					}
					anySubActive = true;
					fillMidpointBolt(pts, sp.top, sp.ground, .72, 0, sp.seed + bIdx * 67);
					forkSubBoltPool.writeSlot(slot, pts, .155 * (.86 + bPop * .35) * thick, false);
					_pos.set(sp.ground.x, .03, sp.ground.z);
					_quat.identity();
					_scl.setScalar(.95 + bPop * .45);
					_mat4.compose(_pos, _quat, _scl);
					subFlashInst.setMatrixAt(s, _mat4);
				}
				forkSubBoltPool.commit();
				subFlashInst.visible = anySubActive;
				if (anySubActive) {
					subFlashMat.uniforms.uOpacity.value = forkBaseAlpha * (.82 + bPop * .3);
					subFlashInst.instanceMatrix.needsUpdate = true;
				}
			} else subFlashInst.visible = false;
			const curlT = (t - 1.53) / .32;
			curlWaveMesh.visible = curlT > 0 && curlT < 1;
			if (curlWaveMesh.visible) {
				const p = easeOutCubic(curlT);
				curlWaveMat.uniforms.uTime.value = t;
				curlWaveMat.uniforms.uProgress.value = p;
				curlWaveMat.uniforms.uOpacity.value = (1 - curlT) * .95;
				curlWaveMesh.scale.set(.75 + p * 2.15, .75 + (1 - p) * .75, .75 + p * 2.15);
				curlWaveMesh.rotation.y = t * 2.2;
			}
			const craterSink = t >= 1.52 ? easeOutExpo(clamp01((t - 1.52) / .12)) * (1 - smoothstep(4.4, 4.83, t)) : 0;
			craterCrust.visible = craterSink > .02;
			if (craterCrust.visible) {
				craterMat.uniforms.uHeat.value = clamp01(1 - smoothstep(3.3, 4.6, t) + (strikeActive ? bPop * .2 : 0));
				for (let i = 0; i < CRATER_COUNT; i++) {
					const cd = craterData[i];
					_pos.set(Math.cos(cd.ang) * cd.r, .04 * craterSink, Math.sin(cd.ang) * cd.r);
					_dir.set(Math.cos(cd.ang) * Math.sin(cd.tiltOut), Math.cos(cd.tiltOut), Math.sin(cd.ang) * Math.sin(cd.tiltOut)).normalize();
					_quat.setFromUnitVectors(_up, _dir);
					_scl.set(cd.sx * (.4 + .6 * craterSink), cd.sy * craterSink, cd.sz * (.4 + .6 * craterSink));
					_mat4.compose(_pos, _quat, _scl);
					craterCrust.setMatrixAt(i, _mat4);
				}
				craterCrust.instanceMatrix.needsUpdate = true;
			}
			const crysBaseT = t - 3.41;
			shatterCrystals.visible = crysBaseT > 0 && crysBaseT < .88;
			if (shatterCrystals.visible) {
				crystalMat.uniforms.uOpacity.value = smoothstep(0, .12, crysBaseT) * (1 - smoothstep(.52, .86, crysBaseT));
				for (let i = 0; i < CRYSTAL_COUNT; i++) {
					const cd = crystalData[i];
					const st = crysBaseT - cd.delay;
					if (st <= 0) {
						_mat4.makeScale(0, 0, 0);
						shatterCrystals.setMatrixAt(i, _mat4);
						continue;
					}
					const origin = activeSpinePts[cd.spineIdx];
					const drift = Math.max(0, st - .1);
					_pos.set(origin.x + cd.vx * drift, Math.max(.08, origin.y + cd.vy * drift - 1.8 * drift * drift), origin.z + cd.vz * drift);
					_euler.set(cd.rx * st, cd.ry * st, i);
					_quat.setFromEuler(_euler);
					_scl.setScalar(cd.scale * (1 - smoothstep(.45, .8, st)));
					_mat4.compose(_pos, _quat, _scl);
					shatterCrystals.setMatrixAt(i, _mat4);
				}
				shatterCrystals.instanceMatrix.needsUpdate = true;
			}
			const spikesVisible = t >= 1.52 && t <= 4.01;
			spikeMesh.visible = spikesVisible;
			if (spikesVisible) {
				const spikeErode = smoothstep(3.35, 3.99, t);
				spikeMat.uniforms.uTime.value = t;
				spikeMat.uniforms.uErode.value = spikeErode;
				spikeMat.uniforms.uOpacity.value = 1 - smoothstep(3.87, 4.01, t);
				spikeMat.uniforms.uRimBoost.value = .94 + bPop * .42;
				const heroPreset = HERO_SPIKE_PRESETS[bIdx <= 1 ? 0 : (bIdx * 3 + 1) % HERO_SPIKE_PRESETS.length];
				for (let i = 0; i < SPIKE_COUNT; i++) {
					const delay = i < 3 ? .005 + i * .005 : hash01(427 + i * 29) * .038;
					const localT = t - 1.52 - delay;
					if (localT <= 0) {
						_mat4.makeScale(0, 0, 0);
						spikeMesh.setMatrixAt(i, _mat4);
						continue;
					}
					const grow = easeOutExpo(clamp01(localT / .1));
					const shrink = 1 - spikeErode * .28;
					let ang, tilt, len, wid, rOff, snapScale;
					if (i < 3) {
						const hp = heroPreset[i], hs = 5100 + bIdx * 53 + i * 19;
						ang = hp.angle + (bIdx > 1 ? hashSigned(hs) * .22 : 0);
						tilt = hp.tilt + (bIdx > 1 ? hashSigned(hs + 1) * .08 : 0);
						len = hp.len * (bIdx > 1 ? .86 + hash01(hs + 2) * .28 : 1);
						wid = hp.width;
						rOff = hp.rOff;
						snapScale = .9 + bPop * .2;
					} else {
						const sSeed = 5200 + bIdx * 79 + i * 23;
						if (bIdx > 1 && hash01(sSeed) < .22) {
							_mat4.makeScale(0, 0, 0);
							spikeMesh.setMatrixAt(i, _mat4);
							continue;
						}
						const isMajor = i < 10;
						ang = bIdx <= 1 ? (i - 3) / (SPIKE_COUNT - 3) * Math.PI * 2 + hashSigned(421 + i * 7) * .22 : hash01(sSeed + 1) * Math.PI * 2;
						tilt = isMajor ? .76 + hash01(sSeed + 2) * .48 : .4 + hash01(sSeed + 2) * .8;
						len = isMajor ? 2.65 + hash01(sSeed + 3) * 1.45 : 1.35 + hash01(sSeed + 3) * 1.15;
						wid = isMajor ? .36 + hash01(sSeed + 4) * .2 : .24 + hash01(sSeed + 4) * .16;
						rOff = isMajor ? .34 : .3;
						snapScale = .86 + bPop * .26;
					}
					_pos.set(Math.cos(ang) * rOff, .02, Math.sin(ang) * rOff);
					_dir.set(Math.cos(ang) * Math.sin(tilt), Math.cos(tilt), Math.sin(ang) * Math.sin(tilt)).normalize();
					_quat.setFromUnitVectors(_up, _dir);
					_scl.set(wid * grow * shrink * thick, len * grow * snapScale * shrink, wid * grow * shrink * thick);
					_mat4.compose(_pos, _quat, _scl);
					spikeMesh.setMatrixAt(i, _mat4);
				}
				spikeMesh.instanceMatrix.needsUpdate = true;
			}
			const poolInt = t >= 1.51 && t <= 4.4 ? easeOutExpo(clamp01((t - 1.51) / .05)) * (1 - smoothstep(3.3, 4.4, t)) * (.9 + bPop * .24) : 0;
			groundCrimsonPool.visible = poolInt > .01;
			if (groundCrimsonPool.visible) {
				groundCrimsonPoolMat.uniforms.uTime.value = t;
				groundCrimsonPoolMat.uniforms.uIntensity.value = poolInt;
			}
			const impactFlash = t >= IMPACT_T ? 1 - smoothstep(IMPACT_T, IMPACT_T + .095, t) : 0;
			const coreInt = t >= IMPACT_T && t <= 3.93 ? Math.max(impactFlash * 1.65, easeOutExpo(clamp01((t - IMPACT_T) / .05)) * (.84 + bPop * .32)) * (1 - smoothstep(3.33, 3.93, t)) : 0;
			coreBlazeMesh.visible = coreInt > .01;
			if (coreBlazeMesh.visible) {
				coreBlazeMat.uniforms.uTime.value = t;
				coreBlazeMat.uniforms.uIntensity.value = coreInt;
				coreBlazeMesh.scale.setScalar(.88 + bPop * .26);
				coreBlazeMesh.rotation.y = bIdx * 1.15;
			}
			const crownInt = t >= 1.52 && t <= 3.83 ? easeOutExpo(clamp01((t - 1.52) / .08)) * (1 - smoothstep(3.29, 3.83, t)) : 0;
			innerCrownMesh.visible = crownInt > .01;
			if (innerCrownMesh.visible) {
				innerCrownMat.uniforms.uOpacity.value = crownInt * (.82 + bPop * .28);
				for (let i = 0; i < INNER_CROWN_COUNT; i++) {
					const cs = 6140 + bIdx * 47 + i * 17;
					const ang = i / INNER_CROWN_COUNT * Math.PI * 2 + hashSigned(cs) * .42;
					const tilt = .32 + hash01(cs + 1) * .72;
					const len = (.85 + hash01(cs + 2) * .92) * (.88 + bPop * .28);
					const wid = .24 + hash01(cs + 3) * .18;
					_pos.set(Math.cos(ang) * .08, .04, Math.sin(ang) * .08);
					_dir.set(Math.cos(ang) * Math.sin(tilt), Math.cos(tilt), Math.sin(ang) * Math.sin(tilt)).normalize();
					_quat.setFromUnitVectors(_up, _dir);
					_scl.set(wid * crownInt, len * crownInt, wid * crownInt);
					_mat4.compose(_pos, _quat, _scl);
					innerCrownMesh.setMatrixAt(i, _mat4);
				}
				innerCrownMesh.instanceMatrix.needsUpdate = true;
			}
			let activeWin = null, afterEnv = 0;
			for (let w = 0; w < afterWindows.length; w++) if (t >= afterWindows[w].start && t <= afterWindows[w].end) {
				activeWin = afterWindows[w];
				afterEnv = Math.sin((t - activeWin.start) / (activeWin.end - activeWin.start) * Math.PI);
				break;
			}
			const scorchOp = t >= 1.52 ? smoothstep(1.52, 1.58, t) * (1 - smoothstep(4.6, 4.85, t)) : 0;
			scorchMesh.visible = scorchOp > .01;
			if (scorchMesh.visible) {
				scorchMat.uniforms.uTime.value = t;
				scorchMat.uniforms.uOpacity.value = scorchOp;
				scorchMat.uniforms.uHeat.value = clamp01(1 - smoothstep(3.2, 4.6, t) + afterEnv * .48 + (strikeActive ? bPop * .18 : 0));
			}
			const shockT = (t - IMPACT_T) / .36;
			shockRingMesh.visible = shockT > 0 && shockT < 1;
			if (shockRingMesh.visible) {
				shockRingMat.uniforms.uProgress.value = easeOutCubic(shockT);
				shockRingMat.uniforms.uOpacity.value = (1 - shockT) * .95;
			}
			const crawlActive = t >= 1.53 && t <= 3.93;
			groundBoltPool.mesh.visible = crawlActive || !!activeWin;
			if (crawlActive) {
				const crawlReach = easeOutExpo(clamp01((t - 1.53) / .13)) * (1 - smoothstep(3.47, 3.93, t) * .42);
				crawlBoltMat.uniforms.uOpacity.value = (1 - smoothstep(3.61, 3.93, t)) * (.82 + bPop * .25);
				const crawlMax = Math.max(1, Math.round(CRAWL_COUNT * densCap));
				for (let k = 0; k < groundBoltPool.maxBolts; k++) {
					if (k >= crawlMax) {
						groundBoltPool.hideSlot(k);
						continue;
					}
					const cs = 4100 + bIdx * 83 + k * 29;
					if (hash01(cs) <= Math.max(.02, .22 - densBoost)) {
						groundBoltPool.hideSlot(k);
						continue;
					}
					const baseAng = k / CRAWL_COUNT * Math.PI * 2 + hashSigned(cs + 1) * .55;
					const maxR = (1.9 + hash01(cs + 2) * 1.95) * crawlReach;
					_pA.set(Math.cos(baseAng) * .22, .06, Math.sin(baseAng) * .22);
					_pB.set(Math.cos(baseAng + hashSigned(cs + 3) * .35) * maxR, .06, Math.sin(baseAng + hashSigned(cs + 3) * .35) * maxR);
					fillMidpointBolt(groundBoltPool.scratchPts, _pA, _pB, .58, .14, cs + 11);
					groundBoltPool.writeSlot(k, groundBoltPool.scratchPts, (.088 + hash01(cs + 4) * .038) * (1 - smoothstep(3.47, 3.93, t) * .45) * thick, true);
				}
				groundBoltPool.commit();
			} else if (activeWin) {
				crawlBoltMat.uniforms.uOpacity.value = afterEnv * .98;
				const countShow = Math.max(1, Math.min(AFTER_COUNT, Math.round((8 + Math.floor(hash01(activeWin.seed) * 4)) * dens)));
				for (let k = 0; k < groundBoltPool.maxBolts; k++) {
					if (k >= countShow) {
						groundBoltPool.hideSlot(k);
						continue;
					}
					const as = activeWin.seed + k * 41;
					const isLeaping = k < 4;
					const a0 = hash01(as + 1) * Math.PI * 2;
					const r0 = isLeaping ? .12 + hash01(as + 2) * .65 : .15 + hash01(as + 2) * 1.55;
					const a1 = a0 + hashSigned(as + 3) * 1.35;
					const r1 = isLeaping ? .25 + hash01(as + 4) * .95 : .35 + hash01(as + 4) * 1.9;
					const climb = isLeaping ? 1.05 + hash01(as + 5) * .95 : .18 + hash01(as + 5) * .28;
					_pA.set(Math.cos(a0) * r0, .05, Math.sin(a0) * r0);
					_pB.set(Math.cos(a1) * r1, .05 + (isLeaping ? climb * .75 : .06), Math.sin(a1) * r1);
					fillMidpointBolt(groundBoltPool.scratchPts, _pA, _pB, isLeaping ? .48 : .36, isLeaping ? .35 : .14, as + 11);
					groundBoltPool.writeSlot(k, groundBoltPool.scratchPts, (isLeaping ? .074 : .058) * thick, true);
				}
				groundBoltPool.commit();
			}
			const shardBaseT = t - 1.53;
			voidShards.visible = shardBaseT > 0 && shardBaseT < 1.38;
			if (voidShards.visible) {
				shardMat.uniforms.uOpacity.value = 1 - smoothstep(.88, 1.35, shardBaseT);
				const shardMax = Math.max(2, Math.round(SHARD_COUNT * densCap));
				for (let i = 0; i < SHARD_COUNT; i++) {
					const sd = shardData[i], st = shardBaseT - sd.delay, lt = st / sd.life;
					if (i >= shardMax || st <= 0 || lt >= 1) {
						_mat4.makeScale(0, 0, 0);
						voidShards.setMatrixAt(i, _mat4);
						continue;
					}
					_pos.set(sd.vx * st, Math.max(.05, sd.vy * st - 5.4 * st * st), sd.vz * st);
					_euler.set(sd.rx * st, sd.ry * st, sd.rz * st);
					_quat.setFromEuler(_euler);
					_scl.setScalar(sd.scale * (1 - lt * lt));
					_mat4.compose(_pos, _quat, _scl);
					voidShards.setMatrixAt(i, _mat4);
				}
				voidShards.instanceMatrix.needsUpdate = true;
			}
			const sparkBaseT = t - 1.52;
			sparkStreaks.visible = sparkBaseT > 0 && sparkBaseT < 1.02;
			if (sparkStreaks.visible) {
				sparkMat.uniforms.uOpacity.value = 1 - smoothstep(.62, .98, sparkBaseT);
				const sparkMax = Math.max(2, Math.round(SPARK_COUNT * densCap));
				for (let i = 0; i < SPARK_COUNT; i++) {
					const sp = sparkData[i], st = sparkBaseT - sp.delay;
					if (i >= sparkMax || st <= 0 || st >= sp.life) {
						_mat4.makeScale(0, 0, 0);
						sparkStreaks.setMatrixAt(i, _mat4);
						continue;
					}
					const f = st / sp.life, drag = 1 - .45 * f;
					_pos.set(sp.vx * st * drag, Math.max(.05, sp.vy * st * drag - 2.4 * st * st), sp.vz * st * drag);
					_dir.set(sp.vx * drag, sp.vy * drag - 4.8 * st, sp.vz * drag).normalize();
					_quat.setFromUnitVectors(_up, _dir);
					_scl.set(1 - f * .5, sp.len * (1.2 - f * .9), 1);
					_mat4.compose(_pos, _quat, _scl);
					sparkStreaks.setMatrixAt(i, _mat4);
				}
				sparkStreaks.instanceMatrix.needsUpdate = true;
			}
			const emberBaseT = t - 1.62;
			const emberOp = emberBaseT > 0 && t < 4.75 ? smoothstep(0, .25, emberBaseT) * (1 - smoothstep(3.95, 4.75, t)) : 0;
			risingEmbers.visible = emberOp > .01;
			if (risingEmbers.visible) {
				emberMat.uniforms.uOpacity.value = emberOp;
				const arr = emberGeo.attributes.position.array;
				for (let i = 0; i < EMBER_COUNT; i++) {
					const es = emberSeed[i], et = Math.max(0, emberBaseT - es.delay);
					const ang = et * es.swirl, ca = Math.cos(ang), sa = Math.sin(ang);
					arr[i * 3] = es.x0 * ca - es.z0 * sa;
					arr[i * 3 + 1] = .08 + es.vy * et;
					arr[i * 3 + 2] = es.x0 * sa + es.z0 * ca;
				}
				emberGeo.attributes.position.needsUpdate = true;
			}
		}
		function dispose() {
			for (let i = 0; i < disposables.length; i++) if (disposables[i] && disposables[i].dispose) disposables[i].dispose();
		}
		function setConfig(partial) {
			if (!partial) return;
			if (partial.theme && THEME_PRESETS[partial.theme]) {
				const tp = THEME_PRESETS[partial.theme];
				cfg.theme = partial.theme;
				if (partial.primaryColor === void 0) cfg.primaryColor = tp.primary;
				if (partial.secondaryColor === void 0) cfg.secondaryColor = tp.secondary;
				if (partial.coreColor === void 0) cfg.coreColor = tp.core;
				if (partial.cloudColor === void 0) cfg.cloudColor = tp.cloud;
			}
			if (partial.primaryColor !== void 0) cfg.primaryColor = partial.primaryColor;
			if (partial.secondaryColor !== void 0) cfg.secondaryColor = partial.secondaryColor;
			if (partial.coreColor !== void 0) cfg.coreColor = partial.coreColor;
			if (partial.cloudColor !== void 0) cfg.cloudColor = partial.cloudColor;
			if (partial.scale !== void 0) {
				cfg.scale = partial.scale;
				group.scale.setScalar(cfg.scale);
			}
			if (partial.boltThickness !== void 0) cfg.boltThickness = partial.boltThickness;
			if (partial.density !== void 0) cfg.density = partial.density;
			if (partial.cloudScale !== void 0) cfg.cloudScale = partial.cloudScale;
			if (partial.flickerSpeed !== void 0) cfg.flickerSpeed = partial.flickerSpeed;
			applyThemeUniforms();
		}
		return {
			group,
			setConfig,
			update,
			dispose
		};
	}
	function normalizeDarkLightningOptions(options = {}) {
		return {
			size: finiteRange(options.size, .25, 2, 1),
			speed: finiteRange(options.speed, .25, 2, 1)
		};
	}
	function createDarkLightningEffect(spec, options = {}) {
		let settings = normalizeDarkLightningOptions(options), elapsed = 0, disposed = false;
		const { duration, impactTime, fadeTime } = DARK_LIGHTNING;
		const lifecycle = {
			start: impactTime,
			end: duration - fadeTime
		};
		const effect = createDarkLightningVFX(three, {
			scale: settings.size,
			seed: spec.seed
		});
		const { group } = effect;
		function seek(seconds) {
			if (disposed || !Number.isFinite(seconds)) return;
			elapsed = Math.max(0, Math.min(duration, seconds));
			effect.update(elapsed);
		}
		async function prewarm(renderer, camera, scene = group.parent?.isScene ? group.parent : void 0) {
			if (disposed || !renderer?.isWebGLRenderer || !camera?.isCamera || renderer.getRenderTarget() !== null || renderer.xr.isPresenting || renderer.getContext().isContextLost()) return false;
			await renderer.compileAsync(group, camera, scene);
			return !disposed && !renderer.getContext().isContextLost();
		}
		seek(0);
		return {
			group,
			lifecycle,
			duration,
			prewarm,
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
				return this.finished ? "finished" : elapsed < impactTime ? "starting" : elapsed < fadeTime ? "active" : "ending";
			},
			seek,
			update(dt) {
				if (!this.finished && Number.isFinite(dt) && dt > 0) seek(elapsed + dt * settings.speed);
			},
			reset() {
				seek(0);
			},
			setOptions(partial = {}) {
				if (disposed) return;
				settings = normalizeDarkLightningOptions({
					...settings,
					...partial
				});
				effect.setConfig({ scale: settings.size });
			},
			dispose() {
				if (disposed) return;
				disposed = true;
				group.visible = false;
				group.removeFromParent();
				effect.dispose();
			}
		};
	}

//#endregion
exports.DARK_LIGHTNING = DARK_LIGHTNING;
exports.createDarkLightningEffect = createDarkLightningEffect;
exports.normalizeDarkLightningOptions = normalizeDarkLightningOptions;
return exports;
})({}, THREE);

export {__vfxModule};
