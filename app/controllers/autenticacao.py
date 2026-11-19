from app.controllers.financas import Financas
from app.controllers.repositorio import Repositorio
from app.models.erros import ErroDeAcesso, ErroDeValidacao
from app.models.sessao import Sessao
from app.models.usuario import Usuario


class Autenticacao():
    """Controller do controle de acesso e da conta.

    CRUD completo do Usuario: cadastrar (Create), dados da conta (Read),
    alterar nome e senha (Update) e excluir a conta (Delete).
    """

    COOKIE = 'trace_sessao'

    def __init__(self):
        self.usuarios = Repositorio('usuarios', Usuario)
        self.sessoes = Repositorio('sessoes', Sessao)


    # ------------------------------------------------------------ Create
    def cadastrar(self, nome, email, senha, confirmacao):
        erros = Usuario.validar(nome, email, senha, confirmacao)
        if erros:
            raise ErroDeAcesso(' '.join(erros))
        if self.usuarios.buscar_por('email', Usuario.normalizar_email(email)):
            raise ErroDeAcesso('Já existe uma conta com este e-mail. Entre com a sua senha.')
        usuario = Usuario(None, nome, email)
        usuario.definir_senha(senha)
        return self.usuarios.inserir(usuario)


    # ------------------------------------------------------------ sessão
    def entrar(self, email, senha):
        """Confere e-mail e senha e abre uma sessão. Devolve (usuario, token)."""
        usuario = self.usuarios.buscar_por('email', Usuario.normalizar_email(email))
        # Mesma mensagem para e-mail e senha errados: não revela quem tem conta.
        if usuario is None or not usuario.confere_senha(senha):
            raise ErroDeAcesso('E-mail ou senha incorretos.')
        self.sessoes.remover_onde(lambda s: s.expirada)
        sessao = self.sessoes.inserir(Sessao.nova(usuario.id))
        return usuario, sessao.token

    def usuario_da_sessao(self, token):
        """O usuário dono do token, ou None (sem login ou sessão vencida)."""
        if not token:
            return None
        sessao = self.sessoes.buscar_por('token', token)
        if sessao is None or sessao.expirada:
            return None
        return self.usuarios.buscar(sessao.usuario_id)

    def sair(self, token):
        if token:
            self.sessoes.remover_onde(lambda s: s.token == token)


    # ------------------------------------------------------------ Read
    def resumo_da_conta(self, usuario, token):
        sessoes = [s for s in self.sessoes.listar() if s.usuario_id == usuario.id and not s.expirada]
        return {
            'usuario': usuario.para_tela(),
            'sessoes': len(sessoes),
            'outras_sessoes': sum(1 for s in sessoes if s.token != token),
            'dados': Financas(usuario.id).contagem()
        }


    # ------------------------------------------------------------ Update
    def alterar_nome(self, usuario, nome):
        try:
            usuario.nome = nome                   # o setter do Model valida
        except ErroDeValidacao as erro:
            raise ErroDeAcesso(str(erro))
        self.usuarios.atualizar(usuario)
        return usuario

    def trocar_senha(self, usuario, atual, nova, confirmacao, token):
        if not usuario.confere_senha(atual):
            raise ErroDeAcesso('A senha atual não confere.')
        if nova != confirmacao:
            raise ErroDeAcesso('As senhas novas não são iguais.')
        try:
            usuario.definir_senha(nova)
        except ErroDeValidacao as erro:
            raise ErroDeAcesso(str(erro))
        self.usuarios.atualizar(usuario)
        # por segurança, os outros aparelhos precisam entrar de novo
        return self.encerrar_outras_sessoes(usuario, token)

    def encerrar_outras_sessoes(self, usuario, token):
        return self.sessoes.remover_onde(lambda s: s.usuario_id == usuario.id and s.token != token)


    # ------------------------------------------------------------ Delete
    def excluir_conta(self, usuario, senha):
        if not usuario.confere_senha(senha):
            raise ErroDeAcesso('Senha incorreta: a conta não foi excluída.')
        Financas(usuario.id).apagar_tudo()
        self.sessoes.remover_onde(lambda s: s.usuario_id == usuario.id)
        self.usuarios.remover(usuario.id)
