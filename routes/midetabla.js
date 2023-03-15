const express = require('express');
const router = express.Router();

// Importa 'io' desde app.js
const io = require('../app').io;

// Define tu ruta como de costumbre
router.post('/', function(req, res, next) {
  // ... (tu código aquí)

  // Emitir evento 'medidas' a todos los clientes conectados
  const medidas = {data:'hola'}; // Reemplaza esto con tus datos reales
  io.emit('medidas', medidas);

  // ... (resto de tu código)
});

module.exports = router;