var express = require('express');
var router = express.Router();
var objetos = require('../lib/objetos');

function remover(req, res) {
  objetos.removerObjeto(req.params.id);
  res.redirect(req.get('Referrer') || '/inicio');
}

router.post('/:id/remover', remover);
router.get('/:id/remover', remover);

module.exports = router;
