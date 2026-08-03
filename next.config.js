const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  // Renamed from experimental.serverComponentsExternalPackages in Next 15
  serverExternalPackages: ['mongodb'],
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
          { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGINS || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // MCP Discovery via /.well-known
      { source: '/.well-known/mcp.json', destination: '/mcp.json' },
      { source: '/.well-known/mcp', destination: '/api/mcp' },
    ];
  },
  async redirects() {
    return [
      // /finden Content ist jetzt die Startseite — 301 Permanent
      { source: '/finden', destination: '/', permanent: true },
      // Manuelle Praxis-Redirects (Alt-URLs / Tippfehler)
      { source: '/drmed-thomas-gerhard', destination: '/praxis/hagen/drmed-thomas-gerhardt-f9cCCA', permanent: true },
    ];
  },
};

module.exports = nextConfig;
