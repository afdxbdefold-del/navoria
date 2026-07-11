// ads.txt Redirect für Ezoic Ads.txt Manager
// Leitet den Request 301-weise auf den Ezoic-Manager um, der die
// tagesaktuelle Publisher-Liste ausliefert. Manager-ID: 19390.
// Aequivalent zum PHP-Snippet:
//   header("Location: https://srv.adstxtmanager.com/19390/" . $_SERVER['HTTP_HOST']);
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const hdrHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'navoria.de';
  // Domain-Sanitisierung: nur Host, keine Ports/Pfade.
  const cleanHost = hdrHost.split(':')[0].trim().toLowerCase();
  const target = `https://srv.adstxtmanager.com/19390/${cleanHost}`;
  return new Response(null, {
    status: 301,
    headers: {
      Location: target,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
