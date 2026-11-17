/* Trace · aba Fatura: leitura do texto, categorização, limite e tabela. */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  // Fatura fictícia usada no botão "Carregar exemplo" (e no vídeo).
  const EXEMPLO = [
    '05/11 UBER *TRIP 23,90',
    '05/11 IFOOD *RESTAURANTE 54,70',
    '06/11 NETFLIX.COM 55,90',
    '07/11 SUPERMERCADO BOM PRECO 212,35',
    '08/11 POSTO SHELL 180,00',
    '09/11 FARMACIA POPULAR 67,80',
    '10/11 SPOTIFY 21,90',
    '11/11 CINEMAPLEX 76,00',
    '12/11 LOJA XYZ 3/6 149,90',
    '13/11 IFOOD *LANCHES 48,90',
    '14/11 UBER *TRIP 31,20',
    '15/11 CURSO ONLINE 89,90',
    '16/11 RESTAURANTE SABOR 96,50',
    '17/11 AMAZON PRIME 19,90'
  ].join('\n');

  // Porquinhos de exemplo, já combinando com a sobra da fatura de exemplo.
  const PORQUINHOS_EXEMPLO = [
    { nome: 'Viagem para o Nordeste', tipo: 'Viagem', meta: 3500, base: 1280, aporte: 150, cor: '#5B9DFF' },
    { nome: 'Notebook de trabalho', tipo: 'Trabalho', meta: 4200, base: 900, aporte: 191.15, cor: '#3DDC97' },
    { nome: 'Reserva de emergência', tipo: 'Reserva', meta: 6000, base: 5370, aporte: 30, cor: '#E8A06B' }
  ];

  // ---------- leitura da fatura ----------
  // data (dd/mm, dd/mm/aaaa ou aaaa-mm-dd) + estabelecimento + valor (23,90 | 1.234,56 | 23.90)
  const LINHA = /^\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})\s+(.+?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})\s*$/;

  function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  }

  function lerFatura(texto) {
    const itens = [];
    let ignoradas = 0;
    texto.split(/\r?\n/).forEach((bruta) => {
      const linha = bruta.replace(/["\t;]+/g, ' ').trim(); // aceita CSV com ; e tabulação
      if (!linha) return;
      const m = LINHA.exec(linha);
      if (!m) {
        ignoradas++;
        return;
      }
      let data = m[1];
      if (/^\d{4}-/.test(data)) {
        const p = data.split('-');
        data = p[2] + '/' + p[1];
      } else {
        data = data.split('/').slice(0, 2).map((x) => x.padStart(2, '0')).join('/');
      }
      const valor = T.num(m[3]);
      if (!(valor > 0)) {
        ignoradas++;
        return;
      }
      itens.push({ id: itens.length + 1, data, desc: m[2].replace(/\s+/g, ' ').trim(), valor });
    });
    return { itens, ignoradas };
  }

  // ---------- categorização ----------
  function tokens(desc) {
    return normalizar(desc).replace(/[^A-Z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
  }

  // Chave do estabelecimento: as duas primeiras palavras (só letras). Usada para
  // aplicar uma correção manual a todos os lançamentos "parecidos".
  function chave(desc) {
    return tokens(desc).filter((t) => /^[A-Z]{2,}$/.test(t)).slice(0, 2).join(' ');
  }

  function categorizar(desc, regras) {
    const k = chave(desc);
    if (k && regras[k]) return regras[k];
    const tk = tokens(desc);
    const texto = ' ' + tk.join(' ') + ' ';
    for (const c of T.categorias) {
      for (const palavra of c.palavras_chave) {
        const p = normalizar(palavra);
        if (p.includes(' ')) {
          if (texto.includes(' ' + p + ' ')) return c.nome;
        } else if (tk.some((t) => t === p || (p.length >= 4 && t.startsWith(p)))) {
          return c.nome;
        }
      }
    }
    return 'Outros';
  }

  // ---------- mensagens ----------
  function aviso(texto) {
    $('#fatura-status').textContent = texto;
  }

  // ---------- ações ----------
  function analisar(texto) {
    const { itens, ignoradas } = lerFatura(texto);
    if (!itens.length) {
      aviso('Não encontrei lançamentos. Use uma linha por compra, como: 05/11 UBER *TRIP 23,90');
      return;
    }
    T.alterar((s) => {
      s.texto = texto;
      s.lancamentos = itens.map((i) => Object.assign({}, i, { categoria: categorizar(i.desc, s.regras) }));
    });
    const extra = ignoradas ? ' · ' + ignoradas + (ignoradas === 1 ? ' linha ignorada' : ' linhas ignoradas') : '';
    aviso(itens.length + (itens.length === 1 ? ' lançamento lido' : ' lançamentos lidos') + extra + '.');
  }

  function carregarExemplo() {
    $('#fatura-texto').value = EXEMPLO;
    T.alterar((s) => {
      s.limite = 1500;
      if (!s.porquinhos.length) {
        s.porquinhos = PORQUINHOS_EXEMPLO.map((p, i) => Object.assign({ id: 'ex' + (i + 1) }, p));
      }
    });
    $('#limite').value = T.dec(T.state.limite);
    analisar(EXEMPLO);
  }

  function iniciar() {
    const limite = $('#limite');
    limite.value = T.dec(T.state.limite);
    $('#fatura-texto').value = T.state.texto || '';

    limite.addEventListener('input', () => {
      const v = T.num(limite.value);
      if (v > 0) T.alterar((s) => (s.limite = v));
    });
    limite.addEventListener('blur', () => (limite.value = T.dec(T.state.limite)));

    $('#btn-analisar').addEventListener('click', () => analisar($('#fatura-texto').value));
    $('#btn-exemplo').addEventListener('click', carregarExemplo);

    $('#btn-limpar').addEventListener('click', () => {
      $('#fatura-texto').value = '';
      T.alterar((s) => {
        s.texto = '';
        s.lancamentos = [];
      });
      aviso('Fatura limpa.');
    });

    $('#arquivo').addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      if (!arquivo) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        $('#fatura-texto').value = String(leitor.result);
        analisar(String(leitor.result));
      };
      leitor.readAsText(arquivo);
      e.target.value = '';
    });

    // Correção manual de categoria (e aprendizado da regra).
    $('#lanc-tabela').addEventListener('change', (e) => {
      const seletor = e.target.closest('select[data-id]');
      if (!seletor) return;
      const id = Number(seletor.dataset.id);
      const nova = seletor.value;
      let parecidos = 0;
      T.alterar((s) => {
        const alvo = s.lancamentos.find((l) => l.id === id);
        if (!alvo) return;
        alvo.categoria = nova;
        const k = chave(alvo.desc);
        if (!k) return;
        s.regras[k] = nova;
        s.lancamentos.forEach((l) => {
          if (l !== alvo && chave(l.desc) === k && l.categoria !== nova) {
            l.categoria = nova;
            parecidos++;
          }
        });
      });
      aviso(parecidos ? 'Categoria aplicada também a ' + parecidos + ' lançamento(s) parecido(s).' : 'Categoria atualizada.');
    });

    $('#btn-apagar').addEventListener('click', () => {
      T.apagarTudo();
      $('#fatura-texto').value = '';
      $('#limite').value = T.dec(T.state.limite);
      aviso('Todos os dados foram apagados deste navegador.');
      T.redesenhar();
    });
  }

  // ---------- desenho ----------
  function desenharResumo() {
    const R = T.resumo();
    $('#f-gasto').textContent = T.brl(R.gasto);
    $('#f-gasto-sub').textContent = R.quantidade
      ? R.quantidade + (R.quantidade === 1 ? ' lançamento lido da fatura.' : ' lançamentos lidos da fatura.')
      : 'Nenhum lançamento lido ainda.';

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
      $('#f-resta-sub').textContent = 'Essa sobra alimenta seus porquinhos.';
    }

    // Medidor do limite (semáforo)
    const selo = $('#m-selo');
    selo.textContent = T.rotuloFaixa[R.faixa];
    selo.className = 'selo ' + R.faixa;
    const barra = $('#m-barra');
    barra.className = 'preenche ' + R.faixa;
    barra.style.width = Math.min(100, R.pct) + '%';
    $('#m-fim').textContent = '100% · ' + T.brl(R.limite);

    let frase;
    if (!R.quantidade) frase = 'Cole sua fatura e clique em Analisar para começar.';
    else if (R.estouro > 0) frase = 'Você passou ' + T.brl(R.estouro) + ' do limite.';
    else frase = 'Você usou ' + T.pct(R.pct) + ' do limite. Restam ' + T.brl(R.sobra) + '.';
    $('#m-frase').textContent = frase;
  }

  function desenharTabela() {
    const L = T.state.lancamentos;
    const caixa = $('#lanc-tabela');
    if (!L.length) {
      caixa.innerHTML =
        '<p class="vazio com-padding-x">Nenhum lançamento ainda. Cole sua fatura ao lado e clique em <strong>Analisar fatura</strong>, ou use <strong>Carregar exemplo</strong>.</p>';
      return;
    }
    const opcoes = (atual) =>
      T.categorias
        .map((c) => '<option value="' + T.esc(c.nome) + '"' + (c.nome === atual ? ' selected' : '') + '>' + T.esc(c.nome) + '</option>')
        .join('');
    const linhas = L.map(
      (l) =>
        '<div class="linha' + (l.categoria === 'Outros' ? ' revisar' : '') + '" role="row">' +
        '<span role="cell" class="data">' + T.esc(l.data) + '</span>' +
        '<span role="cell" class="desc" title="' + T.esc(l.desc) + '">' + T.esc(l.desc) + '</span>' +
        '<span role="cell" class="cat"><i class="dot" style="background:' + T.corDa(l.categoria) + '"></i>' +
        '<select data-id="' + l.id + '" aria-label="Categoria de ' + T.esc(l.desc) + '">' + opcoes(l.categoria) + '</select></span>' +
        '<span role="cell" class="valor-celula">' + T.brl(l.valor) + '</span>' +
        '</div>'
    ).join('');
    caixa.innerHTML =
      '<div class="tabela-rolagem"><div class="tabela" role="table" aria-label="Lançamentos da fatura">' +
      '<div class="linha cabecalho" role="row"><span role="columnheader">Data</span><span role="columnheader">Estabelecimento</span>' +
      '<span role="columnheader">Categoria</span><span role="columnheader" class="direita">Valor</span></div>' +
      linhas +
      '</div></div>';
  }

  T.aoIniciar(iniciar);
  T.aoMudar(desenharResumo);
  T.aoMudar(desenharTabela);
})();
