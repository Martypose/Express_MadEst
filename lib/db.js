const mysql = require('mysql');
require("dotenv").config()

const DB_HOST = process.env.host
const DB_USER = process.env.user
const DB_PASSWORD = process.env.password
const DB_DATABASE = process.env.database

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
		console.log('Connectedo a base de datos!');
	}
});

module.exports = connection;
