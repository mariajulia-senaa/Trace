from app.models.categoria import Categoria
from app.models.erros import ErroDeValidacao
from app.models.modelo import ModeloDoUsuario


class Preferencias(ModeloDoUsuario):
    """Model: as escolhas da pessoa que valem para todos os meses.

    - limite: quanto ela quer gastar, no máximo, por fatura;
    - limites: limite de cada categoria (quando ela muda a sugestão);
    - regras: o que o Trace aprendeu com as correções de categoria
      (chave do estabelecimento -> categoria).

    Os dicionários são protegidos: quem lê recebe uma CÓPIA, e só dá para
    mudar pelos métodos definir_limite() e aprender(), que validam.
    """

    LIMITE_PADRAO = 1500.0

    def __init__(self, id=1, limite=LIMITE_PADRAO, limites=None, regras=None, usuario_id=None):
        super().__init__(id, usuario_id)
        self.limite = limite
        self._limites = {}
        self._regras = {}
        for categoria, valor in (limites or {}).items():
            self.definir_limite(categoria, valor)
        for chave, categoria in (regras or {}).items():
            self.aprender(chave, categoria)


    # ------------------------------------------------------------ encapsulamento
    @property
    def limite(self):
        return self._limite

    @limite.setter
    def limite(self, valor):
        try:
            valor = round(float(valor), 2)
        except (TypeError, ValueError):
            raise ErroDeValidacao('Limite inválido.')
        if valor <= 0:
            raise ErroDeValidacao('O limite precisa ser maior que zero.')
        self._limite = valor

    @property
    def limites(self):
        return dict(self._limites)        # cópia: mudar fora não altera o objeto

    @property
    def regras(self):
        return dict(self._regras)

    def definir_limite(self, categoria, valor):
        if categoria not in Categoria.nomes():
            raise ErroDeValidacao('Categoria desconhecida: %s' % categoria)
        try:
            valor = round(float(valor), 2)
        except (TypeError, ValueError):
            raise ErroDeValidacao('Limite da categoria inválido.')
        if valor < 0:
            raise ErroDeValidacao('O limite da categoria não pode ser negativo.')
        self._limites[categoria] = valor

    def aprender(self, chave, categoria):
        if chave and categoria in Categoria.nomes():
            self._regras[chave] = categoria


    # ------------------------------------------------------------ dados
    def to_dict(self):
        return self.com_dono({
            'id': self.id,
            'limite': self._limite,
            'limites': dict(self._limites),
            'regras': dict(self._regras)
        })

    @classmethod
    def from_dict(cls, d):
        return cls(d.get('id', 1), d.get('limite', cls.LIMITE_PADRAO), d.get('limites'), d.get('regras'),
                   d.get('usuario_id'))

    def descrever(self):
        return 'limite de R$ %.2f, %d regra(s) aprendida(s)' % (self._limite, len(self._regras))
