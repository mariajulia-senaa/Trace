import json

from bottle import template

from app.controllers.autenticacao import Autenticacao
from app.controllers.financas import Financas
from app.models.categoria import Categoria


NIVEL = 3   # nível do BMVC (aparece no rodapé e muda alguns textos)


def para_script(dados):
    """JSON seguro para colocar dentro de uma tag <script> da view."""
    return json.dumps(dados, ensure_ascii=False).replace('</', '<\\/')


class Application():

    def __init__(self):
        self.acesso = Autenticacao()
        self.pages = {
            'inicio': self.inicio,
            'trace': self.trace,
            'login': self.login,
            'cadastro': self.cadastro,
            'conta': self.conta
        }


    def render(self, page, **parametros):
        content = self.pages.get(page, self.inicio)
        return content(**parametros)


    def financas_de(self, usuario):
        """Cada pessoa logada tem o seu próprio controller de finanças."""
        return Financas(usuario.id)


    # ------------------------------------------------------------ páginas
    def trace(self, usuario, mes=None):
        # A view recebe as categorias (Model Categoria), o usuário logado e o
        # estado do mês já montado pelos Models dele.
        categorias = Categoria.padrao()
        return template('app/views/html/trace',
                        usuario=usuario,
                        categorias=categorias,
                        categorias_json=para_script([c.to_dict() for c in categorias]),
                        estado_json=para_script(self.financas_de(usuario).estado(mes)))

    def inicio(self, modo=None, erro=None, aviso=None, email='', nome=''):
        """Página de apresentação do Trace. Com 'modo', a gaveta de acesso
        já abre em 'entrar' ou 'cadastrar' (por exemplo, depois de um erro)."""
        return template('app/views/html/inicio', modo=modo, erro=erro, aviso=aviso,
                        email=email, nome=nome, nivel=NIVEL)

    def conta(self, usuario, token, mensagem=None, erro=None):
        """Página restrita 'Minha conta' (Read do Usuario), renderizada no servidor."""
        resumo = self.acesso.resumo_da_conta(usuario, token)
        criado = resumo['usuario']['criado_em'][:10].split('-')
        limite = 'R$ ' + '{:,.2f}'.format(resumo['dados']['limite']).replace(',', 'X').replace('.', ',').replace('X', '.')
        return template('app/views/html/conta', usuario=resumo['usuario'], sessoes=resumo['sessoes'],
                        outras_sessoes=resumo['outras_sessoes'], dados=resumo['dados'], limite=limite,
                        criado_em='/'.join(reversed(criado)), mensagem=mensagem, erro=erro)

    def login(self, erro=None, email='', aviso=None):
        return self.inicio('entrar', erro=erro, aviso=aviso, email=email)

    def cadastro(self, erro=None, nome='', email=''):
        return self.inicio('cadastrar', erro=erro, email=email, nome=nome)
