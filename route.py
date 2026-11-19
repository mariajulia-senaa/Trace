# Nível 4: o eventlet troca as funções de rede do Python por versões que
# aguentam muitas conexões abertas ao mesmo tempo (Websocket). Tem que vir antes de tudo.
import eventlet
eventlet.monkey_patch()

import json
from functools import wraps
from urllib.parse import quote

from app.controllers.application import Application
from app.controllers.autenticacao import Autenticacao, ErroDeAcesso
from app.controllers.financas import ErroDeValidacao
from app.controllers.tempo_real import TempoReal
import socketio
from app.models.sessao import Sessao
from bottle import Bottle, route, run, request, static_file
from bottle import redirect, template, response, JSONPlugin


app = Bottle()
# respostas JSON com acentos legíveis ("sessão" em vez de "sess\u00e3o")
app.uninstall(JSONPlugin)
app.install(JSONPlugin(json_dumps=lambda dados: json.dumps(dados, ensure_ascii=False)))
ctl = Application()
acesso = ctl.acesso
tempo_real = TempoReal(acesso)


#-----------------------------------------------------------------------------
# Rotas:

@app.route('/static/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./app/static')


#-----------------------------------------------------------------------------
# Suas rotas aqui:

# ---------- controle de acesso ----------
def usuario_logado():
    return acesso.usuario_da_sessao(request.get_cookie(Autenticacao.COOKIE))


def abrir_sessao(token):
    response.set_cookie(Autenticacao.COOKIE, token, path='/', httponly=True, samesite='lax',
                        max_age=int(Sessao.DURACAO.total_seconds()))


@app.get('/login')
def pagina_login():
    if usuario_logado():
        redirect('/')
    aviso = 'Conta criada! Agora é só entrar.' if request.query.get('criada') else None
    if request.query.get('saiu'):
        aviso = 'Você saiu da sua conta.'
    if request.query.get('senha'):
        aviso = 'Senha trocada. Entre de novo com a senha nova.'
    if request.query.get('excluida'):
        aviso = 'Sua conta foi excluída. Até a próxima!'
    if request.query.get('conta'):
        aviso = 'Entre para ver a sua conta.'
    return ctl.render('login', aviso=aviso, email=request.query.get('email', ''))


@app.post('/login')
def fazer_login():
    email = request.forms.getunicode('email', '')
    try:
        usuario, token = acesso.entrar(email, request.forms.getunicode('senha', ''))
    except ErroDeAcesso as erro:
        response.status = 401
        return ctl.render('login', erro=str(erro), email=email)
    abrir_sessao(token)
    redirect('/')


@app.get('/cadastro')
def pagina_cadastro():
    if usuario_logado():
        redirect('/')
    return ctl.render('cadastro')


@app.post('/cadastro')
def fazer_cadastro():
    f = request.forms
    nome, email = f.getunicode('nome', ''), f.getunicode('email', '')
    try:
        acesso.cadastrar(nome, email, f.getunicode('senha', ''), f.getunicode('confirmacao', ''))
    except ErroDeAcesso as erro:
        response.status = 400
        return ctl.render('cadastro', erro=str(erro), nome=nome, email=email)
    redirect('/login?criada=1&email=' + quote(email.strip().lower()))


@app.post('/sair')
def sair():
    usuario = usuario_logado()
    acesso.sair(request.get_cookie(Autenticacao.COOKIE))
    if usuario:
        tempo_real.encerrar_sessao(usuario.id)
    response.delete_cookie(Autenticacao.COOKIE, path='/')
    redirect('/login?saiu=1')


# ---------- Minha conta (área restrita, CRUD do Usuario) ----------
MENSAGENS_CONTA = {
    'nome': 'Nome atualizado.',
    'sessoes': 'Pronto: os outros aparelhos foram desconectados.',
    'senha': 'Senha trocada. Os outros aparelhos vão precisar entrar de novo.'
}

def token_atual():
    return request.get_cookie(Autenticacao.COOKIE)


@app.get('/conta')
def pagina_conta():
    usuario = usuario_logado()
    if usuario is None:
        redirect('/login?conta=1')
    return ctl.render('conta', usuario=usuario, token=token_atual(),
                      mensagem=MENSAGENS_CONTA.get(request.query.get('ok')))


def acao_da_conta(funcao):
    """Executa uma ação da conta; se der erro, mostra a página com a mensagem."""
    usuario = usuario_logado()
    if usuario is None:
        redirect('/login?conta=1')
    try:
        return funcao(usuario)
    except ErroDeAcesso as erro:
        response.status = 400
        return ctl.render('conta', usuario=acesso.usuarios.buscar(usuario.id), token=token_atual(), erro=str(erro))


@app.post('/conta/nome')
def conta_nome():
    def alterar(usuario):
        acesso.alterar_nome(usuario, request.forms.getunicode('nome', ''))
        redirect('/conta?ok=nome')
    return acao_da_conta(alterar)


@app.post('/conta/senha')
def conta_senha():
    def trocar(usuario):
        f = request.forms
        acesso.trocar_senha(usuario, f.getunicode('atual', ''), f.getunicode('nova', ''),
                            f.getunicode('confirmacao', ''), token_atual())
        tempo_real.encerrar_sessao(usuario.id)     # as outras telas conferem a sessão
        redirect('/conta?ok=senha')
    return acao_da_conta(trocar)


@app.post('/conta/sessoes')
def conta_sessoes():
    def encerrar(usuario):
        acesso.encerrar_outras_sessoes(usuario, token_atual())
        tempo_real.encerrar_sessao(usuario.id)
        redirect('/conta?ok=sessoes')
    return acao_da_conta(encerrar)


@app.post('/conta/excluir')
def conta_excluir():
    def excluir(usuario):
        acesso.excluir_conta(usuario, request.forms.getunicode('senha', ''))
        tempo_real.encerrar_sessao(usuario.id)
        response.delete_cookie(Autenticacao.COOKIE, path='/')
        redirect('/login?excluida=1')
    return acao_da_conta(excluir)


# ---------- página: apresentação (sem login) ou app (área restrita) ----------
@app.route('/')
@app.route('/trace')
def action_trace():
    usuario = usuario_logado()
    if usuario is None:
        return ctl.render('inicio')      # apresentação + entrar/criar conta
    return ctl.render('trace', usuario=usuario, mes=request.query.get('mes'))


# ---------- API (JSON) usada pelo JavaScript da página ----------
def api(aviso=None):
    """Só responde para quem está logado (senão 401) e entrega à rota o
    controller de finanças daquela pessoa. Erros viram JSON 400/404.

    Nível 4: se a rota muda dados, 'aviso' é a frase enviada pelo Websocket
    às outras telas abertas da mesma pessoa, que se atualizam sozinhas."""
    def decorador(funcao):
        @wraps(funcao)
        def envolvida(*args, **kwargs):
            response.content_type = 'application/json; charset=utf-8'
            usuario = usuario_logado()
            if usuario is None:
                response.status = 401
                return {'erro': 'Sua sessão terminou. Entre de novo.'}
            try:
                resultado = funcao(ctl.financas_de(usuario), *args, **kwargs)
            except ErroDeValidacao as erro:
                response.status = 400
                return {'erro': str(erro)}
            except KeyError:
                response.status = 404
                return {'erro': 'Registro não encontrado.'}
            if aviso:
                texto = aviso(resultado) if callable(aviso) else aviso
                tempo_real.avisar_mudanca(usuario.id, texto, request.get_header('X-Trace-Cliente'))
            return resultado
        return envolvida
    return decorador


def corpo():
    return request.json or {}


def brl(valor):
    return 'R$ ' + '{:,.2f}'.format(valor).replace(',', 'X').replace('.', ',').replace('X', '.')


@app.get('/api/estado')
@api()
def api_estado(financas):
    return financas.estado(request.query.get('mes'))


# Lançamentos: CRUD completo
@app.post('/api/lancamentos')
@api(lambda r: 'Novo lançamento: %s (%s)' % (r['lancamento']['descricao'], brl(r['lancamento']['valor'])))
def api_criar_lancamento(financas):
    l = financas.criar_lancamento(corpo())
    return {'lancamento': l.para_tela()}

@app.put('/api/lancamentos/<id:int>')
@api(lambda r: 'Lançamento alterado: %s' % r['lancamento']['descricao'])
def api_atualizar_lancamento(financas, id):
    l, parecidos = financas.atualizar_lancamento(id, corpo())
    return {'lancamento': l.para_tela(), 'parecidos': parecidos}

@app.delete('/api/lancamentos/<id:int>')
@api('Um lançamento foi removido.')
def api_remover_lancamento(financas, id):
    financas.remover_lancamento(id)
    return {'ok': True}

@app.delete('/api/meses/<mes>')
@api('Os lançamentos de um mês foram apagados.')
def api_limpar_mes(financas, mes):
    return {'removidos': financas.limpar_mes(mes)}

@app.post('/api/importar')
@api(lambda r: '%d lançamento(s) importado(s).' % r['criados'])
def api_importar(financas):
    dados = corpo()
    novos, ignoradas = financas.importar(dados.get('texto', ''), dados.get('mes'))
    return {'criados': len(novos), 'ignoradas': ignoradas}

@app.post('/api/exemplo')
@api('A fatura de exemplo foi carregada.')
def api_exemplo(financas):
    return {'criados': financas.carregar_exemplo()}


# Preferências (limite do mês e limites por categoria)
@app.put('/api/preferencias')
@api(lambda r: 'Limite do mês: %s' % brl(r['preferencias']['limite']))
def api_preferencias(financas):
    p = financas.atualizar_preferencias(corpo()).to_dict()
    p.pop('usuario_id', None)
    return {'preferencias': p}


# Porquinhos: CRUD completo
@app.post('/api/porquinhos')
@api(lambda r: 'Novo porquinho: %s' % r['porquinho']['nome'])
def api_criar_porquinho(financas):
    return {'porquinho': financas.criar_porquinho(corpo()).para_tela()}

@app.put('/api/porquinhos/<id:int>')
@api(lambda r: '%s agora recebe %s por mês.' % (r['porquinho']['nome'], brl(r['porquinho']['aporte'])))
def api_atualizar_porquinho(financas, id):
    p, aviso = financas.atualizar_porquinho(id, corpo())
    return {'porquinho': p.para_tela(), 'aviso': aviso}

@app.delete('/api/porquinhos/<id:int>')
@api('Um porquinho foi removido.')
def api_remover_porquinho(financas, id):
    financas.remover_porquinho(id)
    return {'ok': True}


# Investimentos: cálculo nos Models (Investimento -> Parado, Poupança, CDB)
@app.post('/api/investimentos')
@api()
def api_investimentos(financas):
    return financas.simular_investimentos(corpo())


@app.delete('/api/tudo')
@api('Todos os dados foram apagados.')
def api_apagar_tudo(financas):
    financas.apagar_tudo()
    return {'ok': True}


#-----------------------------------------------------------------------------
# Nível 4: o Socket.IO atende o Websocket em /socket.io/ e passa todo o
# resto (páginas, arquivos estáticos e API) para o Bottle.

application = socketio.WSGIApp(tempo_real.sio, app)


if __name__ == '__main__':

    print('Trace (Nível 4) em http://0.0.0.0:8080/ com Websocket')
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 8080)), application)
