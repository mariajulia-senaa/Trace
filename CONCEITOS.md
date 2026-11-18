# Trace · conceitos de Orientação a Objetos (Nível 2)

Trace é um app de finanças pessoais em Python com Bottle, seguindo o BMVC
(Bottle + Model + View + Controller). Este arquivo mostra **onde** cada conceito
está no código.

## Estrutura BMVC

| Camada | Onde | O que faz |
|---|---|---|
| **Model** | `app/models/` | Regras e dados: `Lancamento` (+ `LancamentoAVista`, `LancamentoParcelado`), `Fatura`, `Porquinho`, `Preferencias`, `Categoria`, `Investimento` (+ `DinheiroParado`, `Poupanca`, `CDB`) |
| **View** | `app/views/html/` | Páginas TPL: `trace.tpl` (app com 4 abas) |
| **Controller** | `app/controllers/` | `Application` (páginas), `Financas` (regras do app), `Repositorio` (CRUD em JSON) |
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
├── Lancamento (abstrata)
│   ├── LancamentoAVista
│   └── LancamentoParcelado
├── Porquinho
└── Preferencias

Investimento (abstrata)
├── DinheiroParado
├── Poupanca
└── CDB
```

- `LancamentoParcelado.descrever()` sobrescreve o método da mãe e reaproveita o texto dela com `super().descrever()`.
- `ErroDeValidacao` herda de `ErroDoTrace` e de `ValueError` (herança múltipla, `app/models/erros.py`).

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

## CRUD

| Recurso | Create | Read | Update | Delete |
|---|---|---|---|---|
| Lançamento | `POST /api/lancamentos` | `GET /api/estado?mes=` | `PUT /api/lancamentos/<id>` | `DELETE /api/lancamentos/<id>`, `DELETE /api/meses/<mes>` |
| Porquinho | `POST /api/porquinhos` | `GET /api/estado` | `PUT /api/porquinhos/<id>` | `DELETE /api/porquinhos/<id>` |
| Preferências | criadas na 1ª leitura | `GET /api/estado` | `PUT /api/preferencias` | `DELETE /api/tudo` |

O `Repositorio` (`app/controllers/repositorio.py`) faz o CRUD no arquivo JSON, com `FileLock` para duas requisições não gravarem ao mesmo tempo.

## Composição

A `Fatura` é montada a partir dos objetos `Lancamento` de um mês. O controller `Financas` reúne `Repositorio`, `Fatura`, `Categoria` e os investimentos.

## Testes feitos

- Testes de unidade dos models: classes abstratas não instanciam, herança, respostas polimórficas, setters recusando valores inválidos, atributos privados.
- Testes de ponta a ponta no navegador (Playwright), com o servidor rodando de verdade.
