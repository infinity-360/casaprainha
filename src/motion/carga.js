// Loader: o wordmark num fundo escuro e uma linha fina que enche com os quadros do voo. A página só aparece com a
// fonte pronta e metade dos quadros carregados (o voo já anda liso); a rolagem fica travada até lá. Teto de 12 s,
// para uma conexão ruim nunca prender a pessoa no loader.
import { lenis } from './rolagem.js';

const MINIMO = 700;   // ms: com tudo em cache, o loader não pisca
const TETO = 12000;

export function carga(f) {
  const el = document.querySelector('[data-carga]');
  const html = document.documentElement;
  if (!el) { dispatchEvent(new Event('maison:pronta')); return; }
  const linha = el.querySelector('.carga__linha b');
  const t0 = performance.now();
  html.classList.add('is-carregando');
  lenis?.stop();

  f.aoCarregar = (n, total) => {
    linha.style.transform = `scaleX(${Math.min(1, n / Math.ceil(total / 2)).toFixed(3)})`;
  };

  const pronto = Promise.all([f.metade, document.fonts?.ready]);
  const teto = new Promise(ok => setTimeout(ok, TETO));
  Promise.race([pronto, teto]).then(() => {
    linha.style.transform = 'scaleX(1)';
    setTimeout(() => {
      f.mede();
      html.classList.remove('is-carregando');
      html.classList.add('is-pronta');
      lenis?.start();
      dispatchEvent(new Event('maison:pronta'));
      setTimeout(() => el.remove(), 1200);
    }, Math.max(350, MINIMO - (performance.now() - t0)));
  });
}
