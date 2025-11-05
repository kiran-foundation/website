import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind'; // Add this import
import {visualizer} from 'rollup-plugin-visualizer'; // npm run build -> To view
export default defineConfig({
  integrations: [tailwind()], // Add Tailwind integration here
  vite: {
    build: {
      rollupOptions: {
        external: ['member'],
        plugins: [
          visualizer({
            filename: './dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ],
      }
    }
  }
});