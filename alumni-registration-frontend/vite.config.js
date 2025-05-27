import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add React refresh support
      fastRefresh: true,
    })
  ],
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true, // Open browser automatically
    cors: true,

    hmr: {
    protocol: 'ws', // บางทีอาจต้องเปลี่ยนเป็น 'wss' ถ้าใช้ HTTPS
    host: 'localhost', 
    port: 5173
  },


    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:5500',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          forms: ['react-hook-form'],
          ui: ['lucide-react', 'react-hot-toast'],
          utils: ['axios', 'date-fns']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },

  // Environment variables prefix
  envPrefix: 'VITE_',

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },

  // Preview server configuration (for production build testing)
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      'axios',
      'lucide-react',
      'date-fns',
      'react-hot-toast',
      'react-dropzone'
    ]
  },

  // Enable experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  }
})