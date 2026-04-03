import GUI from 'lil-gui';
import type { IUniform, Mesh, OrthographicCamera, Vector2, Vector3, Vector4 } from 'three';

export type WhoArchBackdropDebugTune = {
  orthoFrustumScale: number;
  orthoCenterShiftX: number;
  orthoCenterShiftY: number;
  timeScale: number;
  overscanPx: number;
  padMultiplier: number;
  bottomReliefMultiplier: number;
};

export type WhoArchBackdropDebugContext = {
  camera: OrthographicCamera;
  mesh: Mesh;
  uniforms: Record<string, IUniform>;
  tune: WhoArchBackdropDebugTune;
  amp: number;
  freqX: number;
  freqY: number;
  refreshLayout: () => void;
};

function num(u: IUniform | undefined): number {
  return typeof u?.value === 'number' ? u.value : 0;
}

function vec2(u: IUniform | undefined): [number, number] {
  const v = u?.value as Vector2 | undefined;
  return v ? [v.x, v.y] : [0, 0];
}

function vec3(u: IUniform | undefined): [number, number, number] {
  const v = u?.value as Vector3 | undefined;
  return v ? [v.x, v.y, v.z] : [0, 0, 0];
}

function vec4(u: IUniform | undefined): [number, number, number, number] {
  const v = u?.value as Vector4 | undefined;
  return v ? [v.x, v.y, v.z, v.w] : [0, 0, 0, 0];
}

function buildSnapshot(ctx: WhoArchBackdropDebugContext) {
  const { camera, mesh, uniforms, tune, amp, freqX, freqY } = ctx;
  return {
    note: 'Who arch backdrop — paste into chat / apply to who-arch-backdrop.ts',
    tune: { ...tune },
    camera: {
      position: [camera.position.x, camera.position.y, camera.position.z],
      near: camera.near,
      far: camera.far,
    },
    mesh: {
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z],
    },
    layoutConstants: { amp, freqX, freqY },
    uniforms: {
      u_noiseSpeedGlobal: num(uniforms.u_noiseSpeedGlobal),
      u_noiseFreqGlobal: vec2(uniforms.u_noiseFreqGlobal),
      u_noiseAmp: num(uniforms.u_noiseAmp),
      u_deformNoiseFreq: vec2(uniforms.u_deformNoiseFreq),
      u_deformNoiseSpeed: num(uniforms.u_deformNoiseSpeed),
      u_deformNoiseFlow: num(uniforms.u_deformNoiseFlow),
      u_deformNoiseSeed: num(uniforms.u_deformNoiseSeed),
      u_layerSpeed0: num(uniforms.u_layerSpeed0),
      u_layerSpeed1: num(uniforms.u_layerSpeed1),
      u_layerSpeed2: num(uniforms.u_layerSpeed2),
      u_layerFlow0: num(uniforms.u_layerFlow0),
      u_layerFlow1: num(uniforms.u_layerFlow1),
      u_layerFlow2: num(uniforms.u_layerFlow2),
      u_layerFreq0: vec2(uniforms.u_layerFreq0),
      u_layerFreq1: vec2(uniforms.u_layerFreq1),
      u_layerFreq2: vec2(uniforms.u_layerFreq2),
      u_incline: num(uniforms.u_incline),
      u_offsetTop: num(uniforms.u_offsetTop),
      u_offsetBottom: num(uniforms.u_offsetBottom),
      u_active_colors: vec4(uniforms.u_active_colors),
      u_layerBlendWeight: num(uniforms.u_layerBlendWeight),
      u_shadow_power: num(uniforms.u_shadow_power),
      u_darken_top: num(uniforms.u_darken_top),
    },
  };
}

async function copySnapshot(ctx: WhoArchBackdropDebugContext) {
  const text = JSON.stringify(buildSnapshot(ctx), null, 2);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export function attachWhoArchBackdropDebug(ctx: WhoArchBackdropDebugContext): { destroy: () => void } {
  const gui = new GUI({ title: 'Who backdrop (debug)' });
  gui.domElement.style.position = 'fixed';
  gui.domElement.style.top = '10px';
  gui.domElement.style.right = '10px';
  gui.domElement.style.zIndex = '2147483647';
  gui.domElement.setAttribute('data-artify-who-backdrop-debug', 'true');

  const { camera, mesh, uniforms, tune, refreshLayout } = ctx;
  const u = uniforms;

  const onCamClip = () => {
    camera.updateProjectionMatrix();
  };

  const f1 = gui.addFolder('Camera & clip');
  f1.add(camera.position, 'x', -800, 800, 1);
  f1.add(camera.position, 'y', -800, 800, 1);
  f1.add(camera.position, 'z', 5, 800, 1);
  f1.add(camera, 'near', 0.1, 400, 0.5).onChange(onCamClip);
  f1.add(camera, 'far', 500, 100000, 10).onChange(onCamClip);

  const f2 = gui.addFolder('Ortho / frustum (layout)');
  f2.add(tune, 'orthoFrustumScale', 0.8, 1.3, 0.001).onChange(refreshLayout);
  f2.add(tune, 'orthoCenterShiftX', -400, 400, 1).onChange(refreshLayout);
  f2.add(tune, 'orthoCenterShiftY', -400, 400, 1).onChange(refreshLayout);
  f2.add(tune, 'overscanPx', 0, 24, 1).onChange(refreshLayout);
  f2.add(tune, 'padMultiplier', 0.5, 1.6, 0.01).onChange(refreshLayout);
  f2.add(tune, 'bottomReliefMultiplier', 0, 2.5, 0.05).onChange(refreshLayout);

  const f3 = gui.addFolder('Mesh transform');
  f3.add(mesh.position, 'x', -400, 400, 1);
  f3.add(mesh.position, 'y', -400, 400, 1);
  f3.add(mesh.position, 'z', -200, 200, 0.5);
  f3.add(mesh.scale, 'x', 0.5, 2, 0.01);
  f3.add(mesh.scale, 'y', 0.5, 2, 0.01);
  f3.add(mesh.scale, 'z', 0.5, 2, 0.01);

  const f4 = gui.addFolder('Animation / time');
  f4.add(tune, 'timeScale', 0, 3, 0.05);

  const f5 = gui.addFolder('Deform noise');
  const deformFreq = { x: (u.u_deformNoiseFreq.value as Vector2).x, y: (u.u_deformNoiseFreq.value as Vector2).y };
  f5.add(u.u_noiseAmp, 'value', 0, 900, 1).name('u_noiseAmp');
  f5.add(u.u_deformNoiseSpeed, 'value', 0, 80, 0.5).name('u_deformNoiseSpeed');
  f5.add(u.u_deformNoiseFlow, 'value', 0, 30, 0.1).name('u_deformNoiseFlow');
  f5.add(u.u_deformNoiseSeed, 'value', 0, 100, 1).name('u_deformNoiseSeed');
  f5
    .add(deformFreq, 'x', 0.2, 30, 0.05)
    .name('deformFreq.x')
    .onChange((v: number) => {
      (u.u_deformNoiseFreq.value as Vector2).x = v;
    });
  f5
    .add(deformFreq, 'y', 0.2, 30, 0.05)
    .name('deformFreq.y')
    .onChange((v: number) => {
      (u.u_deformNoiseFreq.value as Vector2).y = v;
    });

  const f6 = gui.addFolder('Global noise field');
  const gnf = { x: (u.u_noiseFreqGlobal.value as Vector2).x, y: (u.u_noiseFreqGlobal.value as Vector2).y };
  f6.add(u.u_noiseSpeedGlobal, 'value', 0, 5e-4).name('u_noiseSpeedGlobal');
  f6
    .add(gnf, 'x', 1e-6, 2e-4)
    .name('noiseFreqGlobal.x')
    .onChange((v: number) => {
      (u.u_noiseFreqGlobal.value as Vector2).x = v;
    });
  f6
    .add(gnf, 'y', 1e-6, 2e-4)
    .name('noiseFreqGlobal.y')
    .onChange((v: number) => {
      (u.u_noiseFreqGlobal.value as Vector2).y = v;
    });

  const fColor = gui.addFolder('Color / tint');
  fColor.add(u.u_layerBlendWeight, 'value', 0, 1, 0.02).name('u_layerBlendWeight');

  const f7 = gui.addFolder('Layer speeds (sample)');
  f7.add(u.u_layerSpeed0, 'value', 0, 40, 0.1).name('layerSpeed0');
  f7.add(u.u_layerSpeed1, 'value', 0, 40, 0.1).name('layerSpeed1');
  f7.add(u.u_layerSpeed2, 'value', 0, 40, 0.1).name('layerSpeed2');

  const actions = {
    copyJsonToClipboard: () => {
      void copySnapshot(ctx);
    },
  };
  gui.add(actions, 'copyJsonToClipboard').name('Copy JSON → clipboard');

  return {
    destroy: () => {
      gui.destroy();
    },
  };
}
