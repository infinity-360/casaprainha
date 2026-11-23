// Os quadros do voo num <canvas>: baixa o manifest de tools/frames.mjs, desenha o 1º quadro assim que chega e
// carrega o resto em ordem grossa → fina (o último, depois a cada 16, 8, 4, 2, 1). Sem o quadro exato, desenha
// o carregado mais próximo: rolar antes de terminar nunca trava.
//   const f = filme({ canvas, base: '/frames/desktop' });
//   f.mostra(i)          // desenha o quadro i (ou o mais próximo já carregado); i fracionário mistura os dois
//                        // vizinhos, para o vídeo de 24 quadros não andar em degraus na rolagem lenta
//   f.metade             // promessa: metade dos quadros carregados (o loader espera por ela)
//   f.aoCarregar = (n, total) => …   // a cada quadro que chega
export function filme({ canvas, base, simultaneos = 6 }) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const api = { total: 0, fps: 24, carregados: 0, pronto: null, primeiro: null, metade: null, aoCarregar: null, mostra, mede };
  let chegouMetade;
  api.metade = new Promise(ok => { chegouMetade = ok; });
  let imgs = [], pedido = 0, desenhado = -1;

  function maisPerto(i) {
    for (let d = 0; d < api.total; d++) {
      if (imgs[i - d]) return i - d;
      if (imgs[i + d]) return i + d;
    }
    return -1;
  }

  function cobre(img) {
    const { width: cw, height: ch } = canvas;
    const k = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * k, h = img.naturalHeight * k;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function mostra(i) {
    pedido = i;
    if (!api.total) return;
    const a = Math.floor(i), frac = i - a;
    // o quadro de baixo (ou o mais próximo carregado) e, se o de cima também chegou, ele por cima na fração
    const k = imgs[a] ? a : maisPerto(a);
    if (k < 0) return;
    const b = frac > 0.02 && k === a && imgs[a + 1] ? a + 1 : -1;
    const chave = b < 0 ? k : a + Math.round(frac * 16) / 16;
    if (chave === desenhado) return;
    cobre(imgs[k]);
    if (b >= 0) {
      ctx.globalAlpha = frac;
      cobre(imgs[b]);
      ctx.globalAlpha = 1;
    }
    desenhado = chave;
  }

  function mede() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w === canvas.width && h === canvas.height) return;
    canvas.width = w;
    canvas.height = h;
    desenhado = -1;
    mostra(pedido);
  }
  mede();
  // mede pelo próprio canvas: no Safari a altura pode assentar depois do primeiro desenho, sem evento de resize
  new ResizeObserver(mede).observe(canvas);

  const carrega = (url, i) => new Promise(ok => {
    const img = new Image();
    img.src = url;
    img.decode().then(() => { imgs[i] = img; api.carregados++; }, () => {}).finally(() => {
      api.aoCarregar?.(api.carregados, api.total);
      // metade dos quadros (as passadas grossas): o voo já anda liso o bastante para a página aparecer
      if (api.carregados >= Math.ceil(api.total / 2)) chegouMetade();
      ok();
    });
  });

  api.primeiro = fetch(`${base}/manifest.json`).then(r => r.json()).then(async m => {
    api.total = m.count;
    api.fps = m.fps;
    imgs = new Array(m.count);
    const url = i => `${base}/${String(i + 1).padStart(4, '0')}.${m.ext}`;
    await carrega(url(0), 0);
    mostra(pedido);

    const ordem = [], visto = new Set([0]);
    if (m.count > 1) { ordem.push(m.count - 1); visto.add(m.count - 1); }
    for (let passo = 16; passo >= 1; passo /= 2)
      for (let i = 0; i < m.count; i += passo) if (!visto.has(i)) { visto.add(i); ordem.push(i); }

    api.pronto = Promise.all(Array.from({ length: simultaneos }, async () => {
      for (let i; (i = ordem.shift()) !== undefined; ) {
        await carrega(url(i), i);
        // chegou um quadro mais perto do que está na tela: redesenha
        if (Math.abs(i - pedido) < Math.abs(desenhado - pedido)) { desenhado = -1; mostra(pedido); }
      }
    }));
  });

  return api;
}
