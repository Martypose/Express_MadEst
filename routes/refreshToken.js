// Express_MadEst/routes/refreshToken.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Ruta para renovar el token
router.get("/", async function (req, res) {
  console.log("Petición recibida para renovar el token");

  const refreshToken = req.header("refreshToken");
  const username = req.header("username");

  if (!refreshToken) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  try {
    // Verificamos el refreshToken con la misma clave usada en el login
    const payload = jwt.verify(refreshToken, process.env.TOKEN_REFRESH_SECRET);

    // (opcional) endurecer: si envían username, que coincida con el del token
    if (username && payload?.name && username !== payload.name) {
      return res.status(400).json({ error: "Usuario no coincide con el refreshToken" });
    }

    // Generar nuevos tokens (usa exactamente los mismos expiresIn que el login)
    const newAccessToken = jwt.sign(
      { name: payload.name || username },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    const newRefreshToken = jwt.sign(
      { name: payload.name || username },
      process.env.TOKEN_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    console.log("Tokens renovados correctamente");

    // ⬇⬇⬇ DEVOLVER EN FORMATO **ANIDADO** (igual que /login) ⬇⬇⬇
    res.json({
      accessToken: { accessToken: newAccessToken },
      refreshToken: { refreshToken: newRefreshToken },
      username: payload.name || username || null,
    });
  } catch (error) {
    console.error("Error al verificar el refreshToken:", error);
    res.status(400).json({ error: "refreshToken no es válido" });
  }
});

module.exports = router;
