var express = require('express');
var usuarios = require('../lib/usuarios');
var router = express.Router();

/* GET cadastro page. */
router.get('/', function(req, res, next) {
  res.render('cadastro', { title: 'Cadastro' });
});

/* POST cadastro form (simple placeholder). */
router.post('/', function(req, res, next) {
  var nome = req.body.nome;
  var email = req.body.email;
  var senha = req.body.senha;

  if (!nome || !email || !senha) {
    return res.status(400).render('cadastro', {
      title: 'Cadastro',
      message: 'Preencha nome, e-mail e senha'
    });
  }

  try {
    usuarios.cadastrar(nome, email, senha);
    return res.redirect('/login');
  } catch (erro) {
    return res.status(400).render('cadastro', {
      title: 'Cadastro',
      message: 'Não foi possível cadastrar este usuário. Verifique se o e-mail já está em uso.'
    });
  }
});

module.exports = router;
