const mysql = require('mysql');
require('dotenv').config();
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 10 
});

pool.getConnection((err, connection) => {
  if (err) console.log('Error conectando pool:', err);
  else {
    console.log('Pool conectado a base de datos!');
    connection.release();
  }
});

module.exports = pool;