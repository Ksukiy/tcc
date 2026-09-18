var express = require('express');
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

  // TODO: replace with real authentication
  return res.redirect('/inicio?usuario=' + encodeURIComponent(email));
});

module.exports = router;
