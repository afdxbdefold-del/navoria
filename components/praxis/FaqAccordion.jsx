'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion({ items }) {
  const [open, setOpen] = useState(0);
  if (!items || items.length === 0) return null;
  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-50"
              aria-expanded={isOpen}
            >
              <span>{it.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
                {it.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
