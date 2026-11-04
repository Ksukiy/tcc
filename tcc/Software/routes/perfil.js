var express = require('express');
var usuarios = require('../lib/usuarios');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('perfil', {
    title: 'Editar perfil',
    nome: req.query.nome || req.cookies.usuario_nome || '',
    email: req.query.usuario || req.cookies.usuario_email || ''
  });
});

router.post('/', function(req, res) {
  var nome = req.body.nome;
  var email = req.body.email;
  var emailAtual = req.cookies.usuario_email || email;
  var senhaAtual = req.body.senhaAtual;
  var novaSenha = req.body.novaSenha;
  var confirmarSenha = req.body.confirmarSenha;

  if (!nome || !email || !senhaAtual) {
    return res.status(400).render('perfil', {
      title: 'Editar perfil',
      nome: nome || '',
      email: email || '',
      message: 'Informe o nome, o e-mail e a senha atual.'
    });
  }

  if (novaSenha && novaSenha !== confirmarSenha) {
    return res.status(400).render('perfil', {
      title: 'Editar perfil',
      nome: nome,
      email: email,
      message: 'A nova senha e a confirmação precisam ser iguais.'
    });
  }

  try {
    if (!usuarios.atualizarPerfil(emailAtual, nome, email, senhaAtual, novaSenha)) {
      return res.status(400).render('perfil', {
        title: 'Editar perfil',
        nome: nome,
        email: email,
        message: 'A senha atual está incorreta.'
      });
    }
  } catch (erro) {
    return res.status(400).render('perfil', {
      title: 'Editar perfil',
      nome: nome,
      email: email,
      message: 'Não foi possível atualizar os dados. Verifique se o e-mail já está em uso.'
    });
  }
  res.cookie('usuario_email', email, { httpOnly: true, sameSite: 'lax' });
  res.cookie('usuario_nome', nome, { httpOnly: true, sameSite: 'lax' });
  return res.redirect('/inicio?usuario=' + encodeURIComponent(email));
});

module.exports = router;
