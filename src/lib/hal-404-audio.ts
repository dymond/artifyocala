/**
 * Pre-recorded 404 narration (HTML5 Audio). More reliable than Web Speech API.
 * Assets: `public/audio/hal-404/tier-{tier}-v{variant}.mp3` — regenerate with
 * `npm run generate:hal404-audio` after editing `hal-404-speech-tiers.json`.
 * Audio uses Microsoft Edge neural TTS via `edge-tts`. Override with `HAL404_EDGE_*` in
 * `scripts/generate-hal-404-audio.py`.
 *
 * Playback is routed through Web Audio (`AnalyserNode`) so the orb can read live levels.
 */
export function hal404TierAudioUrl(tierIndex: number, variantIndex: number): string {
  return `/audio/hal-404/tier-${tierIndex}-v${variantIndex}.mp3`;
}

let active: HTMLAudioElement | null = null;

let audioCtx: AudioContext | null = null;
let mediaSource: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let freqScratch = new Uint8Array(0);
let timeScratch = new Float32Array(0);

function disposeHal404AudioGraph(): void {
  try {
    mediaSource?.disconnect();
  } catch {
    /* ignore */
  }
  mediaSource = null;
  try {
    analyser?.disconnect();
  } catch {
    /* ignore */
  }
  analyser = null;
}

function attachHal404AudioAnalysis(el: HTMLAudioElement): void {
  disposeHal404AudioGraph();
  try {
    if (typeof AudioContext === "undefined") return;
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    void audioCtx.resume();
    mediaSource = audioCtx.createMediaElementSource(el);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.55;
    mediaSource.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch {
    disposeHal404AudioGraph();
  }
}

/**
 * Normalized 0–1 “speech energy” from the current clip (RMS + low-mid bands).
 * Returns 0 when nothing is playing or analysis is unavailable.
 */
export function getHal404SpeechAudioDrive(): number {
  if (typeof window === "undefined" || !analyser || !active) return 0;
  if (active.paused || active.ended) return 0;

  const n = analyser.fftSize;
  if (timeScratch.length !== n) {
    timeScratch = new Float32Array(n);
  }
  analyser.getFloatTimeDomainData(timeScratch);
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const x = timeScratch[i]!;
    sumSq += x * x;
  }
  const rms = Math.sqrt(sumSq / n);
  const rmsNorm = Math.min(1, rms * 6.5);

  const binCount = analyser.frequencyBinCount;
  if (freqScratch.length !== binCount) {
    freqScratch = new Uint8Array(binCount);
  }
  analyser.getByteFrequencyData(freqScratch);
  let band = 0;
  const hi = Math.min(binCount, 48);
  for (let i = 2; i < hi; i++) {
    band += freqScratch[i]!;
  }
  const bandNorm = (band / Math.max(1, hi - 2)) / 255;

  return Math.min(1, rmsNorm * 0.62 + bandNorm * 0.38);
}

/** Release Web Audio resources (e.g. when unmounting the 404 scene). */
export function disposeHal404AudioContext(): void {
  disposeHal404AudioGraph();
  if (audioCtx && audioCtx.state !== "closed") {
    void audioCtx.close();
  }
  audioCtx = null;
}

export function stopHal404AudioPlayback(): void {
  if (!active) return;
  disposeHal404AudioGraph();
  active.pause();
  active.currentTime = 0;
  active.removeAttribute("src");
  active.load();
  active = null;
}

export function getHal404ActiveAudio(): HTMLAudioElement | null {
  return active;
}

export function isHal404AudioPlaying(): boolean {
  return active !== null && !active.paused && !active.ended;
}

export function playHal404TierAudio(
  tierIndex: number,
  variantIndex: number,
  opts: {
    volume: number;
    onEnded: () => void;
    onError: () => void;
  }
): void {
  stopHal404AudioPlayback();
  const url = hal404TierAudioUrl(tierIndex, variantIndex);

  const a = new Audio(url);
  a.preload = "auto";
  a.volume = Math.max(0, Math.min(1, opts.volume));

  const cleanupEnded = (): void => {
    a.removeEventListener("ended", onEndedHandler);
    a.removeEventListener("error", onErrHandler);
  };

  const onEndedHandler = (): void => {
    if (active === a) active = null;
    cleanupEnded();
    disposeHal404AudioGraph();
    opts.onEnded();
  };

  const onErrHandler = (): void => {
    if (active === a) active = null;
    cleanupEnded();
    disposeHal404AudioGraph();
    opts.onError();
  };

  a.addEventListener("ended", onEndedHandler);
  a.addEventListener("error", onErrHandler);

  active = a;
  attachHal404AudioAnalysis(a);

  void a
    .play()
    .then(() => {
      void audioCtx?.resume();
    })
    .catch(() => {
      if (active === a) active = null;
      cleanupEnded();
      disposeHal404AudioGraph();
      opts.onError();
    });
}
