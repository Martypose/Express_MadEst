const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//Importamos rutas
const indexRouter = require('./routes/index');
const empresaRouter = require('./routes/empresa');
const serradoRouter = require('./routes/serrado');
const productosRouter = require('./routes/productos');
const comprasRouter = require('./routes/compras');
const contactoRouter = require('./routes/contacto');
const paquetesRouter = require('./routes/paquetes');


const app = express();

//Aquí indicamos la configuración de nuestras views, en este caso Handlebars y automáticamente sabe que el layout base predefinido es layaout.hbs
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Rutas que usamos, y que acontece en cada una está dentro de cada archivo
app.use('/', indexRouter);
app.use('/empresa', empresaRouter);
app.use('/serrado', serradoRouter);
app.use('/productos', productosRouter);
app.use('/compras', comprasRouter);
app.use('/contacto', contactoRouter);
app.use('/paquetes', paquetesRouter);


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
