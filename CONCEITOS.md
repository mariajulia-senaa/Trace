# Trace · conceitos de Orientação a Objetos (Nível 3)

Trace é um app de finanças pessoais em Python com Bottle, seguindo o BMVC
(Bottle + Model + View + Controller). Este arquivo mostra **onde** cada conceito
está no código.

## Estrutura BMVC

| Camada | Onde | O que faz |
|---|---|---|
| **Model** | `app/models/` | Regras e dados: `Usuario`, `Sessao`, `Lancamento` (+ `LancamentoAVista`, `LancamentoParcelado`), `Fatura`, `Porquinho`, `Preferencias`, `Categoria`, `Investimento` (+ `DinheiroParado`, `Poupanca`, `CDB`) |
| **View** | `app/views/html/` | Páginas TPL: `inicio.tpl` (apresentação + entrar/criar conta), `trace.tpl` (app), `conta.tpl` (Minha conta), `_capi.tpl` (mascote dos Porquinhos) |
| **Controller** | `app/controllers/` | `Application` (páginas), `Autenticacao` (login, sessão e conta), `Financas` (regras do app, por usuário), `Repositorio` e `RepositorioDoUsuario` (CRUD em JSON) |
| **Rotas** | `route.py` | Recebem a requisição e chamam o Controller |
| **Estáticos** | `app/static/css`, `app/static/js` | Visual e interação de cada página |

Os dados ficam em arquivos JSON na pasta `app/controllers/db/` (ignorados pelo git).

## Abstração (classes abstratas)

- `Modelo` (`app/models/modelo.py`) é a base abstrata de todos os models gravados no banco. Ela obriga as filhas a implementar `to_dict()`, `from_dict()` e `descrever()`. Fazer `Modelo()` dá erro.
- `Lancamento` (`app/models/lancamento.py`) também é abstrata. Ela declara `parcela_no_mes()`, `projetar()`, `falta_pagar_depois_de()`, `parcelado`, `valor_total`…, mas não as implementa.
- `Investimento` (`app/models/investimento.py`) é abstrata e declara `taxa_mensal()`.

## Herança

```
Modelo (abstrata)
├── ModeloDoUsuario          (todo objeto que tem dono)
│   ├── Lancamento (abstrata)
│   │   ├── LancamentoAVista
│   │   └── LancamentoParcelado
│   ├── Porquinho
│   └── Preferencias
├── Usuario
└── Sessao

Repositorio
└── RepositorioDoUsuario     (sobrescreve só _visivel() e _preparar())

Investimento (abstrata)
├── DinheiroParado
├── Poupanca
└── CDB
```

- `LancamentoParcelado.descrever()` sobrescreve o método da mãe e reaproveita o texto dela com `super().descrever()`.
- `ErroDeValidacao` herda de `ErroDoTrace` e de `ValueError` (herança múltipla, `app/models/erros.py`).
- `RepositorioDoUsuario` herda todo o CRUD do `Repositorio` e muda só dois métodos "gancho" para enxergar apenas os dados do usuário logado.

## Polimorfismo

- **Lançamentos:** a `Fatura` (`app/models/fatura.py`) chama `parcela_no_mes(mes)` e `projetar(mes)` em todos os lançamentos sem saber o tipo. O `LancamentoAVista` responde "só no meu mês". O `LancamentoParcelado` calcula a parcela que cai em cada mês seguinte e gera a linha automática.
- **Investimentos:** `Financas.simular_investimentos()` percorre `[DinheiroParado, Poupanca, CDB]` e chama `resumo()` em cada um. O cálculo do saldo (`evolucao()`) é o mesmo para todos. Cada filha muda só `taxa_mensal()`, e só o `CDB` sobrescreve `imposto()` (IR regressivo).
- **Fábrica:** `Lancamento.criar()` e `Lancamento.from_dict()` devolvem a classe filha certa conforme o número de parcelas.
- `__repr__` (herdado de `Modelo`) usa `descrever()`, que cada classe responde do seu jeito.

## Encapsulamento

- Atributos **protegidos** (`_valor`, `_data`, `_descricao`, `_meta`, `_limite`…) só mudam pelos **setters** (`@property`), que recusam valores inválidos: valor ≤ 0, data inexistente, categoria desconhecida, meta zero…
- `parcela` e `total_parcelas` são **só de leitura**.
- `Preferencias.limites` e `regras` devolvem **cópias**, e só mudam por `definir_limite()` e `aprender()`.
- `Investimento` guarda `__inicial`, `__aporte` e `__prazo` como **privados** (name mangling).
- `Usuario` guarda `__sal` e `__senha_hash` como **privados**, sem propriedade pública para ler. Só dá para usar `definir_senha()` e `confere_senha()`, e a senha é guardada com PBKDF2 e sal, nunca como foi digitada.
- `Sessao` tem token, dono e validade **só de leitura**.

## CRUD

| Recurso | Create | Read | Update | Delete |
|---|---|---|---|---|
| Lançamento | `POST /api/lancamentos` | `GET /api/estado?mes=` | `PUT /api/lancamentos/<id>` | `DELETE /api/lancamentos/<id>`, `DELETE /api/meses/<mes>` |
| Porquinho | `POST /api/porquinhos` | `GET /api/estado` | `PUT /api/porquinhos/<id>` | `DELETE /api/porquinhos/<id>` |
| Preferências | criadas na 1ª leitura | `GET /api/estado` | `PUT /api/preferencias` | `DELETE /api/tudo` |
| Usuário | `POST /cadastro` | `GET /conta` | `POST /conta/nome`, `POST /conta/senha` | `POST /conta/excluir` |

O `Repositorio` (`app/controllers/repositorio.py`) faz o CRUD no arquivo JSON, com `FileLock` para duas requisições não gravarem ao mesmo tempo.

## Composição

A `Fatura` é montada a partir dos objetos `Lancamento` de um mês. O controller `Financas` reúne `Repositorio`, `Fatura`, `Categoria` e os investimentos.

## Controle de acesso (Nível 3)

- `/` sem login mostra a página de apresentação. Com login, mostra o app.
- `/conta` e toda a API (`/api/...`) são **restritas**: sem sessão, a página leva ao login e a API responde 401.
- Login (`POST /login`) cria uma `Sessao` com token aleatório num cookie HttpOnly, que vale 7 dias e fica gravada em arquivo. Logout (`POST /sair`) apaga a sessão.
- Cada conta só enxerga os próprios dados (`RepositorioDoUsuario`). Tentar apagar um lançamento de outra pessoa dá 404.

## Testes feitos

- Testes de unidade dos models: classes abstratas não instanciam, herança, respostas polimórficas, setters recusando valores inválidos, atributos privados.
- Testes de ponta a ponta no navegador (Playwright), com o servidor rodando de verdade.
