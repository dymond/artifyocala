/** Matches `src/components/ui/Button.astro` tones for Tina React islands. */
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] no-underline cursor-pointer transition-all duration-200 ease-out";

export const btnPrimary = `${btnBase} border-2 border-ink bg-[color:var(--color-cta-fill)] text-mist shadow-[4px_4px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none`;

export const btnGhost = `${btnBase} border-2 border-transparent bg-transparent text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:border-ink/20 hover:bg-ink/[0.05] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none [.dark-surface_&]:text-mist [.dark-surface_&]:shadow-[3px_3px_0_0_var(--color-surge)] [.dark-surface_&]:hover:border-surge/55 [.dark-surface_&]:hover:bg-surge/[0.12] [.dark-surface_&]:hover:shadow-[1px_1px_0_0_var(--color-surge)]`;

export const btnOutline = `${btnBase} border-2 border-ink bg-mist text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none [.dark-surface_&]:border-surge [.dark-surface_&]:bg-transparent [.dark-surface_&]:text-mist [.dark-surface_&]:shadow-[3px_3px_0_0_var(--color-surge)] [.dark-surface_&]:hover:shadow-[1px_1px_0_0_var(--color-surge)]`;

export const btnSurge = `${btnBase} border-2 border-[color:var(--color-surge-ink)] bg-surge text-mist shadow-[4px_4px_0_0_var(--color-surge-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-surge-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none`;
