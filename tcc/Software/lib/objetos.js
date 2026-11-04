var database = require('./database');

function rowToObject(row) {
  return {
    id: Number(row[0]),
    tipo: row[1],
    nome: row[2],
    numeroSerie: row[3],
    marca: row[4],
    modelo: row[5],
    ano: row[6],
    placa: row[7],
    tecnologia: row[8],
    anoAquisicao: row[9],
    status: row[10],
    tipoAcessorio: row[11],
    tipoCliente: row[12],
    fone: row[13],
    cpfCnpj: row[14],
    locado: row[10] === 'Locado'
  };
}

var select = [
  'SELECT id, tipo, nome, numero_serie, marca, modelo, ano, placa, tecnologia, ano_aquisicao, status, tipo_acessorio, tipo_cliente, telefone, cpf_cnpj FROM (',
  "SELECT id, 'Equipamento' tipo, NULL nome, numero_serie, NULL marca, modelo, NULL ano, NULL placa, tecnologia, ano_aquisicao, status, NULL tipo_acessorio, NULL tipo_cliente, NULL telefone, NULL cpf_cnpj FROM equipamentos",
  "UNION ALL SELECT id, 'Acessório', NULL, NULL, NULL, modelo, NULL, NULL, NULL, NULL, status, tipo_acessorio, NULL, NULL, NULL FROM acessorios",
  "UNION ALL SELECT id, 'Veículo', NULL, NULL, marca, modelo, ano, placa, NULL, NULL, NULL, NULL, NULL, NULL, NULL FROM veiculos",
  "UNION ALL SELECT id, 'Cliente', nome, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, tipo_cliente, telefone, cpf_cnpj FROM clientes",
  ') objetos'
].join(' ');

function all() {
  return database.query(select).map(rowToObject);
}

function lerObjetos() {
  return all();
}

function listarPorTipo(tipo) {
  return all().filter(function(objeto) {
    return objeto.tipo === tipo;
  });
}

function normalizarTipo(tipo) {
  return String(tipo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function contarPorTipo(tipo) {
  var esperado = normalizarTipo(tipo);
  return all().filter(function(objeto) {
    return normalizarTipo(objeto.tipo) === esperado;
  }).length;
}

function buscarPorId(id) {
  return all().find(function(objeto) {
    return String(objeto.id) === String(id);
  });
}

function filtrarPorTipo(tipo, filtros) {
  function normalizar(valor) {
    return String(valor || '').trim().toLowerCase();
  }
  var busca = String(filtros.busca || '').trim().toLowerCase();
  return listarPorTipo(tipo).filter(function(objeto) {
    var correspondeBusca = !busca || Object.keys(objeto).some(function(chave) {
      return String(objeto[chave] || '').toLowerCase().indexOf(busca) >= 0;
    });
    return correspondeBusca &&
      (!filtros.status || normalizar(objeto.status) === normalizar(filtros.status)) &&
      (!filtros.locado || String(objeto.locado) === filtros.locado) &&
      (!filtros.tipoCliente || normalizar(objeto.tipoCliente) === normalizar(filtros.tipoCliente)) &&
      (!filtros.tipoAcessorio || normalizar(objeto.tipoAcessorio) === normalizar(filtros.tipoAcessorio)) &&
      (!filtros.marca || normalizar(objeto.marca) === normalizar(filtros.marca)) &&
      (!filtros.ano || String(objeto.ano).trim() === String(filtros.ano).trim()) &&
      (!filtros.modelo || normalizar(objeto.modelo) === normalizar(filtros.modelo)) &&
      (!filtros.tecnologia || normalizar(objeto.tecnologia) === normalizar(filtros.tecnologia));
  });
}

function listarValores(tipo, campo) {
  var valores = {};
  listarPorTipo(tipo).forEach(function(objeto) {
    if (objeto[campo]) {
      valores[objeto[campo]] = true;
    }
  });
  return Object.keys(valores).sort();
}

function insertObject(objeto, id) {
  var value = database.sqlValue;
  if (objeto.tipo === 'Equipamento') {
    database.run('INSERT INTO equipamentos (id, numero_serie, tecnologia, modelo, ano_aquisicao, status) VALUES (' +
      id + ', ' + value(objeto.numeroSerie || ('sem-serie-' + id)) + ', ' + value(objeto.tecnologia || '') + ', ' +
      value(objeto.modelo || '') + ', ' + value(Number(objeto.anoAquisicao) || 2000) + ', ' + value(objeto.status || 'Disponível') + ')');
  } else if (objeto.tipo === 'Acessório') {
    database.run('INSERT INTO acessorios (id, tipo_acessorio, modelo, status) VALUES (' + id + ', ' +
      value(objeto.tipoAcessorio || '') + ', ' + value(objeto.modelo || '') + ', ' + value(objeto.status || 'Disponível') + ')');
  } else if (objeto.tipo === 'Veículo') {
    database.run('INSERT INTO veiculos (id, placa, marca, modelo, ano) VALUES (' + id + ', ' + value(objeto.placa || ('SEM-' + id)) +
      ', ' + value(objeto.marca || '') + ', ' + value(objeto.modelo || '') + ', ' + value(Number(objeto.ano) || 2000) + ')');
  } else if (objeto.tipo === 'Cliente') {
    database.run('INSERT INTO clientes (id, nome, telefone, tipo_cliente, cpf_cnpj) VALUES (' + id + ', ' + value(objeto.nome || '') +
      ', ' + value(objeto.fone || '') + ', ' + value(objeto.tipoCliente || '') + ', ' + value(objeto.cpfCnpj || null) + ')');
  }
}

function adicionarObjeto(objeto) {
  var ids = database.query('SELECT COALESCE(MAX(id), 0) + 1 FROM (' +
    'SELECT id FROM equipamentos UNION ALL SELECT id FROM acessorios UNION ALL SELECT id FROM veiculos UNION ALL SELECT id FROM clientes' +
    ') ids');
  var id = Number(ids[0][0]);
  insertObject(objeto, id);
  return Object.assign({ id: id }, objeto);
}

function atualizarObjeto(id, dados) {
  var objeto = buscarPorId(id);
  if (!objeto) {
    return false;
  }
  var value = database.sqlValue;
  var tabela = objeto.tipo === 'Equipamento' ? 'equipamentos' : objeto.tipo === 'Acessório' ? 'acessorios' : objeto.tipo === 'Veículo' ? 'veiculos' : 'clientes';
  var campos = objeto.tipo === 'Equipamento'
    ? 'numero_serie=' + value(dados.numeroSerie || objeto.numeroSerie) + ', tecnologia=' + value(dados.tecnologia || objeto.tecnologia) + ', modelo=' + value(dados.modelo || objeto.modelo) + ', ano_aquisicao=' + value(Number(dados.anoAquisicao || objeto.anoAquisicao) || 2000) + ', status=' + value(dados.status || objeto.status)
    : objeto.tipo === 'Acessório'
      ? 'tipo_acessorio=' + value(dados.tipoAcessorio || objeto.tipoAcessorio) + ', modelo=' + value(dados.modelo || objeto.modelo) + ', status=' + value(dados.status || objeto.status)
      : objeto.tipo === 'Veículo'
        ? 'placa=' + value(dados.placa || objeto.placa) + ', marca=' + value(dados.marca || objeto.marca) + ', modelo=' + value(dados.modelo || objeto.modelo) + ', ano=' + value(Number(dados.ano || objeto.ano) || 2000)
        : 'nome=' + value(dados.nome || objeto.nome) + ', telefone=' + value(dados.fone || objeto.fone) + ', tipo_cliente=' + value(dados.tipoCliente || objeto.tipoCliente) + ', cpf_cnpj=' + value(dados.cpfCnpj || objeto.cpfCnpj);
  database.run('UPDATE ' + tabela + ' SET ' + campos + ' WHERE id=' + Number(id));
  return Object.assign({}, objeto, dados, { id: objeto.id });
}

function removerObjeto(id) {
  var objeto = buscarPorId(id);
  if (!objeto) {
    return false;
  }
  var tabela = objeto.tipo === 'Equipamento' ? 'equipamentos' : objeto.tipo === 'Acessório' ? 'acessorios' : objeto.tipo === 'Veículo' ? 'veiculos' : 'clientes';
  database.run('DELETE FROM ' + tabela + ' WHERE id=' + Number(id));
  return true;
}

function migrarJson() {
  var count = Number(database.query('SELECT (SELECT COUNT(*) FROM equipamentos) + (SELECT COUNT(*) FROM acessorios) + (SELECT COUNT(*) FROM veiculos) + (SELECT COUNT(*) FROM clientes)')[0][0]);
  if (count > 0) {
    return;
  }
  var arquivo = require('path').join(__dirname, '..', 'data', 'objetos.json');
  JSON.parse(require('fs').readFileSync(arquivo, 'utf8')).forEach(function(objeto) {
    try {
      insertObject(objeto, Number(objeto.id));
    } catch (erro) {
      if (objeto.tipo === 'Equipamento') {
        objeto.numeroSerie = objeto.numeroSerie + '-' + objeto.id;
        insertObject(objeto, Number(objeto.id));
      } else {
        throw erro;
      }
    }
  });
}

database.ensureSchema();
migrarJson();

module.exports = {
  lerObjetos: lerObjetos,
  listarPorTipo: listarPorTipo,
  contarPorTipo: contarPorTipo,
  buscarPorId: buscarPorId,
  filtrarPorTipo: filtrarPorTipo,
  listarValores: listarValores,
  adicionarObjeto: adicionarObjeto,
  atualizarObjeto: atualizarObjeto,
  removerObjeto: removerObjeto
};
