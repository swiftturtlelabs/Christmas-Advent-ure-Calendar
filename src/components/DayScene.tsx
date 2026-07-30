import type { ReactNode } from 'react';

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#f5a623"
        d="M24 2.5 29.4 16.1l14.6 1.3-11.1 9.5 3.4 14.3L24 33.6 11.7 41.2l3.4-14.3L4 17.4l14.6-1.3L24 2.5Z"
      />
    </svg>
  );
}

function Tree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 220" aria-hidden="true">
      <defs>
        <linearGradient id="treeShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="48%" stopColor="#6dc0a5" />
          <stop offset="48%" stopColor="#4fa88d" />
        </linearGradient>
      </defs>
      <rect x="72" y="190" width="16" height="26" rx="3" fill="#5a3a28" />
      <path
        fill="url(#treeShade)"
        d="M14 190c10-36 34-58 66-58s56 22 66 58c-8-6-20-10-32-10H46c-12 0-24 4-32 10Z"
      />
      <path
        fill="url(#treeShade)"
        d="M28 150c9-30 28-48 52-48s43 18 52 48c-7-5-18-8-28-8H56c-10 0-21 3-28 8Z"
      />
      <path
        fill="url(#treeShade)"
        d="M42 114c8-24 22-38 38-38s30 14 38 38c-6-4-14-7-22-7H64c-8 0-16 3-22 7Z"
      />
      <path
        fill="url(#treeShade)"
        d="M56 80c6-18 14-28 24-28s18 10 24 28c-5-3-11-5-16-5H72c-5 0-11 2-16 5Z"
      />
      <path
        fill="none"
        stroke="#e74c3c"
        strokeWidth="3.5"
        strokeLinecap="round"
        d="M36 170c30-12 58-8 88 10M42 134c26-11 50-7 76 10M54 100c18-8 36-5 54 8"
      />
    </svg>
  );
}

function Gift({
  className,
  body,
  ribbon,
}: {
  className?: string;
  body: string;
  ribbon: string;
}) {
  return (
    <svg className={className} viewBox="0 0 56 56" aria-hidden="true">
      <rect x="8" y="22" width="40" height="30" rx="3" fill={body} />
      <rect x="24" y="22" width="8" height="30" fill={ribbon} />
      <rect x="8" y="32" width="40" height="7" fill={ribbon} />
      <path
        fill={ribbon}
        d="M28 22c-6-10-14-12-18-8 4 1 8 5 10 10h8Zm0 0c6-10 14-12 18-8-4 1-8 5-10 10h-8Z"
      />
      <path
        fill={ribbon}
        d="M22 22 16 30h8l2-8Zm12 0 6 8h-8l-2-8Z"
      />
    </svg>
  );
}

const GIFTS = [
  { body: '#6dc0a5', ribbon: '#e74c3c', className: 'day-scene__gift--1' },
  { body: '#f39c12', ribbon: '#e74c3c', className: 'day-scene__gift--2' },
  { body: '#e74c3c', ribbon: '#f39c12', className: 'day-scene__gift--3' },
  { body: '#6dc0a5', ribbon: '#e74c3c', className: 'day-scene__gift--4' },
  { body: '#f39c12', ribbon: '#e74c3c', className: 'day-scene__gift--5' },
  { body: '#e74c3c', ribbon: '#f5a623', className: 'day-scene__gift--6' },
  { body: '#6dc0a5', ribbon: '#f39c12', className: 'day-scene__gift--7' },
] as const;

interface DaySceneProps {
  children: ReactNode;
}

export function DayScene({ children }: DaySceneProps) {
  return (
    <div className="day-scene">
      <div className="day-scene__art" aria-hidden="true">
        <div className="day-scene__sky" />
        <div className="day-scene__hill" />
        <div className="day-scene__tree-wrap">
          <Star className="day-scene__star" />
          <Tree className="day-scene__tree" />
        </div>
        {GIFTS.map((gift) => (
          <Gift
            key={gift.className}
            className={`day-scene__gift ${gift.className}`}
            body={gift.body}
            ribbon={gift.ribbon}
          />
        ))}
      </div>
      <div className="day-overlay">{children}</div>
    </div>
  );
}
