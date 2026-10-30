var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');

router.get('/', function(req, res, next) {
  res.render('equipamentos', {
    title: 'Equipamentos',
    equipamentos: objetos.filtrarPorTipo('Equipamento', req.query),
    tecnologias: equipamentoOpcoes.listar('tecnologia'),
    modelos: equipamentoOpcoes.listar('modelo'),
    filtros: req.query
  });
});

module.exports = router;
