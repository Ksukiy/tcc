(function () {
  document.querySelectorAll('.list-filters').forEach(function (form) {
    var toggle = form.querySelector('.filter-toggle');
    var panel = form.querySelector('.filter-panel');

    function closePanel() {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      form.classList.remove('is-open');
    }

    function togglePanel() {
      var isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
      form.classList.toggle('is-open', !isOpen);
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
