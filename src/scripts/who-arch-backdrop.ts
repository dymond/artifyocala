import * as THREE from 'three';

import { attachWhoArchBackdropDebug } from './who-arch-backdrop-debug-gui';

/**
 * Who-section backdrop: Stripe-style animated mesh gradient (whatamesh pattern —
 * see https://whatamesh.vercel.app/ and jordienr’s gist). Subdivided plane,
 * simplex noise vertex displacement, layered vertex colors blended in the shader.
 * Colors match site tokens: mist, accent-soft, accent, surge.
 *
 * Do not redeclare `position` / `uv` in the vertex shader — Three prepends them.
 *
 * Debug UI (lil-gui): open the home page with `?whoBackdropDebug=1` to tune camera,
 * frustum, mesh, and shader timing; use “Copy JSON → clipboard” and paste values back.
 */
let active: WhoArchRuntime | null = null;

type WhoArchRuntime = {
  destroy: () => void;
};

/** Align canvas clear with --color-mist */
const MIST_BG = 0xf4f5fc;

/** Near mist; cool tints — readable motion without heavy purple. */
const COLORS = {
  base: '#f4f5fc',
  layer1: '#cfd6f8',
  layer2: '#bec7f2',
  layer3: '#adb8ec',
} as const;

/**
 * Ortho frustum is expanded by `pad` so displaced vertices stay in view; the plane
 * must match that frustum or the rasterized mesh only covers the center of the canvas.
 *
 * `overscanPx` grows plane + frustum by a few CSS pixels in world units so triangle
 * edges do not sit exactly on the clip planes (avoids jagged gaps / “seeing through”).
 *
 * `bottomRelief` extends the frustum and plane downward only (geometry is shifted so the
 * top edge stays aligned). Stops bottom-edge raster / depth artifacts on tall viewports.
 */
export type WhoArchBackdropLayoutOptions = {
  overscanPx?: number;
  padMultiplier?: number;
  bottomReliefMultiplier?: number;
};

export function computeWhoArchBackdropLayout(
  viewportW: number,
  viewportH: number,
  noiseAmp: number,
  layoutOptions: WhoArchBackdropLayoutOptions = {},
): {
  w: number;
  h: number;
  pad: number;
  overscanWorld: number;
  bottomRelief: number;
  planeW: number;
  planeH: number;
  orthoLeft: number;
  orthoRight: number;
  orthoTop: number;
  orthoBottom: number;
} {
  const w = Math.max(1, Math.round(viewportW));
  const h = Math.max(1, Math.round(viewportH));
  const padMultiplier = layoutOptions.padMultiplier ?? 1;
  const pad = (noiseAmp + Math.max(w, h) * 0.35) * padMultiplier;
  let planeW = w + 2 * pad;
  let planeH = h + 2 * pad;
  let orthoLeft = -w / 2 - pad;
  let orthoRight = w / 2 + pad;
  let orthoTop = h / 2 + pad;
  let orthoBottom = -h / 2 - pad;

  const px = Math.max(0, layoutOptions.overscanPx ?? 3);
  const overscanWorld =
    px > 0
      ? Math.max((px * planeW) / w, (px * planeH) / h)
      : 0;

  if (overscanWorld > 0) {
    planeW += 2 * overscanWorld;
    planeH += 2 * overscanWorld;
    orthoLeft -= overscanWorld;
    orthoRight += overscanWorld;
    orthoTop += overscanWorld;
    orthoBottom -= overscanWorld;
  }

  const brMul = layoutOptions.bottomReliefMultiplier ?? 1;
  const bottomRelief = Math.round(
    Math.max(48, Math.round(h * 0.045), Math.round(noiseAmp * 0.18)) * brMul,
  );
  planeH += bottomRelief;
  orthoBottom -= bottomRelief;

  return {
    w,
    h,
    pad,
    overscanWorld,
    bottomRelief,
    planeW,
    planeH,
    orthoLeft,
    orthoRight,
    orthoTop,
    orthoBottom,
  };
}

function hexToLinearRgb(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

/** Ashima simplex noise + blend (Stripe / whatamesh vertex stack) */
const MESH_NOISE = /* glsl */ `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
  return blend * opacity + base * (1.0 - opacity);
}
`;

/** Split + concat (no nested `${…}` in one template) so esbuild/Vite minify cannot mis-parse GLSL. */
const MESH_VERTEX_HEAD = /* glsl */ `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_noiseFreqGlobal;
uniform float u_noiseSpeedGlobal;
uniform vec4 u_active_colors;
uniform vec3 u_baseColor;
uniform float u_incline;
uniform float u_offsetTop;
uniform float u_offsetBottom;
uniform vec2 u_deformNoiseFreq;
uniform float u_noiseAmp;
uniform float u_deformNoiseSpeed;
uniform float u_deformNoiseFlow;
uniform float u_deformNoiseSeed;
uniform vec3 u_layerColor0;
uniform vec3 u_layerColor1;
uniform vec3 u_layerColor2;
uniform vec2 u_layerFreq0;
uniform vec2 u_layerFreq1;
uniform vec2 u_layerFreq2;
uniform float u_layerSpeed0;
uniform float u_layerSpeed1;
uniform float u_layerSpeed2;
uniform float u_layerFlow0;
uniform float u_layerFlow1;
uniform float u_layerFlow2;
uniform float u_layerSeed0;
uniform float u_layerSeed1;
uniform float u_layerSeed2;
uniform float u_layerFloor0;
uniform float u_layerFloor1;
uniform float u_layerFloor2;
uniform float u_layerCeil0;
uniform float u_layerCeil1;
uniform float u_layerCeil2;
uniform float u_layerBlendWeight;

out vec3 vColor;

`;

const MESH_VERTEX_TAIL = /* glsl */ `
void main() {
  // World XY of the undeformed vertex (handles geometry.translate / mesh transform).
  vec4 worldBase = modelMatrix * vec4(position, 1.0);
  vec2 uvNorm = vec2(
    worldBase.x / (u_resolution.x * 0.5),
    worldBase.y / (u_resolution.y * 0.5)
  );
  float time = u_time * u_noiseSpeedGlobal;
  vec2 noiseCoord = u_resolution * uvNorm * u_noiseFreqGlobal;

  float incline = u_resolution.x * uvNorm.x / 2.0 * u_incline;
  float offset =
    u_resolution.x / 2.0 * u_incline * mix(u_offsetBottom, u_offsetTop, uvNorm.y * 0.5 + 0.5);

  float n = snoise(vec3(
    noiseCoord.x * u_deformNoiseFreq.x + time * u_deformNoiseFlow,
    noiseCoord.y * u_deformNoiseFreq.y,
    time * u_deformNoiseSpeed + u_deformNoiseSeed
  )) * u_noiseAmp;
  n *= 1.0 - pow(abs(uvNorm.y), 2.0);
  n = max(0.0, n);

  // Stripe’s plane has base Y=0; “tilt” is (h/2)*uvNorm.y. Three’s centered XY plane
  // already has position.y = (h/2)*uvNorm.y — same value. Adding both doubled Y and
  // pushed the whole mesh outside the ortho frustum (nothing rasterized).
  vec3 pos = vec3(position.x, position.y + incline + n - offset, position.z);

  vec3 color = u_baseColor;
  if (u_active_colors[0] > 0.5) {
    color = u_baseColor;
  }

  if (u_active_colors[1] > 0.5) {
    float ln = smoothstep(
      u_layerFloor0,
      u_layerCeil0,
      snoise(vec3(
        noiseCoord.x * u_layerFreq0.x + time * u_layerFlow0,
        noiseCoord.y * u_layerFreq0.y,
        time * u_layerSpeed0 + u_layerSeed0
      )) * 0.5 + 0.5
    );
    color = blendNormal(color, u_layerColor0, pow(ln, 4.0) * u_layerBlendWeight);
  }
  if (u_active_colors[2] > 0.5) {
    float ln = smoothstep(
      u_layerFloor1,
      u_layerCeil1,
      snoise(vec3(
        noiseCoord.x * u_layerFreq1.x + time * u_layerFlow1,
        noiseCoord.y * u_layerFreq1.y,
        time * u_layerSpeed1 + u_layerSeed1
      )) * 0.5 + 0.5
    );
    color = blendNormal(color, u_layerColor1, pow(ln, 4.0) * u_layerBlendWeight);
  }
  if (u_active_colors[3] > 0.5) {
    float ln = smoothstep(
      u_layerFloor2,
      u_layerCeil2,
      snoise(vec3(
        noiseCoord.x * u_layerFreq2.x + time * u_layerFlow2,
        noiseCoord.y * u_layerFreq2.y,
        time * u_layerSpeed2 + u_layerSeed2
      )) * 0.5 + 0.5
    );
    color = blendNormal(color, u_layerColor2, pow(ln, 4.0) * u_layerBlendWeight);
  }

  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const MESH_VERTEX = MESH_VERTEX_HEAD + MESH_NOISE + MESH_VERTEX_TAIL;

const MESH_FRAGMENT = /* glsl */ `
precision highp float;

uniform float u_darken_top;
uniform vec2 u_resolution;
uniform float u_shadow_power;

in vec3 vColor;

out vec4 fragColor;

void main() {
  vec3 color = vColor;
  if (u_darken_top > 0.5) {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
  }
  fragColor = vec4(color, 1.0);
}
`;

function createRuntime(canvas: HTMLCanvasElement): WhoArchRuntime {
  const parent = canvas.parentElement;
  /** Sticky viewport (`h-dvh`); the webgl wrap is `absolute` and often reports 0×0 in flex layouts. */
  const sizeRoot = canvas.closest<HTMLElement>('.artify-who-sticky') ?? parent;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(MIST_BG, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();

  /** Defaults tuned in-browser (`?whoBackdropDebug=1` → copy JSON). */
  const CAM_Z = 30;
  const CAM_NEAR = 0.1;
  const CAM_FAR = 100000;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, CAM_NEAR, CAM_FAR);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  const seed = 15;
  const freqX = 0.00014;
  const freqY = 0.00029;
  /** Used for layout padding only; vertex displacement amplitude is `uniforms.u_noiseAmp`. */
  const amp = 320;

  const uniforms = {
    u_time: { value: 1253106 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_noiseFreqGlobal: { value: new THREE.Vector2(0.000111843, 0.0002) },
    u_noiseSpeedGlobal: { value: 0.0000145 },
    u_active_colors: { value: new THREE.Vector4(1, 1, 1, 1) },
    u_baseColor: { value: hexToLinearRgb(COLORS.base) },
    u_incline: { value: 0 },
    u_offsetTop: { value: -0.5 },
    u_offsetBottom: { value: -0.5 },
    u_deformNoiseFreq: { value: new THREE.Vector2(7.3, 10.2) },
    u_noiseAmp: { value: 15 },
    u_deformNoiseSpeed: { value: 19 },
    u_deformNoiseFlow: { value: 13.9 },
    u_deformNoiseSeed: { value: seed },
    u_layerColor0: { value: hexToLinearRgb(COLORS.layer1) },
    u_layerColor1: { value: hexToLinearRgb(COLORS.layer2) },
    u_layerColor2: { value: hexToLinearRgb(COLORS.layer3) },
    u_layerFreq0: { value: new THREE.Vector2(2.25, 3.25) },
    u_layerFreq1: { value: new THREE.Vector2(2.5, 3.5) },
    u_layerFreq2: { value: new THREE.Vector2(2.75, 3.75) },
    u_layerSpeed0: { value: 5.6 },
    u_layerSpeed1: { value: 11.6 },
    u_layerSpeed2: { value: 11.9 },
    u_layerFlow0: { value: 6.8 },
    u_layerFlow1: { value: 7.1 },
    u_layerFlow2: { value: 7.4 },
    u_layerSeed0: { value: seed + 10 },
    u_layerSeed1: { value: seed + 20 },
    u_layerSeed2: { value: seed + 30 },
    u_layerFloor0: { value: 0.1 },
    u_layerFloor1: { value: 0.1 },
    u_layerFloor2: { value: 0.1 },
    u_layerCeil0: { value: 0.7 },
    u_layerCeil1: { value: 0.77 },
    u_layerCeil2: { value: 0.84 },
    /** Caps how strongly layer tints stack (keeps field near mist). */
    u_layerBlendWeight: { value: 0.6 },
    u_darken_top: { value: 0 },
    u_shadow_power: { value: 6 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: MESH_VERTEX,
    fragmentShader: MESH_FRAGMENT,
    glslVersion: THREE.GLSL3,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  let mesh: THREE.Mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 32, 32), material);
  mesh.frustumCulled = false;
  mesh.position.set(36, 400, -114.5);
  mesh.scale.set(2, 1.58, 1.17);
  scene.add(mesh);

  /** Live-tuned from `?whoBackdropDebug=1` panel (also copied to clipboard). */
  const tune = {
    orthoFrustumScale: 1.3,
    orthoCenterShiftX: 0,
    orthoCenterShiftY: 0,
    timeScale: 0.55,
    overscanPx: 24,
    padMultiplier: 0.92,
    bottomReliefMultiplier: 0,
  };

  let lastGeomSig = '';
  let debugGui: { destroy: () => void } | null = null;

  let raf = 0;
  let running = true;
  let lastFrameMs = performance.now();

  /** Skip redundant work when RO/dvh fires repeatedly with the same rounded size (mobile). */
  let lastAppliedW = 0;
  let lastAppliedH = 0;

  let resizeRaf = 0;
  let resizeScheduled = false;

  const applyResize = (force = false) => {
    if (!sizeRoot) return;
    const w = Math.max(1, Math.round(sizeRoot.clientWidth));
    const h = Math.max(1, Math.round(sizeRoot.clientHeight));
    if (!force && w === lastAppliedW && h === lastAppliedH) {
      return;
    }
    lastAppliedW = w;
    lastAppliedH = h;

    const layout = computeWhoArchBackdropLayout(w, h, amp, {
      overscanPx: tune.overscanPx,
      padMultiplier: tune.padMultiplier,
      bottomReliefMultiplier: tune.bottomReliefMultiplier,
    });

    const s = tune.orthoFrustumScale;
    const midX = (layout.orthoLeft + layout.orthoRight) / 2 + tune.orthoCenterShiftX;
    const midY = (layout.orthoTop + layout.orthoBottom) / 2 + tune.orthoCenterShiftY;
    const halfW = ((layout.orthoRight - layout.orthoLeft) * s) / 2;
    const halfH = ((layout.orthoTop - layout.orthoBottom) * s) / 2;

    camera.left = midX - halfW;
    camera.right = midX + halfW;
    camera.top = midY + halfH;
    camera.bottom = midY - halfH;
    camera.updateProjectionMatrix();

    const scaledW = layout.planeW * s;
    const scaledH = layout.planeH * s;
    const sx = Math.max(24, Math.ceil(scaledW * 0.06));
    const sy = Math.max(24, Math.ceil(scaledH * 0.16));

    renderer.setSize(w, h, false);
    uniforms.u_resolution.value.set(w, h);
    uniforms.u_shadow_power.value = w < 600 ? 5 : 6;

    const geomSig = JSON.stringify({
      scaledW,
      scaledH,
      sx,
      sy,
      br: layout.bottomRelief,
      s,
      opx: tune.overscanPx,
      pm: tune.padMultiplier,
      brm: tune.bottomReliefMultiplier,
    });

    if (geomSig !== lastGeomSig) {
      lastGeomSig = geomSig;
      mesh.geometry.dispose();
      const geom = new THREE.PlaneGeometry(scaledW, scaledH, sx, sy);
      if (layout.bottomRelief > 0) {
        geom.translate(0, -(layout.bottomRelief * s) / 2, 0);
      }
      mesh.geometry = geom;
    }
  };

  const scheduleResize = () => {
    if (resizeScheduled) return;
    resizeScheduled = true;
    resizeRaf = requestAnimationFrame(() => {
      resizeScheduled = false;
      resizeRaf = 0;
      applyResize(false);
    });
  };

  const ro = sizeRoot ? new ResizeObserver(() => scheduleResize()) : null;
  ro?.observe(sizeRoot);
  applyResize(true);

  const tick = () => {
    if (!running) return;
    const now = performance.now();
    const delta = Math.min(now - lastFrameMs, 1000 / 15);
    lastFrameMs = now;
    uniforms.u_time.value += delta * tune.timeScale;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  /** Avoid stop/start thrash when intersection barely crosses thresholds while scrolling. */
  let pauseAfterHidden: ReturnType<typeof setTimeout> | null = null;
  const PAUSE_RENDER_MS = 180;

  const io = new IntersectionObserver(
    (entries) => {
      const vis = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0);
      if (vis) {
        if (pauseAfterHidden !== null) {
          clearTimeout(pauseAfterHidden);
          pauseAfterHidden = null;
        }
        if (!running) {
          running = true;
          lastFrameMs = performance.now();
          raf = requestAnimationFrame(tick);
        }
      } else {
        if (pauseAfterHidden !== null) {
          clearTimeout(pauseAfterHidden);
        }
        pauseAfterHidden = setTimeout(() => {
          pauseAfterHidden = null;
          if (running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        }, PAUSE_RENDER_MS);
      }
    },
    { root: null, rootMargin: '120px', threshold: [0, 0.01, 0.05, 0.15, 0.35] },
  );

  raf = requestAnimationFrame(tick);

  requestAnimationFrame(() => {
    const sectionEl = document.getElementById('who');
    if (sectionEl) io.observe(sectionEl);
    else io.observe(canvas);
  });

  if (typeof window !== 'undefined') {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('whoBackdropDebug') === '1') {
      debugGui = attachWhoArchBackdropDebug({
        camera,
        mesh,
        uniforms: uniforms as Record<string, THREE.IUniform>,
        tune,
        amp,
        freqX,
        freqY,
        refreshLayout: () => applyResize(true),
      });
    }
  }

  return {
    destroy: () => {
      running = false;
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeScheduled = false;
      if (pauseAfterHidden !== null) {
        clearTimeout(pauseAfterHidden);
        pauseAfterHidden = null;
      }
      debugGui?.destroy();
      debugGui = null;
      io.disconnect();
      ro?.disconnect();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}

export function unmountWhoArchBackdrop(): void {
  active?.destroy();
  active = null;
}

export function mountWhoArchBackdrop(): void {
  unmountWhoArchBackdrop();
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const el = document.getElementById('artify-who-canvas');
  if (!el || !(el instanceof HTMLCanvasElement)) return;

  active = createRuntime(el);
}
