var express = require("express");
var db = require("../lib/db");
var router = express.Router();

// Obtener estadísticas con paginación y opcionalmente por fechas
router.get("/", function (req, res) {
  let limit = parseInt(req.query.limit) || 10; // número de registros por página
  let offset = parseInt(req.query.offset) || 0; // inicio del offset
  let fromDate = req.query.fromDate;
  let toDate = req.query.toDate;

  let query =
    'SELECT id, DATE_FORMAT(fecha, "%Y-%m-%d %H:%i:%s") as fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry FROM estadisticas';
  let queryParams = [];

  if (fromDate && toDate) {
    query += " WHERE fecha BETWEEN ? AND ?";
    queryParams.push(fromDate, toDate);
  }
  query += " ORDER BY fecha DESC";
  query += " LIMIT ? OFFSET ?";
  queryParams.push(limit, offset);

  // Primero, obtener el número total de registros que coinciden con los filtros
  let countQuery = "SELECT COUNT(*) as total FROM estadisticas";
  if (fromDate && toDate) {
    countQuery += " WHERE fecha BETWEEN ? AND ?";
  }

  db.query(countQuery, [fromDate, toDate], function (err, countResult) {
    if (err) {
      console.log("Error en la consulta de conteo: " + err);
      return;
    }

    const total = countResult[0].total;

    // Ahora, obtener los registros
    db.query(query, queryParams, function (err, result) {
      if (err) {
        console.log("Error en la consulta: " + err);
        return;
      }
      res.json({ data: result, total: total });
    });
  });
});

module.exports = router;
