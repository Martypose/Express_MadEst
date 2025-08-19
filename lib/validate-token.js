// Express_MadEst/lib/validate-token.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1) Soportar ambos formatos
  const bearer = req.header("Authorization") || req.header("authorization") || "";
  let token = req.header("accessToken");
  if (!token && bearer.startsWith("Bearer ")) token = bearer.slice(7).trim();

  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    return next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(402).json({ error: "token expirado" });
    }
    return res.status(401).json({ error: "token no válido" });
  }
};

module.exports = verifyToken;
