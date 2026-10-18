var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

router.get('/', function(req, res, next) {
  res.render('clientes', {
    title: 'Clientes',
    clientes: objetos.filtrarPorTipo('Cliente', req.query),
    filtros: req.query
  });
});

module.exports = router;
