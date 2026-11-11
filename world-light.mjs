export const planeVertex = `
  varying vec2 panel;
  void main() {
    panel = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const noise = `
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * .1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float haze(vec2 p) {
    return .58 * noise2(p) + .29 * noise2(p * 2.06 + 17.0) + .13 * noise2(p * 4.21 - 9.0);
  }
`;

export const gradeUniforms = `
  uniform sampler2D matte;
  uniform vec2 crop;
  uniform vec2 drift;
  uniform vec3 cool;
  uniform vec3 warm;
  uniform float time;
  uniform float kind;
  vec3 illustration(vec2 p) {
    vec2 q = clamp((p - .5) * crop + .5 + drift, .001, .999);
    vec3 c = texture2D(matte, q).rgb;
    float vignette = smoothstep(.36, .8, length((p - .5) * vec2(.94, 1.07)));
    float lantern = exp(-dot((p - vec2(.5,.65)) * vec2(2.6,1.8), (p - vec2(.5,.65)) * vec2(2.6,1.8)));
    c = mix(c * .59, c * .98, lantern);
    c *= 1.0 - .37 * vignette;
    c += cool * (.014 + lantern * .028) + warm * pow(lantern, 4.0) * .012;
    return c;
  }
`;

export const matteFragment = `
  varying vec2 panel;
  ${gradeUniforms}
  void main() {
    gl_FragColor = vec4(illustration(panel), 1.0);
    #include <colorspace_fragment>
  }
`;

export const floorVertex = `
  varying vec3 groundPoint;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    groundPoint = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const floorFragment = `
  varying vec3 groundPoint;
  uniform vec2 size;
  uniform vec2 hero;
  uniform vec2 keyLight;
  uniform vec3 flashColor;
  uniform float flash;
  uniform float floorStart;
  uniform float wet;
  uniform float orbit;
  ${gradeUniforms}
  ${noise}
  void main() {
    vec2 g = groundPoint.xz;
    vec2 screen = vec2(g.x / size.x + .5, .5 - g.y * .819152 / size.y);
    float blend = smoothstep(floorStart, floorStart + .155, 1.0 - screen.y);
    float broad = haze(g * .015);
    vec3 base = illustration(screen);
    float tileScale = mix(79.0, 55.0, kind);
    vec2 stone = g / vec2(tileScale * 1.7, tileScale);
    stone.x += floor(stone.y) * .47;
    stone += (haze(g * .028) - .5) * .12;
    vec2 grid = abs(fract(stone) - .5);
    float edge = max(grid.x, grid.y);
    float mortar = smoothstep(.468, .50, edge);
    float bevel = smoothstep(.429,.46,edge) * (1.0 - mortar);
    float flake = hash(floor(stone));
    base *= (1.0 + (flake - .5) * .21 * kind) * (1.0 - mortar * .27 * kind);
    base += bevel * mix(cool, warm, .21) * .031 * kind;
    float footprint = length((g - hero) * vec2(.96, .88));
    float pool = exp(-pow(footprint / (121.0 + flash * 43.0), 1.61));
    base += (cool * .114 + flash * flashColor * .24) * pool * (.60 + broad);
    vec2 delta = g - keyLight;
    float lane = exp(-abs(delta.x + sin(delta.y * .046 + time * 1.16) * 9.0) / (69.0 + abs(delta.y) * .09));
    float smear = haze(vec2(g.x * .034 + time * .10, g.y * .19));
    float streak = pow(smear, 3.4) * lane * exp(-abs(delta.y) / 390.0);
    float puddles = smoothstep(.44,.63,broad) * wet;
    base += (cool * .36 + warm * .23) * streak * puddles;
    float foil = smoothstep(.38,.66,haze(g * vec2(.022,.057) + vec2(time * .17,-time * .28)));
    base += mix(cool, warm, .17) * foil * puddles * .048;
    vec2 boundary = smoothstep(vec2(-.02),vec2(.095),screen) * (1.0 - smoothstep(vec2(.905),vec2(1.02),screen));
    blend *= mix(1.0, boundary.x * boundary.y, smoothstep(.015,.32,orbit));
    gl_FragColor = vec4(base, blend * .98);
    #include <colorspace_fragment>
  }
`;

export const mistFragment = `
  varying vec2 panel;
  uniform vec3 tint;
  uniform float time;
  uniform float strength;
  ${noise}
  void main() {
    vec2 p = panel;
    float n = haze(vec2(p.x * 6.2 - time * .19, p.y * 2.15 + time * .067));
    float streak = haze(vec2(p.x * 3.3 + time * .083, p.y * 5.8));
    float density = smoothstep(.29,.68,n * .69 + streak * .31);
    float envelope = sin(p.x * 3.141593) * pow(sin(p.y * 3.141593),1.8);
    gl_FragColor = vec4(tint, density * envelope * strength);
    #include <colorspace_fragment>
  }
`;

export const shaftFragment = `
  varying vec2 panel;
  uniform vec3 tint;
  uniform float time;
  uniform float strength;
  ${noise}
  void main() {
    vec2 p = panel;
    float depth = 1.0 - p.y;
    float spread = .054 + depth * .36;
    float x = abs(p.x - (.57 - depth * .16));
    float beam = exp(-pow(x / spread, 2.5));
    float rays = pow(max(0.0, sin((p.x - .5) / spread * 14.0 + time * .19)), 3.0);
    float drift = .48 + .52 * haze(vec2(p.x * 7.0 + time * .072, p.y * 8.0 - time * .10));
    float opacity = beam * (.58 + rays * .42) * pow(sin(3.141593 * p.y), 1.4) * drift;
    gl_FragColor = vec4(tint, opacity * strength);
    #include <colorspace_fragment>
  }
`;

export const haloFragment = `
  varying vec2 panel;
  uniform vec3 tint;
  uniform float strength;
  void main() {
    float r = length(panel - .5) * 2.0;
    float glow = pow(max(0.0, 1.0 - r), 2.65);
    gl_FragColor = vec4(tint, glow * strength);
    #include <colorspace_fragment>
  }
`;

export const sigilFragment = `
  varying vec2 panel;
  uniform vec3 tint;
  uniform float time;
  uniform float strength;
  void main() {
    vec2 p = (panel - .5) * 2.0;
    float r = length(p);
    float a = atan(p.y, p.x) + time * .34;
    float ring = 1.0 - smoothstep(.007, .023, abs(r - .76));
    ring += .75 * (1.0 - smoothstep(.008,.022,abs(r-.68)));
    float dial = smoothstep(.95, .995, cos(a * 24.0)) * smoothstep(.55,.59,r) * (1.0 - smoothstep(.64,.67,r));
    float petals = 1.0 - smoothstep(.009,.027,abs(r - (.42 + .072 * cos(a * 8.0))));
    float glow = exp(-abs(r - .7) * 21.0);
    gl_FragColor = vec4(tint, (ring * .64 + dial * .78 + petals * .46 + glow * .33) * strength);
    #include <colorspace_fragment>
  }
`;

export const actorFragment = `
  varying vec2 panel;
  uniform sampler2D atlas;
  uniform vec4 cell;
  uniform vec3 tint;
  uniform vec3 fire;
  uniform float opacity;
  uniform float hit;
  uniform float facing;
  uniform float gleam;
  float cut(vec2 p) {
    if(any(lessThan(p,vec2(0))) || any(greaterThan(p,vec2(1)))) return 0.0;
    return texture2D(atlas,cell.xy + cell.zw * p).a;
  }
  void main() {
    vec2 p = vec2(mix(1.0 - panel.x, panel.x, facing), panel.y);
    vec4 src = texture2D(atlas, cell.xy + cell.zw * p);
    vec2 d = vec2(.010,.012);
    float rim = max(cut(p+vec2(d.x,0)),cut(p+vec2(0,d.y)));
    rim = max(rim,max(cut(p-vec2(d.x,0)),cut(p-vec2(0,d.y))));
    float ink = max(0.0,rim-src.a) * .29;
    if (max(src.a, ink) < .025) discard;
    vec3 body = src.rgb * (.89 + p.y * .25);
    body += tint * src.a * (.018 + p.y * .033) + fire * gleam * src.a * .16;
    body = mix(body, vec3(1.0,.76,.53), hit * .82);
    vec3 color = mix(tint * .68, body, smoothstep(.06,.47,src.a));
    gl_FragColor = vec4(color, max(src.a, ink) * opacity);
    #include <colorspace_fragment>
  }
`;

export const ribbonFragment = `
  varying vec2 panel;
  uniform vec3 tint;
  uniform float strength;
  uniform float time;
  void main() {
    vec2 p = panel;
    float tips = smoothstep(0.0,.16,p.x) * (1.0-smoothstep(.69,1.0,p.x));
    float hot = exp(-pow((p.y-.77)*14.0,2.0));
    float foil = exp(-pow((p.y-.91)*29.0,2.0)) * .51;
    float body = pow(sin(p.y*3.141593),1.65);
    float grain = .82 + .18*sin(p.x*71.0 - p.y*29.0 + time*8.0);
    vec3 color = mix(tint, vec3(1.0,.88,.68), hot*.86);
    gl_FragColor = vec4(color, (body*.47*grain+hot*.84+foil) * tips * strength);
    #include <colorspace_fragment>
  }
`;

export const sparksVertex = `
  attribute float radius;
  attribute float alpha;
  attribute vec3 tint;
  uniform float pixelScale;
  varying vec4 ember;
  void main() {
    ember = vec4(tint, alpha);
    gl_PointSize = min(44.0, radius * pixelScale);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const sparksFragment = `
  varying vec4 ember;
  void main() {
    vec2 p = abs(gl_PointCoord - .5) * 2.0;
    float r = length(p);
    float falloff = pow(max(0.0,1.0-r),2.15);
    float core = exp(-r*r*22.0);
    float cross = exp(-min(p.x,p.y)*44.0) * max(0.0,1.0-r) * .19;
    gl_FragColor = vec4(mix(ember.rgb,vec3(1.0,.91,.76),core*.72),ember.a*(falloff+core*.58+cross));
    #include <colorspace_fragment>
  }
`;
