var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

router.get('/', function(req, res, next) {
  res.render('acessorios', {
    title: 'Acessórios',
    acessorios: objetos.filtrarPorTipo('Acessório', req.query),
    filtros: req.query
  });
});

module.exports = router;
