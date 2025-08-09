// routes/tablasdetectadas.js
const express = require("express");
const router = express.Router();
const dbConn = require("../lib/db");

// GET - todas las filas legacy de tabla_detectada (compat)
router.get("/", async (req, res) => {
  try {
    const rows = await dbConn.query("SELECT * FROM tabla_detectada");
    res.json(rows);
  } catch (err) {
    console.log("Error en la consulta a la BD:", err);
    res.status(500).send("Error en la consulta a la BD");
  }
});

// GET - tablas detectadas en un rango de fechas (legacy)
router.get("/por-fechas", async (req, res) => {
  const { startDate, endDate } = req.query;
  let sql = "SELECT * FROM tabla_detectada";
  const params = [];
  if (startDate && endDate) {
    sql += " WHERE fecha BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }
  try {
    const rows = await dbConn.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.log("Error en la consulta a la BD:", err);
    res.status(500).send("Error en la consulta a la BD");
  }
});

// GET - medidas reales por grosor (USAR grosor_lateral_mm)
router.get("/por-grosor", async (req, res) => {
  const { grosor } = req.query;
  if (!grosor) return res.status(400).send("Especifica grosor_mm");
  try {
    const rows = await dbConn.query(
      "SELECT *, grosor_lateral_mm AS grosor_mm FROM medidas_cenital WHERE grosor_lateral_mm = ?",
      [grosor]
    );
    res.json(rows);
  } catch (err) {
    console.log("Error en la consulta:", err);
    res.status(500).send("Error en la consulta");
  }
});

// GET - paginado (legacy)
router.get("/paginado", async (req, res) => {
  const page  = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 500);
  const offset = (page - 1) * limit;

  try {
    const rows = await dbConn.query("SELECT * FROM tabla_detectada LIMIT ?, ?", [offset, limit]);
    res.json(rows);
  } catch (err) {
    console.log("Error en la consulta a la BD:", err);
    res.status(500).send("Error en la consulta a la BD");
  }
});

// POST legacy
router.post("/", async (req, res) => {
  const t = req.body;
  try {
    await dbConn.query(
      `INSERT INTO tabla_detectada (grosor, longitud, cantidad, fecha) VALUES (?, ?, ?, ?)`,
      [t.grosor, t.longitud, t.cantidad, t.fecha]
    );
    res.send("Se ha insertado correctamente");
  } catch (err) {
    console.log("Error en el INSERT:", err);
    res.status(500).send("Error al insertar en la BD");
  }
});

// DELETE legacy
router.delete("/:id", async (req, res) => {
  try {
    await dbConn.query("DELETE FROM tabla_detectada WHERE id=?", [req.params.id]);
    res.send("Borrado correctamente");
  } catch (err) {
    console.log("Error en el borrado:", err);
    res.status(500).send("Error al eliminar de la BD");
  }
});

// PUT legacy
router.put("/", async (req, res) => {
  const t = req.body;
  try {
    await dbConn.query(
      "UPDATE tabla_detectada SET grosor=?, longitud=?, cantidad=?, fecha=? WHERE id=?",
      [t.grosor, t.longitud, t.cantidad, t.fecha, t.id]
    );
    res.send("Actualizado con éxito");
  } catch (err) {
    console.log("Error en el UPDATE:", err);
    res.status(500).send("Error al actualizar la BD");
  }
});

// NUEVO: cúbico por fecha (usa ancho_mm * grosor_lateral_mm * 1m)
router.get("/cubico-por-fecha", async (req, res) => {
  const { startDate, endDate, agrupamiento } = req.query;

  const formatos = {
    minuto: "%Y-%m-%d %H:%i",
    hora:   "%Y-%m-%d %H",
    dia:    "%Y-%m-%d",
    semana: "%Y-%u",
    mes:    "%Y-%m",
    año:    "%Y"
  };
  const formatoFecha = formatos[agrupamiento];
  if (!formatoFecha) return res.status(400).send("Agrupamiento no válido");

  const sql = `
    SELECT 
      DATE_FORMAT(fecha, ?) AS fecha,
      SUM(ancho_mm * grosor_lateral_mm * 1) / 1000000 AS volumen_cubico_m3
    FROM medidas_cenital
    WHERE fecha BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(fecha, ?)
    ORDER BY MIN(fecha) ASC
  `;

  try {
    const rows = await dbConn.query(sql, [formatoFecha, startDate, endDate, formatoFecha]);
    res.json(rows);
  } catch (err) {
    console.log("Error en la consulta a la BD:", err);
    res.status(500).send("Error en la consulta a la BD");
  }
});

module.exports = router;
