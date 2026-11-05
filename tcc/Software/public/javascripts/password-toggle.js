(function () {
  document.querySelectorAll('.alternador-senha').forEach(function (toggle) {
    var field = toggle.closest('.campo-senha');
    var input = field && field.querySelector('input[type="password"], input[type="text"]');

    if (!input) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isVisible = input.type === 'text';

      input.type = isVisible ? 'password' : 'text';
      toggle.setAttribute('aria-pressed', String(!isVisible));
      toggle.setAttribute('aria-label', isVisible ? 'Mostrar senha' : 'Ocultar senha');
      toggle.classList.toggle('visivel', !isVisible);
    });
  });
}());
