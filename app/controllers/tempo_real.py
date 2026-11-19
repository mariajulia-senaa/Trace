from http.cookies import SimpleCookie

import socketio

from app.controllers.autenticacao import Autenticacao


class TempoReal():
    """Controller do Websocket (Socket.IO).

    Cada pessoa logada entra numa 'sala' só dela. Quando uma aba ou um
    aparelho muda algum dado, o servidor avisa a sala inteira e as outras
    telas abertas se atualizam sozinhas, sem recarregar a página.
    """

    def __init__(self, acesso):
        self.acesso = acesso
        self.sio = socketio.Server(async_mode='eventlet')
        self.conexoes = {}          # usuario_id -> {sid: cliente}
        self.sio.on('connect', self.ao_conectar)
        self.sio.on('disconnect', self.ao_desconectar)


    @staticmethod
    def sala(usuario_id):
        return 'usuario-%s' % usuario_id


    # ------------------------------------------------------------ conexão
    def ao_conectar(self, sid, environ, auth=None):
        """Só aceita o socket de quem tem uma sessão válida (o mesmo cookie
        do login). Sem login, a conexão é recusada."""
        cookie = SimpleCookie(environ.get('HTTP_COOKIE', ''))
        token = cookie[Autenticacao.COOKIE].value if Autenticacao.COOKIE in cookie else None
        usuario = self.acesso.usuario_da_sessao(token)
        if usuario is None:
            raise socketio.exceptions.ConnectionRefusedError('nao autorizado')
        cliente = (auth or {}).get('cliente', '')
        self.sio.save_session(sid, {'usuario_id': usuario.id})
        self.sio.enter_room(sid, TempoReal.sala(usuario.id))
        self.conexoes.setdefault(usuario.id, {})[sid] = cliente
        self.avisar_presenca(usuario.id)

    def ao_desconectar(self, sid, *motivo):
        sessao = self.sio.get_session(sid)
        usuario_id = sessao.get('usuario_id')
        if usuario_id in self.conexoes:
            self.conexoes[usuario_id].pop(sid, None)
            self.avisar_presenca(usuario_id)


    # ------------------------------------------------------------ avisos
    def avisar_presenca(self, usuario_id):
        quantas = len(self.conexoes.get(usuario_id, {}))
        self.sio.emit('presenca', {'conexoes': quantas}, room=TempoReal.sala(usuario_id))

    def avisar_mudanca(self, usuario_id, texto, origem=None):
        """Chamado pelas rotas da API depois de cada alteração bem-sucedida."""
        self.sio.emit('dados_alterados', {'texto': texto, 'origem': origem},
                      room=TempoReal.sala(usuario_id))

    def encerrar_sessao(self, usuario_id):
        """Logout: avisa as outras abas da mesma pessoa."""
        self.sio.emit('sessao_encerrada', {}, room=TempoReal.sala(usuario_id))
