// Admin-Bereich: NIEMALS von Google/Bots indexieren.
// Setzt noindex,nofollow für alle Seiten unter /admin/*.
// Zusätzlich via robots.txt Disallow und Middleware X-Robots-Tag (Redundanz erwünscht).

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }) {
  return children;
}
