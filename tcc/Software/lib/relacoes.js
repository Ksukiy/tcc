var database = require('./database');
var objetos = require('./objetos');

function rowToRelation(row) {
  return {
    equipamentoId: Number(row[0]),
    veiculoId: Number(row[1]),
    garantia: row[2],
    dataInstalacao: row[3],
    dataRetirada: row[4]
  };
}

function lerRelacoes() {
  return database.query('SELECT equipamento_id, veiculo_id, garantia, data_instalacao, data_retirada FROM equipamentos_veiculos').map(rowToRelation);
}

function obterRelacaoPorCampo(campo, id) {
  var rows = database.query('SELECT equipamento_id, veiculo_id, garantia, data_instalacao, data_retirada FROM equipamentos_veiculos WHERE ' +
    campo + '=' + Number(id));
  return rows.length ? rowToRelation(rows[0]) : null;
}

function obterRelacaoDoEquipamento(id) {
  return obterRelacaoPorCampo('equipamento_id', id);
}

function obterRelacaoDoVeiculo(id) {
  return obterRelacaoPorCampo('veiculo_id', id);
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
  var atual = obterRelacaoDoEquipamento(equipamentoId);
  var veiculoAtual = obterRelacaoDoVeiculo(veiculoId);
  if (atual && String(atual.veiculoId) !== String(veiculoId)) {
    return { erro: 'Este equipamento já está ligado a outro veículo.' };
  }
  if (veiculoAtual && String(veiculoAtual.equipamentoId) !== String(equipamentoId)) {
    return { erro: 'Este veículo já possui outro equipamento ligado.' };
  }
  dados = dados || {};
  var dataInstalacao = dados.dataInstalacao || new Date().toISOString().slice(0, 10);
  var dataRetirada = dados.dataRetirada || null;
  database.run('INSERT INTO equipamentos_veiculos (equipamento_id, veiculo_id, garantia, data_instalacao, data_retirada) VALUES (' +
    Number(equipamentoId) + ', ' + Number(veiculoId) + ', ' + database.sqlValue(dados.garantia) + ', ' +
    database.sqlValue(dataInstalacao) + ', ' + database.sqlValue(dataRetirada) +
    ') ON DUPLICATE KEY UPDATE veiculo_id=VALUES(veiculo_id), garantia=VALUES(garantia), data_instalacao=VALUES(data_instalacao), data_retirada=VALUES(data_retirada)');
  objetos.atualizarObjeto(equipamentoId, { status: 'Locado' });
  return { relacao: obterRelacaoDoEquipamento(equipamentoId) };
}

function desvincularPorObjeto(id) {
  database.run('DELETE FROM equipamentos_veiculos WHERE equipamento_id=' + Number(id) + ' OR veiculo_id=' + Number(id));
}

function obterVeiculoDoEquipamento(id) {
  var relacao = obterRelacaoDoEquipamento(id);
  return relacao ? objetos.buscarPorId(relacao.veiculoId) : null;
}

function obterEquipamentoDoVeiculo(id) {
  var relacao = obterRelacaoDoVeiculo(id);
  return relacao ? objetos.buscarPorId(relacao.equipamentoId) : null;
}

function listarVeiculosComRelacao() {
  return objetos.listarPorTipo('Veículo').map(function(veiculo) {
    return Object.assign({}, veiculo, {
      relacao: obterRelacaoDoVeiculo(veiculo.id)
    });
  });
}

function listarEquipamentosComRelacao() {
  return objetos.listarPorTipo('Equipamento').map(function(equipamento) {
    return Object.assign({}, equipamento, {
      relacao: obterRelacaoDoEquipamento(equipamento.id)
    });
  });
}

function migrarJson() {
  if (lerRelacoes().length > 0) {
    return;
  }
  var fs = require('fs');
  var path = require('path');
  var arquivo = path.join(__dirname, '..', 'data', 'relacoes.json');
  JSON.parse(fs.readFileSync(arquivo, 'utf8')).forEach(function(relacao) {
    if (validarObjetos(relacao.equipamentoId, relacao.veiculoId) === null) {
      vincular(relacao.equipamentoId, relacao.veiculoId, relacao);
    }
  });
}

migrarJson();

module.exports = {
  lerRelacoes: lerRelacoes,
  obterRelacaoDoEquipamento: obterRelacaoDoEquipamento,
  obterRelacaoDoVeiculo: obterRelacaoDoVeiculo,
  vincular: vincular,
  desvincularPorObjeto: desvincularPorObjeto,
  obterVeiculoDoEquipamento: obterVeiculoDoEquipamento,
  obterEquipamentoDoVeiculo: obterEquipamentoDoVeiculo,
  listarVeiculosComRelacao: listarVeiculosComRelacao,
  listarEquipamentosComRelacao: listarEquipamentosComRelacao
};
