import hashlib
import hmac
import re
import secrets
from datetime import datetime

from app.models.erros import ErroDeValidacao
from app.models.modelo import Modelo


class Usuario(Modelo):
    """Model: uma pessoa que usa o Trace (herda de Modelo).

    A senha nunca é guardada como foi digitada: o objeto guarda um sal
    aleatório e o resultado do PBKDF2 (senha + sal, 200 mil vezes).
    Sal e hash são PRIVADOS (__sal, __senha_hash): não há propriedade
    pública para lê-los; só dá para definir_senha() e confere_senha().
    """

    ITERACOES = 200_000
    SENHA_MINIMA = 6

    def __init__(self, id, nome, email, sal='', senha_hash='', criado_em=None):
        super().__init__(id)
        self.nome = nome
        self.email = email
        self.__sal = sal
        self.__senha_hash = senha_hash
        self.__criado_em = criado_em or datetime.now().isoformat(timespec='seconds')


    # ------------------------------------------------------------ validação do formulário
    @staticmethod
    def normalizar_email(email):
        return str(email or '').strip().lower()

    @staticmethod
    def validar(nome, email, senha, confirmacao):
        erros = []
        if len(str(nome).strip()) < 2:
            erros.append('Informe seu nome.')
        if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', Usuario.normalizar_email(email)):
            erros.append('Informe um e-mail válido.')
        if len(senha or '') < Usuario.SENHA_MINIMA:
            erros.append('A senha precisa ter pelo menos 6 caracteres.')
        elif senha != confirmacao:
            erros.append('As senhas não são iguais.')
        return erros


    # ------------------------------------------------------------ encapsulamento
    @property
    def nome(self):
        return self._nome

    @nome.setter
    def nome(self, novo):
        novo = re.sub(r'\s+', ' ', str(novo or '')).strip()
        if not (2 <= len(novo) <= 60):
            raise ErroDeValidacao('O nome precisa ter de 2 a 60 letras.')
        self._nome = novo

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, novo):
        novo = Usuario.normalizar_email(novo)
        if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', novo):
            raise ErroDeValidacao('Informe um e-mail válido.')
        self._email = novo

    @property
    def criado_em(self):
        return self.__criado_em

    @property
    def primeiro_nome(self):
        return self._nome.split()[0]


    # ------------------------------------------------------------ senha
    @classmethod
    def _calcular(cls, senha, sal):
        return hashlib.pbkdf2_hmac('sha256', senha.encode('utf-8'), bytes.fromhex(sal), cls.ITERACOES).hex()

    def definir_senha(self, senha):
        if len(senha or '') < Usuario.SENHA_MINIMA:
            raise ErroDeValidacao('A senha precisa ter pelo menos 6 caracteres.')
        self.__sal = secrets.token_hex(16)
        self.__senha_hash = Usuario._calcular(senha, self.__sal)

    def confere_senha(self, senha):
        if not self.__sal or not self.__senha_hash:
            return False
        # compare_digest compara em tempo constante (não "vaza" pela demora)
        return hmac.compare_digest(Usuario._calcular(senha or '', self.__sal), self.__senha_hash)


    # ------------------------------------------------------------ dados
    def to_dict(self):
        # único lugar onde sal e hash saem do objeto: para serem gravados
        return {
            'id': self.id,
            'nome': self._nome,
            'email': self._email,
            'sal': self.__sal,
            'senha_hash': self.__senha_hash,
            'criado_em': self.__criado_em
        }

    def para_tela(self):
        """Sem sal e sem hash: é o que pode ir para a página."""
        return {'id': self.id, 'nome': self._nome, 'primeiro_nome': self.primeiro_nome,
                'email': self._email, 'criado_em': self.__criado_em}

    @classmethod
    def from_dict(cls, d):
        return cls(d['id'], d['nome'], d['email'], d.get('sal', ''), d.get('senha_hash', ''), d.get('criado_em'))

    def descrever(self):
        return '%s <%s>' % (self._nome, self._email)
