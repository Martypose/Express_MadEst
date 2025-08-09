// lib/db.js
const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_DATABASE = 'madera',
  DB_CONN_LIMIT = '10',
  DB_TIMEZONE = 'Z', // UTC
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  waitForConnections: true,
  connectionLimit: parseInt(DB_CONN_LIMIT, 10),
  queueLimit: 0,
  dateStrings: false,       // mapea DATETIME <-> Date
  supportBigNumbers: true,
  timezone: DB_TIMEZONE,
});

/**
 * db.query(sql, params?, cb?)
 *  - Si pasas callback, lo invoca con (err, rows, fields).
 *  - Si no, devuelve una Promesa con rows.
 */
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

module.exports = { pool, query };
