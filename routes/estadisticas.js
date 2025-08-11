// routes/estadisticas.js  — completo
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Convierte ISO (con Z) -> cadena MySQL **en UTC**
function isoToMysqlUTC(v) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ` +
         `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

router.get('/', async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit, 10)  || 15, 1000);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    // Rango recibido en ISO -> UTC para el WHERE (la DB guarda UTC)
    const fromDate = isoToMysqlUTC(req.query.fromDate);
    const toDate   = isoToMysqlUTC(req.query.toDate);
    const hasRange = !!(fromDate && toDate);

    // TZ objetivo para presentar (puedes cambiarla por env)
    const TARGET_TZ = process.env.TARGET_TZ || 'Europe/Madrid';
    // Fallback si no hay tablas de TZ: minutos de desfase local respecto a UTC (ej. 120 en CEST)
    const FALLBACK_OFFSET_MIN = -new Date().getTimezoneOffset();

    // SELECT con fecha_local (CONVERT_TZ, o DATE_ADD si no hay TZ tables),
    // y con alias 'fecha' = misma fecha_local (compat con front antiguo).
    const selectSql = `
      SELECT
        id,
        DATE_FORMAT(
          IFNULL(
            CONVERT_TZ(fecha, '+00:00', ?),
            DATE_ADD(fecha, INTERVAL ? MINUTE)
          ),
          "%Y-%m-%d %H:%i:%s"
        ) AS fecha_local,
        DATE_FORMAT(
          IFNULL(
            CONVERT_TZ(fecha, '+00:00', ?),
            DATE_ADD(fecha, INTERVAL ? MINUTE)
          ),
          "%Y-%m-%d %H:%i:%s"
        ) AS fecha,  -- alias compat
        DATE_FORMAT(fecha, "%Y-%m-%d %H:%i:%s") AS fecha_utc,
        uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry
      FROM estadisticas
      ${hasRange ? `WHERE fecha BETWEEN ? AND ?` : ``}
      ORDER BY fecha DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Pasamos TARGET_TZ y FALLBACK dos veces (fecha_local y alias fecha)
    const selectArgs = hasRange
      ? [TARGET_TZ, FALLBACK_OFFSET_MIN, TARGET_TZ, FALLBACK_OFFSET_MIN, fromDate, toDate]
      : [TARGET_TZ, FALLBACK_OFFSET_MIN, TARGET_TZ, FALLBACK_OFFSET_MIN];

    const countSql  = `SELECT COUNT(*) AS total FROM estadisticas ${hasRange ? `WHERE fecha BETWEEN ? AND ?` : ``}`;
    const countArgs = hasRange ? [fromDate, toDate] : [];

    const totalRows = await db.query(countSql, countArgs);
    const rows      = await db.query(selectSql, selectArgs);

    res.json({ data: rows, total: totalRows[0]?.total ?? 0 });
  } catch (err) {
    console.log('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

module.exports = router;
