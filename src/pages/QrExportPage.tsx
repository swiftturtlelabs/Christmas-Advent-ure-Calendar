import JSZip from 'jszip';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getCalendar, getDays } from '../lib/calendarService';
import { isStockCalendarSlug } from '../lib/stockCalendars';
import { buildCalendarUrl, buildDayUrl } from '../lib/tokens';
import type { Calendar, DayContent } from '../lib/types';

interface QrExportPageProps {
  sampleMode?: boolean;
}

interface QrItem {
  label: string;
  url: string;
  dataUrl: string;
}

function pngFileName(label: string) {
  return `${label.replace(/\s+/g, '-').toLowerCase()}.png`;
}

function dataUrlToBlob(dataUrl: string) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'image/png' });
}

export function QrExportPage({ sampleMode = false }: QrExportPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [items, setItems] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (sampleMode && !isStockCalendarSlug(slug)) return;
    (async () => {
      const [cal, days] = await Promise.all([getCalendar(slug), getDays(slug)]);
      setCalendar(cal);
      const origin = window.location.origin;
      const targets: { label: string; url: string }[] = [
        { label: 'Main calendar', url: buildCalendarUrl(slug, origin) },
        ...days.map((d: DayContent) => ({
          label: `Day ${d.dayNumber}`,
          url: buildDayUrl(d.token, origin),
        })),
      ];
      const generated = await Promise.all(
        targets.map(async (t) => ({
          ...t,
          dataUrl: await QRCode.toDataURL(t.url, { margin: 1, width: 256 }),
        })),
      );
      setItems(generated);
      setLoading(false);
    })();
  }, [slug, sampleMode]);

  const download = (item: QrItem) => {
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = pngFileName(item.label);
    a.click();
  };

  const downloadAllZip = async () => {
    if (!slug || items.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const item of items) {
        zip.file(pngFileName(item.label), dataUrlToBlob(item.dataUrl));
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-qr-codes.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  };

  const printSheet = () => {
    window.print();
  };

  if (sampleMode && slug && !isStockCalendarSlug(slug)) {
    return <Navigate to="/samples" replace />;
  }

  if (loading) {
    return <div className="page loading">Generating QR codes…</div>;
  }

  if (!calendar) {
    return <Navigate to={sampleMode ? '/samples' : '/app'} replace />;
  }

  const backTo = sampleMode ? '/samples' : `/app/c/${slug}/edit`;
  const backLabel = sampleMode ? '← Sample calendars' : '← Back to editor';

  return (
    <div className={`page qr-export${sampleMode ? ' qr-export-sample' : ''}`}>
      <div className="editor-header">
        <Link to={backTo}>{backLabel}</Link>
        <h1>QR codes — {calendar.title}</h1>
        <div className="editor-header-actions print-hide">
          <button
            type="button"
            className="btn secondary"
            onClick={downloadAllZip}
            disabled={zipping}
          >
            {zipping ? 'Creating ZIP…' : 'Download all (ZIP)'}
          </button>
          <button type="button" className="btn primary" onClick={printSheet}>
            Print sheet
          </button>
        </div>
      </div>
      <p className="muted print-hide">
        These URLs stay the same even when you edit adventure content. Re-print only if you delete and recreate the calendar.
      </p>
      <div className="qr-grid">
        {items.map((item) => (
          <div key={item.label} className="card qr-card">
            <img src={item.dataUrl} alt={`QR code for ${item.label}`} />
            <h3>{item.label}</h3>
            <p className="qr-url">{item.url}</p>
            <button type="button" className="btn secondary print-hide" onClick={() => download(item)}>
              Download PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
