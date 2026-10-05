var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

router.get('/', function(req, res, next) {
  res.render('veiculos', {
    title: 'Veículos',
    veiculos: objetos.listarPorTipo('Veículo')
  });
});

module.exports = router;
