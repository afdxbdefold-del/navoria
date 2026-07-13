'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Start' },
  { href: '/magazin', label: 'Magazin' },
  { href: '/ratgeber', label: 'Ratgeber' },
  { href: '/symptome', label: 'Symptome' },
  { href: '/aerzte/fachrichtung', label: 'Fachrichtungen' },
  { href: '/finden', label: 'Praxis finden' },
  { href: '/aerzte/bundesland', label: 'Nach Bundesland' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Body scroll lock while menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay Menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="fixed inset-0 top-16 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Slide-in Panel */}
          <nav
            aria-label="Mobile Navigation"
            className="fixed inset-x-0 top-16 z-50 border-b border-slate-200 bg-white shadow-lg md:hidden"
          >
            <ul className="mx-auto max-w-7xl divide-y divide-slate-100 px-4 py-2 sm:px-6">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3 text-base font-medium text-slate-800 hover:text-sky-700"
                  >
                    {l.label}
                    <span aria-hidden="true" className="text-slate-400">›</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
