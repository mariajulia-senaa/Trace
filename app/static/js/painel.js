/* Trace · aba Painel: cards, pizza, barras por categoria, linha e insights. */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  const TEXTO_FAIXA = { ok: 'tranquilo', atencao: 'atenção', estouro: 'estourou' };

  // dd/mm -> número de dias desde 01/01 (suficiente para ordenar e espaçar o gráfico)
  function diaDoAno(data) {
    const p = data.split('/').map(Number);
    return Math.round((new Date(2001, p[1] - 1, p[0]) - new Date(2001, 0, 1)) / 86400000);
  }
  function somarDias(data, dias) {
    const p = data.split('/').map(Number);
    const d = new Date(2001, p[1] - 1, p[0] + dias);
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  }

  // ---------- cards ----------
  function desenharCards(R) {
    const L = T.state.lancamentos;
    const datas = L.map((l) => diaDoAno(l.data));
    const primeira = L.find((l) => diaDoAno(l.data) === Math.min.apply(null, datas));
    const ultima = L.find((l) => diaDoAno(l.data) === Math.max.apply(null, datas));
    $('#p-periodo').textContent = 'O resumo da fatura de ' + primeira.data + ' a ' + ultima.data + ', em um só lugar.';

    $('#p-gasto').textContent = T.brl(R.gasto);
    const sub = $('#p-gasto-sub');
    sub.textContent = T.pct(R.pct) + ' do limite · ' + TEXTO_FAIXA[R.faixa];
    sub.className = 'nota ' + R.faixa;
    $('#p-limite').textContent = T.brl(R.limite);
    $('#p-sobra').textContent = T.brl(R.sobra);
    $('#p-sobra-sub').textContent = R.sobra > 0 ? 'vai para os porquinhos' : 'sem sobra neste mês';
    $('#p-maior').textContent = T.brl(R.maior.valor);
    $('#p-maior-sub').textContent = R.maior.desc;
    $('#p-qtd').textContent = String(R.quantidade);
    const nCats = T.categorias.filter((c) => R.porCategoria[c.nome] > 0).length;
    $('#p-qtd-sub').textContent = 'em ' + nCats + (nCats === 1 ? ' categoria' : ' categorias');
  }

  // ---------- pizza ----------
  function desenharPizza(R) {
    const itens = T.categorias
      .map((c) => ({ nome: c.nome, cor: c.cor, valor: R.porCategoria[c.nome] }))
      .filter((i) => i.valor > 0)
      .sort((a, b) => b.valor - a.valor);

    let acumulado = 0;
    const fatias = itens.map((i) => {
      const ini = acumulado;
      acumulado += (i.valor / R.gasto) * 100;
      return i.cor + ' ' + ini.toFixed(2) + '% ' + acumulado.toFixed(2) + '%';
    });
    const pizza = $('#pizza');
    pizza.style.background = 'conic-gradient(' + fatias.join(', ') + ')';
    pizza.setAttribute(
      'aria-label',
      'Gráfico de pizza: ' + itens.map((i) => i.nome + ' ' + T.pct((i.valor / R.gasto) * 100, 1)).join(', ')
    );
    $('#pizza-total').textContent = T.brl(R.gasto);
    $('#pizza-legenda').innerHTML = itens
      .map(
        (i) =>
          '<div class="item-legenda"><i class="dot" style="background:' + i.cor + '"></i><span>' + T.esc(i.nome) +
          '</span><em>' + T.pct((i.valor / R.gasto) * 100, 1) + '</em></div>'
      )
      .join('');
  }

  // ---------- barras: gasto x limite por categoria ----------
  function desenharBarras(R) {
    $('#barras').innerHTML = T.categorias
      .map((c) => {
        const gasto = R.porCategoria[c.nome];
        const lim = T.limiteDa(c.nome);
        const pct = lim > 0 ? (gasto / lim) * 100 : 0;
        const faixa = T.faixa(pct);
        let status;
        if (lim <= 0) status = 'sem limite';
        else if (faixa === 'estouro') status = T.pct(pct) + ' · estourou (+' + T.brl(gasto - lim) + ')';
        else status = T.pct(pct) + ' · ' + TEXTO_FAIXA[faixa];
        return (
          '<div class="barra-linha">' +
          '<span class="barra-nome">' + T.esc(c.nome) + '</span>' +
          '<div class="trilho"><div class="preenche ' + faixa + '" style="width:' + Math.min(100, pct) + '%"></div></div>' +
          '<span class="barra-info"><strong class="' + faixa + '">' + status + '</strong>' +
          '<span class="barra-valores">' + T.brl(gasto) + ' de R$ ' +
          '<input class="lim" type="text" inputmode="decimal" data-cat="' + T.esc(c.nome) + '" value="' + T.dec(lim) +
          '" aria-label="Limite de ' + T.esc(c.nome) + '"></span></span>' +
          '</div>'
        );
      })
      .join('');
  }

  // ---------- linha: gasto acumulado por dia ----------
  function desenharLinha(R) {
    const porDia = {};
    T.state.lancamentos.forEach((l) => {
      porDia[l.data] = (porDia[l.data] || 0) + l.valor;
    });
    const datas = Object.keys(porDia).sort((a, b) => diaDoAno(a) - diaDoAno(b));
    let soma = 0;
    const pontos = datas.map((d) => {
      soma += porDia[d];
      return { data: d, dia: diaDoAno(d), total: T.round2(soma) };
    });

    const topo = Math.max(R.limite, soma) * 1.07;
    const diaIni = pontos[0].dia;
    const diaFim = pontos[pontos.length - 1].dia;
    const X = (dia) => (diaFim === diaIni ? 280 : ((dia - diaIni) / (diaFim - diaIni)) * 560);
    const Y = (v) => 200 - (v / topo) * 200;
    const f = (n) => n.toFixed(1);
    const mil = (v) => Math.round(v).toLocaleString('pt-BR');

    const pol = pontos.map((p) => f(X(p.dia)) + ',' + f(Y(p.total))).join(' ');
    const ult = pontos[pontos.length - 1];
    const ancoraRotulo = X(ult.dia) > 420 ? 'end' : 'start';
    const xRotulo = X(ult.dia) > 420 ? X(ult.dia) - 12 : X(ult.dia) + 12;
    const meio = datas[Math.floor((datas.length - 1) / 2)];
    const yLim = Y(R.limite);

    $('#linha-grafico').innerHTML =
      '<svg viewBox="0 0 640 240" role="img" aria-label="Linha do gasto acumulado de ' + datas[0] + ' a ' + datas[datas.length - 1] +
      ', chegando a ' + T.brl(soma) + ', com o limite de ' + T.brl(R.limite) + '" style="width:100%;height:auto">' +
      '<g transform="translate(56,12)">' +
      '<line x1="0" y1="200" x2="560" y2="200" stroke="#26332E"/>' +
      '<line x1="0" y1="' + f(Y(R.limite / 2)) + '" x2="560" y2="' + f(Y(R.limite / 2)) + '" stroke="#26332E" stroke-dasharray="2 4"/>' +
      '<line x1="0" y1="' + f(yLim) + '" x2="560" y2="' + f(yLim) + '" stroke="#FF7A7A" stroke-width="1.5" stroke-dasharray="6 5"/>' +
      '<polyline points="' + pol + '" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + f(X(ult.dia)) + '" cy="' + f(Y(ult.total)) + '" r="5" fill="#3DDC97"/>' +
      '<text x="-10" y="204" text-anchor="end" fill="#93A79E" font-size="11">0</text>' +
      '<text x="-10" y="' + f(Y(R.limite / 2) + 4) + '" text-anchor="end" fill="#93A79E" font-size="11">' + mil(R.limite / 2) + '</text>' +
      '<text x="-10" y="' + f(yLim + 4) + '" text-anchor="end" fill="#93A79E" font-size="11">' + mil(R.limite) + '</text>' +
      '<text x="556" y="' + f(yLim - 6) + '" text-anchor="end" fill="#FF7A7A" font-size="11">Limite ' + T.brl(R.limite) + '</text>' +
      '<text x="' + f(xRotulo) + '" y="' + f(Y(ult.total) - 10) + '" text-anchor="' + ancoraRotulo + '" fill="#3DDC97" font-size="12" font-weight="600">' + T.brl(ult.total) + '</text>' +
      '<text x="0" y="220" fill="#93A79E" font-size="11">' + datas[0] + '</text>' +
      '<text x="' + f(X(diaDoAno(meio))) + '" y="220" text-anchor="middle" fill="#93A79E" font-size="11">' + meio + '</text>' +
      '<text x="560" y="220" text-anchor="end" fill="#93A79E" font-size="11">' + datas[datas.length - 1] + '</text>' +
      '</g></svg>';
  }

  // ---------- top 5 e frases ----------
  function desenharTop5() {
    const top = T.state.lancamentos.slice().sort((a, b) => b.valor - a.valor).slice(0, 5);
    $('#top5').innerHTML = top
      .map(
        (l, i) =>
          '<div class="par"><span class="posicao">' + (i + 1) + '</span><span class="truncar">' + T.esc(l.desc) +
          '</span><strong>' + T.brl(l.valor) + '</strong></div>'
      )
      .join('');
  }

  function desenharInsights(R) {
    const frases = [];
    const lider = T.categorias
      .map((c) => ({ nome: c.nome, valor: R.porCategoria[c.nome] }))
      .sort((a, b) => b.valor - a.valor)[0];
    frases.push({ texto: lider.nome + ' consumiu ' + T.pct((lider.valor / R.gasto) * 100, 1) + ' da fatura.' });
    frases.push({ texto: 'Seu maior gasto foi ' + T.brl(R.maior.valor) + ' em ' + R.maior.desc + '.' });

    T.categorias
      .map((c) => ({ nome: c.nome, excesso: T.round2(R.porCategoria[c.nome] - T.limiteDa(c.nome)), lim: T.limiteDa(c.nome) }))
      .filter((c) => c.lim > 0 && c.excesso > 0)
      .sort((a, b) => b.excesso - a.excesso)
      .slice(0, 2)
      .forEach((c) => frases.push({ texto: c.nome + ' passou ' + T.brl(c.excesso) + ' do limite da categoria.', extra: true }));

    const dias = T.state.lancamentos.map((l) => diaDoAno(l.data));
    const ini = Math.min.apply(null, dias);
    const fim = Math.max.apply(null, dias);
    const ultimaData = T.state.lancamentos.find((l) => diaDoAno(l.data) === fim).data;
    const porDia = R.gasto / (fim - ini + 1);
    if (R.gasto < R.limite && porDia > 0) {
      const faltam = Math.ceil((R.limite - R.gasto) / porDia);
      frases.push({
        texto: 'Nesse ritmo (' + T.brl(porDia) + ' por dia), o limite da fatura acaba por volta de ' + somarDias(ultimaData, faltam) + '.',
        extra: true
      });
    }

    $('#insights').innerHTML = frases
      .map((f) => '<p>' + T.esc(f.texto) + (f.extra ? ' <span class="opcional mini">opcional</span>' : '') + '</p>')
      .join('');
  }

  function desenhar() {
    const R = T.resumo();
    const vazio = R.quantidade === 0;
    $('#painel-vazio').hidden = !vazio;
    $('#painel-conteudo').hidden = vazio;
    if (vazio) {
      $('#p-periodo').textContent = 'O resumo da sua fatura, em um só lugar.';
      return;
    }
    desenharCards(R);
    desenharPizza(R);
    desenharBarras(R);
    desenharLinha(R);
    desenharTop5();
    desenharInsights(R);
  }

  function iniciar() {
    // Edição do limite de cada categoria.
    $('#barras').addEventListener('change', (e) => {
      const campo = e.target.closest('input.lim');
      if (!campo) return;
      const v = T.num(campo.value);
      T.alterar((s) => {
        if (v >= 0) s.limites[campo.dataset.cat] = T.round2(v);
      });
    });
  }

  T.aoIniciar(iniciar);
  T.aoMudar(desenhar);
})();
