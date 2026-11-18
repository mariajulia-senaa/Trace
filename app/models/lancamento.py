import calendar
import re
from abc import abstractmethod
from datetime import date

from app.models.categoria import Categoria
from app.models.erros import ErroDeValidacao
from app.models.modelo import Modelo


MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
         'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']


# ---------------------------------------------------------------- meses
# Um mês é guardado como texto 'AAAA-MM' (ex.: '2026-11').

def mes_de(data_iso):
    return data_iso[:7]


def mes_atual():
    return date.today().strftime('%Y-%m')


def somar_meses(mes, quantidade):
    ano, m = int(mes[:4]), int(mes[5:7])
    total = ano * 12 + (m - 1) + quantidade
    return '%04d-%02d' % (total // 12, total % 12 + 1)


def meses_entre(inicio, fim):
    """Quantos meses de 'inicio' até 'fim' (fim - inicio)."""
    return (int(fim[:4]) * 12 + int(fim[5:7])) - (int(inicio[:4]) * 12 + int(inicio[5:7]))


def nome_do_mes(mes, curto=False):
    ano, m = int(mes[:4]), int(mes[5:7])
    if curto:
        return MESES_CURTOS[m - 1] + '/' + str(ano)
    return MESES[m - 1] + ' de ' + str(ano)


def mes_valido(texto):
    return bool(re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])', texto or ''))


# ---------------------------------------------------------------- model
class Lancamento(Modelo):
    """Model ABSTRATO: uma linha da fatura.

    Herda de Modelo e tem duas classes filhas:
      - LancamentoAVista:   a compra cai inteira em um mês só;
      - LancamentoParcelado: a compra se repete nos meses seguintes.

    A Fatura pergunta a qualquer lançamento "qual parcela cai neste mês?"
    (parcela_no_mes) e "qual linha você gera neste mês?" (projetar), sem
    saber se ele é à vista ou parcelado: isso é POLIMORFISMO.

    Os dados ficam em atributos protegidos (_data, _valor...) e só mudam
    pelos setters, que recusam valores inválidos: ENCAPSULAMENTO.
    """

    LIMITE_PARCELAS = 48

    def __init__(self, id, data, descricao, valor, categoria, parcela=1, total_parcelas=1):
        super().__init__(id)
        self.data = data
        self.descricao = descricao
        self.valor = valor
        self.categoria = categoria
        parcela, total_parcelas = int(parcela), int(total_parcelas)
        if not (1 <= total_parcelas <= Lancamento.LIMITE_PARCELAS) or not (1 <= parcela <= total_parcelas):
            raise ErroDeValidacao('Parcela inválida (use de 1x a %dx).' % Lancamento.LIMITE_PARCELAS)
        self._parcela = parcela
        self._total_parcelas = total_parcelas


    # ------------------------------------------------------------ criação polimórfica
    @staticmethod
    def criar(id, data, descricao, valor, categoria, parcela=1, total_parcelas=1):
        """Fábrica: devolve a classe filha certa para o número de parcelas."""
        classe = LancamentoParcelado if int(total_parcelas) > 1 else LancamentoAVista
        return classe(id, data, descricao, valor, categoria, parcela, total_parcelas)

    @classmethod
    def from_dict(cls, d):
        return Lancamento.criar(d['id'], d['data'], d['descricao'], d['valor'], d['categoria'],
                                d.get('parcela', 1), d.get('total_parcelas', 1))


    # ------------------------------------------------------------ validação (antes de criar)
    @staticmethod
    def validar(data, descricao, valor, parcela=1, total_parcelas=1):
        """Lista de problemas (vazia se está tudo certo). Usada para montar
        uma mensagem só com todos os erros de um formulário."""
        erros = []
        try:
            date.fromisoformat(str(data))
        except ValueError:
            erros.append('Data inválida.')
        if not str(descricao).strip():
            erros.append('Informe o estabelecimento.')
        elif len(str(descricao)) > 80:
            erros.append('O estabelecimento pode ter no máximo 80 letras.')
        try:
            if float(valor) <= 0:
                erros.append('O valor precisa ser maior que zero.')
        except (TypeError, ValueError):
            erros.append('Valor inválido.')
        try:
            p, n = int(parcela), int(total_parcelas)
            if not (1 <= n <= Lancamento.LIMITE_PARCELAS) or not (1 <= p <= n):
                erros.append('Parcela inválida (use de 1x a %dx).' % Lancamento.LIMITE_PARCELAS)
        except (TypeError, ValueError):
            erros.append('Parcela inválida.')
        return erros

    @staticmethod
    def separar_parcela(descricao):
        """'LOJA XYZ 3/6' -> ('LOJA XYZ', 3, 6). Sem parcela -> (descricao, 1, 1)."""
        m = re.search(r'\s+(?:PARC(?:ELA)?\s*)?(\d{1,2})\s*(?:/|DE)\s*(\d{1,2})\s*$', descricao, re.IGNORECASE)
        if m:
            p, n = int(m.group(1)), int(m.group(2))
            if 1 <= p <= n <= Lancamento.LIMITE_PARCELAS and n > 1:
                return descricao[:m.start()].strip(), p, n
        return descricao.strip(), 1, 1


    # ------------------------------------------------------------ encapsulamento
    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, nova):
        try:
            self._data = date.fromisoformat(str(nova)).isoformat()
        except ValueError:
            raise ErroDeValidacao('Data inválida.')

    @property
    def descricao(self):
        return self._descricao

    @descricao.setter
    def descricao(self, nova):
        nova = re.sub(r'\s+', ' ', str(nova or '')).strip()
        if not nova:
            raise ErroDeValidacao('Informe o estabelecimento.')
        if len(nova) > 80:
            raise ErroDeValidacao('O estabelecimento pode ter no máximo 80 letras.')
        self._descricao = nova

    @property
    def valor(self):
        return self._valor

    @valor.setter
    def valor(self, novo):
        try:
            novo = round(float(novo), 2)
        except (TypeError, ValueError):
            raise ErroDeValidacao('Valor inválido.')
        if novo <= 0:
            raise ErroDeValidacao('O valor precisa ser maior que zero.')
        self._valor = novo

    @property
    def categoria(self):
        return self._categoria

    @categoria.setter
    def categoria(self, nova):
        if nova not in Categoria.nomes():
            raise ErroDeValidacao('Categoria desconhecida.')
        self._categoria = nova

    @property
    def parcela(self):            # só leitura: muda criando outro lançamento
        return self._parcela

    @property
    def total_parcelas(self):     # só leitura
        return self._total_parcelas

    @property
    def mes(self):
        return mes_de(self._data)


    # ------------------------------------------------------------ o que cada filha responde do seu jeito
    @property
    @abstractmethod
    def parcelado(self):
        """True se a compra se repete nos meses seguintes."""

    @property
    @abstractmethod
    def mes_da_compra(self):
        """Mês em que a compra foi feita (a parcela 1)."""

    @property
    @abstractmethod
    def mes_da_ultima(self):
        """Mês da última parcela."""

    @property
    @abstractmethod
    def valor_total(self):
        """Valor da compra inteira."""

    @abstractmethod
    def parcela_no_mes(self, mes):
        """Número da parcela que cai no mês (ou None se nenhuma cai)."""

    @abstractmethod
    def projetar(self, mes):
        """A linha 'automática' desta compra em um mês seguinte (ou None)."""

    @abstractmethod
    def falta_pagar_depois_de(self, mes):
        """Quanto ainda falta pagar depois da parcela do mês informado."""


    # ------------------------------------------------------------ dados
    def to_dict(self):
        return {
            'id': self.id,
            'data': self._data,
            'descricao': self._descricao,
            'valor': self._valor,
            'categoria': self._categoria,
            'parcela': self._parcela,
            'total_parcelas': self._total_parcelas
        }

    def para_tela(self):
        d = self.to_dict()
        d.update(automatica=False, origem=None, origem_id=None)
        return d

    def descrever(self):
        return '%s, R$ %.2f em %s' % (self._descricao, self._valor, self._data)


class LancamentoAVista(Lancamento):
    """Compra paga de uma vez: só existe no próprio mês."""

    def __init__(self, id, data, descricao, valor, categoria, parcela=1, total_parcelas=1):
        if int(parcela) != 1 or int(total_parcelas) != 1:
            raise ErroDeValidacao('Lançamento à vista tem uma parcela só.')
        super().__init__(id, data, descricao, valor, categoria, 1, 1)

    @property
    def parcelado(self):
        return False

    @property
    def mes_da_compra(self):
        return self.mes

    @property
    def mes_da_ultima(self):
        return self.mes

    @property
    def valor_total(self):
        return self.valor

    def parcela_no_mes(self, mes):
        return 1 if mes == self.mes else None

    def projetar(self, mes):
        return None            # à vista nunca aparece sozinho em outro mês

    def falta_pagar_depois_de(self, mes):
        return 0.0


class LancamentoParcelado(Lancamento):
    """Compra em várias parcelas. É gravada uma vez só, com a parcela em que
    entrou no Trace (ex.: 3 de 6); as seguintes são calculadas por projetar()."""

    def __init__(self, id, data, descricao, valor, categoria, parcela=1, total_parcelas=2):
        if int(total_parcelas) < 2:
            raise ErroDeValidacao('Parcelado precisa de 2 parcelas ou mais.')
        super().__init__(id, data, descricao, valor, categoria, parcela, total_parcelas)

    @property
    def parcelado(self):
        return True

    @property
    def mes_da_compra(self):
        return somar_meses(self.mes, -(self.parcela - 1))

    @property
    def mes_da_ultima(self):
        return somar_meses(self.mes, self.total_parcelas - self.parcela)

    @property
    def valor_total(self):
        return round(self.valor * self.total_parcelas, 2)

    def parcela_no_mes(self, mes):
        distancia = meses_entre(self.mes, mes)
        p = self.parcela + distancia
        if distancia < 0 or p > self.total_parcelas:
            return None
        return p

    def projetar(self, mes):
        if mes == self.mes:
            return None
        p = self.parcela_no_mes(mes)
        if p is None:
            return None
        ano, m = int(mes[:4]), int(mes[5:7])
        dia = min(int(self.data[8:10]), calendar.monthrange(ano, m)[1])
        return {
            'id': None,
            'origem_id': self.id,
            'data': '%s-%02d' % (mes, dia),
            'descricao': self.descricao,
            'valor': self.valor,
            'categoria': self.categoria,
            'parcela': p,
            'total_parcelas': self.total_parcelas,
            'automatica': True,
            'origem': 'compra de ' + nome_do_mes(self.mes_da_compra, curto=True)
        }

    def falta_pagar_depois_de(self, mes):
        p = self.parcela_no_mes(mes)
        if p is None:
            return 0.0
        return round(self.valor * (self.total_parcelas - p), 2)

    def descrever(self):
        # sobrescreve o método da classe mãe e reaproveita o texto dela
        return super().descrever() + ' (parcela %d de %d)' % (self.parcela, self.total_parcelas)
