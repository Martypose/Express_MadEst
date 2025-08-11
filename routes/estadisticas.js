const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Convierte un ISO o timestamp a 'YYYY-MM-DD HH:mm:ss' **en UTC**
function toMysqlUtc(v) {
  if (!v) return null;
  const d = (typeof v === 'number') ? new Date(v) : new Date(String(v));
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 19).replace('T', ' '); // UTC plano
}

router.get('/', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit, 10)  || 15, 1000);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    // El front manda ISO (UTC). Los convertimos a DATETIME(UTC) para el WHERE.
    const fromUtc = toMysqlUtc(req.query.fromDate);
    const toUtc   = toMysqlUtc(req.query.toDate);
    const hasRange = !!(fromUtc && toUtc);

    // Ojo: convertimos fecha almacenada (UTC) → Europa/Madrid para mostrar
    const baseSelect = `
      SELECT
        id,
        DATE_FORMAT(CONVERT_TZ(fecha, '+00:00', 'Europe/Madrid'), '%Y-%m-%d %H:%i:%s') AS fecha,
        uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry
      FROM estadisticas
    `;
    const baseCount  = `SELECT COUNT(*) AS total FROM estadisticas`;
    const where      = hasRange ? ` WHERE fecha BETWEEN ? AND ?` : ``;

    // NO usar placeholders en LIMIT/OFFSET
    const dataSql   = `${baseSelect}${where} ORDER BY fecha DESC LIMIT ${limit} OFFSET ${offset}`;
    const dataArgs  = hasRange ? [fromUtc, toUtc] : [];

    const countSql  = `${baseCount}${where}`;
    const countArgs = hasRange ? [fromUtc, toUtc] : [];

    const totalRows = await db.query(countSql, countArgs);
    const rows      = await db.query(dataSql, dataArgs);

    res.json({ data: rows, total: totalRows[0]?.total ?? 0 });
  } catch (err) {
    console.log('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

module.exports = router;
