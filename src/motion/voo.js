// 01 O voo: o vídeo inteiro (15 s, um plano só) preso ao scroll, dos fundos da casa ao pôr do sol, por dentro
// dela, até a fachada pela frente. Depois do último quadro, a folha (02) sobe por cima com o vão em arco.
//
// A rolagem dá um alvo em segundos de vídeo (PARADAS); o filme segue esse alvo amortecido e com teto de
// velocidade (VMAX), então rolar rápido nunca atropela os marcos: o voo vira um play, e a página só sai dele
// quando o filme chega ao fim (a parede). Para trás, se a rolagem abre mais de SALTO segundos, e nos links que
// atravessam o voo, o filme corta por um fade curto direto para lá, com o texto aplicado sem animar.
// Os textos trocam por tempo, pelo segundo em que o filme está (data-de de cada marco), nunca scrubados.
import { reduzido, lenis } from './rolagem.js';
import { filme } from './filme.js';

// posição na rolagem, em telas desde o topo do voo → segundo do vídeo. A rolagem acompanha o movimento da câmera
// (medido pela diferença entre quadros do vídeo, a cada segundo): o sobrevoo da piscina, que é o trecho mais rápido,
// ganha mais rolagem por segundo; o fim, quando a câmera sobe devagar, ganha menos. Assim cada tela rolada muda a
// imagem mais ou menos o mesmo tanto, e o começo não pula. Um piso garante que nenhum trecho passe voando.
const RITMO = 0.5;  // quanto da rolagem original o voo usa: menor = o vídeo anda mais a cada giro da roda
const PARADAS = [
  [0, 0],       // parado no 1º quadro: o hero respira
  [0.35, 0],
  [1.12, 1], [2.35, 2], [3.74, 3],   // piscina e terraço até a porta-janela
  [4.71, 4], [5.65, 5],              // cozinha, jantar
  [6.37, 6], [7.35, 7], [8.5, 8],    // living
  [9.53, 9], [10.57, 10],            // hall
  [11.88, 11], [13.23, 12],          // a porta e a fachada de lado
  [14.16, 13], [14.88, 14], [15.6, 15], // de frente, subindo de ré até a casa inteira
  [16, 15],     // parado no último quadro: o CTA fica clicável
].map(([tela, segundo]) => [tela * RITMO, segundo]);
const FIM = PARADAS.at(-1)[0];
// no celular a tela cresce quando a barra do navegador some (o palco acompanha, em dvh): meia tela a mais de
// último quadro parado, para a folha nunca aparecer antes do fim do filme
const toque = matchMedia('(hover: none) and (pointer: coarse)').matches;
// depois do fim, um respiro no último quadro (0,4 tela) e a tela em que a folha chega do pé; a subida dela até o
// arco sair por cima soma em CSS (--folha-sobe, em voo.css)
export const TELAS = FIM + 1.4 + (toque ? 0.5 : 0);

const VMAX = 4;     // segundos de vídeo por segundo, no máximo (rolando rápido, o voo toca em ~3,75 s)
const SEGUE = 10;   // quão depressa o filme alcança a rolagem: colado, porque a maciez já vem do Lenis pesado
const SALTO = 3.6;  // para trás, distância (s de vídeo) a partir da qual corta pelo fade
const DUR = 15;

const HD = new URLSearchParams(location.search).has('hd');
// sem vídeo: true troca o filme por uma foto por marco (public/frames/fotos/0001…0006.webp + manifest.json),
// trocadas por corte, como no movimento reduzido
const FOTOS = true;
const celular = matchMedia('(orientation: portrait) and (max-width: 900px)');

function alvoDe(y) {
  if (y <= 0) return 0;
  for (let k = 1; k < PARADAS.length; k++) {
    const [y1, t1] = PARADAS[k];
    if (y <= y1) {
      const [y0, t0] = PARADAS[k - 1];
      return t0 + ((y - y0) / (y1 - y0)) * (t1 - t0);
    }
  }
  return PARADAS.at(-1)[1];
}

export function voo() {
  const secao = document.querySelector('[data-voo]');
  const canvas = secao.querySelector('.voo__tela');
  const marcos = [...secao.querySelectorAll('.marco')].map(el => ({ el, de: +el.dataset.de }));
  secao.style.setProperty('--telas', TELAS);

  const base = `${import.meta.env.BASE_URL}frames/${FOTOS ? 'fotos/' : ''}${!FOTOS && HD ? 'hd' : celular.matches ? 'mobile' : 'desktop'}`;
  const f = filme({ canvas, base });
  f.primeiro.then(() => requestAnimationFrame(() => secao.classList.add('is-vivo')));

  let t = 0, atual = -1, saltando = false, livre = false, inicio = true, antes = performance.now(), topo = 0, alto = innerHeight;
  // a página só aparece depois do loader (motion/carga.js): até lá, o 1º quadro parado e nenhum texto
  let liberado = false;
  addEventListener('maison:pronta', () => { liberado = true; }, { once: true });
  // a unidade da rolagem é 100svh, a mesma da altura da seção (a tela "pequena", que não muda com a barra)
  const regua = document.createElement('div');
  regua.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100svh;visibility:hidden;pointer-events:none';
  secao.append(regua);
  const mede = () => { topo = secao.getBoundingClientRect().top + scrollY; alto = regua.offsetHeight; };
  mede();
  addEventListener('resize', mede, { passive: true });
  addEventListener('load', mede);

  // com movimento reduzido, um quadro fixo por marco, trocado por corte
  const fixo = i => Math.min(14.9, marcos[i].de + 0.8);
  const indice = s => { let i = 0; while (i + 1 < marcos.length && s >= marcos[i + 1].de) i++; return i; };

  function marca(i, imediato) {
    if (i === atual) return;
    if (imediato) secao.classList.add('is-imediato');
    marcos.forEach((m, k) => {
      m.el.classList.toggle('is-in', k === i);
      m.el.classList.toggle('is-antes', k > i);
      m.el.inert = k !== i;
    });
    atual = i;
    if (imediato) { void secao.offsetHeight; secao.classList.remove('is-imediato'); }
  }

  // corte pelo fade: tudo apaga, a rolagem (ou o link, em px) pula, o filme vai direto para lá sem animar o texto
  function salta(px) {
    saltando = true;
    if (px !== undefined) livre = true;
    secao.classList.remove('is-acendendo');
    secao.classList.add('is-saltando');
    setTimeout(() => {
      if (px !== undefined) lenis ? lenis.scrollTo(px, { immediate: true, force: true }) : scrollTo({ top: px, behavior: 'instant' });
      t = alvoDe((scrollY - topo) / alto);
      marca(indice(t), true);
      f.mostra(Math.round(t * f.fps));
      secao.classList.add('is-acendendo');
      secao.classList.remove('is-saltando');
      saltando = false;
      livre = false;
      setTimeout(() => secao.classList.remove('is-acendendo'), 650);
    }, 240);
  }

  // links internos: perto, rolam; se atravessam o voo, cortam pelo fade
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const alvoEl = id && document.getElementById(id);
    if (!alvoEl) return;
    e.preventDefault();
    const px = id === 'topo' ? 0 : alvoEl.getBoundingClientRect().top + scrollY;
    const cruza = Math.abs(alvoDe((px - topo) / alto) - t) > 0.5;
    if (cruza && !reduzido()) salta(px);
    else if (lenis) lenis.scrollTo(px, { duration: 1.2 });
    else scrollTo({ top: px, behavior: 'instant' });
  });

  function quadro(agora) {
    requestAnimationFrame(quadro);
    const dt = Math.min(0.05, (agora - antes) / 1000);
    antes = agora;
    let y = (scrollY - topo) / alto;
    if (!liberado) { f.mostra(0); return; }
    if (reduzido() || FOTOS) {
      if (y < -1) return;
      secao.classList.toggle('is-coberto', y > TELAS - 0.55);
      const i = indice(alvoDe(y));
      marca(i, reduzido());
      f.mostra(FOTOS ? i : Math.round(fixo(i) * f.fps));
      return;
    }
    // a página abre onde estiver (recarregada no meio): o filme começa ali, sem tocar até lá
    if (inicio) { inicio = false; t = alvoDe(y); marca(indice(t), false); }
    // a parede: rolando rápido, a página só sai do voo depois que o filme chegou ao último quadro
    if (!livre && !saltando && y > FIM && t < DUR - 0.04 && lenis) {
      lenis.scrollTo(topo + FIM * alto, { immediate: true, force: true });
      y = FIM;
    }
    if (y < -1) return;
    // com a folha já na metade de baixo da tela, os textos do último marco saem: pelo arco passa só a casa
    secao.classList.toggle('is-coberto', y > TELAS - 0.55);
    // depois do voo o último quadro segue atrás da folha, visto pelo arco
    if (y > TELAS) { t = DUR; marca(marcos.length - 1, true); f.mostra(f.total - 1); return; }
    const alvo = alvoDe(y);

    if (!saltando) {
      const falta = alvo - t;
      // para a frente o filme toca com teto de velocidade (a parede segura a página); para trás, longe demais, corta
      if (falta < -SALTO) { salta(); return; }
      const passo = falta * (1 - Math.exp(-SEGUE * dt)), teto = VMAX * dt;
      t += Math.max(-teto, Math.min(teto, passo));
      if (Math.abs(alvo - t) < 0.002) t = alvo;
      marca(indice(t), false);
    }
    f.mostra(Math.min(f.total - 1, t * f.fps));
  }
  requestAnimationFrame(quadro);
  return f;
}
