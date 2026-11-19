<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0B0F0E">
    <title>Minha conta · Trace</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap">
    <link rel="stylesheet" type="text/css" href="/static/css/trace.css">
    <link rel="stylesheet" type="text/css" href="/static/css/acesso.css">
    <link rel="stylesheet" type="text/css" href="/static/css/conta.css">
</head>
<body>

<header class="topbar">
    <a class="marca" href="/" aria-label="Trace, voltar ao app">
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M3 20 L10 12 L15 17 L25 6" fill="none" stroke="#3DDC97" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Trace
    </a>
    <nav class="abas" aria-label="Navegação">
        <a class="aba-link" href="/">← Voltar ao app</a>
    </nav>
    <div class="conta">
        <span class="conta-nome"><span class="avatar" aria-hidden="true">{{usuario['primeiro_nome'][:1].upper()}}</span>Olá, <strong>{{usuario['primeiro_nome']}}</strong></span>
        <form method="post" action="/sair">
            <button type="submit" class="botao pequeno" id="btn-sair">Sair</button>
        </form>
    </div>
</header>

<main class="conteudo pagina-conta">
    <div class="titulo-pagina">
        <h1>Minha conta</h1>
        <p>Área restrita: só você vê esta página. Os dados abaixo vêm do Model <code>Usuario</code>.</p>
    </div>

    % if mensagem:
    <p class="mensagem sucesso" role="status">{{mensagem}}</p>
    % end
    % if erro:
    <p class="mensagem erro" role="alert">{{erro}}</p>
    % end

    <div class="grade-conta">
        <section class="card">
            <h2>Seus dados</h2>
            <dl class="dados-conta">
                <div><dt>Nome</dt><dd id="conta-nome">{{usuario['nome']}}</dd></div>
                <div><dt>E-mail</dt><dd id="conta-email">{{usuario['email']}}</dd></div>
                <div><dt>Conta criada em</dt><dd>{{criado_em}}</dd></div>
                <div><dt>Sessões abertas</dt><dd id="conta-sessoes">{{sessoes}}</dd></div>
            </dl>
        </section>

        <section class="card">
            <h2>No seu Trace</h2>
            <div class="numeros-conta">
                <div><strong id="conta-lancamentos">{{dados['lancamentos']}}</strong><span>lançamentos</span></div>
                <div><strong>{{dados['parcelados']}}</strong><span>parcelados</span></div>
                <div><strong id="conta-porquinhos">{{dados['porquinhos']}}</strong><span>porquinhos</span></div>
                <div><strong>{{limite}}</strong><span>limite do mês</span></div>
            </div>
        </section>

        <section class="card">
            <h2>Alterar nome</h2>
            <form method="post" action="/conta/nome" class="form-conta" data-form-conta>
                <label for="novo-nome">Nome</label>
                <input id="novo-nome" name="nome" type="text" required minlength="2" maxlength="60" value="{{usuario['nome']}}" autocomplete="name">
                <button type="submit" class="botao primario">Salvar nome</button>
            </form>
        </section>

        <section class="card">
            <h2>Trocar senha</h2>
            <form method="post" action="/conta/senha" class="form-conta" data-form-conta>
                <label for="senha-atual">Senha atual</label>
                <input id="senha-atual" name="atual" type="password" required autocomplete="current-password">
                <label for="senha-nova">Nova senha</label>
                <input id="senha-nova" name="nova" type="password" required minlength="6" autocomplete="new-password">
                <label for="senha-confirmacao">Repita a nova senha</label>
                <input id="senha-confirmacao" name="confirmacao" type="password" required minlength="6" autocomplete="new-password">
                <p class="nota erro" data-erro-conta role="alert" hidden></p>
                <button type="submit" class="botao primario">Trocar senha</button>
                <span class="nota">Os outros aparelhos vão precisar entrar de novo.</span>
            </form>
        </section>

        <section class="card">
            <h2>Sessões</h2>
            % if outras_sessoes:
            <p>Você também está conectada em <strong>{{outras_sessoes}}</strong> outro(s) navegador(es) ou aparelho(s).</p>
            % else:
            <p>Esta é a única sessão aberta da sua conta.</p>
            % end
            <form method="post" action="/conta/sessoes">
                <button type="submit" class="botao" id="btn-encerrar" {{'' if outras_sessoes else 'disabled'}}>Sair dos outros aparelhos</button>
            </form>
        </section>

        <section class="card perigo-zona">
            <h2>Excluir conta</h2>
            <p>Apaga a sua conta, os lançamentos, os porquinhos e as preferências. Não dá para desfazer.</p>
            <form method="post" action="/conta/excluir" class="form-conta" id="form-excluir">
                <label for="senha-excluir">Digite sua senha para confirmar</label>
                <input id="senha-excluir" name="senha" type="password" required autocomplete="current-password">
                <button type="submit" class="botao perigo" id="btn-excluir">Excluir minha conta</button>
            </form>
        </section>
    </div>
</main>

<script src="/static/js/conta.js"></script>
</body>
</html>
