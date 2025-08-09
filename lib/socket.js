// socket.js
const { Server } = require("socket.io");
const dbConn = require("./lib/db");   // ← ojo: ruta lib/db.js

// ---- helpers de fecha (si quieres seguir guardando eventos auxiliares en local TZ) ----
const adjustDateToSpainTimezone = (date) => {
  const spainOffset = 60; // GMT+1 (simple; si quieres DST, hay que mejorarlo)
  const localOffset = date.getTimezoneOffset();
  const totalOffset = spainOffset - localOffset;
  date.setMinutes(date.getMinutes() + totalOffset);
  return date;
};

// -------------------- INSERT LEGACY (lo dejo por compat) --------------------
async function insertarMedidaLegacy(data, medidaIdeal) {
  const adjustedDate = adjustDateToSpainTimezone(new Date());
  try {
    await dbConn.query(
      `INSERT INTO tabla_detectada
         (fecha, ancho_pixel_real, altura_pixel_real, camara_id, id_medida_ideal)
       VALUES (?, ?, ?, ?, ?)`,
      [
        adjustedDate,
        data.ancho_pixel_real ?? 0,
        data.altura_pixel_real ?? 0,
        data.camara_id || "cenital",
        medidaIdeal?.id || null,
      ]
    );
    console.log("Inserción legacy en tabla_detectada OK");
  } catch (err) {
    console.log("Error al insertar (legacy):", err);
  }
}

// -------------------- UPSERT medidas_cenital (v2 completo) --------------------
async function upsertMedidaCenital(data) {
  const sql = `
    INSERT INTO medidas_cenital
      (tabla_id, frame, camara_id, device_id, schema_tag,
       fecha, ts_hq, ts_lateral, ts_emit,
       payload_json,

       -- legacy rellenado desde v2
       ancho_pixel_real, altura_pixel_real,

       -- v2 px metrics
       ancho_px_mean, ancho_px_std, xl_px, xr_px, rows_valid,

       -- v2 mm metrics
       ancho_mm, ancho_mm_base, corregida, delta_corr_mm,
       mm_por_px, px_por_mm, grosor_lateral_mm, edge_left_mm,

       -- v2 geometría/ROI
       bbox_x, bbox_y, bbox_w, bbox_h, roi_y0, roi_y1
      )
    VALUES
      (?, ?, ?, ?, ?,
       FROM_UNIXTIME(?), FROM_UNIXTIME(?), FROM_UNIXTIME(?), FROM_UNIXTIME(?),
       CAST(? AS JSON),

       ?, ?,

       ?, ?, ?, ?, ?,

       ?, ?, ?, ?,
       ?, ?, ?, ?,

       ?, ?, ?, ?, ?, ?
      )
    ON DUPLICATE KEY UPDATE
      device_id           = VALUES(device_id),
      schema_tag          = VALUES(schema_tag),
      fecha               = VALUES(fecha),
      ts_hq               = VALUES(ts_hq),
      ts_lateral          = VALUES(ts_lateral),
      ts_emit             = VALUES(ts_emit),
      payload_json        = VALUES(payload_json),

      ancho_pixel_real    = VALUES(ancho_pixel_real),
      altura_pixel_real   = VALUES(altura_pixel_real),

      ancho_px_mean       = VALUES(ancho_px_mean),
      ancho_px_std        = VALUES(ancho_px_std),
      xl_px               = VALUES(xl_px),
      xr_px               = VALUES(xr_px),
      rows_valid          = VALUES(rows_valid),

      ancho_mm            = VALUES(ancho_mm),
      ancho_mm_base       = VALUES(ancho_mm_base),
      corregida           = VALUES(corregida),
      delta_corr_mm       = VALUES(delta_corr_mm),

      mm_por_px           = VALUES(mm_por_px),
      px_por_mm           = VALUES(px_por_mm),
      grosor_lateral_mm   = VALUES(grosor_lateral_mm),
      edge_left_mm        = VALUES(edge_left_mm),

      bbox_x              = VALUES(bbox_x),
      bbox_y              = VALUES(bbox_y),
      bbox_w              = VALUES(bbox_w),
      bbox_h              = VALUES(bbox_h),
      roi_y0              = VALUES(roi_y0),
      roi_y1              = VALUES(roi_y1)
  `;

  // --------- Desempaquetado con compat v2 ---------
  const device_id   = data.device_id || null;
  const schema_tag  = data.schema || data.schema_tag || "medidas_v2";

  // Timestamps (epoch seg de la Pi); usamos ts_emit como “fecha” principal
  const ts_emit     = data.ts_emit    ?? (Date.now()/1000);
  const ts_hq       = data.ts_hq      ?? ts_emit;
  const ts_lateral  = data.ts_lateral ?? ts_emit;

  // Legacy (rellenamos ancho_pixel_real con la media en px)
  const ancho_px_mean = data.ancho_px_mean ?? data.ancho_pixel_real ?? null;
  const altura_px     = data.altura_pixel_real ?? 0;

  // v2 pix
  const ancho_px_std = data.ancho_px_std ?? null;
  const xl_px        = data.xl_px ?? null;
  const xr_px        = data.xr_px ?? null;
  const rows_valid   = data.rows_valid ?? null;

  // v2 mm
  const ancho_mm      = data.ancho_mm ?? null;
  const ancho_mm_base = data.ancho_mm_base ?? null;
  const corregida     = data.corregida ? 1 : 0;
  const delta_corr_mm = data.delta_corr_mm ?? null;
  const mm_por_px     = data.mm_por_px ?? data.mm_px ?? null;
  const px_por_mm     = data.px_por_mm ?? (mm_por_px ? (1/mm_por_px) : null);
  const grosor_mm     = data.grosor_lateral ?? data.grosor_mm ?? null; // compat nombres
  const edge_left_mm  = data.edge_left_mm ?? null;

  // v2 ROI/bbox
  const bbox = Array.isArray(data.bbox_lores) ? data.bbox_lores : [null,null,null,null];
  const [bbox_x, bbox_y, bbox_w, bbox_h] = bbox;
  const roi_y0 = data.roi_y0 ?? null;
  const roi_y1 = data.roi_y1 ?? null;

  const params = [
    data.tabla_id || 0,
    data.frame    || 0,
    data.camara_id || "cenital",
    device_id,
    schema_tag,

    ts_emit, ts_hq, ts_lateral, ts_emit,
    JSON.stringify(data),

    // legacy
    ancho_px_mean, altura_px,

    // px
    ancho_px_mean, ancho_px_std, xl_px, xr_px, rows_valid,

    // mm
    ancho_mm, ancho_mm_base, corregida, delta_corr_mm,
    mm_por_px, px_por_mm, grosor_mm, edge_left_mm,

    // ROI/bbox
    bbox_x, bbox_y, bbox_w, bbox_h, roi_y0, roi_y1
  ];

  await dbConn.query(sql, params);
}

// -------------------- consulta medida ideal (se mantiene) -------------
async function consultarMedidaIdeal(data) {
  const rows = await dbConn.query(
    `SELECT * FROM medidas_tablas
     ORDER BY ABS(ancho_ideal - ?) + ABS(altura_ideal - ?) LIMIT 1`,
    [data.ancho_pixel_real ?? 0, data.altura_pixel_real ?? 0]
  );
  return rows?.[0] ?? null;
}

// ============================ bootstrap IO ============================
module.exports = (server) => {
  const io = new Server(server, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    const clientIp = socket.handshake.address;
    const connectionTime = new Date().toLocaleString();
    console.log(`Raspberry Pi conectada: IP ${clientIp} a las ${connectionTime}`);

    socket.on("disconnect", () => {
      console.log("Desconectado de la aplicación Flask en la Raspberry Pi");
    });

    // ---- medidas desde la cenital (payload v2) ----
    socket.on("medidas", async (dataArray) => {
      console.log("Datos de medidas recibidos:", dataArray);
      const logger = require("./logger");

      for (const data of dataArray) {
        // validación estricta: exigimos ambos mm reales
        const hasWidth  = Number.isFinite(Number(data.ancho_mm));
        const hasThick  = Number.isFinite(Number(data.grosor_lateral ?? data.grosor_mm));
        if (!hasWidth || !hasThick) {
          logger.warn(`Medida inválida (falta mm) para tabla_id ${data.tabla_id}`);
          continue;
        }

        try {
          await upsertMedidaCenital(data);
          logger.info(`Medida real insertada: tabla_id=${data.tabla_id}, ancho_mm=${data.ancho_mm}, grosor_mm=${data.grosor_lateral ?? data.grosor_mm}`);
        } catch (err) {
          console.log("Error upsert medidas_cenital:", err);
        }
      }
    });

    // ---- estadísticas (igual que tenías) ----
    socket.on("estadisticas", async (data) => {
      console.log("Estadísticas recibidas:", data);
      const adjustedDate = adjustDateToSpainTimezone(new Date());
      try {
        await dbConn.query(
          `INSERT INTO estadisticas
             (fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            adjustedDate,
            data.cpu_percent,
            data.memory_percent,
            data.load_1m,
            data.cpu_temperature,
            socket.handshake.address,
          ]
        );
        console.log("Inserción exitosa de estadísticas");
      } catch (err) {
        console.log("Error al insertar estadísticas:", err);
      }
    });

    socket.on("message", (data) => {
      console.log("Mensaje recibido desde la aplicación Flask:", data);
    });
  });

  return io;
};
