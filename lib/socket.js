const { Server } = require("socket.io");
const dbConn = require("./db.js");

const adjustDateToSpainTimezone = (date) => {
  const spainOffset = 60; // en minutos (GMT+1)
  const localOffset = date.getTimezoneOffset();
  const totalOffset = spainOffset - localOffset;
  date.setMinutes(date.getMinutes() + totalOffset);
  return date;
};

function insertarMedida(data, medidaIdeal, socket) {
  const adjustedDate = adjustDateToSpainTimezone(new Date());
  dbConn.query(
    `INSERT INTO tabla_detectada (fecha, ancho_pixel_real, altura_pixel_real, camara_id, id_medida_ideal) VALUES (?, ?, ?, ?, ?)`,
    [
      adjustedDate,
      data.ancho_pixel_real,
      data.altura_pixel_real,
      data.camara_id,
      medidaIdeal.id,
    ],
    function (err, result) {
      if (err) {
        console.log("Error al insertar:", err);
      } else {
        console.log("Inserción exitosa");
      }
    }
  );
}

function consultarMedidaIdeal(data, socket) {
  dbConn.query(
    `SELECT * FROM medidas_tablas 
     ORDER BY ABS(ancho_ideal - ?) + ABS(altura_ideal - ?) LIMIT 1`,
    [data.ancho_pixel_real, data.altura_pixel_real],
    function (err, rows) {
      if (err) {
        console.log("Error al consultar las medidas ideales:", err);
        return;
      }
      const medidaIdeal = rows[0];
      insertarMedida(data, medidaIdeal, socket);
    }
  );
}

module.exports = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    const clientIp = socket.handshake.address;
    const connectionTime = new Date().toLocaleString();
    console.log(
      `Raspberry Pi conectada: IP ${clientIp} a las ${connectionTime}`
    );

    socket.on("disconnect", () => {
      console.log("Desconectado de la aplicación Flask en la Raspberry Pi");
    });

    socket.on("medidas", (dataArray) => {
      console.log(
        "Datos de medidas recibidos desde la aplicación Flask:",
        dataArray
      );
      dataArray.forEach((data) => {
        consultarMedidaIdeal(data, socket);
      });
    });

    socket.on("estadisticas", (data) => {
      console.log(
        "Estadísticas de rendimiento recibidas desde la aplicación Flask:",
        data
      );
      const adjustedDate = adjustDateToSpainTimezone(new Date());

      // Insertar los datos en la tabla de estadísticas
      dbConn.query(
        `INSERT INTO estadisticas (fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          adjustedDate,
          data.cpu_percent,
          data.memory_percent,
          data.load_1m,
          data.cpu_temperature,
          socket.handshake.address,
        ],
        function (err, result) {
          if (err) {
            console.log("Error al insertar estadísticas:", err);
          } else {
            console.log("Inserción exitosa de estadísticas");
          }
        }
      );
    });

    socket.on("message", (data) => {
      console.log("Mensaje recibido desde la aplicación Flask:", data);
    });
  });

  return io;
};
