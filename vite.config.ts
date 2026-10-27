import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the build works from any folder (QR link, static hosting, preview)
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
