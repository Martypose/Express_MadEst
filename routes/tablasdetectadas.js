// routes/tablasdetectadas.js
const express = require("express");
const router = express.Router();
const dbConn = require("../lib/db"); // pool callback-style
// ^ este módulo es el que ya usas desde app.js. :contentReference[oaicite:2]{index=2}

/** Util: formato MySQL para cada agrupamiento */
function formatoPorAgrupamiento(agrupamiento) {
  switch (agrupamiento) {
    case "minuto": return "%Y-%m-%d %H:%i";
    case "hora":   return "%Y-%m-%d %H";
    case "dia":    return "%Y-%m-%d";
    case "semana": return "%Y-%u";     // semana ISO
    case "mes":    return "%Y-%m";
    case "año":    return "%Y";
    default:       return null;
  }
}

/** GET /tablasdetectadas
 *  — Tabla legacy completa (se mantiene) */
router.get("/", function (req, res) {
  dbConn.query("SELECT * FROM tabla_detectada;", function (err, result) {
    if (err) {
      console.log("Error en la consulta a la BD: " + err);
      return res.status(500).send("Error en la consulta a la BD");
    }
    res.json(result);
  });
});

/** GET /tablasdetectadas/por-fechas — legacy (se mantiene) */
router.get("/por-fechas", function (req, res) {
  const { startDate, endDate } = req.query;
  let query = `SELECT * FROM tabla_detectada`;
  if (startDate && endDate) {
    query += ` WHERE fecha BETWEEN '${startDate}' AND '${endDate}'`;
  }
  dbConn.query(query, function (err, result) {
    if (err) {
      console.log("Error en la consulta a la BD: " + err);
      return res.status(500).send("Error en la consulta a la BD");
    }
    res.json(result);
  });
});

/** GET /tablasdetectadas/por-grosor
 *  — Ahora filtra por grosor_lateral_mm (nuevo esquema) */
router.get("/por-grosor", function (req, res) {
  const { grosor } = req.query;
  if (!grosor) return res.status(400).send("Especifica grosor (mm)");
  dbConn.query(
    "SELECT * FROM medidas_cenital WHERE ROUND(grosor_lateral_mm) = ?",
    [grosor],
    function (err, result) {
      if (err) return res.status(500).send("Error en la consulta");
      res.json(result);
    }
  );
});

/** GET /tablasdetectadas/paginado — legacy (se mantiene) */
router.get("/paginado", function (req, res) {
  const page = parseInt(req.query.page ?? "1", 10);
  const limit = parseInt(req.query.limit ?? "10", 10);
  const offset = (page - 1) * limit;
  dbConn.query(
    "SELECT * FROM tabla_detectada LIMIT ?, ?",
    [offset, limit],
    function (err, result) {
      if (err) {
        console.log("Error en la consulta a la BD: " + err);
        return res.status(500).send("Error en la consulta a la BD");
      }
      res.json(result);
    }
  );
});

/** POST /tablasdetectadas — legacy (se mantiene) */
router.post("/", function (req, res) {
  let tabla = req.body;
  dbConn.query(
    `INSERT INTO tabla_detectada SET grosor=?, longitud=?, cantidad=?, fecha=?`,
    [tabla.grosor, tabla.longitud, tabla.cantidad, tabla.fecha],
    function (err) {
      if (err) {
        console.log("Error en el INSERT: " + err);
        return res.status(500).send("Error al insertar en la BD");
      }
      res.send("Se ha insertado correctamente");
    }
  );
});

/** DELETE /tablasdetectadas/:id — legacy (se mantiene) */
router.delete("/:id", function (req, res) {
  dbConn.query(
    "DELETE FROM tabla_detectada WHERE id=?",
    [req.params.id],
    function (err) {
      if (err) {
        console.log("Error en el borrado: " + err);
        return res.status(500).send("Error al eliminar de la BD");
      }
      res.send("Borrado correctamente");
    }
  );
});

/** PUT /tablasdetectadas — legacy (se mantiene) */
router.put("/", function (req, res) {
  let tabla = req.body;
  dbConn.query(
    "UPDATE tabla_detectada SET grosor=?, longitud=?, cantidad=?, fecha=? WHERE id=?",
    [tabla.grosor, tabla.longitud, tabla.cantidad, tabla.fecha, tabla.id],
    function (err) {
      if (err) {
        console.log("Error en el UPDATE: " + err);
        return res.status(500).send("Error al actualizar la BD");
      }
      res.send("Actualizado con éxito");
    }
  );
});

/** NUEVO CORE
 *  GET /tablasdetectadas/cubico-por-fecha
 *  Devuelve volumen por fecha y apilado por grosor (m³)
 *  usando la tabla nueva `medidas_cenital`. */
router.get("/cubico-por-fecha", function (req, res) {
  const { startDate, endDate, agrupamiento } = req.query;
  const formato = formatoPorAgrupamiento(agrupamiento);
  if (!formato) return res.status(400).send("Agrupamiento no válido");
  if (!startDate || !endDate) return res.status(400).send("Faltan fechas");

  // Nota: mm*mm/1e6 = m²; multiplicamos por 1 m de largo (suposición actual)
  const sql = `
    SELECT
      DATE_FORMAT(fecha, ?)        AS fecha,
      ROUND(grosor_lateral_mm, 0)  AS grosor,
      COUNT(*)                     AS num_tablas,
      SUM(ancho_mm * grosor_lateral_mm) / 1000000 AS volumen_cubico
    FROM medidas_cenital
    WHERE fecha BETWEEN ? AND ?
      AND ancho_mm IS NOT NULL
      AND grosor_lateral_mm IS NOT NULL
    GROUP BY DATE_FORMAT(fecha, ?), ROUND(grosor_lateral_mm, 0)
    ORDER BY fecha ASC;
  `;

  dbConn.query(sql, [formato, startDate, endDate, formato], function (err, rows) {
    if (err) {
      console.log("Error en la consulta a la BD: " + err);
      return res.status(500).send("Error en la consulta a la BD");
    }
    res.json(rows);
  });
});

/** NUEVO (útil para TablasNúmero sin dependencia de medidas_tablas)
 *  GET /tablasdetectadas/numeros-v2
 *  Cuenta de piezas por fecha, agrupada por ancho y grosor REALES (mm) */
router.get("/numeros-v2", function (req, res) {
  const { startDate, endDate, agrupamiento } = req.query;
  const formato = formatoPorAgrupamiento(agrupamiento);
  if (!formato) return res.status(400).send("Agrupamiento no válido");
  if (!startDate || !endDate) return res.status(400).send("Faltan fechas");

  const sql = `
    SELECT
      DATE_FORMAT(fecha, ?)        AS fecha,
      ROUND(ancho_mm, 0)           AS ancho,
      ROUND(grosor_lateral_mm, 0)  AS grosor,
      COUNT(*)                     AS num_tablas
    FROM medidas_cenital
    WHERE fecha BETWEEN ? AND ?
      AND ancho_mm IS NOT NULL
      AND grosor_lateral_mm IS NOT NULL
    GROUP BY DATE_FORMAT(fecha, ?), ROUND(ancho_mm, 0), ROUND(grosor_lateral_mm, 0)
    ORDER BY fecha ASC, ancho ASC, grosor ASC;
  `;

  dbConn.query(sql, [formato, startDate, endDate, formato], function (err, rows) {
    if (err) {
      console.log("Error en la consulta a la BD: " + err);
      return res.status(500).send("Error en la consulta a la BD");
    }
    res.json(rows);
  });
});

module.exports = router;
