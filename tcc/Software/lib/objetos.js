var fs = require('fs');
var path = require('path');

var arquivo = path.join(__dirname, '..', 'data', 'objetos.json');

function lerObjetos() {
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

function listarPorTipo(tipo) {
  return lerObjetos().filter(function(objeto) {
    return objeto.tipo === tipo;
  });
}

function normalizarTipo(tipo) {
  return String(tipo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function contarPorTipo(tipo) {
  var tipoNormalizado = normalizarTipo(tipo);
  return lerObjetos().filter(function(objeto) {
    return normalizarTipo(objeto.tipo) === tipoNormalizado;
  }).length;
}

function buscarPorId(id) {
  return lerObjetos().find(function(objeto) {
    return String(objeto.id) === String(id);
  });
}

function filtrarPorTipo(tipo, filtros) {
  function normalizar(valor) {
    return String(valor || '').trim().toLowerCase();
  }

  var busca = String(filtros.busca || '').trim().toLowerCase();
  var objetos = listarPorTipo(tipo);

  return objetos.filter(function(objeto) {
    var correspondeBusca = !busca || Object.keys(objeto).some(function(chave) {
      return String(objeto[chave] || '').toLowerCase().indexOf(busca) >= 0;
    });
    var correspondeStatus = !filtros.status || normalizar(objeto.status) === normalizar(filtros.status);
    var correspondeLocacao = !filtros.locado || String(objeto.locado) === filtros.locado;
    var correspondeTipoCliente = !filtros.tipoCliente || normalizar(objeto.tipoCliente) === normalizar(filtros.tipoCliente);
    var correspondeTipoAcessorio = !filtros.tipoAcessorio || normalizar(objeto.tipoAcessorio) === normalizar(filtros.tipoAcessorio);
    var correspondeMarca = !filtros.marca || normalizar(objeto.marca) === normalizar(filtros.marca);
    var correspondeAno = !filtros.ano || String(objeto.ano).trim() === String(filtros.ano).trim();
    var correspondeModelo = !filtros.modelo || normalizar(objeto.modelo) === normalizar(filtros.modelo);
    var correspondeTecnologia = !filtros.tecnologia || normalizar(objeto.tecnologia) === normalizar(filtros.tecnologia);

    return correspondeBusca && correspondeStatus && correspondeLocacao &&
      correspondeTipoCliente && correspondeTipoAcessorio && correspondeMarca && correspondeAno &&
      correspondeModelo && correspondeTecnologia;
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

function adicionarObjeto(objeto) {
  var objetos = lerObjetos();
  var proximoId = objetos.reduce(function(maiorId, item) {
    return Math.max(maiorId, Number(item.id) || 0);
  }, 0) + 1;

  var novoObjeto = Object.assign({ id: proximoId }, objeto);

  objetos.push(novoObjeto);
  fs.writeFileSync(arquivo, JSON.stringify(objetos, null, 2) + '\n');
  return novoObjeto;
}

function removerObjeto(id) {
  var objetos = lerObjetos();
  var objetosRestantes = objetos.filter(function(objeto) {
    return String(objeto.id) !== String(id);
  });

  if (objetosRestantes.length === objetos.length) {
    return false;
  }

  fs.writeFileSync(arquivo, JSON.stringify(objetosRestantes, null, 2) + '\n');
  return true;
}

function atualizarObjeto(id, dados) {
  var objetos = lerObjetos();
  var indice = objetos.findIndex(function(objeto) {
    return String(objeto.id) === String(id);
  });

  if (indice < 0) {
    return false;
  }

  objetos[indice] = Object.assign({}, objetos[indice], dados, { id: objetos[indice].id });
  fs.writeFileSync(arquivo, JSON.stringify(objetos, null, 2) + '\n');
  return objetos[indice];
}

module.exports = {
  listarPorTipo: listarPorTipo,
  contarPorTipo: contarPorTipo,
  buscarPorId: buscarPorId,
  filtrarPorTipo: filtrarPorTipo,
  listarValores: listarValores,
  adicionarObjeto: adicionarObjeto,
  atualizarObjeto: atualizarObjeto,
  removerObjeto: removerObjeto
};
