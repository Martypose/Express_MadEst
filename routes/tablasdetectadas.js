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

// routes/tablasdetectadas.js
router.get("/cubico-por-fecha", async function (req, res) {
  const { startDate, endDate, agrupamiento = "dia" } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).send("startDate y endDate son obligatorios");
  }

  // Map a expresiones literal (sin placeholders dentro de DATE_FORMAT)
  const fmt = (agrupamiento || "").toLowerCase();
  const exprMap = {
    minuto: 'DATE_FORMAT(fecha, "%Y-%m-%d %H:%i:00")',
    hora:   'DATE_FORMAT(fecha, "%Y-%m-%d %H:00:00")',
    dia:    'DATE_FORMAT(fecha, "%Y-%m-%d 00:00:00")',
    semana: 'DATE_FORMAT(fecha, "%x-%v")',
    mes:    'DATE_FORMAT(fecha, "%Y-%m-01 00:00:00")',
    año:    'DATE_FORMAT(fecha, "%Y-01-01 00:00:00")',
    anio:   'DATE_FORMAT(fecha, "%Y-01-01 00:00:00")',
  };
  const periodoExpr = exprMap[fmt];
  if (!periodoExpr) return res.status(400).send("Agrupamiento no válido");

  const sql = `
    SELECT
      x.periodo                  AS fecha,
      x.grosor                   AS grosor_lateral_mm,
      ROUND(SUM(x.volumen), 6)   AS volumen_cubico_m3
    FROM (
      SELECT
        ${periodoExpr}                          AS periodo,
        ROUND(grosor_lateral_mm, 0)            AS grosor,
        (ancho_mm * grosor_lateral_mm * 1) / 1e6 AS volumen
      FROM medidas_cenital
      WHERE fecha BETWEEN ? AND ?
        AND ancho_mm IS NOT NULL
        AND grosor_lateral_mm IS NOT NULL
    ) x
    GROUP BY x.periodo, x.grosor
    ORDER BY x.periodo ASC;
  `;

  try {
    const rows = await db.query(sql, [startDate, endDate]); // usa 'db', no 'dbConn'
    res.json(rows);
  } catch (err) {
    console.log("Error en la consulta a la BD:", err);
    res.status(500).send("Error en la consulta a la BD");
  }
});


router.get('/ultimas', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit ?? '200', 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 200;
    limit = Math.min(limit, 1000);

    const sql = `
      SELECT id, fecha, camara_id, device_id, tabla_id, frame,
             ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
             grosor_lateral_mm, mm_por_px, px_por_mm,
             ancho_px_mean, ancho_px_std, xl_px, xr_px, rows_valid,
             edge_left_mm, bbox_x, bbox_y, bbox_w, bbox_h, roi_y0, roi_y1
      FROM medidas_cenital
      ORDER BY id DESC
      LIMIT ${limit}
    `;
    const rows = await db.query(sql);
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

router.get('/piezas', async (req, res) => {
  try {
    let { startDate, endDate, limit='200', offset='0', orderBy='fecha', orderDir='desc' } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate y endDate son obligatorios" });
    }

    const ORDER_COLS = { id:'id', fecha:'fecha', ancho_mm:'ancho_mm', grosor_mm:'grosor_lateral_mm' };
    const col = ORDER_COLS[String(orderBy||'').toLowerCase()] || 'fecha';
    const dir = String(orderDir||'').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    limit  = Math.min(parseInt(limit,10)||200, 2000);
    offset = Math.max(parseInt(offset,10)||0, 0);

    const TARGET_TZ = process.env.TARGET_TZ || 'Europe/Madrid';
    const FALLBACK_OFFSET_MIN = -new Date().getTimezoneOffset();

    const countSql = `
      SELECT COUNT(*) AS total
      FROM medidas_cenital
      WHERE fecha BETWEEN ? AND ?
        AND ancho_mm IS NOT NULL
        AND grosor_lateral_mm IS NOT NULL
    `;
    const totalRows = await db.query(countSql, [startDate, endDate]);
    const total = totalRows[0]?.total ?? 0;

    const dataSql = `
      SELECT
        id, tabla_id, frame, camara_id, device_id,
        DATE_FORMAT(
          IFNULL(CONVERT_TZ(fecha, '+00:00', ?), DATE_ADD(fecha, INTERVAL ${FALLBACK_OFFSET_MIN} MINUTE)),
          "%Y-%m-%d %H:%i:%s"
        ) AS fecha_local,
        DATE_FORMAT(fecha, "%Y-%m-%d %H:%i:%s") AS fecha_utc,
        ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
        grosor_lateral_mm AS grosor_mm,
        mm_por_px, px_por_mm, ancho_px_mean, ancho_px_std,
        xl_px, xr_px, rows_valid,
        edge_left_mm, bbox_x, bbox_y, bbox_w, bbox_h,
        roi_y0, roi_y1
      FROM medidas_cenital
      WHERE fecha BETWEEN ? AND ?
        AND ancho_mm IS NOT NULL
        AND grosor_lateral_mm IS NOT NULL
      ORDER BY ${col} ${dir}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const rows = await db.query(dataSql, [TARGET_TZ, startDate, endDate]);

    res.json({ data: rows, total });
  } catch (e) {
    console.log('Error en /tablasdetectadas/piezas:', e);
    res.status(500).json({ error: 'Error en la consulta' });
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
