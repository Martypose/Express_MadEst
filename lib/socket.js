// lib/socket.js
const { Server } = require('socket.io');
const db = require('./db');           // <-- ojo: './db', no './lib/db'
const os = require('os');

// ---- helpers de fecha ----
const tzAdjustToSpain = (d) => {
  // Si llega sin zona "YYYY-MM-DDTHH:mm:ss", tratamos como local y normalizamos.
  if (!(d instanceof Date)) d = new Date(d);
  // Mantén simple: si necesitas DST exacto, usa luxon en el futuro.
  return d;
};

function toDateOrNull(v) {
  if (v == null) return null;
  if (typeof v === 'number') return new Date(v * 1000); // epoch seconds -> Date
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function isV2(data) {
  return data && (data.schema === 'medidas_v2' || data.schema_tag === 'medidas_v2');
}

async function upsertMedidaCenitalV2(data) {
  const fecha = tzAdjustToSpain(data.fecha || new Date());
  const ts_hq = toDateOrNull(data.ts_hq);
  const ts_lateral = toDateOrNull(data.ts_lateral);
  const ts_emit = toDateOrNull(data.ts_emit);

  const bbox = Array.isArray(data.bbox_lores) ? data.bbox_lores : [null, null, null, null];
  const [bbox_x, bbox_y, bbox_w, bbox_h] = bbox;

  const sql = `
    INSERT INTO medidas_cenital
      (tabla_id, frame, camara_id, device_id, schema_tag, fecha,
       ts_hq, ts_lateral, ts_emit, payload_json,
       ancho_pixel_real, altura_pixel_real, ancho_px_mean, ancho_px_std,
       xl_px, xr_px, rows_valid,
       ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
       mm_por_px, px_por_mm, grosor_lateral_mm,
       edge_left_mm, base,
       bbox_x, bbox_y, bbox_w, bbox_h,
       roi_y0, roi_y1)
    VALUES (?,?,?,?,?,?,?,?,?,?,
            ?,?,?,?,
            ?,?,?, 
            ?,?,?,?, 
            ?,?,?, 
            ?,?,
            ?,?,?,?,
            ?,?)
    ON DUPLICATE KEY UPDATE
      fecha            = VALUES(fecha),
      ts_hq            = VALUES(ts_hq),
      ts_lateral       = VALUES(ts_lateral),
      ts_emit          = VALUES(ts_emit),
      payload_json     = VALUES(payload_json),
      ancho_pixel_real = VALUES(ancho_pixel_real),
      altura_pixel_real= VALUES(altura_pixel_real),
      ancho_px_mean    = VALUES(ancho_px_mean),
      ancho_px_std     = VALUES(ancho_px_std),
      xl_px            = VALUES(xl_px),
      xr_px            = VALUES(xr_px),
      rows_valid       = VALUES(rows_valid),
      ancho_mm         = VALUES(ancho_mm),
      ancho_mm_base    = VALUES(ancho_mm_base),
      delta_corr_mm    = VALUES(delta_corr_mm),
      corregida        = VALUES(corregida),
      mm_por_px        = VALUES(mm_por_px),
      px_por_mm        = VALUES(px_por_mm),
      grosor_lateral_mm= VALUES(grosor_lateral_mm),
      edge_left_mm     = VALUES(edge_left_mm),
      base             = VALUES(base),
      bbox_x           = VALUES(bbox_x),
      bbox_y           = VALUES(bbox_y),
      bbox_w           = VALUES(bbox_w),
      bbox_h           = VALUES(bbox_h),
      roi_y0           = VALUES(roi_y0),
      roi_y1           = VALUES(roi_y1)
  `;

  const params = [
    data.tabla_id || 0,
    data.frame || 0,
    data.camara_id || 'cenital',
    data.device_id || os.hostname(),
    data.schema || data.schema_tag || 'medidas_v2',
    fecha,
    ts_hq, ts_lateral, ts_emit,
    JSON.stringify(data),

    // px "legacy" + nuevos px
    data.ancho_pixel_real ?? null,
    data.altura_pixel_real ?? null,
    data.ancho_px_mean ?? data.ancho_pixel_real ?? null,
    data.ancho_px_std ?? null,
    data.xl_px ?? null,
    data.xr_px ?? null,
    data.rows_valid ?? null,

    // mm reales
    data.ancho_mm ?? null,
    data.ancho_mm_base ?? null,
    data.delta_corr_mm ?? null,
    data.corregida ? 1 : 0,

    // factores de escala
    data.mm_por_px ?? null,
    data.px_por_mm ?? null,

    // grosor real (de la lateral)
    data.grosor_lateral_mm ?? data.grosor_mm ?? null,

    // extras
    data.edge_left_mm ?? null,
    data.base ?? null,

    // bbox lo-res + ROI
    bbox_x, bbox_y, bbox_w, bbox_h,
    data.roi_y0 ?? null,
    data.roi_y1 ?? null,
  ];

  await db.query(sql, params);
}

// --- helpers IP/ID ---
function getClientIp(socket) {
  try {
    const h = socket.handshake.headers || {};
    const xff = (h['x-forwarded-for'] || '').split(',')[0].trim();
    return xff || socket.handshake.address || '';
  } catch {
    return socket.handshake?.address || '';
  }
}

function pickRaspberryId(data, socket) {
  const ip = getClientIp(socket);
  const id = String(
    data?.hostname ||
    data?.device_id ||
    data?.id_raspberry ||
    data?.camara_id ||       // "cenital" o "lateral"
    ''
  ).trim();
  return (id && id.slice(0, 100)) || ip;
}

module.exports = (server) => {
  const io = new Server(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    const ip = getClientIp(socket);
    console.log(`Raspberry Pi conectada: IP ${ip} a las ${new Date().toLocaleString()}`);

    socket.on('disconnect', () => {
      console.log('Desconectado de la aplicación Flask en la Raspberry Pi');
    });

    // ---- medidas desde la cenital (siempre mm reales) ----
    socket.on('medidas', async (dataArray) => {
      try {
        const arr = Array.isArray(dataArray) ? dataArray : [dataArray];
        for (const data of arr) {
          if (!data.ancho_mm || !(data.grosor_lateral_mm ?? data.grosor_mm)) {
            console.warn(`Medida inválida: falta mm (tabla_id=${data?.tabla_id})`);
            continue;
          }
          if (isV2(data)) {
            await upsertMedidaCenitalV2(data);
          } else {
            // Fallback legacy: mapea lo mínimo
            await upsertMedidaCenitalV2({
              ...data,
              schema: 'legacy',
              ancho_px_mean: data.ancho_pixel_real,
              xl_px: data.xl_px,
              xr_px: data.xr_px,
              rows_valid: data.rows,
              grosor_lateral_mm: data.grosor_mm,
            });
          }
          console.info(`Medida real insertada: tabla_id=${data.tabla_id}, ancho_mm=${data.ancho_mm}, grosor_mm=${data.grosor_lateral_mm ?? data.grosor_mm}`);
        }
      } catch (e) {
        console.error('Error procesando medidas:', e);
      }
    });

    // ---- estadísticas de la Pi (ajustado: guardar hostname/cámara en id_raspberry) ----
    socket.on('estadisticas', async (data) => {
      try {
        const adjustedDate = new Date();
        const raspId = pickRaspberryId(data, socket);
        await db.query(
          `INSERT INTO estadisticas
             (fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            adjustedDate,
            data.cpu_percent,
            data.memory_percent,
            data.load_1m,
            data.cpu_temperature,
            raspId,
          ]
        );
      } catch (e) {
        console.error('Error al insertar estadísticas:', e);
      }
    });

    socket.on('message', (data) => {
      console.log('Mensaje recibido desde la aplicación Flask:', data);
    });
  });

  return io;
};
