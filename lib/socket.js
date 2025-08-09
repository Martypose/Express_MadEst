const { Server } = require("socket.io");
const dbConn = require("./db.js");

// ---- helpers de fecha (igual que tenías) ----
const adjustDateToSpainTimezone = (date) => {
  const spainOffset = 60; // GMT+1 (ojo: simple; si quieres DST, habría que mejorarlo)
  const localOffset = date.getTimezoneOffset();
  const totalOffset = spainOffset - localOffset;
  date.setMinutes(date.getMinutes() + totalOffset);
  return date;
};

// -------------------- INSERT LEGACY (se mantiene) --------------------
function insertarMedidaLegacy(data, medidaIdeal) {
  const adjustedDate = adjustDateToSpainTimezone(new Date());
  dbConn.query(
    `INSERT INTO tabla_detectada
       (fecha, ancho_pixel_real, altura_pixel_real, camara_id, id_medida_ideal)
     VALUES (?, ?, ?, ?, ?)`,
    [
      adjustedDate,
      data.ancho_pixel_real ?? 0,
      data.altura_pixel_real ?? 0,
      data.camara_id || "cenital",
      medidaIdeal?.id || null,
    ],
    function (err) {
      if (err) {
        console.log("Error al insertar (legacy):", err);
      } else {
        console.log("Inserción legacy en tabla_detectada OK");
      }
    }
  );
}

// -------------------- UPSERT nueva tabla --------------------
function upsertMedidaCenital(data) {
  const adjustedDate = adjustDateToSpainTimezone(new Date());
  const sql = `
    INSERT INTO medidas_cenital
      (tabla_id, frame, camara_id, fecha,
       ancho_pixel_real, altura_pixel_real, ancho_mm, corregida,
       mm_por_px, grosor_lateral_mm, edge_left_mm, base)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      ancho_pixel_real = VALUES(ancho_pixel_real),
      altura_pixel_real= VALUES(altura_pixel_real),
      ancho_mm         = VALUES(ancho_mm),
      corregida        = VALUES(corregida),
      mm_por_px        = VALUES(mm_por_px),
      grosor_lateral_mm= VALUES(grosor_lateral_mm),
      edge_left_mm     = VALUES(edge_left_mm),
      base             = VALUES(base),
      fecha            = VALUES(fecha);
  `;

  const params = [
    data.tabla_id || 0,
    data.frame || 0,
    data.camara_id || "cenital",
    adjustedDate,
    data.ancho_pixel_real ?? null,
    data.altura_pixel_real ?? null,
    data.ancho_mm ?? null,
    data.corregida ? 1 : 0,
    // admitimos distintos nombres que pueda mandar la cenital
    data.mm_px ?? data.mm_por_px ?? null,
    data.grosor_lateral ?? data.grosor_mm ?? null,
    data.edge_left_mm ?? null,
    data.base ?? null,
  ];

  dbConn.query(sql, params, function (err) {
    if (err) {
      console.log("Error upsert medidas_cenital:", err);
    } else {
      console.log(
        `Upsert medidas_cenital OK → tabla=${params[0]} frame=${params[1]} mm=${data.ancho_mm} corregida=${data.corregida ? 1 : 0}`
      );
    }
  });
}

// -------------------- consulta medida ideal (se mantiene) -------------
function consultarMedidaIdeal(data, cb) {
  dbConn.query(
    `SELECT * FROM medidas_tablas
     ORDER BY ABS(ancho_ideal - ?) + ABS(altura_ideal - ?) LIMIT 1`,
    [data.ancho_pixel_real ?? 0, data.altura_pixel_real ?? 0],
    function (err, rows) {
      if (err) {
        console.log("Error al consultar las medidas ideales:", err);
        return cb?.(err);
      }
      const medidaIdeal = rows && rows[0] ? rows[0] : null;
      cb?.(null, medidaIdeal);
    }
  );
}

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

    // ---- medidas desde la cenital ----
    socket.on("medidas", (dataArray) => {
  console.log("Datos de medidas recibidos desde la aplicación Flask:", dataArray);
  const logger = require('./logger');  // Importa si no está

  dataArray.forEach((data) => {
    if (!data.ancho_mm || !data.grosor_mm) {  // Valida mm reales
      logger.warn(`Medida inválida (falta mm) para tabla_id ${data.tabla_id}`);
      return;
    }
    upsertMedidaCenital(data);  // Solo upsert en tabla real
    logger.info(`Medida real insertada: tabla_id=${data.tabla_id}, ancho_mm=${data.ancho_mm}, grosor_mm=${data.grosor_mm}`);
  });
});

    // ---- estadísticas (igual que tenías) ----
    socket.on("estadisticas", (data) => {
      console.log("Estadísticas recibidas:", data);
      const adjustedDate = adjustDateToSpainTimezone(new Date());
      dbConn.query(
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
        ],
        function (err) {
          if (err) console.log("Error al insertar estadísticas:", err);
          else console.log("Inserción exitosa de estadísticas");
        }
      );
    });

    socket.on("message", (data) => {
      console.log("Mensaje recibido desde la aplicación Flask:", data);
    });
  });

  return io;
};
