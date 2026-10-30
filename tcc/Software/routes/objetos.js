var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');
var statusOpcoes = ['Locado', 'Disponível', 'Em Manutenção'];

function obterUrlDeRetorno(url, tipo) {
  var destinos = {
    'Equipamento': '/equipamentos',
    'Acessório': '/acessorios',
    'Veículo': '/veiculos',
    'Cliente': '/clientes'
  };
  var paginasLista = Object.keys(destinos).map(function(chave) {
    return destinos[chave];
  });

  return paginasLista.indexOf(url) >= 0 ? url : destinos[tipo] || '/inicio';
}

function dadosDoFormulario(body, objeto) {
  var dados = {
    nome: body.nome,
    numeroSerie: body.numeroSerie,
    marca: body.marca,
    modelo: body.modelo,
    ano: body.ano,
    placa: body.placa,
    tecnologia: body.tecnologia,
    anoAquisicao: body.anoAquisicao,
    status: body.status,
    tipoAcessorio: body.tipoAcessorio,
    tipoCliente: body.tipoCliente,
    fone: body.fone,
    cpfCnpj: body.cpfCnpj
  };

  if (objeto.tipo === 'Equipamento' || objeto.tipo === 'Acessório') {
    dados.locado = body.status === 'Locado';
  }

  return dados;
}

function remover(req, res) {
  objetos.removerObjeto(req.params.id);
  res.redirect(req.get('Referrer') || '/inicio');
}

router.get('/:id/editar', function(req, res) {
  var objeto = objetos.buscarPorId(req.params.id);

  if (!objeto) {
    return res.status(404).render('error', { message: 'Objeto não encontrado.' });
  }

  res.render('editar', {
    title: 'Editar objeto',
    objeto: objeto,
    statusOpcoes: statusOpcoes,
    tecnologiaOpcoes: equipamentoOpcoes.listar('tecnologia'),
    modeloOpcoes: equipamentoOpcoes.listar('modelo'),
    backUrl: obterUrlDeRetorno(req.query.voltar, objeto.tipo)
  });
});

router.post('/:id/editar', function(req, res) {
  var objeto = objetos.buscarPorId(req.params.id);

  if (!objeto) {
    return res.status(404).render('error', { message: 'Objeto não encontrado.' });
  }

  if ((objeto.tipo === 'Equipamento' || objeto.tipo === 'Acessório') && statusOpcoes.indexOf(req.body.status) < 0) {
    return res.status(400).render('editar', {
      title: 'Editar objeto',
      objeto: Object.assign({}, objeto, req.body),
      statusOpcoes: statusOpcoes,
      tecnologiaOpcoes: equipamentoOpcoes.listar('tecnologia'),
      modeloOpcoes: equipamentoOpcoes.listar('modelo'),
      backUrl: obterUrlDeRetorno(req.body.voltar, objeto.tipo),
      message: 'Selecione um status válido.'
    });
  }

  if (objeto.tipo === 'Equipamento' &&
      (req.body.tecnologia === '__nova_entrada__' || req.body.modelo === '__nova_entrada__')) {
    return res.status(400).render('editar', {
      title: 'Editar objeto',
      objeto: Object.assign({}, objeto, req.body),
      statusOpcoes: statusOpcoes,
      tecnologiaOpcoes: equipamentoOpcoes.listar('tecnologia'),
      modeloOpcoes: equipamentoOpcoes.listar('modelo'),
      backUrl: obterUrlDeRetorno(req.body.voltar, objeto.tipo),
      message: 'Informe a nova tecnologia ou modelo.'
    });
  }

  if (objeto.tipo === 'Equipamento') {
    equipamentoOpcoes.adicionar('tecnologia', req.body.tecnologia);
    equipamentoOpcoes.adicionar('modelo', req.body.modelo);
  }

  objetos.atualizarObjeto(req.params.id, dadosDoFormulario(req.body, objeto));
  res.redirect(obterUrlDeRetorno(req.body.voltar, objeto.tipo));
});

router.post('/:id/remover', remover);
router.get('/:id/remover', remover);

module.exports = router;
