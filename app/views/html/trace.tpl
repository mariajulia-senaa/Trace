<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0B0F0E">
    <title>Trace · veja pra onde foi sua fatura</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap">
    <link rel="stylesheet" type="text/css" href="/static/css/trace.css">
    <link rel="stylesheet" type="text/css" href="/static/css/acesso.css">
    <link rel="stylesheet" type="text/css" href="/static/css/capi.css">
</head>

<body>

<header class="topbar">
    <a class="marca" href="/">
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M3 20 L10 12 L15 17 L25 6" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Trace
    </a>
    <nav class="abas" role="tablist" aria-label="Seções do Trace">
        <button type="button" class="aba" role="tab" id="aba-fatura" data-tab="fatura" aria-controls="fatura" aria-selected="true">Fatura</button>
        <button type="button" class="aba" role="tab" id="aba-painel" data-tab="painel" aria-controls="painel" aria-selected="false">Painel</button>
        <button type="button" class="aba" role="tab" id="aba-porquinhos" data-tab="porquinhos" aria-controls="porquinhos" aria-selected="false">Porquinhos</button>
        <button type="button" class="aba" role="tab" id="aba-investimentos" data-tab="investimentos" aria-controls="investimentos" aria-selected="false">Investimentos</button>
    </nav>
    <div class="conta">
        <span class="ao-vivo conectando" id="ao-vivo" role="status" aria-live="polite" title="Atualização em tempo real (Websocket)"><i aria-hidden="true"></i><span id="ao-vivo-texto">Conectando…</span></span>
        <a class="conta-nome" href="/conta" title="Minha conta"><span class="avatar" aria-hidden="true">{{usuario.primeiro_nome[:1].upper()}}</span>Olá, <strong>{{usuario.primeiro_nome}}</strong></a>
        <form method="post" action="/sair">
            <button type="submit" class="botao pequeno" id="btn-sair">Sair</button>
        </form>
    </div>
</header>

<main class="conteudo">

    <!-- ============================== 1. FATURA ============================== -->
    <section id="fatura" class="painel-aba" role="tabpanel" aria-labelledby="aba-fatura">
        <div class="titulo-pagina com-seletor">
            <div>
                <h1>Fatura</h1>
                <p>Escolha o mês, preencha a fatura e acompanhe suas parcelas.</p>
            </div>
            <div class="seletor-mes" data-seletor-mes role="group" aria-label="Mês da fatura">
                <button type="button" class="botao-icone" data-mes-anterior aria-label="Mês anterior"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
                <label class="caixa-mes">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
                    <select aria-label="Escolher o mês"></select>
                </label>
                <button type="button" class="botao-icone" data-mes-seguinte aria-label="Próximo mês"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
                <span class="chip-mes ok"></span>
            </div>
        </div>

        <div class="linha-cards quatro">
            <div class="card">
                <label for="limite" class="rotulo">Limite do mês</label>
                <div class="campo-moeda destaque">
                    <span>R$</span>
                    <input id="limite" type="text" inputmode="decimal" value="1.500,00" autocomplete="off">
                </div>
                <span class="nota">Vale para todos os meses.</span>
            </div>
            <div class="card">
                <span class="rotulo">Total do mês</span>
                <span class="valor" id="f-gasto">R$ 0,00</span>
                <span class="nota" id="f-gasto-sub">Nenhum lançamento neste mês.</span>
            </div>
            <div class="card">
                <span class="rotulo">Já comprometido com parcelas</span>
                <span class="valor atencao" id="f-parc">R$ 0,00</span>
                <span class="nota" id="f-parc-sub">Parcelas que caem neste mês.</span>
            </div>
            <div class="card">
                <span class="rotulo" id="f-resta-rotulo">Ainda resta</span>
                <span class="valor" id="f-resta">R$ 1.500,00</span>
                <span class="nota" id="f-resta-sub">Essa sobra alimenta seus porquinhos.</span>
            </div>
        </div>

        <div class="card medidor" aria-live="polite">
            <div class="medidor-topo">
                <span class="selo ok" id="m-selo">Tranquilo</span>
                <span class="medidor-frase" id="m-frase">Adicione os lançamentos da fatura para começar.</span>
            </div>
            <div class="trilho grande">
                <div class="preenche ok" id="m-barra" style="width: 0%"></div>
                <div class="marca-70"></div>
            </div>
            <div class="regua">
                <span style="left: 0">R$ 0</span>
                <span style="left: 70%; transform: translateX(-50%)">70%</span>
                <span style="right: 0" id="m-fim">100% · R$ 1.500,00</span>
            </div>
            <div class="legenda">
                <span><i class="dot" style="background: var(--ok)"></i>Tranquilo, até 70%</span>
                <span><i class="dot" style="background: var(--atencao)"></i>Atenção, de 70% a 100%</span>
                <span><i class="dot" style="background: var(--estouro)"></i>Estourou, acima de 100%</span>
            </div>
        </div>

        <div class="card sem-padding-x">
            <div class="com-padding-x cabeca-lanc">
                <div>
                    <h2 id="lanc-titulo">Lançamentos do mês</h2>
                    <p class="nota">Parcelou? Escolha 2x ou mais e digite o valor de cada parcela, como vem na fatura. As próximas entram sozinhas nos meses seguintes.</p>
                </div>
                <div class="botoes">
                    <button type="button" class="botao" id="btn-exemplo">Carregar exemplo</button>
                    <label class="botao pequeno" for="arquivo">Importar CSV ou TXT</label>
                    <input type="file" id="arquivo" accept=".csv,.txt,text/csv,text/plain" hidden>
                    <button type="button" class="botao pequeno" id="btn-limpar">Limpar mês</button>
                </div>
            </div>

            <div id="lanc-tabela"></div>
            <p class="nota com-padding-x" id="fatura-status" role="status" aria-live="polite"></p>
            <p class="nota com-padding-x">Ao corrigir uma categoria, o Trace aplica a mesma regra aos lançamentos parecidos.</p>

            <details class="como com-padding-x">
                <summary>Prefere colar a fatura como texto?</summary>
                <div class="como-lista">
                    <p class="nota">Uma linha por lançamento: data, estabelecimento e valor. Parcelas como "LOJA XYZ 3/6" são reconhecidas. As linhas são adicionadas à tabela.</p>
                    <textarea id="fatura-texto" aria-label="Texto da fatura" spellcheck="false"
                              placeholder="05/11 UBER *TRIP 23,90&#10;06/11 NETFLIX.COM 55,90&#10;07/11 SUPERMERCADO BOM PRECO 212,35"></textarea>
                    <div class="botoes">
                        <button type="button" class="botao primario" id="btn-analisar">Analisar texto</button>
                    </div>
                </div>
            </details>

            <details class="como com-padding-x">
                <summary>Como o Trace categoriza?</summary>
                <div class="como-lista">
                    % for c in categorias:
                    <p>
                        <i class="dot" style="background: {{c.cor}}"></i>
                        <strong>{{c.nome}}</strong>:
                        % if c.palavras_chave:
                        {{', '.join(c.palavras_chave)}}
                        % else:
                        tudo o que não casar com as outras categorias
                        % end
                    </p>
                    % end
                </div>
            </details>

            <span class="nota com-icone com-padding-x">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/></svg>
                Os lançamentos ficam no servidor, em app/controllers/db/lancamentos.json.
            </span>
        </div>

        <div class="duas-colunas">
            <div class="card" style="flex: 3 1 520px; min-width: 0">
                <div class="titulo-com-selo espalhado">
                    <h2>Parcelamentos</h2>
                    <span class="nota" id="parc-falta"></span>
                </div>
                <div id="parc-lista" class="parc-lista"></div>
            </div>
            <div class="card" style="flex: 2 1 340px; min-width: 0">
                <div>
                    <h2>Próximos meses</h2>
                    <p class="nota">Quanto do limite já está comprometido só com parcelas.</p>
                </div>
                <div id="prox-grafico" class="prox-grafico" role="img" aria-label="Parcelas já comprometidas nos próximos meses"></div>
                <p class="nota" id="prox-frase"></p>
            </div>
        </div>
    </section>


    <!-- ============================== 2. PAINEL ============================== -->
    <section id="painel" class="painel-aba" role="tabpanel" aria-labelledby="aba-painel" hidden>
        <div class="titulo-pagina com-seletor">
            <div>
                <h1>Painel</h1>
                <p id="p-periodo">O resumo da sua fatura, em um só lugar.</p>
            </div>
            <div class="seletor-mes" data-seletor-mes role="group" aria-label="Mês da fatura">
                <button type="button" class="botao-icone" data-mes-anterior aria-label="Mês anterior"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
                <label class="caixa-mes">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
                    <select aria-label="Escolher o mês"></select>
                </label>
                <button type="button" class="botao-icone" data-mes-seguinte aria-label="Próximo mês"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
                <span class="chip-mes ok"></span>
            </div>
        </div>

        <div id="painel-vazio" class="card vazio-grande">
            <h2>Nenhum lançamento em <span id="painel-vazio-mes">este mês</span></h2>
            <p>Escolha outro mês acima, ou vá até a aba <strong>Fatura</strong> e clique em <strong>Carregar exemplo</strong>.</p>
        </div>

        <div id="painel-conteudo">
            <div class="linha-cards cinco">
                <div class="card compacto">
                    <span class="rotulo">Total gasto</span>
                    <span class="valor medio" id="p-gasto"></span>
                    <span class="nota" id="p-gasto-sub"></span>
                </div>
                <div class="card compacto">
                    <span class="rotulo">Limite</span>
                    <span class="valor medio" id="p-limite"></span>
                    <span class="nota">definido por você</span>
                </div>
                <div class="card compacto">
                    <span class="rotulo">Sobra do mês</span>
                    <span class="valor medio ok" id="p-sobra"></span>
                    <span class="nota" id="p-sobra-sub"></span>
                </div>
                <div class="card compacto">
                    <span class="rotulo">Maior gasto</span>
                    <span class="valor medio" id="p-maior"></span>
                    <span class="nota truncar" id="p-maior-sub"></span>
                </div>
                <div class="card compacto">
                    <span class="rotulo">Lançamentos</span>
                    <span class="valor medio" id="p-qtd"></span>
                    <span class="nota" id="p-qtd-sub"></span>
                </div>
            </div>

            <div class="duas-colunas">
                <div class="card" style="flex: 1 1 380px">
                    <h2>Gasto por categoria</h2>
                    <div class="pizza-area">
                        <div class="pizza" id="pizza" role="img" aria-label="Gráfico de pizza dos gastos por categoria">
                            <div class="pizza-centro">
                                <span id="pizza-total"></span>
                                <small>total</small>
                            </div>
                        </div>
                        <div class="pizza-legenda" id="pizza-legenda"></div>
                    </div>
                </div>

                <div class="card" style="flex: 2 1 560px; min-width: 0">
                    <div class="titulo-com-selo">
                        <h2>Gasto x limite por categoria</h2>
                        <span class="opcional">opcional</span>
                    </div>
                    <p class="nota">Os limites são sugestões. Clique no valor para editar o seu.</p>
                    <div id="barras" class="barras"></div>
                </div>
            </div>

            <div class="duas-colunas">
                <div class="card" style="flex: 2 1 560px; min-width: 0">
                    <h2>Gasto acumulado no mês</h2>
                    <div id="linha-grafico"></div>
                </div>
                <div class="coluna-pilha" style="flex: 1 1 380px">
                    <div class="card">
                        <h2>Top 5 maiores gastos</h2>
                        <div id="top5" class="lista-simples"></div>
                    </div>
                    <div class="card">
                        <h2>O que a fatura diz</h2>
                        <div id="insights" class="insights"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- ============================ 3. PORQUINHOS ============================ -->
    <section id="porquinhos" class="painel-aba" role="tabpanel" aria-labelledby="aba-porquinhos" hidden>
        <div class="titulo-pagina">
            <h1>Porquinhos</h1>
            <p id="pq-sub">Reparta a sobra do mês entre as suas metas e veja quando cada uma chega lá.</p>
        </div>

        <div class="card">
            <div class="sobra-topo">
                <div>
                    <span class="rotulo">Sobra do mês</span>
                    <span class="valor enorme ok" id="pq-sobra">R$ 0,00</span>
                    <span class="nota" id="pq-sobra-sub"></span>
                </div>
                <div class="sobra-numeros">
                    <span>Distribuído: <strong id="pq-dist">R$ 0,00</strong></span>
                    <span class="nota" id="pq-livre">Livre: R$ 0,00</span>
                </div>
            </div>
            <div class="segmentada" id="pq-seg" role="img" aria-label="Divisão da sobra entre os porquinhos"></div>
            <div class="legenda" id="pq-legenda"></div>
            <p class="aviso" id="pq-aviso" role="status" aria-live="polite" hidden></p>
        </div>

        <aside class="dica-capi" id="dica-porquinhos" aria-live="polite">
            <div class="dica-capi-arte" aria-hidden="true">
                % include('app/views/html/_capi', pose='porquinho')
            </div>
            <div class="dica-balao">
                <span class="dica-titulo">Dica da Capi</span>
                <p class="dica-texto">Carregando…</p>
            </div>
        </aside>

        <div id="pq-lista" class="grade-porquinhos"></div>
        <template id="capi-porquinho">
            % include('app/views/html/_capi', pose='porquinho')
        </template>

        <div class="card novo-porquinho">
            <button type="button" class="botao" id="pq-abrir" aria-expanded="false" aria-controls="pq-form">+ Novo porquinho</button>
            <form id="pq-form" class="form-porquinho" hidden>
                <div class="campo">
                    <label for="pq-nome">Nome da meta</label>
                    <input id="pq-nome" type="text" maxlength="40" placeholder="Ex.: Viagem de fim de ano" required>
                </div>
                <div class="campo">
                    <label for="pq-tipo">Tipo</label>
                    <select id="pq-tipo">
                        <option>Viagem</option>
                        <option>Trabalho</option>
                        <option>Reserva</option>
                        <option>Compra</option>
                        <option>Outro</option>
                    </select>
                </div>
                <div class="campo">
                    <label for="pq-meta">Valor da meta (R$)</label>
                    <input id="pq-meta" type="text" inputmode="decimal" placeholder="3.500,00" required>
                </div>
                <div class="campo">
                    <label for="pq-base">Já guardado (R$)</label>
                    <input id="pq-base" type="text" inputmode="decimal" placeholder="0,00">
                </div>
                <div class="botoes">
                    <button type="submit" class="botao primario">Criar porquinho</button>
                    <button type="button" class="botao" id="pq-cancelar">Cancelar</button>
                </div>
                <p class="nota erro" id="pq-erro" role="alert" hidden></p>
            </form>
        </div>

        <p class="nota">A soma dos porquinhos nunca passa da sobra. Se passar, o Trace avisa na hora e trava o controle.</p>
    </section>


    <!-- =========================== 4. INVESTIMENTOS =========================== -->
    <section id="investimentos" class="painel-aba" role="tabpanel" aria-labelledby="aba-investimentos" hidden>
        <div class="titulo-pagina">
            <h1>Investimentos</h1>
            <p>Compare onde o dinheiro rende mais. Esta aba é independente dos porquinhos.</p>
        </div>


        <div class="inv-layout">
            <div class="card inv-form">
                <h2>Sua simulação</h2>
                <div class="campo">
                    <label for="inv-inicial">Valor inicial</label>
                    <div class="campo-moeda"><span>R$</span><input id="inv-inicial" type="text" inputmode="decimal" autocomplete="off"></div>
                </div>
                <div class="campo">
                    <label for="inv-aporte">Aporte mensal</label>
                    <div class="campo-moeda"><span>R$</span><input id="inv-aporte" type="text" inputmode="decimal" autocomplete="off"></div>
                </div>
                <div class="campo">
                    <label for="inv-prazo">Prazo</label>
                    <div class="campo-moeda"><input id="inv-prazo" type="text" inputmode="numeric" autocomplete="off"><span>meses</span></div>
                </div>

                <div class="taxas">
                    <div>
                        <strong>Taxas de referência</strong>
                        <p class="nota">Valores de exemplo. Edite para refletir o que o seu banco oferece.</p>
                    </div>
                    <div class="duas">
                        <div class="campo">
                            <label for="inv-cdi">CDI (% ao ano)</label>
                            <input id="inv-cdi" type="text" inputmode="decimal" autocomplete="off">
                        </div>
                        <div class="campo">
                            <label for="inv-poup">Poupança (% ao mês)</label>
                            <input id="inv-poup" type="text" inputmode="decimal" autocomplete="off">
                        </div>
                    </div>
                    <div class="campo">
                        <label for="inv-cdb">CDB (% do CDI)</label>
                        <input id="inv-cdb" type="text" inputmode="decimal" autocomplete="off">
                    </div>
                </div>

                <button type="button" class="botao primario grande" id="inv-simular">Simular</button>
                <p class="nota erro" id="inv-erro" role="alert" hidden></p>
                <p class="nota">Os aportes são feitos no fim de cada mês.</p>
            </div>

            <div class="inv-direita">
                <div class="linha-cards tres">
                    <div class="card compacto" id="card-parado">
                        <span class="rotulo">Parado</span>
                        <span class="valor medio" id="r-parado"></span>
                        <span class="nota">só o que você guardou</span>
                    </div>
                    <div class="card compacto" id="card-poup">
                        <span class="rotulo">Poupança <span class="chip" hidden>maior rendimento</span></span>
                        <span class="valor medio" id="r-poup"></span>
                        <span class="nota" id="r-poup-sub"></span>
                    </div>
                    <div class="card compacto" id="card-cdb">
                        <span class="rotulo"><span id="r-cdb-nome">CDB</span> <span class="chip" hidden>maior rendimento</span></span>
                        <span class="valor medio" id="r-cdb"></span>
                        <span class="nota" id="r-cdb-sub"></span>
                    </div>
                </div>

                <div class="card">
                    <div class="titulo-com-selo espalhado">
                        <h2 id="inv-titulo">Evolução do saldo</h2>
                        <div class="legenda">
                            <span><svg width="22" height="4" aria-hidden="true"><line x1="0" y1="2" x2="22" y2="2" stroke="#93A79E" stroke-width="2.5" stroke-dasharray="5 3"/></svg>Parado</span>
                            <span><svg width="22" height="4" aria-hidden="true"><line x1="0" y1="2" x2="22" y2="2" stroke="#5B9DFF" stroke-width="3"/></svg>Poupança</span>
                            <span><svg width="22" height="4" aria-hidden="true"><line x1="0" y1="2" x2="22" y2="2" stroke="#3DDC97" stroke-width="3"/></svg>CDB</span>
                        </div>
                    </div>
                    <div id="inv-grafico"></div>
                    <span class="nota">Linhas em valores brutos, antes do imposto de renda.</span>
                </div>

                <div class="duas-colunas alinhar-topo">
                    <div class="card sem-padding-x" style="flex: 2 1 420px; min-width: 0">
                        <h2 class="com-padding-x">Detalhes</h2>
                        <div id="inv-tabela"></div>
                    </div>
                    <div class="card" style="flex: 1 1 260px">
                        <h2>IR regressivo do CDB</h2>
                        <div class="lista-simples">
                            <div class="par"><span>Até 180 dias</span><strong>22,5%</strong></div>
                            <div class="par"><span>De 181 a 360 dias</span><strong>20%</strong></div>
                            <div class="par"><span>De 361 a 720 dias</span><strong>17,5%</strong></div>
                            <div class="par"><span>Acima de 720 dias</span><strong>15%</strong></div>
                        </div>
                    </div>
                </div>

                <p class="aviso-simples">Simulação feita com as taxas que você informou. Não é recomendação de investimento.</p>
            </div>
        </div>
    </section>

</main>

<footer class="rodape">
    <span>Trace · projeto de Orientação a Objetos (BMVC, Nível 4) · conta de {{usuario.email}}</span>
    <button type="button" class="link" id="btn-apagar">Apagar todos os meus dados</button>
</footer>

<div id="toast" class="toast" role="status" aria-live="polite"></div>

<script id="categorias-data" type="application/json">{{!categorias_json}}</script>
<script id="estado-data" type="application/json">{{!estado_json}}</script>
<script src="/static/js/core.js"></script>
<script src="/static/js/fatura.js"></script>
<script src="/static/js/painel.js"></script>
<script src="/static/js/porquinhos.js"></script>
<script src="/static/js/investimentos.js"></script>
<script src="/static/js/capi.js"></script>
<script src="/static/js/vendor/socket.io.min.js"></script>
<script src="/static/js/tempo-real.js"></script>

</body>
</html>
