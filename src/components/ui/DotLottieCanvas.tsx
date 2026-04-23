import { useEffect, useRef } from "react";
import type { DotLottie } from "@lottiefiles/dotlottie-web";

type DotLottieCanvasProps = {
  src: string;
  className?: string;
  /** When true, plays from frame 0 once on hover. */
  playOnHover?: boolean;
  /** When true, starts playing immediately after load. */
  autoplay?: boolean;
  /** When true, loops playback (default false). */
  loop?: boolean;
};

function setCanvasSize(canvas: HTMLCanvasElement): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

export default function DotLottieCanvas({
  src,
  className,
  playOnHover = true,
  autoplay = false,
  loop = false,
}: DotLottieCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<DotLottie | null>(null);

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | undefined;

    const setup = async (): Promise<void> => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const mod = await import("@lottiefiles/dotlottie-web");
      if (disposed) return;

      setCanvasSize(canvas);

      const player = new mod.DotLottie({
        canvas,
        src,
        autoplay,
        loop,
      });

      playerRef.current = player;
      player.setLoop(loop);

      // Ensure there is always something visible (some animations start blank).
      player.setFrame(0);
      if (autoplay) player.play();

      ro = new ResizeObserver(() => {
        setCanvasSize(canvas);
        (player as any).resize?.();
      });
      ro.observe(canvas);
    };

    void setup();

    return () => {
      disposed = true;
      ro?.disconnect();
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [autoplay, loop, src]);

  const playOnce = (): void => {
    const player = playerRef.current;
    if (!player) return;
    player.stop();
    player.setFrame(0);
    player.play();
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onPointerEnter={playOnHover ? playOnce : undefined}
      onMouseEnter={playOnHover ? playOnce : undefined}
      aria-hidden
    />
  );
}

