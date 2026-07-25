import React from 'react';

/**
 * Shimmer skeleton placeholders shown while initial message history loads.
 * Alternates own/other alignment to mimic real conversation rhythm.
 */
export default function SkeletonLoader() {
  const skeletons = [
    { isOwn: false, widths: ['w-48', 'w-32'] },
    { isOwn: true,  widths: ['w-40'] },
    { isOwn: false, widths: ['w-56', 'w-24'] },
    { isOwn: true,  widths: ['w-36', 'w-28'] },
    { isOwn: false, widths: ['w-44'] },
  ];

  return (
    <div className="flex flex-col gap-5 px-4 py-4 animate-pulse" aria-label="Loading messages…">
      {skeletons.map((sk, i) => (
        <div key={i} className={`flex flex-col gap-1 ${sk.isOwn ? 'items-end' : 'items-start'}`}>
          {/* Meta line */}
          <div className="h-2.5 w-20 bg-slate-700 rounded-full" />
          {/* Bubble lines */}
          {sk.widths.map((w, j) => (
            <div
              key={j}
              className={`h-9 ${w} rounded-2xl ${
                sk.isOwn ? 'bg-blue-900/50 rounded-br-none' : 'bg-slate-700/60 rounded-bl-none'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
