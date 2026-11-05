(function () {
  document.querySelectorAll('.filtros-lista').forEach(function (form) {
    var toggle = form.querySelector('.alternador-filtros');
    var panel = form.querySelector('.painel-filtros');

    function closePanel() {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      form.classList.remove('aberto');
    }

    function togglePanel() {
      var isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
      form.classList.toggle('aberto', !isOpen);
    }

    toggle.addEventListener('click', togglePanel);
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        closePanel();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePanel();
      }
    });
  });
}());
