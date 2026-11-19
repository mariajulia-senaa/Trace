import secrets
from datetime import datetime, timedelta

from app.models.modelo import Modelo


class Sessao(Modelo):
    """Model: um login ativo (herda de Modelo).

    O navegador recebe só o token (num cookie HttpOnly). O servidor guarda
    de quem é o token e até quando ele vale. Token, dono e validade são
    só de leitura: uma sessão não muda, ela é criada ou apagada.
    """

    DURACAO = timedelta(days=7)

    def __init__(self, id, token, usuario_id, expira_em, criada_em=None):
        super().__init__(id)
        self.__token = token
        self.__usuario_id = usuario_id
        self.__expira_em = expira_em
        self.__criada_em = criada_em or datetime.now().isoformat(timespec='seconds')

    @classmethod
    def nova(cls, usuario_id):
        expira = (datetime.now() + cls.DURACAO).isoformat(timespec='seconds')
        return cls(None, secrets.token_urlsafe(32), usuario_id, expira)

    @property
    def token(self):
        return self.__token

    @property
    def usuario_id(self):
        return self.__usuario_id

    @property
    def expira_em(self):
        return self.__expira_em

    @property
    def criada_em(self):
        return self.__criada_em

    @property
    def expirada(self):
        return datetime.now() >= datetime.fromisoformat(self.__expira_em)

    def to_dict(self):
        return {'id': self.id, 'token': self.__token, 'usuario_id': self.__usuario_id,
                'expira_em': self.__expira_em, 'criada_em': self.__criada_em}

    @classmethod
    def from_dict(cls, d):
        return cls(d['id'], d['token'], d['usuario_id'], d['expira_em'], d.get('criada_em'))

    def descrever(self):
        return 'usuário %s até %s' % (self.__usuario_id, self.__expira_em)
