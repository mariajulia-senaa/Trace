/* Trace · núcleo: conversa com o servidor (API), formatação, resumo e abas.
 *
 * Nível 2/3: os dados não ficam mais no navegador. Eles moram nos Models
 * Python (Lancamento, Porquinho, Preferencias, Fatura) e chegam aqui pela
 * API JSON do Bottle. Os outros arquivos (fatura.js, painel.js,
 * porquinhos.js e investimentos.js) usam o objeto global "Trace".
 */
(function () {
  'use strict';

  const Trace = (window.Trace = {});
  const CHAVE_INVEST = 'trace:invest';

  // Nível 4: identifica esta aba. Vai junto em cada chamada à API para que o
  // aviso do Websocket não volte para a própria aba que fez a mudança.
  Trace.cliente = 'aba-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  // ---------- atalhos de DOM ----------
  Trace.$ = (seletor, raiz) => (raiz || document).querySelector(seletor);
  Trace.$$ = (seletor, raiz) => Array.from((raiz || document).querySelectorAll(seletor));

  // ---------- formatação ----------
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  Trace.brl = (v) => moeda.format(v).replace(/ /g, ' ');
  Trace.dec = (v, casas) => {
    const c = casas === undefined ? 2 : casas;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  };
  Trace.pct = (v, casas) => Trace.dec(v, casas === undefined ? 0 : casas) + '%';
  Trace.round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
  Trace.esc = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Converte "R$ 1.234,56", "1234,56", "1234.56" ou "1.500" em número (ou NaN).
  Trace.num = function (texto) {
    let s = String(texto).replace(/[^\d,.\-]/g, '');
    if (s.includes(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, '');
    }
    return s === '' ? NaN : parseFloat(s);
  };

  // ---------- categorias (vêm do Model Python, via a view) ----------
  Trace.categorias = JSON.parse(document.getElementById('categorias-data').textContent);
  Trace.corDa = (nome) => {
    const c = Trace.categorias.find((x) => x.nome === nome);
    return c ? c.cor : '#7A8A84';
  };

  // ---------- simulação de investimentos (só esta fica no navegador) ----------
  function investPadrao() {
    const base = { inicial: 2000, aporte: 300, prazo: 12, cdi: 12, poup: 0.5, cdb: 100 };
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_INVEST) || 'null');
      if (salvo && typeof salvo === 'object') Object.assign(base, salvo);
    } catch (e) {
      /* sem localStorage: segue com os valores padrão */
    }
    return base;
  }
  Trace.salvar = function () {
    try {
      localStorage.setItem(CHAVE_INVEST, JSON.stringify(Trace.state.invest));
    } catch (e) {
      /* ignora */
    }
  };

  // ---------- estado vindo do servidor ----------
  const ddmm = (iso) => iso.slice(8, 10) + '/' + iso.slice(5, 7);

  function aplicar(e) {
    const f = e.fatura;
    const anterior = Trace.state || {};
    Trace.state = {
      mes: f.mes,
      nomeMes: f.nome,
      situacao: f.situacao,
      mesAtual: e.mes_atual,
      hoje: e.hoje,
      meses: e.meses,
      limite: e.preferencias.limite,
      limites: e.preferencias.limites || {},
      lancamentos: f.itens.map((l) => ({
        id: l.id,
        origemId: l.origem_id,
        iso: l.data,
        data: ddmm(l.data),
        ano: Number(l.data.slice(0, 4)),
        desc: l.descricao,
        valor: l.valor,
        categoria: l.categoria,
        parcela: l.parcela,
        total: l.total_parcelas,
        automatica: l.automatica,
        origem: l.origem
      })),
      servidor: f.resumo,
      parcelamentos: f.parcelamentos,
      proximos: f.proximos,
      mesPorquinhos: e.mes_dos_porquinhos,
      porquinhos: e.porquinhos.map((p) => Object.assign({}, p, { base: p.guardado })),
      invest: anterior.invest || investPadrao()
    };
  }

  // Chamada à API: devolve o JSON ou lança um erro com a mensagem do servidor.
  Trace.api = async function (metodo, url, corpo) {
    const opcoes = { method: metodo, headers: { Accept: 'application/json', 'X-Trace-Cliente': Trace.cliente } };
    if (corpo !== undefined) {
      opcoes.headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(corpo);
    }
    let resposta;
    try {
      resposta = await fetch(url, opcoes);
    } catch (e) {
      throw new Error('Sem conexão com o servidor do Trace.');
    }
    let dados = {};
    try {
      dados = await resposta.json();
    } catch (e) {
      /* resposta sem JSON */
    }
    if (resposta.status === 401) {
      // sessão terminou (logout em outra aba, ou venceu): volta para o login
      location.href = '/login';
      throw new Error(dados.erro || 'Sua sessão terminou.');
    }
    if (!resposta.ok) {
      const erro = new Error(dados.erro || 'O servidor respondeu com erro ' + resposta.status + '.');
      erro.status = resposta.status;
      throw erro;
    }
    return dados;
  };

  // Busca de novo o estado do mês e redesenha tudo.
  Trace.recarregar = async function (mes) {
    const alvo = mes || (Trace.state && Trace.state.mes) || '';
    const e = await Trace.api('GET', '/api/estado?mes=' + encodeURIComponent(alvo));
    aplicar(e);
    Trace.redesenhar();
  };

  // Executa uma ação no servidor e, se der certo, recarrega a tela.
  Trace.executar = async function (acao) {
    try {
      const resultado = await acao();
      await Trace.recarregar();
      return resultado;
    } catch (e) {
      Trace.avisar(e.message, 'erro');
      return null;
    }
  };

  Trace.irParaMes = async function (mes) {
    try {
      await Trace.recarregar(mes);
      const url = new URL(location.href);
      url.searchParams.set('mes', mes);
      history.replaceState(null, '', url.pathname + url.search + location.hash);
    } catch (e) {
      Trace.avisar(e.message, 'erro');
    }
  };

  // ---------- avisos rápidos (toast) ----------
  let temporizador = null;
  Trace.avisar = function (texto, tipo) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = texto;
    el.className = 'toast visivel' + (tipo ? ' ' + tipo : '');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => (el.className = 'toast'), 3800);
  };

  // Botão que pede um segundo clique para confirmar (sem janelas de alerta).
  Trace.confirmarDuasVezes = function (botao, textoConfirmar, acao) {
    if (botao.dataset.confirmando === '1') {
      botao.dataset.confirmando = '';
      botao.textContent = botao.dataset.textoOriginal;
      acao();
      return;
    }
    botao.dataset.textoOriginal = botao.textContent;
    botao.dataset.confirmando = '1';
    botao.textContent = textoConfirmar;
    setTimeout(() => {
      if (botao.dataset.confirmando === '1') {
        botao.dataset.confirmando = '';
        botao.textContent = botao.dataset.textoOriginal;
      }
    }, 4000);
  };

  // ---------- avisos entre os módulos ----------
  const iniciadores = [];
  const ouvintes = [];
  Trace.aoIniciar = (fn) => iniciadores.push(fn);
  Trace.aoMudar = (fn) => ouvintes.push(fn);
  Trace.redesenhar = () => ouvintes.forEach((fn) => fn());

  // ---------- resumo da fatura do mês escolhido ----------
  Trace.faixa = (pct) => (pct <= 70 ? 'ok' : pct <= 100 ? 'atencao' : 'estouro');
  Trace.rotuloFaixa = { ok: 'Tranquilo', atencao: 'Atenção', estouro: 'Estourou' };

  Trace.resumo = function () {
    const s = Trace.state;
    const L = s.lancamentos;
    const gasto = Trace.round2(L.reduce((soma, l) => soma + l.valor, 0));
    const limite = s.limite;
    const pct = limite > 0 ? (gasto / limite) * 100 : 0;
    const porCategoria = {};
    Trace.categorias.forEach((c) => (porCategoria[c.nome] = 0));
    L.forEach((l) => {
      porCategoria[l.categoria] = Trace.round2((porCategoria[l.categoria] || 0) + l.valor);
    });
    const maior = L.reduce((m, l) => (!m || l.valor > m.valor ? l : m), null);
    return {
      gasto,
      limite,
      pct,
      faixa: Trace.faixa(pct),
      sobra: Math.max(0, Trace.round2(limite - gasto)),
      estouro: Math.max(0, Trace.round2(gasto - limite)),
      parcelas: s.servidor.comprometido_parcelas,
      porCategoria,
      maior,
      quantidade: L.length
    };
  };

  Trace.limiteDa = (nome) => {
    const salvo = Trace.state.limites[nome];
    if (typeof salvo === 'number') return salvo;
    const c = Trace.categorias.find((x) => x.nome === nome);
    return c ? c.limite : 0;
  };

  // ---------- seletor de mês (aparece na Fatura e no Painel) ----------
  const COR_SITUACAO = { 'mês atual': 'ok', 'próximo mês': 'atencao', futuro: 'atencao', 'mês passado': 'neutro' };

  function desenharSeletores() {
    const s = Trace.state;
    const indice = s.meses.findIndex((m) => m.mes === s.mes);
    Trace.$$('[data-seletor-mes]').forEach((caixa) => {
      const select = caixa.querySelector('select');
      if (document.activeElement !== select) {
        select.innerHTML = s.meses
          .map((m) => '<option value="' + m.mes + '"' + (m.mes === s.mes ? ' selected' : '') + '>' + Trace.esc(m.nome) + '</option>')
          .join('');
      }
      caixa.querySelector('[data-mes-anterior]').disabled = indice <= 0;
      caixa.querySelector('[data-mes-seguinte]').disabled = indice >= s.meses.length - 1;
      const chip = caixa.querySelector('.chip-mes');
      chip.textContent = s.situacao;
      chip.className = 'chip-mes ' + (COR_SITUACAO[s.situacao] || 'neutro');
    });
  }

  function iniciarSeletores() {
    Trace.$$('[data-seletor-mes]').forEach((caixa) => {
      caixa.querySelector('select').addEventListener('change', (e) => Trace.irParaMes(e.target.value));
      const pular = (passo) => {
        const s = Trace.state;
        const i = s.meses.findIndex((m) => m.mes === s.mes) + passo;
        if (i >= 0 && i < s.meses.length) Trace.irParaMes(s.meses[i].mes);
      };
      caixa.querySelector('[data-mes-anterior]').addEventListener('click', () => pular(-1));
      caixa.querySelector('[data-mes-seguinte]').addEventListener('click', () => pular(1));
    });
  }
  Trace.aoMudar(desenharSeletores);

  // ---------- abas ----------
  function abrirAba(nome, gravarHash) {
    const abas = Trace.$$('.aba');
    if (!abas.some((a) => a.dataset.tab === nome)) nome = 'fatura';
    abas.forEach((a) => {
      const ativa = a.dataset.tab === nome;
      a.setAttribute('aria-selected', ativa ? 'true' : 'false');
      a.classList.toggle('ativa', ativa);
      a.tabIndex = ativa ? 0 : -1;
    });
    Trace.$$('.painel-aba').forEach((p) => {
      p.hidden = p.id !== nome;
    });
    if (gravarHash !== false) {
      try {
        history.replaceState(null, '', location.pathname + location.search + '#' + nome);
      } catch (e) {
        /* ignora */
      }
    }
    window.scrollTo(0, 0);
  }
  Trace.abrirAba = abrirAba;

  function iniciarAbas() {
    const abas = Trace.$$('.aba');
    abas.forEach((a, i) => {
      a.addEventListener('click', () => abrirAba(a.dataset.tab));
      a.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const prox = abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
        prox.focus();
        abrirAba(prox.dataset.tab);
      });
    });
    abrirAba(location.hash.replace('#', '') || 'fatura', false);
    window.addEventListener('hashchange', () => abrirAba(location.hash.replace('#', ''), false));
  }

  // ---------- partida ----------
  // O primeiro estado já vem dentro da página (renderizada pelo Bottle).
  aplicar(JSON.parse(document.getElementById('estado-data').textContent));

  document.addEventListener('DOMContentLoaded', function () {
    iniciarAbas();
    iniciarSeletores();
    iniciadores.forEach((fn) => fn());
    Trace.redesenhar();
  });
})();
