/* Trace · aba Porquinhos: metas alimentadas pela sobra do mês atual.
 *
 * As contas (quanto falta, em quantos meses chega) vêm do Model Porquinho.
 * O servidor também garante que a soma dos aportes nunca passa da sobra.
 */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  let temporizadorAviso = null;
  let avisoTemporario = false;

  function previsao(p) {
    if (p.falta <= 0) return 'Meta batida. Parabéns!';
    if (p.aporte > 0) {
      const meses = Math.ceil(p.falta / p.aporte);
      return 'Mantendo ' + T.brl(p.aporte) + ' por mês, chega lá em ' + meses + (meses === 1 ? ' mês.' : ' meses.');
    }
    return 'Destine uma parte da sobra para ver em quantos meses a meta chega.';
  }

  // Recalcula na tela enquanto a pessoa arrasta (o servidor confirma ao soltar).
  function contas(p) {
    const total = T.round2(p.guardado + p.aporte);
    const falta = Math.max(0, T.round2(p.meta - total));
    const porcentagem = p.meta > 0 ? Math.min(100, Math.round((total / p.meta) * 100)) : 0;
    return Object.assign({}, p, { total, falta, porcentagem });
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
    const M = T.state.mesPorquinhos;
    const dist = totalDistribuido();
    const livre = T.round2(M.sobra - dist);
    $('#pq-sub').textContent = 'Reparta a sobra de ' + M.nome + ' entre as suas metas e veja quando cada uma chega lá.';
    $('#pq-sobra').textContent = T.brl(M.sobra);
    $('#pq-sobra-sub').textContent = M.quantidade
      ? 'Limite de ' + T.brl(M.limite) + ' menos ' + T.brl(M.total) + ' gastos em ' + M.nome + '.'
      : 'Ainda não há lançamentos em ' + M.nome + '. Use a aba Fatura para calcular a sobra.';
    $('#pq-dist').textContent = T.brl(dist);
    $('#pq-livre').textContent = livre >= 0 ? 'Livre: ' + T.brl(livre) : 'Faltam: ' + T.brl(-livre);

    const base = Math.max(M.sobra, dist, 0.01);
    const com = T.state.porquinhos.filter((p) => p.aporte > 0);
    $('#pq-seg').innerHTML = com.map((p) => '<div style="width:' + (p.aporte / base) * 100 + '%;background:' + p.cor + '"></div>').join('');
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

  function atualizarCard(card, p) {
    const c = contas(p);
    card.querySelector('.pq-guardado').textContent = T.brl(c.total);
    card.querySelector('.pq-pct').textContent = c.porcentagem + '% da meta · faltam ' + T.brl(c.falta);
    card.querySelector('.preenche').style.width = c.porcentagem + '%';
    card.querySelector('.pq-aporte').textContent = T.brl(p.aporte);
    card.querySelector('.pq-previsao').textContent = previsao(c);
  }

  // ---------- cards ----------
  function desenharLista() {
    const M = T.state.mesPorquinhos;
    const lista = $('#pq-lista');
    if (!T.state.porquinhos.length) {
      lista.innerHTML =
        '<div class="card vazio-grande">' + (T.capiVazia ? T.capiVazia('porquinho') : '') + '<h2>Você ainda não tem porquinhos</h2><p>Crie o primeiro abaixo, ou use <strong>Carregar exemplo</strong> na aba Fatura para ver três prontos.</p></div>';
      return;
    }
    lista.innerHTML = T.state.porquinhos
      .map((p) => {
        const c = contas(p);
        return (
          '<div class="card porquinho" data-id="' + p.id + '">' +
          '<div class="pq-topo"><h2>' + T.esc(p.nome) + '</h2>' +
          '<span class="etiqueta"><i class="dot" style="background:' + p.cor + '"></i>' + T.esc(p.tipo) + '</span></div>' +
          '<div class="pq-meio">' +
          '<div class="pq-valores"><span class="valor medio pq-guardado">' + T.brl(c.total) + '</span>' +
          '<span class="nota">de ' + T.brl(p.meta) + '</span></div>' +
          '<div class="trilho"><div class="preenche" style="width:' + c.porcentagem + '%;background:' + p.cor + '"></div></div>' +
          '<span class="nota pq-pct">' + c.porcentagem + '% da meta · faltam ' + T.brl(c.falta) + '</span></div>' +
          '<div class="pq-controle">' +
          '<label for="pq-r-' + p.id + '"><span>Da sobra deste mês</span><strong class="pq-aporte" style="color:' + p.cor + '">' + T.brl(p.aporte) + '</strong></label>' +
          '<input class="pq-range" id="pq-r-' + p.id + '" type="range" min="0" max="' + Math.max(M.sobra, p.aporte) +
          '" step="0.01" value="' + p.aporte + '" ' + (M.sobra <= 0 && p.aporte <= 0 ? 'disabled' : '') + '></div>' +
          '<p class="pq-previsao">' + T.esc(previsao(c)) + '</p>' +
          '<button type="button" class="botao pequeno perigo" data-remover="' + p.id + '">Remover</button>' +
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

    // Arrastar: atualiza só a tela, respeitando o teto da sobra.
    lista.addEventListener('input', (e) => {
      const campo = e.target.closest('input.pq-range');
      if (!campo) return;
      const card = campo.closest('.porquinho');
      const p = T.state.porquinhos.find((x) => x.id === Number(card.dataset.id));
      if (!p) return;
      const outros = T.round2(totalDistribuido() - p.aporte);
      const teto = Math.max(0, T.round2(T.state.mesPorquinhos.sobra - outros));
      let v = T.round2(parseFloat(campo.value) || 0);
      if (v > teto) {
        v = teto;
        campo.value = String(teto);
        mostrarAviso('Só restam ' + T.brl(teto) + ' de sobra para este porquinho.');
      }
      p.aporte = v;
      atualizarCard(card, p);
      desenharResumo();
    });

    // Soltar: grava no servidor (Update).
    lista.addEventListener('change', async (e) => {
      const campo = e.target.closest('input.pq-range');
      if (!campo) return;
      const id = Number(campo.closest('.porquinho').dataset.id);
      const p = T.state.porquinhos.find((x) => x.id === id);
      const r = await T.executar(() => T.api('PUT', '/api/porquinhos/' + id, { aporte: p.aporte }));
      if (r && r.aviso) mostrarAviso(r.aviso);
    });

    lista.addEventListener('click', (e) => {
      const botao = e.target.closest('[data-remover]');
      if (!botao) return;
      T.executar(() => T.api('DELETE', '/api/porquinhos/' + botao.dataset.remover)).then((r) => r && T.avisar('Porquinho removido.'));
    });

    $('#pq-abrir').addEventListener('click', () => {
      const form = $('#pq-form');
      form.hidden = !form.hidden;
      $('#pq-abrir').setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) $('#pq-nome').focus();
    });
    $('#pq-cancelar').addEventListener('click', fecharForm);

    // Criar (Create)
    $('#pq-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = $('#pq-nome').value.trim();
      const meta = T.num($('#pq-meta').value);
      const guardado = $('#pq-base').value.trim() === '' ? 0 : T.num($('#pq-base').value);
      const erro = $('#pq-erro');
      if (!nome || !(meta > 0) || !(guardado >= 0)) {
        erro.textContent = 'Informe um nome e um valor de meta maior que zero (o já guardado não pode ser negativo).';
        erro.hidden = false;
        return;
      }
      try {
        await T.api('POST', '/api/porquinhos', { nome, tipo: $('#pq-tipo').value, meta, guardado });
      } catch (falha) {
        erro.textContent = falha.message;
        erro.hidden = false;
        return;
      }
      fecharForm();
      await T.recarregar();
      T.avisar('Porquinho criado.');
    });
  }

  T.aoIniciar(iniciar);
  T.aoMudar(() => {
    desenharLista();
    desenharResumo();
  });
})();
