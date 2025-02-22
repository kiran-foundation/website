import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind'; // Add this import

export default defineConfig({
  integrations: [tailwind()], // Add Tailwind integration here
  vite: {
    build: {
      rollupOptions: {
        external: ['member']
      }
    }
  }
});