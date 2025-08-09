// routes/tablasdetectadas.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Todas (legacy) – si aún te hace falta:
router.get('/', (req, res) => {
  db.query('SELECT * FROM tabla_detectada', (err, rows) => {
    if (err) return res.status(500).send('Error en la consulta a la BD');
    res.json(rows);
  });
});

// Por fechas (legacy)
router.get('/por-fechas', (req, res) => {
  const { startDate, endDate } = req.query;
  let sql = 'SELECT * FROM tabla_detectada';
  const params = [];
  if (startDate && endDate) {
    sql += ' WHERE fecha BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).send('Error en la consulta a la BD');
    res.json(rows);
  });
});

// Filtrado por grosor real desde la nueva tabla
router.get('/por-grosor', (req, res) => {
  const { grosor } = req.query;
  if (!grosor) return res.status(400).send('Especifica grosor_mm');
  db.query(
    'SELECT * FROM medidas_cenital WHERE grosor_lateral_mm = ?',
    [grosor],
    (err, rows) => {
      if (err) return res.status(500).send('Error en la consulta');
      res.json(rows);
    }
  );
});

// === NUEVO === Volumen m³ por fecha y grosor (para el chart apilado)
router.get('/cubico-por-fecha', async (req, res) => {
  try {
    const { startDate, endDate, agrupamiento = 'dia' } = req.query;

    const fmt = {
      minuto: '%Y-%m-%d %H:%i',
      hora:   '%Y-%m-%d %H',
      dia:    '%Y-%m-%d',
      semana: '%Y-%u',
      mes:    '%Y-%m',
      año:    '%Y',
    }[agrupamiento];

    if (!fmt) return res.status(400).send('Agrupamiento no válido');

    const sql = `
      SELECT
        DATE_FORMAT(fecha, ?)       AS fecha,
        ROUND(grosor_lateral_mm,0)  AS grosor,
        SUM(ancho_mm * grosor_lateral_mm * 1) / 1000000.0 AS volumen_cubico
      FROM medidas_cenital
      WHERE fecha BETWEEN ? AND ?
        AND ancho_mm IS NOT NULL
        AND grosor_lateral_mm IS NOT NULL
      GROUP BY DATE_FORMAT(fecha, ?), ROUND(grosor_lateral_mm,0)
      ORDER BY fecha ASC;
    `;

    const rows = await db.query(sql, [fmt, startDate, endDate, fmt]);
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

// Números por medida ideal (legacy) – sin cambios
router.get('/tablas-por-medida-y-fecha', (req, res) => {
  const { startDate, endDate, agrupamiento } = req.query;

  let formatoFecha, intervalo;
  switch (agrupamiento) {
    case 'minuto': intervalo = 'MINUTE'; formatoFecha = '%Y-%m-%d %H:%i'; break;
    case 'hora':   intervalo = 'HOUR';   formatoFecha = '%Y-%m-%d %H';    break;
    case 'dia':    intervalo = 'DAY';    formatoFecha = '%Y-%m-%d';       break;
    case 'semana': intervalo = 'WEEK';   formatoFecha = '%Y-%u';          break;
    case 'mes':    intervalo = 'MONTH';  formatoFecha = '%Y-%m';          break;
    case 'año':    intervalo = 'YEAR';   formatoFecha = '%Y';             break;
    default: return res.status(400).send('Agrupamiento no válido');
  }

  const sql = `
    SELECT 
      DATE_FORMAT(t.fecha, ?) as fecha,
      m.id as medida_id,
      (m.ancho)/10 as ancho,
      (m.grosor)/10 as altura,
      COUNT(*) as num_tablas
    FROM tabla_detectada t
    JOIN medidas_tablas m ON t.id_medida_ideal = m.id
    WHERE t.fecha BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(t.fecha, ?), m.id, m.ancho, m.grosor;
  `;

  db.query(sql, [formatoFecha, startDate, endDate, formatoFecha], (err, rows) => {
    if (err) return res.status(500).send('Error en la consulta a la BD');
    res.json(rows);
  });
});

module.exports = router;
