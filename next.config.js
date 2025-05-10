/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static exports
  basePath: '',
  assetPrefix: '/',
  images: {
    unoptimized: true, // Required for static export
  },
  // Remove any iframe-blocking headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.wapcast.com https://wapcast.com;"
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://wapcast.com'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 