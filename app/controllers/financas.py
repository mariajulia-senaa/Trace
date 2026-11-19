import re
from datetime import date

from app.controllers.repositorio import RepositorioDoUsuario
from app.models.categoria import Categoria
from app.models.erros import ErroDeValidacao
from app.models.fatura import Fatura
from app.models.investimento import CDB, DinheiroParado, Poupanca
from app.models.lancamento import (Lancamento, mes_atual, mes_valido, meses_entre,
                                   nome_do_mes, somar_meses)
from app.models.porquinho import Porquinho
from app.models.preferencias import Preferencias


def numero(valor):
    """Aceita 12.5, '12,50', '1.234,56' ou 'R$ 1.234,56'."""
    if isinstance(valor, (int, float)):
        return float(valor)
    texto = re.sub(r'[^\d,.\-]', '', str(valor or ''))
    if ',' in texto:
        texto = texto.replace('.', '').replace(',', '.')
    elif re.fullmatch(r'\d{1,3}(\.\d{3})+', texto):
        texto = texto.replace('.', '')
    try:
        return float(texto)
    except ValueError:
        raise ErroDeValidacao('Valor inválido: %s' % valor)


# Linha de fatura em texto: data + estabelecimento + valor
LINHA = re.compile(
    r'^\s*(\d{1,2}/\d{1,2}(?:/\d{2,4})?|\d{4}-\d{2}-\d{2})\s+(.+?)\s+(?:R\$\s*)?'
    r'(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})\s*$')

EXEMPLO = [
    ('05', 'UBER *TRIP', 23.90), ('05', 'IFOOD *RESTAURANTE', 54.70),
    ('06', 'NETFLIX.COM', 55.90), ('07', 'SUPERMERCADO BOM PRECO', 212.35),
    ('08', 'POSTO SHELL', 180.00), ('09', 'FARMACIA POPULAR', 67.80),
    ('10', 'SPOTIFY', 21.90), ('11', 'CINEMAPLEX', 76.00),
    ('12', 'LOJA XYZ 3/6', 149.90), ('13', 'IFOOD *LANCHES', 48.90),
    ('14', 'UBER *TRIP', 31.20), ('15', 'CURSO ONLINE', 89.90),
    ('16', 'RESTAURANTE SABOR', 96.50), ('17', 'AMAZON PRIME', 19.90)
]
PORQUINHOS_EXEMPLO = [
    ('Viagem para o Nordeste', 'Viagem', 3500, 1280, 150, '#5B9DFF'),
    ('Notebook de trabalho', 'Trabalho', 4200, 900, 191.15, '#3DDC97'),
    ('Reserva de emergência', 'Reserva', 6000, 5370, 30, '#E8A06B')
]


class Financas():
    """Controller das regras do Trace: junta os Models e o Repositório.

    As rotas (route.py) só recebem a requisição e chamam um método daqui.
    Nível 3: cada objeto Financas trabalha só com os dados de um usuário
    (os repositórios são RepositorioDoUsuario, filhos de Repositorio).
    """

    def __init__(self, usuario_id):
        self.__usuario_id = usuario_id
        self.lancamentos = RepositorioDoUsuario('lancamentos', Lancamento, usuario_id)
        self.porquinhos = RepositorioDoUsuario('porquinhos', Porquinho, usuario_id)
        self.preferencias_repo = RepositorioDoUsuario('preferencias', Preferencias, usuario_id)
        self.categorias = Categoria.padrao()


    # ------------------------------------------------------------ preferências
    def preferencias(self):
        lista = self.preferencias_repo.listar()
        if lista:
            return lista[0]
        return self.preferencias_repo.inserir(Preferencias())

    def atualizar_preferencias(self, dados):
        p = self.preferencias()
        if 'limite' in dados:
            p.limite = numero(dados['limite'])            # o setter valida
        if 'limites' in dados:
            for nome, valor in (dados['limites'] or {}).items():
                p.definir_limite(nome, numero(valor))     # o método valida
        self.preferencias_repo.atualizar(p)
        return p


    # ------------------------------------------------------------ leitura
    def fatura(self, mes):
        return Fatura(mes, self.lancamentos.listar(), self.preferencias().limite)

    def meses_disponiveis(self):
        """Meses que aparecem no seletor: um pouco antes e depois de hoje,
        indo até o mês da última parcela cadastrada."""
        atual = mes_atual()
        inicio, fim = somar_meses(atual, -6), somar_meses(atual, 12)
        for l in self.lancamentos.listar():
            if meses_entre(l.mes, inicio) > 0:
                inicio = l.mes
            if meses_entre(fim, l.mes_da_ultima) > 0:
                fim = l.mes_da_ultima
        meses = []
        mes = inicio
        while meses_entre(mes, fim) >= 0:
            meses.append({'mes': mes, 'nome': nome_do_mes(mes)})
            mes = somar_meses(mes, 1)
        return meses

    def estado(self, mes=None):
        """Tudo o que a página precisa para desenhar um mês."""
        mes = mes if mes_valido(mes) else mes_atual()
        atual = self.fatura(mes_atual()).resumo()
        atual['nome'] = nome_do_mes(mes_atual())
        atual['limite'] = self.preferencias().limite
        return {
            'mes_atual': mes_atual(),
            'hoje': date.today().isoformat(),
            'meses': self.meses_disponiveis(),
            'preferencias': {k: v for k, v in self.preferencias().to_dict().items() if k != 'usuario_id'},
            'fatura': self.fatura(mes).to_dict(),
            'mes_dos_porquinhos': atual,
            'porquinhos': [p.para_tela() for p in self.porquinhos.listar()]
        }


    # ------------------------------------------------------------ lançamentos (CRUD)
    def _montar_lancamento(self, dados):
        descricao = str(dados.get('descricao', '')).strip()
        descricao = re.sub(r'\s+', ' ', descricao)
        parcela = int(dados.get('parcela') or 1)
        total = int(dados.get('total_parcelas') or 1)
        if total == 1:   # "LOJA XYZ 3/6" digitado no nome também vale
            descricao, parcela, total = Lancamento.separar_parcela(descricao)
        valor = numero(dados.get('valor'))
        data = str(dados.get('data', ''))
        erros = Lancamento.validar(data, descricao, valor, parcela, total)
        if erros:
            raise ErroDeValidacao(' '.join(erros))
        categoria = dados.get('categoria')
        if categoria not in Categoria.nomes():
            categoria = Categoria.classificar(descricao, self.preferencias().regras, self.categorias)
        # a fábrica devolve LancamentoAVista ou LancamentoParcelado
        return Lancamento.criar(None, data, descricao, valor, categoria, parcela, total)

    def criar_lancamento(self, dados):
        return self.lancamentos.inserir(self._montar_lancamento(dados))

    def atualizar_lancamento(self, id, dados):
        """Muda data, estabelecimento, valor ou categoria. Ao corrigir a
        categoria, o Trace aprende a regra e aplica aos parecidos."""
        l = self.lancamentos.buscar(id)
        if l is None:
            raise KeyError(id)
        parecidos = 0
        # cada atribuição passa pelo setter do Model, que recusa valores inválidos
        if 'data' in dados:
            l.data = dados['data']
        if 'valor' in dados:
            l.valor = numero(dados['valor'])
        if 'descricao' in dados:
            l.descricao = dados['descricao']
            l.categoria = Categoria.classificar(l.descricao, self.preferencias().regras, self.categorias)
        if 'categoria' in dados:
            l.categoria = dados['categoria']
            chave = Categoria.chave_do_estabelecimento(l.descricao)
            if chave:
                prefs = self.preferencias()
                prefs.aprender(chave, l.categoria)
                self.preferencias_repo.atualizar(prefs)
                outros = [o for o in self.lancamentos.listar()
                          if o.id != l.id and o.categoria != l.categoria
                          and Categoria.chave_do_estabelecimento(o.descricao) == chave]
                for o in outros:
                    o.categoria = l.categoria
                self.lancamentos.atualizar_varios(outros)
                parecidos = len(outros)
        self.lancamentos.atualizar(l)
        return l, parecidos

    def remover_lancamento(self, id):
        if not self.lancamentos.remover(id):
            raise KeyError(id)

    def limpar_mes(self, mes):
        if not mes_valido(mes):
            raise ErroDeValidacao('Mês inválido.')
        return self.lancamentos.remover_onde(lambda l: l.mes == mes)


    # ------------------------------------------------------------ importação
    def importar(self, texto, mes):
        """Lê a fatura colada (ou um CSV) e cria os lançamentos.
        Datas sem ano (05/11) usam o ano do mês escolhido."""
        ano = int(mes[:4]) if mes_valido(mes) else date.today().year
        novos, ignoradas = [], 0
        for bruta in str(texto or '').splitlines():
            linha = re.sub(r'["\t;]+', ' ', bruta).strip()
            if not linha:
                continue
            m = LINHA.match(linha)
            if not m:
                ignoradas += 1
                continue
            data = m.group(1)
            try:
                if '-' in data:
                    iso = date.fromisoformat(data).isoformat()
                else:
                    partes = data.split('/')
                    a = ano
                    if len(partes) == 3:
                        a = int(partes[2]) + (2000 if len(partes[2]) == 2 else 0)
                    iso = date(a, int(partes[1]), int(partes[0])).isoformat()
                novos.append(self._montar_lancamento({'data': iso, 'descricao': m.group(2),
                                                      'valor': m.group(3)}))
            except (ValueError, ErroDeValidacao):
                ignoradas += 1
        self.lancamentos.inserir_varios(novos)
        return novos, ignoradas


    def carregar_exemplo(self):
        """Fatura fictícia do mês atual (a mesma do Nível 1) + 3 porquinhos."""
        atual = mes_atual()
        self.lancamentos.remover_onde(lambda l: l.mes == atual)
        prefs = self.preferencias()
        prefs.limite = 1500.0
        self.preferencias_repo.atualizar(prefs)
        novos = [self._montar_lancamento({'data': '%s-%s' % (atual, dia), 'descricao': desc, 'valor': valor})
                 for dia, desc, valor in EXEMPLO]
        self.lancamentos.inserir_varios(novos)
        if not self.porquinhos.listar():
            self.porquinhos.inserir_varios([Porquinho(None, *p) for p in PORQUINHOS_EXEMPLO])
        return len(novos)


    # ------------------------------------------------------------ porquinhos (CRUD)
    def _sobra_livre(self, sem_id=None):
        sobra = self.fatura(mes_atual()).resumo()['sobra']
        usado = sum(p.aporte for p in self.porquinhos.listar() if p.id != sem_id)
        return max(0.0, round(sobra - usado, 2))

    def criar_porquinho(self, dados):
        nome = str(dados.get('nome', '')).strip()
        tipo = dados.get('tipo', 'Outro')
        meta = numero(dados.get('meta'))
        guardado = numero(dados.get('guardado') or 0)
        erros = Porquinho.validar(nome, tipo, meta, guardado)
        if erros:
            raise ErroDeValidacao(' '.join(erros))
        cor = Porquinho.CORES[len(self.porquinhos.listar()) % len(Porquinho.CORES)]
        return self.porquinhos.inserir(Porquinho(None, nome, tipo, meta, guardado, 0, cor))

    def atualizar_porquinho(self, id, dados):
        """Muda os dados da meta. O aporte nunca passa da sobra que resta;
        se passar, ele é reduzido e a resposta avisa."""
        p = self.porquinhos.buscar(id)
        if p is None:
            raise KeyError(id)
        aviso = None
        nome = str(dados.get('nome', p.nome)).strip()
        tipo = dados.get('tipo', p.tipo)
        meta = numero(dados.get('meta', p.meta))
        guardado = numero(dados.get('guardado', p.guardado))
        erros = Porquinho.validar(nome, tipo, meta, guardado)
        if erros:
            raise ErroDeValidacao(' '.join(erros))
        p.nome, p.tipo, p.meta, p.guardado = nome, tipo, meta, guardado
        if 'aporte' in dados:
            aporte = max(0.0, round(numero(dados['aporte']), 2))
            teto = self._sobra_livre(sem_id=p.id)
            if aporte > teto:
                aporte = teto
                aviso = 'Só restam R$ %s de sobra para este porquinho.' % (
                    '{:,.2f}'.format(teto).replace(',', 'X').replace('.', ',').replace('X', '.'))
            p.aporte = aporte
        self.porquinhos.atualizar(p)
        return p, aviso

    def remover_porquinho(self, id):
        if not self.porquinhos.remover(id):
            raise KeyError(id)


    # ------------------------------------------------------------ investimentos (polimorfismo)
    def simular_investimentos(self, dados):
        """Compara três investimentos com os mesmos valores de entrada.
        O laço chama resumo() em cada um sem saber qual é qual: cada classe
        filha calcula a própria taxa e o próprio imposto."""
        try:
            inicial, aporte = numero(dados.get('inicial', 0)), numero(dados.get('aporte', 0))
            prazo = int(round(numero(dados.get('prazo', 12))))
            cdi, poup, cdb = numero(dados.get('cdi', 12)), numero(dados.get('poup', 0.5)), numero(dados.get('cdb', 100))
        except ErroDeValidacao:
            raise ErroDeValidacao('Confira os valores: use números, com prazo de 1 a 600 meses.')
        opcoes = [
            DinheiroParado(inicial, aporte, prazo),
            Poupanca(inicial, aporte, prazo, poup),
            CDB(inicial, aporte, prazo, cdi, cdb)
        ]
        resultados = {inv.CHAVE: inv.resumo() for inv in opcoes}
        melhor = max(opcoes, key=lambda inv: resultados[inv.CHAVE]['saldo_liquido'])
        return {
            'prazo': prazo,
            'investido': resultados['parado']['investido'],
            'opcoes': resultados,
            'melhor': melhor.CHAVE
        }


    # ------------------------------------------------------------ resumo da conta
    def contagem(self):
        lancamentos = self.lancamentos.listar()
        return {
            'lancamentos': len(lancamentos),
            'parcelados': sum(1 for l in lancamentos if l.parcelado),
            'porquinhos': len(self.porquinhos.listar()),
            'limite': self.preferencias().limite
        }


    # ------------------------------------------------------------ tudo
    def apagar_tudo(self):
        self.lancamentos.remover_onde(lambda l: True)
        self.porquinhos.remover_onde(lambda p: True)
        self.preferencias_repo.remover_onde(lambda p: True)
