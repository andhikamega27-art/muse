/** @type {import('next').NextConfig} */
const nextConfig = {
  // Untuk @react-pdf/renderer
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  // Images dari Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/**',
      },
    ],
  },
}

module.exports = nextConfig
