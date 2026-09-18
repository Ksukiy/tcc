var express = require('express');
var router = express.Router();

/* Redirect root to login page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

/* GET home dashboard page. */
router.get('/inicio', function(req, res, next) {
  res.render('index', {
    title: 'Gerenciamento de Estoque',
    usuario: req.query.usuario
  });
});

module.exports = router;
