import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const productionCsp = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://www.google-analytics.com https://www.facebook.com https://images.unsplash.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.facebook.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'lumix-production-csp',
      apply: 'build',
      transformIndexHtml(html) {
        if (command !== 'build') {
          return html;
        }

        if (html.includes('http-equiv="Content-Security-Policy"')) {
          return html;
        }

        return html.replace(
          '</head>',
          `    <meta http-equiv="Content-Security-Policy" content="${productionCsp}" />\n  </head>`,
        );
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
}));
