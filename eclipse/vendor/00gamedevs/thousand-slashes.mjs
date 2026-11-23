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
// 一瞬千斬 / Thousand Slashes — Three.js 0.187.0 / WebGL2.
// Add fx.group at the ground center (XZ, +Y up), call update(deltaSeconds), then render normally.
// A one-shot ends after duration seconds at speed 1; reset() replays and seek(seconds) samples the timeline.
// For camera-facing glow, call setCameraPosition(worldPosition) before drawing or use fx.render(renderer,scene,camera).
// detail sets blade thickness (0.25–4×); duration is 1–8 s; density adjusts secondary slashes and ground marks. No external assets, damage or collision.
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

//#region src/effects/thousand-slashes-runtime.js
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
	function clamp01(x) {
		return x < 0 ? 0 : x > 1 ? 1 : x;
	}
	function smoothstep(e0, e1, x) {
		const t = clamp01((x - e0) / (e1 - e0));
		return t * t * (3 - 2 * t);
	}
	function derivePaletteFromBase(hex) {
		const base = new three.Color(hex);
		const hsl = {
			h: 0,
			s: 0,
			l: 0
		};
		base.getHSL(hsl);
		const core = new three.Color().setHSL((hsl.h + .04) % 1, Math.min(1, hsl.s * .45), .93);
		const mid = new three.Color().setHSL(hsl.h, Math.min(1, Math.max(.75, hsl.s)), Math.min(.62, Math.max(.45, hsl.l)));
		const deep = new three.Color().setHSL((hsl.h - .04 + 1) % 1, Math.min(1, Math.max(.78, hsl.s)), .28);
		const ink = new three.Color().setHSL((hsl.h - .05 + 1) % 1, Math.min(.85, hsl.s * .7), .045);
		return {
			core: "#" + core.getHexString(),
			mid: "#" + mid.getHexString(),
			deep: "#" + deep.getHexString(),
			ink: "#" + ink.getHexString()
		};
	}
	function createCrescentArcGeometry(opts) {
		const radiusX = opts.radiusX || 4.8;
		const radiusZ = opts.radiusZ || 2.5;
		const widthMax = opts.width || 1.85;
		const arcSpan = opts.arcSpan || Math.PI * 1.08;
		const startAngle = opts.startAngle || -arcSpan * .5;
		const camber = opts.camber !== void 0 ? opts.camber : .3;
		const segU = opts.segU || 60;
		const segV = opts.segV || 10;
		const vertCount = (segU + 1) * (segV + 1);
		const positions = new Float32Array(vertCount * 3);
		const normals = new Float32Array(vertCount * 3);
		const uvs = new Float32Array(vertCount * 2);
		const bladeInsets = new Float32Array(vertCount * 2);
		const indices = [];
		let pIdx = 0, uvIdx = 0;
		for (let iu = 0; iu <= segU; iu++) {
			const u = iu / segU;
			const theta = startAngle + u * arcSpan;
			const cosT = Math.cos(theta);
			const sinT = Math.sin(theta);
			const tipLead = Math.pow(Math.sin(Math.min(1, u * 1.35) * Math.PI * .5), .48);
			const tipTail = Math.pow(clamp01(1 - Math.max(0, (u - .14) / .86)), .82);
			const localW = widthMax * tipLead * (.1 + .9 * tipTail);
			const helixY = (u - .5) * (opts.helix || .34);
			for (let iv = 0; iv <= segV; iv++) {
				const v = iv / segV;
				const rScale = 1 - v * (localW / Math.max(radiusX, radiusZ));
				const rx = radiusX * rScale;
				const rz = radiusZ * rScale;
				const yBowl = Math.sin(v * Math.PI) * camber * (.3 + .7 * tipLead) + helixY;
				positions[pIdx] = cosT * rx;
				positions[pIdx + 1] = yBowl;
				positions[pIdx + 2] = sinT * rz;
				normals[pIdx] = cosT * .16;
				normals[pIdx + 1] = .97;
				normals[pIdx + 2] = sinT * .16;
				pIdx += 3;
				uvs[uvIdx] = u;
				uvs[uvIdx + 1] = v;
				bladeInsets[uvIdx] = cosT * (rx - radiusX);
				bladeInsets[uvIdx + 1] = sinT * (rz - radiusZ);
				uvIdx += 2;
			}
		}
		for (let iu = 0; iu < segU; iu++) for (let iv = 0; iv < segV; iv++) {
			const a = iu * (segV + 1) + iv;
			const b = (iu + 1) * (segV + 1) + iv;
			const c = (iu + 1) * (segV + 1) + (iv + 1);
			const d = iu * (segV + 1) + (iv + 1);
			indices.push(a, b, d, b, c, d);
		}
		const geom = new three.BufferGeometry();
		geom.setAttribute("position", new three.BufferAttribute(positions, 3));
		geom.setAttribute("normal", new three.BufferAttribute(normals, 3));
		geom.setAttribute("uv", new three.BufferAttribute(uvs, 2));
		geom.setAttribute("aBladeInset", new three.BufferAttribute(bladeInsets, 2));
		geom.setIndex(indices);
		geom.computeVertexNormals();
		return geom;
	}
	function createDiamondStreakGeometry(length, width) {
		const hl = length * .5;
		const hw = width * .5;
		const positions = new Float32Array([
			-hl,
			0,
			0,
			0,
			hw,
			0,
			0,
			-hw,
			0,
			0,
			0,
			hw,
			0,
			0,
			-hw,
			hl,
			0,
			0
		]);
		const uvs = new Float32Array([
			0,
			.5,
			.5,
			0,
			.5,
			1,
			.5,
			0,
			.5,
			1,
			1,
			.5
		]);
		const indices = [
			0,
			1,
			5,
			0,
			5,
			2,
			0,
			3,
			5,
			0,
			5,
			4
		];
		const geom = new three.BufferGeometry();
		geom.setAttribute("position", new three.BufferAttribute(positions, 3));
		geom.setAttribute("uv", new three.BufferAttribute(uvs, 2));
		geom.setIndex(indices);
		geom.computeVertexNormals();
		return geom;
	}
	const SLASH_VERT = `
    attribute float aPhase;
    attribute float aSeed;
    attribute vec2 aBladeInset;
    varying vec2 vUv;
    varying float vPhase;
    varying float vSeed;
    varying vec3 vNormalW;
    varying vec3 vViewDirW;
    uniform float uUseInstance;
    uniform float uPhase;
    uniform float uSeed;
    uniform float uThickness;

    void main() {
      vUv = uv;
      vPhase = mix(uPhase, aPhase, uUseInstance);
      vSeed = mix(uSeed, aSeed, uUseInstance);

      // Above the previous 2x limit, keep the cutting edge fixed and widen the actual ribbon.
      vec3 bladePosition = position;
      bladePosition.xz += aBladeInset * clamp((uThickness - 2.0) * 0.35, 0.0, 0.7);

      vec4 worldPos;
      vec3 worldNorm;
      #ifdef USE_INSTANCING
        worldPos = modelMatrix * instanceMatrix * vec4(bladePosition, 1.0);
        worldNorm = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
      #else
        worldPos = modelMatrix * vec4(bladePosition, 1.0);
        worldNorm = normalize(mat3(modelMatrix) * normal);
      #endif
      vNormalW = worldNorm;
      vViewDirW = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;
	const SLASH_FRAG = `
    precision highp float;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
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
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.04;
        amp *= 0.5;
      }
      return v;
    }

    varying vec2 vUv;
    varying float vPhase;
    varying float vSeed;
    varying vec3 vNormalW;
    varying vec3 vViewDirW;

    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorDeep;
    uniform vec3 uColorInk;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uInkAmount;
    uniform float uGlowBoost;
    uniform float uErodeExtra;
    uniform float uThickness;

    void main() {
      if (vPhase <= 0.001 || vPhase >= 0.999) discard;

      float u = vUv.x;
      // Dynamically adjust slash blade thickness via UV remapping
      float v = vUv.y / max(0.35, uThickness);
      if (v > 1.0) discard;

      float headPos = smoothstep(0.0, 0.20, vPhase) * 1.12;
      float tailPos = smoothstep(0.32, 1.0, vPhase) * 1.12;
      float headMask = 1.0 - smoothstep(headPos - 0.10, headPos + 0.02, u);
      float tailMask = smoothstep(tailPos - 0.04, tailPos + 0.26, u);
      float arcAlive = headMask * tailMask;
      if (arcAlive < 0.01) discard;

      float flow = u * 4.4 - uTime * 2.3 + vSeed * 17.3;
      float streakA = fbm(vec2(flow, v * 12.0 + vSeed * 5.1));
      float streakB = fbm(vec2(u * 9.5 - uTime * 3.5 + vSeed * 9.7, v * 24.0));
      float brush = mix(streakA, streakB, 0.48);

      float edgeCore = exp(-v * 26.0) * (0.88 + 0.32 * streakB);
      float rimLine = smoothstep(0.055, 0.0, v) * (1.0 - smoothstep(0.90, 1.0, u));

      float midBand = smoothstep(0.42, 0.04, v) * (0.50 + 0.60 * streakA);
      float bodyVeil = smoothstep(1.0, 0.05, v) * (0.30 + 0.70 * brush);

      float fadeOut = 1.0 - smoothstep(0.54, 1.0, vPhase);
      float erodeThresh = clamp(mix(0.13, 0.80, 1.0 - fadeOut * arcAlive) + uErodeExtra, 0.0, 0.96);
      float shapeMask = smoothstep(erodeThresh, erodeThresh + 0.21, bodyVeil + edgeCore * 0.95);

      float veilAlpha = mix(0.94, 0.36, smoothstep(0.06, 0.78, v));
      float tipMask = smoothstep(0.0, 0.04, u) * smoothstep(1.0, 0.78, u);
      float alpha = clamp((shapeMask * veilAlpha + rimLine * 0.98) * tipMask * arcAlive * uOpacity, 0.0, 1.0);
      if (alpha < 0.015) discard;

      float inkNoise = fbm(vec2(u * 6.4 - uTime * 1.5 + vSeed * 13.0, v * 16.5));
      float inkSlashA = smoothstep(0.47, 0.62, inkNoise) * smoothstep(0.06, 0.16, v) * smoothstep(0.94, 0.30, v);
      float inkSlashB = smoothstep(0.58, 0.71, streakB) * smoothstep(0.08, 0.20, v) * smoothstep(0.90, 0.26, v);
      float inkMask = clamp((inkSlashA * 0.94 + inkSlashB * 0.95) * uInkAmount, 0.0, 0.96);

      vec3 col = mix(uColorDeep, uColorMid, clamp(midBand * 0.95, 0.0, 1.0));
      col += uColorMid * pow(clamp(1.0 - v, 0.0, 1.0), 4.6) * 0.34 * uGlowBoost;
      col = mix(col, uColorInk, inkMask * (1.0 - rimLine));
      alpha = clamp(alpha + inkMask * shapeMask * 0.35 * tipMask * arcAlive * uOpacity, 0.0, 1.0);

      float hotMix = clamp(edgeCore * 1.18 + rimLine * 0.96, 0.0, 1.0);
      col = mix(col, uColorCore * (1.34 * uGlowBoost), hotMix);

      float ndotv = abs(dot(normalize(vNormalW), normalize(vViewDirW)));
      col += uColorMid * pow(1.0 - ndotv, 2.4) * 0.20 * (1.0 - inkMask * 0.85);

      gl_FragColor = vec4(col, alpha);
    }
  `;
	const INK_FRAG = `
    precision highp float;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
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
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.04;
        amp *= 0.5;
      }
      return v;
    }

    varying vec2 vUv;
    varying float vPhase;
    varying float vSeed;
    uniform vec3 uColorInk;
    uniform vec3 uColorDeep;
    uniform vec3 uColorMid;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uThickness;

    void main() {
      if (vPhase <= 0.001 || vPhase >= 0.999) discard;
      float u = vUv.x;
      float v = vUv.y / max(0.35, uThickness);
      if (v > 1.0) discard;
      float head = 1.0 - smoothstep(smoothstep(0.0, 0.20, vPhase) - 0.08, smoothstep(0.0, 0.20, vPhase) + 0.02, u);
      float tail = smoothstep(smoothstep(0.30, 1.0, vPhase) - 0.04, smoothstep(0.30, 1.0, vPhase) + 0.24, u);
      float n = fbm(vec2(u * 8.2 - uTime * 2.0 + vSeed * 11.0, v * 14.0));
      float coreRibbon = smoothstep(0.26, 0.50, n * (1.0 - abs(v - 0.34) * 2.0));
      float fade = 1.0 - smoothstep(0.58, 1.0, vPhase);
      float alpha = coreRibbon * head * tail * fade * smoothstep(0.0, 0.05, u) * smoothstep(1.0, 0.78, u) * uOpacity;
      if (alpha < 0.02) discard;
      float rim = smoothstep(0.06, 0.0, v) * 0.42;
      vec3 col = mix(uColorInk * 0.65, uColorDeep * 0.50, smoothstep(0.52, 0.86, n) * 0.40);
      col = mix(col, uColorMid * 0.88, rim);
      gl_FragColor = vec4(col, clamp(alpha * 1.18, 0.0, 0.97));
    }
  `;
	const RADIAL_FRAG = `
    precision highp float;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
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
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.04;
        amp *= 0.5;
      }
      return v;
    }

    varying vec2 vUv;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorDeep;
    uniform float uTime;
    uniform float uIntensity;
    uniform float uMode;

    void main() {
      if (uIntensity <= 0.005) discard;
      vec2 p = vUv * 2.0 - 1.0;
      float r = length(p);
      if (r > 1.0) discard;

      if (uMode < 0.5) {
        float ang = atan(p.y, p.x);
        float turb = fbm(vec2(ang * 2.0 + uTime * 1.5, r * 3.8 - uTime * 1.8));
        float g = exp(-r * r * 4.2) * (0.72 + 0.32 * turb);
        vec3 col = mix(uColorDeep, uColorMid, smoothstep(0.90, 0.22, r));
        col = mix(col, uColorCore * 0.95, exp(-r * r * 14.0) * 0.42);
        gl_FragColor = vec4(col * g * uIntensity, g * uIntensity);
      } else {
        float ang = atan(p.y, p.x);
        float scorch = fbm(vec2(ang * 3.0, r * 4.5));
        float pool = pow(1.0 - r, 1.9) * (0.78 + 0.32 * scorch);
        vec3 col = mix(uColorDeep, uColorMid, pow(1.0 - r, 1.35));
        col = mix(col, uColorCore, pow(1.0 - r, 4.0) * 0.38);
        gl_FragColor = vec4(col * pool * uIntensity, pool * uIntensity);
      }
    }
  `;
	const SIMPLE_VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
	const INSTANCED_GLOW_VERT = `
    attribute float aAlpha;
    varying vec2 vUv;
    varying float vAlpha;
    void main() {
      vUv = uv;
      vAlpha = aAlpha;
      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    }
  `;
	const NEEDLE_FRAG = `
    precision highp float;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
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
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.04;
        amp *= 0.5;
      }
      return v;
    }

    varying vec2 vUv;
    varying float vAlpha;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorDeep;
    void main() {
      if (vAlpha <= 0.01) discard;
      float along = pow(sin(vUv.x * 3.14159265), 0.72);
      float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
      float n = fbm(vec2(vUv.x * 8.0, vUv.y * 6.0));
      float body = smoothstep(0.10, 0.85, across * along * (0.72 + 0.45 * n));
      float core = pow(clamp(across, 0.0, 1.0), 2.4) * along;
      vec3 col = mix(uColorDeep, uColorMid, smoothstep(0.15, 0.65, across));
      col = mix(col, uColorCore * 1.42, clamp(core * 1.2, 0.0, 1.0));
      gl_FragColor = vec4(col * (body * 0.75 + core * 0.85) * vAlpha, clamp((body * 0.8 + core) * vAlpha, 0.0, 1.0));
    }
  `;
	const GROUND_MARK_FRAG = `
    precision highp float;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
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
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.04;
        amp *= 0.5;
      }
      return v;
    }

    varying vec2 vUv;
    varying float vAlpha;
    uniform vec3 uColorInk;
    uniform vec3 uColorDeep;
    uniform vec3 uColorMid;
    uniform vec3 uColorCore;
    void main() {
      if (vAlpha <= 0.01) discard;
      float along = pow(sin(vUv.x * 3.14159265), 0.58);
      float n1 = fbm(vec2(vUv.x * 7.5, vUv.y * 4.2));
      float n2 = fbm(vec2(vUv.x * 16.0, vUv.y * 9.0));
      float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
      float gouge = smoothstep(0.18, 0.60, across * along * (0.62 + 0.78 * n1));
      if (gouge < 0.02) discard;
      float seam = pow(clamp(across * along * (0.75 + 0.45 * n2), 0.0, 1.0), 3.2);
      float hotCore = pow(clamp(across * along, 0.0, 1.0), 7.0);
      vec3 col = mix(uColorInk * 0.65, uColorDeep * 0.92, smoothstep(0.25, 0.75, n1));
      col = mix(col, uColorMid * 1.25, seam * 0.82);
      col = mix(col, uColorCore * 1.25, hotCore * 0.78);
      gl_FragColor = vec4(col, gouge * vAlpha * 0.96);
    }
  `;
	const FISSURE_FRAG = `
    precision highp float;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
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
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.04;
        amp *= 0.5;
      }
      return v;
    }

    varying vec2 vUv;
    varying float vAlpha;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorDeep;
    void main() {
      if (vAlpha <= 0.01) discard;
      float along = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.25, vUv.x);
      float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
      float n = fbm(vec2(vUv.x * 10.0, vUv.y * 7.0));
      float crack = smoothstep(0.22, 0.74, across * along * (0.6 + 0.8 * n));
      if (crack < 0.02) discard;
      float hot = pow(clamp(across * along, 0.0, 1.0), 3.0);
      vec3 col = mix(uColorDeep, uColorMid * 1.2, crack);
      col = mix(col, uColorCore * 1.35, hot);
      gl_FragColor = vec4(col * crack * vAlpha, crack * vAlpha);
    }
  `;
	var ThousandSlashesVFX = class {
		constructor(options = {}) {
			this.params = {
				scale: options.scale !== void 0 ? options.scale : 1,
				thickness: options.thickness !== void 0 ? options.thickness : THOUSAND_SLASHES.detailRange.default,
				density: options.density !== void 0 ? options.density : 1,
				duration: options.duration !== void 0 ? options.duration : THOUSAND_SLASHES.duration,
				slashSpeed: options.slashSpeed !== void 0 ? options.slashSpeed : 1,
				sizeVariance: options.sizeVariance !== void 0 ? options.sizeVariance : 1,
				groundCrackWidth: options.groundCrackWidth !== void 0 ? options.groundCrackWidth : 1
			};
			this.duration = this.params.duration;
			this.group = new three.Group();
			this.group.name = "ThousandSlashesVFX";
			this.seed = options.seed || 202611;
			this.currentStormEnergy = 0;
			this.colors = {
				core: new three.Color(options.core || "#fff4cf"),
				mid: new three.Color(options.mid || "#ff5514"),
				deep: new three.Color(options.deep || "#9e090c"),
				ink: new three.Color(options.ink || "#140203")
			};
			this._mat4 = new three.Matrix4();
			this._pos = new three.Vector3();
			this._quat = new three.Quaternion();
			this._scale = new three.Vector3();
			this._euler = new three.Euler();
			this._camPos = new three.Vector3(0, 6, 22);
			this._geometries = [];
			this._materials = [];
			this._colorUniforms = [];
			this._thicknessUniforms = [];
			this._buildAllLayers();
			this.setParams(this.params);
			this.setTime(0);
		}
		_regGeom(g) {
			this._geometries.push(g);
			return g;
		}
		_regMat(m) {
			this._materials.push(m);
			if (m.uniforms) {
				if (m.uniforms.uColorCore || m.uniforms.uColorMid || m.uniforms.uColorDeep || m.uniforms.uColorInk) this._colorUniforms.push(m.uniforms);
				if (m.uniforms.uThickness) this._thicknessUniforms.push(m.uniforms.uThickness);
			}
			return m;
		}
		_makeSlashMat(extra = {}) {
			return this._regMat(new three.ShaderMaterial({
				vertexShader: SLASH_VERT,
				fragmentShader: SLASH_FRAG,
				uniforms: {
					uColorCore: { value: this.colors.core.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uColorDeep: { value: this.colors.deep.clone() },
					uColorInk: { value: this.colors.ink.clone() },
					uTime: { value: 0 },
					uPhase: { value: .5 },
					uSeed: { value: extra.seed || 1 },
					uUseInstance: { value: extra.instanced ? 1 : 0 },
					uOpacity: { value: extra.opacity !== void 0 ? extra.opacity : 1 },
					uInkAmount: { value: extra.inkAmount !== void 0 ? extra.inkAmount : .94 },
					uGlowBoost: { value: extra.glowBoost !== void 0 ? extra.glowBoost : 1.05 },
					uErodeExtra: { value: 0 },
					uThickness: { value: this.params.thickness }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: extra.additive ? three.AdditiveBlending : three.NormalBlending
			}));
		}
		_buildAllLayers() {
			const rand = mulberry32(this.seed);
			const heroConfigs = [
				{
					rx: 9.6,
					rz: 3.75,
					w: 3.65,
					span: Math.PI * 1.16,
					camber: .56,
					helix: .62,
					pos: [
						-.3,
						2.05,
						.08
					],
					rot: [
						.24,
						-.4,
						.28
					],
					seed: 1.1,
					offset: 0,
					period: .21,
					dur: .195
				},
				{
					rx: 4.65,
					rz: 1.95,
					w: 2.35,
					span: Math.PI * 1.05,
					camber: .42,
					helix: -.32,
					pos: [
						.82,
						2.55,
						.62
					],
					rot: [
						1.38,
						.2,
						-1.52
					],
					seed: 3.7,
					offset: .025,
					period: .225,
					dur: .205
				},
				{
					rx: 5.02,
					rz: 2.85,
					w: 2.45,
					span: Math.PI * 1.08,
					camber: .45,
					helix: .38,
					pos: [
						.22,
						2.95,
						-.48
					],
					rot: [
						-.74,
						.48,
						-.34
					],
					seed: 6.4,
					offset: .05,
					period: .24,
					dur: .215
				}
			];
			this._heroes = [];
			heroConfigs.forEach((cfg, idx) => {
				const g = this._regGeom(createCrescentArcGeometry({
					radiusX: cfg.rx,
					radiusZ: cfg.rz,
					width: cfg.w,
					arcSpan: cfg.span,
					camber: cfg.camber,
					helix: cfg.helix,
					segU: 64,
					segV: 12
				}));
				const m = this._makeSlashMat({
					seed: cfg.seed,
					opacity: 1,
					inkAmount: .96,
					glowBoost: 1.08
				});
				const mesh = new three.Mesh(g, m);
				mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
				mesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
				mesh.renderOrder = 13 + idx;
				mesh.frustumCulled = false;
				this.group.add(mesh);
				this._heroes.push({
					mesh,
					mat: m,
					cfg,
					baseRot: mesh.rotation.clone()
				});
			});
			this._echoes = [];
			heroConfigs.forEach((cfg, idx) => {
				const g = this._regGeom(createCrescentArcGeometry({
					radiusX: cfg.rx * 1.05,
					radiusZ: cfg.rz * 1.05,
					width: cfg.w * 1.1,
					arcSpan: cfg.span * .94,
					camber: cfg.camber * .78,
					helix: cfg.helix,
					segU: 38,
					segV: 8
				}));
				const m = this._makeSlashMat({
					seed: cfg.seed + 20,
					opacity: .44,
					inkAmount: .68,
					glowBoost: .68
				});
				const mesh = new three.Mesh(g, m);
				mesh.position.set(cfg.pos[0], cfg.pos[1] - .04, cfg.pos[2]);
				mesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
				mesh.renderOrder = 9 + idx;
				mesh.frustumCulled = false;
				this.group.add(mesh);
				this._echoes.push({
					mesh,
					mat: m,
					cfg,
					baseRot: mesh.rotation.clone()
				});
			});
			const maxFlurry = 40;
			const flurryGeom = this._regGeom(createCrescentArcGeometry({
				radiusX: 6.15,
				radiusZ: 3.38,
				width: 2.25,
				arcSpan: Math.PI * .98,
				camber: .36,
				helix: .33,
				segU: 36,
				segV: 8
			}));
			this._flurryPhaseArr = new Float32Array(maxFlurry);
			const flurrySeedArr = new Float32Array(maxFlurry);
			this._flurryData = [];
			for (let i = 0; i < maxFlurry; i++) {
				flurrySeedArr[i] = rand() * 50;
				const startT = i < 4 ? .005 + i * .01 : .04 + (i - 4) / 36 * .68;
				const randScale = Math.pow(rand(), 1.15);
				this._flurryData.push({
					startT,
					life: (.46 + rand() * .26) / 6,
					repeatPeriod: (1.55 + rand() * .65) / 6,
					px: (rand() - .5) * 2.7,
					py: 1.35 + rand() * 2.25,
					pz: (rand() - .5) * 2.4,
					rx: (rand() - .5) * Math.PI * 1.45,
					ry: (rand() - .5) * Math.PI * 2,
					rz: (rand() - .5) * Math.PI * 1.45,
					sweepAngle: (rand() > .5 ? 1 : -1) * (.45 + rand() * .45),
					randScale,
					randY: rand(),
					randZ: rand()
				});
			}
			this._flurryPhaseAttr = new three.InstancedBufferAttribute(this._flurryPhaseArr, 1);
			flurryGeom.setAttribute("aPhase", this._flurryPhaseAttr);
			flurryGeom.setAttribute("aSeed", new three.InstancedBufferAttribute(flurrySeedArr, 1));
			this._flurryMat = this._makeSlashMat({
				instanced: true,
				opacity: .94,
				inkAmount: .9,
				glowBoost: 1.02
			});
			this._flurryMesh = new three.InstancedMesh(flurryGeom, this._flurryMat, maxFlurry);
			this._flurryMesh.renderOrder = 12;
			this._flurryMesh.frustumCulled = false;
			this.group.add(this._flurryMesh);
			this._needleMat = this._regMat(new three.ShaderMaterial({
				vertexShader: INSTANCED_GLOW_VERT,
				fragmentShader: NEEDLE_FRAG,
				uniforms: {
					uColorCore: { value: this.colors.core.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uColorDeep: { value: this.colors.deep.clone() }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: three.AdditiveBlending
			}));
			const maxInk = 12;
			const inkGeom = this._regGeom(createCrescentArcGeometry({
				radiusX: 8.25,
				radiusZ: 3.45,
				width: 1.45,
				arcSpan: Math.PI * 1.06,
				camber: .39,
				helix: .45,
				segU: 44,
				segV: 6
			}));
			this._inkPhaseArr = new Float32Array(maxInk);
			const inkSeedArr = new Float32Array(maxInk);
			this._inkData = [];
			for (let i = 0; i < maxInk; i++) {
				inkSeedArr[i] = 12 + i * 6.7;
				this._inkData.push({
					offset: i * .2,
					px: (rand() - .5) * 1.2,
					py: 1.75 + i % 3 * .52,
					pz: (rand() - .5) * 1.05,
					rx: i === 0 ? .24 : .22 + (i - 3.5) * .4,
					ry: i === 0 ? -.4 : -.35 + i * .56,
					rz: i === 0 ? .28 : .2 + (i % 2 === 0 ? .36 : -.84),
					sweepAngle: (i % 2 === 0 ? 1 : -1) * .38,
					randScale: i % 4 / 3
				});
			}
			this._inkPhaseAttr = new three.InstancedBufferAttribute(this._inkPhaseArr, 1);
			inkGeom.setAttribute("aPhase", this._inkPhaseAttr);
			inkGeom.setAttribute("aSeed", new three.InstancedBufferAttribute(inkSeedArr, 1));
			this._inkMat = this._regMat(new three.ShaderMaterial({
				vertexShader: SLASH_VERT,
				fragmentShader: INK_FRAG,
				uniforms: {
					uColorInk: { value: this.colors.ink.clone() },
					uColorDeep: { value: this.colors.deep.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uTime: { value: 0 },
					uPhase: { value: .5 },
					uSeed: { value: 1 },
					uUseInstance: { value: 1 },
					uOpacity: { value: .98 },
					uThickness: { value: this.params.thickness }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: three.NormalBlending
			}));
			this._inkMesh = new three.InstancedMesh(inkGeom, this._inkMat, maxInk);
			this._inkMesh.renderOrder = 19;
			this._inkMesh.frustumCulled = false;
			this.group.add(this._inkMesh);
			const xSlashCount = 6;
			const xSlashGeom = this._regGeom(createDiamondStreakGeometry(1, .42));
			this._xSlashAlphaArr = new Float32Array(xSlashCount);
			this._xSlashAlphaAttr = new three.InstancedBufferAttribute(this._xSlashAlphaArr, 1);
			xSlashGeom.setAttribute("aAlpha", this._xSlashAlphaAttr);
			this._xSlashMesh = new three.InstancedMesh(xSlashGeom, this._needleMat, xSlashCount);
			this._xSlashMesh.renderOrder = 17;
			this._xSlashMesh.frustumCulled = false;
			this._xSlashData = [
				{
					startT: 0,
					period: .21,
					life: .055,
					rx: .12,
					ry: -.35,
					rz: .62,
					len: 9.2
				},
				{
					startT: .01,
					period: .21,
					life: .055,
					rx: -.18,
					ry: .25,
					rz: -.68,
					len: 7.2
				},
				{
					startT: .09,
					period: .235,
					life: .06,
					rx: .25,
					ry: .72,
					rz: 1.15,
					len: 10.6
				},
				{
					startT: .105,
					period: .235,
					life: .06,
					rx: -.22,
					ry: -.65,
					rz: -1.1,
					len: 6.4
				},
				{
					startT: -.5,
					period: 99,
					life: .15,
					rx: .15,
					ry: -.32,
					rz: .48,
					len: 12.2,
					isFinale: true
				},
				{
					startT: -.48,
					period: 99,
					life: .15,
					rx: -.15,
					ry: .38,
					rz: -.58,
					len: 11.4,
					isFinale: true
				}
			];
			this.group.add(this._xSlashMesh);
			const quadGeom = this._regGeom(new three.PlaneGeometry(1, 1));
			this._coreGlowMat = this._regMat(new three.ShaderMaterial({
				vertexShader: SIMPLE_VERT,
				fragmentShader: RADIAL_FRAG,
				uniforms: {
					uColorCore: { value: this.colors.core.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uColorDeep: { value: this.colors.deep.clone() },
					uTime: { value: 0 },
					uIntensity: { value: 0 },
					uMode: { value: 0 }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: three.AdditiveBlending
			}));
			this._coreGlowMesh = new three.Mesh(quadGeom, this._coreGlowMat);
			this._coreGlowMesh.position.set(.12, 2.2, 0);
			this._coreGlowMesh.scale.set(8, 8, 1);
			this._coreGlowMesh.renderOrder = 10;
			this.group.add(this._coreGlowMesh);
			this._groundPoolMat = this._regMat(new three.ShaderMaterial({
				vertexShader: SIMPLE_VERT,
				fragmentShader: RADIAL_FRAG,
				uniforms: {
					uColorCore: { value: this.colors.core.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uColorDeep: { value: this.colors.deep.clone() },
					uTime: { value: 0 },
					uIntensity: { value: 0 },
					uMode: { value: 1 }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: three.AdditiveBlending
			}));
			this._groundPoolMesh = new three.Mesh(quadGeom, this._groundPoolMat);
			this._groundPoolMesh.rotation.x = -Math.PI * .5;
			this._groundPoolMesh.position.set(0, .025, 0);
			this._groundPoolMesh.scale.set(20.2, 15.3, 1);
			this._groundPoolMesh.renderOrder = 2;
			this.group.add(this._groundPoolMesh);
			const maxMarks = 32;
			const markGeom = this._regGeom(new three.PlaneGeometry(1, 1));
			this._markAlphaArr = new Float32Array(maxMarks);
			this._markAlphaAttr = new three.InstancedBufferAttribute(this._markAlphaArr, 1);
			markGeom.setAttribute("aAlpha", this._markAlphaAttr);
			this._markMat = this._regMat(new three.ShaderMaterial({
				vertexShader: INSTANCED_GLOW_VERT,
				fragmentShader: GROUND_MARK_FRAG,
				uniforms: {
					uColorInk: { value: this.colors.ink.clone() },
					uColorDeep: { value: this.colors.deep.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uColorCore: { value: this.colors.core.clone() }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: three.NormalBlending
			}));
			this._markMesh = new three.InstancedMesh(markGeom, this._markMat, maxMarks);
			this._markMesh.renderOrder = 3;
			this._markMesh.frustumCulled = false;
			this._markData = [];
			for (let i = 0; i < maxMarks; i++) {
				const ang = i / maxMarks * Math.PI * 2 + (rand() - .5) * .35;
				const dist = (.6 + rand() * 3.8) * 1.5;
				this._markData.push({
					appearFrac: .005 + i / maxMarks * .44,
					x: Math.cos(ang) * dist * 1.25,
					z: Math.sin(ang) * dist * .85,
					rotY: rand() * Math.PI * 2,
					len: (2.6 + rand() * 3.8) * 1.5,
					wid: (.22 + rand() * .42) * 3 / 5
				});
			}
			this.group.add(this._markMesh);
			const maxFissures = 20;
			const fissureGeom = this._regGeom(new three.PlaneGeometry(1, 1));
			this._fissureAlphaArr = new Float32Array(maxFissures);
			this._fissureAlphaAttr = new three.InstancedBufferAttribute(this._fissureAlphaArr, 1);
			fissureGeom.setAttribute("aAlpha", this._fissureAlphaAttr);
			this._fissureMat = this._regMat(new three.ShaderMaterial({
				vertexShader: INSTANCED_GLOW_VERT,
				fragmentShader: FISSURE_FRAG,
				uniforms: {
					uColorCore: { value: this.colors.core.clone() },
					uColorMid: { value: this.colors.mid.clone() },
					uColorDeep: { value: this.colors.deep.clone() }
				},
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				blending: three.AdditiveBlending
			}));
			this._fissureMesh = new three.InstancedMesh(fissureGeom, this._fissureMat, maxFissures);
			this._fissureMesh.renderOrder = 4;
			this._fissureMesh.frustumCulled = false;
			this._fissureData = [];
			for (let i = 0; i < maxFissures; i++) this._fissureData.push({
				triggerT: i / maxFissures * .3,
				period: .31 + i % 3 * .07,
				life: .12,
				ang: i / maxFissures * Math.PI * 2 + (rand() - .5) * .35,
				maxLen: (5.8 + rand() * 3.4) * 1.5,
				wid: (.75 + rand() * .55) / 5
			});
			this.group.add(this._fissureMesh);
		}
		setColors(palette) {
			if (palette.core) this.colors.core.set(palette.core);
			if (palette.mid) this.colors.mid.set(palette.mid);
			if (palette.deep) this.colors.deep.set(palette.deep);
			if (palette.ink) this.colors.ink.set(palette.ink);
			for (let i = 0; i < this._colorUniforms.length; i++) {
				const u = this._colorUniforms[i];
				if (u.uColorCore) u.uColorCore.value.copy(this.colors.core);
				if (u.uColorMid) u.uColorMid.value.copy(this.colors.mid);
				if (u.uColorDeep) u.uColorDeep.value.copy(this.colors.deep);
				if (u.uColorInk) u.uColorInk.value.copy(this.colors.ink);
			}
		}
		setBaseColor(hex) {
			const pal = derivePaletteFromBase(hex);
			this.setColors(pal);
			return pal;
		}
		setParams(patch) {
			Object.assign(this.params, patch);
			this.duration = Math.max(.6, this.params.duration);
			this.group.scale.setScalar(this.params.scale);
			for (let i = 0; i < this._thicknessUniforms.length; i++) this._thicknessUniforms[i].value = this.params.thickness;
		}
		setCameraPosition(camPos) {
			this._camPos.copy(camPos);
			this._coreGlowMesh.lookAt(this._camPos);
		}
		setTime(tRaw) {
			const D = this.duration;
			const t = Math.max(0, Math.min(D, tRaw));
			const spd = Math.max(.15, this.params.slashSpeed);
			const tAnim = t * 6 * spd;
			const vari = this.params.sizeVariance;
			const thick = this.params.thickness;
			const dens = this.params.density;
			const gCrack = this.params.groundCrackWidth;
			const stopT = Math.max(.25, D - .36);
			const envIn = smoothstep(0, .05, t);
			const envStorm = 1 - smoothstep(stopT, stopT + .22, t);
			const envTail = 1 - smoothstep(stopT + .1, D - .04, t);
			const finalePulse = Math.exp(-Math.pow((t - (stopT - .08)) / .1, 2)) * .35;
			const stormEnergy = clamp01(envIn * envStorm + finalePulse * envTail);
			this.currentStormEnergy = stormEnergy;
			const dissolveErode = smoothstep(stopT + .04, stopT + .28, t) * .88;
			for (let i = 0; i < this._heroes.length; i++) {
				const h = this._heroes[i];
				const e = this._echoes[i];
				const period = h.cfg.period / spd;
				const dur = h.cfg.dur / spd;
				const offset = h.cfg.offset / spd;
				const dt = t - offset;
				let bestPhase = 0;
				let activeCycleIdx = 0;
				if (dt >= 0 && t < stopT + .26) {
					activeCycleIdx = Math.floor(dt / period);
					if (offset + activeCycleIdx * period <= stopT + .02) {
						const lt = dt % period;
						if (lt <= dur) bestPhase = clamp01(lt / dur);
					}
				}
				const heroAlpha = 1 - smoothstep(stopT + .06, stopT + .26, t);
				const heroScalePulse = 1 + ((activeCycleIdx * 37 + i * 19) % 10 / 9 - .45) * .52 * vari;
				h.mat.uniforms.uTime.value = tAnim;
				h.mat.uniforms.uPhase.value = bestPhase;
				h.mat.uniforms.uOpacity.value = heroAlpha;
				h.mat.uniforms.uErodeExtra.value = dissolveErode;
				const whip = (smoothstep(0, .35, bestPhase) - .35) * .38;
				const altTilt = (activeCycleIdx % 2 === 0 ? 1 : -1) * .18;
				h.mesh.rotation.set(h.baseRot.x + altTilt * .5, h.baseRot.y + whip, h.baseRot.z + altTilt);
				h.mesh.scale.setScalar(heroScalePulse);
				const echoPhase = clamp01(bestPhase - .1);
				e.mat.uniforms.uTime.value = tAnim - .24;
				e.mat.uniforms.uPhase.value = bestPhase > .1 ? echoPhase : 0;
				e.mat.uniforms.uOpacity.value = .42 * heroAlpha;
				e.mat.uniforms.uErodeExtra.value = dissolveErode * .85;
				e.mesh.rotation.set(e.baseRot.x + altTilt * .5, e.baseRot.y + whip - .1, e.baseRot.z + altTilt);
				e.mesh.scale.setScalar(heroScalePulse);
			}
			this._flurryMat.uniforms.uTime.value = tAnim;
			this._flurryMat.uniforms.uErodeExtra.value = dissolveErode;
			const flurryFade = 1 - smoothstep(stopT, stopT + .22, t);
			const activeFlurry = Math.min(this._flurryData.length, Math.max(2, Math.round(20 * dens)));
			for (let i = 0; i < this._flurryData.length; i++) {
				const d = this._flurryData[i];
				let phase = 0;
				if (i < activeFlurry && flurryFade > .02) {
					const st = d.startT / spd;
					const per = d.repeatPeriod / spd;
					const life = d.life / spd;
					if (t >= st) {
						if (st + Math.floor((t - st) / per) * per <= stopT) {
							const localT = (t - st) % per;
							if (localT < life) phase = localT / life;
						}
					}
				}
				this._flurryPhaseArr[i] = phase;
				if (phase > .001) {
					const st = d.startT / spd;
					const per = d.repeatPeriod / spd;
					const cycleNum = Math.floor((t - st) / per);
					this._pos.set(d.px, d.py, d.pz);
					const whip = smoothstep(0, .45, phase) * d.sweepAngle;
					this._euler.set(d.rx + cycleNum * .85, d.ry + whip + cycleNum * 1.25, d.rz);
					this._quat.setFromEuler(this._euler);
					const baseAmp = 1 + (d.randScale * 1.52 - .42) * vari;
					const sc = (.78 + .34 * smoothstep(0, .3, phase)) * (.65 + .35 * flurryFade);
					const sy = 1 + (d.randY * 1.1 - .28) * vari;
					this._scale.set(baseAmp * sc, sy * sc, baseAmp * (.85 + d.randZ * .3) * sc);
				} else this._scale.set(0, 0, 0);
				this._mat4.compose(this._pos, this._quat, this._scale);
				this._flurryMesh.setMatrixAt(i, this._mat4);
			}
			this._flurryPhaseAttr.needsUpdate = true;
			this._flurryMesh.instanceMatrix.needsUpdate = true;
			this._inkMat.uniforms.uTime.value = tAnim;
			this._inkMat.uniforms.uOpacity.value = .98 * (1 - smoothstep(stopT + .06, stopT + .28, t));
			const activeInk = Math.min(this._inkData.length, Math.max(2, Math.round(8 * dens)));
			for (let i = 0; i < this._inkData.length; i++) {
				const d = this._inkData[i];
				const off = d.offset / 6 / spd;
				const per = .245 / spd;
				const dur = .195 / spd;
				const dt = t - off;
				let phase = 0;
				let cyc = 0;
				if (i < activeInk && dt >= 0 && t < stopT + .28) {
					cyc = Math.floor(dt / per);
					if (off + cyc * per <= stopT + .02) phase = clamp01(dt % per / dur);
				}
				this._inkPhaseArr[i] = phase;
				if (phase > .001) {
					this._pos.set(d.px, d.py, d.pz);
					const whip = smoothstep(0, .4, phase) * d.sweepAngle;
					this._euler.set(d.rx + cyc * .3, d.ry + whip + cyc * .6, d.rz);
					this._quat.setFromEuler(this._euler);
					const sc = 1 + (d.randScale * 1.14 - .38) * vari;
					this._scale.setScalar(sc);
				} else this._scale.set(0, 0, 0);
				this._mat4.compose(this._pos, this._quat, this._scale);
				this._inkMesh.setMatrixAt(i, this._mat4);
			}
			this._inkPhaseAttr.needsUpdate = true;
			this._inkMesh.instanceMatrix.needsUpdate = true;
			const xFade = 1 - smoothstep(stopT + .02, stopT + .22, t);
			for (let i = 0; i < this._xSlashData.length; i++) {
				const d = this._xSlashData[i];
				let alpha = 0;
				const st = d.isFinale ? Math.max(.1, stopT - .12 + (i - 4) * .02) : d.startT / spd;
				const per = d.isFinale ? 99 : d.period / spd;
				const life = d.life / spd;
				if (t >= st && xFade > .02) {
					const cycleStart = st + Math.floor((t - st) / per) * per;
					const lt = (t - st) % per;
					if ((d.isFinale || cycleStart <= stopT) && lt < life) {
						const p = lt / life;
						alpha = Math.sin(p * Math.PI) * xFade;
						this._pos.set(.12, 2.2, .08);
						this._euler.set(d.rx, d.ry, d.rz);
						this._quat.setFromEuler(this._euler);
						this._scale.set(d.len * (.45 + .85 * smoothstep(0, .35, p)), (1.25 - .55 * p) * thick, thick);
					} else this._scale.set(0, 0, 0);
				} else this._scale.set(0, 0, 0);
				this._xSlashAlphaArr[i] = alpha;
				this._mat4.compose(this._pos, this._quat, this._scale);
				this._xSlashMesh.setMatrixAt(i, this._mat4);
			}
			this._xSlashAlphaAttr.needsUpdate = true;
			this._xSlashMesh.instanceMatrix.needsUpdate = true;
			this._coreGlowMat.uniforms.uTime.value = tAnim * .25;
			this._coreGlowMat.uniforms.uIntensity.value = stormEnergy * (.58 + .08 * Math.sin(t * 12));
			this._coreGlowMesh.lookAt(this._camPos);
			this._groundPoolMat.uniforms.uTime.value = t;
			this._groundPoolMat.uniforms.uIntensity.value = stormEnergy * .92;
			const activeMarks = Math.min(this._markData.length, Math.max(4, Math.round(18 * dens)));
			for (let i = 0; i < this._markData.length; i++) {
				const d = this._markData[i];
				let alpha = 0;
				if (i < activeMarks) {
					const appearT = d.appearFrac * Math.min(D, 5);
					alpha = smoothstep(appearT, appearT + .06, t) * (1 - smoothstep(stopT + .1, D - .04, t));
				}
				this._markAlphaArr[i] = alpha;
				if (alpha > .01) {
					this._pos.set(d.x, .03 + i % 5 * .002, d.z);
					this._euler.set(-Math.PI * .5, 0, d.rotY);
					this._quat.setFromEuler(this._euler);
					this._scale.set(d.len, d.wid * gCrack, 1);
				} else this._scale.set(0, 0, 0);
				this._mat4.compose(this._pos, this._quat, this._scale);
				this._markMesh.setMatrixAt(i, this._mat4);
			}
			this._markAlphaAttr.needsUpdate = true;
			this._markMesh.instanceMatrix.needsUpdate = true;
			const fisFade = 1 - smoothstep(stopT, stopT + .24, t);
			const activeFis = Math.min(this._fissureData.length, Math.max(3, Math.round(12 * dens)));
			for (let i = 0; i < this._fissureData.length; i++) {
				const d = this._fissureData[i];
				const st = d.triggerT / spd;
				const per = d.period / spd;
				const life = d.life / spd;
				const dt = t - st;
				let alpha = 0;
				if (i < activeFis && dt >= 0 && fisFade > .02) {
					const cyc = Math.floor(dt / per);
					const cycleStart = st + cyc * per;
					const lt = dt % per;
					if (cycleStart <= stopT + .02 && lt <= life) {
						const p = lt / life;
						const ang = d.ang + cyc * .65;
						const curLen = 1.2 + (1 - Math.pow(1 - p, 2.8)) * d.maxLen;
						alpha = (1 - smoothstep(.28, 1, p)) * .92 * fisFade;
						const dist = curLen * .45;
						this._pos.set(Math.cos(ang) * dist, .045 + i % 3 * .003, Math.sin(ang) * dist);
						this._euler.set(-Math.PI * .5, 0, -ang);
						this._quat.setFromEuler(this._euler);
						this._scale.set(curLen, d.wid * gCrack * (1.15 - .35 * p), 1);
					} else this._scale.set(0, 0, 0);
				} else this._scale.set(0, 0, 0);
				this._fissureAlphaArr[i] = alpha;
				this._mat4.compose(this._pos, this._quat, this._scale);
				this._fissureMesh.setMatrixAt(i, this._mat4);
			}
			this._fissureAlphaAttr.needsUpdate = true;
			this._fissureMesh.instanceMatrix.needsUpdate = true;
		}
		dispose() {
			this.group.removeFromParent();
			for (const mesh of this.group.children) if (mesh.isInstancedMesh) mesh.dispose();
			this._geometries.forEach((g) => g.dispose());
			this._materials.forEach((m) => m.dispose());
		}
	};
	const THOUSAND_SLASHES = Object.freeze({
		duration: 2.5,
		durationRange: Object.freeze({
			min: 1,
			max: 8
		}),
		detailRange: Object.freeze({
			min: .25,
			max: 4,
			default: 2
		}),
		seed: 202611,
		color: "#ff5514"
	});
	const bounded = (value, min, max, fallback = 1) => Number.isFinite(value) ? three.MathUtils.clamp(value, min, max) : fallback;
	function normalizeThousandSlashesOptions(options = {}) {
		const { detailRange, durationRange, duration } = THOUSAND_SLASHES;
		return {
			color: typeof options.color === "string" && /^#[0-9a-f]{6}$/i.test(options.color) ? options.color.toLowerCase() : THOUSAND_SLASHES.color,
			size: bounded(options.size, .25, 2),
			speed: bounded(options.speed, .25, 2),
			detail: bounded(options.detail, detailRange.min, detailRange.max, detailRange.default),
			density: bounded(options.density, .125, 1),
			duration: bounded(options.duration, durationRange.min, durationRange.max, duration)
		};
	}
	function createThousandSlashesEffect(spec, options = {}) {
		const lifecycle = Object.freeze({
			start: .05,
			end: .36,
			...spec.lifecycle
		});
		const originalPalette = {
			core: "#fff4cf",
			mid: THOUSAND_SLASHES.color,
			deep: "#9e090c",
			ink: "#140203"
		};
		let settings = Object.freeze(normalizeThousandSlashesOptions(options)), elapsed = 0, disposed = false;
		const cast = new ThousandSlashesVFX({
			duration: settings.duration,
			seed: spec.seed,
			scale: settings.size,
			thickness: settings.detail,
			density: settings.density
		});
		const { group } = cast, cameraWorld = new three.Vector3(), lastCamera = new three.Vector3(Infinity, Infinity, Infinity);
		group.name = spec.id;
		if (settings.color !== THOUSAND_SLASHES.color) cast.setBaseColor(settings.color);
		function seek(seconds) {
			if (disposed || !Number.isFinite(seconds)) return;
			const { duration } = settings;
			elapsed = three.MathUtils.clamp(seconds, 0, duration);
			group.visible = elapsed < duration;
			if (group.visible) cast.setTime(elapsed);
		}
		function setCameraPosition(worldPosition) {
			if (disposed || !worldPosition?.isVector3 || ![
				worldPosition.x,
				worldPosition.y,
				worldPosition.z
			].every(Number.isFinite)) return;
			if (lastCamera.equals(worldPosition)) return;
			lastCamera.copy(worldPosition);
			cast.setCameraPosition(worldPosition);
		}
		return {
			group,
			lifecycle,
			get duration() {
				return settings.duration;
			},
			get settings() {
				return settings;
			},
			get elapsed() {
				return elapsed;
			},
			get finished() {
				return disposed || elapsed >= settings.duration;
			},
			get phase() {
				return this.finished ? "finished" : elapsed < lifecycle.start ? "starting" : elapsed < settings.duration - lifecycle.end ? "active" : "ending";
			},
			seek,
			setCameraPosition,
			render(renderer, scene, camera) {
				setCameraPosition(camera.getWorldPosition(cameraWorld));
				renderer.render(scene, camera);
			},
			update(dt) {
				if (!this.finished && Number.isFinite(dt) && dt > 0) seek(elapsed + Math.min(dt, settings.duration / settings.speed) * settings.speed);
			},
			reset() {
				seek(0);
			},
			setOptions(partial = {}) {
				if (disposed) return;
				const next = Object.freeze(normalizeThousandSlashesOptions({
					...settings,
					...partial
				}));
				if (next.color !== settings.color) {
					if (next.color === THOUSAND_SLASHES.color) cast.setColors(originalPalette);
					else cast.setBaseColor(next.color);
				}
				cast.setParams({
					scale: next.size,
					thickness: next.detail,
					density: next.density,
					duration: next.duration
				});
				settings = next;
				seek(elapsed);
			},
			dispose() {
				if (disposed) return;
				disposed = true;
				group.visible = false;
				cast.dispose();
			}
		};
	}

//#endregion
exports.THOUSAND_SLASHES = THOUSAND_SLASHES;
exports.ThousandSlashesVFX = ThousandSlashesVFX;
exports.createThousandSlashesEffect = createThousandSlashesEffect;
exports.derivePaletteFromBase = derivePaletteFromBase;
exports.normalizeThousandSlashesOptions = normalizeThousandSlashesOptions;
return exports;
})({}, THREE);
const THOUSAND_SLASHES = __vfxModule.THOUSAND_SLASHES;
const ThousandSlashesVFX = __vfxModule.ThousandSlashesVFX;
const createThousandSlashesEffect = __vfxModule.createThousandSlashesEffect;
const derivePaletteFromBase = __vfxModule.derivePaletteFromBase;
const normalizeThousandSlashesOptions = __vfxModule.normalizeThousandSlashesOptions;

export {ThousandSlashesVFX,derivePaletteFromBase};
export const defaultOptions={"color":"#ff5514","size":1,"speed":1,"detail":2,"density":1,"duration":2.5};
export default function createVFX(options={}){return createThousandSlashesEffect({"id":"thousand-slashes","seed":202611,"lifecycle":{"start":0.05,"end":0.36}},{...defaultOptions,...options});}
