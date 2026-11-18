from abc import ABC, abstractmethod

from app.models.erros import ErroDeValidacao


class Investimento(ABC):
    """Classe ABSTRATA: um jeito de guardar dinheiro por alguns meses.

    O cálculo do saldo mês a mês é igual para todos (método evolucao, um
    "método modelo"). O que muda de um investimento para outro é só:
      - taxa_mensal(): quanto o dinheiro rende por mês;
      - imposto():     quanto de IR é descontado no fim.
    Cada classe filha responde a essas perguntas do seu jeito: POLIMORFISMO.

    Os valores de entrada são privados (__inicial, __aporte, __prazo):
    ENCAPSULAMENTO. As filhas leem pelas propriedades.
    """

    NOME = 'Investimento'
    CHAVE = 'investimento'

    def __init__(self, inicial, aporte, prazo):
        if float(inicial) < 0 or float(aporte) < 0:
            raise ErroDeValidacao('Os valores investidos não podem ser negativos.')
        if not (1 <= int(prazo) <= 600):
            raise ErroDeValidacao('O prazo precisa ser de 1 a 600 meses.')
        self.__inicial = float(inicial)
        self.__aporte = float(aporte)
        self.__prazo = int(prazo)

    @property
    def inicial(self):
        return self.__inicial

    @property
    def aporte(self):
        return self.__aporte

    @property
    def prazo(self):
        return self.__prazo


    # ------------------------------------------------------------ o que cada filha define
    @abstractmethod
    def taxa_mensal(self):
        """Rendimento por mês (0.005 = 0,5% ao mês)."""

    def imposto(self):
        """IR descontado no resgate. Por padrão, nenhum (as filhas sobrescrevem)."""
        return 0.0


    # ------------------------------------------------------------ cálculo comum (herdado)
    def evolucao(self):
        """Saldo bruto de cada mês, de 'hoje' (mês 0) até o fim do prazo.
        Os aportes entram no fim de cada mês."""
        taxa = self.taxa_mensal()
        saldo = self.__inicial
        saldos = [saldo]
        for _ in range(self.__prazo):
            saldo = saldo * (1 + taxa) + self.__aporte
            saldos.append(saldo)
        return saldos

    @property
    def total_investido(self):
        return self.__inicial + self.__aporte * self.__prazo

    def resumo(self):
        saldos = self.evolucao()
        bruto = saldos[-1]
        ir = self.imposto()
        return {
            'nome': self.NOME,
            'evolucao': [round(s, 2) for s in saldos],
            'investido': round(self.total_investido, 2),
            'saldo_bruto': round(bruto, 2),
            'rendimento_bruto': round(bruto - self.total_investido, 2),
            'imposto': round(ir, 2),
            'saldo_liquido': round(bruto - ir, 2),
            'ganho_liquido': round(bruto - ir - self.total_investido, 2)
        }

    def __repr__(self):
        return '<%s: R$ %.2f em %d meses>' % (type(self).__name__, self.evolucao()[-1], self.__prazo)


class DinheiroParado(Investimento):
    """Dinheiro guardado sem render nada."""

    NOME = 'Parado'
    CHAVE = 'parado'

    def taxa_mensal(self):
        return 0.0


class Poupanca(Investimento):
    """Poupança: rende uma taxa fixa ao mês e é isenta de IR."""

    NOME = 'Poupança'
    CHAVE = 'poupanca'

    def __init__(self, inicial, aporte, prazo, taxa_ao_mes):
        super().__init__(inicial, aporte, prazo)
        if float(taxa_ao_mes) < 0:
            raise ErroDeValidacao('A taxa da poupança não pode ser negativa.')
        self.__taxa = float(taxa_ao_mes) / 100

    def taxa_mensal(self):
        return self.__taxa


class CDB(Investimento):
    """CDB: rende um percentual do CDI e paga IR regressivo sobre o lucro."""

    NOME = 'CDB'
    CHAVE = 'cdb'

    def __init__(self, inicial, aporte, prazo, cdi_ao_ano, percentual_do_cdi):
        super().__init__(inicial, aporte, prazo)
        if float(cdi_ao_ano) < 0 or float(percentual_do_cdi) < 0:
            raise ErroDeValidacao('CDI e percentual do CDI não podem ser negativos.')
        self.__cdi = float(cdi_ao_ano) / 100
        self.__percentual = float(percentual_do_cdi) / 100

    def taxa_mensal(self):
        # taxa anual (CDI x percentual) convertida para mês
        return (1 + self.__cdi * self.__percentual) ** (1 / 12) - 1

    @staticmethod
    def aliquota_ir(dias):
        """Tabela regressiva da renda fixa."""
        if dias <= 180:
            return 0.225
        if dias <= 360:
            return 0.20
        if dias <= 720:
            return 0.175
        return 0.15

    def imposto(self):
        """Sobrescreve o método da mãe: cada depósito paga IR pela própria
        idade (meses x 30 dias) sobre o lucro que ele gerou."""
        taxa = self.taxa_mensal()
        total = 0.0
        for k in range(self.prazo + 1):
            valor = self.inicial if k == 0 else self.aporte
            idade = self.prazo - k
            total += valor * ((1 + taxa) ** idade - 1) * CDB.aliquota_ir(idade * 30)
        return total
