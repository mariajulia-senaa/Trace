import json
import os

from filelock import FileLock


PASTA_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db')


class Repositorio():
    """Guarda objetos de um Model em um arquivo JSON da pasta db/.

    É o CRUD de verdade: inserir (Create), listar/buscar (Read),
    atualizar (Update) e remover (Delete). O FileLock impede que duas
    requisições escrevam o arquivo ao mesmo tempo.

    Este repositório enxerga TODOS os registros (usado para usuários e
    sessões). A classe filha RepositorioDoUsuario muda só dois "ganchos"
    (_visivel e _preparar) para enxergar apenas os dados de uma pessoa.
    """

    def __init__(self, nome, classe):
        os.makedirs(PASTA_DB, exist_ok=True)
        self._classe = classe
        self._caminho = os.path.join(PASTA_DB, nome + '.json')
        self._trava = FileLock(self._caminho + '.lock')


    # ------------------------------------------------------------ ganchos (as filhas sobrescrevem)
    def _visivel(self, registro):
        """Este registro faz parte do que o repositório enxerga?"""
        return True

    def _preparar(self, objeto):
        """Transforma o objeto no dicionário que vai para o arquivo."""
        return objeto.to_dict()


    # ------------------------------------------------------------ arquivo
    def _ler(self):
        if not os.path.exists(self._caminho):
            return []
        with open(self._caminho, encoding='utf-8') as arquivo:
            try:
                return json.load(arquivo)
            except json.JSONDecodeError:
                return []

    def _gravar(self, registros):
        temporario = self._caminho + '.tmp'
        with open(temporario, 'w', encoding='utf-8') as arquivo:
            json.dump(registros, arquivo, ensure_ascii=False, indent=2)
        os.replace(temporario, self._caminho)   # troca o arquivo de uma vez só


    # ------------------------------------------------------------ CRUD
    def listar(self):
        with self._trava:
            return [self._classe.from_dict(r) for r in self._ler() if self._visivel(r)]

    def buscar(self, id):
        for objeto in self.listar():
            if objeto.id == id:
                return objeto
        return None

    def buscar_por(self, campo, valor):
        for objeto in self.listar():
            if getattr(objeto, campo) == valor:
                return objeto
        return None

    def inserir(self, objeto):
        with self._trava:
            registros = self._ler()
            objeto.id = max((r['id'] for r in registros), default=0) + 1
            registros.append(self._preparar(objeto))
            self._gravar(registros)
        return objeto

    def inserir_varios(self, objetos):
        with self._trava:
            registros = self._ler()
            proximo = max((r['id'] for r in registros), default=0) + 1
            for objeto in objetos:
                objeto.id = proximo
                proximo += 1
                registros.append(self._preparar(objeto))
            self._gravar(registros)
        return objetos

    def atualizar(self, objeto):
        with self._trava:
            registros = self._ler()
            for i, r in enumerate(registros):
                if r['id'] == objeto.id and self._visivel(r):
                    registros[i] = self._preparar(objeto)
                    self._gravar(registros)
                    return True
        return False

    def atualizar_varios(self, objetos):
        por_id = {o.id: o for o in objetos}
        with self._trava:
            registros = [self._preparar(por_id[r['id']]) if r['id'] in por_id and self._visivel(r) else r
                         for r in self._ler()]
            self._gravar(registros)

    def remover(self, id):
        with self._trava:
            registros = self._ler()
            restantes = [r for r in registros if not (r['id'] == id and self._visivel(r))]
            if len(restantes) == len(registros):
                return False
            self._gravar(restantes)
        return True

    def remover_onde(self, condicao):
        """Remove todos os objetos visíveis para os quais condicao(objeto) é True."""
        with self._trava:
            registros = self._ler()
            restantes = [r for r in registros if not (self._visivel(r) and condicao(self._classe.from_dict(r)))]
            self._gravar(restantes)
        return len(registros) - len(restantes)


class RepositorioDoUsuario(Repositorio):
    """HERANÇA: o mesmo CRUD do Repositorio, mas só com os dados de uma
    pessoa. Sobrescreve apenas os dois ganchos; todo o resto é herdado."""

    def __init__(self, nome, classe, dono):
        super().__init__(nome, classe)
        if not isinstance(dono, int) or dono < 1:
            raise ValueError('O dono precisa ser o id de um usuário.')
        self.__dono = dono

    @property
    def dono(self):
        return self.__dono

    def _visivel(self, registro):
        return registro.get('usuario_id') == self.__dono

    def _preparar(self, objeto):
        objeto.usuario_id = self.__dono          # todo objeto gravado aqui é desta pessoa
        return objeto.to_dict()
