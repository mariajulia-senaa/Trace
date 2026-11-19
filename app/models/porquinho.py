import math

from app.models.erros import ErroDeValidacao
from app.models.modelo import ModeloDoUsuario


class Porquinho(ModeloDoUsuario):
    """Model: uma meta de economia (viagem, notebook, reserva...).

    Herda de ModeloDoUsuario (cada porquinho tem dono). 'guardado' é o que já existia antes; 'aporte' é a parte
    da sobra deste mês que a pessoa decidiu mandar para este porquinho.
    Cada valor só muda pelo setter, que confere se ele faz sentido.
    """

    TIPOS = ['Viagem', 'Trabalho', 'Reserva', 'Compra', 'Outro']
    CORES = ['#5B9DFF', '#3DDC97', '#E8A06B', '#B392F0', '#FF8FB1', '#7DD3FC']

    def __init__(self, id, nome, tipo, meta, guardado=0, aporte=0, cor='#5B9DFF', usuario_id=None):
        super().__init__(id, usuario_id)
        self.nome = nome
        self.tipo = tipo
        self.meta = meta
        self.guardado = guardado
        self.aporte = aporte
        self.cor = cor


    @staticmethod
    def validar(nome, tipo, meta, guardado=0):
        """Lista de problemas do formulário (vazia se está tudo certo)."""
        erros = []
        if not str(nome).strip():
            erros.append('Dê um nome para a meta.')
        elif len(str(nome).strip()) > 40:
            erros.append('O nome pode ter no máximo 40 letras.')
        if tipo not in Porquinho.TIPOS:
            erros.append('Tipo inválido.')
        try:
            if float(meta) <= 0:
                erros.append('O valor da meta precisa ser maior que zero.')
        except (TypeError, ValueError):
            erros.append('Valor da meta inválido.')
        try:
            if float(guardado) < 0:
                erros.append('O valor já guardado não pode ser negativo.')
        except (TypeError, ValueError):
            erros.append('Valor guardado inválido.')
        return erros


    # ------------------------------------------------------------ encapsulamento
    @staticmethod
    def _dinheiro(valor, minimo, mensagem):
        try:
            valor = round(float(valor), 2)
        except (TypeError, ValueError):
            raise ErroDeValidacao(mensagem)
        if valor < minimo:
            raise ErroDeValidacao(mensagem)
        return valor

    @property
    def nome(self):
        return self._nome

    @nome.setter
    def nome(self, novo):
        novo = str(novo or '').strip()
        if not novo or len(novo) > 40:
            raise ErroDeValidacao('O nome da meta precisa ter de 1 a 40 letras.')
        self._nome = novo

    @property
    def tipo(self):
        return self._tipo

    @tipo.setter
    def tipo(self, novo):
        if novo not in Porquinho.TIPOS:
            raise ErroDeValidacao('Tipo inválido.')
        self._tipo = novo

    @property
    def meta(self):
        return self._meta

    @meta.setter
    def meta(self, valor):
        valor = Porquinho._dinheiro(valor, 0.01, 'O valor da meta precisa ser maior que zero.')
        self._meta = valor

    @property
    def guardado(self):
        return self._guardado

    @guardado.setter
    def guardado(self, valor):
        self._guardado = Porquinho._dinheiro(valor, 0, 'O valor já guardado não pode ser negativo.')

    @property
    def aporte(self):
        return self._aporte

    @aporte.setter
    def aporte(self, valor):
        self._aporte = Porquinho._dinheiro(valor, 0, 'O aporte não pode ser negativo.')

    @property
    def cor(self):
        return self._cor

    @cor.setter
    def cor(self, nova):
        self._cor = nova if nova in Porquinho.CORES else Porquinho.CORES[0]


    # ------------------------------------------------------------ contas
    @property
    def total(self):
        return round(self._guardado + self._aporte, 2)

    @property
    def falta(self):
        return max(0.0, round(self._meta - self.total, 2))

    @property
    def porcentagem(self):
        return min(100, round(self.total / self._meta * 100))

    @property
    def meses_para_meta(self):
        """Mantendo o aporte, em quantos meses a meta chega (None = sem aporte)."""
        if self.falta <= 0:
            return 0
        if self._aporte <= 0:
            return None
        return math.ceil(self.falta / self._aporte)


    # ------------------------------------------------------------ dados
    def to_dict(self):
        return self.com_dono({
            'id': self.id,
            'nome': self._nome,
            'tipo': self._tipo,
            'meta': self._meta,
            'guardado': self._guardado,
            'aporte': self._aporte,
            'cor': self._cor
        })

    def para_tela(self):
        d = self.to_dict()
        d.pop('usuario_id')
        d.update(total=self.total, falta=self.falta, porcentagem=self.porcentagem,
                 meses_para_meta=self.meses_para_meta)
        return d

    @classmethod
    def from_dict(cls, d):
        return cls(d['id'], d['nome'], d['tipo'], d['meta'], d.get('guardado', 0),
                   d.get('aporte', 0), d.get('cor', '#5B9DFF'), d.get('usuario_id'))

    def descrever(self):
        return '%s: %d%% de R$ %.2f' % (self._nome, self.porcentagem, self._meta)
