const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganMiddleware = require("./lib/morgan.middleware");
// Importa Socket.IO y crea el servidor HTTP
const http = require('http');
const socketIO = require('socket.io');


const cors = require('cors');

//Importamos rutas
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
const preciosmaderaRoute = require('./routes/clientes');
const refreshTokensRouter = require('./routes/preciosmadera');

//Seguridad, pedit token para acceder a las rutas
const verifyToken = require('./lib/validate-token');


const app = express();


const ioClient = require('socket.io-client');

// Conéctate a la aplicación Flask en la Raspberry Pi (reemplaza 'http://raspberry_pi_IP:port' con la IP y el puerto reales)
const socket = ioClient('http://127.0.0.1:5000');

// Suscríbete a los eventos emitidos por la aplicación Flask
socket.on('connect', () => {
  console.log('Conectado a la aplicación Flask en la Raspberry Pi');
});

socket.on('disconnect', () => {
  console.log('Desconectado de la aplicación Flask en la Raspberry Pi');
});

// Evento personalizado (reemplaza 'my_event' con el nombre real del evento)
socket.on('my_event', (data) => {
  console.log('Datos recibidos desde la aplicación Flask:', data);
});



//Aquí indicamos la configuración
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

//Rutas que usamos, y que acontece en cada una está dentro de cada archivo
app.use('/', indexRouter);
app.use('/empresa',verifyToken, empresaRouter);
app.use('/productos',verifyToken, productosRouter);
app.use('/compras',verifyToken, comprasRouter);
app.use('/contacto',verifyToken ,contactoRouter);
app.use('/paquetes',verifyToken, paquetesRouter);
app.use('/transporte',verifyToken ,transporteRouter);
app.use('/login',loginRouter);
app.use('/medidas',verifyToken, medidasRouter);
app.use('/clientes',verifyToken, clientesRouter);
app.use('/preciosmadera',verifyToken,preciosmaderaRoute);
app.use('/refreshtoken',refreshTokensRouter);


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
});

module.exports = app;
