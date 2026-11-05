var express = require('express');
var router = express.Router();
var equipamentoOpcoes = require('../lib/equipamento-opcoes');

router.get('/', function(req, res) {
  res.json(equipamentoOpcoes.listarTodas());
});

router.post('/', function(req, res) {
  var operacao = req.body.operacao;
  var campo = req.body.campo;
  var atual = String(req.body.atual || '').trim();
  var valor = String(req.body.valor || '').trim();

  var modeloAcessorio = campo.indexOf('modeloAcessorio:') === 0;
  var tipoAcessorio = modeloAcessorio ? campo.slice('modeloAcessorio:'.length) : null;
  var campoValido = ['tecnologia', 'marca', 'tipoCliente', 'modelo', 'tipoAcessorio'].indexOf(campo) >= 0 || modeloAcessorio;

  if (!campoValido ||
      (operacao === 'adicionar' && !valor) ||
      (operacao !== 'adicionar' && !atual)) {
    return res.status(400).json({ message: 'Informe uma operação e dados válidos.' });
  }

  if (operacao === 'adicionar') {
    if (modeloAcessorio) {
      equipamentoOpcoes.adicionarModeloAcessorio(tipoAcessorio, valor);
    } else {
      equipamentoOpcoes.adicionar(campo, valor);
    }
  } else if (operacao === 'editar') {
    var editado = modeloAcessorio
      ? equipamentoOpcoes.editarModeloAcessorio(tipoAcessorio, atual, valor)
      : equipamentoOpcoes.editar(campo, atual, valor);
    if (!editado) {
      return res.status(400).json({ message: 'Não foi possível editar esta entrada.' });
    }
  } else if (operacao === 'remover') {
    var removido = modeloAcessorio
      ? equipamentoOpcoes.removerModeloAcessorio(tipoAcessorio, atual)
      : equipamentoOpcoes.remover(campo, atual);
    if (!removido) {
      return res.status(400).json({ message: 'Não foi possível remover esta entrada.' });
    }
  } else {
    return res.status(400).json({ message: 'Operação inválida.' });
  }

  res.json(equipamentoOpcoes.listarTodas());
});

module.exports = router;
