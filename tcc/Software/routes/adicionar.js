var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');

var tipos = ['Equipamento', 'Acessório', 'Veículo', 'Cliente'];
var statusOpcoes = ['Locado', 'Disponível', 'Em Manutenção'];
var destinosPorTipo = {
  'Equipamento': '/equipamentos',
  'Acessório': '/acessorios',
  'Veículo': '/veiculos',
  'Cliente': '/clientes'
};
var paginasLista = ['/equipamentos', '/acessorios', '/veiculos', '/clientes'];

function obterUrlDeRetorno(url, tipo) {
  return paginasLista.indexOf(url) >= 0 ? url : destinosPorTipo[tipo] || '/inicio';
}

function renderFormulario(res, dados) {
  res.render('adicionar', Object.assign({
    title: 'Adicionar objeto',
    tipos: tipos,
    statusOpcoes: statusOpcoes,
    tecnologiaOpcoes: equipamentoOpcoes.listar('tecnologia'),
    modeloOpcoes: equipamentoOpcoes.listar('modelo'),
    tipoAcessorioOpcoes: equipamentoOpcoes.listar('tipoAcessorio'),
    modelosAcessorio: equipamentoOpcoes.listarModelosAcessorio(),
    tipoSelecionado: 'Equipamento',
    backUrl: '/inicio'
  }, dados));
}

router.get('/', function(req, res, next) {
  var tipoSelecionado = tipos.indexOf(req.query.tipo) >= 0 ? req.query.tipo : 'Equipamento';

  renderFormulario(res, {
    tipoSelecionado: tipoSelecionado,
    backUrl: obterUrlDeRetorno(req.query.voltar, tipoSelecionado)
  });
});

router.post('/', function(req, res, next) {
  var tipo = req.body.tipo;

  if (req.body.tecnologia === '__nova_entrada__' ||
      req.body.modelo === '__nova_entrada__' ||
      req.body.tipoAcessorio === '__nova_entrada__') {
    return renderFormulario(res.status(400), {
      tipoSelecionado: tipo,
      message: 'Informe a nova entrada selecionada.',
      backUrl: obterUrlDeRetorno(req.body.voltar, tipo)
    });
  }

  if (tipos.indexOf(tipo) < 0) {
    return renderFormulario(res.status(400), {
      tipoSelecionado: 'Equipamento',
      message: 'Selecione um tipo de objeto válido.',
      backUrl: obterUrlDeRetorno(req.body.voltar, tipo)
    });
  }

  if ((tipo === 'Equipamento' || tipo === 'Acessório') && statusOpcoes.indexOf(req.body.status) < 0) {
    return renderFormulario(res.status(400), {
      tipoSelecionado: tipo,
      message: 'Selecione um status válido.',
      backUrl: obterUrlDeRetorno(req.body.voltar, tipo)
    });
  }

  if (tipo === 'Equipamento') {
    equipamentoOpcoes.adicionar('tecnologia', req.body.tecnologia);
    equipamentoOpcoes.adicionar('modelo', req.body.modelo);
  }
  if (tipo === 'Acessório') {
    equipamentoOpcoes.adicionar('tipoAcessorio', req.body.tipoAcessorio);
    equipamentoOpcoes.adicionarModeloAcessorio(req.body.tipoAcessorio, req.body.modelo);
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
    locado: req.body.status === 'Locado'
  };

  objetos.adicionarObjeto(objeto);

  res.redirect(destinosPorTipo[tipo]);
});

module.exports = router;