import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  allowedDevOrigins: ['ticketing.dev'],
};

export default nextConfig;
