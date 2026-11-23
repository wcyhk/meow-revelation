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

//#region src/effects/dark-pillar-burst-runtime.js
	const PILLAR_FLOW_RATE = 4;
	const FOOT_GALE_RATE = 2;
	const ignition = 1.15;
	const formationEnd = 1.8;
	const holdDuration = 14.5;
	const release = 16.3;
	const DARK_PILLAR_BURST = Object.freeze({
		duration: 17.84,
		ignition,
		formationEnd,
		holdDuration,
		firstEcho: 5.8,
		secondEcho: 11.8,
		release,
		seed: 9187,
		maxParticles: 176
	});
	function createPatternSurface(size) {
		if (typeof document !== "undefined") {
			const canvas = document.createElement("canvas");
			canvas.width = canvas.height = size;
			const context = canvas.getContext("2d");
			if (context) return {
				canvas,
				context
			};
		}
		if (typeof OffscreenCanvas !== "undefined") {
			const canvas = new OffscreenCanvas(size, size);
			const context = canvas.getContext("2d");
			if (context) return {
				canvas,
				context
			};
		}
		return null;
	}
	function transparentPattern() {
		const tex = new three.DataTexture(/* @__PURE__ */ new Uint8Array(4), 1, 1);
		tex.needsUpdate = true;
		return tex;
	}
	var DarkPillarBurstVFX = class {
		constructor(options = {}, initialProgress = .45) {
			this.duration = Number.isFinite(options.duration) && options.duration > 0 ? options.duration : DARK_PILLAR_BURST.duration;
			this.scale = Number.isFinite(options.scale) && options.scale > 0 ? options.scale : 1;
			this.group = new three.Group();
			this.group.name = "DarkPillarBurstVFX";
			this.group.scale.setScalar(this.scale);
			this._disposables = {
				geometries: [],
				materials: [],
				textures: []
			};
			this._dummy = new three.Object3D();
			this._seed = Number.isSafeInteger(options.seed) ? options.seed >>> 0 : DARK_PILLAR_BURST.seed;
			this._noiseTex = this._createSeamlessNoiseTexture(256);
			this._runeRingTex = this._createRuneRingTexture(1024);
			this._groundCircleTex = this._createGroundCircleTexture(1024);
			this._lastU = -1;
			this._footBlend = { value: 0 };
			this._buildLayer01_GroundMagicCircle();
			this._buildLayer02_DarkCorePillar();
			this._buildLayer03_CoreLightningVeins();
			this._buildLayer04_OuterEnergySheath();
			this._buildLayer05_RisingEnergyPlumes();
			this._buildLayer06_FloatingRuneRings();
			this._buildLayer07_RuneRingInnerHalo();
			for (let i = 0; i < 160; i++) this._rand();
			this._buildLayer09_BaseGroundShockwave();
			this._buildLayer10_SkyStormVortex();
			this._buildLayer11_VerticalLightStreaks();
			this._buildFootSurges();
			this._buildImpactFan();
			this._buildLayer12_DebrisRockShards();
			this._buildLayer13_EmberSparks();
			this._buildLayer14_DarkSmokeBillows();
			this._buildLayer15_OrbitingVoidWisps();
			this._buildLayer16_GroundScorchCrater();
			this.circleShape = new three.Group();
			this.columnShape = new three.Group();
			this.circleShape.name = "ground-circle-shape";
			this.columnShape.name = "column-shape";
			this.circleShape.add(this.groundCircle);
			this.columnShape.add(this._buildStormScript());
			this.riftMantle = this._buildRiftMantle();
			this.travelingFault = this._buildTravelingFault();
			this.columnShape.add(this.riftMantle, this.travelingFault);
			this.footPlasma = this._buildFootPlasma();
			this.columnShape.add(this.footPlasma);
			this.columnShape.add(this.darkCore, this.coreVeins, this.outerSheath, this.plumeMesh, this.streaksMesh, this.voidWisps, ...this.runeRings.map((r) => r.mesh), ...this.ringHalos.map((r) => r.mesh));
			this.group.add(this.circleShape, this.columnShape);
			this.vortexBaseY = this.skyVortex.position.y;
			this.setShape(options);
			this.setNormalizedTime(initialProgress);
		}
		_rand() {
			let t = this._seed += 1831565813;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}
		_trackGeo(g) {
			this._disposables.geometries.push(g);
			return g;
		}
		_trackMat(m) {
			this._disposables.materials.push(m);
			return m;
		}
		_trackTex(t) {
			this._disposables.textures.push(t);
			return t;
		}
		_clamp01(v) {
			return v < 0 ? 0 : v > 1 ? 1 : v;
		}
		_smoothstep(e0, e1, x) {
			const t = this._clamp01((x - e0) / (e1 - e0));
			return t * t * (3 - 2 * t);
		}
		_easeOutCubic(t) {
			return 1 - Math.pow(1 - this._clamp01(t), 3);
		}
		_easeOutBack(t) {
			const c1 = 1.35, c3 = 2.35;
			const x = this._clamp01(t) - 1;
			return 1 + c3 * x * x * x + c1 * x * x;
		}
		_mergeIndexedGeometries(geos) {
			let totalVerts = 0;
			let totalIndices = 0;
			for (let i = 0; i < geos.length; i++) {
				totalVerts += geos[i].attributes.position.count;
				totalIndices += geos[i].index.count;
			}
			const positions = new Float32Array(totalVerts * 3);
			const normals = new Float32Array(totalVerts * 3);
			const uvs = new Float32Array(totalVerts * 2);
			const indices = new Uint32Array(totalIndices);
			let vOffset = 0;
			let iOffset = 0;
			for (let gIdx = 0; gIdx < geos.length; gIdx++) {
				const g = geos[gIdx];
				const pos = g.attributes.position.array;
				const norm = g.attributes.normal.array;
				const uv = g.attributes.uv.array;
				const idx = g.index.array;
				positions.set(pos, vOffset * 3);
				normals.set(norm, vOffset * 3);
				uvs.set(uv, vOffset * 2);
				for (let k = 0; k < idx.length; k++) indices[iOffset + k] = idx[k] + vOffset;
				vOffset += g.attributes.position.count;
				iOffset += idx.length;
				g.dispose();
			}
			const merged = new three.BufferGeometry();
			merged.setAttribute("position", new three.BufferAttribute(positions, 3));
			merged.setAttribute("normal", new three.BufferAttribute(normals, 3));
			merged.setAttribute("uv", new three.BufferAttribute(uvs, 2));
			merged.setIndex(new three.BufferAttribute(indices, 1));
			return this._trackGeo(merged);
		}
		_createSeamlessNoiseTexture(size) {
			const data = new Uint8Array(size * size * 4);
			const hash = (ix, iy, per) => {
				const x = (ix % per + per) % per;
				const y = (iy % per + per) % per;
				let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
				n = Math.imul(n ^ n >>> 13, 1274126177);
				return ((n ^ n >>> 16) >>> 0) / 4294967296;
			};
			const octave = (per) => {
				const stride = per + 1, grid = new Float64Array(stride * stride);
				for (let y = 0; y <= per; y++) for (let x = 0; x <= per; x++) grid[y * stride + x] = hash(x, y, per);
				const cell = new Uint32Array(size), blend = new Float64Array(size);
				for (let i = 0; i < size; i++) {
					const p = i / size * per, base = Math.floor(p), f = p - base;
					cell[i] = base;
					blend[i] = f * f * (3 - 2 * f);
				}
				return (x, y) => {
					const i = cell[y] * stride + cell[x], fx = blend[x];
					const a = grid[i], b = grid[i + 1], c = grid[i + stride], d = grid[i + stride + 1];
					const top = a + (b - a) * fx;
					return top + (c + (d - c) * fx - top) * blend[y];
				};
			};
			const low = octave(8), mid = octave(16), high = octave(32);
			let ptr = 0;
			for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
				const n0 = low(x, y), n1 = mid(x, y), n2 = high(x, y);
				const fbmVal = n0 * .55 + n1 * .3 + n2 * .15;
				const ridgeVal = 1 - Math.abs(n1 * 2 - 1);
				data[ptr++] = Math.min(255, Math.max(0, Math.round(fbmVal * 255)));
				data[ptr++] = Math.min(255, Math.max(0, Math.round(ridgeVal * 255)));
				data[ptr++] = Math.min(255, Math.max(0, Math.round(n0 * 255)));
				data[ptr++] = 255;
			}
			const tex = new three.DataTexture(data, size, size, three.RGBAFormat);
			tex.wrapS = three.RepeatWrapping;
			tex.wrapT = three.RepeatWrapping;
			tex.minFilter = three.LinearFilter;
			tex.magFilter = three.LinearFilter;
			tex.needsUpdate = true;
			return this._trackTex(tex);
		}
		_createRuneRingTexture(size) {
			const surface = createPatternSurface(size);
			if (!surface) return this._trackTex(transparentPattern());
			const { canvas: c, context: ctx } = surface;
			const cx = size * .5;
			const cy = size * .5;
			const outerR = size * .472;
			const innerR = size * .342;
			const midR = (outerR + innerR) * .5;
			const bandW = outerR - innerR;
			ctx.clearRect(0, 0, size, size);
			ctx.save();
			ctx.beginPath();
			ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
			ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
			ctx.fillStyle = "rgba(13, 16, 28, 0.88)";
			ctx.fill();
			ctx.restore();
			ctx.save();
			ctx.shadowColor = "rgba(235, 244, 255, 1.0)";
			ctx.shadowBlur = size * .02;
			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = size * .0155;
			ctx.beginPath();
			ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
			ctx.stroke();
			ctx.lineWidth = size * .0115;
			ctx.beginPath();
			ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
			ctx.strokeStyle = "rgba(225, 236, 255, 0.72)";
			ctx.lineWidth = size * .0028;
			ctx.beginPath();
			ctx.arc(cx, cy, outerR - bandW * .13, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(cx, cy, innerR + bandW * .13, 0, Math.PI * 2);
			ctx.stroke();
			const count = 24;
			ctx.strokeStyle = "#ffffff";
			ctx.fillStyle = "#ffffff";
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			for (let i = 0; i < count; i++) {
				const a = i / count * Math.PI * 2;
				ctx.save();
				ctx.translate(cx + Math.cos(a) * midR, cy + Math.sin(a) * midR);
				ctx.rotate(a + Math.PI * .5);
				const s = bandW * .34;
				ctx.lineWidth = size * .0044;
				if (i % 3 === 0) {
					ctx.beginPath();
					ctx.arc(0, 0, s * .85, 0, Math.PI * 2);
					ctx.stroke();
					ctx.beginPath();
					ctx.arc(0, 0, s * .38, 0, Math.PI * 2);
					ctx.fill();
					ctx.beginPath();
					ctx.moveTo(-s * 1.55, 0);
					ctx.lineTo(-s * .92, 0);
					ctx.moveTo(s * .92, 0);
					ctx.lineTo(s * 1.55, 0);
					ctx.stroke();
				} else if (i % 3 === 1) {
					ctx.beginPath();
					ctx.moveTo(-s * .72, -s * .72);
					ctx.lineTo(0, s * .78);
					ctx.lineTo(s * .72, -s * .72);
					ctx.moveTo(-s * .58, 0);
					ctx.lineTo(s * .58, 0);
					ctx.moveTo(0, -s * .88);
					ctx.lineTo(0, s * .88);
					ctx.stroke();
				} else {
					ctx.beginPath();
					ctx.arc(0, 0, s * .68, -Math.PI * .75, Math.PI * .75);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(-s * .82, 0);
					ctx.lineTo(s * .88, 0);
					ctx.moveTo(s * .35, -s * .58);
					ctx.lineTo(s * .35, s * .58);
					ctx.stroke();
				}
				ctx.restore();
			}
			const tex = new three.CanvasTexture(c);
			tex.anisotropy = 4;
			tex.needsUpdate = true;
			return this._trackTex(tex);
		}
		_createGroundCircleTexture(size) {
			const surface = createPatternSurface(size);
			if (!surface) return this._trackTex(transparentPattern());
			const { canvas: c, context: ctx } = surface;
			const cx = size * .5;
			const cy = size * .5;
			ctx.clearRect(0, 0, size, size);
			ctx.strokeStyle = "#e8f0ff";
			ctx.fillStyle = "#e8f0ff";
			ctx.shadowColor = "rgba(210, 228, 255, 0.85)";
			ctx.shadowBlur = size * .01;
			const radii = [
				.47,
				.435,
				.365,
				.34,
				.255
			];
			const widths = [
				.007,
				.003,
				.0055,
				.0025,
				.004
			];
			radii.forEach((r, idx) => {
				ctx.lineWidth = size * widths[idx];
				ctx.beginPath();
				ctx.arc(cx, cy, size * r, 0, Math.PI * 2);
				ctx.stroke();
			});
			const ticks = 48;
			ctx.lineWidth = size * .0024;
			for (let i = 0; i < ticks; i++) {
				const a = i / ticks * Math.PI * 2;
				const r0 = size * (i % 4 === 0 ? .365 : .435);
				const r1 = size * .47;
				ctx.beginPath();
				ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
				ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
				ctx.stroke();
			}
			for (let i = 0; i < 8; i++) {
				const a = i / 8 * Math.PI * 2;
				const r = size * .4;
				ctx.beginPath();
				ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size * .013, 0, Math.PI * 2);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size * .0045, 0, Math.PI * 2);
				ctx.fill();
			}
			const tex = new three.CanvasTexture(c);
			tex.anisotropy = 4;
			tex.needsUpdate = true;
			return this._trackTex(tex);
		}
		_glslNoise() {
			return `
      uniform sampler2D uNoise;
      float vnoise(vec2 p) {
        return texture2D(uNoise, p * 0.125).b;
      }
      float pnoiseX(vec2 p, float period) {
        return texture2D(uNoise, vec2(p.x / period, p.y * 0.125)).b;
      }
      float fbm(vec2 p) {
        return texture2D(uNoise, p * 0.125).r;
      }
      float fbmCyl(vec2 p, float period) {
        return texture2D(uNoise, vec2(p.x / period, p.y * 0.125)).r;
      }
    `;
		}
		_createWeldedRockGeometry(radius = .21) {
			const geo = new three.SphereGeometry(radius, 6, 5);
			const pos = geo.attributes.position;
			const dispMap = /* @__PURE__ */ new Map();
			const v = new three.Vector3();
			for (let i = 0; i < pos.count; i++) {
				v.fromBufferAttribute(pos, i);
				const key = `${Math.round(v.x * 1e3)},${Math.round(v.y * 1e3)},${Math.round(v.z * 1e3)}`;
				let sc = dispMap.get(key);
				if (sc === void 0) {
					const dir = v.clone().normalize();
					const n = Math.sin(dir.x * 5.2 + 1.1) * Math.cos(dir.y * 4.7 - .8) * Math.sin(dir.z * 6.1 + 2.3);
					sc = .7 + Math.abs(n) * .58;
					dispMap.set(key, sc);
				}
				const h = v.y / radius, taper = 1 - .58 * Math.max(0, h);
				pos.setXYZ(i, v.x * sc * taper + h * .12 * radius, v.y * sc * 1.25, v.z * sc * taper);
			}
			geo.computeVertexNormals();
			return this._trackGeo(geo);
		}
		setShape(options = {}) {
			if (!this._disposables || !options) return;
			const prev = this._shape;
			const width = options.pillarWidth === void 0 && prev ? prev.width : normalizeAmount(options.pillarWidth, 4, 2);
			const height = options.pillarHeight === void 0 && prev ? prev.height : normalizeAmount(options.pillarHeight);
			const diameter = options.circleDiameter === void 0 && prev ? prev.diameter : normalizeAmount(options.circleDiameter, 2, 2);
			if (prev && width === prev.width && height === prev.height && diameter === prev.diameter) return;
			this._shape = {
				width,
				height,
				diameter
			};
			this.circleShape.scale.set(diameter, 1, diameter);
			this.columnShape.scale.set(width, height, width);
			this.skyVortex.position.y = this.vortexBaseY * height;
			this.footSurges.scale.set(width, Math.min(width, height * 1.7), width);
			this.impactFan.scale.copy(this.footSurges.scale);
			if (this._lastU >= 0 && width !== prev?.width && this.debrisMesh.visible) this._updateFlyingShards(this._shardAge, this._shardFade);
		}
		_buildLayer01_GroundMagicCircle() {
			const geo = this._trackGeo(new three.PlaneGeometry(9.4, 9.4));
			geo.rotateX(-Math.PI * .5);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uMap: { value: this._groundCircleTex },
					uTime: { value: 0 },
					uOpacity: { value: 1 },
					uReveal: { value: 1 },
					uDissolve: { value: 0 }
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
        uniform float uTime;
        uniform float uOpacity;
        uniform float uReveal;
        uniform float uDissolve;
        varying vec2 vUv;
        ${this._glslNoise()}
        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          vec4 tex = texture2D(uMap, vUv);
          float revealMask = (1.0 - smoothstep(uReveal - 0.08, uReveal + 0.08, r));
          float n = fbm(vUv * 8.0 + vec2(uTime * 0.45, -uTime * 0.28));
          float dissolveMask = smoothstep(uDissolve - 0.15, uDissolve + 0.15, n);
          float pulse = 0.88 + 0.12 * sin(uTime * 4.5 - r * 7.0);
          float alpha = tex.a * revealMask * dissolveMask * uOpacity * pulse * 0.68;
          if (alpha < 0.01) discard;
          vec3 col = mix(vec3(0.68, 0.78, 0.96), vec3(0.92, 0.96, 1.0), tex.r);
          gl_FragColor = vec4(col * 0.88, alpha);
        }
      `
			}));
			this.groundCircle = new three.Mesh(geo, mat);
			this.groundCircle.position.y = .035;
			this.groundCircle.renderOrder = 2;
			this.group.add(this.groundCircle);
		}
		_buildLayer02_DarkCorePillar() {
			const geo = this._trackGeo(new three.CylinderGeometry(1.3, 1.46, 15.8, 32, 20, true));
			geo.translate(0, 7.9, 0);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: true,
				side: three.FrontSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uFootBlend: this._footBlend,
					uTime: { value: 0 },
					uOpacity: { value: 1 },
					uErode: { value: 0 },
					uIgnitionWhite: { value: 0 }
				},
				vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float angle = atan(pos.z, pos.x);
          float ripple = sin(pos.y * 1.15 - uTime * 9.0 + angle * 3.0) * 0.045
                       + cos(pos.y * 2.3 - uTime * 12.0 - angle * 2.0) * 0.025;
          float taper = smoothstep(0.0, 0.12, uv.y) * (1.0 - smoothstep(0.88, 1.0, uv.y));
          pos.xz += normalize(pos.xz) * ripple * taper;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity,uFootBlend;
        uniform float uErode,uIgnitionWhite;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        ${this._glslNoise()}
        void main() {
          float fresnel = 1.0 - max(dot(normalize(vNormalView), normalize(vViewDir)), 0.0);
          vec2 flowUv = vec2(vUv.x * 6.0, vUv.y * 6.0 - uTime * 3.0);
          float n1 = fbmCyl(flowUv, 6.0);
          float n2 = fbmCyl(vec2(vUv.x * 12.0, vUv.y * 10.0 - uTime * 4.8), 12.0);
          float wisp = smoothstep(0.35, 0.80, n1 * 0.65 + n2 * 0.45);

          vec3 voidCol = vec3(0.014, 0.016, 0.026);
          vec3 swirlCol = vec3(0.075, 0.088, 0.135);
          vec3 rimCol = vec3(0.95, 0.98, 1.0);

          vec3 col = mix(voidCol, swirlCol, wisp * 0.72);
          float rim = pow(fresnel, 2.55) * (0.78 + 0.32 * n2);
          col = mix(col, rimCol, smoothstep(0.40, 0.82, rim));
          float footHeat=1.-smoothstep(.035,.08+.19*n1+.10*n2,vUv.y);
          float tongues=smoothstep(.21,.78,n1*.65+n2*.50);
          col+=vec3(.95,.98,1.)*footHeat*(.88+.69*tongues);

          // The strike lights the shaft in one frame. Broken ink slits keep it
          // directional without drawing broad parallel stripes. Skip this
          // work completely in the sustained material.
          if(uIgnitionWhite>0.){
            float a=vUv.x*6.283185;
            float bend=1.72*sin(vUv.y*8.2+3.*a)+.81*sin(vUv.y*19.4-2.*a)+3.1*(n2-.5);
            float peak=.5+.5*cos(a*9.+bend);
            float slit=smoothstep(.68,.95,peak)*smoothstep(.23,.67,n1+.22*vUv.y);
            float hot=uIgnitionWhite*mix(.985,.23,slit*(1.-.68*footHeat));
            col=mix(col,vec3(1.,.985,1.),hot);
          }

          float erodeNoise = fbmCyl(vec2(vUv.x * 6.0, vUv.y * 4.5 - uTime * 2.0), 6.0);
          float erodeMask = smoothstep(uErode - 0.18, uErode + 0.12, erodeNoise + vUv.y * 0.35);
          float foot=smoothstep(.002+.012*n2,.043+.035*n1,vUv.y);
          float alpha = uOpacity * erodeMask * mix(1.,foot,uFootBlend);
          if (alpha < 0.02) discard;

          gl_FragColor = vec4(col, alpha);
        }
      `
			}));
			this.darkCore = new three.Mesh(geo, mat);
			this.darkCore.renderOrder = 3;
			this.group.add(this.darkCore);
		}
		_buildLayer03_CoreLightningVeins() {
			const geo = this._trackGeo(new three.CylinderGeometry(1.35, 1.51, 15.8, 32, 1, true));
			geo.translate(0, 7.9, 0);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.FrontSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uFootBlend: this._footBlend,
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity,uFootBlend;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        ${this._glslNoise()}
        void main() {
          float warp = fbmCyl(vec2(vUv.x * 6.0, vUv.y * 3.1 - uTime * 1.45), 6.0) * .62;
          float r1 = 1.0 - abs(pnoiseX(vec2(vUv.x * 8.0 + warp, vUv.y * 1.35 - uTime * 1.12), 8.0) * 2.0 - 1.0);
          float r2 = 1.0 - abs(pnoiseX(vec2(vUv.x * 16.0 - warp * 0.8, vUv.y * 2.3 - uTime * 1.65), 16.0) * 2.0 - 1.0);

          float veins = clamp(pow(r1, 16.0) + pow(r2, 18.0) * 0.72, 0.0, 1.0);
          float fresnel = 1.0 - max(dot(normalize(vNormalView), normalize(vViewDir)), 0.0);
          float edgeBoost = 0.35 + 1.05 * pow(fresnel, 1.25);
          float topFade = (1.0 - smoothstep(0.92, 1.0, vUv.y));
          float foot=smoothstep(.005,.068+.021*warp,vUv.y);
          float alpha = veins * (.35+.65*edgeBoost) * topFade * uOpacity * .44 * mix(1.,foot,uFootBlend);
          if (alpha < 0.015) discard;

          vec3 col = mix(vec3(0.76, 0.87, 1.0), vec3(1.0), clamp(veins * 1.8, 0.0, 1.0));
          gl_FragColor = vec4(col * 1.4, alpha);
        }
      `
			}));
			this.coreVeins = new three.Mesh(geo, mat);
			this.coreVeins.renderOrder = 4;
			this.group.add(this.coreVeins);
		}
		_buildLayer04_OuterEnergySheath() {
			const geo = this._trackGeo(new three.CylinderGeometry(1.86, 2.08, 15.8, 32, 18, true));
			geo.translate(0, 7.9, 0);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uFootBlend: this._footBlend,
					uTime: { value: 0 },
					uOpacity: { value: 1 },
					uErode: { value: 0 }
				},
				vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float ang = atan(pos.z, pos.x);
          float wave = sin(pos.y * 1.5 - uTime * 10.5 + ang * 4.0) * 0.08;
          pos.xz += normalize(pos.xz) * wave;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          vNormalView = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity,uFootBlend;
        uniform float uErode;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewDir;
        ${this._glslNoise()}
        void main() {
          // Strong silhouette rim band: transparent across center front so black core stays pitch-black!
          float ndotv = abs(dot(normalize(vNormalView), normalize(vViewDir)));
          float rimBand = (1.0 - smoothstep(0.16, 0.60, ndotv)) * smoothstep(0.0, 0.12, ndotv);

          float f1 = fbmCyl(vec2(vUv.x * 8.0, vUv.y * 4.2 - uTime * 4.4), 8.0);
          float f2 = fbmCyl(vec2(vUv.x * 16.0, vUv.y * 7.8 - uTime * 6.8), 16.0);
          float streaks = smoothstep(0.22, 0.76, f1 * 0.62 + f2 * 0.58);

          float erode = smoothstep(uErode - 0.15, uErode + 0.15, f1 + vUv.y * 0.25);
          float baseBoost = 1.0 + (1.0 - smoothstep(0.0, 0.22, vUv.y)) * 0.65;
          float foot=smoothstep(.006+.012*f2,.055+.034*f1,vUv.y);
          float alpha = rimBand * (0.52 + 0.88 * streaks) * erode * baseBoost * uOpacity * mix(1.,foot,uFootBlend);
          if (alpha < 0.01) discard;

          vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0), smoothstep(0.32, 0.82, streaks));
          gl_FragColor = vec4(col * 1.42, clamp(alpha, 0.0, 1.0));
        }
      `
			}));
			this.outerSheath = new three.Mesh(geo, mat);
			this.outerSheath.renderOrder = 5;
			this.group.add(this.outerSheath);
		}
		_buildLayer05_RisingEnergyPlumes() {
			const plumeCount = 10;
			const subGeos = [];
			for (let i = 0; i < plumeCount; i++) {
				const segs = 16;
				const height = 12 + i % 3 * 2.2;
				const baseAngle = i / plumeCount * Math.PI * 2;
				const radiusBase = 1.72 + i % 2 * .24;
				const twist = (i % 2 === 0 ? 1 : -1) * (.28 + i % 3 * .12);
				const halfWidthBase = .42 + i % 3 * .1;
				const positions = [];
				const uvs = [];
				const indices = [];
				for (let s = 0; s <= segs; s++) {
					const v = s / segs;
					const y = v * height;
					const ang = baseAngle + v * twist;
					const r = radiusBase + Math.sin(v * Math.PI) * .24 - v * .14;
					const hw = halfWidthBase * (1 - v * .68) * (.72 + .28 * Math.sin(v * Math.PI));
					const cx = Math.cos(ang) * r;
					const cz = Math.sin(ang) * r;
					const tx = -Math.sin(ang);
					const tz = Math.cos(ang);
					positions.push(cx - tx * hw, y, cz - tz * hw);
					positions.push(cx + tx * hw, y, cz + tz * hw);
					uvs.push(0, v, 1, v);
					if (s < segs) {
						const row = s * 2;
						indices.push(row, row + 1, row + 2, row + 1, row + 3, row + 2);
					}
				}
				const geo = new three.BufferGeometry();
				geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
				geo.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
				geo.setIndex(indices);
				geo.computeVertexNormals();
				subGeos.push(geo);
			}
			const mergedGeo = this._mergeIndexedGeometries(subGeos);
			this.plumeMat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        varying vec2 vUv;
        varying vec3 vRadialView;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec3 radial = normalize(vec3(position.x, 0.0, position.z));
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vRadialView = normalize((modelViewMatrix * vec4(radial, 0.0)).xyz);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vRadialView;
        varying vec3 vViewDir;
        ${this._glslNoise()}
        void main() {
          // Attenuate ribbons crossing directly in front of the black core center; blaze on left/right flanks!
          float frontAlign = abs(dot(normalize(vRadialView), normalize(vViewDir)));
          float flankMask = (1.0 - smoothstep(0.28, 0.86, frontAlign));

          float center = 1.0 - abs(vUv.x * 2.0 - 1.0);
          float n = fbm(vec2(vUv.x * 3.5, vUv.y * 5.2 - uTime * 5.4));
          float n2 = fbm(vec2(vUv.x * 7.0 + 2.0, vUv.y * 9.0 - uTime * 8.0));
          float shape = center * (0.55 + 0.78 * n) - (1.0 - n2) * 0.22;
          float mask = smoothstep(0.18, 0.54, shape);
          float vFade = smoothstep(0.0, 0.10, vUv.y) * (1.0 - smoothstep(0.72, 1.0, vUv.y));
          float alpha = mask * vFade * flankMask * uOpacity * 0.92;
          if (alpha < 0.015) discard;
          vec3 col = mix(vec3(0.75, 0.86, 1.0), vec3(1.0), smoothstep(0.45, 0.85, shape));
          gl_FragColor = vec4(col * 1.35, alpha);
        }
      `
			}));
			this.plumeMesh = new three.Mesh(mergedGeo, this.plumeMat);
			this.plumeMesh.renderOrder = 6;
			this.group.add(this.plumeMesh);
		}
		_buildLayer06_FloatingRuneRings() {
			const configs = [
				{
					y: 11.4,
					radius: 4.55,
					speed: .34,
					delay: .08
				},
				{
					y: 7,
					radius: 4.2,
					speed: -.44,
					delay: .04
				},
				{
					y: 2.8,
					radius: 5.35,
					speed: .28,
					delay: 0
				}
			];
			this.runeRings = [];
			configs.forEach((cfg) => {
				const geo = this._trackGeo(new three.PlaneGeometry(cfg.radius * 2, cfg.radius * 2));
				geo.rotateX(-Math.PI * .5);
				const mat = this._trackMat(new three.ShaderMaterial({
					transparent: true,
					depthWrite: false,
					side: three.DoubleSide,
					uniforms: {
						uNoise: { value: this._noiseTex },
						uMap: { value: this._runeRingTex },
						uTime: { value: 0 },
						uOpacity: { value: 1 },
						uDissolve: { value: 0 }
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
          uniform float uTime;
          uniform float uOpacity;
          uniform float uDissolve;
          varying vec2 vUv;
          ${this._glslNoise()}
          void main() {
            vec4 tex = texture2D(uMap, vUv);
            if (tex.a < 0.02) discard;
            float n = fbm(vUv * 9.0 + vec2(uTime * 0.38, -uTime * 0.28));
            float diss = smoothstep(uDissolve - 0.15, uDissolve + 0.15, n);
            float shimmer = 0.94 + 0.10 * sin(uTime * 5.5 + atan(vUv.y - 0.5, vUv.x - 0.5) * 6.0);
            float lum = max(tex.r, max(tex.g, tex.b));
            vec3 col = mix(tex.rgb, tex.rgb * 1.55 * shimmer, smoothstep(0.30, 0.82, lum));
            float alpha = tex.a * diss * uOpacity;
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(col, alpha);
          }
        `
				}));
				const mesh = new three.Mesh(geo, mat);
				mesh.position.y = cfg.y;
				mesh.renderOrder = 7;
				this.group.add(mesh);
				this.runeRings.push({
					mesh,
					mat,
					cfg
				});
			});
		}
		_buildLayer07_RuneRingInnerHalo() {
			this.ringHalos = [];
			[
				{
					y: 11.38,
					innerR: 2.4,
					outerR: 4.9,
					delay: .08
				},
				{
					y: 6.98,
					innerR: 2.2,
					outerR: 4.55,
					delay: .04
				},
				{
					y: 2.78,
					innerR: 2.7,
					outerR: 5.75,
					delay: 0
				}
			].forEach((cfg) => {
				const geo = this._trackGeo(new three.RingGeometry(cfg.innerR, cfg.outerR, 44, 1));
				geo.rotateX(-Math.PI * .5);
				const mat = this._trackMat(new three.ShaderMaterial({
					transparent: true,
					depthWrite: false,
					blending: three.AdditiveBlending,
					side: three.DoubleSide,
					uniforms: {
						uTime: { value: 0 },
						uOpacity: { value: 1 },
						uInnerR: { value: cfg.innerR },
						uOuterR: { value: cfg.outerR }
					},
					vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
					fragmentShader: `
          uniform float uTime;
          uniform float uOpacity;
          uniform float uInnerR;
          uniform float uOuterR;
          varying vec3 vPos;
          void main() {
            float r = length(vPos.xz);
            float t = clamp((r - uInnerR) / (uOuterR - uInnerR), 0.0, 1.0);
            float band = exp(-pow((t - 0.78) * 5.0, 2.0));
            float ang = atan(vPos.z, vPos.x);
            float pulse = 0.84 + 0.16 * sin(ang * 4.0 + uTime * 3.0);
            float alpha = band * pulse * uOpacity * 0.40;
            if (alpha < 0.005) discard;
            gl_FragColor = vec4(vec3(0.84, 0.91, 1.0), alpha);
          }
        `
				}));
				const mesh = new three.Mesh(geo, mat);
				mesh.position.y = cfg.y;
				mesh.renderOrder = 6;
				this.group.add(mesh);
				this.ringHalos.push({
					mesh,
					mat,
					cfg
				});
			});
		}
		_buildLayer09_BaseGroundShockwave() {
			this.shockwaves = [];
			for (let i = 0; i < 3; i++) {
				const geo = this._trackGeo(new three.RingGeometry(.55, 1, 44, 1));
				geo.rotateX(-Math.PI * .5);
				const mat = this._trackMat(new three.ShaderMaterial({
					transparent: true,
					depthWrite: false,
					blending: three.AdditiveBlending,
					side: three.DoubleSide,
					uniforms: {
						uOpacity: { value: 0 },
						uSoftness: { value: .2 }
					},
					vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
					fragmentShader: `
          uniform float uOpacity;
          uniform float uSoftness;
          varying vec3 vPos;
          void main() {
            float r = length(vPos.xz);
            float t = clamp((r - 0.55) / 0.45, 0.0, 1.0);
            float ring = smoothstep(0.0, 0.35 + uSoftness, t) * (1.0 - smoothstep(0.72 - uSoftness * 0.3, 1.0, t));
            float alpha = ring * uOpacity;
            if (alpha < 0.005) discard;
            vec3 col = mix(vec3(0.72, 0.84, 1.0), vec3(1.0), smoothstep(0.5, 0.9, t));
            gl_FragColor = vec4(col * 1.2, alpha);
          }
        `
				}));
				const mesh = new three.Mesh(geo, mat);
				mesh.position.y = .05 + i * .015;
				mesh.renderOrder = 5;
				this.group.add(mesh);
				this.shockwaves.push({
					mesh,
					mat,
					offset: i * .14
				});
			}
		}
		_buildLayer10_SkyStormVortex() {
			const geo = new three.PlaneGeometry(30, 30, 12, 12);
			geo.rotateX(Math.PI * .5);
			const p = geo.attributes.position;
			for (let i = 0; i < p.count; i++) {
				const x = p.getX(i), z = p.getZ(i);
				const r = Math.sqrt(x * x + z * z) / 15;
				p.setY(i, -Math.pow(r, 1.6) * 2.8);
			}
			geo.computeVertexNormals();
			this._trackGeo(geo);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        ${this._glslNoise()}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);

          float swirl = ang + 4.2 * exp(-r * 1.7) - uTime * 1.2;
          vec2 sp = vec2(cos(swirl), sin(swirl)) * r;
          float n1 = fbm(sp * 4.0 + vec2(uTime * 0.22, -uTime * 0.18));
          float n2 = fbm(vec2(swirl * 2.5, r * 7.5 - uTime * 1.5));

          float cloud = smoothstep(0.14, 0.84, n1 * 0.52 + n2 * 0.58);
          float outerFade = (1.0 - smoothstep(0.32, 1.0, r));
          float innerGlow = (1.0 - smoothstep(0.10, 0.46, r));
          float spiralRim = (1.0 - smoothstep(0.20, 0.75, r)) * smoothstep(0.35, 0.78, n2) * 0.45;

          vec3 darkCloud = vec3(0.075, 0.088, 0.14);
          vec3 stormHighlight = vec3(0.36, 0.40, 0.52);
          vec3 silverCore = vec3(0.92, 0.96, 1.0);

          vec3 col = mix(darkCloud, stormHighlight, cloud * 0.65 + spiralRim);
          col = mix(col, silverCore, clamp(innerGlow * 0.92 + cloud * innerGlow * 0.55, 0.0, 1.0));

          float alpha = (cloud * 0.85 + innerGlow * 0.65) * outerFade * uOpacity;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col * 1.18, clamp(alpha, 0.0, 0.96));
        }
      `
			}));
			this.skyVortex = new three.Mesh(geo, mat);
			this.skyVortex.position.y = 16;
			this.skyVortex.renderOrder = 2;
			this.group.add(this.skyVortex);
		}
		_buildLayer11_VerticalLightStreaks() {
			const count = 48;
			const geo = this._trackGeo(new three.PlaneGeometry(.15, 3));
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide,
				uniforms: { uOpacity: { value: 1 } },
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float dx = 1.0 - abs(vUv.x * 2.0 - 1.0);
          float dy = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.55, 1.0, vUv.y));
          float alpha = pow(dx, 1.8) * dy * uOpacity;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vec3(0.92, 0.96, 1.0) * 1.35, alpha);
        }
      `
			}));
			this.streaksMesh = new three.InstancedMesh(geo, mat, count);
			this.streaksMesh.frustumCulled = false;
			this.streaksMesh.renderOrder = 8;
			this.streakData = [];
			for (let i = 0; i < count; i++) this.streakData.push({
				angle: this._rand() * Math.PI * 2,
				radius: 1.75 + this._rand() * 1.65,
				speed: 7 + this._rand() * 9.5,
				phase: this._rand(),
				lenScale: .7 + this._rand() * 1.35,
				widthScale: .65 + this._rand() * 1.15
			});
			this.group.add(this.streaksMesh);
		}
		_buildFootSurges() {
			const positions = [], uvs = [], roles = [], slots = [], indices = [];
			const segments = 52, rows = 4;
			for (let slot = 0; slot < 6; slot++) {
				const first = positions.length / 3;
				for (let i = 0; i <= segments; i++) for (let j = 0; j <= rows; j++) {
					const u = i / segments, v = j / rows;
					positions.push(u, v, 0);
					uvs.push(u, v);
					roles.push(Math.floor(slot / 2));
					slots.push(slot);
					if (i && j) {
						const d = first + i * 5 + j, c = d - 1, b = d - rows - 1, a = b - 1;
						indices.push(a, b, d, a, d, c);
					}
				}
			}
			const geometry = this._trackGeo(new three.BufferGeometry());
			for (const [name, data, size] of [
				[
					"position",
					positions,
					3
				],
				[
					"uv",
					uvs,
					2
				],
				[
					"role",
					roles,
					1
				],
				[
					"slot",
					slots,
					1
				]
			]) geometry.setAttribute(name, new three.Float32BufferAttribute(data, size));
			geometry.setIndex(indices);
			geometry.boundingSphere = new three.Sphere(new three.Vector3(), 7);
			this._strokeStates = Array.from({ length: 6 }, () => new three.Vector4());
			const material = this._trackMat(new three.ShaderMaterial({
				side: three.DoubleSide,
				depthTest: true,
				depthWrite: true,
				alphaToCoverage: true,
				uniforms: {
					strokes: { value: this._strokeStates },
					noiseLut: { value: this._noiseTex }
				},
				vertexShader: `
        attribute float role,slot;
        uniform vec4 strokes[6];
        varying vec2 brush;varying vec3 phase;
        void main(){
          vec4 state=strokes[int(slot+.5)];
          float head=state.x,tail=state.y,body=state.z,seed=state.w;
          float u=mix(tail,head,uv.x),v=uv.y;
          float start=role<.5?2.84:(role<1.5?.47:4.62);
          float span=role<.5?1.90:(role<1.5?1.42:1.17);
          float ang=start-span*u+.14*sin(seed+u*6.)+.09*sin(seed*1.7);
          float belly=pow(max(0.,sin(3.14159265*uv.x)),.72);
          float flip=smoothstep(.55,1.,u);
          float torn=sin(17.*u+seed)*.06+sin(33.*u+seed)*.025;
          float breadth=(role<.5?.55:.40)*belly*body*(1.+torn);
          float radius=1.25+.64*u+1.27*flip+.27*sin(3.14159*u)+breadth*(v-.23);
          float lift=(role<.5?1.48:(role<1.5?2.24:1.08))*pow(flip,1.62)*body;
          float h=.08+.19*belly+lift+breadth*(v*(.25+.75*flip)+.19*sin(3.14159*v));
          brush=uv;phase=vec3(seed,body,u);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(radius*cos(ang),h,radius*sin(ang),1.);
        }`,
				fragmentShader: `
        uniform sampler2D noiseLut;
        varying vec2 brush;varying vec3 phase;
        void main(){
          float u=brush.x,v=brush.y,seed=phase.x,body=phase.y;
          vec2 noise=texture2D(noiseLut,vec2(phase.z*.63+seed*.18,v*.58+seed*.12)).rb;
          float edge=v+(noise.x-.5)*.23+.035*sin(u*24.+seed);
          float taper=sin(3.14159*u);
          float limit=max(.0,taper)*body;
          float silhouette=min(edge-.08,.95-edge)*limit-(1.-limit)*.064;
          silhouette-=.20*(1.-smoothstep(.25,.62,phase.z));
          // Elongated gaps run with the flow and open progressively towards the tail.
          float rake=abs(sin(edge*19.+noise.y*2.9+sin(u*8.+seed)*.75));
          float slit=rake+.40*(1.-smoothstep(.33,.96,u))-.31*noise.x-.23*(1.-body);
          float mask=min(silhouette,slit);
          if(body<.008||mask<=0.)discard;
          float coverage=smoothstep(0.,max(.0005,fwidth(mask)),mask);
          float fleck=smoothstep(.48,.76,noise.x+.08*sin(u*13.+seed));
          float reflected=(1.-smoothstep(.07,.27,edge))*fleck*(1.-smoothstep(.40,.87,phase.z));
          vec3 ink=mix(vec3(.007,.009,.014),vec3(.063,.073,.095),noise.y*.72+.16*v);
          gl_FragColor=vec4(ink+vec3(.28,.32,.39)*reflected,coverage);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			this.footSurges = new three.Mesh(geometry, material);
			this.footSurges.name = "dark-pillar-foot-surges";
			this.group.add(this.footSurges);
		}
		_buildIgnitionBurst() {
			const group = new three.Group();
			group.name = "dark-pillar-ignition";
			const uniforms = {
				age: { value: 0 },
				white: { value: 0 },
				grain: { value: this._noiseTex }
			};
			this._ignition = uniforms;
			const strips = [], patchUV = [], patchIDs = [], tri = [];
			for (let id = 0; id < 11; id++) {
				const first = strips.length / 3;
				for (let j = 0; j <= 10; j++) for (let k = 0; k < 4; k++) {
					const u = j / 10, v = k / 3;
					strips.push(u, v, 0);
					patchUV.push(u, v);
					patchIDs.push(id);
					if (j && k) {
						const d = first + j * 4 + k;
						tri.push(d - 5, d - 4, d, d - 5, d, d - 1);
					}
				}
			}
			const sg = this._trackGeo(new three.BufferGeometry());
			sg.setIndex(tri);
			for (const [key, data, size] of [
				[
					"position",
					strips,
					3
				],
				[
					"uv",
					patchUV,
					2
				],
				[
					"patchId",
					patchIDs,
					1
				]
			]) sg.setAttribute(key, new three.Float32BufferAttribute(data, size));
			sg.boundingSphere = new three.Sphere(new three.Vector3(), 8);
			const shock = this._trackMat(new three.ShaderMaterial({
				uniforms,
				transparent: true,
				depthWrite: false,
				forceSinglePass: true,
				blending: three.AdditiveBlending,
				side: three.DoubleSide,
				vertexShader: `attribute float patchId;uniform float age;varying vec2 st;varying float seed;
        void main(){float id=patchId;seed=fract(id*.618034+.23);float u=uv.x,v=uv.y;
          float a=id*2.399963+(u-.5)*(.33+.48*seed);
          float arc=pow(max(0.,sin(3.14159*u)),.67);
          float travel=1.-pow(1.-clamp(age/(.33+.075*seed),0.,1.),2.);
          float front=1.58+(.58+.42*seed)*4.74*travel+.32*arc+.21*sin(3.*u+id);
          float r=front-(1.-v)*(.23+.95*arc);
          float y=.07+arc*(.25+.65*seed+1.35*sin(3.14159*travel))*(.30+.70*v)+.29*u*seed;
          st=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(r*cos(a),y,r*sin(a),1.);}`,
				fragmentShader: `uniform float age;uniform sampler2D grain;varying vec2 st;varying float seed;
        void main(){float u=st.x,v=st.y,n=texture2D(grain,vec2(u*.73+seed,v*.37-age*.29)).r;
          float ends=smoothstep(.025,.24,u)*(1.-smoothstep(.75,.97,u));
          float stripe=1.-smoothstep(.035,.33,abs(v-.64-.23*(n-.5)));
          float life=smoothstep(.025,.083,age)*(1.-smoothstep(.12,.42,age));
          float alpha=ends*stripe*life*smoothstep(.19,.48,n+seed*.17);
          if(alpha<.009)discard;
          gl_FragColor=vec4(mix(vec3(.21,.13,.82),vec3(.80,.91,1.),stripe*n),alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const front = new three.Mesh(sg, shock);
			front.renderOrder = 10;
			group.add(front);
			const haloGeo = this._trackGeo(new three.PlaneGeometry(2, 2));
			haloGeo.boundingSphere = new three.Sphere(new three.Vector3(), 9);
			const haloMat = this._trackMat(new three.ShaderMaterial({
				uniforms,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				vertexShader: `varying vec2 st;
        void main(){st=position.xy;
          vec4 c=modelViewMatrix*vec4(0.,.62,0.,1.);
          float w=length(modelMatrix[0].xyz),h=length(modelMatrix[1].xyz);
          c.z+=min(1.59*w,-c.z*.27);
          c.xy+=vec2(position.x*6.6*w,position.y*(position.y<0.?2.00:3.20)*h);
          gl_Position=projectionMatrix*c;}`,
				fragmentShader: `uniform float age,white;varying vec2 st;
        void main(){float r=length(st),heat=exp(-r*r*15.5),atmos=exp(-r*r*4.1);
          float edge=1.-smoothstep(.76,.995,r);
          float fade=1.-smoothstep(.018,.164,age);
          float core=heat*white;
          vec3 c=mix(vec3(.28,.23,.91),vec3(.50,.69,1.),smoothstep(.10,.66,atmos));
          c=mix(c,vec3(1.),smoothstep(.04,.57,core));
          float alpha=(1.10*heat+.54*atmos)*fade*edge;
          if(alpha<.003)discard;gl_FragColor=vec4(c,min(1.,alpha));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			this.ignitionHalo = new three.Mesh(haloGeo, haloMat);
			this.ignitionHalo.renderOrder = 12;
			group.add(this.ignitionHalo);
			const xyz = [], sides = [], ids = [], ix = [];
			for (let id = 0; id < 30; id++) {
				const a = id * 2.399963, seed = Math.sin(id * 7.14) * .5 + .5;
				const dx = Math.cos(a), dz = Math.sin(a), reach = 1.65 + seed * 2.4;
				const rise = .38 + 1.9 * (.5 + .5 * Math.cos(id * 3.11 + .7)) + (id % 6 === 0 ? 1.05 : 0);
				const start = xyz.length / 3;
				for (let k = 0; k < 5; k++) for (let j = 0; j < 2; j++) {
					const u = k / 4, v = j * 2 - 1, w = (.12 + .22 * seed) * (1 - u) * (.73 + .5 * Math.sin(Math.PI * u));
					const r = .94 + reach * u;
					xyz.push(dx * r - dz * v * w, .06 + rise * u + .3 * Math.sin(Math.PI * u), dz * r + dx * v * w);
					sides.push(u, v);
					ids.push(id, seed);
					if (k && j) {
						let b = start + k * 2;
						ix.push(b - 2, b - 1, b, b, b - 1, b + 1);
					}
				}
			}
			const g = this._trackGeo(new three.BufferGeometry());
			g.setIndex(ix);
			for (const [key, data, size] of [
				[
					"position",
					xyz,
					3
				],
				[
					"stroke",
					sides,
					2
				],
				[
					"ray",
					ids,
					2
				]
			]) g.setAttribute(key, new three.Float32BufferAttribute(data, size));
			g.boundingSphere = new three.Sphere(new three.Vector3(), 9);
			const jets = this._trackMat(new three.ShaderMaterial({
				uniforms,
				transparent: true,
				forceSinglePass: true,
				side: three.DoubleSide,
				depthWrite: false,
				blending: three.AdditiveBlending,
				vertexShader: `attribute vec2 ray,stroke;uniform float age;varying vec2 st;varying float seed;
        void main(){st=stroke;seed=ray.y;float flight=1.-pow(1.-clamp(age/(.20+.14*seed),0.,1.),2.);
          vec3 p=position;float a=ray.x*2.399963;
          p.xz*=.82+.26*flight;p.xz+=vec2(cos(a),sin(a))*flight*(.7+1.8*seed);
          p.y*=.72+.44*flight;p.y+=sin(3.14159*flight)*(.24+.42*seed);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
				fragmentShader: `uniform float age,white;varying vec2 st;varying float seed;
        void main(){float left=1.-smoothstep(.085+.03*seed,.22+.14*seed,age);
          float edge=1.-smoothstep(.20,1.,abs(st.y));float tail=smoothstep(-.06,.05+age*.85,st.x);
          float a=left*tail*(.34+.66*edge);if(a<.01)discard;
          gl_FragColor=vec4(mix(vec3(.30,.32,1.),vec3(1.),clamp(white*.89+.57*edge,0.,1.)),a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const tongues = new three.Mesh(g, jets);
			tongues.renderOrder = 11;
			group.add(tongues);
			this.ignitionFront = front;
			this.ignitionTongues = tongues;
			return group;
		}
		_buildRuptureAftershock() {
			const group = new three.Group();
			group.name = "dark-pillar-rupture-aftershock";
			const materialTime = { age: this._ignition.age };
			const noise = (i) => {
				const n = Math.sin(i * 127.1 + 19.7) * 43758.5453;
				return n - Math.floor(n);
			};
			const polar = (r, a, y) => [
				r * Math.cos(a),
				y,
				r * Math.sin(a)
			];
			const xyz = [], tangents = [], styles = [], uv = [], indices = [];
			const ribbon = (points, kind, seed, delay, width, from = 0, to = 1) => {
				const start = xyz.length / 3;
				for (let i = 0; i < points.length; i++) {
					const p = points[i], lo = points[Math.max(0, i - 1)], hi = points[Math.min(i + 1, points.length - 1)];
					for (let side = 0; side < 2; side++) {
						xyz.push(...p);
						tangents.push(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
						styles.push(kind, seed, delay, width);
						uv.push(from + (to - from) * i / (points.length - 1), side * 2 - 1);
					}
					if (i) {
						const k = start + i * 2;
						indices.push(k - 2, k - 1, k, k, k - 1, k + 1);
					}
				}
			};
			const path = (steps, f) => Array.from({ length: steps + 1 }, (_, j) => f(j / steps, j));
			const directions = [
				.22,
				2.68,
				4.64
			];
			for (let i = 0; i < 15; i++) {
				const seed = noise(i + 1), a = directions[i % 3] + (noise(i + 29) - .5) * 1.05;
				const length = 3.75 + 2.55 * seed + (i % 5 === 0 ? 1.1 : 0), delay = .025 + noise(i + 13) * .073;
				const pts = path(11, (u, j) => polar(1.05 + length * u, a + (noise(i * 37 + j) - .5) * .29 * Math.sin(Math.PI * u), .095 + (i % 4 === 0 ? 1.2 : .34) * Math.sin(Math.PI * u) + .24 * noise(i * 21 + j) * u));
				ribbon(pts, 0, seed, delay, .13 + .1 * seed);
				for (const j of [4, 7]) {
					const fork = pts[j], b = a + (j === 4 ? -.64 : .69), len = 1.2 + 1 * noise(i + j);
					ribbon(path(4, (u, k) => [
						fork[0] + len * u * Math.cos(b) - .22 * Math.sin(b) * Math.sin(k * 2),
						fork[1] + .23 * Math.sin(Math.PI * u),
						fork[2] + len * u * Math.sin(b) + .22 * Math.cos(b) * Math.sin(k * 2)
					]), 0, seed, delay, .085, j / 11, j / 11 + .27);
				}
			}
			for (let i = 0; i < 10; i++) {
				const seed = noise(i + 70), a = i * 2.39996, span = .38 + .76 * seed, outer = i % 2, delay = .085 + outer * .145 + .07 * seed;
				ribbon(path(32, (u) => polar((outer ? 6.05 : 4.55) + .9 * seed + .24 * Math.sin(u * 7 + i), a + span * (u - .5), .17 + (.48 + 1.1 * seed) * Math.pow(Math.sin(Math.PI * u), .8) + u * .6)), 1, seed, delay, .18 + .22 * seed);
			}
			for (let i = 0; i < 38; i++) {
				const seed = noise(i + 120), a = directions[i % 3] + (noise(i + 170) - .5) * 1.38;
				const span = 2.6 + seed * 3.7, apex = .9 + 3.6 * noise(i + 201), delay = .035 + noise(i + 240) * .22;
				ribbon(path(15, (u) => polar(1.05 + span * u, a + .15 * Math.sin(Math.PI * u) * Math.sin(i), .15 + .55 * u + apex * 4 * u * (1 - u))), 2, seed, delay, .054 + .115 * seed);
			}
			for (let i = 0; i < 23; i++) {
				const seed = noise(i + 280), a = i * 2.39996 + .22 * seed, reach = 3.9 + 3.05 * seed, rise = .24 + 2.4 * noise(i + 320);
				ribbon([
					polar(1.05, a, .21),
					polar(1.4 + reach * .32, a, .28 + rise * .32),
					polar(reach, a + .018 * seed, rise)
				], 3, seed, 0, .09 + .14 * seed);
			}
			const g = this._trackGeo(new three.BufferGeometry());
			for (const [name, values, size] of [
				[
					"position",
					xyz,
					3
				],
				[
					"pathTangent",
					tangents,
					3
				],
				[
					"style",
					styles,
					4
				],
				[
					"uv",
					uv,
					2
				]
			]) g.setAttribute(name, new three.Float32BufferAttribute(values, size));
			g.setIndex(indices);
			g.boundingSphere = new three.Sphere(new three.Vector3(0, 2, 0), 13);
			const energy = this._trackMat(new three.ShaderMaterial({
				uniforms: materialTime,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				forceSinglePass: true,
				blending: three.AdditiveBlending,
				vertexShader: `attribute vec3 pathTangent;attribute vec4 style;uniform float age;
        varying vec4 data;varying vec2 stroke;
        void main(){
          float kind=style.x,s=style.y,t=age-style.z,u=uv.x,extent=1.,rotation=0.;
          // Before its launch a ribbon's fragment shader discards every pixel.
          if(t<0.){stroke=vec2(0.);data=vec4(0.);gl_Position=vec4(2.,0.,0.,1.);return;}
          vec3 p=position,dir=pathTangent;
          if(kind>.5&&kind<1.5){
            float k=clamp(t/(.70+.18*s),0.,1.);extent=.43+.65*(1.-pow(1.-k,2.));
            rotation=(s>.5?1.:-1.)*(.05+1.04*k);p.y+=.44*sin(k*3.14159);
          }else if(kind>2.5){extent=1.+1.6*min(.22,max(t,0.));}
          mat2 spin=mat2(cos(rotation),sin(rotation),-sin(rotation),cos(rotation));
          p.xz=spin*p.xz*extent;dir.xz=spin*dir.xz*extent;
          vec4 mv=modelViewMatrix*vec4(p,1.);vec3 d=mat3(modelViewMatrix)*dir;
          vec2 v=d.xy-d.z*mv.xy/min(-.01,mv.z);vec2 normal=vec2(-v.y,v.x)/max(length(v),.0001);
          float taper=kind>2.5?mix(1.,.04,u):kind>.5&&kind<1.5?(.06+.94*sin(3.14159*u)):.74;
          float scale=sqrt(length(modelMatrix[0].xyz)*length(modelMatrix[1].xyz));
          mv.xy+=normal*uv.y*style.w*taper*scale;
          stroke=uv;data=vec4(kind,s,t,age);gl_Position=projectionMatrix*mv;
        }`,
				fragmentShader: `varying vec4 data;varying vec2 stroke;
        void main(){
          float kind=data.x,s=data.y,t=data.z,u=stroke.x,v=abs(stroke.y);
          if(t<0.)discard;
          float k,fade,head,core=1.-smoothstep(.03,.28,v),bloom=pow(max(0.,1.-v),1.45);
          vec3 color=mix(vec3(.20,.085,.90),vec3(.075,.52,1.),s);
          if(kind<.5){head=clamp(t/(.10+.12*s),0.,1.);
            fade=smoothstep(-.009,.025,head-u)*(1.-smoothstep(.12+u*.12,.48+u*.24,t));
            color=mix(color,vec3(.84,.91,1.),.80*core);
          }else if(kind<1.5){k=t/(.70+.18*s);
            fade=smoothstep(0.,.14,k)*(1.-smoothstep(.36,1.,k))*smoothstep(.005,.19,u)*(1.-smoothstep(.72,1.,u));
            float seam=1.-smoothstep(.025,.19,abs(v-.56));color+=seam*vec3(.31,.45,.64);
          }else if(kind<2.5){head=t/(.49+.35*s);float tail=head-u;
            fade=smoothstep(-.016,.009,tail)*(1.-smoothstep(.021,.19,tail))*(1.-smoothstep(.77,1.13,head));
            color=mix(color,vec3(.86,.81,1.),core*(1.-smoothstep(.008,.11,tail)));
          }else{fade=(1.-smoothstep(.025,.18+.055*s,t))*smoothstep(.12+t*1.9,.46+t*1.9,u)*(1.-smoothstep(.85,1.,u));
            color=mix(color,vec3(.92,.93,1.),.90*core);}
          float alpha=fade*(bloom+.44*core);if(alpha<.008)discard;
          gl_FragColor=vec4(color,min(1.,alpha));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const waves = new three.Mesh(g, energy);
			waves.name = "dark-pillar-rupture-light";
			waves.renderOrder = 9;
			group.add(waves);
			const positions = [], faces = [], launch = [], shape = [];
			let firstLaunch = Infinity, lastExpiry = 0;
			for (let id = 0; id < 53; id++) {
				const s = noise(id + 384), a = directions[id % 3] + (noise(id + 402) - .5) * 1.53;
				const major = id < 11, wide = (major ? .16 : .048) + (major ? .17 : .095) * s;
				const long = wide * (1.5 + 2.1 * noise(id + 413)), speed = 3.5 + 6.1 * noise(id + 431);
				const vy = (major ? 5.8 : 3.5) + 5.8 * noise(id + 457), delay = .012 + .18 * noise(id + 489);
				firstLaunch = Math.min(firstLaunch, delay);
				lastExpiry = Math.max(lastExpiry, delay + 1.2);
				const corners = [
					[
						0,
						long,
						0
					],
					[
						0,
						-.75 * long,
						0
					],
					[
						-wide,
						-.1 * long,
						.15 * wide
					],
					[
						wide * .24,
						-.17 * long,
						wide * .77
					],
					[
						wide,
						.16 * long,
						-.12 * wide
					],
					[
						-.16 * wide,
						.1 * long,
						-wide * .71
					]
				];
				for (let j = 0; j < 4; j++) for (let side = 0; side < 2; side++) {
					const v = 2 + j, next = 2 + (j + 1) % 4, facet = side ? [
						1,
						v,
						next
					] : [
						0,
						next,
						v
					];
					for (const k of facet) {
						positions.push(...corners[k]);
						faces.push(j + side * .48);
						launch.push(a, speed, vy, delay);
						shape.push(s, id);
					}
				}
			}
			const chips = this._trackGeo(new three.BufferGeometry());
			for (const [name, values, size] of [
				[
					"position",
					positions,
					3
				],
				[
					"face",
					faces,
					1
				],
				[
					"launch",
					launch,
					4
				],
				[
					"piece",
					shape,
					2
				]
			]) chips.setAttribute(name, new three.Float32BufferAttribute(values, size));
			chips.boundingSphere = new three.Sphere(new three.Vector3(0, 3, 0), 15);
			const basalt = this._trackMat(new three.ShaderMaterial({
				uniforms: materialTime,
				side: three.DoubleSide,
				vertexShader: `attribute float face;attribute vec4 launch;attribute vec2 piece;uniform float age;
        varying vec4 facets;
        void main(){float t=max(0.,age-launch.w),s=piece.x,id=piece.y,a=launch.x;
          // These triangles would otherwise all collapse to a single point.
          if(age<=launch.w||t>=1.20){facets=vec4(0.);gl_Position=vec4(2.,0.,0.,1.);return;}
          float r=1.13+.67*s+launch.y*t/(1.+.66*t),y=.22+t*(launch.z-8.35*t);
          float shrink=(1.-smoothstep(.72,1.20,t))*smoothstep(0.,.022,age-launch.w);
          vec3 p=position*shrink;float turn=id+t*(4.2+4.9*s),tilt=.38+1.12*s+t*(1.54+s);
          p.xy=mat2(cos(tilt),sin(tilt),-sin(tilt),cos(tilt))*p.xy;
          p.xz=mat2(cos(turn),sin(turn),-sin(turn),cos(turn))*p.xz;
          p+=vec3(cos(a)*r,y,sin(a)*r);facets=vec4(face,t,id,p.y);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
				fragmentShader: `varying vec4 facets;
        void main(){if(facets.w<.035)discard;float facet=facets.x,t=facets.y,id=facets.z;
          float edge=.5+.5*cos(facet*1.57+id*.54+t*5.);
          vec3 dark=mix(vec3(.013,.012,.031),vec3(.105,.082,.17),edge);
          vec3 light=mix(vec3(.39,.22,.83),vec3(.65,.86,1.),edge);
          gl_FragColor=vec4(mix(dark,light,pow(edge,6.)*(1.-.72*smoothstep(.23,.84,t))),1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const fragments = new three.Mesh(chips, basalt);
			fragments.name = "dark-pillar-obsidian-ejecta";
			this._ruptureFragments = {
				mesh: fragments,
				firstLaunch,
				lastExpiry
			};
			group.add(fragments);
			return group;
		}
		_buildFootGales() {
			const positions = [], uvs = [], lanes = [], indices = [];
			const segments = 24, crests = 12;
			const noise = (i) => {
				const x = Math.sin(i * 121.79 + 27.59) * 43758.5453;
				return x - Math.floor(x);
			};
			for (let i = 0; i < 53; i++) {
				const kind = i < crests ? 0 : i < 39 ? 1 : i < 47 ? 2 : 3;
				const seed = noise(i), phase = i * .61803398875 % 1;
				const angle = i * 2.399963 + .32 * noise(i + 64);
				const first = positions.length / 3;
				for (let j = 0; j <= segments; j++) for (let v = 0; v < 3; v++) {
					const u = j / segments, k = v * .5;
					positions.push(u, k, 0);
					uvs.push(u, k);
					lanes.push(angle, phase, seed, kind);
					if (j && v) {
						const d = first + 3 * j + v;
						indices.push(d - 4, d - 3, d, d - 4, d, d - 1);
					}
				}
			}
			const g = this._trackGeo(new three.BufferGeometry());
			for (const [key, data, size] of [
				[
					"position",
					positions,
					3
				],
				[
					"uv",
					uvs,
					2
				],
				[
					"lane",
					lanes,
					4
				]
			]) g.setAttribute(key, new three.Float32BufferAttribute(data, size));
			g.setIndex(indices);
			g.boundingSphere = new three.Sphere(new three.Vector3(0, 2.2, 0), 16);
			this._galeUniforms = {
				age: { value: 0 },
				energy: { value: 0 },
				grain: { value: this._noiseTex }
			};
			const tex = this._trackMat(new three.ShaderMaterial({
				uniforms: this._galeUniforms,
				depthWrite: false,
				transparent: true,
				side: three.DoubleSide,
				forceSinglePass: true,
				blending: three.AdditiveBlending,
				vertexShader: `attribute vec4 lane;
        uniform float age;
        varying vec2 st;
        varying vec4 flow;
        void main(){
          float id=lane.z,kind=lane.w,u=uv.x,v=uv.y;
          float speed=mix(.72,1.15,id)*(kind<.5?1.:kind<1.5?1.80:kind<2.5?.83:.93);
          float phase=fract(age*speed+lane.y);
          float impulse=1.-.30*pow(.5+.5*cos(age*4.6+lane.x*1.7),4.);
          float distance=1.-pow(1.-phase,1.48);
          float d;
          float a,r,y;
          if(kind>2.5){
            // Release each arc at the contact point; it grows wider as it runs across the ground.
            d=distance;
            a=lane.x+(u-.5)*mix(.65,1.57,id)+.16*distance;
            r=1.50+mix(6.9,10.9,id)*distance+(v-.5)*mix(.28,1.10,distance);
            y=.075+.13*distance+.23*sin(3.14159*u)*v;
          }else{
            float span=kind<.5?.74:kind<1.5?.60:.65;
            float head=(1.+span*.47)*distance,tail=max(0.,head-span);
            d=mix(tail,head,u);
            float turn=(lane.y<.45?-1.:1.)*(.38+.75*id);
            a=lane.x+turn*d+(.19*sin(age*2.3+lane.x*2.)+.12*sin(10.*d+lane.x))*d;
            float reach=kind<.5?5.1+2.3*id:kind<1.5?6.4+2.5*id:4.5+2.5*id;
            r=1.25+id*.44+reach*d*impulse;
            float lift=kind<.5?1.50+2.85*id:kind<1.5?.37+2.2*id:.44+1.4*id;
            float curl=pow(clamp(d,0.,1.27),2.50);
            float belly=pow(max(0.,sin(3.14159265*u)),.69);
            float w=(kind<.5?1.12+1.53*id:kind<1.5?.16+.46*id:1.4+1.30*id)*belly;
            r+=(v-.5)*w*(.65+.52*id);
            a+=(v-.5)*w*(.065+.10*sin(d*4.6+lane.x));
            y=.065+lift*curl+(v-.1)*w*(kind<.5?1.16:.53)+.18*d*sin(5.1*d+id*6.28);
          }
          st=uv;flow=vec4(phase,id,kind,d);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(r*cos(a),y,r*sin(a),1.);
        }`,
				fragmentShader: `uniform float age,energy;uniform sampler2D grain;
        varying vec2 st;varying vec4 flow;
        void main(){
          float u=st.x,v=st.y,phase=flow.x,id=flow.y,kind=flow.z,d=flow.w;
          float life=smoothstep(.005,.11,phase)*(1.-smoothstep(.61,.998,phase));
          float ends=smoothstep(.005,.23,u)*(1.-smoothstep(.73,.995,u));
          vec2 n=texture2D(grain,vec2(u*2.25-.65*age+id,v*.79+id*.62)).rb;
          float airy=smoothstep(.13,.76,n.x+.24*sin(20.*u+id*15.7));
          float centre=.67+(n.y-.5)*.27;
          float lip=1.-smoothstep(.018,.12,abs(v-centre));
          float inner=1.-smoothstep(.02,.11,abs(v-centre+.31+.09*sin(14.*u+id*4.)));
          float wake=smoothstep(.01,.22,v)*(1.-smoothstep(.78,.99,v));
          float a;
          if(kind>2.5){
            float rim=1.-smoothstep(.025,.15,abs(v-(.76+(n.y-.5)*.15)));
            a=energy*life*ends*(.67*rim+.33*wake*airy)*smoothstep(.06,.18,d);
            lip=.65*rim;
          }else{
            float filament=kind<.5?.92*lip+.38*inner:kind<1.5?.96*lip:.24*lip+.20*inner;
            float body=kind<.5?.64:kind<1.5?.27:.66;
            a=energy*life*ends*(filament*(.57+.43*airy)+wake*body*airy);
            a*=smoothstep(.045,.18,d)*(1.-smoothstep(1.06,1.35,d));
          }
          if(a<.009)discard;
          vec3 cool=mix(vec3(.13,.42,.84),vec3(.32,.77,.99),id);
          vec3 silver=mix(vec3(.47,.76,1.),vec3(.81,.97,1.),id);
          gl_FragColor=vec4(mix(cool,silver,lip*.92),min(a,.92));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const mesh = new three.Mesh(g, tex);
			mesh.name = "dark-pillar-foot-gales";
			mesh.renderOrder = 7;
			return mesh;
		}
		_buildFootPlasma() {
			const uv = [], positions = [], indices = [], sides = 64, rows = 10;
			for (let band = 0; band < 2; band++) {
				const base = positions.length / 3;
				for (let j = 0; j <= rows; j++) for (let i = 0; i <= sides; i++) {
					uv.push(i / sides, j / rows);
					positions.push(0, 0, band);
					if (i && j) {
						const d = base + j * 65 + i;
						indices.push(d - sides - 2, d - sides - 1, d, d - sides - 2, d, d - 1);
					}
				}
			}
			const g = this._trackGeo(new three.BufferGeometry());
			g.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
			g.setAttribute("uv", new three.Float32BufferAttribute(uv, 2));
			g.setIndex(indices);
			g.boundingSphere = new three.Sphere(new three.Vector3(0, .85, 0), 4.7);
			this._footPlasmaUniforms = {
				age: { value: 0 },
				energy: { value: 0 },
				grain: { value: this._noiseTex }
			};
			const material = this._trackMat(new three.ShaderMaterial({
				uniforms: this._footPlasmaUniforms,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				forceSinglePass: true,
				blending: three.AdditiveBlending,
				vertexShader: `uniform float age;varying vec3 sheet;
        void main(){
          float a=uv.x*6.2831853,v=uv.y,band=position.z;
          float swell=.58*sin(a*5.-age*4.7)+.29*sin(a*9.+age*7.1)+.13*cos(a*16.-age*9.4);
          float bend=sin(3.14159*v),r,y;
          if(band<.5){
            r=mix(4.13,.58,v)+.28*bend*swell;
            y=mix(.043,.44,v)+.24*bend*(.55+.45*swell);
          }else{
            r=mix(3.40,1.34,v)+bend*(.34+.37*swell);
            y=.064+v*(1.60+.70*swell)+.29*bend;
          }
          sheet=vec3(uv,band);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(cos(a)*r,y,sin(a)*r,1.);
        }`,
				fragmentShader: `uniform float age,energy;uniform sampler2D grain;varying vec3 sheet;
        void main(){
          float u=sheet.x,a=u*6.2831853,v=sheet.y,band=sheet.z;
          vec2 g=texture2D(grain,vec2(u*3.+.13*age,v*.72-age*.47)).rg;
          vec2 n=texture2D(grain,vec2(u*7.-.17*age+.10*g.y,v*1.34-age*.71)).rb;
          float broken=smoothstep(.17,.79,g.r*.95+n.r*.39);
          float shape=smoothstep(.015,.22+.10*n.r,v)*(1.-smoothstep(.61,.98,v));
          if(band>.5)shape*=1.-smoothstep(.62,.97,v-.20*g.r);
          // White knots flash out of phase over a continuous blue base.
          float knots=.5+.5*cos(13.*a+6.5*v-19.*age+6.8*g.y);
          float sparks=pow(knots,6.)*smoothstep(.38,.83,n.r+.25*g.r);
          float curl=pow(.5+.5*cos(v*16.-3.*a-10.*age+8.*g.r),4.);
          float filaments=smoothstep(.29,.85,n.y)*curl;
          float body=band<.5?.32:.49;
          float alpha=energy*shape*(body*(.34+.66*broken)+.74*sparks+.29*filaments);
          if(band>.5&&gl_FrontFacing)alpha*=.48;
          if(alpha<.008)discard;
          vec3 cold=mix(vec3(.13,.23,.56),vec3(.24,.56,.94),broken);
          vec3 hot=vec3(.90,.96,1.);
          float white=min(1.,.14*broken+.93*sparks+.27*filaments);
          gl_FragColor=vec4(mix(cold,hot,white),min(alpha,.94));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const mesh = new three.Mesh(g, material);
			mesh.name = "dark-pillar-foot-plasma";
			mesh.renderOrder = 6;
			return mesh;
		}
		_buildImpactFan() {
			this.impactFan = new three.Group();
			this.impactFan.name = "dark-pillar-contact-fan";
			this._fanUniforms = {
				age: { value: 0 },
				energy: { value: 0 },
				pressure: { value: 0 },
				noiseLut: { value: this._noiseTex }
			};
			const plane = this._trackGeo(new three.PlaneGeometry(8.4, 8.4));
			plane.rotateX(-Math.PI / 2);
			const glow = this._trackMat(new three.ShaderMaterial({
				uniforms: this._fanUniforms,
				transparent: true,
				blending: three.AdditiveBlending,
				depthWrite: false,
				vertexShader: `varying vec2 st;void main(){st=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
				fragmentShader: `varying vec2 st;uniform float age,energy,pressure;uniform sampler2D noiseLut;
        void main(){float r=length(st);vec2 n=texture2D(noiseLut,st*1.24+vec2(.06,-.11)*age).rb;
          float fog=exp(-r*r*4.8)*(.49+.78*n.x);
          float rays=pow(.5+.5*cos(atan(st.y,st.x+.00001)*17.+2.*n.y),6.)*(1.-smoothstep(.32,.83,r));
          float light=(fog+(.46+.43*n.y)*rays)*(1.-smoothstep(.75,.99,r));
          gl_FragColor=vec4(mix(vec3(.56,.66,1.),vec3(1.,.97,1.),pressure),light*(energy+pressure*.95));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const pool = new three.Mesh(plane, glow);
			pool.position.y = .058;
			pool.renderOrder = 2;
			this.ignitionBurst = this._buildIgnitionBurst();
			this.ruptureAftershock = this._buildRuptureAftershock();
			this.footGales = this._buildFootGales();
			this.impactFan.add(pool, this.ignitionBurst, this.ruptureAftershock, this.footGales);
			this.group.add(this.impactFan);
		}
		_buildStormScript() {
			const uniforms = {
				time: { value: 0 },
				pillarTime: { value: 0 },
				sinceIgnition: { value: 0 },
				releaseAge: { value: -16.3 },
				riseFront: { value: 0 },
				mantleOpen: { value: 0 },
				charge: { value: 0 },
				sustain: { value: 0 },
				afterglow: { value: 0 },
				beatAge: { value: 0 },
				beatGain: { value: 0 }
			};
			this._storm = uniforms;
			const mat = this._trackMat(new three.ShaderMaterial({
				uniforms,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				forceSinglePass: true,
				blending: three.AdditiveBlending,
				vertexShader: `
        attribute vec3 pathTangent;attribute vec4 style;
        uniform float time,pillarTime,sinceIgnition,releaseAge,charge,sustain,afterglow,beatAge,beatGain,riseFront;
        varying vec4 brush;varying vec2 stroke;
        vec3 turn(vec3 p,float a){float s=sin(a),c=cos(a);return vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);}
        void main(){
          float u=uv.x,v=uv.y*2.-1.,kind=style.x,id=style.y,seed=fract(id*.618034);
          float travel;float power;float width=style.z;float a=0.;float heightScale=1.;
          if(kind<.5){ // A few long silver threads coil inwards from the seal.
            travel=fract(time*(.77+.14*seed)+seed);
            power=charge*(.45+.55*seed);a=time*(.32+.11*seed);
          }else if(kind<1.5){ // Main bolts propagate upward; signal reaches the canopy last.
            travel=fract((sinceIgnition+(pillarTime-time))*(.64+.08*seed)+seed);
            power=sustain*(.40+.60*pow(.5+.5*cos(6.283*(travel-.23)),2.));
            a=.12*sin(.98*time+id);
          }else if(kind<2.5){ // Broad calligraphic streamers follow the black column.
            travel=fract((sinceIgnition+(pillarTime-time))*(.40+.055*seed)+seed);
            power=sustain;a=.30*time+.19*sin(time*.83+id);
          }else if(kind<3.5){ // The sky opens into unequal crescent blades.
            travel=fract(sinceIgnition*.41+seed);
            power=sustain*smoothstep(.05,.35,sinceIgnition);a=-.33*time;
          }else if(kind<4.5){ // Ejecta are sweeping ballistic strokes, not an expanding flat circle.
            travel=clamp((beatAge-.11*seed)/(.61+.31*seed),0.,1.);
            a=(1.-beatGain)*4.6;power=beatGain*smoothstep(0.,.08,travel)*(1.-smoothstep(.70,1.,travel));
            heightScale=.84+.16*beatGain;
          }else{ // Finish a cast with sparks drifting out of the upper split.
            travel=fract(sinceIgnition*(.27+.09*seed)+seed);
            power=(sustain+afterglow)*(.40+.50*seed);a=-.21*time;
          }
          // Illuminate the forks from the bottom up, instead of revealing the
          // entire canopy when the floor first erupts.
          if(kind>.5 && (kind<3.5||kind>4.5))
            power*=smoothstep(position.y/17.-.09,position.y/17.+.04,riseFront);
          vec3 pos=position;
          if(kind>4.5){float fall=clamp(releaseAge,0.,1.5);pos.y-=fall*fall*(2.7+2.2*seed);pos.xz*=1.+fall*.095;}
          pos.y*=heightScale;pos=turn(pos,a);
          vec3 tangent=turn(pathTangent*vec3(1.,heightScale,1.),a);
          vec4 mv=modelViewMatrix*vec4(pos,1.);
          vec3 dir=mat3(modelViewMatrix)*tangent;
          // The projected tangent remains correct for tilted cameras and perspective.
          vec2 along=dir.xy-dir.z*mv.xy/min(-.01,mv.z);
          vec2 across=vec2(-along.y,along.x)/max(length(along),.00001);
          float span=sqrt(clamp(length(modelMatrix[0].xyz)*length(modelMatrix[1].xyz),.01,1e4));
          float feather=pow(max(0.,sin(3.141593*u)),kind>2.5?.48:.65);
          mv.xy+=across*v*width*span*feather;
          stroke=vec2(u,v);brush=vec4(kind,travel,power,style.w);
          gl_Position=projectionMatrix*mv;
        }`,
				fragmentShader: `
        varying vec2 stroke; varying vec4 brush;
        void main(){
          float u=stroke.x,v=abs(stroke.y),kind=brush.x,head=brush.y,power=brush.z,tone=brush.w;
          float d=head-u,leader=exp(-d*d*280.);
          // A short, fast head with a longer tail. Wrap is dark at each geometric endpoint.
          float ink=smoothstep(-.085,-.003,d)*(1.-smoothstep(.06,.51,d));
          float envelope;float filament;
          if(kind<.5){envelope=.11+1.35*ink;filament=.20;}
          else if(kind<1.5){envelope=.42+.85*ink;filament=.26;}
          else if(kind<2.5){envelope=.14+.99*ink;filament=.32;}
          else if(kind<3.5){envelope=.29+.71*ink;filament=.45;}
          else if(kind<4.5){envelope=ink*1.48;filament=.30;}
          else {envelope=leader;filament=.20;}
          float tip=smoothstep(0.,.05,u)*(1.-smoothstep(.93,1.,u));
          float core=1.-smoothstep(.02,filament,v);
          float skirt=pow(max(0.,1.-v),2.6);
          vec3 spectral=mix(vec3(.055,.29,.95),vec3(.48,.085,.91),tone);
          vec3 col=mix(spectral,vec3(.90,.96,1.),core*(.61+.37*leader));
          if(kind<.5)col=mix(vec3(.65,.78,1.),vec3(1.),core);
          float alpha=power*envelope*tip*(.67*core+.45*skirt);
          if(alpha<.007)discard;
          gl_FragColor=vec4(col,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const group = new three.Group();
			group.name = "dark-pillar-tempest";
			const polar = (r, a, y) => [
				r * Math.cos(a),
				y,
				r * Math.sin(a)
			];
			const noise = (i) => {
				const v = Math.sin(i * 91.73 + .41) * 43758.54;
				return v - Math.floor(v);
			};
			const bank = (name, emit) => {
				const xyz = [], tan = [], uv = [], styles = [], ix = [];
				const path = (kind, id, width, tone, segments, point) => {
					const pts = Array.from({ length: segments + 1 }, (_, i) => point(i / segments, i));
					const start = xyz.length / 3;
					for (let i = 0; i <= segments; i++) {
						const p = pts[i], prev = pts[Math.max(0, i - 1)], next = pts[Math.min(segments, i + 1)];
						for (let j = 0; j < 2; j++) {
							xyz.push(...p);
							tan.push(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]);
							uv.push(i / segments, j);
							styles.push(kind, id, width, tone);
						}
						if (i) {
							const b = start + i * 2;
							ix.push(b - 2, b - 1, b, b, b - 1, b + 1);
						}
					}
				};
				emit(path);
				const g = this._trackGeo(new three.BufferGeometry());
				g.setIndex(ix);
				for (const [k, v, n] of [
					[
						"position",
						xyz,
						3
					],
					[
						"pathTangent",
						tan,
						3
					],
					[
						"uv",
						uv,
						2
					],
					[
						"style",
						styles,
						4
					]
				]) g.setAttribute(k, new three.Float32BufferAttribute(v, n));
				g.computeBoundingSphere();
				g.boundingSphere.radius += Math.hypot(g.boundingSphere.center.x, g.boundingSphere.center.z) + 1;
				g.boundingSphere.center.x = g.boundingSphere.center.z = 0;
				const mesh = new three.Mesh(g, mat);
				mesh.name = name;
				mesh.renderOrder = 8;
				group.add(mesh);
				return mesh;
			};
			this.infall = bank("dark-pillar-infall", (path) => {
				for (let i = 0; i < 9; i++) path(0, i, .09 + .04 * noise(i), 0, 36, (u) => polar(4.9 - 3.82 * u, i * 2.4 + 1.63 * u, .12 + u * u * (1.6 + 2.2 * noise(i))));
			});
			this.stormArcs = bank("dark-pillar-sky-fracture", (path) => {
				for (let i = 0; i < 5; i++) {
					const points = [];
					for (let j = 0; j <= 15; j++) {
						const u = j / 15, a = i * 2.4 + .41 + 1.09 * u + .2 * (noise(i * 49 + j) - .5);
						const r = 1.64 + Math.sin(Math.PI * u) * (.72 + .81 * noise(i * 28 + j)) + u * u * 1.39;
						points.push(polar(r, a, .3 + 14.95 * u));
					}
					path(1, i, .25 + .08 * noise(i), noise(i + 4), 15, (_, j) => points[j]);
					for (let b = 0; b < 2; b++) {
						const start = points[5 + b * 5];
						path(1, i, .125, .25 + .65 * noise(i + 4), 6, (u, k) => {
							const end = polar(3.75 + u * .72, i * 2.4 + 1.12 + u * (b ? .46 : -.69), start[1] + u * (2 + 1.1 * b));
							return start.map((x, d) => x * (1 - u) + end[d] * u + (d === 1 ? 0 : (noise(k + i * 13 + b * 42 + d) - .5) * .33 * Math.sin(Math.PI * u)));
						});
					}
				}
				for (let i = 0; i < 3; i++) path(2, i + 12, .35 + .1 * i, noise(i), 62, (u) => polar(2.2 + .95 * Math.sin(Math.PI * u) + .34 * Math.sin(8 * u + i), i * 2.13 + u * (3.8 + .36 * i), .22 + u * (12.9 + .77 * i)));
				for (let i = 0; i < 7; i++) path(3, i + 3, .34 + .38 * noise(i + 2), noise(8 + i), 36, (u) => polar(1.21 + (3.2 + 1.28 * noise(i)) * u, i * 2.4 + u * (1.95 + .51 * noise(i)), 14.88 + .52 * Math.sin(Math.PI * u) - u * u * (1 + 1.7 * noise(i + 2))));
				for (let i = 0; i < 20; i++) path(5, i + 23, .1 + .1 * noise(i + 9), noise(i), 7, (u) => polar(2.06 + u * (1.9 + 1.7 * noise(i)), i * 2.4 + u * .7, 13.65 + 1.95 * noise(i + 6) + u * (1.1 + 1 * noise(i))));
			});
			this.blastJets = bank("dark-pillar-outward-lances", (path) => {
				for (let i = 0; i < 27; i++) {
					const a = i * 2.4, far = 3.4 + 2.4 * noise(i + 1), peak = 1 + 3.5 * noise(i + 11);
					path(4, i + 20, .18 + .3 * noise(i + 9), noise(i), 22, (u) => polar(.95 + far * u, a + u * (.16 + .52 * noise(i + 4)), .12 + peak * 4 * u * (1 - u) + u * .26));
				}
			});
			return group;
		}
		_buildRiftMantle() {
			const uniforms = {
				...this._storm,
				grain: { value: this._noiseTex }
			};
			const pos = [], uv = [], ids = [], ix = [];
			for (let i = 0; i < 5; i++) for (let j = 0; j <= 56; j++) for (let k = 0; k <= 6; k++) {
				const u = j / 56, v = k / 6, n = pos.length / 3;
				pos.push(u, v, 0);
				uv.push(u, v);
				ids.push(i);
				if (j && k) ix.push(n - 8, n - 7, n, n - 8, n, n - 1);
			}
			const g = this._trackGeo(new three.BufferGeometry());
			g.setIndex(ix);
			for (const [key, vals, count] of [
				[
					"position",
					pos,
					3
				],
				[
					"uv",
					uv,
					2
				],
				[
					"fold",
					ids,
					1
				]
			]) g.setAttribute(key, new three.Float32BufferAttribute(vals, count));
			g.boundingSphere = new three.Sphere(new three.Vector3(0, 7.6, 0), 13);
			const m = this._trackMat(new three.ShaderMaterial({
				uniforms,
				transparent: true,
				forceSinglePass: true,
				depthWrite: false,
				side: three.DoubleSide,
				vertexShader: `
        attribute float fold;uniform float time,pillarTime,releaseAge,sustain,beatAge,beatGain;varying vec2 st;varying vec2 info;
        void main(){
          float id=fold,u=uv.x,v=uv.y,seed=fract(id*.618+.31);
          float b=sin(3.141593*u),curl=.16*sin(u*7.2+id+pillarTime*1.65)*b;
          float kick=beatGain*exp(-4.*abs(beatAge-u*.66));
          float a=id*2.400+time*(.38+.05*seed)+u*(2.11+1.36*seed)+curl;
          float gesture=.5+.5*sin(9.8*u-pillarTime*2.8+id*3.6);
          float belly=pow(max(0.,b),.68)*(.65+.35*sin(u*4.1+id))*
                       (.38+.72*gesture)*(.62+.64*seed);
          a+=(v-.45)*belly*(.39+.18*seed);
          float r=1.48+.53*u+(1.57+.64*seed+kick*.92)*b+
                  belly*(v*.92+sin(v*3.14)*.37)+.18*sin(14.*u+id+pillarTime)*b;
          float y=.17+u*(13.0+2.28*seed)+belly*((v-.4)*2.85+.42*sin(v*5.2+u*7.+id));
          float release=smoothstep(0.,1.04,releaseAge);
          r=mix(r,r*.64,release*u);y+=release*(.6+1.2*u);
          st=uv;info=vec2(id,kick);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(r*cos(a),y,r*sin(a),1.);
        }`,
				fragmentShader: `
        varying vec2 st,info;uniform float pillarTime,sustain,mantleOpen;uniform sampler2D grain;
        void main(){
          float u=st.x,v=st.y,id=info.x;
          vec2 n=texture2D(grain,vec2(u*1.72-pillarTime*.26+id*.17,v*.51+id*.31)).rb;
          float motion=.5+.5*sin(u*12.2-pillarTime*3.6+id*1.91);
          float feather=.028+.21*n.x*n.x+.072*sin(24.*u+id+3.1*n.y);
          float mask=min(v,1.-v)-feather;
          float vein=v-.53-.145*sin(7.*u+id+3.*n.y);
          float split=abs(vein)-.020-.052*smoothstep(.42,.93,u)*n.x;
          float cut=min(mask,split+.19*(1.-smoothstep(.32,.75,u)));
          float ends=smoothstep(0.,.095,u)*(1.-smoothstep(.84,1.,u));
          // Long tears expose the column through the fold. Taper the travelling
          // ends on both sides instead of outlining the full helix as a tube.
          float cutout=(.39-v)*.72+motion*.37+n.x*.29-.22;
          float a=smoothstep(-.014,.030,min(cut,cutout))*ends*sustain*mantleOpen;
          if(a<.008)discard;
          float lip=(1.-smoothstep(.008,.14,min(abs(mask),abs(vein)+.028)))*(.26+.74*motion);
          float facet=smoothstep(.42,.49,n.x*.45+v*.55+.12*sin(6.*u+id));
          vec3 face=mix(vec3(.012,.009,.045),vec3(.066,.045,.17),facet);
          float flow=pow(.5+.5*cos(u*13.-pillarTime*5.4+id),2.);
          vec3 edge=mix(vec3(.22,.48,.97),vec3(.64,.26,.96),.5+.5*sin(id*1.7+u*3.));
          vec3 col=mix(face,edge,lip*(.47+.53*flow))+
                   vec3(.68,.77,.99)*pow(lip,8.)*(.15+.63*flow+.45*info.y);
          gl_FragColor=vec4(col,a*(.62+.35*lip));
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const mesh = new three.Mesh(g, m);
			mesh.name = "dark-pillar-ink-mantle";
			mesh.renderOrder = 6;
			return mesh;
		}
		_buildTravelingFault() {
			const g = this._trackGeo(new three.PlaneGeometry(14.8, 14.8));
			g.rotateX(-Math.PI / 2);
			const m = this._trackMat(new three.ShaderMaterial({
				uniforms: this._storm,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				forceSinglePass: true,
				blending: three.AdditiveBlending,
				vertexShader: `varying vec2 st;void main(){st=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
				fragmentShader: `
        varying vec2 st;uniform float beatAge,beatGain;
        void main(){
          float t=clamp(beatAge/1.04,0.,1.),a=atan(st.y,st.x+.000001),r=length(st);
          float sector=.5+.5*sin(7.*a+beatGain*10.+.85*sin(5.*a));
          float tooth=pow(.5+.5*cos(27.*a+2.*sin(9.*a)),4.);
          float front=.18+(.60+.12*sector+.085*tooth)*(1.-pow(1.-t,2.));
          float d=front-r,segment=smoothstep(.12,.65,sector);
          float ridge=exp(-abs(d)*80.);
          float wake=smoothstep(-.006,.018,d)*exp(-max(0.,d)*(12.+19.*(1.-tooth)));
          float slit=pow(.5+.5*cos(33.*a+sin(a*10.)+d*7.),9.);
          float strength=(ridge*(.17+.83*segment)+wake*(.21+.58*slit)*sector)*
                         beatGain*(1.-smoothstep(.24,1.,t));
          if(strength<.006)discard;
          vec3 c=mix(vec3(.28,.11,.79),vec3(.72,.84,1.),ridge);
          gl_FragColor=vec4(c,strength);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
			}));
			const mesh = new three.Mesh(g, m);
			mesh.name = "dark-pillar-traveling-fault";
			mesh.position.y = .074;
			mesh.renderOrder = 3;
			return mesh;
		}
		_sampleFootSurges(age, fade) {
			for (let i = 0; i < 6; i++) {
				const role = Math.floor(i / 2), period = 1.04 + role * .19, length = period * 1.62;
				const local = age - role * .075 - i % 2 * period;
				const cycle = Math.floor(local / (2 * period)), elapsed = local - cycle * 2 * period;
				const active = local >= 0 && elapsed < length;
				const head = active ? this._easeOutCubic(Math.min(1, elapsed / .39)) : 0;
				const tail = active ? this._smoothstep(length * .5, length, elapsed) : 0;
				const body = active ? this._smoothstep(0, .14, elapsed) * (1 - this._smoothstep(length * .66, length, elapsed)) * fade : 0;
				const seed = role * 1.73 + i % 2 * 2.19 + cycle * .77;
				this._strokeStates[i].set(head, tail, body, seed + .14 * elapsed);
			}
		}
		_updateFlyingShards(age, fade) {
			const width = this.columnShape.scale.x, onset = this._smoothstep(0, .14, age);
			for (let i = 0; i < this.debrisData.length; i++) {
				const d = this.debrisData[i], cycle = .75 + .07 * d.vy;
				const hero = i % 5 === 0;
				const life = Math.max(0, (hero ? this._storm.beatAge.value : age) - d.delay * 1.4) / cycle;
				const p = hero ? Math.min(1, life) : life - Math.floor(life);
				const angle = i % 3 * 2.12 + .47 + .38 * Math.sin(d.angle + Math.floor(life));
				const r = width * 1.48 + p * (1.4 + (.43 + (hero ? .2 : 0)) * d.vy) * Math.sqrt(width);
				const y = .2 + 4 * p * (1 - p) * (.9 + (hero ? .48 : .25) * d.vy);
				const k = (.4 + .23 * d.scale) * Math.sqrt(width) * onset * fade * Math.sin(Math.PI * p) ** .6;
				this._dummy.position.set(Math.cos(angle) * r, y * fade, Math.sin(angle) * r);
				this._dummy.rotation.set(.42 + p * d.rotSpeedX, Math.PI / 2 - angle, p * d.rotSpeedY, "YXZ");
				this._dummy.scale.set(k * 1.55, k * 2.4, k);
				this._dummy.updateMatrix();
				this.debrisMesh.setMatrixAt(i, this._dummy.matrix);
			}
			this.debrisMesh.instanceMatrix.needsUpdate = true;
		}
		_buildLayer12_DebrisRockShards() {
			const count = 24;
			const geo = this._createWeldedRockGeometry(.21);
			const mat = this._trackMat(new three.MeshStandardMaterial({
				color: 6581630,
				flatShading: true,
				roughness: .88,
				metalness: .12,
				emissive: 592916,
				emissiveIntensity: .3
			}));
			this.debrisMesh = new three.InstancedMesh(geo, mat, count);
			this.debrisMesh.name = "dark-pillar-debris";
			this.debrisMesh.frustumCulled = false;
			this.debrisMesh.renderOrder = 9;
			this.debrisData = [];
			for (let i = 0; i < count; i++) {
				const ang = this._rand() * Math.PI * 2;
				const spdH = 2 + this._rand() * 4.5;
				const spdV = 4.8 + this._rand() * 7.2;
				this.debrisData.push({
					angle: ang,
					r0: 1.2 + this._rand() * 1,
					vx: Math.cos(ang) * spdH,
					vy: spdV,
					vz: Math.sin(ang) * spdH,
					rotSpeedX: (this._rand() - .5) * 9,
					rotSpeedY: (this._rand() - .5) * 9,
					scale: .5 + this._rand() * 1.3,
					delay: this._rand() * .12
				});
			}
			this.group.add(this.debrisMesh);
		}
		_buildLayer13_EmberSparks() {
			const count = 80;
			const geo = this._trackGeo(new three.PlaneGeometry(.11, .56));
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide,
				uniforms: { uOpacity: { value: 1 } },
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // Keep the spark upright in local space while facing the viewer.
          vec4 center = modelViewMatrix * instanceMatrix[3];
          vec3 up = modelViewMatrix[1].xyz;
          vec3 toward = projectionMatrix[3][3] == 0.0 ? -center.xyz : vec3(0.0, 0.0, 1.0);
          vec3 right = cross(normalize(up), toward);
          float len = length(right);
          right = len > 0.00001 ? right / len : normalize(modelViewMatrix[0].xyz);
          center.xyz += right * length(modelViewMatrix[0].xyz) * instanceMatrix[0][0] * position.x
                      + up * instanceMatrix[1][1] * position.y;
          gl_Position = projectionMatrix * center;
        }
      `,
				fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float dx = 1.0 - abs(vUv.x * 2.0 - 1.0);
          float head = smoothstep(0.0, 0.8, vUv.y) * (1.0 - smoothstep(0.78, 1.0, vUv.y));
          float alpha = pow(dx, 1.6) * head * uOpacity;
          if (alpha < 0.01) discard;
          vec3 col = mix(vec3(0.68, 0.80, 1.0), vec3(1.0), vUv.y);
          gl_FragColor = vec4(col * 1.5, alpha);
        }
      `
			}));
			this.sparksMesh = new three.InstancedMesh(geo, mat, count);
			this.sparksMesh.frustumCulled = false;
			this.sparksMesh.renderOrder = 9;
			this.sparkData = [];
			for (let i = 0; i < count; i++) {
				const ang = this._rand() * Math.PI * 2;
				this.sparkData.push({
					angle: ang,
					r0: 1.3 + this._rand() * 3.8,
					radialSpeed: .8 + this._rand() * 3,
					upSpeed: 3.5 + this._rand() * 8.2,
					swirlSpeed: (this._rand() - .5) * 1.8,
					phase: this._rand(),
					scale: .55 + this._rand() * 1.15
				});
			}
			this.group.add(this.sparksMesh);
		}
		_buildLayer14_DarkSmokeBillows() {
			const count = 24;
			const geo = this._trackGeo(new three.PlaneGeometry(2.6, 2.6));
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // Face the active camera even when the host rotates or scales the group.
          vec4 center = modelViewMatrix * instanceMatrix[3];
          center.xy += position.xy * vec2(length(modelViewMatrix[0].xyz) * instanceMatrix[0][0],
                                          length(modelViewMatrix[1].xyz) * instanceMatrix[1][1]);
          gl_Position = projectionMatrix * center;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        ${this._glslNoise()}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float n = fbm(vUv * 4.2 + vec2(0.0, -uTime * 0.42));
          float soft = (1.0 - smoothstep(0.22, 1.0, r)) * smoothstep(0.2, 0.72, n);
          float alpha = soft * uOpacity * 0.52;
          if (alpha < 0.01) discard;
          vec3 col = mix(vec3(0.04, 0.045, 0.075), vec3(0.16, 0.18, 0.25), n);
          gl_FragColor = vec4(col, alpha);
        }
      `
			}));
			this.smokeMesh = new three.InstancedMesh(geo, mat, count);
			this.smokeMesh.frustumCulled = false;
			this.smokeMesh.renderOrder = 4;
			this.smokeData = [];
			for (let i = 0; i < count; i++) this.smokeData.push({
				angle: i / count * Math.PI * 2 + (this._rand() - .5) * .3,
				r0: 1.7 + this._rand() * 1.5,
				outSpeed: 1.2 + this._rand() * 1.8,
				upSpeed: .6 + this._rand() * 1.2,
				phase: this._rand(),
				scale: .78 + this._rand() * 1.15
			});
			this.group.add(this.smokeMesh);
		}
		_buildLayer15_OrbitingVoidWisps() {
			const geo = this._trackGeo(new three.CylinderGeometry(2.18, 2.5, 15, 28, 1, true));
			geo.translate(0, 7.5, 0);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        ${this._glslNoise()}
        void main() {
          float spiral = fract(vUv.x * 3.0 + vUv.y * 2.2 - uTime * 0.85);
          float n = fbmCyl(vec2(vUv.x * 6.0, vUv.y * 5.0 - uTime * 2.4), 6.0);
          float band = smoothstep(0.18, 0.34, spiral) * (1.0 - smoothstep(0.44, 0.68, spiral));
          float mask = band * smoothstep(0.28, 0.72, n);
          float vFade = smoothstep(0.0, 0.14, vUv.y) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
          float alpha = mask * vFade * uOpacity * 0.62;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vec3(0.03, 0.035, 0.06), alpha);
        }
      `
			}));
			this.voidWisps = new three.Mesh(geo, mat);
			this.voidWisps.renderOrder = 6;
			this.group.add(this.voidWisps);
		}
		_buildLayer16_GroundScorchCrater() {
			const geo = this._trackGeo(new three.PlaneGeometry(8.2, 8.2));
			geo.rotateX(-Math.PI * .5);
			const mat = this._trackMat(new three.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide,
				uniforms: {
					uNoise: { value: this._noiseTex },
					uOpacity: { value: 1 },
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
        uniform float uOpacity;
        uniform float uHeat;
        varying vec2 vUv;
        ${this._glslNoise()}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);
          float crackNoise = 1.0 - abs(vnoise(vec2(ang * 4.5, r * 5.5)) * 2.0 - 1.0);
          float cracks = pow(crackNoise, 10.0) * (1.0 - smoothstep(0.18, 0.95, r));
          float scorch = (1.0 - smoothstep(0.15, 1.0, r)) * 0.84;
          vec3 col = mix(vec3(0.02, 0.025, 0.04), vec3(0.85, 0.92, 1.0) * 1.35, cracks * uHeat);
          float alpha = clamp(scorch + cracks * uHeat, 0.0, 0.92) * uOpacity;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col, alpha);
        }
      `
			}));
			this.groundScorch = new three.Mesh(geo, mat);
			this.groundScorch.position.y = .018;
			this.groundScorch.renderOrder = 1;
			this.group.add(this.groundScorch);
		}
		setTime(seconds) {
			if (!Number.isFinite(seconds) || !this._disposables) return;
			const remainder = seconds % this.duration;
			this.setNormalizedTime((remainder < 0 ? remainder + this.duration : remainder) / this.duration);
		}
		setNormalizedTime(u) {
			if (!Number.isFinite(u) || !this._disposables) return;
			const progress = this._clamp01(u);
			if (progress === this._lastU) return;
			this._lastU = progress;
			const { duration, ignition, formationEnd, firstEcho, secondEcho, release } = DARK_PILLAR_BURST;
			const sec = progress * duration, elapsedSinceImpact = sec - ignition, releaseAge = sec - release;
			const burst = elapsedSinceImpact >= 0;
			const pillarTime = burst ? ignition + elapsedSinceImpact * PILLAR_FLOW_RATE : sec;
			const t = !burst ? .135 * sec / ignition : elapsedSinceImpact < .1 ? .15 + .11 * elapsedSinceImpact / .1 : sec < formationEnd ? .26 + .42 * (elapsedSinceImpact - .1) / (formationEnd - ignition - .1) : .68 + .32 * Math.max(0, releaseAge) / (duration - release);
			const hit = sec >= secondEcho ? secondEcho : sec >= firstEcho ? firstEcho : ignition;
			const gain = hit === ignition ? 1 : hit === firstEcho ? .7 : .84;
			const hitAge = sec - hit;
			const ignitionWhite = burst ? 1 - this._smoothstep(.067, .145, elapsedSinceImpact) : 0;
			this.ignitionBurst.visible = burst && elapsedSinceImpact < .43;
			this.ruptureAftershock.visible = burst && elapsedSinceImpact < 1.4;
			const fragments = this._ruptureFragments;
			fragments.mesh.visible = elapsedSinceImpact >= fragments.firstLaunch - 1e-5 && elapsedSinceImpact <= fragments.lastExpiry + 1e-5;
			this._ignition.age.value = Math.max(0, elapsedSinceImpact);
			this._ignition.white.value = ignitionWhite;
			this.ignitionHalo.visible = burst && elapsedSinceImpact < .164;
			this.ignitionFront.visible = elapsedSinceImpact >= .025 && elapsedSinceImpact < .42;
			this.ignitionTongues.visible = burst && elapsedSinceImpact < .36;
			const storm = this._storm;
			storm.time.value = sec;
			storm.pillarTime.value = pillarTime;
			storm.sinceIgnition.value = elapsedSinceImpact;
			storm.releaseAge.value = releaseAge;
			storm.charge.value = this._smoothstep(.08, .86, sec) * (1 - this._smoothstep(-.04, .09, elapsedSinceImpact));
			storm.sustain.value = this._smoothstep(.045, .2, elapsedSinceImpact) * (1 - this._smoothstep(.01, 1.07, releaseAge));
			storm.riseFront.value = this._smoothstep(.045, .34, elapsedSinceImpact) * 1.12;
			storm.mantleOpen.value = this._smoothstep(.16, formationEnd - ignition, elapsedSinceImpact);
			storm.afterglow.value = this._smoothstep(0, .62, releaseAge) * (1 - this._smoothstep(.88, 1.34, releaseAge)) * .85;
			storm.beatAge.value = hitAge;
			storm.beatGain.value = burst ? gain : 0;
			this.infall.visible = storm.charge.value > .001;
			this.stormArcs.visible = storm.sustain.value > .001 || storm.afterglow.value > .001;
			this.blastJets.visible = hitAge >= 0 && hitAge < 1.05;
			this.riftMantle.visible = storm.sustain.value * storm.mantleOpen.value > .001;
			this.travelingFault.visible = this.blastJets.visible;
			const recoil = burst ? gain * Math.exp(-Math.max(0, hitAge) * 6.5) : 0;
			const circleIn = this._smoothstep(0, .14, t);
			const circleOut = 1 - this._smoothstep(.82, .99, t);
			const burstRise = this._easeOutCubic((t - .15) / .11);
			const coreOut = 1 - this._smoothstep(.7, .88, t);
			const coreErode = this._smoothstep(.68, .88, t);
			const punch = burst ? 1 + .12 * Math.sin(Math.PI * this._clamp01(elapsedSinceImpact / .16)) * (1 - this._smoothstep(.06, .16, elapsedSinceImpact)) : .15;
			const beamRadiusScale = burst ? punch * (1 - .55 * coreErode) : 0;
			const contactIn = this._smoothstep(.145, .32, elapsedSinceImpact);
			const contactEnergy = contactIn * (1 - this._smoothstep(.82, .982, t));
			this._footBlend.value = contactIn;
			this.footPlasma.visible = contactEnergy > .008;
			if (this.footPlasma.visible) {
				const contactScale = Math.max(.75, beamRadiusScale);
				this.footPlasma.scale.set(contactScale, 1, contactScale);
				this._footPlasmaUniforms.age.value = elapsedSinceImpact;
				this._footPlasmaUniforms.energy.value = contactEnergy;
			}
			this.groundCircle.material.uniforms.uTime.value = sec;
			this.groundCircle.material.uniforms.uReveal.value = .15 + .95 * circleIn;
			this.groundCircle.material.uniforms.uDissolve.value = this._smoothstep(.8, .99, t);
			this.groundCircle.material.uniforms.uOpacity.value = circleIn * circleOut * (1 - .55 * burstRise * coreOut);
			this.groundCircle.rotation.y = sec * .32;
			const coreVis = burst && coreOut > .005;
			this.darkCore.visible = coreVis;
			this.darkCore.material.uniforms.uIgnitionWhite.value = ignitionWhite;
			if (coreVis) {
				this.darkCore.scale.set(beamRadiusScale, 1, beamRadiusScale);
				this.darkCore.material.uniforms.uTime.value = pillarTime;
				this.darkCore.material.uniforms.uOpacity.value = coreOut;
				this.darkCore.material.uniforms.uErode.value = coreErode;
			}
			this.coreVeins.visible = coreVis;
			if (coreVis) {
				this.coreVeins.scale.set(beamRadiusScale, 1, beamRadiusScale);
				this.coreVeins.material.uniforms.uTime.value = pillarTime;
				this.coreVeins.material.uniforms.uOpacity.value = this._smoothstep(.14, .22, t) * coreOut;
			}
			const sheathOut = 1 - this._smoothstep(.72, .9, t);
			this.outerSheath.visible = burst && sheathOut > .005;
			if (this.outerSheath.visible) {
				this.outerSheath.scale.set(beamRadiusScale * 1.02, 1, beamRadiusScale * 1.02);
				this.outerSheath.material.uniforms.uTime.value = pillarTime;
				this.outerSheath.material.uniforms.uOpacity.value = this._smoothstep(.06, .2, t) * sheathOut;
				this.outerSheath.material.uniforms.uErode.value = this._smoothstep(.7, .9, t);
			}
			const plumeIn = this._smoothstep(.16, .26, t);
			const plumeOut = 1 - this._smoothstep(.72, .89, t);
			this.plumeMesh.visible = plumeIn * plumeOut > .005;
			if (this.plumeMesh.visible) {
				this.plumeMat.uniforms.uTime.value = pillarTime;
				this.plumeMat.uniforms.uOpacity.value = plumeIn * plumeOut;
				this.plumeMesh.rotation.y = sec * .45;
				this.plumeMesh.scale.set(beamRadiusScale, 1, beamRadiusScale);
			}
			this.runeRings.forEach((item, idx) => {
				const start = .16 + item.cfg.delay;
				const endStart = .74 + (2 - idx) * .03;
				const open = this._easeOutBack((t - start) / .13);
				const fadeOut = 1 - this._smoothstep(endStart, endStart + .14, t);
				const ringDelay = .1 + (2 - idx) * .095;
				const ringReveal = this._smoothstep(ringDelay, ringDelay + .28, elapsedSinceImpact);
				const active = t >= start && ringReveal > 0 && fadeOut > .005;
				item.mesh.visible = active;
				const halo = this.ringHalos[idx];
				halo.mesh.visible = active;
				if (active) {
					const s = Math.max(.01, open * (.85 + .15 * fadeOut));
					item.mesh.scale.set(s, 1, s);
					item.mesh.rotation.y = sec * item.cfg.speed;
					item.mat.uniforms.uTime.value = sec;
					item.mat.uniforms.uOpacity.value = ringReveal * (idx === 2 ? .085 : .42) * this._smoothstep(start, start + .05, t) * fadeOut;
					item.mat.uniforms.uDissolve.value = this._smoothstep(endStart, endStart + .14, t);
					halo.mesh.scale.set(s, 1, s);
					halo.mat.uniforms.uTime.value = sec;
					halo.mat.uniforms.uOpacity.value = ringReveal * (idx === 2 ? .055 : .26) * this._smoothstep(start, start + .06, t) * fadeOut;
				}
			});
			this.shockwaves.forEach((sw) => {
				const localT = (elapsedSinceImpact - .035 - sw.offset * 2.4) / 1.2;
				if (localT <= 0 || localT >= 1) sw.mesh.visible = false;
				else {
					sw.mesh.visible = true;
					const r = 1.3 + this._easeOutCubic(localT) * 8;
					sw.mesh.scale.set(r, 1, r);
					sw.mat.uniforms.uOpacity.value = (1 - localT) * (1 - localT) * .85;
					sw.mat.uniforms.uSoftness.value = localT * .45;
				}
			});
			const skyIn = this._smoothstep(.02, .24, t);
			const skyOut = 1 - this._smoothstep(.76, .98, t);
			this.skyVortex.visible = skyIn * skyOut > .005;
			if (this.skyVortex.visible) {
				const s = .72 + .28 * skyIn;
				this.skyVortex.scale.set(s, 1, s);
				this.skyVortex.material.uniforms.uTime.value = sec;
				this.skyVortex.material.uniforms.uOpacity.value = skyIn * skyOut;
			}
			const streakEnv = this._smoothstep(0, .08, sec) * (1 - this._smoothstep(.72, .9, t));
			this.streaksMesh.material.uniforms.uOpacity.value = streakEnv * .85;
			this.streaksMesh.visible = streakEnv > .005;
			this.streaksMesh.count = burst ? this.streakData.length : Math.min(this.streakData.length, 2 + Math.floor((this.streakData.length - 2) * (sec / ignition) ** 1.25));
			if (this.streaksMesh.visible) {
				const arr = this.streaksMesh.instanceMatrix.array;
				for (let i = 0; i < this.streaksMesh.count; i++) {
					const d = this.streakData[i];
					const y = (d.phase + pillarTime * d.speed * .072) % 1 * 14.4;
					const ang = d.angle + sec * .2;
					const ca = Math.cos(ang), sa = Math.sin(ang);
					const o = i * 16;
					arr[o] = sa * d.widthScale;
					arr[o + 1] = 0;
					arr[o + 2] = -ca * d.widthScale;
					arr[o + 3] = 0;
					arr[o + 4] = 0;
					arr[o + 5] = d.lenScale;
					arr[o + 6] = 0;
					arr[o + 7] = 0;
					arr[o + 8] = ca;
					arr[o + 9] = 0;
					arr[o + 10] = sa;
					arr[o + 11] = 0;
					arr[o + 12] = ca * d.radius;
					arr[o + 13] = y;
					arr[o + 14] = sa * d.radius;
					arr[o + 15] = 1;
				}
				this.streaksMesh.instanceMatrix.needsUpdate = true;
			}
			const blastAge = Math.max(0, elapsedSinceImpact), footFade = burst ? 1 - this._smoothstep(.76, .96, t) : 0;
			this._sampleFootSurges(blastAge, footFade);
			this.footSurges.visible = footFade > 0 && this._strokeStates.some((stroke) => stroke.z >= .00799);
			this.impactFan.visible = footFade > 0;
			const windEnergy = this._smoothstep(.16, .62, blastAge) * footFade;
			this.footGales.visible = windEnergy > .009;
			this._galeUniforms.age.value = blastAge * FOOT_GALE_RATE;
			this._galeUniforms.energy.value = windEnergy;
			this._fanUniforms.age.value = blastAge;
			this._fanUniforms.energy.value = this._smoothstep(0, .11, blastAge) * footFade;
			this._fanUniforms.pressure.value = recoil;
			const debrisVisible = burst && t < .97;
			if (!debrisVisible && this.debrisMesh.visible) {
				this._dummy.matrix.identity();
				for (let i = 0; i < this.debrisMesh.count; i++) this.debrisMesh.setMatrixAt(i, this._dummy.matrix);
				this.debrisMesh.instanceMatrix.needsUpdate = true;
			}
			this.debrisMesh.visible = debrisVisible;
			if (this.debrisMesh.visible) {
				this._shardAge = blastAge;
				this._shardFade = 1 - this._smoothstep(.78, .97, t);
				this._updateFlyingShards(this._shardAge, this._shardFade);
			}
			const sparkEnv = this._smoothstep(.14, .24, t) * (1 - this._smoothstep(.76, .97, t));
			this.sparksMesh.material.uniforms.uOpacity.value = sparkEnv;
			this.sparksMesh.visible = sparkEnv > .005;
			if (this.sparksMesh.visible) {
				const arr = this.sparksMesh.instanceMatrix.array;
				for (let i = 0; i < this.sparkData.length; i++) {
					const d = this.sparkData[i];
					const cycle = (d.phase + sec * .4) % 1;
					const r = d.r0 + cycle * d.radialSpeed * 1.4;
					const ang = d.angle + cycle * d.swirlSpeed;
					const y = .2 + cycle * d.upSpeed * 1.85;
					const fade = Math.sin(cycle * Math.PI);
					const sx = d.scale * fade;
					const sy = d.scale * (.7 + .9 * fade);
					const o = i * 16;
					arr[o] = sx;
					arr[o + 5] = sy;
					arr[o + 12] = Math.cos(ang) * r;
					arr[o + 13] = y;
					arr[o + 14] = Math.sin(ang) * r;
					arr[o + 15] = 1;
				}
				this.sparksMesh.instanceMatrix.needsUpdate = true;
			}
			const smokeEnv = this._smoothstep(.18, .34, t) * (1 - this._smoothstep(.76, .99, t));
			this.smokeMesh.material.uniforms.uTime.value = sec;
			this.smokeMesh.material.uniforms.uOpacity.value = smokeEnv;
			this.smokeMesh.visible = smokeEnv > .005;
			if (this.smokeMesh.visible) {
				const arr = this.smokeMesh.instanceMatrix.array;
				for (let i = 0; i < this.smokeData.length; i++) {
					const d = this.smokeData[i];
					const cycle = (d.phase + sec * .25) % 1;
					const r = d.r0 + this._easeOutCubic(cycle) * d.outSpeed * 2.2;
					const y = .65 + cycle * d.upSpeed * 2.1;
					const sc = Math.max(1e-4, d.scale * (.65 + cycle * 1.15) * Math.sin(cycle * Math.PI));
					const o = i * 16;
					arr[o] = sc;
					arr[o + 5] = sc;
					arr[o + 12] = Math.cos(d.angle) * r;
					arr[o + 13] = y;
					arr[o + 14] = Math.sin(d.angle) * r;
					arr[o + 15] = 1;
				}
				this.smokeMesh.instanceMatrix.needsUpdate = true;
			}
			const wispEnv = this._smoothstep(.18, .32, t) * (1 - this._smoothstep(.72, .91, t));
			this.voidWisps.visible = wispEnv > .005;
			if (this.voidWisps.visible) {
				this.voidWisps.scale.set(beamRadiusScale, 1, beamRadiusScale);
				this.voidWisps.material.uniforms.uTime.value = pillarTime;
				this.voidWisps.material.uniforms.uOpacity.value = wispEnv;
			}
			const scorchIn = this._smoothstep(.1, .24, t);
			const scorchOut = 1 - this._smoothstep(.84, 1, t);
			this.groundScorch.visible = scorchIn * scorchOut > .005;
			if (this.groundScorch.visible) {
				this.groundScorch.material.uniforms.uOpacity.value = scorchIn * scorchOut;
				this.groundScorch.material.uniforms.uHeat.value = (1 - this._smoothstep(.66, .92, t)) * this._smoothstep(.14, .26, t);
			}
		}
		dispose() {
			if (!this._disposables) return;
			this.group.removeFromParent();
			this.group.traverse((object) => {
				if (object.isInstancedMesh) object.dispose();
			});
			this.group.clear();
			this._disposables.geometries.forEach((g) => g.dispose());
			this._disposables.materials.forEach((m) => m.dispose());
			this._disposables.textures.forEach((t) => t.dispose());
			this._disposables = null;
		}
	};
	const normalizeAmount = (value, max = 2, fallback = 1) => typeof value === "number" && Number.isFinite(value) ? three.MathUtils.clamp(value, .25, max) : fallback;
	function normalizeDarkPillarBurstOptions(options = {}) {
		return {
			size: normalizeAmount(options.size),
			speed: normalizeAmount(options.speed),
			circleDiameter: normalizeAmount(options.circleDiameter, 2, 2),
			pillarHeight: normalizeAmount(options.pillarHeight),
			pillarWidth: normalizeAmount(options.pillarWidth, 4, 2)
		};
	}
	function createDarkPillarBurstEffect(spec, options = {}) {
		const group = new three.Group();
		group.name = spec.id;
		const { duration, seed, maxParticles } = DARK_PILLAR_BURST;
		const lifecycle = {
			start: DARK_PILLAR_BURST.ignition,
			end: duration - DARK_PILLAR_BURST.release,
			...spec.lifecycle
		};
		let settings = Object.freeze(normalizeDarkPillarBurstOptions(options));
		let cast = null, elapsed = 0, disposed = false;
		group.scale.setScalar(settings.size);
		function seek(time) {
			if (disposed || !Number.isFinite(time)) return;
			const next = three.MathUtils.clamp(time, 0, duration);
			const visible = next > 0 && next < duration;
			if (visible) {
				const progress = next / duration;
				if (cast) cast.setNormalizedTime(progress);
				else {
					cast = new DarkPillarBurstVFX({
						duration,
						seed,
						...settings
					}, progress);
					group.add(cast.group);
				}
			}
			elapsed = next;
			group.visible = visible;
		}
		seek(0);
		return {
			group,
			lifecycle,
			duration,
			particleCount: maxParticles,
			get settings() {
				return settings;
			},
			get elapsed() {
				return elapsed;
			},
			get phase() {
				return disposed || elapsed >= duration ? "finished" : elapsed < lifecycle.start ? "starting" : elapsed >= duration - lifecycle.end ? "ending" : "active";
			},
			get finished() {
				return disposed || elapsed >= duration;
			},
			seek,
			update(dt) {
				if (disposed || elapsed >= duration || !Number.isFinite(dt) || dt <= 0) return;
				seek(Math.min(duration, elapsed + dt * settings.speed));
			},
			reset() {
				seek(0);
			},
			setOptions(partial = {}) {
				if (disposed) return;
				settings = Object.freeze(normalizeDarkPillarBurstOptions({
					...settings,
					...partial
				}));
				group.scale.setScalar(settings.size);
				cast?.setShape(settings);
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
exports.DARK_PILLAR_BURST = DARK_PILLAR_BURST;
exports.DarkPillarBurstVFX = DarkPillarBurstVFX;
exports.createDarkPillarBurstEffect = createDarkPillarBurstEffect;
exports.normalizeDarkPillarBurstOptions = normalizeDarkPillarBurstOptions;
return exports;
})({}, THREE);

export {__vfxModule};
