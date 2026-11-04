var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

/* Redirect root to login page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

/* GET home dashboard page. */
router.get('/inicio', function(req, res, next) {
  res.render('index', {
    title: 'Gerenciamento de Estoque',
    usuario: res.locals.usuario,
    nome: res.locals.nome,
    resumo: {
      equipamentos: objetos.contarPorTipo('Equipamento'),
      acessorios: objetos.contarPorTipo('Acessório'),
      veiculos: objetos.contarPorTipo('Veículo'),
      clientes: objetos.contarPorTipo('Cliente')
    }
  });
});

module.exports = router;
