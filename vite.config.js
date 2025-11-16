import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/EMS/',   // KEEP THIS for GitHub Pages or ingress paths
});
