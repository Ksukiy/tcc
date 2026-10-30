var fs = require('fs');
var path = require('path');

var arquivo = path.join(__dirname, '..', 'data', 'equipamento-opcoes.json');
var opcoesPadrao = {
  tecnologia: ['2G', '4G'],
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

function listarModelosAcessorio() {
  return lerOpcoes().modelosAcessorio || {};
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

module.exports = {
  opcoesPadrao: opcoesPadrao,
  listar: listar,
  adicionar: adicionar,
  listarModelosAcessorio: listarModelosAcessorio,
  adicionarModeloAcessorio: adicionarModeloAcessorio
};
