import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If your repository is named exactly "drixian.github.io", leave base as '/'
// If your repository is a subfolder like "github.com/yourname/drixian", change base to '/drixian/'
export default defineConfig({
  plugins: [react()],
  base: '/', 
});
