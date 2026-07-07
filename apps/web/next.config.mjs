import path from 'path';
import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

// Monorepo root — Next traces file dependencies from here when producing the
// standalone build so workspace packages (e.g. @sisenco/shared-types) are bundled.
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sisenco/shared-types'],
  // Emit a self-contained server (.next/standalone) for a minimal production image.
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  async rewrites() {
    // Proxy API calls so browser requests stay same-origin and the auth cookie
    // is always sent. Frontend calls /api/v1/*, which is forwarded to the API.
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
