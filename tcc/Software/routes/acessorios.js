var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');

router.get('/', function(req, res, next) {
  var modelosPorTipo = equipamentoOpcoes.listarModelosAcessorio();
  var modelos = [];

  Object.keys(modelosPorTipo).forEach(function(tipo) {
    modelosPorTipo[tipo].forEach(function(modelo) {
      if (modelos.indexOf(modelo) < 0) {
        modelos.push(modelo);
      }
    });
  });

  res.render('acessorios', {
    title: 'Acessórios',
    acessorios: objetos.filtrarPorTipo('Acessório', req.query),
    tiposAcessorio: equipamentoOpcoes.listar('tipoAcessorio'),
    modelos: modelos,
    filtros: req.query
  });
});

module.exports = router;
