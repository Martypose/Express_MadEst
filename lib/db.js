// lib/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS     || '',
  database: process.env.DB_DATABASE || process.env.DB_NAME     || 'madest',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z' // guardamos en UTC (ajusta al presentar)
});

// smoke test (no bloquea si falla)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Pool conectado a base de datos!');
    conn.release();
  } catch (e) {
    console.error('Error conectando pool:', e.message);
  }
})();

module.exports = {
  /**
   * Ejecuta una query con parámetros y devuelve rows (o OkPacket).
   * @param {string} sql
   * @param {Array}  params
   */
  query: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  pool
};
