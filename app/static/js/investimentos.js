/* Trace · aba Investimentos: compara dinheiro parado, poupança e CDB.
 * Os números vêm da API (/api/investimentos), calculados pelos Models Python. */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  const CAMPOS = ['inicial', 'aporte', 'prazo', 'cdi', 'poup', 'cdb'];

  // Nível 2: o cálculo saiu daqui. Quem calcula são os Models Python
  // (Investimento -> DinheiroParado, Poupanca, CDB); esta tela só desenha.
  function converter(d) {
    const o = d.opcoes;
    return {
      n: d.prazo,
      serie: { parado: o.parado.evolucao, poup: o.poupanca.evolucao, cdb: o.cdb.evolucao },
      investido: d.investido,
      parado: o.parado.saldo_liquido,
      poup: o.poupanca.saldo_liquido,
      poupRendimento: o.poupanca.rendimento_bruto,
      cdbBruto: o.cdb.saldo_bruto,
      cdbRendimento: o.cdb.rendimento_bruto,
      ir: o.cdb.imposto,
      cdbLiquido: o.cdb.saldo_liquido,
      cdbGanhoLiquido: o.cdb.ganho_liquido
    };
  }

  // ---------- leitura dos campos ----------
  function ler() {
    const v = {
      inicial: T.num($('#inv-inicial').value),
      aporte: T.num($('#inv-aporte').value),
      prazo: Math.round(T.num($('#inv-prazo').value)),
      cdi: T.num($('#inv-cdi').value),
      poup: T.num($('#inv-poup').value),
      cdb: T.num($('#inv-cdb').value)
    };
    const ok =
      v.inicial >= 0 && v.aporte >= 0 && v.prazo >= 1 && v.prazo <= 600 && v.cdi >= 0 && v.poup >= 0 && v.cdb >= 0 && CAMPOS.every((c) => isFinite(v[c]));
    return ok ? v : null;
  }

  function preencherCampos() {
    const i = T.state.invest;
    $('#inv-inicial').value = T.dec(i.inicial);
    $('#inv-aporte').value = T.dec(i.aporte);
    $('#inv-prazo').value = String(i.prazo);
    $('#inv-cdi').value = T.dec(i.cdi);
    $('#inv-poup').value = T.dec(i.poup);
    $('#inv-cdb').value = String(i.cdb).replace('.', ',');
  }

  // ---------- desenho ----------
  const mil = (v) => 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';

  function desenharGrafico(r) {
    const todos = r.serie.parado.concat(r.serie.poup, r.serie.cdb);
    let min = Math.min.apply(null, todos);
    let max = Math.max.apply(null, todos) * 1.03;
    if (max - min < 1) max = min + 1;
    const X = (m) => (r.n === 0 ? 0 : (m / r.n) * 520);
    const Y = (v) => 200 - ((v - min) / (max - min)) * 200;
    const f = (x) => x.toFixed(1);
    const linha = (dados) => dados.map((v, m) => f(X(m)) + ',' + f(Y(v))).join(' ');

    const marcas = Array.from(new Set([0, Math.round(r.n / 4), Math.round(r.n / 2), Math.round((3 * r.n) / 4), r.n]));
    const eixoX = marcas
      .map((m, i) => {
        const ancora = m === 0 ? 'start' : m === r.n ? 'end' : 'middle';
        return '<text x="' + f(X(m)) + '" y="222" text-anchor="' + ancora + '" fill="#93A79E" font-size="11">' + (m === 0 ? 'Hoje' : 'mês ' + m) + '</text>';
      })
      .join('');

    $('#inv-grafico').innerHTML =
      '<svg viewBox="0 0 640 250" role="img" aria-label="Evolução do saldo em ' + r.n + ' meses: CDB termina em ' +
      T.brl(r.cdbBruto) + ', poupança em ' + T.brl(r.poup) + ' e dinheiro parado em ' + T.brl(r.parado) + ' (valores brutos)" style="width:100%;height:auto">' +
      '<g transform="translate(70,12)">' +
      '<line x1="0" y1="200" x2="520" y2="200" stroke="#26332E"/>' +
      '<line x1="0" y1="100" x2="520" y2="100" stroke="#26332E" stroke-dasharray="2 4"/>' +
      '<line x1="0" y1="0" x2="520" y2="0" stroke="#26332E" stroke-dasharray="2 4"/>' +
      '<polyline points="' + linha(r.serie.parado) + '" fill="none" stroke="#93A79E" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<polyline points="' + linha(r.serie.poup) + '" fill="none" stroke="#5B9DFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<polyline points="' + linha(r.serie.cdb) + '" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="-10" y="204" text-anchor="end" fill="#93A79E" font-size="11">' + mil(min) + '</text>' +
      '<text x="-10" y="104" text-anchor="end" fill="#93A79E" font-size="11">' + mil((min + max) / 2) + '</text>' +
      '<text x="-10" y="4" text-anchor="end" fill="#93A79E" font-size="11">' + mil(max) + '</text>' +
      eixoX +
      '</g></svg>';
  }

  function desenharTabela(r) {
    const linhas = [
      ['Total investido', T.brl(r.investido), T.brl(r.investido), T.brl(r.investido), false],
      ['Rendimento bruto', '—', T.brl(r.poupRendimento), T.brl(r.cdbRendimento), false],
      ['Imposto de renda', '—', 'isento', '− ' + T.brl(r.ir), false],
      ['Total em ' + r.n + (r.n === 1 ? ' mês' : ' meses'), T.brl(r.parado), T.brl(r.poup), T.brl(r.cdbLiquido), true]
    ];
    $('#inv-tabela').innerHTML =
      '<div class="tabela-rolagem"><div class="tabela inv" role="table" aria-label="Comparativo dos três cenários">' +
      '<div class="linha cabecalho" role="row"><span role="columnheader"></span><span role="columnheader" class="direita">Parado</span>' +
      '<span role="columnheader" class="direita">Poupança</span><span role="columnheader" class="direita">CDB</span></div>' +
      linhas
        .map(
          (l) =>
            '<div class="linha" role="row"><span role="cell" class="rotulo-linha">' + l[0] + '</span>' +
            '<span role="cell" class="direita">' + l[1] + '</span><span role="cell" class="direita">' + l[2] + '</span>' +
            '<span role="cell" class="direita' + (l[4] ? ' ok forte' : ' forte') + '">' + l[3] + '</span></div>'
        )
        .join('') +
      '</div></div>';
  }

  let pedido = 0;           // descarta respostas antigas se a pessoa digitar rápido
  let temporizador = null;

  function desenhar() {
    const erro = $('#inv-erro');
    const v = ler();
    if (!v) {
      erro.textContent = 'Confira os valores: use números, com prazo de 1 a 600 meses.';
      erro.hidden = false;
      return;
    }
    erro.hidden = true;
    T.state.invest = v;
    T.salvar();
    clearTimeout(temporizador);
    temporizador = setTimeout(() => calcular(v), 150);
  }

  async function calcular(v) {
    const meu = ++pedido;
    let d;
    try {
      d = await T.api('POST', '/api/investimentos', v);
    } catch (e) {
      if (meu === pedido) {
        $('#inv-erro').textContent = e.message;
        $('#inv-erro').hidden = false;
      }
      return;
    }
    if (meu !== pedido) return;
    const r = converter(d);
    $('#r-parado').textContent = T.brl(r.parado);
    $('#r-poup').textContent = T.brl(r.poup);
    $('#r-poup-sub').textContent = '+ ' + T.brl(r.poupRendimento) + ' · isenta de IR';
    $('#r-cdb').textContent = T.brl(r.cdbLiquido);
    $('#r-cdb-nome').textContent = 'CDB, ' + String(v.cdb).replace('.', ',') + '% do CDI';
    $('#r-cdb-sub').textContent = '+ ' + T.brl(r.cdbGanhoLiquido) + ' já descontado o IR';

    // destaca o melhor resultado (só se render mais do que deixar o dinheiro parado)
    const melhor = r.cdbLiquido >= r.poup ? 'card-cdb' : 'card-poup';
    const total = Math.max(r.cdbLiquido, r.poup);
    ['card-parado', 'card-poup', 'card-cdb'].forEach((id) => {
      const card = $('#' + id);
      const eMelhor = id === melhor && total > r.parado;
      card.classList.toggle('melhor', eMelhor);
      const chip = card.querySelector('.chip');
      if (chip) chip.hidden = !eMelhor;
    });

    $('#inv-titulo').textContent = 'Evolução em ' + r.n + (r.n === 1 ? ' mês' : ' meses');
    desenharGrafico(r);
    desenharTabela(r);
  }

  function iniciar() {
    preencherCampos();
    CAMPOS.forEach((c) => {
      const campo = $('#inv-' + c);
      campo.addEventListener('input', desenhar);
      campo.addEventListener('blur', () => {
        if (ler()) preencherCampos();
      });
    });
    $('#inv-simular').addEventListener('click', desenhar);
    desenhar();
  }

  T.aoIniciar(iniciar);
})();
