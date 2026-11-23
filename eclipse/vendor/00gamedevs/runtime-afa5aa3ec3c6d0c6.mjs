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

//#region src/effects/flame-magic-bolt-runtime.js
	const CAST_START = .14;
	const IMPACT = .54;
	const DEFAULT_DURATION = 3.4;
	const DEFAULT_SEED = 20261121;
	const MAX_SCENE_UNITS = 1e7;
	const sceneScalar = (value) => Math.abs(value) <= MAX_SCENE_UNITS;
	const isFiniteVector = (v) => v?.isVector3 === true && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
	const clamp01 = (v) => three.MathUtils.clamp(v, 0, 1);
	function vector(value, name) {
		if (!isFiniteVector(value)) throw new TypeError(name + " must be a finite THREE.Vector3");
		return value;
	}
	function scenePoint(value, name) {
		vector(value, name);
		if (![
			value.x,
			value.y,
			value.z
		].every(sceneScalar)) throw new RangeError(name + " is outside the supported local scene range");
		return value;
	}
	function scalar(value, fallback, name, allows = Number.isFinite) {
		const result = value ?? fallback;
		if (!Number.isFinite(result) || !allows(result)) throw new RangeError("Invalid " + name);
		return result;
	}
	function callback(value, name) {
		if (value != null && typeof value !== "function") throw new TypeError(name + " must be a function");
		return value ?? null;
	}
	const positive = (value) => value > 0;
	const nonnegative = (value) => value >= 0;
	function launchSettings(options, defaults) {
		return {
			flightSpeed: scalar(options.speed, defaults.flightSpeed, "speed", positive),
			maxRange: scalar(options.maxRange, defaults.maxRange, "maxRange", (value) => positive(value) && sceneScalar(value)),
			castDuration: scalar(options.castDuration, defaults.castDuration, "castDuration", nonnegative),
			impactDuration: scalar(options.impactDuration, defaults.impactDuration, "impactDuration", positive),
			arcHeight: scalar(options.arcHeight, defaults.arcHeight, "arcHeight", sceneScalar),
			groundY: scalar(options.groundY, defaults.groundY, "groundY", sceneScalar),
			onImpact: options.onImpact === void 0 ? defaults.onImpact : callback(options.onImpact, "onImpact"),
			onComplete: options.onComplete === void 0 ? defaults.onComplete : callback(options.onComplete, "onComplete")
		};
	}
	const _SoulFireballShared = {
		noiseTex: null,
		refCount: 0,
		getNoiseTexture() {
			if (this.noiseTex) return this.noiseTex;
			const size = 128;
			const data = /* @__PURE__ */ new Uint8Array(65536);
			const hash2 = (x, y, p) => {
				const xm = (x % p + p) % p;
				const ym = (y % p + p) % p;
				const n = Math.sin(xm * 127.1 + ym * 311.7 + p * 17.3) * 43758.5453123;
				return n - Math.floor(n);
			};
			const tileNoise = (u, v, period) => {
				const gx = u * period, gy = v * period;
				const ix = Math.floor(gx), iy = Math.floor(gy);
				const fx = gx - ix, fy = gy - iy;
				const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
				const a = hash2(ix, iy, period), b = hash2(ix + 1, iy, period);
				const c = hash2(ix, iy + 1, period), d = hash2(ix + 1, iy + 1, period);
				return a + (b - a) * ux + (c + (d - c) * ux - (a + (b - a) * ux)) * uy;
			};
			const tileFbm = (u, v, basePeriod, octaves) => {
				let val = 0, amp = .55, p = basePeriod, norm = 0;
				for (let o = 0; o < octaves; o++) {
					val += amp * tileNoise(u, v, p);
					norm += amp;
					p *= 2;
					amp *= .48;
				}
				return val / norm;
			};
			for (let y = 0; y < size; y++) {
				const v = y / size;
				for (let x = 0; x < size; x++) {
					const u = x / size;
					const r = tileFbm(u, v, 4, 3);
					const g = tileFbm(u + .37, v + .19, 8, 3);
					const b = 1 - Math.abs(tileFbm(u + .61, v + .73, 6, 3) * 2 - 1);
					const a = tileNoise(u, v, 16);
					const idx = (y * size + x) * 4;
					data[idx + 0] = Math.round(Math.max(0, Math.min(1, r)) * 255);
					data[idx + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
					data[idx + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
					data[idx + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
				}
			}
			const tex = new three.DataTexture(data, size, size, three.RGBAFormat);
			tex.wrapS = three.RepeatWrapping;
			tex.wrapT = three.RepeatWrapping;
			tex.magFilter = three.LinearFilter;
			tex.minFilter = three.LinearFilter;
			tex.generateMipmaps = false;
			tex.needsUpdate = true;
			this.noiseTex = tex;
			return tex;
		},
		release() {
			this.refCount = Math.max(0, this.refCount - 1);
			if (this.refCount === 0 && this.noiseTex) {
				this.noiseTex.dispose();
				this.noiseTex = null;
			}
		}
	};
	var HyperdimensionalSoulFireballVFX = class {
		constructor(options = {}) {
			this.quality = options.quality ?? "high";
			if (![
				"high",
				"medium",
				"low"
			].includes(this.quality)) throw new RangeError("Invalid quality");
			this._qScale = this.quality === "low" ? .55 : this.quality === "medium" ? .78 : 1;
			this.duration = scalar(options.duration, DEFAULT_DURATION, "duration", (value) => positive(value) && value <= 86400);
			this._seed = scalar(options.seed, DEFAULT_SEED, "seed", Number.isSafeInteger);
			this._launchDefaults = launchSettings(options, {
				flightSpeed: 10.5,
				maxRange: 8.6,
				castDuration: .42,
				impactDuration: 1.55,
				arcHeight: 0,
				groundY: 0,
				onImpact: null,
				onComplete: null
			});
			Object.assign(this, this._launchDefaults);
			this.startPos = options.startPos === void 0 ? new three.Vector3(0, 1.45, 4.3) : scenePoint(options.startPos, "startPos").clone();
			this.direction = options.direction === void 0 ? new three.Vector3(0, 0, -1) : vector(options.direction, "direction").clone();
			this._normalizeDirection(this.direction);
			this.impactPos = options.impactPos === void 0 ? this.startPos.clone().addScaledVector(this.direction, this.maxRange) : vector(options.impactPos, "impactPos").clone();
			this._flightTotal = this._flightDuration(this.startPos, this.impactPos, this.flightSpeed);
			this.group = new three.Group();
			this.group.name = "HyperdimensionalSoulFireballVFX";
			this.state = "idle";
			this._stateTime = 0;
			this._generation = 0;
			this.time = 0;
			this.progress = 0;
			this.layerMap = Object.create(null);
			this._userLayerEnabled = Object.create(null);
			this._geometries = [];
			this._materials = [];
			this._v1 = new three.Vector3();
			this._v2 = new three.Vector3();
			this._v3 = new three.Vector3();
			this._v4 = new three.Vector3();
			this._v5 = new three.Vector3();
			this._right = new three.Vector3();
			this._binorm = new three.Vector3();
			this._tang = new three.Vector3();
			this._toCam = new three.Vector3();
			this._side = new three.Vector3();
			this._prevSide = new three.Vector3();
			this._orbPos = new three.Vector3();
			this._lastCamPos = new three.Vector3(0, 3, 9.6);
			this._arcStart = new three.Vector3();
			this._arcEnd = new three.Vector3();
			this._q1 = new three.Quaternion();
			this._m1 = new three.Matrix4();
			this._up = new three.Vector3(0, 1, 0);
			this._fwd = new three.Vector3(1, 0, 0);
			this._ptsPool = Array.from({ length: 36 }, () => new three.Vector3());
			this._noiseTex = _SoulFireballShared.getNoiseTexture();
			_SoulFireballShared.refCount++;
			try {
				this._buildAllLayers();
				this.setProgress(0);
			} catch (error) {
				this.dispose();
				throw error;
			}
		}
		_rand(n) {
			const x = Math.sin(n * 127.1 + this._seed * .0013) * 43758.5453123;
			return x - Math.floor(x);
		}
		_smoothstep(edge0, edge1, x) {
			const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
			return t * t * (3 - 2 * t);
		}
		_registerGeo(g) {
			this._geometries.push(g);
			return g;
		}
		_registerMat(m) {
			if (m.uniforms && !m.uniforms.uNoiseTex) m.uniforms.uNoiseTex = { value: this._noiseTex };
			this._materials.push(m);
			return m;
		}
		_registerLayer(id, label, obj, addToRoot = true) {
			obj.name = id;
			if (addToRoot) this.group.add(obj);
			this.layerMap[id] = {
				id,
				label,
				obj
			};
			this._userLayerEnabled[id] = true;
			return obj;
		}
		_applyPhaseVisibility(id, activeInPhase) {
			const entry = this.layerMap[id];
			if (entry) entry.obj.visible = this._userLayerEnabled[id] && activeInPhase;
		}
		_noiseGLSL() {
			return `
      uniform sampler2D uNoiseTex;
      float vnoise(vec3 p) {
        vec2 uv = p.xy * 0.14 + vec2(p.z * 0.23, -p.z * 0.17);
        return texture2D(uNoiseTex, uv).g;
      }
      float fbm(vec3 p) {
        vec2 uv1 = p.xy * 0.12 + vec2(p.z * 0.19, -p.z * 0.13);
        vec2 uv2 = p.yz * 0.17 + vec2(-p.x * 0.15, p.x * 0.11);
        vec4 t1 = texture2D(uNoiseTex, uv1);
        vec4 t2 = texture2D(uNoiseTex, uv2);
        return t1.r * 0.58 + t2.g * 0.30 + t1.a * 0.12;
      }
    `;
		}
		_buildSafeBasis(dir, rightOut, upOut) {
			if (Math.abs(dir.y) > .98) rightOut.set(1, 0, 0).crossVectors(dir, this._fwd).normalize();
			else rightOut.crossVectors(dir, this._up).normalize();
			upOut.crossVectors(rightOut, dir).normalize();
		}
		_setQuatFromForward(dir, qOut) {
			if (this._fwd.dot(dir) < -.9995) qOut.setFromAxisAngle(this._up, Math.PI);
			else qOut.setFromUnitVectors(this._fwd, dir);
			return qOut;
		}
		_evalFlightPos(u, out) {
			out.lerpVectors(this.startPos, this.impactPos, u);
			if (this.arcHeight !== 0) out.y += Math.sin(u * Math.PI) * this.arcHeight;
			return out;
		}
		_evalFlightTangent(u, out) {
			if (this.arcHeight === 0) {
				out.copy(this.impactPos).sub(this.startPos);
				if (out.lengthSq() < 1e-6) out.copy(this.direction);
				else out.normalize();
				return out;
			}
			const eps = .004;
			const u0 = Math.max(0, u - eps);
			const u1 = Math.min(1, u + eps);
			this._evalFlightPos(u0, this._v3);
			this._evalFlightPos(u1, this._v4);
			out.copy(this._v4).sub(this._v3).normalize();
			return out;
		}
		_createFlameFinsGeometry(baseRadius, length) {
			const finCount = 7;
			const segU = 14;
			const segV = 4;
			const vertsPerFin = 75;
			const totalVerts = 525;
			const positions = new Float32Array(totalVerts * 3);
			const normals = new Float32Array(totalVerts * 3);
			const uvs = new Float32Array(totalVerts * 2);
			const seeds = new Float32Array(totalVerts);
			const indices = [];
			for (let f = 0; f < finCount; f++) {
				const baseV = f * vertsPerFin;
				const baseAng = f / finCount * Math.PI * 2 + f % 2 * .28;
				const finLen = length * (.78 + f % 3 * .16);
				const flareOut = baseRadius * (.52 + f % 2 * .28);
				const twist = (f % 2 === 0 ? 1 : -1) * (.65 + f % 3 * .22);
				const startX = .26 - f % 3 * .1;
				const seedVal = f * 1.73 + .5;
				for (let iu = 0; iu <= segU; iu++) {
					const u = iu / segU;
					const x = startX - u * finLen;
					const arch = Math.sin(u * Math.PI * .85) * flareOut;
					const rCenter = baseRadius * (.46 - u * .16) + arch;
					const angCenter = baseAng + u * twist;
					const halfAngW = (.36 + .18 * Math.sin(u * Math.PI)) * Math.pow(1 - u, .65);
					for (let iv = 0; iv <= segV; iv++) {
						const v = iv / segV;
						const vCentered = (v - .5) * 2;
						const ang = angCenter + vCentered * halfAngW;
						const rCurve = rCenter * (1 - .14 * vCentered * vCentered);
						const y = Math.cos(ang) * rCurve;
						const z = Math.sin(ang) * rCurve;
						const idx = baseV + iu * 5 + iv;
						positions[idx * 3 + 0] = x;
						positions[idx * 3 + 1] = y;
						positions[idx * 3 + 2] = z;
						normals[idx * 3 + 0] = .2;
						normals[idx * 3 + 1] = Math.cos(ang);
						normals[idx * 3 + 2] = Math.sin(ang);
						uvs[idx * 2 + 0] = u;
						uvs[idx * 2 + 1] = v;
						seeds[idx] = seedVal;
						if (iu < segU && iv < segV) {
							const a = idx;
							const b = idx + 1;
							const c = idx + 5;
							const d = c + 1;
							indices.push(a, c, b, b, c, d);
						}
					}
				}
			}
			const geo = new three.BufferGeometry();
			const posBuf = new three.BufferAttribute(positions, 3);
			posBuf.setUsage(three.DynamicDrawUsage);
			geo.setAttribute("position", posBuf);
			geo.setAttribute("normal", new three.BufferAttribute(normals, 3));
			geo.setAttribute("uv", new three.BufferAttribute(uvs, 2));
			geo.setAttribute("aFinSeed", new three.BufferAttribute(seeds, 1));
			geo.setIndex(indices);
			geo.computeVertexNormals();
			return this._registerGeo(geo);
		}
		_createOpenFlameSleeveGeometry(frontR, rearR, length, segU, segV) {
			const positions = new Float32Array((segU + 1) * (segV + 1) * 3);
			const uvs = new Float32Array((segU + 1) * (segV + 1) * 2);
			const indices = [];
			for (let iu = 0; iu <= segU; iu++) {
				const u = iu / segU;
				const x = .18 - u * length;
				const r = frontR * (1 - u) + rearR * u + Math.sin(u * Math.PI) * .16;
				for (let iv = 0; iv <= segV; iv++) {
					const v = iv / segV;
					const ang = v * Math.PI * 2;
					const idx = iu * (segV + 1) + iv;
					positions[idx * 3 + 0] = x;
					positions[idx * 3 + 1] = Math.cos(ang) * r;
					positions[idx * 3 + 2] = Math.sin(ang) * r;
					uvs[idx * 2 + 0] = u;
					uvs[idx * 2 + 1] = v;
					if (iu < segU && iv < segV) {
						const a = idx, b = idx + 1, c = idx + (segV + 1), d = c + 1;
						indices.push(a, c, b, b, c, d);
					}
				}
			}
			const geo = new three.BufferGeometry();
			geo.setAttribute("position", new three.BufferAttribute(positions, 3));
			geo.setAttribute("uv", new three.BufferAttribute(uvs, 2));
			geo.setIndex(indices);
			geo.computeVertexNormals();
			return this._registerGeo(geo);
		}
		_createTeardropGeometry(radius, tailLength, segW, segH) {
			const geo = new three.SphereGeometry(radius, segW, segH);
			const pos = geo.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				let x = pos.getX(i);
				let y = pos.getY(i);
				let z = pos.getZ(i);
				const nx = x / radius;
				if (nx < 0) {
					const t = -nx;
					x = -t * tailLength;
					const pinch = Math.pow(1 - t * .94, .86);
					y *= pinch;
					z *= pinch;
				} else {
					x = Math.pow(nx, .86) * radius * 1.28;
					const noseTaper = 1 - .18 * nx * nx;
					y *= noseTaper;
					z *= noseTaper;
				}
				pos.setXYZ(i, x, y, z);
			}
			geo.computeVertexNormals();
			return this._registerGeo(geo);
		}
		_createMultiRibbonGeometry(ribbonCount, segments) {
			const vertsPerRibbon = (segments + 1) * 2;
			const totalVerts = ribbonCount * vertsPerRibbon;
			const positions = new Float32Array(totalVerts * 3);
			const uvs = new Float32Array(totalVerts * 2);
			const seeds = new Float32Array(totalVerts);
			const indices = [];
			for (let r = 0; r < ribbonCount; r++) {
				const baseV = r * vertsPerRibbon;
				const seedVal = r * 1.37 + .25;
				for (let i = 0; i <= segments; i++) {
					const u = i / segments;
					const vIdx = baseV + i * 2;
					uvs[vIdx * 2 + 0] = u;
					uvs[vIdx * 2 + 1] = 0;
					uvs[(vIdx + 1) * 2 + 0] = u;
					uvs[(vIdx + 1) * 2 + 1] = 1;
					seeds[vIdx] = seedVal;
					seeds[vIdx + 1] = seedVal;
					if (i < segments) {
						const a = vIdx, b = vIdx + 1, c = vIdx + 2, d = vIdx + 3;
						indices.push(a, c, b, b, c, d);
					}
				}
			}
			const geo = new three.BufferGeometry();
			geo.setAttribute("position", new three.BufferAttribute(positions, 3));
			geo.setAttribute("uv", new three.BufferAttribute(uvs, 2));
			geo.setAttribute("aRibbonSeed", new three.BufferAttribute(seeds, 1));
			geo.setIndex(indices);
			return this._registerGeo(geo);
		}
		_createStreakGeometry() {
			const geo = new three.BufferGeometry();
			const verts = new Float32Array([
				.55,
				0,
				0,
				.12,
				.022,
				0,
				-.65,
				0,
				0,
				.12,
				-.022,
				0,
				.55,
				0,
				0,
				.12,
				0,
				.022,
				-.65,
				0,
				0,
				.12,
				0,
				-.022
			]);
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
			const uvs = new Float32Array([
				1,
				.5,
				.65,
				1,
				0,
				.5,
				.65,
				0,
				1,
				.5,
				.65,
				1,
				0,
				.5,
				.65,
				0
			]);
			geo.setAttribute("position", new three.BufferAttribute(verts, 3));
			geo.setAttribute("uv", new three.BufferAttribute(uvs, 2));
			geo.setIndex(indices);
			return this._registerGeo(geo);
		}
		_buildAllLayers() {
			const noiseGLSL = this._noiseGLSL();
			this._projPivot = new three.Group();
			this.group.add(this._projPivot);
			const coreGeo = this._createTeardropGeometry(.34, 1.58, 24, 16);
			const coreMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uIntensity: { value: 1 }
				},
				vertexShader: `
        uniform float uTime;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        varying float vWave;
        ${noiseGLSL}
        void main() {
          float ang = atan(position.z, position.y);
          float tailFactor = (1.0 - smoothstep(-1.45, 0.36, position.x));
          vec3 dir = normalize(position + vec3(0.0001));

          // Smooth organic asymmetric flame sculpting (breaks egg symmetry without chunky clay lumps!)
          float n1 = fbm(dir * 2.5 + vec3(-uTime * 5.8, uTime * 1.4, -uTime * 1.1));
          float ridge = sin(ang * 3.0 + position.x * 2.8 - uTime * 7.6) * 0.52
                      + sin(ang * 5.0 - position.x * 3.6 - uTime * 9.2) * 0.28;
          vWave = clamp(0.5 + ridge * 0.42 + (n1 - 0.5) * 0.85, 0.0, 1.0);

          float amp = 0.065 + tailFactor * 0.22;
          vec3 p = position + normal * ((n1 - 0.46) * 1.15 + ridge * 0.34) * amp;
          // Graceful S-curve flame whip along the body
          p.y += sin(position.x * 2.6 - uTime * 8.4) * (0.04 + 0.16 * tailFactor);
          p.z += cos(position.x * 2.3 - uTime * 7.2) * (0.03 + 0.12 * tailFactor);

          vLocalPos = p;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        varying float vWave;
        ${noiseGLSL}
        void main() {
          // Domain-warped flowing flame heat (zero hard discard confetti, smooth creamy-white to orange-red!)
          float n1 = fbm(vLocalPos * 2.8 + vec3(-uTime * 8.2, 0.5, -0.3));
          float n2 = fbm(vLocalPos * 5.2 + vec3(-uTime * 11.0, n1 * 1.2, 1.4));
          float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
          float headFactor = smoothstep(-1.35, 0.30, vLocalPos.x);

          // Softly taper only the very back 22% into flame tips
          float tailAlpha = smoothstep(-1.55, -0.85, vLocalPos.x + (n1 - 0.48) * 0.55);
          if (tailAlpha < 0.02) discard;

          float heat = clamp(headFactor * 0.64 + ndv * 0.34 + vWave * 0.20 + (n2 - 0.46) * 0.28, 0.0, 1.0);

          vec3 colMagenta = vec3(0.76, 0.05, 0.34);
          vec3 colCrimson = vec3(1.06, 0.10, 0.24);
          vec3 colOrange  = vec3(1.28, 0.44, 0.06);
          vec3 colGold    = vec3(1.18, 0.80, 0.18);
          vec3 colCream   = vec3(1.24, 1.14, 0.84);

          float texHeat = clamp(heat - (1.0 - n2) * 0.22, 0.0, 1.0);
          vec3 col = mix(colMagenta, colCrimson, smoothstep(0.08, 0.28, texHeat));
          col = mix(col, colOrange, smoothstep(0.28, 0.52, texHeat));
          col = mix(col, colGold, smoothstep(0.52, 0.78, texHeat));
          col = mix(col, colCream, smoothstep(0.82, 0.98, texHeat));

          gl_FragColor = vec4(col * uIntensity, tailAlpha);
        }
      `,
				transparent: true,
				depthWrite: true,
				side: three.FrontSide
			}));
			this._l01Core = new three.Mesh(coreGeo, coreMat);
			this._l01Core.renderOrder = 5;
			this._projPivot.add(this._l01Core);
			this._registerLayer("L01_IncandescentCore", "01 流體不規則熾熱火核", this._l01Core, false);
			const mantleGeo = this._createFlameFinsGeometry(.42, 2.35);
			const mantleMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uAlpha: { value: 1 }
				},
				vertexShader: `
        attribute float aFinSeed;
        uniform float uTime;
        varying vec2 vUv;
        varying float vSeed;
        ${noiseGLSL}
        void main() {
          vUv = uv;
          vSeed = aFinSeed;
          float u = uv.x;
          vec3 p = position;
          // Graceful high-speed flutter rippling from root (u=0) to tip (u=1)
          float flutter = sin(u * 6.5 - uTime * 11.5 + aFinSeed) * 0.14 * u;
          float sway = cos(u * 4.2 - uTime * 8.2 + aFinSeed * 1.4) * 0.12 * u;
          p.y += flutter + sin(u * 3.0 - uTime * 7.5) * 0.14 * u * u;
          p.z += sway;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uAlpha;
        varying vec2 vUv;
        varying float vSeed;
        ${noiseGLSL}
        void main() {
          // vUv.x: 0 (front) -> 1 (tip); vUv.y: 0..1 across fin width
          float across = abs(vUv.y - 0.5) * 2.0;
          float n = fbm(vec3(vUv.x * 4.6 - uTime * 7.8, vUv.y * 2.2, vSeed));

          // Smooth painterly flame silhouette with monotonic axial taper (ZERO floating islands!)
          float widthProfile = (1.0 - pow(vUv.x, 1.35)) * (0.78 + 0.42 * n);
          float edgeAlpha = (1.0 - smoothstep(widthProfile - 0.22, widthProfile + 0.18, across));
          float rootFade = smoothstep(0.0, 0.44, vUv.x);
          float tipFade = (1.0 - smoothstep(0.24, 1.0, vUv.x));
          float alpha = edgeAlpha * rootFade * tipFade * 0.84 * uAlpha;
          if (alpha < 0.02) discard;

          vec3 colDeepMag = vec3(0.46, 0.02, 0.34);
          vec3 colCrimson = vec3(1.04, 0.08, 0.30);
          vec3 colOrange  = vec3(1.26, 0.44, 0.06);
          vec3 colGold    = vec3(1.44, 0.98, 0.26);

          float heat = clamp((1.0 - vUv.x * 1.15) * (1.0 - across * 0.42) + (n - 0.45) * 0.35, 0.0, 1.0);
          vec3 col = mix(colDeepMag, colCrimson, smoothstep(0.10, 0.32, heat));
          col = mix(col, colOrange, smoothstep(0.32, 0.58, heat));
          col = mix(col, colGold, smoothstep(0.60, 0.84, heat));

          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide
			}));
			this._l02Mantle = new three.Mesh(mantleGeo, mantleMat);
			this._l02Mantle.renderOrder = 6;
			this._projPivot.add(this._l02Mantle);
			this._registerLayer("L02_FlameMantleShell", "02 流體雕塑火舌鰭片", this._l02Mantle, false);
			const sheathGeo = this._createOpenFlameSleeveGeometry(.46, .1, 3.05, 20, 16);
			const sheathMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uAlpha: { value: 1 }
				},
				vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        ${noiseGLSL}
        void main() {
          vUv = uv;
          float u = uv.x;
          float n = fbm(vec3(u * 3.8 - uTime * 6.0, uv.y * 4.0, 2.1));
          vec3 p = position + normal * (n - 0.45) * (0.06 + u * 0.42);
          // Matching S-curve whip flowing into L06 void smoke ribbons
          p.y += sin(u * 4.5 - uTime * 7.8) * 0.24 * u;
          p.z += cos(u * 3.8 - uTime * 6.8) * 0.18 * u;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uAlpha;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        ${noiseGLSL}
        void main() {
          float u = vUv.x;
          float ang = vUv.y * 6.28318;
          // Seamless cylindrical noise via cos/sin(ang)
          float n1 = fbm(vec3(u * 5.2 - uTime * 6.8, cos(ang) * 1.6, sin(ang) * 1.6));
          float n2 = vnoise(vec3(u * 12.0 - uTime * 10.5, cos(ang) * 3.2, sin(ang) * 3.2));
          float wisp = n1 * 0.72 + n2 * 0.28;

          float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
          float rim = pow(1.0 - ndv, 0.85);

          // Smooth anti-aliased onset behind nose (never muddies bright head!) + smooth axial dissipation
          float frontFade = smoothstep(0.20, 0.48, u + (wisp - 0.5) * 0.14);
          float rearFade = (1.0 - smoothstep(0.35, 1.0, u));
          float erode = smoothstep(0.32 + u * 0.26, 0.52 + u * 0.22, wisp);
          float alpha = frontFade * rearFade * erode * (0.55 + 0.45 * rim) * 0.90 * uAlpha;
          if (alpha < 0.02) discard;

          vec3 colVoid = vec3(0.06, 0.01, 0.11);
          vec3 colPlum = vec3(0.28, 0.02, 0.28);
          vec3 colMag  = vec3(0.96, 0.08, 0.40);

          vec3 col = mix(colVoid, colPlum, smoothstep(0.28, 0.62, wisp));
          float vein = smoothstep(0.50, 0.78, wisp) * (1.0 - smoothstep(0.20, 0.85, u));
          col = mix(col, colMag, clamp(vein * 1.25 + rim * 0.35 * (1.0 - u), 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide
			}));
			this._l03Sheath = new three.Mesh(sheathGeo, sheathMat);
			this._l03Sheath.renderOrder = 7;
			this._projPivot.add(this._l03Sheath);
			this._registerLayer("L03_DarkVoidFlameSheath", "03 暗紫虛空流體焰袍", this._l03Sheath, false);
			const haloGeo = this._registerGeo(new three.PlaneGeometry(3.6, 3.6));
			const haloMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uColorInner: { value: new three.Color(16751413) },
					uColorOuter: { value: new three.Color(14030924) },
					uOpacity: { value: .48 }
				},
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec3 scale = vec3(
            length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2])),
            length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2])),
            1.0
          );
          mvCenter.xy += position.xy * scale.xy;
          gl_Position = projectionMatrix * mvCenter;
        }
      `,
				fragmentShader: `
        uniform vec3 uColorInner;
        uniform vec3 uColorOuter;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          float glow = exp(-d * d * 4.0) * (1.0 - smoothstep(0.12, 1.0, d));
          vec3 col = mix(uColorOuter, uColorInner, exp(-d * d * 5.8));
          gl_FragColor = vec4(col, glow * uOpacity);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending
			}));
			this._l04Halo = new three.Mesh(haloGeo, haloMat);
			this._l04Halo.renderOrder = 14;
			this._registerLayer("L04_Level2OuterGlowHalo", "04 第2級柔光外散暈層", this._l04Halo);
			this._l05Group = new three.Group();
			const portalMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
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
        ${noiseGLSL}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);

          // Domain-warped arcane vortex mist + organic torn energy arcs (no mechanical zebra rings!)
          float swirlAng = ang + (1.0 - r) * 3.2 - uTime * 2.6;
          vec2 swirlP = vec2(cos(swirlAng), sin(swirlAng)) * r;
          float n = fbm(vec3(swirlP * 3.4, uTime * 0.9));

          float outerRing = exp(-pow((r - 0.78 + (n - 0.5) * 0.12) * 14.0, 2.0));
          float innerRing = exp(-pow((r - 0.46 + (n - 0.5) * 0.09) * 18.0, 2.0));
          float arcBreak = smoothstep(0.28, 0.72, n + 0.25 * sin(ang * 3.0 - uTime * 3.2));
          float vortexMist = (1.0 - smoothstep(0.15, 0.92, r)) * smoothstep(0.32, 0.78, n) * 0.58;
          float runeSparks = smoothstep(0.76, 0.94, n) * outerRing * 1.4;

          float alpha = clamp((outerRing * arcBreak * 0.95 + innerRing * 0.75 + vortexMist + runeSparks), 0.0, 1.0) * uOpacity;
          if (alpha < 0.03) discard;

          vec3 colVoid    = vec3(0.22, 0.04, 0.38);
          vec3 colMagenta = vec3(0.98, 0.14, 0.52);
          vec3 colGold    = vec3(1.25, 0.88, 0.34);

          vec3 col = mix(colVoid, colMagenta, clamp(outerRing + innerRing * 0.8, 0.0, 1.0));
          col = mix(col, colGold, clamp(innerRing * 0.55 + runeSparks * 0.8, 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide
			}));
			const hexMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
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
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);
          // Crisp 6-pointed hyperdimensional arcane star + fine inscribed geometric circles
          float hex1 = abs(cos(ang * 3.0) * r - 0.36);
          float hex2 = abs(sin(ang * 3.0) * r - 0.36);
          float starLine = (exp(-hex1 * 28.0) + exp(-hex2 * 28.0)) * (1.0 - smoothstep(0.72, 0.86, r));
          float fineRing = exp(-abs(r - 0.76) * 42.0) + exp(-abs(r - 0.54) * 38.0) * 0.7;
          float ticks = smoothstep(0.82, 0.98, abs(sin(ang * 12.0 + uTime * 2.0))) * exp(-abs(r - 0.65) * 26.0);
          float alpha = clamp(starLine * 0.85 + fineRing * 0.75 + ticks * 0.9, 0.0, 1.0) * uOpacity;
          if (alpha < 0.03) discard;
          vec3 colViolet = vec3(0.72, 0.22, 1.0);
          vec3 colGold   = vec3(1.38, 1.02, 0.36);
          vec3 col = mix(colViolet, colGold, clamp(starLine * 0.7 + ticks, 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide
			}));
			const portalGeoA = this._registerGeo(new three.PlaneGeometry(2.85, 2.85));
			const portalGeoB = this._registerGeo(new three.PlaneGeometry(2.05, 2.05));
			const portalGeoC = this._registerGeo(new three.PlaneGeometry(2.55, 2.55));
			this._riftRingA = new three.Mesh(portalGeoA, portalMat);
			this._riftRingB = new three.Mesh(portalGeoB, portalMat);
			this._riftRingC = new three.Mesh(portalGeoC, hexMat);
			this._riftRingB.position.z = .22;
			this._riftRingB.rotation.x = .24;
			this._riftRingC.position.z = -.14;
			this._riftRingC.rotation.y = .18;
			this._l05Group.add(this._riftRingA, this._riftRingB, this._riftRingC);
			this._l05Group.renderOrder = 10;
			this._registerLayer("L05_DimensionalRiftRings", "05 超維空間裂隙法陣", this._l05Group);
			const VOID_RIBBON_COUNT = 6;
			const VOID_RIBBON_SEGS = 30;
			const voidRibbonGeo = this._createMultiRibbonGeometry(VOID_RIBBON_COUNT, VOID_RIBBON_SEGS);
			const voidRibbonMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        attribute float aRibbonSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = uv;
          vSeed = aRibbonSeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vSeed;
        ${noiseGLSL}
        void main() {
          float across = abs(vUv.y - 0.5) * 2.0;
          float n1 = fbm(vec3(vUv.x * 7.2 - uTime * 4.5, vUv.y * 3.2, vSeed));
          float n2 = vnoise(vec3(vUv.x * 16.0 - uTime * 8.0, vUv.y * 6.5, vSeed + 4.1));
          float tear = n1 * 0.72 + n2 * 0.28;

          float widthMask = (1.0 - smoothstep(0.20, 0.98, across + (tear - 0.45) * 0.92));
          float tailFade = (1.0 - smoothstep(0.16, 1.0, vUv.x)) * smoothstep(0.0, 0.05, vUv.x);
          float erode = smoothstep(0.24, 0.54, (1.0 - vUv.x * 0.75) + (tear - 0.46) * 0.82);
          float alpha = widthMask * tailFade * erode * 0.96 * uOpacity;
          if (alpha < 0.04) discard;

          vec3 colVoid    = vec3(0.06, 0.01, 0.10);
          vec3 colPurple  = vec3(0.24, 0.02, 0.25);
          vec3 colCrimson = vec3(0.84, 0.05, 0.32);
          vec3 colHot     = vec3(1.10, 0.44, 0.10);

          float heat = clamp((1.0 - vUv.x * 1.45) * (1.0 - across * 0.55) + (tear - 0.48) * 0.45, 0.0, 1.0);
          vec3 col = mix(colVoid, colPurple, smoothstep(0.08, 0.34, heat));
          col = mix(col, colCrimson, smoothstep(0.34, 0.62, heat));
          col = mix(col, colHot, smoothstep(0.68, 0.90, heat));
          // Shimmering molten soul-fire vein inside the dark void smoke ribbon
          float sparkVein = smoothstep(0.74, 0.92, n2) * (1.0 - smoothstep(0.08, 0.75, vUv.x)) * (1.0 - across);
          col += vec3(1.15, 0.55, 0.16) * sparkVein * 0.65;
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide
			}));
			this._l06VoidRibbons = new three.Mesh(voidRibbonGeo, voidRibbonMat);
			this._l06VoidRibbons.frustumCulled = false;
			this._l06VoidRibbons.renderOrder = 4;
			this._voidRibbonConfigs = [
				{
					phase: .3,
					radius: .12,
					width: .66,
					lengthU: .96,
					lift: .88,
					sAmp: .42
				},
				{
					phase: 1.5,
					radius: .24,
					width: .38,
					lengthU: .88,
					lift: .58,
					sAmp: .34
				},
				{
					phase: 2.8,
					radius: .2,
					width: .3,
					lengthU: .82,
					lift: .72,
					sAmp: .38
				},
				{
					phase: 4.1,
					radius: .32,
					width: .24,
					lengthU: .74,
					lift: .32,
					sAmp: .28
				},
				{
					phase: 5.2,
					radius: .16,
					width: .46,
					lengthU: .92,
					lift: 1.05,
					sAmp: .46
				},
				{
					phase: 6,
					radius: .28,
					width: .22,
					lengthU: .66,
					lift: .18,
					sAmp: .22
				}
			];
			this._voidRibbonSegs = VOID_RIBBON_SEGS;
			this._registerLayer("L06_VoidSmokeRibbons", "06 虛空暗紫煙焰絲帶", this._l06VoidRibbons);
			const orbGeo = this._registerGeo(new three.SphereGeometry(.24, 18, 14));
			const orbMat = this._registerMat(new three.ShaderMaterial({
				uniforms: { uTime: { value: 0 } },
				vertexShader: `
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        void main() {
          vLocalPos = position;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
          #endif
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        ${noiseGLSL}
        void main() {
          float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
          // Organic swirling fiery soul-ember core (matches reference orbs, zero stripes!)
          float n1 = fbm(vLocalPos * 7.5 + vec3(uTime * 3.2, -uTime * 2.4, 0.0));
          float n2 = fbm(vLocalPos * 12.0 + vec3(-uTime * 4.5, n1 * 1.4, uTime * 2.1));
          float swirlRim = smoothstep(0.58, 0.88, n2) * (1.0 - ndv) * 0.42;
          float heat = clamp(ndv * 0.80 + (n1 - 0.44) * 0.40 + swirlRim, 0.0, 1.0);

          vec3 colVoid = vec3(0.18, 0.02, 0.22);
          vec3 colMag  = vec3(0.92, 0.08, 0.34);
          vec3 colOrg  = vec3(1.14, 0.52, 0.10);
          vec3 colCore = vec3(1.40, 1.26, 0.74);

          vec3 col = mix(colVoid, colMag, smoothstep(0.10, 0.34, heat));
          col = mix(col, colOrg, smoothstep(0.34, 0.64, heat));
          col = mix(col, colCore, smoothstep(0.68, 0.88, heat));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
				transparent: false,
				depthWrite: true,
				side: three.FrontSide
			}));
			this._l07Orbs = new three.InstancedMesh(orbGeo, orbMat, 3);
			this._l07Orbs.frustumCulled = false;
			this._l07Orbs.renderOrder = 8;
			this._soulOrbConfigs = [
				{
					baseAngle: .45,
					flightRadius: .72,
					impactRadius: 1.98,
					scale: .96,
					impactScale: 1.12,
					tilt: .85
				},
				{
					baseAngle: 2.65,
					flightRadius: .88,
					impactRadius: 2.22,
					scale: .78,
					impactScale: .98,
					tilt: -.76
				},
				{
					baseAngle: 4.7,
					flightRadius: .64,
					impactRadius: 1.56,
					scale: .64,
					impactScale: .78,
					tilt: .52
				}
			];
			this._registerLayer("L07_OrbitingSoulOrbs", "07 環繞靈魂火珠", this._l07Orbs);
			const ORB_TRAIL_SEGS = 28;
			const orbTrailGeo = this._createMultiRibbonGeometry(3, ORB_TRAIL_SEGS);
			const orbTrailMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        attribute float aRibbonSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = uv;
          vSeed = aRibbonSeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vSeed;
        ${noiseGLSL}
        void main() {
          float across = abs(vUv.y - 0.5) * 2.0;
          float n = fbm(vec3(vUv.x * 5.5 - uTime * 4.0, vUv.y * 2.4, vSeed + 2.0));
          float mask = (1.0 - smoothstep(0.14, 1.0, across + (n - 0.48) * 0.50));
          float fade = (1.0 - smoothstep(0.20, 0.96, vUv.x)) * smoothstep(0.0, 0.04, vUv.x);
          float alpha = mask * fade * 0.84 * uOpacity;
          if (alpha < 0.02) discard;
          vec3 colDark = vec3(0.20, 0.03, 0.24);
          vec3 colMag  = vec3(0.86, 0.10, 0.36);
          vec3 colHot  = vec3(1.12, 0.54, 0.16);
          vec3 col = mix(colDark, colMag, smoothstep(0.10, 0.62, 1.0 - vUv.x));
          col = mix(col, colHot, smoothstep(0.76, 0.98, 1.0 - vUv.x) * (1.0 - across));
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				side: three.DoubleSide
			}));
			this._l08OrbTrails = new three.Mesh(orbTrailGeo, orbTrailMat);
			this._l08OrbTrails.frustumCulled = false;
			this._l08OrbTrails.renderOrder = 6;
			this._orbTrailSegs = ORB_TRAIL_SEGS;
			this._registerLayer("L08_SoulOrbTrails", "08 靈魂火珠流光拖尾", this._l08OrbTrails);
			const lickCount = Math.max(12, Math.round(28 * this._qScale));
			const lickGeo = this._createTeardropGeometry(.062, .42, 8, 6);
			const lickMat = this._registerMat(new three.ShaderMaterial({
				uniforms: { uOpacity: { value: 1 } },
				vertexShader: `
        attribute float aHeat;
        varying float vHeat;
        varying vec3 vLocalPos;
        void main() {
          vHeat = aHeat;
          vLocalPos = position;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
          #endif
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
				fragmentShader: `
        uniform float uOpacity;
        varying float vHeat;
        varying vec3 vLocalPos;
        void main() {
          float tip = smoothstep(-0.40, 0.08, vLocalPos.x);
          vec3 colDark = vec3(0.82, 0.07, 0.28);
          vec3 colRed  = vec3(0.98, 0.10, 0.30);
          vec3 colGold = vec3(1.22, 0.80, 0.20);
          vec3 col = mix(colDark, colRed, smoothstep(0.05, 0.52, tip * vHeat));
          col = mix(col, colGold, smoothstep(0.56, 0.90, tip * vHeat));
          gl_FragColor = vec4(col, clamp(vHeat * 1.15, 0.0, 1.0) * uOpacity);
        }
      `,
				transparent: true,
				depthWrite: false,
				side: three.FrontSide
			}));
			this._lickHeatAttr = new three.InstancedBufferAttribute(new Float32Array(lickCount), 1);
			lickGeo.setAttribute("aHeat", this._lickHeatAttr);
			this._l09Licks = new three.InstancedMesh(lickGeo, lickMat, lickCount);
			this._l09Licks.frustumCulled = false;
			this._l09Licks.renderOrder = 8;
			this._lickSeeds = Array.from({ length: lickCount }, (_, i) => ({
				offset: this._rand(i * 7 + 1),
				angle: this._rand(i * 7 + 2) * Math.PI * 2,
				rad: .3 + this._rand(i * 7 + 3) * .44,
				scale: .68 + this._rand(i * 7 + 5) * .85
			}));
			this._registerLayer("L09_SoulLickFlames", "09 剝離火舌碎片", this._l09Licks);
			const starGeo = this._registerGeo(new three.PlaneGeometry(2.8, 2.8));
			const starMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uAge: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec3 scale = vec3(
            length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2])),
            length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2])),
            1.0
          );
          mvCenter.xy += position.xy * scale.xy;
          gl_Position = projectionMatrix * mvCenter;
        }
      `,
				fragmentShader: `
        uniform float uAge;
        uniform float uOpacity;
        varying vec2 vUv;
        ${noiseGLSL}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;

          // Organic jagged 4-branch asymmetric fissure crack matching reference right-side core!
          float n1 = fbm(vec3(p * 3.8, uAge * 1.8));
          vec2 q = p + (n1 - 0.5) * 0.24;
          float a = atan(q.y, q.x);
          // 4 irregular angled crack arms (not evenly spaced snowflake!)
          // Soft organic molten fire-crevice arms + warm inner core glow (no sharp X sticker!)
          float c1 = exp(-pow(abs(sin((a - 0.42) * 0.5)) * 5.2, 1.4)) * (1.0 - smoothstep(0.12, 0.88, r));
          float c2 = exp(-pow(abs(sin((a - 2.35) * 0.5)) * 5.0, 1.4)) * (1.0 - smoothstep(0.12, 0.80, r));
          float c3 = exp(-pow(abs(sin((a + 1.28) * 0.5)) * 5.8, 1.4)) * (1.0 - smoothstep(0.12, 0.72, r));
          float cracks = clamp((c1 + c2 + c3) * mix(0.85, 0.58, uAge), 0.0, 1.0);
          float core = exp(-r * r * mix(8.5, 16.0, uAge));
          float warmAura = exp(-r * r * 3.8) * 0.45;
          float val = clamp(cracks * 0.76 + core * 0.88 + warmAura, 0.0, 1.0);
          if (val < 0.04) discard;

          vec3 colOrange = vec3(1.22, 0.48, 0.06);
          vec3 colGold   = vec3(1.38, 1.04, 0.30);
          vec3 colWhite  = vec3(1.52, 1.48, 1.24);

          vec3 col = mix(colOrange, colGold, smoothstep(0.14, 0.52, val));
          col = mix(col, colWhite, smoothstep(0.56, 0.86, val));

          gl_FragColor = vec4(col, val * uOpacity);
        }
      `,
				transparent: true,
				depthWrite: false,
				depthTest: false,
				blending: three.AdditiveBlending
			}));
			this._l10Starburst = new three.Mesh(starGeo, starMat);
			this._l10Starburst.renderOrder = 15;
			this._registerLayer("L10_ImpactStarburstCore", "10 命中不對稱星裂核心", this._l10Starburst);
			const cloudCount = Math.max(14, Math.round(22 * this._qScale));
			const cloudGeo = this._registerGeo(new three.SphereGeometry(.58, 16, 10));
			const cloudMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uImpactPos: { value: this.impactPos.clone() }
				},
				vertexShader: `
        varying vec3 vToCoreLocal;
        varying vec3 vNormalLocal;
        uniform vec3 uImpactPos;
        attribute vec4 aCloudData; // x: seed, y: localAge, z: heatBias, w: unused
        uniform float uTime;
        varying vec3 vViewNormal;
        varying vec3 vViewPosition;
        varying vec3 vLocalPos;
        varying vec4 vData;
        ${noiseGLSL}
        void main() {
          vData = aCloudData;
          vec3 dir = normalize(position);
          float n = fbm(dir * 2.5 + vec3(aCloudData.x * 10.0, -uTime * 1.9, aCloudData.x * 5.0));
          vec3 p = position + normal * (n - 0.45) * 0.16;
          vLocalPos = p;
          vec4 local = vec4(p, 1.0);
          vec3 localNormal = normal;
          #ifdef USE_INSTANCING
            local = instanceMatrix * local;
            mat3 m = mat3(instanceMatrix);
            // Instance transforms combine rotation and non-uniform scale, without shear.
            vec3 scaleSquared = vec3(dot(m[0], m[0]), dot(m[1], m[1]), dot(m[2], m[2]));
            localNormal = m * (normal / max(scaleSquared, vec3(1e-8)));
          #endif
          vec4 viewPosition = modelViewMatrix * local;
          vViewPosition = -viewPosition.xyz;
          vToCoreLocal = uImpactPos - local.xyz;
          vNormalLocal = localNormal;
          vViewNormal = normalMatrix * localNormal;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        varying vec3 vToCoreLocal;
        varying vec3 vNormalLocal;
        varying vec3 vViewNormal;
        varying vec3 vViewPosition;
        varying vec3 vLocalPos;
        varying vec4 vData;
        ${noiseGLSL}
        void main() {
          float age = vData.y;
          if (age <= 0.001 || age >= 0.999) discard;

          float n = fbm(vLocalPos * 3.2 + vec3(vData.x * 13.0, -uTime * 2.2, 0.0));
          float dissolve = smoothstep(0.62, 0.98, age);
          float cut = n - dissolve * 1.12 + 0.34;
          if (cut < 0.0) discard;

          // Vibrant Blizzard-style Shadowflame fire cloud shading:
          // Front-facing billowing lobes are lush vivid crimson/scarlet-red,
          // crevices near impactPos blaze orange-gold & incandescent yellow,
          // and only the narrow outer rim drops to deep plum/void violet!
          float dist = length(vToCoreLocal);
          vec3 dirToCore = vToCoreLocal / max(0.001, dist);
          vec3 N = normalize(vViewNormal);
          vec3 V = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);

          float ndv = clamp(dot(N, V), 0.0, 1.0);
          float nearCore = (1.0 - smoothstep(0.35, 2.20, dist));
          float inward = clamp(dot(normalize(vNormalLocal), dirToCore) * 0.5 + 0.5, 0.0, 1.0);
          // Blazing incandescent fire burst at 56% (zero dark rock!), lush scarlet lobes + fiery crevices at 64%!
          float earlyBoost = (1.0 - smoothstep(0.0, 0.24, age)) * 0.25;
          float coolDown = smoothstep(0.48, 0.98, age) * 0.32;

          float heat = clamp(
            ndv * 0.44 + nearCore * 0.62 + inward * 0.38 + (n - 0.44) * 0.24 + vData.z * 0.14 + earlyBoost - coolDown,
            0.0, 1.0
          );

          vec3 colVoid    = vec3(0.18, 0.015, 0.20);
          vec3 colRuby    = vec3(0.96, 0.06, 0.20);
          vec3 colScarlet = vec3(1.26, 0.15, 0.12);
          vec3 colOrange  = vec3(1.42, 0.58, 0.07);
          vec3 colYellow  = vec3(1.36, 1.22, 0.64);

          vec3 col = mix(colVoid, colRuby, smoothstep(0.06, 0.18, heat));
          col = mix(col, colScarlet, smoothstep(0.16, 0.42, heat));
          col = mix(col, colOrange, smoothstep(0.54, 0.74, heat));
          col = mix(col, colYellow, smoothstep(0.76, 0.90, heat));

          // Suppress rim darkening during incandescent peak (56%), crisp plum toon rim during billowing (64%)
          float rimMask = smoothstep(0.04, 0.24, ndv);
          float rimDark = mix(0.28, 0.42, smoothstep(0.08, 0.32, age));
          col = mix(colVoid, col, (1.0 - rimDark) + rimDark * rimMask);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
				transparent: false,
				depthWrite: true,
				side: three.FrontSide
			}));
			this._cloudDataAttr = new three.InstancedBufferAttribute(new Float32Array(cloudCount * 4), 4);
			cloudGeo.setAttribute("aCloudData", this._cloudDataAttr);
			this._l11FireCloud = new three.InstancedMesh(cloudGeo, cloudMat, cloudCount);
			this._l11FireCloud.frustumCulled = false;
			this._l11FireCloud.renderOrder = 9;
			this._cloudSeeds = Array.from({ length: cloudCount }, (_, i) => {
				const phi = Math.acos(1 - 2 * (i + .5) / cloudCount);
				const theta = Math.PI * (1 + Math.sqrt(5)) * i;
				return {
					dir: new three.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi) * .78 + .14, Math.sin(phi) * Math.sin(theta)).normalize(),
					dist: .44 + this._rand(i * 11 + 1) * .88,
					baseScale: .64 + this._rand(i * 11 + 2) * .68,
					delay: this._rand(i * 11 + 3) * .032,
					heatBias: (i < 7 ? .26 : -.06) + (this._rand(i * 11 + 4) - .5) * .18,
					seed: this._rand(i * 11 + 5)
				};
			});
			this._registerLayer("L11_BillowingFireCloud", "11 翻捲體積烈焰雲團", this._l11FireCloud);
			const streakCount = Math.max(16, Math.round(36 * this._qScale));
			const streakGeo = this._createStreakGeometry();
			const streakMat = this._registerMat(new three.ShaderMaterial({
				uniforms: { uOpacity: { value: 1 } },
				vertexShader: `
        attribute float aAlpha;
        varying float vAlpha;
        varying vec2 vUv;
        void main() {
          vAlpha = aAlpha;
          vUv = uv;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
          #endif
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
				fragmentShader: `
        uniform float uOpacity;
        varying float vAlpha;
        varying vec2 vUv;
        void main() {
          if (vAlpha < 0.01) discard;
          vec3 colTail = vec3(0.88, 0.06, 0.22);
          vec3 colMid  = vec3(1.08, 0.34, 0.06);
          vec3 colHead = vec3(1.22, 0.88, 0.28);
          vec3 col = mix(colTail, colMid, smoothstep(0.15, 0.62, vUv.x));
          col = mix(col, colHead, smoothstep(0.65, 0.96, vUv.x));
          gl_FragColor = vec4(col, vAlpha * uOpacity);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide
			}));
			this._streakAlphaAttr = new three.InstancedBufferAttribute(new Float32Array(streakCount), 1);
			streakGeo.setAttribute("aAlpha", this._streakAlphaAttr);
			this._l12Streaks = new three.InstancedMesh(streakGeo, streakMat, streakCount);
			this._l12Streaks.frustumCulled = false;
			this._l12Streaks.renderOrder = 11;
			this._streakSeeds = Array.from({ length: streakCount }, (_, i) => {
				const phi = Math.acos(1 - 2 * this._rand(i * 13 + 1));
				const theta = this._rand(i * 13 + 2) * Math.PI * 2;
				const dir = new three.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi) * .85 + .15, Math.sin(phi) * Math.sin(theta)).normalize();
				const isHero = i < 5;
				return {
					dir,
					speed: isHero ? 2.6 + this._rand(i * 13 + 3) * 1.4 : 1.2 + this._rand(i * 13 + 3) * 1.6,
					length: isHero ? 1.15 + this._rand(i * 13 + 4) * .55 : .32 + this._rand(i * 13 + 4) * .48,
					width: isHero ? .85 : .45 + this._rand(i * 13 + 5) * .35,
					life: isHero ? .26 + this._rand(i * 13 + 6) * .1 : .16 + this._rand(i * 13 + 6) * .16
				};
			});
			this._registerLayer("L12_RadialEmberStreaks", "12 徑向高速火星射線", this._l12Streaks);
			const smokeCount = Math.max(14, Math.round(32 * this._qScale));
			const smokeGeo = this._registerGeo(new three.PlaneGeometry(1.75, 1.75));
			const smokeMat = this._registerMat(new three.ShaderMaterial({
				uniforms: { uTime: { value: 0 } },
				vertexShader: `
        attribute vec4 aSmokeData; // x: seed, y: age, z: scale, w: rot
        varying vec2 vUv;
        varying vec4 vData;
        void main() {
          vUv = uv;
          vData = aSmokeData;
          float c = cos(aSmokeData.w);
          float s = sin(aSmokeData.w);
          vec2 rotPos = vec2(position.x * c - position.y * s, position.x * s + position.y * c) * aSmokeData.z;
          #ifdef USE_INSTANCING
            vec4 centerMV = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #else
            vec4 centerMV = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #endif
          centerMV.xy += rotPos;
          gl_Position = projectionMatrix * centerMV;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec4 vData;
        ${noiseGLSL}
        void main() {
          float age = vData.y;
          if (age <= 0.001 || age >= 0.999) discard;
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;

          // Pure Cartesian domain-warped FBM (eliminates all polar spoke artifacts!)
          float sd = vData.x * 9.7;
          vec2 warp = vec2(
            fbm(vec3(p * 2.1 + vec2(sd, -uTime * 0.45), sd * 0.3)),
            fbm(vec3(p * 2.1 + vec2(sd + 5.2, uTime * 0.35), sd * 0.7))
          ) - 0.5;
          float wisp = fbm(vec3((p + warp * 0.75) * 2.6 + vec2(0.0, -uTime * 0.55), sd));

          float radialMask = (1.0 - smoothstep(0.14, 0.96, r + (wisp - 0.45) * 0.72));
          float dissolve = smoothstep(0.30, 1.0, age);
          float erode = smoothstep(0.18 + dissolve * 0.68, 0.58 + dissolve * 0.40, wisp + (1.0 - r) * 0.32);
          float alpha = radialMask * erode * (1.0 - smoothstep(0.60, 1.0, age)) * 0.76;
          if (alpha < 0.02) discard;

          vec3 colVoid = vec3(0.07, 0.015, 0.10);
          vec3 colPlum = vec3(0.22, 0.03, 0.24);
          vec3 colRim  = vec3(0.60, 0.06, 0.30);
          vec3 col = mix(colVoid, colPlum, smoothstep(0.25, 0.72, wisp));
          col = mix(col, colRim, smoothstep(0.65, 0.95, (1.0 - r) * (1.0 - age) * 1.25));
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false
			}));
			this._smokeDataAttr = new three.InstancedBufferAttribute(new Float32Array(smokeCount * 4), 4);
			smokeGeo.setAttribute("aSmokeData", this._smokeDataAttr);
			this._l13Smoke = new three.InstancedMesh(smokeGeo, smokeMat, smokeCount);
			this._l13Smoke.frustumCulled = false;
			this._l13Smoke.renderOrder = 3;
			this._smokeSeeds = Array.from({ length: smokeCount }, (_, i) => {
				const a = i / smokeCount * Math.PI * 2 + this._rand(i * 5 + 1) * .5;
				const elev = (this._rand(i * 5 + 2) - .35) * 1.15;
				return {
					dir: new three.Vector3(Math.cos(a), elev, Math.sin(a)).normalize(),
					dist: .95 + this._rand(i * 5 + 3) * 1.25,
					scale: .85 + this._rand(i * 5 + 4) * .95,
					rot: this._rand(i * 5 + 6) * Math.PI * 2,
					seed: this._rand(i * 5 + 5)
				};
			});
			this._registerLayer("L13_DarkShadowSmokePuffs", "13 暗紫撕裂煙暈", this._l13Smoke);
			const shockGeo = this._registerGeo(new three.RingGeometry(.84, 1.16, 52, 1));
			const shockMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uAge: { value: 0 },
					uTime: { value: 0 }
				},
				vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uAge;
        uniform float uTime;
        varying vec3 vPos;
        void main() {
          if (uAge <= 0.001 || uAge >= 0.999) discard;
          float angle = atan(vPos.y, vPos.x);
          float r = length(vPos.xy);
          float nW = sin(angle * 7.0 + uTime * 4.0) * 0.05;
          float radial = smoothstep(0.80, 0.98, r + nW) * (1.0 - smoothstep(0.98, 1.18, r + nW));
          float arcWave = sin(angle * 3.0 + 0.6);
          float arcMask = smoothstep(-0.2 + uAge * 0.90, 0.22 + uAge * 0.90, arcWave);
          float alpha = radial * arcMask * (1.0 - smoothstep(0.28, 1.0, uAge)) * 0.68;
          if (alpha < 0.02) discard;
          vec3 colViolet  = vec3(0.60, 0.12, 0.92);
          vec3 colCrimson = vec3(1.00, 0.14, 0.40);
          vec3 colHot     = vec3(1.16, 0.84, 0.42);
          vec3 col = mix(colViolet, colCrimson, smoothstep(0.86, 1.04, r));
          col = mix(col, colHot, smoothstep(0.65, 0.95, radial) * (1.0 - uAge * 0.6));
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide
			}));
			this._l14Shockwave = new three.Mesh(shockGeo, shockMat);
			this._l14Shockwave.renderOrder = 10;
			this._registerLayer("L14_HyperdimShockwaveRing", "14 超維空間衝擊波環", this._l14Shockwave);
			const emberCount = Math.max(28, Math.round(72 * this._qScale));
			const emberGeo = this._registerGeo(new three.PlaneGeometry(.14, .14));
			const emberMat = this._registerMat(new three.ShaderMaterial({
				uniforms: { uTime: { value: 0 } },
				vertexShader: `
        attribute vec3 aEmberData; // x: alpha, y: hueMix, z: size
        varying vec2 vUv;
        varying vec3 vData;
        void main() {
          vUv = uv;
          vData = aEmberData;
          #ifdef USE_INSTANCING
            vec4 centerMV = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #else
            vec4 centerMV = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #endif
          centerMV.xy += position.xy * aEmberData.z;
          gl_Position = projectionMatrix * centerMV;
        }
      `,
				fragmentShader: `
        varying vec2 vUv;
        varying vec3 vData;
        void main() {
          if (vData.x < 0.02) discard;
          float d = length(vUv - 0.5) * 2.0;
          if (d > 1.0) discard;
          float core = exp(-d * d * 10.0);
          float halo = exp(-d * d * 3.2) * 0.55;
          vec3 colGold   = vec3(1.25, 0.88, 0.30);
          vec3 colOrange = vec3(1.10, 0.36, 0.10);
          vec3 colMag    = vec3(0.98, 0.16, 0.52);
          vec3 baseCol = mix(colGold, colOrange, smoothstep(0.15, 0.55, vData.y));
          baseCol = mix(baseCol, colMag, smoothstep(0.55, 0.95, vData.y));
          vec3 col = mix(baseCol, vec3(1.35, 1.25, 0.95), core * 0.75);
          gl_FragColor = vec4(col, (core + halo) * vData.x);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending
			}));
			this._emberDataAttr = new three.InstancedBufferAttribute(new Float32Array(emberCount * 3), 3);
			emberGeo.setAttribute("aEmberData", this._emberDataAttr);
			this._l15Embers = new three.InstancedMesh(emberGeo, emberMat, emberCount);
			this._l15Embers.frustumCulled = false;
			this._l15Embers.renderOrder = 13;
			this._emberSeeds = Array.from({ length: emberCount }, (_, i) => ({
				isWake: i < 30,
				u: this._rand(i * 9 + 1),
				angle: this._rand(i * 9 + 2) * Math.PI * 2,
				rad: .25 + this._rand(i * 9 + 3) * 1.95,
				rise: .45 + this._rand(i * 9 + 4) * 1.75,
				hue: this._rand(i * 9 + 5),
				scale: .45 + this._rand(i * 9 + 6) * .85
			}));
			this._registerLayer("L15_FloatingSoulEmbers", "15 飄浮微光靈魂餘燼", this._l15Embers);
			const scorchGeo = this._registerGeo(new three.CircleGeometry(2.45, 40));
			scorchGeo.rotateX(-Math.PI / 2);
			const scorchMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uAge: { value: 0 },
					uTime: { value: 0 }
				},
				vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uAge;
        uniform float uTime;
        varying vec2 vUv;
        ${noiseGLSL}
        void main() {
          if (uAge <= 0.001 || uAge >= 0.999) discard;
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float angle = atan(p.y, p.x);

          // Organic ragged charred earth + sharp branching magma fissures
          float n1 = fbm(vec3(p * 3.6, 2.3));
          float n2 = fbm(vec3(p * 7.4 + vec2(n1 * 1.2), 4.7));
          float craterEdge = (1.0 - smoothstep(0.22, 0.94, r + (n1 - 0.45) * 0.48));

          // Ridge noise cracks radiating from center
          float ridge = 1.0 - abs(n2 * 2.0 - 1.0);
          float cracks = pow(clamp(ridge, 0.0, 1.0), 5.0) * (1.0 - smoothstep(0.04, 0.84, r));
          float radialFissure = pow(abs(sin(angle * 3.5 + (n1 - 0.5) * 3.8)), 10.0) * (1.0 - smoothstep(0.08, 0.76, r)) * smoothstep(0.0, 0.14, r) * 0.75;
          float totalCracks = clamp(cracks * 1.45 + radialFissure, 0.0, 1.0);

          // Restrained charred ground crater + subtle cooling magma veins (supports blast without stealing focus!)
          float coreHeat = (1.0 - smoothstep(0.0, 0.28, uAge)) * (1.0 - smoothstep(0.05, 0.45, r));
          float emberGlow = (1.0 - smoothstep(0.0, 0.78, uAge));
          vec3 colChar   = vec3(0.045, 0.012, 0.075);
          vec3 colCrim   = vec3(0.68, 0.06, 0.20);
          vec3 colOrange = vec3(1.05, 0.42, 0.08);

          vec3 col = colChar;
          col = mix(col, colCrim, clamp(totalCracks * (0.35 + 0.65 * emberGlow), 0.0, 1.0));
          col = mix(col, colOrange, clamp(totalCracks * coreHeat * 1.1, 0.0, 1.0));

          float fade = smoothstep(0.0, 0.05, uAge) * (1.0 - smoothstep(0.48, 1.0, uAge));
          float alpha = clamp(craterEdge * 0.68 + totalCracks * 0.42, 0.0, 0.82) * fade;
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false
			}));
			this._l16Scorch = new three.Mesh(scorchGeo, scorchMat);
			this._l16Scorch.position.set(this.impactPos.x, this.groundY + .015, this.impactPos.z);
			this._l16Scorch.renderOrder = 2;
			this._registerLayer("L16_GroundScorchSigil", "16 地面超維灼燒印記", this._l16Scorch);
			const glyphCount = Math.max(10, Math.round(18 * this._qScale));
			const glyphGeo = this._registerGeo(new three.PlaneGeometry(.46, .46));
			const glyphMat = this._registerMat(new three.ShaderMaterial({
				uniforms: { uTime: { value: 0 } },
				vertexShader: `
        attribute vec4 aGlyphData; // x: alpha, y: glyphType, z: hueMix, w: spin
        varying vec2 vUv;
        varying vec4 vData;
        void main() {
          vUv = uv;
          vData = aGlyphData;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
          #endif
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
				fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec4 vData;
        void main() {
          if (vData.x < 0.02) discard;
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          // Crisp geometric SDF hyperdimensional arcane sigil (diamond + inscribed ring + cross rune)
          float dDiamond = abs(p.x) + abs(p.y);
          float outerD = exp(-abs(dDiamond - 0.78) * 24.0);
          float innerR = exp(-abs(r - 0.42) * 26.0);
          float crossBar = (exp(-abs(p.x) * 32.0) + exp(-abs(p.y) * 32.0)) * (1.0 - smoothstep(0.15, 0.68, r));
          float centerDot = exp(-r * r * 28.0);
          float pattern = clamp(outerD + innerR * 0.8 + crossBar * 0.55 + centerDot * 0.9, 0.0, 1.0);
          if (pattern < 0.05) discard;

          vec3 colGold   = vec3(1.38, 1.02, 0.34);
          vec3 colMag    = vec3(1.15, 0.18, 0.62);
          vec3 colViolet = vec3(0.68, 0.30, 1.15);
          vec3 col = mix(colGold, colMag, smoothstep(0.15, 0.65, vData.z));
          col = mix(col, colViolet, smoothstep(0.65, 1.0, vData.z));
          col = mix(col, vec3(1.45, 1.38, 1.15), centerDot * 0.7);
          gl_FragColor = vec4(col, pattern * vData.x);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide
			}));
			this._glyphDataAttr = new three.InstancedBufferAttribute(new Float32Array(glyphCount * 4), 4);
			glyphGeo.setAttribute("aGlyphData", this._glyphDataAttr);
			this._l17Glyphs = new three.InstancedMesh(glyphGeo, glyphMat, glyphCount);
			this._l17Glyphs.frustumCulled = false;
			this._l17Glyphs.renderOrder = 13;
			this._glyphSeeds = Array.from({ length: glyphCount }, (_, i) => ({
				isFlight: i < 8,
				u: .12 + this._rand(i * 17 + 1) * .82,
				angle: i / glyphCount * Math.PI * 2 + this._rand(i * 17 + 2) * .5,
				rad: .85 + this._rand(i * 17 + 3) * 1.45,
				scale: .65 + this._rand(i * 17 + 4) * .75,
				hue: this._rand(i * 17 + 5),
				rise: .35 + this._rand(i * 17 + 6) * 1.1
			}));
			this._registerLayer("L17_HyperdimArcaneGlyphs", "17 超維符文浮空陣列", this._l17Glyphs);
			const ARC_COUNT = 5;
			const ARC_SEGS = 14;
			const arcGeo = this._createMultiRibbonGeometry(ARC_COUNT, ARC_SEGS);
			const arcMat = this._registerMat(new three.ShaderMaterial({
				uniforms: {
					uTime: { value: 0 },
					uOpacity: { value: 1 }
				},
				vertexShader: `
        attribute float aRibbonSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = uv;
          vSeed = aRibbonSeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
				fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          float across = abs(vUv.y - 0.5) * 2.0;
          float core = exp(-across * across * 14.0);
          float glow = exp(-across * across * 3.0) * 0.65;
          float ends = smoothstep(0.0, 0.10, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
          float flicker = 0.68 + 0.32 * sin(uTime * 38.0 + vSeed * 9.0 + vUv.x * 12.0);
          float alpha = (core + glow) * ends * flicker * uOpacity;
          if (alpha < 0.03) discard;
          vec3 colViolet = vec3(0.76, 0.18, 1.10);
          vec3 colMag    = vec3(1.15, 0.22, 0.68);
          vec3 colCore   = vec3(1.50, 1.44, 1.25);
          vec3 col = mix(colViolet, colMag, 0.5 + 0.5 * sin(vUv.x * 8.0 - uTime * 12.0));
          col = mix(col, colCore, core * 0.88);
          gl_FragColor = vec4(col, alpha);
        }
      `,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.DoubleSide
			}));
			this._l18Lightning = new three.Mesh(arcGeo, arcMat);
			this._l18Lightning.frustumCulled = false;
			this._l18Lightning.renderOrder = 14;
			this._arcSegs = ARC_SEGS;
			this._arcCount = ARC_COUNT;
			this._registerLayer("L18_DimensionalLightningArcs", "18 超維空間裂隙電弧", this._l18Lightning);
		}
		_evalOrbPos(i, t, out) {
			const orb = this._soulOrbConfigs[i];
			const tFlightStart = CAST_START;
			const tImpact = IMPACT;
			if (t < tImpact) {
				const charge = this._smoothstep(0, tFlightStart, t);
				const flightU = Math.max(0, (t - tFlightStart) / .4);
				this._evalFlightPos(flightU, this._v1);
				this._evalFlightTangent(flightU, this._v2);
				this._buildSafeBasis(this._v2, this._right, this._binorm);
				const ang = orb.baseAngle + t * 14.5;
				const rad = orb.flightRadius * (.4 + .6 * charge);
				const lag = -.35 - i * .52;
				out.copy(this._v1).addScaledVector(this._v2, lag).addScaledVector(this._right, Math.cos(ang) * rad).addScaledVector(this._binorm, Math.sin(ang) * rad);
			} else {
				const impAge = (t - tImpact) / .45999999999999996;
				const ang = orb.baseAngle + tImpact * 14.5 + Math.pow(impAge, .82) * (9.2 - i * .8);
				const expand = this._smoothstep(0, .15, impAge);
				const rad = orb.flightRadius + (orb.impactRadius - orb.flightRadius) * expand + impAge * .48;
				const tiltY = Math.sin(ang + i * 1.35) * orb.tilt;
				out.set(this.impactPos.x + Math.cos(ang) * rad, Math.max(this.groundY + .45, this.impactPos.y + tiltY + impAge * .18), this.impactPos.z + Math.sin(ang) * rad * .82);
			}
			return out;
		}
		_writeRibbonSlice(posAttr, ribbonIndex, segs, baseWidth, cameraPos, tailExp = 1.05, useOrbitalFrame = false) {
			const baseV = ribbonIndex * ((segs + 1) * 2);
			for (let i = 0; i <= segs; i++) {
				const p = this._ptsPool[i];
				const pPrev = this._ptsPool[i > 0 ? i - 1 : 0];
				const pNext = this._ptsPool[i < segs ? i + 1 : segs];
				this._tang.copy(pNext).sub(pPrev);
				if (this._tang.lengthSq() < 1e-6) this._tang.set(1, 0, 0);
				this._tang.normalize();
				this._toCam.copy(cameraPos).sub(p).normalize();
				if (useOrbitalFrame) {
					this._side.crossVectors(this._tang, this._up);
					if (this._side.lengthSq() < 1e-4) this._side.set(1, 0, 0);
					else this._side.normalize();
					this._side.multiplyScalar(.76).addScaledVector(this._up, .65).normalize();
				} else {
					this._side.crossVectors(this._tang, this._toCam);
					if (this._side.lengthSq() < .06) {
						if (i > 0) this._side.copy(this._prevSide);
						else {
							this._side.crossVectors(this._tang, this._up);
							if (this._side.lengthSq() < 1e-4) this._side.set(0, 1, 0);
							else this._side.normalize();
						}
					} else this._side.normalize();
					if (i > 0) {
						if (this._side.dot(this._prevSide) < 0) this._side.negate();
						this._side.lerp(this._prevSide, .42).normalize();
					}
				}
				this._prevSide.copy(this._side);
				const u = i / segs;
				const endTaper = u > .82 ? 1 - (u - .82) / .18 : 1;
				const w = baseWidth * Math.sin(Math.min(1, u * 4.2) * Math.PI * .5) * Math.pow(1 - u, tailExp) * endTaper * endTaper;
				const vIdx = baseV + i * 2;
				posAttr.setXYZ(vIdx, p.x + this._side.x * w, p.y + this._side.y * w, p.z + this._side.z * w);
				posAttr.setXYZ(vIdx + 1, p.x - this._side.x * w, p.y - this._side.y * w, p.z - this._side.z * w);
			}
		}
		setLayerVisible(id, visible) {
			if (!this._disposed && Object.hasOwn(this._userLayerEnabled, id) && typeof visible === "boolean" && this._userLayerEnabled[id] !== visible) {
				this._userLayerEnabled[id] = visible;
				this.setProgress(this.progress);
			}
		}
		getStageLabel(t) {
			if (t < .14) return "階段：超維召喚與蓄力";
			if (t < .54) return "階段：靈魂火球高速飛行";
			if (t < .61) return "階段：命中瞬發星爆";
			if (t < .8) return "階段：烈焰雲團翻捲";
			return "階段：虛空餘燼消散";
		}
		setProgress(t, cameraPos) {
			if (this._disposed || !Number.isFinite(t)) return;
			this.progress = clamp01(t);
			this.time = this.progress * this.duration;
			if (isFiniteVector(cameraPos)) this._lastCamPos.copy(cameraPos);
			this._sample(false);
		}
		setCameraPosition(localPosition) {
			if (this._disposed || !isFiniteVector(localPosition) || this._lastCamPos.distanceToSquared(localPosition) < 1e-10) return;
			this._lastCamPos.copy(localPosition);
			this._sample(true);
		}
		_sample(cameraOnly) {
			const camP = this._lastCamPos;
			const tFlightStart = CAST_START;
			const tImpact = IMPACT;
			const charge = this._smoothstep(0, tFlightStart, this.progress);
			const flightU = Math.max(0, Math.min(1, (this.progress - tFlightStart) / .4));
			const postImpact = Math.max(0, (this.progress - tImpact) / .45999999999999996);
			const isProjectileAlive = this.progress < .552;
			if (!cameraOnly) {
				this._evalFlightPos(flightU, this._v1);
				this._evalFlightTangent(flightU, this._v2);
				this._projPivot.position.copy(this._v1);
				this._setQuatFromForward(this._v2, this._q1);
				this._projPivot.quaternion.copy(this._q1);
				const projScale = isProjectileAlive ? (.2 + .8 * charge) * (this.progress > tImpact ? Math.max(0, 1 - (this.progress - tImpact) / .012) : 1) : 1e-4;
				const stretchX = .52 + .48 * this._smoothstep(.1, .2, this.progress);
				this._projPivot.scale.set(projScale * stretchX, projScale, projScale);
				this._projPivot.visible = isProjectileAlive;
				this._applyPhaseVisibility("L01_IncandescentCore", isProjectileAlive);
				this._applyPhaseVisibility("L02_FlameMantleShell", isProjectileAlive);
				this._applyPhaseVisibility("L03_DarkVoidFlameSheath", isProjectileAlive);
				if (isProjectileAlive) {
					this._l01Core.material.uniforms.uTime.value = this.time;
					this._l01Core.material.uniforms.uIntensity.value = .9 + .16 * charge;
					this._l02Mantle.material.uniforms.uTime.value = this.time;
					this._l02Mantle.material.uniforms.uAlpha.value = charge;
					this._l03Sheath.material.uniforms.uTime.value = this.time;
					this._l03Sheath.material.uniforms.uAlpha.value = charge;
				}
				const haloActive = this.progress < .88;
				this._applyPhaseVisibility("L04_Level2OuterGlowHalo", haloActive);
				if (haloActive) {
					if (this.progress < tImpact) {
						this._l04Halo.position.copy(this._v1);
						const s = .65 + .52 * charge;
						this._l04Halo.scale.set(s, s, 1);
						this._l04Halo.material.uniforms.uOpacity.value = .44 * charge;
					} else {
						this._l04Halo.position.copy(this.impactPos);
						const impGlow = Math.exp(-postImpact * 2.4);
						const s = 1.45 + postImpact * 1.15;
						this._l04Halo.scale.set(s, s, 1);
						this._l04Halo.material.uniforms.uOpacity.value = .5 * impGlow;
					}
				}
				const portalVis = this._smoothstep(0, .04, this.progress) * (1 - this._smoothstep(.18, .34, this.progress));
				this._applyPhaseVisibility("L05_DimensionalRiftRings", portalVis > .01);
				if (portalVis > .01) {
					this._l05Group.position.copy(this.startPos);
					this._evalFlightTangent(.02, this._v2);
					this._m1.lookAt(this._v5.copy(this.startPos).add(this._v2), this.startPos, this._up);
					this._l05Group.quaternion.setFromRotationMatrix(this._m1);
					const ringScale = .48 + .95 * this._smoothstep(0, .14, this.progress);
					this._l05Group.scale.setScalar(ringScale);
					this._riftRingA.rotation.z = this.time * 1.6;
					this._riftRingB.rotation.z = -this.time * 2.4;
					this._riftRingC.rotation.z = this.time * .95;
					this._riftRingA.material.uniforms.uTime.value = this.time;
					this._riftRingA.material.uniforms.uOpacity.value = portalVis * .92;
					this._riftRingC.material.uniforms.uTime.value = this.time;
					this._riftRingC.material.uniforms.uOpacity.value = portalVis * .85;
				}
			}
			const ribbonFade = this._smoothstep(.14, .22, this.progress) * (1 - this._smoothstep(.54, .62, this.progress));
			const headU = Math.min(1, flightU);
			const ribbonsActive = ribbonFade > .01 && headU > .02;
			this._applyPhaseVisibility("L06_VoidSmokeRibbons", ribbonsActive);
			if (ribbonsActive) {
				this._l06VoidRibbons.material.uniforms.uTime.value = this.time;
				this._l06VoidRibbons.material.uniforms.uOpacity.value = ribbonFade;
				const posAttr = this._l06VoidRibbons.geometry.attributes.position;
				const segs = this._voidRibbonSegs;
				const growScale = Math.min(1, headU / .22);
				this._evalFlightTangent(flightU, this._v2);
				this._buildSafeBasis(this._v2, this._right, this._binorm);
				for (let r = 0; r < this._voidRibbonConfigs.length; r++) {
					const cfg = this._voidRibbonConfigs[r];
					const effectiveLen = Math.min(headU, cfg.lengthU);
					for (let i = 0; i <= segs; i++) {
						const frac = i / segs;
						const sampleU = headU - frac * effectiveLen;
						const p = this._ptsPool[i];
						this._evalFlightPos(sampleU, p);
						const swirl = frac * 5.4 + cfg.phase - this.time * 4.2;
						const spread = cfg.radius * (.2 + frac * 1.45) * growScale;
						const sWave = Math.sin(frac * 4.4 - this.time * 3) * cfg.sAmp * frac * growScale;
						p.addScaledVector(this._right, Math.cos(swirl) * spread + sWave * .45);
						p.addScaledVector(this._binorm, Math.sin(swirl) * spread + sWave * .65);
						p.y += frac * frac * cfg.lift * .55 * growScale;
					}
					this._writeRibbonSlice(posAttr, r, segs, cfg.width * growScale, camP, .95);
				}
				posAttr.needsUpdate = true;
			}
			const orbVis = this._smoothstep(.04, .15, this.progress) * (1 - this._smoothstep(.78, .95, this.progress));
			const orbsActive = orbVis > .01;
			this._applyPhaseVisibility("L07_OrbitingSoulOrbs", orbsActive);
			this._applyPhaseVisibility("L08_SoulOrbTrails", orbsActive);
			if (orbsActive && (!cameraOnly || this.progress < tImpact)) {
				this._l07Orbs.material.uniforms.uTime.value = this.time;
				this._l08OrbTrails.material.uniforms.uTime.value = this.time;
				this._l08OrbTrails.material.uniforms.uOpacity.value = orbVis * .9;
				const trailPosAttr = this._l08OrbTrails.geometry.attributes.position;
				const tSegs = this._orbTrailSegs;
				const isPost = this.progress >= tImpact;
				const postElapsed = Math.max(0, this.progress - tImpact);
				const dtSpan = isPost ? Math.min(postElapsed, .26) : Math.min(this.progress - .01, .14);
				const postRamp = isPost ? Math.min(1, postElapsed / .045) : 1;
				const widthMult = (isPost ? .5 : .2) * postRamp;
				for (let i = 0; i < 3; i++) {
					const cfg = this._soulOrbConfigs[i];
					if (!cameraOnly) {
						this._evalOrbPos(i, this.progress, this._orbPos);
						const s = (isPost ? cfg.impactScale : cfg.scale) * orbVis;
						this._q1.setFromAxisAngle(this._up, this.time * 3.2 + i);
						this._m1.compose(this._orbPos, this._q1, this._v5.set(s, s, s));
						this._l07Orbs.setMatrixAt(i, this._m1);
					}
					const minT = isPost ? tImpact : .01;
					for (let k = 0; k <= tSegs; k++) {
						const frac = k / tSegs;
						const st = Math.max(minT, this.progress - frac * Math.max(.003, dtSpan));
						this._evalOrbPos(i, st, this._ptsPool[k]);
					}
					this._writeRibbonSlice(trailPosAttr, i, tSegs, widthMult * cfg.scale, camP, 1.18, isPost);
				}
				if (!cameraOnly) this._l07Orbs.instanceMatrix.needsUpdate = true;
				trailPosAttr.needsUpdate = true;
			}
			if (!cameraOnly) {
				const licksActive = this.progress > .1 && this.progress < .6;
				this._applyPhaseVisibility("L09_SoulLickFlames", licksActive);
				if (licksActive) {
					const impactFade = this.progress > tImpact ? Math.max(0, 1 - (this.progress - tImpact) / .06) : 1;
					for (let i = 0; i < this._lickSeeds.length; i++) {
						const ls = this._lickSeeds[i];
						const cycle = (this.progress * 4 + ls.offset) % 1;
						const u = Math.max(0, Math.min(1, flightU - cycle * .24));
						this._evalFlightPos(u, this._v1);
						this._evalFlightTangent(u, this._v2);
						const ang = ls.angle + cycle * 2.2;
						const rad = ls.rad * (.35 + cycle * 1.15);
						this._v1.y += Math.sin(ang) * rad + cycle * .22;
						this._v1.z += Math.cos(ang) * rad;
						this._setQuatFromForward(this._v2, this._q1);
						const s = ls.scale * (1 - cycle) * impactFade;
						this._m1.compose(this._v1, this._q1, this._v5.set(s * 1.45, s * .85, s * .85));
						this._l09Licks.setMatrixAt(i, this._m1);
						this._lickHeatAttr.setX(i, (1 - cycle) * impactFade);
					}
					this._l09Licks.instanceMatrix.needsUpdate = true;
					this._lickHeatAttr.needsUpdate = true;
				}
				const starActive = this.progress >= tImpact && postImpact < .36;
				this._applyPhaseVisibility("L10_ImpactStarburstCore", starActive);
				if (starActive) {
					const u = postImpact / .36;
					this._l10Starburst.position.copy(this.impactPos);
					const s = .82 - .34 * this._smoothstep(.06, .72, u);
					this._l10Starburst.scale.set(s, s, 1);
					this._l10Starburst.material.uniforms.uAge.value = u;
					this._l10Starburst.material.uniforms.uOpacity.value = (1 - this._smoothstep(.58, 1, u)) * .94;
				}
				const cloudActive = this.progress >= tImpact && postImpact < .6;
				this._applyPhaseVisibility("L11_BillowingFireCloud", cloudActive);
				if (cloudActive) {
					this._l11FireCloud.material.uniforms.uTime.value = this.time;
					let active = 0;
					for (let i = 0; i < this._cloudSeeds.length; i++) {
						const cs = this._cloudSeeds[i];
						const localAge = Math.max(0, Math.min(1, (postImpact - cs.delay) / .56));
						if (localAge <= .001 || localAge >= .999) continue;
						const easeOut = 1 - Math.pow(1 - localAge, 3);
						this._v1.copy(this.impactPos).addScaledVector(cs.dir, cs.dist * (.28 + .95 * easeOut));
						this._v1.y = Math.max(this.groundY + .58, this._v1.y + localAge * .45);
						const shrinkOut = 1 - this._smoothstep(.72, 1, localAge);
						const s = cs.baseScale * (.5 + .9 * easeOut) * shrinkOut;
						if (s < .01) continue;
						const sx = s * (.86 + cs.seed * .34);
						const sy = s * (1.08 - cs.seed * .24);
						const sz = s * (.9 + cs.seed * 3.7 % 1 * .28);
						this._q1.setFromAxisAngle(cs.dir, localAge * 1.2);
						this._m1.compose(this._v1, this._q1, this._v5.set(sx, sy, sz));
						this._l11FireCloud.setMatrixAt(active, this._m1);
						this._cloudDataAttr.setXYZW(active, cs.seed, localAge, cs.heatBias, 0);
						active++;
					}
					this._l11FireCloud.count = active;
					this._l11FireCloud.visible = this._l11FireCloud.visible && active > 0;
					if (active > 0) {
						this._l11FireCloud.instanceMatrix.needsUpdate = true;
						this._cloudDataAttr.needsUpdate = true;
					}
				}
				const streaksActive = this.progress >= tImpact && postImpact < .4;
				this._applyPhaseVisibility("L12_RadialEmberStreaks", streaksActive);
				if (streaksActive) {
					let active = 0;
					for (let i = 0; i < this._streakSeeds.length; i++) {
						const ss = this._streakSeeds[i];
						const localAge = postImpact / ss.life;
						if (localAge <= .001 || localAge >= 1) continue;
						const dist = .45 + ss.speed * (1 - Math.pow(1 - localAge, 2.3));
						this._v1.copy(this.impactPos).addScaledVector(ss.dir, dist);
						this._v1.y = Math.max(this.groundY + .22, this._v1.y - localAge * localAge * .35);
						this._setQuatFromForward(ss.dir, this._q1);
						const stretch = ss.length * (1.12 - localAge * .55);
						const thick = ss.width * (1 - localAge * .55);
						this._m1.compose(this._v1, this._q1, this._v5.set(stretch, thick, thick));
						this._l12Streaks.setMatrixAt(active, this._m1);
						this._streakAlphaAttr.setX(active, 1 - this._smoothstep(.32, 1, localAge));
						active++;
					}
					this._l12Streaks.count = active;
					this._l12Streaks.visible = this._l12Streaks.visible && active > 0;
					if (active > 0) {
						this._l12Streaks.instanceMatrix.needsUpdate = true;
						this._streakAlphaAttr.needsUpdate = true;
					}
				}
			}
			const smokeActive = this.progress >= tImpact && postImpact > .07 && postImpact < .98;
			this._applyPhaseVisibility("L13_DarkShadowSmokePuffs", smokeActive);
			if (smokeActive) {
				this._l13Smoke.material.uniforms.uTime.value = this.time;
				this._toCam.copy(camP).sub(this.impactPos).normalize();
				const localAge = clamp01((postImpact - .07) / .89);
				for (let i = 0; i < this._smokeSeeds.length; i++) {
					const sm = this._smokeSeeds[i];
					if (localAge <= .001 || localAge >= .999) {
						this._m1.makeScale(0, 0, 0);
						this._l13Smoke.setMatrixAt(i, this._m1);
						this._smokeDataAttr.setXYZW(i, sm.seed, 0, 0, 0);
						continue;
					}
					const ease = 1 - Math.pow(1 - localAge, 2.4);
					this._v1.copy(this.impactPos).addScaledVector(sm.dir, sm.dist * (.62 + .96 * ease));
					this._v1.y = Math.max(this.groundY + .45, this._v1.y + localAge * .85);
					const dCam = (this._v1.x - this.impactPos.x) * this._toCam.x + (this._v1.y - this.impactPos.y) * this._toCam.y + (this._v1.z - this.impactPos.z) * this._toCam.z;
					if (dCam > -.45) this._v1.addScaledVector(this._toCam, -(dCam + .65));
					const s = sm.scale * (.65 + .95 * ease);
					this._m1.makeTranslation(this._v1.x, this._v1.y, this._v1.z);
					this._l13Smoke.setMatrixAt(i, this._m1);
					this._smokeDataAttr.setXYZW(i, sm.seed, localAge, s, sm.rot + localAge * .8);
				}
				this._l13Smoke.instanceMatrix.needsUpdate = true;
				this._smokeDataAttr.needsUpdate = true;
			}
			if (!cameraOnly) {
				const shockAge = Math.max(0, Math.min(1, postImpact / .2));
				const shockActive = this.progress >= tImpact && shockAge < .995;
				this._applyPhaseVisibility("L14_HyperdimShockwaveRing", shockActive);
				if (shockActive) {
					this._l14Shockwave.material.uniforms.uAge.value = shockAge;
					this._l14Shockwave.material.uniforms.uTime.value = this.time;
					this._l14Shockwave.position.set(this.impactPos.x, this.impactPos.y - .25, this.impactPos.z);
					this._l14Shockwave.rotation.set(-Math.PI * .44, .18, shockAge * 4.2);
					this._l14Shockwave.scale.setScalar(.6 + shockAge * 2.55);
				}
				const embersActive = this.progress > .12 && this.progress < .99;
				this._applyPhaseVisibility("L15_FloatingSoulEmbers", embersActive);
				if (embersActive) {
					this._l15Embers.material.uniforms.uTime.value = this.time;
					let active = 0;
					for (let i = 0; i < this._emberSeeds.length; i++) {
						const es = this._emberSeeds[i];
						let alpha = 0;
						if (es.isWake) {
							if (this.progress < .82) {
								const u = Math.min(flightU, es.u);
								const age = flightU - u + postImpact * .85;
								if (age >= 0 && age < .72) {
									this._evalFlightPos(u, this._v1);
									const a = es.angle + this.time * 1.4;
									this._v1.x += Math.cos(a) * es.rad * .24;
									this._v1.y += Math.sin(a) * es.rad * .24 + age * es.rise * .55;
									this._v1.z += Math.sin(a * 1.3) * es.rad * .24;
									alpha = Math.sin((1 - age / .72) * Math.PI) * .82;
								}
							}
						} else if (this.progress >= tImpact) {
							const age = postImpact;
							const a = es.angle + age * 4;
							const rad = es.rad * (.32 + .88 * Math.sqrt(age));
							this._v1.set(this.impactPos.x + Math.cos(a) * rad, Math.max(this.groundY + .2, this.impactPos.y + (es.rise - .55) * age * 1.2), this.impactPos.z + Math.sin(a) * rad);
							const twinkle = .62 + .38 * Math.sin(this.time * 14 + i * 2.1);
							alpha = this._smoothstep(0, .08, age) * (1 - this._smoothstep(.55, 1, age)) * twinkle * .92;
						}
						if (alpha < .02) continue;
						this._m1.makeTranslation(this._v1.x, this._v1.y, this._v1.z);
						this._l15Embers.setMatrixAt(active, this._m1);
						this._emberDataAttr.setXYZ(active, alpha, es.hue, es.scale * (.7 + .3 * alpha));
						active++;
					}
					this._l15Embers.count = active;
					this._l15Embers.visible = this._l15Embers.visible && active > 0;
					if (active > 0) {
						this._l15Embers.instanceMatrix.needsUpdate = true;
						this._emberDataAttr.needsUpdate = true;
					}
				}
				const scorchActive = this.progress >= tImpact && postImpact < .99;
				this._applyPhaseVisibility("L16_GroundScorchSigil", scorchActive);
				if (scorchActive) {
					this._l16Scorch.material.uniforms.uAge.value = postImpact;
					this._l16Scorch.material.uniforms.uTime.value = this.time;
				}
				const glyphsActive = this.progress > .02 && this.progress < .94;
				this._applyPhaseVisibility("L17_HyperdimArcaneGlyphs", glyphsActive);
				if (glyphsActive) {
					this._l17Glyphs.material.uniforms.uTime.value = this.time;
					let activeG = 0;
					for (let i = 0; i < this._glyphSeeds.length; i++) {
						const gs = this._glyphSeeds[i];
						let alpha = 0;
						let s = gs.scale;
						if (gs.isFlight) {
							if (this.progress < .62) {
								const u = Math.min(flightU, gs.u);
								const age = this.progress < tFlightStart ? 1 - charge : Math.max(0, (flightU - u) * 1.6 + postImpact * 2.5);
								if (this.progress < tFlightStart) {
									const ang = gs.angle + this.time * 2.8;
									const rad = gs.rad * (1.15 - .55 * charge);
									this._v1.set(this.startPos.x - .15 + Math.cos(ang) * .18, this.startPos.y + Math.sin(ang) * rad, this.startPos.z + Math.cos(ang) * rad);
									alpha = this._smoothstep(.02, .08, this.progress) * .78;
								} else if (age < .65 && flightU >= gs.u * .85) {
									this._evalFlightPos(u, this._v1);
									const ang = gs.angle + this.time * 2.4;
									this._v1.y += Math.sin(ang) * (.55 + age * .65);
									this._v1.z += Math.cos(ang) * (.55 + age * .65);
									alpha = Math.sin((1 - age / .65) * Math.PI) * .76;
								}
							}
						} else if (this.progress >= tImpact && postImpact < .86) {
							const age = postImpact / .86;
							const ang = gs.angle + age * 2.6;
							const rad = 1.25 + gs.rad * (.45 + .85 * Math.sqrt(age));
							this._v1.set(this.impactPos.x + Math.cos(ang) * rad, Math.max(this.groundY + .35, this.impactPos.y + (gs.rise - .25) * (.3 + age * 1.1)), this.impactPos.z + Math.sin(ang) * rad * .82);
							alpha = this._smoothstep(0, .1, age) * (1 - this._smoothstep(.55, 1, age)) * .82;
						}
						if (alpha < .02) continue;
						this._q1.setFromAxisAngle(this._up, this.time * 1.8 + i * .9);
						this._m1.compose(this._v1, this._q1, this._v5.set(s, s, s));
						this._l17Glyphs.setMatrixAt(activeG, this._m1);
						this._glyphDataAttr.setXYZW(activeG, alpha, i % 3, gs.hue, this.time);
						activeG++;
					}
					this._l17Glyphs.count = activeG;
					this._l17Glyphs.visible = this._l17Glyphs.visible && activeG > 0;
					if (activeG > 0) {
						this._l17Glyphs.instanceMatrix.needsUpdate = true;
						this._glyphDataAttr.needsUpdate = true;
					}
				}
			}
			const arcsActive = this.progress > .03 && this.progress < .76;
			this._applyPhaseVisibility("L18_DimensionalLightningArcs", arcsActive);
			if (arcsActive) {
				const arcFade = this.progress < tImpact ? this._smoothstep(.03, .1, this.progress) * .88 : (1 - this._smoothstep(.18, .48, postImpact)) * .92;
				this._l18Lightning.material.uniforms.uTime.value = this.time;
				this._l18Lightning.material.uniforms.uOpacity.value = Math.max(0, arcFade);
				const arcPosAttr = this._l18Lightning.geometry.attributes.position;
				const aSegs = this._arcSegs;
				const quantStep = Math.floor(this.time * 18);
				for (let a = 0; a < this._arcCount; a++) {
					if (this.progress < tImpact) {
						this._evalFlightPos(flightU, this._arcStart);
						if (a < 3) this._evalOrbPos(a, this.progress, this._arcEnd);
						else {
							const tailU = Math.max(0, flightU - (.14 + (a - 3) * .12));
							this._evalFlightPos(tailU, this._arcEnd);
							const ang = a * 2.4 + this.time * 6;
							this._arcEnd.y += Math.sin(ang) * .58;
							this._arcEnd.z += Math.cos(ang) * .58;
						}
					} else {
						this._arcStart.copy(this.impactPos);
						if (a < 3) this._evalOrbPos(a, this.progress, this._arcEnd);
						else {
							const ang = a * 2.1 + postImpact * 4.5;
							const r = 1.45 + postImpact * 1.8;
							this._arcEnd.set(this.impactPos.x + Math.cos(ang) * r, Math.max(this.groundY + .25, this.impactPos.y + Math.sin(ang * 1.4) * 1.1), this.impactPos.z + Math.sin(ang) * r * .75);
						}
					}
					for (let k = 0; k <= aSegs; k++) {
						const frac = k / aSegs;
						const p = this._ptsPool[k];
						p.lerpVectors(this._arcStart, this._arcEnd, frac);
						const env = Math.sin(frac * Math.PI);
						const jx = (this._rand(quantStep * 31 + a * 97 + k * 13 + 1) - .5) * .36 * env;
						const jy = (this._rand(quantStep * 31 + a * 97 + k * 13 + 2) - .5) * .36 * env;
						const jz = (this._rand(quantStep * 31 + a * 97 + k * 13 + 3) - .5) * .36 * env;
						p.x += jx;
						p.y += jy;
						p.z += jz;
					}
					this._writeRibbonSlice(arcPosAttr, a, aSegs, .055, camP, .15, false);
				}
				arcPosAttr.needsUpdate = true;
			}
		}
		update(dt, cameraPos) {
			if (!Number.isFinite(dt) || dt <= 0) return;
			this.setProgress((this.progress + dt % this.duration / this.duration) % 1, cameraPos);
		}
		_normalizeDirection(direction) {
			const component = Math.max(Math.abs(direction.x), Math.abs(direction.y), Math.abs(direction.z));
			if (component === 0) throw new RangeError("direction must be nonzero");
			return direction.set(direction.x / component, direction.y / component, direction.z / component).normalize();
		}
		_flightDuration(start, end, speed) {
			scenePoint(end, "impactPos");
			const distance = Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z);
			return scalar(Math.max(.12, distance / speed), void 0, "flight duration", positive);
		}
		_syncImpactPosition() {
			this._l11FireCloud.material.uniforms.uImpactPos.value.copy(this.impactPos);
			this._l16Scorch.position.set(this.impactPos.x, this.groundY + .015, this.impactPos.z);
		}
		_begin(start, end, direction, settings, flightTotal) {
			this.startPos.copy(start);
			this.impactPos.copy(end);
			this.direction.copy(direction);
			Object.assign(this, settings);
			this._flightTotal = flightTotal;
			this._syncImpactPosition();
			this._generation++;
			this.state = this.castDuration > 0 ? "cast" : "flying";
			this._stateTime = 0;
			this.group.visible = true;
			this.setProgress(this.state === "cast" ? 0 : CAST_START);
		}
		reset(startPos = this.startPos, impactPos = this.impactPos) {
			if (this._disposed) return;
			scenePoint(startPos, "startPos");
			const flightTotal = this._flightDuration(startPos, impactPos, this._launchDefaults.flightSpeed);
			const direction = this._v1.copy(impactPos).sub(startPos);
			if (direction.lengthSq() === 0) direction.copy(this.direction);
			this._begin(startPos, impactPos, this._normalizeDirection(direction), this._launchDefaults, flightTotal);
			this.setProgress(0);
		}
		launch(origin, direction, opts = {}) {
			if (this._disposed) return this;
			scenePoint(origin, "origin");
			const aim = this._normalizeDirection(this._v1.copy(vector(direction, "direction")));
			const settings = launchSettings(opts, this._launchDefaults);
			const end = this._v2.copy(origin).addScaledVector(aim, settings.maxRange);
			const flightTotal = this._flightDuration(origin, end, settings.flightSpeed);
			this._begin(origin, end, aim, settings, flightTotal);
			return this;
		}
		getProjectilePosition(out = new three.Vector3()) {
			return out.copy(this._projPivot.position);
		}
		triggerImpact(hitPoint) {
			if (this._disposed || this.state !== "cast" && this.state !== "flying") return;
			if (hitPoint !== void 0) scenePoint(hitPoint, "hitPoint");
			this.impactPos.copy(hitPoint ?? this._projPivot.position);
			this._syncImpactPosition();
			this.state = "impact";
			this._stateTime = 0;
			this.setProgress(IMPACT);
			if (this.onImpact) this.onImpact(this.impactPos.clone());
		}
		cancel() {
			if (this._disposed) return;
			this._generation++;
			this.state = "done";
			this.group.visible = false;
		}
		step(dt, cameraPos) {
			if (this._disposed || !Number.isFinite(dt) || dt <= 0) return this.state;
			const generation = this._generation;
			while (this.state !== "idle" && this.state !== "done" && this._generation === generation) {
				const casting = this.state === "cast";
				const flying = this.state === "flying";
				const total = casting ? this.castDuration : flying ? this._flightTotal : this.impactDuration;
				const remaining = Math.max(0, total - this._stateTime);
				if (dt < remaining) {
					this._stateTime += dt;
					const fraction = this._stateTime / total;
					this.setProgress(casting ? fraction * CAST_START : flying ? CAST_START + fraction * .4 : IMPACT + fraction * .45999999999999996, cameraPos);
					break;
				}
				dt -= remaining;
				if (casting) {
					this.state = "flying";
					this._stateTime = 0;
					this.setProgress(CAST_START, cameraPos);
				} else if (flying) {
					if (isFiniteVector(cameraPos)) this._lastCamPos.copy(cameraPos);
					this.triggerImpact(this.impactPos);
				} else {
					this.setProgress(1, cameraPos);
					this.state = "done";
					this.group.visible = false;
					if (this.onComplete) this.onComplete();
					break;
				}
				if (dt === 0) break;
			}
			return this.state;
		}
		dispose() {
			if (this._disposed) return;
			this.cancel();
			this._disposed = true;
			this.group.traverse((object) => {
				if (object.isInstancedMesh) object.dispose();
			});
			this._geometries.forEach((g) => g.dispose());
			this._materials.forEach((m) => m.dispose());
			_SoulFireballShared.release();
			this.group.removeFromParent();
			this.group.clear();
			this._geometries.length = 0;
			this._materials.length = 0;
			this.layerMap = Object.create(null);
			this._userLayerEnabled = Object.create(null);
		}
	};
	var HyperdimensionalSoulFireballPool = class {
		constructor(scene, options = {}) {
			if (!scene?.isObject3D) throw new TypeError("scene must be a THREE.Object3D");
			this.scene = scene;
			this.size = scalar(options.size, 3, "pool size", (n) => Number.isInteger(n) && n >= 1 && n <= 64);
			this._pool = [];
			this._cameraWorld = new three.Vector3();
			this._cameraLocal = new three.Vector3();
			try {
				for (let i = 0; i < this.size; i++) {
					const fx = new HyperdimensionalSoulFireballVFX({
						...options,
						seed: (options.seed ?? DEFAULT_SEED) + i * 7919
					});
					fx.group.visible = false;
					this._pool.push({
						fx,
						mode: null
					});
					this.scene.add(fx.group);
				}
			} catch (error) {
				this.dispose();
				throw error;
			}
		}
		prewarm(renderer, camera) {
			const slot = this._pool.find((s) => s.mode === null);
			if (!slot) return false;
			const { fx } = slot;
			const progress = fx.progress, visible = fx.group.visible, previousCamera = fx._lastCamPos.clone();
			const localCamera = fx.group.worldToLocal(camera.getWorldPosition(this._cameraLocal));
			try {
				fx.group.visible = true;
				for (const phase of [
					.08,
					.36,
					.55,
					.67
				]) {
					fx.setProgress(phase, localCamera);
					renderer.compile(this.scene, camera);
				}
			} finally {
				fx.setProgress(progress, previousCamera);
				fx.group.visible = visible;
			}
			return true;
		}
		spawn(startPos, impactPos, startProgress = 0) {
			const slot = this._pool.find((s) => s.mode === null);
			if (!slot) return null;
			scalar(startProgress, 0, "startProgress", (n) => n >= 0 && n < 1);
			slot.fx.reset(startPos, impactPos);
			slot.fx.setProgress(startProgress);
			slot.mode = "timeline";
			return slot.fx;
		}
		fireForward(origin, direction, opts = {}) {
			const slot = this._pool.find((s) => s.mode === null);
			if (!slot) return null;
			slot.fx.launch(origin, direction, opts);
			slot.mode = "launch";
			return slot.fx;
		}
		update(dt, worldCameraPosition, loop = false) {
			if (!Number.isFinite(dt) || dt <= 0) return;
			const hasCamera = isFiniteVector(worldCameraPosition);
			if (hasCamera) this._cameraWorld.copy(worldCameraPosition);
			for (const slot of this._pool) {
				const { fx, mode } = slot;
				if (!mode) continue;
				const camera = hasCamera ? fx.group.worldToLocal(this._cameraLocal.copy(this._cameraWorld)) : void 0;
				if (mode === "launch") {
					if (fx.step(dt, camera) === "done") slot.mode = null;
				} else if (!fx.group.visible || dt >= (1 - fx.progress) * fx.duration && !loop) {
					fx.setProgress(1, camera);
					fx.group.visible = false;
					slot.mode = null;
				} else fx.update(dt, camera);
			}
		}
		dispose() {
			for (const slot of this._pool) slot.fx.dispose();
			this._pool.length = 0;
		}
	};
	const FLAME_MAGIC_BOLT = Object.freeze({
		duration: DEFAULT_DURATION,
		seed: DEFAULT_SEED,
		instances: 211
	});
	const multiplier = (value) => Number.isFinite(value) ? three.MathUtils.clamp(value, .25, 2) : 1;
	function normalizeFlameMagicBoltOptions(options = {}) {
		return {
			size: multiplier(options.size),
			speed: multiplier(options.speed)
		};
	}
	function createFlameMagicBoltEffect(spec, options = {}) {
		const { duration } = FLAME_MAGIC_BOLT;
		const lifecycle = Object.freeze({
			start: .476,
			end: .68,
			...spec.lifecycle
		});
		const group = new three.Group();
		group.name = spec.id;
		const view = new three.Vector3(0, 3, 9.6), nextView = new three.Vector3(), cameraWorld = new three.Vector3();
		let settings = Object.freeze(normalizeFlameMagicBoltOptions(options));
		let cast, elapsed = 0, disposed = false;
		group.scale.setScalar(settings.size);
		function prepare() {
			if (!cast) {
				cast = new HyperdimensionalSoulFireballVFX({
					duration,
					seed: spec.seed
				});
				group.add(cast.group);
			}
			return cast;
		}
		function seek(seconds) {
			if (disposed || !Number.isFinite(seconds)) return;
			elapsed = three.MathUtils.clamp(seconds, 0, duration);
			group.visible = elapsed < duration;
			if (group.visible) prepare().setProgress(elapsed / duration, view);
		}
		function syncCamera(worldPosition) {
			if (disposed || !isFiniteVector(worldPosition)) return;
			group.worldToLocal(nextView.copy(worldPosition));
			if (!isFiniteVector(nextView)) return;
			if (view.distanceToSquared(nextView) < 1e-10) return;
			view.copy(nextView);
			if (cast && group.visible) cast.setCameraPosition(view);
		}
		return {
			group,
			lifecycle,
			duration,
			particleCount: FLAME_MAGIC_BOLT.instances,
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
				return this.finished ? "finished" : elapsed < lifecycle.start ? "starting" : elapsed >= duration - lifecycle.end ? "ending" : "active";
			},
			seek,
			setCameraPosition: syncCamera,
			render(renderer, scene, camera) {
				syncCamera(camera.getWorldPosition(cameraWorld));
				renderer.render(scene, camera);
			},
			setLayerVisible(id, visible) {
				if (disposed || typeof id !== "string" || typeof visible !== "boolean") return;
				prepare().setLayerVisible(id, visible);
			},
			update(dt) {
				if (!this.finished && Number.isFinite(dt) && dt > 0) seek(elapsed + Math.min(dt, duration / settings.speed) * settings.speed);
			},
			reset() {
				seek(0);
			},
			setOptions(partial = {}) {
				if (disposed) return;
				settings = Object.freeze(normalizeFlameMagicBoltOptions({
					...settings,
					...partial
				}));
				group.scale.setScalar(settings.size);
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
exports.FLAME_MAGIC_BOLT = FLAME_MAGIC_BOLT;
exports.HyperdimensionalSoulFireballPool = HyperdimensionalSoulFireballPool;
exports.HyperdimensionalSoulFireballVFX = HyperdimensionalSoulFireballVFX;
exports.createFlameMagicBoltEffect = createFlameMagicBoltEffect;
exports.normalizeFlameMagicBoltOptions = normalizeFlameMagicBoltOptions;
return exports;
})({}, THREE);

export {__vfxModule};
