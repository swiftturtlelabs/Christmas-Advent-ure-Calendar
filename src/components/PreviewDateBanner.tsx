import { useLocation } from 'react-router-dom';
import { formatPreviewDateLabel, parsePreviewDate } from '../lib/previewDate';

export function PreviewDateBanner() {
  const location = useLocation();
  const previewDate = parsePreviewDate(location.search);
  if (!previewDate) return null;

  return (
    <p className="preview-date-banner" role="status">
      Preview: simulating {formatPreviewDateLabel(previewDate)}
    </p>
  );
}
