// lib/socket.js
const { Server } = require('socket.io');
const db = require('./db');                    // <- ruta correcta
const logger = require('./logger');            // tu logger actual

// Ajuste horario simple a Europa/Madrid (puedes mejorar con tz real)
const adjustDateToSpainTimezone = (date) => {
  const spainOffset = 60; // GMT+1 sin DST
  const localOffset = date.getTimezoneOffset();
  const totalOffset = spainOffset - localOffset;
  date.setMinutes(date.getMinutes() + totalOffset);
  return date;
};

// Convierte ts (segundos con decimales) a DECIMAL para FROM_UNIXTIME(?,6)
const secOrNull = (v) => (typeof v === 'number' ? v : null);

async function upsertMedidaCenitalV2(m) {
  // Campos opcionales y saneo
  const schemaTag = m.schema || null;
  const deviceId  = m.device_id || null;
  const camId     = m.camara_id || 'cenital';

  const fechaJS   = m.fecha ? new Date(m.fecha) : new Date();
  const fecha     = adjustDateToSpainTimezone(fechaJS);

  const bbox = Array.isArray(m.bbox_lores) ? m.bbox_lores : [null, null, null, null];
  const [bx, by, bw, bh] = bbox;

  const sql = `
    INSERT INTO medidas_cenital
      (tabla_id, frame, camara_id, device_id, schema_tag, fecha,
       ts_hq, ts_lateral, ts_emit, payload_json,
       ancho_pixel_real, altura_pixel_real,
       ancho_px_mean, ancho_px_std, xl_px, xr_px, rows_valid,
       ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
       mm_por_px, px_por_mm, grosor_lateral_mm, edge_left_mm, base,
       bbox_x, bbox_y, bbox_w, bbox_h, roi_y0, roi_y1)
    VALUES
      (?, ?, ?, ?, ?, ?,
       FROM_UNIXTIME(?,6), FROM_UNIXTIME(?,6), FROM_UNIXTIME(?,6), CAST(? AS JSON),
       ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?,
       ?, ?, ?, ?, ?,
       ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      camara_id=VALUES(camara_id),
      device_id=VALUES(device_id),
      schema_tag=VALUES(schema_tag),
      fecha=VALUES(fecha),
      ts_hq=VALUES(ts_hq),
      ts_lateral=VALUES(ts_lateral),
      ts_emit=VALUES(ts_emit),
      payload_json=VALUES(payload_json),
      ancho_pixel_real=VALUES(ancho_pixel_real),
      altura_pixel_real=VALUES(altura_pixel_real),
      ancho_px_mean=VALUES(ancho_px_mean),
      ancho_px_std=VALUES(ancho_px_std),
      xl_px=VALUES(xl_px),
      xr_px=VALUES(xr_px),
      rows_valid=VALUES(rows_valid),
      ancho_mm=VALUES(ancho_mm),
      ancho_mm_base=VALUES(ancho_mm_base),
      delta_corr_mm=VALUES(delta_corr_mm),
      corregida=VALUES(corregida),
      mm_por_px=VALUES(mm_por_px),
      px_por_mm=VALUES(px_por_mm),
      grosor_lateral_mm=VALUES(grosor_lateral_mm),
      edge_left_mm=VALUES(edge_left_mm),
      base=VALUES(base),
      bbox_x=VALUES(bbox_x),
      bbox_y=VALUES(bbox_y),
      bbox_w=VALUES(bbox_w),
      bbox_h=VALUES(bbox_h),
      roi_y0=VALUES(roi_y0),
      roi_y1=VALUES(roi_y1)
  `;

  const params = [
    m.tabla_id || 0,
    m.frame || 0,
    camId,
    deviceId,
    schemaTag,
    fecha,

    secOrNull(m.ts_hq),
    secOrNull(m.ts_lateral),
    secOrNull(m.ts_emit),
    JSON.stringify(m),

    m.ancho_pixel_real ?? null,
    m.altura_pixel_real ?? null,

    m.ancho_px_mean ?? null,
    m.ancho_px_std ?? null,
    m.xl_px ?? null,
    m.xr_px ?? null,
    m.rows_valid ?? null,

    m.ancho_mm ?? null,
    m.ancho_mm_base ?? null,
    m.delta_corr_mm ?? null,
    m.corregida ? 1 : 0,

    m.mm_por_px ?? m.mm_px ?? null,
    m.px_por_mm ?? null,
    m.grosor_mm ?? m.grosor_lateral ?? null,  // del payload v2
    m.edge_left_mm ?? null,
    m.base ?? null,

    bx, by, bw, bh,
    m.roi_y0 ?? null,
    m.roi_y1 ?? null,
  ];

  await db.query(sql, params);
  logger.info(
    `Medida real insertada: tabla_id=${m.tabla_id}, ancho_mm=${m.ancho_mm}, grosor_mm=${m.grosor_mm ?? m.grosor_lateral}`
  );
}

module.exports = (server) => {
  const io = new Server(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    cors: { origin: ['http://localhost:3000', 'https://www.maderaexteriores.com'] },
  });

  io.on('connection', (socket) => {
    const ip = socket.handshake.address;
    console.log(`Raspberry Pi conectada: IP ${ip} a las ${new Date().toLocaleString()}`);

    socket.on('disconnect', () => console.log('Desconectado de la aplicación Flask en la Raspberry Pi'));

    // Ingesta de medidas (array)
    socket.on('medidas', async (arr) => {
      try {
        if (!Array.isArray(arr)) return;
        for (const m of arr) {
          // v2 con ambos mm reales (ver lado Pi: measurement/capture) 
          await upsertMedidaCenitalV2(m);
        }
      } catch (err) {
        console.error('Error upsert medidas_cenital:', err);
      }
    });

    socket.on('estadisticas', async (data) => {
      try {
        const adjustedDate = adjustDateToSpainTimezone(new Date());
        await db.query(
          `INSERT INTO estadisticas (fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            adjustedDate,
            data.cpu_percent,
            data.memory_percent,
            data.load_1m,
            data.cpu_temperature,
            ip,
          ]
        );
      } catch (e) {
        console.log('Error al insertar estadísticas:', e);
      }
    });
  });

  return io;
};
