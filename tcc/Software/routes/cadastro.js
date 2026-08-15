var express = require('express');
var router = express.Router();

/* GET cadastro page. */
router.get('/', function(req, res, next) {
  res.render('cadastro', { title: 'Cadastro' });
});

/* POST cadastro form (simple placeholder). */
router.post('/', function(req, res, next) {
  var nome = req.body.nome;
  var senha = req.body.senha;
  var dataNascimento = req.body.dataNascimento;

  if (!nome || !senha || !dataNascimento) {
    return res.status(400).render('cadastro', {
      title: 'Cadastro',
      message: 'Preencha nome, senha e data de nascimento'
    });
  }

  // TODO: persist user and hash password before saving.
  return res.redirect('/login');
});

module.exports = router;
