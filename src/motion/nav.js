// A nav fica clara (fundo da página, texto escuro) quando o topo da folha passa da metade dela.
import { rolagem } from './rolagem.js';

export function nav() {
  const el = document.querySelector('[data-nav]');
  const folha = document.querySelector('[data-clara]');
  rolagem(() => {
    el.classList.toggle('is-clara', folha.getBoundingClientRect().top <= el.offsetHeight / 2);
    return false;
  });
}
