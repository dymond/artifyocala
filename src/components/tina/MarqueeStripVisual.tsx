type Props = { text: string; className?: string };

export default function MarqueeStripVisual({ text, className = "" }: Props) {
  return (
    <div
      className={`w-full min-w-0 overflow-x-clip border-y-[3px] border-ink bg-buzz text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${className}`}
      role="presentation"
      aria-hidden
    >
      <div className="overflow-hidden">
        <div className="artify-marquee-track">
          <div className="flex shrink-0 items-center whitespace-nowrap px-8 py-3 font-display text-[clamp(0.68rem,1.8vw,0.95rem)] font-extrabold uppercase tracking-[0.22em]">
            {text}
          </div>
          <div
            className="flex shrink-0 items-center whitespace-nowrap px-8 py-3 font-display text-[clamp(0.68rem,1.8vw,0.95rem)] font-extrabold uppercase tracking-[0.22em]"
            aria-hidden
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
