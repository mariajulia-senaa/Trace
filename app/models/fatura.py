from app.models.categoria import Categoria
from app.models.lancamento import (mes_atual, meses_entre, nome_do_mes,
                                   somar_meses)


def faixa_do_limite(pct):
    """Semáforo do limite: verde até 70%, amarelo até 100%, vermelho acima."""
    if pct <= 70:
        return 'ok'
    if pct <= 100:
        return 'atencao'
    return 'estouro'


class Fatura():
    """Model: a fatura de um mês.

    Recebe todos os lançamentos da pessoa e monta a visão de um mês: as linhas
    gravadas naquele mês mais as parcelas que caem nele (linhas automáticas).
    """

    def __init__(self, mes, lancamentos, limite):
        self.mes = mes
        self.lancamentos = lancamentos
        self.limite = round(float(limite), 2)


    # ------------------------------------------------------------ linhas
    @staticmethod
    def chave_da_compra(lancamento):
        """Identifica a compra parcelada: estabelecimento + nº de parcelas + mês
        da compra. 'LOJA XYZ 3/6' em novembro e 'LOJA XYZ 4/6' em dezembro são
        a mesma compra (feita em setembro)."""
        nome = Categoria.chave_do_estabelecimento(lancamento.descricao) or lancamento.descricao.upper()
        return (nome, lancamento.total_parcelas, lancamento.mes_da_compra)

    def compras_parceladas(self, mes):
        """Uma linha por compra parcelada, usando o registro mais recente
        que já existia no mês (assim nada é contado duas vezes)."""
        escolhidas = {}
        for l in self.lancamentos:
            if not l.parcelado or meses_entre(l.mes, mes) < 0:
                continue
            chave = Fatura.chave_da_compra(l)
            atual = escolhidas.get(chave)
            if atual is None or meses_entre(atual.mes, l.mes) > 0:
                escolhidas[chave] = l
        return [l for l in escolhidas.values() if l.parcela_no_mes(mes) is not None]

    def itens(self):
        reais = [l for l in self.lancamentos if l.mes == self.mes]
        ja_no_mes = {Fatura.chave_da_compra(l) for l in reais if l.parcelado}
        linhas = [l.para_tela() for l in reais]
        for l in self.compras_parceladas(self.mes):
            if Fatura.chave_da_compra(l) in ja_no_mes:
                continue
            projetada = l.projetar(self.mes)
            if projetada:
                linhas.append(projetada)
        linhas.sort(key=lambda x: (x['data'], x['descricao']))
        return linhas


    # ------------------------------------------------------------ totais
    def resumo(self):
        linhas = self.itens()
        total = round(sum(x['valor'] for x in linhas), 2)
        parcelas = round(sum(x['valor'] for x in linhas if x['total_parcelas'] > 1), 2)
        pct = (total / self.limite * 100) if self.limite > 0 else 0
        return {
            'total': total,
            'comprometido_parcelas': parcelas,
            'quantidade': len(linhas),
            'quantidade_parceladas': sum(1 for x in linhas if x['total_parcelas'] > 1),
            'quantidade_automaticas': sum(1 for x in linhas if x['automatica']),
            'pct': round(pct, 2),
            'faixa': faixa_do_limite(pct),
            'sobra': max(0.0, round(self.limite - total, 2)),
            'estouro': max(0.0, round(total - self.limite, 2))
        }


    def parcelamentos(self):
        """Compras parceladas com alguma parcela neste mês."""
        lista = []
        for l in self.compras_parceladas(self.mes):
            p = l.parcela_no_mes(self.mes)
            lista.append({
                'id': l.id,
                'descricao': l.descricao,
                'categoria': l.categoria,
                'pagas': p,
                'total_parcelas': l.total_parcelas,
                'valor': l.valor,
                'valor_total': l.valor_total,
                'falta': l.falta_pagar_depois_de(self.mes),
                'ultima': nome_do_mes(l.mes_da_ultima, curto=True)
            })
        lista.sort(key=lambda x: -x['falta'])
        return lista


    def proximos_meses(self, quantidade=5):
        """Quanto de cada mês seguinte já está tomado só com parcelas."""
        meses = []
        for k in range(1, quantidade + 1):
            mes = somar_meses(self.mes, k)
            valor = sum(l.valor for l in self.compras_parceladas(mes))
            meses.append({'mes': mes, 'rotulo': nome_do_mes(mes, curto=True).split('/')[0],
                          'valor': round(valor, 2)})
        return meses


    def to_dict(self):
        diferenca = meses_entre(mes_atual(), self.mes)
        if diferenca == 0:
            situacao = 'mês atual'
        elif diferenca == 1:
            situacao = 'próximo mês'
        elif diferenca > 1:
            situacao = 'futuro'
        else:
            situacao = 'mês passado'
        return {
            'mes': self.mes,
            'nome': nome_do_mes(self.mes),
            'situacao': situacao,
            'limite': self.limite,
            'itens': self.itens(),
            'resumo': self.resumo(),
            'parcelamentos': self.parcelamentos(),
            'proximos': self.proximos_meses()
        }
