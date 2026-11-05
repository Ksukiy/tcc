var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');

router.get('/', function(req, res, next) {
  res.render('acessorios', {
    title: 'Acessórios',
    acessorios: objetos.filtrarPorTipo('Acessório', req.query),
    tiposAcessorio: equipamentoOpcoes.listar('tipoAcessorio'),
    modelos: equipamentoOpcoes.listarModelosAcessorioUnicos(),
    filtros: req.query
  });
});

module.exports = router;
