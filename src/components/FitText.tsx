import { useLayoutEffect, useRef, useState } from 'react';

type FitTextProps = {
  text: string;
  className?: string;
  containerClassName?: string;
  minFontSize?: number;
  maxFontSize?: number;
};

/** Shrinks or grows font size so text fills its container without overflowing. */
export function FitText({
  text,
  className,
  containerClassName,
  minFontSize = 14,
  maxFontSize = 120,
}: FitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(minFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    const fit = () => {
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;
      if (maxWidth <= 0 || maxHeight <= 0) return;

      el.style.width = `${maxWidth}px`;

      let low = minFontSize;
      let high = maxFontSize;
      let best = minFontSize;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        el.style.fontSize = `${mid}px`;
        const fits = el.scrollWidth <= maxWidth && el.scrollHeight <= maxHeight;
        if (fits) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      setFontSize(best);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text, minFontSize, maxFontSize]);

  return (
    <div ref={containerRef} className={containerClassName}>
      <p ref={textRef} className={className} style={{ fontSize: `${fontSize}px` }}>
        {text}
      </p>
    </div>
  );
}
