import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'




export default defineConfig({
  plugins: [react(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://waverbackend-production.up.railway.app/',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer', // 👈 Important for simple-peer
    },
  },

});
