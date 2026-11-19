from abc import ABC, abstractmethod


class Modelo(ABC):
    """Classe ABSTRATA, base de todos os Models que são gravados no banco.

    Ela define o "contrato" que toda classe filha precisa cumprir:
      - to_dict():   transformar o objeto em dicionário (para o JSON);
      - from_dict(): criar o objeto a partir do dicionário;
      - descrever(): uma frase curta sobre o objeto.

    Como os métodos são abstratos, não dá para fazer Modelo(): só as
    classes filhas que implementam tudo podem ser instanciadas.
    """

    def __init__(self, id=None):
        self._id = id          # protegido: só o Repositório define o id


    # ------------------------------------------------------------ encapsulamento
    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, novo):
        if novo is not None and (not isinstance(novo, int) or novo < 1):
            raise ValueError('O id precisa ser um inteiro positivo.')
        self._id = novo


    # ------------------------------------------------------------ contrato
    @abstractmethod
    def to_dict(self):
        """Dicionário com os dados que vão para o arquivo JSON."""

    @classmethod
    @abstractmethod
    def from_dict(cls, dados):
        """Cria o objeto a partir de um dicionário lido do JSON."""

    @abstractmethod
    def descrever(self):
        """Frase curta que identifica o objeto (usada no print/log)."""


    # ------------------------------------------------------------ comportamento comum (herdado)
    def __repr__(self):
        # polimorfismo: cada classe filha responde descrever() do seu jeito
        return '<%s #%s: %s>' % (type(self).__name__, self._id, self.descrever())

    def __eq__(self, outro):
        return type(self) is type(outro) and self._id is not None and self._id == outro._id

    def __hash__(self):
        return hash((type(self).__name__, self._id))


class ModeloDoUsuario(Modelo):
    """Nível 3: um Model que pertence a uma pessoa (herda de Modelo).

    Lancamento, Porquinho e Preferencias herdam daqui e ganham o dono
    (usuario_id) sem repetir código: HERANÇA em dois níveis
    (Modelo -> ModeloDoUsuario -> Lancamento -> LancamentoParcelado).
    """

    def __init__(self, id=None, usuario_id=None):
        super().__init__(id)
        self.usuario_id = usuario_id

    @property
    def usuario_id(self):
        return self._usuario_id

    @usuario_id.setter
    def usuario_id(self, novo):
        if novo is not None and (not isinstance(novo, int) or novo < 1):
            raise ValueError('O dono precisa ser o id de um usuário.')
        self._usuario_id = novo

    def com_dono(self, dados):
        """Acrescenta o dono ao dicionário que vai para o JSON."""
        dados['usuario_id'] = self._usuario_id
        return dados
