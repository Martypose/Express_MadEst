const { Server } = require("socket.io");

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
    });

    // Suscríbete al evento de medidas emitido por la aplicación Flask
    socket.on("medidas", (data) => {
      console.log("Datos de medidas recibidos desde la aplicación Flask:", data);
    });

    // Suscríbete al evento de mensajes emitido por la aplicación Flask
    socket.on("message", (data) => {
      console.log("Mensaje recibido desde la aplicación Flask:", data);
    });
  });

  return io;
};