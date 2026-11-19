class ErroDoTrace(Exception):
    """Base de todos os erros do Trace (herança de exceções)."""


class ErroDeValidacao(ErroDoTrace, ValueError):
    """Um dado inválido chegou a um Model (vira resposta 400 na API).

    Herda de ErroDoTrace e também de ValueError: quem já trata ValueError
    continua funcionando (herança múltipla)."""


class ErroDeAcesso(ErroDoTrace):
    """Cadastro, login ou ação da conta recusada (a mensagem vai para a tela)."""
