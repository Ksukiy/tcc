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

module.exports = {
  listarPorTipo: listarPorTipo,
  adicionarObjeto: adicionarObjeto,
  removerObjeto: removerObjeto
};
