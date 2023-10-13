const { Server } = require("socket.io");
const dbConn = require('./db.js');

module.exports = (server) => {
  const io = new Server(server);

io.on("connection", (socket) => {
    // Registra la IP del cliente y la hora de conexión
    const clientIp = socket.handshake.address;
    const connectionTime = new Date().toLocaleString();
    console.log(
      `Raspberry Pi conectada: IP ${clientIp} a las ${connectionTime}`)
    });

    // Suscríbete al evento de desconexión
socket.on("disconnect", () => {
      console.log("Desconectado de la aplicación Flask en la Raspberry Pi");
});

// Suscríbete al evento de estadísticas emitido por la aplicación Flask
// Suscríbete al evento de medidas emitido por la aplicación Flask
socket.on("medidas", (data) => {
  console.log("Datos de medidas recibidos desde la aplicación Flask:", data);

  // Consultar la medida ideal más cercana
  dbConn.query(
    `SELECT * FROM medidas_tablas 
     ORDER BY ABS(ancho_ideal - ?) + ABS(altura_ideal - ?) LIMIT 1`,
    [data.ancho, data.altura],
    function(err, rows) {
      if (err) {
        console.log("Error al consultar las medidas ideales:", err);
        return;
      }
      const medidaIdeal = rows[0];

      // Insertar los datos en tabla_detectada
      dbConn.query(
        `INSERT INTO tabla_detectada (fecha, ancho_pixel_real, altura_pixel_real, camara_id, id_medida_ideal) VALUES (?, ?, ?, ?, ?)`,
        [new Date(), data.ancho, data.altura, socket.handshake.address, medidaIdeal.id],
        function(err, result) {
          if (err) {
            console.log("Error al insertar:", err);
          } else {
            console.log("Inserción exitosa");
          }
        }
      );
    }
  );
});


// Suscríbete al evento de medidas emitido por la aplicación Flask
socket.on("medidas", (data) => {
  console.log("Datos de medidas recibidos desde la aplicación Flask:", data);

  //Consultar la medida ideal más cercana basada en el ancho y la altura

  medidaIdeal = 0.0
  dbConn.query(
    `SELECT * FROM medidas_tablas 
    ORDER BY ABS(ancho_ideal - ?) + ABS(altura_ideal - ?) 
    LIMIT 1`,
    [data.ancho, data.altura],
    function(err, rows) {
      if (err) {
        console.log("Error al consultar las medidas ideales:", err);
        return;
      }
      const medidaIdeal = rows[0];
  

dbConn.query(
  `INSERT INTO tabla_detectada (fecha, ancho_pixel_real, altura_pixel_real, camara_id, id_medida_ideal) VALUES (?, ?, ?, ?, ?)`,
  [new Date(), data.ancho, data.altura, socket.handshake.address, medidaIdeal.id],
  
  function(err, result) {
    if (err) {
      console.log("Error al insertar:", err);
    } else {
      console.log("Inserción exitosa");
    }
  }
);


  // Inserta los datos en la tabla
  // Guardar la fecha de detección, ancho, grosor, largo(null) y la IP de la Raspberry Pi
  dbConn.query(
    `INSERT INTO tabla_detectada (fecha, ancho, grosor, largo, camara_id) VALUES (?, ?, ?, ?, ?)`,
    [data.date, data.ancho, data.grosor, null, socket.handshake.address],
    function (err, result) {
      if (err) {
        console.log("Error en el insert:" + err);
      } else {
        console.log("Se ha insertado correctamente");
      }
    }
  );
});

    // Suscríbete al evento de mensajes emitido por la aplicación Flask
    socket.on("message", (data) => {
      console.log("Mensaje recibido desde la aplicación Flask:", data);
    });
  });

  return io;
};