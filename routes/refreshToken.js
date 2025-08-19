// Express_MadEst/routes/refreshToken.js
const express = require('express');
const router = express.Router();
const { verifyRefresh, signAccessToken, signRefreshToken } = require('../lib/jwt');

// Acepta GET (legacy) y POST (recomendado). POST body: { refreshToken }
router.all('/', express.json(), (req, res) => {
  const bearer = req.header('Authorization') || req.header('authorization') || '';
  let token = req.header('refreshToken') || req.body?.refreshToken || null; // compat legacy
  if (!token && bearer.startsWith('Bearer ')) token = bearer.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const decoded = verifyRefresh(token);
    if (decoded.typ && decoded.typ !== 'refresh') {
      return res.status(401).json({ error: 'token no válido' });
    }
    const baseUser = { id: decoded.sub || '', username: decoded.name, usertype: decoded.role };
    const accessToken  = signAccessToken(baseUser);
    const refreshToken = signRefreshToken(baseUser);

    return res.json({
      accessToken:  { accessToken },
      refreshToken: { refreshToken },
      username: decoded.name || null,
      role: decoded.role || null
    });
  } catch (error) {
    const msg = error?.name === 'TokenExpiredError' ? 'refreshToken expirado' : 'refreshToken no es válido';
    return res.status(401).json({ error: msg });
  }
});

module.exports = router;
