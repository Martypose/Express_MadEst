const jwt = require("jsonwebtoken");

// Middleware para validar el token (rutas protegidas)
const verifyToken = (req, res, next) => {
  const token = req.header("accessToken");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado" });
  }

  // Log no sensible en dev (evitamos imprimir el JWT entero)
  if (process.env.NODE_ENV !== "production") {
    const s = String(token);
    const fp = s.length > 20 ? `${s.slice(0, 12)}…${s.slice(-6)}` : s;
    console.log(`[auth] accessToken fp=${fp}`);
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    return next(); // ← IMPORTANTE: token válido ⇒ continuar
  } catch (error) {
    // Distinguimos caducado vs inválido
    if (error && error.name === "TokenExpiredError") {
      // Señal específica para que el front refresque (ver interceptor React)
      return res.status(402).json({ error: "token expirado" });
    }
    return res.status(401).json({ error: "token no válido" });
  }
};

module.exports = verifyToken;
