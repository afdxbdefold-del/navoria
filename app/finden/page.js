import { permanentRedirect } from 'next/navigation';

// Der /finden-Content ist jetzt die Startseite. Diese Route existiert nur noch
// als Fallback — der eigentliche 301-Redirect erfolgt via next.config.js redirects().
export const metadata = {
  robots: { index: false, follow: false },
};

export default function FindenPage() {
  permanentRedirect('/');
}
