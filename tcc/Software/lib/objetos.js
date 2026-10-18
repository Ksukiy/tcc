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

function buscarPorId(id) {
  return lerObjetos().find(function(objeto) {
    return String(objeto.id) === String(id);
  });
}

function filtrarPorTipo(tipo, filtros) {
  var busca = String(filtros.busca || '').trim().toLowerCase();
  var objetos = listarPorTipo(tipo);

  return objetos.filter(function(objeto) {
    var correspondeBusca = !busca || Object.keys(objeto).some(function(chave) {
      return String(objeto[chave] || '').toLowerCase().indexOf(busca) >= 0;
    });
    var correspondeStatus = !filtros.status || objeto.status === filtros.status;
    var correspondeLocacao = !filtros.locado || String(objeto.locado) === filtros.locado;
    var correspondeTipoCliente = !filtros.tipoCliente || objeto.tipoCliente === filtros.tipoCliente;
    var correspondeTipoAcessorio = !filtros.tipoAcessorio || objeto.tipoAcessorio === filtros.tipoAcessorio;
    var correspondeMarca = !filtros.marca || objeto.marca === filtros.marca;
    var correspondeAno = !filtros.ano || String(objeto.ano) === filtros.ano;

    return correspondeBusca && correspondeStatus && correspondeLocacao &&
      correspondeTipoCliente && correspondeTipoAcessorio && correspondeMarca && correspondeAno;
  });
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
  buscarPorId: buscarPorId,
  filtrarPorTipo: filtrarPorTipo,
  adicionarObjeto: adicionarObjeto,
  atualizarObjeto: atualizarObjeto,
  removerObjeto: removerObjeto
};
