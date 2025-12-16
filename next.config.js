/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Transpile Excalidraw packages for proper module resolution
  transpilePackages: ['@excalidraw/excalidraw'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle Node.js polyfills for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        constants: false,
        events: false,
        punycode: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        vm: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        domain: false,
        module: false,
        net: false,
        readline: false,
        repl: false,
        tls: false,
        v8: false,
        worker_threads: false,
      }
    }
    
    // Fix for mermaid/cytoscape ESM issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ignore mermaid-to-excalidraw to avoid cytoscape issues
      '@excalidraw/mermaid-to-excalidraw': false,
    }

    return config
  },
  async headers() {
    // CSP headers for Excalidraw whiteboard support
    const excalidrawSources = 'https://excalidraw.com https://*.excalidraw.com https://unpkg.com https://esm.sh'
    const fontSources = 'https://fonts.gstatic.com https://fonts.googleapis.com'
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              process.env.NODE_ENV === 'development'
                ? `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live ${excalidrawSources}; style-src 'self' 'unsafe-inline' ${fontSources} ${excalidrawSources}; font-src 'self' ${fontSources} ${excalidrawSources} data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co ${fontSources} ${excalidrawSources}; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:;`
                : `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live ${excalidrawSources}; style-src 'self' 'unsafe-inline' ${fontSources} ${excalidrawSources}; font-src 'self' ${fontSources} ${excalidrawSources} data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co ${fontSources} ${excalidrawSources}; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:;`,
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
