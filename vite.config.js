import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: { entries: ['index.html'] },
  server: { watch: { ignored: ['**/arquivos/**', '**/fonte/**', '**/public/frames/**'] } },
});
