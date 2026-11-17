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


    def to_dict(self):
        return {
            'nome': self.nome,
            'cor': self.cor,
            'palavras_chave': self.palavras_chave,
            'limite': self.limite
        }


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
            Categoria('Outros', '#7A8A84', [], 200)
        ]
