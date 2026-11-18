import json

from bottle import template

from app.controllers.financas import Financas
from app.models.categoria import Categoria


def para_script(dados):
    """JSON seguro para colocar dentro de uma tag <script> da view."""
    return json.dumps(dados, ensure_ascii=False).replace('</', '<\\/')


class Application():

    def __init__(self):
        self.financas = Financas()
        self.pages = {
            'trace': self.trace
        }


    def render(self, page, **parametros):
        content = self.pages.get(page, self.trace)
        return content(**parametros)


    def trace(self, mes=None):
        # A view recebe as categorias (Model Categoria) e o estado do mês já
        # montado pelos Models (Fatura, Lancamento, Porquinho, Preferencias).
        categorias = Categoria.padrao()
        return template('app/views/html/trace',
                        categorias=categorias,
                        categorias_json=para_script([c.to_dict() for c in categorias]),
                        estado_json=para_script(self.financas.estado(mes)))
