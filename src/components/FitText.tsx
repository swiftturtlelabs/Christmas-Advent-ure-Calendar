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
      const styles = getComputedStyle(container);
      const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const maxWidth = container.clientWidth - padX;
      const maxHeight = container.clientHeight - padY;
      if (maxWidth <= 0 || maxHeight <= 0) return;

      const widthLimit = maxWidth - 2;
      const heightLimit = maxHeight - 6; // room for descenders (p, g, y)
      if (widthLimit <= 0 || heightLimit <= 0) return;

      el.style.width = `${maxWidth}px`;
      el.style.maxWidth = `${maxWidth}px`;

      const upper = Math.min(maxFontSize, Math.floor(maxHeight * 1.1));
      let best = minFontSize;

      for (let size = upper; size >= minFontSize; size--) {
        el.style.fontSize = `${size}px`;
        if (el.scrollHeight <= heightLimit && el.scrollWidth <= widthLimit + 1) {
          best = size;
          break;
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
