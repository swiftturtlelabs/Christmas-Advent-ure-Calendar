interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="info-tooltip">
      <button type="button" className="info-tooltip-icon" aria-label={text} title={text}>
        i
      </button>
      <span className="info-tooltip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}
