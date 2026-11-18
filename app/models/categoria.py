import re
import unicodedata


def normalizar(texto):
    """Maiúsculas e sem acentos: 'Farmácia' -> 'FARMACIA'."""
    sem_acento = unicodedata.normalize('NFD', texto)
    sem_acento = ''.join(c for c in sem_acento if unicodedata.category(c) != 'Mn')
    return sem_acento.upper()


def palavras(texto):
    """Quebra a descrição em palavras simples (só letras e números)."""
    return [p for p in re.sub(r'[^A-Z0-9 ]+', ' ', normalizar(texto)).split() if p]


class Categoria():
    """Model: uma categoria de gasto da fatura.

    Guarda o nome, a cor usada nos gráficos, as palavras-chave que o Trace usa
    para classificar os lançamentos e o limite sugerido para a categoria.
    """

    def __init__(self, nome, cor, palavras_chave=None, limite=0):
        self.nome = nome
        self.cor = cor
        self.palavras_chave = palavras_chave or []
        self.limite = limite


    def reconhece(self, descricao):
        """True se alguma palavra-chave aparece na descrição."""
        lista = palavras(descricao)
        texto = ' ' + ' '.join(lista) + ' '
        for chave in self.palavras_chave:
            p = normalizar(chave)
            if ' ' in p:
                if ' ' + p + ' ' in texto:
                    return True
            elif any(t == p or (len(p) >= 4 and t.startswith(p)) for t in lista):
                return True
        return False


    def to_dict(self):
        return {
            'nome': self.nome,
            'cor': self.cor,
            'palavras_chave': self.palavras_chave,
            'limite': self.limite
        }


    # ------------------------------------------------------------------
    @staticmethod
    def chave_do_estabelecimento(descricao):
        """As duas primeiras palavras só de letras: usada para aprender regras.
        'IFOOD *LANCHES' e 'IFOOD *RESTAURANTE' -> 'IFOOD LANCHES' / 'IFOOD RESTAURANTE';
        'UBER *TRIP' em qualquer dia -> 'UBER TRIP'."""
        so_letras = [p for p in palavras(descricao) if re.fullmatch(r'[A-Z]{2,}', p)]
        return ' '.join(so_letras[:2])


    @staticmethod
    def classificar(descricao, regras=None, categorias=None):
        """Escolhe a categoria de uma descrição.

        1. Se a pessoa já corrigiu um estabelecimento parecido, vale a regra dela.
        2. Senão, a primeira categoria cuja palavra-chave aparece.
        3. Senão, 'Outros'.
        """
        regras = regras or {}
        chave = Categoria.chave_do_estabelecimento(descricao)
        if chave and chave in regras:
            return regras[chave]
        for categoria in (categorias or Categoria.padrao()):
            if categoria.reconhece(descricao):
                return categoria.nome
        return 'Outros'


    @staticmethod
    def nomes():
        return [c.nome for c in Categoria.padrao()]


    @staticmethod
    def padrao():
        """Categorias que o Trace conhece de saída. 'Outros' fica por último,
        pois recebe tudo o que não casar com as palavras-chave das demais."""
        return [
            Categoria('Alimentação', '#3DDC97',
                      ['IFOOD', 'RAPPI', 'RESTAURANTE', 'SUPERMERCADO', 'MERCADO',
                       'PADARIA', 'LANCHONETE', 'PIZZARIA', 'HAMBURGUERIA',
                       'ACOUGUE', 'SORVETERIA'], 450),
            Categoria('Transporte', '#5B9DFF',
                      ['UBER', '99', 'POSTO', 'COMBUSTIVEL', 'ESTACIONAMENTO',
                       'PEDAGIO', 'METRO', 'ONIBUS', 'BILHETE UNICO'], 200),
            Categoria('Assinaturas', '#B392F0',
                      ['NETFLIX', 'SPOTIFY', 'AMAZON PRIME', 'DISNEY', 'HBO',
                       'GLOBOPLAY', 'YOUTUBE', 'DEEZER', 'ICLOUD', 'GOOGLE ONE'], 120),
            Categoria('Saúde', '#FF8FB1',
                      ['FARMACIA', 'DROGARIA', 'DROGASIL', 'HOSPITAL', 'CLINICA',
                       'LABORATORIO', 'DENTISTA', 'UNIMED', 'PAGUE MENOS'], 150),
            Categoria('Lazer', '#E8A06B',
                      ['CINEMA', 'TEATRO', 'INGRESSO', 'SHOW', 'BAR', 'PARQUE',
                       'STEAM', 'PLAYSTATION', 'XBOX', 'BOLICHE'], 200),
            Categoria('Educação', '#7DD3FC',
                      ['CURSO', 'UDEMY', 'ALURA', 'COURSERA', 'FACULDADE', 'ESCOLA',
                       'LIVRARIA', 'MENSALIDADE', 'UNIVERSIDADE'], 150),
            Categoria('Moda e beleza', '#E879F9',
                      ['ROUPA', 'VESTIDO', 'CAMISA', 'CAMISETA', 'CALCA', 'BLUSA',
                       'SAIA', 'JAQUETA', 'SAPATO', 'TENIS', 'SANDALIA', 'BOTA',
                       'CALCADO', 'BOLSA', 'MAQUIAGEM', 'BATOM', 'PERFUMARIA',
                       'COSMETICO', 'BOTICARIO', 'NATURA', 'SEPHORA', 'RENNER',
                       'RIACHUELO', 'ZARA', 'SHEIN', 'HERING', 'MARISA'], 250),
            Categoria('Outros', '#7A8A84', [], 200)
        ]
