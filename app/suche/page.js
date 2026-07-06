import SearchClient from './SearchClient.jsx';

export const metadata = {
  title: 'Ärzte suchen',
  description: 'Durchsuchen Sie Navoria nach Ärzten, Fachrichtungen und Städten in Deutschland.',
  alternates: { canonical: '/suche' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <SearchClient />;
}
