import json
from functools import wraps

from app.controllers.application import Application
from app.controllers.financas import ErroDeValidacao
from bottle import Bottle, route, run, request, static_file
from bottle import redirect, template, response, JSONPlugin


app = Bottle()
# respostas JSON com acentos legíveis ("sessão" em vez de "sess\u00e3o")
app.uninstall(JSONPlugin)
app.install(JSONPlugin(json_dumps=lambda dados: json.dumps(dados, ensure_ascii=False)))
ctl = Application()
financas = ctl.financas


#-----------------------------------------------------------------------------
# Rotas:

@app.route('/static/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root='./app/static')


#-----------------------------------------------------------------------------
# Suas rotas aqui:

# ---------- página ----------
@app.route('/')
@app.route('/trace')
def action_trace():
    return ctl.render('trace', mes=request.query.get('mes'))


# ---------- API (JSON) usada pelo JavaScript da página ----------
def api(funcao):
    """Transforma erros em respostas JSON: 400 (dado inválido) e 404 (não achou)."""
    @wraps(funcao)
    def envolvida(*args, **kwargs):
        response.content_type = 'application/json; charset=utf-8'
        try:
            return funcao(*args, **kwargs)
        except ErroDeValidacao as erro:
            response.status = 400
            return {'erro': str(erro)}
        except KeyError:
            response.status = 404
            return {'erro': 'Registro não encontrado.'}
    return envolvida


def corpo():
    return request.json or {}


@app.get('/api/estado')
@api
def api_estado():
    return financas.estado(request.query.get('mes'))


# Lançamentos: CRUD completo
@app.post('/api/lancamentos')
@api
def api_criar_lancamento():
    l = financas.criar_lancamento(corpo())
    return {'lancamento': l.to_dict()}

@app.put('/api/lancamentos/<id:int>')
@api
def api_atualizar_lancamento(id):
    l, parecidos = financas.atualizar_lancamento(id, corpo())
    return {'lancamento': l.to_dict(), 'parecidos': parecidos}

@app.delete('/api/lancamentos/<id:int>')
@api
def api_remover_lancamento(id):
    financas.remover_lancamento(id)
    return {'ok': True}

@app.delete('/api/meses/<mes>')
@api
def api_limpar_mes(mes):
    return {'removidos': financas.limpar_mes(mes)}

@app.post('/api/importar')
@api
def api_importar():
    dados = corpo()
    novos, ignoradas = financas.importar(dados.get('texto', ''), dados.get('mes'))
    return {'criados': len(novos), 'ignoradas': ignoradas}

@app.post('/api/exemplo')
@api
def api_exemplo():
    return {'criados': financas.carregar_exemplo()}


# Preferências (limite do mês e limites por categoria)
@app.put('/api/preferencias')
@api
def api_preferencias():
    return {'preferencias': financas.atualizar_preferencias(corpo()).to_dict()}


# Porquinhos: CRUD completo
@app.post('/api/porquinhos')
@api
def api_criar_porquinho():
    return {'porquinho': financas.criar_porquinho(corpo()).para_tela()}

@app.put('/api/porquinhos/<id:int>')
@api
def api_atualizar_porquinho(id):
    p, aviso = financas.atualizar_porquinho(id, corpo())
    return {'porquinho': p.para_tela(), 'aviso': aviso}

@app.delete('/api/porquinhos/<id:int>')
@api
def api_remover_porquinho(id):
    financas.remover_porquinho(id)
    return {'ok': True}


# Investimentos: cálculo nos Models (Investimento -> Parado, Poupança, CDB)
@app.post('/api/investimentos')
@api
def api_investimentos():
    return financas.simular_investimentos(corpo())


@app.delete('/api/tudo')
@api
def api_apagar_tudo():
    financas.apagar_tudo()
    return {'ok': True}


#-----------------------------------------------------------------------------


if __name__ == '__main__':

    run(app, host='0.0.0.0', port=8080, debug=True)
