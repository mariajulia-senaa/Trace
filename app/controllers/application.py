from app.models.categoria import Categoria
from bottle import template
import json


class Application():

    def __init__(self):
        self.pages = {
            'trace': self.trace,
            'helper': self.helper
        }


    def render(self,page):
       content = self.pages.get(page, self.helper)
       return content()


    def helper(self):
        return template('app/views/html/helper')


    def trace(self):
        # O Model (Categoria) entrega as categorias e palavras-chave para a view.
        categorias = Categoria.padrao()
        dados = json.dumps([c.to_dict() for c in categorias], ensure_ascii=False)
        dados = dados.replace('</', '<\\/')   # evita fechar a tag <script> por engano
        return template('app/views/html/trace', categorias=categorias,
                        categorias_json=dados)
