(function () {
  var openTooltip = null;

  function closeTooltip() {
    if (openTooltip) {
      openTooltip.remove();
      openTooltip = null;
    }
  }

  function openRelationTooltip(trigger) {
    var tooltip = document.createElement('div');
    var title = document.createElement('strong');
    var intro = document.createElement('p');
    var details = document.createElement('div');
    var relation = {};
    var rect;

    closeTooltip();
    try {
      relation = JSON.parse(trigger.getAttribute('data-relacao') || '{}');
    } catch (erro) {
      relation = {};
    }
    tooltip.className = 'dica-relacao';
    tooltip.setAttribute('role', 'status');
    title.textContent = trigger.getAttribute('data-titulo-relacao') || 'Detalhes da relação';
    intro.textContent = trigger.textContent.trim();
    details.appendChild(criarLinha('Garantia', relation.garantia));
    details.appendChild(criarLinha('Data de instalação', relation.dataInstalacao));
    details.appendChild(criarLinha('Data de retirada', relation.dataRetirada));
    tooltip.appendChild(title);
    tooltip.appendChild(intro);
    tooltip.appendChild(details);
    document.body.appendChild(tooltip);
    rect = trigger.getBoundingClientRect();
    tooltip.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - tooltip.offsetWidth - 12)) + 'px';
    tooltip.style.top = (rect.bottom + 8) + 'px';
    openTooltip = tooltip;
  }

  function criarLinha(rotulo, valor) {
    var linha = document.createElement('div');
    var label = document.createElement('span');
    var conteudo = document.createElement('strong');
    label.textContent = rotulo;
    conteudo.textContent = valor || 'Não informada';
    linha.appendChild(label);
    linha.appendChild(conteudo);
    return linha;
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('.gatilho-relacao');

    if (trigger) {
      event.preventDefault();
      openRelationTooltip(trigger);
      return;
    }
    if (!event.target.closest('.dica-relacao')) {
      closeTooltip();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeTooltip();
    }
  });
}());
