// Express_MadEst/app.js
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganMiddleware = require("./lib/morgan.middleware");
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const loginRouter = require('./routes/login');
const refreshTokensRouter = require('./routes/refreshToken');
const tablasdetectadasRoute = require('./routes/tablasdetectadas');
const estadisticasRoute = require('./routes/estadisticas');
const medidastablasRoute = require('./routes/medidastablas');
const verifyToken = require('./lib/validate-token');

const app = express();

// Seguridad básica
app.use(helmet({ crossOriginResourcePolicy: false }));

// Logs y parsers
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.maderaexteriores.com'],
  credentials: true,
}));

// Rate limits de auth
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiados intentos de login, inténtalo más tarde' }
});
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true, legacyHeaders: false
});

// Rutas
app.use('/login', loginLimiter, loginRouter);
app.use('/refreshtoken', refreshLimiter, refreshTokensRouter);

app.use('/tablasdetectadas', verifyToken, tablasdetectadasRoute);
app.use('/medidastablas', verifyToken, medidastablasRoute);
app.use('/estadisticas', verifyToken, estadisticasRoute);

// 404
app.use((req, res, next) => next(createError(404)));

// 500
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({ error: 'Error interno' });
});

module.exports = { app };
