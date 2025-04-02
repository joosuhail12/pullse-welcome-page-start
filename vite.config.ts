
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Multiple entry points for different build outputs
      input: {
        main: path.resolve(__dirname, 'index.html'),
        embed: path.resolve(__dirname, 'src/embed.ts'),
        'embed-script': path.resolve(__dirname, 'src/embed-script.ts'),
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'embed' 
            ? 'assets/chat-widget.[hash].js' 
            : assetInfo.name === 'embed-script'
            ? 'assets/chat-embed.[hash].js'
            : 'assets/[name].[hash].js';
        },
        // Configure chunk splitting
        manualChunks: (id) => {
          // Put React runtime in a separate chunk
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          
          // UI components in their own chunk
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          
          // Ably SDK in its own chunk
          if (id.includes('node_modules/ably/')) {
            return 'vendor-ably';
          }
          
          // Group other dependencies
          if (id.includes('node_modules/')) {
            return 'vendor-others';
          }
          
          // Split ChatWidget views into their own chunks
          if (id.includes('/components/ChatWidget/views/')) {
            return 'chat-widget-views';
          }
          
          return undefined; // Let Rollup decide for other modules
        },
        // Set a larger chunk size threshold for better splitting
        chunkSizeWarningLimit: 500, // in kBs
      }
    },
    // Enable minification for all environments
    minify: true,
    // Sourcemaps for development only
    sourcemap: mode === 'development',
    // Generate separate CSS chunks
    cssCodeSplit: true,
  },
  // Add optimization options
  optimizeDeps: {
    // Forces pre-bundling of these dependencies
    include: ['react', 'react-dom'],
    // Exclude dependencies with issues in pre-bundling
    exclude: []
  },
}));
