const express = require("express");
const router = express.Router();
const dbConn = require("../lib/db");

// GET request - todas las tablas detectadas
router.get("/", function (req, res) {
  dbConn.query(
    "SELECT * FROM tabla_detectada;",
    function (err, result, fields) {
      if (err) {
        console.log("Error en la consulta a la BD: " + err);
        res.status(500).send("Error en la consulta a la BD");
      }
      // Enviar resultado en forma de JSON
      res.json(result);
    }
  );
});

// GET request - tablas detectadas en un rango de fechas
router.get("/por-fechas", function (req, res) {
  const { startDate, endDate } = req.query;

  let query = `SELECT * FROM tabla_detectada`;
  if (startDate && endDate) {
    query += ` WHERE fecha BETWEEN '${startDate}' AND '${endDate}'`;
  }

  dbConn.query(query, function (err, result, fields) {
    if (err) {
      console.log("Error en la consulta a la BD: " + err);
      res.status(500).send("Error en la consulta a la BD");
    }
    // Enviar resultado en forma de JSON
    res.json(result);
  });
});

// GET request - tablas detectadas de un grosor específico
router.get("/por-grosor", function (req, res) {
  const { grosor } = req.query;

  if (grosor) {
    dbConn.query(
      "SELECT * FROM tabla_detectada WHERE grosor = ?",
      [grosor],
      function (err, result, fields) {
        if (err) {
          console.log("Error en la consulta a la BD: " + err);
          res.status(500).send("Error en la consulta a la BD");
        }
        // Enviar resultado en forma de JSON
        res.json(result);
      }
    );
  } else {
    res.status(400).send("Por favor, especifica un grosor");
  }
});

// GET request - paginación de tablas detectadas
router.get("/paginado", function (req, res) {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  dbConn.query(
    "SELECT * FROM tabla_detectada LIMIT ?, ?",
    [offset, limit],
    function (err, result, fields) {
      if (err) {
        console.log("Error en la consulta a la BD: " + err);
        res.status(500).send("Error en la consulta a la BD");
      }
      // Enviar resultado en forma de JSON
      res.json(result);
    }
  );
});

// POST request
router.post("/", function (req, res) {
  let tabla = req.body;

  dbConn.query(
    `INSERT INTO tabla_detectada SET grosor=?, longitud=?, cantidad=?, fecha=?`,
    [tabla.grosor, tabla.longitud, tabla.cantidad, tabla.fecha],
    function (err, result) {
      if (err) {
        console.log("Error en el INSERT: " + err);
        res.status(500).send("Error al insertar en la BD");
      } else {
        // Enviar resultado en forma de JSON
        res.send("Se ha insertado correctamente");
      }
    }
  );
});

// DELETE request
router.delete("/:id", function (req, res) {
  dbConn.query(
    "DELETE FROM tabla_detectada WHERE id=?",
    [req.params.id],
    function (err, result) {
      if (err) {
        console.log("Error en el borrado: " + err);
        res.status(500).send("Error al eliminar de la BD");
      } else {
        // Enviar resultado en forma de JSON
        res.send("Borrado correctamente");
      }
    }
  );
});

// PUT request
router.put("/", function (req, res) {
  let tabla = req.body;

  dbConn.query(
    "UPDATE tabla_detectada SET grosor=?, longitud=?, cantidad=?, fecha=? WHERE id=?",
    [tabla.grosor, tabla.longitud, tabla.cantidad, tabla.fecha, tabla.id],
    function (err, result) {
      if (err) {
        console.log("Error en el UPDATE: " + err);
        res.status(500).send("Error al actualizar la BD");
      } else {
        // Enviar mensaje de éxito
        res.send("Actualizado con éxito");
      }
    }
  );
});

router.get("/cubico-por-fecha", function (req, res) {
  const { startDate, endDate, agrupamiento } = req.query;

  let formatoFecha;
  switch (agrupamiento) {
    case "minuto":
      intervalo = "MINUTE";
      formatoFecha = "%Y-%m-%d %H:%i";
      break;
    case "hora":
      intervalo = "HOUR";
      formatoFecha = "%Y-%m-%d %H";
      break;
    case "dia":
      intervalo = "DAY";
      formatoFecha = "%Y-%m-%d";
      break;
    case "semana":
      intervalo = "WEEK";
      formatoFecha = "%Y-%u";
      break;
    case "mes":
      intervalo = "MONTH";
      formatoFecha = "%Y-%m";
      break;
    case "año":
      intervalo = "YEAR";
      formatoFecha = "%Y";
      break;
    default:
      return res.status(400).send("Agrupamiento no válido");
  }

  let query = `
    SELECT 
      DATE_FORMAT(t.fecha, ?) as fecha,
      SUM((m.ancho * m.grosor * m.largo) / 1000000000) as volumen_cubico

    FROM 
      tabla_detectada t 
    JOIN 
      medidas_tablas m ON t.id_medida_ideal = m.id
    WHERE 
      t.fecha BETWEEN ? AND ?
    GROUP BY 
      DATE_FORMAT(t.fecha, ?);
  `;

  dbConn.query(
    query,
    [formatoFecha, startDate, endDate, formatoFecha],
    function (err, result) {
      if (err) {
        console.log("Error en la consulta a la BD: " + err);
        res.status(500).send("Error en la consulta a la BD");
      }
      // Enviar resultado en forma de JSON
      res.json(result);
    }
  );
});

router.get("/tablas-por-medida-y-fecha", function (req, res) {
  const { startDate, endDate, agrupamiento } = req.query;

  let formatoFecha;
  switch (agrupamiento) {
    case "minuto":
      intervalo = "MINUTE";
      formatoFecha = "%Y-%m-%d %H:%i";
      break;
    case "hora":
      intervalo = "HOUR";
      formatoFecha = "%Y-%m-%d %H";
      break;
    case "dia":
      intervalo = "DAY";
      formatoFecha = "%Y-%m-%d";
      break;
    case "semana":
      intervalo = "WEEK";
      formatoFecha = "%Y-%u";
      break;
    case "mes":
      intervalo = "MONTH";
      formatoFecha = "%Y-%m";
      break;
    case "año":
      intervalo = "YEAR";
      formatoFecha = "%Y";
      break;
    default:
      return res.status(400).send("Agrupamiento no válido");
  }

  let query = `
  SELECT 
  DATE_FORMAT(t.fecha, ?) as fecha,
  m.id as medida_id,
  (m.ancho)/10 as ancho,
  (m.grosor)/10 as altura,
  COUNT(*) as num_tablas
FROM 
  tabla_detectada t 
JOIN 
  medidas_tablas m ON t.id_medida_ideal = m.id
WHERE 
  t.fecha BETWEEN ? AND ?
GROUP BY 
  DATE_FORMAT(t.fecha, ?), m.id, m.ancho, m.grosor;
  `;

  dbConn.query(
    query,
    [formatoFecha, startDate, endDate, formatoFecha],
    function (err, result) {
      if (err) {
        console.log("Error en la consulta a la BD: " + err);
        res.status(500).send("Error en la consulta a la BD");
      }
      res.json(result);
    }
  );
});

module.exports = router;
