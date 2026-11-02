var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var relacoes = require('../lib/relacoes');

router.get('/', function(req, res, next) {
  var veiculos = objetos.filtrarPorTipo('Veículo', req.query).map(function(veiculo) {
    return Object.assign({}, veiculo, {
      equipamentoRelacionado: relacoes.obterEquipamentoDoVeiculo(veiculo.id)
      , relacao: relacoes.obterRelacaoDoVeiculo(veiculo.id)
    });
  });

  res.render('veiculos', {
    title: 'Veículos',
    veiculos: veiculos,
    marcas: objetos.listarValores('Veículo', 'marca'),
    modelos: objetos.listarValores('Veículo', 'modelo'),
    filtros: req.query
  });
});

module.exports = router;
