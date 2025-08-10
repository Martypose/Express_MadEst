// routes/estadisticas.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// ISO/Z -> 'YYYY-MM-DD HH:mm:SS'
function isoToMysql(v) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

router.get('/', async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 15, 1000);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const fromDate = isoToMysql(req.query.fromDate);
    const toDate   = isoToMysql(req.query.toDate);
    const hasRange = !!(fromDate && toDate);

    const baseSelect = `
      SELECT id,
             DATE_FORMAT(fecha, "%Y-%m-%d %H:%i:%s") AS fecha,
             uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry
      FROM estadisticas`;
    const baseCount  = `SELECT COUNT(*) AS total FROM estadisticas`;
    const where      = hasRange ? ` WHERE fecha BETWEEN ? AND ?` : ``;

    const dataSql   = `${baseSelect}${where} ORDER BY fecha DESC LIMIT ? OFFSET ?`;
    const dataArgs  = hasRange ? [fromDate, toDate, limit, offset] : [limit, offset];
    const countSql  = `${baseCount}${where}`;
    const countArgs = hasRange ? [fromDate, toDate] : [];

    const totalRows = await db.query(countSql, countArgs);
    const rows      = await db.query(dataSql, dataArgs);

    res.json({ data: rows, total: totalRows[0]?.total ?? 0 });
  } catch (err) {
    console.log('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

module.exports = router;
