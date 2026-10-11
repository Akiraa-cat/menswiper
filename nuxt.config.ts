import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/../src/index.css'],
  vite: {
    plugins: [tailwindcss(), react()],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en', class: 'dark' },
      title: 'Minesweeper RnG',
      meta: [
        {
          name: 'description',
          content:
            'Tactile dark-themed Minesweeper with deterministic PRNG seed engine, offline local records, and daily challenges.',
        },
        { property: 'og:title', content: 'Minesweeper RnG' },
        {
          property: 'og:description',
          content:
            'Tactile dark-themed Minesweeper with deterministic PRNG seed engine, offline local records, and daily challenges.',
        },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
        },
      ],
    },
  },
});