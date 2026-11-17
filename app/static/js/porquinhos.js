/* Trace · aba Porquinhos: metas alimentadas pela sobra da fatura. */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  const CORES = ['#5B9DFF', '#3DDC97', '#E8A06B', '#B392F0', '#FF8FB1', '#7DD3FC'];
  let temporizadorAviso = null;
  let avisoTemporario = false;   // mensagem curta ("só restam R$ ...") que some sozinha

  // ---------- contas de cada porquinho ----------
  function contas(p) {
    const guardado = T.round2(p.base + p.aporte);
    const falta = Math.max(0, T.round2(p.meta - guardado));
    const pct = p.meta > 0 ? Math.min(100, Math.round((guardado / p.meta) * 100)) : 0;
    let previsao;
    if (falta <= 0) {
      previsao = 'Meta batida. Parabéns!';
    } else if (p.aporte > 0) {
      const meses = Math.ceil(falta / p.aporte);
      previsao = 'Mantendo ' + T.brl(p.aporte) + ' por mês, chega lá em ' + meses + (meses === 1 ? ' mês.' : ' meses.');
    } else {
      previsao = 'Destine uma parte da sobra para ver em quantos meses a meta chega.';
    }
    return { guardado, falta, pct, previsao };
  }

  function totalDistribuido() {
    return T.round2(T.state.porquinhos.reduce((soma, p) => soma + p.aporte, 0));
  }

  function mostrarAviso(texto) {
    const el = $('#pq-aviso');
    el.textContent = texto;
    el.hidden = !texto;
    avisoTemporario = !!texto;
    clearTimeout(temporizadorAviso);
    if (texto) {
      temporizadorAviso = setTimeout(() => {
        avisoTemporario = false;
        desenharResumo();
      }, 3500);
    }
  }

  // ---------- resumo da sobra ----------
  function desenharResumo() {
    const R = T.resumo();
    const dist = totalDistribuido();
    const livre = T.round2(R.sobra - dist);
    $('#pq-sobra').textContent = T.brl(R.sobra);
    $('#pq-sobra-sub').textContent = R.quantidade
      ? 'Limite de ' + T.brl(R.limite) + ' menos ' + T.brl(R.gasto) + ' gastos na fatura.'
      : 'Carregue uma fatura na aba Fatura para calcular a sobra do mês.';
    $('#pq-dist').textContent = T.brl(dist);
    $('#pq-livre').textContent = livre >= 0 ? 'Livre: ' + T.brl(livre) : 'Faltam: ' + T.brl(-livre);

    // barra segmentada + legenda
    const base = Math.max(R.sobra, dist, 0.01);
    const com = T.state.porquinhos.filter((p) => p.aporte > 0);
    $('#pq-seg').innerHTML = com
      .map((p) => '<div style="width:' + (p.aporte / base) * 100 + '%;background:' + p.cor + '"></div>')
      .join('');
    $('#pq-seg').setAttribute(
      'aria-label',
      com.length ? 'Divisão da sobra: ' + com.map((p) => p.nome + ' ' + T.brl(p.aporte)).join(', ') : 'Nada distribuído ainda'
    );
    $('#pq-legenda').innerHTML = com
      .map((p) => '<span><i class="dot" style="background:' + p.cor + '"></i>' + T.esc(p.nome) + ' ' + T.brl(p.aporte) + '</span>')
      .join('');

    const aviso = $('#pq-aviso');
    if (livre < 0) {
      aviso.textContent = 'A soma dos porquinhos passou da sobra em ' + T.brl(-livre) + '. Reduza algum deles.';
      aviso.hidden = false;
    } else if (!avisoTemporario) {
      aviso.hidden = true;
    }
  }

  // Atualiza só os textos de um card (sem recriar o controle que a pessoa está arrastando).
  function atualizarCard(card, p) {
    const c = contas(p);
    card.querySelector('.pq-guardado').textContent = T.brl(c.guardado);
    card.querySelector('.pq-pct').textContent = c.pct + '% da meta · faltam ' + T.brl(c.falta);
    card.querySelector('.preenche').style.width = c.pct + '%';
    card.querySelector('.pq-aporte').textContent = T.brl(p.aporte);
    card.querySelector('.pq-previsao').innerHTML = T.esc(c.previsao);
  }

  // ---------- cards ----------
  function desenharLista() {
    const R = T.resumo();
    const lista = $('#pq-lista');
    if (!T.state.porquinhos.length) {
      lista.innerHTML =
        '<div class="card vazio-grande"><h2>Você ainda não tem porquinhos</h2><p>Crie o primeiro abaixo, ou use <strong>Carregar exemplo</strong> na aba Fatura para ver três prontos.</p></div>';
      return;
    }
    lista.innerHTML = T.state.porquinhos
      .map((p) => {
        const c = contas(p);
        return (
          '<div class="card porquinho" data-id="' + T.esc(p.id) + '">' +
          '<div class="pq-topo"><h2>' + T.esc(p.nome) + '</h2>' +
          '<span class="etiqueta"><i class="dot" style="background:' + p.cor + '"></i>' + T.esc(p.tipo) + '</span></div>' +
          '<div class="pq-meio">' +
          '<div class="pq-valores"><span class="valor medio pq-guardado">' + T.brl(c.guardado) + '</span>' +
          '<span class="nota">de ' + T.brl(p.meta) + '</span></div>' +
          '<div class="trilho"><div class="preenche" style="width:' + c.pct + '%;background:' + p.cor + '"></div></div>' +
          '<span class="nota pq-pct">' + c.pct + '% da meta · faltam ' + T.brl(c.falta) + '</span></div>' +
          '<div class="pq-controle">' +
          '<label for="pq-r-' + T.esc(p.id) + '"><span>Da sobra deste mês</span><strong class="pq-aporte" style="color:' + p.cor + '">' + T.brl(p.aporte) + '</strong></label>' +
          '<input class="pq-range" id="pq-r-' + T.esc(p.id) + '" type="range" min="0" max="' + Math.max(R.sobra, p.aporte) +
          '" step="0.01" value="' + p.aporte + '" ' + (R.sobra <= 0 && p.aporte <= 0 ? 'disabled' : '') + '></div>' +
          '<p class="pq-previsao">' + T.esc(c.previsao) + '</p>' +
          '<button type="button" class="botao pequeno perigo" data-remover="' + T.esc(p.id) + '">Remover</button>' +
          '</div>'
        );
      })
      .join('');
  }

  // ---------- formulário de novo porquinho ----------
  function fecharForm() {
    $('#pq-form').hidden = true;
    $('#pq-abrir').setAttribute('aria-expanded', 'false');
    $('#pq-erro').hidden = true;
    $('#pq-form').reset();
  }

  function iniciar() {
    const lista = $('#pq-lista');

    // Arrastar o controle: respeita o teto da sobra e não recria o card.
    lista.addEventListener('input', (e) => {
      const campo = e.target.closest('input.pq-range');
      if (!campo) return;
      const card = campo.closest('.porquinho');
      const p = T.state.porquinhos.find((x) => x.id === card.dataset.id);
      if (!p) return;
      const R = T.resumo();
      const outros = T.round2(totalDistribuido() - p.aporte);
      const teto = Math.max(0, T.round2(R.sobra - outros));
      let v = T.round2(parseFloat(campo.value) || 0);
      if (v > teto) {
        v = teto;
        campo.value = String(teto);
        mostrarAviso('Só restam ' + T.brl(teto) + ' de sobra para este porquinho.');
      }
      p.aporte = v;
      T.salvar();
      atualizarCard(card, p);
      desenharResumo();
    });

    lista.addEventListener('click', (e) => {
      const botao = e.target.closest('[data-remover]');
      if (!botao) return;
      T.alterar((s) => (s.porquinhos = s.porquinhos.filter((p) => p.id !== botao.dataset.remover)));
    });

    $('#pq-abrir').addEventListener('click', () => {
      const form = $('#pq-form');
      form.hidden = !form.hidden;
      $('#pq-abrir').setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) $('#pq-nome').focus();
    });
    $('#pq-cancelar').addEventListener('click', fecharForm);

    $('#pq-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#pq-nome').value.trim();
      const meta = T.num($('#pq-meta').value);
      const base = $('#pq-base').value.trim() === '' ? 0 : T.num($('#pq-base').value);
      const erro = $('#pq-erro');
      if (!nome || !(meta > 0) || !(base >= 0)) {
        erro.textContent = 'Informe um nome e um valor de meta maior que zero (o já guardado não pode ser negativo).';
        erro.hidden = false;
        return;
      }
      T.alterar((s) => {
        s.porquinhos.push({
          id: 'p' + Date.now().toString(36),
          nome,
          tipo: $('#pq-tipo').value,
          meta: T.round2(meta),
          base: T.round2(base),
          aporte: 0,
          cor: CORES[s.porquinhos.length % CORES.length]
        });
      });
      fecharForm();
    });
  }

  T.aoIniciar(iniciar);
  T.aoMudar(() => {
    desenharLista();
    desenharResumo();
  });
})();
