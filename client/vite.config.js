import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002
  }
});

// Force Vite server restart to reload env variables (e.g. VITE_BACKEND_URL)
