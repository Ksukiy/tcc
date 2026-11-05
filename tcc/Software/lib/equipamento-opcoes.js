var fs = require('fs');
var path = require('path');

var arquivo = path.join(__dirname, '..', 'data', 'equipamento-opcoes.json');
var opcoesPadrao = {
  tecnologia: ['2G', '4G'],
  marca: ['chevrolet'],
  tipoCliente: ['Pessoa Física', 'Pessoa Jurídica'],
  tipoAcessorio: ['Bloqueador', 'Leitor', 'Chaveiro'],
  modelosAcessorio: {
    Bloqueador: ['Relé de Bloqueio'],
    Leitor: ['Ibutton'],
    Chaveiro: ['Ibutton']
  },
  modelo: [
    'RST - OBDII',
    'RST - Mini LC',
    'RST MINI - LC',
    'RST Mini',
    'RST LCv5',
    'RST One',
    'RST MÓVEL RF',
    'RST ISCA GPS LORA',
    'RST Plus',
    'RST Híbrido',
    'RST Micro',
    'RST - Globalstar',
    'NT40',
    'NONOS-N4'
  ]
};

function lerOpcoes() {
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

function listar(campo) {
  return lerOpcoes()[campo] || [];
}

function adicionar(campo, valor) {
  var entrada = String(valor || '').trim();
  var opcoes = lerOpcoes();

  if (!entrada || !opcoes[campo]) {
    return;
  }

  if (opcoes[campo].indexOf(entrada) < 0) {
    opcoes[campo].push(entrada);
    fs.writeFileSync(arquivo, JSON.stringify(opcoes, null, 2) + '\n');
  }

}

function editar(campo, atual, novoValor) {
  var opcoes = lerOpcoes();
  var novo = String(novoValor || '').trim();
  var indice = opcoes[campo] && opcoes[campo].indexOf(atual);

  if (!novo || !opcoes[campo] || indice < 0 || (opcoes[campo].indexOf(novo) >= 0 && novo !== atual)) {
    return false;
  }

  opcoes[campo][indice] = novo;
  fs.writeFileSync(arquivo, JSON.stringify(opcoes, null, 2) + '\n');
  return true;
}

function remover(campo, valor) {
  var opcoes = lerOpcoes();
  var indice = opcoes[campo] && opcoes[campo].indexOf(valor);

  if (!opcoes[campo] || indice < 0) {
    return false;
  }

  opcoes[campo].splice(indice, 1);
  fs.writeFileSync(arquivo, JSON.stringify(opcoes, null, 2) + '\n');
  return true;
}

function listarModelosAcessorio() {
  return lerOpcoes().modelosAcessorio || {};
}

function listarModelosAcessorioUnicos() {
  var modelosPorTipo = listarModelosAcessorio();
  var modelos = [];
  Object.keys(modelosPorTipo).forEach(function(tipo) {
    modelosPorTipo[tipo].forEach(function(modelo) {
      if (modelos.indexOf(modelo) < 0) {
        modelos.push(modelo);
      }
    });
  });
  return modelos;
}

function adicionarModeloAcessorio(tipo, valor) {
  var entrada = String(valor || '').trim();
  var opcoes = lerOpcoes();

  if (!entrada || !tipo || !opcoes.modelosAcessorio) {
    return;
  }

  if (!opcoes.modelosAcessorio[tipo]) {
    opcoes.modelosAcessorio[tipo] = [];
  }

  if (opcoes.modelosAcessorio[tipo].indexOf(entrada) < 0) {
    opcoes.modelosAcessorio[tipo].push(entrada);
    fs.writeFileSync(arquivo, JSON.stringify(opcoes, null, 2) + '\n');
  }
}

function listarTodas() {
  var opcoes = lerOpcoes();
  var todas = {
    tecnologia: opcoes.tecnologia || [],
    marca: opcoes.marca || [],
    tipoCliente: opcoes.tipoCliente || [],
    modelo: opcoes.modelo || [],
    tipoAcessorio: opcoes.tipoAcessorio || []
  };

  Object.keys(opcoes.modelosAcessorio || {}).forEach(function (tipo) {
    todas['modeloAcessorio:' + tipo] = opcoes.modelosAcessorio[tipo];
  });
  return todas;
}

function editarModeloAcessorio(tipo, atual, novoValor) {
  var opcoes = lerOpcoes();
  var lista = opcoes.modelosAcessorio && opcoes.modelosAcessorio[tipo];
  var novo = String(novoValor || '').trim();
  var indice = lista && lista.indexOf(atual);

  if (!novo || !lista || indice < 0 || (lista.indexOf(novo) >= 0 && novo !== atual)) {
    return false;
  }
  lista[indice] = novo;
  fs.writeFileSync(arquivo, JSON.stringify(opcoes, null, 2) + '\n');
  return true;
}

function removerModeloAcessorio(tipo, valor) {
  var opcoes = lerOpcoes();
  var lista = opcoes.modelosAcessorio && opcoes.modelosAcessorio[tipo];
  var indice = lista && lista.indexOf(valor);

  if (!lista || indice < 0) {
    return false;
  }
  lista.splice(indice, 1);
  fs.writeFileSync(arquivo, JSON.stringify(opcoes, null, 2) + '\n');
  return true;
}

module.exports = {
  opcoesPadrao: opcoesPadrao,
  listar: listar,
  adicionar: adicionar,
  editar: editar,
  remover: remover,
  listarModelosAcessorio: listarModelosAcessorio,
  listarModelosAcessorioUnicos: listarModelosAcessorioUnicos,
  adicionarModeloAcessorio: adicionarModeloAcessorio
  , listarTodas: listarTodas
  , editarModeloAcessorio: editarModeloAcessorio
  , removerModeloAcessorio: removerModeloAcessorio
};
