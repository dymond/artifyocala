import { useEffect, useState } from "react";

type Props = {
  words: readonly string[];
  className?: string;
};

export default function WordRotator({ words, className = "" }: Props) {
  const list = words.filter(Boolean);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (list.length === 0) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setI((n) => (n + 1) % list.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [list.length]);

  if (list.length === 0) return null;

  return (
    <span
      className={className}
      data-artify-word-rotator="1"
      data-artify-words={JSON.stringify(list)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {list[i]}
    </span>
  );
}
