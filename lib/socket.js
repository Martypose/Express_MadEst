const { Server } = require("socket.io");
const dbConn = require('./db.js');

function insertarMedida(data, medidaIdeal, socket) {
  dbConn.query(
    `INSERT INTO tabla_detectada (fecha, ancho_pixel_real, altura_pixel_real, camara_id, id_medida_ideal) VALUES (?, ?, ?, ?, ?)`,
    [data.fecha, data.ancho_mm, data.altura_mm, data.camara_id, medidaIdeal.id],
    function(err, result) {
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
    [data.ancho_mm, data.altura_mm],
    function(err, rows) {
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
    console.log(`Raspberry Pi conectada: IP ${clientIp} a las ${connectionTime}`);

    socket.on("disconnect", () => {
      console.log("Desconectado de la aplicación Flask en la Raspberry Pi");
    });

    socket.on("medidas", (dataArray) => {
      console.log("Datos de medidas recibidos desde la aplicación Flask:", dataArray);
      dataArray.forEach((data) => {
        consultarMedidaIdeal(data, socket);
      });
    });

    socket.on("estadisticas", (data) => {
      console.log("Estadísticas de rendimiento recibidas desde la aplicación Flask:", data);
    
      // Insertar los datos en la tabla de estadísticas
      dbConn.query(
        `INSERT INTO nombre_tabla_estadisticas (fecha, uso_cpu, uso_memoria, carga_cpu, temperatura, id_raspberry) VALUES (?, ?, ?, ?, ?, ?)`,
        [new Date(), data.cpu_percent, data.memory_percent, data.load_1m, data.cpu_temperature, socket.handshake.address],
        function(err, result) {
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
