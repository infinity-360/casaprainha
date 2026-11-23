// Barra de rolagem própria: fina, quadrada, aparece ao rolar ou com o mouse perto da borda, e dá para arrastar.
import { rolagem, lenis } from './rolagem.js';

const ESPERA = 900;   // ms até sumir depois de rolar
const BORDA = 24;     // px da borda direita que acendem a barra
const MINIMO = 40;    // px de altura mínima do puxador

export function barra() {
  const el = document.querySelector('[data-barra]');
  if (matchMedia('(hover: none)').matches) { el.remove(); return; }
  const puxador = el.firstElementChild;
  let timer, arrastando = false, inicioY = 0, inicioScroll = 0, ultimo = -1;

  const medidas = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    const h = Math.max(MINIMO, (innerHeight / document.documentElement.scrollHeight) * innerHeight);
    return { total, h, curso: innerHeight - h };
  };
  const mostra = () => {
    el.classList.add('is-vista');
    clearTimeout(timer);
    timer = setTimeout(() => { if (!arrastando) el.classList.remove('is-vista'); }, ESPERA);
  };

  rolagem(() => {
    const { total, h, curso } = medidas();
    puxador.style.height = `${h}px`;
    puxador.style.transform = `translateY(${(scrollY / total) * curso}px)`;
    if (ultimo >= 0 && scrollY !== ultimo) mostra();
    ultimo = scrollY;
    return false;
  });

  addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && e.clientX > innerWidth - BORDA) mostra();
    if (!arrastando) return;
    const { total, curso } = medidas();
    const y = inicioScroll + ((e.clientY - inicioY) / curso) * total;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else scrollTo({ top: y, behavior: 'instant' });
  }, { passive: true });
  puxador.addEventListener('pointerdown', e => {
    arrastando = true; inicioY = e.clientY; inicioScroll = scrollY;
    document.documentElement.classList.add('is-arrastando');
    e.preventDefault();
  });
  addEventListener('pointerup', () => {
    if (!arrastando) return;
    arrastando = false;
    document.documentElement.classList.remove('is-arrastando');
    mostra();
  });
}
