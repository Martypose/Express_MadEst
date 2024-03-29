const jwt = require("jsonwebtoken");
require("dotenv").config();

// middleware to validate token (rutas protegidas)
const verifyToken = (req, res, next) => {
  const token = req.header("accessToken");
  console.log(token);
  if (!token) return res.status(401).json({ error: "Acceso denegado" });
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next(); // continuamos
  } catch (error) {
    console.log("error validando access token");
    console.log(error);
    res.status(401).json({ error: "token no válido" });
    console.log("token no valido");
  }
};

module.exports = verifyToken;
