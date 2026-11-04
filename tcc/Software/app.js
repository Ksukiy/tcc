var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var equipamentosRouter = require('./routes/equipamentos');
var clientesRouter = require('./routes/clientes');
var veiculosRouter = require('./routes/veiculos');
var acessoriosRouter = require('./routes/acessorios');
var loginRouter = require('./routes/login');
var cadastroRouter = require('./routes/cadastro');
var adicionarRouter = require('./routes/adicionar');
var perfilRouter = require('./routes/perfil');
var objetosRouter = require('./routes/objetos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function(req, res, next) {
  res.locals.usuario = req.cookies.usuario_email || req.query.usuario;
  res.locals.nome = req.cookies.usuario_nome || req.query.nome;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/equipamentos', equipamentosRouter);
app.use('/clientes', require('./routes/clientes'));
app.use('/veiculos', require('./routes/veiculos'));
app.use('/acessorios', require('./routes/acessorios'));
app.use('/login', require('./routes/login'));
app.use('/cadastro', cadastroRouter);
app.use('/adicionar', adicionarRouter);
app.use('/perfil', perfilRouter);
app.use('/objetos', objetosRouter);
app.use('/opcoes', require('./routes/opcoes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
