// lib/db.js – compatible con código antiguo (db.query con callback) y moderno (await)
require('dotenv').config();
const mysqlPromise = require('mysql2/promise');
const mysql2 = require('mysql2'); // solo para utilidades como escape

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_DATABASE = 'madera',
  DB_CONN_LIMIT = '10',
  DB_TIMEZONE = 'Z', // UTC
} = process.env;

const pool = mysqlPromise.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  waitForConnections: true,
  connectionLimit: parseInt(DB_CONN_LIMIT, 10),
  queueLimit: 0,
  dateStrings: false,
  supportBigNumbers: true,
  timezone: DB_TIMEZONE,
});

// query “unificada”: callback opcional o Promesa
async function query(sql, params, cb) {
  if (typeof params === 'function') { cb = params; params = []; }
  if (!Array.isArray(params)) params = params != null ? [params] : [];
  try {
    const [rows, fields] = await pool.execute(sql, params);
    if (typeof cb === 'function') return cb(null, rows, fields);
    return rows;
  } catch (err) {
    if (typeof cb === 'function') return cb(err);
    throw err;
  }
}

// Adaptador “connection-like” para no romper require('../lib/db')
const connection = {
  query,                       // db.query(sql, params, cb) → OK (legacy)
  execute: (sql, params=[]) => pool.execute(sql, params), // moderno
  escape: mysql2.escape,       // por si lo usas en algún sitio
  pool,
};

process.on('SIGINT', async () => { try { await pool.end(); } finally { process.exit(0); }});
process.on('SIGTERM', async () => { try { await pool.end(); } finally { process.exit(0); }});

module.exports = connection;
