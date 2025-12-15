import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tipz - Decentralized Tipping Platform',
        short_name: 'Tipz',
        description: 'Send and receive tips on the Stacks blockchain',
        theme_color: '#F97316',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.pinata\.cloud\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pinata-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.ipfs\..*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ipfs-content-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/stacks-node-api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'stacks-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false, // Disable PWA in development
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    // Enable sourcemaps only in development
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize CSS code splitting
    cssCodeSplit: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Enhanced manual chunking strategy
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Stacks blockchain libraries
          if (id.includes('node_modules/@stacks')) {
            return 'stacks-vendor';
          }
          
          // UI/Icon libraries
          if (id.includes('node_modules/react-icons')) {
            return 'icons-vendor';
          }
          
          // IPFS and related services
          if (id.includes('ipfs') || id.includes('pinata')) {
            return 'ipfs-vendor';
          }
          
          // Page components (lazy loaded)
          if (id.includes('src/pages')) {
            const pageName = id.split('src/pages/')[1]?.split('.')[0];
            return pageName ? `page-${pageName.toLowerCase()}` : 'pages';
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    // Pre-bundle common dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@stacks/connect',
      '@stacks/transactions',
      '@stacks/network',
      'react-icons/fi',
      'react-icons/fa',
    ],
  },
  // Enable performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
