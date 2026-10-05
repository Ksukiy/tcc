var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

var tipos = ['Equipamento', 'Acessório', 'Veículo', 'Cliente'];

function renderFormulario(res, dados) {
  res.render('adicionar', Object.assign({
    title: 'Adicionar objeto',
    tipos: tipos,
    tipoSelecionado: 'Equipamento'
  }, dados));
}

router.get('/', function(req, res, next) {
  var tipoSelecionado = tipos.indexOf(req.query.tipo) >= 0 ? req.query.tipo : 'Equipamento';

  renderFormulario(res, { tipoSelecionado: tipoSelecionado });
});

router.post('/', function(req, res, next) {
  var destinos = {
    'Equipamento': '/equipamentos',
    'Acessório': '/acessorios',
    'Veículo': '/veiculos',
    'Cliente': '/clientes'
  };
  var tipo = req.body.tipo;

  if (tipos.indexOf(tipo) < 0) {
    return renderFormulario(res.status(400), {
      tipoSelecionado: 'Equipamento',
      message: 'Selecione um tipo de objeto válido.'
    });
  }

  var objeto = {
    tipo: tipo,
    nome: req.body.nome,
    numeroSerie: req.body.numeroSerie,
    marca: req.body.marca,
    modelo: req.body.modelo,
    ano: req.body.ano,
    placa: req.body.placa,
    tecnologia: req.body.tecnologia,
    anoAquisicao: req.body.anoAquisicao,
    status: req.body.status,
    tipoAcessorio: req.body.tipoAcessorio,
    tipoCliente: req.body.tipoCliente,
    fone: req.body.fone,
    cpfCnpj: req.body.cpfCnpj,
    locado: req.body.locado === 'on'
  };

  objetos.adicionarObjeto(objeto);

  res.redirect(destinos[tipo]);
});

module.exports = router;