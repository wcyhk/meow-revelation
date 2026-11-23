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
// Ice Pillar Skill: +Z forward, +Y up, flat XZ ground.
// Single shot; add group, update(deltaSeconds), reset to replay, dispose at teardown.
// stop/hit/shatterNow break the current pillars early. No collision, camera or automatic animation loop.
// size scales the full effect; speed scales time; density changes mist opacity; detail changes rim brightness.
// IcePillarSkillVFX is also exported for cast(origin,direction,overrides), updateConfig and optional autoLoop.
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

//#region src/effects/ice-pillar-runtime.js
/**
	* IcePillarSkillVFX — 卡通動漫風冰柱魔法特效遊戲技能模組 (Three.js r160+)
	* 特性：
	* 1. 四層動漫視覺架構：三階色階斷層冰晶柱 + 靜止貼地無旋轉魔法陣 + 鋸齒地霜 + 流動冷霧 + 四角星芒
	* 2. 方案 A 生命週期：前衝爆發 (Eruption) -> 寒氣維持 (Hold) -> 閃白影響幀與 240 顆物理碎冰飛濺 (Shatter)
	*
	* 使用範例：
	* const iceSkill = new IcePillarSkillVFX(scene, { maxLength: 14, maxHeight: 5.2, shatterForce: 11.0 });
	* iceSkill.cast(casterPosition, forwardDirection); // 於起點靜止展開魔法陣並向前推進冰柱
	* iceSkill.shatterNow();                            // 提前觸發方案 A 瞬間炸裂
	* iceSkill.update(deltaTime);                       // 納入遊戲主迴圈更新
	*/
	function createFrostTrailTexture() {
		if (typeof document === "undefined") return new three.Texture();
		const canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 1024;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const cx = canvas.width * .5;
		ctx.save();
		const outerGrad = ctx.createRadialGradient(cx, 540, 20, cx, 540, 240);
		outerGrad.addColorStop(0, "rgba(186, 230, 253, 0.85)");
		outerGrad.addColorStop(.55, "rgba(56, 189, 248, 0.35)");
		outerGrad.addColorStop(1, "rgba(14, 165, 233, 0.0)");
		ctx.fillStyle = outerGrad;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		const steps = 42;
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const y = canvas.height * (.96 - t * .9);
			const envelope = Math.sin(Math.pow(t, .65) * Math.PI);
			const jag = (Math.sin(i * 7.3) * .25 + Math.cos(i * 13.7) * .2) * 55;
			const halfW = 28 + envelope * 135 + jag;
			const x = cx - Math.max(12, halfW);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		for (let i = steps; i >= 0; i--) {
			const t = i / steps;
			const y = canvas.height * (.96 - t * .9);
			const envelope = Math.sin(Math.pow(t, .65) * Math.PI);
			const jag = (Math.cos(i * 6.1) * .25 + Math.sin(i * 11.9) * .2) * 55;
			const halfW = 28 + envelope * 135 + jag;
			const x = cx + Math.max(12, halfW);
			ctx.lineTo(x, y);
		}
		ctx.closePath();
		const snowGrad = ctx.createLinearGradient(0, canvas.height, 0, 40);
		snowGrad.addColorStop(0, "rgba(224, 242, 254, 0.92)");
		snowGrad.addColorStop(.45, "rgba(255, 255, 255, 0.98)");
		snowGrad.addColorStop(.88, "rgba(224, 242, 254, 0.90)");
		snowGrad.addColorStop(1, "rgba(186, 230, 253, 0.0)");
		ctx.fillStyle = snowGrad;
		ctx.fill();
		ctx.restore();
		const tex = new three.CanvasTexture(canvas);
		tex.needsUpdate = true;
		return tex;
	}
	function createMagicRuneTexture() {
		if (typeof document === "undefined") return new three.Texture();
		const canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 512;
		const ctx = canvas.getContext("2d");
		const cx = 256, cy = 256;
		ctx.clearRect(0, 0, 512, 512);
		ctx.save();
		ctx.translate(cx, cy);
		const glow = ctx.createRadialGradient(0, 0, 60, 0, 0, 245);
		glow.addColorStop(0, "rgba(125, 211, 252, 0.25)");
		glow.addColorStop(.75, "rgba(56, 189, 248, 0.45)");
		glow.addColorStop(1, "rgba(56, 189, 248, 0.0)");
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(0, 0, 245, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#e0f2fe";
		ctx.shadowColor = "#38bdf8";
		ctx.shadowBlur = 12;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.arc(0, 0, 210, 0, Math.PI * 2);
		ctx.stroke();
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.arc(0, 0, 182, 0, Math.PI * 2);
		ctx.stroke();
		for (let r = 0; r < 2; r++) {
			ctx.save();
			ctx.rotate(r * Math.PI / 3);
			ctx.lineWidth = 3.5;
			ctx.beginPath();
			for (let i = 0; i < 3; i++) {
				const ang = i * Math.PI * 2 / 3 - Math.PI / 2;
				const x = Math.cos(ang) * 180;
				const y = Math.sin(ang) * 180;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
		for (let i = 0; i < 24; i++) {
			const ang = i / 24 * Math.PI * 2;
			ctx.lineWidth = i % 2 === 0 ? 3 : 1.5;
			ctx.beginPath();
			ctx.moveTo(Math.cos(ang) * 186, Math.sin(ang) * 186);
			ctx.lineTo(Math.cos(ang) * 206, Math.sin(ang) * 206);
			ctx.stroke();
		}
		ctx.restore();
		const tex = new three.CanvasTexture(canvas);
		tex.needsUpdate = true;
		return tex;
	}
	function createToonMistTexture() {
		if (typeof document === "undefined") return new three.Texture();
		const canvas = document.createElement("canvas");
		canvas.width = 256;
		canvas.height = 256;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, 256, 256);
		for (const p of [
			{
				x: 128,
				y: 128,
				r: 92,
				a: .55
			},
			{
				x: 96,
				y: 118,
				r: 66,
				a: .45
			},
			{
				x: 162,
				y: 122,
				r: 64,
				a: .45
			},
			{
				x: 115,
				y: 152,
				r: 58,
				a: .4
			},
			{
				x: 148,
				y: 98,
				r: 56,
				a: .4
			}
		]) {
			const g = ctx.createRadialGradient(p.x, p.y, p.r * .12, p.x, p.y, p.r);
			g.addColorStop(0, `rgba(240, 249, 255, ${p.a})`);
			g.addColorStop(.55, `rgba(186, 230, 253, ${p.a * .65})`);
			g.addColorStop(1, "rgba(125, 211, 252, 0.0)");
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
		const tex = new three.CanvasTexture(canvas);
		tex.needsUpdate = true;
		return tex;
	}
	function createAnimeSparkleTexture() {
		if (typeof document === "undefined") return new three.Texture();
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		const ctx = canvas.getContext("2d");
		const cx = 64, cy = 64;
		ctx.clearRect(0, 0, 128, 128);
		const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 52);
		glow.addColorStop(0, "rgba(255, 255, 255, 1.0)");
		glow.addColorStop(.35, "rgba(125, 211, 252, 0.75)");
		glow.addColorStop(1, "rgba(56, 189, 248, 0.0)");
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, 128, 128);
		ctx.fillStyle = "#ffffff";
		ctx.beginPath();
		const outer = 56;
		const inner = 11;
		for (let i = 0; i < 8; i++) {
			const r = i % 2 === 0 ? outer : inner;
			const ang = i * Math.PI / 4;
			const x = cx + Math.cos(ang) * r;
			const y = cy + Math.sin(ang) * r;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.fill();
		const tex = new three.CanvasTexture(canvas);
		tex.needsUpdate = true;
		return tex;
	}
	function createIceBillboards(count, texture, color, blending) {
		const quad = new three.PlaneGeometry(1, 1);
		const geometry = new three.InstancedBufferGeometry();
		geometry.setIndex(quad.index);
		for (const key of ["position", "uv"]) geometry.setAttribute(key, quad.getAttribute(key));
		const centers = new three.InstancedBufferAttribute(new Float32Array(count * 4), 4).setUsage(three.DynamicDrawUsage);
		const sizes = new three.InstancedBufferAttribute(new Float32Array(count * 2), 2).setUsage(three.DynamicDrawUsage);
		geometry.setAttribute("iceCenterAlpha", centers);
		geometry.setAttribute("iceSize", sizes);
		geometry.instanceCount = 0;
		const material = new three.MeshBasicMaterial({
			map: texture,
			color,
			blending,
			transparent: true,
			depthWrite: false
		});
		material.onBeforeCompile = (shader) => {
			shader.vertexShader = "attribute vec4 iceCenterAlpha; attribute vec2 iceSize; varying float vIceAlpha;\n" + shader.vertexShader.replace("#include <project_vertex>", `
        vec4 mvPosition = modelViewMatrix * vec4(iceCenterAlpha.xyz, 1.0);
        mvPosition.xy += position.xy * iceSize * vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));
        gl_Position = projectionMatrix * mvPosition;
        vIceAlpha = iceCenterAlpha.w;`);
			shader.fragmentShader = "varying float vIceAlpha;\n" + shader.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.a *= vIceAlpha;");
		};
		const mesh = new three.Mesh(geometry, material);
		mesh.frustumCulled = false;
		mesh.visible = false;
		return mesh;
	}
	function uploadIceBillboards(mesh, particles) {
		const geometry = mesh.geometry, centers = geometry.attributes.iceCenterAlpha, sizes = geometry.attributes.iceSize;
		let n = 0;
		for (const p of particles) {
			const { visible, position, scale } = p.sprite;
			if (!visible || p.opacity <= 0) continue;
			centers.setXYZW(n, position.x, position.y, position.z, p.opacity);
			sizes.setXY(n, scale.x, scale.y);
			n++;
		}
		geometry.instanceCount = n;
		mesh.visible = n > 0;
		if (n) {
			centers.needsUpdate = true;
			sizes.needsUpdate = true;
		}
	}
	function createFrostFrontGeometry() {
		const pos = [], colors = [], indices = [];
		const point = (angle, radius, y, tone) => {
			pos.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
			colors.push(...tone);
			return pos.length / 3 - 1;
		};
		const ice = [
			.3,
			.8,
			1
		], edge = [
			.79,
			.98,
			1
		], blue = [
			.015,
			.22,
			.42
		];
		for (const [angle, span, r] of [
			[
				.02,
				.61,
				1.02
			],
			[
				.78,
				.36,
				1.06
			],
			[
				1.32,
				.69,
				.97
			],
			[
				2.17,
				.28,
				1.04
			],
			[
				2.62,
				.65,
				1
			],
			[
				3.45,
				.34,
				1.03
			],
			[
				4.05,
				.52,
				.95
			],
			[
				4.83,
				.77,
				1.01
			],
			[
				5.84,
				.29,
				.97
			]
		]) {
			const start = pos.length / 3;
			for (let j = 0; j <= 6; j++) {
				const t = j / 6, taper = Math.sin(Math.PI * t), a = angle + span * t;
				const radius = r + .1 * t * t - .035 * taper;
				point(a, radius - .075 * taper, 0, blue);
				point(a, radius - .02 * taper, .037 * taper, ice);
				point(a, radius, .012 * taper, edge);
				if (j) {
					const k = start + j * 3;
					indices.push(k - 3, k - 2, k, k, k - 2, k + 1, k - 2, k - 1, k + 1, k + 1, k - 1, k + 2);
				}
			}
			if (span > .45) {
				const a = angle + span * .67, k = point(a, r + .05, 0, blue);
				point(a + .075, r + .11, .016, ice);
				point(a + .16, r + .23, .038, edge);
				indices.push(k, k + 1, k + 2);
			}
		}
		const geometry = new three.BufferGeometry();
		geometry.setAttribute("position", new three.Float32BufferAttribute(pos, 3));
		geometry.setAttribute("color", new three.Float32BufferAttribute(colors, 3));
		geometry.setIndex(indices);
		return geometry;
	}
	function createCrystalSpireGeometry(sides = 6, rooted = true) {
		const positions = [];
		const indices = [];
		const baseRing = [];
		const shoulderRing = [];
		for (let i = 0; i < sides; i++) {
			const ang = i / sides * Math.PI * 2;
			const asym = .84 + .26 * Math.sin(i * 2.1 + .4);
			const rBase = .52 * asym;
			const rShoulder = .42 * asym;
			const yShoulder = .64 + .08 * Math.cos(i * 1.7);
			baseRing.push(new three.Vector3(Math.cos(ang) * rBase, 0, Math.sin(ang) * rBase));
			shoulderRing.push(new three.Vector3(Math.cos(ang) * rShoulder, yShoulder, Math.sin(ang) * rShoulder));
		}
		const apex = new three.Vector3(.05, 1, -.04);
		const bottomCenter = new three.Vector3(0, 0, 0);
		for (const v of baseRing) positions.push(v.x, v.y, v.z);
		for (const v of shoulderRing) positions.push(v.x, v.y, v.z);
		positions.push(apex.x, apex.y, apex.z);
		positions.push(bottomCenter.x, bottomCenter.y, bottomCenter.z);
		const apexIdx = sides * 2;
		const bottomIdx = sides * 2 + 1;
		for (let i = 0; i < sides; i++) {
			const next = (i + 1) % sides;
			const b0 = i;
			const b1 = next;
			const s0 = sides + i;
			const s1 = sides + next;
			indices.push(b0, s0, b1);
			indices.push(b1, s0, s1);
			indices.push(s0, apexIdx, s1);
			indices.push(b1, bottomIdx, b0);
		}
		const indexedGeo = new three.BufferGeometry();
		indexedGeo.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
		indexedGeo.setIndex(indices);
		indexedGeo.computeVertexNormals();
		const smoothNormalsIndexed = indexedGeo.attributes.normal.array;
		const nonIndexed = indexedGeo.toNonIndexed();
		nonIndexed.computeVertexNormals();
		const smoothNormNonIdx = new Float32Array(indices.length * 3);
		for (let i = 0; i < indices.length; i++) {
			const origVertIdx = indices[i];
			smoothNormNonIdx[i * 3 + 0] = smoothNormalsIndexed[origVertIdx * 3 + 0];
			smoothNormNonIdx[i * 3 + 1] = smoothNormalsIndexed[origVertIdx * 3 + 1];
			smoothNormNonIdx[i * 3 + 2] = smoothNormalsIndexed[origVertIdx * 3 + 2];
		}
		nonIndexed.setAttribute("aSmoothNormal", new three.BufferAttribute(smoothNormNonIdx, 3));
		const contact = new Float32Array(indices.length);
		if (rooted) for (let i = 0; i < indices.length; i++) contact[i] = indices[i] < sides || indices[i] === bottomIdx ? 1 : 0;
		nonIndexed.setAttribute("aFoot", new three.BufferAttribute(contact, 1));
		indexedGeo.dispose();
		return nonIndexed;
	}
	function createShardGeometry() {
		return createCrystalSpireGeometry(5, false);
	}
	const COLOR_THEMES = {
		frost: {
			name: "蒼藍冰霜",
			shadowColor: new three.Color("#0c3b75"),
			midColor: new three.Color("#22b8f0"),
			litColor: new three.Color("#e8faff"),
			rimColor: new three.Color("#a5f3fc"),
			outlineColor: new three.Color("#061226"),
			mistColor: new three.Color("#bae6fd"),
			runeColor: new three.Color("#38bdf8")
		},
		aurora: {
			name: "極光青藍",
			shadowColor: new three.Color("#064e3b"),
			midColor: new three.Color("#14b8a6"),
			litColor: new three.Color("#ecfdf5"),
			rimColor: new three.Color("#5eead4"),
			outlineColor: new three.Color("#042f2e"),
			mistColor: new three.Color("#99f6e4"),
			runeColor: new three.Color("#2dd4bf")
		},
		void: {
			name: "深淵紫晶",
			shadowColor: new three.Color("#2e1065"),
			midColor: new three.Color("#8b5cf6"),
			litColor: new three.Color("#f5f3ff"),
			rimColor: new three.Color("#e879f9"),
			outlineColor: new three.Color("#130729"),
			mistColor: new three.Color("#ddd6fe"),
			runeColor: new three.Color("#c084fc")
		}
	};
	function createAnimeIceMaterial(theme) {
		return new three.ShaderMaterial({
			uniforms: {
				uShadowColor: { value: theme.shadowColor.clone() },
				uMidColor: { value: theme.midColor.clone() },
				uLitColor: { value: theme.litColor.clone() },
				uRimColor: { value: theme.rimColor.clone() },
				uLightDir: { value: new three.Vector3(.55, .85, .45).normalize() },
				uRimIntensity: { value: 1.15 },
				uTime: { value: 0 },
				uFlash: { value: 0 }
			},
			vertexShader: `
          attribute float aSeed;
          attribute float aFoot;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPos;
          varying vec3 vLocalPos;
          varying float vSeed;
          varying float vFoot;

          void main() {
            vLocalPos = position;
            vSeed = aSeed;
            vFoot = aFoot;

            vec4 worldPos = vec4(position, 1.0);
            vec3 transformedNormal = normal;

            #ifdef USE_INSTANCING
              worldPos = instanceMatrix * worldPos;
              mat3 instMat3 = mat3(instanceMatrix);
              // Cofactors preserve facet lighting under the grounded pillar's shear.
              transformedNormal = mat3(cross(instMat3[1],instMat3[2]),cross(instMat3[2],instMat3[0]),
                                       cross(instMat3[0],instMat3[1])) * normal;
            #endif

            worldPos = modelMatrix * worldPos;
            vWorldPos = worldPos.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);

            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
			fragmentShader: `
          uniform vec3 uShadowColor;
          uniform vec3 uMidColor;
          uniform vec3 uLitColor;
          uniform vec3 uRimColor;
          uniform vec3 uLightDir;
          uniform float uRimIntensity;
          uniform float uTime;
          uniform float uFlash;

          varying vec3 vWorldNormal;
          varying vec3 vWorldPos;
          varying vec3 vLocalPos;
          varying float vSeed;
          varying float vFoot;

          void main() {
            vec3 N = normalize(vWorldNormal);
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 L = normalize(uLightDir);

            // 1. 三階卡通色階斷層 (3-Step Cel-Shading Ramp)
            float NdotL = dot(N, L) * 0.5 + 0.5;
            // 加入微幅高度漸層，使根部更深邃、晶體頂端更清透
            float heightBias = clamp(vLocalPos.y * 0.25, 0.0, 0.25);
            float celVal = NdotL + heightBias;

            vec3 baseColor = uShadowColor;
            float band1 = smoothstep(0.42, 0.45, celVal);
            float band2 = smoothstep(0.72, 0.75, celVal);
            baseColor = mix(baseColor, uMidColor, band1);
            baseColor = mix(baseColor, uLitColor, band2);

            // 2. 動漫斜向高光條紋 (Anime Diagonal Specular Streaks)
            float diagCoord = (vLocalPos.x * 2.4 + vLocalPos.y * 3.8 + vSeed * 6.28);
            float streak1 = smoothstep(0.91, 0.94, sin(diagCoord));
            float streak2 = smoothstep(0.95, 0.98, sin(diagCoord * 2.1 + 1.3));
            float specMask = clamp(streak1 * 0.65 + streak2 * 0.45, 0.0, 1.0) * step(0.48, celVal);
            baseColor = mix(baseColor, vec3(1.0), specMask * 0.72);

            // 3. 銳利菲涅爾邊緣發光 (Hard-Edged Fresnel Rim Glow)
            float fresnel = 1.0 - max(dot(N, V), 0.0);
            float hardRim = smoothstep(0.56, 0.68, fresnel);
            vec3 rimContribution = uRimColor * hardRim * uRimIntensity;

            // 4. 寒氣維持期的內部微弱能量脈動
            float pulse = 0.06 * sin(uTime * 4.5 - vWorldPos.z * 0.5) * clamp(vLocalPos.y, 0.0, 1.0);

            vec3 finalColor = baseColor + rimContribution + uMidColor * pulse;

            finalColor = mix(finalColor,uShadowColor,0.36*smoothstep(0.80,1.0,vFoot));

            // 5. 方案 A 引爆瞬間的高能閃白影響幀 (Impact Frame)
            finalColor = mix(finalColor, vec3(1.45, 1.55, 1.65), uFlash);

            gl_FragColor = vec4(finalColor, 0.96);
          }
        `,
			transparent: true
		});
	}
	function createToonOutlineMaterial(theme) {
		return new three.ShaderMaterial({
			uniforms: {
				uOutlineWidth: { value: .032 },
				uOutlineColor: { value: theme.outlineColor.clone() }
			},
			vertexShader: `
          attribute vec3 aSmoothNormal;
          attribute float aFoot;
          uniform float uOutlineWidth;

          void main() {
            // 沿平滑焊接法線外擴，避免硬邊切面在描邊時裂開
            vec3 extrudedPos = position + normalize(aSmoothNormal) * uOutlineWidth;
            extrudedPos.y = mix(extrudedPos.y,position.y,aFoot);
            vec4 worldPos = vec4(extrudedPos, 1.0);

            #ifdef USE_INSTANCING
              worldPos = instanceMatrix * worldPos;
            #endif

            gl_Position = projectionMatrix * viewMatrix * modelMatrix * worldPos;
          }
        `,
			fragmentShader: `
          uniform vec3 uOutlineColor;
          void main() {
            gl_FragColor = vec4(uOutlineColor, 1.0);
          }
        `,
			side: three.BackSide
		});
	}
	var IcePillarSkillVFX = class {
		constructor(scene, options = {}) {
			this.scene = scene;
			this._seed = (options.seed ?? 713) >>> 0;
			this._randomState = this._seed;
			this._random = () => {
				this._randomState = Math.imul(this._randomState, 1664525) + 1013904223 >>> 0;
				return this._randomState / 4294967296;
			};
			this.disposed = false;
			this.config = Object.assign({
				maxLength: 14,
				maxHeight: 5.2,
				spireCount: 32,
				castSpeed: 1.2,
				holdDuration: 1.6,
				shatterForce: 11,
				themeKey: "frost",
				outlineWidth: .032,
				rimIntensity: 1.15,
				mistDensity: .65,
				autoLoop: true,
				onCameraShake: null
			}, options);
			this.state = "IDLE";
			this.stateTime = 0;
			this.totalTime = 0;
			this.loopCooldown = .65;
			this.idleTimer = .2;
			this.root = new three.Group();
			this.scene.add(this.root);
			this.origin = new three.Vector3(0, 0, 0);
			this.direction = new three.Vector3(0, 0, 1);
			this.MAX_SPIRES = 64;
			this.MAX_SHARDS = 240;
			this.MAX_MIST = 36;
			this.MAX_SPARKLES = 55;
			this.textures = {
				frost: createFrostTrailTexture(),
				rune: createMagicRuneTexture(),
				mist: createToonMistTexture(),
				sparkle: createAnimeSparkleTexture()
			};
			this.spireGeo = createCrystalSpireGeometry(6);
			this.shardGeo = createShardGeometry();
			this.shardGeo.setAttribute("aSeed", new three.Float32BufferAttribute(new Float32Array(this.shardGeo.attributes.position.count), 1));
			const initTheme = COLOR_THEMES[this.config.themeKey] || COLOR_THEMES.frost;
			this.iceMat = createAnimeIceMaterial(initTheme);
			this.outlineMat = createToonOutlineMaterial(initTheme);
			this._initLayer1SpiresAndShards();
			this._initLayer2GroundFrostAndRune();
			this._initLayer3ColdMist();
			this._initLayer4Sparkles();
			this._dummy = new three.Object3D();
			this._tempVec = new three.Vector3();
			this.updateConfig(this.config);
		}
		_initLayer1SpiresAndShards() {
			const spireVertCount = this.spireGeo.attributes.position.count;
			const spireSeeds = new Float32Array(spireVertCount);
			this.spireGeo.setAttribute("aSeed", new three.BufferAttribute(spireSeeds, 1));
			this.spireMesh = new three.InstancedMesh(this.spireGeo, this.iceMat, this.MAX_SPIRES);
			this.spireMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.spireMesh.count = 0;
			this.spireMesh.frustumCulled = false;
			this.root.add(this.spireMesh);
			this.spireOutlineMesh = new three.InstancedMesh(this.spireGeo, this.outlineMat, this.MAX_SPIRES);
			this.spireOutlineMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.spireOutlineMesh.instanceMatrix = this.spireMesh.instanceMatrix;
			this.spireOutlineMesh.count = 0;
			this.spireOutlineMesh.frustumCulled = false;
			this.root.add(this.spireOutlineMesh);
			this.shardMesh = new three.InstancedMesh(this.shardGeo, this.iceMat, this.MAX_SHARDS);
			this.shardMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.shardMesh.count = 0;
			this.shardMesh.frustumCulled = false;
			this.root.add(this.shardMesh);
			this.shardOutlineMesh = new three.InstancedMesh(this.shardGeo, this.outlineMat, this.MAX_SHARDS);
			this.shardOutlineMesh.instanceMatrix.setUsage(three.DynamicDrawUsage);
			this.shardOutlineMesh.instanceMatrix = this.shardMesh.instanceMatrix;
			this.shardOutlineMesh.count = 0;
			this.shardOutlineMesh.frustumCulled = false;
			this.root.add(this.shardOutlineMesh);
			this.spiresData = [];
			this.shardsData = Array.from({ length: this.MAX_SHARDS }, () => ({
				active: false,
				pos: new three.Vector3(),
				vel: new three.Vector3(),
				rot: new three.Euler(),
				rotVel: new three.Vector3(),
				baseScale: new three.Vector3(1, 1, 1),
				life: 0,
				maxLife: 1.2
			}));
		}
		_initLayer2GroundFrostAndRune() {
			const frostGeo = new three.PlaneGeometry(3.6, 1, 1, 1);
			frostGeo.rotateX(-Math.PI / 2);
			frostGeo.translate(0, .015, .5);
			this.frostMat = new three.MeshBasicMaterial({
				map: this.textures.frost,
				transparent: true,
				opacity: 0,
				depthWrite: false,
				blending: three.NormalBlending
			});
			this.frostMesh = new three.Mesh(frostGeo, this.frostMat);
			this.root.add(this.frostMesh);
			const runeGeo = new three.PlaneGeometry(3.4, 3.4);
			runeGeo.rotateX(-Math.PI / 2);
			this.runeMat = new three.MeshBasicMaterial({
				map: this.textures.rune,
				color: (COLOR_THEMES[this.config.themeKey] || COLOR_THEMES.frost).runeColor,
				transparent: true,
				opacity: 0,
				depthWrite: false,
				blending: three.AdditiveBlending
			});
			this.runeMesh = new three.Mesh(runeGeo, this.runeMat);
			this.runeMesh.position.set(0, .02, 0);
			this.runeMesh.rotation.set(0, 0, 0);
			this.root.add(this.runeMesh);
			const shockGeo = createFrostFrontGeometry();
			this.shockMat = new three.MeshBasicMaterial({
				vertexColors: true,
				transparent: true,
				opacity: 0,
				side: three.DoubleSide,
				forceSinglePass: true,
				depthWrite: false,
				blending: three.AdditiveBlending
			});
			this.shockMesh = new three.Mesh(shockGeo, this.shockMat);
			this.shockMesh.visible = false;
			this.shockMesh.position.set(0, .04, 5.5);
			this.root.add(this.shockMesh);
		}
		_initLayer3ColdMist() {
			const theme = COLOR_THEMES[this.config.themeKey] || COLOR_THEMES.frost;
			this.mistGroup = createIceBillboards(this.MAX_MIST, this.textures.mist, theme.mistColor, three.NormalBlending);
			this.root.add(this.mistGroup);
			this.mistSprites = [];
			for (let i = 0; i < this.MAX_MIST; i++) this.mistSprites.push({
				sprite: {
					position: new three.Vector3(),
					scale: new three.Vector3(1, 1, 1),
					visible: false
				},
				opacity: 0,
				spawnT: i / this.MAX_MIST * .78,
				basePos: new three.Vector3(),
				driftVel: new three.Vector3(),
				shatterVel: new three.Vector3(),
				baseScale: 2.2,
				rotSpeed: (this._random() - .5) * .8
			});
		}
		_initLayer4Sparkles() {
			this.sparkleGroup = createIceBillboards(this.MAX_SPARKLES, this.textures.sparkle, 16777215, three.AdditiveBlending);
			this.root.add(this.sparkleGroup);
			this.sparkles = [];
			for (let i = 0; i < this.MAX_SPARKLES; i++) this.sparkles.push({
				sprite: {
					position: new three.Vector3(),
					scale: new three.Vector3(1, 1, 1),
					visible: false
				},
				opacity: 0,
				pos: new three.Vector3(),
				vel: new three.Vector3(),
				phase: this._random() * Math.PI * 2,
				size: .25 + this._random() * .35
			});
		}
		/**
		* 生成楔形推進式冰柱陣列配置 (還原近低遠高、雙側護衛晶簇的動漫張力輪廓)
		*/
		_generateSpireLayout() {
			this.spiresData = [];
			const count = Math.min(this.MAX_SPIRES, Math.max(10, Math.round(this.config.spireCount)));
			const len = this.config.maxLength;
			const maxH = this.config.maxHeight;
			for (let i = 0; i < count; i++) {
				const u = i / Math.max(1, count - 1);
				const distRatio = Math.pow(u, .92);
				const z = .65 + distRatio * (len - .65);
				const isFlank = i % 3 !== 0 && u > .12;
				const sideSign = i % 2 === 0 ? 1 : -1;
				const maxSpreadX = .22 + distRatio * .95;
				const x = isFlank ? sideSign * (.32 + this._random() * maxSpreadX) : (this._random() - .5) * .36;
				const wedgeProfile = .14 + .86 * Math.pow(distRatio, 1.28);
				const jitter = .82 + this._random() * .36;
				let targetHeight = maxH * wedgeProfile * jitter;
				if (isFlank) targetHeight *= .34 + this._random() * .28;
				const radiusScale = isFlank ? .32 + this._random() * .24 : .46 + distRatio * .42 + this._random() * .18;
				const tiltForward = three.MathUtils.degToRad(12 + distRatio * 14 + (this._random() - .5) * 6);
				const tiltSide = isFlank ? -sideSign * three.MathUtils.degToRad(14 + this._random() * 18) : (this._random() - .5) * three.MathUtils.degToRad(8);
				this.spiresData.push({
					pos: new three.Vector3(x, 0, z),
					targetHeight,
					radiusScale,
					rotX: tiltForward,
					rotY: this._random() * Math.PI * 2,
					rotZ: tiltSide,
					triggerT: distRatio * .72,
					currentScaleY: 0,
					currentScaleXZ: 0
				});
			}
			this.mistSprites.forEach((m, idx) => {
				const t = idx / this.MAX_MIST;
				const z = .5 + t * (len * .96);
				const x = (this._random() - .5) * (.9 + t * 1.6);
				const y = .45 + t * (maxH * .28) + this._random() * .6;
				m.spawnT = t * .75;
				m.basePos.set(x, y, z);
				m.driftVel.set((this._random() - .5) * .35, .25 + this._random() * .25, .7 + this._random() * .6);
				m.baseScale = 2 + t * 1.8 + this._random() * .9;
				m.sprite.position.copy(m.basePos);
			});
			this.sparkles.forEach((s, idx) => {
				const t = this._random();
				const z = .6 + t * len;
				const x = (this._random() - .5) * 2.4;
				const y = .3 + this._random() * (maxH * (.25 + t * .85));
				s.pos.set(x, y, z);
				s.vel.set((this._random() - .5) * .3, .55 + this._random() * .75, .2 + this._random() * .3);
				s.sprite.position.copy(s.pos);
			});
		}
		/**
		* 公開遊戲 API：從指定起點與方向施放冰柱技能
		*/
		cast(origin = new three.Vector3(0, 0, 0), direction = new three.Vector3(0, 0, 1), overrides = {}) {
			if (this.disposed) return;
			this.updateConfig(overrides);
			this._randomState = this._seed;
			this.totalTime = 0;
			this._hideAllParticles();
			this.origin.copy(origin);
			this.direction.copy(direction);
			this.direction.y = 0;
			if (this.direction.lengthSq() < 1e-4) this.direction.set(0, 0, 1);
			else this.direction.normalize();
			this.root.position.copy(this.origin);
			const targetYaw = Math.atan2(this.direction.x, this.direction.z);
			this.root.rotation.set(0, targetYaw, 0);
			this.iceMat.uniforms.uFlash.value = 0;
			this.frostMesh.scale.set(1, 1, .01);
			this.frostMat.opacity = 0;
			this.runeMesh.position.set(0, .02, 0);
			this.runeMesh.rotation.set(0, 0, 0);
			this.runeMesh.scale.set(.25, 1, .25);
			this.runeMat.opacity = 1;
			this.shockMesh.visible = false;
			this.shockMat.opacity = 0;
			this.shardMesh.count = 0;
			this.shardOutlineMesh.count = 0;
			for (const sh of this.shardsData) sh.active = false;
			this._generateSpireLayout();
			this.spireMesh.count = this.spiresData.length;
			this.spireOutlineMesh.count = this.spiresData.length;
			for (let i = 0; i < this.spiresData.length; i++) this.spireMesh.setMatrixAt(i, this._rootedSpireMatrix(this.spiresData[i]));
			this.spireMesh.instanceMatrix.needsUpdate = true;
			this.state = "ERUPTION";
			this.stateTime = 0;
			if (typeof this.config.onCameraShake === "function") this.config.onCameraShake(.14);
		}
		/**
		* 公開遊戲 API：方案 A 瞬間炸裂 (所有冰柱瞬間消失並化為物理碎冰飛濺)
		*/
		shatterNow() {
			if (this.state === "SHATTER" || this.state === "IDLE") return;
			let shardIdx = 0;
			const forceMul = this.config.shatterForce / 8.5;
			for (const spire of this.spiresData) {
				if (spire.currentScaleY <= .05) continue;
				const h = spire.targetHeight * spire.currentScaleY;
				const piecesForThisSpire = Math.min(12, Math.max(4, Math.round(h * 1.9)));
				const pillarMatrix = this._rootedSpireMatrix(spire);
				for (let p = 0; p < piecesForThisSpire && shardIdx < this.MAX_SHARDS; p++) {
					const sh = this.shardsData[shardIdx++];
					sh.active = true;
					const hFrac = (p + .2) / piecesForThisSpire;
					sh.pos.set((this._random() - .5) * .35, hFrac, (this._random() - .5) * .35);
					sh.pos.applyMatrix4(pillarMatrix);
					sh.pos.y = Math.max(.15, sh.pos.y);
					const radialAngle = this._random() * Math.PI * 2;
					const radialSpeed = (2.6 + this._random() * 5.8) * forceMul;
					sh.vel.set(Math.cos(radialAngle) * radialSpeed + Math.sign(spire.pos.x || this._random() - .5) * 1.2 * forceMul, (3.2 + hFrac * 4.8 + this._random() * 3.5) * forceMul, Math.sin(radialAngle) * radialSpeed + (1.8 + this._random() * 3.2) * forceMul);
					sh.rot.set(this._random() * 6.28, this._random() * 6.28, this._random() * 6.28);
					sh.rotVel.set((this._random() - .5) * 18, (this._random() - .5) * 18, (this._random() - .5) * 18);
					const s = (.14 + this._random() * .22) * (.7 + spire.radiusScale * .5);
					sh.baseScale.set(s, s * (1.2 + this._random() * .9), s);
					sh.life = 0;
					sh.maxLife = 1.05 + this._random() * .45;
				}
			}
			this.activeShardCount = shardIdx;
			for (let i = 0; i < shardIdx; i++) {
				const sh = this.shardsData[i];
				this._dummy.position.copy(sh.pos);
				this._dummy.rotation.copy(sh.rot);
				this._dummy.scale.copy(sh.baseScale);
				this._dummy.updateMatrix();
				this.shardMesh.setMatrixAt(i, this._dummy.matrix);
			}
			this.shardMesh.instanceMatrix.needsUpdate = true;
			this.spireMesh.count = 0;
			this.spireOutlineMesh.count = 0;
			this.shardMesh.count = this.activeShardCount;
			this.shardOutlineMesh.count = this.activeShardCount;
			this.iceMat.uniforms.uFlash.value = 1;
			this.shockMesh.position.set(0, .05, this.config.maxLength * .48);
			this.shockMesh.visible = true;
			this.shockMesh.scale.set(.55, 1, .55);
			this.shockMat.opacity = .95;
			for (const m of this.mistSprites) m.shatterVel.set((this._random() - .5) * 6.5 * forceMul, 1.4 + this._random() * 2.2, (this._random() - .3) * 5 * forceMul);
			for (const s of this.sparkles) s.vel.set((this._random() - .5) * 9 * forceMul, 3 + this._random() * 5, (this._random() - .2) * 8 * forceMul);
			this.state = "SHATTER";
			this.stateTime = 0;
			if (typeof this.config.onCameraShake === "function") this.config.onCameraShake(.26);
		}
		/**
		* 更新視覺參數與色彩主題
		*/
		updateConfig(partial) {
			if (this.disposed) return;
			partial = { ...partial };
			for (const [key, lo, hi] of [
				[
					"maxLength",
					2,
					24
				],
				[
					"maxHeight",
					.5,
					10
				],
				[
					"spireCount",
					10,
					64
				],
				[
					"castSpeed",
					.2,
					4
				],
				[
					"holdDuration",
					.1,
					10
				],
				[
					"shatterForce",
					0,
					25
				],
				[
					"outlineWidth",
					0,
					.1
				],
				[
					"rimIntensity",
					0,
					3
				],
				[
					"mistDensity",
					0,
					1
				]
			]) if (key in partial) partial[key] = Number.isFinite(partial[key]) ? three.MathUtils.clamp(partial[key], lo, hi) : this.config[key];
			if (partial.themeKey && !COLOR_THEMES[partial.themeKey]) partial.themeKey = "frost";
			Object.assign(this.config, partial);
			if (partial.themeKey && COLOR_THEMES[partial.themeKey]) {
				const t = COLOR_THEMES[partial.themeKey];
				this.iceMat.uniforms.uShadowColor.value.copy(t.shadowColor);
				this.iceMat.uniforms.uMidColor.value.copy(t.midColor);
				this.iceMat.uniforms.uLitColor.value.copy(t.litColor);
				this.iceMat.uniforms.uRimColor.value.copy(t.rimColor);
				this.outlineMat.uniforms.uOutlineColor.value.copy(t.outlineColor);
				this.runeMat.color.copy(t.runeColor);
				this.mistGroup.material.color.copy(t.mistColor);
			}
			if (typeof partial.outlineWidth === "number") this.outlineMat.uniforms.uOutlineWidth.value = partial.outlineWidth;
			if (typeof partial.rimIntensity === "number") this.iceMat.uniforms.uRimIntensity.value = partial.rimIntensity;
		}
		/**
		* 每幀更新四層特效動畫與物理模擬
		*/
		update(dt) {
			if (this.disposed || !Number.isFinite(dt) || dt < 0) return;
			const clampedDt = Math.min(dt, .05);
			this.totalTime += clampedDt;
			this.iceMat.uniforms.uTime.value = this.totalTime;
			if (this.state === "IDLE") {
				if (this.config.autoLoop) {
					this.idleTimer -= clampedDt;
					if (this.idleTimer <= 0) this.cast(this.origin, this.direction);
				}
				return;
			}
			this.stateTime += clampedDt;
			if (this.state === "ERUPTION") {
				const duration = .44 / Math.max(.2, this.config.castSpeed);
				const progress = Math.min(1, this.stateTime / duration);
				const runeScale = .25 + (1 - Math.pow(1 - Math.min(1, progress * 2.4), 3)) * .85;
				this.runeMesh.scale.set(runeScale, 1, runeScale);
				this.runeMesh.rotation.set(0, 0, 0);
				const runePulse = .84 + .16 * Math.sin(this.totalTime * 11);
				this.runeMat.opacity = Math.max(0, (1 - progress * .35) * runePulse);
				const frostProgress = Math.min(1, progress * 1.15);
				this.frostMesh.scale.set(1, 1, Math.max(.01, this.config.maxLength * frostProgress));
				this.frostMat.opacity = Math.min(.92, frostProgress * 1.1);
				for (let i = 0; i < this.spiresData.length; i++) {
					const sp = this.spiresData[i];
					const localT = three.MathUtils.clamp((progress - sp.triggerT) / .28, 0, 1);
					let scaleY = 0;
					let scaleXZ = 0;
					if (localT > 0) {
						if (localT < .65) {
							const k = localT / .65;
							const easeOut = 1 - Math.pow(1 - k, 3);
							scaleY = easeOut * 1.14;
							scaleXZ = easeOut * 1.08;
						} else {
							const k = (localT - .65) / .35;
							scaleY = 1.14 - .14 * k;
							scaleXZ = 1.08 - .08 * k;
						}
					}
					sp.currentScaleY = scaleY;
					sp.currentScaleXZ = scaleXZ;
				}
				this._spiresDirty = true;
				if (!this._deferMatrices) this._flushMatrices();
				this._updateMistAndSparkles(clampedDt, progress, false);
				if (progress >= 1) {
					this.state = "HOLD";
					this.stateTime = 0;
				}
				return;
			}
			if (this.state === "HOLD") {
				this.runeMesh.rotation.set(0, 0, 0);
				const holdRatio = this.stateTime / Math.max(.1, this.config.holdDuration);
				const runePulse = .82 + .18 * Math.sin(this.totalTime * 9);
				this.runeMat.opacity = Math.max(0, .65 * (1 - holdRatio) * runePulse);
				this._updateMistAndSparkles(clampedDt, 1, false);
				if (this.stateTime >= this.config.holdDuration) this.shatterNow();
				return;
			}
			if (this.state === "SHATTER") {
				const tNorm = Math.min(1, this.stateTime / 1.45);
				this.iceMat.uniforms.uFlash.value = Math.max(0, 1 - this.stateTime / .08);
				const waveT = Math.min(1, this.stateTime / .48);
				this.shockMesh.visible = waveT < 1;
				const radius = .55 + 4.3 * (1 - (1 - waveT) * (1 - waveT));
				this.shockMesh.scale.set(radius, 1, radius);
				this.shockMat.opacity = .95 * (1 - waveT * waveT);
				this.frostMat.opacity = Math.max(0, .92 * (1 - tNorm * 1.15));
				this.runeMat.opacity = 0;
				const gravity = -24;
				let stillVisible = 0;
				for (let i = 0; i < this.activeShardCount; i++) {
					const sh = this.shardsData[i];
					if (!sh.active) continue;
					sh.life += clampedDt;
					if (sh.life / sh.maxLife >= 1) {
						sh.active = false;
						continue;
					}
					stillVisible++;
					sh.vel.y += gravity * clampedDt;
					sh.pos.addScaledVector(sh.vel, clampedDt);
					if (sh.pos.y <= .08) {
						sh.pos.y = .08;
						if (sh.vel.y < 0) {
							sh.vel.y = -sh.vel.y * .36;
							sh.vel.x *= .72;
							sh.vel.z *= .72;
							sh.rotVel.multiplyScalar(.65);
						}
					}
					sh.rot.x += sh.rotVel.x * clampedDt;
					sh.rot.y += sh.rotVel.y * clampedDt;
					sh.rot.z += sh.rotVel.z * clampedDt;
				}
				this._shardsDirty = true;
				if (!this._deferMatrices) this._flushMatrices();
				this._updateMistAndSparkles(clampedDt, 1, true, tNorm);
				if (tNorm >= 1) {
					this.shardMesh.count = 0;
					this.shardOutlineMesh.count = 0;
					this._hideAllParticles();
					this.state = "IDLE";
					this.idleTimer = this.loopCooldown;
				}
			}
		}
		_rootedSpireMatrix(sp) {
			const width = sp.radiusScale * Math.max(1e-4, sp.currentScaleXZ);
			this._dummy.position.copy(sp.pos);
			this._dummy.position.y -= .012 * width;
			this._dummy.rotation.set(sp.rotX, sp.rotY, sp.rotZ);
			this._dummy.scale.set(width, sp.targetHeight * Math.max(1e-4, sp.currentScaleY), width);
			this._dummy.updateMatrix();
			const m = this._dummy.matrix;
			m.elements[1] = 0;
			m.elements[9] = 0;
			return m;
		}
		_flushMatrices() {
			if (this._spiresDirty) {
				for (let i = 0; i < this.spireMesh.count; i++) this.spireMesh.setMatrixAt(i, this._rootedSpireMatrix(this.spiresData[i]));
				this.spireMesh.instanceMatrix.needsUpdate = true;
				this._spiresDirty = false;
			}
			if (this._shardsDirty) {
				for (let i = 0; i < this.shardMesh.count; i++) {
					const sh = this.shardsData[i], ratio = sh.life / sh.maxLife;
					const shrink = !sh.active ? 0 : ratio > .65 ? Math.max(.001, 1 - (ratio - .65) / .35) : 1;
					this._dummy.position.copy(sh.pos);
					this._dummy.rotation.copy(sh.rot);
					this._dummy.scale.set(sh.baseScale.x * shrink, sh.baseScale.y * shrink, sh.baseScale.z * shrink);
					this._dummy.updateMatrix();
					this.shardMesh.setMatrixAt(i, this._dummy.matrix);
				}
				this.shardMesh.instanceMatrix.needsUpdate = true;
				this._shardsDirty = false;
			}
		}
		_updateMistAndSparkles(dt, progress, isShattering, shatterT = 0) {
			const mistDensity = this.config.mistDensity;
			for (const m of this.mistSprites) {
				if (!isShattering && progress < m.spawnT) {
					m.sprite.visible = false;
					continue;
				}
				m.sprite.visible = mistDensity > .01;
				if (!m.sprite.visible) continue;
				if (!isShattering) {
					m.sprite.position.addScaledVector(m.driftVel, dt * .45);
					const age = Math.min(1, (progress - m.spawnT) / .35);
					const sc = m.baseScale * (.65 + age * .55);
					m.sprite.scale.set(sc, sc * .72, 1);
					m.opacity = age * .52 * mistDensity;
				} else {
					m.sprite.position.addScaledVector(m.shatterVel, dt);
					m.sprite.scale.multiplyScalar(1 + dt * .65);
					m.opacity = Math.max(0, (1 - shatterT * 1.45) * .48 * mistDensity);
					m.sprite.visible = m.opacity > 0;
				}
			}
			for (const s of this.sparkles) {
				s.sprite.visible = true;
				s.pos.addScaledVector(s.vel, dt);
				s.sprite.position.copy(s.pos);
				const twinkle = .55 + .45 * Math.sin(this.totalTime * 9 + s.phase);
				const sc = s.size * twinkle * (isShattering ? Math.max(0, 1 - shatterT * 1.3) : Math.min(1, progress * 1.5));
				s.sprite.scale.set(sc, sc, 1);
				s.opacity = (isShattering ? Math.max(0, 1 - shatterT * 1.3) : .92) * twinkle;
				s.sprite.visible = s.opacity > 0 && sc > 0;
			}
			if (!this._deferMatrices) this._flushBillboards();
		}
		_flushBillboards() {
			uploadIceBillboards(this.mistGroup, this.mistSprites);
			uploadIceBillboards(this.sparkleGroup, this.sparkles);
		}
		_hideAllParticles() {
			this.mistGroup.visible = this.sparkleGroup.visible = false;
			for (const m of this.mistSprites) m.sprite.visible = false;
			for (const s of this.sparkles) s.sprite.visible = false;
		}
		getActiveCounts() {
			return {
				spires: this.spireMesh.count,
				shards: this.shardMesh.count,
				particles: this.state !== "IDLE" ? this.MAX_MIST + this.MAX_SPARKLES : 0
			};
		}
		dispose() {
			if (this.disposed) return;
			this.disposed = true;
			this.root.removeFromParent();
			for (const mesh of [
				this.spireMesh,
				this.spireOutlineMesh,
				this.shardMesh,
				this.shardOutlineMesh
			]) mesh.dispose();
			for (const mesh of [
				this.frostMesh,
				this.runeMesh,
				this.shockMesh
			]) mesh.geometry.dispose();
			for (const batch of [this.mistGroup, this.sparkleGroup]) {
				batch.geometry.dispose();
				batch.material.dispose();
			}
			this.spireGeo.dispose();
			this.shardGeo.dispose();
			this.iceMat.dispose();
			this.outlineMat.dispose();
			this.frostMat.dispose();
			this.runeMat.dispose();
			this.shockMat.dispose();
			Object.values(this.textures).forEach((t) => t.dispose());
		}
	};
	function createIcePillarEffect(spec, options = {}) {
		const group = new three.Group();
		group.name = spec.id;
		const settings = {
			color: spec.color,
			size: 1,
			speed: 1,
			density: .65,
			detail: 1
		};
		const skill = new IcePillarSkillVFX(group, {
			autoLoop: false,
			seed: spec.seed
		});
		let elapsed = 0, accumulator = 0, disposed = false;
		const duration = .44 / 1.2 + 1.6 + 1.45;
		function setOptions(next = {}) {
			if (disposed) return;
			for (const [key, lo, hi] of [
				[
					"size",
					.25,
					2
				],
				[
					"speed",
					.25,
					2
				],
				[
					"density",
					.125,
					1
				],
				[
					"detail",
					.25,
					2
				]
			]) if (Number.isFinite(next[key])) settings[key] = three.MathUtils.clamp(next[key], lo, hi);
			if (typeof next.color === "string" && /^#[0-9a-f]{6}$/i.test(next.color)) settings.color = next.color;
			skill.root.scale.setScalar(settings.size);
			skill.updateConfig({
				mistDensity: settings.density,
				rimIntensity: 1.15 * settings.detail
			});
			const color = new three.Color(settings.color);
			skill.iceMat.uniforms.uMidColor.value.copy(color);
			skill.runeMat.color.copy(color);
		}
		function reset() {
			if (disposed) return;
			elapsed = 0;
			accumulator = 0;
			group.visible = true;
			skill.cast();
			setOptions(settings);
		}
		setOptions(options);
		reset();
		return {
			group,
			settings,
			update(dt) {
				if (disposed || !Number.isFinite(dt) || dt < 0 || elapsed >= duration) return;
				const delta = Math.min(duration - elapsed, dt * settings.speed);
				elapsed += delta;
				accumulator += delta;
				skill._deferMatrices = true;
				try {
					while (accumulator >= 1 / 120 - 1e-10) {
						skill.update(1 / 120);
						accumulator -= 1 / 120;
					}
				} finally {
					skill._deferMatrices = false;
					skill._flushMatrices();
					skill._flushBillboards();
				}
				if (elapsed >= 3.416666656666667) {
					elapsed = duration;
					group.visible = false;
				}
			},
			reset,
			setOptions,
			shatterNow() {
				if (!disposed) skill.shatterNow();
			},
			stop() {
				if (!disposed) skill.shatterNow();
			},
			hit() {
				if (!disposed) skill.shatterNow();
			},
			dispose() {
				if (disposed) return;
				disposed = true;
				skill.dispose();
				group.removeFromParent();
				group.clear();
			},
			get elapsed() {
				return elapsed;
			},
			get duration() {
				return duration;
			},
			get finished() {
				return disposed || elapsed >= duration || skill.state === "IDLE";
			},
			get phase() {
				return disposed || elapsed >= duration || skill.state === "IDLE" ? "finished" : skill.state === "SHATTER" ? "ending" : "active";
			},
			get lifecycle() {
				return {
					start: 0,
					end: duration
				};
			},
			get particleCount() {
				return skill.spireMesh.count + skill.shardsData.filter((s) => s.active).length + skill.mistSprites.filter((p) => p.sprite.visible).length + skill.sparkles.filter((p) => p.sprite.visible).length;
			}
		};
	}

//#endregion
exports.IcePillarSkillVFX = IcePillarSkillVFX;
exports.createIcePillarEffect = createIcePillarEffect;
return exports;
})({}, THREE);
const IcePillarSkillVFX = __vfxModule.IcePillarSkillVFX;
const createIcePillarEffect = __vfxModule.createIcePillarEffect;

const preset={"id":"ice-pillar-skill","name":"冰柱突刺","english":"Ice Pillar Skill","category":"area","color":"#22b8f0","description":"冰柱沿地面向前竄起，冒出寒霧，最後炸成四散的碎冰。","tags":"冰柱 冰晶 突刺 寒霧 破裂 動漫 Ice Pillar Skill frost crystal shatter","schools":["ice"],"kind":2,"variant":0,"seed":713,"duration":3.416666666666667,"burst":true,"maxParticles":395,"defaultDensity":0.65,"previewTime":1,"thumbnailTime":1,"lifecycle":{"start":0,"end":3.416666666666667}};
export const defaultOptions={"color":"#22b8f0","size":1,"speed":1,"density":0.65,"detail":1};
export default function createVFX(options={}){return createIcePillarEffect(preset,{...defaultOptions,...options});}
export {IcePillarSkillVFX};
