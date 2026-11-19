<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0B0F0E">
    <meta name="description" content="Trace: organize a fatura do cartão, acompanhe parcelas, crie metas e compare investimentos.">
    <title>Trace · veja pra onde foi sua fatura</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap">
    <link rel="stylesheet" type="text/css" href="/static/css/trace.css">
    <link rel="stylesheet" type="text/css" href="/static/css/capi.css">
    <link rel="stylesheet" type="text/css" href="/static/css/inicio.css">
</head>
<body class="inicio">

<a class="pular" href="#conteudo">Pular para o conteúdo</a>

<!-- =============================================================== topo -->
<header class="topo-inicio" id="topo">
    <a class="marca" href="/" aria-label="Trace, página inicial">
        <svg class="marca-icone" width="30" height="30" viewBox="0 0 28 28" aria-hidden="true"><path d="M3 20 L10 12 L15 17 L25 6" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="6" r="2.6" fill="#3DDC97"/></svg>
        Trace
    </a>
    <nav class="topo-links" aria-label="Seções">
        <a href="#produto">Produto</a>
        <a href="#cuidado">Como cuidamos</a>
        <a href="#duvidas">Dúvidas</a>
    </nav>
    <div class="caixa-acesso" role="group" aria-label="Acesso">
        <button type="button" class="botao-acesso" data-abrir="entrar">Entrar</button>
        <button type="button" class="botao-acesso cheio" data-abrir="cadastrar">Criar conta</button>
    </div>
</header>

<main id="conteudo">

<!-- =============================================================== abertura -->
<section class="hero">
    <div class="hero-texto">
        <span class="selo-hero revelar"><i></i>Fatura · parcelas · metas · investimentos</span>
        <h1 class="revelar">Sua fatura conta uma história. <span class="grifo">O Trace lê pra você.</span></h1>
        <p class="revelar">Separe os gastos do cartão em categorias, acompanhe cada parcela mês a mês e transforme a sobra em metas e investimentos. Sem planilha e sem susto no fim do mês.</p>
        <div class="hero-acoes revelar">
            <button type="button" class="cta" data-abrir="cadastrar">Criar conta grátis
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <button type="button" class="cta-link" data-abrir="entrar">Já tenho conta</button>
        </div>
        <ul class="hero-provas revelar">
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>Sem senha de banco</li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>Parcelas automáticas</li>
            <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>No celular e no computador</li>
        </ul>
    </div>

    <div class="hero-arte arte arte-hero" data-paralaxe>
        <div class="arte-fundo" aria-hidden="true">
            <span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span><span class="bolha b4"></span>
            <span class="folha f1"></span><span class="folha f2"></span><span class="folha f3"></span>
        </div>
        <div class="camada card-flutuante card-painel" data-profundidade="0.7" aria-hidden="true">
            <div class="cf-topo">
                <span class="cf-icone violeta"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/></svg></span>
                <span>Gasto por categoria</span>
            </div>
            <div class="rosca-area">
                <div class="rosca" aria-hidden="true"><span>R$ 1.128</span></div>
                <ul class="rosca-legenda">
                    <li><i style="background:#3DDC97"></i>Alimentação<b>36%</b></li>
                    <li><i style="background:#5B9DFF"></i>Transporte<b>21%</b></li>
                    <li><i style="background:#7A8A84"></i>Outros<b>13%</b></li>
                    <li><i style="background:#B392F0"></i>Assinaturas<b>9%</b></li>
                </ul>
            </div>
        </div>
        <span class="icone-solto i-moeda" data-profundidade="1.8" aria-hidden="true">R$</span>
        <span class="icone-solto i-pct" data-profundidade="2.2" aria-hidden="true">%</span>

        <div class="camada card-flutuante card-fatura" data-profundidade="1.1">
            <div class="cf-topo">
                <span class="cf-icone"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg></span>
                <span>Fatura de novembro</span>
                <span class="cf-chip atencao">75% do limite</span>
            </div>
            <span class="cf-rotulo">Total do mês</span>
            <strong class="cf-total" data-contar="1128.85">R$ 1.128,85</strong>
            <div class="cf-barra" aria-hidden="true">
                <span style="--w:36%;--c:#3DDC97"></span><span style="--w:21%;--c:#5B9DFF"></span><span style="--w:13%;--c:#7A8A84"></span><span style="--w:30%;--c:#E8A06B"></span>
            </div>
            <ul class="cf-linhas">
                <li><i style="background:#3DDC97"></i><span>Alimentação<small>36% dos gastos</small></span><b>R$ 412,45</b></li>
                <li><i style="background:#5B9DFF"></i><span>Transporte<small>21% dos gastos</small></span><b>R$ 235,10</b></li>
                <li><i style="background:#7A8A84"></i><span>Outros<small>13% dos gastos</small></span><b>R$ 149,90</b></li>
            </ul>
        </div>

        <div class="camada chip-flutuante chip-a" data-profundidade="1.6" aria-hidden="true">
            <span class="chip-icone ambar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></span>
            <span><b>Parcela 3/6</b><small>LOJA XYZ · R$ 149,90</small></span>
        </div>
        <div class="camada chip-flutuante chip-b" data-profundidade="2" aria-hidden="true">
            <span class="chip-icone rosa"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></span>
            <span><b>+ R$ 150,00</b><small>no porquinho Viagem</small></span>
        </div>
    </div>
</section>

<!-- =============================================================== faixa -->
<div class="faixa-frases" aria-hidden="true">
    <div class="faixa-trilho">
        % for _ in range(2):
        <span>Fatura sob controle</span><i>✦</i><span>Parcela sem susto</span><i>✦</i><span>Cada real com nome</span><i>✦</i><span>Sobra que vira meta</span><i>✦</i><span>Investimento sem mistério</span><i>✦</i>
        % end
    </div>
</div>

<!-- =============================================================== produto -->
<section id="produto" class="produto">
    <div class="secao-cabeca revelar">
        <span class="etiqueta-secao">O que o Trace faz</span>
        <h2>Do primeiro gasto da fatura até o primeiro investimento.</h2>
    </div>

    <!-- 01 fatura -->
    <article class="bloco-produto">
        <div class="bloco-texto revelar">
            <span class="numero">01 · Fatura</span>
            <h3>Cada compra no seu devido lugar.</h3>
            <p>Lance à mão, cole o texto da fatura ou importe um CSV. O Trace separa tudo em categorias sozinho e aprende com cada correção que você faz.</p>
            <ul class="lista-check">
                <li>Data no calendário, valor e categoria em uma tabela só</li>
                <li>Semáforo do limite: verde, amarelo e vermelho</li>
            </ul>
        </div>
        <div class="arte arte-azul bloco-arte revelar" data-paralaxe>
            <div class="arte-fundo" aria-hidden="true"><span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span></div>
            <div class="camada mini-card principal mc-linhas" data-profundidade="0.8" aria-hidden="true">
                <span class="mc-titulo">Lançamentos de novembro</span>
                <div class="mc-linha"><span>UBER *TRIP</span><em style="--c:#5B9DFF">Transporte</em></div>
                <div class="mc-linha"><span>IFOOD *LANCHES</span><em style="--c:#3DDC97">Alimentação</em></div>
                <div class="mc-linha"><span>NETFLIX.COM</span><em style="--c:#B392F0">Assinaturas</em></div>
                <div class="mc-linha"><span>Vestido de formatura</span><em style="--c:#E879F9">Moda e beleza</em></div>
            </div>
            <div class="camada mini-card canto mc-semaforo" data-profundidade="1.6" aria-hidden="true">
                <span class="mc-titulo">Limite do mês</span>
                <div class="mc-sem-topo"><em class="selo-mini">Atenção</em><b>75%</b></div>
                <i class="mc-trilho"><em style="--w:75%;--c:#F5B84B"></em></i>
                <small>Restam R$ 371,15</small>
            </div>
        </div>
    </article>

    <!-- 02 parcelas -->
    <article class="bloco-produto invertido">
        <div class="bloco-texto revelar">
            <span class="numero">02 · Parcelas</span>
            <h3>Parcelou? O Trace lembra por você.</h3>
            <p>Compre em 3x hoje e veja as próximas parcelas aparecerem sozinhas nos meses seguintes. Você sabe quanto do limite de dezembro já está tomado antes de dezembro chegar.</p>
            <ul class="lista-check">
                <li>Filtro por mês, para trás e para a frente</li>
                <li>Quanto falta pagar de cada compra parcelada</li>
            </ul>
        </div>
        <div class="arte arte-ambar bloco-arte revelar" data-paralaxe>
            <div class="arte-fundo" aria-hidden="true"><span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span></div>
            <div class="camada mini-card principal mc-parcela" data-profundidade="0.8" aria-hidden="true">
                <span class="mc-titulo">Compra parcelada</span>
                <div class="mc-parc-topo"><span>Vestido de formatura</span><b>2 de 3</b></div>
                <div class="mc-segmentos"><span class="pago"></span><span class="pago"></span><span></span></div>
                <div class="mc-parc-rodape"><span>R$ 133,34 por mês</span><span>faltam R$ 133,34 · última em jan</span></div>
            </div>
            <div class="camada mini-card canto mc-meses" data-profundidade="1.6" aria-hidden="true">
                <span class="mc-titulo">Já comprometido</span>
                <div class="mc-colunas">
                    <div><b style="--h:84%"></b><small>dez</small></div>
                    <div><b style="--h:84%"></b><small>jan</small></div>
                    <div><b style="--h:55%"></b><small>fev</small></div>
                    <div><b style="--h:6%"></b><small>mar</small></div>
                </div>
            </div>
        </div>
    </article>

    <!-- 03 painel -->
    <article class="bloco-produto">
        <div class="bloco-texto revelar">
            <span class="numero">03 · Painel</span>
            <h3>O mês inteiro em uma olhada.</h3>
            <p>Gráfico por categoria, limite de cada uma, ritmo de gasto e os maiores vilões do mês. Você entende em segundos o que levaria uma tarde de planilha.</p>
            <ul class="lista-check">
                <li>Limites por categoria que você mesmo ajusta</li>
                <li>Frases que explicam o que os números dizem</li>
            </ul>
        </div>
        <div class="arte arte-violeta bloco-arte revelar" data-paralaxe>
            <div class="arte-fundo" aria-hidden="true"><span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span></div>
            <div class="camada mini-card principal mc-rosca" data-profundidade="0.8" aria-hidden="true">
                <span class="mc-titulo">Gasto por categoria</span>
                <div class="rosca-area">
                    <div class="rosca" aria-hidden="true"><span>R$ 1.128</span></div>
                    <ul class="rosca-legenda">
                        <li><i style="background:#3DDC97"></i>Alimentação<b>36%</b></li>
                        <li><i style="background:#5B9DFF"></i>Transporte<b>21%</b></li>
                        <li><i style="background:#7A8A84"></i>Outros<b>13%</b></li>
                        <li><i style="background:#B392F0"></i>Assinaturas<b>9%</b></li>
                    </ul>
                </div>
            </div>
            <div class="camada mini-card canto mc-frase" data-profundidade="1.6" aria-hidden="true">
                <span class="mc-titulo">Insight do mês</span>
                <p><b>Alimentação</b> levou 36% da fatura. Cortar dois pedidos de delivery já devolve R$ 100.</p>
            </div>
        </div>
    </article>

    <!-- 04 porquinhos -->
    <article class="bloco-produto invertido">
        <div class="bloco-texto revelar">
            <span class="numero">04 · Porquinhos</span>
            <h3>A sobra vira plano, não vira pó.</h3>
            <p>Divida o que sobrou do limite entre as suas metas, como uma viagem, um notebook ou a reserva de emergência, e veja em quantos meses cada uma chega lá. Quem cuida delas é a <strong>Capi</strong>, a capivara mais tranquila com dinheiro que você vai conhecer.</p>
            <ul class="lista-check">
                <li>Vários porquinhos ao mesmo tempo</li>
                <li>Nunca distribui mais do que realmente sobrou</li>
            </ul>
        </div>
        <div class="arte arte-rosa bloco-arte revelar" data-paralaxe>
            <div class="arte-fundo" aria-hidden="true"><span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span></div>
            <div class="camada capi-palco" data-profundidade="0.5">
                % include('app/views/html/_capi', pose='porquinho', rotulo=' abraçando um porquinho')
            </div>
            <div class="camada mini-card mc-metas" data-profundidade="1.3" aria-hidden="true">
                <div class="mc-meta"><span>Viagem para o Nordeste</span><b>41%</b><i><em style="--w:41%;--c:#5B9DFF"></em></i></div>
                <div class="mc-meta"><span>Notebook de trabalho</span><b>26%</b><i><em style="--w:26%;--c:#3DDC97"></em></i></div>
                <div class="mc-meta"><span>Reserva de emergência</span><b>90%</b><i><em style="--w:90%;--c:#E8A06B"></em></i></div>
            </div>
        </div>
    </article>

    <!-- 05 investimentos -->
    <article class="bloco-produto">
        <div class="bloco-texto revelar">
            <span class="numero">05 · Investimentos</span>
            <h3>Dinheiro parado também envelhece.</h3>
            <p>Compare deixar o dinheiro parado, na poupança ou num CDB, com o imposto de renda já descontado, mês a mês. Você escolhe as taxas e vê a diferença no fim do prazo.</p>
            <ul class="lista-check">
                <li>Gráfico e tabela lado a lado</li>
                <li>Imposto regressivo calculado para cada depósito</li>
            </ul>
        </div>
        <div class="arte arte-verde bloco-arte revelar" data-paralaxe>
            <div class="arte-fundo" aria-hidden="true"><span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span></div>
            <div class="camada mini-card principal mc-linhas-grafico" data-profundidade="0.8" aria-hidden="true">
                <span class="mc-titulo">Em 12 meses</span>
                <svg viewBox="0 0 200 80" class="mc-grafico">
                    <path class="lg parado" d="M0 72 L200 54"/>
                    <path class="lg poup" d="M0 72 C70 62 140 50 200 44"/>
                    <path class="lg cdb" d="M0 72 C60 60 130 40 200 26"/>
                </svg>
                <div class="mc-legenda"><span><i style="background:#3DDC97"></i>CDB</span><span><i style="background:#5B9DFF"></i>Poupança</span><span><i style="background:#93A79E"></i>Parado</span></div>
            </div>
            <div class="camada mini-card canto mc-resultado" data-profundidade="1.6" aria-hidden="true">
                <span class="mc-titulo">CDB, 100% do CDI</span>
                <b>R$ 5.945,64</b>
                <small><em>+ R$ 121,62</em> que a poupança, já sem o IR</small>
            </div>
        </div>
    </article>
</section>

<!-- =============================================================== como cuida -->
<section id="cuidado" class="cuidado" data-interativo>
    <div class="icones-soltos" aria-hidden="true">
        <span class="solto" style="--x:8%;--y:18%">R$</span>
        <span class="solto" style="--x:88%;--y:14%">%</span>
        <span class="solto moeda" style="--x:14%;--y:78%"></span>
        <span class="solto moeda" style="--x:92%;--y:70%"></span>
        <span class="solto" style="--x:4%;--y:46%">✦</span>
        <span class="solto" style="--x:70%;--y:92%">✦</span>
        <span class="solto moeda" style="--x:32%;--y:94%"></span>
    </div>
    <div class="secao-cabeca revelar">
        <span class="etiqueta-secao">Como o Trace cuida de você</span>
        <h2>Um olho na fatura, outro no seu futuro.</h2>
        <p class="dica-toque">Passe o mouse ou arraste o dedo por aqui: os blocos acompanham você.</p>
    </div>
    <div class="grade-cuidado">
        <div class="bloco-cuidado revelar" data-profundidade="1">
            <span class="bc-icone verde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10M4 12h16M4 17h7"/><circle cx="18" cy="7" r="2"/></svg></span>
            <h3>Categoriza sozinho</h3>
            <p>Reconhece iFood, Uber, Netflix, farmácia e muito mais assim que você lança.</p>
        </div>
        <div class="bloco-cuidado revelar" data-profundidade="1.6">
            <span class="bc-icone ambar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg></span>
            <h3>Avisa antes de estourar</h3>
            <p>O semáforo muda de cor quando você passa de 70% e de 100% do limite.</p>
        </div>
        <div class="bloco-cuidado revelar" data-profundidade="1.2">
            <span class="bc-icone azul"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 15h3"/></svg></span>
            <h3>Lembra das parcelas</h3>
            <p>Cada compra parcelada aparece sozinha nos meses seguintes, até a última.</p>
        </div>
        <div class="bloco-cuidado revelar" data-profundidade="1.8">
            <span class="bc-icone violeta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.1L12 17.4 6.5 20.3l1-6.1L3 9.9 9 9z"/></svg></span>
            <h3>Aprende com você</h3>
            <p>Corrigiu uma categoria? O Trace aplica a regra a todos os lançamentos parecidos.</p>
        </div>
        <div class="bloco-cuidado revelar" data-profundidade="1.3">
            <span class="bc-icone rosa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>
            <h3>Seus dados são só seus</h3>
            <p>Cada conta enxerga apenas os próprios lançamentos, e a senha é guardada com hash.</p>
        </div>
        <div class="bloco-cuidado revelar" data-profundidade="1.7">
            % if nivel >= 4:
            <span class="bc-icone verde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/></svg></span>
            <h3>Ao vivo em todas as telas</h3>
            <p>Lançou no celular? O computador se atualiza na hora, sem recarregar a página.</p>
            % else:
            <span class="bc-icone verde"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg></span>
            <h3>No bolso e na mesa</h3>
            <p>A mesma conta funciona no celular e no computador, com o layout certo para cada tela.</p>
            % end
        </div>
    </div>
</section>

<!-- =============================================================== dúvidas -->
<section id="duvidas" class="duvidas">
    <div class="duvidas-lado revelar">
        <span class="etiqueta-secao">Dúvidas frequentes</span>
        <h2>Perguntas que todo mundo faz.</h2>
        <p>Não achou o que procurava? Crie sua conta e explore com a fatura de exemplo: nada do que você testar sai do Trace.</p>
    </div>
    <div class="lista-duvidas">
        <details class="duvida revelar" open>
            <summary>O Trace é gratuito?</summary>
            <div><p>Sim. O Trace é um projeto acadêmico da disciplina de Orientação a Objetos. Criar conta e usar todas as abas não custa nada.</p></div>
        </details>
        <details class="duvida revelar">
            <summary>Preciso conectar a conta do meu banco?</summary>
            <div><p>Não. Você lança os gastos à mão, cola o texto da fatura ou importa um arquivo CSV. O Trace nunca pede senha de banco ou de cartão.</p></div>
        </details>
        <details class="duvida revelar">
            <summary>Onde ficam os meus dados?</summary>
            <div><p>No servidor do Trace, separados por conta: cada pessoa só enxerga os próprios lançamentos, porquinhos e preferências. A sua senha é guardada com hash, nunca do jeito que você digitou.</p></div>
        </details>
        <details class="duvida revelar">
            <summary>Como funciona o parcelamento?</summary>
            <div><p>Ao lançar uma compra, escolha em quantas vezes foi e digite o valor de cada parcela, como aparece na fatura. As parcelas seguintes entram sozinhas nos próximos meses, e o Trace mostra quanto do limite futuro já está comprometido.</p></div>
        </details>
        <details class="duvida revelar">
            <summary>E se o Trace errar a categoria?</summary>
            <div><p>É só trocar na própria tabela. O Trace aprende a regra e aplica a mesma categoria aos lançamentos parecidos, inclusive aos dos outros meses.</p></div>
        </details>
        <details class="duvida revelar">
            <summary>Os resultados dos investimentos são garantidos?</summary>
            <div><p>Não. A aba Investimentos é uma simulação com as taxas que você informa, para ajudar a comparar cenários. Ela não é uma recomendação de investimento.</p></div>
        </details>
        <details class="duvida revelar">
            <summary>Funciona no celular?</summary>
            % if nivel >= 4:
            <div><p>Sim. O layout se adapta à tela e, se você abrir a mesma conta em dois aparelhos, os dois se atualizam juntos em tempo real.</p></div>
            % else:
            <div><p>Sim. O layout se adapta à tela, e você entra com a mesma conta no celular e no computador.</p></div>
            % end
        </details>
        <details class="duvida revelar">
            <summary>Posso apagar tudo o que lancei?</summary>
            <div><p>Pode. No rodapé do app há a opção "Apagar todos os meus dados", que remove os lançamentos, os porquinhos e as preferências da sua conta.</p></div>
        </details>
    </div>
</section>

<!-- =============================================================== chamada final -->
<section class="final">
    <div class="arte arte-hero final-arte revelar" data-paralaxe>
        <div class="arte-fundo" aria-hidden="true"><span class="bolha b1"></span><span class="bolha b2"></span><span class="bolha b3"></span><span class="bolha b4"></span></div>
        <div class="final-conteudo">
            <h2>Bora ver pra onde foi a sua fatura?</h2>
            <p>Leva menos de um minuto para criar a conta e começar pela fatura deste mês.</p>
            <button type="button" class="cta" data-abrir="cadastrar">Criar conta grátis
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
        </div>
        <div class="camada chip-flutuante final-chip-a" data-profundidade="1.4" aria-hidden="true">
            <span class="chip-icone ambar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></span>
            <span><b>Dezembro</b><small>R$ 382,99 já em parcelas</small></span>
        </div>
        <div class="camada chip-flutuante final-chip-b" data-profundidade="2" aria-hidden="true">
            <span class="chip-icone verde"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></span>
            <span><b>Tudo tranquilo</b><small>45% do limite usado</small></span>
        </div>
        <span class="icone-solto final-moeda" data-profundidade="2.4" aria-hidden="true">R$</span>
    </div>
</section>
</main>

<footer class="rodape-inicio">
    <a class="marca pequena" href="/"><svg width="22" height="22" viewBox="0 0 28 28" aria-hidden="true"><path d="M3 20 L10 12 L15 17 L25 6" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Trace</a>
    <span>Projeto de Orientação a Objetos · BMVC Nível {{nivel}}</span>
    <span>A Capi é a mascote dos Porquinhos do Trace. Ilustração original do projeto.</span>
</footer>

<!-- =============================================================== gaveta de acesso -->
<div class="gaveta{{' aberta' if modo else ''}}" id="gaveta" data-modo="{{modo or 'entrar'}}" {{'' if modo else 'hidden'}}>
    <div class="gaveta-fundo" data-fechar></div>
    <div class="gaveta-painel" role="dialog" aria-modal="true" aria-labelledby="gaveta-titulo">
        <button type="button" class="gaveta-fechar" data-fechar aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        <div class="gaveta-marca" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 28 28"><path d="M3 20 L10 12 L15 17 L25 6" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="6" r="2.6" fill="#3DDC97"/></svg>
            <span>Trace</span>
        </div>
        <h2 id="gaveta-titulo" class="sr-only">Acesso ao Trace</h2>

        <div class="abas-acesso" role="tablist" aria-label="Entrar ou criar conta">
            <button type="button" role="tab" id="aba-entrar" aria-controls="form-entrar" data-modo="entrar">Entrar</button>
            <button type="button" role="tab" id="aba-cadastrar" aria-controls="form-cadastrar" data-modo="cadastrar">Criar conta</button>
            <span class="abas-indicador" aria-hidden="true"></span>
        </div>

        <!-- entrar -->
        <form method="post" action="/login" class="form-acesso" id="form-entrar" role="tabpanel" aria-labelledby="aba-entrar" novalidate data-form-acesso>
            <p class="gaveta-sub">Que bom te ver de novo. Use o e-mail e a senha da sua conta.</p>
            % if aviso and modo == 'entrar':
            <p class="mensagem sucesso" role="status">{{aviso}}</p>
            % end
            % if erro and modo == 'entrar':
            <p class="mensagem erro" role="alert">{{erro}}</p>
            % end
            <div class="campo">
                <label for="email">E-mail</label>
                <input id="email" name="email" type="email" autocomplete="email" required value="{{email if modo == 'entrar' else ''}}">
            </div>
            <div class="campo">
                <label for="senha">Senha</label>
                <div class="campo-senha">
                    <input id="senha" name="senha" type="password" autocomplete="current-password" required minlength="6" data-senha>
                    <button type="button" class="mostrar-senha" data-mostrar="senha" aria-label="Mostrar senha" aria-pressed="false">Mostrar</button>
                </div>
            </div>
            <p class="nota erro" data-erro-form role="alert" hidden></p>
            <button type="submit" class="cta largo">Entrar</button>
        </form>

        <!-- cadastrar -->
        <form method="post" action="/cadastro" class="form-acesso" id="form-cadastrar" role="tabpanel" aria-labelledby="aba-cadastrar" novalidate data-form-acesso>
            <p class="gaveta-sub">Leva menos de um minuto. Sua senha é guardada com hash, nunca do jeito que você digitou.</p>
            % if erro and modo == 'cadastrar':
            <p class="mensagem erro" role="alert">{{erro}}</p>
            % end
            <div class="campo">
                <label for="cad-nome">Nome</label>
                <input id="cad-nome" name="nome" type="text" autocomplete="name" required minlength="2" maxlength="60" value="{{nome}}">
            </div>
            <div class="campo">
                <label for="cad-email">E-mail</label>
                <input id="cad-email" name="email" type="email" autocomplete="email" required value="{{email if modo == 'cadastrar' else ''}}">
            </div>
            <div class="campo">
                <label for="cad-senha">Senha</label>
                <div class="campo-senha">
                    <input id="cad-senha" name="senha" type="password" autocomplete="new-password" required minlength="6" data-senha data-forca>
                    <button type="button" class="mostrar-senha" data-mostrar="cad-senha" aria-label="Mostrar senha" aria-pressed="false">Mostrar</button>
                </div>
                <div class="forca" aria-hidden="true"><span data-forca-barra></span></div>
                <span class="nota" data-forca-texto>Pelo menos 6 caracteres.</span>
            </div>
            <div class="campo">
                <label for="cad-confirmacao">Repita a senha</label>
                <input id="cad-confirmacao" name="confirmacao" type="password" autocomplete="new-password" required minlength="6" data-senha data-confirmacao>
            </div>
            <p class="nota erro" data-erro-form role="alert" hidden></p>
            <button type="submit" class="cta largo">Criar conta</button>
        </form>
    </div>
</div>

<script src="/static/js/inicio.js"></script>
</body>
</html>
