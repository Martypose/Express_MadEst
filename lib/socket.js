'use strict';

const { Server } = require('socket.io');
const db        = require('./db');
const os        = require('os');

// ───────────────────────── helpers de fecha ─────────────────────────
const tzAdjustToSpain = (d) => {
  if (!(d instanceof Date)) d = new Date(d);
  return d;
};

function toDateOrNull(v) {
  if (v == null) return null;
  if (typeof v === 'number') return new Date(v * 1000);            // epoch-seconds
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function isV2(data) {
  return data && (data.schema === 'medidas_v2' || data.schema_tag === 'medidas_v2');
}

// ───────────────────────── helpers identidad/IP ─────────────────────────
function hdr(socket, name) {
  const h = (socket.handshake && socket.handshake.headers) || socket.request?.headers || {};
  return h[name] || h[name?.toLowerCase()] || '';
}

function normalizeIp(ip) {
  if (!ip) return '';
  return String(ip).replace(/^::ffff:/, '').trim();               // quita IPv6-mapped IPv4
}

function getClientIp(socket) {
  const xff = (hdr(socket, 'x-forwarded-for') || '').split(',')[0].trim();
  const xri = (hdr(socket, 'x-real-ip') || '').trim();
  const raw = xff || xri || socket.handshake?.address || socket.request?.connection?.remoteAddress || '';
  return normalizeIp(raw);
}

function pickRaspberryId(data, socket) {
  const candidates = [
    data?.hostname,
    data?.device_id,
    data?.id_raspberry,
    data?.camara_id,                       // "cenital" / "lateral"
    hdr(socket, 'x-device-id'),
    hdr(socket, 'x-rpi-id'),
    hdr(socket, 'x-hostname'),
  ].filter(v => typeof v === 'string' && v.trim());
  return (candidates[0] || getClientIp(socket)).slice(0, 100);
}

// ───────────────────────── derivar causa descabezado ─────────────────────────
function deriveDescCausa(d) {
  const final  = !!d?.desc_final_descabezada;
  const tipOk  = !!d?.desc_tip_ok;
  const shape  = !!d?.desc_shape_arrow;
  if (!final)            return 'none';
  if (!tipOk && shape)   return 'tip+shape';
  if (!tipOk)            return 'tip';
  if (shape)             return 'shape';
  return 'none';
}

// ───────────────────────── upsert medidas cenital v2 ─────────────────────────
async function upsertMedidaCenitalV2(data) {
  const fecha      = tzAdjustToSpain(data.fecha || new Date());
  const ts_hq      = toDateOrNull(data.ts_hq);
  const ts_lateral = toDateOrNull(data.ts_lateral);
  const ts_emit    = toDateOrNull(data.ts_emit);

  const bbox = Array.isArray(data.bbox_lores) ? data.bbox_lores : [null, null, null, null];
  const [bbox_x, bbox_y, bbox_w, bbox_h] = bbox;

  const tabla_uid  = data.tabla_uid ?? null;
  const desc_final = !!data.desc_final_descabezada;
  const desc_causa = data.desc_causa || deriveDescCausa(data);

  const sql = `
    INSERT INTO medidas_cenital
      (tabla_id, camara_id, device_id, schema_tag, fecha,
       ts_hq, ts_lateral, ts_emit, payload_json,
       ancho_pixel_real, altura_pixel_real, ancho_px_mean, ancho_px_std,
       xl_px, xr_px, rows_valid,
       ancho_mm, ancho_mm_base, delta_corr_mm, corregida,
       mm_por_px, px_por_mm, grosor_lateral_mm,
       edge_left_mm, base,
       bbox_x, bbox_y, bbox_w, bbox_h,
       roi_y0, roi_y1,
       tabla_uid, descabezada, desc_causa,
       desc_tip_score, desc_tip_ok, desc_tip_thr, desc_tip_roi_y0, desc_tip_roi_y1,
       desc_shape_taper_ratio, desc_shape_taper_drop, desc_shape_area_ratio, desc_shape_slope_norm, desc_shape_centroid_pct)
    VALUES (?,?,?,?,?,?,?,?,?,
            ?,?,?,?,
            ?,?,?, 
            ?,?,?,?, 
            ?,?,?, 
            ?,?,
            ?,?,?,?, 
            ?,?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      fecha             = VALUES(fecha),
      ts_hq             = VALUES(ts_hq),
      ts_lateral        = VALUES(ts_lateral),
      ts_emit           = VALUES(ts_emit),
      payload_json      = VALUES(payload_json),
      ancho_pixel_real  = VALUES(ancho_pixel_real),
      altura_pixel_real = VALUES(altura_pixel_real),
      ancho_px_mean     = VALUES(ancho_px_mean),
      ancho_px_std      = VALUES(ancho_px_std),
      xl_px             = VALUES(xl_px),
      xr_px             = VALUES(xr_px),
      rows_valid        = VALUES(rows_valid),
      ancho_mm          = VALUES(ancho_mm),
      ancho_mm_base     = VALUES(ancho_mm_base),
      delta_corr_mm     = VALUES(delta_corr_mm),
      corregida         = VALUES(corregida),
      mm_por_px         = VALUES(mm_por_px),
      px_por_mm         = VALUES(px_por_mm),
      grosor_lateral_mm = VALUES(grosor_lateral_mm),
      edge_left_mm      = VALUES(edge_left_mm),
      base              = VALUES(base),
      bbox_x            = VALUES(bbox_x),
      bbox_y            = VALUES(bbox_y),
      bbox_w            = VALUES(bbox_w),
      bbox_h            = VALUES(bbox_h),
      roi_y0            = VALUES(roi_y0),
      roi_y1            = VALUES(roi_y1),
      tabla_uid               = VALUES(tabla_uid),
      descabezada             = VALUES(descabezada),
      desc_causa              = VALUES(desc_causa),
      desc_tip_score          = VALUES(desc_tip_score),
      desc_tip_ok             = VALUES(desc_tip_ok),
      desc_tip_thr            = VALUES(desc_tip_thr),
      desc_tip_roi_y0         = VALUES(desc_tip_roi_y0),
      desc_tip_roi_y1         = VALUES(desc_tip_roi_y1),
      desc_shape_taper_ratio  = VALUES(desc_shape_taper_ratio),
      desc_shape_taper_drop   = VALUES(desc_shape_taper_drop),
      desc_shape_area_ratio   = VALUES(desc_shape_area_ratio),
      desc_shape_slope_norm   = VALUES(desc_shape_slope_norm),
      desc_shape_centroid_pct = VALUES(desc_shape_centroid_pct)
  `;

  const params = [
    // ids y metadatos principales
    data.tabla_id || 0,
    data.camara_id || 'cenital',
    data.device_id || os.hostname(),
    data.schema || data.schema_tag || 'medidas_v2',
    fecha,

    // timestamps
    ts_hq, ts_lateral, ts_emit,
    JSON.stringify(data),

    // píxeles y estadísticos
    data.ancho_pixel_real ?? null,
    data.altura_pixel_real ?? null,
    data.ancho_px_mean ?? data.ancho_pixel_real ?? null,
    data.ancho_px_std ?? null,
    data.xl_px ?? null,
    data.xr_px ?? null,
    data.rows_valid ?? null,

    // milímetros reales
    data.ancho_mm ?? null,
    data.ancho_mm_base ?? null,
    data.delta_corr_mm ?? null,
    data.corregida ? 1 : 0,

    // escala
    data.mm_por_px ?? null,
    data.px_por_mm ?? null,

    // grosor real (por cámara lateral) o compat
    data.grosor_lateral_mm ?? data.grosor_mm ?? null,

    // extras
    data.edge_left_mm ?? null,
    data.base ?? null,

    // bbox lo-res y ROI
    bbox_x, bbox_y, bbox_w, bbox_h,
    data.roi_y0 ?? null,
    data.roi_y1 ?? null,

    // UID y estado descabezado
    tabla_uid,
    desc_final ? 1 : 0,
    desc_causa,

    // métricas TIP
    data.desc_tip_score ?? null,
    (data.desc_tip_ok ? 1 : 0),
    data.desc_tip_thr ?? null,
    data.desc_tip_roi_y0 ?? null,
    data.desc_tip_roi_y1 ?? null,

    // métricas FORMA
    data.desc_shape_taper_ratio  ?? null,
    data.desc_shape_taper_drop   ?? null,
    data.desc_shape_area_ratio   ?? null,
    data.desc_shape_slope_norm   ?? null,
    data.desc_shape_centroid_pct ?? null,
  ];

  await db.query(sql, params);
}

// ───────────────────────── wiring namespace ─────────────────────────
function wireNamespace(nsp, nsName = '/') {
  nsp.on('connection', (socket) => {
    const ip = getClientIp(socket);
    console.log(`[${nsName}] Raspberry Pi conectada · IP ${ip}`);

    // ── MEDIDAS ── (con ACK)
    socket.on('medidas', async (dataArray, cb) => {
      const ack = typeof cb === 'function' ? cb : () => {};

      try {
        const arr = Array.isArray(dataArray) ? dataArray : [dataArray];
        let processed = 0;

        for (const data of arr) {
          if (!data.ancho_mm || !(data.grosor_lateral_mm ?? data.grosor_mm)) {
            console.warn(`Medida inválida: falta mm (tabla_id=${data?.tabla_id})`);
            continue;
          }

          if (isV2(data)) {
            await upsertMedidaCenitalV2(data);
          } else {
            // Fallback legacy
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
          processed += 1;
          console.info(`Medida insertada · tabla_id=${data.tabla_id} ancho_mm=${data.ancho_mm} grosor_mm=${data.grosor_lateral_mm ?? data.grosor_mm}`);
        }

        ack({ ok: true, processed });
      } catch (e) {
        console.error('Error procesando medidas:', e);
        ack({ ok: false, error: 'db_upsert_error' });
      }
    });

    // ── ESTADÍSTICAS ──
    socket.on('estadisticas', async (data = {}) => {
      try {
        const raspId = pickRaspberryId(data, socket);
        await db.query(
          `INSERT INTO estadisticas
             (fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry)
           VALUES (NOW(), ?, ?, ?, ?, ?)`,
          [
            data.cpu_percent      ?? null,
            data.memory_percent   ?? null,
            data.load_1m          ?? null,
            data.cpu_temperature  ?? null,
            raspId,
          ],
        );
        console.info(`[${nsName}] Estadística insertada · id_raspberry=${raspId}`);
      } catch (e) {
        console.error('Error al insertar estadísticas:', e);
      }
    });

    // ── MENSAJES ──
    socket.on('message', (data) => {
      console.log(`[${nsName}] Mensaje Flask:`, data);
    });

    // ── housekeeping ──
    socket.on('disconnect', (reason) => console.log(`[${nsName}] Desconectado (${reason})`));
    socket.conn.on('transport', (t) => console.log(`[${nsName}] transport=${t.name}`));
  });
}

// ───────────────────────── servidor principal ─────────────────────────
module.exports = (server) => {
  const io = new Server(server, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
    connectTimeout: 45000,
    allowEIO3: true,
    cors: {
      origin: ['https://www.maderaexteriores.com', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // default namespace y compat `/pi`
  wireNamespace(io, '/');
  wireNamespace(io.of('/pi'), '/pi');

  return io;
};
