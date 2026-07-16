'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Start' },
  { href: '/magazin', label: 'Magazin' },
  { href: '/ratgeber', label: 'Ratgeber' },
  { href: '/symptome', label: 'Symptome' },
  { href: '/aerzte/fachrichtung', label: 'Fachrichtungen' },
  { href: '/aerzte/bundesland', label: 'Nach Bundesland' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white transition hover:bg-white/10 lg:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 top-[72px] z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Mobile Navigation"
            className="fixed inset-x-0 top-[72px] z-50 shadow-lg lg:hidden"
            style={{ background: 'var(--color-navy)' }}
          >
            <ul className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-3.5 text-base font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                  >
                    {l.label}
                    <span aria-hidden="true" className="text-white/50">›</span>
                  </a>
                </li>
              ))}
              <li className="mt-3 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.14)' }}>
                <a
                  href="/finden"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-semibold"
                  style={{ background: '#ffffff', color: 'var(--color-primary)' }}
                >
                  Praxis finden
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
