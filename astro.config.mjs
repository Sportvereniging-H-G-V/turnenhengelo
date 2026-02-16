import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://turnenhengelo.nl',
  integrations: [
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      // lastmod wordt automatisch bepaald door Astro op basis van de pagina's
    }),
  ],
  output: 'static',
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
    },
  },
});

