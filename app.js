const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganMiddleware = require("./lib/morgan.middleware");
const cors = require('cors');

// Importamos rutas
const indexRouter = require('./routes/index');
const empresaRouter = require('./routes/empresa');
const productosRouter = require('./routes/productos');
const comprasRouter = require('./routes/compras');
const contactoRouter = require('./routes/contacto');
const paquetesRouter = require('./routes/paquetes');
const transporteRouter = require('./routes/transporte');
const loginRouter = require('./routes/login');
const medidasRouter = require('./routes/medidas');
const clientesRouter = require('./routes/clientes');
const preciosmaderaRoute = require('./routes/preciosmadera');
const refreshTokensRouter = require('./routes/refreshToken');
const tablasdetectadasRoute = require('./routes/tablasdetectadas');
const estadisticasRoute = require('./routes/estadisticas');
const medidastablasRoute = require('./routes/medidastablas');
// Seguridad, pedir token para acceder a las rutas
const verifyToken = require('./lib/validate-token');

const app = express();



// Configuración de Server HTTP
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.maderaexteriores.com'],
  credentials: true,
}));

// Rutas de la API HTTP
app.use('/', indexRouter);
app.use('/empresa', verifyToken, empresaRouter);
app.use('/productos', verifyToken, productosRouter);
app.use('/compras', verifyToken, comprasRouter);
app.use('/contacto', verifyToken, contactoRouter);
app.use('/paquetes', verifyToken, paquetesRouter);
app.use('/transporte', verifyToken, transporteRouter);
app.use('/login', loginRouter);
app.use('/medidas', verifyToken, medidasRouter);
app.use('/clientes', verifyToken, clientesRouter);
app.use('/preciosmadera', verifyToken, preciosmaderaRoute);
app.use('/tablasdetectadas', verifyToken, tablasdetectadasRoute);
app.use('/medidastablas', verifyToken, medidastablasRoute);
app.use('/estadisticas',verifyToken, estadisticasRoute);
app.use('/refreshtoken', refreshTokensRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = { app};
