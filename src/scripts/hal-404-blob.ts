/**
 * HAL-adjacent 404 “eye” blob: displaced icosphere + pre-recorded narration (HTML5 Audio).
 * Distortion ramps up while narration is playing.
 */
import * as THREE from "three";

import {
  disposeHal404AudioContext,
  getHal404ActiveAudio,
  getHal404SpeechAudioDrive,
  isHal404AudioPlaying,
  playHal404TierAudio,
} from "../lib/hal-404-audio";
import {
  HAL_404_TIER_LINES,
  muteHal404Speech,
  pickRandomHal404VariantIndex,
} from "../lib/hal-404-speech";
import {
  clientToNdc,
  computePointerAggression,
} from "../lib/hal-404-pointer";
import {
  proximityFromScreenPointOrbHost,
  shouldAutoStartOrbSpeech,
  shouldHoldSpeechProximity,
  volumeFromProximity,
} from "../lib/hal-404-voice";

export {
  HAL_404_MESSAGES,
  HAL_404_TIER_LINES,
  HAL_404_SPEECH,
  HAL_404_TRANSCRIPT,
  muteHal404Speech,
  pickRandomHal404VariantIndex,
} from "../lib/hal-404-speech";
export { hal404TierAudioUrl } from "../lib/hal-404-audio";

/** --color-surge */
const COL_SURGE = 0x6b64c9;
/** --color-buzz */
const COL_BUZZ = 0xc8ceff;
/** Lerp target when narration escalates + interaction (angry red) */
const COL_ANGRY = 0xc41e3a;
const COL_ANGRY_EMISSIVE = 0xff2a3d;

const colCalm = new THREE.Color(COL_SURGE);
const colAngry = new THREE.Color(COL_ANGRY);
const colAngryEmissive = new THREE.Color(COL_ANGRY_EMISSIVE);
const colBuzz = new THREE.Color(COL_BUZZ);
const colAngryRim = new THREE.Color(0xff4d5c);
/** Key light warm tint at max anger */
const colWarmKey = new THREE.Color(0xffd0d5);

let hal404PlayManual: (() => void) | null = null;

export function hal404ImpliedHypercubeData(size = 1): {
  points: Float32Array;
  streaks: Float32Array;
  /** Full edge segments ax,ay,az,bx,by,bz — outer (12) + inner (12) + connectors (8) = 32 edges. */
  flowEdges: Float32Array;
} {
  const s = Math.max(1e-6, size);

  const outer = [
    [-1, -1, -1],
    [1, -1, -1],
    [-1, 1, -1],
    [1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [-1, 1, 1],
    [1, 1, 1],
  ].map((v) => new THREE.Vector3(v[0]! * s, v[1]! * s, v[2]! * s));

  // Inner cube: rotated and slightly smaller to imply “hypercube” depth.
  const inner = outer.map((v) => v.clone().multiplyScalar(0.68));
  const rot = new THREE.Euler(0.38, 0.72, 0.15);
  for (const v of inner) v.applyEuler(rot);

  const points = new Float32Array((outer.length + inner.length) * 3);
  let p = 0;
  for (const v of [...outer, ...inner]) {
    points[p++] = v.x;
    points[p++] = v.y;
    points[p++] = v.z;
  }

  const edgePairs = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ] as const;

  const segLen = s * 0.46;
  const streaksArr: number[] = [];
  const tmp = new THREE.Vector3();

  function pushShortStreak(a: THREE.Vector3, b: THREE.Vector3) {
    const dir = tmp.copy(b).sub(a);
    const len = Math.max(1e-6, dir.length());
    dir.multiplyScalar(1 / len);
    // short near each vertex (gap in the middle)
    const a2 = a.clone().addScaledVector(dir, segLen);
    const b2 = b.clone().addScaledVector(dir, -segLen);
    streaksArr.push(a.x, a.y, a.z, a2.x, a2.y, a2.z);
    streaksArr.push(b.x, b.y, b.z, b2.x, b2.y, b2.z);
  }

  // Outer implied edges.
  for (const [i, j] of edgePairs) pushShortStreak(outer[i], outer[j]);
  // “W” connections outer↔inner (like a tesseract projection).
  for (let i = 0; i < outer.length; i++) pushShortStreak(outer[i]!, inner[i]!);

  const flowList: number[] = [];
  for (const [i, j] of edgePairs) {
    const a = outer[i]!;
    const b = outer[j]!;
    flowList.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  for (const [i, j] of edgePairs) {
    const a = inner[i]!;
    const b = inner[j]!;
    flowList.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  for (let i = 0; i < 8; i++) {
    const a = outer[i]!;
    const b = inner[i]!;
    flowList.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }

  const streaks = new Float32Array(streaksArr);
  const flowEdges = new Float32Array(flowList);
  return { points, streaks, flowEdges };
}

function createHal404SoftParticleTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (!ctx) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHal404FilmGrain(
  container: HTMLElement,
  disabled: boolean
): { update: () => void; destroy: () => void } {
  if (disabled) {
    return {
      update: () => {},
      destroy: () => {},
    };
  }

  const el = document.createElement("canvas");
  el.className =
    "pointer-events-none absolute inset-0 z-[1] size-full touch-none";
  el.setAttribute("aria-hidden", "true");
  const ctx = el.getContext("2d", { alpha: true });
  if (!ctx) {
    return {
      update: () => {},
      destroy: () => {},
    };
  }

  /** Large enough to scale smoothly; soft-light reads on dark void. */
  const w = 320;
  const h = 240;
  el.width = w;
  el.height = h;
  el.style.opacity = "0.22";
  el.style.mixBlendMode = "soft-light";
  container.appendChild(el);

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;
  ctx.imageSmoothingEnabled = true;
  let grainTick = 0;

  return {
    update() {
      grainTick += 1;
      if (grainTick % 2 !== 0) return;
      for (let i = 0; i < data.length; i += 4) {
        const n = Math.random() * 255;
        data[i] = n;
        data[i + 1] = n;
        data[i + 2] = n;
        data[i + 3] = 58;
      }
      ctx.putImageData(imgData, 0, 0);
    },
    destroy() {
      if (el.parentNode === container) {
        container.removeChild(el);
      }
    },
  };
}

/** Play the next tier at full volume (e.g. Safari / tap). Interrupts any current line. */
export function playHal404Speech(): void {
  hal404PlayManual?.();
}

export function mountHal404Blob(
  container: HTMLElement,
  options?: { skipSpeech?: boolean; skipPointerInteraction?: boolean }
): () => void {
  const skipSpeech = options?.skipSpeech === true;
  const skipPointer = options?.skipPointerInteraction === true;

  const canvas = document.createElement("canvas");
  canvas.className =
    "pointer-events-none absolute inset-0 z-0 block size-full touch-none";
  canvas.setAttribute("role", "img");
  const ariaOrb = skipPointer
    ? "Animated orb representing the error interface"
    : "Animated orb that reacts to pointer movement; represents the error interface";
  const ariaMute = skipSpeech
    ? ""
    : " Move the pointer over the orb to hear warnings; move away to silence. Click the orb to play the next line or to mute while speaking. Use Play if the browser requires a tap to unlock audio.";
  canvas.setAttribute("aria-label", ariaOrb + ariaMute);
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = null;

  /** Inside-out gradient so the WebGL rect reads as cinematic space, not a flat card; matches void/twilight. */
  const backdropGeo = new THREE.SphereGeometry(48, 40, 32);
  const backdropMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: true,
    uniforms: {},
    vertexShader: `
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vLocal;
      void main() {
        vec3 dir = normalize(vLocal);
        float h = dir.y * 0.5 + 0.5;
        vec3 twilight = vec3(0.106, 0.106, 0.220);
        vec3 voidCol = vec3(0.071, 0.071, 0.165);
        vec3 c = mix(voidCol, twilight, h);
        float horizon = 1.0 - abs(dir.y);
        c += vec3(0.04, 0.035, 0.08) * horizon * horizon * 0.35;
        float vig = 0.88 + 0.12 * (1.0 - abs(dir.z));
        c *= vig;
        float stageFloor = smoothstep(0.35, -0.72, dir.y);
        c *= 1.0 - stageFloor * 0.42;
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
  backdrop.renderOrder = -200;
  backdrop.castShadow = false;
  backdrop.receiveShadow = false;
  scene.add(backdrop);

  /** “Stage floor” directly under the orb — receives real shadow from the blob. */
  const stageGeo = new THREE.PlaneGeometry(18, 18);
  const stageMat = new THREE.ShadowMaterial({
    opacity: 0.42,
    color: 0x06041a,
    transparent: true,
  });
  const stageMesh = new THREE.Mesh(stageGeo, stageMat);
  stageMesh.receiveShadow = true;
  stageMesh.castShadow = false;
  stageMesh.rotation.x = -Math.PI / 2;
  stageMesh.position.set(0, -1.42, 0);
  stageMesh.renderOrder = -155;
  scene.add(stageMesh);

  const FOV_DEG = 42;
  /** World radius that must fit in frame (geometry ~1.15 + displacement + margin). */
  const FRAMING_RADIUS = 2.85;

  const camera = new THREE.PerspectiveCamera(FOV_DEG, 1, 0.1, 100);

  const ambient = new THREE.AmbientLight(0x8890c8, 0.3);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(COL_BUZZ, 1.2);
  key.position.set(0.65, 2.35, 3.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.2;
  key.shadow.camera.far = 28;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.00015;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 10;
  key.shadow.blurSamples = 16;
  scene.add(key);

  const orbRoot = new THREE.Group();
  scene.add(orbRoot);

  const rim = new THREE.PointLight(COL_SURGE, 2.2, 12, 2);
  const rimBase = new THREE.Vector3(-2.5, -1.2, 3);
  rim.position.copy(rimBase);
  rim.castShadow = false;
  orbRoot.add(rim);

  const geo = new THREE.IcosahedronGeometry(1.15, 4);
  geo.computeVertexNormals();
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const base = new Float32Array(posAttr.array.length);
  base.set(posAttr.array);
  geo.computeVertexNormals();
  const normalAttr = geo.attributes.normal as THREE.BufferAttribute;
  const baseN = new Float32Array(normalAttr.array.length);
  baseN.set(normalAttr.array);
  const n = new THREE.Vector3();
  const p = new THREE.Vector3();

  const mat = new THREE.MeshStandardMaterial({
    color: COL_SURGE,
    emissive: COL_SURGE,
    emissiveIntensity: 0.22,
    metalness: 0.55,
    roughness: 0.38,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  orbRoot.add(mesh);

  /** Same displaced geometry as the orb so the halo tracks audio + deformation; fresnel = soft round edges. */
  const glowUniforms = {
    uColor: { value: new THREE.Color(COL_SURGE) },
    uStrength: { value: 0.5 },
    uFresnelPow: { value: 2.35 },
    uCameraPos: { value: new THREE.Vector3() },
  };
  const glowMat = new THREE.ShaderMaterial({
    uniforms: glowUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uFresnelPow;
      uniform vec3 uCameraPos;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(uCameraPos - vWorldPos);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float rim = pow(1.0 - ndv, uFresnelPow);
        float soft = smoothstep(0.0, 1.0, rim);
        float a = soft * uStrength;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  });
  const glowMesh = new THREE.Mesh(geo, glowMat);
  glowMesh.scale.setScalar(1.024);
  glowMesh.renderOrder = 3;
  glowMesh.castShadow = false;
  glowMesh.receiveShadow = false;
  mesh.add(glowMesh);

  /** Option C: implied hypercube “only light” cage (points + short streaks + edge flow). */
  const hyper = hal404ImpliedHypercubeData(1.55);
  const hyperParticleTex = createHal404SoftParticleTexture();

  const hyperPointsGeo = new THREE.BufferGeometry();
  hyperPointsGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(hyper.points, 3)
  );
  const hyperStreaksGeo = new THREE.BufferGeometry();
  hyperStreaksGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(hyper.streaks, 3)
  );

  const PARTICLES_PER_EDGE = 6;
  const nFlowEdges = hyper.flowEdges.length / 6;
  const nFlowParticles = nFlowEdges * PARTICLES_PER_EDGE;
  const flowPositions = new Float32Array(nFlowParticles * 3);
  const flowPhase = new Float32Array(nFlowParticles);
  const flowSpeed = new Float32Array(nFlowParticles);
  for (let e = 0; e < nFlowEdges; e++) {
    for (let k = 0; k < PARTICLES_PER_EDGE; k++) {
      const idx = e * PARTICLES_PER_EDGE + k;
      flowPhase[idx] =
        k / PARTICLES_PER_EDGE + (e % 5) * 0.017 + (k % 3) * 0.031;
      flowSpeed[idx] =
        (0.055 + (idx % 7) * 0.009 + (e % 4) * 0.006) * 0.55;
    }
  }
  const hyperFlowGeo = new THREE.BufferGeometry();
  hyperFlowGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(flowPositions, 3).setUsage(THREE.DynamicDrawUsage)
  );

  const hyperCol = new THREE.Color(COL_BUZZ);
  const hyperPointsMat = new THREE.PointsMaterial({
    map: hyperParticleTex,
    color: hyperCol,
    size: 0.11,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    /** Floor + contact shadow write depth; cage is a hologram and must not vanish under the stage. */
    depthTest: false,
  });
  const hyperHaloMat = new THREE.PointsMaterial({
    map: hyperParticleTex,
    color: hyperCol,
    size: 0.28,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const hyperFlowMat = new THREE.PointsMaterial({
    map: hyperParticleTex,
    color: hyperCol,
    size: 0.075,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const hyperStreaksMat = new THREE.LineBasicMaterial({
    color: hyperCol,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });

  const hyperPoints = new THREE.Points(hyperPointsGeo, hyperPointsMat);
  const hyperHalo = new THREE.Points(hyperPointsGeo, hyperHaloMat);
  const hyperFlow = new THREE.Points(hyperFlowGeo, hyperFlowMat);
  const hyperStreaks = new THREE.LineSegments(hyperStreaksGeo, hyperStreaksMat);
  hyperPoints.renderOrder = 6;
  hyperHalo.renderOrder = 5;
  hyperFlow.renderOrder = 7;
  hyperStreaks.renderOrder = 6;
  hyperPoints.position.set(0, 0, 0);
  hyperHalo.position.set(0, 0, 0);
  hyperFlow.position.set(0, 0, 0);
  hyperStreaks.position.set(0, 0, 0);
  mesh.add(hyperHalo);
  mesh.add(hyperPoints);
  mesh.add(hyperFlow);
  mesh.add(hyperStreaks);

  const flowEdgeArr = hyper.flowEdges;
  const flowTmpA = new THREE.Vector3();
  const flowTmpB = new THREE.Vector3();
  const flowTmpOut = new THREE.Vector3();

  /** Soft contact shadow on an XY plane behind the orb (reads as “on the stage”). */
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sctx = shadowCanvas.getContext("2d");
  if (sctx) {
    const g = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(6,4,18,0.62)");
    g.addColorStop(0.42, "rgba(14,12,36,0.22)");
    g.addColorStop(0.72, "rgba(18,16,42,0.06)");
    g.addColorStop(1, "rgba(18,16,42,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 256, 256);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
  });
  const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.renderOrder = -80;
  shadowMesh.position.set(0, -0.92, -0.48);
  orbRoot.add(shadowMesh);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const grain = createHal404FilmGrain(container, reducedMotion);

  let speakIntensity = 0;
  /** Smoothed envelope from Web Audio analysis (follows the actual clip). */
  let audioDriveSmoothed = 0;
  let t = 0;
  let rafId = 0;

  const clock = new THREE.Clock();

  const aimSmoothed = new THREE.Vector2(0, 0);
  const aimTarget = new THREE.Vector2(0, 0);
  let aggressionSmoothed = 0;
  let aggressionTarget = 0;
  let pointerOver = false;
  let prevNdcX = 0;
  let prevNdcY = 0;
  let prevDist = 1.5;
  let pointerSampleInitialized = false;
  let lastPointerTs = performance.now();

  /** Index of the next line to play on hover or Play (0..n). Advances when a line *starts*, so a new approach skips ahead even if the last clip did not finish. */
  let nextHoverTier = 0;
  let speechInProgress = false;
  let manualPlaybackActive = false;
  let lastSpeechProximity = 0;
  let speechCooldownUntil = 0;
  let currentPlaybackMode: "hover" | "manual" | null = null;
  /** True if last frame was already “near enough” for auto-start (edge-detect new approaches). */
  let prevNearEnoughForSpeech = false;
  /** Smoothed 0–1: redder orb as tiers complete + pointer aggression. */
  let angerSmoothed = 0;

  let globalClientX = 0;
  let globalClientY = 0;
  let hasGlobalPointer = false;

  const onGlobalPointer = (e: PointerEvent): void => {
    globalClientX = e.clientX;
    globalClientY = e.clientY;
    hasGlobalPointer = true;
  };

  function updatePointerInteraction(e: PointerEvent): void {
    globalClientX = e.clientX;
    globalClientY = e.clientY;
    hasGlobalPointer = true;
    if (skipPointer) return;

    const hostRect = container.getBoundingClientRect();
    const inside =
      e.clientX >= hostRect.left &&
      e.clientX <= hostRect.right &&
      e.clientY >= hostRect.top &&
      e.clientY <= hostRect.bottom;

    if (!inside) {
      if (pointerOver) {
        pointerOver = false;
        pointerSampleInitialized = false;
        aggressionTarget = 0;
        aimTarget.set(0, 0);
      }
      return;
    }

    if (!pointerOver) {
      pointerOver = true;
      pointerSampleInitialized = false;
    }

    const now = performance.now();
    const dt = Math.max((now - lastPointerTs) / 1000, 1 / 1000);
    lastPointerTs = now;
    const ndc = clientToNdc(e.clientX, e.clientY, hostRect);
    aimTarget.set(ndc.x, ndc.y);

    if (!pointerSampleInitialized) {
      prevNdcX = ndc.x;
      prevNdcY = ndc.y;
      prevDist = Math.hypot(ndc.x, ndc.y);
      pointerSampleInitialized = true;
      aggressionTarget = 0;
      return;
    }

    const { aggression, dist } = computePointerAggression({
      ndcX: ndc.x,
      ndcY: ndc.y,
      prevNdcX,
      prevNdcY,
      prevDist,
      dt,
    });
    prevNdcX = ndc.x;
    prevNdcY = ndc.y;
    prevDist = dist;
    aggressionTarget = aggression;
  }

  const onWindowPointerMove = (e: PointerEvent): void => {
    updatePointerInteraction(e);
  };

  function onMessageComplete(_index: number, mode: "hover" | "manual"): void {
    speechInProgress = false;
    currentPlaybackMode = null;
    if (mode === "manual") manualPlaybackActive = false;
  }

  function speakMessageAtIndex(index: number, mode: "hover" | "manual"): void {
    if (!HAL_404_TIER_LINES[index]?.length) {
      if (mode === "manual") manualPlaybackActive = false;
      return;
    }

    if (speechInProgress || isHal404AudioPlaying()) {
      muteHal404Speech();
      speechInProgress = false;
      manualPlaybackActive = false;
      currentPlaybackMode = null;
    }

    speechInProgress = true;
    if (mode === "manual") manualPlaybackActive = true;
    currentPlaybackMode = mode;

    nextHoverTier = Math.min(index + 1, HAL_404_TIER_LINES.length);

    const variantIndex = pickRandomHal404VariantIndex(index);

    const vol =
      mode === "manual" ? 1 : volumeFromProximity(lastSpeechProximity);

    playHal404TierAudio(index, variantIndex, {
      volume: Math.max(0.06, Math.min(1, vol)),
      onEnded: () => {
        onMessageComplete(index, mode);
      },
      onError: () => {
        nextHoverTier = index;
        speechInProgress = false;
        manualPlaybackActive = false;
        currentPlaybackMode = null;
      },
    });
  }

  const onCanvasMute = (): void => {
    muteHal404Speech();
    speechInProgress = false;
    manualPlaybackActive = false;
    currentPlaybackMode = null;
    speechCooldownUntil = performance.now() + 400;
  };

  /** Orb area: click starts the next line when idle (no hover edge needed); click mutes while playing. */
  function onWindowOrbClick(e: MouseEvent): void {
    if (skipSpeech) return;
    const el = e.target;
    if (
      el instanceof Element &&
      el.closest(
        "button, a[href], input, select, textarea, [role='button'], label"
      )
    ) {
      return;
    }
    const r = container.getBoundingClientRect();
    const inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    if (!inside) return;

    if (speechInProgress || isHal404AudioPlaying()) {
      onCanvasMute();
      return;
    }

    const now = performance.now();
    if (now < speechCooldownUntil || nextHoverTier >= HAL_404_TIER_LINES.length) {
      return;
    }
    speakMessageAtIndex(
      Math.min(nextHoverTier, HAL_404_TIER_LINES.length - 1),
      "manual"
    );
  }

  if (!skipPointer) {
    window.addEventListener("pointermove", onWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", onWindowPointerMove, {
      passive: true,
    });
  }

  if (!skipSpeech) {
    window.addEventListener("pointermove", onGlobalPointer, { passive: true });
    window.addEventListener("pointerdown", onGlobalPointer, { passive: true });
    window.addEventListener("click", onWindowOrbClick);

    hal404PlayManual = () => {
      if (nextHoverTier >= HAL_404_TIER_LINES.length) return;
      speakMessageAtIndex(
        Math.min(nextHoverTier, HAL_404_TIER_LINES.length - 1),
        "manual"
      );
    };
  }

  function resize(): void {
    const r = container.getBoundingClientRect();
    const w = Math.max(1, r.width);
    const h = Math.max(1, r.height);
    const aspect = w / h;
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(FOV_DEG / 2));
    camera.position.z =
      (FRAMING_RADIUS / tanHalfFov) * Math.max(1, 1 / aspect);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  const onWinResize = (): void => {
    resize();
  };
  window.addEventListener("resize", onWinResize);
  const ro = new ResizeObserver(() => resize());
  ro.observe(container);
  resize();

  function animate(): void {
    const dt = clock.getDelta();
    t += dt;

    const speaking = isHal404AudioPlaying();
    const target = speaking ? 1 : 0;
    speakIntensity += (target - speakIntensity) * Math.min(1, dt * 5.5);

    const rawAudioDrive = speaking ? getHal404SpeechAudioDrive() : 0;
    audioDriveSmoothed +=
      (rawAudioDrive - audioDriveSmoothed) * Math.min(1, dt * 22);
    if (!speaking) {
      audioDriveSmoothed *= Math.exp(-dt * 10);
    }
    const speechPulse = THREE.MathUtils.clamp(
      speakIntensity * (0.12 + 0.88 * audioDriveSmoothed),
      0,
      1.25
    );

    if (!skipPointer) {
      aggressionSmoothed +=
        (aggressionTarget - aggressionSmoothed) *
        Math.min(1, dt * (pointerOver ? 18 : 5.5));
      const aimRate = pointerOver ? 14 : 7;
      aimSmoothed.lerp(aimTarget, 1 - Math.exp(-dt * aimRate));
    }

    if (!skipSpeech) {
      const rect = container.getBoundingClientRect();
      /** Speech follows the pointer only while it is over the canvas — not “near” in the viewport. */
      const raw =
        pointerOver && hasGlobalPointer
          ? proximityFromScreenPointOrbHost(globalClientX, globalClientY, rect)
          : 0;
      lastSpeechProximity += (raw - lastSpeechProximity) * Math.min(1, dt * 12);

      const activeEl = getHal404ActiveAudio();
      if (activeEl && !activeEl.paused && currentPlaybackMode === "hover") {
        activeEl.volume = Math.max(
          0.06,
          Math.min(1, volumeFromProximity(lastSpeechProximity))
        );
      } else if (activeEl && !activeEl.paused && currentPlaybackMode === "manual") {
        activeEl.volume = 1;
      }

      if (
        !shouldHoldSpeechProximity(lastSpeechProximity) &&
        (speechInProgress || isHal404AudioPlaying())
      ) {
        muteHal404Speech();
        speechInProgress = false;
        manualPlaybackActive = false;
        currentPlaybackMode = null;
        speechCooldownUntil = performance.now() + 450;
      }

      const nearEnough = shouldAutoStartOrbSpeech(lastSpeechProximity);
      if (!nearEnough) {
        prevNearEnoughForSpeech = false;
      }

      const engagedNewApproach = nearEnough && !prevNearEnoughForSpeech;
      prevNearEnoughForSpeech = nearEnough;

      const now = performance.now();
      if (
        engagedNewApproach &&
        now >= speechCooldownUntil &&
        !speechInProgress &&
        !isHal404AudioPlaying() &&
        nextHoverTier < HAL_404_TIER_LINES.length
      ) {
        speakMessageAtIndex(nextHoverTier, "hover");
      }
    }

    const nMsg = HAL_404_TIER_LINES.length;
    const lineAggro = !skipSpeech ? Math.min(1, nextHoverTier / nMsg) : 0;
    const agitationMul = 1 + lineAggro * 1.45 + lineAggro * lineAggro * 0.55;

    const threat = skipPointer ? 0 : aggressionSmoothed;
    const threatPulse = threat * threat;

    const pulse =
      speechPulse *
      (0.55 + 0.45 * Math.sin(t * 22 + audioDriveSmoothed * 5)) *
      (0.4 + 0.6 * Math.sin(t * 7.3 + audioDriveSmoothed * 2.5)) *
      (0.72 + 0.28 * lineAggro);
    const idle =
      (0.045 + 0.018 * Math.sin(t * 1.4) * Math.cos(t * 0.9)) *
        (1 + lineAggro * 0.5) +
      (speaking ? audioDriveSmoothed * 0.042 : 0);
    const threatMul = (1 + threat * 1.05) * agitationMul;
    const attackSpike =
      threat *
      (0.14 + lineAggro * 0.12) *
      Math.sin(t * (29 + lineAggro * 8) + threat * 11 + aimSmoothed.x * 6);

    for (let i = 0; i < posAttr.count; i++) {
      const bx = base[i * 3]!;
      const by = base[i * 3 + 1]!;
      const bz = base[i * 3 + 2]!;
      n.set(baseN[i * 3]!, baseN[i * 3 + 1]!, baseN[i * 3 + 2]!);
      const wave =
        (idle +
          (0.07 + lineAggro * 0.055) *
            Math.sin(t * (2.1 + lineAggro * 1.2) + bx * 4.2) *
            Math.cos(t * 1.7 + by * 3.1) +
          pulse * (0.28 + lineAggro * 0.24) *
            Math.sin(t * (16 + lineAggro * 10) + (bx + by + bz) * 6)) *
          threatMul +
        attackSpike * Math.sin(t * (19 + lineAggro * 6) + bx * 5 + by * 4);
      p.set(bx, by, bz).addScaledVector(n, wave);
      posAttr.setXYZ(i, p.x, p.y, p.z);
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    const meshBaseYaw =
      t * (0.11 + lineAggro * 0.22) +
      threatPulse * (0.08 + lineAggro * 0.1);
    const meshPointerYaw =
      aimSmoothed.x * (0.62 + lineAggro * 0.35) * threat;
    const meshAudioWobbleYaw =
      speaking
        ? audioDriveSmoothed * 0.09 * Math.sin(t * 48 + audioDriveSmoothed * 8)
        : 0;
    mesh.rotation.y =
      meshBaseYaw + meshPointerYaw + meshAudioWobbleYaw;

    const meshBasePitch =
      Math.sin(t * (0.35 + lineAggro * 0.25)) * (0.08 + lineAggro * 0.06);
    const meshPointerPitch =
      -aimSmoothed.y * (0.52 + lineAggro * 0.28) * threat;
    mesh.rotation.x = meshBasePitch + meshPointerPitch;

    const lungeZ = (0.15 + lineAggro * 0.12) * threatPulse;
    const lean = (0.2 + lineAggro * 0.15) * threat;
    mesh.position.x = aimSmoothed.x * lean;
    mesh.position.y = aimSmoothed.y * lean;
    mesh.position.z = lungeZ;

    key.position.x = 2.2 + aimSmoothed.x * 1.35 * threat;
    key.position.y = 1.8 - aimSmoothed.y * 0.9 * threat;
    rim.position.x = rimBase.x - aimSmoothed.x * 1.1 * threat;
    rim.position.y = rimBase.y + aimSmoothed.y * 0.85 * threat;
    rim.intensity = 2.2 + threat * 3.2 + threatPulse * 1.4;

    mat.emissiveIntensity =
      0.18 +
      speakIntensity * (0.35 + lineAggro * 0.12) +
      (speaking ? audioDriveSmoothed * 0.38 : 0) +
      threat * (0.42 + lineAggro * 0.2) +
      threatPulse * (0.22 + lineAggro * 0.15);

    if (!skipSpeech) {
      const nTiers = HAL_404_TIER_LINES.length;
      const tierFrac = Math.min(1, nextHoverTier / nTiers);
      const angerTarget = THREE.MathUtils.clamp(
        tierFrac * 0.78 +
          aggressionSmoothed * 0.28 +
          speakIntensity * 0.14 +
          (speaking ? audioDriveSmoothed * 0.12 : 0) +
          lineAggro * 0.12,
        0,
        1
      );
      angerSmoothed += (angerTarget - angerSmoothed) * Math.min(1, dt * 3.5);
      mat.color.copy(colCalm).lerp(colAngry, angerSmoothed);
      mat.emissive.copy(colCalm).lerp(colAngryEmissive, angerSmoothed);
      key.color.copy(colBuzz).lerp(colWarmKey, angerSmoothed * 0.55);
      rim.color.copy(colCalm).lerp(colAngryRim, angerSmoothed);
      rim.intensity = 2.2 + threat * 3.2 + threatPulse * 1.4 + angerSmoothed * 1.8;
    }

    glowMat.uniforms.uCameraPos.value.copy(camera.position);
    glowMat.uniforms.uColor.value.copy(mat.emissive).multiplyScalar(1.12);
    const anger = skipSpeech ? 0 : angerSmoothed;
    glowMat.uniforms.uFresnelPow.value = 1.75 + (1.0 - anger) * 0.95;
    const glowPulse =
      speakIntensity * 0.24 + (speaking ? audioDriveSmoothed * 0.32 : 0);
    glowMat.uniforms.uStrength.value =
      0.36 +
      glowPulse +
      threat * 0.14 +
      threatPulse * 0.11 +
      anger * 0.34 +
      (speaking ? audioDriveSmoothed * 0.22 : 0);
    const glowScale =
      1.016 +
      speechPulse * 0.068 +
      threatPulse * 0.036 +
      (speaking ? audioDriveSmoothed * 0.052 : 0);
    glowMesh.scale.setScalar(glowScale);

    // Hypercube hologram: subtle until anger rises; tracks HAL colors and breathes with audio.
    const hyperVis = THREE.MathUtils.clamp(
      0.28 +
        anger * 0.55 +
        (speaking ? audioDriveSmoothed * 0.26 : 0) +
        speakIntensity * 0.14,
      0,
      1
    );
    hyperCol.copy(colBuzz).lerp(colAngryEmissive, anger);
    hyperPointsMat.color.copy(hyperCol);
    hyperHaloMat.color.copy(hyperCol);
    hyperFlowMat.color.copy(hyperCol);
    hyperStreaksMat.color.copy(hyperCol);
    hyperPointsMat.opacity = hyperVis * (0.42 + 0.32 * (1 - anger));
    hyperHaloMat.opacity = hyperVis * (0.26 + 0.18 * (1 - anger));
    hyperFlowMat.opacity = hyperVis * (0.52 + 0.32 * anger);
    hyperStreaksMat.opacity = hyperVis * (0.34 + 0.24 * anger);
    const hyperScale =
      1.0 +
      0.018 * Math.sin(t * (0.42 + anger * 0.32)) +
      (speaking ? audioDriveSmoothed * 0.01 : 0) +
      speechPulse * 0.008;
    hyperPoints.scale.setScalar(hyperScale);
    hyperHalo.scale.setScalar(hyperScale);
    hyperFlow.scale.setScalar(hyperScale);
    hyperStreaks.scale.setScalar(hyperScale);

    /**
     * Cage stays calmer: counter pointer + speech wobble, and most of the orb’s idle spin
     * (otherwise the cage still tracks meshBaseYaw / meshBasePitch and feels hectic).
     */
    const cageYaw = t * (0.007 + anger * 0.0045);
    const cagePitch = 0.012 * Math.sin(t * 0.14);
    const hyperYaw =
      cageYaw -
      0.985 * meshPointerYaw -
      0.985 * meshAudioWobbleYaw -
      0.86 * meshBaseYaw;
    const hyperPitch =
      cagePitch - 0.985 * meshPointerPitch - 0.82 * meshBasePitch;
    hyperPoints.rotation.y = hyperYaw;
    hyperHalo.rotation.y = hyperYaw;
    hyperFlow.rotation.y = hyperYaw;
    hyperStreaks.rotation.y = hyperYaw;
    hyperPoints.rotation.x = hyperPitch;
    hyperHalo.rotation.x = hyperPitch;
    hyperFlow.rotation.x = hyperPitch;
    hyperStreaks.rotation.x = hyperPitch;

    const leanCancel = 0.78;
    /** Slight lift so the cage clears the XZ stage plane (y ≈ -1.42) after world transform. */
    const cageLift = 0.09;
    hyperPoints.position.set(
      -mesh.position.x * leanCancel,
      -mesh.position.y * leanCancel + cageLift,
      -mesh.position.z * 0.35
    );
    hyperHalo.position.copy(hyperPoints.position);
    hyperFlow.position.copy(hyperPoints.position);
    hyperStreaks.position.copy(hyperPoints.position);

    const flowSpeedMul =
      0.18 +
      0.2 * anger +
      (speaking ? audioDriveSmoothed * 0.055 : 0) +
      speechPulse * 0.028;
    const flowPosAttr = hyperFlowGeo.attributes.position as THREE.BufferAttribute;
    const flowArr = flowPosAttr.array as Float32Array;
    let fq = 0;
    for (let e = 0; e < nFlowEdges; e++) {
      flowTmpA.set(
        flowEdgeArr[e * 6]!,
        flowEdgeArr[e * 6 + 1]!,
        flowEdgeArr[e * 6 + 2]!
      );
      flowTmpB.set(
        flowEdgeArr[e * 6 + 3]!,
        flowEdgeArr[e * 6 + 4]!,
        flowEdgeArr[e * 6 + 5]!
      );
      for (let k = 0; k < PARTICLES_PER_EDGE; k++) {
        const idx = e * PARTICLES_PER_EDGE + k;
        const u =
          ((flowPhase[idx]! + t * flowSpeed[idx]! * flowSpeedMul) % 1 + 1) % 1;
        flowTmpOut.lerpVectors(flowTmpA, flowTmpB, u);
        flowArr[fq++] = flowTmpOut.x;
        flowArr[fq++] = flowTmpOut.y;
        flowArr[fq++] = flowTmpOut.z;
      }
    }
    flowPosAttr.needsUpdate = true;

    shadowMesh.position.x = mesh.position.x * 0.94;
    shadowMesh.position.y = mesh.position.y * 0.42 - 0.92;
    shadowMesh.position.z = mesh.position.z - 0.54;

    grain.update();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    window.removeEventListener("resize", onWinResize);
    if (!skipSpeech) {
      window.removeEventListener("pointermove", onGlobalPointer);
      window.removeEventListener("pointerdown", onGlobalPointer);
      window.removeEventListener("click", onWindowOrbClick);
      hal404PlayManual = null;
    }
    if (!skipPointer) {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerdown", onWindowPointerMove);
    }
    grain.destroy();
    muteHal404Speech();
    disposeHal404AudioContext();
    geo.dispose();
    mat.dispose();
    glowMat.dispose();
    hyperPointsGeo.dispose();
    hyperStreaksGeo.dispose();
    hyperFlowGeo.dispose();
    hyperPointsMat.dispose();
    hyperHaloMat.dispose();
    hyperFlowMat.dispose();
    hyperStreaksMat.dispose();
    hyperParticleTex.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
    shadowTex.dispose();
    stageGeo.dispose();
    stageMat.dispose();
    backdropGeo.dispose();
    backdropMat.dispose();
    renderer.dispose();
    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}
