/* Trace · Nível 4: atualização em tempo real (Websocket com Socket.IO).
 *
 * A página abre uma conexão permanente com o servidor. Quando outra aba ou
 * outro aparelho da mesma conta muda algum dado, o servidor avisa por aqui
 * e esta tela busca o estado novo e se redesenha sozinha.
 */
(function () {
  'use strict';

  const T = window.Trace;
  const $ = T.$;

  function indicador(estado, texto) {
    const el = $('#ao-vivo');
    if (!el) return;
    el.className = 'ao-vivo ' + estado;
    $('#ao-vivo-texto').textContent = texto;
  }

  function piscar() {
    const alvo = document.querySelector('.painel-aba:not([hidden])');
    if (!alvo) return;
    alvo.classList.remove('atualizou');
    void alvo.offsetWidth;   // reinicia a animação
    alvo.classList.add('atualizou');
  }

  T.aoIniciar(function () {
    if (typeof io !== 'function') {
      indicador('desligado', 'Sem tempo real');
      return;
    }

    // O cookie de login vai junto: o servidor só aceita quem está logado.
    const socket = io({ auth: { cliente: T.cliente } });
    T.socket = socket;

    let telas = 1;
    const textoAoVivo = () => (telas > 1 ? 'Ao vivo · ' + telas + ' telas abertas' : 'Ao vivo');

    socket.on('connect', () => indicador('ligado', textoAoVivo()));
    socket.on('disconnect', () => indicador('conectando', 'Reconectando…'));
    socket.on('connect_error', (erro) => {
      if (erro && erro.message === 'nao autorizado') {
        location.href = '/login';
        return;
      }
      indicador('conectando', 'Reconectando…');
    });

    socket.on('presenca', (dados) => {
      telas = dados.conexoes;
      if (socket.connected) indicador('ligado', textoAoVivo());
    });

    socket.on('dados_alterados', async (dados) => {
      if (dados.origem === T.cliente) return;   // fui eu que mudei
      try {
        await T.recarregar();
        piscar();
        T.avisar('Atualizado em outra tela: ' + dados.texto);
      } catch (e) {
        T.avisar(e.message, 'erro');
      }
    });

    // Logout em outra aba: se a minha sessão também acabou, a API responde
    // 401 e o core.js leva para o login.
    socket.on('sessao_encerrada', () => T.recarregar().catch(() => {}));
  });
})();
