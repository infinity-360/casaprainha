// O tour 360° só carrega no clique e abre em tela cheia dentro do site. Onde o navegador não tem tela cheia
// (iPhone), o visor cobre a página inteira. O sandbox sem allow-popups impede o tour de abrir outra aba.
// Para trocar o tour, mude o data-src de .tour__quadro no index.html.
import { lenis } from './rolagem.js';

export function tour() {
  const quadro = document.querySelector('[data-tour]');
  if (!quadro) return;
  const abre = quadro.querySelector('[data-tour-abre]');
  const tela = document.querySelector('[data-tour-tela]');
  const botaoFecha = tela.querySelector('[data-tour-fecha]');
  let visor = null, cheia = false;

  function fecha() {
    if (!visor) return;
    visor.remove();
    visor = null;
    cheia = false;
    tela.hidden = true;
    lenis?.start();
    if (document.fullscreenElement === tela) document.exitFullscreen().catch(() => {});
    abre.focus({ preventScroll: true });
  }

  abre.addEventListener('click', () => {
    visor = document.createElement('iframe');
    visor.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock');
    visor.src = quadro.dataset.src;
    visor.title = 'Tour virtual 360°';
    visor.allow = 'fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking';
    visor.referrerPolicy = 'no-referrer';
    tela.append(visor);
    tela.hidden = false;
    lenis?.stop();
    tela.requestFullscreen?.().then(() => { cheia = true; }).catch(() => {});
    botaoFecha.focus({ preventScroll: true });
  });

  botaoFecha.addEventListener('click', fecha);
  addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
  // o Esc da tela cheia do navegador não chega como tecla: fecha o visor junto
  document.addEventListener('fullscreenchange', () => { if (cheia && !document.fullscreenElement) fecha(); });
}
