/* Trace · página de apresentação, login e cadastro.
 *
 * - gaveta "Entrar / Criar conta" (os formulários vão para o Bottle);
 * - elementos aparecem ao rolar, números contam, painéis seguem o mouse/dedo;
 * - na seção "Como o Trace cuida", blocos inclinam e ícones fogem do dedo.
 */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------ topo
  const topo = $('#topo');
  const marcarTopo = () => topo.classList.toggle('rolou', window.scrollY > 12);
  window.addEventListener('scroll', marcarTopo, { passive: true });
  marcarTopo();

  // ------------------------------------------------------------ gaveta de acesso
  const gaveta = $('#gaveta');
  let ultimoFoco = null;

  function trocarModo(modo) {
    gaveta.dataset.modo = modo;
    $$('.abas-acesso [role="tab"]').forEach((aba) => {
      const ativa = aba.dataset.modo === modo;
      aba.setAttribute('aria-selected', String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
    });
  }

  function primeiroCampo() {
    const form = gaveta.dataset.modo === 'cadastrar' ? $('#form-cadastrar') : $('#form-entrar');
    return Array.from(form.querySelectorAll('input')).find((i) => !i.value) || form.querySelector('input');
  }

  function abrir(modo) {
    ultimoFoco = document.activeElement;
    trocarModo(modo);
    gaveta.hidden = false;
    document.body.classList.add('travar-rolagem');
    requestAnimationFrame(() => {
      gaveta.classList.add('aberta');
      setTimeout(() => primeiroCampo().focus({ preventScroll: true }), 120);
    });
    const caminho = modo === 'cadastrar' ? '/cadastro' : '/login';
    if (location.pathname !== caminho) history.replaceState(null, '', caminho);
  }

  function fechar() {
    gaveta.classList.remove('aberta');
    document.body.classList.remove('travar-rolagem');
    setTimeout(() => (gaveta.hidden = true), 380);
    if (location.pathname !== '/') history.replaceState(null, '', '/');
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
  }

  $$('[data-abrir]').forEach((b) => b.addEventListener('click', () => abrir(b.dataset.abrir)));
  $$('[data-fechar]').forEach((b) => b.addEventListener('click', fechar));
  $$('.abas-acesso [role="tab"]').forEach((aba) => {
    aba.addEventListener('click', () => {
      trocarModo(aba.dataset.modo);
      history.replaceState(null, '', aba.dataset.modo === 'cadastrar' ? '/cadastro' : '/login');
      primeiroCampo().focus();
    });
    aba.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const outro = aba.dataset.modo === 'entrar' ? 'cadastrar' : 'entrar';
        trocarModo(outro);
        $('#aba-' + outro).focus();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (gaveta.hidden) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'Tab') {
      // mantém o foco dentro da gaveta
      const focaveis = $$('button, input, a[href]', gaveta).filter((el) => el.offsetParent !== null);
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });

  // a página veio de /login ou /cadastro (ou com erro do servidor): gaveta já aberta
  if (!gaveta.hidden) {
    trocarModo(gaveta.dataset.modo);
    document.body.classList.add('travar-rolagem');
    setTimeout(() => primeiroCampo().focus({ preventScroll: true }), 200);
  } else {
    trocarModo('entrar');
  }

  // ------------------------------------------------------------ mostrar / ocultar senha

  $$('[data-mostrar]').forEach((botao) => {
    botao.addEventListener('mousedown', (e) => e.preventDefault()); // não tira o foco do campo
    botao.addEventListener('click', () => {
      const campo = document.getElementById(botao.dataset.mostrar);
      const mostrar = campo.type === 'password';
      campo.type = mostrar ? 'text' : 'password';
      botao.textContent = mostrar ? 'Ocultar' : 'Mostrar';
      botao.setAttribute('aria-pressed', String(mostrar));
      botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      campo.focus();
    });
  });

  // ------------------------------------------------------------ força da senha
  const senhaNova = $('[data-forca]');
  const barra = $('[data-forca-barra]');
  const textoForca = $('[data-forca-texto]');
  if (senhaNova) {
    senhaNova.addEventListener('input', () => {
      const v = senhaNova.value;
      let pontos = 0;
      if (v.length >= 6) pontos++;
      if (v.length >= 10) pontos++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) pontos++;
      if (/\d/.test(v)) pontos++;
      if (/[^A-Za-z0-9]/.test(v)) pontos++;
      const niveis = [['Pelo menos 6 caracteres.', 0, ''], ['Fraca', 25, 'estouro'], ['Razoável', 50, 'atencao'], ['Boa', 75, 'ok'], ['Forte', 100, 'ok']];
      const n = v.length < 6 ? niveis[v.length ? 1 : 0] : niveis[Math.min(4, Math.max(1, pontos - 1))];
      barra.style.width = (v.length ? Math.max(n[1], 12) : 0) + '%';
      barra.className = n[2];
      textoForca.textContent = v.length && v.length < 6 ? 'Fraca: use pelo menos 6 caracteres.' : n[0];
    });
  }

  // ------------------------------------------------------------ conferência antes de enviar
  $$('[data-form-acesso]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const erros = [];
      const nome = form.querySelector('[name="nome"]');
      const email = form.querySelector('[name="email"]');
      const senha = form.querySelector('[name="senha"]');
      const confirmacao = form.querySelector('[name="confirmacao"]');
      if (nome && nome.value.trim().length < 2) erros.push('Informe seu nome.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) erros.push('Informe um e-mail válido.');
      if (senha.value.length < 6) erros.push('A senha precisa ter pelo menos 6 caracteres.');
      else if (confirmacao && confirmacao.value !== senha.value) erros.push('As senhas não são iguais.');
      const caixa = form.querySelector('[data-erro-form]');
      if (erros.length) {
        e.preventDefault();
        caixa.textContent = erros.join(' ');
        caixa.hidden = false;
        form.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 280 });
        return;
      }
      caixa.hidden = true;
      const botao = form.querySelector('button[type="submit"]');
      botao.disabled = true;
      botao.textContent = 'Aguarde…';
    });
  });

  // ------------------------------------------------------------ aparecer ao rolar + contadores
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function contar(el) {
    const alvo = parseFloat(el.dataset.contar);
    if (calmo) return;
    const inicio = performance.now();
    const duracao = 1400;
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = moeda.format(alvo * suave).replace(/ /g, ' ');
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  const alvos = $$('.revelar, .arte, .cf-barra');
  if ('IntersectionObserver' in window && !calmo) {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('visivel');
          entrada.target.querySelectorAll('[data-contar]').forEach(contar);
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );
    alvos.forEach((el) => observador.observe(el));
  } else {
    alvos.forEach((el) => el.classList.add('visivel'));
  }

  if (calmo) return; // daqui pra baixo é só movimento

  // ------------------------------------------------------------ paralaxe dos painéis (mouse e toque)
  function paralaxe(painel) {
    const camadas = $$('[data-profundidade]', painel);
    let alvoX = 0, alvoY = 0, x = 0, y = 0, rodando = false;
    const mover = (cx, cy) => {
      const r = painel.getBoundingClientRect();
      alvoX = ((cx - r.left) / r.width - 0.5) * 2;
      alvoY = ((cy - r.top) / r.height - 0.5) * 2;
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    };
    const soltar = () => { alvoX = 0; alvoY = 0; if (!rodando) { rodando = true; requestAnimationFrame(quadro); } };
    function quadro() {
      x += (alvoX - x) * 0.12;
      y += (alvoY - y) * 0.12;
      camadas.forEach((c) => {
        const p = parseFloat(c.dataset.profundidade) || 1;
        c.style.transform = 'translate3d(' + (x * p * 10).toFixed(2) + 'px,' + (y * p * 8).toFixed(2) + 'px,0)';
      });
      if (Math.abs(alvoX - x) > 0.001 || Math.abs(alvoY - y) > 0.001) requestAnimationFrame(quadro);
      else rodando = false;
    }
    painel.addEventListener('pointermove', (e) => mover(e.clientX, e.clientY));
    painel.addEventListener('pointerleave', soltar);
    painel.addEventListener('touchmove', (e) => mover(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    painel.addEventListener('touchend', soltar);
  }
  $$('[data-paralaxe]').forEach(paralaxe);

  // ------------------------------------------------------------ "Como o Trace cuida": blocos e ícones vivos
  const secao = $('[data-interativo]');
  if (secao) {
    const blocos = $$('.bloco-cuidado', secao);
    const soltos = $$('.solto', secao).map((el, i) => ({ el, x: 0, y: 0, vx: 0, vy: 0, fase: i * 1.3 }));
    let ponteiro = null;      // posição do mouse/dedo dentro da seção
    let visivel = false;

    const posicionar = (cx, cy) => {
      const r = secao.getBoundingClientRect();
      ponteiro = { x: cx - r.left, y: cy - r.top };
      secao.classList.add('ativa');
      blocos.forEach((b) => {
        const rb = b.getBoundingClientRect();
        const px = (cx - rb.left) / rb.width;
        const py = (cy - rb.top) / rb.height;
        b.style.setProperty('--px', (px * 100).toFixed(1) + '%');
        b.style.setProperty('--py', (py * 100).toFixed(1) + '%');
        const d = parseFloat(b.dataset.profundidade) || 1;
        // inclina na direção do ponteiro e "puxa" o bloco um pouco para ele
        const dx = Math.max(-1, Math.min(1, px - 0.5));
        const dy = Math.max(-1, Math.min(1, py - 0.5));
        const perto = Math.max(0, 1 - Math.hypot(dx, dy) / 1.6);
        b.style.transform =
          'rotateX(' + (-dy * 10 * perto).toFixed(2) + 'deg) rotateY(' + (dx * 12 * perto).toFixed(2) + 'deg) ' +
          'translate3d(' + (dx * 8 * d).toFixed(1) + 'px,' + (dy * 8 * d).toFixed(1) + 'px,' + (perto * 24).toFixed(1) + 'px)';
      });
    };
    const soltar = () => {
      ponteiro = null;
      secao.classList.remove('ativa');
      blocos.forEach((b) => (b.style.transform = ''));
    };
    secao.addEventListener('pointermove', (e) => posicionar(e.clientX, e.clientY));
    secao.addEventListener('pointerleave', soltar);
    secao.addEventListener('touchstart', (e) => posicionar(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    secao.addEventListener('touchmove', (e) => posicionar(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    secao.addEventListener('touchend', () => setTimeout(soltar, 400));

    // ícones soltos: flutuam sozinhos e fogem do ponteiro (mola simples)
    function quadro(t) {
      if (!visivel) return;
      const r = secao.getBoundingClientRect();
      soltos.forEach((s) => {
        const baseX = s.el.offsetLeft;
        const baseY = s.el.offsetTop;
        let fx = -s.x * 0.04;
        let fy = -s.y * 0.04;
        if (ponteiro) {
          const dx = baseX + s.x - ponteiro.x;
          const dy = baseY + s.y - ponteiro.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 180) {
            const forca = (180 - dist) / 180;
            fx += (dx / dist) * forca * 4;
            fy += (dy / dist) * forca * 4;
          }
        }
        s.vx = (s.vx + fx) * 0.86;
        s.vy = (s.vy + fy) * 0.86;
        s.x += s.vx;
        s.y += s.vy;
        const boia = Math.sin(t / 900 + s.fase) * 8;
        const giro = Math.sin(t / 1400 + s.fase) * 12 + s.vx * 3;
        s.el.style.transform = 'translate3d(' + s.x.toFixed(1) + 'px,' + (s.y + boia).toFixed(1) + 'px,0) rotate(' + giro.toFixed(1) + 'deg)';
      });
      if (r.bottom > 0 && r.top < window.innerHeight) requestAnimationFrame(quadro);
    }
    new IntersectionObserver((entradas) => {
      visivel = entradas[0].isIntersecting;
      if (visivel) requestAnimationFrame(quadro);
    }).observe(secao);

    // ao rolar no celular (sem ponteiro), os blocos ondulam de leve
    window.addEventListener('scroll', () => {
      if (ponteiro || !visivel) return;
      const r = secao.getBoundingClientRect();
      const progresso = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      blocos.forEach((b, i) => {
        const d = parseFloat(b.dataset.profundidade) || 1;
        b.style.transform = 'translate3d(0,' + (Math.sin(progresso * Math.PI * 2 + i) * 6 * d).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }
})();
