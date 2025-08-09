// routes/tablasdetectadas.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Legacy (si lo sigues usando)
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM tabla_detectada');
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

// Legacy por fechas
router.get('/por-fechas', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = 'SELECT * FROM tabla_detectada';
    const params = [];
    if (startDate && endDate) {
      sql += ' WHERE fecha BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    const rows = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

// === NUEVO === Cubicaje por fecha y grosor real (tabla medidas_cenital)
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

    const rows = await db.query(
      `
      SELECT
        DATE_FORMAT(fecha, ?)       AS fecha,
        ROUND(grosor_lateral_mm,0)  AS grosor,
        -- ancho(mm) * grosor(mm) * largo(m) → m³ (si largo=1 m para test)
        SUM(ancho_mm * grosor_lateral_mm * 1) / 1000000.0 AS volumen_cubico
      FROM medidas_cenital
      WHERE fecha BETWEEN ? AND ?
        AND ancho_mm IS NOT NULL
        AND grosor_lateral_mm IS NOT NULL
      GROUP BY DATE_FORMAT(fecha, ?), ROUND(grosor_lateral_mm,0)
      ORDER BY fecha ASC
      `,
      [fmt, startDate, endDate, fmt]
    );

    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

// === NUEVO === últimas mediciones crudas (para debug/front)
router.get('/ultimas', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '200', 10), 1000);
    const rows = await db.query(
      `SELECT id, fecha, camara_id, device_id, tabla_id, frame,
              ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
              grosor_lateral_mm, mm_por_px, px_por_mm,
              ancho_px_mean, ancho_px_std, xl_px, xr_px, rows_valid,
              edge_left_mm, bbox_x, bbox_y, bbox_w, bbox_h, roi_y0, roi_y1
       FROM medidas_cenital
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

// === NUEVO === pequeño resumen rápido por día (mm reales nuevos)
router.get('/resumen', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const rows = await db.query(
      `
      SELECT
        DATE(fecha) AS fecha,
        COUNT(*) AS piezas,
        AVG(ancho_mm) AS ancho_mm_medio,
        AVG(grosor_lateral_mm) AS grosor_mm_medio
      FROM medidas_cenital
      WHERE fecha BETWEEN ? AND ?
        AND ancho_mm IS NOT NULL
        AND grosor_lateral_mm IS NOT NULL
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC
      `,
      [startDate, endDate]
    );
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

module.exports = router;
