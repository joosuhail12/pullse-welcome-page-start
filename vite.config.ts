
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
        }
      }
    },
  },
}));
