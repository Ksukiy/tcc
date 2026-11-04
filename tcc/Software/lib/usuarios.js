var crypto = require('crypto');
var database = require('./database');

function hashSenha(senha) {
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return salt + ':' + hash;
}

function verificarSenha(senha, armazenada) {
  var partes = String(armazenada || '').split(':');
  if (partes.length !== 2) {
    return false;
  }
  var esperado = Buffer.from(partes[1], 'hex');
  var atual = crypto.scryptSync(senha, partes[0], esperado.length);
  return esperado.length === atual.length && crypto.timingSafeEqual(esperado, atual);
}

function buscarPorEmail(email) {
  var rows = database.query('SELECT id, nome, email, senha_hash FROM usuarios WHERE email COLLATE utf8mb4_unicode_ci=' +
    database.sqlValue(email) + ' COLLATE utf8mb4_unicode_ci AND ativo=1 LIMIT 1');
  return rows.length ? {
    id: Number(rows[0][0]),
    nome: rows[0][1],
    email: rows[0][2],
    senhaHash: rows[0][3]
  } : null;
}

function cadastrar(nome, email, senha) {
  database.run('INSERT INTO usuarios (nome, email, senha_hash, data_nascimento) VALUES (' +
    database.sqlValue(nome) + ', ' + database.sqlValue(email) + ', ' +
    database.sqlValue(hashSenha(senha)) + ', NULL)');
}

function atualizarPerfil(emailAtual, nome, email, senhaAtual, novaSenha) {
  var usuario = buscarPorEmail(emailAtual);
  if (!usuario || !verificarSenha(senhaAtual, usuario.senhaHash)) {
    return false;
  }
  var senha = novaSenha ? hashSenha(novaSenha) : usuario.senhaHash;
  database.run('UPDATE usuarios SET nome=' + database.sqlValue(nome) +
    ', email=' + database.sqlValue(email) + ', senha_hash=' + database.sqlValue(senha) +
    ' WHERE email COLLATE utf8mb4_unicode_ci=' + database.sqlValue(emailAtual) +
    ' COLLATE utf8mb4_unicode_ci');
  return true;
}

function autenticar(email, senha) {
  var usuario = buscarPorEmail(email);
  if (!usuario || !verificarSenha(senha, usuario.senhaHash)) {
    return null;
  }
  database.run('UPDATE usuarios SET ultimo_login=CURRENT_TIMESTAMP WHERE id=' + usuario.id);
  return usuario;
}

module.exports = {
  buscarPorEmail: buscarPorEmail,
  cadastrar: cadastrar,
  atualizarPerfil: atualizarPerfil,
  autenticar: autenticar
};
