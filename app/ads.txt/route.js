// ads.txt für Google AdSense - bestätigt uns als berechtigten Publisher
// Vermeidet "unauthorized inventory" Warnings und verbessert Ad-Füllrate
export async function GET() {
  const body = 'google.com, pub-8583619451045805, DIRECT, f08c47fec0942fa0\n';
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
