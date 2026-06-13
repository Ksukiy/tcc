var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('veiculos', { title: 'Veículos' });
});

module.exports = router;
