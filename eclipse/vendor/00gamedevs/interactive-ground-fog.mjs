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
// Interactive Ground Fog — Three.js r187, WebGL2.
// scene.add(fx.group); fx.setTerrain((x,z)=>0); fx.prepare(renderer);
// Each frame: fx.update(dt); fx.render(renderer,scene,camera) REPLACES renderer.render.
// One render call covers every fog field in this scene. No automatic input or animation loop.
// blast(position,direction), stir(position,velocity), setObstacle(position,velocity): WORLD coordinates.
// One moving influence, approximate flow; not physical obstacle collision.
// setTerrain(heightAt): local XZ, +Y up, sampled 256x256 over [-48,48]; resets simulation.
// Flat by default. Terrain and models remain host-owned. Upright uniform scale and yaw supported.
// reset preserves terrain, transform and settings; stop fades in one second; dispose at teardown.
// No support for caves, stacked floors, camera inside fog or arbitrary postprocessing composition.
import * as THREE from "../../../three.min.mjs";
import * as __vfxDependency1 from "./pass.mjs";
var __vfxModule = (function(exports, three, three_addons_postprocessing_Pass_js) {

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

//#region src/effects/interactive-ground-fog-runtime.js
	const noise = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}`;
	const vert = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
	const target = (n) => new three.WebGLRenderTarget(n, n, {
		type: three.HalfFloatType,
		depthBuffer: false,
		minFilter: three.LinearFilter,
		magFilter: three.LinearFilter
	});
	function createSimulation(renderer, terrainTexture, terrainMin, terrainMax) {
		const settings = {
			density: 1,
			strength: 1,
			swirl: 1,
			recovery: 1
		};
		let time = 0, accumulator = 0, counter = 0, disposed = false;
		const blasts = [], drags = [];
		const flow = target(256), a = target(512), b = target(512), height = target(256);
		let read = a, write = b;
		const bs = Array.from({ length: 8 }, () => new three.Vector4()), ds = Array.from({ length: 8 }, () => new three.Vector4()), ss = Array.from({ length: 16 }, () => new three.Vector4());
		const mat = (fragmentShader, uniforms) => new three.ShaderMaterial({
			vertexShader: vert,
			fragmentShader,
			uniforms,
			depthTest: false,
			depthWrite: false
		});
		const flowMat = mat(`varying vec2 vUv;uniform float time,power,spin;uniform vec4 bursts[8],directions[8],drags[16];${noise}
vec3 source(vec2 d,float r,float amount){float q=dot(d,d),g=exp(-q/(r*r));return vec3(d*amount*(1.-g)/max(q,.001),2.*amount*g/(r*r));}
vec2 vortex(vec2 d,float r,float s){return vec2(-d.y,d.x)*s/r*exp(-dot(d,d)/(r*r));}
void main(){vec2 p=(vUv-.5)*96.;float e=.2;vec2 n=p*.11+vec2(time*.015,0);vec2 v=vec2(noise(n+vec2(0,e))-noise(n-vec2(0,e)),noise(n-vec2(e,0))-noise(n+vec2(e,0)))*.8;float div=0.;
for(int i=0;i<8;i++){vec4 b=bursts[i];if(b.w<0.)continue;vec2 f=directions[i].xy,s=vec2(-f.y,f.x);float t=b.w,R=2.4+3.2*(1.-exp(-t*1.5));float push=(exp(-t*3.)-.085*t*exp(1.-t))*power;vec3 u=source(p-b.xy-f*1.4,1.5,18.*push);for(int k=0;k<5;k++){float angle=(float(k)-2.)*.32;vec2 c=b.xy+(f*cos(angle)+s*sin(angle))*R;u+=source(p-c,1.35,-18.*push/5.);}v+=u.xy;div+=u.z;float curl=(1.-exp(-t*12.))*exp(-t/2.8)*spin*9.;v+=vortex(p-(b.xy+f*R*.72+s*R*.58),2.2,curl);v+=vortex(p-(b.xy+f*R*.72-s*R*.58),2.2,-curl);}
for(int i=0;i<16;i++){vec2 d=p-drags[i].xy,w=drags[i].zw;float g=exp(-dot(d,d)/3.);float c=w.x*d.y-w.y*d.x;v+=g*(w+2.*c/3.*vec2(-d.y,d.x));}
float edge=smoothstep(0.,.04,min(min(vUv.x,vUv.y),min(1.-vUv.x,1.-vUv.y)));gl_FragColor=vec4(v*edge,div,1.);}`, {
			time: { value: 0 },
			power: { value: 1 },
			spin: { value: 1 },
			bursts: { value: bs },
			directions: { value: ds },
			drags: { value: ss }
		});
		const advect = mat(`varying vec2 vUv;uniform sampler2D previous,flow;uniform float dt,recovery;uniform vec4 obstacle;void main(){vec3 v=texture2D(flow,vUv).xyz;vec4 q=texture2D(previous,clamp(vUv-v.xy*dt/96.,.001,.999));q.xy=(q.xy-v.xy*dt)*exp(-dt*.09);q.z=clamp(q.z*exp(-v.z*dt),.03,2.2);q.z=mix(1.,q.z,exp(-dt*.18*recovery));vec2 world=(vUv-.5)*96.;float swept=exp(-dot(world-obstacle.xy,world-obstacle.xy)/.65)*smoothstep(.1,1.,length(obstacle.zw));q.z=mix(q.z,.04,1.-exp(-swept*dt*12.));q.w=mix(q.w,clamp(length(v.xy)*.2,0.,1.),1.-exp(-dt*3.));gl_FragColor=q;}`, {
			previous: { value: null },
			flow: { value: flow.texture },
			dt: { value: 1 / 30 },
			recovery: { value: 1 },
			obstacle: { value: new three.Vector4() }
		});
		const hm = mat(`varying vec2 vUv;uniform sampler2D fog,terrainData;uniform float time;${noise}void main(){vec4 q=texture2D(fog,vUv)*.4;vec2 e=vec2(1./256.,0);q+=(texture2D(fog,vUv+e)+texture2D(fog,vUv-e)+texture2D(fog,vUv+e.yx)+texture2D(fog,vUv-e.yx))*.15;vec2 p=(vUv-.5)*96.;float ground=texture2D(terrainData,vUv).r;float n=noise((p+q.xy)*.18+vec2(time*.025,0));float base=(.5+1.2*n)*mix(1.,.65,smoothstep(-.4,.8,ground));float wisps=.4+.6*noise((p+q.xy)*.38+vec2(time*.025,0));gl_FragColor=vec4(base*clamp(q.z,.12,1.3),base,ground,wisps);}`, {
			fog: { value: read.texture },
			terrainData: { value: terrainTexture },
			time: { value: 0 }
		});
		const fill = mat("uniform vec4 value;void main(){gl_FragColor=value;}", { value: { value: new three.Vector4(0, 0, 1, 0) } });
		const quad = new three_addons_postprocessing_Pass_js.FullScreenQuad(fill);
		function pass(material, rt) {
			withRendererState(renderer, () => {
				quad.material = material;
				renderer.xr.enabled = false;
				renderer.setScissorTest(false);
				renderer.autoClear = true;
				renderer.setRenderTarget(rt);
				quad.render(renderer);
			});
		}
		const group = new three.Group(), geometry = new three.PlaneGeometry(2, 2);
		const material = new three.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			depthTest: false,
			uniforms: {
				height: { value: height.texture },
				fog: { value: read.texture },
				time: { value: 0 },
				density: { value: 1 },
				opaqueDepth: { value: null },
				screenSize: { value: new three.Vector2(1920, 1080) },
				inverseProjection: { value: new three.Matrix4() },
				cameraWorld: { value: new three.Matrix4() },
				worldToLocal: { value: new three.Matrix4() },
				slab: { value: new three.Vector2(terrainMin - .1, terrainMax + 2.4) },
				opacity: { value: 1 }
			},
			vertexShader: vert,
			fragmentShader: `varying vec2 vUv;uniform sampler2D height,fog,opaqueDepth;uniform float density,opacity;uniform vec2 slab;uniform mat4 inverseProjection,cameraWorld,worldToLocal;
void main(){vec4 clip=inverseProjection*vec4(vUv*2.-1.,1.,1.);vec3 eye=(worldToLocal*cameraWorld*vec4(0,0,0,1)).xyz;vec3 ray=normalize(mat3(worldToLocal*cameraWorld)*(clip.xyz/clip.w));float d=texture2D(opaqueDepth,vUv).r;vec4 hit=inverseProjection*vec4(vUv*2.-1.,d*2.-1.,1.);vec3 localHit=(worldToLocal*cameraWorld*vec4(hit.xyz/hit.w,1.)).xyz;float stop=length(localHit-eye);float dy=abs(ray.y)<.0001?-.0001:ray.y;float ta=(slab.x-eye.y)/dy,tb=(slab.y-eye.y)/dy;float nearT=max(0.,min(ta,tb)),farT=min(stop,max(ta,tb));if(farT<=nearT){gl_FragColor=vec4(0);return;}float stride=(farT-nearT)/24.;float optical=0.;vec3 total=vec3(0.);float jitter=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
for(int i=0;i<24;i++){vec3 p=eye+ray*(nearT+(float(i)+jitter)*stride);vec2 uv=p.xz/96.+.5;vec4 h=texture2D(height,uv);vec4 f=texture2D(fog,uv);float elevation=p.y-h.z;float profile=(1.-smoothstep(0.,max(h.x,.04),elevation))*smoothstep(-.06,.04,elevation);float edge=smoothstep(0.,.06,min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)));float amount=profile*edge*h.w*clamp(f.z,.03,1.25)*density*opacity*.72*stride;float a=1.-exp(-amount);float light=clamp(elevation/max(h.x,.1),0.,1.);vec3 color=mix(vec3(.38,.36,.43),vec3(.72,.69,.78),.35+light*.45);total+=(1.-optical)*a*color;optical+=(1.-optical)*a;if(optical>.98)break;}
gl_FragColor=vec4(total/max(optical,.00001),optical);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`
		});
		const materials = [material];
		const mesh = new three.Mesh(geometry, material);
		mesh.frustumCulled = false;
		mesh.renderOrder = 10;
		mesh.onBeforeRender = (r, s, c) => {
			material.uniforms.inverseProjection.value.copy(c.projectionMatrixInverse);
			material.uniforms.cameraWorld.value.copy(c.matrixWorld);
			material.uniforms.worldToLocal.value.copy(group.matrixWorld).invert();
		};
		group.add(mesh);
		function reset() {
			advect.uniforms.obstacle.value.set(0, 0, 0, 0);
			time = 0;
			accumulator = 0;
			counter = 0;
			blasts.length = 0;
			drags.length = 0;
			fill.uniforms.value.value.set(0, 0, 1, 0);
			pass(fill, a);
			pass(fill, b);
			fill.uniforms.value.value.set(0, 0, 0, 0);
			pass(fill, flow);
			read = a;
			write = b;
			hm.uniforms.fog.value = read.texture;
			hm.uniforms.time.value = 0;
			pass(hm, height);
			for (const m of materials) {
				m.uniforms.time.value = 0;
				m.uniforms.fog.value = read.texture;
				m.uniforms.density.value = settings.density;
			}
		}
		function update(dt) {
			if (disposed) return;
			accumulator += Math.min(Math.max(dt, 0), .067);
			while (accumulator >= 1 / 30 - 1e-9) {
				accumulator = Math.max(0, accumulator - 1 / 30);
				time += 1 / 30;
				for (let i = blasts.length - 1; i >= 0; i--) if (time - blasts[i].born > 18) blasts.splice(i, 1);
				for (let i = drags.length - 1; i >= 0; i--) if (time - drags[i].born > 2) drags.splice(i, 1);
				for (let i = 0; i < 8; i++) {
					const b = blasts[i];
					bs[i].set(b?.x ?? 0, b?.z ?? 0, 0, b ? time - b.born : -1);
					ds[i].set(b?.dx ?? 0, b?.dz ?? 1, 0, 0);
				}
				for (let i = 0; i < 16; i++) {
					const d = drags[i], fade = d ? Math.exp(-(time - d.born) * 4) : 0;
					ss[i].set(d?.x ?? 0, d?.z ?? 0, (d?.vx ?? 0) * fade, (d?.vz ?? 0) * fade);
				}
				flowMat.uniforms.time.value = time;
				flowMat.uniforms.power.value = settings.strength;
				flowMat.uniforms.spin.value = settings.swirl;
				pass(flowMat, flow);
				advect.uniforms.previous.value = read.texture;
				advect.uniforms.recovery.value = settings.recovery;
				pass(advect, write);
				[read, write] = [write, read];
				hm.uniforms.fog.value = read.texture;
				hm.uniforms.time.value = time;
				pass(hm, height);
			}
			for (const m of materials) {
				m.uniforms.fog.value = read.texture;
				m.uniforms.time.value = time;
				m.uniforms.density.value = settings.density;
			}
		}
		reset();
		return {
			group,
			settings,
			update,
			reset,
			setOpacity(value) {
				material.uniforms.opacity.value = value;
			},
			setTerrain(texture, min, max) {
				hm.uniforms.terrainData.value = texture;
				material.uniforms.slab.value.set(min - .1, max + 2.4);
				reset();
			},
			setObstacle(x, z, vx, vz) {
				advect.uniforms.obstacle.value.set(x, z, vx, vz);
			},
			setDepth(texture, w, h) {
				for (const m of materials) {
					m.uniforms.opaqueDepth.value = texture;
					m.uniforms.screenSize.value.set(w, h);
				}
			},
			get time() {
				return time;
			},
			get counts() {
				return {
					blasts: blasts.length,
					drags: drags.length,
					events: counter
				};
			},
			blast(p, d) {
				if (disposed) return;
				const l = Math.hypot(d.x, d.z);
				if (l < .001) return;
				blasts.push({
					x: p.x,
					z: p.z,
					dx: d.x / l,
					dz: d.z / l,
					born: time
				});
				if (blasts.length > 8) blasts.shift();
				counter++;
			},
			stir(p, v, gain = 1) {
				if (disposed) return;
				gain = Number.isFinite(gain) ? three.MathUtils.clamp(gain, 0, 5) : 1;
				const last = drags.at(-1), d = {
					x: p.x,
					z: p.z,
					vx: three.MathUtils.clamp(v.x, -6, 6) * gain,
					vz: three.MathUtils.clamp(v.z, -6, 6) * gain,
					born: time
				};
				if (last && time - last.born < 1 / 30) Object.assign(last, d);
				else drags.push(d);
				if (drags.length > 16) drags.shift();
			},
			dispose() {
				if (disposed) return;
				disposed = true;
				group.removeFromParent();
				geometry.dispose();
				for (const m of materials) m.dispose();
				for (const t of [
					flow,
					a,
					b,
					height
				]) t.dispose();
				for (const m of [
					flowMat,
					advect,
					hm,
					fill
				]) m.dispose();
				quad.dispose();
				blasts.length = drags.length = 0;
			}
		};
	}
	function withRendererState(r, run) {
		const target = r.getRenderTarget(), face = r.getActiveCubeFace(), mip = r.getActiveMipmapLevel();
		const viewport = r.getViewport(new three.Vector4()), scissor = r.getScissor(new three.Vector4()), test = r.getScissorTest(), auto = r.autoClear, xr = r.xr.enabled;
		try {
			return run();
		} finally {
			r.setRenderTarget(target, face, mip);
			r.setViewport(viewport);
			r.setScissor(scissor);
			r.setScissorTest(test);
			r.autoClear = auto;
			r.xr.enabled = xr;
		}
	}
	const pipelines = /* @__PURE__ */ new WeakMap();
	function terrainData(heightAt) {
		const n = 256, data = new Float32Array(n * n * 4);
		let min = Infinity, max = -Infinity;
		for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
			const h = heightAt(((x + .5) / n - .5) * 96, ((y + .5) / n - .5) * 96);
			if (!Number.isFinite(h)) throw new TypeError("Terrain height must be finite");
			data[(y * n + x) * 4] = h;
			min = Math.min(min, h);
			max = Math.max(max, h);
		}
		const texture = new three.DataTexture(data, n, n, three.RGBAFormat, three.FloatType);
		texture.minFilter = texture.magFilter = three.LinearFilter;
		texture.needsUpdate = true;
		return {
			texture,
			min,
			max
		};
	}
	const groundFogDefaults = {
		density: 1,
		strength: 1,
		swirl: 1,
		recovery: 1
	};
	function createInteractiveGroundFog(options = {}) {
		const group = new three.Group();
		group.name = "interactive-ground-fog";
		const settings = { ...groundFogDefaults };
		let core = null, renderer = null, terrain = terrainData(() => 0), disposed = false, ending = false, endAge = 0;
		const ownedPipelines = /* @__PURE__ */ new Set(), local = new three.Vector3(), vector = new three.Vector3(), inverse = new three.Matrix4(), worldPosition = new three.Vector3(), worldRotation = new three.Quaternion(), worldScale = new three.Vector3(), up = new three.Vector3(), inverseRotation = new three.Quaternion();
		function alive() {
			if (disposed) throw Error("Ground fog is disposed");
		}
		function prepared() {
			alive();
			if (!core) throw Error("Call fog.prepare(renderer) before update or interaction");
		}
		function transform() {
			group.updateWorldMatrix(true, false);
			group.matrixWorld.decompose(worldPosition, worldRotation, worldScale);
			up.set(0, 1, 0).applyQuaternion(worldRotation);
			if (worldScale.x <= 0 || Math.abs(worldScale.x - worldScale.y) > 1e-5 || Math.abs(worldScale.x - worldScale.z) > 1e-5 || Math.abs(up.x) + Math.abs(up.y - 1) + Math.abs(up.z) > 1e-5) throw Error("Ground fog requires upright, positive uniform scale");
			inverse.copy(group.matrixWorld).invert();
		}
		function point(p) {
			if (![
				p?.x,
				p?.y ?? 0,
				p?.z
			].every(Number.isFinite)) throw TypeError("A finite world position is required");
			return local.set(p.x, p.y ?? 0, p.z).applyMatrix4(inverse);
		}
		function velocity(v) {
			if (![
				v?.x,
				v?.y ?? 0,
				v?.z
			].every(Number.isFinite)) throw TypeError("A finite world direction/velocity is required");
			return vector.set(v.x, v.y ?? 0, v.z).applyQuaternion(inverseRotation.copy(worldRotation).invert()).divideScalar(worldScale.x);
		}
		const api = {
			group,
			settings,
			lifecycle: {
				start: 0,
				end: 1
			},
			get phase() {
				return endAge >= 1 ? "finished" : ending ? "ending" : "active";
			},
			get finished() {
				return endAge >= 1;
			},
			get elapsed() {
				return core?.time ?? 0;
			},
			get particleCount() {
				return 0;
			},
			get count() {
				return 0;
			},
			get counts() {
				return core?.counts ?? {
					events: 0,
					blasts: 0,
					drags: 0
				};
			},
			get prepared() {
				return !!core;
			},
			prepare(r) {
				alive();
				if (core) {
					if (renderer !== r) throw Error("A fog instance belongs to one renderer");
					return;
				}
				if (!r.capabilities.isWebGL2 && !r.getContext().texStorage2D) throw Error("WebGL2 required");
				if (!r.extensions.has("EXT_color_buffer_float")) throw Error("Floating-point render targets unavailable");
				renderer = r;
				core = createSimulation(r, terrain.texture, terrain.min, terrain.max);
				Object.assign(core.settings, settings);
				core.update(0);
				group.add(core.group);
				core.setOpacity(ending ? 1 - endAge : 1);
			},
			update(dt) {
				if (disposed) return;
				prepared();
				if (!Number.isFinite(dt) || dt < 0) throw RangeError("Non-negative finite delta required");
				if (api.finished) return;
				transform();
				const delta = Math.min(dt, .067);
				core.update(delta);
				if (ending) {
					endAge = Math.min(1, endAge + delta);
					core.setOpacity(1 - endAge);
					if (endAge >= 1) group.visible = false;
				}
			},
			reset() {
				alive();
				group.visible = true;
				ending = false;
				endAge = 0;
				if (core) {
					core.reset();
					core.setOpacity(1);
				}
			},
			stop() {
				alive();
				ending = true;
				core?.setObstacle(0, 0, 0, 0);
			},
			hit() {
				api.stop();
			},
			setOptions(next = {}) {
				alive();
				for (const [key, min, max] of [
					[
						"density",
						.3,
						2
					],
					[
						"strength",
						.3,
						2
					],
					[
						"swirl",
						0,
						2
					],
					[
						"recovery",
						.5,
						2
					]
				]) if (Number.isFinite(next[key])) settings[key] = Math.min(max, Math.max(min, next[key]));
				if (core) {
					Object.assign(core.settings, settings);
					core.update(0);
				}
			},
			setTerrain(fn) {
				alive();
				if (typeof fn !== "function") throw TypeError("heightAt(x,z) function required");
				const next = terrainData(fn), previous = terrain;
				terrain = next;
				core?.setTerrain(next.texture, next.min, next.max);
				previous.texture.dispose();
				api.reset();
			},
			blast(p, d) {
				prepared();
				if (ending) return;
				transform();
				core.blast(point(p), velocity(d));
			},
			stir(p, v, gain = 1) {
				prepared();
				if (ending) return;
				transform();
				core.stir(point(p), velocity(v), gain);
			},
			setObstacle(p, v) {
				prepared();
				if (ending) return;
				transform();
				const a = point(p), b = velocity(v);
				core.setObstacle(a.x, a.z, b.x, b.z);
			},
			render(r, scene, camera) {
				prepared();
				if (r !== renderer) throw Error("Use the prepared renderer");
				let byScene = pipelines.get(r);
				if (!byScene) {
					byScene = /* @__PURE__ */ new Map();
					pipelines.set(r, byScene);
				}
				let pipeline = byScene.get(scene);
				if (!pipeline) {
					const target = new three.WebGLRenderTarget(1, 1);
					target.depthTexture = new three.DepthTexture(1, 1);
					pipeline = {
						target,
						owners: /* @__PURE__ */ new Set(),
						scene,
						byScene
					};
					byScene.set(scene, pipeline);
				}
				const all = [];
				scene.traverse((o) => {
					const effect = o.userData.interactiveGroundFog;
					if (effect) {
						all.push(effect);
						pipeline.owners.add(effect);
						effect._pipelines.add(pipeline);
						effect.prepare(r);
					}
				});
				const viewport = r.getCurrentViewport(new three.Vector4()), w = Math.max(1, Math.round(viewport.z)), h = Math.max(1, Math.round(viewport.w));
				if (pipeline.target.width !== w || pipeline.target.height !== h) pipeline.target.setSize(w, h);
				const visibility = all.map((f) => [f.group, f.group.visible]);
				try {
					withRendererState(r, () => {
						for (const [root] of visibility) root.visible = false;
						r.xr.enabled = false;
						r.autoClear = true;
						r.setScissorTest(false);
						r.setRenderTarget(pipeline.target);
						r.render(scene, camera);
					});
				} finally {
					for (const [root, visible] of visibility) root.visible = visible;
				}
				for (const f of all) f._setDepth(pipeline.target.depthTexture, w, h);
				r.render(scene, camera);
			},
			_pipelines: ownedPipelines,
			_setDepth(texture, w, h) {
				core.setDepth(texture, w, h);
			},
			dispose() {
				if (disposed) return;
				core?.dispose();
				terrain.texture.dispose();
				group.removeFromParent();
				delete group.userData.interactiveGroundFog;
				for (const p of ownedPipelines) {
					p.owners.delete(api);
					if (!p.owners.size) {
						p.target.dispose();
						p.byScene.delete(p.scene);
					}
				}
				ownedPipelines.clear();
				disposed = true;
			}
		};
		group.userData.interactiveGroundFog = api;
		api.setOptions(options);
		return api;
	}

//#endregion
exports.createInteractiveGroundFog = createInteractiveGroundFog;
exports.groundFogDefaults = groundFogDefaults;
return exports;
})({}, THREE, __vfxDependency1);
const createInteractiveGroundFog = __vfxModule.createInteractiveGroundFog;
const groundFogDefaults = __vfxModule.groundFogDefaults;

export const defaultOptions={"density":1,"strength":1,"swirl":1,"recovery":1};
export default function createVFX(options={}){return createInteractiveGroundFog({...defaultOptions,...options});}
