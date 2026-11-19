/* Trace · página Minha conta: confere as senhas antes de enviar e pede
 * um segundo clique para excluir a conta (sem janelas de alerta). */
(function () {
  'use strict';

  // Trocar senha: as duas senhas novas precisam ser iguais.
  document.querySelectorAll('[data-form-conta]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const nova = form.querySelector('[name="nova"]');
      const confirmacao = form.querySelector('[name="confirmacao"]');
      const caixa = form.querySelector('[data-erro-conta]');
      if (!nova || !caixa) return;
      let erro = '';
      if (nova.value.length < 6) erro = 'A nova senha precisa ter pelo menos 6 caracteres.';
      else if (nova.value !== confirmacao.value) erro = 'As senhas novas não são iguais.';
      caixa.textContent = erro;
      caixa.hidden = !erro;
      if (erro) e.preventDefault();
    });
  });

  // Excluir conta: primeiro clique só arma o botão; o segundo envia.
  const form = document.getElementById('form-excluir');
  const botao = document.getElementById('btn-excluir');
  if (form && botao) {
    let armado = false;
    form.addEventListener('submit', (e) => {
      if (armado) return;
      e.preventDefault();
      armado = true;
      botao.textContent = 'Clique de novo para excluir de vez';
      setTimeout(() => {
        armado = false;
        botao.textContent = 'Excluir minha conta';
      }, 5000);
    });
  }
})();
