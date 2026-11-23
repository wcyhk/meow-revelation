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
//#region src/effects/vendor/MeshSurfaceSampler.js
	const _face = new three.Triangle();
	const _color = new three.Vector3();
	const _uva = new three.Vector2();
	const _uvb = new three.Vector2();
	const _uvc = new three.Vector2();
	/**
	* Utility class for sampling weighted random points on the surface of a mesh.
	*
	* Building the sampler is a one-time O(n) operation. Once built, any number of
	* random samples may be selected in O(logn) time. Memory usage is O(n).
	*
	* References:
	* - {@link http://www.joesfer.com/?p=84}
	* - {@link https://stackoverflow.com/a/4322940/1314762}
	*
	* ```js
	* const sampler = new MeshSurfaceSampler( surfaceMesh )
	* 	.setWeightAttribute( 'color' )
	* 	.build();
	*
	* const mesh = new THREE.InstancedMesh( sampleGeometry, sampleMaterial, 100 );
	*
	* const position = new THREE.Vector3();
	* const matrix = new THREE.Matrix4();
	*
	* // Sample randomly from the surface, creating an instance of the sample geometry at each sample point.
	*
	* for ( let i = 0; i < 100; i ++ ) {
	*
	* 	sampler.sample( position );
	* 	matrix.makeTranslation( position.x, position.y, position.z );
	* 	mesh.setMatrixAt( i, matrix );
	*
	* }
	*
	* scene.add( mesh );
	* ```
	*
	* @three_import import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
	*/
	var MeshSurfaceSampler = class {
		/**
		* Constructs a mesh surface sampler.
		*
		* @param {Mesh} mesh - Surface mesh from which to sample.
		*/
		constructor(mesh) {
			this.geometry = mesh.geometry;
			this.randomFunction = Math.random;
			this.indexAttribute = this.geometry.index;
			this.positionAttribute = this.geometry.getAttribute("position");
			this.normalAttribute = this.geometry.getAttribute("normal");
			this.colorAttribute = this.geometry.getAttribute("color");
			this.uvAttribute = this.geometry.getAttribute("uv");
			this.weightAttribute = null;
			this.distribution = null;
		}
		/**
		* Specifies a vertex attribute to be used as a weight when sampling from the surface.
		* Faces with higher weights are more likely to be sampled, and those with weights of
		* zero will not be sampled at all. For vector attributes, only .x is used in sampling.
		*
		* If no weight attribute is selected, sampling is randomly distributed by area.
		*
		* @param {string} name - The attribute name.
		* @return {MeshSurfaceSampler} A reference to this sampler.
		*/
		setWeightAttribute(name) {
			this.weightAttribute = name ? this.geometry.getAttribute(name) : null;
			return this;
		}
		/**
		* Processes the input geometry and prepares to return samples. Any configuration of the
		* geometry or sampler must occur before this method is called. Time complexity is O(n)
		* for a surface with n faces.
		*
		* @return {MeshSurfaceSampler} A reference to this sampler.
		*/
		build() {
			const indexAttribute = this.indexAttribute;
			const positionAttribute = this.positionAttribute;
			const weightAttribute = this.weightAttribute;
			const totalFaces = indexAttribute ? indexAttribute.count / 3 : positionAttribute.count / 3;
			const faceWeights = new Float32Array(totalFaces);
			for (let i = 0; i < totalFaces; i++) {
				let faceWeight = 1;
				let i0 = 3 * i;
				let i1 = 3 * i + 1;
				let i2 = 3 * i + 2;
				if (indexAttribute) {
					i0 = indexAttribute.getX(i0);
					i1 = indexAttribute.getX(i1);
					i2 = indexAttribute.getX(i2);
				}
				if (weightAttribute) faceWeight = weightAttribute.getX(i0) + weightAttribute.getX(i1) + weightAttribute.getX(i2);
				_face.a.fromBufferAttribute(positionAttribute, i0);
				_face.b.fromBufferAttribute(positionAttribute, i1);
				_face.c.fromBufferAttribute(positionAttribute, i2);
				faceWeight *= _face.getArea();
				faceWeights[i] = faceWeight;
			}
			const distribution = new Float32Array(totalFaces);
			let cumulativeTotal = 0;
			for (let i = 0; i < totalFaces; i++) {
				cumulativeTotal += faceWeights[i];
				distribution[i] = cumulativeTotal;
			}
			this.distribution = distribution;
			return this;
		}
		/**
		* Allows to set a custom random number generator. Default is `Math.random()`.
		*
		* @param {Function} randomFunction - A random number generator.
		* @return {MeshSurfaceSampler} A reference to this sampler.
		*/
		setRandomGenerator(randomFunction) {
			this.randomFunction = randomFunction;
			return this;
		}
		/**
		* Selects a random point on the surface of the input geometry, returning the
		* position and optionally the normal vector, color and UV Coordinate at that point.
		* Time complexity is O(log n) for a surface with n faces.
		*
		* @param {Vector3} targetPosition - The target object holding the sampled position.
		* @param {Vector3} targetNormal - The target object holding the sampled normal.
		* @param {Color} targetColor - The target object holding the sampled color.
		* @param {Vector2} targetUV -  The target object holding the sampled uv coordinates.
		* @return {MeshSurfaceSampler} A reference to this sampler.
		*/
		sample(targetPosition, targetNormal, targetColor, targetUV) {
			const faceIndex = this._sampleFaceIndex();
			return this._sampleFace(faceIndex, targetPosition, targetNormal, targetColor, targetUV);
		}
		_sampleFaceIndex() {
			const cumulativeTotal = this.distribution[this.distribution.length - 1];
			return this._binarySearch(this.randomFunction() * cumulativeTotal);
		}
		_binarySearch(x) {
			const dist = this.distribution;
			let start = 0;
			let end = dist.length - 1;
			let index = -1;
			while (start <= end) {
				const mid = Math.ceil((start + end) / 2);
				if (mid === 0 || dist[mid - 1] <= x && dist[mid] > x) {
					index = mid;
					break;
				} else if (x < dist[mid]) end = mid - 1;
				else start = mid + 1;
			}
			return index;
		}
		_sampleFace(faceIndex, targetPosition, targetNormal, targetColor, targetUV) {
			let u = this.randomFunction();
			let v = this.randomFunction();
			if (u + v > 1) {
				u = 1 - u;
				v = 1 - v;
			}
			const indexAttribute = this.indexAttribute;
			let i0 = faceIndex * 3;
			let i1 = faceIndex * 3 + 1;
			let i2 = faceIndex * 3 + 2;
			if (indexAttribute) {
				i0 = indexAttribute.getX(i0);
				i1 = indexAttribute.getX(i1);
				i2 = indexAttribute.getX(i2);
			}
			_face.a.fromBufferAttribute(this.positionAttribute, i0);
			_face.b.fromBufferAttribute(this.positionAttribute, i1);
			_face.c.fromBufferAttribute(this.positionAttribute, i2);
			targetPosition.set(0, 0, 0).addScaledVector(_face.a, u).addScaledVector(_face.b, v).addScaledVector(_face.c, 1 - (u + v));
			if (targetNormal !== void 0) {
				if (this.normalAttribute !== void 0) {
					_face.a.fromBufferAttribute(this.normalAttribute, i0);
					_face.b.fromBufferAttribute(this.normalAttribute, i1);
					_face.c.fromBufferAttribute(this.normalAttribute, i2);
					targetNormal.set(0, 0, 0).addScaledVector(_face.a, u).addScaledVector(_face.b, v).addScaledVector(_face.c, 1 - (u + v)).normalize();
				} else _face.getNormal(targetNormal);
			}
			if (targetColor !== void 0 && this.colorAttribute !== void 0) {
				_face.a.fromBufferAttribute(this.colorAttribute, i0);
				_face.b.fromBufferAttribute(this.colorAttribute, i1);
				_face.c.fromBufferAttribute(this.colorAttribute, i2);
				_color.set(0, 0, 0).addScaledVector(_face.a, u).addScaledVector(_face.b, v).addScaledVector(_face.c, 1 - (u + v));
				targetColor.r = _color.x;
				targetColor.g = _color.y;
				targetColor.b = _color.z;
			}
			if (targetUV !== void 0 && this.uvAttribute !== void 0) {
				_uva.fromBufferAttribute(this.uvAttribute, i0);
				_uvb.fromBufferAttribute(this.uvAttribute, i1);
				_uvc.fromBufferAttribute(this.uvAttribute, i2);
				targetUV.set(0, 0).addScaledVector(_uva, u).addScaledVector(_uvb, v).addScaledVector(_uvc, 1 - (u + v));
			}
			return this;
		}
	};

//#endregion
//#region src/effects/starblade-cataclysm-runtime.js
	const starbladeFlightRegistries = /* @__PURE__ */ new WeakMap();
	const starbladeStages = Object.freeze({
		dissolve: .45,
		scatter: 1.8,
		orbit: 3.5,
		converge: 5.5,
		petals: 6.5,
		windStart: 7.65,
		windEnd: 8.3,
		cross: 10.3,
		crossBody: 10.34,
		crossBodyEnd: 10.54,
		flashEnd: 11.1,
		charge: 11.1,
		fire: 13.1,
		contact: 13.18,
		thinStart: 13.23,
		thinEnd: 13.45,
		sweepEnd: 17.7,
		airExit: 19.12,
		airEnd: 20.12,
		end: 21
	});
	const starbladeLayers = Object.freeze([
		"dissolve-edge",
		"cross-stars",
		"stream-trails",
		"petal-membranes",
		"red-cross",
		"charge-orb",
		"air-arcs",
		"beam",
		"impact-flash",
		"ground-waves",
		"debris",
		"rift-walls",
		"lava",
		"branch-cracks",
		"flames",
		"smoke"
	]);
	function createStarbladeEffect(T, spec, options = {}) {
		const group = new T.Group(), root = new T.Group(), aerial = new T.Group(), ground = new T.Group(), sword = new T.Group();
		group.name = spec.id;
		root.name = "starblade-root";
		aerial.name = "starblade-aerial";
		ground.name = "starblade-ground";
		sword.name = "starblade-sword";
		group.add(root);
		root.add(aerial, ground, sword);
		const coreHeight = 12;
		aerial.position.set(0, coreHeight, 0);
		const aerialScale = 2;
		aerial.scale.setScalar(aerialScale);
		const crossTiming = {
			start: starbladeStages.cross,
			white: .16,
			tail: .8
		};
		const extraAliases = {
			"core-inflow": "charge-orb",
			"burst-filaments": "red-cross",
			"pressure-wave": "air-arcs",
			"petal-flakes": "petal-membranes",
			"ground-dust": "smoke",
			"molten-drops": "lava",
			"contact-sparks": "impact-flash"
		};
		group.userData.starbladeLayerTypes = {
			air: [
				"cross-stars",
				"petal-membranes",
				"charge-orb",
				"red-cross",
				"red-cross-flash",
				"air-arcs",
				"core-inflow",
				"burst-filaments",
				"pressure-wave",
				"petal-flakes"
			],
			ground: [
				"ground-waves",
				"debris",
				"rift-walls",
				"lava",
				"branch-cracks",
				"flames",
				"smoke",
				"ground-dust",
				"molten-drops",
				"contact-sparks"
			]
		};
		const extraParticleCount = 1168;
		const flashCount = 2048, burstSupportCount = 2112;
		const groundBlastTimes = Array.from({ length: 6 }, (_, i) => Number((starbladeStages.sweepEnd + .02 + .16 * i).toFixed(2)));
		const groundBlastScale = 2, beamEndpointCount = 528, beamEndpointObjects = [];
		const groundBlastSpecs = [
			[
				"flash",
				1,
				0,
				.22,
				"impact-flash"
			],
			[
				"body",
				640,
				0,
				2.15,
				"impact-flash"
			],
			[
				"needles",
				160,
				0,
				.45,
				"impact-flash"
			],
			[
				"arcs",
				128,
				.03,
				.7,
				"ground-waves"
			],
			[
				"wave",
				1,
				0,
				.45,
				"ground-waves"
			],
			[
				"electric",
				128,
				0,
				.4,
				"branch-cracks"
			],
			[
				"rocks",
				48,
				0,
				1.65,
				"debris"
			],
			[
				"rock-dust",
				96,
				.03,
				1.3,
				"smoke"
			],
			[
				"drops",
				128,
				.06,
				1.25,
				"lava"
			],
			[
				"sheets",
				128,
				.05,
				.75,
				"lava"
			],
			[
				"dust",
				96,
				.04,
				1.1,
				"smoke"
			],
			[
				"smoke",
				128,
				.1,
				2.15,
				"smoke"
			],
			[
				"flames",
				96,
				.1,
				1.65,
				"flames"
			],
			[
				"cracks",
				96,
				.06,
				2.05,
				"branch-cracks"
			]
		];
		const groundBlastCount = groundBlastSpecs.reduce((n, row) => n + row[1] * 6, 0), groundBlastObjects = [], groundSoftCount = 5184;
		group.userData.starbladeLayerTypes.groundBurst = groundBlastSpecs.map((row) => "ground-burst-" + row[0]);
		for (const row of groundBlastSpecs) extraAliases["ground-burst-" + row[0]] = row[4];
		const burstTypes = [
			"red-cross-flash",
			"burst-pulse",
			"burst-filaments",
			"burst-lightning",
			"pressure-wave",
			"burst-arcs",
			"burst-helix",
			"burst-mist",
			"burst-shards",
			"burst-comets",
			"burst-return",
			"burst-fronts",
			"burst-satellites",
			"burst-fissures"
		];
		group.userData.starbladeLayerTypes.burst = burstTypes;
		const geometries = /* @__PURE__ */ new Set(), materials = /* @__PURE__ */ new Set(), layers = new Map(starbladeLayers.map((k) => [k, []]));
		const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
		const smooth = (a, b, v) => {
			const f = clamp((v - a) / (b - a));
			return f * f * (3 - 2 * f);
		};
		const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
		const cycle = (x) => Math.floor(x) + smooth(0, 1, x - Math.floor(x));
		const rnd = (seed) => {
			let s = seed >>> 0;
			return () => {
				s = Math.imul(s, 1664525) + 1013904223 >>> 0;
				return s / 4294967296;
			};
		};
		const energyScale = 3, starCapacity = 3840 * energyScale;
		const random = rnd(spec.seed ?? 829661), seeds = Float32Array.from({ length: (22090 + groundBlastCount + beamEndpointCount) * 4 }, () => random());
		const muzzle = new T.Vector3();
		const crossAnchor = .392, coreForward = crossAnchor;
		const pathStart = new T.Vector3(2, 0, 0), pathEnd = new T.Vector3(22, 0, 0), core = new T.Vector3(0, coreHeight, 0), target = new T.Vector3(), direction = new T.Vector3(), v = new T.Vector3(), up = new T.Vector3(0, 1, 0), zAxis = new T.Vector3(0, 0, 1), basis = new T.Quaternion(), basisMatrix = new T.Matrix4();
		let time = 0, disposed = false, mounted = null, settings, layerIndex = -1, flightLease = null;
		const flightSamples = 128, flightWidth = 2048;
		const u = {
			uFlightPaths: { value: null },
			uFlightSize: { value: new T.Vector2(2048, 1) },
			uRealTime: { value: 0 },
			uContactState: { value: new T.Vector4() },
			uGroundPhase: { value: 0 },
			uGroundAge: { value: /* @__PURE__ */ new Float32Array(6) },
			uGroundTimes: { value: Float32Array.from(groundBlastTimes) },
			uCoreHeight: { value: coreHeight },
			uCrossAnchor: { value: crossAnchor },
			uTime: { value: 0 },
			uAerialScale: { value: aerialScale },
			uCrossFlash: { value: 0 },
			uColor: { value: new T.Color() },
			uDetail: { value: 1 },
			uFade: { value: 1 },
			uAir: { value: 0 },
			uCrossAlpha: { value: 0 },
			uCrossRetraction: { value: 1 },
			uCrossExpansion: { value: 0 },
			uCoreRed: { value: 0 },
			uCrossAge: { value: 0 },
			uCrossHeat: { value: 0 },
			uCrossTravel: { value: 0 },
			uFlashErosion: { value: -.04 },
			uFlashWidth: { value: 1 },
			uOrb: { value: 0 },
			uBeam: { value: 0 },
			uLength: { value: 10 },
			uSweep: { value: -1 },
			uHeight: { value: 3 },
			uWorldToRoot: { value: new T.Matrix4() },
			uBasis: { value: new T.Matrix3() }
		};
		const common = "uniform float uRealTime;uniform vec4 uContactState;uniform float uGroundPhase;uniform float uGroundAge[6];uniform float uCrossAnchor,uCoreHeight,uTime,uAerialScale,uCrossFlash,uDetail,uFade,uAir,uCrossAlpha,uCrossRetraction,uCrossExpansion,uCoreRed,uCrossAge,uCrossHeat,uCrossTravel,uFlashErosion,uFlashWidth,uOrb,uBeam,uLength,uSweep,uHeight;uniform vec3 uColor;uniform mat3 uBasis;float sat(float a){return clamp(a,0.,1.);}float sm(float a,float b,float x){float t=sat((x-a)/(b-a));return t*t*(3.-2.*t);}float easeOut(float x){return 1.-pow(1.-sat(x),3.);}float cycle(float x){return floor(x)+sm(0.,1.,fract(x));}float motion(float t,float period,float offset){return period*cycle((t+offset)/period)-offset;}uniform float uGroundTimes[6];float blastTime(float f){return uGroundTimes[int(floor(sat(f)*5.+.5))];}float groundTail(float f){return 1.-sm(blastTime(f)+2.15,min(21.,blastTime(f)+2.48),uRealTime);}float contactTime(float f){return 13.18+(0.5-sin(asin(1.-2.*sat(f))/3.))*4.52;}float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,39.425)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}float contactBeamMask(float remaining,float worldScale){float extent=uContactState.y,life=uContactState.z*uBeam;return mix(1.,sm(extent*.30,extent*.88,remaining/max(worldScale,.0001)),life);}float contactBeamEmission(float remaining,float worldScale){return uContactState.z*uBeam*(1.-sm(uContactState.y*.75,uContactState.y*3.,remaining/max(worldScale,.0001)));}";
		const vertex = "varying vec2 vUv;varying vec3 vP,vN;void main(){vUv=uv;vP=position;vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
		const output = "\n#include <colorspace_fragment>\n";
		function mesh(name, g, vs, fs, parent = root, add = false, opaque = false) {
			const m = new T.ShaderMaterial({
				uniforms: u,
				vertexShader: common + vs,
				fragmentShader: common + fs,
				transparent: !opaque,
				depthWrite: opaque,
				side: T.DoubleSide,
				forceSinglePass: true,
				toneMapped: false,
				blending: add ? T.AdditiveBlending : T.NormalBlending
			});
			const o = new T.Mesh(g, m);
			o.name = "starblade-" + name;
			o.frustumCulled = false;
			parent.add(o);
			geometries.add(g);
			materials.add(m);
			const layer = extraAliases[name] ?? name;
			if (layers.has(layer)) layers.get(layer).push(o);
			return o;
		}
		function batchGeometry(base, count, offset = 0) {
			const g = new T.InstancedBufferGeometry();
			g.index = base.index;
			for (const k of Object.keys(base.attributes)) g.setAttribute(k, base.attributes[k]);
			g.setAttribute("aSeed", new T.InstancedBufferAttribute(seeds.slice(offset * 4, (offset + count) * 4), 4));
			g.instanceCount = count;
			base.dispose();
			return g;
		}
		function batch(name, count, vs, fs, parent = root, add = false, offset = 0) {
			return mesh(name, batchGeometry(new T.PlaneGeometry(2, 2), count, offset), "attribute vec4 aSeed;varying vec2 vUv;varying float vAlpha,vAge,vSeed;" + vs, "varying vec2 vUv;varying float vAlpha,vAge,vSeed;" + fs, parent, add);
		}
		const starGeo = batchGeometry(new T.PlaneGeometry(2, 2), starCapacity);
		starGeo.setAttribute("aFormation", new T.InstancedBufferAttribute(new Float32Array(starCapacity), 1));
		starGeo.setAttribute("aOrigin", new T.InstancedBufferAttribute(new Float32Array(starCapacity * 3), 3));
		starGeo.setAttribute("aFlight", new T.InstancedBufferAttribute(Float32Array.from({ length: starCapacity }, (_, i) => i), 1));
		const petalEnvelope = `vec3 petalPoint(vec3 unit,float angle,float t){
    float mt=motion(t,2.3,angle*.31);float f=unit.x*.5+.5;vec3 p=vec3(1.46+unit.x*1.21,unit.y*.76,unit.z*.59);
    float wave=sin(f*11.-mt*2.1+angle)*.055+sin(f*21.+mt*1.3)*.025;
    p.yz*=1.+wave*(.5+uDetail*.5);p.y+=sin(f*3.14159)*sin(mt*1.4+angle+f*6.)*.055;
    p.z+=sin(f*3.14159)*sin(mt*1.1+angle*2.+f*5.)*.07;
    float c=cos(angle),sn=sin(angle);p.xy=mat2(c,sn,-sn,c)*p.xy;
    return mix(unit*.65,p,sm(3.95,5.65,t));
  }`;
		const flightShader = `uniform sampler2D uFlightPaths;uniform vec2 uFlightSize;
    vec3 flightTexel(float id,float sampleIndex){float k=id*128.+clamp(sampleIndex,0.,127.);return texture2D(uFlightPaths,(vec2(mod(k,uFlightSize.x),floor(k/uFlightSize.x))+.5)/uFlightSize).xyz;}
    vec3 flightPoint(float realT,float id,float birth){
      float q=sat((realT-birth)/(6.5-birth))*127.,i=min(126.,floor(q)),f=q-i;
      vec3 b=flightTexel(id,i),c=flightTexel(id,i+1.);
      vec3 a=i<1.?3.*b-3.*c+flightTexel(id,i+2.):flightTexel(id,i-1.);
      vec3 d=i>125.?3.*c-3.*b+a:flightTexel(id,i+2.);
      float k=id*128.;float speed=texture2D(uFlightPaths,(vec2(mod(k,uFlightSize.x),floor(k/uFlightSize.x))+.5)/uFlightSize).w;
      float stepLength=speed*(6.5-birth)/127.;vec3 m0=normalize(c-a)*stepLength,m1=normalize(d-b)*stepLength;
      return b*(2.*f*f*f-3.*f*f+1.)+m0*(f*f*f-2.*f*f+f)+c*(-2.*f*f*f+3.*f*f)+m1*(f*f*f-f*f);
    }`;
		const stars = mesh("cross-stars", starGeo, `attribute vec4 aSeed;attribute vec3 aOrigin;attribute float aFormation,aFlight;varying vec2 vUv;varying float vAlpha;` + (petalEnvelope + flightShader + `vec3 starShape(float t,vec4 s){
    float angle=floor(s.x*4.)*1.5707963+.785398;
    float x=s.y*2.-1.,theta=s.z*6.283185,r=sqrt(-log(max(.015,s.w)))*.59;
    vec3 unit=vec3(x,cos(theta)*sqrt(1.-x*x),sin(theta)*sqrt(1.-x*x))*r;
    vec3 shape=petalPoint(unit,angle,t);
    float hub=1.-step(.20,fract(s.x*4.));shape=mix(shape,unit*.70,hub*sm(4.15,4.75,t));
    float feed=step(.91,s.w)*sm(9.1,9.35,t)*(1.-sm(10.96,11.1,t));
    float flow=fract((t-9.1)*1.35+s.z*5.);shape=mix(shape,vec3(0.,0.,uCrossAnchor),sm(0.,1.,flow)*feed);
    return uBasis*(shape*uAerialScale)+vec3(0.,uCoreHeight,0.);
  }
  vec3 starPosition(float t,vec3 origin,vec4 s,float id){
    float birth=.45+(1.-sat((origin.y-.25)/uHeight))*1.3;
    vec3 p=flightPoint(uRealTime,id,birth);
    if(uRealTime>6.5){
      p=starShape(t,s);
      // Hermite correction matches both position and velocity at arrival, then
      // hands over to the existing petal motion without a stop or a second gather.
      float dt=uRealTime-6.5,q=sat(dt/.4);
      vec3 end=flightTexel(id,127.),velocity=(flightPoint(6.5,id,birth)-flightPoint(6.4999,id,birth))/.0001;
      vec3 shapeStart=starShape(4.5,s),shapeVelocity=(starShape(4.501,s)-starShape(4.499,s))/.002;
      p+=(end-shapeStart)*(1.-sm(0.,1.,q))+(velocity-shapeVelocity)*dt*(1.-q)*(1.-q);
    }
    float release=sm(19.12+s.z*.10,20.05,uRealTime);
    p+=(p-vec3(0.,uCoreHeight,0.))*release*(.35+s.y*.35)+vec3(0.,release*.55*uAerialScale,0.);
    return p;
  }`) + `
    void main(){vUv=uv*2.-1.;float birth=.45+(1.-sat((aOrigin.y-.25)/uHeight))*1.3;
      float born=sm(birth,birth+.035,uTime),end=1.-sm(19.22+aSeed.w*.10,20.12,uRealTime);
      float feed=step(.91,aSeed.w)*sm(9.1,9.35,uTime)*(1.-sm(10.96,11.1,uTime));
      float flow=fract((uTime-9.1)*1.35+aSeed.z*5.);
      vAlpha=born*end*(.52+aSeed.z*.35)*(1.+exp(-max(0.,uTime-birth)*10.)*.3);
      vAlpha*=mix(1.,sin(flow*3.14159),feed)*mix(1.,sm(3.3,5.5,uRealTime),aFormation);
      vec3 p=starPosition(uTime,aOrigin,aSeed,aFlight);
      float radius=mix(.023+aSeed.y*.016,.055+aSeed.y*.035,step(.73,aSeed.z));
      radius=mix(radius,.115+aSeed.y*.09,step(.975,aSeed.z));
      radius*=mix(1.,uAerialScale,sm(3.5,4.4,uTime));
      float turn=aSeed.z*6.28+motion(uTime,2.1,aSeed.z*2.1)*(aSeed.w-.5);mat2 rot=mat2(cos(turn),-sin(turn),sin(turn),cos(turn));
      vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=rot*position.xy*radius*length(modelViewMatrix[0].xyz);
      gl_Position=projectionMatrix*mv;
    }`, "varying vec2 vUv;varying float vAlpha;void main(){vec2 q=abs(vUv);float cross=pow(max(0.,1.-pow(q.x,.45)-pow(q.y,.45)),.4);float center=exp(-dot(vUv,vUv)*45.);float glow=exp(-dot(vUv,vUv)*5.)*.14;float a=(cross*.85+center+glow)*vAlpha;if(a<.003)discard;gl_FragColor=vec4(mix(mix(uColor,vec3(1.,.92,.52),.12),vec3(1.,.98,.8),center*.7),a);\n#include <colorspace_fragment>\n}", root, false);
		const formationCount = 2816 * energyScale, formationGeo = starGeo.clone(), formationRandom = rnd((spec.seed ?? 829661) ^ 5483282);
		formationGeo.setAttribute("aSeed", new T.InstancedBufferAttribute(Float32Array.from({ length: formationCount * 4 }, () => formationRandom()), 4));
		formationGeo.setAttribute("aFormation", new T.InstancedBufferAttribute(new Float32Array(formationCount).fill(1), 1));
		formationGeo.instanceCount = formationCount;
		formationGeo.setAttribute("aFlight", new T.InstancedBufferAttribute(Float32Array.from({ length: formationCount }, (_, i) => starCapacity + i), 1));
		const formation = mesh("cross-stars", formationGeo, stars.material.vertexShader.slice(1715), stars.material.fragmentShader.slice(1715), root, false);
		formation.name = "starblade-formation-stars";
		const trailBatches = [];
		for (const source of [starGeo, formationGeo]) {
			const ids = [];
			for (let i = 0; i < source.instanceCount; i++) if (source.attributes.aSeed.array[i * 4 + 2] >= .73) ids.push(i);
			const strip = new T.PlaneGeometry(1, 1, 8, 1), g = new T.InstancedBufferGeometry();
			g.index = strip.index;
			for (const key of Object.keys(strip.attributes)) g.setAttribute(key, strip.attributes[key]);
			strip.dispose();
			for (const name of [
				"aSeed",
				"aFlight",
				"aFormation"
			]) {
				const attr = source.attributes[name];
				g.setAttribute(name, new T.InstancedBufferAttribute(Float32Array.from(ids.flatMap((i) => Array.from(attr.array.slice(i * attr.itemSize, (i + 1) * attr.itemSize)))), attr.itemSize));
			}
			g.setAttribute("aBirth", new T.InstancedBufferAttribute(new Float32Array(ids.length), 1));
			g.instanceCount = ids.length;
			const o = mesh("stream-trails", g, `attribute vec4 aSeed;attribute float aFlight,aFormation,aBirth;varying vec2 vUv;varying float vAlpha;` + flightShader + `
      void main(){vUv=vec2(uv.x,uv.y*2.-1.);float history=(.06+aSeed.w*.06)*(1.-.65*sm(5.7,6.5,uRealTime));
      float at=max(aBirth,uRealTime-uv.x*history);vec3 p=flightPoint(at,aFlight,aBirth);
      vec4 mv=modelViewMatrix*vec4(p,1.),ahead=modelViewMatrix*vec4(flightPoint(at+.003,aFlight,aBirth),1.);
      vec2 d=ahead.xy-mv.xy,perp=vec2(-d.y,d.x)/max(length(d),.00001);
      float width=(.012+aSeed.y*.010)*pow(1.-uv.x,.7);mv.xy+=perp*vUv.y*width*length(modelViewMatrix[0].xyz);
      vAlpha=sm(aBirth,aBirth+.04,uRealTime)*(1.-sm(6.15,6.5,uRealTime))*mix(1.,sm(3.3,5.5,uRealTime),aFormation)*.27;
      gl_Position=projectionMatrix*mv;
      }`, "varying vec2 vUv;varying float vAlpha;void main(){float a=pow(1.-abs(vUv.y),1.3)*pow(1.-vUv.x,1.6)*vAlpha;if(a<.003)discard;gl_FragColor=vec4(uColor,a);\n#include <colorspace_fragment>\n}", root, true);
			o.name = source === starGeo ? "starblade-stream-trails" : "starblade-formation-trails";
			trailBatches.push({
				object: o,
				source,
				ids
			});
		}
		const cloud = `vec3 cloudPoint(vec4 s){float r=sqrt(-2.*log(max(.004,s.y))),a=s.z*6.283185;return vec3(r*cos(a),r*sin(a),sin(s.w*31.7)*sqrt(-2.*log(max(.004,s.w))))*.43;}`;
		batch("petal-membranes", 192, petalEnvelope + cloud + "\n    void main(){vUv=uv*2.-1.;vAge=0.;vSeed=aSeed.x;float a=floor(aSeed.x*4.)*1.5707963+.785398;\n      float mt=motion(uTime,2.,aSeed.w*2.);vec3 unit=cloudPoint(aSeed);unit+=vec3(sin(mt*1.4+aSeed.z*18.),cos(mt*1.1+aSeed.w*19.),0.)*.11;\n      vec3 p=petalPoint(unit,a,uTime);p=mix(p,unit*.70,(1.-step(.20,fract(aSeed.x*4.)))*sm(4.15,4.75,uTime));float radius=.24+aSeed.z*.28;\n      vAlpha=uAir*(.25+.2*sin(uTime*2.+aSeed.w*21.))*(1.-sm(19.12+aSeed.z*.08,19.75+aSeed.z*.15,uRealTime));vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "void main(){float n=noise(vec3(vUv*3.8+vSeed*17.,uTime*.7));float d=dot(vUv,vUv);float a=exp(-d*4.5)*sm(.2,.6,n)*vAlpha*.32;if(a<.003)discard;gl_FragColor=vec4(mix(uColor,vec3(1.,.22,.006),.18),a);\n#include <colorspace_fragment>\n}", aerial, true, 5056 * energyScale);
		const red = batch("red-cross", 512 * energyScale, "varying float vReach;" + cloud + "\n    void main(){vUv=uv*2.-1.;vAge=0.;vSeed=aSeed.z;float branch=floor(aSeed.x*4.),a=branch*1.5707963+.785398;\n      float mt=motion(uTime,1.8,aSeed.w*1.8);float f=aSeed.y,reach=.12+f*2.3,tip=pow(1.-f,.65);vec3 c=cloudPoint(vec4(aSeed.x,aSeed.z,aSeed.w,fract(aSeed.z*13.7+aSeed.w*9.1)));\n      // Independent cross-section samples keep all four arm axes straight.\n      // Axial position must not also drive the azimuth of the cross-section.\n      vec3 p=vec3(reach,clamp(c.y,-1.1,1.1)*.23*tip,c.z*.13*tip+.10);\n      p.y+=sin(mt*1.7+aSeed.z*31.)*.012*tip;p.x+=sin(mt*2.1+aSeed.w*23.)*.014*tip;\n      p.xy*=.06+.94*uCrossExpansion;vReach=f;float cs=cos(a),sn=sin(a);p.xy=mat2(cs,sn,-sn,cs)*p.xy;\n      float outflow=sm(19.32,20.12,uRealTime);p.xy*=1.+outflow*.4;p.z+=outflow*aSeed.z*.45;\n      float radius=.006+(.075+aSeed.z*.075)*tip;radius*=mix(1.,1.45,sm(.30,.68,abs(c.y)));vSeed=abs(c.y);vAlpha=uCrossAlpha*(1.-sm(uCrossRetraction*2.55-.18,uCrossRetraction*2.55,reach))*(.65+.25*sin(uTime*4.+aSeed.w*32.));vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "varying float vReach;void main(){float d=dot(vUv,vUv);float grain=exp(-d*3.4);float rim=sm(.30,.68,vSeed);vec3 inner=mix(vec3(1.,.85,.38),vec3(1.,.09,.004),sm(.02,.24,vReach));inner=mix(inner,vec3(.009,.0001,.004),sm(.18,.52,vReach));vec3 c=mix(inner,vec3(1.,.035,.004),rim*.84);float breakup=.72+.28*sm(.22,.64,noise(vec3(vUv*5.+vReach*32.,uTime*.7)));float a=grain*vAlpha*breakup*1.9;if(a<.004)discard;gl_FragColor=vec4(c,min(a,.98));\n#include <colorspace_fragment>\n}", aerial, false, 3840 * energyScale);
		red.scale.setScalar(.72);
		red.position.z = .32;
		const redDepth = mesh("red-cross-depth", red.geometry, red.material.vertexShader.slice(1715), red.material.fragmentShader.slice(1715).replace(output, "if(gl_FragColor.a<.45)discard;\n#include <colorspace_fragment>\n"), aerial, false, true);
		redDepth.material.colorWrite = false;
		redDepth.material.transparent = true;
		redDepth.scale.copy(red.scale);
		redDepth.position.copy(red.position);
		layers.get("red-cross").push(redDepth);
		const redSeeds = red.geometry.getAttribute("aSeed");
		const redRows = Array.from({ length: redSeeds.count }, (_, i) => Array.from(redSeeds.array.slice(i * 4, i * 4 + 4)));
		const crossWidth = (s) => Math.abs(Math.sqrt(-2 * Math.log(Math.max(.004, s[2]))) * Math.sin(s[3] * Math.PI * 2) * .43);
		redRows.sort((a, b) => crossWidth(b) - crossWidth(a));
		redRows.forEach((row, i) => redSeeds.array.set(row, i * 4));
		redSeeds.needsUpdate = true;
		const crossFlash = batch("red-cross", flashCount, "varying float vReach;\n    void main(){vUv=uv*2.-1.;vAge=uCrossAge;vSeed=aSeed.w;\n      float f=aSeed.y,a=floor(aSeed.x*4.)*1.5707963+.785398;vec3 p;\n      if(aSeed.x<0.){float theta=aSeed.z*6.283185,r=sqrt(f)*.35;p=vec3(cos(theta)*r,sin(theta)*r,(aSeed.w-.5)*.10);vReach=0.;}\n      else{p=vec3(f*2.42,(aSeed.z*2.-1.)*.62*pow(1.-f,2.3)*uFlashWidth,(aSeed.w-.5)*.18*(1.-f));\n        p.xy=mat2(cos(a),sin(a),-sin(a),cos(a))*p.xy;vReach=f;}\n      float radius=aSeed.x<0.?.14:(.045+.123*pow(1.-f,1.5))*uFlashWidth;\n      // A fixed reach coordinate preserves the outer tips while the center erodes.\n      float reach=vReach+(aSeed.x<0.?-.035:0.);\n      float grain=(hash(vec3(aSeed.yz*37.,aSeed.w*19.))-.5)*.012*(1.-sat((uFlashErosion+.04)/1.08));\n      vAlpha=uCrossFlash*pow(sm(uFlashErosion-.04,uFlashErosion+.04,reach+grain),.25);vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "varying float vReach;void main(){float d=dot(vUv,vUv),body=exp(-d*5.5),glow=exp(-d*2.5)*.08;\n      float heat=uCrossHeat*(1.-sm(.35,.88,vReach));vec3 c=mix(vec3(1.,.018,.003),vec3(1.,.30,.015),1.-vReach);\n      c=mix(c,vec3(1.,.98,.92),heat);float a=(body+glow)*vAlpha*(.9+.1*noise(vec3(vUv*4.+vSeed*19.,vAge*3.)));\n      if(a<.003)discard;gl_FragColor=vec4(c,min(a,.94));\n#include <colorspace_fragment>\n}", aerial, false, 17930);
		const flashSeeds = crossFlash.geometry.getAttribute("aSeed");
		for (let i = 0; i < flashCount; i++) if (i < 256) flashSeeds.setX(i, -1);
		else {
			const j = i - 256;
			flashSeeds.setX(i, (Math.floor(j / 448) + .5) / 4);
			flashSeeds.setY(i, j % 448 / 447);
		}
		crossFlash.name = "starblade-red-cross-flash";
		crossFlash.position.z = coreForward;
		const flashHaloGeometry = crossFlash.geometry.clone(), haloSeeds = /* @__PURE__ */ new Float32Array(512);
		for (let i = 0; i < 128; i++) {
			const source = 256 + Math.floor(i / 32) * 448 + Math.floor(i % 32 / 31 * 447);
			haloSeeds.set(flashSeeds.array.subarray(source * 4, source * 4 + 4), i * 4);
		}
		flashHaloGeometry.setAttribute("aSeed", new T.InstancedBufferAttribute(haloSeeds, 4));
		flashHaloGeometry.instanceCount = 128;
		const flashHalo = mesh("red-cross", flashHaloGeometry, crossFlash.material.vertexShader.slice(1715).replace("float reach=vReach", "radius*=4.;float reach=vReach"), "varying vec2 vUv;varying float vAlpha;void main(){float alpha=exp(-dot(vUv,vUv)*3.)*vAlpha*.11;if(alpha<.003)discard;gl_FragColor=vec4(1.,.015,.003,alpha);" + output + "}", aerial, true);
		flashHalo.name = "starblade-red-cross-flash-glow";
		flashHalo.position.copy(crossFlash.position);
		const orb = batch("charge-orb", 384 * energyScale, cloud + "\n    void main(){vUv=uv*2.-1.;vAge=0.;vSeed=aSeed.z;vec3 p=cloudPoint(aSeed);\n      float mt=motion(uTime,1.4,aSeed.z*1.4);float phase=6.283185*cycle(uTime*(1.8+aSeed.x*.7)/6.283185+aSeed.z),c=cos(phase),sn=sin(phase);p.xy=mat2(c,sn,-sn,c)*p.xy;\n      p+=vec3(sin(mt*5.+aSeed.w*31.),cos(mt*4.+aSeed.z*23.),sin(mt*3.+aSeed.y*19.))*.08*(.5+uDetail*.5);\n      float inward=fract(uTime*.9+aSeed.w);p*=mix(1.25,.42,sm(0.,1.,inward));float radius=.042+aSeed.y*.07;\n      vSeed=length(p);vAlpha=uOrb*(.52+.48*sin(inward*3.14159))*sm(0.,.035,inward)*(1.-sm(.965,1.,inward));vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "void main(){vec2 q=abs(vUv);float star=pow(max(0.,1.-pow(q.x,.5)-pow(q.y,.5)),.5);float light=exp(-dot(vUv,vUv)*6.);float hot=sm(10.3,11.1,uTime);vec3 base=mix(uColor,vec3(1.,.025,.004),uCoreRed);vec3 c=mix(base,vec3(1.,.97,.78),(.12+hot*.88)*(1.-sm(.1,.85,vSeed)));float a=(star*.75+light*.38)*vAlpha;if(a<.003)discard;gl_FragColor=vec4(c,a);\n#include <colorspace_fragment>\n}", aerial, false, 4352 * energyScale);
		const orbHalo = batch("orb-halo", 1, "void main(){vUv=uv*2.-1.;vAlpha=uOrb;vAge=0.;vSeed=0.;vec3 p=vec3(0.);float radius=(.45+sm(9.1,11.1,uTime)*.55)*2.7;vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "void main(){float r=length(vUv);float n=noise(vec3(vUv*3.,uTime));float a=exp(-r*r*5.)*(1.-sm(.7,1.,r))*vAlpha*(.24+n*.15);gl_FragColor=vec4(mix(uColor,vec3(1.,.025,.003),uCoreRed),a);" + output + "}", aerial, true);
		const arcs = batch("air-arcs", 96, `
    void main(){vUv=uv*2.-1.;vAge=0.;vSeed=aSeed.x;float mt=motion(uTime,2.4,aSeed.w*2.4);float a=6.283185*cycle(aSeed.x+uTime*(.7+aSeed.z*.15)/6.283185);
      float r=2.9+aSeed.y*.65+.12*sin(mt*1.5+aSeed.w*12.);vec3 p=vec3(cos(a)*r,sin(a)*r,(aSeed.w-.5)*.8);
      vAlpha=uAir*pow(.5+.5*sin(aSeed.z*14.+uTime*2.),2.)*(1.-sm(19.12,19.75,uRealTime));
      vec4 mv=modelViewMatrix*vec4(p,1.),tangent=modelViewMatrix*vec4(-sin(a),cos(a),0.,0.);vec2 d=normalize(tangent.xy+vec2(.00001));
      mv.xy+=(d*position.x*(.13+aSeed.z*.25)+vec2(-d.y,d.x)*position.y*(.018+aSeed.y*.026))*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}
    `, "void main(){float n=noise(vec3(vUv*4.+vSeed*18.,uTime*1.8));float a=exp(-dot(vUv,vUv)*3.)*sm(.18,.65,n)*vAlpha*.42;if(a<.003)discard;gl_FragColor=vec4(vec3(.85,.79,.64),a);\n#include <colorspace_fragment>\n}", aerial, false, 4736 * energyScale);
		const cloverWindCount = 144, cloverWindObjects = [];
		const cloverWindTiming = Object.freeze({
			start: starbladeStages.windStart,
			end: starbladeStages.windEnd,
			expand: .22
		});
		const cloverWindPeakRadius = 5.2272;
		const windRandom = rnd((spec.seed ?? 829661) ^ 85621763);
		extraAliases["clover-pressure-shell"] = "air-arcs";
		extraAliases["clover-pressure-wisps"] = "air-arcs";
		const windVertex = `attribute vec4 aWind;attribute vec2 aWindShape;
    varying vec2 vWindUv;varying float vWindAge,vWindSeed,vWindLife;
    void main(){
      float age=max(0.,uRealTime-7.65),q=sat(age/.65),travel=easeOut(age/.22);
      vWindUv=uv*2.-1.;vWindAge=age;vWindSeed=aWind.w;
      // Sparse axial caps leave the center open, including at the first frame.
      float drift=sin(vWindUv.x*3.141593)*(.05+.045*sin(aWind.w*19.+age*4.));
      float phi=aWind.x+vWindUv.x*aWind.z+age*aWindShape.y;
      float thin=mix(1.,.28,easeOut(sat((age-.12)/.53)));
      float theta=aWind.y+vWindUv.y*aWindShape.x*thin+drift;
      float radius=mix(2.85,5.2272,travel);
      float scallop=1.-.035*pow(sin(vWindUv.x*3.141593),2.)*(.5+.5*sin(aWind.w*23.+age*5.));
      vec3 n=vec3(sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta));
      vec3 p=n*radius*scallop+vec3(0.,0.,uCrossAnchor);
      vWindLife=1.-sm(.52,.65,age);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
    }`;
		const windFragment = "varying vec2 vWindUv;varying float vWindAge,vWindSeed,vWindLife;\n    void main(){\n      vec2 q=vWindUv;float age=vWindAge;\n      float ends=sm(0.,.16,1.-abs(q.x));\n      float grain=noise(vec3(q*vec2(8.,3.)+vec2(vWindSeed*37.,vWindSeed*19.),age*2.7));\n      float tears=noise(vec3(q*vec2(3.8,1.9)+vWindSeed*43.,age*1.3));\n      float erosion=sm(.22,.65,age);\n      float broken=sm(.19+erosion*.64,.45+erosion*.57,tears);\n      float body=exp(-q.y*q.y*5.)*sm(.19,.50,grain);\n      // The soft shoulder and denser rolling edge share exactly the same gaps.\n      float shoulder=exp(-q.y*q.y*1.8)*.12;\n      float alpha=(body*.36+shoulder)*ends*broken*vWindLife;\n      if(alpha<.003)discard;\n      vec3 color=mix(vec3(.40,.46,.50),vec3(.86,.90,.92),sm(.25,.78,grain));\n      gl_FragColor=vec4(color,alpha);\n#include <colorspace_fragment>\n}";
		const wispVertex = windVertex.replace("float drift=sin(vWindUv.x*3.141593)*(.05+.045*sin(aWind.w*19.+age*4.));", "float drift=sin(vWindUv.x*3.141593+age*4.)*.035;").replace("float radius=mix(2.85,5.2272,travel);", "float radius=mix(2.85,5.2272,travel)*(.91+.06*aWind.w);").replace("vWindLife=1.-sm(.52,.65,age);", "vWindLife=sm(0.,.035,age)*(1.-sm(.38,.65,age));");
		const wispFragment = windFragment.replace("float body=exp(-q.y*q.y*5.)*sm(.19,.50,grain);", "float body=exp(-q.y*q.y*8.)*sm(.16,.48,grain);").replace("float shoulder=exp(-q.y*q.y*1.8)*.12;", "float shoulder=0.;").replace("body*.36+shoulder", "body*.28+shoulder");
		for (let kind = 0; kind < 2; kind++) {
			const count = kind === 0 ? 48 : 96;
			const g = new T.InstancedBufferGeometry(), base = new T.PlaneGeometry(2, 2, kind === 0 ? 20 : 10, 4);
			g.index = base.index;
			for (const key of Object.keys(base.attributes)) g.setAttribute(key, base.attributes[key]);
			base.dispose();
			const paths = new Float32Array(count * 4), shapes = new Float32Array(count * 2);
			for (let i = 0; i < count; i++) {
				let angle = i / count * Math.PI * 2 + (windRandom() - .5) * .26;
				let polar = .72 + windRandom() * 1.7;
				const seed = windRandom(), arc = kind === 0 ? .17 + windRandom() * .27 : .055 + windRandom() * .09;
				if (kind === 0 && i < 4) {
					angle = i * Math.PI * .5;
					polar = Math.PI * .5;
				}
				paths.set([
					angle,
					polar,
					arc,
					seed
				], i * 4);
				shapes.set([kind === 0 ? .035 + windRandom() * .065 : .012 + windRandom() * .02, kind === 0 && i < 4 ? 0 : (windRandom() - .5) * .42], i * 2);
			}
			g.setAttribute("aWind", new T.InstancedBufferAttribute(paths, 4));
			g.setAttribute("aWindShape", new T.InstancedBufferAttribute(shapes, 2));
			g.instanceCount = count;
			const o = mesh(kind === 0 ? "clover-pressure-shell" : "clover-pressure-wisps", g, kind === 0 ? windVertex : wispVertex, kind === 0 ? windFragment : wispFragment, aerial, false);
			o.userData.windWindow = [cloverWindTiming.start, cloverWindTiming.end];
			o.userData.windPeakSpan = cloverWindPeakRadius * 2 * aerialScale;
			cloverWindObjects.push(o);
		}
		const inflow = batch("core-inflow", 128, "\n    void main(){vUv=uv*2.-1.;vAge=0.;vSeed=aSeed.w;float phase=fract(uTime*.65+aSeed.y),q=sm(0.,1.,phase),a=floor(aSeed.x*4.)*1.5707963+.785398;\n      float r=mix(2.25,.22,q),bend=sin(q*3.14159)*.32;vec3 p=vec3(cos(a+bend)*r,sin(a+bend)*r,.30+sin(q*3.14159)*.32+(uCrossAnchor-.30)*q);\n      vec3 tangent=vec3(-cos(a+bend),-sin(a+bend),-.1);float width=.014+aSeed.z*.015,span=.09+aSeed.w*.13;\n      vAlpha=sm(4.65,5.3,uTime)*(1.-sm(10.95,11.1,uTime))*sin(phase*3.14159)*(.30+.25*uCoreRed);\n    vec4 mv=modelViewMatrix*vec4(p,1.);vec3 axis=normalize(mat3(modelViewMatrix)*tangent);vec2 d=axis.xy/max(length(axis.xy),.001);float scale=length(modelViewMatrix[0].xyz);mv.xyz+=vec3(-d.y,d.x,0.)*position.x*width*scale+axis*position.y*span*scale;gl_Position=projectionMatrix*mv;}", "void main(){float a=exp(-vUv.x*vUv.x*9.-vUv.y*vUv.y*3.)*vAlpha;vec3 c=mix(uColor,vec3(1.,.17,.015),uCoreRed);gl_FragColor=vec4(c,a);\n#include <colorspace_fragment>\n}", aerial, true, 16762);
		const burstSpecs = [
			[
				"burst-pulse",
				256,
				0,
				.24,
				`vec3 c=cloudPoint(aSeed);float bounce=sin(q*3.14159);p=c*(.25+.7*bounce)*(1.-q*.5);p.z*=.35+1.5*bounce;width=.19;span=.19;opacity=.8*(1.-q);`,
				0
			],
			[
				"burst-filaments",
				192,
				0,
				.38,
				`tangent=normalize(vec3(cos(a),sin(a),(aSeed.z-.5)*.4));p=tangent*(.65+e*(1.7+aSeed.y*1.4));width=.018*(1.-q*.7);span=(.14+.40*sin(q*3.14159))*(1.-q*.5);opacity=.85*(1.-q);`,
				1
			],
			[
				"burst-lightning",
				256,
				0,
				.52,
				`float branch=floor(aSeed.x*8.),f=aSeed.y;float h=.5/32.;
      vec3 pa=burstBolt(f-h,branch,age,e),pb=burstBolt(f+h,branch,age,e);p=(pa+pb)*.5;tangent=normalize(pb-pa);width=.022;span=length(pb-pa)*.62;opacity=(1.-q)*(.7+.3*step(.28,fract(aSeed.w+floor(age*24.)*.37)));`,
				1
			],
			[
				"pressure-wave",
				160,
				.02,
				.72,
				`vec3 n=normalize(cloudPoint(aSeed)+vec3(.0001));p=n*(.45+e*3.3);tangent=normalize(cross(n,vec3(.1,1.,.2)));width=.08*(1.-q)+.012;span=.30+aSeed.w*.16;opacity=.48*(1.-q);`,
				2
			],
			[
				"burst-arcs",
				128,
				.04,
				.6,
				`float angle=floor(aSeed.x*5.)*1.256637+aSeed.y*.65+e*1.4;float r=2.8-e*1.9;p=vec3(cos(angle)*r,sin(angle)*r,(aSeed.z-.5)*.25);tangent=vec3(-sin(angle),cos(angle),0.);width=.035*(1.-q*.6);span=.19;opacity=.6*sin(q*3.14159);`,
				2
			],
			[
				"burst-helix",
				128,
				.02,
				.56,
				`float f=aSeed.y,angle=f*9.4+e*3.5+floor(aSeed.x*2.)*3.14159;float r=.32+f*.50+q*.25;p=vec3(cos(angle)*r,sin(angle)*r,f*(.5+e*1.8));tangent=normalize(vec3(-sin(angle)*r,cos(angle)*r,.20));width=.04;span=.14;opacity=.6*(1.-q);`,
				2
			],
			[
				"burst-mist",
				192,
				.04,
				.8,
				`vec3 n=normalize(cloudPoint(aSeed)+vec3(.0001));p=n*(.5+e*1.5);p.xy+=vec2(sin(a+q*4.),cos(a-q*3.))*.24;p.z+=q*.4;width=.18+.35*q;span=width;opacity=.17*(1.-sm(.3,1.,q));`,
				3
			],
			[
				"burst-shards",
				128,
				.03,
				.76,
				`vec3 n=normalize(cloudPoint(aSeed)+vec3(.0001));p=n*(.35+e*(1.4+aSeed.z));tangent=normalize(vec3(cos(a+q*9.),sin(a+q*9.),sin(q*7.+a)));width=(.045+aSeed.y*.07)*abs(cos(q*9.+a))+.005;span=.12*(1.-q*.6);opacity=.8*(1.-q);`,
				4
			],
			[
				"burst-comets",
				160,
				.05,
				.72,
				`float angle=a+e*.95,r=.4+e*(1.8+aSeed.y);p=vec3(cos(angle)*r,sin(angle)*r,sin(q*3.14159+a)*.3);tangent=normalize(vec3(cos(angle)-sin(angle)*r,sin(angle)+cos(angle)*r,.15));width=.035;span=.10+.18*sin(q*3.14159);opacity=.8*(1.-q);`,
				5
			],
			[
				"burst-return",
				128,
				.26,
				.8,
				`float angle=a+q*.6,r=2.2*(1.-sm(0.,1.,q));p=vec3(cos(angle)*r,sin(angle)*r,.25*sin(q*3.14159));tangent=normalize(vec3(-cos(angle),-sin(angle),.1));width=.018;span=.12;opacity=.75*sin(q*3.14159);`,
				1
			],
			[
				"burst-fronts",
				192,
				0,
				.24,
				`float angle=floor(aSeed.x*4.)*1.5707963+.785398,r=.12+e*1.62;p=vec3(cos(angle)*r,sin(angle)*r,0.);p+=vec3(-sin(angle),cos(angle),0.)*(aSeed.y-.5)*.65*(1.-e*.7);tangent=vec3(-sin(angle),cos(angle),0.);width=.09;span=.14;opacity=.85*(1.-q);`,
				1
			],
			[
				"burst-satellites",
				128,
				.12,
				.64,
				`float cluster=floor(aSeed.x*6.),angle=cluster*1.047198+.3;vec3 c=cloudPoint(aSeed);p=vec3(cos(angle)*2.3,sin(angle)*2.3,(aSeed.z-.5)*.4)+c*(.06+e*.55);width=.045+.05*q;span=width;opacity=.9*(1.-q);`,
				0
			],
			[
				"burst-fissures",
				64,
				0,
				.3,
				`float angle=floor(aSeed.x*4.)*1.5707963;float r=.45+aSeed.y*1.8;p=vec3(cos(angle)*r,sin(angle)*r,.08);tangent=vec3(cos(angle),sin(angle),0.);width=(.05+.10*sin(q*3.14159))*(1.-q);span=.18;opacity=.7*(1.-q);`,
				6
			]
		];
		const burstObjects = [];
		let burstSeedOffset = 19978;
		for (const [name, count, start, end, shape, kind] of burstSpecs) {
			const o = batch("red-cross", count, cloud + `
      vec3 burstBolt(float f,float branch,float age,float e){float angle=floor(branch/2.)*1.5707963+.36;
        float corner=floor(f*10.),between=fract(f*10.);float shift=floor(age*24.);float k=mix(sin(corner*13.+branch*7.+shift),sin((corner+1.)*13.+branch*7.+shift),between)*.12;
        k+=mod(branch,2.)*max(0.,f-.42)*.85;return vec3(cos(angle),sin(angle),0.)*(.45+f*(2.6+e*.5))+vec3(-sin(angle),cos(angle),.3)*k;}

      void main(){vUv=uv*2.-1.;vAge=uCrossAge;vSeed=aSeed.w;float age=uCrossAge-${start.toFixed(3)},q=sat(age/${(end - start).toFixed(3)}),e=easeOut(q),a=aSeed.x*6.283185;
      vec3 p=vec3(0.),tangent=vec3(0.,1.,0.);float width=.04,span=.1,opacity=0.;
      ` + shape + `vAlpha=step(0.,age)*(1.-step(${end.toFixed(3)},uCrossAge))*opacity;vec4 mv=modelViewMatrix*vec4(p,1.);vec3 axis=normalize(mat3(modelViewMatrix)*tangent);vec2 d=axis.xy/max(length(axis.xy),.001);float scale=length(modelViewMatrix[0].xyz);mv.xyz+=vec3(-d.y,d.x,0.)*position.x*width*scale+axis*position.y*span*scale;gl_Position=projectionMatrix*mv;}`, `void main(){vec2 q=vUv;float d=dot(q,q),mask;
        ${kind === 1 ? "mask=exp(-q.x*q.x*14.-q.y*q.y*3.);" : kind === 2 ? "mask=exp(-q.x*q.x*8.-q.y*q.y*2.)*sm(.22,.55,noise(vec3(q*5.+vSeed*23.,vAge*3.)));" : kind === 3 ? "mask=exp(-d*3.)*sm(.2,.65,noise(vec3(q*4.+vSeed*31.,vAge*5.)));" : kind === 4 ? "mask=(1.-sm(.55,.95,abs(q.y)+abs(q.x)*1.7))*(1.-sm(.4,.9,vAge));" : kind === 5 ? "mask=exp(-q.x*q.x*16.)*sm(-1.,.6,q.y)*(1.-sm(.6,1.,q.y));" : "mask=exp(-d*5.);"}
        vec3 color=${kind === 6 ? "vec3(.035,.0003,.006)" : "mix(vec3(1.,.025,.004),vec3(1.,.60,.13),exp(-d*6.)*(1.-sm(.08,.30,vAge)))"};
        float alpha=mask*vAlpha;if(alpha<.003)discard;gl_FragColor=vec4(color,alpha);
#include <colorspace_fragment>
}`, aerial, kind !== 3 && kind !== 6, burstSeedOffset);
			if (name === "burst-lightning") {
				const seed = o.geometry.getAttribute("aSeed");
				for (let i = 0; i < count; i++) {
					seed.setX(i, (Math.floor(i / 32) + .5) / 8);
					seed.setY(i, (i % 32 + .5) / 32);
				}
			}
			o.name = "starblade-" + name;
			o.position.z = name === "burst-fronts" ? red.position.z + .15 : coreForward;
			o.userData.burstWindow = [start, end];
			burstObjects.push(o);
			burstSeedOffset += count;
		}
		const flakes = batch("petal-flakes", 256, petalEnvelope + "\n    void main(){vUv=uv*2.-1.;vSeed=aSeed.w;float phase=fract(uTime*.40+aSeed.y),q=sm(0.,1.,phase),a=floor(aSeed.x*4.)*1.5707963+.785398;\n      vec3 p=petalPoint(vec3(aSeed.z*1.5-.6,(step(.5,aSeed.w)*2.-1.)*.70,(aSeed.y-.5)*.5),a,uTime);\n      p+=vec3(cos(a)*q*.55,sin(a)*q*.55-q*.32,sin(q*3.14159+aSeed.z)*.3);float radius=.035+aSeed.z*.045;\n      vAge=q;vAlpha=uAir*sin(phase*3.14159)*.85;\n    vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "void main(){vec2 p=vUv;float a=(1.-sm(.08,.3,abs(p.x)+abs(p.y)*.24))*sm(-1.,-.5,p.y)*(1.-sm(.45,.95,p.y))*vAlpha;gl_FragColor=vec4(mix(uColor,vec3(1.,.38,.025),vAge),a);\n#include <colorspace_fragment>\n}", aerial, false, 17034);
		const beam = batch("beam", 288 * energyScale, "varying float vRadial,vBeamDistance,vRootScale;\n    void main(){vUv=uv*2.-1.;vAge=0.;vSeed=aSeed.w;float thin=sat((uTime-11.23)/.22),hot=step(.60,aSeed.y);float phase=fract(aSeed.x+uRealTime*(2.8+aSeed.w*1.4)),f=sm(0.,1.,phase);\n      float r=sqrt(-log(max(.006,aSeed.y)))*.62,a=aSeed.z*6.283185+sin(f*16.-cycle(aSeed.x+uRealTime*(2.8+aSeed.w*1.4))*9.)*.15;\n      r*=mix(1.,mix(.23,.14,thin),hot);vRadial=r;float pulse=.8+.18*sin(f*23.-cycle(aSeed.x+uRealTime*(2.8+aSeed.w*1.4))*14.+aSeed.z*5.);vec3 p=vec3(cos(a)*r*pulse,f-.5,sin(a)*r*pulse);\n      vAlpha=uBeam*sm(0.,.035,phase)*(1.-sm(.96,1.,phase))*(.27+aSeed.y*.38)*mix(1.,2.4,thin*hot);\n      vec4 mv=modelViewMatrix*vec4(p,1.);vec2 d=normalize((modelViewMatrix*vec4(0.,1.,0.,0.)).xy+vec2(.00001));\n      float sc=length(modelViewMatrix[0].xyz),w=(.30+aSeed.w*.28)*mix(1.,1.2,thin*hot);\n      // Fine-beam axial streaks overlap into a luminous spine while its outer grains remain loose.\n      float halfLength=(.32+aSeed.w*.7)*(sc/pow(mix(1.,1.5,thin),2.))*mix(1.,7.,thin*hot);\n      // Carry streak depth along the ray as well as its screen direction.\n      vec3 axis=modelViewMatrix[1].xyz;float rayLength=length(axis);axis/=max(rayLength,.0001);\n      halfLength/=max(length(axis.xy),.08);\n      halfLength=min(halfLength,rayLength*min(f,1.-f));\n      mv.xyz+=vec3(-d.y,d.x,0.)*position.x*w*sc+axis*position.y*halfLength;vBeamDistance=(1.-f)*rayLength-position.y*halfLength;vRootScale=sc/(.855+(.25875-.855)*thin);\n      gl_Position=projectionMatrix*mv;}\n    ", "varying float vRadial,vBeamDistance,vRootScale;void main(){float core=exp(-vUv.x*vUv.x*30.-vUv.y*vUv.y*5.),glow=exp(-dot(vUv,vUv)*3.)*.36;float radius=vRadial+abs(vUv.x)*.45;vec3 c=mix(vec3(1.,.87,.06),vec3(1.,.26,.006),sm(.12,.58,radius));c=mix(c,vec3(.92,.012,.002),sm(.55,1.05,radius));float white=(1.-sm(.015,.055,radius))*core*.7;c=mix(c,vec3(1.,.99,.83),white);float a=(core+glow)*vAlpha*1.35*contactBeamMask(vBeamDistance,vRootScale);if(a<.003)discard;gl_FragColor=vec4(c,a);\n#include <colorspace_fragment>\ngl_FragColor.rgb*=gl_FragColor.a;gl_FragColor.a*=1.-contactBeamEmission(vBeamDistance,vRootScale);}", root, false, 4768 * energyScale);
		beam.material.premultipliedAlpha = true;
		extraAliases["beam-volume"] = "beam";
		const beamVolume = mesh("beam-volume", new T.CylinderGeometry(3.2, 3.2, 1, 48, 24, false), `varying vec3 vView,vNormal,vAxis;varying vec2 vSection;varying float vAlong,vCap,vToHit,vRootScale;void main(){vec3 p=position;float phase=(p.y+.5);float flutter=1.+.018*sin(phase*55.-uRealTime*24.);p.xz*=flutter;vec4 mv=modelViewMatrix*vec4(p,1.);vView=-mv.xyz;vNormal=normalize(normalMatrix*normal);vAxis=normalize(modelViewMatrix[1].xyz);vSection=position.xz/3.2;vCap=step(.5,abs(normal.y));vAlong=phase;vToHit=(1.-phase)*length(modelViewMatrix[1].xyz);vRootScale=length(modelViewMatrix[0].xyz)/(.855+(.25875-.855)*sat((uTime-11.23)/.22));gl_Position=projectionMatrix*mv;}`, "varying vec3 vView,vNormal,vAxis;varying vec2 vSection;varying float vAlong,vCap,vToHit,vRootScale;void main(){vec3 view=normalize(vView),radialView=view-vAxis*dot(view,vAxis);float facing=abs(dot(normalize(vNormal),radialView/max(length(radialView),.0001)));float r=mix(sqrt(max(0.,1.-facing*facing)),length(vSection),vCap);float core=1.-sm(.07,.22,r);vec3 col=mix(vec3(.92,.008,.001),vec3(1.,.24,.008),1.-sm(.22,.58,r));col=mix(col,vec3(1.,.88,.16),core);col=mix(col,vec3(1.,.98,.75),(1.-sm(.015,.065,r))*.75);float alpha=exp(-r*r*4.)*(1.-sm(.80,1.,r))*uBeam;float ends=mix(sm(0.,.004,vAlong)*(1.-sm(.996,1.,vAlong)),1.,vCap);alpha*=contactBeamMask(vToHit,vRootScale);if(alpha*ends<.003)discard;gl_FragColor=vec4(col,alpha*ends);\n#include <colorspace_fragment>\ngl_FragColor.rgb*=gl_FragColor.a;gl_FragColor.a*=1.-contactBeamEmission(vToHit,vRootScale);}", root, false);
		beamVolume.material.premultipliedAlpha = true;
		beamVolume.material.side = T.FrontSide;
		const rockPalette = `vec3 heatedRock(vec3 point,float light,float heat){float thermalNoise=noise(point*6.);float hot=sat(heat*(.55+.45*thermalNoise));vec3 base=vec3(.055,.018,.022)*light;vec3 red=mix(vec3(.24,.006,.009),vec3(.85,.045,.006),sm(.12,.72,hot));red=mix(red,vec3(1.,.31,.018),sm(.72,1.,hot));return mix(base,red,hot);}`;
		const shardShape = `vec3 shardPoint(vec3 p,vec4 seed){float size=.38+pow(seed.w,1.8)*1.65;vec3 ratio=vec3(.45+seed.y*.55,.65+seed.z*1.5,.35+seed.x*.55);p*=ratio*size;float facet=hash(floor((p+1.)*17.)+seed.xyz*31.);p*=.72+facet*.55;p.x+=p.y*(seed.x-.5)*.7;p.z+=p.x*(seed.z-.5)*.45;return p;}
    float shardHeat(vec3 p,float seed){vec3 q=p*9.+vec3(seed*17.,seed*7.,seed*29.);float field=noise(q);float seam=1.-sm(.025,.17,abs(field-.48));float pocket=1.-sm(.09,.18,length(p-vec3(.015,-.02,.01)));return sat(.12+seam*.80+pocket*.35);}`;
		const groundVertex = "varying vec2 vUv;varying vec3 vP,vN;void main(){vUv=uv;vP=position;vN=normal;float born=contactTime(position.x/uLength);float age=uRealTime-born;vec3 p=position;p.y*=sm(0.,.15,age)*(1.+sin(max(age,0.)*18.)*exp(-max(age,0.)*8.)*.14);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}";
		const rockPositions = [], rockUvs = [];
		const terrainRandom = rnd((spec.seed ?? 829661) ^ 6993277), bankRows = [];
		for (let side = 0; side < 2; side++) {
			const ridges = Array.from({ length: 34 }, () => terrainRandom()), rows = [];
			for (let j = 0; j <= 96; j++) {
				const f = j / 96, x = j === 0 || j === 96 ? f * 20 : (j - .35 + terrainRandom() * .7) / 96 * 20;
				const peak = .22 + ridges[Math.floor(j / 3)] * .58 + terrainRandom() * .13, inner = .3 + terrainRandom() * .18, crest = .56 + terrainRandom() * .38, outer = 1.04 + terrainRandom() * .65;
				rows.push({
					x,
					peak,
					inner,
					crest,
					outer,
					tilt: terrainRandom() * .25
				});
			}
			bankRows.push(rows);
		}
		const rockPoint = (side, row, band) => {
			const q = bankRows[side][row], sign = side ? 1 : -1;
			const z = [
				q.outer,
				q.crest + .2,
				q.crest,
				q.inner
			][band], h = [
				.012,
				q.peak * .28,
				q.peak,
				.1 + q.tilt
			][band];
			return [
				q.x,
				h,
				sign * z
			];
		};
		for (let side = 0; side < 2; side++) for (let j = 0; j < 96; j++) for (let band = 0; band < 3; band++) for (const [row, k] of [
			[j, band],
			[j + 1, band],
			[j + 1, band + 1],
			[j, band],
			[j + 1, band + 1],
			[j, band + 1]
		]) {
			const p = rockPoint(side, row, k);
			rockPositions.push(...p);
			rockUvs.push(p[0] / 20, (p[2] + 1.7) / 3.4);
		}
		const rockGeo = new T.BufferGeometry();
		rockGeo.setAttribute("position", new T.Float32BufferAttribute(rockPositions, 3));
		rockGeo.setAttribute("uv", new T.Float32BufferAttribute(rockUvs, 2));
		rockGeo.computeVertexNormals();
		const banks = mesh("rift-walls", rockGeo, groundVertex, rockPalette + "varying vec3 vP,vN;void main(){float age=uRealTime-(contactTime(vP.x/uLength));if(age<0.||uFade<.001)discard;\n    float n=noise(vP*9.),blastAge=uRealTime-blastTime(vP.x/uLength),cool=max(1.-sm(1.2,5.8,age),step(0.,blastAge)*(1.-sm(.2,2.3,blastAge)));float hot=(1.-sm(.28,.82,abs(vP.z)))*(.35+n*.4)*cool;\n    float light=.22+.78*max(0.,dot(normalize(vN),normalize(vec3(-.4,1.,.5))));vec3 c=heatedRock(vP,light,hot*1.65);\n    float fade=groundTail(vP.x/uLength);float erosion=noise(vP*18.)*.8+.1;if(fade<erosion)discard;gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}", ground, false, true);
		function groundPlane(name, width, fragment, y) {
			const g = new T.PlaneGeometry(20, width, 1, 1);
			g.rotateX(-Math.PI / 2);
			g.translate(10, y, 0);
			return mesh(name, g, vertex, fragment, ground);
		}
		const scorch = groundPlane("scorch", 3.7, "varying vec3 vP;void main(){float age=uRealTime-(contactTime(vP.x/uLength));float n=noise(vP*7.);float edge=1.-sm(1.05+n*.25,1.35+n*.5,abs(vP.z));if(age<0.)discard;gl_FragColor=vec4(vec3(.022,.012,.014),edge*groundTail(vP.x/uLength)*.94);\n#include <colorspace_fragment>\n}", .008);
		const lava = groundPlane("lava", 1.02, "varying vec3 vP;void main(){float age=uRealTime-(contactTime(vP.x/uLength))-.08;if(age<0.)discard;\n    vec3 p=vP*9.;p.x-=uRealTime*1.7;float n=noise(p+vec3(0.,sin(vP.x*5.+uRealTime)*.8,0.));float veins=1.-sm(.045,.17,abs(n-.52));\n    float offset=sin(vP.x*3.2)*.035+sin(vP.x*8.7)*.025,edge=1.-sm(.29,.42+noise(vec3(vP.x*8.,0.,0.))*.10,abs(vP.z-offset));\n    float heat=max(1.-sm(1.1,4.4,age),step(blastTime(vP.x/uLength),uRealTime)*(1.-sm(.3,1.7,uRealTime-blastTime(vP.x/uLength))));vec3 c=mix(vec3(.19,.004,.001),vec3(1.,.22,.003),n*heat);c=mix(c,mix(vec3(.62,.025,.001),vec3(1.,.87,.15),heat),veins*.95);\n    gl_FragColor=vec4(c,edge*groundTail(vP.x/uLength));\n#include <colorspace_fragment>\n}", .025);
		const cracks = groundPlane("branch-cracks", 5.6, "varying vec3 vP;void main(){float side=step(0.,vP.z),z=abs(vP.z),warpedX=vP.x+sin(vP.x*.73)*.49+sin(vP.x*1.91)*.17,cell=floor(warpedX/1.23),seed=hash(vec3(cell,side,3.));float attach=(cell+.18+seed*.55)*1.23;\n    float age=uRealTime-(contactTime(attach/uLength))-.10;if(age<0.||attach>uLength||hash(vec3(cell,side,14.))<.24)discard;\n    float direction=seed-.45,span=.5+hash(vec3(cell,side,8.))*1.5;\n    float bend=direction*(z-.45)+sin(z*9.+seed*21.)*.055+sin(z*21.+seed)*.018;\n    float line=abs(warpedX-attach-bend),fork=abs(warpedX-attach-bend-(z-(.65+seed*.75))*(.24+seed*.55));\n    float shape=max(1.-sm(.018,.065,line),(1.-sm(.012,.039,fork))*sm(.85,1.1,z)*.7);\n    shape*=sm(.35,.56,z)*(1.-sm(span-.18,span,z))*(1.-sm(.45+sm(0.,.26,age)*span,.55+sm(0.,.26,age)*span,z));\n    float heat=1.-sm(.6,3.1,age);vec3 c=mix(vec3(.40,.008,.001),vec3(1.,.64,.04),heat);gl_FragColor=vec4(c,shape*(.45+heat*.55)*groundTail(vP.x/uLength));\n#include <colorspace_fragment>\n}", .032);
		function ageParticle(f) {
			return "float born=contactTime(" + f + ");float age=uRealTime-born;";
		}
		const flashes = batch("impact-flash", 12, "void main(){vUv=uv*2.-1.;vSeed=aSeed.x;float f=aSeed.w;" + ageParticle("f") + "vAge=age;vAlpha=step(0.,age)*(1.-sm(.025,.18,age));vec3 p=vec3(f*uLength,.45,0.);float radius=(.45+.12*sm(0.,.11,age))*(1.+(1.-step(.01,f))*.5);vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "void main(){float a=atan(vUv.y,vUv.x),r=length(vUv),spike=.34+.20*pow(.5+.5*cos(a*9.+vSeed*3.),6.);float core=1.-sm(.12,spike,r);float halo=exp(-r*r*5.)*.32;gl_FragColor=vec4(mix(uColor,vec3(1.,.99,.91),core), (core+halo)*vAlpha);" + output + "}", ground, true, 5120);
		flashes.renderOrder = 3;
		const waves = batch("ground-waves", 6, "void main(){vUv=uv*2.-1.;vSeed=aSeed.x;float f=aSeed.w;" + ageParticle("f") + "vAge=age;vAlpha=step(0.,age)*(1.-sm(.12,.65,age));float radius=.2+3.1*sm(.03,.42,age);vec3 p=vec3(f*uLength+position.x*radius,.045,position.y*radius);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}", "void main(){float r=length(vUv);float n=noise(vec3(vUv*6.,vSeed*21.));float mask=exp(-pow((r-.78-n*.07)/(.045+n*.05),2.))*sm(.22,.6,n);gl_FragColor=vec4(vec3(1.,.65,.28),mask*vAlpha*.82);" + output + "}", ground, true, 5132);
		for (const o of [flashes, waves]) {
			const a = o.geometry.getAttribute("aSeed");
			for (let i = 0; i < a.count; i++) a.setW(i, i === 0 || i === a.count - 1 ? i / (a.count - 1) : (i + (a.getX(i) - .5) * .55) / (a.count - 1));
		}
		mesh("debris", batchGeometry(new T.IcosahedronGeometry(.1, 0), 128, 5138), shardShape + "attribute vec4 aSeed;varying vec3 vN,vRock;varying float vAlpha,vHeat,vRockSeed;void main(){" + ageParticle("aSeed.x") + "float flight=(3.0+aSeed.w*2.7)/4.9;float t=flight*sm(0.,flight,age);float signZ=step(.5,aSeed.y)*2.-1.;vec3 center=vec3(aSeed.x*uLength+(aSeed.z-.5)*t*2.,.08+(3.0+aSeed.w*2.7)*t-4.9*t*t,signZ*(.45+t*(1.7+aSeed.z*2.6)));float angle=t*(4.+aSeed.y*9.);mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));vec3 p=shardPoint(position,aSeed);vRockSeed=aSeed.x;p.xy=rot*p.xy;vN=normal;vN.xy=rot*vN.xy;vRock=p;vHeat=1.-sm(.1,1.6,age);vAlpha=step(0.,age)*(1.-sm(.85,1.6,age))*sm(-.05,.09,center.y);center.y=max(.06,center.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(p+center,1.);}", rockPalette + shardShape + "varying vec3 vN,vRock;varying float vAlpha,vHeat,vRockSeed;void main(){float l=.3+.7*max(0.,dot(normalize(vN),normalize(vec3(-.4,1.,.4))));float fade=vAlpha*uFade;float threshold=fract(52.9829189*fract(dot(floor(gl_FragCoord.xy),vec2(.06711056,.00583715))));if(fade<=threshold)discard;gl_FragColor=vec4(heatedRock(vRock,l,vHeat*1.35*shardHeat(vRock,vRockSeed)),1.);\n#include <colorspace_fragment>\n}", ground, false, true);
		batch("flames", 80, "void main(){vUv=uv*2.-1.;vSeed=aSeed.z;" + ageParticle("aSeed.x") + "vAge=age;float mt=motion(uRealTime,1.1,aSeed.w*1.1);vAlpha=sm(.08,.20,age)*(1.-sm(blastTime(aSeed.x)+1.1,blastTime(aSeed.x)+1.9,uRealTime));vec3 p=vec3(aSeed.x*uLength,.25+(sin(mt*4.+aSeed.w*20.)*.5+.5)*.22,(aSeed.y-.5)*1.5);float radius=.22+aSeed.w*.3;vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=position.xy*vec2(radius,radius*2.4)*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}", "void main(){vec2 p=vUv;p.x+=sin(p.y*5.-uRealTime*6.+vSeed*20.)*(p.y+.8)*.16;float n=noise(vec3(p*5.,uRealTime*2.+vSeed*10.));float shape=1.-sm(.20,.65,abs(p.x)+(p.y+.8)*.20);shape*=(1.-sm(.72,1.,abs(vUv.x)))*sm(-1.,-.7,p.y)*(1.-sm(.35+n*.3,.95,p.y));vec3 c=mix(vec3(1.,.14,.003),vec3(1.,.8,.12),sat(1.-p.y)*.7);gl_FragColor=vec4(c,shape*vAlpha*.65*uFade);" + output + "}", ground, true, 5266);
		batch("smoke", 56, "void main(){vUv=uv*2.-1.;vSeed=aSeed.z;" + ageParticle("aSeed.x") + "float duration=2.98+aSeed.w;float t=duration*sm(.12,.12+duration,age);vAge=t;vAlpha=sm(.12,.35,age)*(1.-sm(1.9+aSeed.w,3.1+aSeed.w,age))*groundTail(aSeed.x);vec3 p=vec3(aSeed.x*uLength+(aSeed.z-.5)*t*.6,.3+t*.6,(aSeed.y-.5)*(1.8+t*.8));float radius=.30+(1.-exp(-t))* (.55+aSeed.w*.6);vec4 mv=modelViewMatrix*vec4(p,1.);float sc=length(modelViewMatrix[0].xyz);mv.xy+=position.xy*radius*sc;gl_Position=projectionMatrix*mv;}", "void main(){float n=noise(vec3(vUv*3.2+vec2(vSeed*21.,-vAge*.6),vAge*.3));float d=length(vUv)+(.5-n)*.32;float shape=(1.-sm(.3,1.,d))*sm(.18,.62,n);vec3 c=mix(vec3(.10,.09,.10),vec3(.42,.30,.22),n);gl_FragColor=vec4(c,shape*vAlpha*.35);" + output + "}", ground, false, 5346);
		batch("ground-dust", 96, `
    void main(){vUv=uv*2.-1.;vSeed=aSeed.z;` + ageParticle("aSeed.x") + `
      float q=sm(.035,.85,age),side=step(.5,aSeed.y)*2.-1.;vec3 p=vec3(aSeed.x*uLength+(aSeed.z-.5)*q*.5,.10+sin(q*3.14159)*.20,side*(.35+q*(1.+aSeed.w)));
      vAge=age;vAlpha=sm(.03,.12,age)*(1.-sm(.32,1.1,age))*uFade*.44;float radius=.22+q*.55;vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=position.xy*vec2(radius*1.5,radius*.38)*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}
    `, "void main(){float n=noise(vec3(vUv*4.+vSeed*28.,vAge*.7));float a=(1.-sm(.25,1.,length(vUv)))*sm(.18,.65,n)*vAlpha;gl_FragColor=vec4(mix(vec3(.24,.16,.10),vec3(.48,.33,.19),n),a);\n#include <colorspace_fragment>\n}", ground, false, 17290);
		batch("molten-drops", 160, `
    void main(){vUv=uv*2.-1.;vSeed=aSeed.w;` + ageParticle("aSeed.x") + `
      float q=sm(.09,1.10,age),side=step(.5,aSeed.y)*2.-1.;vec3 p=vec3(aSeed.x*uLength+(aSeed.z-.5)*q*.7,.10+sin(q*3.14159)*(.45+aSeed.z*.6),side*(.30+q*(.5+aSeed.w)));
      vAge=q;vAlpha=sm(.08,.12,age)*(1.-sm(.80,1.12,age))*uFade;float radius=.035+aSeed.w*.045;vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=position.xy*vec2(radius,radius*(1.2+sin(q*3.14159)*1.2))*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}
    `, "void main(){float d=dot(vUv,vUv);float a=(1.-sm(.28,.90,d))*vAlpha;vec3 c=mix(vec3(1.,.68,.025),vec3(.42,.018,.002),vAge);c=mix(c,vec3(1.,.92,.22),exp(-d*12.)*(1.-vAge)*.6);gl_FragColor=vec4(c,a);\n#include <colorspace_fragment>\n}", ground, false, 17386);
		batch("contact-sparks", 384, `
    void main(){vUv=uv*2.-1.;vSeed=aSeed.w;` + ageParticle("aSeed.x") + "\n      float q=sm(0.,.64,age),side=step(.5,aSeed.y)*2.-1.;vec3 tangent=normalize(vec3((aSeed.z-.5)*1.4,.35+aSeed.w,side*(.8+aSeed.z)));\n      vec3 p=vec3(aSeed.x*uLength,.15,0.)+tangent*q*(3.4+aSeed.w*1.8);p.y-=q*q*.35;\n      float width=.018+aSeed.z*.024,span=(.15+aSeed.w*.23)*(1.-q*.65);vAge=q;vAlpha=step(0.,age)*(1.-sm(.12,.65,age))*uFade;\n    vec4 mv=modelViewMatrix*vec4(p,1.);vec3 axis=normalize(mat3(modelViewMatrix)*tangent);vec2 d=axis.xy/max(length(axis.xy),.001);float scale=length(modelViewMatrix[0].xyz);mv.xyz+=vec3(-d.y,d.x,0.)*position.x*width*scale+axis*position.y*span*scale;gl_Position=projectionMatrix*mv;}", "void main(){float a=exp(-vUv.x*vUv.x*12.-vUv.y*vUv.y*3.)*vAlpha;gl_FragColor=vec4(mix(vec3(1.,.88,.24),vec3(1.,.08,.003),vAge),a);\n#include <colorspace_fragment>\n}", ground, true, 17546);
		let groundBlastOffset = 22090;
		let fireBillowSeeds;
		const billowMotion = `
    // Every billow moves, expands and loses heat from the same birth age.
    // Separate ease-out clocks overlap; none waits for the previous pose to finish.
    void groundBillow(vec4 seed,float age,out vec3 p,out vec2 wh,out float spin){
      float t=max(age,0.),a=seed.x*6.283185,r=sqrt(seed.y);
      float expand=1.+.25*easeOut(t/.10),lift=easeOut(t/.52);
      p=vec3(cos(a)*r*.94*(1.-lift*.30),.62+(seed.z-.5)*.94*(1.+lift*.65),sin(a)*r*.94*(1.-lift*.30))*expand;
      p.y+=lift*.32;p.xz*=.88+.12*sin(a*3.+seed.w*5.);
      p*=vec3(1.1884758,1.3567786,1.2639819);
      float drift=easeOut(t/2.15),rise=easeOut(t/1.9);
      p.y+=rise*(1.15+seed.z*.75);p.xz*=1.+drift*.24;
      // Subtract the birth offset: the curling displacement starts at the parent,
      // keeps moving across the fire/smoke change and gradually loses speed.
      float roll=2.15*easeOut(t/2.15);
      p.x+=(sin(roll*1.3+seed.w*8.)-sin(seed.w*8.))*.10;
      p.z+=(cos(roll*1.1+seed.x*7.)-cos(seed.x*7.))*.08;
      wh=vec2(.28+seed.w*.12,.29+seed.w*.15)*(1.+easeOut(t/1.65)*.65);
      spin=sin(a)*.2+roll*(seed.w-.5)*1.5;
    }
    float billowCooling(vec4 seed,float age){
      float outer=sat(seed.z*.8+seed.y*.2);
      float finish=mix(.85,.65,outer)+(seed.w-.5)*.024;
      float progress=sat(max(age,0.)/finish);
      // Monotonic, fast-start thermal progress. A linear share preserves enough
      // orange transition while the cubic share removes the initial dead period.
      return mix(progress,easeOut(progress),.45);
    }
  `;
		function fractureSegments(capacity) {
			const from = new Float32Array(capacity * 6 * 4), to = new Float32Array(capacity * 6 * 4), graphs = [];
			for (let event = 0; event < 6; event++) {
				const random = rnd(((spec.seed ?? 829661) ^ 102556819) + event * 104729), segments = [];
				function branch(x, z, angle, length, steps, width, progress) {
					const nodes = [[x, z]];
					let heading = angle;
					for (let j = 0; j < steps && segments.length < capacity; j++) {
						heading = angle + (random() - .5) * .65;
						const distance = length / steps * (.65 + random() * .7), nx = x + Math.cos(heading) * distance, nz = z + Math.sin(heading) * distance;
						const reach = progress + (1 - progress) * (j + 1) / steps;
						segments.push([
							x,
							z,
							nx,
							nz,
							width * (1 - .72 * j / steps),
							reach
						]);
						nodes.push([nx, nz]);
						x = nx;
						z = nz;
					}
					return nodes;
				}
				const trunks = 3 + Math.floor(random() * 3), rotation = (random() - .5) * .9;
				for (let trunk = 0; trunk < trunks; trunk++) {
					const angle = (trunk % 2 === 0 ? 1 : -1) * Math.PI / 2 + rotation + (random() - .5) * 1.5;
					const length = 1.05 + random() * 2.35, steps = 6 + Math.floor(random() * 5);
					const nodes = branch((random() - .5) * .25, 0, angle, length, steps, .04 + random() * .035, 0);
					const forks = 1 + Math.floor(random() * 2);
					for (let fork = 0; fork < forks; fork++) {
						const at = 2 + Math.floor(random() * Math.max(1, nodes.length - 4)), node = nodes[Math.min(at, nodes.length - 1)];
						branch(node[0], node[1], angle + (random() < .5 ? -1 : 1) * (.5 + random() * .8), length * (.2 + random() * .34), 3 + Math.floor(random() * 3), .022 + random() * .025, at / steps * .75);
					}
				}
				graphs.push(segments);
				segments.forEach((line, i) => {
					const offset = (event * capacity + i) * 4;
					from.set([
						line[0],
						.041,
						line[1],
						line[4]
					], offset);
					to.set([
						line[2],
						.041,
						line[3],
						line[5]
					], offset);
				});
			}
			return {
				from,
				to,
				graphs
			};
		}
		for (let kind = 0; kind < groundBlastSpecs.length; kind++) {
			const [role, capacity, start, end] = groundBlastSpecs[kind], count = capacity * 6;
			const g = batchGeometry(kind === 0 || kind === 4 ? new T.SphereGeometry(1, 36, 24) : kind === 6 ? new T.IcosahedronGeometry(.11, 0) : new T.PlaneGeometry(2, 2), count, groundBlastOffset);
			groundBlastOffset += count;
			if (kind === 1) fireBillowSeeds = g.attributes.aSeed.array;
			if (kind === 11) {
				const parents = new Float32Array(count * 4);
				for (let i = 0; i < count; i++) {
					const event = Math.floor(i / capacity), hero = Math.floor(i % capacity / 2), at = (event * 640 + hero * 10) * 4;
					parents.set(fireBillowSeeds.subarray(at, at + 4), i * 4);
				}
				g.setAttribute("aParent", new T.InstancedBufferAttribute(parents, 4));
			}
			const ids = new Float32Array(count * 2);
			for (let i = 0; i < count; i++) {
				ids[i * 2] = Math.floor(i / capacity);
				ids[i * 2 + 1] = (i % capacity + .5) / capacity;
			}
			g.setAttribute("aBlast", new T.InstancedBufferAttribute(ids, 2));
			if (kind === 13) {
				const cracks = fractureSegments(capacity);
				g.setAttribute("aCrackFrom", new T.InstancedBufferAttribute(cracks.from, 4));
				g.setAttribute("aCrackTo", new T.InstancedBufferAttribute(cracks.to, 4));
				g.userData.fractureGraphs = cracks.graphs;
			}
			const vs = `attribute vec4 aSeed;attribute vec4 aParent;attribute vec2 aBlast;attribute vec4 aCrackFrom,aCrackTo;varying vec2 vUv;varying float vAge,vAlpha,vSeed,vHeat,vLight,vCooling;varying vec3 vSurface,vNormal,vView;${shardShape}${billowMotion}
      void main(){const int K=${kind};vUv=uv*2.-1.;vSeed=aSeed.z;float age=uGroundAge[int(aBlast.x)];vAge=age;
      float alive=step(${start.toFixed(2)},age)*(1.-step(${end.toFixed(2)},age));
      float q=sat((age-${start.toFixed(2)})/${(end - start).toFixed(2)}),e=easeOut(q),a=aSeed.x*6.283185,sg=step(.5,aSeed.y)*2.-1.;
      float bs=2.*min(1.,uLength/10.),f=aBlast.x/5.;vec3 p=vec3(0.);vec3 tangent=normalize(vec3(cos(a)*.38,.18+aSeed.y*.65,sin(a)));vec2 wh=vec2(.1);float spin=0.;vHeat=1.-q;vAlpha=alive;vLight=1.;vCooling=0.;vSurface=position;vNormal=normal;vView=vec3(0.,0.,1.);
      if(K==0||K==4){float r=K==0?1.10*(1.-.62*easeOut(sat(age/.22))):1.12+easeOut(sat(age/.45))*.75;
        float ripple=1.+.035*sin(position.x*9.+aBlast.x*2.)*sin(position.z*11.+age*20.);vec3 sphere=position*r*ripple;
        sphere.y+=r*.88;vec3 center=vec3(f*uLength,0.,0.);vec4 mv=modelViewMatrix*vec4(center+sphere*bs,1.);
        vSurface=position;vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;
        vHeat=1.-sm(.015,.10,age);vAlpha=alive*(K==0?1.-sm(.07,.22,age):1.-sm(.08,.45,age));
        gl_Position=projectionMatrix*mv;return;}

      if(K==1){float hero=1.-step(.5,mod(floor(aBlast.y*640.),10.));
        groundBillow(aSeed,age,p,wh,spin);vLight=hero;vCooling=billowCooling(aSeed,age);
        if(hero<.5){
          // Sparse hot filaments leave the burst; tiny copies of the toon billow made confetti.
          float flight=easeOut(sat(age/.38));p=p*.42+tangent*(.25+flight*1.45);p.y=max(.16,p.y-age*age*1.8);
          wh=vec2(.006+aSeed.z*.009,.055+aSeed.y*.095)*(1.-sm(.12,.38,age)*.75);
          spin=-a*.45;vAlpha*=step(.84,aSeed.w)*(1.-sm(.12,.38,age));vCooling=0.;
        }
        else{vAlpha*=1.-sm(1.65,2.15,age);}
      }
      if(K==2){float rank=floor(aSeed.z*3.),hero=step(.94,aSeed.w);p=tangent*(.65+e*(1.25+rank*.65));p.y+=.22;wh=vec2(mix(.009,.035,hero),(mix(.18,.92,hero)+rank*.08)*(1.-easeOut(q)*.86));vAlpha*=(1.-sm(.25,1.,q))*mix(.30,1.,hero);}
      if(K==3){float arc=floor(aBlast.y*4.),along=fract(aBlast.y*4.);a=arc*1.57+along*1.75+e*2.8;float r=1.25+sin(q*3.14159)*.55-q*.55;float tilt=.35+mod(arc,2.)*.3;p=vec3(cos(a)*r,.48+(sin(a)*.5+.5)*tilt,sin(a)*r);tangent=normalize(vec3(-sin(a),cos(a)*tilt*.5,cos(a)));wh=vec2(.045*(1.-q*.6),.16);vAlpha*=sm(0.,.12,along)*(1.-sm(1.-q*.35,1.,along))*(1.-sm(.5,1.,q));}

      if(K==5){float ray=floor(aBlast.y*8.),part=fract(aBlast.y*8.);float unique=hash(vec3(ray,aBlast.x,17.)),angle=unique*6.283185;vec3 radial=vec3(cos(angle),0.,sin(angle)),side=vec3(-radial.z,0.,radial.x);float zig=sin(part*36.+floor(age*22.)*1.7+ray+aBlast.x*3.)*(.07+unique*.13)*part;p=radial*(.15+part*(1.2+hash(vec3(ray,aBlast.x,41.))*2.6))+side*zig;p.y=.07;tangent=normalize(radial+side*cos(part*36.+floor(age*22.)*1.7+ray)*.6);wh=vec2(.042,.15);vAlpha*=(1.-q)*(.55+.45*sin(age*70.+ray));}
      if(K==6||K==7){float t=max(age,0.),speed=2.3+aSeed.w*2.1;vec3 flight=vec3(cos(a)*.65,0.,sin(a));p=flight*speed*t;p.y=.12+(2.9+aSeed.z*2.4)*t-4.9*t*t;float trail=K==7?aSeed.y*.20*sm(0.,.18,t):0.;p-=vec3(flight.x*speed,2.9+aSeed.z*2.4-9.8*t,flight.z*speed)*trail;p.y=max(.07,p.y);spin=t*(5.+aSeed.z*11.);wh=vec2(.07+q*.13,.13+q*.27);vAlpha*=1.-sm(.70,1.,q);}
      if(K==8){float t=max(age-.06,0.);p=vec3(cos(a)*t*(2.6+aSeed.z),.13+(4.1+aSeed.w)*t-4.2*t*t,sin(a)*t*(3.1+aSeed.y));p.y=max(.04,p.y);tangent=normalize(vec3(cos(a)*(2.6+aSeed.z),4.1+aSeed.w-8.4*t,sin(a)*(3.1+aSeed.y)));wh=vec2(.055+aSeed.z*.045,(.14+aSeed.z*.15)*(1.+.6*sin(q*3.14159)));vAlpha*=1.-sm(.65,1.,q);}
      if(K==9){float side=step(.5,aBlast.y)*2.-1.,part=fract(aBlast.y*2.);p=vec3((part-.5)*1.9,.12+sin(q*3.14159)*(.45+aSeed.y*.55),side*(.4+e*1.2));wh=vec2(.16+.09*aSeed.z,.33*(1.-q*.6));spin=side*(.3+q*1.2);vAlpha*=sin(part*3.14159)*(1.-sm(.4,1.,q));}
      if(K==10){p=vec3(cos(a)*(.5+e*1.8),.14+sin(q*3.14159)*.15,sin(a)*(.5+e*2.0));wh=vec2(.30+q*.3,.10+q*.09);vAlpha*=.52*(1.-sm(.35,1.,q));}
      if(K==11){
        groundBillow(aParent,age,p,wh,spin);vSeed=aParent.z;vCooling=billowCooling(aParent,age);
        float release=.10+aSeed.w*.12,peel=easeOut((age-release)/.85),side=mod(floor(aBlast.y*128.),2.)*2.-1.;
        p+=vec3(cos(a)*wh.x*.30,wh.y*.20,sin(a)*wh.x*.30);
        p+=vec3(side*(.20+aSeed.y*.24),.16+aSeed.z*.23,sin(a)*.24)*peel;
        wh*=mix(.12,.60,peel);spin+=side*peel*.55;
        // Wisps detach from the still-moving cooling parent, rather than waiting
        // to populate a second smoke phase above a finished fire silhouette.
        vAlpha*=easeOut((age-release)/.18)*(1.-sm(1.65,2.15,age))*(.25+.50*vCooling);vLight=1.;
      }
      if(K==12){float r=sqrt(aSeed.y),rise=sm(0.,.35,q);p=vec3(cos(a)*r*(.65+e*.4),.22+aSeed.z*.55+rise*.30,sin(a)*r*(.65+e*.4));p.x+=sin(age*4.+aSeed.w*9.)*.10;wh=vec2(.18+aSeed.w*.16,.23+aSeed.w*.19)*(1.-sm(.55,1.,q)*.65);spin=(aSeed.w-.5)*age*.9;vAlpha*=sm(0.,.025,q)*(1.-sm(.5,1.,q));}
      if(K==13){vec3 delta=aCrackTo.xyz-aCrackFrom.xyz;float span=length(delta),front=sm(.06,.40,age);
        float grow=sm(aCrackTo.w-.13,aCrackTo.w,front);tangent=span>.00001?delta/span:vec3(1.,0.,0.);
        p=aCrackFrom.xyz+delta*grow*.5;wh=vec2(aCrackFrom.w,span*grow*.57);
        vAlpha*=step(.001,aCrackFrom.w)*(1.-sm(.65,1.,q));}
      vec3 center=vec3(f*uLength,0.,0.);p=p*bs+center;
      if(K==6){float cs=cos(spin),sn=sin(spin);mat2 rot=mat2(cs,sn,-sn,cs);vec3 rock=shardPoint(position,aSeed);vSurface=rock;rock.xy=rot*rock.xy;rock.yz=rot*rock.yz;vLight=.3+.7*abs(normal.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(p+rock*bs,1.);}
      else if(K==4||K==5||K==13){vec3 along=K==4?vec3(-sin(a),0.,cos(a)):tangent;vec3 side=vec3(-along.z,0.,along.x);vec3 offset=(along*position.y*wh.y+side*position.x*wh.x)*bs;gl_Position=projectionMatrix*modelViewMatrix*vec4(p+offset,1.);}
      else{vec4 mv=modelViewMatrix*vec4(p,1.);vec2 d=(modelViewMatrix*vec4(tangent,0.)).xy;d=length(d)>.001?normalize(d):vec2(0.,1.);vec2 x=vec2(d.y,-d.x);if(K!=2&&K!=3&&K!=8){d=vec2(sin(spin),cos(spin));x=vec2(d.y,-d.x);}mv.xy+=(x*position.x*wh.x+d*position.y*wh.y)*bs*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}
    }`;
			const fs = rockPalette + shardShape + `varying vec2 vUv;varying float vAge,vAlpha,vSeed,vHeat,vLight,vCooling;varying vec3 vSurface,vNormal,vView;
      void main(){const int K=${kind};float d=dot(vUv,vUv),n=noise(vec3(vUv*4.+vSeed*29.,vAge*2.));float mask=(1.-sm(.15,1.,d))*(.55+.45*sm(.18,.72,n));float solidMask=0.;const bool softPass=false;
      vec3 col=mix(vec3(.8,.025,.001),vec3(1.,.62,.035),vHeat);
      if(K==0||K==4){float facing=abs(dot(normalize(vNormal),normalize(vView))),rad=sqrt(max(0.,1.-facing*facing));float grain=noise(vSurface*5.+vSeed*17.);float edge=1.-sm(.78,.995,rad);float breakup=K==4?sm(.18+vAge*1.65-.06,.18+vAge*1.65+.06,grain):1.;
        col=mix(vec3(1.,.025,.002),vec3(1.,.55,.015),1.-sm(.35,.90,rad));col=mix(col,vec3(2.1,1.95,1.55),(1.-sm(.48,.86,rad))*vHeat);
        float alpha=vAlpha*edge*breakup;if(alpha<.003)discard;gl_FragColor=vec4(col,alpha);
        #include <colorspace_fragment>
        return;}

      if(K==1&&vLight<.5){
        if(softPass||uGroundPhase>1.5)discard;
        float taper=pow(max(0.,1.-abs(vUv.y)),.8),silhouette=(1.-sm(.2,.9,abs(vUv.x)/max(.02,taper)))*(1.-sm(.6,1.,abs(vUv.y)));
        if(silhouette*vAlpha<.36)discard;
        gl_FragColor=vec4(mix(vec3(.7,.025,.002),vec3(1.,.48,.018),1.-sat(vAge/.38)),1.);
        #include <colorspace_fragment>
        return;}
      if(K==1||K==11||K==12){float ang=atan(vUv.y,vUv.x),rad=length(vUv);float turn=vSeed*6.28318;vec2 lobe=vec2(cos(turn),sin(turn))*.31;float contour=min(length(vUv)-.64,min(length(vUv-lobe)-.53,length(vUv+vec2(lobe.y,-lobe.x)*1.2)-.40));contour+=.022*sin(ang*7.+vSeed*11.+vAge);float edge=rad-contour;float body=1.-sm(-.018,.018,contour);float rollAge=K==12?vAge:2.15*easeOut(max(vAge,0.)/2.15);float roll=noise(vec3(vUv*2.6+vec2(rollAge*.32,-rollAge*.48),vSeed*17.));float bulge=sqrt(max(0.,1.-dot(vUv,vUv)));float shadeBand=.25+.34*bulge+.16*vUv.y+.22*(roll-.5);float erosion=K==11||(K==1&&vLight>.5)?sm(1.65,2.15,vAge):K==12?sm(1.12,1.65,vAge):sm(.38,.60,vAge);body*=1.-sm(.40-erosion*.7,.47-erosion*.7,erosion-roll);solidMask=body;float rim=sm(edge-.13,edge-.02,rad)*body;vec3 smokeColor=mix(vec3(.008,.002,.015),vec3(.025,.006,.024),sm(.44,.47,shadeBand));smokeColor=mix(smokeColor,vec3(.065,.014,.032),sm(.62,.65,shadeBand));
        vec3 fireColor=mix(vec3(.42,.012,.003),vec3(1.,.18,.004),sm(.40,.42,shadeBand));fireColor=mix(fireColor,vec3(1.,.78,.065),sm(.60,.62,shadeBand));
        float hot=1.;
        if(K==11||(K==1&&vLight>.5)){
          // The erosion order is fixed in each billow's local coordinates.
          // Animated rolling remains in the shading, so cooled patches cannot
          // re-ignite just because the noise texture scrolled beneath the front.
          float thermal=noise(vec3(vUv*2.6,vSeed*17.));
          float field=clamp(.40+(thermal-.5)*.30-vUv.y*.42,.08,.90);
          hot=1.-sm(field-.06,field+.08,vCooling);
          fireColor=mix(vec3(.70,.045,.003),fireColor,sm(.05,.62,hot));
          col=mix(smokeColor,fireColor,hot);
          if(uGroundPhase>.5&&uGroundPhase<1.5){body*=hot;solidMask=body;}
          if(uGroundPhase>1.5){body*=1.-hot;solidMask=body;}
        }else{float cool=K==12?sm(.65,1.65,vAge):sm(.26,.60,vAge);col=mix(fireColor,vec3(.35,.018,.025)+fireColor*.25,cool*.65);}
        float halo=exp(-rad*rad*3.)*.16*hot;mask=max(body,halo);col+=vec3(.16,.025,.001)*(1.-body)*hot;
      }
      if(K==2||K==3||K==5||K==13){mask=exp(-vUv.x*vUv.x*14.)*(1.-sm(.5,1.,abs(vUv.y)));col=mix(vec3(.60,.015,.001),vec3(1.,.84,.28),vHeat);}
      if(K==6){float threshold=fract(52.9829189*fract(dot(floor(gl_FragCoord.xy),vec2(.06711056,.00583715))));if(vAlpha<=threshold)discard;gl_FragColor=vec4(heatedRock(vSurface,vLight,vHeat*1.35*shardHeat(vSurface,vSeed)),1.);}
      else{if(K==7||K==10){mask*=sm(.14,.65,n);col=mix(vec3(.12,.085,.07),vec3(.49,.29,.16),n);}
      if(K==8){mask=exp(-d*3.5);col=mix(vec3(.26,.005,.001),vec3(1.,.72,.08),vHeat);}
      if(K==9){mask*=sm(.25+vAge*.5,.75,n);col=mix(vec3(.85,.04,.001),vec3(1.,.69,.08),n);}
      if(K==4){float edge=1.-sm(.76,1.,abs(vUv.y));mask=edge*(1.-sm(.70,1.,abs(vUv.x)));col=mix(vec3(1.,.08,.002),vec3(1.,.75,.04),sm(-.6,.25,vUv.x));}
      if(K==1||K==11||K==12){
        // Both passes use the same fixed local erosion field. The opaque pass
        // writes depth only inside surviving billows, never over a whole quad.
        if(vAlpha<=.001)discard;
        float grain=noise(vec3(vUv*9.+vSeed*29.,vSeed*17.));
        float coverage=solidMask*sm(1.-vAlpha-.10,1.-vAlpha+.10,grain);
        if(softPass){float fringe=max(mask-solidMask,0.)*vAlpha+min(coverage,.49)*.22;
          if(coverage>=.5||fringe<.003)discard;gl_FragColor=vec4(col,min(fringe,.18));}
        else{if(coverage<.5)discard;gl_FragColor=vec4(col,1.);}
      }else{float alpha=mask*vAlpha;if(alpha<.003)discard;gl_FragColor=vec4(col,alpha);}}
#include <colorspace_fragment>
}`;
			const o = mesh("ground-burst-" + role, g, vs, fs, ground, [
				0,
				2,
				3,
				4,
				5,
				8,
				13
			].includes(kind), [
				1,
				6,
				11,
				12
			].includes(kind));
			if (kind === 0 || kind === 4) {
				o.material.side = T.FrontSide;
				o.renderOrder = 0;
			}
			o.userData.groundBurstWindow = [start, end];
			o.userData.particlesPerEvent = capacity;
			if ([5, 13].includes(kind)) o.renderOrder = -1;
			groundBlastObjects.push(o);
			if ([
				1,
				11,
				12
			].includes(kind)) {
				const softName = "ground-burst-" + role + "-soft";
				extraAliases[softName] = groundBlastSpecs[kind][4];
				const soft = mesh(softName, g, vs, fs.replace("const bool softPass=false;", "const bool softPass=true;"), ground, false);
				soft.userData.groundBurstWindow = [start, end];
				soft.userData.reusesParticles = o.name;
				groundBlastObjects.push(soft);
			}
		}
		const contactBurstVertex = `attribute vec4 aSeed;varying vec2 vUv;varying float vLife,vSeed,vRadial;
    void main(){const int kind=0;vUv=uv*2.-1.;vSeed=aSeed.w;
      float age=uContactState.x,extent=uContactState.y,az=aSeed.y*6.283185;
      float drift=sin(age*(1.4+aSeed.w*.8)+aSeed.x*17.);
      vLife=uContactState.z*uBeam*(.94+.06*drift);vec3 p;vec2 size;
      if(kind==0){
        // Broad overlapping heat lobes, not hundreds of independently readable beads.
        float r=.10+.24*sqrt(aSeed.z);p=vec3(cos(az)*r,.13+aSeed.x*.28,sin(az)*r);
        p+=vec3(sin(age*1.5+aSeed.w*23.),sin(age*1.7+aSeed.z*19.)*.6,cos(age*1.2+aSeed.x*21.))*.035;
        size=vec2(.60+.28*aSeed.w,.43+.34*aSeed.x);vRadial=r;
      }else if(kind==1){
        float r=.42+.82*sqrt(aSeed.z);p=vec3(cos(az)*r,.10+aSeed.x*.80,sin(az)*r);
        p+=vec3(cos(age*1.9+az),sin(age*2.2+aSeed.w*21.),sin(age*1.6+az))*.055;
        size=vec2(.055+.13*aSeed.w,.075+.20*aSeed.x);vRadial=r;
        vLife*=.55+.45*sin(age*(1.6+aSeed.w)+aSeed.z*23.)*sin(age*(1.6+aSeed.w)+aSeed.z*23.);
      }else{
        float r=.16+.37*sqrt(aSeed.z);p=vec3(cos(az)*r,.20+aSeed.x*.22,sin(az)*r);
        size=vec2(1.05+.45*aSeed.w,.78+.45*aSeed.x);vRadial=r;
      }
      p*=extent;vec4 mv=modelViewMatrix*vec4(p,1.);
      float spin=aSeed.w*6.283185+age*(kind==1?.13:.055);
      vec2 corner=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*position.xy;
      mv.xy+=corner*size*extent*length(modelViewMatrix[0].xyz);
      gl_Position=projectionMatrix*mv;
    }`;
		const contactBurstFragment = "varying vec2 vUv;varying float vLife,vSeed,vRadial;\n    void main(){const int kind=0;\n      float age=uContactState.x;\n      // Broad flowing distortion breaks the outside while keeping an unbroken hot center.\n      float grain=noise(vec3(vUv*2.7+vec2(age*.15,-age*.21),vSeed*31.));\n      float fine=noise(vec3(vUv*6.2+vec2(-age*.12,age*.16),vSeed*17.));\n      float d=length(vUv);float warped=d+(grain-.5)*.18*sm(.10,.70,d);\n      float rim=1.-sm(.55,1.,warped);\n      float alpha;vec3 c;\n      if(kind==0){\n        float heat=exp(-warped*warped*5.2);\n        c=mix(vec3(1.15,.028,.002),vec3(1.60,.48,.012),sm(.08,.65,heat));\n        c=mix(c,vec3(1.65,1.18,.24),sm(.54,.91,heat));\n        c=mix(c,vec3(1.80,1.65,.92),sm(.94,1.,heat)*.55);\n        alpha=exp(-warped*warped*2.8)*rim*vLife*.24;\n      }else if(kind==1){\n        // Secondary wisps have a soft torn edge, never an opaque shard boundary.\n        float tear=.62+.38*sm(.18,.74,grain*.7+fine*.3);\n        alpha=exp(-warped*warped*3.6)*rim*tear*vLife*.34;\n        c=mix(vec3(1.05,.025,.001),vec3(1.50,.50,.025),exp(-d*d*5.));\n      }else{\n        // Soft red shoulder; low central contribution preserves the yellow hot mass.\n        float shoulder=sm(.08,.43,d);\n        alpha=exp(-d*d*3.1)*rim*shoulder*vLife*.065;\n        c=mix(vec3(1.05,.012,.001),vec3(1.20,.15,.003),exp(-d*d*4.));\n      }\n      if(alpha<.0008)discard;gl_FragColor=vec4(c,alpha);\n    \n#include <colorspace_fragment>\n}";
		const endpointRoles = [
			["beam-source-glow", 80],
			["beam-source-streams", 96],
			["beam-source-arcs", 64],
			["beam-contact-crown", 16],
			["beam-contact-sparks", 128],
			["beam-contact-waves", 64],
			["beam-contact-fragments", 64],
			["beam-contact-halo", 16]
		];
		for (let k = 0; k < endpointRoles.length; k++) {
			const [name, count] = endpointRoles[k];
			extraAliases[name] = k < 3 ? "beam" : "impact-flash";
			const particleKind = k === 3 ? 0 : k === 6 ? 1 : k === 7 ? 2 : -1;
			const o = particleKind >= 0 ? mesh(name, batchGeometry(new T.PlaneGeometry(2, 2), count, groundBlastOffset), contactBurstVertex.replace("const int kind=0;", "const int kind=" + particleKind + ";"), contactBurstFragment.replace("const int kind=0;", "const int kind=" + particleKind + ";"), root, true, false) : batch(name, count, `void main(){vUv=uv*2.-1.;vSeed=aSeed.w;float clock=${k >= 3 ? "uRealTime" : "uTime"};float phase=fract(clock*(2.+aSeed.w)+aSeed.x),q=sm(0.,1.,phase),angle=aSeed.y*6.283185;
      float radius=.855+(.25875-.855)*sat((uTime-11.23)/.22),spread=.16+radius*.60;vec3 p=vec3(0.),tangent=vec3(0.,0.,1.);float width=.08,span=.10;
      vAge=q;vAlpha=uBeam*(.45+.55*sin(phase*3.14159));
      ${k === 0 ? "p=vec3(cos(angle),sin(angle),0.)*sqrt(aSeed.z)*spread;p.z=.02; width=.14+radius*.12;span=width;vAlpha*=.30;" : k === 1 ? "p=vec3(cos(angle),sin(angle),0.)*(.08+q*spread*.85);p.z=.03+q*(.30+radius*.7);tangent=normalize(vec3(cos(angle)*.3,sin(angle)*.3,1.));width=.018;span=.10+.10*(1.-q);vAlpha*=sin(phase*3.14159);" : k === 2 ? "angle=aSeed.x*6.283185+uTime*2.8;p=vec3(cos(angle),sin(angle),0.)*spread;p.z=.05;tangent=vec3(-sin(angle),cos(angle),0.);width=.027;span=.09;vAlpha*=step(.30,fract(aSeed.x*4.));" : k === 3 ? "float outer=step(.70,aSeed.x);float r=sqrt(aSeed.z)*spread*mix(.72,1.75,outer);p=vec3(cos(angle)*r,.28+aSeed.z*.46+sin(clock*9.+aSeed.w*20.)*.045,sin(angle)*r);width=mix(.38+radius*.38,.60+radius*.55,outer);span=width*mix(1.12,.70,outer);vAlpha*=mix(.83,.22,outer);" : k === 4 ? "float launch=easeOut(phase);tangent=normalize(vec3(cos(angle),.35+aSeed.z*1.2,sin(angle)));p=tangent*launch*(1.05+radius*1.6+aSeed.w*.65);p.y+=.20;p.y-=launch*launch*.30;width=.018+aSeed.w*.012;span=.07+.14*(1.-phase);vAlpha*=pow(1.-phase,.65)*.10;" : "p=vec3(cos(angle),0.,sin(angle))*(.38+q*(.9+radius*1.3));p.y=.08;tangent=vec3(-sin(angle),0.,cos(angle));width=.085*(1.-q);span=.18;vAlpha*=sin(phase*3.14159)*step(.20,fract(aSeed.y*5.))*.16;"}
      ${k === 5 ? "vec3 side=vec3(-tangent.z,0.,tangent.x);gl_Position=projectionMatrix*modelViewMatrix*vec4(p+side*position.x*width+tangent*position.y*span,1.);}" : "vec4 mv=modelViewMatrix*vec4(p,1.);vec2 d=(modelViewMatrix*vec4(tangent,0.)).xy;d=length(d)>.001?normalize(d):vec2(0.,1.);mv.xy+=(vec2(d.y,-d.x)*position.x*width+d*position.y*span)*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}"}
      `, `void main(){float d=dot(vUv,vUv),mask=exp(-vUv.x*vUv.x*10.-vUv.y*vUv.y*3.);vec3 c=mix(vec3(1.,.12,.002),vec3(1.,.85,.13),exp(-d*4.));${k === 3 ? "mask=exp(-d*3.2)*(1.-sm(.65,1.,sqrt(d)));c=mix(vec3(.95,.018,.002),vec3(1.,.44,.015),exp(-d*2.5));c=mix(c,vec3(1.,.97,.78),1.-sm(.03,.38,d));" : ""}float a=mask*vAlpha;if(a<.003)discard;gl_FragColor=vec4(c,a);
#include <colorspace_fragment>
}`, root, k !== 0 && k !== 3, groundBlastOffset);
			groundBlastOffset += count;
			beamEndpointObjects.push(o);
			if (particleKind >= 0) {
				o.userData.contactParticleRole = [
					"core",
					"fragments",
					"glow"
				][particleKind];
				o.userData.contactParticleCount = count;
			}
		}
		group.userData.starbladeLayerTypes.beamEnds = endpointRoles.map((r) => r[0]);
		const rockSeeds = groundBlastObjects[6].geometry.getAttribute("aSeed"), dustSeeds = groundBlastObjects[7].geometry.getAttribute("aSeed");
		for (let i = 0; i < dustSeeds.count; i++) {
			const parent = Math.floor(i / 2);
			dustSeeds.setXYZW(i, rockSeeds.getX(parent), i % 2 ? .8 : .2, rockSeeds.getZ(parent), rockSeeds.getW(parent));
		}
		for (const surface of [
			scorch,
			lava,
			cracks
		]) surface.renderOrder = -2;
		const groundGeometry = [
			banks,
			scorch,
			lava,
			cracks
		];
		for (const o of groundGeometry) o.geometry.userData.basePosition = o.geometry.attributes.position.array.slice();
		const builtIn = new T.Group();
		builtIn.name = "starblade-default-sword";
		const bladeShape = new T.Shape();
		bladeShape.moveTo(-.12, .68);
		bladeShape.lineTo(-.19, 2.65);
		bladeShape.lineTo(0, 3);
		bladeShape.lineTo(.19, 2.65);
		bladeShape.lineTo(.12, .68);
		bladeShape.closePath();
		function solid(g, color) {
			const m = new T.MeshBasicMaterial({ color }), o = new T.Mesh(g, m);
			builtIn.add(o);
			geometries.add(g);
			materials.add(m);
			return o;
		}
		solid(new T.ExtrudeGeometry(bladeShape, {
			depth: .09,
			bevelEnabled: true,
			bevelThickness: .025,
			bevelSize: .025,
			bevelSegments: 1,
			steps: 1
		}).translate(0, 0, -.045), 16766053);
		solid(new T.BoxGeometry(.82, .1, .17).translate(0, .65, 0), 12154145);
		solid(new T.CylinderGeometry(.075, .075, .48, 8).translate(0, .34, 0), 7950380);
		solid(new T.OctahedronGeometry(.13).translate(0, .06, 0), 14920772);
		function release(entry) {
			if (!entry) return;
			entry.wrapper.removeFromParent();
			for (const m of entry.ownedMaterials) m.dispose();
		}
		function prepare(source, configuration = {}) {
			if (!source?.isObject3D) throw new TypeError("setObject expects a loaded rigid Mesh/Group.");
			const height = configuration.height ?? 3, rotation = configuration.rotation ?? [
				0,
				0,
				0
			];
			if (!Number.isFinite(height) || height <= 0 || height > 100 || !Array.isArray(rotation) || rotation.length !== 3 || !rotation.every(Number.isFinite)) throw new TypeError("height must be 0 < height <= 100; rotation is three radians.");
			let count = 0;
			source.traverse((o) => {
				if (o === group || o === root || o === sword || o === mounted?.model || o === mounted?.wrapper) throw new TypeError("Cannot use the effect as its own source.");
				if (o.isSkinnedMesh || o.isInstancedMesh || o.isBatchedMesh || o.isLine || o.isPoints || o.isSprite || o.isMesh && Object.keys(o.geometry.morphAttributes).length) throw new TypeError("Only rigid meshes are supported; no skins, morphs, instances, lines or sprites.");
				if (o.isMesh) {
					count++;
					for (const m of [o.material].flat()) if (!m || !(m.isMeshBasicMaterial || m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshToonMaterial || m.isMeshMatcapMaterial) || m.onBeforeCompile !== T.Material.prototype.onBeforeCompile) throw new TypeError("Use standard mesh materials without custom shader hooks.");
				}
			});
			if (!count) throw new TypeError("Model must contain a mesh.");
			const entry = {
				wrapper: new T.Group(),
				model: source.clone(true),
				ownedMaterials: [],
				height,
				samples: null
			};
			try {
				entry.model.position.set(0, 0, 0);
				entry.wrapper.add(entry.model);
				entry.wrapper.rotation.set(...rotation);
				entry.wrapper.updateMatrixWorld(true);
				const box = new T.Box3().setFromObject(entry.wrapper, true), extent = box.getSize(new T.Vector3());
				if (box.isEmpty() || ![
					extent.x,
					extent.y,
					extent.z
				].every(Number.isFinite) || extent.y < 1e-6) throw new TypeError("Model must have finite, nonzero height.");
				const scale = height / extent.y;
				entry.wrapper.scale.setScalar(scale);
				entry.wrapper.position.set(-(box.min.x + box.max.x) * .5 * scale, .25 - box.min.y * scale, -(box.min.z + box.max.z) * .5 * scale);
				entry.wrapper.updateMatrixWorld(true);
				const positions = [], point = new T.Vector3();
				entry.model.traverseVisible((o) => {
					if (!o.isMesh) return;
					const g = o.geometry, a = g.getAttribute("position"), index = g.index, total = index?.count ?? a.count;
					let begin = Math.max(0, g.drawRange.start), end = Math.min(total, begin + g.drawRange.count);
					begin = Math.ceil(begin / 3) * 3;
					end = Math.floor(end / 3) * 3;
					for (let i = begin; i < end; i += 3) {
						if (Array.isArray(o.material)) {
							const match = g.groups.find((k) => i >= k.start && i < k.start + k.count);
							if (!match || o.material[match.materialIndex]?.visible === false) continue;
						} else if (!o.material.visible) continue;
						for (let j = 0; j < 3; j++) {
							point.fromBufferAttribute(a, index ? index.getX(i + j) : i + j).applyMatrix4(o.matrixWorld);
							if (![
								point.x,
								point.y,
								point.z
							].every(Number.isFinite)) throw new TypeError("Non-finite model vertex.");
							positions.push(point.x, point.y, point.z);
						}
					}
				});
				const sampleGeo = new T.BufferGeometry();
				sampleGeo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
				try {
					const sampler = new MeshSurfaceSampler(new T.Mesh(sampleGeo, builtIn.children[0].material)).setRandomGenerator(rnd(spec.seed ?? 829661)).build();
					if (!(sampler.distribution.at(-1) > 1e-9)) throw new TypeError("Model must contain visible non-degenerate surface triangles.");
					entry.samples = new Float32Array(starCapacity * 3);
					for (let i = 0; i < starCapacity; i++) {
						sampler.sample(point);
						point.toArray(entry.samples, i * 3);
					}
				} finally {
					sampleGeo.dispose();
				}
				const map = /* @__PURE__ */ new Map();
				entry.model.traverse((o) => {
					if (!o.isMesh) return;
					o.castShadow = false;
					o.receiveShadow = false;
					o.frustumCulled = false;
					const adapt = (original) => {
						if (map.has(original)) return map.get(original);
						const m = original.clone();
						map.set(original, m);
						entry.ownedMaterials.push(m);
						m.onBeforeCompile = (shader) => {
							shader.uniforms.uStarbladeTime = u.uTime;
							shader.uniforms.uStarbladeHeight = u.uHeight;
							shader.uniforms.uStarbladeWorldToRoot = u.uWorldToRoot;
							shader.vertexShader = "varying float vStarbladeY;uniform mat4 uStarbladeWorldToRoot;\n" + shader.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\nvStarbladeY=(uStarbladeWorldToRoot*modelMatrix*vec4(transformed,1.)).y;");
							shader.fragmentShader = "varying float vStarbladeY;uniform float uStarbladeTime,uStarbladeHeight;\n" + shader.fragmentShader.replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nfloat front=1.-clamp((uStarbladeTime-.45)/1.3,0.,1.);float h=(vStarbladeY-.25)/uStarbladeHeight;if(uStarbladeTime>.45&&h>front)discard;").replace("#include <opaque_fragment>", "float band=step(.45,uStarbladeTime)*exp(-abs(h-front)*72.);outgoingLight=mix(outgoingLight,vec3(3.8,1.9,.32),band);\n#include <opaque_fragment>");
						};
						m.customProgramCacheKey = () => "starblade-dissolve-v1";
						return m;
					};
					o.material = Array.isArray(o.material) ? o.material.map(adapt) : adapt(o.material);
					o.onBeforeRender = () => {
						root.updateWorldMatrix(true, false);
						u.uWorldToRoot.value.copy(root.matrixWorld).invert();
					};
				});
				entry.wrapper.name = "starblade-mounted-sword";
				return entry;
			} catch (e) {
				release(entry);
				throw e;
			}
		}
		function prepareFlights(samples, height) {
			const count = 19968, rows = Math.ceil(count * flightSamples / flightWidth);
			const data = new Float32Array(flightWidth * rows * 4), point = new T.Vector3();
			for (let id = 0; id < count; id++) {
				const geo = id < starCapacity ? starGeo : formationGeo, i = id < starCapacity ? id : id - starCapacity;
				const seed = geo.attributes.aSeed.array, sx = seed[i * 4], sy = seed[i * 4 + 1], sz = seed[i * 4 + 2], sw = seed[i * 4 + 3];
				const origin = new T.Vector3().fromArray(samples, i * 3), branch = Math.floor(sx * 4) * Math.PI / 2 + Math.PI / 4;
				const phase = branch + sz * Math.PI * 2 + sw * .7, radius = 2 * (2.5 + sy * 3.4), turns = .85 + (1 - sy) * .7 + sw * .15;
				const orbit = (q, out) => {
					const angle = phase + Math.PI * 2 * turns * q, rad = radius * (1 - q) + (.65 + sy * .3) * q;
					return out.set(Math.cos(angle) * rad, coreHeight + (sw - .5) * 3 * (1 - q) + Math.sin(angle + sz * 4) * (.35 + sy * .65) * (1 - q), Math.sin(angle) * rad * (.72 + sw * .35));
				};
				const a = orbit(0, new T.Vector3());
				const ta = orbit(1e-4, new T.Vector3()).sub(a).normalize();
				const approach = [
					origin,
					origin.clone().add(new T.Vector3(Math.cos(branch) * 3, 1, Math.sin(branch) * 3)),
					a.clone().addScaledVector(ta, -3.5),
					a
				];
				const bezier = (points, q, out) => {
					const v = 1 - q;
					return out.copy(points[0]).multiplyScalar(v * v * v).addScaledVector(points[1], 3 * v * v * q).addScaledVector(points[2], 3 * v * q * q).addScaledVector(points[3], q * q * q);
				};
				const curve = new T.Curve();
				curve.getPoint = (q, out = new T.Vector3()) => q < .3 ? bezier(approach, q / .3, out) : orbit((q - .3) / .7, out);
				curve.arcLengthDivisions = 1024;
				curve.updateArcLengths();
				const birth = .45 + (1 - clamp((origin.y - .25) / height)) * 1.3, speed = curve.getLength() / (6.5 - birth);
				for (let n = 0; n < flightSamples; n++) {
					curve.getPointAt(n / 127, point);
					const offset = (id * flightSamples + n) * 4;
					data[offset] = point.x;
					data[offset + 1] = point.y;
					data[offset + 2] = point.z;
					data[offset + 3] = speed;
				}
			}
			if (!data.every(Number.isFinite)) throw new TypeError("Sword flight paths exceed finite GPU coordinates.");
			const texture = new T.DataTexture(data, flightWidth, rows, T.RGBAFormat, T.FloatType);
			texture.minFilter = T.NearestFilter;
			texture.magFilter = T.NearestFilter;
			texture.generateMipmaps = false;
			texture.needsUpdate = true;
			return texture;
		}
		function acquireFlights(candidate, source, configuration) {
			if (source != null) {
				const texture = prepareFlights(candidate.samples, candidate.height);
				return {
					texture,
					release: () => texture.dispose()
				};
			}
			let registry = starbladeFlightRegistries.get(T);
			if (!registry) {
				registry = /* @__PURE__ */ new Map();
				starbladeFlightRegistries.set(T, registry);
			}
			const key = JSON.stringify([
				1,
				(spec.seed ?? 829661) >>> 0,
				candidate.height,
				configuration.rotation ?? [
					0,
					0,
					0
				],
				starCapacity,
				formationCount
			]);
			let entry = registry.get(key);
			if (!entry) {
				entry = {
					texture: prepareFlights(candidate.samples, candidate.height),
					references: 0
				};
				registry.set(key, entry);
			}
			entry.references++;
			let released = false;
			return {
				texture: entry.texture,
				release() {
					if (released) return;
					released = true;
					if (--entry.references === 0) {
						registry.delete(key);
						entry.texture.dispose();
					}
				}
			};
		}
		function commitFlights(lease) {
			const old = flightLease, texture = lease.texture;
			flightLease = lease;
			u.uFlightPaths.value = texture;
			u.uFlightSize.value.set(texture.image.width, texture.image.height);
			old?.release();
			for (const row of trailBatches) {
				const births = row.object.geometry.attributes.aBirth;
				for (let n = 0; n < row.ids.length; n++) {
					const i = row.ids[n];
					births.array[n] = .45 + (1 - clamp((mounted.samples[i * 3 + 1] - .25) / mounted.height)) * 1.3;
				}
				births.needsUpdate = true;
			}
		}
		function setObject(source, configuration = {}) {
			if (disposed) throw new Error("Effect disposed.");
			const candidate = prepare(source ?? builtIn, configuration);
			let flights;
			try {
				flights = acquireFlights(candidate, source, configuration);
			} catch (error) {
				release(candidate);
				throw error;
			}
			release(mounted);
			mounted = candidate;
			sword.add(candidate.wrapper);
			u.uHeight.value = candidate.height;
			starGeo.attributes.aOrigin.array.set(candidate.samples);
			starGeo.attributes.aOrigin.needsUpdate = true;
			formationGeo.attributes.aOrigin.array.set(candidate.samples);
			formationGeo.attributes.aOrigin.needsUpdate = true;
			commitFlights(flights);
			reset();
			return source === null ? null : candidate.model;
		}
		function setSweepPath(start, end) {
			if (disposed) throw new Error("Effect disposed.");
			if (!start?.isVector3 || !end?.isVector3 || ![
				start.x,
				start.y,
				start.z,
				end.x,
				end.y,
				end.z
			].every(Number.isFinite) || Math.abs(start.y) > 1e-6 || Math.abs(end.y) > 1e-6) throw new TypeError("Sweep endpoints must be finite Vector3 values on local y=0, at least .1 apart.");
			const dx = end.x - start.x, dz = end.z - start.z, length = Math.hypot(dx, dz), angle = -Math.atan2(dz, dx);
			const gpuFinite = (value) => Number.isFinite(Math.fround(value));
			if (length < .1 || ![
				length,
				angle,
				dx / length,
				dz / length,
				start.x * 2,
				start.z * 2,
				end.x * 2,
				end.z * 2,
				length * 2
			].every(gpuFinite)) throw new TypeError("Sweep path exceeds finite GPU coordinates or is too short.");
			const candidates = groundGeometry.map((o) => {
				const data = o.geometry.userData.basePosition.slice();
				for (let i = 0; i < data.length; i += 3) data[i] *= length / 20;
				if (!data.every(Number.isFinite)) throw new TypeError("Sweep path produces invalid ground vertices.");
				return data;
			});
			pathStart.copy(start);
			pathEnd.copy(end);
			u.uLength.value = length;
			groundGeometry.forEach((o, i) => {
				const attr = o.geometry.attributes.position;
				attr.array.set(candidates[i]);
				attr.needsUpdate = true;
				o.geometry.computeBoundingSphere();
			});
			ground.position.copy(start);
			ground.rotation.y = angle;
			reset();
		}
		function sync() {
			const actualTime = time;
			const poseTime = actualTime <= 3.5 ? actualTime : actualTime < 5.5 ? 3.5 : actualTime <= starbladeStages.thinEnd ? actualTime - 2 : actualTime < starbladeStages.sweepEnd ? 11.45 + (actualTime - starbladeStages.thinEnd) * (1.95 / 4.25) : actualTime - 4.3;
			syncPose(Math.round(poseTime * 1e10) / 1e10, actualTime);
		}
		function syncPose(time, actualTime) {
			u.uRealTime.value = actualTime;
			const contactElapsed = Math.max(0, actualTime - starbladeStages.contact);
			const contactRadius = .855 + -.59625 * clamp((actualTime - starbladeStages.thinStart) / .22);
			u.uContactState.value.set(contactElapsed, .72 + contactRadius * .5, actualTime >= starbladeStages.contact && actualTime < starbladeStages.sweepEnd ? 1 : 0, 1);
			u.uTime.value = time;
			u.uFade.value = 1 - smooth(starbladeStages.end - 1.1, starbladeStages.end, actualTime);
			u.uAir.value = smooth(4.5, 5.65, time) * (1 - smooth(19.12, 19.75, actualTime));
			u.uCrossRetraction.value = 1 - smooth(19.32, 20.12, actualTime);
			const crossStarted = actualTime >= crossTiming.start, crossAge = Math.max(0, actualTime - crossTiming.start);
			const crossBodyStarted = actualTime >= starbladeStages.crossBody, crossBodyAge = Math.max(0, actualTime - starbladeStages.crossBody);
			u.uCrossAlpha.value = crossBodyStarted ? u.uCrossRetraction.value : 0;
			u.uCrossAge.value = crossAge;
			u.uCrossHeat.value = crossStarted ? 1 - smooth(.035, crossTiming.white, crossAge) : 0;
			u.uCrossTravel.value = easeOut(crossAge / crossTiming.tail);
			u.uCrossExpansion.value = crossBodyStarted ? easeOut(crossBodyAge / (starbladeStages.crossBodyEnd - starbladeStages.crossBody)) : 0;
			u.uCoreRed.value = smooth(7.7, 8.28, time) * (1 - smooth(8.8, 9.4, time));
			u.uCrossFlash.value = crossStarted && actualTime < starbladeStages.flashEnd ? 1 : 0;
			const erosion = easeOut((crossAge - 1 / 30) / (crossTiming.tail - 1 / 30));
			u.uFlashErosion.value = -.04 + 1.08 * erosion;
			const flashRatio = u.uCrossFlash.value > 0 ? 2 : 0;
			crossFlash.scale.setScalar(1.44);
			flashHalo.scale.copy(crossFlash.scale);
			u.uFlashWidth.value = 1 - .65 * easeOut(crossAge / crossTiming.tail);
			u.uOrb.value = smooth(3.5, 4.35, time) * (1 - smooth(19.42, 20.12, actualTime));
			const sweep = smooth(starbladeStages.contact, starbladeStages.sweepEnd, actualTime);
			u.uSweep.value = actualTime < starbladeStages.contact ? -1 : sweep;
			target.copy(pathStart).lerp(pathEnd, sweep);
			direction.copy(pathStart).lerp(pathEnd, .5 * (1 - smooth(9.1, 11.1, time))).sub(core).normalize();
			if (actualTime >= starbladeStages.fire) direction.copy(target).sub(core).normalize();
			basis.setFromUnitVectors(zAxis, direction);
			aerial.quaternion.copy(basis);
			u.uBasis.value.setFromMatrix4(basisMatrix.makeRotationFromQuaternion(basis));
			const charge = .65 - .26 * smooth(4.5, 5.55, time) + .06 * smooth(8.3, 8.85, time) + .39 * smooth(9.1, 11.1, time) + .012 * Math.sin(time * 19);
			const pinch = 1 - .14 * smooth(10.92, 11.1, time) * (1 - smooth(11.1, 11.18, time)), launch = smooth(11.1, 11.135, time) * (1 - smooth(11.15, 11.23, time));
			const orbSize = charge * pinch * (1 - .42 * smooth(11.18, 11.48, time));
			orb.scale.set(orbSize * (1 - launch * .18), orbSize * (1 - launch * .18), orbSize * (1 + launch * 1.15));
			orb.position.z = .32 + .07200000000000001 * smooth(4.5, 5.5, time);
			orbHalo.position.z = orb.position.z;
			arcs.rotation.z = 6.283185 * cycle(time * .52 / 6.283185);
			arcs.scale.setScalar(1 + Math.sin(time * 2) * .035);
			u.uBeam.value = smooth(starbladeStages.fire, starbladeStages.fire + .03, actualTime) * (1 - smooth(starbladeStages.sweepEnd - .07, starbladeStages.sweepEnd, actualTime));
			muzzle.copy(core).addScaledVector(direction, crossAnchor * aerialScale);
			const reach = smooth(11.1, 11.18, time), end = v.copy(muzzle).lerp(target, reach), length = muzzle.distanceTo(end), radius = .855 + -.59625 * clamp((time - 11.23) / .22);
			beam.position.copy(muzzle).lerp(end, .5);
			beam.quaternion.setFromUnitVectors(up, direction);
			beam.scale.set(radius, length, radius);
			beamVolume.position.copy(beam.position);
			beamVolume.quaternion.copy(beam.quaternion);
			beamVolume.scale.copy(beam.scale);
			for (let i = 0; i < beamEndpointObjects.length; i++) {
				const o = beamEndpointObjects[i];
				o.position.copy(i < 3 ? muzzle : target);
				if (i < 3) o.quaternion.copy(basis);
			}
			sword.visible = time < 1.8;
			for (const [name, items] of layers) {
				const enabled = layerIndex < 0 || starbladeLayers[layerIndex] === name;
				for (const o of items) o.visible = enabled;
			}
			const active = (o, test) => o.visible = o.visible && test;
			for (const o of cloverWindObjects) active(o, actualTime >= cloverWindTiming.start && actualTime < cloverWindTiming.end);
			active(stars, actualTime >= .45 && actualTime < 20.12);
			active(formation, actualTime >= 3.3 && actualTime < 20.12);
			for (const row of trailBatches) active(row.object, actualTime >= .45 && actualTime < 6.5);
			active(red, u.uCrossAlpha.value > 0);
			active(redDepth, u.uCrossAlpha.value > 0);
			active(crossFlash, u.uCrossFlash.value > 0);
			active(flashHalo, u.uCrossFlash.value > 0);
			active(orb, u.uOrb.value > 0);
			active(arcs, u.uAir.value > 0);
			active(beam, u.uBeam.value > 0);
			active(beamVolume, u.uBeam.value > 0);
			for (const o of layers.get("petal-membranes")) active(o, u.uAir.value > 0);
			for (const name of [
				"rift-walls",
				"lava",
				"branch-cracks",
				"impact-flash",
				"ground-waves",
				"debris",
				"flames",
				"smoke"
			]) for (const o of layers.get(name)) active(o, actualTime >= starbladeStages.contact && actualTime < starbladeStages.end);
			active(inflow, time >= 4.65 && actualTime < starbladeStages.fire);
			for (const o of burstObjects) active(o, crossStarted && actualTime >= Math.round((starbladeStages.cross + o.userData.burstWindow[0]) * 1e10) / 1e10 && actualTime < Math.min(starbladeStages.flashEnd, Math.round((starbladeStages.cross + o.userData.burstWindow[1]) * 1e10) / 1e10));
			active(flakes, time >= 4.5 && actualTime < 20.12);
			for (let i = 0; i < 6; i++) u.uGroundAge.value[i] = actualTime - groundBlastTimes[i];
			for (const o of groundBlastObjects) {
				const [start, end] = o.userData.groundBurstWindow;
				active(o, actualTime >= groundBlastTimes[0] + start && actualTime < groundBlastTimes[5] + end);
			}
			for (let i = 0; i < beamEndpointObjects.length; i++) active(beamEndpointObjects[i], u.uBeam.value > 0 && (i < 3 || actualTime >= starbladeStages.contact));
			const groundPhase = layerIndex < 0 ? 0 : starbladeLayers[layerIndex] === "smoke" ? 2 : starbladeLayers[layerIndex] === "impact-flash" ? 1 : 0;
			u.uGroundPhase.value = groundPhase;
			if (groundPhase === 2) {
				for (const o of groundBlastObjects) if (o.name === "starblade-ground-burst-body" || o.name === "starblade-ground-burst-body-soft") o.visible = actualTime >= groundBlastTimes[0] && actualTime < groundBlastTimes[5] + 2.15;
			}
			const all = layerIndex < 0;
			orbHalo.visible = (all || starbladeLayers[layerIndex] === "charge-orb") && u.uOrb.value > 0;
			scorch.visible = (all || starbladeLayers[layerIndex] === "rift-walls") && actualTime >= starbladeStages.contact && actualTime < starbladeStages.end;
			if (layerIndex >= 0 && starbladeLayers[layerIndex] !== "dissolve-edge") sword.visible = false;
			group.visible = actualTime < starbladeStages.end && !disposed;
			root.visible = group.visible;
			group.userData.starbladeState = {
				time: actualTime,
				stage: actualTime >= starbladeStages.orbit && actualTime < starbladeStages.converge ? "orbit" : time < 1.8 ? "dissolve" : time < 3.5 ? "scatter" : actualTime < starbladeStages.petals ? "converge" : actualTime < starbladeStages.cross ? "petals" : actualTime < starbladeStages.charge ? "cross" : actualTime < starbladeStages.fire ? "charge" : actualTime < starbladeStages.sweepEnd ? "fire" : actualTime < starbladeStages.end ? "aftermath" : "finished",
				contact: actualTime >= starbladeStages.contact && actualTime < starbladeStages.sweepEnd,
				sweep,
				endpoint: target.toArray(),
				beamRadius: radius,
				swordHeight: u.uHeight.value,
				layerCount: 16,
				airLayerCount: 10,
				groundLayerCount: 10,
				burstLayerCount: 14,
				flashSpanRatio: flashRatio,
				flashErosion: u.uFlashErosion.value,
				muzzle: muzzle.toArray(),
				crossAnchor: crossAnchor * aerialScale,
				coreHeight,
				groundBurstLayerCount: 14,
				groundBurstTimes: groundBlastTimes.slice(),
				groundBurstScale: groundBlastScale * Math.min(1, u.uLength.value / 10)
			};
		}
		function reset() {
			if (disposed) return;
			time = 0;
			sync();
		}
		function setOptions(next = {}) {
			if (disposed) return;
			settings = { ...settings ?? {
				color: spec.color ?? "#ffd35a",
				size: 1,
				speed: 1,
				density: .5,
				detail: 1
			} };
			for (const key of [
				"size",
				"speed",
				"detail",
				"density"
			]) if (Number.isFinite(next[key])) settings[key] = clamp(next[key], key === "density" ? .125 : .25, key === "density" ? 1 : 2);
			if (/^#[\da-f]{6}$/i.test(next.color ?? "")) settings.color = next.color;
			u.uColor.value.set(settings.color);
			u.uDetail.value = settings.detail;
			root.scale.setScalar(settings.size);
			stars.geometry.instanceCount = 2816 * energyScale + Math.round(1024 * energyScale * settings.density);
			for (const row of trailBatches) row.object.geometry.instanceCount = row.ids.filter((i) => i < row.source.instanceCount).length;
			sync();
		}
		function dispose() {
			if (disposed) return;
			disposed = true;
			release(mounted);
			mounted = null;
			flightLease?.release();
			flightLease = null;
			u.uFlightPaths.value = null;
			for (const g of geometries) g.dispose();
			for (const m of materials) m.dispose();
			group.removeFromParent();
			group.clear();
			root.clear();
		}
		setOptions(options);
		setObject(null);
		setSweepPath(pathStart, pathEnd);
		return {
			group,
			setObject,
			setSweepPath,
			setOptions,
			reset,
			dispose,
			update(dt) {
				if (disposed || time >= starbladeStages.end || !Number.isFinite(dt) || dt < 0) return;
				time = Math.min(starbladeStages.end, time + dt * settings.speed);
				if (time >= starbladeStages.end - 1e-8) time = starbladeStages.end;
				sync();
			},
			stop() {},
			hit() {},
			setLayer(index = -1) {
				if (!Number.isInteger(index) || index < -1 || index >= 16) throw new RangeError("Layer index must be -1 or 0..15.");
				layerIndex = index;
				sync();
			},
			get settings() {
				return { ...settings };
			},
			get elapsed() {
				return time;
			},
			get duration() {
				return starbladeStages.end;
			},
			get finished() {
				return disposed || time >= starbladeStages.end - 1e-8;
			},
			get phase() {
				return disposed || time >= starbladeStages.end - 1e-8 ? "finished" : time < starbladeStages.fire ? "starting" : time < starbladeStages.sweepEnd ? "active" : "ending";
			},
			get lifecycle() {
				return {
					start: starbladeStages.fire,
					end: starbladeStages.end - starbladeStages.sweepEnd
				};
			},
			get particleCount() {
				return trailBatches.reduce((n, row) => n + row.object.geometry.instanceCount, 0) + formationCount + stars.geometry.instanceCount + 1280 * energyScale + 282 + extraParticleCount - 144 + flashCount + 128 + burstSupportCount + groundBlastCount + groundSoftCount + beamEndpointCount + cloverWindCount;
			},
			get sweepPath() {
				return {
					start: pathStart.clone(),
					end: pathEnd.clone()
				};
			}
		};
	}

//#endregion
exports.createStarbladeEffect = createStarbladeEffect;
exports.starbladeLayers = starbladeLayers;
exports.starbladeStages = starbladeStages;
return exports;
})({}, THREE);

export {__vfxModule};
