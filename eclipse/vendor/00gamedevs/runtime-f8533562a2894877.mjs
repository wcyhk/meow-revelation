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

//#region src/effects/meteor-strike-runtime.js
/**
	* MeteorStrikeVFX.js — Stylized Toon 3D Meteor Strike Effect for Three.js
	* Features:
	* - 5-Stage deterministic anime sequence (4.80s)
	* - 100% 3D sculpted cel-shaded smoke/clouds (InstancedMesh, zero sprite smoke)
	* - 2048x2048 hairline volcanic crater cracks with organic texture-driven dissolve
	* - Outward-facing geometry and depth-writing 3D smoke shells
	* - Reusable scratch state and disposable resources
	*
	* Recommended Bloom Settings (Anti-Overexposure):
	* - ACESFilmicToneMapping (exposure: 0.92)
	* - UnrealBloomPass: strength 0.16, radius 0.20, threshold 0.98
	*/
	const METEOR_STRIKE = Object.freeze({
		duration: 4.8,
		impactTime: 1,
		maxParticles: 483
	});
	const REFERENCE_FPS = 60;
	const makeTexture = (create) => typeof document === "undefined" ? new three.Texture() : create();
	let sharedTextures = null;
	let textureUsers = 0;
	function acquireMeteorTextures() {
		if (!sharedTextures) {
			const rune = makeTexture(createRuneCircleTexture);
			try {
				sharedTextures = {
					rune,
					crater: makeTexture(createCraterDataTexture)
				};
			} catch (error) {
				rune.dispose();
				throw error;
			}
		}
		textureUsers++;
		return sharedTextures;
	}
	function releaseMeteorTextures() {
		if (--textureUsers !== 0) return;
		sharedTextures.rune.dispose();
		sharedTextures.crater.dispose();
		sharedTextures = null;
	}
	function createMulberry32(seed) {
		let a = seed >>> 0;
		return function() {
			a |= 0;
			a = a + 1831565813 | 0;
			let t = Math.imul(a ^ a >>> 15, 1 | a);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}
	function weldVertices(geometry, precision = 1e-4) {
		const posAttr = geometry.attributes.position;
		const uvAttr = geometry.attributes.uv;
		const invPrec = 1 / precision;
		const newPositions = [];
		const newUvs = uvAttr ? [] : null;
		const newIndices = [];
		const vertexMap = /* @__PURE__ */ new Map();
		const srcCount = geometry.index ? geometry.index.count : posAttr.count;
		const getIndex = geometry.index ? (i) => geometry.index.getX(i) : (i) => i;
		for (let i = 0; i < srcCount; i++) {
			const vi = getIndex(i);
			const x = posAttr.getX(vi);
			const y = posAttr.getY(vi);
			const z = posAttr.getZ(vi);
			const key = `${Math.round(x * invPrec)}_${Math.round(y * invPrec)}_${Math.round(z * invPrec)}`;
			let mapped = vertexMap.get(key);
			if (mapped === void 0) {
				mapped = newPositions.length / 3;
				vertexMap.set(key, mapped);
				newPositions.push(x, y, z);
				if (uvAttr) newUvs.push(uvAttr.getX(vi), uvAttr.getY(vi));
			}
			newIndices.push(mapped);
		}
		const welded = new three.BufferGeometry();
		welded.setAttribute("position", new three.Float32BufferAttribute(newPositions, 3));
		if (newUvs) welded.setAttribute("uv", new three.Float32BufferAttribute(newUvs, 2));
		welded.setIndex(newIndices);
		geometry.dispose();
		return welded;
	}
	function ensureOutwardWinding(geometry, center = new three.Vector3(0, 0, 0)) {
		const pos = geometry.attributes.position;
		const idx = geometry.index;
		const vA = new three.Vector3();
		const vB = new three.Vector3();
		const vC = new three.Vector3();
		const e1 = new three.Vector3();
		const e2 = new three.Vector3();
		const normal = new three.Vector3();
		const centroid = new three.Vector3();
		if (idx) {
			const arr = idx.array;
			for (let i = 0; i < arr.length; i += 3) {
				const ia = arr[i], ib = arr[i + 1], ic = arr[i + 2];
				vA.fromBufferAttribute(pos, ia);
				vB.fromBufferAttribute(pos, ib);
				vC.fromBufferAttribute(pos, ic);
				e1.subVectors(vB, vA);
				e2.subVectors(vC, vA);
				normal.crossVectors(e1, e2);
				centroid.addVectors(vA, vB).add(vC).multiplyScalar(1 / 3).sub(center);
				if (normal.dot(centroid) < 0) {
					arr[i + 1] = ic;
					arr[i + 2] = ib;
				}
			}
			idx.needsUpdate = true;
		} else {
			for (let i = 0; i < pos.count; i += 3) {
				vA.fromBufferAttribute(pos, i);
				vB.fromBufferAttribute(pos, i + 1);
				vC.fromBufferAttribute(pos, i + 2);
				e1.subVectors(vB, vA);
				e2.subVectors(vC, vA);
				normal.crossVectors(e1, e2);
				centroid.addVectors(vA, vB).add(vC).multiplyScalar(1 / 3).sub(center);
				if (normal.dot(centroid) < 0) {
					pos.setXYZ(i + 1, vC.x, vC.y, vC.z);
					pos.setXYZ(i + 2, vB.x, vB.y, vB.z);
				}
			}
			pos.needsUpdate = true;
		}
		geometry.computeVertexNormals();
		return geometry;
	}
	function createRuneCircleTexture() {
		const size = 1024;
		const half = size * .5;
		const canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Meteor Strike requires a 2D canvas to create its rune texture");
		ctx.clearRect(0, 0, size, size);
		ctx.save();
		ctx.translate(half, half);
		const bg = ctx.createRadialGradient(0, 0, 20, 0, 0, half * .94);
		bg.addColorStop(0, "rgba(255, 190, 90, 0.20)");
		bg.addColorStop(.55, "rgba(255, 85, 30, 0.14)");
		bg.addColorStop(.86, "rgba(255, 65, 25, 0.08)");
		bg.addColorStop(1, "rgba(0, 0, 0, 0.0)");
		ctx.fillStyle = bg;
		ctx.beginPath();
		ctx.arc(0, 0, half * .94, 0, Math.PI * 2);
		ctx.fill();
		const rings = [
			{
				r: half * .9,
				w: 6,
				a: .95
			},
			{
				r: half * .84,
				w: 2.5,
				a: .72
			},
			{
				r: half * .68,
				w: 4.5,
				a: .9
			},
			{
				r: half * .62,
				w: 2,
				a: .65
			},
			{
				r: half * .36,
				w: 3.5,
				a: .85
			}
		];
		for (const ring of rings) {
			ctx.strokeStyle = `rgba(255, 225, 160, ${ring.a})`;
			ctx.lineWidth = ring.w;
			ctx.beginPath();
			ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.strokeStyle = "rgba(255, 175, 95, 0.78)";
		ctx.lineWidth = 3;
		for (let k = 0; k < 2; k++) {
			ctx.beginPath();
			for (let i = 0; i <= 6; i++) {
				const ang = i / 6 * Math.PI * 2 + k * Math.PI / 6;
				const x = Math.cos(ang) * half * .68;
				const y = Math.sin(ang) * half * .68;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		}
		for (let i = 0; i < 48; i++) {
			const a = i / 48 * Math.PI * 2;
			const major = i % 4 === 0;
			const r0 = half * (major ? .69 : .73);
			const r1 = half * (major ? .83 : .8);
			ctx.strokeStyle = major ? "rgba(255, 240, 195, 0.95)" : "rgba(255, 160, 85, 0.65)";
			ctx.lineWidth = major ? 4.5 : 2.2;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
			ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
			ctx.stroke();
		}
		for (let i = 0; i < 8; i++) {
			const a = i / 8 * Math.PI * 2;
			ctx.save();
			ctx.rotate(a);
			ctx.fillStyle = "rgba(255, 232, 175, 0.92)";
			ctx.beginPath();
			ctx.moveTo(half * .44, 0);
			ctx.lineTo(half * .56, -12);
			ctx.lineTo(half * .52, 0);
			ctx.lineTo(half * .56, 12);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
		ctx.restore();
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = 8;
		tex.needsUpdate = true;
		return tex;
	}
	function createCraterDataTexture() {
		const size = 2048;
		const half = size * .5;
		const canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Meteor Strike requires a 2D canvas to create its crater texture");
		const rand = createMulberry32(991123);
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0, 0, size, size);
		const scorch = ctx.createRadialGradient(half, half, 20, half, half, half * .94);
		scorch.addColorStop(0, "rgba(0, 145, 255, 1)");
		scorch.addColorStop(.24, "rgba(0, 175, 240, 1)");
		scorch.addColorStop(.52, "rgba(0, 195, 205, 1)");
		scorch.addColorStop(.78, "rgba(0, 140, 115, 1)");
		scorch.addColorStop(.95, "rgba(0, 0, 0, 1)");
		ctx.fillStyle = scorch;
		ctx.fillRect(0, 0, size, size);
		ctx.save();
		ctx.translate(half, half);
		for (let i = 0; i < 120; i++) {
			const a = i / 120 * Math.PI * 2 + (rand() - .5) * .12;
			ctx.strokeStyle = `rgba(0, ${120 + Math.floor(rand() * 130)}, 0, 0.52)`;
			ctx.lineWidth = 3 + rand() * 12;
			ctx.beginPath();
			ctx.moveTo(Math.cos(a) * (40 + rand() * 140), Math.sin(a) * (40 + rand() * 140));
			ctx.lineTo(Math.cos(a + .05) * (360 + rand() * 540), Math.sin(a + .05) * (360 + rand() * 540));
			ctx.stroke();
		}
		for (let i = 0; i < 280; i++) {
			const a = rand() * Math.PI * 2;
			const dist = Math.sqrt(rand()) * half * .88;
			const rad = 12 + rand() * 44;
			ctx.fillStyle = `rgba(0, ${95 + Math.floor(rand() * 155)}, 0, 0.25)`;
			ctx.beginPath();
			ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, rad, 0, Math.PI * 2);
			ctx.fill();
		}
		const drawCrack = (x0, y0, angle, len, width, depth) => {
			if (depth <= 0 || len < 22) return;
			let cx = x0;
			let cy = y0;
			let curA = angle;
			const steps = 9 + Math.floor(rand() * 6);
			const segLen = len / steps;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			for (let s = 0; s < steps; s++) {
				curA += (rand() - .5) * .56;
				cx += Math.cos(curA) * segLen;
				cy += Math.sin(curA) * segLen;
				ctx.lineTo(cx, cy);
				if (s >= 1 && s < steps - 1 && rand() < .45 && depth > 1) {
					const branchSign = rand() > .5 ? 1 : -1;
					drawCrack(cx, cy, curA + branchSign * (.4 + rand() * .38), len * (.44 + rand() * .16), Math.max(.95, width * .54), depth - 1);
				}
			}
			ctx.strokeStyle = "rgba(185, 0, 0, 0.34)";
			ctx.lineWidth = width * 2.05;
			ctx.stroke();
			ctx.strokeStyle = "rgba(255, 0, 0, 0.98)";
			ctx.lineWidth = width;
			ctx.stroke();
		};
		for (let i = 0; i < 24; i++) {
			const ang = i / 24 * Math.PI * 2 + (rand() - .5) * .18;
			const startR = 6 + rand() * 22;
			const isMajor = i % 2 === 0;
			drawCrack(Math.cos(ang) * startR, Math.sin(ang) * startR, ang, isMajor ? 580 + rand() * 310 : 290 + rand() * 250, isMajor ? 2.15 + rand() * 1.25 : 1.25 + rand() * .8, isMajor ? 3 : 2);
		}
		const drawShatterRing = (baseR, lw, amp) => {
			ctx.beginPath();
			const segs = 128;
			for (let i = 0; i <= segs; i++) {
				const a = i / segs * Math.PI * 2;
				const jitter = Math.sin(a * 11) * amp + Math.cos(a * 23 + baseR) * (amp * .45);
				const px = Math.cos(a) * (baseR + jitter);
				const py = Math.sin(a) * (baseR + jitter);
				if (i === 0) ctx.moveTo(px, py);
				else ctx.lineTo(px, py);
			}
			ctx.strokeStyle = "rgba(185, 0, 0, 0.30)";
			ctx.lineWidth = lw * 2;
			ctx.stroke();
			ctx.strokeStyle = "rgba(255, 0, 0, 0.88)";
			ctx.lineWidth = lw;
			ctx.stroke();
		};
		drawShatterRing(135, 1.85, 14);
		drawShatterRing(315, 1.35, 22);
		ctx.restore();
		const tex = new three.CanvasTexture(canvas);
		tex.anisotropy = 8;
		tex.needsUpdate = true;
		return tex;
	}
	function createHeroMeteorGeometry(radius = 2.15) {
		const geo = weldVertices(new three.IcosahedronGeometry(radius, 4));
		const pos = geo.attributes.position;
		const rand = createMulberry32(40499);
		const plateCount = 14;
		const plates = [];
		const goldenAngle = Math.PI * (3 - Math.sqrt(5));
		for (let k = 0; k < plateCount; k++) {
			const y = 1 - k / 13 * 2;
			const r = Math.sqrt(Math.max(0, 1 - y * y));
			const theta = goldenAngle * k;
			const dir = new three.Vector3(Math.cos(theta) * r + (rand() - .5) * .34, y + (rand() - .5) * .34, Math.sin(theta) * r + (rand() - .5) * .34).normalize();
			plates.push({
				dir,
				height: .96 + rand() * .16,
				bevel: .1 + rand() * .12,
				shade: rand()
			});
		}
		const craters = [];
		for (let c = 0; c < 4; c++) craters.push({
			dir: new three.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize(),
			rad: .36 + rand() * .2,
			depth: .1 + rand() * .08
		});
		const rockData = new Float32Array(pos.count * 2);
		const v = new three.Vector3();
		const d = new three.Vector3();
		for (let i = 0; i < pos.count; i++) {
			v.fromBufferAttribute(pos, i);
			d.copy(v).normalize();
			let d1 = 99;
			let d2 = 99;
			let bestIdx = 0;
			for (let k = 0; k < plateCount; k++) {
				const dist = d.distanceTo(plates[k].dir);
				if (dist < d1) {
					d2 = d1;
					d1 = dist;
					bestIdx = k;
				} else if (dist < d2) d2 = dist;
			}
			const plate = plates[bestIdx];
			const edgeGap = d2 - d1;
			const crevice = Math.max(0, Math.min(1, 1 - edgeGap / .145));
			const creviceCurve = crevice * crevice * (3 - 2 * crevice);
			const plateDot = Math.max(.55, d.dot(plate.dir));
			const flatFacet = 1 / Math.pow(plateDot, .34) * .92;
			const crag = (Math.abs(Math.sin(d.x * 4.7 + d.y * 3.1 - d.z * 2.4)) - .5) * .085 + (Math.abs(Math.cos(d.y * 6.3 - d.z * 5.2 + d.x * 3.8)) - .5) * .052;
			let craterDisp = 0;
			for (let c = 0; c < craters.length; c++) {
				const cr = craters[c];
				const cd = d.distanceTo(cr.dir) / cr.rad;
				if (cd < 1.25) {
					if (cd < 1) craterDisp -= Math.cos(cd * Math.PI * .5) * cr.depth;
					else {
						const rim = (cd - 1) / .25;
						craterDisp += Math.sin(rim * Math.PI) * cr.depth * .26;
					}
				}
			}
			let rScale = plate.height * (.78 + .22 * flatFacet) + crag + craterDisp - creviceCurve * .21;
			rScale = Math.max(.68, Math.min(1.24, rScale));
			v.set(d.x * radius * rScale * 1.05, d.y * radius * rScale * 1.09, d.z * radius * rScale * .95);
			pos.setXYZ(i, v.x, v.y, v.z);
			rockData[i * 2] = creviceCurve;
			rockData[i * 2 + 1] = plate.shade;
		}
		pos.needsUpdate = true;
		geo.setAttribute("aRockData", new three.BufferAttribute(rockData, 2));
		return ensureOutwardWinding(geo);
	}
	function createBowShockGeometry() {
		const pts = [];
		const steps = 16;
		for (let i = 0; i <= steps; i++) {
			const u = i / steps;
			const y = -2.15 + u * 3.25;
			const r = 3.05 - Math.pow(u, 1.55) * 1.12;
			pts.push(new three.Vector2(r, y));
		}
		const geo = new three.LatheGeometry(pts, 40);
		const uv = geo.attributes.uv;
		for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
		geo.computeVertexNormals();
		return geo;
	}
	function createJaggedRockGeometry(radius = 1, detail = 2, seed = 42, roughness = .28) {
		const geo = new three.IcosahedronGeometry(radius, detail);
		const pos = geo.attributes.position;
		const v = new three.Vector3();
		const dir = new three.Vector3();
		const rand = createMulberry32(seed * 7919 >>> 0);
		const lobes = [];
		for (let k = 0; k < 7; k++) lobes.push({
			dir: new three.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize(),
			freq: 1.5 + rand() * 2.2,
			phase: rand() * Math.PI * 2,
			amp: (rand() > .45 ? 1 : -1) * (.28 + rand() * .44)
		});
		const axX = .9 + rand() * .22;
		const axY = .88 + rand() * .24;
		const axZ = .9 + rand() * .22;
		for (let i = 0; i < pos.count; i++) {
			v.fromBufferAttribute(pos, i);
			dir.copy(v).normalize();
			let disp = 0;
			for (let k = 0; k < lobes.length; k++) {
				const lb = lobes[k];
				const proj = dir.dot(lb.dir);
				disp += Math.sin(proj * lb.freq + lb.phase) * lb.amp * .3;
				if (proj > .35) disp += (proj - .35) * lb.amp * .52;
			}
			const scale = Math.max(.7, Math.min(1.32, 1 + disp * roughness));
			v.set(v.x * scale * axX, v.y * scale * axY, v.z * scale * axZ);
			pos.setXYZ(i, v.x, v.y, v.z);
		}
		pos.needsUpdate = true;
		return ensureOutwardWinding(geo);
	}
	function createSmoothCloudGeometry(radius = 1, detail = 3, seed = 314, puffiness = .14) {
		const geo = weldVertices(new three.IcosahedronGeometry(radius, detail));
		const pos = geo.attributes.position;
		const v = new three.Vector3();
		const s1 = seed * 1.13;
		const s2 = seed * 2.37;
		for (let i = 0; i < pos.count; i++) {
			v.fromBufferAttribute(pos, i);
			const billow = Math.sin(v.x * 2.4 + s1) * Math.cos(v.y * 2.2 + s2) + .45 * Math.sin(v.z * 3.8 - s1) * Math.cos(v.x * 3.2 + v.y * 2.7);
			v.multiplyScalar(1 + billow * puffiness * .55);
			pos.setXYZ(i, v.x, v.y, v.z);
		}
		pos.needsUpdate = true;
		return ensureOutwardWinding(geo);
	}
	function createMachConeGeometry(radius = 2.25, length = 14.2) {
		const radSegs = 48;
		const hSegs = 24;
		const positions = [];
		const uvs = [];
		const indices = [];
		for (let j = 0; j <= hSegs; j++) {
			const t = j / hSegs;
			const y = -.6 - t * length;
			const env = (1 - Math.pow(t, 1.28)) * (.86 + .34 * Math.sin(Math.min(1, t * 2.4) * Math.PI * .5));
			const baseR = Math.max(.06, radius * env);
			const fluteAmp = .16 * Math.sin(t * Math.PI) * (1 - t * .3);
			for (let i = 0; i <= radSegs; i++) {
				const u = i / radSegs;
				const theta = u * Math.PI * 2;
				const r = baseR * (1 + fluteAmp * Math.cos(theta * 6 + t * 4.2));
				positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
				uvs.push(u, t);
			}
		}
		const stride = 49;
		for (let j = 0; j < hSegs; j++) for (let i = 0; i < radSegs; i++) {
			const v00 = j * stride + i;
			const v01 = v00 + 1;
			const v10 = v00 + stride;
			const v11 = v10 + 1;
			indices.push(v00, v01, v10);
			indices.push(v01, v11, v10);
		}
		const geo = new three.BufferGeometry();
		geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		geo.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
		geo.setIndex(indices);
		geo.computeVertexNormals();
		return geo;
	}
	function createFireRibbonGeometry(radius = 2.45, length = 15.8) {
		const ribbonCount = 3;
		const segs = 36;
		const positions = [];
		const uvs = [];
		const indices = [];
		let vOffset = 0;
		for (let k = 0; k < ribbonCount; k++) {
			const baseAng = k / ribbonCount * Math.PI * 2;
			const twistTurns = 1.55 + k % 2 * .25;
			for (let s = 0; s <= segs; s++) {
				const t = s / segs;
				const y = -.85 - t * length;
				const ang = baseAng + t * Math.PI * 2 * twistTurns;
				const r = radius * (1 - t * .78) + Math.sin(t * Math.PI) * .45;
				const halfW = .48 * Math.sin(t * Math.PI) * (1 - t * .28);
				const cx = Math.cos(ang) * r;
				const cz = Math.sin(ang) * r;
				const tx = -Math.sin(ang) * .65 + Math.cos(ang) * .45;
				const tz = Math.cos(ang) * .65 + Math.sin(ang) * .45;
				positions.push(cx - tx * halfW, y + halfW * .55, cz - tz * halfW, cx + tx * halfW, y - halfW * .55, cz + tz * halfW);
				uvs.push(0, t, 1, t);
			}
			for (let s = 0; s < segs; s++) {
				const i0 = vOffset + s * 2;
				const i1 = i0 + 1;
				const i2 = i0 + 2;
				const i3 = i0 + 3;
				indices.push(i0, i2, i1);
				indices.push(i1, i2, i3);
			}
			vOffset += 74;
		}
		const geo = new three.BufferGeometry();
		geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		geo.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
		geo.setIndex(indices);
		geo.computeVertexNormals();
		return geo;
	}
	function createAnime4PointStarGeometry() {
		const positions = [];
		const indices = [];
		const addRay = (tipVec, uVec, vVec, baseW) => {
			const baseIdx = positions.length / 3;
			const c0 = uVec.clone().multiplyScalar(baseW);
			const c1 = vVec.clone().multiplyScalar(baseW);
			const c2 = uVec.clone().multiplyScalar(-baseW);
			const c3 = vVec.clone().multiplyScalar(-baseW);
			positions.push(tipVec.x, tipVec.y, tipVec.z, c0.x, c0.y, c0.z, c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, c3.x, c3.y, c3.z);
			indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3, baseIdx, baseIdx + 3, baseIdx + 4, baseIdx, baseIdx + 4, baseIdx + 1);
		};
		const X = new three.Vector3(1, 0, 0);
		const Y = new three.Vector3(0, 1, 0);
		const Z = new three.Vector3(0, 0, 1);
		addRay(new three.Vector3(0, 1.85, 0), X, Z, .22);
		addRay(new three.Vector3(0, -1.85, 0), X, Z, .22);
		addRay(new three.Vector3(1.55, 0, 0), Y, Z, .2);
		addRay(new three.Vector3(-1.55, 0, 0), Y, Z, .2);
		addRay(new three.Vector3(0, 0, .65), X, Y, .2);
		addRay(new three.Vector3(0, 0, -.65), X, Y, .2);
		const geo = new three.BufferGeometry();
		geo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		geo.setIndex(indices);
		return ensureOutwardWinding(geo);
	}
	function createUpturnedSlabGeometry() {
		const geo = new three.BoxGeometry(1.45, 1.95, .56, 3, 4, 2);
		const pos = geo.attributes.position;
		const v = new three.Vector3();
		for (let i = 0; i < pos.count; i++) {
			v.fromBufferAttribute(pos, i);
			const hNorm = (v.y + .975) / 1.95;
			const taperX = 1 - hNorm * .42;
			const taperZ = 1 - hNorm * .34;
			v.x *= taperX;
			v.z *= taperZ;
			const jag = Math.sin(v.x * 5.2 + v.y * 3.7) * .14 + Math.cos(v.y * 6.3 - v.z * 4.5) * .1;
			v.x += jag * .55;
			v.z += jag * .45;
			if (hNorm > .72) v.y += Math.sin(v.x * 4.8) * .26;
			pos.setXYZ(i, v.x, v.y, v.z);
		}
		pos.needsUpdate = true;
		ensureOutwardWinding(geo);
		geo.translate(0, .78, 0);
		return geo;
	}
	function createBurstSpikeGeometry() {
		const geo = new three.ConeGeometry(.42, 3.6, 5, 1, false);
		ensureOutwardWinding(geo);
		geo.translate(0, 1.8, 0);
		return geo;
	}
	function createHeatHazeShellsGeometry() {
		const radii = [
			2.6,
			5.2,
			8
		];
		const heights = [
			6.2,
			5,
			3.8
		];
		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let vOffset = 0;
		for (let s = 0; s < radii.length; s++) {
			const cyl = new three.CylinderGeometry(radii[s] * 1.18, radii[s], heights[s], 36, 10, true);
			cyl.translate(0, heights[s] * .5 + .15, 0);
			const p = cyl.attributes.position;
			const n = cyl.attributes.normal;
			const u = cyl.attributes.uv;
			const idx = cyl.index;
			for (let i = 0; i < p.count; i++) {
				positions.push(p.getX(i), p.getY(i), p.getZ(i));
				normals.push(n.getX(i), n.getY(i), n.getZ(i));
				uvs.push(u.getX(i), u.getY(i));
			}
			for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + vOffset);
			vOffset += p.count;
			cyl.dispose();
		}
		const merged = new three.BufferGeometry();
		merged.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		merged.setAttribute("normal", new three.Float32BufferAttribute(normals, 3));
		merged.setAttribute("uv", new three.Float32BufferAttribute(uvs, 2));
		merged.setIndex(indices);
		return merged;
	}
	const VFX_SHADERS = {
		runeVert: "\n        varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        }\n      ",
		runeFrag: "\n        uniform sampler2D uMap;\n        uniform float uTime;\n        uniform float uOpacity;\n        uniform float uPulse;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorCore;\n        varying vec2 vUv;\n\n        void main() {\n          vec2 p = vUv * 2.0 - 1.0;\n          float r = length(p);\n          if (r > 0.99) discard;\n\n          vec4 tex = texture2D(uMap, vUv);\n          if (tex.a < 0.02) discard;\n\n          float sweep = 0.85 + 0.15 * sin(uTime * 8.0 - r * 10.0);\n          float hot = clamp(tex.r * sweep + uPulse * 0.45, 0.0, 1.2);\n          vec3 col = mix(uColorMid * 0.88, uColorBright * 0.95, smoothstep(0.25, 0.72, hot));\n          col = mix(col, uColorCore * 1.04, smoothstep(0.75, 1.05, hot));\n          float alpha = tex.a * uOpacity * smoothstep(0.99, 0.92, r);\n          if (alpha < 0.015) discard;\n          gl_FragColor = vec4(col, alpha);\n        }\n      ",
		meteorVert: "\n        attribute vec2 aRockData; // x: geometric tectonic crevice depth (0..1), y: plate shade\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        varying vec2 vRockData;\n        void main() {\n          vLocalPos = position;\n          vRockData = aRockData;\n          vec4 wp = modelMatrix * vec4(position, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		meteorFrag: "\n        uniform float uTime;\n        uniform vec3 uFlightDir;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorRock;\n        uniform vec3 uColorInk;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        varying vec2 vRockData;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vec3 N = normalize(vNormalW);\n          vec3 V = normalize(vViewDir);\n          vec3 L = normalize(vec3(0.48, 0.84, 0.42));\n          vec3 F = normalize(uFlightDir);\n\n          // Crisp 3-step anime cel-shading on dark chiseled volcanic obsidian plates\n          float ndotl = dot(N, L);\n          float celShadow = step(-0.12, ndotl);\n          float celLit = step(0.42, ndotl);\n          float plateTone = 0.84 + vRockData.y * 0.28;\n\n          // Subtle micro-grain rock strata on slab surfaces\n          float grain = fbm3(vLocalPos * 3.1 + vec3(2.4, 5.1, 1.3));\n          float strata = step(0.56, grain) * 0.14;\n\n          vec3 rockDark = uColorInk * 0.72;\n          vec3 rockMid  = uColorRock * 0.82 * plateTone;\n          vec3 rockHi   = (uColorRock * 1.24 + vec3(0.08, 0.05, 0.07)) * plateTone;\n          vec3 rockCol  = mix(rockDark, rockMid, celShadow);\n          rockCol       = mix(rockCol, rockHi, celLit * (0.75 + strata));\n\n          // Atmospheric entry scorch glow on leading hemisphere (keeps dark plates readable!)\n          float noseFace = smoothstep(-0.15, 0.90, dot(N, F));\n          float fresnel = pow(max(1.0 - max(dot(N, V), 0.0), 0.0001), 2.2);\n          rockCol = mix(rockCol, uColorMid * 0.68, noseFace * (0.22 + fresnel * 0.42));\n\n          // Physically recessed magma canyons driven by geometric crevice + jagged organic noise\n          float creviceGeo = vRockData.x;\n          float crackNoise = fbm3(vLocalPos * 2.6 + vec3(uTime * 0.45, -uTime * 0.75, 0.0));\n          float pulse = 0.88 + 0.12 * sin(uTime * 10.0 + vLocalPos.y * 2.8 + vLocalPos.x * 2.1);\n\n          // Main deep tectonic lava rivers + subtle fiery cracks spreading near leading nose\n          float magma = clamp((creviceGeo * 1.18 + (crackNoise - 0.46) * 0.34 + noseFace * creviceGeo * 0.28) * pulse, 0.0, 1.3);\n\n          // Crisp cel-stepped molten core: obsidian rock -> deep crimson wall -> vivid orange -> cream-gold core\n          vec3 col = rockCol;\n          col = mix(col, uColorMid * 0.92, step(0.32, magma));\n          col = mix(col, uColorBright * 0.98, step(0.56, magma));\n          col = mix(col, uColorCore * 1.08, step(0.84, magma));\n\n          // Superheated rim catchlight strictly along leading atmospheric-entry silhouette edge\n          float noseRim = smoothstep(0.45, 0.82, fresnel) * smoothstep(0.10, 0.85, noseFace);\n          col = mix(col, uColorBright * 1.02, noseRim * 0.75);\n          col = mix(col, uColorCore * 1.05, smoothstep(0.72, 0.92, fresnel) * noseFace * 0.55);\n\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		meteorOutlineVert: "\n        uniform float uOutlineWidth;\n        varying vec3 vNormalW;\n        void main() {\n          vec3 pos = position + normal * uOutlineWidth;\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		meteorOutlineFrag: "\n        uniform vec3 uFlightDir;\n        uniform vec3 uColorInk;\n        uniform vec3 uColorMid;\n        varying vec3 vNormalW;\n        void main() {\n          float nose = smoothstep(0.15, 0.90, dot(normalize(vNormalW), normalize(uFlightDir)));\n          vec3 col = mix(uColorInk * 0.34, uColorMid * 0.78, nose * 0.65);\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		bowShockVert: "\n        uniform float uTime;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vUv = uv;\n          vec3 pos = position;\n          float flutter = (ridgeFbm3(vec3(pos.x * 1.4, pos.y * 1.1 - uTime * 14.0, pos.z * 1.4)) - 0.5) * 0.24 * uv.y;\n          pos += normal * flutter;\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		bowShockFrag: "\n        uniform float uTime;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          // Thin razor-sharp atmospheric compression ring with wind-shredded rear wisps\n          float streak = ridgeFbm3(vec3(vUv.x * 10.0, vUv.y * 3.4 - uTime * 13.0, uTime * 1.8));\n          float frontBand = smoothstep(0.18, 0.0, vUv.y) * 0.55;\n          float mask = (1.0 - vUv.y * 1.18) + (streak - 0.45) * 0.72 + frontBand;\n          // Carve crisp anime gaps so it reads as sleek flying plasma arcs, not a solid collar\n          float arcGaps = sin(vUv.x * 25.1327 + streak * 3.5) * 0.5 + 0.5;\n          mask -= (1.0 - arcGaps) * 0.36 * smoothstep(0.06, 0.45, vUv.y);\n          if (mask < 0.44) discard;\n\n          vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);\n          float rim = pow(max(1.0 - abs(dot(N, normalize(vViewDir))), 0.0001), 1.6);\n\n          vec3 col = uColorMid * 0.90;\n          col = mix(col, uColorBright * 0.96, step(0.56, mask));\n          col = mix(col, uColorCore * 1.05, step(0.84, mask + frontBand * 0.45 + rim * 0.15));\n          col = mix(col, uColorInk * 0.45, smoothstep(0.49, 0.44, mask) * 0.80);\n          if (!gl_FrontFacing) col *= 0.78;\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		machConeVert: "\n        uniform float uTime;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vUv = uv;\n          vec3 pos = position;\n          // Continuous 3D local-space turbulent whipping (zero UV seam tears)\n          float n = ridgeFbm3(vec3(pos.x * 1.05, pos.y * 0.42 - uTime * 11.5, pos.z * 1.05)) - 0.5;\n          pos += normal * (n * 0.48 * smoothstep(0.02, 0.75, uv.y));\n          // Slight dynamic anime whip sway toward tail tip\n          float whip = uv.y * uv.y * 0.72;\n          pos.x += sin(uv.y * 5.5 - uTime * 14.0) * whip;\n          pos.z += cos(uv.y * 4.8 - uTime * 12.5) * whip;\n\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		machConeFrag: "\n        uniform float uTime;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          // Swirling hand-drawn anime fire licks with deep sculpted flame cutouts\n          vec2 flow = vec2(vUv.x * 6.0 + vUv.y * 1.2, vUv.y * 4.4 - uTime * 10.5);\n          float n1 = ridgeFbm3(vec3(flow, uTime * 1.4));\n          float n2 = fbm3(vec3(vUv.x * 12.0, vUv.y * 6.0 - uTime * 14.0, 2.3));\n          float tongues = sin(vUv.x * 37.6991 + n1 * 5.0) * 0.5 + 0.5;\n\n          float erode = (1.0 - vUv.y * 1.16) + (n1 - 0.48) * 0.72 + (tongues - 0.5) * 0.34 * smoothstep(0.04, 0.55, vUv.y);\n          // Punch dramatic fiery holes near mid-tail like Studio Trigger / anime Sakuga flames\n          float hole = smoothstep(0.30, 0.72, vUv.y) * smoothstep(0.58, 0.78, n2) * 0.36;\n          erode -= hole;\n          if (erode < 0.36) discard;\n\n          vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);\n          float ndotv = abs(dot(N, normalize(vViewDir)));\n\n          // Rich crimson -> vivid anime orange body; tight cream-gold core ONLY right behind rock\n          vec3 col = uColorInk * 0.50;\n          col = mix(col, uColorMid * 0.90, step(0.41, erode));\n          col = mix(col, uColorBright * 0.95, step(0.62, erode + ndotv * 0.14));\n          float hotCore = smoothstep(0.28, 0.0, vUv.y) * 0.52 + erode * 0.42 + ndotv * 0.16;\n          col = mix(col, uColorCore * 1.00, step(0.92, hotCore));\n          // Crisp dark ink border along cutout flame silhouettes\n          col = mix(col, uColorInk * 0.42, smoothstep(0.42, 0.36, erode) * 0.85);\n          if (!gl_FrontFacing) col *= 0.74;\n\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		fireRibbonVert: "\n        uniform float uTime;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        void main() {\n          vUv = uv;\n          vec3 pos = position;\n          float wave = sin(uv.y * 8.5 - uTime * 15.0) * 0.24 * uv.y;\n          pos.x += wave;\n          pos.z += cos(uv.y * 7.2 - uTime * 13.5) * 0.24 * uv.y;\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		fireRibbonFrag: "\n        uniform float uTime;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          // Sharp ribbon profile across width (vUv.x) and length (vUv.y)\n          float edge = 1.0 - abs(vUv.x * 2.0 - 1.0);\n          float streak = ridgeFbm3(vec3(vUv.x * 3.0, vUv.y * 6.5 - uTime * 13.0, uTime * 0.8));\n          float mask = edge * 0.85 + streak * 0.48 - vUv.y * 0.55;\n          if (mask < 0.36) discard;\n\n          vec3 col = uColorInk * 0.48;\n          col = mix(col, uColorMid * 0.90, step(0.41, mask));\n          col = mix(col, uColorBright * 0.96, step(0.62, mask));\n          col = mix(col, uColorCore * 1.02, step(0.88, mask + (1.0 - vUv.y) * 0.22));\n          if (!gl_FrontFacing) col *= 0.84;\n          col = min(col, vec3(0.96));\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		plasmaDomeVert: "\n        uniform float uTime;\n        uniform float uDissolve;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vLocalPos = position;\n          float disp = (ridgeFbm3(position * 2.6 + vec3(0.0, -uTime * 3.0, 0.0)) - 0.5) * 0.22;\n          vec3 pos = position + normal * disp;\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		plasmaDomeFrag: "\n        uniform float uTime;\n        uniform float uDissolve;\n        uniform float uPeak;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vec2 cellUv = vec2(atan(vLocalPos.z, vLocalPos.x) * 3.2, vLocalPos.y * 5.0 - uTime * 1.5);\n          float vEdge = voronoiEdge(cellUv);\n          float n = fbm3(vLocalPos * 2.4 + vec3(0.0, -uTime * 2.2, 0.0));\n          float cut = (n * 0.75 + smoothstep(0.0, 0.25, vEdge) * 0.25) - uDissolve;\n          if (cut < 0.0 || vLocalPos.y < -0.01) discard;\n\n          vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);\n          vec3 V = normalize(vViewDir);\n          float ndotv = abs(dot(N, V));\n          float fresnel = pow(max(1.0 - ndotv, 0.0001), 2.0);\n          float crackGlow = smoothstep(0.14, 0.02, vEdge);\n\n          float coreBand = ndotv * 0.62 + crackGlow * 0.42 + cut * 0.28;\n          vec3 col = uColorMid * 0.84;\n          col = mix(col, uColorBright * 0.88, step(0.36, coreBand));\n          col = mix(col, uColorCore * (0.94 + uPeak * 0.14), step(0.66, coreBand));\n          col = mix(col, uColorInk * 0.55, smoothstep(0.58, 0.76, fresnel) * 0.86);\n          if (!gl_FrontFacing) col *= 0.78;\n\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		skyPillarVert: "\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        void main() {\n          vUv = uv;\n          vec4 wp = modelMatrix * vec4(position, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		skyPillarFrag: "\n        uniform float uTime;\n        uniform float uDissolve;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          float streak = ridgeFbm3(vec3(vUv.x * 9.0, vUv.y * 2.8 - uTime * 6.0, uTime * 0.7));\n          float bands = sin(vUv.y * 22.0 - uTime * 18.0) * 0.5 + 0.5;\n          float vertFade = smoothstep(0.0, 0.07, vUv.y) * smoothstep(1.0, 0.55, vUv.y);\n          vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);\n          float facing = abs(dot(N, normalize(vViewDir)));\n          float mask = (streak * 0.74 + bands * 0.26) * vertFade * smoothstep(0.06, 0.42, facing) - uDissolve * 0.86;\n          if (mask < 0.14) discard;\n\n          vec3 col = uColorInk * 0.65;\n          col = mix(col, uColorMid * 0.84, step(0.18, mask));\n          col = mix(col, uColorBright * 0.90, step(0.36, mask));\n          col = mix(col, uColorCore * 1.04, step(0.62, mask + facing * 0.14));\n          if (!gl_FrontFacing) col *= 0.80;\n\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		shockwaveVert: "\n        varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        }\n      ",
		shockwaveFrag: "\n        uniform float uTime;\n        uniform float uProgress;\n        uniform float uThickness;\n        uniform float uOpacity;\n        uniform vec3 uColorA;\n        uniform vec3 uColorB;\n        uniform vec3 uColorInk;\n        varying vec2 vUv;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vec2 p = vUv * 2.0 - 1.0;\n          float r = length(p);\n          if (r > 0.99) discard;\n\n          float ang = atan(p.y, p.x);\n          float jag = (noise2(vec2(ang * 5.0 + uTime * 2.0, r * 6.0)) - 0.5) * 0.06;\n          float radius = mix(0.08, 0.94, uProgress);\n          float dist = abs((r + jag) - radius);\n          float ring = smoothstep(uThickness, uThickness * 0.28, dist);\n          if (ring < 0.05) discard;\n\n          vec3 col = mix(uColorInk * 0.55, uColorB * 0.86, step(0.22, ring));\n          col = mix(col, uColorA * 0.96, step(0.62, ring));\n          float alpha = ring * uOpacity * smoothstep(0.99, 0.86, r);\n          if (alpha < 0.02) discard;\n          gl_FragColor = vec4(col, alpha);\n        }\n      ",
		machCollarVert: "\n        uniform float uTime;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vLocalPos = position;\n          float n = (ridgeFbm3(position * 2.2 + vec3(0.0, uTime * 2.4, 0.0)) - 0.5) * 0.07;\n          vec3 pos = position + normal * n;\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		machCollarFrag: "\n        uniform float uTime;\n        uniform float uDissolve;\n        uniform vec3 uColorAirWhite;\n        uniform vec3 uColorAirShadow;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorInk;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          float erode = ridgeFbm3(vLocalPos * 1.45 + vec3(0.0, uTime * 1.2, 0.0));\n          if (erode < uDissolve) discard;\n\n          vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);\n          vec3 V = normalize(vViewDir);\n          vec3 L = normalize(vec3(0.45, 0.85, 0.40));\n          float ndotl = dot(N, L);\n          float cel = step(-0.08, ndotl) * 0.65 + step(0.40, ndotl) * 0.35;\n          float underFire = smoothstep(0.18, -0.52, N.y);\n          float rim = smoothstep(0.54, 0.72, pow(max(1.0 - abs(dot(N, V)), 0.0001), 2.0));\n\n          vec3 col = mix(uColorAirShadow * 0.84, uColorAirWhite * 0.88, cel);\n          col = mix(col, uColorBright * 0.84, underFire * 0.36);\n          col = mix(col, uColorInk * 0.50, rim * 0.76);\n          if (!gl_FrontFacing) col *= 0.82;\n          col = min(col, vec3(0.88));\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		toonCloudVert: "\n        attribute vec4 aCloudParams; // x: heat(0..1), y: dissolve(0..1), z: seed, w: mode(0=fire/smoke, 1=dust)\n        uniform float uTime;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        varying vec4 vParams;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vParams = aCloudParams;\n          float seed = aCloudParams.z;\n          // Sharp ridge-noise sculptural churning for hand-drawn jagged anime smoke silhouette\n          float n = ridgeFbm3(position * 1.65 + vec3(seed * 1.7, -uTime * 1.35, seed * 0.9));\n          vec3 displaced = position + normal * ((n - 0.42) * 0.42);\n          vLocalPos = displaced;\n\n          vec4 wp = modelMatrix * instanceMatrix * vec4(displaced, 1.0);\n          mat3 instNMat = mat3(modelMatrix) * mat3(instanceMatrix);\n          vNormalW = normalize(instNMat * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		toonCloudFrag: "\n        uniform float uTime;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        uniform vec3 uColorSmokeMid;\n        uniform vec3 uColorSmokeDark;\n        uniform vec3 uColorDustLight;\n        uniform vec3 uColorDustDark;\n        varying vec3 vNormalW;\n        varying vec3 vLocalPos;\n        varying vec3 vViewDir;\n        varying vec4 vParams;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          float heat = vParams.x;\n          float dissolve = vParams.y;\n          float seed = vParams.z;\n          float isDust = vParams.w;\n\n          // Sharp alpha-cutout angular dissolve (zero muddy soft fading!)\n          float erodeNoise = ridgeFbm3(vLocalPos * 2.05 + vec3(seed * 0.5, -uTime * 0.85, seed * 0.3));\n          if (dissolve > 0.01 && erodeNoise < dissolve) discard;\n\n          vec3 N = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);\n          vec3 V = normalize(vViewDir);\n          vec3 L = normalize(vec3(0.50, 0.82, 0.38));\n\n          float ndotl = dot(N, L);\n          float celLight = step(-0.14, ndotl) * 0.55 + step(0.36, ndotl) * 0.45;\n          float underBounce = smoothstep(0.15, -0.60, N.y);\n          float ndotv = abs(dot(N, V));\n          float inkRim = smoothstep(0.52, 0.72, pow(max(1.0 - ndotv, 0.0001), 2.0)) * smoothstep(0.35, -0.35, ndotl);\n\n          vec3 col;\n          if (isDust > 0.5) {\n            col = mix(uColorDustDark * 0.78, uColorDustLight * 0.84, celLight);\n            col = mix(col, uColorMid * 0.75, underBounce * heat * 0.45);\n          } else {\n            vec3 smokeBase = mix(uColorSmokeDark * 0.78, uColorSmokeMid * 0.84, celLight);\n            vec3 fireBand = mix(uColorMid * 0.84, uColorBright * 0.88, step(0.45, celLight + underBounce * 0.45));\n            fireBand = mix(fireBand, uColorCore * 0.92, step(0.84, heat + celLight * 0.25));\n            float fireMask = smoothstep(0.18, 0.78, heat + underBounce * 0.42 * heat);\n            col = mix(smokeBase, fireBand, fireMask);\n            col = mix(col, uColorBright * 0.86, underBounce * heat * 0.55);\n          }\n\n          // Hand-drawn dark ink border on backlit rim\n          col = mix(col, uColorInk * 0.45, inkRim * 0.86);\n          if (!gl_FrontFacing) col *= 0.78;\n          col = min(col, vec3(0.88));\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		rockInstVert: "\n        attribute float aHeat;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        varying float vHeat;\n        void main() {\n          vHeat = aHeat;\n          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		rockInstFrag: "\n        uniform vec3 uColorRock;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        varying float vHeat;\n\n        void main() {\n          vec3 N = normalize(vNormalW);\n          vec3 V = normalize(vViewDir);\n          vec3 L = normalize(vec3(0.50, 0.82, 0.42));\n          float ndotl = dot(N, L);\n          float cel = step(-0.10, ndotl) * 0.62 + step(0.42, ndotl) * 0.38;\n          float underGlow = smoothstep(0.18, -0.58, N.y) * vHeat;\n          float rim = smoothstep(0.60, 0.80, pow(max(1.0 - max(dot(N, V), 0.0), 0.0001), 2.1));\n\n          vec3 col = mix(uColorRock * 0.36, uColorRock * 0.88, cel);\n          col = mix(col, uColorMid * 0.88, step(0.18, underGlow));\n          col = mix(col, uColorBright * 0.94, step(0.54, underGlow));\n          col = mix(col, uColorInk * 0.48, rim * 0.80);\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		starSpikeVert: "\n        attribute float aFlash;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        varying float vFlash;\n        void main() {\n          vFlash = aFlash;\n          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		starSpikeFrag: "\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorInk;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        varying float vFlash;\n\n        void main() {\n          vec3 N = normalize(vNormalW);\n          vec3 V = normalize(vViewDir);\n          float ndotv = max(dot(N, V), 0.0);\n          float rim = smoothstep(0.55, 0.80, pow(max(1.0 - ndotv, 0.0001), 2.0));\n\n          vec3 col = mix(uColorMid * 0.88, uColorBright * 0.95, step(0.28, ndotv));\n          col = mix(col, uColorCore * (0.98 + vFlash * 0.10), step(0.52, ndotv + vFlash * 0.25));\n          col = mix(col, uColorInk * 0.55, rim * 0.72);\n          gl_FragColor = vec4(col, 1.0);\n        }\n      ",
		craterVert: "\n        varying vec2 vUv;\n        void main() {\n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        }\n      ",
		craterFrag: "\n        uniform sampler2D uCraterMap;\n        uniform float uTime;\n        uniform float uHeat;\n        uniform float uAppear;\n        uniform float uDissolve;\n        uniform vec3 uColorCore;\n        uniform vec3 uColorBright;\n        uniform vec3 uColorMid;\n        uniform vec3 uColorRock;\n        uniform vec3 uColorInk;\n        varying vec2 vUv;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          vec2 p = vUv * 2.0 - 1.0;\n          float r = length(p);\n          if (r > 0.99) discard;\n\n          vec3 data = texture2D(uCraterMap, vUv).rgb;\n          float crackHeat = data.r;\n          float rockTex   = data.g;\n          float scorch    = data.b;\n\n          // Radial fracture burst-in on impact\n          float appearEdge = uAppear * 1.12;\n          if (r > appearEdge) discard;\n\n          float radialMask = smoothstep(0.99, 0.84, r);\n          float baseCoverage = scorch * 0.82 + crackHeat * 1.15;\n          if (baseCoverage < 0.07) discard;\n\n          // Procedural + texture erosion field for organic texture-driven dissolve (NO plain alpha fade!)\n          float nLow  = noise2(vUv * 11.0 + vec2(1.7, 3.1));\n          float nHigh = noise2(vUv * 28.0 - vec2(4.3, 2.2));\n          float dissolveNoise = nLow * 0.52 + nHigh * 0.28 + rockTex * 0.20;\n          float radialStay = (1.0 - r) * 0.36;\n          float crackStay = smoothstep(0.18, 0.72, crackHeat) * 0.20;\n          float dissolveField = clamp(dissolveNoise * 0.62 + radialStay + crackStay, 0.0, 1.0);\n\n          float cutDelta = dissolveField - uDissolve * 1.08;\n          if (uDissolve > 0.001 && cutDelta < 0.0) discard;\n\n          // Hairline lava cracks break apart along high-frequency texture noise as they dissolve\n          float crackErode = smoothstep(uDissolve * 0.92, uDissolve * 0.92 + 0.14, nHigh * 0.55 + nLow * 0.25 + (1.0 - r) * 0.35);\n          float breathe = 0.86 + 0.14 * sin(uTime * 5.0 - r * 9.0 + rockTex * 4.5);\n          float lava = clamp(crackHeat * (0.24 + uHeat * 1.08) * breathe * crackErode, 0.0, 1.25);\n\n          vec3 col = mix(uColorRock * 0.32, uColorRock * 0.76, step(0.46, rockTex));\n          col = mix(col, uColorMid * 0.86, step(0.22, lava));\n          col = mix(col, uColorBright * 0.92, step(0.48, lava));\n          col = mix(col, uColorCore * 1.04, step(0.84, lava));\n\n          // Crisp ash/ember cel frontier right along the receding texture dissolve edge\n          if (uDissolve > 0.001) {\n            float rimMask = smoothstep(0.065, 0.0, cutDelta);\n            vec3 rimCol = mix(uColorInk * 0.55, uColorBright * 0.88, smoothstep(0.15, 0.55, crackHeat + uHeat * 0.35));\n            col = mix(col, rimCol, rimMask * 0.85);\n          }\n\n          float edgeSoft = smoothstep(0.0, 0.025, cutDelta + (1.0 - step(0.001, uDissolve)));\n          float alpha = smoothstep(0.06, 0.22, baseCoverage) * radialMask * edgeSoft;\n          if (alpha < 0.02) discard;\n          gl_FragColor = vec4(col, alpha);\n        }\n      ",
		heatHazeVert: "\n        uniform float uTime;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        void main() {\n          vUv = uv;\n          vec3 pos = position;\n          float wave = sin(uv.y * 14.0 - uTime * 6.5 + uv.x * 12.5663706) * 0.18 * uv.y;\n          pos.x += wave;\n          pos.z += cos(uv.y * 11.0 - uTime * 5.2 + uv.x * 6.2831853) * 0.16 * uv.y;\n          vec4 wp = modelMatrix * vec4(pos, 1.0);\n          vNormalW = normalize(mat3(modelMatrix) * normal);\n          vViewDir = normalize(cameraPosition - wp.xyz);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		heatHazeFrag: "\n        uniform float uTime;\n        uniform float uIntensity;\n        uniform vec3 uColorHeat;\n        uniform vec3 uColorCore;\n        varying vec2 vUv;\n        varying vec3 vNormalW;\n        varying vec3 vViewDir;\n        \n      float hash21(vec2 p) {\n        p = fract(p * vec2(123.34, 456.21));\n        p += dot(p, p + 45.32);\n        return fract(p.x * p.y);\n      }\n\n      float noise2(vec2 p) {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        vec2 u = f * f * (3.0 - 2.0 * f);\n        float a = hash21(i);\n        float b = hash21(i + vec2(1.0, 0.0));\n        float c = hash21(i + vec2(0.0, 1.0));\n        float d = hash21(i + vec2(1.0, 1.0));\n        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n      }\n\n      float hash31(vec3 p) {\n        p = fract(p * 0.1031);\n        p += dot(p, p.yzx + 33.33);\n        return fract((p.x + p.y) * p.z);\n      }\n\n      float noise3(vec3 p) {\n        vec3 i = floor(p);\n        vec3 f = fract(p);\n        vec3 u = f * f * (3.0 - 2.0 * f);\n        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));\n        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));\n        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));\n        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));\n        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));\n        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));\n        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));\n        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));\n        float nx00 = mix(n000, n100, u.x);\n        float nx10 = mix(n010, n110, u.x);\n        float nx01 = mix(n001, n101, u.x);\n        float nx11 = mix(n011, n111, u.x);\n        float nxy0 = mix(nx00, nx10, u.y);\n        float nxy1 = mix(nx01, nx11, u.y);\n        return mix(nxy0, nxy1, u.z);\n      }\n\n      float fbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.5;\n        for (int i = 0; i < 3; i++) {\n          v += a * noise3(p);\n          p = p * 2.04 + vec3(17.1, 31.7, 11.3);\n          a *= 0.5;\n        }\n        return v;\n      }\n\n      float ridgeFbm3(vec3 p) {\n        float v = 0.0;\n        float a = 0.55;\n        for (int i = 0; i < 3; i++) {\n          float n = 1.0 - abs(noise3(p) * 2.0 - 1.0);\n          v += a * n * n;\n          p = p * 2.08 + vec3(13.7, 29.3, 7.9);\n          a *= 0.48;\n        }\n        return v;\n      }\n\n      float voronoiEdge(vec2 x) {\n        vec2 n = floor(x);\n        vec2 f = fract(x);\n        float md1 = 8.0;\n        float md2 = 8.0;\n        for (int j = -1; j <= 1; j++) {\n          for (int i = -1; i <= 1; i++) {\n            vec2 g = vec2(float(i), float(j));\n            vec2 o = vec2(hash21(n + g), hash21(n + g + vec2(37.2, 17.9)));\n            vec2 r = g + o - f;\n            float d = dot(r, r);\n            if (d < md1) {\n              md2 = md1;\n              md1 = d;\n            } else if (d < md2) {\n              md2 = d;\n            }\n          }\n        }\n        return sqrt(md2) - sqrt(md1);\n      }\n    \n\n        void main() {\n          float ripple = sin(vUv.y * 22.0 - uTime * 9.5 + noise2(vec2(vUv.x * 8.0, vUv.y * 4.0 - uTime * 2.0)) * 4.5);\n          float band = smoothstep(0.45, 0.92, ripple);\n          float vFade = smoothstep(0.0, 0.16, vUv.y) * smoothstep(1.0, 0.25, vUv.y);\n          float grazing = smoothstep(0.05, 0.55, max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0));\n          float alpha = band * vFade * grazing * uIntensity * 0.30;\n          if (alpha < 0.015) discard;\n          vec3 col = mix(uColorHeat, uColorCore * 0.92, band * 0.45);\n          gl_FragColor = vec4(col, alpha);\n        }\n      ",
		accentStreakVert: "\n        attribute float aAlpha;\n        attribute vec3 aColor;\n        varying float vAlpha;\n        varying vec3 vColor;\n        void main() {\n          vAlpha = aAlpha;\n          vColor = aColor;\n          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);\n          gl_Position = projectionMatrix * viewMatrix * wp;\n        }\n      ",
		accentStreakFrag: "\n        varying float vAlpha;\n        varying vec3 vColor;\n        void main() {\n          if (vAlpha < 0.01) discard;\n          gl_FragColor = vec4(vColor * vAlpha, vAlpha);\n        }\n      "
	};
	var MeteorStrikeVFX = class {
		constructor(scene, options = {}) {
			this.scene = scene;
			this.root = new three.Group();
			this.root.name = "MeteorStrikeVFX_Root";
			this.duration = METEOR_STRIKE.duration;
			this.impactTime = METEOR_STRIKE.impactTime;
			this.time = 0;
			this.playing = true;
			this.loop = true;
			this.speed = 1;
			this.startPos = options.startPos ? options.startPos.clone() : new three.Vector3(-15, 34, -11);
			this.targetPos = options.targetPos ? options.targetPos.clone() : new three.Vector3(0, 0, 0);
			this.flightDir = new three.Vector3().subVectors(this.targetPos, this.startPos).normalize();
			this._mat4 = new three.Matrix4();
			this._pos = new three.Vector3();
			this._quat = new three.Quaternion();
			this._scale = new three.Vector3();
			this._euler = new three.Euler();
			this._up = new three.Vector3(0, 1, 0);
			this._dir = new three.Vector3();
			this._zeroMat = new three.Matrix4().makeScale(0, 0, 0);
			this._geometries = [];
			this._materials = [];
			this._textures = acquireMeteorTextures();
			this.uColors = {
				core: { value: new three.Color(16774340) },
				bright: { value: new three.Color(16751150) },
				mid: { value: new three.Color(15088418) },
				ink: { value: new three.Color(2626342) },
				rock: { value: new three.Color(3813947) },
				smokeMid: { value: new three.Color(5982814) },
				smokeDark: { value: new three.Color(2497836) },
				dustLight: { value: new three.Color(11967620) },
				dustDark: { value: new three.Color(5390906) },
				airWhite: { value: new three.Color(16054271) },
				airShadow: { value: new three.Color(8952251) },
				heatHaze: { value: new three.Color(16757852) }
			};
			this.envDarkness = 0;
			try {
				this._buildStage1Targeting();
				this._buildStage2Meteor();
				this._buildStage3ExplosionMeshes();
				this._buildStage5CraterAndHeat();
				this._buildInstancedSystems();
				this.seek(0);
				this.scene.add(this.root);
			} catch (error) {
				this.dispose();
				throw error;
			}
		}
		_trackGeo(g) {
			this._geometries.push(g);
			return g;
		}
		_trackMat(m) {
			this._materials.push(m);
			return m;
		}
		_buildStage1Targeting() {
			const runeTex = this._textures.rune;
			const outerGeo = this._trackGeo(new three.CircleGeometry(10.8, 72));
			outerGeo.rotateX(-Math.PI / 2);
			this.runeOuterMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.runeVert,
				fragmentShader: VFX_SHADERS.runeFrag,
				uniforms: {
					uMap: { value: runeTex },
					uTime: { value: 0 },
					uOpacity: { value: 0 },
					uPulse: { value: 0 },
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorCore: this.uColors.core
				},
				transparent: true,
				depthWrite: false,
				blending: three.NormalBlending,
				side: three.FrontSide
			}));
			this.runeOuterMesh = new three.Mesh(outerGeo, this.runeOuterMat);
			this.runeOuterMesh.position.y = .045;
			this.runeOuterMesh.renderOrder = 2;
			this.root.add(this.runeOuterMesh);
			const innerGeo = this._trackGeo(new three.CircleGeometry(6.2, 64));
			innerGeo.rotateX(-Math.PI / 2);
			this.runeInnerMat = this._trackMat(this.runeOuterMat.clone());
			this.runeInnerMat.uniforms = {
				uMap: { value: runeTex },
				uTime: { value: 0 },
				uOpacity: { value: 0 },
				uPulse: { value: 0 },
				uColorBright: this.uColors.bright,
				uColorMid: this.uColors.mid,
				uColorCore: this.uColors.core
			};
			this.runeInnerMesh = new three.Mesh(innerGeo, this.runeInnerMat);
			this.runeInnerMesh.position.y = .06;
			this.runeInnerMesh.renderOrder = 3;
			this.root.add(this.runeInnerMesh);
		}
		_buildStage2Meteor() {
			this.meteorGroup = new three.Group();
			this.root.add(this.meteorGroup);
			const rockGeo = this._trackGeo(createHeroMeteorGeometry(2.15));
			this.meteorMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.meteorVert,
				fragmentShader: VFX_SHADERS.meteorFrag,
				uniforms: {
					uTime: { value: 0 },
					uFlightDir: { value: this.flightDir.clone() },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorRock: this.uColors.rock,
					uColorInk: this.uColors.ink
				},
				side: three.FrontSide
			}));
			this.meteorCoreMesh = new three.Mesh(rockGeo, this.meteorMat);
			this.meteorGroup.add(this.meteorCoreMesh);
			this.meteorOutlineMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.meteorOutlineVert,
				fragmentShader: VFX_SHADERS.meteorOutlineFrag,
				uniforms: {
					uOutlineWidth: { value: .085 },
					uFlightDir: { value: this.flightDir.clone() },
					uColorInk: this.uColors.ink,
					uColorMid: this.uColors.mid
				},
				side: three.BackSide,
				depthWrite: true
			}));
			this.meteorOutlineMesh = new three.Mesh(rockGeo, this.meteorOutlineMat);
			this.meteorCoreMesh.add(this.meteorOutlineMesh);
			this.meteorAeroGroup = new three.Group();
			this.meteorAeroGroup.quaternion.setFromUnitVectors(this._up, this.flightDir);
			this.meteorGroup.add(this.meteorAeroGroup);
			const bowGeo = this._trackGeo(createBowShockGeometry());
			this.bowShockMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.bowShockVert,
				fragmentShader: VFX_SHADERS.bowShockFrag,
				uniforms: {
					uTime: { value: 0 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.bowShockMesh = new three.Mesh(bowGeo, this.bowShockMat);
			this.meteorAeroGroup.add(this.bowShockMesh);
			const coneGeo = this._trackGeo(createMachConeGeometry(2.25, 14.2));
			this.machConeMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.machConeVert,
				fragmentShader: VFX_SHADERS.machConeFrag,
				uniforms: {
					uTime: { value: 0 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.machConeMesh = new three.Mesh(coneGeo, this.machConeMat);
			this.meteorAeroGroup.add(this.machConeMesh);
			const ribbonGeo = this._trackGeo(createFireRibbonGeometry(2.45, 15.8));
			this.fireRibbonMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.fireRibbonVert,
				fragmentShader: VFX_SHADERS.fireRibbonFrag,
				uniforms: {
					uTime: { value: 0 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.fireRibbonMesh = new three.Mesh(ribbonGeo, this.fireRibbonMat);
			this.meteorAeroGroup.add(this.fireRibbonMesh);
			this.meteorShardCount = 7;
			const shardGeo = this._trackGeo(createJaggedRockGeometry(.36, 1, 888, .36));
			const shardHeat = new Float32Array(this.meteorShardCount);
			shardHeat.fill(.9);
			shardGeo.setAttribute("aHeat", new three.InstancedBufferAttribute(shardHeat, 1));
			this.meteorShardMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.rockInstVert,
				fragmentShader: VFX_SHADERS.rockInstFrag,
				uniforms: {
					uColorRock: this.uColors.rock,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				side: three.FrontSide
			}));
			this.meteorShardsInstanced = new three.InstancedMesh(shardGeo, this.meteorShardMat, this.meteorShardCount);
			this.meteorShardsInstanced.frustumCulled = false;
			this.meteorAeroGroup.add(this.meteorShardsInstanced);
			const shardRand = createMulberry32(60123);
			this.meteorShardSeeds = [];
			for (let i = 0; i < this.meteorShardCount; i++) this.meteorShardSeeds.push({
				ang: i / this.meteorShardCount * Math.PI * 2 + (shardRand() - .5) * .4,
				rad: 2.35 + shardRand() * 1.45,
				yOff: -1.45 - shardRand() * 4.8,
				scale: .55 + shardRand() * .85,
				orbitSpeed: (shardRand() > .5 ? 1 : -1) * (1.8 + shardRand() * 2.4),
				spinX: (shardRand() - .5) * 8,
				spinY: (shardRand() - .5) * 8,
				spinZ: (shardRand() - .5) * 8
			});
		}
		_buildStage3ExplosionMeshes() {
			this.blastGroup = new three.Group();
			this.root.add(this.blastGroup);
			const domeGeo = this._trackGeo(new three.SphereGeometry(1, 36, 22, 0, Math.PI * 2, 0, Math.PI * .54));
			this.plasmaDomeMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.plasmaDomeVert,
				fragmentShader: VFX_SHADERS.plasmaDomeFrag,
				uniforms: {
					uTime: { value: 0 },
					uDissolve: { value: 0 },
					uPeak: { value: 1 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.plasmaDomeMesh = new three.Mesh(domeGeo, this.plasmaDomeMat);
			this.plasmaDomeMesh.renderOrder = 6;
			this.blastGroup.add(this.plasmaDomeMesh);
			const pillarGeo = this._trackGeo(new three.CylinderGeometry(2.7, 1.45, 34, 32, 10, true));
			pillarGeo.translate(0, 17, 0);
			this.skyPillarMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.skyPillarVert,
				fragmentShader: VFX_SHADERS.skyPillarFrag,
				uniforms: {
					uTime: { value: 0 },
					uDissolve: { value: 0 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.skyPillarMesh = new three.Mesh(pillarGeo, this.skyPillarMat);
			this.skyPillarMesh.renderOrder = 5;
			this.blastGroup.add(this.skyPillarMesh);
			const swOuterGeo = this._trackGeo(new three.CircleGeometry(21, 96));
			swOuterGeo.rotateX(-Math.PI / 2);
			this.shockOuterMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.shockwaveVert,
				fragmentShader: VFX_SHADERS.shockwaveFrag,
				uniforms: {
					uTime: { value: 0 },
					uProgress: { value: 0 },
					uThickness: { value: .11 },
					uOpacity: { value: 0 },
					uColorA: this.uColors.core,
					uColorB: this.uColors.bright,
					uColorInk: this.uColors.ink
				},
				transparent: true,
				depthWrite: false,
				blending: three.NormalBlending,
				side: three.FrontSide
			}));
			this.shockOuterMesh = new three.Mesh(swOuterGeo, this.shockOuterMat);
			this.shockOuterMesh.position.y = .075;
			this.shockOuterMesh.renderOrder = 4;
			this.blastGroup.add(this.shockOuterMesh);
			const swInnerGeo = this._trackGeo(new three.CircleGeometry(14.5, 80));
			swInnerGeo.rotateX(-Math.PI / 2);
			this.shockInnerMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.shockwaveVert,
				fragmentShader: VFX_SHADERS.shockwaveFrag,
				uniforms: {
					uTime: { value: 0 },
					uProgress: { value: 0 },
					uThickness: { value: .07 },
					uOpacity: { value: 0 },
					uColorA: this.uColors.core,
					uColorB: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.FrontSide
			}));
			this.shockInnerMesh = new three.Mesh(swInnerGeo, this.shockInnerMat);
			this.shockInnerMesh.position.y = .095;
			this.shockInnerMesh.renderOrder = 5;
			this.blastGroup.add(this.shockInnerMesh);
			const collarGeo = this._trackGeo(new three.TorusGeometry(1, .14, 16, 64));
			collarGeo.rotateX(Math.PI / 2);
			this.machCollarMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.machCollarVert,
				fragmentShader: VFX_SHADERS.machCollarFrag,
				uniforms: {
					uTime: { value: 0 },
					uDissolve: { value: 0 },
					uColorAirWhite: this.uColors.airWhite,
					uColorAirShadow: this.uColors.airShadow,
					uColorBright: this.uColors.bright,
					uColorInk: this.uColors.ink
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.machCollarMesh = new three.Mesh(collarGeo, this.machCollarMat);
			this.machCollarMesh.position.y = .16;
			this.machCollarMesh.renderOrder = 6;
			this.blastGroup.add(this.machCollarMesh);
		}
		_buildStage5CraterAndHeat() {
			const craterTex = this._textures.crater;
			const craterGeo = this._trackGeo(new three.CircleGeometry(12.8, 96));
			craterGeo.rotateX(-Math.PI / 2);
			this.craterMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.craterVert,
				fragmentShader: VFX_SHADERS.craterFrag,
				uniforms: {
					uCraterMap: { value: craterTex },
					uTime: { value: 0 },
					uHeat: { value: 1 },
					uAppear: { value: 1 },
					uDissolve: { value: 0 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorRock: this.uColors.rock,
					uColorInk: this.uColors.ink
				},
				transparent: true,
				depthWrite: false,
				blending: three.NormalBlending,
				side: three.FrontSide
			}));
			this.craterMesh = new three.Mesh(craterGeo, this.craterMat);
			this.craterMesh.position.y = .025;
			this.craterMesh.renderOrder = 1;
			this.root.add(this.craterMesh);
			const hazeGeo = this._trackGeo(createHeatHazeShellsGeometry());
			this.heatHazeMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.heatHazeVert,
				fragmentShader: VFX_SHADERS.heatHazeFrag,
				uniforms: {
					uTime: { value: 0 },
					uIntensity: { value: 0 },
					uColorHeat: this.uColors.heatHaze,
					uColorCore: this.uColors.core
				},
				transparent: true,
				depthWrite: false,
				blending: three.NormalBlending,
				side: three.FrontSide
			}));
			this.heatHazeMesh = new three.Mesh(hazeGeo, this.heatHazeMat);
			this.heatHazeMesh.renderOrder = 7;
			this.root.add(this.heatHazeMesh);
		}
		_buildInstancedSystems() {
			const rand = createMulberry32(772026);
			this.cloudCount = 192;
			const cloudGeo = this._trackGeo(createSmoothCloudGeometry(1, 3, 314, .14));
			this.cloudParamsArray = new Float32Array(this.cloudCount * 4);
			this.cloudParamsAttr = new three.InstancedBufferAttribute(this.cloudParamsArray, 4);
			cloudGeo.setAttribute("aCloudParams", this.cloudParamsAttr);
			this.toonCloudMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.toonCloudVert,
				fragmentShader: VFX_SHADERS.toonCloudFrag,
				uniforms: {
					uTime: { value: 0 },
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink,
					uColorSmokeMid: this.uColors.smokeMid,
					uColorSmokeDark: this.uColors.smokeDark,
					uColorDustLight: this.uColors.dustLight,
					uColorDustDark: this.uColors.dustDark
				},
				transparent: false,
				depthWrite: true,
				blending: three.NormalBlending,
				side: three.DoubleSide
			}));
			this.cloudInstanced = new three.InstancedMesh(cloudGeo, this.toonCloudMat, this.cloudCount);
			this.cloudInstanced.frustumCulled = false;
			this.root.add(this.cloudInstanced);
			this.trailSeeds = [];
			for (let i = 0; i < 30; i++) this.trailSeeds.push({
				u: i / 30,
				ang: rand() * Math.PI * 2,
				radial: .4 + rand() * 1.4,
				baseScale: .75 + rand() * 1.15,
				seed: rand() * 20,
				rotSpeed: (rand() - .5) * 3.5
			});
			this.ringSmokeSeeds = [];
			for (let i = 0; i < 46; i++) {
				const ang = i / 46 * Math.PI * 2 + (rand() - .5) * .14;
				this.ringSmokeSeeds.push({
					ang,
					speed: 8.5 + rand() * 6.5,
					baseScale: 1.45 + rand() * 1.65,
					lift: .8 + rand() * 2.4,
					delay: rand() * .1,
					seed: rand() * 30
				});
			}
			this.mushroomSeeds = [];
			for (let i = 0; i < 52; i++) {
				const isCap = i >= 18;
				this.mushroomSeeds.push({
					isCap,
					ang: rand() * Math.PI * 2,
					capRadius: isCap ? 1.8 + rand() * 5.8 : .5 + rand() * 1.8,
					heightTarget: isCap ? 9.5 + rand() * 6.2 : 1.5 + i / 18 * 9,
					baseScale: isCap ? 1.9 + rand() * 2.1 : 1.35 + rand() * 1.1,
					delay: isCap ? .04 + rand() * .18 : rand() * .14,
					seed: rand() * 40
				});
			}
			this.residualSmokeSeeds = [];
			for (let i = 0; i < 28; i++) {
				const ang = rand() * Math.PI * 2;
				const r = 1 + rand() * 8.2;
				this.residualSmokeSeeds.push({
					x: Math.cos(ang) * r,
					z: Math.sin(ang) * r,
					phase: rand(),
					speed: 1.2 + rand() * 1.4,
					driftX: (rand() - .5) * 1.4,
					driftZ: (rand() - .5) * 1.4,
					baseScale: .75 + rand() * 1.05,
					seed: rand() * 50
				});
			}
			this.slabCount = 28;
			const slabGeo = this._trackGeo(createUpturnedSlabGeometry());
			this.slabHeatArray = new Float32Array(this.slabCount);
			this.slabHeatAttr = new three.InstancedBufferAttribute(this.slabHeatArray, 1);
			slabGeo.setAttribute("aHeat", this.slabHeatAttr);
			this.rockInstMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.rockInstVert,
				fragmentShader: VFX_SHADERS.rockInstFrag,
				uniforms: {
					uColorRock: this.uColors.rock,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				side: three.FrontSide
			}));
			this.slabInstanced = new three.InstancedMesh(slabGeo, this.rockInstMat, this.slabCount);
			this.slabInstanced.frustumCulled = false;
			this.root.add(this.slabInstanced);
			this.slabSeeds = [];
			for (let i = 0; i < this.slabCount; i++) {
				const ang = i / this.slabCount * Math.PI * 2 + (rand() - .5) * .14;
				this.slabSeeds.push({
					ang,
					radius: 7.4 + rand() * 2.5,
					sx: .9 + rand() * .9,
					sy: .85 + rand() * 1.15,
					sz: .8 + rand() * .8,
					tilt: .42 + rand() * .42,
					delay: rand() * .09
				});
			}
			const firstSlabTime = this.impactTime + Math.min(...this.slabSeeds.map((slab) => slab.delay));
			this.rotationSwitchTime = (Math.floor(firstSlabTime * REFERENCE_FPS) + 2) / REFERENCE_FPS;
			this.debrisCount = 36;
			const debrisGeo = this._trackGeo(createJaggedRockGeometry(.45, 1, 555, .34));
			this.debrisHeatArray = new Float32Array(this.debrisCount);
			this.debrisHeatAttr = new three.InstancedBufferAttribute(this.debrisHeatArray, 1);
			debrisGeo.setAttribute("aHeat", this.debrisHeatAttr);
			this.debrisInstanced = new three.InstancedMesh(debrisGeo, this.rockInstMat, this.debrisCount);
			this.debrisInstanced.frustumCulled = false;
			this.root.add(this.debrisInstanced);
			this.debrisSeeds = [];
			for (let i = 0; i < this.debrisCount; i++) {
				const ang = rand() * Math.PI * 2;
				const rSpeed = 6.5 + rand() * 11.5;
				const vY = 12 + rand() * 12.5;
				const g = 24.5;
				const tLand = 2 * vY / g;
				this.debrisSeeds.push({
					ang,
					r0: 1 + rand() * 2.8,
					rSpeed,
					vY,
					g,
					tLand,
					delay: rand() * .08,
					scale: .45 + rand() * 1.1,
					spinX: (rand() - .5) * 14,
					spinY: (rand() - .5) * 14,
					spinZ: (rand() - .5) * 14,
					dustScale: .85 + rand() * .85,
					seed: rand() * 80
				});
			}
			this.starCount = 18;
			const starGeo = this._trackGeo(createAnime4PointStarGeometry());
			this.starFlashArray = new Float32Array(this.starCount);
			this.starFlashAttr = new three.InstancedBufferAttribute(this.starFlashArray, 1);
			starGeo.setAttribute("aFlash", this.starFlashAttr);
			this.starSpikeMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.starSpikeVert,
				fragmentShader: VFX_SHADERS.starSpikeFrag,
				uniforms: {
					uColorCore: this.uColors.core,
					uColorBright: this.uColors.bright,
					uColorMid: this.uColors.mid,
					uColorInk: this.uColors.ink
				},
				side: three.FrontSide
			}));
			this.starInstanced = new three.InstancedMesh(starGeo, this.starSpikeMat, this.starCount);
			this.starInstanced.frustumCulled = false;
			this.root.add(this.starInstanced);
			this.starSeeds = [];
			for (let i = 0; i < this.starCount; i++) {
				const ang = i / this.starCount * Math.PI * 2 + (rand() - .5) * .25;
				this.starSeeds.push({
					ang,
					rStart: 2 + rand() * 3.5,
					rEnd: 7.5 + rand() * 9.5,
					yStart: 1 + rand() * 3,
					yEnd: 3.5 + rand() * 9.5,
					delay: rand() * .14,
					life: .26 + rand() * .22,
					scale: .75 + rand() * 1.25,
					rotZ: (rand() - .5) * .8
				});
			}
			this.spikeCount = 24;
			const spikeGeo = this._trackGeo(createBurstSpikeGeometry());
			this.spikeFlashArray = new Float32Array(this.spikeCount);
			this.spikeFlashAttr = new three.InstancedBufferAttribute(this.spikeFlashArray, 1);
			spikeGeo.setAttribute("aFlash", this.spikeFlashAttr);
			this.spikeInstanced = new three.InstancedMesh(spikeGeo, this.starSpikeMat, this.spikeCount);
			this.spikeInstanced.frustumCulled = false;
			this.root.add(this.spikeInstanced);
			this.spikeSeeds = [];
			for (let i = 0; i < this.spikeCount; i++) {
				const az = i / this.spikeCount * Math.PI * 2 + (rand() - .5) * .2;
				const elev = .22 + rand() * .92;
				const dir = new three.Vector3(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev)).normalize();
				this.spikeSeeds.push({
					dir,
					maxLen: 2.2 + rand() * 2.4,
					width: .65 + rand() * .85,
					delay: rand() * .07,
					life: .34 + rand() * .2
				});
			}
			this.accentCount = 178;
			const streakGeo = this._trackGeo(new three.BoxGeometry(.08, 1, .08));
			this.accentAlphaArray = new Float32Array(this.accentCount);
			this.accentColorArray = new Float32Array(this.accentCount * 3);
			this.accentAlphaAttr = new three.InstancedBufferAttribute(this.accentAlphaArray, 1);
			this.accentColorAttr = new three.InstancedBufferAttribute(this.accentColorArray, 3);
			streakGeo.setAttribute("aAlpha", this.accentAlphaAttr);
			streakGeo.setAttribute("aColor", this.accentColorAttr);
			this.accentMat = this._trackMat(new three.ShaderMaterial({
				vertexShader: VFX_SHADERS.accentStreakVert,
				fragmentShader: VFX_SHADERS.accentStreakFrag,
				transparent: true,
				depthWrite: false,
				blending: three.AdditiveBlending,
				side: three.FrontSide
			}));
			this.accentInstanced = new three.InstancedMesh(streakGeo, this.accentMat, this.accentCount);
			this.accentInstanced.frustumCulled = false;
			this.root.add(this.accentInstanced);
			this.suctionSeeds = [];
			for (let i = 0; i < 48; i++) {
				const az = rand() * Math.PI * 2;
				const elev = .05 + rand() * .65;
				this.suctionSeeds.push({
					dir: new three.Vector3(Math.cos(az) * Math.cos(elev), Math.sin(elev), Math.sin(az) * Math.cos(elev)).normalize(),
					dist: 9 + rand() * 9,
					phase: rand(),
					len: 1.4 + rand() * 2.2
				});
			}
			this.speedLineSeeds = [];
			for (let i = 0; i < 40; i++) this.speedLineSeeds.push({
				ang: rand() * Math.PI * 2,
				rad: 1.4 + rand() * 3.4,
				offset: (rand() - .5) * 14,
				len: 2.2 + rand() * 4,
				speed: 1.2 + rand() * .8
			});
			this.emberSeeds = [];
			for (let i = 0; i < 90; i++) {
				const ang = rand() * Math.PI * 2;
				this.emberSeeds.push({
					ang,
					r0: .6 + rand() * 8.8,
					riseSpeed: 2 + rand() * 4.2,
					swirl: (rand() - .5) * 2.6,
					phase: rand(),
					size: .14 + rand() * .24,
					isHot: rand() > .35
				});
			}
		}
		play() {
			this.playing = true;
		}
		pause() {
			this.playing = false;
		}
		replay() {
			this.time = 0;
			this.playing = true;
			this._evaluate();
		}
		seek(t) {
			this.time = Math.max(0, Math.min(this.duration, t));
			this._evaluate();
		}
		update(dt) {
			if (this.playing) {
				this.time += dt * this.speed;
				if (this.time >= this.duration) {
					if (this.loop) this.time %= this.duration;
					else {
						this.time = this.duration;
						this.playing = false;
					}
				}
			}
			this._evaluate();
		}
		getStageInfo() {
			const t = this.time;
			if (t < .85) return {
				id: 1,
				label: "① 預告鎖定與高空墜落"
			};
			if (t < 1) return {
				id: 2,
				label: "② 撞擊前內吸蓄力"
			};
			if (t < 1.45) return {
				id: 3,
				label: "③ 瞬間引爆與碎岩沖天"
			};
			if (t < 2.85) return {
				id: 4,
				label: "④ 3D 塑形蕈狀雲煙"
			};
			if (t < 3.55) return {
				id: 5,
				label: "⑤ 細裂焦坑與熱浪餘燼"
			};
			return {
				id: 6,
				label: "⑥ 火山裂紋紋理消散"
			};
		}
		_setCloudInstance(idx, x, y, z, rx, ry, rz, sx, sy, sz, heat, dissolve, seed, mode) {
			this._pos.set(x, y, z);
			this._euler.set(rx, ry, rz);
			this._quat.setFromEuler(this._euler);
			this._scale.set(sx, sy, sz);
			this._mat4.compose(this._pos, this._quat, this._scale);
			this.cloudInstanced.setMatrixAt(idx, this._mat4);
			const o = idx * 4;
			this.cloudParamsArray[o] = heat;
			this.cloudParamsArray[o + 1] = dissolve;
			this.cloudParamsArray[o + 2] = seed;
			this.cloudParamsArray[o + 3] = mode;
		}
		_hideCloudInstance(idx) {
			this.cloudInstanced.setMatrixAt(idx, this._zeroMat);
			this.cloudParamsArray[idx * 4 + 1] = 1;
		}
		_setAccentInstance(idx, pos, dir, width, length, alpha, r, g, b) {
			if (alpha <= .01) {
				this.accentInstanced.setMatrixAt(idx, this._zeroMat);
				this.accentAlphaArray[idx] = 0;
				return;
			}
			this._quat.setFromUnitVectors(this._up, dir);
			this._scale.set(width, length, width);
			this._mat4.compose(pos, this._quat, this._scale);
			this.accentInstanced.setMatrixAt(idx, this._mat4);
			this.accentAlphaArray[idx] = alpha;
			const c = idx * 3;
			this.accentColorArray[c] = r;
			this.accentColorArray[c + 1] = g;
			this.accentColorArray[c + 2] = b;
		}
		_evaluate() {
			const t = this.time;
			const impact = this.impactTime;
			const post = t - impact;
			this._euler.order = t >= this.rotationSwitchTime ? "YXZ" : "XYZ";
			if (t >= .8 && t < impact) {
				const u = (t - .8) / .2;
				this.envDarkness = Math.pow(u, 1.8) * .56;
			} else if (post >= 0 && post < .35) this.envDarkness = (1 - post / .35) * .42;
			else this.envDarkness = 0;
			const runeVisible = t < 1.08;
			this.runeOuterMesh.visible = runeVisible;
			this.runeInnerMesh.visible = runeVisible;
			if (runeVisible) {
				const appear = Math.min(1, t / .22);
				const suction = t > .84 ? Math.min(1, (t - .84) / .16) : 0;
				const collapse = 1 - suction * .76;
				const fadeOut = t > 1 ? Math.max(0, 1 - (t - 1) / .08) : 1;
				const sOuter = (.45 + .55 * (1 - Math.pow(1 - appear, 3))) * collapse;
				const sInner = (.35 + .65 * appear) * (1 - suction * .82);
				this.runeOuterMesh.scale.setScalar(Math.max(.001, sOuter));
				this.runeOuterMesh.rotation.y = t * (.9 + suction * 4.5);
				this.runeOuterMat.uniforms.uTime.value = t;
				this.runeOuterMat.uniforms.uOpacity.value = appear * fadeOut * .92;
				this.runeOuterMat.uniforms.uPulse.value = suction;
				this.runeInnerMesh.scale.setScalar(Math.max(.001, sInner));
				this.runeInnerMesh.rotation.y = -t * (1.6 + suction * 6);
				this.runeInnerMat.uniforms.uTime.value = t;
				this.runeInnerMat.uniforms.uOpacity.value = appear * fadeOut * .96;
				this.runeInnerMat.uniforms.uPulse.value = suction;
			}
			const meteorActive = t < 1.015;
			this.meteorGroup.visible = meteorActive;
			if (meteorActive) {
				const u = Math.min(1, t / impact);
				const prog = Math.pow(u, 2.05);
				this.meteorGroup.position.lerpVectors(this.startPos, this.targetPos, prog);
				const entryScale = Math.min(1, t / .14);
				this.meteorGroup.scale.setScalar(Math.max(.001, entryScale));
				this.meteorCoreMesh.rotation.set(t * 1.85, t * 2.45, t * 1.35);
				this.meteorMat.uniforms.uTime.value = t;
				this.bowShockMat.uniforms.uTime.value = t;
				this.bowShockMesh.rotation.y = -t * 3.8;
				const bowPulse = 1 + Math.sin(t * 42) * .025;
				this.bowShockMesh.scale.set(bowPulse, 1, bowPulse);
				this.machConeMat.uniforms.uTime.value = t;
				this.machConeMesh.rotation.y = t * 2.6;
				this.fireRibbonMat.uniforms.uTime.value = t;
				this.fireRibbonMesh.rotation.y = -t * 7.2;
				for (let i = 0; i < this.meteorShardCount; i++) {
					const sh = this.meteorShardSeeds[i];
					const ang = sh.ang + t * sh.orbitSpeed;
					const driftBack = Math.sin(t * 7 + i * 1.7) * .35;
					this._pos.set(Math.cos(ang) * sh.rad, sh.yOff + driftBack, Math.sin(ang) * sh.rad);
					this._euler.set(t * sh.spinX, t * sh.spinY, t * sh.spinZ);
					this._quat.setFromEuler(this._euler);
					this._scale.setScalar(sh.scale);
					this._mat4.compose(this._pos, this._quat, this._scale);
					this.meteorShardsInstanced.setMatrixAt(i, this._mat4);
				}
				this.meteorShardsInstanced.instanceMatrix.needsUpdate = true;
			}
			this.blastGroup.visible = post >= 0 && post < 1.55;
			if (this.blastGroup.visible) {
				const domeLife = post / .68;
				this.plasmaDomeMesh.visible = domeLife < 1;
				if (this.plasmaDomeMesh.visible) {
					const easeOut = 1 - Math.pow(1 - Math.min(1, domeLife * 1.45), 3);
					const r = 1.6 + easeOut * 8.6;
					const h = (1.4 + easeOut * 6.8) * (1 - Math.max(0, domeLife - .55) * .35);
					this.plasmaDomeMesh.scale.set(r, h, r);
					this.plasmaDomeMat.uniforms.uTime.value = t;
					this.plasmaDomeMat.uniforms.uDissolve.value = Math.max(0, (domeLife - .25) / .75);
					this.plasmaDomeMat.uniforms.uPeak.value = Math.max(0, 1 - domeLife * 2.2);
				}
				const pillarLife = post / .56;
				this.skyPillarMesh.visible = pillarLife < 1;
				if (this.skyPillarMesh.visible) {
					const w = Math.sin(Math.min(1, pillarLife) * Math.PI * .55) * 1.65 * (1 - pillarLife * .45);
					const h = .35 + Math.min(1, pillarLife * 3.2) * .95;
					this.skyPillarMesh.scale.set(Math.max(.05, w), h, Math.max(.05, w));
					this.skyPillarMesh.rotation.y = post * 3.2;
					this.skyPillarMat.uniforms.uTime.value = t;
					this.skyPillarMat.uniforms.uDissolve.value = Math.max(0, (pillarLife - .2) / .8);
				}
				const sw1 = post / .78;
				this.shockOuterMesh.visible = sw1 < 1;
				if (this.shockOuterMesh.visible) {
					const p1 = 1 - Math.pow(1 - sw1, 3);
					this.shockOuterMat.uniforms.uTime.value = t;
					this.shockOuterMat.uniforms.uProgress.value = p1;
					this.shockOuterMat.uniforms.uOpacity.value = Math.pow(1 - sw1, 1.35) * .92;
				}
				const sw2 = (post - .04) / .58;
				this.shockInnerMesh.visible = sw2 > 0 && sw2 < 1;
				if (this.shockInnerMesh.visible) {
					const p2 = 1 - Math.pow(1 - sw2, 2.6);
					this.shockInnerMat.uniforms.uTime.value = t;
					this.shockInnerMat.uniforms.uProgress.value = p2;
					this.shockInnerMat.uniforms.uOpacity.value = Math.pow(1 - sw2, 1.5) * .62;
				}
				const colLife = post / .82;
				this.machCollarMesh.visible = colLife < 1;
				if (this.machCollarMesh.visible) {
					const rad = 2.4 + (1 - Math.pow(1 - colLife, 3.2)) * 17.5;
					const thicknessY = Math.max(.15, (1 - colLife * .65) * 1.45);
					this.machCollarMesh.scale.set(rad, thicknessY, rad);
					this.machCollarMesh.rotation.y = post * 1.1;
					this.machCollarMat.uniforms.uTime.value = t;
					this.machCollarMat.uniforms.uDissolve.value = Math.max(0, (colLife - .28) / .72) * .95;
				}
			}
			if (post >= 0) {
				const cooling = Math.exp(-post * .55);
				const craterDissolve = t > 3.55 ? Math.min(1, (t - 3.55) / 1.25) : 0;
				this.craterMesh.visible = craterDissolve < .995;
				const appear = Math.min(1, post / .16);
				this.craterMesh.scale.setScalar(Math.max(.001, .58 + .42 * (1 - Math.pow(1 - appear, 3))));
				this.craterMat.uniforms.uTime.value = t;
				this.craterMat.uniforms.uHeat.value = cooling;
				this.craterMat.uniforms.uAppear.value = appear;
				this.craterMat.uniforms.uDissolve.value = craterDissolve;
				const hazeInt = Math.min(1, Math.max(0, (post - .35) / .45)) * (t > 3.85 ? Math.max(0, 1 - (t - 3.85) / .9) : 1) * (.45 + cooling * .55);
				this.heatHazeMesh.visible = hazeInt > .01;
				this.heatHazeMat.uniforms.uTime.value = t;
				this.heatHazeMat.uniforms.uIntensity.value = hazeInt;
			} else {
				this.craterMesh.visible = false;
				this.heatHazeMesh.visible = false;
			}
			this.toonCloudMat.uniforms.uTime.value = t;
			for (let i = 0; i < 30; i++) {
				const s = this.trailSeeds[i];
				if (t < 1.48) {
					const meteorProg = Math.min(1, t / impact);
					const emitProg = s.u * .96;
					if (meteorProg >= emitProg) {
						const age = t - Math.pow(emitProg, 1 / 2.05) * impact;
						const maxAge = .56;
						if (age >= 0 && age < maxAge) {
							const life = age / maxAge;
							const p0 = this._pos.lerpVectors(this.startPos, this.targetPos, emitProg);
							const driftR = s.radial * (.6 + life * 1.4);
							const x = p0.x + Math.cos(s.ang + age * 2) * driftR;
							const y = p0.y + life * 1.6;
							const z = p0.z + Math.sin(s.ang + age * 2) * driftR;
							const sc = s.baseScale * (.55 + life * 1.15);
							const heat = Math.max(0, 1 - life * 1.35);
							const diss = Math.max(0, (life - .35) / .65) * .98;
							this._setCloudInstance(i, x, y, z, age * s.rotSpeed, s.ang, age * 1.4, sc, sc, sc, heat, diss, s.seed, 0);
						} else this._hideCloudInstance(i);
					} else this._hideCloudInstance(i);
				} else this._hideCloudInstance(i);
			}
			for (let i = 0; i < 46; i++) {
				const idx = 30 + i;
				const s = this.ringSmokeSeeds[i];
				const age = post - s.delay;
				const maxAge = 1.65;
				if (age > 0 && age < maxAge) {
					const life = age / maxAge;
					const ease = 1 - Math.pow(1 - life, 2.6);
					const r = 2.6 + ease * s.speed * 1.18;
					const y = .6 + Math.sin(Math.min(1, life * 1.4) * Math.PI * .62) * s.lift + life * .9;
					const sc = s.baseScale * (.42 + ease * 1.05);
					const heat = Math.max(0, 1 - life * 1.85);
					const diss = Math.max(0, (life - .38) / .62) * .98;
					this._setCloudInstance(idx, Math.cos(s.ang) * r, y, Math.sin(s.ang) * r, life * 2.2, s.ang, life * 1.5, sc * 1.15, sc * .85, sc * 1.15, heat, diss, s.seed, 0);
				} else this._hideCloudInstance(idx);
			}
			for (let i = 0; i < 52; i++) {
				const idx = 76 + i;
				const s = this.mushroomSeeds[i];
				const age = post - s.delay;
				const maxAge = 2.45;
				if (age > 0 && age < maxAge) {
					const life = age / maxAge;
					const rise = 1 - Math.pow(1 - life, 2.3);
					const r = s.isCap ? s.capRadius * (.28 + rise * 1.05) : s.capRadius * (.75 + life * .45);
					const y = .9 + rise * s.heightTarget;
					const sc = s.baseScale * (.38 + rise * .95);
					const heat = Math.max(0, (1 - life * 1.55) * (s.isCap ? .95 : 1));
					const diss = Math.max(0, (life - .42) / .58) * .98;
					this._setCloudInstance(idx, Math.cos(s.ang + life * .45) * r, y, Math.sin(s.ang + life * .45) * r, life * 1.6, s.ang, life * 1.2, sc, sc * (s.isCap ? .82 : 1.08), sc, heat, diss, s.seed, 0);
				} else this._hideCloudInstance(idx);
			}
			for (let i = 0; i < this.debrisCount; i++) {
				const idx = 128 + i;
				const d = this.debrisSeeds[i];
				const dustAge = post - (d.delay + d.tLand);
				const maxAge = .88;
				if (dustAge > 0 && dustAge < maxAge) {
					const life = dustAge / maxAge;
					const ease = 1 - Math.pow(1 - life, 2.4);
					const landR = d.r0 + d.rSpeed * d.tLand;
					const x = Math.cos(d.ang) * (landR + ease * 1.1);
					const z = Math.sin(d.ang) * (landR + ease * 1.1);
					const y = .25 + ease * 1.45;
					const sc = d.dustScale * (.35 + ease * 1.05);
					const diss = Math.max(0, (life - .28) / .72) * .98;
					this._setCloudInstance(idx, x, y, z, life * 2.5, d.ang, life * 1.8, sc * 1.2, sc * .78, sc * 1.2, .25, diss, d.seed, 1);
				} else this._hideCloudInstance(idx);
			}
			const resActive = post > .65 && t < 4.78;
			const resTail = t > 3.7 ? Math.min(1, (t - 3.7) / 1.05) : 0;
			for (let i = 0; i < 28; i++) {
				const idx = 164 + i;
				if (resActive) {
					const s = this.residualSmokeSeeds[i];
					const cyc = (post * .42 + s.phase) % 1;
					const y = .3 + cyc * 6.4;
					const x = s.x + s.driftX * cyc;
					const z = s.z + s.driftZ * cyc;
					const sc = s.baseScale * (.45 + Math.sin(cyc * Math.PI) * .85);
					const diss = Math.max(Math.max(0, (cyc - .55) / .45), resTail) * .98;
					if (diss < .96) this._setCloudInstance(idx, x, y, z, cyc * 2, s.seed, cyc * 1.4, sc, sc, sc, .12 * (1 - cyc), diss, s.seed, 0);
					else this._hideCloudInstance(idx);
				} else this._hideCloudInstance(idx);
			}
			this.cloudInstanced.instanceMatrix.needsUpdate = true;
			this.cloudParamsAttr.needsUpdate = true;
			const slabRetreat = t > 3.75 ? Math.min(1, (t - 3.75) / 1) : 0;
			const slabCooling = post >= 0 ? Math.exp(-post * .65) : 0;
			for (let i = 0; i < this.slabCount; i++) {
				const s = this.slabSeeds[i];
				const age = post - s.delay;
				if (age > 0 && slabRetreat < .99) {
					const pop = Math.min(1, age / .14);
					const overshoot = pop < 1 ? 1 + Math.sin(pop * Math.PI) * .24 : 1;
					const sink = slabRetreat * slabRetreat * 2.6;
					const scaleFade = 1 - slabRetreat * .82;
					const x = Math.cos(s.ang) * s.radius;
					const z = Math.sin(s.ang) * s.radius;
					const y = -.35 + pop * .35 - sink;
					this._pos.set(x, y, z);
					this._euler.set(0, -s.ang + Math.PI * .5, 0, "YXZ");
					this._euler.x = -s.tilt * pop;
					this._quat.setFromEuler(this._euler);
					this._scale.set(s.sx * scaleFade, s.sy * pop * overshoot * scaleFade, s.sz * scaleFade);
					this._mat4.compose(this._pos, this._quat, this._scale);
					this.slabInstanced.setMatrixAt(i, this._mat4);
					this.slabHeatArray[i] = slabCooling;
				} else {
					this.slabInstanced.setMatrixAt(i, this._zeroMat);
					this.slabHeatArray[i] = 0;
				}
			}
			this.slabInstanced.instanceMatrix.needsUpdate = true;
			this.slabHeatAttr.needsUpdate = true;
			for (let i = 0; i < this.debrisCount; i++) {
				const d = this.debrisSeeds[i];
				const age = post - d.delay;
				const totalLife = d.tLand + 1.15;
				if (age > 0 && age < totalLife) {
					let y, r, rotMul = 1;
					if (age < d.tLand) {
						const u = age / d.tLand;
						const apexSlow = 4 * u * (1 - u);
						const maxH = d.vY * d.vY / (2 * d.g);
						y = Math.max(.15, maxH * Math.pow(apexSlow, .86));
						r = d.r0 + d.rSpeed * age;
					} else {
						const bAge = age - d.tLand;
						const bDur = .55;
						if (bAge < bDur) {
							const bu = bAge / bDur;
							y = .16 + Math.sin(bu * Math.PI) * (d.vY * .14);
							r = d.r0 + d.rSpeed * d.tLand + d.rSpeed * .35 * bAge;
							rotMul = .55;
						} else {
							y = .16;
							r = d.r0 + d.rSpeed * d.tLand + d.rSpeed * .35 * bDur;
							rotMul = 0;
						}
					}
					const shrink = age > totalLife - .38 ? Math.max(.001, (totalLife - age) / .38) : 1;
					this._pos.set(Math.cos(d.ang) * r, y, Math.sin(d.ang) * r);
					this._euler.set(age * d.spinX * rotMul, age * d.spinY * rotMul, age * d.spinZ * rotMul);
					this._quat.setFromEuler(this._euler);
					this._scale.setScalar(d.scale * shrink);
					this._mat4.compose(this._pos, this._quat, this._scale);
					this.debrisInstanced.setMatrixAt(i, this._mat4);
					this.debrisHeatArray[i] = Math.max(0, 1 - age * .9);
				} else {
					this.debrisInstanced.setMatrixAt(i, this._zeroMat);
					this.debrisHeatArray[i] = 0;
				}
			}
			this.debrisInstanced.instanceMatrix.needsUpdate = true;
			this.debrisHeatAttr.needsUpdate = true;
			for (let i = 0; i < this.starCount; i++) {
				const s = this.starSeeds[i];
				const age = post - s.delay;
				if (age > 0 && age < s.life) {
					const u = age / s.life;
					const pop = Math.sin(u * Math.PI);
					const r = s.rStart + (s.rEnd - s.rStart) * (1 - Math.pow(1 - u, 2.4));
					const y = s.yStart + (s.yEnd - s.yStart) * (1 - Math.pow(1 - u, 2));
					this._pos.set(Math.cos(s.ang) * r, y, Math.sin(s.ang) * r);
					this._euler.set(0, -s.ang + Math.PI * .5, s.rotZ + u * .6);
					this._quat.setFromEuler(this._euler);
					const sc = s.scale * Math.pow(pop, .72);
					this._scale.setScalar(Math.max(.001, sc));
					this._mat4.compose(this._pos, this._quat, this._scale);
					this.starInstanced.setMatrixAt(i, this._mat4);
					this.starFlashArray[i] = pop;
				} else {
					this.starInstanced.setMatrixAt(i, this._zeroMat);
					this.starFlashArray[i] = 0;
				}
			}
			this.starInstanced.instanceMatrix.needsUpdate = true;
			this.starFlashAttr.needsUpdate = true;
			for (let i = 0; i < this.spikeCount; i++) {
				const s = this.spikeSeeds[i];
				const age = post - s.delay;
				if (age > 0 && age < s.life) {
					const u = age / s.life;
					const thrust = 1 - Math.pow(1 - u, 3);
					const fade = Math.max(.001, 1 - Math.pow(u, 1.8));
					this._pos.copy(s.dir).multiplyScalar(1.2 + thrust * 3.8);
					this._quat.setFromUnitVectors(this._up, s.dir);
					this._scale.set(s.width * fade, s.maxLen * (.4 + thrust * .9) * fade, s.width * fade);
					this._mat4.compose(this._pos, this._quat, this._scale);
					this.spikeInstanced.setMatrixAt(i, this._mat4);
					this.spikeFlashArray[i] = 1 - u;
				} else {
					this.spikeInstanced.setMatrixAt(i, this._zeroMat);
					this.spikeFlashArray[i] = 0;
				}
			}
			this.spikeInstanced.instanceMatrix.needsUpdate = true;
			this.spikeFlashAttr.needsUpdate = true;
			for (let i = 0; i < 48; i++) {
				const s = this.suctionSeeds[i];
				if (t >= .78 && t < impact) {
					const u = (t - .78) / .22;
					const prog = (u * 1.45 + s.phase) % 1;
					const dist = s.dist * (1 - prog);
					this._pos.copy(s.dir).multiplyScalar(dist);
					this._pos.y += .3;
					this._dir.copy(s.dir).negate();
					const alpha = Math.sin(prog * Math.PI) * u * .78;
					this._setAccentInstance(i, this._pos, this._dir, .55, s.len * (.6 + u * .9), alpha, 1, .78, .45);
				} else this._setAccentInstance(i, this._pos, this._up, 0, 0, 0, 0, 0, 0);
			}
			for (let i = 0; i < 40; i++) {
				const idx = 48 + i;
				const s = this.speedLineSeeds[i];
				if (t < impact) {
					const u = t / impact;
					const prog = Math.pow(u, 2.05);
					const center = this._pos.lerpVectors(this.startPos, this.targetPos, prog);
					const flow = (t * 5.2 * s.speed + s.offset) % 12 - 6;
					const sideA = Math.cos(s.ang) * s.rad;
					const sideB = Math.sin(s.ang) * s.rad;
					center.x += sideA - this.flightDir.x * flow;
					center.y += sideB * .4 - this.flightDir.y * flow;
					center.z += sideB - this.flightDir.z * flow;
					const alpha = Math.min(1, t / .15) * .52;
					this._setAccentInstance(idx, center, this.flightDir, .42, s.len, alpha, 1, .74, .36);
				} else this._setAccentInstance(idx, this._pos, this._up, 0, 0, 0, 0, 0, 0);
			}
			const emberTail = t > 4 ? Math.max(0, 1 - (t - 4) / .78) : 1;
			for (let i = 0; i < 90; i++) {
				const idx = 88 + i;
				const e = this.emberSeeds[i];
				if (post >= 0 && emberTail > .01) {
					const cyc = (post * .48 + e.phase) % 1;
					const ang = e.ang + cyc * e.swirl * 3;
					const rad = e.r0 * (.85 + cyc * .35);
					const y = .25 + cyc * e.riseSpeed * 3.2;
					this._pos.set(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
					this._dir.set(-Math.sin(ang) * .25, 1, Math.cos(ang) * .25).normalize();
					const alpha = Math.sin(cyc * Math.PI) * emberTail * .85;
					if (e.isHot) this._setAccentInstance(idx, this._pos, this._dir, e.size * 5, e.size * 2.2, alpha, 1, .85, .42);
					else this._setAccentInstance(idx, this._pos, this._dir, e.size * 4.5, e.size * 1.9, alpha, .98, .42, .16);
				} else this._setAccentInstance(idx, this._pos, this._up, 0, 0, 0, 0, 0, 0);
			}
			this.accentInstanced.instanceMatrix.needsUpdate = true;
			this.accentAlphaAttr.needsUpdate = true;
			this.accentColorAttr.needsUpdate = true;
		}
		dispose() {
			if (!this._textures) return;
			this.root.removeFromParent();
			this.root.traverse((o) => {
				if (o.isInstancedMesh) o.dispose();
			});
			this.root.clear();
			for (const g of this._geometries) g.dispose();
			for (const m of this._materials) m.dispose();
			releaseMeteorTextures();
			this._geometries.length = 0;
			this._materials.length = 0;
			this._textures = null;
		}
	};
	const option = (value) => typeof value === "number" && Number.isFinite(value) ? three.MathUtils.clamp(value, .25, 2) : 1;
	function normalizeMeteorStrikeOptions(options = {}) {
		return {
			size: option(options.size),
			speed: option(options.speed)
		};
	}
	function createMeteorStrikeEffect(spec, options = {}) {
		const group = new three.Group();
		group.name = spec.id;
		const { duration, maxParticles } = METEOR_STRIKE;
		const lifecycle = {
			start: .2,
			end: 2,
			...spec.lifecycle
		};
		let settings = normalizeMeteorStrikeOptions(options);
		let cast = null, elapsed = 0, disposed = false;
		group.scale.setScalar(settings.size);
		function seek(time) {
			if (disposed || !Number.isFinite(time)) return;
			const next = three.MathUtils.clamp(time, 0, duration);
			if (next > 0 && next < duration) {
				cast ??= new MeteorStrikeVFX(group);
				cast.seek(next);
				cast.root.visible = true;
			} else if (cast) cast.root.visible = false;
			elapsed = next;
			group.visible = elapsed < duration;
		}
		function prewarm(renderer, camera, scene = group.parent?.isScene ? group.parent : void 0) {
			if (disposed || elapsed !== 0 || !renderer?.isWebGLRenderer || !camera?.isCamera || renderer.getRenderTarget() !== null || renderer.xr.isPresenting || renderer.getContext().isContextLost()) return false;
			const groupVisible = group.visible, rootVisible = cast?.root.visible ?? false;
			cast ??= new MeteorStrikeVFX(group);
			const autoClear = renderer.autoClear;
			const { calls, triangles, lines, points } = renderer.info.render;
			const scratch = new three.WebGLRenderTarget(16, 16);
			const culled = [];
			try {
				renderer.compile(group, camera, scene);
				renderer.setRenderTarget(scratch);
				renderer.autoClear = true;
				group.visible = cast.root.visible = true;
				cast.root.traverse((object) => {
					if (!object.isMesh || !object.frustumCulled) return;
					culled.push(object);
					object.frustumCulled = false;
				});
				for (const t of [
					.22,
					.985,
					METEOR_STRIKE.impactTime + .46
				]) {
					cast.seek(t);
					group.updateWorldMatrix(true, true);
					renderer.render(group, camera);
				}
			} finally {
				try {
					for (const object of culled) object.frustumCulled = true;
					cast.seek(0);
				} finally {
					group.visible = groupVisible;
					cast.root.visible = rootVisible;
					renderer.autoClear = autoClear;
					Object.assign(renderer.info.render, {
						calls,
						triangles,
						lines,
						points
					});
					try {
						renderer.setRenderTarget(null);
					} finally {
						scratch.dispose();
					}
				}
			}
			return true;
		}
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
				return this.finished ? "finished" : elapsed < lifecycle.start ? "starting" : elapsed >= duration - lifecycle.end ? "ending" : "active";
			},
			get finished() {
				return disposed || elapsed >= duration;
			},
			seek,
			prewarm,
			update(dt) {
				if (!this.finished && Number.isFinite(dt) && dt > 0) seek(elapsed + dt * settings.speed);
			},
			reset() {
				seek(0);
			},
			setOptions(partial = {}) {
				if (disposed) return;
				settings = normalizeMeteorStrikeOptions({
					...settings,
					...partial
				});
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
exports.METEOR_STRIKE = METEOR_STRIKE;
exports.MeteorStrikeVFX = MeteorStrikeVFX;
exports.createMeteorStrikeEffect = createMeteorStrikeEffect;
exports.normalizeMeteorStrikeOptions = normalizeMeteorStrikeOptions;
return exports;
})({}, THREE);

export {__vfxModule};
