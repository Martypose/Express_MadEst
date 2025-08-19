// Express_MadEst/routes/login.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken } = require('../lib/jwt');

// POST /login  { name, password }
router.post('/', async function(req, res) {
  const username = req.body?.name;
  const password = req.body?.password;
  if (!username || !password) return res.status(400).json({ error: 'name y password son obligatorios' });

  try {
    const rows = await db.query('SELECT id, username, password, usertype FROM usuarios WHERE username = ?', [username]);
    const user = rows[0];
    const ok = user && await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Formato ANIDADO (compat con tu front actual)
    return res.json({
      accessToken:  { accessToken },
      refreshToken: { refreshToken },
      username: user.username,
      role: user.usertype
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
