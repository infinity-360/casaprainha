// O tour 360° só carrega no clique: não pesa a página e o visor não prende a rolagem de quem está só passando.
// Para trocar o tour, mude o data-src de .tour__quadro e o link "Abrir em nova aba" no index.html.
export function tour() {
  const quadro = document.querySelector('[data-tour]');
  if (!quadro) return;
  const abre = quadro.querySelector('[data-tour-abre]');
  const fecha = document.querySelector('[data-tour-fecha]');
  let visor = null;

  abre.addEventListener('click', () => {
    visor = document.createElement('iframe');
    visor.src = quadro.dataset.src;
    visor.title = 'Tour virtual 360° de exemplo';
    visor.allow = 'fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking';
    visor.allowFullscreen = true;
    visor.referrerPolicy = 'strict-origin-when-cross-origin';
    quadro.append(visor);
    quadro.classList.add('is-aberto');
    fecha.hidden = false;
    visor.focus({ preventScroll: true });
  });

  fecha.addEventListener('click', () => {
    visor?.remove();
    visor = null;
    quadro.classList.remove('is-aberto');
    fecha.hidden = true;
    abre.focus({ preventScroll: true });
  });
}
