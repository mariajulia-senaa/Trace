import json
import os

from filelock import FileLock


PASTA_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db')


class Repositorio():
    """Guarda objetos de um Model em um arquivo JSON da pasta db/.

    É o CRUD de verdade: inserir (Create), listar/buscar (Read),
    atualizar (Update) e remover (Delete). O FileLock impede que duas
    requisições escrevam o arquivo ao mesmo tempo.
    """

    def __init__(self, nome, classe):
        os.makedirs(PASTA_DB, exist_ok=True)
        self.classe = classe
        self.caminho = os.path.join(PASTA_DB, nome + '.json')
        self.trava = FileLock(self.caminho + '.lock')


    # ------------------------------------------------------------ arquivo
    def _ler(self):
        if not os.path.exists(self.caminho):
            return []
        with open(self.caminho, encoding='utf-8') as arquivo:
            try:
                return json.load(arquivo)
            except json.JSONDecodeError:
                return []

    def _gravar(self, registros):
        temporario = self.caminho + '.tmp'
        with open(temporario, 'w', encoding='utf-8') as arquivo:
            json.dump(registros, arquivo, ensure_ascii=False, indent=2)
        os.replace(temporario, self.caminho)   # troca o arquivo de uma vez só


    # ------------------------------------------------------------ CRUD
    def listar(self):
        with self.trava:
            return [self.classe.from_dict(r) for r in self._ler()]

    def buscar(self, id):
        for objeto in self.listar():
            if objeto.id == id:
                return objeto
        return None

    def inserir(self, objeto):
        with self.trava:
            registros = self._ler()
            objeto.id = max((r['id'] for r in registros), default=0) + 1
            registros.append(objeto.to_dict())
            self._gravar(registros)
        return objeto

    def inserir_varios(self, objetos):
        with self.trava:
            registros = self._ler()
            proximo = max((r['id'] for r in registros), default=0) + 1
            for objeto in objetos:
                objeto.id = proximo
                proximo += 1
                registros.append(objeto.to_dict())
            self._gravar(registros)
        return objetos

    def atualizar(self, objeto):
        with self.trava:
            registros = self._ler()
            for i, r in enumerate(registros):
                if r['id'] == objeto.id:
                    registros[i] = objeto.to_dict()
                    self._gravar(registros)
                    return True
        return False

    def atualizar_varios(self, objetos):
        por_id = {o.id: o for o in objetos}
        with self.trava:
            registros = [por_id[r['id']].to_dict() if r['id'] in por_id else r for r in self._ler()]
            self._gravar(registros)

    def remover(self, id):
        with self.trava:
            registros = self._ler()
            restantes = [r for r in registros if r['id'] != id]
            if len(restantes) == len(registros):
                return False
            self._gravar(restantes)
        return True

    def remover_onde(self, condicao):
        """Remove todos os objetos para os quais condicao(objeto) é True."""
        with self.trava:
            registros = self._ler()
            restantes = [r for r in registros if not condicao(self.classe.from_dict(r))]
            self._gravar(restantes)
        return len(registros) - len(restantes)
