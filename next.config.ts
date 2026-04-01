import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gen.pollinations.ai' },
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: '*.catbox.moe' },
    ],
  },
  // GitHub Pages deployment with subdirectory
  basePath: '/sparkie-kids-academy',
  trailingSlash: true,
  // Disable x-ray for faster initial load
  experimental: {
    optimizeCss: false,
  },
}

export default nextConfig
