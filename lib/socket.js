const { Server } = require("socket.io");
const dbConn = require('./db.config');

module.exports = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    // Registra la IP del cliente y la hora de conexión
    const clientIp = socket.handshake.address;
    const connectionTime = new Date().toLocaleString();
    console.log(
      `Raspberry Pi conectada: IP ${clientIp} a las ${connectionTime}`
    );

    // Suscríbete al evento de desconexión
    socket.on("disconnect", () => {
      console.log("Desconectado de la aplicación Flask en la Raspberry Pi");
    });

    // Suscríbete al evento de estadísticas emitido por la aplicación Flask
    socket.on("estadisticas", (data) => {
      console.log("Estadísticas recibidas desde la aplicación Flask:", data);
    
      // Desestructurar los datos recibidos
      const { fecha, uso_cpu, uso_memoria } = data;
    
      // Insertar los datos en la tabla 'estadisticas'
      dbConn.query(
        "INSERT INTO estadisticas (fecha, uso_cpu, uso_memoria, id_raspberry) VALUES (?, ?, ?, ?)",
        [fecha, uso_cpu, uso_memoria, socket.handshake.address],
        (err, result) => {
          if (err) {
            console.error("Error al insertar las estadísticas en la base de datos:", err);
          } else {
            console.log("Estadísticas insertadas correctamente en la base de datos.");
          }
        }
      );
    });

// Suscríbete al evento de medidas emitido por la aplicación Flask
socket.on("medidas", (data) => {
  console.log("Datos de medidas recibidos desde la aplicación Flask:", data);

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