// Express_MadEst/lib/jwt.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');
const { randomUUID, randomBytes } = require('crypto');
const uuid = () => (typeof randomUUID === 'function' ? randomUUID() : randomBytes(16).toString('hex'));

function normalizeExp(v, fallback) {
  if (v == null || v === '') return fallback;
  if (typeof v === 'number') return v >= 1000 ? Math.floor(v / 1000) : v; // → seg
  const s = String(v).trim();
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10);
    return n >= 1000 ? Math.floor(n / 1000) : n; // → seg
  }
  return s; // "15m", "12h", "7d"...
}

const baseOpts = {};
if (process.env.TOKEN_ISSUER)   baseOpts.issuer   = process.env.TOKEN_ISSUER;
if (process.env.TOKEN_AUDIENCE) baseOpts.audience = process.env.TOKEN_AUDIENCE;

const ACCESS_EXP  = normalizeExp(process.env.JWT_ACCESS_EXPIRATION,  '15m');
const REFRESH_EXP = normalizeExp(process.env.JWT_REFRESH_EXPIRATION, '7d');

function signAccessToken(user) {
  const payload = { sub: String(user.id ?? user.username ?? ''), name: user.username, role: user.usertype, typ: 'access' };
  return jwt.sign(payload, process.env.TOKEN_SECRET, { ...baseOpts, expiresIn: ACCESS_EXP, jwtid: uuid() });
}
function signRefreshToken(user) {
  const payload = { sub: String(user.id ?? user.username ?? ''), name: user.username, role: user.usertype, typ: 'refresh' };
  return jwt.sign(payload, process.env.TOKEN_REFRESH_SECRET, { ...baseOpts, expiresIn: REFRESH_EXP, jwtid: uuid() });
}

function verifyAccess(token)  { return jwt.verify(token,  process.env.TOKEN_SECRET,         baseOpts); }
function verifyRefresh(token) { return jwt.verify(token,  process.env.TOKEN_REFRESH_SECRET, baseOpts); }

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh, ACCESS_EXP, REFRESH_EXP };
