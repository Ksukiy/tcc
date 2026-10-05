var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

router.get('/', function(req, res, next) {
  res.render('equipamentos', {
    title: 'Equipamentos',
    equipamentos: objetos.listarPorTipo('Equipamento')
  });
});

module.exports = router;
