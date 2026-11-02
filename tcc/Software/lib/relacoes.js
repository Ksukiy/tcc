var fs = require('fs');
var path = require('path');
var objetos = require('./objetos');

var arquivo = path.join(__dirname, '..', 'data', 'relacoes.json');

function lerRelacoes() {
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

function salvarRelacoes(relacoes) {
  fs.writeFileSync(arquivo, JSON.stringify(relacoes, null, 2) + '\n');
}

function buscarRelacaoPorEquipamento(equipamentoId) {
  return lerRelacoes().find(function(relacao) {
    return String(relacao.equipamentoId) === String(equipamentoId);
  });
}

function buscarRelacaoPorVeiculo(veiculoId) {
  return lerRelacoes().find(function(relacao) {
    return String(relacao.veiculoId) === String(veiculoId);
  });
}

function obterRelacaoDoEquipamento(equipamentoId) {
  return buscarRelacaoPorEquipamento(equipamentoId) || null;
}

function obterRelacaoDoVeiculo(veiculoId) {
  return buscarRelacaoPorVeiculo(veiculoId) || null;
}

function validarObjetos(equipamentoId, veiculoId) {
  var equipamento = objetos.buscarPorId(equipamentoId);
  var veiculo = objetos.buscarPorId(veiculoId);

  if (!equipamento || equipamento.tipo !== 'Equipamento') {
    return 'Equipamento não encontrado.';
  }
  if (!veiculo || veiculo.tipo !== 'Veículo') {
    return 'Veículo não encontrado.';
  }
  return null;
}

function vincular(equipamentoId, veiculoId, dados) {
  var erro = validarObjetos(equipamentoId, veiculoId);
  if (erro) {
    return { erro: erro };
  }

  var relacoes = lerRelacoes();
  var relacaoDoEquipamento = buscarRelacaoPorEquipamento(equipamentoId);
  var relacaoDoVeiculo = buscarRelacaoPorVeiculo(veiculoId);

  if (relacaoDoEquipamento && String(relacaoDoEquipamento.veiculoId) !== String(veiculoId)) {
    return { erro: 'Este equipamento já está ligado a outro veículo.' };
  }
  if (relacaoDoVeiculo && String(relacaoDoVeiculo.equipamentoId) !== String(equipamentoId)) {
    return { erro: 'Este veículo já possui outro equipamento ligado.' };
  }
  var dadosRelacao = dados || {};
  var relacao = relacaoDoEquipamento || {
      equipamentoId: Number(equipamentoId),
      veiculoId: Number(veiculoId),
      dataInstalacao: new Date().toISOString().slice(0, 10)
    };
  if (dadosRelacao.garantia !== undefined) {
    relacao.garantia = dadosRelacao.garantia;
  }
  if (dadosRelacao.dataInstalacao) {
    relacao.dataInstalacao = dadosRelacao.dataInstalacao;
  }
  if (dadosRelacao.dataRetirada) {
    relacao.dataRetirada = dadosRelacao.dataRetirada;
  } else if (dadosRelacao.dataRetirada === '') {
    relacao.dataRetirada = null;
  }
  if (!relacaoDoEquipamento) {
    relacoes.push(relacao);
  } else {
    relacoes[relacoes.indexOf(relacaoDoEquipamento)] = relacao;
  }
  salvarRelacoes(relacoes);

  return { relacao: relacao };
}

function desvincularPorObjeto(id) {
  var relacoes = lerRelacoes();
  var restantes = relacoes.filter(function(relacao) {
    return String(relacao.equipamentoId) !== String(id) &&
      String(relacao.veiculoId) !== String(id);
  });

  if (restantes.length !== relacoes.length) {
    salvarRelacoes(restantes);
  }
}

function obterVeiculoDoEquipamento(equipamentoId) {
  var relacao = buscarRelacaoPorEquipamento(equipamentoId);
  return relacao ? objetos.buscarPorId(relacao.veiculoId) : null;
}

function obterEquipamentoDoVeiculo(veiculoId) {
  var relacao = buscarRelacaoPorVeiculo(veiculoId);
  return relacao ? objetos.buscarPorId(relacao.equipamentoId) : null;
}

module.exports = {
  lerRelacoes: lerRelacoes,
  obterRelacaoDoEquipamento: obterRelacaoDoEquipamento,
  obterRelacaoDoVeiculo: obterRelacaoDoVeiculo,
  vincular: vincular,
  desvincularPorObjeto: desvincularPorObjeto,
  obterVeiculoDoEquipamento: obterVeiculoDoEquipamento,
  obterEquipamentoDoVeiculo: obterEquipamentoDoVeiculo
};
