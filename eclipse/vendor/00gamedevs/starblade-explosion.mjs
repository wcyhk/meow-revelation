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
// Starfire Explosion — Three.js 0.187.0 / WebGL2.
// Single-shot, 2.15 visual seconds; local ground origin, XZ plane, +Y up.
// Add group to your scene, call update(deltaSeconds), reset to replay, dispose at teardown.
// size/speed are the only appearance controls. Fixed palette and seeded replay.
// stop/hit are compatibility no-ops. No terrain modification, collision or external textures.
import * as THREE from "../../../three.min.mjs";
var __vfxModule = (function(exports) {

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
//#region src/effects/starblade-explosion-runtime.js
	function createStarbladeExplosion(T, spec, options = {}) {
		const group = new T.Group(), root = new T.Group(), ground = root;
		group.name = spec.id;
		root.name = "starblade-explosion-root";
		group.add(root);
		const geometries = /* @__PURE__ */ new Set(), materials = /* @__PURE__ */ new Set(), groundBlastObjects = [], extraAliases = {};
		const duration = 2.15;
		let time = 0, disposed = false, layerIndex = -1;
		const settings = {
			size: 1,
			speed: 1,
			color: spec.color,
			density: .5,
			detail: 1
		};
		const clamp = (v, a = .25, b = 2) => Math.min(b, Math.max(a, v));
		const rnd = (seed) => {
			let s = seed >>> 0;
			return () => {
				s = Math.imul(s, 1664525) + 1013904223 >>> 0;
				return s / 4294967296;
			};
		};
		const random = rnd(spec.seed ?? 829661);
		for (let i = 0; i < 88360; i++) random();
		const u = {
			uGroundAge: { value: /* @__PURE__ */ new Float32Array(1) },
			uGroundPhase: { value: 0 },
			uLength: { value: 20 }
		};
		const common = "uniform float uGroundAge[1],uGroundPhase,uLength;float sat(float a){return clamp(a,0.,1.);}float sm(float a,float b,float x){float t=sat((x-a)/(b-a));return t*t*(3.-2.*t);}float easeOut(float x){return 1.-pow(1.-sat(x),3.);}float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,39.425)))*43758.5453);}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}";
		function mesh(name, g, vs, fs, parent, add = false, opaque = false) {
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
			return o;
		}
		function batchGeometry(base, count) {
			const g = new T.InstancedBufferGeometry();
			g.index = base.index;
			for (const key of Object.keys(base.attributes)) g.setAttribute(key, base.attributes[key]);
			g.setAttribute("aSeed", new T.InstancedBufferAttribute(Float32Array.from({ length: count * 4 }, () => random()), 4));
			for (let i = 0; i < count * 5 * 4; i++) random();
			g.instanceCount = count;
			base.dispose();
			return g;
		}
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
		const rockPalette = `vec3 heatedRock(vec3 point,float light,float heat){float thermalNoise=noise(point*6.);float hot=sat(heat*(.55+.45*thermalNoise));vec3 base=vec3(.055,.018,.022)*light;vec3 red=mix(vec3(.24,.006,.009),vec3(.85,.045,.006),sm(.12,.72,hot));red=mix(red,vec3(1.,.31,.018),sm(.72,1.,hot));return mix(base,red,hot);}`;
		const shardShape = `vec3 shardPoint(vec3 p,vec4 seed){float size=.38+pow(seed.w,1.8)*1.65;vec3 ratio=vec3(.45+seed.y*.55,.65+seed.z*1.5,.35+seed.x*.55);p*=ratio*size;float facet=hash(floor((p+1.)*17.)+seed.xyz*31.);p*=.72+facet*.55;p.x+=p.y*(seed.x-.5)*.7;p.z+=p.x*(seed.z-.5)*.45;return p;}
    float shardHeat(vec3 p,float seed){vec3 q=p*9.+vec3(seed*17.,seed*7.,seed*29.);float field=noise(q);float seam=1.-sm(.025,.17,abs(field-.48));float pocket=1.-sm(.09,.18,length(p-vec3(.015,-.02,.01)));return sat(.12+seam*.80+pocket*.35);}`;
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
			const from = new Float32Array(capacity * 4), to = new Float32Array(capacity * 4), graphs = [];
			for (let event = 0; event < 1; event++) {
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
			const [role, capacity, start, end] = groundBlastSpecs[kind], count = capacity;
			const g = batchGeometry(kind === 0 || kind === 4 ? new T.SphereGeometry(1, 36, 24) : kind === 6 ? new T.IcosahedronGeometry(.11, 0) : new T.PlaneGeometry(2, 2), count);
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
      float bs=2.,f=0.;vec3 p=vec3(0.);vec3 tangent=normalize(vec3(cos(a)*.38,.18+aSeed.y*.65,sin(a)));vec2 wh=vec2(.1);float spin=0.;vHeat=1.-q;vAlpha=alive;vLight=1.;vCooling=0.;vSurface=position;vNormal=normal;vView=vec3(0.,0.,1.);
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
		const launchSeeds = groundBlastObjects[6].geometry.getAttribute("aSeed"), pairedSeeds = groundBlastObjects[7].geometry.getAttribute("aSeed");
		for (let i = 0; i < pairedSeeds.count; i++) {
			const parent = Math.floor(i / 2);
			pairedSeeds.setXYZW(i, launchSeeds.getX(parent), i % 2 ? .8 : .2, launchSeeds.getZ(parent), launchSeeds.getW(parent));
		}
		group.userData.layerTypes = groundBlastSpecs.map((row) => row[0]);
		const particleCount = groundBlastObjects.reduce((n, o) => n + o.geometry.instanceCount, 0);
		function sync() {
			u.uGroundAge.value[0] = time;
			root.scale.setScalar(settings.size);
			group.visible = !disposed && time < duration;
			for (const o of groundBlastObjects) {
				const [start, end] = o.userData.groundBurstWindow;
				const role = o.name.replace("starblade-ground-burst-", "").replace(/-soft$/, "");
				o.visible = time >= start && time < end && (layerIndex < 0 || groundBlastSpecs[layerIndex][0] === role);
			}
		}
		function setOptions(next = {}) {
			if (disposed) return;
			for (const key of ["size", "speed"]) if (Number.isFinite(next[key])) settings[key] = clamp(next[key]);
			sync();
		}
		function reset() {
			if (disposed) return;
			time = 0;
			sync();
		}
		function dispose() {
			if (disposed) return;
			disposed = true;
			group.visible = false;
			for (const g of geometries) g.dispose();
			for (const m of materials) m.dispose();
			group.removeFromParent();
			root.clear();
			group.clear();
		}
		setOptions(options);
		return {
			group,
			setOptions,
			reset,
			dispose,
			stop() {},
			hit() {},
			update(dt) {
				if (disposed || time >= duration || !Number.isFinite(dt) || dt < 0) return;
				time = Math.min(duration, time + dt * settings.speed);
				if (time >= 2.14999999) time = duration;
				sync();
			},
			setLayer(index = -1) {
				if (!Number.isInteger(index) || index < -1 || index >= 14) throw new RangeError("Layer index must be -1 or 0..13.");
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
				return duration;
			},
			get finished() {
				return disposed || time >= duration;
			},
			get phase() {
				return disposed || time >= duration ? "finished" : time < .22 ? "active" : "ending";
			},
			get lifecycle() {
				return {
					start: 0,
					end: 1.93
				};
			},
			get particleCount() {
				return particleCount;
			}
		};
	}

//#endregion
exports.createStarbladeExplosion = createStarbladeExplosion;
return exports;
})({});
const createStarbladeExplosion = __vfxModule.createStarbladeExplosion;

const preset={"id":"starblade-explosion","name":"星焰爆破","english":"Starfire Explosion","category":"burst","color":"#ffd35a","description":"白熱火光瞬間炸開，拋出碎石與火星，留下裂紋和翻滾濃煙。","tags":"星焰 爆破 爆炸 火光 碎石 濃煙 裂紋 starfire explosion blast fire debris smoke cracks","schools":["light","fire"],"kind":3,"variant":0,"seed":829661,"duration":2.15,"burst":true,"maxParticles":2738,"defaultDensity":0.5,"previewTime":0.18,"thumbnailTime":0.18,"lifecycle":{"start":0,"end":1.93}};
export const defaultOptions={"size":1,"speed":1};
export default function createVFX(options={}){return createStarbladeExplosion(THREE,preset,{...defaultOptions,...options});}
