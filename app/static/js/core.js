/* Trace · núcleo: estado, formatação, resumo da fatura e abas.
 *
 * Todos os outros arquivos (fatura.js, painel.js, porquinhos.js e
 * investimentos.js) usam o objeto global "Trace" criado aqui.
 */
(function () {
  'use strict';

  const Trace = (window.Trace = {});
  const CHAVE = 'trace:v1';

  // ---------- atalhos de DOM ----------
  Trace.$ = (seletor, raiz) => (raiz || document).querySelector(seletor);
  Trace.$$ = (seletor, raiz) => Array.from((raiz || document).querySelectorAll(seletor));

  // ---------- formatação ----------
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  Trace.brl = (v) => moeda.format(v).replace(/ /g, ' ');
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

  // ---------- estado ----------
  function padrao() {
    return {
      limite: 1500,
      texto: '',
      lancamentos: [],   // { id, data, desc, valor, categoria }
      regras: {},        // aprendizado: chave do estabelecimento -> categoria
      limites: {},       // limite por categoria (editado pela pessoa)
      porquinhos: [],    // { id, nome, tipo, meta, base, aporte, cor }
      invest: { inicial: 2000, aporte: 300, prazo: 12, cdi: 12, poup: 0.5, cdb: 100 }
    };
  }

  function carregar() {
    const base = padrao();
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo && typeof salvo === 'object') {
        if (typeof salvo.limite === 'number' && salvo.limite > 0) base.limite = salvo.limite;
        if (typeof salvo.texto === 'string') base.texto = salvo.texto;
        if (Array.isArray(salvo.lancamentos)) base.lancamentos = salvo.lancamentos;
        if (salvo.regras && typeof salvo.regras === 'object') base.regras = salvo.regras;
        if (salvo.limites && typeof salvo.limites === 'object') base.limites = salvo.limites;
        if (Array.isArray(salvo.porquinhos)) base.porquinhos = salvo.porquinhos;
        if (salvo.invest && typeof salvo.invest === 'object') Object.assign(base.invest, salvo.invest);
      }
    } catch (e) {
      /* sem localStorage (ou dado corrompido): segue só em memória */
    }
    return base;
  }

  Trace.state = carregar();
  Trace.padrao = padrao;

  Trace.salvar = function () {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(Trace.state));
    } catch (e) {
      /* ignora */
    }
  };

  Trace.apagarTudo = function () {
    try {
      localStorage.removeItem(CHAVE);
    } catch (e) {
      /* ignora */
    }
    Trace.state = padrao();
  };

  // ---------- avisos entre os módulos ----------
  const iniciadores = [];
  const ouvintes = [];
  Trace.aoIniciar = (fn) => iniciadores.push(fn);
  Trace.aoMudar = (fn) => ouvintes.push(fn);
  Trace.redesenhar = () => ouvintes.forEach((fn) => fn());
  Trace.atualizar = function () {
    Trace.salvar();
    Trace.redesenhar();
  };
  Trace.alterar = function (mutacao) {
    mutacao(Trace.state);
    Trace.atualizar();
  };

  // ---------- resumo da fatura (usado por várias abas) ----------
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
        history.replaceState(null, '', '#' + nome);
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
  document.addEventListener('DOMContentLoaded', function () {
    iniciarAbas();
    iniciadores.forEach((fn) => fn());
    Trace.redesenhar();
  });
})();
