var express = require('express');
var dbConn = require('../lib/db');
var router = express.Router();

// Obtener estadísticas con paginación y opcionalmente por fechas
router.get('/', function(req, res) {
  let limit = parseInt(req.query.limit) || 10; // número de registros por página
  let offset = parseInt(req.query.offset) || 0; // inicio del offset
  let fromDate = req.query.fromDate;
  let toDate = req.query.toDate;

  let query = 'SELECT * FROM nombre_tabla_estadisticas';
  let queryParams = [];

  if (fromDate && toDate) {
    query += ' WHERE fecha BETWEEN ? AND ?';
    queryParams.push(fromDate, toDate);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  dbConn.query(query, queryParams, function(err, result) {
    if (err) {
      console.log('Error en la consulta: ' + err);
    }
    res.json(result);
  });
});

module.exports = router;