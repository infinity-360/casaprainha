// Tudo com .entra ganha .is-in ao chegar na tela (uma vez só).
export function entradas() {
  const io = new IntersectionObserver(lista => {
    for (const e of lista) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -15% 0px' });
  document.querySelectorAll('.entra').forEach(el => io.observe(el));
}
