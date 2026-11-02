var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');
var relacoes = require('../lib/relacoes');

router.get('/', function(req, res, next) {
  var equipamentos = objetos.filtrarPorTipo('Equipamento', req.query).map(function(equipamento) {
    return Object.assign({}, equipamento, {
      veiculoRelacionado: relacoes.obterVeiculoDoEquipamento(equipamento.id),
      relacao: relacoes.obterRelacaoDoEquipamento(equipamento.id)
    });
  });

  res.render('equipamentos', {
    title: 'Equipamentos',
    equipamentos: equipamentos,
    tecnologias: equipamentoOpcoes.listar('tecnologia'),
    modelos: equipamentoOpcoes.listar('modelo'),
    filtros: req.query
  });
});

module.exports = router;
