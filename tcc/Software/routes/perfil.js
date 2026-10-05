var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('perfil', {
    title: 'Editar perfil',
    email: req.query.usuario || ''
  });
});

router.post('/', function(req, res) {
  var email = req.body.email;
  var senhaAtual = req.body.senhaAtual;
  var novaSenha = req.body.novaSenha;
  var confirmarSenha = req.body.confirmarSenha;

  if (!email || !senhaAtual) {
    return res.status(400).render('perfil', {
      title: 'Editar perfil',
      email: email || '',
      message: 'Informe o e-mail e a senha atual.'
    });
  }

  if (novaSenha && novaSenha !== confirmarSenha) {
    return res.status(400).render('perfil', {
      title: 'Editar perfil',
      email: email,
      message: 'A nova senha e a confirmação precisam ser iguais.'
    });
  }

  // TODO: persistir o e-mail e atualizar a senha com hash no backend.
  return res.redirect('/inicio?usuario=' + encodeURIComponent(email));
});

module.exports = router;
