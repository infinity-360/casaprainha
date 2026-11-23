import { defineConfig } from 'vite';

export default defineConfig({
  base: '/casaprainha/',   // o endereço do GitHub Pages; num domínio próprio, volta a ser '/'
  optimizeDeps: { entries: ['index.html'] },
  server: { watch: { ignored: ['**/arquivos/**', '**/fonte/**', '**/public/frames/**'] } },
});
