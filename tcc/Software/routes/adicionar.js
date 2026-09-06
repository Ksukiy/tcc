var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var tipos = ['Equipamento', 'Acessório', 'Veículo', 'Cliente'];
  var tipoSelecionado = tipos.indexOf(req.query.tipo) >= 0 ? req.query.tipo : 'Equipamento';

  res.render('adicionar', {
    title: 'Adicionar objeto',
    tipos: tipos,
    tipoSelecionado: tipoSelecionado
  });
});

router.post('/', function(req, res, next) {
  var destinos = {
    'Equipamento': '/equipamentos',
    'Acessório': '/acessorios',
    'Veículo': '/veiculos',
    'Cliente': '/clientes'
  };

  res.redirect(destinos[req.body.tipo] || '/inicio');
});

module.exports = router;