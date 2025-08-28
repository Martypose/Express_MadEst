// routes/tablasdetectadas.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// ===== Longitud global por pieza (mm) para volumen real en m³ =====
// Se puede ajustar en tiempo de ejecución antes de cargar este módulo:
//   global.LONGITUD_PIEZA_MM = 2500;
if (typeof global.LONGITUD_PIEZA_MM !== 'number') {
  global.LONGITUD_PIEZA_MM = 2500; // 2,5 m en mm
}
const LONGITUD_PIEZA_MM = global.LONGITUD_PIEZA_MM;

// --- RUTAS LEGACY (apuntan a la tabla antigua `tabla_detectada`) ---
// Se mantienen por compatibilidad, pero las nuevas vistas deben usar las rutas de `medidas_cenital`.

router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM tabla_detectada');
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD (legacy):', e);
    res.status(500).send('Error en la consulta a la BD (legacy)');
  }
});

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
    console.log('Error en la consulta a la BD (legacy):', e);
    res.status(500).send('Error en la consulta a la BD (legacy)');
  }
});


// --- RUTAS MODERNAS (apuntan a la tabla `medidas_cenital`) ---

router.get("/cubico-por-fecha", async function (req, res) {
  const { startDate, endDate, agrupamiento = "dia", descabezadaFilter = "all" } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).send("startDate y endDate son obligatorios");
  }

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

  // WHERE dinámico
  const whereClauses = [
    `fecha BETWEEN ? AND ?`,
    `ancho_mm IS NOT NULL`,
    `grosor_lateral_mm IS NOT NULL`
  ];
  const params = [startDate, endDate];

  if (descabezadaFilter === 'ok') {
    whereClauses.push(`descabezada = 0`);
  } else if (descabezadaFilter === 'desc') {
    whereClauses.push(`descabezada = 1`);
  }

  // FIX: volumen real en m³ = (ancho_mm * grosor_lateral_mm * LONGITUD_PIEZA_MM) / 1e9
  //     (antes: /1e6 ⇒ era un área m² etiquetada erróneamente como m³)
  const sql = `
    SELECT
      x.periodo                AS fecha,
      x.grosor                 AS grosor_lateral_mm,
      ROUND(SUM(x.volumen), 6) AS volumen_cubico_m3
    FROM (
      SELECT
        ${periodoExpr}                           AS periodo,
        ROUND(grosor_lateral_mm, 0)             AS grosor,
        (ancho_mm * grosor_lateral_mm * ?) / 1e9 AS volumen
      FROM medidas_cenital
      WHERE ${whereClauses.join(' AND ')}
    ) x
    GROUP BY x.periodo, x.grosor
    ORDER BY x.periodo ASC;
  `;

  try {
    // Nota: el primer placeholder (?) es LONGITUD_PIEZA_MM; luego van los del WHERE
    const rows = await db.query(sql, [LONGITUD_PIEZA_MM, ...params]);
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
      SELECT id, tabla_id, tabla_uid, camara_id, device_id,
             ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
             grosor_lateral_mm, mm_por_px, px_por_mm,
             ancho_px_mean, ancho_px_std, xl_px, xr_px, rows_valid,
             edge_left_mm, bbox_x, bbox_y, bbox_w, bbox_h, roi_y0, roi_y1,
             descabezada, desc_causa, desc_tip_score, desc_tip_ok,
             desc_shape_taper_ratio, desc_shape_taper_drop,
             -- nuevas métricas de borde:
             desc_edge_irregular, edge_rmse_l_px, edge_rmse_r_px,
             edge_jitter_l_px, edge_jitter_r_px, widths_cv, rows_total, rows_kept,
             desc_edge_reason
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

// ...

router.get('/piezas', async (req, res) => {
  try {
    let { startDate, endDate, limit='200', offset='0', orderBy='fecha', orderDir='desc', descabezadaFilter = 'all' } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate y endDate son obligatorios" });
    }

    const ORDER_COLS = { id:'id', fecha:'fecha', ancho_mm:'ancho_mm', grosor_mm:'grosor_lateral_mm', tabla_uid: 'tabla_uid' };
    const col = ORDER_COLS[String(orderBy||'').toLowerCase()] || 'fecha';
    const dir = String(orderDir||'').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    limit  = Math.min(parseInt(limit,10)||200, 2000);
    offset = Math.max(parseInt(offset,10)||0, 0);

    const TARGET_TZ = process.env.TARGET_TZ || 'Europe/Madrid';
    const FALLBACK_OFFSET_MIN = -new Date().getTimezoneOffset();

    const whereClauses = [
      `fecha BETWEEN ? AND ?`,
      `ancho_mm IS NOT NULL`,
      `grosor_lateral_mm IS NOT NULL`
    ];
    const params = [startDate, endDate];

    if (descabezadaFilter === 'ok') {
      whereClauses.push(`descabezada = 0`);
    } else if (descabezadaFilter === 'desc') {
      whereClauses.push(`descabezada = 1`);
    }

    const whereSql = whereClauses.join(' AND ');

    const countSql = `SELECT COUNT(*) AS total FROM medidas_cenital WHERE ${whereSql}`;
    const totalRows = await db.query(countSql, params);
    const total = totalRows[0]?.total ?? 0;

    const dataSql = `
      SELECT
        id, tabla_id, tabla_uid, camara_id, device_id,
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
        roi_y0, roi_y1,
        descabezada, desc_causa, desc_tip_score, desc_tip_ok, desc_tip_thr,
        desc_tip_roi_y0, desc_tip_roi_y1, desc_shape_taper_ratio,
        desc_shape_taper_drop, desc_shape_area_ratio, desc_shape_slope_norm,
        desc_shape_centroid_pct,
        -- nuevas métricas de borde:
        desc_edge_irregular, edge_rmse_l_px, edge_rmse_r_px,
        edge_jitter_l_px, edge_jitter_r_px, widths_cv, rows_total, rows_kept,
        desc_edge_reason
      FROM medidas_cenital
      WHERE ${whereSql}
      ORDER BY ${col} ${dir}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const dataParams = [TARGET_TZ, ...params];
    const rows = await db.query(dataSql, dataParams);

    res.json({ data: rows, total });
  } catch (e) {
    console.log('Error en /tablasdetectadas/piezas:', e);
    res.status(500).json({ error: 'Error en la consulta' });
  }
});


router.get('/resumen', async (req, res) => {
  try {
    const { startDate, endDate, descabezadaFilter = "all" } = req.query;

    const whereClauses = [
      `fecha BETWEEN ? AND ?`,
      `ancho_mm IS NOT NULL`,
      `grosor_lateral_mm IS NOT NULL`
    ];
    const params = [startDate, endDate];

    if (descabezadaFilter === 'ok') {
      whereClauses.push(`descabezada = 0`);
    } else if (descabezadaFilter === 'desc') {
      whereClauses.push(`descabezada = 1`);
    }

    const rows = await db.query(
      `
      SELECT
        DATE(fecha) AS fecha,
        COUNT(*) AS piezas,
        AVG(ancho_mm) AS ancho_mm_medio,
        AVG(grosor_lateral_mm) AS grosor_mm_medio
      FROM medidas_cenital
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC
      `,
      params
    );
    res.json(rows);
  } catch (e) {
    console.log('Error en la consulta a la BD:', e);
    res.status(500).send('Error en la consulta a la BD');
  }
});

module.exports = router;
