/* A faint, real-life paper texture, drawn by a WebGL fragment shader (CC, 2026-11-28: "use shaders to explore
   how to replicate faint real life like paper texture, for the front drawer only"). No image files: the
   shader paints one seamless tile once, it's cached as an image, and the drawer lays it over its front.

   The layers, from CC's kraft folder reference (a manila folder: soft blotches, fibres running mostly one
   way, a few stray strands, a fine grain, rare dark specks, a tooth that catches the light):
   - mottling: low-frequency fbm, very low contrast (the uneven pulp)
   - fibres: noise stretched along one axis (the streaks of the paper machine's direction)
   - strands: short thin lines at random angles, one per grid cell (loose fibres on the surface)
   - grain: high-frequency value noise (the fine tooth)
   - specks: sparse dark dots, a few larger (bits of bark and dirt in recycled kraft)
   - tooth: the grain and fibres as a height field, lit from the top left (a faint emboss)
   Everything is periodic over the tile, so it repeats without seams. Output: white where the paper is
   plain, darker where it isn't, for a multiply blend (light fronts) or, inverted, a screen blend (dark). */

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }";
const FRAG = `
precision highp float;
uniform vec2 res;
uniform float seed, mottle, fibres, strands, grain, specks, tooth;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21) + seed * 0.137); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + 17.31)); }
// value noise, periodic over per cells
float vnoise(vec2 p, vec2 per) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  float a = hash(mod(i, per)), b = hash(mod(i + vec2(1., 0.), per)), c = hash(mod(i + vec2(0., 1.), per)), d = hash(mod(i + vec2(1., 1.), per));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p, vec2 per) { float s = 0., a = .5; for (int k = 0; k < 5; k++) { s += a * vnoise(p, per); p *= 2.; per *= 2.; a *= .5; } return s; }
// loose strands: one short segment per cell, at a random angle (checks the 3x3 neighbours, periodic)
float strandField(vec2 uv, float n) {
  vec2 g = uv * n, id = floor(g); float m = 0.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = id + vec2(float(x), float(y)), r = hash2(mod(c, vec2(n)) + 3.1);
    if (r.x > .2) continue;   // only a few cells have one
    float ang = r.y * 6.2832, len = .5 + hash(mod(c, vec2(n)) + 9.7) * .9;
    vec2 o = c + hash2(mod(c, vec2(n)) + 5.3), d = vec2(cos(ang), sin(ang));
    vec2 q = g - o; float t = clamp(dot(q, d), -len, len);
    float dist = length(q - d * t);
    m = max(m, (1. - smoothstep(.01, .045, dist)) * (.35 + .65 * r.x / .2));
  }
  return m;
}
// specks: sparse dark dots
float speckField(vec2 uv, float n, float chance, float size) {
  vec2 g = uv * n, id = floor(g); float m = 0.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 c = id + vec2(float(x), float(y)), r = hash2(mod(c, vec2(n)) + 11.7);
    if (r.x > chance) continue;
    vec2 o = c + hash2(mod(c, vec2(n)) + 2.9);
    vec2 q = g - o; q.y *= 1. + r.y * 1.5;   // some a little elongated
    float s = size * (.5 + r.y);
    m = max(m, 1. - smoothstep(s * .55, s, length(q)));
  }
  return m;
}
float height(vec2 uv) {
  float gr = vnoise(uv * 128., vec2(128.)) * .5 + vnoise(uv * 64., vec2(64.)) * .5;
  float fb = fbm(vec2(uv.x * 64., uv.y * 6.), vec2(64., 6.));
  return gr * grain * .6 + fb * fibres * .5 + strandField(uv, 12.) * strands * .4;
}
void main() {
  vec2 uv = gl_FragCoord.xy / res;
  float e = 1. / res.x;
  // the tooth: the height field, lit from the top left
  float h0 = height(uv), hx = height(uv + vec2(e, 0.)), hy = height(uv + vec2(0., e));
  vec3 n = normalize(vec3((h0 - hx) * 1.6, (h0 - hy) * 1.6, 1.));
  vec3 L = normalize(vec3(-.6, .6, .55));
  float shade = (dot(n, L) - L.z) * tooth * 1.2;   // 0 on flat paper, + facing the light, - away
  // the blotches, the fibre streaks, the strands
  float mo = fbm(uv * 3., vec2(3.)) - .5;
  float fb = fbm(vec2(uv.x * 64., uv.y * 6.), vec2(64., 6.)) - .5;
  float st = strandField(uv, 12.);
  float dark = mo * mottle * .07 + fb * fibres * .035 + st * strands * .03 + (vnoise(uv * 128., vec2(128.)) - .5) * grain * .025;
  // specks: many tiny, a few larger
  float sp = max(speckField(uv, 30., .07, .07), speckField(uv, 8., .1, .05)) * specks;
  vec3 col = vec3(1.) - vec3(max(0., dark + .025) + max(0., -shade) * .35) + vec3(max(0., shade)) * .1;
  col = mix(col, vec3(.55, .45, .35), sp * .55);
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

const cache = new Map();
let gl = null, prog = null, cvs = null;
function setup(size) {
  cvs = document.createElement("canvas"); cvs.width = cvs.height = size;
  gl = cvs.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
  if (!gl) return false;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return true;
}

// one seamless tile as an image URL (cached per setting); null if WebGL isn't there
export function paperTile({ seed = 1, mottle = 1, fibres = 1, strands = 1, grain = 1, specks = 1, tooth = 1, size = 512 } = {}) {
  const key = [seed, mottle, fibres, strands, grain, specks, tooth, size].join();
  if (cache.has(key)) return cache.get(key);
  try {
    if (!gl && !setup(size)) return null;
    if (cvs.width !== size) { cvs.width = cvs.height = size; }
    gl.viewport(0, 0, size, size);
    const u = (n, v) => gl.uniform1f(gl.getUniformLocation(prog, n), v);
    gl.uniform2f(gl.getUniformLocation(prog, "res"), size, size);
    u("seed", seed); u("mottle", mottle); u("fibres", fibres); u("strands", strands); u("grain", grain); u("specks", specks); u("tooth", tooth);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const url = cvs.toDataURL("image/png");
    cache.set(key, url);
    return url;
  } catch (e) { console.warn("paper texture:", e); return null; }
}
