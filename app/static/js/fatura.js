/* Trace · aba Fatura: limite, tabela de lançamentos (CRUD), parcelas do mês.
 *
 * Cada ação chama a API do Bottle. Quem valida, categoriza e calcula as
 * parcelas são os Models Python; aqui só desenhamos o resultado.
 */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  const OPCOES_PARCELAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24];

  // ---------- rascunho da linha "novo lançamento" ----------
  let rascunho = null;
  let mesDoRascunho = null;

  function dataPadrao() {
    const s = T.state;
    return s.mes === s.mesAtual ? s.hoje : s.mes + '-01';
  }
  function garantirRascunho() {
    if (!rascunho || mesDoRascunho !== T.state.mes) {
      rascunho = { iso: dataPadrao(), desc: '', valor: '', parcelas: 1 };
      mesDoRascunho = T.state.mes;
    }
  }

  function aviso(texto) {
    $('#fatura-status').textContent = texto;
  }

  // ---------- ações (todas passam pelo servidor) ----------
  async function adicionar() {
    const desc = rascunho.desc.replace(/\s+/g, ' ').trim();
    const valor = T.num(rascunho.valor);
    if (!rascunho.iso || !desc || !(valor > 0)) {
      aviso('Preencha a data, o estabelecimento e um valor maior que zero.');
      return;
    }
    const r = await T.executar(() =>
      T.api('POST', '/api/lancamentos', { data: rascunho.iso, descricao: desc, valor, total_parcelas: rascunho.parcelas })
    );
    if (!r) return;
    const l = r.lancamento;
    const mesDoLancamento = l.data.slice(0, 7);
    rascunho = { iso: rascunho.iso, desc: '', valor: '', parcelas: 1 };
    if (mesDoLancamento !== T.state.mes) {
      await T.irParaMes(mesDoLancamento);
    } else {
      desenharTabela();   // limpa a linha de digitação
    }
    const n = l.total_parcelas;
    aviso(n > 1 ? 'Compra em ' + n + 'x adicionada. As próximas parcelas entram sozinhas nos meses seguintes.' : 'Lançamento adicionado.');
    const campo = $('#novo-desc');
    if (campo) campo.focus();
  }

  async function importar(texto) {
    const r = await T.executar(() => T.api('POST', '/api/importar', { texto, mes: T.state.mes }));
    if (!r) return;
    if (!r.criados) {
      aviso('Não encontrei lançamentos. Use uma linha por compra, como: 05/11 UBER *TRIP 23,90');
      return;
    }
    const extra = r.ignoradas ? ' · ' + r.ignoradas + (r.ignoradas === 1 ? ' linha ignorada' : ' linhas ignoradas') : '';
    aviso(r.criados + (r.criados === 1 ? ' lançamento importado' : ' lançamentos importados') + extra + '.');
  }

  let temporizadorLimite = null;

  function iniciar() {
    const limite = $('#limite');
    limite.addEventListener('input', () => {
      clearTimeout(temporizadorLimite);
      const v = T.num(limite.value);
      if (!(v > 0)) return;
      temporizadorLimite = setTimeout(() => T.executar(() => T.api('PUT', '/api/preferencias', { limite: v })), 400);
    });
    limite.addEventListener('blur', () => (limite.value = T.dec(T.state.limite)));

    $('#btn-exemplo').addEventListener('click', async () => {
      const r = await T.executar(() => T.api('POST', '/api/exemplo'));
      if (!r) return;
      if (T.state.mes !== T.state.mesAtual) await T.irParaMes(T.state.mesAtual);
      aviso(r.criados + ' lançamentos de exemplo carregados em ' + T.state.nomeMes + '.');
    });

    $('#btn-limpar').addEventListener('click', (e) =>
      T.confirmarDuasVezes(e.currentTarget, 'Clique de novo para limpar', async () => {
        const r = await T.executar(() => T.api('DELETE', '/api/meses/' + T.state.mes));
        if (r) aviso(r.removidos + ' lançamento(s) removido(s) de ' + T.state.nomeMes + '.');
      })
    );

    $('#btn-analisar').addEventListener('click', () => importar($('#fatura-texto').value));
    $('#arquivo').addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => importar(String(leitor.result));
      leitor.readAsText(arquivo);
      e.target.value = '';
    });

    const tabela = $('#lanc-tabela');

    // Linha de novo lançamento
    tabela.addEventListener('input', (e) => {
      const el = e.target;
      if (el.id === 'novo-data') rascunho.iso = el.value;
      else if (el.id === 'novo-desc') rascunho.desc = el.value;
      else if (el.id === 'novo-valor') rascunho.valor = el.value;
    });
    tabela.addEventListener('change', (e) => {
      if (e.target.id === 'novo-parcelas') rascunho.parcelas = Number(e.target.value);
    });
    tabela.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.closest('.linha.nova')) {
        e.preventDefault();
        adicionar();
      }
    });
    tabela.addEventListener('click', (e) => {
      if (e.target.closest('#novo-add')) return adicionar();
      const x = e.target.closest('[data-remover]');
      if (x) {
        const id = Number(x.dataset.remover);
        T.executar(() => T.api('DELETE', '/api/lancamentos/' + id)).then((r) => r && aviso('Lançamento removido.'));
      }
    });

    // Edição de uma linha existente (Update)
    tabela.addEventListener('change', async (e) => {
      const el = e.target.closest('input[data-campo]');
      if (!el) return;
      const id = Number(el.dataset.id);
      const campo = el.dataset.campo;
      let corpo;
      if (campo === 'data') corpo = el.value ? { data: el.value } : null;
      else if (campo === 'desc') corpo = el.value.trim() ? { descricao: el.value.trim() } : null;
      else if (campo === 'valor') corpo = T.num(el.value) > 0 ? { valor: T.num(el.value) } : null;
      if (!corpo) {
        aviso('Valor inválido: a linha voltou ao que estava.');
        T.redesenhar();
        return;
      }
      const r = await T.executar(() => T.api('PUT', '/api/lancamentos/' + id, corpo));
      if (r && corpo.data && corpo.data.slice(0, 7) !== T.state.mes) {
        aviso('A data mudou de mês: o lançamento foi para ' + corpo.data.slice(8, 10) + '/' + corpo.data.slice(5, 7) + '.');
      } else if (r) {
        aviso('Lançamento atualizado.');
      }
    });

    // Correção manual de categoria (o servidor aprende a regra)
    tabela.addEventListener('change', async (e) => {
      const seletor = e.target.closest('select[data-id]');
      if (!seletor) return;
      const r = await T.executar(() => T.api('PUT', '/api/lancamentos/' + seletor.dataset.id, { categoria: seletor.value }));
      if (r) {
        aviso(r.parecidos ? 'Categoria aplicada também a ' + r.parecidos + ' lançamento(s) parecido(s).' : 'Categoria atualizada.');
      }
    });

    $('#btn-apagar').addEventListener('click', (e) =>
      T.confirmarDuasVezes(e.currentTarget, 'Clique de novo para apagar tudo', async () => {
        const r = await T.executar(() => T.api('DELETE', '/api/tudo'));
        if (r) {
          $('#fatura-texto').value = '';
          T.avisar('Todos os dados foram apagados.');
        }
      })
    );
  }

  // ---------- desenho ----------
  let mesDesenhado = null;

  function desenharResumo() {
    const R = T.resumo();
    const s = T.state;
    if (mesDesenhado && mesDesenhado !== s.mes) aviso('');   // mensagem era do outro mês
    mesDesenhado = s.mes;
    const limite = $('#limite');
    if (document.activeElement !== limite) limite.value = T.dec(s.limite);

    $('#f-gasto').textContent = T.brl(R.gasto);
    const nParc = s.servidor.quantidade_parceladas;
    $('#f-gasto-sub').textContent = R.quantidade
      ? R.quantidade + (R.quantidade === 1 ? ' lançamento' : ' lançamentos') +
        (nParc ? ', ' + nParc + (nParc === 1 ? ' parcelado.' : ' parcelados.') : '.')
      : 'Nenhum lançamento neste mês.';

    $('#f-parc').textContent = T.brl(R.parcelas);
    $('#f-parc-sub').textContent = R.parcelas
      ? T.pct(R.limite > 0 ? (R.parcelas / R.limite) * 100 : 0) + ' do limite já estava tomado.'
      : 'Nenhuma parcela cai neste mês.';

    const resta = $('#f-resta');
    if (R.estouro > 0) {
      $('#f-resta-rotulo').textContent = 'Passou do limite';
      resta.textContent = T.brl(R.estouro);
      resta.className = 'valor estouro';
      $('#f-resta-sub').textContent = 'Sem sobra neste mês.';
    } else {
      $('#f-resta-rotulo').textContent = 'Ainda resta';
      resta.textContent = T.brl(R.sobra);
      resta.className = 'valor ok';
      $('#f-resta-sub').textContent = s.mes === s.mesAtual ? 'Essa sobra alimenta seus porquinhos.' : 'Quanto ainda cabe em ' + s.nomeMes.split(' ')[0] + '.';
    }

    const selo = $('#m-selo');
    selo.textContent = T.rotuloFaixa[R.faixa];
    selo.className = 'selo ' + R.faixa;
    const barra = $('#m-barra');
    barra.className = 'preenche ' + R.faixa;
    barra.style.width = Math.min(100, R.pct) + '%';
    $('#m-fim').textContent = '100% · ' + T.brl(R.limite);

    let frase;
    if (!R.quantidade) frase = 'Adicione os lançamentos de ' + s.nomeMes + ' para começar.';
    else if (R.estouro > 0) frase = 'Você passou ' + T.brl(R.estouro) + ' do limite.';
    else if (s.servidor.quantidade_automaticas === R.quantidade) frase = s.nomeMes.charAt(0).toUpperCase() + s.nomeMes.slice(1) + ' começa com ' + T.pct(R.pct) + ' do limite comprometido.';
    else frase = 'Você usou ' + T.pct(R.pct) + ' do limite. Restam ' + T.brl(R.sobra) + '.';
    $('#m-frase').textContent = frase;

    $('#lanc-titulo').textContent = 'Lançamentos de ' + s.nomeMes.split(' de ')[0];
  }

  // Guarda qual campo estava em foco para devolver o foco depois de redesenhar.
  function lembrarFoco() {
    const el = document.activeElement;
    if (!el || !$('#lanc-tabela').contains(el)) return null;
    if (el.id) return '#' + el.id;
    if (el.dataset.campo) return '[data-campo="' + el.dataset.campo + '"][data-id="' + el.dataset.id + '"]';
    if (el.tagName === 'SELECT' && el.dataset.id) return 'select[data-id="' + el.dataset.id + '"]';
    return null;
  }

  function chipParcela(l) {
    if (l.total <= 1) return '<span class="nota">à vista</span>';
    return '<span class="chip-parcela">' + l.parcela + '/' + l.total + '</span>';
  }

  function desenharTabela() {
    garantirRascunho();
    const foco = lembrarFoco();
    const L = T.state.lancamentos;
    const opcoes = (atual) =>
      T.categorias
        .map((c) => '<option value="' + T.esc(c.nome) + '"' + (c.nome === atual ? ' selected' : '') + '>' + T.esc(c.nome) + '</option>')
        .join('');
    const parcelas = OPCOES_PARCELAS.map(
      (n) => '<option value="' + n + '"' + (n === rascunho.parcelas ? ' selected' : '') + '>' + n + 'x' + (n === 1 ? ' (à vista)' : '') + '</option>'
    ).join('');

    const nova =
      '<div class="linha nova" role="row">' +
      '<span role="cell"><input type="date" id="novo-data" aria-label="Data do novo lançamento" value="' + T.esc(rascunho.iso) + '"></span>' +
      '<span role="cell"><input type="text" id="novo-desc" aria-label="Estabelecimento" placeholder="Estabelecimento, ex.: Zara, iFood" autocomplete="off" value="' + T.esc(rascunho.desc) + '"></span>' +
      '<span role="cell"><select id="novo-parcelas" aria-label="Número de parcelas">' + parcelas + '</select></span>' +
      '<span role="cell" class="cat nota">categoria automática</span>' +
      '<span role="cell"><input type="text" id="novo-valor" class="direita" inputmode="decimal" aria-label="Valor (da parcela)" placeholder="0,00" autocomplete="off" value="' + T.esc(rascunho.valor) + '"></span>' +
      '<span role="cell"><button type="button" class="botao primario pequeno" id="novo-add">Adicionar</button></span>' +
      '</div>';

    const linhas = L.map((l) => {
      if (l.automatica) {
        return (
          '<div class="linha automatica" role="row">' +
          '<span role="cell" class="fixo">' + T.esc(l.data + '/' + l.ano) + '</span>' +
          '<span role="cell" class="fixo desc-auto"><span class="truncar">' + T.esc(l.desc) + '</span>' +
          '<small><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>' +
          'entrou sozinha · ' + T.esc(l.origem) + '</small></span>' +
          '<span role="cell">' + chipParcela(l) + '</span>' +
          '<span role="cell" class="cat fixo"><i class="dot" style="background:' + T.corDa(l.categoria) + '"></i>' + T.esc(l.categoria) + '</span>' +
          '<span role="cell" class="valor-celula fixo">' + T.dec(l.valor) + '</span>' +
          '<span role="cell" class="nota centro">automática</span>' +
          '</div>'
        );
      }
      return (
        '<div class="linha' + (l.categoria === 'Outros' ? ' revisar' : '') + '" role="row">' +
        '<span role="cell"><input type="date" data-campo="data" data-id="' + l.id + '" aria-label="Data" value="' + T.esc(l.iso) + '"></span>' +
        '<span role="cell"><input type="text" data-campo="desc" data-id="' + l.id + '" aria-label="Estabelecimento" value="' + T.esc(l.desc) + '"></span>' +
        '<span role="cell">' + chipParcela(l) + '</span>' +
        '<span role="cell" class="cat"><i class="dot" style="background:' + T.corDa(l.categoria) + '"></i>' +
        '<select data-id="' + l.id + '" aria-label="Categoria de ' + T.esc(l.desc) + '">' + opcoes(l.categoria) + '</select></span>' +
        '<span role="cell"><input type="text" class="direita" data-campo="valor" data-id="' + l.id + '" inputmode="decimal" aria-label="Valor" value="' + T.dec(l.valor) + '"></span>' +
        '<span role="cell"><button type="button" class="botao pequeno perigo" data-remover="' + l.id + '" aria-label="Remover ' + T.esc(l.desc) + '">Remover</button></span>' +
        '</div>'
      );
    }).join('');

    $('#lanc-tabela').innerHTML =
      '<div class="tabela-rolagem"><div class="tabela edita" role="table" aria-label="Lançamentos do mês">' +
      '<div class="linha cabecalho" role="row"><span role="columnheader">Data</span><span role="columnheader">Estabelecimento</span>' +
      '<span role="columnheader">Parcela</span><span role="columnheader">Categoria</span>' +
      '<span role="columnheader" class="direita">Valor</span><span role="columnheader"></span></div>' +
      nova + linhas +
      (L.length ? '' : '<p class="vazio com-padding-x">Nenhum lançamento em ' + T.esc(T.state.nomeMes) + '. Preencha a linha acima ou use <strong>Carregar exemplo</strong>.</p>') +
      '</div></div>';

    if (foco) {
      const el = $(foco);
      if (el) el.focus();
    }
  }

  // ---------- parcelamentos e próximos meses ----------
  function desenharParcelas() {
    const s = T.state;
    const lista = s.parcelamentos;
    const totalFalta = T.round2(lista.reduce((soma, p) => soma + p.falta, 0));
    $('#parc-falta').innerHTML = lista.length ? 'Ainda a pagar: <strong class="atencao">' + T.brl(totalFalta) + '</strong>' : '';
    $('#parc-lista').innerHTML = lista.length
      ? lista
          .map((p) => {
            const cor = T.corDa(p.categoria);
            const marcas = Array.from({ length: p.total_parcelas }, (_, i) =>
              '<span style="background:' + (i < p.pagas ? cor : 'var(--superficie-2)') + '"></span>'
            ).join('');
            return (
              '<div class="parc-item">' +
              '<div class="parc-topo"><span><i class="dot" style="background:' + cor + '"></i>' + T.esc(p.descricao) + '</span>' +
              '<strong>' + p.pagas + ' de ' + p.total_parcelas + '</strong></div>' +
              '<div class="parc-marcas" role="img" aria-label="' + p.pagas + ' de ' + p.total_parcelas + ' parcelas">' + marcas + '</div>' +
              '<div class="parc-rodape nota"><span>' + T.brl(p.valor) + ' por mês · total ' + T.brl(p.valor_total) + '</span>' +
              '<span>' + (p.falta > 0 ? 'faltam <strong>' + T.brl(p.falta) + '</strong> · última em ' + T.esc(p.ultima) : '<strong class="ok">última parcela</strong>') + '</span></div>' +
              '</div>'
            );
          })
          .join('')
      : '<p class="vazio">Nenhuma compra parcelada neste mês. Ao adicionar um lançamento, escolha 2x ou mais.</p>';

    const prox = s.proximos;
    const maior = Math.max.apply(null, prox.map((p) => p.valor).concat([1]));
    $('#prox-grafico').innerHTML = prox
      .map((p) => {
        const h = p.valor > 0 ? Math.max(4, Math.round((p.valor / maior) * 120)) : 2;
        return (
          '<div class="prox-col">' +
          '<span class="prox-valor' + (p.valor ? '' : ' nota') + '">' + (p.valor ? T.brl(p.valor) : 'R$ 0') + '</span>' +
          '<div class="prox-trilho"><div style="height:' + h + 'px" class="' + (p.valor ? 'cheio' : '') + '"></div></div>' +
          '<span class="nota">' + T.esc(p.rotulo) + '</span>' +
          '</div>'
        );
      })
      .join('');
    const livre = prox.find((p) => p.valor === 0);
    $('#prox-frase').textContent = !prox.some((p) => p.valor > 0)
      ? 'Nenhuma parcela comprometida nos próximos meses.'
      : livre
      ? 'Em ' + livre.rotulo + ' você fica livre de parcelas.'
      : 'Ainda há parcelas em todos os próximos 5 meses.';
  }

  T.aoIniciar(iniciar);
  T.aoMudar(desenharResumo);
  T.aoMudar(desenharTabela);
  T.aoMudar(desenharParcelas);
})();
