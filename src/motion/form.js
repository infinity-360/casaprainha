// Reserva: confere os campos e abre o WhatsApp da casa com a mensagem pronta. Nada passa por servidor.
const WHATSAPP = '5547984935513';

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const br = iso => iso.split('-').reverse().join('/');

export function form() {
  const el = document.querySelector('[data-form]');
  const aviso = document.querySelector('[data-aviso]');
  const ok = document.querySelector('[data-ok]');
  const { nome, chegada, saida, pessoas, pet } = el.elements;
  const campos = [nome, chegada, saida, pessoas, pet];

  chegada.min = saida.min = hoje();
  chegada.addEventListener('change', () => { saida.min = chegada.value || hoje(); });
  campos.forEach(c => c.addEventListener('input', () => c.closest('.campo').classList.remove('is-erro')));

  const marca = lista => campos.forEach(c => c.closest('.campo').classList.toggle('is-erro', lista.includes(c)));

  el.addEventListener('submit', e => {
    e.preventDefault();
    const faltam = campos.filter(c => !String(c.value).trim());
    if (faltam.length) { marca(faltam); aviso.textContent = 'Preencha os cinco campos para pedir a reserva.'; faltam[0].focus(); return; }
    if (chegada.value < hoje()) { marca([chegada]); aviso.textContent = 'A chegada precisa ser de hoje em diante.'; chegada.focus(); return; }
    if (saida.value <= chegada.value) { marca([saida]); aviso.textContent = 'A saída precisa ser depois da chegada.'; saida.focus(); return; }
    if (!(+pessoas.value >= 1) || !Number.isInteger(+pessoas.value)) { marca([pessoas]); aviso.textContent = 'Confira o número de pessoas.'; pessoas.focus(); return; }

    marca([]);
    aviso.textContent = '';
    const primeiro = nome.value.trim().split(/\s+/)[0];
    const msg = `Olá! Sou ${nome.value.trim()} e gostaria de saber a disponibilidade e o valor da Casa Prainha de ${br(chegada.value)} a ${br(saida.value)}, para ${pessoas.value} pessoa(s), ${pet.value.toLowerCase()}.`;
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    document.querySelector('[data-ok-texto]').textContent = `Obrigado, ${primeiro}. Sua mensagem de ${br(chegada.value)} a ${br(saida.value)} está pronta: é só enviar no WhatsApp.`;
    document.querySelector('[data-ok-link]').href = url;
    el.hidden = true;
    ok.hidden = false;
    ok.focus({ preventScroll: true });
    window.open(url, '_blank', 'noopener');
  });
}
