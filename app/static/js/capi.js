/* Trace · Capi, a mascote dos Porquinhos.
 *
 * Na aba Porquinhos, a Capi lê a sobra e as metas e escreve uma dica curta.
 * Hoje são regras simples; no futuro, ela pode virar uma assistente com IA.
 */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;
  const forte = (t) => '<strong>' + T.esc(t) + '</strong>';

  // ---------- Porquinhos ----------
  function dicaPorquinhos() {
    const lista = T.state.porquinhos;
    const M = T.state.mesPorquinhos;
    if (!lista.length) return ['', 'Crie sua primeira meta. Eu ajudo a mandar a sobra do mês pra ela.'];
    const batida = lista.find((p) => p.guardado + p.aporte >= p.meta);
    if (batida) return ['', forte(batida.nome) + ' bateu a meta! Que tal criar o próximo porquinho?'];
    const distribuido = lista.reduce((s, p) => s + p.aporte, 0);
    const livre = T.round2(M.sobra - distribuido);
    if (livre < 0) return ['estouro', 'Os porquinhos passaram da sobra em ' + forte(T.brl(-livre)) + '. Diminui um deles?'];
    const comPrazo = lista
      .filter((p) => p.aporte > 0)
      .map((p) => ({ p, meses: Math.ceil(Math.max(0, p.meta - p.guardado - p.aporte) / p.aporte) }))
      .sort((a, b) => a.meses - b.meses);
    if (livre > 0.009) {
      const perto = lista.slice().sort((a, b) => (b.guardado + b.aporte) / b.meta - (a.guardado + a.aporte) / a.meta)[0];
      return ['', 'Ainda sobram ' + forte(T.brl(livre)) + ' livres este mês. Que tal mandar para ' + forte(perto.nome) + '?'];
    }
    if (comPrazo.length) {
      const r = comPrazo[0];
      return ['', 'Sobra toda distribuída! ' + forte(r.p.nome) + ' chega lá em ' + r.meses + (r.meses === 1 ? ' mês.' : ' meses.')];
    }
    return ['', 'Arraste os controles para mandar parte da sobra para as metas.'];
  }

  // ---------- desenho ----------
  const DICAS = { porquinhos: dicaPorquinhos };

  function atualizar() {
    Object.keys(DICAS).forEach((aba) => {
      const caixa = document.getElementById('dica-' + aba);
      if (!caixa) return;
      let tom, html;
      try {
        [tom, html] = DICAS[aba]();
      } catch (e) {
        return;
      }
      const texto = caixa.querySelector('.dica-texto');
      if (texto.innerHTML === html) return;
      texto.innerHTML = html;
      caixa.classList.remove('atencao', 'estouro');
      if (tom) caixa.classList.add(tom);
      // pulinho da Capi quando a dica muda (menos na primeira vez)
      if (caixa.dataset.pronta) {
        caixa.classList.remove('mudou');
        void caixa.offsetWidth;
        caixa.classList.add('mudou');
      }
      caixa.dataset.pronta = '1';
    });
  }

  T.aoMudar(atualizar);

  // Capi na tela vazia dos porquinhos (o desenho vem de um <template> da view)
  T.capiVazia = function (pose) {
    const modelo = document.getElementById('capi-' + pose);
    return modelo ? '<div class="vazio-capi">' + modelo.innerHTML + '</div>' : '';
  };
})();
