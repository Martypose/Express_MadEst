const mysql = require('mysql');
require('dotenv').config();
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE



const connection = mysql.createConnection({
	host:DB_HOST,
	user:DB_USER,
	password:DB_PASSWORD,
	database:DB_DATABASE
});
connection.connect(function(error){
	if(!!error) {
		console.log(error);
	} else {
		console.log('Conectado a base de datos!');
	}
});

module.exports = connection;
