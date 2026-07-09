// Legacy-Redirect: Diese URL war die allererste Homepage-Modus-Test-Seite (hartkodiert).
// Seit dem Sub-Path-Routing (/[praxisSlug]) wird sie nicht mehr gebraucht.
// Wir leiten permanent auf den Verzeichnis-Eintrag weiter, damit alle externen Links
// (z.B. in Google Business, Print, ausgeteilte Karten) weiter funktionieren.

import { permanentRedirect } from 'next/navigation';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LegacyRedirect() {
  permanentRedirect('/praxis/hagen/drmed-thomas-gerhardt-f9cCCA');
}
