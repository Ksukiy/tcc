var express = require('express');
var usuarios = require('../lib/usuarios');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

/* POST login form (simple placeholder). */
router.post('/', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  if (!email || !password) {
    return res.status(400).render('login', { title: 'Login', message: 'Preencha e-mail e senha' });
  }

  var usuario = usuarios.autenticar(email, password);
  if (!usuario) {
    return res.status(401).render('login', {
      title: 'Login',
      message: 'E-mail ou senha inválidos.'
    });
  }
  res.cookie('usuario_email', usuario.email, { httpOnly: true, sameSite: 'lax' });
  res.cookie('usuario_nome', usuario.nome, { httpOnly: true, sameSite: 'lax' });
  return res.redirect('/inicio?usuario=' + encodeURIComponent(usuario.email) +
    '&nome=' + encodeURIComponent(usuario.nome));
});

module.exports = router;
