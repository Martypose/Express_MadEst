const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Ruta para renovar el token
router.get("/", async function (req, res) {
  console.log("Petición recibida para renovar el token");

  const refreshToken = req.header("refreshToken");
  const username = req.header("username");

  if (!refreshToken) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const verified = jwt.verify(refreshToken, process.env.TOKEN_REFRESH_SECRET);
    req.user = verified;

    // Generar nuevos tokens
    const newAccessToken = jwt.sign(
      { name: username },
      process.env.TOKEN_SECRET,
      { expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRATION, 10) } // Asegúrate de que el valor sea un número
    );

    const newRefreshToken = jwt.sign(
      { name: username },
      process.env.TOKEN_REFRESH_SECRET,
      { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION, 10) } // Asegúrate de que el valor sea un número
    );

    console.log("Tokens renovados correctamente");

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      username: username,
    });
  } catch (error) {
    console.error("Error al verificar el refreshToken:", error);
    res.status(400).json({ error: "refreshToken no es válido" });
  }
});

module.exports = router;
