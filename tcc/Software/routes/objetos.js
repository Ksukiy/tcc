var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');
var equipamentoOpcoes = require('../lib/equipamento-opcoes');
var relacoes = require('../lib/relacoes');
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

function renderEditar(res, objeto, dados, message, status) {
  return res.status(status || 400).render('editar', {
    title: 'Editar objeto',
    objeto: Object.assign({}, objeto, dados),
    statusOpcoes: statusOpcoes,
    tecnologiaOpcoes: equipamentoOpcoes.listar('tecnologia'),
    tipoClienteOpcoes: equipamentoOpcoes.listar('tipoCliente'),
    modeloOpcoes: equipamentoOpcoes.listar('modelo'),
    veiculos: relacoes.listarVeiculosComRelacao(),
    equipamentos: relacoes.listarEquipamentosComRelacao(),
    backUrl: obterUrlDeRetorno(dados.voltar, objeto.tipo),
    message: message
  });
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

function dadosDaRelacao(body, objeto) {
  if (objeto.tipo === 'Equipamento') {
    return {
      equipamentoId: objeto.id,
      veiculoId: body.veiculoId,
      garantia: body.garantia,
      dataInstalacao: body.dataInstalacao,
      dataRetirada: body.dataRetirada
    };
  }
  if (objeto.tipo === 'Veículo') {
    return {
      equipamentoId: body.equipamentoId,
      veiculoId: objeto.id,
      garantia: body.garantia,
      dataInstalacao: body.dataInstalacao,
      dataRetirada: body.dataRetirada
    };
  }
  return null;
}

router.get('/:id/editar', function(req, res) {
  var objeto = objetos.buscarPorId(req.params.id);

  if (!objeto) {
    return res.status(404).render('error', { message: 'Objeto não encontrado.' });
  }

  var objetoEdicao = Object.assign({}, objeto);
  if (objeto.tipo === 'Equipamento') {
    var veiculo = relacoes.obterVeiculoDoEquipamento(objeto.id);
    objetoEdicao.veiculoId = veiculo && veiculo.id;
    objetoEdicao.relacao = relacoes.obterRelacaoDoEquipamento(objeto.id);
  }
  if (objeto.tipo === 'Veículo') {
    var equipamento = relacoes.obterEquipamentoDoVeiculo(objeto.id);
    objetoEdicao.equipamentoId = equipamento && equipamento.id;
    objetoEdicao.relacao = relacoes.obterRelacaoDoVeiculo(objeto.id);
  }

  renderEditar(res, objetoEdicao, { voltar: req.query.voltar }, null, 200);
});

router.post('/:id/editar', function(req, res) {
  var objeto = objetos.buscarPorId(req.params.id);

  if (!objeto) {
    return res.status(404).render('error', { message: 'Objeto não encontrado.' });
  }

  if ((objeto.tipo === 'Equipamento' || objeto.tipo === 'Acessório') && statusOpcoes.indexOf(req.body.status) < 0) {
    return renderEditar(res, objeto, req.body, 'Selecione um status válido.');
  }

  if (objeto.tipo === 'Equipamento' &&
      (req.body.tecnologia === '__nova_entrada__' || req.body.modelo === '__nova_entrada__')) {
    return renderEditar(res, objeto, req.body, 'Informe a nova tecnologia ou modelo.');
  }

  if (objeto.tipo === 'Cliente' && req.body.tipoCliente === '__nova_entrada__') {
    return renderEditar(res, objeto, req.body, 'Informe o novo tipo de cliente.');
  }

  if (objeto.tipo === 'Equipamento') {
    equipamentoOpcoes.adicionar('tecnologia', req.body.tecnologia);
    equipamentoOpcoes.adicionar('modelo', req.body.modelo);
  }
  if (objeto.tipo === 'Cliente') {
    equipamentoOpcoes.adicionar('tipoCliente', req.body.tipoCliente);
  }

  objetos.atualizarObjeto(req.params.id, dadosDoFormulario(req.body, objeto));
  var relacao = dadosDaRelacao(req.body, objeto);
  if (relacao) {
    var equipamentoDestino = objetos.buscarPorId(relacao.equipamentoId);
    var veiculoDestino = objetos.buscarPorId(relacao.veiculoId);
    var equipamentoDoVeiculo = veiculoDestino && relacoes.obterEquipamentoDoVeiculo(veiculoDestino.id);
    var veiculoDoEquipamento = equipamentoDestino && relacoes.obterVeiculoDoEquipamento(equipamentoDestino.id);
    if ((relacao.equipamentoId && (!equipamentoDestino || equipamentoDestino.tipo !== 'Equipamento')) ||
        (relacao.veiculoId && (!veiculoDestino || veiculoDestino.tipo !== 'Veículo'))) {
      return renderEditar(res, objeto, req.body, 'Selecione um equipamento e veículo válidos.');
    }
    if (equipamentoDoVeiculo && String(equipamentoDoVeiculo.id) !== String(relacao.equipamentoId)) {
      return renderEditar(res, objeto, req.body, 'Este veículo já possui outro equipamento ligado.');
    }
    if (veiculoDoEquipamento && String(veiculoDoEquipamento.id) !== String(relacao.veiculoId)) {
      return renderEditar(res, objeto, req.body, 'Este equipamento já está ligado a outro veículo.');
    }
    relacoes.desvincularPorObjeto(objeto.id);
    if (relacao.equipamentoId && relacao.veiculoId) {
      var resultado = relacoes.vincular(relacao.equipamentoId, relacao.veiculoId);
      if (resultado.erro) {
        return renderEditar(res, objeto, req.body, resultado.erro);
      }
    }
  }
  res.redirect(obterUrlDeRetorno(req.body.voltar, objeto.tipo));
});

function remover(req, res) {
  relacoes.desvincularPorObjeto(req.params.id);
  objetos.removerObjeto(req.params.id);
  res.redirect(req.get('Referrer') || '/inicio');
}

router.post('/:id/remover', remover);
router.get('/:id/remover', remover);

module.exports = router;
