// Express_MadEst/lib/validate-token.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { verifyAccess } = require('./jwt');

module.exports = (req, res, next) => {
  const bearer = req.header('Authorization') || req.header('authorization') || '';
  let token = req.header('accessToken'); // compat legado
  if (!token && bearer.startsWith('Bearer ')) token = bearer.slice(7).trim();

  if (!token) {
    res.set('WWW-Authenticate', 'Bearer realm="api", error="invalid_token", error_description="falta token"');
    return res.status(401).json({ error: 'Acceso denegado' });
  }
  try {
    const payload = verifyAccess(token);
    if (payload.typ && payload.typ !== 'access') {
      res.set('WWW-Authenticate', 'Bearer realm="api", error="invalid_token", error_description="tipo de token incorrecto"');
      return res.status(401).json({ error: 'token no válido' });
    }
    req.user = {
      sub: payload.sub || null,
      username: payload.name || null,
      role: payload.role || null,
      iat: payload.iat, exp: payload.exp, jti: payload.jti || null
    };
    next();
  } catch (e) {
    const desc = e?.name === 'TokenExpiredError' ? 'token expirado' : 'token no válido';
    res.set('WWW-Authenticate', `Bearer realm="api", error="invalid_token", error_description="${desc}"`);
    return res.status(401).json({ error: desc });
  }
};
