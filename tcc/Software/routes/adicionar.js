var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');
var relacoes = require('../lib/relacoes');

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
  var veiculos = relacoes.listarVeiculosComRelacao();
  var equipamentos = relacoes.listarEquipamentosComRelacao();

  res.render('adicionar', Object.assign({
    title: 'Adicionar objeto',
    tipos: tipos,
    statusOpcoes: statusOpcoes,
    tecnologiaOpcoes: equipamentoOpcoes.listar('tecnologia'),
    marcaOpcoes: equipamentoOpcoes.listar('marca'),
    tipoClienteOpcoes: equipamentoOpcoes.listar('tipoCliente'),
    modeloOpcoes: equipamentoOpcoes.listar('modelo'),
    tipoAcessorioOpcoes: equipamentoOpcoes.listar('tipoAcessorio'),
    modelosAcessorio: equipamentoOpcoes.listarModelosAcessorio(),
    tipoSelecionado: 'Equipamento',
    backUrl: '/inicio'
  }, dados, {
    veiculos: veiculos,
    equipamentos: equipamentos
  }));
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
      req.body.marca === '__nova_entrada__' ||
      req.body.tipoCliente === '__nova_entrada__' ||
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
  if (tipo === 'Veículo') {
    equipamentoOpcoes.adicionar('marca', req.body.marca);
  }
  if (tipo === 'Cliente') {
    equipamentoOpcoes.adicionar('tipoCliente', req.body.tipoCliente);
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

  var novoObjeto;
  try {
    novoObjeto = objetos.adicionarObjeto(objeto);
  } catch (erro) {
    return renderFormulario(res.status(400), {
      tipoSelecionado: tipo,
      message: 'Não foi possível salvar o objeto. Verifique os dados informados.',
      backUrl: obterUrlDeRetorno(req.body.voltar, tipo)
    });
  }

  if (tipo === 'Equipamento' && req.body.status === 'Locado' && req.body.veiculoId) {
    var resultadoEquipamento = relacoes.vincular(novoObjeto.id, req.body.veiculoId, {
      garantia: req.body.garantia,
      dataInstalacao: req.body.dataInstalacao
    });
    if (resultadoEquipamento.erro) {
      objetos.removerObjeto(novoObjeto.id);
      return renderFormulario(res.status(400), {
        tipoSelecionado: tipo,
        message: resultadoEquipamento.erro,
        backUrl: obterUrlDeRetorno(req.body.voltar, tipo)
      });
    }
  }
  if (tipo === 'Veículo' && req.body.equipamentoId) {
    var resultadoVeiculo = relacoes.vincular(req.body.equipamentoId, novoObjeto.id, {
      garantia: req.body.garantia,
      dataInstalacao: req.body.dataInstalacao
    });
    if (resultadoVeiculo.erro) {
      objetos.removerObjeto(novoObjeto.id);
      return renderFormulario(res.status(400), {
        tipoSelecionado: tipo,
        message: resultadoVeiculo.erro,
        backUrl: obterUrlDeRetorno(req.body.voltar, tipo)
      });
    }
  }

  res.redirect(destinosPorTipo[tipo]);
});

module.exports = router;