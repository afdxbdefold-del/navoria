import HomeClient from './HomeClient.jsx';

export const metadata = {
  title: 'Ärzte finden in Deutschland – ohne Umwege',
  description: 'Ärzte, Zahnärzte und Fachärzte in Deutschland finden. Adresse, Telefon, Öffnungszeiten und Bewertungen kompakt auf einer Seite.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Navoria – Ihr nächster Arzt. Ohne Umwege.',
    description: 'Ärzte und Praxen in Deutschland finden. Adresse, Telefon, Öffnungszeiten und Bewertungen kompakt auf einer Seite.',
    type: 'website',
    locale: 'de_DE',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Navoria – Ärzte in Deutschland finden' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Navoria – Ihr nächster Arzt. Ohne Umwege.',
    description: 'Ärzte und Praxen in Deutschland finden.',
    images: ['/opengraph-image'],
  },
};

export default function Page() {
  return <HomeClient />;
}
