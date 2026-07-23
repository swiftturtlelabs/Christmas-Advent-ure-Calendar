import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCalendar, getDays } from '../lib/calendarService';
import { buildCalendarUrl, buildDayUrl } from '../lib/tokens';
import type { Calendar, DayContent } from '../lib/types';

interface QrItem {
  label: string;
  url: string;
  dataUrl: string;
}

export function QrExportPage() {
  const { slug } = useParams<{ slug: string }>();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [items, setItems] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
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
  }, [slug]);

  const download = (item: QrItem) => {
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = `${item.label.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const printSheet = () => {
    window.print();
  };

  if (loading || !calendar) {
    return <div className="page loading">Generating QR codes…</div>;
  }

  return (
    <div className="page qr-export">
      <div className="editor-header">
        <Link to={`/app/c/${slug}/edit`}>← Back to editor</Link>
        <h1>QR codes — {calendar.title}</h1>
        <button type="button" className="btn primary print-hide" onClick={printSheet}>
          Print sheet
        </button>
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
